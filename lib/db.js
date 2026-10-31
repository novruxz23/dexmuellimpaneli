// Saxlama qatı. Vercel-də fayl saxlanmır, ona görə məlumat Firebase Realtime Database və ya Upstash Redis-dədir (REST ilə, paket lazım deyil).
//   Vercel → Storage → Upstash Redis (pulsuz) → layihəyə qoş → env dəyişənləri avtomatik əlavə olunur:
//   KV_REST_API_URL + KV_REST_API_TOKEN   (və ya UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
// Env yoxdursa (kompüterdə `node server.js`) məlumat yaddaşda saxlanır və data/db.json-a yazılır.

const fs = require("fs");
const path = require("path");

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const REMOTE = !!(URL_ && TOKEN);

// ── Yaddaşda kiçik Redis (yerli rejim və testlər üçün) ────────────────────────
class Mem {
  constructor(file) {
    this.m = new Map(); this.exp = new Map(); this.file = file || ""; this.timer = null;
    if (this.file) {
      try {
        const o = JSON.parse(fs.readFileSync(this.file, "utf8"));
        for (const [k, v] of Object.entries(o.d || {})) this.m.set(k, v);
        for (const [k, v] of Object.entries(o.e || {})) this.exp.set(k, v);
      } catch { /* boş başla */ }
    }
  }
  _alive(k) { const e = this.exp.get(k); if (e && e < Date.now()) { this.m.delete(k); this.exp.delete(k); return false; } return this.m.has(k); }
  _save() {
    if (!this.file) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      try { fs.mkdirSync(path.dirname(this.file), { recursive: true }); const t = this.file + ".tmp"; fs.writeFileSync(t, JSON.stringify({ d: Object.fromEntries(this.m), e: Object.fromEntries(this.exp) })); fs.renameSync(t, this.file); } catch (e) { console.error("db.json yazılmadı:", e.message); }
    }, 1500);
    if (this.timer.unref) this.timer.unref();
  }
  run(c) {
    const [op, k, ...a] = c; const O = String(op).toUpperCase();
    const get = () => (this._alive(k) ? this.m.get(k) : undefined);
    const list = () => { const v = get(); return Array.isArray(v) ? v : []; };
    const idx = (n, len) => (n < 0 ? Math.max(0, len + n) : n);
    switch (O) {
      case "GET": { const v = get(); return v === undefined ? null : v; }
      case "SET": {
        let ex = 0, nx = false, wantOld = false;
        for (let i = 1; i < a.length; i++) { const f = String(a[i]).toUpperCase(); if (f === "EX") ex = Number(a[++i]); else if (f === "NX") nx = true; else if (f === "GET") wantOld = true; }
        const old = get();
        if (nx && old !== undefined) return null;
        this.m.set(k, String(a[0])); if (ex) this.exp.set(k, Date.now() + ex * 1000); else this.exp.delete(k);
        this._save(); return wantOld ? (old === undefined ? null : old) : "OK";
      }
      case "DEL": { let n = 0; for (const x of [k, ...a]) { if (this._alive(x)) { this.m.delete(x); this.exp.delete(x); n++; } } this._save(); return n; }
      case "EXPIRE": if (!this._alive(k)) return 0; this.exp.set(k, Date.now() + Number(a[0]) * 1000); this._save(); return 1;
      case "MGET": return [k, ...a].map((x) => (this._alive(x) ? this.m.get(x) : null));
      case "SADD": { let s = get(); if (!s) { s = {}; this.m.set(k, s); } let n = 0; for (const x of a) if (!(x in s)) { s[x] = 1; n++; } this._save(); return n; }
      case "SREM": { const s = get(); let n = 0; if (s) for (const x of a) if (x in s) { delete s[x]; n++; } this._save(); return n; }
      case "SMEMBERS": return Object.keys(get() || {});
      case "HSET": { let h = get(); if (!h) { h = {}; this.m.set(k, h); } let n = 0; for (let i = 0; i < a.length; i += 2) { if (!(a[i] in h)) n++; h[a[i]] = String(a[i + 1]); } this._save(); return n; }
      case "HGET": { const h = get(); return h && a[0] in h ? h[a[0]] : null; }
      case "HDEL": { const h = get(); let n = 0; if (h) for (const x of [a[0], ...a.slice(1)]) if (x in h) { delete h[x]; n++; } this._save(); return n; }
      case "HGETALL": { const h = get() || {}; return Object.entries(h).flat(); }
      case "LPUSH": case "RPUSH": { let l = get(); if (!Array.isArray(l)) { l = []; this.m.set(k, l); } for (const x of a) O === "LPUSH" ? l.unshift(String(x)) : l.push(String(x)); this._save(); return l.length; }
      case "LRANGE": { const l = list(); const s = idx(Number(a[0]), l.length); let e = Number(a[1]); e = e < 0 ? l.length + e : e; return l.slice(s, e + 1); }
      case "LTRIM": { const l = list(); const s = idx(Number(a[0]), l.length); let e = Number(a[1]); e = e < 0 ? l.length + e : e; this.m.set(k, l.slice(s, e + 1)); this._save(); return "OK"; }
      case "LREM": { const l = list(); const v = String(a[1]); const out = l.filter((x) => x !== v); this.m.set(k, out); this._save(); return l.length - out.length; }
      default: throw new Error("naməlum əmr: " + O);
    }
  }
  async pipeline(cmds) { return cmds.map((c) => this.run(c)); }
}

// ── Upstash REST ──────────────────────────────────────────────────────────────
async function remotePipeline(cmds) {
  const r = await fetch(URL_.replace(/\/+$/, "") + "/pipeline", {
    method: "POST", headers: { Authorization: "Bearer " + TOKEN, "content-type": "application/json" }, body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error("Redis " + r.status + ": " + (await r.text()).slice(0, 200));
  const out = await r.json();
  return out.map((x) => { if (x && x.error) throw new Error("Redis: " + x.error); return x ? x.result : null; });
}


// ── Firebase Realtime Database (REST) ─────────────────────────────────────────
// Env: FIREBASE_DB_URL (https://XXXX-default-rtdb.firebaseio.com) və FIREBASE_SERVICE_ACCOUNT (service account JSON) ya da FIREBASE_DB_SECRET.
// Redis əmrlərinin kiçik alt çoxluğu Firebase ağacına çevrilir:
//   string → /dex/<açar> = {v, x}    siyahı → /dex/<açar>/i/<sıralı-id>    çoxluq → /dex/<açar>/m/<üzv>    hash → /dex/<açar>/h/<sahə>
const FB_URL = (process.env.FIREBASE_DB_URL || process.env.FIREBASE_DATABASE_URL || "").trim().replace(/\/+$/, "");
const FB_SECRET = (process.env.FIREBASE_DB_SECRET || process.env.FIREBASE_SECRET || "").trim();
const FIREBASE = !!FB_URL;

const enc = (s) => String(s).replace(/[.$#\[\]\/%\u0000-\u001f\u007f]/g, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"));
const dec = (s) => s.replace(/%([0-9a-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
const pad = (n, w) => String(Math.max(0, n)).padStart(w, "0");
let seq = 0;
const rnd = () => Math.random().toString(36).slice(2, 6).padEnd(4, "0");

// Giriş: ya Database secret (FIREBASE_DB_SECRET), ya da service account açarı (FIREBASE_SERVICE_ACCOUNT = JSON faylının məzmunu).
let SA = null;
try {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || "").trim();
  if (raw) SA = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
} catch (e) { console.error("FIREBASE_SERVICE_ACCOUNT oxunmadı:", e.message); }
const TOKEN_URL = process.env.FIREBASE_TOKEN_URL || "https://oauth2.googleapis.com/token";
let saToken = { v: "", exp: 0, p: null };

async function accessToken() {
  if (saToken.v && saToken.exp - 60_000 > Date.now()) return saToken.v;
  if (saToken.p) return saToken.p;
  saToken.p = (async () => {
    const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
    const iat = Math.floor(Date.now() / 1000);
    const head = b64({ alg: "RS256", typ: "JWT" });
    const claim = b64({ iss: SA.client_email, scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email", aud: TOKEN_URL, iat, exp: iat + 3600 });
    const sig = require("crypto").createSign("RSA-SHA256").update(head + "." + claim).sign(SA.private_key).toString("base64url");
    const r = await fetch(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + head + "." + claim + "." + sig });
    if (!r.ok) throw new Error("Google token " + r.status + ": " + (await r.text()).slice(0, 200));
    const j = await r.json();
    saToken = { v: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000, p: null };
    return saToken.v;
  })();
  try { return await saToken.p; } finally { saToken.p = null; }
}

async function fb(method, node, { body, query = "", headers = {}, raw = false } = {}) {
  let auth = "";
  if (SA && SA.client_email && SA.private_key) auth = "access_token=" + encodeURIComponent(await accessToken());
  else if (FB_SECRET) auth = "auth=" + encodeURIComponent(FB_SECRET);
  const q = [auth, query].filter(Boolean).join("&");
  const r = await fetch(`${FB_URL}/${raw ? "" : "dex/"}${node}.json${q ? "?" + q : ""}`, {
    method, headers: { "content-type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (r.status === 412) return { precondition: true };
  if (!r.ok) throw new Error(`Firebase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { data: await r.json() };
}
const fget = async (node, query) => (await fb("GET", node, { query })).data;

async function fbRun(c) {
  const [op, k, ...a] = c; const O = String(op).toUpperCase(); const K_ = enc(k);
  const strGet = async () => {
    const r = await fget(K_);
    if (!r || typeof r !== "object") return null;
    if (r.x && r.x < Date.now()) { fb("DELETE", K_).catch(() => {}); return null; }
    return r.v === undefined ? null : r.v;
  };
  switch (O) {
    case "GET": return strGet();
    case "SET": {
      let ex = 0, nx = false, wantOld = false;
      for (let i = 1; i < a.length; i++) { const f = String(a[i]).toUpperCase(); if (f === "EX") ex = Number(a[++i]); else if (f === "NX") nx = true; else if (f === "GET") wantOld = true; }
      const val = { v: String(a[0]), x: ex ? Date.now() + ex * 1000 : 0 };
      if (nx) {
        const old = await strGet();
        if (old !== null) return null;
        const r = await fb("PUT", K_, { body: val, headers: { "if-match": "null_etag" } });
        return r.precondition ? null : "OK";
      }
      const old = wantOld ? await strGet() : null;
      await fb("PUT", K_, { body: val });
      return wantOld ? old : "OK";
    }
    case "DEL": await Promise.all([k, ...a].map((x) => fb("DELETE", enc(x)))); return 1;
    case "EXPIRE": return 1; // siyahılar üçün lazım deyil (əmrlər özü köhnəlir)
    case "MGET": return Promise.all([k, ...a].map((x) => fbRun(["GET", x])));
    case "SADD": { let n = 0; for (const m of a) { const r = await fb("PUT", `${K_}/m/${enc(m)}`, { body: 1, headers: { "if-match": "null_etag" } }); if (!r.precondition) n++; } return n; }
    case "SREM": await Promise.all(a.map((m) => fb("DELETE", `${K_}/m/${enc(m)}`))); return a.length;
    case "SMEMBERS": { const r = await fget(`${K_}/m`, "shallow=true"); return r ? Object.keys(r).map(dec) : []; }
    case "HSET": { const body = {}; for (let i = 0; i < a.length; i += 2) body[enc(a[i])] = String(a[i + 1]); await fb("PATCH", `${K_}/h`, { body }); return a.length / 2; }
    case "HGET": { const r = await fget(`${K_}/h/${enc(a[0])}`); return r === null || r === undefined ? null : String(r); }
    case "HDEL": await Promise.all(a.concat([]).map((f) => fb("DELETE", `${K_}/h/${enc(f)}`))); return a.length;
    case "HGETALL": { const r = await fget(`${K_}/h`); return r ? Object.entries(r).flatMap(([f, v]) => [dec(f), String(v)]) : []; }
    case "LPUSH": case "RPUSH": {
      const body = {}, ts = Date.now();
      for (const v of a) { const n = ++seq; body[O === "LPUSH" ? `${pad(9e15 - ts, 16)}-${pad(999999 - (n % 1e6), 6)}-${rnd()}` : `${pad(ts, 16)}-${pad(n % 1e6, 6)}-${rnd()}`] = String(v); }
      await fb("PATCH", `${K_}/i`, { body }); return a.length;
    }
    case "LRANGE": {
      const s = Number(a[0]), e = Number(a[1]);
      const r = await fget(`${K_}/i`, e >= 0 ? `orderBy=%22%24key%22&limitToFirst=${e + 1}` : "");
      const keys = r ? Object.keys(r).sort() : [];
      return keys.slice(s < 0 ? 0 : s, e < 0 ? undefined : e + 1).map((x) => String(r[x]));
    }
    case "LTRIM": {
      if (Math.random() > 0.1) return "OK"; // arabir budamaq kifayətdir
      const e = Number(a[1]); if (e < 0) return "OK";
      const r = await fget(`${K_}/i`, "shallow=true");
      const extra = r ? Object.keys(r).sort().slice(e + 1) : [];
      if (extra.length) { const body = {}; for (const x of extra) body[x] = null; await fb("PATCH", `${K_}/i`, { body }); }
      return "OK";
    }
    case "LREM": {
      const r = await fget(`${K_}/i`); if (!r) return 0;
      const body = {}; let n = 0;
      for (const [x, v] of Object.entries(r)) if (String(v) === String(a[1])) { body[x] = null; n++; }
      if (n) await fb("PATCH", `${K_}/i`, { body });
      return n;
    }
    default: throw new Error("naməlum əmr: " + O);
  }
}

/** Fərqli açarlardakı əmrlər paralel, eyni açardakılar ardıcıl icra olunur. */
async function fbPipeline(cmds) {
  const groups = new Map();
  cmds.forEach((c, i) => { const g = groups.get(c[1]) || []; g.push(i); groups.set(c[1], g); });
  const out = new Array(cmds.length);
  await Promise.all([...groups.values()].map(async (idxs) => { for (const i of idxs) out[i] = await fbRun(cmds[i]); }));
  return out;
}

const mem = REMOTE || FIREBASE ? null : new Mem(process.env.VERCEL ? "" : path.join(process.env.DEX_DATA || path.join(__dirname, "..", "data"), "db.json"));
const BACKEND = FIREBASE ? "firebase" : REMOTE ? "redis" : "yaddaş (daimi deyil!)";

/** Əmrlər siyahısını icra edir, nəticələr eyni sıradadır. */
const pipe = (cmds) => (cmds.length ? (FIREBASE ? fbPipeline(cmds) : REMOTE ? remotePipeline(cmds) : mem.pipeline(cmds)) : Promise.resolve([]));
const one = async (...c) => (await pipe([c]))[0];

/** Firebase-də /dex-dən kənar yolu oxuyur (proqramın yazdığı /registry). Firebase yoxdursa null. */
const rawGet = async (p) => (FIREBASE ? (await fb("GET", p.split("/").map(enc).join("/"), { raw: true })).data : null);

module.exports = { pipe, one, REMOTE, FIREBASE, BACKEND, Mem, rawGet };

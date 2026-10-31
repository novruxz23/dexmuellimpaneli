// DeX — müəllim paneli və sinif serveri (Vercel funksiyası və ya `node server.js`).
//
// Şagird kompüterlərindəki DeX proqramı bura "poll" göndərir (POST /api/agent/poll): özü haqqında
// məlumat, qeydlər, suallar, ekran şəkli; cavabda müəllimin ayarlarını və əmrlərini alır.
// Müəllim paneli (/panel) eyni serverdən oxuyur. Bütün məlumat Redis-dədir (lib/db.js).
//
// Vercel serverlessdir (yaddaş saxlanmır) və hər sorğu ayrı çağırılır, ona görə: hər kompüterin
// məlumatı ayrı açarlarda saxlanır ki, eyni anda poll göndərən kompüterlər bir-birini əzməsin.

const crypto = require("crypto");
const { pipe, one, BACKEND, rawGet } = require("./db");

const ONLINE_MS = 25_000;      // kompüter son 25 san.-də poll göndəribsə "qoşulub"
const CMD_TTL_MS = 60_000;     // götürülməyən əmr 1 dəqiqədən sonra köhnəlir
const POLL_FAST_MS = 900;      // müəllim paneli açıqkən (canlı ekran ~hər saniyə yenilənsin deyə)
const POLL_IDLE_MS = 10_000;   // panel bağlıykən (Vercel sorğu limitinə qənaət)
const BAKU_OFFSET = 4 * 3600_000; // Asiya/Bakı (UTC+4, yay saatı yoxdur)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PROVIDERS = ["gemini", "groq", "mistral", "nvidia", "openrouter"];

const K = {
  meta: (c) => `dex:c:${c}`, pcs: (c) => `dex:pcs:${c}`, pc: (c, id) => `dex:pc:${c}:${id}`, joined: (c) => `dex:join:${c}`,
  locks: (c) => `dex:lock:${c}`, cmds: (c, id) => `dex:cmd:${c}:${id}`, ans: (c, id) => `dex:ans:${c}:${id}`, logs: (c) => `dex:log:${c}`,
  qs: (c) => `dex:q:${c}`, qids: (c) => `dex:qid:${c}`, qans: (c) => `dex:qans:${c}`, qimg: (c, q) => `dex:qimg:${c}:${q}`,
  shot: (c, id) => `dex:shot:${c}:${id}`, shotat: (c) => `dex:shotat:${c}`, panel: (c) => `dex:panel:${c}`, pshot: (c) => `dex:pshot:${c}`,
};

const uid = (n = 8) => crypto.randomBytes(n).toString("hex").slice(0, n * 2 - 2);
const now = () => Date.now();
const J = (s) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

function defaultSchedule() {
  const t = [["08:00", "08:45"], ["08:55", "09:40"], ["09:50", "10:35"], ["10:55", "11:40"], ["11:50", "12:35"], ["12:45", "13:30"], ["13:40", "14:25"]];
  return t.map(([start, end], i) => ({ n: i + 1, start, end, on: true }));
}

function newClass(name, code, token) {
  return {
    code, name, token: token || crypto.randomBytes(18).toString("base64url"), createdAt: now(),
    schedule: defaultSchedule(),
    settings: {
      teacherName: "müəllim", allowExe: false, safeMode: true, webBlock: true, sites: [],
      apps: { Word: 1, Excel: 1, PowerPoint: 1, Chrome: 1, "VS Code": 1, Steam: 1, Discord: 1, "Hesablayıcı": 1 },
      extraApps: {}, tasks: [], keys: {}, models: [], releasedKey: "", lockAll: false,
    },
  };
}

const APP_PROCS = {
  Word: ["WINWORD.EXE"], Excel: ["EXCEL.EXE"], PowerPoint: ["POWERPNT.EXE"], Chrome: ["chrome.exe"],
  "VS Code": ["Code.exe"], Steam: ["steam.exe", "steamwebhelper.exe"], Discord: ["Discord.exe"],
  "Hesablayıcı": ["CalculatorApp.exe", "calc.exe", "Calculator.exe"],
};
function blockedProcesses(cls) {
  const out = [];
  for (const [name, allowed] of Object.entries(cls.settings.apps)) if (!allowed) out.push(...(APP_PROCS[name] || []));
  for (const [proc, allowed] of Object.entries(cls.settings.extraApps || {})) if (!allowed) out.push(proc);
  return out;
}

// ── Dərslər (Bakı vaxtı ilə, server harada işləyirsə işləsin) ─────────────────
const toMin = (hm) => { const [h, m] = String(hm).split(":").map((x) => parseInt(x, 10)); return (h || 0) * 60 + (m || 0); };
function lessonNow(cls, at = now()) {
  const d = new Date(at + BAKU_OFFSET);
  const mins = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60;
  const day = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  let next = null;
  for (const l of cls.schedule) {
    if (!l.on) continue;
    const s = toMin(l.start), e = toMin(l.end);
    if (mins >= s && mins < e) return { running: l, left: Math.max(1, Math.ceil(e - mins)), key: `${day}#${l.n}`, next };
    if (s > mins && (!next || s < toMin(next.start))) next = l;
  }
  return { running: null, left: 0, key: "", next };
}

// ── Köməkçilər ────────────────────────────────────────────────────────────────
const online = (p) => now() - (p.lastSeen || 0) < ONLINE_MS;
const logEntry = (e) => JSON.stringify({ at: e.at || now(), pc: e.pc || "", pcName: e.pcName || "", user: e.user || "", type: e.type || "sistem", text: String(e.text || "").slice(0, 300) });
const logCmds = (code, entries) => (entries.length ? [["LPUSH", K.logs(code), ...entries.map(logEntry)], ["LTRIM", K.logs(code), 0, 799]] : []);

function send(res, code, body, headers = {}) {
  const h = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type,x-teacher,x-class", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", ...headers };
  if (typeof body === "object" && !Buffer.isBuffer(body)) { h["content-type"] = "application/json; charset=utf-8"; body = JSON.stringify(body); }
  if (!h["cache-control"]) h["cache-control"] = "no-store";
  res.writeHead(code, h);
  res.end(body);
}

async function readBody(req, limit = 4_000_000) {
  // Vercel gövdəni özü oxuyub req.body-yə qoya bilər; adi Node serverdə axından oxuyuruq.
  if (req.body !== undefined && req.body !== null) {
    const b = req.body;
    if (Buffer.isBuffer(b)) return b.length ? JSON.parse(b.toString("utf8")) : {};
    if (typeof b === "string") return b ? JSON.parse(b) : {};
    return b;
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > limit) { reject(new Error("big")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(new Error("json")); } });
    req.on("error", reject);
  });
}

async function getClass(code) {
  code = String(code || "").toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(code)) return null;
  const have = J(await one("GET", K.meta(code)));
  if (have) return have;
  return importFromRegistry(code);
}

// Proqram sinfi əvvəlcə Firebase-in /registry/<kod> yoluna yazır (bir dəfəlik yazı). Sayt oradan oxuyub sinfi tanıyır.
async function importFromRegistry(code) {
  let r = null;
  try { r = await rawGet(`registry/${code}`); } catch (e) { console.error("[dex] registry:", e.message); return null; }
  if (!r || typeof r.name !== "string" || typeof r.token !== "string" || r.token.length < 16 || !/^[A-Z2-9]{5}$/.test(code)) return null;
  const cls = newClass(r.name.trim().slice(0, 40) || code, code, r.token.slice(0, 64));
  if (r.createdAt) cls.createdAt = Number(r.createdAt) || cls.createdAt;
  await one("SET", K.meta(code), JSON.stringify(cls), "NX");
  await pipe(logCmds(code, [{ type: "sinif", text: `“${cls.name}” sinfi proqramdan Firebase vasitəsilə alındı (kod: ${code})`, user: "Müəllim" }]));
  return J(await one("GET", K.meta(code)));
}
const saveClass = (cls) => one("SET", K.meta(cls.code), JSON.stringify(cls));

async function teacherAuth(req, u) {
  const code = String(req.headers["x-class"] || u.searchParams.get("c") || "").toUpperCase();
  const token = String(req.headers["x-teacher"] || u.searchParams.get("t") || "");
  if (!code || !token) return null;
  const cls = await getClass(code);
  if (!cls) return null;
  const a = Buffer.from(cls.token), b = Buffer.from(token);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? cls : null;
}

function maskedKeys(keys) {
  const out = {};
  for (const prov of PROVIDERS) out[prov] = keys[prov] ? { set: true, tail: String(keys[prov]).slice(-4) } : { set: false };
  return out;
}
const hashObj = (flat) => { const o = {}; for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = flat[i + 1]; return o; };

async function teacherState(cls, { panel, shots } = {}) {
  const c = cls.code;
  const cmds = [
    ["SMEMBERS", K.pcs(c)], ["HGETALL", K.locks(c)], ["HGETALL", K.joined(c)], ["HGETALL", K.shotat(c)],
    ["LRANGE", K.logs(c), 0, 199], ["LRANGE", K.qs(c), 0, 99], ["HGETALL", K.qans(c)],
  ];
  if (panel || shots) cmds.push(["SET", K.panel(c), "1", "EX", 30]);
  if (shots) cmds.push(["SET", K.pshot(c), "1", "EX", 15]);
  const [ids, locks, joined, shotat, logs, qs, qans] = await pipe(cmds);
  const L = hashObj(locks), Jn = hashObj(joined), S = hashObj(shotat), A = hashObj(qans);
  const infos = ids.length ? await one("MGET", ...ids.map((id) => K.pc(c, id))) : [];
  const pcs = ids.map((id, i) => {
    const p = J(infos[i]); if (!p) return null;
    return {
      id: p.id, name: p.name, student: p.student || "", studentId: p.studentId || "", online: online(p), lastSeen: p.lastSeen || 0,
      joinedAt: Number(Jn[id]) || 0, lock: !!L[id], status: p.status || {}, hasShot: !!S[id], shotAt: Number(S[id]) || 0,
    };
  }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name, "az", { numeric: true }));
  const l = lessonNow(cls);
  return {
    now: now(),
    class: { code: cls.code, name: cls.name, createdAt: cls.createdAt, schedule: cls.schedule },
    lesson: { running: l.running, left: l.left, next: l.next, key: l.key, released: !!l.key && cls.settings.releasedKey === l.key },
    settings: { ...cls.settings, keys: maskedKeys(cls.settings.keys) },
    pcs,
    logs: logs.map(J).filter(Boolean),
    questions: qs.map(J).filter(Boolean).map((q) => (A[q.id] ? { ...q, answer: J(A[q.id]) } : q)),
  };
}

// ── API ───────────────────────────────────────────────────────────────────────
async function api(req, res, u) {
  const p = u.pathname.replace(/\/+$/, "");

  if (p === "/api/class/create" && req.method === "POST") {
    const b = await readBody(req);
    const name = String(b.name || "").trim().slice(0, 40);
    if (!name) return send(res, 400, { ok: false, reason: "Sinif adı yoxdur" });
    const want = String(b.code || "").toUpperCase();
    const wantOk = /^[A-Z2-9]{5}$/.test(want) && !/[IO01]/.test(want);
    const token = b.token && String(b.token).length >= 16 ? String(b.token) : undefined;
    if (wantOk) {
      const have = await getClass(want);
      if (have) {
        if (token && token === have.token) return send(res, 200, { ok: true, code: have.code, token: have.token, name: have.name });
        return send(res, 409, { ok: false, reason: "Bu kod artıq istifadə olunur" });
      }
    }
    for (let i = 0; i < 50; i++) {
      let code = want;
      if (!wantOk || i > 0) code = Array.from(crypto.randomBytes(5), (x) => CODE_ALPHABET[x % CODE_ALPHABET.length]).join("");
      const cls = newClass(name, code, token);
      const done = await one("SET", K.meta(code), JSON.stringify(cls), "NX");
      if (!done) { if (wantOk && i === 0) return send(res, 409, { ok: false, reason: "Bu kod artıq istifadə olunur" }); continue; }
      await pipe(logCmds(code, [{ type: "sinif", text: `“${name}” sinfi yaradıldı (kod: ${code})`, user: "Müəllim" }]));
      return send(res, 200, { ok: true, code, token: cls.token, name });
    }
    return send(res, 500, { ok: false, reason: "kod tapılmadı" });
  }

  if (p === "/api/class/info" && req.method === "GET") {
    const c = await getClass(u.searchParams.get("code"));
    return send(res, 200, c ? { ok: true, exists: true, name: c.name } : { ok: true, exists: false });
  }

  // ── Şagird kompüteri ──
  if (p === "/api/agent/poll" && req.method === "POST") {
    const b = await readBody(req, 6_000_000);
    const code = String(b.code || "").toUpperCase();
    const pcId = String((b.pc && b.pc.id) || "").slice(0, 40);
    if (!pcId) return send(res, 400, { ok: false });
    const info = {
      id: pcId, name: String((b.pc && b.pc.name) || pcId).slice(0, 40),
      student: String((b.student && b.student.name) || "").slice(0, 40), studentId: String((b.student && b.student.id) || "").slice(0, 40),
      status: b.status && typeof b.status === "object" ? { safe: !!b.status.safe, lesson: b.status.lesson || "", ver: String(b.status.ver || "") } : {},
      lastSeen: now(),
    };
    if (!/^[A-Z0-9]{3,8}$/.test(code)) return send(res, 200, { ok: false, reason: "class" });

    // 1-ci sorğu: hamısı bir dəfəyə oxunur, kompüterin məlumatı yazılır (köhnə qiyməti qaytarır)
    const [metaRaw, old, lockRaw, cmdRaw, ansRaw, panelFlags] = await pipe([
      ["GET", K.meta(code)],
      ["SET", K.pc(code, pcId), JSON.stringify(info), "EX", 604800, "GET"],
      ["HGET", K.locks(code), pcId],
      ["LRANGE", K.cmds(code, pcId), 0, -1],
      ["LRANGE", K.ans(code, pcId), 0, -1],
      ["MGET", K.panel(code), K.pshot(code)],
    ]);
    const cls = J(metaRaw);
    if (!cls) {
      await one("DEL", K.pc(code, pcId)); // sinif yoxdur: boş yerə iz qalmasın
      return send(res, 200, { ok: false, reason: "class" });
    }
    const first = old === null || old === undefined;
    const prev = J(old);
    const wasOnline = prev && online(prev);
    let lock = !!lockRaw;
    const writes = [];
    const logs = [];
    if (first) {
      writes.push(["SADD", K.pcs(code), pcId], ["HSET", K.joined(code), pcId, String(now())]);
      if (cls.settings.lockAll) { writes.push(["HSET", K.locks(code), pcId, "1"]); lock = true; }
      logs.push({ type: "sinif", pc: pcId, pcName: info.name, user: info.student, text: `${info.student || info.name} sinfə qoşuldu` });
    } else if (!wasOnline && b.status && b.status.resumed) {
      logs.push({ type: "sistem", pc: pcId, pcName: info.name, user: info.student, text: "Kompüter yenidən qoşuldu" });
    }
    for (const l of Array.isArray(b.logs) ? b.logs.slice(0, 60) : []) logs.push({ ...l, pc: pcId, pcName: info.name, user: l.user || info.student });
    writes.push(...logCmds(code, logs));

    // ekran şəkli
    if (typeof b.shot === "string" && b.shot.startsWith("data:image/jpeg;base64,") && b.shot.length < 700_000) {
      writes.push(["SET", K.shot(code, pcId), b.shot.split(",")[1], "EX", 120], ["HSET", K.shotat(code), pcId, String(now())]);
    }

    // əmrlər: icra olunanlar və köhnələnlər silinir, qalanlar verilir
    const ack = new Set(Array.isArray(b.ack) ? b.ack : []);
    const cmds = [];
    for (const raw of cmdRaw) {
      const c = J(raw); if (!c) { writes.push(["LREM", K.cmds(code, pcId), 0, raw]); continue; }
      if (ack.has(c.id) || now() - c.at >= CMD_TTL_MS) writes.push(["LREM", K.cmds(code, pcId), 0, raw]);
      else cmds.push(c);
    }
    const ackA = new Set(Array.isArray(b.ackAnswers) ? b.ackAnswers : []);
    const answers = [];
    for (const raw of ansRaw) {
      const a = J(raw); if (!a) { writes.push(["LREM", K.ans(code, pcId), 0, raw]); continue; }
      if (ackA.has(a.id)) writes.push(["LREM", K.ans(code, pcId), 0, raw]); else answers.push(a);
    }

    // suallar (təkrarı yoxlanır)
    const qs = (Array.isArray(b.questions) ? b.questions.slice(0, 10) : []).filter((q) => q && q.id);
    let newQs = [];
    if (qs.length) {
      const added = await pipe(qs.map((q) => ["SADD", K.qids(code), String(q.id).slice(0, 40)]));
      newQs = qs.filter((_, i) => added[i] === 1);
    }
    for (const q of newQs) {
      const id = String(q.id).slice(0, 40);
      const hasImg = typeof q.image === "string" && q.image.length < 600_000 && q.image.length > 0;
      if (hasImg) writes.push(["SET", K.qimg(code, id), q.image, "EX", 604800]);
      writes.push(["LPUSH", K.qs(code), JSON.stringify({ id, at: q.at || now(), pc: pcId, from: String(q.from || info.student || info.name).slice(0, 40), text: String(q.text || "").slice(0, 1000), image: hasImg })]);
    }
    if (newQs.length) writes.push(["LTRIM", K.qs(code), 0, 299]);
    if (writes.length) await pipe(writes);

    const s = cls.settings;
    const active = panelFlags[0] !== null || panelFlags[1] !== null;
    return send(res, 200, {
      ok: true, now: now(), className: cls.name, schedule: cls.schedule,
      settings: { allowExe: s.allowExe, safeMode: s.safeMode, webBlock: s.webBlock, sites: s.sites, blockedProcs: blockedProcesses(cls), keys: s.keys, models: s.models, releasedKey: s.releasedKey, teacherName: s.teacherName },
      lock, commands: cmds, answers,
      wantShot: panelFlags[1] !== null,
      pollMs: active ? POLL_FAST_MS : POLL_IDLE_MS,
    });
  }

  // ── Müəllim ──
  if (p.startsWith("/api/teacher/") || p === "/api/shot") {
    const cls = await teacherAuth(req, u);
    if (!cls) return send(res, 401, { ok: false, reason: "auth" });
    const code = cls.code;

    if (p === "/api/shot") {
      const raw = await one("GET", K.shot(code, String(u.searchParams.get("pc") || "")));
      if (!raw) return send(res, 404, "");
      return send(res, 200, Buffer.from(raw, "base64"), { "content-type": "image/jpeg", "cache-control": "private, max-age=30" });
    }

    if (p === "/api/teacher/state" && req.method === "GET") {
      return send(res, 200, { ok: true, ...(await teacherState(cls, { panel: u.searchParams.get("panel") === "1", shots: u.searchParams.get("shots") === "1" })) });
    }

    const b = req.method === "POST" ? await readBody(req) : {};
    const extra = []; // əlavə qeydlər

    if (p === "/api/teacher/settings") {
      const s = cls.settings;
      const log = (type, text) => extra.push({ type, text, user: "Müəllim" });
      if (typeof b.name === "string" && b.name.trim()) cls.name = b.name.trim().slice(0, 40);
      if (Array.isArray(b.schedule)) {
        cls.schedule = b.schedule.slice(0, 7).map((l, i) => ({ n: i + 1, start: String(l.start || "08:00").slice(0, 5), end: String(l.end || "08:45").slice(0, 5), on: !!l.on }));
        log("dərs", "Dərs cədvəli yeniləndi");
      }
      for (const k of ["allowExe", "safeMode", "webBlock"]) if (typeof b[k] === "boolean") { s[k] = b[k]; log("icazə", `${k} = ${b[k] ? "açıq" : "bağlı"}`); }
      if (typeof b.teacherName === "string") s.teacherName = b.teacherName.trim().slice(0, 24) || "müəllim";
      if (Array.isArray(b.sites)) s.sites = b.sites.map((x) => String(x).toLowerCase().slice(0, 80)).slice(0, 200);
      if (b.apps && typeof b.apps === "object") for (const [k, v] of Object.entries(b.apps)) if (k in s.apps) s.apps[k] = v ? 1 : 0;
      if (b.extraApps && typeof b.extraApps === "object") {
        for (const [k, v] of Object.entries(b.extraApps)) {
          if (v === null) delete s.extraApps[k];
          else if (/^[\w.\- ]{1,60}\.exe$/i.test(k)) s.extraApps[k] = v ? 1 : 0;
        }
      }
      if (Array.isArray(b.tasks)) s.tasks = b.tasks.slice(0, 50).map((t) => ({ t: String(t.t || "").slice(0, 80), d: t.d ? 1 : 0 }));
      if (b.keys && typeof b.keys === "object") {
        for (const [k, v] of Object.entries(b.keys)) {
          if (!PROVIDERS.includes(k)) continue;
          if (v === null || v === "") delete s.keys[k]; else s.keys[k] = String(v).trim().slice(0, 300);
        }
        log("icazə", "API açarları yeniləndi");
      }
      if (Array.isArray(b.models)) s.models = b.models.slice(0, 60).filter((m) => m && m.scope && m.model).map((m) => ({ scope: String(m.scope), target: String(m.target || "*"), model: String(m.model) }));
      await saveClass(cls);
      await pipe(logCmds(code, extra));
      return send(res, 200, { ok: true, ...(await teacherState(cls)) });
    }

    if (p === "/api/teacher/command") {
      const type = String(b.type || "");
      const target = String(b.pc || "all");
      const all = await one("SMEMBERS", K.pcs(code));
      const known = target === "all" ? all : all.filter((x) => x === target);
      const names = await pipe(known.map((id) => ["GET", K.pc(code, id)]));
      const pcs = known.map((id, i) => J(names[i])).filter(Boolean);
      const who = target === "all" ? (type === "release" ? "" : `${pcs.length} kompüter`) : pcs[0] ? pcs[0].name : target;
      const w = [];
      if (type === "lock" || type === "unlock") {
        for (const pc of pcs) w.push(type === "lock" ? ["HSET", K.locks(code), pc.id, "1"] : ["HDEL", K.locks(code), pc.id]);
        if (target === "all") { cls.settings.lockAll = type === "lock"; await saveClass(cls); }
        extra.push({ type: "əmr", text: `${target === "all" ? "Bütün kompüterlər" : who} ${type === "lock" ? "kilidləndi" : "kilidi açıldı"}`, user: "Müəllim" });
      } else if (type === "release") {
        const l = lessonNow(cls);
        cls.settings.releasedKey = l.key || `manual#${now()}`;
        await saveClass(cls);
        extra.push({ type: "əmr", text: "“Uşaqlar, keçə bilərsiniz” — dərs məhdudiyyətləri götürüldü", user: "Müəllim" });
      } else if (["restart", "shutdown", "message", "closeApps"].includes(type)) {
        const args = b.args && typeof b.args === "object" ? b.args : {};
        for (const pc of pcs) {
          const item = JSON.stringify({ id: uid(), type, args: { text: String(args.text || "").slice(0, 300), names: Array.isArray(args.names) ? args.names.slice(0, 40) : blockedProcesses(cls) }, at: now() });
          w.push(["RPUSH", K.cmds(code, pc.id), item], ["EXPIRE", K.cmds(code, pc.id), 300]);
        }
        const what = { restart: "yenidən başladılır", shutdown: "söndürülür", message: "mesaj göndərildi", closeApps: "proqramları bağlandı" }[type];
        extra.push({ type: "əmr", text: `${who}: ${what}${type === "message" ? " — " + String(args.text || "").slice(0, 80) : ""}`, user: "Müəllim" });
      } else if (type === "mouse") {
        // Remote mouse control, always aimed at one PC (never "all"): the teacher clicks a point
        // on that PC's live screen picture; nx/ny are 0..1 fractions of the screen, so they still
        // land correctly whatever that PC's resolution is.
        const args = b.args && typeof b.args === "object" ? b.args : {};
        const nx = Number(args.nx), ny = Number(args.ny);
        const maction = ["move", "click", "rightclick", "doubleclick"].includes(args.action) ? args.action : "click";
        if (pcs.length !== 1 || !Number.isFinite(nx) || !Number.isFinite(ny)) return send(res, 400, { ok: false, reason: "siçan" });
        const item = JSON.stringify({ id: uid(), type, args: { nx: Math.max(0, Math.min(1, nx)), ny: Math.max(0, Math.min(1, ny)), action: maction }, at: now() });
        w.push(["RPUSH", K.cmds(code, pcs[0].id), item], ["EXPIRE", K.cmds(code, pcs[0].id), 60]);
      } else return send(res, 400, { ok: false, reason: "əmr" });
      await pipe([...w, ...logCmds(code, extra)]);
      return send(res, 200, { ok: true, sent: pcs.length });
    }

    if (p === "/api/teacher/answer") {
      const qid = String(b.qid || "");
      const qs = (await one("LRANGE", K.qs(code), 0, 299)).map(J).filter(Boolean);
      const q = qs.find((x) => x.id === qid);
      if (!q || !String(b.text || "").trim()) return send(res, 400, { ok: false });
      const text = String(b.text).trim().slice(0, 1000);
      await pipe([
        ["HSET", K.qans(code), q.id, JSON.stringify({ text, at: now() })],
        ["RPUSH", K.ans(code, q.pc), JSON.stringify({ id: uid(), qid: q.id, text, at: now() })],
        ["EXPIRE", K.ans(code, q.pc), 604800],
        ...logCmds(code, [{ type: "sual", text: "Şagirdə cavab yazıldı", user: "Müəllim" }]),
      ]);
      return send(res, 200, { ok: true });
    }

    if (p === "/api/teacher/forget") {
      const id = String(b.pc || "");
      await pipe([["SREM", K.pcs(code), id], ["DEL", K.pc(code, id), K.cmds(code, id), K.ans(code, id), K.shot(code, id)], ["HDEL", K.locks(code), id], ["HDEL", K.joined(code), id], ["HDEL", K.shotat(code), id]]);
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { ok: false });
  }

  return send(res, 404, { ok: false });
}

async function handler(req, res) {
  const u = new URL(req.url, "http://x");
  try {
    if (req.method === "OPTIONS") return send(res, 204, "");
    if (u.pathname === "/api/health" || u.pathname === "/health") {
      let db = "ok";
      try { await one("SET", "dex:health", "1", "EX", 60); if ((await one("GET", "dex:health")) !== "1") db = "yazılan oxunmur"; } catch (e) { db = "XƏTA: " + e.message; }
      return send(res, 200, { ok: db === "ok", storage: BACKEND, db, time: new Date(now() + BAKU_OFFSET).toISOString().replace("Z", "+04:00") });
    }
    return await api(req, res, u);
  } catch (e) {
    console.error("[dex]", e);
    send(res, e.message === "json" || e.message === "big" ? 400 : 500, { ok: false, reason: e.message });
  }
}

module.exports = { handler, lessonNow };

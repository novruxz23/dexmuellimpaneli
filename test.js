// Serveri yoxlayır: sinif, kompüter, əmrlər, ayarlar, sual-cavab, ekran şəkli.
//   node test.js              → yaddaşdakı bazada
//   node test.js --redis      → saxta Upstash REST serveri ilə
//   node test.js --firebase   → saxta Firebase Realtime Database ilə
process.env.DEX_DATA = require("os").tmpdir() + "/dex-site-test-" + process.pid;
const assert = require("assert");
const http = require("http");

async function boot() {
  if (process.argv.includes("--redis")) {
    const { Mem } = require("./lib/db");
    const mem = new Mem("");
    const mock = http.createServer((req, res) => {
      const ch = []; req.on("data", (c) => ch.push(c)); req.on("end", async () => {
        if (req.headers.authorization !== "Bearer tok") { res.writeHead(401); return res.end("{}"); }
        const out = (await mem.pipeline(JSON.parse(Buffer.concat(ch).toString()))).map((result) => ({ result }));
        res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(out));
      });
    });
    await new Promise((r) => mock.listen(0, "127.0.0.1", r));
    process.env.KV_REST_API_URL = "http://127.0.0.1:" + mock.address().port;
    process.env.KV_REST_API_TOKEN = "tok";
    console.log("(saxta Upstash ilə)");
  }
  if (process.argv.includes("--firebase") || process.argv.includes("--firebase-sa")) {
    const SAMODE = process.argv.includes("--firebase-sa");
    // saxta Firebase Realtime Database (REST): ağac, PUT/PATCH/DELETE, if-match null_etag, shallow, orderBy $key
    let tree = {};
    const walk = (parts, create) => { let n = tree; for (const p of parts) { if (n === null || typeof n !== "object") return undefined; if (!(p in n)) { if (!create) return undefined; n[p] = {}; } n = n[p]; } return n; };
    const parent = (parts) => walk(parts.slice(0, -1), true);
    const prune = (parts) => { for (let i = parts.length; i > 0; i--) { const par = walk(parts.slice(0, i - 1)); const k = parts[i - 1]; if (par && k in par && par[k] && typeof par[k] === "object" && !Object.keys(par[k]).length) delete par[k]; else break; } };
    const setAt = (parts, v) => { if (v === null) { const par = walk(parts.slice(0, -1)); if (par) delete par[parts[parts.length - 1]]; prune(parts.slice(0, -1).concat(["_"]).slice(0, -1).concat([])); prune(parts.slice(0, -1).length ? parts.slice(0, -1).concat(["x"]) : []); return; } parent(parts)[parts[parts.length - 1]] = v; };
    const mock = http.createServer((req, res) => {
      const ch = []; req.on("data", (c) => ch.push(c)); req.on("end", () => {
        const u = new URL(req.url, "http://x");
        if (SAMODE ? u.searchParams.get("access_token") !== "tok123" : u.searchParams.get("auth") !== "sekret") { res.writeHead(401); return res.end('{"error":"Permission denied"}'); }
        const parts = u.pathname.replace(/\.json$/, "").split("/").filter(Boolean).map(decodeURIComponent);
        const body = ch.length ? JSON.parse(Buffer.concat(ch).toString()) : undefined;
        const ok = (v) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(v === undefined ? null : v)); };
        if (req.method === "GET") {
          let n = walk(parts); if (n === undefined) return ok(null);
          if (u.searchParams.get("shallow") === "true" && n && typeof n === "object") return ok(Object.fromEntries(Object.keys(n).map((k) => [k, true])));
          const lim = u.searchParams.get("limitToFirst");
          if (lim && n && typeof n === "object") { n = Object.fromEntries(Object.keys(n).sort().slice(0, Number(lim)).map((k) => [k, n[k]])); }
          return ok(n);
        }
        if (req.method === "PUT") {
          if (req.headers["if-match"] === "null_etag" && walk(parts) !== undefined) { res.writeHead(412); return res.end("{}"); }
          setAt(parts, body); return ok(body);
        }
        if (req.method === "PATCH") { for (const [k, v] of Object.entries(body)) setAt([...parts, k], v); cleanup(); return ok(body); }
        if (req.method === "DELETE") { setAt(parts, null); cleanup(); return ok(null); }
        res.writeHead(405); res.end();
      });
    });
    // boş obyektləri təmizləyir (Firebase kimi)
    const cleanup = () => { const rec = (n) => { for (const k of Object.keys(n)) { if (n[k] && typeof n[k] === "object") { rec(n[k]); if (!Object.keys(n[k]).length) delete n[k]; } } }; rec(tree); };
    await new Promise((r) => mock.listen(0, "127.0.0.1", r));
    process.env.FIREBASE_DB_URL = "http://127.0.0.1:" + mock.address().port;
    if (SAMODE) {
      const { privateKey } = require("crypto").generateKeyPairSync("rsa", { modulusLength: 2048 });
      const oauth = http.createServer((req, res) => { const c = []; req.on("data", (x) => c.push(x)); req.on("end", () => { const body = Buffer.concat(c).toString(); const ok = body.includes("grant_type=urn") && body.split("assertion=")[1].split(".").length === 3; res.writeHead(ok ? 200 : 400, { "content-type": "application/json" }); res.end(JSON.stringify({ access_token: "tok123", expires_in: 3600 })); }); });
      await new Promise((r) => oauth.listen(0, "127.0.0.1", r));
      process.env.FIREBASE_TOKEN_URL = "http://127.0.0.1:" + oauth.address().port;
      process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ client_email: "x@y.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) });
    } else process.env.FIREBASE_DB_SECRET = "sekret";
    console.log(SAMODE ? "(saxta Firebase + service account ilə)" : "(saxta Firebase ilə)");
  }
  return require("./dev-server.js").server;
}

boot().then((server) => server.listen(0, "127.0.0.1", async () => {
  const base = "http://127.0.0.1:" + server.address().port;
  const j = async (m, p, body, h = {}) => { const r = await fetch(base + p, { method: m, headers: { "content-type": "application/json", ...h }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { s: r.status, ...JSON.parse(t) }; } catch { return { s: r.status, raw: t }; } };
  try {
    const c = await j("POST", "/api/class/create", { name: "9B" });
    assert(c.ok && /^[A-Z2-9]{5}$/.test(c.code) && c.token.length >= 20);
    const T = { "x-class": c.code, "x-teacher": c.token };
    assert.equal((await j("GET", "/api/class/info?code=" + c.code)).exists, true);
    assert.equal((await j("GET", "/api/class/info?code=ZZZZZ")).exists, false);
    // a class made on the PC before the server existed is registered under its own code and key
    const own = await j("POST", "/api/class/create", { name: "5A", code: "7F4K9", token: "x".repeat(24) });
    assert.equal(own.code, "7F4K9");
    assert.equal((await j("POST", "/api/class/create", { name: "x", code: "7F4K9" })).s, 409);

    // no pupil yet: the panel sees no computers at all
    assert.equal((await j("GET", "/api/teacher/state", null, T)).pcs.length, 0);
    assert.equal((await j("GET", "/api/teacher/state")).s, 401);

    const poll = (extra = {}) => j("POST", "/api/agent/poll", { code: c.code, pc: { id: "pc-a1", name: "PC-214" }, student: { id: "s1", name: "Aylin" }, status: { ver: "1" }, ...extra });
    let r = await poll({ logs: [{ type: "sual", text: "AI sualı", at: Date.now() }], questions: [{ id: "q1", at: Date.now(), from: "Aylin", text: "Bu nədir?" }] });
    assert(r.ok && r.schedule.length === 7 && r.lock === false && r.commands.length === 0);
    assert.equal((await j("POST", "/api/agent/poll", { code: "NOPE1", pc: { id: "x" } })).ok, false);
    let st = await j("GET", "/api/teacher/state?shots=1", null, T);
    assert.equal(st.pcs.length, 1); assert(st.pcs[0].online); assert.equal(st.pcs[0].student, "Aylin");
    assert(st.logs.some((l) => l.text === "AI sualı")); assert.equal(st.questions[0].text, "Bu nədir?");
    assert.equal((await poll()).wantShot, true);
    assert.equal((await poll()).pollMs, 900, "panel açıqdır: sürətli poll");

    // settings: schedule, keys (masked for the panel, full for the PCs), models, apps
    await j("POST", "/api/teacher/settings", { schedule: [{ start: "08:00", end: "08:45", on: true }], keys: { openrouter: "sk-or-abc1234" }, allowExe: true, apps: { Steam: 0 }, extraApps: { "game.exe": 0 }, sites: ["Tiktok.com"], models: [{ scope: "class", target: "x", model: "openrouter/free" }] }, T);
    st = await j("GET", "/api/teacher/state", null, T);
    assert.equal(st.settings.keys.openrouter.tail, "1234"); assert(!JSON.stringify(st).includes("sk-or-abc1234"));
    r = await poll();
    assert.equal(r.settings.keys.openrouter, "sk-or-abc1234"); assert.equal(r.settings.allowExe, true);
    assert(r.settings.blockedProcs.includes("steam.exe") && r.settings.blockedProcs.includes("game.exe"));
    assert.deepEqual(r.settings.sites, ["tiktok.com"]); assert.equal(r.schedule.length, 1);

    // commands: restart is one-shot until acknowledged; lock is a state
    await j("POST", "/api/teacher/command", { pc: "all", type: "restart" }, T);
    await j("POST", "/api/teacher/command", { pc: "pc-a1", type: "message", args: { text: "Salam" } }, T);
    await j("POST", "/api/teacher/command", { pc: "pc-a1", type: "lock" }, T);
    r = await poll();
    assert.deepEqual(r.commands.map((x) => x.type).sort(), ["message", "restart"]); assert.equal(r.lock, true);
    r = await poll(); assert.equal(r.commands.length, 2, "not acknowledged yet: handed over again");
    r = await poll({ ack: r.commands.map((x) => x.id) }); assert.equal(r.commands.length, 0);
    await j("POST", "/api/teacher/command", { pc: "all", type: "unlock" }, T);
    assert.equal((await poll()).lock, false);
    // a PC that joins while "lock all" is on comes up locked
    await j("POST", "/api/teacher/command", { pc: "all", type: "lock" }, T);
    r = await j("POST", "/api/agent/poll", { code: c.code, pc: { id: "pc-b2", name: "PC-215" }, student: { name: "Rauf" } });
    assert.equal(r.lock, true);

    // remote mouse control: aimed at exactly one PC (now that two are known), coordinates are 0..1 fractions
    const bad = await j("POST", "/api/teacher/command", { pc: "all", type: "mouse", args: { nx: 0.5, ny: 0.5 } }, T);
    assert.equal(bad.s, 400, "mouse: 'all' is refused, it must name one PC");
    await j("POST", "/api/teacher/command", { pc: "pc-a1", type: "mouse", args: { nx: 0.42, ny: 1.7, action: "doubleclick" } }, T);
    r = await poll();
    assert.equal(r.commands.length, 1);
    assert.equal(r.commands[0].type, "mouse");
    assert.equal(r.commands[0].args.nx, 0.42);
    assert.equal(r.commands[0].args.ny, 1, "ny is clamped to 0..1");
    assert.equal(r.commands[0].args.action, "doubleclick");
    r = await poll({ ack: r.commands.map((x) => x.id) });
    assert.equal(r.commands.length, 0);

    // answers travel back to the pupil's PC
    await j("POST", "/api/teacher/answer", { qid: "q1", text: "Törəmədir" }, T);
    r = await poll(); assert.equal(r.answers[0].text, "Törəmədir");
    r = await poll({ ackAnswers: r.answers.map((a) => a.id) }); assert.equal(r.answers.length, 0);

    // screenshot
    const jpg = "data:image/jpeg;base64," + Buffer.from([0xff, 0xd8, 0xff, 0xd9]).toString("base64");
    await poll({ shot: jpg });
    const img = await fetch(base + "/api/shot?pc=pc-a1&c=" + c.code + "&t=" + c.token);
    assert.equal(img.status, 200); assert.equal(img.headers.get("content-type"), "image/jpeg");

    // release + forget
    await j("POST", "/api/teacher/command", { type: "release" }, T);
    await j("POST", "/api/teacher/forget", { pc: "pc-b2" }, T);
    st = await j("GET", "/api/teacher/state", null, T);
    assert.equal(st.pcs.length, 1);
    assert.equal((await fetch(base + "/panel")).status, 200);
    assert.equal((await j("GET", "/health")).ok, true);
    // dərs saatı Bakı vaxtı ilə hesablanır (UTC 04:10 = Bakı 08:10 → 1-ci dərs)
    const { lessonNow } = require("./lib/dex");
    const l = lessonNow({ schedule: [{ n: 1, start: "08:00", end: "08:45", on: true }] }, Date.UTC(2026, 9, 27, 4, 10));
    assert.equal(l.running.n, 1);
    if (process.argv.includes("--firebase") || process.argv.includes("--firebase-sa")) {
      // proqram sinfi Firebase-in /registry yoluna yazıb (sayta toxunmadan); sayt oradan tanıyır
      const put = await fetch(process.env.FIREBASE_DB_URL + "/registry/Q7X4K.json?" + (process.argv.includes("--firebase-sa") ? "access_token=tok123" : "auth=sekret"), { method: "PUT", body: JSON.stringify({ name: "5B", token: "t".repeat(24), createdAt: Date.now() }) });
      assert.equal(put.status, 200);
      assert.deepEqual(await j("GET", "/api/class/info?code=Q7X4K"), { s: 200, ok: true, exists: true, name: "5B" });
      const st2 = await j("GET", "/api/teacher/state", null, { "x-class": "Q7X4K", "x-teacher": "t".repeat(24) });
      assert(st2.ok && st2.class.name === "5B", "açar ilə panelə giriş");
      assert.equal((await j("GET", "/api/teacher/state", null, { "x-class": "Q7X4K", "x-teacher": "yanlis".repeat(5) })).s, 401);
      assert.equal((await j("GET", "/api/class/info?code=ZZZZ9")).exists, false);
      console.log("registry → sayt ✔");
    }
    console.log("hamısı keçdi ✔");
    process.exit(0);
  } catch (e) { console.error("XƏTA:", e); process.exit(1); }
}));

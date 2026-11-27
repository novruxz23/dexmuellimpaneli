// test.bat bunu işlədir: yaddaşda işləyən sınaq serveri + hazır sinif (kod/açar soruşmur) + saxta kompüterlər.
const { openInDex } = require("./lib/open-browser");
const { server } = require("./dev-server");
const PORT = Number(process.env.PORT || 3000);
let CODE = "DEMKA", TOKEN = "demo-token-demo-token-demo-1234";
const B = `http://localhost:${PORT}`;
const call = async (m, p, b, h) => (await fetch(B + p, { method: m, headers: { "content-type": "application/json", ...(h || {}) }, body: b ? JSON.stringify(b) : undefined })).json();
const PCS = [["PC-101", "Aylin"], ["PC-102", "Rauf"], ["PC-103", "Nigar"], ["PC-104", "Elvin"], ["PC-105", "Leyla"], ["PC-106", "Tural"], ["PC-107", "Səbinə"], ["PC-108", "Kamran"]];
const beat = () => Promise.all(PCS.map(([n, s], i) => call("POST", "/api/agent/poll", { code: CODE, pc: { id: "demo-" + i, name: n }, student: { id: "s" + i, name: s }, status: { ver: "demo" } }).catch(() => {})));
server.listen(PORT, async () => {
  const cr = await call("POST", "/api/class/create", { name: "9B (sınaq)", code: CODE, token: TOKEN });
  if (!cr.ok) { console.error("Sinif yaradilmadi:", cr.reason); process.exit(1); }
  CODE = cr.code; TOKEN = cr.token;
  await beat();
  await call("POST", "/api/teacher/command", { pc: "demo-1", type: "lock" }, { "x-class": CODE, "x-teacher": TOKEN });
  setInterval(beat, 3000);
  const url = `${B}/panel?c=${CODE}&t=${TOKEN}`;
  console.log("\nDeX paneli sınaq rejimində: " + url + "\nBağlamaq üçün bu pəncərəni bağla (Ctrl+C).\n");
  openInDex(url);
});

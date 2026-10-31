// Kompüterdə yoxlamaq üçün: `node server.js` (Vercel-də bu fayl işlənmir, api/ və public/ işlənir).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { handler } = require("./lib/dex");

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = path.join(__dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname.startsWith("/api/") || u.pathname === "/health") return handler(req, res);
  const file = u.pathname === "/" || u.pathname.replace(/\/+$/, "") === "/panel" ? "panel.html" : u.pathname.replace(/^\//, "");
  const full = path.join(PUBLIC, file);
  if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }); return res.end("Tapılmadı"); }
  res.writeHead(200, { "content-type": TYPES[path.extname(full)] || "application/octet-stream", "cache-control": "no-cache" });
  res.end(fs.readFileSync(full));
});

if (require.main === module) server.listen(PORT, () => console.log(`DeX sayt serveri: http://localhost:${PORT}`));
module.exports = { server };

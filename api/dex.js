// Vercel giriş nöqtəsi. Əsl kod api/_dex.js-dədir.
// vercel.json bütün /api/* sorğularını bura yönləndirir: /api/dex?__p=teacher/state
// Burada orijinal yol (/api/teacher/state) bərpa olunur ki, server məntiqi həmişə düzgün yolu görsün.
let handler = null, loadError = null;
try { handler = require("./_dex.js"); } catch (e) { loadError = e; }

function restoreUrl(req) {
  let u;
  try { u = new URL(req.url, "http://x"); } catch (e) { return; }
  const weird = u.pathname === "/api/dex" || u.pathname.includes("[") || u.pathname === "/api/index";
  if (!weird && !u.searchParams.has("__p")) return;
  let segs = u.searchParams.getAll("__p").join("/");
  if (!segs) segs = u.searchParams.getAll("path").join("/");
  segs = segs.split("/").filter(Boolean);
  u.searchParams.delete("__p");
  u.searchParams.delete("path");
  const qs = u.searchParams.toString();
  req.url = "/api/" + segs.map(encodeURIComponent).join("/") + (qs ? "?" + qs : "");
}

module.exports = async (req, res) => {
  if (loadError) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    return res.end("YUKLENME XETASI:\n" + (loadError && loadError.stack ? loadError.stack : String(loadError)) + "\nNode: " + process.version);
  }
  try {
    restoreUrl(req);
    return await handler(req, res);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("ISLEME XETASI:\n" + (e && e.stack ? e.stack : String(e)));
  }
};

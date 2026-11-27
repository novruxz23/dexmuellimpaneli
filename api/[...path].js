// Vercel giriş nöqtəsi. Əsl kod api/_dex.js-dədir. Yüklənmə xətası olarsa səhifədə yazılır.
let handler = null, loadError = null;
try { handler = require("./_dex.js"); } catch (e) { loadError = e; }

module.exports = async (req, res) => {
  if (loadError) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    return res.end("YUKLENME XETASI:\n" + (loadError && loadError.stack ? loadError.stack : String(loadError)) + "\nNode: " + process.version);
  }
  try {
    return await handler(req, res);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("ISLEME XETASI:\n" + (e && e.stack ? e.stack : String(e)));
  }
};

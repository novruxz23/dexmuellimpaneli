// Ən sadə yoxlama: /api/ping "pong" yazırsa Vercel funksiyaları işləyir.
module.exports = (req, res) => { res.statusCode = 200; res.setHeader("content-type", "text/plain"); res.end("pong " + process.version); };

// lib/db.js və lib/dex.js-i tək api/[...path].js faylına yığır (qovluq itsə də Vercel funksiyası işləsin).
const fs = require("fs");
const db = fs.readFileSync("lib/db.js", "utf8");
const dex = fs.readFileSync("lib/dex.js", "utf8").replace('require("./db")', "__db");
const out = `// AVTOMATİK YARADILIB (node build-api.js). Mənbə: lib/db.js + lib/dex.js
const __db = (() => { const module = { exports: {} }; ${"\n"}${db}\n return module.exports; })();
const __dex = (() => { const module = { exports: {} }; ${"\n"}${dex}\n return module.exports; })();
module.exports = __dex.handler;
`;
fs.writeFileSync("api/_dex.js", out);
console.log("api/_dex.js yazıldı", out.length, "bayt");

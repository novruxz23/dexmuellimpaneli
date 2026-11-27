// Paneli (panel.html) DeX Browser-də açır. Yol bu sırayla axtarılır:
//   1) DEX_BROWSER mühit dəyişəni   2) browser.txt faylı (bu qovluqda)   3) tanınmış qurulum yolları
// Tapılmasa sistemin standart brauzeri istifadə olunur.
const fs = require("fs"), path = require("path"), { spawn, exec } = require("child_process");
const E = process.env, root = path.join(__dirname, "..");
const NAMES = ["DeX Browser", "DexBrowser", "dexbrowser", "DeX-Browser", "dex-browser"];
function fromFile() {
  try {
    const t = fs.readFileSync(path.join(root, "browser.txt"), "utf8").split(/\r?\n/).map(x => x.trim().replace(/^"|"$/g, "")).find(x => x && !x.startsWith("#"));
    return t && fs.existsSync(t) ? t : null;
  } catch (e) { return null; }
}
function guess() {
  const dirs = [E.LOCALAPPDATA && path.join(E.LOCALAPPDATA, "Programs"), E.ProgramFiles, E["ProgramFiles(x86)"], E.APPDATA, E.USERPROFILE && path.join(E.USERPROFILE, "Desktop"), path.join(root, ".."), root].filter(Boolean);
  for (const d of dirs) for (const n of NAMES) for (const f of [`${n}\\${n}.exe`, `${n}\\${n.replace(/ /g, "")}.exe`, `${n}.exe`, `${n}.bat`, `${n}.lnk`, `${n}\\start.bat`]) {
    const p = path.join(d, f); try { if (fs.existsSync(p)) return p; } catch (e) {}
  }
  return null;
}
function openInDex(url) {
  const exe = E.DEX_BROWSER || fromFile() || guess();
  if (process.platform !== "win32") { console.log("Aç: " + url); return false; }
  if (exe && fs.existsSync(exe)) {
    // .exe/.lnk/.bat — hamısı “start” vasitəsilə işləyir; URL arqument kimi verilir
    spawn("cmd", ["/c", `start "" "${exe}" "${url}"`], { windowsVerbatimArguments: true, detached: true, stdio: "ignore", cwd: path.dirname(exe) }).unref();
    console.log("DeX Browser-də açılır: " + exe);
    return true;
  }
  console.log("DeX Browser tapılmadı — standart brauzerdə açılır. Yolu browser.txt faylına yaz.");
  exec(`start "" "${url}"`);
  return false;
}
module.exports = { openInDex };

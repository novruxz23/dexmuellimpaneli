# DeX Müəllim Paneli — masaüstü tətbiq

`dexmuellimpaneli.vercel.app/panel` ünvanını (müəllim paneli) ayrıca bir pəncərədə açan
çox kiçik Tauri qabığı. Məntiqin hamısı saytın özündədir (`site/` — `public/panel.html`,
`api/`) — bu qovluq sadəcə onu brauzer sekmələrindən ayrı, öz pəncərəsi, öz tapşırıq
zolağı ikonu və öz masaüstü qısayolu olan bir tətbiqə çevirir.

## Qurulum

```
cd site/desktop
npm install
npm run dev      # inkişaf: pəncərəni açır, canlı saytı yükləyir
npm run build    # quraşdırıcı (.msi/.exe, .dmg, .AppImage/.deb — platformaya görə)
```

İlk `cargo` qurulumu internetdən paketləri yükləyir; Rust 1.85+ lazımdır.

## Başqa server ünvanı

Default ünvan `tauri.conf.json`-dadır (`dexmuellimpaneli.vercel.app`). Öz serverini
işlədən məktəb, proqramın `.exe`-sinin yanına **`dex-config.json`** qoyaraq
(`{"siteUrl": "http://sizin-server-unvaniniz"}`) ünvanı dəyişə bilər — Windows
tətbiqindəki (`app/windows`) eyni fayl və qayda; `/panel` yolu avtomatik əlavə olunur.

## Niyə ayrıca layihə

`app/windows` DeX-in sinif kompüterlərində işləyən (şagird/müəllim) tətbiqidir və onun
öz tapşırıqları var (siçan, ekran, kilid, Windows inteqrasiyaları). Bu qovluq ondan
asılı deyil — tək vəzifəsi müəllim panelini brauzersiz, öz pəncərəsində açmaqdır, ona
görə `site/`-in yanında, öz `Cargo.toml`-u ilə ayrıca saxlanılır.

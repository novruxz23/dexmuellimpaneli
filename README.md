# DeX müəllim paneli — dexmuellimpaneli.vercel.app

Müəllim paneli (`/panel`) və DeX proqramının danışdığı server. Asılılıq yoxdur.

## Vercel-ə qoymaq (bir dəfə)

1. Bu `site` qovluğunu GitHub-a yüklə (və ya `vercel` CLI ilə `site` qovluğundan `vercel --prod`).
2. vercel.com → **Add New → Project** → həmin repo. **Root Directory** = `site` (repo yalnız saytdırsa boş qalsın). Framework: *Other*. **Deploy**.
3. Layihənin adı / domeni: **dexmuellimpaneli** → `https://dexmuellimpaneli.vercel.app`.
4. **Baza (vacib — bunsuz kod və açar tanınmır).** Firebase (pulsuz):
   1. console.firebase.google.com → **Add project** → ad ver (Analytics söndürülə bilər).
   2. Sol menyu **Build → Realtime Database → Create Database** → yer seç → **Locked mode** → Enable.
   3. Açılan **Data** səhifəsinin yuxarısındakı ünvanı kopyala: `https://....firebaseio.com` (və ya `...firebasedatabase.app`).
   4. ⚙ **Project settings → Service accounts → Generate new private key** → yüklənən `.json` faylı saxla (gizlidir, heç kimə vermə, GitHub-a yükləmə).
   5. Vercel → layihə → **Settings → Environment Variables**: `FIREBASE_DB_URL` = ünvan; `FIREBASE_SERVICE_ACCOUNT` = həmin `.json` faylının **bütün məzmunu**.
      (Köhnə layihələrdə *Database secrets* bölməsi varsa, `FIREBASE_DB_SECRET` də olar.)
   (İstəsən Upstash Redis də olur: Vercel Storage → Upstash Redis. Firebase varsa o seçilir.)
5. **Qaydalar (proqram sinfi Firebase-ə birbaşa yazsın deyə):** Realtime Database → **Rules** → `firebase-rules.json` faylının içini yapışdır → **Publish**.
   Bu qaydalar proqrama yalnız `registry/<KOD>` yoluna **bir dəfə yazmağa** icazə verir; oxumaq və ya dəyişmək olmaz. Sayt service account ilə oxuyur.
   Proqramda `app/windows/src/dex/store.ts` içində `FIREBASE_URL = "https://....firebaseio.com"` yaz və `.exe`-ni yenidən qur.
6. **Redeploy**. Yoxla: `https://dexmuellimpaneli.vercel.app/api/health` → `"storage":"firebase","db":"ok"` yazmalıdır.
   `db` yerində `XƏTA` yazırsa, mətn səbəbi göstərir (ünvan və ya açar səhvdir).

## İstifadə

* DeX proqramı bu ünvanı **özü bilir** (Server düyməsinə toxunmaq lazım deyil).
* Müəllim: DeX-də sinfi yaradır → **Parametrlər** (dişli) paneli açır, kod və açar avtomatik daxil olur.
* Müəllim açarı: DeX → Parametrlər pəncərəsində **sinif kodunun altında**, həm də paneldə
  *Dərs idarəetməsi → sinif kodunun altında* (Kopyala və “Giriş linkini kopyala” düymələri ilə).
* Şagird: DeX-də **Şagird** + sinif kodu.

## Nəyə diqqət

* PC-lər panel bağlıykən 10 san.-də bir, panel açıqkən ~900 ms-də bir yazır (canlı ekran
  demək olar ki, Discord qədər axıcıdır). Pulsuz limitlər: Vercel Hobby ~1 mln sorğu/ay, Firebase Spark 10 GB yükləmə/ay (ekran şəkilləri ən çox trafik yeyir). Çox kompüterlə hər gün işləsən limit dolar.
* Dərs saatları Bakı vaxtı (UTC+4) ilə hesablanır.
* Kompüterdə yoxlamaq: `node dev-server.js` (Redis olmadan yaddaşda işləyir). Test: `node test.js`, `--redis`, `--firebase`, `--firebase-sa`.
* **Müəllimin siçan nəzarəti**: paneldə canlı ekran şəklinə klikləmək (sağ klik/iki dəfə klik
  də dəstəklənir) `"mouse"` əmrini (`nx`/`ny`/`action`) o PC-yə göndərir — həmişə **tək** PC-yə,
  heç vaxt bütün sinfə (`lib/dex.js`, `/api/teacher/command`).
* **Şagird mesajı gələndə**: DeX proqramı dərhal (artıq ~900 ms-lik poll ilə) səs+bildirişlə
  xəbər verir — müəllim panelə baxmasa belə.

## Fayllar

* `api/dex.js` — Vercel funksiyası (bütün `/api/*`; `vercel.json` rewrite ilə bura yönlənir)
* `lib/dex.js` — server məntiqi · `lib/db.js` — Firebase / Upstash Redis (REST) / yaddaş; `api/_dex.js` ikisinin yığılmış nüsxəsidir (`npm run make-api`)
* `public/panel.html` — müəllim paneli · `panel-src/` — panelin mənbəyi
* `vercel.json` — `/` və `/panel` → panel
* `desktop/` — müəllim panelini ayrıca masaüstü tətbiq kimi açan kiçik Tauri qabığı (bax `desktop/README.md`); saytın özündən asılıdır, ayrıca deploy tələb etmir.

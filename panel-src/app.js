/* DeX Müəllim Paneli — canlı hissə. Bütün məlumat serverdən gəlir (hər ~1,2 san.):
   yalnız sinfə həqiqətən qoşulmuş kompüterlər görünür, uydurma kompüter yoxdur. */
const P={ctl:"M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M13 6a2 2 0 104 0 2 2 0 10-4 0zM7 12a2 2 0 104 0 2 2 0 10-4 0zM15 18a2 2 0 104 0 2 2 0 10-4 0z",lock:"M6 11h12v9H6zM8 11V8a4 4 0 118 0v3",msg:"M4 5h16v11H9l-5 4z",cast:"M3 6h18v12H3zM8 21h8M12 18v3",x:"M6 6l12 12M18 6L6 18",trash:"M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13",rec:"M12 5a7 7 0 100 14 7 7 0 000-14z",copy:"M8 8h11v12H8zM5 16V4h11",full:"M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",pwr:"M12 3v8M7 6.5a7 7 0 1010 0"};
const I=n=>IC[n]?`<img src="${IC[n]}" alt="">`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const $=s=>document.querySelector(s), pad=n=>String(n).padStart(2,"0");
// Steam (e-STEAM) loqosu — DexBrowser-in öz Assets/steam.png-i, kiçildilib (64x64) daxil edilib.
const STEAM_ICON_B64="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";


const sv=(d,f)=>`<svg viewBox="0 0 24 24" class="${f?"":"st"}" aria-hidden="true">${d}</svg>`;
const NS={
 home:sv('<path d="M12 2.8 2.6 11.4a.8.8 0 00.5 1.4H5V20a1 1 0 001 1h4v-5.5h4V21h4a1 1 0 001-1v-7.2h1.9a.8.8 0 00.5-1.4z"/>',1),
 cal:sv('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15l2.2 2.2L15.5 13"/>'),
 play:sv('<path fill-rule="evenodd" d="M6 4h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3zm4.2 4.2v7.6L16.5 12z"/>',1),
 shield:sv('<path d="M12 2.8l7.5 2.8v6c0 4.7-3.1 8.1-7.5 9.6-4.4-1.5-7.5-4.9-7.5-9.6v-6z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.8"/>'),
 grid:sv('<rect x="3.5" y="3.5" width="7" height="7" rx="1.8" fill="currentColor"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" fill="currentColor"/>'),
 gear:sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>'),
 clock:sv('<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2"/>'),
 sun:sv('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/>'),
 bell:sv('<path d="M6 9a6 6 0 0112 0c0 6.5 2.6 8.2 2.6 8.2H3.4S6 15.5 6 9"/><path d="M10.2 20.6a2 2 0 003.6 0"/>')};

// ── Görünüş seçimləri (yalnız bu brauzerdə saxlanır) ─────────────────────────────
const UIK="dexui";
const UIDEF={anim:1,mblur:1,tspeed:"n",glow:70,bgfx:1,theme:"blue",font:"m",glass:1,compact:0,labels:0,cols:4,rad:"n",hover3d:1,sound:1,vol:60,sfxClick:1,sfxWhoosh:1,sfxPop:1,sfxNote:1,appMode:"new",scan:1,dotAnim:1,
 nJoin:1,nOff:1,nQ:1,nBrowser:1,nSound:1,bellShake:1,toastT:3,poll:2,shots:1,showStudent:1,hideOff:0,sort:"def"};
let UI={...UIDEF};try{Object.assign(UI,JSON.parse(localStorage.getItem(UIK)||"{}"))}catch(e){}
function applyUI(){const r=document.documentElement,c=document.body.classList;
 r.dataset.theme=UI.theme;r.dataset.font=UI.font;if(UI.rad==="n")r.removeAttribute("data-rad");else r.dataset.rad=UI.rad;
 r.style.setProperty("--glow",(UI.glow/100).toFixed(2));r.style.setProperty("--cols",UI.cols);r.style.setProperty("--tdur",({f:.6,n:1,s:1.6})[UI.tspeed]||1);
 c.toggle("noanim",!UI.anim);c.toggle("nofx",!UI.bgfx);c.toggle("glass",!!UI.glass);c.toggle("compact",!!UI.compact);c.toggle("labels",!!UI.labels);
 c.toggle("hover3d",!!UI.hover3d);c.toggle("noscan",!UI.scan);c.toggle("noshake",!UI.bellShake);c.toggle("nodot",!UI.dotAnim)}
function saveUI(){try{localStorage.setItem(UIK,JSON.stringify(UI))}catch(e){}applyUI()}
function syncUI(){document.querySelectorAll('[data-a="ui"]').forEach(b=>b.classList.toggle("on",!!UI[b.dataset.k]));
 document.querySelectorAll('[data-a="uiv"]').forEach(b=>b.classList.toggle("on",String(UI[b.dataset.k])===b.dataset.v));
 document.querySelectorAll("input[type=range][data-k]").forEach(r=>{if(UI[r.dataset.k]!=null){r.value=UI[r.dataset.k];const p=$("#rv-"+r.dataset.k);if(p)p.textContent=r.value}})}
let AUC=null;
function beep(f,d,v){if(window.sfx)return sfx(f>=700?"pop":"click");if(!UI.sound)return;try{AUC=AUC||new(window.AudioContext||window.webkitAudioContext)();const o=AUC.createOscillator(),g=AUC.createGain();o.type="sine";o.frequency.value=f||560;g.gain.value=v||.04;o.connect(g);g.connect(AUC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AUC.currentTime+(d||.07));o.stop(AUC.currentTime+(d||.07))}catch(e){}}

const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const MODELS=__MODELS__;
const PROVS=[["gemini","Gemini (Google AI Studio)"],["groq","Groq"],["mistral","Mistral"],["nvidia","NVIDIA (build.nvidia.com)"],["openrouter","OpenRouter (pulsuz modellər)"]];
const ORD={1:"ci",2:"ci",3:"cü",4:"cü",5:"ci",6:"cı",7:"ci"};
const ord=n=>`${n}-${ORD[n]||"ci"}`;

// ── Credentials ───────────────────────────────────────────────────────────────
const LS="dexpanel";
let CRED=null;
(function(){const q=new URLSearchParams(location.search),c=q.get("c"),t=q.get("t");
 if(c&&t){try{localStorage.setItem(LS,JSON.stringify({c:c.toUpperCase(),t}))}catch(e){}history.replaceState(null,"",location.pathname+location.hash)}
 try{CRED=JSON.parse(localStorage.getItem(LS)||"null")}catch(e){}})();
const hdr=()=>({"content-type":"application/json","x-class":CRED.c,"x-teacher":CRED.t});
async function api(m,p,b){const r=await fetch(p,{method:m,headers:hdr(),body:b?JSON.stringify(b):undefined});if(r.status===401){loginView("Açar düz deyil və ya sinif silinib.");throw new Error("auth")}return r.json()}
const post=(p,b)=>api("POST",p,b);
const shotUrl=(id,v)=>`/api/shot?pc=${encodeURIComponent(id)}&c=${CRED.c}&t=${encodeURIComponent(CRED.t)}&v=${v||0}`;

// ── State ─────────────────────────────────────────────────────────────────────
let S=null, N=(()=>{try{return JSON.parse(localStorage.getItem("dexN")||"[]").slice(0,30)}catch(e){return[]}})(), seen=null, offline=false, skew=0;
// Təqvim: seçilmiş gün (1=Bazar ertəsi … 7=Bazar), xüsusi gün planı üçün
let CALDAY=((new Date().getDay()+6)%7)+1;
const DAYLABEL={1:"B.e",2:"Ça",3:"Ç",4:"C.a",5:"C",6:"Ş",7:"B"};
const DAYFULL={1:"Bazar ertəsi",2:"Çərşənbə axşamı",3:"Çərşənbə",4:"Cümə axşamı",5:"Cümə",6:"Şənbə",7:"Bazar"};
// Ekran/kamera qeydi: tamamilə bu brauzerdə olur, server heç nə görmür — fayl birbaşa
// müəllimin öz kompüterinə enir (endirmə düyməsi ilə).
let RECSTATE=null, PREC=null, PSTREAM=null, PCHUNKS=[];
const toast=t=>{const e=$("#ts");e.textContent=t;e.hidden=false;clearTimeout(toast.k);toast.k=setTimeout(()=>e.hidden=true,(UI.toastT||3)*1000)};
function modal(h,c){if(window.sfx&&$("#mo").hidden)sfx("pop");const m=$("#mo");m.innerHTML=`<div class="md ${c||""}" role="dialog" aria-modal="true">${h}</div>`;m.hidden=false}
let MID="",MIV=0;
const closeM=()=>{window.WMODAL=false;$("#mo").hidden=true;MID="";clearInterval(MIV);rtcStop()};
const NAV=[["esas","home","Əsas panel"],["ders","cal","Dərs idarəetməsi"],["qeyd","play","Qeydlər"],["tehlukesizlik","shield","Təhlükəsizlik"],["tetbiq","grid","Tətbiq nəzarəti"],["param","gear","Parametrlər"]];
const stName={ok:"Aktiv",wa:"Kilidli",in:"Oflayn"},dot=s=>({ok:"g",wa:"o",in:"b"}[s]);
const pst=p=>!p.online?"in":p.lock?"wa":"ok";
const hm=t=>{const d=new Date(t);return pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds())};
const dhm=t=>{const d=new Date(t);return(d.toDateString()===new Date().toDateString()?"":pad(d.getDate())+"."+pad(d.getMonth()+1)+" ")+pad(d.getHours())+":"+pad(d.getMinutes())};
const sdate=()=>new Date(Date.now()+skew);
// Loqlar: xam tip adları ("əmr", "icazə"…) əvəzinə oxunaqlı etiket + rəng
const TYPELABEL={"əmr":["Əmr","#4f90ff"],"icazə":["İcazə dəyişikliyi","#55c9a0"],"proqram":["Proqram","#b07bff"],"yükləmə":["Yükləmə","#f6a04d"],"sistem":["Sistem","#8fb0ff"],"dərs":["Dərs/cədvəl","#4f90ff"],"sual":["Sual","#55c9a0"]};
const typePill=t=>{const[lab,col]=TYPELABEL[t]||[t,"#4f90ff"];return`<span class="pill" style="background:${col}22;color:${col};border:1px solid ${col}66">${esc(lab)}</span>`};

// same rule as the server and the app
const toMin=h=>{const [a,b]=String(h).split(":").map(x=>parseInt(x,10));return (a||0)*60+(b||0)};
function lessonNow(){if(!S)return{};const d=sdate(),m=d.getHours()*60+d.getMinutes()+d.getSeconds()/60;let next=null;
 for(const l of S.class.schedule){if(!l.on)continue;const s=toMin(l.start),e=toMin(l.end);if(m>=s&&m<e)return{running:l,secs:Math.max(0,Math.round((e-m)*60)),next};if(s>m&&(!next||s<toMin(next.start)))next=l}
 return{running:null,secs:0,next}}
const fmt=s=>pad(Math.floor(s/60))+":"+pad(s%60);

// ── Views ─────────────────────────────────────────────────────────────────────
const ovl=p=>(p.lock?`<div class="lk">${I("lock")}Kilidlənib</div>`:"");
// Hansı proqramda olduqlarını göstərir — ekran şəkli yox, sadəcə ad (activeApp, bax stats.rs).
// Tanınan proqramlar üçün öz rəngi/hərfi, qalanları üçün adın ilk hərfi ilə neytral nişan.
const APP_BADGE=(name)=>{const n=(name||"").toLowerCase();
 if(n.includes("algoritmika"))return["#8244fd","a"];
 if(n.includes("steam")||n.includes("e-steam"))return["#1a8f7a","S"];
 if(n.includes("dexbrowser"))return["#243468","D"];
 if(n.includes("chrome"))return["#ea4335","C"];
 if(n.includes("firefox"))return["#ff7139","F"];
 if(n.includes("edge"))return["#0a5bd4","E"];
 if(!name)return["#c3c9db","?"];
 return["#5b6478",(name.trim()[0]||"?").toUpperCase()]};
const card=(p,i)=>{const st=pst(p),who=p.student||"";
 const app=p.status&&p.status.info&&p.status.info.activeApp||"";
 const[bg,ltr]=APP_BADGE(app);
 const th=p.online?`<div class="ph appph"><span class="appbadge" style="background:${bg}">${esc(ltr)}</span><b>${esc(who||p.name)}</b><small>${app?esc(app):"Proqram gözlənilir…"}</small></div>`:`<div class="ph"><b>${esc(who||p.name)}</b><small>Oflayn</small></div>`;
 return `<div class="pc" style="--i:${i}" role="button" tabindex="0" data-a="sel" data-id="${esc(p.id)}"><div class="th ${p.online?"":"off"}">${th}${ovl(p)}</div><div class="ft"><i class="d ${dot(st)}"></i><span>${esc(p.name)}${who&&UI.showStudent?` · ${esc(who)}`:""}</span><button data-a="ctl" data-id="${esc(p.id)}" aria-label="${esc(p.name)} idarəsi">${I("ctl")}</button></div></div>`};
const empty=()=>`<div class="pn" style="max-width:720px;margin:6vh auto;text-align:center"><h3>Hələ heç bir kompüter qoşulmayıb</h3><p class="mu">Şagird kompüterlərində DeX-i açıb <b>Şagird</b> seçin və sinif kodunu yazın:</p><div class="big" style="font-size:54px;margin:10px 0">${esc(S.class.code)}</div><p class="mu">Qoşulan kompüter bu səhifədə 1–2 saniyə ərzində görünəcək. Siyahıda yalnız həqiqətən qoşulmuş kompüterlər olur.</p></div>`;
const V={
esas:()=>{let A=S.pcs.slice();const rk=p=>({ok:0,wa:1,in:2})[pst(p)];if(UI.hideOff)A=A.filter(p=>p.online);
 if(UI.sort==="name")A.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));else if(UI.sort==="status")A.sort((a,b)=>rk(a)-rk(b)||a.name.localeCompare(b.name,undefined,{numeric:true}));
 return S.pcs.length?(A.length?`<div class="grid">${A.map(card).join("")}</div>`:'<div class="pn"><p class="mu" style="margin:0">Oflayn kompüterlər gizlədilib və hazırda onlayn kompüter yoxdur.</p></div>'):empty()},
ders:()=>{const on=S.pcs.filter(p=>p.online).length,link=location.origin+"/panel?c="+encodeURIComponent(S.class.code)+"&t="+encodeURIComponent(CRED.t);
 const wpArr=(S.settings.weekPlan&&S.settings.weekPlan[CALDAY])||S.class.schedule.map(x=>!!x.on);
 const calSec=`<section class="pn wide"><h3>Təqvim — xüsusi günlər</h3><p class="mu" style="margin-top:0">Bir gün seç, sonra o gün keçiləcək dərsləri işarələ. Toxunulmayan günlər adi cədvəllə işləyir.</p><div class="row" style="flex-wrap:wrap">${[1,2,3,4,5,6,7].map(d=>`<button class="bt ${d===CALDAY?"pr":""}" data-a="calday" data-i="${d}">${DAYLABEL[d]}</button>`).join("")}</div><p class="mu" style="margin:14px 0 6px"><b>${DAYFULL[CALDAY]}</b> üçün dərslər</p>${S.class.schedule.map((l,i)=>`<div class="li"><button class="tg ${wpArr[i]?"on":""}" data-a="calt" data-i="${i}" aria-label="${ord(l.n)} dərs"></button><span class="sp">${ord(l.n)} dərs <span class="mu">${esc(l.start)}–${esc(l.end)}</span></span></div>`).join("")}</section>`;
 return `<div class="two"><section class="pn wide"><h3>Sinif ${esc(S.class.name)}</h3><p class="mu" style="margin-top:0">Şagirdlər bu kodla qoşulur</p><div class="row"><span class="big" style="font-size:44px">${esc(S.class.code)}</span><button class="bt" data-a="cp">${I("copy")} Kopyala</button></div><p class="mu" style="margin:14px 0 6px">Müəllim açarı (heç kimə vermə)</p><div class="row"><input class="in" id="tk" readonly value="${esc(CRED.t)}" onclick="this.select()"><button class="bt" data-a="ck">${I("copy")} Kopyala</button><button class="bt" data-a="cl">Giriş linkini kopyala</button></div><p class="mu">Qoşulub: <b>${on}</b> / ${S.pcs.length} kompüter</p></section>${calSec}<section class="pn wide"><h3>Sinif idarəsi</h3><div class="row"><button class="bt" data-a="lockall">${I("lock")} Hamısını kilidlə</button><button class="bt" data-a="unlockall">Kilidləri aç</button><button class="bt pr" data-a="bc">${I("msg")} Mesaj yay</button><button class="bt" data-a="closeall">Proqramları bağla</button><button class="bt rd" data-a="rsall">Hamısını yenidən başlat</button><button class="bt rd" data-a="sdall">Hamısını söndür</button></div></section><section class="pn wide"><h3>Dərs planı</h3>${S.settings.tasks.map((t,i)=>`<div class="li"><button class="tg ${t.d?"on":""}" data-a="td" data-i="${i}" aria-label="Tamamlandı"></button><span class="sp" style="${t.d?"opacity:.55;text-decoration:line-through":""}">${esc(t.t)}</span><button class="ib2" data-a="tx" data-i="${i}" aria-label="Sil">${I("trash")}</button></div>`).join("")||'<p class="mu">Plan boşdur. Aşağıdan ilk addımı əlavə edin.</p>'}<div class="row" style="margin-top:12px"><input class="in" id="ni" placeholder="Yeni addım yazın" maxlength="80"><button class="bt pr" data-a="ta">Əlavə et</button></div></section></div>`},
qeyd:()=>{const qs=S.questions,notes=(S.settings.notes||"").trim();
 return `<div class="two"><section class="pn wide"><h3>Şagird sualları</h3>${qs.map(q=>`<div class="li" style="align-items:flex-start;flex-direction:column;gap:6px"><div><b>${esc(q.from)}</b> <span class="pill">${hm(q.at)}</span></div><div>${esc(q.text)}</div>${q.image?`<span class="mu">(ekran şəkli əlavə olunub)</span>`:""}${q.answer?`<div class="ans"><b>Cavab:</b> ${esc(q.answer.text)}</div>`:`<div class="row" style="width:100%"><input class="in" id="qa-${esc(q.id)}" placeholder="Cavab yaz…" maxlength="500"><button class="bt pr" data-a="qa" data-id="${esc(q.id)}">Cavabla</button></div>`}</div>`).join("")||'<p class="mu">Hələ şagird sualı yoxdur.</p>'}</section>
<section class="pn wide"><h3>Ekran qeydi</h3><p class="mu" style="margin-top:0">Ekranını (və ya kameranı) bu kompüterdə qeyd et. Fayl birbaşa öz kompüterinə enir, serverə getmir.</p><div class="row">${RECSTATE?`<button class="bt rd" data-a="recstop">${I("rec")} Qeydi bitir və endir</button>`:`<button class="bt pr" data-a="recstart" data-k="screen">${I("rec")} Ekranı qeyd et</button><button class="bt" data-a="recstart" data-k="camera">Kamera ilə qeyd et</button>`}</div>${RECSTATE?`<p class="mu" style="margin-top:10px">● Qeyd gedir (${RECSTATE==="screen"?"ekran":"kamera"})…</p>`:""}</section>
<section class="pn wide"><h3>Notlar</h3><p class="mu" style="margin-top:0">Not üçün ayrılmış yer.</p><div class="noteboard">${notes?`<div class="note has">${esc(notes)}</div>`:""}<div class="note">Boş not yeri</div><div class="note">Boş not yeri</div>${notes?"":'<div class="note">Boş not yeri</div>'}</div></section></div>`},
tehlukesizlik:()=>{const s=S.settings,on=!!s.safeMode,[c,n]=secCount();
 const ev=S.logs.filter(l=>["əmr","icazə","proqram","yükləmə","sistem","dərs"].includes(l.type)).slice(0,40);
 const grp=(g,gi)=>`<section class="pn grp"><h3>${g[0]}<span class="cnt" data-g="${gi}">${g[2].filter(([k])=>prot(k)).length}/${g[2].length}</span></h3>${g[2].map(([k,t,d])=>`<div class="opt"><div class="tx"><b>${t}</b><small>${d}</small></div><button class="tg ${val(k)?"on":""}" data-a="op" data-k="${k}" aria-label="${esc(t)}"></button></div>`).join("")}</section>`;
 return `<div class="two"><section style="grid-column:1/-1"><div class="secbtn ${on?"on":""} ${SECOPEN?"open":""}" id="secbtn" data-a="secopen" role="button" tabindex="0" aria-expanded="${SECOPEN}"><div class="sh"><svg viewBox="0 0 24 24"><path d="M12 2.8l7.5 2.8v6c0 4.7-3.1 8.1-7.5 9.6-4.4-1.5-7.5-4.9-7.5-9.6v-6z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.8"/></svg></div><div class="tt"><b>Təhlükəsizlik rejimi</b><span id="secsub">${on?"AKTİV":"BAĞLI"} · ${c}/${n} qoruma seçimi açıqdır</span></div><button class="tg ${on?"on":""}" data-a="secm" aria-label="Təhlükəsizlik rejimini aç / bağla"></button><i class="chev"></i></div>
 <div class="secpanel ${SECOPEN?"open":""}" id="secpanel"><div class="inner"><div class="row" style="margin:2px 0 14px"><button class="bt" data-a="secall" data-k="1">Hamısını aç</button><button class="bt" data-a="secall" data-k="0">Hamısını bağla</button><span class="mu" id="seccnt">${c} / ${n} seçim açıq</span><span class="mu" style="margin-left:auto">Rejim bağlıdırsa, aşağıdakı seçimlər şagird kompüterlərində tətbiq olunmur.</span></div><div class="secgrid">${SECG.map(grp).join("")}</div></div></div></section>
 <section class="pn"><h3>Bloklanmış saytlar</h3>${s.sites.map((x,i)=>`<div class="li"><span class="sp">${esc(x)}</span><button class="ib2" data-a="sx" data-i="${i}" aria-label="Sil">${I("x")}</button></div>`).join("")||'<p class="mu">Bloklanmış sayt yoxdur.</p>'}<div class="row" style="margin-top:12px"><input class="in" id="si" placeholder="məsələn: site.com" maxlength="60"><button class="bt pr" data-a="sa">Blokla</button></div></section>
 <section class="pn"><h3>Sürətli əmrlər</h3><p class="mu" style="margin-top:0">Bütün sinfə dərhal tətbiq olunur.</p><div class="row"><button class="bt" data-a="lockall">${I("lock")} Hamısını kilidlə</button><button class="bt" data-a="unlockall">Kilidləri aç</button><button class="bt" data-a="closeall">Proqramları bağla</button></div></section>
 <section class="pn wide"><h3>Hadisələr</h3><p class="mu" style="margin-top:0">Sinifdə baş verən əməliyyatlar — ən yenisi üstdə.</p>${ev.map(l=>`<div class="li" style="flex-wrap:wrap">${typePill(l.type)}<span class="pill">${dhm(l.at)}</span><span class="sp">${l.pcName?`<b>${esc(l.pcName)}</b>${l.user?` · ${esc(l.user)}`:""} — `:""}${esc(l.text)}</span></div>`).join("")||'<p class="mu">Hələ hadisə yoxdur.</p>'}</section></div>`},
tetbiq:()=>{const s=S.settings,ex=Object.keys(s.extraApps||{});return `<div class="pn"><h3>Tətbiq icazələri</h3><p class="mu" style="margin-top:0">Bloklanan proqram şagird kompüterində açılan kimi bağlanır. “Hamısında bağla” hazırda açıq olanları da bağlayır.</p>${Object.keys(s.apps).map(a=>`<div class="li"><span class="sp"><b>${esc(a)}</b><div class="mu">${s.apps[a]?"İcazə verilib":"Bloklanıb"}</div></span><button class="bt" data-a="ac" data-k="${esc(a)}">Hamısında bağla</button><button class="tg ${s.apps[a]?"on":""}" data-a="ta2" data-k="${esc(a)}" aria-label="${esc(a)}"></button></div>`).join("")}${ex.map(a=>`<div class="li"><span class="sp"><b>${esc(a)}</b><div class="mu">${s.extraApps[a]?"İcazə verilib":"Bloklanıb"}</div></span><button class="bt" data-a="ac2" data-k="${esc(a)}">Hamısında bağla</button><button class="tg ${s.extraApps[a]?"on":""}" data-a="ta3" data-k="${esc(a)}" aria-label="${esc(a)}"></button><button class="ib2" data-a="xa" data-k="${esc(a)}" aria-label="Sil">${I("x")}</button></div>`).join("")}<div class="row" style="margin-top:12px"><input class="in" id="xa" placeholder="başqa proqram: məsələn game.exe" maxlength="60"><button class="bt pr" data-a="aa">Əlavə et (blokla)</button></div></div>`},
param:()=>`<div class="tabs" id="ptabs">${PTABS.map(([id,t])=>`<button class="${id===PTAB?"on":""}" data-a="ptab" data-k="${id}">${t}</button>`).join("")}</div><div class="tabbody" id="tabbody">${ptabHtml(PTAB)}</div>`};

// ── Parametrlər: seçim qurucuları və tablar ───────────────────────────────────
const PTABS=[["gorunus","Görünüş"],["bildiris","Bildirişlər"],["ekran","Canlı ekran"],["ders","Dərs qaydaları"],["ai","AI və açarlar"],["hesab","Hesab"]];
let PTAB="gorunus",SECOPEN=false,TRON=false,TR=0,PEND=0,CURK=null,FIRSTR=true;
const TOPK=["safeMode","allowExe","webBlock"];
const val=k=>TOPK.includes(k)?!!S.settings[k]:!!(S.settings.opts&&S.settings.opts[k]);
const prot=k=>k==="allowExe"?!val(k):val(k);
const SECG=[
 ["Sistem və klaviatura","",[["blockTaskMgr","Tapşırıq meneceri bloku","Ctrl+Shift+Esc ilə açılmır"],["blockCmd","CMD və PowerShell bloku","Əmr sətri proqramları açılmır"],["blockRegedit","Registr redaktoru bloku","regedit açılmır"],["blockSettingsApp","Windows Parametrləri və İdarəetmə paneli","Sistem ayarlarını dəyişmək olmur"],["blockWallpaper","Divar kağızı və görünüş ayarları bloku","Fon, siçan ölçüsü, kontrast ayarları — sağ-klikdən də dəyişmir"],["blockPrtSc","Ekran görüntüsü düyməsi (PrtSc) bloku","Şagird ekranı şəkilə ala bilmir"],["lockIdle","5 dəq. hərəkətsizlikdə avtomatik kilid","Unudulmuş açıq ekranlar üçün"]]],
 ["Proqramlar və yükləmə","",[["allowExe",".exe / .msi yükləməyə icazə ver","Açıq olsa, şagird belə faylları yükləyə bilər"],["blockInstall","Proqram quraşdırılmasını blokla","Yeni proqram qurmaq olmur"],["blockUsb","USB yaddaş qurğularını blokla","Fləş-disklər işləmir"],["blockDownloads","Brauzer yükləmələrini blokla","Heç bir fayl endirilmir"],["blockVpn","VPN və proksi proqramlarını blokla","Bloklanmış saytlara yan yol olmasın"],["blockGames","Oyun platformalarını avtomatik blokla","Steam, Epic və s."]]],
 ["İnternet","",[["webBlock","Qadağan olunmuş saytları blokla","DeX Browser-də işləyir"],["safeSearch","Təhlükəsiz axtarış (SafeSearch)","Axtarışda uyğunsuz nəticələr süzülür"],["blockSocial","Sosial şəbəkələri blokla","Instagram, TikTok, Facebook və s."],["blockVideo","Video saytlarını dərs zamanı blokla","YouTube və analoqları"],["blockChatSites","Söhbət və mesajlaşma saytlarını blokla","Dərs zamanı yazışma olmasın"],["httpsOnly","Yalnız HTTPS saytlara icazə ver","Şifrəsiz saytlar açılmır"]]],
 ["Ekran və məxfilik","",[["blockCamera","Kamera bloku","Şagird kompüterində kamera bağlı"],["blockMic","Mikrofon bloku","Mikrofon bağlı"],["blurOnLock","Kilid zamanı ekranı bulanıqlaşdır","Kilidli ekranda məzmun görünmür"],["watchNotice","Şagirdə ekranın izləndiyini göstər","Şəffaflıq bildirişi"],["maskPass","Parol sahələrini ekran şəklində gizlət","Müəllim parolları görmür"]]],
 ["Bildiriş və jurnal","",[["alertBlocked","Bloklanmış hərəkət cəhdində xəbər ver","Müəllimə bildiriş düşür"],["alertUsb","USB taxılanda xəbər ver","Yeni qurğu qoşulanda"],["logAll","Bütün hadisələri jurnala yaz","Hadisələr siyahısında görünür"],["soundAlert","Səsli xəbərdarlıq","Bildiriş gələndə səs çıxar"]]]
];
function secCount(){let c=0,n=0;SECG.forEach(g=>g[2].forEach(([k])=>{n++;if(prot(k))c++}));return[c,n]}
function secUpdate(){if(!S)return;const[c,n]=secCount(),on=!!S.settings.safeMode;
 const sb=$("#secsub");if(sb)sb.textContent=(on?"AKTİV":"BAĞLI")+" · "+c+"/"+n+" qoruma seçimi açıqdır";
 const sc=$("#seccnt");if(sc)sc.textContent=c+" / "+n+" seçim açıq";
 const b=$("#secbtn");if(b)b.classList.toggle("on",on);
 document.querySelectorAll(".grp .cnt").forEach(el=>{const g=SECG[+el.dataset.g];el.textContent=g[2].filter(([k])=>prot(k)).length+"/"+g[2].length})}
const nowKey=()=>{const h=(location.hash||"#esas").slice(1),k=V[h]?h:"esas";return k+viewSig(k)};
const oT=(sc,k,t,d)=>{const v=sc==="u"?!!UI[k]:!!S.settings.opts[k];return `<div class="opt"><div class="tx"><b>${t}</b>${d?`<small>${d}</small>`:""}</div><button class="tg ${v?"on":""}" data-a="${sc==="u"?"ui":"op"}" data-k="${k}" aria-label="${esc(t)}"></button></div>`};
const oS=(k,t,d,vals)=>`<div class="opt"><div class="tx"><b>${t}</b>${d?`<small>${d}</small>`:""}</div><div class="seg">${vals.map(([v,l])=>`<button class="${String(UI[k])===String(v)?"on":""}" data-a="uiv" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div></div>`;
const oR=(k,t,d,mn,mx)=>`<div class="opt"><div class="tx"><b>${t}</b><small>${d}</small></div><input type="range" min="${mn}" max="${mx}" value="${UI[k]}" data-k="${k}" aria-label="${esc(t)}"><span class="pill" id="rv-${k}">${UI[k]}</span></div>`;
const THEMES=[["blue","#2f6cff","Neon mavi"],["ice","#18b6ff","Buz"],["violet","#8a5bff","Bənövşəyi"],["green","#14d98c","Yaşıl"],["red","#ff3d63","Qırmızı"]];
function ptabHtml(id){const s=S.settings;
 if(id==="gorunus")return `<div class="two">
  <section class="pn"><h3>Animasiya və keçidlər</h3>${oT("u","anim","Animasiyalar","Bütün hərəkətləri aç / bağla")}${oT("u","mblur","Hərəkət bulanıqlığı (motion blur)","Səhifə keçidində sürüşmə + bulanıqlıq")}${oS("tspeed","Keçid sürəti","",[["f","Sürətli"],["n","Normal"],["s","Yavaş"]])}${oT("u","bgfx","Fon effektləri","Neon xətlər və halqa animasiyası")}${oT("u","hover3d","Kartların qalxma effekti","Üzərinə gələndə yüngül qalxır")}${oT("u","dotAnim","Status nöqtəsi animasiyası","Aktiv / kilidli nöqtələr nəbz vurur")}${oT("u","scan","Canlı ekranda skan xətti","Ekran şəkli üzərində gəzən işıq")}${oT("u","sound","Səs effektləri","Düymə və keçid səsləri")}</section>
  <section class="pn"><h3>Rəng və işıq</h3><div class="opt"><div class="tx"><b>Tema rəngi</b><small>Bütün neon parıltı bu rəngdə olur</small></div><div class="sw" style="margin:0">${THEMES.map(([v,c,t])=>`<button style="background:${c};color:${c}" class="${UI.theme===v?"on":""}" data-a="uiv" data-k="theme" data-v="${v}" title="${t}" aria-label="${t}"></button>`).join("")}</div></div>${oR("glow","Neon parıltı gücü","Kənar və xətlərin parlaqlığı",0,100)}${oT("u","glass","Şüşə (blur) effekti","Panellərin arxası bulanıq görünür")}${oS("font","Yazı ölçüsü","",[["s","Kiçik"],["m","Normal"],["l","Böyük"]])}${oS("rad","Künc yumruluğu","",[["sharp","Düz"],["n","Normal"],["round","Çox"]])}</section>
  <section class="pn wide"><h3>Düzən</h3>${oT("u","compact","Kompakt rejim","Boşluqlar azalır, daha çox məlumat sığır")}${oT("u","labels","Menyu yazıları həmişə görünsün","Üst paneldə ikonların adı")}${oS("cols","Kompüter kartı sütunları","Əsas paneldə yan-yana neçə kart",[["3","3"],["4","4"],["5","5"],["6","6"]])}</section></div>`;
 if(id==="bildiris")return `<div class="two">
  <section class="pn"><h3>Hadisə bildirişləri</h3>${oT("u","nJoin","Şagird sinfə qoşulanda","")}${oT("u","nOff","Kompüter oflayn olanda","")}${oT("u","nQ","Yeni şagird sualı gələndə","")}</section>
  <section class="pn"><h3>Səs və göstərmə</h3>${oT("u","nSound","Bildiriş səsi","Yeni bildirişdə qısa səs")}${oT("u","nBrowser","Brauzer bildirişləri","Səhifə arxada olanda sistem bildirişi")}${oT("u","bellShake","Zəng ikonası titrəsin","Oxunmamış bildiriş olanda")}${oS("toastT","Mesaj göstərmə müddəti","Ekran altındakı qısa mesajlar",[["2","2 san"],["3","3 san"],["5","5 san"],["8","8 san"]])}<div class="row" style="margin-top:14px"><button class="bt" data-a="ntest">Sınaq bildirişi göndər</button></div></section></div>`;
 if(id==="ekran")return `<div class="two"><section class="pn wide"><h3>Canlı ekran və kartlar</h3>${oS("poll","Yenilənmə tezliyi","Az olsa, server limiti daha az işlənir",[["1","1 san"],["2","2 san"],["4","4 san"],["8","8 san"]])}${oT("u","showStudent","Şagird adını kartda göstər","")}${oT("u","hideOff","Oflayn kompüterləri gizlət","")}${oS("sort","Kartların sırası","",[["def","Qoşulma"],["name","Ad"],["status","Status"]])}</section></div>`;
 if(id==="ders")return `<div class="two"><p class="mu wide" style="grid-column:1/-1;margin:0">Bu seçimlər sinfin bütün kompüterlərinə göndərilir.</p>
  <section class="pn"><h3>Dərs avtomatikası</h3>${oT("s","autoLockStart","Dərs başlayanda ekranları avtomatik kilidlə","")}${oT("s","autoUnlockEnd","Dərs bitəndə kilidləri avtomatik aç","")}${oT("s","warn5","Dərsin bitməsinə 5 dəq. qalmış xəbərdarlıq","")}${oT("s","breakRelease","Tənəffüsdə məhdudiyyətləri götür","")}${oT("s","closeAppsEnd","Dərs bitəndə proqramları bağla","")}</section>
  <section class="pn"><h3>Şagird imkanları</h3>${oT("s","allowQuestions","Şagird sual göndərə bilsin","")}${oT("s","showTeacherMsgs","Müəllim mesajları şagirdə göstərilsin","")}${oT("s","showTimer","Şagirdə dərs taymeri göstərilsin","")}${oT("s","approveJoin","Qoşulmaq üçün təsdiq tələb et","Yeni kompüter siyahıya düşməzdən əvvəl")}${oT("s","onlyDexBrowser","Dərs zamanı yalnız DeX Browser","")}</section></div>`;
 if(id==="ai"){const keys=PROVS.map(([k,t])=>{const kk=s.keys[k]||{};return `<div class="li" style="flex-wrap:wrap"><span class="sp" style="min-width:210px"><b>${t}</b><div class="mu">${kk.set?`təyin olunub · …${esc(kk.tail)}`:"açar yoxdur"}</div></span><input class="in" type="password" id="k-${k}" placeholder="${kk.set?"yeni açar yazsan əvəz olunur":"açarı bura yapışdır"}" autocomplete="off"><button class="bt pr" data-a="ks" data-k="${k}">Saxla</button>${kk.set?`<button class="bt" data-a="kc" data-k="${k}">Sil</button>`:""}</div>`}).join("");
  const asg=s.models.map((m,i)=>`<div class="li"><span class="sp"><b>${({class:"Sinif",student:"Şagird",computer:"Kompüter",global:"Hamı"})[m.scope]||m.scope}</b> <span class="mu">${esc(labelOf(m.scope,m.target))} → ${esc(m.model)}</span></span><button class="ib2" data-a="mx" data-i="${i}" aria-label="Sil">${I("x")}</button></div>`).join("")||'<p class="mu">Təyinat yoxdur: kompüterdəki ümumi model işlədilir.</p>';
  return `<div class="two"><section class="pn wide"><h3>AI icazələri</h3>${oT("s","aiAllowed","Şagirdlər AI köməkçidən istifadə edə bilsin","")}${oT("s","aiImages","AI ekran şəkli təhlilinə icazə","")}</section><section class="pn wide"><h3>API açarları</h3><p class="mu" style="margin-top:0">Burada yazılan açarlar sinifdəki bütün şagird kompüterlərinə avtomatik göndərilir; hər kompüterdə ayrıca yazmaq lazım deyil.</p>${keys}</section><section class="pn wide"><h3>Modellər (süni intellekt)</h3><p class="mu" style="margin-top:0">Model söhbətdə seçilmir, burada təyin olunur. Ən dəqiq təyinat qalib gəlir: kompüter → şagird → sinif → hamı.</p>${asg}<div class="row" style="margin-top:12px"><select class="in" id="ms">${[["class","Bütün sinif"],["student","Bir şagird"],["computer","Bir kompüter"],["global","Hamı üçün"]].map(([v,t])=>`<option value="${v}">${t}</option>`).join("")}</select><select class="in" id="mt"></select><input class="in" id="mm" list="mlist" placeholder="model" value="${esc(MODELS[0]?MODELS[0][0]:"")}"><datalist id="mlist">${MODELS.map(([id,l])=>`<option value="${esc(id)}">${esc(l)}</option>`).join("")}</datalist><button class="bt pr" data-a="ma">Təyin et</button></div></section></div>`}
 return `<div class="two"><section class="pn"><h3>Profil</h3><label class="mu">Adınız</label><div class="row" style="margin:6px 0 10px"><input class="in" id="pn" value="${esc(s.teacherName)}" maxlength="24"><button class="bt pr" data-a="ps">Yadda saxla</button></div><label class="mu">Sinif</label><div class="row" style="margin:6px 0 10px"><input class="in" id="cn" value="${esc(S.class.name)}" maxlength="40"><button class="bt pr" data-a="cs">Saxla</button></div><p class="mu">Kod: <b>${esc(S.class.code)}</b></p></section><section class="pn"><h3>Hesab və qabaqcıl</h3><p class="mu" style="margin-top:0">Müəllim açarı <b>Dərs idarəetməsi</b> səhifəsində, sinif kodunun altındadır.</p><div class="row"><button class="bt" data-a="cl">Giriş linkini kopyala</button><button class="bt rd" data-a="lo">Çıxış</button></div></section><section class="pn wide"><h3>Kompüterlər</h3>${S.pcs.map(p=>`<div class="li"><i class="d ${dot(pst(p))}"></i><span class="sp"><b>${esc(p.name)}</b> <span class="mu">${esc(p.student||"—")} · ${p.online?"qoşulub":"oflayn, son: "+hm(p.lastSeen)}</span></span><button class="bt" data-a="fg" data-id="${esc(p.id)}">Siyahıdan sil</button></div>`).join("")||'<p class="mu">Hələ kompüter qoşulmayıb.</p>'}</section></div>`}

function labelOf(scope,target){if(scope==="class")return S.class.name;if(scope==="global")return "hamı";
 if(scope==="computer"){const p=S.pcs.find(x=>x.id===target);return p?p.name:target}
 const p=S.pcs.find(x=>x.studentId===target);return p?p.student:target}
function fillTargets(){const sc=$("#ms"),t=$("#mt");if(!sc||!t)return;const v=sc.value;let o=[];
 if(v==="class")o=[[S.class.code,S.class.name]];else if(v==="global")o=[["*","Bütün proqramlar"]];
 else if(v==="computer")o=S.pcs.map(p=>[p.id,p.name]);else o=S.pcs.filter(p=>p.studentId).map(p=>[p.studentId,p.student]);
 t.innerHTML=o.map(([a,b])=>`<option value="${esc(a)}">${esc(b)}</option>`).join("")||'<option value="">(kompüter yoxdur)</option>'}

const HERO={esas:["Salam, {n}!","Dərslərimizə nəzarət etmək üçün bütün alətlər burada."],ders:["Dərs idarəetməsi","Giriş məlumatları, təqvim və sinif idarəsi."],qeyd:["Qeydlər","Şagird sualları, ekran qeydi və notlar."],tehlukesizlik:["Təhlükəsizlik","Qoruma rejimi, bloklanmış saytlar və hadisələr."],tetbiq:["Tətbiq nəzarəti","Şagird kompüterlərində hansı proqramların açıla biləcəyini seç."],param:["Parametrlər","Windows idarə mərkəzi: sistem, şəbəkə, təhlükəsizlik, görünüş."]};
function hero(k){let[t,p]=HERO[k];let x="";try{if(k==="esas"&&WS.o.greet)t=WS.o.greet}catch(e){}
 if(k==="esas"&&S){const c={ok:0,wa:0,in:0};S.pcs.forEach(q=>c[pst(q)]++);x=`<div class="chips"><span class="chip"><i></i>Aktiv ${c.ok}</span><span class="chip"><i class="w"></i>Kilidli ${c.wa}</span><span class="chip"><i class="b"></i>Oflayn ${c.in}</span><span class="chip">Dərs: <b id="lt">--:--</b></span></div>`}
 return `<div class="hero"><h1${k==="esas"?' id="hi"':""}>${esc(t.replace("{n}",S?S.settings.teacherName:""))}</h1>${x}</div>`}
function buildNav(){$("#nav").innerHTML=NAV.map(([id,ic,t])=>`<a class="ni" href="#${id}" data-r="${id}" aria-label="${t}">${NS[ic]}<span class="lb">${t}</span></a>`).join("")+`<i class="ind top"></i><i class="ind"></i><i class="sep"></i><button class="ni" id="clkb" data-p="clkp" aria-label="Saat">${NS.clock}<span class="lb">Saat</span></button><button class="ni" id="sunb" data-p="sunp" aria-label="Görünüş">${NS.sun}<span class="lb">Görünüş</span></button><button class="ni" id="bell" data-p="nt" aria-label="Bildirişlər"></button>`}
function moveInd(k){const a=document.querySelector(`#nav a[data-r="${k}"]`);if(!a)return;const l=a.offsetLeft+a.offsetWidth/2-18;
 document.querySelectorAll(".ind").forEach(i=>{i.style.left=l+"px";i.style.width="36px";i.classList.add("mov");clearTimeout(i._t);i._t=setTimeout(()=>i.classList.remove("mov"),500)})}
function nav(){const h=(location.hash||"#esas").slice(1),k=V[h]?h:"esas";CURK=k;document.querySelectorAll("#nav a.ni").forEach(a=>a.classList.toggle("on",a.dataset.r===k));moveInd(k);return k}
let lastSig="";
function viewSig(k){if(!S)return"";const pcs=S.pcs.map(p=>[p.id,p.name,p.student,p.online,p.lock,p.hasShot]);
 if(k==="esas")return JSON.stringify([pcs,S.class.code,S.settings.teacherName,UI.shots,UI.showStudent,UI.hideOff,UI.sort]);
 if(k==="ders")return JSON.stringify([pcs,S.class,S.lesson.released,S.settings.weekPlan,S.settings.ext,CALDAY,window.DT,Math.floor(Date.now()/60000)]);
 if(k==="qeyd")return JSON.stringify([S.questions.map(q=>[q.id,!!q.answer]),S.settings.ext,RECSTATE]);
 if(k==="param")return JSON.stringify([S.settings,S.class.name,pcs,PTAB,window.WCK,window.PSEL]);
 return JSON.stringify([S.settings,S.class.name,pcs,S.logs.length&&S.logs[0].at])}
function render(force,anim){const k=nav();if(!S)return;const sg=k+viewSig(k);if(!force&&sg===lastSig)return;lastSig=sg;if(FIRSTR){anim=true;FIRSTR=false}
 const v=$("#view"),keep=v.scrollTop;v.innerHTML=hero(k)+V[k]();v.scrollTop=keep;document.title="DeX — "+NAV.find(n=>n[0]===k)[2];
 if(k==="param")fillTargets();if(anim&&UI.anim)stagger()}
function stagger(){let i=0;document.querySelectorAll("#view .hero,#view .tabs,#view .secbtn,#view .two>.pn,#view .grid>.pc,#view>.pn").forEach(el=>{el.style.setProperty("--i",Math.min(i++,11));el.classList.add("rise1")})}
// ── Səhifə keçidi: sürüşmə + istiqamətli hərəkət bulanıqlığı (SVG feGaussianBlur) ──
const TD=()=>({f:.6,n:1,s:1.6})[UI.tspeed]||1;
const mbl=px=>{const g=$("#mbg");if(g)g.setAttribute("stdDeviation",px.toFixed(1)+" 0")};
function tw(dur,fn){return new Promise(res=>{const t0=performance.now();(function f(now){const t=Math.min(1,(now-t0)/dur);fn(t);t<1?requestAnimationFrame(f):res()})(t0)})}
async function swapPage(dir){const v=$("#view");if(window.sfx)sfx("whoosh");if(!UI.anim){render(true);return}
 const my=++TR,bl=!!UI.mblur,D=TD();TRON=true;
 try{
  await tw(210*D,t=>{const e=t*t;v.style.transform=`translateX(${-dir*e*120}px) scale(${1-e*.025})`;v.style.opacity=1-e*.94;if(bl){v.style.filter="url(#mb)";mbl(e*36)}});
  if(my!==TR)return;
  v.scrollTop=0;lastSig="";render(true,true);
  await tw(440*D,t=>{const e=1-Math.pow(1-t,3),r=1-e;v.style.transform=`translateX(${dir*r*160}px) scale(${1-r*.025})`;v.style.opacity=Math.min(1,e*1.7);if(bl){v.style.filter="url(#mb)";mbl(r*36)}});
 }finally{if(my===TR){v.style.transform="";v.style.opacity="";v.style.filter="";mbl(0);TRON=false}}}
async function ptabGo(id){if(id===PTAB)return;const o=PTABS.map(x=>x[0]),dir=o.indexOf(id)>o.indexOf(PTAB)?1:-1;PTAB=id;
 document.querySelectorAll("#ptabs button").forEach(b=>b.classList.toggle("on",b.dataset.k===id));const b=$("#tabbody");if(!b)return;lastSig=nowKey();
 const D=TD();if(UI.anim&&UI.mblur){const a=b.animate([{opacity:1,transform:"none",filter:"blur(0px)"},{opacity:0,transform:`translateX(${-dir*50}px)`,filter:"blur(14px)"}],{duration:170*D,easing:"ease-in",fill:"forwards"});try{await a.finished}catch(e){}b.innerHTML=ptabHtml(id);a.cancel();b.animate([{opacity:0,transform:`translateX(${dir*60}px)`,filter:"blur(14px)"},{opacity:1,transform:"none",filter:"blur(0px)"}],{duration:380*D,easing:"cubic-bezier(.2,.9,.25,1)"})}
 else b.innerHTML=ptabHtml(id);
 fillTargets()}
function nsave(){try{localStorage.setItem("dexN",JSON.stringify(N.slice(0,30)))}catch(e){}}
function bell(){const u=N.filter(n=>n.u).length,b=$("#bell");if(!b)return;b.classList.toggle("has",u>0);b.innerHTML=NS.bell+`<span class="lb">Bildirişlər</span>`+(u?`<span class="nb">${u>99?"99+":u}</span>`:"");
 const ic={join:"🟢",off:"🔴",q:"❓",sys:"⚙️",task:"⏰"};
 $("#nt").innerHTML=`<h4 style="display:flex;align-items:center;gap:8px">Bildirişlər<span style="flex:1"></span>${N.length?'<button class="bt" data-a="nclr" style="padding:2px 10px;font-size:.85rem">Təmizlə</button>':""}</h4>`+(N.map((n,i)=>`<div class="n ${n.u?"u":""}" ${n.go?`data-a="ngo" data-i="${i}" style="cursor:pointer"`:""}>${ic[n.k]||"🔔"} ${esc(n.t)}<div class="mu" style="font-size:.8rem">${n.at?pad(new Date(n.at).getHours())+":"+pad(new Date(n.at).getMinutes()):""}</div></div>`).join("")||'<div class="n">Hələ bildiriş yoxdur</div>');nsave()}
const notify=(t,o)=>{o=o||{};const now=Date.now();if(N[0]&&N[0].t===t&&now-(N[0].at||0)<4000)return;N.unshift({t,u:1,at:now,k:o.k,go:o.go});N=N.slice(0,30);bell();
 if(UI.nSound&&window.sfx)sfx("note");if(typeof toast==="function")toast("🔔 "+t);
 if(UI.nBrowser&&window.Notification&&Notification.permission==="granted"&&(document.hidden||!document.hasFocus())){try{const n=new Notification("DeX — "+(S&&S.class?S.class.name:"panel"),{body:t,tag:"dex-"+(o.k||"n")});n.onclick=()=>{window.focus();if(o.go)location.hash="#"+o.go;n.close()}}catch(e){}}};
function clock(){const d=sdate();$("#tm0").textContent=pad(d.getHours())+":"+pad(d.getMinutes());$("#dt0").textContent=pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear();
 if(S&&$("#hi"))$("#hi").textContent="Salam, "+S.settings.teacherName+"!";const l=$("#lt"),x=S?lessonNow():{},cs=$("#clsn");if(l)l.textContent=x.running?fmt(x.secs):"--:--";
 if(cs)cs.textContent=!S?"":x.running?"Dərs davam edir · qalıb "+fmt(x.secs):x.next?"Növbəti dərs: "+x.next.start:"İndi dərs yoxdur"}

// ── Polling ───────────────────────────────────────────────────────────────────
function diffNotes(){const cur={};for(const p of S.pcs)cur[p.id]=p.online;const qs=new Set(S.questions.map(q=>q.id));
 if(seen){for(const p of S.pcs){const was=seen.pcs[p.id];if(was===undefined)UI.nJoin&&notify(`${p.student||p.name} sinfə qoşuldu`,{k:"join",go:"esas"});else if(was&&!p.online)UI.nOff&&notify(`${p.name} oflayn oldu`,{k:"off",go:"esas"});else if(!was&&p.online)UI.nJoin&&notify(`${p.name} yenidən qoşuldu`,{k:"join",go:"esas"})}
  for(const q of S.questions)if(!seen.qs.has(q.id))UI.nQ&&notify(`Yeni sual: ${q.from||q.student||q.pcName||"şagird"}${q.text?" — "+String(q.text).slice(0,60):""}`,{k:"q",go:"qeyd"})}
 seen={pcs:cur,qs}}
function shotsWanted(){return!!MID}
async function tick(){if(!CRED)return;try{const watching=!$("#mo").hidden&&MID;const st=await api("GET","/api/teacher/state?panel=1"+(shotsWanted()?"&shots=1":"")+(watching?"&watch="+encodeURIComponent(MID):""));if(!st.ok)throw 0;
  const was=offline;offline=false;$("#off").hidden=true;S=st;skew=st.now-Date.now();diffNotes();clock();
  const a=document.activeElement,typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);
  if(!typing&&$("#mo").hidden&&!TRON&&!PEND)render(was);else if(!$("#mo").hidden&&MID)refreshModal();document.querySelectorAll(".pc img.sh").forEach(i=>{const p=S.pcs.find(x=>x.id===i.dataset.id);if(p&&p.shotAt&&i.dataset.v!=String(p.shotAt)){i.dataset.v=p.shotAt;i.src=shotUrl(p.id,p.shotAt)}})
  if(watching){const p=S.pcs.find(x=>x.id===MID);if(p&&p.rtcOffer)rtcHandle(MID,p.rtcOffer)}}
 catch(e){if(e&&e.message==="auth")return;offline=true;$("#off").hidden=false}}
(function loop(){tick().finally(()=>setTimeout(loop,document.hidden?10000:(UI.poll||2)*1000))})();
setInterval(clock,1000);

// ── PC window ─────────────────────────────────────────────────────────────────
function pcModal(id){if(MID!==id)rtcStop();MID=id;const p=S.pcs.find(x=>x.id===id);if(!p)return;const st=pst(p);
 modal(`<div class="row"><h3 style="margin:0">${esc(p.name)}</h3><span class="pill">${stName[st]}</span><span class="live ${p.online?"on":""}" id="lv">${p.online?"● Canlı":"Oflayn"}</span><span class="sp"></span><button class="ib2" data-a="fs" aria-label="Tam ekran">${I("full")}</button><button class="ib2" data-a="cm" aria-label="Bağla">${I("x")}</button></div><p class="mu" style="margin:6px 0 0">Şagird: <b>${esc(p.student||"—")}</b> · son siqnal: ${hm(p.lastSeen)}</p><div class="scr" id="scr">${p.hasShot?`<img id="scrimg" class="rc" title="Siçanı idarə etmək üçün klikləyin (sağ klik = sağ klik, iki dəfə klik = iki dəfə klik)" src="${shotUrl(p.id,p.shotAt)}" alt="">`:`<div class="ph big"><b>${esc(p.student||p.name)}</b><small>${p.online?"Ekran şəkli gözlənilir…":"Kompüter oflaynd"}</small></div>`}${ovl(p)}</div><div class="row"><button class="bt" data-a="plk" data-id="${esc(id)}">${I("lock")} ${p.lock?"Kilidi aç":"Kilidlə"}</button><button class="bt" data-a="pcl" data-id="${esc(id)}">Proqramları bağla</button><button class="bt rd" data-a="prs" data-id="${esc(id)}">Yenidən başlat</button><button class="bt rd" data-a="psd" data-id="${esc(id)}">Söndür</button></div><div class="row" style="margin-top:12px"><input class="in" id="pm" placeholder="${esc(p.name)} üçün mesaj" maxlength="120"><button class="bt pr" data-a="pmg" data-id="${esc(id)}">Göndər</button></div><div class="row" style="margin-top:10px"><input class="in" id="kb" placeholder="Klaviatura: mətn yaz, Enter ilə göndər" maxlength="200"><button class="bt" data-a="kkey" data-k="enter" title="Enter">⏎</button><button class="bt" data-a="kkey" data-k="esc" title="Esc">Esc</button><button class="bt" data-a="kkey" data-k="backspace" title="Backspace">⌫</button><button class="bt" data-a="kkey" data-k="tab" title="Tab">Tab</button><button class="bt" data-a="kkey" data-k="up" title="Yuxarı">↑</button><button class="bt" data-a="kkey" data-k="down" title="Aşağı">↓</button><button class="bt" data-a="kkey" data-k="left" title="Sol">←</button><button class="bt" data-a="kkey" data-k="right" title="Sağ">→</button></div>`,"wide");
 }
function refreshModal(){const p=S.pcs.find(x=>x.id===MID);if(!p)return;const im=$("#scrimg");if(im&&p.hasShot&&im.dataset.v!=String(p.shotAt)){im.dataset.v=p.shotAt;im.src=shotUrl(p.id,p.shotAt)}const lv=$("#lv");if(lv){lv.textContent=p.online?"● Canlı":"Oflayn";lv.className="live "+(p.online?"on":"")}
 const sc=$("#scr");if(sc&&p.hasShot&&!$("#scrimg")&&!$("#scrvid")){sc.innerHTML=`<img id="scrimg" class="rc" title="Siçanı idarə etmək üçün klikləyin" src="${shotUrl(p.id,p.shotAt)}" alt="">`+ovl(p)}}
function confirmM(text,act,id){modal(`<h3>${text}</h3><div class="row" style="margin-top:14px"><button class="bt rd" data-a="${act}" data-id="${esc(id)}">Bəli</button><button class="bt" data-a="cm">Ləğv et</button></div>`)}
// Dərs başlamazdan əvvəl: bu dərsdə uşaqlar DexBrowser-da Alqoritmika/Steam-ə kilidlənsin,
// yoxsa İnformatika (sərbəst, yalnız adi təhlükəsizlik) — müəllim hər dəfə seçir.
function lessonModeModal(){
 const sq=(bg,txt,fs)=>`<span style="display:inline-flex;width:36px;height:36px;border-radius:9px;background:${bg};color:#fff;align-items:center;justify-content:center;font:700 ${fs||18}px 'Segoe UI',sans-serif;letter-spacing:-.5px">${txt}</span>`;
 modal(`<h3>Dərs hansı rejimdə başlasın?</h3><p class="mu" style="margin-top:4px">Alqoritmika/Steam seçilsə, şagirdlər dərs bitənə qədər DexBrowser-dan çıxa bilməyəcək.</p><div class="row" style="margin-top:14px;gap:10px;flex-wrap:wrap">`
 +`<button class="bt pr" data-a="lsm" data-k="algoritmika" style="flex-direction:column;gap:6px;padding:14px 18px">${sq("#8244fd","a")}Alqoritmika</button>`
 +`<button class="bt pr" data-a="lsm" data-k="steam" style="flex-direction:column;gap:6px;padding:14px 18px"><img src="data:image/png;base64,${STEAM_ICON_B64}" style="width:36px;height:36px;object-fit:contain" alt="">Steam</button>`
 +`<button class="bt" data-a="lsm" data-k="informatika" style="flex-direction:column;gap:6px;padding:14px 18px">${sq("#1a8f7a","%/%",12)}İnformatika</button>`
 +`</div><div class="row" style="margin-top:10px"><button class="bt" data-a="cm">Ləğv et</button></div>`)
}

// ── Saving ────────────────────────────────────────────────────────────────────
async function save(patch,msg){try{const r=await post("/api/teacher/settings",patch);if(r.ok){S=r;lastSig="";render(true);if(msg)toast(msg)}}catch(e){toast("Saxlanmadı, yenidən cəhd et")}}
async function cmd(pc,type,args,msg){try{const r=await post("/api/teacher/command",{pc,type,args});if(r.ok){if(msg!==null)toast(msg||`${r.sent} kompüterə göndərildi`);tick()}}catch(e){if(msg!==null)toast("Göndərilmədi, yenidən cəhd et")}}

// ── Live video (WebRTC) — only for the one PC window currently open, never the whole
// class list: the pupil's PC asks its own OS to share the screen, so this must stay
// scoped to a single, deliberate "I'm watching this one now" moment.
let RPC=null,RForPc="",RSeenOffer="";
function rtcStop(){if(RPC){try{RPC.close()}catch(e){}}RPC=null;RForPc="";RSeenOffer=""}
async function rtcHandle(pc,offerRaw){
 if(!offerRaw||pc!==MID)return;
 if(pc===RForPc&&offerRaw===RSeenOffer)return; // already answered this exact offer
 if(pc!==RForPc)rtcStop();
 RForPc=pc;RSeenOffer=offerRaw;
 try{
  const off=JSON.parse(offerRaw);
  const conn=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
  RPC=conn;
  conn.ontrack=e=>{if(RPC!==conn||MID!==pc)return;const sc=$("#scr");if(!sc)return;let v=$("#scrvid");
   if(!v){const p=S.pcs.find(x=>x.id===pc);sc.innerHTML=`<video id="scrvid" class="rc" autoplay playsinline muted title="Siçanı idarə etmək üçün klikləyin"></video>`+(p?ovl(p):"");v=$("#scrvid")}
   if(v.srcObject!==e.streams[0])v.srcObject=e.streams[0];
   // Şagird ekranını paylaşmağı dayandırdıqda (OS-un öz "Stop sharing" düyməsindən və ya
   // başqa səbəbdən) dərhal bil və köhnə kadrda donub qalma — adi ekran şəklinə qayıt.
   e.track.addEventListener("ended",()=>{if(RPC!==conn)return;rtcStop();const vv=$("#scrvid");if(vv)vv.remove();toast("Şagird ekran paylaşımını dayandırdı");lastSig="";render(true)})};
  conn.addEventListener("connectionstatechange",()=>{if(RPC===conn&&["failed","disconnected","closed"].includes(conn.connectionState)){rtcStop();const vv=$("#scrvid");if(vv)vv.remove();lastSig="";render(true)}});
  await conn.setRemoteDescription(off);
  const answer=await conn.createAnswer();
  await conn.setLocalDescription(answer);
  await new Promise(res=>{if(conn.iceGatheringState==="complete")return res();const ch=()=>{if(conn.iceGatheringState==="complete"){conn.removeEventListener("icegatheringstatechange",ch);res()}};conn.addEventListener("icegatheringstatechange",ch);setTimeout(res,2500)});
  if(RPC!==conn||pc!==MID)return;
  const ld=conn.localDescription;
  await cmd(pc,"rtcAnswer",{sdp:JSON.stringify({sdp:ld.sdp,type:ld.type})},null);
 }catch(e){console.error("[dex] rtc",e)}
}

// ── Remote mouse (click the live screen picture to control that PC) ────────────
// nx/ny are 0..1 fractions of the image, so the click lands correctly whatever
// that student's own screen resolution is (server + Rust side already expect this).
let mouseBusy=false;
function nxny(img,e){const r=img.getBoundingClientRect();return{nx:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),ny:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
async function mouseCmd(action,e){const img=e.target;if(!MID||mouseBusy)return;const{nx,ny}=nxny(img,e);mouseBusy=true;try{await cmd(MID,"mouse",{nx,ny,action},null)}finally{mouseBusy=false}}
// ── Ekran/kamera qeydi (yalnız bu brauzerdə; server heç nə görmür) ─────────────
async function recStart(kind){
 if(RECSTATE)return;
 try{PSTREAM=kind==="camera"?await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:true}):await navigator.mediaDevices.getDisplayMedia({video:true,audio:true})}
 catch(e){toast(kind==="camera"?"Kamera/mikrofon açılmadı":"Ekran qeydi başlamadı");return}
 PCHUNKS=[];
 const type=window.MediaRecorder&&MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")?"video/webm;codecs=vp9,opus":"video/webm";
 PREC=new MediaRecorder(PSTREAM,{mimeType:type,videoBitsPerSecond:1500000});
 PREC.ondataavailable=e=>{if(e.data&&e.data.size)PCHUNKS.push(e.data)};
 PREC.onstop=()=>{
  PSTREAM.getTracks().forEach(t=>t.stop());
  const blob=new Blob(PCHUNKS,{type:"video/webm"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="dex-qeyd-"+Date.now()+".webm";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
  const _k=RECSTATE,_n=a.download;PREC=null;PSTREAM=null;RECSTATE=null;noteFromRec(_k,_n);toast("Qeyd kompüterinə endirildi və notlara əlavə olundu");lastSig="";render(true)};
 const vt=PSTREAM.getVideoTracks()[0];if(vt)vt.addEventListener("ended",()=>recStop());
 PREC.start(1000);RECSTATE=kind;toast("Qeyd başladı");lastSig="";render(true)}
function recStop(){if(PREC&&PREC.state==="recording")PREC.stop()}
function readSchedule(){return S.class.schedule.map((x,i)=>{const a=document.querySelector(`.tm[data-k="start"][data-i="${i}"]`),b=document.querySelector(`.tm[data-k="end"][data-i="${i}"]`);return{...x,start:a?a.value.trim():x.start,end:b?b.value.trim():x.end}})}
const okTime=t=>/^([01]?\d|2[0-3]):[0-5]\d$/.test(t);

document.addEventListener("click",async e=>{
  const pb=e.target.closest("[data-p]");document.querySelectorAll(".pop").forEach(p=>{if(!pb||p.id!==pb.dataset.p)p.hidden=true});
  if(pb){const p=$("#"+pb.dataset.p);p.hidden=!p.hidden;beep(620);if(pb.id==="bell"&&!p.hidden){bell();if(window.Notification&&Notification.permission==="default"&&UI.nBrowser)Notification.requestPermission();setTimeout(()=>{N.forEach(x=>x.u=0);const b=$("#bell");if(b){b.classList.remove("has");const nb=b.querySelector(".nb");if(nb)nb.remove()}nsave()},1800)}return}
  if(!e.target.closest(".pop"))document.querySelectorAll(".pop").forEach(p=>p.hidden=true);
 if(e.target.id==="mo")return closeM();
 if(e.target.id==="scrimg"||e.target.id==="scrvid")return mouseCmd("click",e);
 const t=e.target.closest("button[data-a],div[data-a]");if(!t)return;
 const a=t.dataset.a,id=t.dataset.id,i=+t.dataset.i,k=t.dataset.k,s=S&&S.settings;
 if(a==="sel"){pcModal(id)}
 else if(a==="ctl"){e.stopPropagation();pcModal(id)}
 else if(a==="cm")closeM();
 else if(a==="fs"){const x=$("#scr");try{(x.requestFullscreen||x.webkitRequestFullscreen).call(x)}catch(z){toast("Tam ekran açılmadı")}}
 else if(a==="lockall")cmd("all","lock",{},"Bütün ekranlar kilidləndi");
 else if(a==="unlockall")cmd("all","unlock",{},"Kilidlər açıldı");
 else if(a==="rel")cmd("all","release",{},"Dərs məhdudiyyətləri götürüldü");
 else if(a==="closeall")cmd("all","closeApps",{},"Proqramları bağlama əmri göndərildi");
 else if(a==="rsall")confirmM("Bütün kompüterlər yenidən başladılsın?","rsall2","all");
 else if(a==="sdall")confirmM("Bütün kompüterlər söndürülsün?","sdall2","all");
 else if(a==="rsall2"){closeM();cmd("all","restart",{},"Yenidən başlatma əmri göndərildi")}
 else if(a==="sdall2"){closeM();cmd("all","shutdown",{},"Söndürmə əmri göndərildi")}
 else if(a==="bc")modal(`<h3>Bütün sinfə mesaj</h3><textarea class="in" id="bm" placeholder="Mesajınızı yazın" maxlength="200"></textarea><div class="row" style="margin-top:12px"><button class="bt pr" data-a="bs">Göndər</button><button class="bt" data-a="cm">Ləğv et</button></div>`);
 else if(a==="bs"){const v=$("#bm").value.trim();if(!v)return toast("Əvvəlcə mesaj yazın");closeM();cmd("all","message",{text:v})}
 else if(a==="plk"){const p=S.pcs.find(x=>x.id===id);await cmd(id,p&&p.lock?"unlock":"lock",{},p&&p.lock?"Kilid açıldı":"Ekran kilidləndi");closeM()}
 else if(a==="pcl"){cmd(id,"closeApps",{},"Proqramları bağlama əmri göndərildi")}
 else if(a==="prs")confirmM("Bu kompüter yenidən başladılsın? (1 saniyə sonra)","prs2",id);
 else if(a==="psd")confirmM("Bu kompüter söndürülsün?","psd2",id);
 else if(a==="prs2"){closeM();cmd(id,"restart",{},"Kompüter 1 saniyə sonra yenidən başlayır")}
 else if(a==="psd2"){closeM();cmd(id,"shutdown",{},"Kompüter söndürülür")}
 else if(a==="pmg"){chatSend(id)}
 else if(a==="kkey"){if(!MID)return;cmd(MID,"keyboard",{key:k},null)}
 else if(a==="cp"){try{navigator.clipboard.writeText(S.class.code).then(()=>toast("Kod kopyalandı"),()=>toast("Kod: "+S.class.code))}catch(x){toast("Kod: "+S.class.code)}}
 else if(a==="ck"){try{navigator.clipboard.writeText(CRED.t).then(()=>toast("Açar kopyalandı"),()=>{$("#tk").select();toast("Açarı seç və Ctrl+C bas")})}catch(x){$("#tk").select()}}
 else if(a==="cl"){const l=location.origin+"/panel?c="+encodeURIComponent(S.class.code)+"&t="+encodeURIComponent(CRED.t);try{navigator.clipboard.writeText(l).then(()=>toast("Giriş linki kopyalandı"))}catch(x){toast("Kopyalanmadı")}}
 else if(a==="sg"){const sch=readSchedule();sch[i].on=!sch[i].on;await save({schedule:sch})}
 else if(a==="ss"){const sch=readSchedule(),bad=sch.find(x=>x.on&&(!okTime(x.start)||!okTime(x.end)||toMin(x.start)>=toMin(x.end)));if(bad)return toast(`${ord(bad.n)} dərsin saatı düz deyil (məsələn 08:00 – 08:45)`);
  await save({schedule:sch.map(x=>({...x,start:pad(toMin(x.start)/60|0)+":"+pad(toMin(x.start)%60),end:pad(toMin(x.end)/60|0)+":"+pad(toMin(x.end)%60)}))},"Cədvəl saxlandı və kompüterlərə göndərildi")}
 else if(a==="calday"){CALDAY=i;lastSig="";render(true)}
 else if(a==="calt"){const base=S.class.schedule.map(x=>!!x.on);const wp={...(s.weekPlan||{})};const arr=(wp[CALDAY]||base).slice();arr[i]=!arr[i];wp[CALDAY]=arr;await save({weekPlan:wp})}
 else if(a==="recstart"){await recStart(k)}
 else if(a==="recstop"){recStop()}
 else if(a==="savenotes"){const v=$("#teacherNotes").value;await save({notes:v},"Qeydlər saxlandı")}
 else if(a==="td"){const tk=s.tasks.map(x=>({...x}));tk[i].d=tk[i].d?0:1;save({tasks:tk})}
 else if(a==="tx"){const tk=s.tasks.filter((_,j)=>j!==i);save({tasks:tk})}
 else if(a==="ta"){const v=$("#ni").value.trim();if(!v)return toast("Addımı yazın");save({tasks:[...s.tasks,{t:v,d:0}]})}
 else if(a==="qa"){const v=$("#qa-"+id).value.trim();if(!v)return toast("Cavabı yazın");const r=await post("/api/teacher/answer",{qid:id,text:v});if(r.ok){toast("Cavab göndərildi");lastSig="";tick()}}
 else if(a==="tg"){save({[k]:!s[k]},k==="safeMode"?(!s[k]?"Təhlükəsiz rejim açıldı":"Təhlükəsiz rejim bağlandı"):undefined)}
 else if(a==="sa"){let v=$("#si").value.trim().toLowerCase().replace(/^https?:\/\//,"").replace(/\/.*$/,"");if(!v||!v.includes("."))return toast("Düzgün sayt ünvanı yazın");if(s.sites.includes(v))return toast("Bu sayt artıq siyahıdadır");save({sites:[...s.sites,v]})}
 else if(a==="sx"){save({sites:s.sites.filter((_,j)=>j!==i)})}
 else if(a==="ta2"){save({apps:{[k]:s.apps[k]?0:1}})}
 else if(a==="ta3"){save({extraApps:{[k]:s.extraApps[k]?0:1}})}
 else if(a==="xa"){save({extraApps:{[k]:null}})}
 else if(a==="aa"){const v=$("#xa").value.trim();if(!/^[\w.\- ]{1,60}\.exe$/i.test(v))return toast("Proqramın adını .exe ilə yazın (game.exe)");save({extraApps:{[v]:0}},v+" bloklandı")}
 else if(a==="ac"){const names=({Word:["WINWORD.EXE"],Excel:["EXCEL.EXE"],PowerPoint:["POWERPNT.EXE"],Chrome:["chrome.exe"],"VS Code":["Code.exe"],Steam:["steam.exe","steamwebhelper.exe"],Discord:["Discord.exe"],"Hesablayıcı":["CalculatorApp.exe","calc.exe"]})[k]||[];cmd("all","closeApps",{names},k+" bütün kompüterlərdə bağlanır")}
 else if(a==="ac2"){cmd("all","closeApps",{names:[k]},k+" bütün kompüterlərdə bağlanır")}
 else if(a==="ps"){const v=$("#pn").value.trim();if(!v)return toast("Ad boş ola bilməz");save({teacherName:v},"Yadda saxlandı")}
 else if(a==="cs"){const v=$("#cn").value.trim();if(!v)return toast("Sinif adı boş ola bilməz");save({name:v},"Saxlandı")}
 else if(a==="ks"){const v=$("#k-"+k).value.trim();if(!v)return toast("Açarı yazın");save({keys:{[k]:v}},"Açar saxlandı və kompüterlərə göndərilir")}
 else if(a==="kc"){save({keys:{[k]:null}},"Açar silindi")}
 else if(a==="ma"){const m=$("#mm").value.trim(),tg=$("#mt").value,sc=$("#ms").value;if(!m||!tg)return toast("Model və hədəf seçin");save({models:[...s.models.filter(x=>!(x.scope===sc&&x.target===tg)),{scope:sc,target:tg,model:m}]},"Model təyin edildi")}
 else if(a==="mx"){save({models:s.models.filter((_,j)=>j!==i)})}
 else if(a==="fg"){await post("/api/teacher/forget",{pc:id});toast("Siyahıdan silindi");lastSig="";tick()}
 else if(a==="lo"){try{localStorage.removeItem(LS)}catch(x){}location.reload()}

  else if(a==="ui"){UI[k]=UI[k]?0:1;saveUI();syncUI();beep(UI[k]?720:480);if(k==="nBrowser"&&UI.nBrowser&&window.Notification&&Notification.permission==="default")Notification.requestPermission()}
  else if(a==="uiv"){const v=t.dataset.v;UI[k]=isNaN(+v)?v:+v;saveUI();syncUI();beep(600)}
  else if(a==="uireset"){UI={...UIDEF};saveUI();lastSig="";render(true);toast("Görünüş seçimləri sıfırlandı")}
  else if(a==="ntest"){notify("Sınaq bildirişi — hər şey işləyir ✓");toast("Sınaq bildirişi göndərildi")}
  else if(a==="ptab"){beep(560);ptabGo(k)}
  else if(a==="secopen"){SECOPEN=!SECOPEN;beep(SECOPEN?680:460);$("#secbtn").classList.toggle("open",SECOPEN);$("#secbtn").setAttribute("aria-expanded",SECOPEN);$("#secpanel").classList.toggle("open",SECOPEN)}
  else if(a==="secm"){const nv=!s.safeMode;
   if(nv){lessonModeModal();return}
   t.classList.toggle("on",false);s.safeMode=false;s.lessonMode="";secUpdate();beep(440);PEND++;
   try{const r=await post("/api/teacher/settings",{safeMode:false,lessonMode:""});if(r.ok){S=r;lastSig=nowKey();secUpdate();toast("Təhlükəsizlik rejimi bağlandı")}}catch(x){toast("Saxlanmadı, yenidən cəhd et");lastSig=""}finally{PEND--}}
  else if(a==="lsm"){closeM();const MN={algoritmika:"Alqoritmika",steam:"Steam",informatika:"İnformatika"};
   s.safeMode=true;s.lessonMode=k;secUpdate();beep(720);PEND++;
   try{const r=await post("/api/teacher/settings",{safeMode:true,lessonMode:k});if(r.ok){S=r;lastSig=nowKey();secUpdate();toast("Dərs başladı: "+(MN[k]||k))}}catch(x){toast("Saxlanmadı, yenidən cəhd et");lastSig=""}finally{PEND--}}
  else if(a==="op"){const top=TOPK.includes(k),nv=!(top?!!s[k]:!!s.opts[k]);t.classList.toggle("on",nv);if(top)s[k]=nv;else s.opts[k]=nv;secUpdate();beep(nv?720:480);PEND++;
   try{const r=await post("/api/teacher/settings",top?{[k]:nv}:{opts:{[k]:nv}});if(r.ok){S=r;lastSig=nowKey();secUpdate()}}catch(x){toast("Saxlanmadı, yenidən cəhd et");lastSig=""}finally{PEND--}}
  else if(window.xclick&&xclick(a,t,e,id,i,k))return;
  else if(a==="secall"){const v=k==="1",o={};SECG.forEach(g=>g[2].forEach(([key])=>{if(!TOPK.includes(key))o[key]=v}));save({opts:o},v?"Bütün qoruma seçimləri açıldı":"Bütün seçimlər bağlandı")}
});
document.addEventListener("contextmenu",e=>{if(e.target.id==="scrimg"||e.target.id==="scrvid"){e.preventDefault();mouseCmd("rightclick",e)}});
document.addEventListener("dblclick",e=>{if(e.target.id==="scrimg"||e.target.id==="scrvid")mouseCmd("doubleclick",e)});
document.addEventListener("change",e=>{if(e.target.id==="ms")fillTargets()});
document.addEventListener("keydown",e=>{if(e.target.id==="kb"&&e.key==="Enter"){const v=e.target.value;if(v&&MID){cmd(MID,"keyboard",{text:v},null);e.target.value=""}return}if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("pc")){e.preventDefault();e.target.click()}if(e.key==="Escape")closeM();
 if(e.key==="Enter"&&e.target.id==="ni")document.querySelector('[data-a="ta"]').click();if(e.key==="Enter"&&e.target.id==="si")document.querySelector('[data-a="sa"]').click()});
 document.addEventListener("input",e=>{const r=e.target;if(r.type==="range"&&r.dataset.k&&r.dataset.k in UI){UI[r.dataset.k]=+r.value;saveUI();syncUI()}});
 buildNav();applyUI();bell();syncUI();addEventListener("resize",()=>moveInd(CURK||"esas"));if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>moveInd(CURK||"esas"));
 addEventListener("hashchange",()=>{const o=NAV.map(n=>n[0]),old=CURK||"esas",h=(location.hash||"#esas").slice(1),nk=V[h]?h:"esas";if(nk===old)return;const dir=o.indexOf(nk)>o.indexOf(old)?1:-1;nav();beep(640);if(!S)return;swapPage(dir)});

// ── Login (only a teacher with the key gets in) ───────────────────────────────
function loginView(msg){CRED=null;S=null;modal(`<h3>Müəllim girişi</h3><p class="mu" style="margin-top:0">${esc(msg||"Sinif kodunu və müəllim açarını yaz. DeX proqramında Parametrlər düyməsi bunu avtomatik edir.")}</p><div class="row" style="margin-top:10px"><input class="in" id="lc" placeholder="Sinif kodu" maxlength="5" style="text-transform:uppercase"></div><div class="row" style="margin-top:10px"><input class="in" id="lt2" type="password" placeholder="Müəllim açarı" autocomplete="off"></div><div class="row" style="margin-top:14px"><button class="bt pr" id="lgo">Daxil ol</button></div>`);
 const go=async()=>{const c=$("#lc").value.trim().toUpperCase(),t=$("#lt2").value.trim();if(!c||!t)return;
  try{const r=await fetch("/api/teacher/state",{headers:{"x-class":c,"x-teacher":t}});if(r.ok){localStorage.setItem(LS,JSON.stringify({c,t}));location.reload()}else loginView("Kod və ya açar düz deyil.")}catch(e){loginView("Serverlə əlaqə yoxdur.")}};
 $("#lgo").onclick=go;$("#lt2").onkeydown=e=>{if(e.key==="Enter")go()}}
if(!CRED)loginView();else{nav();tick()}

/* DeX Müəllim Paneli — canlı hissə. Bütün məlumat serverdən gəlir (hər ~1,2 san.):
   yalnız sinfə həqiqətən qoşulmuş kompüterlər görünür, uydurma kompüter yoxdur. */
const P={lock:"M6 11h12v9H6zM8 11V8a4 4 0 118 0v3",msg:"M4 5h16v11H9l-5 4z",cast:"M3 6h18v12H3zM8 21h8M12 18v3",x:"M6 6l12 12M18 6L6 18",trash:"M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13",rec:"M12 5a7 7 0 100 14 7 7 0 000-14z",copy:"M8 8h11v12H8zM5 16V4h11",full:"M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",pwr:"M12 3v8M7 6.5a7 7 0 1010 0"};
const I=n=>IC[n]?`<img src="${IC[n]}" alt="">`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const $=s=>document.querySelector(s), pad=n=>String(n).padStart(2,"0");
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
async function api(m,p,b){const r=await fetch(p,{method:m,headers:hdr(),body:b?JSON.stringify(b):undefined});if(r.status===401){loginView("Açar düz deyil və ya sinif silinib.");throw new Error("auth")}if(!r.ok){const o=document.getElementById("off");if(o){o.textContent="Server cavabı: HTTP "+r.status+" ("+p.split("?")[0]+") — yenidən cəhd edilir…"}throw new Error("http "+r.status)}return r.json()}
const post=(p,b)=>api("POST",p,b);
const shotUrl=(id,v)=>`/api/shot?pc=${encodeURIComponent(id)}&c=${CRED.c}&t=${encodeURIComponent(CRED.t)}&v=${v||0}`;

// ── State ─────────────────────────────────────────────────────────────────────
let S=null, N=[], seen=null, offline=false, skew=0;
const toast=t=>{const e=$("#ts");e.textContent=t;e.hidden=false;clearTimeout(toast.k);toast.k=setTimeout(()=>e.hidden=true,2400)};
function modal(h,c){const m=$("#mo");m.innerHTML=`<div class="md ${c||""}" role="dialog" aria-modal="true">${h}</div>`;m.hidden=false}
let MID="",MIV=0;
const closeM=()=>{$("#mo").hidden=true;MID="";clearInterval(MIV)};
const NAV=[["esas","home","Əsas panel"],["ders","cal","Dərs idarəetməsi"],["qeyd","play","Qeydlər"],["tehlukesizlik","shield","Təhlükəsizlik"],["tetbiq","grid","Tətbiq nəzarəti"],["param","gear","Parametrlər"]];
const stName={ok:"Aktiv",wa:"Kilidli",in:"Oflayn"},dot=s=>({ok:"g",wa:"o",in:"b"}[s]);
const pst=p=>!p.online?"in":p.lock?"wa":"ok";
const hm=t=>{const d=new Date(t);return pad(d.getHours())+":"+pad(d.getMinutes())+":"+pad(d.getSeconds())};
const sdate=()=>new Date(Date.now()+skew);

// same rule as the server and the app
const toMin=h=>{const [a,b]=String(h).split(":").map(x=>parseInt(x,10));return (a||0)*60+(b||0)};
function lessonNow(){if(!S)return{};const d=sdate(),m=d.getHours()*60+d.getMinutes()+d.getSeconds()/60;let next=null;
 for(const l of S.class.schedule){if(!l.on)continue;const s=toMin(l.start),e=toMin(l.end);if(m>=s&&m<e)return{running:l,secs:Math.max(0,Math.round((e-m)*60)),next};if(s>m&&(!next||s<toMin(next.start)))next=l}
 return{running:null,secs:0,next}}
const fmt=s=>pad(Math.floor(s/60))+":"+pad(s%60);

// ── Views ─────────────────────────────────────────────────────────────────────
const ovl=p=>(p.lock?`<div class="lk">${I("lock")}Kilidlənib</div>`:"");
const card=(p,i)=>{const st=pst(p),who=p.student||"";
 const th=p.hasShot?`<img class="sh" data-id="${esc(p.id)}" data-v="${p.shotAt}" src="${shotUrl(p.id,p.shotAt)}" alt="${esc(p.name)} ekranı">`:`<div class="ph"><b>${esc(who||p.name)}</b><small>${p.online?"Ekran gözlənilir…":"Oflayn"}</small></div>`;
 return `<div class="pc" style="--i:${i}" role="button" tabindex="0" data-a="sel" data-id="${esc(p.id)}"><div class="th ${p.online?"":"off"}">${th}${ovl(p)}</div><div class="ft"><i class="d ${dot(st)}"></i><span>${esc(p.name)}${who?` · ${esc(who)}`:""}</span><button data-a="ctl" data-id="${esc(p.id)}" aria-label="${esc(p.name)} idarəsi">${I("ctl")}</button></div></div>`};
const empty=()=>`<div class="pn" style="max-width:720px;margin:6vh auto;text-align:center"><h3>Hələ heç bir kompüter qoşulmayıb</h3><p class="mu">Şagird kompüterlərində DeX-i açıb <b>Şagird</b> seçin və sinif kodunu yazın:</p><div class="big" style="font-size:54px;margin:10px 0">${esc(S.class.code)}</div><p class="mu">Qoşulan kompüter bu səhifədə 1–2 saniyə ərzində görünəcək. Siyahıda yalnız həqiqətən qoşulmuş kompüterlər olur.</p></div>`;
const V={
esas:()=>S.pcs.length?`<div class="grid">${S.pcs.map(card).join("")}</div>`:empty(),
ders:()=>{const on=S.pcs.filter(p=>p.online).length,link=location.origin+"/panel?c="+encodeURIComponent(S.class.code)+"&t="+encodeURIComponent(CRED.t);
 return `<div class="two"><section class="pn wide"><h3>Sinif ${esc(S.class.name)}</h3><p class="mu" style="margin-top:0">Şagirdlər bu kodla qoşulur</p><div class="row"><span class="big" style="font-size:44px">${esc(S.class.code)}</span><button class="bt" data-a="cp">${I("copy")} Kopyala</button></div><p class="mu" style="margin:14px 0 6px">Müəllim açarı (heç kimə vermə)</p><div class="row"><input class="in" id="tk" readonly value="${esc(CRED.t)}" onclick="this.select()"><button class="bt" data-a="ck">${I("copy")} Kopyala</button><button class="bt" data-a="cl">Giriş linkini kopyala</button></div><p class="mu">Qoşulub: <b>${on}</b> / ${S.pcs.length} kompüter</p></section><section class="pn wide"><h3>Sinif idarəsi</h3><div class="row"><button class="bt" data-a="lockall">${I("lock")} Hamısını kilidlə</button><button class="bt" data-a="unlockall">Kilidləri aç</button><button class="bt pr" data-a="bc">${I("msg")} Mesaj yay</button><button class="bt" data-a="closeall">Proqramları bağla</button><button class="bt rd" data-a="rsall">Hamısını yenidən başlat</button><button class="bt rd" data-a="sdall">Hamısını söndür</button></div></section><section class="pn wide"><h3>Dərs planı</h3>${S.settings.tasks.map((t,i)=>`<div class="li"><button class="tg ${t.d?"on":""}" data-a="td" data-i="${i}" aria-label="Tamamlandı"></button><span class="sp" style="${t.d?"opacity:.55;text-decoration:line-through":""}">${esc(t.t)}</span><button class="ib2" data-a="tx" data-i="${i}" aria-label="Sil">${I("trash")}</button></div>`).join("")||'<p class="mu">Plan boşdur. Aşağıdan ilk addımı əlavə edin.</p>'}<div class="row" style="margin-top:12px"><input class="in" id="ni" placeholder="Yeni addım yazın" maxlength="80"><button class="bt pr" data-a="ta">Əlavə et</button></div></section></div>`},
qeyd:()=>{const qs=S.questions;return `<div class="two"><section class="pn wide"><h3>Şagird sualları</h3>${qs.map(q=>`<div class="li" style="align-items:flex-start;flex-direction:column;gap:6px"><div><b>${esc(q.from)}</b> <span class="pill">${hm(q.at)}</span></div><div>${esc(q.text)}</div>${q.image?`<span class="mu">(ekran şəkli əlavə olunub)</span>`:""}${q.answer?`<div class="ans"><b>Cavab:</b> ${esc(q.answer.text)}</div>`:`<div class="row" style="width:100%"><input class="in" id="qa-${esc(q.id)}" placeholder="Cavab yaz…" maxlength="500"><button class="bt pr" data-a="qa" data-id="${esc(q.id)}">Cavabla</button></div>`}</div>`).join("")||'<p class="mu">Hələ şagird sualı yoxdur.</p>'}</section><section class="pn wide"><h3>Əməliyyat qeydləri</h3>${S.logs.slice(0,80).map(l=>`<div class="li"><span class="pill">${hm(l.at)}</span><span class="sp"><b>${esc(l.pcName||"—")}</b>${l.user?` · ${esc(l.user)}`:""} · ${esc(l.type)} — ${esc(l.text)}</span></div>`).join("")||'<p class="mu">Hələ qeyd yoxdur.</p>'}</section></div>`},
tehlukesizlik:()=>{const s=S.settings,T=[["safeMode","Təhlükəsiz rejim (dərs zamanı Alt+Tab və Win düyməsi bloku)"],["allowExe",".exe / .msi yükləməyə icazə ver"],["webBlock","Qadağan olunmuş saytları blokla (DeX Browser-də işləyəcək)"]];
 const ev=S.logs.filter(l=>["əmr","icazə","proqram","yükləmə","sistem"].includes(l.type)).slice(0,30);
 return `<div class="two"><section class="pn"><h3>Qoruma qaydaları</h3>${T.map(([k,t])=>`<div class="li"><span class="sp">${t}</span><button class="tg ${s[k]?"on":""}" data-a="tg" data-k="${k}" aria-label="${t}"></button></div>`).join("")}</section><section class="pn"><h3>Bloklanmış saytlar</h3>${s.sites.map((x,i)=>`<div class="li"><span class="sp">${esc(x)}</span><button class="ib2" data-a="sx" data-i="${i}" aria-label="Sil">${I("x")}</button></div>`).join("")||'<p class="mu">Bloklanmış sayt yoxdur.</p>'}<div class="row" style="margin-top:12px"><input class="in" id="si" placeholder="məsələn: site.com" maxlength="60"><button class="bt pr" data-a="sa">Blokla</button></div></section><section class="pn wide"><h3>Hadisələr</h3>${ev.map(l=>`<div class="li"><span class="pill">${hm(l.at)}</span><span class="sp">${esc(l.pcName?l.pcName+": ":"")}${esc(l.text)}</span></div>`).join("")||'<p class="mu">Hələ hadisə yoxdur.</p>'}</section></div>`},
tetbiq:()=>{const s=S.settings,ex=Object.keys(s.extraApps||{});return `<div class="pn"><h3>Tətbiq icazələri</h3><p class="mu" style="margin-top:0">Bloklanan proqram şagird kompüterində açılan kimi bağlanır. “Hamısında bağla” hazırda açıq olanları da bağlayır.</p>${Object.keys(s.apps).map(a=>`<div class="li"><span class="sp"><b>${esc(a)}</b><div class="mu">${s.apps[a]?"İcazə verilib":"Bloklanıb"}</div></span><button class="bt" data-a="ac" data-k="${esc(a)}">Hamısında bağla</button><button class="tg ${s.apps[a]?"on":""}" data-a="ta2" data-k="${esc(a)}" aria-label="${esc(a)}"></button></div>`).join("")}${ex.map(a=>`<div class="li"><span class="sp"><b>${esc(a)}</b><div class="mu">${s.extraApps[a]?"İcazə verilib":"Bloklanıb"}</div></span><button class="bt" data-a="ac2" data-k="${esc(a)}">Hamısında bağla</button><button class="tg ${s.extraApps[a]?"on":""}" data-a="ta3" data-k="${esc(a)}" aria-label="${esc(a)}"></button><button class="ib2" data-a="xa" data-k="${esc(a)}" aria-label="Sil">${I("x")}</button></div>`).join("")}<div class="row" style="margin-top:12px"><input class="in" id="xa" placeholder="başqa proqram: məsələn game.exe" maxlength="60"><button class="bt pr" data-a="aa">Əlavə et (blokla)</button></div></div>`},
param:()=>{const s=S.settings;
 const keys=PROVS.map(([k,t])=>{const kk=s.keys[k]||{};return `<div class="li" style="flex-wrap:wrap"><span class="sp" style="min-width:210px"><b>${t}</b><div class="mu">${kk.set?`təyin olunub · …${esc(kk.tail)}`:"açar yoxdur"}</div></span><input class="in" type="password" id="k-${k}" placeholder="${kk.set?"yeni açar yazsan əvəz olunur":"açarı bura yapışdır"}" autocomplete="off"><button class="bt pr" data-a="ks" data-k="${k}">Saxla</button>${kk.set?`<button class="bt" data-a="kc" data-k="${k}">Sil</button>`:""}</div>`}).join("");
 const asg=s.models.map((m,i)=>`<div class="li"><span class="sp"><b>${({class:"Sinif",student:"Şagird",computer:"Kompüter",global:"Hamı"})[m.scope]||m.scope}</b> <span class="mu">${esc(labelOf(m.scope,m.target))} → ${esc(m.model)}</span></span><button class="ib2" data-a="mx" data-i="${i}" aria-label="Sil">${I("x")}</button></div>`).join("")||'<p class="mu">Təyinat yoxdur: kompüterdəki ümumi model işlədilir.</p>';
 return `<div class="two"><section class="pn"><h3>Profil</h3><label class="mu">Adınız</label><div class="row" style="margin:6px 0 10px"><input class="in" id="pn" value="${esc(s.teacherName)}" maxlength="24"><button class="bt pr" data-a="ps">Yadda saxla</button></div><label class="mu">Sinif</label><div class="row" style="margin:6px 0 10px"><input class="in" id="cn" value="${esc(S.class.name)}" maxlength="40"><button class="bt pr" data-a="cs">Saxla</button></div><p class="mu">Kod: <b>${esc(S.class.code)}</b></p></section><section class="pn"><h3>Hesab</h3><p class="mu" style="margin-top:0">Müəllim açarı <b>Dərs idarəetməsi</b> səhifəsində, sinif kodunun altındadır.</p><div class="row"><button class="bt rd" data-a="lo">Çıxış</button></div></section><section class="pn wide"><h3>API açarları</h3><p class="mu" style="margin-top:0">Burada yazılan açarlar sinifdəki bütün şagird kompüterlərinə avtomatik göndərilir; hər kompüterdə ayrıca yazmaq lazım deyil.</p>${keys}</section><section class="pn wide"><h3>Modellər (süni intellekt)</h3><p class="mu" style="margin-top:0">Model söhbətdə seçilmir, burada təyin olunur. Ən dəqiq təyinat qalib gəlir: kompüter → şagird → sinif → hamı.</p>${asg}<div class="row" style="margin-top:12px"><select class="in" id="ms">${[["class","Bütün sinif"],["student","Bir şagird"],["computer","Bir kompüter"],["global","Hamı üçün"]].map(([v,t])=>`<option value="${v}">${t}</option>`).join("")}</select><select class="in" id="mt"></select><input class="in" id="mm" list="mlist" placeholder="model" value="${esc(MODELS[0]?MODELS[0][0]:"")}"><datalist id="mlist">${MODELS.map(([id,l])=>`<option value="${esc(id)}">${esc(l)}</option>`).join("")}</datalist><button class="bt pr" data-a="ma">Təyin et</button></div></section><section class="pn wide"><h3>Kompüterlər</h3>${S.pcs.map(p=>`<div class="li"><i class="d ${dot(pst(p))}"></i><span class="sp"><b>${esc(p.name)}</b> <span class="mu">${esc(p.student||"—")} · ${p.online?"qoşulub":"oflayn, son: "+hm(p.lastSeen)}</span></span><button class="bt" data-a="fg" data-id="${esc(p.id)}">Siyahıdan sil</button></div>`).join("")||'<p class="mu">Hələ kompüter qoşulmayıb.</p>'}</section></div>`}};

function labelOf(scope,target){if(scope==="class")return S.class.name;if(scope==="global")return "hamı";
 if(scope==="computer"){const p=S.pcs.find(x=>x.id===target);return p?p.name:target}
 const p=S.pcs.find(x=>x.studentId===target);return p?p.student:target}
function fillTargets(){const sc=$("#ms"),t=$("#mt");if(!sc||!t)return;const v=sc.value;let o=[];
 if(v==="class")o=[[S.class.code,S.class.name]];else if(v==="global")o=[["*","Bütün proqramlar"]];
 else if(v==="computer")o=S.pcs.map(p=>[p.id,p.name]);else o=S.pcs.filter(p=>p.studentId).map(p=>[p.studentId,p.student]);
 t.innerHTML=o.map(([a,b])=>`<option value="${esc(a)}">${esc(b)}</option>`).join("")||'<option value="">(kompüter yoxdur)</option>'}

function nav(){const h=(location.hash||"#esas").slice(1);const k=V[h]?h:"esas";$("#nav").innerHTML=NAV.map(([id,ic,t])=>`<a href="#${id}" data-r="${id}" class="${id===k?"on":""}">${I(ic)}${t}</a>`).join("");return k}
let lastSig="";
function viewSig(k){if(!S)return"";const pcs=S.pcs.map(p=>[p.id,p.name,p.student,p.online,p.lock,p.hasShot]);
 if(k==="esas")return JSON.stringify([pcs,S.class.code]);
 if(k==="ders")return JSON.stringify([pcs.length,S.class,S.lesson.released,S.settings.tasks,Math.floor(Date.now()/60000)]);
 if(k==="qeyd")return JSON.stringify([S.questions.map(q=>[q.id,!!q.answer]),S.logs.slice(0,80).map(l=>l.at)]);
 return JSON.stringify([S.settings,S.class.name,pcs,S.logs.length&&S.logs[0].at])}
function render(force){const k=nav();if(!S)return;const sg=k+viewSig(k);if(!force&&sg===lastSig)return;lastSig=sg;
 const keep=$("#view").scrollTop;$("#view").innerHTML=V[k]();$("#view").scrollTop=keep;document.title="DeX — "+NAV.find(n=>n[0]===k)[2];
 if(k==="esas"&&S.pcs.length){const v=$("#view"),g=v.querySelector(".grid"),cs=getComputedStyle(v),inner=v.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),gap=parseFloat(getComputedStyle(g).rowGap)||0;g.style.setProperty("--rowh",Math.max(120,(inner-3*gap)/4)+"px")}
 if(k==="param")fillTargets()}
function bell(){const u=N.filter(n=>n.u).length;$("#bell").classList.toggle("has",u>0);$("#bell").innerHTML=I("bell")+(u?`<span class="nb">${u}</span>`:"");$("#nt").innerHTML=N.map(n=>`<div class="${n.u?"u":""}">${esc(n.t)}</div>`).join("")||'<div>Hələ bildiriş yoxdur</div>'}
const notify=t=>{N.unshift({t,u:1});N=N.slice(0,14);bell()};
function clock(){const d=sdate();$("#tm0").textContent=pad(d.getHours())+":"+pad(d.getMinutes());$("#dt0").textContent=pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear();
 if(S)$("#hi").textContent="Salam, "+S.settings.teacherName+"!";const l=$("#lt");if(l){const x=lessonNow();l.textContent=x.running?fmt(x.secs):"--:--"}}

// ── Polling ───────────────────────────────────────────────────────────────────
function diffNotes(){const cur={};for(const p of S.pcs)cur[p.id]=p.online;const qs=new Set(S.questions.map(q=>q.id));
 if(seen){for(const p of S.pcs){const was=seen.pcs[p.id];if(was===undefined)notify(`${p.student||p.name} sinfə qoşuldu`);else if(was&&!p.online)notify(`${p.name} oflayn oldu`);else if(!was&&p.online)notify(`${p.name} yenidən qoşuldu`)}
  for(const q of S.questions)if(!seen.qs.has(q.id))notify(`Yeni sual: ${q.from}`)}
 seen={pcs:cur,qs}}
function shotsWanted(){const h=(location.hash||"#esas").slice(1);return h==="esas"||!!MID}
async function tick(){if(!CRED)return;try{const st=await api("GET","/api/teacher/state?panel=1"+(shotsWanted()?"&shots=1":""));if(!st.ok)throw 0;
  const was=offline;offline=false;$("#off").hidden=true;S=st;skew=st.now-Date.now();diffNotes();clock();
  const a=document.activeElement,typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);
  if(!typing&&$("#mo").hidden)render(was);else if(!$("#mo").hidden&&MID)refreshModal();document.querySelectorAll(".pc img.sh").forEach(i=>{const p=S.pcs.find(x=>x.id===i.dataset.id);if(p&&p.shotAt&&i.dataset.v!=String(p.shotAt)){i.dataset.v=p.shotAt;i.src=shotUrl(p.id,p.shotAt)}})}
 catch(e){if(e&&e.message==="auth")return;offline=true;if(!/^http/.test((e&&e.message)||""))$("#off").textContent="Serverlə əlaqə yoxdur — yenidən cəhd edilir…";$("#off").hidden=false}}
(function loop(){tick().finally(()=>setTimeout(loop,document.hidden?10000:2000))})();
setInterval(clock,1000);

// ── PC window ─────────────────────────────────────────────────────────────────
function pcModal(id){MID=id;const p=S.pcs.find(x=>x.id===id);if(!p)return;const st=pst(p);
 modal(`<div class="row"><h3 style="margin:0">${esc(p.name)}</h3><span class="pill">${stName[st]}</span><span class="live ${p.online?"on":""}" id="lv">${p.online?"● Canlı":"Oflayn"}</span><span class="sp"></span><button class="ib2" data-a="fs" aria-label="Tam ekran">${I("full")}</button><button class="ib2" data-a="cm" aria-label="Bağla">${I("x")}</button></div><p class="mu" style="margin:6px 0 0">Şagird: <b>${esc(p.student||"—")}</b> · son siqnal: ${hm(p.lastSeen)}</p><div class="scr" id="scr">${p.hasShot?`<img id="scrimg" class="rc" title="Siçanı idarə etmək üçün klikləyin (sağ klik = sağ klik, iki dəfə klik = iki dəfə klik)" src="${shotUrl(p.id,p.shotAt)}" alt="">`:`<div class="ph big"><b>${esc(p.student||p.name)}</b><small>${p.online?"Ekran şəkli gözlənilir…":"Kompüter oflaynd"}</small></div>`}${ovl(p)}</div><div class="row"><button class="bt" data-a="plk" data-id="${esc(id)}">${I("lock")} ${p.lock?"Kilidi aç":"Kilidlə"}</button><button class="bt" data-a="pcl" data-id="${esc(id)}">Proqramları bağla</button><button class="bt rd" data-a="prs" data-id="${esc(id)}">Yenidən başlat</button><button class="bt rd" data-a="psd" data-id="${esc(id)}">Söndür</button></div><div class="row" style="margin-top:12px"><input class="in" id="pm" placeholder="${esc(p.name)} üçün mesaj" maxlength="120"><button class="bt pr" data-a="pmg" data-id="${esc(id)}">Göndər</button></div>`,"wide");
 }
function refreshModal(){const p=S.pcs.find(x=>x.id===MID);if(!p)return;const im=$("#scrimg");if(im&&p.hasShot&&im.dataset.v!=String(p.shotAt)){im.dataset.v=p.shotAt;im.src=shotUrl(p.id,p.shotAt)}const lv=$("#lv");if(lv){lv.textContent=p.online?"● Canlı":"Oflayn";lv.className="live "+(p.online?"on":"")}
 const sc=$("#scr");if(sc&&p.hasShot&&!$("#scrimg")){sc.innerHTML=`<img id="scrimg" class="rc" title="Siçanı idarə etmək üçün klikləyin" src="${shotUrl(p.id,p.shotAt)}" alt="">`+ovl(p)}}
function confirmM(text,act,id){modal(`<h3>${text}</h3><div class="row" style="margin-top:14px"><button class="bt rd" data-a="${act}" data-id="${esc(id)}">Bəli</button><button class="bt" data-a="cm">Ləğv et</button></div>`)}

// ── Saving ────────────────────────────────────────────────────────────────────
async function save(patch,msg){try{const r=await post("/api/teacher/settings",patch);if(r.ok){S=r;lastSig="";render(true);if(msg)toast(msg)}}catch(e){toast("Saxlanmadı, yenidən cəhd et")}}
async function cmd(pc,type,args,msg){try{const r=await post("/api/teacher/command",{pc,type,args});if(r.ok){if(msg!==null)toast(msg||`${r.sent} kompüterə göndərildi`);tick()}}catch(e){if(msg!==null)toast("Göndərilmədi, yenidən cəhd et")}}

// ── Remote mouse (click the live screen picture to control that PC) ────────────
// nx/ny are 0..1 fractions of the image, so the click lands correctly whatever
// that student's own screen resolution is (server + Rust side already expect this).
let mouseBusy=false;
function nxny(img,e){const r=img.getBoundingClientRect();return{nx:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),ny:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))}}
async function mouseCmd(action,e){const img=e.target;if(!MID||mouseBusy)return;const{nx,ny}=nxny(img,e);mouseBusy=true;try{await cmd(MID,"mouse",{nx,ny,action},null)}finally{mouseBusy=false}}
function readSchedule(){return S.class.schedule.map((x,i)=>{const a=document.querySelector(`.tm[data-k="start"][data-i="${i}"]`),b=document.querySelector(`.tm[data-k="end"][data-i="${i}"]`);return{...x,start:a?a.value.trim():x.start,end:b?b.value.trim():x.end}})}
const okTime=t=>/^([01]?\d|2[0-3]):[0-5]\d$/.test(t);

document.addEventListener("click",async e=>{
 if(!e.target.closest("#nt,#bell")&&!$("#nt").hidden)$("#nt").hidden=true;
 if(e.target.id==="mo")return closeM();
 if(e.target.id==="scrimg")return mouseCmd("click",e);
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
 else if(a==="pmg"){const v=$("#pm").value.trim();if(!v)return toast("Əvvəlcə mesaj yazın");closeM();cmd(id,"message",{text:v},"Mesaj göndərildi")}
 else if(a==="cp"){try{navigator.clipboard.writeText(S.class.code).then(()=>toast("Kod kopyalandı"),()=>toast("Kod: "+S.class.code))}catch(x){toast("Kod: "+S.class.code)}}
 else if(a==="ck"){try{navigator.clipboard.writeText(CRED.t).then(()=>toast("Açar kopyalandı"),()=>{$("#tk").select();toast("Açarı seç və Ctrl+C bas")})}catch(x){$("#tk").select()}}
 else if(a==="cl"){const l=location.origin+"/panel?c="+encodeURIComponent(S.class.code)+"&t="+encodeURIComponent(CRED.t);try{navigator.clipboard.writeText(l).then(()=>toast("Giriş linki kopyalandı"))}catch(x){toast("Kopyalanmadı")}}
 else if(a==="sg"){const sch=readSchedule();sch[i].on=!sch[i].on;await save({schedule:sch})}
 else if(a==="ss"){const sch=readSchedule(),bad=sch.find(x=>x.on&&(!okTime(x.start)||!okTime(x.end)||toMin(x.start)>=toMin(x.end)));if(bad)return toast(`${ord(bad.n)} dərsin saatı düz deyil (məsələn 08:00 – 08:45)`);
  await save({schedule:sch.map(x=>({...x,start:pad(toMin(x.start)/60|0)+":"+pad(toMin(x.start)%60),end:pad(toMin(x.end)/60|0)+":"+pad(toMin(x.end)%60)}))},"Cədvəl saxlandı və kompüterlərə göndərildi")}
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
});
document.addEventListener("contextmenu",e=>{if(e.target.id==="scrimg"){e.preventDefault();mouseCmd("rightclick",e)}});
document.addEventListener("dblclick",e=>{if(e.target.id==="scrimg")mouseCmd("doubleclick",e)});
document.addEventListener("change",e=>{if(e.target.id==="ms")fillTargets()});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("pc")){e.preventDefault();e.target.click()}if(e.key==="Escape")closeM();
 if(e.key==="Enter"&&e.target.id==="ni")document.querySelector('[data-a="ta"]').click();if(e.key==="Enter"&&e.target.id==="si")document.querySelector('[data-a="sa"]').click()});
$("#gear").innerHTML=I("hgear");$("#ck").src=IC.clock;
$("#bell").addEventListener("click",()=>{const n=$("#nt");n.hidden=!n.hidden;if(!n.hidden){bell();N.forEach(x=>x.u=0);setTimeout(bell,50)}});
addEventListener("hashchange",()=>{lastSig="";render(true);if(!matchMedia("(prefers-reduced-motion:reduce)").matches)$("#view").animate([{opacity:0,transform:"translateY(1.4rem)"},{opacity:1,transform:"none"}],{duration:320,easing:"ease-out"})});

// ── Login (only a teacher with the key gets in) ───────────────────────────────
function loginView(msg){CRED=null;S=null;modal(`<h3>Müəllim girişi</h3><p class="mu" style="margin-top:0">${esc(msg||"Sinif kodunu və müəllim açarını yaz. DeX proqramında Parametrlər düyməsi bunu avtomatik edir.")}</p><div class="row" style="margin-top:10px"><input class="in" id="lc" placeholder="Sinif kodu" maxlength="5" style="text-transform:uppercase"></div><div class="row" style="margin-top:10px"><input class="in" id="lt2" type="password" placeholder="Müəllim açarı" autocomplete="off"></div><div class="row" style="margin-top:14px"><button class="bt pr" id="lgo">Daxil ol</button></div>`);
 const go=async()=>{const c=$("#lc").value.trim().toUpperCase(),t=$("#lt2").value.trim();if(!c||!t)return;
  try{const r=await fetch("/api/teacher/state",{headers:{"x-class":c,"x-teacher":t}});if(r.ok){localStorage.setItem(LS,JSON.stringify({c,t}));location.reload()}else loginView("Kod və ya açar düz deyil.")}catch(e){loginView("Serverlə əlaqə yoxdur.")}};
 $("#lgo").onclick=go;$("#lt2").onkeydown=e=>{if(e.key==="Enter")go()}}
if(!CRED)loginView();else{nav();tick()}

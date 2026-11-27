
// ═══ extra.js — səs effektləri, ders idarəsi, təqvim, notlar, söhbət, tətbiqlər, təhlükəsizlik ═══
// ── Səs effektləri (WebAudio ilə sintez: whoosh, click, pop, bildiriş) ────────────
let XC=null;
function sfx(n){const k={click:"sfxClick",whoosh:"sfxWhoosh",pop:"sfxPop",note:"sfxNote"}[n];if(!UI.sound||(k&&!UI[k]))return;
 try{XC=XC||new(window.AudioContext||window.webkitAudioContext)();if(XC.state==="suspended")XC.resume();const t=XC.currentTime,v=(UI.vol==null?60:UI.vol)/100,g=XC.createGain();g.connect(XC.destination);
  const tone=(f1,f2,d,ty,at,vo)=>{const o=XC.createOscillator(),e=XC.createGain();o.type=ty||"sine";o.frequency.setValueAtTime(f1,t+at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+at+d);e.gain.setValueAtTime(.0001,t+at);e.gain.exponentialRampToValueAtTime(Math.max(.0002,vo*v),t+at+.01);e.gain.exponentialRampToValueAtTime(.0001,t+at+d);o.connect(e);e.connect(g);o.start(t+at);o.stop(t+at+d+.03)};
  const noise=(d,f1,f2,vo)=>{const b=XC.createBuffer(1,Math.floor(XC.sampleRate*d),XC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=XC.createBufferSource();s.buffer=b;const f=XC.createBiquadFilter();f.type="bandpass";f.Q.value=1.2;f.frequency.setValueAtTime(f1,t);f.frequency.exponentialRampToValueAtTime(f2,t+d);const e=XC.createGain();e.gain.setValueAtTime(.0001,t);e.gain.exponentialRampToValueAtTime(Math.max(.0002,vo*v),t+d*.35);e.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(e);e.connect(g);s.start(t)};
  if(n==="whoosh")noise(.42,250,3200,.55);else if(n==="click")tone(1500,700,.045,"square",0,.1);else if(n==="pop"){tone(380,900,.09,"sine",0,.4);tone(900,1300,.05,"sine",.05,.12)}else if(n==="note"){tone(880,0,.28,"sine",0,.28);tone(1320,0,.4,"sine",.12,.22);tone(1760,0,.5,"sine",.26,.12)}
 }catch(e){}}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest(".tile"))sfx("pop");else if(e.target.closest&&e.target.closest(".bt,.wcl .ci,.sub button,.wk button"))sfx("click")},true);

// ── Əlavə məlumat (serverdə settings.ext): şagirdlər, qruplar, davamiyyət, notlar, xüsusi günlər ──
var DT="",WCK="";
const EX=()=>({students:[],groups:[],att:{},notes:[],days:[],autoRec:true,...((S&&S.settings.ext)||{})});
const uidx=()=>Math.random().toString(36).slice(2,9);
const saveExt=(p,m)=>save({ext:{...EX(),...p}},m);
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const hmm=t=>{const d=new Date(t);return pad(d.getHours())+":"+pad(d.getMinutes())};
const dl=(name,text,type)=>{const u=URL.createObjectURL(new Blob([text],{type:type||"text/plain"})),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),9000)};
const csvq=x=>'"'+String(x==null?"":x).replace(/"/g,'""')+'"';

// ── Təqvim: əvvəl həftənin günləri, altında dərslər; tətil/xüsusi günlər config.json-dan ──
let WOFF=0,MT="students",ATTD=0;
const dayDate=wd=>{const t=sdate();t.setHours(12,0,0,0);const c=((t.getDay()+6)%7)+1;t.setDate(t.getDate()-(c-1)+(wd-1)+WOFF*7);return t};
const holOf=d=>{const y=ymd(d),m=y.slice(5);return[...CFG.holidays.map(h=>({...h,cfg:1})),...EX().days].filter(h=>h.date===y||h.date===m)};
const MONTHS=["yanvar","fevral","mart","aprel","may","iyun","iyul","avqust","sentyabr","oktyabr","noyabr","dekabr"];
// ── Ders idarəsi: şagird, sinif, cihaz, icazə, giriş, davamiyyət ───────────────────
const PERMS=[["ai","AI köməkçi"],["web","İnternet"],["apps","Proqramlar"],["usb","USB"],["print","Çap"],["chat","Müəllimə yazsın"]];
const MTABS=[["students","Şagirdlər"],["groups","Siniflər"],["devices","Cihazlar"],["perms","İcazələr"],["access","Giriş"]];
const grpName=(E,id)=>{const g=E.groups.find(x=>x.id===id);return g?g.n:S.class.name};
const stSel=(E,st)=>`<select class="in" data-sf="c" data-sid="${st.id}">${[{id:"",n:S.class.name},...E.groups].map(g=>`<option value="${g.id}" ${g.id===(st.c||"")?"selected":""}>${esc(g.n)}</option>`).join("")}</select>`;
const pcOf=(st)=>S.pcs.find(p=>p.id===st.pc);
function mgmtHtml(){const E=EX(),st=E.students,tab=MTABS.map(([k,t])=>`<button class="${k===MT?"on":""}" data-a="mtab" data-k="${k}">${t}${k==="students"?` <span class="pill">${st.length}</span>`:""}</button>`).join("");let b="";
 if(MT==="students")b=`<div class="row"><input class="in" id="sn" placeholder="Şagirdin adı" maxlength="40"><select class="in" id="sc">${[{id:"",n:S.class.name},...E.groups].map(g=>`<option value="${g.id}">${esc(g.n)}</option>`).join("")}</select><button class="bt pr" data-a="stadd">Əlavə et</button></div>
  <details style="margin:10px 0"><summary class="mu" style="cursor:pointer">Siyahını toplu əlavə et (hər sətirdə bir ad)</summary><textarea class="in" id="sbulk" placeholder="Əli Məmmədov&#10;Aysel Həsənova"></textarea><button class="bt" data-a="stbulk" style="margin-top:8px">Hamısını əlavə et</button></details>
  <div class="tw"><table class="tbl"><tr><th>Ad</th><th>Sinif</th><th>Cihaz</th><th>Giriş</th><th></th></tr>${st.map(s=>`<tr><td><b>${esc(s.n)}</b></td><td>${stSel(E,s)}</td><td><select class="in" data-sf="pc" data-sid="${s.id}"><option value="">—</option>${S.pcs.map(p=>`<option value="${esc(p.id)}" ${p.id===s.pc?"selected":""}>${esc(p.name)}</option>`).join("")}</select></td><td><span class="pill ${s.acc==="off"?"bad":s.acc==="pend"?"wa":"ok"}">${({off:"Bloklu",pend:"Gözləyir"})[s.acc]||"İcazəli"}</span></td><td><button class="ib2" data-a="stdel" data-id="${s.id}" aria-label="Sil">${I("trash")}</button></td></tr>`).join("")||'<tr><td colspan="5" class="mu">Hələ şagird yoxdur.</td></tr>'}</table></div>`;
 else if(MT==="groups")b=`<div class="row"><input class="in" id="gn" placeholder="Yeni sinif / qrup adı (məs. 9B)" maxlength="30"><button class="bt pr" data-a="gadd">Əlavə et</button></div><div style="margin-top:10px"><div class="li"><b class="sp">${esc(S.class.name)} <span class="mu">(əsas sinif)</span></b><span class="pill">${st.filter(s=>!s.c).length} şagird</span></div>${E.groups.map(g=>`<div class="li"><b class="sp">${esc(g.n)}</b><span class="pill">${st.filter(s=>s.c===g.id).length} şagird</span><button class="ib2" data-a="gdel" data-id="${g.id}" aria-label="Sil">${I("trash")}</button></div>`).join("")}</div>`;
 else if(MT==="devices")b=`<div class="tw"><table class="tbl"><tr><th>Cihaz</th><th>Status</th><th>Şagird</th><th>Son siqnal</th><th></th></tr>${S.pcs.map(p=>{const o=st.find(s=>s.pc===p.id);return`<tr><td><b>${esc(p.name)}</b></td><td><span class="pill ${p.online?(p.lock?"wa":"ok"):""}">${stName[pst(p)]}</span></td><td><select class="in" data-df="${esc(p.id)}"><option value="">— təyin edilməyib —</option>${st.map(s=>`<option value="${s.id}" ${o&&o.id===s.id?"selected":""}>${esc(s.n)}</option>`).join("")}</select></td><td class="mu">${p.lastSeen?hm(p.lastSeen):"—"}</td><td><button class="bt" data-a="ctl" data-id="${esc(p.id)}">Aç</button> <button class="bt" data-a="plk" data-id="${esc(p.id)}">${p.lock?"Kilidi aç":"Kilidlə"}</button></td></tr>`}).join("")||'<tr><td colspan="5" class="mu">Qoşulmuş cihaz yoxdur.</td></tr>'}</table></div>`;
 else if(MT==="perms")b=`<p class="mu" style="margin-top:0">Hər şagird üçün fərdi icazələr (panel və serverdə saxlanır).</p><div class="tw"><table class="tbl"><tr><th>Şagird</th>${PERMS.map(([k,t])=>`<th>${t}<br><button class="bt" style="padding:1px 8px;font-size:.8rem" data-a="permall" data-k="${k}" data-v="1">hamı</button> <button class="bt" style="padding:1px 8px;font-size:.8rem" data-a="permall" data-k="${k}" data-v="0">heç kim</button></th>`).join("")}</tr>${st.map(s=>`<tr><td><b>${esc(s.n)}</b></td>${PERMS.map(([k])=>`<td><button class="tg ${(s.perm||{})[k]!==0?"on":""}" data-a="perm" data-id="${s.id}" data-k="${k}" aria-label="${k}"></button></td>`).join("")}</tr>`).join("")||'<tr><td class="mu">Şagird yoxdur.</td></tr>'}</table></div>`;
 else b=`<p class="mu" style="margin-top:0">“Bloklu” seçəndə şagirdin cihazı dərhal kilidlənir, “İcazəli” seçəndə kilid açılır. Giriş kodu: <b class="mono">${esc(S.class.code)}</b> <button class="bt" data-a="cp">Kopyala</button></p><div class="tw"><table class="tbl"><tr><th>Şagird</th><th>Cihaz</th><th>Giriş</th></tr>${st.map(s=>{const p=pcOf(s);return`<tr><td><b>${esc(s.n)}</b></td><td>${p?esc(p.name)+` <span class="pill ${p.online?"ok":""}">${p.online?"onlayn":"oflayn"}</span>`:'<span class="mu">təyin edilməyib</span>'}</td><td><div class="seg">${[["on","İcazəli"],["pend","Gözləyir"],["off","Bloklu"]].map(([v,t])=>`<button class="${(s.acc||"on")===v?"on":""}" data-a="acc" data-id="${s.id}" data-v="${v}">${t}</button>`).join("")}</div></td></tr>`}).join("")||'<tr><td class="mu" colspan="3">Şagird yoxdur.</td></tr>'}</table></div>`;

 return`<section class="pn wide"><h3>Şagird, sinif və cihaz idarəsi</h3><div class="sub">${tab}</div>${b}</section>`}

// ── Notlar ────────────────────────────────────────────────────────────────────
function notesSec(){const E=EX(),legacy=(S.settings.notes||"").trim(),ns=[...E.notes].sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.at-a.at);
 const card=n=>`<div class="nt1 ${n.src==="rec"?"rec":""}" style="--r:${(parseInt(n.id,36)%5)-2}deg"><div class="acts"><button data-a="notepin" data-id="${n.id}" title="Sancaq">${n.pin?"★":"☆"}</button><button data-a="notedel" data-id="${n.id}" title="Sil">✕</button></div>${n.src==="rec"?"🎥 ":""}${esc(n.t)}<small>${dhm(n.at)}${n.src==="rec"?" · avtomatik":""}</small></div>`;
 return`<section class="pn wide"><h3>Notlar</h3><textarea class="in" id="nn" placeholder="Not yaz… (Ctrl+Enter ilə əlavə et)" maxlength="600" style="min-height:80px"></textarea><div class="row" style="margin-top:10px"><button class="bt pr" data-a="noteadd">Not əlavə et</button><span class="sp"></span><span class="mu">Ekran qeydlərini avtomatik notlara əlavə et</span><button class="tg ${E.autoRec?"on":""}" data-a="autorec" aria-label="Avtomatik əlavə"></button></div>
 <div class="nts">${legacy?`<div class="nt1" style="--r:-1deg"><div class="acts"><button data-a="legacydel" title="Sil">✕</button></div>${esc(legacy)}<small>köhnə not</small></div>`:""}${ns.map(card).join("")||(legacy?"":'<p class="mu">Hələ not yoxdur.</p>')}</div></section>`}
const _q=V.qeyd;V.qeyd=()=>{const h=_q(),i=h.indexOf('<section class="pn wide"><h3>Notlar</h3>');return h.slice(0,i)+notesSec()+"</div>"};
function noteFromRec(kind,name){if(EX().autoRec===false)return;const n={id:uidx(),t:(kind==="camera"?"Kamera":"Ekran")+" qeydi: "+(name||"qeyd.webm")+"\nFayl kompüterin yükləmələr qovluğuna endirildi.",at:Date.now(),src:"rec"};saveExt({notes:[n,...EX().notes].slice(0,80)})}

// ── Monitör pəncərəsi: müasir söhbət dizaynı ─────────────────────────────────────
let CHLOC={},CHREP=null,CHSIG="";
const dayLab=t=>{const d=new Date(t),n=sdate();return d.toDateString()===n.toDateString()?"Bu gün":pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear()};
function thread(p){const out=[],pre=p.name+": mesaj göndərildi — ";
 for(const l of S.logs)if(l.type==="əmr"&&l.text&&l.text.startsWith(pre))out.push({me:1,t:l.text.slice(pre.length),at:l.at});
 for(const q of S.questions)if(q.pc===p.id){out.push({me:0,t:q.text,at:q.at,qid:q.id,img:q.image,open:!q.answer});if(q.answer)out.push({me:1,t:q.answer.text,at:q.answer.at||q.at+1})}
 for(const m of CHLOC[p.id]||[])if(!out.some(o=>o.me&&o.t===m.t&&Math.abs(o.at-m.at)<120000))out.push(m);
 return out.sort((a,b)=>a.at-b.at)}
function chatHtml(th){let last="",h="";for(const m of th){const dl2=dayLab(m.at);if(dl2!==last){h+=`<div class="cd">${dl2}</div>`;last=dl2}
 h+=`<div class="cb ${m.me?"me":"st"}">${esc(m.t)}${m.img?'<div class="mu">(ekran şəkli əlavə olunub)</div>':""}${m.open?`<div><button class="bt" data-a="qrep" data-id="${esc(m.qid)}">Cavabla</button></div>`:""}<small>${hmm(m.at)}${m.me?(m.pend?" ✓":" ✓✓"):""}</small></div>`}
 return h||'<div class="cd">Hələ yazışma yoxdur — ilk mesajı göndər 👋</div>'}
function chatRefresh(f){const p=S.pcs.find(x=>x.id===MID),box=$("#cmsgs");if(!p||!box)return;const th=thread(p),sg=JSON.stringify(th.map(m=>[m.at,m.t.length,!!m.open]));if(!f&&sg===CHSIG)return;CHSIG=sg;const nb=box.scrollHeight-box.scrollTop-box.clientHeight<70;box.innerHTML=chatHtml(th);if(f||nb)box.scrollTop=box.scrollHeight}
async function chatSend(id){const inp=$("#pm"),v=inp.value.trim();if(!v)return toast("Əvvəlcə mesaj yazın");inp.value="";sfx("pop");
 if(CHREP){const q=CHREP;CHREP=null;$("#rpl").hidden=true;inp.placeholder="Mesaj yaz…";try{const r=await post("/api/teacher/answer",{qid:q,text:v});if(r.ok){toast("Cavab göndərildi");tick()}}catch(e){toast("Göndərilmədi")}return}
 (CHLOC[id]=CHLOC[id]||[]).push({me:1,t:v,at:Date.now(),pend:1});chatRefresh(true);await cmd(id,"message",{text:v},null);const m=CHLOC[id].find(x=>x.t===v&&x.pend);if(m)m.pend=0;chatRefresh(true)}
const _rm=refreshModal;refreshModal=function(){_rm();chatRefresh()};

// ── Tətbiqlər: Steam stilində kafelər, bloklu tətbiqdə X, Yeni/Köhnə mod ────────────
// ── Təhlükəsizlik: daha çox məhdudiyyət, hazır rejimlər, qoruma balı ───────────────
SECG.push(["Sistem alətləri (yeni)","",[["blockRun","Win+R (Çalıştır) bloku","Run pəncərəsi açılmır"],["blockMsconfig","MSConfig bloku","Sistem konfiqurasiyası açılmır"],["blockPowerShellIse","PowerShell ISE / Terminal bloku","Əlavə əmr sətri alətləri"],["blockServicesApp","Xidmətlər (services.msc) bloku","Xidmətləri dayandırmaq olmur"],["blockTaskScheduler","Tapşırıq planlayıcısı bloku","Gizli planlanmış tapşırıq yaradılmır"],["blockSafeBoot","Təhlükəsiz rejimdə açılışı blokla","Safe Mode ilə yan yol olmasın"],["blockTimeChange","Saat və tarix dəyişməsini blokla","Dərs cədvəlinə müdaxilə olmasın"]]],
 ["Şəbəkə və uzaq giriş (yeni)","",[["blockRemoteDesktop","Uzaq masaüstü və ekran paylaşımı bloku","RDP, AnyDesk, TeamViewer"],["blockProxyChange","Proksi ayarlarının dəyişməsini blokla","Sayt filtrinə yan yol olmasın"],["blockHostsEdit","Hosts faylının dəyişməsini blokla","Sayt bloklarını keçmək olmur"],["blockNetworkChange","Şəbəkə ayarlarını kilidlə","Wi-Fi / DNS dəyişmir"]]],
 ["Proqram, brauzer və fayl (yeni)","",[["blockAppUninstall","Proqramı silməyi blokla","Əlavə et / Sil bağlı"],["blockExeRename","Adı dəyişdirilmiş .exe-ni tut","Başlıq (MZ) yoxlanır"],["blockFileExplorerDrives","Fayl Explorer-də disklərə girişi məhdudlaşdır","Yalnız İstifadəçi qovluğu"],["blockExtInstall","Brauzer əlavələrinin quraşdırılmasını blokla","Chrome Web Store qapalı"],["blockIncognito","Gizli (incognito) pəncərəni blokla","Tarixçə həmişə qeydə alınır"],["blockClipboard","Mübadilə buferini (kopyala/yapışdır) blokla","Cavabı köçürməyin qarşısı"],["blockPrinting","Çapı blokla","Printer işləmir"],["blockScreenRecord","Ekran qeydi proqramlarını blokla","OBS və s."]]],
 ["Giriş və kilid (yeni)","",[["lockOnUsbRemove","USB çıxarılanda kilidlə","Fiziki açar kimi"],["requirePinUnlock","Kilidi açmaq üçün PIN tələb et","Şagird kilidi özü aça bilməsin"],["autoLogoutIdle","15 dəq. hərəkətsizlikdə hesabdan çıx","Açıq qalmış hesab olmasın"]]]);
const PRESETS={normal:["blockTaskMgr","blockCmd","blockRegedit","blockInstall","blockVpn","safeSearch","blurOnLock","watchNotice","maskPass","alertBlocked","logAll","blockMsconfig","blockPowerShellIse","blockRemoteDesktop","blockProxyChange","blockHostsEdit","blockTimeChange","blockAppUninstall"]};
function presetOpts(k){const all=SECG.flatMap(g=>g[2].map(x=>x[0])).filter(x=>!TOPK.includes(x)),o={};all.forEach(x=>o[x]=false);
 if(k==="normal")PRESETS.normal.forEach(x=>o[x]=true);
 else if(k==="strict"||k==="exam"){all.forEach(x=>o[x]=true);if(k==="exam"){o.onlyDexBrowser=true}}return o}

// ── Düymə və sahə hadisələri (app.js-in klik işləyicisi bilinməyən əməlləri bura ötürür) ──
window.xclick=function(a,t,e,id,i,k){const E=EX(),v=t.dataset.v;
 const go=()=>{lastSig="";DT=[WOFF,MT].join();render(true)};
 switch(a){
 case"nclr":N=[];bell();return true;
 case"ngo":{const n=N[i];if(n&&n.go){location.hash="#"+n.go;$("#nt").hidden=true}return true}
 case"wkprev":WOFF--;go();return true;case"wknext":WOFF++;go();return true;case"wktoday":WOFF=0;CALDAY=((sdate().getDay()+6)%7)+1;go();return true;
 case"calall":{const wp={...(S.settings.weekPlan||{})};wp[CALDAY]=S.class.schedule.map(()=>k==="1");save({weekPlan:wp},k==="1"?"Bütün dərslər bərpa olundu":"Bütün günün dərsləri ləğv edildi");return true}
 case"hdadd":{const d=$("#hd-d").value,n=$("#hd-n").value.trim();if(!d||!n){toast("Tarix və ad yazın");return true}const kind=$("#hd-k").value,date=$("#hd-y").checked?d.slice(5):d;saveExt({days:[...E.days,{date,name:n,kind}]},"Gün əlavə olundu");return true}
 case"hdx":saveExt({days:E.days.filter((_,j)=>j!==i)},"Silindi");return true;
 case"mtab":MT=k;go();return true;
 case"stadd":{const n=$("#sn").value.trim();if(!n){toast("Şagirdin adını yazın");return true}saveExt({students:[...E.students,{id:uidx(),n,c:$("#sc").value,pc:"",perm:{},acc:"on"}]},"Şagird əlavə olundu");return true}
 case"stbulk":{const ls=$("#sbulk").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,80);if(!ls.length){toast("Siyahı boşdur");return true}saveExt({students:[...E.students,...ls.map(n=>({id:uidx(),n:n.slice(0,40),c:"",pc:"",perm:{},acc:"on"}))]},ls.length+" şagird əlavə olundu");return true}
 case"stdel":saveExt({students:E.students.filter(s=>s.id!==id)},"Şagird silindi");return true;
 case"gadd":{const n=$("#gn").value.trim();if(!n){toast("Ad yazın");return true}saveExt({groups:[...E.groups,{id:uidx(),n}]},"Sinif əlavə olundu");return true}
 case"gdel":saveExt({groups:E.groups.filter(g=>g.id!==id),students:E.students.map(s=>s.c===id?{...s,c:""}:s)},"Sinif silindi");return true;
 case"perm":saveExt({students:E.students.map(s=>s.id===id?{...s,perm:{...(s.perm||{}),[k]:(s.perm||{})[k]===0?1:0}}:s)});return true;
 case"permall":saveExt({students:E.students.map(s=>({...s,perm:{...(s.perm||{}),[k]:+v}}))},"İcazələr yeniləndi");return true;
 case"acc":{const s=E.students.find(x=>x.id===id);if(!s)return true;saveExt({students:E.students.map(x=>x.id===id?{...x,acc:v}:x)});if(s.pc&&v!=="pend")cmd(s.pc,v==="off"?"lock":"unlock",{},v==="off"?s.n+" bloklandı (kilidləndi)":s.n+" üçün giriş açıldı");return true}
 case"noteadd":{const el=$("#nn"),v=el.value.trim();if(!v){toast("Notu yazın");return true}saveExt({notes:[{id:uidx(),t:v,at:Date.now()},...E.notes].slice(0,80)},"Not əlavə olundu");return true}
 case"notedel":saveExt({notes:E.notes.filter(n=>n.id!==id)},"Not silindi");return true;
 case"notepin":saveExt({notes:E.notes.map(n=>n.id===id?{...n,pin:!n.pin}:n)});return true;
 case"autorec":saveExt({autoRec:!E.autoRec});return true;
 case"legacydel":save({notes:""},"Köhnə not silindi");return true;
 case"qk":{const el=$("#pm");if(el){el.value=t.dataset.t;el.focus()}return true}
 case"qrep":{CHREP=id;const q=S.questions.find(x=>x.id===id),r=$("#rpl");r.hidden=false;r.textContent="↩ Cavab: "+(q?q.text.slice(0,80):"");$("#pm").placeholder="Cavabını yaz…";$("#pm").focus();return true}
 case"appmode":UI.appMode=v;saveUI();go();return true;
 case"preset":{const o=presetOpts(k);save({opts:o,...(k==="exam"||k==="strict"?{safeMode:true,webBlock:true}:{})},({normal:"Standart",strict:"Sıx",exam:"İmtahan",open:"Sərbəst"})[k]+" rejim tətbiq olundu");return true}
 }
 return window.wxclick?wxclick(a,t,e,id,i,k):false};
document.addEventListener("change",e=>{const t=e.target,E=EX();
 if(t.dataset&&t.dataset.sf){saveExt({students:E.students.map(s=>s.id===t.dataset.sid?{...s,[t.dataset.sf]:t.value}:s)});return}
 
 if(t.dataset&&t.dataset.df){const sid=t.value,pc=t.dataset.df;saveExt({students:E.students.map(s=>s.id===sid?{...s,pc}:(s.pc===pc?{...s,pc:""}:s))},"Cihaz təyin edildi")}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="pm"){e.preventDefault();chatSend(MID)}
 else if(e.key==="Enter"&&e.ctrlKey&&e.target.id==="nn"){const b=document.querySelector('[data-a="noteadd"]');if(b)b.click()}
 else if(e.key==="Enter"&&e.target.id==="sn"){const b=document.querySelector('[data-a="stadd"]');if(b)b.click()}
 else if(e.key==="Enter"&&e.target.id==="gn"){const b=document.querySelector('[data-a="gadd"]');if(b)b.click()}});

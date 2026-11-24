"use strict";
/* ================= utils ================= */
const $=id=>document.getElementById(id);
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>(n<0?"−$":"$")+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const pnlStr=n=>(n>0?"+":n<0?"−":"")+"$"+Math.abs(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const dkey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const sameDay=(ts,d=new Date())=>dkey(new Date(ts))===dkey(d);
const timeStr=ts=>new Date(ts).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"});
const whenStr=ts=>{const d=new Date(ts),n=new Date(),y=new Date();y.setDate(n.getDate()-1);if(sameDay(ts,n))return "Today · "+timeStr(ts);if(sameDay(ts,y))return "Yesterday · "+timeStr(ts);return d.toLocaleDateString([], {month:"short",day:"numeric"})+" · "+timeStr(ts)};
const ago=ts=>{if(!ts)return "never";const s=(Date.now()-ts)/1000;if(s<60)return "just now";if(s<3600)return Math.round(s/60)+" min ago";if(s<86400)return Math.round(s/3600)+" h ago";return Math.round(s/86400)+" d ago"};
const ACCTS={poly:"Polymarket",manual:"Manual",bob:"Bob"};
const GROUPS=["Morning","Day","Night","Anytime"];

/* ================= state ================= */
const KEY="dailyhq.v1";
const BOOKS=[["dreams","Dreams","Write it before it fades"],["ideas","Business ideas","Capture the spark"],["notes","Notes","Anything worth keeping"],["emotions","Emotions","How you feel, honestly"],["gratitude","Gratitude","What went right"]];
const MOODS=["Low","Meh","Okay","Good","Great"];
function defaults(){return{v:1,created:Date.now(),
 settings:{wallet:"",btcOnly:true,bank:{poly:0,manual:0,bob:0},stake:{poly:10,manual:10,bob:10},label:{poly:"BTC Up/Down",manual:"BTC",bob:"BTC"},book5:"Gratitude"},
 trades:{poly:[],manual:[],bob:[]},sync:{last:0,err:""},
 routine:[
  {id:uid(),t:"Wake up and drink water",time:"6:30",g:"Morning"},
  {id:uid(),t:"Check BTC levels",time:"7:00",g:"Morning"},
  {id:uid(),t:"Write in journal",time:"",g:"Morning"},
  {id:uid(),t:"Trading session",time:"9:00",g:"Day"},
  {id:uid(),t:"Workout",time:"",g:"Day"},
  {id:uid(),t:"Log dreams and emotions",time:"",g:"Night"}],
 days:{},journal:{dreams:[],ideas:[],notes:[],emotions:[],gratitude:[]},xp:0,best:0,
 ui:{acct:"poly",tf:"5m",book:"dreams",card:0,shown:30}}}
let S;
try{S=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){S=null}
if(!S||S.v!==1)S=defaults();
(function fill(){const d=defaults();for(const k in d)if(S[k]===undefined)S[k]=d[k];for(const k in d.settings)if(S.settings[k]===undefined)S.settings[k]=d.settings[k];for(const k in d.ui)if(S.ui[k]===undefined)S.ui[k]=d.ui[k];for(const b of BOOKS)if(!S.journal[b[0]])S.journal[b[0]]=[]})();
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast("Couldn't save. Your phone storage may be full.")}},150)}
addEventListener("pagehide",()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ================= feedback ================= */
function toast(t,btn,fn){document.querySelectorAll(".toast").forEach(x=>x.remove());const d=document.createElement("div");d.className="toast"+(btn?" long":"");d.innerHTML=`<span>${esc(t)}</span>`;if(btn){const b=document.createElement("button");b.textContent=btn;b.onclick=()=>{d.remove();fn()};d.appendChild(b)}document.body.appendChild(d);setTimeout(()=>d.remove(),btn?4600:2700)}
function burst(el,colors=["#EFBC90","#86D3B0","#F6E3CC","#7AB8B8"]){if(RM||!el)return;const r=el.getBoundingClientRect();for(let i=0;i<18;i++){const p=document.createElement("i");p.className="burst";p.style.left=(r.left+r.width/2)+"px";p.style.top=(r.top+r.height/2)+"px";p.style.background=colors[i%colors.length];const a=Math.random()*Math.PI*2,d=50+Math.random()*90;p.style.setProperty("--bx",Math.cos(a)*d+"px");p.style.setProperty("--by",Math.sin(a)*d-30+"px");p.style.setProperty("--br",Math.random()*540+"deg");document.body.appendChild(p);setTimeout(()=>p.remove(),900)}}
function countUp(el,to,from){if(RM||from===to){el.textContent=money(to);return}const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/900),e=1-Math.pow(1-k,3);el.textContent=money(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
const level=()=>Math.floor(S.xp/1000)+1;
function addXP(n,el){const before=level();S.xp=Math.max(0,S.xp+n);if(n>0&&level()>before){setTimeout(()=>{toast("Level up! You're level "+level());burst(el||document.body)},300)}}

/* ================= clock + week ================= */
function tick(){const d=new Date(),h=d.getHours()%12||12,m=String(d.getMinutes()).padStart(2,"0");$("time").innerHTML=`${h}<i>:</i>${m}`;$("dt").textContent=d.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"});
 if(tick.day&&tick.day!==dkey()){renderAll()}tick.day=dkey()}
function dayData(k){return S.days[k]||(S.days[k]={done:{},extra:[]})}
function tasksFor(k){const d=S.days[k]||{done:{},extra:[]};const list=[...S.routine.map(r=>({...r,rep:true})),...(d.extra||[]).map(x=>({...x,rep:false}))];
 list.sort((a,b)=>GROUPS.indexOf(a.g)-GROUPS.indexOf(b.g)||tmin(a.time)-tmin(b.time));return list}
function tmin(t){if(!t)return 9999;const m=/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i.exec(t.trim());if(!m)return 9998;let h=+m[1];const mm=+(m[2]||0);if(m[3]){const pm=/p/i.test(m[3]);if(pm&&h<12)h+=12;if(!pm&&h==12)h=0}return h*60+mm}
function isComplete(k){const t=tasksFor(k);if(!t.length)return false;const d=S.days[k];return !!d&&t.every(x=>d.done[x.id])}
function streak(){let n=0;const d=new Date();if(!isComplete(dkey(d)))d.setDate(d.getDate()-1);while(S.days[dkey(d)]&&S.days[dkey(d)].complete){n++;d.setDate(d.getDate()-1)}return n}
function renderWeek(){const w=$("week"),d0=new Date();w.innerHTML="";for(let i=0;i<7;i++){const x=new Date(d0);x.setDate(d0.getDate()+i);const k=dkey(x),dd=S.days[k];const b=document.createElement("button");b.setAttribute("aria-pressed",i==0);
  const dot=i==0?(isComplete(k)?'<i class="full"></i>':""):(dd&&dd.extra&&dd.extra.length?"<i></i>":"");
  b.innerHTML=`<span>${x.toLocaleDateString([], {weekday:"short"})}</span><strong>${x.getDate()}</strong>${dot}`;b.onclick=e=>{e.stopPropagation();openDay(k,x,b)};w.appendChild(b)}}
function openDay(k,x,b){$("week").querySelectorAll("button").forEach(z=>z.setAttribute("aria-pressed",z===b));document.querySelector(".dayCard")?.remove();const today=k===dkey();
 const c=document.createElement("div");c.className="dayCard";const sr=$("strip").getBoundingClientRect(),br=b.getBoundingClientRect();c.style.left=Math.max(8,Math.min(br.left-sr.left,sr.width-410))+"px";
 const draw=()=>{const list=tasksFor(k),dd=S.days[k]||{done:{}};
  c.innerHTML=`<div class="eyebrow">${today?"Today":"Planned"}</div><h3>${esc(x.toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"}))}</h3>
  <ul>${list.map(t=>`<li class="${today&&dd.done[t.id]?"done":""}"><span>${esc(t.time||t.g)}</span>${esc(t.t)}${t.rep?"":`<button class="link x" data-del="${t.id}" aria-label="Remove">✕</button>`}</li>`).join("")||'<li>No tasks yet</li>'}</ul>
  <form class="add" style="margin-top:10px"><input placeholder="Add a task for this day" aria-label="Task for this day" autocomplete="off"><button class="action p">Add</button></form>`;
  c.querySelector("form").onsubmit=e=>{e.preventDefault();const v=c.querySelector("input").value.trim();if(!v)return;dayData(k).extra.push({id:uid(),t:v,time:"",g:"Anytime"});save();draw();renderWeek();renderToday();toast("Added to "+x.toLocaleDateString([], {weekday:"long"}))};
  c.querySelectorAll("[data-del]").forEach(z=>z.onclick=e=>{e.stopPropagation();const dd2=dayData(k);dd2.extra=dd2.extra.filter(q=>q.id!==z.dataset.del);save();draw();renderToday()})};
 draw();$("strip").appendChild(c);c.addEventListener("click",e=>e.stopPropagation())}
document.addEventListener("click",e=>{if(!e.target.closest(".dayCard")&&!e.target.closest(".week")){document.querySelector(".dayCard")?.remove();$("week").querySelectorAll("button").forEach((z,i)=>z.setAttribute("aria-pressed",i==0))}});

/* ================= trades: stats ================= */
function tradesOf(a,tf){return S.trades[a].filter(t=>!t.hidden&&(tf==="All"||!tf||t.tf===tf))}
function stats(a,tf){const all=tradesOf(a,tf),res=all.filter(t=>t.res!=="open");const w=res.filter(t=>t.res==="win").length,l=res.length-w;
 const pnl=res.reduce((s,t)=>s+(+t.pnl||0),0),today=res.filter(t=>sameDay(t.ts)).reduce((s,t)=>s+(+t.pnl||0),0);
 const sorted=[...res].sort((x,y)=>y.ts-x.ts);let st="–";if(sorted.length){let n=0;const r0=sorted[0].res;for(const t of sorted){if(t.res===r0)n++;else break}st=(r0==="win"?"W":"L")+n}
 const open=all.filter(t=>t.res==="open");
 const allRes=tradesOf(a,"All").filter(t=>t.res!=="open");const bal=(+S.settings.bank[a]||0)+allRes.reduce((s,t)=>s+(+t.pnl||0),0);
 return{all,res,w,l,pnl,today,st,open,openCost:open.reduce((s,t)=>s+(+t.cost||0),0),bal,wr:res.length?Math.round(w/res.length*100):null,sorted}}

/* ================= Polymarket sync ================= */
const API="https://data-api.polymarket.com/v2";
function tfOf(slug,title){let m=/updown-(\d+)(m|h)\b/.exec(slug||"");if(m)return m[2]==="h"?m[1]+"h":m[1]+"m";
 m=/(\d{1,2})(?::(\d{2}))?\s*([AP]M)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*([AP]M)/i.exec(title||"");
 if(m){const a=tmin(`${m[1]}:${m[2]||"00"} ${m[3]}`),b=tmin(`${m[4]}:${m[5]||"00"} ${m[6]}`);let d=b-a;if(d<0)d+=1440;return d===60?"1h":d+"m"}
 if(/\d{1,2}\s*[AP]M/i.test(title||""))return "1h";return "Other"}
const isBTC=p=>/^btc-updown-/i.test(p.slug||"")||/^bitcoin up or down/i.test(p.title||"");
async function fetchPositions(wallet,status){let out=[],cursor=null,pages=0;do{const u=new URL(API+"/positions");u.searchParams.set("user",wallet);u.searchParams.set("limit","500");if(status)u.searchParams.set("status",status);if(cursor)u.searchParams.set("cursor",cursor);
  const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw new Error("Polymarket answered "+r.status);const j=await r.json();out.push(...(j.data||[]));cursor=j.pagination&&j.pagination.has_more?j.pagination.next_cursor:null;pages++}while(cursor&&pages<12);return out}
let syncing=false;
async function sync(manual){const w=S.settings.wallet.trim();if(!w){if(manual)openSettings("wallet");return}if(syncing)return;syncing=true;$("syncbtn").classList.add("spin");renderSyncLine("Syncing…");
 try{const [a,b]=await Promise.all([fetchPositions(w),fetchPositions(w,"CLOSED")]);const seen=new Set();let added=0,updated=0;
  for(const p of [...a,...b]){if(S.settings.btcOnly&&!isBTC(p))continue;const id="pm:"+p.condition_id+":"+p.outcome_index;if(seen.has(id))continue;seen.add(id);
   const st=(p.status||"").toUpperCase(),pnl=+(p.total_pnl??p.realized_pnl??0);
   const t={id,src:"sync",ts:((p.first_entry_at||p.last_event_at||Date.now()/1000)*1000),title:p.title||p.slug,slug:p.slug,tf:tfOf(p.slug,p.title),side:p.outcome||"",
    cost:+(p.total_cost_usdc||p.entry_cost_usdc||(p.avg_price*p.total_size)||0),price:+(p.avg_price||0),pnl:Math.round(pnl*100)/100,res:st==="OPEN"?"open":(pnl>0?"win":"loss"),status:st};
   const ex=S.trades.poly.find(x=>x.id===id);
   if(!ex){S.trades.poly.push(t);added++}else if(!ex.edited){const ch=ex.res!==t.res||ex.pnl!==t.pnl;Object.assign(ex,t,{note:ex.note,hidden:ex.hidden});if(ch)updated++}}
  if(S.settings.btcOnly)S.trades.poly=S.trades.poly.filter(t=>t.src!=="sync"||t.edited||isBTC(t));
  S.sync={last:Date.now(),err:""};save();renderTrades();renderCards();
  if(manual||added)toast(added?`Synced · ${added} new trade${added>1?"s":""}`:updated?`Synced · ${updated} updated`:"Synced · no new trades")}
 catch(e){S.sync.err=navigator.onLine===false?"You're offline":"Couldn't reach Polymarket";save();if(manual)toast(S.sync.err+". Try again in a minute.")}
 finally{syncing=false;$("syncbtn").classList.remove("spin");renderSyncLine()}}
function renderSyncLine(msg){const el=$("syncline");if(!el)return;const w=S.settings.wallet;$("syncdot").hidden=!!w;
 if(S.ui.acct!=="poly"){el.innerHTML=`<span class="pdot off"></span>Logged by hand`;return}
 if(!w){el.innerHTML=`<span class="pdot off"></span><button class="link" id="connect" style="color:#F1C39D">Connect your wallet to sync</button>`;$("connect").onclick=()=>openSettings("wallet");return}
 el.innerHTML=`<span class="pdot ${S.sync.err?"err":""}"></span>${esc(msg||(S.sync.err?S.sync.err:"Synced "+ago(S.sync.last)))}<button class="link" id="syncnow">Sync now</button>`;$("syncnow").onclick=()=>sync(true)}

/* ================= trades: render ================= */
let shownBal=null;
function renderTrades(){const a=S.ui.acct,tf=S.ui.tf,st=stats(a,tf);
 document.querySelectorAll("#acct button").forEach(b=>b.classList.toggle("on",b.dataset.a===a));document.querySelectorAll("#tf button").forEach(b=>b.classList.toggle("on",b.dataset.t===tf));segAll();
 const balEl=$("bal");if(shownBal===null||S.view!=="trades")balEl.textContent=money(st.bal);else countUp(balEl,st.bal,shownBal);shownBal=st.bal;
 const tp=$("todaypnl");tp.textContent=(st.today>=0?"▲ ":"▼ ")+pnlStr(st.today)+" today";tp.className="chip "+(st.today>0?"up":st.today<0?"dn":"");
 const ap=$("allpnl");ap.textContent=pnlStr(st.pnl)+(tf==="All"?" all time":" on "+tf);ap.className="chip "+(st.pnl>0?"up":st.pnl<0?"dn":"");
 $("openchip").hidden=!st.open.length;$("openchip").textContent=st.open.length+" open · $"+st.openCost.toFixed(2)+" in play";
 $("wr").textContent=st.wr===null?"–":st.wr+"%";$("wr").className=st.wr===null?"":st.wr>=50?"up":"dn";$("rec").textContent=st.w+"–"+st.l;$("tstreak").textContent=st.st;$("tstreak").className=/^W/.test(st.st)?"up":/^L/.test(st.st)?"dn":"";$("tcount").textContent=st.all.length;
 $("quicklabel").textContent="Quick log · $"+(+S.settings.stake[a]||0)+" "+(a==="poly"?(tf==="All"?"5m":tf):"");
 drawSpark(st);
 const list=[...st.all].sort((x,y)=>y.ts-x.ts),n=S.ui.shown;
 $("log").innerHTML=list.length?list.slice(0,n).map(t=>`<button class="tr" data-id="${t.id}"><span class="res ${t.res==="win"?"w":t.res==="loss"?"l":"o"}">${t.res==="win"?"WON":t.res==="loss"?"LOST":"OPEN"}</span><span class="ti"><div>${esc(t.title||S.settings.label[a])}${t.side?" · "+esc(t.side):""}</div><small>${esc(t.tf)} · ${whenStr(t.ts)}${t.cost?" · $"+(+t.cost).toFixed(2)+" in":""}${t.src==="sync"?" · synced":""}${t.edited?" · edited":""}</small></span><span class="amt ${t.pnl>0?"up":t.pnl<0?"dn":""}">${t.res==="open"?"open":pnlStr(+t.pnl||0)}</span><span class="pen" aria-hidden="true">✎</span></button>`).join("")+(list.length>n?`<button class="action more" id="moretr">Show more</button>`:"")
  :`<div class="empty"><b>${a==="poly"&&!S.settings.wallet?"Connect your wallet or log your first trade":"No trades here yet"}</b>${a==="poly"?"Synced trades show up here automatically. You can also tap + Won or + Lost.":"Tap + Won or + Lost after each trade. Tap any trade to fix it."}</div>`;
 $("log").querySelectorAll(".tr").forEach(b=>b.onclick=()=>editTrade(a,b.dataset.id));
 $("moretr")&&($("moretr").onclick=()=>{S.ui.shown+=30;renderTrades()});renderSyncLine()}
function drawSpark(st){const sv=$("spark"),pts=[...st.res].sort((x,y)=>x.ts-y.ts).slice(-80);let acc=0;const ys=[0,...pts.map(t=>acc+=(+t.pnl||0))];
 if(ys.length<3){sv.innerHTML=`<text x="300" y="66" text-anchor="middle" fill="#A9BBB9" font-size="14" font-family="Work Sans,sans-serif">Your P&amp;L line appears after a few trades</text><line x1="0" x2="600" y1="96" y2="96" stroke="rgba(226,241,238,.18)" stroke-dasharray="4 6"/>`;return}
 const mn=Math.min(...ys),mx=Math.max(...ys),span=mx-mn||1,X=i=>i/(ys.length-1)*600,Y=v=>108-(v-mn)/span*96;
 const line=ys.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" "),up=ys[ys.length-1]>=0,col=up?"#EFBC90":"#EE8E86";
 sv.innerHTML=`<defs><linearGradient id="gf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
 ${mn<0&&mx>0?`<line x1="0" x2="600" y1="${Y(0)}" y2="${Y(0)}" stroke="rgba(226,241,238,.2)" stroke-dasharray="4 6"/>`:""}
 <path d="${line} L600 120 L0 120Z" fill="url(#gf)"/><path class="line" d="${line}" fill="none" stroke="${col}" stroke-width="2.5" vector-effect="non-scaling-stroke"/><circle cx="600" cy="${Y(ys[ys.length-1])}" r="4.5" fill="${col}"/>`}
function quickLog(win,el){const a=S.ui.acct,stake=+S.settings.stake[a]||0,tf=a==="poly"?(S.ui.tf==="All"?"5m":S.ui.tf):(S.ui.tf==="All"?"5m":S.ui.tf);
 const t={id:uid(),src:"manual",ts:Date.now(),title:S.settings.label[a],tf,side:"",cost:stake,pnl:win?stake:-stake,res:win?"win":"loss",note:""};S.trades[a].push(t);addXP(5,el);save();renderTrades();renderCards();
 if(win)burst(el,["#86D3B0","#EFBC90","#F6E3CC"]);toast((win?"Win":"Loss")+" logged · "+pnlStr(t.pnl),"Edit",()=>editTrade(a,t.id))}

/* ================= sheet ================= */
function closeSheet(){$("sheetwrap").hidden=true;$("sheet").innerHTML=""}
$("sheetwrap").addEventListener("click",e=>{if(e.target===$("sheetwrap"))closeSheet()});
addEventListener("keydown",e=>{if(e.key==="Escape"){closeSheet();orbit(false)}});
function openSheet(html,bind){$("sheet").innerHTML=`<div class="grab"></div>`+html;$("sheetwrap").hidden=false;bind($("sheet"));const f=$("sheet").querySelector("input:not([type=checkbox]),textarea");if(f&&matchMedia("(hover:hover)").matches)f.focus()}
function opts(name,list,val,cls=""){return `<div class="opts ${cls}" data-name="${name}">${list.map(([v,l])=>`<button type="button" data-v="${esc(v)}" class="${v===val?"on":""}">${esc(l)}</button>`).join("")}</div>`}
function bindOpts(root,onChange){root.querySelectorAll(".opts").forEach(g=>g.querySelectorAll("button").forEach(b=>b.onclick=()=>{g.querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));onChange&&onChange(g.dataset.name,b.dataset.v)}))}
const optVal=(root,name)=>root.querySelector(`.opts[data-name="${name}"] .on`)?.dataset.v;
const toLocalInput=ts=>{const d=new Date(ts);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};

function editTrade(a,id){const isNew=!id;const t=isNew?{id:uid(),src:"manual",ts:Date.now(),title:S.settings.label[a],tf:S.ui.tf==="All"?"5m":S.ui.tf,side:"",cost:+S.settings.stake[a]||0,pnl:+S.settings.stake[a]||0,res:"win",note:""}:S.trades[a].find(x=>x.id===id);if(!t)return;
 openSheet(`<h2>${isNew?"Add a trade":"Edit trade"}</h2><p class="desc">${ACCTS[a]}${t.src==="sync"?" · synced from Polymarket. Your changes stay even after the next sync.":""}</p>
 <div class="field"><label>Result</label>${opts("res",[["win","Won"],["loss","Lost"],["open","Still open"]],t.res,"wl")}</div>
 <div class="pair"><div class="field"><label for="f-cost">Amount in ($)</label><input id="f-cost" type="number" inputmode="decimal" step="0.01" value="${+t.cost||0}"></div>
 <div class="field"><label for="f-pnl">Profit or loss ($)</label><input id="f-pnl" type="number" inputmode="decimal" step="0.01" value="${+t.pnl||0}"></div></div>
 <div class="field"><label>Timeframe</label>${opts("tf",[["5m","5m"],["15m","15m"],["1h","1h"],["Other","Other"]],["5m","15m","1h"].includes(t.tf)?t.tf:"Other")}</div>
 <div class="field"><label>Side</label>${opts("side",[["Up","Up"],["Down","Down"],["","None"]],t.side||"")}</div>
 <div class="field"><label for="f-title">Market</label><input id="f-title" value="${esc(t.title)}" autocomplete="off"></div>
 <div class="field"><label for="f-ts">When</label><input id="f-ts" type="datetime-local" value="${toLocalInput(t.ts)}"></div>
 <div class="field"><label for="f-note">Note</label><textarea id="f-note" style="min-height:80px" placeholder="Why you took it, what you learned">${esc(t.note||"")}</textarea></div>
 <div class="btns"><button class="action p" id="f-save">${isNew?"Add trade":"Save changes"}</button>${isNew?"":`<button class="action danger" id="f-del">Delete</button>`}</div><div id="f-conf"></div>`,
 root=>{bindOpts(root,(n,v)=>{if(n==="res"){const p=root.querySelector("#f-pnl"),c=+root.querySelector("#f-cost").value||0;let x=+p.value||0;if(v==="win"&&x<=0)x=Math.abs(x)||c;if(v==="loss"&&x>=0)x=-(Math.abs(x)||c);if(v==="open")x=0;p.value=x}});
  root.querySelector("#f-save").onclick=()=>{const res=optVal(root,"res");let pnl=+root.querySelector("#f-pnl").value||0;if(res==="loss"&&pnl>0)pnl=-pnl;if(res==="win"&&pnl<0)pnl=-pnl;
   Object.assign(t,{res,pnl:Math.round(pnl*100)/100,cost:+root.querySelector("#f-cost").value||0,tf:optVal(root,"tf"),side:optVal(root,"side"),title:root.querySelector("#f-title").value.trim()||S.settings.label[a],ts:new Date(root.querySelector("#f-ts").value).getTime()||t.ts,note:root.querySelector("#f-note").value.trim()});
   if(t.src==="sync")t.edited=true;if(isNew){S.trades[a].push(t);addXP(5)}save();closeSheet();renderTrades();renderCards();toast(isNew?"Trade added":"Trade updated")};
  const del=root.querySelector("#f-del");if(del)del.onclick=()=>{if(!del.dataset.sure){del.dataset.sure=1;del.textContent="Tap again to delete";root.querySelector("#f-conf").innerHTML=`<div class="confirm">${t.src==="sync"?"This hides the trade. It won't come back on the next sync. You can restore hidden trades in Settings.":"This removes the trade for good."}</div>`;return}
   if(t.src==="sync")t.hidden=true;else S.trades[a]=S.trades[a].filter(x=>x.id!==t.id);save();closeSheet();renderTrades();renderCards();toast("Trade deleted")}})}

/* ================= today ================= */
function renderToday(just){const k=dkey(),dd=dayData(k),list=tasksFor(k),left=list.filter(t=>!dd.done[t.id]);
 $("prog").textContent=(list.length-left.length)+" / "+list.length;const bd=$("dbadge");bd.hidden=!left.length;bd.textContent=left.length;
 $("dnt").textContent=left[0]?left[0].t:list.length?"All clear for today":"Add your first task";$("dncount").textContent=left.length?"1 of "+left.length:"Done";
 $("dnsub").textContent=left[0]?(left[0].rep?"From your daily routine.":"Today only.")+(left[0].time?" Planned for "+left[0].time+".":"")+" Finish the list to keep your streak.":list.length?"Everything's done. Your streak is safe.":"Use the box below to build your routine.";
 $("dnxp").textContent=`Level ${level()} · ${S.xp%1000} / 1000 XP`;$("dndone").hidden=$("dnskip").hidden=!left[0];
 let first=true,g="";const html=list.map(t=>{const done=!!dd.done[t.id];const tag=done?"":(first?(first=false,'<span class="tag now">NOW</span>'):'');const head=t.g!==g?(g=t.g,`<div class="grp">${esc(g)}</div>`):"";
  return head+`<div class="it ${done?"done":""} ${t.id===just?"just":""}"><button class="main" data-id="${t.id}"><span class="ck">${done?"✓":""}</span>${tag}<span class="t">${esc(t.t)}</span></button><span class="r">${esc(t.time||"")}${t.rep?"":" · today"}</span><button class="ed" data-ed="${t.id}" aria-label="Edit task">✎</button></div>`}).join("");
 $("tasks").innerHTML=html||`<div class="empty"><b>Build your daily routine</b>Add the things you do every day. They'll come back each morning.</div>`;
 $("tasks").querySelectorAll(".main").forEach(b=>b.onclick=()=>toggleTask(b.dataset.id,b));$("tasks").querySelectorAll("[data-ed]").forEach(b=>b.onclick=()=>editTask(b.dataset.ed));
 $("streaklbl").textContent=streak()+(streak()===1?" day":" days")}
function toggleTask(id,el){const k=dkey(),dd=dayData(k);dd.done[id]=!dd.done[id];if(!dd.done[id])delete dd.done[id];addXP(dd.done[id]?10:-10,el);
 const was=dd.complete;dd.complete=isComplete(k);const s=streak();if(s>S.best)S.best=s;save();renderToday(dd.done[id]?id:null);renderWeek();renderCards();
 if(dd.complete&&!was){toast("Day cleared. "+s+"-day streak.");burst(el)}else if(dd.done[id])toast("+10 XP")}
function editTask(id){const k=dkey(),r=S.routine.find(x=>x.id===id),ex=dayData(k).extra.find(x=>x.id===id),t=r||ex;if(!t)return;
 openSheet(`<h2>Edit task</h2><p class="desc">${r?"Part of your daily routine.":"Today only."}</p>
 <div class="field"><label for="t-t">Task</label><input id="t-t" value="${esc(t.t)}" autocomplete="off"></div>
 <div class="pair"><div class="field"><label for="t-time">Time (optional)</label><input id="t-time" value="${esc(t.time||"")}" placeholder="6:30"></div><div class="field"><label>Repeat</label>${opts("rep",[["daily","Every day"],["once","Today only"]],r?"daily":"once")}</div></div>
 <div class="field"><label>Part of the day</label>${opts("g",GROUPS.map(x=>[x,x]),t.g||"Anytime")}</div>
 <div class="btns"><button class="action p" id="t-save">Save</button><button class="action danger" id="t-del">${r?"Remove from routine":"Delete"}</button></div>`,
 root=>{bindOpts(root);root.querySelector("#t-save").onclick=()=>{const nt={id:t.id,t:root.querySelector("#t-t").value.trim()||t.t,time:root.querySelector("#t-time").value.trim(),g:optVal(root,"g")};const rep=optVal(root,"rep");
   S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);if(rep==="daily")S.routine.push(nt);else dd.extra.push(nt);save();closeSheet();renderToday();renderWeek();renderCards();toast("Task saved")};
  root.querySelector("#t-del").onclick=()=>{S.routine=S.routine.filter(x=>x.id!==id);const dd=dayData(k);dd.extra=dd.extra.filter(x=>x.id!==id);delete dd.done[id];save();closeSheet();renderToday();renderWeek();renderCards();toast("Task removed")}})}
$("addf").onsubmit=e=>{e.preventDefault();const v=$("nt").value.trim();if(!v)return;const t={id:uid(),t:v,time:"",g:"Anytime"};if($("rep").value==="daily")S.routine.push(t);else dayData(dkey()).extra.push(t);
 const dd=dayData(dkey());dd.complete=isComplete(dkey());$("nt").value="";save();renderToday();renderWeek();renderCards();toast($("rep").value==="daily"?"Added to your routine":"Added for today")};
$("dndone").onclick=e=>{const k=dkey(),t=tasksFor(k).find(x=>!dayData(k).done[x.id]);if(t)toggleTask(t.id,e.currentTarget)};
$("dnskip").onclick=()=>{const k=dkey(),dd=dayData(k),list=tasksFor(k).filter(x=>!dd.done[x.id]);if(list.length<2){toast("It's the last one left");return}
 const t=list[0];const ex=dd.extra.find(x=>x.id===t.id),r=S.routine.find(x=>x.id===t.id);(ex||r).g="Anytime";(ex||r).time=(ex||r).time||"";save();renderToday();toast("Moved to later")};

/* ================= journal ================= */
const bookName=k=>k==="gratitude"?(S.settings.book5||"Gratitude"):BOOKS.find(b=>b[0]===k)[1];
let bookArt=null;
function renderJournal(){if(!bookArt)bookArt=BOOKS.map((b,i)=>{const cv=document.createElement("canvas");paintScene(cv,[2,1,0,4,3][i],560,360,i*17+3);return cv.toDataURL("image/jpeg",.72)});
 $("books").innerHTML=BOOKS.map((b,i)=>`<button class="book ${b[0]===S.ui.book?"on":""}" data-b="${b[0]}" style="background-image:url(${bookArt[i]})"><div class="lab"><b>${esc(bookName(b[0]))}</b><small>${S.journal[b[0]].length} ${S.journal[b[0]].length===1?"entry":"entries"}</small></div></button>`).join("");
 $("books").querySelectorAll(".book").forEach(b=>b.onclick=()=>{S.ui.book=b.dataset.b;save();renderJournal()});
 const k=S.ui.book,hint=BOOKS.find(b=>b[0]===k)[2],list=[...S.journal[k]].sort((a,b)=>b.ts-a.ts);
 $("jpanel").innerHTML=`<div class="row sb"><div><div class="eyebrow">${esc(bookName(k))}</div><div class="h1" style="font-size:30px">${esc(hint)}</div></div><button class="action p" id="newentry">New entry</button></div>
 <form class="add" id="qentry"><input id="ne" placeholder="Quick note… (tap New entry for more room)" aria-label="Quick entry" autocomplete="off"><button class="action">Save</button></form>
 ${list.length?list.map(e=>`<button class="entry" data-id="${e.id}"><h4>${esc(e.title||"Untitled")}</h4>${e.body?`<p>${esc(e.body)}</p>`:""}<div class="when">${whenStr(e.ts)}${e.mood!=null&&e.mood!==""?`<span class="mood">${MOODS[e.mood]}</span>`:""}</div></button>`).join(""):`<div class="empty"><b>Nothing here yet</b>${k==="dreams"?"Write down last night's dream before it fades.":"Your entries will show up here, newest first."}</div>`}`;
 $("newentry").onclick=()=>editEntry(k);$("jpanel").querySelectorAll(".entry").forEach(b=>b.onclick=()=>editEntry(k,b.dataset.id));
 $("qentry").onsubmit=e=>{e.preventDefault();const v=$("ne").value.trim();if(!v)return;S.journal[k].push({id:uid(),title:v.length>60?v.slice(0,57)+"…":v,body:v.length>60?v:"",ts:Date.now()});addXP(5);save();renderJournal();renderCards();toast("Saved · +5 XP")}}
function editEntry(k,id){const isNew=!id,e=isNew?{id:uid(),title:"",body:"",ts:Date.now(),mood:k==="emotions"?2:null}:S.journal[k].find(x=>x.id===id);if(!e)return;
 openSheet(`<h2>${isNew?"New":"Edit"} ${esc(bookName(k).toLowerCase())} entry</h2><p class="desc">${whenStr(e.ts)}</p>
 ${k==="emotions"?`<div class="field"><label>How do you feel?</label>${opts("mood",MOODS.map((m,i)=>[String(i),m]),String(e.mood??2))}</div>`:""}
 <div class="field"><label for="e-t">Title</label><input id="e-t" value="${esc(e.title)}" placeholder="${k==="dreams"?"Flying over the ocean":k==="ideas"?"App for traders":"A few words"}" autocomplete="off"></div>
 <div class="field"><label for="e-b">Write it down</label><textarea id="e-b" placeholder="Everything you remember…">${esc(e.body)}</textarea></div>
 <div class="btns"><button class="action p" id="e-save">${isNew?"Save · +5 XP":"Save changes"}</button>${isNew?"":`<button class="action danger" id="e-del">Delete</button>`}</div>`,
 root=>{bindOpts(root);root.querySelector("#e-save").onclick=()=>{const title=root.querySelector("#e-t").value.trim(),body=root.querySelector("#e-b").value.trim();if(!title&&!body){toast("Write something first");return}
   Object.assign(e,{title:title||(body.split("\n")[0].slice(0,57)),body,mood:k==="emotions"?+optVal(root,"mood"):null});if(isNew){S.journal[k].push(e);addXP(5)}save();closeSheet();renderJournal();renderCards();toast(isNew?"Saved · +5 XP":"Entry updated")};
  const d=root.querySelector("#e-del");if(d)d.onclick=()=>{if(!d.dataset.sure){d.dataset.sure=1;d.textContent="Tap again to delete";return}S.journal[k]=S.journal[k].filter(x=>x.id!==e.id);save();closeSheet();renderJournal();renderCards();toast("Entry deleted")}})}

/* ================= settings ================= */
function openSettings(focus){const s=S.settings,hidden=S.trades.poly.filter(t=>t.hidden).length+S.trades.manual.filter(t=>t.hidden).length+S.trades.bob.filter(t=>t.hidden).length;
 openSheet(`<h2>Settings</h2><p class="desc">Everything is saved on this phone. Make a backup now and then.</p>
 <div class="sec" style="margin-top:6px;border-top:0;padding-top:0"><h3>Polymarket sync</h3><p class="desc">Paste your Polymarket wallet address. On Polymarket, open your profile and copy the address that starts with 0x. It only lets this app read your public trades. It can't trade or move money.</p>
  <div class="field"><label for="s-w">Wallet address</label><input id="s-w" value="${esc(s.wallet)}" placeholder="0x…" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="hint" id="s-werr"></span></div>
  <div class="field"><label><input type="checkbox" id="s-btc" ${s.btcOnly?"checked":""} style="width:auto;margin-right:8px">Only track Bitcoin Up or Down markets</label></div></div>
 <div class="sec"><h3>Starting balances</h3><p class="desc">Balance = starting balance + profit and loss from settled trades.</p>
  <div class="pair">${Object.keys(ACCTS).map(a=>`<div class="field"><label for="s-b-${a}">${ACCTS[a]}</label><input id="s-b-${a}" type="number" inputmode="decimal" step="0.01" value="${+s.bank[a]||0}"></div>`).join("")}</div></div>
 <div class="sec"><h3>Quick log defaults</h3><p class="desc">What + Won and + Lost log for each tab. You can edit any trade afterwards.</p>
  ${Object.keys(ACCTS).map(a=>`<div class="pair"><div class="field"><label for="s-s-${a}">${ACCTS[a]} amount ($)</label><input id="s-s-${a}" type="number" inputmode="decimal" step="0.01" value="${+s.stake[a]||0}"></div><div class="field"><label for="s-l-${a}">${ACCTS[a]} market name</label><input id="s-l-${a}" value="${esc(s.label[a])}"></div></div>`).join("")}</div>
 <div class="sec"><h3>Journal</h3><div class="field"><label for="s-b5">Name of your fifth journal section</label><input id="s-b5" value="${esc(s.book5)}"></div></div>
 <div class="btns"><button class="action p" id="s-save">Save settings</button></div>
 <div class="sec"><h3>Backup</h3><p class="desc">Save a backup file, or restore one on a new phone.</p>
  <div class="btns" style="margin-top:8px"><button class="action" id="s-exp">Save backup</button><button class="action" id="s-imp">Restore backup</button></div>
  ${hidden?`<div class="btns"><button class="action" id="s-unhide">Restore ${hidden} hidden trade${hidden>1?"s":""}</button></div>`:""}
  <div class="btns"><button class="action danger" id="s-reset">Erase everything</button></div><div id="s-conf"></div></div>`,
 root=>{if(focus==="wallet")setTimeout(()=>root.querySelector("#s-w").focus(),60);
  root.querySelector("#s-save").onclick=()=>{const w=root.querySelector("#s-w").value.trim();if(w&&!/^0x[a-fA-F0-9]{40}$/.test(w)){root.querySelector("#s-werr").textContent="That doesn't look like a wallet address. It should start with 0x and be 42 characters long.";root.querySelector("#s-werr").style.color="var(--rose)";return}
   const changed=w.toLowerCase()!==s.wallet.toLowerCase(),btcChanged=s.btcOnly!==root.querySelector("#s-btc").checked;s.wallet=w;s.btcOnly=root.querySelector("#s-btc").checked;for(const a in ACCTS){s.bank[a]=+root.querySelector("#s-b-"+a).value||0;s.stake[a]=+root.querySelector("#s-s-"+a).value||0;s.label[a]=root.querySelector("#s-l-"+a).value.trim()||s.label[a]}
   s.book5=root.querySelector("#s-b5").value.trim()||"Gratitude";if(changed||btcChanged)S.trades.poly=S.trades.poly.filter(t=>t.src!=="sync");save();closeSheet();renderAll();toast("Settings saved");if(w&&(changed||btcChanged||!S.sync.last))sync(true)};
  root.querySelector("#s-exp").onclick=exportData;root.querySelector("#s-imp").onclick=()=>$("importfile").click();
  const un=root.querySelector("#s-unhide");if(un)un.onclick=()=>{for(const a in ACCTS)S.trades[a].forEach(t=>delete t.hidden);save();closeSheet();renderAll();toast("Hidden trades restored")};
  const r=root.querySelector("#s-reset");r.onclick=()=>{if(!r.dataset.sure){r.dataset.sure=1;r.textContent="Tap again to erase";root.querySelector("#s-conf").innerHTML=`<div class="confirm">This deletes all trades, tasks, journal entries and settings on this phone. Save a backup first if you might want them back.</div>`;return}
   S=defaults();save();closeSheet();renderAll();toast("Everything erased")}})}
function exportData(){const blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`daily-hq-backup-${dkey()}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);toast("Backup saved to your downloads")}
$("importfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(d.v!==1||!d.trades||!d.journal)throw 0;S=d;save();closeSheet();renderAll();toast("Backup restored")}catch(x){toast("That file isn't a Daily HQ backup")}e.target.value=""};

/* ================= home theatre ================= */
const CARDS=[
 {pal:0,go:["trades",{acct:"poly"}],k:()=>"Polymarket",s:()=>S.ui.tf==="All"?"All timeframes":S.ui.tf,
  h:()=>{const st=stats("poly","All");if(!S.settings.wallet&&!st.all.length)return "Connect your wallet to start tracking";if(!st.res.some(t=>sameDay(t.ts)))return "No settled trades yet today";return `You're ${st.today>=0?"up":"down"} $${Math.abs(st.today).toFixed(2)} today`},
  i:()=>{const st=stats("poly",S.ui.tf==="All"?"All":S.ui.tf);return st.res.length?`Win rate ${st.wr}% across ${st.res.length} settled trades${S.ui.tf==="All"?"":" on "+S.ui.tf}.`:"Trades sync from your wallet and land here automatically."},
  f:()=>{const st=stats("poly","All");return[["Score",st.w+"–"+st.l],["Streak",st.st],["Synced",S.settings.wallet?ago(S.sync.last):"Not set up"]]},b:()=>!S.settings.wallet&&!stats("poly","All").all.length?"Set up sync":"Open trades"},
 {pal:1,go:["today"],k:()=>"Today",s:()=>new Date().toLocaleDateString([], {weekday:"long",month:"long",day:"numeric"}),
  h:()=>{const k=dkey(),t=tasksFor(k).find(x=>!(S.days[k]&&S.days[k].done[x.id]));return t?"Do next: "+t.t:"Day cleared"},
  i:()=>"Your routine comes back every morning. Finish every task to grow your streak.",
  f:()=>{const k=dkey(),l=tasksFor(k),d=l.filter(x=>S.days[k]&&S.days[k].done[x.id]).length;return[["Done",d+" of "+l.length],["XP",S.xp],["Streak",streak()+" days"]]},b:()=>"Open Today"},
 {pal:2,go:["journal",{book:"dreams"}],k:()=>"Journal",s:()=>"Dreams",
  h:()=>{const l=[...S.journal.dreams].sort((a,b)=>b.ts-a.ts)[0];return l?"Last dream: "+l.title:"Write down last night's dream"},
  i:()=>"Dreams, business ideas, notes, emotions and "+bookName("gratitude").toLowerCase()+", all in one place.",
  f:()=>[["Dreams",S.journal.dreams.length],["Ideas",S.journal.ideas.length],["All entries",BOOKS.reduce((s,b)=>s+S.journal[b[0]].length,0)]],b:()=>"Open journal"},
 {pal:3,go:["today"],k:()=>"Progress",s:()=>"Level "+level(),
  h:()=>{const s=streak();return s?`${s}-day streak. Keep it going`:"Clear today's list to start a streak"},
  i:()=>`${1000-S.xp%1000} XP to level ${level()+1}. Tasks give 10 XP, trades and journal entries give 5.`,
  f:()=>[["XP",S.xp],["Best streak",Math.max(S.best,streak())+" days"],["Level",level()]],b:()=>"See today"},
 {pal:4,go:["trades",{acct:"bob"}],k:()=>"Manual and Bob",s:()=>"Hand-logged",
  h:()=>{const b=stats("bob","All"),m=stats("manual","All");if(!b.all.length&&!m.all.length)return "Log Bob's trades and your own";return `Bob is ${b.w}–${b.l}, you're ${m.w}–${m.l}`},
  i:()=>"Two separate journals so you can compare Bob's trades with your manual ones.",
  f:()=>{const b=stats("bob","All"),m=stats("manual","All");return[["Bob P&L",pnlStr(b.pnl)],["Manual P&L",pnlStr(m.pnl)],["Today",pnlStr(b.today+m.today)]]},b:()=>"See Bob's trades"}];
const rail=$("rail");
CARDS.forEach((cd,i)=>{const el=document.createElement("article");el.className="card";el.tabIndex=0;
 el.innerHTML=`<div class="surf"><canvas></canvas><div class="shade"></div><div class="glare"></div><div class="meta"><span>Daily HQ / Feed</span><span>${String(i+1).padStart(2,"0")} / ${String(CARDS.length).padStart(2,"0")}</span></div>
 <div class="cover"><div class="k"></div><strong></strong><div class="insight"><div class="ins"></div><div class="facts"></div></div></div><button class="cta"></button></div>`;
 cd.el=el;rail.appendChild(el);
 el.addEventListener("click",e=>{if(drag.moved)return;if(i!==S.ui.card){S.ui.card=i;save();layout();return}
  if(e.target.closest(".cta")||!matchMedia("(hover:hover)").matches&&el.classList.contains("peek")||matchMedia("(hover:hover)").matches)openCard(i);else{el.classList.add("peek")}});
 el.addEventListener("keydown",e=>{if(e.key==="Enter")openCard(i)});
 el.addEventListener("pointermove",e=>{if(RM||i!==S.ui.card||e.pointerType==="touch")return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,sf=el.querySelector(".surf");
  sf.style.setProperty("--rx",((.5-y)*5).toFixed(2)+"deg");sf.style.setProperty("--ry",((x-.5)*7).toFixed(2)+"deg");sf.style.setProperty("--lift","-4px");sf.style.setProperty("--depth","26px");sf.style.setProperty("--gx",x*100+"%");sf.style.setProperty("--gy",y*100+"%")});
 el.addEventListener("pointerenter",e=>{if(i===S.ui.card&&e.pointerType!=="touch")document.body.classList.add("hover")});
 el.addEventListener("pointerleave",()=>{const sf=el.querySelector(".surf");["--rx","--ry","--lift","--depth"].forEach(p=>sf.style.removeProperty(p));document.body.classList.remove("hover")})});
function paintCards(){CARDS.forEach((cd,i)=>{const cv=cd.el.querySelector("canvas");const small=innerWidth<800;paintScene(cv,cd.pal,small?900:1400,small?560:860);cd.amb=lowresOf(cv)})}
function renderCards(){CARDS.forEach(cd=>{const el=cd.el;el.querySelector(".k").innerHTML=`${esc(cd.k())} <span>· ${esc(cd.s())}</span>`;el.querySelector("strong").textContent=cd.h();el.querySelector(".ins").textContent=cd.i();
  el.querySelector(".facts").innerHTML=cd.f().map(f=>`<div><small>${esc(f[0])}</small><b>${esc(f[1])}</b></div>`).join("");el.querySelector(".cta").innerHTML=`${esc(cd.b())} <span aria-hidden="true">→</span>`});
 const lp=$("levelpill");lp.innerHTML=`Level ${level()} <span class="bar"><i style="width:${(S.xp%1000)/10}%"></i></span>`}
let ambFront="ambA";
function setAmbient(pal){const cd=CARDS.find(c=>c.pal===pal)||CARDS[0],back=ambFront==="ambA"?"ambB":"ambA";if(!cd.amb)return;$(back).style.backgroundImage=`url(${cd.amb})`;$(back).classList.remove("b");$(ambFront).classList.add("b");ambFront=back;
 const P=PAL[pal%PAL.length];document.documentElement.style.setProperty("--glow",P.glow);document.documentElement.style.setProperty("--glow2",P.glow2);document.querySelector('meta[name=theme-color]').content=P.sky[0]}
function layout(){const n=CARDS.length;CARDS.forEach((cd,i)=>{let d=i-S.ui.card;if(d>n/2)d-=n;if(d<-n/2)d+=n;cd.el.className="card "+(d===0?"c":Math.abs(d)<=2?"s"+d:"far");cd.el.setAttribute("aria-current",d===0)});setAmbient(CARDS[S.ui.card].pal)}
const step=d=>{S.ui.card=(S.ui.card+d+CARDS.length)%CARDS.length;save();layout()};
$("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
addEventListener("keydown",e=>{if(S.view!=="home"||e.target.closest("input,select,textarea")||!$("sheetwrap").hidden)return;if(e.key==="ArrowLeft")step(-1);if(e.key==="ArrowRight")step(1)});
const drag={x:0,y:0,on:false,moved:false};
rail.addEventListener("pointerdown",e=>{if(e.target.closest(".cta"))return;drag.on=true;drag.moved=false;drag.x=e.clientX;drag.y=e.clientY});
addEventListener("pointermove",e=>{if(!drag.on)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;if(!drag.moved)return;rail.querySelectorAll(".card").forEach(c=>{c.style.setProperty("--dx",dx*.55+"px");c.style.transitionDuration="0s"})});
const endDrag=e=>{if(!drag.on)return;drag.on=false;const dx=e.clientX-drag.x;rail.querySelectorAll(".card").forEach(c=>{c.style.transitionDuration="";c.style.setProperty("--dx","0px")});if(drag.moved&&Math.abs(dx)>50)step(dx<0?1:-1);setTimeout(()=>drag.moved=false,0)};
addEventListener("pointerup",endDrag);addEventListener("pointercancel",endDrag);
addEventListener("pointermove",e=>{if(RM||e.pointerType==="touch")return;$("atmo").style.setProperty("--px",((e.clientX/innerWidth-.5)*-28).toFixed(1)+"px");$("atmo").style.setProperty("--py",((e.clientY/innerHeight-.5)*-18).toFixed(1)+"px")});
function openCard(i){const cd=CARDS[i],el=cd.el;el.classList.remove("peek");if(cd.go[0]==="trades"&&cd.b()==="Set up sync"){openSettings("wallet");return}
 if(RM){go(...cd.go);return}const r=el.getBoundingClientRect(),cl=document.createElement("div");cl.className="expand";cl.style.cssText+=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:16px;background-image:url(${el.querySelector("canvas").toDataURL("image/jpeg",.7)})`;document.body.appendChild(cl);
 cl.animate([{left:r.left+"px",top:r.top+"px",width:r.width+"px",height:r.height+"px",borderRadius:"16px"},{left:"0px",top:"0px",width:innerWidth+"px",height:innerHeight+"px",borderRadius:"0px"}],{duration:480,easing:"cubic-bezier(.16,1,.3,1)",fill:"forwards"})
 .onfinish=()=>{go(cd.go[0],{...(cd.go[1]||{}),instant:true});cl.animate([{opacity:1},{opacity:0}],{duration:360,easing:"ease-out",fill:"forwards"}).onfinish=()=>cl.remove()}}
document.addEventListener("click",e=>{if(!e.target.closest(".card"))CARDS.forEach(c=>c.el.classList.remove("peek"))});

/* ================= segmented controls ================= */
function segPlace(id){const s=$(id),hl=s.querySelector(".hl"),b=s.querySelector("button.on");if(b&&b.offsetWidth){hl.style.left=b.offsetLeft+"px";hl.style.width=b.offsetWidth+"px"}}
const segAll=()=>requestAnimationFrame(()=>{segPlace("acct");segPlace("tf")});
document.querySelectorAll("#acct button").forEach(b=>b.onclick=()=>{S.ui.acct=b.dataset.a;S.ui.shown=30;shownBal=null;save();renderTrades()});
document.querySelectorAll("#tf button").forEach(b=>b.onclick=()=>{S.ui.tf=b.dataset.t;S.ui.shown=30;save();renderTrades();renderCards()});
$("won").onclick=e=>quickLog(true,e.currentTarget);$("lost").onclick=e=>quickLog(false,e.currentTarget);
$("addtrade").onclick=()=>editTrade(S.ui.acct);

/* ================= routing + dock ================= */
const NAMES={home:"Home",today:"Today",trades:"Trades",journal:"Journal"},PALOF={today:1,trades:0,journal:2};
function go(v,o={}){S.view=v;if(o.acct)S.ui.acct=o.acct;if(o.book)S.ui.book=o.book;
 $("v-home").classList.toggle("off",v!=="home");document.querySelectorAll(".page").forEach(p=>p.classList.toggle("on",p.id==="p-"+v));document.body.classList.toggle("page-mode",v!=="home");
 $("dcore").querySelectorAll(".db").forEach(b=>b.classList.toggle("on",b.dataset.v===v));glide();
 const cr=$("crumb");cr.textContent=NAMES[v];cr.classList.remove("swap");void cr.offsetWidth;cr.classList.add("swap");
 if(v==="home"){renderCards();layout()}else setAmbient(PALOF[v]);
 if(v==="trades"){shownBal=null;renderTrades();const l=$("spark").querySelector(".line");if(l){l.style.animation="none";void l.offsetWidth;l.style.animation=""}if(S.ui.acct==="poly"&&S.settings.wallet&&Date.now()-S.sync.last>60000)sync(false)}
 if(v==="journal")renderJournal();if(v==="today")renderToday();
 save();scrollTo({top:0,behavior:o.instant?"auto":"smooth"});history.replaceState(null,"","#"+v)}
function glide(){const b=$("dcore").querySelector(".db.on"),g=$("glide");if(!b){g.style.opacity=0;return}g.style.opacity=1;g.style.left=(b.offsetLeft+12)+"px";g.style.width=(b.offsetWidth-24)+"px"}
$("dcore").querySelectorAll(".db").forEach(b=>b.onclick=()=>go(b.dataset.v));
document.querySelector('[data-k="apps"]').onclick=()=>$("dock").classList.toggle("apps");
document.querySelector('[data-k="back"]').onclick=()=>$("dock").classList.remove("apps");
$("logbtn").onclick=()=>go("trades");$("setbtn").onclick=()=>openSettings();$("syncbtn").onclick=()=>sync(true);$("streakbtn").onclick=()=>go("today");$("levelpill").onclick=()=>go("today");

/* ================= orbit ================= */
function orbit(o){$("orbit").classList.toggle("open",o);$("scrim").classList.toggle("on",o);$("orbit").setAttribute("aria-hidden",!o)}
$("assist").onclick=()=>orbit(!$("orbit").classList.contains("open"));$("scrim").onclick=()=>orbit(false);
$("orbit").querySelectorAll(".olab").forEach(b=>b.onclick=()=>{orbit(false);const a=b.dataset.a;
 if(a==="won"||a==="lost"){go("trades");setTimeout(()=>quickLog(a==="won",$(a)),380)}
 if(a==="task"){go("today");setTimeout(()=>$("nt").focus(),380)}
 if(a==="entry"){go("journal");setTimeout(()=>editEntry(S.ui.book),380)}});

/* ================= boot ================= */
function renderAll(){renderWeek();renderToday();renderTrades();renderJournal();renderCards();if(S.view==="home")layout()}
tick();setInterval(tick,10000);
rail.classList.add("still");paintCards();renderAll();layout();requestAnimationFrame(()=>requestAnimationFrame(()=>rail.classList.remove("still")));
const start=(location.hash||"").slice(1);go(NAMES[start]?start:"home",{instant:true});
addEventListener("resize",()=>{glide();segAll()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden){tick();if(S.settings.wallet&&Date.now()-S.sync.last>120000)sync(false)}});
if(S.settings.wallet&&Date.now()-S.sync.last>120000)setTimeout(()=>sync(false),800);
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});

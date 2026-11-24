/* Night mountain scenes: jagged ridgelines (real peaks + rocky midpoint-displacement detail), moonlight on the
   high ridges, fog in the valleys, stars and film grain. One palette per feed card.
   Ridge colors L[0..3] go from the far, hazy range (lightest) to the near range (darkest); L[4] is the deepest shadow.
   road[0] is each card's accent (used for the + ring center), sun is the moon. */
const PAL=[
 {sky:["#04070A","#1A2632"],L:["#3B4F61","#2A3B4B","#1C2834","#111A23","#080D13"],sun:"#E8EEF2",fog:"rgba(170,192,208,.11)",road:["#A9BFD0","#6E8597"],glow:"rgba(120,160,190,.45)",glow2:"rgba(200,220,235,.3)"},
 {sky:["#0A0605","#33190F"],L:["#6A3F27","#4C2D1D","#331E13","#1E120B","#0E0806"],sun:"#F4CBA0",fog:"rgba(235,165,110,.11)",road:["#E9A25E","#B06A34"],glow:"rgba(220,130,70,.5)",glow2:"rgba(245,185,120,.4)"},
 {sky:["#06050E","#231B3E"],L:["#4D3F7A","#372C5C","#251E3F","#161126","#0B0915"],sun:"#EDE4FF",fog:"rgba(185,165,240,.11)",road:["#B9A6F0","#7E68C0"],glow:"rgba(140,120,220,.5)",glow2:"rgba(210,180,240,.35)"},
 {sky:["#030806","#132820"],L:["#30573F","#22402F","#172C20","#0E1A13","#070E0A"],sun:"#ECF0DC",fog:"rgba(170,210,180,.10)",road:["#CDB46A","#97823F"],glow:"rgba(100,180,130,.45)",glow2:"rgba(220,200,120,.35)"},
 {sky:["#030A10","#132E42"],L:["#30607F","#22465F","#173144","#0E1F2C","#071119"],sun:"#E6F3FF",fog:"rgba(150,200,235,.11)",road:["#8FC7EE","#5A92BA"],glow:"rgba(80,150,220,.5)",glow2:"rgba(160,210,245,.35)"}];
function paintScene(cv,pi,W=1400,H=860,seed0=7){cv.width=W;cv.height=H;const c=cv.getContext("2d"),P=PAL[pi%PAL.length];let s=seed0+pi*31;const R=()=>(s=(s*9301+49297)%233280)/233280;
 const k=W/1400;
 // sky and stars
 let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.sky[0]);g.addColorStop(1,P.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<140;i++){const big=R()<.08;c.fillStyle=`rgba(255,255,255,${.12+R()*(big?.7:.4)})`;c.beginPath();c.arc(R()*W,R()*H*.6,(big?1.6:.8)*k+R()*.6*k,0,7);c.fill()}
 // moon with a wide soft halo
 const mx=W*(.62+R()*.22),my=H*(.09+R()*.05),mr=24*k;g=c.createRadialGradient(mx,my,0,mx,my,H*.75);g.addColorStop(0,P.sun+"55");g.addColorStop(.3,P.sun+"16");g.addColorStop(1,P.sun+"00");c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle=P.sun;c.shadowColor=P.sun;c.shadowBlur=36*k;c.beginPath();c.arc(mx,my,mr,0,7);c.fill();c.shadowBlur=0;
 // four ridgelines, far to near
 const N=129;
 for(let L=0;L<4;L++){const base=H*(.44+L*.135);
  const h=new Array(N).fill(0);let step=N-1,amp=H*.11;
  while(step>1){const half=step/2;for(let i=half;i<N;i+=step)h[i]=(h[i-half]+h[i+half])/2+(R()-.5)*amp;amp*=.55;step=half}
  const pk=[...Array(3+L)].map(()=>({x:R()*W,h:H*(.13+R()*(.2-L*.035)),w:W*(.15+R()*.22)}));
  const env=x=>Math.max(0,...pk.map(p=>p.h*Math.pow(Math.max(0,1-Math.abs(x-p.x)/p.w),1.55)));
  const ys=[];for(let i=0;i<N;i++){const x=i/(N-1)*W,e=env(x);ys.push([x,base-e-h[i]*(.4+e/H*2)])}
  const top=Math.min(...ys.map(p=>p[1]));
  const path=()=>{c.beginPath();c.moveTo(0,H);ys.forEach(p=>c.lineTo(p[0],p[1]));c.lineTo(W,H);c.closePath()};
  // body: ridge color fading into deep shadow, with a drop shadow so ranges separate
  c.save();c.shadowColor="rgba(0,0,0,.35)";c.shadowBlur=24*k;
  g=c.createLinearGradient(0,top,0,H);g.addColorStop(0,P.L[L]);g.addColorStop(1,P.L[4]);c.fillStyle=g;path();c.fill();c.restore();
  // moonlight catching the high ground (reads like snow on the far ranges)
  c.save();path();c.clip();g=c.createLinearGradient(0,top,0,top+H*(.12-L*.02));g.addColorStop(0,`rgba(235,242,248,${.2-L*.045})`);g.addColorStop(1,"rgba(235,242,248,0)");c.fillStyle=g;c.fillRect(0,top,W,H*.2);
  c.restore();
  // crisp ridge edge
  c.strokeStyle=`rgba(225,236,244,${.16-L*.03})`;c.lineWidth=1.2*k;c.beginPath();ys.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
  // fog settling in the valley in front of this range
  g=c.createLinearGradient(0,base-H*.03,0,base+H*.09);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(.5,P.fog);g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,base-H*.03,W,H*.12)}
 // film grain
 const id=c.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*9;d[i]+=n;d[i+1]+=n;d[i+2]+=n}c.putImageData(id,0,0);
 // vignette + bottom shade so the headline always reads
 g=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.45)");c.fillStyle=g;c.fillRect(0,0,W,H);
 g=c.createLinearGradient(0,H*.55,0,H);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.35)");c.fillStyle=g;c.fillRect(0,0,W,H)}
function lowresOf(cv){const t=document.createElement("canvas");t.width=48;t.height=27;t.getContext("2d").drawImage(cv,0,0,48,27);return t.toDataURL()}

/* Clay-style generative scenes: layered lit ridges with carved contours, swirl clouds, a sweeping road. */
const PAL=[
 {sky:["#071519","#15363A"],L:["#1B3A3E","#234A4B","#2F5D59","#3E6E66","#122A2E"],cl:["#EFE2CF","#B8A28B"],sun:"#F3D9B8",road:["#D49A66","#8F5A37"],glow:"rgba(88,184,190,.5)",glow2:"rgba(239,153,96,.4)"},
 {sky:["#1D120D","#5C321C"],L:["#6E3A20","#9A532C","#C47240","#E0965F","#4A2414"],cl:["#FBE9D3","#C9A27F"],sun:"#FFE2B8",road:["#F4B27A","#B86A3C"],glow:"rgba(232,140,80,.55)",glow2:"rgba(250,190,120,.45)"},
 {sky:["#0E0C1C","#2E2550"],L:["#2A2448","#3B3263","#52467F","#6B5D97","#1C1834"],cl:["#ECE2F4","#A898BC"],sun:"#F6E6FF",road:["#C9A6E6","#7E5FA4"],glow:"rgba(140,120,220,.5)",glow2:"rgba(230,160,200,.4)"},
 {sky:["#08140F","#1B3628"],L:["#1D3E2F","#295540","#376D52","#4B8766","#122A1F"],cl:["#EDE6D2","#A9A68A"],sun:"#F2E3B6",road:["#E0B070","#9B7240"],glow:"rgba(110,190,140,.45)",glow2:"rgba(230,190,110,.4)"},
 {sky:["#0A1422","#203A58"],L:["#1F3754","#2A4A6E","#38608A","#4B78A4","#15263B"],cl:["#E4ECF6","#9AACC2"],sun:"#E8F2FF",road:["#9CC3E6","#5A7FA6"],glow:"rgba(90,150,220,.5)",glow2:"rgba(150,200,240,.35)"}];
function paintScene(cv,pi,W=1400,H=860,seed0=7){cv.width=W;cv.height=H;const c=cv.getContext("2d"),P=PAL[pi%PAL.length];let s=seed0+pi*31;const R=()=>(s=(s*9301+49297)%233280)/233280;
 const k=W/1400;
 let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.sky[0]);g.addColorStop(1,P.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
 for(let i=0;i<60;i++){c.fillStyle=`rgba(255,240,220,${.15+R()*.35})`;c.beginPath();c.arc(R()*W,R()*H*.45,(R()*1.6+.3)*k,0,7);c.fill()}
 const sx=W*(.66+R()*.18),sy=H*(.14+R()*.08);g=c.createRadialGradient(sx,sy,0,sx,sy,H*.7);g.addColorStop(0,P.sun+"66");g.addColorStop(.35,P.sun+"18");g.addColorStop(1,P.sun+"00");c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle=P.sun;c.shadowColor=P.sun;c.shadowBlur=40*k;c.beginPath();c.arc(sx,sy,26*k,0,7);c.fill();c.shadowBlur=0;
 const cloud=(x,y,sz)=>{const puffs=[[0,0,1],[.9,-.35,.85],[1.7,-.1,.7],[-.8,.15,.7],[.45,.35,.75],[1.3,.32,.6]];
  c.save();c.shadowColor="rgba(0,0,0,.35)";c.shadowBlur=24*k;c.shadowOffsetY=12*k;
  for(const [dx,dy,m] of puffs){const r=sz*m,px=x+dx*sz,py=y+dy*sz;const rg=c.createRadialGradient(px-r*.35,py-r*.45,r*.1,px,py,r);rg.addColorStop(0,P.cl[0]);rg.addColorStop(1,P.cl[1]);c.fillStyle=rg;c.beginPath();c.arc(px,py,r,0,7);c.fill()}
  c.restore();
  for(const [dx,dy,m] of puffs){const r=sz*m,px=x+dx*sz,py=y+dy*sz;c.strokeStyle="rgba(90,60,40,.16)";c.lineWidth=1.6*k;c.beginPath();for(let a=0;a<Math.PI*4.5;a+=.12){const rr=r*.85*(a/(Math.PI*4.5));const X=px+Math.cos(a)*rr,Y=py+Math.sin(a)*rr*.95;a?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke()}};
 for(let i=0;i<4;i++)cloud(W*(.5+R()*.42),H*(.2+R()*.26),(22+R()*30)*k);
 for(let L=0;L<4;L++){const base=H*(.42+L*.13),amp=H*(.06+R()*.07),f=1.2+R()*2.2,ph=R()*6,col=P.L[L];
  const y=x=>base+Math.sin(x/W*Math.PI*f+ph)*amp+Math.sin(x/W*Math.PI*f*2.7+ph*1.3)*amp*.35;
  c.save();c.shadowColor="rgba(0,0,0,.55)";c.shadowBlur=38*k;c.shadowOffsetY=-10*k;
  g=c.createLinearGradient(0,base-amp,0,H);g.addColorStop(0,col);g.addColorStop(1,P.L[4]);c.fillStyle=g;c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=5)c.lineTo(x,y(x));c.lineTo(W,H);c.closePath();c.fill();c.restore();
  c.strokeStyle="rgba(255,230,200,.18)";c.lineWidth=2*k;c.beginPath();for(let x=0;x<=W;x+=5){x?c.lineTo(x,y(x)):c.moveTo(x,y(x))}c.stroke();
  for(let q=1;q<12;q++){c.strokeStyle=q%2?"rgba(255,240,220,.07)":"rgba(0,0,0,.16)";c.lineWidth=1.4*k;c.beginPath();for(let x=0;x<=W;x+=6){const yy=y(x)+q*10*k+Math.sin(x/W*Math.PI*f*1.6+ph+q*.3)*6*k;x?c.lineTo(x,yy):c.moveTo(x,yy)}c.stroke()}
  for(let q=0;q<2;q++){const cx=W*(.08+R()*.84),cy=y(cx)+(26+R()*30)*k,r=(14+R()*18)*k;c.strokeStyle="rgba(255,236,210,.16)";c.lineWidth=1.4*k;c.beginPath();for(let a=0;a<Math.PI*6;a+=.1){const rr=r*(a/(Math.PI*6));const X=cx+Math.cos(a)*rr,Y=cy+Math.sin(a)*rr*.8;a?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke()}}
 c.save();c.shadowColor="rgba(0,0,0,.5)";c.shadowBlur=30*k;
 g=c.createLinearGradient(W*.4,H,W,H*.6);g.addColorStop(0,P.road[0]);g.addColorStop(1,P.road[1]);c.fillStyle=g;
 c.beginPath();c.moveTo(W*.38,H);c.bezierCurveTo(W*.55,H*.84,W*.95,H*.92,W*.86,H*.74);c.bezierCurveTo(W*.8,H*.66,W*.62,H*.7,W*.72,H*.62);c.bezierCurveTo(W*.68,H*.68,W*.9,H*.7,W*.98,H*.8);c.bezierCurveTo(W*1.05,H*.95,W*.7,H*.95,W*.58,H);c.closePath();c.fill();c.restore();
 for(let q=0;q<7;q++){c.strokeStyle=q%2?"rgba(255,245,230,.22)":"rgba(60,30,10,.18)";c.lineWidth=1.3*k;c.beginPath();const o=q*.012;c.moveTo(W*(.42+o*3),H);c.bezierCurveTo(W*(.57+o),H*(.85+o),W*(.94-o),H*(.9+o),W*(.86-o*2),H*(.75+o));c.stroke()}
 if(pi%2==0){const tx=W*.1,ty=H*.52;c.strokeStyle="#1A120D";c.lineWidth=6*k;c.beginPath();c.moveTo(tx,ty+70*k);c.bezierCurveTo(tx+10*k,ty+30*k,tx-20*k,ty+10*k,tx+5*k,ty-20*k);c.stroke();
  for(let i=0;i<5;i++){const fx=tx+(-30+R()*60)*k,fy=ty+(-40+R()*50)*k,r=(14+R()*12)*k;const rg=c.createRadialGradient(fx-r*.3,fy-r*.4,2,fx,fy,r);rg.addColorStop(0,P.L[3]);rg.addColorStop(1,P.L[1]);c.fillStyle=rg;c.beginPath();c.arc(fx,fy,r,0,7);c.fill()}}
 const id=c.getImageData(0,0,W,H),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*10;d[i]+=n;d[i+1]+=n;d[i+2]+=n}c.putImageData(id,0,0);
 g=c.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.95);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.45)");c.fillStyle=g;c.fillRect(0,0,W,H);}
function lowresOf(cv){const t=document.createElement("canvas");t.width=48;t.height=27;t.getContext("2d").drawImage(cv,0,0,48,27);return t.toDataURL()}

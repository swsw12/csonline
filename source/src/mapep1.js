'use strict';
// ============ Episode 1 map "Q-7 격리 연구동" (Q-7 Research Wing): four zones played in order ============
// A  outer checkpoint (outdoors, rain)   x -64..-31  z -24..24   → glass doors (gate gA)
// B  lobby + security room / server room  x -30..2    z -12..12   → inner security door (gate gB)
// C  lab corridor + specimen labs         x 2.6..62   z -11.6..11.6 → cargo elevator car C (gate gC)
// D  B4 isolation test chamber            x -22..22   z 30..74    ← car D (gate gD), north bulkhead (gate gN) over the cold room
// Zones are separate blocks: A → B → C walk through doors that open, C → D is an elevator ride (teleport between two identical cars).
// Gates are boxes drawn as their own meshes and solid until opened (map.js: o.gate / o.gs slide); the nav graph is built with them open.
Object.assign(MATS,{
  q7lab:{t:'q7lab',s:2.4},q7labF:{t:'q7labF',s:2.4},q7arena:{t:'q7arena',s:4},q7lobF:{t:'q7lobF',s:2.4},q7door:{t:'q7door',uv:'box',k:'metal'},q7elev:{t:'q7elev',s:2,k:'metal'},
  q7rack:{t:'q7rack',uv:'box',emis:.45,k:'metal'},q7glass:{t:'q7glass',uv:'boxV',s:2,k:'glass'},q7cold:{t:'q7cold',s:2,k:'metal'},q7panel:{t:'q7panel',uv:'box',emis:.3,k:'metal'},
  q7term:{t:'q7term',uv:'box',emis:.75,k:'glass'},q7tankG:{t:'q7tankG',emis:.7},q7tankB:{t:'q7tankB'},q7fac:{t:'q7fac',s:4},
  q7sFac:{t:'q7sFac',uv:'box',emis:.55,k:'metal'},q7sSec:{t:'q7sSec',uv:'box',emis:.3,k:'metal'},q7sSrv:{t:'q7sSrv',uv:'box',emis:.3,k:'metal'},q7sB4:{t:'q7sB4',uv:'box',emis:.35,k:'metal'},
  q7sBio:{t:'q7sBio',uv:'box',emis:.2,k:'metal'},q7sElev:{t:'q7sElev',uv:'box',emis:.4,k:'metal'},q7sLab:{t:'q7sLab',uv:'box',emis:.25,k:'metal'},
});
// ---------- textures (painted on first load) ----------
function texQ7Lab(){const N=TN;return paint(N,N,P=>{
  // painted steel wall panels, 1.2 m wide, off-white gone grey; scuffs and the odd smear
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#b9bcb4','#9a9e96',clamp(P.n(x,y,64,911,3)*1.2-.2,0,1));c=mix(c,'#868a82',clamp((P.n(x,y,14,912,2)-.6)*1.8,0,.5));
    const sx=x%128;if(sx<2)c=sx===0?'#5c605a':'#d2d4cc';else if(sx>125)c=dk(c,.12);if(y%128===0)c='#6e726a';else if(y%128===1)c=lt(c,.12);if(hash2(x,y,913)<.03)c=dk(c,.06);P.set(x,y,c)}
  for(const sx of [0,128])for(const yy of [10,118,138,246])for(const dx of [6,122]){P.set(sx+dx,yy,'#4a4e48');P.set(sx+dx+1,yy+1,'#d8dad2')}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,914)*N),Math.floor(hash2(i,2,914)*N),20+Math.floor(hash2(i,3,914)*90),.08+hash2(i,4,914)*.08,1);
  for(let i=0;i<5;i++)stain(P,hash2(i,5,915)*N,hash2(i,6,915)*N,10+hash2(i,7,915)*22,6+hash2(i,8,915)*14,.18,916+i);
  // a dried handprint smear and a few blood flecks
  for(let k=0;k<70;k++){const x=150+k*.8+Math.sin(k*.3)*4,y=170+k*.35;for(let w=-3;w<=3;w++)if(hash2(k,w,917)<.7)P.set(Math.round(x),Math.round(y+w),mix('#5a1410','#3a0a08',hash2(k,w,918)),.55*(1-k/70))}
  for(let i=0;i<40;i++){const x=Math.floor(hash2(i,1,919)*N),y=Math.floor(hash2(i,2,919)*N);if(hash2(i,3,919)<.5)P.set(x,y,'#4a0e0a',.8)}})}
function texQ7LabF(){const N=TN;return paint(N,N,P=>{
  // 60 cm vinyl tiles, two tones, scuffed; a dragged blood trail across one corner
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=x>>6,ty=y>>6,gx=x&63,gy=y&63;let c=(tx+ty)%2?'#8e968c':'#9ca398';c=mix(c,'#6e766c',clamp((P.n(x,y,40,921,3)-.45)*1.4,0,.5));
    if(gx<1||gy<1)c='#5e645c';else if(gx===1||gy===1)c=lt(c,.08);if(hash2(x,y,922)<.04)c=dk(c,.1);P.set(x,y,c)}
  for(let i=0;i<14;i++){const x0=hash2(i,1,923)*N,y0=hash2(i,2,923)*N,a=hash2(i,3,923)*TAU,l=10+hash2(i,4,923)*40;for(let k=0;k<l;k++)P.mul(Math.round(x0+Math.cos(a)*k),Math.round(y0+Math.sin(a)*k),.8)}
  for(let i=0;i<5;i++)stain(P,hash2(i,5,924)*N,hash2(i,6,924)*N,10+hash2(i,7,924)*24,8+hash2(i,8,924)*16,.22,925+i);
  for(let k=0;k<200;k++){const x=k*1.1,y=40+k*.5+Math.sin(k*.05)*10;for(let w=-5;w<=5;w++){const a=(1-Math.abs(w)/6)*(.35+.25*Math.sin(k*.2));if(hash2(k,w,926)<.8)P.set(Math.round(x),Math.round(y+w),'#4a0c08',a)}}})}
function texQ7LobF(){const N=TN;return paint(N,N,P=>{
  // polished stone squares in the lobby, dust in the joints, muddy prints from outside
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=x>>7,sy=y>>7,gx=x&127,gy=y&127,tint=hash2(sx,sy,931)-.5;let t=.5+tint*.15+(P.n(x,y,20,932,3)-.5)*.3;const h=hash2(x,y,933);if(h<.05)t-=.25;else if(h>.97)t+=.25;
    let c=dith(P,x,y,t,['#4c4a46','#5a5852','#68665e','#76746c','#84827a'],.1);if(gx<2||gy<2)c='#2c2a26';P.set(x,y,c)}
  for(let i=0;i<9;i++){const x=Math.floor(hash2(i,1,934)*N),y=Math.floor(hash2(i,2,934)*N);for(let j=0;j<10;j++)for(let k=0;k<7;k++)if(hash2(i*31+j,k,935)<.5)P.set(x+k,y+j,'#2a241c',.5)}
  for(let i=0;i<4;i++)stain(P,hash2(i,3,936)*N,hash2(i,4,936)*N,16+hash2(i,5,936)*24,10+hash2(i,6,936)*14,.2,937+i)})}
function texQ7Arena(){const N=TN;return paint(N,N,P=>{
  // dark epoxy over concrete, a yellow grid painted every 4 m, gouges from something heavy dragged across it
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,48,941,4)*1.1-.05+(hash2(x,y,942)-.5)*.08;let c=dith(P,x,y,t,['#26282a','#2e3032','#36383a','#3e4042','#46484a'],.1);
    if(x<3||y<3)c=mix('#a8901e','#6a5c1a',P.n(x,y,8,943,2));P.set(x,y,c)}
  for(let i=0;i<9;i++){const x0=hash2(i,1,944)*N,y0=hash2(i,2,944)*N,a=hash2(i,3,944)*TAU,l=30+hash2(i,4,944)*90;for(let k=0;k<l;k++){const x=Math.round(x0+Math.cos(a)*k),y=Math.round(y0+Math.sin(a)*k);P.set(x,y,'#18191a');P.set(x+1,y,'#56585a',.4)}}
  for(let i=0;i<6;i++)stain(P,hash2(i,5,945)*N,hash2(i,6,945)*N,12+hash2(i,7,945)*30,10+hash2(i,8,945)*20,.3,946+i);
  for(let i=0;i<3;i++)stain(P,hash2(i,9,947)*N,hash2(i,10,947)*N,8+hash2(i,11,947)*14,6+hash2(i,12,947)*10,.4,948+i)})}
function texQ7Door(){const W=256,H=256;return paint(W,H,P=>{
  // a heavy blast door: riveted steel plates, a hazard frame, stencilled warnings
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5058','#3a4048',clamp(P.n(x,y,40,951,3),0,1));const px=x%64,py=y%86;if(px<2||py<2)c='#22262c';else if(px===2||py===2)c=lt(c,.12);
    if(x<18||x>=W-18||y<18||y>=H-18)c=((Math.floor((x+y)/14))%2)?'#d0a818':'#1a1a1a';if(hash2(x,y,952)<.05)c=dk(c,.15);P.set(x,y,c)}
  for(let py=8;py<H;py+=86)for(let px=26;px<W-20;px+=16){P.set(px,py+16,'#8a9098');P.set(px+1,py+17,'#1a1c20')}
  for(let i=0;i<20;i++){const x0=hash2(i,1,953)*W,y0=hash2(i,2,953)*H,l=6+hash2(i,3,953)*30;for(let k=0;k<l;k++)P.set(Math.round(x0+k),Math.round(y0+k*.3),'#7a8088',.5)}
  for(let i=0;i<12;i++)streak(P,24+Math.floor(hash2(i,4,954)*(W-48)),22,40+Math.floor(hash2(i,5,954)*150),.18,2);
  P.post=ctx=>{ctx.fillStyle='rgba(220,200,60,.85)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 46px sans-serif';ctx.fillText('B4',W/2,H*.36);
    ctx.font='bold 17px sans-serif';ctx.fillText('격리 구역 · 관계자 외 출입금지',W/2,H*.6);ctx.font='bold 13px sans-serif';ctx.fillStyle='rgba(200,200,200,.7)';ctx.fillText('Q-7 ISOLATION · AUTHORIZED ONLY',W/2,H*.7)}})}
function texQ7Elev(){const N=TN;return paint(N,N,P=>{
  // brushed steel, 50 cm panels, fingerprints and a dent
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#8a9096','#6c7278',clamp(.5+(hash2(x,Math.floor(y/2),961)-.5)*.5+(P.n(x,y,30,962,2)-.5)*.6,0,1));if(x%64<2)c=x%64?'#c0c6cc':'#3a3e44';P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,963)*N,hash2(i,2,963)*N,6+hash2(i,3,963)*10,8+hash2(i,4,963)*12,.12,964+i)})}
function texQ7Rack(){const W=128,H=256;return paint(W,H,P=>{
  // a server rack front: black units, vents, rows of tiny status lights
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c='#141618';const uy=y%22;if(uy<2)c='#2a2e32';else if(x<8||x>=W-8)c='#222428';else if(uy>14&&x%4<2)c='#0c0d0e';if(hash2(x,y,971)<.03)c=lt(c,.1);P.set(x,y,c)}
  for(let u=0;u<11;u++)for(let k=0;k<6;k++){const x=16+k*6,y=u*22+7,h=hash2(u,k,972);const col=h<.55?'#3aff6a':h<.8?'#ffb030':h<.9?'#ff3a2a':'#2a3a2e';P.set(x,y,col);P.set(x+1,y,col);P.set(x,y+1,col);P.set(x+1,y+1,col)}})}
function texQ7Glass(){const W=TN,H=TN;return paint(W,H,P=>{
  // lab partition glass in a steel frame: dark teal, a frosted band, reflections, a crack and a bloody handprint (v runs the full wall height)
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#1c3034','#0e1a1e',clamp(y/H+(P.n(x,y,60,981,2)-.5)*.4,0,1));const fy=y/H;if(fy>.6&&fy<.68)c=mix('#8a9a9a','#6a7a7a',P.n(x,y,8,982,2));
    if((x+y*.4)%90<5)c=lt(c,.12);if(x<6||x>=W-6||y<6||y>=H-10)c=y>=H-10?'#2a2e30':'#4a5054';P.set(x,y,c)}
  crack(P,150,40,120,983,'#c8dcd8',null);crack(P,170,60,60,984,'#a8bcb8',null);
  for(let k=0;k<5;k++)for(let j=0;j<14;j++)for(let i=0;i<5;i++)if(hash2(k*9+i,j,985)<.8)P.set(60+k*7+i,170+j+(k===0?6:0),'#5a0e0a',.75);
  for(let j=0;j<24;j++)for(let i=0;i<24;i++)if(Math.hypot(i-12,j-12)<11&&hash2(i,j,986)<.85)P.set(66+i,188+j,'#5a0e0a',.75)})}
function texQ7Cold(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#6a7a88','#9aacbc',clamp(P.n(x,y,32,991,3)*1.2-.1,0,1));if(x%128<2)c='#3a4650';if(hash2(x,y,992)<.08)c=mix(c,'#e0f0ff',.6);P.set(x,y,c)}
  for(let i=0;i<30;i++){const x0=hash2(i,1,993)*N,y0=hash2(i,2,993)*N;for(let k=0;k<12;k++){const a=k/12*TAU;for(let r=0;r<6;r++)P.set(Math.round(x0+Math.cos(a)*r),Math.round(y0+Math.sin(a)*r),'#e8f4ff',.5)}}})}
function texQ7Panel(){const W=128,H=128;return paint(W,H,P=>{
  // a high-voltage box: yellow door, black lightning bolt, a red lamp
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#c89a1a','#a07a14',P.n(x,y,24,1001,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#3a3a3a';if(hash2(x,y,1002)<.04)c=dk(c,.2);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#141414';ctx.beginPath();ctx.moveTo(70,16);ctx.lineTo(40,68);ctx.lineTo(62,68);ctx.lineTo(52,112);ctx.lineTo(90,52);ctx.lineTo(66,52);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ff3020';ctx.beginPath();ctx.arc(104,22,7,0,TAU);ctx.fill();ctx.fillStyle='#141414';ctx.font='bold 13px sans-serif';ctx.fillText('고압 위험',10,122)}})}
function texQ7Term(){const W=128,H=96;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y%3?'#06200e':'#041608';if(x<4||y<4||x>=W-4||y>=H-4)c='#1a1e1c';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#4aff7a';ctx.font='bold 11px monospace';ctx.fillText('Q-7 SECURITY',10,18);ctx.fillText('> LOCKDOWN: ACTIVE',10,34);ctx.fillText('> OVERRIDE ____',10,50);
    ctx.fillStyle='#ff5a3a';ctx.fillText('! DOOR B4 SEALED',10,66);ctx.strokeStyle='#4aff7a';ctx.strokeRect(10,74,108,10);ctx.fillStyle='#4aff7a';ctx.fillRect(12,76,40,6)}})}
function texQ7TankG(){const W=128,H=128;return paint(W,H,P=>{
  // a specimen tank: glowing green fluid, bubbles, a curled dark shape floating inside
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3aff8a','#0a6a3a',clamp(y/H*.8+(P.n(x,y,20,1011,2)-.5)*.5,0,1));if(y<6||y>H-8)c='#3a4044';P.set(x,y,c)}
  for(let i=0;i<60;i++){const x=Math.floor(hash2(i,1,1012)*W),y=Math.floor(hash2(i,2,1012)*H);P.set(x,y,'#c8ffd8',.8)}
  for(let y=30;y<100;y++)for(let x=40;x<90;x++){const d=Math.hypot((x-64)/22,(y-62)/30)+(P.n(x,y,8,1013,2)-.5)*.5;if(d<1)P.set(x,y,'#0a2a18',.85*(1-d*d))}})}
function texQ7TankB(){const W=128,H=128;return paint(W,H,P=>{
  // a shattered tank: dry stained glass base, dark residue
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2a3a34','#1a2420',P.n(x,y,16,1021,3));if(y<8)c='#3a4044';if(hash2(x,y,1022)<.06)c='#6a8a7a';P.set(x,y,c)}
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,1023)*W),10,80,1024+i,'#9ab8a8',null)})}
function texQ7Fac(){const N=TN;return paint(N,N,P=>{
  // the building's precast concrete skin: 2 m panels, rain streaks under the joints
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,1031,4)*1.1-.05+(hash2(x,y,1032)-.5)*.07;let c=dith(P,x,y,t,['#4c4e50','#56585a','#606264','#6a6c6e','#747678'],.1);if(x%128<2||y%128<2)c='#2e3032';P.set(x,y,c)}
  for(let i=0;i<40;i++)streak(P,Math.floor(hash2(i,1,1033)*N),(hash2(i,2,1033)<.5?2:130),30+Math.floor(hash2(i,3,1033)*120),.12+hash2(i,4,1033)*.1,1+(i%3===0?1:0))})}
function bakeEp1Tex(){if(TEX.q7lab)return;
  TEX.q7lab=mkTex(texQ7Lab());TEX.q7labF=mkTex(texQ7LabF());TEX.q7lobF=mkTex(texQ7LobF());TEX.q7arena=mkTex(texQ7Arena());TEX.q7door=mkTex(texQ7Door(),false);TEX.q7elev=mkTex(texQ7Elev());
  TEX.q7rack=mkTex(texQ7Rack(),false);TEX.q7glass=mkTex(texQ7Glass());TEX.q7cold=mkTex(texQ7Cold());TEX.q7panel=mkTex(texQ7Panel(),false);TEX.q7term=mkTex(texQ7Term(),false);
  TEX.q7tankG=mkTex(texQ7TankG());TEX.q7tankB=mkTex(texQ7TankB());TEX.q7fac=mkTex(texQ7Fac());
  TEX.q7sFac=mkTex(texSign([{t:'격리병원 Q-7 · 연구동'},{t:'Q-7 QUARANTINE HOSPITAL · RESEARCH WING',s:7}],'#1a2a3a','#e8eef4',192,40),false);
  TEX.q7sSec=mkTex(texSign([{t:'보안실'},{t:'SECURITY',s:8}],'#2a3a4a','#e8eef4',96,30),false);
  TEX.q7sSrv=mkTex(texSign([{t:'서버실'},{t:'SERVER ROOM',s:8}],'#2a3a4a','#e8eef4',96,30),false);
  TEX.q7sB4=mkTex(texSign([{t:'B4 격리 실험장'},{t:'ISOLATION TEST CHAMBER',s:7}],'#4a1a14','#ffd8c8',128,32),false);
  TEX.q7sBio=mkTex(texSign([{t:'⚠ 생물학적 위험'},{t:'관계자 외 출입금지 · BIOHAZARD',s:7}],'#d8b020','#141414',128,32),false);
  TEX.q7sElev=mkTex(texSign([{t:'화물용 승강기 → B4'},{t:'CARGO LIFT',s:8}],'#202428','#ffc848',112,30),false);
  TEX.q7sLab=mkTex(texSign([{t:'표본실 · 실험실'},{t:'SPECIMEN LABS',s:8}],'#2a3a4a','#e8eef4',112,30),false)}
// ---------- geometry helpers ----------
// a stepped solid rail beside a stair flight (stops side jumps onto the steps)
function q7rail(axis,c0,c1,a0,a1,y0,y1,n,mat){const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i+=2){const s0=a0+da*i,s1=a0+da*Math.min(n,i+2),top=y0+dy*Math.min(n,i+2)+1;
  if(axis==='z')B(c0,y0,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat||'metal2');else B(Math.min(s0,s1),y0,c0,Math.max(s0,s1),top,c1,mat||'metal2')}}
// a ceiling light strip (decor) with its light; ax 'x' or 'z' = the long axis
function q7ceil(x,y,z,len,ax,col,int,range,o){const h=len/2;if(ax==='x')B(x-h,y-.06,z-.16,x+h,y,z+.16,'lampW',{nosolid:true});else B(x-.16,y-.06,z-h,x+.16,y,z+h,'lampW',{nosolid:true});LIGHT(x,y-.4,z,col||'#dfe8ff',range||9,int||.85,o)}
// a red emergency lamp on a wall facing +/-x or +/-z
function q7emerg(x,y,z,face){const o={nosolid:true};if(face==='x+')B(x,y,z-.15,x+.12,y+.2,z+.15,'lampR',o);else if(face==='x-')B(x-.12,y,z-.15,x,y+.2,z+.15,'lampR',o);else if(face==='z+')B(x-.15,y,z,x+.15,y+.2,z+.12,'lampR',o);else B(x-.15,y,z-.12,x+.15,y+.2,z,'lampR',o);
  LIGHT(x+(face==='x+'?.5:face==='x-'?-.5:0),y,z+(face==='z+'?.5:face==='z-'?-.5:0),'#ff3a2a',5.5,.7)}
// a specimen tank: a glowing cylinder (or a shattered stump) plus an invisible collision box
function q7tank(x,z,broken){if(broken){MAP.deco.push({k:'drum',x,y:0,z,r:.62,h:.55,mat:'q7tankB',rot:0});B(x-.5,0,z-.5,x+.5,.55,z+.5,'metalx');B(x-.68,0,z-.68,x+.68,.18,z+.68,'metal2');for(let i=0;i<4;i++){const a=i*1.7+x,r=rr(.8,1.4);B(x+Math.cos(a)*r-.12,0,z+Math.sin(a)*r-.1,x+Math.cos(a)*r+.12,.03,z+Math.sin(a)*r+.1,'q7glass',{nosolid:true})}return}
  MAP.deco.push({k:'drum',x,y:.18,z,r:.6,h:2.3,mat:'q7tankG',rot:0});B(x-.68,0,z-.68,x+.68,.18,z+.68,'metal2');B(x-.68,2.48,z-.68,x+.68,2.68,z+.68,'metal2');B(x-.48,0,z-.48,x+.48,2.6,z+.48,'metalx');LIGHT(x,1.3,z,'#3aff8a',3.2,.55)}
function buildEp1(){
  const nz={nosolid:true};
  // ================= zone A: the outer checkpoint (outdoors) =================
  B(-64,-1,-4,-38,0,4,'asph',{ground:1});B(-38,-1,-24,-31.2,0,24,'concf',{ground:1});B(-64,-1,-24,-38,0,-4,'dirt',{ground:1});B(-64,-1,4,-38,0,24,'dirt',{ground:1});
  // the compound's outer wall (6 m) keeps everyone in; the checkpoint fence inside it has holes the infected come through
  B(-65,0,-25,-64,6,25,'conc');B(-64,0,-25,-31.2,6,-24,'conc');B(-64,0,24,-31.2,6,25,'conc');
  B(-64,5.72,-24,-31.2,6.08,-23.78,'conc');B(-64,5.72,23.78,-31.2,6.08,24,'conc');B(-63.78,5.72,-24,-64,6.08,24,'conc');
  for(const z of [-16,-8,8,16])B(-64,0,z-.3,-63.62,6,z+.3,'conc');for(const x of [-56,-48,-40])for(const z of [-24,24])B(x-.3,0,z<0?-24:23.62,x+.3,6,z<0?-23.62:24,'conc');
  fenceZ(-19,-14,-60,2.6);fenceZ(-11.5,-4.3,-60,2.6);fenceZ(4.3,10,-60,2.6);fenceZ(12.5,19,-60,2.6);
  fenceX(-60,-47,-19,2.6);fenceX(-44.5,-31.2,-19,2.6);fenceX(-60,-47,19,2.6);fenceX(-44.5,-31.2,19,2.6);
  // vehicle gate: posts and a striped barrier arm across the road
  B(-60.25,0,-4.5,-59.75,1.3,-4,'conc');B(-60.25,0,4,-59.75,1.3,4.5,'conc');B(-60.1,.95,-4,-59.9,1.15,4,'hazard');B(-60.3,1.3,-4.4,-59.7,1.5,-4.1,'lampR',nz);LIGHT(-60,1.8,-4.25,'#ff3a2a',4,.5,{flick:.4});
  // guard booth by the gate
  wallX(-58.4,-54.4,5,5.25,0,2.8,'conc',[[-57.6,-55.6,1.1,2.2]]);wallX(-58.4,-54.4,9.05,9.3,0,2.8,'conc',[[-57.6,-55.6,1.1,2.2]]);wallZ(-58.4,-58.15,5.25,9.05,0,2.8,'conc',[[6.2,8.2,1.1,2.2]]);
  wallZ(-54.65,-54.4,5.25,9.05,0,2.8,'conc',[[6.3,7.8,0,2.2]]);B(-58.7,2.8,4.7,-54.1,3.05,9.6,'roof',{f:{ny:'conc'}});B(-58,0,8.2,-56.2,.9,8.9,'wood');monitor(-57.6,.9,8.6,-57,1.3,8.7,'nz');
  LIGHT(-56.4,2.4,7.2,'#fff0c0',5,.7,{flick:.3});B(-56.8,2.72,7,-56,2.8,7.4,'lampW',nz);
  // armoured truck (cover in the middle), a crashed ambulance, sandbag nests, jersey barriers, a field tent, drums, crates, cones
  B(-48,.5,-9,-42.4,2.9,-6.4,'contG');B(-42.4,.5,-8.9,-40.6,2.3,-6.5,'metal');B(-40.62,1.3,-8.7,-40.58,2.1,-6.7,'carGl',nz);B(-42.4,2.3,-8.9,-40.9,2.5,-6.5,'metal2');
  for(const x of [-47.2,-44.8,-41.6])for(const z of [-9.15,-6.25])B(x-.45,0,z-.18,x+.45,.95,z+.18,'tire');B(-48,.45,-9,-40.6,.55,-6.4,'metal2');
  car(-40.5,9,-35.8,11,'carR',{lights:1});LIGHT(-41.2,.7,10,'#fff0d0',6,.5);
  B(-46.5,0,1.6,-43.5,1.05,2.3,'sandbag');B(-46.5,0,-2.3,-43.5,1.05,-1.6,'sandbag');B(-47.2,0,-2.3,-46.5,1.05,2.3,'sandbag');
  B(-38.4,0,-15.2,-34.8,1.05,-14.5,'sandbag');B(-38.4,0,-14.5,-37.7,1.05,-12.2,'sandbag');
  for(const [x0,z0] of [[-56,-5.2],[-52,-5.2],[-56,4.6],[-52,4.6],[-35.5,-6],[-35.5,5.2]])B(x0,0,z0,x0+2.6,.85,z0+.6,'barrier');
  tent(-57,-16.5,-51.5,-11.5,-15,-13);B(-56.4,0,-16,-54.6,.45,-15.2,'cot',{f:{nx:'metal2',px:'metal2'}});B(-56.4,0,-13,-54.6,.45,-12.2,'cot',{f:{nx:'metal2',px:'metal2'}});
  crate(-53.2,13.5);crate(-52,13.5);crate(-52.6,13.5,1.1,1.2);crate(-36,16,1.2);crate(-34.8,16,1.1);drum(-51,-9.5);drum(-50.4,-9.1,0,'drumR');drum(-37,13.4);drum(-36.4,13.8,0,'drumR');
  for(const [x,z] of [[-58,-2.6],[-58,2.6],[-49,-3],[-49,3]])cone(x,z);tireStack(-58.6,15.6,3);tireStack(-58,16.3,2);
  MAP.fires=[];for(const [x,z] of [[-50.5,-12.4],[-36.5,9.4]]){B(x-.3,0,z-.3,x+.3,.85,z+.3,'metal2');LIGHT(x,1.3,z,'#ff8a3a',7,.9);MAP.fires.push([x,.9,z])}
  for(const [x,z] of [[-58.4,-17.4],[-58.4,17.4],[-41,-17.4],[-41,17.4],[-50,0]])lamp(x,z,5.6);
  B(-63.9,0,-.4,-63.4,4.2,.4,'metal2');B(-63.8,4.2,-1.2,-63.2,4.6,1.2,'metal2',nz);B(-63.6,4.05,-1.1,-63.3,4.2,1.1,'lampW',nz);LIGHT(-62.6,3.8,0,'#e8f0ff',22,1.05,{flood:1});
  // the research wing's west face: precast concrete, two rows of windows, the sign and the glass doors
  B(-31.2,0,-24,-30,9.4,-2,'q7fac',{f:{px:'q7lab'}});B(-31.2,0,2,-30,9.4,24,'q7fac',{f:{px:'q7lab'}});B(-31.2,3.4,-2,-30,9.4,2,'q7fac',{f:{px:'q7lab'}});
  for(const z of [-21,-17,-13,-9,-5,6,10,14,18])for(const y of [1.2,5.4]){const lit=hash2(Math.round(z),Math.round(y),7)<.25;B(-31.24,y,z-1.2,-31.2,y+1.6,z+1.2,lit?'winLit':'win',{nosolid:true,glass:1})}
  B(-31.25,3.6,-4,-31.2,4.8,4,'q7sFac',nz);LIGHT(-32.6,4.6,0,'#c8d8ff',8,.6);
  B(-35,3.3,-3.5,-31.2,3.55,3.5,'metal2');B(-35,0,-3.4,-34.7,3.3,-3.1,'metal2');B(-35,0,3.1,-34.7,3.3,3.4,'metal2');B(-34.9,3.22,-2.8,-32,3.3,2.8,'lampW',nz);LIGHT(-33,3,0,'#dfe8ff',8,.85,{flick:.25});
  B(-31.2,0,-2,-30.6,3.4,0,'q7glass',{gate:'gA',gs:[0,0,-1.9]});B(-31.2,0,0,-30.6,3.4,2,'q7glass',{gate:'gA',gs:[0,0,1.9]});B(-31.2,-1,-2,-30,0,2,'concf',{ground:1});// (a threshold under every door: nothing falls through an open one)
  // ================= zone B: lobby (1F), security room (1F), server room on the mezzanine (2F) =================
  B(-30,-1,-12,2,0,12,'q7lobF',{ground:1});
  wallX(-30,2.6,12,12.6,0,9.4,'q7lab',[[-24,-21,0,2.6],[-6,-3,0,2.6]]);
  wallX(-30,2.6,-12.6,-12,0,9.4,'q7lab',[[-12,-9,4.5,7]]);
  wallZ(2,2.6,-12,12,0,9.4,'q7lab',[[-1.5,1.5,0,3]]);B(2,0,-1.5,2.6,3,1.5,'q7door',{gate:'gB',gs:[0,3.05,0]});B(2,-1,-1.5,2.6,0,1.5,'q7labF',{ground:1});B(1.9,3.05,-1.9,1.99,3.4,1.9,'hazard',nz);B(1.95,3.4,-1,1.99,3.8,1,'q7sBio',nz);
  B(-30,9,-12.6,2.6,9.4,12.6,'roof',{f:{ny:'plaster'}});
  // stairwell alcoves (where the infected pour in) behind the south wall and off the mezzanine
  for(const x0 of [-24,-6]){B(x0,-1,12.6,x0+3,0,15.4,'q7labF',{ground:1});B(x0-.3,0,12.6,x0,2.9,15.7,'q7lab');B(x0+3,0,12.6,x0+3.3,2.9,15.7,'q7lab');B(x0-.3,0,15.4,x0+3.3,2.9,15.7,'q7lab');B(x0-.3,2.6,12.6,x0+3.3,2.9,15.7,'plaster');
    B(x0+.4,0,13.4,x0+2.6,.6,15.2,'conc',{stair:1});q7emerg(x0+1.5,2.2,12.62,'z+')}
  B(-12,4.2,-15.4,-9,4.5,-12.6,'plaster',{f:{py:'q7lobF'}});B(-12.3,4.5,-15.7,-12,7.3,-12.6,'q7lab');B(-9,4.5,-15.7,-8.7,7.3,-12.6,'q7lab');B(-12.3,4.5,-15.7,-8.7,7.3,-15.4,'q7lab');B(-12.3,7,-15.7,-8.7,7.3,-12.6,'plaster');
  q7emerg(-10.5,6.4,-12.62,'z+');
  // mezzanine slab along the north side, columns under its edge, a railing with the grand stair's opening
  B(-30,4.2,-12,2,4.5,-5,'plaster',{f:{py:'q7lobF'}});for(const x of [-21,-6,1.2])B(x-.25,0,-5.5,x+.25,4.2,-5,'q7lab');
  B(-30,4.5,-5.12,-15,5.5,-5,'metal2',{rail:1});B(-12,4.5,-5.12,2,5.5,-5,'metal2',{rail:1});
  stairs('z',-15,-12,4,-5,0,4.5,15,'q7lobF');q7rail('z',-15.2,-15,4,-5,0,4.5,15);q7rail('z',-12,-11.8,4,-5,0,4.5,15);
  // security room under the mezzanine (west), the first terminal inside
  wallX(-30,-21,-5.3,-5,0,4.2,'q7lab',[[-25,-23.4,0,2.4],[-29.2,-26.2,1.1,2.3]]);B(-29.2,1.1,-5.28,-26.2,2.3,-5.02,'win',{glass:1});
  wallZ(-21.3,-21,-12,-5.3,0,4.2,'q7lab');B(-24.8,2.5,-4.98,-23.6,2.9,-4.94,'q7sSec',nz);
  B(-29.6,0,-11.8,-26.4,.9,-10.8,'metal2',{f:{py:'plate'}});monitor(-29.2,.9,-11.5,-28.4,1.4,-11.4,'pz');monitor(-28.2,.9,-11.5,-27.4,1.4,-11.4,'pz');monitor(-27.2,.9,-11.5,-26.6,1.3,-11.4,'pz');
  B(-26.6,0,-10.4,-25.8,1.4,-9.6,'metal',{f:{pz:'q7term'}});// terminal 1
  B(-22.4,0,-11.8,-21.4,2,-9.2,'metal2');B(-29.8,0,-8.2,-29.2,2,-6,'metal2');LIGHT(-25,3.7,-8.6,'#dfe8ff',7,.75,{flick:.2});B(-25.6,4.12,-8.8,-24.4,4.18,-8.4,'lampW',nz);LIGHT(-26.2,1.3,-9.6,'#4aff7a',2.6,.45);
  // server room on the mezzanine (west), the second terminal at the back
  wallX(-30,-21,-7.3,-7,4.5,7.5,'q7lab',[[-23,-21.8,4.5,6.9]]);wallZ(-21.3,-21,-12,-7.3,4.5,7.5,'q7lab');B(-30,7.5,-12,-21,7.8,-7,'plaster');B(-22.9,7,-6.98,-21.9,7.35,-6.94,'q7sSrv',nz);
  for(const x of [-29.4,-27.6,-25.8])B(x,4.5,-11.6,x+1.2,6.8,-10.8,'metal',{f:{pz:'q7rack'}});for(const x of [-29.4,-27.6])B(x,4.5,-8.9,x+1.2,6.8,-8.1,'metal',{f:{nz:'q7rack'}});
  B(-24,4.5,-10.6,-23.2,5.9,-9.8,'metal',{f:{px:'q7term'}});// terminal 2
  LIGHT(-26,7.1,-9.6,'#bfd8ff',7,.7);B(-26.6,7.42,-9.8,-25.4,7.48,-9.4,'lampW',nz);LIGHT(-23,5.4,-10.2,'#4aff7a',2.6,.45);LIGHT(-28,5.6,-10.4,'#3aff6a',3,.35);
  // the hall: reception desk, the turnstile line, waiting seats, vending machines, planters
  B(-25,0,-3,-23,1.1,3,'wood',{f:{py:'metal2'}});monitor(-24.6,1.1,-1.2,-24.5,1.5,-.4,'nx');monitor(-24.6,1.1,.6,-24.5,1.5,1.4,'nx');
  for(const [z0,z1] of [[-4.6,-2.6],[-1,1],[2.6,4.6],[6.2,8.2],[9.8,11.9]])B(-4.3,0,z0,-3.7,1.05,z1,'metal2',{f:{py:'plate'}});
  for(const z of [6.4,8.6])B(-20,0,z,-15.6,.5,z+.7,'plate',{f:{nx:'metal2',px:'metal2'}});
  B(-9,0,-11.8,-7.8,2,-11,'metal2',{f:{pz:'screen'}});B(-7.5,0,-11.8,-6.3,2,-11,'metal2',{f:{pz:'screen'}});LIGHT(-7.6,1.6,-10.2,'#8ac8ff',4,.5);
  for(const [x,z] of [[-27.5,10],[-27.5,-3.6],[-1,10]]){B(x-.4,0,z-.4,x+.4,.7,z+.4,'conc');B(x-.32,.7,z-.32,x+.32,.76,z+.32,'dirt',nz)}
  B(-14,0,10,-8,.03,11.6,'mark',nz);
  for(const [x,z] of [[-22,-1],[-22,7],[-8,-1],[-8,7]])q7ceil(x,8.95,z,2.4,'x','#dfe8ff',.9,13,{flick:x===-8&&z===7?.5:0});
  for(const x of [-26,-16,-6])q7ceil(x,4.15,-8.6,1.6,'x','#dfe8ff',.6,7);
  q7emerg(1.98,2.6,-2.2,'x-');q7emerg(-29.98,2.6,-2.6,'x+');q7emerg(-14,2.4,11.98,'z-');LIGHT(-28,2.6,0,'#c8d8ff',6,.5);
  // ================= zone C: lab corridor, specimen labs (north), labs (south), the cargo lift =================
  B(2.6,-1,-11.6,62,0,11.6,'q7labF',{ground:1});B(2.6,3.6,-11.6,62.3,3.9,11.6,'plaster',{f:{py:'roof'}});
  B(2.6,0,-12.2,62.6,3.9,-11.6,'q7lab');B(2.6,0,11.6,62.6,3.9,12.2,'q7lab');B(62,0,-11.6,62.6,3.9,-3.3,'q7lab');B(62,0,3.3,62.6,3.9,11.6,'q7lab');
  // glass partitions (lab doors near each lab's east end); the specimen lab N3 wall section the giant bursts through is gate gW
  wallX(2.6,62,-3.15,-3,0,3.6,'q7glass',[[12.6,14.2,0,2.4],[27.6,29.2,0,2.4],[37,40,0,3.6],[42.6,44.2,0,2.4],[57.6,59.2,0,2.4]]);B(37,0,-3.15,40,3.6,-3,'q7glass',{gate:'gW'});
  wallX(2.6,62,3,3.15,0,3.6,'q7glass',[[12.6,14.2,0,2.4],[27.6,29.2,0,2.4],[42.6,44.2,0,2.4],[57.6,59.2,0,2.4]]);
  for(const x of [17,32,47]){B(x-.15,0,-11.6,x+.15,3.6,-3.15,'q7lab');B(x-.15,0,3.15,x+.15,3.6,11.6,'q7lab')}
  for(const x of [7,22,52])B(x-.6,2.7,-3.18,x+.6,3.2,-3.16,'q7sLab',nz);B(36,2.9,-2.98,41,3.2,-2.95,'q7sBio',nz);
  // decon arch at the corridor's west end
  B(2.6,0,-3,3.2,3.6,-2.6,'hazard');B(2.6,0,2.6,3.2,3.6,3,'hazard');B(5.4,0,-3,5.8,3.4,-2.5,'metal2');B(5.4,0,2.5,5.8,3.4,3,'metal2');B(5.4,3,-2.5,5.8,3.4,2.5,'hazard',nz);
  for(const z of [-1.6,-.5,.6,1.7])B(5.45,2.92,z-.08,5.75,3,z+.08,'pipe',nz);B(3.2,0,-2.6,5.4,.04,2.6,'plate',nz);LIGHT(4.4,3,0,'#8ad0ff',6,.7);
  // specimen labs: tanks (some burst), steel tables, a body bag; labs: benches, a fume hood, desks
  for(const x0 of [2.6,17,32,47]){const cx=x0+7.5;
    for(const k of [0,1,2]){const x=x0+3+k*4,br=hash2(Math.round(x),3,77)<.45||k===1&&x0===32;q7tank(x,-10,br)}
    B(cx-2,0,-7.2,cx+2,.9,-6.2,'metal2',{f:{py:'plate'}});if(x0!==32)B(cx-1.6,.9,-7,cx+.2,1.15,-6.4,'bag');
    B(x0+.6,0,-4.4,x0+2.2,1.9,-3.4,'metal',{f:{px:'q7rack'}});
    B(x0+3,0,6.4,x0+8,1,7.2,'metal2',{f:{py:'plate'}});B(x0+9,0,6.4,x0+13,1,7.2,'metal2',{f:{py:'plate'}});B(x0+11,0,10.4,x0+13.6,2.4,11.4,'metal');B(x0+11,1.2,10.38,x0+13.6,2,10.4,'winLit',nz);
    B(x0+2,0,9.8,x0+4.4,.8,11,'wood');monitor(x0+2.4,.8,10.6,x0+3.2,1.3,10.7,'nz');
    q7ceil(cx,3.55,-7.5,1.6,'x','#cfe0ff',.55,8,{flick:hash2(Math.round(x0),1,9)<.5?.6:0});q7ceil(cx,3.55,7.5,1.6,'x','#cfe0ff',.55,8,{flick:hash2(Math.round(x0),2,9)<.4?.6:0})}
  for(let x=9;x<62;x+=8)q7ceil(x,3.55,0,2,'z','#dfe8ff',.85,9,{flick:x===41||x===57?.55:0});
  for(const x of [10,30,50])q7emerg(x,2.6,-2.97,'z+');
  // the cargo lift car C (door faces west into the corridor)
  B(62,-1,-3,68,0,3,'plate',{ground:1});B(62,0,-3.3,68.3,4.3,-3,'q7elev');B(62,0,3,68.3,4.3,3.3,'q7elev');B(68,0,-3,68.3,4.3,3,'q7elev');B(62,4,-3,68,4.3,3,'q7elev');
  wallZ(62,62.3,-3,3,0,4,'q7elev',[[-1.5,1.5,0,3]]);B(62,0,-1.5,62.3,3,0,'q7elev',{gate:'gC',gs:[0,0,-1.45]});B(62,0,0,62.3,3,1.5,'q7elev',{gate:'gC',gs:[0,0,1.45]});
  B(61.94,3.1,-1.2,61.98,3.5,1.2,'q7sElev',nz);B(67.95,1.1,1.6,67.99,1.8,2.2,'q7term',nz);q7ceil(65.2,3.95,0,2.4,'z','#e8f0ff',.8,7);
  // ================= zone D: the B4 isolation test chamber =================
  slab(-22,30,22,74,-1,0,'q7arena',[[-6,46,6,58]],{ground:1});
  B(-6,-1.8,46,6,-.8,58,'concf');
  for(const [x0,z0,x1,z1] of [[-6,46,-1,46.2],[1,46,6,46.2],[-6,57.8,-1,58],[1,57.8,6,58],[-6,46.2,-5.8,51],[-6,53,-5.8,57.8],[5.8,46.2,6,51],[5.8,53,6,57.8]])B(x0,-.8,z0,x1,0,z1,'concf');
  for(const [x0,z0,x1,z1] of [[-1,46,1,46.6],[-1,57.4,1,58],[-6,51,-5.4,53],[5.4,51,6,53]])B(x0,-.8,z0,x1,-.4,z1,'concf',{stair:1});
  for(const [x0,z0,x1,z1] of [[-1,46,1,46.3],[-1,57.7,1,58],[-6,51,-5.7,53],[5.7,51,6,53]])B(x0,-.4,z0,x1,0,z1,'concf',{stair:1});
  for(const [x0,z0,x1,z1] of [[-6.5,45.5,6.5,46],[-6.5,58,6.5,58.5],[-6.5,46,-6,58],[6,46,6.5,58]])B(x0,0,z0,x1,.025,z1,'hazard',nz);
  for(const x of [-5.9,5.9])for(const z of [46.1,57.9]){B(x-.22,0,z-.22,x+.22,.16,z+.22,'metal2',nz);B(x-.07,.16,z-.07,x+.07,.3,z+.07,'metal',nz)}// the chains' anchor eyes (aleph.js CHAIN)
  B(-22.6,0,29.4,-5.6,12,30,'conc');B(5.6,0,29.4,22.6,12,30,'conc');B(-5.6,8.6,29.4,5.6,12,30,'conc');
  B(-22.6,0,74,-1.5,12,74.3,'conc');B(1.5,0,74,22.6,12,74.3,'conc');B(-1.5,3,74,1.5,12,74.3,'conc');
  B(-22.6,0,30,-22,12,74,'conc');B(22,0,30,22.6,12,74,'conc');B(-22.6,12,29.4,22.6,12.5,74.3,'metal',{f:{ny:'metal2'}});
  for(const z of [36,46,58,68])for(const x of [-22,21.7])B(x,0,z-.3,x+.3,12,z+.3,'conc');
  B(-22,2.4,30,-21.92,2.7,74,'hazard',nz);B(21.92,2.4,30,22,2.7,74,'hazard',nz);
  // the north bulkhead (gate gN) and the cold room behind it
  B(-5.6,0,29.2,-5,8.6,30.2,'metal');B(5,0,29.2,5.6,8.6,30.2,'metal');B(-5.6,8,29.2,5.6,8.6,30.2,'hazard');B(-5,0,29.4,5,8,30,'q7door',{gate:'gN',gs:[0,8.1,0]});B(-5,-1,29.4,5,0,30,'q7arena',{ground:1});
  B(-3,8.8,30.02,3,9.6,30.06,'q7sB4',nz);
  B(-6,-1,22,6,0,29.4,'q7cold',{ground:1});B(-6.6,0,21.4,6.6,8.4,22,'q7cold');B(-6.6,0,22,-6,8.4,29.4,'q7cold');B(6,0,22,6.6,8.4,29.4,'q7cold');B(-6.6,8,21.4,6.6,8.4,29.4,'q7cold');
  for(const [x,z] of [[-4.6,23.4],[4.6,23.4],[-4.6,27.4],[4.6,27.4]])B(x-.5,0,z-.5,x+.5,2.2,z+.5,'q7cold',{f:{py:'metal2'}});
  for(let i=0;i<6;i++)B(-5+i*2,7.2,24,-4.6+i*2,8,24.2,'q7cold',nz);LIGHT(0,6.6,25.6,'#8ad0ff',10,.8,{flick:.15});
  // pillars with high-voltage panels facing the pit (shoot one with the giant beside it), steam valves along the side walls
  MAP.ez_panels=[];for(const [x,z] of [[-10,41],[10,41],[-10,63],[10,63]]){B(x-1,0,z-1,x+1,12,z+1,'conc');B(x-1.04,0,z-1.04,x+1.04,.5,z+1.04,'hazard',nz);
    const fx=x<0?1:-1;const px=x+fx*1.0;B(Math.min(px,px+fx*.14),1.2,z-.6,Math.max(px,px+fx*.14),2.4,z+.6,'q7panel',{epanel:MAP.ez_panels.length});MAP.ez_panels.push({x:px+fx*.1,y:1.8,z,used:false})}
  MAP.ez_valves=[];for(const [x,z] of [[-21.6,44],[-21.6,60],[21.6,44],[21.6,60]]){const fx=x<0?1:-1;B(Math.min(x,x+fx*.4),1.3,z-.35,Math.max(x,x+fx*.4),2,z+.35,'pipe',{esteam:MAP.ez_valves.length});MAP.ez_valves.push({x:x+fx*.5,y:1.65,z,t:0})}
  B(-21.9,2.1,30,-21.6,2.4,74,'pipe',nz);B(21.6,2.1,30,21.9,2.4,74,'pipe',nz);
  // observation galleries (6 m), stairs at their south ends, railings, windows behind
  for(const s of [-1,1]){const xi=s<0?-18:18,xo=s<0?-22:22,x0=Math.min(xi,xo),x1=Math.max(xi,xo);
    B(x0,5.7,36,x1,6,68,'plate',{f:{ny:'metal2'}});for(const z of [36.3,52,67.7])B(xi-.15,0,z-.15,xi+.15,5.7,z+.15,'metal2');
    const sx0=s<0?-18:15,sx1=s<0?-15:18;stairs('z',sx0,sx1,74,67,0,6,14,'plate');B(sx0,5.7,65,sx1,6,67,'plate',{f:{ny:'metal2'}});
    q7rail('z',s<0?-15:14.8,s<0?-14.8:15,74,67,0,6,14);B(s<0?-15:14.85,6,65,s<0?-14.85:15,7,67,'metal2',{rail:1});B(sx0,6,64.88,sx1,7,65,'metal2',{rail:1});
    B(xi-(s<0?.12:0),6,36,xi+(s<0?0:.12),7,65,'metal2',{rail:1});
    for(const z of [40,48,56,62])B(s<0?-21.96:21.92,6.8,z-1.6,s<0?-21.92:21.96,8.6,z+1.6,hash2(z,s,3)<.3?'winLit':'win',{nosolid:true,glass:1})}
  // the cargo lift car D (door faces north into the chamber)
  B(-3,-1,74.3,3,0,80,'plate',{ground:1});B(-3.3,0,74,-3,4.3,80.3,'q7elev');B(3,0,74,3.3,4.3,80.3,'q7elev');B(-3,0,80,3,4.3,80.3,'q7elev');B(-3,4,74.3,3,4.3,80,'q7elev');
  B(-1.5,0,74,0,3,74.3,'q7elev',{gate:'gD',gs:[-1.45,0,0]});B(-1.5,-1,74,1.5,0,74.3,'plate',{ground:1});B(0,0,74,1.5,3,74.3,'q7elev',{gate:'gD',gs:[1.45,0,0]});B(-1.2,3.1,73.94,1.2,3.5,73.98,'q7sElev',nz);B(1.6,1.1,79.95,2.2,1.8,79.99,'q7term',nz);
  q7ceil(0,3.95,77.2,2.4,'x','#e8f0ff',.8,7);
  // lights: floods high in the corners, wall lamps, red emergency lamps
  for(const [x,z] of [[-19,33],[19,33],[-19,71],[19,71]]){B(x-.5,11.4,z-.3,x+.5,11.9,z+.3,'metal2',nz);B(x-.45,11.35,z-.25,x+.45,11.4,z+.25,'lampW',nz);LIGHT(x*.85,10.4,z+(z<50?2:-2),'#e4ecff',30,1.15,{flood:1})}
  for(const [x,z] of [[0,40],[0,64],[-12,52],[12,52],[0,52]])q7ceil(x,11.9,z,3,'x','#dfe8ff',1.05,21,{flick:x===12?.4:0});
  for(const [x,z,f] of [[-21.98,40,'x+'],[-21.98,64,'x+'],[21.98,40,'x-'],[21.98,64,'x-'],[-12,30.02,'z+'],[12,30.02,'z+'],[-10,73.98,'z-'],[10,73.98,'z-']])q7emerg(x,4.2,z,f);
  // work lamps under the galleries, a sodium lamp over the lift, the pit's own red lamp and a white work light over it
  for(const s of [-1,1])for(const z of [42,52,62]){B(s*19.6-.4,5.52,z-.7,s*19.6+.4,5.7,z+.7,'lampW',nz);LIGHT(s*19.2,5,z,'#d8e2ff',13,.85)}
  LIGHT(0,6.5,71.5,'#ffd8a0',12,.75);LIGHT(0,3,52,'#ff5a3a',9,.5);LIGHT(0,7,52,'#e4ecff',12,.6);
  // ================= spawns, zones, gates, objectives =================
  const A=[[-36,0,-2,Math.PI/2],[-36,0,0,Math.PI/2],[-36,0,2,Math.PI/2],[-37.6,0,-1,Math.PI/2],[-37.6,0,1,Math.PI/2],[-34.6,0,-1,Math.PI/2],[-34.6,0,1,Math.PI/2],[-38.8,0,0,Math.PI/2]];
  const Bs=[[-28,0,-1.5,-Math.PI/2],[-28,0,0,-Math.PI/2],[-28,0,1.5,-Math.PI/2],[-26.6,0,-1,-Math.PI/2],[-26.6,0,1,-Math.PI/2],[-29,0,-.8,-Math.PI/2],[-29,0,.8,-Math.PI/2],[-26.6,0,0,-Math.PI/2]];
  const Cs=[[6.6,0,-1.2,-Math.PI/2],[6.6,0,0,-Math.PI/2],[6.6,0,1.2,-Math.PI/2],[8,0,-1.6,-Math.PI/2],[8,0,0,-Math.PI/2],[8,0,1.6,-Math.PI/2],[9.4,0,-.8,-Math.PI/2],[9.4,0,.8,-Math.PI/2]];
  const Dcar=[[-1.4,0,76.4,0],[0,0,76.4,0],[1.4,0,76.4,0],[-1.4,0,78,0],[0,0,78,0],[1.4,0,78,0],[-1.4,0,79.3,0],[1.4,0,79.3,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-62,-14],[-62,11],[-62.4,-1],[-46,-21.6],[-34.5,-21.6],[-46,21.6],[-34.5,21.6],[-54,-21.6],[-54,21.6]];
  const zB=[[-22.5,14.4],[-4.5,14.4],[-10.5,-14,4.5],[-1,-10],[-28.6,10.6],[-0.6,10.6],[0.6,-9,4.5]];
  const zC=[[3.8,-10],[18.2,-10],[33.2,-10],[48.2,-10],[61,-10],[3.8,10],[18.2,10],[33.2,10],[48.2,10],[61,8]];
  const zD=[[-20.6,32],[20.6,32],[-20.6,72.4],[20.6,72.4],[-20,38,6],[20,38,6],[-20,50,6],[20,50,6]];
  const zDc=[[-4,23.6],[0,23.2],[4,23.6],[-2,27],[2,27]];
  MAP.zspawns=[].concat(zA,zB,zC,zD,zDc);
  MAP.ez={
    zones:{A:{box:[-64,-24,-31.2,24],start:A,zsp:zA},B:{box:[-30,-15.4,2,15.4],start:Bs,zsp:zB},C:{box:[2.6,-11.6,62,11.6],start:Cs,zsp:zC},
      D:{box:[-22,22,22,74],start:Dcar,zsp:zD,cold:zDc}},
    // A → B: walk in through the glass doors; B → C: the inner security door; C → D: the lift
    terms:[{x:-26.2,y:0,z:-9.2,r:2.6,n:['보안실 단말','Security terminal']},{x:-25.6,y:4.5,z:-9.4,r:2.6,n:['서버실 단말','Server terminal']}],
    carC:{x0:62.3,x1:68,z0:-3,z1:3,dx:62,dz:0},carD:{x0:-3,x1:3,z0:74.3,z1:80,dx:0,dz:74},
    pit:[0,-.8,52],wallW:[38.5,1.6,-3.08],bulk:[0,4,29.7],door:{A:[-30.6,1.5,0],B:[2.3,1.5,0],C:[62.15,1.5,0],D:[0,1.5,74.15]},
    panels:MAP.ez_panels,valves:MAP.ez_valves,boss:{ctr:[0,0,52],gal:[[-20,6,52],[20,6,52]]}};
  MAP.camps=[{k:'a',w:.2,p:[[-44,0,0],[-45,0,-1]],look:[-60,1,0]},{k:'b',w:.2,p:[[-20,0,0]],look:[-4,1,0]},{k:'c',w:.2,p:[[10,0,0]],look:[40,1,0]},{k:'d',w:.2,p:[[0,0,66]],look:[0,1,52]}];
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#4a5a7c'),i:.62};MAP.spawnYaw=Math.PI/2;
  MAP.cam=(t,cam)=>{const a=t*.05;cam.position.set(-47+Math.sin(a)*9,4.5,Math.cos(a)*9);cam.lookAt(-36,2,0)}}
MAPDEFS.ep1={n:['Q-7 격리 연구동','Q-7 Research Wing'],d:['비 내리는 밤, 격리병원 Q-7의 연구동. 외곽 검문소 → 로비·보안실 → 연구 복도 → 지하 B4 격리 실험장.','A rainy night at the Q-7 research wing: the outer checkpoint, the lobby, the lab corridor, then the B4 isolation chamber underground.'],
  env:{sky:1,rain:1,storm:1,fog:'#0a0c12',fogD:.04,boAmb:.45},bounds:[-66,-26,70,82],build:buildEp1,tex:bakeEp1Tex,ep:1};

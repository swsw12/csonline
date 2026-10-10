'use strict';
// ============ Map "새벽역 Saebyeok Station": an abandoned underground station ============
// B2: an island platform between two track beds (a dead train on the west track), platform screen doors, tunnels at both ends.
// B1: the concourse over the platform (a void looks down onto it), the ticket hall with the gate line and a shuttered exit,
// the station office. Two emergency stairwells join the track beds to B1. Every texture here is painted on first load.
Object.assign(MATS,{
  tileW:{t:'tileW',s:2},tileB:{t:'tileB',uv:'boxV',s:2},granite:{t:'granite',s:2},granite2:{t:'granite2',s:2},tactile:{t:'tactile',s:1.2},
  gravel:{t:'gravel',s:2.5,k:'soft'},track:{t:'track',uv:'boxU',s:2.4,k:'soft'},ceil:{t:'ceil',s:2.4,k:'metal'},tunnel:{t:'tunnel',s:3},voidT:{t:'voidT',s:3},
  train:{t:'train',s:4,vo:-.62,sv:3.07,k:'metal'},trainE:{t:'train',s:4,vo:-.62,sv:3.07,uo:.5,k:'metal'},
  trainIn:{t:'trainIn',s:4,vo:-.62,sv:3.07,k:'metal'},trainInW:{t:'trainIn',s:4,vo:-.62,sv:3.07,uo:.5,k:'metal'},
  trainFl:{t:'trainFl',s:2,k:'metal'},trainCab:{t:'trainCab',uv:'box',k:'metal'},trainEnd:{t:'trainEnd',uv:'box',k:'metal'},seat:{t:'seat',s:1,k:'soft'},
  psd:{t:'psd',uv:'boxV',s:2,k:'glass'},psdHead:{t:'psdHead',uv:'boxV',s:4,emis:.3,k:'metal'},psdHeadE:{t:'psdHead',uv:'boxV',s:4,emis:.3,uo:.5,k:'metal'},
  glass:{t:'glass',uv:'boxV',s:2,k:'glass'},
  signSt:{t:'signSt',uv:'box',emis:.35,k:'metal'},signDir:{t:'signDir',uv:'box',emis:.45,k:'metal'},signExit:{t:'signExit',uv:'box',emis:.45,k:'metal'},
  signInfo:{t:'signInfo',uv:'box',emis:.35,k:'metal'},signOffice:{t:'signOffice',uv:'box',emis:.2,k:'metal'},signMart:{t:'signMart',uv:'box',emis:.3,k:'metal'},
  ad0:{t:'ad0',uv:'box',emis:.42,k:'glass'},ad1:{t:'ad1',uv:'box',emis:.42,k:'glass'},ad2:{t:'ad2',uv:'box',emis:.42,k:'glass'},
  vend:{t:'vend',uv:'box',emis:.38,k:'metal'},routeMap:{t:'routeMap',uv:'box',emis:.14,k:'glass'},shutter:{t:'shutter',uv:'boxV',s:3,k:'metal'},
  gate:{t:'gate',uv:'boxV',s:1.4,k:'metal'},tmach:{t:'tmach',uv:'box',emis:.25,k:'metal'},lampOff:{t:'lampOff',uv:'box',k:'metal'},
});
// ---------- textures ----------
// periodic cellular noise: distance to the nearest and second-nearest feature point and the cell id (S must divide the texture size)
function cellN(P,x,y,S,seed){const NC=P.w/S,cx=Math.floor(x/S),cy=Math.floor(y/S);let f1=1e9,f2=1e9,id=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const gx=cx+i,gy=cy+j,wx=((gx%NC)+NC)%NC,wy=((gy%NC)+NC)%NC;
    const px=(gx+.15+hash2(wx,wy,seed)*.7)*S,py=(gy+.15+hash2(wx,wy,seed+1)*.7)*S,d=Math.hypot(x-px,y-py);if(d<f1){f2=f1;f1=d;id=wy*NC+wx}else if(d<f2)f2=d}
  return [f1,f2,id]}
function texTileW(){const N=TN;return paint(N,N,P=>{
  // 12.5 cm glazed tiles, cream with a little variation; grout greyed by years of dust
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=x>>4,ty=y>>4,gx=x&15,gy=y&15;let c;
    if(gx<1||gy<1)c=(gx===0&&gy===0)?'#4e4b44':'#66625a';
    else{const v=hash2(tx,ty,401);c=v<.07?'#b9b4a2':v<.22?'#cfcab6':'#d9d5c3';const n=P.n(x,y,48,402,3);c=mix(c,'#857d6a',clamp((n-.52)*1.5,0,.55));
      if(gx===1||gy===1)c=lt(c,.1);else if(gx===15||gy===15)c=dk(c,.07);if(hash2(x,y,403)<.02)c=dk(c,.08)}
    P.set(x,y,c)}
  // missing tiles show the mortar bed; hairline cracks; rust and water streaks; soot
  for(let i=0;i<3;i++){const tx=Math.floor(hash2(i,1,404)*16),ty=Math.floor(hash2(i,2,404)*16);for(let y=1;y<16;y++)for(let x=1;x<16;x++)P.set(tx*16+x,ty*16+y,hash2(x,y,405+i)<.5?'#6a665c':'#76726a')}
  for(let i=0;i<7;i++)crack(P,Math.floor(hash2(i,3,406)*N),Math.floor(hash2(i,4,406)*N),20+Math.floor(hash2(i,5,406)*36),410+i,'#5c584e',null);
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,6,407)*N),Math.floor(hash2(i,7,407)*N),30+Math.floor(hash2(i,8,407)*130),.1+hash2(i,9,407)*.14,1+(i%3===0?1:0));
  for(let i=0;i<7;i++)stain(P,hash2(i,1,408)*N,hash2(i,2,408)*N,14+hash2(i,3,408)*26,10+hash2(i,4,408)*18,.17,420+i)})}
function texTileB(){const W=TN,H=32;return paint(W,H,P=>{
  // the line colour band: two rows of teal tiles
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const tx=x>>4,ty=y>>4,gx=x&15,gy=y&15;let c;
    if(gx<1||gy<1)c='#3a4440';else{const v=hash2(tx,ty,431);c=ty?(v<.2?'#167066':'#1b7c71'):(v<.2?'#11594f':'#14655b');const n=P.n(x,y,32,432,2);c=mix(c,'#2a3a34',clamp((n-.55)*1.6,0,.5));
      if(gx===1||gy===1)c=lt(c,.12);if(hash2(x,y,433)<.03)c=dk(c,.12)}P.set(x,y,c)}})}
function texGranite(pal,seed,S){const N=TN;return paint(N,N,P=>{
  // polished speckled slabs, each a slightly different shade; joints and worn paths
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=Math.floor(x/S),sy=Math.floor(y/S),tint=hash2(sx,sy,seed)-.5;
    let t=.5+tint*.2+(P.n(x,y,24,seed+1,3)-.5)*.32;const h=hash2(x,y,seed+2);if(h<.07)t-=.32;else if(h>.955)t+=.34;
    let c=dith(P,x,y,t,pal,.1);const lx=x%S,ly=y%S;if(lx===0||ly===0)c=dk(pal[1],.45);else if(lx===1||ly===1)c=lt(c,.05);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,seed+3)*N,hash2(i,2,seed+3)*N,14+hash2(i,3,seed+3)*30,10+hash2(i,4,seed+3)*20,.2,seed+10+i);
  for(let i=0;i<30;i++){const x0=hash2(i,5,seed+4)*N,y0=hash2(i,6,seed+4)*N,l=6+hash2(i,7,seed+4)*20;for(let k=0;k<l;k++)P.set(Math.round(x0+k),Math.round(y0+k*.25),'#2a2a28',.35)}
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,8,seed+5)*N),Math.floor(hash2(i,9,seed+5)*N),40,seed+20+i,dk(pal[0],.4),null)})}
function texTactile(){const N=128;return paint(N,N,P=>{
  // yellow warning blocks, 30 cm, with raised domes lit from above
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=x&31,by=y&31;let c=(bx<1||by<1)?'#4a3c10':'#c49416';const n=P.n(x,y,16,441,2);c=mix(c,'#5a4a1e',clamp((n-.5)*1.3,0,.6));
    const dx=(bx%8)-4,dy=(by%8)-4,r=Math.hypot(dx,dy);if(r<2.7&&bx>1&&by>1)c=r<1.4?lt(c,.22):(dx+dy<0?lt(c,.1):dk(c,.3));if(hash2(x,y,442)<.05)c=dk(c,.18);P.set(x,y,c)}})}
function texGravel(){const N=TN;return paint(N,N,P=>{
  // ballast: angular stones with dark gaps, oil and rust on top
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,8,451);const e=f2-f1;const tone=hash2(id,1,452);
    let base=tone<.3?'#4a4640':tone<.6?'#57534c':tone<.85?'#625e56':'#3e3a34';let c=e<1.2?'#141310':mix(lt(base,.12),dk(base,.3),clamp(f1/6,0,1));if(hash2(x,y,453)<.06)c=dk(c,.2);P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,454)*N,hash2(i,2,454)*N,12+hash2(i,3,454)*26,8+hash2(i,4,454)*18,.35,455+i)})}
function texTrack(){const N=TN;return paint(N,N,P=>{
  // the bed between and under the rails: ballast with concrete sleepers every 60 cm, steel base plates under the rails
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,8,461);const tone=hash2(id,1,462);const base=tone<.4?'#4a4640':tone<.8?'#57534c':'#3c3832';
    P.set(x,y,f2-f1<1.2?'#141310':mix(lt(base,.1),dk(base,.3),clamp(f1/6,0,1)))}
  for(let k=0;k<4;k++){const y0=k*64+18;for(let y=y0;y<y0+27;y++)for(let x=10;x<N-10;x++){let c=dith(P,x,y,.5+(P.n(x,y,12,463,2)-.5)*.45+(hash2(x,y,464)-.5)*.1,['#45453f','#52524b','#5f5f57','#6b6b62'],.1);
      if(y===y0||x===10)c=lt(c,.12);if(y===y0+26||x===N-11)c=dk(c,.35);
      for(const rx of [N*.2,N*.8]){const d=Math.abs(x-rx);if(d<11)c=d<8?(hash2(x,y,465)<.2?'#5a3218':'#2c2824'):'#3a332a'}P.set(x,y,c)}}
  for(let i=0;i<10;i++)stain(P,N*(.35+hash2(i,1,466)*.3),hash2(i,2,466)*N,8+hash2(i,3,466)*12,10+hash2(i,4,466)*20,.45,467+i)})}
function texCeil(){const N=TN;return paint(N,N,P=>{
  // suspended ceiling: 60 cm perforated metal panels, a few missing (black void with a pipe)
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const px=Math.floor(x/64),py=Math.floor(y/64),lx=x&63,ly=y&63;let c;
    const gone=hash2(px,py,471)<.05;if(lx<2||ly<2)c='#2a2c2e';else if(gone){c=(ly>26&&ly<34)?'#2a2622':'#08090a';if(ly===27)c='#4a4038'}
    else{let t=.55+(P.n(x,y,40,472,3)-.5)*.35+(hash2(px,py,473)-.5)*.2;c=dith(P,x,y,t,['#5a5e60','#686c6e','#76797a','#838686','#909292'],.08);
      if(lx%6===3&&ly%6===3)c=dk(c,.45);if(lx===2||ly===2)c=lt(c,.1);if(lx===63||ly===63)c=dk(c,.2)}
    P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,474)*N,hash2(i,2,474)*N,10+hash2(i,3,474)*24,10+hash2(i,4,474)*20,.3,475+i)})}
function texTunnel(){const N=TN;return paint(N,N,P=>{
  // sooty tunnel concrete with cable trays and a drain line
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,64,481,4)*1.05+(hash2(x,y,482)-.5)*.1;P.set(x,y,dith(P,x,y,t,['#141514','#1a1b19','#20211f','#272825','#2e2f2b'],.1))}
  for(const cy of [60,74,88]){for(let x=0;x<N;x++){const sag=Math.round(Math.sin(x/N*TAU*2)*2);for(let k=0;k<4;k++)P.set(x,cy+sag+k,k===0?'#3a3a36':k===3?'#060606':'#0e0e0d')}}
  for(let x=0;x<N;x++){P.set(x,40,'#3a3c3a');P.set(x,41,'#121312');if(x%32<2)for(let y=40;y<96;y++)P.set(x,y,'#2a2b29')}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,483)*N),100+Math.floor(hash2(i,2,483)*60),40+Math.floor(hash2(i,3,483)*90),.2,2)})}
function texVoid(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=hash2(x,y,491)<.02?'#14161a':'#050506';P.set(x,y,c)}})}
// train side: 4 m of car per tile (door at u .05-.45, window at .55-.95), v from the skirt (-0.62) to the roof line (2.45)
const TRAIN_V=y=>Math.round((2.45-y)/3.07*256);
function texTrain(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,48,501,3)-.5)*.2+((x%6)<1?.12:(x%6)===5?-.1:0);let c=dith(P,x,y,t,['#6c7276','#7e8488','#90969a','#a2a8ac','#b2b8bc'],.06);P.set(x,y,c)}
  // skirt, the line-colour stripe, a thin roof gutter
  for(let y=TRAIN_V(-.14);y<N;y++)for(let x=0;x<N;x++)P.set(x,y,hash2(x,y,502)<.1?'#1c1e20':'#26282a');
  for(let y=TRAIN_V(.98);y<TRAIN_V(.74);y++)for(let x=0;x<N;x++)P.set(x,y,y===TRAIN_V(.98)?'#0e4a42':'#1b8a78');
  for(let x=0;x<N;x++){P.set(x,1,'#3a3e40');P.set(x,2,'#d0d4d6')}
  // window: dark glass, black rubber frame, a reflection streak
  const wx0=141,wx1=243,wy0=TRAIN_V(2.02),wy1=TRAIN_V(1.08);
  for(let y=wy0-3;y<=wy1+3;y++)for(let x=wx0-3;x<=wx1+3;x++){const edge=y<wy0||y>wy1||x<wx0||x>wx1;P.set(x,y,edge?'#151719':((x-wx0)+(wy1-y)*.6)%60<6?'#2e3a44':'#121820')}
  // door: two leaves with windows, a seam in the middle, an indicator lamp over it
  const dx0=13,dx1=115,dy0=TRAIN_V(2.2),dy1=TRAIN_V(.05);
  for(let y=dy0;y<=dy1;y++)for(let x=dx0;x<=dx1;x++){if(x===dx0||x===dx1||y===dy0||x===64)P.set(x,y,'#2a2e30');else if(x===dx0+1||x===65)P.set(x,y,'#c4c8ca')}
  for(const [a,b] of [[dx0+8,58],[70,dx1-8]])for(let y=TRAIN_V(1.95);y<=TRAIN_V(1.2);y++)for(let x=a;x<=b;x++){const e=x===a||x===b||y===TRAIN_V(1.95)||y===TRAIN_V(1.2);P.set(x,y,e?'#151719':((x+y)%50<5?'#2e3a44':'#121820'))}
  for(let y=TRAIN_V(2.36);y<TRAIN_V(2.27);y++)for(let x=58;x<71;x++)P.set(x,y,'#ff7a2a');
  for(let i=0;i<26;i++)streak(P,Math.floor(hash2(i,1,503)*N),TRAIN_V(1.05)+Math.floor(hash2(i,2,503)*20),30+Math.floor(hash2(i,3,503)*60),.16,2);
  P.post=x=>{x.fillStyle='#1a1c1e';x.font='bold 11px sans-serif';x.fillText('3207',214,TRAIN_V(.3));x.fillStyle='#e8ece8';x.font='bold 9px sans-serif';x.fillText('Q선',150,TRAIN_V(.82))}})}
function texTrainIn(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,40,511,3)-.5)*.2;P.set(x,y,dith(P,x,y,t,['#8e8a7e','#a09c8f','#b2ae9f','#c0bcad','#ccc8b9'],.06))}
  // window over the seats (the tunnel is black outside), the ad frames above it, a kick plate at the floor
  const wy0=TRAIN_V(2.0),wy1=TRAIN_V(1.1);for(let y=wy0-4;y<=wy1+4;y++)for(let x=137;x<=247;x++){const e=y<wy0||y>wy1||x<141||x>243;P.set(x,y,e?'#55534c':((x+y)%70<4?'#1e242a':'#07090b'))}
  for(let y=TRAIN_V(2.38);y<TRAIN_V(2.08);y++)for(let x=0;x<N;x++){const f=x%64;P.set(x,y,f<3?'#55534c':hash2(x>>6,0,512)<.5?'#4a6a8a':'#8a5a3a')}
  for(let y=TRAIN_V(.2);y<TRAIN_V(.05);y++)for(let x=0;x<N;x++)P.set(x,y,'#4a4a46');
  // door leaves from the inside
  const dx0=13,dx1=115;for(let y=TRAIN_V(2.2);y<=TRAIN_V(.05);y++)for(let x=dx0;x<=dx1;x++){let c=(x===dx0||x===dx1||x===64)?'#3a3a36':'#9a988e';if(y>=TRAIN_V(1.95)&&y<=TRAIN_V(1.2)&&(x>dx0+8&&x<58||x>70&&x<dx1-8))c='#07090b';P.set(x,y,c)}
  for(let i=0;i<12;i++)stain(P,hash2(i,1,513)*N,hash2(i,2,513)*N,8+hash2(i,3,513)*20,6+hash2(i,4,513)*14,.18,514+i);
  P.post=x=>{x.fillStyle='#e8e4d8';x.font='bold 8px sans-serif';x.fillText('비상시 문 여는 법',22,TRAIN_V(.9));x.fillStyle='#c83a2a';x.fillRect(30,TRAIN_V(.82),10,8)}})}
function texTrainFl(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,32,521,3)-.5)*.3+(hash2(x,y,522)-.5)*.1;let c=dith(P,x,y,t,['#2a2c2e','#333638','#3c3f42','#46494c'],.08);
    if(hash2(x,y,523)<.03)c=lt(c,.2);P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,524)*N,hash2(i,2,524)*N,10+hash2(i,3,524)*20,8+hash2(i,4,524)*16,.3,525+i)})}
function texTrainCab(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,40,531,3)-.5)*.2;P.set(x,y,dith(P,x,y,t,['#7e8488','#90969a','#a2a8ac','#b2b8bc'],.06))}
  for(let y=TRAIN_V(-.14);y<N;y++)for(let x=0;x<N;x++)P.set(x,y,'#1e2022');
  for(let y=TRAIN_V(.98);y<TRAIN_V(.74);y++)for(let x=0;x<N;x++)P.set(x,y,'#1b8a78');
  // windscreen split by the emergency door, destination sign above, lamps below
  for(let y=TRAIN_V(2.05);y<=TRAIN_V(1.15);y++)for(let x=14;x<N-14;x++){const e=y===TRAIN_V(2.05)||y===TRAIN_V(1.15)||x<17||x>N-18||Math.abs(x-128)<26&&Math.abs(x-128)>22;
    P.set(x,y,e?'#141618':Math.abs(x-128)<=22?'#20262c':((x-y)%70<7?'#2e3a44':'#0e1418'))}
  for(let y=TRAIN_V(2.38);y<TRAIN_V(2.12);y++)for(let x=70;x<186;x++)P.set(x,y,'#0a0a0a');
  for(const cx of [40,216])for(let y=-8;y<=8;y++)for(let x=-12;x<=12;x++)if(Math.hypot(x/12,y/8)<1)P.set(cx+x,TRAIN_V(.45)+y,Math.hypot(x/12,y/8)<.6?'#fff4d0':'#8a8a80');
  for(let y=TRAIN_V(.3);y<TRAIN_V(-.3);y++)for(let x=110;x<146;x++)P.set(x,y,'#16181a');
  P.post=x=>{x.fillStyle='#ffa030';x.font='bold 13px sans-serif';x.textAlign='center';x.fillText('회송  OUT OF SERVICE',128,TRAIN_V(2.17));x.fillStyle='#1a1c1e';x.font='bold 12px sans-serif';x.fillText('3207',128,TRAIN_V(.62))}})}
function texTrainEnd(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,40,541,3)-.5)*.2;P.set(x,y,dith(P,x,y,t,['#8e8a7e','#a09c8f','#b2ae9f','#c0bcad'],.06))}
  for(let y=TRAIN_V(2.2);y<=TRAIN_V(.05);y++)for(let x=88;x<=168;x++){let c=(x===88||x===168||y===TRAIN_V(2.2))?'#3a3a36':'#7a786e';if(y>=TRAIN_V(1.9)&&y<=TRAIN_V(1.35)&&x>100&&x<156)c='#07090b';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#c83a2a';x.font='bold 9px sans-serif';x.textAlign='center';x.fillText('승무원실 CREW ONLY',128,TRAIN_V(1.15))}})}
function texSeat(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,20,551,3)-.5)*.3+((x+y)%8<2?.08:0);let c=dith(P,x,y,t,['#122a4a','#1a3860','#224674','#2c5488'],.08);
    if(x%128<4)c='#0a1424';if(hash2(x,y,552)<.02)c=lt(c,.2);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,553)*N,hash2(i,2,553)*N,10+hash2(i,3,553)*20,8+hash2(i,4,553)*14,.35,554+i)})}
function texPSD(){const N=TN;return paint(N,N,P=>{
  // a 2 m screen-door panel: steel frame and mid rail, clear glass (transparent), a warning sticker
  for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.alpha(x,y,0);
  const F=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){let c=dith(P,x,y,.55+(P.n(x,y,16,561,2)-.5)*.3,['#4a5054','#5e6468','#72787c','#868c90'],.08);if(y===y0||x===x0)c=lt(c,.15);if(y===y1-1||x===x1-1)c=dk(c,.3);P.set(x,y,c)}};
  F(0,0,10,N);F(N-10,0,N,N);F(0,0,N,12);F(0,N-18,N,N);F(0,Math.round(N*.52),N,Math.round(N*.52)+6);
  for(let i=0;i<5;i++){const x0=20+hash2(i,1,562)*200,y0=20+hash2(i,2,562)*180;for(let k=0;k<22;k++)P.set(Math.round(x0+k),Math.round(y0-k*1.6),'#9fb6c4')}
  for(let y=150;y<172;y++)for(let x=96;x<160;x++)P.set(x,y,(y===150||y===171||x===96||x===159)?'#1a1a16':'#e8c21a');
  P.post=x=>{x.fillStyle='#1a1a16';x.font='bold 9px sans-serif';x.textAlign='center';x.fillText('기대지 마세요',128,160);x.font='bold 7px sans-serif';x.fillText('DO NOT LEAN',128,169)}})}
function texPSDHead(){const W=TN,H=64;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.5+(P.n(x,y,16,571,2)-.5)*.3,['#1e2124','#25292c','#2c3034','#34383c'],.08);if(y<3||y>H-4)c='#4a4e52';P.set(x,y,c)}
  // over the door (u .25): door number and a status lamp; elsewhere a scrolling-message strip (dead)
  for(let y=14;y<34;y++)for(let x=38;x<90;x++)P.set(x,y,'#050806');for(let y=40;y<50;y++)for(let x=58;x<70;x++)P.set(x,y,Math.hypot(x-64,y-45)<5?'#3aff6a':'#0a120c');
  for(let y=18;y<30;y++)for(let x=130;x<244;x++)P.set(x,y,'#060606');
  P.post=x=>{x.fillStyle='#ffb43a';x.font='bold 13px monospace';x.textAlign='center';x.fillText('3-2',64,29);x.fillStyle='#ff5a3a';x.font='bold 9px monospace';x.fillText('운행 중지  SERVICE SUSPENDED',187,27)}})}
function texGlass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.alpha(x,y,0);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const fr=y<16||y>N-14||x<6||x>N-7||(x>N/2-3&&x<N/2+3);if(fr)P.set(x,y,y<16?(y<3||y>13?'#3a3e42':'#8a9094'):'#5a6064')}
  for(let i=0;i<6;i++){const x0=14+hash2(i,1,581)*220,y0=40+hash2(i,2,581)*180;for(let k=0;k<26;k++)P.set(Math.round(x0+k),Math.round(y0-k*1.4),'#a8bcc8')}})}
function texAd(kind){const W=256,H=144;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=x<6||y<6||x>=W-6||y>=H-6;P.set(x,y,e?(x<2||y<2||x>=W-2||y>=H-2?'#1a1c1e':'#5a6064'):'#000')}
  P.post=x=>{x.save();x.beginPath();x.rect(6,6,W-12,H-12);x.clip();x.textAlign='center';
    if(kind===0){const g=x.createLinearGradient(0,6,0,H-6);g.addColorStop(0,'#6aa8e8');g.addColorStop(1,'#e8f2fa');x.fillStyle=g;x.fillRect(6,6,W-12,H-12);
      x.fillStyle='#f8f8f4';x.fillRect(150,40,56,76);x.fillStyle='#3a7ac8';x.fillRect(150,40,56,22);x.beginPath();x.moveTo(150,40);x.lineTo(178,22);x.lineTo(206,40);x.fill();
      x.fillStyle='#1d4f8a';x.font='bold 26px sans-serif';x.fillText('새벽우유',78,60);x.font='bold 12px sans-serif';x.fillText('아침을 여는 한 잔',78,82);x.fillStyle='#3a6aa0';x.font='bold 9px sans-serif';x.fillText('SAEBYEOK MILK · 1A 등급 원유 100%',78,104)}
    else if(kind===1){x.fillStyle='#c4231c';x.fillRect(6,6,W-12,H-12);x.fillStyle='#ffd23a';x.fillRect(6,H-36,W-12,30);
      x.fillStyle='#fff';x.font='bold 34px sans-serif';x.fillText('Q-마트',96,64);x.font='bold 13px sans-serif';x.fillText('24시간 언제나 열려 있습니다',96,88);
      x.fillStyle='#c4231c';x.font='bold 13px sans-serif';x.fillText('새벽역 1번 출구 바로 앞',128,H-16);x.strokeStyle='#fff';x.lineWidth=4;x.strokeRect(190,40,40,30);x.beginPath();x.moveTo(186,40);x.lineTo(234,40);x.stroke()}
    else{x.fillStyle='#141414';x.fillRect(6,6,W-12,H-12);for(let i=-2;i<14;i++){x.fillStyle='#e8c21a';x.beginPath();x.moveTo(i*22,6);x.lineTo(i*22+11,6);x.lineTo(i*22-3,22);x.lineTo(i*22-14,22);x.fill();
        x.beginPath();x.moveTo(i*22,H-22);x.lineTo(i*22+11,H-22);x.lineTo(i*22-3,H-6);x.lineTo(i*22-14,H-6);x.fill()}
      x.fillStyle='#e8c21a';x.font='bold 16px sans-serif';x.fillText('격리구역 Q 대책본부',128,48);x.fillStyle='#f0f0e8';x.font='bold 12px sans-serif';x.fillText('감염 의심 증상 시 즉시 신고하십시오',128,72);
      x.fillText('물린 사람과 접촉하지 마십시오',128,90);x.fillStyle='#ff5a4a';x.font='bold 14px sans-serif';x.fillText('☎ 1300-0707',128,112)}
    x.restore();
    // grime over the lit panel
    const id=x.getImageData(0,0,W,H);for(let i=0;i<id.data.length;i+=4){const px=(i/4)%W,py=Math.floor(i/4/W);const n=fbm(px/40,py/40,590+kind,3,W/40);if(n>.6){const f=1-(n-.6)*1.4;id.data[i]*=f;id.data[i+1]*=f;id.data[i+2]*=f}}x.putImageData(id,0,0)}})}
function texVend(){const W=128,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,601,2)-.5)*.3,['#c8ccd0','#d6dadc','#e2e4e6'],.06);if(x<4||x>W-5)c='#8a9094';P.set(x,y,c)}
  for(let y=8;y<40;y++)for(let x=8;x<W-8;x++)P.set(x,y,'#1d5fb8');
  for(let y=48;y<170;y++)for(let x=10;x<W-36;x++)P.set(x,y,'#0c1218');
  const cans=['#d8282a','#2a8ad8','#e8c21a','#2aa84a','#8a2ad8','#e86a1a'];for(let r=0;r<5;r++)for(let k=0;k<6;k++){const cx=16+k*13,cy=54+r*23;const col=cans[(r+k*2)%cans.length];
    for(let y=0;y<16;y++)for(let x=0;x<9;x++)P.set(cx+x,cy+y,x<2?lt(col,.3):x>6?dk(col,.3):col);for(let x=0;x<9;x++)P.set(cx+x,cy+17,'#e8e4d8')}
  for(let y=56;y<160;y+=10)for(let x=W-28;x<W-14;x++)P.set(x,y,y%20?'#e8e8e8':'#2a2a2a');
  for(let y=190;y<226;y++)for(let x=14;x<W-14;x++)P.set(x,y,(y===190||y===225)?'#4a4e52':'#141618');
  P.post=x=>{x.fillStyle='#fff';x.font='bold 18px sans-serif';x.textAlign='center';x.fillText('COOL',W/2,31);x.fillStyle='#1a1a1a';x.font='bold 8px sans-serif';x.fillText('음료 DRINKS',W/2,184)}})}
function texRouteMap(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c='#ecebe4';if(x<4||y<4||x>=W-4||y>=H-4)c='#3a3e42';if(hash2(x,y,611)<.04)c=dk(c,.1);P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a1c1e';x.font='bold 11px sans-serif';x.textAlign='left';x.fillText('Q선 노선도  LINE Q',12,20);
    x.strokeStyle='#1b8a78';x.lineWidth=7;x.beginPath();x.moveTo(20,70);x.lineTo(236,70);x.stroke();
    const st=['해오름','동틀녘','새벽','첫차','별빛','달무리'];st.forEach((n,i)=>{const sx=28+i*40;x.fillStyle=n==='새벽'?'#d8282a':'#fff';x.strokeStyle='#1a1c1e';x.lineWidth=2;x.beginPath();x.arc(sx,70,n==='새벽'?7:5,0,TAU);x.fill();x.stroke();
      x.fillStyle='#1a1c1e';x.font=(n==='새벽'?'bold 11px':'9px')+' sans-serif';x.textAlign='center';x.fillText(n,sx,i%2?96:52)});
    x.fillStyle='#d8282a';x.font='bold 9px sans-serif';x.fillText('현재역 YOU ARE HERE',108,118)}})}
function texShutter(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=y%10;let t=.5+(P.n(x,y,40,621,3)-.5)*.3+(r<2?.18:r>7?-.15:0);let c=dith(P,x,y,t,['#3a3c3c','#4a4c4c','#5a5c5c','#6a6c6a','#7a7c7a'],.08);P.set(x,y,c)}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,622)*N),Math.floor(hash2(i,2,622)*N*.5),40+Math.floor(hash2(i,3,622)*120),.18,2);
  for(let i=0;i<5;i++){const cx=hash2(i,4,623)*N,cy=hash2(i,5,623)*N;for(let y=-10;y<=10;y++)for(let x=-14;x<=14;x++){if(Math.hypot(x/14,y/10)<1&&P.n(cx+x,cy+y,6,624+i,2)>.5)P.set(Math.round(cx+x),Math.round(cy+y),'#6a2a1a',.6)}}
  P.post=x=>{x.save();x.translate(150,150);x.rotate(-.12);x.fillStyle='rgba(200,40,40,.85)';x.font='bold 30px sans-serif';x.fillText('X',0,0);x.fillStyle='rgba(230,230,220,.75)';x.font='bold 13px sans-serif';x.fillText('출입금지',-40,30);x.restore()}})}
function texGate(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,30,631,2)-.5)*.2+(x%5<1?.08:0);let c=dith(P,x,y,t,['#8a9094','#9ca2a6','#aeb4b8','#bec4c8'],.06);if(y>N-20)c='#2a2c2e';P.set(x,y,c)}
  for(let y=30;y<70;y++)for(let x=170;x<230;x++)P.set(x,y,(y<34||y>65||x<174||x>225)?'#1a1c1e':'#123a6a');
  for(let y=40;y<60;y++)for(let x=30;x<60;x++)P.set(x,y,Math.abs((x-45)-(y-50))<4&&x<52||Math.abs((x-45)+(y-50))<4&&x<52?'#3aff6a':'#0a120c');
  P.post=x=>{x.fillStyle='#e8f0ff';x.font='bold 10px sans-serif';x.textAlign='center';x.fillText('교통카드',200,55)}})}
function texTMach(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,641,2)-.5)*.3,['#2a4a6a','#335578','#3c6086'],.06);if(x<4||x>W-5||y<4)c='#1a2a3a';P.set(x,y,c)}
  for(let y=30;y<92;y++)for(let x=16;x<W-16;x++)P.set(x,y,(y<33||y>88||x<19||x>W-20)?'#0a0e12':'#0e2a4a');
  for(let r=0;r<3;r++)for(let k=0;k<4;k++)for(let y=0;y<8;y++)for(let x=0;x<14;x++)P.set(22+k*22+x,104+r*14+y,'#c8ccd0');
  for(let y=150;y<158;y++)for(let x=30;x<98;x++)P.set(x,y,'#0a0a0a');
  P.post=x=>{x.fillStyle='#e8f0ff';x.font='bold 11px sans-serif';x.textAlign='center';x.fillText('승차권 발매기',W/2,20);x.fillStyle='#ff5a4a';x.font='bold 10px sans-serif';x.fillText('사용 중지',W/2,62);x.fillStyle='#8ab4e8';x.font='8px sans-serif';x.fillText('OUT OF ORDER',W/2,76)}})}
function texLampOff(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){const e=x<2||x>29||y<2||y>29;let c=e?'#3a3c3e':mix('#6a6c6a','#4a4c4a',Math.abs(x-15.5)/16);if(hash2(x,y,651)<.1)c=dk(c,.3);P.set(x,y,c)}})}
function bakeSubTex(){if(TEX.tileW)return;
  TEX.tileW=mkTex(texTileW());TEX.tileB=mkTex(texTileB());TEX.granite=mkTex(texGranite(['#3e3e3c','#4c4c49','#5a5a56','#686864','#767671','#848480'],661,64));
  TEX.granite2=mkTex(texGranite(['#4a453c','#58524a','#666057','#746e64','#827c71','#8e887c'],671,128));TEX.tactile=mkTex(texTactile());TEX.gravel=mkTex(texGravel());TEX.track=mkTex(texTrack());
  TEX.ceil=mkTex(texCeil());TEX.tunnel=mkTex(texTunnel());TEX.voidT=mkTex(texVoid());TEX.train=mkTex(texTrain());TEX.trainIn=mkTex(texTrainIn());TEX.trainFl=mkTex(texTrainFl());
  TEX.trainCab=mkTex(texTrainCab(),false);TEX.trainEnd=mkTex(texTrainEnd(),false);TEX.seat=mkTex(texSeat());TEX.psd=mkTex(texPSD());TEX.psdHead=mkTex(texPSDHead());TEX.glass=mkTex(texGlass());
  TEX.signSt=mkTex(texSign([{t:'새벽  Saebyeok'},{t:'← 동틀녘        Q07        해오름 →',s:7}],'#ecebe4','#1a1c1e',160,40),false);
  TEX.signDir=mkTex(texSign([{t:'↓ 타는 곳'},{t:'TO TRAINS',s:8}],'#e8c21a','#141414',96,32),false);
  TEX.signExit=mkTex(texSign([{t:'나가는 곳 →'},{t:'EXIT',s:8}],'#e8c21a','#141414',96,32),false);
  TEX.signInfo=mkTex(texSign([{t:'고객안내센터'},{t:'INFORMATION',s:8}],'#1d5f8a','#eaf2f8',128,28),false);
  TEX.signOffice=mkTex(texSign([{t:'역무실'},{t:'STATION OFFICE',s:7}],'#2a3a4a','#e0e6ea',96,24),false);
  TEX.signMart=mkTex(texSign([{t:'Q-마트 24'}],'#c4231c','#fff4e0',96,22),false);
  TEX.ad0=mkTex(texAd(0),false);TEX.ad1=mkTex(texAd(1),false);TEX.ad2=mkTex(texAd(2),false);TEX.vend=mkTex(texVend(),false);TEX.routeMap=mkTex(texRouteMap(),false);
  TEX.shutter=mkTex(texShutter());TEX.gate=mkTex(texGate());TEX.tmach=mkTex(texTMach(),false);TEX.lampOff=mkTex(texLampOff());
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['tileW','tileB','granite','granite2','tactile','gravel','track','ceil','tunnel','train','trainIn','trainFl','seat','psd','shutter','gate'])TEX[k].anisotropy=an;
  MIXC.clear();VN_T.clear();_vnK=-1;_vnT=null;_fbC.length=0}
// ---------- geometry ----------
// one train car on the west track: floor, skirt, side walls with door openings, roof, ends, seats, lights.
// cab: 'n'/'s' puts a driving cab on that end; gang: 'n'/'s' leaves a gangway opening there
function trainCar(z0,z1,doors,openE,openW,cab,gang){const x0=-8.3,x1=-5.1,cx=-6.7,N='none';
  B(x0+.12,-.62,z0+.15,x1-.12,.05,z1-.15,'trainFl',{f:{ny:N}});B(x0+.25,-1,z0+.4,x1-.25,-.62,z1-.4,'tire');
  wallZ(x1-.12,x1,z0,z1,-.62,2.45,'trainE',openE.map(c=>[c-.8,c+.8,.05,2.2]),{f:{nx:'trainIn'}});
  wallZ(x0,x0+.12,z0,z1,-.62,2.45,'train',openW.map(c=>[c-.8,c+.8,.05,2.2]),{f:{px:'trainInW'}});
  B(x0,2.45,z0,x1,2.95,z1,'metal',{f:{ny:'ceil'}});B(x0+.4,2.95,z0+.25,x1-.4,3.1,z1-.25,'metal');
  for(const [zz,s] of [[z0,-1],[z1,1]]){const za=s<0?zz:zz-.15,zb=s<0?zz+.15:zz;const end=s<0?'n':'s';
    if(cab===end)B(x0,-.62,za,x1,2.45,zb,'metal2',{f:s<0?{nz:'trainCab',pz:'trainEnd'}:{pz:'trainCab',nz:'trainEnd'}});
    else wallX(x0,x1,za,zb,-.62,2.45,'metal2',gang===end?[[cx-.8,cx+.8,.05,2.2]]:[])}
  // seats between the doors, grab rails over them, poles at the doors
  const cut=[z0+.25,...doors.flatMap(c=>[c-.95,c+.95]),z1-.25];
  for(let i=0;i<cut.length;i+=2){const za=cut[i],zb=cut[i+1];if(zb-za<.5)continue;
    B(x0+.12,.05,za,x0+.52,.46,zb,'seat');B(x0+.12,.46,za,x0+.22,1.0,zb,'seat');B(x1-.52,.05,za,x1-.12,.46,zb,'seat');B(x1-.22,.46,za,x1-.12,1.0,zb,'seat');
    B(x0+.4,1.92,za,x0+.45,1.97,zb,'metal2',{nosolid:true});B(x1-.45,1.92,za,x1-.4,1.97,zb,'metal2',{nosolid:true})}
  for(const c of doors)for(const z of [c-1.05,c+1.05])for(const x of [x0+.55,x1-.58])B(x,.05,z-.025,x+.03,2.45,z+.025,'metal2',{nosolid:true});
  // ceiling light strips (some dead) and their light
  for(let z=z0+2.5,i=0;z<z1-1.5;z+=6,i++){const dead=i===1&&cab==='s';B(cx-.15,2.39,z-1.2,cx+.15,2.45,z+1.2,dead?'lampOff':'lampW',{nosolid:true});if(!dead)LIGHT(cx,2.15,z,'#f6eed8',6.5,.95)}}
function buildSubway(){const N='none',GL={pass:1};
  // ================= B2: platform level (platform top y 0, track beds y -1.1, ceiling y 5) =================
  // ---- track beds with sleepers and rails, running into the tunnels
  for(const c of [-6.7,6.7]){const x0=c<0?-10:5,x1=c<0?-5:10;
    B(c-1.25,-2.1,-30.5,c+1.25,-1.1,30.5,'track',{ground:1});B(x0,-2.1,-30.5,c-1.25,-1.1,30.5,'gravel',{ground:1});B(c+1.25,-2.1,-30.5,x1,-1.1,30.5,'gravel',{ground:1});
    for(const r of [c-.72,c+.72]){B(r-.05,-1.1,-30.5,r+.05,-1.02,30.5,'metal',{nosolid:true});B(r-.035,-1.02,-30.5,r+.035,-.95,30.5,'metal2',{nosolid:true})}}
  // ---- crossovers at track level past the platform ends, with steps up and a barrier
  for(const s of [-1,1]){B(-5,-2.1,s<0?-28:26,5,-1.1,s<0?-26:28,'conc',{ground:1});
    if(s<0)stairs('z',-1.5,1.5,-28,-26,-1.1,0,3,'conc');else stairs('z',-1.5,1.5,28,26,-1.1,0,3,'conc');
    const zb=s<0?-26:25.9;B(-4.85,0,zb,-1.5,1.05,zb+.1,'metal2');B(1.5,0,zb,4.85,1.05,zb+.1,'metal2');
    const zs=s<0?zb+.1:zb-.01;B(-4,.35,zs,-2,.75,zs+.01,'signN',{nosolid:true});B(2,.35,zs,4,.75,zs+.01,'signN',{nosolid:true})}
  // ---- the island platform: granite, tactile strips, screen doors with a header
  B(-5,-1.1,-26,5,0,26,'granite',{f:{px:'tunnel',nx:'tunnel',pz:'tunnel',nz:'tunnel'}});
  for(const x of [-4.8,4.5])B(x,0,-26,x+.3,.012,26,'tactile',{nosolid:true});
  const DOORS=[-23,-19,-15,-11,-7,-3,1,5,9,13,17,21];
  wallZ(-4.94,-4.88,-26,26,0,2.2,'psd',[-19,-7,5,13,21].map(c=>[c-1,c+1,0,2.2]),GL);
  wallZ(4.88,4.94,-26,26,0,2.2,'psd',[-23,-11,-3,9,17].map(c=>[c-1,c+1,0,2.2]),GL);
  B(-5,2.2,-26,-4.82,2.75,26,'psdHead',{f:{nx:'metal2'}});B(4.82,2.2,-26,5,2.75,26,'psdHeadE',{f:{px:'metal2'}});
  for(const c of DOORS)for(const x of [-4.97,4.85])for(const d of [-1,1])B(x,0,c+d-.05,x+.12,2.2,c+d+.05,'metal2',{nosolid:true});
  // ---- pillars, the columns that rise through the void, benches, vending machines, a burning bin
  for(const z of [-10,10])B(-.35,0,z-.35,.35,5,z+.35,'tileW');
  B(2.15,0,-24.35,2.85,5,-23.65,'tileW');B(-2.85,0,23.65,-2.15,5,24.35,'tileW');
  for(const x of [-3.5,3.5])for(const z of [-7.5,7.5])B(x-.35,0,z-.35,x+.35,10,z+.35,'tileW',{f:{py:N}});
  for(const [z0,z1] of [[-3.2,-1.4],[1.4,3.2],[-20.4,-18.6],[18.6,20.4]]){B(-.8,0,z0,.8,.42,z1,'metal2',{f:{py:'wood'}});B(-.06,.42,z0,.06,.95,z1,'metal2')}
  B(-1,0,-16,-.3,1.85,-15.2,'metal2',{f:{px:'vend'}});B(-1,0,-15.1,-.3,1.85,-14.3,'metal2',{f:{px:'vend'}});B(.3,0,14.3,1,1.85,15.1,'metal2',{f:{nx:'vend'}});
  B(3.3,0,-25.7,3.9,.85,-25.1,'metal2');B(3.28,.05,-25.72,3.92,.12,-25.08,'hazard',{nosolid:true});LIGHT(3.6,1.3,-25.4,'#ff8a3a',7,.9);MAP.fires.push([3.6,.9,-25.4]);
  for(const [x,z] of [[-1.2,-9],[1.2,9],[4.2,-12.4],[-4.2,12.4]])B(x-.2,0,z-.2,x+.2,.8,z+.2,'metal2',{f:{py:'pipe'}});
  // ---- hall walls: grimy concrete in the pits, tiles above with a band, stairwell doors at track level
  wallZ(-10.6,-10,-28,28,-1.1,0,'tunnel',[[16,18,-1.1,0]],{f:{nx:N}});wallZ(-10.6,-10,-28,28,0,5,'tileW',[[16,18,0,1.15]]);
  wallZ(10,10.6,-28,28,-1.1,0,'tunnel',[[-18,-16,-1.1,0]],{f:{px:N}});wallZ(10,10.6,-28,28,0,5,'tileW',[[-18,-16,0,1.15]]);
  B(-10,1.4,-28,-9.98,1.7,28,'tileB',{nosolid:true});B(9.98,1.4,-28,10,1.7,28,'tileB',{nosolid:true});
  B(-10,1.25,16.2,-9.97,1.6,17.8,'signE',{nosolid:true});B(9.97,1.25,-17.8,10,1.6,-16.2,'signE',{nosolid:true});
  // ads and station-name boards on the track walls
  for(const [z,k] of [[-26,'ad0'],[-10,'ad1'],[6,'ad2'],[22,'ad0']])B(9.97,.75,z,10,2.55,z+3.2,k,{nosolid:true});
  for(const z of [-18,-2,14])B(9.97,2.9,z,10,3.7,z+3.2,'signSt',{nosolid:true});
  B(-10,.75,19,-9.97,2.55,22.2,'ad1',{nosolid:true});B(-10,2.9,23,-9.97,3.7,26.2,'signSt',{nosolid:true});B(-10,2.9,-28,-9.97,3.7,-24.8,'signSt',{nosolid:true});
  // ---- the dead train on the west track: two cars joined by a gangway
  trainCar(-25,-5.6,[-23,-19,-15,-11,-7],[-19,-7],[-15],'n','s');
  trainCar(-5,14.4,[-3,1,5,9,13],[5,13],[9],'s','n');
  B(-7.55,-.3,-5.6,-5.85,.05,-5,'trainFl');B(-7.6,.05,-5.6,-7.5,2.25,-5,'tire');B(-5.9,.05,-5.6,-5.8,2.25,-5,'tire');B(-7.6,2.2,-5.6,-5.8,2.3,-5,'tire');
  // ---- tunnels at both ends: mouths in the end walls, a pier between the tracks, dark beyond; rubble and a work cart
  for(const s of [-1,1]){const lo=(a,b)=>Math.min(s*a,s*b),hi=(a,b)=>Math.max(s*a,s*b);
    wallX(-10.6,10.6,lo(28,28.6),hi(28,28.6),-1.1,0,'tunnel',[[-10,-5,-1.1,0],[5,10,-1.1,0]]);wallX(-10.6,10.6,lo(28,28.6),hi(28,28.6),0,5,'tileW',[[-10,-5,0,3.9],[5,10,0,3.9]]);
    B(-10.6,-1.1,lo(28,31.1),-10,3.9,hi(28,31.1),'tunnel',{f:{nx:N}});B(10,-1.1,lo(28,31.1),10.6,3.9,hi(28,31.1),'tunnel',{f:{px:N}});
    B(-5,-1.1,lo(28.6,30.5),5,3.9,hi(28.6,30.5),'tunnel');B(-10.6,3.9,lo(28,31.1),10.6,5,hi(28,31.1),'tunnel',{f:{py:N}});B(-10.6,-1.1,lo(30.5,31.1),10.6,3.9,hi(30.5,31.1),'voidT');
    for(const x of [-9.9,9.8]){B(x,2.35,s*27.45-.15,x+.1,2.7,s*27.45+.15,'lampR',{nosolid:true});LIGHT(x<0?-9.4:9.4,2.5,s*27.3,'#ff3020',4.5,.65)}
    for(const x of [-7.5,7.5])LIGHT(x,3.2,s*30,'#3e4c62',5.5,.45)}
  B(-9.6,-1.1,-30.3,-8.2,-.3,-29.2,'conc');B(-8.4,-1.1,-30.4,-7.6,-.6,-29.8,'conc');B(-9.8,-1.1,-29,-6.6,-.75,-28.7,'metal2');
  B(5.9,-.62,28.9,7.5,-.5,30.2,'plate');for(const [x,z] of [[6.1,29.1],[7.1,29.1],[6.1,29.8],[7.1,29.8]])B(x,-1.02,z,x+.3,-.62,z+.25,'tire');crate(6.7,29.55,.6,-.5,'wood');
  // ---- the platform ceiling: a slab with the void and the two stair openings; it is also the B1 floor
  const holes=[[-4,-6,4,6],[-4,-19,-1,-13],[1,13,4,19]];
  slab(-10.6,-18,10.6,18,5,5.5,'conc',holes,{f:{ny:'ceil',py:'granite2'}});slab(-10.6,-28.6,10.6,-18,5,5.5,'conc',holes,{f:{ny:'ceil',py:N}});slab(-10.6,18,10.6,28.6,5,5.5,'conc',holes,{f:{ny:'ceil',py:N}});
  // ---- the main stairs B2 -> B1, glass along their sides
  stairs('z',-4,-1,-24,-13,0,5.5,22,'granite2',{f:{px:'tileW',nx:'tileW'}});stairs('z',1,4,24,13,0,5.5,22,'granite2',{f:{px:'tileW',nx:'tileW'}});
  for(let k=0;k<11;k++){const yb=k*.5+.25;for(const [a,b] of [[-4,-3.94],[-1.06,-1]])B(a,yb,-24+k,b,yb+1,-23+k,'glass',GL);for(const [a,b] of [[1,1.06],[3.94,4]])B(a,yb,23-k,b,yb+1,24-k,'glass',GL)}
  B(-4,3.4,-25.55,-1,3.9,-25.45,'signExit',{nosolid:true});B(1,3.4,25.45,4,3.9,25.55,'signExit',{nosolid:true});
  for(const z of [-12.5,12.5]){B(-1.6,3.7,z-.05,1.6,4.5,z+.05,'signSt',{nosolid:true});for(const x of [-1.2,1.16])B(x,4.5,z-.02,x+.04,5,z+.02,'metal2',{nosolid:true})}
  // ---- platform lights: two rows of tubes (some dead, one flickering), wall lights over the tracks
  for(const x of [-2.5,2.5])for(let z=-24;z<=24;z+=4){if(Math.abs(z)<=4)continue;if(x<0&&z===-16||x>0&&z===16)continue;
    const dead=x<0&&(z===12||z===24)||x>0&&z===-20,flick=x>0&&z===8;B(x-.12,4.86,z-1,x+.12,5,z+1,dead?'lampOff':'lampW',{nosolid:true});if(!dead)LIGHT(x,4.62,z,'#e2ebff',8,flick?.35:.78)}
  MAP.dyn.push([2.5,4.6,8,'#e2ebff',7,.55,.75]);
  for(const x of [-9.95,9.85])for(let z=-24;z<=24;z+=8){B(x,4.2,z-.4,x+.1,4.32,z+.4,'lampW',{nosolid:true});LIGHT(x<0?-9.5:9.5,4,z,'#cfdcff',7,.5)}
  // ================= B1: concourse (floor 5.5, ceiling 10) =================
  wallX(-10.6,10.6,-19,-18,5.5,10,'tileW',[],{f:{nz:N}});wallX(-10.6,10.6,18,19,5.5,10,'tileW',[],{f:{pz:N}});
  wallZ(-10.6,-10,-18,18,5.5,10,'tileW',[[-8,-6,5.5,7.8],[-4,0,6.6,8.2]],{f:{nx:'plaster'}});wallZ(10,10.6,-18,18,5.5,10,'tileW',[[-2,6,5.5,8.6]]);
  B(-10.6,10,-19,10.6,10.6,19,'conc',{f:{ny:'ceil',py:N}});
  for(const [z0,z1] of [[-18,-8],[-6,-4],[0,18]])B(-10,6.9,z0,-9.98,7.2,z1,'tileB',{nosolid:true});for(const [z0,z1] of [[-18,-2],[6,18]])B(9.98,6.9,z0,10,7.2,z1,'tileB',{nosolid:true});
  B(-10,6.9,-18,10,7.2,-17.98,'tileB',{nosolid:true});B(-10,6.9,17.98,10,7.2,18,'tileB',{nosolid:true});
  const rail=(x0,z0,x1,z1)=>{B(x0,5.5,z0,x1,6.5,z1,'glass',GL);B(x0-.02,6.5,z0-.02,x1+.02,6.58,z1+.02,'metal2')};
  rail(-4,-6.06,4,-6);rail(-4,6,4,6.06);rail(-4.06,-6,-4,6);rail(4,-6,4.06,6);rail(-4.06,-18,-4,-13);rail(-1,-18,-.94,-13);rail(.94,13,1,18);rail(4,13,4.06,18);
  // information booth, vending machines, benches, a collapsed corner, a sandbagged checkpoint at the ticket hall
  B(5,5.5,-18,10,8.4,-14.5,'plaster',{f:{pz:'tileW',py:N}});B(5.4,6.5,-14.5,9.6,7.9,-14.47,'winLit',{nosolid:true});B(5.4,8,-14.5,9.6,8.36,-14.47,'signInfo',{nosolid:true});B(5,5.5,-14.5,10,6.5,-14.2,'metal2');
  B(-10,5.5,2,-9.3,7.35,3.1,'metal2',{f:{px:'vend'}});B(-10,5.5,3.2,-9.3,7.35,4.3,'metal2',{f:{px:'vend'}});
  B(-9.7,5.5,9,-9.1,5.95,12,'metal2',{f:{py:'wood'}});B(9.1,5.5,9,9.7,5.95,12,'metal2',{f:{py:'wood'}});
  B(-9.6,5.5,14,-7,6.25,17.6,'conc');B(-8.8,6.25,14.8,-7.6,6.85,16.8,'conc');B(-7,5.5,13.4,-5,5.62,15.6,'ceil');crate(-6.4,16.9,.9,5.5);
  B(6.4,5.5,-1.4,7,6.55,1.4,'sandbag');B(7.6,5.5,3.2,8.2,6.35,5.8,'barrier');
  B(-9.2,6.5,-18,-5.6,8.3,-17.97,'ad1',{nosolid:true});B(-9.2,6.5,17.97,-5.6,8.3,18,'ad2',{nosolid:true});B(5.6,6.5,17.97,9.2,8.3,18,'ad0',{nosolid:true});
  B(-4,8.6,-12.55,-1,9.1,-12.45,'signDir',{nosolid:true});B(1,8.6,12.45,4,9.1,12.55,'signDir',{nosolid:true});B(9.97,8.7,0,10,9.2,4,'signExit',{nosolid:true});B(-10,7.9,-8.2,-9.97,8.3,-5.8,'signOffice',{nosolid:true});
  for(const x of [-7,7])for(const z of [-15,-9,-3,3,9,15]){const dead=x>0&&z===9,flick=x<0&&z===-9;B(x-.8,9.94,z-.3,x+.8,10,z+.3,dead?'lampOff':'lampW',{nosolid:true});if(!dead)LIGHT(x,9.6,z,'#eef3ff',10,flick?.4:.82)}
  for(const z of [-3,3]){B(-.8,9.94,z-.3,.8,10,z+.3,'lampW',{nosolid:true});LIGHT(0,9.6,z,'#eef3ff',11,.85)}
  MAP.dyn.push([-7,9.5,-9,'#eef3ff',8,.5,.6]);
  // ================= B1: ticket hall (east): paid side, gate line, unpaid side with ticket machines, a shuttered shop and exit 1 =================
  slab(10.6,-10.6,26.6,10.6,-1.1,5.5,'tileW',[[10.6,-10.6,14,-2]],{f:{py:'granite2',ny:N}});
  wallX(10.6,26.6,-10.6,-10,5.5,9.5,'tileW',[],{f:{nz:N}});wallX(10.6,26.6,10,10.6,5.5,9.5,'tileW',[],{f:{pz:N}});wallZ(26,26.6,-10,10,5.5,9.5,'tileW',[[-4,0,5.5,8.6]],{f:{px:N}});
  B(10.6,9.5,-10.6,26.6,10.1,10.6,'conc',{f:{ny:'ceil',py:N}});
  rail(14,-10,14.06,-2);
  for(let k=-9;k<=9;k+=2)B(17,5.5,k-.2,18.4,6.55,k+.2,'gate',{f:{py:'metal2'}});
  for(let i=0;i<4;i++){const x=19+i*1.15;B(x,5.5,-10,x+1.05,7.3,-9.35,'metal2',{f:{pz:'tmach'}})}
  B(21.6,5.5,5.5,26,8.6,10,'shutter',{f:{py:N}});B(21.55,8.05,6,21.58,8.5,9.6,'signMart',{nosolid:true});
  stairs('x',-4,0,26,29,5.5,7.5,6,'granite2',{f:{pz:'tileW',nz:'tileW'}});B(29,5.5,-4,29.6,7.5,0,'granite2');
  B(26,5.5,-4.6,29.6,10,-4,'tileW',{f:{nz:N}});B(26,5.5,0,29.6,10,.6,'tileW',{f:{pz:N}});B(26,10,-4.6,30.2,10.6,.6,'conc',{f:{ny:'ceil',py:N}});B(29.6,5.5,-4.6,30.2,10,.6,'shutter',{f:{px:N}});
  B(25.96,8.7,-4,26,9.2,0,'signExit',{nosolid:true});B(27.4,9.94,-2.3,28.2,10,-1.7,'lampR',{nosolid:true});LIGHT(27.8,9.6,-2,'#ff6a4a',6,.55);
  B(11.6,6.4,9.97,16.4,8.4,10,'routeMap',{nosolid:true});B(10.8,6.8,-10,13.8,8.5,-9.97,'ad2',{nosolid:true});
  for(const x of [13,19,24])for(const z of [-5,5]){const dead=x===24&&z===-5;B(x-.8,9.44,z-.3,x+.8,9.5,z+.3,dead?'lampOff':'lampW',{nosolid:true});if(!dead)LIGHT(x,9.15,z,'#fff2dc',9,.8)}
  // ================= B1: station office (west) =================
  slab(-20.6,-10.6,-10.6,10.6,-1.1,5.5,'tileW',[[-14,2,-10.6,10.6]],{f:{py:'tile',ny:N}});
  wallZ(-20.6,-20,-10.6,10.6,5.5,9,'plaster',[],{f:{nx:N}});wallX(-20.6,-10.6,-10.6,-10,5.5,9,'plaster',[],{f:{nz:N}});wallX(-20.6,-10.6,10,10.6,5.5,9,'plaster',[],{f:{pz:N}});
  B(-20.6,9,-10.6,-10.6,9.6,10.6,'conc',{f:{ny:'plaster',py:N}});rail(-14.06,2,-14,10);B(-10.33,6.6,-4,-10.27,8.2,0,'glass',GL);
  for(let r=0;r<2;r++)for(let k=0;k<3;k++)monitor(-20,6.4+r*.72,-6.4+k*1.0,-19.92,7.02+r*.72,-5.5+k*1.0,'px');
  B(-19.9,5.5,-6.8,-18.9,6.28,-3.2,'wood');LIGHT(-18.8,6.9,-5,'#7aff9a',3.5,.45);
  for(let i=0;i<5;i++){const x=-19.6+i*.82;B(x,5.5,-10,x+.8,7.4,-9.45,'metal2',{f:{pz:'door'}})}
  B(-17.6,5.5,-1.6,-15.6,6.28,.4,'wood');B(-17.2,5.5,.6,-16.7,6,1.1,'metal2');B(-19.7,5.5,3,-19,5.95,6.4,'seat');B(-20,5.5,3,-19.7,6.45,6.4,'seat');B(-15.8,5.5,8.4,-14.8,6.9,9.9,'metal2');
  for(const [x,z] of [[-16.5,-6],[-16.5,0],[-17,6]]){B(x-.7,8.94,z-.25,x+.7,9,z+.25,'lampW',{nosolid:true});LIGHT(x,8.6,z,'#e8f0ff',8,z===0?.35:.7)}
  MAP.dyn.push([-16.5,8.55,0,'#e8f0ff',7,.5,.65]);
  // ================= emergency stairwells: track level -> B1 =================
  B(-14,-2.1,16,-10.6,-1.1,18,'conc',{ground:1});stairs('z',-14,-10.6,16,2,-1.1,5.5,22,'conc',{f:{px:'tileW',nx:'tileW'}});
  B(-14.6,-1.1,10,-14,5.5,18.6,'tileW',{f:{nx:N}});B(-14,-1.1,18,-10.6,5.5,18.6,'tileW',{f:{pz:N}});B(-14.6,4.2,10,-10.6,5.5,18.6,'conc',{f:{py:N}});
  B(-12.9,4.12,13.8,-11.7,4.2,14.2,'lampW',{nosolid:true});LIGHT(-12.3,3.7,14,'#d8e4ff',6.5,.55);
  B(10.6,-2.1,-18,14,-1.1,-16,'conc',{ground:1});stairs('z',10.6,14,-16,-2,-1.1,5.5,22,'conc',{f:{px:'tileW',nx:'tileW'}});
  B(14,-1.1,-18.6,14.6,5.5,-10,'tileW',{f:{px:N}});B(10.6,-1.1,-18.6,14,5.5,-18,'tileW',{f:{nz:N}});B(10.6,4.2,-18.6,14.6,5.5,-10,'conc',{f:{py:N}});
  B(11.7,4.12,-14.2,12.9,4.2,-13.8,'lampW',{nosolid:true});LIGHT(12.3,3.7,-14,'#d8e4ff',6.5,.55);
  // ================= spawns, camps, title camera =================
  MAP.spawns=[];
  for(const [x,z] of [[-7,-11],[-7,-8],[-7,-1],[-7,6],[-6.5,10],[7,-11],[7,-8],[8,-3],[8,8],[7,11],[-2,-10],[2,-10],[-2,10],[2,10]])MAP.spawns.push([x+rr(-.4,.4),z+rr(-.4,.4),5.5,Math.atan2(x,z)]);
  for(const [x,z] of [[15.5,-1],[15.5,2],[15.5,5],[12.5,2],[12.5,6],[15.5,8]])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.3,.3),5.5,Math.PI/2]);
  MAP.zspawns=[[-6,-29.6,-1.1],[7.5,-29.4,-1.1],[-7.5,29.4,-1.1],[8.8,29.6,-1.1],[-17,-7,5.5],[22,0,5.5],[0,-25,0],[0,25,0],[8.5,-22,-1.1]];
  MAP.camps=[
    {k:'gate',w:.14,p:[[15.6,5.5,-1],[15.6,5.5,3],[15.6,5.5,7]],look:[22,6.5,1]},
    {k:'exit',w:.1,p:[[29.3,7.5,-2.5],[29.3,7.5,-1.5]],look:[21,6.5,-2]},
    {k:'balc',w:.12,p:[[-5,5.5,-7],[5,5.5,-7],[-5,5.5,7],[5,5.5,7]],look:[0,0,0]},
    {k:'train',w:.16,p:[[-6.6,.05,-17],[-6.6,.05,-13],[-6.6,.05,1],[-6.6,.05,7]],look:[-5,1,-7]},
    {k:'office',w:.14,p:[[-17,5.5,-8],[-18.5,5.5,-1],[-16,5.5,-3]],look:[-11,6.5,-7]},
    {k:'platN',w:.07,p:[[2.6,0,-25.2],[-1.8,0,-25.4]],look:[0,1,-12]},
    {k:'platS',w:.07,p:[[-2.6,0,25.2],[1.8,0,25.4]],look:[0,1,12]},
  ];
  MAP.spawnYaw=null;
  // title backdrop: drift along the platform looking across at the dead train
  MAP.cam=(t,cam)=>{const u=t*.035,z=11*Math.sin(u);cam.position.set(2.4,1.9+.12*Math.sin(t*.4),z);cam.lookAt(-6,1.3,z+7*Math.cos(u))};
}
MAPDEFS.sub={n:['새벽역','Saebyeok Station'],d:['버려진 지하철역. 섬식 승강장과 멈춘 전동차, 대합실·개찰구·역무실 — 좀비는 양쪽 터널에서 몰려온다.','An abandoned subway station: an island platform with a dead train, the concourse, ticket gates and the station office — zombies pour in from both tunnels.'],
  env:{sky:0,rain:0,storm:0,under:1,fog:'#0b0d0d',fogD:.042,ambIn:'#141820',boAmb:.4},probeY:[0,1.1,2.5,4,6.6,8],tex:bakeSubTex,build:buildSubway};

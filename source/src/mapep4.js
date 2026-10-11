'use strict';
// ============ Chapter 4 map "운무봉 통신기지" (Unmubong signal station): four zones played in order, climbing the mountain ============
// A  the checkpoint at the foot of the mountain   x -72..-30  z 10..48   y 0   → the road's barrier gate (gate gA)
// B  the mountain road and its bunkers            x -30..46   z 12..48   the lower road climbs east (y 0 → 3), the hairpin with the
//    supply depot, the upper road climbs back west (y 3 → 6) through a rock tunnel → the radar compound's gate (gate gB)
// C  the radar dome compound                      x -30..34   z -14..12  y 6   → the summit gate in its north wall (gate gC) and the
//    stair up the last rock step
// D  the summit antenna yard                      x -22..38   z -60..-22 y 10  the alarm-siren tower in the middle (two more east and
//    west), lattice masts, a helipad, the two-storey comms building, the generator shed, the cliff over a sea of cloud (north, west)
// The blue hour just before dawn, wrapped in cloud: lyrebird.js thickens the fog zone by zone (15 m in the summit yard); only the red
// lamps on the masts and domes show through it (sprites that are not fogged).
Object.assign(MATS,{
  e4rock:{t:'e4rock',s:3,k:'stone'},e4moss:{t:'e4moss',s:3,k:'soft'},e4grass:{t:'e4grass',s:3,k:'soft'},e4dirt:{t:'e4dirt',s:2.5,k:'soft'},e4road:{t:'e4road',s:4,k:'stone'},
  e4pad:{t:'e4pad',s:4,k:'stone'},e4conc:{t:'e4conc',s:2.5,k:'stone'},e4paint:{t:'e4paint',s:3,k:'stone'},e4roof:{t:'e4roof',s:2,k:'metal'},e4lat:{t:'e4lat',s:3,k:'metal'},
  e4pine:{t:'e4pine',s:2,k:'soft'},e4bark:{t:'e4bark',s:1,k:'wood'},e4guard:{t:'e4guard',s:2,k:'metal'},e4fence:{t:'e4fence',s:2,k:'metal'},e4heli:{t:'e4heli',uv:'box',k:'stone'},
  e4board:{t:'e4board',uv:'box',emis:.08,k:'wood'},e4bus:{t:'e4bus',uv:'box',emis:.2,k:'metal'},e4relay:{t:'e4relay',uv:'box',emis:.35,k:'metal'},e4siren:{t:'e4siren',uv:'box',emis:.3,k:'metal'},
  e4win:{t:'e4win',uv:'box',emis:.12,k:'glass'},e4winL:{t:'e4winL',uv:'box',emis:.7,k:'glass'},e4door:{t:'e4door',uv:'box',k:'metal'},e4mil:{t:'e4mil',s:2,k:'metal'},e4milD:{t:'e4milD',s:2,k:'metal'},
  e4tarp:{t:'e4tarp',s:2,k:'soft'},e4horn:{t:'e4horn',uv:'box',k:'metal'},e4cons:{t:'e4cons',uv:'box',emis:.5,k:'metal'},e4tankW:{t:'e4tankW',uv:'boxV',s:8,k:'metal'},
  e4sBase:{t:'e4sBase',uv:'box',emis:.3,k:'metal'},e4sStop:{t:'e4sStop',uv:'box',emis:.3,k:'metal'},e4sRelay:{t:'e4sRelay',uv:'box',emis:.25,k:'metal'},e4sRadar:{t:'e4sRadar',uv:'box',emis:.25,k:'metal'},
  e4sMess:{t:'e4sMess',uv:'box',emis:.25,k:'metal'},e4sBar:{t:'e4sBar',uv:'box',emis:.25,k:'metal'},e4sSiren:{t:'e4sSiren',uv:'box',emis:.3,k:'metal'},e4sCliff:{t:'e4sCliff',uv:'box',emis:.3,k:'metal'},
  e4sComm:{t:'e4sComm',uv:'box',emis:.25,k:'metal'},e4sHeli:{t:'e4sHeli',uv:'box',emis:.25,k:'metal'},e4sDepot:{t:'e4sDepot',uv:'box',emis:.25,k:'metal'},
});
// ---------- textures (painted on first load) ----------
// granite, dark and wet: blue-grey grains, lichen in pale green rosettes, rain darkening it in streaks, a crack or two
function texE4Rock(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const g=hash2(x>>1,y>>1,4011);let t=P.n(x,y,34,4012,4)*.9+g*.22-.08;let c=dith(P,x,y,t,['#22262a','#2a2f34','#33393e','#3c4248','#464c52','#50565c'],.13);
    const l=P.n(x,y,12,4013,3);if(l>.66)c=mix(c,'#6a7a62',clamp((l-.66)*2.6,0,.8));if(g>.97)c=lt(c,.18);P.set(x,y,c)}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,4014)*N),Math.floor(hash2(i,2,4014)*N*.5),40+Math.floor(hash2(i,3,4014)*140),.16,2);
  for(let i=0;i<5;i++)crack(P,Math.floor(hash2(i,1,4015)*N),Math.floor(hash2(i,2,4015)*N),70,4016+i,'#121416',null)})}
// moss and dewy turf on top of the rocks
function texE4Moss(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,16,4021,3)*.85+(hash2(x,y,4022)-.5)*.25;let c=dith(P,x,y,t,['#1e2a1e','#26341f','#2e3e24','#384a2a','#425430'],.14);
    if(hash2(x,y,4023)<.012)c='#9aaab0';P.set(x,y,c)}})}
// mountain grass: blue-green tufts, dark soil between, a few pine needles
function texE4Grass(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tuft=P.n(x,y,6,4031,2),t=P.n(x,y,28,4032,3)*.6+tuft*.5;let c=dith(P,x,y,t,['#1a2218','#222c1e','#2a3624','#32402a','#3c4a30','#465436'],.16);
    if(tuft<.32)c=mix(c,'#2a2218',.6);if(hash2(x,y,4033)<.01)c='#5a4a30';if(hash2(x,y,4034)<.006)c='#a8b8c0';P.set(x,y,c)}})}
// forest soil: dark, wet, needles and roots
function texE4Dirt(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,22,4041,4)*.9+(hash2(x,y,4042)-.5)*.2;let c=dith(P,x,y,t,['#1a1612','#221c16','#2a231b','#332a20','#3c3226'],.14);
    const nd=Math.abs(Math.sin((x*.7+y*.3)*.5+P.n(x,y,9,4043,2)*9));if(nd>.97&&hash2(x>>2,y>>2,4044)<.4)c='#5a4228';P.set(x,y,c)}})}
// the mountain road: worn asphalt, a faded yellow centre line along u, patched cracks, puddles shining
function texE4Road(){const N=TN*2;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,4051,3)*.9+(hash2(x,y,4052)-.5)*.12;let c=dith(P,x,y,t,['#1c1e20','#222426','#282a2c','#2e3032','#343638'],.12);
    if(Math.abs(y-N/2)<6&&(x%192)<120){const f=P.n(x,y,10,4053,2);c=mix(c,'#a88a30',clamp(.35+f*.6,0,.85))}
    const w=P.n(x,y,34,4054,3);if(w>.7)c=mix(c,'#4a5664',clamp((w-.7)*2.4,0,.5));P.set(x,y,c)}
  for(let i=0;i<10;i++)crack(P,Math.floor(hash2(i,1,4055)*N),Math.floor(hash2(i,2,4055)*N),70,4056+i,'#0e0f10',null)})}
// the summit yard: poured concrete in 4 m bays, joints, drains, lichen
function texE4Pad(){const N=TN*2;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,60,4061,4)*1.05-.05+(hash2(x,y,4062)-.5)*.07;let c=dith(P,x,y,t,['#3a3e40','#424648','#4a4e50','#525658','#5a5e60'],.1);
    if(x%256<3||y%256<3)c='#24282a';const l=P.n(x,y,14,4063,3);if(l>.7)c=mix(c,'#5a6a52',clamp((l-.7)*2,0,.55));P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,4064)*N,hash2(i,2,4064)*N,10+hash2(i,3,4064)*26,8+hash2(i,4,4064)*18,.3,4065+i)})}
// bunker concrete: board-formed, water-stained, moss creeping up from the foot
function texE4Conc(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,44,4071,4)*1.05-.05+(hash2(x,y,4072)-.5)*.07;const brd=Math.floor(y/32);t+=(hash2(brd,3,4073)-.5)*.08;
    let c=dith(P,x,y,t,['#44484a','#4c5052','#55595a','#5e6262','#676b6a'],.1);if(y%32<1)c=dk(c,.18);
    if(y>N-40){const m=P.n(x,y,10,4074,2);if(m>.45)c=mix(c,'#33452a',clamp((m-.45)*2,0,.75))}P.set(x,y,c)}
  for(let i=0;i<18;i++)streak(P,Math.floor(hash2(i,1,4075)*N),2,50+Math.floor(hash2(i,2,4075)*170),.13,2)})}
// a painted building: pale military green over render, a dark skirting, flaking
function texE4Paint(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#6e7a6c','#5e6a5c',clamp(P.n(x,y,40,4081,3)*1.1-.05,0,1));if(y>N-34)c=mix('#3e4440','#343a36',P.n(x,y,20,4082,2));
    const f=P.n(x,y,12,4083,3);if(f>.7&&y<N-34)c=mix(c,'#8a8a80',clamp((f-.7)*3,0,.7));if(hash2(x,y,4084)<.02)c=dk(c,.12);P.set(x,y,c)}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,4085)*N),2,40+Math.floor(hash2(i,2,4085)*150),.12,1)})}
// corrugated roofing: dark green paint, ribs, rust from the fixings
function texE4Roof(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*14);let c=mix('#3a4a3a','#2a3a2c',clamp(.5+r*.35+(P.n(x,y,30,4091,3)-.5)*.5,0,1));
    const rs=P.n(x,y,14,4092,3);if(rs>.66)c=mix(c,'#6a4224',clamp((rs-.66)*3,0,.75));if(y%128<2)c=dk(c,.3);P.set(x,y,c)}})}
// the radomes: off-white triangular panels with dark seams and a little grime running down
function texE4Dome(){const W=512,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=x/32,v=y/28,iv=Math.floor(v),fu=u+(iv%2)*.5,fv=v-iv,cu=fu-Math.floor(fu);const tri=cu<fv*.5||cu>1-fv*.5;
    let c=mix('#c8ccc8','#aeb2ae',clamp(P.n(x,y,40,4101,3)+(hash2(Math.floor(fu*2+tri),iv,4102)-.5)*.3,0,1));
    const seam=Math.abs(cu-fv*.5)<.03||Math.abs(cu-(1-fv*.5))<.03||fv<.035;if(seam)c='#6a706c';P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,4103)*W),Math.floor(hash2(i,2,4103)*H*.6),30+Math.floor(hash2(i,3,4103)*80),.14,2)})}
// a lattice mast's face: two legs, horizontal rungs, an X-brace per 3 m; red and white bands; holes cut out (alpha)
function texE4Lat(){const N=TN;return paint(N,N,P=>{const band=y=>Math.floor(y/(N/2))%2?'#c8c4bc':'#a82a1e';
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N,v=y/N,leg=u<.06||u>.94,rung=v<.04||v>.96,d1=Math.abs(u-v)<.035,d2=Math.abs(u-(1-v))<.035;
    if(leg||rung||d1||d2){let c=band(y);if(hash2(x,y,4111)<.08)c=dk(c,.2);P.set(x,y,c)}else{P.set(x,y,'#000000');P.alpha(x,y,0)}}})}
// pine boughs: needle clusters in dark blue-green, a lighter tip here and there; bark
function texE4Pine(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,8,4121,3),s=Math.abs(Math.sin((x+y*.6)*.9+P.n(x,y,5,4122,2)*6));let t=.35+(n-.5)*.7+s*.18;
    let c=dith(P,x,y,t,['#0e1612','#141e18','#1a261e','#223024','#2a3a2c'],.16);if(hash2(x,y,4123)<.008)c='#4a6048';P.set(x,y,c)}})}
function texE4Bark(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.45+Math.sin(x*.7+P.n(x,y,8,4131,2)*5)*.15+(hash2(x,y,4132)-.5)*.15;P.set(x,y,dith(P,x,y,t,['#1e1612','#2a2018','#362a1e','#423424'],.1))}})}
// a W-beam guardrail: galvanised, a dark groove, an amber reflector every 4 m
function texE4Guard(){const W=256,H=64;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#8a9090','#6a7070',P.n(x,y,24,4141,2));if(Math.abs(y-H/2)<6)c='#4a5050';if(y<4||y>H-5)c='#5a6060';
    const rs=P.n(x,y,10,4142,2);if(rs>.7)c=mix(c,'#6a4a30',.5);if(x%128>58&&x%128<70&&Math.abs(y-H/2)<9)c='#e8a020';P.set(x,y,c)}})}
// chain-link: a galvanised diamond mesh, holes cut out (alpha), rust on the wires
function texE4Fence(){const N=128;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const a=((x+y)%16+16)%16,b=((x-y)%16+16)%16;if(a<2||b<2){let c=hash2(x,y,4151)<.2?'#6a4a30':'#7a8484';P.set(x,y,c)}else{P.set(x,y,'#000000');P.alpha(x,y,0)}}})}
// the helipad: a white H in a circle on the concrete
function texE4Heli(){const N=512;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,4161,3)+(hash2(x,y,4162)-.5)*.08;P.set(x,y,dith(P,x,y,t,['#34383a','#3c4042','#44484a','#4c5052'],.1))}
  P.post=ctx=>{ctx.strokeStyle='rgba(210,210,200,.85)';ctx.lineWidth=20;ctx.beginPath();ctx.arc(N/2,N/2,N*.4,0,TAU);ctx.stroke();ctx.fillStyle='rgba(210,210,200,.88)';
    ctx.fillRect(N*.32,N*.25,N*.08,N*.5);ctx.fillRect(N*.6,N*.25,N*.08,N*.5);ctx.fillRect(N*.32,N*.46,N*.36,N*.08)}})}
// the trail board at the foot: a hand-painted map of the mountain, the trails in red, the station on the summit
function texE4Board(){const W=256,H=176;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#c8bc98','#b4a884',P.n(x,y,20,4171,2));if(x<7||y<7||x>=W-7||y>=H-7)c='#4a3622';P.set(x,y,c)}
  P.rect(16,30,150,130,'#7a9a6a');
  P.post=ctx=>{ctx.strokeStyle='rgba(60,80,50,.7)';ctx.lineWidth=2;for(let i=0;i<7;i++){ctx.beginPath();ctx.ellipse(92,96,70-i*9,56-i*7,0,0,TAU);ctx.stroke()}
    ctx.strokeStyle='#c02010';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(26,150);ctx.lineTo(70,128);ctx.lineTo(120,118);ctx.lineTo(80,96);ctx.lineTo(92,70);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#1a1a1a';ctx.fillRect(86,62,12,10);ctx.font='bold 15px sans-serif';ctx.fillText('운무봉 등산로 안내',16,24);ctx.font='11px sans-serif';ctx.fillText('정상 · 통신기지 (출입통제)',172,48);ctx.fillText('해발 1,184 m',172,64);
    ctx.fillText('현 위치 ●',172,150);ctx.fillStyle='#d83020';ctx.beginPath();ctx.arc(26,150,5,0,TAU);ctx.fill()}})}
// the bus stop: the route plate and the timetable
function texE4Bus(){const W=128,H=192;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y<60?'#1e5a9a':'#e8e8e0';if(x<4||x>=W-4||y<4||y>=H-4)c='#2a2e30';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ffffff';ctx.font='bold 20px sans-serif';ctx.fillText('운무봉 입구',12,30);ctx.font='bold 12px sans-serif';ctx.fillText('UNMUBONG',30,50);
    ctx.fillStyle='#2a2a2a';ctx.font='11px monospace';for(let i=0;i<7;i++)ctx.fillText(`${String(6+i*2).padStart(2,'0')}:${i%2?'40':'10'}  ↔ 읍내`,12,82+i*15);ctx.fillStyle='#c02010';ctx.fillText('운행 중단',12,186)}})}
// a relay's control box: grey steel, a row of lamps, a big lever, the stencil
function texE4Relay(){const W=128,H=160;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#6a7074','#5a6064',P.n(x,y,20,4181,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#2a2e30';P.set(x,y,c)}
  P.post=ctx=>{for(let i=0;i<5;i++){ctx.fillStyle=i<2?'#30d040':i<4?'#e8a020':'#ff3020';ctx.beginPath();ctx.arc(22+i*20,26,6,0,TAU);ctx.fill()}
    ctx.fillStyle='#141414';ctx.fillRect(54,50,20,60);ctx.fillStyle='#d83020';ctx.fillRect(48,46,32,12);ctx.font='bold 13px sans-serif';ctx.fillText('중계기 재가동',20,132);ctx.font='bold 10px sans-serif';ctx.fillText('RELAY · 무단 조작 금지',14,148)}})}
// the alarm siren's box: yellow and black, a red mushroom button, SIREN
function texE4Siren(){const W=128,H=160;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#d0a818','#a88412',P.n(x,y,24,4191,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#2a2a2a';if(y>H-26)c=((Math.floor((x+y)/10))%2)?'#d0a818':'#1a1a1a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(64,58,30,0,TAU);ctx.fill();ctx.fillStyle='#e02818';ctx.beginPath();ctx.arc(64,58,24,0,TAU);ctx.fill();ctx.fillStyle='#ff7a6a';ctx.beginPath();ctx.arc(56,50,7,0,TAU);ctx.fill();
    ctx.fillStyle='#141414';ctx.font='bold 15px sans-serif';ctx.fillText('경보 사이렌',20,112);ctx.font='bold 11px sans-serif';ctx.fillText('ALARM SIREN',24,126)}})}
// windows: dark glass in a frame; the lit ones a dim amber
function texE4Win(lit){const W=128,H=96;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=lit?mix('#c89a50','#8a6a34',P.n(x,y,20,4201,2)):mix('#1a2028','#2a3240',clamp(1-y/H+P.n(x,y,30,4202,2)*.3,0,1));
    if(x<6||x>=W-6||y<6||y>=H-6||Math.abs(x-W/2)<3)c='#3a4038';if(!lit&&Math.abs(x-y*1.2-10)<3)c='#4a5664';P.set(x,y,c)}})}
// a steel door: olive, a stencilled number, a push bar
function texE4Door(){const W=96,H=192;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5440','#3a4432',P.n(x,y,20,4211,2));if(x<5||x>=W-5||y<5)c='#262a22';if(y>96&&y<104&&x>14&&x<W-14)c='#9a9a90';if(hash2(x,y,4212)<.03)c=dk(c,.2);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(220,210,170,.8)';ctx.font='bold 16px monospace';ctx.fillText('B-04',26,40)}})}
// the siren horns' mouths
function texE4Horn(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-N/2,y-N/2)/(N/2);let c=r<.55?'#141414':r<.8?'#5a5e5e':'#8a8e8a';if(r>.95)c='#3a3e3e';P.set(x,y,c)}})}
// the radar room's consoles: green scope sweep, amber readouts
function texE4Cons(){const W=192,H=96;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c='#22262a';if(x<5||y<5||x>=W-5||y>=H-5)c='#141618';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#062a12';ctx.beginPath();ctx.arc(48,48,34,0,TAU);ctx.fill();ctx.strokeStyle='#3aff8a';ctx.lineWidth=1;for(let r=10;r<34;r+=8){ctx.beginPath();ctx.arc(48,48,r,0,TAU);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(48,48);ctx.lineTo(72,24);ctx.stroke();ctx.fillStyle='#ffb040';ctx.font='10px monospace';ctx.fillText('CH 05 ▒▒▒',96,26);ctx.fillText('SIG -- LOST',96,44);ctx.fillText('RT1-05 ?',96,62);ctx.fillStyle='#ff4a3a';ctx.fillText('● REC',96,80)}})}
// the sky at the blue hour: deep navy overhead, steel blue lower down, a thin band of dawn on the eastern horizon
function texE4Sky(){const W=512,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H,e=Math.max(0,Math.cos((x/W)*TAU-.6));let c=v<.45?mix('#0a1428','#1c3050',v/.45):mix('#1c3050','#46607a',(v-.45)/.55);
    if(v>.82)c=mix(c,'#a87a6a',clamp((v-.82)*5,0,1)*e*.75);const cl=P.n(x,y*2.2,60,4221,4);if(cl>.58)c=mix(c,'#5a6a82',clamp((cl-.58)*1.6,0,.55));P.set(x,y,c)}})}
// the sea of cloud below the cliff: soft billows, lit faintly from the east
function texE4Cloud(){const N=TN*2;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,90,4231,5)*.8+P.n(x,y,26,4232,3)*.3;let c=mix('#3a4a62','#a8b4c4',clamp(t*1.25-.2,0,1));P.set(x,y,c)}})}
function bakeEp4Tex(){if(TEX.e4rock)return;
  TEX.e4rock=mkTex(texE4Rock());TEX.e4moss=mkTex(texE4Moss());TEX.e4grass=mkTex(texE4Grass());TEX.e4dirt=mkTex(texE4Dirt());TEX.e4road=mkTex(texE4Road());TEX.e4pad=mkTex(texE4Pad());
  TEX.e4conc=mkTex(texE4Conc());TEX.e4paint=mkTex(texE4Paint());TEX.e4roof=mkTex(texE4Roof());TEX.e4dome=mkTex(texE4Dome());TEX.e4lat=mkTex(texE4Lat());TEX.e4pine=mkTex(texE4Pine());TEX.e4bark=mkTex(texE4Bark());
  TEX.e4guard=mkTex(texE4Guard());TEX.e4fence=mkTex(texE4Fence());TEX.e4heli=mkTex(texE4Heli(),false);TEX.e4board=mkTex(texE4Board(),false);TEX.e4bus=mkTex(texE4Bus(),false);TEX.e4relay=mkTex(texE4Relay(),false);
  TEX.e4siren=mkTex(texE4Siren(),false);TEX.e4win=mkTex(texE4Win(false),false);TEX.e4winL=mkTex(texE4Win(true),false);TEX.e4door=mkTex(texE4Door(),false);TEX.e4horn=mkTex(texE4Horn(),false);TEX.e4cons=mkTex(texE4Cons(),false);
  TEX.e4mil=mkTex(texCarPaint('#46503a',0));TEX.e4milD=mkTex(texCarPaint('#343c2c',0));TEX.e4tarp=mkTex(texCanvas('#3e4a34',801));TEX.e4tankW=mkTex(texCarPaint('#5a6a5a',0));TEX.e4sky=mkTex(texE4Sky(),false);TEX.e4cloud=mkTex(texE4Cloud());
  TEX.e4sBase=mkTex(texSign([{t:'운무봉 통신기지 · 출입 통제'},{t:'UNMUBONG SIGNAL STATION · RESTRICTED',s:7}],'#2a3228','#e8e4c8',200,40),false);
  TEX.e4sStop=mkTex(texSign([{t:'검문소 · 정지'},{t:'CHECKPOINT · STOP',s:8}],'#b82018','#ffffff',112,30),false);
  TEX.e4sRelay=mkTex(texSign([{t:'제3 중계소'},{t:'RELAY SITE 3',s:8}],'#2a3228','#e8e4c8',96,26),false);
  TEX.e4sRadar=mkTex(texSign([{t:'레이더 운용동'},{t:'RADAR OPERATIONS',s:7}],'#2a3228','#e8e4c8',112,28),false);
  TEX.e4sMess=mkTex(texSign([{t:'식당'},{t:'MESS HALL',s:8}],'#2a3228','#e8e4c8',80,26),false);
  TEX.e4sBar=mkTex(texSign([{t:'막사'},{t:'BARRACKS',s:8}],'#2a3228','#e8e4c8',80,26),false);
  TEX.e4sSiren=mkTex(texSign([{t:'경보 사이렌 · 소음 주의'},{t:'ALARM SIREN · HEARING HAZARD',s:6}],'#c8a020','#141414',128,30),false);
  TEX.e4sCliff=mkTex(texSign([{t:'추락 위험 · 절벽'},{t:'DANGER · CLIFF EDGE',s:8}],'#b82018','#ffffff',112,30),false);
  TEX.e4sComm=mkTex(texSign([{t:'통신동'},{t:'SIGNALS BLOCK',s:8}],'#2a3228','#e8e4c8',96,26),false);
  TEX.e4sHeli=mkTex(texSign([{t:'헬기장'},{t:'HELIPAD',s:8}],'#2a3228','#e8e4c8',80,26),false);
  TEX.e4sDepot=mkTex(texSign([{t:'보급 창고'},{t:'SUPPLY DEPOT',s:8}],'#2a3228','#e8e4c8',96,26),false)}
// ---------- geometry helpers ----------
const E4NZ={nosolid:true};
// a pine: trunk, four boughs narrowing upwards (bough boxes block like a thicket)
function e4pine(x,z,y,h){y=y||0;h=h||6;B(x-.17,y,z-.17,x+.17,y+1.2,z+.17,'e4bark');const t=[[1.6,1.1,2.5],[1.25,2.3,3.7],[.9,3.5,4.9],[.5,4.7,h+.8]];
  for(const [r,y0,y1] of t)B(x-r,y+y0,z-r,x+r,y+Math.min(y1,y0+(h/6)*1.3),z+r,'e4pine')}
// a rough rock face along a band: chunks 2–4 m long, uneven tops, moss on them
function e4rocks(ax,a0,a1,c0,c1,y0,h,seed,jit){let a=a0,i=0;jit=jit==null?1.2:jit;while(a<a1-.01){const l=Math.min(a1-a,2+hash2(i,1,seed)*2.2),hh=h+(hash2(i,2,seed)-.5)*2*jit,dc=(hash2(i,3,seed)-.5)*.8;
    if(ax==='x')B(a,y0,c0+Math.min(0,dc),a+l,y0+Math.max(.5,hh),c1+Math.max(0,dc),'e4rock',{f:{py:'e4moss'}});else B(c0+Math.min(0,dc),y0,a,c1+Math.max(0,dc),y0+Math.max(.5,hh),a+l,'e4rock',{f:{py:'e4moss'}});a+=l;i++}}
function e4boulder(x,z,y,s,seed){s=s||1.4;const h=s*(.7+hash2(seed,1,4301)*.5);B(x-s/2,y,z-s*.45,x+s/2,y+h,z+s*.45,'e4rock',{f:{py:'e4moss'}});
  B(x-s*.3+(hash2(seed,2,4301)-.5)*.3,y,z-s*.7,x+s*.35,y+h*.65,z+s*.2,'e4rock',{f:{py:'e4moss'}})}
// a road climbing along x from (xa, ya) to (xb, yb) in n slabs (each filled down to y = -1); a1 / a2 its z sides
function e4road(xa,xb,z0,z1,ya,yb,n,mat){const dx=(xb-xa)/n,dy=(yb-ya)/n;for(let i=0;i<n;i++){const x0=xa+dx*i,x1=xa+dx*(i+1),y=ya+dy*(i+(dy>0?1:0));B(x0,-1,z0,x1,y,z1,'e4conc',{f:{py:mat||'e4road'}})}}
// a guardrail along x (or z) at height y: posts every 2 m and the beam
function e4guard(ax,a0,a1,c,y){const n=Math.max(1,Math.round((a1-a0)/2));for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;if(ax==='x')B(a-.06,y,c-.06,a+.06,y+.75,c+.06,'metal2');else B(c-.06,y,a-.06,c+.06,y+.75,a+.06,'metal2')}
  if(ax==='x')B(a0,y+.42,c-.05,a1,y+.72,c+.05,'e4guard');else B(c-.05,y+.42,a0,c+.05,y+.72,a1,'e4guard')}
// chain-link (solid to walking, bullets and sight go through) with posts and a barbed top
function e4fence(ax,a0,a1,c,y,h){h=h||2.4;if(ax==='x')B(a0,y,c-.03,a1,y+h,c+.03,'e4fence',{pass:1});else B(c-.03,y,a0,c+.03,y+h,a1,'e4fence',{pass:1});
  const n=Math.max(1,Math.round((a1-a0)/3));for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;if(ax==='x')B(a-.05,y,c-.05,a+.05,y+h+.3,c+.05,'metal2');else B(c-.05,y,a-.05,c+.05,y+h+.3,a+.05,'metal2')}
  if(ax==='x')B(a0,y+h+.22,c-.04,a1,y+h+.28,c+.04,'metal2',E4NZ);else B(c-.04,y+h+.22,a0,c+.04,y+h+.28,a1,'metal2',E4NZ)}
// a lattice mast: four legs, see-through lattice faces, a platform at y + 6 (a perch), a red lamp on top
function e4mast(x,z,y,h){h=h||14;const r=1.4;for(const [dx,dz] of [[-r,-r],[r,-r],[-r,r],[r,r]])B(x+dx-.1,y,z+dz-.1,x+dx+.1,y+h,z+dz+.1,'metal2');
  B(x-r,y,z-r-.02,x+r,y+h,z-r+.02,'e4lat',{pass:1,nosolid:true});B(x-r,y,z+r-.02,x+r,y+h,z+r+.02,'e4lat',{pass:1,nosolid:true});B(x-r-.02,y,z-r,x-r+.02,y+h,z+r,'e4lat',{pass:1,nosolid:true});B(x+r-.02,y,z-r,x+r+.02,y+h,z+r,'e4lat',{pass:1,nosolid:true});
  B(x-r-.3,y+6,z-r-.3,x+r+.3,y+6.15,z+r+.3,'plate');B(x-r-.3,y+6.15,z-r-.3,x+r+.3,y+6.9,z-r-.25,'metal2',{pass:1});B(x-r-.3,y+6.15,z+r+.25,x+r+.3,y+6.9,z+r+.3,'metal2',{pass:1});
  B(x-.6,y+h,z-.6,x+.6,y+h+.15,z+.6,'metal2');B(x-.12,y+h+.15,z-.12,x+.12,y+h+.45,z+.12,'lampR',E4NZ);LIGHT(x,y+h+.7,z,'#ff3a2a',5,.45)}
// a military truck (axis 'x' or 'z', the cab at the high end)
function e4truck(x0,z0,ax,y){y=y||0;const L=7.2,W=2.4,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,y+y0,z0+c0,x0+a1,y+y1,z0+c1,m,oo):B(x0+c0,y+y0,z0+a0,x0+c1,y+y1,z0+a1,m,oo);
  LB(.2,L-.2,.15,W-.15,.6,1.15,'e4milD');LB(L-2,L-.1,.1,W-.1,1.15,2.55,'e4mil');LB(L-.12,L-.08,.3,W-.3,1.7,2.35,'carGl',E4NZ);LB(.2,L-2.2,.05,W-.05,1.15,1.6,'e4mil');LB(.2,L-2.2,.05,W-.05,1.6,3.05,'e4tarp');
  for(const a of [.6,1.9,L-1.4])for(const c of [-.04,W-.36])LB(a,a+.85,c,c+.4,0,.9,'tire')}
// a building block with a door and windows on one face (the rest plain); flat roof slab
function e4block(x0,z0,x1,z1,y,h,mat,face,doors,wins,roof){B(x0,y,z0,x1,y+h,z1,mat);const t=.04;
  for(const [u0,u1] of doors||[]){if(face==='pz')B(u0,y,z1,u1,y+2.2,z1+t,'e4door',E4NZ);else if(face==='nz')B(u0,y,z0-t,u1,y+2.2,z0,'e4door',E4NZ);else if(face==='px')B(x1,y,u0,x1+t,y+2.2,u1,'e4door',E4NZ);else B(x0-t,y,u0,x0,y+2.2,u1,'e4door',E4NZ)}
  for(const [u0,u1,lit] of wins||[]){const m=lit?'e4winL':'e4win',y0=y+1.1,y1=y+2.1;if(face==='pz')B(u0,y0,z1,u1,y1,z1+t,m,E4NZ);else if(face==='nz')B(u0,y0,z0-t,u1,y1,z0,m,E4NZ);else if(face==='px')B(x1,y0,u0,x1+t,y1,u1,m,E4NZ);else B(x0-t,y0,u0,x0,y1,u1,m,E4NZ)}
  if(roof!==false)B(x0-.25,y+h,z0-.25,x1+.25,y+h+.25,z1+.25,roof||'e4conc')}
// sandbags along an axis
function e4sand(x0,z0,ax,len,y,h){h=h||1.05;y=y||0;if(ax==='x')B(x0,y,z0-.35,x0+len,y+h,z0+.35,'sandbag');else B(x0-.35,y,z0,x0+.35,y+h,z0+len,'sandbag')}
function e4crate(x,z,y,s){s=s||1.1;return B(x-s/2,y,z-s/2,x+s/2,y+s,z+s/2,'pallet')}
// a relay site: a gravel pad, a 7 m mast with dish and whip, the control box (the stage-2 device) facing fx/fz
function e4relaySite(x,z,y,fx,fz){B(x-2.4,y-.2,z-2.4,x+2.4,y,z+2.4,'e4conc',{f:{py:'e4pad'}});B(x-.15,y,z-.15,x+.15,y+7,z+.15,'metal2');B(x-.5,y+5.2,z-.08,x+.5,y+5.9,z+.08,'metal2',E4NZ);
  B(x-.04,y+7,z-.04,x+.04,y+9.2,z+.04,'metal2',E4NZ);B(x-.12,y+9.2,z-.12,x+.12,y+9.4,z+.12,'lampR',E4NZ);LIGHT(x,y+9.6,z,'#ff3a2a',4,.4);
  const bx=x+fx*1.4,bz=z+fz*1.4,f={};f[fx>0?'px':fx<0?'nx':fz>0?'pz':'nz']='e4relay';B(bx-.45,y,bz-.45,bx+.45,y+1.4,bz+.45,'metal',{f});
  B(x-.2,y+3,z-.2,x+.2,y+3.4,z+.2,'e4sRelay',E4NZ)}
// an alarm siren tower: a concrete plinth, the mast, a horn cluster, its beacon (a separate lamp lyrebird.js lights), the control box south
function e4sirenT(x,z,y,h,sign){B(x-1.6,y,z-1.6,x+1.6,y+1,z+1.6,'e4conc',{f:{py:'e4pad'}});B(x-.25,y+1,z-.25,x+.25,y+h,z+.25,'metal2');
  for(const [dx,dz,f] of [[0,-.75,'nz'],[0,.75,'pz'],[-.75,0,'nx'],[.75,0,'px']]){const o={f:{}};o.f[f]='e4horn';B(x+dx-.45,y+h-1.3,z+dz-.45,x+dx+.45,y+h-.4,z+dz+.45,'metal',o)}
  B(x-.6,y+h,z-.6,x+.6,y+h+.12,z+.6,'metal2');B(x+.45,y+1,z-.05,x+.55,y+h-1.3,z+.05,'metal2',E4NZ);
  B(x-.6,y,z+1.6,x+.6,y+1.9,z+2.1,'metal',{f:{pz:'e4siren'}});if(sign)B(x-.8,y+1.95,z+2.1,x+.8,y+2.5,z+2.14,'e4sSiren',E4NZ)}
function buildEp4(){
  const nz=E4NZ;
  // ================= zone A: the checkpoint at the foot =================
  B(-74,-1,10,-30,0,48,'e4grass',{ground:1});B(-74,-1,27,-30,0,35,'e4road',{ground:1});B(-74,-1,35,-30,0,38,'e4dirt',{ground:1});B(-74,-1,22,-30,0,27,'e4dirt',{ground:1});
  // the mountain to the north (a rock face), the forest falling away to the south, the landslide closing the road to the west
  e4rocks('x',-74,-30,7.4,10.4,0,7.5,4401,1.6);e4rocks('x',-74,-30,10.4,12.4,0,3.4,4402,1);
  for(let i=0;i<14;i++){const x=-72+i*3.1+hash2(i,1,4403)*1.4,z=44+hash2(i,2,4403)*3;e4pine(x,z,0,5+hash2(i,3,4403)*3)}
  for(let i=0;i<6;i++)e4pine(-71+i*7.4+(i===1?-2.4:0),42.8+hash2(i,4,4403)*1.2,0,4.5+hash2(i,5,4403)*2);
  B(-74,0,48,-30,5,48.4,'metalx');B(-74.4,0,10,-74,6,48,'metalx');
  e4rocks('z',27,35,-74,-70.5,0,2.6,4404,.9);e4boulder(-69.4,29.4,0,1.6,1);e4boulder(-69.8,33.2,0,1.3,2);B(-69.4,0,30.4,-68.2,.9,32.2,'e4bark');B(-72,1.3,30.6,-64,1.75,31.2,'e4bark');
  // the checkpoint: a concrete booth with windows, the barrier arm (raised, bent), a stop sign, sandbags
  e4block(-41,21,-37,25,0,2.8,'e4conc','pz',[[-38.6,-37.6]],[[-40.6,-38.9,true]],'e4roof');B(-41.04,1.1,21.4,-41,2.1,24.6,'e4win',nz);LIGHT(-39,2.4,23,'#ffd8a0',6,.75,{flick:.2});
  B(-37,0,26.4,-36.4,1.2,27,'conc');B(-36.8,1.1,26.6,-36.6,1.3,34.4,'hazard',nz);B(-37.05,1.4,24.4,-37,2.3,26.6,'e4sStop',nz);
  e4sand(-46,24,'x',3.2);e4sand(-46,24,'z',2.4);e4sand(-34,38.4,'x',3);
  // the army truck on the shoulder, a dead car, the bus stop, the trail board, crates and drums
  e4truck(-53,36.2,'x');car(-60.5,29.2,-56.3,31,'car');car(-45,31.8,-41,33.6,'carBurnt',{burnt:1});
  B(-65,0,38.2,-59.6,.15,40.4,'e4conc');B(-65,0,40.2,-59.6,2.6,40.35,'carGl',{pass:1});B(-65.1,0,38.2,-64.95,2.6,40.4,'metal2');B(-59.75,0,38.2,-59.6,2.6,40.4,'metal2');
  B(-65.3,2.6,38,-59.3,2.75,40.6,'e4roof');B(-64.4,0,39.5,-60.2,.5,40.1,'wood');B(-59.4,0,37.8,-58.95,2.8,38.25,'e4bus',{f:{pz:'e4bus'}});
  B(-67.2,0,21.6,-67,2.5,21.8,'e4bark');B(-63.6,0,21.6,-63.4,2.5,21.8,'e4bark');B(-67.3,.9,21.85,-63.3,2.5,21.95,'e4board',nz);B(-67.3,2.5,21.5,-63.3,2.7,22.1,'e4roof');
  for(const [x,z,y] of [[-50,25,0],[-49,25.2,0],[-49.5,25.1,1.1],[-34,23,0]])e4crate(x,z,y);drum(-47.5,24.6);drum(-33,25.5);drum(-58,24.4,0,'drumR');
  for(const [x,z] of [[-62,26],[-48,36],[-34,26]])lamp(x,z,5.4,'#ffc890');
  // the barrier gate (gA): two olive leaves sliding apart, the base sign over it; the fence and rocks either side
  B(-30.4,0,10.4,-29.6,6,27,'e4rock');B(-30.4,0,35,-29.6,3,48,'e4conc');B(-30.4,3.4,27,-29.6,4,35,'metal2',nz);
  B(-30.2,0,27,-29.8,3.2,31,'e4milD',{gate:'gA',gs:[0,0,-3.9]});B(-30.2,0,31,-29.8,3.2,35,'e4milD',{gate:'gA',gs:[0,0,3.9]});
  B(-30.46,3.6,27.6,-30.4,4.4,34.4,'e4sBase',nz);LIGHT(-32,4,31,'#ffe0b0',8,.7);
  // ================= zone B: the mountain road =================
  // the lower road east (y 0 → 3), its shoulder and guardrail, the slope under it
  B(-30,-1,27,-20,0,35,'e4conc',{f:{py:'e4road'}});e4road(-20,28,27,35,0,3,12);B(28,-1,12,46,3,35,'e4conc',{f:{py:'e4road'}});
  B(-30,-1,35,-20,0,48,'e4grass',{ground:1});for(let i=0;i<12;i++){const x0=-20+i*4,y=(i+1)*.25;B(x0,-1,35,x0+4,y-.35,48,'e4conc',{f:{py:'e4grass'}});if(i!==4&&i!==5)e4guard('x',x0,x0+4,35.3,y)}B(28,-1,35,32,2.65,48,'e4conc',{f:{py:'e4grass'}});e4guard('x',-28,-20,35.3,0);B(-30,0,48,46,6,48.4,'metalx');B(46,0,10,46.4,10,48,'metalx');
  for(let i=0;i<12;i++){const x=-27+i*5.1+hash2(i,1,4411)*2,z=42.4+hash2(i,2,4411)*4,yb=x<-20?0:Math.min(12,Math.floor((x+20)/4)+1)*.25-.35;if(Math.abs(x)<5)continue;e4pine(x,z,Math.max(0,yb),5+hash2(i,3,4411)*3)}
  // relay 1: a pad off the lower road's south shoulder
  B(-4,-1,35,4,1.25,42,'e4conc',{f:{py:'e4grass'}});e4relaySite(0,39,1.25,0,-1);B(-4,1.25,42,4,2.4,42.3,'e4rock');e4guard('z',35.4,41,-4.2,1.25);e4guard('z',35.4,41,4.2,1.25);
  // between the roads: the rock step the upper road sits on (it rises as the road does), a pillbox cut into it
  for(let i=0;i<12;i++){const x0=-20+i*4,x1=x0+4,y=3+(11-i)*.25;B(x0,-1,20,x1,y,27,'e4rock',{f:{py:'e4moss'}})}B(-30,-1,20,-20,6,27,'e4rock',{f:{py:'e4moss'}});
  e4block(6,24.6,11,27,1.75,1.8,'e4conc','pz',[[7.8,9.2]],[[6.4,7.4],[9.6,10.6]],false);
  // the hairpin (y 3): the supply depot (a bunker you can go into), sandbags, a fuel point, relay 2
  {const x0=38,x1=45,z0=23,z1=33,y=3,h=3;wallX(x0,x1,z0,z0+.3,y,y+h,'e4conc');wallX(x0,x1,z1-.3,z1,y,y+h,'e4conc');wallZ(x1-.3,x1,z0+.3,z1-.3,y,y+h,'e4conc');wallZ(x0,x0+.3,z0+.3,z1-.3,y,y+h,'e4conc',[[26.4,29.6,y,y+2.4]]);B(x0-.2,y+h,z0-.2,x1+.2,y+h+.3,z1+.2,'e4roof',{f:{ny:'e4conc'}});B(x0,3,z0,x1,3.02,z1,'e4pad',nz)}
  B(37.56,5.5,26,37.6,6.2,30,'e4sDepot',nz);for(const [x,z,y] of [[40,25,3],[41.2,25,3],[40.6,25,4.1],[43.6,31,3],[43.6,29.8,3]])e4crate(x,z,y);drum(43.8,25.4,3);drum(44.2,26.2,3,'drumR');
  LIGHT(41.5,5.6,28,'#ffd8a0',7,.75,{flick:.25});e4sand(32,12.8,'x',3.4,3);e4sand(34.6,21,'z',3,3);
  e4relaySite(42,15.6,3,-1,0);B(30,3,35,46,4,35.3,'e4guard');e4rocks('x',34,46,10.4,12,0,11,4412,1.4);
  // the upper road west (y 3 → 6); the rock tunnel on it; relay 3 at its west end, the retaining wall and the compound's fence above it
  e4road(28,-16,12,20,3,6,12);B(-30,-1,12,-16,6,20,'e4conc',{f:{py:'e4road'}});
  B(-6,4.6,11.8,6,12,13,'e4rock');B(-6,4.6,19,6,12,20.6,'e4rock');B(-6,9.6,13,6,12,19,'e4rock',{f:{ny:'e4rock'}});for(const x of [-5,0,5])B(x-.2,9.3,15.8,x+.2,9.6,16.2,'lampW',nz);
  LIGHT(-3,8.8,16,'#ffe0b0',7,.7,{flick:.15});LIGHT(3,8.8,16,'#ffe0b0',7,.7);e4rocks('x',-6,6,20.6,22,4.6,8,4413,.8);
  e4relaySite(-28,17,6,1,0);
  for(let i=0;i<9;i++){const x0=-16+i*6,x1=Math.min(34,x0+6),yr=x0>=28?3:3+(28-x0)/44*3;B(x0,yr-1,11.6,x1,7.2,12,'e4conc')}
  // ================= zone C: the radar dome compound (y 6) =================
  B(-30,5,-14,34,6,12,'e4pad',{ground:1});B(-30,5,-14,-24,6,4,'e4grass',{ground:1});
  e4fence('x',-30,-26,12,6);e4fence('x',-20,-16,12,6);e4fence('x',-16,34,12,7.2);B(-26,6,11.8,-20,8.4,12.2,'metal',{gate:'gB',gs:[-5.8,0,0]});B(-26,8.4,11.9,-20,8.6,12.1,'metal2',nz);
  e4rocks('z',-14,12,-34,-30,6,7,4421,1.4);B(34,6,-14,34.4,9,12,'metalx');e4fence('z',-14,12,34,6,2.2);
  // the radar operations block with its dome (the dome a mesh: ep4Mesh), a door to the east
  e4block(-18,-8,-6,4,6,4.5,'e4paint','px',[[-3,-1]],[[-6.6,-4.2],[0,2.4]],'e4conc');
  for(const [y0,r] of [[10.75,5.4],[12.6,4.9],[14.2,4],[15.4,2.7]])B(-12-r*.72,y0,-2-r*.72,-12+r*.72,y0+1.7,-2+r*.72,'metalx');
  B(-5.96,9,-6,-5.92,9.7,-2,'e4sRadar',nz);B(-18.2,6,-8.2,-5.8,6.3,4.2,'e4conc');
  // the barracks: a long block, doors north, lit windows, a pitched roof (stepped)
  e4block(4,3,22,10,6,3.2,'e4paint','nz',[[7,8.2],[16,17.2]],[[5,6.4,true],[9.4,11],[12.4,14],[18.4,20,true]],false);
  B(3.6,9.2,2.6,22.4,9.5,10.4,'e4roof');B(3.6,9.5,3.8,22.4,9.8,9.2,'e4roof');B(3.6,9.8,5,22.4,10.05,8,'e4roof');B(9,8.6,2.96,13,9.1,3,'e4sBar',nz);
  // the mess hall: doors west and east (a way through), tables inside
  {const x0=6,x1=20,z0=-12,z1=-4,y=6,h=3.4;wallX(x0,x1,z0,z0+.3,y,y+h,'e4paint',[[9,11.4,y+1,y+2.1],[14.6,17,y+1,y+2.1]]);wallX(x0,x1,z1-.3,z1,y,y+h,'e4paint',[[8,10.4,y+1,y+2.1],[15,17.4,y+1,y+2.1]]);
    wallZ(x0,x0+.3,z0+.3,z1-.3,y,y+h,'e4paint',[[-8.6,-7.2,y,y+2.3]]);wallZ(x1-.3,x1,z0+.3,z1-.3,y,y+h,'e4paint',[[-8.6,-7.2,y,y+2.3]]);B(x0-.25,y+h,z0-.25,x1+.25,y+h+.3,z1+.25,'e4roof',{f:{ny:'e4paint'}});
    for(const xx of [9,13,17])B(xx-1,y,-9.2,xx+1,y+.8,-6.8,'wood',{f:{py:'metal2'}});B(x0+.3,y,-11.6,x0+3,y+1,-11,'metal');LIGHT(13,y+2.9,-8,'#ffe0b0',7,.7,{flick:.12});B(12.6,y+3.36,-8.3,13.4,y+3.4,-7.7,'lampW',nz);
    B(9.6,y+2.5,-12.36,12.4,y+3.1,-12.3,'e4sMess',nz)}
  // a small radome on its own tower, the antenna masts, the water tank, a jeep, sandbags and barriers on the way through
  B(25,6,2,29,12,6,'e4conc');B(24.6,12,1.6,29.4,12.3,6.4,'metal2');B(25,12.3,2,29,14.6,6,'metalx');
  for(const [x,z] of [[-26,-6],[0,-12],[30,-8]]){B(x-.12,6,z-.12,x+.12,18,z+.12,'metal2');B(x-.18,18,z-.18,x+.18,18.3,z+.18,'lampR',nz);LIGHT(x,18.5,z,'#ff3a2a',4,.4)}
  MAP.deco.push({k:'drum',x:-25.5,y:9.6,z:-10.5,r:1.6,h:2.6,mat:'e4tankW',rot:0});for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])B(-25.5+dx*1.1-.08,6,-10.5+dz*1.1-.08,-25.5+dx*1.1+.08,9.6,-10.5+dz*1.1+.08,'metal2');B(-27,9.4,-12,-24,9.6,-9,'metal2');B(-26.6,9.6,-11.6,-24.4,12.2,-9.4,'metalx');
  B(-2,6.32,6.6,2.2,6.95,8.4,'e4mil');B(-.4,6.95,6.7,1.3,7.5,8.3,'carGl',{f:{py:'e4mil'}});for(const [x,z] of [[-1.6,6.4],[1.2,6.4],[-1.6,8.2],[1.2,8.2]])B(x,6,z,x+.6,6.62,z+.4,'tire');
  e4sand(-22,0,'x',3,6);e4sand(-2,-4,'z',3.4,6);e4sand(24,-6,'x',3.4,6);for(const [x,z] of [[-20,8],[0,2],[22,-2]])B(x,6,z,x+2.6,6.85,z+.6,'barrier');
  for(const [x,z,y] of [[-4,-10,6],[-2.9,-10,6],[-3.4,-10,7.1],[26,-12,6],[30,10,6]])e4crate(x,z,y);drum(-20,-12,6);drum(-19.3,-12.4,6,'drumR');
  for(const [x,z] of [[-22,6],[2,-2],[24,8],[18,-13]])B(x-.09,6,z-.09,x+.09,11,z+.09,'metal2');for(const [x,z] of [[-22,6],[2,-2],[24,8],[18,-13]]){B(x-.3,11,z-.16,x+.3,11.14,z+.16,'lampO',nz);LIGHT(x,10.6,z,'#ffc890',11,.8,{lamp:1})}
  // the north wall, the summit gate (gC) and the stair up the last step (y 6 → 10)
  B(-30,6,-14.4,26,10,-14,'e4conc');B(32,6,-14.4,34,10,-14,'e4conc');B(26,9.2,-14.4,32,10,-14,'e4conc');
  B(26,6,-14.3,29,9.2,-14.1,'e4milD',{gate:'gC',gs:[-2.9,0,0]});B(32.3,6,-14.05,33.3,7.35,-13.45,'metal',{f:{pz:'e4cons'}});B(32.45,7.35,-14.05,33.15,7.5,-13.6,'metal2',nz);LIGHT(32.8,7.8,-13.2,'#9ad8ff',4,.6,{flick:.1});B(29,6,-14.3,32,9.2,-14.1,'e4milD',{gate:'gC',gs:[2.9,0,0]});B(26.2,9.3,-14,31.8,9.9,-13.94,'e4sBase',nz);
  stairs('z',26,32,-14.4,-22,6,10,16,'e4conc');B(25.4,6,-22,26,12,-14.4,'e4rock');B(32,6,-22,32.6,12,-14.4,'e4rock');
  // ================= zone D: the summit antenna yard (y 10) =================
  B(-22,9,-60,38,10,-22,'e4pad',{ground:1});B(-22,9,-60,-14,10,-46,'e4grass',{ground:1});
  // the rock rising behind (south, east), the cliff (north, west): a low guardrail, the drop (an invisible wall keeps everyone on top)
  e4rocks('x',-22,26,-24,-22,10,6,4431,1.6);e4rocks('x',32,38,-24,-22,10,6,4432,1.2);e4rocks('z',-60,-22,38,41,10,8,4433,1.6);
  e4guard('x',-21,37,-59.6,10);e4guard('z',-59,-23,-21.6,10);B(-22,10,-60.6,38,16,-60.2,'metalx');B(-22.8,10,-60,-22.4,16,-22,'metalx');
  B(-22,4,-62,38,10,-60,'e4rock',{f:{py:'e4moss'}});B(-26,4,-62,-22,10,-22,'e4rock',{f:{py:'e4moss'}});B(-6,10.75,-59.7,-2,11.45,-59.66,'e4sCliff',nz);B(-21.66,10.75,-44,-21.62,11.45,-40,'e4sCliff',nz);
  // the alarm sirens: the centre tower (live from the start), east and west (live in phase 3)
  e4sirenT(8,-41,10,9,true);e4sirenT(33,-41,10,7,false);e4sirenT(-17,-36,10,7,false);
  // lattice masts (cover; LYREBIRD climbs them)
  e4mast(-6,-30,10,14);e4mast(22,-32,10,14);e4mast(-2,-54,10,16);
  // the helipad (raised, marked)
  B(-16,10,-55,-4,10.22,-43,'e4pad');B(-15.8,10.22,-54.8,-4.2,10.24,-43.2,'e4heli',nz);for(let i=0;i<10;i++){const a=i/10*TAU,x=-10+Math.cos(a)*6.4,z=-49+Math.sin(a)*6.4;B(x-.12,10.22,z-.12,x+.12,10.4,z+.12,i%2?'lampW':'lampO',nz)}
  B(-16.06,10.6,-46,-16,11.2,-43.6,'e4sHeli',nz);
  // the signals block: the ground floor (solid), the terrace on its roof, the upper room, stairs outside (west) up to the terrace and on to the roof
  e4block(22,-58,34,-50,10,3.5,'e4paint','nx',[[-54.6,-53.4]],[[-57.4,-55.6],[-52.4,-50.6,true]],'e4conc');B(21.96,11.8,-50.4,22,12.5,-47.6,'e4sComm',nz);
  e4block(26,-58,34,-53,13.75,3.2,'e4paint','nx',[],[[-57,-55.4,true]],'e4roof');B(24,13.75,-50.25,34,14.75,-50,'metal2',{pass:1});B(21.75,13.75,-58,22,14.75,-50,'metal2',{pass:1});
  stairs('z',20.2,22,-44,-50,10,13.75,15,'e4conc');B(20,10,-50,22,13.75,-49.6,'e4conc');stairs('x',-53,-52,22.4,25.6,13.75,16.95,12,'metal');
  for(let i=0;i<5;i++)B(27+i*1.4,17.2,-57.6,27.6+i*1.4,17.8,-57,'metal',{f:{py:'metal2'}});B(30.4,17.2,-54.6,30.6,21,-54.4,'metal2');B(29.6,20.2,-55,31.4,20.3,-54,'metal2',nz);LIGHT(30.5,21.2,-54.5,'#ff3a2a',4,.4);
  LIGHT(24,12.6,-51,'#ffe0b0',6,.65,{flick:.2});LIGHT(28,16.2,-54,'#ffd8a0',5,.6);
  // the generator shed (south-west): open front, a generator, drums
  B(-21,10,-32,-12,10.3,-26,'e4conc');B(-21,10.3,-32,-20.7,13.2,-26,'e4conc');B(-21,10.3,-32.3,-12,13.2,-32,'e4conc');B(-12.3,10.3,-32,-12,13.2,-29,'e4conc');B(-21.3,13.2,-32.3,-11.7,13.45,-25.7,'e4roof');
  B(-19.6,10.3,-31,-16.4,12,-28.6,'e4mil',{f:{pz:'e4relay'}});B(-18.6,12,-30.2,-18.2,13.2,-29.8,'pipe');drum(-14,-30,10.3,'drumR');drum(-13.4,-29.2,10.3);LIGHT(-16,12.8,-28,'#ffe0b0',6,.7,{flick:.25});
  // cover in the yard: sandbag posts, barriers, crates, a dead truck, cable drums
  e4sand(0,-38,'x',3.2,10);e4sand(15,-46,'x',3.4,10);e4sand(16,-27,'z',3,10);e4sand(-2,-46,'z',3,10);e4sand(28,-40,'z',3.4,10);
  for(const [x,z] of [[2,-32],[12,-52],[-14,-38],[26,-46]])B(x,10,z,x+2.6,10.85,z+.6,'barrier');
  for(const [x,z,y] of [[4,-50,10],[5.2,-50,10],[4.6,-50,11.1],[30,-28,10],[31.2,-28.4,10],[-10,-27,10]])e4crate(x,z,y);
  e4truck(8,-28.6,'x',10);MAP.deco.push({k:'drum',x:-4,y:10,z:-40,r:.9,h:1,mat:'tire',rot:0});B(-4.7,10,-40.7,-3.3,11,-39.3,'tirex');
  for(const [x,z] of [[-12,-50],[18,-38],[30,-34],[-6,-40]])B(x-.09,10,z-.09,x+.09,15,z+.09,'metal2');for(const [x,z] of [[-12,-50],[18,-38],[30,-34],[-6,-40]]){B(x-.3,15,z-.16,x+.3,15.14,z+.16,'lampO',nz);LIGHT(x,14.6,z,'#ffc890',10,.7,{lamp:1})}
  // ================= spawns, zones, gates, devices =================
  const A=[],Bs=[],Cs=[],Ds=[];for(let i=0;i<8;i++){A.push([-63+(i%4)*1.2,0,29.6+Math.floor(i/4)*1.6,-Math.PI/2]);Bs.push([-27.6+(i%4)*1.1,0,29.4+Math.floor(i/4)*1.6,-Math.PI/2]);
    Cs.push([-24.6+(i%4)*1.1,6,13.4+Math.floor(i/4)*1.3,0]);Ds.push([27.4+(i%4)*1.2,10,-24.6-Math.floor(i/4)*1.3,.92])}
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-71,24,0],[-71,38,0],[-58,40,0],[-46,40,0],[-36,40,0],[-60,14,0],[-46,14,0],[-34,14,0],[-72,20,0]];
  const zB=[[-10,40,.4],[12,46,1.9],[34,20,3],[33,32,3],[42,14,3],[12,16,4.3],[-12,16,5.8]];
  const zC=[[-28,10,6],[-28,-12,6],[32,-12,6],[32,10,6],[0,-13,6],[-14,10,6],[20,0,6]];
  const zD=[[-20,-58,10],[36,-58,10],[-16,-25,10],[36,-26,10],[8,-58,10],[-20,-42,10],[36,-42,10]];
  MAP.zspawns=[].concat(zA,zB,zC,zD).map(p=>[p[0],p[1],p[2]]);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.2,mh:2.1,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-72,10,-30,48],start:A,zsp:zA},B:{box:[-30,12,46,48],start:Bs,zsp:zB},C:{box:[-30,-14,34,12],start:Cs,zsp:zC},D:{box:[-22,-60,38,-22],start:Ds,zsp:zD}},
    door:{A:[-30,1.5,31],B:[-23,7.5,12],C:[29,7.5,-14]},
    // stage 2: three relays (10 s each, any order); a lit one thins the fog round it and gets the fallen up
    relay:[dv(0,1.25,37.6,['중계기 1 · 아래 도로','Relay 1 · lower road'],['중계기 재가동','restart the relay'],10,0,-.5),dv(40.6,3,15.6,['중계기 2 · 굽은 길','Relay 2 · hairpin'],['중계기 재가동','restart the relay'],10,-.5,0),
      dv(-26.6,6,17,['중계기 3 · 윗길 끝','Relay 3 · top of the road'],['중계기 재가동','restart the relay'],10,.5,0)],
    // stage 3: the summit gate (everybody inside the box in front of it)
    goal:{g:{box:[25,-13.6,33,-9],p:[29,6,-11],n:['정상 정문','SUMMIT GATE']}},
    // (and its console: hold E 10 s before the gate will open)
    gateC:{x:32.8,y:6,z:-13.75,bx:32.8,bz:-12.9},
    // the sirens (0 the centre: live from the start of the boss fight; 1 east, 2 west: from phase 3); bx,bz = the box to hold E at
    sirens:[{x:8,y:10,z:-41,h:9,bx:8,bz:-38.5,ph:1},{x:33,y:10,z:-41,h:7,bx:33,bz:-38.5,ph:3},{x:-17,y:10,z:-36,h:7,bx:-17,bz:-33.5,ph:3}],
    // where LYREBIRD climbs to (roofs, mast platforms, the generator shed, the radome tower) and where it lurks in the fog
    perch:{C:[{x:13,y:10.05,z:6.5},{x:-12,y:10.75,z:3.6},{x:20,y:10.05,z:6.5},{x:13,y:9.7,z:-8},{x:-25.5,y:12.2,z:-10.5}],
      D:[{x:-6,y:16.15,z:-30},{x:22,y:16.15,z:-32},{x:-2,y:16.15,z:-54},{x:28,y:17.2,z:-55.5},{x:-16.5,y:13.45,z:-29},{x:8,y:19.12,z:-41}]},
    lurk:{C:[[-26,6,-4],[-22,6,-12],[30,6,6],[22,6,-10],[-2,6,10],[2,6,-12],[30,6,-2]],
      D:[[-18,10,-56],[-4,10,-58],[14,10,-58],[36,10,-46],[36,10,-28],[-20,10,-34],[-16,10,-46],[4,10,-24],[20,10,-24]]},
    // phase points of the boss fight (the middle of the yard) and the bots' rally ring round the centre siren
    mid:[8,10,-38],rally:[[4,10,-36],[12,10,-36],[8,10,-33],[2,10,-40],[14,10,-40]],
    cliffZ:-48};
  MAP.camps=[{k:'a',w:.2,p:[[-50,0,31],[-52,0,30]],look:[-66,1,31]},{k:'b',w:.2,p:[[0,1.25,31]],look:[-16,1,31]},{k:'c',w:.2,p:[[0,6,0]],look:[-14,7,0]},{k:'d',w:.2,p:[[8,10,-36]],look:[8,11,-50]}];
  MAP.moon={d:new THREE.Vector3(.55,.42,-.62).normalize(),c:new THREE.Color('#5a6e8e'),i:.5};MAP.spawnYaw=-Math.PI/2;
  MAP.cam=(t,cam)=>{const a=t*.04;cam.position.set(8+Math.sin(a)*22,18,-40+Math.cos(a)*18);cam.lookAt(8,12,-41)}}
// ---------- the meshes boxes cannot make: the radomes, the sea of cloud under the cliff, the red lamps that show through the fog ----------
const E4GLOW={L:[]};
function ep4Mesh(scene){
  const dome=(x,y,z,r)=>{const g=new THREE.SphereGeometry(r,28,10,0,TAU,0,Math.PI/2).toNonIndexed();g.translate(x,y,z);const P=g.attributes.position,N=g.attributes.normal,n=P.count,col=new Float32Array(n*3);
    for(let i=0;i<n;i++){const c=lightAt(P.getX(i)+N.getX(i)*.05,P.getY(i)+N.getY(i)*.05,P.getZ(i)+N.getZ(i)*.05,N.getX(i),N.getY(i),N.getZ(i));col.set(c,i*3)}
    const U=g.attributes.uv;for(let i=0;i<n;i++)U.setXY(i,U.getX(i)*3,U.getY(i)*1.5);g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Mesh(g,matWorld(TEX.e4dome));m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);MAP.meshes.push(m)};
  dome(-12,10.75,-2,5.6);dome(27,12.3,4,2.4);
  // the sea of cloud: far below the summit to the north and the west, fogged like everything else (it shows when the fog lifts)
  {const g=new THREE.PlaneGeometry(420,260,1,1);g.rotateX(-Math.PI/2);g.translate(10,-14,-170);const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*5,U.getY(i)*3);
    const col=new Float32Array(U.count*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(g,matWorld(TEX.e4cloud,{emis:.55}));m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);MAP.meshes.push(m);
    const g2=new THREE.PlaneGeometry(200,260,1,1);g2.rotateX(-Math.PI/2);g2.translate(-120,-14,-30);const U2=g2.attributes.uv;for(let i=0;i<U2.count;i++)U2.setXY(i,U2.getX(i)*2.5,U2.getY(i)*3);
    g2.setAttribute('color',new THREE.BufferAttribute(new Float32Array(U2.count*3).fill(1),3));const m2=new THREE.Mesh(g2,matWorld(TEX.e4cloud,{emis:.55}));m2.matrixAutoUpdate=false;m2.updateMatrix();scene.add(m2);MAP.meshes.push(m2)}
  // red lamps on the masts and domes: glows drawn over the fog (they blink; lyrebird.js keeps them going)
  E4GLOW.L=[];const tex=E4GLOW.tex||(E4GLOW.tex=(()=>{const [cv,x]=mkCanvas(64,64);const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,90,60,1)');gr.addColorStop(.25,'rgba(255,40,20,.6)');gr.addColorStop(1,'rgba(255,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})());
  for(const [x,y,z,s,ph] of [[-12,16.6,-2,5,0],[27,14.9,4,3.4,1.2],[-26,18.4,-6,3,2],[0,18.4,-12,3,.5],[30,18.4,-8,3,1.7],[-6,24.5,-30,4,.3],[22,24.5,-32,4,2.2],[-2,26.5,-54,4,1],[30.5,21.3,-54.5,3,2.6],[0,10.7,39,2.6,1.4],[42,12.6,15.6,2.6,.8],[-28,15.6,17,2.6,2.4]]){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);sp.renderOrder=5;scene.add(sp);MAP.meshes.push(sp);E4GLOW.L.push({sp,ph,s})}}
MAPDEFS.ep4={n:['운무봉 통신기지','Unmubong Signal Station'],d:['구름에 묻힌 산꼭대기 군 통신기지, 해 뜨기 직전. 산 아래 검문소 → 산악 도로와 벙커 → 레이더 돔 단지 → 정상 안테나 야드.','A mountaintop army signal station buried in cloud, just before dawn: the checkpoint at the foot, the mountain road and its bunkers, the radar dome compound, then the summit antenna yard.'],
  env:{sky:1,skyTex:'e4sky',noStars:1,rain:0,storm:0,fog:'#4a5768',fogD:.045,skyFog:.6,halo:'#4a5a7a',ambOut:'#3e4a5c',ambIn:'#2a2e36',boAmb:.5},bounds:[-74,-64,48,50],probeY:[-.4,.9,2.4,4.4,6.9,8.4,10.9,13,15.4,18,21],
  build:buildEp4,tex:bakeEp4Tex,mesh:ep4Mesh,ep:4};

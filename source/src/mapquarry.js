'use strict';
// ============ Map "회색 채석장 Grey Quarry" (v7.9): a granite quarry cut into a hillside, at sundown ============
// An original map (no reference), for the zombie modes and PvP alike, mostly in the open. The pit in the middle: its rim at the yard's
// level, a bench 4 m down all round, the floor 4 m lower again (a pond in one corner, an excavator, cut blocks lying about); two haul
// ramps and three steel stairs join the levels, so the pit has few ways in and out. North: the quarry's back wall, 16 m of rock, the old
// adit at the bench (a tunnel with a store room off it). East rim: the crusher tower (decks at 4.5 and 9 m, the crusher house on top, a
// conveyor down to the stockpile). The yard south of the pit: the site office in stacked containers (a stair up to the roof), three
// stockpiles of crushed stone you can climb, the lock-block bays, a haul truck with its stairway, the weighbridge at the gate. Rock
// outcrops east and west, the fence along the south. The sun is low in the west (21°): warm light on what faces west, long shadows.
Object.assign(MATS,{
  qyRock:{t:'qyRock',s:4,vo:0,sv:4,k:'stone',cs:1},qyRockC:{t:'qyRockC',s:3,k:'stone',cs:1},qyBench:{t:'qyBench',s:3,k:'stone',cs:1},qyFloor:{t:'qyFloor',s:3,k:'stone',cs:1},
  qyYard:{t:'qyYard',s:3,k:'soft',cs:1},qyRoad:{t:'qyRoad',s:3,k:'soft',cs:1},qyScrub:{t:'qyScrub',s:4,k:'soft',cs:2},qyAdit:{t:'qyAdit',s:2,k:'soft',cs:1},
  qyWater:{t:'qyWater',s:4,emis:.1,k:'soft',cs:1},qyLock:{t:'qyLock',s:3.2,vo:0,sv:1.6,k:'stone'},qyStone:{t:'qyStone',s:2,k:'stone'},qyGravel:{t:'qyGravel',s:2,k:'soft',cs:1},
  qySteel:{t:'qySteel',s:1.6,k:'metal'},qySteelG:{t:'qySteelG',s:1.6,k:'metal'},qyGrate:{t:'qyGrate',s:1,k:'metal'},qyTin:{t:'qyTin',s:2,vo:0,sv:3.2,k:'metal'},
  qyBelt:{t:'qyBelt',s:1,k:'soft'},qyTimber:{t:'qyTimber',s:1.2,k:'wood'},qyPanel:{t:'qyPanel',s:2.4,k:'wood'},qyFloorI:{t:'qyFloorI',s:1.6,k:'wood'},
  qyGlassT:{t:'qyGlassT',uv:'box',k:'glass'},qyTruck:{t:'qyTruck',s:2.4,k:'metal'},qyLoo:{t:'qyLoo',uv:'box',k:'metal'},qyLocker:{t:'qyLocker',uv:'box',k:'metal'},qyDesk:{t:'qyDesk',s:1,k:'wood'},
  qySignGate:{t:'qySignGate',uv:'box',emis:.08,k:'metal'},qySignBlast:{t:'qySignBlast',uv:'box',emis:.1,k:'metal'},qySignFall:{t:'qySignFall',uv:'box',emis:.08,k:'metal'},
  qySignMag:{t:'qySignMag',uv:'box',emis:.06,k:'metal'},qySignCr:{t:'qySignCr',uv:'box',emis:.06,k:'metal'},qySignOff:{t:'qySignOff',uv:'box',emis:.06,k:'metal'},
  qySignSafe:{t:'qySignSafe',uv:'box',emis:.08,k:'metal'},
  qyHill:{t:'qyHill',s:8,k:'soft'},qyPine:{t:'qyPine',s:1,k:'soft'},qyBark:{t:'qyBark',s:1,k:'wood'},qyWireG:{t:'qyWireG',s:1,k:'metal'},qyBush:{t:'qyBush',s:1,k:'soft'},
});
// ---------- textures ----------
// the evening sky: deep blue overhead going violet, rose, then orange low down and gold round the sun just over the western hills;
// streaks of cloud lit from beneath; a hazy far ridge round the horizon
function texQySky(){return paint(1024,256,P=>{const SU=53,SV=178,YH=232;
  const ridge=(x,s,f0)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=f0<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  const R1=new Float32Array(1024);for(let x=0;x<1024;x++)R1[x]=YH-8-ridge(x,13011,3)*34;
  for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/YH;let du=Math.abs(x-SU);du=Math.min(du,1024-du);
    const sw=Math.exp(-du/230)*.8+Math.exp(-du/60)*.4;
    let c=mix('#283466','#4e4a7c',clamp(t*1.5,0,1));c=mix(c,'#a86c8c',clamp((t-.42)*2.3,0,1)*(.45+sw*.55));c=mix(c,'#ee9c68',clamp((t-.64)*3,0,1)*(.3+sw*.7));
    c=mix(c,'#ffd08c',clamp((t-.78)*4.5,0,1)*sw);
    const d=Math.hypot(du,(y-SV)*2);c=mix(c,'#fff2cc',clamp(1-d/80,0,1)*.9);
    const cl=P.n(x,y*3.6,120,13001,4),cy=clamp((t-.16)*2.4,0,1)*clamp((.92-t)*4,0,1);
    if(cl>.56&&y<YH){const k=clamp((cl-.56)*5,0,1)*cy;c=mix(c,mix(mix('#463a5c','#76587a',t),mix('#ff9868','#ffc890',clamp(sw,0,1)),clamp((cl-.56)*3+sw*.4,0,1)),k*.85)}
    if(y>R1[x])c=mix(c,mix('#6a6284','#7a6e8a',clamp((y-R1[x])/30,0,1)),.78);
    if(y>=YH+3)c=mix('#3a3440','#24202a',clamp((y-YH)/24,0,1));
    P.set(x,y,c)}})}
// the quarry faces: grey granite flecked with feldspar and mica, a half-round drill trace every 1.3 m down the face (the holes that
// blasted it), joints, rust running down from them, lichen
function texQyRock(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,48,13101,4),m=P.n(x,y,12,13102,2),h=hash2(x,y,13103);
    let c=dith(P,x,y,.5+(n-.5)*.5+(m-.5)*.2,['#5e5c5a','#6a6866','#767472','#82807c','#8e8c88'],.1);
    if(h>.93)c=h>.975?'#3a3836':h>.955?'#a8968e':'#9a948e';
    const g=((x+Math.round((P.n(0,y,64,13104,2)-.5)*6))%85+85)%85,gd=Math.abs(g-42);if(gd<5){c=dk(c,(1-gd/5)*.34);if(gd>3&&g<42)c=lt(c,.14)}
    const ws=P.n(x,y,24,13105,3);if(ws>.66)c=mix(c,'#6e4a30',clamp((ws-.66)*2.5,0,.45));
    if(P.n(x,y,20,13106,3)>.75)c=mix(c,hash2(x>>3,y>>3,13107)<.5?'#8a8a5a':'#aaa89a',.5);
    P.set(x,y,c)}
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,13108)*N),Math.floor(hash2(i,2,13108)*N),60+Math.floor(hash2(i,3,13108)*80),13109+i,'#2a2826','#9a9690');
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,13110)*N),Math.floor(hash2(i,2,13110)*N),30+Math.floor(hash2(i,3,13110)*90),.16,2)})}
// the adit's roof and walls left rough: darker, wet, in blocks
function texQyRockC(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,13121,4),[f1,f2]=cellN(P,x,y,28,13122);
    let c=dith(P,x,y,.45+(n-.5)*.55,['#3a3836','#46443f','#52504a','#5e5c56'],.1);if(f2-f1<2)c=dk(c,.35);if(hash2(x,y,13123)>.985)c='#8a8a84';P.set(x,y,c)}})}
// the bench: blasted rock fines, stones lying on it
function texQyBench(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,36,13131,4),h=hash2(x,y,13132),[f1,,id]=cellN(P,x,y,10,13133);
    let c=dith(P,x,y,.5+(n-.5)*.45+(h-.5)*.3,['#5a5856','#666462','#72706c','#7e7c78','#8a8884'],.12);
    if(f1<3.2&&hash2(id,1,13134)<.4)c=dith(P,x,y,.6-f1/8+(hash2(id,2,13134)-.5)*.3,['#4e4c4a','#6e6c68','#8e8c86','#a09e98'],.08);
    if(P.n(x,y,60,13135,2)<.3)c=mix(c,'#6a5e4e',.25);P.set(x,y,c)}})}
// the pit floor: grey dust packed by the trucks, wet in the hollows, a glint here and there
function texQyFloor(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,13141,4),h=hash2(x,y,13142),w=P.n(x,y,72,13143,3);
    let c=dith(P,x,y,.52+(n-.5)*.4+(h-.5)*.25,['#626060','#6e6c6a','#7a7874','#86847e'],.12);
    if(w<.34){c=mix(c,'#3e4246',clamp((.34-w)*6,0,.75));if(w<.26&&hash2(x>>1,y>>1,13144)<.05)c=lt(c,.2)}
    if(h>.988)c=rpickH(x+y*3,['#9a9890','#4a4846','#b0aca2']);P.set(x,y,c)}})}
// the yard: grey-brown gravel, the odd weed
function texQyYard(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,44,13151,4),h=hash2(x,y,13152);
    let c=dith(P,x,y,.5+(n-.5)*.45+(h-.5)*.3,['#5a544a','#665f54','#726a5e','#7e7668','#8a8272'],.12);
    if(h>.975)c=rpickH(x*5+y,['#9a948a','#4a463e','#a8a296']);if(P.n(x,y,80,13153,2)>.7)c=mix(c,'#5a5a3a',.14);P.set(x,y,c)}})}
// the haul roads: darker, pressed hard, oil and puddle stains
function texQyRoad(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,13161,4),h=hash2(x,y,13162);
    let c=dith(P,x,y,.48+(n-.5)*.45+(h-.5)*.3,['#4a4642','#56524c','#625e56','#6e6a62','#7a766c'],.12);
    if(h>.97)c=rpickH(x+y*7,['#8a8680','#3a3632']);if(P.n(x,y,64,13163,2)<.3)c=mix(c,'#3a3834',.18);P.set(x,y,c)}})}
// dry grass and scrub over rock (the tops of the cliff and the outcrops)
function texQyScrub(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,16,13171,4),m=P.n(x,y,48,13173,3),r=P.n(x,y,64,13172,3),h=hash2(x,y,13174);
    let c=dith(P,x,y,.5+(n-.5)*.5+(m-.5)*.3+(h-.5)*.2,['#3a3a22','#464628','#545430','#626036','#706a3e','#7e7646'],.14);
    if(r>.64)c=mix(c,dith(P,x,y,.5+(n-.5)*.6,['#5e5c58','#6e6c66','#7e7c76'],.1),clamp((r-.64)*4,0,.75));P.set(x,y,c)}
  for(let i=0;i<1800;i++){const x=Math.floor(hash2(i,1,13175)*N),y=Math.floor(hash2(i,2,13175)*N),l=2+Math.floor(hash2(i,3,13175)*3),k=hash2(i,4,13175);
    for(let j=0;j<l;j++)P.set(x+(k<.3&&j>1?1:0),y-j,k<.5?'#8a8048':'#2e2e18',.55)}})}
// the adit's floor: trodden mud, standing water
function texQyAdit(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,13181,3);
    let c=dith(P,x,y,.45+(n-.5)*.5+(hash2(x,y,13182)-.5)*.2,['#2e2a26','#3a3530','#46403a','#524b44'],.12);if(n>.68)c=mix(c,'#3a4044',.5);P.set(x,y,c)}})}
// the pond: dark green water, ripples catching the evening sky
function texQyWater(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.07+P.n(x,y,48,13191,3)*6)*.5+.5,n=P.n(x,y,24,13192,2);
    let c=mix('#1c3034','#2e4a4c',w*.6+n*.3);if(w>.9&&n>.5)c=mix(c,'#d8a080',.45);P.set(x,y,c)}})}
// lock blocks (1.6 × .8 × .8): two courses a picture, the joints staggered, chipped arrises, dirt splashed up the bottom course
function texQyLock(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const row=y<64?0:1,xx=(x+(row?64:0))%W,bx=Math.floor(xx/128),lx=xx%128,ly=y%64;
    const e=Math.min(lx,127-lx,ly,63-ly);let c=dith(P,x,y,.55+(P.n(x,y,24,13201,3)-.5)*.3+(hash2(bx+row*7,1,13202)-.5)*.2,['#6e6c66','#7a7872','#86847e','#92908a'],.08);
    if(e<2)c=dk(c,.4);else if(e<4)c=dk(c,.12);if(hash2(x,y,13203)>.99)c='#4a4844';
    if(row===1&&ly>40&&P.n(x,y,8,13204,2)>.55)c=mix(c,'#5a5040',.4);P.set(x,y,c)}})}
// cut granite blocks: paler, sawn faces flecked like the rock
function texQyStone(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,13211,4),h=hash2(x,y,13212);
    let c=dith(P,x,y,.58+(n-.5)*.4,['#7a7672','#86827e','#928e8a','#9e9a94','#aaa69e'],.1);if(h>.94)c=h>.98?'#4a4644':h>.96?'#c0b0a6':'#b4aea4';
    if(P.n(x,y,16,13213,3)>.72)c=dk(c,.1);P.set(x,y,c)}})}
// crushed stone in a heap: fine grey grit, darker where it is damp
function texQyGravel(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,28,13216,3),h=hash2(x,y,13217);
    let c=dith(P,x,y,.5+(n-.5)*.35+(h-.5)*.5,['#55534f','#63615c','#71706a','#807e78','#8e8c86'],.14);if(P.n(x,y,64,13218,2)<.32)c=dk(c,.14);P.set(x,y,c)}})}
// the plant's steelwork: safety yellow, faded and chipped, rust running from the joints
function texQySteel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,13221,3);
    let c=dith(P,x,y,.5+(n-.5)*.3+(hash2(x,y,13222)-.5)*.08,['#a07a22','#b08a2a','#c09a34','#cca640'],.06);
    const r=P.n(x,y,12,13223,3);if(r>.66)c=mix(c,rpickH(x>>2,['#6a3a1e','#7a4422','#5a3018']),clamp((r-.66)*3,0,.85));if(P.n(x,y,6,13224,2)>.8)c='#5a5a56';P.set(x,y,c)}})}
// grey steel (frames, rails, the stairs)
function texQySteelG(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,13231,3);
    let c=dith(P,x,y,.5+(n-.5)*.3,['#4a4c4e','#56585a','#626466','#6e7072'],.06);if(P.n(x,y,12,13232,3)>.68)c=mix(c,'#6a3e22',.55);P.set(x,y,c)}})}
// open steel grating (the decks)
function texQyGrate(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const bar=x%8<2||y%16<2;let c=bar?dith(P,x,y,.5+(hash2(x,y,13241)-.5)*.3,['#5a5c5e','#6a6c6e','#7a7c7e'],.1):'#1e1e20';
    if(bar&&P.n(x,y,10,13242,2)>.7)c=mix(c,'#7a4a2a',.5);P.set(x,y,c)}})}
// the crusher house's sheeting: corrugated, weathered blue-grey, rusting up from the bottom
function texQyTin(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*8)*.5+.5;
    let c=dith(P,x,y,.3+r*.5+(P.n(x,y,24,13251,3)-.5)*.2,['#3e4a52','#4a5860','#56666e','#62727a','#6e7e86'],.08);
    const rs=P.n(x,y,16,13252,3);if(rs>.6||(y>110&&rs>.48))c=mix(c,rpickH(x>>3,['#7a4a24','#8a5428','#6a3a1c']),clamp((rs-.48)*2.5,0,.85));P.set(x,y,c)}})}
// conveyor belt rubber
function texQyBelt(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.4+(hash2(x,y,13261)-.5)*.2+(y%8<2?-.15:0),['#1a1a1a','#242424','#2e2e2e'],.1);if(P.n(x,y,8,13262,2)>.7)c=mix(c,'#6a6660',.4);P.set(x,y,c)}})}
// the adit's props: old dark timber
function texQyTimber(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const t=.42+Math.sin(x*.5+P.n(x,y,8,13271,2)*4)*.12+(hash2(x,y,13272)-.5)*.12;
  P.set(x,y,dith(P,x,y,t,['#2a2016','#36291c','#423222','#4e3b28'],.1))}})}
// the office's lining: plywood panels gone yellow
function texQyPanel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.6+(P.n(x,y,30,13281,3)-.5)*.15,['#a8a08c','#b4ac98','#c0b8a4'],.05);if(x%64<1)c=dk(c,.25);P.set(x,y,c)}})}
// the office's floor: worn vinyl tiles
function texQyFloorI(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.5+(P.n(x,y,24,13291,3)-.5)*.25,['#4a4a3e','#56564a','#626256'],.06);if((x%32<1)||(y%32<1))c=dk(c,.2);P.set(x,y,c)}})}
// a desk top / shelf: laminate, scuffed
function texQyDesk(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,.5+(P.n(x,y,16,13295,2)-.5)*.3,['#6a5a44','#76664e','#827258'],.06))})}
// the portable toilet's side: blue plastic, a vent, the door with its lock
function texQyLoo(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,13297)-.5)*.1,['#2a5a9a','#3066a8','#3672b4'],.05);
  if(x<3||x>60)c='#1e4a80';if(y<14&&y>6&&x>20&&x<44&&(x%4)<2)c='#1a3a6a';if(x>48&&x<54&&y>56&&y<64)c='#c03028';P.set(x,y,c)}})}
// the backdrop's hillsides: dark scrub and pines, rock breaking through
function texQyHill(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,6,13301);
  let c=mix(rpickH(id,['#1e2a1a','#24301e','#2a3622','#323a26','#26301e']),'#101a0e',clamp(f1/5,0,1)*.5);if(P.n(x,y,40,13302,3)>.6)c=mix(c,'#6a6660',.6);P.set(x,y,c)}})}
// scrub bushes: olive and khaki clumps
function texQyBush(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,6,13305);
  P.set(x,y,mix(rpickH(id,['#3a4024','#46482a','#525030','#3e4426']),'#1a1e10',clamp(f1/5,0,1)*.55))}})}
// signs
function texQySignGate(){return drBoard(512,128,'#2e3236','#e8e4d0',x=>{x.fillStyle='#f4f0e0';x.textAlign='center';x.textBaseline='middle';x.font='bold 56px '+DR_FONT;x.fillText('회색 채석장',256,52);
  x.font='bold 20px '+DR_FONT;x.fillText('GREY  QUARRY',256,102)})}
function texQySignBlast(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c='#f2efe6';if(y<44)c='#c0281e';if(x<4||x>251||y<4||y>123)c='#3a1a14';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffffff';x.font='bold 28px '+DR_FONT;x.fillText('발파 작업 구역',128,24);x.fillStyle='#c0281e';x.font='bold 22px '+DR_FONT;
    x.fillText('관계자 외 출입 금지',128,70);x.fillStyle='#3a3a36';x.font='bold 15px '+DR_FONT;x.fillText('BLASTING AREA · KEEP OUT',128,102)}})}
function texQySignFall(){return paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++){let c='#e8c020';if((x+y)%40<20&&(y<12||y>83))c='#1a1a18';if(x<3||x>252||y<3||y>92)c='#1a1a18';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#1a1a18';x.font='bold 30px '+DR_FONT;x.fillText('추락 주의',128,40);x.font='bold 15px '+DR_FONT;x.fillText('DANGER · STEEP DROP',128,68)}})}
function texQySignMag(){return drBoard(256,96,'#6a1a14','#d8d0b8',x=>{x.fillStyle='#f4e8d0';x.textAlign='center';x.textBaseline='middle';x.font='bold 34px '+DR_FONT;x.fillText('화 약 고',128,38);
  x.font='bold 16px '+DR_FONT;x.fillText('화기 엄금 · NO NAKED FLAME',128,74)})}
function texQySignCr(){return drBoard(256,64,'#e8e2d0','#2a2e32',x=>{x.fillStyle='#24282c';x.textAlign='center';x.textBaseline='middle';x.font='bold 28px '+DR_FONT;x.fillText('제1 쇄석기',128,34)})}
function texQySignOff(){return drBoard(256,64,'#2a4a7a','#e8e4d0',x=>{x.fillStyle='#f4f0e0';x.textAlign='center';x.textBaseline='middle';x.font='bold 26px '+DR_FONT;x.fillText('현장 사무소',128,34)})}
function texQySignSafe(){return paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++){let c='#f4f0e6';if(x<4||x>251||y<4||y>91)c='#1e6a3a';const cx=x-44,cy=y-48;if(Math.abs(cx)<26&&Math.abs(cy)<26)c='#1e7a3e';if((Math.abs(cx)<8&&Math.abs(cy)<20)||(Math.abs(cy)<8&&Math.abs(cx)<20))c='#f4f0e6';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#1e6a3a';x.font='bold 34px '+DR_FONT;x.fillText('안전 제일',164,40);x.font='bold 15px '+DR_FONT;x.fillText('SAFETY FIRST',164,72)}})}
function bakeQuarryTex(){if(TEX.qyRock)return;
  TEX.qySky=mkTex(texQySky());TEX.qySky.wrapT=THREE.ClampToEdgeWrapping;TEX.qySky.magFilter=THREE.LinearFilter;
  if(!TEX.sunDisc&&typeof texSunDisc==='function'){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  for(const [k,f] of [['qyRock',texQyRock],['qyRockC',texQyRockC],['qyBench',texQyBench],['qyFloor',texQyFloor],['qyYard',texQyYard],['qyRoad',texQyRoad],['qyScrub',texQyScrub],
      ['qyAdit',texQyAdit],['qyWater',texQyWater],['qyLock',texQyLock],['qyStone',texQyStone],['qyGravel',texQyGravel],['qySteel',texQySteel],['qySteelG',texQySteelG],['qyGrate',texQyGrate],
      ['qyTin',texQyTin],['qyBelt',texQyBelt],['qyTimber',texQyTimber],['qyPanel',texQyPanel],['qyFloorI',texQyFloorI],['qyDesk',texQyDesk],['qyHill',texQyHill],['qyBush',texQyBush]])TEX[k]=mkTex(f());
  for(const [k,f] of [['qyLoo',texQyLoo],['qySignGate',texQySignGate],['qySignBlast',texQySignBlast],['qySignFall',texQySignFall],['qySignMag',texQySignMag],['qySignCr',texQySignCr],
      ['qySignOff',texQySignOff],['qySignSafe',texQySignSafe]])TEX[k]=mkTex(f(),false);
  TEX.qyGlassT=mkTex(texDrGlassT(),false);TEX.qyLocker=mkTex(texDrLocker(),false);TEX.qyTruck=mkTex(texCarPaint('#c8961e'));TEX.qyPine=mkTex(texDrPine());TEX.qyBark=mkTex(texDrBark());TEX.qyWireG=mkTex(texDrWireG());
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['qyBench','qyFloor','qyYard','qyRoad'])TEX[k].anisotropy=an}
// ---------- the map ----------
// (x east, z south. The pit x -32..32, z -42..-4: the bench (-4) all round, the floor (-8) x -22..20, z -34..-12. The back wall z < -42
// up to 12, the adit in it at x -14..-11. The rim strips x ±(32..44) beside the pit, the yard z -4..42 south of it, the fence at z 42)
const QY={pines:[],bars:[],cones:[],wheels:[],rocks:[],bush:[],tanks:[],ledge:[]};
function buildQuarry(){const CV={nosolid:true},PS={pass:1};for(const k in QY)QY[k]=[];
  const {bar,tst,hrail,rail}=stairKit(QY.bars,'qySteelG');
  const G={ground:1};
  // a heap of crushed stone you can climb: a cone drawn by qyMesh over tiers of invisible boxes .35 high (each tier a cross and a square
  // turned to make it round), every tier a stair so the nav steps up it
  const pile=(x,z,y,r,h)=>{const n=Math.round(h/.35),dh=h/n;let top=y;
    for(let k=0;k<n;k++){const rk=r*(1-(k+.55)/n);if(rk<.45)break;top=y+(k+1)*dh;const o={stair:1};
      B(x-rk*.94,y+k*dh,z-rk*.38,x+rk*.94,top,z+rk*.38,'tirex',o);B(x-rk*.38,y+k*dh,z-rk*.94,x+rk*.38,top,z+rk*.94,'tirex',o);B(x-rk*.72,y+k*dh,z-rk*.72,x+rk*.72,top,z+rk*.72,'tirex',o)}
    QY.cones.push([x,y,z,r,h,top-y]);return top};
  // lock blocks along a line (axis-aligned), courses of .8, gaps where asked; a rough stone block
  const lock=(x0,z0,x1,z1,h,y)=>B(x0,y||0,z0,x1,(y||0)+h,z1,'qyLock');
  const blk=(x,z,y,sx,sy,sz)=>B(x-sx/2,y,z-sz/2,x+sx/2,y+sy,z+sz/2,'qyStone');
  // a boulder: a lump drawn by qyMesh round a box you bump into (kept inside the lump)
  const rock=(x,y,z,s,sy)=>{sy=sy||s*.7;QY.rocks.push([x,y,z,s,sy,QY.rocks.length]);B(x-s*.55,y,z-s*.55,x+s*.55,y+sy*1.25,z+s*.55,'tirex')};
  const pine=(x,z,y,s,solid)=>{s=s||1;y=y||0;QY.pines.push([x,y,z,s]);if(solid)B(x-.2*s,y,z-.2*s,x+.2*s,y+6.5*s,z+.2*s,'tirex')};
  const lamp=(x,z,y,col,r,i)=>{y=y||0;B(x-.1,y,z-.1,x+.1,y+7,z+.1,'qySteelG');B(x-.06,y+6.86,z-.7,x+.06,y+6.96,z+.06,'qySteelG',CV);B(x-.2,y+6.7,z-.95,x+.2,y+6.86,z-.55,'lampO',CV);LIGHT(x,y+6.4,z-.75,col||'#ffb460',r||14,i||.55)};
  // ================= the ground: every box down to -12, so only faces that show are drawn =================
  // the yard and the rim (y 0): the haul road from the gate north (x -3..3) and along the pit's south edge (z -4..2)
  B(-44,-12,-42,-32,0,-4,'qyYard',G);B(32,-12,-42,44,0,-4,'qyYard',G);
  B(-44,-12,-4,-32,0,2,'qyYard',G);B(-32,-12,-4,32,0,2,'qyRoad',G);B(32,-12,-4,44,0,2,'qyYard',G);
  B(-44,-12,2,-3,0,46,'qyYard',G);B(-3,-12,2,3,0,46,'qyRoad',G);B(3,-12,2,44,0,46,'qyYard',G);
  // the bench (y -4) all round the pit
  B(-32,-12,-42,32,-4,-34,'qyBench',G);B(-32,-12,-12,32,-4,-4,'qyBench',G);B(-32,-12,-34,-22,-4,-12,'qyBench',G);B(20,-12,-34,32,-4,-12,'qyBench',G);
  // the floor (y -8), the pond (its water a quarter metre down) in its north-west corner
  B(-12,-12,-34,20,-8,-12,'qyFloor',G);B(-22,-12,-27,-12,-8,-12,'qyFloor',G);B(-22,-12,-34,-12,-8.25,-27,'qyWater',G);
  // the back wall (z < -42, up to 12), the adit cut into it at the bench's level; rock outcrops along the east and west edges
  B(-48,-12,-62,48,-4,-42,'qyRock',{ground:1,f:{py:'qyAdit'}});
  slab(-48,-62,48,-42,-4,-1,'qyRock',[[-14,-54,-11,-42],[-10.6,-53,-5,-47],[-11,-51.3,-10.6,-49.7]],{f:{}});
  // above the adit the wall goes up in three faces (to 2, 7 and 12), each set back from the one below by 2-3 m: ledges of fallen rock
  // between them, the setbacks changing from one stretch of the wall to the next
  B(-48,-1,-62,48,2,-42,'qyRock',{f:{py:'qyBench',ny:'qyRockC'}});
  {const XS=[-48,-37,-26,-15,-3,9,21,33,48],S2=[2.6,3.2,2.2,2.8,2.4,3.4,2.5,2.9],S3=[2.4,1.9,3,2.3,2.8,2,2.7,2.2];
    for(let i=0;i<XS.length-1;i++){const z2=-42-S2[i],z3=z2-S3[i];B(XS[i],2,-62,XS[i+1],7,z2,'qyRock',{f:{py:'qyBench'}});B(XS[i],7,-62,XS[i+1],12,z3,'qyRock',{f:{py:'qyScrub'}});
      QY.ledge.push([XS[i],XS[i+1],z2,z3])}}
  const OC=[[-42,-20,9,9.8],[-20,4,7.5,8.3],[4,26,8.5,7.9],[26,46.01,6,5.4]];for(const [z0,z1,hw,he] of OC){B(-48,-12,z0,-44,hw,Math.min(z1,46),'qyRock',{ground:1,f:{py:'qyScrub'}});B(44,-12,z0,48,he,Math.min(z1,46),'qyRock',{ground:1,f:{py:'qyScrub'}})}
  // a few buttresses standing out of the pit's faces (their tops part of the level above)
  for(const [x0,z0,x1,z1,y,m] of [[-32,-31,-30.8,-27,0,'qyYard'],[30.6,-32,32,-28,0,'qyYard'],[-21,-5.2,-16,-4,0,'qyRoad'],[9,-5,13,-4,0,'qyRoad'],
      [-22,-26,-20.8,-23,-4,'qyBench'],[13,-34,18,-32.8,-4,'qyBench'],[18.8,-18,20,-14,-4,'qyBench'],[-6,-13.1,-2,-12,-4,'qyBench']])B(x0,-12,z0,x1,y,z1,'qyRock',{ground:1,f:{py:m}});
  // ================= the ways between the levels =================
  // haul ramp 1, rim → bench, down the pit's south-east corner (x 26..32, z -16..-4); haul ramp 2, bench → floor, west off the east bench
  stairs('z',26,32,-16,-4,-4,0,20,'qyRoad');stairs('x',-26,-20,8,20,-8,-4,20,'qyRoad');
  // steel stairs: west rim → west bench, west bench → floor, floor → north bench (each 1.6 m wide on a half-metre, ten treads)
  tst('x',-20.3,-18.7,-25.25,-32,-4,0,10,'qySteelG');hrail('x',-20.36,-20.3,-25.25,-32,-4,0,10);hrail('x',-18.7,-18.64,-25.25,-32,-4,0,10);
  tst('x',-16.3,-14.7,-15.25,-22,-8,-4,10,'qySteelG');hrail('x',-16.36,-16.3,-15.25,-22,-8,-4,10);hrail('x',-14.7,-14.64,-15.25,-22,-8,-4,10);
  tst('z',1.7,3.3,-27.25,-34,-8,-4,10,'qySteelG');hrail('z',1.64,1.7,-27.25,-34,-8,-4,10);hrail('z',3.3,3.36,-27.25,-34,-8,-4,10);
  // ================= the adit: a prospect tunnel into the back wall at the bench, timbered, rails along it, a store room off it =================
  {const Y=-4;for(const x of [-14,-11.2])B(x,Y,-42.3,x+.2,-1.2,-42,'qyTimber');B(-14.25,-1.25,-42.35,-10.75,-.95,-41.95,'qyTimber');
    for(let z=-44.4;z>-54;z-=2.4){for(const x of [-14,-11.2])B(x,Y,z-.1,x+.2,-1.25,z+.1,'qyTimber');B(-14,-1.25,z-.12,-11,-1,z+.12,'qyTimber',CV)}
    for(let z=-42.4;z>-54;z-=.7)B(-13.1,Y,z-.08,-11.9,Y+.04,z+.08,'qyTimber',CV);for(const x of [-12.85,-12.15])B(x-.035,Y+.04,-54,x+.035,Y+.1,-42,'qySteelG',CV);
    // an ore cart on the rails, the store room's doorway in the tunnel's east wall, its sign
    B(-13,Y+.1,-46.2,-12,Y+1.05,-44.4,'qySteelG');B(-13.06,Y+.95,-46.26,-11.94,Y+1.08,-44.34,'qySteel',CV);
    B(-11.02,-2.2,-51.4,-10.98,-1.7,-49.6,'qySignMag',CV);
    // the store room: empty powder boxes, a shelf, a broken lamp; bulbs along the tunnel
    for(const [x,z,s,k] of [[-9.6,-52.2,.9,2],[-8.4,-52.3,.9,1],[-5.8,-48.2,.9,2],[-5.8,-49.3,.8,1]])for(let i=0;i<k;i++)crate(x,z,s,Y+i*s,i%2?'qyDesk':'wood');
    B(-10.4,Y+1.2,-47.4,-7.6,Y+1.26,-47.04,'qyDesk');B(-10.4,Y,-47.4,-10.3,Y+1.2,-47.3,'qyTimber');B(-7.7,Y,-47.4,-7.6,Y+1.2,-47.3,'qyTimber');
    for(const [z,i] of [[-44.4,.6],[-49.2,.55],[-53,.5]]){B(-12.56,-1.38,z-.06,-12.44,-1.26,z+.06,'lampO',CV);LIGHT(-12.5,-1.7,z,'#ffc070',7,i)}
    B(-8.06,-1.56,-50.06,-7.94,-1.44,-49.94,'lampO',CV);LIGHT(-8,-1.9,-50,'#ffb060',6,.5);
    B(-11.2,-1.32,-54,-11.16,-1.28,-42,'qyBelt',CV)}
  // ================= the crusher tower on the east rim: decks at 4.5 (x 35..42, z -36..-26) and 9 (z -36..-27), the crusher house on top =================
  {const L1=4.5,L2=9,ST='qySteel';for(const [x,z] of [[35,-36],[41.7,-36],[35,-31.2],[41.7,-31.2],[35,-26.3],[41.7,-26.3]])B(x,0,z,x+.3,12.35,z+.3,ST);
    for(const y of [2.2,6.8])for(const [x0,z0,x1,z1] of [[35.3,-35.9,41.7,-35.8],[35.3,-26.2,41.7,-26.1],[35.08,-35.7,35.2,-26.3],[41.82,-35.7,41.94,-26.3]])B(x0,y,z0,x1,y+.14,z1,ST,CV);
    bar(35.15,.2,-35.7,35.15,L1-.3,-31.3,.1,.1,ST);bar(35.15,.2,-26.4,35.15,L1-.3,-31.1,.1,.1,ST);bar(41.85,.2,-35.7,41.85,L1-.3,-31.3,.1,.1,ST);bar(41.85,.2,-26.4,41.85,L1-.3,-31.1,.1,.1,ST);
    B(35,L1-.2,-36,42,L1,-26,'qySteelG',{f:{py:'qyGrate'}});slab(35,-36,42,-27,L2-.2,L2,'qySteelG',[[35.7,-34,37.3,-27]],{f:{py:'qyGrate'}});
    // flight 1 up from the rim on the south side, flight 2 up through the upper deck
    // (twelve treads each: a rise of .375, so a metre of the flight never climbs more than the nav's .9 between two cells)
    tst('z',39.7,41.3,-19.25,-26,0,L1,12,ST);hrail('z',39.64,39.7,-19.25,-26,0,L1,12,ST);hrail('z',41.3,41.36,-19.25,-26,0,L1,12,ST);
    tst('z',35.7,37.3,-27.25,-34,L1,L2,12,ST);hrail('z',35.64,35.7,-27.25,-34,L1,L2,12,ST);hrail('z',37.3,37.36,-27.25,-34,L1,L2,12,ST);
    rail(35,-36,35.06,-26,L1,1.1,ST);rail(41.94,-36,42,-26,L1,1.1,ST);rail(35.06,-36,41.94,-35.94,L1,1.1,ST);rail(35.06,-26.06,39.64,-26,L1,1.1,ST);rail(41.36,-26.06,41.94,-26,L1,1.1,ST);
    rail(35,-36,35.06,-27,L2,1.1,ST);rail(35.06,-36,37.9,-35.94,L2,1.1,ST);rail(35.06,-27.06,37.9,-27,L2,1.1,ST);rail(37.9,-27.06,42,-27,L2,1.1,ST);
    // the crusher house: sheeted walls with windows on every side, its door at the stair head, the jaw crusher and its motor inside
    const W='qyTin',H0=L2,H1=L2+3.2;wallZ(37.9,38,-36,-27.66,H0,H1,W,[[-35.8,-34.2,H0,H0+2.3],[-31.6,-29.4,H0+1.2,H0+2.4]]);
    wallX(38,42,-36,-35.9,H0,H1,W,[[38.7,41.3,H0+1.2,H0+2.4]]);wallX(38,42,-27.76,-27.66,H0,H1,W,[[38.7,41.3,H0+1.2,H0+2.4]]);wallZ(41.9,42,-35.9,-27.76,H0,H1,W,[[-34.4,-29.2,H0+1.2,H0+2.4]]);
    B(37.7,H1,-36.2,42.2,H1+.15,-27.46,W,{f:{ny:'qySteelG'}});B(38.1,H0+2.5,-35.92,40,H0+3,-35.88,'qySignCr',CV);
    B(39.5,H0,-33,41.6,H0+1.6,-30,ST);B(39.3,H0+1.6,-33.2,41.8,H0+2.1,-29.8,'qySteelG');B(40.8,H0,-29.3,41.8,H0+.8,-28.1,'qySteelG');
    B(39.96,H1-.1,-31.56,40.04,H1-.02,-31.44,'lampO',CV);LIGHT(40,H1-.5,-31.5,'#ffd8a0',7,.6);
    // the dump hopper at the rim's edge beside the tower, on legs; the conveyor from the house down to the stockpile (for looks)
    for(const [x,z] of [[32.4,-33.2],[34.6,-33.2],[32.4,-29.8],[34.6,-29.8]])B(x-.12,0,z-.12,x+.12,1.4,z+.12,ST);B(32.2,1.4,-33.5,34.9,3.4,-29.5,ST);B(32.3,3.4,-33.4,34.8,3.5,-29.6,'qySteelG',{nosolid:true});
    const C0=[40.2,H1-.6,-27.7],C1=[31.5,7.3,21.2];for(const dx of [-.55,.55])bar(C0[0]+dx,C0[1],C0[2],C1[0]+dx,C1[1],C1[2],.08,.5,'qySteelG');bar(C0[0],C0[1]+.08,C0[2],C1[0],C1[1]+.08,C1[2],.9,.06,'qyBelt');
    bar(C0[0],C0[1]+.7,C0[2],C1[0],C1[1]+.7,C1[2],1.3,.05,'qyTin');
    for(const t of [.2,.42,.64,.86]){const x=lerp(C0[0],C1[0],t),y=lerp(C0[1],C1[1],t),z=lerp(C0[2],C1[2],t);for(const dx of [-.7,.7]){B(x+dx-.1,0,z-.1,x+dx+.1,y-.3,z+.1,'qySteelG')}B(x-.8,y-.42,z-.1,x+.8,y-.3,z+.1,'qySteelG',CV)}
    LIGHT(37.5,3.6,-31,'#ffb460',9,.45)}
  // ================= the site office (west yard): two containers side by side, a third on top, a stair to its roof; the office inside the south one =================
  {const X0=-42,X1=-30,Z0=4,Z1=6.4,H=2.6,T=.1;
    // the office: steel shell (blue) lined inside, its doors open at the east end, two windows in the south side
    B(X0,0,Z0,X1,.1,Z1,'contB',{f:{py:'qyFloorI'}});
    wallX(X0,X1,Z0,Z0+T,.1,H-T,'contB',[[-38.2,-36.6,1,1.9],[-34.2,-32.6,1,1.9]],{f:{pz:'qyPanel'}});wallX(X0,X1,Z1-T,Z1,.1,H-T,'contB',[],{f:{nz:'qyPanel'}});
    wallZ(X0,X0+T,Z0+T,Z1-T,.1,H-T,'contB',[],{f:{px:'qyPanel'}});wallZ(X1-T,X1,Z0+T,Z1-T,.1,H-T,'contB',[[4.2,5.8,.1,2.3]],{f:{nx:'qyPanel'}});
    B(X0,H-T,Z0,X1,H,Z1,'contB',{f:{ny:'qyPanel'}});
    for(const [a,b] of [[-38.2,-36.6],[-34.2,-32.6]])B(a,1,Z0+.04,b,1.9,Z0+.07,'qyGlassT',PS);
    B(X1,.1,Z0-.06,X1+1.15,2.3,Z0,'contB',CV);B(X1,.1,Z1,X1+1.15,2.3,Z1+.06,'contB',CV);
    B(-41.9,.1,Z0+.3,-41.1,.85,Z1-.3,'qyDesk');B(-40.9,.1,4.95,-40.4,.6,5.45,'qyDesk');B(-33.6,.1,Z1-.6,-32.8,2,Z1-T,'qySteelG',{f:{nz:'qyLocker'}});B(-36,.1,Z1-.6,-34.4,1.2,Z1-T,'qyDesk');
    B(-39.66,H-T-.08,5.14,-38.34,H-T-.02,5.26,'lampW',CV);LIGHT(-39,H-.5,5.2,'#f4f8ff',6,.5);B(-31.8,2,Z0-.04,-30.2,2.4,Z0,'qySignOff',CV);
    // the storeroom container beside it, the one on top (its roof the lookout), the stair up the south side to a landing at the roof's edge
    B(X0,0,Z1,X1,H,8.8,'contR');B(X0,H,Z0,X1,H*2,Z1,'contG');
    const RY=H*2;B(-36,RY-.2,1.7,-34,RY,Z0,'qySteelG',{f:{py:'qyGrate'}});for(const [x,z] of [[-36,1.7],[-34.12,1.7]])B(x,0,z,x+.12,RY-.2,z+.12,'qySteelG');
    tst('x',1.7,3.3,-26.2,-34,0,RY,13,'qySteelG');hrail('x',1.64,1.7,-26.2,-34,0,RY,13);hrail('x',3.3,3.36,-26.2,-34,0,RY,13);
    rail(-36,1.7,-35.94,Z0,RY,1.1);rail(-35.94,1.64,-34,1.7,RY,1.1);rail(-34.06,3.36,-34,Z0,RY,1.1);
    rail(X0,Z0,X0+.06,Z1,RY,1.1);rail(X1-.06,Z0,X1,Z1,RY,1.1);rail(X0+.06,Z1-.06,X1-.06,Z1,RY,1.1);rail(X0+.06,Z0,-36,Z0+.06,RY,1.1);rail(-34,Z0,X1-.06,Z0+.06,RY,1.1);
    // the portable toilet, a fuel tank on a stand, drums
    B(-27.4,0,8.2,-26.2,2.3,9.4,'qyLoo');B(-27.5,2.3,8.1,-26.1,2.42,9.5,'qySteelG');
    QY.tanks.push({x0:-28.4,x1:-24.6,z:12.2,y:1.75,r:.75});for(const x of [-28,-25])B(x-.15,0,11.7,x+.15,1.06,12.7,'qySteelG');B(-28.4,1.5,11.72,-24.6,2,12.68,'metalx');B(-28.4,1.08,11.92,-24.6,2.42,12.48,'metalx');
    for(const [x,z,m] of [[-23.6,13.6,'drumB'],[-23,12.8,'drumR'],[-22.4,13.7,'drumB']])drum(x,z,0,m)}
  // ================= the stockpiles (south-east yard): three heaps of crushed stone, the conveyor's head over the middle one =================
  const PT=[pile(20,15,0,7.2,4.7),pile(31.5,24,0,6.6,4.4),pile(15,32,0,5.4,3.5)];
  // ================= the lock-block bays (south-west yard): three bays open to the north, a heap of sand in each, spare blocks =================
  {for(const x of [-28,-22,-16,-10.8])lock(x,28,x+.8,36,2.4);lock(-28,35.2,-10,36,2.4);
    for(const [x,z] of [[-25,32],[-19,32.4],[-13.4,31.8]])pile(x,z,0,2.4,1.2);
    lock(-6.8,26,-5.2,26.8,.8);lock(-6.8,27.6,-5.2,28.4,.8);lock(-7.6,29.2,-6.8,30.8,.8);lock(-31.8,24,-30.2,24.8,.8);lock(-31.8,25.6,-30.2,26.4,.8);lock(-31.8,24,-30.2,24.8,.8,.8);
    B(-20.2,1.1,35.14,-17,2.3,35.2,'qySignSafe',CV)}
  // ================= the haul truck (parked in the yard facing west): its bed full, a stairway up its front to the deck =================
  {const x0=4,z0=2.6,z1=8.6,DY=3;
    B(x0+.6,.9,z0+1.6,14,DY-.2,z1-1.6,'qySteelG');B(x0+3.2,DY-.2,z0,14,5.4,z1,'qyTruck',{f:{py:'qyGravel'}});
    B(x0+3.2,5.4,z0,14,5.95,z0+.3,'qyTruck');B(x0+3.2,5.4,z1-.3,14,5.95,z1,'qyTruck');B(13.7,5.4,z0+.3,14,5.95,z1-.3,'qyTruck');B(x0+3.2,5.4,z0+.3,x0+3.6,6.3,z1-.3,'qyTruck');
    B(x0,5.4,z0,x0+3.6,5.7,z1,'qyTruck');
    B(x0,DY-.2,z0,x0+3.2,DY,z1,'qySteelG',{f:{py:'qyGrate'}});B(x0+.6,DY,z0,x0+3.2,DY+2.2,z0+2.4,'qyTruck',{f:{nx:'carGl',pz:'carGl'}});B(x0+.3,1,z0+1.4,x0+.6,DY-.2,z1-1.4,'qySteelG');
    for(const [x,z,r,w] of [[6.2,3.1,1.3,1],[6.2,8.1,1.3,1],[12,3.1,1.35,1.5],[12,8.1,1.35,1.5]]){QY.wheels.push([x,r,z,w]);B(x-r*.8,0,z-w/2,x+r*.8,r*1.8,z+w/2,'tirex')}
    tst('z',4.7,6.3,13.1,z1,0,DY,7,'qySteelG');hrail('z',4.64,4.7,13.1,z1,0,DY,7);hrail('z',6.3,6.36,13.1,z1,0,DY,7);
    rail(x0,z0,x0+.06,z1,DY,1.1);rail(x0+.06,z0,x0+.6,z0+.06,DY,1.1);rail(x0+.06,z1-.06,4.64,z1,DY,1.1);rail(6.36,z1-.06,x0+3.2,z1,DY,1.1)}
  // ================= in the open yard: cut blocks waiting on their pallets, an L of lock blocks, a wheel loader by the stockpiles =================
  {for(const [x,z] of [[-19,6],[-11,9.5],[-24,19]]){B(x-1.3,0,z-.7,x+1.3,.14,z+.7,'woodP');blk(x-.55,z,.14,1,1,1.2);blk(x+.6,z,.14,1.1,1,1.2);blk(x,z,1.14,2,.9,1)}
    lock(8,22.4,12.8,23.2,1.6);lock(8,23.2,8.8,26.4,1.6);lock(-8,-1.2,-4.8,-.4,.8);
    const LX=30,LZ=5;B(LX-2.6,.8,LZ-1.1,LX+1.6,2,LZ+1.1,'qyTruck');B(LX+1.6,.8,LZ-1.1,LX+2.8,1.8,LZ+1.1,'qySteelG');B(LX-2.4,2,LZ-.9,LX-.6,3.6,LZ+.9,'qyTruck',{f:{nx:'carGl',px:'carGl',pz:'carGl',nz:'carGl'}});
    B(LX-2.6,3.6,LZ-1.05,LX-.4,3.76,LZ+1.05,'qyTruck');B(LX-4.6,0,LZ-1.4,LX-3.3,1.1,LZ+1.4,'qySteelG');bar(LX-2.6,1.4,LZ-.7,LX-3.9,.7,LZ-.7,.16,.26,'qySteelG');bar(LX-2.6,1.4,LZ+.7,LX-3.9,.7,LZ+.7,.16,.26,'qySteelG');
    for(const [x,z] of [[LX-1.8,LZ-1.3],[LX-1.8,LZ+1.3],[LX+1.4,LZ-1.3],[LX+1.4,LZ+1.3]]){QY.wheels.push([x,.85,z,.6]);B(x-.65,0,z-.3,x+.65,1.5,z+.3,'tirex')}}
  // ================= the weighbridge on the road by the gate, the scale house beside it =================
  {B(-2.6,0,28,2.6,.12,36,'qySteelG',{f:{py:'qyGrate'}});
    wallX(4,8,30,30.15,0,2.6,'qyPanel',[[4.6,7.4,1,2]]);wallX(4,8,33.85,34,0,2.6,'qyPanel',[]);wallZ(4,4.15,30.15,33.85,0,2.6,'qyPanel',[[30.6,33.4,1,2]]);wallZ(7.85,8,30.15,33.85,0,2.6,'qyPanel',[[31.2,32.8,0,2.2]]);
    B(3.7,2.6,29.7,8.3,2.78,34.3,'qyTin',{f:{ny:'qyPanel'}});B(4.6,1,30.07,7.4,2,30.1,'qyGlassT',PS);B(4.07,1,30.6,4.1,2,33.4,'qyGlassT',PS);
    B(4.15,0,30.8,5,.85,33.2,'qyDesk');B(4.3,.85,31.6,4.6,1.15,32.2,'qySteelG',CV);B(6.8,2.24,31.94,7.2,2.3,32.06,'lampW',CV);LIGHT(6,2.2,32,'#f8f4e8',5,.45)}
  // ================= the gate in the fence (closed), the fence along the south; signs at the pit's edge =================
  {B(-4.4,0,41.6,-3.6,5.4,42.4,'conc');B(3.6,0,41.6,4.4,5.4,42.4,'conc');B(-4.4,5.4,41.6,4.4,6.2,42.4,'conc');B(-3.4,5.45,41.56,3.4,6.15,41.6,'qySignGate',CV);B(-3.4,5.45,42.4,3.4,6.15,42.44,'qySignGate',CV);
    B(-3.6,0,41.9,3.6,2.4,42.1,'fence',PS);for(const x of [-3.6,-1.2,1.1,3.5])B(x,0,41.88,x+.1,2.42,42.12,'qySteelG');B(-3.6,2.3,41.88,3.6,2.42,42.12,'qySteelG');
    const H=2.6,fx=(x0,x1)=>{B(x0,0,41.985,x1,H,42.015,'fence',PS);for(let x=x0;x<=x1+.01;x+=2.6)B(Math.min(x,x1-.12),0,41.94,Math.min(x,x1-.12)+.12,H+.1,42.06,'qySteelG')};
    fx(-44,-4.4);fx(4.4,44);
    B(-1.6,1.5,-3.2,1.6,2.7,-3.16,'qySignFall',CV);for(const x of [-1.5,1.4])B(x,0,-3.26,x+.1,2.7,-3.16,'qySteelG');
    B(23.4,1.6,-3.6,25.8,2.8,-3.56,'qySignBlast',CV);for(const x of [23.5,25.6])B(x,0,-3.66,x+.1,2.8,-3.56,'qySteelG');
    B(-34.04,1.6,-24.4,-34,2.8,-21.6,'qySignFall',CV);for(const z of [-24.3,-21.8])B(-34.1,0,z,-34,2.8,z+.1,'qySteelG')}
  // ================= along the pit's edge: lock-block windrows (gaps every few blocks), cut blocks and boulders on the bench and the floor =================
  {for(const [a,b] of [[-31.4,-26.6],[-24.8,-20],[-18.2,-13.4],[-11.6,-6.8],[-4.6,-1.8],[1.8,4.6],[6.8,11.6],[13.4,18.2],[20,23.2]])lock(a,-4,b,-3.2,.8);
    for(let z=-41;z<-5;z+=6.4)if(z+4.8<-21||z>-18)lock(-32.8,z,-32,Math.min(z+4.8,-4.6),.8);for(let z=-25;z<-5;z+=6.4)lock(32,z,32.8,Math.min(z+4.8,-4.6),.8);
    // cut blocks (a few stacks, to stand behind) on the floor and the benches
    for(const [x,z,y,sx,sy,sz] of [[-5,-30,-8,2,1,1],[-5,-30,-7,2,1,1],[-3.2,-30.2,-8,1.2,1.2,1.2],[-6.6,-21,-8,2,1,1],[-6.6,-19.9,-8,2,1,1],[-6.6,-20.4,-7,2,1,1],
        [12.4,-15.2,-8,1,1,2],[13.5,-15.2,-8,1,1,2],[13,-15.2,-7,1,1,2],[-17,-22.4,-8,1.2,1.2,1.2],[-15.6,-22.6,-8,1.2,1.2,1.2],
        [-28.6,-28,-4,2,1,1],[-28.6,-26.9,-4,2,1,1],[-28.6,-27.5,-3,2,1,1],[-25.4,-8.8,-4,1.2,1.2,1.2],[-23.8,-8.6,-4,2,1,1],
        [27.4,-31,-4,1,1,2],[28.5,-31,-4,1,1,2],[23,-38.4,-4,2,1,1],[23,-38.4,-3,2,1,1],[-26,-38.6,-4,1.2,1.2,1.2],[-24.4,-38.4,-4,2,1,1],[10,-38.2,-4,2,1,1]])blk(x,z,y,sx,sy,sz);
    // boulders at the foot of the faces
    for(const [x,y,z,s] of [[-20.6,-8,-33,1.2],[-21,-8,-19.5,.9],[-20.6,-8,-14,1],[18.8,-8,-32.6,1.1],[18.6,-8,-12.8,.9],[5,-8,-33,1],[-8,-8,-32.9,.8],
        [-30.6,-4,-33,1.3],[-30.8,-4,-14,1.1],[30.8,-4,-33.6,1.2],[30.6,-4,-22,1],[-18,-4,-40.8,1.1],[0,-4,-40.6,1],[18,-4,-40.8,1.3],[-30.6,-4,-40.6,1.2],[30.7,-4,-40.6,1],
        [-42.6,0,-30,1.2],[-42.8,0,-8,1],[42.6,0,-12,1.1],[42.6,0,12,1.2],[-42.6,0,20,1],[42.6,0,36,1.1],[-42.8,0,40,1]])rock(x,y,z,s)}
  // ================= the excavator on the pit floor: tracks, the turned body, the cab, the boom and stick reaching west to the bucket =================
  {const Y=-8,ST='qyTruck';B(7,Y,-31,13,Y+.9,-29.9,'qySteelG');B(7,Y,-27.6,13,Y+.9,-26.5,'qySteelG');B(8.4,Y+.9,-29.9,11.6,Y+1.3,-27.6,'qySteelG');
    B(7.6,Y+1.3,-31,12.4,Y+2.7,-26.6,ST);B(11.6,Y+1.3,-30.8,12.8,Y+2.6,-26.8,'qySteelG');B(7.7,Y+2.7,-30.9,9.5,Y+4.4,-29.1,ST,{f:{nx:'carGl',nz:'carGl'}});
    bar(7.8,Y+2.2,-28.2,5.2,Y+5.6,-28.2,.5,.55,ST);bar(5.2,Y+5.6,-28.2,4.9,Y+1.2,-28.2,.36,.42,ST);B(4.2,Y,-28.9,5.6,Y+1.1,-27.5,'qySteelG');
    B(10,Y+2.7,-28.8,11.4,Y+3.3,-27.2,'qySteelG')}
  // ================= the drill rig and lamps (west rim), the mobile light tower on the pit floor, the yard lamps =================
  {B(-40,0,-31.6,-36.2,1.3,-29.4,'qySteel');B(-40,0,-31.8,-36.2,.6,-31.6,'qySteelG');B(-40,0,-29.4,-36.2,.6,-29.2,'qySteelG');B(-39.6,1.3,-31.4,-38,2.9,-29.6,'qySteel',{f:{px:'carGl'}});
    bar(-36.6,1.3,-30.5,-36.9,9.2,-30.5,.32,.32,'qySteel');bar(-37.1,1.3,-30.5,-37.4,7,-30.5,.08,.08,'qySteelG');for(const z of [-31.8,-31.4])B(-41.6,0,z,-38,.4,z+.3,'qySteelG',CV);
    B(-6.8,-8,-14.8,-5.2,-7.1,-13.2,'qySteel');B(-6.1,-7.1,-14.1,-5.9,-1.4,-13.9,'qySteelG');B(-6.9,-1.6,-14.15,-5.1,-1.2,-13.85,'lampW',CV);LIGHT(-6,-2.2,-14,'#fff0d6',18,.7);
    lamp(-20,12);lamp(10,20);lamp(-10,-1.2);lamp(28,1);lamp(-38,-20);lamp(38,-12);lamp(-36,30)}
  // ================= pines along the fence and in the yard's corners, scrub on the back wall's top =================
  {for(const [x,z,s] of [[-41,44,1],[-30,44.4,1.1],[-17,44,.95],[18,44.2,1.05],[31,44,1],[41,44.3,1.1],[-41.6,34,.9],[41.4,30,.95],[-41.4,-38,.85],[41.6,-40,.9]])pine(x,z,0,s,z<42);
    for(let i=0;i<70;i++){const x=-60+hash2(i,1,13401)*120,z=46.6+hash2(i,2,13401)*13;pine(x,z,qyGround(x,z)-.15,1+hash2(i,3,13401)*.5)}
    for(const [x0,x1,z2,z3] of QY.ledge){const L=x1-x0;for(let k=0;k<Math.round(L/2.6);k++){const x=x0+.8+hash2(k,Math.round(x0),13421)*(L-1.6);
        QY.bush.push([x,12,z3-.6-hash2(k,7,13421)*3.4,.7+hash2(k,3,13421)*.9]);if(hash2(k,4,13421)<.45)QY.bush.push([x,7,z2-.4-hash2(k,5,13421)*(z2-z3-.8),.45+hash2(k,6,13421)*.5]);
        if(hash2(k,8,13421)<.5)QY.rocks.push([x+.6,2,-42.5-hash2(k,9,13421)*(-42-z2-1),.5+hash2(k,10,13421)*.5,.35,QY.rocks.length+500])}}
    for(let i=0;i<18;i++){const s=hash2(i,4,13411)<.5?-1:1,z=-40+hash2(i,5,13411)*84,x=s*(44.6+hash2(i,6,13411)*3),h=OC.find(o=>z>=o[0]&&z<o[1]);QY.bush.push([x,s<0?h[2]:h[3],z,.6+hash2(i,7,13411)*.7])}}
  // ================= who starts where =================
  MAP.spawns=[];for(const z of [16,19.4])for(let i=0;i<8;i++)MAP.spawns.push([-14+i*2.6+rr(-.2,.2),z+rr(-.2,.2),0,rr(-.4,.4)]);
  MAP.zspawns=[[-38,-38,0],[-40,-14,0],[-41,0,0],[-41,22,0],[-40,38,0],[-12,40,0],[12,40,0],[40,38,0],[41,16,0],[41,2,0],[40,-8,0],[38.5,-40,0],[-30,-38,-4],[30,-38,-4],[-30,40,0],[30,40,0]];
  MAP.camps=[
    {k:'adit',w:.16,p:[[-8,-4,-50],[-6.4,-4,-48.6],[-12.5,-4,-53],[-9.4,-4,-51.6]],look:[-12.5,-3,-42]},
    {k:'crusher',w:.15,p:[[38.7,9,-35],[38.7,9,-28.4],[41.3,9,-34.6],[39.6,9,-28.4]],look:[20,-4,-22]},
    {k:'deck',w:.08,p:[[36,4.5,-35.3],[41.2,4.5,-35.3],[38.5,4.5,-27]],look:[20,-4,-24]},
    {k:'office',w:.1,p:[[-40.5,.1,4.6],[-37.5,.1,5.5]],look:[-30,1,5.2]},
    {k:'boxroof',w:.12,p:[[-40.8,5.2,5.2],[-31.2,5.2,5.2],[-36.6,5.2,5.6]],look:[-10,0,0]},
    {k:'pile',w:.08,p:[[20,PT[0],15],[31.5,PT[1],24],[15,PT[2],32]],look:[0,0,10]},
    {k:'truck',w:.07,p:[[4.5,3,6.2],[5.6,3,7.6]],look:[-10,0,10]},
    {k:'bays',w:.06,p:[[-25,0,33.4],[-19,0,34],[-13.4,0,33.4]],look:[-19,1,20]},
    {k:'scale',w:.04,p:[[6,0,32]],look:[0,1,32]},
    {k:'floor',w:.05,p:[[-4,-8,-28.6],[11,-8,-14],[-6.6,-8,-17.6]],look:[0,-6,-22]},
    {k:'bench',w:.05,p:[[-27,-4,-28],[27,-4,-29],[-24,-4,-37.2]],look:[0,-6,-22]},
  ];
  MAP.spawnYaw=null;
  // sundown: the sun low in the west, its light orange; long shadows to the east
  MAP.moon={d:new THREE.Vector3(-.884,.358,.301).normalize(),c:new THREE.Color('#ffbe86'),i:1.35};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.035);cam.position.set(-6+a*6,11+Math.sin(t*.05)*.4,6);cam.lookAt(2+a*4,-7,-32)}}
// the ground beyond the map: nothing inside it (the map's own ground and rock are there); behind the back wall it goes on from the wall's
// top, east and west from the outcrops', south from the yard's level, rising to hills
function qyOut(x,z){return Math.max(Math.abs(x)-48,z-46,-62-z)}
function qyGround(x,z){const e=qyOut(x,z);if(e<-.01)return -14;const n=clamp((-40-z)/14,0,1),sd=clamp((Math.abs(x)-40)/10,0,1),b=Math.max(12*n,8*sd*(1-clamp((z-30)/20,0,1)));
  const f=clamp(e/100,0,1);return b+e*.18+Math.max(0,fbm(x/56,z/56,13501,4,0)-.32)*64*f+f*f*20}
// ---------- the meshes boxes cannot make: the stockpiles, the boulders, the truck's wheels, the fuel tank, pines and scrub, the hills ----------
function qyMesh(scene){const D=(MAP.moon&&MAP.moon.d)||new THREE.Vector3(0,1,0),K=meshKit(scene),{acc,add,mk,lit}=K,probeAt=sunProbe(D);
  const sunK=(nx,ny,nz)=>Math.max(0,nx*D.x+ny*D.y+nz*D.z);
  // the stockpiles: a cone each, lit corner by corner from just outside its surface (the tiers it covers are solid)
  {const A=acc();for(const [x,y,z,r,h,th] of QY.cones){const g=new THREE.CylinderGeometry(r*(1-th/h),r,th,32,7,false);g.translate(x,y+th/2-.02,z);
      add(A,g,r*.9,h*.6,(px,py,pz,nx,ny,nz)=>{const c=lightAt(px+nx*.6,py+ny*.6,pz+nz*.6,nx,ny,nz,true),k=.62+.6*sunK(nx,ny,nz);return [c[0]*k,c[1]*k,c[2]*k]})}
    if(A.P.length)mk(A,'qyGravel')}
  // the boulders: a lumpy ball each (an icosahedron pushed about), flattened, sunk a little into the ground
  {const A=acc();for(const [x,y,z,s,sy,i] of QY.rocks){const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;
      for(let k=0;k<p.count;k++){const vx=p.getX(k),vy=p.getY(k),vz=p.getZ(k),j=.78+hash2(Math.round(vx*7+i*31),Math.round(vy*7+vz*13),13601)*.4;p.setXYZ(k,vx*s*j,vy*sy*j,vz*s*j)}
      g.computeVertexNormals();g.rotateY(hash2(i,9,13602)*TAU);g.translate(x,y+sy*.55,z);add(A,g,1.2,1.2,lit)}
    if(A.P.length)mk(A,'qyRock')}
  // the haul truck's wheels: a tyre round a steel rim, turned on their side
  {const T=acc(),M=acc();for(const [x,r,z,w] of QY.wheels){const t=new THREE.CylinderGeometry(r,r,w,22,1,false);t.rotateX(Math.PI/2);t.translate(x,r,z);add(T,t,2,1,lit);
      const m=new THREE.CylinderGeometry(r*.55,r*.55,w+.04,14,1,false);m.rotateX(Math.PI/2);m.translate(x,r,z);add(M,m,1,1,lit)}
    if(T.P.length){mk(T,'tire');mk(M,'qySteelG')}}
  // the fuel tank on its stand
  {const A=acc();for(const t of QY.tanks){const g=new THREE.CylinderGeometry(t.r,t.r,t.x1-t.x0,18,1,false);g.rotateZ(Math.PI/2);g.translate((t.x0+t.x1)/2,t.y,t.z);add(A,g,2,1,lit)}
    if(A.P.length)mk(A,'qySteel')}
  barMeshes(QY.bars,D,K,probeAt);
  pineMeshes(QY.pines,D,K,probeAt,'qyBark','qyPine');
  // scrub on the back wall's top and the outcrops: low clumps, the sun side lighter
  {const A=acc(),A0=MAP.ambOut||new THREE.Color('#6a6478'),SC=MAP.moon.c,SI=MAP.moon.i;for(const [x,y,z,s] of QY.bush){const g=new THREE.IcosahedronGeometry(s,0);g.scale(1.3,.7,1.1);g.rotateY(hash2(Math.round(x*10),Math.round(z*10),13611)*TAU);g.translate(x,y+s*.35,z);
      add(A,g,1,1,(px,py,pz,nx,ny,nz)=>{const l=sunK(nx,ny,nz);return [A0.r*.8+SC.r*SI*l*.7,A0.g*.8+SC.g*SI*l*.7,A0.b*.8+SC.b*SI*l*.7]})}
    if(A.P.length)mk(A,'qyBush')}
  forestMesh(K,qyGround,qyOut,D,'qyPine',{seed:13801,e0:14,e1:110});
  hillMesh(scene,qyGround,'qyHill',D,4.6,81,-4.6*40)}
MAPDEFS.quarry={n:['회색 채석장','Grey Quarry'],gside:'qyRock',d:['해 질 녘 산자락을 파고 들어간 화강암 채석장. 4 m씩 두 단으로 내려가는 구덩이(오르내리는 길은 경사로 두 개와 철계단 세 개뿐), 뒷벽 속의 옛 갱도와 화약고, 9 m 쇄석기 탑, 컨테이너 사무소 지붕, 올라설 수 있는 골재 더미, 덤프트럭 — 건물보다 바위 · 록블록 · 철골이 많은 야외 맵.',
    'A granite quarry cut into a hillside, at sundown: the pit going down two 4 m steps (only two haul ramps and three steel stairs in and out), the old adit and its store room in the back wall, the 9 m crusher tower, the roof of the container office, the stockpiles you can climb, a haul truck — rock, lock blocks and steelwork more than buildings.'],
  env:{sky:1,sun:1,skyTex:'qySky',halo:'#ffb878',rain:0,storm:0,fog:'#a08a88',fogD:.0058,bloomThr:.85,ambOut:'#7a7486',ambIn:'#36323a',boAmb:.55},
  navMinY:-10,noBottomY:-11.9,bounds:[-48,-56,48,46],probeY:[-7.1,-3.1,.9,2.4,4.2,5.4,9.9],mini:[-6,-2,3.5],miniName:['B2','B1','1F','2F'],tex:bakeQuarryTex,build:buildQuarry,mesh:qyMesh};

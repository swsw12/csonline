'use strict';
// ============ Map "이탈리아 Italy": a hill town on a summer afternoon ============
// The street plan comes from ITALY_DATA (a 0.5 m grid traced from a top-down plan). On top of it the west quarter (spawn piazza,
// the lane, the north piazza) sits one storey up behind retaining walls; a long stepped ramp, the north stairs and a house you walk
// through (wallpapered upper floor, inner stair, ground floor) join it to the lower town. The covered cantina is a sunken wine
// cellar with an open stairwell at one end and a stair tunnel at the other; the east square gets a high terrace. Every walkable
// 0.5 m cell has a floor height; ground boxes, wall faces, rubble plinths, copings and railings are derived from those heights.
Object.assign(MATS,{
  facA:{t:'facA',s:3,k:'stone'},facB:{t:'facB',s:3,k:'stone'},facC:{t:'facC',s:3,k:'stone'},
  roofIt:{t:'roofIt',s:2,k:'stone',cs:2},cobble:{t:'cobble',s:1.5},pavers:{t:'pavers',s:2.4},cobbleR:{t:'cobbleR',s:1.5},
  stoneIt:{t:'stoneIt',s:2},woodIt:{t:'woodIt',s:2,k:'wood'},doorIt:{t:'doorIt',uv:'box',k:'wood'},awn:{t:'awn',s:2,k:'soft'},fruit:{t:'fruit',uv:'box',k:'wood'},
  water:{t:'water',s:3,emis:.12,k:'glass'},flowers:{t:'flowers',uv:'box',k:'soft'},
  ironRail:{t:'ironRail',uv:'boxV',s:1.2,k:'metal'},cloth0:{t:'cloth0',uv:'box',k:'soft'},cloth1:{t:'cloth1',uv:'box',k:'soft'},cloth2:{t:'cloth2',uv:'box',k:'soft'},
  leaves:{t:'leaves',s:1.5,k:'soft'},bark:{t:'bark',s:1,k:'wood'},signIt:{t:'signIt',uv:'box',emis:.2,k:'wood'},
  retW:{t:'retW',s:2,k:'stone'},rubble:{t:'rubble',s:2,k:'stone'},stepW:{t:'stepW',s:1,k:'wood'},roofFl:{t:'roofFl',s:2,k:'stone'},
  cellarW:{t:'cellarW',s:2,k:'stone'},cellarF:{t:'cellarF',s:2},beamC:{t:'beamC',s:2,k:'wood'},rack:{t:'rack',uv:'box',k:'wood'},
  wallP:{t:'wallP',s:1,k:'stone'},woodFl:{t:'woodFl',s:2,k:'wood'},ceilT:{t:'ceilT',s:1.2},
  paintA:{t:'paintA',uv:'box',k:'wood'},paintB:{t:'paintB',uv:'box',k:'wood'},fresco:{t:'fresco',uv:'box',k:'stone'},gateA:{t:'gateA',uv:'box',k:'metal'},
  ivy:{t:'ivy',uv:'box',k:'soft'},shutG:{t:'shutG',uv:'box',k:'wood'},shutR:{t:'shutR',uv:'box',k:'wood'},
});
// ---------- textures ----------
function texFacade(base,shut,seed){const N=TN;return paint(N,N,P=>{
  // 3 m of wall per tile: lime-washed stucco, a stone string course at each floor, one window with open shutters
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,64,seed,4)-.5)*.45+(P.n(x,y,8,seed+1,2)-.5)*.1+(hash2(x,y,seed+2)-.5)*.05;
    P.set(x,y,dith(P,x,y,t,[dk(base,.22),dk(base,.12),dk(base,.05),base,lt(base,.08),lt(base,.16)],.06))}
  // a couple of patches where the stucco fell off: brick courses show
  for(let i=0;i<2;i++){const cx=hash2(i,1,seed+3)*N,cy=hash2(i,2,seed+3)*N*.75,rx=10+hash2(i,3,seed+3)*16,ry=6+hash2(i,4,seed+3)*9;
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=Math.hypot(x/rx,y/ry)+(P.n(cx+x,cy+y,8,seed+10+i,2)-.5)*.7;if(d>1)continue;const X=Math.round(cx+x),Y=Math.round(cy+y);
      if(d>.86){P.set(X,Y,lt(base,.2));continue}const row=Math.floor(Y/6),off=row%2?7:0;const mort=Y%6===0||(X+off)%14===0;P.set(X,Y,mort?'#a09484':hash2(Math.floor((X+off)/14),row,seed+4)<.5?'#a85a3a':'#94502e')}}
  // string course at the floor line, a little grime above it
  for(let x=0;x<N;x++){for(let y=N-10;y<N;y++)P.set(x,y,y===N-10?'#f4ecdc':y>N-3?'#8a8274':dith(P,x,y,.6+(P.n(x,y,8,seed+5,2)-.5)*.4,['#bdb4a2','#cbc2ae','#d8d0bc'],.06));
    for(let y=N-26;y<N-10;y++)P.mul(x,y,.95+.05*((y-(N-26))/16))}
  // the window: stone frame and sill, dark glass with a mullion, shutters swung open
  const wx0=86,wx1=170,wy0=46,wy1=172;
  for(let y=wy0-8;y<=wy1+10;y++)for(let x=wx0-8;x<=wx1+8;x++){const inF=x>=wx0&&x<=wx1&&y>=wy0&&y<=wy1;let c;
    if(inF){c=((x-wx0)+(y-wy0)*.5)%46<4?'#3a4650':'#1a2128';if(Math.abs(x-128)<2||Math.abs(y-108)<2)c='#ece4d2';if(y>wy0+6&&y<wy0+30&&hash2(x>>2,y>>2,seed+6)<.25)c='#4a3e30'}
    else c=y>wy1+2?'#efe6d4':'#e4dccb';if(y>wy1+6)c='#a49a88';if(!inF&&hash2(x,y,seed+7)<.05)c=dk(c,.1);P.set(x,y,c)}
  for(const [a,b] of [[wx0-44,wx0-10],[wx1+10,wx1+44]])for(let y=wy0-2;y<=wy1+2;y++)for(let x=a;x<=b;x++){let c=(y-wy0)%10<2?dk(shut,.35):shut;if(x===a||x===b||y===wy0-2||y===wy1+2)c=dk(shut,.5);if(hash2(x,y,seed+8)<.06)c=lt(c,.15);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,seed+9)*N),Math.floor(hash2(i,2,seed+9)*N*.6),40+Math.floor(hash2(i,3,seed+9)*110),.07,2);
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,4,seed+9)*N),Math.floor(hash2(i,5,seed+9)*N),40+Math.floor(hash2(i,6,seed+9)*40),seed+40+i,dk(base,.35),lt(base,.2))})}
function texRoofIt(){const N=TN;return paint(N,N,P=>{
  // barrel tiles in rows: each tile shaded like a half cylinder, colour varying tile to tile, a little lichen
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/20),lx=(x+(row%2)*8)%16,ly=y%20;const id=hash2(Math.floor((x+(row%2)*8)/16),row,801);
    const sh=Math.sin(lx/16*Math.PI);let base=id<.2?'#b0522e':id<.55?'#c4643a':id<.85?'#d27444':'#bc5a34';
    let c=mix(dk(base,.4),lt(base,.18),sh*.85+(ly<4?-.25:0));if(ly>17)c=dk(c,.45);const n=P.n(x,y,32,802,3);if(n>.66)c=mix(c,'#7a7444',(n-.66)*1.4);if(hash2(x,y,803)<.04)c=dk(c,.18);P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,804)*N,hash2(i,2,804)*N,12+hash2(i,3,804)*20,8+hash2(i,4,804)*14,.16,805+i)})}
function texCobble(seed){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,16,seed);const e=f2-f1;const tone=hash2(id,1,seed+1);
    const pal=['#7c766c','#8a8478','#969082','#6e685e'];let base=pal[Math.floor(tone*pal.length)];
    let c=e<2.2?'#3a3630':mix(lt(base,.14),dk(base,.26),clamp(f1/11,0,1));if(e<3.2&&e>=2.2)c=dk(c,.22);if(hash2(x,y,seed+2)<.05)c=dk(c,.13);P.set(x,y,c)}
  for(let i=0;i<7;i++)stain(P,hash2(i,1,seed+3)*N,hash2(i,2,seed+3)*N,12+hash2(i,3,seed+3)*26,10+hash2(i,4,seed+3)*18,.16,seed+10+i)})}
function texCobbleR(){const N=TN;return paint(N,N,P=>{
  // round river cobbles set close in sand
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,16,1131);const tone=hash2(id,1,1132),e=f2-f1;
    const base=tone<.3?'#8e8676':tone<.6?'#a49a88':tone<.85?'#b6ad9a':'#7e7668';
    let c=e<1.6?'#5a5244':mix(lt(base,.2),dk(base,.32),clamp(f1/9,0,1));if(e<2.6&&e>=1.6)c=dk(c,.2);if(hash2(x,y,1133)<.04)c=dk(c,.12);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,1134)*N,hash2(i,2,1134)*N,14+hash2(i,3,1134)*20,10+hash2(i,4,1134)*16,.14,1135+i)})}
function texPavers(){const N=TN;return paint(N,N,P=>{
  // limestone slabs in running bond, edges worn round, a few cracked
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/42),off=row%2?42:0,col=Math.floor((x+off)/84),lx=(x+off)%84,ly=y%42;const id=hash2(col,row,811);
    let t=.55+(id-.5)*.25+(P.n(x,y,32,812,3)-.5)*.3+(hash2(x,y,813)-.5)*.06;let c=dith(P,x,y,t,['#a6987f','#b4a68c','#c0b298','#cabda2','#d4c7ac'],.07);
    if(lx<2||ly<2)c=lx<1||ly<1?'#6a604e':'#968a74';else if(lx<4||ly<4)c=lt(c,.06);if(hash2(x>>2,y>>2,814)<.03)c=dk(c,.1);P.set(x,y,c)}
  for(let i=0;i<4;i++)crack(P,Math.floor(hash2(i,1,815)*N),Math.floor(hash2(i,2,815)*N),30,816+i,'#7a705e',null);
  for(let i=0;i<8;i++)stain(P,hash2(i,3,815)*N,hash2(i,4,815)*N,12+hash2(i,5,815)*26,10+hash2(i,6,815)*18,.12,820+i)})}
function texStoneIt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,64,841,4)-.5)*.35+(P.n(x*.25,y*3,8,842,2)-.5)*.2+(hash2(x,y,843)-.5)*.05;
    let c=dith(P,x,y,t,['#a89a82','#b8aa90','#c6b89c','#d2c4a8','#ddd0b4'],.06);if(hash2(x>>1,y,844)<.025)c='#82766a';if(y%64===0)c='#928672';P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,845)*N,hash2(i,2,845)*N,10+hash2(i,3,845)*20,8+hash2(i,4,845)*16,.14,846+i)})}
function texWoodIt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(x/32),lx=x%32;let t=.5+Math.sin(y*.09+P.n(x,y,32,851+pl,2)*6)*.15+(hash2(pl,0,852)-.5)*.2;
    let c=dith(P,x,y,t,['#3e2a18','#4c3420','#5a3e26','#684a2e'],.08);if(lx<2)c='#22160c';P.set(x,y,c)}})}
function texDoorIt(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const pl=Math.floor((x-10)/18);let t=.5+Math.sin(y*.07+pl*2+P.n(x,y,32,861,2)*5)*.18;
    let c=dith(P,x,y,t,['#4e3018','#5c3a1e','#6a4424','#784e2c'],.08);if(x<10||x>117||y<10)c=y<10?'#c8baa0':'#b8aa90';else if((x-10)%18<2)c='#2e1e10';if((y-40)%60<4&&x>10&&x<118)c='#2e1e10';
    if(Math.hypot(x-98,y-140)<4)c='#c8a040';if(((x-20)%36<3&&(y-30)%50<3))c='#1a1410';P.set(x,y,c)}})}
function texAwn(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=Math.floor(x/32)%2;let c=s?'#b82a24':'#ece4d0';const n=P.n(x,y,32,871,3);c=mix(c,dk(c,.5),clamp((n-.55)*1.2,0,.4));if(hash2(x,y,872)<.04)c=dk(c,.12);P.set(x,y,c)}})}
function texFruit(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=(x<8||x>119||y<8||y>119)?((x+y)%12<6?'#8a6a3a':'#6a4e28'):'#3a2a18';P.set(x,y,c)}
  const cols=['#e8781a','#d8281a','#e8c81a','#4a8a2a','#e8901a'];for(let r=0;r<6;r++)for(let k=0;k<6;k++){const cx=16+k*19+(r%2)*4,cy=16+r*19,col=cols[(r*3+k*7+Math.floor(hash2(r,k,881)*3))%cols.length];
    for(let y=-8;y<=8;y++)for(let x=-8;x<=8;x++){const d=Math.hypot(x,y);if(d<8)P.set(cx+x,cy+y,d<3&&x<0&&y<0?lt(col,.45):d>6?dk(col,.35):col)}}})}
function texWater(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.08+P.n(x,y,32,891,3)*7)*.5+.5;let c=mix('#2a6a78','#4a9aa2',w*.7);
    if(P.n(x,y,16,892,2)>.68)c=lt(c,.35);if(hash2(x,y,893)<.01)c='#d8f0ec';P.set(x,y,c)}})}
function texFlowers(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=y>40?(x<4||x>123?'#6a3e22':'#8a5232'):'#2a4a1e';
    if(y<=40){const n=P.n(x,y,8,901,2);c=n>.5?'#3a6a26':'#24401a';const f=hash2(x>>2,y>>2,902);if(f<.18)c=f<.06?'#e8e0f0':f<.12?'#d8283a':'#e858a8';if(y<6&&hash2(x,y,903)<.6){P.alpha(x,y,0);continue}}P.set(x,y,c)}})}
function texIronRail(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){P.alpha(x,y,0);const bar=x%11<2,top=y<5,bot=y>58,sc=Math.abs(Math.hypot((x%22)-11,(y%22)-11)-7)<1.2&&y>8&&y<56;
    if(bar||top||bot||sc)P.set(x,y,top?'#3a3a38':'#1e1e1c')}})}
function texCloth(col){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=col;const n=P.n(x,y,8,911,2);c=mix(c,dk(c,.4),clamp((n-.5)*1.2,0,.5));if(y<2)c=dk(c,.3);P.set(x,y,c)}})}
function texLeaves(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2]=cellN(P,x,y,8,921);let c=mix('#4a6a2c','#1e3214',clamp(f1/6,0,1));if(f2-f1<1)c='#16240e';if(hash2(x,y,922)<.05)c='#6a8a3c';P.set(x,y,c)}})}
function texBark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let t=.5+Math.sin(x*.5+P.n(x,y,8,931,2)*4)*.25;P.set(x,y,dith(P,x,y,t,['#2a2018','#3a2c20','#4a3a2a'],.1))}})}
function texBarrel(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const st=x%12;let t=.5+(P.n(x,y,16,941,2)-.5)*.3+(st<1?-.3:0);let c=dith(P,x,y,t,['#4a2e18','#5a3a1e','#6a4626','#7a522e'],.08);
    if(Math.abs(y-20)<4||Math.abs(y-108)<4||Math.abs(y-50)<3||Math.abs(y-78)<3)c=y%2?'#2a2826':'#3a3834';P.set(x,y,c)}})}
// lime stucco on the retaining walls and the walk-through house: weathered, streaked, a few patches of the stones behind
function texRetW(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,64,1101,4)-.5)*.42+(P.n(x,y,8,1102,2)-.5)*.12+(hash2(x,y,1103)-.5)*.05;
    P.set(x,y,dith(P,x,y,t,['#bab09c','#c8bfaa','#d4ccb8','#dfd8c6','#e8e2d2'],.06))}
  for(let i=0;i<3;i++){const cx=hash2(i,1,1104)*N,cy=hash2(i,2,1104)*N,rx=16+hash2(i,3,1104)*24,ry=10+hash2(i,4,1104)*14;
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=Math.hypot(x/rx,y/ry)+(P.n(cx+x,cy+y,8,1105+i,2)-.5)*.6;if(d>1)continue;const X=Math.round(cx+x),Y=Math.round(cy+y);
      if(d>.85){P.set(X,Y,'#f2ecdc');continue}const [f1,f2,id]=cellN(P,((X%N)+N)%N,((Y%N)+N)%N,16,1110);P.set(X,Y,f2-f1<2?'#6e6656':mix('#a49c8a','#847c6c',hash2(id,1,1111)))}}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,1106)*N),Math.floor(hash2(i,2,1106)*N),30+Math.floor(hash2(i,3,1106)*90),.08,2);
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,4,1106)*N),Math.floor(hash2(i,5,1106)*N),50,1107+i,'#8e8674','#f2ecdc')})}
// big field stones in mortar: the plinths at every wall foot
function texRubble(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,64,1141),[g1,g2]=cellN(P,x,y,32,1148);const big=hash2(id,3,1142)<.6;
    const e=big?f2-f1:g2-g1,ff=big?f1:g1,tone=hash2(big?id:id+977,1,1142),base=tone<.25?'#8e887a':tone<.5?'#a49e8e':tone<.75?'#b6b0a0':'#c6c0ae';
    let c;if(e<3)c=e<1.5?'#4a463c':'#6e695e';else{const sh=clamp(1-ff/(big?30:16),0,1);c=mix(dk(base,.28),lt(base,.16),sh*.75+(P.n(x,y,16,1143,2)-.5)*.5)}
    if(hash2(x,y,1144)<.05)c=dk(c,.14);P.set(x,y,c)}
  for(let i=0;i<5;i++)stain(P,hash2(i,1,1145)*N,hash2(i,2,1145)*N,16+hash2(i,3,1145)*24,10+hash2(i,4,1145)*16,.16,1146+i)})}
// honey-coloured plank treads
function texStepW(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(y/32),ly=y%32;let t=.5+Math.sin(x*.05+P.n(x,y,32,1151+pl,2)*6)*.15+(hash2(pl,0,1152)-.5)*.25;
    let c=dith(P,x,y,t,['#6e5232','#82623c','#967448','#aa8654','#ba9660'],.08);if(ly<2)c='#3e2c1a';if(hash2(x>>3,y,1153)<.02)c=dk(c,.25);P.set(x,y,c)}})}
function texCellarW(){const N=TN;return paint(N,N,P=>{
  // dressed grey blocks, pale mortar
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/32),off=(row%2)*32,bx=Math.floor((x+off)/64),lx=(x+off)%64,ly=y%32;const id=hash2(bx%4,row,1161);
    let t=.5+(id-.5)*.35+(P.n(x,y,32,1162,3)-.5)*.3;let c=dith(P,x,y,t,['#565856','#626462','#6e706c','#7a7c78','#868884'],.08);
    if(lx<3||ly<3)c=lx<2&&ly<2?'#a29e92':'#928e84';else if(lx<5||ly<5)c=lt(c,.08);else if(lx>60||ly>28)c=dk(c,.16);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,1163)*N,hash2(i,2,1163)*N,14+hash2(i,3,1163)*24,10+hash2(i,4,1163)*16,.18,1164+i)})}
function texCellarF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,64,1171,4)-.5)*.4+(P.n(x,y,8,1172,2)-.5)*.1;
    let c=dith(P,x,y,t,['#8e8c86','#a09e96','#b2b0a8','#c2c0b8','#cecdc6'],.06);if(x%128<2||y%128<2)c=dk(c,.25);P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,1173)*N,hash2(i,2,1173)*N,16+hash2(i,3,1173)*30,12+hash2(i,4,1173)*20,.16,1174+i)})}
function texBeamC(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,64,1181,4)-.5)*.4;P.set(x,y,dith(P,x,y,t,['#6e6c68','#7c7a76','#8a8884','#989692'],.08))}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,1182)*N,hash2(i,2,1182)*N,14+hash2(i,3,1182)*26,10+hash2(i,4,1182)*18,.2,1183+i)})}
// wine rack face: wooden cubbies with bottle ends
function texRack(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const t=.5+Math.sin(y*.11+P.n(x,y,16,1191,2)*5)*.15;P.set(x,y,dith(P,x,y,t,['#5a4028','#6a4c30','#7a5838','#8a6440'],.08))}
  for(let r=0;r<8;r++)for(let k=0;k<4;k++){const x0=5+k*30,y0=5+r*31;for(let y=0;y<26;y++)for(let x=0;x<27;x++)P.set(x0+x,y0+y,'#1a120c');
    for(let b=0;b<3;b++)for(let q=0;q<2;q++){const cx=x0+5+b*8,cy=y0+7+q*12;const red=hash2(r*4+k,b*2+q,1192)<.5;if(hash2(r*4+k,b*2+q,1193)<.12)continue;
      for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){const d=Math.hypot(x,y);if(d<=4){let c=d<1.6?(red?'#9a2020':'#3a4a22'):'#10200e';if(d<4&&x<-1&&y<-1)c=lt(c,.3);P.set(cx+x,cy+y,c)}}}}})}
// floral wallpaper: blue rosettes on cream, 1 m repeat
function texWallP(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,64,1201,3)-.5)*.25+(hash2(x,y,1202)-.5)*.05;P.set(x,y,dith(P,x,y,t,['#c4bca6','#d0c8b2','#dad3be','#e2dcc8'],.05))}
  for(let r=0;r<4;r++)for(let k=0;k<4;k++){const cx=k*64+(r%2)*32+16,cy=r*64+20,s=hash2(r,k,1203);
    for(let l=0;l<5;l++){const a=l/5*TAU+s*2,lx=cx+Math.cos(a)*16,ly=cy+Math.sin(a)*16;for(let y=-5;y<=5;y++)for(let x=-8;x<=8;x++){const u=x*Math.cos(a)+y*Math.sin(a),v=-x*Math.sin(a)+y*Math.cos(a);if(u*u/49+v*v/10<1)P.set(Math.round(lx+x),Math.round(ly+y),'#8a9680')}}
    for(let y=-11;y<=11;y++)for(let x=-11;x<=11;x++){const d=Math.hypot(x,y),ang=Math.atan2(y,x),pet=9+2.5*Math.cos(ang*5+s*6);if(d<pet)P.set(cx+x,cy+y,d<3?'#46527a':d<pet-3?'#66769c':'#8494b4')}
    const sx=cx+32,sy=cy+34;for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(Math.hypot(x,y)<3)P.set(sx+x,sy+y,'#7484a4')}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,1204)*N,hash2(i,2,1204)*N,20+hash2(i,3,1204)*30,14+hash2(i,4,1204)*24,.08,1205+i)})}
function texWoodFl(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(y/16),ly=y%16,off=Math.floor(hash2(pl,1,1211)*N),xx=(x+off)%N,seg=Math.floor(xx/128);const id=hash2(pl,seg,1212);
    let t=.5+(id-.5)*.4+Math.sin(x*.06+P.n(x,y,32,1213,2)*5)*.1;let c=dith(P,x,y,t,['#8a5a30','#9e6a3a','#b07a46','#c08a52','#cc9a60'],.08);
    if(ly<1||xx%128<1)c='#4a3018';P.set(x,y,c)}})}
function texCeilT(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const lx=x%128,ly=y%128;let t=.6+(P.n(x,y,32,1221,2)-.5)*.15;let c=dith(P,x,y,t,['#bcbab4','#c8c6c0','#d4d2cc','#dedcd6'],.05);
    if(lx<3||ly<3)c='#8e8c86';else if(hash2(x>>2,y>>2,1222)<.06)c=dk(c,.07);P.set(x,y,c)}})}
// a small landscape in a gilt frame
function texPaint(seed,sky,land){return paint(128,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<128;x++){let c;
  if(x<8||x>119||y<8||y>87){c=(x<3||x>124||y<3||y>92)?'#5a3a12':'#b8862e';if((x+y)%7===0)c='#d8a848'}
  else{const hz=46+Math.sin(x*.06+seed)*8+P.n(x,y,32,seed,2)*10;c=y<hz?mix(sky,'#f0e0c0',y/hz*.6):mix(land,'#3a3a24',(y-hz)/50);if(y>hz&&y<hz+6&&hash2(x>>2,1,seed)<.3)c='#5a6a3a';
    if(P.n(x,y,16,seed+1,2)>.66&&y<hz)c=lt(c,.3)}P.set(x,y,c)}})}
// the piazza fresco: an arched panel with a hill-country scene (cypresses, a river, a village), faded plaster, gilt border
function texFresco(){const W=256,H=320;return paint(W,H,P=>{const R=W/2;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const inA=y>=R||Math.hypot(x-R+.5,y-R+.5)<=R;if(!inA){P.alpha(x,y,0);continue}
    const dE=y>=R?Math.min(x,W-1-x,H-1-y):R-Math.hypot(x-R+.5,y-R+.5);let c;
    if(dE<10)c=dE<3?'#6a4a16':dE<7?((((x+y)>>1)%5===0)?'#e8c060':'#c89a3a'):'#7a5a22';
    else{const u=x/W,v=(y-10)/(H-20);c=mix('#9cc0dc','#f2e2c0',clamp(v*1.6,0,1));
      const h1=.48+Math.sin(u*5+1)*.05+fbm(u*4,.5,1251,3,4)*.08,h2=.62+Math.sin(u*3.2+2)*.06,h3=.76;
      if(v>h1)c=mix('#8ea0a8','#7a8c84',clamp((v-h1)*6,0,1));if(v>h2)c=mix('#9aa058','#6e7a3a',clamp((v-h2)*5,0,1));if(v>h3)c=mix('#7a8a40','#4e5a2a',clamp((v-h3)*3,0,1));
      if(v>.7&&Math.abs(u-.5-Math.sin(v*9)*.08)<.04*(v-.7)*6)c=mix('#8ab0c0','#c8dce0',.4);
      if(v>h2-.06&&v<h2+.01&&u>.55&&u<.8){const bx=Math.floor(u*60),by=Math.floor(v*80);if(hash2(bx,by,1252)<.55)c=hash2(bx,by+9,1252)<.5?'#e8d8c0':'#c86a40'}
      for(const [cu,cv,hh] of [[.18,.82,.24],[.25,.84,.18],[.86,.86,.22]]){const dx=Math.abs(u-cu)*W,dy=(cv-v)*H;if(dy>0&&dy<hh*H&&dx<9*(1-dy/(hh*H))+1.5)c=mix('#2e4a24','#1e3018',dy/(hh*H))}
      c=mix(c,'#b8a888',clamp((P.n(x,y,32,1253,3)-.6)*1.2,0,.35));if(hash2(x,y,1254)<.03)c=dk(c,.1)}
    P.set(x,y,c)}})}
// an arched iron gate in front of a shaded garden
function texGate(){const W=256,H=320;return paint(W,H,P=>{const R=W/2;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const inA=y>=R||Math.hypot(x-R+.5,y-R+.5)<=R;if(!inA){P.alpha(x,y,0);continue}
  let c=mix('#1e2a1a','#3a4a2a',clamp(P.n(x,y,32,1261,3)*1.2-.2,0,1));if(y>H*.8)c=mix(c,'#4a4436',.6);
  const bar=(x%22)<3,rail=Math.abs(y-H*.55)<3||Math.abs(y-H*.9)<3||Math.abs(y-R*.9)<2,ring=Math.abs(Math.hypot(x-R+.5,y-R+.5)-R*.82)<2.5&&y<R,
    scroll=Math.abs(Math.hypot((x%44)-22,(y%44)-22)-12)<2&&y>H*.58&&y<H*.88;
  if(bar||rail||ring||scroll)c=(x+y)%9===0?'#4a4a46':'#1a1a18';const dE=y>=R?Math.min(x,W-1-x):R-Math.hypot(x-R+.5,y-R+.5);if(dE<4)c='#121210';P.set(x,y,c)}})}
// hanging ivy: dense at the top, thinning out downwards
function texIvy(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const dens=1-y/256*.9;const [f1,f2,id]=cellN(P,x,y,8,1271);const keep=hash2(id,1,1272)<dens*(.55+.45*P.n(x,y,32,1273,2));
  if(!keep||f1>5.2){P.alpha(x,y,0);continue}let c=mix('#5a8a34','#1e3a14',clamp(f1/5,0,1));if(hash2(id,2,1272)<.3)c=lt(c,.12);P.set(x,y,c)}})}
function texShut(col){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=col;if(x<4||x>59||y<4||y>123)c=dk(col,.35);else if(y%8<2)c=dk(col,.3);else if(y%8<3)c=lt(col,.12);if(Math.abs(x-32)<2)c=dk(col,.35);if(hash2(x,y,1281)<.05)c=dk(c,.1);P.set(x,y,c)}})}
function texRoofFl(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,64,1291,4)-.5)*.5+(hash2(x,y,1292)-.5)*.08;let c=dith(P,x,y,t,['#55534c','#615f58','#6d6b64','#797770'],.08);
  const m=P.n(x,y,32,1293,3);if(m>.62)c=mix(c,'#4e5e2c',(m-.62)*2);P.set(x,y,c)}})}
// afternoon sky: deep blue overhead, hazy at the horizon, fair-weather clouds, two mountain ranges and a lake far off
function texSkyDay(){return paint(1024,256,P=>{const SU=.111,SV=106;
  const ridge=(x,s)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=3<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  for(let x=0;x<1024;x++){const u=x/1024;
    // azimuth u: 0 west, .25 south, .5 east, .75 north. A tall range rises in the north-west, a lower one in the east, a lake lies south
    const bump=(c,w)=>{let d=Math.abs(u-c);d=Math.min(d,1-d);return Math.max(0,1-d/w)};
    const far=233-(8+Math.max(0,ridge(x,1301)-.36)*70)*(.6+.4*Math.sin(u*TAU*2+1)),near=233-(Math.max(0,ridge((x+300)%1024,1311)-.3)*150+6)*(bump(.83,.16)*1+bump(.47,.12)*.7);
    const lake=bump(.27,.08);
    for(let y=0;y<256;y++){const t=y/232;let du=Math.abs(u-SU);du=Math.min(du,1-du);
      let c=mix('#2a62b4','#9cc4ea',Math.pow(clamp(t,0,1),1.5));c=mix(c,'#d6e4f0',clamp((t-.86)*6,0,1));
      const sy=(y-SV)/256;c=mix(c,'#fff6e0',Math.exp(-(du*du*900+sy*sy*40))*.5);
      const band=clamp(1-Math.abs(y-160)/66,0,1);if(band>0){const cv=fbm(x/128,y/32,1321,5,8);const k=clamp((cv-.5)*3.4,0,1)*band;
        if(k>0){const shade=clamp((cv-.56)*2.2,0,1)*.55+clamp((y-160)/110,0,.35);c=mix(c,mix('#f6f8fc','#b4c0d2',shade),k)}}
      if(y>=far){const d=y-far;c=mix(mix('#8c9cb2','#7a8aa2',clamp(d/30,0,1)),'#c6d4e4',.4)}
      if(y>=near&&near<232){c=mix(mix('#6e7e88','#5c6a72',clamp((y-near)/30,0,1)),'#b4c4d4',.22);if(P.n(x,y,8,1331,2)>.6)c=lt(c,.1)}
      if(lake>.2&&y>=229&&y<=235&&near>=229){c=mix('#7c9cba','#a8c4dc',P.n(x,y,8,1341,2));if(hash2(x,y,1342)<.04)c='#eef6fc'}
      if(y>235)c=mix('#b8c6d4','#9ca8b4',clamp((y-235)/20,0,1));
      P.set(x,y,c)}}})}
function texSunDisc(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-31.5,y-31.5)/30;if(r>1){P.alpha(x,y,0);continue}P.set(x,y,r<.7?'#fffaf0':mix('#fffaf0','#ffd8a0',(r-.7)/.3))}})}
function bakeItTex(){if(TEX.facA)return;
  TEX.facA=mkTex(texFacade('#e8e3d6','#3e6a46',961));TEX.facB=mkTex(texFacade('#ecd2b6','#8a3026',971));TEX.facC=mkTex(texFacade('#ded5c2','#5a4632',981));
  TEX.roofIt=mkTex(texRoofIt());TEX.cobble=mkTex(texCobble(991));TEX.cobbleR=mkTex(texCobbleR());TEX.pavers=mkTex(texPavers());
  TEX.stoneIt=mkTex(texStoneIt());TEX.woodIt=mkTex(texWoodIt());TEX.doorIt=mkTex(texDoorIt(),false);TEX.awn=mkTex(texAwn());TEX.fruit=mkTex(texFruit(),false);TEX.water=mkTex(texWater());
  TEX.flowers=mkTex(texFlowers(),false);TEX.ironRail=mkTex(texIronRail());TEX.cloth0=mkTex(texCloth('#e8e4da'));TEX.cloth1=mkTex(texCloth('#3a6a9a'));TEX.cloth2=mkTex(texCloth('#c84a3a'));
  TEX.leaves=mkTex(texLeaves());TEX.bark=mkTex(texBark());TEX.barrel=mkTex(texBarrel());TEX.signIt=mkTex(texSign([{t:'CANTINA'},{t:'VINI · OLIO',s:7}],'#3a2414','#e8c878',96,28),false);
  TEX.retW=mkTex(texRetW());TEX.rubble=mkTex(texRubble());TEX.stepW=mkTex(texStepW());TEX.cellarW=mkTex(texCellarW());TEX.cellarF=mkTex(texCellarF());TEX.beamC=mkTex(texBeamC());
  TEX.rack=mkTex(texRack(),false);TEX.wallP=mkTex(texWallP());TEX.woodFl=mkTex(texWoodFl());TEX.ceilT=mkTex(texCeilT());TEX.roofFl=mkTex(texRoofFl());
  TEX.paintA=mkTex(texPaint(3,'#7aa0c8','#6a7a3a'),false);TEX.paintB=mkTex(texPaint(7,'#d8a070','#5a4a3a'),false);TEX.fresco=mkTex(texFresco(),false);TEX.gateA=mkTex(texGate(),false);
  TEX.ivy=mkTex(texIvy(),false);TEX.shutG=mkTex(texShut('#3e6a46'),false);TEX.shutR=mkTex(texShut('#8a3026'),false);
  TEX.skyDay=mkTex(texSkyDay());TEX.skyDay.wrapT=THREE.ClampToEdgeWrapping;TEX.skyDay.magFilter=THREE.LinearFilter;TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false;
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['facA','facB','facC','roofIt','cobble','cobbleR','pavers','stoneIt','retW','rubble','cellarF','woodFl'])TEX[k].anisotropy=an;
  MIXC.clear();VN_T.clear();_vnK=-1;_vnT=null;_fbC.length=0}
// ---------- plan: the traced grid with a few edits, and a floor height for every walkable cell ----------
const IT_U=3,IT_CEL=-2.4;
// K (cell kind): 0 street, 1 ramp, 2 cellar floor, 3 upper quarter (iron railings), 4 stair (wooden treads), 5 east terrace (wooden railings), 6 cellar stair
function itPlan(){const D=ITALY_DATA,NX=D.nx,NZ=D.nz,CS=D.cs,X0=D.x0,Z0=D.z0;
  const G=D.grid.split('|').map(r=>r.split(''));
  const I=x=>Math.round((x-X0)/CS),J=z=>Math.round((z-Z0)/CS);
  const set=(r,c,only)=>{for(let j=Math.max(0,J(r[1]));j<Math.min(NZ,J(r[3]));j++)for(let i=Math.max(0,I(r[0]));i<Math.min(NX,I(r[2]));i++)if(!only||only.indexOf(G[j][i])>=0)G[j][i]=c};
  // houses cut away: the sliver in front of the walk-through house, a post at the cellar stair, the tunnel out of the cellar
  const carve=[[-11.5,-3.5,-3.5,-2.5],[7,17,10,17.5],[27,17.5,29,20.5]];
  set(carve[0],'s');set([7,17,7.5,17.5],'s');set([7.5,17,10,17.5],'d');set(carve[2],'d');
  set([20.5,14,27,16.5],'d','s');set([11,22,12.5,26],'d','s');// the light well and the wine alcove belong to the cellar
  const walk=c=>c==='s'||c==='p'||c==='g'||c==='d'||c==='w';
  const H=new Float32Array(NX*NZ),K=new Uint8Array(NX*NZ);
  const inR=(x,z,r)=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3];
  const UP=[[-41,-17,-14,0],[-20,-15,1.5,-9.5],[-20,0,-13.5,3.5]];
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const c=G[j][i];if(!walk(c))continue;const x=X0+(i+.5)*CS,z=Z0+(j+.5)*CS;let h=0,t=0;
    if(c==='d'){h=IT_CEL;t=2;
      if((x<11.5&&z<21.5)||(x<10&&z<22.5)){h=-.3*(Math.floor((x-7.5)/.5)+1);t=6}// open stairwell down from the street
      else if(x>25&&z>17.5&&z<20.5){h=IT_CEL+.3*(Math.floor((x-25)/.5)+1);t=6}}// the stair tunnel up to the east lane
    else if(c!=='w'){
      if(UP.some(r=>inR(x,z,r))){h=IT_U;t=3}
      if(x<-33&&z<0){h=Math.min(IT_U,.15*Math.floor((z+15)/.5));t=h>=IT_U?3:1}// the lane climbs from the gate up to the piazza level
      if(x>-18&&x<-8&&z>-6&&z<3.5){h=IT_U-.15*(Math.floor((x+18)/.5)+1);t=1}// the long stepped ramp
      if(x>-1&&x<1.5&&z>-17.5&&z<-12.5){h=.3*(Math.floor((z+17.5)/.5)+1);t=4}// the north stairs
      if(x>31.5&&x<33.5&&z>12&&z<17){h=.3*(Math.floor((z-12)/.5)+1);t=4}// stairs up to the east terrace
      if(x>33.5&&x<40.5&&z>12&&z<21.5){h=IT_U;t=5}}
    H[j*NX+i]=Math.round(h*100)/100;K[j*NX+i]=t}
  return {G,H,K,carve}}
// ---------- geometry ----------
function buildItaly(){const D=ITALY_DATA,N='none',PL=itPlan(),G=PL.G,HH=PL.H,KK=PL.K,NX=D.nx,NZ=D.nz,CS=D.cs,X0=D.x0,Z0=D.z0,U=IT_U,CEL=IT_CEL;
  const cI=x=>Math.floor((x-X0)/CS),cJ=z=>Math.floor((z-Z0)/CS),inG=(i,j)=>i>=0&&j>=0&&i<NX&&j<NZ;
  const at=(x,z)=>{const i=cI(x),j=cJ(z);return inG(i,j)?G[j][i]:'.'};
  const hAt=(x,z)=>{const i=cI(x),j=cJ(z);return inG(i,j)?HH[j*NX+i]:0};
  const kAt=(x,z)=>{const i=cI(x),j=cJ(z);return inG(i,j)?KK[j*NX+i]:0};
  const walk=c=>c==='s'||c==='p'||c==='d'||c==='g'||c==='w';
  const floorC=c=>walk(c)&&c!=='w';
  const H=(a,b,c)=>hash2(Math.round(a*7),Math.round(b*7),c);
  const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],OUTF=['px','nx','pz','nz'];
  // a box hugging one edge of a cell: d = side (0 +x, 1 -x, 2 +z, 3 -z), L = the edge line, u0..u1 along it, i0..i1 = depth into the cell
  const edgeBox=(d,L,u0,u1,i0,i1,y0,y1,mat,o)=>d===0?B(L-i1,y0,u0,L-i0,y1,u1,mat,o):d===1?B(L+i0,y0,u0,L+i1,y1,u1,mat,o):d===2?B(u0,y0,L-i1,u1,y1,L-i0,mat,o):B(u0,y0,L+i0,u1,y1,L+i1,mat,o);
  // walk all cell edges (cell, side, neighbour) and gather runs of edges that share a key along the same line
  const edgeRuns=(fn,emit)=>{const runs=new Map();
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)for(let d=0;d<4;d++){const i2=i+DIRS[d][0],j2=j+DIRS[d][1];if(!inG(i2,j2))continue;const key=fn(i,j,i2,j2,d);if(key==null)continue;
      const line=d===0?i+1:d===1?i:d===2?j+1:j,along=d<2?j:i,kk=d+'|'+line+'|'+key;let r=runs.get(kk);if(!r)runs.set(kk,r=[]);r.push(along)}
    for(const [kk,arr] of runs){const p=kk.split('|'),d=+p[0],line=+p[1],key=p.slice(2).join('|');arr.sort((a,b)=>a-b);const L=(d<2?X0:Z0)+line*CS,o=d<2?Z0:X0;let s=arr[0],q=arr[0];
      for(let n=1;n<=arr.length;n++){if(n<arr.length&&arr[n]===q+1){q=arr[n];continue}emit(d,L,o+s*CS,o+(q+1)*CS,key);if(n<arr.length)s=q=arr[n]}}};
  const roofed=(i,j)=>{const k=KK[j*NX+i];if(k!==2&&k!==6)return false;const x=X0+(i+.5)*CS,z=Z0+(j+.5)*CS;return !(k===6&&x<12)&&!(x>20.5&&z<16.5)};
  // ---- ground: one box per run of cells with the same floor height and finish; risers and retaining walls are the box sides
  const TOP={s:'cobble',p:'pavers',g:'cobbleR',d:'cellarF'};
  const gkey=new Array(NX*NZ);
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const c=G[j][i],k=j*NX+i;if(!floorC(c))continue;const t=KK[k],h=HH[k];
    let lo=h;for(const [a,b] of DIRS){const i2=i+a,j2=j+b;if(inG(i2,j2)&&floorC(G[j2][i2]))lo=Math.min(lo,HH[j2*NX+i2])}
    const top=t===4?'stepW':t===6?'stoneIt':TOP[c]||'cobble',side=t===3||t===5?'retW':t===0||t===2?'cellarW':'stoneIt';
    const gr=t===0&&lo>-.01,y0=gr?-1:Math.min(t===0||t===2||t===6?-1:0,Math.round((lo-.6)*100)/100);
    gkey[k]=h+'|'+top+'|'+side+'|'+y0+'|'+(gr?1:0)+'|'+(t===1||t===4||t===6?1:0)}
  {const used=new Uint8Array(NX*NZ);
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i;if(used[k]||!gkey[k])continue;const key=gkey[k];let i1=i;while(i1+1<NX&&!used[k+i1+1-i]&&gkey[k+i1+1-i]===key)i1++;
      let j1=j;for(;;){if(j1+1>=NZ)break;let ok=true;for(let q=i;q<=i1;q++){const kk=(j1+1)*NX+q;if(used[kk]||gkey[kk]!==key){ok=false;break}}if(!ok)break;j1++}
      for(let jj=j;jj<=j1;jj++)for(let q=i;q<=i1;q++)used[jj*NX+q]=1;
      const p=key.split('|'),hh=+p[0],x0=X0+i*CS,x1=X0+(i1+1)*CS,z0=Z0+j*CS,z1=Z0+(j1+1)*CS;const o=p[4]==='1'?{ground:1}:{f:{py:p[1],ny:N}};if(p[5]==='1')o.stair=1;
      B(x0,+p[3],z0,x1,hh,z1,p[4]==='1'?p[1]:p[2],o)}}
  // ---- pools and the water channel: a stone basin you can wade into, a fountain in the big one
  {const seen=new Uint8Array(NX*NZ);
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){if(G[j][i]!=='w'||seen[j*NX+i])continue;let i0=i,i1=i,j0=j,j1=j;const st=[[i,j]];seen[j*NX+i]=1;
    while(st.length){const [a,b]=st.pop();i0=Math.min(i0,a);i1=Math.max(i1,a);j0=Math.min(j0,b);j1=Math.max(j1,b);
      for(const [c,d] of [[a+1,b],[a-1,b],[a,b+1],[a,b-1]])if(inG(c,d)&&G[d][c]==='w'&&!seen[d*NX+c]){seen[d*NX+c]=1;st.push([c,d])}}
    const x0=X0+i0*CS,x1=X0+(i1+1)*CS,z0=Z0+j0*CS,z1=Z0+(j1+1)*CS,r=Math.min(x1-x0,z1-z0)<2?.2:.35;
    B(x0,-1.6,z0,x1,-.6,z1,'stoneIt',{ground:1});B(x0,-.6,z0,x1,.45,z0+r,'stoneIt');B(x0,-.6,z1-r,x1,.45,z1,'stoneIt');B(x0,-.6,z0+r,x0+r,.45,z1-r,'stoneIt');B(x1-r,-.6,z0+r,x1,.45,z1-r,'stoneIt');
    B(x0+r,-.14,z0+r,x1-r,-.12,z1-r,'water',{nosolid:true});
    if(Math.min(x1-x0,z1-z0)>3){const cx=(x0+x1)/2,cz=(z0+z1)/2;B(cx-.5,-.6,cz-.5,cx+.5,.85,cz+.5,'stoneIt');B(cx-1,.85,cz-1,cx+1,1.1,cz+1,'stoneIt');B(cx-.85,1.06,cz-.85,cx+.85,1.1,cz+.85,'water',{nosolid:true});
      B(cx-.2,1.1,cz-.2,cx+.2,2.1,cz+.2,'stoneIt');B(cx-.36,2.1,cz-.36,cx+.36,2.24,cz+.36,'stoneIt');B(cx-.12,2.24,cz-.12,cx+.12,2.6,cz+.12,'stoneIt');MAP.spray.push([cx,2.5,cz])}}}
  // ---- houses: stucco blocks with terracotta roofs; faces that only see the outside are not drawn
  const CARVE=PL.carve.concat([[-14,-10,-1.5,-3.5]]);// the walk-through house is built by hand below
  const subR=(p,c)=>{if(p[2]<=c[0]||p[0]>=c[2]||p[3]<=c[1]||p[1]>=c[3])return [p];const out=[],q=(a,b,e,f)=>{if(e-a>.01&&f-b>.01)out.push([a,b,e,f].concat(p.slice(4)))};
    q(p[0],p[1],c[0],p[3]);q(c[2],p[1],p[2],p[3]);const mx0=Math.max(p[0],c[0]),mx1=Math.min(p[2],c[2]);q(mx0,p[1],mx1,c[1]);q(mx0,c[3],mx1,p[3]);return out};
  const blds=[];for(const b of D.bld){if(b[6]===3){blds.push(b.slice());continue}let parts=[b.slice()];for(const c of CARVE){const np=[];for(const p of parts)np.push(...subR(p,c));parts=np}blds.push(...parts)}
  // a house that only shows a storey above the upper quarter is raised; the wall behind the fresco is lifted for it
  // the east edge is kept low beside the terrace so the hills show over it
  for(const b of blds){if(b[0]>=40.4&&b[6]===0)b[4]=5.8;if(b[6]===3&&b[0]>=42.9&&b[3]>4&&b[1]<26)b[4]=Math.min(b[4],6.5)}
  for(const b of blds){if(b[6]===3)continue;let lv=0,cel=false;const [x0,z0,x1,z1]=b;
    for(let x=x0+.25;x<x1;x+=.5)for(const z of [z0-.25,z1+.25]){const c=at(x,z);if(floorC(c)){const t=kAt(x,z);if(t===2||t===6)cel=true;else lv=Math.max(lv,hAt(x,z))}}
    for(let z=z0+.25;z<z1;z+=.5)for(const x of [x0-.25,x1+.25]){const c=at(x,z);if(floorC(c)){const t=kAt(x,z);if(t===2||t===6)cel=true;else lv=Math.max(lv,hAt(x,z))}}
    if(b[6]!==0&&b[4]-lv<4.5)b[4]=Math.round((lv+4.5+H(x0,z0,71)*2.5)*2)/2;b.cel=cel;if(x0<-27.5&&x1>-27.5&&z0<-15.2&&z1>-15.2)b[4]=Math.max(b[4],9.5)}
  const lanterns=[],lines=[],doorZ=[];
  const near=(L,x,z,d)=>L.some(p=>Math.hypot(p[0]-x,p[1]-z)<d);
  const flatK=t=>t===0||t===3||t===5;
  for(const b of blds){const [x0,z0,x1,z1,h,v,k]=b;const mat=['facA','facB','facC'][v];const f={py:'roofIt',ny:N};const open={};
    if(k===3){// backdrop beyond the edge: only the faces turned toward the town are drawn
      const cx=(x0+x1)/2,cz=(z0+z1)/2;if(cx>0)f.px=N;else f.nx=N;if(cz>0)f.pz=N;else f.nz=N;B(x0,0,z0,x1,h,z1,mat,{f});
      if(x1-x0>=3&&H(x0,z0,61)<.5){B(x0+.3,h,z0+.6,x1-.3,h+.5,z1-.6,'roofIt',{nosolid:true,f:{ny:N}})}continue}
    for(const fk of OUTF){let w=0,o=0,n=0;const ax=fk==='px'||fk==='nx';const fixed=fk==='px'?x1+.25:fk==='nx'?x0-.25:fk==='pz'?z1+.25:z0-.25;
      for(let u=(ax?z0:x0)+.25;u<(ax?z1:x1);u+=.5){const c=ax?at(fixed,u):at(u,fixed);n++;if(walk(c))w++;else if(c==='.')o++}
      if(o===n)f[fk]=N;open[fk]=w}
    B(x0,0,z0,x1,h,z1,mat,{f});
    if(b.cel)B(x0,-3.2,z0,x1,0,z1,'cellarW',{f:{py:N,ny:N}});// foundations: the cellar walls
    const w=x1-x0,d=z1-z0;
    // eaves over the street sides, a ridge on wide roofs, the odd chimney
    const E={nosolid:true,f:{ny:'woodIt',px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt'}};
    if(open.px)B(x1,h-.24,z0,x1+.42,h,z1,'roofIt',E);if(open.nx)B(x0-.42,h-.24,z0,x0,h,z1,'roofIt',E);if(open.pz)B(x0,h-.24,z1,x1,h,z1+.42,'roofIt',E);if(open.nz)B(x0,h-.24,z0-.42,x1,h,z0,'roofIt',E);
    if(Math.min(w,d)>=4){const R={nosolid:true,f:{ny:N}};if(w>=d){const cz=(z0+z1)/2;B(x0+.3,h,cz-d*.3,x1-.3,h+.45,cz+d*.3,'roofIt',R);B(x0+.5,h+.45,cz-d*.13,x1-.5,h+.8,cz+d*.13,'roofIt',R)}
      else{const cx=(x0+x1)/2;B(cx-w*.3,h,z0+.3,cx+w*.3,h+.45,z1-.3,'roofIt',R);B(cx-w*.13,h+.45,z0+.5,cx+w*.13,h+.8,z1-.5,'roofIt',R)}}
    if(k===1&&H(x0,z0,1)<.35&&w>2&&d>2){const cx=x0+.6+H(x0,z1,2)*(w-1.2),cz=z0+.6+H(x1,z0,3)*(d-1.2);B(cx-.3,h,cz-.3,cx+.3,h+1.3,cz+.3,'stoneIt',{nosolid:true});B(cx-.38,h+1.3,cz-.38,cx+.38,h+1.42,cz+.38,'stoneIt',{nosolid:true})}
    // the street faces: doors at street level (some under a little tiled hood), flower boxes, balconies, lanterns, laundry across narrow lanes
    for(const fk of OUTF){if(open[fk]<4)continue;const ax=fk==='px'||fk==='nx';const sgn=fk==='px'||fk==='pz'?1:-1;const wall=fk==='px'?x1:fk==='nx'?x0:fk==='pz'?z1:z0;
      if(fk==='pz'&&Math.abs(wall+15)<.01&&x0<-27.5&&x1>-27.5)continue;// the fresco wall stays bare
      const a0=ax?z0:x0,a1=ax?z1:x1;const P=(u,o)=>ax?[wall+sgn*o,u]:[u,wall+sgn*o];
      const FB=(u0,u1,y0,y1,o0,o1,m,oo)=>{const p0=P(u0,o0),p1=P(u1,o1);B(p0[0],y0,p0[1],p1[0],y1,p1[1],m,oo)};
      const front=u=>{const q=P(u,.6),c=at(q[0],q[1]);if(!floorC(c))return null;const t=kAt(q[0],q[1]);if(t===2||t===6)return null;return {y:hAt(q[0],q[1]),t}};
      for(let u=Math.ceil((a0-1.5)/3)*3+1.5;u<=a1-.6;u+=3){if(u-.6<a0)continue;const F=front(u);if(!F)continue;const gy=F.y,r=H(u,wall,11);
        if(r<.16&&flatK(F.t)&&u-.75>a0&&u+.75<a1){const l=front(u-.6),rr=front(u+.6);if(l&&rr&&l.y===gy&&rr.y===gy){
          FB(u-.65,u+.65,gy,gy+2.5,0,.04,'doorIt',{nosolid:true});FB(u-.8,u-.65,gy,gy+2.7,0,.12,'stoneIt',{nosolid:true});FB(u+.65,u+.8,gy,gy+2.7,0,.12,'stoneIt',{nosolid:true});FB(u-.8,u+.8,gy+2.5,gy+2.7,0,.12,'stoneIt',{nosolid:true});
          const p0=P(u-.85,-.1),p1=P(u+.85,.6);doorZ.push([Math.min(p0[0],p1[0]),Math.min(p0[1],p1[1]),Math.max(p0[0],p1[0]),Math.max(p0[1],p1[1])]);
          if(H(u,wall,12)<.4)FB(u-1.05,u+1.05,gy+2.82,gy+2.92,0,.72,'roofIt',{nosolid:true,f:{ny:'woodIt',px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt'}})}}
        const f0=Math.floor(gy/3+.01)+1;
        for(let fl=f0;3*fl+2.5<h;fl++){const q=H(u,wall,20+fl);
          if(q<.3)FB(u-.58,u+.58,3*fl+.74,3*fl+1,0,.26,'flowers',{nosolid:true});
          else if(fl===f0&&q>.84&&u-1>a0&&u+1<a1){FB(u-.95,u+.95,3*fl+.82,3*fl+.97,0,.95,'stoneIt',{nosolid:true});FB(u-.95,u+.95,3*fl+.97,3*fl+1.9,.9,.95,'ironRail',{nosolid:true});FB(u-.95,u-.9,3*fl+.97,3*fl+1.9,0,.95,'ironRail',{nosolid:true});FB(u+.9,u+.95,3*fl+.97,3*fl+1.9,0,.95,'ironRail',{nosolid:true})}}}
      for(let u=Math.ceil(a0/3)*3;u<=a1-.5;u+=3){if(u-.3<a0)continue;const F=front(u);if(!F)continue;const gy=F.y,pp=P(u,.5);
        if(lanterns.length<40&&!near(lanterns,pp[0],pp[1],9)&&h-gy>4.5&&flatK(F.t)){lanterns.push(pp);FB(u-.05,u+.05,gy+3.35,gy+3.45,0,.42,'metal2',{nosolid:true});FB(u-.13,u+.13,gy+2.95,gy+3.3,.3,.56,'lampO',{nosolid:true});FB(u-.17,u+.17,gy+3.3,gy+3.38,.26,.6,'metal2',{nosolid:true})}
        // laundry: find the house across the lane
        if(lines.length<18&&h-gy>6.2){let dist=0;for(let o=1;o<=6.5;o+=.5){const q=P(u,o);if(!walk(at(q[0],q[1]))){dist=o;break}}
          if(dist>=2&&H(u,wall,31)<.5&&!near(lines,P(u,dist/2)[0],P(u,dist/2)[1],6)){const y=gy+5.7,mid=P(u,dist/2);lines.push(mid);
            FB(u-.012,u+.012,y,y+.02,0,dist,'metal2',{nosolid:true});for(let o=.6;o<dist-.4;o+=.7+H(o,u,32)*.5){const cm='cloth'+Math.floor(H(o,u,33)*3);const wd=.35+H(o,u,34)*.3;FB(u-.01,u+.01,y-.55-H(o,u,35)*.3,y,o,Math.min(dist-.2,o+wd),cm,{nosolid:true})}}}}}}
  itHouse(doorZ);
  // ---- copings and railings along every drop; stairs get a stepped stucco parapet, the east terrace a wooden rail on a low wall
  const GAP=[[38.6,11.9,39.8,12.1]];// no rail where the crates come up
  edgeRuns((i,j,i2,j2,d)=>{const k=j*NX+i,k2=j2*NX+i2;if(!floorC(G[j][i])||!floorC(G[j2][i2]))return null;const dh=HH[k]-HH[k2];if(dh<.55||roofed(i2,j2))return null;
    {const ex=d<2?X0+(d===0?i+1:i)*CS:X0+(i+.5)*CS,ez=d<2?Z0+(j+.5)*CS:Z0+(d===2?j+1:j)*CS;if(GAP.some(r=>ex>=r[0]&&ex<=r[2]&&ez>=r[1]&&ez<=r[3]))return null}
    const t=KK[k];return HH[k]+'|'+(t===4||t===6?'p':t===5?'w':'i')+'|'+(dh>=1?1:0)},(d,L,u0,u1,key)=>{const p=key.split('|'),ha=+p[0],st=p[1],rail=p[2]==='1';
    if(st==='p'){edgeBox(d,L,u0,u1,0,.22,ha,ha+.95,'retW',{f:{py:'stoneIt'}});return}
    if(st==='w'){edgeBox(d,L,u0,u1,0,.3,ha,ha+.3,'stoneIt');if(!rail)return;const n=Math.max(1,Math.round((u1-u0)/1.4));
      for(let q=0;q<=n;q++){const u=lerp(u0+.06,u1-.06,q/n);edgeBox(d,L,u-.05,u+.05,.1,.2,ha+.3,ha+1.08,'woodIt')}
      edgeBox(d,L,u0,u1,.11,.19,ha+.62,ha+.7,'woodIt');edgeBox(d,L,u0,u1,.09,.21,ha+.99,ha+1.08,'woodIt');return}
    edgeBox(d,L,u0,u1,0,.3,ha,ha+.08,'stoneIt');if(!rail)return;const n=Math.max(1,Math.round((u1-u0)/1.6));
    for(let q=0;q<=n;q++){const u=lerp(u0+.04,u1-.04,q/n);edgeBox(d,L,u-.03,u+.03,.11,.17,ha+.08,ha+1.06,'metal2')}
    edgeBox(d,L,u0,u1,.13,.15,ha+.08,ha+.99,'ironRail',{pass:1});edgeBox(d,L,u0,u1,.1,.18,ha+.99,ha+1.06,'metal2')});
  // ---- rubble plinths along every wall foot: house fronts and the faces of the retaining walls
  edgeRuns((i,j,i2,j2,d)=>{const k=j*NX+i,c=G[j][i];if(!floorC(c))return null;const t=KK[k];if(t===2||t===6)return null;const c2=G[j2][i2],hb=HH[k];let top;
    if(c2==='#')top=hb+1.15;else if(floorC(c2)){const dh=HH[j2*NX+i2]-hb;if(dh<.9)return null;top=hb+Math.min(1.15,dh-.14)}else return null;
    const ex=d<2?X0+(d===0?i+1:i)*CS:X0+(i+.5)*CS,ez=d<2?Z0+(j+.5)*CS:Z0+(d===2?j+1:j)*CS;if(doorZ.some(r=>ex>=r[0]&&ex<=r[2]&&ez>=r[1]&&ez<=r[3]))return null;
    return hb+'|'+top.toFixed(2)},(d,L,u0,u1,key)=>{const p=key.split('|'),f={ny:N};f[OUTF[d]]=N;edgeBox(d,L,u0,u1,0,.07,+p[0]-.02,+p[1],'rubble',{nosolid:true,f})});
  // ---- the wine cellar: roof, walls where it meets the street, beams, racks, barrels, lanterns
  {const rk=new Array(NX*NZ);for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)if(roofed(i,j))rk[j*NX+i]=X0+(i+.5)*CS>27?'t':'h';
    const used=new Uint8Array(NX*NZ);
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i;if(used[k]||!rk[k])continue;const key=rk[k];let i1=i;while(i1+1<NX&&!used[k+i1+1-i]&&rk[k+i1+1-i]===key)i1++;
      let j1=j;for(;;){if(j1+1>=NZ)break;let ok=true;for(let q=i;q<=i1;q++){const kk=(j1+1)*NX+q;if(used[kk]||rk[kk]!==key){ok=false;break}}if(!ok)break;j1++}
      for(let jj=j;jj<=j1;jj++)for(let q=i;q<=i1;q++)used[jj*NX+q]=1;
      const y0=key==='t'?2.6:1,y1=key==='t'?3:2.6;B(X0+i*CS,y0,Z0+j*CS,X0+(i1+1)*CS,y1,Z0+(j1+1)*CS,'retW',{f:{ny:'beamC',py:'roofFl'}})}}
  edgeRuns((i,j,i2,j2)=>{if(!roofed(i,j)||!floorC(G[j2][i2]))return null;const t2=KK[j2*NX+i2];if(t2===2||t2===6)return null;const ha=HH[j*NX+i];if(HH[j2*NX+i2]-ha<.55)return null;return ha+''},
    (d,L,u0,u1,key)=>{const f={};f[OUTF[d]]='retW';edgeBox(d,L,u0,u1,0,.3,+key,1,'cellarW',{f})});
  {// along the hall: find the walls north and south of the middle line, put racks against the long straight stretches
    const wallZ=(x,dir)=>{let z=19.25;for(let s=0;s<14;s++){const z2=z+dir*.5;if(!(kAt(x,z2)===2||kAt(x,z2)===6)||!floorC(at(x,z2)))return dir>0?z+.25:z-.25;z=z2}return null};
    const runs=[];for(let x=12.75;x<24;x+=.5)for(const dir of [1,-1]){if(dir<0&&x>20.5)continue;const wz=wallZ(x,dir);if(wz==null)continue;const r=runs.find(q=>q.dir===dir&&q.z===wz&&Math.abs(q.x1-(x-.25))<.01);if(r)r.x1=x+.25;else runs.push({dir,z:wz,x0:x-.25,x1:x+.25})}
    for(const r of runs){const len=r.x1-r.x0;if(len<1.2)continue;const n=Math.floor(len/1.25);for(let q=0;q<n;q++){const xa=r.x0+(len-n*1.25)/2+q*1.25;if(H(xa,r.z,91)<.2)continue;
      if(r.dir>0)B(xa+.03,CEL,r.z-.42,xa+1.22,CEL+2.3,r.z,'woodIt',{f:{nz:'rack'}});else B(xa+.03,CEL,r.z,xa+1.22,CEL+2.3,r.z+.42,'woodIt',{f:{pz:'rack'}})}}}
  for(let x=12.6;x<26.8;x+=2.4)B(x-.14,.62,16.5,x+.14,1,21.5,'woodIt',{nosolid:true});B(11.5,.7,18.86,27,1,19.14,'woodIt',{nosolid:true});
  for(const [x,z] of [[12.4,17.1],[13,17.1],[12.7,17.7],[23.6,15.2],[24.2,15.1],[25.9,14.6],[26.3,15.3],[21.2,14.6],[16.3,21.6],[16.9,21.7],[20.4,21.2]])if(kAt(x,z)===2)drum(x,z,CEL,'barrel');
  B(16.5,CEL+.74,18.75,19.5,CEL+.84,19.25,'woodIt');B(16.7,CEL,18.85,16.85,CEL+.74,19.15,'woodIt');B(19.15,CEL,18.85,19.3,CEL+.74,19.15,'woodIt');
  for(const x of [14,19,23.4]){B(x-.02,.2,18.98,x+.02,.7,19.02,'metal2',{nosolid:true});B(x-.16,-.18,18.84,x+.16,.2,19.16,'lampO',{nosolid:true});B(x-.2,.2,18.8,x+.2,.26,19.2,'metal2',{nosolid:true});LIGHT(x,-.35,19,'#ffb45a',7.5,.6)}
  LIGHT(9.5,-1,19,'#ffb45a',5,.3);
  // the stairwell down from the street: an arch over its mouth with the sign; ivy in the light well; the arched way out east
  B(7.25,2.7,16.5,7.75,3.1,22,'stoneIt');for(const z of [16.25,21.75])B(7.25,0,z-.25,7.75,2.7,z+.25,'stoneIt');B(7.2,2.75,18,7.25,3.05,20.5,'signIt',{nosolid:true});
  for(const [x0,z0,x1,z1,face,ytop] of [[20.6,14,22.2,14.06,'pz',10],[23.4,14,24.6,14.06,'pz',10],[25.4,14,26.8,14.06,'pz',10],[20.5,14.4,20.56,15.8,'px',9],[26.94,14.6,27,16.2,'nx',8]]){
    const f={px:N,nx:N,py:N,ny:N,pz:N,nz:N};f[face]='ivy';B(x0,ytop-3.2-H(x0,z0,93)*2,z0,x1,ytop,z1,'ivy',{nosolid:true,f})}
  for(const z of [17.5,20.5]){const s=z<19?1:-1;B(29,0,z-(s>0?0:.3),29.25,2.6,z+(s>0?.3:0),'stoneIt',{nosolid:true});B(29,2.05,z+(s>0?.3:-.75),29.25,2.6,z+(s>0?.75:-.3),'stoneIt',{nosolid:true})}
  B(29,2.6,17.3,29.3,3.15,20.7,'stoneIt');
  // ---- the north market lane: a striped awning on posts and a row of fruit stalls
  for(let x=1.5;x<18.5;x+=2.6){if(!walk(at(x,-19))||!walk(at(x+1.6,-19)))continue;B(x,0,-19.6,x+1.6,.85,-18.5,'woodIt',{f:{py:'fruit'}});B(x+.2,.85,-19.4,x+1.4,1.0,-18.7,'fruit',{f:{px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt',ny:N}});
    for(const [a,b] of [[x,-19.6],[x+1.54,-19.6],[x,-18.56],[x+1.54,-18.56]])B(a,0,b,a+.06,2.35,b+.06,'woodIt',{nosolid:true});B(x-.15,2.35,-19.9,x+1.75,2.42,-18.2,'awn',{nosolid:true})}
  for(let x=0.5;x<19.5;x+=3.2)if(walk(at(x,-22.6)))B(x,0,-22.65,x+.12,3.1,-22.53,'woodIt');
  B(0.4,3.1,-23.6,19.6,3.18,-22.4,'awn',{nosolid:true});
  for(let x=1;x<19;x+=1.3)if(walk(at(x,-23.2))&&H(x,0,41)<.6){const s=.55+H(x,1,42)*.25;B(x,0,-23.45,x+s,s,-23.45+s,'woodIt',{f:{py:'fruit'}});if(H(x,2,43)<.4)B(x+.05,s,-23.4,x+s-.05,s+.45,-23.45+s-.05,'woodIt',{f:{py:'fruit'}})}
  // ---- the second market on the east square
  for(const [x,z] of [[32.6,3],[35.2,3],[37.8,3],[33.8,7.4],[36.6,7.4]]){if(!walk(at(x+.8,z+.5)))continue;B(x,0,z,x+1.7,.85,z+1.1,'woodIt',{f:{py:'fruit'}});
    for(const [a,b] of [[x,z],[x+1.64,z],[x,z+1.04],[x+1.64,z+1.04]])B(a,0,b,a+.06,2.3,b+.06,'woodIt',{nosolid:true});B(x-.2,2.3,z-.3,x+1.9,2.37,z+1.4,'awn',{nosolid:true})}
  // ---- the east terrace: café tables, planters; crates stacked against its north wall give a second (jumping) way up
  B(38.6,0,9.7,39.8,1,10.9,'woodIt');B(38.6,0,10.9,39.8,1,12,'woodIt');B(38.65,1,10.95,39.75,2,11.98,'woodIt');
  for(const [x,z] of [[36.2,14.6],[38.6,17.6],[36.4,19.6]]){B(x-.06,U,z-.06,x+.06,U+.74,z+.06,'metal2');B(x-.45,U+.74,z-.45,x+.45,U+.8,z+.45,'woodIt');for(const [a,b] of [[-.8,0],[.8,0]])B(x+a-.2,U,z+b-.2,x+a+.2,U+.46,z+b+.2,'woodIt')}
  for(const [x,z] of [[39.8,12.8],[39.8,20.8],[34.3,20.8]]){B(x-.35,U,z-.35,x+.35,U+.6,z+.35,'stoneIt');B(x-.3,U+.6,z-.3,x+.3,U+1.3,z+.3,'leaves',{nosolid:true})}
  // ---- the piazza fresco under its little roof, timber posts along the wall; the iron gate at the bottom of the lane
  B(-29.9,3.55,-15,-26.5,7.8,-14.94,'fresco',{nosolid:true,f:{px:N,nx:N,py:N,ny:N,nz:N}});
  B(-30.4,7.95,-15,-26,8.07,-14.55,'roofIt',{nosolid:true,f:{ny:'woodIt',px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt'}});
  for(const x of [-31.2,-30.45,-25.95,-23.8])B(x-.11,U,-15,x+.11,9.08,-14.82,'woodIt');B(-31.4,8.9,-15,-23.6,9.08,-14.8,'woodIt');
  {const g=hAt(-35,-13.75);B(-36.2,g,-14,-33.8,g+3,-13.96,'gateA',{nosolid:true,f:{px:N,nx:N,py:N,ny:N,nz:N}});
  B(-36.6,g,-14,-36.2,g+3.25,-13.8,'stoneIt');B(-33.8,g,-14,-33.4,g+3.25,-13.8,'stoneIt');B(-36.6,g+3,-14,-33.4,g+3.5,-13.8,'stoneIt')}
  for(const [x,z] of [[-36.3,-12.9],[-36.4,-12.2],[-33.6,-13.1]])drum(x,z,hAt(x,z),'barrel');
  // ---- the fountain court: benches, potted trees; cypresses up in the west quarter
  for(const [x,z,ax] of [[-10.6,10.6,'x'],[-1.6,12,'z'],[-1.6,17,'z'],[-6.5,20.6,'x']])if(walk(at(x,z))){if(ax==='x')B(x-.9,0,z-.22,x+.9,.45,z+.22,'stoneIt');else B(x-.22,0,z-.9,x+.22,.45,z+.9,'stoneIt')}
  const tree=(x,z,s)=>{if(!floorC(at(x,z)))return;const y=hAt(x,z);B(x-.35,y,z-.35,x+.35,y+.55,z+.35,'stoneIt');B(x-.07,y+.55,z-.07,x+.07,y+1.6*s,z+.07,'bark');B(x-.6*s,y+1.4*s,z-.6*s,x+.6*s,y+2.6*s,z+.6*s,'leaves',{nosolid:true});B(x-.42*s,y+2.6*s,z-.42*s,x+.42*s,y+3.2*s,z+.42*s,'leaves',{nosolid:true})};
  tree(-10.6,8.4,1);tree(-3,8.2,1);tree(-25,-14,1.1);tree(-31,-14.2,1.1);tree(25,-1.2,1);
  const cypress=(x,z)=>{if(!floorC(at(x,z)))return;const y=hAt(x,z);B(x-.1,y,z-.1,x+.1,y+.8,z+.1,'bark');B(x-.45,y+.8,z-.45,x+.45,y+3.2,z+.45,'leaves',{nosolid:true});B(x-.33,y+3.2,z-.33,x+.33,y+4.6,z+.33,'leaves',{nosolid:true});B(x-.18,y+4.6,z-.18,x+.18,y+5.4,z+.18,'leaves',{nosolid:true})};
  cypress(-32.2,-1.5);cypress(-24.5,-8.6);cypress(-19,-13.2);cypress(-21,-1.2);
  // ---- the well and benches on the spawn piazza
  {const y=U;B(-28.6,y,-12.2,-27.4,y+.8,-11,'stoneIt');B(-28.4,y+.8,-12,-27.6,y+1.6,-11.8,'stoneIt',{nosolid:true});B(-28.4,y+.8,-11.4,-27.6,y+1.6,-11.2,'stoneIt',{nosolid:true});B(-28.6,y+1.6,-12.2,-27.4,y+1.75,-11,'roofIt',{nosolid:true});
    for(const [x,z] of [[-30.5,-9],[-25.5,-9.2]])if(walk(at(x,z)))B(x-.9,y,z-.22,x+.9,y+.45,z+.22,'stoneIt')}
  // ================= spawns, camps, title camera =================
  const free=(x,z)=>{const y=hAt(x,z);for(const [a,b] of [[0,0],[.6,0],[-.6,0],[0,.6],[0,-.6]]){const c=at(x+a,z+b);if(!floorC(c)||Math.abs(hAt(x+a,z+b)-y)>.05)return false}return true};
  MAP.spawns=[];for(let z=-14;z<=-8;z+=1.6)for(let x=-31.5;x<=-24.5;x+=1.7)if(free(x,z))MAP.spawns.push([x+rr(-.3,.3),z+rr(-.3,.3),hAt(x,z),-Math.PI/2+rr(-.5,.5)]);
  MAP.zspawns=[];for(const [x,z] of [[36,-0.5],[29,-12],[18,-22],[2,-21],[22,19.5],[11.75,24],[-6,23],[-5,12],[6,8],[30,8],[13,-12],[36,5.5]]){for(let r=0;r<3;r++){const xx=x+rr(-1,1)*r,zz=z+rr(-1,1)*r;if(free(xx,zz)){MAP.zspawns.push([xx,zz,hAt(xx,zz)]);break}}}
  const cp=(k,w,pts,look)=>{const p=pts.filter(q=>q[1]!=null||floorC(at(q[0],q[2]))).map(q=>[q[0],q[1]==null?hAt(q[0],q[2]):q[1],q[2]]);if(p.length)MAP.camps.push({k,w,p,look})};
  cp('terrace',.15,[[36,null,13.5],[38.6,null,16.5],[35,null,20.2]],[30,1,10]);
  cp('market',.12,[[4,0,-21.6],[9,0,-21.6],[14,0,-21.6]],[9,1,-17]);
  cp('fountain',.1,[[-9.5,0,11.2],[-3,0,11.5],[-9.8,0,21]],[-6,1,16]);
  cp('cellar',.13,[[13.5,null,18.2],[18,null,20.5],[22.4,null,17.4]],[10,-1.2,19]);
  cp('plaza',.12,[[-31,null,-14],[-24.5,null,-14.2]],[-28,U+1,-8]);
  cp('lane',.07,[[-35,null,-12.5],[-35.5,null,-11]],[-35,2.5,-4]);
  cp('apart',.12,[[-10.5,3,-6.5],[-6,3,-7],[-4,3,-5.5]],[-8,3.6,-12]);
  cp('ramp',.1,[[-19.5,null,-3],[-19,null,1.5]],[-8,1,-1]);
  cp('north',.08,[[-.4,null,-11.4],[.8,null,-11]],[0,1,-20]);
  cp('east',.08,[[38,0,1],[38.5,0,9.5]],[32,1,5]);
  MAP.spawnYaw=null;
  MAP.moon={d:new THREE.Vector3(-.5,.75,.42).normalize(),c:new THREE.Color('#fff0d6'),i:.8};
  // title backdrop: a slow high circle over the roofs
  MAP.cam=(t,cam)=>{const a=t*.035+.6;cam.position.set(Math.sin(a)*24,22+1.5*Math.sin(t*.07),Math.cos(a)*16);cam.lookAt(Math.sin(a+1.2)*4,0,Math.cos(a+1.2)*3)};
}
// ---- the walk-through house (plan x -14..-1.5, z -10..-3.5): ground floor on the street, upper floor level with the north piazza.
// Downstairs: an entrance hall and a stone store room with the stair; upstairs: a wallpapered room round the stair well and a hall.
function itHouse(doorZ){const X0=-14,X1=-1.5,Z0=-10,Z1=-3.5,T=.3,F1=2.8,F2=3,TOP=5.8,RH=7.5,N='none';
  const xi0=X0+T,xi1=X1-T,zi0=Z0+T,zi1=Z1-T;
  // floors: stone below, boards above with the stair well; the roof block's underside is the upper ceiling
  B(xi0,-1,zi0,xi1,0,zi1,'cellarF',{ground:1});
  slab(xi0,zi0,xi1,zi1,F1,F2,'woodIt',[[xi0,-8.4,-11.9,-4]],{f:{py:'woodFl',ny:'ceilT'}});// the well is open over the whole flight: tall zombies clear it
  B(X0,TOP,Z0,X1,RH,Z1,'retW',{f:{py:'roofIt',ny:'ceilT'}});
  const E={nosolid:true,f:{ny:'woodIt',px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt'}};
  B(X0,RH-.24,Z0-.42,X1,RH,Z0,'roofIt',E);B(X0,RH-.24,Z1,X1,RH,Z1+.42,'roofIt',E);
  {const R={nosolid:true,f:{ny:N}},cz=(Z0+Z1)/2,d=Z1-Z0;B(X0+.3,RH,cz-d*.3,X1-.3,RH+.45,cz+d*.3,'roofIt',R);B(X0+.5,RH+.45,cz-d*.13,X1-.5,RH+.8,cz+d*.13,'roofIt',R)}
  // outer walls: lime wash outside, stone inside downstairs, wallpaper upstairs. Openings are [u0,u1,y0,y1]
  const DN=[[-11.3,-9.7,F2,F2+2.46],[-5.3,-3.7,F2,F2+2.46]],WN=[[-13.4,-12.6,4.3,5.5],[-8,-7,4.3,5.5],[-2.9,-2.1,4.3,5.5]];
  const DS=[[-6.8,-5.2,0,2.4]],WSl=[],DSu=[[-11.3,-9.7,F2,F2+2.46]],WSu=[[-13.3,-12.5,4,5.4],[-7.6,-6.6,4,5.4],[-4.8,-3.8,4,5.4]];
  const fo=(o,i,m)=>{const f={};f[o]='retW';f[i]=m;return {f}};
  wallX(X0,X1,Z0,Z0+T,0,F1,'retW',[],fo('nz','pz','cellarW'));wallX(X0,X1,Z0,Z0+T,F1,TOP,'retW',DN.concat(WN),fo('nz','pz','wallP'));
  wallX(X0,X1,Z1-T,Z1,0,F1,'retW',DS.concat(WSl),fo('pz','nz','cellarW'));wallX(X0,X1,Z1-T,Z1,F1,TOP,'retW',DSu.concat(WSu),fo('pz','nz','wallP'));
  for(const [x0,x1,o,i] of [[X0,X0+T,'nx','px'],[X1-T,X1,'px','nx']]){wallZ(x0,x1,zi0,zi1,0,F1,'retW',[],fo(o,i,'cellarW'));wallZ(x0,x1,zi0,zi1,F1,TOP,'retW',[],fo(o,i,'wallP'))}
  // inner walls: downstairs a stone partition with a wide doorway, upstairs an open arch between the room and the hall
  wallZ(-7.8,-7.5,zi0,zi1,0,F1,'cellarW',[[-6.4,-4.2,0,2.3]]);wallZ(-8.9,-8.6,zi0,zi1,F2,TOP,'wallP',[[-7.4,-4.6,F2,F2+2.4]]);
  // the stair along the west wall, a handrail on its open side, a rail round the well upstairs
  stairs('z',xi0,-12.1,-4.4,-8.4,0,F2,10,'woodIt',{f:{py:'stepW'}});
  for(let s=2;s<10;s++){const za=-4.4-.4*s,top=.3*(s+1);B(-12.15,top,za-.4,-12.05,top+.9,za,'woodIt')}
  B(-11.95,F2,-8.4,-11.9,F2+.95,-4,'ironRail',{pass:1});B(-12,F2+.92,-8.4,-11.85,F2+1,-4,'woodIt');
  // door and window frames, shutters, sills; a hood over the street door, a balcony upstairs
  const frameX=(x0,x1,y0,y1,z0,z1)=>{B(x0,y0,z0,x0+.07,y1,z1,'woodIt',{nosolid:true});B(x1-.07,y0,z0,x1,y1,z1,'woodIt',{nosolid:true});B(x0,y1-.07,z0,x1,y1,z1,'woodIt',{nosolid:true})};
  for(const [x0,x1,y0,y1] of DN)frameX(x0,x1,y0,y1,Z0,Z0+T);for(const [x0,x1,y0,y1] of DS.concat(DSu))frameX(x0,x1,y0,y1,Z1-T,Z1);
  const win=(x0,x1,y0,y1,zf,s,sh)=>{const za=s>0?zf:zf-.04,zb=s>0?zf+.04:zf;B(x0-.5,y0,za,x0-.02,y1,zb,sh,{nosolid:true});B(x1+.02,y0,za,x1+.5,y1,zb,sh,{nosolid:true});
    B(x0-.08,y0-.1,s>0?zf:zf-.12,x1+.08,y0,s>0?zf+.12:zf,'stoneIt',{nosolid:true});frameX(x0,x1,y0,y1,s>0?zf-T:zf,s>0?zf:zf+T)};
  for(const w of WN)win(w[0],w[1],w[2],w[3],Z0,-1,'shutG');for(const w of WSl.concat(WSu))win(w[0],w[1],w[2],w[3],Z1,1,'shutR');
  for(const w of WN)B(w[0]-.08,w[2]-.36,Z0-.26,w[1]+.08,w[2]-.1,Z0,'flowers',{nosolid:true});
  B(-7.3,2.62,Z1,-4.7,2.72,Z1+.75,'roofIt',{nosolid:true,f:{ny:'woodIt',px:'woodIt',nx:'woodIt',pz:'woodIt',nz:'woodIt'}});for(const x of [-7.1,-4.9])B(x-.04,2.2,Z1,x+.04,2.62,Z1+.6,'woodIt',{nosolid:true});
  B(-11.9,2.9,Z1,-9.1,F2,Z1+.9,'stoneIt');B(-11.9,F2,Z1+.86,-9.1,F2+.95,Z1+.9,'ironRail',{pass:1});B(-11.9,F2,Z1,-11.86,F2+.95,Z1+.9,'ironRail',{pass:1});B(-9.14,F2,Z1,-9.1,F2+.95,Z1+.9,'ironRail',{pass:1});
  B(-11.95,F2+.95,Z1,-9.05,F2+1.01,Z1+.94,'metal2',{nosolid:true});
  doorZ.push([-11.4,-10.6,-9.6,-9.9],[-5.4,-10.6,-3.6,-9.9],[-6.9,-3.6,-5.1,-2.9]);
  // furniture: crates and barrels below, a table, cabinet and pictures above; wall lamps on both floors
  for(const [x,z] of [[-13.2,-9.2],[-12.6,-9.25],[-13.2,-8.65]])drum(x,z,0,'barrel');
  B(-9.6,0,-9.6,-8.4,1,-8.6,'woodIt');B(-9.3,1,-9.5,-8.6,1.6,-8.9,'woodIt');
  B(-4.2,.74,-8.4,-2.8,.82,-7.2,'woodIt');for(const [x,z] of [[-4.1,-8.3],[-2.9,-8.3],[-4.1,-7.3],[-2.9,-7.3]])B(x-.04,0,z-.04,x+.04,.74,z+.04,'woodIt');
  B(-2.4,0,-6.4,xi1,1.9,-5.2,'woodIt');
  B(-6.4,F2+.76,-7.1,-5,F2+.84,-5.7,'woodIt');B(-5.76,F2,-6.46,-5.64,F2+.76,-6.34,'woodIt');B(-2.35,F2,-6.6,xi1,F2+1.9,-5.2,'woodIt');
  B(-12.4,F2+1.3,zi0,-11.6,F2+1.95,zi0+.04,'paintA',{nosolid:true,f:{nz:N,px:N,nx:N,py:N,ny:N}});B(-7.2,F2+1.4,zi0,-6.1,F2+2.2,zi0+.04,'paintB',{nosolid:true,f:{nz:N,px:N,nx:N,py:N,ny:N}});
  B(xi1-.04,F2+1.3,-8.6,xi1,F2+2.1,-7.4,'paintB',{nosolid:true,f:{px:N,pz:N,nz:N,py:N,ny:N}});
  for(const [x,y,z,s] of [[-10.6,2.1,zi1,-1],[-4.4,2.1,zi0,1],[-9.2,F2+2.05,zi1,-1],[-8.2,F2+2.05,zi0,1],[-3.4,F2+2.05,zi1,-1]]){B(x-.12,y-.18,s>0?z:z-.12,x+.12,y+.18,s>0?z+.12:z,'lampO',{nosolid:true});LIGHT(x,y,z+s*.35,'#ffd49a',6.5,.62)}}
MAPDEFS.italy={n:['이탈리아','Italy'],d:['햇살 가득한 언덕 마을. 옹벽으로 나뉜 윗마을과 아랫길, 긴 경사로와 계단, 지나갈 수 있는 집, 반지하 와인 저장고, 동쪽의 높은 테라스.','A sunlit hill town: an upper quarter behind retaining walls, a long stepped ramp and stairs, a house you walk through, a sunken wine cellar and a high terrace in the east.'],
  env:{sky:1,sun:1,skyTex:'skyDay',halo:'#fff2d6',rain:0,storm:0,fog:'#bfcbd8',fogD:.011,bloomThr:.92,ambOut:'#7686a4',ambIn:'#46443f'},bounds:[-41,-27,41,27],probeY:[-1.6,.9,2.2,3.6,4.8,6.2,7.6],mini:[7.5,40],tex:bakeItTex,build:buildItaly};

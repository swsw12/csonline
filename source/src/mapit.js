'use strict';
// ============ Map "이탈리아 Italy": a hill town on a summer afternoon ============
// v6: rebuilt from a 3D reference of the town. The reference was voxelised at 0.25 m offline, the air reachable from the sky flood-filled,
// everything else made solid, and each column's solid runs merged into boxes (ITALY_DATA, mapit_data.js). Reachable floor tops keep
// their exact height; roofs and wall heads round up to 0.5 m. Only the geometry is taken: every surface is painted here.
Object.assign(MATS,{
  facA:{t:'facA',s:3,k:'stone',cs:1},facB:{t:'facB',s:3,k:'stone',cs:1},facC:{t:'facC',s:3,k:'stone',cs:1},
  // v6 colour variants, picked per wall from the reference's paint colour: salmon, orange, tan, ochre, grey plaster, bare brick
  facR:{t:'facR',s:3,k:'stone',cs:1},facO:{t:'facO',s:3,k:'stone',cs:1},facT:{t:'facT',s:3,k:'stone',cs:1},facY:{t:'facY',s:3,k:'stone',cs:1},facG:{t:'facG',s:3,k:'stone',cs:1},brickIt:{t:'brickIt',s:2,k:'stone',cs:1},
  // v6 colour variants, chosen per wall from the reference's paint colour (salmon, orange, tan, ochre, grey)
  facR:{t:'facR',s:3,k:'stone',cs:1},facO:{t:'facO',s:3,k:'stone',cs:1},facT:{t:'facT',s:3,k:'stone',cs:1},facY:{t:'facY',s:3,k:'stone',cs:1},facG:{t:'facG',s:3,k:'stone',cs:1},
  roofIt:{t:'roofIt',s:2,k:'stone',cs:2},cobble:{t:'cobble',s:1.5},pavers:{t:'pavers',s:2.4},cobbleR:{t:'cobbleR',s:1.5},
  stoneIt:{t:'stoneIt',s:2,cs:1},woodIt:{t:'woodIt',s:2,k:'wood'},doorIt:{t:'doorIt',uv:'box',k:'wood'},awn:{t:'awn',s:2,k:'soft'},fruit:{t:'fruit',uv:'box',k:'wood'},
  water:{t:'water',s:3,emis:.12,k:'glass'},flowers:{t:'flowers',uv:'box',k:'soft'},
  ironRail:{t:'ironRail',uv:'boxV',s:1.2,k:'metal'},cloth0:{t:'cloth0',uv:'box',k:'soft'},cloth1:{t:'cloth1',uv:'box',k:'soft'},cloth2:{t:'cloth2',uv:'box',k:'soft'},
  leaves:{t:'leaves',s:1.5,k:'soft'},bark:{t:'bark',s:1,k:'wood'},signIt:{t:'signIt',uv:'box',emis:.2,k:'wood'},
  retW:{t:'retW',s:2,k:'stone',cs:1},rubble:{t:'rubble',s:2,k:'stone'},stepW:{t:'stepW',s:1,k:'wood'},roofFl:{t:'roofFl',s:2,k:'stone',cs:2},
  cellarW:{t:'cellarW',s:2,k:'stone',cs:1},cellarF:{t:'cellarF',s:2},beamC:{t:'beamC',s:2,k:'wood'},rack:{t:'rack',uv:'box',k:'wood'},
  wallP:{t:'wallP',s:1,k:'stone'},woodFl:{t:'woodFl',s:2,k:'wood'},ceilT:{t:'ceilT',s:1.2,cs:1},
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
// bare brick: running bond, worn mortar, the odd darker or paler brick, soot streaks
function texBrickIt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/12),off=row%2?16:0,ry=y%12;for(let x=0;x<N;x++){const bx=Math.floor((x+off)/32),rx=(x+off)%32,id=row*13+bx;
    let c;if(ry<2||rx<2)c=dith(P,x,y,.5+(hash2(x,y,1451)-.5)*.3,['#6a6258','#7e766a','#8e8678'],.1);
    else{const t=.5+(hash2(id,1,1452)-.5)*.45+(P.n(x,y,16,1453,2)-.5)*.25+(hash2(x,y,1454)-.5)*.08;c=dith(P,x,y,clamp(t,0,1),['#5a2a1c','#723826','#884530','#9a5438','#ac6644'],.1)}
    P.set(x,y,c)}}for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,1455)*N),Math.floor(hash2(i,2,1455)*N*.5),60+Math.floor(hash2(i,3,1455)*140),.14,2)})}
function bakeItTex(){if(TEX.facA)return;
  // v6: only what the rebuilt town uses (the old hand-built set — awnings, frescoes, racks, cloth… — is no longer painted)
  TEX.facA=mkTex(texFacade('#e8e3d6','#3e6a46',961));TEX.facB=mkTex(texFacade('#ecd2b6','#8a3026',971));TEX.facC=mkTex(texFacade('#ded5c2','#5a4632',981));
  TEX.facR=mkTex(texFacade('#dca296','#3e6a46',1401));TEX.facO=mkTex(texFacade('#e0aa78','#5a4632',1411));TEX.facT=mkTex(texFacade('#dcc096','#8a3026',1421));TEX.facY=mkTex(texFacade('#e8cc80','#3e6a46',1431));TEX.facG=mkTex(texFacade('#cfccc4','#5a4632',1441));TEX.brickIt=mkTex(texBrickIt());
  TEX.roofIt=mkTex(texRoofIt());TEX.cobble=mkTex(texCobble(991));TEX.cobbleR=mkTex(texCobbleR());TEX.pavers=mkTex(texPavers());TEX.stoneIt=mkTex(texStoneIt());
  TEX.retW=mkTex(texRetW());TEX.cellarW=mkTex(texCellarW());TEX.cellarF=mkTex(texCellarF());TEX.woodFl=mkTex(texWoodFl());TEX.ceilT=mkTex(texCeilT());TEX.roofFl=mkTex(texRoofFl());
  if(!TEX.skyDay){TEX.skyDay=mkTex(texSkyDay());TEX.skyDay.wrapT=THREE.ClampToEdgeWrapping;TEX.skyDay.magFilter=THREE.LinearFilter}
  if(!TEX.sunDisc){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['facA','facB','facC','facR','facO','facT','facY','facG','brickIt','roofIt','cobble','cobbleR','pavers','stoneIt','retW','cellarF','woodFl'])TEX[k].anisotropy=an;
  MIXC.clear();VN_T.clear();_vnK=-1;_vnT=null;_fbC.length=0}
// ---------- geometry: decode the generated boxes ----------
// each box: x0 z0 w d y0 y1 (2 base-36 chars, cells of D.cs, y offset by D.base) + top material + side material (1 char each)
function buildItaly(){const D=ITALY_DATA,M=ITALY_META,S=D.boxes,CS=D.cs,N='none';
  // the top code carries +16 for boxes on steps or ramps: nav treats them as stairs (walk links up to .9 m per metre)
  // With the reference mesh present (ITALY_MESH) the boxes are collision only: every face is 'nodraw' and the mesh is what you see.
  // then the reference's own paint colour as a tint for the sides and for the top (0..35 -> 0.7..1.3 per channel)
  const v=i=>parseInt(S.substr(i,2),36),VIS=typeof ITALY_MESH==='undefined',ND='nodraw',tq=i=>[0,1,2].map(k=>.7+parseInt(S[i+k],36)/35*.6);
  for(let i=0;i+20<=S.length;i+=20){const x0=D.x0+v(i)*CS,z0=D.z0+v(i+2)*CS,x1=x0+v(i+4)*CS,z1=z0+v(i+6)*CS,y0=v(i+8)/D.yq-D.yo,y1=v(i+10)/D.yq-D.yo;
    const t=parseInt(S[i+12],36),top=D.mats[t&15],side=D.mats[parseInt(S[i+13],36)];
    const o={f:VIS?{py:top,ny:'ceilT'}:{px:ND,nx:ND,py:ND,ny:ND,pz:ND,nz:ND},tint:tq(i+14),ttop:tq(i+17)};if(t&16)o.stair=1;B(x0,y0,z0,x1,y1,z1,side,o)}
  // warm lamps over the covered floors (arcades, rooms, the cellar); the sun does the rest
  for(const p of (M.lights||[]).slice(0,20))LIGHT(p[0],p[1],p[2],p[1]<0?'#ffcf8a':'#ffe2b8',6,.8);
  MAP.spawns=M.spawns.map(p=>[p[0],p[2],p[1],rr(-.5,.5)+Math.PI]);
  MAP.zspawns=M.zspawns.map(p=>[p[0],p[2],p[1]]);
  MAP.camps=M.camps.map(o=>({k:o.k,w:o.w,p:o.p,look:o.look}));
  MAP.spawnYaw=null;
  MAP.moon={d:new THREE.Vector3(-.5,.75,.42).normalize(),c:new THREE.Color('#fff0d6'),i:.8};
  MAP.cam=(t,cam)=>{const a=t*.03+.6;cam.position.set(Math.sin(a)*30,26+1.5*Math.sin(t*.07),Math.cos(a)*44);cam.lookAt(Math.sin(a+1.2)*4,0,Math.cos(a+1.2)*8)};
}
// ---------- the reference town as the visible map: its own geometry and baked-light textures ----------
// the reference's baked light is very dark in the shade: a gamma lift brings the alleys up without washing out the sun
const FS_BAKED=GLSL_DYN+`uniform sampler2D map;uniform float uK;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 c=pow(t.rgb,vec3(.62))*uK+t.rgb*dynLight(vPos,n)*.6;gl_FragColor=vec4(applyFog(c,vPos),1.);}`;
function itMesh(scene){if(typeof ITALY_MESH==='undefined')return;
  const b64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer};
  for(const P of ITALY_MESH){
    const q=new Uint16Array(b64(P.pos)),uq=new Uint16Array(b64(P.uv)),nq=new Int8Array(b64(P.nrm)),ix=new Uint16Array(b64(P.idx)),n=q.length/3;
    const pos=new Float32Array(n*3),uv=new Float32Array(n*2),nrm=new Float32Array(n*3);
    for(let i=0;i<n;i++){for(let k=0;k<3;k++){pos[i*3+k]=P.bmin[k]+q[i*3+k]/65535*P.bsz[k];nrm[i*3+k]=nq[i*3+k]/127}
      for(let k=0;k<2;k++)uv[i*2+k]=P.umin[k]+uq[i*2+k]/65535*P.usz[k]}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
    geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setIndex(new THREE.BufferAttribute(ix,1));geo.computeBoundingSphere();
    // glTF texture space: no vertical flip, repeat (the atlases tile)
    const img=new Image(),tex=new THREE.Texture(img);tex.flipY=false;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.magFilter=THREE.LinearFilter;
    tex.anisotropy=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;img.onload=()=>{tex.needsUpdate=true};img.src=P.tex;
    const mat=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:tex},uK:{value:1.1}},LU),vertexShader:VS_WORLD,fragmentShader:FS_BAKED,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geo,mat);mesh.matrixAutoUpdate=false;mesh.updateMatrix();scene.add(mesh);MAP.meshes.push(mesh)}}
MAPDEFS.italy={n:['이탈리아','Italy'],d:['햇살 가득한 언덕 마을. 남쪽 낮은 거리에서 시작해 시장 광장, 와인 저장고, 북쪽 높은 골목까지 이어지는 오르막 시가지.','A hill town on a summer afternoon: from the low street in the south up through the market square and the wine cellar to the high lanes in the north.'],
  env:{sky:1,sun:1,skyTex:'skyDay',halo:'#fff2d6',rain:0,storm:0,fog:'#bfcbd8',fogD:.011,bloomThr:.92,ambOut:'#7686a4',ambIn:'#46443f'},bounds:[-34,-61,34,61],probeY:[-2.6,-.9,.9,2.6,4.4,6.2,8],mini:[1.2,4.6],tex:bakeItTex,build:buildItaly,mesh:itMesh};

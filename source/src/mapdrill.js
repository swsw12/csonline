'use strict';
// ============ Map "솔고개 훈련장 Solgogae Training Ground" (v7.9): an army training ground in a pine valley, late afternoon ============
// An original map (no reference), for the zombie modes and PvP alike. Mostly open ground: walls are earthworks, sandbags and timber,
// not buildings. Across the middle runs the trench line (교통호: 1.8 m deep, 2 m wide, a square wave of fire bays and traverses with
// firing steps you can climb out by, seven stairs out). North-west: the bunker hill — three grass terraces of 1.2 m and a concrete
// pillbox sunk into the top, its one door at the back down a few steps, firing slits round the front. North: the water tower, its
// catwalk at 7 m up a two-flight steel stair. North-east: the firing range — the firing line under a roof, lanes between sandbag
// walls, targets, the backstop berm and a 2.5 m berm along its west side; the range control tower (5 m) at the line's east end.
// East: the obstacle course — low walls to vault, 2.2 m walls you get over from one side only, beams, tyres, the two-deck net
// tower (2.5 m and 5 m). South: the parade square (연병장) with the reviewing stand and the flag, the closed gate and its guard post;
// the barracks (생활관) in the south-east; the motor pool with the vehicle shed, the fuel tank and the south-west watchtower; the
// supply depot's sandbag bays in the west. A chain-link fence all round, pines inside and out, forested hills beyond.
// The sun is low in the west-south-west (u .063, elevation 24°): long shadows to the east-north-east.
const DR_FONT='"Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
Object.assign(MATS,{
  drGrass:{t:'drGrass',s:3,k:'soft',cs:1},drDirt:{t:'drDirt',s:3,k:'soft',cs:1},drTrack:{t:'drTrack',s:3,k:'soft',cs:1},drMud:{t:'drMud',s:2,k:'soft',cs:1},
  drDuck:{t:'drDuck',s:1.2,k:'wood',cs:1},drRevet:{t:'drRevet',s:2.4,vo:-1.8,sv:1.8,k:'wood'},drEarth:{t:'drEarth',s:2.5,k:'soft',cs:1},drConc:{t:'drConc',s:2.4,k:'stone'},drConcI:{t:'drConcI',s:2.4,k:'stone'},
  drPlank:{t:'drPlank',s:1.6,k:'wood'},drPost:{t:'drPost',s:1,k:'wood'},drTin:{t:'drTin',s:1.6,k:'metal'},drSteel:{t:'drSteel',s:1.6,k:'metal'},drTank:{t:'drTank',s:2,k:'metal'},
  drPanel:{t:'drPanel',s:2.4,vo:0,sv:3.2,k:'stone'},drRoofB:{t:'drRoofB',s:1.6,k:'metal'},drGlassT:{t:'drGlassT',uv:'box',k:'glass'},drDoor:{t:'drDoor',uv:'box',k:'metal'},
  drLocker:{t:'drLocker',uv:'box',k:'metal'},drMatt:{t:'drMatt',s:1,k:'soft'},drTarget:{t:'drTarget',uv:'box',k:'wood'},drFloor:{t:'drFloor',s:1.6,k:'stone'},
  drSignGate:{t:'drSignGate',uv:'box',emis:.08,k:'metal'},drSignRange:{t:'drSignRange',uv:'box',emis:.1,k:'metal'},drSignObs:{t:'drSignObs',uv:'box',emis:.08,k:'metal'},
  drSignStand:{t:'drSignStand',uv:'box',emis:.1,k:'soft'},drSignBunk:{t:'drSignBunk',uv:'box',emis:.08,k:'metal'},drSignPill:{t:'drSignPill',uv:'box',k:'stone'},
  drLane1:{t:'drLane1',uv:'box',emis:.06,k:'wood'},drLane2:{t:'drLane2',uv:'box',emis:.06,k:'wood'},drLane3:{t:'drLane3',uv:'box',emis:.06,k:'wood'},drLane4:{t:'drLane4',uv:'box',emis:.06,k:'wood'},drLane5:{t:'drLane5',uv:'box',emis:.06,k:'wood'},drLane6:{t:'drLane6',uv:'box',emis:.06,k:'wood'},drFlag:{t:'drFlag',uv:'box',k:'soft'},drNet:{t:'drNet',s:1.2,k:'soft'},drCamo:{t:'drCamo',s:2.4,k:'soft'},drWireG:{t:'drWireG',s:1,k:'metal'},drWireL:{t:'drWire',s:3.6,vo:2.6,sv:.45,k:'metal'},
  drAmmo:{t:'drAmmo',uv:'box',k:'metal'},drCanvas:{t:'drCanvas',s:1.5,k:'soft'},drTruck:{t:'drTruck',s:2,k:'metal'},
  drPine:{t:'drPine',s:1,k:'soft'},drLine:{t:'drLine',s:1,k:'stone'},drBark:{t:'drBark',s:1,k:'wood'},drHill:{t:'drHill',s:8,k:'soft'},drGrassF:{t:'drGrass',s:3,k:'soft',cs:6},
});
// ---------- textures ----------
// the sky of a clear late afternoon: blue overhead going pale and warm low down, the sun low in the west-south-west, a few clouds lit
// from that side; two ridges of forested hills round the horizon (far ones blue with haze, near ones dark, with the tops of pines)
function texDrSky(){return paint(1024,256,P=>{const SU=64,SV=170,YH=232;
  const ridge=(x,s,f0)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=f0<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  const R1=new Float32Array(1024),R2=new Float32Array(1024);
  for(let x=0;x<1024;x++){R1[x]=YH-10-ridge(x,12011,3)*38;const tx=x%7,th=hash2(Math.floor(x/7),2,12033)*5;R2[x]=YH-3-ridge(x+300,12021,5)*22-th*(1-Math.abs(tx-3)/3.5)}
  for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/YH;let du=Math.abs(x-SU);du=Math.min(du,1024-du);
    const sw=Math.exp(-du/200)*.75+Math.exp(-du/70)*.35;
    let c=mix('#3c68a6','#8fb0d2',clamp(t*1.08,0,1));c=mix(c,'#c4ccd2',clamp((t-.66)*2.9,0,1));c=mix(c,'#ecd6b4',clamp((t-.6)*2.4,0,1)*(.25+sw*.75));c=mix(c,'#ffd49a',clamp(sw*(t-.25),0,.55));
    const d=Math.hypot(du,(y-SV)*2.1);c=mix(c,'#fff2d6',clamp(1-d/95,0,1)*.85);
    const cl=P.n(x,y*2.8,110,12001,4),cy=clamp((t-.12)*2.2,0,1)*clamp((1-t)*3.2,0,1);
    if(cl>.58&&y<YH){const k=clamp((cl-.58)*5,0,1)*cy;c=mix(c,mix('#aab0ba',mix('#eae6de','#fff0d4',sw),clamp((cl-.58)*3.4,0,1)),k*.85)}
    if(y>R1[x])c=mix(c,mix('#a4b0b4','#b2bab8',clamp((y-R1[x])/30,0,1)),.8);
    if(y>R2[x])c=mix('#24341f','#304228',P.n(x,y,8,12041,2));
    if(y>=YH+3)c=mix('#2a3424','#1c2418',clamp((y-YH)/24,0,1));
    P.set(x,y,c)}})}
// a meadow walked flat in places: yellow-green grass in tufts, worn earth showing through, the odd clover flower
function texDrGrass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,12101,4),b=P.n(x,y,96,12102,3),h=hash2(x,y,12103);
    let c=dith(P,x,y,.48+(n-.5)*.7+(h-.5)*.24,['#3a4a1e','#4a5a24','#5a6a2a','#6a7a32','#7c8a3c','#8e9846'],.14);
    if(b>.63)c=mix(c,dith(P,x,y,.5+(n-.5)*.5,['#5a4a32','#6a583a','#7a6844'],.1),clamp((b-.63)*6,0,.85));
    if(h>.996)c=rpickH(x*3+y,['#ecebd8','#f2f2e6','#d8c060']);P.set(x,y,c)}
  for(let i=0;i<1400;i++){const x=Math.floor(hash2(i,1,12104)*N),y=Math.floor(hash2(i,2,12104)*N),l=2+Math.floor(hash2(i,3,12104)*3),lt0=hash2(i,4,12104)<.5;
    for(let k=0;k<l;k++)P.set(x,y-k,lt0?'#9aa452':'#2e3c18',.55)}})}
// the parade ground: hard light earth with fine gravel, scuffed, a few darker patches where rain stood
function texDrDirt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,48,12111,4),h=hash2(x,y,12112);
    let c=dith(P,x,y,.52+(n-.5)*.42+(h-.5)*.28,['#6e6250','#7c705c','#8a7e68','#988c74','#a69a80'],.12);
    if(h>.985)c=rpickH(x*7+y*3,['#c8c0b0','#5a5248','#b0a898']);if(P.n(x,y,24,12113,2)<.3)c=dk(c,.12);P.set(x,y,c)}})}
// the dirt roads: darker, gravel pressed in, tyre-polished in places, a puddle stain here and there
function texDrTrack(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,36,12121,4),h=hash2(x,y,12122),w=P.n(x,y,80,12123,2);
    let c=dith(P,x,y,.5+(n-.5)*.45+(h-.5)*.3,['#4a3e30','#56493a','#625444','#6e604e','#7a6c58'],.12);
    if(h>.97)c=rpickH(x+y*5,['#8a8478','#3a342c','#9a9286']);if(w<.28)c=mix(c,'#3a3630',clamp((.28-w)*7,0,.7));P.set(x,y,c)}})}
// the trench floor: wet mud, boot-churned, puddles catching the sky
function texDrMud(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,12131,3);
    let c=dith(P,x,y,.45+(n-.5)*.6+(hash2(x,y,12132)-.5)*.2,['#2a2218','#362c20','#42362a','#4e4232'],.12);if(n>.66)c=mix(c,'#5a6066',clamp((n-.66)*6,0,.6));P.set(x,y,c)}})}
// duckboards: slats across two stringers, mud in the gaps
function texDrDuck(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=y%16,id=Math.floor(y/16);
    let c;if(s>=12)c=dith(P,x,y,.4+(P.n(x,y,8,12141,2)-.5)*.4,['#221a12','#2e241a'],.1);
    else{let t=.5+(hash2(id,1,12142)-.5)*.3+Math.sin(x*.21+P.n(x,y,10,12143,2)*4)*.08+(hash2(x,y,12144)-.5)*.1;if(s<1)t-=.25;
      c=dith(P,x,y,clamp(t,0,1),['#3e3226','#4c3e2e','#5a4a38','#685844'],.1);if(Math.abs((x%64)-8)<1&&s>3&&s<9)c='#2a2a28'}
    P.set(x,y,c)}})}
// the trench walls: posts every 1.2 m, planks between, two courses of sandbags along the top, mud splashed up from the floor
function texDrRevet(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c;const px=x%128;
    if(y<28){const row=y<14?0:1,bx=Math.floor((x+(row?20:0))/40),lx=(x+(row?20:0))%40,ly=y%14,e=Math.min(lx,39-lx,ly,13-ly);
      c=dith(P,x,y,.5+(hash2(bx*3+row,1,12151)-.5)*.25+(P.n(x,y,6,12152,2)-.5)*.3-(e<2?.3:0),['#5a5038','#6a5e42','#7a6e4e','#8a7e5a'],.1)}
    else if(px<14){c=dith(P,x,y,.4+(P.n(x,y,6,12153,2)-.5)*.3+Math.sin(y*.4)*.04,['#241c14','#2e241a','#3a2e22'],.08);if(px<2||px>11)c=dk(c,.3)}
    else{const b=Math.floor((y-28)/13),ly=(y-28)%13;let t=.48+(hash2(b,Math.floor(x/128),12154)-.5)*.28+Math.sin(x*.15+P.n(x,y,9,12155,2)*5)*.08+(hash2(x,y,12156)-.5)*.1;if(ly<1)t-=.35;
      c=dith(P,x,y,clamp(t,0,1),['#3a2e22','#4a3c2c','#5a4a38','#6a5844','#78664e'],.1)}
    if(y>108){const m=clamp((y-108)/20+(P.n(x,y,10,12157,2)-.5)*.6,0,1);c=mix(c,'#2e261c',m*.85)}
    P.set(x,y,c)}})}
// earthwork sides (the hill's terraces, the berms): brown soil, stones, roots, grass tufts creeping over
function texDrEarth(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,30,12161,4),[f1,,id]=cellN(P,x,y,12,12162),g=P.n(x,y,50,12163,3);
    let c=dith(P,x,y,.45+(n-.5)*.55+(hash2(x,y,12164)-.5)*.2,['#3a2c1e','#4a3826','#5a4630','#6a543a','#786246'],.12);
    if(f1<2.6&&hash2(id,1,12165)<.3)c=dith(P,x,y,.5+(hash2(id,2,12165)-.5)*.4,['#5e5a52','#706c62','#827e72'],.08);
    if(g>.6)c=mix(c,dith(P,x,y,.5+(n-.5)*.6,['#3e4c1e','#4e5e26','#5e6e2e'],.12),clamp((g-.6)*5,0,.9));P.set(x,y,c)}})}
// the pillbox's concrete: board-formed (a line every 40 cm), streaked; outside painted over in a faded camouflage (olive and khaki
// in big warped patches, brown and black blots over them, the paint worn through in places), inside bare and darker towards the floor
function texDrConc(camo){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,12171,3);
    let c=dith(P,x,y,.55+(n-.5)*.3+(hash2(x,y,12173)-.5)*.1,['#6e6c64','#7a7870','#86847c','#929088'],.08);if(y%43<2)c=dk(c,.18);
    if(camo){const wx=(P.n(x,y,64,12175,2)-.5)*90,wy=(P.n(x,y,64,12176,2)-.5)*90,v=P.n(x+wx,y+wy,128,12177,3),u=P.n(x+wy,y+wx,64,12178,3);
      let p=v<.5?'#4e5636':'#78714e';if(u>.6)p='#5a4430';else if(u<.36&&v>.44&&v<.62)p='#26261f';
      if(P.n(x,y,16,12179,3)<.7)c=mix(c,dith(P,x,y,.5+(n-.5)*.4,[dk(p,.08),p,lt(p,.06)],.1),.78)}
    else c=dk(c,clamp((y-N*.7)/(N*.3),0,1)*.22);
    P.set(x,y,c)}
  for(let i=0;i<22;i++)streak(P,Math.floor(hash2(i,1,12174)*N),Math.floor(hash2(i,2,12174)*N*.5),40+Math.floor(hash2(i,3,12174)*90),.18,2)})}
// grey weathered planks, laid across
function texDrPlank(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++){const b=y>>4,ry=y&15;for(let x=0;x<N;x++){const id=b*13+((x+b*37)>>6);
    let t=.5+(hash2(id,1,12181)-.5)*.26+Math.sin(x*.17+P.n(x,y,8,12182,2)*5)*.09+(hash2(x,y,12183)-.5)*.08;if(ry<1)t-=.42;
    let c=dith(P,x,y,clamp(t,0,1),['#3a3026','#4a3e32','#5a4e40','#6a5e4e','#7a6e5c'],.1);if(((x+b*37)&63)<1)c=dk(c,.4);if(hash2(id,3,12184)<.2&&(x&63)>58&&ry>5&&ry<10)c='#2a2a28';P.set(x,y,c)}}})}
// creosoted posts
function texDrPost(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const t=.4+Math.sin(x*.5+P.n(x,y,8,12191,2)*4)*.12+(hash2(x,y,12192)-.5)*.12;
  P.set(x,y,dith(P,x,y,t,['#1e1812','#2a2118','#362a1e','#42341f'],.1))}})}
// corrugated sheet in olive paint, rusting from the laps down
function texDrTin(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*8)*.5+.5;
    let c=dith(P,x,y,.35+r*.45+(P.n(x,y,24,12201,3)-.5)*.2,['#3a4028','#4a5234','#5a6240','#6a724c','#7a8258'],.08);
    const rs=P.n(x,y,16,12202,3);if(rs>.62||(y<10&&rs>.5))c=mix(c,rpickH(x>>3,['#6a3a1e','#7a4a24','#5a3018']),clamp((rs-.5)*3,0,.85));P.set(x,y,c)}})}
// painted steel: grey-green, chipped to grey metal at the edges of the paint
function texDrSteel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,12211,3);
    let c=dith(P,x,y,.5+(n-.5)*.25+(hash2(x,y,12212)-.5)*.08,['#4e5444','#5a6050','#666c5c','#727868'],.06);if(P.n(x,y,6,12213,2)>.74)c=dith(P,x,y,.5,['#6a6a66','#7a7a76'],.1);
    if(P.n(x,y,14,12214,3)>.7)c=mix(c,'#6a3e22',.5);P.set(x,y,c)}})}
// the water tank's side: welded plates and rivet lines in olive, the number stencilled on
function texDrTank(){return paint(512,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<512;x++){const n=P.n(x,y,24,12221,3);
    let c=dith(P,x,y,.5+(n-.5)*.24+(hash2(x,y,12222)-.5)*.06,['#4a5236','#56603e','#626c48','#6e7852'],.06);
    if(y%42<2||x%86<2)c=dk(c,.25);if((y%42===6||y%42===36)&&x%6<2)c=lt(c,.2);if(P.n(x,y,10,12223,2)>.72)c=mix(c,'#6a3e22',.45);
    const s=P.n(x,y,8,12224,2);if(y>90&&s>.6)c=mix(c,'#3a2e20',.4);P.set(x,y,c)}
  P.post=x=>{x.fillStyle='rgba(236,232,214,.82)';x.textAlign='center';x.textBaseline='middle';x.font='bold 46px '+DR_FONT;x.fillText('3',128,58);x.font='bold 24px '+DR_FONT;x.fillText('급수탑',128,94);
    x.fillText('음용수',384,64)}})}
// the barracks' walls: cream sandwich panels, a seam every 60 cm, a green band along the foot
function texDrPanel(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const yy=N-1-y;
    let c=dith(P,x,y,.6+(P.n(x,y,40,12231,3)-.5)*.14+(hash2(x,y,12232)-.5)*.05,['#bcb49c','#c8c0a8','#d4ccb4','#ded6be'],.05);
    if(x%64<2)c=dk(c,.2);if(yy<32)c=dith(P,x,y,.5+(hash2(x,y,12233)-.5)*.2,['#3a4a30','#46563a','#526244'],.06);if(yy>=32&&yy<35)c='#2e3a26';
    if(yy<60&&P.n(x,y,12,12234,2)>.62)c=mix(c,'#5a4a32',.3);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,12235)*N),Math.floor(hash2(i,2,12235)*60),40+Math.floor(hash2(i,3,12235)*60),.1,1)})}
// the barracks' roof: green corrugated sheet
function texDrRoofB(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*10)*.5+.5;
  let c=dith(P,x,y,.35+r*.4+(P.n(x,y,30,12241,3)-.5)*.2,['#2a4a34','#345a3e','#3e6a48','#487852'],.08);if(P.n(x,y,16,12242,3)>.66)c=mix(c,'#6a4a2a',.4);P.set(x,y,c)}})}
// window glass (seen through: a frame, a mullion, two streaks; the rest clear)
function texDrGlassT(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const fr=x<6||x>121||y<6||y>121||Math.abs(x-64)<3;
    if(fr){P.set(x,y,'#9aa0a0');continue}if(Math.abs((x+y*.7)%80-20)<3){P.set(x,y,'#e8f0f4',.35);P.alpha(x,y,90);continue}P.alpha(x,y,0)}})}
// a green steel door with a wired window and a lever handle
function texDrDoor(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,12251,2)-.5)*.2,['#2e4a34','#365640','#3e624a'],.06);
    if(x<5||x>122||y<5)c='#1e2e22';if(x>30&&x<98&&y>26&&y<92)c=(x+y)%10<1?'#6a7270':mix('#1e2a2e','#4a5a62',(y-26)/66);if(x>96&&x<112&&y>128&&y<136)c='#a8a8a0';
    if(y>236)c=dk(c,.25);P.set(x,y,c)}})}
// lockers: olive doors, louvres, a name card each
function texDrLocker(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const lx=x%64;let c=dith(P,x,y,.5+(hash2(x,y,12261)-.5)*.1,['#4e5640','#58604a','#626a54'],.05);
    if(lx<2)c='#2a2e24';if(y>20&&y<46&&lx>14&&lx<50&&(y%5)<2)c='#2e3428';if(y>60&&y<74&&lx>18&&lx<46)c='#e4e0d0';if(y>120&&y<128&&lx>50&&lx<56)c='#8a8a80';P.set(x,y,c)}})}
// olive wool blankets folded square on the mattresses
function texDrMatt(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,8,12271,2)-.5)*.3+((x+y)%3<1?.04:0),['#3a4228','#454e30','#505a38'],.08);
  if(y%32<2)c=dk(c,.25);P.set(x,y,c)}})}
// the barracks' floor: green epoxy, scuffed
function texDrFloor(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.5+(P.n(x,y,30,12281,3)-.5)*.2+(hash2(x,y,12282)-.5)*.08,['#3a5a46','#42644e','#4a6e56'],.06);
  if(P.n(x,y,10,12283,2)>.7)c=lt(c,.1);P.set(x,y,c)}})}
// a paper target on its board: a black silhouette, the scoring rings, holes shot through, the board's wooden edge
function texDrTarget(){const W=128,H=176;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.6+(hash2(x,y,12291)-.5)*.1,['#c8b890','#d4c49c','#e0d0a8'],.05);
    const hx=x-64,head=Math.hypot(hx,y-48)<20,body=y>66&&y<168&&Math.abs(hx)<20+(y-66)*.32;if(head||body)c='#1e1e1c';
    const r=Math.hypot(hx,y-104);for(const rr0 of [14,28,42])if(Math.abs(r-rr0)<1)c=head||body?'#d8d0b8':'#5a5248';
    if(x<5||x>122||y<5||y>170)c=dith(P,x,y,.5,['#5a4a36','#6a583e'],.1);P.set(x,y,c)}
  for(let i=0;i<14;i++){const x=40+Math.floor(hash2(i,1,12292)*48),y=40+Math.floor(hash2(i,2,12292)*110);P.rect(x,y,2,2,'#0a0a08')}})}
// signs
function drBoard(W,H,bg,edge,fn){return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix(bg,dk(bg,.12),y/H+(hash2(x,y,12301)-.5)*.06);if(x<4||x>W-5||y<4||y>H-5)c=edge;P.set(x,y,c)}P.post=fn})}
function texDrSignGate(){return drBoard(512,128,'#24402c','#e8e4d0',x=>{x.fillStyle='#f4f0e0';x.textAlign='center';x.textBaseline='middle';x.font='bold 56px '+DR_FONT;x.fillText('솔고개 훈련장',256,52);
  x.font='bold 20px '+DR_FONT;x.fillText('SOLGOGAE  TRAINING  GROUND',256,102)})}
function texDrSignRange(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c='#f2efe6';if(y<40)c='#c0281e';if(x<4||x>251||y<4||y>123)c='#3a1a14';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffffff';x.font='bold 30px '+DR_FONT;x.fillText('사 격 장',128,22);x.fillStyle='#c0281e';x.font='bold 22px '+DR_FONT;
    x.fillText('사격 중 출입 금지',128,66);x.fillStyle='#3a3a36';x.font='bold 15px '+DR_FONT;x.fillText('LIVE FIRE · KEEP OUT',128,100)}})}
function texDrSignObs(){return drBoard(256,96,'#2a4a30','#d8d4c0',x=>{x.fillStyle='#f0ecd8';x.textAlign='center';x.textBaseline='middle';x.font='bold 28px '+DR_FONT;x.fillText('장애물 극복 훈련장',128,38);
  x.font='bold 14px '+DR_FONT;x.fillText('OBSTACLE COURSE',128,74)})}
function texDrSignStand(){return paint(512,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<512;x++){let c=mix('#f4f0e8','#e2dccf',hash2(x,y,12311)*.5);if(y<5||y>58)c='#2a4a30';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#24402c';x.textAlign='center';x.textBaseline='middle';x.font='bold 32px '+DR_FONT;x.fillText('훈련은 실전처럼  ·  실전은 훈련처럼',256,33)}})}
function texDrSignBunk(){return drBoard(256,64,'#e8e2d0','#2a4a30',x=>{x.fillStyle='#24402c';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+DR_FONT;x.fillText('3 생활관',128,34)})}
function texDrSignPill(){return paint(128,48,P=>{for(let y=0;y<48;y++)for(let x=0;x<128;x++)P.set(x,y,dith(P,x,y,.5+(hash2(x,y,12321)-.5)*.2,['#6e6c64','#7a7870','#86847c'],.08));
  P.post=x=>{x.fillStyle='rgba(240,236,220,.85)';x.textAlign='center';x.textBaseline='middle';x.font='bold 26px '+DR_FONT;x.fillText('제3 엄체호',64,26)}})}
// a lane's number board on the firing line
function texDrLane(n){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.6+(hash2(x,y,12331)-.5)*.1,['#e8e2d0','#f0eadb'],.05);if(x<3||x>60||y<3||y>60)c='#2a2a26';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a1a18';x.textAlign='center';x.textBaseline='middle';x.font='bold 44px '+DR_FONT;x.fillText(String(n),32,35)}})}
// the training ground's pennant: green, a white disc with a pine
function texDrFlag(){return paint(128,80,P=>{for(let y=0;y<80;y++)for(let x=0;x<128;x++){let c=mix('#2a5a34','#22482a',(Math.sin(x*.12)*.5+.5)*.5);const d=Math.hypot(x-64,y-40);
    if(d<24)c='#f0ece0';const tx=x-64,ty=y-40;if(d<24&&ty>-18&&ty<12&&Math.abs(tx)<(ty+20)*.42&&((ty+18)%10)>2)c='#2a5a34';if(d<24&&Math.abs(tx)<2&&ty>=10&&ty<18)c='#5a3a22';
    if(x<3)c='#c8c4b4';P.set(x,y,c)}})}
// a climbing net: rope squares on their side (the rest clear)
function texDrNet(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){if(x%16<3||y%16<3)P.set(x,y,hash2(x,y,12341)<.2?'#5a4a2e':'#7a6640');else P.alpha(x,y,0)}})}
// camouflage netting: scraps of olive and brown cloth, holes between
function texDrCamo(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,f2,id]=cellN(P,x,y,9,12351);if(f2-f1<.9||hash2(id,1,12352)<.18){P.alpha(x,y,0);continue}
  P.set(x,y,dk(rpickH(id,['#4a5230','#5a5e36','#5a4a30','#3a4226','#6a6a40']),clamp(f1/8,0,.3)))}})}
// concertina wire: coils seen side-on, barbs (the rest clear)
function texDrWire(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++)P.alpha(x,y,0);
  for(let i=0;i<9;i++){const cx=14+i*29;for(let a=0;a<TAU;a+=.01){const x=Math.round(cx+Math.cos(a)*16),y=Math.round(32+Math.sin(a)*27);P.set(x,y,'#8a8a86');if(hash2(Math.round(a*40),i,12361)<.06)P.rect(x-1,y-1,3,3,'#6a6a66')}}})}
// galvanised wire and pickets: dull grey, a little rust
function texDrWireG(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=dith(P,x,y,.5+(hash2(x,y,12365)-.5)*.3,['#6a6c6a','#7a7c78','#8a8c88'],.1);if(hash2(x>>2,y>>2,12366)<.12)c=mix(c,'#6a4a32',.5);P.set(x,y,c)}})}
// ammunition boxes: olive steel, a yellow band, white lettering
function texDrAmmo(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,12371)-.5)*.15,['#3e4628','#4a5230','#565e38'],.06);
  if(y>18&&y<24)c='#c8a830';if(x<2||x>61||y<2||y>61)c='#2a3018';if(y>34&&y<44&&x>10&&x<54&&(x%5)<3)c='#d8d4c0';P.set(x,y,c)}})}
// white line paint on the parade ground, worn
function texDrLine(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++)P.set(x,y,hash2(x,y,12421)<.18?'#a8a294':mix('#e8e6dc','#ffffff',hash2(x,y,12422)*.3))})}
// pine needles (for the trees' cones): clusters in dark greens, lighter tips
function texDrPine(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,7,12381);const g=P.n(x,y,20,12382,3);
  let c=mix(rpickH(id,['#1a2e18','#20361c','#264020','#2c4824']),'#0c180c',clamp(f1/6,0,1)*.6);if(g>.62)c=lt(c,.1);if(hash2(id,2,12383)<.08&&f1<2)c='#5a7a3a';P.set(x,y,c)}})}
// red pine bark in plates
function texDrBark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const [f1,f2]=cellN(P,x,y*.5,6,12391);let c=dith(P,x,y,.5+(P.n(x,y,8,12392,2)-.5)*.4,['#3e2a1e','#4a3224','#563a2a','#624430'],.1);
  if(f2-f1<.8)c='#2a1a12';P.set(x,y,c)}})}
// forested hillsides far off: a mottle of dark greens, a patch of rock now and then
function texDrHill(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,6,12401);
  let c=mix(rpickH(id,['#1e2e1a','#24361e','#2a3e22','#304626','#26381e']),'#101a0e',clamp(f1/5,0,1)*.5);if(P.n(x,y,40,12402,3)>.7)c=mix(c,'#5a5a52',.5);P.set(x,y,c)}})}
function bakeDrillTex(){if(TEX.drGrass)return;
  TEX.drSky=mkTex(texDrSky());TEX.drSky.wrapT=THREE.ClampToEdgeWrapping;TEX.drSky.magFilter=THREE.LinearFilter;
  if(!TEX.sunDisc&&typeof texSunDisc==='function'){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  TEX.drGrass=mkTex(texDrGrass());TEX.drDirt=mkTex(texDrDirt());TEX.drTrack=mkTex(texDrTrack());TEX.drMud=mkTex(texDrMud());TEX.drDuck=mkTex(texDrDuck());TEX.drRevet=mkTex(texDrRevet());
  TEX.drEarth=mkTex(texDrEarth());TEX.drConc=mkTex(texDrConc(true));TEX.drConcI=mkTex(texDrConc(false));TEX.drPlank=mkTex(texDrPlank());TEX.drPost=mkTex(texDrPost());TEX.drTin=mkTex(texDrTin());TEX.drSteel=mkTex(texDrSteel());
  TEX.drTank=mkTex(texDrTank());TEX.drPanel=mkTex(texDrPanel());TEX.drRoofB=mkTex(texDrRoofB());TEX.drGlassT=mkTex(texDrGlassT(),false);TEX.drDoor=mkTex(texDrDoor(),false);
  TEX.drLocker=mkTex(texDrLocker(),false);TEX.drMatt=mkTex(texDrMatt());TEX.drFloor=mkTex(texDrFloor());TEX.drTarget=mkTex(texDrTarget(),false);
  TEX.drSignGate=mkTex(texDrSignGate(),false);TEX.drSignRange=mkTex(texDrSignRange(),false);TEX.drSignObs=mkTex(texDrSignObs(),false);TEX.drSignStand=mkTex(texDrSignStand(),false);
  TEX.drSignBunk=mkTex(texDrSignBunk(),false);TEX.drSignPill=mkTex(texDrSignPill(),false);for(let i=1;i<=6;i++)TEX['drLane'+i]=mkTex(texDrLane(i),false);TEX.drFlag=mkTex(texDrFlag(),false);
  TEX.drNet=mkTex(texDrNet());TEX.drCamo=mkTex(texDrCamo());TEX.drWire=mkTex(texDrWire(),false);TEX.drWireG=mkTex(texDrWireG());TEX.drAmmo=mkTex(texDrAmmo(),false);
  TEX.drCanvas=mkTex(texCanvas('#4e5434',12411));TEX.drTruck=mkTex(texCarPaint('#4a5236'));
  TEX.drLine=mkTex(texDrLine());TEX.drPine=mkTex(texDrPine());TEX.drBark=mkTex(texDrBark());TEX.drHill=mkTex(texDrHill());
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['drGrass','drDirt','drTrack','drDuck','drFloor'])TEX[k].anisotropy=an}
// ---------- the map ----------
// (x east, z south. The trench line runs across the middle (z -8..-2); north of it the bunker hill, the water tower and the range;
// south of it the parade square, the obstacle course, the motor pool, the depot and the barracks; the fence at ±44)
const DR={pines:[],tanks:[],caps:[],bars:[],wire:[]};
function buildDrill(){const CV={nosolid:true},PS={pass:1},TD=-1.8;DR.pines=[];DR.tanks=[];DR.caps=[];DR.bars=[];DR.wire=[];
  // open flights, handrails and railings (mapkit.js stairKit; the sloping bars drawn by drMesh)
  const {tst,hrail,rail}=stairKit(DR.bars,'drSteel');
  const sb=(x0,z0,x1,z1,h,y)=>{y=y||0;B(x0,y,z0,x1,y+h,z1,'sandbag')};
  const pine=(x,z,y,s,solid)=>{s=s||1;y=y||0;DR.pines.push([x,y,z,s]);if(solid)B(x-.2*s,y,z-.2*s,x+.2*s,y+6.5*s,z+.2*s,'tirex')};
  // a 2.5 t cargo truck, olive: the cab at the front (the low end of its long axis unless flipped), the bed under a canvas cover
  const truck=(x0,z0,ax,flip,canvas)=>{const L=7,W=2.4,LB=(a0,a1,c0,c1,y0,y1,m,o)=>{if(flip){const t=a0;a0=L-a1;a1=L-t}return ax==='x'?B(x0+a0,y0,z0+c0,x0+a1,y1,z0+c1,m,o):B(x0+c0,y0,z0+a0,x0+c1,y1,z0+a1,m,o)};
    const fg=flip?(ax==='x'?'px':'pz'):(ax==='x'?'nx':'nz');
    LB(.4,6.9,.25,W-.25,.55,1.0,'drSteel');LB(0,2.1,0,W,1.0,2.8,'drTruck',{f:{[fg]:'carGl'}});LB(0,.25,.1,W-.1,.5,1.0,'drSteel');
    LB(2.2,7,0,W,1.0,1.45,'drTruck');if(canvas!==false)LB(2.2,7,0,W,1.45,3.0,'drCanvas');
    for(const a of [.75,4.3,5.6])for(const c of [-.05,W-.3])LB(a,a+1,c,c+.35,0,1.0,'tire')};
  // ================= ground: a partition of the site (later rectangles win); the trench cells are cut 1.8 m down, their floor duckboards =================
  // the trench line: a square wave of fire bays (south bays A at z -4..-2, north bays B at z -8..-6) joined by 2 m connectors; seven stairs out
  const TR=[];for(let k=0;k<5;k++){const x0=-40+16*k;TR.push([x0,-4,x0+6,-2],[x0+6,-8,x0+8,-2],[x0+8,-8,x0+14,-6],[x0+14,-8,x0+16,-2])}
  // [axis, c0, c1, a0 (in the trench, y TD), a1 (at the ground, y 0)]
  const EX=[['x',-4,-2,-40,-43],['z',38,40,-2,1],['z',-22,-20,-2,1],['z',-6,-4,-2,1],['z',10,12,-2,1],['z',-30,-28,-8,-11],['z',2,4,-8,-11],['z',34,36,-8,-11]];
  const EXR=EX.map(([ax,c0,c1,a0,a1])=>ax==='x'?[Math.min(a0,a1),c0,Math.max(a0,a1),c1]:[c0,Math.min(a0,a1),c1,Math.max(a0,a1)]);
  {const G=[[-16,8,14,30,'drDirt'],[-43,40,43,43,'drTrack'],[-3,30,3,44,'drTrack'],[15,1,18,40,'drTrack'],[-20,1,-17,40,'drTrack'],[-17,-13,43,-10,'drTrack'],
      [-42,11,-20,31,'drTrack'],[37,-25,43,-19,'drTrack'],[8,-21,37,-16,'drTrack'],[-42,2,-22,10,'drTrack'],[20,32,42,40,'drTrack']];
    const HOLE=TR.concat(EXR),X0=-46,X1=46,Z0=-46,Z1=46,xs=new Set([X0,X1]),zs=new Set([Z0,Z1]);
    for(const r of G.concat(HOLE)){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    const inR=(L,x,z)=>L.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;const flush=()=>{if(!run)return;if(run.t)B(run.x0,-2,Z[j],run.x1,TD,Z[j+1],'drDuck');else B(run.x0,-2,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run=null};
      for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m='drGrass';for(const r of G)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];const t=inR(HOLE,cx,cz);
        if(run&&run.m===m&&run.t===t)run.x1=X[i+1];else{flush();run={x0:X[i],x1:X[i+1],m,t}}}flush()}}
  // the stairs out of the trench (timber)
  for(const [ax,c0,c1,a0,a1] of EX)stairs(ax,c0,c1,a0,a1,TD,0,6,'drPlank');
  // sandbags along the lip, wherever a trench cell meets the ground (not across the stairs' tops)
  {const ALL=TR.map(r=>r.concat(null)).concat(EXR.map((r,i)=>{const [ax,,,a0,a1]=EX[i];return r.concat(ax==='x'?(a1<a0?'w':'e'):(a1<a0?'n':'s'))}));
    const sub=(L,a,b)=>{const o=[];for(const [p,q] of L){if(b<=p||a>=q){o.push([p,q]);continue}if(a>p)o.push([p,a]);if(b<q)o.push([b,q])}return o};
    for(const r of ALL){const [x0,z0,x1,z1,outer]=r;
      for(const side of ['n','s','w','e']){if(side===outer)continue;let L=side==='n'||side==='s'?[[x0,x1]]:[[z0,z1]];const line=side==='n'?z0:side==='s'?z1:side==='w'?x0:x1;
        for(const q of ALL){if(q===r)continue;if(side==='n'&&q[3]===line)L=sub(L,q[0],q[2]);else if(side==='s'&&q[1]===line)L=sub(L,q[0],q[2]);else if(side==='w'&&q[2]===line)L=sub(L,q[1],q[3]);else if(side==='e'&&q[0]===line)L=sub(L,q[1],q[3]);
          if(side==='n'&&q[1]<line&&q[3]>line)L=sub(L,q[0],q[2]);if(side==='s'&&q[1]<line&&q[3]>line)L=sub(L,q[0],q[2]);if(side==='w'&&q[0]<line&&q[2]>line)L=sub(L,q[1],q[3]);if(side==='e'&&q[0]<line&&q[2]>line)L=sub(L,q[1],q[3])}
        for(const [a,b] of L){if(b-a<.3)continue;if(side==='n')sb(a,line-.6,b,line,.45);else if(side==='s')sb(a,line,b,line+.6,.45);else if(side==='w')sb(line-.6,a,line,b,.45);else sb(line,a,line+.6,b,.45)}}}}
  // firing steps along the north wall of every bay (the side the enemy was expected): 0.9 m up, so you can see over the bags and climb out
  for(let k=0;k<5;k++){const x0=-40+16*k;for(const [a,b,z] of [[x0+.5,x0+5.5,-4],[x0+8.5,x0+13.5,-8]]){let L=[[a,b]];for(const [ax,c0,c1,a0] of EX)if(ax==='z'&&a0===z)L=L.flatMap(([p,q])=>c1<=p||c0>=q?[[p,q]]:[[p,c0],[c1,q]].filter(([u,v])=>v-u>.5));
      for(const [p,q] of L)B(p,TD,z,q,-.9,z+.6,'drPlank',{f:{py:'drDuck'}})}}
  // the dugout: a timber shelter over part of a north bay (posts, a tin roof half a metre over the ground, sandbags on top)
  {const x0=-15,x1=-11,z0=-8.6,z1=-5.4;for(const x of [x0,x1-.2])for(const z of [-8.12,-6.08])B(x,TD,z,x+.2,.5,z+.2,'drPost');
    B(x0-.2,.5,z0,x1+.2,.62,z1,'drTin',{f:{ny:'drPlank'}});sb(x0,z0+.2,x1,z1-.2,.33,.62);LIGHT(-13,-.4,-7,'#ffcf90',5,.55);B(-13.06,-.25,-7.06,-12.94,-.13,-6.94,'lampO',CV)}
  // ================= the bunker hill (north-west): three grass terraces of 1.2 m, the pillbox sunk into the top =================
  // L1 x -42..-20 z -42..-17 (y 1.2), L2 x -40..-22 z -41..-19 (y 2.4), L3 x -38..-24 z -40..-22 (y 3.6, the top); the pillbox x -35..-27 z -36..-30,
  // its floor at 2.5 (on L2), its door in the north wall, four steps and a landing down to it from the top
  const hillY=(x,z)=>x>-38&&x<-24&&z>-40&&z<-22?3.6:x>-40&&x<-22&&z>-41&&z<-19?2.4:x>-42&&x<-20&&z>-42&&z<-17?1.2:0;
  {const ER={f:{py:'drGrass'}};B(-42,0,-42,-20,1.2,-17,'drEarth',ER);B(-40,1.2,-41,-22,2.4,-19,'drEarth',ER);
    slab(-38,-40,-24,-22,2.4,3.6,'drEarth',[[-35,-36,-27,-30],[-32.3,-38.8,-30.7,-36]],ER);
    // the paths up, earth steps: south (the trench's north stair comes out below it), 0 → 2.4 in one run, a landing, on to the top; east, 0 → 3.6
    const ST={f:{py:'drDirt'}};stairs('z',-30,-28,-15,-17,0,1.2,4,'drEarth',ST);stairs('z',-30,-28,-17,-19,1.2,2.4,4,'drEarth',ST);stairs('z',-30,-28,-20,-22,2.4,3.6,4,'drEarth',ST);
    stairs('x',-26,-24,-17,-20,0,1.2,5,'drEarth',ST);stairs('x',-26,-24,-20,-22,1.2,2.4,4,'drEarth',ST);stairs('x',-26,-24,-22,-24,2.4,3.6,4,'drEarth',ST);
    // the pillbox: .6 m walls, slits round the front and sides at eye height from inside, the door at the back, a roof under sandbags and turf
    // (painted outside, bare concrete inside)
    const W='drConc',WI='drConcI',FY=2.5,TOP=4.9;B(-34.4,2.4,-36,-27.6,FY,-30.6,'conc');
    wallX(-35,-27,-30.6,-30,2.4,TOP,W,[[-33.4,-31.6,3.85,4.2],[-30.4,-28.6,3.85,4.2]],{f:{nz:WI}});
    wallX(-35,-27,-36,-35.4,2.4,TOP,W,[[-32.3,-30.7,2.4,4.75]],{f:{pz:WI}});
    wallZ(-35,-34.4,-35.4,-30.6,2.4,TOP,W,[[-34,-32,3.85,4.2]],{f:{px:WI}});wallZ(-27.6,-27,-35.4,-30.6,2.4,TOP,W,[[-34,-32,3.85,4.2]],{f:{nx:WI}});
    B(-35.3,TOP,-36.3,-26.7,5.35,-29.7,W,{f:{py:'drGrass',ny:WI}});sb(-34.6,-35.6,-27.4,-30.4,.35,5.35);
    B(-30.4,4.25,-36.04,-29.2,4.6,-36,'drSignPill',CV);
    // (a landing at the floor's height before the door, so nobody on the last step has the lintel at his head)
    B(-32.3,2.4,-36.8,-30.7,FY,-36,'conc');stairs('z',-32.3,-30.7,-36.8,-38.8,2.4,3.6,4,'conc');
    // inside: ammunition boxes, a table, two stools, a field telephone, a bulb
    B(-34.3,FY,-35.3,-33.3,FY+.5,-34.5,'drAmmo');B(-34.3,FY+.5,-35.3,-33.5,FY+.9,-34.7,'drAmmo');B(-29.6,FY,-35.2,-28,FY+.75,-34.3,'drPlank');
    for(const [x,z] of [[-29.2,-33.8],[-28.4,-33.8]])B(x-.18,FY,z-.18,x+.18,FY+.45,z+.18,'drPlank');B(-29.4,FY+.75,-35,-29,FY+.95,-34.7,'drSteel');
    B(-31.06,4.5,-33.06,-30.94,4.62,-32.94,'lampO',CV);LIGHT(-31,4.2,-33,'#ffd8a0',7,.7);
    // sandbag parapets on the terraces' edges, pines round the slopes
    sb(-38,-17.6,-32,-17.1,.6,1.2);sb(-39.8,-30,-39.2,-26,.6,2.4);sb(-22.6,-34,-22.1,-28,.6,2.4);
    for(const [x,z,s] of [[-40.8,-40.6,1.1],[-36.6,-40.4,.9],[-24,-40.8,1],[-21,-38,1.2],[-20.9,-30.5,.9],[-41.2,-34,1],[-41,-26,1.05],[-38.8,-18.4,.95],[-22.6,-18.6,1.1],[-36,-39.6,.8],[-23,-39.8,.85]])
      pine(x,z,hillY(x,z),s,true)}
  // ================= the water tower (north, x 0 z -30): four legs, the platform at 7 m round the tank, a long steel stair up from the south =================
  // (nav: the stair is 1.6 m wide on x 3.5, the platform's rails sit just inside its edges, so a ring of nodes runs round the tank)
  {const Y=7,ST='drSteel',RH=1.1;for(const [x,z] of [[-2.35,-32.35],[2.05,-32.35],[-2.35,-27.95],[2.05,-27.95]])B(x,0,z,x+.3,Y-.2,z+.3,ST);
    for(const y of [2.2,4.6]){B(-2.05,y,-32.3,2.05,y+.12,-32.2,ST,CV);B(-2.05,y,-27.9,2.05,y+.12,-27.8,ST,CV);B(-2.3,y,-32.05,-2.2,y+.12,-27.95,ST,CV);B(2.1,y,-32.05,2.2,y+.12,-27.95,ST,CV)}
    B(-4.3,Y-.2,-34.3,4.3,Y,-25.7,ST,{f:{py:'drPlank'}});
    // the tank is drawn round (drMesh); its collision a cross of two boxes inside the round
    // (the cross stays inside the round, so none of the round's corners, lit one by one, is buried in it)
    MAP.deco.push({k:'drum',x:0,y:Y,z:-30,r:2.2,h:5,mat:'drTank',rot:.6});DR.caps.push([0,Y+5,-30,2.32]);B(-2,Y,-30.8,2,Y+5,-29.2,'metalx');B(-.8,Y,-32,.8,Y+5,-28,'metalx');
    rail(-4.3,-34.3,4.3,-34.24,Y,RH);rail(-4.3,-34.24,-4.24,-25.7,Y,RH);rail(4.24,-34.24,4.3,-25.76,Y,RH);rail(-4.24,-25.76,2.64,-25.7,Y,RH);
    // the stair: 16 open steps from z -15.2 up to the platform's south edge
    tst('z',2.7,4.3,-15.2,-25.7,0,Y,16,ST);hrail('z',2.64,2.7,-15.2,-25.7,0,Y,16);hrail('z',4.3,4.36,-15.2,-25.7,0,Y,16);
    for(const z of [-18.6,-22.2])B(3.4,0,z,3.6,(z-(-15.2))/(-10.5)*Y-.16,z+.2,ST);
    // the pump hut between the legs, its pipes up to the tank
    B(-1.4,0,-31.4,1.4,2.4,-28.6,'drPanel',{f:{py:'drRoofB'}});B(-.5,0,-28.62,.5,2.1,-28.58,'drDoor',CV);for(const x of [-.6,.6])B(x-.08,2.4,-30.08,x+.08,Y-.2,-29.92,'pipe')}
  // ================= the firing range (north-east): the firing line under a roof (x 10..36, z -20..-16), six lanes north to the targets, the berms =================
  {const ST='drSteel';B(10,0,-20,36,.3,-16,'conc');
    for(let x=10;x<=36.01;x+=4.333)for(const z of [-19.9,-16.3])B(Math.min(x,35.8),.3,z,Math.min(x,35.8)+.2,3.4,z+.2,'drPost');
    B(9.6,3.4,-20.4,36.4,3.56,-15.6,'drTin',{f:{ny:'drPlank'}});
    // the firing positions: a sandbag rest along the front, a bench at the back, lane boards on the eaves
    sb(10,-20.6,36,-20,.9);for(let i=0;i<6;i++){const x=12+i*4;B(x-.9,.3,-17.2,x+.9,.75,-16.8,'drPlank');B(x-.35,2.7,-20.44,x+.35,3.35,-20.4,'drLane'+(i+1),CV)}
    // lanes: sandbag dividers out to 9 m, the target line at z -36, the backstop berm, a 2.5 m berm down the west side (a gap halfway)
    for(let i=1;i<6;i++){const x=10+i*4;sb(x-.3,-30,x+.3,-20.6,1.0)}
    for(let i=0;i<6;i++){const x=12+i*4;for(const d of [-.75,.65])B(x+d,0,-36.1,x+d+.1,2.1,-35.9,'drPost');B(x-.65,.7,-36.04,x+.65,2.1,-35.96,'drTarget');sb(x-1.2,-35.4,x+1.2,-34.9,.5)}
    B(8,0,-44,44,4,-38,'drEarth',{f:{py:'drGrass'}});B(8,0,-38,10,2.5,-29,'drEarth',{f:{py:'drGrass'}});B(8,0,-27,10,2.5,-21,'drEarth',{f:{py:'drGrass'}});
    // the range sign and the red flag at the west berm
    for(const x of [5.1,7.5])B(x,0,-20.94,x+.2,2.8,-20.74,'drPost');B(5,1.4,-21.0,7.8,2.7,-20.96,'drSignRange',CV);B(6.4,0,-22.6,6.5,6,-22.5,ST);B(6.5,4.9,-22.58,7.7,5.9,-22.52,'paintY',{nosolid:true,tint:[1.6,.25,.2]});
    // the range control tower: a timber deck at 5 m (x 38..42, z -24..-20) under a roof, a straight stair up from the south
    const TY=5;for(const [x,z] of [[38,-24],[41.8,-24],[38,-20.2],[41.8,-20.2]])B(x,0,z,x+.2,TY+2.6,z+.2,'drPost');
    B(37.8,TY-.25,-24.2,42.2,TY,-20,'drPlank');B(37.6,TY+2.6,-24.6,42.4,TY+2.76,-19.6,'drTin',{f:{ny:'drPlank'}});
    B(37.8,TY,-24.2,42.2,TY+1,-24.12,'drPlank');B(37.8,TY,-24.12,37.88,TY+1,-20,'drPlank');B(42.12,TY,-24.12,42.2,TY+1,-20,'drPlank');B(37.88,TY,-20.08,39.6,TY+1,-20,'drPlank');B(41.4,TY,-20.08,42.12,TY+1,-20,'drPlank');
    tst('z',39.7,41.3,-12.4,-20,0,TY,12,'drPlank');hrail('z',39.64,39.7,-12.4,-20,0,TY,12,'drPost');hrail('z',41.3,41.36,-12.4,-20,0,TY,12,'drPost');
    B(38.4,TY,-23.8,39.6,TY+.9,-23.2,'drPlank');B(40.4,TY,-23.9,41.6,TY+1.1,-23.3,'drSteel');B(38.5,TY+.9,-23.75,38.9,TY+1.15,-23.35,'drSteel',CV);
    LIGHT(40,TY+2.2,-22,'#ffe2b0',7,.45)}
  // ================= the obstacle course (east, x 20..42, z 4..31): low walls, one-way high walls, beams, tyres, the net tower =================
  {B(18.6,0,3.9,18.8,2.4,4.1,'drPost');B(18.8,0,3.9,19,2.4,4.1,'drPost');B(17.4,1.3,3.86,20.4,2.4,3.9,'drSignObs',CV);
    // row 1: walls to vault (1 m)
    for(const [x0,x1] of [[21,25],[27,31],[33,37],[38.6,41.4]])B(x0,0,7.6,x1,1,7.9,'drPlank',{f:{py:'drPost'}});
    // row 2: 2.2 m walls, a step block on the south face only (you get over going north; going back you go round by the gaps)
    for(const [x0,x1] of [[20,26],[29,35],[38,42]]){B(x0,0,12.4,x1,2.2,12.7,'drPlank',{f:{py:'drPost'}});B(x0+1,0,12.7,x1-1,.9,13.3,'drPlank',{f:{py:'drPost'}})}
    // row 3: balance beams on posts, the tyre run (laid flat: tread on them)
    for(const [x0,x1,z] of [[21,27,17.2],[21,27,19.2],[29,35,18.2]]){B(x0,.55,z-.12,x1,.7,z+.12,'drPost');for(const x of [x0+.3,(x0+x1)/2,x1-.3])B(x-.1,0,z-.1,x+.1,.55,z+.1,'drPost')}
    for(let i=0;i<5;i++)for(let j=0;j<3;j++){const x=37+i*1,z=16+j*1.2+(i%2)*.6;MAP.deco.push({k:'drum',x,y:0,z,r:.38,h:.22,mat:'tire',rot:hash2(i,j,12501)*TAU})}
    // the monkey bars and the rope frame (frames solid where you can bump into them, the bars and ropes for looks)
    for(const x of [22,30])for(const z of [22.2,23.8])B(x-.08,0,z-.08,x+.08,2.4,z+.08,'drSteel');for(let x=22;x<=30.01;x+=.5)B(x-.03,2.36,22.2,x+.03,2.42,23.8,'drSteel',CV);
    B(22,2.3,22.15,30,2.42,22.25,'drSteel',CV);B(22,2.3,23.75,30,2.42,23.85,'drSteel',CV);
    for(const x of [24,26.6])B(x-.1,0,15.7,x+.1,4,15.9,'drPost');B(23.8,3.9,15.7,26.8,4.1,15.9,'drPost',CV);for(const x of [24.6,25.3,26])B(x-.03,.4,15.77,x+.03,3.9,15.83,'drCanvas',CV);
    // the crawl under the wire: a low frame of posts, wire strung across at 0.8 m (looks only)
    for(let x=21;x<=31.01;x+=2.5)for(const z of [27,30.6])B(x-.06,0,z-.06,x+.06,.8,z+.06,'drPost');
    for(let z=27.3;z<30.4;z+=.6)B(21,.775,z-.008,31,.79,z+.008,'drWireG',CV);for(let x=21;x<=31.01;x+=2.5)B(x-.008,.79,27,x+.008,.805,30.6,'drWireG',CV);
    // the net tower: a deck at 2.5 m (x 31..39, z 21..25.4), a smaller one at 5 m (x 37..41) up a flight along the lower deck's south side, the net down the tower's south face
    // (nav: each flight starts and ends in line with a deck cell; the flights are 1.6 m wide on the half-metre rows 22.5 and 24.5)
    const D1=2.5,D2=5;for(const [x,z] of [[31,21],[38.8,21],[31,25.2],[38.8,25.2]])B(x,0,z,x+.2,D1-.2,z+.2,'drPost');for(const [x,z] of [[40.8,21],[40.8,25.2]])B(x,0,z,x+.2,D2-.2,z+.2,'drPost');
    B(31,D1-.2,21,39,D1,25.4,'drPlank');B(37,D2-.2,21,41,D2,25.4,'drPlank');for(const [x,z] of [[37,21],[37,23.3]])B(x,D1,z,x+.2,D2-.2,z+.2,'drPost');
    tst('x',21.7,23.3,26.4,31,0,D1,6,'drPlank');tst('x',23.7,25.3,32.4,37,D1,D2,6,'drPlank');hrail('x',23.64,23.7,32.4,37,D1,D2,6,'drPost');
    B(31,D1,20.94,37,D1+1,21,'drPlank');B(31,D1,21,31.06,D1+1,21.7,'drPlank');B(31,D1,23.3,31.06,D1+1,25.4,'drPlank');B(31,D1,25.4,37,D1+1,25.46,'drPlank');
    B(37,D2,20.94,41,D2+1,21,'drPlank');B(41,D2,20.94,41.06,D2+1,25.46,'drPlank');B(37,D2,25.4,41,D2+1,25.46,'drPlank');B(36.94,D2,21,37,D2+1,23.7,'drPlank');
    B(31.2,.3,25.46,38.8,D1,25.5,'drNet',{nosolid:true,pass:1});B(37.2,D1,25.46,40.8,D2,25.5,'drNet',{nosolid:true,pass:1})}
  // ================= the parade square (x -16..14, z 8..30): the reviewing stand on its south side, the flag, white lines =================
  // (1.6 m up: too high to jump onto, so everyone takes the steps — the front flight from the square or one at each end)
  {const SY=1.6;B(-7,0,30,7,SY,33.4,'conc',{f:{py:'drConcI'}});
    stairs('x',30.6,32.6,-9.4,-7,0,SY,4,'conc');stairs('x',30.6,32.6,9.4,7,0,SY,4,'conc');stairs('z',-1,1,27.6,30,0,SY,4,'conc');
    B(-7.2,0,33.4,7.2,4.6,33.8,'drPanel',{f:{nz:'drPanel'}});B(-5.6,2.2,33.36,5.6,3.6,33.4,'drSignStand',CV);
    for(const x of [-6.9,6.7])B(x,SY,30.1,x+.2,4.6,30.3,'drSteel');B(-7.4,4.6,29.6,7.4,4.78,33.8,'drRoofB',{f:{ny:'drPanel'}});
    B(-.6,SY,31,.6,SY+1.15,31.6,'drPlank');B(-.75,SY+1.15,30.9,.75,SY+1.25,31.7,'drPlank');
    // the flag east of the stand, the line markings of the square
    B(10.9,0,30.4,11.1,10,30.6,'drSteel');B(10.4,0,29.9,11.6,.3,31.1,'conc');B(11.1,8.4,30.48,13.3,9.8,30.52,'drFlag',CV);
    for(const [x0,z0,x1,z1] of [[-14,10,12,10.12],[-14,27.88,12,28],[-14,10.12,-13.88,27.88],[11.88,10.12,12,27.88]])B(x0,0,z0,x1,.006,z1,'drLine',CV);
    for(let x=-11;x<=9;x+=4)B(x-.3,0,18.94,x+.3,.006,19.06,'drLine',CV);
    // concrete benches along the square's west and east edges
    for(const z of [12,17,22])for(const x of [-15.2,13.2]){B(x,0,z,x+.6,.45,z+2,'conc');}}
  // ================= the gate (closed) in the south fence, the arch over it, the guard post and the boom =================
  {B(-4.6,0,43.6,-3.8,5.2,44.4,'conc');B(3.8,0,43.6,4.6,5.2,44.4,'conc');B(-4.6,5.2,43.6,4.6,6.1,44.4,'conc');
    B(-3.4,5.25,43.56,3.4,6.05,43.6,'drSignGate',CV);B(-3.4,5.25,44.4,3.4,6.05,44.44,'drSignGate',CV);
    B(-3.8,0,43.9,3.8,2.4,44.1,'fence',PS);for(const [x0,x1] of [[-3.8,3.8]]){B(x0,2.3,43.88,x1,2.42,44.12,'drSteel');B(x0,0,43.88,x1,.12,44.12,'drSteel')}for(const x of [-3.8,-1.3,1.2,3.7])B(x,0,43.88,x+.1,2.42,44.12,'drSteel');
    B(-3,0,41.4,-2.6,1.1,41.8,'paintY');B(-2.6,.95,41.5,3,1.1,41.7,'paintY',CV);
    // the guard post: concrete, windows on three sides, a door west, a desk and a phone inside
    const X0=5,X1=8.4,Z0=39.6,Z1=43,T=.15;
    wallZ(X0,X0+T,Z0,Z1,0,2.6,'drPanel',[[40.4,42,0,2.2]]);wallZ(X1-T,X1,Z0,Z1,0,2.6,'drPanel',[[40.4,42.2,1,2.1]]);
    wallX(X0,X1,Z0,Z0+T,0,2.6,'drPanel',[[5.6,7.8,1,2.1]]);wallX(X0,X1,Z1-T,Z1,0,2.6,'drPanel',[[5.6,7.8,1,2.1]]);
    B(X1-.09,1,40.4,X1-.05,2.1,42.2,'drGlassT',PS);B(5.6,1,Z0+.05,7.8,2.1,Z0+.09,'drGlassT',PS);B(5.6,1,Z1-.09,7.8,2.1,Z1-.05,'drGlassT',PS);
    B(X0-.3,2.6,Z0-.3,X1+.3,2.8,Z1+.3,'drRoofB',{f:{ny:'drPanel'}});B(7.3,0,40,8.2,.8,42.4,'drPlank');B(7.6,.8,41,7.9,.9,41.3,'drSteel',CV);B(5.25,0,42.2,5.9,1.8,42.8,'drLocker');
    LIGHT(6.7,2.3,41.3,'#fff0d0',5,.5)}
  // ================= the fence round the site: chain-link on concrete posts, barbed wire on top =================
  {const H=2.6,fx=(z,x0,x1)=>{B(x0,0,z-.015,x1,H,z+.015,'fence',PS);for(let x=x0;x<=x1+.01;x+=2.6)B(Math.min(x,x1-.16)-.0,0,z-.08,Math.min(x,x1-.16)+.16,H+.45,z+.08,'conc');B(x0,H,z-.02,x1,H+.42,z+.02,'drWireL',{pass:1,nosolid:true})},
      fz=(x,z0,z1)=>{B(x-.015,0,z0,x+.015,H,z1,'fence',PS);for(let z=z0;z<=z1+.01;z+=2.6)B(x-.08,0,Math.min(z,z1-.16),x+.08,H+.45,Math.min(z,z1-.16)+.16,'conc');B(x-.02,H,z0,x+.02,H+.42,z1,'drWireL',{pass:1,nosolid:true})};
    fx(-44,-44,44);fx(44,-44,-4.6);fx(44,4.6,44);fz(-44,-44,44);fz(44,-44,44)}
  // ================= the motor pool (south-west): the vehicle shed with three trucks, the fuel tank, drums and tyres; the south-west watchtower =================
  {const T='drTin';B(-40,0,12,-39.8,4.2,20,T);B(-40,0,12,-26,4.2,12.2,T);B(-40,0,19.8,-26,4.2,20,T);B(-40.3,4.2,11.7,-25.6,4.36,20.3,T,{f:{ny:'drPlank'}});
    for(const z of [12.2,15.9,19.6])B(-26.2,0,Math.min(z,19.6),-26,4.2,Math.min(z,19.6)+.2,'drSteel');
    truck(-37.2,12.8,'x',true);truck(-36.6,16.4,'x',true,false);truck(-36,21.6,'x',false);
    B(-39.8,0,13,-39,1,16.6,'drPlank');B(-39.8,1,13.2,-39.6,2.2,16.4,'drSteel');for(const z of [17.8,18.6])drum(-39.2,z);tireStack(-38.8,19.2,4);
    for(let i=0;i<3;i++){const z=13.5+i*3;LIGHT(-33,3.7,z,'#fff2d8',7,.62);B(-33.5,4.12,z-.1,-32.5,4.2,z+.1,'lampW',CV)}
    // the fuel point: a tank on two saddles (drawn round by drMesh, a box to bump into), a pump island
    DR.tanks.push({x0:-31,x1:-25,z:25.5,y:1.45,r:.95,h:6,lie:1});B(-30.6,0,24.9,-30.1,.56,26.1,'conc');B(-25.9,0,24.9,-25.4,.56,26.1,'conc');
    B(-31,1.17,24.62,-25,1.73,26.38,'metalx');B(-31,.57,25.22,-25,2.33,25.78,'metalx');
    B(-28.6,0,28,-27.4,.25,29.2,'conc');B(-28.3,.25,28.3,-27.7,1.6,28.9,'drSteel');B(-28.4,1.6,28.2,-27.6,1.75,29,'paintY',CV);
    for(const [x,z] of [[-23.5,24],[-23,25.2],[-22.4,24.4]])drum(x,z,0,'drumR');for(const [x,z,n] of [[-34,28.5,3],[-33.2,29.4,2]])tireStack(x,z,n);
    // the south-west watchtower: a deck at 5 m (x -42.2..-37.8, z 34..38), a straight stair down to the north (on x -40.5)
    const TY=5;for(const [x,z] of [[-42.2,34],[-38,34],[-42.2,37.8],[-38,37.8]])B(x,0,z,x+.2,TY+2.6,z+.2,'drPost');
    B(-42.2,TY-.25,34,-37.8,TY,38,'drPlank');B(-42.6,TY+2.6,33.6,-37.4,TY+2.76,38.4,'drTin',{f:{ny:'drPlank'}});
    B(-42.2,TY,37.92,-37.8,TY+1,38,'drPlank');B(-42.2,TY,34,-42.12,TY+1,37.92,'drPlank');B(-37.88,TY,34,-37.8,TY+1,37.92,'drPlank');B(-42.12,TY,34,-41.4,TY+1,34.08,'drPlank');B(-39.6,TY,34,-37.88,TY+1,34.08,'drPlank');
    tst('z',-41.3,-39.7,26.4,34,0,TY,12,'drPlank');hrail('z',-41.36,-41.3,26.4,34,0,TY,12,'drPost');hrail('z',-39.7,-39.64,26.4,34,0,TY,12,'drPost');
    B(-39.4,TY,36.6,-38.2,TY+.9,37.6,'drAmmo');LIGHT(-40,TY+2.2,36,'#ffe2b0',7,.45)}
  // ================= the supply depot (west): three bays of sandbag walls open to the road, crates and ammunition inside, a camouflage net =================
  {for(const x0 of [-41,-34,-27]){sb(x0,3,x0+5,3.6,1.6);sb(x0,7.4,x0+5,8,1.6);sb(x0,3.6,x0+.6,7.4,1.6);
      for(const [dx,dz,s,h] of [[1.4,4.4,1.2,1],[1.4,5.8,1.1,2],[2.8,4.4,1.1,1],[2.9,6.4,1,1]])for(let k=0;k<h;k++)crate(x0+dx,dz,s,k*s,k%2?'drAmmo':'wood')}
    B(-34.4,2.4,2.6,-28.6,2.44,8.4,'drCamo',{nosolid:true,pass:1});for(const [x,z] of [[-34.2,2.8],[-28.8,2.8],[-34.2,8.2],[-28.8,8.2]])B(x-.06,0,z-.06,x+.06,2.42,z+.06,'drPost')}
  // ================= the barracks (생활관, south-east, x 21..41 z 33..39): doors in both ends and the middle of the south side, bunks, lockers =================
  {const X0=21,X1=41,Z0=33,Z1=39,H=3.2,T=.2,W='drPanel',WIN=[[23,25,1,2.2],[27,29,1,2.2],[33,35,1,2.2],[37,39,1,2.2]];
    B(X0,0,Z0,X1,.3,Z1,'conc',{f:{py:'drFloor'}});
    wallZ(X0,X0+T,Z0,Z1,.3,H,W,[[35.2,36.8,.3,2.6]]);wallZ(X1-T,X1,Z0,Z1,.3,H,W,[[35.2,36.8,.3,2.6]]);
    wallX(X0+T,X1-T,Z0,Z0+T,.3,H,W,WIN);wallX(X0+T,X1-T,Z1-T,Z1,.3,H,W,WIN.slice(0,2).concat([[30.2,31.8,.3,2.6]],WIN.slice(2)));
    for(const [a,b] of WIN.map(w=>[w[0],w[1]])){B(a,1,Z0+.08,b,2.2,Z0+.12,'drGlassT',PS);B(a,1,Z1-.12,b,2.2,Z1-.08,'drGlassT',PS)}
    B(X0-.4,H,Z0-.5,X1+.4,H+.2,Z1+.5,'drRoofB',{f:{ny:'drPanel'}});B(X0-.4,H+.2,Z0+.8,X1+.4,H+.5,Z1-.8,'drRoofB');B(X0-.4,H+.5,Z0+2.2,X1+.4,H+.75,Z1-2.2,'drRoofB');
    B(X0-.04,2.65,35.2,X0,3.15,36.8,'drSignBunk',CV);B(X1,2.65,35.2,X1+.04,3.15,36.8,'drSignBunk',CV);
    // bunks: a solid lower bed, an upper bed on its four posts, blankets; an aisle 2 m wide down the middle
    for(let i=0;i<7;i++){const x=22.4+i*2.6;for(const [z0,z1] of [[Z0+T,Z0+T+.9],[Z1-T-.9,Z1-T]]){if(x>29.6&&x<32.4&&z1>Z1-1)continue;
        B(x,.3,z0,x+1.9,.8,z1,'drSteel',{f:{py:'drMatt'}});B(x,1.6,z0,x+1.9,1.7,z1,'drSteel',{f:{py:'drMatt'}});for(const xx of [x,x+1.82])for(const zz of [z0,z1-.08])B(xx,.8,zz,xx+.08,1.6,zz+.08,'drSteel')}}
    for(const [z0,z1] of [[33.4,35],[37,38.6]]){B(X0+T,.3,z0,X0+T+.55,2.2,z1,'drLocker');B(X1-T-.55,.3,z0,X1-T,2.2,z1,'drLocker')}
    for(const x of [25,31,37]){B(x-.5,H-.06,35.88,x+.5,H,36.12,'lampW',CV);LIGHT(x,H-.5,36,'#fff4e0',7,.55)}}
  // ================= the field north of the trench: machine-gun nests, a burnt-out jeep, wire along the track, crates =================
  {const nest=(cx,cz)=>{sb(cx-1.5,cz-1.5,cx+1.5,cz-.9,1.1);sb(cx-1.5,cz-.9,cx-.9,cz+1.5,1.1);sb(cx+.9,cz-.9,cx+1.5,cz+1.5,1.1);sb(cx-.9,cz+.9,cx-.3,cz+1.5,1.1);B(cx-.15,0,cz-.5,cx+.15,.7,cz-.2,'drSteel')};
    nest(-10,-20);nest(-14,-32);car(-6.2,-21.4,-2.2,-19.6,'carBurnt',{burnt:1});
    // concertina wire along the track (coiled by drMesh), a steel picket every 2.5 m (for looks: you walk through it)
    for(const [x0,x1] of [[-16,-9],[-5,3],[7,12]]){DR.wire.push([x0,x1,-14]);for(let x=x0+.3;x<x1;x+=2.5)B(x-.02,0,-14.03,x+.02,.95,-13.97,'drWireG',CV)}
    for(const [x,z,k] of [[-3,-12.2,0],[19.5,-12.4,1],[-18.6,-15,1]])crate(x,z,1.1,0,k?'drAmmo':'wood')}
  // ================= pines: in the north wood (zombies come out of it), along the fence, by the motor pool, round the square's corners =================
  {for(let i=0;i<26;i++){const x=-17.5+hash2(i,1,12601)*25,z=-43+hash2(i,2,12601)*8.5;if(Math.abs(x+14)<2.6&&Math.abs(z+32)<2.6)continue;if(x>-4.5&&x<5&&z>-35)continue;pine(x,z,0,.85+hash2(i,3,12601)*.5,true)}
    for(const [x,z,s] of [[-43,-8,1],[-43,12,1.1],[-42.8,30,.95],[43,-4,1.1],[43,8,1],[43,26,1.15],[43,36,.9],[-19,43.4,1],[16,43.4,1.05],[-15.5,31.5,.8],[14.6,8.6,.85],[-20.6,-6,.9],[-21.4,9.6,1],[19.2,30.6,.9],[-30,10.6,.9],[-22.6,22,1]])pine(x,z,0,s,true);
    for(let i=0;i<160;i++){const side=i%4,u=-62+hash2(i,1,12611)*124,d=46.6+hash2(i,2,12611)*14,x=side===0?u:side===1?d:side===2?u:-d,z=side===0?-d:side===1?u:side===2?d:u;pine(x,z,drGround(x,z)-.15,1+hash2(i,4,12611)*.6)}}
  // ================= who starts where =================
  MAP.spawns=[];for(const z of [15,18.4])for(let i=0;i<8;i++)MAP.spawns.push([-10.5+i*3+rr(-.2,.2),z+rr(-.2,.2),0,rr(-.4,.4)]);
  MAP.zspawns=[[-14,-41,0],[-6,-42,0],[2,-41,0],[-19,-43,0],[-43,-36,0],[-43,-14,0],[-43,6,0],[-43,24,0],[-12,42,0],[12,42,0],[32,42,0],[43,0,0],[43,14,0],[43,30,0],[40,-32,0],[25,-32,0]];
  MAP.camps=[
    {k:'bunker',w:.16,p:[[-32.8,2.5,-32],[-29.6,2.5,-32.2],[-33.6,2.5,-33.8]],look:[-31,4,-20]},
    {k:'water',w:.14,p:[[3.5,7,-26.5],[-3,7,-26.8],[-3.4,7,-33],[3.2,7,-33.2]],look:[0,1,-10]},
    {k:'range',w:.12,p:[[38.6,5,-21],[40.5,5,-21.4],[41.5,5,-21]],look:[20,1,-12]},
    {k:'sw',w:.1,p:[[-41.4,5,36.8],[-38.6,5,36.6],[-39.6,5,35]],look:[-20,1,25]},
    {k:'net',w:.12,p:[[38.5,5,22.5],[40.2,5,24.2],[39.6,5,22.2]],look:[25,1,15]},
    {k:'barracks',w:.1,p:[[23,.3,36],[39,.3,36],[31,.3,36.2]],look:[31,1,36]},
    {k:'stand',w:.05,p:[[-3,1.6,31.6],[3,1.6,31.6]],look:[0,1,15]},
    {k:'trench',w:.08,p:[[-36,TD,-2.6],[-13,TD,-6.5],[4,TD,-6.5],[27,TD,-2.5]],look:[0,0,-20]},
    {k:'line',w:.05,p:[[16,.3,-17.6],[28,.3,-17.6]],look:[20,1,-30]},
    {k:'guard',w:.02,p:[[6.6,0,41.3]],look:[0,1,38]},
    {k:'depot',w:.04,p:[[-38.5,0,5.5],[-31.5,0,5.5]],look:[-20,1,5]},
    {k:'motor',w:.04,p:[[-38.2,0,16.2],[-28,0,13.6]],look:[-20,1,16]},
  ];
  MAP.spawnYaw=null;
  // late afternoon: the sun low in the west-south-west, warm; long shadows to the east-north-east
  MAP.moon={d:new THREE.Vector3(-.844,.407,.35).normalize(),c:new THREE.Color('#ffdcaa'),i:1.15};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.04);cam.position.set(2+a*7,8.6+Math.sin(t*.05)*.4,27);cam.lookAt(-5+a*5,1.6,-20)}}
// the ground beyond the fence: nothing inside (the map's own ground is there), rising to forested hills
function drGround(x,z){const e=Math.max(Math.abs(x),Math.abs(z))-46;if(e<-.01)return -6;if(e<.01)return 0;const f=clamp(e/100,0,1);
  return e*.16+Math.max(0,fbm(x/58,z/58,12701,4,0)-.32)*70*f+f*f*22}
// ---------- the meshes boxes cannot make: the pines, the lying fuel tank and the water tank's roof, the hills all round ----------
function drMesh(scene){const D=(MAP.moon&&MAP.moon.d)||new THREE.Vector3(0,1,0);
  const K=meshKit(scene),{acc,add,mk,lit}=K,probeAt=sunProbe(D);
  // the pines (mapkit.js pineMeshes)
  pineMeshes(DR.pines,D,K,probeAt,'drBark','drPine');
  // the fuel point's tank lying on its saddles, the water tank's roof
  {const A=acc();for(const t of DR.tanks){const g=new THREE.CylinderGeometry(t.r,t.r,t.x1-t.x0,20,1,false);g.rotateZ(Math.PI/2);g.translate((t.x0+t.x1)/2,t.y,t.z);add(A,g,3,1,lit)}
    for(const [x,y,z,r] of DR.caps){const g=new THREE.ConeGeometry(r,.9,20);g.translate(x,y+.45,z);add(A,g,4,1,lit)}
    if(A.P.length)mk(A,'drSteel')}
  // the bars boxes cannot make (they slope): stringers and handrails
  barMeshes(DR.bars,D,K,probeAt);
  // concertina wire: an oval coil along each run, a loop every 28 cm leaning on the next, thin round steel lit by one look at the light a run
  {const A=acc();for(const [x0,x1,z] of DR.wire){const L=x1-x0,loops=Math.max(2,Math.round(L/.28)),Lb=probeAt((x0+x1)/2,.95,z,.7),cv=new THREE.Curve();
      cv.getPoint=(t,o)=>{o=o||new THREE.Vector3();const a=t*loops*TAU;return o.set(x0+t*L+Math.cos(a)*.07,.44+Math.sin(a)*.42,z+Math.cos(a)*.45)};
      add(A,new THREE.TubeGeometry(cv,loops*14,.011,3,false),1,1,(px,py,pz,nx,ny,nz)=>{const k=.72+.45*Math.max(0,nx*D.x+ny*D.y+nz*D.z);return [Lb[0]*k,Lb[1]*k,Lb[2]*k]})}
    if(A.P.length)mk(A,'drWireG')}
  // the forest up the hills and the hills beyond the fence (mapkit.js): dark spires from past the trees along the fence out to where
  // the haze takes them; a heightfield from the fence line out
  forestMesh(K,drGround,(x,z)=>Math.max(Math.abs(x),Math.abs(z))-46,D,'drPine',{seed:12801});
  hillMesh(scene,drGround,'drHill',D,4.6,81,-46-4.6*30)}
MAPDEFS.drill={n:['솔고개 훈련장','Solgogae Training Ground'],gside:'drRevet',d:['소나무 골짜기의 육군 훈련장, 늦은 오후. 가운데를 가로지르는 교통호, 벙커가 박힌 고지, 7 m 급수탑, 사격장 통제탑, 장애물 코스의 그물탑, 생활관과 연병장 단상 — 건물보다 흙벽 · 모래주머니 · 목책이 많은 야외 맵. 좀비는 울타리 안쪽 숲과 길에서 온다.',
    'An army training ground in a pine valley, late afternoon: the trench line across the middle, the pillbox sunk into the hill, the 7 m water tower, the range control tower, the net tower on the obstacle course, the barracks and the reviewing stand on the parade square — earthworks, sandbags and timber more than buildings. The zombies come out of the woods and along the roads inside the fence.'],
  env:{sky:1,sun:1,skyTex:'drSky',halo:'#ffd8a0',rain:0,storm:0,fog:'#a8ada2',fogD:.0066,bloomThr:.88,ambOut:'#727866',ambIn:'#3c3a32',boAmb:.55},
  bounds:[-46,-46,46,46],probeY:[-1.3,.9,2.4,3.9,5.6,7.6],mini:[-.8,3.2],miniName:['B1','1F','2F'],tex:bakeDrillTex,build:buildDrill,mesh:drMesh};

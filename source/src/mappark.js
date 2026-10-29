'use strict';
// ============ Map "별빛랜드 Starlight Land" (v7.11): an amusement park shut for the night, its lights left burning ============
// An original map (no reference), for the zombie modes and PvP. The last guests went home and the gates were locked, but nobody switched
// the park off: the neon over the gate, the bulbs round the carousel's canopy, the ferris wheel's rim, the coaster's track all still glow,
// and a music box goes on playing the carousel's waltz. South: the gate (three lanes through the ticket booths, the neon arch over them),
// the plaza with its fountain, the information office and the photo shop; the main street up the middle (the souvenir shop and the
// candy house, both with roof terraces up a stair at the back) to the central plaza and its carousel. North: the castle (its hall, a
// stair up the inside of the west wall to the battlements on its roof, the towers with their blue cones); north-west the roller coaster
// (the station's platform 4.2 m up two stairs, the train waiting in it, the lift hill along the back fence, the drop, the turn round);
// north-east the ferris wheel (its boarding platform; the one cabin down at it you can climb into). West: the haunted house (nine dark
// rooms, one of them a dead end full of coffins), the hedge garden and its gazebo, the food court (a terrace on its roof), the pirate
// ship on its swing; east: the bumper cars under their roof, the drop tower, the row of game booths. The backstage road along the north
// wall: the workshop, containers. A clear night: the moon high in the south-west, stars, the town's glow on the haze to the south.
Object.assign(MATS,{
  slPave:{t:'slPave',s:2,k:'stone',cs:1},slBrick:{t:'slBrick',s:2,k:'stone',cs:1},slGrass:{t:'slGrass',s:3,k:'soft',cs:2},slAsph:{t:'slAsph',s:4,k:'stone',cs:2},
  slFlower:{t:'slFlower',s:1.6,k:'soft'},slWater:{t:'slWater',s:3,emis:.12,k:'glass'},slPlate:{t:'slPlate',s:1.2,k:'metal',cs:1},slStoneW:{t:'slStoneW',s:1.6,k:'stone'},
  slStucco:{t:'slStucco',s:2,k:'stone',cs:1},slStuccoP:{t:'slStuccoP',s:2,k:'stone',cs:1},slStuccoB:{t:'slStuccoB',s:2,k:'stone',cs:1},slWood:{t:'slWood',s:1.2,k:'wood'},
  slCastle:{t:'slCastle',s:2.4,vo:0,sv:2.4,k:'stone',cs:1.2},slCastleIn:{t:'slCastleIn',s:2.4,vo:0,sv:2.4,k:'stone',cs:1.2},slCastleD:{t:'slCastleD',s:1.2,k:'stone'},
  slGold:{t:'slGold',s:.6,k:'metal'},slHaunt:{t:'slHaunt',s:2,vo:0,sv:2,k:'wood',cs:1},slHauntIn:{t:'slHauntIn',s:2,vo:0,sv:4,k:'wood',cs:1},
  slBoard:{t:'slBoard',uv:'box',k:'wood'},slFenceI:{t:'slFenceI',s:1.6,vo:.5,sv:1.9,k:'metal'},slFenceL:{t:'slFenceI',s:1.6,vo:-1,sv:1.9,k:'metal'},slBrickW:{t:'slBrickW',s:1.6,k:'stone',cs:1},slConc:{t:'slConc',s:2,k:'stone',cs:1},
  slSteel:{t:'slSteel',s:1.2,k:'metal'},slSteelW:{t:'slSteelW',s:1.2,k:'metal'},slGlass:{t:'slGlass',uv:'box',k:'glass'},slAwning:{t:'slAwning',s:1.2,k:'soft'},
  slAwningB:{t:'slAwningB',s:1.2,k:'soft'},slTentY:{t:'slTentY',s:1.5,k:'soft'},slPlank:{t:'slPlank',s:1.6,k:'wood',cs:1},slRoofM:{t:'slRoofM',s:2,k:'metal',cs:2},
  slFascia:{t:'slFascia',s:1.6,vo:0,sv:.6,emis:.9,k:'metal'},slStar:{t:'slStar',uv:'box',emis:1.25,k:'metal'},slCandyP:{t:'slCandyP',s:2,k:'stone'},slLamp:{t:'slLamp',uv:'box',emis:1.2,k:'glass'},
  slStain:{t:'slStain',uv:'box',emis:.55,k:'glass'},slBanner:{t:'slBanner',uv:'box',k:'soft'},slThrone:{t:'slThrone',uv:'box',k:'wood'},slArmor:{t:'slArmor',uv:'box',k:'metal'},
  slCobweb:{t:'slCobweb',uv:'box',k:'soft'},slPortrait:{t:'slPortrait',uv:'box',emis:.08,k:'wood'},slMirrorH:{t:'slMirrorH',uv:'box',k:'glass'},slCarpet:{t:'slCarpet',s:3,k:'soft'},
  slStoneF:{t:'slStoneF',s:2.4,k:'stone',cs:1.2},slTileF:{t:'slTileF',s:1.2,k:'stone',cs:1},slOak:{t:'slOak',s:1.6,k:'wood',cs:1},slWoodF:{t:'slWoodF',s:1.6,k:'wood',cs:1},slCeilP:{t:'slCeilP',s:1.2,k:'stone',cs:1.2},
  slCeilH:{t:'slCeilH',s:2,k:'wood',cs:2},slCeilC:{t:'slCeilC',s:2.4,emis:.06,k:'stone',cs:2.4},slCoffin:{t:'slCoffin',uv:'box',k:'wood'},slGrave:{t:'slGrave',uv:'box',k:'stone'},
  slTrain:{t:'slTrain',uv:'box',k:'metal'},slSeat:{t:'slSeat',s:.8,k:'soft'},slGondola:{t:'slGondola',s:2,k:'metal'},slGlassG:{t:'slGlassG',uv:'box',k:'glass'},
  slBumpR:{t:'slBumpR',uv:'box',k:'metal'},slBumpB:{t:'slBumpB',uv:'box',k:'metal'},slBumpY:{t:'slBumpY',uv:'box',k:'metal'},slBumpG:{t:'slBumpG',uv:'box',k:'metal'},
  slRubber:{t:'slRubber',s:1,k:'soft'},slGrid:{t:'slGrid',s:2,k:'metal',cs:2},slTower:{t:'slTower',s:2.4,k:'metal',cs:2},slLed:{t:'slLed',s:2,emis:1.3,k:'glass'},
  slHedge:{t:'slHedge',s:1.6,k:'soft',cs:1},slCont:{t:'slCont',s:2.4,k:'metal',cs:2},slContB:{t:'slContB',s:2.4,k:'metal',cs:2},slMap:{t:'slMap',uv:'box',emis:.25,k:'wood'},
  slShip:{t:'slShip',s:1.6,k:'wood',cs:1},slBench:{t:'slBench',s:1,k:'wood'},slBin:{t:'slBin',uv:'boxV',s:1.6,k:'metal'},slPlush:{t:'slPlush',uv:'boxV',s:2,k:'soft'},
  slCandy:{t:'slCandy',uv:'boxV',s:2,k:'glass'},slTicket:{t:'slTicket',uv:'box',emis:.35,k:'glass'},slMenu0:{t:'slMenu0',uv:'box',emis:.7,k:'glass'},slMenu1:{t:'slMenu1',uv:'box',emis:.7,k:'glass'},
  slMenu2:{t:'slMenu2',uv:'box',emis:.7,k:'glass'},slMenu3:{t:'slMenu3',uv:'box',emis:.7,k:'glass'},slKitchen:{t:'slKitchen',uv:'box',k:'metal'},slCounterF:{t:'slCounterF',uv:'box',k:'wood'},
  slPrize0:{t:'slPrize0',uv:'box',k:'soft'},slPrize1:{t:'slPrize1',uv:'box',k:'wood'},slPrize2:{t:'slPrize2',uv:'box',k:'glass'},slPrize3:{t:'slPrize3',uv:'box',k:'soft'},
  slClaw:{t:'slClaw',uv:'box',emis:.35,k:'glass'},slCart:{t:'slCart',uv:'box',k:'metal'},slBus:{t:'slBus',uv:'box',k:'metal'},slClockC:{t:'slClockC',uv:'box',emis:.3,k:'metal'},
  slClockG:{t:'slClockG',uv:'box',k:'wood'},slBooksH:{t:'slBooksH',uv:'boxV',s:1.2,k:'wood'},slCase:{t:'slCase',uv:'box',emis:.2,k:'glass'},slLocker:{t:'slLocker',uv:'boxV',s:1.6,k:'metal'},
  slPhoto:{t:'slPhoto',uv:'box',emis:.2,k:'soft'},slPost:{t:'slPost',uv:'box',k:'wood'},slSaddle:{t:'slSaddle',s:.6,k:'soft'},
  slSignGate:{t:'slSignGate',uv:'box',emis:.85,k:'glass'},slSignCoaster:{t:'slSignCoaster',uv:'box',emis:.85,k:'glass'},slSignHaunt:{t:'slSignHaunt',uv:'box',emis:.85,k:'glass'},
  slSignBump:{t:'slSignBump',uv:'box',emis:.85,k:'glass'},slSignFerris:{t:'slSignFerris',uv:'box',emis:.85,k:'glass'},slSignFood:{t:'slSignFood',uv:'box',emis:.85,k:'glass'},
  slSignShop1:{t:'slSignShop1',uv:'box',emis:.85,k:'glass'},slSignShop2:{t:'slSignShop2',uv:'box',emis:.85,k:'glass'},slSignInfo:{t:'slSignInfo',uv:'box',emis:.8,k:'glass'},
  slSignPhoto:{t:'slSignPhoto',uv:'box',emis:.8,k:'glass'},slSignDrop:{t:'slSignDrop',uv:'box',emis:.85,k:'glass'},slSignViking:{t:'slSignViking',uv:'box',emis:.85,k:'glass'},
  slSignGame0:{t:'slSignGame0',uv:'box',emis:.8,k:'glass'},slSignGame1:{t:'slSignGame1',uv:'box',emis:.8,k:'glass'},slSignGame2:{t:'slSignGame2',uv:'box',emis:.8,k:'glass'},
  slSignGame3:{t:'slSignGame3',uv:'box',emis:.8,k:'glass'},slSignCastle:{t:'slSignCastle',uv:'box',emis:.8,k:'glass'},slSignExit:{t:'slSignExit',uv:'box',emis:1,k:'glass'},
  slSignWork:{t:'slSignWork',uv:'box',k:'metal'},
});
MATK.slX='wood';
// ---------- textures ----------
const SL_FONT='"Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
// the night: black-blue overhead, violet low down, the town's sodium glow on the haze to the south; dark clouds; the hills north, the
// town's blocks south with their windows lit (the moon and the stars are the sky's own)
function texSlSky(){return paint(1024,256,P=>{const YH=232;
  const ridge=(x,s,f0)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=f0<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  const R1=new Float32Array(1024),R2=new Float32Array(1024);
  for(let x=0;x<1024;x++){const nf=Math.max(0,Math.cos((x/1024-.75)*TAU)),sf=Math.max(0,Math.cos((x/1024-.25)*TAU));R1[x]=YH-4-ridge(x,16011,3)*(10+34*nf);
    const bw=6+Math.floor(hash2(Math.floor(x/9),1,16021)*10),bi=Math.floor(x/bw);R2[x]=hash2(bi,2,16022)<.6*sf+.08?YH-2-hash2(bi,3,16023)*(6+24*sf):YH}
  for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/YH,sf=Math.max(0,Math.cos((x/1024-.25)*TAU));
    let c=mix('#04061a','#121634',clamp(t*1.3,0,1));c=mix(c,'#28224c',clamp((t-.5)*2,0,1));c=mix(c,'#54385a',clamp((t-.78)*4,0,1)*(.3+.7*sf));c=mix(c,'#a2604c',clamp((t-.9)*8,0,1)*sf*.75);
    const cl=P.n(x,y*3,140,16001,4),cy=clamp((t-.25)*2.5,0,1)*clamp((.9-t)*4,0,1);if(cl>.58&&y<YH){const k=clamp((cl-.58)*4,0,1)*cy;c=mix(c,mix('#1a1832','#3a3050',clamp(t*1.2,0,1)),k*.8)}
    if(y>R1[x]&&y<YH)c=mix('#0c0e1c','#10121e',clamp((y-R1[x])/20,0,1));
    if(y>R2[x]&&R2[x]<YH){c='#0a0b16';if((x%4<2)&&(y%3===1)&&hash2(x>>1,y,16024)<.28)c=hash2(x,y,16025)<.7?'#ffcf80':'#9ab8ff'}
    if(y>=YH)c=mix('#0c0c18','#08080e',clamp((y-YH)/24,0,1));P.set(x,y,c)}})}
// the park's paths: pavers 25 × 12.5 cm in running bond, grey and buff, dark joints
function texSlPave(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/16),ly=y%16;for(let x=0;x<N;x++){const xx=(x+(row&1)*16)%N,bi=Math.floor(xx/32),lx=xx%32,id=row*31+bi*7;
    let c=dith(P,x,y,.5+(hash2(id,1,16101)-.5)*.4+(P.n(x,y,24,16102,3)-.5)*.25,hash2(id,2,16103)<.35?['#8a8274','#968e80','#a29a8c']:['#7a7a78','#868684','#929290'],.08);
    if(ly<1||lx<1)c='#4a4640';if(hash2(x,y,16104)<.006)c='#c8c0b0';P.set(x,y,c)}}})}
// the main street and the castle's court: red clay pavers in basketweave
function texSlBrick(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/32),by=Math.floor(y/32),hz=(bx+by)%2===0,lx=x%32,ly=y%32,k=hz?Math.floor(ly/16):Math.floor(lx/16),id=bx*13+by*7+k*3;
    let c=dith(P,x,y,.5+(hash2(id,1,16111)-.5)*.45+(P.n(x,y,20,16112,2)-.5)*.2,['#6a2e22','#7a362a','#863e30','#924636'],.1);if((hz?ly%16<1:lx%16<1)||lx<1||ly<1)c='#3e2a22';P.set(x,y,c)}})}
function texSlGrass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,30,16121,4),b=P.n(x,y,90,16122,3),h=hash2(x,y,16123);
    let c=dith(P,x,y,n*.8+b*.25+(h-.5)*.2,['#304a26','#38542a','#405e30','#4a6a36'],.14);if(b<.3&&h<.3)c=mix(c,'#5a5a3a',.4);if(h>.992)c='#c8d0a0';P.set(x,y,c)}})}
// the flower beds: pansies and tulips, red, yellow, white, violet, in dark leaves
function texSlFlower(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,,id]=cellN(P,x,y,8,16131);
    let c=dith(P,x,y,.5+(P.n(x,y,16,16132,2)-.5)*.5,['#1e3a1c','#264422','#2e4e28'],.12);if(f1<2.6){c=rpickH(id,['#d83a4a','#f0c040','#f2eee8','#8a4ad8','#e86aa8','#f08a3a']);if(f1<.8)c='#f8e8a0'}P.set(x,y,c)}})}
function texSlAsph(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,24,16141,4),h=hash2(x,y,16142);let c=dith(P,x,y,n*.7+(h-.5)*.3,['#2e2e32','#36363a','#3e3e42'],.1);
    if(Math.abs(P.n(x,y,60,16143,3)-.5)<.012)c='#202024';if(h>.993)c='#5a5a5e';P.set(x,y,c)}})}
// the fountain's water: dark teal, ripples catching the lamps
function texSlWater(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.sin((x+P.n(x,y,32,16151,3)*40)*.25)*.5+.5;let c=mix('#0e2a34','#1a4652',r*r);if(r>.96&&hash2(x>>1,y>>1,16152)<.5)c='#8ac8d8';P.set(x,y,c)}})}
// the bumper cars' floor: steel tread plate
function texSlPlate(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const lx=x%16,ly=y%16,d=(Math.floor(x/16)+Math.floor(y/16))%2?Math.abs(lx-ly):Math.abs(lx+ly-15);
    let c=dith(P,x,y,.5+(P.n(x,y,16,16161,2)-.5)*.3,['#4a4e54','#545860','#5e6268'],.08);if(d<2)c='#7a7e84';P.set(x,y,c)}})}
function texSlStoneW(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const by=Math.floor(y/32),bx=Math.floor((x+(by&1)*32)/64),lx=(x+(by&1)*32)%64,ly=y%32;
    let c=dith(P,x,y,.55+(hash2(bx,by,16171)-.5)*.25+(P.n(x,y,16,16172,2)-.5)*.2,['#a8a49a','#b4b0a6','#c0bcb2'],.06);if(lx<1||ly<1)c='#6a665e';P.set(x,y,c)}})}
// pastel stucco (cream, rose, mint), a little stained low down
function slStucco(cols,seed){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.55+(P.n(x,y,40,seed,3)-.5)*.25+(hash2(x,y,seed+1)-.5)*.1,cols,.05);
    if(P.n(x,y*.3,30,seed+2,2)>.7&&y>N*.7)c=dk(c,.12);P.set(x,y,c)}})}
function texSlWood(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){const b=Math.floor(x/16),lx=x%16;let c=dith(P,x,y,.5+Math.sin(y*.18+P.n(x,y,12,16181+b,2)*5)*.15+(hash2(b,1,16182)-.5)*.2,['#3a2416','#46301c','#523a24'],.08);
    if(lx<1)c='#1e140c';P.set(x,y,c)}})}
// the castle: pale rose-cream blocks (45 × 22 cm on the 2.4 m tile), light mortar, a block of deeper pink here and there
function texSlCastle(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/24),ly=y%24;for(let x=0;x<N;x++){const xx=(x+(row&1)*24)%N,bi=Math.floor(xx/48),lx=xx%48,id=row*37+bi*11;
    let c=dith(P,x,y,.55+(hash2(id,1,16191)-.5)*.3+(P.n(x,y,20,16192,3)-.5)*.2,hash2(id,2,16193)<.12?['#c8909a','#d29ca4','#dca8ae']:['#d8c4b8','#e2cec2','#ecd8cc'],.06);
    if(ly<2||lx<2)c='#f2eae0';P.set(x,y,c)}}})}
function texSlCastleIn(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/24),ly=y%24;for(let x=0;x<N;x++){const xx=(x+(row&1)*24)%N,bi=Math.floor(xx/48),lx=xx%48,id=row*37+bi*11;
    let c=dith(P,x,y,.5+(hash2(id,1,16201)-.5)*.3+(P.n(x,y,20,16202,3)-.5)*.2,['#8a7a70','#968678','#a29282'],.06);if(ly<2||lx<2)c='#5a4e46';P.set(x,y,c)}}})}
function texSlCastleD(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,12,16211,2)-.5)*.4,['#6a5a64','#76666e','#82727a'],.08);if(x%32<1||y%32<1)c='#4a3e46';P.set(x,y,c)}})}
// the castle's cones: blue slate in fish-scale rows
function texSlRoofB(){return paint(128,128,P=>{for(let y=0;y<128;y++){const row=Math.floor(y/10),ly=y%10;for(let x=0;x<128;x++){const xx=(x+(row&1)*8)%128,lx=xx%16,d=Math.hypot(lx-8,ly-1.5)/8;
    let c=dith(P,x,y,.6-d*.4+(hash2(Math.floor(xx/16),row,16221)-.5)*.25,['#1e3a7a','#28468a','#32529a','#3e60aa'],.08);if(d>.96||ly===9)c='#122450';P.set(x,y,c)}}})}
function texSlGold(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){const b=Math.sin(y*.5+x*.1)*.5+.5;P.set(x,y,mix('#8a6418','#f0d070',b*b))}})}
// the haunted house: grey-violet clapboard, weathered and peeling, nail streaks
function texSlHaunt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const b=Math.floor(y/20),ly=y%20;for(let x=0;x<N;x++){
    let c=dith(P,x,y,.5+(P.n(x,y,30,16231,3)-.5)*.35+(hash2(b,Math.floor(x/90),16232)-.5)*.2,['#3e3a46','#48434f','#524c58','#5c5662'],.08);
    if(ly>17)c=dk(c,.45);if(P.n(x,y,14,16233,3)>.7)c=mix(c,'#7a7068',.4);if(hash2(x,y>>2,16234)<.004)c='#2a2420';P.set(x,y,c)}}})}
// inside: dark damask wallpaper over a wainscot, peeling, a stain coming down; the 4 m storey on the picture
function texSlHauntIn(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=(N-1-y)/N*4;let c;
    if(h<1.1){c=dith(P,x,y,.5+Math.sin(x*.3)*.1+(hash2(x>>4,0,16241)-.5)*.2,['#2a1a12','#341f16','#3e261a'],.08);if(x%32<1)c='#180e08';if(h>1.04)c='#4a3020'}
    else{const lx=x%32,ly=y%48,d=Math.abs(Math.hypot(lx-16,(ly-24)*.7)-9);c=dith(P,x,y,.5+(P.n(x,y,24,16242,3)-.5)*.3,['#1e2a24','#24322a','#2a3a30'],.08);if(d<1.6)c='#3a4a3a';
      if(P.n(x,y,40,16243,3)>.68)c=mix(c,'#5a5040',.55);if(P.n(x*3,y*.4,30,16244,2)>.74)c=dk(c,.4)}P.set(x,y,c)}})}
function texSlBoard(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c='#0a0a10';if(x<4||x>59||y<4||y>59)c='#2a2228';
    const p1=Math.abs((x-y))<5,p2=Math.abs(x+y-63)<5,h1=y>24&&y<34;if(p1||p2||h1)c=dith(P,x,y,.5+(hash2(x>>2,y>>3,16251)-.5)*.3,['#4a3a2a','#56442e','#624e36'],.1);P.set(x,y,c)}})}
// the iron fence: bars with spear tops, two rails (the 1.9 m panel on its plinth)
function texSlFenceI(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){const lx=x%16,yy=127-y;let on=false;
    if(lx>=7&&lx<=9&&yy<118)on=true;if(yy>=118&&yy<126&&Math.abs(lx-8)<=(126-yy)/2.4)on=true;if((yy>=10&&yy<14)||(yy>=104&&yy<108))on=true;
    if(on)P.set(x,y,mix('#1a1c22','#3a3e46',hash2(x,y,16261)*.6));else P.alpha(x,y,0)}})}
function texSlBrickW(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/8),ly=y%8;for(let x=0;x<N;x++){const xx=(x+(row&1)*16)%N,bi=Math.floor(xx/32),lx=xx%32,id=row*41+bi*7;
    let c=dith(P,x,y,.5+(hash2(id,1,16271)-.5)*.5+(P.n(x,y,16,16272,2)-.5)*.25,['#6a2c22','#78342a','#843c30'],.1);if(ly===7||lx===31)c='#8a8278';P.set(x,y,c)}}})}
function texSlConc(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,16281,4),h=hash2(x,y,16282);let c=dith(P,x,y,n*.6+(h-.5)*.2,['#7a7874','#86847e','#92908a'],.06);
    if(P.n(x,y,18,16283,2)>.7&&y>N*.6)c=mix(c,'#4a4842',.35);P.set(x,y,c)}})}
function texSlSteel(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,12,16291,2)-.5)*.3,['#2a3038','#323840','#3a4048'],.08);if(hash2(x,y,16292)<.01)c='#6a5040';P.set(x,y,c)}})}
function texSlSteelW(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.6+(P.n(x,y,12,16301,2)-.5)*.3,['#b4b8bc','#c0c4c8','#cccfd2'],.06);if(P.n(x,y,8,16302,2)>.76)c=mix(c,'#7a6a5a',.4);P.set(x,y,c)}})}
function texSlRail(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){const b=Math.sin(y*.4)*.5+.5;P.set(x,y,mix('#7a1420','#d83040',b))}})}
// a shop window: a painted frame, a transom, glass to see through (glints)
function texSlGlass(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const fr=x<6||x>121||y<6||y>121||Math.abs(y-34)<3||Math.abs(x-64)<2;
    if(fr){P.set(x,y,mix('#e8e0d0','#f8f2e8',hash2(x,y,16311)*.5));continue}const g=(x+y*.8)%90;if(g<2&&hash2(x>>2,y>>2,16312)<.5){P.set(x,y,'#e0eaf4');continue}P.alpha(x,y,0)}})}
function texSlGlassG(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){if(x<3||x>60||y<3||y>60){P.set(x,y,'#c8ccd0');continue}if((x+y)%40<2){P.set(x,y,'#dce8f2');continue}P.alpha(x,y,0)}})}
function slStripes(c1,c2,n,seed){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=Math.floor(x/(64/n))%2?c1:c2;c=mix(c,'#000',P.n(x,y,24,seed,2)*.15);if(y>56)c=dk(c,.3);P.set(x,y,c)}})}
function texSlPlank(){return paint(128,128,P=>{for(let y=0;y<128;y++){const b=Math.floor(y/16),ry=y%16;for(let x=0;x<128;x++){const id=b*13+Math.floor((x+b*41)/64);
    let c=dith(P,x,y,.5+Math.sin(x*.25+P.n(x,y,14,16321,2)*5)*.15+(hash2(id,1,16322)-.5)*.3,['#4a3a2a','#56442e','#624e36'],.08);if(ry===0||(x+b*41)%64===0)c='#241a12';P.set(x,y,c)}}})}
function texSlRoofM(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.sin(x/128*TAU*8)*.5+.5;let c=mix('#3a4048','#5a6068',r);if(P.n(x,y,24,16331,3)>.7)c=mix(c,'#6a4a3a',.35);P.set(x,y,c)}})}
// the fascia round the bumper cars' roof and the ride's skirts: a painted board, a row of bulbs (the 0.6 m strip)
function texSlFascia(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=mix('#5a1a5a','#3a1240',y/64);if(y<4||y>59)c='#c8a040';
    const d=Math.hypot((x%16)-8,y-32);if(d<4.5)c=d<2.2?'#fff8e0':mix('#ffd070','#c88a30',(d-2.2)/2.3);P.set(x,y,c)}})}
function texSlStar(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const dx=x-31.5,dy=y-33,a=Math.atan2(dy,dx),r=Math.hypot(dx,dy),k=Math.cos(5*(a+Math.PI/2)),R=19+9*k;
    if(r<R){P.set(x,y,r<R-4?mix('#fff8c0','#ffd040',r/R):'#f0a020')}else P.alpha(x,y,0)}})}
// the gate's pillars: a barber's-pole spiral of red and cream
function texSlCandyP(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const s=Math.floor((x+y)/16)%2;let c=s?'#e8dcc8':'#b02838';c=mix(c,'#000',P.n(x,y,16,16341,2)*.12);P.set(x,y,c)}})}
function texSlLamp(){return paint(32,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<32;x++){let c=mix('#fff0c8','#ffc860',Math.abs(y-32)/32);if(x<3||x>28||y<3||y>60||Math.abs(x-16)<1)c='#1a1c22';P.set(x,y,c)}})}
// the castle's stained glass: panes of ruby, sapphire, gold and green in lead, a star in the middle
function texSlStain(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){const [f1,f2,id]=cellN(P,x,y,12,16351);let c=rpickH(id,['#b0203a','#2a4ab0','#d0a030','#2a8a5a','#7a3aa8']);
    if(f2-f1<1.4)c='#14121a';const d=Math.hypot(x-32,y-60);if(d<9)c=d>7.5?'#14121a':'#fff0a0';if(x<3||x>60||y<3||y>124)c='#2a2228';if(y<20&&Math.hypot(x-32,y-30)>30)c='#2a2228';P.set(x,y,c)}})}
function texSlBanner(){return paint(64,160,P=>{for(let y=0;y<160;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,16361,2)-.5)*.3,['#3a1a5a','#442066','#4e2672'],.06);if(x<5||x>58)c='#c8a040';
    if(y>140&&Math.abs(x-32)>(160-y)*1.6)c=null;const d=Math.hypot(x-32,y-60);if(d<13){const a=Math.atan2(y-60,x-32),k=Math.cos(5*(a+Math.PI/2));if(d<8+4*k)c='#f0d070'}
    if(Math.abs(Math.hypot(x-32,y-100)-9)<2.4&&x<38)c='#f0e8c8';if(c)P.set(x,y,c);else P.alpha(x,y,0)}})}
function texSlThrone(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=mix('#6a0a1a','#a01a2a',Math.sin(x*.2)*.5+.5);if(x<6||x>57||y<6)c='#d0a040';if(y>80)c=y>84?'#5a0a14':'#d0a040';
    if(y<20&&Math.abs(x-32)<6)c='#f0d070';P.set(x,y,c)}})}
function texSlArmor(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=null;const cx=Math.abs(x-32);
    if(y<26&&cx<10)c=y>12&&y<16&&cx<7?'#141418':'#8a9098';else if(y<70&&cx<16-Math.max(0,(y-40)*.1))c=mix('#6a7078','#b8c0c8',Math.sin(cx*.25)*.5+.5);else if(y<124&&cx<14&&cx>2)c='#7a8088';
    if(c&&hash2(x,y,16371)<.02)c='#d0d8e0';if(c)P.set(x,y,c);else P.set(x,y,'#2a2622')}})}
function texSlCobweb(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x,y),a=Math.atan2(y,x);const sp=Math.abs(((a/(Math.PI/2)*7)%1)-.5)<.06,rg=Math.abs((r%9)-4.5)<.5&&r<60;
    if((sp||rg)&&r<62&&hash2(x,y,16381)<.85)P.set(x,y,'#c8c8c0');else P.alpha(x,y,0)}})}
// the portraits in the haunted hall: dark oils of a figure whose eyes follow you, in a gilt frame
function texSlPortrait(){return paint(64,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<64;x++){let c=mix('#1a140e','#2a1e14',P.n(x,y,20,16391,3));const hx=x-32,hy=y-34;
    if(Math.hypot(hx,hy*.8)<11)c='#3a2c22';if(y>48&&Math.abs(hx)<20-((y-48)*-.2))c='#22181a';if(Math.abs(hy+2)<2&&(Math.abs(hx-5)<2||Math.abs(hx+5)<2))c='#e8f080';
    if(x<6||x>57||y<6||y>89)c=hash2(x,y,16392)<.3?'#a08030':'#7a5a20';P.set(x,y,c)}})}
function texSlMirrorH(){return paint(64,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<64;x++){let c=mix('#30363e','#5a626a',(x+y)/160);if(Math.abs((x*.7+y*.3)%23-11)<.5&&y<70)c='#c8d0d8';if(x<5||x>58||y<5||y>90)c='#5a4020';P.set(x,y,c)}})}
function texSlCarpet(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,16401)-.5)*.3,['#6a0e18','#7a121e','#861824'],.08);if(x<4||x>59)c='#b08830';P.set(x,y,c)}})}
function texSlStoneF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/64),by=Math.floor(y/64),k=(bx+by)%2;
    let c=dith(P,x,y,.5+(P.n(x,y,24,16411,3)-.5)*.3+(hash2(bx,by,16412)-.5)*.2,k?['#6a6062','#766c6e','#82787a']:['#9a9088','#a69c94','#b2a8a0'],.06);if(x%64<1||y%64<1)c='#3a3234';P.set(x,y,c)}})}
function texSlTileF(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const k=(Math.floor(x/32)+Math.floor(y/32))%2;let c=k?'#d8ccb4':'#8a7464';c=mix(c,'#fff',hash2(x,y,16421)*.06);if(x%32<1||y%32<1)c='#5a4e44';P.set(x,y,c)}})}
function texSlOak(){return paint(128,128,P=>{for(let y=0;y<128;y++){const b=Math.floor(y/12),ry=y%12;for(let x=0;x<128;x++){const id=b*13+Math.floor((x+b*37)/72);
    let c=dith(P,x,y,.5+Math.sin(x*.28+P.n(x,y,14,16441+b,2)*5)*.14+(hash2(id,1,16442)-.5)*.25,['#8a6a46','#987650','#a6825a','#b28e64'],.07);if(ry===0||(x+b*37)%72===0)c='#4a3826';P.set(x,y,c)}}})}
function texSlWoodF(){return paint(128,128,P=>{for(let y=0;y<128;y++){const b=Math.floor(y/14),ry=y%14;for(let x=0;x<128;x++){const id=b*13+Math.floor((x+b*53)/80);
    let c=dith(P,x,y,.45+Math.sin(x*.3+P.n(x,y,14,16431,2)*5)*.15+(hash2(id,1,16432)-.5)*.3,['#241810','#2e2016','#38281c'],.08);if(ry===0||(x+b*53)%80===0)c='#120c08';if(P.n(x,y,30,16433,3)>.7)c=mix(c,'#4a4038',.3);P.set(x,y,c)}}})}
function texSlCeilP(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.6+(hash2(x,y,16441)-.5)*.3,['#b8b4aa','#c4c0b6','#d0ccc2'],.05);if(x%64<2||y%64<2)c='#8a867c';P.set(x,y,c)}})}
function texSlCeilH(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,16451,3)-.5)*.4,['#1a1410','#221a14','#2a2018'],.08);if(x%64<10)c=mix('#3a2a1e','#241a12',(x%64)/10);P.set(x,y,c)}})}
// the castle hall's ceiling: midnight blue with painted stars, ribs in gold
function texSlCeilC(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=mix('#141c4a','#1c2860',P.n(x,y,30,16461,3));if(hash2(x,y,16462)<.008)c='#f8e8a0';if(x%64<3||y%64<3)c='#a08030';P.set(x,y,c)}})}
function texSlCoffin(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+Math.sin(y*.15+P.n(x,y,10,16471,2)*4)*.15,['#2a160e','#341c12','#3e2216'],.08);
    if(x<4||x>59||y<4||y>123)c='#5a3a20';if((y===30||y===90)&&x>8&&x<56)c='#8a7040';if(Math.abs(x-32)<2&&y>40&&y<80)c='#8a7040';P.set(x,y,c)}})}
function texSlGrave(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,12,16481,3)-.5)*.5,['#4a4c50','#56585c','#626468'],.1);if(P.n(x,y,8,16482,2)>.72)c=mix(c,'#3a4a2a',.5);
    if((y>18&&y<21||y>30&&y<32||y>38&&y<40)&&x>14&&x<50)c='#2e3034';P.set(x,y,c)}})}
function texSlTrain(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=mix('#4a1a7a','#6a2aa0',y/64);if(y>40&&y<46)c='#f0c040';if(y>56)c='#1a1a22';
    const d=Math.hypot(x-64,y-22),a=Math.atan2(y-22,x-64),k=Math.cos(5*(a+Math.PI/2));if(d<8+3*k)c='#ffe080';P.set(x,y,c)}})}
function texSlSeat(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=dith(P,x,y,.5+(hash2(x,y,16491)-.5)*.3,['#12141c','#1a1c26','#222430'],.08);if(y%16<1)c='#0a0a10';P.set(x,y,c)}})}
function texSlGondola(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const k=Math.floor(x/32)%4;let c=['#c8304a','#e8a030','#2a8ac8','#7a4ac8'][k];c=mix(c,'#fff',hash2(x,y,16501)*.06);
    if(x%32<2||y%64<2)c='#e8e4dc';P.set(x,y,c)}})}
// a bumper car: glossy paint, a number, the black rubber bumper round the bottom
function slBump(col,n){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=mix(lt(col,.15),dk(col,.25),y/40);if(y>40)c=y>44?'#121216':'#3a3a40';if(y<4)c=lt(col,.3);P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#fff8e8';x.font='bold 26px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(String(n),64,22)}})}
function texSlRubber(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,16511)-.5)*.3,['#14141a','#1c1c22','#24242a'],.1);if(y%32<4)c='#c8a020';P.set(x,y,c)}})}
function texSlGrid(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c='#16181e';if(x%8<1||y%8<1)c='#6a7078';if(x%32<2||y%32<2)c='#2a2e36';P.set(x,y,c)}})}
function texSlTower(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.6+(P.n(x,y,16,16521,2)-.5)*.2,['#a8acb4','#b4b8c0','#c0c4cc'],.05);const lx=x%32,ly=y%64;
    if(Math.abs(lx-ly/2)<1.4||Math.abs(lx-(32-ly/2))<1.4||lx<2||ly<2)c='#7a8088';P.set(x,y,c)}})}
function texSlLed(){return paint(16,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<16;x++){const k=Math.floor(y/16);P.set(x,y,['#40e8ff','#ff50b8','#b070ff','#50ffa0'][k])}})}
function texSlHedge(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,,id]=cellN(P,x,y,5,16531);let c=mix(rpickH(id,['#1e3a1a','#24421e','#2a4a22','#305226']),'#0c1a0c',clamp(f1/4.5,0,1)*.65);
    if(hash2(id,2,16532)<.06&&f1<1.6)c='#5a7a3a';P.set(x,y,c)}})}
function texSlBark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,8,16541,2)-.5)*.4,['#221a16','#2c221c','#362a22'],.1);if(y%9<1&&hash2(x>>2,y,16542)<.6)c='#46382e';P.set(x,y,c)}})}
function texSlLeaf(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,,id]=cellN(P,x,y,6,16551);let c=f1<3?rpickH(id,['#2a4a24','#32562a','#3a6030','#426a36']):mix('#1a3018','#10200e',clamp((f1-3)/3,0,1));
    if(f1<1)c='#5a8048';P.set(x,y,c)}})}
function slCont(col){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.sin(x/128*TAU*12)*.5+.5;let c=mix(dk(col,.25),col,r);if(P.n(x,y,24,16561,3)>.7)c=mix(c,'#6a4a32',.4);if(y<4||y>123)c=dk(col,.4);P.set(x,y,c)}})}
function texSlShip(){return paint(128,128,P=>{for(let y=0;y<128;y++){const b=Math.floor(y/16),ry=y%16;for(let x=0;x<128;x++){let c=dith(P,x,y,.5+Math.sin(x*.2+P.n(x,y,14,16571+b,2)*5)*.15,['#4a2a16','#56321c','#623a22'],.08);
    if(ry===0)c='#20120a';if(b===2||b===5)c=ry<3||ry>12?'#c89838':mix('#8a1a2a','#a82434',Math.sin(x*.3)*.5+.5);P.set(x,y,c)}}})}
function texSlBench(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+Math.sin(x*.3)*.12+(hash2(Math.floor(y/12),1,16581)-.5)*.2,['#5a3a22','#66442a','#724e32'],.08);if(y%12<2)c='#1a120c';P.set(x,y,c)}})}
function texSlBin(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=mix('#1e4a3a','#2a6a52',Math.sin(x/64*TAU*4)*.5+.5);if(y<10)c='#1a1c20';if(y>50&&y<70&&x>20&&x<44)c='#e8e4d8';P.set(x,y,c)}})}
// the souvenir shop's shelves: plush bears, rabbits and stars in rows (all the park's own), the candy house's jars
function texSlPlush(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const sh=Math.floor(y/32),ly=y%32,cx=x%24,id=Math.floor(x/24)*7+sh*3;let c=ly>28?'#5a3a22':'#1e1614';
    const col=rpickH(id,['#d8a070','#f0e8e0','#e890b0','#90c0e8','#f0d060','#a8d890']),d=Math.hypot(cx-12,ly-20),hd=Math.hypot(cx-12,ly-10);
    if(d<8||hd<6)c=col;if(hd<6&&ly>8&&ly<11&&(Math.abs(cx-9.5)<1||Math.abs(cx-14.5)<1))c='#141414';if(Math.hypot(cx-7,ly-5)<2.4||Math.hypot(cx-17,ly-5)<2.4)c=col;P.set(x,y,c)}})}
function texSlCandy(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const sh=Math.floor(y/32),ly=y%32,cx=x%21,id=Math.floor(x/21)*5+sh*11;let c=ly>28?'#e8e0d0':'#2a1e2a';
    if(cx>2&&cx<18&&ly>6&&ly<28){c=mix('#c8d8e0','#e8f0f4',.3);const [f1,,cid]=cellN(P,x,y,4,16591+id);if(ly>12&&f1<1.8)c=rpickH(cid,['#e83a5a','#f0c040','#40b0e8','#90e060','#f08ae0','#ffffff'])}
    if(cx>4&&cx<16&&ly>3&&ly<7)c='#d04050';P.set(x,y,c)}})}
// a neon sign: the letters bent from coloured tube (a stroke, not a fill) round a white-hot core, a soft glow, on a dark board
function slNeon(t,sub,c1,c2,w,h,o){o=o||{};return paint(w,h,P=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=mix('#0c0a14','#14101c',y/h);if(x<3||x>w-4||y<3||y>h-4)c=o.frame||'#3a2a4a';P.set(x,y,c)}
  // (each line as big as its board lets it be: scaled down to fit the width; the glow kept short, so the letters read through the bloom)
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
    const F=(txt,y,sz,col,mw)=>{x.font='bold '+sz+'px '+SL_FONT;const tw=x.measureText(txt).width;if(tw>mw){sz=Math.max(8,Math.floor(sz*mw/tw));x.font='bold '+sz+'px '+SL_FONT}
      x.shadowColor=col;x.shadowBlur=Math.max(2,sz*.16);x.fillStyle=col;x.fillText(txt,w/2,y);x.shadowBlur=0;x.globalAlpha=.5;x.fillStyle='#ffffff';x.fillText(txt,w/2,y);x.globalAlpha=1;
      x.lineWidth=Math.max(1,sz*.045);x.strokeStyle=dk(col,.3);x.strokeText(txt,w/2,y)};
    if(sub){F(t,h*.4,Math.round(h*.52),c1,w*.86);F(sub,h*.8,Math.round(h*.21),c2,w*.8)}else F(t,h*.53,Math.round(h*.66),c1,w*.88)}})}
function slMenu(items,col){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=mix('#101018','#1a1824',y/128);if(x<4||x>251||y<4||y>123)c='#5a4a2a';P.set(x,y,c)}
  P.post=x=>{x.textBaseline='middle';x.font='bold 30px '+SL_FONT;x.textAlign='center';x.shadowColor=col;x.shadowBlur=12;x.fillStyle=col;x.fillText(items[0],128,30);x.shadowBlur=0;
    x.font='17px '+SL_FONT;x.fillStyle='#f0ead8';for(let i=1;i<items.length;i++){x.textAlign='left';x.fillText(items[i][0],22,52+i*20);x.textAlign='right';x.fillText(items[i][1],234,52+i*20)}}})}
function texSlKitchen(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=mix('#8a9096','#b8bcc0',Math.sin(y*.3)*.5+.5);if(y%42<3)c='#5a6066';if(y>84&&y<120&&x>10&&x<54)c='#2a2a2e';if(y>20&&y<40&&x%24<14)c=rpickH(Math.floor(x/24),['#c84a3a','#e8c060','#f0f0e8','#6aa05a']);P.set(x,y,c)}})}
function slCounterF(col){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=Math.floor(x/16)%2?col:lt(col,.35);if(y<8)c='#e8e0d0';if(y>56)c='#2a2420';P.set(x,y,c)}})}
// the game booths' back walls: balloons to burst, tin ducks and targets, bottles for the rings, prizes in the claw machines
function texSlPrize0(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c='#2a2a3a';if((x%8<1)||(y%8<1))c='#4a4a5a';const cx=x%16,cy=y%16,id=Math.floor(x/16)*5+Math.floor(y/16);
    if(Math.hypot(cx-8,(cy-7)*.85)<6)c=rpickH(id,['#e83a4a','#3a8ae8','#f0c030','#40c060','#e060c0']);if(Math.hypot(cx-6,cy-5)<1.5)c='#fff';P.set(x,y,c)}})}
function texSlPrize1(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=mix('#1a3a5a','#102a44',y/64);const cx=x%32;
    if(y>34&&y<44&&Math.hypot(cx-16,(y-36)*1.6)<9)c='#f0c030';if(y>26&&y<36&&Math.hypot(cx-22,y-31)<4)c='#f0c030';if(Math.hypot(cx-23,y-30)<1)c='#111';
    const d=Math.hypot((x%32)-16,(y-14));if(y<26&&d<9)c=d<3?'#e83a3a':d<6?'#f0ece0':'#e83a3a';if(y>48)c=y%4<2?'#c84a2a':'#e8b040';P.set(x,y,c)}})}
function texSlPrize2(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c='#2a1e14';const cx=x%12;if((y>18&&y<20)||(y>40&&y<42))c='#8a6a40';
    for(const [y0,y1] of [[4,18],[26,40],[48,62]])if(y>y0&&y<y1&&cx>3&&cx<9&&!(y<y0+5&&(cx<5||cx>7)))c=rpickH(Math.floor(x/12)+y0,['#2a7a4a','#7a4a1a','#c8d8d0','#3a5a9a']);P.set(x,y,c)}})}
function texSlPrize3(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c='#3a1a3a';const [f1,,id]=cellN(P,x,y,10,16601);if(f1<5)c=rpickH(id,['#e8a0c0','#a0d0f0','#f0e090','#c0f0b0','#f0f0f0']);if(f1<1.2)c='#141414';P.set(x,y,c)}})}
function texSlClaw(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c='#e83a8a';if(y<8)c='#ffd040';if(y>8&&y<70&&x>5&&x<59){c=mix('#1a2a3a','#2a3a4a',y/70);const [f1,,id]=cellN(P,x,y,8,16611);if(y>50&&f1<3.6)c=rpickH(id,['#e8a0c0','#a0d0f0','#f0e090','#f0f0f0'])}
    if(y>8&&y<22&&Math.abs(x-32)<1.5)c='#c8c8c8';if(y>80&&y<100&&x>20&&x<44)c='#141414';P.set(x,y,c)}})}
function texSlCart(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=Math.floor(x/16)%2?'#c82a2a':'#f0ece0';if(y<10||y>54)c='#c8a040';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffe060';x.strokeStyle='#5a1010';x.lineWidth=4;x.font='bold 22px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';x.strokeText('팝콘 · 솜사탕',64,32);x.fillText('팝콘 · 솜사탕',64,32)}})}
function texSlBus(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=mix('#e8e4dc','#c8c4bc',y/64);if(y>14&&y<34&&x>8&&x<248&&(x-8)%30<26)c=mix('#1a2230','#3a4a5a',(y-14)/20);if(y>40&&y<46)c='#6a3ab0';if(y>56)c='#1a1a1e';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#4a2a8a';x.font='bold 11px '+SL_FONT;x.textAlign='left';x.textBaseline='middle';x.fillText('별빛투어 · STARLIGHT TOUR',12,51)}})}
// the clock on the castle's spire: stars for numbers, its hands at nearly midnight
function texSlClockC(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-31.5,y-31.5);let c=r>30?'#2a2238':r>27?'#c8a040':'#1c2050';if(r<27){const a=Math.atan2(y-31.5,x-31.5),m=Math.abs(((a/TAU*12)%1+1)%1-.5);if(m>.44&&r>20)c='#f8e8a0'}P.set(x,y,c)}
  P.post=x=>{x.strokeStyle='#f8e8a0';x.lineWidth=3;x.beginPath();x.moveTo(32,32);x.lineTo(32+Math.cos(-1.62)*15,32+Math.sin(-1.62)*15);x.stroke();x.lineWidth=2;x.beginPath();x.moveTo(32,32);x.lineTo(32+Math.cos(-1.75)*22,32+Math.sin(-1.75)*22);x.stroke()}})}
function texSlClockG(){return paint(32,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<32;x++){let c=mix('#2a160c','#3a2014',Math.sin(y*.2)*.5+.5);const r=Math.hypot(x-16,y-22);if(r<11)c=r>9?'#a08030':'#d8ccb0';if(y>50&&y<100&&x>8&&x<24)c='#120a06';
    if(y>80&&y<94&&Math.hypot(x-16,y-87)<5)c='#c8a040';P.set(x,y,c)}})}
function texSlBooksH(){return paint(128,128,P=>{for(let y=0;y<128;y++){const sh=Math.floor(y/32),ly=y%32;let x=0,k=0;while(x<128){const w=3+Math.floor(hash2(k,sh,16621)*5),col=rpickH(k*7+sh*13,['#3a1a14','#1a2a3a','#2a3a22','#4a3a1a','#2a2a2a']),hh=18+Math.floor(hash2(k,sh+5,16622)*10);
      for(let i=0;i<w&&x<128;i++,x++){let c=ly>=30?'#2a1a0e':ly<30-hh?'#0e0a06':i===0?dk(col,.3):col;if(P.n(x,y,12,16623,2)>.72)c=mix(c,'#8a8070',.45);P.set(x,y,c)}k++}}})}
function texSlCase(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#1a1a24','#2a2a3a',y/64);if(y>40)c='#3a2a1a';const d=Math.hypot(x-32,y-30);if(d<10&&y<36&&(y>26||Math.abs((x-22)%7-3)<2))c='#f0c840';if(Math.hypot(x-32,y-28)<2)c='#e83a5a';
    if(x<3||x>60||y<3||y>60)c='#c8a040';P.set(x,y,c)}})}
function texSlLocker(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%32,ly=y%32;let c=mix('#2a8ac8','#3a9ad8',hash2(Math.floor(x/32),Math.floor(y/32),16631)*.5);if(lx<1||ly<1)c='#1a4a6a';if(lx>22&&lx<26&&ly>12&&ly<20)c='#e8e8e0';P.set(x,y,c)}})}
function texSlPhoto(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=mix('#c83a6a','#e85a8a',Math.sin(x*.4)*.5+.5);if(y<24)c='#1a1a22';if(y<24&&y>6&&x>8&&x<56)c='#e8e0f0';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ff4a8a';x.font='bold 12px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('인생네컷',32,15)}})}
function texSlPost(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c='#3a2416';if(y%32>4&&y%32<28)c=['#e8d8b0','#c8e0f0','#f0c8d8','#d8f0c0'][Math.floor(y/32)];P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#2a1a10';x.font='bold 12px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';['◀ 유령의 집','성 ▲','관람차 ▶','정문 ▼'].forEach((t,i)=>x.fillText(t,32,16+i*32))}})}
function texSlSaddle(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=(x+y)%16<8?'#a01830':'#2a3a9a';if(y<3||y>28)c='#d8b040';P.set(x,y,c)}})}
function texSlMap(){return paint(256,192,P=>{for(let y=0;y<192;y++)for(let x=0;x<256;x++){let c=mix('#e8dcc0','#d8ccb0',P.n(x,y,40,16641,3));if(x<6||x>249||y<6||y>185)c='#5a3a1e';P.set(x,y,c)}
  P.post=x=>{const R=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h)};R(110,30,36,28,'#e8a0b0');R(30,28,60,22,'#7a5aa8');R(170,22,48,40,'#5a9ad8');R(22,70,46,48,'#3a3a4a');R(184,74,44,26,'#e0b040');
    R(112,82,32,32,'#e86a5a');R(30,132,44,30,'#e89040');R(186,118,28,28,'#4ad0e0');R(90,124,24,40,'#c8a070');R(142,124,24,40,'#f080b0');R(108,168,40,10,'#5a3a1e');
    x.fillStyle='#2a1a10';x.font='bold 15px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('별빛랜드 안내도',128,16);x.font='9px '+SL_FONT;
    for(const [t,a,b] of [['성',128,44],['코스터',60,39],['관람차',194,42],['유령의 집',45,94],['범퍼카',206,87],['회전목마',128,98],['푸드코트',52,147],['드롭',200,132],['정문',128,173]])x.fillText(t,a,b);
    x.fillStyle='#d02030';x.beginPath();x.arc(128,150,4,0,TAU);x.fill();x.fillStyle='#2a1a10';x.fillText('현재 위치',128,160)}})}
function texSlHill(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,6,16651);P.set(x,y,f1<3?rpickH(id,['#141e16','#18241a','#1c281c','#202a20']):'#0c120c')}})}
function texSlHouse(){const N=256,FH=N/6,UW=N/4;return paint(N,N,P=>{for(let y=0;y<N;y++){const yy=N-1-y,st=Math.floor(yy/FH),ly=yy-st*FH;for(let x=0;x<N;x++){const u=Math.floor(x/UW),lx=x-u*UW,id=st*7+u*13;
    let c=dith(P,x,y,.5+(P.n(x,y,40,16661,3)-.5)*.2,['#1a1a24','#20202a','#262630'],.04);if(lx>6&&lx<UW-6&&ly>12&&ly<34){const l=hash2(id,1,16662);c=l<.3?mix('#ffc870','#ffa850',hash2(id,2,16663)):l<.4?'#c8d8f0':'#101218'}P.set(x,y,c)}}})}
function texSlSignWork(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=(Math.floor((x+y)/16)%2)?'#e8c020':'#1a1a1a';if(y>8&&y<56&&x>8&&x<248)c='#f0ece0';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a1a1a';x.font='bold 24px '+SL_FONT;x.textAlign='center';x.textBaseline='middle';x.fillText('관계자 외 출입금지',128,33)}})}
function texSlExit(){return paint(160,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<160;x++){let c='#1a9a4a';if(x<4||x>155||y<4||y>59)c='#0e5a2a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#f4fff4';x.textAlign='center';x.textBaseline='middle';x.font='bold 26px '+SL_FONT;x.fillText('출구 EXIT',90,33);x.fillRect(16,18,10,26);x.fillRect(26,26,12,6)}})}
function texSlTicket(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=mix('#e8d8c0','#d8c8b0',P.n(x,y,30,16671,2));if(y>40&&y<108&&x>20&&x<236)c=mix('#3a2a20','#6a4a30',(y-40)/68);
    if(y>40&&y<108&&(x===128||x===127))c='#c8b8a0';if(y>98&&y<108&&x>20&&x<236)c='#c8a040';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 22px '+SL_FONT;x.fillStyle='#8a2a4a';x.fillText('매 표 소   TICKETS',128,20);x.font='12px '+SL_FONT;x.fillStyle='#f8e8c8';
    x.fillText('자유이용권 대인 39,000',74,62);x.fillText('소인 31,000',74,80);x.fillText('야간권 (17시~) 25,000',182,62);x.fillText('오늘 운영 종료',182,80)}})}
// the souvenir corner in the castle hall, the stall counters' fronts and the photo shop's booth are painted above; the rest:
function texSlSkirt(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=mix('#6a1a3a','#8a2a4a',y/64);const lx=x%32;if(lx<2||y<4||y>59)c='#d0a040';
    if(Math.hypot(lx-16,y-32)<10)c=mix('#c8d8e8','#8aa0c0',(y-22)/20);if(Math.abs(Math.hypot(lx-16,y-32)-10)<1.2)c='#d0a040';P.set(x,y,c)}})}
function texSlCanopy(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=Math.floor(x/16)%2?'#e8e0d0':'#b8202e';c=mix(c,'#000',P.n(x,y,24,16681,2)*.12);if(y>58)c='#d0a040';P.set(x,y,c)}})}
function texSlValance(){return paint(256,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<256;x++){const lx=x%16;let c=y<20||Math.hypot(lx-8,y-20)<8?'#8a1a2a':null;if(y<4)c='#d0a040';const d=Math.hypot(lx-8,y-11);
    if(d<3.4)c=d<1.8?'#fffae8':'#ffd070';if(c)P.set(x,y,c);else P.alpha(x,y,0)}})}
function texSlMirror(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%32,ly=y%64;let c=mix('#5a7890','#a8c0d4',(lx+ly*.3)/40);if((lx+ly)%28<2)c='#e8f0f8';
    if(lx<3||ly<3)c='#c89838';if(Math.hypot(lx-1.5,ly-1.5)<3)c='#fff4d0';P.set(x,y,c)}})}
function texSlDeck(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+Math.sin(x*.4+P.n(x,y,10,16691,2)*4)*.15,['#5a3a1e','#664424','#724e2c'],.08);if(y%16<1)c='#2a1a0c';P.set(x,y,c)}})}
function texSlHorse(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const [f1]=cellN(P,x,y,10,16701);let c=mix('#f0ece4','#d8d0c4',P.n(x,y,16,16702,2));if(f1<2.4)c='#c8c0b4';P.set(x,y,c)}})}
function texSlBrass(){return paint(16,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<16;x++){const b=Math.sin(x*.8)*.5+.5;let c=mix('#8a6418','#f0d880',b*b);if(Math.floor(y/8)%2)c=mix(c,'#fff',.12);P.set(x,y,c)}})}
// the bulbs: little squares of colour to pick from (warm white, rose, cyan, gold, violet, green, orange, red)
function texSlBulb(){return paint(32,4,P=>{const C=['#fff2d0','#ff6ab8','#5ae0ff','#ffd04a','#b07aff','#6aff9a','#ff9a40','#ff4a4a'];for(let y=0;y<4;y++)for(let x=0;x<32;x++)P.set(x,y,C[x>>2])})}
function texSlWire(){return paint(8,8,P=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++)P.set(x,y,'#141416')})}
function texSlBalloon(){return paint(32,4,P=>{const C=['#e83a4a','#3a8ae8','#f0c030','#40c060','#e060c0','#ff8a30','#f0f0f0','#8a5ae8'];for(let y=0;y<4;y++)for(let x=0;x<32;x++)P.set(x,y,C[x>>2])})}
function bakeParkTex(){if(TEX.slPave)return;
  TEX.slSky=mkTex(texSlSky());TEX.slSky.wrapT=THREE.ClampToEdgeWrapping;TEX.slSky.magFilter=THREE.LinearFilter;
  for(const [k,f] of [['slPave',texSlPave],['slBrick',texSlBrick],['slGrass',texSlGrass],['slFlower',texSlFlower],['slAsph',texSlAsph],['slWater',texSlWater],['slPlate',texSlPlate],['slStoneW',texSlStoneW],
      ['slWood',texSlWood],['slCastle',texSlCastle],['slCastleIn',texSlCastleIn],['slCastleD',texSlCastleD],['slRoofB',texSlRoofB],['slGold',texSlGold],['slHaunt',texSlHaunt],['slHauntIn',texSlHauntIn],
      ['slFenceI',texSlFenceI],['slBrickW',texSlBrickW],['slConc',texSlConc],['slSteel',texSlSteel],['slSteelW',texSlSteelW],['slRail',texSlRail],['slPlank',texSlPlank],['slRoofM',texSlRoofM],
      ['slFascia',texSlFascia],['slCandyP',texSlCandyP],['slCarpet',texSlCarpet],['slStoneF',texSlStoneF],['slTileF',texSlTileF],['slOak',texSlOak],['slWoodF',texSlWoodF],['slCeilP',texSlCeilP],['slCeilH',texSlCeilH],
      ['slCeilC',texSlCeilC],['slSeat',texSlSeat],['slGondola',texSlGondola],['slRubber',texSlRubber],['slGrid',texSlGrid],['slTower',texSlTower],['slLed',texSlLed],['slHedge',texSlHedge],
      ['slBark',texSlBark],['slLeaf',texSlLeaf],['slShip',texSlShip],['slBench',texSlBench],['slBin',texSlBin],['slPlush',texSlPlush],['slCandy',texSlCandy],['slBooksH',texSlBooksH],['slLocker',texSlLocker],
      ['slSaddle',texSlSaddle],['slHill',texSlHill],['slHouse',texSlHouse],['slSkirt',texSlSkirt],['slCanopy',texSlCanopy],['slMirror',texSlMirror],['slDeck',texSlDeck],['slHorse',texSlHorse],
      ['slBrass',texSlBrass],['slBulb',texSlBulb],['slWire',texSlWire],['slBalloon',texSlBalloon],['slValance',texSlValance]])TEX[k]=mkTex(f());
  TEX.slStucco=mkTex(slStucco(['#c8b8a0','#d2c2aa','#dccab4'],16711));TEX.slStuccoP=mkTex(slStucco(['#c89aa4','#d2a6ae','#dcb2b8'],16721));TEX.slStuccoB=mkTex(slStucco(['#9abcb0','#a6c8bc','#b2d2c6'],16731));
  TEX.slAwning=mkTex(slStripes('#e8e0d0','#b8202e',4,16741));TEX.slAwningB=mkTex(slStripes('#e8e0d0','#2a4ab0',4,16751));TEX.slTentY=mkTex(slStripes('#f0c030','#c82a2a',4,16761));
  TEX.slCont=mkTex(slCont('#2a7a7a'));TEX.slContB=mkTex(slCont('#8a3a2a'));
  for(const [k,f] of [['slBoard',texSlBoard],['slGlass',texSlGlass],['slGlassG',texSlGlassG],['slStar',texSlStar],['slLamp',texSlLamp],['slStain',texSlStain],['slBanner',texSlBanner],['slThrone',texSlThrone],
      ['slArmor',texSlArmor],['slCobweb',texSlCobweb],['slPortrait',texSlPortrait],['slMirrorH',texSlMirrorH],['slCoffin',texSlCoffin],['slGrave',texSlGrave],['slTrain',texSlTrain],['slPrize0',texSlPrize0],
      ['slPrize1',texSlPrize1],['slPrize2',texSlPrize2],['slPrize3',texSlPrize3],['slClaw',texSlClaw],['slCart',texSlCart],['slBus',texSlBus],['slClockC',texSlClockC],['slClockG',texSlClockG],
      ['slCase',texSlCase],['slPhoto',texSlPhoto],['slPost',texSlPost],['slMap',texSlMap],['slKitchen',texSlKitchen],['slTicket',texSlTicket],['slSignWork',texSlSignWork],['slSignExit',texSlExit]])TEX[k]=mkTex(f(),false);
  TEX.slBumpR=mkTex(slBump('#d02a3a',7),false);TEX.slBumpB=mkTex(slBump('#2a5ad0',3),false);TEX.slBumpY=mkTex(slBump('#e8b020',12),false);TEX.slBumpG=mkTex(slBump('#2aa05a',9),false);
  TEX.slCounterF=mkTex(slCounterF('#d05a3a'),false);
  for(const [k,it,col] of [['slMenu0',['떡볶이',['떡볶이','4,500'],['순대','5,000'],['어묵','3,000']],'#ff6a4a'],['slMenu1',['핫도그',['모짜 핫도그','4,000'],['감자 핫도그','4,500'],['콜라','2,000']],'#ffd04a'],
      ['slMenu2',['츄러스',['시나몬 츄러스','4,000'],['초코 츄러스','4,500'],['아이스티','3,000']],'#ff8ad8'],['slMenu3',['솜사탕',['솜사탕','3,500'],['슬러시','3,500'],['팝콘','5,000']],'#6ae0ff']])TEX[k]=mkTex(slMenu(it,col),false);
  for(const [k,t,s,c1,c2,w,h] of [['slSignGate','별빛랜드','STARLIGHT LAND','#ff6ac8','#6ae8ff',512,122],['slSignCoaster','은하 익스프레스','GALAXY EXPRESS','#6ae8ff','#ffd04a',640,90],
      ['slSignHaunt','유령의 집','HAUNTED MANSION','#7aff6a','#c08aff',384,106],['slSignBump','범퍼카','BUMPER CARS','#ffd04a','#ff6ac8',320,96],['slSignFerris','별빛 관람차','STAR WHEEL','#ff9ad8','#6ae8ff',256,116],
      ['slSignFood','푸드코트','FOOD COURT','#ff9a4a','#ffe0a0',384,96],['slSignShop1','기념품 가게','SOUVENIRS','#ffd04a','#ff9ad8',384,100],['slSignShop2','캔디 하우스','CANDY & ICE CREAM','#ff6ac8','#8af0ff',384,100],
      ['slSignInfo','안내소','INFORMATION','#8af0ff','#ffffff',224,64],['slSignPhoto','포토 스튜디오','PHOTO STUDIO','#ff9ad8','#ffffff',320,64],['slSignDrop','스카이 드롭','SKY DROP','#8af0ff','#ff6ac8',320,64],
      ['slSignViking','바이킹','PIRATE SHIP','#ffb04a','#ff6a6a',256,80],['slSignCastle','별빛 성','STARLIGHT CASTLE','#ffe08a','#c8a0ff',256,58],
      ['slSignGame0','풍선 다트','',  '#ff6a8a','',320,54],['slSignGame1','사격장','','#ffd04a','',320,54],['slSignGame2','링 던지기','','#6ae8ff','',320,54],['slSignGame3','인형 뽑기','','#ff9ad8','',320,54]])
    TEX[k]=mkTex(slNeon(t,s,c1,c2,w,h),false);
  TEX.slPine=mkTex(texDrPine());
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['slPave','slBrick','slAsph','slGrass','slStoneF','slTileF','slPlate'])TEX[k].anisotropy=an}

// ---------- the map ----------
// (x east, z south. The park inside its fence x -58..58, z -56 (the backstage wall) .. 40 (the gate's line); the plaza outside the gate
// z 40..50. Main street x -8..8, z 8..28; the central plaza round the carousel at (0,-5); the castle x -15.5..15.5, z -41.5..-24.5)
const SLD={trees:[],pines:[],bars:[],strings:[],balloons:null,acc:0,mbox:6,drip:0};
function buildPark(){const CV={nosolid:true},PS={pass:1},G={ground:1},X='slX';SLD.trees=[];SLD.pines=[];SLD.bars=[];SLD.strings=[];SLD.acc=0;
  const {bar,tst,hrail,rail}=stairKit(SLD.bars,'slSteel');
  // ---- little helpers ----
  const lampP=(x,z,h,col,r,k)=>{h=h||3.6;B(x-.2,0,z-.2,x+.2,.35,z+.2,'slSteel');B(x-.07,.35,z-.07,x+.07,h,z+.07,'slSteel');B(x-.2,h,z-.2,x+.2,h+.5,z+.2,'slLamp',CV);B(x-.27,h+.5,z-.27,x+.27,h+.62,z+.27,'slSteel',CV);
    if(r!==0)LIGHT(x,h+.2,z,col||'#ffd8a0',r||9,k==null?.55:k)};
  const bench=(x,z,ax)=>{if(ax==='x'){B(x-.8,.42,z-.22,x+.8,.48,z+.22,'slBench');B(x-.8,.48,z+.18,x+.8,.9,z+.24,'slBench',CV);for(const dx of [-.7,.7])B(x+dx-.04,0,z-.2,x+dx+.04,.42,z+.2,'slSteel',CV)}
    else{B(x-.22,.42,z-.8,x+.22,.48,z+.8,'slBench');B(x+.18,.48,z-.8,x+.24,.9,z+.8,'slBench',CV);for(const dz of [-.7,.7])B(x-.2,0,z+dz-.04,x+.2,.42,z+dz+.04,'slSteel',CV)}};
  const planter=(x0,z0,x1,z1,h)=>B(x0,0,z0,x1,h||.42,z1,'slStoneW',{f:{py:'slFlower'}});
  const tree=(x,z,s)=>{s=s||1;SLD.trees.push([x,0,z,s]);B(x-.17*s,0,z-.17*s,x+.17*s,3*s,z+.17*s,X)};
  const pine=(x,z,s)=>{s=s||1;SLD.pines.push([x,0,z,s]);B(x-.15*s,0,z-.15*s,x+.15*s,3*s,z+.15*s,X)};
  const bin=(x,z)=>B(x-.25,0,z-.25,x+.25,.9,z+.25,'slBin');
  const str=(x0,y0,z0,x1,y1,z1,sag,c)=>SLD.strings.push([x0,y0,z0,x1,y1,z1,sag||.6,c==null?-1:c]);
  const pane=(x0,x1,z,y0,y1,n,m)=>{const w=(x1-x0)/n;for(let i=0;i<n;i++)B(x0+w*i,y0,z-.03,x0+w*(i+1),y1,z+.03,m||'slGlass',PS)};
  const paneZ=(z0,z1,x,y0,y1,n,m)=>{const w=(z1-z0)/n;for(let i=0;i<n;i++)B(x-.03,y0,z0+w*i,x+.03,y1,z0+w*(i+1),m||'slGlass',PS)};
  // a ring of boxes standing in for a round wall (the fountain's rim); a disc of strips for a round floor (the carousel's)
  const ring=(cx,cz,r0,r1,y0,y1,n,m)=>{for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,xs=[],zs=[];for(const a of [a0,(a0+a1)/2,a1])for(const r of [r0,r1]){xs.push(cx+Math.cos(a)*r);zs.push(cz+Math.sin(a)*r)}
    B(Math.min(...xs),y0,Math.min(...zs),Math.max(...xs),y1,Math.max(...zs),m||X)}};
  const disc=(cx,cz,r,y0,y1,m,o)=>{for(let x=-r;x<r-.01;x+=1){const xm=Math.min(r,x+.5),h=Math.sqrt(Math.max(0,r*r-xm*xm*.98));B(cx+x,y0,cz-h,cx+Math.min(r,x+1),y1,cz+h,m||X,o)}};
  // ================= the ground =================
  B(-58.4,-1,-56.4,58.4,0,-50,'slAsph',G);B(-58.4,-1,-50,58.4,0,40.4,'slPave',G);B(-30,-1,40.4,30,0,50,'slPave',G);
  B(-8,-.01,8,8,.01,28,'slBrick',CV);B(-15.5,-.01,-24.5,15.5,.01,-13,'slBrick',CV);// (paving laid over the paths: looks, not floors)
  // ================= the fence: the backstage wall (north), the iron fence on its plinth round the rest, piers with lanterns =================
  B(-58.4,0,-56.4,58.4,4.2,-56,'slConc');B(-58.4,4.2,-56.5,58.4,4.4,-55.9,'slConc',CV);
  const fenceRun=(x0,z0,x1,z1)=>{const ax=Math.abs(x1-x0)>Math.abs(z1-z0),L=ax?Math.abs(x1-x0):Math.abs(z1-z0),n=Math.max(1,Math.round(L/6));
    if(ax){B(Math.min(x0,x1),0,z0-.2,Math.max(x0,x1),.5,z0+.2,'slBrickW');B(Math.min(x0,x1),.5,z0-.02,Math.max(x0,x1),2.4,z0+.02,'slFenceI',PS)}
    else{B(x0-.2,0,Math.min(z0,z1),x0+.2,.5,Math.max(z0,z1),'slBrickW');B(x0-.02,.5,Math.min(z0,z1),x0+.02,2.4,Math.max(z0,z1),'slFenceI',PS)}
    for(let i=0;i<=n;i++){const x=ax?x0+(x1-x0)*i/n:x0,z=ax?z0:z0+(z1-z0)*i/n;B(x-.35,0,z-.35,x+.35,2.8,z+.35,'slBrickW');B(x-.42,2.8,z-.42,x+.42,2.95,z+.42,'slConc',CV);
      if(i%2===0){B(x-.16,2.95,z-.16,x+.16,3.4,z+.16,'slLamp',CV);B(x-.2,3.4,z-.2,x+.2,3.5,z+.2,'slSteel',CV)}}};
  fenceRun(-58,-56,-58,40);fenceRun(58,-56,58,40);fenceRun(-58,40,-16,40);fenceRun(16,40,58,40);
  // the outside plaza: hedges each side, a low wall along the road
  B(-30.8,0,40.4,-30,1.5,50,'slHedge');B(30,0,40.4,30.8,1.5,50,'slHedge');B(-30.8,0,50,30.8,1,50.4,'slStoneW');
  // ================= the gate: the ticket booths and their lanes, the canopy, the neon arch on its candy-striped pillars =================
  for(const [x0,x1] of [[-14,-8],[-6,-2],[2,6],[8,14]]){B(x0,0,39.6,x1,3.2,42.4,'slStucco',{f:{pz:'slTicket'}});B(x0-.05,3.2,39.55,x1+.05,3.5,42.45,'slGold',CV)}
  B(-14.4,3.5,39.2,14.4,3.8,42.8,'slConc',{f:{ny:'slCeilP',py:'slRoofM'}});
  for(const x of [-8,-6,-2,2,6,8])for(const z of [39.8,42.2])B(x-.05,0,z-.05,x+.05,1,z+.05,'slSteel',CV);
  for(const sx of [-1,1]){const x0=sx<0?-16:14;B(x0,0,39.9,x0+2,11.6,42.1,'slCandyP');B(x0-.2,11.6,39.7,x0+2.2,11.9,42.3,'slGold');B(x0+.5,11.9,40.5,x0+1.5,12.8,41.5,'slLamp',CV)}
  B(-14,9,40.4,14,11.6,41.6,'slSteel',{f:{pz:'slFascia',nz:'slFascia'}});B(-5,9.1,40.39,5,11.5,41.61,'slSignGate',CV);B(-1.8,11.6,40.92,1.8,14.8,41.08,'slStar',CV);
  LIGHT(0,8.6,44,'#ff5ab4',13,.6);LIGHT(0,8.6,38,'#5ac8ff',13,.5);for(const x of [-10,0,10])LIGHT(x,3.1,41,'#ffe2b8',6.5,.5);
  MAP.dyn.push([0,10.2,43.2,'#ff6ac8',9,.35,.25]);
  // the plaza outside: the tour bus, a bus stop, planters, lamps
  B(-27,0,46.4,-16,3.2,48.9,'slBus',{f:{py:'slRoofM',px:'slSteelW',nx:'slSteelW'}});for(const x of [-25.5,-17.6])B(x-.6,0,46.3,x+.6,.9,49,'slSteel',CV);
  {B(16,0,48.4,22,.1,49.6,'slConc');for(const x of [16.2,21.8])B(x-.06,0,48.5,x+.06,2.6,48.62,'slSteel');B(15.8,2.6,47.6,22.2,2.75,49.8,'slGlassG',{f:{py:'slSteel',ny:'slSteel'}});B(16.2,0,49.4,21.8,2.4,49.46,'slGlassG',PS);bench(19,48.9,'x')}
  for(const x of [-24,-10,10,24])lampP(x,44.5,3.6,null,8,.5);planter(-12,45,-6,46.4);planter(6,45,12,46.4);
  // ================= inside the gate: the fountain, the information office (west), the photo studio (east) =================
  {const cx=0,cz=32;ring(cx,cz,3.8,4.25,0,.5,24);B(cx-.65,0,cz-.65,cx+.65,2.7,cz+.65,X);B(cx-1.45,1.05,cz-1.45,cx+1.45,1.35,cz+1.45,X)}
  {const x0=-30,x1=-18,z0=30,z1=39.6,H=3.8,T=.25,W='slStuccoB';
    wallZ(x1-T,x1,z0,z1,0,H,W,[[33,35.6,0,2.6],[30.8,32.4,.9,2.4],[36.4,38.6,.9,2.4]]);wallZ(x0,x0+T,z0,z1,0,H,W,[]);wallX(x0,x1,z0,z0+T,0,H,W,[[-28,-24,.9,2.4]]);wallX(x0,x1,z1-T,z1,0,H,W,[]);
    paneZ(30.8,32.4,x1-T/2,.9,2.4,1);paneZ(36.4,38.6,x1-T/2,.9,2.4,1);pane(-28,-24,z0+T/2,.9,2.4,2);B(x0,-.01,z0,x1,.01,z1,'slOak',CV);B(x0-.1,H,z0-.1,x1+.1,H+.3,z1+.1,'slConc',{f:{ny:'slCeilP'}});
    B(x1,2.85,33.3,x1+.01,3.7,36.3,'slSignInfo',CV);B(-25,0,31.2,-20.2,1.05,32,'slWood',{f:{py:'slWood'}});B(-29.75,0,33,-29.2,2.2,38.6,'slLocker');B(-23,0,37.8,-19,2,39.35,'slLocker');
    B(-28.6,0,30.4,-26.6,1.6,30.5,'slMap',CV);for(const z of [35.2,36.6])B(-27.2,0,z-.3,-26.4,.9,z+.3,'slSteel',CV);LIGHT(-24,3.3,35,'#f0f4ff',7,.5)}
  {const x0=18,x1=30,z0=30,z1=39.6,H=3.8,T=.25,W='slStuccoP';
    wallZ(x0,x0+T,z0,z1,0,H,W,[[33,35.6,0,2.6],[30.8,32.4,.9,2.4],[36.4,38.6,.9,2.4]]);wallZ(x1-T,x1,z0,z1,0,H,W,[]);wallX(x0,x1,z0,z0+T,0,H,W,[[24,28,.9,2.4]]);wallX(x0,x1,z1-T,z1,0,H,W,[]);
    paneZ(30.8,32.4,x0+T/2,.9,2.4,1);paneZ(36.4,38.6,x0+T/2,.9,2.4,1);pane(24,28,z0+T/2,.9,2.4,2);B(x0,-.01,z0,x1,.01,z1,'slOak',CV);B(x0-.1,H,z0-.1,x1+.1,H+.3,z1+.1,'slConc',{f:{ny:'slCeilP'}});
    B(x0-.01,2.85,32.4,x0,3.7,36.6,'slSignPhoto',CV);B(26.4,0,36.8,29.75,2.4,39.35,'slPhoto',{f:{nx:'slPhoto'}});B(20.4,0,30.6,23.4,1.05,31.4,'slWood',{f:{py:'slWood'}});
    B(29.2,0,30.4,29.75,2.2,35.6,'slPlush');B(21,0,36,24,1,37.4,'slStoneW',{f:{py:'slPlush'}});LIGHT(24,3.3,35,'#ffe8f4',7,.5)}
  for(const [x,z] of [[-16,28],[16,28],[-9,36.5],[9,36.5]])lampP(x,z,3.6,null,9,.5);
  planter(-15,31,-11,33.5);planter(11,31,15,33.5);for(const [x,z] of [[-6.5,27.5],[6.5,27.5]])bench(x,z,'x');bin(-4.8,38.6);bin(4.8,38.6);
  tree(-33,30,1.1);tree(33,30,1.1);tree(-33,37,1);tree(33,37,1);
  // ================= the main street: the souvenir shop (west) and the candy house (east), roof terraces up a stair at the back =================
  // (s: +1 the west shop, its front on x1 facing east; -1 the east one, its front on x0 facing west)
  const shop=(x0,x1,z0,z1,s,W,sign,inner)=>{const H=4.4,T=.25,fx=s>0?x1:x0,bx=s>0?x0:x1,RF=H+.3;
    const front=[[15.6,18.4,0,2.7],[11,14.6,.7,2.6],[19.4,23,.7,2.6]];
    if(s>0){wallZ(x1-T,x1,z0,z1,0,H,W,front,{f:{nx:'slStucco'}});wallZ(x0,x0+T,z0,z1,0,H,W,[[12,14,.9,2.4],[19,21,.9,2.4]],{f:{px:'slStucco'}})}
    else{wallZ(x0,x0+T,z0,z1,0,H,W,front,{f:{px:'slStucco'}});wallZ(x1-T,x1,z0,z1,0,H,W,[[12,14,.9,2.4],[19,21,.9,2.4]],{f:{nx:'slStucco'}})}
    const sd=s>0?[-13,-11,0,2.6]:[11,13,0,2.6];wallX(x0,x1,z0,z0+T,0,H,W,[sd,[s>0?-19:15,s>0?-15:19,.9,2.4]],{f:{pz:'slStucco'}});wallX(x0,x1,z1-T,z1,0,H,W,[[s>0?-19:15,s>0?-15:19,.9,2.4]],{f:{nz:'slStucco'}});
    paneZ(11,14.6,fx-s*T/2,.7,2.6,2);paneZ(19.4,23,fx-s*T/2,.7,2.6,2);paneZ(12,14,bx+s*T/2,.9,2.4,1);paneZ(19,21,bx+s*T/2,.9,2.4,1);pane(s>0?-19:15,s>0?-15:19,z0+T/2,.9,2.4,2);pane(s>0?-19:15,s>0?-15:19,z1-T/2,.9,2.4,2);
    B(x0,-.01,z0,x1,.01,z1,'slOak',CV);B(x0,H,z0,x1,RF,z1,'slConc',{f:{ny:'slCeilP',py:'slPlank'}});
    // the false front over the street (to 7.6 m), its cornice and sign; the awning; a parapet round the rest of the roof with a gap at the stair's head
    B(fx-(s>0?T:0),RF,z0,fx+(s>0?0:T),7.6,z1,W);B(s>0?fx-T-.1:fx-.35,7.6,z0-.25,s>0?fx+.35:fx+T+.1,7.85,z1+.25,'slGold',CV);
    B(s>0?fx:fx-.01,5.1,z0+3,s>0?fx+.01:fx,7.2,z1-3,sign,CV);B(s>0?fx:fx-1.5,2.85,z0+.6,s>0?fx+1.5:fx,3.0,z1-.6,s>0?'slAwning':'slAwningB',CV);
    B(s>0?x0:x0+T,RF,z0,s>0?x1-T:x1,RF+1,z0+T,W);B(s>0?x0:x0+T,RF,z1-T,s>0?x1-T:x1,RF+1,z1,W);B(bx-(s>0?0:T),RF,z0+T,bx+(s>0?T:0),RF+1,14.6,W);B(bx-(s>0?0:T),RF,16.2,bx+(s>0?T:0),RF+1,z1-T,W);
    // the stair up the back to the roof, its landing
    const sx0=s>0?x0-1.6:x1,sx1=s>0?x0:x1+1.6;tst('z',sx0,sx1,24,16.2,0,RF,13,'slSteel');hrail('z',s>0?sx0-.06:sx1,s>0?sx0:sx1+.06,24,16.2,0,RF,13);B(sx0,RF-.15,14.6,sx1,RF,16.2,'slSteel',{f:{py:'slPlank'}});
    rail(s>0?sx0-.06:sx1,14.6,s>0?sx0:sx1+.06,16.2,RF,1,'slSteel');rail(sx0,14.54,sx1,14.6,RF,1,'slSteel');
    // the roof terrace: a table, chairs, a parasol; lamps inside
    B((x0+x1)/2-.6,RF,18-.6,(x0+x1)/2+.6,RF+.76,18+.6,'slWood',{f:{py:'slWood'}});SLD.parasols=SLD.parasols||[];SLD.parasols.push([(x0+x1)/2,RF,18,1.6,s>0?0:3]);
    inner(x0,x1,z0,z1,H);LIGHT((x0+x1)/2,H-.5,13.5,'#ffe8c8',8,.6);LIGHT((x0+x1)/2,H-.5,20.5,'#ffe8c8',8,.55)};
  SLD.parasols=[];
  shop(-22,-8,10,24,1,'slStuccoP','slSignShop1',(x0,x1,z0,z1,H)=>{B(x0+.25,0,z0+1,x0+.8,2.2,z1-1,'slPlush');B(x0+1,0,z1-.8,x1-3,2,z1-.25,'slPlush');B(-18,0,12.6,-15,1.1,15,'slWood',{f:{py:'slPlush'}});
    B(-18,0,19,-15,1.1,21.4,'slWood',{f:{py:'slPlush'}});B(-11,0,19.6,-9.4,1.05,23,'slWood',{f:{py:'slWood'}});B(-10.6,1.05,21.4,-10,1.4,22,'slSteel',CV)});
  shop(8,22,10,24,-1,'slStuccoB','slSignShop2',(x0,x1,z0,z1,H)=>{B(x1-.8,0,z0+1,x1-.25,2.2,z1-1,'slCandy');B(x0+3,0,z1-.8,x1-1,2,z1-.25,'slCandy');B(15,0,12.6,18,1.1,15,'slWood',{f:{py:'slCandy'}});
    B(15,0,19,18,1.1,21.4,'slStoneW',{f:{py:'slCandy'}});B(9.4,0,19.6,11,1.05,23,'slWood',{f:{py:'slWood'}});B(10,1.05,21.4,10.6,1.4,22,'slSteel',CV)});
  // the street's lamps, trees in planters, strings of bulbs across, the carts
  for(const z of [10,16,22])for(const x of [-6.8,6.8])lampP(x,z,3.8,null,8,.48);
  for(const z of [13,19])for(const x of [-6.8,6.8]){B(x-.6,0,z-.6,x+.6,.45,z+.6,'slStoneW',{f:{py:'slFlower'}});SLD.trees.push([x,.45,z,.8]);B(x-.14,.45,z-.14,x+.14,2.8,z+.14,X)}
  for(const z of [12,17.5,23])str(-7.8,5.8,z,7.8,5.8,z,1.1);
  {B(-4.6,0,10.6,-3.4,1.05,11.6,'slCart',{f:{py:'slSteel'}});B(-4.5,1.05,10.7,-3.5,1.7,11.5,'slGlassG');B(-4.8,2.2,10.4,-3.2,2.3,11.8,'slAwning',CV);for(const [x,z] of [[-4.55,10.65],[-3.45,11.55]])B(x-.03,1.05,z-.03,x+.03,2.2,z+.03,'slSteel',CV)}
  {B(3.4,0,20.4,4.6,1,21.6,'slCart',{f:{py:'slSteel'}});SLD.balloons=[4,1,21]}
  // ================= the central plaza and the carousel =================
  {const cx=0,cz=-5,R0=7.2;disc(cx,cz,R0,0,.45,X,{stair:1});B(cx-1.3,.45,cz-1.3,cx+1.3,4.7,cz+1.3,X);
    // (the horses' poles: two rings of twelve; a box round each pole and its horse to bump into)
    for(let i=0;i<12;i++)for(const [r,o] of [[5.6,0],[3.9,.5]]){if(o&&i%2)continue;const a=(i+o)/12*TAU,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;B(x-.25,.45,z-.25,x+.25,4.7,z+.25,X)}
    for(const [dx,dz] of [[-3.6,-3.6],[3.6,-3.6],[-3.6,3.6],[3.6,3.6]])LIGHT(cx+dx,4.1,cz+dz,'#ffd890',8.5,.48);MAP.dyn.push([cx,5.2,cz+7.6,'#ffc860',8,.3,.2]);
    for(let i=0;i<8;i++){const a=(i+.5)/8*TAU,x=cx+Math.cos(a)*10.6,z=cz+Math.sin(a)*10.6;Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?bench(x,z,'z'):bench(x,z,'x')}}
  // the four flower beds round the plaza (waist high: cover), the signpost, the bins, lamps, trees
  planter(-20,-17,-12,-13,.9);planter(12,-17,20,-13,.9);planter(-20,2,-12,6,.9);planter(12,2,20,6,.9);
  for(const [x,z] of [[-16,-15],[16,-15],[-16,4],[16,4]]){SLD.trees.push([x,.9,z,1.05]);B(x-.18,.9,z-.18,x+.18,4,z+.18,X)}
  {B(-10.1,0,6.9,-9.9,2.6,7.1,'slWood');B(-10.6,1.2,6.86,-9.4,2.5,6.9,'slPost',CV);B(-10.6,1.2,7.1,-9.4,2.5,7.14,'slPost',CV)}
  {B(8.8,0,6.6,10.2,1.9,6.7,'slMap',{f:{nz:'slMap'}});B(8.7,0,6.5,8.8,2,6.8,'slWood');B(10.2,0,6.5,10.3,2,6.8,'slWood')}
  for(const [x,z] of [[-22,-4],[22,-4],[-10,-18],[10,-18],[-22,7],[22,7]])lampP(x,z,4,null,10,.52);for(const [x,z] of [[-12.5,-9],[12.5,-1]])bin(x,z);
  str(-22,4.4,-4,-10,4.6,-18,.8);str(10,4.6,-18,22,4.4,-4,.8);str(-22,4.4,7,22,4.4,7,1.6);
  // ================= the castle: the keep and its hall, the stair to the battlements, the towers, the spire =================
  {const W='slCastle',WI='slCastleIn';
    wallX(-11,11,-26.5,-26,0,7.2,W,[[-2.5,2.5,0,5.2],[-9,-7,3.4,5.6],[-5.5,-4,3.4,5.6],[4,5.5,3.4,5.6],[7,9,3.4,5.6]],{f:{nz:WI}});
    wallX(-11,11,-40,-39.5,0,7.2,W,[[-2,2,0,3.8],[-7,-5,3.4,5.6],[5,7,3.4,5.6]],{f:{pz:WI}});
    wallZ(-11,-10.5,-39.5,-26.5,0,7.2,W,[],{f:{px:WI}});wallZ(10.5,11,-39.5,-26.5,0,7.2,W,[[-36,-34,3.4,5.6],[-31,-29,3.4,5.6]],{f:{nx:WI}});
    for(const [a,b] of [[-9,-7],[-5.5,-4],[4,5.5],[7,9]])pane(a,b,-26.25,3.4,5.6,1,'slStain');for(const [a,b] of [[-7,-5],[5,7]])pane(a,b,-39.75,3.4,5.6,1,'slStain');for(const [a,b] of [[-36,-34],[-31,-29]])paneZ(a,b,10.75,3.4,5.6,1,'slStain');
    B(-3.1,5.2,-25.96,3.1,6.2,-25.8,'slCastleD',CV);for(let x=-2.25;x<=2.26;x+=.5)B(x-.04,4.5,-26.32,x+.04,5.2,-26.22,'slSteel',CV);B(-2,6.25,-26,2,7.15,-25.99,'slSignCastle',CV);
    slab(-11,-40,11,-26,6.9,7.2,'slStoneF',[[-10.5,-39.5,-8.9,-31.5]],{f:{ny:'slCeilC'}});
    // the battlements: a parapet a metre high, merlons on it (you shoot through the crenels)
    B(-11,7.2,-26.5,11,8.2,-26,W);B(-11,7.2,-40,11,8.2,-39.5,W);B(-11,7.2,-39.5,-10.5,8.2,-26.5,W);B(10.5,7.2,-39.5,11,8.2,-26.5,W);
    for(let x=-10.7;x<10.6;x+=1.2){B(x,8.2,-26.5,x+.6,8.9,-26,W);B(x,8.2,-40,x+.6,8.9,-39.5,W)}for(let z=-39.2;z<-26.6;z+=1.2){B(-11,8.2,z,-10.5,8.9,z+.6,W);B(10.5,8.2,z,11,8.9,z+.6,W)}
    // the stair: along the front wall from the hall up to a landing in the corner, then up the west wall to the roof; the hole in the roof over it
    stairs('x',-28.1,-26.5,-4,-8.9,0,2.9,7,'slCastleD',{f:{ny:'slCeilC',nz:WI}});B(-10.5,0,-28.1,-8.9,2.9,-26.5,'slCastleD',{f:{nz:WI,px:WI}});
    B(-10.5,0,-39.2,-8.9,2.9,-28.1,WI);stairs('z',-10.5,-8.9,-28.1,-39.2,2.9,7.2,12,'slCastleD',{f:{px:WI}});
    hrail('x',-28.16,-28.1,-4,-8.9,0,2.9,7,'slGold');hrail('z',-8.96,-8.9,-28.1,-37.35,2.9,6.48,10,'slGold');
    rail(-10.5,-31.56,-8.9,-31.5,7.2,1,'slGold');rail(-8.9,-37.6,-8.84,-31.5,7.2,1,'slGold');
    // the hall: a red carpet to the throne on its dais, banners, armour, cases of crowns, the chandelier
    B(-10.5,-.01,-39.5,10.5,.01,-26.5,'slStoneF',CV);B(-1.5,.01,-36.5,1.5,.02,-26.5,'slCarpet',CV);B(-4,0,-39.5,4,.5,-36.5,'slCastleD',{stair:1,f:{py:'slCarpet'}});B(-.8,.5,-39.45,.8,2.6,-38.7,'slThrone');
    for(const z of [-35.2,-30.2]){B(10.49,2.2,z-.7,10.5,6.2,z+.7,'slBanner',CV)}for(const x of [-6.5,6.5])B(x-.7,2.2,-39.5,x+.7,6.2,-39.49,'slBanner',CV);
    for(const [x,z] of [[-5,-37.6],[5,-37.6],[9.6,-33.5],[9.6,-28.4]])B(x-.3,0,z-.25,x+.3,1.9,z+.25,'slArmor');B(4.5,0,-32.1,6.5,1.1,-30.9,'slCase');
    B(-6.5,0,-32.4,-4.5,1.1,-31.2,'slCase');LIGHT(0,5.3,-33,'#ffd8a0',11,.62);for(const [x,z] of [[-10,-33],[10,-33],[0,-39]])LIGHT(x,4.2,z,'#ffb060',5.5,.32);
    // the towers: two at the front (13 m), two at the back (11.5), their cones and flags made as meshes; the spire on the roof, its clock
    for(const x0 of [-15.5,11]){B(x0,0,-30,x0+4.5,13,-24.5,W);B(x0-.2,13,-30.2,x0+4.7,13.3,-24.3,'slGold',CV);B(x0,0,-41.5,x0+4.5,11.5,-37,W);B(x0-.2,11.5,-41.7,x0+4.7,11.8,-36.8,'slGold',CV);
      for(const y of [4,8.5])B(x0+2.1,y,-24.5,x0+2.4,y+1.6,-24.49,'slSteel',CV)}
    B(-3,7.2,-39.5,3,15.6,-35,W);B(-3.2,15.6,-39.7,3.2,15.9,-34.8,'slGold',CV);B(-1.2,12,-35,1.2,14.4,-34.99,'slClockC',CV);B(-1,9,-35,1,11.2,-34.99,'slStain',CV);
    for(const [x,c] of [[-7,'#ffb8e8'],[7,'#b8ccff']])LIGHT(x,.8,-20.5,c,13,.42);LIGHT(0,4.6,-24.4,'#ffd8a0',7,.36);LIGHT(-9.7,4.6,-33.5,'#ffb060',6.5,.42);LIGHT(-7,2.8,-27.6,'#ffb060',5,.3);
    planter(-12.5,-22.5,-8.5,-18.5,.6);planter(8.5,-22.5,12.5,-18.5,.6);for(const x of [-4.5,4.5])lampP(x,-22,3.8,null,8,.45)}
  // ================= the haunted house: nine dark rooms behind a gabled front, the graveyard before it =================
  {const W='slHaunt',WI='slHauntIn',x0=-58,x1=-38,z0=-32,z1=-10,H=4.3;
    wallZ(x1-.3,x1,z0,z1,0,4,W,[[-22,-20,0,2.5],[-14,-12,0,2.5]],{f:{nx:WI}});wallZ(x0,x0+.3,z0,z1,0,4,W,[],{f:{px:WI}});wallX(x0,x1,z0,z0+.3,0,4,W,[],{f:{pz:WI}});wallX(x0,x1,z1-.3,z1,0,4,W,[],{f:{nz:WI}});
    B(x0,4,z0,x1,4.3,z1,W,{f:{ny:'slCeilH'}});B(x0+.3,-.01,z0+.3,x1-.3,.01,z1-.3,'slWoodF',CV);
    // the inside walls: a 3 × 3 grid of rooms, the doorways between them (see the plan: one way through, a loop at the front, a dead end)
    wallZ(-51.375,-51.125,-31.7,-10.3,0,4,WI,[[-21.5,-19.5,0,2.4],[-14.5,-12.5,0,2.4]]);wallZ(-44.875,-44.625,-31.7,-10.3,0,4,WI,[[-29,-27,0,2.4],[-21.8,-19.8,0,2.4],[-15,-13,0,2.4]]);
    wallX(-57.7,-38.3,-24.625,-24.375,0,4,WI,[[-55.5,-53.5,0,2.4],[-49,-47,0,2.4],[-42.5,-40.5,0,2.4]]);wallX(-57.7,-38.3,-17.625,-17.375,0,4,WI,[[-56,-54,0,2.4]]);
    // the front: a gable over it to 10.5 m, a tower at the north corner, the sign, boarded windows, the porch
    B(x1-.3,H,-28.8,x1,8.6,-12,W);B(x1-.3,8.6,-26,x1,9.8,-16,W);B(x1-.3,9.8,-23,x1,10.6,-19,W);B(x1-3.2,H,z0,x1,12,z0+3.2,W);B(x1-3.4,12,z0-.2,x1+.2,12.3,z0+3.4,'slSteel',CV);
    B(x1,5.6,-25,x1+.01,7.8,-17,'slSignHaunt',CV);for(const [a,b] of [[-30,-27],[-18,-16]])B(x1,1,a,x1+.01,3,b,'slBoard',CV);for(const [a,b] of [[-31.6,-29.2],[-14.5,-12.5]])B(x1,5,a,x1+.01,6.6,b,'slBoard',CV);
    B(x1,0,-24.5,x1+2.4,.25,-9.5,'slPlank',{stair:1});B(x1,3.2,-24.8,x1+2.6,3.4,-9.2,W,{f:{ny:'slCeilH'},nosolid:true});for(const z of [-24.4,-17,-9.6])B(x1+2.2,0,z-.1,x1+2.4,3.2,z+.1,'slWood',CV);
    // the rooms: the hall (portraits, a clock), the mirror room, the dining room, the library, the chapel of pews, the coffin room (the dead end),
    // the nursery, the kitchen, the hall out
    for(const z of [-23,-19])B(-38.31,1.4,z-.5,-38.3,2.9,z+.5,'slPortrait',CV);for(const x of [-43,-40.5])B(x-.5,1.4,-17.635,x+.5,2.9,-17.625,'slPortrait',CV);B(-44.5,0,-23.6,-43.9,2.3,-22.9,'slClockG');
    for(const x of [-43.4,-41.6,-39.8])B(x-.6,.6,-31.7,x+.6,2.8,-31.69,'slMirrorH',CV);for(const z of [-29.5,-27.5])B(-44.68,.6,z-.6,-44.62,2.8,z+.6,'slMirrorH',CV);B(-40.5,0,-27.4,-39.3,.8,-26.4,'slWood');
    B(-50.2,0,-29.6,-45.8,.78,-27.6,'slWood',{f:{py:'slWood'}});for(const x of [-49.4,-48,-46.6])for(const z of [-30.2,-27])B(x-.22,0,z-.22,x+.22,1.1,z+.22,'slWood',CV);
    B(-50.9,0,-23.9,-50.4,2.6,-18.2,'slBooksH');B(-48.6,0,-18.4,-45.6,2.4,-17.9,'slBooksH');B(-48,0,-22.8,-46.4,.5,-21.6,'slBooksH',{f:{py:'slWoodF'}});
    for(const z of [-22.8,-21,-19.2])B(-57.4,0,z-.3,-55.8,.85,z+.3,'slWood');B(-53,0,-19.6,-52,1.2,-18.6,'slWood',{f:{py:'slGold'}});
    for(const [x,z] of [[-56.4,-30.4],[-53.2,-30.4],[-56.4,-27.2]])B(x-.4,0,z-1.05,x+.4,.65,z+1.05,'slCoffin');B(-53.6,0,-28,-52.8,.65,-26,'slCoffin');B(-52.9,.65,-28.2,-52.7,2.3,-26.3,'slCoffin',CV);
    for(const [x,z] of [[-57.4,-31.4],[-38.6,-10.6],[-51.6,-17.9],[-44.9,-31.4]])B(x-.6,3.2,z-.6,x+.6,4,z+.6,'slCobweb',CV);
    B(-57.6,0,-16.8,-56.6,.8,-15.4,'slWood');B(-55.4,0,-12,-54,.6,-10.6,'slSaddle');B(-50.2,0,-11.2,-45.8,1,-10.4,'slKitchen');B(-48.4,0,-15.6,-47.2,1,-14.4,'slSteel');
    B(-39.6,2.6,-12.6,-38.36,3,-12.56,'slSignExit',CV);for(let i=0;i<3;i++)B(-43-i*.9,0,-11.4,-42.2-i*.9,.8-i*.15,-10.6,'slWood');
    // its lights: low, coloured, two of them guttering
    for(const [x,z,c,k] of [[-41.5,-21,'#ff4a3a',.52],[-41.5,-28,'#a04aff',.48],[-48,-28,'#4aff6a',.42],[-48,-21,'#ffa04a',.44],[-54.5,-21,'#c8a0ff',.42],[-54.5,-28,'#ff3a2a',.55],
        [-54.5,-14,'#6aa0ff',.42],[-48,-14,'#6aff8a',.42],[-41.5,-14,'#ff4a3a',.46]])LIGHT(x,3.4,z,c,8,k*1.25);
    LIGHT(-53,1.1,-28.6,'#ffb060',4.5,.42);MAP.dyn.push([-54.5,1.6,-28.4,'#ff5a3a',5,.45,.6]);MAP.dyn.push([-41.5,2.6,-21,'#ff6a4a',5,.3,.5]);
    LIGHT(x1+4,1,-21,'#7aff6a',11,.42);LIGHT(x1+1.5,3,-12.5,'#c08aff',8,.35);
    // the graveyard: stones, a low iron fence (its gate at the porch's steps), dead trees
    for(const [x,z] of [[-34.6,-29.6],[-32.4,-28.4],[-30.6,-30],[-34.4,-14],[-32,-12.2],[-30.4,-14.6],[-33.6,-26.4],[-31.4,-11]])B(x-.3,0,z-.07,x+.3,.95,z+.07,'slGrave');
    for(const [a,b] of [[-32,-22.5],[-19.5,-9.6]])B(-29.4,0,a,-29.34,.9,b,'slFenceL',PS);for(const x of [-35.6,-32.4]){SLD.trees.push([x,0,-21,.9,1]);B(x-.14,0,-21.14,x+.14,2.7,-20.86,X)}}
  // ================= the roller coaster: the station (its platform 4.2 m up, two stairs, the train), the circuit and its supports =================
  {B(-46,3.2,-47.2,-26,3.4,-45.6,'slSteel');B(-46,3.2,-49.2,-26,3.4,-47.2,'slSteel',{f:{py:'slPlank'}});B(-44,3.9,-45.6,-28,4.2,-44,'slConc',{f:{py:'slPlank'}});
    for(let k=0;k<5;k++){const x=-42.6+k*2.6;B(x,3.4,-47.1,x+2.3,4.7,-45.7,'slTrain',{f:{py:'slSeat'}});B(x+.3,4.7,-46.9,x+.42,5.5,-45.9,'slSeat',CV);B(x+1.3,4.7,-46.9,x+1.42,5.5,-45.9,'slSeat',CV)}
    for(const x of [-45,-40,-35,-30,-27]){for(const z of [-48.6,-46.4])B(x-.22,0,z-.22,x+.22,3.2,z+.22,'slSteelW');B(x-.22,0,-44.66,x+.22,3.9,-44.22,'slSteelW')}
    for(const x of [-46.4,-36,-25.6])B(x-.15,3.4,-49.35,x+.15,8.4,-49.05,'slSteel');for(const x of [-44.4,-36,-27.6])B(x-.15,0,-43.45,x+.15,8.4,-43.15,'slSteel');
    B(-47,8.4,-50,-25,8.7,-42.6,'slRoofM',{f:{ny:'slSteel'}});B(-46,3.4,-49.6,-26,8.4,-49.4,'slSteelW');B(-42,8.7,-42.62,-30,10.4,-42.56,'slSignCoaster',CV);B(-42,8.7,-42.66,-30,10.4,-42.62,'slSteel',CV);
    // (the flights' ends on cell lines: the foot of each a clear cell, its top tread a cell of its own beside the platform's)
    tst('z',-29.6,-28,-37,-44,0,4.2,12,'slSteel');hrail('z',-29.66,-29.6,-37,-44,0,4.2,12);hrail('z',-28,-27.94,-37,-44,0,4.2,12);
    tst('z',-43.6,-42,-37,-44,0,4.2,12,'slSteel');hrail('z',-43.66,-43.6,-37,-44,0,4.2,12);hrail('z',-42,-41.94,-37,-44,0,4.2,12);
    rail(-42,-44.04,-29.6,-43.98,4.2,1,'slSteel');rail(-44.06,-45.6,-44,-44,4.2,1,'slSteel');rail(-28,-45.6,-27.94,-44,4.2,1,'slSteel');rail(-41,-40.03,-31,-39.97,0,1.05,'slSteel');
    LIGHT(-36,7.6,-46,'#c8e0ff',13,.55);LIGHT(-36,5.8,-44.4,'#ffe0c0',9,.45);LIGHT(-36,3,-41,'#ff80c0',9,.38);for(const x of [-42.8,-28.8])LIGHT(x,2.4,-38.6,'#ffd8a0',5.5,.32);MAP.dyn.push([-36,9.6,-41.4,'#6ae8ff',9,.3,.3]);
    // the circuit: a closed spline through these, sampled every half metre (the mesh pass draws it; here the columns under it)
    const CP=[[-46,3.4,-46.4],[-40,3.4,-46.4],[-34,3.4,-46.4],[-28,3.4,-46.4],[-24.2,3.7,-47.2],[-22,4.2,-49.6],[-22.6,4.7,-52.6],[-25.4,5.4,-54.6],
      [-30,8.2,-54.8],[-36,12.6,-54.8],[-42,17,-54.8],[-46,19.8,-54.8],[-49,20.8,-54.6],[-51.6,20,-53.6],[-53.2,17.6,-51.6],[-53.6,13,-49],[-53.6,8,-46.6],[-53.4,4.2,-44],
      [-53.2,2.8,-41.4],[-52.2,2.6,-38.6],[-50.8,2.7,-37.4],[-49.4,2.8,-38.6],[-48.8,3,-41.2],[-48.6,3.3,-43.6],[-47.6,3.4,-45.8]];
    const n=CP.length,dense=[];for(let i=0;i<n;i++){const p0=CP[(i-1+n)%n],p1=CP[i],p2=CP[(i+1)%n],p3=CP[(i+2)%n];for(let k=0;k<24;k++){const t=k/24,t2=t*t,t3=t2*t;
      dense.push([0,1,2].map(j=>.5*(2*p1[j]+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}
    const tr=[dense[0]];let acc=0;for(let i=1;i<=dense.length;i++){const a=dense[i-1],b=dense[i%dense.length],d=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);acc+=d;if(acc>=.5){tr.push(b);acc=0}}
    SLD.track=tr;const inSt=(x,z)=>x>-46.6&&x<-25.4&&z>-49.8&&z<-42.4;
    for(let i=0;i<tr.length;i+=6){const [x,y,z]=tr[i];if(inSt(x,z)||y<1.3)continue;B(x-.17,0,z-.17,x+.17,y-.5,z+.17,'slSteelW')}}
  // ================= the ferris wheel: the boarding platform, the cabin at the bottom you can get into; the wheel itself is a mesh =================
  {B(34,0,-45,46,1.2,-38,'slConc',{f:{py:'slPlank'}});stairs('z',38.4,41.6,-36,-38,0,1.2,4,'slConc',{f:{py:'slPlank'}});stairs('x',-42.4,-40.4,32,34,0,1.2,4,'slConc',{f:{py:'slPlank'}});
    rail(34,-38.06,38.4,-38,1.2,1,'slSteelW');rail(41.6,-38.06,46,-38,1.2,1,'slSteelW');rail(46,-45,46.06,-38,1.2,1,'slSteelW');rail(33.94,-45,34,-42.4,1.2,1,'slSteelW');rail(33.94,-40.4,34,-38,1.2,1,'slSteelW');
    rail(34,-45.06,39.2,-45,1.2,1,'slSteelW');rail(40.8,-45.06,46,-45,1.2,1,'slSteelW');
    // the cabin: its floor a step up, a door on the platform side, windows all round, its roof; it hangs from the rim (mesh)
    {const G1='slGondola',GG='slGlassG';B(39,1.2,-47.2,41,1.3,-45.2,G1,{f:{py:'slPlank'}});B(39,1.3,-45.3,39.2,3.3,-45.2,G1);B(40.8,1.3,-45.3,41,3.3,-45.2,G1);B(39.2,3,-45.3,40.8,3.3,-45.2,G1);
      B(39,1.3,-47.2,41,2.2,-47.1,G1);B(39,2.2,-47.2,41,3.2,-47.1,GG,PS);B(39,3.2,-47.2,41,3.3,-47.1,G1);
      for(const x of [39,40.9]){B(x,1.3,-47.1,x+.1,2.2,-45.3,G1);B(x,2.2,-47.1,x+.1,3.2,-45.3,GG,PS);B(x,3.2,-47.1,x+.1,3.3,-45.3,G1)}
      B(38.9,3.3,-47.3,41.1,3.45,-45.1,G1);B(39.1,1.3,-47.1,40.9,1.75,-46.8,'slSeat');LIGHT(40,2.9,-46.2,'#ffd8f0',3.5,.4)}
    for(const [x,z] of [[31.5,-49.4],[48.5,-49.4],[31.5,-43],[48.5,-43]])B(x-.45,0,z-.45,x+.45,2.6,z+.45,'slSteelW');
    {B(35,0,-35.8,37.6,2.6,-33.2,'slStuccoP',{f:{px:'slTicket'}});B(34.8,2.6,-36,37.8,2.8,-33,'slConc');B(35.2,2.8,-35.4,37.4,3.8,-35.36,'slSignFerris',CV)}
    rail(38.4,-36,38.46,-30,0,1.05,'slSteel');rail(41.54,-36,41.6,-30,0,1.05,'slSteel');
    LIGHT(40,3.2,-41,'#ffd8ff',9,.42);LIGHT(40,9,-44.4,'#ff90e0',15,.22);LIGHT(31,8,-46,'#90d0ff',12,.28);LIGHT(49,8,-46,'#ffe090',12,.28);MAP.dyn.push([40,5,-43.6,'#ff8ad8',8,.25,.3])}
  // ================= the bumper cars: the pavilion, its floor and its barrier, the cars, the booth =================
  {for(const x of [26.2,36,45.8])for(const z of [-21.8,-14,-6.2])B(x-.2,0,z-.2,x+.2,5.2,z+.2,'slSteelW');B(25.6,5.2,-22.4,46.4,5.5,-5.6,'slRoofM',{f:{ny:'slGrid'}});
    B(25.4,4.6,-22.6,46.6,5.2,-22.4,'slFascia',CV);B(25.4,4.6,-5.6,46.6,5.2,-5.4,'slFascia',CV);B(25.4,4.6,-22.4,25.6,5.2,-5.6,'slFascia',CV);B(46.4,4.6,-22.4,46.6,5.2,-5.6,'slFascia',CV);
    B(25.39,5.5,-16.5,25.4,7,-11.5,'slSignBump',CV);B(25.4,5.5,-16.5,25.5,7,-11.5,'slSteel',CV);
    B(27,0,-21,45,.15,-7,'slPlate',{stair:1});B(27,.15,-21,45,.6,-20.6,'slRubber');B(44.6,.15,-20.6,45,.6,-7.4,'slRubber');B(27,.15,-7.4,34,.6,-7,'slRubber');B(38,.15,-7.4,45,.6,-7,'slRubber');
    B(27,.15,-20.6,27.4,.6,-16,'slRubber');B(27,.15,-12,27.4,.6,-7.4,'slRubber');
    for(const [x,z,m] of [[30,-18.6,'slBumpR'],[34.4,-16.8,'slBumpB'],[39.6,-18.8,'slBumpY'],[42.4,-15.2,'slBumpG'],[31.4,-11.6,'slBumpY'],[36.6,-12.4,'slBumpR'],[41.2,-9.6,'slBumpB'],[29.6,-8.6,'slBumpG']]){
      B(x-.95,.15,z-.6,x+.95,.95,z+.6,m,{f:{py:'slSeat'}});B(x+.5,.95,z-.05,x+.6,4.9,z+.05,'slSteel',CV)}
    {const x0=46.6,z0=-9.2;B(x0,0,z0,x0+3,2.6,z0+3,'slStuccoB',{f:{nx:'slGlassG'}});B(x0-.1,2.6,z0-.1,x0+3.1,2.8,z0+3.1,'slConc')}
    for(const [x,z,c] of [[31,-17,'#ff60c0'],[40.5,-11,'#60d0ff'],[36,-14,'#ffe060']])LIGHT(x,4.7,z,c,9.5,.5);MAP.dyn.push([36,4.6,-14,'#ff60c0',8,.3,.35])}
  // ================= the drop tower: the column, the ring of seats on its pad, the fence round it =================
  {B(43.8,0,11.8,46.2,46,14.2,'slTower');B(43,44,11,47,46.8,15,'slSteelW',{f:{py:'slSteel'}});B(43.4,46.8,11.4,46.6,47.4,14.6,'slLed',CV);
    for(const [a,b,c,d] of [[43.79,13.4,43.8,14],[46.2,12,46.21,12.6],[44.4,11.79,45,11.8],[45,14.2,45.6,14.21]])B(a,2,b,c,44,d,'slLed',CV);
    B(41,0,9,49,.5,17,'slConc',{f:{py:'slPlate'}});B(41.8,.5,9.8,48.2,1.4,11.8,'slSeat');B(41.8,.5,14.2,48.2,1.4,16.2,'slSeat');B(41.8,.5,11.8,43.8,1.4,14.2,'slSeat');B(46.2,.5,11.8,48.2,1.4,14.2,'slSeat');
    B(41.6,1.4,9.6,48.4,1.6,16.4,'slSteelW',CV);for(let k=0;k<6;k++){const x=42.3+k*1.1;B(x,1.6,9.8,x+.5,2.3,10,'slSteel',CV);B(x,1.6,16,x+.5,2.3,16.2,'slSteel',CV)}
    for(const x of [42.8,47])B(x,0,5.9,x+.2,3.2,6.1,'slSteel');B(43,2.3,5.98,47,3.1,6.02,'slSignDrop',CV);fenceX(38,43,6,1.2);fenceX(47,52,6,1.2);fenceX(38,52,20,1.2);fenceZ(6,20,38,1.2);fenceZ(6,20,52,1.2);
    B(49.4,0,17.6,51.6,2.6,19.6,'slStuccoB',{f:{nx:'slGlassG'}});B(49.3,2.6,17.5,51.7,2.8,19.7,'slConc');
    LIGHT(45,3,7.6,'#a0f0ff',9,.42);LIGHT(45,3,18.4,'#ff8ad8',8,.36);LIGHT(45,20,10,'#8ae8ff',18,.25)}
  // ================= the game booths: balloon darts, the shooting gallery, ring toss, claw machines =================
  {B(30,0,33.75,54.25,3,34,'slStucco');for(const x of [30,36,42,48,54])B(x,0,27,x+.25,3,33.75,'slStucco');
    for(let k=0;k<4;k++){const x0=30.25+k*6,x1=x0+5.75;B(x0,0,27,x1-1.1,1.05,27.5,'slWood',{f:{nz:'slCounterF'}});B(x0-.25,3.0,26.4,x1+.25,3.2,34.1,'slTentY',{f:{ny:'slTentY'}});
      B(x0+1.4,2.5,26.34,x1-1.4,3,26.4,'slSignGame'+k,CV);LIGHT((x0+x1)/2,2.6,30,'#ffd890',6.5,.45);
      if(k<3)B(x0+.2,.9,33.74,x1-.2,2.9,33.75,'slPrize'+k,CV);else for(const cx of [x0+1.2,x1-1.6])B(cx-.6,0,32.2,cx+.6,1.9,33.6,'slClaw',{f:{py:'slSteel'}});
      if(k===2)for(const [y,z] of [[0,32],[.5,32.8]])B(x0+.6,y,z,x1-.6,y+.5,33.6,'slWood',{f:{py:'slPrize2'}});if(k===0)B(x0+.3,0,32.6,x1-.3,1.2,33.6,'slWood')}}
  // ================= the food court: stalls along its west wall, tables; the terrace on its roof up a stair outside =================
  {const W='slStucco',x0=-46,x1=-30,z0=4,z1=20,H=4.2,RF=4.5;
    wallZ(x1-.25,x1,z0,z1,0,H,W,[[7,9.5,0,2.6],[14.5,17,0,2.6],[10.5,13.5,.9,2.6]]);wallZ(x0,x0+.25,z0,z1,0,H,W,[]);wallX(x0,x1,z0,z0+.25,0,H,W,[[-44,-40,.9,2.4],[-36,-32,.9,2.4]]);
    wallX(x0,x1,z1-.25,z1,0,H,W,[[-42,-40,0,2.6],[-45,-43,.9,2.4]]);paneZ(10.5,13.5,x1-.125,.9,2.6,2);pane(-44,-40,z0+.125,.9,2.4,2);pane(-36,-32,z0+.125,.9,2.4,2);pane(-45,-43,z1-.125,.9,2.4,1);
    B(x0,-.01,z0,x1,.01,z1,'slOak',CV);B(x0,H,z0,x1,RF,z1,'slConc',{f:{ny:'slCeilP',py:'slPlank'}});B(x1,2.9,9.8,x1+.01,4,14.2,'slSignFood',CV);
    for(let k=0;k<4;k++){const za=z0+.25+k*3.85;if(k)B(x0+.25,0,za-.1,-43.6,2.6,za+.1,W);B(-44.2,0,za+.3,-43.6,1.05,za+3.55,'slWood',{f:{px:'slCounterF'}});B(x0+.25,0,za+.3,-45.2,2.2,za+3.55,'slKitchen');
      B(x0+.25,2.4,za+.4,x0+.26,3.6,za+3.4,'slMenu'+k,CV)}
    for(const x of [-40,-35])for(const z of [7,12,17]){B(x-.7,0,z-.45,x+.7,.76,z+.45,'slWood',{f:{py:'slWood'}});B(x-.7,0,z-1.05,x+.7,.45,z-.75,'slBench');B(x-.7,0,z+.75,x+.7,.45,z+1.05,'slBench')}
    LIGHT(-38,3.7,8,'#ffe8c8',8,.5);LIGHT(-38,3.7,16,'#ffe8c8',8,.5);LIGHT(-44.6,2.8,12,'#ffb870',6,.4);
    // the terrace: a parapet with a gap at the stair's head, tables under parasols, strings of bulbs on four poles
    B(x0,RF,z0,x1,RF+.9,z0+.25,W);B(x0,RF,z0+.25,x0+.25,RF+.9,z1-.25,W);B(x1-.25,RF,z0+.25,x1,RF+.9,z1-.25,W);B(x0,RF,z1-.25,-39.6,RF+.9,z1,W);B(-38,RF,z1-.25,x1,RF+.9,z1,W);
    stairs('x',20,21.6,-30.4,-38,0,RF,13,'slConc');hrail('x',21.6,21.66,-30.4,-38,0,RF,13);B(-39.6,RF-.14,20,-38,RF,21.6,'slConc');rail(-39.66,20,-39.6,21.6,RF,1,'slSteel');rail(-39.6,21.6,-38,21.66,RF,1,'slSteel');
    for(const [x,z] of [[-42,8],[-34,8],[-42,15.5],[-34,15.5]]){B(x-.6,RF,z-.6,x+.6,RF+.76,z+.6,'slWood',{f:{py:'slWood'}});SLD.parasols.push([x,RF,z,1.5,(x+z)&3]);for(const d of [-.95,.95])B(x+d-.22,RF,z-.22,x+d+.22,RF+.45,z+.22,'slBench',CV)}
    for(const [x,z] of [[-45.7,4.3],[-30.3,4.3],[-45.7,19.7],[-30.3,19.7]])B(x-.05,RF+.9,z-.05,x+.05,RF+2.3,z+.05,'slSteel',CV);
    str(-45.7,RF+2.2,4.3,-30.3,RF+2.2,4.3,.5);str(-45.7,RF+2.2,19.7,-30.3,RF+2.2,19.7,.5);str(-45.7,RF+2.2,4.3,-45.7,RF+2.2,19.7,.5);str(-30.3,RF+2.2,4.3,-30.3,RF+2.2,19.7,.5);
    LIGHT(-38,RF+2,12,'#ffd8a0',10,.4);
    for(const z of [7,12,17]){const x=-26;B(x-.6,0,z-.6,x+.6,.76,z+.6,'slWood',{f:{py:'slWood'}});SLD.parasols.push([x,0,z,1.5,z&3]);bench(x-1.1,z,'z');bench(x+1.1,z,'z')}}
  // ================= the hedge garden and its gazebo (west): two rings of hedge, their gaps out of line, two hedges across inside =================
  {const HG='slHedge',h=1.8;B(-57.6,0,-6,-53,h,-5.2,HG);B(-51,0,-6,-46,h,-5.2,HG);B(-57.6,0,19.2,-53,h,20,HG);B(-51,0,19.2,-46,h,20,HG);B(-57.6,0,-5.2,-56.8,h,19.2,HG);
    B(-46.8,0,-5.2,-46,h,0,HG);B(-46.8,0,2,-46,h,19.2,HG);
    B(-55,0,-1.4,-49,h,-.6,HG);B(-55,0,14.6,-49,h,15.4,HG);B(-55,0,-.6,-54.2,h,6,HG);B(-55,0,8,-54.2,h,14.6,HG);B(-49.8,0,-.6,-49,h,9.5,HG);B(-49.8,0,11.5,-49,h,14.6,HG);
    B(-54.2,0,2.6,-52,h,3.4,HG);B(-51.8,0,10.8,-49.8,h,11.6,HG);
    B(-54,0,5,-50,.3,9,'slPlank',{stair:1});for(const [x,z] of [[-53.8,5.2],[-50.2,5.2],[-53.8,8.8],[-50.2,8.8]])B(x-.1,.3,z-.1,x+.1,2.8,z+.1,'slWood');B(-52.2,2.3,6.8,-51.8,2.7,7.2,'slLamp',CV);
    bench(-53.3,7,'z');bench(-50.7,7,'z');LIGHT(-52,2.4,7,'#ffe0a8',7,.5);for(const [x,z] of [[-56,10],[-47.6,-3],[-52,17.4]])LIGHT(x,.9,z,'#c8ffd8',6,.3)}
  // ================= the pirate ship on its swing: the boat (step aboard from the platform), the A-frames, the axle =================
  {B(-49.4,0,25,-46.4,1.8,37,'slConc',{f:{py:'slPlank'}});stairs('z',-49.4,-46.4,21.8,25,0,1.8,6,'slConc',{f:{py:'slPlank'}});rail(-46.4,25,-46.34,37,1.8,1,'slSteel');rail(-49.4,37,-46.4,37.06,1.8,1,'slSteel');
    B(-52.6,.9,24.4,-49.4,2.2,37.6,'slShip',{f:{py:'slPlank'}});B(-52.6,2.2,24.4,-52.3,3,37.6,'slShip');for(const [a,b] of [[24.4,27],[29,33],[35,37.6]])B(-49.7,2.2,a,-49.4,3,b,'slShip');
    B(-52.6,2.2,24.4,-49.4,3.8,25.4,'slShip');B(-52.6,2.2,36.6,-49.4,3.8,37.6,'slShip');for(const z of [26.4,28.4,33.6,35.6])B(-52.3,2.2,z,-49.7,2.6,z+.4,'slSeat');
    B(-51.15,2.2,30.85,-50.85,8.6,31.15,'slWood',CV);B(-51.04,7.2,31.15,-50.96,8.4,33,'slBanner',CV);
    for(const x of [-54.6,-45.8]){for(const z of [24,38]){bar(x,0,z,x,12.4,31,.36,.36,'slSteelW');B(x-.3,0,z-.3,x+.3,1.5,z+.3,'slSteelW')}}bar(-55,12.4,31,-45.4,12.4,31,.5,.5,'slSteel');
    for(const x of [-52.4,-49.6])for(const z of [25.6,36.4])bar(x,12.4,31,x,2.8,z,.2,.3,'slRail');
    B(-49.2,0,21.2,-49,3.2,21.4,'slSteel');B(-50.8,2.2,21.42,-47.6,3.2,21.46,'slSignViking',CV);B(-47.8,1.8,35.2,-46.4,3.8,37,'slStuccoB');
    LIGHT(-51,6.5,31,'#ffb060',10,.45);LIGHT(-47.5,3.4,23.5,'#ff5ab4',8,.4)}
  // ================= backstage: the workshop (a spare cabin for the wheel in it), the containers =================
  {const W='slConc';wallZ(-12,-11.75,-56,-50.5,0,4.4,W,[]);wallZ(3.75,4,-56,-50.5,0,4.4,W,[]);wallX(-12,4,-50.75,-50.5,0,4.4,W,[[-8,-3,0,3.6],[0,1.6,0,2.3]]);
    B(-12.2,4.4,-56,4.2,4.7,-50.3,'slRoofM',{f:{ny:'slSteel'}});B(-11.75,-.01,-56,3.75,.01,-50.75,'slConc',CV);B(-12,2.8,-50.5,-8.4,3.6,-50.49,'slSignWork',CV);
    B(-11.6,0,-55.6,-8,.9,-54.8,'slWood',{f:{py:'slWood'}});B(-2,0,-55.8,3.6,2.4,-55.2,'slKitchen');B(-6.4,0,-55.6,-4.4,2.2,-53.6,'slGondola');B(1,0,-53,2.4,1.2,-51.6,'slWood');
    LIGHT(-4,3.9,-53.3,'#e8f0ff',8,.55);
    B(8,0,-55.6,14,2.6,-53.2,'slCont');B(14.4,0,-55.6,20.4,2.6,-53.2,'slContB');B(10,2.6,-55.6,16,5.2,-53.2,'slCont');B(22,0,-55,23.2,1.2,-53.8,'slWood');
    for(const x of [-20,25])lampP(x,-51,4.2,'#e8f0ff',10,.45)}
  // ================= lawns, trees, pines =================
  B(-24,0,-34,-17,.12,-26,'slGrass',{stair:1});B(17,0,-34,30,.12,-26,'slGrass',{stair:1});B(-35.6,0,-32,-29.4,.1,-10,'slGrass',{stair:1});B(46.6,0,-30,57,.12,-22.6,'slGrass',{stair:1});
  for(const [x,z,s] of [[-20,-30,1.1],[-22.5,-27,.95],[22,-30,1.05],[27,-28,1],[50,-28,1.1],[54,-24,1],[-28,-26,1],[-21,-14,1.05],[-24,-6,1],[24,2,1],[-40,26,1.05],[-34,24.5,.95],
      [-18,-44,1],[18,-44,1.05],[-36,2,1],[-28,0,1.1],[30,22,1],[36,-1,.95]])tree(x,z,s);
  for(const z of [-44,-36,-28,-20,-12,-3,8,16,30,37])pine(56.6,z,1+hash2(z,1,16801)*.25);for(const x of [33,39,45,51])pine(x,37.6,1+hash2(x,2,16802)*.2);
  for(const [x,z] of [[50,-26],[53,-28.4]]){B(x-.9,0,z-.4,x+.9,.76,z+.4,'slWood',{f:{py:'slWood'}});bench(x,z-.8,'x');bench(x,z+.8,'x')}
  // ================= who starts where =================
  MAP.spawns=[];for(const z of [29.5,35.5])for(const x of [-14,-11,-8.5,-6,6,8.5,11,14])MAP.spawns.push([x+rr(-.2,.2),z+rr(-.2,.2),0,rr(-.3,.3)]);
  MAP.zspawns=[[-50,-53,0],[-20,-53,0],[26,-52,0],[50,-53,0],[-56,-40,0],[56,-30,0],[56,0,0],[55,24,0],[-52,-3,0],[-56,36,0],[-14,44.5,0],[0,47.5,0],[14,45,0],[24,47,0],[-30,-8,0],[30,4,0]];
  MAP.camps=[
    {k:'castle',w:.14,p:[[-6,7.2,-30],[6,7.2,-30],[0,7.2,-27.6],[8,7.2,-37]],look:[0,1,-12]},
    {k:'coaster',w:.1,p:[[-40,4.2,-44.4],[-32,4.2,-44.4],[-36,4.7,-46.4]],look:[-36,1,-30]},
    {k:'gondola',w:.04,p:[[40,1.3,-46.2]],look:[40,1,-30]},
    {k:'wheel',w:.06,p:[[36,1.2,-40],[44,1.2,-40]],look:[40,1,-28]},
    {k:'coffin',w:.06,p:[[-55,0,-28.6],[-53,0,-25.6]],look:[-54.5,1,-22]},
    {k:'terrace',w:.1,p:[[-44,4.5,6],[-32,4.5,6],[-38,4.5,17.5]],look:[-24,1,12]},
    {k:'shopW',w:.06,p:[[-15,4.7,12],[-12,4.7,21.6]],look:[0,1,17]},
    {k:'shopE',w:.06,p:[[15,4.7,12],[12,4.7,21.6]],look:[0,1,17]},
    {k:'carousel',w:.05,p:[[-2.4,.45,-5],[2.4,.45,-5]],look:[0,1,10]},
    {k:'bumper',w:.05,p:[[36,.15,-14],[43,.15,-19]],look:[25,1,-14]},
    {k:'ship',w:.06,p:[[-51,2.2,30],[-51,2.2,32.2]],look:[-40,1,30]},
    {k:'gazebo',w:.05,p:[[-52,.3,7]],look:[-52,1,0]},
    {k:'drop',w:.03,p:[[45,1.4,10.4]],look:[45,1,0]},
    {k:'hall',w:.04,p:[[0,.5,-38],[8,0,-38]],look:[0,1,-27]},
    {k:'workshop',w:.03,p:[[-6,0,-52.6]],look:[-5,1,-50]},
    {k:'booths',w:.03,p:[[33,0,31],[45,0,31]],look:[40,1,22]},
  ];
  MAP.spawnYaw=null;
  // a clear night: the moon high in the south-west, cold; the park's own lights do the rest
  MAP.moon={d:new THREE.Vector3(-.42,.78,.46).normalize(),c:new THREE.Color('#a8b0ff'),i:.6};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.025);cam.position.set(-6+a*14,7.5+Math.sin(t*.04)*.6,26);cam.lookAt(4+a*8,6.5,-22)}}
// the ground beyond the fence: the town's streets at the park's level, the hills rising behind it (north the most)
function slOut(x,z){return Math.max(-58.6-x,x-58.6,-56.6-z,z-50.6)}
function slGround(x,z){const e=slOut(x,z);if(e<-.01)return -14;const f=clamp((e-16)/90,0,1),n=clamp((-62-z)/40,0,1),s=z>20?.35:1;return -.05+(f*f*28+n*10+Math.max(0,fbm(x/50,z/50,16901,4,0)-.35)*36*f)*s}
// ---------- the meshes boxes cannot make: the carousel, the fountain, the ferris wheel, the coaster's track, the castle's cones, trees,
// parasols, the strings of bulbs, the balloons, the pirate ship's prow and stern; the hills, the forest and the town ----------
function slMesh(scene){const D=(MAP.moon&&MAP.moon.d)||new THREE.Vector3(0,1,0),K=meshKit(scene),{acc,add,mk,lit}=K,probeAt=sunProbe(D);
  const sunK=(nx,ny,nz)=>Math.max(0,nx*D.x+ny*D.y+nz*D.z),A0=MAP.ambOut||new THREE.Color('#3a3658'),SC=MAP.moon.c,SI=MAP.moon.i;
  // a light read once at a point (no occlusion: the probe), shaded by the normal; or a fixed glow for what lights itself
  const pl=(x,y,z,k0)=>{const L=lightAt(x,y,z,0,1,0,true);return (px,py,pz,nx,ny,nz)=>{const k=(k0||1)*(.7+.25*ny+.35*sunK(nx,ny,nz));return [L[0]*k,L[1]*k,L[2]*k]}};
  const glow=()=>[.3,.3,.32];
  const emis=(m,e)=>{m.material.uniforms.uEmis.value=e;return m};
  const flip=g=>{const q=g.index?g.toNonIndexed():g;for(const k of ['position','normal','uv']){const a=q.attributes[k];if(!a)continue;const s=a.itemSize;for(let i=0;i<a.count;i+=3)for(let j=0;j<s;j++){const t=a.array[(i+1)*s+j];a.array[(i+1)*s+j]=a.array[(i+2)*s+j];a.array[(i+2)*s+j]=t}}
    const n=q.attributes.normal;for(let i=0;i<n.array.length;i++)n.array[i]=-n.array[i];return q};
  // a box from p to q, w wide and h tall (turned along its length), into the accumulator
  const _X=new THREE.Vector3(),_Y=new THREE.Vector3(),_Z=new THREE.Vector3(),_U=new THREE.Vector3(0,1,0),_M=new THREE.Matrix4();
  const seg=(A,p,q,w,h,L,us)=>{_X.set(q[0]-p[0],q[1]-p[1],q[2]-p[2]);const len=_X.length();if(len<.005)return;_X.divideScalar(len);_Z.crossVectors(_X,_U);if(_Z.lengthSq()<1e-6)_Z.set(0,0,1);_Z.normalize();_Y.crossVectors(_Z,_X).normalize();
    const g=new THREE.BoxGeometry(len,h,w);_M.makeBasis(_X,_Y,_Z).setPosition((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2);g.applyMatrix4(_M);add(A,g,us||Math.max(1,len/1.2),1,L||pl((p[0]+q[0])/2,(p[1]+q[1])/2+.2,(p[2]+q[2])/2))};
  const bulbUV=(g,k)=>{const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,(k*4+2)/32,.5);return g};
  // ---- trees: a trunk, limbs, a crown of leaf clouds (dead ones: crooked bare limbs) ----
  {const T=acc(),L=acc();for(const [x,y,z,s,dead] of SLD.trees){const seed=Math.round(x*13+z*7),Lc=probeAt(x,y+3.8*s,z,1.4*s),Lt=probeAt(x,y+1.2*s,z,.6*s);
      const lf=(Lb,k0)=>(px,py,pz,nx,ny,nz)=>{const k=k0*(.7+.4*sunK(nx,ny,nz)+.1*ny);return [Lb[0]*k,Lb[1]*k,Lb[2]*k]};
      const tg=new THREE.CylinderGeometry(.12*s,.2*s,3*s,7);tg.translate(x,y+1.5*s,z);add(T,tg,1,2,lf(Lt,.8));
      for(let i=0;i<(dead?6:4);i++){const a=hash2(seed,i,16811)*TAU,len=(1.3+hash2(seed,i+9,16812)*(dead?1.4:.9))*s,ty=y+(2+hash2(seed,i+4,16813)*1.1)*s;
        const lg=new THREE.CylinderGeometry(.04*s,.09*s,len,5);lg.translate(0,len/2,0);lg.rotateZ(-(dead?.6+hash2(seed,i,16814)*.6:.8));lg.rotateY(a);lg.translate(x,ty,z);add(T,lg,1,1,lf(Lt,.8))}
      if(dead)continue;
      for(let i=0;i<6;i++){const a=hash2(seed,i+20,16815)*TAU,r=(i?1.1+hash2(seed,i+30,16816)*.8:0)*s,cs=(1.1+hash2(seed,i+40,16817)*.55)*s,cy=y+(3.4+hash2(seed,i+50,16818)*1)*s+(i?0:.4*s);
        const g=new THREE.IcosahedronGeometry(cs,1),p=g.attributes.position;for(let k=0;k<p.count;k++){const vx=p.getX(k),vy=p.getY(k),vz=p.getZ(k),j=.82+hash2(Math.round(vx*9+seed),Math.round(vy*9+vz*5+i),16819)*.32;p.setXYZ(k,vx*j,vy*j*.8,vz*j)}
        g.computeVertexNormals();g.translate(x+Math.cos(a)*r,cy,z+Math.sin(a)*r);add(L,g,1.6,1.6,lf(Lc,.9))}}
    if(T.P.length)mk(T,'slBark');if(L.P.length)mk(L,'slLeaf')}
  pineMeshes(SLD.pines,D,K,probeAt,'slBark','slPine');barMeshes(SLD.bars,D,K,probeAt);
  // ---- the carousel (at 0, -5): the deck and its skirt, the mirrored column, the poles and the horses, the canopy, its bulbs ----
  {const cx=0,cz=-5,Sk=acc(),Dk=acc(),Mi=acc(),Ce=acc(),Va=acc(),Ca=acc(),Br=acc(),Ho=acc(),Sa=acc(),Go=acc();
    let g=new THREE.CylinderGeometry(7.2,7.2,.45,40,1,true);g.translate(cx,.225,cz);add(Sk,g,12,1,pl(cx,.6,cz+7.5));
    g=new THREE.CircleGeometry(7.2,40);g.rotateX(-Math.PI/2);g.translate(cx,.451,cz);add(Dk,g,3,3,pl(cx+4.6,1.2,cz+.4));
    g=new THREE.CylinderGeometry(1.3,1.3,4.25,20,1,true);g.translate(cx,2.575,cz);add(Mi,g,4,2,glow);
    g=new THREE.CircleGeometry(8,40);g.rotateX(Math.PI/2);g.translate(cx,4.7,cz);add(Ce,g,3,3,pl(cx+4.6,4,cz+.4));
    g=new THREE.CylinderGeometry(8,8,.75,48,1,true);g.translate(cx,4.675,cz);add(Va,g,4,1,glow);
    g=new THREE.ConeGeometry(8,2.7,48,1,true);g.translate(cx,5.05+1.35,cz);add(Ca,g,2,1,(px,py,pz,nx,ny,nz)=>{const l=sunK(nx,ny,nz);return [A0.r*.9+SC.r*SI*l*.8+.08,A0.g*.9+SC.g*SI*l*.8+.06,A0.b*.9+SC.b*SI*l*.8+.04]});
    g=new THREE.SphereGeometry(.32,10,8);g.translate(cx,7.85,cz);add(Go,g,1,1,glow);g=new THREE.CylinderGeometry(.03,.03,1.4,5);g.translate(cx,8.6,cz);add(Go,g,1,1,glow);
    // the horses: on each pole, prancing, half of them up and half down; a body, a neck, a head, four legs, a tail, a saddle, a gilt mane
    const parts=[[1,.42,.34,0,0,0,0],[.22,.52,.2,.42,.33,0,.5],[.42,.2,.18,.64,.58,0,-.3],[.08,.5,.08,.36,-.38,.1,-.7],[.08,.5,.08,.36,-.38,-.1,-.5],[.08,.48,.08,-.4,-.42,.1,.35],[.08,.48,.08,-.4,-.42,-.1,.25],[.08,.42,.08,-.58,-.02,0,.9]];
    const Mx=new THREE.Matrix4(),Ml=new THREE.Matrix4(),Xv=new THREE.Vector3(),Zv=new THREE.Vector3();
    for(let i=0;i<12;i++)for(const [r,o] of [[5.6,0],[3.9,.5]]){const a=(i+o)/12*TAU,px=cx+Math.cos(a)*r,pz=cz+Math.sin(a)*r,up=((i+(o?1:0))%2)?.22:-.12,hy=1.2+up,L=pl(px+Math.cos(a)*.7,1.4,pz+Math.sin(a)*.7);
      g=new THREE.CylinderGeometry(.045,.045,4.25,6);g.translate(px,2.575,pz);add(Br,g,1,2,glow);
      Xv.set(-Math.sin(a),0,Math.cos(a));Zv.set(-Xv.z,0,Xv.x);Mx.makeBasis(Xv,_U,Zv).setPosition(px,hy,pz);
      for(const [w,h,d,ox,oy,oz,rz] of parts){const b=new THREE.BoxGeometry(w,h,d);b.applyMatrix4(Ml.makeRotationZ(rz));b.translate(ox,oy,oz);b.applyMatrix4(Mx);add(Ho,b,1,1,L)}
      let b=new THREE.BoxGeometry(.38,.08,.4);b.translate(-.05,.24,0);b.applyMatrix4(Mx);add(Sa,b,1,1,L);b=new THREE.BoxGeometry(.36,.07,.07);b.applyMatrix4(Ml.makeRotationZ(.9));b.translate(.46,.46,0);b.applyMatrix4(Mx);add(Go,b,1,1,L)}
    mk(Sk,'slSkirt');mk(Dk,'slDeck');emis(mk(Mi,'slMirror'),.4);mk(Ce,'slCeilC');emis(mk(Va,'slValance'),1.05);mk(Ca,'slCanopy');emis(mk(Br,'slBrass'),.25);mk(Ho,'slHorse');mk(Sa,'slSaddle');emis(mk(Go,'slGold'),.3)}
  // ---- the fountain (at 0, 32): the rim, the water, the column and its two bowls ----
  {const cx=0,cz=32,St=acc(),Wa=acc();let g=new THREE.CylinderGeometry(4.25,4.25,.5,40,1,true);g.translate(cx,.25,cz);add(St,g,8,1,pl(cx,.8,cz+4.6));
    g=flip(new THREE.CylinderGeometry(3.8,3.8,.5,40,1,true));g.translate(cx,.25,cz);add(St,g,8,1,pl(cx,.8,cz));g=new THREE.RingGeometry(3.8,4.25,40);g.rotateX(-Math.PI/2);g.translate(cx,.5,cz);add(St,g,4,1,pl(cx,1,cz));
    g=new THREE.CircleGeometry(3.8,40);g.rotateX(-Math.PI/2);g.translate(cx,.3,cz);add(Wa,g,2.5,2.5,pl(cx,.8,cz));
    for(const [r0,r1,h,y] of [[.65,.5,2.6,1.3],[1.2,2,.35,1.225],[.6,1.1,.3,2.45]]){g=new THREE.CylinderGeometry(r1,r0,h,20);g.translate(cx,y,cz);add(St,g,2,1,pl(cx,y+.6,cz+2.4))}
    for(const [r,y] of [[1.85,1.401],[.95,2.601]]){g=new THREE.CircleGeometry(r,20);g.rotateX(-Math.PI/2);g.translate(cx,y,cz);add(Wa,g,1,1,pl(cx,y+.5,cz))}
    g=new THREE.SphereGeometry(.22,10,8);g.translate(cx,2.85,cz);add(St,g,1,1,pl(cx,3.2,cz));mk(St,'slStoneW');emis(mk(Wa,'slWater'),.14)}
  // ---- the ferris wheel (hub at 40, 18, -46.2): two rims, spokes, the hub, the A-frames, fifteen cabins (the sixteenth is the boxes'),
  // bulbs round the rims and light along the spokes ----
  {const hx=40,hy=18,hz=-46.2,R=14.5,Ri=13,St=acc(),Gd=acc(),Bu=acc(),Le=acc(),L0=pl(hx,hy,hz-3),Lb=pl(hx,5,hz+3);
    const P=(r,a,z)=>[hx+Math.cos(a)*r,hy+Math.sin(a)*r,z];
    for(const z of [hz-1.4,hz+1.4]){for(let i=0;i<48;i++){const a0=i/48*TAU,a1=(i+1)/48*TAU;seg(St,P(R,a0,z),P(R,a1,z),.22,.22,L0);seg(St,P(Ri,a0,z),P(Ri,a1,z),.14,.14,L0)}
      for(let i=0;i<16;i++){const a=i/16*TAU;seg(St,P(1.1,a,z),P(R,a,z),.16,.16,L0);seg(St,P(Ri,a,z),P(R,(i+.5)/16*TAU,z),.1,.1,L0);
        const k=i%8;for(let j=1;j<12;j++){const r=1.4+j*1.05;const b=bulbUV(new THREE.BoxGeometry(.1,.1,.1),k),q=P(r,a,z+(z<hz?-.12:.12));b.translate(q[0],q[1],q[2]);add(Bu,b,1,1,glow)}}
      for(let i=0;i<72;i++){const a=i/72*TAU,q=P(R+.18,a,z+(z<hz?-.1:.1)),b=bulbUV(new THREE.BoxGeometry(.14,.14,.14),[0,1,3,2][i%4]);b.translate(q[0],q[1],q[2]);add(Bu,b,1,1,glow)}}
    for(let i=0;i<16;i++){const a=i/16*TAU;seg(St,P(R,a,hz-1.4),P(R,a,hz+1.4),.14,.14,L0)}
    let g=new THREE.CylinderGeometry(1.2,1.2,3.6,16);g.rotateX(Math.PI/2);g.translate(hx,hy,hz);add(St,g,2,1,L0);
    for(const [z0,z1] of [[-49.4,-48],[-43,-44.4]])for(const x of [31.5,48.5]){seg(Le,[x,0,z0],[hx,hy,z1],.5,.5,Lb,8)}
    for(const [z,y] of [[-48.7,6],[-48.7,12],[-43.7,6],[-43.7,12]]){const dx=8.5*(1-y/18);seg(Le,[hx-dx,y,z],[hx+dx,y,z],.3,.3,Lb)}
    // the cabins: hung from their pivots on the rim (one colour each), a hanger, a light inside
    for(let i=0;i<16;i++){const a=i/16*TAU-Math.PI/2;if(i===0)continue;const q=P(14,a,hz),k=i%4,b=new THREE.BoxGeometry(2,2.1,2),u=b.attributes.uv;for(let j=0;j<u.count;j++)u.setX(j,(k+.06+u.getX(j)*.88)/4);
      b.translate(q[0],q[1]-1.75,q[2]);add(Gd,b,1,1,pl(q[0],q[1]-1,q[2]+2,.9));seg(St,[q[0],q[1]-.7,q[2]],[q[0],q[1],q[2]],.08,.08,L0);
      const lb=bulbUV(new THREE.BoxGeometry(.3,.12,.3),0);lb.translate(q[0],q[1]-.75,q[2]);add(Bu,lb,1,1,glow)}
    {const q=P(14,-Math.PI/2,hz);seg(St,[q[0],3.45,q[2]],[q[0],q[1],q[2]],.1,.1,L0)}
    mk(St,'slSteelW');mk(Le,'slSteelW');mk(Gd,'slGondola');emis(mk(Bu,'slBulb'),1.5)}
  // ---- the coaster's track: two rails on a spine, ties across; a bulb every metre and a half along its outer side ----
  {const tr=SLD.track||[],Ra=acc(),Sp=acc(),Bu=acc(),N=tr.length;
    for(let i=0;i<N;i++){const a=tr[i],b=tr[(i+1)%N],c=tr[(i+N-1)%N];const tx=b[0]-c[0],tz=b[2]-c[2],tl=Math.hypot(tx,tz)||1,nx=-tz/tl,nz=tx/tl,L=pl(a[0],a[1]+.3,a[2]);
      const nb=tr[(i+2)%N],tx2=nb[0]-a[0],tz2=nb[2]-a[2],tl2=Math.hypot(tx2,tz2)||1,mx=-tz2/tl2,mz=tx2/tl2;
      for(const s of [-.55,.55])seg(Ra,[a[0]+nx*s,a[1],a[2]+nz*s],[b[0]+mx*s,b[1],b[2]+mz*s],.1,.1,L,1);seg(Sp,[a[0],a[1]-.4,a[2]],[b[0],b[1]-.4,b[2]],.3,.3,L,1);
      if(i%2===0){seg(Ra,[a[0]+nx*.6,a[1]-.05,a[2]+nz*.6],[a[0]-nx*.6,a[1]-.05,a[2]-nz*.6],.12,.08,L,1);seg(Sp,[a[0],a[1]-.1,a[2]],[a[0],a[1]-.4,a[2]],.12,.12,L,1)}
      if(i%3===0){const k=[1,2,3,4][Math.floor(i/3)%4],q=bulbUV(new THREE.BoxGeometry(.13,.13,.13),k);q.translate(a[0]+nx*.78,a[1]-.25,a[2]+nz*.78);add(Bu,q,1,1,glow)}}
    if(N){mk(Ra,'slSteelW');mk(Sp,'slRail');emis(mk(Bu,'slBulb'),1.45)}}
  // ---- the castle's cones and spire, gilt balls and pennants on them; the haunted house's tower; the gazebo's roof ----
  {const Rf=acc(),Go=acc(),Fl=acc(),Hn=acc();const cone=(x,y,z,r,h,A,us)=>{const g=new THREE.ConeGeometry(r,h,16,1,true);g.translate(x,y+h/2,z);
      add(A,g,us||4,2,(px,py,pz,nx,ny,nz)=>{const l=sunK(nx,ny,nz);return [A0.r*.85+SC.r*SI*l*.9,A0.g*.85+SC.g*SI*l*.9,A0.b*.85+SC.b*SI*l*.9]})};
    const top=(x,y,z)=>{let g=new THREE.SphereGeometry(.24,8,6);g.translate(x,y+.2,z);add(Go,g,1,1,glow);g=new THREE.CylinderGeometry(.03,.03,1.6,5);g.translate(x,y+1,z);add(Go,g,1,1,glow);
      g=new THREE.BoxGeometry(1.2,.6,.03);g.translate(x+.6,y+1.45,z);add(Fl,g,1,1,pl(x,y,z))};
    for(const x0 of [-15.5,11]){cone(x0+2.25,13.3,-27.25,3.3,6.6,Rf);top(x0+2.25,19.9,-27.25);cone(x0+2.25,11.8,-39.25,3.3,5.6,Rf);top(x0+2.25,17.4,-39.25)}
    cone(0,15.9,-37.25,4.1,8.4,Rf,6);top(0,24.3,-37.25);cone(-39.6,12.3,-30.4,2.4,4.6,Hn,3);cone(-52,2.8,7,3.1,1.5,Rf,3);
    mk(Rf,'slRoofB');emis(mk(Go,'slGold'),.35);mk(Fl,'slBanner');mk(Hn,'slHaunt')}
  // ---- parasols (the food court's, the shops' terraces) ----
  {const Po=acc(),Cs=[acc(),acc(),acc()],TX=['slAwning','slAwningB','slTentY'];for(const [x,y,z,r,c] of SLD.parasols||[]){const L=pl(x,y+1.6,z),k=Math.abs(c|0)%3;
      let g=new THREE.CylinderGeometry(.035,.035,2.4,6);g.translate(x,y+1.2,z);add(Po,g,1,1,L);g=new THREE.ConeGeometry(r,.55,12,1,true);g.translate(x,y+2.3,z);add(Cs[k],g,3,1,L);
      g=flip(new THREE.ConeGeometry(r,.55,12,1,true));g.translate(x,y+2.29,z);add(Cs[k],g,3,1,L)}
    if(Po.P.length){mk(Po,'slSteel');Cs.forEach((A,i)=>{if(A.P.length)mk(A,TX[i])})}}
  // ---- strings of bulbs (sagging between their ends) ----
  {const Wi=acc(),Bu=acc();for(const [x0,y0,z0,x1,y1,z1,sag,c] of SLD.strings){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(2,Math.ceil(L/.55));let pv=null;
      for(let i=0;i<=n;i++){const t=i/n,p=[x0+(x1-x0)*t,y0+(y1-y0)*t-sag*4*t*(1-t),z0+(z1-z0)*t];if(pv)seg(Wi,pv,p,.02,.02,glow,1);pv=p;
        if(i>0&&i<n){const b=bulbUV(new THREE.BoxGeometry(.09,.13,.09),c>=0?c:[0,1,3,2,4,5][i%6]);b.translate(p[0],p[1]-.08,p[2]);add(Bu,b,1,1,glow)}}}
    if(Bu.P.length){mk(Wi,'slWire');emis(mk(Bu,'slBulb'),1.5)}}
  // ---- the balloons over the cart on the main street: their own mesh, bobbing (slTick) ----
  {const bl=SLD.balloons;SLD.bm=null;if(bl){const Ba=acc(),Wi=acc();for(let i=0;i<9;i++){const a=i/9*TAU,r=i?.45+hash2(i,1,16831)*.2:0,x=Math.cos(a)*r,z=Math.sin(a)*r,y=2.1+hash2(i,2,16832)*.9;
        const g=new THREE.SphereGeometry(.24,10,8);g.scale(1,1.2,1);bulbUV(g,i%8);g.translate(x,y,z);add(Ba,g,1,1,pl(bl[0],bl[1]+2,bl[2],1.2));seg(Wi,[0,.1,0],[x,y-.28,z],.012,.012,glow,1)}
      // (built round the cart's top, so the bunch moves as one)
      const m1=mk(Ba,'slBalloon'),m2=mk(Wi,'slWire');for(const m of [m1,m2]){m.matrixAutoUpdate=true;m.position.set(bl[0],bl[1],bl[2])}emis(m1,.25);SLD.bm=[m1,m2]}}
  // ---- the pirate ship's prow and stern rising in curves, a gilt rail, round shields along each side ----
  {const Sh=acc(),Go=acc(),Sd=acc(),L=pl(-51,3,31);for(const [z0,dz] of [[24.4,-1],[37.6,1]]){let p=[-51,3.6,z0];for(let i=0;i<5;i++){const q=[-51,p[1]+.55,p[2]+dz*(.5-i*.08)];seg(Sh,p,q,.55-i*.06,.7-i*.08,L,1);p=q}
      const g=new THREE.SphereGeometry(.28,8,6);g.translate(p[0],p[1]+.25,p[2]);add(Go,g,1,1,glow)}
    for(const x of [-52.62,-49.38]){seg(Go,[x,3,24.4],[x,3,37.6],.06,.08,L,6);for(let i=0;i<6;i++){const z=26+i*2.2,g=new THREE.CircleGeometry(.42,12);if(x<-51)g.rotateY(-Math.PI/2);else g.rotateY(Math.PI/2);g.translate(x+(x<-51?-.02:.02),2.6,z);bulbUV(g,[7,3,2,1][i%4]);add(Sd,g,1,1,L)}}
    mk(Sh,'slShip');emis(mk(Go,'slGold'),.3);mk(Sd,'slBalloon')}
  // ---- the hills and the forest beyond the fence; the town's blocks to the south and east ----
  forestMesh(K,slGround,slOut,D,'slPine',{seed:16951,e0:24,e1:120,n:950});hillMesh(scene,slGround,'slHill',D,4.8,81,-4.8*40);
  {const A=acc();const blk=(x0,z0,x1,z1,h)=>{const g=new THREE.BoxGeometry(x1-x0,h,z1-z0);g.translate((x0+x1)/2,h/2-.05,(z0+z1)/2);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;
      for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i))>.5,ay=Math.abs(n.getY(i))>.5;u.setXY(i,(ax?p.getZ(i):p.getX(i))/12,(ay?p.getZ(i):p.getY(i))/8.4)}add(A,g,1,1,()=>[A0.r*.6,A0.g*.6,A0.b*.6])};
    for(let i=0;i<8;i++)blk(-110+i*28,78+hash2(i,1,16961)*16,-94+i*28,90+hash2(i,1,16961)*16,18+hash2(i,2,16962)*26);for(let i=0;i<3;i++)blk(96+hash2(i,3,16963)*10,10+i*26,110+hash2(i,3,16963)*10,24+i*26,16+hash2(i,4,16964)*18);
    if(A.P.length)emis(mk(A,'slHouse'),.6)}}
// the park at night going on by itself: the balloons bob, the fountain plays, the carousel's music box goes round
function slTick(dt){if(MAP.id!=='starlight'||!R.cam)return;const t=(G&&G.t)||0,c=R.cam.position;
  if(SLD.bm)for(const m of SLD.bm){m.position.y=SLD.balloons[1]+Math.sin(t*1.3)*.08;m.rotation.y=Math.sin(t*.45)*.18;m.rotation.z=Math.sin(t*.8)*.03}
  if(Math.hypot(c.x,c.z-32)<40){SLD.drip+=dt*34;while(SLD.drip>=1){SLD.drip--;const up=Math.random()<.4,a=Math.random()*TAU,r=up?1.1:2.05,y=up?2.62:1.42;
    FX.spawn({x:Math.cos(a)*r,y,z:32+Math.sin(a)*r,vx:Math.cos(a)*rr(.25,.5),vy:rr(-.1,.15),vz:Math.sin(a)*rr(.25,.5),life:up?.62:.5,s0:.035,s1:.025,r:.62,g:.8,b:.92,a:.7,f:4,grav:1.6})}}
  SLD.mbox-=dt;if(SLD.mbox<=0){SLD.mbox=rr(11,15);if(Math.hypot(c.x,c.z+5)<46&&typeof AU!=='undefined'&&AU.at)AU.at('slmbox',0,2.6,-5,{vol:.55,range:46})}}
{const nu=nyUpdate;nyUpdate=function(dt){nu(dt);try{slTick(dt)}catch(e){console.error(e)}}}
MAPDEFS.starlight={n:['별빛랜드','Starlight Land'],gside:'slPave',d:['문 닫은 밤의 놀이공원 별빛랜드. 불은 아무도 끄지 않았다 — 정문 위 네온, 회전목마 지붕의 전구, 관람차 바퀴와 코스터 선로가 아직 빛나고 오르골 왈츠가 돈다. 성(안쪽 계단으로 성벽 위 옥상까지), 4.2 m 승강장의 롤러코스터, 한 칸 들어갈 수 있는 관람차, 방 아홉 개짜리 유령의 집(관이 놓인 막다른 방), 생울타리 정원, 옥상 테라스가 있는 푸드코트와 상점들, 바이킹, 범퍼카, 드롭타워, 게임 부스.',
    'Starlight Land, an amusement park shut for the night with nobody to switch its lights off: the neon over the gate, the bulbs round the carousel’s canopy, the ferris wheel and the coaster’s track still glowing, a music box still playing its waltz. The castle (a stair inside up to its battlements), the roller coaster’s platform 4.2 m up, the one ferris-wheel cabin you can climb into, a haunted house of nine rooms (one a dead end full of coffins), the hedge garden, the food court and the shops with terraces on their roofs, the pirate ship, the bumper cars, the drop tower, the game booths.'],
  env:{sky:1,skyTex:'slSky',halo:'#8a7ac8',rain:0,storm:0,fog:'#1c1a30',fogD:.0105,bloomThr:.68,ambOut:'#4c4878',ambIn:'#2c2836',boAmb:.5},
  bounds:[-59,-57,59,50.6],probeY:[.9,2.4,4.5,5.6,7.8,9.6],mini:[3.6,6.6],miniName:['1F','2F','RF'],tex:bakeParkTex,build:buildPark,mesh:slMesh};

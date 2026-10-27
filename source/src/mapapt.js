'use strict';
// ============ Map "은행나무 아파트 Ginkgo Apartments" (v7.5): an apartment complex on an autumn afternoon, emptied by the evacuation ============
// An original map (no reference). North: 101동, a ten-storey corridor block on pilotis — the ground floor open between columns, two
// stair cores at the ends, the open-air corridors of 2F and 3F along its south face (two flats on 2F knocked into one, one on 3F open),
// a builders' stair in the scaffold of the half-done repainting up to the middle of the 2F corridor, an elevator lobby with the stair
// down to the car park. East: the shopping arcade (상가) — a mini-mart, a chicken shop and a laundry
// below, a taekwondo studio and a study room above, a roof up through the stair hut, a fire escape at the back. Middle: the garden
// with ginkgo trees, a playground with a play tower, a wisteria pergola, exercise machines and the glass kiosk of the car-park stair.
// Under the garden: the underground car park (B1), entered down the ramp from the north road in the west, by the kiosk and by the lobby
// stair. West: the recycling shed and the senior centre (경로당), 102동 beyond the site wall. Outside: the north road behind the
// pilotis and the south road past the gate, both closed off by the quarantine — the zombies come from there.
// Every texture is painted on first load. The sun is low in the south-west (an autumn afternoon), so the tall blocks throw their shadows
// out of the garden, to the north-east.
Object.assign(MATS,{
  apAsph:{t:'apAsph',s:3,k:'stone',cs:1},apMarkW:{t:'apMarkW',s:1,k:'stone'},apMarkY:{t:'apMarkY',s:1,k:'stone'},apGrass:{t:'apGrass',s:3,k:'soft',cs:1},
  apPaver:{t:'apPaver',s:2,k:'stone',cs:1},apWalk:{t:'apWalk',s:2,k:'stone',cs:1},apRubber:{t:'apRubber',s:2,k:'soft',cs:1},apSand:{t:'apSand',s:2,k:'soft',cs:1},
  apWall:{t:'apWall',s:3.6,vo:0,sv:3.6,k:'stone'},apCorrF:{t:'apCorrF',s:5.25,uo:.5714,vo:0,sv:3.6,k:'stone',cs:2},apBalc:{t:'apBalc',s:5.25,uo:.4286,vo:0,sv:3.6,k:'stone',cs:2},
  apEnd:{t:'apEnd',uv:'box',k:'stone',cs:2},apEnd102:{t:'apEnd102',uv:'box',k:'stone',cs:2},apUnitA:{t:'apUnitA',uv:'box',k:'stone'},apUnitB:{t:'apUnitB',uv:'box',k:'stone'},
  apPara:{t:'apPara',s:2,vo:0,sv:1.1,k:'stone'},apCorrFl:{t:'apCorrFl',s:2,k:'stone'},apLobbyF:{t:'apLobbyF',s:1.6,k:'stone'},apMail:{t:'apMail',uv:'box',k:'metal'},
  apElev:{t:'apElev',uv:'box',k:'metal'},apInWall:{t:'apInWall',s:2,vo:0,sv:2.7,k:'soft'},apFloorW:{t:'apFloorW',s:2,k:'wood'},apKitch:{t:'apKitch',uv:'boxV',s:1.2,k:'wood'},
  apSofa:{t:'apSofa',s:1,k:'soft'},apGlassT:{t:'apGlassT',uv:'box',k:'glass'},apGlassB:{t:'apGlassB',uv:'box',emis:.08,k:'glass'},apConc:{t:'apConc',s:2.4,k:'stone'},
  apSignMart:{t:'apSignMart',uv:'box',emis:.55,k:'metal'},apSignChick:{t:'apSignChick',uv:'box',emis:.55,k:'metal'},apSignWash:{t:'apSignWash',uv:'box',emis:.5,k:'metal'},
  apSignDojang:{t:'apSignDojang',uv:'box',emis:.45,k:'metal'},apSignAcad:{t:'apSignAcad',uv:'box',emis:.45,k:'metal'},apSignB1:{t:'apSignB1',uv:'box',emis:.6,k:'metal'},
  apSignExit:{t:'apSignExit',uv:'box',emis:.9,k:'metal'},apSignSenior:{t:'apSignSenior',uv:'box',emis:.2,k:'wood'},apSignGate:{t:'apSignGate',uv:'box',k:'stone'},
  apSignQ:{t:'apSignQ',uv:'box',emis:.15,k:'metal'},apBanner:{t:'apBanner',uv:'box',k:'soft'},
  apMat:{t:'apMat',s:2,k:'soft'},apMirror:{t:'apMirror',uv:'box',emis:.2,k:'glass'},apShelf:{t:'apShelf',s:1.4,k:'metal'},apFridge:{t:'apFridge',uv:'box',emis:.7,k:'glass'},
  apPark:{t:'apPark',s:3,k:'stone'},apParkW:{t:'apParkW',s:3,vo:-3.6,sv:3.3,k:'stone',cs:1},apPillar:{t:'apPillar',uv:'boxV',s:.8,k:'stone'},apRamp:{t:'apRamp',s:2,k:'stone'},
  apPlayR:{t:'apPlayR',s:1,k:'metal'},apPlayY:{t:'apPlayY',s:1,k:'metal'},apPlayB:{t:'apPlayB',s:1,k:'metal'},apPlayG:{t:'apPlayG',s:1,k:'metal'},
  apBark:{t:'apBark',s:1,k:'wood'},apGinkgo:{t:'apGinkgo',s:1.6,k:'soft',cs:1},apHedge:{t:'apHedge',s:1.4,k:'soft',cs:1},apWist:{t:'apWist',s:1.4,k:'soft'},apWood:{t:'apWood',s:1,k:'wood'},
  apBooth:{t:'apBooth',s:2,vo:0,sv:2.8,k:'stone'},apBrick:{t:'apBrick',s:2,k:'stone',cs:1},apShutter:{t:'apShutter',uv:'boxV',s:2,k:'metal'},apTower:{t:'apTower',s:6,vo:0,sv:3,k:'stone',cs:4},
  apLow:{t:'apLow',s:4,vo:0,sv:3,k:'stone',cs:2},apRoof:{t:'apRoof',s:3,k:'stone',cs:2},apBinG:{t:'apBinG',uv:'boxV',s:1,k:'metal'},apBinB:{t:'apBinB',uv:'boxV',s:1,k:'metal'},apBinY:{t:'apBinY',uv:'boxV',s:1,k:'metal'},apBinR:{t:'apBinR',uv:'boxV',s:1,k:'metal'},apCeil:{t:'apCeil',s:1.2,emis:.08,k:'stone'},
  apLampF:{t:'apLampF',uv:'box',emis:1.4,k:'glass'},apWater:{t:'apWater',s:2,emis:.05,k:'glass'},
  apAsphF:{t:'apAsph',s:3,k:'stone',cs:10},apGrassF:{t:'apGrass',s:3,k:'soft',cs:10},apCanvas:{t:'apCanvas',s:1.5,k:'soft'},apNet:{t:'apNet',s:1.2,k:'soft',cs:1},apBarrier:{t:'barrier',uv:'boxV',s:2,k:'stone',cs:1},apFence:{t:'fence',s:2,k:'metal',cs:2},apSignWork:{t:'apSignWork',uv:'box',emis:.1,k:'metal'},apLeafF:{t:'apLeafF',uv:'box',k:'soft'},
});
// ---------- textures ----------
const AP_FONT='"Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
// the sky: a clear autumn afternoon — deep blue overhead, warm haze low down, the sun low in the south-west (u .153), a city of
// apartment blocks on the horizon all round, a mountain ridge behind them in the north
function texApSky(){return paint(1024,256,P=>{const SU=.153,SV=149;
  const ridge=(x,s)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=3<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  // blocks on the horizon: [u centre, width in px, top row]; nearer ones taller and darker
  const BL=[];for(let i=0;i<70;i++){const u=hash2(i,1,2101),w=6+Math.floor(hash2(i,2,2101)*16),h=8+Math.floor(hash2(i,3,2101)*26);BL.push([u*1024,w,232-h,hash2(i,4,2101)])}
  for(let x=0;x<1024;x++){const u=x/1024;const bump=(c,w)=>{let d=Math.abs(u-c);d=Math.min(d,1-d);return Math.max(0,1-d/w)};
    const mt=232-(10+Math.max(0,ridge(x,2111)-.35)*80)*(.35+bump(.75,.3)*.9);
    for(let y=0;y<256;y++){const t=y/232;let du=Math.abs(u-SU);du=Math.min(du,1-du);
      let c=mix('#2f62ac','#8cb2da',Math.pow(clamp(t,0,1),1.4));c=mix(c,'#f2d6ac',clamp((t-.7)*2.6,0,1)*(.55+.45*Math.exp(-du*du*30)));
      const sy=(y-SV)/256;c=mix(c,'#fff4d6',Math.exp(-(du*du*700+sy*sy*30))*.75);c=mix(c,'#ffe2a8',Math.exp(-(du*du*60+sy*sy*6))*.25);
      const band=clamp(1-Math.abs(y-150)/60,0,1);if(band>0){const cv=fbm(x/110,y/26,2121,5,1024/110);const k=clamp((cv-.55)*3,0,1)*band;
        if(k>0){const lit=Math.exp(-du*du*50);c=mix(c,mix(mix('#f4f2ee','#c8c2c0',clamp((cv-.6)*2,0,1)),'#ffd8a0',lit*.5),k*.85)}}
      if(y>=mt&&y<=232)c=mix(mix('#8a94a8','#7a8498',clamp((y-mt)/30,0,1)),'#e6d2b4',.35);
      if(y>232)c=mix('#c8b49a','#a89880',clamp((y-232)/24,0,1));
      P.set(x,y,c)}}
  for(const [cx,w,top,r] of BL){const tone=r<.5?'#9aa2b2':'#8a92a4';for(let x=Math.floor(cx-w/2);x<cx+w/2;x++)for(let y=top;y<233;y++){let c=mix(tone,'#e4d0b0',.3+.2*(1-r));
      if((x-Math.floor(cx-w/2))%3===1&&(y-top)%3===1&&hash2(x,y,2131)<.6)c=dk(c,.12);if(y===top)c=lt(c,.12);P.set(x,y,c)}}})}
function texApAsph(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,40,2201,3)-.5)*.35+(hash2(x,y,2202)-.5)*.3;P.set(x,y,dith(P,x,y,t,['#26272a','#2e2f32','#36373a','#3f4043','#48494c'],.14))}
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,2203)*N),Math.floor(hash2(i,2,2203)*N),40+Math.floor(hash2(i,3,2203)*60),2204+i,'#141416','#55565a');
  for(let i=0;i<10;i++)stain(P,hash2(i,1,2205)*N,hash2(i,2,2205)*N,8+hash2(i,3,2205)*18,6+hash2(i,4,2205)*12,.16,2206+i);
  for(let i=0;i<26;i++){const x=Math.floor(hash2(i,1,2207)*N),y=Math.floor(hash2(i,2,2207)*N);leafAt(P,x,y,i,2208)}})}
// a ginkgo leaf, a little fan (dropped on the ground textures)
function leafAt(P,x,y,i,seed){const a=hash2(i,3,seed)*TAU,c=rpickH(i+seed,['#e8b820','#f0c830','#d8a018','#c89010','#f4d24a']);
  for(let r=0;r<6;r++)for(let k=-r;k<=r;k++){const ang=a+k/(r+1)*.7;P.set(Math.round(x+Math.cos(ang)*r),Math.round(y+Math.sin(ang)*r),r>4?dk(c,.15):c)}}
function texApMark(c){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++)P.set(x,y,hash2(x,y,2211)<.2?dk(c,.25):mix(c,'#ffffff',hash2(x,y,2212)*.15))})}
function texApGrass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.5+(P.n(x,y,30,2221,3)-.5)*.5+(hash2(x,y,2222)-.5)*.35;
    let c=dith(P,x,y,t,['#3a4220','#4a5228','#5a6230','#6a6e38','#7a7640','#8a8048'],.16);if(P.n(x,y,60,2223,3)>.6)c=mix(c,'#8a7442',.4);P.set(x,y,c)}
  for(let i=0;i<90;i++)leafAt(P,Math.floor(hash2(i,1,2224)*N),Math.floor(hash2(i,2,2224)*N),i,2225)})}
// interlocking pavers in a running bond: red-brown with grey ones mixed in, sand in the joints, leaves
function texApPaver(){const N=TN;return paint(N,N,P=>{const BW=32,BH=16;for(let y=0;y<N;y++){const row=Math.floor(y/BH),off=row%2?BW/2:0;for(let x=0;x<N;x++){const bx=Math.floor((x+off)/BW),lx=(x+off)%BW,ly=y%BH,id=row*31+bx;
    const base=hash2(id,1,2231)<.25?['#6a686a','#7a787a','#8a888a']:['#7a3c2c','#8a4a36','#9a5640'];let c=dith(P,x,y,.5+(hash2(id,2,2231)-.5)*.5+(hash2(x,y,2232)-.5)*.2,base,.1);
    if(lx<1||ly<1)c='#a8987a';P.set(x,y,c)}}
  for(let i=0;i<30;i++)leafAt(P,Math.floor(hash2(i,1,2233)*N),Math.floor(hash2(i,2,2233)*N),i,2234)})}
function texApWalk(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/64),by=Math.floor(y/64),ed=x%64<2||y%64<2;
    let c=ed?'#5a5856':dith(P,x,y,.55+(hash2(bx,by,2241)-.5)*.3+(hash2(x,y,2242)-.5)*.15,(bx+by)%3?['#8a8682','#9a9692','#aaa6a2']:['#9a7e7a','#aa8e8a','#ba9e9a'],.1);P.set(x,y,c)}
  for(let i=0;i<12;i++)leafAt(P,Math.floor(hash2(i,1,2243)*N),Math.floor(hash2(i,2,2243)*N),i,2244)})}
function texApRubber(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x,y,2251);let c=dith(P,x,y,.5+(P.n(x,y,24,2252,2)-.5)*.3,['#2a6a4a','#30785a','#388664'],.1);
    if(h<.06)c='#d8c84a';else if(h<.1)c='#3a6ab0';else if(h<.12)c='#e8e8e0';P.set(x,y,c)}})}
function texApSand(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,dith(P,x,y,.5+(P.n(x,y,20,2261,3)-.5)*.4+(hash2(x,y,2262)-.5)*.3,['#9a8460','#aa9470','#baa480','#cab490'],.14))})}
// 101동's walls: off-white render, a faint seam every storey, rain streaks under the slabs
function texApWall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.6+(P.n(x,y,48,2271,3)-.5)*.16+(hash2(x,y,2272)-.5)*.06;let c=dith(P,x,y,t,['#bcb8ae','#c8c4ba','#d4d0c6','#dedad0'],.06);
    if(y>N-6)c=y>N-3?'#9a968e':'#aaa69e';P.set(x,y,c)}for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,2273)*N),0,40+Math.floor(hash2(i,2,2273)*150),.1,2)})}
function texApConc(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,dith(P,x,y,.55+(P.n(x,y,36,2631,3)-.5)*.22+(hash2(x,y,2632)-.5)*.08,['#a4a29a','#b0aea6','#bcbab2','#c6c4bc'],.08));
  for(let i=0;i<6;i++)stain(P,hash2(i,1,2633)*N,hash2(i,2,2633)*N,10+hash2(i,3,2633)*20,8+hash2(i,4,2633)*14,.1,2634+i)})}
// one flat and one storey of the corridor face, painted for the floors nobody reaches: the parapet (white, a green band), the dark
// corridor behind it with the flat's steel door and its small window, the slab edge over it
function texApCorrF(){const W=256,H=176;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c;const yy=H-1-y;// yy: 0 at the floor
    if(yy<54){c=dith(P,x,y,.6+(P.n(x,y,24,2281,2)-.5)*.12,['#c4c0b6','#d0ccc2','#dcd8ce'],.05);if(yy>40&&yy<47)c='#3e7a64';if(yy>=52)c='#e8e4da'}
    else if(yy<160){c=mix('#2a2c2e','#4a4c4e',(yy-54)/106*.4);if(x>40&&x<84&&yy<154){c=x<44||x>80||yy>150?'#2a221c':'#6a4a32';if(x>72&&x<76&&yy>96&&yy<104)c='#c8c0a0'}
      if(x>100&&x<150&&yy>112&&yy<148){c=x<103||x>147||yy<115||yy>145?'#3a3c3e':mix('#5a6a7a','#9aaabb',(yy-115)/30);if((x-100)%10<2)c='#4a4c4e'}
      if(x>186&&x<206&&yy>118&&yy<138)c='#8a8e92'}
    else c=dith(P,x,y,.55+(hash2(x,y,2282)-.5)*.1,['#a8a49a','#b4b0a6','#bcb8ae'],.05);if(x<2)c=dk(c,.25);P.set(x,y,c)}
  for(let i=0;i<8;i++)streak(P,Math.floor(hash2(i,1,2283)*W),H-160,30+Math.floor(hash2(i,2,2283)*40),.12,2)})}
// the other side: a balcony per flat and storey — white parapet, the sliding windows over it, a frame, sometimes a plant or laundry
function texApBalc(){const W=256,H=176;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c;const yy=H-1-y;
    if(yy<50)c=dith(P,x,y,.6+(P.n(x,y,24,2291,2)-.5)*.12,['#c8c4ba','#d4d0c6','#e0dcd2'],.05);
    else if(yy<162){c=mix('#3a4a5a','#9ab0c4',clamp((yy-50)/112,0,1)*.6);if((x+yy*.5)%90<8)c=mix(c,'#ffffff',.35);if(x%64<4||yy<54||yy>158)c='#d8d4ca';if(x<6||x>W-6)c='#bcb8ae'}
    else c=dith(P,x,y,.55+(hash2(x,y,2292)-.5)*.1,['#a8a49a','#b4b0a6'],.05);P.set(x,y,c)}
  for(let k=0;k<3;k++){const x0=20+Math.floor(hash2(k,1,2293)*200);if(hash2(k,2,2293)<.5)for(let x=x0;x<x0+26;x++)for(let y=H-110;y<H-70;y++){if(hash2(x,y,2294)<.7)P.set(x,y,rpickH(x>>3,['#e8e0d0','#7a9ac8','#c86a5a','#e8d07a']))}}})}
// 101동's end wall: plain, the block number big near the top, the complex's ginkgo-leaf badge under it
function texApEnd(num){const W=256,H=1024;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=.6+(P.n(x,y,48,2301,3)-.5)*.14+(hash2(x,y,2302)-.5)*.05;
    let c=dith(P,x,y,t,['#bcb8ae','#c8c4ba','#d4d0c6','#dedad0'],.06);if(y%102<2)c='#aaa69e';P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,2303)*W),Math.floor(hash2(i,2,2303)*900),60+Math.floor(hash2(i,3,2303)*200),.08,2);
  P.post=x=>{x.fillStyle='#2e6a52';x.textAlign='center';x.textBaseline='middle';x.font='bold 96px '+AP_FONT;x.fillText(num,128,96);
    x.fillStyle='#d8a820';x.beginPath();x.moveTo(128,250);x.arc(128,250,46,-Math.PI*.85,-Math.PI*.15);x.closePath();x.fill();x.fillRect(125,250,6,40);
    x.fillStyle='#4a5a50';x.font='bold 22px '+AP_FONT;x.fillText('은행나무',128,320)}})}
// a locked flat's corridor face: tiled wall, a steel door with its number plate and digital lock, the small barred window, the meter box
function texApUnit(door,seed){const W=256,H=160;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const yy=H-1-y;
    let c=dith(P,x,y,.6+(hash2(Math.floor(x/16),Math.floor(y/16),seed)-.5)*.12+(hash2(x,y,seed+1)-.5)*.05,['#c4beb2','#ccc6ba','#d6d0c4'],.05);if(x%16===0||y%16===0)c='#a8a296';
    if(x>34&&x<100&&yy<130){c=x<38||x>96||yy>126?'#3a3632':dith(P,x,y,.5+(P.n(x,y,16,seed+2,2)-.5)*.2,[dk(door,.12),door,lt(door,.06)],.06);
      if(x>82&&x<90&&yy>56&&yy<78)c=yy>70?'#2a2c30':'#9aa0a6';if(x>48&&x<86&&yy>104&&yy<114)c='#d8d2c0'}
    if(x>130&&x<200&&yy>82&&yy<126){c=x<133||x>197||yy<85||yy>123?'#3a3c3e':mix('#4a5a6a','#8a9aaa',(yy-85)/38);if((x-130)%12<3)c='#5a5c5e'}
    if(x>214&&x<246&&yy>70&&yy<112)c=x<217||x>243||yy<73||yy>109?'#6a6e72':'#9a9ea2';P.set(x,y,c)}})}
function texApPara(){const N=TN;return paint(N,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.6+(P.n(x,y,24,2311,2)-.5)*.14+(hash2(x,y,2312)-.5)*.05,['#c8c4ba','#d4d0c6','#e0dcd2'],.05);
    if(y>18&&y<28)c='#3e7a64';if(y<6)c='#ece8de';if(y>118)c='#a8a49a';P.set(x,y,c)}for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,2313)*N),6,30+Math.floor(hash2(i,2,2313)*80),.1,2)})}
function texApCorrFl(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.55+(P.n(x,y,30,2321,2)-.5)*.2+(hash2(x,y,2322)-.5)*.2,['#6a6a66','#787874','#868682','#94948e'],.12);
    if(hash2(x,y,2323)<.05)c=rpickH(x+y,['#a8a8a0','#4a4a46','#9a8a6a']);if(y%128<3)c='#5a5a56';P.set(x,y,c)}for(let i=0;i<6;i++)leafAt(P,Math.floor(hash2(i,1,2324)*N),Math.floor(hash2(i,2,2324)*N),i,2325)})}
function texApLobbyF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=Math.floor(x/128),ty=Math.floor(y/128);let c=x%128<2||y%128<2?'#6a6258':dith(P,x,y,.55+(P.n(x+tx*31,y,40,2331,3)-.5)*.3,(tx+ty)&1?['#b4a890','#c4b8a0','#d0c4ac']:['#a89c86','#b8ac96','#c4b8a2'],.06);P.set(x,y,c)}})}
function texApMail(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=dith(P,x,y,.55+(hash2(x,y,2341)-.5)*.1,['#9aa0a6','#a8aeb4','#b4bac0'],.05);
    if(x%32<2||y%32<2)c='#5a5e62';else if(y%32>8&&y%32<12&&x%32>6&&x%32<26)c='#2a2c30';else if(y%32>18&&y%32<24&&x%32>10&&x%32<22)c='#e8e4d8';P.set(x,y,c)}})}
function texApElev(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c=mix('#8a9096','#c4cad0',(Math.sin(x*.4)*.5+.5)*.3+(y/256)*.2);if(x>62&&x<66)c='#3a3e42';if(x<6||x>121)c='#5a5e62';
    if(y<30){c='#2a2c30';if(x>44&&x<84&&y>8&&y<22)c=(x>>2)%3===0?'#ff5a3a':'#3a1a14'}P.set(x,y,c)}})}
function texApInWall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.6+(P.n(x,y,40,2351,2)-.5)*.08+(Math.sin(x*.2)*.5+.5)*.04,['#cabca4','#d4c6ae','#ddd0b8'],.04);
    if(x%32===0&&hash2(x,y>>5,2352)<.7)c=dk(c,.04);if(y>N-18)c=y>N-16?'#6a5440':'#8a7058';P.set(x,y,c)}for(let i=0;i<5;i++)stain(P,hash2(i,1,2353)*N,hash2(i,2,2353)*N,22,16,.1,2354+i)})}
function texApFloorW(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(y/24),off=Math.floor(hash2(pl,1,2361)*N),xx=(x+off)%N,seg=Math.floor(xx/96);
    let c=dith(P,x,y,.5+Math.sin(xx*.05+P.n(x,y,24,2362+seg,2)*5)*.12+(hash2(pl,seg,2363)-.5)*.2,['#8a6a46','#9a7a54','#aa8a62','#b89870'],.08);if(y%24<1||xx%96<1)c='#5a4430';P.set(x,y,c)}})}
function texApKitch(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.6+(hash2(x,y,2371)-.5)*.06,['#e0dcd4','#e8e4dc','#f0ece4'],.04);
    if(y<12)c=y<3?'#3a3632':'#6a6460';if(x%42<2)c='#9a968e';if(y>30&&y<34&&x%42>14&&x%42<28)c='#7a7e82';if(y>118)c='#2a2826';P.set(x,y,c)}})}
function texApSofa(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,.5+(P.n(x,y,8,2381,2)-.5)*.3+((x+y)%4<1?.05:0),['#4a5a6a','#566676','#627282'],.1))})}
// clear glass: see-through but for the aluminium frame and two streaks of reflected sky (alpha-tested, so it reads as a pane up
// close and fades out with the mipmaps far off)
function texApGlassT(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++)P.alpha(x,y,0);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){if(x<4||x>123||y<4||y>123){P.set(x,y,x<2||y<2?'#a8aeb4':'#7a8086');continue}
    const s=(x+y*.7)%64;if(s<2.2&&hash2(x,y,2621)<.8)P.set(x,y,'#e8f0f4');else if(s>6&&s<7&&hash2(x,y,2622)<.5)P.set(x,y,'#c8d4dc')}})}
function texApGlassB(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=mix('#2a3440','#7a8a9a',clamp((y-8)/120,0,1)*.6);if((x+y*.6)%70<6)c=mix(c,'#ffffff',.22);if(x<4||x>123||y<4||y>123||x%64<2)c='#c8c4ba';P.set(x,y,c)}})}
// shop signs (names made up): a coloured board, the name in big letters, a line under it
function texApSign(name,sub,c0,c1,fg){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=mix(c0,c1,y/64);if(x<4||x>251||y<4||y>59)c=dk(c0,.4);P.set(x,y,c)}
  P.post=x=>{x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font='bold 34px '+AP_FONT;x.fillText(name,128,sub?26:33);if(sub){x.font='bold 12px '+AP_FONT;x.fillText(sub,128,52)}}})}
function texApSignB1(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=mix('#1a4a8a','#2a5aa0',y/64);if(x<3||x>252||y<3||y>60)c='#0a1a3a';if(x>8&&x<56&&y>8&&y<56)c='#f0f0f0';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#1a4a8a';x.font='bold 38px '+AP_FONT;x.fillText('P',32,34);x.fillStyle='#ffffff';x.font='bold 26px '+AP_FONT;x.fillText('지하주차장 B1',154,26);x.font='bold 11px '+AP_FONT;x.fillText('PARKING  ↓',154,50)}})}
function texApSignExit(){return paint(128,48,P=>{for(let y=0;y<48;y++)for(let x=0;x<128;x++){let c='#1e8a4a';if(x<3||x>124||y<3||y>44)c='#0a3a1a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='bold 20px '+AP_FONT;x.fillText('비상구 EXIT',64,25)}})}
function texApSignSenior(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++)P.set(x,y,dith(P,x,y,.5+Math.sin(y*.5+P.n(x,y,12,2391,2)*3)*.15,['#5a3a20','#6a4a2a','#7a5a36'],.08));
  P.post=x=>{x.fillStyle='#f4ead0';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+AP_FONT;x.fillText('은행나무 경로당',128,34)}})}
function texApSignGate(){return paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++)P.set(x,y,dith(P,x,y,.5+(P.n(x,y,16,2401,3)-.5)*.4+(hash2(x,y,2402)-.5)*.15,['#6a6660','#7a766e','#8a867e','#9a968c'],.1));
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#2a2824';x.font='bold 31px '+AP_FONT;x.fillText('은행나무 아파트',128,40);x.font='bold 14px '+AP_FONT;x.fillText('GINKGO APARTMENTS',128,76)}})}
function texApSignQ(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c='#e8c81a';if(y<14||y>114)c=((x+y)>>3)%2?'#1a1a16':'#e8c81a';if(x<3||x>252)c='#1a1a16';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a1a16';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+AP_FONT;x.fillText('격리구역 Q-7',128,46);x.font='bold 18px '+AP_FONT;x.fillText('출입통제 · QUARANTINE',128,84)}})}
function texApBanner(){return paint(512,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<512;x++){let c=mix('#f4f0e8','#e0dcd2',hash2(x,y,2411)*.5);if(y<4||y>59)c='#c8322a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#c8322a';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+AP_FONT;x.fillText('주민 대피 완료 · 외부인 출입 금지',256,33)}})}
// taekwondo mats: red and blue interlocking squares
function texApMat(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const tx=Math.floor(x/64),ty=Math.floor(y/64),lx=x%64,ly=y%64;let red=(tx+ty)%2===0;
    const tooth=(lx<6&&Math.floor(ly/8)%2)||(ly<6&&Math.floor(lx/8)%2);if(tooth)red=!red;let c=dith(P,x,y,.5+(hash2(x,y,2421)-.5)*.2,red?['#a82a2a','#b83434','#c43e3e']:['#2a4a9a','#3454a8','#3e60b4'],.06);P.set(x,y,c)}})}
function texApMirror(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#8a9aa8','#dce6ee',clamp((x+y)/110,0,1));if((x+y*.7)%40<5)c=mix(c,'#ffffff',.4);if(x<2||y<2||x>61||y>61)c='#5a5e62';P.set(x,y,c)}})}
function texApShelf(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const sh=y%32;let c;
    if(sh<4)c=sh<2?'#d8dce0':'#8a8e94';else{const i=Math.floor(x/16)+Math.floor(y/32)*17;const w=x%16,top=4+Math.floor(hash2(i,1,2431)*12);
      c=(w<2||sh<top)?'#1a1c20':rpickH(i,['#c84a3a','#e8c04a','#4a8ac8','#5aa85a','#f0e8d8','#c86ab0','#e87a3a','#2a7a6a']);if(sh>=top&&sh<top+3)c=lt(c,.25)}P.set(x,y,c)}})}
function texApFridge(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c='#dceaf4';const sh=(y-8)%30;
    if(x<6||x>121||y<8||y>120||x%42<3)c='#3a3e44';else if(sh<3)c='#8a9aa8';else if(sh>8){const i=Math.floor(x/7)+Math.floor(y/30)*19;c=mix(rpickH(i,['#d83a2a','#3a8ad8','#e8d04a','#2a2a2a','#5ac85a','#f0f0f0']),'#dceaf4',.2)}P.set(x,y,c)}})}
// the car park: green epoxy worn grey along the lanes, tyre marks, oil
function texApPark(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const wear=P.n(x,y,60,2441,3);let c=dith(P,x,y,.5+(P.n(x,y,20,2442,2)-.5)*.2+(hash2(x,y,2443)-.5)*.1,['#2e5a46','#346450','#3a6e58'],.08);
    if(wear>.56)c=mix(c,'#6a6e6a',clamp((wear-.56)*4,0,.7));P.set(x,y,c)}for(let i=0;i<10;i++)stain(P,hash2(i,1,2444)*N,hash2(i,2,2444)*N,8+hash2(i,3,2444)*16,6+hash2(i,4,2444)*10,.25,2445+i)})}
function texApParkW(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const yy=N-1-y;let c=dith(P,x,y,.55+(P.n(x,y,40,2451,3)-.5)*.2+(hash2(x,y,2452)-.5)*.06,['#7a7c78','#868884','#929490','#9c9e9a'],.06);
    if(yy<40)c=((x+yy)>>4)%2?'#1a1a18':'#d8b81a';else if(yy<52)c='#2e6a52';if(x%128<2)c='#5a5c58';P.set(x,y,c)}for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,2453)*N),0,60+Math.floor(hash2(i,2,2453)*120),.12,2)})}
function texApPillar(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const yy=255-y;let c=dith(P,x,y,.6+(P.n(x,y,24,2461,2)-.5)*.14,['#8a8c88','#969894','#a2a4a0'],.06);
    if(yy<40)c=((x+yy)>>3)%2?'#1a1a18':'#d8b81a';if(yy>120&&yy<176&&x>16&&x<112)c=x<20||x>108||yy<124||yy>172?'#1a4a8a':'#f0f0f0';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a4a8a';x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+AP_FONT;x.fillText('B1',64,108)}})}
function texApRamp(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.5+(P.n(x,y,30,2471,2)-.5)*.2+(hash2(x,y,2472)-.5)*.15,['#5a5a56','#666662','#72726e'],.1);if(y%16<3)c='#46463f';P.set(x,y,c)}})}
function texApFlat(c0,c1,seed){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=dith(P,x,y,.5+(P.n(x,y,8,seed,2)-.5)*.4,[dk(c0,.1),c0,c1],.1);if(hash2(x,y,seed+1)<.03)c=dk(c0,.3);P.set(x,y,c)}})}
function texApBark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const t=.45+Math.sin(x*.7+P.n(x,y,8,2481,2)*5)*.18+(hash2(x,y,2482)-.5)*.15;P.set(x,y,dith(P,x,y,t,['#3a2e24','#4a3c2e','#5a4a38','#6a5844'],.1))}})}
// ginkgo crowns in autumn: fans of yellow, deeper gold in the shade, a few green ones left, sky through the gaps
function texApGinkgo(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,7,2491);let c=mix('#f4d040','#b88a10',clamp(f1/6,0,1));
    if(f2-f1<.8)c='#7a5a10';if(hash2(id,1,2492)<.06)c=mix(c,'#8aa040',.6);if(hash2(x,y,2493)<.03)c='#fff0a0';P.set(x,y,c);
    if(hash2(id,3,2494)<.13||(f2-f1<.45&&hash2(x>>1,y>>1,2495)<.55))P.alpha(x,y,0)}})}
function texApHedge(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2]=cellN(P,x,y,5,2501);let c=mix('#4a6a2a','#1e3214',clamp(f1/5,0,1));if(f2-f1<.7)c='#16260e';if(hash2(x,y,2502)<.04)c='#8a6a2a';P.set(x,y,c)}})}
function texApWist(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,6,2511);let c=mix('#7a8a3a','#3a4a1a',clamp(f1/6,0,1));
    if(f2-f1<.7)c='#2a3014';if(hash2(id,1,2512)<.12)c='#8a6a3a';if(hash2(x,y,2513)<.02)c='#6a4a6a';P.set(x,y,c)}})}
function texApWood(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+Math.sin(y*.6+P.n(x,y,16,2521,2)*4)*.15,['#7a5434','#8a623e','#9a7048'],.08);if(y%16<1)c='#4a3220';P.set(x,y,c)}})}
function texApBooth(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const yy=N-1-y;let c=dith(P,x,y,.6+(P.n(x,y,30,2531,2)-.5)*.1,['#bcc0c2','#c8ccce','#d4d8da'],.05);
    if(yy>150&&yy<166)c='#2a5a9a';if(x%64<2)c='#9aa0a4';P.set(x,y,c)}})}
function texApBrick(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/12),off=row%2?16:0;for(let x=0;x<N;x++){const bx=Math.floor((x+off)/32),id=row*13+bx;
    let c=(x+off)%32<2||y%12<2?'#a89c8a':dith(P,x,y,.5+(hash2(id,1,2541)-.5)*.4+(hash2(x,y,2542)-.5)*.1,['#a8785a','#b88866','#c49674','#cea482'],.08);P.set(x,y,c)}}})}
function texApShutter(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.55+(y%10<2?-.3:0)+(hash2(x,y,2551)-.5)*.1,['#7a8086','#8a9096','#9aa0a6'],.06);if(y>244)c='#3a3e42';P.set(x,y,c)}
  for(let i=0;i<6;i++)streak(P,Math.floor(hash2(i,1,2552)*128),0,80+Math.floor(hash2(i,2,2552)*150),.15,2)})}
// the blocks round the complex, far off: a storey per tile, rows of windows and balconies
function texApTower(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.6+(hash2(x,y,2561)-.5)*.06,['#c0bcb2','#c8c4ba','#d0ccc2'],.05);
    const yy=H-1-y;if(yy>40&&yy<112&&x%64>6&&x%64<58){c=mix('#3a4a5a','#8aa0b4',(yy-40)/72*.6);if(hash2(Math.floor(x/64),Math.floor(y/128),2562)<.15)c=mix(c,'#ffd8a0',.35)}if(yy<6)c='#a8a49a';P.set(x,y,c)}})}
function texApLow(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.55+(P.n(x,y,32,2571,2)-.5)*.12,['#b4a48c','#c0b098','#ccbca4'],.06);
    const yy=H-1-y;if(yy>36&&yy<100&&x%128>20&&x%128<108){c=mix('#3a4a58','#8a9eb0',(yy-36)/64*.6);if((x%128-20)%22<2)c='#d8d0c0'}if(yy<4)c='#8a7e6a';P.set(x,y,c)}})}
function texApRoof(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.5+(P.n(x,y,40,2581,3)-.5)*.3+(hash2(x,y,2582)-.5)*.1,['#4a6a5a','#557566','#608070'],.1);if(hash2(x,y,2583)<.01)c='#9aa49e';P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,2584)*N,hash2(i,2,2584)*N,14,10,.14,2585+i)})}// green waterproofing paint on the flat roofs
function texApBin(c0,label){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,2591)-.5)*.12+(y<12?.15:0),[dk(c0,.12),c0,lt(c0,.08)],.06);if(y>40&&y<70&&x>8&&x<56)c='#f0f0e8';P.set(x,y,c)}
  P.post=x=>{x.fillStyle=dk(c0,.3);x.textAlign='center';x.textBaseline='middle';x.font='bold 15px '+AP_FONT;x.fillText(label,32,56)}})}
function texApCeil(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%128,gy=y%128;let c=gx<3||gy<3?'#7a7e80':dith(P,x,y,.6+(hash2(x,y,2601)-.5)*.1,['#bcc0c2','#c8ccce','#d4d8da'],.05);P.set(x,y,c)}})}
function texApLampF(){return paint(64,16,P=>{for(let y=0;y<16;y++)for(let x=0;x<64;x++)P.set(x,y,x<2||x>61||y<2||y>13?'#8a8e92':'#f4f8ff')})}
// olive-drab canvas (the army truck's cover)
function texApCanvas(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,.5+(P.n(x,y,10,2641,2)-.5)*.3+((x+y)%3<1?.04:0),['#4a5230','#565e38','#626a42'],.1))})}
// the scaffold's green safety net (alpha-tested mesh) and the works sign
function texApNet(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){if(x%4<2||y%4<2)P.set(x,y,hash2(x,y,2671)<.15?'#2a6a3a':'#3a8a4a');else P.alpha(x,y,0)}
  for(let y=0;y<64;y++)for(let x=0;x<64;x++)if((y%32<2)&&hash2(x,1,2672)<.9)P.set(x,y,'#d8d8d0')})}
function texApSignWork(){return paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++){let c='#f4f0e4';if(y<20)c=((x+y)>>3)%2?'#1a1a16':'#e8c81a';if(x<3||x>252||y>92)c='#3a3a36';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#c8322a';x.font='bold 26px '+AP_FONT;x.fillText('외벽 도색 공사 중',128,46);x.fillStyle='#2a2a26';x.font='bold 16px '+AP_FONT;x.fillText('안전제일 · 관계자 외 출입금지',128,76)}})}
// a drift of fallen ginkgo leaves (alpha-tested: the ground shows between them)
function texApLeafF(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++)P.alpha(x,y,0);
  for(let i=0;i<150;i++){const r=Math.sqrt(hash2(i,5,2651))*58,a=hash2(i,6,2651)*TAU;leafAt(P,Math.round(64+Math.cos(a)*r),Math.round(64+Math.sin(a)*r),i,2652)}})}
function texApWater(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.08+P.n(x,y,32,2611,3)*7)*.5+.5;let c=mix('#2a4a4a','#4a6a6a',w*.6);if(hash2(x,y,2612)<.004)c='#d8e4e4';P.set(x,y,c)}
  for(let i=0;i<40;i++)leafAt(P,Math.floor(hash2(i,1,2613)*N),Math.floor(hash2(i,2,2613)*N),i,2614)})}// rain water standing in the ramp's sump, leaves floating
function bakeAptTex(){if(TEX.apAsph)return;
  TEX.apSky=mkTex(texApSky());TEX.apSky.wrapT=THREE.ClampToEdgeWrapping;TEX.apSky.magFilter=THREE.LinearFilter;
  if(!TEX.sunDisc&&typeof texSunDisc==='function'){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  TEX.apAsph=mkTex(texApAsph());TEX.apMarkW=mkTex(texApMark('#e8e6dc'));TEX.apMarkY=mkTex(texApMark('#e8c020'));TEX.apGrass=mkTex(texApGrass());TEX.apPaver=mkTex(texApPaver());
  TEX.apWalk=mkTex(texApWalk());TEX.apRubber=mkTex(texApRubber());TEX.apSand=mkTex(texApSand());TEX.apWall=mkTex(texApWall());TEX.apCorrF=mkTex(texApCorrF());TEX.apBalc=mkTex(texApBalc());
  TEX.apEnd=mkTex(texApEnd('101'),false);TEX.apUnitA=mkTex(texApUnit('#6a4a32',2621),false);TEX.apUnitB=mkTex(texApUnit('#5a6670',2631),false);TEX.apPara=mkTex(texApPara());TEX.apCorrFl=mkTex(texApCorrFl());
  TEX.apLobbyF=mkTex(texApLobbyF());TEX.apMail=mkTex(texApMail(),false);TEX.apElev=mkTex(texApElev(),false);TEX.apInWall=mkTex(texApInWall());TEX.apFloorW=mkTex(texApFloorW());
  TEX.apKitch=mkTex(texApKitch());TEX.apSofa=mkTex(texApSofa());TEX.apGlassT=mkTex(texApGlassT(),false);TEX.apConc=mkTex(texApConc());TEX.apEnd102=mkTex(texApEnd('102'),false);TEX.apCanvas=mkTex(texApCanvas());TEX.apNet=mkTex(texApNet());TEX.apSignWork=mkTex(texApSignWork(),false);TEX.apLeafF=mkTex(texApLeafF(),false);TEX.apGlassB=mkTex(texApGlassB(),false);
  TEX.apSignMart=mkTex(texApSign('은행나무 마트','24시 · 생활용품','#1a7a4a','#12603a','#ffffff'),false);TEX.apSignChick=mkTex(texApSign('바삭 치킨','배달 · 포장','#e8a020','#c87a10','#3a1a08'),false);
  TEX.apSignWash=mkTex(texApSign('깨끗한 세탁','수선 · 운동화 빨래','#2a6ab0','#1a4a8a','#ffffff'),false);TEX.apSignDojang=mkTex(texApSign('용 태권도','2층 · 유치부 초등부','#c8322a','#9a2018','#ffffff'),false);
  TEX.apSignAcad=mkTex(texApSign('새싹 공부방','2층 · 국어 영어 수학','#5aa83a','#3a8a2a','#ffffff'),false);TEX.apSignB1=mkTex(texApSignB1(),false);TEX.apSignExit=mkTex(texApSignExit(),false);
  TEX.apSignSenior=mkTex(texApSignSenior(),false);TEX.apSignGate=mkTex(texApSignGate(),false);TEX.apSignQ=mkTex(texApSignQ(),false);TEX.apBanner=mkTex(texApBanner(),false);
  TEX.apMat=mkTex(texApMat());TEX.apMirror=mkTex(texApMirror(),false);TEX.apShelf=mkTex(texApShelf());TEX.apFridge=mkTex(texApFridge(),false);
  TEX.apPark=mkTex(texApPark());TEX.apParkW=mkTex(texApParkW());TEX.apPillar=mkTex(texApPillar());TEX.apRamp=mkTex(texApRamp());
  TEX.apPlayR=mkTex(texApFlat('#c8322a','#e04a3a',2641));TEX.apPlayY=mkTex(texApFlat('#e8b820','#f4d040',2643));TEX.apPlayB=mkTex(texApFlat('#1a5ab0','#2a72d0',2645));TEX.apPlayG=mkTex(texApFlat('#2a8a4a','#3aa85a',2647));
  TEX.apBark=mkTex(texApBark());TEX.apGinkgo=mkTex(texApGinkgo());TEX.apHedge=mkTex(texApHedge());TEX.apWist=mkTex(texApWist());TEX.apWood=mkTex(texApWood());
  TEX.apBooth=mkTex(texApBooth());TEX.apBrick=mkTex(texApBrick());TEX.apShutter=mkTex(texApShutter());TEX.apTower=mkTex(texApTower());TEX.apLow=mkTex(texApLow());TEX.apRoof=mkTex(texApRoof());
  TEX.apBinG=mkTex(texApBin('#2a7a4a','종이류'));TEX.apBinB=mkTex(texApBin('#2a5a9a','플라스틱'));TEX.apBinY=mkTex(texApBin('#c8a020','캔 · 고철'));TEX.apBinR=mkTex(texApBin('#a83a2a','유리병'));TEX.apCeil=mkTex(texApCeil());TEX.apLampF=mkTex(texApLampF(),false);TEX.apWater=mkTex(texApWater());
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['apAsph','apGrass','apPaver','apWalk','apCorrFl','apPark','apLobbyF','apFloorW'])TEX[k].anisotropy=an}
// ---------- the map ----------
// (x east, z south; 101동 along the north edge with its corridors facing south over the garden, the arcade on the east road,
// the car park under the garden, the outer roads beyond the north pilotis and the south gate)
function buildApt(){const CV={nosolid:true},SH=3.6,F2=3.6,F3=7.2,CL=3.3;
  // a flight of thin steps (a concrete stair you can walk under): each step .32 deep at most below its tread
  const tst=(axis,c0,c1,a0,a1,y0,y1,n,mat,o)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1),bot=Math.max(Math.min(y0,y1),top-.32);
    if(axis==='z')B(c0,bot,s0,c1,top,s1,mat,Object.assign({stair:1},o||{}));else B(s0,bot,c0,s1,top,c1,mat,Object.assign({stair:1},o||{}))}};
  // a solid stepped handrail beside a flight (keeps climbers on the steps)
  const rail=(axis,c0,c1,a0,a1,y0,y1,n,mat)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1)+1;
    if(axis==='z')B(c0,y0,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat||'metal2');else B(Math.min(s0,s1),y0,c0,Math.max(s0,s1),top,c1,mat||'metal2')}};
  // shift the boxes added by fn up or down (cars in the car park)
  const atY=(dy,fn)=>{const n0=MAP.boxes.length;fn();for(let i=n0;i<MAP.boxes.length;i++){MAP.boxes[i].y0+=dy;MAP.boxes[i].y1+=dy}};
  const ceilLamp=(x,z,yc,col,r,k)=>{B(x-.5,yc-.05,z-.12,x+.5,yc,z+.12,'apLampF',CV);if(r)LIGHT(x,yc-.4,z,col||'#fff0d8',r,k==null?.75:k)};
  // ================= ground: a partition of the whole site (later rectangles win); thin over the car park, the tunnel and the passage, none over the holes =================
  {const R=[[-24,-16,14,22,'apGrass'],[-24,-16,14,-14.8,'apWalk'],[-24,20.8,14,22,'apWalk'],[-24,-16,-22.8,22,'apWalk'],[12.8,-16,14,22,'apWalk'],
      [-22.8,1,12.8,3.5,'apPaver'],[-6,-14.8,-3.5,20.8,'apPaver'],[-1,8,9,14,'apPaver'],[-21.5,-13.5,-9.5,-2.5,'apRubber'],[-13.5,-6,-10,-3,'apSand'],[-22,8.5,-12,17.5,'apRubber'],
      [-30,-32,30,-22,'apWalk'],[-30,-32,-24,-24,'apCorrFl'],[24,-32,30,-24,'apCorrFl'],[-3,-32,3,-24,'apLobbyF'],[-42,-33.2,42,-32,'apWalk'],[19,-14,20,12,'apWalk'],[20,-12.25,32,10,'apLobbyF'],
      [-40,-16,-30,30,'apWalk'],[-39.8,14,-31,26,'apFloorW'],[-42,28.4,42,30,'apWalk'],[-40,27,40,28.4,'apWalk'],[2,-12,6,-6,'apCorrFl'],[3,-14.8,5,-12,'apPaver'],
      [-3.5,-7.4,2,-6,'apPaver'],[-39,6,-33,12,'apCorrFl'],[4.5,24.5,8.5,27.8,'apLobbyF']];
    const THIN=[[-24,-12,8,16],[-38,-2,-24,4],[-1.5,-28.7,1.5,-12]],SKIP=[[-38,-16,-33,-2],[3.2,-10.4,4.8,-6.1],[-1.2,-28.4,1.2,-24.2]];
    const X0=-42,X1=42,Z0=-42,Z1=40,xs=new Set([X0,X1]),zs=new Set([Z0,Z1]);
    for(const r of R.concat(THIN,SKIP)){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    const inR=(L,x,z)=>L.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;const flush=()=>{if(!run)return;if(!run.skip)B(run.x0,run.thin?-.3:-1,Z[j],run.x1,0,Z[j+1],run.m,run.thin?{f:{ny:'apConc'}}:{ground:1});run=null};
      for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m='apAsph';for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];const sk=inR(SKIP,cx,cz),th=inR(THIN,cx,cz);
        if(run&&run.m===m&&run.skip===sk&&run.thin===th)run.x1=X[i+1];else{flush();run={x0:X[i],x1:X[i+1],m,skip:sk,thin:th}}}flush()}}
  // road markings: the lanes' edge lines, parking bays along the north road and the east road
  for(let x=-28;x<=12;x+=5)B(x-.05,0,-18.5,x+.05,.006,-16.1,'apMarkW',CV);B(-28,0,-18.56,12,.006,-18.44,'apMarkW',CV);
  for(let z=-12;z<=23;z+=5)B(14.1,0,z-.05,16.5,.006,z+.05,'apMarkW',CV);B(16.44,0,-12,16.56,.006,23,'apMarkW',CV);
  for(let x=-26;x<=16;x+=4)B(x,0,24.95,x+2,.006,25.05,'apMarkY',CV);
  // ================= 101동: a corridor block on pilotis (x -30..30, z -32..-22), ten storeys of 3.6 m; 2F and 3F are real, the rest is its shell =================
  const BX0=-30,BX1=30,BZ0=-32,BZ1=-22,CZ=-24,WL='apWall',U=[-24,-18.75,-13.5,-8.25,-3,3,8.25,13.5,18.75,24];
  // the shell above 3F: corridor faces south, balconies north, the end walls with the block number
  B(BX0,10.5,BZ0,BX1,36,BZ1,WL,{f:{pz:'apCorrF',nz:'apBalc',px:'apEnd',nx:'apEnd',py:'apRoof',ny:'apCeil'}});
  B(BX0,36,BZ0,BX1,36.9,BZ0+.3,WL);B(BX0,36,BZ1-.3,BX1,36.9,BZ1,WL);B(BX0,36,BZ0,BX0+.3,36.9,BZ1,WL);B(BX1-.3,36,BZ0,BX1,36.9,BZ1,WL);
  B(-4,36,-30,4,39.2,-25,WL,{f:{py:'apRoof'}});B(-14,36,-29,-11,37.4,-26,'metal2');B(11,36,-29,14,37.4,-26,'metal2');// the lift machine room, tanks
  // slabs: 2F and 3F over the units and the corridor (the cores have their own landings)
  for(const y of [F2,F3]){B(-24,y-.3,BZ0,24,y,BZ1,'apConc',{f:{py:'apCorrFl',ny:y===F2?'apWall':'apCeil',pz:'apCorrF',nz:'apBalc'}});
    for(const [a,b] of [[BX0,-24],[24,BX1]])B(a,y-.3,CZ,b,y,BZ1,'apConc',{f:{py:'apCorrFl',ny:'apWall',pz:'apCorrF'}})}
  // the stair cores at both ends (x0 west edge; flip mirrors the lanes): flights along z between landings, the 1F and 2F flights solid,
  // the ones above thin so the flight under them keeps its headroom; doors south onto the pilotis (1F) and the corridors (2F, 3F)
  const core=(x0,flip)=>{const xa=x0+.2,xb=x0+5.8,mid=x0+3,L0=flip?[mid+.1,xb]:[xa,mid-.1],L1=flip?[xa,mid-.1]:[mid+.1,xb],ZN=BZ0+.2,ZS=CZ-.2,zl=-29,zh=-26;
    stairs('z',L0[0],L0[1],zh,zl,0,1.8,9,'apConc',{f:{py:'apCorrFl'}});B(xa,0,ZN,xb,1.8,zl,'apConc',{f:{py:'apCorrFl'}});stairs('z',L1[0],L1[1],zl,zh,1.8,3.6,9,'apConc',{f:{py:'apCorrFl'}});B(L1[0],0,zl,L1[1],1.8,zh,'apConc');
    B(xa,F2-.3,zh,xb,F2,ZS,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});
    tst('z',L0[0],L0[1],zh,zl,F2,F2+1.8,9,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});B(xa,F2+1.5,ZN,xb,F2+1.8,zl,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});tst('z',L1[0],L1[1],zl,zh,F2+1.8,F3,9,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});
    B(xa,F3-.3,zh,xb,F3,ZS,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});
    B(mid-.1,0,zl,mid+.1,10.5,zh,'apConc',{f:{px:WL,nx:WL}});
    // the way further up is blocked on 3F: furniture piled on the landing
    {const bx=L0[0]+.1;B(bx,F3,zh+.1,bx+1.5,F3+1.1,zh+1.1,'apWood');B(bx+.2,F3+1.1,zh+.2,bx+1.3,F3+1.9,zh+1,'apSofa');B(bx+.1,F3,zh+1.1,bx+1.2,F3+.8,zh+1.7,'apKitch')}
    wallZ(x0,x0+.2,BZ0,CZ,0,10.5,WL);wallZ(x0+5.8,x0+6,BZ0,CZ,0,10.5,WL);wallX(x0,x0+6,BZ0,BZ0+.2,0,10.5,WL,[[x0+1.8,x0+4.2,3,3.8],[x0+1.8,x0+4.2,6.6,7.4]]);
    const dx=flip?[x0+.8,x0+2.4]:[x0+3.6,x0+5.2];for(const [y0,y1] of [[0,SH],[F2,F3],[F3,10.5]])wallX(x0,x0+6,CZ-.2,CZ,y0,y1,WL,[[dx[0],dx[1],y0,y0+2.3]]);
    for(const y of [0,F2,F3]){ceilLamp(x0+3,-25.3,y+CL,'#e8eeff',6,.6)}LIGHT(x0+3,F2+1.6,-30.6,'#e8eeff',5,.45);LIGHT(x0+3,F3-.4,-30.6,'#e8eeff',5,.4)};
  core(BX0,0);core(BX1-6,1);
  // the lift block: solid on 2F and 3F with two lift doors on the corridor; on 1F the glass lobby (below)
  for(const y of [F2,F3]){B(-3,y,BZ0,3,y+CL,CZ,WL);for(const c of [-1.4,1.4])B(c-.6,y,CZ,c+.6,y+2.3,CZ+.02,'apElev',CV)}
  // the flats on 2F and 3F: locked ones are solid, a door and a small window painted on their corridor face; open ones are built
  const OPEN={[F2+',-13.5']:1,[F2+',-8.25']:1,[F3+',8.25']:1};
  for(const y of [F2,F3])for(let i=0;i<U.length-1;i++){const u0=U[i],u1=U[i+1];if(u0===-3)continue;if(OPEN[y+','+u0])continue;
    B(u0,y,BZ0,u1,y+CL,CZ,WL,{f:{pz:i%2?'apUnitB':'apUnitA',nz:'apBalc'}})}
  // an open flat: the corridor wall with its door and small window, the balcony opening north, a bathroom box, the kitchen, the living room
  const flat=(u0,u1,y,wall,noTV)=>{const yc=y+CL;
    wallX(u0,u1,CZ-.2,CZ,y,yc,WL,[[u0+.4,u0+1.6,y,y+2.2],[u0+2,u0+3,y+1.3,y+2.1]],{f:{nz:'apInWall'}});B(u0+1.6,y,CZ-1.25,u0+1.66,y+2.15,CZ-.2,'door',CV);
    wallX(u0,u1,BZ0,BZ0+.2,y,yc,WL,[[u0+.4,u1-.4,y+.95,y+2.6]],{f:{nz:'apBalc',pz:'apInWall'}});B(u0+.4,y+.95,BZ0+.05,u1-.4,y+1.05,BZ0+.15,'metal2');
    if(wall&1)wallZ(u0,u0+.15,BZ0+.2,CZ-.2,y,yc,'apInWall');if(wall&2)wallZ(u1-.15,u1,BZ0+.2,CZ-.2,y,yc,'apInWall');
    B(u0+.15,y-.02,BZ0+.2,u1-.15,y+.02,CZ-.2,'apFloorW',CV);
    B(u1-1.9,y,-26.2,u1-.15,yc,CZ-.2,'apInWall',{f:{py:'apCeil'}});// the bathroom
    B(u0+.15,y,-27.6,u0+.75,y+.9,-24.9,'apKitch',{f:{py:'apCorrFl'}});B(u0+.15,y+1.5,-27.6,u0+.5,y+2.2,-24.9,'apKitch');B(u0+.15,y,-28.5,u0+.85,y+1.85,-27.7,'metal',{f:{px:'apMirror'}});
    wallX(u0+.15,u1-.15,-30.6,-30.45,y,yc,'apInWall',[[u0+.7,u1-.7,y,y+2.3]]);// the sliding doors' frame between the room and the balcony
    B(u0+1.2,y,-29.9,u0+3.4,y+.75,-29.1,'apSofa');B(u0+1.2,y+.75,-29.9,u0+3.4,y+1.05,-29.65,'apSofa');if(!noTV)B(u1-.7,y,-29.6,u1-.2,y+.6,-27.4,'apWood',{f:{nx:'apGlassB'}});
    B(u0+1.5,y+.7,-27.2,u0+3,y+.76,-26.4,'apWood');for(const [dx,dz] of [[.05,.05],[1.39,.05],[.05,.74],[1.39,.74]])B(u0+1.5+dx,y,-27.2+dz,u0+1.56+dx,y+.7,-27.14+dz,'apWood',CV);
    ceilLamp((u0+u1)/2,-28,yc,'#ffe6c0',7,.75)};
  flat(-13.5,-8.25,F2,1,1);flat(-8.25,-3,F2,2);flat(8.25,13.5,F3,3);
  // the wall between the two 2F flats, knocked through (rubble at its foot)
  wallZ(-8.35,-8.15,BZ0+.2,CZ-.2,F2,F2+CL,'apInWall',[[-30.4,-28.6,F2,F2+2.6]]);B(-9,F2,-30.1,-7.7,F2+.32,-29.3,'apConc');B(-9.5,F2,-29.2,-8.9,F2+.2,-28.7,'apConc');B(-8.9,F2,-28.55,-8.4,F2+.16,-28.1,'apConc');
  // corridors: parapets, end walls, a lamp every second flat, the evacuation banner on 3F
  for(const y of [F2,F3]){for(const [a,b] of y===F2?[[BX0,15.8],[17.4,BX1]]:[[BX0,BX1]])B(a,y,BZ1-.2,b,y+1.1,BZ1,'apPara',{f:{py:'apConc'}});B(BX0-.2,y,CZ,BX0,y+CL,BZ1,WL);B(BX1,y,CZ,BX1+.2,y+CL,BZ1,WL);
    for(const x of [-21,-10.5,0,10.5,21])ceilLamp(x,-23,y+CL,'#fff0d0',y===F2&&x===10.5?0:7,.6)}
  B(-7,F3+.15,BZ1,7,F3+1.0,BZ1+.05,'apBanner',CV);
  // 1F: the pilotis — columns under the flats' walls, the corridor slab cantilevered over the front; bikes, two parked cars
  for(const x of [-18.75,-13.5,-8.25,8.25,13.5,18.75])for(const z of [BZ0+.35,CZ-.35])B(x-.35,0,z-.35,x+.35,F2-.3,z+.35,'apConc',{f:{px:WL,nx:WL,pz:WL,nz:WL}});
  for(let x=-22;x<=-19.4;x+=.65){B(x-.02,0,-31,x+.02,.9,-29.6,'metal2',CV);B(x-.04,.3,-31.1,x+.04,.75,-29.5,'tire',CV)}B(-22.2,.55,-31.05,-19,.6,-29.55,'metal2');
  car(9.8,-31.4,12,-26.8,'car');car(-12,-31.2,-9.8,-26.6,'carR');for(const x of [-21,-16.1,-10.9,-5.6,5.6,10.9,16.1,21])ceilLamp(x,-27.6,F2-.3,'#fff2dc',8,.55);
  // the facade repainting was half done when the evacuation came: a builders' stair in a scaffold runs from the garden's corner up to
  // the 2F corridor (a gap in its parapet) — the third way up to 2F, in the middle of the block
  {const X0=15.8,X1=17.4,N='apNet';
    stairs('z',X0,X1,-16,-21.4,0,F2,18,'metal2',{f:{py:'apCorrFl'}});B(X0,F2-.3,-22,X1,F2,-21.4,'metal2',{f:{py:'apCorrFl'}});
    rail('z',X0-.12,X0,-16,-21.4,0,F2,18);rail('z',X1,X1+.12,-16,-21.4,0,F2,18);B(X0-.12,F2,-22,X0,F2+1,-21.4,'metal2');B(X1,F2,-22,X1+.12,F2+1,-21.4,'metal2');
    for(const x of [X0-.5,X1+.5])for(const z of [-21.9,-19,-16.1]){B(x-.05,0,z-.05,x+.05,5.4,z+.05,'metal2')}
    for(const x of [X0-.5,X1+.5])for(let y=1.2;y<5.5;y+=1.2)B(x-.03,y,-21.95,x+.03,y+.06,-16.05,'metal2',CV);
    for(const x of [X0-.55,X1+.55])B(x-.01,.3,-21.9,x+.01,5.3,-16.1,N,{pass:1,nosolid:true});
    B(X0-.5,5.4,-21.95,X1+.5,5.46,-16.05,'metal2',CV);B(X0-.59,1.3,-19.4,X0-.57,1.95,-17.7,'apSignWork',CV)}
  // the lift lobby (1F): glass front with the door, a back door north onto the outer road, lifts, the mailboxes, the stair down to B1
  {const G='apGlassT',GP={pass:1};
    for(const [x0,x1] of [[-3,-2.8],[-1.65,-1.6],[1.6,1.65],[2.8,3]])B(x0,0,CZ-.2,x1,F2-.3,CZ,'metal2');
    B(-1.6,0,CZ-.15,0,F2-.3,CZ-.05,G,GP);B(0,0,CZ-.15,1.6,F2-.3,CZ-.05,G,GP);for(const [x0,x1] of [[-2.8,-1.65],[1.65,2.8]])B(x0,2.3,CZ-.15,x1,F2-.3,CZ-.05,G,GP);
    wallX(-3,3,BZ0,BZ0+.2,0,F2-.3,'apWall',[[-1,1,0,2.3]]);wallZ(-3,-2.8,BZ0+.2,CZ-.2,0,F2-.3,'apWall');wallZ(2.8,3,BZ0+.2,CZ-.2,0,F2-.3,'apWall');
    for(const z of [-30,-26.2])B(2.78,0,z-.6,2.8,2.3,z+.6,'apElev',CV);B(-2.8,.9,-31.4,-2.78,2.1,-28.6,'apMail',CV);
    for(const x of [-1.48,1.2])B(x,0,-28.4,x+.28,1,-24.2,'metal2');
    stairs('z',-1.2,1.2,-23,-28.4,-3.6,0,18,'apConc',{f:{py:'apCorrFl'}});
    B(-1.2,2.1,CZ-.24,1.2,2.6,CZ-.2,'apSignB1',CV);B(-1.2,2.5,-28.36,1.2,3.0,-28.32,'apSignB1',CV);ceilLamp(0,-30,F2-.3,'#fff6e6',8,.85);ceilLamp(0,-26,F2-.3,'#fff6e6',6,.6)}
  // the passage under the corridor front and the north road to the car park (its walls go on up the stairwell)
  B(-1.2,-4.6,-28.4,1.2,-3.6,-12,'apPark');for(const x of [-1.5,1.2])B(x,-3.6,-28.7,x+.3,-.3,-12.3,'apConc',{f:{px:'apParkW',nx:'apParkW'}});B(-1.5,-3.6,-28.7,1.5,-.3,-28.4,'apConc',{f:{pz:'apParkW'}});
  ceilLamp(0,-20.5,-.3,'#e6f0ff',6,.6);ceilLamp(0,-15,-.3,'#e6f0ff',6,.6);B(-.6,-.75,-22.2,.6,-.35,-22.16,'apSignExit',CV);
  // ================= the arcade (상가, x 20..32, z -12.25..10): shops below, a taekwondo studio and a study room above, a roof up the stair hut =================
  {const AX0=20,AX1=32,AZ0=-12.25,AZ1=10,BR='apBrick',T=.25,G='apGlassT',GP={pass:1};
    // outside walls, a storey at a time (wallX/Z cannot stack openings in one column)
    wallZ(AX0,AX0+T,AZ0,AZ1,0,SH,BR,[[-8,-6.8,0,2.3],[-6.2,-4.6,.9,3],[-4.4,-3,0,2.4],[-2.8,-.4,.9,3],[.6,1.8,0,2.4],[2.4,4.6,.9,3],[5.6,6.8,0,2.4],[7,9.4,.9,3]]);
    for(const [z0,z1] of [[-6.2,-4.6],[-2.8,-.4],[2.4,4.6],[7,9.4]])B(AX0+.07,.9,z0,AX0+.15,3,z1,G,GP);
    wallZ(AX0,AX0+T,AZ0,AZ1,F2,F3,BR,[[-5.5,-3.9,F2+1,F2+2.8],[-2.5,-.9,F2+1,F2+2.8],[.5,2.1,F2+1,F2+2.8],[3.5,5.1,F2+1,F2+2.8],[6.5,8.1,F2+1,F2+2.8]]);
    wallZ(AX0,AX0+T,AZ0,-6.5,F3,10.5,BR);wallZ(AX0,AX0+T,-6.5,AZ1,F3,F3+1,BR,[],{f:{py:'apConc'}});
    wallX(AX0,AX1,AZ0,AZ0+T,0,SH,BR);wallX(AX0,AX1,AZ0,AZ0+T,F2,F3,BR);wallX(AX0,24.2,AZ0,AZ0+T,F3,10.5,BR);wallX(24.2,AX1,AZ0,AZ0+T,F3,F3+1,BR,[],{f:{py:'apConc'}});
    wallX(AX0,AX1,AZ1-T,AZ1,0,SH,BR,[[24,28,.9,2.6]]);for(const x of [24,26])B(x,.9,AZ1-.15,x+2,2.6,AZ1-.07,G,GP);wallX(AX0,AX1,AZ1-T,AZ1,F2,F3,BR,[[24,30,F2+1,F2+2.6]]);wallX(AX0,AX1,AZ1-T,AZ1,F3,F3+1,BR,[],{f:{py:'apConc'}});
    wallZ(AX1-T,AX1,AZ0,AZ1,0,SH,BR,[[-10,-8.8,0,2.3],[2.2,3.4,0,2.3]]);wallZ(AX1-T,AX1,AZ0,AZ1,F2,F3,BR,[[-2.2,-1,F2,F2+2.3],[-9,-6,F2+1,F2+2.6],[5,8,F2+1,F2+2.6]]);
    wallZ(AX1-T,AX1,AZ0,AZ1,F3,F3+1,BR,[],{f:{py:'apConc'}});
    // the stair hall (x 20.25..24, z -12..-6.7) and its hut on the roof: 1F → 2F → roof, flights along z, the upper ones thin
    {const xa=AX0+T,xb=24,mid=22.15,L0=[xa,mid-.1],L1=[mid+.1,xb],zl=-10.6,zh=-7.9,ZN=AZ0+T,ZS=-6.7;
      stairs('z',L0[0],L0[1],zh,zl,0,1.8,9,'apConc',{f:{py:'apCorrFl'}});B(xa,0,ZN,xb,1.8,zl,'apConc',{f:{py:'apCorrFl'}});stairs('z',L1[0],L1[1],zl,zh,1.8,F2,9,'apConc',{f:{py:'apCorrFl'}});B(L1[0],0,zl,L1[1],1.8,zh,'apConc');
      B(xa,F2-.3,zh,xb,F2,ZS,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});
      tst('z',L0[0],L0[1],zh,zl,F2,F2+1.8,9,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});B(xa,F2+1.5,ZN,xb,F2+1.8,zl,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});tst('z',L1[0],L1[1],zl,zh,F2+1.8,F3,9,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});
      B(xa,F3-.3,zh,xb,F3,ZS,'apConc',{f:{py:'apCorrFl',ny:'apCeil'}});B(mid-.1,0,zl,mid+.1,10.5,zh,'apConc');
      wallZ(24,24.2,ZN,-6.5,0,10.5,'apWall');for(const [y0,y1,h] of [[0,SH,0],[F2,F3,1],[F3,10.5,1]])wallX(xa,24.2,ZS,-6.5,y0,y1,'apWall',h?[[20.6,22.2,y0,y0+2.3]]:[]);
      B(AX0-.1,10.5,AZ0-.1,24.3,10.8,-6.4,'apRoof',{f:{ny:'apCeil'}});for(const y of [0,F2,F3])ceilLamp(22.1,-7.4,y+CL,'#e8eeff',6,.6)}
    // 1F: the mini-mart (front and storeroom), the chicken shop, the laundry
    wallX(24.2,AX1-T,-6.7,-6.5,0,F2-.3,'apWall',[[29.9,31.1,0,2.3]]);wallX(AX0+T,AX1-T,0,.2,0,F2-.3,'apWall');wallX(AX0+T,AX1-T,5,5.2,0,F2-.3,'apWall');
    for(const z of [-5.6,-3.4])B(22.6,0,z,28.6,1.6,z+.6,'apShelf',{f:{py:'metal'}});B(AX1-T-.6,0,-6.3,AX1-T,2.2,-.5,'metal',{f:{nx:'apFridge'}});B(20.8,0,-1.6,22.4,1.05,-.6,'metal',{f:{py:'metal2'}});
    crate(26,-10.6,1.1);crate(26,-10.6,1,1.1);crate(27.4,-10.8,1.1,0,'pallet');crate(30.6,-8,1.2);crate(28.2,-7.6,.9);
    for(const [x,z] of [[22.4,2.6],[24.8,1.4],[24.8,3.9]]){B(x-.5,.72,z-.45,x+.5,.78,z+.45,'apWood');B(x-.06,0,z-.06,x+.06,.72,z+.06,'metal2');for(const d of [-.75,.75])B(x+d-.18,0,z-.18,x+d+.18,.45,z+.18,'metal2')}
    B(27.4,0,.6,28,1.1,4.4,'metal',{f:{py:'metal2'}});B(29.5,0,.6,31.5,.95,1.8,'metal2');B(29.5,0,2.8,31.5,.95,4.4,'metal');MAP.smoke.push([30.5,1.2,1.2]);
    B(20.8,0,7.6,22.6,1.05,8.4,'apWood');for(const z of [5.6,6.6,7.6,8.6])B(AX1-T-.85,0,z,AX1-T,.85,z+.85,'metal2',{f:{nx:'apGlassB'}});
    B(24,1.9,5.6,28,1.95,5.66,'metal2',CV);for(let x=24.2;x<27.9;x+=.45)B(x,.9,5.5,x+.3,1.9,5.76,rpickH(Math.round(x*10),['apSofa','apPlayB','apPlayR','apKitch']),CV);
    for(const [x,z,c] of [[23.5,-3.2,'#f4f8ff'],[28.5,-9,'#f4f8ff'],[24,2.6,'#ffe6c0'],[29.5,2.6,'#ffe6c0'],[25,7.5,'#f0f4ff']])ceilLamp(x,z,F2-.3,c,8,.85);
    // 2F: the slab, the hallway along the windows, the taekwondo studio (mats, mirrors, bags), the study room (desks)
    B(AX0+T,F2-.3,-6.5,AX1-T,F2,AZ1-T,'apConc',{f:{py:'apFloorW',ny:'apCeil'}});B(24.2,F2-.3,AZ0+T,AX1-T,F2,-6.5,'apConc',{f:{py:'apFloorW',ny:'apCeil'}});
    wallZ(22.6,22.8,-6.5,AZ1-T,F2,F3-.3,'apInWall',[[-4,-2.6,F2,F2+2.3],[5,6.4,F2,F2+2.3]]);wallX(22.8,AX1-T,3,3.2,F2,F3-.3,'apInWall',[[27,28.4,F2,F2+2.3]]);
    B(24.25,F2,AZ0+.3,AX1-.3,F2+.02,-6.5,'apMat',CV);B(22.85,F2,-6.5,AX1-.3,F2+.02,2.95,'apMat',CV);
    B(24.6,F2+.4,AZ0+T,31.4,F2+2.6,AZ0+T+.03,'apMirror',CV);for(const [x,z] of [[26.5,-1.5],[29.5,-1.5],[29.5,-8.5]]){B(x-.22,F2+.5,z-.22,x+.22,F2+2.1,z+.22,'apPlayR');B(x-.02,F2+2.1,z-.02,x+.02,F3-.3,z+.02,'metal2',CV)}
    B(AX1-T-.5,F2,-11.4,AX1-T,F2+1,-9.6,'apPlayB');
    for(const x of [24.4,26.6,28.8])for(const z of [4.6,6.6,8.4]){B(x-.6,F2+.72,z-.32,x+.6,F2+.78,z+.32,'apWood');B(x-.55,F2,z-.28,x-.45,F2+.72,z+.28,'metal2');B(x+.45,F2,z-.28,x+.55,F2+.72,z+.28,'metal2')}
    B(AX1-T-.04,F2+1,4,AX1-T,F2+2.2,8.6,'apMirror',CV);
    for(const [x,z] of [[21.5,-3],[21.5,4],[26.5,-3],[28.5,-9],[27,6.5]])ceilLamp(x,z,F3-.3,'#fff4e0',8,.8);
    // the roof: green paint, a parapet (built with the walls), the water tank, air-conditioner units, a satellite dish
    B(24.2,F3-.3,AZ0+T,AX1-T,F3,AZ1-T,'apConc',{f:{py:'apRoof',ny:'apCeil'}});B(AX0+T,F3-.3,-6.5,24.2,F3,AZ1-T,'apConc',{f:{py:'apRoof',ny:'apCeil'}});
    B(27,F3,3.6,30.6,F3+2.2,7.6,'metal2',{f:{py:'apRoof'}});for(const x of [25,26.6,28.2])B(x,F3,-10.6,x+1.2,F3+.9,-9.8,'metal2');B(30.4,F3,-1.4,31.2,F3+1.4,-.6,'metal2');
    // the signs over the shop fronts and the 2F windows
    B(AX0-.05,2.95,-6.4,AX0,3.55,-.2,'apSignMart',CV);B(AX0-.05,2.95,.2,AX0,3.55,5,'apSignChick',CV);B(AX0-.05,2.95,5.2,AX0,3.55,9.7,'apSignWash',CV);
    B(AX0-.05,F3-.65,-6.3,AX0,F3-.1,2.8,'apSignDojang',CV);B(AX0-.05,F3-.65,3.3,AX0,F3-.1,9.6,'apSignAcad',CV);
    // the fire escape at the back: a steel stair from the alley (north of the chicken shop's back door) up to the studio's back door
    B(AX1,F2-.3,-2.6,AX1+1.4,F2,-.6,'metal2',{f:{py:'apCorrFl'}});stairs('z',AX1,AX1+1.4,-8,-2.6,0,F2,18,'metal2',{f:{py:'apCorrFl'}});rail('z',AX1+1.4,AX1+1.52,-8,-2.6,0,F2,18);
    B(AX1+1.4,F2,-2.6,AX1+1.52,F2+1,-.48,'metal2');B(AX1,F2,-.6,AX1+1.52,F2+1,-.48,'metal2');LIGHT(AX1+.8,F2+2.2,-1.6,'#ffcf8a',6,.6);B(AX1+.02,F2+2.4,-1.8,AX1+.14,F2+2.6,-1.4,'lampO',CV);
    // the back alley: bins, gas bottles, crates, a delivery scooter; the site wall east
    B(35,0,-8,37,1.3,-6.6,'contG',{f:{py:'metal2'}});B(35,0,6,37,1.3,7.4,'contB',{f:{py:'metal2'}});drum(38.9,-4.2,0,'drumR');drum(38.9,-3.5,0,'drumB');drum(38.3,-3.85,0,'drumR');crate(36.2,-2,1.1);crate(36.2,-.8,1);
    B(34.6,.35,13,35.2,.95,14.6,'apPlayR');B(34.7,0,13.1,35.1,.4,13.5,'tire');B(34.7,0,14.1,35.1,.4,14.5,'tire');
    B(37.4,0,-14.2,38.6,.15,-13,'pallet');B(37.4,.15,-14.2,38.6,.3,-13,'pallet');crate(38,-13.6,.8,.3);tireStack(38.7,-18.2,3);tireStack(38.1,-18.6,2);crate(37.6,15.8,1.1);crate(38.6,16.4,.9);B(35,0,17.5,37,1.3,18.9,'contR',{f:{py:'metal2'}});
    B(40,0,-32,40.3,3,30,'apWall',{f:{py:'apConc'}})}
  // ================= the car park (B1) under the garden: floor, walls, pillars, bays, cars, strip lights; the ramp and its tunnel in the west =================
  {const PW='apParkW';B(-24,-4.6,-12,8,-3.6,16,'apPark');
    wallZ(-24.3,-24,-12.3,16.3,-3.6,-.3,PW,[[-2,4,-3.6,-.3]]);wallZ(8,8.3,-12.3,16.3,-3.6,-.3,PW);wallX(-24,8,-12.3,-12,-3.6,-.3,PW,[[-1.2,1.2,-3.6,-.3]]);wallX(-24,8,16,16.3,-3.6,-.3,PW);
    for(const x of [-16,-8,0])for(const z of [-4,4,12])B(x-.4,-3.6,z-.4,x+.4,-.3,z+.4,'apPillar');
    for(let x=-23.5;x<=-2;x+=2.5)B(x-.06,-3.6,-12,x+.06,-3.594,-7,'apMarkY',CV);for(let x=-23.5;x<=7;x+=2.5)B(x-.06,-3.6,11,x+.06,-3.594,16,'apMarkY',CV);
    B(-24,-3.6,-7.06,-2,-3.594,-6.94,'apMarkY',CV);B(-24,-3.6,10.94,8,-3.594,11.06,'apMarkY',CV);
    atY(-3.6,()=>{car(-22.9,-11.7,-20.7,-7.2,'car');car(-17.9,-11.7,-15.7,-7.2,'carR');car(-7.9,-11.7,-5.7,-7.2,'car');car(-20.4,11.3,-18.2,15.8,'car');car(-12.9,11.3,-10.7,15.8,'carBurnt');
      car(3.8,11.3,6,15.8,'carR');car(-14,-1.5,-9.4,.7,'car')});
    for(const [x,z] of [[-20,-8],[-12,-8],[-4,-8],[-20,0],[-4,0],[4,0],[-12,8],[4,8]])ceilLamp(x,z,-.3,'#e6f0ff',9,.8);for(const [x,z] of [[-12,0],[-20,8]])B(x-.5,-.35,z-.12,x+.5,-.3,z+.12,'metal2',CV);
    B(-.6,-.75,-11.7,.6,-.35,-11.66,'apSignExit',CV);B(-23.7,-.75,.4,-23.66,-.35,1.6,'apSignExit',CV);B(-17,-3.6,2,-15,-3.59,5.2,'apWater',CV);
    // the ramp from the north road down into the trench, the landing under the road, the tunnel east into the car park
    stairs('z',-38,-33,-2,-16,-3.6,0,28,'apRamp',{f:{py:'apRamp'}});B(-38,-4.6,-2,-24,-3.6,4,'apPark');
    B(-38.3,-3.6,-16,-38,1,4.3,PW,{f:{py:'apConc',nx:'apWall'}});B(-33,-3.6,-16,-32.7,1,-2,PW,{f:{py:'apConc',px:'apWall'}});B(-38,-.3,-2.15,-33,1,-2,'apConc',{f:{nz:PW}});
    wallX(-33,-24,-2.3,-2,-3.6,-.3,PW);wallX(-38,-24,4,4.3,-3.6,-.3,PW);
    ceilLamp(-35.5,1,-.3,'#e6f0ff',8,.75);ceilLamp(-28.5,1,-.3,'#e6f0ff',8,.75);LIGHT(-35.5,-1.5,-10,'#e6f0ff',8,.5);
    for(const x of [-38.3,-32.82])B(x,1,-16.12,x+.12,2.5,-16,'metal2');B(-38.3,2.5,-16.12,-32.7,2.65,-16,'paintY');B(-36.7,1.9,-16.16,-34.3,2.5,-16.12,'apSignB1',CV)}
  // ================= the glass kiosk over the car-park stair (x 2..6, z -12..-6): doors north, west and east; the stair from B1 comes up northwards =================
  {const G='apGlassT',GP={pass:1};
    stairs('z',3.2,4.8,-5,-10.4,-3.6,0,18,'apConc',{f:{py:'apCorrFl'}});for(const x of [3,4.8])B(x,0,-10.4,x+.2,1,-6.1,'metal2');
    for(const [x,z] of [[2,-12],[5.9,-12],[2,-6.1],[5.9,-6.1]])B(x,0,z,x+.1,2.8,z+.1,'metal2');
    for(const [x0,x1] of [[2.1,3.2],[4.8,5.9]])B(x0,0,-12,x1,2.8,-11.94,G,GP);B(3.2,2.3,-12,4.8,2.8,-11.94,G,GP);for(const [x0,x1] of [[2.1,4],[4,5.9]])B(x0,0,-6.06,x1,2.8,-6,G,GP);
    for(const x of [2,5.94]){for(const [z0,z1] of [[-11.9,-10.3],[-10.3,-8.7],[-8.7,-7.2]])B(x,0,z0,x+.06,2.8,z1,G,GP);B(x,2.3,-7.2,x+.06,2.8,-6.1,G,GP)}
    B(1.9,2.8,-12.1,6.1,3.0,-5.9,'apRoof',{f:{ny:'apCeil'}});B(3.2,2.35,-12.08,4.8,2.75,-12.04,'apSignB1',CV);B(3.1,2.2,-5.98,4.9,2.65,-5.94,'apSignB1',CV);ceilLamp(4,-11.2,2.8,'#f0f4ff',6,.5)}
  // ================= the garden: the play tower, swings and the sandbox, the wisteria pergola, the exercise corner, ginkgo trees, hedges, benches, lamp posts =================
  {const bench=(x,z,ax,bs)=>{const hx=ax==='x'?.8:.22,hz=ax==='x'?.22:.8;B(x-hx,0,z-hz,x+hx,.44,z+hz,'apWood');
      if(ax==='x')B(x-hx,.44,bs>0?z+hz-.06:z-hz,x+hx,.92,bs>0?z+hz:z-hz+.06,'apWood',CV);else B(bs>0?x+hx-.06:x-hx,.44,z-hz,bs>0?x+hx:x-hx+.06,.92,z+hz,'apWood',CV)};
    // the play tower: deck A (1.2 m) up a stair from the south, deck B (2.4 m) up a short flight from A, the climbing ramp down to the east, a roof on posts
    {const Y='apPlayY',R='apPlayR',BL='apPlayB',GR='apPlayG';
      B(-19,1.0,-11,-16,1.2,-8,Y,{f:{ny:BL}});B(-16,2.2,-11,-13.5,2.4,-8.5,R,{f:{ny:BL}});
      for(const [x,z] of [[-19,-11],[-16.12,-11],[-19,-8.12],[-16.12,-8.12]])B(x,0,z,x+.12,1.0,z+.12,BL);
      for(const [x,z] of [[-16,-11],[-13.5,-11],[-16,-8.5],[-13.5,-8.5]])B(x-.06,0,z-.06,x+.06,3.6,z+.06,BL);
      stairs('z',-18.6,-17,-6.2,-8,0,1.2,5,BL);stairs('x',-10.6,-9.4,-17.8,-16,1.2,2.4,5,BL);stairs('x',-10.2,-9.4,-10,-13.5,0,2.4,10,GR);
      B(-19,1.2,-11,-18.94,2.1,-8,Y);B(-19,1.2,-11,-16,2.1,-10.94,Y);B(-19,1.2,-8.06,-18.6,2.1,-8,Y);B(-17,1.2,-8.06,-16,2.1,-8,Y);
      B(-15.94,2.4,-11,-13.56,3.3,-10.94,R);B(-15.94,2.4,-8.56,-13.56,3.3,-8.5,R);B(-16,2.4,-10.94,-15.94,3.3,-10.6,R);B(-16,2.4,-9.4,-15.94,3.3,-8.56,R);
      B(-13.56,2.4,-10.94,-13.5,3.3,-10.2,R);B(-13.56,2.4,-9.4,-13.5,3.3,-8.56,R);
      B(-16.3,3.6,-11.3,-13.2,3.8,-8.2,GR,CV);B(-15.6,3.8,-10.6,-13.9,4.1,-8.9,GR,CV);
      // the swings, the sandbox
      for(const x of [-21,-18.12])B(x,0,-4.06,x+.12,2.4,-3.94,R);B(-21,2.3,-4.05,-18,2.42,-3.95,R,CV);
      for(const x of [-20.2,-18.9]){for(const d of [-.26,.24])B(x+d,.52,-4.01,x+d+.02,2.3,-3.99,'metal2',CV);B(x-.3,.45,-4.15,x+.3,.52,-3.85,Y,CV)}
      B(-13.5,0,-6,-10,.25,-5.8,'apWood');B(-13.5,0,-3.2,-10,.25,-3,'apWood');B(-13.5,0,-5.8,-13.3,.25,-3.2,'apWood');B(-10.2,0,-5.8,-10,.25,-3.2,'apWood');
      B(-12.4,0,-4.8,-12.1,.22,-4.5,R,CV);B(-11.2,0,-4,-10.9,.12,-3.6,BL,CV)}
    // the wisteria pergola over the paved square, benches under it
    for(const x of [0,3.9,7.8])for(const z of [9,12.8])B(x,0,z,x+.2,2.6,z+.2,'apWood');
    for(const z of [9,12.8])B(-.2,2.6,z,8.2,2.8,z+.2,'apWood',CV);for(let x=0;x<=8.01;x+=.8)B(x-.05,2.8,8.8,x+.05,2.92,13.2,'apWood',CV);
    for(const [x0,z0,x1,z1] of [[-.3,8.6,3.4,11.4],[2.6,9.8,6.4,13.4],[5.4,8.7,8.5,12]])B(x0,2.92,z0,x1,3.25,z1,'apWist',CV);
    bench(2,9.62,'x',-1);bench(6,9.62,'x',-1);bench(2,12.38,'x',1);bench(6,12.38,'x',1);
    // the exercise corner: an air walker, a waist twister, pull-up bars, a sit-up bench, a shoulder wheel
    {const GR='apPlayG',Y='apPlayY';for(const x of [-21,-19.4])B(x,0,10.4,x+.12,1.8,10.52,GR);B(-21,1.7,10.4,-19.28,1.82,10.52,GR,CV);for(const x of [-20.6,-20])B(x,.3,10.1,x+.12,.36,10.8,Y,CV);
      B(-16.06,0,10.44,-15.94,1.3,10.56,GR);B(-16.5,.2,10.05,-15.5,.26,10.95,Y,CV);B(-16.5,1.2,10.47,-15.5,1.26,10.53,GR,CV);
      for(const x of [-15,-13])B(x,0,14.9,x+.12,2.3,15.02,GR);B(-15,2.2,14.92,-12.88,2.28,15,'metal2',CV);
      B(-21,0,14.6,-19,.55,15.2,'apPlayB');B(-21,.55,14.6,-20.8,.9,15.2,'apPlayB');
      B(-17.56,0,15.94,-17.44,1.6,16.06,GR);B(-17.44,1.1,15.5,-17.4,1.9,16.5,Y,CV)}
    for(const [x,z] of [[-13,10],[-21.5,16.6]])bench(x,z,'z',x<-15?-1:1);
    // ginkgo trees: a trunk, an oval crown of gold in five ragged tiers, each a little off the axis, and two clumps sticking out
    // (the crown has no collision), leaves drifted round the foot
    const tree=(x,z,s)=>{s=s||1;B(x-.18,0,z-.18,x+.18,3,z+.18,'apBark');B(x-.08,3,z-.08,x+.08,6.4,z+.08,'apBark');const k=Math.round(x*7+z*13);
      let y=3;for(const [h,r] of [[.8,1.3],[1.2,1.75],[1,1.55],[.8,1.15],[.6,.65]]){const ox=(hash2(k,y*10,2661)-.5)*.3*s,oz=(hash2(k,y*10,2662)-.5)*.3*s;
        B(x+ox-r*s,y*s+3*(1-s),z+oz-r*s,x+ox+r*s,(y+h)*s+3*(1-s),z+oz+r*s,'apGinkgo',CV);y+=h}
      for(let i=0;i<2;i++){const a=hash2(k,i,2663)*TAU,d=1.55*s,cy=3.9+i*1.1;B(x+Math.cos(a)*d-.5,cy*s+3*(1-s),z+Math.sin(a)*d-.5,x+Math.cos(a)*d+.5,(cy+.8)*s+3*(1-s),z+Math.sin(a)*d+.5,'apGinkgo',CV)}
      B(x-1.9*s,0,z-1.9*s,x+1.9*s,.012,z+1.9*s,'apLeafF',CV)};
    for(const [x,z,s] of [[-22.5,0],[-22.5,8],[-22.5,18],[-8,-13.6],[-2.5,-13.6,.9],[10,-13.6],[12.4,-4],[12.4,5,.9],[12.4,16],[-1,8,.85],[-12,20.4],[0,20.4,.9],[8,19.2],
      [-31.5,-8,.9],[-31.5,10],[17.2,-14,.8]])tree(x,z,s);
    // hedges along the north edge (gaps for the paths), benches by the paths, lamp posts (off: it is afternoon)
    for(const [x0,x1] of [[-22.8,-9.6],[-3,2.6],[5.4,12.8]])B(x0,0,-14.8,x1,1,-14.2,'apHedge');
    for(const [x,z,ax,bs] of [[-9,.6,'x',-1],[-14,.6,'x',-1],[6,.6,'x',-1],[10,.6,'x',-1],[-7.2,10,'z',-1],[-7.2,-9,'z',-1],[-2.3,13,'z',1],[-2.3,-1.8,'z',1]])bench(x,z,ax,bs);
    for(const [x,z] of [[-6.6,4.1],[-2.9,.4],[11,4.1],[-16,.4],[-2.9,-9],[-2.9,18],[-14,7.8],[10.5,14.6]]){B(x-.07,0,z-.07,x+.07,3.4,z+.07,'metal2');B(x-.2,3.4,z-.2,x+.2,3.75,z+.2,'apGlassB',CV);B(x-.24,3.75,z-.24,x+.24,3.82,z+.24,'metal2',CV)}}
  // ================= the west strip: the recycling shed, the senior centre (경로당); the site wall west =================
  {for(const z of [6,8.93,11.85])B(-33.15,0,z,-33,2.6,z+.15,'metal2');B(-39,0,6,-38.85,2.6,6.15,'metal2');B(-39,0,11.85,-38.85,2.6,12,'metal2');
    B(-39.2,2.6,5.8,-32.8,2.8,12.2,'apRoof',{f:{ny:'metal2'}});B(-39,0,6.15,-38.85,2.6,11.85,'apWall');
    {const BN=['apBinG','apBinB','apBinY','apBinR','apBinG'];for(let i=0;i<5;i++)B(-38.75,0,6.3+i*1.1,-37.75,1.3,7.3+i*1.1,BN[i])}
    crate(-35.4,7.4,.9);crate(-34.6,10.6,.8,0,'pallet');B(-36.4,0,9.2,-35.4,.6,10,'wood');
    {const X0=-39.8,X1=-31,Z0=14,Z1=26,T=.25,BR='apBrick',G='apGlassT',GP={pass:1};
      wallX(X0,X1,Z0,Z0+T,0,3.6,BR,[[-36.5,-34.5,1,2.4]]);wallX(X0,X1,Z1-T,Z1,0,3.6,BR,[[-38,-36,1,2.4],[-34.5,-32.5,1,2.4]]);
      wallZ(X0,X0+T,Z0+T,Z1-T,0,3.6,BR);wallZ(X1-T,X1,Z0+T,Z1-T,0,3.6,BR,[[18,19.5,0,2.3],[21,23.4,1,2.4]]);
      B(-36.5,1,Z0+.09,-34.5,2.4,Z0+.16,G,GP);for(const x0 of [-38,-34.5])B(x0,1,Z1-.16,x0+2,2.4,Z1-.09,G,GP);B(X1-.16,1,21,X1-.09,2.4,23.4,G,GP);
      B(X0-.2,3.6,Z0-.2,X1+.2,3.9,Z1+.2,'apRoof',{f:{ny:'apCeil'}});B(X1,2.6,17.4,X1+1.2,2.72,20.1,'metal2');B(X1+.02,2.75,17.6,X1+.06,3.35,19.9,'apSignSenior',CV);
      B(-37.2,0,16.6,-35.6,.36,17.6,'apWood');B(-37.2,0,21.4,-35.6,.36,22.4,'apWood');B(-36.8,.36,16.8,-36.2,.4,17.4,'apWood',CV);
      for(const [x,z] of [[-37.6,17.1],[-35.2,17.1],[-37.6,21.9],[-35.2,21.9]])B(x-.3,0,z-.3,x+.3,.12,z+.3,'apSofa',CV);
      B(-39.5,0,18.8,-39.05,.6,21.2,'apWood');B(-39.42,.6,19.2,-39.36,1.35,20.8,'metal',{f:{px:'apGlassB'}});B(-32.1,0,15.2,-31.3,1,17.4,'apWood');
      B(-39.5,0,23.6,-38.4,.9,25.6,'apWood',{f:{px:'apKitch'}});ceilLamp(-35.4,17.6,3.6,'#ffe6c0',7,.7);ceilLamp(-35.4,22.6,3.6,'#ffe6c0',7,.7)}
    B(-40.3,0,-32,-40,3,28,'apWall',{f:{py:'apConc'}})}
  // ================= the north road behind 101동, closed off: concrete barriers with a fence on top (four gaps), sandbags, an army truck =================
  {const line=(z,segs,fz)=>{for(const [x0,x1] of segs){B(x0,0,z-.4,x1,1.1,z+.4,'apBarrier');B(x0,1.1,fz-.015,x1,2.7,fz+.015,'apFence',{pass:1});
      const n=Math.max(1,Math.round((x1-x0)/2.6));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;B(x-.05,1.1,fz-.05,x+.05,2.78,fz+.05,'metal2')}}};
    B(-42,0,-33.5,42,.006,-33.38,'apMarkW',CV);for(let x=-40;x<40;x+=5)B(x,0,-35.26,x+2.4,.006,-35.14,'apMarkY',CV);
    line(-37.2,[[-42,-26],[-22,-8],[-4,8],[12,26],[30,42]],-37.55);
    for(const x of [-1,-31,31])B(x,1.25,-37.48,x+2,2.25,-37.44,'apSignQ',CV);B(-1,1.3,-37.66,1,2.3,-37.62,'apSignQ',CV);
    for(const [x0,x1] of [[-10.4,-8.2],[-3.8,-1.6],[5.6,7.8],[12.2,13.5],[-28.4,-26.2],[30.2,32.4]])B(x0,0,-36.7,x1,.9,-36,'sandbag');
    for(const [x,z] of [[-24.6,-35.6],[-23.4,-35.2],[-6.6,-35.4],[9.4,-35.6],[10.6,-35.2],[28,-35.4]])cone(x,z);
    // the army truck, cab west, parked in the south lane
    B(14.2,.5,-36.1,20.8,1.05,-34.1,'metal2');B(13.7,.5,-36.2,14,1.2,-34,'metal2');B(14,1.05,-36.3,16,2.7,-33.9,'contG',{f:{nx:'carGl'}});
    B(16.1,1.05,-36.3,21,1.4,-33.9,'contG');B(16.1,1.4,-36.3,21,3.1,-33.9,'apCanvas');for(const x of [14.6,18,19.6])for(const z of [-36.45,-34.05])B(x,0,z,x+.95,.95,z+.4,'tire');
    // the ends of the road and the north edge
    B(-42.3,0,-42.3,-42,3.5,-32,'apBarrier');B(42,0,-42.3,42.3,3.5,-32,'apBarrier');B(-42.3,0,-42.3,42.3,2.6,-42,'apBarrier');B(-42.3,2.6,-42.165,42.3,4,-42.135,'apFence',{pass:1})}
  // ================= the south: the complex wall and its gate, the guard booth; the south road with the checkpoint =================
  {for(const [x0,x1] of [[-40,-4.4],[4.4,40]]){B(x0,0,28,x1,1.2,28.4,'apBrick',{f:{py:'apConc'}});B(x0,1.2,28.335,x1,2.6,28.365,'apFence',{pass:1});
      const n=Math.max(1,Math.round((x1-x0)/2.6));for(let i=0;i<=n;i++){const x=Math.min(x1-.08,Math.max(x0+.08,x0+(x1-x0)*i/n));B(x-.08,1.2,28.24,x+.08,2.7,28.4,'apBrick',{f:{py:'apConc'}})}}
    for(const x of [-4.4,4])B(x,0,27.9,x+.4,3.2,28.5,'apBrick',{f:{py:'apConc'}});B(-4.4,3.2,27.95,4.4,4.4,28.45,'apBrick',{f:{py:'apConc'}});
    B(-1.6,3.25,28.46,1.6,4.35,28.5,'apSignGate',CV);B(-1.6,3.25,27.9,1.6,4.35,27.94,'apSignGate',CV);
    B(3.2,0,27.3,3.9,1.1,27.8,'metal2');B(3.47,1.1,27.47,3.63,5.4,27.63,'paintY');
    // the guard booth by the gate: a door west, windows round, a desk and a locker
    {const X0=4.6,X1=8.4,Z0=24.6,Z1=27.6,T=.12,G='apGlassT',GP={pass:1};
      wallZ(X0,X0+T,Z0,Z1,0,2.6,'apBooth',[[25.2,26.8,0,2.2]]);wallZ(X1-T,X1,Z0,Z1,0,2.6,'apBooth',[[25.4,27,1,2.1]]);
      wallX(X0,X1,Z0,Z0+T,0,2.6,'apBooth',[[5.2,7.8,1,2.1]]);wallX(X0,X1,Z1-T,Z1,0,2.6,'apBooth',[[5.2,7.8,1,2.1]]);
      B(X1-.08,1,25.4,X1-.04,2.1,27,G,GP);B(5.2,1,Z0+.04,7.8,2.1,Z0+.08,G,GP);B(5.2,1,Z1-.08,7.8,2.1,Z1-.04,G,GP);
      B(X0-.3,2.6,Z0-.3,X1+.3,2.82,Z1+.3,'apRoof',{f:{ny:'apCeil'}});B(7.2,0,25,8.25,.8,27.2,'apWood');B(5,0,26.9,5.8,1.9,27.45,'metal');ceilLamp(6.5,26.1,2.6,'#fff0d8',5,.5)}
    // the south road: the checkpoint line (three gaps), a parked car, cones, a floodlight on a pole; the ends of the road and the south edge
    B(-42,0,31.9,42,.006,32.02,'apMarkW',CV);for(let x=-40;x<40;x+=5)B(x,0,35.94,x+2.4,.006,36.06,'apMarkY',CV);
    {const z=33.4,fz=z+.35;for(const [x0,x1] of [[-42,-20],[-16,-2],[2,16],[20,42]]){B(x0,0,z-.4,x1,1.1,z+.4,'apBarrier');B(x0,1.1,fz-.015,x1,2.7,fz+.015,'apFence',{pass:1});
      const n=Math.max(1,Math.round((x1-x0)/2.6));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;B(x-.05,1.1,fz-.05,x+.05,2.78,fz+.05,'metal2')}}
      B(-10,1.25,fz-.08,-8,2.25,fz-.04,'apSignQ',CV);B(8,1.3,z+.42,10,2.3,z+.46,'apSignQ',CV)}
    car(22,30.5,26.4,32.5,'car');for(const [x,z] of [[-18.6,32.2],[-17.4,32.6],[17.6,32.4],[18.8,32.1],[-1.2,34.6],[1.2,34.8]])cone(x,z);
    B(-24.1,0,30.4,-23.9,6,30.6,'metal2');B(-24.6,6,30.2,-23.4,6.6,30.8,'metal2',{f:{nz:'lampW'}});
    B(-42.3,0,28.4,-42,3.5,40.3,'apBarrier');B(42,0,28.4,42.3,3.5,40.3,'apBarrier');B(-42.3,0,40,42.3,2.6,40.3,'apBarrier');B(-42.3,2.6,40.135,42.3,4,40.165,'apFence',{pass:1})}
  // ================= outside the walls: 102동 west of the site (its balcony face towards us), the blocks round about, the ground under them =================
  B(-66,0,-24,-56,36,28,WL,{f:{px:'apBalc',nx:'apCorrF',pz:'apEnd102',nz:'apEnd102',py:'apRoof'}});B(-63,36,-2,-59,39,6,WL,{f:{py:'apRoof'}});
  B(-130,-1,-130,130,0,-42,'apAsphF',{ground:1});B(-130,-1,40,130,0,130,'apAsphF',{ground:1});B(-130,-1,-42,-56,0,40,'apAsphF',{ground:1});B(-56,-1,-42,-42,0,40,'apGrassF',{ground:1});B(42,-1,-42,130,0,40,'apAsphF',{ground:1});
  for(const [x0,z0,x1,z1,h] of [[-62,-80,-38,-68,46],[-20,-84,4,-72,52],[18,-78,42,-66,40],[56,-90,80,-78,48],[62,-36,74,-12,44],[66,4,78,28,50],[-100,-60,-88,-36,44],[-104,40,-92,64,40]])
    B(x0,0,z0,x1,h,z1,'apTower',{f:{py:'apRoof'}});
  for(const [x0,z0,x1,z1,h] of [[-58,48,-30,60,7],[-22,50,-2,62,8],[6,48,30,58,6],[36,50,62,62,8]])B(x0,0,z0,x1,h,z1,'apLow',{f:{py:'apRoof'}});
  // ================= who starts where =================
  MAP.spawns=[];for(const [x,z] of [[-10,5],[-7,5],[-1,5.5],[2,5],[6,5],[9,5.5],[-10,7.5],[-7,8],[-2,7.5],[1,7.5],[9,7.5],[-8,15],[-4,16],[2,16],[6,15.5],[10,15]])
    MAP.spawns.push([x+rr(-.15,.15),z+rr(-.15,.15),0,rr(-.5,.5)]);
  MAP.zspawns=[[-36,-39.5,0],[-20,-39.5,0],[-6,-39.5,0],[10,-39.5,0],[24,-39.5,0],[36,-39.5,0],[-30,36.5,0],[-14,36.5,0],[0,36.5,0],[14,36.5,0],[30,36.5,0],
    [-22,14,-3.6],[36,-26,0],[36,24,0],[-36,-22,0],[-35.5,27,0]];
  MAP.camps=[
    {k:'flat2',w:.2,p:[[-11,F2,-28],[-6,F2,-28.5],[-11.5,F2,-31.1],[-5,F2,-31.1]],look:[-8,F2+1,-24]},
    {k:'corr2',w:.12,p:[[-20,F2,-23],[0,F2,-23],[20,F2,-23]],look:[0,F2+1,-10]},
    {k:'corr3',w:.14,p:[[-15,F3,-23],[5,F3,-23],[22,F3,-23]],look:[0,F3,-10]},
    {k:'flat3',w:.12,p:[[10,F3,-28],[12,F3,-31.1]],look:[10.5,F3+1,-24]},
    {k:'roof',w:.18,p:[[22,F3,0],[26,F3,-4],[30.5,F3,8.4],[30.5,F3,-10.5]],look:[22.1,F3+1,-6.6]},
    {k:'dojang',w:.1,p:[[28,F2,-9.5],[30,F2,-4],[25,F2,0]],look:[21.5,F2+1,-3.3]},
    {k:'study',w:.05,p:[[27.7,F2,5.6],[30.6,F2,7.5]],look:[21.5,F2+1,5.7]},
    {k:'mart',w:.06,p:[[26,0,-1.2],[30,0,-4.3]],look:[20.5,1,-3.7]},
    {k:'play',w:.03,p:[[-14.8,2.4,-9.8],[-15.4,2.4,-10.4]],look:[-8,1,-6]},
    {k:'pergola',w:.03,p:[[4,0,11],[2,0,11]],look:[4,1,4]},
    {k:'b1',w:.06,p:[[-20,-3.6,-2],[4,-3.6,6],[-6,-3.6,9.5]],look:[-8,-2.6,0]},
    {k:'lobby',w:.04,p:[[-2.2,0,-30.5],[2.2,0,-30.8]],look:[0,1,-24]},
    {k:'senior',w:.04,p:[[-34.6,0,22],[-37.6,0,19.6]],look:[-31,1,18.8]},
    {k:'booth',w:.02,p:[[6,0,26.1]],look:[0,1,28]},
  ];
  MAP.spawnYaw=null;
  // an autumn afternoon: the sun low in the south-west, warm; the blocks' shadows fall to the north-east, out of the garden
  MAP.moon={d:new THREE.Vector3(-.487,.53,.695).normalize(),c:new THREE.Color('#ffe0b0'),i:1.2};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.04);cam.position.set(16+a*6,9+Math.sin(t*.05)*.6,26);cam.lookAt(-4+a*3,6,-18)}}
MAPDEFS.apt={gside:'apConc',n:['은행나무 아파트','Ginkgo Apartments'],d:['주민이 모두 대피한 가을 오후의 복도식 아파트 단지. 101동 2·3층 복도와 뚫린 세대, 상가 2층 태권도장과 옥상, 놀이터 정글짐, 등나무 쉼터, 경로당, 그리고 정원 밑 지하주차장(경사로·유리 계단실·로비 계단). 좀비는 격리선이 쳐진 바깥 도로와 지하에서 온다.',
    'An apartment complex on an autumn afternoon, emptied by the evacuation: the open corridors of block 101 (2F and 3F) and the flats broken into, the taekwondo studio over the arcade and its roof, the play tower, the wisteria pergola, the senior centre, and the car park under the garden (the ramp, the glass kiosk, the lobby stair). The zombies come from the outer roads behind the quarantine line and from below.'],
  env:{sky:1,sun:1,skyTex:'apSky',halo:'#ffd8a0',rain:0,storm:0,fog:'#c8c0ac',fogD:.009,bloomThr:.88,ambOut:'#7a705e',ambIn:'#3a3630',boAmb:.55},
  bounds:[-42,-42,42,40],probeY:[-2.7,-1.2,.9,2.4,4.5,6.2,8.1,9.8],mini:[-1.5,3.0,6.6],miniName:['B1','1F','2F','3F'],tex:bakeAptTex,build:buildApt};

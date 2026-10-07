'use strict';
// ============ Map "영동 휴게소 Yeongdong Rest Stop": a highway rest stop on a snowy winter night ============
// A wide snowed-in car park in the middle, the rest-stop building (convenience store + food court, roof reachable by an outside
// stair) to the south, a gas station with a canopy you can climb onto to the east, a pedestrian overbridge across the jammed
// highway to the north-west, and pine forest round the edges. Open sight lines for rifles; the building and the canopy to hold.
// Every texture is painted on first load.
Object.assign(MATS,{
  rsSnow:{t:'rsSnow',s:3,k:'soft'},rsSnowA:{t:'rsSnowA',s:8,k:'soft'},rsLot:{t:'rsLot',s:3.5,k:'soft'},rsWall:{t:'rsWall',s:3,vo:0,sv:8,k:'stone'},
  rsFacade:{t:'rsFacade',s:2.5,k:'stone'},rsIn:{t:'rsIn',s:2.5,k:'stone'},rsFloor:{t:'rsFloor',s:1.5,k:'stone'},rsCeil:{t:'rsCeil',s:1.2,emis:.12,k:'stone'},
  rsGlass:{t:'rsGlass',uv:'box',emis:.45,k:'glass'},rsShelf:{t:'rsShelf',s:1.4,k:'metal'},rsFridge:{t:'rsFridge',uv:'box',emis:.7,k:'glass'},
  rsCanopy:{t:'rsCanopy',uv:'boxV',s:3,k:'metal'},rsCanopyU:{t:'rsCanopyU',s:2,emis:1.0,k:'metal'},rsPump:{t:'rsPump',uv:'box',emis:.25,k:'metal'},
  rsSign:{t:'rsSign',uv:'box',emis:1.0,k:'metal'},rsPine:{t:'rsPine',s:2,k:'soft'},rsBark:{t:'rsBark',s:1,k:'wood'},rsBus:{t:'rsBus',uv:'boxV',s:12,k:'metal'},
  rsMark:{t:'rsMark',s:1,k:'soft'},rsMenu:{t:'rsMenu',uv:'box',emis:.6,k:'metal'},rsTable:{t:'rsTable',s:1,k:'wood'},
  // v5.9 expansion
  rsGiwa:{t:'rsGiwa',s:1.6,k:'stone'},rsHw:{t:'rsHw',uv:'box',emis:.35,k:'metal'},rsStallA:{t:'rsStallA',uv:'box',emis:.35,k:'wood'},rsStallB:{t:'rsStallB',uv:'box',emis:.35,k:'wood'},
  rsAwn:{t:'rsAwn',s:1.2,k:'soft'},rsVend:{t:'rsVend',uv:'box',emis:.45,k:'metal'},rsWC:{t:'rsWC',uv:'box',emis:.6,k:'metal'},rsWash:{t:'rsWash',uv:'box',emis:.7,k:'metal'},
  rsBrush:{t:'rsBrush',s:1,k:'soft'},rsBoxT:{t:'rsBoxT',uv:'boxV',s:8,k:'metal'},rsEv:{t:'rsEv',uv:'box',emis:.4,k:'metal'},rsPlayR:{t:'rsPlayR',s:1,k:'metal'},rsPlayB:{t:'rsPlayB',s:1,k:'metal'},
  rsPost:{t:'rsPost',uv:'box',emis:.08,k:'wood'},rsStall:{t:'rsStall',uv:'box',k:'wood'},rsMirror:{t:'rsMirror',uv:'box',emis:.2,k:'glass'},rsBooth:{t:'rsBooth',uv:'box',emis:.15,k:'glass'},
});
// ---------- textures ----------
// fresh snow: blue-white, wind ripples, sparkle
function texRsSnow(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const rip=Math.sin(y*.09+P.n(x,y,64,801,3)*7)*.5+.5;
    let t=.62+(P.n(x,y,48,802,3)-.5)*.3+(rip-.5)*.08+(hash2(x,y,803)-.5)*.06;P.set(x,y,dith(P,x,y,t,['#8a96ac','#9aa6bc','#aab6ca','#bcc6d6','#ccd4e2','#dce2ec','#e8ecf4'],.08));
    if(hash2(x,y,804)<.006)P.set(x,y,'#ffffff')}
  for(let i=0;i<14;i++){let x=hash2(i,1,805)*N,y=hash2(i,2,805)*N;const a=hash2(i,3,805)*TAU;for(let k=0;k<26;k++){x+=Math.cos(a)*5;y+=Math.sin(a)*5;for(const s of [-1,1])P.set(Math.round(x+Math.sin(a)*s*3),Math.round(y-Math.cos(a)*s*3),'#7e8aa2',.5)}}})}// footprints
// snowed-over highway: rutted wheel tracks through the snow, asphalt showing in them
function texRsSnowA(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x+(P.n(x,y,32,811,2)-.5)*10)%128;const rut=Math.min(Math.abs(u-34),Math.abs(u-94));
    let c;if(rut<9+P.n(x,y,16,812,2)*5){const t=.45+(P.n(x,y,16,813,3)-.5)*.4+(hash2(x,y,814)-.5)*.2;c=dith(P,x,y,t,['#1c1e22','#26282e','#30333a','#3c4048','#5a6070'],.12);if(rut>7&&hash2(x,y,815)<.4)c=mix(c,'#c8d0dc',.6)}
    else{const t=.6+(P.n(x,y,40,816,3)-.5)*.35+(hash2(x,y,817)-.5)*.08;c=dith(P,x,y,t,['#8e9ab0','#a0acc0','#b2bcce','#c4ccdc','#d6dce8'],.08)}P.set(x,y,c)}})}
// car park: dark asphalt with trampled slush and snow drifts
function texRsLot(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=P.n(x,y,56,821,4);let c;
    if(s>.52){const t=.55+(s-.52)*1.5+(hash2(x,y,822)-.5)*.1;c=dith(P,x,y,clamp(t,0,1),['#7a8498','#909aae','#a6b0c2','#bcc4d4','#d0d6e2'],.1)}
    else{const t=.45+(P.n(x,y,12,823,2)-.5)*.35+(hash2(x,y,824)-.5)*.2;c=dith(P,x,y,t,['#1e2024','#26292e','#2e3238','#383c44','#444a54'],.12);if(s>.47)c=mix(c,'#6a7488',(s-.47)*14)}
    P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,825)*N,hash2(i,2,825)*N,10+hash2(i,3,825)*24,8+hash2(i,4,825)*16,.18,826+i)})}
// highway sound wall: ribbed concrete panels, grime streaks, snow caught on the ribs
function texRsWall(){const W=256,H=512;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const rib=(x%32);let t=.5+(P.n(x,y,24,831,3)-.5)*.3+(hash2(x,y,832)-.5)*.1;if(rib<3)t-=.25;else if(rib<6)t+=.12;if(y%128<3)t-=.3;
    let c=dith(P,x,y,t,['#2a2e32','#363b40','#42484e','#50565c','#5e646a','#6c7278'],.1);if(rib>=3&&rib<6&&P.n(x,y,8,833,2)>.45)c=mix(c,'#c8d0dc',.7);if(y<10+P.n(x,0,8,834,2)*14)c=mix(c,'#dce2ec',.8);P.set(x,y,c)}
  for(let i=0;i<40;i++)streak(P,Math.floor(hash2(i,1,835)*W),Math.floor(hash2(i,2,835)*60),80+Math.floor(hash2(i,3,835)*380),.12+hash2(i,4,835)*.18,1+Math.floor(hash2(i,5,835)*3))})}
// building outside: cream render over a grey stone plinth
function texRsFacade(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,40,841,3)-.5)*.2+(hash2(x,y,842)-.5)*.08;
  let c=dith(P,x,y,t,['#8a8070','#9a907e','#aaa08c','#bab09a','#c8bea8'],.08);if(y>N-30){c=dith(P,x,y,.4+(P.n(x,y,12,843,2)-.5)*.4,['#3a3c40','#4a4c50','#5a5c60','#6a6c70'],.1);if(y===N-30)c='#2a2c30'}P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,844)*N),0,40+Math.floor(hash2(i,2,844)*120),.1,2)})}
function texRsIn(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.6+(P.n(x,y,48,851,2)-.5)*.12+(hash2(x,y,852)-.5)*.05;let c=dith(P,x,y,t,['#a8aca8','#b8bcb8','#c8ccc6','#d4d8d2'],.06);
  if(y>N-24)c=y===N-24?'#5a6a7a':'#7a8a9a';P.set(x,y,c)}for(let i=0;i<6;i++)stain(P,hash2(i,1,853)*N,hash2(i,2,853)*N,20,14,.12,854+i)})}
function texRsFloor(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=Math.floor(x/64),ty=Math.floor(y/64),ed=x%64<2||y%64<2;
  let t=.55+((tx+ty)&1?.08:-.04)+(P.n(x,y,16,861,2)-.5)*.12+(hash2(x,y,862)-.5)*.06;let c=ed?'#4a4c50':dith(P,x,y,t,['#8a8e94','#9a9ea4','#aaaeb4','#babec4'],.06);P.set(x,y,c)}
  for(let i=0;i<14;i++)stain(P,hash2(i,1,863)*N,hash2(i,2,863)*N,8+hash2(i,3,863)*20,6+hash2(i,4,863)*12,.14,864+i)})}// wet, dirty tiles
function texRsCeil(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%128,gy=y%128;let c=gx<3||gy<3?'#6a6e72':dith(P,x,y,.6+(hash2(x,y,871)-.5)*.1,['#b8bcbe','#c4c8ca','#d0d4d6'],.05);
  if(gx>40&&gx<88&&gy>40&&gy<88)c=gx<44||gx>84||gy<44||gy>84?'#8a8e92':'#f4f8ff';P.set(x,y,c)}})}// tiles with a light panel in every fourth
// shop window: dark glass, lit store behind it — shelves, a counter, reflections
function texRsGlass(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=mix('#3a4a5a','#cfe0ec',clamp((y-20)/100,0,1)*.55);
  if(y>70&&y<118&&(x%40<34)){const row=Math.floor((y-70)/12);c=(y-70)%12<2?'#3a3e44':mix(rpickH(Math.floor(x/5)+row*7,['#c84a3a','#e8c04a','#4a8ac8','#5aa85a','#e8e0d0','#c86ab0']),'#202428',.25)}
  if(y<6||x<4||x>123||y>123)c='#22262a';if((x+y*.6)%70<6)c=mix(c,'#ffffff',.25);P.set(x,y,c)}
  for(let x=0;x<128;x++)if(x%64<3)for(let y=0;y<128;y++)P.set(x,y,'#22262a')})}
function texRsShelf(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sh=y%32;let c;
  if(sh<4)c=sh<2?'#c8ccd0':'#7a7e84';else{const i=Math.floor(x/16)+Math.floor(y/32)*17;const w=x%16,top=4+Math.floor(hash2(i,1,895)*12);
    c=(w<2||sh<top)?'#1a1c20':rpickH(i,['#c84a3a','#e8c04a','#4a8ac8','#5aa85a','#f0e8d8','#c86ab0','#e87a3a','#2a7a6a']);if(sh>=top&&sh<top+3)c=lt(c,.25);if(sh>=top&&(w===8||w===9)&&hash2(i,2,895)<.5)c=dk(c,.3)}
  P.set(x,y,c)}})}
function texRsFridge(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c='#dceaf4';const sh=(y-8)%30;
  if(x<6||x>121||y<8||y>120||x%42<3)c='#3a3e44';else if(sh<3)c='#8a9aa8';else if(sh>8){const i=Math.floor(x/7)+Math.floor(y/30)*19;c=mix(rpickH(i,['#d83a2a','#3a8ad8','#e8d04a','#2a2a2a','#5ac85a','#f0f0f0']),'#dceaf4',.2)}P.set(x,y,c)}})}
// gas canopy fascia: white panels with a red and a blue band (no brand)
function texRsCanopy(){const W=512,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.6+(hash2(x,y,881)-.5)*.1,['#c8ccd0','#d8dce0','#e8ecf0'],.05);
  if(y>16&&y<30)c='#c83228';else if(y>=30&&y<38)c='#2a4a9a';if(x%128<2)c='#8a8e92';if(y<6)c=mix('#e8eef6','#ffffff',hash2(x,y,882));if(y>H-3)c='#5a5e62';P.set(x,y,c)}})}
function texRsCanopyU(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%64,gy=y%64;let c=gx<2||gy<2?'#6a6e72':'#9a9ea2';
  if(gx>14&&gx<50&&gy>20&&gy<44)c=gx<17||gx>47||gy<23||gy>41?'#c8ccd0':'#ffffff';P.set(x,y,c)}})}
function texRsPump(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.6+(hash2(x,y,891)-.5)*.1,['#c8ccd0','#d8dce0','#e4e8ec'],.06);
  if(y>96)c='#c83228';if(y>10&&y<40&&x>20&&x<108)c=(x>26&&x<102&&y>16&&y<34)?(((x>>2)+(y>>2))%5===0?'#3a5a3a':'#1a2a1a'):'#2a2c30';// display
  if(y>48&&y<84&&x>30&&x<58)c='#2a2c30';if(y>52&&y<80&&x>34&&x<54&&(x+y)%9<2)c='#4a4e54';// holster
  if(y>50&&y<62&&x>70&&x<100)c=x%8<5?'#f0e8a0':'#2a2c30';P.set(x,y,c)}})}
// the rest-stop pylon sign: lit panel, Korean name, REST AREA, fuel and food pictograms
function texRsSign(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=mix('#123a7a','#1c56a8',y/128);if(x<5||x>250||y<5||y>122)c='#0a1a3a';if(y>88&&y<92)c='#e8eef8';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffffff';x.textAlign='center';x.textBaseline='middle';x.font='bold 40px "Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';x.fillText('영동 휴게소',128,48);
    x.font='bold 22px "Galmuri11",sans-serif';x.fillStyle='#ffd24a';x.fillText('REST AREA',128,108);
    x.fillStyle='#ffffff';x.fillRect(20,96,4,22);x.fillRect(16,96,12,3);x.fillRect(222,98,12,18);x.fillRect(230,94,3,10)}})}// fork, fuel pump
function texRsPine(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,10,901,3);let t=.4+(n-.5)*.6+(hash2(x,y,902)-.5)*.2;
  let c=dith(P,x,y,t,['#0e1a14','#14241a','#1a2e20','#223a28','#2c4632'],.14);if(P.n(x,y,20,903,3)>.6&&(y%40)<16)c=mix(c,'#dce4ee',.85);P.set(x,y,c)}})}// needles, clumps of snow
function texRsBark(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.45+Math.sin(x*.6+P.n(x,y,8,911,2)*5)*.15+(hash2(x,y,912)-.5)*.15;P.set(x,y,dith(P,x,y,t,['#2a1c14','#3a281c','#4a3424','#5a402c'],.1))}})}
// a stranded highway bus: cream with a green band, a row of dark windows, a door
function texRsBus(){const W=512,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,.6+(hash2(x,y,921)-.5)*.1,['#c8c0a8','#d4ccb4','#e0d8c0'],.05);
  if(y>70&&y<84)c='#2a6a4a';if(y>18&&y<62&&x%62>6&&x>40){c=mix('#1a2028','#4a5a6a',(y-18)/60);if((x+y)%50<4)c='#6a7a8a'}if(x>8&&x<36&&y>18&&y<120)c=y<62?'#1a2028':'#3a3e44';
  if(y<8)c=mix('#e8eef6','#ffffff',hash2(x,y,922));if(y>112)c='#2a2c30';P.set(x,y,c)}})}
function texRsMark(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++)P.set(x,y,hash2(x,y,931)<.25?'#9aa2ae':mix('#e8e4d0','#ffffff',hash2(x,y,932)*.4))})}
function texRsMenu(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c='#1a1c20';const i=Math.floor(x/64);if(x%64>4&&x%64<60&&y>6&&y<40)c=rpickH(i,['#c86a3a','#e8b04a','#c84a3a','#8ab04a']);if(y>44&&y<54&&x%64>8&&x%64<50)c='#f0f0e8';P.set(x,y,c)}})}
function texRsTable(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,dith(P,x,y,.5+Math.sin(y*.4+P.n(x,y,16,941,2)*4)*.15,['#8a6a4a','#9a7a58','#aa8a66'],.08))})}
// ---------- v5.9 expansion textures ----------
const RS_FONT='"Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
// giwa roof tiles: dark grey rounded rows, snow lying in the troughs
function texRsGiwa(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=y%16,c0=x%16;const sh=Math.sin(c0/16*Math.PI);let t=.35+sh*.35-(r<2?.25:0)+(hash2(x,y,951)-.5)*.1;
  let c=dith(P,x,y,t,['#1a1c20','#2a2c32','#3a3e44','#4c5058','#5e646c'],.1);if(c0<3&&P.n(x,y,8,952,2)>.4)c=mix(c,'#dce2ec',.8);P.set(x,y,c)}})}
// highway direction sign: green board, white border, two destinations with distances
function texRsHw(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=mix('#0e5a36','#13704a',y/128);if(x<4||x>251||y<4||y>123)c='#0a2a1a';if(x>=6&&x<=249&&(y===6||y===121)||(y>=6&&y<=121&&(x===6||x===249)))c='#f0f4f0';if(y<8&&hash2(x,y,961)<.8)c='#e8eef6';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffffff';x.textBaseline='middle';x.textAlign='left';x.font='bold 30px '+RS_FONT;x.fillText('강릉',22,38);x.fillText('대관령',22,90);
    x.font='bold 14px '+RS_FONT;x.fillText('Gangneung',96,40);x.fillText('Daegwallyeong',120,92);x.textAlign='right';x.font='bold 28px '+RS_FONT;x.fillText('76',236,38);x.fillText('12',236,90);
    x.fillRect(14,63,228,3);x.beginPath();x.moveTo(216,22);x.lineTo(232,12);x.lineTo(232,32);x.fill()}})}
// snack stalls (포장마차): a lit counter front with the menu name painted on it
function texRsStallF(name,c0,c1){return paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++){let c=mix(c0,c1,y/96);if(y<6||y>88)c='#3a2a1a';if(x<5||x>250)c='#3a2a1a';if(y>66&&y<70)c='#f0e0a0';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#fff6d8';x.textAlign='center';x.textBaseline='middle';x.font='bold 40px '+RS_FONT;x.fillText(name,128,38);x.font='bold 13px '+RS_FONT;x.fillStyle='#3a2a1a';x.fillText('따끈따끈 · 2,000원',128,80)}})}
function texRsAwn(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=(x>>4)&1?'#f0ece4':'#c8322a';if(y<8&&hash2(x,y,971)<.85)c='#e8eef6';P.set(x,y,dith(P,x,y,.5,[dk(c,.08),c,lt(c,.05)],.06))}})}
// drinks vending machine: red body, a lit window of cans, the coin panel, the pickup slot
function texRsVend(){return paint(96,192,P=>{for(let y=0;y<192;y++)for(let x=0;x<96;x++){let c=dith(P,x,y,.55+(hash2(x,y,981)-.5)*.1,['#9a1a1a','#b82626','#c83a30'],.06);
  if(x>8&&x<66&&y>14&&y<120){c='#eaf2f8';const r=(y-14)%26;if(r>4&&r<22&&(x-8)%11>2)c=rpickH(Math.floor((x-8)/11)+Math.floor((y-14)/26)*7,['#2a6ad8','#e8c040','#30a050','#e04a2a','#f0f0f0','#6a3ac8']);if(r<3)c='#9aa4ae'}
  if(x>72&&x<88&&y>30&&y<100)c=y%14<6?'#2a2c30':'#d8dce0';if(x>16&&x<80&&y>140&&y<168)c=y<146?'#2a2c30':'#14161a';if(y<8)c=mix('#e8eef6','#ffffff',hash2(x,y,982));P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffffff';x.textAlign='center';x.font='bold 13px '+RS_FONT;x.fillText('음료',48,134)}})}
// restroom sign: blue panel, man and woman pictograms, 화장실
function texRsWC(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=mix('#1a4a9a','#2a5ab0',y/64);if(x<3||x>252||y<3||y>60)c='#0a1a3a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#ffffff';const fig=(cx,skirt)=>{x.beginPath();x.arc(cx,16,5,0,TAU);x.fill();if(skirt){x.beginPath();x.moveTo(cx,22);x.lineTo(cx-9,44);x.lineTo(cx+9,44);x.fill();x.fillRect(cx-4,44,3,12);x.fillRect(cx+1,44,3,12)}else{x.fillRect(cx-6,23,12,20);x.fillRect(cx-5,43,4,14);x.fillRect(cx+1,43,4,14)}};
    fig(24,0);fig(232,1);x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+RS_FONT;x.fillText('화장실',128,28);x.font='bold 11px '+RS_FONT;x.fillText('RESTROOM',128,52)}})}
function texRsWash(){return paint(256,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<256;x++){let c=mix('#e8eef4','#c8d4e0',y/64);if(y>48)c='#1a6ac8';if(y<4||y>60)c='#3a4a5a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#1a4a9a';x.textAlign='center';x.textBaseline='middle';x.font='bold 32px '+RS_FONT;x.fillText('셀프 세차장',128,26);x.fillStyle='#ffffff';x.font='bold 10px '+RS_FONT;x.fillText('24시간 · 고압세차',128,56)}})}
function texRsBrush(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const t=.5+Math.sin(x*1.3+P.n(x,y,6,991,2)*6)*.25+(hash2(x,y,992)-.5)*.2;P.set(x,y,dith(P,x,y,t,['#0a2a6a','#1a4aa0','#2a6ad0','#5a9ae8'],.12))}})}
// delivery truck box: white panels, a blue band, ribs
function texRsBoxT(){return paint(512,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<512;x++){let c=dith(P,x,y,.6+(hash2(x,y,1001)-.5)*.1,['#c8ccd0','#d8dce0','#e8ecf0'],.05);if(y>78&&y<94)c='#1a5ab0';if(x%64<2)c='#9aa0a6';if(y<8)c=mix('#e8eef6','#ffffff',hash2(x,y,1002));if(y>122)c='#5a5e62';P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,1003)*512),8,40+Math.floor(hash2(i,2,1003)*60),.12,2);
  P.post=x=>{x.fillStyle='#1a3a7a';x.textBaseline='middle';x.font='bold 28px '+RS_FONT;x.textAlign='center';for(const cx of [128,384])x.fillText('신선 냉동 물류',cx,50)}})}
function texRsEv(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.6+(hash2(x,y,1011)-.5)*.1,['#d8dce0','#e4e8ec','#f0f4f6'],.05);if(y>100)c='#2aa060';if(x>10&&x<54&&y>18&&y<50)c=x<13||x>51||y<21||y>47?'#2a2c30':mix('#0a3a2a','#2ac080',((x>>2)+(y>>2))%4===0?.8:.3);
  if(y<6)c='#e8eef6';P.set(x,y,c)}P.post=x=>{x.fillStyle='#1a6a40';x.textAlign='center';x.font='bold 10px '+RS_FONT;x.fillText('충전',32,72);x.fillText('EV',32,88)}})}
function texRsFlat(c0,c1,seed){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=dith(P,x,y,.5+(P.n(x,y,8,seed,2)-.5)*.4,[dk(c0,.1),c0,c1],.1);if(hash2(x,y,seed+1)<.04)c='#5a5e62';P.set(x,y,c)}})}
// trail signpost board
function texRsPost(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+Math.sin(y*.5+P.n(x,y,12,1021,2)*3)*.15,['#5a3a20','#6a4a2a','#7a5a36'],.08);if(y<5)c='#e8eef6';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#f4ead0';x.textBaseline='middle';x.textAlign='left';x.font='bold 15px '+RS_FONT;x.fillText('← 전망대',8,24);x.fillText('정자 쉼터 →',30,48)}})}
function texRsStall(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,.5+(hash2(x,y,1031)-.5)*.15,['#6a4a2a','#7a5a36','#8a6a44'],.08))})}
function texRsMirror(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#8a9aa8','#d8e4ec',clamp((x+y)/110,0,1));if((x+y*.7)%40<5)c=mix(c,'#ffffff',.4);if(x<2||y<2||x>61||y>61)c='#4a4e54';P.set(x,y,c)}})}
function texRsBooth(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#3a4a5a','#7a8a9a',y/64);if((x+y*.6)%48<4)c=mix(c,'#ffffff',.25);if(x<3||x>60||y<3||y>60)c='#2a2c30';if(y>52)c=mix(c,'#c8d0dc',.5);P.set(x,y,c)}})}
function bakeRestTex(){if(TEX.rsSnow)return;
  TEX.rsSnow=mkTex(texRsSnow());TEX.rsSnowA=mkTex(texRsSnowA());TEX.rsLot=mkTex(texRsLot());TEX.rsWall=mkTex(texRsWall());TEX.rsFacade=mkTex(texRsFacade());TEX.rsIn=mkTex(texRsIn());
  TEX.rsFloor=mkTex(texRsFloor());TEX.rsCeil=mkTex(texRsCeil());TEX.rsGlass=mkTex(texRsGlass(),false);TEX.rsShelf=mkTex(texRsShelf());TEX.rsFridge=mkTex(texRsFridge(),false);
  TEX.rsCanopy=mkTex(texRsCanopy());TEX.rsCanopyU=mkTex(texRsCanopyU());TEX.rsPump=mkTex(texRsPump(),false);TEX.rsSign=mkTex(texRsSign(),false);TEX.rsPine=mkTex(texRsPine());
  TEX.rsBark=mkTex(texRsBark());TEX.rsBus=mkTex(texRsBus());TEX.rsMark=mkTex(texRsMark());TEX.rsMenu=mkTex(texRsMenu(),false);TEX.rsTable=mkTex(texRsTable());
  TEX.rsGiwa=mkTex(texRsGiwa());TEX.rsHw=mkTex(texRsHw(),false);TEX.rsStallA=mkTex(texRsStallF('호두과자','#c8642a','#a8481a'),false);TEX.rsStallB=mkTex(texRsStallF('핫바 · 어묵','#2a6ab0','#1a4a8a'),false);
  TEX.rsAwn=mkTex(texRsAwn());TEX.rsVend=mkTex(texRsVend(),false);TEX.rsWC=mkTex(texRsWC(),false);TEX.rsWash=mkTex(texRsWash(),false);TEX.rsBrush=mkTex(texRsBrush());TEX.rsBoxT=mkTex(texRsBoxT());
  TEX.rsEv=mkTex(texRsEv(),false);TEX.rsPlayR=mkTex(texRsFlat('#c8322a','#e04a3a',1041));TEX.rsPlayB=mkTex(texRsFlat('#1a5ab0','#2a72d0',1043));TEX.rsPost=mkTex(texRsPost(),false);
  TEX.rsStall=mkTex(texRsStall());TEX.rsMirror=mkTex(texRsMirror(),false);TEX.rsBooth=mkTex(texRsBooth(),false)}
// ---------- the map ----------
// v5.9: grown to 116 × 82 m — truck park and self car wash to the east, a 정자 pavilion and an observation deck in the pines to
// the west, a service road behind the building with the restrooms, a smoking booth, a playground and a delivery truck at the back door,
// snack stalls and vending machines out front, an overhead direction gantry on the highway.
function buildRest(){const N='none',SN='rsSnow',CV={nosolid:true};
  // ================= ground: highway, car park, truck park, service road, pavement, floors, snow elsewhere =================
  {const R=[[-57,-32,57,-18,'rsSnowA'],[-30,-18,30,11,'rsLot'],[30,-18,40,8,'rsLot'],[40,-18,56,30,'rsLot'],[-40,24,40,31,'rsLot'],[-30,11,-23,24,'rsLot'],[32,8,40,24,'rsLot'],
      [-22,11,14,13,'concf'],[-20,13,10,24,'rsFloor'],[-30,32,-16,42,'tile'],[-26,31,-18,32,'concf'],[0,32,14,37,'concf'],[-43.5,-3.8,-30,-2.2,'concf']];
    const xs=new Set([-57,57]),zs=new Set([-32,49]);
    for(const r of R){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m=SN;for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
        if(run&&run.m===m)run.x1=X[i+1];else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}}
  // ================= the edges: highway sound wall to the north, snowy embankments with pines on the other three sides =================
  B(-58,-1,-33.2,58,8,-32,'rsWall',{f:{nz:N,py:SN}});
  B(-58.2,-1,-32,-57,7,49,SN,{f:{nx:N}});B(57,-1,-32,58.2,7,49,SN,{f:{px:N}});B(-58,-1,49,58,7,50.2,SN,{f:{pz:N}});
  for(const [x0,z0,x1,z1,h] of [[-57,-18,-55.6,49,3.2],[-55.6,-18,-54.6,47.6,1.4],[55.6,-18,57,49,3.2],[54.8,34,55.6,47.6,1.4],[-55.6,47.6,55.6,49,3.2],[-54.6,46.6,54.8,47.6,1.3]])B(x0,0,z0,x1,h,z1,SN,{f:{py:SN}});
  const pine=(x,z,h)=>{h=h||5;B(x-.16,0,z-.16,x+.16,1.1,z+.16,'rsBark');const t=[[1.5,1,2.4],[1.15,2.2,3.6],[.8,3.4,4.6],[.42,4.5,h+.6]];
    for(const [r,y0,y1] of t)B(x-r,y0,z-r,x+r,Math.min(y1,y0+(h/5)*1.3),z+r,'rsPine',{f:{py:SN}})};
  for(const [x,z,h] of [[-36.5,-17.2,5.5],[-36.2,3,5.2],[-35.8,10,6.2],[-36,18,5.6],[-55,-9,6],[-41,-12.5,5.4],[-40,2,5.8],[-55.2,3,5.2],[-52.5,26,6.2],[-45,28.5,5.6],[-40,19.5,6],
    [-55,37,6.4],[-47.5,41,5.4],[-38.5,44.5,6],[-41,33.5,5.2],[-9,36.5,5.6],[-12,44,6.2],[-2,42,5.4],[5,44.5,6],[15.5,41.5,5.8],[38,36,6.2],[44,40.5,5.4],[50.5,34,6],[52,43,5.6],
    [36,18,5.8],[36.2,12.5,5.2],[30,22.5,5.4],[24,23,6]])pine(x,z,h);
  const snowman=(x,z)=>{B(x-.45,0,z-.45,x+.45,.85,z+.45,SN);B(x-.55,.12,z-.32,x+.55,.72,z+.32,SN,CV);B(x-.32,.12,z-.55,x+.32,.72,z+.55,SN,CV);
    B(x-.32,.85,z-.32,x+.32,1.45,z+.32,SN);B(x-.38,.95,z-.22,x+.38,1.35,z+.22,SN,CV);B(x-.22,1.45,z-.22,x+.22,1.85,z+.22,SN);
    B(x-.13,1.62,z-.25,x-.05,1.7,z-.21,'tire',CV);B(x+.05,1.62,z-.25,x+.13,1.7,z-.21,'tire',CV);B(x-.04,1.54,z-.42,x+.04,1.6,z-.22,'cone',CV);
    B(x-.2,1.85,z-.2,x+.2,2.1,z+.2,'rsPlayR',CV);B(x-.9,1.15,z-.03,x-.38,1.2,z+.03,'rsBark',CV);B(x+.38,1.15,z-.03,x+.9,1.25,z+.03,'rsBark',CV)};
  const bench=(x0,z0,x1,z1)=>{const ax=(x1-x0)>(z1-z0);B(x0,.4,z0,x1,.48,z1,'rsTable',{f:{py:SN}});
    for(const e of [0,1])ax?B(e?x1-.18:x0+.08,0,z0+.05,e?x1-.08:x0+.18,.4,z1-.05,'metal2'):B(x0+.05,0,e?z1-.18:z0+.08,x1-.05,.4,e?z1-.08:z0+.18,'metal2')};
  const burn=(x,z)=>{drum(x,z,0,'drumR');LIGHT(x,1.35,z,'#ff8a3a',8,1.0);MAP.fires.push([x,.9,z])};
  const pole=(x,z,h,col,r,i)=>{B(x-.1,0,z-.1,x+.1,h,z+.1,'metal2');B(x-.5,h,z-.18,x+.5,h+.15,z+.18,'metal2',{f:{py:SN}});B(x-.4,h-.05,z-.12,x+.4,h,z+.12,col==='#ffb060'?'lampO':'lampW',CV);LIGHT(x,h-.4,z,col,r,i)};
  // ================= the highway: two carriageways, a concrete median, a jam of abandoned cars, a jackknifed truck, a direction gantry =================
  for(let x=-56;x<56;x+=6){B(x,0,-28.62,x+3,.006,-28.38,'rsMark',CV);B(x,0,-21.62,x+3,.006,-21.38,'rsMark',CV)}
  for(const [x0,x1] of [[-57,-40],[-37,-22],[-19,4],[7,26],[29,44],[47,57]])B(x0,0,-25.4,x1,.9,-24.6,'barrier',{f:{py:SN}});// median with gaps
  // solid stepped handrail beside a stair flight (keeps climbers on the steps; nav no longer offers side jumps onto them)
  const rail=(axis,c0,c1,a0,a1,y0,y1,n,mat)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1)+1;
    if(axis==='z')B(c0,y0,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat||'metal2');else B(Math.min(s0,s1),y0,c0,Math.max(s0,s1),top,c1,mat||'metal2')}};
  const snowcap=(x0,z0,x1,z1,y)=>B(x0,y,z0,x1,y+.08,z1,SN,CV);
  const parked=(x0,z0,x1,z1,mat)=>{car(x0,z0,x1,z1,mat);const ax=(x1-x0)>=(z1-z0);if(ax)snowcap(x0+1.25,z0+.15,x1-1.1,z1-.15,1.48);else snowcap(x0+.15,z0+1.25,x1-.15,z1-1.1,1.48)};
  parked(-31,-30.8,-26.6,-29,'car');parked(-17.5,-27.4,-13.1,-25.6,'carR');parked(-6,-31,-1.6,-29.2,'car');parked(9,-27.6,13.4,-25.8,'carBurnt');parked(18,-23.4,22.4,-21.6,'car');
  parked(-25,-23.2,-20.6,-21.4,'carR');parked(30,-30.6,34.4,-28.8,'carR');parked(-38,-23.4,-33.6,-21.6,'carBurnt');
  parked(-52,-30.8,-47.6,-29,'carR');parked(-46,-23.4,-41.6,-21.6,'car');parked(40,-27.4,44.4,-25.6,'car');parked(50,-23.2,54.4,-21.4,'carBurnt');parked(-50,-27.6,-45.6,-25.8,'car');
  MAP.smoke.push([11.2,1.6,-26.7],[-35.8,1.6,-22.5],[52.2,1.6,-22.3]);
  // the truck: a cab nosed into the median, the trailer swung across both lanes
  B(2,.45,-24.2,4.6,3.1,-21.8,'car',{f:{py:SN}});B(2.15,1.9,-24.25,3.4,2.9,-21.75,'carGl',{f:{py:SN}});
  B(4.8,1.1,-29.2,6.9,4.0,-18.6,'contR',{f:{py:SN}});for(const z of [-28.4,-27.2,-20.4,-19.2])B(4.9,0,z-.3,6.8,1.1,z+.3,'tire');
  // overhead direction gantry: two posts, a beam, a green board over each carriageway
  for(const z of [-31.9,-18.5])B(46.8,0,z,47.2,7.2,z+.4,'metal2');B(46.75,6.9,-31.9,47.25,7.2,-18.1,'metal2',{f:{py:SN}});
  for(const [z0,z1] of [[-30.6,-25.9],[-24.1,-19.4]])B(46.85,5.0,z0,47.15,6.9,z1,'rsHw',CV);LIGHT(47.6,6.4,-25,'#d8e4ff',7,.45);LIGHT(46.4,6.4,-25,'#d8e4ff',7,.45);
  // ================= the overbridge: a stair up from the car park, a deck across the highway =================
  const DY=5.5,BX0=-33.5,BX1=-31;
  stairs('z',BX0,BX1,-4.25,-14.25,0,DY,20,'conc',{f:{py:'concf'}});
  B(BX0,DY-.3,-31,BX1,DY,-14.25,'conc',{f:{py:'concf'}});
  for(const x of [BX0-.12,BX1])B(x,DY,-31,x+.12,DY+1.1,-14.25,'metal2',{f:{py:SN}});// parapets
  B(BX0,DY,-31.2,BX1,DY+1.1,-31,'metal2');
  for(const x of [BX0-.12,BX1])B(x,0,-14.25,x+.12,1.1,-4.25,'metal2',{nosolid:true});
  for(const z of [-26,-19])B(BX0+.4,0,z-.4,BX1-.4,DY-.3,z+.4,'conc');// piers
  LIGHT(-32.2,DY+2.2,-22,'#cfe0ff',9,.7);B(-32.4,DY+1.1,-22.1,-32,DY+2.4,-21.9,'metal2',CV);B(-32.5,DY+2.3,-22.2,-31.9,DY+2.45,-21.8,'lampW',CV);
  // ================= the rest-stop building: convenience store (west), food court (east), roof by an outside stair =================
  const X0=-20,X1=10,Z0=13,Z1=24,H=3.6,T=.25,FA='rsFacade',IN='rsIn';
  const exX=(z0,z1,holes,out)=>wallX(X0,X1,z0,z1,0,H,FA,holes,{f:out<0?{nz:FA,pz:IN}:{pz:FA,nz:IN}});
  const DR=[[-12.5,-10.5,0,2.4],[1.5,3.5,0,2.4]],WN=[[-19,-13.5,.6,3],[-9.5,-6.2,.6,3],[-4.2,.5,.6,3],[4.5,9,.6,3]];
  exX(Z0,Z0+T,DR.concat(WN),-1);for(const [u0,u1,y0,y1] of WN)B(u0,y0,Z0+.08,u1,y1,Z0+.17,'rsGlass');
  for(const [u0,u1] of DR)B(u0-.1,2.4,Z0-.05,u1+.1,2.6,Z0+T+.05,'metal2');
  exX(Z1-T,Z1,[[-3,-1,0,2.3]],1);// back door
  wallZ(X0,X0+T,Z0+T,Z1-T,0,H,FA,[],{f:{nx:FA,px:IN}});wallZ(X1-T,X1,Z0+T,Z1-T,0,H,FA,[[15,17,0,2.3]],{f:{px:FA,nx:IN}});
  wallZ(-5.1,-4.9,Z0+T,Z1-T,0,H,IN,[[17.5,19.8,0,2.4]]);// store | food court
  B(X0,H,Z0,X1,H+.25,Z1,'rsCeil',{f:{py:SN}});
  for(const [x0,z0,x1,z1] of [[X0,Z1-.3,X1,Z1],[X1-.3,Z0,X1,Z1],[X0,Z0,X1,Z0+.3],[X0,15.6,X0+.3,Z1]])B(x0,H+.25,z0,x1,H+.75,z1,FA,{f:{py:SN}});// parapet (gap at the stair head)
  B(-14,H+.25,17,-12,H+1.2,19.5,'metal2',{f:{py:SN}});B(2,H+.25,19,5,H+1.4,21.5,'metal2',{f:{py:SN}});MAP.smoke.push([3.5,H+1.6,20.2]);// roof plant, kitchen vent steaming
  // string of coloured bulbs along the front parapet
  {let i=0;for(let x=X0+.4;x<X1-.3;x+=.75,i++)B(x-.06,H+.62,Z0-.08,x+.06,H+.74,Z0+.04,['lampR','lampO','lampW'][i%3],CV)}
  LIGHT(-12,H+.6,Z0-.6,'#ffb0a0',6,.35);LIGHT(2,H+.6,Z0-.6,'#ffe0a0',6,.35);
  stairs('z',-21.75,-20.25,24.25,15.75,0,H+.25,16,'metal2',{f:{py:'concf'}});B(-21.75,0,13.25,-20,H+.25,15.75,'conc',{f:{py:'concf'}});
  B(-21.9,0,15.75,-21.75,H+1.2,24.25,'metal2',CV);
  for(const z of [16.2,18.6,21])B(-18.2,0,z-.32,-13.2,1.65,z+.32,'rsShelf',{f:{py:'metal'}});
  B(-9.6,0,15.2,-8.9,1.65,21.8,'rsShelf',{f:{py:'metal'}});
  B(X0+T,0,15,X0+T+.7,2.2,22.8,'metal',{f:{px:'rsFridge'}});
  B(-11.4,0,15.6,-9.8,1.05,16.4,'metal',{f:{py:'metal2'}});B(-12.6,0,16.4,-9.8,1.05,17,'metal',{f:{py:'metal2'}});
  for(const [x,z] of [[-2,16],[2,16],[6,16],[-2,19.5],[2,19.5],[6,19.5]]){B(x-.6,.72,z-.45,x+.6,.78,z+.45,'rsTable');B(x-.06,0,z-.06,x+.06,.72,z+.06,'metal2');
    for(const dz of [-.8,.8])B(x-.2,0,z+dz-.18,x+.2,.45,z+dz+.18,'metal2')}
  B(-4.6,0,22.4,9.6,1.05,23.75,'metal',{f:{py:'metal2'}});B(-3.5,2.1,23.7,8.5,3,23.74,'rsMenu',CV);
  for(const [x,z,c] of [[-16,18.5,'#e8f4ff'],[-10,18.5,'#e8f4ff'],[-1,18,'#ffe6c0'],[6,18,'#ffe6c0']])LIGHT(x,H-.3,z,c,9,.95);
  for(const x of [-15,-7,2,7])LIGHT(x,2,11.4,'#d8ecff',6,.55);
  // out front: drinks machines, benches, bins, two snack stalls (호두과자, 핫바·어묵) facing the car park
  const vend=(x0,z0,face)=>{const f={px:'metal',nx:'metal',py:'metal',ny:'metal',pz:'metal',nz:'metal'};f[face]='rsVend';B(x0,0,z0,x0+.95,1.9,z0+.8,'rsVend',{f});B(x0-.02,1.9,z0-.02,x0+.97,1.98,z0+.82,SN,CV);LIGHT(x0+.5,1.4,face==='nz'?z0-.6:z0+1.4,'#ffd0d0',3.5,.45)};
  vend(5.15,12.15,'nz');vend(6.3,12.15,'nz');
  bench(-17,11.4,-15.4,11.85);bench(-8.4,11.4,-6.8,11.85);bench(-.9,11.4,.7,11.85);
  for(const x of [-13.3,1])B(x,0,11.3,x+.42,.9,11.72,'metal2',{f:{py:SN}});
  const stall=(x0,z0,mat)=>{B(x0,0,z0,x0+3,1.05,z0+.5,'rsStall',{f:{nz:mat,py:'metal2'}});B(x0,0,z0+1.4,x0+3,1.6,z0+2,'rsStall',{f:{py:'metal2'}});
    B(x0,0,z0+.5,x0+.1,1.05,z0+1.4,'rsStall');B(x0+2.9,0,z0+.5,x0+3,1.05,z0+1.4,'rsStall');
    B(x0+.4,1.05,z0+.05,x0+1.7,1.14,z0+.45,'metal2',CV);B(x0+1.9,1.05,z0+.08,x0+2.6,1.3,z0+.42,'carGl',CV);
    for(const [dx,dz] of [[.02,.02],[2.9,.02],[.02,1.9],[2.9,1.9]])B(x0+dx,dz<1?1.05:1.6,z0+dz,x0+dx+.08,2.3,z0+dz+.08,'metal2',CV);
    B(x0-.25,2.3,z0-.7,x0+3.25,2.42,z0+2.05,'rsAwn',{nosolid:true,f:{py:SN}});LIGHT(x0+1.5,2.05,z0+.6,'#ffcf8a',6.5,.95)};
  stall(-27.5,9.4,'rsStallA');stall(9.6,9.6,'rsStallB');
  // ================= the gas station: a canopy over four pumps, the kiosk, stairs up to the canopy roof, EV chargers =================
  const CX0=20,CX1=34,CZ0=-8,CZ1=4,CY=4.6,CT=5.2;
  for(const [x,z] of [[CX0+1,CZ0+1],[CX1-1,CZ0+1],[CX0+1,CZ1-1],[CX1-1,CZ1-1]])B(x-.25,0,z-.25,x+.25,CY,z+.25,'metal2');
  B(CX0,CY,CZ0,CX1,CT,CZ1,'rsCanopy',{f:{py:SN,ny:'rsCanopyU'}});
  for(const x of [24,30]){B(x-.6,0,-6,x+.6,.18,2,'conc',{f:{py:'concf'}});for(const z of [-4.2,.2]){B(x-.4,.18,z-.3,x+.4,1.9,z+.3,'rsPump');B(x-.05,1.9,z-.05,x+.05,2.2,z+.05,'metal2',CV)}}
  for(const [x,z] of [[22,-2],[27,-6],[27,2],[32,-2]])LIGHT(x,CY-.4,z,'#f4f8ff',13,1.15);
  for(const x of [22,26,30]){B(x-.3,0,6.6,x+.3,1.6,7,'rsEv',{f:{py:'metal',pz:'metal',px:'metal',nx:'metal'}});B(x-.04,.9,6.3,x+.04,1.2,6.6,'metal2',CV);B(x-1.1,0,4.4,x-1.0,.006,6.4,'rsMark',CV);B(x+1.0,0,4.4,x+1.1,.006,6.4,'rsMark',CV)}
  LIGHT(26,1.6,6,'#9affc8',5,.4);
  const KX0=34,KX1=38,KZ0=-6,KZ1=0,KH=3;
  wallX(KX0,KX1,KZ0,KZ0+.2,0,KH,FA,[[35,37,1,2.2]],{f:{nz:FA,pz:IN}});wallX(KX0,KX1,KZ1-.2,KZ1,0,KH,FA,[],{f:{pz:FA,nz:IN}});
  wallZ(KX0,KX0+.2,KZ0+.2,KZ1-.2,0,KH,FA,[[-4,-2.6,0,2.3]],{f:{nx:FA,px:IN}});wallZ(KX1-.2,KX1,KZ0+.2,KZ1-.2,0,KH,FA,[],{f:{px:FA,nx:IN}});
  B(35,1,KZ0+.05,37,2.2,KZ0+.15,'rsGlass');B(KX0,KH,KZ0,KX1,KH+.2,KZ1,'concf',{f:{py:SN}});B(36.9,0,-4.6,37.7,1,-1,'metal',{f:{py:'metal2'}});LIGHT(36,2.6,-3,'#ffe6c0',6,.8);
  stairs('z',36.6,38,6.25,.25,0,KH+.2,14,'metal2',{f:{py:'concf'}});B(36.6,0,0,38,KH+.2,.25,'metal2',{f:{py:'concf'}});
  rail('z',36.48,36.6,6.25,.25,0,KH+.2,14);rail('z',38,38.12,6.25,.25,0,KH+.2,14);
  stairs('x',-5.6,-2.4,37,34,KH+.2,CT,8,'metal2',{f:{py:'concf'}});rail('x',-2.4,-2.28,37,34,KH+.2,CT,8);rail('x',-5.72,-5.6,37,34,KH+.2,CT,8);// on the kiosk roof (step on from the east strip), up onto the canopy edge
  // ================= the car park: bays, a bus, abandoned cars under snow, plough piles, the pylon sign, lamps =================
  for(let x=-28;x<=16;x+=3){B(x-.06,0,-15,x+.06,.006,-10.2,'rsMark',CV)}B(-28,0,-10.26,16,.006,-10.14,'rsMark',CV);
  for(let x=-28;x<=-4;x+=3)B(x-.06,0,4.6,x+.06,.006,9.4,'rsMark',CV);B(-28,0,4.54,-4,.006,4.66,'rsMark',CV);
  for(const [x,m] of [[-26.9,'car'],[-20.9,'carR'],[-17.9,'car'],[-11.9,'carBurnt'],[-5.9,'car'],[3.1,'carR'],[9.1,'car'],[12.1,'car']])parked(x+.15,-14.6,x+1.95,-10.4,m);
  for(const [x,m] of [[-23.9,'car'],[-14.9,'carR'],[-8.9,'car']])parked(x+.15,5,x+1.95,9.2,m);
  B(-7,.5,-4.6,5,3.3,-2,'rsBus',{f:{py:SN}});for(const x of [-5.4,3.2])for(const z of [-4.75,-2.15])B(x-.55,0,z-.25,x+.55,1.05,z+.25,'tire');
  B(-7.15,.6,-4.5,-7,2.9,-2.1,'carGl');
  for(const [x0,z0,x1,z1,h] of [[-30,-17.6,-21,-16.4,1.1],[-9,-17.6,1,-16.4,1.1],[9,-17.6,18,-16.4,1.1],[-28.5,-1.6,-24.5,.6,1.2],[12,-1.4,15.5,1.2,1.25],[-18,.2,-14.5,1.8,.9],[15.8,6,18.6,9.6,1.3]]){
    B(x0,0,z0,x1,h,z1,SN,{f:{py:SN}});B(x0+.4,h,z0+.25,x1-.4,h+.35,z1-.25,SN,{f:{py:SN}})}
  for(const [x,z] of [[-20.5,-6.5],[-12,-7],[18.6,-12.4],[16,-9]])cone(x,z);
  burn(-9.3,-.8);snowman(17.4,-4.4);
  B(13.8,0,8.8,14.2,8,9.2,'metal2');B(12.2,8,8.75,15.8,9.9,9.25,'rsSign',{f:{py:SN}});LIGHT(14,8.6,10.6,'#9ac8ff',10,.9);LIGHT(14,8.6,7.4,'#9ac8ff',8,.6);
  for(const [x,z] of [[-24,-6],[-10,-8],[6,-6.5],[-18,3],[10,4]])pole(x,z,7,'#ffb060',17,1.05);
  for(const [x,z] of [[-20,-18.2],[14,-18.2],[30,-18.2],[-48,-18.2]])pole(x,z,7.5,'#d8e4ff',15,.85);
  // ================= the east field: a snowed-in camper van, picnic tables =================
  B(18.1,.45,13.6,20.5,2.2,15.6,'car',{f:{py:SN}});B(18.15,1.3,13.55,20.45,2.1,13.7,'carGl',CV);B(18,.55,15.6,20.6,3.2,22,'rsBoxT',{f:{py:SN}});
  for(const z of [14.4,20.8])for(const x of [17.9,20.3])B(x,0,z-.35,x+.4,.65,z+.35,'tire');snowcap(18,15.6,20.6,22,3.2);
  for(const [x,z] of [[28,19],[31.5,15]]){B(x-1,.72,z-.4,x+1,.8,z+.4,'rsTable',{f:{py:SN}});for(const dx of [-.8,.7])B(x+dx,0,z-.3,x+dx+.1,.72,z+.3,'metal2');bench(x-1,z-1,x+1,z-.65);bench(x-1,z+.65,x+1,z+1)}
  snowman(24.5,12.6);
  // ================= the truck park (east): semi-trailers in rows, burn barrels, a self car wash with a roof stair =================
  const truck=(x0,z0,len,mat)=>{B(x0,.45,z0,x0+2.4,3.1,z0+2.6,'car',{f:{py:SN}});B(x0+.1,1.9,z0-.05,x0+2.3,2.9,z0+.3,'carGl',CV);
    B(x0+.05,1.15,z0+2.8,x0+2.35,4.0,z0+2.8+len,mat,{f:{py:SN}});
    for(const z of [z0+.5,z0+2.2,z0+len,z0+len+1.6])B(x0-.05,0,z-.4,x0+2.45,1.15,z+.4,'tire')};
  truck(40.8,-14,12,'contR');truck(45.6,-6,12,'contB');truck(50.4,-15,11,'contG');truck(50.4,4,9,'rsBoxT');truck(40.8,6,10,'contG');
  crate(43.8,-16.8,1.2);crate(43.8,-16.8,1,1.2);crate(45.2,-16.6,1.1);B(53,0,-17.4,54.4,.14,-16,'pallet');tireStack(54,-1.2,4);tireStack(54.1,2.6,3);
  burn(47.2,-16.4);burn(49.3,13);
  const WX0=42,WX1=54,WZ0=20,WZ1=28,WH=4.2;
  wallZ(WX0,WX0+.3,WZ0,WZ1,0,WH,'conc');wallZ(WX1-.3,WX1,WZ0,WZ1,0,WH,'conc');B(47.85,0,21.6,48.15,WH,26.4,'conc');
  B(WX0,WH,WZ0,WX1,WH+.3,WZ1,'conc',{f:{py:SN,ny:'metal2'}});
  B(43,3.3,WZ0-.1,53,WH,WZ0,'rsWash',CV);B(43,3.3,WZ1,53,WH,WZ1+.1,'rsWash',CV);
  for(const [a,b] of [[42.3,47.85],[48.15,53.7]]){B(a+.2,0,23.4,a+.9,3.2,24.6,'rsBrush');B(b-.9,0,23.4,b-.2,3.2,24.6,'rsBrush');B(a+.9,2.85,23.7,b-.9,3.3,24.3,'rsBrush',CV);
    B(a+.2,3.2,23.3,b-.2,3.4,24.7,'metal2',CV);LIGHT((a+b)/2,3.8,22,'#e8f4ff',7,.8);LIGHT((a+b)/2,3.8,26.5,'#e8f4ff',6,.6)}
  stairs('z',54.1,55.5,33,24,0,WH+.3,12,'metal2',{f:{py:'concf'}});rail('z',55.5,55.62,33,24,0,WH+.3,12);rail('z',53.98,54.1,33,28.5,0,(WH+.3)/2,6);
  for(const [x,z] of [[45,-17.5],[54,8],[45,16],[50,30.6]])pole(x,z,7,'#ffb060',15,.95);
  // ================= behind the building: the service road, a delivery truck at the back door, bins, the gas cage, pallets =================
  B(-14,.45,25.3,-11.4,3.1,27.9,'car',{f:{py:SN}});B(-14.05,1.9,25.4,-13.8,2.9,27.8,'carGl',CV);B(-11.2,.95,25.25,-4.2,3.7,27.95,'rsBoxT',{f:{py:SN}});
  for(const x of [-13.4,-11.9,-6.6,-5.2])for(const z of [25.2,28.05])B(x-.4,0,z-.25,x+.4,.95,z+.25,'tire');
  B(3,0,24.5,5,1.3,25.9,'contG',{f:{py:SN}});B(5.4,0,24.5,7.4,1.3,25.9,'contB',{f:{py:SN}});
  fenceX(8,10.4,26.2,1.8);fenceZ(24.2,26.2,10.4,1.8);for(const x of [8.6,9.2,9.8])drum(x,24.8,0,'drumB');drum(9.5,25.5,0,'drumR');
  crate(12.4,25.2,1.1,0,'pallet');crate(13.6,25.2,1.1);crate(13,25.2,1,1.1);
  burn(-19.5,29.2);
  for(const [x,z] of [[-36,30.6],[-14,30.6],[18,30.6],[36,30.6]])pole(x,z,7,'#ffb060',15,.95);
  // ================= the restroom block: men's and women's rooms, stalls, sinks with mirrors =================
  const RX0=-30,RX1=-16,RZ0=32,RZ1=42,RH=3.4,TL='tile';
  wallX(RX0,RX1,RZ0,RZ0+T,0,RH,FA,[[-27.6,-25.8,0,2.4],[-20.2,-18.4,0,2.4]],{f:{nz:FA,pz:TL}});
  wallX(RX0,RX1,RZ1-T,RZ1,0,RH,FA,[[-29,-24.5,2.4,3],[-21.5,-17,2.4,3]],{f:{pz:FA,nz:TL}});for(const [u0,u1] of [[-29,-24.5],[-21.5,-17]])B(u0,2.4,RZ1-.18,u1,3,RZ1-.08,'carGl');
  wallZ(RX0,RX0+T,RZ0+T,RZ1-T,0,RH,FA,[],{f:{nx:FA,px:TL}});wallZ(RX1-T,RX1,RZ0+T,RZ1-T,0,RH,FA,[],{f:{px:FA,nx:TL}});
  wallZ(-23.1,-22.9,RZ0+T,RZ1-T,0,RH,TL);
  B(RX0,RH,RZ0,RX1,RH+.25,RZ1,'rsCeil',{f:{py:SN}});for(const [x0,z0,x1,z1] of [[RX0,RZ0,RX1,RZ0+.25],[RX0,RZ1-.25,RX1,RZ1],[RX0,RZ0,RX0+.25,RZ1],[RX1-.25,RZ0,RX1,RZ1]])B(x0,RH+.25,z0,x1,RH+.6,z1,FA,{f:{py:SN}});
  B(-28.2,0,34.4,-25.2,2.3,34.6,TL);B(-20.8,0,34.4,-17.8,2.3,34.6,TL);// privacy screens inside the doors
  for(const x of [-28.1,-26.45,-24.8,-21.2,-19.5,-17.9])B(x-.03,0,39.9,x+.03,2.1,RZ1-T,'rsStall');
  for(const cx of [-28.9,-27.3,-25.6,-24,-22,-20.3,-18.7,-17.1])B(cx-.22,0,41.05,cx+.22,.45,RZ1-T,'plaster');
  for(const z of [35,36.2,37.4])B(RX1-T-.32,.4,z-.22,RX1-T,1.1,z+.22,'plaster');// urinals
  B(-23.7,0,34.5,-23.1,.85,38.5,'plaster',{f:{py:TL}});B(-23.14,1.2,34.6,-23.1,2.1,38.4,'rsMirror',CV);
  B(-22.9,0,34.5,-22.3,.85,38.5,'plaster',{f:{py:TL}});B(-22.9,1.2,34.6,-22.86,2.1,38.4,'rsMirror',CV);
  B(-28.4,2.55,RZ0-.08,-25,3.3,RZ0,'rsWC',CV);B(-21,2.55,RZ0-.08,-17.6,3.3,RZ0,'rsWC',CV);
  LIGHT(-26.5,3.1,37,'#e8f4ff',7,.85);LIGHT(-19.5,3.1,37,'#e8f4ff',7,.85);LIGHT(-23,2.8,31.2,'#d8ecff',6,.5);
  // ================= the rest plaza: smoking booth, benches, two more drinks machines =================
  wallX(8,12,33,33.08,0,2.6,'rsBooth',[[9.2,10.8,0,2.2]]);wallX(8,12,35.92,36,0,2.6,'rsBooth');wallZ(8,8.08,33.08,35.92,0,2.6,'rsBooth');wallZ(11.92,12,33.08,35.92,0,2.6,'rsBooth');
  B(7.9,2.6,32.9,12.1,2.75,36.1,'metal2',{f:{py:SN}});bench(8.3,35.2,11.7,35.7);B(8.4,0,33.4,8.7,.9,33.7,'metal2');LIGHT(10,2.3,34.5,'#e8f4ff',4,.5);
  bench(1,33.4,3,33.9);bench(4,33.4,6,33.9);vend(.4,36.1,'nz');vend(1.55,36.1,'nz');
  // ================= the playground: swings, a slide, a seesaw, a snowman =================
  fenceX(20,25.5,32,1);fenceX(27.5,34,32,1);fenceX(20,34,44,1);fenceZ(32,44,20,1);fenceZ(32,44,34,1);
  for(const x of [21.9,27.9])for(const z of [35.4,36.4])B(x,0,z,x+.2,2.6,z+.2,'rsPlayR');B(21.9,2.5,35.9,28.1,2.65,36.1,'rsPlayR',CV);
  for(const x of [23.5,26.5]){for(const dx of [-.25,.23])B(x+dx,.56,35.98,x+dx+.02,2.5,36.02,'metal2',CV);B(x-.3,.5,35.8,x+.3,.56,36.2,'rsPlayB',CV)}
  B(30,1.6,37,32,1.8,39,'rsPlayB');for(const [x,z] of [[30,37],[31.85,37],[30,38.85],[31.85,38.85]])B(x,0,z,x+.15,1.6,z+.15,'metal2');
  B(30,1.8,37,32,2.6,37.06,'rsPlayR',CV);B(31.94,1.8,37,32,2.6,39,'rsPlayR',CV);
  stairs('z',30.4,31.6,41.4,39,0,1.8,4,'rsPlayR');stairs('x',37.3,38.7,26.4,30,0,1.8,6,'paintY');B(26.4,.1,37.2,30,.5,37.3,'paintY',CV);B(26.4,.1,38.7,30,.5,38.8,'paintY',CV);
  B(22.5,.25,40.6,27.5,.4,41,'rsPlayB');B(24.85,0,40.55,25.15,.3,41.05,'metal2');
  snowman(23,42.4);LIGHT(27,4,38,'#ffcf8a',10,.55);
  // ================= the west woods: a 정자 pavilion, an observation deck, a trail sign =================
  B(-50,0,-10,-44,.45,-4,'rsTable',{f:{py:'rsTable'}});
  for(const x of [-49.8,-44.2])for(const z of [-9.8,-7,-4.2])B(x-.15,.45,z-.15,x+.15,3,z+.15,'rsBark');
  for(const [x0,z0,x1,z1] of [[-50,-10,-44,-9.75],[-50,-4.25,-44,-4],[-50,-10,-49.75,-4],[-44.25,-10,-44,-4]])B(x0,2.7,z0,x1,3,z1,'rsBark',CV);
  B(-51.2,3,-11.2,-42.8,3.25,-2.8,'rsGiwa',{f:{py:SN}});B(-50.4,3.25,-10.4,-43.6,3.6,-3.6,'rsGiwa',{f:{py:SN}});B(-49.4,3.6,-9.4,-44.6,3.95,-4.6,'rsGiwa',{f:{py:SN}});
  B(-48.4,3.95,-8.4,-45.6,4.3,-5.6,'rsGiwa',{f:{py:SN}});B(-47.6,4.3,-7.6,-46.4,4.55,-6.4,'rsGiwa',{f:{py:SN}});
  B(-47.6,.45,-7.6,-46.4,.75,-6.4,'rsTable');LIGHT(-47,2.6,-7,'#ffcf8a',7,.6);snowman(-42.6,-8.6);
  B(-42.06,0,-1.06,-41.94,1.8,-.94,'rsBark');B(-42.1,1.15,-1.7,-41.9,1.8,-.3,'rsPost',CV);
  const DK=3.4;B(-54,DK-.3,6,-46,DK,14,'rsTable',{f:{ny:'rsBark'}});
  for(const x of [-53.8,-50,-46.2])for(const z of [6.2,10,13.8])B(x-.15,0,z-.15,x+.15,DK-.3,z+.15,'rsBark');
  B(-54,DK,6,-46,DK+1,6.12,'rsBark',{f:{py:SN}});B(-54,DK,6,-53.88,DK+1,14,'rsBark',{f:{py:SN}});B(-54,DK,13.88,-47.5,DK+1,14,'rsBark',{f:{py:SN}});B(-46.12,DK,6,-46,DK+1,14,'rsBark',{f:{py:SN}});
  stairs('z',-47.5,-46,22,14,0,DK,12,'rsTable',{f:{py:'rsTable'}});rail('z',-47.62,-47.5,22,14,0,DK,12,'rsBark');rail('z',-46,-45.88,22,14,0,DK,12,'rsBark');
  B(-50.1,DK,6.4,-49.9,DK+.9,6.6,'metal2');B(-50.25,DK+.9,6.3,-49.75,DK+1.15,6.9,'metal2',CV);
  B(-53.7,DK,13.55,-53.55,DK+2.2,13.7,'metal2');B(-53.8,DK+2.2,13.45,-53.45,DK+2.32,13.8,'lampO',CV);LIGHT(-53.6,DK+1.9,13.4,'#ffb060',10,.8);
  burn(-43.5,4.2);
  for(const [x,z] of [[-42.5,-6.5],[-42.5,12.5]])pole(x,z,6,'#ffb060',14,.9);
  // ================= spawns, zombie entries, camps, moon, title camera =================
  MAP.spawns=[];for(const x of [-17,-11,-5,-2,1,4,7])for(const z of [8.6,10.4])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.2,.2),0,rr(-.4,.4)]);
  MAP.zspawns=[[-55,-29,0],[-55,-21,0],[55,-29,0],[55,-21,0],[-12,-30,0],[12,-30,0],[-30,-30,0],[30,-30,0],
    [-53.4,-15,0],[-53.4,0,0],[-53.4,20,0],[-53.4,32,0],[-44,45.2,0],[-28,45.2,0],[-6,45.2,0],[10,45.2,0],[27,45.4,0],[44,45.2,0],
    [54,-10,0],[53.8,11,0],[53.8,36,0],[25,16,0],[-36.6,-8,0]];
  MAP.camps=[
    {k:'store',w:.16,p:[[-16,0,15],[-11,0,20.5],[-16,0,22.8],[-7.5,0,22.5]],look:[-11,1.4,13]},
    {k:'food',w:.1,p:[[0,0,22],[6,0,22],[8.5,0,15.5]],look:[2,1.4,13]},
    {k:'roof',w:.16,p:[[-17,H+.25,20],[-8,H+.25,14.4],[0,H+.25,14.4],[8,H+.25,16],[6,H+.25,22.5]],look:[-4,1,0]},
    {k:'canopy',w:.14,p:[[22,CT,-6],[27,CT,-2],[32,CT,2],[22,CT,2]],look:[0,1,-8]},
    {k:'bridge',w:.1,p:[[-32.2,DY,-16],[-32.2,DY,-22],[-32.2,DY,-28]],look:[-10,1,-8]},
    {k:'kiosk',w:.06,p:[[35.6,0,-1.2],[35.6,0,-5]],look:[28,1,-2]},
    {k:'bus',w:.08,p:[[-1,0,-1],[2.5,0,-1],[-4.5,0,-5.6]],look:[-1,1,-14]},
    {k:'deck',w:.08,p:[[-52,DK,8],[-48,DK,8],[-52,DK,12.4]],look:[-30,1,0]},
    {k:'pavil',w:.04,p:[[-48.8,.45,-8.8],[-45.2,.45,-5.2]],look:[-30,1,-6]},
    {k:'wc',w:.06,p:[[-28.8,0,38],[-24,0,36],[-17.6,0,38.5]],look:[-23,1.4,31]},
    {k:'wash',w:.08,p:[[44,WH+.3,21],[52,WH+.3,21],[48,WH+.3,27]],look:[47,1,0]},
    {k:'trucks',w:.06,p:[[44.4,0,-8],[49.2,0,4],[44.4,0,12]],look:[46,1,-18]},
    {k:'play',w:.03,p:[[31,1.8,38]],look:[20,1,30]},
  ];
  MAP.spawnYaw=null;
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#a8b8e0'),i:.85};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.04)*.7;cam.position.set(-6+a*8,7+Math.sin(t*.06)*.6,-16+a*2);cam.lookAt(-4+a*4,2,14)};
}
MAPDEFS.rest={n:['영동 휴게소','Yeongdong Rest Stop'],d:['눈 내리는 한겨울 밤의 고속도로 휴게소. 버려진 차들이 눈에 묻힌 주차장, 편의점·푸드코트·포장마차, 올라갈 수 있는 주유소 지붕과 세차장 옥상, 화물차 주차장, 화장실과 놀이터가 있는 뒷길, 정자와 전망대가 있는 숲, 고속도로를 건너는 육교.','A highway rest stop on a snowy winter night: a car park of snowed-in cars, a store, food court and snack stalls, a climbable gas-station canopy and car-wash roof, a truck park, a back road with restrooms and a playground, woods with a pavilion and a lookout, and an overbridge across the jammed highway.'],
  env:{sky:1,snow:1,rain:0,storm:0,fog:'#1a2232',fogD:.018,ambOut:'#3a4660',ambIn:'#2a2c30'},bounds:[-58,-33,58,50],probeY:[.9,2.4,4.4,6.4],tex:bakeRestTex,build:buildRest};

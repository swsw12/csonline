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
function bakeRestTex(){if(TEX.rsSnow)return;
  TEX.rsSnow=mkTex(texRsSnow());TEX.rsSnowA=mkTex(texRsSnowA());TEX.rsLot=mkTex(texRsLot());TEX.rsWall=mkTex(texRsWall());TEX.rsFacade=mkTex(texRsFacade());TEX.rsIn=mkTex(texRsIn());
  TEX.rsFloor=mkTex(texRsFloor());TEX.rsCeil=mkTex(texRsCeil());TEX.rsGlass=mkTex(texRsGlass(),false);TEX.rsShelf=mkTex(texRsShelf());TEX.rsFridge=mkTex(texRsFridge(),false);
  TEX.rsCanopy=mkTex(texRsCanopy());TEX.rsCanopyU=mkTex(texRsCanopyU());TEX.rsPump=mkTex(texRsPump(),false);TEX.rsSign=mkTex(texRsSign(),false);TEX.rsPine=mkTex(texRsPine());
  TEX.rsBark=mkTex(texRsBark());TEX.rsBus=mkTex(texRsBus());TEX.rsMark=mkTex(texRsMark());TEX.rsMenu=mkTex(texRsMenu(),false);TEX.rsTable=mkTex(texRsTable())}
// ---------- the map ----------
function buildRest(){const N='none',SN='rsSnow',CV={nosolid:true};
  // ================= ground: highway, car park, pavement, building floor, snow elsewhere =================
  {const R=[[-40,-32,40,-18,'rsSnowA'],[-30,-18,30,11,'rsLot'],[-22,11,14,13,'concf'],[-20,13,10,24,'rsFloor']];const xs=new Set([-40,40]),zs=new Set([-32,30]);
    for(const r of R){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m=SN;for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
        if(run&&run.m===m)run.x1=X[i+1];else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}}
  // ================= the edges: highway sound wall to the north, snowy embankments with pines on the other three sides =================
  B(-41,-1,-33.2,41,8,-32,'rsWall',{f:{nz:N,py:SN}});
  B(-41.2,-1,-32,-40,7,30,SN,{f:{nx:N}});B(40,-1,-32,41.2,7,30,SN,{f:{px:N}});B(-41,-1,30,41,7,31.2,SN,{f:{pz:N}});
  // lower snow steps in front of the embankments so the edge reads as a slope
  for(const [x0,z0,x1,z1,h] of [[-40,-18,-38.6,30,3.2],[-38.6,-18,-37.6,30,1.4],[38.6,-18,40,30,3.2],[37.6,12,38.6,30,1.4],[-40,28.6,40,30,3.2],[-38,27.6,38,28.6,1.3]])B(x0,0,z0,x1,h,z1,SN,{f:{py:SN}});
  const pine=(x,z,h)=>{h=h||5;B(x-.16,0,z-.16,x+.16,1.1,z+.16,'rsBark');const t=[[1.5,1,2.4],[1.15,2.2,3.6],[.8,3.4,4.6],[.42,4.5,h+.6]];
    for(const [r,y0,y1] of t)B(x-r,y0,z-r,x+r,Math.min(y1,y0+(h/5)*1.3),z+r,'rsPine',{f:{py:SN}})};
  for(const [x,z,h] of [[-36.5,-17.2,5.5],[-36.2,3,5.2],[-35.8,10,6.2],[-36,18,5.6],[-34,24.5,6],[-27,25.5,5.4],[-22.5,26.8,6.2],[16,26.5,5.6],[22,25.6,6.4],[28,26.8,5.4],[34,25.2,6],[36,18,5.8],[36.2,12.5,5.2]])pine(x,z,h);
  // ================= the highway: two carriageways, a concrete median, a jam of abandoned cars and a jackknifed truck =================
  for(let x=-39;x<39;x+=6){B(x,0,-28.62,x+3,.006,-28.38,'rsMark',CV);B(x,0,-21.62,x+3,.006,-21.38,'rsMark',CV)}
  for(const [x0,x1] of [[-40,-22],[-19,4],[7,26],[29,40]])B(x0,0,-25.4,x1,.9,-24.6,'barrier',{f:{py:SN}});// median with gaps
  const snowcap=(x0,z0,x1,z1,y)=>B(x0,y,z0,x1,y+.08,z1,SN,CV);
  const parked=(x0,z0,x1,z1,mat)=>{car(x0,z0,x1,z1,mat);const ax=(x1-x0)>=(z1-z0);if(ax)snowcap(x0+1.25,z0+.15,x1-1.1,z1-.15,1.48);else snowcap(x0+.15,z0+1.25,x1-.15,z1-1.1,1.48)};
  parked(-31,-30.8,-26.6,-29,'car');parked(-17.5,-27.4,-13.1,-25.6,'carR');parked(-6,-31,-1.6,-29.2,'car');parked(9,-27.6,13.4,-25.8,'carBurnt');parked(18,-23.4,22.4,-21.6,'car');
  parked(-25,-23.2,-20.6,-21.4,'carR');parked(30,-30.6,34.4,-28.8,'carR');parked(-38,-23.4,-33.6,-21.6,'carBurnt');
  // the truck: a cab nosed into the median, the trailer swung across both lanes
  B(2,.45,-24.2,4.6,3.1,-21.8,'car',{f:{py:SN}});B(2.15,1.9,-24.25,3.4,2.9,-21.75,'carGl',{f:{py:SN}});
  B(4.8,1.1,-29.2,6.9,4.0,-18.6,'contR',{f:{py:SN}});for(const z of [-28.4,-27.2,-20.4,-19.2])B(4.9,0,z-.3,6.8,1.1,z+.3,'tire');
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
  // north front: two doors, big shop windows
  const DR=[[-12.5,-10.5,0,2.4],[1.5,3.5,0,2.4]],WN=[[-19,-13.5,.6,3],[-9.5,-6.2,.6,3],[-4.2,.5,.6,3],[4.5,9,.6,3]];
  exX(Z0,Z0+T,DR.concat(WN),-1);for(const [u0,u1,y0,y1] of WN)B(u0,y0,Z0+.08,u1,y1,Z0+.17,'rsGlass');
  for(const [u0,u1] of DR)B(u0-.1,2.4,Z0-.05,u1+.1,2.6,Z0+T+.05,'metal2');
  exX(Z1-T,Z1,[[-3,-1,0,2.3]],1);// back door
  wallZ(X0,X0+T,Z0+T,Z1-T,0,H,FA,[],{f:{nx:FA,px:IN}});wallZ(X1-T,X1,Z0+T,Z1-T,0,H,FA,[[15,17,0,2.3]],{f:{px:FA,nx:IN}});
  wallZ(-5.1,-4.9,Z0+T,Z1-T,0,H,IN,[[17.5,19.8,0,2.4]]);// store | food court
  B(X0,H,Z0,X1,H+.25,Z1,'rsCeil',{f:{py:SN}});
  for(const [x0,z0,x1,z1] of [[X0,Z1-.3,X1,Z1],[X1-.3,Z0,X1,Z1],[X0,Z0,X1,Z0+.3],[X0,15.6,X0+.3,Z1]])B(x0,H+.25,z0,x1,H+.75,z1,FA,{f:{py:SN}});// parapet (gap at the stair head)
  B(-14,H+.25,17,-12,H+1.2,19.5,'metal2',{f:{py:SN}});B(2,H+.25,19,5,H+1.4,21.5,'metal2',{f:{py:SN}});// roof plant
  // roof stair along the west wall, landing at the gap in the parapet
  stairs('z',-21.75,-20.25,24.25,15.75,0,H+.25,16,'metal2',{f:{py:'concf'}});B(-21.75,0,13.25,-20,H+.25,15.75,'conc',{f:{py:'concf'}});
  B(-21.9,0,15.75,-21.75,H+1.2,24.25,'metal2',CV);
  // store: shelves, fridges along the west wall, the counter by the door
  for(const z of [16.2,18.6,21])B(-18.2,0,z-.32,-13.2,1.65,z+.32,'rsShelf',{f:{py:'metal'}});
  B(-9.6,0,15.2,-8.9,1.65,21.8,'rsShelf',{f:{py:'metal'}});
  B(X0+T,0,15,X0+T+.7,2.2,22.8,'metal',{f:{px:'rsFridge'}});
  B(-11.4,0,15.6,-9.8,1.05,16.4,'metal',{f:{py:'metal2'}});B(-12.6,0,16.4,-9.8,1.05,17,'metal',{f:{py:'metal2'}});
  // food court: tables and stools, the kitchen counter and its menu board on the back wall
  for(const [x,z] of [[-2,16],[2,16],[6,16],[-2,19.5],[2,19.5],[6,19.5]]){B(x-.6,.72,z-.45,x+.6,.78,z+.45,'rsTable');B(x-.06,0,z-.06,x+.06,.72,z+.06,'metal2');
    for(const dz of [-.8,.8])B(x-.2,0,z+dz-.18,x+.2,.45,z+dz+.18,'metal2')}
  B(-4.6,0,22.4,9.6,1.05,23.75,'metal',{f:{py:'metal2'}});B(-3.5,2.1,23.7,8.5,3,23.74,'rsMenu',CV);
  // lights inside, the lit windows spill onto the snow
  for(const [x,z,c] of [[-16,18.5,'#e8f4ff'],[-10,18.5,'#e8f4ff'],[-1,18,'#ffe6c0'],[6,18,'#ffe6c0']])LIGHT(x,H-.3,z,c,9,.95);
  for(const x of [-15,-7,2,7])LIGHT(x,2,11.4,'#d8ecff',6,.55);
  // ================= the gas station: a canopy over four pumps, the kiosk, stairs up to the canopy roof =================
  const CX0=20,CX1=34,CZ0=-8,CZ1=4,CY=4.6,CT=5.2;
  for(const [x,z] of [[CX0+1,CZ0+1],[CX1-1,CZ0+1],[CX0+1,CZ1-1],[CX1-1,CZ1-1]])B(x-.25,0,z-.25,x+.25,CY,z+.25,'metal2');
  B(CX0,CY,CZ0,CX1,CT,CZ1,'rsCanopy',{f:{py:SN,ny:'rsCanopyU'}});
  for(const x of [24,30]){B(x-.6,0,-6,x+.6,.18,2,'conc',{f:{py:'concf'}});for(const z of [-4.2,.2]){B(x-.4,.18,z-.3,x+.4,1.9,z+.3,'rsPump');B(x-.05,1.9,z-.05,x+.05,2.2,z+.05,'metal2',CV)}}
  for(const [x,z] of [[22,-2],[27,-6],[27,2],[32,-2]])LIGHT(x,CY-.4,z,'#f4f8ff',13,1.15);
  // kiosk: a booth with a window and a door, stairs onto its roof and from there onto the canopy
  const KX0=34,KX1=38,KZ0=-6,KZ1=0,KH=3;
  wallX(KX0,KX1,KZ0,KZ0+.2,0,KH,FA,[[35,37,1,2.2]],{f:{nz:FA,pz:IN}});wallX(KX0,KX1,KZ1-.2,KZ1,0,KH,FA,[],{f:{pz:FA,nz:IN}});
  wallZ(KX0,KX0+.2,KZ0+.2,KZ1-.2,0,KH,FA,[[-4,-2.6,0,2.3]],{f:{nx:FA,px:IN}});wallZ(KX1-.2,KX1,KZ0+.2,KZ1-.2,0,KH,FA,[],{f:{px:FA,nx:IN}});
  B(35,1,KZ0+.05,37,2.2,KZ0+.15,'rsGlass');B(KX0,KH,KZ0,KX1,KH+.2,KZ1,'concf',{f:{py:SN}});B(36.9,0,-4.6,37.7,1,-1,'metal',{f:{py:'metal2'}});LIGHT(36,2.6,-3,'#ffe6c0',6,.8);
  stairs('z',36.6,38,6.25,.25,0,KH+.2,14,'metal2',{f:{py:'concf'}});B(36.6,0,0,38,KH+.2,.25,'metal2',{f:{py:'concf'}});// up from the south, onto the kiosk roof
  B(36.45,0,.25,36.6,KH+1.2,6.25,'metal2',CV);
  stairs('x',-4.4,-2.8,37.75,34.25,KH+.2,CT,8,'metal2',{f:{py:'concf'}});// on the kiosk roof, up onto the canopy
  // ================= the car park: bays, a bus, abandoned cars under snow, plough piles, the pylon sign, lamps =================
  for(let x=-28;x<=16;x+=3){B(x-.06,0,-15,x+.06,.006,-10.2,'rsMark',CV)}B(-28,0,-10.26,16,.006,-10.14,'rsMark',CV);
  for(let x=-28;x<=-4;x+=3)B(x-.06,0,4.6,x+.06,.006,9.4,'rsMark',CV);B(-28,0,4.54,-4,.006,4.66,'rsMark',CV);
  for(const [x,m] of [[-26.9,'car'],[-20.9,'carR'],[-17.9,'car'],[-11.9,'carBurnt'],[-5.9,'car'],[3.1,'carR'],[9.1,'car'],[12.1,'car']])parked(x+.15,-14.6,x+1.95,-10.4,m);
  for(const [x,m] of [[-23.9,'car'],[-14.9,'carR'],[-8.9,'car']])parked(x+.15,5,x+1.95,9.2,m);
  // the bus, stranded across the middle of the car park
  B(-7,.5,-4.6,5,3.3,-2,'rsBus',{f:{py:SN}});for(const x of [-5.4,3.2])for(const z of [-4.75,-2.15])B(x-.55,0,z-.25,x+.55,1.05,z+.25,'tire');
  B(-7.15,.6,-4.5,-7,2.9,-2.1,'carGl');
  // plough piles: snow heaped along the lot edges, low enough to vault, high enough to crouch behind
  for(const [x0,z0,x1,z1,h] of [[-30,-17.6,-21,-16.4,1.1],[-9,-17.6,1,-16.4,1.1],[9,-17.6,18,-16.4,1.1],[-28.5,-1.6,-24.5,.6,1.2],[12,-1.4,15.5,1.2,1.25],[-18,.2,-14.5,1.8,.9],[15.8,6,18.6,9.6,1.3]]){
    B(x0,0,z0,x1,h,z1,SN,{f:{py:SN}});B(x0+.4,h,z0+.25,x1-.4,h+.35,z1-.25,SN,{f:{py:SN}})}
  for(const [x,z] of [[-20.5,-6.5],[-12,-7],[18.6,-12.4],[16,-9]])cone(x,z);
  // pylon sign
  B(13.8,0,8.8,14.2,8,9.2,'metal2');B(12.2,8,8.75,15.8,9.9,9.25,'rsSign',{f:{py:SN}});LIGHT(14,8.6,10.6,'#9ac8ff',10,.9);LIGHT(14,8.6,7.4,'#9ac8ff',8,.6);
  // lamp poles: sodium orange over the car park, cold white along the highway
  const pole=(x,z,h,col,r,i)=>{B(x-.1,0,z-.1,x+.1,h,z+.1,'metal2');B(x-.5,h,z-.18,x+.5,h+.15,z+.18,'metal2',{f:{py:SN}});B(x-.4,h-.05,z-.12,x+.4,h,z+.12,col==='#ffb060'?'lampO':'lampW',CV);LIGHT(x,h-.4,z,col,r,i)};
  for(const [x,z] of [[-24,-6],[-10,-8],[6,-6.5],[-18,3],[10,4]])pole(x,z,7,'#ffb060',17,1.05);
  for(const [x,z] of [[-20,-18.2],[14,-18.2],[30,-18.2]])pole(x,z,7.5,'#d8e4ff',15,.85);
  // ================= spawns, zombie entries, camps, moon, title camera =================
  MAP.spawns=[];for(const x of [-17,-11,-5,-2,1,4,7])for(const z of [8.6,10.4])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.2,.2),0,rr(-.4,.4)]);
  MAP.zspawns=[[-37,-29,0],[-37,-20,0],[37,-29,0],[37,-20,0],[-12,-30,0],[12,-30,0],[-36.6,-8,0],[-36.6,6,0],[-36.6,14,0],[-30.5,26.8,0],[-12,27,0],[2,27,0],[18,26.8,0],[30,24,0],[36.6,8,0],[36.6,-10,0],[25,16,0]];
  MAP.camps=[
    {k:'store',w:.2,p:[[-16,0,15],[-11,0,20.5],[-16,0,22.8],[-7.5,0,22.5]],look:[-11,1.4,13]},
    {k:'food',w:.12,p:[[0,0,22],[6,0,22],[8.5,0,15.5]],look:[2,1.4,13]},
    {k:'roof',w:.2,p:[[-17,H+.25,20],[-8,H+.25,14.4],[0,H+.25,14.4],[8,H+.25,16],[6,H+.25,22.5]],look:[-4,1,0]},
    {k:'canopy',w:.18,p:[[22,CT,-6],[27,CT,-2],[32,CT,2],[22,CT,2]],look:[0,1,-8]},
    {k:'bridge',w:.12,p:[[-32.2,DY,-16],[-32.2,DY,-22],[-32.2,DY,-28]],look:[-10,1,-8]},
    {k:'kiosk',w:.08,p:[[35.6,0,-1.2],[35.6,0,-5]],look:[28,1,-2]},
    {k:'bus',w:.1,p:[[-1,0,-1],[2.5,0,-1],[-4.5,0,-5.6]],look:[-1,1,-14]},
  ];
  MAP.spawnYaw=null;
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#a8b8e0'),i:.85};
  // title backdrop: drifting over the snowy car park toward the lit building
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.04)*.7;cam.position.set(-6+a*8,7+Math.sin(t*.06)*.6,-16+a*2);cam.lookAt(-4+a*4,2,14)};
}
MAPDEFS.rest={n:['영동 휴게소','Yeongdong Rest Stop'],d:['눈 내리는 한겨울 밤의 고속도로 휴게소. 버려진 차들이 눈에 묻힌 넓은 주차장, 편의점과 푸드코트(옥상은 바깥 계단), 올라갈 수 있는 주유소 지붕, 고속도로를 건너는 육교.','A highway rest stop on a snowy winter night: a wide car park of snowed-in abandoned cars, a convenience store and food court (roof by an outside stair), a gas-station canopy you can climb, and an overbridge across the jammed highway.'],
  env:{sky:1,snow:1,rain:0,storm:0,fog:'#1a2232',fogD:.02,ambOut:'#3a4660',ambIn:'#2a2c30'},bounds:[-41,-33,41,31],probeY:[.9,2.4,4.4,6.4],tex:bakeRestTex,build:buildRest};

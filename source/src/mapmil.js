'use strict';
// ============ Map "밀리샤 Militia": a ranch compound in a red-rock desert canyon under a cold moon ============
// The canyon plan comes from MIL_DATA (a 0.5 m grid traced from a top-down plan): rock masses are stacks of boxes whose
// heights grow away from the open ground, the sunken concrete channels are cut into the dirt. The two-storey house,
// its garage and annex, the deck and outside stair, culvert, tunnel, fences, crates and lamps are built here.
// Every texture is painted on first load.
Object.assign(MATS,{
  milRock:{t:'milRock',s:4,vo:-2,sv:16,k:'stone'},milRockT:{t:'milRockT',s:3,k:'stone',cs:1},milRockF:{t:'milRock',s:4,vo:-2,sv:16,k:'stone',cs:1},
  milDirt:{t:'milDirt',s:3.5,k:'soft'},milGrav:{t:'milGrav',s:2.5,k:'soft'},
  milConc:{t:'milConc',s:2,vo:-1.8,sv:2,k:'stone'},milConcF:{t:'milConcF',s:2.5,k:'stone'},milCurb:{t:'milConcF',s:1.5,k:'stone'},milWater:{t:'milWater',s:3,emis:.05,k:'glass'},
  milSiding:{t:'milSiding',s:2.4,k:'wood'},milWallIn:{t:'milWallIn',s:2.4,vo:.25,sv:3.15,k:'wood'},milFloor:{t:'milFloor',s:2,k:'wood'},milPlank:{t:'milPlank',s:2,k:'wood'},
  milCeil:{t:'milCeil',s:1.6,k:'wood'},milRoof:{t:'milRoof',s:2,k:'metal'},milStone:{t:'milStone',s:2,k:'stone'},milFrame:{t:'milFrame',s:1,k:'wood'},
  milPost:{t:'milPost',s:1,k:'wood'},milFence:{t:'milFence',s:2,k:'wood'},milRail:{t:'milRail',uv:'boxV',s:1.2,k:'wood'},
  milTile:{t:'milTile',s:1.2,k:'stone'},milKit:{t:'milKit',s:.8,vo:.25,sv:.9,k:'wood'},milCounter:{t:'milCounter',s:.8,k:'stone'},milFridge:{t:'milFridge',uv:'box',k:'metal'},
  milDoor:{t:'milDoor',uv:'box',k:'wood'},milBed:{t:'milBed',s:1,k:'soft'},milRug:{t:'milRug',uv:'box',k:'soft'},milFire:{t:'milFire',uv:'box',emis:.9,k:'stone'},
  milBlock:{t:'milBlock',s:2,k:'stone'},milGarFl:{t:'milGarFl',s:2.5,k:'stone'},milShutter:{t:'milShutter',uv:'boxV',s:2,k:'metal'},
  milCrate:{t:'milCrate',uv:'box',k:'wood'},milCrateG:{t:'milCrateG',uv:'box',k:'wood'},milTruck:{t:'milTruck',s:2,k:'metal'},milGlass:{t:'milGlass',uv:'box',k:'glass'},
  milPipe:{t:'milPipe',uv:'box',k:'metal'},milCorr:{t:'milCorr',s:1.2,k:'metal'},milLamp:{t:'milLamp',uv:'box',emis:1.4,k:'glass'},milLampW:{t:'milLampW',uv:'box',emis:1.4,k:'glass'},
  milSignA:{t:'milSignA',uv:'box',emis:.12,k:'wood'},milSignB:{t:'milSignB',uv:'box',emis:.12,k:'wood'},milMap:{t:'milMap',uv:'box',emis:.08,k:'soft'},milRadio:{t:'milRadio',uv:'box',emis:.35,k:'metal'},
  milBag:{t:'milBag',s:1.4,k:'soft'},milCurtain:{t:'milCurtain',s:1,emis:.55,k:'soft'},milCloth:{t:'milCloth',s:1,k:'soft'},milShelf:{t:'milShelf',uv:'box',k:'metal'},
});
// ---------- textures ----------
// sandstone cliff: 4 m wide, 16 m tall (y -2..14 maps to the whole height, so strata, varnish and the dusty foot never repeat vertically)
function texMilRock(){const W=256,H=512;return paint(W,H,P=>{
  const pal=['#341610','#421c14','#50241a','#5e2c1e','#6e3624','#7e402a','#8e4c32','#9e583a','#ae6644','#bc7650'];
  // weathered sandstone: fine knobs, vertical rain fluting, colour bedding, a few hard layers that stand out as thin ledges,
  // varnish streaks running down from the rim, a dusty foot
  const L=[];for(let y=0,k=0;y<H+64;k++){const th=8+Math.floor(Math.pow(hash2(k,1,501),1.3)*46);L.push({y0:y,y1:y+th,tone:(hash2(k,2,501)-.5)*.3,hard:hash2(k,3,501)<.22});y+=th}
  let li=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const yy=Math.max(0,y+(P.n(x,y,64,502,2)-.5)*6);li=0;while(L[li].y1<=yy)li++;const l=L[li],ly=yy-l.y0;
    const [b1,b2]=cellN(P,x,y,16,507);const kb=clamp(1-b1/10,0,1);
    const flute=Math.sin(x*.55+P.n(x,y,16,510,2)*9)*.5+.5;
    let t=.44+l.tone+kb*.12+(flute-.5)*.045+(P.n(x,y,40,503,3)-.5)*.28+(P.n(x,y,8,504,2)-.5)*.12+(hash2(x,y,505)-.5)*.12;
    if(b2-b1<1.2)t-=.07*(.4+P.n(x,y,24,512,2));
    if(l.hard){if(ly<1.6)t+=.24;else if(ly<3.2)t+=.06}else if(ly<1.8)t-=.2;
    let c=dith(P,x,y,t,pal,.08);const ym=14-y/32;if(ym<.9){const k=clamp((.9-ym)/1.6,0,1)*(.55+.45*P.n(x,y,20,508,2));c=mix(c,'#8a6656',k*.7)}
    if(l.hard&&ly<1.6&&hash2(x,y,509)<.4)c=mix(c,'#a88068',.45);P.set(x,y,c)}
  for(let i=0;i<6;i++){let x=Math.floor(hash2(i,1,511)*W);const y0=Math.floor(hash2(i,2,511)*H*.5),l=90+Math.floor(hash2(i,3,511)*300);
    for(let k=0;k<l&&y0+k<H;k++){P.set(x,y0+k,'#200e0a');P.set(x+1,y0+k,'#2e1610',.6);P.set(x-1,y0+k,'#a86a4c',.25);if(hash2(k,i,512)<.1)x+=hash2(k,i,513)<.5?1:-1}}
  for(let i=0;i<50;i++){const x=Math.floor(hash2(i,4,511)*W),y0=Math.floor(hash2(i,5,511)*80),l=60+Math.floor(hash2(i,6,511)*380);streak(P,x,y0,l,.16+hash2(i,7,511)*.24,1+Math.floor(hash2(i,8,511)*5))}
  for(let i=0;i<8;i++)stain(P,hash2(i,12,511)*W,hash2(i,13,511)*H,16+hash2(i,14,511)*34,12+hash2(i,15,511)*30,.2,530+i)})}
function texMilRockT(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2]=cellN(P,x,y,32,544),[g1,g2]=cellN(P,x,y,16,547);let t=.45+clamp(1-f1/22,0,1)*.15+clamp(1-g1/11,0,1)*.1+(P.n(x,y,48,541,4)-.5)*.4+(hash2(x,y,543)-.5)*.1;
    if(f2-f1<2)t-=.3;else if(g2-g1<1.3)t-=.12;
    let c=dith(P,x,y,t,['#3a1a12','#4a221a','#5a2c20','#6a3626','#7a4230','#8a503a'],.1);const s=P.n(x,y,40,545,3);if(s>.56)c=mix(c,'#8a6a58',clamp((s-.56)*3,0,.85));P.set(x,y,c)}
  pits(P,300,546,'#24100a','#9a6e58')})}
// pinkish desert dirt with pebbles, scuffs and dry scrub
function texMilDirt(){const N=TN;return paint(N,N,P=>{
  const pal=['#4e3a30','#5c463a','#6a5244','#785e4e','#866a58','#947662','#a2826c'];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,64,551,4)-.5)*.55+(P.n(x,y,12,552,2)-.5)*.2+(hash2(x,y,553)-.5)*.16;P.set(x,y,dith(P,x,y,t,pal,.14))}
  // pebbles: lit top, shadow below
  for(let i=0;i<420;i++){const x=Math.floor(hash2(i,1,554)*N),y=Math.floor(hash2(i,2,554)*N),r=hash2(i,3,554)<.85?1:2;const c=rpickH(i,['#9a8272','#6e5a4c','#b09482','#7a6656','#5e4a3e']);
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r+.5)P.set(x+dx,y+dy,dy<0?lt(c,.15):c);P.set(x,y+r+1,'#2e221c',.6);P.set(x+1,y+r+1,'#2e221c',.4)}
  // dried mud cracks in two patches
  for(let i=0;i<2;i++){const cx=hash2(i,4,554)*N,cy=hash2(i,5,554)*N;for(let y=-36;y<=36;y++)for(let x=-50;x<=50;x++){const d=Math.hypot(x/50,y/36);if(d>1)continue;const X=Math.round(cx+x),Y=Math.round(cy+y);const [f1,f2]=cellN(P,(X+N)%N,(Y+N)%N,16,556+i);if(f2-f1<1.3)P.mul(X,Y,.78+d*.18)}}
  // scrub tufts
  for(let i=0;i<7;i++){const cx=Math.floor(hash2(i,6,554)*N),cy=Math.floor(hash2(i,7,554)*N);for(let k=0;k<26;k++){const a=hash2(k,i,557)*Math.PI-Math.PI,l=3+hash2(k,i,558)*7;for(let s=0;s<l;s++)P.set(Math.round(cx+Math.cos(a)*s*.6),Math.round(cy-Math.abs(Math.sin(a))*s),s<2?'#2e2a1c':'#5a5a3a',.8)}}
  for(let i=0;i<9;i++)stain(P,hash2(i,8,554)*N,hash2(i,9,554)*N,16+hash2(i,10,554)*30,10+hash2(i,11,554)*20,.16,560+i)})}
function texMilGrav(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,8,571);const tone=hash2(id,1,572);
    let c=f2-f1<1.2?'#2a221c':mix(tone<.4?'#8a7a6a':tone<.75?'#76685a':'#9a8a78',tone<.4?'#4a3e34':'#3e342c',clamp(f1/6,0,1));if(hash2(x,y,573)<.05)c=dk(c,.2);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,574)*N,hash2(i,2,574)*N,14+hash2(i,3,574)*24,10+hash2(i,4,574)*16,.22,575+i)})}
// channel wall: the 2 m texture spans the 1.8 m wall (v from the floor up), panels, form ties, the old water line, algae at the foot
function texMilConc(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,48,581,4)-.5)*.42+(P.n(x,y,6,582,2)-.5)*.12+(hash2(x,y,583)-.5)*.08;let c=dith(P,x,y,t,['#3e3c38','#4a4844','#56544e','#626058','#6e6c64','#7a786e'],.1);
    const v=1-y/N;if(v<.42){const k=clamp((.42-v)/.3,0,1);c=mix(c,'#2c2a24',k*.5);if(v<.12)c=mix(c,'#2e3a22',clamp((.12-v)*8,0,1)*.6*(.5+P.n(x,y,10,584,2)))}
    if(Math.abs(v-.42)<.006)c=dk(c,.25);P.set(x,y,c)}
  for(let y=0;y<N;y++){P.set(0,y,'#22201c');P.set(1,y,'#2c2a26');P.set(2,y,'#7a786e')}
  for(let x=0;x<N;x++){P.set(x,10,'#5a5850');P.set(x,11,'#2e2c28')}
  for(const px of [64,192])for(const py of [70,150]){for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const r=Math.hypot(i,j);if(r<2)P.set(px+i,py+j,'#121110');else if(r<3.2)P.set(px+i,py+j,j<0?'#2a2824':'#7a786e',.6)}streak(P,px-1,py+4,30+Math.floor(hash2(px,py,585)*60),.18,2)}
  for(let i=0;i<30;i++){const x=Math.floor(hash2(i,1,586)*N),y0=12+Math.floor(hash2(i,2,586)*60);streak(P,x,y0,30+Math.floor(hash2(i,3,586)*90),.12,1+(i%3===0?1:0))}
  for(let i=0;i<10;i++){const x=Math.floor(hash2(i,4,586)*N),y0=Math.floor(N*.55+hash2(i,5,586)*20);for(let k=0;k<20;k++)P.set(x+Math.round(Math.sin(k*.3)*1.5),y0+k,'#a8a69a',.35*(1-k/20))}
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,6,586)*N),Math.floor(hash2(i,7,586)*N),50,590+i,'#24221e','#77756c')})}
function texMilConcF(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,48,601,4)-.5)*.4+(P.n(x,y,6,602,2)-.5)*.12+(hash2(x,y,603)-.5)*.08;let c=dith(P,x,y,t,['#3a3834','#46443e','#525048','#5e5c54','#6a685e'],.1);
    const s=P.n(x,y,40,604,3);if(s>.56)c=mix(c,'#7a6658',clamp((s-.56)*3,0,.75));if(s<.34)c=mix(c,'#22241e',clamp((.34-s)*3,0,.6));P.set(x,y,c)}
  for(let k=0;k<N;k++){P.set(k,0,'#2a2824');P.set(0,k,'#2a2824')}
  // leaves and twigs washed in
  for(let i=0;i<40;i++){const x=Math.floor(hash2(i,1,605)*N),y=Math.floor(hash2(i,2,605)*N);const c=rpickH(i,['#5a3e22','#6a4a28','#3a2a1a']);P.set(x,y,c);P.set(x+1,y,c);P.set(x,y+1,dk(c,.3))}
  for(let i=0;i<4;i++)crack(P,Math.floor(hash2(i,3,605)*N),Math.floor(hash2(i,4,605)*N),60,606+i,'#22201c','#6e6c62')})}
function texMilWater(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.12+P.n(x,y,32,611,3)*6)*.5+.5;let c=mix('#0a1016','#1e2c3a',w*.6);if(P.n(x,y,16,612,2)>.72)c=lt(c,.08);if(hash2(x,y,613)<.004)c='#6a7a8a';P.set(x,y,c)}})}
// house: weathered clapboard (16 boards per 2.4 m), cream paint flaking to grey wood
function texMilSiding(){const N=TN;return paint(N,N,P=>{const BH=16;
  for(let y=0;y<N;y++){const b=Math.floor(y/BH),ly=y%BH;for(let x=0;x<N;x++){const seg=Math.floor((x+hash2(b,0,621)*N)/128);
    let t=.62+(P.n(x,y,40,622,3)-.5)*.2+(hash2(b,seg,623)-.5)*.1+(ly/BH)*.12;let c=dith(P,x,y,t,['#6e685c','#86806e','#a09886','#b4ac98','#c4bca8','#d0c8b4'],.06);
    const peel=P.n(x,y,16,624,3)+(P.n(x,y,4,629,2)-.5)*.25;if(peel>.64){const g=.5+Math.sin(x*.3+P.n(x,y,8,625,2)*5)*.15;c=mix(c,mix('#5e5648','#7e7462',g),clamp((peel-.64)*6,0,.85))}
    if(ly<2)c=dk(c,ly<1?.55:.3);else if(ly>BH-3)c=lt(c,.06);
    if((x+Math.floor(hash2(b,1,626)*N))%128===0)c='#3a342c';P.set(x,y,c)}}
  for(let i=0;i<14;i++){const x=Math.floor(hash2(i,1,627)*N),y=Math.floor(hash2(i,2,627)*16)*16+3;streak(P,x,y,30+Math.floor(hash2(i,3,627)*80),.12,2)}
  for(let i=0;i<5;i++)stain(P,hash2(i,4,627)*N,hash2(i,5,627)*N,16+hash2(i,6,627)*20,12+hash2(i,7,627)*16,.12,628+i)})}
// interior wall, floor (v=0) to ceiling (v=1): beadboard wainscot, chair rail, faded wallpaper, cornice
function texMilWallIn(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=1-y/N;let c;
    if(v<.3){const bx=x%11;let t=.5+(P.n(x,y,30,631,3)-.5)*.25;c=dith(P,x,y,t,['#3a2a1c','#4a3624','#58422c','#664e34'],.08);if(bx===0)c='#24180e';else if(bx===1)c=lt(c,.12)}
    else if(v<.33){c=v<.305?'#2a1c10':v>.325?'#8a6e4c':'#6a5236'}
    else if(v>.965){c=v>.985?'#d8ccb0':'#a8987a'}
    else{const px=x%32,py=(y+(Math.floor(x/32)%2)*16)%32;const d=Math.abs(px-16)+Math.abs(py-16);let t=.55+(P.n(x,y,40,632,3)-.5)*.2;
      c=dith(P,x,y,t,['#7a6646','#8c7652','#9a845e','#a8926a'],.06);if(d<6&&d>3)c='#6e7a52';else if(d<=2)c='#8a3e2a';if(px===0)c=dk(c,.08)}
    P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,633)*N,hash2(i,2,633)*N*.6,14+hash2(i,3,633)*22,18+hash2(i,4,633)*26,.16,634+i);
  for(let i=0;i<10;i++){const x=Math.floor(hash2(i,5,633)*N);streak(P,x,4,40+Math.floor(hash2(i,6,633)*90),.1,2)}})}
function texMilFloor(){const N=TN;return paint(N,N,P=>{const BW=32;
  // 25 cm planks running the whole 2 m tile, one staggered butt joint each, a little tone change per plank
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=Math.floor(x/BW),lx=x%BW;const jy=Math.floor(hash2(b,1,641)*N),seg=y<jy?0:1;const id=hash2(b,seg,642);
    const g=Math.sin(y*.07+lx*.4+P.n(x,y,24,643+b,2)*6)*.5+.5;let c=mix(id<.35?'#3e2a18':id<.7?'#46301c':'#4e3620',id<.5?'#6e4c2c':'#7a5634',g*.5+P.n(x,y,48,644,2)*.2);
    if(lx<2)c=lx<1?'#140c06':'#24160c';else if(lx===2)c=lt(c,.08);else if(lx>BW-2)c=dk(c,.18);if(Math.abs(y-jy)<1)c='#160e08';
    if(hash2(x,y,645)<.025)c=dk(c,.18);P.set(x,y,c)}
  for(let b=0;b<8;b++)for(let k=0;k<4;k++){const x=b*BW+5,y=Math.floor(hash2(b,k,646)*N);P.set(x,y,'#0e0a06');P.set(x+22,y,'#0e0a06')}
  for(let i=0;i<4;i++)stain(P,hash2(i,1,647)*N,hash2(i,2,647)*N,12+hash2(i,3,647)*20,10+hash2(i,4,647)*16,.12,648+i)})}
function texMilPlank(){const N=TN;return paint(N,N,P=>{const BW=40;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=Math.floor(y/BW),ly=y%BW;const g=Math.sin(x*.07+P.n(x,y,24,651+b,2)*8)*.5+.5;
    let c=mix('#4e463a','#8a8070',g*.55+hash2(b,0,652)*.25);if(ly<3)c='#120e0a';else if(ly<5)c=lt(c,.12);else if(ly>BW-3)c=dk(c,.3);if(hash2(x,y,653)<.04)c=dk(c,.2);P.set(x,y,c)}
  for(let b=0;b<7;b++)for(const x of [20,148]){const y=b*BW+BW/2;P.set(x,y,'#2a2622');P.set(x,y+6,'#2a2622');streak(P,x,y+1,8,.25)}
  for(let i=0;i<5;i++)stain(P,hash2(i,1,654)*N,hash2(i,2,654)*N,14+hash2(i,3,654)*20,10+hash2(i,4,654)*16,.2,655+i)})}
function texMilCeil(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=x%16;let t=.55+(P.n(x,y,30,661,3)-.5)*.25;let c=dith(P,x,y,t,['#6a5a42','#7a6a4e','#8a785a','#988666'],.06);
    if(bx===0)c='#3a3022';else if(bx===1)c=lt(c,.1);P.set(x,y,c)}
  for(let i=0;i<3;i++)stain(P,hash2(i,1,662)*N,hash2(i,2,662)*N,10+hash2(i,3,662)*14,8+hash2(i,4,662)*12,.25,663+i)})}
// corrugated tin with rust; ribs run down the slope (along z)
function texMilRoof(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=x%16;const s=Math.sin(r/16*TAU)*.5+.5;
    let t=.3+s*.4+(P.n(x,y,48,671,3)-.5)*.2;let c=dith(P,x,y,t,['#2e2e2c','#3e3e3a','#4e4e48','#5e5c54','#6e6c62'],.08);
    const rs=P.n(x,y,32,672,4);if(rs>.55)c=mix(c,rs>.66?'#5a2a14':'#8a4a22',clamp((rs-.55)*3.5,0,.85));if(y%128<2)c='#1a1a18';P.set(x,y,c)}
  for(let i=0;i<20;i++){const x=Math.floor(hash2(i,1,673)*N);for(let k=0;k<N;k++)P.set(x,k,'#6a3218',.25*(.5+.5*Math.sin(k*.05+i)))}})}
function texMilStone(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,f2,id]=cellN(P,x,y,32,681);const e=f2-f1;const tone=hash2(id,1,682);
    let c=e<3?'#2a2420':mix(lt(rpickH(Math.floor(tone*997),['#6a5a4a','#7a6656','#5e5044','#86705e','#6e5e52']),.08),'#3a3028',clamp(f1/22,0,1));if(e>=3&&e<5)c=dk(c,.2);if(hash2(x,y,683)<.05)c=dk(c,.15);P.set(x,y,c)}})}
function texMilFrame(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let t=.6+(P.n(x,y,16,691,2)-.5)*.2;let c=dith(P,x,y,t,['#7a7464','#948e7c','#aaa490','#bcb6a2'],.06);if(P.n(x,y,8,692,2)>.66)c='#5a4e3e';P.set(x,y,c)}})}
function texMilPost(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const g=Math.sin(x*.4+P.n(x,y,16,701,2)*5)*.5+.5;let c=mix('#22180e','#4a3a28',g*.7);if(hash2(x,y,702)<.05)c=dk(c,.3);P.set(x,y,c)}})}
function texMilFence(){const N=TN;return paint(N,N,P=>{const BW=16;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=Math.floor(x/BW),lx=x%BW;const top=Math.floor(hash2(b,0,711)*10);const g=Math.sin(y*.05+P.n(x,y,24,712+b%5,2)*7)*.5+.5;
    let c=mix('#3a3228','#7a6e5c',g*.6+(hash2(b,1,713)-.5)*.3);if(lx<1){P.alpha(x,y,0);continue}if(lx<2)c=dk(c,.4);if(lx>BW-2)c=dk(c,.25);if(y<top&&(y+lx)%3)c=dk(c,.5);if(hash2(x,y,714)<.04)c=dk(c,.2);P.set(x,y,c)}
  for(const ry of [40,200])for(let x=0;x<N;x++)for(let k=0;k<12;k++)P.set(x,ry+k,k<2?'#7a6e5c':k>9?'#1e1810':'#4e4434');
  for(let b=0;b<16;b++)for(const ry of [44,204]){P.set(b*BW+8,ry,'#b8b0a0');P.set(b*BW+8,ry+5,'#b8b0a0');streak(P,b*BW+8,ry+1,10,.3)}})}
// balusters: alpha gaps (rails see-through), top rail and bottom rail; boxV maps v over the box height
function texMilRail(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){const top=y<8,bot=y>57,bal=x%16<4;if(!(top||bot||bal)){P.alpha(x,y,0);continue}
    const g=Math.sin((top||bot?x:y)*.2+P.n(x,y,16,721,2)*4)*.5+.5;let c=mix('#3a2e20','#6e5a40',g*.6);if(top&&y<2)c=lt(c,.2);P.set(x,y,c)}})}
function texMilTile(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=x>>4,ty=y>>4,gx=x&15,gy=y&15;let c=((tx+ty)&1)?'#c8ccc4':'#3a6a8a';
    if(gx<1||gy<1)c='#5a5c56';else{if(hash2(tx,ty,731)<.12)c=dk(c,.15);c=mix(c,'#6a5a3a',clamp((P.n(x,y,32,732,3)-.55)*1.6,0,.5));if(gx===1||gy===1)c=lt(c,.12)}P.set(x,y,c)}})}
function texMilKit(){const W=128,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=.6+(P.n(x,y,24,741,2)-.5)*.2;let c=dith(P,x,y,t,['#8a8470','#a49e88','#b8b29c','#c8c2ac'],.05);
    const lx=x%64;const drawer=y<34;const pnl=drawer?(lx>6&&lx<58&&y>6&&y<28):(lx>8&&lx<56&&y>42&&y<118);const edge=lx<3||lx>60||y<3||(y>30&&y<36)||y>124;
    if(edge)c='#3a3428';else if(pnl){c=dk(c,.06);if(drawer?(y===7||lx===7):(y===43||lx===9))c=dk(c,.3)}if((drawer&&Math.abs(lx-32)<5&&Math.abs(y-17)<2)||(!drawer&&Math.abs(lx-(x<64?52:12))<2&&Math.abs(y-70)<5))c='#2a2a26';
    if(y>H-14)c=mix(c,'#1a1612',.6);P.set(x,y,c)}})}
function texMilCounter(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=hash2(x,y,751)<.2?'#8a8272':hash2(x,y,752)<.1?'#5a5448':'#b0a890';c=mix(c,'#6a6252',clamp((P.n(x,y,16,753,2)-.5)*1.5,0,.4));P.set(x,y,c)}})}
function texMilFridge(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=mix('#b8b4a4','#d0ccbc',P.n(x,y,32,761,2));if(y===44||y===45)c='#3a3a36';if(x<2||x>61||y<2||y>125)c='#5a5850';
    if(x>50&&x<55&&((y>20&&y<38)||(y>52&&y<80)))c='#6a6a66';if(P.n(x,y,8,762,2)>.68)c=dk(c,.2);P.set(x,y,c)}})}
function texMilDoor(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const b=Math.floor(x/21),lx=x%21;const g=Math.sin(y*.05+b*2+P.n(x,y,24,771,2)*6)*.5+.5;
    let c=mix('#4a1e16','#7a3226',g*.6);if(P.n(x,y,12,772,3)>.6)c=mix('#4a3e30','#6a5a46',g);if(lx<1)c='#1a0c08';
    const br=(Math.abs(y-40)<7||Math.abs(y-216)<7)||(Math.abs((y-40)-(x*176/128))<8&&y>40&&y<216);if(br&&x>4&&x<124)c=dk(c,.1);if(br&&(Math.abs(y-40)===7||Math.abs(y-216)===7))c='#1a0c08';
    if(Math.hypot(x-108,y-132)<5)c=Math.hypot(x-107,y-131)<3?'#c8a050':'#5a4020';P.set(x,y,c)}})}
function texMilBed(){return paint(64,64,P=>{const cols=['#7a2a22','#b8a070','#3a4a6a','#6a7a4a','#a85a2a','#d0c4a0'];for(let y=0;y<64;y++)for(let x=0;x<64;x++){const id=Math.floor(x/16)+Math.floor(y/16)*4;
    let c=cols[Math.floor(hash2(id,1,781)*cols.length)];if(((x>>2)+(y>>2))%2&&hash2(id,2,781)<.5)c=dk(c,.2);if(x%16===0||y%16===0)c='#e8dcc0';c=mix(c,'#1a1410',clamp((P.n(x,y,16,782,2)-.5),0,.3));P.set(x,y,c)}})}
// a woven rug with stepped diamonds
function texMilRug(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const u=Math.abs(x-64),v=Math.abs(y-64);const d=Math.floor((u+v)/8);let c=d%3===0?'#8a2a1e':d%3===1?'#d8c8a0':'#2a1e18';
    if(u>58||v>58)c=(x+y)%8<4?'#2a1e18':'#8a2a1e';if(Math.max(u,v)>61)c='#d8c8a0';c=mix(c,'#3a2a20',clamp((P.n(x,y,32,791,2)-.5)*.8,0,.3));if(hash2(x,y,792)<.06)c=dk(c,.15);P.set(x,y,c)}})}
function texMilFire(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c='#0e0a08';if(y>40){const n=P.n(x,y,8,801,2);c=n>.55?'#ff9a3a':n>.45?'#c84a1a':'#3a1a0e';if(hash2(x,y,802)<.08)c='#ffd080'}
    else if(y>30&&P.n(x,y,6,803,2)>.62)c='#7a2a10';if(x<4||x>59||y<4)c='#3a3028';P.set(x,y,c)}})}
function texMilBlock(){const N=TN;return paint(N,N,P=>{const BW=51,BH=26;for(let y=0;y<N;y++){const r=Math.floor(y/BH),ly=y%BH;for(let x=0;x<N;x++){const off=r%2?25:0;const lx=(x+off)%N%BW;const id=hash2(Math.floor(((x+off)%N)/BW),r,811);
      let t=.5+(id-.5)*.2+(P.n(x,y,24,812,3)-.5)*.3+(hash2(x,y,813)-.5)*.1;let c=dith(P,x,y,t,['#4a4a46','#56564f','#62625a','#6e6e64','#7a7a6e'],.1);if(lx<2||ly<2)c=lx<1||ly<1?'#2a2a26':'#8a8a7e';if(hash2(x,y,814)<.04)c=dk(c,.25);P.set(x,y,c)}}
  for(let i=0;i<12;i++)streak(P,Math.floor(hash2(i,1,815)*N),Math.floor(hash2(i,2,815)*N*.5),40+Math.floor(hash2(i,3,815)*90),.12,2)})}
function texMilGarFl(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,56,821,4)-.5)*.4+(hash2(x,y,822)-.5)*.08;P.set(x,y,dith(P,x,y,t,['#2e2e2c','#3a3a36','#464640','#52524a','#5e5e54'],.1))}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,823)*N,hash2(i,2,823)*N,14+hash2(i,3,823)*26,10+hash2(i,4,823)*20,.45,824+i);for(let k=0;k<N;k++){P.set(k,128,'#1e1e1c');P.set(128,k,'#1e1e1c')}})}
function texMilShutter(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=y%8;let t=r<2?.25:r<6?.6:.4;t+=(P.n(x,y,32,831,3)-.5)*.3;let c=dith(P,x,y,t,['#2e3236','#3e4448','#4e555a','#5e666a'],.08);
    if(P.n(x,y,24,832,3)>.6)c=mix(c,'#7a3a1a',.6);P.set(x,y,c)}})}
// crates: a plank supply crate and an olive ammo crate with stencils
function texMilCrate(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const pl=Math.floor(y/32);const g=Math.sin(x*.1+pl*3+P.n(x,y,24,841+pl,2)*6)*.5+.5;let c=mix('#5a4026','#9a7448',g*.6);
    if(y%32<2)c='#2a1c10';const fr=x<10||x>117||y<10||y>117;if(fr)c=mix('#4a3420','#7a5a38',g*.5),c=(x<2||x>125||y<2||y>125)?'#1e140a':c;if(hash2(x,y,842)<.04)c=dk(c,.25);P.set(x,y,c)}
  for(const [x,y] of [[5,5],[122,5],[5,122],[122,122]]){P.set(x,y,'#c8c8c0');P.set(x+1,y+1,'#3a3a36')}
  P.post=x=>{x.fillStyle='rgba(28,20,12,.62)';x.font='bold 15px sans-serif';x.textAlign='center';x.fillText('보급품',64,58);x.font='bold 11px sans-serif';x.fillText('SUPPLY · 042',64,76)}})}
function texMilCrateG(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let t=.5+(P.n(x,y,24,851,3)-.5)*.3+(hash2(x,y,852)-.5)*.06;let c=dith(P,x,y,t,['#2a3020','#363e28','#424a30','#4e5638'],.08);
    const fr=x<8||x>119||y<8||y>119;if(fr)c=dk(c,.25);if(Math.abs(y-64)<4)c=dk(c,.35);if(P.n(x,y,16,853,2)>.68)c=mix(c,'#6a6650',.5);P.set(x,y,c)}
  for(const x0 of [22,94])for(let y=58;y<70;y++)for(let x=x0;x<x0+12;x++)P.set(x,y,(y===58||y===69)?'#1a1a16':'#5a5e5a');
  P.post=x=>{x.fillStyle='rgba(220,200,90,.75)';x.font='bold 14px sans-serif';x.textAlign='center';x.fillText('탄약 AMMO',64,40);x.font='bold 10px sans-serif';x.fillText('7.62 · 1200',64,100)}})}
function texMilTruck(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,48,861,3)-.5)*.3+(hash2(x,y,862)-.5)*.05;let c=dith(P,x,y,t,['#2a3a3a','#34484a','#3e5658','#4a6466','#567274'],.08);
    const r=P.n(x,y,24,863,4);if(r>.58)c=mix(c,r>.68?'#4a2412':'#8a4a22',clamp((r-.58)*4,0,.9));if(y%128<2)c='#141a1a';P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,864)*N),Math.floor(hash2(i,2,864)*N),20+Math.floor(hash2(i,3,864)*60),.2,2)})}
function texMilGlass(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#141c26','#2a3a4a',y/64);if((x+y)%24<3)c='#4a5a6a';if(P.n(x,y,16,871,2)>.62)c=mix(c,'#6a6a5a',.4);if(x<3||y<3||x>60||y>60)c='#1a1a1a';P.set(x,y,c)}})}
// the culvert mouth: corrugated rings closing into darkness
function texMilPipe(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.hypot(x-63.5,y-63.5)/62;let c;
    if(r>1)c=mix('#4a4844','#5e5c56',P.n(x,y,16,881,2));else if(r>.86){const s=Math.sin(r*90)*.5+.5;c=mix('#3a3a36','#7a7a70',s);if(P.n(x,y,12,882,2)>.6)c=mix(c,'#7a3a1a',.6)}
    else{const k=Math.pow(r/.86,1.6);c=mix('#020202','#2a2a26',k);if(Math.sin(r*60)>.7)c=lt(c,.08);if(y>100)c=mix(c,'#1a2a2a',.5)}P.set(x,y,c)}})}
function texMilCorr(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=Math.sin(y/8*TAU)*.5+.5;let t=.3+s*.4+(P.n(x,y,32,891,3)-.5)*.2;let c=dith(P,x,y,t,['#3a3a36','#4a4a44','#5a5a52','#6a6a60'],.08);
    if(P.n(x,y,24,892,3)>.6)c=mix(c,'#7a3a1a',.6);P.set(x,y,c)}})}
function texMilMap(){return paint(128,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<128;x++){let c=mix('#c8b890','#a8946a',P.n(x,y,32,901,3));if(Math.sin(P.n(x,y,24,902,3)*30)>.92)c='#7a5a3a';if(x<3||y<3||x>124||y>92)c='#5a4a30';P.set(x,y,c)}
  P.post=x=>{x.strokeStyle='rgba(170,30,20,.85)';x.lineWidth=2;x.beginPath();x.moveTo(20,70);x.lineTo(60,40);x.lineTo(100,58);x.stroke();x.fillStyle='rgba(170,30,20,.9)';x.font='bold 12px sans-serif';x.fillText('X',96,50);x.fillStyle='rgba(30,30,30,.8)';x.font='9px sans-serif';x.fillText('협곡 북측',14,20)}})}
function texMilRadio(){return paint(96,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<96;x++){let c=mix('#2a3020','#3a4230',P.n(x,y,16,911,2));if(x<3||y<3||x>92||y>60)c='#141810';
    if(x>8&&x<46&&y>10&&y<30)c=(y%4<2)?'#3aff7a':'#1a5a2a';if(Math.hypot(x-64,y-22)<9)c=Math.hypot(x-64,y-22)<6?'#1a1a16':'#5a5e56';if(Math.hypot(x-80,y-46)<5||Math.hypot(x-60,y-46)<5)c='#8a8a80';P.set(x,y,c)}})}
function texMilBag(){const N=128;return paint(N,N,P=>{const BW=64,BH=24;for(let y=0;y<N;y++){const row=Math.floor(y/BH),ly=y-row*BH;const off=row%2?BW/2:0;for(let x=0;x<N;x++){const lx=(x+off)%BW;
      const u=(lx+.5)/BW*2-1,v=(ly+.5)/BH*2-1;const r=Math.pow(Math.abs(u),3)+Math.pow(Math.abs(v),2.2);if(r>1){P.set(x,y,'#14100a');continue}
      let t=.64+v*.2-r*.3+(P.n(x,y,16,921,2)-.5)*.2;P.set(x,y,dith(P,x,y,t,['#3a3424','#4a4230','#5a503a','#6a5e44','#786a4c'],.08))}}})}
function texMilCurtain(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const f=Math.sin(x*.6)*.5+.5;let c=mix('#8a4a1e','#e8a858',f*.7+P.n(x,y,16,935,2)*.3);if(y>58)c='#5a2e12';P.set(x,y,c)}})}
function texMilCloth(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=(x>>3)%2?'#6a2a24':'#8a3a2e';c=mix(c,'#1a100c',clamp((P.n(x,y,16,931,2)-.45),0,.4));if(y%16===0)c=dk(c,.3);P.set(x,y,c)}})}
// clear moonlit sky: deep blue zenith, a faint galactic band, a cold haze over distant mesas on the horizon
function texMilSky(){return paint(1024,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/232;let c=mix('#03050c','#0c1426',clamp(t*1.2,0,1));c=mix(c,'#22304c',clamp((t-.62)*2.6,0,1));
    // galactic band: a slanted belt of faint light with dark lanes
    const bu=(x/1024)*TAU,bv=y/256;const band=Math.exp(-Math.pow((bv-(.35+.22*Math.sin(bu+1.3)))*7,2));if(band>.05){const n=fbm(x/60,y/14,941,5,1024/60);c=mix(c,'#3a4258',clamp(band*(n-.32)*1.6,0,.55));if(n<.42)c=mix(c,'#04060c',band*.35)}
    if(y>214&&y<236){const m=fbm(x/90,0,942,4,1024/90);const top=226-m*16-Math.max(0,Math.sin(x/1024*TAU*3+.4))*6;if(y>top)c=mix('#0a0e18','#141a28',(y-top)/10)}
    if(y>=236)c='#0a0e18';P.set(x,y,c)}})}
function bakeMilTex(){if(TEX.milRock)return;
  TEX.milRock=mkTex(texMilRock());TEX.milRockT=mkTex(texMilRockT());TEX.milDirt=mkTex(texMilDirt());TEX.milGrav=mkTex(texMilGrav());
  TEX.milConc=mkTex(texMilConc());TEX.milConcF=mkTex(texMilConcF());TEX.milWater=mkTex(texMilWater());
  TEX.milSiding=mkTex(texMilSiding());TEX.milWallIn=mkTex(texMilWallIn());TEX.milFloor=mkTex(texMilFloor());TEX.milPlank=mkTex(texMilPlank());TEX.milCeil=mkTex(texMilCeil());
  TEX.milRoof=mkTex(texMilRoof());TEX.milStone=mkTex(texMilStone());TEX.milFrame=mkTex(texMilFrame());TEX.milPost=mkTex(texMilPost());TEX.milFence=mkTex(texMilFence());TEX.milRail=mkTex(texMilRail());
  TEX.milTile=mkTex(texMilTile());TEX.milKit=mkTex(texMilKit());TEX.milCounter=mkTex(texMilCounter());TEX.milFridge=mkTex(texMilFridge(),false);TEX.milDoor=mkTex(texMilDoor(),false);
  TEX.milBed=mkTex(texMilBed());TEX.milRug=mkTex(texMilRug(),false);TEX.milFire=mkTex(texMilFire(),false);TEX.milBlock=mkTex(texMilBlock());TEX.milGarFl=mkTex(texMilGarFl());TEX.milShutter=mkTex(texMilShutter());
  TEX.milCrate=mkTex(texMilCrate(),false);TEX.milCrateG=mkTex(texMilCrateG(),false);TEX.milTruck=mkTex(texMilTruck());TEX.milGlass=mkTex(texMilGlass(),false);
  TEX.milPipe=mkTex(texMilPipe(),false);TEX.milCorr=mkTex(texMilCorr());TEX.milLamp=mkTex(texLight('#ffcf7a'),false);TEX.milLampW=mkTex(texLight('#f4f0e4'),false);
  TEX.milSignA=mkTex(texSign([{t:'출입금지'},{t:'NO TRESPASSING',s:8}],'#6a2418','#ece0c4',112,36),false);
  TEX.milSignB=mkTex(texSign([{t:'붉은 메사 목장'},{t:'RED MESA RANCH · EST. 1962',s:7}],'#2e2216','#e8c878',140,34),false);
  TEX.milCurtain=mkTex(texMilCurtain());TEX.milMap=mkTex(texMilMap(),false);TEX.milRadio=mkTex(texMilRadio(),false);TEX.milBag=mkTex(texMilBag());TEX.milCloth=mkTex(texMilCloth());
  TEX.milDrum=mkTex(texMilDrum('#5e6230','DIESEL'));TEX.milDrumR=mkTex(texMilDrum('#7a3a1e','WATER'));TEX.milShelf=mkTex(texMilShelf(),false);
  TEX.milSky=mkTex(texMilSky());TEX.milSky.wrapT=THREE.ClampToEdgeWrapping;
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['milRock','milRockT','milDirt','milGrav','milConc','milConcF','milSiding','milFloor','milPlank','milRoof','milBlock','milGarFl','milFence'])TEX[k].anisotropy=an;
  MIXC.clear();VN_T.clear();_vnK=-1;_vnT=null;_fbC.length=0}
function texMilShelf(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c='#141210';const sy=y%42;if(sy<4)c=sy<2?'#6a6e6a':'#3a3c3a';else if(x<4||x>123)c='#4a4e4a';
    else{const bi=Math.floor(x/18)+Math.floor(y/42)*9;const h=14+hash2(bi,1,951)*22;if(sy>42-h&&x%18>1&&x%18<16){const k=hash2(bi,2,951);c=k<.3?'#8a6a3e':k<.55?'#4a5a32':k<.75?'#7a2a22':'#c8c0a8';if((x+y)%7===0)c=dk(c,.2)}}P.set(x,y,c)}})}
function texMilDrum(base,label){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const rib=y%42;let t=.55+(P.n(x,y,24,961,3)-.5)*.3+(hash2(x,y,962)-.5)*.06;if(rib<3)t+=.25;else if(rib<5)t-=.25;
    P.set(x,y,dith(P,x,y,t,[dk(base,.5),dk(base,.3),dk(base,.12),base,lt(base,.12),lt(base,.25)],.1))}
  for(let i=0;i<16;i++){const x=Math.floor(hash2(i,1,963)*128),y0=Math.floor(hash2(i,2,963)*40),l=20+Math.floor(hash2(i,3,963)*80);for(let k=0;k<l;k++)P.set(x,y0+k,k<l*.3?'#a85a2a':'#5a2a14',.5-k/l*.4)}
  P.post=x=>{x.fillStyle='rgba(230,226,210,.6)';x.font='bold 15px sans-serif';x.fillText(label,24,72)}})}
// ---------- geometry ----------
function buildMilitia(){const D=MIL_DATA,N='none',ROWS=D.grid.split('|');
  const at=(x,z)=>{const i=Math.floor((x-D.x0)/D.cs),j=Math.floor((z-D.z0)/D.cs);return (i<0||j<0||i>=D.nx||j>=D.nz)?'.':ROWS[j][i]};
  const open=c=>c==='d'||c==='h'||c==='w';
  const H=(a,b,c)=>hash2(Math.round(a*7),Math.round(b*7),c);
  const FL=.25,UP=3.4,TOP=6.4;// house: ground floor, upper floor, eaves
  // ================= ground, channel floors, curbs =================
  for(const [x0,z0,x1,z1] of D.gnd)B(x0,-1,z0,x1,0,z1,'milDirt',{ground:1});
  for(const [x0,z0,x1,z1] of D.chf)B(x0,-2.7,z0,x1,-1.7,z1,'milConcF',{ground:1});
  for(const [x0,z0,x1,z1,f] of D.crb){const ff={py:'milCurb',ny:N};for(const k of ['px','nx','pz','nz'])if(f.indexOf(k)<0)ff[k]=N;B(x0,-1.8,z0,x1,0,z1,'milConc',{f:ff})}
  // ================= rock: a low front band along the open ground (the first ledge), the mass set back behind it; fallen boulders =================
  // boxes are grown 1.5 cm on every side so neighbouring faces overlap and no hairline cracks open between them
  const front=(fk,x0,z0,x1,z1,d)=>{const cx=(x0+x1)/2,cz=(z0+z1)/2;return fk==='px'?[x1+d,cz]:fk==='nx'?[x0-d,cz]:fk==='pz'?[cx,z1+d]:[cx,z0-d]};
  let nb=0;const E=.015;
  for(const [x0,z0,x1,z1,h,y0,off,fr] of D.rock){
    const a=x0-(off.nx||0),c=x1+(off.px||0),b=z0-(off.nz||0),d=z1+(off.pz||0);
    B(a-E,y0,b-E,c+E,h,d+E,fr?'milRock':'milRockF',{f:{py:'milRockT',ny:N}});
    if(!fr)continue;
    for(const fk in off){const len=(fk==='px'||fk==='nx')?d-b:c-a;
      // a caprock lip along the top of the ledge band casts a shadow line
      if(len>=1.5&&h<9){const o={f:{py:'milRockT'}},p=.22+H(x0,z1,37)*.16,y=h-.3-H(z0,x1,38)*.25;
        if(fk==='px')B(c-.1,y,b-.05,c+p,h+.08,d+.05,'milRock',o);else if(fk==='nx')B(a-p,y,b-.05,a+.1,h+.08,d+.05,'milRock',o);
        else if(fk==='pz')B(a-.05,y,d-.1,c+.05,h+.08,d+p,'milRock',o);else B(a-.05,y,b-p,c+.05,h+.08,b+.1,'milRock',o)}
      if(nb>=70)continue;const r=H(x0+z1,z0+x1,fk.charCodeAt(0)+fk.charCodeAt(1));if(r<.62)continue;
      let ok=true;for(const dd of [.3,1,1.8,2.6,3.4]){const q=front(fk,a,b,c,d,dd);if(at(q[0],q[1])!=='d'){ok=false;break}}if(!ok)continue;
      const o={f:{py:'milRockT'}};for(let k=0;k<(r>.9?2:1);k++){nb++;
        const s=(k?.35:.55)+H(x1+k,z1,34)*.5,hh=(k?.25:.4)+H(z1,x1+k,35)*.55,u=H(x0+k,x1,36)*Math.max(0,len-s*1.2-.3)+.15,e=k?s*.6:0;
        if(fk==='px')B(c+e,0,b+u,c+e+s,hh,b+u+s*1.2,'milRockF',o);else if(fk==='nx')B(a-e-s,0,b+u,a-e,hh,b+u+s*1.2,'milRockF',o);
        else if(fk==='pz')B(a+u,0,d+e,a+u+s*1.2,hh,d+e+s,'milRockF',o);else B(a+u,0,b-e-s,a+u+s*1.2,hh,b-e,'milRockF',o)}}}
  // the rock spire in the south yard: a weathered stack narrowing upward
  for(const [x0,y0,z0,x1,y1,z1] of [[32.4,0,8.6,36.8,4.2,19.6],[33.2,0,7.3,35.8,1.1,8.6],[33.3,0,19.6,35.9,.9,20.7],[36.8,0,10.6,37.25,1.0,17.8],[32,0,11.2,32.4,1.2,16.6],
    [32.8,4.2,9.1,36.6,6.9,18.6],[35.2,4.2,8.6,36.8,5.6,12.2],[32.4,4.2,15.6,33.6,5.3,19.3],[33.2,6.9,9.6,36.2,9.6,17.4],[35.6,6.9,15.8,36.6,8.3,18.4],[32.8,6.9,12,33.6,8,15.2],
    [33.7,9.6,10.4,35.9,12.4,14.6],[34.2,9.6,14.6,35.4,11.2,16.8],[34.1,12.4,10.9,35.4,13.9,13.2],[34.4,12.4,13.2,35.1,13.2,14.2]])
    B(x0-E,y0,z0-E,x1+E,y1,z1+E,y1>5?'milRockF':'milRock',{f:{py:'milRockT',ny:N}});
  // backdrop beyond the playable edge: only the faces turned toward the canyon are drawn
  for(const [x0,z0,x1,z1,h] of D.bk){const f={ny:N,py:'milRockT'};f[(x0+x1)/2>0?'px':'nx']=N;f[(z0+z1)/2>0?'pz':'nz']=N;B(x0,-1,z0,x1,h,z1,'milRockF',{f})}
  // ================= channels: steps, the culvert, the wash tunnel with its arches, timber cribbing =================
  const CM='milConc';
  // step edges sit on quarter metres so every 1 m nav cell centre lands in the middle of a step
  stairs('z',-35.75,-33.25,-1.75,2.25,-1.7,0,8,CM);   // plateau channel, south end
  stairs('x',-10.25,-7.25,-21.75,-17.75,-1.7,0,8,CM); // its branch into the west canyon
  stairs('z',-38.75,-33.75,7.75,4.25,-1.7,0,7,CM);    // the wash, down from the plateau
  stairs('x',18.25,22.75,-23.75,-19.75,-1.7,0,8,CM);  // the wash, up into the south strip
  stairs('z',1.25,4.25,3.75,.25,-1.7,0,7,CM);         // east channel, up to the channel head
  stairs('z',28.75,31.25,27.25,24.25,-1.7,0,6,CM);    // east channel, up into the yard
  // culvert: a concrete headwall and the pipe mouth where the plateau channel starts
  B(-22.4,-1.8,-21.95,-19.1,.5,-21.45,CM,{f:{py:'milCurb'}});B(-21.6,-1.7,-21.47,-19.9,-.05,-21.42,'milPipe',{nosolid:true});B(-22.6,.5,-22.05,-18.9,.75,-21.35,CM,{f:{py:'milCurb'}});
  B(-21.4,-1.695,-21.4,-20.1,-1.69,-19.6,'milWater',{nosolid:true});B(-26.5,-1.695,-12.6,-25.2,-1.69,-11,'milWater',{nosolid:true});B(-33.2,-1.695,-6.2,-32.1,-1.69,-4.6,'milWater',{nosolid:true});
  // the wash tunnel: rock bridge with a concrete soffit, arched portals at both ends, a caged bulb
  B(-38.6,1.05,9.5,-33.4,6.2,15.5,'milRock',{f:{ny:'milConc',py:'milRockT'}});
  const portal=(z0,z1)=>{const o={f:{py:'milCurb'}};B(-39.1,-1.8,z0,-38.1,1.75,z1,CM,o);B(-34.4,-1.8,z0,-33.3,1.75,z1,CM,o);
    for(const [u0,u1,y] of [[-38.1,-37.5,.15],[-37.5,-36.9,.55],[-36.9,-35.6,.85],[-35.6,-35,.55],[-35,-34.4,.15]])B(u0,y,z0,u1,1.75,z1,CM,o);B(-39.3,1.75,z0-.06,-33.1,2.0,z1+.06,CM,o)};
  portal(9.2,9.6);portal(15.4,15.8);
  B(-36.4,.85,12.3,-36,1.05,12.7,'milLamp',{nosolid:true});LIGHT(-36.2,.6,12.5,'#ffc878',7.5,.9);
  // timber cribbing along the north wall of the wash
  for(const x of [-29.6,-27.4,-25.2,-23.8])B(x-.1,-1.75,18.3,x+.1,.95,18.5,'milPost');
  for(const y of [-1.4,-.7,0,.6])B(-29.8,y,18.38,-23.6,y+.32,18.5,'milFence',{nosolid:true});
  // ================= the house: two storeys of clapboard on a stone footing, outside stair to the deck =================
  const S='milSiding',WI='milWallIn',FR='milFrame';
  const exX=(x0,x1,z0,z1,y0,y1,holes,out)=>wallX(x0,x1,z0,z1,y0,y1,FR,holes,{f:out<0?{nz:S,pz:WI}:{pz:S,nz:WI}});
  const exZ=(x0,x1,z0,z1,y0,y1,holes,out)=>wallZ(x0,x1,z0,z1,y0,y1,FR,holes,{f:out<0?{nx:S,px:WI}:{px:S,nx:WI}});
  const inX=(x0,x1,z,y0,y1,holes)=>wallX(x0,x1,z-.07,z+.07,y0,y1,FR,holes,{f:{pz:WI,nz:WI}});
  const inZ=(x,z0,z1,y0,y1,holes)=>wallZ(x-.07,x+.07,z0,z1,y0,y1,FR,holes,{f:{px:WI,nx:WI}});
  const DG=2.6,DU=UP+2.35,W0=1.15,W1=2.3,U0=4.4,U1=5.5;
  B(10,-.3,-12.8,28.6,FL,.8,'milStone',{f:{py:'milFloor',ny:N}});
  // windows [u0,u1,y0,y1] per wall; doors are plain holes
  const WN=[[11.4,12.4,1.7,W1],[25.4,26.8,W0,W1],[16.6,18,U0,U1],[19.4,20.8,U0,U1],[24,25.4,U0,U1],[26.4,27.8,U0,U1]],WS=[[11,12.4,W0,W1],[11,12.4,U0,U1],[21.6,23,U0,U1],[25.2,26.6,U0,U1]],
    WW=[[-11.2,-10.2,1.7,W1],[-1.6,-.4,W0,W1],[-11,-9.8,U0,U1],[-4.4,-3.2,U0,U1],[-1.6,-.4,U0,U1]],WE=[[-7.4,-6.2,U0,U1],[-3.4,-2.2,U0,U1]];
  exX(10,28.6,-12.8,-12.58,FL,TOP,WN.concat([[22.4,24.2,FL,DG],[12,13.8,UP,DU]]),-1);
  exX(10,28.6,.58,.8,FL,TOP,WS.concat([[17.2,19,FL,DG],[23.4,25.2,FL,DG],[17.2,19,UP,DU]]),1);
  exZ(10,10.22,-12.58,.58,FL,TOP,WW.concat([[-4.6,-2.8,FL,DG]]),-1);
  exZ(28.38,28.6,-12.58,.58,FL,TOP,WE.concat([[-12.2,-10.4,UP,DU]]),1);
  const CV={nosolid:true};
  for(const [u0,u1,,y1] of WN)B(u0,y1-.32,-12.56,u1,y1,-12.52,'milCurtain',CV);for(const [u0,u1,,y1] of WS)B(u0,y1-.32,.52,u1,y1,.56,'milCurtain',CV);
  for(const [u0,u1,,y1] of WW)B(10.24,y1-.32,u0,10.28,y1,u1,'milCurtain',CV);for(const [u0,u1,,y1] of WE)B(28.32,y1-.32,u0,28.36,y1,u1,'milCurtain',CV);
  slab(10.22,-12.58,28.38,.58,3.15,UP,'milCeil',[[15.5,-12.58,21,-11.15]],{f:{py:'milFloor'}});
  B(10,TOP,-12.8,28.6,TOP+.2,.8,'milCeil',{f:{py:N}});
  // partitions: bathroom | living room | hall with the stair | kitchen; upstairs landing, bedroom, hall, bunk room
  inZ(15,-12.58,.58,FL,3.15,[[-6,-4.2,FL,DG]]);inX(10.22,14.93,-9.07,FL,3.15,[[11.6,13.4,FL,DG]]);inZ(21.5,-12.58,.58,FL,3.15,[[-6,-4.2,FL,DG]]);
  inZ(15,-9.07,.58,UP,TOP,[[-6,-4.2,UP,DU]]);inX(10.22,14.93,-9.07,UP,TOP,[[11.6,13.4,UP,DU]]);inZ(21.5,-12.58,.58,UP,TOP,[[-10.6,-8.8,UP,DU],[-3,-1.2,UP,DU]]);
  stairs('x',-12.58,-11.15,21,15.5,FL,UP,14,'milFloor',{f:{pz:'milPost',nz:WI}});
  B(15.9,UP,-11.15,21,UP+1,-11.08,'milRail',{pass:1});B(20.93,UP,-12.58,21,UP+1,-11.15,'milRail',{pass:1});
  // gable roof of corrugated tin in steps, a fieldstone chimney on the west wall
  B(9.5,TOP+.2,-13.3,29.1,TOP+.45,1.3,'milRoof',{f:{ny:'milPost'}});
  for(let k=1;k<=6;k++){const y0=TOP+.45+(k-1)*.4;B(9.7,y0,-13.3+k*1.12,28.9,y0+.4,1.3-k*1.12,'milRoof',{f:{ny:N,px:S,nx:S}})}
  B(9.6,TOP+2.85,-6.2,29,TOP+3.0,-5.8,'milRoof',{f:{ny:N}});
  B(9.35,-.3,-7.3,10,9.9,-5.7,'milStone',{f:{px:N}});B(9.25,9.9,-7.4,10.1,10.1,-5.6,'milStone');MAP.smoke.push([9.7,10.2,-6.5]);
  // ground floor rooms
  B(10.22,FL,-7.1,10.85,1.45,-5.9,'milStone');B(10.85,FL+.05,-6.85,10.87,1.0,-6.15,'milFire',{nosolid:true});B(10.22,1.45,-7.35,11.05,1.56,-5.65,'milPost');
  LIGHT(11.4,.8,-6.5,'#ff8a40',5,.8);MAP.dyn.push([11.3,.9,-6.5,'#ff7a30',3.5,.45,.45]);
  B(12.4,FL,-4.3,13.35,FL+.42,-1.2,'milCloth');B(13.1,FL+.42,-4.3,13.35,FL+.95,-1.2,'milCloth');B(10.7,FL,-4.5,12.2,FL+.012,-1,'milRug',{nosolid:true});B(11,FL,-3.3,11.9,FL+.45,-2.4,'milPost');
  B(13.3,FL,0,14.85,FL+1.9,.58,'milPost');
  B(10.22,FL,-12.58,14.93,FL+.012,-9.07,'milTile',{nosolid:true});B(10.22,FL,-12.58,11.9,FL+.5,-11.1,'milTile',{f:{py:'milWater'}});
  B(14.2,FL,-12.58,14.8,FL+.42,-12,FR);B(14.2,FL+.42,-12.58,14.8,FL+.85,-12.38,FR);B(12.6,FL+.75,-9.42,13.5,FL+.9,-9.14,FR,{nosolid:true});
  B(20.9,FL,-9.6,21.43,FL+1.0,-8,'milPost');
  // kitchen: peninsula, counters with the sink, fridge, stove, table
  B(23.6,FL,-4.9,28.38,FL+.92,-4.25,'milKit',{f:{py:'milCounter'}});B(27.72,FL,-4.25,28.38,FL+.92,-1.4,'milKit',{f:{py:'milCounter'}});B(25.4,FL,-.08,28.38,FL+.92,.58,'milKit',{f:{py:'milCounter'}});
  B(26.4,FL+.9,-.0,27.4,FL+.93,.45,'milWater',{nosolid:true});B(21.6,FL,-.25,22.45,FL+1.85,.58,'milFridge');B(22.6,FL,-.1,23.3,FL+.9,.58,'metal2',{f:{py:'milRoof'}});
  B(23.7,FL+.72,-11.7,25.9,FL+.8,-9.8,'milPost');for(const [x,z] of [[23.8,-11.6],[25.7,-11.6],[23.8,-10],[25.7,-10]])B(x,FL,z,x+.1,FL+.72,z+.1,'milPost',{nosolid:true});
  B(22.7,FL,-11.2,23.2,FL+.48,-10.4,'milPost');B(26.4,FL,-11.2,26.9,FL+.48,-10.4,'milPost');
  // upstairs: a bed and wardrobe, the radio table with the map, bunks and ammo in the east room
  B(10.3,UP,-3.4,12.2,UP+.5,-1.1,'milBed');B(10.22,UP,-3.4,10.36,UP+1.1,-1.1,'milPost');B(13.9,UP,-8.95,14.93,UP+2.1,-7.5,'milPost');
  B(17.6,UP+.74,-6.4,19.6,UP+.82,-5.2,'milPost');for(const [x,z] of [[17.7,-6.3],[19.4,-6.3],[17.7,-5.4],[19.4,-5.4]])B(x,UP,z,x+.1,UP+.74,z+.1,'milPost',{nosolid:true});
  B(17.8,UP+.82,-6.3,18.4,UP+1.2,-5.9,'milRadio',{nosolid:true});B(18.6,UP+.82,-6.3,19.5,UP+.83,-5.4,'milMap',{nosolid:true});LIGHT(18.1,UP+1.4,-5.6,'#7aff9a',2.6,.3);
  for(const z of [-12.4,-10.9])B(22.1,UP,z,24.1,UP+.28,z+1.1,'milBed');B(26.6,UP,-12.4,28.3,UP+.28,-11.3,'milBed');
  for(const [x,z,y] of [[27.6,-3.2,0],[27.6,-2.4,0],[27.6,-2.8,.7],[22.3,-.2,0]])B(x-.35,UP+y,z-.35,x+.35,UP+y+.7,z+.35,'milCrateG');
  B(15.4,UP,-.0,16.6,UP+.7,.55,'milBag');B(19.6,UP,-.0,20.8,UP+.7,.55,'milBag');
  // house lights: warm lamps in every room, porch lamps outside
  for(const [x,y,z,r,i] of [[12.6,2.75,-4.2,8,1.0],[12.6,2.6,-10.8,5,.6],[18.2,2.75,-5.5,8.5,.9],[25,2.75,-6.5,9,1.0],[12.6,5.95,-5,8,.9],[13,5.95,-10.8,6,.65],[18.2,5.95,-7,8.5,.85],[25,5.95,-6,9.5,.95]]){
    B(x-.18,y+.3,z-.18,x+.18,y+.42,z+.18,'milLamp',{nosolid:true});LIGHT(x,y,z,'#ffb468',r,i)}
  B(9.86,2.8,-3.95,10,3.0,-3.45,'milLamp',{nosolid:true});LIGHT(8.9,2.7,-3.7,'#ffcf80',8,.62);
  B(28.6,5.95,-11.55,28.76,6.15,-11.05,'milLamp',{nosolid:true});LIGHT(29.4,5.8,-11.3,'#ffcf80',8.5,.85);
  // the outside stair along the east wall, its landing, the north deck on posts, rails
  stairs('z',28.65,31.3,.8,-9,0,UP,15,'milPlank',{f:{px:'milFence',nx:'milFence'}});
  B(28.6,3.15,-15.95,31.3,UP,-9,'milPlank',{f:{ny:'milPlank'}});B(10.6,3.15,-15.95,28.6,UP,-12.8,'milPlank',{f:{ny:'milPlank'}});
  for(const x of [11,14.5,18,21.5,25,28.5])B(x-.1,0,-15.9,x+.1,3.15,-15.7,'milPost');for(const z of [-15.8,-12.7,-9.3])B(31,0,z-.1,31.2,3.15,z+.1,'milPost');
  B(10.6,UP,-15.95,10.68,UP+1,-12.8,'milRail',{pass:1});B(31.22,UP,-15.95,31.3,UP+1,-9,'milRail',{pass:1});
  for(let k=0;k<5;k++){const z0=.8-k*1.96,y=(k*3)*UP/15;B(31.18,y+.15,z0-1.96,31.3,y+.25,z0,'milPost',{nosolid:true});B(31.18,y+.25,z0-.08,31.3,y+1.1,z0,'milPost',{nosolid:true})}
  B(19.8,2.95,-14.5,20.2,3.15,-14.1,'milLamp',{nosolid:true});LIGHT(20,2.7,-14.3,'#ffcf80',6.5,.65);
  B(17.4,4.2,.8,20.6,4.95,.84,'milSignB',{nosolid:true});
  // ================= the garage: block walls, open roll-up door, a pickup, shelves; its roof is a sandbagged terrace off the upstairs hall =================
  const BL='milBlock';
  B(13.2,-.3,.8,23.2,.05,13.2,'milGarFl',{f:{ny:N}});
  wallX(13.2,23.2,.8,1.1,0,3.15,BL,[[17.2,19,0,DG]]);wallX(13.2,23.2,12.9,13.2,0,3.15,BL,[[14.2,20.2,0,2.8]]);
  wallZ(13.2,13.5,1.1,12.9,0,3.15,BL,[[3,4.4,W0,W1],[7,8.8,0,DG]]);wallZ(22.9,23.2,1.1,12.9,0,3.15,BL,[[4.6,6.4,0,DG],[9,10.4,W0,W1]]);
  B(13.2,3.15,.8,23.2,UP,13.2,BL,{f:{py:'milCurb',ny:'milCorr'}});
  B(13.2,UP,.8,13.45,UP+.9,13.2,BL,{f:{py:'milCurb'}});B(13.45,UP,12.95,23.2,UP+.9,13.2,BL,{f:{py:'milCurb'}});B(22.95,UP,.8,23.2,UP+.9,12.95,BL,{f:{py:'milCurb'}});
  for(const [x0,z0,x1,z1] of [[14.6,12.9,16.6,13.25],[19.6,12.9,21.6,13.25],[13.15,5,13.5,7.2],[22.9,8,23.25,10.2]])B(x0,UP+.9,z0,x1,UP+1.35,z1,'milBag');
  B(14,2.75,13.2,20.4,3.15,13.5,'milShutter',{f:{ny:'metal2'}});B(16.8,2.95,13.5,17.6,3.1,13.75,'milLampW',{nosolid:true});LIGHT(17.2,2.75,14.3,'#ffe2b0',13,1.05);
  // pickup truck (front to the west)
  {const x0=14.2,x1=18.9,z0=5.3,z1=7.3;B(x0+.1,.4,z0,x1-.1,1.0,z1,'milTruck');B(x0+.7,1.0,z0+.08,x0+2.1,1.72,z1-.08,'milTruck',{f:{nx:'milGlass',pz:'milGlass',nz:'milGlass'}});
    B(x0+2.15,1.0,z0,x1-.1,1.38,z0+.08,'milTruck');B(x0+2.15,1.0,z1-.08,x1-.1,1.38,z1,'milTruck');B(x1-.18,1.0,z0+.08,x1-.1,1.38,z1-.08,'milTruck');
    B(x0,.35,z0+.1,x0+.1,.62,z1-.1,'metal2');B(x1-.1,.35,z0+.1,x1,.6,z1-.1,'metal2');
    for(const xx of [x0+.6,x1-1.3])for(const zz of [z0-.06,z1-.24])B(xx,.05,zz,xx+.72,.72,zz+.3,'tire');
    crate(x1-1.2,z0+.6,.7,1.0,'milCrateG');drum(x1-.6,z1-.5,1.0,'milDrum')}
  B(22.25,.05,6.8,22.9,2.1,9.6,'milShelf');B(22.25,.05,9.8,22.9,2.1,12.6,'milShelf');B(13.5,.05,1.1,16.6,.95,1.75,'milPost',{f:{py:'milPlank'}});B(13.6,1.2,1.1,16.5,2.3,1.13,'milShelf',{nosolid:true});
  drum(21.4,1.9,.05,'milDrum');drum(21.95,2.5,.05,'milDrumR');tireStack(14.1,11.9,4,.05);crate(15.6,11.9,1.0,.05,'milCrate');crate(16.7,12.1,.85,.05,'milCrate');
  B(16.5,3.03,4.8,18.5,3.12,5.0,'milLampW',{nosolid:true});LIGHT(17.5,2.75,4.9,'#e4ecff',9,.95);B(16.5,3.03,9.3,18.5,3.12,9.5,'milLampW',{nosolid:true});LIGHT(17.5,2.75,9.4,'#e4ecff',9,.85);
  MAP.dyn.push([17.5,2.7,9.4,'#dfe8ff',6,.35,.6]);
  // the annex behind the kitchen: utility room with a generator
  B(23.2,-.3,.8,28.6,.05,3.2,'milGarFl',{f:{ny:N}});
  wallX(23.2,28.6,2.98,3.2,0,2.9,FR,[[24.2,26,0,DG]],{f:{pz:S,nz:BL}});wallZ(28.38,28.6,.8,2.98,0,2.9,FR,[],{f:{px:S,nx:BL}});
  B(23,2.9,.8,28.8,3.1,3.45,'milRoof',{f:{ny:'milCorr'}});
  B(26.6,.05,1,28.2,1.0,1.9,'metal2',{f:{py:'milCorr'}});B(27.9,1.0,1.3,28.05,2.9,1.45,'milCorr',{nosolid:true});B(23.4,.05,1,24,1.6,1.6,'milShelf');
  LIGHT(25.6,2.55,2,'#ffcf80',5.5,.65);B(25.4,2.82,1.8,25.8,2.9,2.2,'milLamp',{nosolid:true});
  B(25,2.2,3.2,26.3,2.6,3.24,'milLamp',{nosolid:true});LIGHT(25.6,2.4,3.9,'#ffcf80',6.5,.75);
  // ================= props =================
  const mc=(x,z,s,y,g)=>crate(x,z,s,y||0,g?'milCrateG':'milCrate');
  // plateau: a hay wagon, crates by the channel, plank fences
  {const x0=-38.1,x1=-36.2,z0=-14.3,z1=-10.3;B(x0,.72,z0,x1,.86,z1,'milPlank');B(x0,.86,z0,x0+.1,1.3,z1,'milPlank');B(x1-.1,.86,z0,x1,1.3,z1,'milPlank');B(x0,.86,z0,x1,1.3,z0+.1,'milPlank');
    for(const z of [z0+.6,z1-1.4])for(const x of [x0-.12,x1])B(x,0,z,x+.12,.86,z+.86,'milPost');B(x0+.9,.4,z1,x0+1.0,.5,z1+1.6,'milPost');mc(-37.6,-13.4,.75,.86);mc(-36.8,-12.6,.7,.86,1)}
  mc(-30.2,2.2,1.1);mc(-29.05,2.25,1.0);mc(-29.6,2.2,.95,1.1);mc(-30.3,3.4,1.0,0,1);mc(-28.4,3.7,.9);
  B(-38.9,0,-.62,-36.7,1.25,-.5,'milFence');B(-32.3,0,-.62,-27.3,1.25,-.5,'milFence');B(-28.1,0,-5.6,-27.98,1.25,-3.4,'milFence');
  for(const [x,z] of [[-38.9,-.56],[-36.7,-.56],[-32.3,-.56],[-29.8,-.56],[-27.3,-.56],[-28.04,-5.6],[-28.04,-3.4]])B(x-.08,0,z-.08,x+.08,1.45,z+.08,'milPost');
  // west canyon: the well and a hand pump with its trough
  B(-18.4,0,-7.3,-17,.8,-5.9,'milStone',{f:{py:'milPipe'}});B(-18.45,.8,-6.66,-18.3,2.25,-6.54,'milPost');B(-17.1,.8,-6.66,-16.95,2.25,-6.54,'milPost');B(-18.45,2.1,-6.66,-16.95,2.2,-6.54,'milPost',{nosolid:true});
  B(-18.7,2.25,-7.5,-16.7,2.36,-5.7,'milPlank',{nosolid:true});
  B(-16.5,0,-4.42,-16.3,1.05,-4.22,'metal2');B(-16.48,.8,-4.22,-16.32,.9,-3.95,'metal2',{nosolid:true});B(-16.45,1.0,-4.9,-16.35,1.08,-4.3,'metal2',{nosolid:true});
  B(-17,0,-3.9,-15.4,.5,-3.35,'milPlank',{f:{py:'milWater'}});
  mc(-14.7,11.8,1.0);mc(-15.6,12.3,.8);
  // east canyon and the wedge
  mc(-7,5.2,1.2);mc(-7,5.2,1.0,1.2);mc(-4.2,6.5,.9,0,1);mc(-.6,6.2,.9);
  mc(8,10.6,1.1);mc(8.9,11.3,.9,0,1);
  // yard: crates by the garage, by the rock spire and by the channel; drums, tyres
  mc(22.2,14,1.1,0,1);mc(23.4,14.1,1.1);mc(22.8,14,1.0,1.1,1);mc(22.1,15.3,1.0);mc(24.1,15.6,.9,0,1);
  mc(38.6,8.6,1.1,0,1);mc(38.6,9.8,1.0);mc(39.8,9.2,1.0,0,1);
  mc(16.2,22.4,1.0,0,1);mc(17.2,22.6,.9);
  drum(26.1,3.9,0,'milDrum');drum(26.7,4.25,0,'milDrumR');drum(11.6,3.6,0,'milDrum');tireStack(24.5,4,3);tireStack(25.1,4.6,2);
  // the fence along the channel edge, a gap over the steps at its east end
  for(const x of [15.7,17.7,19.7,21.7,23.7,25.7,27.7,28.95,31.05])B(x-.07,0,24.08,x+.07,1.15,24.22,'milPost');
  for(const y of [.42,.92]){B(15.7,y,24.11,28.95,y+.1,24.19,'milPost');B(31.05,y,24.11,31.5,y+.1,24.19,'milPost')}
  B(20.2,.5,24.2,21.6,1.0,24.23,'milSignA',{nosolid:true});
  // a plank gate shut in the east cliff
  B(40.38,0,-5.2,40.52,2.7,-1.2,'milFence',{f:{px:N}});B(40.25,0,-5.4,40.52,3.1,-5.15,'milPost');B(40.25,0,-1.25,40.52,3.1,-1,'milPost');B(40.25,2.9,-5.4,40.52,3.15,-1,'milPost');
  B(40.36,1.5,-3.9,40.38,2.1,-2.5,'milSignA',{nosolid:true});
  // ================= lights outside: work lamps, a yard pole, fire barrels =================
  const wlamp=(x,z,ang,h,r,i)=>{h=h||2.5;B(x-.04,0,z-.04,x+.04,h,z+.04,'metal2');for(const [dx,dz] of [[.32,0],[-.16,.28],[-.16,-.28]])B(x+dx-.03,0,z+dz-.03,x+dx+.03,.05,z+dz+.03,'metal2',{nosolid:true});
    const fx=Math.sin(ang),fz=Math.cos(ang);B(x-.2,h,z-.2,x+.2,h+.3,z+.2,'metal2',{nosolid:true});B(x+fx*.18-.16,h+.05,z+fz*.18-.16,x+fx*.18+.16,h+.25,z+fz*.18+.16,'milLampW',{nosolid:true});
    LIGHT(x+fx*.7,h-.1,z+fz*.7,'#fff0d4',r||13,i||1.0)};
  wlamp(-31.5,-7.5,2.4);wlamp(-35.6,-15.6,.8,2.4,10,.85);wlamp(-19.5,-1,1.6,2.5,12,.9);wlamp(-14.2,9,-2.2,2.5,12,.9);wlamp(-1.5,-3,-2.4);wlamp(-6.2,10.2,0,2.4,11,.85);
  wlamp(6.5,-1.5,-2.6,2.5,12,.9);wlamp(5.2,-11.5,1.6,2.6,13,.95);wlamp(36.8,-9.5,-1.0,2.6,13,.95);wlamp(39.5,20.5,-2.4,2.6,13,1.0);
  {const x=27.5,z=7.5;B(x-.12,0,z-.12,x+.12,6.4,z+.12,'milPost');B(x-.9,5.9,z-.06,x+.9,6.04,z+.06,'milPost');B(x-.04,5.5,z+.12,x+.04,5.58,z+1.0,'metal2',{nosolid:true});
    B(x-.2,5.3,z+.85,x+.2,5.5,z+1.25,'milLamp',{nosolid:true});LIGHT(x,5.1,z+1.05,'#ffc27a',17,1.05)}
  // channel lamps on brackets
  for(const [x,z] of [[2.2,9],[2.2,19],[12,25.1],[22,25.1]]){B(x-.12,-.35,z-.12,x+.12,-.15,z+.12,'milLamp',{nosolid:true});LIGHT(x,-.5,z,'#ffcf8a',7,.75)}
  for(const [x,z] of [[-27.5,-15.5],[-24.5,-9]]){B(x-.12,-.35,z-.12,x+.12,-.15,z+.12,'milLamp',{nosolid:true});LIGHT(x,-.5,z,'#ffcf8a',7,.7)}
  MAP.fires=[];for(const [x,z] of [[-9.5,19.5],[4.6,-6.6],[38.8,15.6],[-26.5,-1.5]]){drum(x,z,0,'milDrumR');LIGHT(x,1.35,z,'#ff8a3a',8,1.0);MAP.fires.push([x,.9,z])}
  // ================= spawns, camps, title camera, moon =================
  MAP.spawns=[];for(const x of [24.8,26.6,28.4,30.2])for(const z of [14.2,16.2,18.2,20.2,22.2])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.3,.3),0,Math.PI*.3+rr(-.4,.4)]);
  MAP.zspawns=[[-37,-12,0],[-30,-15.5,0],[-36,2.5,0],[-27.5,-3,0],[-36.3,12.5,-1.7],[-18,-14,0],[-17,6,0],[-12,19.5,0],[-5,-10,0],[-3.5,9,0],[6.5,-1,0],[5,-13,0],[36.5,-7,0],[2.7,18,-1.7],[39.5,22.5,0],[8,6,0]];
  MAP.camps=[
    {k:'upstairs',w:.3,p:[[12.4,UP,-11],[12.6,UP,-2.2],[25,UP,-2.2],[27,UP,-9.6],[18.2,UP,-3]],look:[18,UP,-10]},
    {k:'garRoof',w:.2,p:[[15,UP,10.6],[21,UP,10.6],[18,UP,6],[14.6,UP,3.4],[21.6,UP,3.4]],look:[25,1,18]},
    {k:'garage',w:.1,p:[[21.2,.05,3.4],[20.6,.05,11.2],[14.6,.05,9.6]],look:[17.2,1,13]},
    {k:'deck',w:.08,p:[[13.5,UP,-14.4],[27,UP,-14.4],[30,UP,-11]],look:[20,UP,-14.4]},
    {k:'kitchen',w:.07,p:[[26,FL,-11.2],[23,FL,-7]],look:[21.5,1.5,-5]},
    {k:'chanE',w:.08,p:[[2.7,-1.7,8.5],[2.7,-1.7,20],[18,-1.7,25.5]],look:[2.7,-1,0]},
    {k:'wedge',w:.05,p:[[8.6,0,9.6],[7.2,0,11.6]],look:[6,1,0]},
    {k:'culvert',w:.06,p:[[-20.8,-1.7,-20],[-21.6,-1.7,-18.6]],look:[-28,-1,-11]},
    {k:'tunnel',w:.06,p:[[-36.2,-1.7,12.5],[-37.2,-1.7,14]],look:[-36,-1,6]},
  ];
  MAP.spawnYaw=null;
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#8ea2d4'),i:.78};
  // title backdrop: a slow ellipse over the yard, looking at the lit house
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.045)*.6;cam.position.set(28.5+a*3,8.6+Math.sin(t*.07)*.5,18.5-a);cam.lookAt(18+a*2,2.6,-4)};
}
MAPDEFS.militia={n:['밀리샤','Militia'],d:['달빛 아래 붉은 협곡의 민병대 목장. 2층 목조 주택과 차고 옥상, 협곡 사이 좁은 통로, 콘크리트 배수로와 터널.','A militia ranch in a red-rock canyon under a cold moon: a two-storey wooden house, a garage roof terrace, narrow canyon passages, concrete drainage channels and a culvert tunnel.'],
  env:{sky:1,sun:0,skyTex:'milSky',rain:0,storm:0,fog:'#121a2a',fogD:.022,ambOut:'#2e3852',ambIn:'#1a1820',boAmb:.4},bounds:[-43,-27,43,28],probeY:[-1.0,.9,2.4,4.3,6.2],tex:bakeMilTex,build:buildMilitia};

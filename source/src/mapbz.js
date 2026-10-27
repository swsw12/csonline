'use strict';
// ============ Map "사막 바자르 Desert Bazaar" (v6.53): a walled desert trading town in the late afternoon, made for 대인전 and 폭파미션 ============
// x runs east, z runs south. The defenders (MAP.spawns) start in the kasbah's forecourt in the north, the attackers (MAP.zspawns) in the
// caravan camp outside the south wall. Three gates in the wall, three ways in:
//  · B main  — the west gate, then north up the carpet street to the bazaar's arch;
//  · mid     — the main gate and the main street to the well square; the spice alley leaves it west for the bazaar's side door, the
//              tannery alley east for the caravanserai's side door; the tea house's roof looks over the square and the tannery alley;
//  · A long  — the broken east gate, then north along the town wall under the palms to the caravanserai's gate.
// A is the caravanserai's courtyard (a gallery along the north side with a terrace on top, stairs up along the east wall), B the covered
// bazaar hall (four pillars, stalls, skylights, a mezzanine along the north wall). The defenders reach B by the north lane, A by the north
// road, mid by the arch street. Every texture is painted on first load.
Object.assign(MATS,{
  bzBark:{t:'bzBark',s:1,k:'wood'},// (v7.6: the palms' crown knob was drawn with a material that did not exist)
  bzSand:{t:'bzSand',s:3,cs:1,k:'soft'},bzSandF:{t:'bzSand',s:3,cs:6,k:'soft'},bzPave:{t:'bzPave',s:2,k:'stone'},bzFloor:{t:'bzFloor',s:2,k:'stone'},bzRoof:{t:'bzRoof',s:3,cs:1.5,k:'stone'},
  bzAdO:{t:'bzAdO',s:3,cs:1,k:'stone'},bzAdR:{t:'bzAdR',s:3,cs:1,k:'stone'},bzAdW:{t:'bzAdW',s:3,cs:1,k:'stone'},bzAdY:{t:'bzAdY',s:3,cs:1,k:'stone'},
  bzStone:{t:'bzStone',s:3,cs:1,k:'stone'},bzStoneD:{t:'bzStoneD',s:3,cs:1,k:'stone'},bzStoneF:{t:'bzStoneD',s:3,cs:4,k:'stone'},bzWoodD:{t:'bzWoodD',s:1.5,k:'wood'},bzBeam:{t:'bzBeam',s:2,k:'wood'},
  bzDoorB:{t:'bzDoorB',uv:'box',k:'wood'},bzDoorG:{t:'bzDoorG',uv:'box',k:'wood'},bzDoorW:{t:'bzDoorW',uv:'box',k:'wood'},bzDoorR:{t:'bzDoorR',uv:'box',k:'wood'},
  bzGate:{t:'bzGate',uv:'box',k:'wood'},bzWin:{t:'bzWin',uv:'box',k:'glass'},bzLat:{t:'bzLat',uv:'box',k:'wood'},bzRail:{t:'bzRail',uv:'box',k:'wood'},
  bzClR:{t:'bzClR',s:1.6,k:'soft'},bzClB:{t:'bzClB',s:1.6,k:'soft'},bzClG:{t:'bzClG',s:1.6,k:'soft'},bzClY:{t:'bzClY',s:1.6,k:'soft'},
  bzRug1:{t:'bzRug1',uv:'box',k:'soft'},bzRug2:{t:'bzRug2',uv:'box',k:'soft'},bzRug3:{t:'bzRug3',uv:'box',k:'soft'},
  bzTile:{t:'bzTile',s:1,k:'stone'},bzWater:{t:'bzWater',s:2,emis:.06,k:'glass'},
  bzPalm:{t:'bzPalm',uv:'box',k:'soft'},bzPalmZ:{t:'bzPalmZ',uv:'box',k:'soft'},bzPalmD:{t:'bzPalmD',uv:'box',k:'soft'},bzPalmE:{t:'bzPalmE',uv:'box',k:'soft'},
  bzFruitO:{t:'bzFruitO',uv:'box',k:'wood'},bzFruitR:{t:'bzFruitR',uv:'box',k:'wood'},bzSack:{t:'bzSack',s:1,k:'soft'},
  bzSpiceR:{t:'bzSpiceR',uv:'box',k:'soft'},bzSpiceY:{t:'bzSpiceY',uv:'box',k:'soft'},bzSpiceB:{t:'bzSpiceB',uv:'box',k:'soft'},
  bzSignA:{t:'bzSignA',uv:'box',emis:.05,k:'wood'},bzSignB:{t:'bzSignB',uv:'box',emis:.05,k:'wood'},bzSignZ:{t:'bzSignZ',uv:'box',emis:.05,k:'wood'},
  bzSignC:{t:'bzSignC',uv:'box',emis:.05,k:'wood'},bzSignT:{t:'bzSignT',uv:'box',emis:.05,k:'wood'},bzDecA:{t:'bzDecA',uv:'box',k:'stone'},bzDecB:{t:'bzDecB',uv:'box',k:'stone'},
});
// ---------- textures ----------
// wind-rippled sand, pebbles and darker grains
function texBzSand(){const N=256;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,64,4101,4),r=Math.sin(x*TAU/64+y*TAU/128+n*6)*.5+.5;
    const t=.52+(n-.5)*.42+(r-.5)*.14+(P.n(x,y,4,4102,1)-.5)*.1+(hash2(x,y,4103)-.5)*.12;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#8a6a44','#9c7a50','#ac885c','#ba9668','#c6a274','#d2ae80','#dcba8c'],.12))}
  for(let i=0;i<700;i++){const x=Math.floor(hash2(i,1,4104)*N),y=Math.floor(hash2(i,2,4104)*N);P.set(x,y,rpickH(i,['#6e5436','#7a5e3e','#e6c898','#94744e']));if(hash2(i,3,4104)<.3)P.set(x+1,y,'#5a4430',.6)}})}
// sandstone flags: courses of half a metre, slabs of different lengths, worn edges, a few cracks
function texBzPave(){const N=256;return paint(N,N,P=>{const LEN=[[64,96,96],[80,96,80],[96,64,96],[72,112,72]];
  for(let y=0;y<N;y++){const row=y>>6,ly=y&63,L=LEN[row%4],off=Math.floor(hash2(row,1,4111)*N);
    for(let x=0;x<N;x++){let u=(x+off)%N,k=0,a=0;while(u>=a+L[k%3]){a+=L[k%3];k++}const lx=u-a,id=row*7+k;
      let t=.55+(hash2(id,2,4112)-.5)*.3+(P.n(x,y,32,4113,3)-.5)*.24+(hash2(x,y,4114)-.5)*.08;
      if(ly<2||lx<2)t=.1;else if(ly<3||lx<3)t-=.12;else if(ly>60||lx>L[k%3]-3)t+=.06;
      P.set(x,y,dith(P,x,y,clamp(t,0,1),['#5e4a34','#7a6246','#8e7454','#a08462','#b09470','#bea27c','#c8ae88'],.08))}}
  for(let i=0;i<4;i++)crack(P,Math.floor(hash2(i,1,4115)*N),Math.floor(hash2(i,2,4115)*N),36,4116+i,'#5a4632','#c4aa84');
  for(let i=0;i<5;i++)stain(P,hash2(i,3,4117)*N,hash2(i,4,4117)*N,10+hash2(i,5,4117)*18,8+hash2(i,6,4117)*12,.18,4118+i)})}
// terracotta floor tiles (indoors)
function texBzFloor(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const id=(y>>5)*8+(x>>5),lx=x&31,ly=y&31;
    let t=.55+(hash2(id,1,4181)-.5)*.3+(P.n(x,y,32,4182,3)-.5)*.2+(hash2(x,y,4183)-.5)*.08;if(lx<2||ly<2)t=.1;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#3e2618','#5e3422','#74422a','#865034','#965c3c','#a66a46'],.08))}
  for(let i=0;i<4;i++)stain(P,hash2(i,1,4184)*N,hash2(i,2,4184)*N,14,10,.2,4185+i)})}
// flat roofs: mud plaster, patched, a little moss-free dust
function texBzRoof(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.5+(P.n(x,y,64,4191,4)-.5)*.4+(hash2(x,y,4192)-.5)*.1;let c=dith(P,x,y,t,['#7a6248','#8a7054','#98805e','#a88e6a','#b49a76'],.1);
    const m=P.n(x,y,32,4193,3);if(m>.63)c=mix(c,'#6a5640',.5);P.set(x,y,c)}
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,1,4194)*N),Math.floor(hash2(i,2,4194)*N),50,4195+i,'#5a4836','#b8a07c')})}
// lime-plastered mud walls in a colour, the plaster fallen off here and there showing the bricks, rain streaks
function texBzAdobe(base,seed){const N=256;return paint(N,N,P=>{const cols=[dk(base,.3),dk(base,.18),dk(base,.08),base,lt(base,.08),lt(base,.16)];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,64,seed,4),m=P.n(x,y,32,seed+1,3);let t=.55+(n-.5)*.34+(P.n(x,y,8,seed+2,2)-.5)*.14+(hash2(x,y,seed+3)-.5)*.08;
    let c=dith(P,x,y,clamp(t,0,1),cols,.08);
    if(m>.67){const row=Math.floor(y/12),sh=(row%2)*14,bx=Math.floor((x+sh)/28),ry=y%12,rx=(x+sh)%28;
      c=(ry<2||rx<2)?dith(P,x,y,.4,['#4a3826','#5a4430','#6a5038'],.1):dith(P,x,y,.5+(hash2(bx,row,seed+4)-.5)*.4,['#6e5034','#7e5e3e','#8e6c48','#9c7a52'],.1);
      if(m<.69)c=dk(base,.4)}
    P.set(x,y,c)}
  for(let i=0;i<12;i++)streak(P,Math.floor(hash2(i,1,seed+5)*N),Math.floor(hash2(i,2,seed+5)*N),40+Math.floor(hash2(i,3,seed+5)*90),.1,2);
  for(let i=0;i<2;i++)crack(P,Math.floor(hash2(i,1,seed+6)*N),Math.floor(hash2(i,2,seed+6)*N),40,seed+7+i,dk(base,.42),lt(base,.1))})}
// dressed sandstone: courses of 25 cm, blocks of half a metre, chisel-dressed faces
function texBzStone(base,seed){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/32),off=Math.floor(hash2(row,1,seed)*64),ry=y%32;
    for(let x=0;x<N;x++){const xx=(x+off)%N,bx=Math.floor(xx/64),rx=xx%64,id=row*5+bx;let c;
      if(ry<2||rx<2)c=dith(P,x,y,.4,[dk(base,.5),dk(base,.4),dk(base,.32)],.1);
      else{const t=.55+(hash2(id,2,seed)-.5)*.3+(P.n(x,y,32,seed+1,3)-.5)*.25+(hash2(x,y,seed+2)-.5)*.1+((x+y*3)%5===0?.04:0);c=dith(P,x,y,clamp(t,0,1),[dk(base,.26),dk(base,.13),base,lt(base,.08),lt(base,.16)],.08);if(ry===2||rx===2)c=lt(c,.1)}
      P.set(x,y,c)}}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,seed+3)*N),Math.floor(hash2(i,2,seed+3)*N),30+Math.floor(hash2(i,3,seed+3)*80),.1,2)})}
// weathered planks (beams, lintels, stalls), ceiling boards
function texBzWood(seed,base){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const pl=Math.floor(x/16),px=x%16;let t=.5+(hash2(pl,1,seed)-.5)*.3+(P.n(x*4,y,32,seed+1,3)-.5)*.3+(hash2(x,y,seed+2)-.5)*.06;if(px<1)t-=.35;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),[dk(base,.45),dk(base,.3),dk(base,.15),base,lt(base,.1)],.1))}})}
// a painted plank door: frame, boards, iron studs, brass rings, paint worn back to the wood
function texBzDoor(col,seed){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c;const fr=x<8||x>=120||y<8;
    if(fr)c=dith(P,x,y,.5+(hash2(x,y,seed)-.5)*.3,['#2e2216','#3e2e1e','#4e3a26'],.1);
    else{const pl=Math.floor((x-8)/14);c=dith(P,x,y,clamp(.55+(hash2(pl,1,seed+1)-.5)*.2+(P.n(x,y,32,seed+2,2)-.5)*.22,0,1),[dk(col,.35),dk(col,.2),col,lt(col,.1)],.1);
      if((x-8)%14<1)c=dk(col,.45);if(Math.abs(x-64)<2)c=dk(col,.55);if(P.n(x,y,32,seed+3,3)>.65)c=dith(P,x,y,.5+(hash2(x,y,seed+4)-.5)*.3,['#5a4432','#6a5038','#7a5c42'],.1);
      if((y-24)%44<5&&(x-8)%14>4&&(x-8)%14<9)c='#2a2826'}
    if(Math.hypot(x-54,y-136)<5&&Math.hypot(x-54,y-136)>2.5||Math.hypot(x-74,y-136)<5&&Math.hypot(x-74,y-136)>2.5)c='#c8a040';
    P.set(x,y,c)}})}
// the kasbah's great gate: heavy planks, iron straps and rows of nails, a wicket door
function texBzGate(){return paint(256,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<256;x++){let c;const pl=Math.floor(x/18);
    c=dith(P,x,y,clamp(.5+(hash2(pl,1,4231)-.5)*.25+(P.n(x,y,32,4232,3)-.5)*.3,0,1),['#2a1c12','#36261a','#443222','#523e2a'],.1);if(x%18<1)c='#1a120c';
    if(Math.abs(y-60)<7||Math.abs(y-196)<7){c=(Math.abs(y-60)<2||Math.abs(y-196)<2)?'#5a5650':'#3a3834';if((x%12)<3&&Math.abs((y>128?196:60)-y)<3)c='#7a766e'}
    if(x>=100&&x<156&&y>=110&&y<230&&(x===100||x===155||y===110))c='#140e0a';if(Math.abs(x-128)<3)c='#140e0a';
    if(x<6||x>249||y<6)c='#4a4640';P.set(x,y,c)}})}
// a small window: wooden frame, an iron grille over the dark inside
function texBzWin(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c;const fr=x<5||x>58||y<5||y>58;
    if(fr)c=dith(P,x,y,.5+(hash2(x,y,4161)-.5)*.3,['#3a2a1c','#4a3624','#5a422c'],.1);else{c=mix('#0e0c0a','#26201a',y/64);if((x-5)%13<2||(y-5)%13<2)c='#5a5650'}
    P.set(x,y,c)}})}
// a carved wooden screen (cut out: the holes let the light through)
function texBzLat(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const cx=(x%16)-7.5,cy=(y%16)-7.5,d=Math.hypot(cx,cy);
    if(x<4||x>59||y<4||y>59||d>5.5&&d<8||Math.abs(cx)<1.2||Math.abs(cy)<1.2)P.set(x,y,dith(P,x,y,.5+(hash2(x,y,4241)-.5)*.3,['#3a2818','#4a3420','#5a402a'],.1));else P.alpha(x,y,0)}})}
// a balustrade: rail on top, a bottom rail, turned balusters (cut out)
function texBzRail(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){const lx=x%16,w=y>12&&y<52?(Math.abs(lx-8)<2+Math.sin((y-12)/40*Math.PI*3)*.8?1:0):1;
    if(y<8||y>56||w)P.set(x,y,dith(P,x,y,.5+(hash2(x,y,4251)-.5)*.3,['#3e2a1a','#4e3622','#5e422c'],.1));else P.alpha(x,y,0)}})}
// awning cloth: wide stripes, sagging folds, a darker hem
function texBzCloth(c1,c2,seed){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const s=Math.floor(x/16)%2?c2:c1,w=Math.sin(y*.2+P.n(x,y,32,seed,2)*6)*.5+.5;
    let c=dith(P,x,y,clamp(.45+w*.25+(hash2(x,y,seed+1)-.5)*.08,0,1),[dk(s,.3),dk(s,.15),s,lt(s,.08)],.1);if(y>118)c=dk(s,.28);P.set(x,y,c)}})}
// a carpet: fringe, a zigzag border, a medallion field
function texBzRug(seed,pal){return paint(128,256,P=>{const [bg,bd,fg,ac]=pal;for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c;
    if(y<6||y>249)c=(x%4<2)?'#d8ccb0':'#b0a488';
    else{const ex=Math.min(x,127-x),ey=Math.min(y-6,249-y);
      if(ex<14||ey<14)c=(ex<4||ey<4)?fg:((Math.floor((x+y)/6)%2)?bd:ac);
      else{const d=Math.abs(x-64)/50+Math.abs(y-128)/100;c=d<.35?(d<.15?ac:fg):(d<.42?bd:bg);if(((x+Math.floor(y/2))%16<2)&&d>=.42)c=dk(bg,.18)}}
    if(hash2(x,y,seed)<.08)c=dk(c,.12);P.set(x,y,c)}})}
// glazed tiles: a blue and white star pattern
function texBzTile(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const cx=(x%32)-15.5,cy=(y%32)-15.5,d=Math.abs(cx)+Math.abs(cy);
    let c=d<9?'#1e5a8a':d<12?'#e8e4d8':(Math.abs(cx)<2||Math.abs(cy)<2)?'#2a7a6a':'#d8d0bc';if(x%32===0||y%32===0)c='#8a8270';if(hash2(x,y,4171)<.06)c=dk(c,.12);P.set(x,y,c)}})}
function texBzWater(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=P.n(x,y,32,4261,3),w=Math.sin((x+n*30)*.25)*.5+.5;
    P.set(x,y,dith(P,x,y,.35+w*.3+(n-.5)*.3,['#14302e','#1c403c','#28524a','#3a685c','#5a8a78'],.1))}})}
// a palm frond, cut out: along u (0), along v (1), corner to corner (2), the other diagonal (3); widest in the middle, leaflets off the rib
function texBzPalm(dir){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let u,v;
    if(dir===0){u=x/127;v=(y-63.5)/64}else if(dir===1){u=y/127;v=(x-63.5)/64}else if(dir===2){u=(x+y)/254;v=(x-y)/128}else{u=(x+127-y)/254;v=(x-127+y)/128}
    const w=Math.sin(u*Math.PI)*.95,av=Math.abs(v);if(av>w||u<.02||u>.98){P.alpha(x,y,0);continue}
    if(av>.06&&((u*38+av*12)%1)<.3){P.alpha(x,y,0);continue}
    let c=dith(P,x,y,clamp(.5+(1-av/Math.max(w,.01))*.25+(hash2(x,y,4271+dir)-.5)*.15,0,1),['#2a4418','#3a5820','#4a6c28','#62843a','#82984a'],.1);if(av<.05)c='#9a8a4a';
    if(u>.84||u<.16)c=mix(c,'#a08a4a',.35);P.set(x,y,c)}})}
// a palm trunk (round prop): the stubs of old fronds in overlapping rows
function texBzBark(){return paint(64,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<64;x++){const r=Math.floor(y/10),lx=(x+(r%2)*8)%16,ly=y%10,d=Math.abs(lx-8)/8+ly/10;
    let t=.5+(1-d)*.3+(hash2(x,y,4201)-.5)*.15;if(ly<1)t-=.3;P.set(x,y,dith(P,x,y,clamp(t,0,1),['#2a2014','#3a2c1c','#4a3824','#5a462e','#6a5438'],.1))}})}
// clay pots (round props): terracotta with darker bands
function texBzPot(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,4211,2)-.5)*.25+(hash2(x,y,4212)-.5)*.1,0,1),['#6a3420','#8a4428','#a05430','#b4643a','#c27444'],.1);
    if(y%22<3)c=dk(c,.3);P.set(x,y,c)}})}
// a black plastic water tank on a roof (round prop): moulded ribs, dust
function texBzTank(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,clamp(.5+(P.n(x,y,16,4281,2)-.5)*.3+(y%16<2?-.2:0),0,1),['#141414','#1e1e1e','#2a2a28','#38362f'],.1);
    if(P.n(x,y,8,4282,2)>.7)c=mix(c,'#8a7a5a',.35);P.set(x,y,c)}})}
// crates of fruit seen from above, a burlap sack, spice heaped in an open sack
function texBzFruit(c,seed){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const fx=x%11-5,fy=(y+Math.floor(x/11)*5)%11-5,d=Math.hypot(fx,fy);
    let col=d<4.6?(d<2?lt(c,.25):d<3.6?c:dk(c,.25)):'#2a1c12';if(x<3||x>60||y<3||y>60)col='#6a4a2c';if(hash2(x,y,seed)<.05)col=dk(col,.15);P.set(x,y,col)}})}
function texBzSack(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){P.set(x,y,dith(P,x,y,clamp(.55+((x+y)%3===0?.08:0)+(P.n(x,y,16,4221,2)-.5)*.3+(hash2(x,y,4222)-.5)*.1,0,1),['#5a4a32','#6e5c40','#82704e','#96845e'],.1))}})}
function texBzSpice(c,seed){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const d=Math.hypot(x-31.5,y-31.5)/32;
    P.set(x,y,d>.86?'#82704e':dith(P,x,y,clamp(.5+(1-d)*.3+(hash2(x,y,seed)-.5)*.3,0,1),[dk(c,.3),dk(c,.12),c,lt(c,.15)],.12))}})}
// the sky: dusty blue, a warm haze low down, the sun low in the west-south-west, thin high cloud, mesas and dunes on the horizon
function texBzSky(){return paint(1024,256,P=>{const SU=.1224,SV=154;
  const ridge=(x,s)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=3<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  for(let x=0;x<1024;x++){const u=x/1024,r=ridge(x,4301),mh=r>.52?15+(r-.52)*28:r>.47?(r-.47)/.05*15:0,mesa=232-mh*(.6+.4*Math.sin(u*TAU*3+1.3)),dune=232-(3+ridge((x+411)%1024,4311)*9);
    for(let y=0;y<256;y++){const t=y/232;let du=Math.abs(u-SU);du=Math.min(du,1-du);
      let c=mix('#3a6aa2','#a4bed4',Math.pow(clamp(t,0,1),1.4));c=mix(c,'#e8d6b6',clamp((t-.76)*3.2,0,1));
      const sy=(y-SV)/256;c=mix(c,'#fff2d0',Math.exp(-(du*du*700+sy*sy*30))*.62);c=mix(c,'#ffe6b0',Math.exp(-(du*du*60+sy*sy*6))*.18);
      const band=clamp(1-Math.abs(y-70)/50,0,1);if(band>0){const cv=fbm(x/256,y/12,4321,4,4),k=clamp((cv-.56)*3,0,1)*band*.5;if(k>0)c=mix(c,'#f4efe6',k)}
      if(y>=mesa&&mesa<232)c=mix(mix('#b08a6a','#987258',clamp((y-mesa)/18,0,1)),'#e2caa8',.38);
      if(y>=dune)c=mix('#d6b686','#c2a070',clamp((y-dune)/12,0,1));
      if(y>235)c=mix('#c8a676','#b6946a',clamp((y-235)/20,0,1));
      P.set(x,y,c)}}})}
function bakeBzTex(){if(TEX.bzSand)return;
  TEX.bzSand=mkTex(texBzSand());TEX.bzPave=mkTex(texBzPave());TEX.bzFloor=mkTex(texBzFloor());TEX.bzRoof=mkTex(texBzRoof());
  TEX.bzAdO=mkTex(texBzAdobe('#c49a68',4401));TEX.bzAdR=mkTex(texBzAdobe('#b87a58',4411));TEX.bzAdW=mkTex(texBzAdobe('#d6cebc',4421));TEX.bzAdY=mkTex(texBzAdobe('#d0b07a',4431));
  TEX.bzStone=mkTex(texBzStone('#bc9e74',4441));TEX.bzStoneD=mkTex(texBzStone('#9c8060',4451));TEX.bzWoodD=mkTex(texBzWood(4461,'#5a4630'));TEX.bzBeam=mkTex(texBzWood(4471,'#6a5236'));
  TEX.bzDoorB=mkTex(texBzDoor('#2a5a8a',4481),false);TEX.bzDoorG=mkTex(texBzDoor('#3a6a4a',4491),false);TEX.bzDoorW=mkTex(texBzDoor('#7a5a3a',4501),false);TEX.bzDoorR=mkTex(texBzDoor('#8a3a2a',4511),false);
  TEX.bzGate=mkTex(texBzGate(),false);TEX.bzWin=mkTex(texBzWin(),false);TEX.bzLat=mkTex(texBzLat(),false);TEX.bzRail=mkTex(texBzRail(),false);
  TEX.bzClR=mkTex(texBzCloth('#a8322a','#e2d6bc',4521));TEX.bzClB=mkTex(texBzCloth('#2a5a8a','#e2d6bc',4531));TEX.bzClG=mkTex(texBzCloth('#3a6a3a','#e0d2b0',4541));TEX.bzClY=mkTex(texBzCloth('#c89a2a','#8a3a2a',4551));
  TEX.bzRug1=mkTex(texBzRug(4561,['#8a2a22','#e2d6bc','#1e2a4a','#c89a3a']),false);TEX.bzRug2=mkTex(texBzRug(4571,['#1e3a5a','#c8b48a','#8a2a22','#e2d6bc']),false);TEX.bzRug3=mkTex(texBzRug(4581,['#3a4a2a','#d8c8a0','#6a2a1e','#c8a050']),false);
  TEX.bzTile=mkTex(texBzTile());TEX.bzWater=mkTex(texBzWater());
  TEX.bzPalm=mkTex(texBzPalm(0),false);TEX.bzPalmZ=mkTex(texBzPalm(1),false);TEX.bzPalmD=mkTex(texBzPalm(2),false);TEX.bzPalmE=mkTex(texBzPalm(3),false);
  TEX.bzBark=mkTex(texBzBark());TEX.bzPot=mkTex(texBzPot());TEX.bzTank=mkTex(texBzTank());
  TEX.bzFruitO=mkTex(texBzFruit('#e08a24',4591),false);TEX.bzFruitR=mkTex(texBzFruit('#b8322a',4601),false);TEX.bzSack=mkTex(texBzSack());
  TEX.bzSpiceR=mkTex(texBzSpice('#b8401e',4611),false);TEX.bzSpiceY=mkTex(texBzSpice('#d8a020',4621),false);TEX.bzSpiceB=mkTex(texBzSpice('#6a4a2a',4631),false);
  TEX.bzSignA=mkTex(texPtSign(128,128,'A','','#5a3c22','#f0e2c4',96),false);TEX.bzSignB=mkTex(texPtSign(128,128,'B','','#5a3c22','#f0e2c4',96),false);
  TEX.bzSignZ=mkTex(texPtSign(512,96,'BAZAAR','바자르 · 향신료 · 양탄자','#6a2a1e','#f0e2c4',52),false);TEX.bzSignC=mkTex(texPtSign(512,96,'CARAVANSERAI','대상 숙소','#2a4a5a','#f0e2c4',46),false);
  TEX.bzSignT=mkTex(texPtSign(256,96,'찻집','TEA HOUSE','#2a5a4a','#f0e2c4',50),false);
  TEX.bzDecA=mkTex(texPtDec('A'),false);TEX.bzDecB=mkTex(texPtDec('B'),false);
  TEX.bzSky=mkTex(texBzSky());TEX.bzSky.wrapT=THREE.ClampToEdgeWrapping;TEX.bzSky.magFilter=THREE.LinearFilter;
  if(!TEX.sunDisc){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['bzSand','bzPave','bzFloor'])TEX[k].anisotropy=an}

// ---------- the map ----------
function buildBazaar(){const CV={nosolid:true},WALLS=['bzAdO','bzAdR','bzAdW','bzAdY','bzAdO','bzAdW'],CLS=['bzClR','bzClB','bzClG','bzClY'],SIDE={f:{ny:'none'}};
  // a slab on a building face: f 'n' (−z) 's' (+z) 'w' (−x) 'e' (+x), centred at c along the face whose plane is fp, d out from it
  const face=(f,c,fp,w,y0,y1,d,m,o)=>{const sg=f==='n'||f==='w'?-1:1;if(f==='n'||f==='s')return B(c-w/2,y0,fp,c+w/2,y1,fp+sg*d,m,o);return B(fp,y0,c-w/2,fp+sg*d,y1,c+w/2,m,o)};
  const win=(f,c,fp,y,sd)=>{face(f,c,fp,.9,y,y+1.15,.05,'bzWin',CV);face(f,c,fp,1.2,y+1.15,y+1.3,.1,'bzWoodD',CV);
    if(hash2(sd,1,9)<.3)face(f,c,fp,1.4,y+1.45,y+1.55,.8,CLS[Math.floor(hash2(sd,2,9)*4)],CV)};
  const door=(f,c,fp,sd)=>{face(f,c,fp,1.3,0,2.3,.06,['bzDoorB','bzDoorG','bzDoorW','bzDoorR'][Math.floor(hash2(sd,3,9)*4)],CV);face(f,c,fp,1.6,2.3,2.45,.1,'bzWoodD',CV)};
  // a black water tank on a roof, sometimes an aerial
  const tank=(x,z,y,sd)=>{B(x-.55,y,z-.55,x+.55,y+.18,z+.55,'metal2',CV);MAP.deco.push({k:'drum',x,y:y+.18,z,r:.5,h:1.15,mat:'bzTank',rot:hash2(sd,1,3)*TAU});
    if(hash2(sd,2,3)<.35){B(x+.8,y,z-.04,x+.88,y+2.6,z+.04,'metal2',CV);B(x+.3,y+2.2,z-.03,x+1.4,y+2.26,z+.03,'metal2',CV)}};
  // a house: solid, a flat roof with a parapet and something on it, windows and doors on the faces listed in fc
  const house=(x0,z0,x1,z1,h,m,fc,sd,o)=>{o=o||{};B(x0,0,z0,x1,h,z1,m,{f:{py:'bzRoof',ny:'none'}});const p=.25,ph=.6;
    B(x0,h,z0,x1,h+ph,z0+p,m,CV);B(x0,h,z1-p,x1,h+ph,z1,m,CV);B(x0,h,z0+p,x0+p,h+ph,z1-p,m,CV);B(x1-p,h,z0+p,x1,h+ph,z1-p,m,CV);
    if(hash2(sd,5,1)<.6&&x1-x0>2.6&&z1-z0>2.6)tank(lerp(x0+1.2,x1-1.2,hash2(sd,6,1)),lerp(z0+1.2,z1-1.2,hash2(sd,7,1)),h,sd);
    for(const f of fc){const al=f==='n'||f==='s',u0=al?x0:z0,u1=al?x1:z1,L=u1-u0,n=Math.max(1,Math.floor(L/3.1)),fp=f==='n'?z0:f==='s'?z1:f==='w'?x0:x1,cc=f.charCodeAt(0);
      for(let k=0;k<n;k++){const c=u0+(k+.5)*L/n,r=hash2(sd,k,cc);if(L<1.6)continue;
        if(r<.26&&!o.nodoor)door(f,c,fp,sd+k);else if(r<.86)win(f,c,fp,1.25,sd+k);
        if(h>=5.4&&hash2(sd,k+20,cc)<.8)win(f,c,fp,h-2.55,sd+k+50)}}};
  // a block of houses filling a rectangle, split along its long side; the listed faces of the block are the street faces
  const blk=(x0,z0,x1,z1,fc,o)=>{o=o||{};const ax=(x1-x0)>=(z1-z0),L0=ax?x0:z0,L1=ax?x1:z1,sd=o.seed||Math.round(Math.abs(x0*31+z0*17)+7000),H=o.h||[4.6,7.6];let a=L0,i=0;
    while(a<L1-.01){let w=4+hash2(i,1,sd)*4;if(L1-a<w+2.5)w=L1-a;const a1=a+w,hh=Math.round((H[0]+hash2(i,2,sd)*(H[1]-H[0]))*2)/2,m=(o.mats||WALLS)[Math.floor(hash2(i,3,sd)*(o.mats||WALLS).length)];
      const hx0=ax?a:x0,hx1=ax?a1:x1,hz0=ax?z0:a,hz1=ax?z1:a1;let f='';for(const q of fc)if(q==='n'&&hz0===z0||q==='s'&&hz1===z1||q==='w'&&hx0===x0||q==='e'&&hx1===x1)f+=q;
      house(hx0,hz0,hx1,hz1,hh,m,f,sd+i*13,o);a=a1;i++}};
  // a stepped arch over an opening: the corners of the top filled in two steps (axis of the wall: 'x' or 'z')
  const arch=(ax,u0,u1,w0,w1,top,m)=>{const S=(a,b,y0,y1)=>ax==='x'?B(a,y0,w0,b,y1,w1,m):B(w0,y0,a,w1,y1,b,m);S(u0,u0+.9,top-.75,top);S(u1-.9,u1,top-.75,top);S(u0,u0+.4,top-1.4,top-.75);S(u1-.4,u1,top-1.4,top-.75)};
  // a date palm: a round trunk, a crown of fronds drooping in eight directions (not solid), a solid core for the trunk
  const palm=(x,z,h,sd)=>{MAP.deco.push({k:'drum',x,y:0,z,r:.21,h,mat:'bzBark',rot:hash2(sd,1,4)*TAU});B(x-.2,0,z-.2,x+.2,h,z+.2,'metalx');
    const t=h,FO={nosolid:true,f:{px:'none',nx:'none',pz:'none',nz:'none'}};B(x-.35,t-.2,z-.35,x+.35,t+.25,z+.35,'bzBark',CV);
    for(const s of [-1,1]){B(x+s*.2,t,z-.45,x+s*1.6,t+.04,z+.45,'bzPalm',FO);B(x+s*1.5,t-.5,z-.4,x+s*2.9,t-.46,z+.4,'bzPalm',FO);
      B(x-.45,t+.02,z+s*.2,x+.45,t+.06,z+s*1.6,'bzPalmZ',FO);B(x-.4,t-.48,z+s*1.5,x+.4,t-.44,z+s*2.9,'bzPalmZ',FO)}
    for(const [sx,sz] of [[1,1],[-1,-1]])B(x+sx*.15,t-.18,z+sz*.15,x+sx*1.7,t-.14,z+sz*1.7,'bzPalmD',FO);
    for(const [sx,sz] of [[1,-1],[-1,1]])B(x+sx*.15,t-.24,z+sz*.15,x+sx*1.7,t-.2,z+sz*1.7,'bzPalmE',FO)};
  // a market stall: a counter (solid, waist high), four posts, a striped canopy, goods on the counter (not solid)
  const stall=(x0,z0,x1,z1,cl,goods)=>{B(x0,0,z0,x1,1,z1,'bzWoodD');for(const x of [x0,x1-.12])for(const z of [z0,z1-.12])B(x,1,z,x+.12,2.5,z+.12,'bzWoodD',CV);
    B(x0-.3,2.5,z0-.3,x1+.3,2.58,z1+.3,cl,CV);const n=Math.max(1,Math.floor((x1-x0)/.8));
    for(let i=0;i<n;i++){const gx=x0+(i+.5)*(x1-x0)/n,g=goods[i%goods.length];if(g==='s')B(gx-.3,1,z0+.1,gx+.3,1.32,z1-.1,'bzSack',{nosolid:true,f:{py:['bzSpiceR','bzSpiceY','bzSpiceB'][i%3]}});
      else B(gx-.32,1,z0+.1,gx+.32,1.2,z1-.1,'bzWoodD',{nosolid:true,f:{py:g==='o'?'bzFruitO':'bzFruitR'}})}};
  const sacks=(x0,z0,x1,z1,h)=>B(x0,0,z0,x1,h||.8,z1,'bzSack',{f:{py:'bzSack'}});
  const pot=(x,z,r,h,y)=>{MAP.deco.push({k:'drum',x,y:y||0,z,r,h,mat:'bzPot',rot:hash2(Math.round(x*10),Math.round(z*10),6)*TAU});B(x-r*.7,y||0,z-r*.7,x+r*.7,(y||0)+h,z+r*.7,'metalx')};
  const lantern=(x,y,z,r,k)=>{B(x-.01,y,z-.01,x+.01,y+.6,z+.01,'metal2',CV);B(x-.14,y-.32,z-.14,x+.14,y,z+.14,'lampO',CV);LIGHT(x,y-.5,z,'#ffb866',r||8,k||.8)};

  // ================= the ground: sand outside, sandstone flags in the town, tiles indoors =================
  {const R=[[-41,-35,41,-24,'bzPave'],[-41,-32,-12,-26,'bzPave'],[-3,-24,3,26,'bzPave'],[-10,-8,10,8,'bzPave'],[-18,-19,-10,1,'bzPave'],[-22,-19,-18,-15,'bzPave'],
      [10,-15,22,0,'bzPave'],[-41,-26,-22,-8,'bzFloor'],[22,-30,41,-6,'bzPave'],[-41,-8,-26,26,'bzPave'],[22,-6,41,4,'bzPave'],[10,-8,16,-3,'bzFloor']];
    const xs=new Set([-46,46]),zs=new Set([-48,40]);for(const r of R){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}
    const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m='bzSand';for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
        if(run&&run.m===m)run.x1=X[i+1];else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}
      if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}}

  // ================= the town wall: west, east and south (three gates); outside it the camp, dunes beyond =================
  {const W='bzStoneD',H=8;
    B(-44,0,-46,-41,H,28,W,SIDE);B(41,0,-46,44,H,28,W,SIDE);
    for(let z=-44;z<28;z+=2.4){B(-44,H,z,-42.8,H+.8,z+1.2,W,CV);B(42.8,H,z,44,H+.8,z+1.2,W,CV)}
    // south wall z 26–28: the B gate (x −36 to −29), the main gate (−2.5 to 2.5), the broken A gate (35 to 41)
    wallX(-41,41,26,28,0,6,W,[[-36,-29,0,4.8],[-2.5,2.5,0,4.6],[35,41,0,6]]);
    B(-38,0,25.6,-36,7.2,28.4,W);B(-29,0,25.6,-27,7.2,28.4,W);arch('x',-36,-29,26,28,4.8,W);
    B(-4.5,0,25.4,-2.5,7.6,28.6,W);B(2.5,0,25.4,4.5,7.6,28.6,W);arch('x',-2.5,2.5,26,28,4.6,W);B(-4.6,7.6,25.3,4.6,8.1,28.7,W);
    for(let x=-41;x<41;x+=2.4)if(!(x>-38.5&&x<-26.5)&&!(x>-5&&x<5)&&!(x>34&&x<41))B(x,6,26.2,x+1.2,6.7,27.8,W,CV);
    // the broken gate: the wall's end in rubble, fallen blocks
    B(33,0,25.8,35,4.2,28.2,W);B(33.4,4.2,26,34.6,5.2,28,W,CV);B(35,0,26.3,36.6,1.1,27.9,W);B(35.6,1.1,26.6,36.2,1.6,27.4,W,CV);B(39.4,0,26.4,41,.8,28.4,W);B(37.2,0,29,38.4,.6,30.2,W)}
  // the caravan camp: tents, an old truck, a well-cart, crates and sacks
  {const tentB=(x0,z0,x1,z1,cl)=>{for(const x of [x0,x1-.14])for(const z of [z0,z1-.14])B(x,0,z,x+.14,2.4,z+.14,'bzWoodD');B(x0-.3,2.4,z0-.3,x1+.3,2.5,z1+.3,cl,CV);
      B(x0-.3,1.9,z0-.3,x0-.24,2.4,z1+.3,cl,CV);B(x1+.24,1.9,z0-.3,x1+.3,2.4,z1+.3,cl,CV)};
    tentB(-24,30.5,-19,34.5,'bzClY');tentB(21.4,30.5,26.4,34.5,'bzClR');tentB(-12,34.8,-7,37.6,'bzClB');
    B(-23,0,31.5,-21,.04,33.5,'bzRug1',CV);B(22.4,0,31.5,25,.04,33.4,'bzRug3',CV);
    // the truck (cab to the east): body, cab, glass, a load of sacks under a tarp
    B(11.6,.5,33.2,17.2,1.4,35.6,'bzWoodD');B(17.2,.5,33.2,19.6,2.4,35.6,'paintY');B(17.6,1.5,33.15,19.2,2.3,35.65,'carGl',{f:{py:'paintY'}});
    for(const x of [12.6,18.2])for(const z of [33,35.4])B(x,0,z-.12,x+.9,.9,z+.32,'tire');B(11.8,1.4,33.4,16.8,2.3,35.4,'bzClG');
    sacks(-30,31,-27.6,32.4,.9);crate(-26.4,31.2,1.1);crate(29.2,31,1.2);crate(30.4,31,1.2);crate(29.8,31,1.1,1.2);
    pot(-15,30.4,.35,.9);pot(-14.2,30.8,.3,.8);pot(14,30.3,.35,.9);drum(-4.6,36.6);drum(4.4,36.6,0,'drumR');
    for(const [x,z,h] of [[-31,36,6.4],[30,36.4,7]])palm(x,z,h,Math.round(x*7+z))}
  // dunes south of the camp and round the corners (steps of sand), rock outcrops
  {const SF={f:{ny:'none'}};
    for(let i=0;i<4;i++){const z0=38+i*1.6,h=1.2+i*1.3;B(-46,0,z0,46,h,z0+1.6,i<3?'bzSand':'bzSandF',SF)}
    B(-46,0,28,-41,4.6,38,'bzStoneD',SF);B(41,0,28,46,4.2,38,'bzStoneD',SF);B(-46,4.6,28,-43,6,36,'bzSand',SF);B(43,4.2,28,46,5.6,36,'bzSand',SF);
    B(-41,0,36.4,-37,3.4,38,'bzStoneD');B(37.5,0,36,41,2.8,38,'bzStoneD')}

  // ================= the north: the kasbah (the defenders' start), the houses either side =================
  {const W='bzStone';
    B(-14,0,-46,14,10,-35,W,{f:{ny:'none'}});for(let x=-14;x<14;x+=1.6)B(x,10,-35.4,x+.8,10.9,-35,W,CV);
    for(const [x0,z1] of [[-17,-32],[12,-35]]){B(x0,0,-40,x0+5,12.5,z1,W,{f:{ny:'none'}});for(const [a,b] of [[0,.8],[2.1,2.9],[4.2,5]])B(x0+a,12.5,z1-.4,x0+b,13.4,z1,W,CV);
      for(const y of [3,6.5,9.5])B(x0+2.1,y,z1,x0+2.9,y+1.1,z1+.05,'bzLat',CV)}
    B(-3.2,0,-35.1,3.2,5.2,-35,'bzGate',CV);B(-3.6,5.2,-35.3,3.6,5.6,-35,'bzStoneD',CV);arch('x',-3.2,3.2,-35.3,-35,5.6,'bzStoneD');
    for(const x of [-10,-6.5,6.5,10])B(x-.4,4.5,-35.06,x+.4,5.8,-35,'bzLat',CV);for(const x of [-8.6,8.6])B(x-.7,7,-35.06,x+.7,8.6,-35,'bzLat',CV);
    for(const x of [-12,11])B(x,6,-35.1,x+1,9.6,-35.04,'bzClR',CV);
    // the forecourt: a tiled fountain, benches, two palms, lanterns by the gate
    B(-1.6,0,-30.6,1.6,.55,-27.4,'bzTile',{f:{py:'bzWater'}});B(-.3,.55,-29.3,.3,2.4,-28.7,'bzStone');B(-.5,2.4,-29.5,.5,2.6,-28.5,'bzStone');B(-.12,2.6,-29.12,.12,2.9,-28.88,'bzTile',CV);
    B(-11.6,0,-27,-9.6,.45,-26.4,'bzWoodD');B(9.6,0,-27,11.6,.45,-26.4,'bzWoodD');palm(-9.6,-33.2,6.6,41);palm(9.4,-33.4,7,43);
    lantern(-4.4,3.8,-34.6,9,.7);lantern(4.4,3.8,-34.6,9,.7);
    blk(-41,-46,-14,-32,'s',{seed:7101,h:[6,8.5]});blk(14,-46,41,-35,'s',{seed:7111,h:[6,8.5]})}
  // the north road (to A's north gate) and the north lane (to B's north door): a cart, sacks, barrels
  sacks(19,-34.6,21.4,-33.2,.9);drum(24.6,-34.4);drum(25.2,-33.8,0,'drumR');crate(36.6,-33.6,1.2);crate(37.8,-33.6,1.2);crate(37.2,-33.6,1.1,1.2);
  B(-21,.5,-31.6,-17.6,1.2,-30.2,'bzWoodD');for(const x of [-20.6,-18.2])B(x,0,-31.8,x+.6,.9,-31.6,'bzWoodD');B(-17.6,.9,-31.2,-15.6,1,-30.6,'bzWoodD',CV);
  drum(-36.6,-31.2);drum(-37.2,-30.6,0,'drumR');pot(-33,-31.4,.35,.9);pot(-32.2,-31.5,.3,.75);
  B(-15.4,2,-32,-13.8,3.6,-31.94,'bzSignB',CV);B(13,2,-35,14.6,3.6,-34.94,'bzSignA',CV);

  // ================= B: the bazaar hall =================
  {const W='bzStone',H=6.5;
    wallX(-41,-22,-8.6,-8,0,H,W,[[-34,-28,0,4.4]]);arch('x',-34,-28,-8.6,-8,4.4,W);
    wallX(-41,-22,-26,-25.4,0,H,W,[[-24.6,-22.6,0,3]]);wallZ(-22.6,-22,-25.4,-8.6,0,H,W,[[-18.5,-15.5,0,3]]);
    slab(-41,-26,-22,-8,H,H+.4,'bzRoof',[[-32.6,-23.4,-30.2,-21],[-32.6,-13,-30.2,-10.6],[-26.2,-18.2,-24.2,-16.2]],{f:{ny:'bzBeam'}});
    for(const [x0,z0,x1,z1] of [[-32.6,-23.4,-30.2,-21],[-32.6,-13,-30.2,-10.6],[-26.2,-18.2,-24.2,-16.2]]){B(x0-.1,H+.4,z0-.1,x1+.1,H+.7,z0,W,CV);B(x0-.1,H+.4,z1,x1+.1,H+.7,z1+.1,W,CV)}
    for(let x=-41;x<-22;x+=2.2)B(x,H+.4,-8.4,x+1.1,H+1.1,-8,W,CV);
    for(const x of [-35.6,-27.6])for(const z of [-20.2,-13.8])B(x-.4,0,z-.4,x+.4,H,z+.4,'bzStoneD');
    for(let x=-40.4;x<-22.4;x+=2.3)B(x,H-.5,-25.4,x+.3,H,-8.6,'bzBeam',CV);
    // the mezzanine along the north wall (3 m), its stairs down the west wall, a balustrade
    B(-41,2.7,-25.4,-31,3,-22.6,'bzBeam',{f:{py:'bzWoodD'}});for(const x of [-37,-33.6,-31.2])B(x,0,-23,x+.2,2.7,-22.8,'bzWoodD');
    B(-39.2,3,-22.7,-31,3.95,-22.6,'bzRail',{pass:1});B(-31.1,3,-23.8,-31,3.95,-22.6,'bzRail',{pass:1});B(-39.2,3.95,-22.75,-31,4.05,-22.55,'bzWoodD',CV);
    stairs('x',-25.4,-23.8,-25,-31,0,3,10,'bzWoodD');for(let i=0;i<10;i++){const x0=-25-i*.6,t=.3*(i+1);B(x0-.6,t,-23.8,x0,t+.9,-23.7,'bzRail',{pass:1})}
    stairs('z',-41,-39.2,-12.4,-22.6,0,3,10,'bzWoodD');for(let i=0;i<10;i++){const z0=-12.4-i*1.02,t=.3*(i+1);B(-39.2,t,z0-1.02,-39.1,t+.9,z0,'bzRail',{pass:1})}
    B(-22.66,1.2,-21.2,-22.6,3.2,-19.4,'bzRug1',CV);
    // stalls, a heap of rolled carpets in the middle (the site's cover), pots and sacks along the walls
    stall(-37.6,-18.6,-35,-17.6,'bzClR','sos');stall(-25.8,-12.2,-23.2,-11.2,'bzClB','oos');stall(-37.8,-12.2,-35.6,-11.2,'bzClG','ss');
    B(-32.6,0,-17.4,-30,1,-15.6,'bzRug2',{f:{py:'bzRug3',px:'bzRug1'}});B(-32.2,1,-17.2,-30.6,1.35,-16.2,'bzRug1',CV);
    B(-30.4,0,-21.4,-29.2,.9,-20.2,'wood');sacks(-24.2,-21,-22.6,-19.4,.8);pot(-23,-14.2,.4,1);pot(-23,-13.2,.32,.8);pot(-23.2,-9.6,.35,.9);
    rug(-36,1,-22.55,-34.2,2.95,-22.5,'bzRug2');rug(-39,1.4,-8.66,-37.2,3.6,-8.6,'bzRug3');rug(-22.66,1.4,-14,-22.6,3.6,-12.2,'bzRug1');
    for(const [x,z] of [[-35.6,-17],[-27.6,-17],[-31.4,-11.8]])lantern(x,5.4,z,10,.75);LIGHT(-31.4,6,-22,'#ffe6c0',9,.5);
    B(-33,5.3,-8,-29,6.3,-7.94,'bzSignZ',CV);B(-37.6,1.8,-8,-36,3.4,-7.94,'bzSignB',CV);B(-22,1.6,-20.4,-21.94,3.2,-18.8,'bzSignB',CV);
    B(-35.2,0,-8,-33.6,.012,-6.4,'bzStoneD',CV);B(-34,4.4,-7.94,-28,4.6,-7.6,'bzWoodD',CV);B(-34.2,4.5,-7.6,-27.8,4.58,-6.4,'bzClR',CV);
    B(-33.8,0,-19,-28.2,.012,-13.2,'bzDecB',{nosolid:true,f:{px:'none',nx:'none',pz:'none',nz:'none',ny:'none'}})}
  function rug(x0,y0,z0,x1,y1,z1,m){B(x0,y0,z0,x1,y1,z1,m,CV)}
  // the B front yard and the carpet street down to the B gate: stalls along the sides, a pickup, carpets hung on a line
  stall(-41,-3,-38.6,-.4,'bzClR','oso');stall(-28.4,-4.6,-26,-2,'bzClB','sso');crate(-38.6,2.4,1.2);crate(-37.4,2.4,1.1);pot(-26.8,1.6,.38,.95);
  car(-37.6,12,-33.4,14.2,'car');B(-37.5,.95,12.2,-36,1.25,14,'bzSack',CV);
  stall(-38,6.4,-35.8,9,'bzClY','ss');stall(-29.2,9.2,-27,11.8,'bzClG','oo');stall(-38,18,-35.8,20.6,'bzClB','sos');
  crate(-29,17.4,1.2);crate(-29,18.6,1.2);crate(-29,18,1.1,1.2);drum(-35.6,22.6);drum(-35,23.2,0,'drumR');sacks(-31.4,23.6,-29.4,24.8,.8);
  for(const z of [4.6,15.4])B(-40.6,3.4,z,-27.2,3.43,z+.04,'metal2',CV);for(const [x,z] of [[-36,4.66],[-32,4.66],[-35,15.46],[-31,15.46]])rug(x-.8,1.6,z,x+.8,3.4,z+.04,['bzRug1','bzRug2','bzRug3'][Math.abs(Math.round(x+z))%3]);

  // ================= A: the caravanserai =================
  {const W='bzStone',H=6.5;
    wallX(22,41,-30.8,-30,0,H,W,[[29,33,0,4.2]]);arch('x',29,33,-30.8,-30,4.2,W);
    wallX(22,41,-6.8,-6,0,H,W,[[28,34,0,4.6]]);arch('x',28,34,-6.8,-6,4.6,W);wallZ(22,22.8,-30,-6.8,0,H,W,[[-14.8,-12.2,0,3]]);
    for(let x=22;x<41;x+=2.2){B(x,H,-30.8,x+1.1,H+.8,-30.4,W,CV);B(x,H,-6.4,x+1.1,H+.8,-6,W,CV)}
    // the north gallery: a roof on pillars, the terrace on top (4 m) behind a parapet, stairs up along the east wall
    B(22.8,3.6,-30,36,4,-25.2,'bzStoneD',{f:{ny:'bzBeam'}});B(36,3.6,-28.2,41,4,-25.2,'bzStoneD',{f:{ny:'bzBeam'}});
    stairs('x',-30,-28.2,33.8,41,0,4,12,'bzStoneD');for(let i=0;i<12;i++){const x0=33.8+i*.6,t=4*(i+1)/12;if(t<2.4)B(x0,t,-28.3,x0+.6,t+.85,-28.2,W)}
    B(36,4,-28.4,40.2,4.85,-28.2,W);B(35.8,4,-30,36,4.85,-28.4,W);for(const x of [24.4,28.2,33.8,37.6])B(x-.35,0,-25.6,x+.35,3.6,-24.9,'bzStoneD');
    B(22.8,4,-25.6,39,4.85,-25.2,W);stairs('z',39,41,-12,-25.2,0,4,13,'bzStoneD');for(let i=0;i<13;i++){const z0=-12-i*1.0154,t=4*(i+1)/13;B(38.8,t,z0-1.0154,39,t+.85,z0,W)}
    door('s',25.5,-30,178);for(const x of [24.6,27.4,34.6,37.6])B(x-.5,4.9,-30,x+.5,6,-29.94,'bzLat',CV);
    lantern(26.3,3.5,-27.6,8,.6);lantern(35.8,3.5,-27.6,8,.6);
    // the courtyard: a trough, the crates at the middle (the site's cover), sacks, a cart, pots
    B(23.2,0,-10.8,27.2,.8,-9.6,'bzStone',{f:{py:'bzWater'}});crate(30.6,-17.6,1.2);crate(31.8,-17.6,1.2);crate(31.2,-17.6,1.1,1.2);crate(32.9,-17.4,1);
    sacks(23.6,-21.4,25.8,-19.6,.85);B(24,.85,-21,25.4,1.2,-20,'bzSack',{nosolid:true,f:{py:'bzSpiceY'}});
    B(33.8,.55,-15,36.4,1.3,-13.2,'bzWoodD');for(const z of [-15.2,-13.2])B(34.4,0,z-.1,35.4,1,z+.1,'bzWoodD');B(32.2,.85,-14.3,33.8,.95,-13.9,'bzWoodD',CV);
    pot(37.6,-8.4,.4,1);pot(38.4,-8.1,.32,.8);pot(23.6,-23.6,.36,.9);palm(26.4,-15,6.8,77);
    B(28.5,0,-20,34.5,.012,-14,'bzDecA',{nosolid:true,f:{px:'none',nx:'none',pz:'none',nz:'none',ny:'none'}});
    B(29,4.7,-6,33,5.6,-5.94,'bzSignC',CV);B(26.2,1.8,-6,27.8,3.4,-5.94,'bzSignA',CV);B(21.94,3.2,-14.4,22,4.2,-12.6,'bzSignA',CV);
    B(28,4.6,-5.94,34,4.8,-5.6,'bzWoodD',CV)}
  // the A front yard and A long: palms along the wall, a broken cart, troughs, crates
  for(const [x,z,h] of [[39.4,-1.6,6.8],[39.6,9.4,7.4],[39.2,19.8,6.6]])palm(x,z,h,Math.round(x*11+z*3));
  B(34.2,0,12.4,36.4,.7,13.4,'bzStone',{f:{py:'bzWater'}});crate(35,22.2,1.2);crate(36.2,22.2,1.1);B(25.8,0,-3,28.2,.9,-1.4,'bzWoodD');B(26,.9,-2.8,28,1.25,-1.6,'bzSack',CV);
  B(36.4,.4,3.6,38.6,1.1,5.2,'bzWoodD');B(36.2,0,3.5,36.4,.8,3.9,'bzWoodD');B(38.8,0,4.8,39.6,.06,5.6,'bzWoodD',CV);sacks(30.6,1.8,32.4,3.2,.8);pot(23.2,2.6,.36,.9);

  // ================= mid: the well square =================
  {MAP.deco.push({k:'drum',x:0,y:0,z:0,r:1.3,h:.92,mat:'bzStoneD',rot:.3});B(-.95,0,-.95,.95,.92,.95,'metalx');B(-1.25,0,-.5,1.25,.92,.5,'metalx');B(-.5,0,-1.25,.5,.92,1.25,'metalx');
    MAP.deco.push({k:'drum',x:0,y:.6,z:0,r:1.05,h:.32,mat:'bzWater',rot:0});
    for(const x of [-1.15,1.05])B(x,.92,-.08,x+.1,2.7,.08,'bzWoodD');B(-1.25,2.6,-.1,1.25,2.75,.1,'bzWoodD');B(-.02,1.4,-.02,.02,2.6,.02,'metal2',CV);B(-.18,1.15,-.18,.18,1.45,.18,'bzWoodD',CV);
    palm(-6.6,-5.4,7,201);palm(6.8,5.4,6.6,203);palm(6.4,-5.6,6.2,207);
    stall(-10,4.6,-7.8,7.2,'bzClG','oso');B(5.2,0,-7.6,7.4,.45,-7,'bzWoodD');B(-5.6,0,7.4,-3.4,.45,8,'bzWoodD');
    pot(-9.4,-7.4,.36,.9);pot(9.4,7.2,.4,1);
    for(const [x0,z0,x1,z1] of [[-10,-6,10,-6.04],[-10,6,10,6.04]])B(x0,4.4,z0,x1,4.43,z1,'metal2',CV);for(const x of [-6,-2,2,6]){lantern(x,4.4,-6.02,7,.45);lantern(x,4.4,6.02,7,.45)}}
  // the tea house (its roof a terrace at 3.2 m, stairs up from the square) and the arch street's gate
  {const W='bzAdW';B(10,0,-8,16,3.2,-3,W,{f:{py:'bzFloor',ny:'none'}});stairs('z',8.2,10,-3,-8,0,3.2,10,'bzStone');
    B(10,3.2,-3.25,16,4.1,-3,W);B(15.75,3.2,-8,16,4.1,-3.25,W);B(10,3.2,-6.4,10.25,4.1,-3.25,W);
    door('s',13.4,-3,1103);win('s',11.4,-3,1.25,1104);B(13.9,2.45,-3,15.7,3.05,-2.94,'bzSignT',CV);
    B(12,3.2,-7.8,13,3.65,-7.2,'bzWoodD');B(14.6,3.2,-5.2,15.6,3.62,-4.2,'bzWoodD');rug(11.6,3.2,-6.6,13.6,3.22,-4.6,'bzRug2');
    B(9.8,5.6,-8.2,16.2,5.66,-2.8,'bzClB',CV);for(const [x,z] of [[10.1,-7.9],[15.9,-7.9],[15.9,-3.1],[10.1,-3.1]])B(x-.06,4.1,z-.06,x+.06,5.6,z+.06,'bzWoodD',CV)}
  wallX(-3,3,-14.4,-13.6,0,6.4,'bzStone',[[-2,2,0,4]]);arch('x',-2,2,-14.4,-13.6,4,'bzStone');B(-3.2,6.4,-14.6,3.2,6.9,-13.4,'bzStone',CV);
  crate(-2.4,-20.4,1.1);B(1.6,0,-11,2.8,.85,-9.8,'bzSack',{f:{py:'bzSpiceR'}});pot(2.4,-22.6,.34,.85);
  B(-3,2.2,-11.6,-2.94,3.8,-10,'bzSignB',CV);B(2.94,2.2,-11.6,3,3.8,-10,'bzSignA',CV);
  // the spice alley (mid → the bazaar's side door) and the tannery alley (mid → the caravanserai's side door)
  sacks(-17.8,-6.6,-17,-5.4,.75);pot(-15.4,-12.6,.3,.8);B(-14.4,0,-1.8,-13.4,.8,-1.1,'bzSack',{f:{py:'bzSpiceY'}});
  for(const z of [-17,-9,-3])B(-18,3.6,z,-15,3.66,z+.06,'metal2',CV);for(const [x0,z] of [[-18,-16.95],[-18,-8.95]])B(x0,2.2,z,x0+3,3.6,z+.04,['bzClY','bzClR'][Math.abs(Math.round(z))%2],CV);
  B(16,0,-9.4,16.8,.8,-8.2,'bzSack');crate(12,-.6,1);
  for(const z of [-13,-6])B(16,3.4,z,19,3.46,z+.06,'metal2',CV);for(const [x0,x1,z] of [[16.1,17.4,-12.95],[17.6,18.9,-5.95]])B(x0,1.8,z,x1,3.4,z+.04,['bzRug1','bzRug3'][Math.round(x0)%2],CV);

  // ================= the blocks of houses between the ways =================
  // west of the carpet street; between the hall and the spice alley; between the spice alley and the arch street; south-west
  blk(-41,4,-38,26,'e',{seed:7201});blk(-22,-26,-15,-19,'ns',{seed:7211});blk(-22,-15,-18,-8,'ne',{seed:7221});
  blk(-15,-24,-3,-8,'nesw',{seed:7231});blk(-15,-26,-12,-24,'n',{seed:7241});blk(-15,-8,-10,-2,'esw',{seed:7251,h:[4.6,6.4]});
  blk(-26,-8,-18,4,'we',{seed:7261});blk(-27,4,-10,26,'we',{seed:7271});blk(-18,1,-10,4,'ne',{seed:7281,h:[4.4,5.6]});blk(-10,8,-3,26,'ne',{seed:7291});
  // east: between the arch street and the tannery alley (the tea house at its corner), north of the caravanserai's west door, south-east
  blk(3,-24,16,-8,'wse',{seed:7301});blk(12,-30,16,-24,'nw',{seed:7311});blk(16,-30,22,-15,'ns',{seed:7321});blk(19,-12,22,4,'new',{seed:7331,h:[4.6,6.4]});
  blk(10,0,19,8,'nw',{seed:7341,h:[4.6,6.4]});blk(3,8,33,26,'nwe',{seed:7351});blk(19,4,33,8,'ne',{seed:7361,h:[4.6,6.4]});
  B(-28,2.2,-26.06,-26.4,3.8,-26,'bzSignB',CV);B(26.6,2,-30.86,28.2,3.6,-30.8,'bzSignA',CV);

  // ================= scenery: the desert beyond the walls, a far town wall, a few palms outside =================
  {const SF={f:{ny:'none'}};B(-80,0,-80,-46,5,48,'bzSandF',SF);B(46,0,-80,80,4,48,'bzSandF',SF);B(-46,0,-80,46,3,-48,'bzSandF',SF);B(-46,0,40,46,.01,48,'bzSandF',SF);
    B(-70,0,-70,-55,14,-58,'bzStoneF',SF);B(52,0,-60,68,11,-48,'bzStoneF',SF);B(-62,0,10,-52,9,24,'bzStoneF',SF);
    for(const [x,z,h] of [[-48,-30,7.5],[-49.5,-10,6.8],[48,-20,7.2],[49,6,6.6],[-47,40,7],[46,44,6.4]])palm(x,z,h,Math.round(x*5+z*3))}

  // ================= spawns, the sun, the title camera =================
  MAP.spawns=[];for(const x of [-9,-6.6,-4.2,4.2,6.6,9])for(const z of [-32,-28.6])MAP.spawns.push([x+rr(-.2,.2),z+rr(-.2,.2),0,Math.PI+rr(-.3,.3)]);
  MAP.zspawns=[];for(const x of [-8,-5,-2,2,5,8])for(const z of [30.8,33.6])MAP.zspawns.push([x+rr(-.3,.3),z+rr(-.2,.2),0]);
  MAP.camps=[{k:'terrace',w:.3,p:[[25.6,4,-27.6],[35.6,4,-27.6]],look:[31,1,-12]},{k:'mezz',w:.3,p:[[-38,3,-24],[-32,3,-24]],look:[-31,1,-10]},
    {k:'tea',w:.2,p:[[12,3.2,-5],[15,3.2,-6]],look:[0,1,0]},{k:'kasbah',w:.2,p:[[-6,0,-31],[6,0,-31]],look:[0,1,-20]}];
  MAP.spawnYaw=null;
  MAP.moon={d:new THREE.Vector3(-.62,.5,.6).normalize(),c:new THREE.Color('#ffe2b4'),i:1};
  MAP.cam=(t,cam)=>{const a=t*.025+2.2;cam.position.set(Math.sin(a)*30,24+2*Math.sin(t*.06),-2+Math.cos(a)*30);cam.lookAt(0,2,-6)}}
MAPDEFS.bazaar={n:['사막 바자르','Desert Bazaar'],d:['해 질 녘의 사막 교역 도시. 대상 숙소의 안뜰 A와 지붕 덮인 시장 B, 우물 광장의 중앙 — 성벽의 세 성문에서 시작하는 대인전 전용맵.',
    'A walled desert trading town late in the afternoon. The caravanserai\'s courtyard (A), the covered bazaar (B) and the well square in the middle: three gates, three ways in, made for player-versus-player.'],
  pvp:1,env:{sky:1,sun:1,skyTex:'bzSky',halo:'#ffd8a0',rain:0,storm:0,fog:'#d8c4a2',fogD:.0095,bloomThr:.88,ambOut:'#8a7a64',ambIn:'#463c32',boAmb:.6},
  bounds:[-45,-47,45,40],probeY:[.9,2.2,3.6,4.9,6.4],mini:[2],tex:bakeBzTex,build:buildBazaar,
  // 폭파미션: the sites, the attackers' ways in, the defenders' places, and where the attackers' smoke goes
  bomb:{A:{x:31.5,z:-17,r:6.5},B:{x:-31,z:-16.2,r:6.5},
    way:{A:[[37,12],[17.5,-8]],B:[[-32.5,12],[-16.5,-8]]},
    hold:{A:[[25.6,-27.6,4],[35.6,-27.6,4],[31,-27.4,0],[24.2,-24,0],[37.6,-10.2,0],[24.4,-17,0]],B:[[-37.6,-24,3],[-31.6,-24,3],[-39.4,-10.2,0],[-24,-24.6,0],[-24,-9.8,0],[-35.6,-22.4,0]]},
    smk:{A:[[31,-23,0],[37.4,-15,0]],B:[[-31,-20.6,0],[-26.4,-23.6,0]]}}};

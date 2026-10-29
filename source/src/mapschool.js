'use strict';
// ============ Map "새봄고등학교 Saebom High School" (v7.11): a high school on a spring evening, the day of its sports festival ============
// An original map (no reference), for the zombie modes and PvP. The sports festival was under way when it came: the tents, the hurdles,
// the score board are still out on the yard; the cherry trees round it are in full bloom and drop their petals. North: the main
// building (본관), three storeys of red brick on a 72 m corridor — the teachers' room, the nurse's room, the lobby with the central
// scissor stair, the science lab and the office below, classrooms 2-1..2-6 and 3-1..3-3, the library and the music room above; a stair
// core at each end goes on up to the roof (water tank, a parapet all round). East: the gym, its stage, a gallery round three sides at
// 3.6 m and the covered bridge to the main building's second floor; the teachers' car park and the outdoor court south of it. West: the
// cafeteria (its roof up a steel stair) and the bike shed. On the yard: the podium (구령대) under its canopy, the flag poles, the
// concrete stands, the water troughs, the goals and the festival tents. The wall all round, the gate and the guard booth on the south.
// The sun is low in the west-south-west: warm light on the west faces, long shadows reaching east over the yard.
Object.assign(MATS,{
  hcDirt:{t:'hcDirt',s:4,k:'soft',cs:2},hcLine:{t:'hcLine',s:1,k:'soft'},hcGrass:{t:'hcGrass',s:3,k:'soft',cs:2},hcPave:{t:'hcPave',s:2.4,k:'stone',cs:1},hcAsph:{t:'hcAsph',s:4,k:'stone',cs:2},
  hcPark:{t:'hcPark',s:5,k:'stone',cs:2},hcBrick:{t:'hcBrick',s:1.6,vo:0,sv:1.6,k:'stone',cs:1},hcConc:{t:'hcConc',s:2,k:'stone',cs:1},hcBand:{t:'hcBand',s:2,vo:0,sv:.6,k:'stone',cs:1},
  hcGlass:{t:'hcGlass',uv:'box',k:'glass'},hcTerr:{t:'hcTerr',s:2,k:'stone',cs:1},hcWoodF:{t:'hcWoodF',s:1.6,k:'wood',cs:1},hcWallIn:{t:'hcWallIn',s:2,vo:0,sv:3.6,k:'stone',cs:1},
  hcCeil:{t:'hcCeil',s:1.2,k:'stone',cs:1.2},hcLampF:{t:'hcLampF',uv:'box',emis:1.1,k:'glass'},hcDesk:{t:'hcDesk',s:.8,k:'wood'},hcChair:{t:'hcChair',s:.6,k:'wood'},hcSteel:{t:'hcSteel',s:1.2,k:'metal'},
  hcLocker:{t:'hcLocker',uv:'boxV',s:1.6,k:'metal'},hcDoor:{t:'hcDoor',uv:'box',k:'wood'},hcNotice:{t:'hcNotice',uv:'box',k:'soft'},hcFlag:{t:'hcFlag',uv:'box',k:'soft'},
  hcClock:{t:'hcClock',uv:'box',k:'metal'},hcTV:{t:'hcTV',uv:'box',emis:.12,k:'glass'},hcBoard1:{t:'hcBoard1',uv:'box',k:'wood'},hcBoard2:{t:'hcBoard2',uv:'box',k:'wood'},hcBoard3:{t:'hcBoard3',uv:'box',k:'wood'},
  hcShoe:{t:'hcShoe',uv:'boxV',s:1.2,k:'wood'},hcGymF:{t:'hcGymF',s:2.4,k:'wood',cs:2},hcGymW:{t:'hcGymW',s:3,vo:0,sv:9,k:'stone',cs:2},hcStage:{t:'hcStage',s:1.2,vo:0,sv:1.2,k:'wood'},
  hcCurtain:{t:'hcCurtain',s:2,vo:1.2,sv:5.2,k:'soft'},hcTin:{t:'hcTin',s:2,k:'metal',cs:2},hcTent:{t:'hcTent',s:2,k:'soft'},hcTentB:{t:'hcTentB',s:2,k:'soft'},
  hcWallO:{t:'hcWallO',s:3,vo:0,sv:2.4,k:'stone',cs:1},hcGate:{t:'hcGate',uv:'boxV',s:2,k:'metal'},hcCafeF:{t:'hcCafeF',s:1.2,k:'stone',cs:1},hcCounter:{t:'hcCounter',s:1.2,k:'metal'},
  hcLab:{t:'hcLab',s:1,k:'stone'},hcBooks:{t:'hcBooks',uv:'boxV',s:1.2,k:'wood'},hcBed:{t:'hcBed',s:1,k:'soft'},hcCurtW:{t:'hcCurtW',s:1.5,k:'soft'},hcMat:{t:'hcMat',s:1,k:'soft'},
  hcRubber:{t:'hcRubber',s:2,k:'soft',cs:1},hcSand:{t:'hcSand',s:2,k:'soft',cs:1},hcCourt:{t:'hcCourt',s:4,k:'stone',cs:2},hcNet:{t:'hcNet',s:1,k:'metal'},hcScore:{t:'hcScore',uv:'box',k:'wood'},
  hcPiano:{t:'hcPiano',s:1,k:'wood'},hcTank:{t:'hcTank',s:2,k:'metal'},hcBanner:{t:'hcBanner',uv:'box',k:'soft'},hcPlaque:{t:'hcPlaque',uv:'box',k:'stone'},hcMotto:{t:'hcMotto',uv:'box',k:'wood'},
  hcBark:{t:'hcBark',s:1,k:'wood'},hcBloom:{t:'hcBloom',s:1.4,k:'soft'},hcHill:{t:'hcHill',s:8,k:'soft'},hcPine:{t:'hcPine',s:1,k:'soft'},hcHouse:{t:'hcHouse',s:4,k:'stone',cs:4},
  hcCarW:{t:'hcCarW',s:2,k:'metal'},hcCarS:{t:'hcCarS',s:2,k:'metal'},hcCarB:{t:'hcCarB',s:2,k:'metal'},hcCarN:{t:'hcCarN',s:2,k:'metal'},
  hcSign21:{t:'hcSign21',uv:'box',k:'metal'},hcSign22:{t:'hcSign22',uv:'box',k:'metal'},hcSign23:{t:'hcSign23',uv:'box',k:'metal'},hcSign24:{t:'hcSign24',uv:'box',k:'metal'},
  hcSign25:{t:'hcSign25',uv:'box',k:'metal'},hcSign26:{t:'hcSign26',uv:'box',k:'metal'},hcSign31:{t:'hcSign31',uv:'box',k:'metal'},hcSign32:{t:'hcSign32',uv:'box',k:'metal'},
  hcSign33:{t:'hcSign33',uv:'box',k:'metal'},hcSignT:{t:'hcSignT',uv:'box',k:'metal'},hcSignN:{t:'hcSignN',uv:'box',k:'metal'},hcSignS:{t:'hcSignS',uv:'box',k:'metal'},
  hcSignA:{t:'hcSignA',uv:'box',k:'metal'},hcSignL:{t:'hcSignL',uv:'box',k:'metal'},hcSignM:{t:'hcSignM',uv:'box',k:'metal'},hcSignC:{t:'hcSignC',uv:'box',k:'metal'},
  hcSignG:{t:'hcSignG',uv:'box',k:'metal'},hcSignExit:{t:'hcSignExit',uv:'box',emis:.9,k:'metal'},
  hcLabS:{t:'hcLabS',s:1,vo:0,sv:1,k:'wood'},hcBottle:{t:'hcBottle',uv:'box',k:'glass'},hcKeys:{t:'hcKeys',uv:'box',k:'wood'},hcBoardM:{t:'hcBoardM',uv:'box',k:'wood'},hcBalls:{t:'hcBalls',uv:'box',k:'soft'},
});
MATK.hcX='wood';
// ---------- textures ----------
const HC_FONT='"Galmuri11","Malgun Gothic","Apple SD Gothic Neo",sans-serif';
// the spring dusk: deep blue overhead going to violet and rose, gold round the sun low in the west-south-west, long streaks of cloud lit
// pink from below; far off a ridge of hills and the town's apartment blocks against the glow
function texHcSky(){return paint(1024,256,P=>{const SU=83,SV=171,YH=232;
  const ridge=(x,s,f0)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=f0<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  const R1=new Float32Array(1024),R2=new Float32Array(1024);
  for(let x=0;x<1024;x++){R1[x]=YH-8-ridge(x,15011,3)*36;const bw=10+Math.floor(hash2(Math.floor(x/14),1,15021)*14),bi=Math.floor(x/bw);R2[x]=hash2(bi,2,15022)<.55?YH-4-hash2(bi,3,15023)*18:YH}
  for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/YH;let du=Math.abs(x-SU);du=Math.min(du,1024-du);const sw=Math.exp(-du/210)*.8+Math.exp(-du/60)*.4;
    let c=mix('#2c3a70','#5a5488',clamp(t*1.5,0,1));c=mix(c,'#b47898',clamp((t-.4)*2.3,0,1)*(.5+sw*.5));c=mix(c,'#f2a688',clamp((t-.62)*3,0,1)*(.35+sw*.65));
    c=mix(c,'#ffd8a0',clamp((t-.76)*4.5,0,1)*sw);const d=Math.hypot(du,(y-SV)*2);c=mix(c,'#fff4d8',clamp(1-d/80,0,1)*.92);
    const cl=P.n(x,y*3.4,120,15001,4),cy=clamp((t-.15)*2.4,0,1)*clamp((.94-t)*4,0,1);
    if(cl>.56&&y<YH){const k=clamp((cl-.56)*5,0,1)*cy;c=mix(c,mix(mix('#4a3e66','#80628a',t),mix('#ff9e8a','#ffd0a8',clamp(sw,0,1)),clamp((cl-.56)*3+sw*.45,0,1)),k*.85)}
    if(y>R1[x])c=mix(c,mix('#7a6c8e','#8a7a96',clamp((y-R1[x])/30,0,1)),.75);
    if(y>R2[x]&&R2[x]<YH){c=mix('#4e4660','#5a5068',clamp((y-R2[x])/12,0,1));if((x%5<2)&&(y%4<2)&&hash2(x>>1,y>>2,15024)<.22)c='#ffd890'}
    if(y>=YH+3)c=mix('#3e3846','#28242e',clamp((y-YH)/24,0,1));P.set(x,y,c)}})}
// petals: little pale pink ovals scattered on a texture (the yard, the paths and the grass under the trees)
function hcPetals(P,n,seed){const N=P.w;for(let i=0;i<n;i++){const x=Math.floor(hash2(i,1,seed)*N),y=Math.floor(hash2(i,2,seed)*N),c=rpickH(i+seed,['#f8d4e0','#f2bcd0','#ffe4ec','#eaa8c0']);
  P.set(x,y,c);if(hash2(i,3,seed)<.6)P.set(x+1,y,c);if(hash2(i,4,seed)<.4)P.set(x,y+1,dk(c,.1))}}
// the yard: pale sandy earth raked by the festival's feet, pebbles, footprints, a few petals blown in
function texHcDirt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,15101,4),h=hash2(x,y,15102),f=P.n(x,y,9,15103,2);
    let c=dith(P,x,y,n*.9+(h-.5)*.18,['#9e8462','#aa9068','#b69c74','#c2a880'],.1);if(f>.7)c=dk(c,.1);if(h<.02)c=rpickH(x*7+y,['#d8cab0','#7a6a54','#e8dcc4']);P.set(x,y,c)}hcPetals(P,30,15104)})}
// the track's lines on a quarter of the oval (x 0..32.2, z 0..14.2: straights to x 18, then the bend round x 18), the rest see-through
function texHcTrack(){const W=1024,H=512,QX=32.2,QZ=14.2,RL=[9.2,10.4,11.6,12.8,14];return paint(W,H,P=>{for(let py=0;py<H;py++){const z=(1-(py+.5)/H)*QZ;for(let px=0;px<W;px++){const x=(px+.5)/W*QX,rr=x<=18?z:Math.hypot(x-18,z);
    let on=false;for(const r of RL)if(Math.abs(rr-r)<.055)on=true;if(on)P.set(px,py,hash2(px,py,15611)<.12?'#c8c0a8':'#f2eee2');else{P.set(px,py,'#e2dccc');P.alpha(px,py,0)}}}})}
function texHcLine(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++)P.set(x,y,hash2(x,y,15111)<.16?'#b0a890':mix('#ece6d8','#fffcf2',hash2(x,y,15112)*.4))})}
function texHcGrass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,30,15121,4),b=P.n(x,y,90,15122,3),h=hash2(x,y,15123);
    let c=dith(P,x,y,n*.8+b*.25+(h-.5)*.2,['#4e6a2e','#5a7834','#668640','#74944a'],.14);if(b<.3&&h<.3)c=mix(c,'#8a7a54',.5);if(h>.985)c='#e8e4c8';P.set(x,y,c)}hcPetals(P,110,15124)})}
// square concrete paving blocks, grey and buff, sand in the joints, petals caught in them
function texHcPave(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/32),by=Math.floor(y/32),lx=x%32,ly=y%32,id=bx*9+by*5;
    let c=dith(P,x,y,.5+(P.n(x,y,20,15131,3)-.5)*.3+(hash2(id,1,15132)-.5)*.2,hash2(id,2,15133)<.3?['#9e9686','#aaa292','#b6ae9e']:['#8e8e8a','#9a9a96','#a6a6a2'],.08);
    if(lx<2||ly<2)c='#6e685c';P.set(x,y,c)}hcPetals(P,70,15134)})}
function texHcAsph(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,24,15141,4),h=hash2(x,y,15142);let c=dith(P,x,y,n*.7+(h-.5)*.3,['#38383a','#404042','#4a4a4c'],.1);
    if(Math.abs(P.n(x,y,60,15143,3)-.5)<.012)c='#26262a';if(h>.992)c='#6a6a66';P.set(x,y,c)}})}
// the car park: asphalt with the bays' white lines every 2.5 m (5 m tile: two bays and the line between)
function texHcPark(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,24,15151,4),h=hash2(x,y,15152);let c=dith(P,x,y,n*.7+(h-.5)*.3,['#3a3a3c','#424244','#4c4c4e'],.1);
    const lx=x%128;if((lx<4||lx>124)&&y>16)c=hash2(x,y,15153)<.12?'#9a9890':'#dcd8cc';P.set(x,y,c)}})}
// red brick in running bond (a brick 20 × 5 cm on the 1.6 m tile), each a shade of its own, grey mortar, now and then a darker header
function texHcBrick(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=Math.floor(y/8),ly=y%8;for(let x=0;x<N;x++){const xx=(x+(row&1)*16)%N,bi=Math.floor(xx/32),lx=xx%32,id=row*41+bi*7;
    let c=dith(P,x,y,.5+(hash2(id,1,15161)-.5)*.5+(P.n(x,y,16,15162,2)-.5)*.25,hash2(id,2,15163)<.12?['#5e2a20','#6a3024','#763628']:['#8a3c2a','#984430','#a44c36'],.1);
    if(ly===7||lx===31)c=mix('#b4aa9a','#9a9284',hash2(x,y,15164));if(hash2(x,y,15165)<.01)c=dk(c,.3);P.set(x,y,c)}}})}
function texHcConc(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,40,15171,4),h=hash2(x,y,15172);let c=dith(P,x,y,n*.6+(h-.5)*.2,['#c8c2b4','#d4cec0','#ded8cc'],.06);
    if(P.n(x,y,18,15173,2)>.7&&y>N*.6)c=mix(c,'#8a8478',.35);P.set(x,y,c)}})}
// the white band between the brick storeys (a slab edge), a dark drip line under it
function texHcBand(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.6+(hash2(x,y,15181)-.5)*.2,['#d8d2c4','#e2dcd0','#ece6da'],.05);if(y>56)c=mix(c,'#6a645a',(y-56)/8*.6);P.set(x,y,c)}})}
// a window pane: an aluminium frame and its transom, glass you see through (a few glints on it)
function texHcGlass(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const fr=x<7||x>120||y<7||y>120||Math.abs(y-38)<3;
    if(fr){P.set(x,y,mix('#b8bcc0','#d8dce0',hash2(x,y,15191)*.5));continue}const g=(x+y*.8)%96;if(g<2&&hash2(x>>2,y>>2,15192)<.5){P.set(x,y,'#e8f2f8');continue}P.alpha(x,y,0)}})}
// the corridor's terrazzo: grey cement full of white, green and black chips, a brass strip every 2 m
function texHcTerr(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x,y,15201),n=P.n(x,y,32,15202,3);let c=dith(P,x,y,n*.5+(h-.5)*.3,['#8e9488','#989e92','#a2a89c'],.08);
    if(h>.86)c=rpickH(x*3+y*7,['#e8e6dc','#d4d8cc','#5a6a58','#3a3c38','#c8c0a8']);if(x%128<2||y%128<2)c='#a89058';P.set(x,y,c)}})}
// the classrooms' floor: narrow varnished boards, honey to brown, worn paler down the aisles
function texHcWoodF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const b=Math.floor(y/16),ry=y%16;for(let x=0;x<N;x++){const id=b*13+Math.floor((x+b*61)/96);
    let c=dith(P,x,y,.5+Math.sin(x*.3+P.n(x,y,14,15211,2)*5)*.18+(hash2(id,1,15212)-.5)*.3,['#7a5430','#8a6038','#966c40','#a27848'],.08);if(ry===0||(x+b*61)%96===0)c='#4a3018';P.set(x,y,c)}}})}
// the inside walls: cream above, the grey-green dado below (to 1.1 m of the 3.6 m storey), a dark skirting; scuffs at kicking height
function texHcWallIn(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const yy=N-1-y,h=yy/N*3.6;let c;
    if(h<.12)c='#3a4438';else if(h<1.1)c=dith(P,x,y,.5+(P.n(x,y,24,15221,3)-.5)*.25,['#6a8a7c','#749686','#7ea090'],.05);else if(h<1.14)c='#4a5a50';
    else c=dith(P,x,y,.6+(P.n(x,y,40,15222,3)-.5)*.2,['#ddd4bc','#e6dec8','#eee8d4'],.05);if(h>.2&&h<.6&&hash2(x,y,15223)<.02)c=dk(c,.25);P.set(x,y,c)}})}
function texHcCeil(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.6+(hash2(x,y,15231)-.5)*.3,['#d8d6cc','#e2e0d6','#eceae0'],.05);
    if(x%64<2||y%64<2)c='#9a988e';else if(hash2(x>>1,y>>1,15232)<.06)c='#b8b6ac';P.set(x,y,c)}})}
function texHcLampF(){return paint(64,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<64;x++){let c=y<4||y>27||x<3||x>60?'#c8c8c0':mix('#fffaf0','#e8f0ff',Math.abs(y-16)/12);if(x%16<1)c='#d8d8d0';P.set(x,y,c)}})}
function texHcDesk(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+Math.sin(x*.25+P.n(x,y,10,15241,2)*4)*.15,['#c8a878','#d4b484','#dcc090'],.06);
    if(y<3||y>60)c='#8a6a44';if(hash2(x,y,15242)<.008)c='#3a3a5a';P.set(x,y,c)}})}
function texHcChair(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,.5+Math.sin(y*.3+P.n(x,y,10,15251,2)*4)*.15,['#9a6a3a','#a87444','#b47e4c'],.06))})}
function texHcSteel(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,12,15261,2)-.5)*.3,['#4a5258','#545c62','#5e666c'],.08);if(hash2(x,y,15262)<.01)c='#8a6a4a';P.set(x,y,c)}})}
// the lockers at the back of a classroom: grey steel doors in a grid (one a student's), numbered stickers, a few stickers and a dent
function texHcLocker(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%32,ly=y%64;let c=dith(P,x,y,.5+(hash2(x>>3,y>>3,15271)-.5)*.12,['#8a9298','#949ca2','#9ea6ac'],.05);
    if(lx<1||ly<1)c='#5a6066';if(lx>24&&lx<28&&ly>28&&ly<36)c='#3a3e42';if(lx>4&&lx<14&&ly>6&&ly<12)c='#f0ece0';
    const id=Math.floor(x/32)+Math.floor(y/64)*4;if(hash2(id,1,15272)<.3&&lx>8&&lx<20&&ly>40&&ly<52)c=rpickH(id,['#e85a7a','#5ab4e8','#f0c840','#7ad878']);P.set(x,y,c)}})}
// a classroom's sliding door: varnished wood with a tall wired window
function texHcDoor(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+Math.sin(y*.12+P.n(x,y,12,15281,2)*5)*.15,['#8a5a30','#966438','#a26e40'],.06);
    if(x<6||x>121||y<6||y>249)c='#5a3a1c';if(x>26&&x<102&&y>30&&y<120){c=(x-26)%12<1||(y-30)%12<1?'#9aa0a0':mix('#2a3a44','#4a5a64',(y-30)/90)}if(x>100&&x<112&&y>128&&y<150)c='#c8c8c0';P.set(x,y,c)}})}
// the notice board at the back: cork, papers pinned up (the timetable, a festival poster, notices)
function texHcNotice(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=dith(P,x,y,.5+(hash2(x,y,15291)-.5)*.4,['#a07850','#ac8458','#b89060'],.1);if(x<5||x>250||y<5||y>122)c='#6a4a2a';P.set(x,y,c)}
  P.post=x=>{const sh=(px,py,w,h,col)=>{x.fillStyle=col;x.fillRect(px,py,w,h)};sh(14,14,70,90,'#f4f0e4');for(let i=0;i<7;i++)sh(20,22+i*11,58,4,'#8a8aa0');sh(96,12,64,48,'#ffe4a0');sh(100,62,56,52,'#f8f4ec');sh(172,18,70,94,'#e8f4ff');
    x.fillStyle='#d04040';x.font='bold 13px '+HC_FONT;x.textAlign='center';x.fillText('체육대회',128,34);x.fillStyle='#3a3a6a';x.font='bold 11px '+HC_FONT;x.fillText('시간표',49,20);x.fillText('공지',207,32);
    x.fillStyle='#4a6ab0';for(let i=0;i<5;i++)x.fillRect(180,44+i*12,54,3)}})}
// the national flag over the blackboard, in its frame
function texHcFlag(){return paint(96,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<96;x++){let c='#f6f4ee';if(x<3||x>92||y<3||y>60)c='#6a4a2a';P.set(x,y,c)}
  P.post=x=>{x.save();x.translate(48,32);x.fillStyle='#c8203a';x.beginPath();x.arc(0,0,11,Math.PI*1.1,Math.PI*2.1);x.fill();x.fillStyle='#1a4aa0';x.beginPath();x.arc(0,0,11,Math.PI*.1,Math.PI*1.1);x.fill();
    x.fillStyle='#c8203a';x.beginPath();x.arc(-5.5*Math.cos(.31),-5.5*Math.sin(.31),5.5,0,TAU);x.fill();x.fillStyle='#1a4aa0';x.beginPath();x.arc(5.5*Math.cos(.31),5.5*Math.sin(.31),5.5,0,TAU);x.fill();
    x.fillStyle='#141414';for(const [px,py,r] of [[-30,-16,-.6],[30,-16,.6],[-30,16,.6],[30,16,-.6]]){x.save();x.translate(px,py);x.rotate(r);for(let k=-1;k<=1;k++)x.fillRect(-7,k*4-1,14,2.4);x.restore()}x.restore()}})}
function texHcClock(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-31.5,y-31.5);if(r>30){P.set(x,y,'#e6dec8');continue}let c=r>27?'#2a2a2a':'#f8f6f0';
    const a=Math.atan2(y-31.5,x-31.5),tick=Math.abs(((a/TAU*12)%1+1)%1-.5)>.46&&r>21&&r<26;if(tick)c='#222';P.set(x,y,c)}
  P.post=x=>{x.strokeStyle='#202020';x.lineWidth=3;x.beginPath();x.moveTo(32,32);x.lineTo(32+Math.cos(-2.2)*14,32+Math.sin(-2.2)*14);x.stroke();x.lineWidth=2;x.beginPath();x.moveTo(32,32);x.lineTo(32+Math.cos(.6)*21,32+Math.sin(.6)*21);x.stroke()}})}
function texHcTV(){return paint(128,80,P=>{for(let y=0;y<80;y++)for(let x=0;x<128;x++){let c=x<5||x>122||y<5||y>74?'#1a1a1c':mix('#10161e','#1e2836',y/80);if(x>8&&x<120&&y>8&&y<72&&hash2(x>>2,y>>2,15301)<.05)c='#2a3a50';P.set(x,y,c)}})}
// the blackboards: green slate in a wooden frame, a chalk tray; chalk writing (the date and the day's duty, a countdown, a plan for the day)
function hcBoard(fn){return paint(512,160,P=>{for(let y=0;y<160;y++)for(let x=0;x<512;x++){let c=dith(P,x,y,.5+(P.n(x,y,30,15311,3)-.5)*.25,['#1e3a2c','#244232','#2a4a38'],.06);
    if(P.n(x,y,60,15312,3)>.66)c=mix(c,'#5a7466',.25);if(x<7||x>504||y<7||y>152)c='#7a5430';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='rgba(240,238,226,.92)';x.textBaseline='middle';fn(x);x.fillStyle='rgba(250,246,230,.6)';x.fillRect(470,140,24,5);x.fillStyle='rgba(250,180,190,.7)';x.fillRect(440,141,18,4)}})}
function texHcBoard1(){return hcBoard(x=>{x.font='bold 22px '+HC_FONT;x.textAlign='left';x.fillText('4월 12일 (금)  체육대회',24,32);x.font='18px '+HC_FONT;x.fillText('주번: 김민준  이서연',24,66);
  x.fillText('· 체육복 착용 · 점심 후 2시 운동장 집합',24,98);x.textAlign='right';x.font='bold 26px '+HC_FONT;x.fillStyle='rgba(255,226,140,.95)';x.fillText('청군 화이팅!!',488,40)})}
function texHcBoard2(){return hcBoard(x=>{x.font='bold 30px '+HC_FONT;x.textAlign='center';x.fillText('중간고사 D-12',256,48);x.font='18px '+HC_FONT;x.fillText('수학: 3단원 ~ 5단원   국어: 「봄봄」',256,92);
  x.fillStyle='rgba(160,220,255,.9)';x.fillText('떠들면 이름 적음 →  박지훈, 최유나',256,124)})}
function texHcBoardM(){return hcBoard(x=>{x.strokeStyle='rgba(240,238,226,.85)';x.lineWidth=1.5;for(const y0 of [24,80]){for(let i=0;i<5;i++){x.beginPath();x.moveTo(24,y0+i*8);x.lineTo(488,y0+i*8);x.stroke()}
    for(let k=0;k<14;k++){const nx=70+k*30,ny=y0+32-((k*3+(y0>50?2:0))%9)*4;x.beginPath();x.ellipse(nx,ny,5,3.6,-.4,0,TAU);x.fill();x.fillRect(nx+3.6,ny-24,1.6,24)}}
  x.font='bold 18px '+HC_FONT;x.textAlign='left';x.fillText('가창 수행평가 — 4월 19일',24,138);x.textAlign='right';x.fillText('「봄 노래」 계이름 외워 오기',488,138)})}
function texHcBoard3(){return hcBoard(x=>{x.font='bold 24px '+HC_FONT;x.textAlign='left';x.fillText('자습',30,36);x.font='18px '+HC_FONT;x.fillText('이어달리기 순서: 1. 서연 2. 도윤 3. 하은 4. 민준',30,74);
  x.fillText('백군 줄다리기 연습 — 점심시간',30,108);x.textAlign='right';x.fillStyle='rgba(255,170,170,.95)';x.font='bold 20px '+HC_FONT;x.fillText('운동장 나가지 말 것',488,138)})}
// the shoe lockers by the entrance: pigeon-holes in light wood, white slippers in some
function texHcShoe(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%32,ly=y%32;let c=dith(P,x,y,.5+(hash2(x,y,15321)-.5)*.2,['#b89868','#c4a474','#d0b080'],.06);
    if(lx>3&&lx<29&&ly>3&&ly<29){c='#3a2a1a';const id=Math.floor(x/32)*5+Math.floor(y/32)*3;if(hash2(id,1,15322)<.6&&ly>16)c=lx<16?'#f0eee6':'#e4e2da'}P.set(x,y,c)}})}
// the gym floor: maple strips, honey and glossy; the court's lines are their own strips
function texHcGymF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++){const b=Math.floor(y/12),ry=y%12;for(let x=0;x<N;x++){const id=b*17+Math.floor((x+b*83)/128);
    let c=dith(P,x,y,.55+Math.sin(x*.21+P.n(x,y,16,15331,2)*4)*.15+(hash2(id,1,15332)-.5)*.2,['#b07c44','#bc884c','#c89456','#d4a060'],.06);if(ry===0||(x+b*83)%128===0)c='#7a5430';P.set(x,y,c)}}})}
// the gym's walls: a dark green dado to 1.8 m (of the 9 m texture), painted block above, a rubber edge
function texHcGymW(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=(N-1-y)/N*9;let c;
    if(h<.15)c='#2a2a2a';else if(h<1.8)c=dith(P,x,y,.5+(hash2(x,y,15341)-.5)*.2,['#2e5a48','#346250','#3a6a58'],.05);else{const bl=(Math.floor((N-1-y)/6))%2,lx=(x+bl*16)%32;c=dith(P,x,y,.6+(hash2(x>>2,y>>2,15342)-.5)*.15,['#d8d4c6','#e0dcce','#e8e4d8'],.04);if(lx===0||(N-1-y)%6===0)c='#bcb8aa'}
    P.set(x,y,c)}})}
function texHcStage(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+Math.sin(y*.2+P.n(x,y,12,15351,2)*4)*.12,['#5a3a22','#66442a','#724e32'],.06);if(x%42<2)c='#3a2414';if(y<5)c='#c8a040';P.set(x,y,c)}})}
function texHcCurtain(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const f=Math.sin(x/128*TAU*6+P.n(x,y,30,15361,2)*1.5);P.set(x,y,mix('#5a0c14','#a01e2a',f*.5+.5))}})}
function texHcTin(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.sin(x/128*TAU*10)*.5+.5;let c=mix('#5a6a78','#7a8a98',r);if(P.n(x,y,24,15371,3)>.68)c=mix(c,'#8a6a4a',.4);P.set(x,y,c)}})}
// the festival tents: blue and white stripes, a little sun-faded, the white one for the judges
function texHcTent(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=Math.floor(x/16)%2?'#e8eaf0':'#2a5ab0';c=mix(c,'#c8d0dc',P.n(x,y,40,15381,2)*.25);if(y>120)c='#1a3a7a';P.set(x,y,c)}})}
function texHcTentB(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=Math.floor(x/16)%2?'#f0eee8':'#c03838';c=mix(c,'#d8d0c8',P.n(x,y,40,15391,2)*.2);if(y>120)c='#7a1a1a';P.set(x,y,c)}})}
// the outer wall: rendered concrete, a cap, the children's mural of spring on the inside
function texHcWallO(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=(N-1-y)/N*2.4;let c=dith(P,x,y,.6+(P.n(x,y,30,15401,3)-.5)*.25,['#bab4a4','#c4beae','#cec8b8'],.06);
    if(h>2.25)c='#8a8678';else if(h<.15)c='#6a665c';if(P.n(x,y,14,15402,2)>.72&&h<1)c=mix(c,'#5a6a3a',.4);P.set(x,y,c)}})}
function texHcGate(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c=null;if(x%16<4||y<6||y>121||Math.abs(y-64)<3)c=dith(P,x,y,.5+(hash2(x,y,15411)-.5)*.3,['#2a4a6a','#30547a','#365e88'],.08);
    if(c)P.set(x,y,c);else P.alpha(x,y,0)}})}
function texHcCafeF(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%32,ly=y%32,id=Math.floor(x/32)+Math.floor(y/32)*4;let c=(Math.floor(x/32)+Math.floor(y/32))%2?'#c8c4b4':'#a8b4a8';
    c=mix(c,'#ffffff',hash2(x,y,15421)*.1);if(lx<1||ly<1)c='#8a8678';if(hash2(id,1,15422)<.1)c=dk(c,.06);P.set(x,y,c)}})}
function texHcCounter(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const b=Math.sin(y*.4+x*.05)*.5+.5;let c=mix('#8a9096','#c8ccd0',b*b);if(hash2(x,y,15431)<.02)c='#e8ecf0';P.set(x,y,c)}})}
function texHcLab(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.4+(hash2(x,y,15441)-.5)*.3,['#1a1c1e','#222426','#2a2c2e'],.08);if(hash2(x,y,15442)<.01)c='#6a6c6e';P.set(x,y,c)}})}
// the library: rows of books, spines of every colour, a white label low on each
function texHcBooks(){return paint(128,128,P=>{for(let y=0;y<128;y++){const sh=Math.floor(y/32),ly=y%32;let x=0,k=0;while(x<128){const w=3+Math.floor(hash2(k,sh,15451)*5),col=rpickH(k*7+sh*13,['#7a2a2a','#2a4a7a','#2a6a4a','#8a7a3a','#5a3a6a','#3a3a3a','#a8a090','#6a4a2a','#2a5a6a']),hh=20+Math.floor(hash2(k,sh+5,15452)*9);
      for(let i=0;i<w&&x<128;i++,x++){let c=ly>=30?'#5a3a1c':ly<30-hh?'#2a1a10':i===0?dk(col,.3):col;if(ly>24&&ly<27&&ly<30&&ly>=30-hh&&i>0)c='#e8e4d8';P.set(x,y,c)}k++}}})}
function texHcBed(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.6+(hash2(x,y,15461)-.5)*.2,['#e0e4e8','#e8ecf0','#f0f4f8'],.05);if(y%32<2)c='#b8c4d0';P.set(x,y,c)}})}
function texHcCurtW(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,mix('#c8d4dc','#eef2f4',Math.sin(x/64*TAU*4)*.5+.5))})}
function texHcMat(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(hash2(x,y,15471)-.5)*.2,['#2a5aa0','#3062a8','#366ab0'],.06);if(x<2||x>61||y<2||y>61)c='#1a3a6a';P.set(x,y,c)}})}
function texHcRubber(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++)P.set(x,y,dith(P,x,y,.5+(hash2(x,y,15481)-.5)*.6,['#7a2a24','#8a322a','#9a3a30'],.12))})}
function texHcSand(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+(P.n(x,y,16,15491,3)-.5)*.4+(hash2(x,y,15492)-.5)*.3,['#c8b48a','#d4c096','#e0cca2'],.12);P.set(x,y,c)}hcPetals(P,20,15493)})}
// the outdoor court: green acrylic, the red key, white lines (on the 4 m tile only the edge line)
function texHcCourt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,.5+(hash2(x,y,15501)-.5)*.3+(P.n(x,y,50,15502,3)-.5)*.2,['#3a6a4a','#407252','#467a5a'],.06);P.set(x,y,c)}})}
function texHcNet(){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){if((x+y)%8<1||(x-y+64)%8<1)P.set(x,y,'#e8e8e4');else P.alpha(x,y,0)}})}
// the festival's score board: 청군 · 백군, the scores chalked in
function texHcScore(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=x<128?'#2a5ab0':'#f0eee6';if(x<5||x>250||y<5||y>122)c='#5a3a1c';if(y>34&&y<118&&x>12&&x<244&&Math.abs(x-128)>6)c=x<128?'#1e3a2c':'#1e3a2c';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 22px '+HC_FONT;x.fillStyle='#ffffff';x.fillText('청 군',64,20);x.fillStyle='#202020';x.fillText('백 군',192,20);
    x.font='bold 52px '+HC_FONT;x.fillStyle='rgba(240,240,230,.92)';x.fillText('475',64,80);x.fillText('460',192,80)}})}
function texHcPiano(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#0e0e10','#2a2a2e',Math.pow(Math.sin(y*.1+x*.02)*.5+.5,3));P.set(x,y,c)}})}
// the roof's water tank: FRP panels a metre square, each bulging (lighter in its middle), their flanges bolted; grime streaking down
function texHcTank(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const lx=x%64,ly=y%64,d=Math.max(Math.abs(lx-31.5),Math.abs(ly-31.5))/32;
    let c=dith(P,x,y,clamp(.75-d*.5+(hash2(x,y,15511)-.5)*.12,0,1),['#7a8e9c','#869aa8','#92a6b4','#9eb2c0'],.05);
    if(lx<3||ly<3){c=lx<1||ly<1?'#56687a':'#6a7e8e';if((lx<3&&ly%16===8)||(ly<3&&lx%16===8))c='#c8ccd0'}if(P.n(x,y*.3,20,15512,2)>.72)c=mix(c,'#5a5a4a',.3);P.set(x,y,c)}})}
// a lab bench's cupboards: grey-beige laminate doors, their handles, the black kick plate
function texHcLabS(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const lx=x%32;let c=dith(P,x,y,.5+(hash2(x,y,15581)-.5)*.15,['#aaa69a','#b4b0a4','#beb9ae'],.05);
    if(lx<1)c='#5e5a52';if(y>57)c='#2e2e2c';if(lx>26&&lx<29&&y>14&&y<24)c='#4a4a48';P.set(x,y,c)}})}
// the reagent shelf: brown and clear bottles, a label on most
function texHcBottle(){return paint(128,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<128;x++)P.set(x,y,y>28?'#5a3a1c':'#2a2420');
  let x=3,k=0;while(x<122){const w=6+Math.floor(hash2(k,1,15591)*6),h=12+Math.floor(hash2(k,2,15592)*14),col=rpickH(k*5,['#6a3a14','#8a5a24','#c8d4d8','#a8c4b8','#3a5a8a']);
    for(let i=0;i<w&&x+i<128;i++)for(let j=0;j<h;j++){if(j>h-4&&(i<w*.3||i>w*.7))continue;P.set(x+i,28-j,j>h-3?'#2a2a2a':(i===1?lt(col,.25):col))}
    if(hash2(k,3,15593)<.6)for(let i=1;i<w-1&&x+i<128;i++)for(let j=4;j<8;j++)P.set(x+i,28-j,'#e8e4d8');x+=w+2+Math.floor(hash2(k,4,15594)*3);k++}})}
// the piano's keyboard from above: white keys, the black ones in their twos and threes at the back
function texHcKeys(){return paint(128,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<128;x++){const wk=Math.floor(x/5),lx=x%5,o=wk%7;let c=lx===0?'#9a9890':'#f2f0e8';
    if(y>12&&((lx>=3&&(o===0||o===1||o===3||o===4||o===5))||(lx<=1&&(o===1||o===2||o===4||o===5||o===6))))c='#141416';if(y>29)c='#0e0e10';P.set(x,y,c)}})}
// the gym's ball cart: basketballs behind the bars of its cage
function texHcBalls(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c='#1a1a1c';for(const [cx,cy] of [[14,14],[38,12],[56,22],[22,36],[46,38],[12,56],[34,58],[56,54]]){const d=Math.hypot(x-cx,y-cy);
      if(d<11){c=mix('#e07a2a','#a04a14',d/11);if(Math.abs(x-cx)<1||Math.abs(y-cy)<1)c='#2a1a10'}}if(x%16<2||y%16<2)c='#8a9298';P.set(x,y,c)}})}
// the banner over the stage and the one hung on the main building
function texHcBanner(){return paint(512,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<512;x++){let c=mix('#f8f4ea','#ece6d8',y/96);if(y<6||y>89)c='#2a5ab0';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 44px '+HC_FONT;x.fillStyle='#c02030';x.fillText('제23회 새봄 체육대회',256,50);x.fillStyle='#2a5ab0';x.font='bold 18px '+HC_FONT;x.fillText('★',40,50);x.fillText('★',472,50)}})}
function texHcPlaque(){return paint(512,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<512;x++){let c=dith(P,x,y,.5+(P.n(x,y,20,15521,3)-.5)*.4,['#5a5650','#66625a','#726e66'],.08);if(x<6||x>505||y<6||y>121)c='#3a3832';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 64px '+HC_FONT;x.fillStyle='#e8dcb0';x.fillText('새봄고등학교',256,58);x.font='16px '+HC_FONT;x.fillStyle='#c8bc90';x.fillText('SAEBOM HIGH SCHOOL',256,106)}})}
function texHcMotto(){return paint(512,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<512;x++){let c=dith(P,x,y,.5+Math.sin(x*.05+P.n(x,y,20,15531,2)*3)*.15,['#6a4424','#764e2c','#825834'],.06);if(x<8||x>503||y<8||y>119)c='#c8a040';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 56px '+HC_FONT;x.fillStyle='#f0e0a8';x.fillText('성실 · 배려 · 도전',256,66)}})}
function texHcBark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,.5+(P.n(x,y,8,15541,2)-.5)*.4,['#2e2422','#3a2e2a','#463832'],.1);if(y%9<1&&hash2(x>>2,y,15542)<.6)c='#5a4a40';P.set(x,y,c)}})}
// the blossom: pale pink, deeper in the shade between the flowers, a white one here and there, a little fresh green leaf
function texHcBloom(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,,id]=cellN(P,x,y,6,15551),n=P.n(x,y,20,15552,3);
    let c=f1<2.7?rpickH(id,['#f8d2de','#f2c2d2','#ecb2c6','#fbdde6']):mix('#c87896','#9a5272',clamp((f1-2.7)/2.5,0,1)*.6+n*.4);
    if(hash2(id,2,15553)<.06&&f1<2.2)c='#7aa85a';else if(f1<.9)c='#fff2f6';P.set(x,y,c)}})}
function texHcHill(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,6,15561);
    P.set(x,y,f1<3?rpickH(id,['#3a4a2a','#42522e','#4a5a34','#5a5a3a','#d8a8b8']):dk(rpickH(id,['#3a4a2a','#42522e']),.3))}})}
// the town round the school: blocks of flats, rows of lit and dark windows, the evening's colours
function texHcHouse(){const N=512,FH=N/6,UW=N/4;return paint(N,N,P=>{for(let y=0;y<N;y++){const yy=N-1-y,st=Math.floor(yy/FH),ly=yy-st*FH;for(let x=0;x<N;x++){const u=Math.floor(x/UW),lx=x-u*UW,id=st*7+u*13;
    let c=dith(P,x,y,.55+(P.n(x,y,40,15571,3)-.5)*.2,['#bcb6aa','#c8c2b6','#d2ccc0'],.04);
    if(ly<10)c=ly<2?'#7a766e':'#e0dbd0';
    else if(lx>8&&lx<UW-8&&ly<74){const lit=hash2(id,1,15572),warm=hash2(id,2,15573);
      if(ly<34){c=dith(P,x,y,.5,['#7a8694','#84909e'],.1);if(lx%10<2)c='#5a646e';if(ly>31)c='#b4b8bc'}
      else{c=lit<.42?(warm<.75?mix('#ffcf80','#ffb060',hash2(id,3,15574)):'#d8e4f4'):mix('#2a303c','#4a5468',(ly-34)/40);
        if(lit<.42&&hash2(id,4,15575)<.5&&lx<(UW-16)*.4+8)c=dk(c,.35);if(Math.abs(lx-UW/2)<2)c='#6a6e72';if(ly<37)c='#9aa0a6'}}
    P.set(x,y,c)}}})}
// the signs by the doors (white plates, black type)
function hcSign(t,col){return paint(160,56,P=>{for(let y=0;y<56;y++)for(let x=0;x<160;x++){let c=mix('#f4f2ec','#e6e4dc',y/56);if(x<4||x>155||y<4||y>51)c=col||'#2a3a5a';P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.font='bold 30px '+HC_FONT;x.fillStyle='#1a1a22';x.fillText(t,80,30)}})}
function texHcSignExit(){return paint(160,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<160;x++){let c='#1a9a4a';if(x<4||x>155||y<4||y>59)c='#0e5a2a';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#f4fff4';x.textAlign='center';x.textBaseline='middle';x.font='bold 26px '+HC_FONT;x.fillText('비상구',96,33);x.fillRect(22,18,10,26);x.fillRect(32,26,14,6)}})}
function bakeSchoolTex(){if(TEX.hcDirt)return;
  TEX.hcSky=mkTex(texHcSky());TEX.hcSky.wrapT=THREE.ClampToEdgeWrapping;TEX.hcSky.magFilter=THREE.LinearFilter;
  if(!TEX.sunDisc&&typeof texSunDisc==='function'){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  for(const [k,f] of [['hcDirt',texHcDirt],['hcLine',texHcLine],['hcGrass',texHcGrass],['hcPave',texHcPave],['hcAsph',texHcAsph],['hcPark',texHcPark],['hcBrick',texHcBrick],['hcConc',texHcConc],['hcBand',texHcBand],
      ['hcTerr',texHcTerr],['hcWoodF',texHcWoodF],['hcWallIn',texHcWallIn],['hcCeil',texHcCeil],['hcDesk',texHcDesk],['hcChair',texHcChair],['hcSteel',texHcSteel],['hcLocker',texHcLocker],['hcShoe',texHcShoe],
      ['hcGymF',texHcGymF],['hcGymW',texHcGymW],['hcStage',texHcStage],['hcCurtain',texHcCurtain],['hcTin',texHcTin],['hcTent',texHcTent],['hcTentB',texHcTentB],['hcWallO',texHcWallO],['hcGate',texHcGate],
      ['hcCafeF',texHcCafeF],['hcCounter',texHcCounter],['hcLab',texHcLab],['hcBooks',texHcBooks],['hcBed',texHcBed],['hcCurtW',texHcCurtW],['hcMat',texHcMat],['hcRubber',texHcRubber],['hcSand',texHcSand],
      ['hcCourt',texHcCourt],['hcNet',texHcNet],['hcPiano',texHcPiano],['hcTank',texHcTank],['hcBark',texHcBark],['hcBloom',texHcBloom],['hcHill',texHcHill],['hcHouse',texHcHouse],['hcLabS',texHcLabS]])TEX[k]=mkTex(f());
  for(const [k,f] of [['hcGlass',texHcGlass],['hcLampF',texHcLampF],['hcDoor',texHcDoor],['hcNotice',texHcNotice],['hcFlag',texHcFlag],['hcClock',texHcClock],['hcTV',texHcTV],['hcBoard1',texHcBoard1],
      ['hcBoard2',texHcBoard2],['hcBoard3',texHcBoard3],['hcScore',texHcScore],['hcBanner',texHcBanner],['hcPlaque',texHcPlaque],['hcMotto',texHcMotto],['hcSignExit',texHcSignExit],
      ['hcBottle',texHcBottle],['hcKeys',texHcKeys],['hcBoardM',texHcBoardM],['hcBalls',texHcBalls]])TEX[k]=mkTex(f(),false);
  for(const [k,t] of [['hcSign21','2-1'],['hcSign22','2-2'],['hcSign23','2-3'],['hcSign24','2-4'],['hcSign25','2-5'],['hcSign26','2-6'],['hcSign31','3-1'],['hcSign32','3-2'],['hcSign33','3-3'],
      ['hcSignT','교무실'],['hcSignN','보건실'],['hcSignS','과학실'],['hcSignA','행정실'],['hcSignL','도서실'],['hcSignM','음악실'],['hcSignC','급식실'],['hcSignG','체육관']])TEX[k]=mkTex(hcSign(t),false);
  TEX.hcPine=mkTex(texDrPine());TEX.hcCarW=mkTex(texCarPaint('#e8e8e4'));TEX.hcCarS=mkTex(texCarPaint('#9aa0a6'));TEX.hcCarB=mkTex(texCarPaint('#26282c'));TEX.hcCarN=mkTex(texCarPaint('#2a3a6a'));
  TEX.hcTrack=mkTex(texHcTrack(),false);
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['hcDirt','hcPave','hcTerr','hcWoodF','hcGymF','hcPark','hcTrack'])TEX[k].anisotropy=an}

// ---------- the map ----------
// (x east, z south. The main building x -36..36, z -40..-28, storeys at 0, 3.6, 7.2, the roof at 10.8; its corridor along the north
// side (z -39.75..-37), the rooms south of it. The yard x -34..34, z -22..22. The gym x 42..66, z -40..-10. The wall round it all at
// x -50 / 68, z -48 / 34)
const HCS={trees:[],bars:[]};
function buildSchool(){const CV={nosolid:true},PS={pass:1},G={ground:1},F=[0,3.6,7.2],RF=10.8,T=.25,WI='hcWallIn',BR='hcBrick';for(const k in HCS)HCS[k]=[];HCS.acc=0;const SR=mulberry32(2604),sr=(a,b)=>a+SR()*(b-a);
  const {bar,tst,hrail,rail}=stairKit(HCS.bars,'hcSteel');
  // a flight of thin concrete steps (each .32 deep at most under its tread: the flight below keeps its headroom)
  const ctst=(axis,c0,c1,a0,a1,y0,y1,n,mat,o)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1),bot=Math.max(Math.min(y0,y1),top-.32);
    if(axis==='z')B(c0,bot,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat,Object.assign({stair:1},o||{}));else B(Math.min(s0,s1),bot,c0,Math.max(s0,s1),top,c1,mat,Object.assign({stair:1},o||{}))}};
  const lampC=(x,z,yc,r,k)=>{B(x-.6,yc-.06,z-.1,x+.6,yc,z+.1,'hcLampF',CV);if(r)LIGHT(x,yc-.35,z,'#eef2ff',r,k==null?.62:k)};
  const pane=(x0,x1,z,y0,y1,n,th)=>{th=th||.06;const w=(x1-x0)/n;for(let i=0;i<n;i++)B(x0+w*i,y0,z-th/2,x0+w*(i+1),y1,z+th/2,'hcGlass',PS)};
  const paneZ=(z0,z1,x,y0,y1,n,th)=>{th=th||.06;const w=(z1-z0)/n;for(let i=0;i<n;i++)B(x-th/2,y0,z0+w*i,x+th/2,y1,z0+w*(i+1),'hcGlass',PS)};
  const tree=(x,z,s)=>{s=s||1;HCS.trees.push([x,0,z,s]);B(x-.18*s,0,z-.18*s,x+.18*s,3.2*s,z+.18*s,'hcX')};
  // ================= the ground =================
  B(-50,-1,-48,68,0,-40,'hcPave',G);B(-50,-1,-40,-36,0,-22,'hcGrass',G);B(36,-1,-40,42,0,-22,'hcPave',G);B(66,-1,-40,68,0,-10,'hcPave',G);
  B(-36,-1,-40,-30,0,-28,'hcTerr',G);B(30,-1,-40,36,0,-28,'hcTerr',G);// (under the two cores: the rest of the main building's ground floor is its own slabs)
  B(-36,-1,-28,36,0,-22,'hcPave',G);B(-50,-1,-22,-34,0,22,'hcPave',G);B(-34,-1,-22,34,0,22,'hcDirt',G);B(34,-1,-22,42,0,22,'hcPave',G);
  B(42,-1,-40,66,0,-10,'hcGymF',G);B(42,-1,-10,68,0,12,'hcPark',G);B(42,-1,12,68,0,34,'hcCourt',G);B(-50,-1,22,42,0,34,'hcGrass',G);B(-4,-.98,22,4,.02,34,'hcPave',{ground:1});
  // the outer wall (2.4 m, its cap; the gate on the south)
  for(const [x0,z0,x1,z1] of [[-50.4,-48.4,68.4,-48],[-50.4,34,-4.5,34.4],[4.5,34,68.4,34.4],[-50.4,-48,-50,34],[68,-48,68.4,34]])B(x0,0,z0,x1,2.4,z1,'hcWallO');
  {B(-4.5,0,34,-3.7,3.2,34.6,'hcConc');B(3.7,0,34,4.5,3.2,34.6,'hcConc');B(-3.7,0,34.1,3.7,2.1,34.3,'hcGate',PS);B(-4.4,2.4,33.94,-3.8,2.9,34,'hcPlaque',CV);
    B(-11,.6,33.92,-5,2,34,'hcPlaque',CV)}
  // ================= the main building =================
  const X0=-36,X1=36,ZN=-40,ZS=-28,CW=-37,P=[-30,-22,-14,-6,6,14,22,30];
  // floors and ceilings: the corridor (terrazzo), the rooms (wood), the hall (terrazzo); each storey's slab .3 thick (the stairs' holes left open)
  const holes2=[[-3,-33,3,-30.6]],holes3=[[-3,-35.5,3,-33.1]];
  for(const f of [1,2,3]){const y=F[f-1],sl=f>1?[y-.3,y]:[-1,0],H=f===2?holes2:f===3?holes3:[];
    slab(-30,ZN+T,30,CW,sl[0],sl[1],'hcTerr',[],{f:{ny:'hcCeil'}});slab(-6,CW,6,ZS-T,sl[0],sl[1],'hcTerr',H,{f:{ny:'hcCeil'}});
    for(const [a,b] of [[-30,-6],[6,30]])slab(a,CW,b,ZS-T,sl[0],sl[1],'hcWoodF',[],{f:{ny:'hcCeil'}})}
  slab(-36,-40,36,-28,RF-.3,RF,'hcConc',[[-35.75,-37,-30.25,-31.25],[30.25,-37,35.75,-31.25]],{f:{ny:'hcCeil'}});
  // the outer walls: brick, a white band at every floor line, windows; the inside faces painted
  const bands=[[3.3,3.9],[6.9,7.5],[10.5,11.9]];
  {const hN=[],hS=[];for(const y of F){for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(b-a>12)continue;hN.push([a+.7,b-.7,y+1,y+2.6]);if(!(a===-6&&y===0))hS.push([a+.55,b-.55,y+.9,y+2.7])}}
    hS.push([-3,3,0,2.6]);hN.push([-2,2,0,2.4]);for(const y of F){hN.push([-34.8,-31,y+1,y+2.6]);hN.push([31,34.8,y+1,y+2.6]);hS.push([-34.8,-31,y+.9,y+2.7]);hS.push([31,34.8,y+.9,y+2.7])}
    // (the cores' outer faces get windows too: their landings are lit from outside)
    wallX(X0,X1,ZN,ZN+T,0,RF,BR,hN,{f:{pz:WI}});wallX(X0,X1,ZS-T,ZS,0,RF,BR,hS,{f:{nz:WI}});
    wallZ(X0,X0+T,ZN+T,ZS-T,0,RF,BR,[[-39.4,-37.3,0,2.4]],{f:{px:WI}});wallZ(X1-T,X1,ZN+T,ZS-T,0,RF,BR,[[-39.4,-37.3,0,2.4],[-39.4,-37.3,3.6,5.8]],{f:{nx:WI}});
    B(X0,RF,ZN,X1,RF+1.1,ZN+T,BR);B(X0,RF,ZS-T,X1,RF+1.1,ZS,BR);B(X0,RF,ZN+T,X0+T,RF+1.1,ZS-T,BR);B(X1-T,RF,ZN+T,X1,RF+1.1,ZS-T,BR);
    for(const [y0,y1] of bands){B(X0-.06,y0,ZN-.06,X1+.06,y1,ZN,'hcBand',CV);B(X0-.06,y0,ZS,X1+.06,y1,ZS+.06,'hcBand',CV);B(X0-.06,y0,ZN,X0,y1,ZS,'hcBand',CV);B(X1,y0,ZN,X1+.06,y1,ZS,'hcBand',CV)}
    // the panes (four in each classroom bay, three in the corridor's), the sills
    for(const y of F)for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(b-a>12)continue;pane(a+.7,b-.7,ZN+T/2,y+1,y+2.6,3);if(!(a===-6&&y===0)){pane(a+.55,b-.55,ZS-T/2,y+.9,y+2.7,4);B(a+.55,y+.82,ZS-.4,b-.55,y+.9,ZS+.14,'hcConc',CV)}}
    for(const y of F){pane(-34.8,-31,ZN+T/2,y+1,y+2.6,2);pane(31,34.8,ZN+T/2,y+1,y+2.6,2);pane(-34.8,-31,ZS-T/2,y+.9,y+2.7,2);pane(31,34.8,ZS-T/2,y+.9,y+2.7,2)}
    // the parapet's coping, the entrance canopy, the school's banner hung from the roof
    for(const [a0,b0,a1,b1] of [[X0-.1,ZN-.1,X1+.1,ZN+T+.04],[X0-.1,ZS-T-.04,X1+.1,ZS+.1],[X0-.1,ZN+T+.04,X0+T+.04,ZS-T-.04],[X1-T-.04,ZN+T+.04,X1+.1,ZS-T-.04]])B(a0,RF+1.1,b0,a1,RF+1.2,b1,'hcConc',CV);B(-4,3,ZS,4,3.25,ZS+2.4,'hcConc',{f:{py:'hcConc'}});for(const x of [-3.8,3.6])B(x,0,ZS+2.1,x+.2,3,ZS+2.3,'hcConc');
    B(9,5,ZS+.02,21,6.6,ZS+.08,'hcBanner',CV);B(-3,RF+.1,ZS+.02,3,RF+1.6,ZS+.1,'hcMotto',CV);for(const x of [-2.4,2.2])B(x,RF+1.1,ZS-.1,x+.2,RF+1.6,ZS+.02,'hcSteel',CV)}
  // the corridor wall and the rooms' partitions, the doors (1.6 m: front and back), the signs
  const rooms={'2':[[-30,-22,'hcSign21','hcBoard1'],[-22,-14,'hcSign22','hcBoard2'],[-14,-6,'hcSign23','hcBoard3'],[6,14,'hcSign24','hcBoard2'],[14,22,'hcSign25','hcBoard1'],[22,30,'hcSign26','hcBoard3']],
    '3':[[-30,-22,'hcSign31','hcBoard3'],[-22,-14,'hcSign32','hcBoard1'],[-14,-6,'hcSign33','hcBoard2'],[6,22,'hcSignL',null],[22,30,'hcSignM',null]],
    '1':[[-30,-14,'hcSignT',null],[-14,-6,'hcSignN',null],[6,22,'hcSignS','hcBoard2'],[22,30,'hcSignA',null]]};
  for(const f of [1,2,3]){const y=F[f-1],R=rooms[f],hz=[];
    for(const [a,b,sg] of R){hz.push([a+.5,a+2.1,y,y+2.2]);hz.push([b-2.1,b-.5,y,y+2.2]);
      // the sliding doors left open beside their gaps (on the corridor side), the sign over the front door
      for(const d of [a+.5,b-2.1])B(d+1.6,y,CW-.1,d+2.4,y+2.2,CW-.04,'hcDoor',CV);B(a+.6,y+2.35,CW-.32,a+1.9,y+2.8,CW-.25,sg,CV)}
    wallX(-30,-6,CW,CW+T,y,y+3.6,WI,hz.filter(h=>h[1]<=-6));wallX(6,30,CW,CW+T,y,y+3.6,WI,hz.filter(h=>h[0]>=6));
    for(const p of P){if(p===-30||p===30)continue;if(R.some(([a,b])=>p>a&&p<b))continue;wallZ(p-T/2,p+T/2,CW,ZS-T,y,y+3.6,WI)}
    // the corridor's lamps and exit signs, a lamp in the hall
    for(let x=-26;x<=26;x+=8)if(Math.abs(x)>3)lampC(x,-38.4,y+3.3,6,.42);B(-2.6,y+2.5,-39.72,-1.4,y+2.9,-39.66,'hcSignExit',CV);lampC(0,-30,y+3.3,9,.6)}
  // the rooms
  const desk=(x,z,y,rot)=>{B(x-.33,y+.72,z-.25,x+.33,y+.76,z+.25,'hcDesk',CV);for(const [dx,dz] of [[-.3,-.22],[.3,-.22],[-.3,.22],[.3,.22]])B(x+dx-.015,y,z+dz-.015,x+dx+.015,y+.72,z+dz+.015,'hcSteel',CV);B(x-.3,y+.6,z-.2,x+.3,y+.64,z+.2,'hcSteel',CV)};
  const chair=(x,z,y,s)=>{B(x-.2,y+.42,z-.2,x+.2,y+.46,z+.2,'hcChair',CV);B(x-.2,y+.46,z+s*.18,x+.2,y+.84,z+s*.2,'hcChair',CV);for(const [dx,dz] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]])B(x+dx-.012,y,z+dz-.012,x+dx+.012,y+.42,z+dz+.012,'hcSteel',CV)};
  // a group of four desks (모둠): one box to bump into round the desks and their chairs; the chairs a little askew
  const island=(cx,cz,y,mess)=>{B(cx-.7,y,cz-.9,cx+.7,y+.78,cz+.9,'hcX');
    for(const [dx,dz] of [[-.34,-.26],[.34,-.26],[-.34,.26],[.34,.26]])desk(cx+dx,cz+dz,y);for(const [dx,dz,s] of [[-.34,-.72,-1],[.34,-.72,-1],[-.34,.72,1],[.34,.72,1]])chair(cx+dx+(mess?sr(-.05,.05):0),cz+dz,y,s)};
  const classroom=(a,b,y,board,o)=>{o=o||{};const x0=a+T/2,x1=b-T/2,zf=CW+T,zb=ZS-T;
    // the blackboard on the west wall, the flag over it, the teacher's desk, a TV and a clock; the lockers and the notice board at the back
    B(x0,y+.95,-35.3,x0+.06,y+2.25,-30.2,board,CV);B(x0,y+.9,-35.3,x0+.14,y+.95,-30.2,'hcSteel',CV);B(x0,y+2.5,-33.2,x0+.04,y+2.95,-32.3,'hcFlag',CV);
    B(x0+.9,y,-33.1,x0+1.45,y+1.05,-32.2,'hcDesk');B(x0+.02,y+2.35,-36.2,x0+.6,y+2.75,-35.5,'hcTV',CV);B(x1-.04,y+2.5,-33,x1,y+2.9,-32.6,'hcClock',CV);
    B(x1-.5,y,zf+1.7,x1,y+1.25,zb-.2,'hcLocker');B(x1-.04,y+1.5,-35.4,x1,y+2.4,-30.4,'hcNotice',CV);
    if(o.pile){// the desks dragged into a barricade across the back door, the rest of the room cleared
      B(x1-2.4,y,zf,x1-.55,y+1.6,zf+1.4,'hcDesk',{f:{py:'hcDesk'}});for(let k=0;k<5;k++)desk(x1-2+sr(-.4,.6),zf+.4+sr(0,.6),y+(k>2?.8:0),0);for(let k=0;k<4;k++)chair(x1-1.6+sr(-.6,.4),zf+.5+sr(0,.5),y+(k>1?.8:0),1);
      island(x0+2.6,-30.6,y,true);island(x0+4.2,-30.6,y,true);return}
    for(const cz of [-34.2,-30.7])for(const cx of [x0+2.6,x0+5.65])island(cx,cz,y,o.mess);
    lampC(x0+3,-34.2,y+3.3,0);lampC(x0+3,-30.6,y+3.3,0);lampC(x0+5.6,-34.2,y+3.3,0);lampC(x0+5.6,-30.6,y+3.3,0);LIGHT((x0+x1)/2,y+2.8,-32.5,'#eef2ff',7.5,.62)};
  for(const f of [2,3]){const y=F[f-1];for(const [a,b,,bd] of rooms[String(f)]){if(!bd)continue;if(b-a>8)continue;classroom(a,b,y,bd,{pile:f===3&&a===-22,mess:f===2&&a===14})}}
  // 1F: the teachers' room (rows of desks under their shelves), the nurse's room (beds behind curtains), the science lab, the office
  {const y=0;for(let r=0;r<2;r++)for(const cx of [-26.4,-19.4]){const cz=-34.6+r*3.2;B(cx-1.9,y,cz-.55,cx+1.9,y+.78,cz+.55,'hcDesk',{f:{py:'hcDesk'}});B(cx-1.9,y+.78,cz-.03,cx+1.9,y+1.2,cz+.03,'hcSteel',CV);
      for(let k=0;k<4;k++){B(cx-1.6+k*1,y+.78,cz-.5,cx-1.2+k*1,y+.82,cz-.2,'hcNotice',CV);chair(cx-1.4+k*1,cz+(k%2?.85:-.85),y,k%2?1:-1)}}
    B(-29.8,y,-36.6,-29.3,y+2.2,-29,'hcBooks');B(-16,y,-29.1,-14.3,y+1.9,-28.7,'hcBooks');lampC(-26,-33,3.3,7,.55);lampC(-18,-31,3.3,7,.55);
    for(const z of [-35.6,-33.2,-30.8]){B(-13.7,y,z-.45,-11.7,y+.6,z+.45,'hcBed');B(-13.7,y+.6,z-.4,-13.4,y+.95,z+.4,'hcBed',CV);B(-11.5,y,z-.62,-11.46,y+2.1,z+.62,'hcCurtW',CV)}
    B(-6.6,y,-36.6,-6.2,y+1.9,-34.4,'hcLocker');B(-8.8,y,-30.2,-7.4,y+.78,-29.2,'hcDesk');lampC(-10,-32.5,3.3,7,.55);
    for(const cx of [10,17.5])for(const cz of [-34.2,-30.6]){B(cx-1.55,y,cz-.6,cx+1.55,y+.86,cz+.6,'hcLabS');B(cx-1.62,y+.86,cz-.67,cx+1.62,y+.9,cz+.67,'hcLab',{f:{py:'hcLab'}});
      // (a sink and its gooseneck tap at each end, the reagent shelf down the middle, the gas taps)
      for(const s of [-1,1]){const sx=cx+s*1.12;B(sx-.22,y+.9,cz-.3,sx+.22,y+.906,cz+.3,'hcSteel',CV);B(sx+s*.27-.025,y+.9,cz-.025,sx+s*.27+.025,y+1.28,cz+.025,'hcSteel',CV);B(Math.min(sx,sx+s*.27),y+1.24,cz-.025,Math.max(sx,sx+s*.27),y+1.28,cz+.025,'hcSteel',CV)}
      B(cx-.8,y+.9,cz-.1,cx+.8,y+1.32,cz+.1,'hcBottle',CV);for(const dz of [-.42,.42])B(cx-.05,y+.9,cz+dz-.04,cx+.05,y+.98,cz+dz+.04,'hcSteel',CV)}
    B(21.3,y,-36.6,21.8,y+1.9,-29,'hcBooks');{const sx=7.2,sz=-29.4;B(sx-.04,0,sz-.04,sx+.04,1.7,sz+.04,'hcSteel',CV);B(sx-.14,1.45,sz-.1,sx+.14,1.78,sz+.12,'hcBed',CV);B(sx-.2,.9,sz-.06,sx+.2,1.45,sz+.06,'hcBed',CV)}
    lampC(10,-32.5,3.3,8,.55);lampC(17.5,-32.5,3.3,8,.55);B(23,y,-34,24.4,y+1.05,-29.5,'hcCounter');B(26,y,-35.8,29.5,y+.78,-34.8,'hcDesk');B(26.5,y,-31,29.5,y+.78,-30,'hcDesk');lampC(26,-32.5,3.3,7,.55)}
  // 3F: the library (shelves in rows, tables), the music room (a piano, a ring of chairs)
  {const y=7.2;for(const cz of [-34.6,-32.2,-29.8])B(7,y,cz-.25,15,y+1.9,cz+.25,'hcBooks');for(const cz of [-34.3,-30.9]){B(16.6,y,cz-.6,20.6,y+.76,cz+.6,'hcDesk',{f:{py:'hcDesk'}});for(let k=0;k<3;k++){chair(17.2+k*1.3,cz-1,y,-1);chair(17.2+k*1.3,cz+1,y,1)}}
    lampC(11,-33,10.5,8,.55);lampC(18.5,-33,10.5,8,.55);B(23,y,-36.75,24.5,y+1.28,-36.15,'hcPiano',{f:{py:'hcPiano'}});B(23,y+.68,-36.15,24.5,y+.76,-35.88,'hcKeys',{f:{pz:'hcPiano',px:'hcPiano',nx:'hcPiano'}});B(23.04,y+.76,-36.18,24.46,y+1.02,-36.12,'hcPiano',CV);
    B(23.3,y,-35.6,24.2,y+.48,-35.25,'hcPiano',{f:{py:'hcChair'}});B(28.6,y,-35.2,29.8,y+.25,-30.2,'hcStage',{stair:1,f:{py:'hcStage'}});B(29.2,y+.25,-35.2,29.8,y+.5,-30.2,'hcStage',{stair:1,f:{py:'hcStage'}});
    for(let k=0;k<9;k++){const an=-.4+k*.36;chair(26+Math.cos(an)*2.6,-32.2+Math.sin(an)*2.6,y,1)}B(22.2,y+.95,-35.3,22.26,y+2.25,-30.2,'hcBoardM',CV);lampC(26,-32.5,10.5,8,.55)}
  // the lobby: the shoe lockers, the school's motto, a trophy case; the central scissor stair (1F→2F along +x, 2F→3F back along −x)
  {B(-5.6,0,-29,-4.4,1.9,-28.6,'hcShoe');B(4.4,0,-29,5.6,1.9,-28.6,'hcShoe');B(-5.86,0,-36.4,-5.4,1.9,-33.6,'hcShoe');B(5.4,0,-36.4,5.86,1.9,-33.6,'hcShoe');
    stairs('x',-33,-30.6,-3,3,0,3.6,18,'hcTerr',{f:{ny:'hcCeil',pz:WI}});stairs('x',-35.5,-33.1,3,-3,3.6,7.2,18,'hcTerr',{f:{ny:'hcCeil',nz:WI}});
    B(-3,0,-33.1,3,7.2,-33,WI);// (the wall between the two flights)
    rail(-3,-30.6,3,-30.54,3.6,1,'hcSteel');rail(-3.06,-33,-3,-30.6,3.6,1,'hcSteel');rail(-3,-33.1,3,-33.04,7.2,1,'hcSteel');rail(3,-35.5,3.06,-33.1,7.2,1,'hcSteel');rail(-3,-35.56,3,-35.5,7.2,1,'hcSteel')}
  // the stair cores at both ends (x0 west edge; flip mirrors the lanes): the floor zone on the corridor side (north), flights south to a
  // half landing and back, up to the roof hut; the door onto the corridor at every storey, onto the roof at the top
  const core=(x0,flip)=>{const xa=x0+.25,xb=x0+5.75,mid=x0+3,L0=flip?[mid+.1,xb]:[xa,mid-.1],L1=flip?[xa,mid-.1]:[mid+.1,xb],zf=-37,zl=-34,zland=-31.25,dx=flip?x0:x0+6;
    for(const y of [0,3.6,7.2]){const m=y===0?stairs:ctst;m('z',L0[0],L0[1],zf,zl,y,y+1.8,9,'hcTerr',{f:{ny:'hcCeil'}});B(xa,y+1.5,zl,xb,y+1.8,zland,'hcTerr',{f:{ny:'hcCeil'}});
      ctst('z',L1[0],L1[1],zl,zf,y+1.8,y+3.6,9,'hcTerr',{f:{ny:'hcCeil'}});B(xa,y+3.3,-39.75,xb,y+3.6,zf,'hcTerr',{f:{ny:'hcCeil'}});B(mid-.1,y,zf,mid+.1,y+1.9,zl,WI);
      lampC(x0+3,-38.4,y+3.3,6,.45);LIGHT(x0+3,y+2.8,-32.5,'#eef2ff',5,.4)}
    // the walls: the inner one (to the corridor, or the bridge on the east), the south one (the rest is a closed store), the hut on the roof
    wallZ(dx-T/2,dx+T/2,-39.75,ZS-T,0,RF,WI,[[-39.55,-37.05,0,2.4],[-39.55,-37.05,3.6,5.8],[-39.55,-37.05,7.2,9.4]]);wallX(x0+T,x0+6-T,zland-.25,zland,0,RF,WI);
    // the hut on the roof: its door in the inner side wall, beside the floor zone the last flight comes up to
    const hd=[[-39.55,-37.05,RF,RF+2.3]];wallZ(x0,x0+T,-40,-31.25,RF,RF+3.2,BR,flip?hd:[],{f:{px:WI}});wallZ(x0+6-T,x0+6,-40,-31.25,RF,RF+3.2,BR,flip?[]:hd,{f:{nx:WI}});
    wallX(x0+T,x0+6-T,-40,-39.75,RF,RF+3.2,BR,[],{f:{pz:WI}});wallX(x0+T,x0+6-T,-31.5,-31.25,RF,RF+3.2,BR,[],{f:{nz:WI}});
    B(x0-.1,RF+3.2,-40.1,x0+6.1,RF+3.45,-31.15,'hcConc',{f:{ny:'hcCeil'}});lampC(x0+3,-35,RF+3.1,6,.5)};
  core(-36,0);core(30,1);
  // the roof: a parapet all round (the main walls go on to 11.9), the water tank on its stand up a steel stair, air-conditioning units
  {B(-14,RF,-36,-8,RF+1.2,-31,'hcSteel',{f:{py:'hcSteel'}});
    B(-12.6,RF+1.2,-35.4,-9.4,RF+3.6,-31.6,'hcTank',{f:{py:'hcTank'}});
    for(const x of [-11.42,-10.62])B(x,RF+1.2,-31.58,x+.04,RF+4,-31.5,'hcSteel',CV);for(let yy=RF+1.5;yy<RF+3.9;yy+=.3)B(-11.42,yy,-31.56,-10.58,yy+.035,-31.52,'hcSteel',CV);
    B(-11.5,RF+3.6,-34.2,-10.5,RF+3.72,-33.2,'hcSteel',CV);B(-9.4,RF+1.2,-34.2,-9.3,RF+3.3,-34.1,'hcSteel',CV);tst('z',-14,-12.4,-29,-31,RF,RF+1.2,4,'hcSteel');hrail('z',-14.06,-14,-29,-31,RF,RF+1.2,4);
    for(const [x,z] of [[4,-38.5],[7,-38.5],[10,-38.5],[18,-30],[21,-30]]){B(x-1,RF,z-.5,x+1,RF+.9,z+.5,'hcCounter')}
    B(-24,RF,-39.5,-23.8,RF+4,-39.3,'hcSteel',CV);B(-25.5,RF+3.6,-39.6,-22.3,RF+3.7,-39.2,'hcSteel',CV)}
  // the bridge to the gym (2F): x 36..42, a parapet and windows each side, a roof; the passage under it
  {const y=3.6;B(36,y-.3,-39.75,42.25,y,-36.75,'hcTerr',{f:{ny:'hcConc'}});for(const z of [-39.75,-36.95]){B(36,y,z,42.25,y+1,z+.2,'hcBrick');pane(36,42.25,z+.1,y+1,y+2.6,3);B(36,y+2.6,z,42.25,y+3.1,z+.2,'hcConc')}
    B(35.9,y+3.1,-40,42.3,y+3.35,-36.5,'hcConc',{f:{ny:'hcCeil'}});lampC(39,-38.25,y+3,6,.5)}
  // ================= the gym =================
  {const gx0=42,gx1=66,gz0=-40,gz1=-10,H=8.6,GW='hcGymW',y=3.6;
    wallX(gx0,gx1,gz0,gz0+.3,0,H,GW,[[50,58,5.2,7.6]],{f:{nz:'hcBrick'}});wallX(gx0,gx1,gz1-.3,gz1,0,H,GW,[[52,56,0,3.2],[44.6,49.6,5.2,7.6],[58.4,63.4,5.2,7.6]],{f:{pz:'hcBrick'}});
    wallZ(gx0,gx0+.3,gz0+.3,gz1-.3,0,H,GW,[[-39.55,-37.05,3.6,5.8],[-26,-23,0,3.2],[-19,-16,0,3.2],[-34,-28,5.2,7.6],[-14,-11,5.2,7.6]],{f:{nx:'hcBrick'}});
    wallZ(gx1-.3,gx1,gz0+.3,gz1-.3,0,H,GW,[[-34,-28,5.2,7.6],[-24,-18,5.2,7.6],[-15,-11,5.2,7.6]],{f:{px:'hcBrick'}});
    B(gx0-.1,H,gz0-.1,gx1+.1,H+.35,gz1+.1,'hcTin',{f:{ny:'hcCeil'}});for(let x=44;x<66;x+=4)B(x-.12,H-.6,gz0+.3,x+.12,H,gz1-.3,'hcSteel',CV);
    // the gallery round three sides at 3.6 (west, north over the stage, east), its railing, a straight flight down at each south end
    B(gx0+.3,y-.25,-39.7,gx0+2.3,y,-16.3,'hcGymF',{f:{ny:'hcSteel'}});B(gx1-2.3,y-.25,-39.7,gx1-.3,y,-16.3,'hcGymF',{f:{ny:'hcSteel'}});B(gx0+2.3,y-.25,-39.7,gx1-2.3,y,-37.7,'hcGymF',{f:{ny:'hcSteel'}});
    rail(gx0+2.3,-37.7,gx0+2.36,-16.3,y,1.05,'hcSteel');rail(gx1-2.36,-37.7,gx1-2.3,-16.3,y,1.05,'hcSteel');rail(gx0+2.3,-37.76,gx1-2.3,-37.7,y,1.05,'hcSteel');
    for(const z of [-34,-28,-22])for(const x of [gx0+2.2,gx1-2.4])B(x,0,z,x+.2,y-.25,z+.2,'hcSteel');
    stairs('z',gx0+.3,gx0+2.3,-10.3,-16.3,0,y,18,'hcGymF',{f:{ny:'hcSteel'}});stairs('z',gx1-2.3,gx1-.3,-10.3,-16.3,0,y,18,'hcGymF',{f:{ny:'hcSteel'}});
    rail(gx0+2.3,-16.3,gx0+2.36,-10.3,0,1,'hcSteel');rail(gx1-2.36,-16.3,gx1-2.3,-10.3,0,1,'hcSteel');
    // the stage at the north end (1.2), steps up at both front corners, the curtain, the banner over it
    B(gx0+2.3,0,-39.7,gx1-2.3,1.2,-33,'hcStage',{f:{py:'hcGymF'}});stairs('z',gx0+2.5,gx0+4.5,-30.6,-33,0,1.2,4,'hcStage',{f:{py:'hcGymF'}});stairs('z',gx1-4.5,gx1-2.5,-30.6,-33,0,1.2,4,'hcStage',{f:{py:'hcGymF'}});
    B(gx0+3,1.2,-39.65,gx0+8,6,-39.4,'hcCurtain',CV);B(gx1-8,1.2,-39.65,gx1-3,6,-39.4,'hcCurtain',CV);B(gx0+3,5.6,-39.65,gx1-3,6.4,-39.3,'hcCurtain',CV);B(48,6.6,-37.6,60,7.8,-37.52,'hcBanner',CV);
    B(51.5,1.2,-38.2,56.5,2.2,-37,'hcStage');// (the lectern table)
    // the court's lines, the hoops hung from the roof at each end, mats stacked by the west wall, the vaulting box, a ball cart
    for(const [x0,z0,x1,z1] of [[45,-31,63,-30.9],[45,-13.1,63,-13],[45,-31,45.1,-13],[62.9,-31,63,-13],[45,-22.05,63,-21.95]])B(x0,.002,z0,x1,.016,z1,'hcLine',CV);
    for(const z of [-30.2,-13.8]){const s=z<-20?1:-1;B(52.8,2.9,z-s*.02,55.2,4.1,z,'hcGlass',CV);B(53.75,3.04,z,54.25,3.08,z+s*.45,'hcSteel',CV);B(53.9,4.1,z-.06,54.1,H,z+.06,'hcSteel',CV)}
    B(gx0+2.6,0,-26.6,gx0+4.6,.6,-24.6,'hcMat',{f:{py:'hcMat'}});B(gx0+2.6,.6,-26.4,gx0+4.6,1.2,-24.8,'hcMat',{f:{py:'hcMat'}});B(gx1-4.6,0,-20.6,gx1-2.6,.6,-18.6,'hcMat',{f:{py:'hcMat'}});
    for(const [y0,y1,w] of [[0,.3,1.2],[.3,.6,1.1],[.6,.9,1],[.9,1.2,.9]])B(58-w,y0,-25.6,58+w*.4,y1,-24.4,'hcStage',{f:{py:'hcMat'}});
    B(48,0,-17.4,49.2,.9,-16.6,'hcBalls',{f:{py:'hcBalls'}});for(const [x,z] of [[47.96,-17.44],[49.16,-17.44],[47.96,-16.64],[49.16,-16.64]])B(x,0,z,x+.05,.96,z+.05,'hcSteel',CV);
    for(const [lx,lz] of [[48.5,-27],[59.5,-16],[54,-24]])LIGHT(lx,H-1.2,lz,'#f4f4ff',15,.54);for(const [lx,lz] of [[50,-21],[58,-31]])LIGHT(lx,H-1.2,lz,'#f4f4ff',13,.44);
    LIGHT(54,3.2,-36,'#ffe8c8',8,.5);B(gx0-.04,3.4,-25.4,gx0-.01,3.9,-23.6,'hcSignG',CV)}
  // ================= the cafeteria (west) and its roof up a steel stair; the bike shed =================
  {const x0=-48,x1=-38,z0=-20,z1=-2,H=4.2;
    wallZ(x1-T,x1,z0,z1,0,H,BR,[[-16.4,-14.4,0,2.4],[-8.4,-6.4,0,2.4],[-19.4,-17.4,1,2.6],[-12.4,-10.4,1,2.6],[-4.6,-2.6,1,2.6]],{f:{nx:WI}});
    wallZ(x0,x0+T,z0,z1,0,H,BR,[],{f:{px:WI}});wallX(x0,x1,z0,z0+T,0,H,BR,[[-46,-40,1,2.6]],{f:{pz:WI}});wallX(x0,x1,z1-T,z1,0,H,BR,[[-46,-41,1,2.6]],{f:{nz:WI}});
    for(const [a,b] of [[-19.4,-17.4],[-12.4,-10.4],[-4.6,-2.6]])paneZ(a,b,x1-T/2,1,2.6,1);pane(-46,-40,z0+T/2,1,2.6,3);pane(-46,-41,z1-T/2,1,2.6,3);
    B(x0,-.01,z0,x1,.01,z1,'hcCafeF',CV);B(x0,H,z0,x1,H+.3,z1,'hcConc',{f:{ny:'hcCeil'}});B(x0,H+.3,z0,-47.6,H+1.1,z0+.2,'hcConc');B(-45.4,H+.3,z0,x1,H+1.1,z0+.2,'hcConc');B(x0,H+.3,z1-.2,x1,H+1.1,z1,'hcConc');
    B(x0,H+.3,z0+.2,x0+.2,H+1.1,z1-.2,'hcConc');B(x1-.2,H+.3,z0+.2,x1,H+1.1,z1-.2,'hcConc');// (a gap in the north parapet at the stair's head)
    B(x0+T,0,z0+1.5,x0+1.5,1,z1-1.5,'hcCounter',{f:{py:'hcCounter'}});B(x0+T,1.8,-13,x0+T+.04,2.6,-9,'hcNotice',CV);
    for(const tz of [-16.2,-11,-5.8]){const tx=-42.4;B(tx-.6,0,tz-1.8,tx+.6,.76,tz+1.8,'hcDesk',{f:{py:'hcDesk'}});for(const s of [-1,1])B(tx+s*.95-.2,0,tz-1.7,tx+s*.95+.2,.45,tz+1.7,'hcSteel')}
    lampC(-43,-15,H-.1,8,.55);lampC(-43,-6,H-.1,8,.55);B(x1+.02,2.5,-15.9,x1+.05,2.9,-14.9,'hcSignC',CV);
    // the steel stair up its north wall to the roof (rising west), a landing at its head by the gap in the parapet
    tst('x',-21.7,-20.1,-38.4,-45.2,0,H+.3,15,'hcSteel');hrail('x',-21.76,-21.7,-38.4,-45.2,0,H+.3,15);B(-47.6,H+.15,-21.7,-45.2,H+.3,-20.1,'hcSteel',{f:{py:'hcSteel'}});rail(-47.6,-21.76,-45.2,-21.7,H+.3,1,'hcSteel');
    // the bike shed: a roof on posts, racks and bikes
    B(-48,2.5,6,-40,2.65,18,'hcTin',{f:{ny:'hcSteel'}});for(const [x,z] of [[-47.8,6.2],[-40.2,6.2],[-47.8,17.8],[-40.2,17.8],[-40.2,12]])B(x-.1,0,z-.1,x+.1,2.5,z+.1,'hcSteel');
    for(let z=7.5;z<17.5;z+=1.2){B(-46.6,0,z-.05,-44.8,.7,z+.05,'hcSteel');B(-46.9,.35,z-.3,-44.5,.95,z-.25,'hcSteel',CV);B(-47,.1,z-.32,-46.4,.7,z-.24,'hcSteel',CV);B(-45,.1,z-.32,-44.4,.7,z-.24,'hcSteel',CV)}}
  // ================= the yard =================
  // the podium (구령대) in front of the main building: steps up each side, its canopy on four posts, the flag poles beside it
  {const x0=-16,x1=-8,z0=-26.4,z1=-22.2,h=1.3;B(x0,0,z0,x1,h,z1,'hcConc',{f:{py:'hcTerr'}});stairs('x',z0+.3,z1-.3,x1+2,x1,0,h,5,'hcConc',{f:{py:'hcTerr'}});stairs('x',z0+.3,z1-.3,x0-2,x0,0,h,5,'hcConc',{f:{py:'hcTerr'}});
    for(const [x,z] of [[x0+.2,z0+.2],[x1-.4,z0+.2],[x0+.2,z1-.4],[x1-.4,z1-.4]])B(x,h,z,x+.2,h+3,z+.2,'hcSteel');B(x0-.4,h+3,z0-.3,x1+.4,h+3.2,z1+.6,'hcTin',{f:{ny:'hcSteel'}});
    B(x0+1,h,z0+.3,x1-1,h+1.1,z0+.8,'hcStage');B(x0+2.5,h,z1-.04,x1-2.5,h+.5,z1,'hcPlaque',CV);
    for(const [x,c] of [[-19.6,'hcFlag'],[-21,'hcBanner']]){B(x-.06,0,-24.6,x+.06,10,-24.48,'hcSteel');B(x+.06,8.6,-24.56,x+1.5,9.6,-24.52,c,CV)}B(-21.6,0,-25.2,-19,.3,-23.9,'hcConc')}
  // the stands (스탠드) east of it: three concrete tiers stepping up to the building's front
  {for(const [z0,z1,h] of [[-23.4,-22,.45],[-24.8,-23.4,.9],[-26.2,-24.8,1.35]])B(8,0,z0,30,h,z1,'hcConc',{stair:1,f:{py:'hcConc'}})}
  // the water troughs (수돗가) on the west edge, the goals, the score board, the festival's tents and what was left about
  {B(-33.4,0,-6,-32.4,.8,4,'hcConc',{f:{py:'hcTerr'}});for(let z=-5.4;z<4;z+=1.2)B(-32.5,.8,z-.03,-32.36,1.05,z+.03,'hcSteel',CV);B(-33.6,.8,-6,-33.4,1.6,4,'hcConc')}
  for(const sx of [-1,1]){const gx=sx*30.5;for(const z of [-3.66,3.66])B(gx-.06,0,z-.06,gx+.06,2.44,z+.06,'hcSteel');B(gx-.06,2.38,-3.66,gx+.06,2.5,3.66,'hcSteel');
    B(gx+sx*1.5-.03,0,-3.66,gx+sx*1.5+.03,1.4,3.66,'hcNet',PS);for(const z of [-3.66,3.66])B(gx,0,z-.02,gx+sx*1.5,2.44,z+.02,'hcNet',PS);B(Math.min(gx,gx+sx*1.5),2.42,-3.66,Math.max(gx,gx+sx*1.5),2.46,3.66,'hcNet',CV)}
  {B(-3,0,-19.2,3,.25,-18.8,'hcSteel');B(-2.8,.25,-19.1,2.8,2.6,-18.9,'hcScore',{f:{nz:'hcScore'}});for(const x of [-2.9,2.7])B(x,0,-19.3,x+.2,2.6,-18.7,'hcSteel')}
  const tent=(x0,x1,z0,z1,m)=>{const h=2.7;for(const x of [x0,(x0+x1)/2,x1])for(const z of [z0,z1])B(x-.05,0,z-.05,x+.05,h,z+.05,'hcSteel');B(x0-.2,h,z0-.25,x1+.2,h+.12,z1+.25,m,{f:{ny:m}});
    B(x0-.2,h-.35,z0-.25,x1+.2,h,z0-.2,m,CV);for(let k=0;k<3;k++){const tx=x0+1.2+k*((x1-x0-2.4)/2);B(tx-.9,0,(z0+z1)/2-.35,tx+.9,.72,(z0+z1)/2+.35,'hcDesk',{f:{py:'hcDesk'}});chair(tx-.4,(z0+z1)/2-.75,0,-1);chair(tx+.4,(z0+z1)/2-.75,0,-1)}};
  tent(-26,-18,16.5,20.5,'hcTent');tent(-4,4,16.5,20.5,'hcTentB');tent(18,26,16.5,20.5,'hcTent');
  for(const [x,z] of [[-12,-6],[-12,-2],[-12,2],[-12,6]]){B(x-.04,0,z-.6,x+.04,.92,z-.54,'hcSteel');B(x-.04,0,z+.54,x+.04,.92,z+.6,'hcSteel');B(x-.05,.78,z-.6,x+.05,.92,z+.6,'hcScore')}
  for(const [x,z] of [[10,10],[12,8],[-8,12]]){B(x-.2,0,z-.2,x+.2,.04,z+.2,'hcRubber',CV);B(x-.12,.04,z-.12,x+.12,.32,z+.12,'hcRubber',CV)}
  // the track (its lanes' lines are a picture the mesh pass lays): the start line across each straight
  B(-.06,.002,9.2,.06,.03,14,'hcLine',CV);B(-.06,.002,-14,.06,.03,-9.2,'hcLine',CV);
  // the pull-up bars and the sand pit in the south strip; benches; cherry trees round everything
  {B(14,0,24,24,.12,30,'hcSand',{f:{py:'hcSand'}});for(const [x,h] of [[26,1.6],[27.4,1.9],[28.8,2.2]]){B(x-.05,0,26,x+.05,h,26.1,'hcSteel');B(x-.05,0,28.4,x+.05,h,28.5,'hcSteel');B(x-.03,h-.06,26,x+.03,h,28.5,'hcSteel',CV)}
    for(const x of [-28,-16,-4,8,20])B(x-1.1,0,23.2,x+1.1,.45,23.8,'hcDesk',{f:{py:'hcDesk'}})}
  for(let x=-46;x<=40;x+=6.5){if(Math.abs(x)<6||(x>4&&x<11.5))continue;tree(x+sr(-.5,.5),31.6+sr(-.4,.3),1+sr(-.1,.15))}
  for(let z=-44;z<=28;z+=7){if((z>-22&&z<0)||(z>4&&z<20))continue;tree(-48.6+sr(-.15,.15),z+sr(-.5,.5),1+sr(-.1,.12))}
  for(const [x,z,s] of [[-30,-24.5,1.1],[-24,-24.5,1],[34.8,-19,1],[35,-12,1.05],[35,5,1],[-35.5,-14,1],[-35.5,10,1.1],[38,-44.5,.95],[-40,-44.5,1],[-28,-44.5,1.05],[-44,-26,1.1],[-40,-30,.95],[38.5,15,1],[38.5,26,1.1]])tree(x,z,s);
  // ================= the north alley: the recycling shed, the boiler house; the guard booth at the gate; the car park and the court =================
  {B(-20,2.3,-47.4,-12,2.45,-43.6,'hcTin',{f:{ny:'hcSteel'}});for(const [x,z] of [[-19.9,-47.3],[-12.2,-47.3],[-19.9,-43.7],[-12.2,-43.7]])B(x,0,z,x+.12,2.3,z+.12,'hcSteel');
    for(const [x,c] of [[-18.6,'hcCarN'],[-16.8,'hcCarS'],[-15,'hcCarB'],[-13.2,'hcCarW']])B(x-.8,0,-47,x+.8,1.1,-45.4,c);
    wallX(12,20,-47.6,-47.4,0,3.4,BR,[]);wallX(12,20,-42.2,-42,0,3.4,BR,[[14,16,0,2.3]]);wallZ(12,12.2,-47.4,-42.2,0,3.4,BR,[]);wallZ(19.8,20,-47.4,-42.2,0,3.4,BR,[]);B(11.9,3.4,-47.7,20.1,3.6,-41.9,'hcConc');
    B(12.5,0,-47,15,1.6,-45,'hcTank');B(16.6,0,-47,19.4,2,-45.4,'hcSteel');LIGHT(16,3,-44.5,'#ffd8a0',6,.45)}
  {const x0=6,x1=10,z0=28,z1=32;wallX(x0,x1,z0,z0+.2,0,2.7,'hcConc',[[7,9,1,2]],{f:{pz:WI}});wallX(x0,x1,z1-.2,z1,0,2.7,'hcConc',[],{f:{nz:WI}});wallZ(x0,x0+.2,z0,z1,0,2.7,'hcConc',[[29,31,0,2.2]],{f:{px:WI}});
    wallZ(x1-.2,x1,z0,z1,0,2.7,'hcConc',[[29.2,30.8,1,2]],{f:{nx:WI}});pane(7,9,z0+.1,1,2,1);paneZ(29.2,30.8,x1-.1,1,2,1);B(x0-.2,2.7,z0-.2,x1+.2,2.9,z1+.2,'hcConc',{f:{ny:'hcCeil'}});
    B(8.4,0,30.6,9.7,.78,31.7,'hcDesk');B(8.6,.78,30.9,9.4,1.2,31.4,'hcTV',CV);LIGHT(8,2.3,30,'#ffe8c0',4,.45)}
  {const cars=[[44,-6.5,48.6,-4.6,'hcCarW'],[52.5,-6.5,57.1,-4.6,'hcCarS'],[60.6,-6.5,65.2,-4.6,'hcCarB'],[44,4.6,48.6,6.5,'hcCarN'],[49,4.6,53.6,6.5,'hcCarS'],[61,4.6,65.6,6.5,'hcCarW']];
    for(const [x0,z0,x1,z1,m] of cars)car(x0,z0,x1,z1,m);
    // the court's fence (gaps at both ends), its hoops
    for(const [x0,x1] of [[42,52],[56,66]]){fenceX(x0,x1,13,2.8);fenceX(x0,x1,33.6,2.8)}fenceZ(13,20,42,2.8);fenceZ(25,33.6,42,2.8);fenceZ(13,33.6,66,2.8);
    for(const z of [15.5,31]){B(53.8,0,z-.1,54.2,3.4,z+.1,'hcSteel');B(53,2.9,z+(z<20?.3:-.4),55,4.1,z+(z<20?.4:-.3),'hcGlass',CV)}
    for(const [x0,z0,x1,z1] of [[45,16,63,16.1],[45,29.9,63,30],[45,16,45.1,30],[62.9,16,63,30],[45,22.95,63,23.05]])B(x0,.002,z0,x1,.016,z1,'hcLine',CV);
    for(const [x,z] of [[44,0],[56,0],[66,-8]])lamp(x,z,6,'#ffd8a8')}
  // the PE shed between the yard and the gym; lamps round the yard
  {B(35.2,0,-8,41,2.6,-2,'hcTin');B(35.1,2.6,-8.1,41.1,2.75,-1.9,'hcConc');B(35.18,0,-6.2,35.22,2.2,-3.8,'hcGate',CV)}
  for(const [x,z] of [[-34.5,-21.5],[34.5,-21.5],[-34.5,21.5],[34.5,21.5],[0,22.4]])lamp(x,z,7.5,'#ffe0b8');
  // ================= who starts where =================
  MAP.spawns=[];for(const z of [-17,-14])for(let i=0;i<8;i++)MAP.spawns.push([-10.5+i*3+rr(-.2,.2),z+rr(-.2,.2),0,rr(-.4,.4)]);
  MAP.zspawns=[[-46,-45,0],[-30,-45,0],[0,-45,0],[26,-45,0],[50,-45,0],[64,-45,0],[-46,-26,0],[-46,24,0],[-30,30,0],[0,30.5,0],[24,31,0],[40,31,0],[64,29,0],[64,9,0],[40,-25,0],[-44,2,0]];
  MAP.camps=[
    {k:'roof',w:.14,p:[[-27,RF,-33.5],[-26,RF,-29.6],[-19.5,RF,-29.6],[-17,RF,-36.4]],look:[-29.9,11.5,-38]},
    {k:'roofE',w:.1,p:[[24,RF,-33],[27,RF,-29.6],[16,RF,-29.6]],look:[29.9,11.5,-38]},
    {k:'tank',w:.06,p:[[-12.8,RF+1.2,-35.6],[-9,RF+1.2,-35.6]],look:[-24,11,-30]},
    {k:'stage',w:.12,p:[[48,1.2,-35.2],[54,1.2,-34.4],[60,1.2,-35.2]],look:[54,1,-18]},
    {k:'gallery',w:.1,p:[[43.3,3.6,-32],[43.3,3.6,-24],[64.7,3.6,-28],[54,3.6,-38.7]],look:[54,1,-22]},
    {k:'barricade',w:.1,p:[[-20.8,F[2],-29.2],[-17.6,F[2],-29.2],[-15.6,F[2],-30.6]],look:[-20,8,-36]},
    {k:'lab',w:.05,p:[[13.8,0,-29.2],[20.8,0,-35.8]],look:[7,1,-37]},
    {k:'podium',w:.06,p:[[-14,1.3,-24.2],[-10,1.3,-24.2]],look:[-12,1,-10]},
    {k:'stands',w:.05,p:[[12,1.35,-25.4],[20,1.35,-25.4],[27,1.35,-25.4]],look:[18,1,-8]},
    {k:'cafeRoof',w:.07,p:[[-46.6,4.5,-18.4],[-46.6,4.5,-3.4],[-39.6,4.5,-11]],look:[-30,1,-10]},
    {k:'bridge',w:.05,p:[[38.2,3.6,-38.2],[40.4,3.6,-38.2]],look:[30,4,-38]},
    {k:'guard',w:.03,p:[[7.2,0,30.8]],look:[0,1,26]},
  ];
  MAP.spawnYaw=null;
  // a spring evening: the sun low in the west-south-west, warm; long shadows to the east
  MAP.moon={d:new THREE.Vector3(-.8,.4,.45).normalize(),c:new THREE.Color('#ffc89a'),i:1.32};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.03);cam.position.set(-2+a*12,9+Math.sin(t*.05)*.5,18);cam.lookAt(4+a*6,3,-34)}}
// the ground beyond the wall: the town's streets at the school's level, then rising to the hills (behind the school, north, the most)
function hcOut(x,z){return Math.max(-50.5-x,x-68.5,-48.5-z,z-34.5)}
function hcGround(x,z){const e=hcOut(x,z);if(e<-.01)return -14;const f=clamp((e-18)/90,0,1),n=clamp((-60-z)/40,0,1);return -.05+f*f*30+n*10+Math.max(0,fbm(x/50,z/50,15601,4,0)-.35)*40*f}
// ---------- the meshes boxes cannot make: the cherry trees, the track's lines, the town and the hills ----------
function hcMesh(scene){const D=(MAP.moon&&MAP.moon.d)||new THREE.Vector3(0,1,0),K=meshKit(scene),{acc,add,mk,lit}=K,probeAt=sunProbe(D);
  const sunK=(nx,ny,nz)=>Math.max(0,nx*D.x+ny*D.y+nz*D.z);
  // the cherry trees: a crooked trunk, three or four limbs, a crown of blossom clouds, each lit from a look beside it
  {const T=acc(),L=acc();for(const [x,y,z,s] of HCS.trees){const Lc=probeAt(x,y+4.2*s,z,1.6*s),Lt=probeAt(x,y+1.4*s,z,.6*s),seed=Math.round(x*13+z*7);
      const lf=(Lb,k0)=>(px,py,pz,nx,ny,nz)=>{const k=k0*(.66+.5*sunK(nx,ny,nz)+.08*ny);return [Lb[0]*k,Lb[1]*k,Lb[2]*k]};
      const tg=new THREE.CylinderGeometry(.13*s,.22*s,3.2*s,7);tg.translate(x,y+1.6*s,z);add(T,tg,1,2,lf(Lt,.8));
      for(let i=0;i<4;i++){const a=hash2(seed,i,15701)*TAU,len=(1.6+hash2(seed,i+9,15702))*s,ty=y+(2.4+hash2(seed,i+4,15703)*.8)*s;
        const lg=new THREE.CylinderGeometry(.05*s,.1*s,len,5);lg.translate(0,len/2,0);lg.rotateZ(-.9);lg.rotateY(a);lg.translate(x,ty,z);add(T,lg,1,1,lf(Lt,.85))}
      for(let i=0;i<7;i++){const a=hash2(seed,i+20,15704)*TAU,r=(i?1.3+hash2(seed,i+30,15705)*.9:0)*s,cs=(1.15+hash2(seed,i+40,15706)*.6)*s,cy=y+(3.7+hash2(seed,i+50,15707)*1.1)*s-(i?0:-.4*s);
        const g=new THREE.IcosahedronGeometry(cs,1),p=g.attributes.position;for(let k=0;k<p.count;k++){const vx=p.getX(k),vy=p.getY(k),vz=p.getZ(k),j=.8+hash2(Math.round(vx*9+seed),Math.round(vy*9+vz*5+i),15708)*.35;p.setXYZ(k,vx*j,vy*j*.78,vz*j)}
        g.computeVertexNormals();g.translate(x+Math.cos(a)*r,cy,z+Math.sin(a)*r);add(L,g,1.6,1.6,lf(Lc,.72+i*.02))}}
    if(T.P.length){mk(T,'hcBark');mk(L,'hcBloom')}}
  // the track: its five lanes' lines painted on a picture of a quarter of the oval, laid four times mirrored just over the yard (thin lines
  // made as geometry break up into dashes a few tens of metres off; a picture's mipmaps fade them instead); lit per 2 m cell
  {const A=acc(),QX=32.2,QZ=14.2,NX=16,NZ=7,LC=new Map(),litc=(x,y,z,nx,ny,nz)=>{const k=Math.round(x*10)+','+Math.round(z*10);let c=LC.get(k);if(!c){c=lit(x,y,z,nx,ny,nz);LC.set(k,c)}return c};
    const pos=[],uv=[],V=(xq,zq,sx,sz)=>{pos.push(sx*xq,.012,sz*zq);uv.push(xq/QX,zq/QZ)};
    for(const sx of [-1,1])for(const sz of [-1,1])for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){const x0=i/NX*QX,x1=(i+1)/NX*QX,z0=j/NZ*QZ,z1=(j+1)/NZ*QZ;
      // (two triangles facing up: a mirrored quarter turns their winding round)
      const up=sx*sz>0;for(const t of [[[x0,z0],[x1,z1],[x1,z0]],[[x0,z0],[x0,z1],[x1,z1]]]){const q=up?t:[t[0],t[2],t[1]];for(const [a,b] of q)V(a,b,sx,sz)}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    const nr=new Float32Array(pos.length);for(let k=1;k<nr.length;k+=3)nr[k]=1;g.setAttribute('normal',new THREE.BufferAttribute(nr,3));add(A,g,1,1,litc);
    const m=mk(A,'hcTrack');m.material.polygonOffset=true;m.material.polygonOffsetFactor=-1;m.material.polygonOffsetUnits=-4}
  barMeshes(HCS.bars,D,K,probeAt);
  // the town: blocks of flats beyond the walls (west, east, south), the hills and their pines behind the school
  {const A=acc(),A0=MAP.ambOut||new THREE.Color('#8a7c80'),SC=MAP.moon.c,SI=MAP.moon.i;const blk=(x0,z0,x1,z1,h)=>{const box=(a0,b0,a1,b1,y0,y1)=>{const g=new THREE.BoxGeometry(a1-a0,y1-y0,b1-b0);g.translate((a0+a1)/2,(y0+y1)/2,(b0+b1)/2);
        // (world-space uvs, 16.8 m to the picture: six storeys, four flats across; the windows run on round the corners)
        const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i))>.5,ay=Math.abs(n.getY(i))>.5;u.setXY(i,(ax?p.getZ(i):p.getX(i))/16.8,(ay?p.getZ(i):p.getY(i)+.05)/16.8)}
        add(A,g,1,1,(px,py,pz,nx,ny,nz)=>{const l=sunK(nx,ny,nz),k=ny>.5?.7:1;return [(A0.r*.8+SC.r*SI*l*.62)*k,(A0.g*.8+SC.g*SI*l*.62)*k,(A0.b*.8+SC.b*SI*l*.62)*k]})};
      box(x0,z0,x1,z1,-.05,h);const cx=(x0+x1)/2,cz=(z0+z1)/2;box(cx-2.2,cz-1.6,cx+2.2,cz+1.6,h,h+2.6)};
    for(let i=0;i<7;i++){blk(-96+i*24,52+hash2(i,1,15711)*14,-82+i*24,62+hash2(i,1,15711)*14,16+hash2(i,2,15712)*22)}
    for(let i=0;i<4;i++){blk(-92+hash2(i,3,15713)*8,-30+i*22,-80+hash2(i,3,15713)*8,-18+i*22,14+hash2(i,4,15714)*16);blk(88+hash2(i,5,15715)*8,-30+i*22,100+hash2(i,5,15715)*8,-18+i*22,14+hash2(i,6,15716)*20)}
    if(A.P.length)mk(A,'hcHouse')}
  forestMesh(K,hcGround,hcOut,D,'hcPine',{seed:15801,e0:30,e1:120});
  hillMesh(scene,hcGround,'hcHill',D,4.8,81,-4.8*40+9)}
// petals drifting down round the cherry trees near the camera (every page, for the look)
function hcPetalTick(dt){if(MAP.id!=='school'||!R.cam||!HCS.trees.length)return;const c=R.cam.position;HCS.acc=(HCS.acc||0)+dt*26;
  while(HCS.acc>=1){HCS.acc--;const t=HCS.trees[(Math.random()*HCS.trees.length)|0];if(Math.hypot(t[0]-c.x,t[2]-c.z)>34)continue;const a=Math.random()*TAU,r=Math.random()*2.6*t[3];
    FX.spawn({x:t[0]+Math.cos(a)*r,y:t[1]+(3+Math.random()*2)*t[3],z:t[2]+Math.sin(a)*r,vx:rr(.2,.7),vy:rr(-.3,-.1),vz:rr(-.25,.35),life:rr(3.5,5.5),s0:rr(.035,.05),s1:.03,r:1,g:rr(.8,.88),b:rr(.86,.92),a:.92,f:4,drag:.6,grav:.12})}}
{const nu=nyUpdate;nyUpdate=function(dt){nu(dt);try{hcPetalTick(dt)}catch(e){console.error(e)}}}
MAPDEFS.school={n:['새봄고등학교','Saebom High School'],gside:'hcConc',d:['체육대회 날 저녁, 텅 빈 새봄고등학교. 벚꽃 흩날리는 운동장엔 천막과 장애물이 그대로, 3층 본관(교실 · 교무실 · 과학실 · 도서실, 가운데 가위 계단, 양 끝 계단으로 옥상 물탱크까지), 무대와 2층 회랑이 있는 체육관과 그리로 이어진 구름다리, 급식실 옥상, 구령대와 스탠드.',
    'Saebom High School on the evening of its sports festival, emptied: the tents and hurdles still out on a yard under falling cherry blossom; the three-storey main building (classrooms, the teachers’ room, the lab, the library, a scissor stair in the middle and a stair at each end up to the water tank on the roof); the gym with its stage and gallery and the covered bridge to it; the cafeteria roof, the podium, the stands.'],
  env:{sky:1,sun:1,skyTex:'hcSky',halo:'#ffc8a8',rain:0,storm:0,fog:'#b8a4ac',fogD:.0068,bloomThr:.86,ambOut:'#8a7c86',ambIn:'#3e383c',boAmb:.55},
  bounds:[-51,-49,69,35],probeY:[.9,2.4,4.5,6,8.1,9.6,11.7,12.8],mini:[3,6.6,10.2],miniName:['1F','2F','3F','RF'],tex:bakeSchoolTex,build:buildSchool,mesh:hcMesh};

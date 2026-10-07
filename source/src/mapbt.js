'use strict';
// ============ Map "빅트리 Big Tree": an overgrown castle ruin around one enormous old tree ============
// Three levels. Ground (y 0): the long west gallery with its arcade and cloister, the sunken lower courtyard, the ruined
// chambers along the south wall and a dry pool (y -1.4). Terrace (y 3): the grassy upper courtyard in the north half, the
// rampart walk over the gallery and the broad grey stair down the east side. High (y 6.5–8.2): the wooden deck round the
// trunk of the big tree and the roof of the keep against the north wall. The canopy (y 10–17.5) shades the terrace.
// Every texture is painted on first load.
Object.assign(MATS,{
  btStone:{t:'btStone',s:3,k:'stone'},btFlag:{t:'btFlag',s:4,k:'stone'},btGrass:{t:'btGrass',s:4,k:'soft'},btStep:{t:'btStep',s:2,k:'stone'},
  btBark:{t:'btBark',s:2.4,k:'wood'},btLeaf:{t:'btLeaf',s:3,k:'soft'},btIvy:{t:'btIvy',uv:'box',k:'soft'},btWood:{t:'btWood',s:2,k:'wood'},
  btArch:{t:'btArch',uv:'box',k:'stone'},btMud:{t:'btMud',s:3,k:'soft'},btDirt:{t:'btDirt',s:3,k:'soft'},btMoss:{t:'btMoss',s:2,k:'stone'},
});
// ---------- textures ----------
// castle wall: coursed blocks, dark joints, moss creeping over the faces
function texBtStone(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++){const row=y>>5,ry=y&31,off=(row*37)%64;
  for(let x=0;x<N;x++){const xx=(x+off)%N,bx=xx>>6,rx=xx&63,id=row*11+bx;
    let t=.5+(hash2(id,1,1101)-.5)*.32+(P.n(x,y,24,1102,3)-.5)*.25+(hash2(x,y,1103)-.5)*.08;if(ry<3||rx<3)t-=.36;else if(ry<5||rx<5)t+=.06;
    let c=dith(P,x,y,clamp(t,0,1),['#24241e','#38372f','#4e4c42','#646152','#7a7564','#8e8874'],.1);
    const m=P.n(x,y,40,1104,3)+(1-y/N)*.06;if(m>.55)c=mix(c,m>.64?'#2e4a1a':'#45632a',clamp((m-.55)*6,0,.85));P.set(x,y,c)}}
  for(let i=0;i<16;i++)streak(P,Math.floor(hash2(i,1,1105)*N),Math.floor(hash2(i,2,1105)*N*.6),50+Math.floor(hash2(i,3,1105)*120),.16,2)})}
// courtyard flagstones: big slabs, grass and soil in the joints, the odd crack
function texBtFlag(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=y>>6,gx=(x+(r&1)*32)%N,cx=gx>>6,lx=gx&63,ly=y&63,id=r*7+cx;
  const e=Math.min(lx,ly,63-lx,63-ly);let c;
  if(e<3){const g=P.n(x,y,8,1111,2);c=g>.45?dith(P,x,y,g,['#2a3a16','#3a5020','#4a6428'],.12):dith(P,x,y,g,['#2a2218','#3a2e20'],.1)}
  else{let t=.52+(hash2(id,1,1112)-.5)*.28+(P.n(x,y,20,1113,3)-.5)*.22+(hash2(x,y,1114)-.5)*.07;c=dith(P,x,y,t,['#3c3a32','#4e4b40','#605c4e','#726c5c','#847e6a'],.09);
    const m=P.n(x,y,28,1115,3);if(m>.6)c=mix(c,'#4a6228',clamp((m-.6)*5,0,.7));if(Math.abs((lx-ly)+(hash2(id,2,1116)-.5)*40)<1&&hash2(id,3,1116)<.4)c=dk(c,.35)}
  P.set(x,y,c)}})}
// upper courtyard: long grass, bare earth patches, a few buried slabs, wild flowers
function texBtGrass(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,1121,4),b=P.n(x,y,64,1122,3);
  let c=dith(P,x,y,.45+(n-.5)*.7+(hash2(x,y,1123)-.5)*.18,['#1e2e10','#2a3e16','#36501c','#426224','#50742c','#5e8434'],.14);
  if(b>.63)c=mix(c,dith(P,x,y,.5+(n-.5)*.4,['#3a2e1e','#4a3c28','#5a4a32'],.1),clamp((b-.63)*7,0,1));
  if(b<.3){const lx=x&63,ly=y&63;if(lx>4&&ly>4&&lx<60&&ly<60)c=mix(c,'#6a665a',clamp((.3-b)*6,0,.75))}
  if(hash2(x,y,1124)<.004)c=rpickH(x*7+y,['#e8e0a0','#d8a0c0','#f0f0f0','#e8c050']);P.set(x,y,c)}})}
// grey stone stair treads: pale blocks with a dark nosing line
function texBtStep(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++){const ry=y&31,off=((y>>5)*23)%48;for(let x=0;x<N;x++){const rx=(x+off)%48,id=(y>>5)*9+Math.floor((x+off)/48);
  let t=.55+(hash2(id,1,1131)-.5)*.2+(P.n(x,y,16,1132,2)-.5)*.2+(hash2(x,y,1133)-.5)*.06;if(ry<2||rx<2)t-=.35;else if(ry>28)t-=.15;
  let c=dith(P,x,y,clamp(t,0,1),['#4a4a46','#5e5e58','#72726a','#86867c','#9a998e'],.08);if(P.n(x,y,12,1134,2)>.66)c=mix(c,'#4e6a2c',.6);P.set(x,y,c)}}})}
// the old tree's bark: deep vertical furrows, moss on the north side
function texBtBark(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin(x*.32+P.n(x,y,10,1141,3)*7)*.5+.5;
  let c=dith(P,x,y,.25+w*.55+(hash2(x,y,1142)-.5)*.12,['#1e150e','#2c2016','#3c2c1e','#4c3a28','#5c4832','#6c563c'],.1);
  if(w<.2)c=dk(c,.3);const m=P.n(x,y,24,1143,3);if(m>.58&&x<48)c=mix(c,'#3e5a22',clamp((m-.58)*5,0,.8));P.set(x,y,c)}})}
// canopy: clusters of leaves in many greens, sunlit tips, a few gaps of sky
function texBtLeaf(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,8,1151);const g=P.n(x,y,24,1152,3);
  if(f1>5.6&&hash2(id,3,1153)<.5){P.alpha(x,y,0);continue}
  let c=mix(rpickH(id,['#1a3210','#224016','#2c4e1a','#365c20','#406a26']),'#0e1c08',clamp(f1/6,0,1)*.7);if(g>.6)c=lt(c,.12);if(hash2(id,2,1154)<.12&&f1<2.5)c='#7aa848';P.set(x,y,c)}})}
// ivy hanging down a wall: dense at the top, thinning out, cut out where there are no leaves
function texBtIvy(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){const dens=1-y/128*.85;const [f1,,id]=cellN(P,x,y,6,1161);
  const keep=hash2(id,1,1162)<dens*(.5+.5*P.n(x,y,16,1163,2));if(!keep||f1>4){P.alpha(x,y,0);continue}
  let c=mix('#5a8a34','#1a3410',clamp(f1/4,0,1));if(hash2(id,2,1162)<.3)c=lt(c,.1);P.set(x,y,c)}})}
// weathered planks
function texBtWood(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++){const b=y>>4,ry=y&15;for(let x=0;x<N;x++){const id=b*13+((x+b*29)>>6);
  let t=.5+(hash2(id,1,1171)-.5)*.25+Math.sin(x*.18+P.n(x,y,8,1172,2)*5)*.1+(hash2(x,y,1173)-.5)*.08;if(ry<1)t-=.4;
  let c=dith(P,x,y,clamp(t,0,1),['#2e2216','#40301e','#544028','#665036','#78624a'],.1);c=mix(c,'#6a6a62',.18);if(((x+b*29)&63)<1)c=dk(c,.4);P.set(x,y,c)}}})}
// the keep's arched window: a dark round-headed opening in a stone frame
function texBtArch(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const row=y>>4,ry=y&15,off=(row*21)%32,rx=(x+off)&31;
  let c=dith(P,x,y,.5+(hash2(row*9+((x+off)>>5),1,1181)-.5)*.3+(hash2(x,y,1182)-.5)*.08-(ry<2||rx<2?.3:0),['#2e2d26','#45433a','#5c594c','#73705f','#8a8574'],.1);
  const dx=x-64,inA=(y>=44&&y<=112&&Math.abs(dx)<=26)||(y<44&&Math.hypot(dx,y-44)<=26),inF=(y>=40&&y<=116&&Math.abs(dx)<=32)||(y<44&&Math.hypot(dx,y-44)<=32);
  if(inA)c=mix('#060605','#16140e',clamp((y-20)/100,0,1));else if(inF)c=dith(P,x,y,.6+(hash2(x,y,1183)-.5)*.1,['#7a7464','#8a8472','#9a9482'],.06);
  if(y>112&&y<120&&Math.abs(dx)<36)c='#9a9482';P.set(x,y,c)}})}
function texBtMud(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,20,1191,3);
  let c=dith(P,x,y,.4+(n-.5)*.6,['#1a160e','#261f14','#32291a','#3e3420'],.12);if(n>.62)c=mix(c,'#3a4a3a',.5);if(n<.32)c=mix(c,'#2a3a20',.6);P.set(x,y,c)}})}
function texBtDirt(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const [f1,,id]=cellN(P,x,y,10,1201);
  let c=f1<3.5&&hash2(id,1,1202)<.45?dith(P,x,y,.5+(hash2(id,2,1202)-.5)*.4,['#4a463c','#5e5a4e','#726c5e'],.08):dith(P,x,y,.45+(P.n(x,y,16,1203,2)-.5)*.5,['#2e2618','#3e3322','#4e412c'],.12);
  P.set(x,y,c)}})}
function texBtMoss(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,dith(P,x,y,.45+(P.n(x,y,12,1211,3)-.5)*.6,['#2a3a18','#3a5020','#4a6428','#5a7430','#6a8238'],.12))})}
function bakeBtTex(){if(TEX.btStone)return;
  TEX.btStone=mkTex(texBtStone());TEX.btFlag=mkTex(texBtFlag());TEX.btGrass=mkTex(texBtGrass());TEX.btStep=mkTex(texBtStep());TEX.btBark=mkTex(texBtBark());
  TEX.btLeaf=mkTex(texBtLeaf());TEX.btIvy=mkTex(texBtIvy(),false);TEX.btWood=mkTex(texBtWood());TEX.btArch=mkTex(texBtArch(),false);TEX.btMud=mkTex(texBtMud());
  TEX.btDirt=mkTex(texBtDirt());TEX.btMoss=mkTex(texBtMoss());
  // the daylight sky and sun belong to Italy's texture set; paint them here too if Italy has not been loaded yet
  if(!TEX.skyDay){TEX.skyDay=mkTex(texSkyDay());TEX.skyDay.wrapT=THREE.ClampToEdgeWrapping;TEX.skyDay.magFilter=THREE.LinearFilter}
  if(!TEX.sunDisc){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['btStone','btFlag','btGrass','btStep','btDirt'])TEX[k].anisotropy=an}
// ---------- the map ----------
function buildBigTree(){const CV={nosolid:true},ST='btStone',GR='btGrass';
  // solid stepped handrail beside a stair flight (keeps climbers on the steps)
  const rail=(axis,c0,c1,a0,a1,y0,y1,n,mat)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1)+1;
    if(axis==='z')B(c0,y0,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat||ST);else B(Math.min(s0,s1),y0,c0,Math.max(s0,s1),top,c1,mat||ST)}};
  const ivy=(x0,y0,z0,x1,y1,z1,face)=>{const f={px:'none',nx:'none',py:'none',ny:'none',pz:'none',nz:'none'};f[face]='btIvy';B(x0,y0,z0,x1,y1,z1,'btIvy',{nosolid:true,f})};
  const brazier=(x,y,z)=>{B(x-.28,y,z-.28,x+.28,y+.85,z+.28,'metal2');B(x-.34,y+.8,z-.34,x+.34,y+.92,z+.34,'metal2',CV);LIGHT(x,y+1.4,z,'#ff9a48',8,1.0);MAP.fires.push([x,y+.95,z])};
  const stump=(x,z,y,h,r)=>{r=r||.5;B(x-r,y,z-r,x+r,y+h,z+r,'btStep');B(x-r-.12,y,z-r-.12,x+r+.12,y+.3,z+r+.12,'btStep')};
  // ================= ground: every walkable floor is a column of stone up from y -4, its top face picks the surface =================
  // [x0,z0,x1,z1,top material,top height]; later entries win
  {const G=[[-56,-37,50,36,'btFlag',0],[-56,15.5,-10,24,'btFlag',0],[-10,26.8,50,36,'btDirt',0],[18,12,36,24,GR,0],[-10,8,0,14,GR,0],
      [-10,-37,38,2,GR,3],[38,-37,50,-8,GR,3],[-56,-2,-10,4,GR,3],[2,12,16,24,'btMud',-1.4]];
    const xs=new Set(),zs=new Set();for(const r of G){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m=null,top=0;
        for(const r of G)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3]){m=r[4];top=r[5]}
        if(run&&m&&run.m===m&&run.top===top)run.x1=X[i+1];else{if(run)B(run.x0,-4,Z[j],run.x1,run.top,Z[j+1],ST,{f:{py:run.m}});run=m?{x0:X[i],x1:X[i+1],m,top}:null}}
      if(run)B(run.x0,-4,Z[j],run.x1,run.top,Z[j+1],ST,{f:{py:run.m}})}}
  // ================= the outer walls: 12 m of masonry all round (nothing to climb out over) =================
  const WH=12;
  B(-12,-4,-39,52,WH,-37,ST);B(50,-4,-37,52,WH,38,ST);B(-12,-4,36,52,WH,38,ST);
  B(-12,-4,-37,-10,WH,-2,ST);B(-12,-4,24,-10,WH,36,ST);// main square west wall either side of the gallery
  B(-58,-4,-4,-10,WH,-2,ST);B(-58,-4,24,-10,WH,26,ST);B(-58,-4,-2,-56,WH,24,ST);// the gallery wing
  // ivy hanging on the inner faces
  for(const [x,w,h] of [[-6,4,8],[14,3,6],[30,5,8],[42,4,7]])ivy(x,WH-h,-36.98,x+w,WH,-36.9,'pz');
  for(const [z,w,h] of [[-30,5,7],[-12,4,6],[16,6,9]])ivy(49.9,WH-h,z,49.98,WH,z+w,'nx');
  for(const [x,w,h] of [[-4,5,8],[22,4,7],[40,5,9]])ivy(x,WH-h,35.9,x+w,WH,35.98,'nz');
  for(const [x,w,h] of [[-50,4,6],[-30,5,7],[-18,3,5]])ivy(x,WH-h,-1.98,x+w,WH,-1.9,'pz');
  // ================= the gallery wing (west): rampart walk over a long hall, an arcade, a covered cloister =================
  // rampart: the north strip is terrace height (y 3); a crenellated parapet looks down into the hall
  for(let x=-53;x<-10.2;x+=2){B(x,3,3.7,Math.min(x+2,-10),3.6,4,ST);B(x,3.6,3.7,Math.min(x+1,-10),4.4,4,ST)}
  // the stair up to the rampart at the west end, a landing, solid rails
  stairs('x',4.1,6.5,-46,-53,0,3,9,'btStep');B(-56,0,4,-53,3,6.5,ST,{f:{py:'btStep'}});rail('x',6.5,6.62,-46,-53,0,3,9);
  B(-56,0,6.5,-52,.5,13.5,'btStep');B(-55.5,.5,9,-54.4,1.5,11,ST);brazier(-53.2,.5,7.4);brazier(-53.2,.5,12.6);// chapel dais and altar
  // the arcade: four round-headed arches between the hall and the cloister
  const ARC=[[-50,-46.4],[-40,-36.4],[-30,-26.4],[-20,-16.4]];
  wallX(-56,-10,14,15.5,0,5.2,ST,ARC.map(([a,b])=>[a,b,0,3.4]));
  for(const [a,b] of ARC){B(a,2.6,14,a+.5,3.4,15.5,ST);B(a+.5,3.05,14,a+1,3.4,15.5,ST);B(b-.5,2.6,14,b,3.4,15.5,ST);B(b-1,3.05,14,b-.5,3.4,15.5,ST)}
  // cloister roof, fallen in at one bay; rubble below the hole
  slab(-56,15.5,-10,24,4.6,5.2,ST,[[-36,17,-31,22]],{f:{py:GR}});
  for(const [x0,z0,x1,z1,h] of [[-35.5,17.5,-32,21,.5],[-35,18.2,-33,20.4,1.0],[-34.4,18.6,-33.6,19.6,1.4]])B(x0,0,z0,x1,h,z1,'btDirt',{f:{py:'btDirt'}});
  for(const x of [-44,-24])B(x-.35,0,22.6,x+.35,4.6,23.3,ST);// pilasters on the back wall
  ivy(-36,2.6,15.52,-30.6,5.2,15.6,'pz');
  brazier(-40,0,6.4);brazier(-22,0,20);
  // hall clutter: a fallen pillar, a broken cart
  B(-30,0,9.5,-24,.9,10.4,'btStep');B(-24,0,9.2,-23.1,1.1,10.7,'btStep');
  B(-44,.6,10,-41,1.2,11.8,'btWood');for(const [x,z] of [[-43.6,9.8],[-41.4,9.8],[-43.6,11.95],[-41.4,11.95]])B(x-.35,0,z-.08,x+.35,.75,z+.08,'btWood');
  // ================= the upper courtyard (terrace, y 3) =================
  // the terrace edge over the lower courtyard: a broken balustrade, three stairs down
  for(const [x0,x1] of [[-4,2],[16,22],[28,34]])B(x0,3,1.6,x1,3.9,2,ST,{f:{py:'btStep'}});
  stairs('z',10,14,9.5,2,0,3,8,'btStep');rail('z',9.88,10,9.5,2,0,3,8);rail('z',14,14.12,9.5,2,0,3,8);
  stairs('z',-8,-5,9.5,2,0,3,8,'btStep');rail('z',-5,-4.88,9.5,2,0,3,8);
  // the broad grey stair down the east side: flight, landing, flight
  stairs('z',38,50,0,-8,1.5,3,6,'btStep');B(38,0,-8,50,1.5,0,ST);B(38,0,0,50,1.5,3,ST,{f:{py:'btStep'}});stairs('z',38,50,11,3,0,1.5,6,'btStep');
  B(37.7,0,2,38,2.5,3,ST);rail('z',37.7,38,11,3,0,1.5,6);
  // ruins on the terrace: low walls, column stumps, a fallen column, a stone bench (cover for the open grass)
  B(-6,3,-30,-5.2,4.3,-22,ST,{f:{py:'btMoss'}});B(-6,3,-30,-1,4.0,-29.2,ST,{f:{py:'btMoss'}});
  B(31,3,-31,37,4.1,-30.2,ST,{f:{py:'btMoss'}});B(36.2,3,-31,37,4.4,-25,ST,{f:{py:'btMoss'}});
  for(const [x,z,h] of [[0,-20,1.2],[0,-8,2.4],[8,-14,.9],[40,-20,1.8],[46,-28,2.6],[33,-7,1.1]])stump(x,z,3,h);
  B(2,3,-12.2,7.6,3.9,-11.3,'btStep');B(7.6,3,-12.4,8.6,4.1,-11.1,'btStep');// fallen column
  B(-2,3,-3.4,1.6,3.45,-2.8,ST);B(42,3,-14,46,3.45,-13.4,ST);// benches
  ivy(-6.02,3,-30,-6,4.3,-22,'nx');
  // ================= the keep: a square tower against the north wall, a stair inside to its crenellated roof =================
  const KX0=4,KX1=18,KZ0=-37,KZ1=-24,KY=3,KR=7.8;
  wallZ(KX0,KX0+.8,KZ0,KZ1,KY,KR+1.5,ST,[[-31,-29.4,5.2,6.8]]);wallZ(KX1-.8,KX1,KZ0,KZ1,KY,KR+1.5,ST,[[-31,-29.4,5.2,6.8]]);
  wallX(KX0+.8,KX1-.8,KZ1-.8,KZ1,KY,KR+1.5,ST,[[9.5,12.5,KY,KY+2.8],[6.8,8,6,7.2],[14,15.2,6,7.2]]);
  B(9.5,KY+2.3,KZ1-.8,10,KY+2.8,KZ1,ST);B(12,KY+2.3,KZ1-.8,12.5,KY+2.8,KZ1,ST);// round-headed doorway
  B(KX0-.06,5,-35,KX0,7.4,-32.4,'btArch',CV);B(KX1,5,-35,KX1+.06,7.4,-32.4,'btArch',CV);B(9.6,6.6,KZ1,12.4,9.4,KZ1+.06,'btArch',CV);
  slab(KX0+.8,KZ0,KX1-.8,KZ1-.8,KR,KR+.4,ST,[[KX0+.8,KZ0,KX0+2.6,-30.2]],{f:{py:'btFlag',ny:ST}});
  // the walls stand 1.1 m above the roof (a parapet to shoot over), merlons above that
  const MY=KR+1.5;for(let x=KX0;x<KX1-.5;x+=2)B(x,MY,KZ1-.8,x+1,MY+.8,KZ1,ST);for(let z=KZ0+1;z<KZ1-.5;z+=2){B(KX0,MY,z,KX0+.8,MY+.8,z+1,ST);B(KX1-.8,MY,z,KX1,MY+.8,z+1,ST)}
  stairs('z',KX0+.8,KX0+2.6,-25.3,-36.5,KY,KR,14,'btStep');
  B(15,KY,-35.5,16.6,KY+.9,-33.5,'btWood');B(13.4,KY,-35.6,14.4,KY+1,-34.6,'btWood');brazier(8.4,KY,-22.6);brazier(13.6,KY,-22.6);LIGHT(11,KY+3.6,-30,'#ffcf9a',8,.7);
  ivy(KX1-.02,KY,-28,KX1+.02,9,-24.6,'px');
  // ================= the big tree: a trunk five metres across, roots over the grass, a deck round it, a canopy over half the terrace =================
  const TX=24,TZ=-16;
  B(TX-2.5,3,TZ-2.5,TX+2.5,14.5,TZ+2.5,'btBark');B(TX-3.2,3,TZ-3.2,TX+3.2,4.6,TZ+3.2,'btBark');B(TX-2.9,4.6,TZ-2.9,TX+2.9,5.6,TZ+2.9,'btBark');
  for(const [x0,z0,x1,z1,h] of [[TX+3.2,TZ-.8,TX+8.5,TZ+.8,.38],[TX-.8,TZ-8,TX+.8,TZ-3.2,.38],[TX-9,TZ+.2,TX-3.2,TZ+1.8,.38],[TX+.2,TZ+3.2,TX+1.8,TZ+9,.38],
      [TX+3.2,TZ+2.4,TX+5.6,TZ+3.6,.32],[TX-5.4,TZ-3.8,TX-3.2,TZ-2.6,.32],[TX+2.2,TZ-5.4,TX+3.4,TZ-3.2,.32],[TX-3.6,TZ+3.2,TX-2.4,TZ+5.6,.32]])B(x0,3,z0,x1,3+h,z1,'btBark');
  // the deck: planks at y 6.5 on four posts, a railing, a stair from the east
  const DY=6.5;B(TX-6.5,DY-.3,TZ-6.5,TX+6.5,DY,TZ+6.5,'btWood');
  for(const [x,z] of [[TX-6,TZ-6],[TX+6,TZ-6],[TX-6,TZ+6],[TX+6,TZ+6]])B(x-.2,3,z-.2,x+.2,DY-.3,z+.2,'btBark');
  B(TX-6.5,DY,TZ-6.5,TX+6.5,DY+1,TZ-6.38,'btWood');B(TX-6.5,DY,TZ+6.38,TX+6.5,DY+1,TZ+6.5,'btWood');B(TX-6.5,DY,TZ-6.5,TX-6.38,DY+1,TZ+6.5,'btWood');
  B(TX+6.38,DY,TZ-6.5,TX+6.5,DY+1,TZ+3,'btWood');B(TX+6.38,DY,TZ+5,TX+6.5,DY+1,TZ+6.5,'btWood');
  // 9 treads over 7.5 m: on the 1 m nav grid no two neighbouring samples differ by more than .8
  stairs('x',TZ+3,TZ+5,TX+14,TX+6.5,3,DY,9,'btWood');rail('x',TZ+2.88,TZ+3,TX+14,TX+6.5,3,DY,9,'btWood');rail('x',TZ+5,TZ+5.12,TX+14,TX+6.5,3,DY,9,'btWood');
  // limbs and canopy
  for(const [x0,y0,z0,x1,y1,z1] of [[TX+2.5,10,TZ-.8,TX+13,11,TZ+.6],[TX-13,10.4,TZ-.6,TX-2.5,11.4,TZ+.8],[TX-.7,10.2,TZ-13,TX+.7,11.2,TZ-2.5],[TX-.5,9.8,TZ+2.5,TX+.9,10.8,TZ+12],
      [TX+2.5,12.5,TZ+1,TX+9,13.3,TZ+2],[TX-8,12.8,TZ-2.4,TX-2.5,13.6,TZ-1.4]])B(x0,y0,z0,x1,y1,z1,'btBark');
  // the crown: a dense core, then forty clumps of leaves scattered over a dome (lower and wider at the rim, higher in the middle)
  B(TX-8,11.6,TZ-8,TX+8,14.6,TZ+8,'btLeaf');B(TX-5,14.6,TZ-5,TX+5,16.6,TZ+5,'btLeaf');
  for(let i=0;i<40;i++){const a=hash2(i,1,1221)*TAU,f=Math.sqrt(hash2(i,2,1221)),r=f*13,w=2.6+hash2(i,3,1221)*3.4,h=1.4+hash2(i,4,1221)*1.6;
    const y=10.7+(1-f*f)*5.2+hash2(i,5,1221)*1.2;const x=TX+Math.cos(a)*r,z=TZ+Math.sin(a)*r;B(x-w/2,y,z-w/2,x+w/2,y+h,z+w/2,'btLeaf')}
  for(const [x,z,h] of [[TX-9,TZ-4,4],[TX+10,TZ+3,3.5],[TX-3,TZ+11,4.5],[TX+4,TZ-11,3.2],[TX-10.5,TZ+6,3.8],[TX+8,TZ-8,4.2]])B(x-.6,11.2-h,z-.02,x+.6,11.2,z+.02,'btIvy',CV);
  LIGHT(TX,DY+2.6,TZ+5,'#ffe2b0',9,.55);LIGHT(TX-5,4.4,TZ-7,'#c8ffb0',8,.35);
  // ================= the lower courtyard (y 0): the dry pool, a well, a cart, rubble =================
  // the pool: 1.4 m deep, steps in at the north and south ends, a broken fountain in the middle
  stairs('z',7,11,15,12,-1.4,0,4,'btStep');stairs('z',7,11,21,24,-1.4,0,4,'btStep');
  for(const [x0,z0,x1,z1] of [[2,11.7,7,12],[11,11.7,16,12],[2,24,7,24.3],[11,24,16,24.3],[1.7,11.7,2,24.3],[16,11.7,16.3,24.3]])B(x0,0,z0,x1,.5,z1,'btStep');// kerb
  B(7.8,-1.4,17.2,10.2,-.6,18.8,'btStep');B(8.5,-.6,17.6,9.5,1.2,18.4,'btStep');B(8.3,1.2,17.4,9.7,1.5,18.6,'btStep');
  ivy(1.98,-1.4,13,2,0,22,'px');
  // the well
  for(const [x0,z0,x1,z1] of [[-4.2,15.2,-1.8,15.5],[-4.2,17.5,-1.8,17.8],[-4.2,15.5,-3.9,17.5],[-2.1,15.5,-1.8,17.5]])B(x0,0,z0,x1,.95,z1,'btStep');
  B(-3.9,-.2,15.5,-2.1,.02,17.5,'btMud',CV);for(const x of [-4.1,-2])B(x-.1,.95,16.4,x+.1,2.6,16.6,'btWood');B(-4.2,2.5,16.4,-1.8,2.7,16.6,'btWood');
  // cart, rubble, fallen column drums
  B(24.5,.7,15,28.5,1.4,17.2,'btWood');for(const [x,z] of [[25.2,14.85],[27.8,14.85],[25.2,17.35],[27.8,17.35]])B(x-.45,0,z-.1,x+.45,.9,z+.1,'btWood');B(28.5,.75,15.9,30.6,.9,16.3,'btWood');
  for(const [x0,z0,x1,z1,h] of [[30,19,34,23,.7],[30.8,19.8,33,22,1.3],[-8.5,20,-5.5,23,.6],[19,4.5,22,7,.8],[19.6,5,21.2,6.4,1.4]])B(x0,0,z0,x1,h,z1,'btDirt',{f:{py:'btDirt'}});
  B(31,0,9,35,1,10,'btStep');B(35.2,0,8.6,36.2,1,10.4,'btStep');stump(-6,5,0,1.6);stump(24,9,0,2.2);stump(46,22,0,1.2);
  ivy(-10,0,1.98,-6,3,2.02,'pz');ivy(18,0,1.98,23,3,2.02,'pz');ivy(30,0,1.98,33,3,2.02,'pz');
  // ================= the south chambers: five ruined rooms, three still roofed, linked by gaps in their walls =================
  const CZ0=26,CZ1=36,CH=4.5;
  wallX(-10,50,CZ0,CZ0+.8,0,CH,ST,[[-5.2,-2.8,0,2.6],[6.8,9.2,0,2.6],[18.8,21.2,0,2.6],[30.8,33.2,0,2.6],[42.8,45.2,0,2.6],[10.5,13.5,1.4,CH],[34,37,2.2,CH],[-9.2,-7.6,1.2,3.2],[23.4,25,1.2,3.2],[47,48.6,1.2,3.2]]);
  for(const [x,hole] of [[2,0],[14,1],[26,0],[38,1]])wallZ(x-.4,x+.4,CZ0+.8,CZ1,0,CH,ST,hole?[[31,33,0,2.4]]:[[33.5,35.5,0,2.4]]);
  for(const [x0,x1] of [[-10,1.6],[14.4,25.6],[38.4,50]])B(x0,CH,CZ0,x1,CH+.5,CZ1,ST,{f:{py:GR}});
  for(const [x0,z0,x1,z1,h] of [[4,30,9,34,.9],[5,31,7.6,33.2,1.6],[28,31,34,35,1.1],[29,32,32,34,1.8]])B(x0,0,z0,x1,h,z1,'btDirt',{f:{py:'btDirt'}});// fallen roofs
  B(-8,0,33.5,-5,.9,35.6,'btWood');B(16,0,34.6,18.2,1.1,35.8,'btWood');B(41,0,34,44,.8,35.6,'btWood');
  brazier(20,0,29.4);brazier(44,0,29.4);brazier(-4,0,29.4);
  ivy(4,1,25.98,9,CH,26,'nz');ivy(27,.5,25.98,31,CH,26,'nz');
  // ================= spawns, zombie entries, camps, sun, title camera =================
  MAP.spawns=[];for(const x of [-6,-1,4,9,14,19,30,35])for(const z of [-4.2,-1.4])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.2,.2),3,Math.PI+rr(-.4,.4)]);
  MAP.zspawns=[[-50,20,0],[-50,10.5,0],[-30,7,0],[-7,-34,3],[46,-34,3],[46,-20,3],[-6,31,0],[8,31,0],[20,31,0],[32,31,0],[44,31,0],[46,20,0],[9,19.5,-1.4],[30,6,0],[-22,21,0]];
  MAP.camps=[
    {k:'keepTop',w:.12,p:[[9,KR+.4,-27],[15,KR+.4,-27],[15,KR+.4,-34]],look:[24,3,0]},
    {k:'keep',w:.08,p:[[11,KY,-30],[15.6,KY,-30]],look:[11,4,-20]},
    {k:'deck',w:.14,p:[[TX-5,DY,TZ+5],[TX+5,DY,TZ-5],[TX-5,DY,TZ-5]],look:[TX,3,TZ+20]},
    {k:'rampart',w:.1,p:[[-40,3,1],[-26,3,1],[-50,3,0]],look:[-30,0,12]},
    {k:'cloister',w:.08,p:[[-46,0,20],[-25,0,20]],look:[-30,1,10]},
    {k:'chambers',w:.1,p:[[-4,0,32],[36.4,0,29],[44,0,33]],look:[20,1,18]},
    {k:'pool',w:.06,p:[[4,-1.4,22],[14,-1.4,14]],look:[9,0,8]},
    {k:'stairs',w:.08,p:[[44,1.5,1.5],[40,1.5,1.5]],look:[20,1,15]},
    {k:'terrace',w:.1,p:[[-6,3,-34],[46,3,-34],[40,3,-24]],look:[20,3,-10]},
  ];
  MAP.spawnYaw=null;
  MAP.moon={d:new THREE.Vector3(.48,.72,-.5).normalize(),c:new THREE.Color('#ffe8c8'),i:.85};
  MAP.cam=(t,cam)=>{const a=t*.03+2.2;cam.position.set(TX+Math.sin(a)*34,15+2*Math.sin(t*.07),TZ+12+Math.cos(a)*26);cam.lookAt(TX,7,TZ+4)};
}
MAPDEFS.bigtree={n:['빅트리','Big Tree'],d:['거대한 고목이 뿌리내린 폐허 성채. 고목을 둘러싼 나무 데크와 성탑 옥상이 가장 높고, 잔디 덮인 위뜰과 성벽 위 회랑, 아래뜰·마른 연못·폐허가 된 방들로 높낮이가 세 단으로 나뉜다.','A ruined castle grown over by one enormous old tree. The deck round its trunk and the keep roof stand highest; the grassy upper court and the rampart walk sit above a lower court with a dry pool and ruined chambers.'],
  env:{sky:1,sun:1,skyTex:'skyDay',halo:'#ffe6c4',rain:0,storm:0,fog:'#a9b8a2',fogD:.012,bloomThr:.9,ambOut:'#6c7a66',ambIn:'#3c3e36'},bounds:[-58,-39,52,38],probeY:[-.5,.9,2.4,3.9,5.4,7.4,9.2],mini:[2.5,5.6],tex:bakeBtTex,build:buildBigTree};

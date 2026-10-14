'use strict';
// ============ Map "항만 터미널 Harbor Terminal" (v6.49): a container port on a clear afternoon, made for 대인전 and 폭파미션 ============
// x runs east to the quay and the ship, z runs south. The defenders (MAP.spawns) start at the operations building in the north, the
// attackers (MAP.zspawns) at the truck gate in the south. Three ways across:
//  · A long  — out of the gate yard east through the long doors, then north up the quay under the ship's side;
//  · mid     — the customs lane with the X-ray portal: A short leaves its north-east corner, the customs hall leads through to B;
//  · B tunnel — the transit shed along the west edge.
// A is the crane berth (an STS crane straddles the quay, a container platform at the back), B the cold store's loading dock (the dock,
// the cold room behind it, reefers in the yard). Container blocks fill the space between the lanes: only their outer containers are
// drawn (the ones inside show only their tops). The ship, the second crane and the warehouses outside are scenery. Every texture is painted
// on first load.
Object.assign(MATS,{
  ptPave:{t:'ptPave',s:2},ptAsph:{t:'ptAsph',s:3},ptQuay:{t:'ptQuay',s:4},ptLineY:{t:'ptLineY',s:1,k:'stone'},ptLineW:{t:'ptLineW',s:1,k:'stone'},
  ptSea:{t:'ptSea',s:4,emis:.05,k:'glass'},
  ptCO:{t:'ptCO',uv:'boxV',s:6,cs:1,k:'metal'},ptCB:{t:'ptCB',uv:'boxV',s:6,cs:1,k:'metal'},ptCR:{t:'ptCR',uv:'boxV',s:6,cs:1,k:'metal'},ptCG:{t:'ptCG',uv:'boxV',s:6,cs:1,k:'metal'},
  ptCY:{t:'ptCY',uv:'boxV',s:6,cs:1,k:'metal'},ptCT:{t:'ptCT',uv:'boxV',s:6,cs:1,k:'metal'},ptCW:{t:'ptCW',uv:'boxV',s:6,cs:1,k:'metal'},
  ptHull:{t:'ptHull',s:8,cs:2,k:'metal'},ptSuper:{t:'ptSuper',s:3,cs:1.5,k:'metal'},ptCraneY:{t:'ptCraneY',s:2,cs:1,k:'metal'},ptCraneW:{t:'ptCraneW',s:2,cs:1,k:'metal'},
  ptPanel:{t:'ptPanel',s:2,cs:1,k:'metal'},ptClad:{t:'ptClad',s:2,cs:1,k:'metal'},ptRender:{t:'ptRender',s:3,cs:1,k:'stone'},
  ptShut:{t:'ptShut',uv:'box',k:'metal'},ptWin:{t:'ptWin',uv:'box',k:'glass'},ptRack:{t:'ptRack',uv:'boxV',s:2.7,k:'metal'},
  ptSignA:{t:'ptSignA',uv:'box',emis:.06,k:'metal'},ptSignB:{t:'ptSignB',uv:'box',emis:.06,k:'metal'},ptSignC:{t:'ptSignC',uv:'box',emis:.06,k:'metal'},
  ptSignX:{t:'ptSignX',uv:'box',emis:.06,k:'metal'},ptSignP:{t:'ptSignP',uv:'box',emis:.06,k:'metal'},ptDecA:{t:'ptDecA',uv:'box',k:'stone'},ptDecB:{t:'ptDecB',uv:'box',k:'stone'},
});
// ---------- textures ----------
// yard paving: metre slabs of pale concrete, dark joints, oil stains, the odd crack
function texPtPave(){const N=256;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const id=(y>>7)*2+(x>>7),lx=x&127,ly=y&127;
    let t=.55+(hash2(id,1,2101)-.5)*.18+(P.n(x,y,64,2102,4)-.5)*.28+(P.n(x,y,8,2103,2)-.5)*.12+(hash2(x,y,2104)-.5)*.08;
    if(lx<2||ly<2)t-=.42;else if(lx<3||ly<3)t+=.06;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#55544f','#64635d','#73716a','#827f77','#918e85','#a09c92','#ada99e'],.09))}
  for(let i=0;i<5;i++)stain(P,hash2(i,1,2105)*N,hash2(i,2,2105)*N,8+hash2(i,3,2105)*22,6+hash2(i,4,2105)*14,.26,2110+i);
  pits(P,180,2106,'#45443f','#b4b0a6');
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,1,2107)*N),Math.floor(hash2(i,2,2107)*N),50,2120+i,'#46453f','#aca89e')})}
// sun-bleached asphalt: grey aggregate, sealed cracks, a few stains
function texPtAsph(){const N=256;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.5+(P.n(x,y,64,2131,3)-.5)*.34+(P.n(x,y,4,2132,1)-.5)*.14+(hash2(x,y,2133)-.5)*.3;
    P.set(x,y,dith(P,x,y,t,['#2c2d2e','#353637','#3f403f','#494a48','#535451','#5e5f5b'],.18))}
  for(let i=0;i<1500;i++){const x=Math.floor(hash2(i,1,2134)*N),y=Math.floor(hash2(i,2,2134)*N);P.set(x,y,rpickH(i,['#6c6d67','#787972','#595a55','#83847c']));if(hash2(i,3,2134)<.3)P.set(x,y+1,'#1e1f20')}
  for(let i=0;i<2;i++){let x=Math.floor(hash2(i,1,2135)*N);for(let y=0;y<N;y++){P.set(x,y,'#19191a');P.set(x+1,y,'#222324',.6);if(hash2(y,i,2136)<.4)x+=hash2(y,3+i,2136)<.5?1:-1}}
  for(let i=0;i<4;i++)stain(P,hash2(i,4,2137)*N,hash2(i,5,2137)*N,14+hash2(i,6,2137)*20,10+hash2(i,7,2137)*12,.2,2140+i)})}
// the quay deck: weathered concrete in 4 m bays, rust bled from the lashing points
function texPtQuay(){const N=256;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.52+(P.n(x,y,64,2151,4)-.5)*.38+(P.n(x,y,8,2152,2)-.5)*.14+(hash2(x,y,2153)-.5)*.1;if(x<2||y<2)t-=.38;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#58544e','#66625b','#747068','#827e75','#908b81','#9e988d'],.1))}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,2154)*N,hash2(i,2,2154)*N,10+hash2(i,3,2154)*26,8+hash2(i,4,2154)*20,.2,2160+i);
  for(let i=0;i<6;i++){const cx=hash2(i,5,2155)*N,cy=hash2(i,6,2155)*N;for(let y=-7;y<=7;y++)for(let x=-7;x<=7;x++){const d=Math.hypot(x,y)/7+(hash2(x+i*13,y,2156)-.5)*.4;
    if(d<1)P.set(Math.round(cx+x),Math.round(cy+y),d<.35?'#4a2c1a':'#7a4c2c',.45*(1-d))}}
  pits(P,220,2157,'#3c3934','#a8a296')})}
// road paint, worn through in places
function texPtLine(c){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=P.n(x,y,16,2171,3);let col=dith(P,x,y,.55+(n-.5)*.5+(hash2(x,y,2172)-.5)*.2,[dk(c,.22),dk(c,.1),c,lt(c,.08)],.1);
  if(n<.28||hash2(x,y,2173)<.05)col=mix(col,'#77746c',.55);P.set(x,y,col)}})}
function texPtSea(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,2321,3),w=Math.sin((x+n*40)*.2)*.5+.5;
  P.set(x,y,dith(P,x,y,.35+w*.3+(n-.5)*.3,['#0e2228','#14303a','#1c3e4a','#2a5262','#3e6a7a'],.1))}})}
// the ship's side: 2 m plates in staggered rows, a pale sheer strake under the deck edge, rust run down from the scuppers
function texPtHull(){const N=256;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,64,2201,3)-.5)*.3+(hash2(x,y,2202)-.5)*.05;const px=(x+((y>>6)&1)*32)&63,py=y&63;if(px===0||py===0)t-=.22;else if(px===1||py===1)t+=.05;
    let c=dith(P,x,y,t,['#141b26','#1a2331','#202b3c','#263347','#2d3c53'],.08);if(y>=26&&y<32)c=dith(P,x,y,.5+(hash2(x,y,2205)-.5)*.3,['#8a8c88','#a0a29c','#b4b6b0'],.1);P.set(x,y,c)}
  for(let i=0;i<40;i++){const x=Math.floor(hash2(i,1,2203)*N),y0=32+Math.floor(hash2(i,2,2203)*(N-60)),l=20+Math.floor(hash2(i,3,2203)*90);
    for(let k=0;k<l;k++)P.set(x+Math.round(Math.sin(k*.1+i)*.7),y0+k,k<l*.3?'#8a4a24':'#5a3420',.5*(1-k/l))}
  for(let i=0;i<5;i++)stain(P,hash2(i,4,2204)*N,hash2(i,5,2204)*N,20,12,.15,2210+i)})}
// the ship's accommodation block: white plating, one deck per tile with its window, rust tears under the sills
function texPtSuper(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.6+(P.n(x,y,32,2221,3)-.5)*.28+(hash2(x,y,2222)-.5)*.05,['#8e8c84','#a3a199','#b6b4ac','#c7c5bd','#d4d2ca'],.06);
    if(y>=122)c='#6e6c66';else if(y>=119)c='#e2e0d8';
    if(x>=34&&x<94&&y>=36&&y<78){const fr=x<37||x>=91||y<39||y>=75||Math.abs(x-64)<2;c=fr?'#e6e4dc':((x-34)+(y-36)*.7)%46<6?'#6a809a':'#1c2a3a'}
    P.set(x,y,c)}
  for(let i=0;i<9;i++)streak(P,Math.floor(hash2(i,1,2223)*128),80,10+Math.floor(hash2(i,2,2223)*36),.12,1)})}
// painted steel (the cranes): panel seams, bolt heads, grime run down the faces
function texPtPaint(base,seed){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    let c=dith(P,x,y,.55+(P.n(x,y,32,seed,3)-.5)*.3+(hash2(x,y,seed+1)-.5)*.06,[dk(base,.32),dk(base,.18),dk(base,.07),base,lt(base,.1)],.08);
    if((y&63)<2)c=dk(base,.42);if((x&31)===15&&(y&15)<2)c=dk(base,.5);P.set(x,y,c)}
  for(let i=0;i<12;i++)streak(P,Math.floor(hash2(i,1,seed+2)*128),Math.floor(hash2(i,2,seed+2)*64),18+Math.floor(hash2(i,3,seed+2)*60),.14,1)})}
// the cold store's insulated panels: white, a seam every metre, faint ribs
function texPtPanel(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const lx=x&127;let t=.62+(P.n(x,y,64,2241,3)-.5)*.2+(hash2(x,y,2242)-.5)*.05;
    if(lx<2)t-=.4;else if(lx<4)t+=.06;else if((lx&31)===16)t-=.08;P.set(x,y,dith(P,x,y,t,['#7c8080','#909494','#a4a8a6','#b6b9b6','#c6c8c4','#d2d4d0'],.06))}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,2243)*N),Math.floor(hash2(i,2,2243)*N),30+Math.floor(hash2(i,3,2243)*80),.1,2)})}
// the transit shed: green corrugated cladding with rust runs
function texPtClad(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=x&31,s=r<3?.15:r<5?.6:r<16?.9:r<18?.55:.32;
    P.set(x,y,dith(P,x,y,s*.7+(P.n(x,y,64,2251,3)-.5)*.3+(hash2(x,y,2252)-.5)*.05+.12,['#26342c','#30423a','#3c5246','#486052','#566e60','#647c6c'],.08))}
  for(let i=0;i<30;i++){const x=Math.floor(hash2(i,1,2253)*N),y0=Math.floor(hash2(i,2,2253)*N),l=20+Math.floor(hash2(i,3,2253)*70);for(let k=0;k<l;k++)P.set(x,y0+k,'#7a4a2a',.4*(1-k/l))}})}
// rendered walls (customs, the operations building)
function texPtRender(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=.58+(P.n(x,y,64,2261,4)-.5)*.3+(P.n(x,y,8,2262,2)-.5)*.08+(hash2(x,y,2263)-.5)*.05;
    P.set(x,y,dith(P,x,y,t,['#8a867c','#9c978c','#aca79b','#bab5a8','#c6c1b4'],.06))}
  for(let i=0;i<18;i++)streak(P,Math.floor(hash2(i,1,2264)*N),Math.floor(hash2(i,2,2264)*N),30+Math.floor(hash2(i,3,2264)*90),.12,2);
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,1,2265)*N),Math.floor(hash2(i,2,2265)*N),40,2270+i,'#6e6a60','#c8c2b4')})}
// roller shutter
function texPtShut(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=(y%8)<1?'#4a4e52':(y%8)<2?'#9aa0a4':(y%8)<6?'#7a8084':'#656b6f';
    if(x<4||x>123)c='#3e4246';if(y>118)c=y>124?'#2a2c2e':'#5a5e62';if(P.n(x,y,16,2271,2)>.66)c=dk(c,.15);if(hash2(x,y,2272)<.03)c=dk(c,.2);P.set(x,y,c)}
  for(let i=0;i<8;i++)streak(P,Math.floor(hash2(i,1,2273)*128),Math.floor(hash2(i,2,2273)*60),20+Math.floor(hash2(i,3,2273)*50),.12,2)})}
// a window in daylight: aluminium frame, two panes catching the sky
function texPtWin(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c;const fr=x<6||x>121||y<6||y>121||Math.abs(x-64)<3;
    if(fr)c=dith(P,x,y,.6+(hash2(x,y,2281)-.5)*.2,['#9a9c9a','#b0b2b0','#c4c6c4'],.1);else c=mix('#2a3c50','#7a90a8',clamp((1-y/128)*.7+((x+y*.6)%70<10?.25:0),0,1));
    P.set(x,y,c)}})}
// pallet racking seen from the aisle: blue uprights, orange beams, three levels of goods (counted from the floor up)
function texPtRack(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const yb=255-y,lv=Math.floor(yb/85),ly=yb%85;let c;
    if(x<7)c=x<2?'#1a2c4a':'#2e5490';else if(ly<6)c=ly>4?'#7a3a10':'#d86a1c';
    else if(ly<15)c=dith(P,x,y,.5+(hash2(x>>3,lv,2291)-.5)*.3,['#5a4630','#6e5638','#826a44'],.1);
    else{const bx=Math.floor((x-7)/40),id=lv*7+bx,ex=(x-7)%40,h=40+Math.floor(hash2(id,1,2292)*30);
      if(ly-15>h||ex<2)c='#0e0f12';else{const k=hash2(id,2,2292);c=k<.5?dith(P,x,y,.5+(P.n(x,y,8,2293,2)-.5)*.4,['#8a6a42','#9c7a4e','#ae8a5a'],.1):k<.82?dith(P,x,y,.5+(P.n(x,y,8,2294,2)-.5)*.5,['#a8acb0','#c0c4c6','#d6d8d8'],.1):'#4a6a8a';
        if((ly-15)%18===0)c=dk(c,.25)}}
    P.set(x,y,c)}})}
// signs: a board with a border and big lettering (the site letters, customs, the X-ray portal, the terminal's name)
function texPtSign(w,h,txt,sub,bg,fg,fs){return paint(w,h,P=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=bg;if(x<6||x>=w-6||y<6||y>=h-6)c=fg;if(hash2(x,y,2301)<.05)c=dk(c,.12);P.set(x,y,c)}
  P.post=x=>{x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.font='bold '+fs+'px sans-serif';x.fillText(txt,w/2,sub?h*.42:h*.54);if(sub){x.font='bold '+Math.round(fs*.32)+'px sans-serif';x.fillText(sub,w/2,h*.8)}}})}
// the bomb-site letter painted on the ground: a ring and the letter, cut out, worn; mirrored so that it reads from the south
function texPtDec(L){return paint(256,256,P=>{P.post=x=>{x.save();x.translate(0,256);x.scale(1,-1);const c='rgba(222,104,34,.95)';x.strokeStyle=c;x.lineWidth=16;x.beginPath();x.arc(128,128,110,0,TAU);x.stroke();
  x.fillStyle=c;x.font='bold 176px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(L,128,140);x.restore();
  const id=x.getImageData(0,0,256,256),D=id.data;for(let y=0;y<256;y++)for(let i=0;i<256;i++){const k=(y*256+i)*4;if(D[k+3]&&(hash2(i>>2,y>>2,2311)<.16||hash2(i,y,2312)<.08))D[k+3]=0}x.putImageData(id,0,0)}})}
function bakePtTex(){if(TEX.ptPave)return;
  TEX.ptPave=mkTex(texPtPave());TEX.ptAsph=mkTex(texPtAsph());TEX.ptQuay=mkTex(texPtQuay());TEX.ptLineY=mkTex(texPtLine('#d4aa2a'));TEX.ptLineW=mkTex(texPtLine('#dad8ce'));TEX.ptSea=mkTex(texPtSea());
  for(const [k,c,l] of [['ptCO','#b4622c','PRSU 418702'],['ptCB','#2e5a8e','QZPU 220917'],['ptCR','#963428','HBTU 771403'],['ptCG','#3e6a38','KDRU 502288'],['ptCY','#b8952e','NMXU 663019'],
      ['ptCT','#2a6a68','WSEU 130562'],['ptCW','#c4c6c0','']])TEX[k]=mkTex(texContainer(c,l));
  TEX.ptHull=mkTex(texPtHull());TEX.ptSuper=mkTex(texPtSuper());TEX.ptCraneY=mkTex(texPtPaint('#c89a26',2231));TEX.ptCraneW=mkTex(texPtPaint('#c2c4c0',2235));
  TEX.ptPanel=mkTex(texPtPanel());TEX.ptClad=mkTex(texPtClad());TEX.ptRender=mkTex(texPtRender());TEX.ptShut=mkTex(texPtShut());TEX.ptWin=mkTex(texPtWin());TEX.ptRack=mkTex(texPtRack());
  TEX.ptSignA=mkTex(texPtSign(128,128,'A','','#1c3a6a','#e8e6dc',96),false);TEX.ptSignB=mkTex(texPtSign(128,128,'B','','#1c3a6a','#e8e6dc',96),false);
  TEX.ptSignC=mkTex(texPtSign(256,96,'세관','CUSTOMS','#1e4a3a','#e8e6dc',52),false);TEX.ptSignX=mkTex(texPtSign(512,64,'X-RAY  INSPECTION','','#c4a020','#1a1a18',38),false);
  TEX.ptSignP=mkTex(texPtSign(512,96,'PIER 7','CONTAINER TERMINAL · 7부두','#16284a','#ecead8',50),false);
  TEX.ptDecA=mkTex(texPtDec('A'),false);TEX.ptDecB=mkTex(texPtDec('B'),false);
  // the daylight sky and sun belong to Italy's set; paint them here too if Italy has not been loaded yet
  if(!TEX.skyDay){TEX.skyDay=mkTex(texSkyDay());TEX.skyDay.wrapT=THREE.ClampToEdgeWrapping;TEX.skyDay.magFilter=THREE.LinearFilter}
  if(!TEX.sunDisc){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['ptPave','ptAsph','ptQuay'])TEX[k].anisotropy=an}
// ---------- the map ----------
function buildPort(){const CV={nosolid:true},H=2.6,CW=2.44,Y='ptCraneY',W='ptCraneW';
  const CC=['ptCO','ptCB','ptCR','ptCG','ptCY','ptCT','ptCB','ptCO','ptCR'];
  const ccol=(a,b,k,s)=>CC[Math.floor(hash2(a*7+b*3+1,k+1,s)*CC.length)];
  // one container: [x0,x1]×[z0,z1] at level k (0 on the ground), standing on y0
  const box=(x0,z0,x1,z1,k,mat,o,y0)=>{y0=y0||0;return B(x0,y0+k*H,z0,x1,y0+(k+1)*H,z1,mat,o)};
  // a block of stacked containers filling [x0,x1]×[z0,z1]: rows along the long side cut into 6 and 12 m boxes, h levels (o.v: some one
  // higher). Inside a block the boxes between the two ends of a row show their tops only (seen from the title camera, never from the
  // ground); o.out: the face toward the outside of the map is never drawn
  const yard=(x0,z0,x1,z1,h,o)=>{o=o||{};const sd=o.seed||(3301+Math.round(x0*7+z0*13)),ax=(x1-x0)>=(z1-z0);
    const L0=ax?x0:z0,L1=ax?x1:z1,C0=ax?z0:x0,C1=ax?z1:x1,n=Math.max(1,Math.round((C1-C0)/CW)),rw=(C1-C0)/n,oo=o.out?{f:{[o.out]:'none'}}:undefined,TOP={f:{px:'none',nx:'none',pz:'none',nz:'none',ny:'none'}};
    for(let r=0;r<n;r++){const c0=C0+r*rw,c1=c0+rw,edge=r===0||r===n-1;let a=L0,i=0;
      while(a<L1-.01){let len=hash2(r,i,sd)<.4?6.06:12.19;if(L1-a<len+3)len=L1-a;const a1=a+len,vis=edge||i===0||a1>=L1-.01;
        const hh=vis&&o.v&&hash2(r,i,sd+1)<.3?h+1:h;
        for(let k=0;k<hh;k++)B(ax?a:c0,k*H,ax?c0:a,ax?a1:c1,(k+1)*H,ax?c1:a1,o.mat||ccol(r,i,k,sd),vis?oo:TOP);
        a=a1;i++}}};
  const jb=(x0,z0,x1,z1)=>B(x0,0,z0,x1,.85,z1,'barrier');
  const pole=(x,z,h)=>{B(x-.09,0,z-.09,x+.09,h,z+.09,'metal2');B(x-.55,h-.12,z-.16,x+.55,h,z+.16,'metal2',CV);B(x-.45,h-.18,z-.12,x+.45,h-.12,z+.12,'metal',CV)};
  const bollard=(x,z)=>{B(x-.25,0,z-.25,x+.25,.7,z+.25,'metal2');B(x-.36,.7,z-.36,x+.36,.82,z+.36,'metal2')};
  // forklift along x, forks toward +x (d = 1) or -x (d = -1); the guard over the seat is not solid (nobody perches on it)
  const fork=(x,z,d)=>{const X=o=>x+o*d;
    B(X(-1),.15,z-.6,X(.8),1.25,z+.6,'paintY');B(X(-1.3),.15,z-.55,X(-1),1.15,z+.55,'metal');
    for(const [a,b] of [[-.95,-.45],[.3,.8]])for(const [c0,c1] of [[-.72,-.45],[.45,.72]])B(X(a),0,z+c0,X(b),.52,z+c1,'tire');
    for(const a of [-.8,.5])for(const c of [-.55,.49])B(X(a),1.25,z+c,X(a+.06),2.3,z+c+.06,'metal2',CV);B(X(-.85),2.25,z-.6,X(.6),2.33,z+.6,'metal2',CV);
    B(X(.8),.15,z-.5,X(1),2.6,z+.5,'metal2');B(X(1),.08,z-.4,X(2.1),.14,z-.25,'metal2',CV);B(X(1),.08,z+.25,X(2.1),.14,z+.4,'metal2',CV);B(X(-.5),1.25,z-.3,X(0),1.6,z+.3,'tire')};
  // a truck: the cab's front at (cx, cz) facing dir (±1) along ax ('x' / 'z'), a 12 m container (mat) on the trailer behind (15.2 m in all)
  const truck=(cx,cz,ax,dir,mat,cab)=>{const P=(a0,a1,c0,c1,y0,y1,m,o)=>{const A0=(ax==='x'?cx:cz)-dir*a0,A1=(ax==='x'?cx:cz)-dir*a1,K=ax==='x'?cz:cx;
      return ax==='x'?B(A0,y0,K+c0,A1,y1,K+c1,m,o):B(K+c0,y0,A0,K+c1,y1,A1,m,o)};
    P(0,2.8,-1.25,1.25,.55,2.3,cab);P(0,1.6,-1.2,1.2,2.3,3.1,'carGl',{f:{py:cab}});P(1.6,2.8,-1.25,1.25,2.3,3.1,cab);P(0,2.8,-1.25,1.25,3.1,3.2,cab);P(-.12,0,-1.3,1.3,.3,.7,'metal2');
    for(const a of [.5,4.6,11.6,13])for(const c of [-1.35,1.05])P(a,a+1,c,c+.3,0,1,'tire');
    P(2.8,15,-1,1,.6,1.1,'metal2');P(3,15.19,-1.22,1.22,1.1,3.7,mat)};
  // ship-to-shore crane: legs on the rails (x 31.5 / 40.5) at z c ± 6, the portal at 15.5 m, the boom at 30 m from over the yard out over the ship
  const crane=(c,load)=>{const LX=[31.5,40.5],LZ=[c-6,c+6];
    for(const x of LX){for(const z of LZ){B(x-.7,0,z-3.5,x+.7,1.5,z+3.5,Y);B(x-.6,1.5,z-.6,x+.6,15.5,z+.6,Y)}
      B(x-.6,8,LZ[0]+.6,x+.6,9.2,LZ[1]-.6,Y);B(x-.6,15.5,LZ[0]-.6,x+.6,17,LZ[1]+.6,Y);B(x-.6,17,c-.6,x+.6,30,c+.6,Y)}
    for(const z of LZ)B(LX[0]-.6,15.5,z-.6,LX[1]+.6,17,z+.6,Y);
    B(16,30,c-1.6,66,31.6,c+1.6,W);B(17,31.6,c-2.2,27,35,c+2.2,W);B(29.4,31.6,c-.5,30.6,41,c+.5,Y);
    for(let i=0;i<17;i++)B(30.6+i*2,40.47-(i+1)*.53,c-.25,32.6+i*2,41-i*.53,c+.25,Y,CV);// forestay down to the boom tip (overlapping steps)
    for(let i=0;i<6;i++)B(27.6-i*1.8,40.6-(i+1)*1,c-.25,29.4-i*1.8,41-i*1,c+.25,Y,CV);// backstay
    B(36,28.8,c-2,40.4,30,c+2,W);B(36.6,26.4,c-1.3,39.4,28.8,c+1.3,W,{f:{nx:'ptWin',px:'ptWin'}});
    if(load){for(const x of [37.4,39.4])for(const z of [c-1.7,c+1.7])B(x-.04,14.3,z-.04,x+.04,26.4,z+.04,'metal2',CV);
      B(37.2,13.8,c-6.1,39.8,14.3,c+6.1,Y);box(37.28,c-6.09,39.72,c+6.09,0,'ptCB',undefined,11.2)}};

  // ================= ground: asphalt roads, slab paving, the quay apron (its own slab: its face shows over the water) =================
  {const R=[[-28,-32.5,20,-27,'ptAsph'],[-5,-27,5,24,'ptAsph'],[-12,22,12,34,'ptAsph'],[-36,16.2,-12,21.5,'ptAsph'],[12,19,27.56,26,'ptAsph'],
      [-43.6,-11.6,-30.4,13.6,'concf'],[-21.6,-11.6,-10.4,-2.4,'tile']];
    const xs=new Set([-46,30]),zs=new Set([-38,38]);for(const r of R){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}
    const X=[...xs].filter(v=>v<=30).sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
    for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;let m='ptPave';for(const r of R)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
        if(run&&run.m===m)run.x1=X[i+1];else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}
      if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}}
  B(30,-3,-38,42,0,38,'conc',{f:{py:'ptQuay',nx:'none',ny:'none',nz:'none',pz:'none'}});B(42,-3.2,-38,44,-2.2,38,'ptSea',{f:{px:'none',nx:'none',ny:'none',nz:'none',pz:'none'}});
  // road paint: lane edges and the centre line of the mid road, stop lines, the quay's yellow edge and the crane rails
  for(const x of [-4.9,4.7])B(x,0,-26,x+.2,.012,-12.6,'ptLineW',CV),B(x,0,8.2,x+.2,.012,22,'ptLineW',CV);
  for(let z=-25;z<-13;z+=3)B(-.08,0,z,.08,.012,z+1.6,'ptLineW',CV);
  B(-5,0,-11.2,5,.012,-10.8,'ptLineW',CV);B(-5,0,10.6,5,.012,11,'ptLineW',CV);
  for(let x=-26;x<18;x+=3.4)B(x,0,-29.84,x+1.8,.012,-29.66,'ptLineW',CV);
  for(let x=-34;x<-14;x+=3.4)B(x,0,18.76,x+1.8,.012,18.94,'ptLineW',CV);for(let x=14;x<26;x+=3.4)B(x,0,22.41,x+1.8,.012,22.59,'ptLineW',CV);
  B(41.4,0,-34,41.6,.015,34,'ptLineY',CV);for(const x of [31.4,40.4])B(x,0,-38,x+.2,.025,34,'metal2',CV);
  for(const [x0,z0,x1,z1] of [[-12,22,-11.8,34],[11.8,22,12,34]])B(x0,0,z0,x1,.012,z1,'ptLineY',CV);

  // ================= the edges: container stacks four high north, three high west and south; the ship closes the east =================
  yard(10,-36.44,42,-34,4,{out:'nz',v:1});yard(-28,-36.44,-10,-34,4,{out:'nz',v:1});
  yard(-46.44,-26,-44,-12,3,{out:'nx',v:1});yard(-46.44,14,-44,30,3,{out:'nx',v:1});
  yard(-44,30,-12,34.88,3,{out:'pz',v:1});yard(12,30,27.56,34.88,3,{out:'pz',v:1});yard(27.56,34,42,36.44,3,{out:'pz'});
  // ================= the blocks between the lanes =================
  yard(6,-26,20,-12,3,{v:1});yard(10,-12,20,-10,2);yard(-22,-26,-6,-12,3,{v:1});// either side of the CT road to mid
  yard(24,-14,30,-4,3,{v:1});yard(10,-4,30,14,3,{v:1});// between A short, mid, the upper yard and the quay
  yard(6,12,12,22,2);yard(-12,12,-6,22,2);// either side of the T road to mid
  yard(-30,-4,-22,16,3,{v:1});yard(-22,-2,-10,16,3,{v:1});// between mid, the B alley, the shed and the lower yard
  yard(27.56,14,30,20,3);yard(27.56,24,30,34,3);// the wall between the upper yard and the quay, the long doors between
  yard(16,14,24,18.88,2);yard(-26,21,-18,25.88,2);yard(11,-34,16,-31.56,2);// cover blocks: upper yard, lower yard, the CT road to A

  // ================= CT start: the operations building, the road along the north edge =================
  B(-10,0,-40,10,8.4,-34,'ptRender',{f:{nz:'none',ny:'none',px:'none',nx:'none'}});B(-10,8.4,-34.4,10,9,-34,'ptRender',{f:{nz:'none'}});
  B(-10,0,-34.06,10,.5,-34,'conc',CV);
  for(const x of [-8.6,-5.4,3.2,6.4])B(x,1,-34,x+2.2,2.5,-33.95,'ptWin',CV);for(const x of [-8.6,-5.4,-2.2,1,4.2,7.2])B(x,4.3,-34,x+2.2,5.9,-33.95,'ptWin',CV);
  B(-1.4,0,-34,1.4,2.6,-33.92,'door',CV);B(-2.2,2.9,-34,2.2,3.1,-32.6,'metal2');B(-2.2,0,-34,2.2,.16,-33.2,'concf');
  B(-6,6.4,-34,6,7.9,-33.92,'ptSignP',CV);
  car(-9.2,-33.6,-4.9,-31.7,'car');car(4.9,-33.6,9.2,-31.7,'carR');
  jb(-6,-27.2,-3,-26.6);jb(3,-27.2,6,-26.6);pole(-9,-27.6,6);pole(9,-27.6,6);pole(-17,-27,6);pole(16,-27,6);
  truck(-11,-32.4,'x',1,'ptCB','car');
  B(-21,1.8,-26.06,-19.4,3.4,-26,'ptSignB',CV);B(18,1.8,-26.06,19.6,3.4,-26,'ptSignA',CV);
  // the CT road to mid: barriers; the mid doors at its end (a 4 m gap in a concrete wall, one gate leaf run back)
  jb(-5.5,-20.4,-2.5,-19.8);jb(2,-16.6,5,-16);crate(4.4,-24,1.1);crate(-4.6,-13.6,1.1);
  wallX(-6,6,-12.4,-12,0,3.4,'conc',[[-1.6,2.4,0,3]]);B(-1.9,0,-12.6,-1.6,3.6,-11.8,'metal2');B(2.4,0,-12.6,2.7,3.6,-11.8,'metal2');B(-5.8,0,-12.75,-1.9,2.8,-12.45,'ptShut');

  // ================= mid: the customs lane, the X-ray portal with a truck in it, the inspection booth =================
  B(-7.2,0,1,-5.8,6.6,3,W);B(5.8,0,1,7.2,6.6,3,W);B(-7.2,6.6,1,7.2,7.8,3,W);
  for(const z of [.94,3])B(-4.6,6.75,z,4.6,7.65,z+.06,'ptSignX',CV);
  for(const x of [-7.25,5.75])B(x,0,.95,x+1.5,1,3.05,'hazard',CV);
  truck(0,-7.4,'z',-1,'ptCO','carR');
  B(7.6,0,-1.2,9.8,2.7,1.6,'ptRender');B(7.4,2.7,-1.4,10,2.9,1.8,'roof',{f:{ny:'metal2'}});B(7.54,1.1,-.8,7.6,2.1,1.2,'ptWin',CV);B(8,1.1,1.6,9.4,2.1,1.66,'ptWin',CV);
  jb(-8.6,-.6,-5.6,0);jb(3,8.8,6,9.4);jb(-6.2,5.2,-3.2,5.8);jb(4.4,-10.6,7.4,-10);
  drum(-9.2,9.4);drum(-8.6,10,0,'drumR');crate(8.8,10.6,1.2);crate(8.8,9.4,1);
  B(9.94,1.8,-3.4,10,3.4,-1.8,'ptSignA',CV);B(-10,1.8,-11.4,-9.94,3.4,-9.8,'ptSignB',CV);
  // the south end: a glass booth and a boom barrier across the T road
  B(-4.4,0,12.6,-2.6,2.4,14.2,'ptWin',{f:{py:'metal2'}});B(-4.6,2.4,12.4,-2.4,2.6,14.4,'metal2');B(-2.6,.95,13.3,4.6,1.07,13.42,'hazard',CV);B(4.5,0,13.2,4.8,1.1,13.5,'metal2');

  // ================= A short: the alley out of mid's north-east corner, turning north onto the site =================
  crate(14.5,-8.6,1.2);crate(15.7,-8.6,1.2);crate(15.1,-8.6,1.1,1.2);fork(12.6,-5.4,1);
  B(18.4,0,-6,19.6,.14,-4.8,'pallet');B(18.4,.14,-6,19.6,.28,-4.8,'pallet');drum(22.8,-4.8);drum(23.3,-5.4,0,'drumR');
  B(15,1.8,-10,16.6,3.4,-9.94,'ptSignA',CV);

  // ================= A: the crane berth =================
  crane(-21,true);
  box(23,-22.2,29,-19.76,0,'ptCG');box(23,-22.2,29,-19.76,1,'ptCR');// the A box
  box(22,-34,34,-31.56,0,'ptCO');stairs('x',-34,-31.56,18.2,22,0,2.6,8,'plate');// the platform at the back and its steps
  B(28.6,2.6,-32.2,30.6,3.3,-31.56,'sandbag');
  box(37,-33,39.44,-27,0,'ptCB');// back of the site
  crate(26.2,-17.4,1.2);crate(27.4,-17.4,1.2);crate(26.8,-17.4,1.1,1.2);
  B(21,0,-29,23,1.4,-27,'fence',{pass:1});B(20.95,1.4,-29.05,23.05,1.5,-26.95,'metal2');
  drum(35.5,-31.6);drum(36.1,-31,0,'drumR');
  B(37,0,-10.8,41,.6,-7.8,'plate');B(37.3,.6,-10.5,40.7,1.2,-8.1,'plate');// hatch covers landed on the quay (cover out of A long)
  B(30.5,0,-24,36.5,.012,-18,'ptDecA',{nosolid:true,f:{px:'none',nx:'none',pz:'none',nz:'none',ny:'none'}});
  B(30,4.2,-34,33,7.2,-33.94,'ptSignA',CV);B(25,1.6,-14.06,27,3.6,-14,'ptSignA',CV);

  // ================= the quay (A long): bollards, a terminal truck, the long doors, the pit at the south end =================
  for(const z of [-31,-7,5,17,29])bollard(41.55,z);
  truck(35.1,-3,'z',-1,'ptCR','paintY');
  crate(31,15,1.2);crate(31,16.2,1.2);crate(31.6,15.6,1.1,1.2);
  B(27.56,3.2,20,30,3.6,24,'metal2');B(30,0,16.4,30.14,3,20,'ptShut');B(30,0,24,30.14,3,27.6,'ptShut');
  B(27.5,1.8,24.6,27.56,3.4,26.2,'ptSignA',CV);
  box(37,31,42,33.44,0,'ptCW');B(31,0,27,33,1.4,29,'fence',{pass:1});B(30.95,1.4,26.95,33.05,1.5,29.05,'metal2');drum(32,32.6);drum(32.7,33.1,0,'drumR');drum(35,33.2);
  B(33.3,0,31.3,33.7,22,31.7,'metal2');B(32.2,22,30.8,34.8,23,32.2,'metal2');// a high-mast lighting tower

  // ================= B: the cold store, its loading dock and the yard in front =================
  {const PN='ptPanel';
    wallX(-44,-28,-26.4,-26,0,9,PN,[[-40.5,-37.5,1.2,4.6],[-33.5,-30.5,1.2,4.6]]);B(-44,0,-36,-43.6,9,-26.4,PN,{f:{nx:'none'}});B(-44,0,-36,-28,9,-35.6,PN,{f:{nz:'none'}});B(-28.4,0,-35.6,-28,9,-26.4,PN);
    B(-44,9,-36,-28,9.4,-26,'roof',{f:{ny:PN}});for(const x of [-40.7,-33.7])B(x,4.6,-26,x+3.4,5.3,-25.8,'ptShut',CV);
    B(-43.6,0,-35.6,-28.4,1.2,-26.4,'conc',{f:{py:'concf'}});
    B(-43.6,1.2,-35.6,-42.4,5.6,-28,'ptRack');B(-35,1.2,-35.6,-29,5.6,-34.4,'ptRack');B(-40.6,1.2,-33.4,-37.6,4.4,-30.4,'ptRack');
    crate(-33.4,-29.2,1.1,1.2);crate(-32.2,-29.2,1.1,1.2);crate(-32.8,-29.2,1,2.3);crate(-36,-27.6,1,1.2);B(-30.4,1.2,-31.4,-29.2,1.34,-30.2,'pallet');
    for(const [x,z,r,k] of [[-38.3,-30.6,13,.95],[-31.5,-30.6,11,.85]]){B(x-1,8.55,z-.15,x+1,8.7,z+.15,'lampW',CV);LIGHT(x,7.6,z,'#dcecff',r,k)}
    // the dock (1.2 m) and its steps at both ends; bumpers, an edge line
    B(-44,0,-26,-28,1.2,-23,'conc',{f:{py:'concf'}});stairs('x',-26,-23,-25.2,-28,0,1.2,4,'conc');stairs('z',-44,-41.6,-19.4,-23,0,1.2,4,'conc');
    B(-44,1.2,-23.3,-41.6,1.215,-23.1,'ptLineY',CV);B(-41.6,1.2,-23.3,-28,1.215,-23.1,'ptLineY',CV);
    for(const x of [-39,-35,-31])B(x-.3,.2,-23,x+.3,1,-22.82,'tire',CV);
    B(-41,1.2,-25.6,-39.8,1.34,-24.4,'pallet');crate(-40.4,-25,1.1,1.34);crate(-30.6,-24.8,1.1,1.2);crate(-31.7,-24.8,1,1.2)}
  box(-38,-19.2,-32,-16.76,0,'ptCW');box(-38,-19.2,-32,-16.76,1,'ptCW');// reefers: the B box
  box(-26.44,-22,-24,-16,0,'ptCB');fork(-30.6,-20.6,-1);drum(-42.6,-14.4);drum(-42,-13.8,0,'drumR');drum(-24.6,-13.4);
  B(-36.4,0,-23,-32.8,.012,-19.4,'ptDecB',{nosolid:true,f:{px:'none',nx:'none',pz:'none',nz:'none',ny:'none'}});
  B(-36.5,5,-26,-34.5,7,-25.94,'ptSignB',CV);B(-22.06,1.6,-20,-22,3.6,-18,'ptSignB',CV);

  // ================= the customs hall: through from mid (east door, a window onto mid) to the B alley (west door) =================
  {const RN='ptRender';
    wallZ(-10.4,-10,-11.6,-2.4,0,4.2,RN,[[-9.2,-6.2,0,2.6],[-5.4,-3,1.1,2.3]],{f:{nx:'plaster'}});wallZ(-22,-21.6,-11.6,-2.4,0,4.2,RN,[[-10.4,-7.4,0,2.6]],{f:{px:'plaster'}});
    B(-22,0,-12,-10,4.2,-11.6,RN,{f:{pz:'plaster'}});B(-22,0,-2.4,-10,4.2,-2,RN,{f:{nz:'plaster'}});B(-22,4.2,-12,-10,4.5,-2,'roof',{f:{ny:'plaster'}});
    B(-10.45,1,-5.45,-9.95,1.1,-2.95,'metal2');B(-10,2.75,-9.6,-9.94,3.75,-5.8,'ptSignC',CV);
    B(-20.4,0,-11.4,-17.2,.75,-10.4,'metal');B(-17.2,0,-11.6,-14.2,1.6,-10.2,'metal2');B(-14.2,0,-11.4,-11,.75,-10.4,'metal');monitor(-16.4,1.6,-10.9,-15.6,2.05,-10.8,'pz');
    B(-19.5,0,-5.2,-15.5,.9,-4,'metal2',{f:{py:'plate'}});B(-14.5,0,-5.2,-11.5,.9,-4,'metal2',{f:{py:'plate'}});B(-21.4,0,-3.4,-19,.45,-2.6,'wood');
    for(const [x,z,r,k] of [[-16,-7,11,.95],[-12.6,-3.6,7,.6]]){B(x-.9,4.1,z-.15,x+.9,4.2,z+.15,'lampW',CV);LIGHT(x,3.8,z,'#eef2ff',r,k)}}
  // the B alley behind it
  drum(-29.3,-5);drum(-28.7,-4.6,0,'drumR');crate(-23.2,-5.2,1.2);B(-29.7,0,-10.4,-28.1,1.4,-7.8,'ptCG',{f:{py:'metal'}});

  // ================= B tunnel: the transit shed along the west edge, racks down both sides of one aisle =================
  {const CL='ptClad';
    B(-44,0,-12,-43.6,7.5,14,CL,{f:{nx:'none'}});B(-30.4,0,-12,-30,7.5,14,CL);
    wallX(-44,-30,-12,-11.6,0,7.5,CL,[[-41,-36,0,4.6]]);wallX(-44,-30,13.6,14,0,7.5,CL,[[-41,-36,0,4.6]]);B(-44,7.5,-12,-30,7.8,14,'roof',{f:{ny:'metal'}});
    for(const z of [-12.05,13.55])for(const x of [-41.15,-36])B(x,0,z,x+.15,4.6,z+.5,'hazard',CV);
    B(-43.6,0,-9,-42.2,5,11,'ptRack');B(-34.4,0,-9,-30.4,5,11,'ptRack');
    crate(-37.5,-6,1.2);crate(-36.3,-6,1.2);crate(-36.9,-6,1.1,1.2);B(-41,0,1.2,-39,1.1,2.8,'wood');B(-40.8,1.1,1.4,-39.2,1.9,2.6,'bag');
    fork(-36.6,7,1);crate(-39.6,11.6,1.2);crate(-40.8,11.6,1);
    for(const z of [-7,0,7]){B(-39.3,7.32,z-.15,-37.3,7.45,z+.15,'lampW',CV);LIGHT(-38.3,6.9,z,'#fff0d8',11,.9)}
    B(-39.5,5,-11.6,-37.5,6.6,-11.54,'ptSignB',CV);B(-35.5,1.8,14,-33.9,3.4,14.06,'ptSignB',CV)}

  // ================= T start: the truck gate (closed), its canopy and booths =================
  B(-12,0,34,12,3.2,35,'conc',{f:{pz:'none'}});B(-5,0,33.94,5,3,34,'ptShut',CV);
  for(const x of [-6.3,5.7])B(x,3.2,34.05,x+.6,4.8,34.25,'metal2');B(-6,3.4,34.05,6,4.7,34.25,'ptSignP',CV);
  B(-10,4.6,29,10,5,33.6,'roof',{f:{ny:'metal2'}});for(const x of [-9.8,9.4])for(const z of [29.2,33.2])B(x,0,z,x+.4,4.6,z+.4,'metal2');
  for(const s of [-1,1]){const x0=s<0?-8.6:6.4;B(x0,0,30.2,x0+2.2,2.6,32.6,'ptRender');B(s<0?-6.42:6.36,1.1,30.5,s<0?-6.36:6.42,2.1,32.3,'ptWin',CV);
    B(s<0?-6.4:5.4,.95,30.95,s<0?-5.4:6.4,1.07,31.07,'hazard',CV)}
  jb(-9,23.4,-6,24);jb(6,23.4,9,24);cone(-2.5,32.5);cone(0,32.5);cone(2.5,32.5);

  // ================= the lower yard (T side, west): a reach stacker, a container, barriers =================
  B(-37,.6,23.2,-31,1.9,26.8,'paintY');B(-33,1.9,23.4,-31.4,3.5,24.8,'paintY',{f:{nx:'carGl',px:'carGl'}});B(-31.2,.6,23.4,-30.6,1.8,26.6,'metal');
  for(const x of [-36.4,-32.6])for(const z of [22.8,26.8])B(x,0,z-.4,x+1.2,1.3,z,'tire');B(-38.5,2.1,24.6,-31.8,2.9,25.4,'paintY');
  box(-41,17.2,-35,19.64,0,'ptCB');jb(-24,17,-21,17.6);drum(-14.2,17.2);drum(-14.8,17.6,0,'drumR');crate(-16.6,28.4,1.2);

  // ================= the upper yard (T side, east): a truck parked along the back, barriers =================
  truck(12.2,28.02,'x',-1,'ptCG','car');jb(19,22.6,22,23.2);drum(25.5,19.6);drum(26.2,20.2,0,'drumR');cone(13.4,19.4);cone(13.4,21);

  // ================= scenery: the ship along the quay, a second crane to the north, warehouses outside =================
  {const SF={f:{px:'none',py:'none',ny:'none',nz:'none',pz:'none'}};B(42.5,-3,-40,60,7.5,38,'ptHull',SF);B(42.5,7.5,-40,42.9,8.7,22,'ptHull',SF);
    for(let b=0;b<5;b++){const z0=-38+b*12.9,len=b<4?12.19:6.06;for(let r=0;r<3;r++){const x0=43.2+r*CW,h=3+Math.floor(hash2(b,r,3401)*3);
        for(let k=0;k<h;k++)box(x0,z0,x0+CW,z0+len,k,ccol(b,r,k,3402),{f:{px:'none',py:'none',ny:'none'}},7.5)}}
    B(43.4,7.5,24,57,25,34,'ptSuper',{f:{px:'none',ny:'none'}});B(42.6,22,24.5,57,24,33.5,'ptSuper',{f:{px:'none'}});
    B(50,25,27.5,54,30,31,W,{f:{ny:'none'}});B(50,30,27.5,54,31.2,31,'ptCR',{f:{ny:'none'}});B(46,25,28.8,46.3,31,29.2,'metal2')}
  crane(-50,false);
  B(-44,0,46,-14,13,64,'ptClad',{f:{px:'none',nx:'none',py:'none',ny:'none',pz:'none'}});B(8,0,48,40,11,60,'ptPanel',{f:{px:'none',nx:'none',py:'none',ny:'none',pz:'none'}});
  B(-36,0,-72,6,15,-46,'ptPanel',{f:{px:'none',nx:'none',py:'none',ny:'none',nz:'none'}});B(-80,0,-34,-56,12,30,'ptClad',{f:{nx:'none',py:'none',ny:'none',nz:'none',pz:'none'}});

  // ================= spawns, camps, the sun, the title camera =================
  MAP.spawns=[];for(const x of [-8,-5,-2,2,5,8])for(const z of [-30.6,-28])MAP.spawns.push([x+rr(-.3,.3),z+rr(-.2,.2),0,Math.PI+rr(-.3,.3)]);
  MAP.zspawns=[];for(const x of [-9,-5.5,-2,2,5.5,9])for(const z of [25.2,28])MAP.zspawns.push([x+rr(-.3,.3),z+rr(-.2,.2),0]);
  MAP.camps=[
    {k:'aplat',w:.3,p:[[25,2.6,-32.8],[31,2.6,-32.8]],look:[30,1,-18]},
    {k:'dock',w:.3,p:[[-40,1.2,-24.4],[-31,1.2,-24.4]],look:[-34,1,-16]},
    {k:'customs',w:.2,p:[[-12,0,-9.6],[-20,0,-3.6]],look:[-16,1,-7]},
    {k:'cold',w:.2,p:[[-36,1.2,-33.6],[-30,1.2,-28]],look:[-36,2,-27]},
  ];
  MAP.spawnYaw=null;
  MAP.moon={d:new THREE.Vector3(-.5,.7,.5).normalize(),c:new THREE.Color('#fff0dc'),i:.92};
  MAP.cam=(t,cam)=>{const a=t*.03+.5;cam.position.set(10+Math.sin(a)*22,19+1.5*Math.sin(t*.07),-6+Math.cos(a)*22);cam.lookAt(24,5,-18)};// (above every stack, clear of the crane's portal)
}
MAPDEFS.port={n:['항만 터미널','Harbor Terminal'],d:['대낮의 컨테이너 부두. 크레인 선석 A와 냉동창고 하역장 B, 세관 검사장이 있는 중앙 — 세 갈래 길에서 맞붙는 대인전 전용맵.',
    'A container port on a clear afternoon. The crane berth (A), the cold store\'s loading dock (B) and the customs lane in the middle: three ways across, made for player-versus-player.'],
  pvp:1,env:{sky:1,sun:1,skyTex:'skyDay',halo:'#fff2dc',rain:0,storm:0,fog:'#b6c4d2',fogD:.0085,bloomThr:.9,ambOut:'#6e7c90',ambIn:'#363b44',boAmb:.6},
  bounds:[-46,-38,44,38],probeY:[.9,2.2,3.6,5.2],mini:[2],tex:bakePtTex,build:buildPort,
  // 폭파미션: the two bomb sites (centre, radius), the ways the attackers go in (points to walk through) and where the defenders hold
  bomb:{A:{x:33.5,z:-21,r:6.5},B:{x:-35,z:-20.5,r:6.5},
    way:{A:[[36,10],[17,-7]],B:[[-38,2],[-16,-7.6]]},
    hold:{A:[[24.5,-28,0],[38.4,-29.4,0],[28,-32.8,2.6],[33.5,-13.6,0],[21.4,-16.6,0],[35,-26,0]],B:[[-26,-30,0],[-40,-24.4,1.2],[-30.6,-24.4,1.2],[-25,-14,0],[-42,-14.6,0],[-34,-15,0]]}}};

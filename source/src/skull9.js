'use strict';
// ============ SKULL-9 (스컬-9): a two-handed battle axe ============
// CSO's name, numbers and moves; the model (boxes), its textures and its sounds are drawn / synthesised here (original designs).
// Left click: a wide horizontal sweep from right to left that catches up to three zombies in front of you.
// Right click: hauled up overhead, a beat, then slammed down — the heaviest melee blow in the game: it pops up to two zombies into
// the air, staggers them for a long time and shakes the ground. Two hands on a long haft: slow to draw, slow to swing, and you walk
// slower with it (more so while a swing is under way).

// ---------- atlas materials ----------
const SK_MATS=['skSteel','skHaft','skWire','skBone'];
for(const m of SK_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintSkAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  // alpha = gloss level for the character shader (240..254 = sheen)
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=80)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // blackened blade steel: faint hammer dents, etched veins catching the light, old blood in the pits
  patch('skSteel',(xx,y,X,Y)=>{const t=nz(X,Y,111,14)+(hash2(X,Y,112)-.5)*.06;let c=mix('#1f2125','#3a3d42',clamp((t-.3)*1.6,0,1));
    const d=Math.hypot(((xx+5)%13)-6.5,((y+(Math.floor(xx/13)%2)*6)%13)-6.5);if(d<3.2)c=d<2?dk(c,.18):lt(c,.05);
    const v=Math.abs(Math.sin(xx*.09+Math.sin(y*.07)*2.6+nz(X,Y,113,30)*3));if(v<.045)c='#5a5e64';else if(v<.09)c=dk(c,.2);
    if(nz(X,Y,114,9)>.7)c=mix(c,'#3a0d0a',.55);return c},250);
  // haft: near-black wood under a tight leather binding
  patch('skHaft',(xx,y,X,Y)=>{const g=Math.sin(y*.4+nz(X,Y,116,20)*5)*.5+.5;let c=mix('#100e0d','#221c18',g*.6+nz(X,Y,117,8)*.4);
    const w=(xx+y*.55)%16;if(w<1)c='#080707';else if(w<2)c=lt(c,.04);if(hash2(X,Y,118)<.015)c='#2e2520';return c},244);
  // wire: twisted strands, bright where they turn toward the light
  patch('skWire',(xx,y,X,Y)=>{const s=(xx+y)%8,u=(xx-y+256)%8;let c=s<2?'#25272b':s<5?'#6e7278':'#9ea2a8';if(u<1)c='#1a1b1e';if(hash2(X,Y,119)<.04)c='#c8ccd0';return c},252);
  // old bone: yellowed, cracked, dirt in the cracks
  patch('skBone',(xx,y,X,Y)=>{const t=nz(X,Y,120,12);let c=t>.6?'#d6caa8':t<.4?'#a69674':'#c0b28e';const cr=Math.abs(Math.sin(xx*.21+Math.sin(y*.17)*2.2)*9-((y*.35)%9));
    if(cr<.7)c='#4e4232';if(nz(X,Y,121,20)>.66)c=dk(c,.3);return c},246);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}

// ---------- model ----------
// gun frame: origin on the haft where the right hand holds it, the head along -Z, the blade's edge toward +Y. The left hand holds the
// wire-bound end near the pommel. A bearded crescent blade (its body between two arcs through the horn tips, a polished edge along
// the outer one), a skull on both faces, a hooked spike behind, a spear point on top, thorns along the haft.
const SK={zL:.42,zH:-.5};
// circle through three points of the blade's plane (z, y) → [centre z, centre y, radius]
function skCirc(a,b,c){const [x1,y1]=a,[x2,y2]=b,[x3,y3]=c,d=2*(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2)),s1=x1*x1+y1*y1,s2=x2*x2+y2*y2,s3=x3*x3+y3*y3;
  const cx=(s1*(y2-y3)+s2*(y3-y1)+s3*(y1-y2))/d,cy=(s1*(x3-x2)+s2*(x1-x3)+s3*(x2-x1))/d;return [cx,cy,Math.hypot(x1-cx,y1-cy)]}
// the beard's tip low toward the hands, the upper horn past the top of the haft, the widest point nearer the beard
SK.T1=[-.14,.03];SK.T2=[-.84,.075];SK.O=skCirc(SK.T1,[-.45,.31],SK.T2);SK.I=skCirc(SK.T1,[-.49,.205],SK.T2);
const skArc=(C,z)=>C[1]+Math.sqrt(Math.max(0,C[2]*C[2]-(z-C[0])*(z-C[0])));
// the blade's lower boundary: the inner arc on the horns, dipping to the haft round the socket
const skIn=z=>Math.max(.02,Math.min(skArc(SK.I,z),.02+16*(z-SK.zH)*(z-SK.zH)));
// points along an arc of circle C from z0 to z1 (n segments), inset by `in` from it
function skArcPts(C,z0,z1,n,ins){const a0=Math.atan2(C[0]-z0,skArc(C,z0)-C[1]),a1=Math.atan2(C[0]-z1,skArc(C,z1)-C[1]),r=C[2]-(ins||0),P=[];
  for(let i=0;i<=n;i++){const t=a0+(a1-a0)*i/n;P.push([C[0]-r*Math.sin(t),C[1]+r*Math.cos(t)])}return P}
function skParts(){const P=[];const D=.785;
  // haft, binding and collars
  P.push(Pt(0,0,-.1,.034,.034,.74,'skHaft'),Pt(0,0,.33,.036,.036,.14,'skHaft'),Pt(0,0,-.69,.03,.03,.06,'skHaft'));
  P.push(Pt(0,0,.255,.048,.048,.018,'blk'),Pt(0,0,.07,.041,.041,.01,'steel'),Pt(0,0,-.07,.041,.041,.01,'steel'),Pt(0,0,-.355,.046,.046,.022,'blk'));
  // the left hand's end: barbed wire wound both ways over the haft, barbs sticking out
  P.push(Pt(0,0,.42,.04,.04,.18,'skHaft'));
  for(let i=0;i<9;i++){const z=.345+i*.019;P.push(Pt(0,0,z,.046,.046,.006,'skWire',{rx:i%2?.36:-.36,r:.002}));
    if(i%2===0)for(let k=0;k<3;k++){const a=k/3*TAU+i*.9;P.push(Pt(Math.cos(a)*.025,Math.sin(a)*.025,z,.003,.003,.018,'steel',{rx:.7*Math.sin(a+i),ry:.7*Math.cos(a+i),r:.001}))}}
  // pommel: a collar and a four-sided spike
  P.push(Pt(0,0,.52,.05,.05,.024,'blk'),Pt(0,0,.545,.034,.034,.03,'skSteel',{rz:D}),Pt(0,0,.578,.022,.022,.036,'skSteel',{rz:D}),Pt(0,0,.612,.011,.011,.034,'bright',{rz:D}));
  // thorns along the back of the haft, growing toward the head
  for(let i=0;i<4;i++){const z=-.12-i*.055,s=.65+i*.13;P.push(Pt(0,-.022,z,.014*s,.016*s,.016*s,'skSteel',{rx:D,r:.002}),segV(-.026,z,-.026-.034*s,z+.012*s,0,.008*s,.009*s,'skSteel',{r:.002}),
    segV(-.026-.03*s,z+.01*s,-.026-.044*s,z+.016*s,0,.005*s,.005*s,'bright',{r:.001}))}
  // the head's socket round the haft and its collars
  P.push(Pt(0,0,SK.zH,.05,.062,.22,'skSteel'),Pt(0,0,SK.zH+.115,.056,.068,.016,'blk'),Pt(0,0,SK.zH-.115,.056,.068,.016,'blk'),Pt(0,.034,SK.zH,.054,.012,.16,'blk'));
  // blade body: thin slices from the lower boundary to just short of the edge
  const z0=SK.T2[0]+.01,z1=SK.T1[0]-.01,N=34,dz=(z1-z0)/N;
  for(let i=0;i<=N;i++){const z=z0+dz*i,yo=skArc(SK.O,z)-.015,yi=skIn(z);if(yo-yi<.006)continue;P.push(Pt(0,(yo+yi)/2,z,.014,yo-yi,dz+.005,'skSteel',{r:.002}))}
  // the polished edge along the outer arc, thinner than the body (a ground bevel), and a dark line where the bevel starts
  const ext=(a,b,k)=>{const mz=(a[0]+b[0])/2,my=(a[1]+b[1])/2;return [my+(a[1]-my)*k,mz+(a[0]-mz)*k,my+(b[1]-my)*k,mz+(b[0]-mz)*k]};// a segment stretched about its middle
  const E=skArcPts(SK.O,SK.T1[0],SK.T2[0],30,.009);for(let i=0;i<E.length-1;i++){const [ya,za,yb,zb]=ext(E[i],E[i+1],1.2);P.push(segV(ya,za,yb,zb,0,.009,.02,'bright',{r:.002}))}
  const B=skArcPts(SK.O,SK.T1[0]-.03,SK.T2[0]+.03,24,.024);for(let i=0;i<B.length-1;i++){const [ya,za,yb,zb]=ext(B[i],B[i+1],1.15);P.push(segV(ya,za,yb,zb,0,.0152,.005,'blk',{r:.001}))}
  for(const [a0,a1] of [[SK.T1[0]-.008,SK.zH+.075],[SK.zH-.075,SK.T2[0]+.008]]){const n=10;for(let i=0;i<n;i++){const za=a0+(a1-a0)*i/n,zb=a0+(a1-a0)*(i+1)/n;
    const [ya2,za2,yb2,zb2]=ext([za,skIn(za)+.004],[zb,skIn(zb)+.004],1.25);P.push(segV(ya2,za2,yb2,zb2,0,.016,.012,'skSteel',{r:.002}))}}
  // the horn tips: hooked points curling back toward the haft
  P.push(segV(SK.T1[1]+.012,SK.T1[0]-.012,SK.T1[1]-.012,SK.T1[0]+.018,0,.008,.012,'bright',{r:.002}),segV(SK.T2[1]+.012,SK.T2[0]+.012,SK.T2[1]-.014,SK.T2[0]-.016,0,.008,.012,'bright',{r:.002}));
  // jagged teeth along the inner curve of both horns
  for(const z of [-.22,-.27,-.32,-.68,-.73,-.78]){const y=skIn(z);P.push(Pt(0,y-.004,z,.012,.022,.022,'skSteel',{rx:D,r:.002}))}
  // the skull, standing out of both faces of the blade over the socket
  const zs=SK.zH+.035,ys=.13;
  for(const sx of [-1,1]){const x=v=>sx*(.007+v);
    P.push(Pt(x(.012),ys,zs,.024,.074,.07,'skBone',{r:.018}),Pt(x(.016),ys+.012,zs,.018,.05,.056,'skBone',{r:.014}),Pt(x(.011),ys-.046,zs,.02,.03,.046,'skBone',{r:.008}));// cranium, brow, jaw
    for(const d of [-.017,.017])P.push(Pt(x(.025),ys-.004,zs+d,.004,.019,.018,'muzzle',{r:.006}),Pt(x(.026),ys-.005,zs+d,.002,.006,.006,'dred',{r:.002}));// sockets, a dull red glint
    P.push(Pt(x(.024),ys-.027,zs,.004,.012,.01,'muzzle',{r:.003}));// nose
    for(let k=0;k<5;k++)P.push(Pt(x(.021),ys-.045,zs-.018+k*.009,.004,.012,.006,'white',{r:.001}));// teeth
    for(const d of [-1,1])P.push(segV(ys+.028,zs+d*.02,ys+.046,zs+d*.048,x(.012),.013,.013,'skBone',{r:.004}),segV(ys+.046,zs+d*.046,ys+.036,zs+d*.07,x(.012),.01,.01,'skBone',{r:.003}),
      segV(ys+.038,zs+d*.068,ys+.018,zs+d*.074,x(.012),.007,.007,'skBone',{r:.002}))}// ram horns curling out and down
  // the hooked spike behind the head, bending back toward the hands
  const hk=[[SK.zH-.02,-.03,.07,.022],[SK.zH-.02,-.1,.05,.018],[SK.zH+.03,-.15,.036,.015],[SK.zH+.09,-.175,.022,.012],[SK.zH+.14,-.18,.012,.009]];
  for(let i=0;i<hk.length-1;i++){const [za,ya,ha,wa]=hk[i],[zb,yb]=hk[i+1];P.push(segV(ya,za,yb,zb,0,wa,ha,i===hk.length-2?'bright':'skSteel',{r:.003}))}
  // spear point on top
  P.push(Pt(0,0,-.72,.034,.034,.08,'skSteel',{rz:D}),Pt(0,0,-.79,.024,.024,.08,'skSteel',{rz:D}),Pt(0,0,-.855,.014,.014,.07,'skSteel',{rz:D}),Pt(0,0,-.9,.007,.007,.04,'bright',{rz:D}));
  return P}

// ---------- first-person rest pose: camera-space description → the root transform ----------
// a pose = where the right hand's point on the haft is, which way the head points, which way the blade's edge faces (camera space)
const _skM=new THREE.Matrix4(),_skE=new THREE.Euler(),_skQ=new THREE.Quaternion(),_skA=new THREE.Vector3(),_skB=new THREE.Vector3(),_skC=new THREE.Vector3();
function skBasis(d,b){const Z=new THREE.Vector3(-d[0],-d[1],-d[2]).normalize(),Y=new THREE.Vector3(b[0],b[1],b[2]);Y.addScaledVector(Z,-Y.dot(Z)).normalize();
  return [new THREE.Vector3().crossVectors(Y,Z),Y,Z]}
function skPose(p,d,b){const [X,Y,Z]=skBasis(d,b);_skM.makeBasis(X,Y,Z);_skE.setFromRotationMatrix(_skM,'XYZ');return {p:p.slice(),r:[_skE.x,_skE.y,_skE.z]}}
const SK_REST={p:[.2,-.16,-.52],d:[.8,.08,-.6],b:[-.45,.88,.15]};
VM_POS.skull9=skPose(SK_REST.p,SK_REST.d,SK_REST.b);
// elbows at rest (camera space): the right one low and out to the right, the left one low on the left
const SK_ELB=[[-.34,-.5,-.02],[.42,-.52,-.18]];
// a fist round the haft: the haft runs across the palm (the hand's x axis along it, thumbs toward the head); its centre sits this far
// from the wrist in the hand's own space
const SK_FIST=[0,-.042,-.056];
// hand frame for a fist round the haft at gun-space point hp with the forearm toward gun-space point e
function skHand(hp,e,left){_skA.set(e[0]-hp[0],e[1]-hp[1],0);if(_skA.lengthSq()<1e-6)_skA.set(0,-1,0);const f=_skA.normalize();const X=new THREE.Vector3(0,0,left?-1:1),Z=f.clone(),Y=new THREE.Vector3().crossVectors(Z,X);
  const w=new THREE.Vector3(hp[0],hp[1],hp[2]).addScaledVector(Y,-SK_FIST[1]).addScaledVector(Z,-SK_FIST[2]);return {X,Y,Z,w}}
// rest pose of the arms (buildVM hook): both fists closed round the haft, forearms toward the rest elbows
function skVmArms(armR,armL){const P=VM_POS.skull9;_skE.set(P.r[0],P.r[1],P.r[2],'XYZ');_skQ.setFromEuler(_skE).invert();
  // the swings turn the gun on a pivot between the root and the gun (see skClip)
  const gun=armR.parent,root=gun&&gun.parent;if(root&&!gun.userData.piv){const pv=new THREE.Group();root.remove(gun);pv.add(gun);root.add(pv);gun.userData.piv=pv}
  for(const [arm,z,e,left] of [[armR,0,SK_ELB[1],false],[armL,SK.zL,SK_ELB[0],true]]){if(!arm)continue;
    const eg=_skB.set(e[0]-P.p[0],e[1]-P.p[1],e[2]-P.p[2]).applyQuaternion(_skQ);const H=skHand([0,0,z],[eg.x,eg.y,eg.z],left);
    arm.position.copy(H.w);_skM.makeBasis(H.X,H.Y,H.Z);arm.quaternion.setFromRotationMatrix(_skM);arm.visible=true;if(arm.userData.hand)arm.userData.hand.rest=.95;vmHandCurl(arm,.95)}}
GUNS.skull9={parts:skParts(),grip:[0,0,0],sup:[0,0,SK.zL],muzzle:[0,.2,SK.zH],vmFix:skVmArms};

// ---------- stats ----------
// light: a wide sweep, three at most, thrown forward and to the left; heavy: a slam, two at most, popped up and staggered for long.
// cleave/arc per attack (light, heavy): how many it can hit and the cone (cosine) it reaches over; kbL = sideways share of the sweep's push
WPN.skull9={slot:3,kind:'melee',n:['스컬-9','SKULL-9'],cost:3000,dmg:[230,520],rate:[1.05,1.65],range:[2.7,2.9],kb:[13,20],up:[0,6],stag:[.6,1.6],
  speed:.85,draw:1.3,model:'skull9',hold:'skull9',sw:.55,hitT:[.38,.66],anD:[.83,1.5],cleave:[3,2],arc:[.2,.7],kbL:[.45,0],shk:[.32,.7],slam:1,noDC:1,
  swS:'skswing',hitS:'skhit',drawS:'skdraw',atkSpd:[.8,.55]};
BUY_MENU.find(c=>c.k==='special').items.push('skull9');
// third person: held up in front of the right shoulder like the sledge; the sweep and the shoulder turn are its own (KF.skA / skTw below)
HOLDS.skull9={off:[-.02,-.3,-.16],rx:1.15,rz:Math.PI,ham:1,kA:'skA',kH:'skH',twA:'skTw'};
GUNS.skull9.trail=[0,.08,SK.zH,0,.27,SK.zH];// the motion trail runs across the blade, haft side to edge
// draw: hauled up from low on the right, the weight carrying it a little past the rest pose before it settles
VMK.drS=[[0,[.12,-.36,.14,-1.1,.3,.45]],[.62,[0,.018,0,.1,0,-.05]],[.86,[0,-.006,0,-.02,0,.01]],[1,[0,0,0,0,0,0]]];

// ---------- first-person swings ----------
// A swing is a clip on the first-draw engine (vmdraw.js): it keeps both fists closed round the haft (R / H tracks, forearms toward
// elbows that travel with the stroke), times the sounds, rolls the camera and holds still for a beat on impact (hit-stop). The axe
// itself turns too far for the engine's Euler track (more than half a turn from the wind-up to the follow-through), so its pose is
// keyed here as a quaternion from the rest pose (each key on the same side as the one before), run through the same monotone cubic
// component by component and renormalised, on a pivot between the view model's root and the gun (springs, bob and draw still act
// on the root). Neighbouring keys stay well under half a turn apart.
// Keys, in seconds: [t, grip point (the haft at the right hand's rest place), head direction, edge direction, right elbow, left elbow,
// where the right hand holds the haft (gun z: 0 at rest, toward the pommel when it slides down for the slam)], all camera space.
// The blow lands at WPN.skull9.hitT; the clip runs until just before the next swing may start.
const SK_SW={
  // forehand sweep: lifted and cocked out to the right with the edge turned forward (the head just showing at the edge of the view), a
  // beat, then thrown across: the hands lead to the left and the head whips through the middle at the hit, on round to the left, the
  // right arm across the body; brought back, the edge rolling up
  light:[[0,null],
    [.12,[.26,-.15,-.47],[.9,.15,-.4],[-.35,.88,-.25],[.48,-.45,-.15],[-.3,-.5,-.03]],
    [.26,[.32,-.15,-.42],[.82,.3,-.48],[-.35,.2,-.92],[.6,-.3,-.1],[-.1,-.5,-.05]],
    [.31,[.33,-.145,-.41],[.8,.32,-.5],[-.33,.2,-.92],[.61,-.29,-.09],[-.1,-.5,-.05]],
    [.35,[.12,-.24,-.4],[.45,.4,-.8],[-.85,.2,-.5],[.42,-.45,-.12],[-.18,-.52,0]],
    [.38,[-.17,-.24,-.36],[.39,.33,-.86],[-.9,.1,-.4],[.15,-.5,-.12],[-.45,-.5,.1]],
    [.43,[-.25,-.25,-.32],[-.3,.35,-.89],[-.9,0,.4],[.05,-.5,-.1],[-.5,-.45,.05]],
    [.52,[-.28,-.26,-.28],[-.75,.3,-.59],[-.55,0,.83],[0,-.48,-.08],[-.5,-.42,0]],
    [.62,[-.26,-.27,-.3],[-.7,.25,-.67],[-.6,.3,.75],[.02,-.48,-.08],[-.5,-.42,0]],
    [.78,[.05,-.22,-.45],[.25,.1,-.96],[-.6,.8,-.05],[.35,-.52,-.15],[-.3,-.5,-.02]],
    [.9,[.19,-.165,-.52],[.76,.06,-.64],[-.4,.9,.12],[.41,-.52,-.17],[-.33,-.5,-.02]]],
  // overhead chop: hauled up over the head, the right hand sliding down to the left one, the fists at the top of the view and the head
  // behind (elbows up, the arms out of sight), a held breath, then brought straight down the middle: from .52 the haft stays in one
  // plane through the eye (x = .12 * depth), so on screen the whole stroke is a single vertical line just right of the crosshair. On the
  // way down the blade is turned 35 degrees about the haft to show its face, square again (edge down) as it lands; it stays in the ground
  // a moment and is levered back out to the right, the edge rolling up
  heavy:[[0,null],
    [.12,[.2,-.1,-.48],[.7,.45,-.55],[-.4,.85,-.3],[.45,-.35,-.15],[-.3,-.45,-.05]],
    [.3,[.1,.15,-.36],[.12,.88,.45],[-.05,.45,-.89],[.4,-.15,-.1],[-.22,-.42,-.1],.14],
    [.45,[.012,.42,-.1],[-.098,.574,.813],[.068,.819,-.569],[.28,.42,.02],[-.18,.44,.05],.26],
    [.52,[.011,.43,-.09],[-.1,.545,.833],[.065,.839,-.541],[.28,.43,.03],[-.18,.45,.06],.26],
    [.58,[.066,.42,-.55],[.041,.94,-.34],[-.478,-.28,-.833],[.26,.05,-.25],[-.2,-.1,-.15],.26],
    [.62,[.084,-.028,-.7],[.108,.423,-.9],[-.528,-.742,-.412],[.22,-.45,-.2],[-.18,-.5,-.12],.26],
    [.66,[.067,-.199,-.556],[.118,-.105,-.987],[-.151,-.985,.086],[.24,-.5,-.18],[-.18,-.55,-.08],.26],
    [.78,[.067,-.205,-.556],[.118,-.122,-.985],[-.153,-.983,.103],[.24,-.51,-.18],[-.18,-.56,-.08],.26],
    [.92,[.12,-.2,-.58],[.22,-.1,-.97],[-.6,-.78,.08],[.36,-.47,-.15],[-.18,-.5,-.03],.18],
    [1.08,[.2,-.16,-.53],[.45,-.03,-.89],[-.75,.6,-.27],[.42,-.5,-.15],[-.25,-.5,0],.08],
    [1.25,[.2,-.16,-.52],[.68,.04,-.73],[-.5,.85,.1],[.41,-.52,-.17],[-.33,-.5,-.02]],
    [1.42,[.2,-.16,-.52],[.79,.07,-.61],[-.45,.88,.15],[.42,-.52,-.18],[-.34,-.5,-.02]]]};
// camera [u, pitch, yaw, roll], sounds and kicks [u, sound, vol, rate, [gun kick], [camera kick]], the trail window (all in seconds here)
const SK_FX={
  light:{C:[[0,0,0,0],[.26,.008,-.02,-.025],[.31,.01,-.022,-.03],[.4,-.008,.035,.05],[.5,-.004,.025,.03],[.75,0,0,0]],E:[[.05,'kdraw',.25,.5],[.29,'skswing',.75,1]],trail:[.31,.5]},
  heavy:{C:[[0,0,0,0],[.3,.03,0,0],[.52,.05,0,0],[.62,0,0,0],[.66,-.12,0,0],[.76,-.1,0,0],[.92,-.04,0,0],[1.15,-.01,0,0]],E:[[.05,'kdraw',.3,.42],[.55,'skswing',.9,.82]],trail:[.56,.68]}};
const _skO=[0,0,0,0,0,0,0],_skV=new THREE.Quaternion(),_skI=new THREE.Quaternion();
// build a swing clip: the pivot track, both hands, camera and events, for a clip d seconds long
function skClip(heavy,d){const nm=heavy?'heavy':'light',T=window.__SKT&&window.__SKT[nm],K=(T&&T.K)||SK_SW[nm],F=(T&&T.F)||SK_FX[nm];
  const R0=VM_POS.skull9,q0=new THREE.Quaternion().setFromEuler(new THREE.Euler(R0.r[0],R0.r[1],R0.r[2],'XYZ')),qi=q0.clone().invert();
  const P=[[0,0,0,0,0,0,0,1]],Rk=[HK(0,0)],Hk=[HK(0,0)],eR=[[0,...SK_ELB[1]]],eL=[[0,...SK_ELB[0]]];let pq=new THREE.Quaternion();
  for(const k of K){if(!k[1])continue;const u=k[0]/d,[X,Y,Z]=skBasis(k[2],k[3]);_skM.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(_skM);
    // the turn from the rest pose (kept on the same side as the key before) and the grip's move, both in the rest frame
    const rel=qi.clone().multiply(q);if(rel.dot(pq)<0)rel.set(-rel.x,-rel.y,-rel.z,-rel.w);pq=rel;
    const dp=_skC.set(k[1][0]-R0.p[0],k[1][1]-R0.p[1],k[1][2]-R0.p[2]).applyQuaternion(qi);
    P.push([u,dp.x,dp.y,dp.z,rel.x,rel.y,rel.z,rel.w]);
    // each fist round the haft, its forearm toward this key's elbow (worked out in this key's gun space)
    const qk=q.clone().invert();
    for(const [L,el,z,left,E] of [[Rk,k[4],k[6]||0,false,eR],[Hk,k[5],SK.zL,true,eL]]){const eg=_skB.set(el[0]-k[1][0],el[1]-k[1][1],el[2]-k[1][2]).applyQuaternion(qk);
      const H=skHand([0,0,z],[eg.x,eg.y,eg.z],left),pm=H.w.clone().addScaledVector(H.Y,-.004).addScaledVector(H.Z,-.045);
      L.push(HK(u,1,[pm.x,pm.y,pm.z-(left?SK.zL:0)],1,[H.Y.x,H.Y.y,H.Y.z],.95));E.push([u,...el])}}
  P.push(pq.w<0?[1,0,0,0,0,0,0,-1]:[1,0,0,0,0,0,0,1]);Rk.push(HK(1,0));Hk.push(HK(1,0));eR.push([1,...SK_ELB[1]]);eL.push([1,...SK_ELB[0]]);
  const sc=r=>[r[0]/d,...r.slice(1)];
  return {P,R:{A:[{grip:1},{p:[0,0,0]}],k:Rk,elbT:eR},H:{A:[{sup:1},{p:[0,0,SK.zL]}],k:Hk,elbT:eL},
    C:[...F.C.map(sc),[1,0,0,0]],E:F.E.map(sc),trail:F.trail.map(t=>t/d),heavy:!!heavy}}
// the game's hook (vm.js calls it from VM.melee)
// (the clip ends early enough that a hit-stop never runs it into the next swing)
VM.skSwing=function(heavy){const m=this.cur,W=WPN.skull9;if(!m||!m.gun.userData.piv)return false;const d=W.rate[heavy?1:0]-.12;let S=null;
  try{S=skClip(heavy,d)}catch(e){console.error(e)}if(!S)return false;const A=this.playClip(S,0,d,'mel');if(!A)return false;A.mel=1;this.mel=null;this.trail.S.length=0;return true};
// the pivot: reset every frame (vm.js VMX hook, before the clip runs), posed from the clip right after the clip has advanced
VMX.skull9=function(vm,a,dt,K,m){const pv=m.gun.userData.piv;if(pv){pv.position.set(0,0,0);pv.quaternion.set(0,0,0,1)}};
{const af=VM.actFrame;VM.actFrame=function(dt,m,W,K){af.call(this,dt,m,W,K);const A=this.act,pv=m.gun.userData.piv;if(this.id!=='skull9'||!pv||!A||!A.S.P||A.t<A.st)return;
  const k=1-(A.fk||0);fdTrack(A.S.P,A.u,_skO);pv.position.set(_skO[0]*k,_skO[1]*k,_skO[2]*k);_skV.set(_skO[3],_skO[4],_skO[5],_skO[6]).normalize();
  if(k<1)pv.quaternion.copy(_skI).slerp(_skV,k);else pv.quaternion.copy(_skV)}}
// a blow that lands holds the swing longer than a knife's and kicks harder; the slam's ground strike (what 3) holds too
{const mh=VM.meleeHit;VM.meleeHit=function(heavy,what){if(this.id!=='skull9')return mh.call(this,heavy,what);const A=this.act;if(!A||!A.mel||A.fade)return;
  A.hold=Math.max(A.hold,what===1?(heavy?.12:.07):what===3?.09:.045);const k=what===1?(heavy?1.3:.8):what===3?1.1:.5;A.cam.p.v-=(heavy?.9:.4)*k;A.cam.r.v+=(heavy?0:.7)*k;
  this.sp.pz.v+=.4*k;this.sp.py.v-=(heavy?.5:.1)*k}}
// ---------- third person ----------
// (offsets in the hold frame, applied after the hold's own tilt: rz -π/2 lays the upright axe flat pointing right, ry then swings it
// round in front: -0.6 right and back, 1.15 straight ahead, 2.2 out to the left)
// light: cocked out to the right, swept flat across the front to the left (the shoulders turn with it); the blow lands at u .46
KF.skA=[[0,[0,0,0,0,0,0]],[.28,[.12,.1,.1,0,-.6,-1.57]],[.34,[.12,.1,.1,0,-.65,-1.57]],[.46,[-.02,.02,-.25,0,1.15,-1.57]],[.6,[-.12,0,-.12,0,2.2,-1.57]],[.84,[-.04,0,-.03,0,.7,-.5]],[1,[0,0,0,0,0,0]]];
KF.skTw=[[0,0],[.28,.5],[.34,.48],[.46,-.4],[.6,-.55],[.84,-.15],[1,0]];
// heavy: the sledge's overhead slam, timed so the head comes down at u .44
KF.skH=[[0,[0,0,0,0,0,0]],[.25,[0,.3,.22,1.8,0,0]],[.36,[0,.31,.22,1.85,0,0]],[.44,[-.02,-.18,-.3,-2.3,0,0]],[.56,[-.02,-.2,-.24,-2.4,0,0]],[.78,[0,-.06,-.06,-.8,0,0]],[1,[0,0,0,0,0,0]]];
// ---------- the slam: the head hits the ground in front ----------
// (meleeStrike calls it for a heavy blow of a weapon with slam:1, after the bodies, for every peer that plays the swing)
// dust thrown out in a ring and a puff rising, chips and grit, sparks off stone, a dark scuff, a deep thud; the attacker's view
// shakes and holds, anyone close by feels it
function meleeSlam(a,W,list){if(!a||!a.c)return;const eye=actorEye(a);aimDir(a.yaw,0,_dv);let R=1.6;
  const w=rayCast(eye.x,eye.y-.4,eye.z,_dv.x,0,_dv.z,R+.3);if(w)R=Math.max(.5,w.t-.3);// short of a wall in front
  const t0=list&&list[0];let x=eye.x+_dv.x*R,z=eye.z+_dv.z*R;if(t0){const dd=Math.hypot(t0.c.x-eye.x,t0.c.z-eye.z);if(dd<R){x=t0.c.x-_dv.x*.25;z=t0.c.z-_dv.z*.25}}
  const y=floorBelow(x,eye.y-.2,z,.1);if(!(y>-50)||eye.y-y>2.3)return;// nothing within reach below (over a drop)
  const near=G.player&&Math.hypot(G.player.c.x-x,G.player.c.z-z)<40;
  if(near){
    for(let i=0;i<18;i++){const an=i/18*TAU+rr(-.15,.15),s=rr(2.4,4.4);FX.spawn({x:x+Math.cos(an)*.15,y:y+.08,z:z+Math.sin(an)*.15,vx:Math.cos(an)*s,vy:rr(.2,.9),vz:Math.sin(an)*s,
      life:rr(.7,1.3),s0:.16,s1:rr(.7,1.05),r:.42,g:.39,b:.35,a:.5,f:2,drag:3.2,fadeIn:.03,lit:1})}
    for(let i=0;i<3;i++)FX.spawn({x:x+rr(-.15,.15),y:y+.2,z:z+rr(-.15,.15),vx:rr(-.3,.3),vy:rr(.6,1.4),vz:rr(-.3,.3),life:rr(.6,.9),s0:.3,s1:1.2,r:.5,g:.47,b:.42,a:.5,f:6,drag:2,lit:1});
    for(let i=0;i<12;i++)FX.spawn({x,y:y+.05,z,vx:rr(-2.2,2.2),vy:rr(2.5,5.5),vz:rr(-2.2,2.2),life:rr(.5,1),s0:rr(.025,.04),s1:.03,r:.3,g:.28,b:.26,f:7,grav:12,col:.3});
    for(let i=0;i<5;i++)FX.spark(x,y+.05,z,_dv.x*rr(1,3)+rr(-2.5,2.5),rr(1.5,4),_dv.z*rr(1,3)+rr(-2.5,2.5),rr(.15,.35));
    FX.decal(x,y,z,0,1,0,rr(.45,.6),8,[.55,.52,.48],.65)}
  if(a.isPlayer){AU.play('skslam',{vol:.9});FX.shake=Math.max(FX.shake,.85);if(!(list&&list.length))VM.meleeHit&&VM.meleeHit(true,3)}
  else{AU.at('skslam',x,y+.2,z,{vol:.95,range:45});nearShake(x,y,z,7,.45)}}

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // the stroke: a deep, long whoosh under an airy one, a low hum of the heavy head going past
  skswing:{n:3,dur:.6,peak:.78,gain:.55,pj:.05,fn:B=>{whoosh(B,240,850,.36,.75);whoosh(B,900,2300,.22,.32);const e=B.env(.09,.09,.28,.22);B.osc('sine',96,52,.09,.34,e)}},
  // the blade going into a body: a meaty thunk, bone cracking, a wet slice, the dark steel ringing low
  skhit:{n:3,dur:.6,peak:.95,gain:.88,rev:.12,poly:3,fn:B=>{const e=B.env(0,.002,1,.14);B.nz('brown',0,.2,B.f('lowpass',260,.8,e));const k=B.env(0,.002,.85,.12);B.osc('sine',96,44,0,.15,k);
    for(let i=0;i<3;i++)B.grain(rr(.003,.03),rr(1800,3600),2.5,.012,.42);const s=B.env(.004,.006,.6,.14);B.nz('pink',.004,.18,B.sweep(B.f('bandpass',1900,2.5,s),1900,450,.004,.15));
    B.ring(.006,rr(620,720),[1,2.32,3.95],[.18,.1,.06],[.12,.07,.04])}},
  // the head hitting the ground: a deep boom and thump, a spray of dirt, rubble crackling down, a low rumble
  skslam:{n:2,dur:1.2,peak:.95,gain:.9,rev:.2,fn:B=>{const out=B.comp(-12,4,.002,.2,B.g(.95));{const e=B.env(0,.002,1,.5,out);B.osc('sine',rr(64,74),30,0,.55,e)}
    {const e=B.env(0,.002,.9,.22,out);B.nz('brown',0,.3,B.f('lowpass',220,.7,e))}{const e=B.env(.005,.01,.55,.35,out);B.nz('pink',0,.45,B.f('bandpass',900,.7,e))}
    for(let i=0;i<28;i++){const t=.02+.6*Math.pow(Math.random(),1.7);const e=B.env(t,.0006,rr(.06,.22)*(1-t/.8),rr(.004,.016),B.pan(rr(-.7,.7),out));B.nz('white',t,.03,B.f('bandpass',rr(1200,5000),rr(2,5),e))}
    for(let i=0;i<5;i++){const t=rr(.08,.5);const e=B.env(t,.002,rr(.15,.3),.04,out);B.nz('brown',t,.06,B.f('lowpass',rr(250,450),.7,e))}
    {const e=B.env(.05,.15,.3,.7,out);B.nz('brown',0,1.1,B.f('lowpass',160,.6,e))}}},
  // drawn: steel scraping out, the wire binding rattling, the weight settling into the hands
  skdraw:{n:1,dur:.9,peak:.75,gain:.5,rev:.15,fn:B=>{const e=B.env(0,.06,.35,.3);B.nz('white',0,.4,B.sweep(B.f('bandpass',1800,5,e),1800,4200,0,.35));
    for(let i=0;i<9;i++)B.grain(.05+i*.045+rr(0,.02),rr(3000,6000),3,.01,rr(.15,.3));B.ring(.32,rr(900,1050),[1,2.4,3.7],[.18,.1,.06],[.1,.06,.03]);
    const k=B.env(.3,.004,.5,.12);B.nz('brown',.3,.15,B.f('lowpass',300,.7,k))}},
});
SFX_ORDER.push('skswing','skhit','skslam','skdraw');

'use strict';
// ============ v6.41: THANATOS-9 — a reaper's scythe whose blade comes apart into a spinning six-bladed drill ============
// The name and the mechanics follow the CSO weapon (the THANATOS line: violet, the reaper); the model (a black haft with violet inlays, a
// hexagonal hub, a crescent blade built from six overlapping plates), its motions and its sounds are this game's own.
// Left click (scythe): a wide flat sweep, forehand and backhand by turns (the Skull-9's sweep, longer): every zombie within THN.AR m all
// round — in front, beside or behind — with a clear line from the eye is cut (up to THN.AN). No draw cut (W.noDC).
// Right click: the transformation (THN.ON s): the plates come off the crescent one by one from the tip down and fan out round the hub,
// the fan spins a full turn, and they fold forward into a drill of six blades round a violet core. It stays that way until it is used
// or turned back (right click again, THN.OFF s); putting the weapon away does not undo it.
// In the drill form, left click: the barrage — THN.BAR s of stabbing, three blades at a time by turns, a strike every THN.BI s at up to
// THN.BN zombies within THN.BR m in front. Once it has started it cannot be stopped and no other weapon can be taken (the weapon keys,
// buying and dropping do nothing); then it folds back into the scythe by itself.
// Stagger: weak in both forms — its blows do not stagger (no ×0.4 run), they only slow for a moment (×THN.SLOWK, a.thSlow), so a zombie
// can still push through the barrage and infect: high risk, high return. A Deadshot (6) doubles every blow (they count as headshots;
// the host checks the window as it does for bullets). The scenario: ×THN.SCEN.
// Network: the page that runs the human sends ['th', id, st] (0 scythe, 1 transforming, 2 drill, 3 barrage, 4 folding back) and every
// page plays it out (the barrage's strikes on other pages only show blood and sparks); the sweeps go out as melee swings ('m').

// ---------- atlas: blackened blade steel, etched lines catching a violet light ----------
for(const m of ['thSteel']){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintThAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');const i=GA.idx.thSteel;if(i==null||i>=GA_SLOTS)return;
  const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
  for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const X=x0+xx,Y=y0+y,t=fbm(X/14,Y/14,7201,2,0)+(hash2(X,Y,7202)-.5)*.06;
    let c=mix('#2c2836','#565068',clamp((t-.3)*1.6,0,1));
    const v=Math.abs(Math.sin(xx*.11+Math.sin(y*.06)*2.4+fbm(X/30,Y/30,7203,2,0)*3));if(v<.035)c='#a07ee8';else if(v<.075)c=dk(c,.3);
    if(hash2(X,Y,7204)<.012)c='#6e6688';const r=rgbOf(c),k=(y*PS+xx)*4;D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=250}
  x.putImageData(id,x0,y0);GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintThAtlas()}}

// ---------- numbers ----------
// ON / OFF the transformation and back (s), BAR the barrage (s), BI between its strikes; A* the sweep (damage, reach, most it cuts,
// push, slow s), B* a strike of the barrage (damage, reach, cone cosine, most it hits, push, slow s); SLOWK the slow; zL / zLB the left
// fist's place on the haft (scythe / drill), zH the hub, PL a plate's length
const THN={ON:3,OFF:2.4,BAR:3,BI:.1,AD:200,AR:3.3,AN:8,AKB:1,AS:.45,BD:150,BR:3.5,BCOS:.74,BN:3,BKB:0,BS:.22,SCEN:1.6,SLOWK:.72,
  zL:.34,zLB:.2,zH:-.66,PL:.24};
THN.NMAX=Math.round(THN.BAR/THN.BI);

// ---------- the model ----------
// gun frame: origin where the right fist holds the haft, the head along -Z; the left fist up the haft toward the pommel (+Z). The crescent
// rises from the hub's top (+Y) and bows forward, its tip curling back toward the hands; its edge is the inner (concave) side.
// It is six plates, each the same pointed, bowed blade (thPlate, its own frame), laid end to end along the arc with a little overlap.
const _thM=new THREE.Matrix4(),_thM2=new THREE.Matrix4(),_thE=new THREE.Euler(),_thV=new THREE.Vector3(),_thW=new THREE.Vector3();
// parts given in a frame of their own, placed at p turned by q (gun space): the centres moved, each box's own turn composed with q
function thPlace(list,p,q){return list.map(o=>{const c=_thV.set(o.c[0],o.c[1],o.c[2]).applyQuaternion(q);
  _thE.set(o.rx||0,o.ry||0,o.rz||0,'XYZ');_thM.makeRotationFromEuler(_thE);_thM2.makeRotationFromQuaternion(q).multiply(_thM);_thE.setFromRotationMatrix(_thM2,'XYZ');
  return Object.assign({},o,{c:[p[0]+c.x,p[1]+c.y,p[2]+c.z],rx:_thE.x,ry:_thE.y,rz:_thE.z})})}
// a quaternion from a frame's axes (X = Y × Z)
function thQ(Y,Z){const y=new THREE.Vector3(...Y).normalize(),z=new THREE.Vector3(...Z);z.addScaledVector(y,-z.dot(y)).normalize();const x=new THREE.Vector3().crossVectors(y,z);
  _thM.makeBasis(x,y,z);return new THREE.Quaternion().setFromRotationMatrix(_thM)}
// the crescent: a circle through the hub's top, the forward bow and the tip (in the blade's plane, [z, y])
THN.C=skCirc([THN.zH,.046],[THN.zH-.08,.44],[THN.zH+.1,.84]);
THN.R=THN.C[2];THN.K=1/(2*THN.R);// a plate bows as the arc does (z = K·y²)
THN.t0=Math.atan2(.046-THN.C[1],THN.zH-THN.C[0]);// (the arc runs clockwise from the hub: the angle falls)
{const tc=Math.atan2(.84-THN.C[1],THN.zH+.1-THN.C[0]);let d=THN.t0-tc;while(d<0)d+=TAU;THN.arc=THN.R*d;THN.step=(THN.arc-THN.PL*.95)/5}
// a point s along the arc: root [x,y,z], tangent (the plate's length) and the normal toward the inside (its edge)
function thArc(s){const th=THN.t0-s/THN.R,c=Math.cos(th),sn=Math.sin(th);return {p:[0,THN.C[1]+THN.R*sn,THN.C[0]+THN.R*c],t:[0,-c,sn],n:[0,-sn,-c]}}
// one plate in its own frame: the root at the origin, the blade along +Y, its edge side +Z (it bows that way), x its thickness
function thPlate(){const P=[],L=THN.PL,N=9,K=THN.K;const w=v=>.12*Math.pow(1-v,.5)*(.7+.3*Math.sin(Math.PI*v));
  for(let i=0;i<N;i++){const vm=(i+.5)/N,y=vm*L,dy=L/N,zs=K*y*y,wd=Math.max(.005,w(vm)),sl=Math.atan(2*K*y);
    P.push(Pt(0,y,zs+wd/2,.008,dy+.004,wd,'thSteel',{rx:sl,r:.0015}));
    P.push(Pt(0,y,zs+wd-.0026,.0054,dy*1.4,.0052,'bright',{rx:sl,r:.001}));
    P.push(Pt(0,y,zs+.0035,.0125,dy*1.3,.007,'blk2',{rx:sl,r:.002}));
    if(i<N-2)P.push(Pt(0,y,zs+wd*.45,.0092,dy*1.02,Math.max(.003,wd*.18),'jnGlow',{rx:sl}))}// a violet vein down the middle (it reads in the dark)
  P.push(Pt(0,.008,.016,.017,.022,.032,'thSteel',{r:.004}),Pt(0,.008,.016,.0185,.006,.014,'jnGlow'));
  return P}
THN.plate=thPlate();
// the three poses of plate k: on the crescent (A), in the fan round the hub (star, at angle f), in the drill (D, at angle f)
THN.PA=[];THN.QA=[];for(let k=0;k<6;k++){const A=thArc(k*THN.step);THN.PA.push([(k%2?1:-1)*.0011,A.p[1],A.p[2]]);THN.QA.push(thQ(A.t,A.n))}
THN.phi=k=>Math.PI/2+k*Math.PI/3;
const TH_RS=.05,TH_RD=.05,TH_ZS=THN.zH-.04,TH_ZD=THN.zH-.062,TH_TL=.18;
function thStarP(f,out){out[0]=Math.cos(f)*TH_RS;out[1]=Math.sin(f)*TH_RS;out[2]=TH_ZS;return out}
function thStarQ(f){return thQ([Math.cos(f),Math.sin(f),0],[-Math.sin(f),Math.cos(f),0])}
function thDrillP(f,out){out[0]=Math.cos(f)*TH_RD;out[1]=Math.sin(f)*TH_RD;out[2]=TH_ZD;return out}
// (in the drill each plate leans in toward the axis and its width runs round it, so the bowed plates wind round like a drill's flutes)
function thDrillQ(f){const c=Math.cos(f),s=Math.sin(f);return thQ([-Math.sin(TH_TL)*c,-Math.sin(TH_TL)*s,-Math.cos(TH_TL)],[-s,c,0])}
// v: 'vm' the first-person model (plates b0..b5 and the core tagged, at the crescent), 'a' / 'b' the world models (scythe / drill)
function thParts(v){const P=[],vm=v==='vm',D=v==='b',H=THN.zH;const A=l=>{for(const p of l)P.push(p)};
  // the haft: black, two cord-wrapped grips, steel collars, violet inlays up the top half, two barbs; a spiked pommel with a violet band
  A([Pt(0,0,.08,.034,.034,1.36,'blk'),Pt(0,0,0,.039,.039,.2,'skHaft'),Pt(0,0,THN.zL,.039,.039,.18,'skHaft'),
    ...[-.115,.115,THN.zL-.095,THN.zL+.095].map(z=>Pt(0,0,z,.045,.045,.016,'thSteel',{r:.004})),
    ...[1,-1].map(s=>Pt(s*.0172,0,-.4,.0012,.003,.3,'jnGlow')),
    ...[-.2,-.56,.6].map(z=>Pt(0,0,z,.042,.042,.014,'thSteel',{rz:Math.PI/4,r:.002})),
    Pt(0,0,.755,.046,.046,.012,'jnGlow',{rz:Math.PI/4}),Pt(0,0,.788,.044,.044,.05,'thSteel',{rz:Math.PI/4,r:.004}),Pt(0,0,.832,.026,.026,.05,'thSteel',{rz:Math.PI/4}),
    Pt(0,0,.868,.012,.012,.032,'bright',{rz:Math.PI/4})]);
  A([segV(-.018,-.48,-.07,-.4,0,.01,.012,'thSteel',{r:.002}),segV(-.062,-.412,-.084,-.37,0,.005,.006,'bright',{r:.001}),
    segV(.018,-.32,.062,-.25,0,.01,.012,'thSteel',{r:.002}),segV(.056,-.26,.074,-.225,0,.005,.006,'bright',{r:.001})]);
  // the hub: a hexagonal housing (three bands make the hexagon), a violet ring round it, a smaller face in front, a slit eye on each side
  const hex=(z,a,d,m)=>[0,1,2].map(i=>Pt(0,0,z,2*a/Math.sqrt(3),2*a,d,m,{rz:i*Math.PI/3}));
  A([...hex(H,.046,.12,'thSteel'),...hex(H+.07,.03,.03,'thSteel'),...hex(H-.032,.0505,.01,'jnGlow'),...hex(H-.068,.03,.016,'thSteel'),
    ...[1,-1].flatMap(s=>[Pt(s*.0465,0,H+.01,.002,.012,.05,'blk2'),Pt(s*.0472,0,H+.01,.0014,.0045,.034,'jnGlow')])]);
  // the core: a violet spike out of the hub's face, inside the drill (first person: shown as the drill closes)
  const core=[Pt(0,0,H-.13,.016,.016,.13,'jnGlow',{rz:Math.PI/4}),Pt(0,0,H-.215,.008,.008,.05,'jnGlow',{rz:Math.PI/4})];
  if(vm)A(TAG('core',core));else if(D)A(core);
  // the six plates
  for(let k=0;k<6;k++){let p,q;if(D){p=thDrillP(THN.phi(k),[0,0,0]);q=thDrillQ(THN.phi(k))}else{p=THN.PA[k];q=THN.QA[k]}
    const L=thPlace(THN.plate,p,q);if(vm)A(TAG('b'+k,L));else A(L)}
  return P}
// the plates turn about their roots on the crescent; the core about the hub
THN.PIV={core:[0,0,THN.zH]};for(let k=0;k<6;k++)THN.PIV['b'+k]=THN.PA[k].slice();

// ---------- first-person rest pose: low on the right, the haft running out to the right, the crescent rising on the right ----------
const TH_REST={p:[.17,-.24,-.42],d:[.66,.1,-.74],b:[-.62,.76,.18]};
VM_POS.thanatos9=skPose(TH_REST.p,TH_REST.d,TH_REST.b);
// where the elbows would like to be at rest ([left, right], camera space), put on the forearms the way the katana does (kaElb)
const TH_ELB_RAW=[[-.3,-.62,-.06],[.42,-.55,-.2]];
const TH_ELB=(()=>{const P=VM_POS.thanatos9,q=new THREE.Quaternion().setFromEuler(new THREE.Euler(P.r[0],P.r[1],P.r[2],'XYZ')),qi=q.clone().invert();
  return [[THN.zL,TH_ELB_RAW[0],true],[0,TH_ELB_RAW[1],false]].map(([z,e,left])=>{const eg=new THREE.Vector3(e[0]-P.p[0],e[1]-P.p[1],e[2]-P.p[2]).applyQuaternion(qi);
    return kaElb(kaHand([0,0,z],[eg.x,eg.y,eg.z],left),P.p,q)})})();
// both fists round the haft (buildVM hook); the swings and the transformation turn the gun on a pivot between the root and the gun
function thVmArms(armR,armL){const P=VM_POS.thanatos9;_skE.set(P.r[0],P.r[1],P.r[2],'XYZ');_skQ.setFromEuler(_skE).invert();
  const gun=armR.parent,root=gun&&gun.parent;if(root&&!gun.userData.piv){const pv=new THREE.Group();root.remove(gun);pv.add(gun);root.add(pv);gun.userData.piv=pv}
  for(const [arm,z,e,left] of [[armR,0,TH_ELB[1],false],[armL,THN.zL,TH_ELB[0],true]]){if(!arm)continue;
    const eg=_skB.set(e[0]-P.p[0],e[1]-P.p[1],e[2]-P.p[2]).applyQuaternion(_skQ);const Hh=kaHand([0,0,z],[eg.x,eg.y,eg.z],left);
    arm.position.copy(Hh.w);_skM.makeBasis(Hh.X,Hh.Y,Hh.Z);arm.quaternion.setFromRotationMatrix(_skM);arm.visible=true;if(arm.userData.hand)arm.userData.hand.rest=.95;vmHandCurl(arm,.95)}}
GUNS.thanatos9={parts:thParts('vm'),grip:[0,0,0],sup:[0,0,THN.zL],muzzle:[0,0,THN.zH-.2],piv:THN.PIV,vmFix:thVmArms,wid:'th9w',
  trail:[0,.28,THN.zH-.14,0,.72,THN.zH+.05]};// the motion trail runs along the upper half of the crescent
GUNS.th9w={parts:thParts('a'),grip:[0,0,0],sup:[0,0,THN.zL],muzzle:[0,0,THN.zH-.2]};
GUNS.th9wb={parts:thParts('b'),grip:[0,0,0],sup:[0,0,THN.zL],muzzle:[0,0,THN.zH-.2]};

// ---------- stats ----------
// (the barrage is not a heavy attack of the generic melee code: thanatos.js runs both buttons itself; hs = what a Deadshot doubles by)
WPN.thanatos9={slot:3,kind:'melee',n:['THANATOS-9','THANATOS-9'],cost:6000,dmg:[THN.AD,THN.BD],rate:[.95,THN.BI],range:[THN.AR,THN.BR],kb:[THN.AKB,THN.BKB],stag:[.2,.2],
  speed:1,draw:1.2,model:'thanatos9',hold:'thanatos9',sw:.55,hitT:[.34,0],anD:[.9,.2],cleave:[THN.AN,THN.BN],arc:[-1.01,THN.BCOS],noDC:1,hs:2,thn:1,
  swS:'thswing',hitS:'thhit',drawS:'thdraw',drKey:'drS'};
BUY_MENU.find(c=>c.k==='special').items.push('thanatos9');
// third person: up in front of the right shoulder like the Skull-9 (its sweep and shoulder turn); the barrage: a thrust (KF.thB, below)
HOLDS.thanatos9={off:[-.02,-.3,-.16],rx:1.15,rz:Math.PI,ham:1,kA:'skA',kH:'thB',twA:'skTw'};
// a thrust from the shoulder, levelled and driven forward, that loops while the barrage lasts (each strike starts it again; u 0–.2 is
// one thrust) and eases back up to the carry once it stops
KF.thB=[[0,[0,.02,-.12,-1.12,0,0]],[.1,[0,.03,-.42,-1.14,0,0]],[.2,[0,.02,-.12,-1.12,0,0]],[.55,[0,.01,-.06,-.55,0,0]],[1,[0,0,0,0,0,0]]];

// ---------- first-person sweeps (built like the katana's, katana.js: keys in seconds, camera space) ----------
// [t, grip point, head direction, crescent direction (gun +Y), right elbow?, left elbow?]; the blow lands at WPN.thanatos9.hitT
const TH_SW={
  // forehand: cocked out to the right with the crescent turned forward, a beat, then thrown flat across to the left, the crescent
  // leading; round to the left and back
  light:[[.1,[.25,-.15,-.45],[.85,.3,-.42],[-.3,.85,-.42]],[.22,[.3,-.14,-.4],[.8,.28,-.53],[-.4,.25,-.88]],[.27,[.31,-.14,-.39],[.79,.29,-.54],[-.4,.24,-.88]],
    [.31,[.12,-.22,-.42],[.45,.32,-.83],[-.85,.2,-.48]],[.34,[-.12,-.23,-.4],[.1,.3,-.95],[-.98,.1,-.15]],[.38,[-.24,-.24,-.34],[-.4,.32,-.86],[-.88,0,.47]],
    [.46,[-.28,-.25,-.3],[-.78,.28,-.56],[-.55,0,.83]],[.56,[-.26,-.26,-.31],[-.72,.24,-.65],[-.6,.3,.74]],[.72,[.04,-.22,-.44],[.3,.35,-.89],[-.6,.75,-.27]],
    [.84,[.17,-.235,-.43],[.65,.11,-.75],[-.6,.77,.16]]],
  // backhand: cocked out to the left, thrown across to the right
  light2:[[.1,[-.16,-.2,-.42],[-.7,.35,-.62],[.45,.85,-.25]],[.22,[-.24,-.2,-.38],[-.75,.3,-.59],[.5,.2,-.84]],[.27,[-.25,-.2,-.37],[-.76,.3,-.58],[.5,.2,-.84]],
    [.31,[-.08,-.22,-.42],[-.35,.32,-.88],[.9,.15,-.4]],[.34,[.12,-.22,-.42],[.1,.3,-.95],[.98,.1,.15]],[.38,[.26,-.21,-.38],[.5,.3,-.81],[.85,0,.53]],
    [.46,[.32,-.2,-.34],[.85,.25,-.47],[.45,0,.89]],[.56,[.3,-.2,-.35],[.8,.22,-.56],[.5,.35,.79]],[.72,[.24,-.19,-.44],[.65,.4,-.65],[-.2,.85,.48]],
    [.84,[.17,-.235,-.43],[.65,.11,-.75],[-.6,.77,.16]]]};
const TH_FX={
  light:{C:[[0,0,0,0],[.22,.008,-.02,-.025],[.27,.01,-.022,-.03],[.36,-.008,.035,.05],[.46,-.004,.025,.03],[.7,0,0,0]],E:[[.04,'kdraw',.22,.55],[.29,'thswing',.85,1]],trail:[.29,.46]},
  light2:{C:[[0,0,0,0],[.22,.008,.02,.025],[.27,.01,.022,.03],[.36,-.008,-.035,-.05],[.46,-.004,-.025,-.03],[.7,0,0,0]],E:[[.04,'kdraw',.22,.6],[.29,'thswing',.85,1.06]],trail:[.29,.46]}};
const _thO=[0,0,0,0,0,0,0],_thPq=new THREE.Quaternion(),_thIq=new THREE.Quaternion();
function thClip(name,d){const K=TH_SW[name],F=TH_FX[name];
  const R0=VM_POS.thanatos9,q0=new THREE.Quaternion().setFromEuler(new THREE.Euler(R0.r[0],R0.r[1],R0.r[2],'XYZ')),qi=q0.clone().invert();
  const P=[[0,0,0,0,0,0,0,1]],Rk=[HK(0,0)],Hk=[HK(0,0)],eR=[[0,...TH_ELB[1]]],eL=[[0,...TH_ELB[0]]];let pq=new THREE.Quaternion();
  for(const k of K){const u=k[0]/d,[X,Y,Z]=skBasis(k[2],k[3]);_skM.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(_skM);
    const rel=qi.clone().multiply(q);if(rel.dot(pq)<0)rel.set(-rel.x,-rel.y,-rel.z,-rel.w);pq=rel;
    const dp=_skC.set(k[1][0]-R0.p[0],k[1][1]-R0.p[1],k[1][2]-R0.p[2]).applyQuaternion(qi);P.push([u,dp.x,dp.y,dp.z,rel.x,rel.y,rel.z,rel.w]);
    const dn=_skA.set(k[2][0],k[2][1],k[2][2]).normalize(),pL=[k[1][0]-dn.x*THN.zL,k[1][1]-dn.y*THN.zL,k[1][2]-dn.z*THN.zL];
    const elR=k[4]||[k[1][0]+.22,k[1][1]-.3,k[1][2]+.3],elL=k[5]||[pL[0]-.22,pL[1]-.3,pL[2]+.28],qk=q.clone().invert();
    for(const [Lk,el,z,left,E] of [[Rk,elR,0,false,eR],[Hk,elL,THN.zL,true,eL]]){const eg=_skB.set(el[0]-k[1][0],el[1]-k[1][1],el[2]-k[1][2]).applyQuaternion(qk);
      const Hh=kaHand([0,0,z],[eg.x,eg.y,eg.z],left),pm=Hh.w.clone().addScaledVector(Hh.Y,-.004).addScaledVector(Hh.Z,-.045);
      Lk.push(HK(u,1,[pm.x,pm.y,pm.z-(left?THN.zL:0)],1,[Hh.Y.x,Hh.Y.y,Hh.Y.z],.95));E.push([u,...kaElb(Hh,k[1],q)])}}
  P.push(pq.w<0?[1,0,0,0,0,0,0,-1]:[1,0,0,0,0,0,0,1]);Rk.push(HK(1,0));Hk.push(HK(1,0));eR.push([1,...TH_ELB[1]]);eL.push([1,...TH_ELB[0]]);
  const sc=r=>[r[0]/d,...r.slice(1)];
  return {P,R:{A:[{grip:1},{p:[0,0,0]}],k:Rk,elbT:eR},H:{A:[{sup:1},{p:[0,0,THN.zL]}],k:Hk,elbT:eL},C:[...F.C.map(sc),[1,0,0,0]],E:F.E.map(sc),trail:F.trail.map(t=>t/d)}}
// the game's hook (meleeSwing → VM.melee): the sweeps alternate
VM.thSwing=function(){const m=this.cur,W=WPN.thanatos9;if(!m||!m.gun.userData.piv)return false;const name=(this.thSide=this.thSide>0?-1:1)>0?'light':'light2',d=W.rate[0]-.08;
  let S=null;try{S=thClip(name,d)}catch(e){console.error(e)}if(!S)return false;const A=this.playClip(S,0,d,'mel');if(!A)return false;A.mel=1;this.mel=null;this.trail.S.length=0;return true};
{const vm0=VM.melee;VM.melee=function(heavy){if(this.id==='thanatos9'){if(!heavy&&this.thSwing())return;return}return vm0.call(this,heavy)}}
// a sweep that lands holds a moment and kicks the view
{const mh=VM.meleeHit;VM.meleeHit=function(heavy,what){if(this.id!=='thanatos9')return mh.call(this,heavy,what);const A=this.act;if(!A||!A.mel||A.fade)return;
  A.hold=Math.max(A.hold,what===1?.07:.04);const k=what===1?.8:.4;A.cam.p.v-=.4*k;A.cam.r.v+=.6*k*(this.thSide||1);this.sp.pz.v+=.35*k}}
// the swing's pivot pose (after the clip has advanced; VMX.thanatos9 below has posed the pivot for the form already)
{const af=VM.actFrame;VM.actFrame=function(dt,m,W,K){af.call(this,dt,m,W,K);const A=this.act,pv=m.gun.userData.piv;if(this.id!=='thanatos9'||!pv||!A||!A.S.P||A.t<A.st)return;
  const k=1-(A.fk||0);fdTrack(A.S.P,A.u,_thO);pv.position.set(_thO[0]*k,_thO[1]*k,_thO[2]*k);_thPq.set(_thO[3],_thO[4],_thO[5],_thO[6]).normalize();
  if(k<1)pv.quaternion.copy(_thIq).slerp(_thPq,k);else pv.quaternion.copy(_thPq)}}

// ---------- the transformation in first person: the gun's pose, the fists, the plates (all from one timeline T, 0 scythe .. 1 drill) ----------
// pose keys [T, grip, head direction, crescent direction, right elbow, left elbow, left fist's place on the haft] (camera space)
const TH_TK=[[0,TH_REST.p,TH_REST.d,TH_REST.b,TH_ELB_RAW[1],TH_ELB_RAW[0],THN.zL],
  [.1,[.12,-.2,-.45],[.12,.7,-.7],[-.98,.05,-.1],[.34,-.55,-.16],[-.12,-.66,0],THN.zL],
  [.4,[.11,-.19,-.45],[.1,.71,-.69],[-.99,.04,-.12],[.34,-.55,-.16],[-.12,-.66,0],THN.zL],
  [.7,[.11,-.195,-.45],[.11,.7,-.7],[-.98,.06,-.12],[.34,-.55,-.16],[-.12,-.66,0],THN.zL],
  [.84,[.2,-.21,-.4],[.03,.19,-.98],[-.15,.98,.15],[.38,-.56,-.2],[.16,-.62,.12],THN.zLB],
  [.9,[.2,-.22,-.36],[.02,.15,-.99],[-.15,.98,.1],[.38,-.56,-.18],[.16,-.62,.14],THN.zLB],
  [1,[.2,-.22,-.36],[.02,.15,-.99],[-.15,.98,.1],[.38,-.56,-.18],[.16,-.62,.14],THN.zLB]];
THN.TK=(()=>{const R0=VM_POS.thanatos9,q0=new THREE.Quaternion().setFromEuler(new THREE.Euler(R0.r[0],R0.r[1],R0.r[2],'XYZ')),qi=q0.clone().invert();let pq=new THREE.Quaternion();
  return TH_TK.map(k=>{const [X,Y,Z]=skBasis(k[2],k[3]);_skM.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(_skM),rel=qi.clone().multiply(q);
    if(rel.dot(pq)<0)rel.set(-rel.x,-rel.y,-rel.z,-rel.w);pq=rel;const dp=_skC.set(k[1][0]-R0.p[0],k[1][1]-R0.p[1],k[1][2]-R0.p[2]).applyQuaternion(qi);
    return [k[0],dp.x,dp.y,dp.z,rel.x,rel.y,rel.z,rel.w,...k[4],...k[5],k[6]]})})();
// the timeline position of an actor's weapon (0 scythe .. 1 drill)
function thT(a){const st=a.thS|0;if(st===1)return clamp(1-(a.thT||0)/THN.ON,0,1);if(st===2||st===3)return 1;if(st===4)return clamp((a.thT||0)/THN.OFF,0,1);return 0}
// the fan's turn at T (one full turn while it is out), each plate's own windows: off the crescent (tip first), folded forward
const thSpin=T=>TAU*smooth(clamp((T-.2)/.6,0,1));
const thDep=(k,T)=>smooth(clamp((T-(.06+(5-k)*.055))/.2,0,1));
const thFold=(k,T)=>smooth(clamp((T-(.72+k*.012))/.14,0,1));
const _thA=[0,0,0],_thB=[0,0,0],_thQa=new THREE.Quaternion(),_thQb=new THREE.Quaternion(),_thTk=new Array(15).fill(0),_thR=new THREE.Quaternion(),_thC=new THREE.Vector3(),
  _thPos=new THREE.Vector3(),_thQ0=new THREE.Quaternion(),_thQi=new THREE.Quaternion();
// plate k at T (spin s added: the barrage turns the drill), push: pushed out along its length (the barrage's thrusts) → [p], q
function thPlatePose(k,T,s,push,P,q){const f=THN.phi(k)+thSpin(T)+(s||0),dp=thDep(k,T),fo=thFold(k,T);
  if(fo>0){thStarP(f,_thA);thDrillP(f,_thB);for(let i=0;i<3;i++)P[i]=_thA[i]+(_thB[i]-_thA[i])*fo;q.copy(thStarQ(f)).slerp(thDrillQ(f),fo)}
  else if(dp<1){thStarP(f,_thB);const A=THN.PA[k],h=Math.sin(dp*Math.PI);for(let i=0;i<3;i++)P[i]=A[i]+(_thB[i]-A[i])*dp;
    P[0]+=Math.cos(f)*.07*h;P[1]+=Math.sin(f)*.07*h;P[2]-=.05*h;q.copy(THN.QA[k]).slerp(thStarQ(f),dp)}
  else{thStarP(f,P);q.copy(thStarQ(f))}
  if(push){_thC.set(0,1,0).applyQuaternion(q);P[0]+=_thC.x*push;P[1]+=_thC.y*push;P[2]+=_thC.z*push}}
// every frame on the view model: the pivot (the form's pose), the fists, the plates, the core, the light, the barrage's shaking
VMX.thanatos9=function(V,a,dt,o,m){const pv=m.gun.userData.piv,Tg=m.tags;if(!pv)return;
  pv.position.set(0,0,0);pv.quaternion.set(0,0,0,1);
  const T=thT(a),st=a.thS|0,bar=st===3;
  // the drill turns faster through the barrage; between strikes the two sets of blades thrust by turns
  V.thSpinA=(V.thSpinA||0)+dt*(bar?13:st===2?.9:0);if(!st)V.thSpinA=0;
  const ph=bar?(THN.BAR-(a.thT||0))*TAU*5:0,pu0=bar?.075*Math.pow(Math.max(0,Math.sin(ph)),.7):0,pu1=bar?.075*Math.pow(Math.max(0,Math.sin(ph+Math.PI)),.7):0;
  if(T>0||bar){fdTrack(THN.TK,T,_thTk);pv.position.set(_thTk[0],_thTk[1],_thTk[2]);_thR.set(_thTk[3],_thTk[4],_thTk[5],_thTk[6]).normalize();pv.quaternion.copy(_thR);
    // the fists, from this pose and the elbows for it
    const R0=VM_POS.thanatos9;_thQ0.setFromEuler(_thE.set(R0.r[0],R0.r[1],R0.r[2],'XYZ'));const qc=_thQi.copy(_thQ0).multiply(_thR);
    _thPos.set(_thTk[0],_thTk[1],_thTk[2]).applyQuaternion(_thQ0).add(_thW.set(R0.p[0],R0.p[1],R0.p[2]));const qinv=qc.clone().invert();
    for(const [arm,e,z,left] of [[m.armR,[_thTk[7],_thTk[8],_thTk[9]],0,false],[m.armL,[_thTk[10],_thTk[11],_thTk[12]],_thTk[13],true]]){if(!arm)continue;
      const eg=_thV.set(e[0],e[1],e[2]).sub(_thPos).applyQuaternion(qinv),Hh=kaHand([0,0,z],[eg.x,eg.y,eg.z],left);
      arm.position.copy(Hh.w);_skM.makeBasis(Hh.X,Hh.Y,Hh.Z);arm.quaternion.setFromRotationMatrix(_skM);vmHandCurl(arm,.95)}}
  // the plates (their tag groups turn about the root they have on the crescent: q · qA⁻¹)
  if(T>0||bar){const P=[0,0,0],q=new THREE.Quaternion();for(let k=0;k<6;k++){const g=Tg['b'+k];if(!g)continue;thPlatePose(k,T,V.thSpinA,k%2?pu1:pu0,P,q);
      g.position.set(P[0],P[1],P[2]);g.quaternion.copy(q).multiply(_thQa.copy(THN.QA[k]).invert())}}
  if(Tg.core){const c=smooth(clamp((T-.78)/.15,0,1));Tg.core.visible=c>.02;Tg.core.scale.set(1,1,Math.max(.01,c));if(c>.02)Tg.core.rotation.z=(V.thSpinA||0)*.5}
  // violet light on the hands while it changes and in the drill form; the barrage blazes and shakes
  const glow=st?(bar?1:st===2?.45:.35+.45*Math.sin(Math.PI*T)):0;
  if(glow>0){const u=V.U.uMuzzle.value,p=glow*(bar?.8+.2*Math.random():.7+.3*Math.sin(V.t*7));u.r=Math.max(u.r,.55*p);u.g=Math.max(u.g,.2*p);u.b=Math.max(u.b,1.05*p)}
  if(bar){const p=Math.max(pu0,pu1)/.075,j=.0016;o[2]-=.022*p;o[0]+=rr(-j,j);o[1]+=rr(-j,j);o[3]+=rr(-j,j)*2;V.camRoll+=rr(-.003,.003);V.camPitch+=.004*p}
  // the transformation: the view rocks as the fan comes out and as the drill locks
  if(st===1||st===4){const lk=Math.exp(-Math.pow((T-.9)/.025,2));V.camPitch+=.01*Math.sin(Math.PI*clamp(T/.12,0,1))*(T<.12?1:0)-.006*lk;o[1]-=.006*lk}};

// ---------- the state (thS, thT: see the top) ----------
const thOwn=a=>!a.pup;
const thDs=a=>!!(a&&a.team===TH&&a.hsk&&a.hsk.ds>0);
function thAt(a,snd,vol,rate,range){if(a.isPlayer)return AU.play(snd,{vol,rate:rate||1});AU.at(snd,a.c.x,a.c.y+1.3,a.c.z,{vol,rate:rate||1,range:range||45});return null}
function thStop(a){for(const k of ['thV1','thV2']){const v=a[k];a[k]=null;const c=AU.ctx;if(v&&v.g&&c)try{v.g.gain.setTargetAtTime(0,c.currentTime,.04);v.s.stop(c.currentTime+.25)}catch(e){}}}
function thReset(a){if(a.thS)thStop(a);a.thS=0;a.thT=0;a.thN=0;if(a.thL){a.thL.dead=true;a.thL=null}}
// a state change (own: this page runs the human and tells the others)
function thSet(a,st,own){const was=a.thS|0;a.thS=st;
  if(st===1)a.thT=THN.ON;else if(st===3){a.thT=THN.BAR;a.thNx=G.t+.05;a.thN=0}else if(st===4)a.thT=THN.OFF;else a.thT=0;
  if(own&&NET.on)netFxPush(['th',a.id,st]);thFx(a,st,was)}
// what it looks and sounds like (every page)
function thFx(a,st,was){const L=LI();
  if(st===1){thStop(a);a.thV1=thAt(a,'thon',.9);if(a.isPlayer)HUD.note(L?'THANATOS — transforming…':'THANATOS — 변신 중…',1.4)}
  else if(st===2){if(a.isPlayer){HUD.note(L?`Drill form — left click: the barrage (${THN.BAR} s, cannot be stopped)`:`드릴 모드 — 좌클릭: 연속 찌르기 ${THN.BAR}초 (시작하면 취소 · 교체 불가)`,2.4);FX.shake=Math.max(FX.shake,.25)}}
  else if(st===3){thStop(a);a.thV2=thAt(a,'thbar',.85,1,55);if(a.isPlayer){FX.shake=Math.max(FX.shake,.3);VM.sp.pz.v-=.5}
    // (in first person the flash goes off a little way out in front and smaller, not on the lens)
    let mz=muzzleWorld(a),s=1;if(a.isPlayer&&!G.spec){const e=actorEye(a);aimDir(a.yaw,a.pitch,_dv);mz={x:e.x+_dv.x*1.4,y:e.y+_dv.y*1.4-.12,z:e.z+_dv.z*1.4};s=.4}thBurst(mz.x,mz.y,mz.z,s)}
  else if(st===4){if(was!==4){thStop(a);a.thV1=thAt(a,'thoff',.85)}}
  else if(was===1||was===4)thStop(a)}
// a violet flash
function thBurst(x,y,z,s){FX.spawn({x,y,z,life:.16,s0:.25*s,s1:1.4*s,r:.75,g:.38,b:1,a:.8,f:14,add:1});for(let i=0;i<8;i++){const g=Math.random()*TAU,e=rr(-.5,1),sp=rr(1.2,3.5)*s;
  FX.spawn({x,y,z,vx:Math.cos(g)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(g)*Math.cos(e)*sp,life:rr(.18,.35),s0:.05,s1:.01,r:.8,g:.5,b:1,f:11,add:1,grav:2})}DL.add(x,y,z,'#a55cff',4*s,1.8,.16)}
// another page's state change (it may come while the same state still runs here: then nothing restarts)
function thRemote(a,st){if(!a||a.team!==TH||!a.alive)return;if((a.thS|0)===st)return;thSet(a,st,false)}
// the buttons (the page that runs this human; bots too)
function thInput(a){const cmd=a.cmd,pc=a.pc,W=WPN.thanatos9;if(a.grabT>0&&!(a.lyPin>0))return;
  const st=a.thS|0,fire=!!cmd.fire,altE=!!cmd.alt&&!pc.alt;
  if(st===0){if(altE&&a.drawT<=0&&G.t>=a.nextFire-.15&&!a.pendingMelee){thSet(a,1,true);return}
    if(fire&&a.drawT<=0&&G.t>=a.nextFire){a.an.atkSide=-(a.an.atkSide||1);meleeSwing(a,false);a.nextFire=G.t+W.rate[0];a.an.atk=1;a.an.heavy=false;a.an.atkD=meleeAtkD(W,false);
      meleePend(a,W.hitT[0],false)}return}
  // (the barrage wants a fresh press: a button still held from the sweeps does not set it off as the drill locks; bots hold it)
  if(st===2&&a.drawT<=0){if(fire&&(!pc.fire||!a.isPlayer)){thSet(a,3,true);return}if(altE)thSet(a,4,true)}}
// every frame, every page
function thTick(a,dt){if(a.thSlow>0)a.thSlow=Math.max(0,a.thSlow-dt);const st=a.thS|0;if(!st)return;
  if(!a.alive||a.team!==TH){thReset(a);return}const own=thOwn(a);
  if(st===1){if(own&&a.cur!=='thanatos9'){thSet(a,0,true);return}a.thT=Math.max(0,a.thT-dt);if(a.thT<=0&&own)thSet(a,2,true)}
  else if(st===3){a.thT=Math.max(0,a.thT-dt);
    while((a.thN|0)<THN.NMAX&&G.t>=a.thNx){a.thNx+=THN.BI;a.thN=(a.thN|0)+1;if(own)thStab(a);else{NET.ghost++;try{thStab(a)}finally{NET.ghost--}}}
    if(a.thT<=0&&own)thSet(a,4,true)}
  else if(st===4){if(own&&a.cur!=='thanatos9'){thSet(a,0,true);return}a.thT=Math.max(0,a.thT-dt);if(a.thT<=0&&own)thSet(a,0,true)}
  // the drill form hums (everyone near hears where it is); a violet light at the head while it is out
  const held=a.cur==='thanatos9';
  if(st===2&&held&&G.t>=(a.thHum||0)){a.thHum=G.t+1.5;thAt(a,'thhum',a.isPlayer?.35:.7,1,40)}
  if(held&&st>=2&&a.gun&&!(a.isPlayer&&!G.spec)){const mz=muzzleWorld(a);if(!a.thL)a.thL=DL.add(mz.x,mz.y,mz.z,'#9a50ff',st===3?6:3.5,1.4,0,{flick:.2});a.thL.x=mz.x;a.thL.y=mz.y;a.thL.z=mz.z;
    if(Math.random()<dt*(st===3?30:6))FX.spawn({x:mz.x+rr(-.06,.06),y:mz.y+rr(-.06,.06),z:mz.z+rr(-.06,.06),vy:rr(.1,.4),life:rr(.12,.25),s0:.05,s1:.01,r:.8,g:.5,b:1,f:11,add:1})}
  else if(a.thL){a.thL.dead=true;a.thL=null}}

// ---------- the blows ----------
// the sweep: everyone within reach all round (a clear line from the eye), pushed away from the scythe-bearer
function thSweepHit(a){const list=meleeHits(a,THN.AR,-1.01,THN.AN),sc=G.mode==='scen'?THN.SCEN:1,ds=thDs(a);
  for(const t of list){const dx=t.c.x-a.c.x,dz=t.c.z-a.c.z,h=Math.hypot(dx,dz)||1,y=t.c.y+1.1;
    damageActor(t,THN.AD*sc*(ds?2:1),a,{w:'thanatos9',hs:ds,ds,dir:[dx/h,0,dz/h],kb:THN.AKB,stag:.2,thL:THN.AS,x:t.c.x,y,z:t.c.z,knife:1,heavy:1});
    FX.blood(t.c.x,y,t.c.z,dx/h,.1,dz/h,2,false);thSlashFx(t.c.x,y,t.c.z)}
  if(list.length){if(a.isPlayer){AU.play('thhit',{vol:.9});HUD.hitmark(ds);VM.meleeHit&&VM.meleeHit(false,1);FX.shake=Math.max(FX.shake,.32)}else AU.at('thhit',list[0].c.x,list[0].c.y+1,list[0].c.z,{vol:.8})}}
function thSlashFx(x,y,z){FX.spawn({x,y,z,life:.1,s0:.2,s1:.7,r:.7,g:.35,b:1,a:.7,f:14,add:1});for(let i=0;i<5;i++)FX.spark(x,y,z,rr(-3,3),rr(-1,2.5),rr(-3,3),rr(.12,.25),[.75,.5,1])}
// one strike of the barrage: up to THN.BN in front; nothing in reach → the wall in front takes it (sparks; a coffin is hurt)
function thStab(a){const sc=G.mode==='scen'?THN.SCEN:1,ds=thDs(a);a.an.atk=1;a.an.atkD=.5;a.an.heavy=true;
  const list=meleeHits(a,THN.BR,THN.BCOS,THN.BN);aimDir(a.yaw,0,_dv);const fx=_dv.x,fz=_dv.z;
  if(list.length){for(const t of list){const y=t.c.y+1.15;damageActor(t,THN.BD*sc*(ds?2:1),a,{w:'thanatos9',hs:ds,ds,dir:[fx,0,fz],kb:THN.BKB,stag:.2,thL:THN.BS,x:t.c.x,y,z:t.c.z,knife:1});
      FX.blood(t.c.x,y,t.c.z,fx,.2,fz,1.25,false);if(Math.random()<.35)thSlashFx(t.c.x,y,t.c.z)}
    if(a.isPlayer){if(!AU.throttle('thst',85))AU.play('thstab',{vol:.75,rate:rr(.94,1.08)});HUD.hitmark(ds);FX.shake=Math.max(FX.shake,.14)}
    else if(!AU.throttle('thst'+a.id,110))AU.at('thstab',list[0].c.x,list[0].c.y+1.1,list[0].c.z,{vol:.7})}
  else{const e=actorEye(a);aimDir(a.yaw,a.pitch,_dv);const h=rayCast(e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,THN.BR);if(!h)return;const x=e.x+_dv.x*h.t,y=e.y+_dv.y*h.t,z=e.z+_dv.z*h.t;
    if(!NET.ghost&&h.box&&h.box.coffin&&a.team===TH&&typeof COFF!=='undefined')COFF.hurt(h.box.coffin,THN.BD*1.5,a);
    if(Math.random()<.6)for(let i=0;i<3;i++)FX.spark(x,y,z,h.nx*rr(1,4)+rr(-1.5,1.5),rr(.5,3),h.nz*rr(1,4)+rr(-1.5,1.5),rr(.12,.3),[.8,.6,1]);
    if(!AU.throttle('thw'+a.id,130))AU.at('kwall',x,y,z,{vol:.45,rate:1.45})}}

// ---------- HUD: a ring under the crosshair (transforming, the drill ready, the barrage's time) ----------
function thHud(){const P=G.player,hud=$('hud');if(!P||!hud)return;const live=!!(P.alive&&P.team===TH&&!G.spec&&G.st!=='menu'&&P.cur==='thanatos9'),st=live?P.thS|0:0;
  let rg=$('thRing');if(live&&st&&!rg){rg=document.createElement('div');rg.id='thRing';rg.innerHTML='<svg viewBox="0 0 60 60"><circle class="tr" cx="30" cy="30" r="24"/><circle class="pg" cx="30" cy="30" r="24"/></svg><b></b>';hud.appendChild(rg)}
  if(rg){const on=live&&st>0;rg.style.display=on?'block':'none';if(on){const C=150.8,pg=rg.querySelector('.pg'),b=rg.querySelector('b'),L=LI();
      const p=st===1?1-P.thT/THN.ON:st===3?P.thT/THN.BAR:st===4?1-P.thT/THN.OFF:1,cls=st===3?'bar':st===2?'rdy':'chg';if(rg.className!==cls)rg.className=cls;
      const os=(C*(1-clamp(p,0,1))).toFixed(1);if(pg.getAttribute('stroke-dashoffset')!==os)pg.setAttribute('stroke-dashoffset',os);
      const s=st===3?Math.max(0,P.thT).toFixed(1):st===2?(L?'DRILL':'드릴'):'';if(b.textContent!==s)b.textContent=s}}
  const cr=HUD.el.cross;if(cr){const on=live&&st>=2;if(cr.classList.contains('th')!==on)cr.classList.toggle('th',on)}
  // touch: the aim button turns into the transform button
  if(typeof TOUCH!=='undefined'&&TOUCH.el){const bt=TOUCH.el.querySelector('.tAlt'),want=live?(st===2?(LI()?'BACK':'해제'):(LI()?'FORM':'변신')):'';
    if(bt){const em=bt.querySelector('em');if(bt.dataset.th!==want){bt.dataset.th=want;bt.classList.toggle('th',!!want);if(em)em.textContent=want||(LI()?'AIM':'조준')}}}}
function thTag(P){const st=P.thS|0,L=LI();return st===1?(L?' · transforming':' · 변신 중'):st===2?(L?' · drill (left click: barrage)':' · 드릴 (좌클릭: 연속 찌르기)'):st===3?` · ${L?'barrage':'찌르기'} ${Math.max(0,P.thT).toFixed(1)}${L?'s':'초'}`:st===4?(L?' · folding back':' · 낫으로 복귀'):''}

// ---------- hooks ----------
(function(){
  // the buttons: the generic melee code sees none (thInput runs them), everything else of actorWeapons as usual
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.cur!=='thanatos9'||a.team!==TH||!a.alive)return aw(a,dt);
    const cmd=a.cmd,f=cmd.fire,al=cmd.alt;cmd.fire=false;cmd.alt=false;try{aw(a,dt)}finally{cmd.fire=f;cmd.alt=al}
    if(a.cur==='thanatos9'&&a.alive&&a.team===TH&&!(a.frozen>0)&&thOwn(a)&&!NET.ghost)thInput(a)};
  // the sweep's blow (also when another page's swing is played out here: then it only shows)
  const ms0=meleeStrike;meleeStrike=function(a,heavy,w,dc){const id=w&&WPN[w]&&WPN[w].kind==='melee'?w:a.cur;if(id==='thanatos9'){if(!heavy)thSweepHit(a);return}return ms0(a,heavy,w,dc)};
  // weak stagger: no ×0.4 run from its blows (the stagger they would set is taken back), a short slow instead (host / solo; a zombie
  // another page runs gets it as an effect, below)
  const da=damageActor;damageActor=function(t,dmg,src,o){if(!(o&&o.w==='thanatos9'&&t&&t.team===TZ))return da(t,dmg,src,o);
    const s0=t.staggerT||0,h0=t.hp,a0=t.armor,r=da(t,dmg,src,o);if(!NET.ghost&&!NET.cli&&t.alive&&(t.hp<h0||t.armor<a0)){t.staggerT=s0;t.thSlow=Math.max(t.thSlow||0,o.thL||.3)}return r};
  const msp=maxSpeed;maxSpeed=function(a){const s=msp(a);return a.thSlow>0&&a.team===TZ?s*THN.SLOWK:s};
  EFF_T.push(['thSlow','ts']);
  const nae=netApplyEff;netApplyEff=function(a,e,src){nae(a,e,src);if(a&&a.alive&&e&&e.ts)a.thSlow=Math.max(a.thSlow||0,e.ts/10)};
  // the barrage holds the weapon in hand: no switching, buying into the hand or dropping it until it is over
  const eq=equip;equip=function(a,id,instant){if(a&&a.thS===3&&a.cur==='thanatos9'&&id!=='thanatos9'&&a.alive&&a.team===TH&&thOwn(a)&&WPN[id]&&WPN[id].kind!=='claw'){
      if(a.isPlayer&&!AU.throttle('thlock',700)){HUD.note(LI()?'Mid-barrage — the weapon cannot be changed':'연속 찌르기 중에는 무기를 바꿀 수 없어요',1.2);AU.play('dry',{vol:.4,rate:1.2})}return}
    return eq(a,id,instant)};
  if(typeof playerDrop==='function'){const pd=playerDrop;playerDrop=function(a){if(a&&a.thS===3&&a.cur==='thanatos9')return;return pd(a)}}
  // turned into a zombie, a fresh round: back to the scythe
  const bz=becomeZombie;becomeZombie=function(a,host){thReset(a);return bz(a,host)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){thReset(a);a.thSlow=0}};
  // the world model in the hand: the scythe, or the drill once it is mostly out
  const eg=ensureGun;ensureGun=function(a){if(a.cur!=='thanatos9'||a.team!==TH||!a.ch)return eg(a);const want=thT(a)>.8?'th9wb':'th9w';if(a.gunId===want)return;
    if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!a.gunMat)a.gunMat=matGun();
    const m=new THREE.Mesh(gunGeo(want),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}};
  // the state from other pages
  const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='th'){if(a&&!a.isPlayer&&G.actors.includes(a))thRemote(a,f[2]|0);return}return nd(a,f)};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st==='menu'||G.st==='over')return;for(const a of G.actors)try{thTick(a,dt)}catch(e){console.error(e)}};
  const hu0=HUD.update;HUD.update=function(dt){hu0.call(this,dt);try{thHud()}catch(e){console.error(e)}};
  // the sweep's motion trail in violet
  const vu=VM.update;VM.update=function(dt,a,cam){vu.call(this,dt,a,cam);if(this.id==='thanatos9'&&this.trail){this.trail.mat.uniforms.uCol.value.set('#c49cff');this.trail.mat.uniforms.uOp.value=.55}};
  const ct=cmbTag;cmbTag=function(P,W){return ct(P,W)+(W&&W.thn&&P&&P.team===TH?thTag(P):'')};
  const wt=UI.wTags;UI.wTags=function(W,id){if(W&&W.thn)return LI()?`360° sweep (3.3 m) · RMB: drill form → a ${THN.BAR} s barrage that cannot be stopped · weak stagger`:`360° 휩쓸기 (3.3m) · 우클릭 드릴 변신 → ${THN.BAR}초 연속 찌르기 (취소 불가) · 경직 약함`;return wt.call(this,W,id)};
  // bots: in reach they sweep (it reaches further than other blades); with nothing about they get the drill ready, and they drive it
  // into the first zombie that comes close — through the barrage they walk into it instead of backing off
  const au=AI.update.bind(AI);AI.update=function(a,dt){au(a,dt);if(a.team!==TH||a.cur!=='thanatos9'||!a.bot||!a.alive)return;const cmd=a.cmd,st=a.thS|0;cmd.alt=false;
    const t=jnBotSees(a),d=t?Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)-t.c.hw:99;
    if(st===0){cmd.fire=d<THN.AR-.2;if(d>12&&Math.random()<dt*.35)cmd.alt=true}else if(st===2)cmd.fire=d<THN.BR-.3&&!!a.bot.lof;else cmd.fire=false;
    if(st===3&&t&&d>1.1&&d<8){const h=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)||1;AI.moveDir(a,(t.c.x-a.c.x)/h,(t.c.z-a.c.z)/h);cmd.duck=false}};
  const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.05)L[3]='thanatos9';return L};
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // the stroke: a long, deep whoosh, an airy cut over it, the plates rattling and a violet hum going past
  thswing:{n:3,dur:.7,peak:.8,gain:.6,pj:.05,fn:B=>{whoosh(B,200,760,.42,.78);whoosh(B,1100,3000,.26,.32);const e=B.env(.1,.08,.24,.28);B.osc('sine',110,58,.1,.38,e);
    for(let i=0;i<5;i++)B.grain(.08+i*.035+rr(0,.01),rr(2600,4200),3,.008,.12);const h=B.env(.12,.1,.08,.3);B.osc('sine',620,940,.12,.4,B.f('bandpass',800,4,h))}},
  // into a body: a heavy wet slice, a thud, the plates ringing dark and low
  thhit:{n:3,dur:.6,peak:.95,gain:.85,rev:.12,poly:3,fn:B=>{const s=B.env(.002,.004,.8,.14);B.nz('pink',.002,.18,B.sweep(B.f('bandpass',2200,2.2,s),2200,500,.002,.16));
    const e=B.env(0,.002,1,.13);B.nz('brown',0,.18,B.f('lowpass',300,.8,e));const k=B.env(0,.002,.7,.12);B.osc('sine',92,44,0,.14,k);
    B.ring(.006,rr(520,600),[1,2.28,3.9,5.3],[.22,.14,.08,.05],[.16,.09,.05,.03])}},
  // drawn: steel scraping out, the plates clicking into the crescent, a low violet hum
  thdraw:{n:1,dur:1,peak:.78,gain:.55,rev:.16,fn:B=>{const e=B.env(0,.06,.32,.3);B.nz('white',0,.4,B.sweep(B.f('bandpass',1600,5,e),1600,3800,0,.36));
    for(let i=0;i<6;i++){const t=.34+i*.045;B.grain(t,rr(3000,4200),3,.006,.32);B.ring(t,rr(1700,1900),[1,2.6],[.05,.03],[.06,.03])}
    const h=B.env(.3,.2,.2,.45);B.osc('sine',55,70,.3,.7,h);const v=B.env(.3,.25,.08,.4);B.osc('triangle',440,660,.3,.65,B.f('bandpass',600,3,v))}},
  // (a flutter, B.am, goes on a gain of its own: the envelope's gain already has its ramps)
  // the transformation (3 s): the hub unlocks, six plates come off one after another (a clack each), the fan spins up into a whirr
  // and winds down, the drill folds shut with a heavy lock and a violet surge
  thon:{n:1,dur:3.4,ch:2,peak:.9,gain:.8,rev:.2,fn:B=>{const o=B.comp(-12,4,.003,.2,B.g(.95));
    B.grain(.05,2600,2,.02,.6,o);B.ring(.05,rr(800,900),[1,2.5],[.2,.1],[.15,.07],o);
    for(let k=0;k<6;k++){const t=(.06+(5-k)*.055+.12)*3;B.grain(t,rr(2400,3600),3,.012,.55,B.pan(rr(-.5,.5),o));B.ring(t,rr(1100,1500),[1,2.3,3.7],[.16,.09,.05],[.12,.06,.03],o);
      const e=B.env(t,.003,.3,.06,o);B.nz('brown',t,.08,B.f('lowpass',600,.7,e))}
    {const t0=.6,t1=2.4,e=B.env(t0,.5,.32,.5,o,1.1);const f=B.f('bandpass',300,2.5,e);B.sweep(f,300,1600,t0,1.6);B.nz('pink',t0,t1-t0+.4,f);
      const w=B.g(1,B.env(t0,.5,.14,.5,o,1.1));B.osc('sawtooth',60,180,t0,1.4,B.f('lowpass',900,.8,w));B.am(w,t0,1.6,22,.6)}
    {const t=2.7;B.grain(t,1800,2,.03,.8,o);B.ring(t,rr(600,680),[1,2.4,3.8],[.4,.2,.1],[.35,.15,.08],o);const e=B.env(t,.002,1,.4,B.sh(2,o));B.osc('sine',90,40,t,.45,e);
      const s=B.env(t,.05,.3,.6,o);B.osc('sine',1500,3200,t,.65,B.f('bandpass',2400,2,s))}}},
  // folding back (2.4 s): the drill unlocks, a falling whirr, the plates clack back onto the crescent, the hub locks
  thoff:{n:1,dur:2.8,ch:2,peak:.88,gain:.75,rev:.18,fn:B=>{const o=B.comp(-12,4,.003,.2,B.g(.95));
    B.grain(.05,1900,2,.025,.7,o);B.ring(.05,rr(650,720),[1,2.4],[.25,.12],[.2,.1],o);
    {const t0=.2,e=B.env(t0,.2,.28,.6,o,.6);const f=B.f('bandpass',1500,2.5,e);B.sweep(f,1500,280,t0,1.2);B.nz('pink',t0,1.3,f)}
    for(let k=0;k<6;k++){const t=1.25+k*.13;B.grain(t,rr(2400,3400),3,.011,.5,B.pan(rr(-.5,.5),o));B.ring(t,rr(1100,1400),[1,2.3],[.12,.06],[.1,.05],o)}
    {const t=2.15;B.grain(t,2200,2,.02,.7,o);B.ring(t,rr(800,900),[1,2.5,3.9],[.3,.15,.08],[.22,.1,.05],o);const e=B.env(t,.002,.7,.25,o);B.nz('brown',t,.28,B.f('lowpass',500,.7,e))}}},
  // the barrage (THN.BAR s): a grinding, stuttering drone under a fast mechanical chatter, and a violet scream over it
  thbar:{n:1,dur:THN.BAR+.3,ch:2,peak:.9,gain:.7,rev:.12,fn:B=>{const o=B.comp(-14,5,.003,.15,B.g(.95)),D=THN.BAR;
    {const e=B.g(1,B.env(0,.08,.5,.3,o,D-.4));const f=B.f('bandpass',420,1.6,e);B.nz('pink',0,D+.2,f);B.am(e,0,D,30,.55)}
    {const e=B.env(0,.08,.2,.3,o,D-.4);B.osc('sawtooth',72,78,0,D,B.f('lowpass',700,.9,e))}
    for(let i=0;i<THN.NMAX;i++){const t=.05+i*THN.BI;B.grain(t,rr(2200,3600),2.5,.01,.3,B.pan(i%2?.3:-.3,o));const e=B.env(t,.002,.25,.05,o);B.nz('brown',t,.06,B.f('lowpass',700,.7,e))}
    for(const s of [-1,1]){const e=B.env(.05,.4,.06,.4,B.pan(s*.6,o),D-.8);B.osc('sine',1800+s*30,2400+s*40,.05,D,e)}}},
  // a strike landing: short, wet, a tick of steel
  thstab:{n:4,dur:.3,peak:.85,gain:.6,poly:6,pj:.06,fn:B=>{const e=B.env(0,.002,.8,.06);B.nz('pink',0,.08,B.sweep(B.f('bandpass',1800,2,e),1800,600,0,.07));
    const k=B.env(0,.002,.6,.07);B.nz('brown',0,.08,B.f('lowpass',380,.8,k));B.grain(.002,rr(3800,5200),2,.006,.35)}},
  // the drill form's hum (loud: others hear where it is)
  thhum:{n:2,dur:1.6,peak:.7,gain:.45,rev:.15,fn:B=>{const e=B.env(0,.3,.4,.8,null,.4);B.osc('sine',62,66,0,1.5,e);const v=B.g(1,B.env(0,.35,.12,.7,null,.35));
    B.osc('triangle',248,252,0,1.5,B.f('bandpass',260,5,v));B.am(v,0,1.5,9,.35);for(let i=0;i<4;i++)B.grain(rr(.1,1.2),rr(3000,5000),4,.008,.08)}}});
SFX_ORDER.push('thswing','thhit','thdraw','thon','thoff','thbar','thstab','thhum');

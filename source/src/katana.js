'use strict';
// ============ Katana (카타나): a two-handed sword ============
// Left click: quick diagonal cuts that alternate, down from the right shoulder, then up from the left hip; each catches up to two.
// Right click: drawn back to the right, a beat, then a wide flat sweep from right to left that goes through up to three.
// Drawn within a second of a gunshot with a zombie in reach it comes out as an instant cut (the draw cut, game.js).
// Everything here is an original design: the model is boxes, the textures are painted below and the sounds are synthesised.

// ---------- atlas materials ----------
// kaSteel the polished blade, kaHamon the misty hardened edge, kaIto the handle's silk wrap over white ray skin, kaIron the guard
const KA_MATS=['kaSteel','kaHamon','kaIto','kaIron'];
for(const m of KA_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintKaAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  // alpha = gloss level for the view model's shader (240..254 = sheen)
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // polished steel: cool grey, the faint wood-grain of folded steel running through it, a fleck of light here and there
  patch('kaSteel',(xx,y,X,Y)=>{const t=nz(X,Y,131,10)+(hash2(X,Y,132)-.5)*.08;let c=mix('#7d8792','#bcc4cd',clamp((t-.25)*1.5,0,1));
    const g=Math.abs(Math.sin(xx*.15+Math.sin(y*.05+nz(X,Y,133,24)*4)*1.8));if(g<.05)c=lt(c,.07);else if(g<.1)c=dk(c,.05);
    if(hash2(X,Y,134)<.004)c='#eef2f6';return c},254);
  // the hardened edge: a frosty white mist, bright crystals glinting in it
  patch('kaHamon',(xx,y,X,Y)=>{const t=nz(X,Y,135,8);let c=mix('#e2e8ec','#ffffff',clamp(t*1.3-.1,0,1));
    if(hash2(X,Y,136)<.02)c='#ffffff';else if(hash2(X,Y,137)<.01)c='#b5bec6';return c},254);
  // the handle: two bands of black silk crossing over and over, a sheen down the middle of each, white ray skin in the diamonds between
  patch('kaIto',(xx,y)=>{const P=16,u=(xx+y)%P,v=((xx-y)%P+P)%P,bu=u<6,bv=v<6;
    if(bu||bv){const s=bu&&bv?Math.min(u,v):bu?u:v;return s===2||s===3?'#302d32':s===0||s===5?'#08070a':'#19171b'}
    const h=hash2(xx,y,138);return h<.12?'#f6f0e2':h<.2?'#b4a990':'#e2d8c0'},246);
  // the guard: dark hammered iron, a little rust in the dents
  patch('kaIron',(xx,y,X,Y)=>{const t=nz(X,Y,139,9)+(hash2(X,Y,140)-.5)*.1;let c=t>.62?'#2f2b28':t<.38?'#151312':'#221f1d';
    const d=Math.hypot(((xx+3)%11)-5.5,((y+(Math.floor(xx/11)%2)*5)%11)-5.5);if(d<2.4)c=dk(c,.25);if(nz(X,Y,141,6)>.74)c=mix(c,'#4a2a1c',.5);return c},244);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintKaAtlas()}}

// ---------- model ----------
// gun frame: origin on the handle where the right hand holds it (just behind the guard), the blade along -Z, its edge toward +Y.
// The left hand holds the handle near the pommel cap (z = KA.zL). t runs along the blade, 0 at the collar to 1 at the point.
const KA={z0:-.066,z1:-.8,zL:.168,KS:.925};
const kaCy=t=>-.021*Math.pow(t,1.7);// the curve: the point sits 2 cm off the straight line, toward the back of the blade
const kaW=t=>.0315-.0085*t;// width, back to edge
const kaTh=t=>.0068-.0026*t;// thickness
const kaSpine=t=>kaCy(t)-kaW(t)*.5;
// the edge; over the last 7.5 % (the point) it sweeps up in a quarter ellipse to meet the back
const kaEdge=t=>{const e=kaCy(t)+kaW(t)*.5;if(t<KA.KS)return e;const k=Math.min(1,(t-KA.KS)/(1-KA.KS)),s=kaSpine(t);return s+(e-s)*Math.sqrt(Math.max(0,1-k*k))};
function kaParts(){const P=[],N=40,L=KA.z0-KA.z1;
  // the blade in slices, each one tilted to follow the curve: from the back, a darker burnished band, the polished flat, the misty
  // hardened edge (its boundary, the temper line, waves along the blade) and a thin bright line where it is sharp. The bands get thinner
  // toward the edge, so the faces step down like the bevels of the real thing.
  // (the point gets finer slices than the body: its edge curves up fast)
  const T=[];for(let i=0;i<N;i++)T.push([KA.KS*(i+.5)/N,KA.KS/N]);for(let i=0;i<12;i++)T.push([KA.KS+(1-KA.KS)*(i+.5)/12,(1-KA.KS)/12]);
  for(const [t,dt] of T){const z=KA.z0-L*t,dz=L*dt,s=kaSpine(t),e=kaEdge(t),w=e-s,th=kaTh(t);if(w<.0018)continue;
    const sl=(kaCy(Math.min(1,t+.01))-kaCy(Math.max(0,t-.01)))/(.02*L),o={rx:Math.atan(sl),r:.0005};
    const sh=s+w*.3,hw=w*(.32+.09*Math.sin(t*41)+.05*Math.sin(t*97+1.3)),hb=Math.max(sh+.0015,e-hw),eh=Math.min(.0011,w*.12);
    P.push(Pt(0,(s+sh)/2,z,th,sh-s,dz+.0012,'gunmetal',o),Pt(0,(sh+hb)/2,z,th*.9,hb-sh,dz+.0012,'kaSteel',o),
      Pt(0,(hb+e-eh)/2,z,th*.55,Math.max(.0004,e-eh-hb),dz+.0012,'kaHamon',o),Pt(0,e-eh/2,z,eh,eh,dz+.0012,'bright',o));
    // the groove down each face of the burnished band, stopping short of the middle of the blade
    if(t>.035&&t<.72)for(const sx of [1,-1])P.push(Pt(sx*(th/2+.0002),s+(sh-s)*.55,z,.0006,.0045,dz+.0012,'blk',o))}
  // the line across the faces where the point begins
  {const t=KA.KS,z=KA.z0-L*t,s=kaSpine(t),e=kaEdge(t),th=kaTh(t);for(const sx of [1,-1])P.push(Pt(sx*(th*.45+.0003),(s+e)/2,z,.0006,e-s,.0014,'bright'))}
  // collar (gold, file-cut faces), two spacers and the guard between them
  P.push(Pt(0,kaCy(0),-.0795,.0132,kaW(0)+.009,.027,'gold',{r:.002}));
  for(const sx of [1,-1])P.push(Pt(sx*.0068,kaCy(0)+.002,-.0795,.0006,kaW(0)+.004,.018,'brass'));
  for(const z of [-.0646,-.0504])P.push(Pt(0,0,z,.03,.044,.0022,'gold',{r:.001}));
  // the guard: a rounded oval of dark iron built up in rows, a gold rim showing round it, the two half-moon openings beside the blade
  // and four gold studs
  for(const [rx,ry,th,m] of [[.034,.037,.0068,'kaIron'],[.0365,.0395,.0046,'gold']]){const n=11,h=2*ry/n;
    for(let j=0;j<n;j++){const y=-ry+(j+.5)*h,yi=Math.max(0,Math.abs(y)-h*.5),hx=rx*Math.sqrt(Math.max(0,1-(yi/ry)*(yi/ry)));P.push(Pt(0,y,-.0575,2*hx,h+.0003,th,m,{r:.0012}))}}
  for(const sx of [1,-1])P.push(Pt(sx*.0215,0,-.0575,.0065,.017,.0072,'muzzle',{r:.0025}));
  for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;P.push(Pt(Math.cos(a)*.026,Math.sin(a)*.029,-.0575,.0045,.0045,.0074,'gold',{rz:Math.PI/4,r:.001}))}
  // the collar at the top of the handle: black with a gold edge
  P.push(Pt(0,0,-.0445,.0298,.0378,.0115,'mblk',{r:.003}),Pt(0,0,-.0392,.0302,.0382,.0016,'gold',{r:.001}));
  // the handle: wrapped in black silk over white ray skin (the texture), the wrap's crossings standing up along both sides
  P.push(Pt(0,0,.0868,.0268,.0342,.2505,'kaIto',{r:.007}));
  for(let z=-.016;z<.2;z+=.0275)for(const sx of [1,-1])for(const a of [.62,-.62])P.push(Pt(sx*.0136,0,z,.0022,.03,.0075,'kaIto',{rx:a,r:.001}));
  // gold ornaments under the wrap, one on each side
  P.push(Pt(.0142,.002,.088,.0035,.011,.03,'gold',{r:.003}),Pt(.0152,.002,.088,.002,.006,.018,'brass',{r:.002}),
    Pt(-.0142,-.002,.118,.0035,.011,.03,'gold',{r:.003}),Pt(-.0152,-.002,.118,.002,.006,.018,'brass',{r:.002}));
  // the pommel cap: black, a gold edge, gold eyelets on the sides
  P.push(Pt(0,0,.2185,.0302,.0384,.014,'mblk',{r:.004}),Pt(0,0,.2118,.0306,.0388,.0016,'gold',{r:.001}),Pt(0,0,.2262,.022,.028,.002,'mblk',{r:.003}));
  for(const sx of [1,-1])P.push(Pt(sx*.0156,0,.219,.002,.008,.008,'gold',{r:.002}));
  return P}

// ---------- first-person rest pose (camera space → the root transform, see skull9.js skPose) ----------
// the right fist just under the guard, low on the right; the blade up and forward, leaning in a little, the edge to the left, so the
// flat of the blade (and the temper line) faces the camera
const KA_REST={p:[.17,-.17,-.45],d:[-.2,.66,-.72],b:[-.957,-.29,0]};
VM_POS.katana=skPose(KA_REST.p,KA_REST.d,KA_REST.b);
// a fist round the handle at gun-space point hp with the forearm toward gun-space point e. Unlike the Skull-9's fists (skHand) the
// forearm need not stand square to the handle: the handle may cross the palm on a slant of up to KA_SLANT, from the heel of the hand
// to the root of the fingers as a sword grip does, so an upright blade is held with the forearms coming up from below instead of
// sticking out sideways
const KA_SLANT=.62;
function kaHand(hp,e,left){const X0=new THREE.Vector3(0,0,left?-1:1),f=new THREE.Vector3(e[0]-hp[0],e[1]-hp[1],e[2]-hp[2]);if(f.lengthSq()<1e-8)f.set(0,-1,0);f.normalize();
  const sm=Math.sin(KA_SLANT),a=clamp(f.dot(X0),-sm,sm),fp=f.clone().addScaledVector(X0,-f.dot(X0));if(fp.lengthSq()<1e-8)fp.set(0,-1,0);fp.normalize();
  const Z=fp.multiplyScalar(Math.sqrt(1-a*a)).addScaledVector(X0,a),X=X0.clone().addScaledVector(Z,-X0.dot(Z)).normalize(),Y=new THREE.Vector3().crossVectors(Z,X);
  const w=new THREE.Vector3(hp[0],hp[1],hp[2]).addScaledVector(Y,-SK_FIST[1]).addScaledVector(Z,-SK_FIST[2]);return {X,Y,Z,w}}
// the elbow (camera space) that goes with hand frame H (gun space) when the gun is posed at p turned by q: straight down the forearm
// from the wrist, so an elbow track always agrees with its fist
const _kaE=new THREE.Vector3();
function kaElb(H,p,q){_kaE.copy(H.w).addScaledVector(H.Z,.3).applyQuaternion(q);return [p[0]+_kaE.x,p[1]+_kaE.y,p[2]+_kaE.z]}
// where the elbows would like to be at rest ([left, right], camera space): each forearm runs down from its fist toward the bottom of
// the view; the fists turn toward them as far as KA_SLANT lets them, and KA_ELB is where that puts the elbows
const KA_ELB_RAW=[[.02,-.72,-.26],[.27,-.5,-.48]];
const KA_ELB=(()=>{const P=VM_POS.katana,q=new THREE.Quaternion().setFromEuler(new THREE.Euler(P.r[0],P.r[1],P.r[2],'XYZ')),qi=q.clone().invert();
  return [[KA.zL,KA_ELB_RAW[0],true],[0,KA_ELB_RAW[1],false]].map(([z,e,left])=>{const eg=new THREE.Vector3(e[0]-P.p[0],e[1]-P.p[1],e[2]-P.p[2]).applyQuaternion(qi);
    return kaElb(kaHand([0,0,z],[eg.x,eg.y,eg.z],left),P.p,q)})})();
// both fists closed round the handle, forearms toward the rest elbows (buildVM hook); the swings turn the gun on a pivot (see kaClip)
function kaVmArms(armR,armL){const P=VM_POS.katana;_skE.set(P.r[0],P.r[1],P.r[2],'XYZ');_skQ.setFromEuler(_skE).invert();
  const gun=armR.parent,root=gun&&gun.parent;if(root&&!gun.userData.piv){const pv=new THREE.Group();root.remove(gun);pv.add(gun);root.add(pv);gun.userData.piv=pv}
  for(const [arm,z,e,left] of [[armR,0,KA_ELB[1],false],[armL,KA.zL,KA_ELB[0],true]]){if(!arm)continue;
    const eg=_skB.set(e[0]-P.p[0],e[1]-P.p[1],e[2]-P.p[2]).applyQuaternion(_skQ);const H=kaHand([0,0,z],[eg.x,eg.y,eg.z],left);
    arm.position.copy(H.w);_skM.makeBasis(H.X,H.Y,H.Z);arm.quaternion.setFromRotationMatrix(_skM);arm.visible=true;if(arm.userData.hand)arm.userData.hand.rest=.95;vmHandCurl(arm,.95)}}
GUNS.katana={parts:kaParts(),grip:[0,0,0],sup:[0,0,KA.zL],muzzle:[0,kaCy(.5),-.45],vmFix:kaVmArms,
  trail:[0,kaCy(.45),KA.z0-(KA.z0-KA.z1)*.45,0,kaCy(.98),KA.z1+.012]};// the motion trail runs along the outer half of the blade

// ---------- stats ----------
// cleave/arc per attack (light, heavy): how many one blow can hit and the cone (cosine) it reaches over; kbL = sideways share of the push
WPN.katana={slot:3,kind:'melee',n:['카타나','Katana'],cost:9000,dmg:[105,280],rate:[.5,1.05],range:[2.6,2.9],kb:[4,11],stag:[.55,1.1],
  speed:1,draw:.75,model:'katana',hold:'katana',sw:1,hitT:[.17,.36],anD:[.42,.76],cleave:[2,3],arc:[.45,.32],kbL:[.3,.5],
  swS:'kaswing',hitS:'kahit',drawS:'kadraw'};
BUY_MENU.find(c=>c.k==='special').items.push('katana');
// third person: two hands on the handle, held up in front of the right shoulder; light = a diagonal chop, heavy = the flat sweep
HOLDS.katana={off:[-.04,-.28,-.17],rx:1.1,rz:Math.PI,ham:1,kA:'hamA',kH:'skA'};
// draw: brought up from the left hip in an arc, as if out of a scabbard there, overshooting a little before it settles
VMK.drKa=[[0,[-.2,-.34,.12,-1.05,-.45,.9]],[.5,[.01,.02,0,.12,.02,-.06]],[.78,[0,-.005,0,-.025,0,.012]],[1,[0,0,0,0,0,0]]];

// ---------- first-person swings ----------
// Built like the Skull-9's (skull9.js): keys in seconds, [t, grip point (where the right fist holds the handle), blade direction, edge
// direction, right elbow, left elbow], all camera space; elbows left out are placed from the hands. The blow lands at WPN.katana.hitT.
const KA_SW={
  // down from the right shoulder: cocked up and back with the edge leading, a beat, then cut across to the lower left and held there.
  // The blade turns in one plane through the forward and up-right directions (U, F below), the edge always leading
  light:[[0,null],
    [.07,[.25,-.05,-.42],[.68,.68,.26],[.18,.18,-.97]],
    [.1,[.26,-.04,-.41],[.66,.66,.34],[.24,.24,-.94]],
    [.17,[.03,-.13,-.48],[-.3,-.3,-.91],[-.64,-.64,.42]],
    [.23,[-.06,-.18,-.47],[-.6,-.6,-.53],[-.37,-.37,.85]],
    [.3,[-.07,-.19,-.46],[-.61,-.61,-.5],[-.35,-.35,.87]]],
  // up from the left hip: dropped low to the left with the edge turned forward, then cut up and across to the upper right
  light2:[[0,null],
    [.08,[-.06,-.27,-.42],[-.64,-.64,.42],[-.3,-.3,-.91]],
    [.11,[-.07,-.28,-.41],[-.62,-.62,.47],[-.33,-.33,-.88]],
    [.17,[.04,-.13,-.5],[-.06,-.06,-1],[.7,.7,-.09]],
    [.24,[.2,.02,-.44],[.7,.7,-.17],[.12,.12,.985]],
    [.31,[.21,.03,-.43],[.71,.71,.02],[0,-.02,1]]],
  // the sweep: drawn back to the right with the blade flat, pointing back and the edge to the front, held, then swept flat across to the
  // left and held there
  heavy:[[0,null],
    [.12,[.3,-.1,-.36],[.9,.15,.4],[.41,0,-.91]],
    [.28,[.32,-.09,-.35],[.92,.14,.36],[.37,0,-.93]],
    [.36,[.03,-.14,-.5],[-.26,.03,-.97],[-.97,0,.26]],
    [.44,[-.18,-.16,-.44],[-.94,0,-.34],[-.34,0,.94]],
    [.6,[-.2,-.2,-.43],[-.96,-.08,-.26],[-.26,0,.97]],
    [.82,[.06,-.2,-.45],[-.35,.52,-.78],[-.85,-.4,-.35]],
    [.92,[.17,-.17,-.45],[-.2,.66,-.72],[-.957,-.29,0]]]};
// camera [t, pitch, yaw, roll], sounds [t, sound, vol, rate], the trail window — seconds
const KA_FX={
  light:{C:[[0,0,0,0],[.1,.006,-.008,-.012],[.17,-.008,.014,.025],[.26,-.006,.01,.018],[.4,0,0,0]],E:[[.09,'kaswing',.75,1.05]],trail:[.11,.25]},
  light2:{C:[[0,0,0,0],[.11,-.006,.008,.012],[.17,.008,-.014,-.025],[.26,.005,-.01,-.018],[.4,0,0,0]],E:[[.1,'kaswing',.75,1.12]],trail:[.12,.26]},
  heavy:{C:[[0,0,0,0],[.28,.004,-.02,-.02],[.36,0,.025,.03],[.5,0,.03,.03],[.85,0,0,0]],E:[[.05,'kdraw',.2,.7],[.29,'kaswing',.95,.85]],trail:[.3,.48]}};
const _kaO=[0,0,0,0,0,0,0],_kaV=new THREE.Quaternion(),_kaI=new THREE.Quaternion();
// a swing clip d seconds long: the pivot track (turns from the rest pose as quaternions), both fists, the camera and the sounds
function kaClip(name,d){const T=window.__KAT&&window.__KAT[name],K=(T&&T.K)||KA_SW[name],F=(T&&T.F)||KA_FX[name];
  const R0=VM_POS.katana,q0=new THREE.Quaternion().setFromEuler(new THREE.Euler(R0.r[0],R0.r[1],R0.r[2],'XYZ')),qi=q0.clone().invert();
  const P=[[0,0,0,0,0,0,0,1]],Rk=[HK(0,0)],Hk=[HK(0,0)],eR=[[0,...KA_ELB[1]]],eL=[[0,...KA_ELB[0]]];let pq=new THREE.Quaternion();
  for(const k of K){if(!k[1])continue;const u=k[0]/d,[X,Y,Z]=skBasis(k[2],k[3]);_skM.makeBasis(X,Y,Z);const q=new THREE.Quaternion().setFromRotationMatrix(_skM);
    const rel=qi.clone().multiply(q);if(rel.dot(pq)<0)rel.set(-rel.x,-rel.y,-rel.z,-rel.w);pq=rel;
    const dp=_skC.set(k[1][0]-R0.p[0],k[1][1]-R0.p[1],k[1][2]-R0.p[2]).applyQuaternion(qi);
    P.push([u,dp.x,dp.y,dp.z,rel.x,rel.y,rel.z,rel.w]);
    // elbows: given, or below, behind and outside each fist (the left fist is up the handle, toward the pommel)
    const dn=_skA.set(k[2][0],k[2][1],k[2][2]).normalize(),pL=[k[1][0]-dn.x*KA.zL,k[1][1]-dn.y*KA.zL,k[1][2]-dn.z*KA.zL];
    const elR=k[4]||[k[1][0]+.22,k[1][1]-.3,k[1][2]+.3],elL=k[5]||[pL[0]-.22,pL[1]-.3,pL[2]+.28];
    const qk=q.clone().invert();
    for(const [Lk,el,z,left,E] of [[Rk,elR,0,false,eR],[Hk,elL,KA.zL,true,eL]]){const eg=_skB.set(el[0]-k[1][0],el[1]-k[1][1],el[2]-k[1][2]).applyQuaternion(qk);
      const H=kaHand([0,0,z],[eg.x,eg.y,eg.z],left),pm=H.w.clone().addScaledVector(H.Y,-.004).addScaledVector(H.Z,-.045);
      Lk.push(HK(u,1,[pm.x,pm.y,pm.z-(left?KA.zL:0)],1,[H.Y.x,H.Y.y,H.Y.z],.95));E.push([u,...kaElb(H,k[1],q)])}}
  P.push(pq.w<0?[1,0,0,0,0,0,0,-1]:[1,0,0,0,0,0,0,1]);Rk.push(HK(1,0));Hk.push(HK(1,0));eR.push([1,...KA_ELB[1]]);eL.push([1,...KA_ELB[0]]);
  const sc=r=>[r[0]/d,...r.slice(1)];
  return {P,R:{A:[{grip:1},{p:[0,0,0]}],k:Rk,elbT:eR},H:{A:[{sup:1},{p:[0,0,KA.zL]}],k:Hk,elbT:eL},
    C:[...F.C.map(sc),[1,0,0,0]],E:F.E.map(sc),trail:F.trail.map(t=>t/d),heavy:name==='heavy'}}
// the game's hook (vm.js calls it from VM.melee); light cuts alternate sides
VM.kaSwing=function(heavy){const m=this.cur,W=WPN.katana;if(!m||!m.gun.userData.piv)return false;
  const name=heavy?'heavy':((this.kaSide=this.kaSide>0?-1:1)>0?'light':'light2'),d=W.rate[heavy?1:0]-.08;let S=null;
  try{S=kaClip(name,d)}catch(e){console.error(e)}if(!S)return false;const A=this.playClip(S,0,d,'mel');if(!A)return false;A.mel=1;this.mel=null;this.trail.S.length=0;return true};
// the pivot: reset every frame (vm.js VMX hook, before the clip runs), posed from the clip right after the clip has advanced
VMX.katana=function(vm,a,dt,K,m){const pv=m.gun.userData.piv;if(pv){pv.position.set(0,0,0);pv.quaternion.set(0,0,0,1)}};
{const af=VM.actFrame;VM.actFrame=function(dt,m,W,K){af.call(this,dt,m,W,K);const A=this.act,pv=m.gun.userData.piv;if(this.id!=='katana'||!pv||!A||!A.S.P||A.t<A.st)return;
  const k=1-(A.fk||0);fdTrack(A.S.P,A.u,_kaO);pv.position.set(_kaO[0]*k,_kaO[1]*k,_kaO[2]*k);_kaV.set(_kaO[3],_kaO[4],_kaO[5],_kaO[6]).normalize();
  if(k<1)pv.quaternion.copy(_kaI).slerp(_kaV,k);else pv.quaternion.copy(_kaV)}}
// a blow that lands holds the cut for a moment (lighter than the Skull-9's) and nudges the view
{const mh=VM.meleeHit;VM.meleeHit=function(heavy,what){if(this.id!=='katana')return mh.call(this,heavy,what);const A=this.act;if(!A||!A.mel||A.fade)return;
  A.hold=Math.max(A.hold,what===1?(heavy?.075:.05):.04);const k=what===1?(heavy?.9:.6):.45;A.cam.p.v-=.35*k;A.cam.r.v+=(heavy?.5:.3)*k*(this.kaSide||1);this.sp.pz.v+=.3*k}}

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // the stroke: a thin, fast cut through the air and a faint whistle off the blade
  kaswing:{n:3,dur:.4,peak:.75,gain:.5,pj:.06,fn:B=>{whoosh(B,1400,4200,.15,.7);whoosh(B,600,1600,.22,.3);const e=B.env(.04,.03,.06,.12);B.osc('sine',2600,1700,.04,.16,e)}},
  // a clean cut: a wet slice, a soft thump, a short bright ring off the steel
  kahit:{n:3,dur:.5,peak:.9,gain:.75,rev:.08,poly:3,fn:B=>{const s=B.env(0,.003,.8,.09);B.nz('pink',0,.12,B.sweep(B.f('bandpass',2600,2.2,s),2600,700,0,.1));
    const e=B.env(0,.002,.6,.07);B.nz('brown',0,.09,B.f('lowpass',380,.8,e));B.grain(.002,5200,1.2,.006,.4);B.ring(.004,rr(2700,3100),[1,2.76,5.4],[.18,.1,.05],[.12,.06,.03])}},
  // drawn: the collar clicking free of the scabbard, the steel sliding out, the blade ringing
  kadraw:{n:1,dur:1,peak:.8,gain:.55,rev:.2,fn:B=>{B.grain(0,3200,2,.01,.6);const e=B.env(.02,.05,.4,.28);B.nz('white',.02,.36,B.sweep(B.f('bandpass',2200,7,e),2200,6400,.02,.34));
    B.ring(.34,rr(3300,3600),[1,1.5,2.71,4.2],[.7,.45,.3,.18],[.16,.08,.05,.03])}}});
SFX_ORDER.push('kaswing','kahit','kadraw');

'use strict';
// ============ 도축업자 좀비 (Butcher Zombie, v7.10): a gaff hook on a chain, thrown — whoever it catches is dragged in ============
// The body (design.js: a blood-soaked rubber apron, a chain wound round the left forearm, a cleaver in the right fist) claws with the
// cleaver; every other light blow is a backhand of the chained left fist (models.js). The big hook hangs from that fist on a short length
// of chain and swings as the butcher walks (BH.pend: a point on a rope under the hand).
// G: 갈고리 — it swings the hook back (BH.WIND s; the chain rattles) and throws it where it looks (a bot: where its target will be). The
// hook flies BH.SPD m/s out to BH.RANGE m; a wall stops it. The first human it passes within BH.R m of (in the open, not through a
// wall) is caught and dragged toward the butcher at BH.PULL m/s until within BH.STOP m, for at most BH.MAX s — off a ledge if need be.
// The one dragged can still shoot. BH.FREE damage to the butcher from the humans while it hauls breaks the chain: the human is free, the
// butcher staggers and the one who broke it gets a point. The pull also ends if the butcher is frozen or dies, or the human turns, dies or
// is stuck against something. Then the hook comes back to the hand.
// Network (host-authoritative): the host starts the swing ('bhw'), throws ('bht': from where, which way), decides what the hook hits
// ('bhh' a human, 'bhm' a wall or nothing) and when the haul ends ('bhx'). Every page flies its own copy of the hook for the look; the
// page that moves the caught human (the host for bots, that player's own page) drags it.
const BH={WIND:.32,SPD:32,RANGE:16,R:.36,PULL:13,MAX:1.25,STOP:1.45,FREE:280,RET:.32,HANG:.42,
  // first person — the cleaver hand [hand x,y,z, toward-elbow x,y,z, pitch, yaw, roll] (zkit.js zkAim): at rest (held up at the right, the
  // flat of the blade to the view, its edge to the left), its chop, the heavy cleave; the chain hand [hand, toward-elbow]: at rest, swung
  // back, the throw, the haul
  VR:[.21,-.25,-.39,.34,-.72,.6,.78,.3,1.35],VL:[-.19,-.24,-.4,-.3,-.7,.65]};
BH.VA=[[0,BH.VR],[.24,[.28,.04,-.3,.42,-.6,.68,2.0,.36,.3]],[.32,[.29,.06,-.31,.42,-.6,.68,2.15,.38,.2]],[.44,[.04,-.12,-.5,.3,-.15,.94,-.35,.05,0]],
  [.56,[-.1,-.3,-.42,.2,.32,.93,-1.0,-.3,0]],[.8,[.13,-.28,-.39,.3,-.62,.72,.35,.12,.9]],[1,BH.VR]];
BH.VH=[[0,BH.VR],[.34,[.16,.14,-.34,.2,-.85,.5,2.4,.1,0]],[.44,[.16,.16,-.34,.2,-.85,.5,2.5,.1,0]],[.56,[.02,-.12,-.52,.15,.12,.98,-.5,0,0]],
  [.7,[.02,-.32,-.46,.15,.4,.9,-1.1,0,0]],[.9,[.13,-.28,-.39,.3,-.62,.72,.4,.1,.9]],[1,BH.VR]];
BH.VT=[[0,BH.VL],[.45,[-.3,-.12,-.22,-.55,-.4,.75]],[.6,[-.32,-.1,-.2,-.6,-.35,.72]],[.76,[-.06,-.1,-.58,-.15,-.2,.97]],[1,[-.1,-.14,-.52,-.2,-.35,.92]]];
// (the heavy cleave: the chain hand reaches out to grab first)
BH.VG=[[0,BH.VL],[.3,[-.15,-.15,-.52,-.2,-.42,.88]],[.5,[-.13,-.18,-.54,-.2,-.4,.9]],[.62,[-.2,-.26,-.44,-.32,-.62,.72]],[1,BH.VL]];
const isBh=a=>!!a&&a.zc==='butcher'&&a.team===TZ;
const bhOn=()=>!(typeof EP!=='undefined'&&EP.on)&&G.mode!=='scen';

// ---------- models: the gaff hook (an eye, the shank, the bend and its sharpened point), the cleaver and the chain coil in first person ----------
function bhHookParts(s){const P=[Pt(0,0,0,.05*s,.05*s,.018*s,'forged',{r:.012*s}),Pt(0,0,0,.024*s,.024*s,.02*s,'muzzle'),Pt(0,-.13*s,0,.022*s,.22*s,.022*s,'forged',{r:.007*s})];
  const cx=.068*s,cy=-.24*s,r=.068*s;
  for(let k=0;k<6;k++){const th=Math.PI+k*Math.PI/4,last=k===5;P.push(Pt(cx+Math.cos(th)*r,cy+Math.sin(th)*r,0,.022*s,(last?.07:.058)*s,.022*s,last?'bright':'forged',
    Object.assign({rz:th,r:.006*s},last?{ky:[1,.18,1,.18]}:{})))}
  P.push(Pt(cx+r*.55,cy-r*.15,0,.008*s,.05*s,.024*s,'bhBlade',{rz:Math.PI*1.75}));// a bloody edge on the inside of the bend
  return P}
GUNS.bhHook={parts:bhHookParts(1.15),grip:[0,0,0],muzzle:[0,0,0]};
// (the cleaver: the handle along -z, the blade's edge to -x — its leading side, zkAim — its spine to +x, the hole near the tip)
GUNS.bhCleaverVM={parts:[Pt(0,0,-.03,.036,.03,.14,'wood',{r:.012}),Pt(0,0,.045,.04,.034,.02,'steel',{r:.008}),Pt(-.034,0,-.2,.14,.009,.21,'bhBlade',{r:.002}),
  Pt(.036,0,-.2,.014,.014,.21,'steel',{r:.003}),Pt(.02,0,-.285,.022,.011,.022,'muzzle',{r:.006})],grip:[0,0,0],muzzle:[0,0,0]};
GUNS.bhCoil={parts:[0,1,2,3,4].map(i=>Pt(0,0,.08+i*.045,.094,.094,.03,'bhChain',{r:.03})),grip:[0,0,0],muzzle:[0,0,0]};

// ---------- the chain between the hand and the hook (world): a thin tube, its links shaded along its length ----------
const BH_CHG=(()=>{const g=new THREE.CylinderGeometry(.013,.013,1,6,1,true);g.translate(0,.5,0);return g})();
function bhChainMat(){return new THREE.ShaderMaterial({uniforms:Object.assign({uProbe:{value:new THREE.Color(.4,.4,.45)},uLen:{value:1}},LU),
  vertexShader:'uniform float uLen;varying float vL;varying vec3 vPos;varying vec3 vN;void main(){vL=position.y*uLen;vec4 wp=modelMatrix*vec4(position,1.);vPos=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}',
  fragmentShader:GLSL_DYN+'uniform vec3 uProbe;varying float vL;varying vec3 vPos;varying vec3 vN;void main(){vec3 n=normalize(vN);float u=fract(vL/.075),k=mod(floor(vL/.075),2.);'+
    'float gap=smoothstep(0.,.1,u)*smoothstep(1.,.9,u);vec3 b=mix(vec3(.07,.07,.08),mix(vec3(.38,.39,.4),vec3(.5,.5,.52),k),gap);'+
    'vec3 c=b*(uProbe*1.25*(.55+.45*max(n.y,0.))+dynLight(vPos,n))+vec3(.06)*pow(max(dot(n,normalize(cameraPosition-vPos)),0.),5.)*gap;gl_FragColor=vec4(applyFog(c,vPos),1.);}'})}
const _bhA=new THREE.Vector3(),_bhB=new THREE.Vector3(),_bhQ=new THREE.Quaternion(),_bhY=new THREE.Vector3(0,1,0),_bhD=new THREE.Vector3();
// stretch a chain mesh from p0 to p1
function bhLink(m,p0,p1){_bhD.subVectors(p1,p0);const L=_bhD.length();if(L<1e-4){m.visible=false;return}m.visible=true;m.position.copy(p0);_bhQ.setFromUnitVectors(_bhY,_bhD.multiplyScalar(1/L));
  m.quaternion.copy(_bhQ);m.scale.set(1,L,1);m.material.uniforms.uLen.value=L;sampleProbe((p0.x+p1.x)/2,(p0.y+p1.y)/2+.3,(p0.z+p1.z)/2,m.material.uniforms.uProbe.value)}

// ---------- first person: the cleaver in the right fist; the left fist (a rubber gauntlet, the chain wound round it) holds the hook's chain ----------
ZK.vm.butcher=(mat,root)=>{const R=zkArm('zs_butcher','zs_butcher',mat,{}),L=zkArm('rub','zs_butcher',mat,{left:1});
  const W=new THREE.Group();W.position.set(0,-.012,-.045);R.children[0].add(W);const T=new THREE.Group();W.add(T);
  const cl=new THREE.Mesh(partGeo(GUNS.bhCleaverVM.parts),mat);cl.frustumCulled=false;T.add(cl);
  const coil=new THREE.Mesh(partGeo(GUNS.bhCoil.parts),mat);coil.frustumCulled=false;L.children[0].add(coil);
  // the hook under the fist on its few links of chain (it swings: BH.vmPend), drawn in the view's own space
  const hk=new THREE.Group(),hm=new THREE.Mesh(partGeo(bhHookParts(.62)),mat);hm.frustumCulled=false;hk.add(hm);root.add(hk);
  const ln=new THREE.Mesh(partGeo([Pt(0,.5,0,.012,1,.012,'bhChain')]),mat);ln.frustumCulled=false;root.add(ln);
  return {armR:R,armL:L,wrist:W,aimT:T,tool:cl,aim:BH.VR.slice(6),hook:hk,link:ln,pend:null,zp:BH.vmPose,zt:BH.vmTrail,zq:BH.vmAim}};
const _bhv=new THREE.Vector3(),_bhw=new THREE.Vector3(),_bhq=new THREE.Quaternion(),_bhk=[0,0,0,0,0,0];
BH.vmPose=function(V,A,dt,m,a){const K=m.zk,M=V.mel;let tr=false,o=BH.VR;V.camPitch=0;
  for(let j=0;j<6;j++){A[0][j]=BH.VR[j];A[1][j]=BH.VL[j]}
  const S=a&&a.bhS,thr=S==='wind'||S==='fly'&&(a.bhT||0)<.16;
  if(S==='wind'||thr){const p=S==='wind'?clamp((a.bhT||0)/(BH.WIND+.1),0,.76):clamp(.76+(a.bhT||0)/.16*.24,.76,1);zkPose(BH.VT,p,A,1,_bhk)}
  else if(S==='fly'||S==='pull'){const h=S==='pull'?Math.sin(V.t*14)*.5+.5:0;A[1][0]=-.1;A[1][1]=-.15+h*.03;A[1][2]=-.52+h*.12;A[1][3]=-.2;A[1][4]=-.35;A[1][5]=.92}
  if(M){M.t+=dt;const p=clamp(M.t/M.d,0,1);
    if(!M.heavy&&M.side<0){tr=zkClawSwipe(V,A,p,-1);K.trL=1}
    else{K.trL=0;o=zkPose(M.heavy?BH.VH:BH.VA,p,A,0);tr=M.heavy?(p>.47&&p<.72):(p>.36&&p<.6);
      if(M.heavy&&!S)zkPose(BH.VG,p,A,1,_bhk);
      const s=M.heavy?(p>.44&&p<.74?Math.sin((p-.44)/.3*Math.PI):0):(p>.34&&p<.62?Math.sin((p-.34)/.28*Math.PI):0);V.camPitch=-s*(M.heavy?.08:.045);V.camRoll=M.heavy?0:-s*.03}
    if(p>=1)V.mel=null}
  K.aim[0]=o[6];K.aim[1]=o[7];K.aim[2]=o[8];
  // the hook: on its chain under the fist unless it is out (thrown, in someone, coming back)
  const out=S==='fly'||S==='pull'||S==='ret';K.hook.visible=!out&&V.vis;K.link.visible=!out&&V.vis;
  if(!out)BH.vmPend(K,A[1],dt);else K.pend=null;// (back in the hand, it hangs again from rest rather than swinging on from where it left)
  return tr};
BH.vmAim=function(V,m){const K=m.zk;zkAim(K.aimT,K.aim[0],K.aim[1],K.aim[2])};
// the view's hook: a point hanging on a rope under the left fist (in the view's space; gravity turned into it from the camera)
BH.vmPend=function(K,a1,dt){const f=_bhv.set(a1[0],a1[1],a1[2]);_bhw.set(a1[3],a1[4],a1[5]).normalize();f.addScaledVector(_bhw,-.075);f.y-=.03;// (the fist, a little in front of the wrist)
  let P=K.pend;if(!P){P=K.pend={x:f.x,y:f.y-.16,z:f.z,px:f.x,py:f.y-.16,pz:f.z}}
  _bhq.copy(R.cam.quaternion).invert();const g=_bhw.set(0,-9.8,0).applyQuaternion(_bhq);const h=Math.min(dt,.05);
  const nx=P.x+(P.x-P.px)*.9+g.x*h*h,ny=P.y+(P.y-P.py)*.9+g.y*h*h,nz=P.z+(P.z-P.pz)*.9+g.z*h*h;P.px=P.x;P.py=P.y;P.pz=P.z;
  let dx=nx-f.x,dy=ny-f.y,dz=nz-f.z;const d=Math.hypot(dx,dy,dz)||1,L=.16;P.x=f.x+dx/d*L;P.y=f.y+dy/d*L;P.z=f.z+dz/d*L;
  K.hook.position.set(P.x,P.y,P.z);_bhD.set(-(P.x-f.x),-(P.y-f.y),-(P.z-f.z)).normalize();K.hook.quaternion.setFromUnitVectors(_bhY,_bhD);
  K.link.position.set(P.x,P.y,P.z);K.link.quaternion.copy(K.hook.quaternion);K.link.scale.set(1,L,1)};
BH.vmTrail=function(V,m,p0,p1){if(m.zk.trL)return false;m.zk.tool.localToWorld(p0.set(-.1,0,-.3));m.zk.tool.localToWorld(p1.set(-.1,0,-.12));return true};

// ---------- the hook and its chain in the world ----------
const _bhH=new THREE.Vector3(),_bhM=new THREE.Matrix4();
// where the left fist is (world): from the rig, or for the local player from the view (its left hand on screen, set into the world)
BH.hand=function(a,out){const ch=a.ch;if(a===G.player&&!G.spec&&a.alive){const K=VM.cur&&VM.cur.zk;if(K&&K.armL){K.armL.updateMatrixWorld(true);K.armL.getWorldPosition(out);out.project(R.vmCam);
      out.z=.5;out.unproject(R.cam).sub(R.cam.position).normalize();return out.multiplyScalar(.6).add(R.cam.position)}// (the view's left hand on screen, 0.6 m into the world that way)
    const e=actorEye(a);aimDir(a.yaw,a.pitch,_dv);return out.set(e.x+_dv.x*.4-Math.cos(a.yaw)*.22,e.y-.3,e.z+_dv.z*.4+Math.sin(a.yaw)*.22)}
  if(!ch)return out.set(a.c.x,a.c.y+1,a.c.z);const d=ch.A.def,h=d.hand;out.set(-h[0],h[1]-.03,h[2]).applyMatrix4(ch.uB[4]).applyMatrix4(ch.grp.matrixWorld);return out};
// make (once) the hook's mesh and its chain for a butcher
BH.mesh=function(a){if(!a.bhM){a.bhM=new THREE.Mesh(gunGeo('bhHook'),matGun());a.bhM.frustumCulled=false;a.bhC=new THREE.Mesh(BH_CHG,bhChainMat());a.bhC.frustumCulled=false;
    a.bhP={x:a.c.x,y:a.c.y+.6,z:a.c.z,px:a.c.x,py:a.c.y+.6,pz:a.c.z}}
  if(!a.bhM.parent)R.scene.add(a.bhM);if(!a.bhC.parent)R.scene.add(a.bhC)};
// every frame on every page: the hook hanging and swinging under the hand, flying out, in the human it caught, coming back
BH.place=function(a,dt){const S=a.bhS||'',drawn=a.ch&&a.ch.grp.visible,me=a===G.player&&!G.spec&&a.alive;
  if(!isBh(a)||!drawn&&!(me&&(S==='fly'||S==='pull'||S==='ret'))){if(a.bhM){a.bhM.visible=false;a.bhC.visible=false}return}
  BH.mesh(a);const H=BH.hand(a,_bhH),m=a.bhM,P=a.bhP;m.visible=true;
  if(S==='fly'||S==='pull'||S==='ret'){_bhA.set(a.bhX,a.bhY,a.bhZ);
    if(S==='pull'&&a.bhV&&a.bhV.alive){const v=a.bhV,dx=a.c.x-v.c.x,dz=a.c.z-v.c.z,d=Math.hypot(dx,dz)||1;a.bhX=v.c.x+dx/d*.24;a.bhY=v.c.y+1.2;a.bhZ=v.c.z+dz/d*.24;_bhA.set(a.bhX,a.bhY,a.bhZ)}
    m.position.copy(_bhA);_bhD.subVectors(H,_bhA);if(_bhD.lengthSq()>1e-6){_bhD.normalize();m.quaternion.setFromUnitVectors(_bhY,_bhD)}
    bhLink(a.bhC,H,_bhA);P.x=P.px=_bhA.x;P.y=P.py=_bhA.y;P.z=P.pz=_bhA.z}
  else{// the pendulum: a point on a rope of BH.HANG under the fist
    if(me){m.visible=false;a.bhC.visible=false;return}const h=Math.min(dt,.05);
    const nx=P.x+(P.x-P.px)*.92,ny=P.y+(P.y-P.py)*.92-9.8*h*h,nz=P.z+(P.z-P.pz)*.92;P.px=P.x;P.py=P.y;P.pz=P.z;
    let dx=nx-H.x,dy=ny-H.y,dz=nz-H.z;const d=Math.hypot(dx,dy,dz)||1;if(d>BH.HANG||!(dy<0)){P.x=H.x+dx/d*BH.HANG;P.y=H.y+dy/d*BH.HANG;P.z=H.z+dz/d*BH.HANG}else{P.x=nx;P.y=ny;P.z=nz}
    if(Math.hypot(P.x-H.x,P.y-H.y,P.z-H.z)>BH.HANG*3){P.x=P.px=H.x;P.y=P.py=H.y-BH.HANG;P.z=P.pz=H.z}// (a jump in place)
    _bhA.set(P.x,P.y,P.z);m.position.copy(_bhA);_bhD.subVectors(H,_bhA).normalize();m.quaternion.setFromUnitVectors(_bhY,_bhD);m.rotateY(a.yaw);bhLink(a.bhC,H,_bhA)}
  sampleProbe(m.position.x,m.position.y+.3,m.position.z,m.material.uniforms.uProbe.value)};

// ---------- the throw ----------
// host (or offline): G pressed
BH.start=function(a){if(!isBh(a)||!a.alive||!bhOn()||a.scen||a.bhS)return false;if(a.frozen>0||a.holdT>0||a.reviving>0||a.cur==='zbomb')return false;
  BH.begin(a);a.bhTg=a.bot&&a.bot.target&&a.bot.target.alive?a.bot.target:null;if(NET.host)netEv('bhw',{i:a.id});return true};
// every page: the hook swung back, the chain rattling
BH.begin=function(a){a.bhS='wind';a.bhT=0;a.bhD=0;a.an.skill=Math.max(a.an.skill,.5);AU.at('bhrattle',a.c.x,a.c.y+1.2,a.c.z,{vol:.9,range:30});
  AU.at('zgrowl',a.c.x,a.c.y+1.5,a.c.z,{vol:.7,range:30,rate:.9});if(a.isPlayer)HUD.note(LI()?'Meat hook!':'갈고리!',.8)};
// host: off it goes — from the fist, where it looks (a bot: where its target will be when the hook gets there)
BH.release=function(a){const o=BH.hand(a,new THREE.Vector3());let dx,dy,dz;const t=a.bot&&a.bhTg;a.bhTg=null;
  // (a bot leads its target, though not perfectly: the lead misjudged a little and the hook off by up to e m to either side, less on harder bots)
  if(t&&t.alive&&t.team===TH){const d0=Math.hypot(t.c.x-o.x,t.c.z-o.z),k=d0/BH.SPD*rr(.5,1.25),e=[.8,.62,.46,.34][CFG.diff|0]||.55,sx=-(t.c.z-o.z)/(d0||1),sz=(t.c.x-o.x)/(d0||1),f=rr(-1,1)*e;
    const tx=t.c.x+(t.c.vx||0)*k+sx*f,ty=t.c.y+1.15+rr(-.25,.3),tz=t.c.z+(t.c.vz||0)*k+sz*f;dx=tx-o.x;dy=ty-o.y;dz=tz-o.z}
  else{aimDir(a.yaw,a.pitch,_dv);const e=actorEye(a);const tx=e.x+_dv.x*BH.RANGE,ty=e.y+_dv.y*BH.RANGE,tz=e.z+_dv.z*BH.RANGE;dx=tx-o.x;dy=ty-o.y;dz=tz-o.z}
  const l=Math.hypot(dx,dy,dz)||1;BH.fly(a,o.x,o.y,o.z,dx/l,dy/l,dz/l);if(NET.host)netEv('bht',{i:a.id,o:[r2(o.x),r2(o.y),r2(o.z)],d:[r3(dx/l),r3(dy/l),r3(dz/l)]})};
// every page: the hook in flight
BH.fly=function(a,x,y,z,dx,dy,dz){a.bhS='fly';a.bhT=0;a.bhX=x;a.bhY=y;a.bhZ=z;a.bhU=[dx,dy,dz];a.bhL=0;a.bhStop=false;AU.at('bhthrow',x,y,z,{vol:1,range:40});if(a.isPlayer)FX.shake=Math.max(FX.shake,.2)};
// host: does the hook catch someone between where it was and where it is now? (the nearest along it, in the open, not held already)
BH.catch=function(a,x0,y0,z0,x1,y1,z1){let best=null,bt=9;const sx=x1-x0,sy=y1-y0,sz=z1-z0,L2=sx*sx+sy*sy+sz*sz;
  for(const h of G.actors){if(!h.alive||h.team!==TH||h.bhA)continue;const cy=clamp(y0,h.c.y+.3,h.c.y+1.6);
    const u=L2>1e-8?clamp(((h.c.x-x0)*sx+(cy-y0)*sy+(h.c.z-z0)*sz)/L2,0,1):0,px=x0+sx*u,py=y0+sy*u,pz=z0+sz*u;
    const d=Math.hypot(h.c.x-px,Math.max(0,Math.abs(py-(h.c.y+.95))-.75),h.c.z-pz);if(d>h.c.hw+BH.R||u>=bt)continue;
    if(!losClear(a.c.x,a.c.y+1.3,a.c.z,h.c.x,h.c.y+1.1,h.c.z)&&!losClear(px,py,pz,h.c.x,h.c.y+1.1,h.c.z))continue;bt=u;best=h}
  return best};
BH.hook=function(a,h){BH.hookApply(a,h);if(NET.host)netEv('bhh',{i:a.id,v:h.id})};
// every page: caught — the hook in the human, the haul begins
BH.hookApply=function(a,h){if(!a||!h)return;const L=LI();a.bhS='pull';a.bhT=0;a.bhD=0;a.bhV=h;a.bhBl=0;h.bhA=a;h.bhP0=G.t;const c=h.c;
  a.bhX=c.x;a.bhY=c.y+1.2;a.bhZ=c.z;AU.at('bhhit',c.x,c.y+1.2,c.z,{vol:1,range:45});FX.blood(c.x,c.y+1.2,c.z,a.c.x-c.x,.3,a.c.z-c.z,1.4,false);
  if(h===G.player){FX.shake=Math.max(FX.shake,.6);AU.play('hurt',{vol:.6});HUD.note(L?'Hooked! Shoot it to break the chain':'갈고리에 걸렸다! 쏴서 사슬을 끊어요',BH.MAX+.4);if(HUD.hurt)HUD.hurt(.3)}
  if(a===G.player)HUD.note(L?`Hooked ${h.name}!`:`${h.name} 걸었다!`,1.2);
  if(h===G.player||!h.pup){c.vy=Math.max(c.vy,2.6);c.onGround=false;c.jumped=true}};
BH.miss=function(a,x,y,z,wall){BH.missApply(a,x,y,z,wall);if(NET.host)netEv('bhm',{i:a.id,x:r2(x),y:r2(y),z:r2(z),w:wall?1:0})};
// every page: the hook stops (a wall: sparks and a clank) and comes back
BH.missApply=function(a,x,y,z,wall){if(!a)return;a.bhX=x;a.bhY=y;a.bhZ=z;if(wall){AU.at('kwall',x,y,z,{vol:.8,range:30,rate:.8});for(let i=0;i<8;i++)FX.spark(x,y,z,rr(-3,3),rr(0,3),rr(-3,3),rr(.15,.4))}
  BH.retract(a)};
BH.end=function(a,freed,src){BH.endApply(a,freed,src);if(NET.host)netEv('bhx',{i:a.id,f:freed?1:0,s:src?src.id:-1})};
// every page: the haul is over (freed: the chain broken by gunfire)
BH.endApply=function(a,freed,src){const v=a.bhV,L=LI();if(v&&v.bhA===a)v.bhA=null;a.bhV=null;
  if(freed){AU.at('bhsnap',a.bhX,a.bhY,a.bhZ,{vol:1,range:45});for(let i=0;i<10;i++)FX.spark(a.bhX,a.bhY,a.bhZ,rr(-4,4),rr(0,4),rr(-4,4),rr(.2,.5));
    if(!a.pup){a.staggerT=Math.max(a.staggerT||0,1);const dx=a.c.x-(v?v.c.x:a.c.x),dz=a.c.z-(v?v.c.z:a.c.z),d=Math.hypot(dx,dz)||1;a.kvx+=dx/d*3;a.kvz+=dz/d*3}
    if(!NET.cli&&src&&src.team===TH)src.score+=1;if(src===G.player&&src!==v)HUD.note(L?'You broke the chain!':'사슬을 끊었다!',1.4);if(v===G.player)HUD.note(L?'Free!':'풀려났다!',1);if(a===G.player)HUD.note(L?'The chain broke!':'사슬이 끊겼다!',1.2)}
  else if(v&&v.alive&&v.team===TH&&(v===G.player||!v.pup)){v.dizzy=Math.max(v.dizzy||0,.6);v.kvx*=.2;v.kvz*=.2}
  BH.retract(a)};
BH.retract=function(a){a.bhS='ret';a.bhT=0;a.bhR0=[a.bhX,a.bhY,a.bhZ]};
BH.reset=function(a){const v=a.bhV;if(v&&v.bhA===a)v.bhA=null;a.bhV=null;a.bhS='';a.bhT=0;a.bhTg=null;if(a.bhA)a.bhA=null};

// ---------- every frame ----------
BH.update=function(dt){const host=!NET.cli,on=bhOn();
  for(const a of G.actors){
    if(a.bhA&&(!a.bhA.alive||a.bhA.bhV!==a||a.team!==TH))a.bhA=null;
    if(!a.bhS)continue;
    if(!isBh(a)||!a.alive||!on){if(a.bhS==='pull'&&host)BH.end(a,false);else BH.reset(a);continue}
    a.bhT+=dt;
    if(a.bhS==='wind'){a.an.skill=Math.max(a.an.skill,.4);if(host&&a.bhT>=BH.WIND)BH.release(a);else if(!host&&a.bhT>BH.WIND+1.5)BH.reset(a);continue}
    if(a.bhS==='fly'){const U=a.bhU,s=BH.SPD*dt,x0=a.bhX,y0=a.bhY,z0=a.bhZ;if(a.bhStop)continue;
      const hw=rayCast(x0,y0,z0,U[0],U[1],U[2],s+.05,SHOT_FILTER),k=hw?Math.max(0,hw.t-.05):s;const x1=x0+U[0]*k,y1=y0+U[1]*k,z1=z0+U[2]*k;
      if(host){const h=BH.catch(a,x0,y0,z0,x1,y1,z1);if(h){a.bhX=x1;a.bhY=y1;a.bhZ=z1;BH.hook(a,h);continue}}
      a.bhX=x1;a.bhY=y1;a.bhZ=z1;a.bhL+=k;
      if(Math.random()<dt*20)FX.spawn({x:x1,y:y1,z:z1,vx:rr(-.2,.2),vy:rr(-.1,.2),vz:rr(-.2,.2),life:rr(.2,.4),s0:.04,s1:.12,r:.6,g:.6,b:.6,a:.3,f:2,drag:2});
      if(hw&&hw.t<=s+.05){if(host)BH.miss(a,x1,y1,z1,true);else a.bhStop=true;continue}
      if(a.bhL>=BH.RANGE){if(host)BH.miss(a,x1,y1,z1,false);else a.bhStop=true}
      continue}
    if(a.bhS==='pull'){a.an.skill=Math.max(a.an.skill,.3);const v=a.bhV;
      a.bhRt=(a.bhRt||0)-dt;if(a.bhRt<=0){a.bhRt=.22;AU.at('bhrattle',a.c.x,a.c.y+1.2,a.c.z,{vol:.55,range:28,rate:1.2})}
      if(host){if(!v||!v.alive||v.team!==TH||a.frozen>0||a.bhT>=BH.MAX){BH.end(a,false);continue}
        const d=Math.hypot(v.c.x-a.c.x,v.c.z-a.c.z);if(d<=BH.STOP+.15||Math.abs(v.c.y-a.c.y)>3.5&&a.bhT>.4){BH.end(a,false);continue}
        const lp=a.bhLp==null?d:a.bhLp;a.bhLp=d;if(a.bhT>.3&&lp-d<BH.PULL*dt*.12){a.bhBl+=dt;if(a.bhBl>.3){BH.end(a,false);continue}}else a.bhBl=0}
      else if(a.bhT>BH.MAX+1.5)BH.reset(a);
      continue}
    if(a.bhS==='ret'){const H=BH.hand(a,_bhB),u=smooth(clamp(a.bhT/BH.RET,0,1)),R0=a.bhR0||[H.x,H.y,H.z];
      a.bhX=lerp(R0[0],H.x,u);a.bhY=lerp(R0[1],H.y,u)+Math.sin(u*Math.PI)*.4;a.bhZ=lerp(R0[2],H.z,u);
      if(a.bhT>=BH.RET){a.bhS='';a.bhLp=null;if(a.bhP){a.bhP.x=a.bhP.px=H.x;a.bhP.y=a.bhP.py=H.y-BH.HANG;a.bhP.z=a.bhP.pz=H.z}if(a.isPlayer)AU.play('bhrattle',{vol:.5,rate:1.3})}}}};

// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='hook')return BH.start(a);return ns(a,Z)};
  const ap=actorPhysics;actorPhysics=function(a,dt){
    // the one on the hook, on the page that moves it: dragged to the butcher, no jumping
    const b=a.bhA;if(b&&a.team===TH&&b.bhS==='pull'&&b.bhV===a&&b.alive){const c=a.cmd,dx=b.c.x-a.c.x,dz=b.c.z-a.c.z,d=Math.hypot(dx,dz);c.jump=false;
      if(d>BH.STOP){const k=BH.PULL*Math.min(1,(d-BH.STOP)/1.1+.4);a.kvx=dx/d*k;a.kvz=dz/d*k;a.mvx*=.1;a.mvz*=.1}else{a.kvx*=.5;a.kvz*=.5}
      if(G.t-(a.bhP0||0)>BH.MAX+.6)a.bhA=null}// (a word of the end that never came)
    // the butcher plants its feet to swing and to haul
    if(isBh(a)&&!a.pup&&(a.bhS==='wind'||a.bhS==='pull')){const c=a.cmd;c.f*=.15;c.s*=.15;c.jump=false}
    return ap(a,dt)};
  const aw=actorWeapons;actorWeapons=function(a,dt){if(isBh(a)&&(a.bhS==='wind'||a.bhS==='fly'||a.bhS==='pull')){const c=a.cmd;c.fire=c.alt=false;c.reload=false}return aw(a,dt)};
  // the humans' damage on a hauling butcher adds up; enough breaks the chain (the host judges)
  const da=damageActor;damageActor=function(t,dmg,src,o){const r=da(t,dmg,src,o);
    if(!NET.cli&&!NET.ghost&&t&&t.bhS==='pull'&&isBh(t)&&t.alive&&src&&src.team===TH&&typeof r==='number'&&r>0){t.bhD=(t.bhD||0)+r;if(t.bhD>=BH.FREE)BH.end(t,true,src)}
    return r};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')BH.update(dt);for(const a of G.actors)BH.place(a,dt)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)BH.reset(a)};
  const bz=becomeZombie;becomeZombie=function(a,host){BH.reset(a);return bz(a,host)};
  const rz=reviveZombie;reviveZombie=function(a,at,rise){BH.reset(a);return rz(a,at,rise)};
  // the swing and the throw in third person (models.js: KF.bhThrow over st.bhW), the haul (st.bhP)
  ZK.st.butcher=(a,st)=>{const S=a.bhS;st.bhW=S==='wind'?clamp(a.bhT/(BH.WIND+.1),0,.76):S==='fly'&&a.bhT<.16?.76+a.bhT/.16*.24:0;st.bhP=S==='pull'?1:S==='fly'&&a.bhT>=.16?.6:0};
  Object.assign(CLIH,{
    bhw(L,m){const a=byId(m.i);if(a&&a.alive&&isBh(a))BH.begin(a)},
    bht(L,m){const a=byId(m.i);if(a&&isBh(a)&&m.o&&m.d)BH.fly(a,m.o[0]/100,m.o[1]/100,m.o[2]/100,m.d[0]/1000,m.d[1]/1000,m.d[2]/1000)},
    bhh(L,m){const a=byId(m.i),v=byId(m.v);if(a&&v)BH.hookApply(a,v)},
    bhm(L,m){const a=byId(m.i);if(a)BH.missApply(a,m.x/100,m.y/100,m.z/100,!!m.w)},
    bhx(L,m){const a=byId(m.i);if(a)BH.endApply(a,!!m.f,m.s>=0?byId(m.s):null)}});
})();

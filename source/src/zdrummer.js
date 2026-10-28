'use strict';
// ============ 고적대 좀비 (Drummer Zombie, v7.10): a war drum that drives the zombies round it on ============
// The body (design.js: the parade's red tunic, a shako, the bass drum on its belly, a mallet in each fist) claws with the mallets — either
// hand, both for a heavy blow (models.js).
// G: 진군 북 — DRM.DUR s of drumming, a march beaten on both heads (DRM.PAT within each DRM.BAR s). Every zombie within DRM.R m of a drummer
// at work (the drummer too) moves DRM.SPD × faster and is pushed back DRM.KB × as much by gunfire, for as long as it stays near and DRM.LINGER s
// after; it glows a little with every beat. Every beat jolts the aim of the humans within DRM.HR m (their view kicks a little — a bot's
// shots go wide for a moment) and shakes the ground a little. A blow with the mallets misses the beat it falls on.
// Network: the host starts the drumming ('drb'); every page beats it out on its own clock from there, works out the zombies near enough
// for itself (its own bodies' speed; the host's the push), and jolts its own player (the host its bots).
const DRM={DUR:6,R:14,SPD:1.2,KB:.6,HR:10,LINGER:1.2,BAR:2,PAT:[0,.5,1,1.25,1.5],JOLT:.02,
  // first person, the right hand [hand x,y,z, toward-elbow x,y,z, pitch, yaw, roll] (zkit.js zkAim; the left is its mirror): a mallet held
  // up over the drum, its blow, the double blow
  VR:[.21,-.27,-.41,.34,-.62,.7,.9,-.08,0]};
DRM.VA=[[0,DRM.VR],[.24,[.27,.03,-.3,.4,-.62,.68,2.1,.3,0]],[.32,[.27,.05,-.31,.4,-.62,.68,2.2,.32,0]],[.44,[.06,-.1,-.5,.3,-.15,.94,-.3,.05,0]],
  [.56,[-.04,-.26,-.42,.22,.3,.93,-.95,-.25,0]],[.8,[.13,-.28,-.4,.3,-.6,.74,.5,-.12,0]],[1,DRM.VR]];
DRM.VH=[[0,DRM.VR],[.34,[.18,.1,-.33,.22,-.85,.5,2.3,-.08,0]],[.44,[.18,.12,-.33,.22,-.85,.5,2.4,-.08,0]],[.56,[.06,-.12,-.5,.18,.1,.98,-.45,0,0]],
  [.7,[.06,-.3,-.45,.18,.4,.9,-1.05,0,0]],[.9,[.14,-.28,-.4,.3,-.6,.74,.55,-.14,0]],[1,DRM.VR]];
const isDr=a=>!!a&&a.zc==='drummer'&&a.team===TZ;
const drOn=()=>!(typeof EP!=='undefined'&&EP.on)&&G.mode!=='scen';
// the beats of a drumming from its start: [time, side (1 right, -1 left)]
DRM.beats=(()=>{const L=[];let s=1;for(let b=0;b*DRM.BAR<DRM.DUR-.01;b++)for(const p of DRM.PAT){const t=b*DRM.BAR+p;if(t<DRM.DUR-.05){L.push([t,s]);s=-s}}return L})();

// ---------- models in first person: a mallet (a wooden haft, a felt head), the top of the drum below the view ----------
GUNS.drMalletVM={parts:[Pt(0,0,-.11,.022,.022,.28,'wood3',{r:.009}),Pt(0,0,.035,.026,.026,.02,'wood3',{r:.009}),Pt(0,0,-.26,.068,.068,.068,'drFelt',{r:.032})],grip:[0,0,0],muzzle:[0,0,0]};
// (the drum: a round shell laced with cord, a gold hoop at each end and a head just proud of it — cyl 'x', gunart.js partGeo)
GUNS.drDrumVM={parts:[Pt(0,0,0,.25,.42,.42,'drShell',{cyl:'x',r:.012}),...[-1,1].map(s=>Pt(s*.117,0,0,.028,.445,.445,'drGold',{cyl:'x',r:.008})),
  ...[-1,1].map(s=>Pt(s*.1335,0,0,.005,.4,.4,'drHead',{cyl:'x',r:.002}))],grip:[0,0,0],muzzle:[0,0,0]};

// ---------- first person: a mallet in each fist, the drum below ----------
ZK.vm.drummer=(mat,root)=>{const R=zkArm('sl_drummer','zs_drummer',mat,{cuff:'drGold'}),L=zkArm('sl_drummer','zs_drummer',mat,{left:1,cuff:'drGold'});
  const mk=(arm)=>{const W=new THREE.Group();W.position.set(0,-.012,-.045);arm.children[0].add(W);const T=new THREE.Group();W.add(T);
    const m=new THREE.Mesh(partGeo(GUNS.drMalletVM.parts),mat);m.frustumCulled=false;T.add(m);return {W,T,m}};
  const r=mk(R),l=mk(L);const dm=new THREE.Mesh(partGeo(GUNS.drDrumVM.parts),mat);dm.frustumCulled=false;const drum=new THREE.Group();drum.add(dm);root.add(drum);
  return {armR:R,armL:L,wR:r.W,wL:l.W,tR:r.T,tL:l.T,mR:r.m,mL:l.m,drum,aim:[DRM.VR.slice(6),DRM.VR.slice(6)],zp:DRM.vmPose,zt:DRM.vmTrail,zq:DRM.vmAim}};
const _drk=[0,0,0,0,0,0,0,0,0];
DRM.vmPose=function(V,A,dt,m,a){const K=m.zk,M=V.mel,Am=K.aim;let tr=false;V.camPitch=0;K.tr=0;
  for(let j=0;j<6;j++){A[0][j]=DRM.VR[j];A[1][j]=j===0||j===3?-DRM.VR[j]:DRM.VR[j]}
  for(let i=0;i<2;i++){Am[i][0]=DRM.VR[6];Am[i][1]=DRM.VR[7];Am[i][2]=DRM.VR[8]}
  // drumming: each mallet lifts before its beat and whips down on its head (below the view), the hand dipping with it
  if(a&&a.drT>0&&!M){const r=a.drV||[0,0];for(let i=0;i<2;i++){const v=i?r[1]:r[0],up=Math.max(0,v),hit=Math.max(0,-v),S=A[i];
    S[1]+=up*.03-hit*.035;S[2]+=up*.02;Am[i][0]+=up*.55-hit*1.15}}
  if(M){M.t+=dt;const p=clamp(M.t/M.d,0,1);
    if(M.heavy){const o=zkPose(DRM.VH,p,A,0,_drk);for(let j=0;j<6;j++)A[1][j]=A[0][j];A[1][0]=-A[0][0];A[1][3]=-A[0][3];for(let i=0;i<2;i++){Am[i][0]=o[6];Am[i][1]=o[7];Am[i][2]=o[8]}tr=p>.47&&p<.72;K.tr=1}
    else{const i=M.side>0?0:1;const o=zkPose(DRM.VA,p,A,i,_drk);if(i){A[1][0]=-A[1][0];A[1][3]=-A[1][3]}Am[i][0]=o[6];Am[i][1]=o[7];Am[i][2]=o[8];tr=p>.36&&p<.6;K.tr=i?-1:1}
    const s=M.heavy?(p>.44&&p<.74?Math.sin((p-.44)/.3*Math.PI):0):(p>.34&&p<.62?Math.sin((p-.34)/.28*Math.PI):0);V.camPitch=-s*(M.heavy?.08:.045);
    if(p>=1)V.mel=null}
  // the drum stays with the body as the view looks up and down (half of it: it sits a little higher than it would)
  const pt=a?a.pitch*.5:0,c=Math.cos(pt),s=Math.sin(pt);K.drum.position.set(0,-.4*c+.43*s,-.43*c-.4*s);K.drum.rotation.set(-pt,0,0);K.drum.visible=V.vis;
  return tr};
// (the left mallet aims as the mirror of the right)
DRM.vmAim=function(V,m){const K=m.zk,Am=K.aim;zkAim(K.tR,Am[0][0],Am[0][1],Am[0][2]);zkAim(K.tL,Am[1][0],-Am[1][1],-Am[1][2])};
DRM.vmTrail=function(V,m,p0,p1){const K=m.zk;if(!K.tr)return false;const M=K.tr<0?K.mL:K.mR;M.localToWorld(p0.set(0,0,-.28));M.localToWorld(p1.set(0,0,-.14));return true};

// ---------- the drumming ----------
// host (or offline): G pressed
DRM.start=function(a){if(!isDr(a)||!a.alive||!drOn()||a.scen||a.drT>0)return false;if(a.frozen>0||a.cur==='zbomb')return false;
  DRM.begin(a);if(NET.host)netEv('drb',{i:a.id});return true};
// every page: the march starts
DRM.begin=function(a){a.drT=DRM.DUR;a.drC=0;a.drK=0;a.drV=[0,0];a.drH=[-9,-9];a.an.skill=Math.max(a.an.skill,.3);
  AU.at('zroar',a.c.x,a.c.y+1.5,a.c.z,{vol:.8,range:50,rate:1.1});if(a.isPlayer)HUD.note(LI()?'War drum!':'진군 북!',1)};
// one beat (every page): the boom, a ring along the ground, the zombies round it glowing, the humans' aim jolted
DRM.beat=function(a,side){const c=a.c,L=LI();a.drH[side>0?0:1]=G.t;a.drBt=G.t;
  AU.at('drboom',c.x,c.y+1.1,c.z,{vol:1,range:95,occ:false,rate:side>0?1:.94});
  FX.spawn({x:c.x,y:c.y+.06,z:c.z,life:.55,s0:.6,s1:9,r:1,g:.36,b:.12,a:.3,f:14,add:1});
  {const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),x=c.x+fx*.38+rx*side*.17,z=c.z+fz*.38+rz*side*.17;
    FX.spawn({x,y:c.y+1.16,z,life:.12,s0:.12,s1:.5,r:1,g:.8,b:.6,a:.5,f:14,add:1})}
  const P=G.player;for(const h of G.actors){if(!h.alive||h.team!==TH)continue;if(h!==P&&(NET.cli||!h.bot))continue;// (its own player on each page, the bots on the host's)
    const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d>DRM.HR||Math.abs(h.c.y-c.y)>5)continue;const f=1-d/DRM.HR*.7;
    h.punchP=(h.punchP||0)+DRM.JOLT*f*rr(.7,1.15);h.punchY=(h.punchY||0)+DRM.JOLT*.7*f*rr(-1,1);if(h===P){FX.shake=Math.max(FX.shake,.16*f);if(!(DRM.hn>G.t)){DRM.hn=G.t+8;HUD.note(L?'The war drum — it jolts your aim':'진군 북 — 조준이 흔들린다',1.6)}}}
  if(P&&P.team===TZ&&P!==a&&P.alive&&Math.hypot(P.c.x-c.x,P.c.z-c.z)<DRM.R&&!(DRM.zn>G.t)){DRM.zn=G.t+8;HUD.note(L?'The war drum: +20% speed, pushed back less':'진군 북: 이동속도 +20% · 덜 밀려남',1.6)}};
DRM.end=function(a){a.drT=0;a.drV=[0,0]};
DRM.reset=function(a){a.drT=0;a.drV=[0,0];a.drBuf=0};

// ---------- every frame ----------
DRM.update=function(dt){const on=drOn(),Ds=[];
  for(const a of G.actors){
    if(!(a.drT>0))continue;if(!isDr(a)||!a.alive||!on||a.frozen>0){DRM.end(a);continue}
    a.drC+=dt;a.drT=Math.max(0,DRM.DUR-a.drC);Ds.push(a);
    // the beats that came due (a blow with the mallets misses its beat)
    while(a.drK<DRM.beats.length&&DRM.beats[a.drK][0]<=a.drC){const b=DRM.beats[a.drK++];if(!(a.an.atk>0))DRM.beat(a,b[1])}
    // the mallets: each lifts in the last 0.2 s before its own next beat and rebounds off its head after it
    for(let i=0;i<2;i++){const sd=i?-1:1;let nx=null;for(let k=a.drK;k<DRM.beats.length;k++)if(DRM.beats[k][1]===sd){nx=DRM.beats[k][0];break}
      const up=nx==null?0:smooth(clamp(1-(nx-a.drC)/.2,0,1)),hit=clamp(1-(G.t-a.drH[i])/.16,0,1);a.drV[i]=up-hit}
    if(a.drT<=0)DRM.end(a)}
  // the zombies near a drummer at work
  if(Ds.length)for(const z of G.actors){if(!z.alive||z.team!==TZ)continue;for(const d of Ds){if(Math.hypot(z.c.x-d.c.x,z.c.z-d.c.z)<DRM.R&&Math.abs(z.c.y-d.c.y)<6){z.drBuf=G.t+DRM.LINGER;z.drBt=d.drBt||0;break}}
    if(z.drBuf>G.t&&Math.random()<dt*5)FX.spawn({x:z.c.x+rr(-.3,.3),y:z.c.y+rr(.05,.3),z:z.c.z+rr(-.3,.3),vx:rr(-.2,.2),vy:rr(.5,1.2),vz:rr(-.2,.2),life:rr(.4,.7),s0:.05,s1:.02,r:1,g:.45,b:.15,f:8,add:1})}};

// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='drum')return DRM.start(a);return ns(a,Z)};
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);return a.team===TZ&&a.drBuf>G.t&&a.alive?s*DRM.SPD:s};
  // gunfire pushes the zombies near the drum back less (the host works the push out)
  const da=damageActor;damageActor=function(t,dmg,src,o){if(!NET.cli&&!NET.ghost&&t&&t.team===TZ&&t.drBuf>G.t&&o&&o.kb)o.kb*=DRM.KB;return da(t,dmg,src,o)};
  // a glow on the beat
  const vu=visUni;visUni=function(a,dt){const U=vu(a,dt);if(a.team===TZ&&a.alive&&a.drBuf>G.t){const T=U.uTint.value;if(T.w===0){const k=Math.exp(-(G.t-(a.drBt||-9))*6);T.set(1,.34,.1,.08+.3*k)}}return U};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')DRM.update(dt)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)DRM.reset(a)};
  const bz=becomeZombie;becomeZombie=function(a,host){DRM.reset(a);return bz(a,host)};
  const rz=reviveZombie;reviveZombie=function(a,at,rise){DRM.reset(a);return rz(a,at,rise)};
  ZK.st.drummer=(a,st)=>{st.drm=a.drT>0?1:0;st.drR=a.drV?a.drV[0]:0;st.drL=a.drV?a.drV[1]:0};
  Object.assign(CLIH,{drb(L,m){const a=byId(m.i);if(a&&a.alive&&isDr(a))DRM.begin(a)}});
})();

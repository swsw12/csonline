'use strict';
// ============ 광부 좀비 (Miner Zombie, v7.10): burrows under the floor and bursts out under the humans ============
// The body (design.js: a hi-vis vest, a hard hat with its lamp lit, a pickaxe in the right fist) claws with the pickaxe; every other light
// blow is the free hand's claw (models.js). Its cap lamp throws a short beam where it looks (MN.lamp).
// G: 굴착 — it lifts the pickaxe and drives it into the ground (MN.DIG s, rooted), sinks out of sight and runs under the floor for up to
// MN.DUR s at MN.SPD m/s. Underground nothing reaches it: bullets and beams pass over it (rayActors / tbLine: a.epRay), blades miss it
// (meleeHit), blasts, fire and frost do nothing (damageActor, MN.update), the zombie bomb does not throw it; bots and sentries cannot see
// it and it is off the radar. It cannot jump or claw. What shows it is a mound of earth running along the ground with dust and stones
// kicked up behind it, and the rumble.
// It bursts out when its player presses G again (after MN.MIN s down), when it passes under a human (within MN.NEAR m), when a bot reaches
// its target (MN.BOTD) or when the time is up: every human within MN.ER m in the open is thrown up and knocked flat for MN.KD s
// (FM.knock, fireman.js), and the miner staggers for a moment as it climbs out.
// Network (host-authoritative, as the firefighter's charge): the host starts the burrow ('mnb') and decides when and where it bursts and
// whom it throws ('mne'; the knock-downs send their own 'fmkd' and 'scp'). A player's page asks for its burst ('mnx', to the host). The
// body moves on the page that owns it (the host for bots, the player's own page).
const MN={DIG:.45,DUR:2.6,SPD:8.6,MIN:.45,ER:2.6,KD:.85,UP:6.4,PUSH:5.5,NEAR:1.05,BOTD:2.1,REC:.4,RISE:.32,
  // first person [hand x,y,z, toward-elbow x,y,z, pitch, yaw, roll] (zkit.js zkAim): the pickaxe hand at rest — the haft up and forward
  // at the right, the point turned to the left — its swing over the right shoulder and down, the two-handed chop, the dig
  VR:[.22,-.27,-.39,.3,-.76,.58,.92,.16,1.05]};
MN.VA=[[0,MN.VR],[.22,[.3,.02,-.31,.38,-.68,.62,2.15,.38,.2]],[.33,[.31,.05,-.31,.4,-.66,.64,2.3,.4,.1]],[.45,[.06,-.13,-.5,.3,-.22,.93,-.25,.06,0]],
  [.58,[-.08,-.3,-.43,.22,.28,.93,-1.05,-.3,0]],[.8,[.14,-.3,-.4,.3,-.66,.69,.25,.05,.6]],[1,MN.VR]];
MN.VH=[[0,MN.VR],[.34,[.12,.1,-.33,.2,-.86,.48,2.45,.12,0]],[.44,[.12,.12,-.34,.2,-.86,.48,2.55,.12,0]],[.56,[.02,-.13,-.52,.15,.08,.99,-.45,0,0]],
  [.7,[.01,-.31,-.46,.15,.38,.91,-1.15,-.05,0]],[.9,[.13,-.29,-.4,.3,-.64,.7,.35,.06,.6]],[1,MN.VR]];
MN.VD=[[0,MN.VR],[.35,[.12,.12,-.33,.2,-.86,.48,2.5,.1,0]],[.5,[.12,.14,-.34,.2,-.86,.48,2.6,.1,0]],[.66,[.01,-.28,-.5,.1,.3,.95,-1.15,0,0]],[1,[.01,-.4,-.46,.1,.5,.86,-1.3,0,0]]];
const isMn=a=>!!a&&a.zc==='miner'&&a.team===TZ;
const mnOn=()=>!(typeof EP!=='undefined'&&EP.on)&&G.mode!=='scen';
const MN_NORAY=()=>null;

// ---------- models: the pickaxe in first person (its head across the swing), the earth mound that runs over a burrow ----------
GUNS.mnPickVM={parts:[Pt(0,0,-.2,.03,.038,.56,'mnHaft',{r:.012}),Pt(0,0,.07,.036,.044,.03,'mnHaft',{r:.012}),Pt(0,0,-.005,.04,.048,.1,'burlap',{r:.014}),
  Pt(0,0,-.47,.05,.085,.064,'mnIron',{r:.012}),Pt(-.1,0,-.475,.13,.046,.04,'mnIron',{r:.01}),Pt(-.2,0,-.462,.1,.034,.028,'mnIron',{rz:.3,r:.008}),Pt(-.265,0,-.444,.06,.02,.016,'bright',{rz:.55,r:.004}),
  Pt(.1,0,-.475,.13,.046,.044,'mnIron',{r:.01}),Pt(.185,0,-.47,.07,.022,.072,'mnIron',{rz:-.25,r:.006}),Pt(.22,0,-.47,.008,.016,.074,'bright')],grip:[0,0,0],muzzle:[0,0,0]};
// (the mound: a loaf of turned earth heaped highest just behind the head of the run, lumps and clods round it, a few stones)
GUNS.mnMound={parts:[Pt(0,.07,.02,.82,.2,1.04,'mnDirt',{r:.1}),Pt(.08,.15,-.12,.5,.18,.56,'mnDirt',{r:.09,ry:.3}),Pt(-.12,.13,.2,.44,.15,.48,'mnDirt',{r:.075,ry:-.4}),
  Pt(.03,.23,-.05,.28,.13,.3,'mnDirt',{r:.065,ry:.7}),Pt(-.3,.05,-.28,.2,.09,.22,'mnDirt',{r:.045,ry:.5}),Pt(.34,.045,.18,.18,.08,.2,'mnDirt',{r:.04,ry:-.3}),
  Pt(.05,.04,.5,.24,.07,.18,'mnDirt',{r:.035}),Pt(.3,.05,.32,.09,.07,.1,'gunmetal',{r:.03,ry:.4}),Pt(-.32,.04,-.18,.08,.06,.09,'gunmetal',{r:.028}),Pt(.2,.03,-.44,.07,.05,.07,'mnDirt',{r:.025})],grip:[0,0,0],muzzle:[0,0,0]};

// ---------- first person: the pickaxe in the right fist, the left a claw ----------
ZK.vm.miner=(mat,root)=>{const R=zkArm('sl_miner','zs_miner',mat,{}),L=zkArm('sl_miner','zs_miner',mat,{claws:1,L:1});
  const W=new THREE.Group();W.position.set(0,-.012,-.045);R.children[0].add(W);const T=new THREE.Group();W.add(T);
  const m=new THREE.Mesh(partGeo(GUNS.mnPickVM.parts),mat);m.frustumCulled=false;T.add(m);
  return {armR:R,armL:L,wrist:W,aimT:T,tool:m,aim:MN.VR.slice(6),zp:MN.vmPose,zt:MN.vmTrail,zq:MN.vmAim}};
MN.vmPose=function(V,A,dt,m,a){const K=m.zk,M=V.mel,D=V.mnDig;let tr=false,o=MN.VR;V.camPitch=0;
  for(let j=0;j<6;j++){A[0][j]=MN.VR[j];A[1][j]=j===0||j===3?-CLAW_REST[j]:CLAW_REST[j]}
  if(D){D.t+=dt;const p=clamp(D.t/D.d,0,1);o=zkPose(MN.VD,p,A,0);const s=p>.5?smooth(clamp((p-.5)/.2,0,1)):0;V.camPitch=-s*.32+(p<.5?smooth(p/.5)*.04:0);
    zkSecond(A,o,-.14);if(p>=1)V.mnDig=null}
  else if(M){M.t+=dt;const p=clamp(M.t/M.d,0,1);
    if(!M.heavy&&M.side<0){tr=zkClawSwipe(V,A,p,-1);K.trL=1}// the free hand claws
    else{K.trL=0;o=zkPose(M.heavy?MN.VH:MN.VA,p,A,0);tr=M.heavy?(p>.47&&p<.72):(p>.36&&p<.6);
      const s=M.heavy?(p>.44&&p<.74?Math.sin((p-.44)/.3*Math.PI):0):(p>.34&&p<.62?Math.sin((p-.34)/.28*Math.PI):0);V.camPitch=-s*(M.heavy?.085:.05);V.camRoll=M.heavy?0:-s*.03;
      if(M.heavy)zkSecond(A,o,-.14)}
    if(p>=1)V.mel=null}
  K.aim[0]=o[6];K.aim[1]=o[7];K.aim[2]=o[8];return tr};
MN.vmAim=function(V,m){const K=m.zk;zkAim(K.aimT,K.aim[0],K.aim[1],K.aim[2])};
// the trail follows the pick's point (or, on the claw's turn, the stock claw trail: false)
MN.vmTrail=function(V,m,p0,p1){if(m.zk.trL)return false;m.zk.tool.localToWorld(p0.set(-.26,0,-.45));m.zk.tool.localToWorld(p1.set(-.1,0,-.475));return true};

// ---------- the cap lamp's beam (third person) ----------
const _mnM=new THREE.Matrix4(),_mnM2=new THREE.Matrix4(),_mnV=new THREE.Vector3();
MN.lamp=function(a){const ch=a.ch;if(!ch)return;let b=a.mnBeam;
  if(!b){if(typeof BEAM_MAT==='undefined'||!BEAM_MAT)mkBeam();b=a.mnBeam=new THREE.Mesh(BEAM_GEO,BEAM_MAT);b.matrixAutoUpdate=false;b.renderOrder=7;b.frustumCulled=false}
  if(b.parent!==ch.grp)ch.grp.add(b);
  a.mnFl=(a.mnFl||0)-1/60;if(a.mnFl<-rr(3,9))a.mnFl=rr(.05,.14);// a tired battery: it blinks out now and then
  b.visible=a.alive&&!a.mnB&&!(a.mnSink>.3)&&ch.grp.visible&&!(a.mnFl>0);if(!b.visible)return;
  const o=ch.A.def.o,hc=ch.A.def.headC;_mnV.set(0,hc[1]+o.headH*.42,o.headZ-o.headD*.6-.03);
  _mnM.makeTranslation(_mnV.x,_mnV.y,_mnV.z);_mnM2.makeRotationX(-.16);_mnM.multiply(_mnM2);_mnM2.makeScale(.3,.3,.58);_mnM.multiply(_mnM2);b.matrix.multiplyMatrices(ch.uB[2],_mnM)};

// ---------- the burrow ----------
// host (or offline): G pressed
MN.start=function(a){const c=a.c;if(!isMn(a)||!a.alive||!mnOn()||a.scen||a.mnS)return false;if(a.frozen>0||a.holdT>0||a.rootT>0||a.reviving>0||a.cur==='zbomb'||(!a.pup&&!c.onGround))return false;
  MN.begin(a);if(NET.host)netEv('mnb',{i:a.id});return true};
// every page: the pick goes up and comes down into the ground
MN.begin=function(a){a.mnS='dig';a.mnT=0;a.mnU=0;a.mnSink=0;a.mnHit=false;a.an.skill=Math.max(a.an.skill,.5);
  AU.at('zgrowl',a.c.x,a.c.y+1.5,a.c.z,{vol:.8,range:30,rate:1.25});if(a.isPlayer){VM.mnDig={t:0,d:MN.DIG};HUD.note(LI()?'Burrow!':'굴착!',.9)}};
// the pick bites: a burst of earth in front, the sound (every page)
MN.bite=function(a){const c=a.c,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),x=c.x+fx*.6,z=c.z+fz*.6;a.mnHit=true;
  AU.at('mndig',x,c.y+.2,z,{vol:1,range:45});for(let i=0;i<3;i++)FX.impact(x+rr(-.2,.2),c.y+.02,z+rr(-.2,.2),0,1,0,'dirt');
  MN.dust(c.x,c.y,c.z,18,1.2);if(a.isPlayer)FX.shake=Math.max(FX.shake,.4)};
// earth and stones thrown out round (x,y,z): n puffs, k how hard
MN.dust=function(x,y,z,n,k){for(let i=0;i<n;i++){const g=rr(0,TAU),s=rr(.6,2.4)*k;FX.spawn({x:x+Math.cos(g)*.3,y:y+.08,z:z+Math.sin(g)*.3,vx:Math.cos(g)*s,vy:rr(.3,1.4)*k,vz:Math.sin(g)*s,life:rr(.6,1.3),s0:.15,s1:rr(.6,1.1),r:.42,g:.37,b:.3,a:.55,f:2,drag:2.4,lit:1})}
  for(let i=0;i<n*.8;i++){const g=rr(0,TAU),s=rr(1,4)*k;FX.spawn({x:x+Math.cos(g)*.2,y:y+.1,z:z+Math.sin(g)*.2,vx:Math.cos(g)*s,vy:rr(2,5)*k,vz:Math.sin(g)*s,life:rr(.6,1.1),s0:rr(.03,.06),s1:.04,r:.34,g:.3,b:.25,f:Math.random()<.5?10:7,grav:12,col:.25,lit:1})}};
// down out of sight
MN.under=function(a){a.mnS='under';a.mnT=0;a.mnU=0;a.mnB=true;a.mnSink=1;a.epRay=MN_NORAY;a.epRayZc='miner';a.frozen=0;a.burnT=0;a.staggerT=0;
  if(a.isPlayer)HUD.note(LI()?'Underground — G to burst out':'땅속 — G로 솟구치기',1.4)};
// host: up it comes (every human round it thrown up and knocked flat)
MN.erupt=function(a){if(a.mnS!=='under')return;const c=a.c;let n=0;
  for(const h of G.actors){if(!h.alive||h.team!==TH)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>MN.ER||Math.abs(h.c.y-c.y)>1.6)continue;
    if(!losClear(c.x,c.y+.6,c.z,h.c.x,h.c.y+.6,h.c.z))continue;const f=1-d/MN.ER*.55,ux=d>.05?dx/d:-Math.sin(h.yaw),uz=d>.05?dz/d:-Math.cos(h.yaw);
    SCEN.pushHuman(h,ux*MN.PUSH*f,MN.UP*f,uz*MN.PUSH*f);FM.knock(h,MN.KD*(.75+.25*f),a,ux*-Math.sin(h.yaw)+uz*-Math.cos(h.yaw)<0?1:-1);n++}
  MN.eruptApply(a,c.x,c.y,c.z,n);if(NET.host)netEv('mne',{i:a.id,x:r2(c.x),y:r2(c.y),z:r2(c.z),n})};
// every page: the burst
MN.eruptApply=function(a,x,y,z,n){if(!a)return;const was=a.mnS==='under'||a.mnS==='dig';MN.clearHit(a);a.mnS='rise';a.mnT=0;a.mnB=false;a.mnSink=Math.max(a.mnSink||0,.85);
  if(!a.pup){a.staggerT=Math.max(a.staggerT||0,MN.REC);a.kvx*=.2;a.kvz*=.2}
  if(!was)return;
  AU.at('mnburst',x,y+.3,z,{vol:1,range:80,occ:false});MN.dust(x,y,z,30,2);
  FX.spawn({x,y:y+.06,z,life:.5,s0:.6,s1:MN.ER*2.1,r:.5,g:.44,b:.36,a:.5,f:14});
  for(let i=0;i<6;i++){const g=i/6*TAU;FX.impact(x+Math.cos(g)*.7,y+.02,z+Math.sin(g)*.7,0,1,0,'dirt')}
  const P=G.player;if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<12){FX.shake=Math.max(FX.shake,.75*(1-d/12));if(AU.shock)AU.shock(.5*(1-d/12))}}
  if(a===G.player)HUD.note(n>0?(LI()?`Burst out — ${n} knocked down!`:`솟구쳤다 — ${n}명 넘어뜨림!`):(LI()?'Burst out!':'솟구쳤다!'),1.3)};
MN.clearHit=function(a){if(a.epRay===MN_NORAY){a.epRay=null;a.epRayZc=null}a.mnB=false};
MN.reset=function(a){MN.clearHit(a);a.mnS='';a.mnT=0;a.mnU=0;a.mnSink=0;if(a.mnMd)a.mnMd.visible=false;if(a===G.player&&VM)VM.mnDig=null};
// a player's own page: G again while underground
MN.ask=function(a){if(a.mnS!=='under'||a.mnU<MN.MIN||a.mnAsk>G.t)return;a.mnAsk=G.t+.3;if(NET.cli)netToHost({t:'mnx'});else MN.erupt(a)};

// ---------- every frame ----------
const _mnH=[];
MN.update=function(dt){const host=!NET.cli,on=mnOn();
  for(const a of G.actors){
    if(!a.mnS){if(isMn(a)&&a.mnSink>0)a.mnSink=Math.max(0,a.mnSink-dt*4);continue}
    if(!isMn(a)||!a.alive||!on){MN.reset(a);continue}
    a.mnT+=dt;
    if(a.mnS==='dig'){a.an.skill=Math.max(a.an.skill,.3);if(!a.mnHit&&a.mnT>=MN.DIG*.62)MN.bite(a);if(a.mnHit)a.mnSink=smooth(clamp((a.mnT-MN.DIG*.62)/(MN.DIG*.38),0,1));
      if(a.mnT>=MN.DIG)MN.under(a);continue}
    if(a.mnS==='under'){a.mnU+=dt;a.frozen=0;a.burnT=0;a.mnSink=1;MN.trail(a,dt);
      if(host){let go=a.mnU>=MN.DUR;
        if(!go&&a.mnU>.15)for(const h of G.actors){if(!h.alive||h.team!==TH)continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<MN.NEAR&&Math.abs(h.c.y-a.c.y)<1.2){go=true;break}}
        const t=a.bot&&a.bot.target;if(!go&&a.bot&&!a.pup&&t&&t.alive&&t.team===TH&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<MN.BOTD&&Math.abs(t.c.y-a.c.y)<1.4)go=true;
        if(go)MN.erupt(a)}
      else if(a.mnU>MN.DUR+1.5)MN.eruptApply(a,a.c.x,a.c.y,a.c.z,0);// (the host's word never came)
      continue}
    if(a.mnS==='rise'){a.mnSink=Math.max(0,1-a.mnT/MN.RISE);if(a.mnT>=MN.RISE){a.mnS='';a.mnSink=0}}}};
// the mound running along the ground over it, dust and stones behind it, the rumble
MN.trail=function(a,dt){const c=a.c;let m=a.mnMd;if(!m){m=a.mnMd=new THREE.Mesh(gunGeo('mnMound'),matGun());m.frustumCulled=false;R.scene.add(m)}
  if(!m.parent)R.scene.add(m);m.visible=!(a===G.player&&!G.spec);const sp=Math.hypot(c.vx,c.vz),w=1+Math.sin(G.t*23+a.id)*.06;
  m.position.set(c.x,c.y-.03+Math.sin(G.t*31+a.id)*.012,c.z);m.rotation.set(0,a.yaw+Math.sin(G.t*9)*.05,0);m.scale.set(w,1+Math.min(.35,sp*.04),w);
  sampleProbe(c.x,c.y+.5,c.z,m.material.uniforms.uProbe.value);
  if(Math.random()<dt*(10+sp*3)){const bx=-Math.sin(a.yaw)*-.5,bz=-Math.cos(a.yaw)*-.5;FX.spawn({x:c.x+bx+rr(-.3,.3),y:c.y+.12,z:c.z+bz+rr(-.3,.3),vx:rr(-.4,.4),vy:rr(.3,1),vz:rr(-.4,.4),life:rr(.7,1.4),s0:.18,s1:rr(.6,1),r:.42,g:.37,b:.3,a:.45,f:2,drag:1.6,lit:1})}
  if(Math.random()<dt*(4+sp))FX.spawn({x:c.x+rr(-.3,.3),y:c.y+.15,z:c.z+rr(-.3,.3),vx:rr(-1,1),vy:rr(1.5,3.5),vz:rr(-1,1),life:rr(.5,.9),s0:rr(.03,.05),s1:.04,r:.34,g:.3,b:.25,f:Math.random()<.5?10:7,grav:12,col:.25,lit:1});
  a.mnRb=(a.mnRb||0)-dt;if(a.mnRb<=0){a.mnRb=.42;if(a.isPlayer)AU.play('mnrumble',{vol:.7});else AU.at('mnrumble',c.x,c.y+.2,c.z,{vol:.9,range:34})}
  if(a.isPlayer){FX.shake=Math.max(FX.shake,.1);if(Math.random()<dt*14){const e=actorEye(a);aimDir(a.yaw,a.pitch,_dv);FX.spawn({x:e.x+_dv.x*.6+rr(-.3,.3),y:e.y+rr(-.2,.2),z:e.z+_dv.z*.6+rr(-.3,.3),vy:-.2,life:rr(.4,.8),s0:.02,s1:.02,r:.45,g:.38,b:.3,a:.8,f:7,drag:1})}}};
// out of the ground: the mound sinks away
MN.place=function(a){if(a.mnMd&&a.mnS!=='under')a.mnMd.visible=false;if(isMn(a))MN.lamp(a);else if(a.mnBeam)a.mnBeam.visible=false};

// ---------- the view underground: low to the floor, the screen dark at its edges, no arms ----------
function mnShade(k){let el=document.getElementById('mnShade');if(!el){if(k<=0)return;el=document.createElement('div');el.id='mnShade';document.body.appendChild(el)}
  const v=k>0?k.toFixed(3):'0';if(el.dataset.v!==v){el.dataset.v=v;el.style.opacity=v;el.style.display=k>0?'block':'none'}}

// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='burrow')return MN.start(a);return ns(a,Z)};
  // the body on its own page: rooted while it digs, fast and earthbound underground, out of the ground as it climbs out
  const ap=actorPhysics;actorPhysics=function(a,dt){if(!a.mnS||a.pup||!isMn(a))return ap(a,dt);const c=a.cmd;
    if(a.mnS==='dig'){c.f=c.s=0;c.jump=c.duck=false;a.kvx*=.7;a.kvz*=.7;return ap(a,dt)}
    if(a.mnS==='under'){c.jump=c.duck=false;a.kvx=a.kvz=0;if(a.c.vy>0)a.c.vy=0;a.staggerT=0;return ap(a,dt)}
    return ap(a,dt)};
  // no claws while it digs, burrows or climbs out; G again underground: up it comes
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.mnS&&isMn(a)){const c=a.cmd;if(a.mnS==='under'&&!a.pup&&c.skill&&!a.pc.skill)MN.ask(a);c.fire=c.alt=false;c.reload=false;c.skill=false}return aw(a,dt)};
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);return a.mnS==='under'&&isMn(a)&&a.frozen<=0?MN.SPD:s};
  // underground nothing hurts it
  const da=damageActor;damageActor=function(t,dmg,src,o){if(t&&t.mnB&&isMn(t)&&t.alive)return 0;return da(t,dmg,src,o)};
  // blades miss it too (a knife or a claw would find the hidden body)
  const hideB=()=>{let L=null;for(const t of G.actors)if(t.mnB&&t.alive){(L||(L=[])).push(t);t.alive=false}return L},showB=L=>{if(L)for(const t of L)t.alive=true};
  const mh=meleeHit;meleeHit=function(a,r,c){const L=hideB();try{return mh(a,r,c)}finally{showB(L)}};
  const mhs=meleeHits;meleeHits=function(a,r,c,n){const L=hideB();try{return mhs(a,r,c,n)}finally{showB(L)}};
  // the body sinks as the pick goes in, is gone underground, rises as it bursts out
  const uv=updateVisual;updateVisual=function(a,dt){uv(a,dt);if(!a.ch||!isMn(a))return;const k=a.mnSink||0;
    if(k>0){const ch=a.ch;if(k>=.98)ch.grp.visible=false;else{ch.grp.position.y-=k*1.9;ch.grp.updateMatrixWorld(true)}}};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')MN.update(dt);for(const a of G.actors)MN.place(a)};
  // the player's own view: down to the floor and dark underground, back up as it climbs out
  const cam0=Main.camera.bind(Main);Main.camera=function(dt){cam0(dt);const P=G.player;let sh=0;
    if(P&&P.alive&&isMn(P)&&!G.spec&&G.st!=='menu'){const k=P.mnSink||0;
      if(k>0){R.cam.position.y-=1.15*smooth(clamp(k,0,1));R.cam.updateMatrixWorld();if(k>.6)R.vmVisible=false;sh=P.mnS==='under'?.9:k*.9}}
    mnShade(sh)};
  // a fresh start: a new round, a new zombie, a zombie back on its feet
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)MN.reset(a)};
  const bz=becomeZombie;becomeZombie=function(a,host){MN.reset(a);return bz(a,host)};
  const rz=reviveZombie;reviveZombie=function(a,at,rise){MN.reset(a);return rz(a,at,rise)};
  ZK.st.miner=(a,st)=>{st.mnD=a.mnS==='dig'?clamp(a.mnT/MN.DIG,0,1):0;st.mnR=a.mnS==='rise'?clamp(a.mnT/MN.RISE,0,1):0};
  Object.assign(CLIH,{
    mnb(L,m){const a=byId(m.i);if(a&&a.alive&&isMn(a)&&!a.mnS)MN.begin(a)},
    mne(L,m){const a=byId(m.i);if(a)MN.eruptApply(a,m.x/100,m.y/100,m.z/100,m.n|0)}});
  Object.assign(HOSTH,{mnx(L){const a=actorOfKey(L.key);if(a&&a.alive&&isMn(a))MN.ask(a)}});
})();

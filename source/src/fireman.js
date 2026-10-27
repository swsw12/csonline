'use strict';
// ============ 소방관 좀비 (Firefighter Zombie, v6.39): the turnout coat, the oxygen-tank charge, a tank that can be shot to pieces ============
// The coat: fire (flamethrowers, dragon fire, burning, IGNIS-XI fireballs, gas) and blasts (HE, grenade launcher, harpoon / IGNIS-5 /
// launcher blasts) do half damage to it.
// G: it takes the oxygen tank off its back, holds it across its chest and charges: FM.DUR s at FM.SPD m/s, turning at most FM.TURN rad/s
// toward where it looks (a bot: toward its target). Every human it runs into is knocked flat for FM.KD s (no moving, no shooting) and
// thrown back hard (FM.PUSH, FM.UP); a wall stops the charge. Bullets barely push it while it charges.
// While it charges the tank is a target of its own in front of the body (a.xRay: part 'tank'): a bullet that hits it hurts the tank,
// not the zombie (FM.TANK hp); a blast hurts both. Broken: the charge stops dead, the zombie staggers and a smoke cloud billows out round
// it (ESMK, epbase.js: bots do not see a zombie inside it or through it); no tank and no charge until FM.RE s later.
// Network (host-authoritative): the host starts the charge, decides who it hits, keeps the tank's hit points and breaks it. The charging
// body moves on the page that owns it (the host for bots, the player's own page) and the host follows it there. A client claims its hits
// on the tank as such (net.js: bit 32), judged against the tank as that page saw it.
// Knocked flat (a.fmKd): every page draws the body in the get-up pose (a.kdP, game.js), and the owner's page holds the player still,
// drops the camera to the floor and hides the gun.
const FM={DUR:1.4,SPD:12.5,TURN:2.2,KD:1.1,PUSH:13,UP:4.6,TANK:380,RE:18,SMR:4.6,SML:7,
  // the hold in first person (vm.js): [hand x,y,z, toward-elbow x,y,z] for the right and the left arm
  VMH:[[.155,-.26,-.5,.5,-.52,.7],[-.155,-.26,-.5,-.5,-.52,.7]]};
const FM_FIREW={salamander:1,bdc:1,rdc:1,gas:1,ladle:1};
const fmFire=o=>!!(o&&(o.fire||o.dot||FM_FIREW[o.w]||o.w==='balrog11'&&o.nocap));// (the IGNIS-XI's fireballs carry nocap; its buckshot does not)
const fmBlast=o=>!!(o&&(o.he||o.w==='gl40'));
const isFm=a=>!!a&&a.zc==='fireman'&&a.team===TZ;

// ---------- atlas: the reflective trim (lime-yellow, a silver stripe, a little soot) ----------
const FM_MATS=['fmRefl'];
for(const m of FM_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintFmAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  patch('fmRefl',(xx,y,X,Y)=>{const t=fbm(X/12,Y/12,6101,2,0);let c=Math.abs((y%32)-16)<4?'#d8dcdc':t>.6?'#d4e840':'#bccc30';if(hash2(X,Y,6102)<.05)c='#4a4a38';return c},248);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintFmAtlas()}}

// ---------- the oxygen tank (weapon material): a red cylinder standing up, its valve and gauge on top, a reflective band ----------
GUNS.fmTank={parts:[Pt(0,0,0,.2,.5,.2,'red',{r:.085}),Pt(0,.245,0,.165,.06,.165,'red',{r:.07}),Pt(0,-.245,0,.17,.05,.17,'red',{r:.07}),
  Pt(0,.15,0,.206,.04,.206,'fmRefl',{r:.03}),Pt(0,-.14,0,.204,.02,.204,'blk2',{r:.02}),
  Pt(0,.295,0,.06,.05,.06,'bright',{r:.015}),Pt(0,.33,0,.052,.03,.052,'gunmetal',{r:.01}),Pt(.045,.333,0,.05,.034,.034,'bright',{r:.012}),
  Pt(-.04,.33,0,.034,.036,.036,'blk',{r:.012}),Pt(-.058,.33,0,.004,.028,.028,'white'),Pt(0,.335,.05,.03,.03,.07,'rub',{r:.01})],grip:[0,0,0],muzzle:[0,0,0]};

// ---------- where the tank is while charging (every page, from the body and its heading, so hit volume and model agree) ----------
// held across the chest: centre FM_TY up and FM_TZ in front, its axis along the body's right
const FM_TY=1.22,FM_TZ=.56,FM_TH=.27,FM_TR=.13;
FM.tankPos=function(a,o){const c=a.c,y=a.yaw,fx=-Math.sin(y),fz=-Math.cos(y);o=o||{};o.x=c.x+fx*FM_TZ;o.y=c.y+FM_TY;o.z=c.z+fz*FM_TZ;o.ax=Math.cos(y);o.az=-Math.sin(y);return o};
const _fmp={};
FM.ray=function(a,ox,oy,oz,dx,dy,dz,tmax){if(!a.fmTkOn||!isFm(a)||!a.alive)return null;const p=FM.tankPos(a,_fmp);let bt=tmax,hit=false;
  for(let k=-2;k<=2;k++){const s=k*FM_TH/2,t=raySphere(ox,oy,oz,dx,dy,dz,p.x+p.ax*s,p.y,p.z+p.az*s,FM_TR,bt);if(t>=0&&t<bt){bt=t;hit=true}}
  return hit?{t:bt,part:'tank'}:null};
FM.near=function(a,x,y,z){const p=FM.tankPos(a,_fmp);const s=clamp((x-p.x)*p.ax+(z-p.z)*p.az,-FM_TH,FM_TH);return Math.hypot(x-(p.x+p.ax*s),y-p.y,z-(p.z+p.az*s))<FM_TR+.07};
// a hit on the tank: what the shot said (hitscan names the part), else the impact point next to the tank (projectiles, splashes)
// (a claim that arrives just after the host's own charge timer ran out still counts: the client was a moment behind, FM.end's fmGr)
FM.tankHit=function(t,o){if(!t||!isFm(t)||!o)return false;if(o.tank!=null)return !!o.tank&&(t.fmTkOn||t.fmGr>0);return !!t.fmTkOn&&o.x!=null&&FM.near(t,o.x,o.y,o.z)};

// ---------- the charge ----------
// host (or offline): G pressed
FM.start=function(a){const c=a.c,L=LI();if(!isFm(a)||!a.alive)return false;
  if(a.fmTkT>0){if(a.isPlayer)HUD.note(L?`No tank — a new one in ${Math.ceil(a.fmTkT)}s`:`산소통 없음 — 새 산소통까지 ${Math.ceil(a.fmTkT)}초`,1.2);return false}
  if(a.fmC>0||a.frozen>0||a.holdT>0||(!a.pup&&!c.onGround))return false;
  let h=a.yaw;const t=a.bot&&a.bot.target;if(t&&t.alive&&Math.hypot(t.c.x-c.x,t.c.z-c.z)>.5)h=Math.atan2(-(t.c.x-c.x),-(t.c.z-c.z));
  FM.begin(a,h);if(NET.host)netEv('fmc',{i:a.id,y:r3(h)});return true};
// every page: the charge is under way
FM.begin=function(a,h){const c=a.c;a.fmC=FM.DUR;a.fmH=h;a.fmV=FM.SPD;a.fmT=0;a.fmBlk=0;a.fmGr=0;a.fmHit=new Set();a.fmTHp=FM.TANK;a.fmTkOn=true;a.fmTkT=0;a.an.skill=.3;
  AU.at('zroar',c.x,c.y+1.5,c.z,{vol:1,range:60,rate:.85});AU.at('salgust',c.x,c.y+1.2,c.z,{vol:.8,range:40,rate:1.5});
  for(let i=0;i<14;i++){const g=rr(0,TAU);FX.spawn({x:c.x+Math.cos(g)*.3,y:c.y+.08,z:c.z+Math.sin(g)*.3,vx:Math.cos(g)*rr(1,2.5),vy:rr(.2,.7),vz:Math.sin(g)*rr(1,2.5),life:rr(.4,.8),s0:.15,s1:.55,r:.45,g:.4,b:.34,a:.45,f:2,drag:2.5})}
  if(a.isPlayer){HUD.note(LI()?'Tank charge!':'산소통 돌진!',1);FX.shake=Math.max(FX.shake,.35)}};
// every page: it is over (time, a wall, frost); the owner tells the host when it stopped early, the host tells everyone
FM.end=function(a,why){if(!(a.fmC>0))return;a.fmC=0;a.fmTkOn=false;a.fmGr=a.pup?.4:0;const c=a.c;
  if(why==='wall'||why==='wnet'){AU.at('kwall',c.x,c.y+1.2,c.z,{vol:1,range:40,rate:.6});AU.at('hamhit',c.x,c.y+1.2,c.z,{vol:.7,range:40,rate:.7});
    const fx=-Math.sin(a.fmH||a.yaw),fz=-Math.cos(a.fmH||a.yaw);for(let i=0;i<12;i++)FX.spawn({x:c.x+fx*.6+rr(-.3,.3),y:c.y+rr(.4,1.6),z:c.z+fz*.6+rr(-.3,.3),vx:-fx*rr(.5,2)+rr(-1,1),vy:rr(-.2,1),vz:-fz*rr(.5,2)+rr(-1,1),life:rr(.5,1),s0:.2,s1:.7,r:.5,g:.47,b:.42,a:.45,f:2,drag:2});
    if(!a.pup){a.staggerT=Math.max(a.staggerT,.45);a.kvx*=.1;a.kvz*=.1}if(a.isPlayer)FX.shake=Math.max(FX.shake,.55)}
  if(why==='wall'||why==='frost'){if(NET.cli&&a===G.player)netToHost({t:'fmx'});else if(NET.host)netEv('fmx',{i:a.id,w:why==='wall'?1:0})}};
// host: the tank takes a hit
FM.tankHurt=function(a,d,src){if(!(a.fmTkOn||a.fmGr>0)||!(d>0))return;a.fmTHp-=d;a.fmFl=.12;if(a.fmTHp<=0)FM.breakTank(a,src)};
// every page: the tank bursts (the host decides and tells the rest)
FM.breakTank=function(a,src,remote){if(!remote&&!(a.fmTkOn||a.fmGr>0))return;const p=FM.tankPos(a,{}),c=a.c,L=LI();
  a.fmC=0;a.fmTkOn=false;a.fmTkT=FM.RE;a.fmTHp=0;a.fmGr=0;
  // a white jet of gas, a ring of it, steel shards and a flash
  FX.spawn({x:p.x,y:p.y,z:p.z,life:.15,s0:.4,s1:1.6,r:1,g:1,b:1,a:.9,f:1,add:1});DL.add(p.x,p.y,p.z,'#e8f0ff',8,2,.2);
  for(let i=0;i<26;i++){const g=rr(0,TAU),e=rr(-.3,.9),sp=rr(2,7);FX.spawn({x:p.x,y:p.y,z:p.z,vx:Math.cos(g)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(g)*Math.cos(e)*sp,life:rr(.5,1.1),s0:.12,s1:rr(.6,1.1),r:.9,g:.92,b:.94,a:.6,f:2,drag:2.6})}
  for(let i=0;i<12;i++)FX.spark(p.x,p.y,p.z,rr(-5,5),rr(0,5),rr(-5,5),rr(.2,.5),[1,.6,.45]);
  AU.at('explode',p.x,p.y,p.z,{vol:.7,range:70,rate:1.75});AU.at('hiss',p.x,p.y,p.z,{vol:1,range:45,rate:.55});
  if(!a.pup){a.kvx*=.15;a.kvz*=.15;a.mvx*=.3;a.mvz*=.3;a.staggerT=Math.max(a.staggerT,1)}
  if(a.isPlayer){HUD.note(L?`The tank burst! A new one in ${FM.RE}s`:`산소통이 터졌다! 새 산소통까지 ${FM.RE}초`,2);FX.shake=Math.max(FX.shake,.6)}
  if(!NET.cli){a.skillCD=Math.max(a.skillCD,FM.RE);a.staggerT=Math.max(a.staggerT,1);// (a puppet's stagger reaches its owner as an effect, net.js)
    ESMK.add(p.x,c.y+.25,p.z,FM.SMR,FM.SML);if(src&&src.team===TH)src.score+=1;if(NET.host)netEv('fmb',{i:a.id,s:src?src.id:-1})}
  if(src&&src===G.player&&src.team===TH){HUD.note(L?'Oxygen tank destroyed!':'산소통 파괴!',1.5);AU.play('hsding',{vol:.6})}};
// host: it runs into a human
FM.ram=function(a,h,hx,hz){a.fmHit.add(h.id);const rx=-hz,rz=hx,dx=h.c.x-a.c.x,dz=h.c.z-a.c.z,sd=dx*rx+dz*rz>=0?1:-1;
  SCEN.pushHuman(h,hx*FM.PUSH+rx*sd*3.2,FM.UP,hz*FM.PUSH+rz*sd*3.2);
  // on its back when thrown backwards, face down when hit from behind
  const fdot=hx*-Math.sin(h.yaw)+hz*-Math.cos(h.yaw);FM.knock(h,FM.KD,a,fdot<0?1:-1);if(!a.pup)a.fmV*=.82};
FM.knock=function(h,t,src,dir){FM.knockApply(h,t,src,dir);if(NET.host)netEv('fmkd',{i:h.id,t:r2(t),s:src?src.id:-1,d:dir})};
// every page: knocked flat
FM.knockApply=function(h,t,src,dir){if(!h||!h.alive||h.team!==TH)return;h.fmKd=Math.max(h.fmKd||0,t);h.deadDir=dir||1;h.dizzy=Math.max(h.dizzy||0,t*.8);const c=h.c;
  AU.at('hamhit',c.x,c.y+1.1,c.z,{vol:1,range:50,rate:.8});AU.at('hurt',c.x,c.y+1.4,c.z,{vol:.8,range:30});
  for(let i=0;i<10;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.1,.5),z:c.z+rr(-.3,.3),vx:rr(-1.5,1.5),vy:rr(.3,1.2),vz:rr(-1.5,1.5),life:rr(.5,.9),s0:.2,s1:.7,r:.45,g:.41,b:.36,a:.45,f:2,drag:2.2});
  if(h.isPlayer){HUD.note(LI()?'Knocked down!':'넘어졌다!',1.2);FX.shake=Math.max(FX.shake,.75);AU.play('land',{vol:.8});if(HUD.daze)HUD.daze()}};
// the hold in first person: how far the hands are on the tank (0..1)
FM.vmK=a=>isFm(a)&&a.alive?(a.fmP||0):0;

// ---------- every frame ----------
FM.update=function(dt){const host=!NET.cli;
  if(!EP.on)ESMK.update(dt);// (the chapters run the smoke themselves)
  for(const a of G.actors){
    // knocked flat: the timer and the pose (humans)
    if(a.fmKd>0)a.fmKd=a.alive&&a.team===TH?Math.max(0,a.fmKd-dt):0;
    if(a.kdP>0||a.fmKd>0)a.kdP=approach(a.kdP||0,a.fmKd>0?1:0,dt*(a.fmKd>0?6:2.4));
    if(!isFm(a)){if(a.fmM)a.fmM.visible=false;continue}
    if(!a.xRay)a.xRay=(ox,oy,oz,dx,dy,dz,t)=>FM.ray(a,ox,oy,oz,dx,dy,dz,t);
    if(!a.alive){a.fmC=0;a.fmTkOn=false}
    if(a.fmTkT>0)a.fmTkT=Math.max(0,a.fmTkT-dt);
    if(a.fmC>0){a.fmC-=dt;if(a.fmC<=0){a.fmC=.001;FM.end(a,'time')}}
    a.fmP=approach(a.fmP||0,a.fmC>0&&a.fmTkOn?1:0,dt*(a.fmC>0?9:5));
    if(a.fmFl>0)a.fmFl=Math.max(0,a.fmFl-dt);
    // the host follows the charging body (a puppet moves on its owner's page) and knocks over whoever it runs into
    const lx=a.fmLx==null?a.c.x:a.fmLx,lz=a.fmLz==null?a.c.z:a.fmLz;a.fmLx=a.c.x;a.fmLz=a.c.z;
    const vx=(a.c.x-lx)/Math.max(dt,1e-3),vz=(a.c.z-lz)/Math.max(dt,1e-3),v=Math.hypot(vx,vz);a.fmSp=lerp(a.fmSp||0,v,Math.min(1,dt*12));
    if(a.fmGr>0)a.fmGr=Math.max(0,a.fmGr-dt);
    if(host&&a.alive&&(a.fmC>0||a.fmGr>0)&&(a.pup?a.fmSp>6.5:a.fmT>.05)){let hx=-Math.sin(a.fmH),hz=-Math.cos(a.fmH);if(a.pup&&v>1){hx=vx/v;hz=vz/v}
      for(const h of G.actors){if(!h.alive||h.team!==TH||a.fmHit.has(h.id))continue;const dx=h.c.x-a.c.x,dz=h.c.z-a.c.z;if(Math.hypot(dx,dz)>a.c.hw+h.c.hw+.55)continue;
        if(dx*hx+dz*hz<-.05||h.c.y>a.c.y+1.5||h.c.y+h.c.h<a.c.y+.3)continue;FM.ram(a,h,hx,hz)}}
    // while it charges: dust kicked up behind, the valve hissing, a shake for the player
    if(a.fmC>0&&a.alive){const c=a.c;if(Math.random()<dt*30)FX.spawn({x:c.x+rr(-.25,.25),y:c.y+.06,z:c.z+rr(-.25,.25),vx:rr(-.4,.4),vy:rr(.2,.8),vz:rr(-.4,.4),life:rr(.4,.8),s0:.12,s1:.5,r:.45,g:.41,b:.36,a:.4,f:2,drag:2});
      if(a.fmTkOn&&Math.random()<dt*14){const p=FM.tankPos(a,_fmp);FX.spawn({x:p.x-p.ax*.32,y:p.y,z:p.z-p.az*.32,vx:-p.ax*rr(.8,1.6),vy:rr(0,.4),vz:-p.az*rr(.8,1.6),life:rr(.25,.5),s0:.05,s1:.25,r:.92,g:.94,b:.96,a:.4,f:2,drag:2})}
      if(a.isPlayer)FX.shake=Math.max(FX.shake,.14)}
    FM.place(a)}};
// the tank's model: on the back plate, held across the chest while charging, gone while broken
FM.place=function(a){const ch=a.ch;if(!ch)return;let m=a.fmM;
  if(!m){m=a.fmM=new THREE.Mesh(gunGeo('fmTank'),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false}
  if(m.parent!==ch.grp)ch.grp.add(m);m.visible=!(a.fmTkT>0)&&(a.alive||a.an.dead>0);if(!m.visible)return;
  if(a.fmP>.5&&a.fmTkOn){m.matrix.makeRotationZ(Math.PI/2);m.matrix.setPosition(0,FM_TY,-FM_TZ)}
  else{const d=ch.A.def,o=d.o,sY=d.piv[1][1],zb=o.belly*.25+(o.torsoD+o.belly)/2;_fmM4.makeTranslation(0,sY+o.torsoH*.52,zb+.133);m.matrix.multiplyMatrices(ch.uB[1],_fmM4)}
  m.material.uniforms.uFlash.value=a.fmFl>0?.55:0;sampleProbe(a.c.x,a.c.y+1.2,a.c.z,m.material.uniforms.uProbe.value)};
const _fmM4=new THREE.Matrix4();
FM.reset=function(a){a.fmC=0;a.fmTkOn=false;a.fmTkT=0;a.fmGr=0;a.fmP=0;a.fmKd=0;a.kdP=0};

// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='charge')return FM.start(a);return ns(a,Z)};
  // the coat, and the tank in front of the body while it charges (the host judges; a client only claims, net.js)
  const da=damageActor;damageActor=function(t,dmg,src,o){
    if(NET.ghost||NET.cli||!t||!t.alive||!o||!isFm(t))return da(t,dmg,src,o);
    const fire=fmFire(o),he=fmBlast(o);
    if(t.fmTkOn||t.fmGr>0){const tk=FM.tankHit(t,o);if(tk||he)FM.tankHurt(t,dmg,src);
      if(tk&&!he)return 0;// the tank takes it all
      o.kb=(o.kb||0)*.15;o.up=0;o.stag=Math.min(o.stag||0,.05)}// charging: bullets barely push it
    if(fire||he)dmg*=.5;return da(t,dmg,src,o)};
  // the charge drives the body (on the page that moves it); a knocked-down human stays where it lies
  const ap=actorPhysics;actorPhysics=function(a,dt){
    if(a.fmKd>0&&a.team===TH){const c=a.cmd;c.f=c.s=0;c.jump=false;c.duck=false}
    if(!(a.fmC>0)||!isFm(a))return ap(a,dt);
    if(a.frozen>0){FM.end(a,'frost');return ap(a,dt)}
    a.fmT+=dt;let want=a.yaw;const t=a.bot&&a.bot.target;if(t&&t.alive)want=Math.atan2(-(t.c.x-a.c.x),-(t.c.z-a.c.z));
    a.fmH+=clamp(wrapA(want-a.fmH),-FM.TURN*dt,FM.TURN*dt);if(a.bot)a.yaw=a.fmH;
    const sp=a.fmV*Math.min(1,.4+a.fmT/.15),hx=-Math.sin(a.fmH),hz=-Math.cos(a.fmH);
    a.kvx=hx*sp;a.kvz=hz*sp;a.mvx=a.mvz=0;a.staggerT=0;const c=a.cmd;c.f=c.s=0;c.jump=false;c.duck=false;c.fire=c.alt=false;
    const x0=a.c.x,z0=a.c.z;ap(a,dt);
    if(a.fmT>.15&&Math.hypot(a.c.x-x0,a.c.z-z0)<sp*dt*.35){a.fmBlk+=dt;if(a.fmBlk>.06)FM.end(a,'wall')}else a.fmBlk=0};
  // no claws while the hands hold the tank; no shooting while knocked flat
  const aw=actorWeapons;actorWeapons=function(a,dt){const c=a.cmd;if(a.fmKd>0&&a.team===TH||a.fmC>0&&isFm(a)){c.fire=c.alt=false;c.reload=false}return aw(a,dt)};
  // knocked flat: the eye drops to the floor and rolls, the gun goes out of sight; charging: the view widens a little
  const cam0=Main.camera.bind(Main);Main.camera=function(dt){cam0(dt);const P=G.player;if(!P||!P.alive||G.spec||G.st==='menu')return;
    if(P.kdP>0&&P.team===TH){const k=smooth(clamp(P.kdP,0,1));R.cam.position.y-=1.1*k;R.cam.rotateZ(.45*k*(P.deadDir||1));R.cam.updateMatrixWorld();if(k>.15)R.vmVisible=false}
    else if(isFm(P)&&P.fmP>0){const f=CFG.fov+7*smooth(clamp(P.fmP,0,1));if(Math.abs(R.cam.fov-f)>.01){R.cam.fov=f;R.cam.updateProjectionMatrix()}}};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')FM.update(dt);else for(const a of G.actors)if(isFm(a)&&a.alive)FM.place(a)};// (the title screen's demo zombies wear theirs too)
  // a fresh start: a new round, a new zombie, a zombie back on its feet
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)FM.reset(a);if(!EP.on)ESMK.clear()};
  const bz=becomeZombie;becomeZombie=function(a,host){FM.reset(a);return bz(a,host)};
  // (a broken tank stays gone through a revival: its timer runs with the skill's cooldown)
  const rz=reviveZombie;reviveZombie=function(a,at,rise){const r=rz(a,at,rise);if(a.alive){a.fmC=0;a.fmTkOn=false;a.fmP=0}return r};
  Object.assign(CLIH,{
    fmc(L,m){const a=byId(m.i);if(a&&a.alive)FM.begin(a,a===G.player?a.yaw:m.y/1000)},
    fmx(L,m){const a=byId(m.i);if(a)FM.end(a,m.w?'wnet':'net')},
    fmb(L,m){const a=byId(m.i);if(a)FM.breakTank(a,m.s>=0?byId(m.s):null,true)},
    fmkd(L,m){const h=byId(m.i);if(h)FM.knockApply(h,m.t/100,m.s>=0?byId(m.s):null,m.d||1)}});
  Object.assign(HOSTH,{fmx(L){const a=actorOfKey(L.key);if(a&&a.fmC>0){FM.end(a,'wnet');netEv('fmx',{i:a.id,w:1})}}});
})();

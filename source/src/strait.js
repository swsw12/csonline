'use strict';
// ============ 구속복 좀비 (Straitjacket Zombie) for everyone (v6.91): the seventh class to pick, outside the chapters ============
// Until v6.90 the straitjacket zombie (ZCLASS.strait; its body in design.js, its strapped pose in models.js) lived in chapter 1 only,
// with its own pounce and AI there (aleph.js STRAIT). Now it can be picked like the others. Its arms are strapped across its chest, so it
// butts with its head instead of clawing (the claw's reach and the claw's infection: game.js zombieAttack; the pose: models.js, the view:
// SJ.vmPose). G is 덮치기: a short wind-up, then a low leap of about SJ.RANGE m where it looks (a bot: at its target); the first human it
// lands on is pinned for SJ.PIN s — no shooting, no moving (grabT / rootT, as in the chapter). The pin does not infect by itself: it holds
// the human for the other zombies, and for its own head the moment it lets go. SJ.FREE damage from the humans shakes it off (it staggers
// and is thrown back; whoever freed the human gets a point); it also lets go when the time is up, when it is frozen, dies or is pulled
// away, and when its human turns.
// Network (host-authoritative, as the firefighter's charge): the host starts the pounce and decides whom it lands on and when it lets go
// (sjc / sjg / sju to everyone). The body moves on the page that owns it (the host for bots, the player's own page), which also keeps it
// in front of its human while it holds. The host follows a player's leap on its own view (moving faster than SJ.SPDP m/s).
// In the chapters none of this runs: their straitjackets keep their own pounce and AI, and scenario.js keeps their health, speed and
// armour as they were before the class could be picked.
const SJ={RANGE:6,OVER:.55,WIND:.26,LEAP:1.1,PIN:1.6,FREE:260,REACH:.42,LOCK:.55,SPDP:7.5,
  // first person: the two sleeves crossed low in front [hand x,y,z, toward-elbow x,y,z] (right arm, left arm); the butt's keyframes
  // over the stroke (0..1: rear back +, drive in -)
  VMR:[[-.2,-.18,-.45,1,-.12,.18],[.2,-.21,-.46,-1,-.02,.18]],
  VML:[[0,0],[.25,.4],[.42,-.9],[.55,-1],[.78,-.3],[1,0]],VMH:[[0,0],[.3,.55],[.5,-1.1],[.62,-1.2],[.85,-.35],[1,0]]};
const isSj=a=>!!a&&a.zc==='strait'&&a.team===TZ;
const sjOn=()=>!(typeof EP!=='undefined'&&EP.on)&&G.mode!=='scen';

// ---------- atlas: the jacket's canvas (off-white, seams, grime; old blood on it at the full blood setting), its brown leather straps ----------
const SJ_MATS=['sl_strait','sjStrap'];
for(const m of SJ_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintSjAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=255}
    x.putImageData(id,x0,y0)};
  const base=(typeof ARM_DESIGN!=='undefined'&&ARM_DESIGN.sl_strait&&ARM_DESIGN.sl_strait[0])||'#cfc8b4';
  patch('sl_strait',(xx,y,X,Y)=>{const t=fbm(X/14,Y/14,7101,3,0);let c=t>.62?lt(base,.07):t<.36?dk(base,.12):base;
    if(xx%24===0||y%32===0)c=dk(base,.2);else if((xx%24===1||y%32===1)&&(xx+y)%3===0)c=dk(base,.3);// seams and their stitches
    if(hash2(X,Y,7102)<.03)c=dk(base,.35);const g=fbm(X/30,Y/30,7103,2,0);if(g>.68)c=mix(c,'#7a6a4e',.45);
    if(GORE.lv>=2&&g<.22)c=mix(c,'#5e1410',.4);return c});
  patch('sjStrap',(xx,y,X,Y)=>{const t=fbm(X/9,Y/9,7111,3,0);let c=t>.6?'#6e4a2c':t<.38?'#4a2e1a':'#5c3c22';const e=y%32;
    if(e<2||e>29)c='#3a2414';else if((e===4||e===27)&&xx%6<3)c='#8a6a46';if(hash2(X,Y,7112)<.04)c='#7a5a3a';return c});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintSjAtlas()}}

// ---------- first person: the sleeves (closed at the end, a strap and its buckle round the wrist, the strap's end hanging) ----------
function sjArm(mat){const g=new THREE.Group(),S='sl_strait';
  const parts=[Pt(0,0,.2,.074,.07,.42,S,{r:.032}),Pt(0,-.004,-.03,.078,.072,.1,S,{r:.036}),Pt(0,-.006,-.085,.06,.054,.03,S,{r:.024}),
    Pt(0,0,.06,.082,.077,.032,'sjStrap',{r:.012}),Pt(.039,.002,.06,.012,.028,.024,'bright',{r:.004}),Pt(.041,.002,.06,.006,.016,.012,'blk',{r:.002}),
    Pt(.004,-.034,-.07,.026,.007,.1,'sjStrap',{rx:.55,r:.003}),Pt(0,0,.3,.08,.075,.024,'sjStrap',{r:.01})];
  const m=new THREE.Mesh(partGeo(parts),mat);m.frustumCulled=false;g.add(m);return g}
{const bc=buildClaws;buildClaws=function(zk,U){if(zk!=='strait')return bc(zk,U);const mat=matVM(GA.texVM,U),root=new THREE.Group();
  const mk=()=>{const g=new THREE.Group();g.add(sjArm(mat));return g};const R=mk(),L=mk();root.add(R);root.add(L);
  lookArm(R.children[0],[0,0,0],[.25,-.5,1]);lookArm(L.children[0],[0,0,0],[-.25,-.5,1]);
  return {id:'claw',root,gun:root,tags:{},armR:R,armL:L,mat,vd:false,doll:null,fmTank:null,sj:true}}}
// the view's pose every frame (vm.js): the sleeves stay crossed; the butt rears back, then drives in with a nod of the view
SJ.vmPose=function(V,A,dt){const M=V.mel;let k=0,hv=false;
  if(M){M.t+=dt;const p=clamp(M.t/M.d,0,1);hv=!!M.heavy;k=kf1(hv?SJ.VMH:SJ.VML,p);if(p>=1)V.mel=null}
  for(let i=0;i<2;i++){const R0=SJ.VMR[i];for(let j=0;j<6;j++)A[i][j]=R0[j]}
  const b=k>0?k:0,f=k<0?-k:0;for(let i=0;i<2;i++){A[i][1]+=b*.035-f*.03;A[i][2]+=b*.05-f*.12}
  V.camPitch=k<0?k*(hv?.1:.075):k*.02};

// ---------- the pounce ----------
// host (or offline): G pressed
SJ.start=function(a){const c=a.c;if(!isSj(a)||!a.alive||!sjOn()||a.scen)return false;
  if(a.sjS||a.frozen>0||a.holdT>0||a.rootT>0||a.reviving>0||a.cur==='zbomb'||(!a.pup&&!c.onGround))return false;
  let h=a.yaw;const t=a.bot&&a.bot.target;if(t&&t.alive&&Math.hypot(t.c.x-c.x,t.c.z-c.z)>.5)h=Math.atan2(-(t.c.x-c.x),-(t.c.z-c.z));
  SJ.begin(a,h);a.sjTg=t&&t.alive?t:null;if(NET.host)netEv('sjc',{i:a.id,y:r3(h)});return true};// (a bot leaps at the human it coiled for, even if its eye wanders meanwhile)
// every page: the wind-up (low, coiled)
SJ.begin=function(a,h){const c=a.c;a.sjS='wind';a.sjT=SJ.WIND;a.sjH=h;a.sjV=null;a.sjD=0;a.sjFly=false;a.sjG=0;a.an.skill=Math.max(a.an.skill,.5);
  AU.at('zgrowl',c.x,c.y+1.5,c.z,{vol:.9,range:30,rate:1.4});if(a.isPlayer)HUD.note(LI()?'Pounce!':'덮치기!',.8)};
// every page: off it goes (only the page that owns the body throws it)
SJ.leap=function(a){const c=a.c;a.sjS='leap';a.sjT=SJ.LEAP;a.sjLx=a.sjLz=null;a.sjSp=0;a.sjG=0;
  AU.at('zleap',c.x,c.y+1.4,c.z,{vol:.9,range:35});if(a.pup)return;
  let h=a.isPlayer?a.yaw:a.sjH,tx=null,ty=c.y,tz=null;const t=a.bot&&a.sjTg;a.sjTg=null;
  if(a.bot&&t&&t.alive&&t.team===TH){const lx=t.c.x+(t.c.vx||0)*.25,lz=t.c.z+(t.c.vz||0)*.25,d=Math.hypot(lx-c.x,lz-c.z);
    if(d<SJ.RANGE+1){const k=Math.min(1,(SJ.RANGE+.3)/Math.max(d,.1));tx=c.x+(lx-c.x)*k;tz=c.z+(lz-c.z)*k;ty=t.c.y}}
  if(tx==null){tx=c.x-Math.sin(h)*SJ.RANGE;tz=c.z-Math.cos(h)*SJ.RANGE}
  // the arc of SCEN.leapTo; how long it flies is kept here, since a body that skids along the floor or against a wall may not read as
  // landed for a while (and would slide on at the leap's speed)
  SCEN.leapTo(a,tx,ty,tz,SJ.OVER);const apex=Math.max(c.y,ty)+SJ.OVER,vy=Math.sqrt(2*GRAV*Math.max(.5,apex-c.y));
  a.sjFT=vy/GRAV+Math.sqrt(2*Math.max(.1,apex-ty)/GRAV)+.06;a.sjLt=0;a.sjBlk=0;a.sjFly=true;if(a.isPlayer)FX.shake=Math.max(FX.shake,.3)};
// the owner: down (on the floor, out of time, frozen, or stopped by a wall); a moment for the host to see what it came down on, a short
// recovery
SJ.land=function(a){a.leapV=null;a.kvx*=.2;a.kvz*=.2;a.sjFly=false;a.sjG=.12;a.staggerT=Math.max(a.staggerT||0,.3)};
// host: did it come down on someone? (the nearest human within reach of its path since the last frame, at its height, in sight, not
// already held)
SJ.touch=function(a,lx,lz){let best=null,bd=1e9;const sx=a.c.x-lx,sz=a.c.z-lz,L2=sx*sx+sz*sz;
  for(const h of G.actors){if(!h.alive||h.team!==TH||h.grabT>0||h.sjA)continue;const u=L2>1e-6?clamp(((h.c.x-lx)*sx+(h.c.z-lz)*sz)/L2,0,1):1;
    const d=Math.hypot(h.c.x-(lx+sx*u),h.c.z-(lz+sz*u));
    if(d>a.c.hw+h.c.hw+SJ.REACH||h.c.y>a.c.y+1.6||h.c.y+h.c.h<a.c.y+.2||d>=bd)continue;
    if(!losClear(a.c.x,a.c.y+1,a.c.z,h.c.x,h.c.y+1,h.c.z))continue;bd=d;best=h}// (not through a thin wall)
  if(best)SJ.grab(a,best)};
SJ.grab=function(a,h){SJ.grabApply(a,h);if(NET.host)netEv('sjg',{i:a.id,v:h.id})};
// every page: it has its human
SJ.grabApply=function(a,h){if(!a||!h)return;const L=LI();a.sjS='grab';a.sjT=SJ.PIN;a.sjV=h;a.sjD=0;a.sjFly=false;a.leapV=null;a.an.skill=Math.max(a.an.skill,.5);
  h.grabT=SJ.PIN+.15;h.rootT=Math.max(h.rootT||0,SJ.PIN+.15);h.sjA=a;const c=h.c;
  AU.at('zatk',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:35,rate:.8});AU.at('hamhit',c.x,c.y+1.1,c.z,{vol:.7,range:30,rate:1.3});
  if(h===G.player){FX.shake=Math.max(FX.shake,.55);AU.play('hurt',{vol:.6});HUD.note(L?'Pinned! A teammate has to shoot it off':'붙잡혔다! 동료가 쏴서 떼어 줘야 해요',SJ.PIN+.3)}
  if(a===G.player){FX.shake=Math.max(FX.shake,.35);HUD.note(L?`Got ${h.name}!`:`${h.name} 붙잡았다!`,1.2)}};
SJ.release=function(a,freed,src){SJ.releaseApply(a,freed,src);if(NET.host)netEv('sju',{i:a.id,f:freed?1:0,s:src?src.id:-1})};
// every page: it lets go (thrown back and staggering when it was shot off)
SJ.releaseApply=function(a,freed,src){const v=a.sjV,L=LI();a.sjS='';a.sjV=null;a.sjT=0;a.sjFly=false;
  if(v){v.grabT=0;if(v.sjA===a)v.sjA=null;if(v===G.player||!v.pup)v.rootT=Math.min(v.rootT||0,.05)}
  if(!a.pup){a.staggerT=Math.max(a.staggerT||0,freed?1.2:.35);if(freed&&v){const dx=a.c.x-v.c.x,dz=a.c.z-v.c.z,d=Math.hypot(dx,dz)||1;a.kvx+=dx/d*5;a.kvz+=dz/d*5}}
  if(freed){AU.at('zpain',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:50,rate:.8});if(!NET.cli&&src&&src.team===TH)src.score+=1;
    if(src&&src===G.player&&src!==v)HUD.note(L?'You shot it off your teammate!':'동료를 구했다!',1.4);if(v&&v===G.player)HUD.note(L?'Free!':'풀려났다!',1)}
  if(a===G.player&&freed)HUD.note(L?'Shaken off!':'떨어져 나갔다!',1)};
SJ.clearSt=function(a){a.sjS='';a.sjV=null;a.sjT=0;a.sjFly=false;a.sjG=0};
SJ.reset=function(a){if(a.sjS==='grab'&&a.sjV){const v=a.sjV;v.grabT=0;if(v.sjA===a)v.sjA=null}SJ.clearSt(a);if(a.sjA)a.sjA=null};

// ---------- every frame ----------
SJ.update=function(dt){const host=!NET.cli,on=sjOn();
  for(const a of G.actors){
    // a held human's pin wears off by itself (the chapters count theirs down in episode.js)
    if(on&&a.grabT>0&&a.team===TH)a.grabT=Math.max(0,a.grabT-dt);
    if(a.sjA&&!(a.grabT>0))a.sjA=null;
    if(!a.sjS)continue;
    if(!isSj(a)||!a.alive||!on){if(a.sjS==='grab'&&host)SJ.release(a,false);else SJ.reset(a);continue}
    if(a.sjS==='wind'){a.sjT-=dt;a.an.skill=Math.max(a.an.skill,.5);if(a.sjT<=0)SJ.leap(a);continue}
    if(a.sjS==='leap'){a.sjT-=dt;a.an.skill=Math.max(a.an.skill,.4);if(a.sjG>0)a.sjG=Math.max(0,a.sjG-dt);
      // the host watches its own bodies while they fly (and a moment after they land), a player's body while it moves fast on its view
      if(host){const lx=a.sjLx==null?a.c.x:a.sjLx,lz=a.sjLz==null?a.c.z:a.sjLz;a.sjLx=a.c.x;a.sjLz=a.c.z;
        a.sjSp=lerp(a.sjSp||0,Math.hypot(a.c.x-lx,a.c.z-lz)/Math.max(dt,1e-3),Math.min(1,dt*12));
        if(a.pup?a.sjSp>SJ.SPDP:a.sjFly||a.sjG>0)SJ.touch(a,lx,lz)}
      if(a.sjS==='leap'&&(a.sjT<=0||!a.pup&&!a.sjFly&&!(a.sjG>0)))SJ.clearSt(a);continue}
    if(a.sjS==='grab'){a.sjT-=dt;a.an.skill=Math.max(a.an.skill,.35);const v=a.sjV;
      if(host){if(!v||!v.alive||v.team!==TH||a.frozen>0||a.sjT<=0||Math.hypot(v.c.x-a.c.x,v.c.z-a.c.z)>2.6||Math.abs(v.c.y-a.c.y)>2){SJ.release(a,false);continue}
        if(!v.pup){v.grabT=Math.max(v.grabT||0,.3);v.rootT=Math.max(v.rootT||0,.3)}}
      else if(a.sjT<-1.5)SJ.reset(a)}}};// (a word of the release that never came)

// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='pounce')return SJ.start(a);return ns(a,Z)};
  // the body on the page that owns it: still while it coils, thrown while it flies, kept in front of its human while it holds
  const ap=actorPhysics;actorPhysics=function(a,dt){if(!a.sjS||a.pup||!isSj(a))return ap(a,dt);const c=a.cmd;
    if(a.sjS==='wind'){c.f=c.s=0;c.jump=c.duck=false;a.kvx*=.8;a.kvz*=.8;return ap(a,dt)}
    if(a.sjS==='leap'){const L=a.leapV;if(!a.sjFly||!L)return ap(a,dt);if(a.frozen>0||a.rootT>0||a.holdT>0){SJ.land(a);return ap(a,dt)}
      a.sjLt+=dt;a.kvx=L.x;a.kvz=L.z;a.mvx=a.mvz=0;c.f=c.s=0;c.jump=c.duck=false;const x0=a.c.x,z0=a.c.z;ap(a,dt);
      if(a.sjLt>.1&&Math.hypot(a.c.x-x0,a.c.z-z0)<Math.hypot(L.x,L.z)*dt*.35)a.sjBlk+=dt;else a.sjBlk=0;
      if(a.sjLt>=a.sjFT||a.c.onGround&&a.sjLt>a.sjFT*.7||a.sjBlk>.12)SJ.land(a);return}// (an early touch of a step or a slope does not end it)
    if(a.sjS==='grab'){const v=a.sjV;if(v&&v.alive){const fx=-Math.sin(v.yaw),fz=-Math.cos(v.yaw),px=v.c.x+fx*SJ.LOCK,pz=v.c.z+fz*SJ.LOCK;
        if(charFits(a.c,px,v.c.y,pz)){a.c.x=px;a.c.z=pz;a.c.y=v.c.y}a.c.vx=a.c.vz=0;a.kvx=a.kvz=a.mvx=a.mvz=0;
        if(a.bot)a.yaw=Math.atan2(-(v.c.x-a.c.x),-(v.c.z-a.c.z))}
      c.f=c.s=0;c.jump=c.duck=false;return ap(a,dt)}
    return ap(a,dt)};
  // no butting while it pounces or holds
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.sjS&&isSj(a)){const c=a.cmd;c.fire=c.alt=false;c.reload=false}return aw(a,dt)};
  // the humans' damage on a holding straitjacket adds up; enough shakes it off (the host judges)
  const da=damageActor;damageActor=function(t,dmg,src,o){const r=da(t,dmg,src,o);
    if(!NET.cli&&!NET.ghost&&t&&t.sjS==='grab'&&isSj(t)&&t.alive&&src&&src.team===TH&&typeof r==='number'&&r>0){t.sjD=(t.sjD||0)+r;if(t.sjD>=SJ.FREE)SJ.release(t,true,src)}
    return r};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')SJ.update(dt)};
  // a fresh start: a new round, a new zombie, a zombie back on its feet
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){SJ.reset(a);if(sjOn()&&a.team===TH)a.grabT=0}};
  const bz=becomeZombie;becomeZombie=function(a,host){SJ.reset(a);a.grabT=0;return bz(a,host)};
  const rz=reviveZombie;reviveZombie=function(a,at,rise){SJ.reset(a);return rz(a,at,rise)};
  Object.assign(CLIH,{
    sjc(L,m){const a=byId(m.i);if(a&&a.alive)SJ.begin(a,a===G.player?a.yaw:m.y/1000)},
    sjg(L,m){const a=byId(m.i),v=byId(m.v);if(a&&v)SJ.grabApply(a,v)},
    sju(L,m){const a=byId(m.i);if(a)SJ.releaseApply(a,!!m.f,m.s>=0?byId(m.s):null)}});
})();

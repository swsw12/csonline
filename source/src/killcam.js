'use strict';
// ============ 킬캠 (v7.7): the last seconds before you went down, again, through the eyes of whoever did it ============
// While a match of a mode with a kill cam runs (팀 데스매치, 개인전, 폭파미션, 무기 레이스; the infection modes when you go down as a zombie)
// and the option is on (옵션 → 게임: 킬캠), the page keeps the last 7 s: every character's place, aim and pose inputs (visState, game.js)
// up to 60 times a second — the local player's too, posed from a shadow copy of its animation state since its own body is not drawn
// (KC.ghost) — and what was seen and heard: particles (an emitter's one by one), sparks, tracers, short lights, sounds in the world, each shot, swing
// and throw. When someone takes you down, the death cam runs a moment, then the kill cam plays the seconds before (and a little after)
// from the killer's eye: copies of the rigs posed from the record (the live bodies are hidden while the game goes on underneath), the
// killer's gun in the view model firing where he fired, his scope when he was zoomed, the moment of the kill slowed down. Live effects
// and sounds in the world are held back while it plays; the recorded ones play instead. It fits the time before you are back (3 s in
// 팀 데스매치 · 개인전 · 무기 레이스: about 2 s of the fight); where you stay down (폭파미션, a zombie in 클래식 감염) it shows 4 s.
// Space, a click or the button skips it; coming back, the round ending or leaving ends it. Nothing goes over the network: each page
// replays what it drew.
const _kcV=new THREE.Vector3(),_kcP=new THREE.Color();
const KC={rec:false,on:false,rp:false,CAP:440,KEEP:7,
  F:[],fi:0,fn:0,lastT:-1e9,E:[],e0:0,ei:0,C:new Map(),S:new Map(),SP:[],pend:null,pk:null,
  MODES:['tdm','ffa','bomb','race','orig','mut'],
  // st fields that change smoothly (interpolated between two frames; the rest come from the nearer one); JUMP: ones that also restart
  NUM:['spd','phase','stride','mvF','mvS','crouch','air','land','accel','turnRate','pitch','t','dead','deadT','chg','kick','kick2','reload','shellP','sprint','atk','flinch','flinchX','skill','stun','turn','down'],
  JUMP:{kick:1,kick2:1,atk:1,reload:1,shellP:1,flinch:1,land:1,skill:1,turn:1},
  want(){const P=G.player;return CFG.kc!==false&&!!P&&G.st!=='menu'&&G.st!=='over'&&this.MODES.includes(G.mode)},
  clear(){this.F.length=0;this.fi=0;this.fn=0;this.lastT=-1e9;this.E.length=0;this.e0=0;this.pend=null;
    for(const rc of this.C.values()){if(rc.grp.parent)rc.grp.parent.remove(rc.grp);rc.mat.dispose();if(rc.gMat)rc.gMat.dispose()}this.C.clear()},
  // the effects, lights and sounds of the world: recorded while a match records; held back while the kill cam plays (its own run through)
  init(){if(this.ok)return;this.ok=true;const K=this;
    const wrap=(O,name,k,one)=>{const f=O[name];O[name]=function(...A){if(k&&K.rec&&!K.rp)K.E.push({t:G.t,k,p:one?A[0]:A});if(K.on&&!K.rp&&K.live())return;return f.apply(this,A)}};
    // (an emitter is not recorded: the particles it gives off later go through FX.spawn and are recorded one by one)
    wrap(FX,'spawn','p',1);wrap(FX,'spark','k');wrap(FX,'tracer','r');wrap(FX,'emit',null,1);
    // a short light (a muzzle flash, a blast) is a moment; a lasting one (a fire, a lamp) belongs to now and always goes through
    const dl=DL.add;DL.add=function(x,y,z,col,range,int,life,o){const sh=life>0&&life<1.5;if(sh&&K.rec&&!K.rp)K.E.push({t:G.t,k:'l',p:[x,y,z,col,range,int,life,o]});
      if(sh&&K.on&&!K.rp&&K.live())return Object.assign({x,y,z,c:new THREE.Color(col),r:range,i:int,life,t:0,flick:0},o||{});return dl.call(this,x,y,z,col,range,int,life,o)};
    for(const [name,k] of [['at','a'],['stepAt','f']]){const f=AU[name];AU[name]=function(n,x,y,z,o){if(K.rec&&!K.rp)K.E.push({t:G.t,k,p:[n,x,y,z,Object.assign({},o||{})]});if(K.on&&!K.rp&&K.live())return null;return f.call(this,n,x,y,z,o)}}},
  // ---------- recording ----------
  tick(dt){this.init();
    if(!this.want()){if(this.on)this.end();if(this.rec){this.rec=false;this.clear()}return}
    if(!this.rec){this.rec=true;this.clear()}
    if(G.t<this.lastT-.001)this.clear();// (a new match: the clock went back)
    this.record();
    const p=this.pend;if(p&&!this.on&&G.t>=p.at){this.pend=null;const P=G.player;if(P&&!P.alive&&(G.st==='fight'||G.st==='prep'))this.start(p)}
    if(this.on)this.play(dt)},
  record(){const A=G.actors;
    if(G.t-this.lastT>=1/61){this.lastT=G.t;let f=this.F[this.fi];if(!f)f=this.F[this.fi]={t:0,n:0,A:[],ix:null};f.t=G.t;f.ix=null;let n=0;
      for(const a of A){const ch=a.ch;if(!ch)continue;const st=a._st;let r=f.A[n];if(!r)r=f.A[n]={st:{},fy:[0,0,0,0],tn:[0,0,0,0]};n++;
        const c=a.c;r.id=a.id;r.key=ch.key;r.vis=!!st;r.alive=a.alive;r.team=a.team;r.side=a.side;r.pl=!!a.isPlayer;r.x=c.x;r.y=c.y;r.z=c.z;r.vx=c.vx;r.vy=c.vy;r.vz=c.vz;r.og=!!c.onGround;
        r.yaw=a.yaw;r.pitch=a.pitch;r.ey=c.y+eyeH(a);r.pp=a.punchP||0;r.py=a.punchY||0;r.zoom=a.zoom||0;r.cur=a.cur;r.skin=a.skin;r.zc=a.zc;r.gm=a.gunId||null;r.hide=ch.hide;r.ph=a.stepPh||0;r.fl=!!a.flash;r.sv=a.spinV||0;
        const U=ch.mat.uniforms,T=U.uTint.value;r.flash=U.uFlash.value;r.tn[0]=T.x;r.tn[1]=T.y;r.tn[2]=T.z;r.tn[3]=T.w;r.em=U.uEmisA.value;
        if(st){Object.assign(r.st,st);const fy=st.footYaw;for(let i=0;i<4;i++)r.fy[i]=fy[i];r.st.footYaw=r.fy}}
      f.n=n;this.fi=(this.fi+1)%this.CAP;this.fn=Math.min(this.fn+1,this.CAP)}
    for(const a of A)a._st=null;
    // what is older than the 7 s kept goes (the array is cut down now and then)
    const lim=G.t-this.KEEP,E=this.E;let e0=this.e0;while(e0<E.length&&E[e0].t<lim)e0++;if(e0>3000&&!this.on){E.splice(0,e0);e0=0}this.e0=e0},
  // the local player's body is not drawn while it lives, so nothing poses it: a shadow animation state does (its own stride clock, swings)
  ghost(a,dt){const S=a._kcS||(a._kcS={an:{atk:0,atkSide:1,flinch:0,dead:0,skill:0},ph:0});const an0=a.an,ph0=a.stepPh;a.an=S.an;a.stepPh=S.ph;
    try{a._st=visState(a,dt)}finally{S.ph=a.stepPh;a.an=an0;a.stepPh=ph0}},
  // (quiet: the flamethrower's ticks, salamander.js — its sound is not one shot each)
  shot(a,W,eye,quiet){this.E.push({t:G.t,k:'s',id:a.id,W,side:a.dualSide||1,pl:!!a.isPlayer,snd:a.isPlayer&&W.snd&&!quiet?W.snd:null,x:eye.x,y:eye.y,z:eye.z})},
  mel(a,heavy){this.E.push({t:G.t,k:'m',id:a.id,heavy:!!heavy});const S=a.isPlayer&&a._kcS;if(S){S.an.atk=1;S.an.heavy=!!heavy;S.an.atkSide=a.an.atkSide||1;S.an.atkD=meleeAtkD(WPN[a.cur],heavy)}},
  nade(a,kind){this.E.push({t:G.t,k:'n',id:a.id,kind})},
  // frame j from the oldest kept (0) to the newest (fn-1)
  fr(j){return this.F[(this.fi-this.fn+j+this.CAP*2)%this.CAP]},
  oldest(){return this.fn?this.fr(0).t:G.t},
  // ---------- going down ----------
  death(src,o){const P=G.player;if(!this.rec||this.on||!P||!src||src===P||!src.ch||!G.actors.includes(src))return;o=o||{};
    // the time before you are back: 3 s in the respawning PvP modes, a zombie's 8 s rise; staying down (폭파미션, a perma kill): plenty
    // (진화 감염: a comeback brings the dead back ZBAL.cbRevive times sooner, and one can begin while you are down — taken as the time)
    let avail=99;if(G.pvp&&G.mode!=='bomb')avail=P.pvpRT!=null?P.pvpRT:PVP.RESP;else if(!P.permaDead&&P.team===TZ)avail=P.reviveT>0?P.reviveT/(G.mode==='mut'&&typeof ZBAL!=='undefined'?ZBAL.cbRevive:1):P.respawnT>0?P.respawnT:5;
    // in a match over the network another player's shots are shown NET_DELAY late (net.js netQueueFx), his kill is not: the moment is his shot
    const lag=NET.on&&src.pup?NET_DELAY/1000:0;
    const long=avail>=6,delay=long?.8:.42,post=long?.7:.3,slow=long?[.34,.16,.35]:[.22,.08,.5],extra=(slow[0]+slow[1])*(1/slow[2]-1);
    const pre=clamp(long?4.2:avail-delay-post-extra-.18,.8,4.2);
    this.pend={at:G.t+delay,tD:G.t+lag,pre,post,slow,kid:src.id,k:src,w:o.w||src.cur,hs:!!o.hs,he:!!o.he,hp:Math.max(0,Math.ceil(src.hp||0)),alive:!!src.alive,
      d:Math.round(Math.hypot(src.c.x-P.c.x,src.c.y-P.c.y,src.c.z-P.c.z)),name:src.name,cls:G.pvp?PVP.cls(src):(src.team===TZ?'z':'h'),col:G.pvp?PVP.col(src):null,pid:P.id}},
  start(p){const t0=Math.max(p.tD-p.pre,this.oldest()+.02),t1=Math.min(p.tD+p.post,this.lastT);if(t1-t0<.5||!this.fn)return;
    this.on=true;this.pk=p;this.t0=t0;this.t1=t1;this.pt=t0;this.real=0;this.left=0;this.kx=0;this.cy=null;this.cp=null;this.vmSave=[VM.id,VM.skin];this.vmErr=0;
    this.ei=this.e0;while(this.ei<this.E.length&&this.E[this.ei].t<=t0)this.ei++;
    this.fxClear();this.post();this.sample();const k=this.S.get(p.kid);if(k)this.vmFor(k,true);
    this.ui(true);AU.play('ui',{vol:.25,rate:.6})},
  speed(t){const p=this.pk,s=p.slow;return t>p.tD-s[0]&&t<p.tD+s[1]?s[2]:1},
  // while it may go on: you are still down and the round still on (what happens the moment either changes — you rising, a bomb going off —
  // is seen and heard live, not held back: it ends there)
  live(){const P=G.player;return !!P&&!P.alive&&(G.st==='fight'||G.st==='prep')},
  play(dt){if(!this.live()){this.end();return}
    const a=this.pt,b=Math.min(this.t1,a+dt*this.speed(a));this.runTo(b);this.pt=b;this.real+=dt;this.sample();
    G.deathCam=Math.max(G.deathCam,.5);// (keeps the spectator view off while it plays)
    if(this.pt>=this.t1-1e-4){this.left+=dt;if(this.left>.18)this.end()}},
  skip(){if(this.on){this.end();AU.play('ui',{vol:.3,rate:1.1})}},
  end(){if(!this.on)return;this.on=false;this.pend=null;
    for(const rc of this.C.values())rc.grp.visible=false;
    for(const n of NADES)if(n._kcH){n._kcH=0;if(n.mesh)n.mesh.visible=true}
    this.unhide();
    this.fxClear();const P=G.player;
    if(P&&!P.alive){const [id,sk]=this.vmSave;if(id&&sk&&WPN[id])VM.set(id,sk);VM.vis=false;G.deathCam=Math.min(G.deathCam,.01)}
    R.PU.uDmg.value=0;this.ui(false)},
  // the screen effects of the one who went down (the red of his wounds, a zombie's sight, frost, infection) are not the killer's
  post(){const U=R.PU;U.uDmg.value=0;U.uZ.value=0;U.uNV.value=0;U.uFrost.value=0;U.uInfect.value=0;U.uWhite.value=0},
  fxClear(){FX.A.P.length=0;FX.B.P.length=0;if(FX.sp)FX.sp.list.length=0;if(FX.tr)FX.tr.list.length=0;FX.emitters.length=0},
  // what happened between two moments of the record, again
  runTo(b){const E=this.E,kid=this.pk.kid;this.rp=true;
    try{while(this.ei<E.length&&E[this.ei].t<=b){const e=E[this.ei++],q=e.p;
      switch(e.k){case 'p':FX.spawn(q);break;case 'k':FX.spark.apply(FX,q);break;case 'r':FX.tracer.apply(FX,q);break;
        case 'l':DL.add.apply(DL,q);break;case 'a':AU.at(q[0],q[1],q[2],q[3],Object.assign({},q[4]));break;case 'f':AU.stepAt(q[0],q[1],q[2],q[3],Object.assign({},q[4]));break;
        case 's':if(e.id===kid&&VM.cur)VM.fire(e.W,e.side);if(e.snd)AU.at(e.snd,e.x,e.y,e.z,{vol:.95,range:70});break;
        case 'm':if(e.id===kid&&VM.cur)VM.melee(e.heavy);break;case 'n':if(e.id===kid&&VM.cur&&VM.throwNade)VM.throwNade(false);break}}}
    catch(err){console.error(err)}finally{this.rp=false}},
  // ---------- the record at the moment played: every character between its two nearest frames ----------
  sample(){const t=this.pt;let lo=0,hi=this.fn-1;if(hi<0)return;
    while(lo<hi){const m=(lo+hi+1)>>1;if(this.fr(m).t<=t)lo=m;else hi=m-1}
    const f0=this.fr(lo),f1=lo+1<this.fn?this.fr(lo+1):f0,w=f1===f0?0:clamp((t-f0.t)/Math.max(1e-4,f1.t-f0.t),0,1);
    if(!f1.ix){f1.ix=new Map();for(let i=0;i<f1.n;i++)f1.ix.set(f1.A[i].id,f1.A[i])}
    const S=this.S;S.clear();let k=0;
    for(let i=0;i<f0.n;i++){const r0=f0.A[i],r1=f1.ix.get(r0.id)||r0;let s=this.SP[k];if(!s)s=this.SP[k]={st:{},fy:[0,0,0,0],tn:[0,0,0,0]};k++;
      const jump=Math.hypot(r1.x-r0.x,r1.z-r0.z)>4||r1.key!==r0.key||r1.vis!==r0.vis,u=jump?(w<.5?0:1):w,n=u<.5?r0:r1;
      for(const key in n)if(key!=='st'&&key!=='fy'&&key!=='tn')s[key]=n[key];
      s.x=lerp(r0.x,r1.x,u);s.y=lerp(r0.y,r1.y,u);s.z=lerp(r0.z,r1.z,u);s.ey=lerp(r0.ey,r1.ey,u);s.yaw=r0.yaw+wrapA(r1.yaw-r0.yaw)*u;s.pitch=lerp(r0.pitch,r1.pitch,u);
      s.pp=lerp(r0.pp,r1.pp,u);s.py=lerp(r0.py,r1.py,u);s.ph=lerp(r0.ph,r1.ph,u);s.vx=lerp(r0.vx,r1.vx,u);s.vz=lerp(r0.vz,r1.vz,u);
      for(let j=0;j<4;j++)s.tn[j]=n.tn[j];
      if(n.vis){const a0=r0.vis?r0.st:n.st,a1=r1.vis?r1.st:n.st;Object.assign(s.st,n.st);
        for(const key of this.NUM){const x=a0[key],y=a1[key];if(typeof x!=='number'||typeof y!=='number')continue;s.st[key]=this.JUMP[key]&&Math.abs(y-x)>.5?(u<.5?x:y):lerp(x,y,u)}
        // between the last frame alive and the first one down: the fall from its start (a living body's deadT and deadDir are the last death's)
        if(r0.alive&&!r1.alive){s.st.deadT=a1.deadT;s.st.deadDir=a1.deadDir}
        const y0=r0.vis?r0.fy:n.fy,y1=r1.vis?r1.fy:n.fy;s.fy[0]=y0[0]+wrapA(y1[0]-y0[0])*u;s.fy[1]=y0[1]+wrapA(y1[1]-y0[1])*u;s.fy[2]=lerp(y0[2],y1[2],u);s.fy[3]=lerp(y0[3],y1[3],u);s.st.footYaw=s.fy}
      S.set(s.id,s)}},
  // ---------- drawing it ----------
  // the camera at the killer's eye, along his aim (the kick of his shots included), his zoom; a quick fade from and to black
  cam(dt,cam){const k=this.S.get(this.pk.kid);let fov=CFG.fov;
    if(!k){const v=this.S.get(this.pk.pid);if(v){cam.position.set(v.x+2.6,v.y+2.2,v.z+2.6);cam.lookAt(v.x,v.y+.8,v.z)}R.vmVisible=false;return fov}
    const yaw=k.yaw+k.py*.6,pitch=k.pitch+k.pp*.6,q=1-Math.exp(-dt*28);
    this.cy=this.cy==null?yaw:this.cy+wrapA(yaw-this.cy)*q;this.cp=this.cp==null?pitch:lerp(this.cp,pitch,q);
    cam.position.set(k.x,k.ey,k.z);cam.rotation.set(this.cp,this.cy,0,'YXZ');
    const W=WPN[k.cur];if(k.zoom>0&&W&&W.zoom)fov=W.zoom[Math.min(k.zoom,W.zoom.length)-1];R.vmVisible=!(k.zoom>0)&&!!VM.cur&&k.alive;
    const fin=clamp(this.real/.16,0,1),fout=this.pt>=this.t1-1e-4?clamp(1-this.left/.18,0,1):1;R.PU.uDeath.value=(1-Math.min(fin,fout))*.95;
    if(this.pt>=this.pk.tD&&!this.kx){this.kx=1;R.PU.uDmg.value=.55}return fov},
  // the killer's gun in the view model: what he held, switched when he switched; fed his movement and aim from the record
  vmFor(k,first){const id=k.team===TZ?'claw':k.cur,skin=k.team===TZ?'z_'+k.zc:k.skin;if(!id||!WPN[id]||!skin)return false;
    if(VM.id!==id||VM.skin!==skin){VM.set(id,skin);VM.draw(first?0:.3)}else if(first)VM.draw(0);return true},
  vmTick(dt){const U=R.PU;U.uZ.value=0;U.uNV.value=0;U.uFrost.value=0;U.uInfect.value=0;const k=this.S.get(this.pk.kid);if(!k||!this.vmFor(k,false)){VM.vis=false;return}VM.vis=true;
    const base=this.pk.k&&G.actors.includes(this.pk.k)?this.pk.k:{};if(!this.px||this.pxB!==base){this.px=Object.create(base);this.pxB=base;this.px.c={};this.px.an={};this.px.ammo={}}
    const x=this.px;x.yaw=k.yaw;x.pitch=k.pitch;const c=x.c;c.x=k.x;c.y=k.y;c.z=k.z;c.vx=k.vx;c.vy=0;c.vz=k.vz;c.onGround=k.og;x.an.spr=k.st.sprint||0;x.an.mvS=k.st.mvS||0;x.an.cr=k.st.crouch||0;
    x.stepPh=k.ph;x.flash=k.fl;x.spinV=k.sv||0;x.hamB=false;x.dualB=false;x.ammo[VM.id]={mag:1,res:1};
    try{VM.update(dt,x,R.cam)}catch(e){if(!this.vmErr){this.vmErr=1;console.error(e)}}},
  char(s){const key=s.id+'|'+s.key;let rc=this.C.get(key);if(!rc){rc=makeChar(s.key);rc.gId=null;this.C.set(key,rc)}if(!rc.grp.parent)R.scene.add(rc.grp);return rc},
  // the live bodies (and thrown grenades) are hidden for the frame — the game updates them underneath; copies posed from the record are drawn
  pose(dt){for(const a of G.actors)if(a.ch)a.ch.grp.visible=false;for(const n of NADES)if(n.mesh&&n.mesh.visible){n.mesh.visible=false;n._kcH=1}
    this.later(dt);
    for(const rc of this.C.values())rc.used=false;const kid=this.pk.kid,cp=R.cam.position;
    // (not the killer's own body, dead or alive: the camera is his eye — in a trade it would sit inside him as he falls)
    for(const s of this.S.values()){if(!s.vis||s.id===kid)continue;let rc;try{rc=this.char(s)}catch(e){continue}rc.used=true;const st=s.st;
      if(s.team===TZ)poseZombie(rc,st);else poseHuman(rc,st);rc.hide=s.hide;rigCompute(rc);
      rc.grp.position.set(s.x,s.y,s.z);rc.grp.rotation.y=s.yaw;rc.grp.visible=true;
      const dc=Math.hypot(s.x-cp.x,s.y+1-cp.y,s.z-cp.z),g=dc<14?rc.A.geo:rc.A.geoLo;if(rc.mesh.geometry!==g)rc.mesh.geometry=g;
      const U=rc.mat.uniforms;sampleProbe(s.x,s.y+1.1,s.z,_kcP);U.uProbe.value.copy(_kcP).multiplyScalar(1.25);U.uFlash.value=s.flash||0;U.uTint.value.set(s.tn[0],s.tn[1],s.tn[2],s.tn[3]);U.uEmisA.value=s.em||1;
      this.gun(rc,s);rc.grp.updateMatrixWorld(true);if(s.id===this.pk.pid){charHead(rc,_kcV);this.vh=_kcV.clone()}}
    for(const rc of this.C.values())if(!rc.used)rc.grp.visible=false},
  // what was not there yet at the moment played: a weapon dropped later, a supply box that fell later (their ages tell): hidden until
  // the replay reaches the moment it came (the gun a human let fall as he turned shows from the moment he turned)
  objs(){const L=[];if(typeof DROPS!=='undefined')for(const d of DROPS.list)L.push([d,d.mesh,null]);if(typeof SUP!=='undefined'&&SUP.list)for(const b of SUP.list)L.push([b,b.mesh,b.chute]);return L},
  later(dt){const t=this.pt,now=G.t;
    for(const [o,m1,m2] of this.objs()){if(now-(o.t||0)>t+.05){for(const m of [m1,m2])if(m&&m.visible){m.visible=false;o._kcH=1}if(o._kcH&&o.light)o.light.i=0}else if(o._kcH){o._kcH=0;for(const m of [m1,m2])if(m)m.visible=true}}},// (a landed box's beacon, supply.js, blinks again on its next tick)
  unhide(){for(const [o,m1,m2] of this.objs())if(o._kcH){o._kcH=0;for(const m of [m1,m2])if(m)m.visible=true}},
  gun(rc,s){const want=s.team===TH?s.gm:null;
    if(rc.gId!==want){for(const g of [rc.g1,rc.g2])if(g)rc.grp.remove(g);rc.g1=rc.g2=null;rc.gId=want;
      if(want){const [m,two]=want.split('+');if(GUNS[m]){if(!rc.gMat)rc.gMat=matGun();const g1=new THREE.Mesh(gunGeo(m),rc.gMat);g1.matrixAutoUpdate=false;rc.grp.add(g1);rc.g1=g1;
        if(two){const g2=new THREE.Mesh(gunGeo(GUNS[m].alt||m),rc.gMat);g2.matrixAutoUpdate=false;rc.grp.add(g2);rc.g2=g2}}}}
    if(rc.g1){rc.g1.visible=!!rc.gunOn;if(rc.gunOn){rc.g1.matrix.multiplyMatrices(rc.M[1],rc.gunM);rc.gMat.uniforms.uProbe.value.copy(rc.mat.uniforms.uProbe.value)}}
    if(rc.g2){rc.g2.visible=!!rc.gunOn2;if(rc.gunOn2)rc.g2.matrix.multiplyMatrices(rc.M[1],rc.gunM2)}},
  // ---------- on screen: the band at the top and bottom, who and with what, the progress, the killer's sight, you ----------
  ui(on){const hud=$('hud');if(!hud)return;let el=$('kcam');
    if(!el){el=document.createElement('div');el.id='kcam';el.innerHTML='<div class="kcb kct"><span class="kcl"><i></i><b></b></span><span class="kch"></span></div><div class="kcb kcd"><div class="kcc"><b class="kcn"></b><span class="kcw"></span><span class="kci"></span></div><button class="kcs" data-kc="skip"></button><div class="kcp"><i></i></div></div><div class="kcx"><i></i><i></i><i></i><i></i></div><div class="kcv"></div>';
      hud.appendChild(el);el.querySelector('.kcs').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();this.skip()})}
    hud.classList.toggle('kc',on);el.classList.toggle('on',on);const tc=$('touch');if(tc)tc.classList.toggle('kc',on);if(!on){el.classList.remove('kill');return}
    const L=LI(),p=this.pk,W=WPN[p.w];el.querySelector('.kcl b').textContent=L?'KILLCAM':'킬캠';el.querySelector('.kch').textContent=L?'how you went down':'쓰러진 순간 다시 보기';
    const n=el.querySelector('.kcn');n.textContent=p.name||'?';n.className='kcn '+p.cls;n.style.color=p.col||'';el.querySelector('.kcw').textContent=W&&W.n?W.n[L]:'';
    const bits=[];if(p.alive)bits.push(L?`${p.hp} HP left`:`남은 체력 ${p.hp}`);bits.push(`${p.d} m`);if(p.hs)bits.push(L?'headshot':'헤드샷');
    el.querySelector('.kci').innerHTML=bits.map((b,i)=>`<span${p.hs&&i===bits.length-1?' class="hs"':''}>${esc(b)}</span>`).join('');
    el.querySelector('.kcs').textContent=(typeof TOUCH!=='undefined'&&TOUCH.on)?(L?'Skip ▸':'건너뛰기 ▸'):(L?'Skip · Space':'건너뛰기 · Space');el.classList.remove('kill')},
  hud(dt){if(!this.on)return;const el=$('kcam'),e=HUD.el;if(!el)return;
    el.querySelector('.kcp i').style.width=(clamp((this.pt-this.t0)/Math.max(.01,this.t1-this.t0),0,1)*100).toFixed(1)+'%';
    const k=this.S.get(this.pk.kid),W=k&&WPN[k.cur],zm=!!(k&&k.zoom>0&&W&&W.zoom);if(e&&e.scope){e.scope.style.display=zm?'block':'none';if(zm)e.scope.className=W.kind==='sniper'?'':'r'}
    el.querySelector('.kcx').style.display=zm||!k||k.team===TZ?'none':'block';if(this.kx)el.classList.add('kill');
    // you, in the scene: a marker over your head
    const v=$('kcam').querySelector('.kcv'),s=this.S.get(this.pk.pid);let show=false;
    if(s&&s.vis&&this.vh){_kcV.copy(this.vh);_kcV.y+=.42;_kcV.project(R.cam);if(_kcV.z<1&&Math.abs(_kcV.x)<1.1&&Math.abs(_kcV.y)<1.1){show=true;v.style.transform=`translate(${((_kcV.x*.5+.5)*innerWidth).toFixed(1)}px,${((-_kcV.y*.5+.5)*innerHeight).toFixed(1)}px)`}}
    v.style.display=show?'block':'none';if(show&&!v.textContent)v.textContent=LI()?'YOU':'나'}};

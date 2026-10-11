'use strict';
// ============ Episode 1 「알레프」: the boss ALEPH (Q7-000), the straitjacket zombie, red floor warnings, the arena's devices ============
// episode.js runs the story (zones, goals, lives, the escape); this file is what fights in it. Host-authoritative like the rest of the
// scenario: the host runs every pattern and every hit; clients get the boss's gauges in the episode snapshot (EP.pack) and the
// patterns as events: 'epx' (wind-ups, slams, throws, grabs, the shield, the tank) and 'ept' (red floor warnings).
// ALEPH has 27,000 × (0.6 + 0.4 × humans) × difficulty health. Rage fills with the damage it takes (+3 per 1 % of its health, ×1.5 in
// phase 3); at 100 it goes berserk for 10 s (+40 % speed, skills 40 % sooner, −20 % damage taken), then is spent for 4 s (+30 % damage
// taken). The orange serum tank on its back takes ×2.5 and holds 10 % of its health: breaking it floors it for 8 s and ends the rage
// for good. The stagger gauge (tank hits, HE +15, frost +10, a pillar panel shot while it stands next to it +35, a charge into a wall
// +20) floors it for 6.5 s (×1.5 damage) and fills 25 % slower each time. At 60 % it tears the north bulkhead out and carries it as a
// shield (bullets from the front 110° −85 %, the shield has 12 % of its health, HE ×3 on it, breaking it floors it for 6 s); at 25 %
// it drops it, the lights die and it goes wild. Every phase change is 3.5 s of invulnerability and gets the whole team back up.
// Its blows (v6.22.1, harder): claws 22 / 34, the charge 38 (+25 pinned against a wall; faster and longer, 4.5 s apart, straight into a
// slam when someone is close — phase 1 about half the time, later nearly always; phase 3 often charges a second time), slams 18–48
// within 8 m (from phase 2 on each sends a shockwave out over the floor to 15 m: 24 to whoever is on the ground when it passes — jump
// it), the thrown slab 40 (now in phase 2 too; three at once in phase 3: one at you, one either side), the shield smash 52, the three hops 22–34 (the
// last one sends a shockwave). Less standing about between moves.
// (EPD, EPTW, TELE and the other shared toys: epbase.js; the chapter's definition CHAP[1] is at the end of this file)
const AL_PH=[1,.6,.25];// health at the start of each phase

// ---------- atlas materials (the weapon atlas's last two free slots) ----------
const EPA_MATS=['epTank','epConc'];
for(const m of EPA_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintEpAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // serum: glowing orange liquid, bubbles, a darker band where the glass is strapped
  patch('epTank',(xx,y,X,Y)=>{const t=nz(X,Y,91,10);let c=t>.62?'#ffd27a':t>.46?'#ff9a2a':'#e2680e';if(hash2(X,Y,92)<.025)c='#fff2c4';if(y%42<3)c='#a8400a';return c},232);
  // torn concrete: grey, pitted, a few rust stains
  patch('epConc',(xx,y,X,Y)=>{const t=nz(X,Y,93,12);let c=t>.6?'#8a8a86':t<.4?'#5c5c5a':'#737371';if(hash2(X,Y,94)<.035)c='#3e3e3c';if(hash2(X,Y,95)<.004)c='#6a3a20';return c});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintEpAtlas()}}

// ---------- models (props drawn with the weapon material) ----------
Object.assign(GUNS,{
  // the serum tank on ALEPH's back (origin at its centre, long axis up; the rig's scale makes it big)
  epTank:{parts:[Pt(0,0,0,.2,.4,.2,'epTank',{r:.09}),Pt(0,.215,0,.23,.05,.23,'forged',{r:.04}),Pt(0,-.215,0,.23,.05,.23,'forged',{r:.04}),Pt(0,.255,0,.06,.05,.06,'gunmetal',{r:.02}),
    Pt(.104,0,0,.014,.38,.035,'forged'),Pt(-.104,0,0,.014,.38,.035,'forged'),Pt(0,0,.104,.035,.38,.014,'forged'),Pt(0,.27,-.07,.03,.03,.16,'gunmetal',{rx:.5})],grip:[0,0,0],muzzle:[0,0,0]},
  // a leaf of the B4 bulkhead, torn out of its frame: thick steel, the hazard band, rivets, a bent corner
  epShield:{parts:[Pt(0,0,0,1.02,1.42,.07,'forged',{r:.012}),Pt(0,.6,-.04,1.02,.14,.012,'yellow'),Pt(0,.6,-.047,1.02,.04,.004,'blk'),Pt(0,-.62,-.04,1.02,.08,.012,'blk2'),
    ...[-.42,-.14,.14,.42].flatMap(x=>[Pt(x,.36,-.042,.035,.035,.012,'bright',{r:.01}),Pt(x,-.4,-.042,.035,.035,.012,'bright',{r:.01})]),
    Pt(.45,-.62,-.02,.2,.2,.08,'forged',{rz:.5}),Pt(0,0,.05,.12,.5,.06,'gunmetal'),Pt(-.3,.05,-.04,.5,.06,.01,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  // a slab of concrete ripped out of the floor, rebar sticking out
  epRock:{parts:[Pt(0,0,0,1.3,.9,1.2,'epConc',{r:.14}),Pt(.28,.32,.18,.62,.42,.5,'epConc',{r:.1,ry:.4}),Pt(-.35,.2,-.3,.5,.5,.4,'epConc',{r:.1,rx:.3}),
    Pt(-.42,.5,.1,.03,.5,.03,'rub',{rz:.3}),Pt(.4,.42,-.3,.03,.45,.03,'rub',{rx:-.4})],grip:[0,0,0],muzzle:[0,0,0]}});

// ---------- the restraints: four heavy chains from the pit's corner eyes to ALEPH while it waits (every page) ----------
// one 7 m chain model (links alternating flat / upright), stretched a little to whatever the gap is
GUNS.epChain={parts:(()=>{const P=[],n=29,s=.27,w=.16,t=.045;for(let i=0;i<n;i++){const z=i*s+s/2,e=w/2-t/2;
  if(i%2)P.push(Pt(0,e,z,t,t,s+.03,'gunmetal'),Pt(0,-e,z,t,t,s+.03,'gunmetal'));else P.push(Pt(e,0,z,t,t,s+.03,'forged'),Pt(-e,0,z,t,t,s+.03,'forged'))}return P})(),grip:[0,0,0],muzzle:[0,0,0]};
const CHAIN={m:[],L:29*.27,A:[[-5.9,.2,46.1],[5.9,.2,46.1],[-5.9,.2,57.9],[5.9,.2,57.9]],_w:new THREE.Matrix4(),_v:new THREE.Vector3(),
  on(){return EP.on&&EP.id===1&&EP.st===4&&EP.ph==='prep'&&EP.bossPh===1},
  // (from ALEPH.attach, once its rig is posed for the frame)
  sync(a){const ch=a.ch;if(!this.on()||!a.alive||!ch.grp.visible||!ch.M)return;
    if(!this.m.length)for(let i=0;i<4;i++){const m=new THREE.Mesh(gunGeo('epChain'),matGun());m.frustumCulled=false;R.scene.add(m);this.m.push(m)}
    const o=ch.A.def.o;this._w.multiplyMatrices(ch.grp.matrixWorld,ch.M[1]);
    for(let i=0;i<4;i++){const m=this.m[i],p=this.A[i];this._v.set((p[0]<0?-1:1)*(o.torsoW*.5+.03),o.torsoH*(p[2]<52?.62:.3),0).applyMatrix4(this._w);
      m.position.set(p[0],p[1],p[2]);m.lookAt(this._v);m.scale.set(1,1,m.position.distanceTo(this._v)/this.L);
      sampleProbe((p[0]+this._v.x)/2,1.2,(p[2]+this._v.z)/2,m.material.uniforms.uProbe.value)}},
  // (every frame) gone when the wait ends: snapped with sparks if it broke free, quietly otherwise
  tick(){if(this.m.length&&!this.on())this.off(EP.on&&EP.st===4&&EP.ph==='run')},
  off(snap){for(const m of this.m){if(snap){const e=new THREE.Vector3(0,0,this.L).applyMatrix4(m.matrixWorld);
        for(let i=0;i<10;i++){const k=Math.random(),x=lerp(m.position.x,e.x,k),y=lerp(m.position.y,e.y,k),z=lerp(m.position.z,e.z,k);
          FX.spawn({x,y,z,vx:rr(-3,3),vy:rr(1,4),vz:rr(-3,3),life:rr(.2,.45),s0:.06,s1:.02,r:1,g:.8,b:.45,f:0,grav:9,add:1});if(i<4)FX.spawn({x,y,z,vx:rr(-2,2),vy:rr(2,4),vz:rr(-2,2),life:rr(.8,1.3),s0:.09,r:.3,g:.3,b:.32,f:7,grav:12,col:.3})}
        AU.at('imp_metal',e.x,e.y,e.z,{vol:.9,range:50})}
      R.scene.remove(m);m.material.dispose()}this.m=[]}};

// ---------- thrown slabs: they fly, land, and stay 20 s as cover ----------
const ROCK={list:[],id:0,
  throw(x0,y0,z0,tx,ty,tz,T,id){const vx=(tx-x0)/T,vz=(tz-z0)/T,vy=(ty+.45-y0)/T+.5*GRAV*T;const m=new THREE.Mesh(gunGeo('epRock'),matGun());m.position.set(x0,y0,z0);R.scene.add(m);
    const K={id:id||++ROCK.id,m,x0,y0,z0,vx,vy,vz,t:0,T,tx,ty,tz,land:false,life:20,box:null,sp:rr(-4,4)};this.list.push(K);return K},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const K=this.list[i];
      if(!K.land){K.t+=dt;const t=Math.min(K.t,K.T),x=K.x0+K.vx*t,y=K.y0+K.vy*t-.5*GRAV*t*t,z=K.z0+K.vz*t;K.m.position.set(x,y,z);K.m.rotation.x+=K.sp*dt;K.m.rotation.z+=K.sp*.6*dt;
        sampleProbe(x,y,z,K.m.material.uniforms.uProbe.value);if(Math.random()<dt*20)FX.spawn({x,y,z,vx:rr(-.3,.3),vy:rr(-.2,.3),vz:rr(-.3,.3),life:rr(.4,.8),s0:.15,s1:.5,r:.5,g:.48,b:.44,a:.4,f:2,drag:1.5});
        if(K.t>=K.T)this.land(K)}
      else if(!NET.cli){K.life-=dt;if(K.life<=0){this.remove(K);if(NET.host)netEv('epx',{k:'rkx',id:K.id})}}}},
  land(K){K.land=true;K.m.position.set(K.tx,K.ty+.45,K.tz);K.m.rotation.set(0,Math.random()<.5?0:Math.PI,0);sampleProbe(K.tx,K.ty+1,K.tz,K.m.material.uniforms.uProbe.value);
    for(let i=0;i<30;i++){const g=i/30*TAU;FX.spawn({x:K.tx+Math.cos(g)*.8,y:K.ty+.2,z:K.tz+Math.sin(g)*.8,vx:Math.cos(g)*rr(3,6),vy:rr(.5,2),vz:Math.sin(g)*rr(3,6),life:rr(.6,1.1),s0:.35,s1:1.2,r:.5,g:.47,b:.42,a:.55,f:2,drag:2.4})}
    for(let i=0;i<14;i++)FX.spawn({x:K.tx,y:K.ty+.5,z:K.tz,vx:rr(-4,4),vy:rr(2,6),vz:rr(-4,4),life:rr(.6,1.2),s0:.07,s1:.06,r:.42,g:.4,b:.38,f:7,grav:14,col:.3});
    AU.at('explode',K.tx,K.ty+.4,K.tz,{vol:.8,range:70,occ:false,rate:.55});const P=G.player;if(P){const d=Math.hypot(P.c.x-K.tx,P.c.z-K.tz);if(d<14)FX.shake=Math.max(FX.shake,.7-d/20)}
    if(NET.cli)return;
    const b=EP.bossA();for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-K.tx,dz=h.c.z-K.tz,d=Math.hypot(dx,dz);if(d>3.5||Math.abs(h.c.y-K.ty)>2.5)continue;
      SCEN.pushHuman(h,dx/(d||1)*7,5,dz/(d||1)*7);h.dizzy=Math.max(h.dizzy,1.2);hurtHuman(h,EPD(40),b,{})}
    // it stays as cover unless it would bury somebody
    const B=this.boxOf(K);let ok=true;for(const a of G.actors){if(!a.alive)continue;const c=a.c;if(c.x+c.hw>B.x0&&c.x-c.hw<B.x1&&c.z+c.hw>B.z0&&c.z-c.hw<B.z1&&c.y<B.y1&&c.y+c.h>B.y0){ok=false;break}}
    if(ok)this.box(K);if(NET.host)netEv('epx',{k:'rkl',id:K.id,b:ok?1:0})},
  boxOf(K){return {x0:K.tx-.65,x1:K.tx+.65,y0:K.ty,y1:K.ty+.9,z0:K.tz-.6,z1:K.tz+.6,o:{},mat:'conc'}},
  box(K){if(K.box)return;K.box=this.boxOf(K);worldAddDyn(K.box)},
  remove(K){const i=this.list.indexOf(K);if(i>=0)this.list.splice(i,1);if(K.box)worldRemoveDyn(K.box);R.scene.remove(K.m);K.m.material.dispose();
    for(let k=0;k<12;k++)FX.spawn({x:K.tx+rr(-.5,.5),y:K.ty+rr(.1,.8),z:K.tz+rr(-.5,.5),vx:rr(-.3,.3),vy:rr(0,.5),vz:rr(-.3,.3),life:rr(.6,1.2),s0:.25,s1:.8,r:.45,g:.43,b:.4,a:.45,f:2,drag:1.5})},
  byId(id){return this.list.find(K=>K.id===id)||null},
  clear(){for(const K of this.list.slice())this.remove(K)}};

// ---------- steam valves: a cloud that ALEPH cannot see through to throw ----------
const STEAM={list:[],
  start(i){const V=MAP.ez&&MAP.ez.valves[i];if(!V)return;const fx=V.x<0?1:-1,C={i,x:V.x,y:V.y,z:V.z,cx:V.x+fx*3.2,cz:V.z,r:4.2,t:7};const o=this.list.find(s=>s.i===i);
    if(o)Object.assign(o,C);else this.list.push(C);AU.at('salgust',V.x,V.y,V.z,{vol:1,range:45,rate:.55})},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const S=this.list[i];S.t-=dt;if(S.t<=0){this.list.splice(i,1);continue}const k=Math.min(1,S.t/1.5);
      for(let n=0;n<3;n++)if(Math.random()<dt*22*k)FX.spawn({x:S.x,y:S.y,z:S.z,vx:(S.cx-S.x)*rr(.6,1.2)+rr(-.4,.4),vy:rr(-.2,.9),vz:rr(-1.6,1.6),life:rr(1.8,2.8),s0:.4,s1:rr(2.6,3.6),r:.84,g:.86,b:.88,a:.42,f:2,drag:1.2,lit:1})}},
  at(x,z){for(const S of this.list)if(S.t>.5&&Math.hypot(x-S.cx,z-S.cz)<S.r)return true;return false},
  clear(){this.list=[]}};

// ---------- ALEPH ----------
const ALEPH={props:[],encNext:false,
  zc:'aleph',name:['알레프','ALEPH'],code:'Q7-000',ticks:[60,25],g2:['분노','RAGE'],darkPh:3,
  wake:['알레프 각성까지','ALEPH wakes in'],goText:['알레프가 구속을 끊었다!','ALEPH BREAKS ITS CHAINS'],deadText:['알레프 무력화 — 엘리베이터로!','ALEPH IS DOWN — GET TO THE LIFT'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(27000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.al&&a.al.enc)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: chained in the pit (a phase replay puts it back there at that phase's health)
  prepSpawn(kind,bp){let b=EP.bossA();const C=MAP.ez.boss.ctr;if(!b)b=this.spawn([C[0],-.8,C[2]],Math.PI,false);else if(kind!=='phase')this.init(b,false);
    if(b){if(kind==='phase')this.reset(b,bp);placeAt(b,C[0],-.8,C[2],Math.PI);b.yaw=Math.PI;b.al.idle=true}},
  go(b){if(b.al){b.al.idle=false;b.al.pt=1.2;this.fx({k:'w',i:b.id,s:1.4,n:1})}},
  // the first meeting in the lab corridor: through the specimen lab's wall, a charge or two, gone at −10 % (or after 35 s)
  meetStart(E){EP.setGates(EP.gm|EP.bit('gW'),true);this.fx({k:'brk'});const W=MAP.ez.wallW;
    const a=this.spawn([W[0],0,W[2]-1.9],Math.PI,true);if(a){E.a=a;a.al.idle=false;a.al.pt=.6;this.fx({k:'w',i:a.id,s:1.3,n:1})}
    EP.say('enc');EP.later(2.2,()=>EP.say('enc2'))},
  meetTick(E){const a=E.a;if(a&&a.alive&&a.al&&E.t>35)this.floorHit(a);if(!a||!a.alive)E.st='done'},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.al)this.floorHit(E.a)},
  botGoal(a,i){const b=EP.bossA();if(!b)return null;const an=i*1.9+Math.floor(G.t/6)*.7;return [clamp(b.c.x+Math.cos(an)*12,-19,19),0,clamp(b.c.z+Math.sin(an)*12,33,71),1.5]},
  update(dt){ROCK.update(dt);STEAM.update(dt);CHAIN.tick()},
  stageClear(kind){if(kind!=='next')ROCK.clear();STEAM.clear()},
  // the boss bar: the gauges and what it is doing (flags: 1 shield, 2 tank broken, 4 rage, 8 spent, 16 down, 32 invulnerable, 64 enraged, 128 first meeting)
  bsOf(b){const S=b.al;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,rage:S.rage,
    f:(S.shield?1:0)|(S.tankB?2:0)|(S.frT>0?4:0)|(S.exT>0?8:0)|(S.mode==='down'||S.mode==='stun'?16:0)|(S.invT>0&&!S.enc?32:0)|(S.enr?64:0)|(S.enc?128:0),sh:S.shMax>0?S.sh/S.shMax*100:0,tank:S.tankMax>0?S.tank/S.tankMax*100:0}},
  bsPack(b){if(!b.al)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),Math.round(B.rage),B.f,Math.round(B.sh),Math.round(B.tank)]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],rage:B[4],f:B[5],sh:B[6],tank:B[7]}},
  hud(B,L){const f=B.f;
    return {ss:f&32?(L?'INVULNERABLE':'무적'):f&16?(L?'DOWN!':'그로기!'):f&4?(L?'RAGE!':'분노 폭주!'):f&8?(L?'SPENT — hit it!':'탈진 — 몰아쳐!'):f&1?(L?'SHIELD ':'방패 ')+Math.max(0,B.sh|0)+'%':f&64?(L?'ENRAGED':'광폭화'):'',
      cls:f&4?'r':f&16||f&8?'y':'',sp:(f&128?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&2?(L?' · TANK BROKEN':' · 탱크 파괴'):''),
      g1:B.grog/(B.gmax||100),g2:f&2||f&128?null:B.rage/100}},
  // (a panel lights up while ALEPH stands next to it; the steam valves show when they are close)
  markers(list,L,P){const M=MAP.ez,b=EP.bossA();for(const p of M.panels)if(!p.used){const hot=b&&Math.hypot(b.c.x-p.x,b.c.z-p.z)<4.8;list.push([p.x,p.y+.9,p.z,hot?(L?'⚡ SHOOT IT!':'⚡ 지금 쏴!'):(L?'⚡ panel':'⚡ 패널'),hot?'p hot':'p'])}
    for(const v of M.valves)if(Math.hypot(v.x-P.c.x,v.z-P.c.z)<16)list.push([v.x,v.y+.8,v.z,L?'steam':'증기','s'])},
  // the boss slot of the pool comes back as ALEPH (no get-up: it is already standing, chained in the pit or behind a lab wall)
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='aleph';a.deadT=99;this.encNext=!!enc;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){const m=a.maxHp||1,tb=!!(a.al&&a.al.tankB&&!enc);
    a.al={ph:1,mode:'',mt:0,pt:2,cd:{ch:2.5,sl:1,th:7,lp:0,sc:3,sm:4,su:12,tr:3,ro:7},rage:0,frT:0,exT:0,grog:0,grogN:0,grogMax:100,
      tankMax:m*.1,tank:tb?0:m*.1,tankB:tb,shield:false,shMax:m*.12,sh:0,invT:0,enr:false,fightT:0,slowT:0,enc:!!enc,idle:!enc,
      dx:0,dz:-1,hits:null,lx:a.c.x,lz:a.c.z,stuck:0,far:0,blk:0,chT:0,trN:0,sc:false,tg:null};
    a.epDown=0;a.epShield=false;a.epTankB=tb},
  // a retry of the boss fight starts the phase it reached again, at that phase's health
  reset(a,ph){const tb=a.al&&a.al.tankB;a.hp=a.maxHp*AL_PH[ph-1];this.init(a,false);const S=a.al;S.ph=ph;S.idle=true;S.tankB=!!tb;if(tb)S.tank=0;
    if(ph===2){S.shield=true;S.sh=S.shMax}a.leapV=null;a.kvx=a.kvz=0;a.frozen=0},
  start(a,mode,mt){a.al.mode=mode;a.al.mt=mt},
  face(a,x,z){a.yaw=Math.atan2(-(x-a.c.x),-(z-a.c.z))},
  // a ballistic leap (scenario.js) that tells how long it will be in the air
  leap(a,x,y,z,over){const c=a.c,apex=Math.max(c.y,y)+(over||1.2),vy=Math.sqrt(2*GRAV*Math.max(.5,apex-c.y));SCEN.leapTo(a,x,y,z,over);return vy/GRAV+Math.sqrt(2*Math.max(.1,apex-y)/GRAV)},
  // wind-ups and blows, broadcast (fxApply runs on every page)
  fx(m){this.fxApply(m);if(NET.host)netEv('epx',m)},
  // ---------- host: per frame ----------
  tick(a,dt){const S=a.al;if(!S)return;const c=a.c;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);
    // frost does not freeze it: a slow, a cold sap of rage and a little stagger
    if(a.frozen>0){a.frozen=0;c.vx=c.vz=0;S.slowT=S.enc?2:3;if(!S.enc){S.rage=Math.max(0,S.rage-20);this.grog(a,10)}this.fx({k:'fz',i:a.id})}
    if(S.frT>0){S.frT-=dt;if(S.frT<=0){S.exT=4;this.fx({k:'ex',i:a.id});EP.say('aExh')}}else if(S.exT>0){S.exT-=dt;if(S.exT<=0)S.rage=0}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone';if(live&&!S.enc)S.fightT+=dt;
    if(live&&!S.enc&&!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('aEnr')}
    const cdm=(S.frT>0?1/.6:1)*(S.enr?1/.7:1);for(const k in S.cd)S.cd[k]-=dt*cdm;
    a.spdMul=(S.ph===3?1.2:1)*(S.frT>0?1.4:1)*(S.enr?1.3:1)*(S.slowT>0?.6:1)*(S.exT>0?.75:1);
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return}
    if(!live)return;
    // wedged in a doorway, against a slab or a pillar corner: a jump at the target
    S.stuck+=dt;if(S.stuck>3){const mv=Math.hypot(c.x-S.lx,c.z-S.lz),t=a.bot&&a.bot.target;if(mv<.8&&t&&t.alive&&c.onGround){const T=this.leap(a,t.c.x,t.c.y,t.c.z,1.5);this.start(a,'lp',T+.5)}S.stuck=0;S.lx=c.x;S.lz=c.z}
    const t=a.bot&&a.bot.target;if(t&&t.alive&&(t.c.y>c.y+1.5||Math.hypot(t.c.x-c.x,t.c.z-c.z)>3.5))S.far+=dt;else S.far=0;
    S.pt-=dt;if(S.pt>0||!t||!t.alive)return;this.pick(a,t,S)},
  pick(a,t,S){const c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1,hy=c.y+3.6,see=losClear(c.x,hy,c.z,t.c.x,t.c.y+1.4,t.c.z),tw=EPTW();
    // up on a gallery (or somewhere it cannot walk to) for a while: one leap onto it
    if(see&&c.onGround&&!S.enc&&(S.far>3&&t.c.y>c.y+1.5||S.far>9)&&d<26&&S.cd.lp<=0&&losClear(c.x,hy,c.z,t.c.x,Math.max(hy,t.c.y+3),t.c.z)){S.cd.lp=6;S.tg=t;this.face(a,t.c.x,t.c.z);this.start(a,'lw',.75*tw);this.fx({k:'w',i:a.id,s:1,n:0});return}
    if(!see){S.pt=.4;return}
    const P=S.enc?1:S.ph;
    if(P===2){
      if(S.cd.su<=0){S.cd.su=25;this.start(a,'su',.9);this.fx({k:'w',i:a.id,s:1,n:1});return}
      if(d<10.5&&S.cd.sm<=0){S.cd.sm=8;this.smashW(a,t);return}
      const ft=this.far(a);if(ft&&S.cd.th<=0){S.cd.th=11;this.throwW(a,ft);return}
      if(d>5&&d<22&&S.cd.sc<=0){S.cd.sc=5.5;this.chargeW(a,t,true);return}
      if(d<5.5&&S.cd.sl<=0){S.cd.sl=3.5;this.slamW(a);return}
      S.pt=.35;return}
    if(P===3){
      if(S.cd.ro<=0&&this.near(a,15)){S.cd.ro=16;this.start(a,'rw',1.2*tw);this.fx({k:'w',i:a.id,s:1.2,n:1});return}
      if(d<13&&S.cd.tr<=0){S.cd.tr=9;S.tg=t;S.trN=0;this.start(a,'trw',.6*tw);this.fx({k:'w',i:a.id,s:1,n:0});return}
      if(d>6&&d<22&&S.cd.ch<=0){S.cd.ch=3.2;S.ch2=Math.random()<.65;this.chargeW(a,t,false);return}
      const ft=this.far(a);if(ft&&S.cd.th<=0){S.cd.th=7;this.throwW(a,ft);return}
      if(d<7.5&&S.cd.sl<=0){S.cd.sl=3.5;this.slamW(a);return}
      S.pt=.35;return}
    // phase 1 (and the first meeting in the corridor: charges and slams only)
    const ft=S.enc?null:this.far(a);if(ft&&S.cd.th<=0){S.cd.th=8;this.throwW(a,ft);return}
    if(d>6&&d<22&&S.cd.ch<=0){S.cd.ch=4.5;this.chargeW(a,t,false);return}
    if(d<8&&S.cd.sl<=0){S.cd.sl=3.5;this.slamW(a);return}
    S.pt=.35},
  near(a,r){for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<r&&Math.abs(h.c.y-a.c.y)<5)return true;return false},
  // a throw target: the farthest human 14 m or more away, in sight and not inside a steam cloud
  far(a){const c=a.c;let best=null,bd=14;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<bd||d>34||STEAM.at(h.c.x,h.c.z))continue;
      if(!losClear(c.x,c.y+4.2,c.z,h.c.x,h.c.y+1.2,h.c.z))continue;bd=d;best=h}return best},
  chargeW(a,t,sh){const S=a.al,c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1,tw=EPTW();S.dx=dx/d;S.dz=dz/d;S.sc=!!sh;this.face(a,t.c.x,t.c.z);const w=(S.ch2b?.45:.7)*tw;this.start(a,'cw',w);
    TELE.add({k:'r',x:c.x,y:c.y,z:c.z,yaw:a.yaw,w:sh?3.4:2.6,l:Math.min(22,18.5*(a.spdMul||1)+1),d:w});this.fx({k:'w',i:a.id,s:.7,n:0})},
  slamW(a){const c=a.c,tw=EPTW();this.start(a,'sw',.85*tw);TELE.add({k:'c',x:c.x,y:c.y,z:c.z,r:7.5,d:.85*tw});this.fx({k:'w',i:a.id,s:1,n:1})},
  smashW(a,t){const c=a.c,tw=EPTW();this.face(a,t.c.x,t.c.z);this.start(a,'smw',1*tw);TELE.add({k:'r',x:c.x,y:c.y,z:c.z,yaw:a.yaw,w:3,l:10,d:1*tw});this.fx({k:'w',i:a.id,s:1.3,n:1})},
  throwW(a,h){a.al.tg=h;this.face(a,h.c.x,h.c.z);this.start(a,'tw',1*EPTW());this.fx({k:'w',i:a.id,s:1,n:0})},
  triStep(a){const S=a.al,c=a.c,t=S.tg&&S.tg.alive?S.tg:(a.bot&&a.bot.target);let dx=0,dz=0;if(t&&t.alive){dx=t.c.x-c.x;dz=t.c.z-c.z}const d=Math.hypot(dx,dz)||1,st=Math.min(4,Math.max(0,d-2));
    const x=c.x+dx/d*st,z=c.z+dz/d*st,T=this.leap(a,x,c.y,z,.7);if(st>.1)this.face(a,x,z);TELE.add({k:'c',x,y:c.y,z,r:6,d:Math.max(.35,T)});this.start(a,'tr',Math.max(.45,T));this.fx({k:'w',i:a.id,s:1,n:1})},
  step(a,dt,S){const c=a.c;
    switch(S.mode){
    case 'cw':{a.an.skill=Math.max(a.an.skill,.6);a.yaw=Math.atan2(-S.dx,-S.dz);if(S.mt<=0){S.ch2b=false;this.start(a,'ch',1.1);S.hits=new Set();S.lx=c.x;S.lz=c.z;S.chT=0;S.blk=0;AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:80});if(NET.host)netEv('scbo',{k:0,i:a.id})}break}
    case 'ch':{const v=16.5*(a.spdMul||1);a.kvx=S.dx*v;a.kvz=S.dz*v;a.mvx=a.mvz=0;a.yaw=Math.atan2(-S.dx,-S.dz);S.chT+=dt;
      if(Math.random()<dt*30)FX.spawn({x:c.x+rr(-.6,.6),y:c.y+.1,z:c.z+rr(-.6,.6),vy:rr(.3,.9),life:rr(.5,.9),s0:.3,s1:1,r:.4,g:.36,b:.3,a:.5,f:2,drag:2});
      for(const h of SCEN.H){if(!h.alive||S.hits.has(h))continue;if(Math.hypot(h.c.x-c.x,h.c.z-c.z)<c.hw+(S.sc?1.7:1.2)&&Math.abs(h.c.y-c.y)<2.6){S.hits.add(h);let dm=38;
          if(S.sc&&rayCast(h.c.x,h.c.y+1,h.c.z,S.dx,0,S.dz,2.2))dm+=25;// pinned against a wall
          SCEN.pushHuman(h,S.dx*13,7,S.dz*13);hurtHuman(h,EPD(dm),a,{claw:1})}}
      // a wall or a pillar in the way: it slams into it and reels
      const mv=Math.hypot(c.x-S.lx,c.z-S.lz);S.lx=c.x;S.lz=c.z;if(S.chT>.15&&mv<v*dt*.3)S.blk+=dt;else S.blk=0;
      if(S.blk>.05){a.kvx=a.kvz=0;this.start(a,'stun',1.5);this.grog(a,20);this.fx({k:'wall',i:a.id,x:r2(c.x+S.dx*1.1),y:r2(c.y),z:r2(c.z+S.dz*1.1)});EP.say('aWall');break}
      if(S.mt<=0){a.kvx*=.2;a.kvz*=.2;S.mode='';S.pt=rr(.55,1);const P=S.enc?1:S.ph;
        if(S.ch2&&P===3){S.ch2=false;const t=a.bot&&a.bot.target;if(t&&t.alive&&Math.hypot(t.c.x-c.x,t.c.z-c.z)>4){S.ch2b=true;this.chargeW(a,t,false);break}}
        if(this.near(a,7)&&Math.random()<(P===1?.45:.85))this.slamW(a)}break}
    case 'sw':{a.an.skill=Math.max(a.an.skill,.3);if(S.mt<=0){S.mode='';S.pt=rr(.6,1.1);this.slam(a,8,18,48,S.ph>=2&&!S.enc)}break}
    case 'lw':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0){const t=S.tg;let T=1;if(t&&t.alive){T=this.leap(a,t.c.x,t.c.y,t.c.z,2);TELE.add({k:'c',x:t.c.x,y:t.c.y,z:t.c.z,r:7.5,d:T});AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:90,rate:.8})}this.start(a,'lp',T+.6)}break}
    case 'lp':{if(!a.leapV||S.mt<=0){S.mode='';S.pt=rr(.8,1.4);S.far=0;this.slam(a,8,18,48,S.ph>=2&&!S.enc)}break}
    case 'tw':{a.an.skill=Math.max(a.an.skill,1);if(S.mt<=0){S.mode='';S.pt=rr(.5,.9);const h=S.tg;if(h&&h.alive){this.throwRock(a,h,0);if(S.ph>=3&&!S.enc){this.throwRock(a,h,-4.2);this.throwRock(a,h,4.2)}}}break}
    case 'smw':{a.an.skill=Math.max(a.an.skill,.9);if(S.mt<=0){S.mode='';S.pt=rr(.6,1.1);this.smash(a)}break}
    case 'su':{a.an.skill=Math.max(a.an.skill,.8);if(S.mt<=0){S.mode='';S.pt=1;this.fx({k:'roar',i:a.id});this.summon(a,4,true,true)}break}
    case 'rw':{a.an.skill=Math.max(a.an.skill,.5+.5*Math.abs(Math.sin(G.t*14)));if(S.mt<=0){S.mode='';S.pt=1;this.roar(a)}break}
    case 'trw':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0)this.triStep(a);break}
    case 'tr':{if(!a.leapV||S.mt<=-.4){S.trN++;this.slam(a,6.5,22,34,S.trN>=3);if(S.trN>=3){S.mode='';S.pt=rr(.7,1.1)}else this.triStep(a)}break}
    case 'down':case 'stun':{a.kvx*=.8;a.kvz*=.8;if(S.mt<=0){S.mode='';S.pt=.6}break}
    // 60 %: a leap to the north bulkhead, it tears a leaf out of the frame and keeps it as a shield; the cold room behind lets the infected out
    case 'p2a':{a.an.skill=Math.max(a.an.skill,.7);if(S.mt<=0){const B=MAP.ez.bulk,T=this.leap(a,B[0],0,B[2]+2.6,3);this.start(a,'p2l',T+.6)}break}
    case 'p2l':{if(!a.leapV||S.mt<=0){this.face(a,0,25);this.start(a,'p2b',1.7);this.fx({k:'rip'})}break}
    case 'p2b':{a.an.skill=1;this.face(a,0,25);if(S.mt<=0){S.mode='';S.pt=1.2;S.shield=true;S.sh=S.shMax;EP.gateOpen('gN',true);this.fx({k:'shon',i:a.id});this.summon(a,6,true,true);EP.say('aP2')}break}
    // 25 %: it throws the leaf down and roars; the power dies, red strobes, everything faster
    case 'p3a':{a.an.skill=Math.max(a.an.skill,.5+.5*Math.abs(Math.sin(G.t*12)));if(S.mt<=0){S.mode='';S.pt=1;this.fx({k:'roar',i:a.id,b:1});EP.setDark(true);
      if(S.shield){S.shield=false;this.fx({k:'shd',i:a.id,x:r2(c.x-Math.sin(a.yaw)*1.4),y:r2(c.y),z:r2(c.z-Math.cos(a.yaw)*1.4),yw:r3(a.yaw)})}this.summon(a,3,false);EP.say('aP3')}break}
    // the first meeting ends: a roar, a leap back through the hole it made, gone
    case 'ret':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0){const W=MAP.ez.wallW,T=this.leap(a,W[0],0,W[2]-5,2.2);this.start(a,'ret2',T+.8)}break}
    case 'ret2':{if(!a.leapV||S.mt<=0){S.mode='gone';EP.meetEnd(a)}break}}},
  slam(a,R,lo,hi,wave){const c=a.c;SCEN.slamFx(c.x,c.y,c.z);if(NET.host)netEv('scsl',{x:r2(c.x),y:r2(c.y),z:r2(c.z)});
    if(wave){EWAVE.add(c.x,c.y,c.z,15,12.5,24,a);if(!this.waveSaid){this.waveSaid=1;EP.say('aWave')}}
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-c.y)>2.5)continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*10*f,4+5*f,dz/(d||1)*10*f);hurtHuman(h,EPD(lo+(hi-lo)*f),a,{})}},
  smash(a){const c=a.c,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);this.fx({k:'smash',x:r2(c.x),y:r2(c.y),z:r2(c.z),yw:r3(a.yaw)});
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<-.5||al>10.5||Math.abs(sd)>1.5+h.c.hw||Math.abs(h.c.y-c.y)>2.5)continue;
      SCEN.pushHuman(h,fx*6+rx*Math.sign(sd||1)*3,6,fz*6+rz*Math.sign(sd||1)*3);h.dizzy=Math.max(h.dizzy,1.4);hurtHuman(h,EPD(52),a,{})}},
  // a slab at a human (with a lead), or (phase 2 on) two more either side of them: off sideways by side metres
  throwRock(a,h,side){const c=a.c,T=1.05,px=-(h.c.z-c.z),pz=h.c.x-c.x,pl=Math.hypot(px,pz)||1,sd=side||0,tx=h.c.x+h.c.vx*.55+px/pl*sd,tz=h.c.z+h.c.vz*.55+pz/pl*sd;let ty=floorBelow(tx,h.c.y+1.2,tz,.2);if(!(ty>-50))ty=h.c.y;
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),x0=c.x+fx*1.2,y0=c.y+4.6,z0=c.z+fz*1.2,K=ROCK.throw(x0,y0,z0,tx,ty,tz,T);TELE.add({k:'c',x:tx,y:ty,z:tz,r:3.5,d:T});
    if(!sd)AU.at('zatk',c.x,c.y+3,c.z,{vol:1,range:60,rate:.6});if(NET.host)netEv('epx',{k:'th',id:K.id,a:[r2(x0),r2(y0),r2(z0),r2(tx),r2(ty),r2(tz)],T:r2(T)})},
  roar(a){this.fx({k:'roar',i:a.id});for(const h of SCEN.H){if(!h.alive)continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<15)h.shriekT=Math.max(h.shriekT,2.5)}this.summon(a,3,false)},
  // minions: at the cold room once it is open, else the chamber's corners and galleries (twice as many once it is enraged)
  summon(a,n,mixed,cold){const S=a&&a.al,k=S&&S.enr?2:1,Z=MAP.ez.zones.D,pts=cold&&EP.gateIsOpen('gN')?Z.cold:Z.zsp;let s=0;
    for(let i=0;i<n*k;i++){const zc=mixed?(i===0?'strait':Math.random()<.5?'rager':Math.random()<.6?'runner':'strait'):'runner';const p=rpick(pts);
      if(SCEN.spawn(zc,[p[0]+rr(-.6,.6),p[2]||0,p[1]+rr(-.6,.6)]))s++}return s},
  grog(a,v){const S=a.al;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='gone'||S.mode[0]==='p')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6.5)}},
  down(a,t){const S=a.al;if(S.mode[0]==='p'||S.mode==='gone')return;S.mode='down';S.mt=t;S.grog=0;S.rage=0;S.frT=0;S.exT=0;a.kvx=a.kvz=0;a.leapV=null;this.fx({k:'dn',i:a.id});EP.say('aDown')},
  tankBreak(a){const S=a.al;S.tankB=true;S.tank=0;S.rage=0;S.frT=S.exT=0;this.fx({k:'tk',i:a.id});this.down(a,8);EP.say('aTank')},
  shieldBreak(a){const S=a.al;S.shield=false;S.sh=0;this.fx({k:'shb',i:a.id});this.down(a,6);EP.say('aShB')},
  toPhase(a,n){const S=a.al;S.ph=n;S.invT=3.5;S.grog=0;S.rage=0;S.frT=S.exT=0;a.kvx=a.kvz=0;a.leapV=null;Object.assign(S.cd,{su:10,sm:3,sc:2,tr:3,ro:6,ch:3,sl:1,th:6});S.ch2=false;
    EP.bossPh=n;this.start(a,n===2?'p2a':'p3a',n===2?.6:1.6);this.fx({k:'w',i:a.id,s:1.4,n:1});this.fx({k:'ph',n});EP.reviveAll()},
  // its health reached the floor of this phase (or of the first meeting)
  floorHit(a){const S=a.al;if(S.enc){if(S.mode==='ret'||S.mode==='ret2'||S.mode==='gone')return;S.invT=99;this.start(a,'ret',.8);this.fx({k:'w',i:a.id,s:1.2,n:1});EP.say('aRet');return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  // ---------- host: damage in (before the game applies it) and after ----------
  hit(t,dmg,src,o){const S=t.al;if(S.invT>0||S.idle||S.mode==='gone')return 0;let mul=1;const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),dir=o.dir||[0,0,0],hl=Math.hypot(dir[0],dir[2])||1,dot=(dir[0]*fx+dir[2]*fz)/hl;
    // the shield (phase 2): what comes from the front 110° hits the steel
    if(S.shield&&dot<-.57){S.sh-=dmg*(o.he?3:1);mul*=.15;if(S.sh<=0)this.shieldBreak(t)}
    // the serum tank on its back
    else if(!S.tankB&&o.x!=null&&t.epTankW&&dot>.15){const W=t.epTankW;if(Math.hypot(o.x-W.x,(o.y-W.y)*.8,o.z-W.z)<.85){mul*=2.5;S.tank-=dmg;this.grog(t,dmg/(t.maxHp*.01)*2);if(S.tank<=0)this.tankBreak(t);else if(src&&src.isPlayer)HUD.hitmark(true)}}
    if(S.mode==='down'||S.mode==='stun')mul*=1.5;if(S.frT>0)mul*=.8;if(S.exT>0)mul*=1.3;if(o.he)this.grog(t,15);
    let out=dmg*mul;const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    const fl=t.maxHp*(S.enc?.9:S.ph===1?AL_PH[1]:S.ph===2?AL_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    return out},
  after(t,dealt){const S=t.al;if(S.tankB||S.enc||S.frT>0||S.exT>0||S.mode==='down'||S.invT>0)return;S.rage+=dealt/(t.maxHp*.01)*3*(S.ph===3?1.5:1);
    if(S.rage>=100){S.rage=100;S.frT=10;this.fx({k:'fr',i:t.id});EP.say('aFren')}},
  // ---------- devices: pillar panels (+35 stagger with ALEPH beside it, once each) and steam valves ----------
  panel(i){const P=MAP.ez&&MAP.ez.panels[i];if(!P)return;const b=EP.bossA();const near=b&&b.al&&Math.hypot(b.c.x-P.x,b.c.z-P.z)<4.8;
    if(P.used||!near){this.fx({k:'pz',i});return}P.used=true;this.grog(b,35);this.fx({k:'pn',i});EP.say('aPanel')},
  // a shot (on the page that fired it) hit a panel or a valve
  devShot(b,a){if(NET.ghost||!a||a.team!==TH||!EP.on||EP.id!==1||EP.st!==4)return;const o=b.o;
    if(o.epanel!=null){if(AU.throttle('epn'+o.epanel,250))return;if(NET.cli)netToHost({t:'eppn',i:o.epanel});else this.panel(o.epanel);return}
    if(o.esteam!=null){const V=MAP.ez.valves[o.esteam];if(!V||AU.throttle('epv'+o.esteam,300))return;if(NET.cli){netToHost({t:'epvl',i:o.esteam});return}if(G.t<(V.cd||0))return;V.cd=G.t+12;this.fx({k:'st',i:o.esteam})}},
  // ---------- every page: the tank and the shield on the rig, the slump, the tints ----------
  pre(a,dt){const S=a.al;let down=0,sh=false,tb=false,fr=false,ex=false,inv=false;
    if(!NET.cli&&S){down=S.mode==='down'?1:S.mode==='stun'?.55:0;sh=S.shield;tb=S.tankB;fr=S.frT>0;ex=S.exT>0;inv=S.invT>0&&!S.enc}
    else if(EP.bf&&EP.bf.id===a.id){const f=EP.bf.f;down=f&16?1:0;sh=!!(f&1);tb=!!(f&2);fr=!!(f&4);ex=!!(f&8);inv=!!(f&32)}
    a.epDown=approach(a.epDown||0,a.alive?down:0,dt*(down>(a.epDown||0)?4:2.5));a.epShield=sh&&a.alive;a.epTankB=tb;a.epFr=fr;a.epEx=ex;a.epInv=inv},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_aleph')return;
    // a crouching size in the low corridor (its head would go through the ceiling), the full giant in B4
    const sc=EP.st<=3?1.7:BOSS_S;if(ch.grp.scale.x!==sc)ch.grp.scale.setScalar(sc);a.hitW=EP.st<=3?.66:.85;
    let X=ch.epX;if(!X){const o=ch.A.def.o,zb=o.belly*.25+(o.torsoD+o.belly)/2,zf=o.belly*.25-(o.torsoD+o.belly)/2;
      X=ch.epX={tank:new THREE.Mesh(gunGeo('epTank'),matGun()),sh:new THREE.Mesh(gunGeo('epShield'),matGun()),tm:new THREE.Matrix4().makeTranslation(0,o.torsoH*.55,zb+.12),
        sm:new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(.08,.22,.04)).setPosition(-.26,o.torsoH*.3,zf-.42),w:new THREE.Matrix4(),v:new THREE.Vector3()};
      for(const m of [X.tank,X.sh]){m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m)}}
    const vis=ch.grp.visible;X.tank.visible=vis&&!a.epTankB;X.sh.visible=vis&&!!a.epShield;
    X.tank.matrix.multiplyMatrices(ch.M[1],X.tm);X.sh.matrix.multiplyMatrices(ch.M[1],X.sm);
    const U=ch.mat.uniforms.uProbe.value;X.tank.material.uniforms.uProbe.value.copy(U);X.sh.material.uniforms.uProbe.value.copy(U);
    X.tank.material.uniforms.uEmisA.value=(a.epFr?1.7:1.1)+.25*Math.sin(G.t*(a.epFr?9:3));
    X.w.multiplyMatrices(ch.grp.matrixWorld,X.tank.matrix);a.epTankW=X.v.setFromMatrixPosition(X.w);
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(a.epFr)T.set(.9,.08,.04,.26+.1*Math.sin(G.t*18));else if(a.epEx)T.set(.32,.38,.48,.3);else if(a.epInv)T.set(1,.95,.85,.16+.08*Math.sin(G.t*30))}
    CHAIN.sync(a)},
  // sparks off the shield for the page's own shots (no traffic: every page sees its own)
  shieldSpark(t,o){if(!o||o.x==null||!o.dir||AU.throttle('epsh',60))return;const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hl=Math.hypot(o.dir[0],o.dir[2])||1;if((o.dir[0]*fx+o.dir[2]*fz)/hl>=-.57)return;
    for(let i=0;i<6;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-3,3)-o.dir[0]*2,vy:rr(0,3),vz:rr(-3,3)-o.dir[2]*2,life:rr(.15,.35),s0:.05,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1});AU.at('imp_metal',o.x,o.y,o.z,{vol:.5,range:30})},
  clear(){TELE.clear();ROCK.clear();STEAM.clear();CHAIN.off(false);this.waveSaid=0;for(const m of this.props){R.scene.remove(m);m.material.dispose()}this.props=[];
    const E=MAP.ez;if(E&&E.panels){for(const p of E.panels)p.used=false;for(const v of E.valves||[])v.cd=0}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI(),E=MAP.ez;
    switch(m.k){
    case 'w':if(a){a.an.skill=Math.max(a.an.skill,m.s||1);AU.at(m.n?'zroar':'zgrowl',a.c.x,a.c.y+3,a.c.z,{vol:1,range:80,rate:m.n?.7:.5})}break;
    case 'sw':if(a){a.an.skill=Math.max(a.an.skill,.5);AU.at('zgrowl',a.c.x,a.c.y+1.5,a.c.z,{vol:.9,range:30,rate:1.4})}break;
    case 'gr':{if(a){a.an.skill=Math.max(a.an.skill,.5);AU.at('zatk',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:30,rate:.8})}const v=byIdAny(m.v);
      if(v&&v===P){P.grabT=2.2;P.rootT=Math.max(P.rootT||0,2.2);FX.shake=Math.max(FX.shake,.5);AU.play('hurt',{vol:.6});HUD.note(L?'Pinned! A teammate has to shoot it off':'붙잡혔다! 동료가 쏴서 떼어 줘야 해요',2.4)}break}
    case 'ug':{const v=byIdAny(m.v);if(v){v.grabT=0;if(v===P||!v.pup)v.rootT=Math.min(v.rootT||0,.05)}break}
    case 'fz':if(a)for(let i=0;i<24;i++)FX.spawn({x:a.c.x+rr(-.8,.8),y:a.c.y+rr(.5,4),z:a.c.z+rr(-.8,.8),vy:rr(-.3,.4),life:rr(.5,1),s0:.15,s1:.5,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'fr':if(a){AU.at('zroar',a.c.x,a.c.y+3,a.c.z,{vol:1,range:100,rate:.5});for(let i=0;i<30;i++)FX.spawn({x:a.c.x+rr(-.8,.8),y:a.c.y+rr(1,4),z:a.c.z+rr(-.8,.8),vx:rr(-1,1),vy:rr(.5,2),vz:rr(-1,1),life:rr(.8,1.4),s0:.3,s1:1.2,r:.6,g:.08,b:.04,a:.5,f:2,drag:1.5})
      if(P&&P.alive)HUD.announce(L?'ALEPH IS IN A RAGE':'알레프 분노 폭주!','z',2)}break;
    case 'ex':if(a){AU.at('hpant',a.c.x,a.c.y+3,a.c.z,{vol:1,range:50,rate:.5});HUD.note(L?'ALEPH is spent — hit it now!':'알레프 탈진 — 지금 몰아쳐!',2.5)}break;
    case 'dn':if(a){AU.at('bodyfall',a.c.x,a.c.y,a.c.z,{vol:1,range:60,rate:.55});SCEN.slamFx(a.c.x,a.c.y,a.c.z);HUD.note(L?'ALEPH is down — ×1.5 damage':'알레프 그로기 — 피해 1.5배',2.5)}break;
    case 'tk':if(a&&a.epTankW){const W=a.epTankW;for(let i=0;i<40;i++)FX.spawn({x:W.x,y:W.y,z:W.z,vx:rr(-5,5),vy:rr(0,6),vz:rr(-5,5),life:rr(.5,1.1),s0:.12,s1:.06,r:1,g:rr(.45,.7),b:.12,f:4,grav:12,add:1});
      DL.add(W.x,W.y,W.z,'#ff8a2a',12,2.6,1);AU.at('explode',W.x,W.y,W.z,{vol:.9,range:70,rate:1.4});AU.at('gib',W.x,W.y,W.z,{vol:1,range:50})}break;
    case 'shb':if(a){const x=a.c.x-Math.sin(a.yaw)*1.4,z=a.c.z-Math.cos(a.yaw)*1.4;for(let i=0;i<28;i++)FX.spawn({x,y:a.c.y+rr(1,3.5),z,vx:rr(-5,5),vy:rr(1,6),vz:rr(-5,5),life:rr(.6,1.2),s0:.1,s1:.08,r:.42,g:.42,b:.44,f:7,grav:14,col:.4});
      for(let i=0;i<16;i++)FX.spawn({x,y:a.c.y+2,z,vx:rr(-6,6),vy:rr(0,5),vz:rr(-6,6),life:rr(.2,.4),s0:.05,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1});AU.at('explode',x,a.c.y+2,z,{vol:.9,range:70,rate:1.6});AU.at('imp_metal',x,a.c.y+2,z,{vol:1,range:40})}break;
    case 'shd':{const s=new THREE.Mesh(gunGeo('epShield'),matGun());s.scale.setScalar(BOSS_S);s.position.set(m.x/100,m.y/100+.09,m.z/100);s.rotation.order='YXZ';s.rotation.set(-Math.PI/2+.04,m.yw/1000,0);
      R.scene.add(s);sampleProbe(m.x/100,m.y/100+1,m.z/100,s.material.uniforms.uProbe.value);this.props.push(s);AU.at('land',m.x/100,m.y/100,m.z/100,{vol:1,range:60,rate:.5});AU.at('imp_metal',m.x/100,m.y/100,m.z/100,{vol:1,range:50});break}
    case 'shon':if(a)AU.at('imp_metal',a.c.x,a.c.y+2,a.c.z,{vol:1,range:60,rate:.6});break;
    case 'rip':if(E){const B=E.bulk;for(let i=0;i<50;i++)FX.spawn({x:B[0]+rr(-5,5),y:rr(.5,8),z:B[2]+.4,vx:rr(-2,2),vy:rr(0,4),vz:rr(.5,4),life:rr(.3,.8),s0:.05,s1:.02,r:1,g:.75,b:.35,f:0,grav:9,add:1});
      for(let i=0;i<30;i++)FX.spawn({x:B[0]+rr(-5,5),y:rr(0,8),z:B[2]+.5,vx:rr(-1,1),vy:rr(-.2,.6),vz:rr(.5,2),life:rr(1.2,2.2),s0:.4,s1:1.6,r:.45,g:.44,b:.42,a:.45,f:2,drag:1.2});
      AU.at('explode',B[0],B[1],B[2],{vol:1,range:90,occ:false,rate:.45});AU.at('imp_metal',B[0],B[1],B[2],{vol:1,range:60,rate:.7});if(P){const d=Math.hypot(P.c.x-B[0],P.c.z-B[2]);if(d<30)FX.shake=Math.max(FX.shake,.8-d/40)}}break;
    case 'brk':if(E){const W=E.wallW;for(let i=0;i<40;i++)FX.spawn({x:W[0]+rr(-1.5,1.5),y:rr(.2,3.4),z:W[2],vx:rr(-3,3),vy:rr(0,4),vz:rr(1,6),life:rr(.6,1.2),s0:.07,s1:.05,r:.55,g:.7,b:.75,f:10,grav:12,col:.3,add:0});
      for(let i=0;i<24;i++)FX.spawn({x:W[0]+rr(-1.5,1.5),y:rr(0,3),z:W[2]+.3,vx:rr(-1,1),vy:rr(0,.6),vz:rr(.5,2.5),life:rr(1,2),s0:.4,s1:1.4,r:.5,g:.5,b:.5,a:.45,f:2,drag:1.2});
      AU.at('explode',W[0],W[1],W[2],{vol:1,range:90,occ:false,rate:.6});AU.at('zroar',W[0],W[1],W[2]-3,{vol:1,range:100,rate:.6});if(P){const d=Math.hypot(P.c.x-W[0],P.c.z-W[2]);if(d<25)FX.shake=Math.max(FX.shake,.9-d/30)}}break;
    case 'pn':if(E){const p=E.panels[m.i];if(p){p.used=true;for(let i=0;i<36;i++)FX.spawn({x:p.x,y:p.y,z:p.z,vx:rr(-5,5),vy:rr(-1,5),vz:rr(-5,5),life:rr(.15,.4),s0:.06,s1:.02,r:.7,g:.9,b:1,f:0,grav:6,add:1});
      DL.add(p.x,p.y,p.z,'#9ad8ff',10,2.8,.7,{flick:.6});AU.at('dischit',p.x,p.y,p.z,{vol:1,range:60});AU.at('explode',p.x,p.y,p.z,{vol:.5,range:40,rate:1.8})}}break;
    case 'pz':if(E){const p=E.panels[m.i];if(p){for(let i=0;i<8;i++)FX.spawn({x:p.x,y:p.y,z:p.z,vx:rr(-2,2),vy:rr(0,2),vz:rr(-2,2),life:rr(.1,.25),s0:.04,s1:.02,r:.7,g:.9,b:1,f:0,grav:6,add:1});AU.at('imp_metal',p.x,p.y,p.z,{vol:.5,range:25})}}break;
    case 'st':STEAM.start(m.i);break;
    case 'th':if(NET.cli){const A=m.a;ROCK.throw(A[0]/100,A[1]/100,A[2]/100,A[3]/100,A[4]/100,A[5]/100,m.T/100,m.id)}break;
    case 'rkl':{const K=ROCK.byId(m.id);if(K&&m.b)ROCK.box(K)}break;
    case 'rkx':{const K=ROCK.byId(m.id);if(K)ROCK.remove(K)}break;
    case 'roar':if(a){AU.at('zroar',a.c.x,a.c.y+3,a.c.z,{vol:1,range:110,rate:m.b?.55:.7});SCEN.slamFx(a.c.x,a.c.y,a.c.z);if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<18)FX.shake=Math.max(FX.shake,.9-d/30)}}break;
    case 'wall':{SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('imp_conc',m.x/100,m.y/100+1,m.z/100,{vol:1,range:50});break}
    case 'smash':{const x=m.x/100,y=m.y/100,z=m.z/100,yw=m.yw/1000,fx=-Math.sin(yw),fz=-Math.cos(yw);for(let k=1;k<=10;k++)for(let i=0;i<4;i++)FX.spawn({x:x+fx*k+rr(-1.2,1.2),y:y+.15,z:z+fz*k+rr(-1.2,1.2),vx:rr(-1.5,1.5),vy:rr(.5,2.5),vz:rr(-1.5,1.5),life:rr(.6,1.1),s0:.35,s1:1.2,r:.46,g:.42,b:.36,a:.5,f:2,drag:2});
      AU.at('explode',x+fx*5,y+.5,z+fz*5,{vol:.9,range:80,occ:false,rate:.5});if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<16)FX.shake=Math.max(FX.shake,.9-d/20)}break}
    case 'ph':HUD.announce(m.n===2?(L?'ALEPH TEARS THE BULKHEAD OUT':'알레프가 격벽을 뜯어낸다'):(L?'THE LIGHTS GO OUT':'정전 — 알레프가 날뛴다'),'z',3);AU.play('stingZ',{vol:.7});break;
    case 'enr':HUD.announce(L?'ALEPH IS ENRAGED':'알레프 광폭화','z',2.5);break;
    case 'dark':EP.setDark(!!m.o,true);break}}};

// ---------- the straitjacket zombie: no claws; it pounces from 4 m and pins its prey for 2 s (6 hp a second, no shooting) ----------
// 150 damage from the victim's teammates shakes it off.
const STRAIT={
  tick(a,dt){const S=a.st;if(!S)return;
    if(S.mode==='grab'){const v=S.vic;S.mt-=dt;if(!v||!v.alive||v.team!==TH||S.mt<=0){this.release(a,false);return}
      v.grabT=Math.max(v.grabT||0,.3);v.rootT=Math.max(v.rootT||0,.3);
      const fx=-Math.sin(v.yaw),fz=-Math.cos(v.yaw),px=v.c.x+fx*.55,pz=v.c.z+fz*.55;if(charFits(a.c,px,v.c.y,pz)){a.c.x=px;a.c.z=pz;a.c.y=v.c.y}
      a.c.vx=a.c.vz=0;a.kvx=a.kvz=a.mvx=a.mvz=0;a.yaw=Math.atan2(-(v.c.x-a.c.x),-(v.c.z-a.c.z));a.an.skill=Math.max(a.an.skill,.35);
      S.hurtT-=dt;if(S.hurtT<=0){S.hurtT=.5;a.scHit=G.t;hurtHuman(v,EPD(3),a,{claw:1})}return}
    if(S.mode==='wind'){S.mt-=dt;a.an.skill=Math.max(a.an.skill,.5);const t=S.tg;if(t&&t.alive)a.yaw=Math.atan2(-(t.c.x-a.c.x),-(t.c.z-a.c.z));
      if(S.mt<=0){if(t&&t.alive){SCEN.leapTo(a,t.c.x+t.c.vx*.25,t.c.y,t.c.z+t.c.vz*.25,.5);S.mode='leap';S.mt=1.2;AU.at('zleap',a.c.x,a.c.y+1.4,a.c.z,{vol:.9,range:30})}else S.mode=''}return}
    if(S.mode==='leap'){S.mt-=dt;a.an.skill=Math.max(a.an.skill,.4);
      for(const h of SCEN.H){if(!h.alive||h.grabT>0)continue;if(Math.abs(h.c.x-a.c.x)<.8&&Math.abs(h.c.z-a.c.z)<.8&&Math.abs(h.c.y-a.c.y)<1.5){this.grab(a,h);return}}
      if(S.mt<=0||!a.leapV&&a.c.onGround&&S.mt<1){S.mode='';S.cd=rr(2.5,3.5)}return}
    S.cd-=dt;if(S.cd>0||!a.c.onGround||a.reviving>0)return;const t=a.bot&&a.bot.target;if(!t||!t.alive||t.team!==TH||t.grabT>0)return;
    const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d>4||Math.abs(t.c.y-a.c.y)>1.5||!losClear(a.c.x,a.c.y+1.2,a.c.z,t.c.x,t.c.y+1.2,t.c.z))return;
    S.mode='wind';S.mt=.4*EPTW();S.tg=t;ALEPH.fx({k:'sw',i:a.id})},
  grab(a,v){const S=a.st;S.mode='grab';S.mt=2;S.vic=v;S.dmg=0;S.hurtT=.25;v.grabT=2.2;v.rootT=2.2;a.leapV=null;ALEPH.fx({k:'gr',i:a.id,v:v.id});if(!EP.grabSaid){EP.grabSaid=1;EP.say('grab')}},
  release(a,freed){const S=a.st;if(!S||S.mode!=='grab')return;const v=S.vic;S.mode='';S.vic=null;S.cd=rr(3.5,5);
    if(v){v.grabT=0;v.rootT=0}a.staggerT=Math.max(a.staggerT,freed?1.2:.4);if(freed&&v){const dx=a.c.x-v.c.x,dz=a.c.z-v.c.z,d=Math.hypot(dx,dz)||1;a.kvx+=dx/d*5;a.kvz+=dz/d*5}
    ALEPH.fx({k:'ug',i:a.id,v:v?v.id:-1})}};

// ---------- what the chapter's zombies do (episode.js dispatches through EPZ) ----------
EPZ.aleph={hp:()=>ALEPH.hpFor(),init:a=>ALEPH.init(a,ALEPH.encNext),tick:(a,dt)=>ALEPH.tick(a,dt),
  // its own moves own the controls; otherwise it swings at whoever is in reach
  post(a){const S=a.al;if(!S)return;if(S.idle||S.mode){if(S.mode!=='lp'&&S.mode!=='p2l'&&S.mode!=='ret2'&&S.mode!=='tr'){a.cmd.f=a.cmd.s=0;a.cmd.jump=false}a.cmd.fire=a.cmd.alt=false;a.cmd.duck=false}
    else{const t=a.bot&&a.bot.target;a.cmd.fire=!!(t&&t.alive&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<2.8&&Math.abs(t.c.y-a.c.y)<2.2&&Math.random()<.85)}
    if(S.mode==='ch'||S.mode==='cw')a.yaw=Math.atan2(-S.dx,-S.dz)},
  hit:(t,dmg,src,o)=>t.al?ALEPH.hit(t,dmg,src,o):dmg,after:(t,r)=>{if(t.al)ALEPH.after(t,r)},
  spark(t,o){const shOn=NET.cli?!!(EP.bf&&EP.bf.f&1):!!(t.al&&t.al.shield);if(shOn)ALEPH.shieldSpark(t,o)},
  // its claws hit hard and shove
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?7:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,2,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?34:22),a,{claw:1});return true},
  pre:(a,dt)=>ALEPH.pre(a,dt),attach:a=>ALEPH.attach(a),gone(a){if(a.al)a.al.mode='gone'}};
EPZ.strait={init(a){a.st={mode:'',cd:rr(1,2.5),mt:0}},tick:(a,dt)=>STRAIT.tick(a,dt),
  post(a){a.cmd.fire=a.cmd.alt=false;if(a.st&&(a.st.mode==='wind'||a.st.mode==='grab')){a.cmd.f=a.cmd.s=0;a.cmd.jump=false}},
  // 150 damage from the victim's teammates shakes it off; no claws at all
  after(t,r){if(t.st&&t.st.mode==='grab'){t.st.dmg+=r;if(t.st.dmg>=150)STRAIT.release(t,true)}},
  claw(){return true},die(t){if(t.st&&t.st.mode==='grab')STRAIT.release(t,false)},gone(a){if(a.st&&a.st.mode==='grab')STRAIT.release(a,false);if(a.st)a.st.mode=''}};

// ---------- chapter 1 「알레프」: the Q-7 research wing ----------
//   1 the outer checkpoint — three waves; then the research wing's glass doors open
//   2 the lobby — hold the two security terminals in turn (25 s each, a zombie inside the ring stops the count); then the inner door
//   3 the lab corridor — hold out 60 s for the cargo lift. ALEPH bursts out of a lab, shows a charge or two and backs off once it has
//     lost a tenth of its health (or after 35 s); then the team boards, rides down 15 s and steps out in B4
//   4 B4 — the boss fight, three phases. A wipe replays the phase it reached, at that phase's health
//   5 the escape — 60 s back to the lift (late still clears, without the bonus)
CHAP[1]={id:1,k:'aleph',map:'ep1',code:'Q7-000',n:['알레프','ALEPH'],t:['좀비 시나리오: 알레프','Zombie Scenario: ALEPH'],
  file:[['최초 감염자 Q7-000. 맞을수록 분노가 차올라 폭주한다','Patient zero, Q7-000: every hit feeds its rage until it snaps'],['등의 주황 혈청 탱크가 약점 · 기둥 패널로 감전','The orange tank on its back is the weak point · shock it at the pillars']],
  cards:{place:['Q-7','Q-7'],who:['최초 감염자','PATIENT ZERO'],line:['강화 혈청 1호 피험자 — 통증을 못 느끼고, 맞을수록 분노한다','Serum subject no. 1 — feels no pain; every hit makes it angrier']},
  boss:ALEPH,
  // gates: A glass doors, B the inner security door, C / D the lift doors, N the B4 bulkhead, W the lab wall
  gates:['gA','gB','gC','gD','gN','gW'],gateDur:{gA:.9,gB:1.6,gN:.25,gW:.25},
  stages:[null,
    {z:'A',k:'waves',n:['외곽 검문소','Outer checkpoint'],on:['검문소를 지켜라','Hold the checkpoint'],prep:18,clr:'s1c'},
    {z:'B',k:'terms',n:['로비 · 보안실','Lobby · security'],on:['보안 단말 확보','Secure the terminals'],t:25,say:'s2',clr:'s2c',done1:'t1',intro:{zc:'strait',say:'strait',at:8},
      mix:[['rager',52],['runner',24],['strait',14],['spitter',6],['scream',4]]},
    {z:'C',k:'hold',n:['연구 복도','Lab corridor'],on:['엘리베이터 도착까지','The lift arrives in'],len:60,say:'s3',sayRetry:1,meet:{at:12,cap:.5},hp:[55,0,0,2.4],mk:[62.15,2.8,0,['엘리베이터','LIFT']],
      mix:[['rager',44],['runner',28],['strait',14],['bomber',10],['brute',4]]},
    {z:'D',k:'boss',n:['B4 격리 실험장','B4 isolation chamber'],on:['알레프를 쓰러뜨려라','Bring ALEPH down'],say:'s4',go:'b0',prepPt:[0,0,70,2]},
    {z:'D',k:'escape',n:['탈출','The escape'],on:['탈출 — 엘리베이터까지','ESCAPE — the lift'],len:60,mix:[['runner',55],['rager',33],['strait',12]]}],
  stageGates(n,kind,bp){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n>=4)m|=b('gW');
    if(n===4&&kind!=='phase')m|=b('gD');if(n===4&&kind==='phase'&&bp>=2)m|=b('gN');if(n===5)m|=b('gD')|b('gN');return m},
  // the cold room behind the bulkhead lets the infected out once it is open
  zsp(n,Zn){return Zn.cold&&EP.gateIsOpen('gN')?Zn.zsp.concat(Zn.cold):Zn.zsp},
  phaseStart(Zn){return Zn.start.map(s=>[s[0],s[1],s[2]-8.4,s[3]])},
  strobes:[[-12,7,46],[12,7,58]],
  setup(){const M=MAP.ez;M.exit=M.carD;M.exitMk=[M.door.D[0],2.8,M.door.D[2]+3];M.door.C=M.door.C||[62.15,1.5,0]},
  // the lift: board (40 s), ride down (15 s), step out in B4
  holdDone(){this.boardStart()},
  boardStart(){this.trickleK=.75;EP.ph='board';EP.t=40;G.time=40;EP.setGates(EP.gm|EP.bit('gC'));this.boardFx();if(NET.host)netEv('epb',{})},
  boardFx(){EP.radio('lift');AU.play('powerup',{vol:.8});HUD.announce(LI()?'THE LIFT IS HERE':'엘리베이터 도착','h',2.5)},
  hostPh(ph,dt){if(ph==='ride'){EP.t-=dt;G.time=EP.t;if(EP.t<=0)this.rideEnd();return true}
    if(ph==='board'){if(humansAlive()===0){EP.fail();return true}EP.t-=dt;G.time=EP.t;EP.trickle(dt,CHAP[1].stages[3].mix,.75);const C=MAP.ez.carC;let all=true;for(const h of SCEN.H)if(h.alive&&!EP.inCar(C,h))all=false;
      if(all||EP.t<=0)this.rideStart();return true}return false},
  rideStart(){const C=MAP.ez.carC,tp=[];let i=0;
    // the last ones are pulled in as the doors close
    for(const h of SCEN.H){if(!h.alive||EP.inCar(C,h))continue;const x=64+(i%3)*1.4,z=-1.6+Math.floor(i/3)*1.6;i++;placeAt(h,x,0,z,-Math.PI/2);tp.push([h.id,r2(x),0,r2(z),r3(-Math.PI/2)])}
    const ids=[];for(const a of SCEN.Z)if(a.alive){EP.despawn(a);ids.push(a.id)}
    EP.ph='ride';EP.t=15;G.st='fight';G.time=15;EP.setGates(EP.gm&~EP.bit('gC'));SCEN.closePick(false);this.rideBegin();if(NET.host)netEv('epr',{P:tp,z:ids})},
  rideBegin(){EP.radio('ride');AU.play('blackout',{vol:.55,rate:.7});HUD.announce(LI()?'GOING DOWN TO B4':'B4로 하강','w',2.5);this.rideK=0},
  update(dt){if(EP.ph==='ride')this.rideFx(dt);else if(this.rideL){this.rideL.dead=true;this.rideL=null}},
  rideFx(dt){const P=G.player,C=MAP.ez&&MAP.ez.carC;if(!C)return;this.rideK=(this.rideK||0)+dt;
    if(P&&P.alive&&EP.inCar(C,P,.5))FX.shake=Math.max(FX.shake,.16+.06*Math.sin(G.t*13));
    if(!this.rideL)this.rideL=DL.add(65,2,0,'#ffe2b0',7,1.4,0);const L0=this.rideL;L0.x=65;L0.z=0;L0.y=4.4-((this.rideK*1.3)%1)*4.6;L0.i=1.1;
    if(Math.floor(this.rideK/2.6)!==Math.floor((this.rideK-dt)/2.6))AU.at('land',65,1,0,{vol:.45,range:20,rate:.6})},
  // (the car C → car D move: x_D = −z_C, z_D = 74 + (x_C − 62), yaw − π/2)
  rideEnd(){if(this.rideL){this.rideL.dead=true;this.rideL=null}const C=MAP.ez.carC,D=MAP.ez.carD,arr={};
    for(const h of SCEN.H){if(!h.alive)continue;const d=h.c.x-C.dx,l=h.c.z-C.dz;arr[h.id]=[D.dx-l,h.c.y,D.dz+d,wrapA(h.yaw-Math.PI/2)]}
    EP.stageStart(4,'next',null,arr)},
  // out of the car: the door shuts behind the team
  bossGo(){const D=MAP.ez.carD,tp=[];let i=0;for(const h of SCEN.H){if(!h.alive||h.c.z<D.z0-.4)continue;const x=-3+(i%4)*2,z=70.4-Math.floor(i/4)*1.4;i++;placeAt(h,x,0,z,0);tp.push([h.id,r2(x),0,r2(z),0])}
    EP.setGates(EP.gm&~EP.bit('gD'));return tp},
  escapeStart(){EP.setGates(EP.gm|EP.bit('gD')|EP.bit('gN'));const Zn=EP.zone('D');SCEN.zsp=Zn.zsp.concat(Zn.cold)},
  onFinish(win,bonus){if(win&&bonus)EP.setGates(EP.gm&~EP.bit('gD'))},
  goal(a){if(EP.ph==='board'||EP.ph==='ride')return [65,0,0,1.1]},
  markers(list,L){if(EP.ph==='board'){list.push([MAP.ez.door.C[0]+3,2.6,0,L?'LIFT':'엘리베이터','g']);return false}return false},
  objText(L,ts){if(EP.ph==='board')return [(L?'Into the lift!':'엘리베이터 탑승!')+` · ${ts}${L?'s':'초'}`];if(EP.ph==='ride')return [L?'Going down to B4…':'B4로 하강 중…',1-EP.t/15];return null},
  deadText(L){if(EP.ph==='ride')return L?'Down — back on your feet when the lift reaches B4 · spectating':'쓰러짐 — 엘리베이터가 B4에 닿으면 다시 일어나요 · 관전 중';return null},
  radio:{
    start:['2차 회수팀, Q-7 외곽 검문소 도착. 1차 회수팀(RT-1)은 4시간째 응답이 없다.','RT-2, you are at the Q-7 checkpoint. RT-1 has not answered for four hours.',0],
    w1:['철조망이 뚫렸다! 검문소부터 정리해.','The wire is down! Clear the checkpoint first.',0],
    s1c:['연구동 유리문 원격 해제. 안으로 들어가.','Research wing doors unlocked. Get inside.',0],
    s2:['보안 단말 두 곳에서 출입 기록을 뽑아 — 1층 보안실, 2층 서버실.','Pull the access logs from both terminals: the security room, then the server room upstairs.',0],
    strait:['구속복 입은 놈들이다! 붙잡히면 못 쏴 — 서로 떼어 줘!','Straitjackets! One pins you and you cannot shoot — get them off each other!',1],
    t1:['첫 번째 단말 확보. 2층 서버실로.','First terminal done. Up to the server room.',0],
    s2c:['기록 확보… RT-1이 지하 B4로 내려갔다. 안쪽 보안문 연다.','Got the logs… RT-1 went down to B4. Opening the inner door.',0],
    s3:['복도 끝 화물 엘리베이터 호출 중. 60초만 버텨.','Calling the cargo lift at the end of the corridor. Hold out 60 seconds.',0],
    enc:['벽 너머에 뭔가 있어—!','Something is behind that wall—!',1],
    enc2:['저건… Q7-000, 알레프. 최초 감염자다!','That is… Q7-000. ALEPH. Patient zero!',0],
    aRet:['놈이 물러난다! 엘리베이터는?','It is pulling back! Where is that lift?',1],
    lift:['엘리베이터 도착. 전원 탑승!','The lift is here. Everybody in!',0],
    ride:['B4 격리 실험장으로 내려간다. 알레프가 거기 있다.','Going down to the B4 isolation chamber. ALEPH is there.',0],
    s4:['등의 주황 혈청 탱크가 약점이다. 기둥 전기 패널, 증기 배관도 써.','The orange tank on its back is the weak point. Use the pillar panels and the steam valves.',0],
    b0:['구속이 끊어졌다—온다!','It broke loose—here it comes!',1],
    aP2:['격벽을 뜯어 방패로 쓴다! 옆이나 뒤로 돌아, HE로 부숴!','It ripped the bulkhead off for a shield! Flank it, or break it with HE!',1],
    aP3:['전력이 나갔다! 비상등뿐이다—놈이 날뛴다!','The power is out! Emergency lights only—it is going wild!',0],
    aFren:['분노 폭주다! 거리 벌려!','It is raging! Get some distance!',1],
    aExh:['지쳤다! 지금 몰아쳐!','It is spent! Hit it now!',1],
    aDown:['쓰러졌다! 집중 사격!','It is down! Pour it on!',1],
    aTank:['혈청 탱크 파괴! 더는 분노 못 한다!','Serum tank destroyed! No more rage!',1],
    aShB:['방패가 깨졌다!','The shield broke!',1],
    aWall:['벽에 박았다—지금이야!','It hit the wall—now!',1],
    aWave:['충격파다! 바닥을 타고 온다 — 점프로 넘어!','A shockwave! It rolls along the floor — jump over it!',1],
    aPanel:['감전! 패널이 먹혔다!','Shocked! The panel worked!',1],
    aEnr:['놈이 더 빨라진다—시간을 끌면 안 돼!','It is getting faster—we cannot drag this out!',0],
    dead:['알레프 무력화 확인! 60초 안에 엘리베이터로 탈출해!','ALEPH is down! Back to the lift—60 seconds!',0],
    esc:['2차 회수팀 탈출 확인. 수고했다.','RT-2 is out. Good work.',0],
    late:['늦었지만… 살아 나왔군. 수고했다.','Late, but alive. Good work.',0]}};

// ---------- hooks ----------
(function(){
  Object.assign(CLIH,{
    epx(L,m){ALEPH.fxApply(m)},
    epb(){EP.ph='board';EP.t=40;CHAP[1].boardFx()},
    epr(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);for(const i of m.z||[]){const a=byIdAny(i);if(a)EP.despawn(a)}
      EP.ph='ride';EP.t=15;SCEN.closePick(false);CHAP[1].rideBegin()}});
  Object.assign(HOSTH,{
    eppn(L,m){if(EP.on&&EP.id===1&&EP.st===4&&actorOfKey(L.key))ALEPH.panel(m.i|0)},
    epvl(L,m){const V=EP.on&&EP.id===1&&MAP.ez&&MAP.ez.valves[m.i|0];if(V&&EP.st===4&&G.t>=(V.cd||0)){V.cd=G.t+12;ALEPH.fx({k:'st',i:m.i|0})}}});
})();

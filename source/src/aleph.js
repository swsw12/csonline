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
const EPD=v=>v*SC_DIFF.dmg[G.diff||0]/.75;// a pattern's damage on normal, scaled to the difficulty
const EPTW=()=>[1.3,1,.9,.8][G.diff||0];// wind-up / warning time per difficulty
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
  on(){return EP.on&&EP.st===4&&EP.ph==='prep'&&EP.bossPh===1},
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

// ---------- floor warnings: a red outline and a fill that grows until the blow lands ----------
const TELE={list:[],geo:null,tc:null,tr:null,id:0,
  init(){if(this.geo)return;this.geo=new THREE.PlaneGeometry(1,1);this.geo.rotateX(-Math.PI/2);
    const mk=(w,h,f)=>{const [cv,x]=mkCanvas(w,h);const id=x.createImageData(w,h),D=id.data;
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=f((i+.5)/w*2-1,(j+.5)/h*2-1),k=(j*w+i)*4;D[k]=D[k+1]=D[k+2]=255;D[k+3]=clamp(a,0,1)*255}
      x.putImageData(id,0,0);const t=new THREE.CanvasTexture(cv);t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t};
    this.tc=mk(128,128,(u,v)=>{const r=Math.hypot(u,v);return r>1?0:r>.9?1-(r-.9)*3:.2+.14*r});
    this.tr=mk(32,128,(u,v)=>Math.max(Math.abs(u),Math.abs(v))>.88?1:.2)},
  mat(tex){return new THREE.MeshBasicMaterial({map:tex,color:0xff2a14,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})},
  // o: {k:'c', x,y,z, r, d} or {k:'r', x,y,z, yaw, w, l, d}: a strip from x,z running l metres along yaw; d = seconds until it lands
  add(o,remote){this.init();const T=Object.assign({},o,{t:0,id:++this.id});if(!(T.d>0))T.d=.6;
    T.m=[0,1].map(()=>{const m=new THREE.Mesh(this.geo,this.mat(T.k==='c'?this.tc:this.tr));m.renderOrder=3;m.frustumCulled=false;R.scene.add(m);return m});
    this.place(T,0);this.list.push(T);
    if(NET.host&&!remote)netEv('ept',{k:T.k,x:r2(T.x),y:r2(T.y),z:r2(T.z),r:r2(T.r||0),w:r2(T.w||0),l:r2(T.l||0),yaw:r3(T.yaw||0),d:r2(T.d)});return T},
  place(T,f){const [o,fl]=T.m;
    if(T.k==='c'){o.position.set(T.x,T.y+.04,T.z);o.scale.set(T.r*2,1,T.r*2);const s=Math.max(.02,f)*T.r*2;fl.position.set(T.x,T.y+.05,T.z);fl.scale.set(s,1,s)}
    else{const fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw),L=Math.max(.02,f)*T.l;o.position.set(T.x+fx*T.l/2,T.y+.04,T.z+fz*T.l/2);o.rotation.y=T.yaw;o.scale.set(T.w,1,T.l);
      fl.position.set(T.x+fx*L/2,T.y+.05,T.z+fz*L/2);fl.rotation.y=T.yaw;fl.scale.set(T.w,1,L)}
    const out=T.t>T.d?Math.max(0,1-(T.t-T.d)/.25):1;o.material.opacity=(.55+.4*Math.max(0,Math.sin(G.t*(f>.7?28:12))))*out;fl.material.opacity=(.25+.3*f)*out},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const T=this.list[i];T.t+=dt;if(T.t>T.d+.25){this.drop(T);this.list.splice(i,1);continue}this.place(T,clamp(T.t/T.d,0,1))}},
  drop(T){for(const m of T.m){R.scene.remove(m);m.material.dispose()}},
  clear(){for(const T of this.list)this.drop(T);this.list=[]},
  // a live warning over this point and the way out of it (bots step out)
  at(x,z,pad){pad=pad||0;for(const T of this.list){if(T.t>T.d)continue;
      if(T.k==='c'){const dx=x-T.x,dz=z-T.z,d=Math.hypot(dx,dz);if(d<T.r+pad)return {ax:d>.05?dx/d:1,az:d>.05?dz/d:0}}
      else{const fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw),rx=Math.cos(T.yaw),rz=-Math.sin(T.yaw),dx=x-T.x,dz=z-T.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;
        if(al>-pad&&al<T.l+pad&&Math.abs(sd)<T.w/2+pad){const s=sd>=0?1:-1;return {ax:rx*s,az:rz*s}}}}return null}};

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
    const b=EP.bossA();for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-K.tx,dz=h.c.z-K.tz,d=Math.hypot(dx,dz);if(d>3||Math.abs(h.c.y-K.ty)>2.5)continue;
      SCEN.pushHuman(h,dx/(d||1)*7,5,dz/(d||1)*7);h.dizzy=Math.max(h.dizzy,1.2);hurtHuman(h,EPD(30),b,{})}
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
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(27000*(.6+.4*H)*SC_DIFF.hp[d])},
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
    if(see&&c.onGround&&!S.enc&&(S.far>3&&t.c.y>c.y+1.5||S.far>9)&&d<26&&S.cd.lp<=0&&losClear(c.x,hy,c.z,t.c.x,Math.max(hy,t.c.y+3),t.c.z)){S.cd.lp=7;S.tg=t;this.face(a,t.c.x,t.c.z);this.start(a,'lw',.75*tw);this.fx({k:'w',i:a.id,s:1,n:0});return}
    if(!see){S.pt=.4;return}
    const P=S.enc?1:S.ph;
    if(P===2){
      if(S.cd.su<=0){S.cd.su=25;this.start(a,'su',.9);this.fx({k:'w',i:a.id,s:1,n:1});return}
      if(d<10.5&&S.cd.sm<=0){S.cd.sm=9;this.smashW(a,t);return}
      if(d>5&&d<22&&S.cd.sc<=0){S.cd.sc=7;this.chargeW(a,t,true);return}
      if(d<5&&S.cd.sl<=0){S.cd.sl=5;this.slamW(a);return}
      S.pt=.5;return}
    if(P===3){
      if(S.cd.ro<=0&&this.near(a,15)){S.cd.ro=20;this.start(a,'rw',1.2*tw);this.fx({k:'w',i:a.id,s:1.2,n:1});return}
      if(d<13&&S.cd.tr<=0){S.cd.tr=12;S.tg=t;S.trN=0;this.start(a,'trw',.6*tw);this.fx({k:'w',i:a.id,s:1,n:0});return}
      if(d>6&&d<22&&S.cd.ch<=0){S.cd.ch=6*.7;this.chargeW(a,t,false);return}
      const ft=this.far(a);if(ft&&S.cd.th<=0){S.cd.th=10;this.throwW(a,ft);return}
      if(d<7.5&&S.cd.sl<=0){S.cd.sl=5;this.slamW(a);return}
      S.pt=.5;return}
    // phase 1 (and the first meeting in the corridor: charges and slams only)
    const ft=S.enc?null:this.far(a);if(ft&&S.cd.th<=0){S.cd.th=10;this.throwW(a,ft);return}
    if(d>6&&d<22&&S.cd.ch<=0){S.cd.ch=6;this.chargeW(a,t,false);return}
    if(d<8&&S.cd.sl<=0){S.cd.sl=5;this.slamW(a);return}
    S.pt=.5},
  near(a,r){for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<r&&Math.abs(h.c.y-a.c.y)<5)return true;return false},
  // a throw target: the farthest human 14 m or more away, in sight and not inside a steam cloud
  far(a){const c=a.c;let best=null,bd=14;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<bd||d>34||STEAM.at(h.c.x,h.c.z))continue;
      if(!losClear(c.x,c.y+4.2,c.z,h.c.x,h.c.y+1.2,h.c.z))continue;bd=d;best=h}return best},
  chargeW(a,t,sh){const S=a.al,c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1,tw=EPTW();S.dx=dx/d;S.dz=dz/d;S.sc=!!sh;this.face(a,t.c.x,t.c.z);this.start(a,'cw',.7*tw);
    TELE.add({k:'r',x:c.x,y:c.y,z:c.z,yaw:a.yaw,w:sh?3.4:2.6,l:Math.min(19,16.5*(a.spdMul||1)+1),d:.7*tw});this.fx({k:'w',i:a.id,s:.7,n:0})},
  slamW(a){const c=a.c,tw=EPTW();this.start(a,'sw',.85*tw);TELE.add({k:'c',x:c.x,y:c.y,z:c.z,r:7.5,d:.85*tw});this.fx({k:'w',i:a.id,s:1,n:1})},
  smashW(a,t){const c=a.c,tw=EPTW();this.face(a,t.c.x,t.c.z);this.start(a,'smw',1*tw);TELE.add({k:'r',x:c.x,y:c.y,z:c.z,yaw:a.yaw,w:3,l:10,d:1*tw});this.fx({k:'w',i:a.id,s:1.3,n:1})},
  throwW(a,h){a.al.tg=h;this.face(a,h.c.x,h.c.z);this.start(a,'tw',1*EPTW());this.fx({k:'w',i:a.id,s:1,n:0})},
  triStep(a){const S=a.al,c=a.c,t=S.tg&&S.tg.alive?S.tg:(a.bot&&a.bot.target);let dx=0,dz=0;if(t&&t.alive){dx=t.c.x-c.x;dz=t.c.z-c.z}const d=Math.hypot(dx,dz)||1,st=Math.min(4,Math.max(0,d-2));
    const x=c.x+dx/d*st,z=c.z+dz/d*st,T=this.leap(a,x,c.y,z,.7);if(st>.1)this.face(a,x,z);TELE.add({k:'c',x,y:c.y,z,r:6,d:Math.max(.35,T)});this.start(a,'tr',Math.max(.45,T));this.fx({k:'w',i:a.id,s:1,n:1})},
  step(a,dt,S){const c=a.c;
    switch(S.mode){
    case 'cw':{a.an.skill=Math.max(a.an.skill,.6);a.yaw=Math.atan2(-S.dx,-S.dz);if(S.mt<=0){this.start(a,'ch',1.1);S.hits=new Set();S.lx=c.x;S.lz=c.z;S.chT=0;S.blk=0;AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:80});if(NET.host)netEv('scbo',{k:0,i:a.id})}break}
    case 'ch':{const v=15*(a.spdMul||1);a.kvx=S.dx*v;a.kvz=S.dz*v;a.mvx=a.mvz=0;a.yaw=Math.atan2(-S.dx,-S.dz);S.chT+=dt;
      if(Math.random()<dt*30)FX.spawn({x:c.x+rr(-.6,.6),y:c.y+.1,z:c.z+rr(-.6,.6),vy:rr(.3,.9),life:rr(.5,.9),s0:.3,s1:1,r:.4,g:.36,b:.3,a:.5,f:2,drag:2});
      for(const h of SCEN.H){if(!h.alive||S.hits.has(h))continue;if(Math.hypot(h.c.x-c.x,h.c.z-c.z)<c.hw+(S.sc?1.7:1.2)&&Math.abs(h.c.y-c.y)<2.6){S.hits.add(h);let dm=25;
          if(S.sc&&rayCast(h.c.x,h.c.y+1,h.c.z,S.dx,0,S.dz,2.2))dm+=20;// pinned against a wall
          SCEN.pushHuman(h,S.dx*13,7,S.dz*13);hurtHuman(h,EPD(dm),a,{claw:1})}}
      // a wall or a pillar in the way: it slams into it and reels
      const mv=Math.hypot(c.x-S.lx,c.z-S.lz);S.lx=c.x;S.lz=c.z;if(S.chT>.15&&mv<v*dt*.3)S.blk+=dt;else S.blk=0;
      if(S.blk>.05){a.kvx=a.kvz=0;this.start(a,'stun',1.5);this.grog(a,20);this.fx({k:'wall',i:a.id,x:r2(c.x+S.dx*1.1),y:r2(c.y),z:r2(c.z+S.dz*1.1)});EP.say('aWall');break}
      if(S.mt<=0){a.kvx*=.2;a.kvz*=.2;S.mode='';S.pt=rr(1,1.8)}break}
    case 'sw':{a.an.skill=Math.max(a.an.skill,.3);if(S.mt<=0){S.mode='';S.pt=rr(1.2,2);this.slam(a,7.5,12,35)}break}
    case 'lw':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0){const t=S.tg;let T=1;if(t&&t.alive){T=this.leap(a,t.c.x,t.c.y,t.c.z,2);TELE.add({k:'c',x:t.c.x,y:t.c.y,z:t.c.z,r:7.5,d:T});AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:90,rate:.8})}this.start(a,'lp',T+.6)}break}
    case 'lp':{if(!a.leapV||S.mt<=0){S.mode='';S.pt=rr(1.5,2.5);S.far=0;this.slam(a,7.5,12,35)}break}
    case 'tw':{a.an.skill=Math.max(a.an.skill,1);if(S.mt<=0){S.mode='';S.pt=rr(1,1.6);const h=S.tg;if(h&&h.alive)this.throwRock(a,h)}break}
    case 'smw':{a.an.skill=Math.max(a.an.skill,.9);if(S.mt<=0){S.mode='';S.pt=rr(1.2,2);this.smash(a)}break}
    case 'su':{a.an.skill=Math.max(a.an.skill,.8);if(S.mt<=0){S.mode='';S.pt=1;this.fx({k:'roar',i:a.id});this.summon(a,4,true,true)}break}
    case 'rw':{a.an.skill=Math.max(a.an.skill,.5+.5*Math.abs(Math.sin(G.t*14)));if(S.mt<=0){S.mode='';S.pt=1;this.roar(a)}break}
    case 'trw':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0)this.triStep(a);break}
    case 'tr':{if(!a.leapV||S.mt<=-.4){this.slam(a,6,15,25);S.trN++;if(S.trN>=3){S.mode='';S.pt=rr(1.4,2)}else this.triStep(a)}break}
    case 'down':case 'stun':{a.kvx*=.8;a.kvz*=.8;if(S.mt<=0){S.mode='';S.pt=.8}break}
    // 60 %: a leap to the north bulkhead, it tears a leaf out of the frame and keeps it as a shield; the cold room behind lets the infected out
    case 'p2a':{a.an.skill=Math.max(a.an.skill,.7);if(S.mt<=0){const B=MAP.ez.bulk,T=this.leap(a,B[0],0,B[2]+2.6,3);this.start(a,'p2l',T+.6)}break}
    case 'p2l':{if(!a.leapV||S.mt<=0){this.face(a,0,25);this.start(a,'p2b',1.7);this.fx({k:'rip'})}break}
    case 'p2b':{a.an.skill=1;this.face(a,0,25);if(S.mt<=0){S.mode='';S.pt=1.2;S.shield=true;S.sh=S.shMax;EP.gateOpen('gN',true);this.fx({k:'shon',i:a.id});this.summon(a,6,true,true);EP.say('aP2')}break}
    // 25 %: it throws the leaf down and roars; the power dies, red strobes, everything faster
    case 'p3a':{a.an.skill=Math.max(a.an.skill,.5+.5*Math.abs(Math.sin(G.t*12)));if(S.mt<=0){S.mode='';S.pt=1;this.fx({k:'roar',i:a.id,b:1});EP.setDark(true);
      if(S.shield){S.shield=false;this.fx({k:'shd',i:a.id,x:r2(c.x-Math.sin(a.yaw)*1.4),y:r2(c.y),z:r2(c.z-Math.cos(a.yaw)*1.4),yw:r3(a.yaw)})}this.summon(a,3,false);EP.say('aP3')}break}
    // the first meeting ends: a roar, a leap back through the hole it made, gone
    case 'ret':{a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0){const W=MAP.ez.wallW,T=this.leap(a,W[0],0,W[2]-5,2.2);this.start(a,'ret2',T+.8)}break}
    case 'ret2':{if(!a.leapV||S.mt<=0){S.mode='gone';EP.encEnd(a)}break}}},
  slam(a,R,lo,hi){const c=a.c;SCEN.slamFx(c.x,c.y,c.z);if(NET.host)netEv('scsl',{x:r2(c.x),y:r2(c.y),z:r2(c.z)});
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-c.y)>2.5)continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*10*f,4+5*f,dz/(d||1)*10*f);hurtHuman(h,EPD(lo+(hi-lo)*f),a,{})}},
  smash(a){const c=a.c,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);this.fx({k:'smash',x:r2(c.x),y:r2(c.y),z:r2(c.z),yw:r3(a.yaw)});
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<-.5||al>10.5||Math.abs(sd)>1.5+h.c.hw||Math.abs(h.c.y-c.y)>2.5)continue;
      SCEN.pushHuman(h,fx*6+rx*Math.sign(sd||1)*3,6,fz*6+rz*Math.sign(sd||1)*3);h.dizzy=Math.max(h.dizzy,1.4);hurtHuman(h,EPD(45),a,{})}},
  throwRock(a,h){const c=a.c,T=1.05,tx=h.c.x+h.c.vx*.55,tz=h.c.z+h.c.vz*.55;let ty=floorBelow(tx,h.c.y+1.2,tz,.2);if(!(ty>-50))ty=h.c.y;
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),x0=c.x+fx*1.2,y0=c.y+4.6,z0=c.z+fz*1.2,K=ROCK.throw(x0,y0,z0,tx,ty,tz,T);TELE.add({k:'c',x:tx,y:ty,z:tz,r:3,d:T});
    AU.at('zatk',c.x,c.y+3,c.z,{vol:1,range:60,rate:.6});if(NET.host)netEv('epx',{k:'th',id:K.id,a:[r2(x0),r2(y0),r2(z0),r2(tx),r2(ty),r2(tz)],T:r2(T)})},
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
  toPhase(a,n){const S=a.al;S.ph=n;S.invT=3.5;S.grog=0;S.rage=0;S.frT=S.exT=0;a.kvx=a.kvz=0;a.leapV=null;Object.assign(S.cd,{su:10,sm:3,sc:2,tr:3,ro:6,ch:3,sl:1,th:5});
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
  devShot(b,a){if(NET.ghost||!a||a.team!==TH||!EP.on||EP.st!==4)return;const o=b.o;
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
  clear(){TELE.clear();ROCK.clear();STEAM.clear();CHAIN.off(false);for(const m of this.props){R.scene.remove(m);m.material.dispose()}this.props=[];
    const E=MAP.ez;if(E){for(const p of E.panels)p.used=false;for(const v of E.valves)v.cd=0}},
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

// ---------- hooks ----------
(function(){
  // damage in: the shield, the tank, the gauges, the phase floors (host); the episode's grabs come off with 150 damage
  const da0=damageActor;damageActor=function(t,dmg,src,o){
    if(!(EP.on&&t&&t.alive&&t.team===TZ&&t.scen))return da0(t,dmg,src,o);
    if(t.zc==='aleph'&&src&&src.isPlayer){const shOn=NET.cli?!!(EP.bf&&EP.bf.f&1):!!(t.al&&t.al.shield);if(shOn)ALEPH.shieldSpark(t,o)}
    if(NET.cli||NET.ghost)return da0(t,dmg,src,o);
    if(t.zc==='aleph'&&t.al)dmg=ALEPH.hit(t,dmg,src,o||{});
    const r=da0(t,dmg,src,o);
    if(r>0){if(t.zc==='aleph'&&t.al)ALEPH.after(t,r);else if(t.zc==='strait'&&t.st&&t.st.mode==='grab'){t.st.dmg+=r;if(t.st.dmg>=150)STRAIT.release(t,true)}}
    return r};
  // ALEPH's claws hit hard and shove; the straitjacket zombie has none
  const ca=clawApply;clawApply=function(a,t,heavy){if(EP.on&&a&&a.scen){if(a.zc==='strait')return;
      if(a.zc==='aleph'){aimDir(a.yaw,0,_dv);const kb=heavy?7:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,2,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?24:16),a,{claw:1});return}}
    return ca(a,t,heavy)};
  // the rig's extras every frame (all pages)
  const uv0=updateVisual;updateVisual=function(a,dt){const al=a.zc==='aleph'&&a.team===TZ;if(al)ALEPH.pre(a,dt);uv0(a,dt);if(al)ALEPH.attach(a)};
  Object.assign(CLIH,{
    epx(L,m){ALEPH.fxApply(m)},
    ept(L,m){TELE.add({k:m.k,x:m.x/100,y:m.y/100,z:m.z/100,r:m.r/100,w:m.w/100,l:m.l/100,yaw:m.yaw/1000,d:m.d/100},true)}});
  Object.assign(HOSTH,{
    eppn(L,m){if(EP.on&&EP.st===4&&actorOfKey(L.key))ALEPH.panel(m.i|0)},
    epvl(L,m){const V=EP.on&&MAP.ez&&MAP.ez.valves[m.i|0];if(V&&EP.st===4&&G.t>=(V.cd||0)){V.cd=G.t+12;ALEPH.fx({k:'st',i:m.i|0})}}});
})();

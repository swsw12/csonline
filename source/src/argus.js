'use strict';
// ============ Chapter 2 「아르고스」: the boss ARGUS (RT1-07), the RT-1 squad zombie, the plaza's floodlights, tripwires ============
// episode.js runs the story; this file is what fights in it (shared toys — lasers, enemy bullets, grenades, smoke, ammo boxes, scripted
// leaps — are in epbase.js). Host-authoritative: the host runs ARGUS's brain and every hit; clients get its gauges, pose, what it sees
// and the floodlights in the chapter snapshot (EP.pack → bsPack) and the moments as events ('eag').
// ARGUS, RT-1's sniper, has 14,000 × (0.6 + 0.4 × humans) × difficulty health (about 26,000 for four on normal) and its own brain
// (EPZ.argus.ai: the scenario's zombie AI never runs for it). It shoots at what it can see: a flashlight, a floodlight's pool, a burning
// flare, a muzzle flash in the last 1.2 s or the lightning — at any range — and anyone within 15 m (all four lenses broken: 15 m for
// everything). A red laser sits on the target 1.5 s before the shot (60 and knocked flat; 40 through armour); cover catches it.
//   phase 1 (100–75 %) on the watchtowers: each miss is +1 pride; at 3 it moves to a closer tower and the next three warnings are 1 s.
//            Losing 8 % on one tower also sends it to another: a jump down, a sprint and a jump up, ×1.3 damage taken on the way.
//            Nobody in sight for 4 s: a flare onto the nearest one hiding (15 s).
//   75 %     it jumps down into the plaza (4 m, 20)
//   phase 2 (75–30 %) on the ground, cover to cover: SMG bursts (0.6 s aim, 2 s, 6 a round), flashbangs (look away), two tripwires
//            where it has just been (25 and knocked flat)
//   30 %     it goes on all fours
//   phase 3 (30–0 %) leaping between the towers, the wreck and the containers: double shots (1 s laser, 35 each), smoke round itself
// Weak points and stagger: four night-vision lenses (headshots chip them; 3 % of its health each; a broken one +30 stagger), a player's
// flare bursting within 3 m (+40), HE (+15), frost (+10 and a slow). Full gauge: down 6 s (×1.5 damage), the next one 25 % longer.
// Swing a floodlight (hold E at its box, 3 s) onto the tower it stands on: the night vision burns out — it falls off and lies 5 s;
// that light is spent for 20 s. Standing in a floodlight's pool on the ground (phases 2, 3) stagger it +25 a second.
// Every phase change is 3.5 s of invulnerability and gets the whole team back up; enraged after 240 s (expert 180).
const AG_PH=[1,.75,.3],AG_S=1.3;
const AG_POSE=['','aim','smg','throw','idle','beast','down','perch','smgc'];
const AG_MIX=[['rager',40],['runner',30],['squad',30]];

// ---------- atlas materials: the night-vision glass and the floodlight lens (both glow) ----------
const AG_MATS=['epNvg','epFlood'];
for(const m of AG_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintAgAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  // night vision: deep green glass, a bright core, a faint honeycomb
  patch('epNvg',(xx,y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v);let c=r<.35?'#d8ffb0':r<.72?'#6cff5a':'#2aa830';if(((xx>>2)+(y>>2))%5===0)c=r<.5?'#b8ff90':'#38c040';return c},232);
  // the floodlight: white-hot middle, warm rim, the reflector's facets
  patch('epFlood',(xx,y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v);let c=r<.5?'#fffef0':r<.86?'#fff0b8':'#e8c878';
    if(Math.abs(u*6-Math.round(u*6))<.07||Math.abs(v*6-Math.round(v*6))<.07)c=r<.6?'#fff8d8':'#d8b868';return c},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintAgAtlas()}}

// ---------- props (the weapon material): a lens, a floodlight head, a tripwire's emitter ----------
Object.assign(GUNS,{
  epLens:{parts:[Pt(0,0,-.004,.036,.036,.012,'epNvg',{r:.017}),Pt(0,0,.004,.042,.042,.006,'blk',{r:.02})],grip:[0,0,0],muzzle:[0,0,0]},
  // housing, the lens on its front (-z), a rain hood, the yoke's pivots, the cooling fins at the back
  epFloodH:{parts:[Pt(0,0,0,.9,.62,.42,'gunmetal',{r:.05}),Pt(0,0,-.214,.78,.52,.02,'epFlood',{r:.04}),Pt(0,.335,-.12,.96,.04,.3,'blk2'),Pt(-.475,0,0,.05,.16,.16,'steel'),Pt(.475,0,0,.05,.16,.16,'steel'),
    ...[-.3,-.15,0,.15,.3].map(x=>Pt(x,0,.235,.03,.46,.05,'blk2'))],grip:[0,0,0],muzzle:[0,0,0]},
  epTrip:{parts:[Pt(0,.06,0,.12,.12,.08,'olive',{r:.015}),Pt(0,.075,-.041,.03,.03,.004,'red'),Pt(0,.005,0,.16,.012,.1,'blk2')],grip:[0,0,0],muzzle:[0,0,0]}});

// ---------- the plaza's floodlights: four heads that swing, a beam, a pool of light (every page; the host decides) ----------
// F.s: 'p' the plaza (a pool in front of the pole), 0..3 a watchtower, 'x' off. F.p: the use progress (3 s, any human at the box),
// F.cd: spent after burning ARGUS's night vision out (20 s, then back on the plaza), F.sw: the swing still under way (host).
const FLOOD={L:[],T:3,geo:null,
  init(){if(this.geo)return;const g=new THREE.CylinderGeometry(.08,1,1,20,1,true);g.rotateX(-Math.PI/2);g.translate(0,0,.5);
    const p=g.attributes.position,col=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const k=1-.85*p.getZ(i);col[i*3]=col[i*3+1]=col[i*3+2]=k}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));this.geo=g},
  build(){if(this.L.length||!MAP.ez||!MAP.ez.floods)return;this.init();const E=MAP.ez;
    E.floods.forEach((f,i)=>{const head=new THREE.Mesh(gunGeo('epFloodH'),matGun());head.position.set(f.x,f.y,f.z);head.rotation.order='YXZ';R.scene.add(head);sampleProbe(f.x,f.y,f.z,head.material.uniforms.uProbe.value);
      const mat=new THREE.MeshBasicMaterial({color:0xfff0c8,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
      const beam=new THREE.Mesh(this.geo,mat);beam.frustumCulled=false;beam.renderOrder=2;beam.visible=false;R.scene.add(beam);
      const pp=[lerp(f.x,E.pad[0],.5),0,lerp(f.z,E.pad[2],.5)];
      const F={i,f,s:'x',cd:0,p:0,sw:0,head,beam,mat,pp,ay:0,ap:-.4,on:0,aim:new THREE.Vector3(),light:DL.add(pp[0],3,pp[2],'#fff0d0',17,0,0)};
      this.aimPt(F);const A=this.angles(F);F.ay=A[0];F.ap=A[1];this.L.push(F)})},
  // where a state points: the pool on the plaza, the top of a watchtower (off keeps the last aim)
  aimPt(F){const T=typeof F.s==='number'?MAP.ez.towers[F.s]:null;if(T)F.aim.set(T.x,T.y+1.2,T.z);else if(F.s==='p')F.aim.set(F.pp[0],0,F.pp[2]);return F.aim},
  angles(F){const f=F.f,dx=F.aim.x-f.x,dy=F.aim.y-f.y,dz=F.aim.z-f.z;return [Math.atan2(-dx,-dz),Math.atan2(dy,Math.hypot(dx,dz))]},
  code(s){return s==='p'?-1:s==='x'?-2:s},dec(c){return c===-1?'p':c===-2?'x':c},
  set(i,s,cd,remote){const F=this.L[i];if(!F)return;const was=F.s;F.s=s;F.cd=cd||0;this.aimPt(F);
    if(was!==s)AU.at(s==='x'?'dry':'spinup',F.f.x,F.f.y,F.f.z,{vol:s==='x'?.8:.55,range:70,rate:s==='x'?.6:1.3});
    if(NET.host&&!remote)netEv('eag',{k:'fl',i,s:this.code(s),cd:Math.ceil(cd||0)})},
  // the bulb blows: sparks, off for 20 s
  spend(F){F.sw=0;F.p=0;this.set(F.i,'x',20);const f=F.f;for(let k=0;k<26;k++)FX.spawn({x:f.x,y:f.y,z:f.z,vx:rr(-4,4),vy:rr(0,4),vz:rr(-4,4),life:rr(.2,.5),s0:.06,s1:.02,r:1,g:.9,b:.6,f:0,grav:9,add:1});
    AU.at('dischit',f.x,f.y,f.z,{vol:.9,range:70});if(NET.host)netEv('eag',{k:'fsp',i:F.i})},
  reset(on){for(const F of this.L){F.s=on?'p':'x';F.cd=0;F.p=0;F.sw=0;this.aimPt(F)}},
  near(F,h){return Math.hypot(h.c.x-F.f.bx,h.c.z-F.f.bz)<1.9&&Math.abs(h.c.y)<1.8},
  // a human (or any point) inside a light's pool: 6.5 m round the plaza spot, 9 m round the foot of a lit tower
  lit(x,y,z){for(const F of this.L){if(F.on<.5||F.s==='x')continue;if(F.s==='p'){if(Math.hypot(x-F.pp[0],z-F.pp[2])<6.5&&y<4)return F}
      else{const T=MAP.ez.towers[F.s];if(Math.hypot(x-T.x,z-T.z)<9)return F}}return null},
  onTower(k){for(const F of this.L)if(F.s===k&&F.on>.3)return F;return null},
  update(dt){for(const F of this.L){const A=this.angles(F),k=Math.min(1,dt*2.4);F.ay+=wrapA(A[0]-F.ay)*k;F.ap+=(A[1]-F.ap)*k;
      const on=F.s!=='x'&&EP.pow>.5;F.on=approach(F.on,on?1:0,dt*(on?2.5:4));F.head.rotation.set(F.ap,F.ay,0);
      // the beam: from the lens along where the head points right now, out to whatever it lands on
      const cp=Math.cos(F.ap),fx=-Math.sin(F.ay)*cp,fy=Math.sin(F.ap),fz=-Math.cos(F.ay)*cp,ox=F.f.x+fx*.3,oy=F.f.y+fy*.3,oz=F.f.z+fz*.3;
      const far=Math.hypot(F.aim.x-ox,F.aim.y-oy,F.aim.z-oz)+3,h=rayCast(ox,oy,oz,fx,fy,fz,far,SHOT_FILTER),L=h?Math.max(1,h.t):far,ex=ox+fx*L,ey=oy+fy*L,ez=oz+fz*L;
      F.beam.visible=F.on>.02;if(F.beam.visible){F.beam.position.set(ox,oy,oz);F.beam.lookAt(ex,ey,ez);const r=Math.max(.6,L*.2);F.beam.scale.set(r,r,L);F.mat.opacity=.1*F.on}
      F.light.x=ex-fx*1.2;F.light.y=ey-fy*1.2+.6;F.light.z=ez-fz*1.2;F.light.i=2.5*F.on;F.light.r=typeof F.s==='number'?12:17;
      F.head.material.uniforms.uEmisA.value=.15+2.6*F.on}},
  pack(){const o=[];for(const F of this.L)o.push(this.code(F.s),Math.round(F.p*10),Math.ceil(F.cd));return o},
  unpack(a){for(let i=0;i<this.L.length;i++){const F=this.L[i],c=a[i*3];if(c==null)continue;const s=this.dec(c);if(s!==F.s)this.set(i,s,a[i*3+2],true);F.p=(a[i*3+1]||0)/10;F.cd=a[i*3+2]||0}},
  clear(){for(const F of this.L){R.scene.remove(F.head);F.head.material.dispose();R.scene.remove(F.beam);F.mat.dispose();F.light.dead=true}this.L=[]}};

// ---------- tripwires (phase 2): red lines ARGUS leaves where it has just been; walking through one sets it off (25, knocked flat) ----------
const TRAP={list:[],id:0,geo:null,mat:null,
  init(){if(this.geo)return;this.geo=new THREE.BoxGeometry(1,1,1);this.geo.translate(0,0,.5);this.mat=new THREE.MeshBasicMaterial({color:0xff2010,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})},
  // host: a line len m across the heading yaw at (x, z), cut short at a wall either side
  lay(x,y,z,yaw,len){const rx=Math.cos(yaw),rz=-Math.sin(yaw),h=y+.3;let a=len/2,b=len/2;
    const w1=rayCast(x,h,z,rx,0,rz,len/2,SHOT_FILTER);if(w1)a=Math.max(.3,w1.t-.06);const w2=rayCast(x,h,z,-rx,0,-rz,len/2,SHOT_FILTER);if(w2)b=Math.max(.3,w2.t-.06);
    return this.add(x-rx*b,z-rz*b,x+rx*a,z+rz*a,y)},
  add(x0,z0,x1,z1,y,remote,id){this.init();const T={id:id||++this.id,x0,z0,x1,z1,y,t:0,life:22,m:[]};
    const L=new THREE.Mesh(this.geo,this.mat);L.position.set(x0,y+.3,z0);L.lookAt(x1,y+.3,z1);L.scale.set(.022,.022,Math.max(.1,Math.hypot(x1-x0,z1-z0)));L.frustumCulled=false;L.renderOrder=4;R.scene.add(L);T.m.push(L);
    for(const [x,z,ox,oz] of [[x0,z0,x1,z1],[x1,z1,x0,z0]]){const e=new THREE.Mesh(gunGeo('epTrip'),matGun());e.position.set(x,y+.24,z);e.lookAt(ox,y+.24,oz);e.rotateY(Math.PI);R.scene.add(e);sampleProbe(x,y+.5,z,e.material.uniforms.uProbe.value);T.m.push(e)}
    this.list.push(T);AU.at('pin',(x0+x1)/2,y+.3,(z0+z1)/2,{vol:.6,range:25,rate:.8});
    if(NET.host&&!remote)netEv('eag',{k:'tr',id:T.id,a:[r2(x0),r2(z0),r2(x1),r2(z1)],y:r2(y)});return T},
  seg(x,z,T){const dx=T.x1-T.x0,dz=T.z1-T.z0,l=dx*dx+dz*dz||1,u=clamp(((x-T.x0)*dx+(z-T.z0)*dz)/l,0,1),cx=T.x0+dx*u-x,cz=T.z0+dz*u-z;return Math.hypot(cx,cz)},
  update(dt){if(this.mat)this.mat.opacity=.5+.35*Math.abs(Math.sin(G.t*8));
    for(let i=this.list.length-1;i>=0;i--){const T=this.list[i];T.t+=dt;if(T.t>T.life){this.drop(T);this.list.splice(i,1);continue}if(NET.cli)continue;
      for(const h of SCEN.H){if(!h.alive||h.team!==TH||Math.abs(h.c.y-T.y)>.7)continue;if(this.seg(h.c.x,h.c.z,T)<(h.c.hw||.3)+.05){this.fire(T,h);break}}}},
  fire(T,h){const b=EP.bossA();hurtHuman(h,EPD(25),b,{});epFx(h,'kd',1.2);this.boom(T,h.c.x,h.c.z);this.kill(T);if(NET.host)netEv('eag',{k:'trx',id:T.id,x:r2(h.c.x),z:r2(h.c.z)})},
  boom(T,x,z){const y=T.y+.3;for(let k=0;k<22;k++)FX.spawn({x,y,z,vx:rr(-4,4),vy:rr(.5,4),vz:rr(-4,4),life:rr(.2,.5),s0:.06,s1:.02,r:1,g:.5,b:.2,f:0,grav:9,add:1});
    for(let k=0;k<10;k++)FX.spawn({x:x+rr(-.4,.4),y:y+rr(0,.6),z:z+rr(-.4,.4),vy:rr(.2,.8),life:rr(.8,1.4),s0:.3,s1:1.1,r:.4,g:.38,b:.36,a:.5,f:2,drag:1.4});
    DL.add(x,y+.4,z,'#ff7a3a',7,2,.18);AU.at('explode',x,y,z,{vol:.6,range:50,rate:1.8,occ:false})},
  kill(T){const i=this.list.indexOf(T);if(i>=0)this.list.splice(i,1);this.drop(T)},
  drop(T){for(const m of T.m){R.scene.remove(m);if(m.material!==this.mat)m.material.dispose()}T.m=[]},
  byId(id){return this.list.find(T=>T.id===id)||null},
  // a bot about to walk into one: away from the line
  danger(a){const c=a.c;for(const T of this.list){if(Math.abs(c.y-T.y)>1)continue;const d=this.seg(c.x,c.z,T);if(d>1.3)continue;
      const dx=T.x1-T.x0,dz=T.z1-T.z0,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,s=(c.x-T.x0)*nx+(c.z-T.z0)*nz>=0?1:-1;return {ax:nx*s,az:nz*s}}return null},
  clear(){for(const T of this.list)this.drop(T);this.list=[]}};

// ---------- ARGUS ----------
const _agE=new THREE.Vector3(),_agV=new THREE.Vector3();
const ARGUS={cur:null,encNext:false,ltnT:0,H:null,
  zc:'argus',name:['아르고스','ARGUS'],code:'RT1-07',ticks:[75,30],g2:['자존심','PRIDE'],darkPh:0,
  wake:['아르고스가 조준하기까지','ARGUS takes aim in'],goText:['아르고스가 조준을 시작했다','ARGUS IS TAKING AIM'],deadText:['아르고스 무력화','ARGUS IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(14000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.ag&&a.ag.enc)},
  holds(){if(!this.H)this.H={rifle:holdFor('r700'),smg:holdFor('um45'),nade:holdFor('he')};return this.H},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: on the NE tower, rifle low (a phase replay: phase 2 in the plaza, phase 3 on the wreck)
  prepSpawn(kind,bp){let b=EP.bossA();const E=MAP.ez,T=E.towers[1];
    if(!b)b=this.spawn([T.x,T.y,T.z],0,false);else if(kind!=='phase')this.init(b,false);if(!b)return;
    if(kind==='phase')this.reset(b,bp);const S=b.ag;
    if(kind==='phase'&&bp===2){const n=navSnap(20,0,-58,4);placeAt(b,n?n.x:20,n?n.y:0,n?n.z:-58,Math.PI);S.tw=-1}
    else if(kind==='phase'&&bp===3){const P=E.perch[4];placeAt(b,P.x,P.y,P.z,Math.PI);S.tw=-1;S.perch=4}
    else{placeAt(b,T.x,T.y,T.z,0);S.tw=1}
    this.face(b,34,-15);S.idle=true;b.agPose=S.ph===2?'smgc':S.ph===3?'perch':'idle'},
  go(b){const S=b.ag;if(!S)return;S.idle=false;S.pt=1.2;S.ltnN=rr(10,18)},
  // the first meeting: on the command post's tower, sniping at the team crossing the yard; gone once the records are in
  // (or once it has lost a tenth of its health)
  meetStart(E){const T=MAP.ez.towerC,a=this.spawn([T.x,T.y,T.z],Math.PI/2,true);if(a){E.a=a;a.ag.idle=false;a.ag.tw=-2;a.ag.pt=1.6}EP.say('enc');EP.later(2.4,()=>EP.say('enc2'));EP.later(5.5,()=>EP.say('aMeet'))},
  meetTick(){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.ag)this.retreat(E.a)},
  // the boss slot of the pool comes back as ARGUS
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='argus';a.deadT=99;this.encNext=!!enc;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){const m=a.maxHp||1;
    a.ag={ph:1,mode:'',mt:0,mt0:1,pt:2,tw:-1,lastTw:-1,perch:-1,dest:-1,moving:false,cd:{fl:8,smg:2,fb:5,tr:3,smk:4,sn:0},pride:0,angry:0,hits:0,
      grog:0,grogN:0,grogMax:100,lens:[m*.03,m*.03,m*.03,m*.03],lensN:4,invT:0,enr:false,fightT:0,enc:!!enc,idle:!enc,tg:null,noSee:0,dmgT:0,slowT:0,burnT:0,
      ltn:-9,ltnN:rr(14,24),sv:[],svS:[],svT:0,spot:null,spotT:0,atk:0,goT:0,hopT:0,n2:0,burstT:0,tk:'fb',trap2:false,d0:0,fBot:-1,fIdx:-1,fT:0,ptN:1.5};
    a.agPose='idle';a.agPitch=0;a.agKick=0;a.agAtk=0;a.agThT=0;a.agBurn=0;a.agLens=15;a.epDown=0;a.kin=null;a.epHide=true},
  // a retry of the boss fight starts the phase it reached again, at that phase's health (the lenses stay as they were)
  reset(a,ph){const L=a.ag?a.ag.lens.slice():null;a.hp=a.maxHp*AG_PH[ph-1];this.init(a,false);const S=a.ag;S.ph=ph;S.idle=true;if(L){S.lens=L;S.lensN=L.filter(v=>v>0).length}
    a.leapV=null;a.kin=null;a.kvx=a.kvz=0;a.frozen=0},
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=Math.atan2(-(x-a.c.x),-(z-a.c.z))},
  eye(a){return a.head&&a.head.y>a.c.y?a.head:_agE.set(a.c.x,a.c.y+2.3,a.c.z)},
  muz(a){return a.epMuz||this.eye(a)},
  fx(m){this.fxApply(m);if(NET.host)netEv('eag',m)},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}const P=MAP.ez.pad;return n?[x/n,0,z/n]:[P[0],0,P[2]]},
  nearH(a,r){for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<r&&Math.abs(h.c.y-a.c.y)<4)return h;return null},
  nearestH(a,r){const e=this.eye(a);let best=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&losClear(e.x,e.y,e.z,h.c.x,h.c.y+1.3,h.c.z)){bd=d;best=h}}return best},
  // ---------- what it sees: score 4 a flashlight, 3 a floodlight / a flare / the lightning, 2 a muzzle flash, 1 just close; 0 nothing ----------
  sees(a,h){if(!h.alive||h.team!==TH)return 0;const S=a.ag,c=a.c,e=this.eye(a),d=Math.hypot(h.c.x-c.x,h.c.z-c.z);
    if(ESMK.at(h.c.x,h.c.z,0)&&d>4)return 0;
    const lit=h.flash?3:FLOOD.lit(h.c.x,h.c.y,h.c.z)||this.flareLit(h)||G.t<S.ltn?2:G.t-(h.lastFire==null?-9:h.lastFire)<1.2?1:0;
    if(d>(S.lensN>0&&lit?95:15))return 0;
    if(!losClear(e.x,e.y,e.z,h.c.x,h.c.y+1.25,h.c.z)&&!losClear(e.x,e.y,e.z,h.c.x,h.c.y+1.65,h.c.z))return 0;return lit+1},
  flareLit(h){for(const n of NADES)if(n.kind==='flare'&&n.lit&&Math.hypot(n.x-h.c.x,n.z-h.c.z)<9)return true;return false},
  look(a){const S=a.ag;S.sv=[];S.svS=[];for(const h of SCEN.H){const s=this.sees(a,h);if(s){S.sv.push(h);S.svS.push(s)}}},
  pick(a){const S=a.ag;let best=null,bs=-1,bd=1e9;for(let i=0;i<S.sv.length;i++){const h=S.sv[i],s=S.svS[i],d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(!h.alive)continue;if(s>bs||s===bs&&d<bd){bs=s;bd=d;best=h}}return best},
  // the one it cannot see that is nearest (a flare goes there)
  hidden(a){const S=a.ag;let best=null,bd=70;for(const h of SCEN.H){if(!h.alive||S.sv.includes(h))continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd){bd=d;best=h}}return best},
  // ---------- host: the brain (EPZ.argus.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.ag;if(!S)return true;const c=a.c,cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.burnT=Math.max(0,S.burnT-dt);
    // frost: no freeze, a slow and a little stagger
    if(a.frozen>0){a.frozen=0;c.vx=c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone';
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('aEnr')}}
    const cdm=S.enr?1/.7:1;for(const k in S.cd)S.cd[k]-=dt*cdm;
    a.spdMul=(S.enr?1.3:1)*(S.slowT>0?.6:1);
    S.svT-=dt;if(S.svT<=0){S.svT=.25;this.look(a)}
    // the night vision overloads in a floodlight's pool (on the ground)
    if(live&&S.ph>=2&&!S.enc&&!a.kin&&c.y<3.5&&FLOOD.lit(c.x,c.y,c.z))this.grog(a,25*dt);
    if(!live){a.agPose=S.ph===2?'smgc':S.ph===3?'perch':'idle';if(S.mode==='ret'||S.mode==='ret2'){S.mt-=dt;this.step(a,dt,S)}return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(a.kin)return true;
    if(S.enc||S.ph===1)this.p1(a,dt,S);else if(S.ph===2)this.p2(a,dt,S);else this.p3(a,dt,S);
    return true},
  // phase 1 (and the first meeting): a tower, the rifle
  p1(a,dt,S){a.agPose='idle';
    if(!S.enc&&S.tw<0){this.moveStart(a,S,this.towerPick(a,S,false));return}
    if(!S.enc&&S.dmgT>=a.maxHp*.08){this.moveStart(a,S,this.towerPick(a,S,false));return}
    const t0=this.pick(a);if(t0)this.face(a,t0.c.x,t0.c.z);
    S.pt-=dt;if(S.pt>0)return;
    if(!t0){S.noSee+=.4;S.pt=.4;if(!S.enc&&S.noSee>=4&&S.cd.fl<=0){const h=this.hidden(a);if(h){S.cd.fl=15;S.noSee=0;this.flareW(a,h,S)}}return}
    S.noSee=0;this.snipeW(a,t0,S,(S.angry>0?1:1.5)*EPTW())},
  // phase 2: the plaza floor, cover to cover, the SMG
  p2(a,dt,S){const c=a.c;a.agPose='smgc';
    if(c.y>3.2){const n=navSnap(c.x+rr(-3,3),0,c.z+rr(-3,3),5);if(n){S.mode='hop';S.mt=2.4;epKin(a,n.x,n.y,n.z,1,1,()=>{S.mode=''})}return}
    S.spotT+=dt;const close=this.nearH(a,5.5);
    if(!S.spot||S.atk>=2||S.spotT>10||close&&S.spotT>2.5){const prev=S.spot;S.spot=this.coverPick(a,S);S.atk=0;S.spotT=0;S.goT=0;
      if(prev&&S.spot&&S.cd.tr<=0){S.cd.tr=15;const yw=Math.atan2(-(S.spot[0]-c.x),-(S.spot[2]-c.z));TRAP.lay(c.x,floorY(c.x,c.y,c.z),c.z,yw,3.8);S.trap2=true;S.d0=Math.hypot(S.spot[0]-c.x,S.spot[2]-c.z)}}
    const sp=S.spot;if(!sp)return;const d=Math.hypot(sp[0]-c.x,sp[2]-c.z);
    if(d>1.3){if(S.trap2&&d<S.d0*.5){S.trap2=false;TRAP.lay(c.x,floorY(c.x,c.y,c.z),c.z,a.yaw,3.8)}this.walk(a,dt,S,sp,1.35);this.claw(a);return}
    if(this.claw(a))return;
    const t=this.pick(a)||this.nearestH(a,32);if(t)this.face(a,t.c.x,t.c.z);else S.spotT+=dt;
    S.pt-=dt;if(S.pt>0||!t)return;const e=this.eye(a),dd=Math.hypot(t.c.x-c.x,t.c.z-c.z),los=losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.2,t.c.z);
    if(!los){S.spotT+=1;S.pt=.4;return}
    if(S.cd.fb<=0&&dd>5&&dd<22&&Math.random()<.55){S.cd.fb=12;S.atk++;this.throwW(a,t,S,'fb');return}
    if(S.cd.smg<=0&&dd<32){S.cd.smg=7;S.atk++;this.smgW(a,t,S);return}
    S.pt=.4},
  // phase 3: on all fours from perch to perch, double shots, smoke
  p3(a,dt,S){a.agPose='perch';S.hopT-=dt;
    if(S.perch<0||S.hopT<=0||this.nearH(a,7)&&S.hopT<3){this.hop(a,S);return}
    if(S.cd.smk<=0&&this.nearH(a,26)){S.cd.smk=20;this.throwW(a,null,S,'sm');return}
    const t0=this.pick(a);if(t0)this.face(a,t0.c.x,t0.c.z);
    S.pt-=dt;if(S.pt>0)return;
    if(!t0){S.noSee+=.3;S.pt=.3;if(S.noSee>=4&&S.cd.fl<=0){const h=this.hidden(a);if(h){S.cd.fl=15;S.noSee=0;this.flareW(a,h,S)}}return}
    S.noSee=0;if(S.cd.sn<=0){S.cd.sn=6.5;S.n2=2;this.snipeW(a,t0,S,1*EPTW());return}S.pt=.3},
  // a claw at whoever is right on it
  claw(a){const h=this.nearH(a,2.1);if(!h||Math.abs(h.c.y-a.c.y)>1.5)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  // walking on the plaza floor: the nav path, the body turned the way it runs
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1.4;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,10);AI.moveDir(a,wx,wz)}a.spdMul*=mul},
  // ---------- the rifle ----------
  snipeW(a,t,S,w){S.tg=t;S.mode='aim';S.mt=w;this.face(a,t.c.x,t.c.z);ELAS.add(a,t,w);this.fx({k:'w',i:a.id,s:'aim'})},
  fire(a,S){const t=S.tg,m=this.muz(a);ELAS.stop(a,true);
    if(t&&t.alive){const P3=S.ph===3&&!S.enc,ty=t.c.y+(t.duck?.95:1.3);
      const h=EBUL.shot(m.x,m.y,m.z,t.c.x,ty,t.c.z,.0035,{dmg:P3?35:t.armor>0?80:60,kd:P3?0:1.1,w:'s',src:a});
      if(h){S.hits++;if(S.hits%4===1)EP.say('aHit')}
      else if(!S.enc&&S.ph===1){S.pride++;if(S.pride>=3){S.pride=0;S.angry=3;S.n2=0;EP.say('aPride');EP.later(1.8,()=>EP.say('aPride2'));this.moveStart(a,S,this.towerPick(a,S,true));return}}}
    if(S.angry>0)S.angry--;
    if(S.n2>1&&t&&t.alive){S.n2--;S.mode='aim';S.mt=.35;ELAS.add(a,t,.35);return}
    S.n2=0;S.mode='bolt';S.mt=1;S.ptN=(S.enc?1.8:S.ph===3?.5:1.8)*(S.enr?.7:1)},
  // a flare round onto the nearest one hiding in the dark
  flareW(a,h,S){S.tg=h;S.mode='flw';S.mt=.5*EPTW();this.face(a,h.c.x,h.c.z);this.fx({k:'w',i:a.id,s:'fl'});EP.say('aFlare')},
  flareShot(a,S){const h=S.tg;if(!h)return;const m=this.muz(a),T=1.05,g=GRAV*.8,tx=h.c.x+rr(-1.2,1.2),tz=h.c.z+rr(-1.2,1.2);let ty=floorBelow(tx,h.c.y+1.5,tz,.2);if(!(ty>-50))ty=h.c.y;
    throwNade(a,'flare',{x:m.x,y:m.y,z:m.z,vx:(tx-m.x)/T,vy:(ty+.1-m.y)/T+.5*g*T,vz:(tz-m.z)/T});AU.at('gl40',m.x,m.y,m.z,{vol:.8,range:90})},
  // ---------- the SMG and the grenades (phase 2, the smoke in phase 3) ----------
  smgW(a,t,S){S.tg=t;S.mode='sma';S.mt=.6*EPTW();this.face(a,t.c.x,t.c.z);ELAS.add(a,t,S.mt);this.fx({k:'w',i:a.id,s:'smg'})},
  smgShot(a,t){const m=this.muz(a);EBUL.shot(m.x,m.y,m.z,t.c.x+t.c.vx*.1,t.c.y+(t.duck?.9:1.2),t.c.z+t.c.vz*.1,.045,{dmg:6,w:'m',src:a})},
  throwW(a,t,S,kind){S.tg=t;S.tk=kind;S.mode='thr';S.mt=S.mt0=(kind==='sm'?.5:.8)*EPTW();a.agThT=0;if(t)this.face(a,t.c.x,t.c.z);this.fx({k:'w',i:a.id,s:'thr'})},
  toss(a,S){const c=a.c,yw=a.yaw,fx=-Math.sin(yw),fz=-Math.cos(yw),x=c.x+fx*.5,y=c.y+2.2,z=c.z+fz*.5;
    if(S.tk==='sm'){const tx=c.x+fx*1.2,tz=c.z+fz*1.2;let ty=floorBelow(tx,c.y+1.5,tz,.2);if(!(ty>-50))ty=c.y;EGREN.throw('sm',x,y,z,tx,ty,tz,.45,{src:a,r:8,life:10});EP.say('aSmoke');return}
    const t=S.tg;if(!t||!t.alive)return;const tx=t.c.x+t.c.vx*.4,tz=t.c.z+t.c.vz*.4;let ty=floorBelow(tx,t.c.y+1.2,tz,.2);if(!(ty>-50))ty=t.c.y;
    EGREN.throw('fb',x,y,z,tx,ty,tz,clamp(Math.hypot(tx-x,tz-z)/14,.6,1.2),{src:a});EP.say('aFb')},
  // ---------- the towers ----------
  // where to go: another tower; farther from the team (closer when its pride is hurt), not one a floodlight is on, not crowded
  towerPick(a,S,closer){const C=this.cen(),TW=MAP.ez.towers;let best=-1,bs=1e9;
    for(let k=0;k<TW.length;k++){if(k===S.tw)continue;const T=TW[k],d=Math.hypot(T.x-C[0],T.z-C[2]);let s=(closer?d:-d*.6)+rr(0,9);
      if(FLOOD.onTower(k))s+=60;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-T.x,h.c.z-T.z)<10)s+=18;if(k===S.lastTw)s+=10;if(s<bs){bs=s;best=k}}return best},
  // off the tower (a jump down to its foot), a sprint to the next one's foot, a jump up: ×1.3 damage taken all the way
  moveStart(a,S,k){if(k==null||k<0)return;S.dest=k;S.moving=true;S.dmgT=0;S.n2=0;ELAS.stop(a);S.lastTw=S.tw;EP.say('aMove');this.fx({k:'mv',i:a.id});
    if(S.tw>=0){const b=MAP.ez.tbase[S.tw];S.tw=-1;S.mode='jd';S.mt=3;epKin(a,b[0],b[1],b[2],.95,.7,()=>{S.mode='run';S.mt=9;S.goT=0});this.fx({k:'hop',i:a.id})}
    else{S.tw=-1;S.mode='run';S.mt=9;S.goT=0}},
  runStep(a,dt,S){const k=S.dest,b=MAP.ez.tbase[k],c=a.c;a.agPose='';if(!b){S.mode='';S.moving=false;return}const d=Math.hypot(b[0]-c.x,b[2]-c.z);
    if(d<1.3||S.mt<=0){const T=MAP.ez.towers[k];S.mode='ju';S.mt=4;epKin(a,T.x,T.y,T.z,d<1.3?.9:Math.min(2.4,.9+d/14),d<1.3?1.4:3.5,()=>this.arrive(a,S,k));this.fx({k:'hop',i:a.id});return}
    this.walk(a,dt,S,b,1.75)},
  arrive(a,S,k){S.tw=k;S.moving=false;S.mode='';S.pt=.9;S.dmgT=0;S.dest=-1;a.agPose='idle';this.face(a,20,-45);const F=FLOOD.onTower(k);if(F)this.burn(a,F)},
  // ---------- phase 2's cover spots, phase 3's perches ----------
  coverPick(a,S){const C=this.cen(),L=MAP.ez.cover;let best=null,bs=1e9;
    for(const p of L){if(p===S.spot)continue;const d=Math.hypot(p[0]-C[0],p[2]-C[2]);let s=Math.abs(d-17)+rr(0,7)+Math.hypot(p[0]-a.c.x,p[2]-a.c.z)*.15;
      if(FLOOD.lit(p[0],0,p[2]))s+=40;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-p[0],h.c.z-p[2])<6)s+=25;if(s<bs){bs=s;best=p}}return best},
  perchPick(a,S){const C=this.cen(),L=MAP.ez.perch;let best=-1,bs=1e9;
    for(let k=0;k<L.length;k++){if(k===S.perch)continue;const P=L[k],d=Math.hypot(P.x-C[0],P.z-C[2]);let s=Math.abs(d-20)+rr(0,10)+Math.hypot(P.x-a.c.x,P.z-a.c.z)*.12;
      if(k<4)s+=FLOOD.onTower(k)?60:12;else if(FLOOD.lit(P.x,P.y,P.z))s+=30;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-P.x,h.c.z-P.z)<6)s+=30;if(s<bs){bs=s;best=k}}return best},
  hop(a,S){const k=this.perchPick(a,S),P=MAP.ez.perch[k];if(!P){S.hopT=1;return}const d=Math.hypot(P.x-a.c.x,P.z-a.c.z),T=clamp(.55+d/18,.7,1.7);
    S.mode='hop';S.mt=T+1.5;S.perch=-1;S.tw=-1;S.n2=0;a.agPose='beast';ELAS.stop(a);
    epKin(a,P.x,P.y,P.z,T,clamp(1.5+d*.08,1.5,4.5),()=>{S.mode='';S.perch=k;S.tw=k<4?k:-1;S.hopT=rr(5,7.5)*(S.enr?.75:1);S.pt=Math.min(S.pt,.6);const F=k<4?FLOOD.onTower(k):null;if(F)this.burn(a,F)});
    this.fx({k:'hop',i:a.id})},
  // ---------- the modes ----------
  step(a,dt,S){
    switch(S.mode){
    case 'aim':{const t=S.tg;a.agPose='aim';if(!t||!t.alive){ELAS.stop(a);S.mode='';S.n2=0;S.pt=.4;break}this.face(a,t.c.x,t.c.z);if(S.mt<=0)this.fire(a,S);break}
    case 'bolt':{a.agPose='aim';if(S.mt<=0){S.mode='';S.pt=S.ptN}break}
    case 'flw':{const t=S.tg;a.agPose='aim';if(t)this.face(a,t.c.x,t.c.z);if(S.mt<=0){this.flareShot(a,S);S.mode='bolt';S.mt=.8;S.ptN=.8}break}
    case 'run':this.runStep(a,dt,S);break;
    case 'down':{a.agPose='down';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'sma':{const t=S.tg;a.agPose='smg';if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0){S.mode='smb';S.mt=2;S.burstT=0}break}
    case 'smb':{const t=S.tg;a.agPose='smg';if(t&&t.alive)this.face(a,t.c.x,t.c.z);S.burstT-=dt;if(S.burstT<=0&&t&&t.alive){S.burstT=.2;this.smgShot(a,t)}if(S.mt<=0){S.mode='';S.pt=.8}break}
    case 'thr':{const t=S.tg;a.agPose='throw';if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0){this.toss(a,S);S.mode='thr2';S.mt=.4}break}
    case 'thr2':{a.agPose='throw';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'p2b':{a.agPose='beast';if(S.mt<=0){S.mode='';S.pt=1}break}
    case 'p3a':{a.agPose='beast';if(S.mt<=0){S.mode='';this.hop(a,S)}break}
    case 'ret':{a.agPose='idle';if(S.mt<=0){const c=a.c;S.mode='ret2';S.mt=3;epKin(a,c.x+6.5,c.y-5,c.z-1,1.1,1,()=>{S.mode='gone';EP.meetEnd(a)});this.fx({k:'hop',i:a.id})}break}
    // (scripted leaps: their landing sets the next mode; the clock only rescues one that went wrong)
    default:{if(!a.kin&&S.mt<-1){S.mode='';S.moving=false;S.dest=-1}}}},
  // ---------- stagger, downs, the burnout ----------
  grog(a,v){const S=a.ag;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='fall'||S.mode==='gone'||S.mode[0]==='p')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6);EP.say('aDown')}},
  // down: up on a tower it falls off first (to the tower's foot)
  down(a,t){const S=a.ag,c=a.c;if(S.mode[0]==='p'||S.mode==='gone'||S.mode==='ret'||S.mode==='ret2')return;ELAS.stop(a);S.n2=0;S.moving=false;S.dest=-1;S.grog=0;this.fx({k:'dn',i:a.id});
    if(c.y>3.2){const tb=S.tw>=0?MAP.ez.tbase[S.tw]:null,n=tb?null:navSnap(c.x+rr(-2,2),0,c.z+rr(-2,2),5),x=tb?tb[0]:n?n.x:c.x,y=tb?tb[1]:n?n.y:0,z=tb?tb[2]:n?n.z:c.z;
      S.lastTw=S.tw;S.tw=-1;S.perch=-1;S.mode='fall';S.mt=3;epKin(a,x,y,z,.85,.4,()=>{S.mode='down';S.mt=t;this.fx({k:'land',x:r2(x),y:r2(y),z:r2(z)})})}
    else{a.kin=null;S.mode='down';S.mt=t}},
  burn(a,F){const S=a.ag;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='fall'||S.mode==='gone'||S.mode[0]==='p')return false;
    S.burnT=1.6;FLOOD.spend(F);this.fx({k:'burn',i:a.id});EP.say('aBurn');this.down(a,5);return true},
  // a player's flare burst within 3 m (host; a client's own flare comes in as 'epfl')
  flareAt(x,y,z){const b=EP.bossA();if(!b||!b.ag||b.ag.enc)return;const e=this.eye(b);if(Math.hypot(e.x-x,(e.y-y)*.6,e.z-z)>3.2&&Math.hypot(b.c.x-x,b.c.z-z)>3)return;this.fx({k:'flr',i:b.id});this.grog(b,40)},
  // ---------- phases ----------
  floorHit(a){const S=a.ag;if(S.enc){if(S.mode!=='ret'&&S.mode!=='ret2'&&S.mode!=='gone'){S.invT=99;this.retreat(a)}return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  retreat(a){const S=a.ag;S.invT=99;S.mode='ret';S.mt=.8;S.n2=0;ELAS.stop(a);this.fx({k:'roar',i:a.id});EP.say('aRet')},
  toPhase(a,n){const S=a.ag,c=a.c;S.ph=n;S.invT=3.5;S.grog=0;S.pride=0;S.angry=0;S.n2=0;S.moving=false;S.dest=-1;S.spot=null;S.perch=-1;ELAS.stop(a);TRAP.clear();
    Object.assign(S.cd,{smg:2,fb:5,tr:3,smk:4,sn:1,fl:8});EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();
    if(n===2){// the descent: off the tower into the middle of them
      const C=this.cen(),nn=navSnap(lerp(c.x,C[0],.72),0,lerp(c.z,C[2],.72),5),lx=nn?nn.x:C[0],ly=nn?nn.y:0,lz=nn?nn.z:C[2];
      if(c.y>3.2){const d=Math.hypot(lx-c.x,lz-c.z),T=clamp(.8+d/22,1,1.8);S.tw=-1;S.mode='p2a';S.mt=T+1.5;a.agPose='beast';a.kin=null;
        TELE.add({k:'c',x:lx,y:ly,z:lz,r:4,d:T});epKin(a,lx,ly,lz,T,2,()=>{this.slam(a,4,20);S.mode='p2b';S.mt=1.4;this.fx({k:'roar',i:a.id})});this.fx({k:'hop',i:a.id})}
      else{S.tw=-1;a.kin=null;S.mode='p2b';S.mt=1.4;this.fx({k:'roar',i:a.id})}
      this.summon(a,3,'squad');EP.say('aP2')}
    else{a.kin=null;S.mode='p3a';S.mt=1.6;this.fx({k:'roar',i:a.id,b:1});this.summon(a,2,'squad');this.summon(a,2,'runner');EP.say('aP3')}},
  slam(a,R,dmg){const c=a.c;SCEN.slamFx(c.x,c.y,c.z);if(NET.host)netEv('scsl',{x:r2(c.x),y:r2(c.y),z:r2(c.z)});
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-c.y)>2.5)continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*8*f,3+4*f,dz/(d||1)*8*f);hurtHuman(h,EPD(dmg*(.5+.5*f)),a,{})}},
  summon(a,n,zc){const S=a.ag,k=S&&S.enr?2:1;let s=0;for(let i=0;i<n*k;i++)if(SCEN.spawn(zc))s++;return s},
  // ---------- host: damage in (before the game applies it) and after ----------
  hit(t,dmg,src,o){const S=t.ag;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret'||S.mode==='ret2')return 0;let mul=1;
    // up on a perch the bullets do not shove it off; on the plaza floor a little
    if(t.c.y>2||t.kin||S.tw>=0||S.perch>=0){o.kb=0;o.up=0}else o.kb=(o.kb||0)*.4;
    // a headshot chips the next lens; a broken one staggers it
    if(o.hs&&S.lensN>0&&!S.enc){const i=S.lens.findIndex(v=>v>0);if(i>=0){S.lens[i]-=dmg;if(S.lens[i]<=0){S.lens[i]=0;S.lensN--;this.fx({k:'lens',i:t.id,n:i});EP.say(S.lensN?'aLens':'aLens4');this.grog(t,30)}}}
    if(S.moving)mul*=1.3;if(S.mode==='down'||S.mode==='fall')mul*=1.5;if(o.he)this.grog(t,15);
    let out=dmg*mul;const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    const fl=t.maxHp*(S.enc?.9:S.ph===1?AG_PH[1]:S.ph===2?AG_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    return out},
  after(t,dealt){const S=t.ag;if(S&&S.tw>=0&&!S.moving)S.dmgT+=dealt},
  // ---------- host, every frame: the floodlights' boxes, the minions, the lightning, which bot minds the lights ----------
  hostTick(dt){const b=EP.bossA(),S=b&&b.ag,run=EP.st===4&&EP.ph==='run';
    for(const F of FLOOD.L){
      if(run&&F.cd<=0){let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+F.i&&G.t>=(h.useBlk||0)&&FLOOD.near(F,h))n++;
        if(n){F.p+=dt*(n>1?1.25:1);if(F.p>=FLOOD.T){F.p=0;this.flUse(F)}}else F.p=Math.max(0,F.p-dt*1.5)}else F.p=0;
      if(F.sw>0){F.sw-=dt;if(F.sw<=0&&typeof F.s==='number'&&S&&S.tw===F.s&&!S.moving&&!a_kin(b))this.burn(b,F)}
      if(F.cd>0){F.cd-=dt;if(F.cd<=0){F.cd=0;FLOOD.set(F.i,'p',0)}}}
    if(!S||!run||S.idle)return;
    EP.trickle(dt,AG_MIX,[.22,.35,.3][S.ph-1]*(S.enr?1.8:1));
    S.ltnN-=dt;if(S.ltnN<=0){S.ltnN=S.ph===3?rr(12,22):rr(20,38);S.ltn=G.t+.8;this.fx({k:'ltn'})}
    S.fT-=dt;if(S.fT<=0){S.fT=1;this.fDuty(S)}},
  // a box held to the end: onto ARGUS's tower if it stands on one this light reaches; back to the plaza from a tower; else on / off
  flUse(F){const b=EP.bossA(),S=b&&b.ag,tw=S&&!S.enc?(S.tw>=0?S.tw:S.mode==='ju'?S.dest:-1):-1;let s;
    if(tw>=0&&F.f.reach.includes(tw)&&F.s!==tw)s=tw;else if(typeof F.s==='number')s='p';else s=F.s==='p'?'x':'p';
    FLOOD.set(F.i,s,0);F.sw=typeof s==='number'?.9:0},
  // the bot nearest to a light that could burn it out goes and holds its box
  fDuty(S){S.fBot=-1;S.fIdx=-1;if(S.tw<0||S.moving||S.mode==='down'||S.mode==='fall')return;let bd=1e9;
    for(const F of FLOOD.L){if(F.cd>0||F.s===S.tw||!F.f.reach.includes(S.tw))continue;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-F.f.bx,h.c.z-F.f.bz);if(d<bd){bd=d;S.fBot=h.id;S.fIdx=F.i}}}},
  // ---------- bots ----------
  botGoal(a,i){const b=EP.bossA();if(!b||!b.ag||EP.ph!=='run')return null;const S=b.ag;
    if(S.fBot===a.id&&S.fIdx>=0){const F=FLOOD.L[S.fIdx];if(F)return [F.f.bx,0,F.f.bz,.4]}
    // down (or fallen off its tower): everybody closes in on it
    if((S.mode==='down'||S.mode==='fall')&&b.c.y<3.5){const an=i*1.7+.4;return [b.c.x+Math.cos(an)*7,0,b.c.z+Math.sin(an)*7,2]}
    if(S.ph===2&&b.c.y<3){const an=i*1.9+Math.floor(G.t/7)*.8;return [clamp(b.c.x+Math.cos(an)*11,-7,47),0,clamp(b.c.z+Math.sin(an)*11,-72,-18),2]}
    // up on a perch: a peek spot each — a step from floor it cannot see (to duck into when the laser comes), in its sight (to shoot back),
    // 14–28 m from it, the bots well apart
    const pk=S.tw>=0?S.tw:S.perch;if(pk>=0&&!S.moving&&!a_kin(b)&&b.c.y>1.5){const e=this.eye(b),H=this.hidNodes(pk),C=[];
      for(const n of H){const d=Math.hypot(n[0]-b.c.x,n[2]-b.c.z);if(d>14&&d<28)C.push([Math.abs(d-21)+n[3]*3+hash2(Math.round(n[0]*2),Math.round(n[2]*2),a.id)*5,n])}C.sort((p,q)=>p[0]-q[0]);
      const took=[];for(const h of SCEN.H){if(h===a||!h.bot||!h.bot.agPk)continue;took.push(h.bot.agPk)}
      for(const [,n] of C){if(took.some(t=>Math.hypot(t[0]-n[0],t[1]-n[2])<6))continue;let v=null;for(let k=0;k<6&&!v;k++){const m=navAround(n[0],n[2],1.2,3.5);if(m&&Math.abs(m.y-n[1])<1&&losClear(e.x,e.y,e.z,m.x,m.y+1.4,m.z))v=m}
        a.bot.agPk=[n[0],n[2]];return v?[v.x,v.y,v.z,.6]:[n[0],n[1],n[2],.6]}}
    // otherwise: the cover spots it cannot see, nearest to a ring 22 m round it
    const e=this.eye(b),L=MAP.ez.cover.map(p=>[p,(losClear(e.x,e.y,e.z,p[0],1.3,p[2])?30:0)+Math.abs(Math.hypot(p[0]-b.c.x,p[2]-b.c.z)-22)]).sort((p,q)=>p[1]-q[1]);
    const p=L[i%Math.min(L.length,4)];return p?[p[0][0],0,p[0][2],1.4]:null},
  // (a new goal for the bots when it goes down or a bot is put on the lights)
  goalTag(b){const S=b.ag;return S?(S.mode==='down'||S.mode==='fall'?'d':'')+S.fBot:''},
  botUse(a){const b=EP.bossA();if(!b||!b.ag)return -1;const S=b.ag,j=this.useNear(a);if(j<0)return -1;const F=FLOOD.L[j];
    return F.cd<=0&&S.tw>=0&&!S.moving&&F.f.reach.includes(S.tw)&&F.s!==S.tw?j:-1},
  // in a red warning, a tripwire ahead, a laser on it: out of it (the laser: to cover from the shooter)
  danger(a){if(!(EP.st===4||EP.meet&&EP.meet.st==='on'))return null;const tr=TRAP.danger(a);if(tr)return tr;
    for(const L of ELAS.list)if(L.tg===a&&L.src.zc==='argus')return this.coverDir(a,L.src);return null},
  // already out of its line standing: stay; crouching would do: crouch; else to the nearest spot it cannot see (crouched there if need be)
  coverDir(a,b){const B=a.bot,c=a.c,e=ARGUS.muz(b);if(!losClear(e.x,e.y,e.z,c.x,c.y+1.3,c.z))return null;if(!losClear(e.x,e.y,e.z,c.x,c.y+.9,c.z))return {ax:0,az:0,duck:1};
    // (up on a perch: the plaza's floor already sorted into what it cannot see from there — one the bot can run to in a straight line)
    const S=b.ag,tw=S&&!a_kin(b)?(S.tw>=0?S.tw:S.perch):-1;if(tw>=0&&!(B.agCovT>G.t)){const L=[];for(const n of this.hidNodes(tw)){const d=Math.hypot(n[0]-c.x,n[2]-c.z)+n[3]*1.5;if(d<7&&Math.abs(n[1]-c.y)<1.5)L.push([d,n])}L.sort((p,q)=>p[0]-q[0]);
      let best=null;for(let k=0;k<L.length&&k<10;k++){const n=L[k][1];if(!navStraight(c.x,c.y,c.z,n[0],n[2],c.hw*.9))continue;const st=!losClear(e.x,e.y,e.z,n[0],n[1]+1.3,n[2]);
        if(st||!losClear(e.x,e.y,e.z,n[0],n[1]+.9,n[2])){best=[n[0],n[1],n[2],st?0:1];break}}B.agCovT=G.t+.5;B.agCov=best?[best[0],best[2],best[3]]:null}
    if(!(B.agCovT>G.t)){let best=null,bd=1e9,dk=0;for(let k=0;k<16;k++){const n=navAround(c.x,c.z,1.2,7.5);if(!n||Math.abs(n.y-c.y)>1.5)continue;const st=!losClear(e.x,e.y,e.z,n.x,n.y+1.3,n.z),cr=st||!losClear(e.x,e.y,e.z,n.x,n.y+.9,n.z);if(!cr||!navStraight(c.x,c.y,c.z,n.x,n.z,c.hw*.9))continue;
        const d=Math.hypot(n.x-c.x,n.z-c.z)+(st?0:1.5);if(d<bd){bd=d;best=n;dk=st?0:1}}B.agCovT=G.t+.5;B.agCov=best?[best.x,best.z,dk]:null}
    const p=B.agCov;if(!p)return null;const dx=p[0]-c.x,dz=p[1]-c.z,d=Math.hypot(dx,dz);return d<.5?(p[2]?{ax:0,az:0,duck:1}:null):{ax:dx/d,az:dz/d}},
  // the plaza's floor a perch cannot see (standing: 0, crouched: 1), worked out once per perch (perches 0–3 are the towers)
  hidNodes(k){const C=this.hid||(this.hid={});if(C[k])return C[k];const T=MAP.ez.perch[k],Z=EP.zone('D'),bx=Z?Z.box:[-1e9,-1e9,1e9,1e9],out=[],y=T.y+1.9;
    for(const n of NAV.nodes){if(n.x<bx[0]||n.x>bx[2]||n.z<bx[1]||n.z>bx[3]||n.y>1.5||n.e.length<6)continue;const st=!losClear(T.x,y,T.z,n.x,n.y+1.3,n.z);if(st||!losClear(T.x,y,T.z,n.x,n.y+.9,n.z))out.push([n.x,n.y,n.z,st?0:1])}
    return C[k]=out},
  // ---------- the boss stage's own devices: the four floodlight boxes ----------
  useNear(h){if(!EP.on||EP.id!==2)return -1;for(const F of FLOOD.L)if(FLOOD.near(F,h))return F.i;return -1},
  useInfo(i,L){const F=FLOOD.L[i];if(!F)return null;const Bs=EP.bs(),tw=Bs?Bs.tw:-1;
    if(F.cd>0)return {act:(L?'The floodlight is burnt out — ':'투광등 과열 — ')+Math.ceil(F.cd)+(L?'s':'초'),p:0,x:1};
    const at=tw>=0&&F.f.reach.includes(tw)&&F.s!==tw;
    return {act:at?(L?'swing the light onto ARGUS':'투광등을 아르고스 쪽으로'):typeof F.s==='number'?(L?'swing it back to the plaza':'투광등을 광장으로'):F.s==='p'?(L?'switch the light off':'투광등 끄기'):(L?'switch the light on':'투광등 켜기'),p:F.p/FLOOD.T,x:0}},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==2){this.seenEl(false);return}FLOOD.update(dt);TRAP.update(dt);
    if(NET.cli){const f=EP.bf;if(f&&f.fl)FLOOD.unpack(f.fl)}else this.hostTick(dt);
    const P=G.player,Bs=P&&P.alive&&P.team===TH?EP.bs():null;this.seenEl(!!(Bs&&Bs.a.alive&&Bs.sv&&Bs.sv.includes(P.id)))},
  // "ARGUS SEES YOU": while the local player is in its sight
  seenEl(on){let e=$('epSeen');if(!e){if(!on)return;const h=$('hud');if(!h)return;e=document.createElement('div');e.id='epSeen';h.appendChild(e)}
    const L=LI(),t=L?'◉ ARGUS CAN SEE YOU':'◉ 아르고스가 보고 있다';if(e.textContent!==t)e.textContent=t;if(e.classList.contains('on')!==on)e.classList.toggle('on',on)},
  stageClear(){TRAP.clear()},
  clear(){TRAP.clear();this.cur=null;this.ltnT=0;this.hid=null;this.seenEl(false)},
  // the boss bar: gauges and what it is doing (flags: 1 moving, 2 pride hurt, 4 down, 8 invulnerable, 16 enraged, 32 first meeting, 64 burnt out)
  lensBits(S){let m=0;for(let i=0;i<4;i++)if(S.lens[i]>0)m|=1<<i;return m},
  bsOf(b){const S=b.ag;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,pride:S.angry>0?3:S.pride,
    f:(S.moving?1:0)|(S.angry>0?2:0)|(S.mode==='down'||S.mode==='fall'?4:0)|(S.invT>0&&!S.enc?8:0)|(S.enr?16:0)|(S.enc?32:0)|(S.burnT>0?64:0),
    lens:this.lensBits(S),pose:Math.max(0,AG_POSE.indexOf(b.agPose||'')),tw:S.mode==='ju'?S.dest:S.tw,sv:S.sv.map(h=>h.id),fl:FLOOD.pack()}},
  bsPack(b){if(!b.ag)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.pride,B.f,B.lens,B.pose,B.tw,B.sv,B.fl]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],pride:B[4],f:B[5],lens:B[6],pose:B[7],tw:B[8],sv:B[9]||[],fl:B[10]||null}},
  hud(B,L){const f=B.f;let n=0;for(let i=0;i<4;i++)if(B.lens>>i&1)n++;
    return {ss:f&8?(L?'INVULNERABLE':'무적'):f&4?(L?'DOWN!':'그로기!'):f&1?(L?'ON THE MOVE — ×1.3':'이동 중 — 피해 1.3배'):f&2?(L?'PRIDE HURT — short warnings':'자존심 폭발 — 예고 짧음'):f&16?(L?'ENRAGED':'광폭화'):'',
      cls:f&2||f&16?'r':f&4||f&1?'y':'',sp:(f&32?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(L?' · LENSES ':' · 렌즈 ')+n+'/4',g1:B.grog/(B.gmax||100),g2:f&32?null:B.pride/3}},
  // the floodlight boxes (hot when one would burn its night vision out), and ARGUS itself for a moment when the lightning strikes
  markers(list,L,P){const Bs=EP.bs(),tw=Bs?Bs.tw:-1;
    for(const F of FLOOD.L){const d=Math.hypot(F.f.bx-P.c.x,F.f.bz-P.c.z),hot=F.cd<=0&&tw>=0&&F.f.reach.includes(tw)&&F.s!==tw;
      if(F.cd>0){if(d<22)list.push([F.f.bx,2.1,F.f.bz,(L?'light out ':'과열 ')+Math.ceil(F.cd)+(L?'s':'초'),'s'])}
      else if(hot)list.push([F.f.bx,2.4,F.f.bz,L?'⚡ SWING THE LIGHT!':'⚡ 투광등 돌려!','p hot']);
      else if(d<26)list.push([F.f.bx,2.1,F.f.bz,L?'floodlight':'투광등','p'])}
    const b=EP.bossA();if(b&&G.t<this.ltnT)list.push([b.c.x,(b.head?b.head.y:b.c.y+2.4)+.7,b.c.z,'ARGUS','b'])},
  // before the rig is posed (every page): its pose, the slump, the aim's pitch, the recoil
  pre(a,dt){this.cur=a;const S=a.ag;let pose=a.agPose||'idle',down=0,burn=0,lens=15,inv=false,enr=false;
    if(!NET.cli&&S){down=S.mode==='down'||S.mode==='fall'?1:0;burn=S.burnT>0?1:0;lens=this.lensBits(S);inv=S.invT>0&&!S.enc;enr=S.enr}
    else{const f=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(f){pose=AG_POSE[f.pose]||'';down=f.f&4?1:0;burn=f.f&64?1:0;lens=f.lens;inv=!!(f.f&8);enr=!!(f.f&16)}}
    if(pose!==a.agPose)a.agThT=0;else a.agThT=(a.agThT||0)+dt;a.agPose=pose;a.agAtk=pose==='throw'?clamp(a.agThT/1.15,0,1):0;
    a.epDown=approach(a.epDown||0,a.alive?down:0,dt*3);a.agBurn=burn;a.agLens=lens;a.agInv=inv;a.agEnr=enr;a.agKick=a.epKick||0;a.epKick=Math.max(0,(a.epKick||0)-dt*5);a.epHide=true;
    // where the team's bots aim at it (the upper chest: clear of a tower's sandbags), and how much they want to (more while it is down or running)
    a.epAimY=a.head&&a.head.y>a.c.y?clamp(a.head.y-a.c.y-.42,.6,2.2):1.6;a.epPri=down||!NET.cli&&S&&(S.moving||S.ph===3)?.3:.55;
    if(pose==='aim'||pose==='smg'||pose==='throw'){let t=null;for(const L of ELAS.list)if(L.src===a){t=L.tg;break}if(!t&&S&&!NET.cli)t=S.tg;if(!t||t===a){let bd=60;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd){bd=d;t=h}}}
      if(t&&t!==a){const ey=a.head&&a.head.y>a.c.y?a.head.y:a.c.y+2.2,dh=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);a.agPitch=clamp(Math.atan2(t.c.y+1.2-ey,Math.max(1,dh)),-1,.6)}}else a.agPitch=0},
  // the rig's extras: 1.3× the size, the rifle (in the hands or across the back), the SMG, a grenade in the throwing hand,
  // the four lenses on the head bone (a broken one dark), and the muzzle in the world for its laser and tracers
  rigX(ch){const D=ch.A.def,o=D.o,P=ch.A.piv,hc=D.headC||[0,P[2][1]+.15,0],zb=o.belly*.25+(o.torsoD+o.belly)/2,zf=o.headZ-o.headD/2-.135;
    const mk=id=>{const m=new THREE.Mesh(gunGeo(id),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);return m};
    const X={rifle:mk(WPN.r700.model),smg:mk(WPN.um45.model),nade:mk('epFlash'),lens:[],lensB:[],lm:[],w:new THREE.Matrix4(),
      back:new THREE.Matrix4().makeTranslation(.06,.14,zb+.09).multiply(new THREE.Matrix4().makeRotationZ(.5)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2)),
      mzR:new THREE.Vector3().fromArray(GUNS[WPN.r700.model].muzzle||[0,.04,-.77]),mzS:new THREE.Vector3().fromArray(GUNS[WPN.um45.model].muzzle||[0,.04,-.3]),lensMat:matGun(),lensMatB:matGun()};
    X.lensMatB.uniforms.uEmisA.value=.05;X.lensMatB.uniforms.uTint.value.set(0,0,0,.75);
    [[-.075,0],[-.028,.012],[.028,.012],[.075,0]].forEach(([x,y],i)=>{for(const [arr,mat] of [[X.lens,X.lensMat],[X.lensB,X.lensMatB]]){const m=new THREE.Mesh(gunGeo('epLens'),mat);m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);arr.push(m)}
      X.lm.push(new THREE.Matrix4().makeTranslation(x-P[2][0],hc[1]+y-P[2][1],zf-P[2][2]))});
    return X},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_argus')return;if(ch.grp.scale.x!==AG_S)ch.grp.scale.setScalar(AG_S);a.hitW=.36;a.headR=.2;
    const X=ch.agX||(ch.agX=this.rigX(ch)),vis=ch.grp.visible,P=a.agPose||'',U=ch.mat.uniforms.uProbe.value;
    const rH=(P==='aim'||P==='idle'||P==='')&&ch.gunOn,sH=(P==='smg'||P==='smgc')&&ch.gunOn,nH=P==='throw'&&ch.gunOn&&(a.agAtk||0)<.56;
    X.rifle.visible=vis;X.rifle.matrix.multiplyMatrices(ch.M[1],rH?ch.gunM:X.back);
    X.smg.visible=vis&&sH;if(sH)X.smg.matrix.multiplyMatrices(ch.M[1],ch.gunM);X.nade.visible=vis&&nH;if(nH)X.nade.matrix.multiplyMatrices(ch.M[1],ch.gunM);
    for(const m of [X.rifle,X.smg,X.nade])m.material.uniforms.uProbe.value.copy(U);
    const gm=sH?X.smg:X.rifle;X.w.multiplyMatrices(ch.grp.matrixWorld,gm.matrix);a.epMuz=(a.epMuz||new THREE.Vector3()).copy(sH?X.mzS:X.mzR).applyMatrix4(X.w);
    const lb=a.agLens==null?15:a.agLens,burn=a.agBurn>0;
    for(let i=0;i<4;i++){const ok=!!(lb>>i&1);X.lens[i].visible=vis&&ok;X.lensB[i].visible=vis&&!ok;const m=ok?X.lens[i]:X.lensB[i];m.matrix.multiplyMatrices(ch.M[2],X.lm[i])}
    const LU2=X.lensMat.uniforms;LU2.uEmisA.value=burn?3.4:a.alive?1.6+.3*Math.sin(G.t*2.3+a.id):.1;LU2.uTint.value.set(1,1,1,burn?.85:0);LU2.uProbe.value.copy(U);
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(a.agInv)T.set(1,.95,.85,.16+.08*Math.sin(G.t*30));else if(a.agEnr)T.set(.9,.1,.05,.14+.06*Math.sin(G.t*9))}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const e=a.epMuz||a.c;if(m.s==='aim')AU.at('chg',e.x,e.y,e.z,{vol:.55,range:90,rate:1.5});else if(m.s==='fl')AU.at('chg',e.x,e.y,e.z,{vol:.6,range:90,rate:.9});
      else if(m.s==='smg')AU.at('rack',e.x,e.y,e.z,{vol:.8,range:60});else if(m.s==='thr')AU.at('pin',e.x,e.y,e.z,{vol:.8,range:40})}break;
    case 'mv':break;
    case 'hop':if(a)AU.at('zleap',a.c.x,a.c.y+1.5,a.c.z,{vol:.9,range:60,rate:.8});break;
    case 'land':SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('bodyfall',m.x/100,m.y/100,m.z/100,{vol:1,range:60,rate:.7});break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'dn':if(a){AU.at('zpain',a.c.x,a.c.y+2,a.c.z,{vol:1,range:70,rate:.7});HUD.note(L?'ARGUS is down — ×1.5 damage':'아르고스 그로기 — 피해 1.5배',2.5)}break;
    case 'burn':if(a){const h=a.head||a.c;for(let i=0;i<40;i++)FX.spawn({x:h.x,y:h.y,z:h.z,vx:rr(-3,3),vy:rr(-1,3),vz:rr(-3,3),life:rr(.2,.5),s0:.08,s1:.03,r:1,g:1,b:.9,f:0,grav:4,add:1});
      DL.add(h.x,h.y,h.z,'#ffffff',10,3,.4);AU.at('hiss',h.x,h.y,h.z,{vol:1,range:80,rate:1.4});AU.at('zscream',h.x,h.y,h.z,{vol:1,range:110,rate:.8});
      HUD.announce(L?'ITS NIGHT VISION BURNS OUT':'야간투시경 과부하!','h',2.4)}break;
    case 'lens':if(a&&a.ch&&a.ch.agX){const X=a.ch.agX,v=_agV.setFromMatrixPosition(X.lens[m.n].matrix).applyMatrix4(a.ch.grp.matrixWorld);
      for(let i=0;i<16;i++)FX.spawn({x:v.x,y:v.y,z:v.z,vx:rr(-3,3),vy:rr(-1,3),vz:rr(-3,3),life:rr(.2,.5),s0:.05,s1:.02,r:.5,g:1,b:.45,f:10,grav:8,add:1});AU.at('imp_metal',v.x,v.y,v.z,{vol:.9,range:50,rate:2.2})}
      HUD.note(L?'A lens broke':'렌즈 파괴!',1.6);break;
    case 'flr':if(a){AU.at('zpain',a.c.x,a.c.y+2,a.c.z,{vol:.9,range:60,rate:.9});HUD.note(L?'The flare blinded it — stagger +40':'조명탄에 눈부심 — 그로기 +40',2)}break;
    case 'roar':if(a){AU.at('zroar',a.c.x,a.c.y+2,a.c.z,{vol:1,range:110,rate:m.b?.75:.95});if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<16)FX.shake=Math.max(FX.shake,.6-d/30)}}break;
    case 'ph':TRAP.clear();HUD.announce(m.n===2?(L?'ARGUS COMES DOWN':'아르고스가 뛰어내린다'):(L?'ARGUS GOES ON ALL FOURS':'아르고스가 짐승처럼 날뛴다'),'z',3);AU.play('stingZ',{vol:.7});break;
    case 'enr':HUD.announce(L?'ARGUS IS ENRAGED':'아르고스 광폭화','z',2.5);break;
    case 'ltn':if(typeof Main!=='undefined')Main.lightning=.6;AU.play('thunder',{vol:.75,far:.4,rev:.6});this.ltnT=G.t+2.2;break;
    // network-only kinds (the host already did these when it sent them)
    case 'tr':if(NET.cli){const A=m.a;TRAP.add(A[0]/100,A[1]/100,A[2]/100,A[3]/100,m.y/100,true,m.id)}break;
    case 'trx':if(NET.cli){const T=TRAP.byId(m.id);if(T){TRAP.boom(T,m.x/100,m.z/100);TRAP.kill(T)}}break;
    case 'fl':if(NET.cli)FLOOD.set(m.i,FLOOD.dec(m.s),m.cd,true);break;
    case 'fsp':if(NET.cli){const F=FLOOD.L[m.i];if(F){const f=F.f;for(let k=0;k<26;k++)FX.spawn({x:f.x,y:f.y,z:f.z,vx:rr(-4,4),vy:rr(0,4),vz:rr(-4,4),life:rr(.2,.5),s0:.06,s1:.02,r:1,g:.9,b:.6,f:0,grav:9,add:1});AU.at('dischit',f.x,f.y,f.z,{vol:.9,range:70})}}break;
    case 'sqw':if(a){a.an.atk=1;a.an.atkD=.8;a.an.heavy=true;AU.at('pin',a.c.x,a.c.y+1.5,a.c.z,{vol:.8,range:30})}break}}};
function a_kin(b){return !!(b&&b.kin)}
// the floor under a point (a body's feet)
function floorY(x,y,z){const f=floorBelow(x,y+.6,z,.2);return f>-50?f:y}

// ---------- the RT-1 squad zombie: a plate carrier (bullets from the front 30 % weaker, not the head), now and then a grenade ----------
// (0.8 s wind-up, then a frag on a red ring: 25 at the centre); it drops an ammo box when it dies (55 %)
const SQUAD={
  tick(a,dt){const S=a.sq;if(!S||a.reviving>0)return;
    if(S.mode==='w'){S.mt-=dt;const t=S.tg;if(t&&t.alive)a.yaw=Math.atan2(-(t.c.x-a.c.x),-(t.c.z-a.c.z));if(S.mt<=0){S.mode='';if(t&&t.alive)this.toss(a,t)}return}
    S.cd-=dt;if(S.cd>0||!a.c.onGround)return;const t=a.bot&&a.bot.target;if(!t||!t.alive||t.team!==TH)return;
    const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d<6||d>17||Math.abs(t.c.y-a.c.y)>3)return;
    if(!losClear(a.c.x,a.c.y+1.5,a.c.z,t.c.x,t.c.y+1.2,t.c.z)){S.cd=1;return}
    S.mode='w';S.mt=.8*EPTW();S.tg=t;S.cd=rr(9,15);ARGUS.fx({k:'sqw',i:a.id})},
  toss(a,t){const x=a.c.x,y=a.c.y+1.6,z=a.c.z,tx=t.c.x+t.c.vx*.5+rr(-.8,.8),tz=t.c.z+t.c.vz*.5+rr(-.8,.8);let ty=floorBelow(tx,t.c.y+1.2,tz,.2);if(!(ty>-50))ty=t.c.y;
    EGREN.throw('he',x,y,z,tx,ty,tz,1,{src:a,dmg:25})}};

// ---------- what the chapter's zombies do (episode.js dispatches through EPZ) ----------
EPZ.argus={hp:()=>ARGUS.hpFor(),init:a=>ARGUS.init(a,ARGUS.encNext),ai:(a,dt)=>ARGUS.ai(a,dt),
  hit:(t,dmg,src,o)=>t.ag?ARGUS.hit(t,dmg,src,o):dmg,after:(t,r)=>{if(t.ag)ARGUS.after(t,r)},
  // (the shooter's own page) green glass off a headshot while lenses are left
  spark(t,o){if(!o||!o.hs||o.x==null||AU.throttle('agls',60))return;const f=EP.bf&&EP.bf.id===t.id?EP.bf:null,lens=NET.cli?(f?f.lens:15):(t.ag?ARGUS.lensBits(t.ag):0);if(!lens)return;
    for(let i=0;i<6;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2,2),vy:rr(0,2),vz:rr(-2,2),life:rr(.15,.3),s0:.04,s1:.02,r:.5,g:1,b:.45,f:0,grav:6,add:1})},
  // its claws (phase 2's close quarters)
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?5:3;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?22:15),a,{claw:1});return true},
  pre:(a,dt)=>ARGUS.pre(a,dt),attach:a=>ARGUS.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;TRAP.clear();if(t.ag&&!t.ag.enc&&!NET.cli)EP.say('aDie')},
  gone(a){ELAS.stop(a,true);a.kin=null;if(a.ag)a.ag.mode='gone'}};
EPZ.squad={init(a){a.sq={mode:'',mt:0,cd:rr(4,9),tg:null}},tick:(a,dt)=>SQUAD.tick(a,dt),
  post(a){if(a.sq&&a.sq.mode==='w'){a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=false;a.cmd.jump=false}},
  hit(t,dmg,src,o){if(o.hs||o.he||!o.dir)return dmg;const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hl=Math.hypot(o.dir[0],o.dir[2])||1;return (o.dir[0]*fx+o.dir[2]*fz)/hl<-.3?dmg*.7:dmg},
  // the vest taking a frontal hit: a spark and a dull clink on the shooter's page
  spark(t,o){if(!o||o.hs||o.x==null||!o.dir||AU.throttle('sqsp',90))return;const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hl=Math.hypot(o.dir[0],o.dir[2])||1;if((o.dir[0]*fx+o.dir[2]*fz)/hl>=-.3)return;
    for(let i=0;i<4;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2,2)-o.dir[0],vy:rr(0,2),vz:rr(-2,2)-o.dir[2],life:rr(.1,.25),s0:.04,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1});AU.at('imp_metal',o.x,o.y,o.z,{vol:.35,range:20,rate:1.3})},
  die(t){if(!NET.cli&&Math.random()<.55)EPK.spawn(t.c.x,t.c.y,t.c.z)},gone(a){if(a.sq)a.sq.mode=''}};
Object.assign(ZGAIT,{argus:{stride:1.12,knee:1.25,runK:1.1,bob:1.1,twist:1.2,sway:1.1},squad:{stride:1,knee:1,runK:.9,bob:1.15,twist:1.15}});
Object.assign(JAW0,{argus:.16,squad:.1});

// ---------- ARGUS's rig poses (every page): a soldier's rifle stance on the rig while it aims, carries or throws; the zombie's own
// motion on all fours, falling and getting up ----------
{const pz=poseZombie;poseZombie=function(ch,st){if(st.zclass!=='argus'||st.dead>0||!ARGUS.cur){pz(ch,st);return}const a=ARGUS.cur,P=a.agPose||'',H=ARGUS.holds();
  if(P==='beast'||P==='down'||P==='perch'){st.zclass=P==='down'?'rager':'runner';if(P==='perch'){st.crouch=Math.max(st.crouch||0,.55)}pz(ch,st);st.zclass='argus';return}
  st.hold=P==='smg'||P==='smgc'?H.smg:P==='throw'?H.nade:H.rifle;st.pitch=P==='idle'?-.3:P==='smgc'?-.15:P===''?0:(a.agPitch||0);st.kick=a.agKick||0;st.atk=P==='throw'?a.agAtk||0:0;
  st.sprint=(P===''||P==='smgc')&&st.spd>3.2?1:0;st.reload=0;st.relKind=null;poseHuman(ch,st)}}

// ---------- chapter 2 「아르고스」: Forward Base 7 on the containment line ----------
//   1 the highway checkpoint — three waves; the RT-1 squad zombies first show up; then the base's main gate opens
//   2 the motor pool — restart three generators (12 s each, any order): the base's power and lights come back, the next gate opens
//   3 the command tent — recover RT-1's mission records (10 s) while ARGUS snipes from the command post's tower; it goes once the
//     records are in (or once it has lost a tenth of its health)
//   4 the watchtower plaza — the boss fight, three phases. A wipe replays the phase it reached, at that phase's health
CHAP[2]={id:2,k:'argus',map:'ep2',code:'RT1-07',n:['아르고스','ARGUS'],t:['좀비 시나리오: 아르고스','Zombie Scenario: ARGUS'],
  file:[['1차 회수팀 저격수 RT1-07. 불빛과 총구 불꽃을 노리고, 쏘기 전에 레이저가 꽂힌다','RT-1\'s sniper, RT1-07: it shoots at lights and muzzle flashes, and its laser comes first'],
    ['투광등을 놈이 선 탑으로 돌리면 야간투시경이 탄다 · 렌즈 4개가 약점','Swing a floodlight onto its tower and its night vision burns out · four lenses to shoot']],
  cards:{place:['제7 봉쇄선','CONTAINMENT LINE 7'],who:['1차 회수팀 저격수','RT-1 SNIPER'],line:['절대 빗나가지 않는다는 오만 — 불빛만 보이면 쏜다','Too proud to miss — anything that shows a light gets shot']},
  boss:ARGUS,voice2:['ARGUS','ARGUS'],
  // gates: A the base's main gate, B the command post's gate, C the plaza's gate
  gates:['gA','gB','gC'],gateDur:{gA:1.4,gB:1.2,gC:1.4},
  pow0:0,powLo:[.66,.14],
  stages:[null,
    {z:'A',k:'waves',n:['고속도로 검문소','Highway checkpoint'],on:['검문소를 지켜라','Hold the checkpoint'],prep:18,clr:'s1c',intro:{zc:'squad',say:'squad',at:5},
      wave:w=>[['rager',58],['runner',24],['squad',w>=2?20:14],['bomber',w>=2?8:0],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['차량 정비장','Motor pool'],on:['발전기 재가동','Restart the generators'],dev:'gen',say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'g1':'g2',
      mix:[['rager',46],['runner',26],['squad',18],['spitter',6],['bomber',4]]},
    {z:'C',k:'act',n:['지휘 텐트','Command tent'],on:['1차 팀 작전 기록 회수','Recover RT-1\'s records'],dev:'rec',say:'s3',sayRetry:1,clr:'s3c',meet:{at:3,cap:.55},
      mix:[['rager',44],['runner',30],['squad',22],['bomber',4]]},
    {z:'D',k:'boss',n:['감시탑 광장','Watchtower plaza'],on:['아르고스를 쓰러뜨려라','Bring ARGUS down'],say:'s4',go:'b0',flare:1,prepPt:[34,0,-21,2]}],
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n===4&&kind!=='phase')m|=b('gC');return m},
  // the towers' feet (where ARGUS jumps up and lands), the floodlight heads
  setup(){const E=MAP.ez,P=E.pad;E.tbase=E.towers.map(T=>{const dx=P[0]-T.x,dz=P[2]-T.z,l=Math.hypot(dx,dz)||1,x=T.x+dx/l*3.4,z=T.z+dz/l*3.4,n=navSnap(x,0,z,2.5);return n?[n.x,n.y,n.z]:[x,0,z]});FLOOD.build()},
  // the base has no power until the generators run (the plaza's floodlights too)
  stageStart(n){EP.pow=n>=3?1:0;FLOOD.reset(n>=3)},
  stageDone(n){if(n===2)EP.setPow(1)},
  bossGo(){EP.setGates(EP.gm&~EP.bit('gC'));return []},
  // its own teammates' flashlights stay off from the command post on (ARGUS shoots at lights)
  botPost(a){if(EP.st>=3)a.flash=false},
  clear(){FLOOD.clear();TRAP.clear()},
  radio:{
    start:['2차 회수팀, 제7 봉쇄선 전방기지 도착. 1차 회수팀이 Q-7에 들어가기 전에 진을 친 곳이다.','RT-2, you are at Forward Base 7 — where RT-1 set up before it went into Q-7.',0],
    w1:['고속도로 쪽에서 몰려온다! 검문소부터 지켜.','They are coming up the highway! Hold the checkpoint.',0],
    squad:['저건 1차 팀 대원들이다… 방탄복 때문에 정면은 잘 안 먹혀. 머리나 옆을 노려!','Those are RT-1 troopers… the vests stop bullets from the front. Go for the head or the flank!',1],
    s1c:['기지 정문 열었다. 안은 정전이야 — 발전기부터 살려.','Main gate open. The base has no power — get the generators running.',0],
    s2:['발전기 세 대: 정비고, 막사, 유류고. 하나에 12초씩 붙어 있어야 해.','Three generators: the shed, the barracks, the fuel point. Twelve seconds on each.',0],
    g1:['하나 돌아간다. 두 대 남았다.','One is running. Two to go.',0],
    g2:['마지막 한 대!','Last one!',0],
    s2c:['전력 복구, 투광등 들어온다. 지휘소 문 연다.','Power is back, the floodlights are coming on. Opening the command post.',0],
    s3:['지휘 텐트에 1차 팀 작전 기록이 있다. 회수해.','RT-1\'s mission records are in the command tent. Get them.',0],
    enc:['저격이다! 동쪽 감시탑 — 엄폐해!','Sniper! The east tower — take cover!',1],
    enc2:['붉은 레이저… RT1-07, 아르고스. 1차 팀 저격수다. 불빛을 보고 쏜다 — 손전등 꺼!','That red laser… RT1-07, ARGUS, RT-1\'s sniper. It shoots at light — flashlights off!',0],
    aMeet:['…보인다. 다 보여.','…I see you. I see all of you.',2],
    aRet:['놈이 탑에서 뛰어내렸다… 광장 쪽이다.','It jumped off the tower… toward the plaza.',1],
    s3c:['기록 확보. 아르고스는 감시탑 광장으로 갔다. 광장 문 연다.','Records secured. ARGUS went to the watchtower plaza. Opening the plaza gate.',0],
    s4:['감시탑 넷, 투광등 넷. 놈이 선 탑으로 투광등을 돌려 — 야간투시경이 탄다.','Four towers, four floodlights. Swing a light onto its tower and its night vision burns out.',0],
    b0:['…안 빗나가. 난 절대 안 빗나가.','…I don\'t miss. I never miss.',2],
    aHit:['…명중.','…Hit.',2],
    aPride:['…빗나갔다고? 내가?','…A miss? Me?',2],
    aPride2:['놈이 열 받았다 — 더 가까운 탑으로 온다! 레이저가 짧아진다!','It is angry — coming to a closer tower! The laser gets shorter!',1],
    aMove:['탑을 옮긴다! 지금 쏴!','It is changing towers! Shoot it now!',1],
    aBurn:['야간투시경이 탔다! 떨어졌어 — 몰아쳐!','Its night vision burned out! It fell — pour it on!',1],
    aDown:['쓰러졌다! 집중 사격!','It is down! Pour it on!',1],
    aLens:['렌즈 하나 깨졌다!','One lens gone!',1],
    aLens4:['렌즈 다 깨졌다! 이제 가까이 와야 우릴 본다.','All four lenses gone! It has to come close to see us now.',1],
    aFlare:['조명탄이다! 빛 밖으로!','Flare! Get out of the light!',1],
    aP2:['뛰어내렸다! 기관단총이다 — 방벽 뒤로! 붉은 선은 부비트랩이야, 넘지 마!','It jumped down! SMG — get behind the barriers! Red lines are tripwires, do not cross them!',1],
    aFb:['섬광탄! 고개 돌려!','Flashbang! Look away!',1],
    aP3:['짐승처럼 날뛴다! 서로 위치 불러!','It is leaping around like an animal! Call out where it is!',1],
    aSmoke:['연막이다 — 레이저만 보여!','Smoke — all you can see is the laser!',1],
    aEnr:['시간 끌면 안 돼 — 놈이 더 빨라진다!','We cannot drag this out — it is getting faster!',0],
    aDie:['…빗나…갔…','…I… missed…',2],
    dead:['아르고스 무력화. 1차 팀 저격수, 확인했다.','ARGUS is down. RT-1\'s sniper, confirmed.',0],
    clear:['2차 회수팀, 수고했다. 1차 팀 기록은 다 받았다 — 놈들이 Q-7에서 뭘 봤는지 이제 알겠군.','Good work, RT-2. We have RT-1\'s records — now we will see what they found in Q-7.',0]}};

// ---------- hooks ----------
(function(){
  // a player's own flare bursting next to ARGUS staggers it (the host decides; a client tells it about its own flare)
  const dt0=detonate;detonate=function(n){dt0(n);if(n.kind!=='flare'||n.ghost||!EP.on||EP.id!==2||!n.owner||n.owner.team!==TH)return;
    if(NET.cli)netToHost({t:'epfl',x:r2(n.x),y:r2(n.y),z:r2(n.z)});else ARGUS.flareAt(n.x,n.y,n.z)};
  Object.assign(CLIH,{eag(L,m){ARGUS.fxApply(m)}});
  Object.assign(HOSTH,{epfl(L,m){if(EP.on&&EP.id===2&&actorOfKey(L.key))ARGUS.flareAt(m.x/100,m.y/100,m.z/100)}});
})();

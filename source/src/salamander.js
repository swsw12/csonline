'use strict';
// ============ SALAMANDER (샐러맨더): a two-handed flamethrower ============
// The model (boxes), its textures, the flame and the sounds are drawn / synthesised here (original designs).
// Hold the trigger: a jet of burning fuel pours out of the nozzle — a short cone (7.6 m, narrower the further it reaches) that licks
// every zombie inside it with a clear line ten times a second and sets them alight (the burn system in nyw.js: burnT / burnSrc / burnW).
// Walls stop the fire (the damage needs a clear line, the flames splash on the wall). Fuel: 100 in the canister, used while the
// trigger is held (10 s of fire); the canister under the barrel is swapped on a reload. No headshots, a light shove, a little slower to
// carry than a rifle. The pilot light at the nozzle burns while the gun is out.
// Hooks in shared files: fireGun (weapons.js) hands the shot to salFire; gameUpdate (game.js) calls salUpdate every frame; maxSpeed
// (game.js) slows a zombie set burning by it; main.js drives the roar loop (AU.flame) and paints the atlas; hskill.js keeps it out of
// the Deadshot; ai.js rolls it for bots now and then and fires it only in reach.

// ---------- atlas materials ----------
const SAL_MATS=['salTank','salHose','salSoot','salBottle'];
for(const m of SAL_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintSalAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=80)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // fuel canister: glossy fire-engine red enamel, chipped to dark primer at the edges, runs of soot
  patch('salTank',(xx,y,X,Y)=>{const t=nz(X,Y,131,18)+(hash2(X,Y,132)-.5)*.08;let c=mix('#7a120c','#b8261a',clamp((t-.3)*1.7,0,1));if(Math.sin((xx+y*.2)*.06)>.93)c=lt(c,.18);
    const ch=nz(X,Y,133,7);if(ch>.74)c=ch>.8?'#2a2624':'#4a3a34';if(nz(X,Y,134,26)>.68&&y>64)c=mix(c,'#1a1210',.45);return c},252);
  // fuel hose: steel braid over black rubber, the strands crossing both ways
  patch('salHose',(xx,y,X,Y)=>{const a=(xx+y)%8,b=(xx-y+256)%8,s=Math.floor((xx+y)/8)%2;let c=s?(a<4?'#6a6e74':'#3a3c40'):(b<4?'#8a8e94':'#45484c');if(a===0||b===0)c='#161718';if(hash2(X,Y,135)<.03)c='#b0b4ba';return c},250);
  // nozzle steel: blued, straw and bronze heat tints under a crust of soot
  patch('salSoot',(xx,y,X,Y)=>{const h=nz(X,Y,136,20),t=clamp(y/127+(h-.5)*.6,0,1);let c=t<.3?mix('#55595e','#8a6a3a',t/.3):t<.6?mix('#8a6a3a','#363848',(t-.3)/.3):mix('#363848','#15151a',(t-.6)/.4);
    if(nz(X,Y,137,9)>.62)c=mix(c,'#0c0b0b',.7);if(hash2(X,Y,138)<.02)c='#9a9ea4';return c},246);
  // propellant bottle: pale grey-green steel, a stencilled yellow band, dents
  patch('salBottle',(xx,y,X,Y)=>{const t=nz(X,Y,139,16);let c=t>.6?'#7c8a7e':t<.4?'#5a665c':'#6a786c';if(y>52&&y<66)c=(Math.floor(xx/10)%2)?'#c89a22':'#1c1c1a';if(nz(X,Y,140,6)>.76)c=dk(c,.25);return c},248);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}

// ---------- model ----------
// gun frame: origin at the right hand's grip, barrel along -Z, up +Y. Rear pistol grip and a tube stock with a butt pad; a long
// receiver with a pressure gauge on top; the barrel under a vented heat shield, a rubber handguard for the left hand, a finned
// nozzle with the pilot igniter tucked under its mouth. Under the barrel the fuel canister (tag 'mag', swapped on a reload: red,
// chrome end caps, a hazard band, a filler cap); on the left a small propellant bottle with its valve wheel (tag 'aux', turned on the
// first draw) and a braided fuel line up to the nozzle.
// a box from point A to point B (any direction), w thick
const seg3=(A,B,w,m,o)=>{const dx=B[0]-A[0],dy=B[1]-A[1],dz=B[2]-A[2],L=Math.hypot(dx,dy,dz)||1e-3;
  return Pt((A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2,w,w,L,m,Object.assign({ry:Math.asin(clamp(dx/L,-1,1)),rx:Math.atan2(-dy,dz),r:w*.4},o||{}))};
const SAL={mz:[0,.05,-.69],pilot:[0,.011,-.684],wheel:[-.068,.045,-.124]};
function salParts(){const P=[],D=.785;
  // grip, guard, receiver, gauge
  P.push(...pGrip('rub',-.06,.04,.28),...tGuard(-.005),Pt(0,.03,-.03,.064,.084,.25,'gunmetal'),Pt(0,.076,-.03,.05,.01,.22,'blk2'),Pt(0,.03,.105,.054,.07,.022,'blk'),
    Pt(.0325,.03,-.06,.002,.05,.12,'blk'),Pt(-.0325,.03,-.06,.002,.05,.12,'blk'));
  P.push(Pt(-.022,.086,.0,.012,.014,.012,'steel'),Pt(-.022,.102,.0,.04,.04,.018,'blk',{r:.017}),Pt(-.022,.102,.0095,.028,.028,.002,'tan'),Pt(-.022,.104,.011,.0025,.012,.001,'red',{rz:-.7}),Pt(-.022,.102,.0108,.006,.006,.002,'blk'));
  // stock: a tube and a strut to the butt pad, a cheek rest
  P.push(Pt(0,.048,.2,.026,.026,.2,'steel'),segV(-.075,.075,-.03,.29,0,.018,.018,'steel'),Pt(0,.02,.305,.052,.13,.026,'rub'),Pt(0,.064,.215,.034,.022,.1,'rub'));
  // regulator and valve on the right
  P.push(Pt(.04,.03,-.12,.022,.04,.04,'brass'),Pt(.055,.03,-.12,.012,.026,.026,'red',{r:.008}));
  // barrel, heat shield, handguard, nozzle
  P.push(Pt(0,.05,-.42,.026,.026,.5,'steel'),Pt(0,.05,-.29,.058,.058,.24,'vent',{r:.02}),Pt(0,.05,-.17,.064,.064,.014,'blk'),Pt(0,.05,-.41,.064,.064,.014,'blk'),
    Pt(0,.05,-.47,.054,.054,.1,'rub',{r:.022}),Pt(0,.05,-.53,.05,.05,.016,'gunmetal'));
  for(let k=0;k<3;k++)P.push(Pt(0,.05,-.44-k*.03,.058,.058,.006,'blk2',{r:.022}));
  P.push(Pt(0,.05,-.6,.036,.036,.1,'salSoot'),Pt(0,.05,-.66,.046,.046,.024,'salSoot',{r:.012}),Pt(0,.05,-.677,.054,.054,.014,'salSoot',{r:.014}),Pt(0,.05,-.6845,.036,.036,.002,'muzzle'));
  for(const r of [0,D,-D,D*2])P.push(Pt(0,.05,-.6,.068,.005,.05,'salSoot',{rz:r}));
  // pilot igniter under the mouth: its tube, a bracket, the shroud and the glowing tip; its feed line along the left
  P.push(Pt(0,.008,-.6,.012,.012,.12,'brass'),Pt(0,.022,-.565,.008,.02,.008,'steel'),Pt(0,.009,-.668,.02,.02,.016,'salSoot',{r:.006}),Pt(0,.009,-.6765,.008,.008,.002,'ember'),
    seg3([-.004,.004,-.545],[-.03,.026,-.45],.007,'brass'),seg3([-.03,.026,-.45],[-.034,.03,-.4],.007,'brass'));
  // the fuel canister (swapped on a reload)
  P.push(...TAG('mag',[Pt(0,-.045,-.255,.11,.11,.3,'salTank',{r:.05}),Pt(0,-.045,-.105,.094,.094,.012,'chrome',{r:.04}),Pt(0,-.045,-.405,.094,.094,.012,'chrome',{r:.04}),
    Pt(0,-.045,-.345,.114,.114,.026,'yellow',{r:.05}),Pt(0,-.045,-.18,.116,.116,.012,'blk',{r:.05}),Pt(0,-.045,-.418,.04,.04,.018,'blk',{r:.015}),
    Pt(0,-.002,-.13,.026,.026,.03,'brass'),Pt(0,.012,-.13,.04,.008,.008,'red'),Pt(-.0555,-.045,-.255,.002,.05,.1,'white')]));
  // canister rail
  P.push(Pt(0,.004,-.255,.04,.014,.28,'blk'));
  // propellant bottle on the left, its brackets, neck and valve wheel (four spokes: a quarter turn looks the same), the line into the receiver
  const W=SAL.wheel;P.push(Pt(-.068,.045,-.255,.044,.044,.2,'salBottle',{r:.02}),Pt(-.045,.045,-.2,.03,.014,.014,'blk'),Pt(-.045,.045,-.31,.03,.014,.014,'blk'),
    Pt(-.068,.045,-.145,.022,.022,.02,'brass'),Pt(-.068,.045,-.364,.03,.03,.012,'salBottle',{r:.012}),seg3([-.068,.045,-.136],[-.033,.052,-.118],.01,'brass'));
  P.push(...TAG('aux',[Pt(W[0],W[1],W[2],.04,.008,.006,'red'),Pt(W[0],W[1],W[2],.008,.04,.006,'red'),Pt(W[0],W[1],W[2]+.001,.016,.016,.008,'steel',{r:.006}),
    Pt(W[0]+.02,W[1],W[2],.006,.014,.008,'red',{r:.002}),Pt(W[0]-.02,W[1],W[2],.006,.014,.008,'red',{r:.002}),Pt(W[0],W[1]+.02,W[2],.014,.006,.008,'red',{r:.002}),Pt(W[0],W[1]-.02,W[2],.014,.006,.008,'red',{r:.002})]));
  // braided fuel line: out of the canister's front, up the left of the handguard and over into the nozzle body
  const H=[[-.04,-.012,-.39],[-.055,.02,-.42],[-.05,.07,-.47],[-.036,.086,-.52],[-.016,.074,-.565]];
  for(let i=0;i<H.length-1;i++)P.push(seg3(H[i],H[i+1],.014,'salHose'));
  P.push(Pt(-.04,-.014,-.388,.02,.02,.014,'brass',{r:.005}),Pt(-.014,.072,-.567,.02,.02,.014,'brass',{r:.005}));
  return P}
GUNS.salamander={parts:salParts(),grip:[0,-.03,.02],sup:[0,.014,-.47],muzzle:SAL.mz,mag:[0,-.045,-.255],eject:[0,.06,-.06],piv:{aux:SAL.wheel},pilot:SAL.pilot};

// ---------- stats ----------
// flame: r reach (m, eye to the body), w0 / wk the cone's half width at the nozzle and its growth per metre (so it narrows as an
// angle), full = full damage this close, min = the share left at the end of the reach, burn = seconds set alight (topped up every tick)
// res 100 → 200 once game.js doubles every gun's spare ammo
WPN.salamander={slot:1,kind:'special',n:['샐러맨더','Salamander'],cost:5500,mag:100,res:100,dmg:38,rpm:600,quiet:1,flame:{r:7.6,w0:.3,wk:.09,full:2.5,min:.38,burn:2.5},
  spread:[0,0,0],rec:[.0035,.004],kb:1.1,stag:.22,hs:1,reload:3.5,draw:1,speed:.85,snd:'salgust',model:'salamander',hold:'rifle'};
BUY_MENU.find(c=>c.k==='special').items.push('salamander');
VM_POS.salamander={p:[.16,-.195,-.4],r:[0,.075,.03]};
// (the reload: the canister under the barrel is a magazine — out it drops, a full one comes up from the belt and is slapped home;
// its sounds are the canister's own, see VM.reload below)

// ---------- firing (fireGun hands every tick of a salamander here) ----------
const _sa=new THREE.Vector3(),_sb=new THREE.Vector3(),_sc=new THREE.Vector3(),_sdv=new THREE.Vector3(),_sbq=[];
const SAL_WET=new Set(['water','milWater']);
// the nozzle inside water: no fire
function salWet(x,y,z){_sbq.length=0;boxesIn(x-.02,z-.02,x+.02,z+.02,_sbq);for(const b of _sbq){const m=(b.o&&b.o.f&&b.o.f.py)||b.mat;if(SAL_WET.has(m)&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&y>b.y0-.01&&y<b.y1)return true}return false}
function salFire(a,W){const am=a.ammo[a.cur],eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_sdv);const dir=_sdv.clone();
  const mz=muzzleWorld(a);if(salWet(mz.x,mz.y,mz.z)){if(a.isPlayer&&!AU.throttle('salwet',400))AU.play('dry',{vol:.5});a.nextFire=G.t+.3;return}
  NET.on&&netFxPush(['f',a.id,WI[a.cur],r3(a.yaw+a.punchY),r3(a.pitch+a.punchP),0]);
  am.mag--;a.shots++;a.salT=G.t;a.lastFire=G.t;
  a.punchP+=W.rec[0]*rr(.2,1);a.punchY+=(Math.random()*2-1)*W.rec[1];a.recoilSpread=0;a.kick=.25;
  const n=salHits(a,W,eye,dir);
  if(a.isPlayer){VM.fire(W,0);if(n)HUD.hitmark(false)}
  alertBots(a,eye.x,eye.z)}
// every enemy in the flame: the ray's closest approach to the body (feet to head) must lie inside the cone's width there, a clear line
// from the eye, and within reach; damage falls off past `full` to `min` at the end of the reach
function salHits(a,W,eye,dir){const C=W.flame,R0=C.r;let n=0;
  for(const t of G.actors){if(!t.alive||t.team===a.team)continue;const c=t.c,top=t.head?t.head.y:c.y+c.h;
    const mx=c.x-eye.x,mz=c.z-eye.z,my=(c.y+top)/2-eye.y,s=mx*dir.x+my*dir.y+mz*dir.z;if(s<-.3||s-c.hw>R0)continue;
    const px=eye.x+dir.x*s,py=eye.y+dir.y*s,pz=eye.z+dir.z*s,hy=clamp(py,c.y+.15,top),lat=Math.hypot(px-c.x,pz-c.z,py-hy),sp=Math.max(0,s);
    if(lat>C.w0+sp*C.wk+c.hw)continue;if(Math.hypot(mx,hy-eye.y,mz)-c.hw>R0)continue;if(!losClear(eye.x,eye.y,eye.z,c.x,hy,c.z))continue;
    const f=sp<C.full?1:lerp(1,C.min,clamp((sp-C.full)/(R0-C.full),0,1)),hd=Math.hypot(mx,mz)||1;
    damageActor(t,W.dmg*f,a,{w:a.cur,dir:[mx/hd,0,mz/hd],kb:W.kb*f,stag:W.stag,x:c.x,y:hy,z:c.z});
    if(!NET.ghost){t.burnT=Math.max(t.burnT||0,C.burn);t.burnSrc=a;t.burnW=a.cur}n++;
    if(Math.random()<.6)FX.spawn({x:c.x-mx/hd*c.hw,y:hy+rr(-.3,.3),z:c.z-mz/hd*c.hw,vx:rr(-.4,.4),vy:rr(.8,1.8),vz:rr(-.4,.4),life:rr(.25,.45),s0:rr(.3,.5),s1:.1,r:1,g:rr(.45,.65),b:.15,a:.9,f:11,add:1})}
  return n}

// ---------- the flame stream (every frame, for everyone holding one) ----------
// one burning droplet: flies out with drag and a little lift, growing; it is cut short where its line meets a wall, and the wall gets
// a lick of fire spreading along it (shown from the start, fading in as the stream arrives), now and then a scorch mark
function salDrop(a,ox,oy,oz,dir,ang,v,drag,life,o){spreadDir(dir,ang,_sb);const dx=_sb.x,dy=_sb.y,dz=_sb.z,mx=v/drag,reach=mx*(1-Math.exp(-drag*life));
  const h=rayCast(ox,oy,oz,dx,dy,dz,reach+.1,SHOT_FILTER);let L=life,hit=null;
  if(h){const k=Math.min(.999,h.t*drag/v);L=Math.max(.02,-Math.log(1-k)/drag);hit={t:h.t,nx:h.nx,ny:h.ny,nz:h.nz}}
  FX.spawn(Object.assign({x:ox,y:oy,z:oz,vx:dx*v,vy:dy*v,vz:dz*v,life:L,drag},o));
  if(hit&&o.add&&Math.random()<.55){const x=ox+dx*hit.t+hit.nx*.06,y=oy+dy*hit.t+hit.ny*.06,z=oz+dz*hit.t+hit.nz*.06,dn=dx*hit.nx+dy*hit.ny+dz*hit.nz,s=rr(1.5,3.5);
    const tx=dx-hit.nx*dn,ty=dy-hit.ny*dn,tz=dz-hit.nz*dn;
    FX.spawn({x,y,z,vx:tx*s+rr(-.8,.8)+hit.nx*.6,vy:ty*s+rr(-.4,.8)+hit.ny*.6+.5,vz:tz*s+rr(-.8,.8)+hit.nz*.6,life:rr(.25,.45),s0:rr(.3,.5),s1:rr(.8,1.3),r:1,g:rr(.42,.6),b:.14,a:.75,f:11,drag:3,grav:-2.5,fadeIn:Math.min(.4,L*.9),add:1});
    if(Math.random()<.18)FX.spawn({x,y,z,vx:hit.nx*.4,vy:rr(.4,1),vz:hit.nz*.4,life:rr(.9,1.5),s0:.4,s1:1.6,r:.12,g:.1,b:.09,a:.4,f:Math.random()<.5?2:3,drag:1.4,grav:-.6,fadeIn:Math.min(.4,L),lit:1});
    if(!AU.throttle('salsc'+a.id,300))FX.decal(x-hit.nx*.06,y-hit.ny*.06,z-hit.nz*.06,hit.nx,hit.ny,hit.nz,rr(.25,.45),8,[1,1,1],.55)}}
// k = density (the player's own stream is the thickest)
function salEmit(a,ox,oy,oz,dir,dt,k){const A=a.salAcc||(a.salAcc={});const add=(key,rate)=>{A[key]=(A[key]||0)+rate*dt*k;const n=Math.floor(A[key]);A[key]-=n;return n};
  const cvx=a.c.vx*.4,cvz=a.c.vz*.4;
  // the core: dense, bright, tight at first and swelling as it slows
  for(let i=add('core',230);i>0;i--)salDrop(a,ox,oy,oz,dir,.045,rr(17,21),1.9,rr(.48,.6),{s0:rr(.12,.2),s1:rr(1.1,1.6),r:1,g:rr(.46,.66),b:rr(.1,.2),a:.72,f:11,grav:-1.4,add:1});
  // the body of the fire (plain blending, so it still reads against a bright sky)
  for(let i=add('body',50);i>0;i--)salDrop(a,ox,oy,oz,dir,.07,rr(15,19),2,rr(.4,.5),{s0:.14,s1:rr(.9,1.3),r:1,g:rr(.36,.52),b:.08,a:.5,f:11,grav:-1.6,fadeIn:.03});
  // a wider, redder fringe
  for(let i=add('edge',60);i>0;i--)salDrop(a,ox,oy,oz,dir,.11,rr(12,17),2,rr(.38,.52),{s0:.12,s1:rr(.9,1.4),r:1,g:rr(.32,.48),b:.1,a:.7,f:11,grav:-2,add:1});
  // glow round the stream
  for(let i=add('glow',22);i>0;i--)salDrop(a,ox,oy,oz,dir,.07,rr(10,15),2,rr(.3,.42),{s0:.35,s1:rr(1.6,2.4),r:1,g:.45,b:.12,a:.22,f:1,add:1});
  // the rope: the first few metres drawn afresh every frame (the droplets leave the nozzle too fast to fill it), short of a wall
  {const L=Math.min(a.salW||4,4);for(let i=add('rope',560);i>0;i--){const d=.12+Math.random()*L,w=.025+d*.05;
    FX.spawn({x:ox+dir.x*d+rr(-w,w),y:oy+dir.y*d+rr(-w,w)+d*d*.012,z:oz+dir.z*d+rr(-w,w),vx:dir.x*5+cvx,vy:dir.y*5+.4,vz:dir.z*5+cvz,life:rr(.04,.075),s0:.09+d*.15,s1:.13+d*.2,r:1,g:clamp(rr(.6,.8)-d*.07,.38,1),b:clamp(rr(.2,.34)-d*.05,.06,1),a:.55,f:Math.random()<.6?11:1,add:1})}}
  // the flash at the nozzle
  if(Math.random()<dt*40)FX.spawn({x:ox+dir.x*.15,y:oy+dir.y*.15,z:oz+dir.z*.15,vx:dir.x*4,vy:dir.y*4,vz:dir.z*4,life:.07,s0:.22,s1:.4,r:1,g:.85,b:.5,a:.9,f:1,add:1});
  // black smoke rolling off the top of the stream
  for(let i=add('smk',20);i>0;i--){const d=rr(1.5,4.5);spreadDir(dir,.12,_sc);if(rayCast(ox,oy,oz,_sc.x,_sc.y,_sc.z,d,SHOT_FILTER))continue;
    FX.spawn({x:ox+_sc.x*d,y:oy+_sc.y*d+.2,z:oz+_sc.z*d,vx:_sc.x*3+cvx,vy:rr(.5,1.4),vz:_sc.z*3+cvz,life:rr(1,1.7),s0:.35,s1:rr(1.8,2.6),r:.13,g:.11,b:.1,a:.42,f:Math.random()<.5?2:3,drag:1.6,grav:-.7,fadeIn:.18,lit:1})}
  // embers
  for(let i=add('emb',16);i>0;i--){spreadDir(dir,.14,_sc);const s=rr(9,15);FX.spark(ox,oy,oz,_sc.x*s+cvx,_sc.y*s+rr(.5,2),_sc.z*s+cvz,rr(.35,.75),[1,rr(.55,.75),.25])}}
// where the local player's stream starts: the view model's nozzle on screen, a metre out along that line (the view model is drawn in
// its own camera, so its nozzle has no world position of its own)
function salOrigin(a,out){const m=VM.cur,c=R.cam.position;if(!m||VM.id!=='salamander'||!VM.vis||!R.vmCam||Math.hypot(c.x-a.c.x,c.z-a.c.z)>.6)return out.copy(muzzleWorld(a));
  m.gun.updateMatrixWorld(true);_sa.set(SAL.mz[0],SAL.mz[1],SAL.mz[2]-.05).applyMatrix4(m.gun.matrixWorld).project(R.vmCam);
  if(!(Math.abs(_sa.x)<1.2&&Math.abs(_sa.y)<1.2))return out.copy(muzzleWorld(a));
  _sa.z=.5;_sa.unproject(R.cam);_sa.sub(c).normalize();return out.copy(c).addScaledVector(_sa,1.05)}
const _so=new THREE.Vector3(),_sp=new THREE.Vector3();
function salUpdate(dt){if(!R.cam)return;const cam=R.cam.position;
  for(const a of G.actors){const held=a.alive&&a.team===TH&&a.cur==='salamander',on=held&&G.t-(a.salT==null?-9:a.salT)<(a.isPlayer||a.bot?.16:.24);
    if(on!==!!a.salOn){a.salOn=on;const e=a.isPlayer?null:actorEye(a);
      if(on){if(a.isPlayer)AU.play('salign',{vol:.75});else AU.at('salign',e.x,e.y,e.z,{vol:.8,range:45})}
      else if(held||a.alive){if(a.isPlayer)AU.play('saloff',{vol:.6});else AU.at('saloff',e.x,e.y,e.z,{vol:.6,range:30})}}
    if(!held){if(a.salL){a.salL.dead=true;a.salL=null}continue}
    const fp=a.isPlayer&&!G.spec;if(!fp&&(!a.ch||!a.ch.grp.visible||Math.hypot(a.c.x-cam.x,a.c.z-cam.z)>60)){if(a.salL){a.salL.dead=true;a.salL=null}continue}
    if(on){const o=fp?salOrigin(a,_so):_so.copy(muzzleWorld(a));aimDir(a.yaw+(a.punchY||0),a.pitch+(a.punchP||0),_sp);
      // how far the stream runs before a wall; a flickering light a couple of metres down it
      const h=rayCast(o.x,o.y,o.z,_sp.x,_sp.y,_sp.z,8,SHOT_FILTER),hw=h?h.t:8,ld=Math.min(2.2,Math.max(.3,hw-.3));a.salW=Math.max(.1,hw-.05);
      if(!a.salL)a.salL=DL.add(o.x,o.y,o.z,'#ff7a2c',10,2.6,0,{flick:.35});a.salL.x=o.x+_sp.x*ld;a.salL.y=o.y+_sp.y*ld+.2;a.salL.z=o.z+_sp.z*ld;salEmit(a,o.x,o.y,o.z,_sp,dt,fp?1:.55);
      if(!a.isPlayer&&!AU.throttle('salg'+a.id,430))AU.at('salgust',o.x,o.y,o.z,{vol:.85,range:45})}
    else{if(a.salL){a.salL.dead=true;a.salL=null}
      // the pilot light (the player's own is drawn on the view model)
      if(!fp&&a.gun&&Math.random()<.8){const p=GUNS.salamander.pilot;a.gun.updateMatrixWorld();_so.set(p[0],p[1],p[2]-.008).applyMatrix4(a.gun.matrixWorld);
        FX.spawn({x:_so.x,y:_so.y,z:_so.z,vx:rr(-.05,.05),vy:rr(.15,.35),vz:rr(-.05,.05),life:rr(.06,.11),s0:rr(.035,.055),s1:.015,r:.45,g:.65,b:1,a:.9,f:1,add:1});
        if(Math.random()<.5)FX.spawn({x:_so.x,y:_so.y+.012,z:_so.z,vy:rr(.3,.6),life:rr(.06,.12),s0:.035,s1:.01,r:1,g:.6,b:.2,a:.8,f:11,add:1})}}}}

// ---------- first person: the pilot light, the jet out of the nozzle, the shudder ----------
function salFlameTex(){if(SAL.tex)return SAL.tex;const N=64;const [cv,x]=mkCanvas(N,N);const id=x.createImageData(N,N),D=id.data;
  for(let y=0;y<N;y++)for(let i=0;i<N;i++){const u=(i-31.5)/31.5,v=(y-31.5)/31.5,w=.62+.3*(v+1)/2,r=Math.hypot(u/w,v*(v<0?.9:1.15)),n=vnoise(i/6,y/6,151,0)-.5,k=clamp(1-r+n*.35,0,1),c=clamp(1-r*1.9,0,1),q=(y*N+i)*4;
    D[q]=255;D[q+1]=Math.min(255,150+80*k+60*c);D[q+2]=Math.min(255,60+60*k*k+150*c);D[q+3]=Math.round(255*Math.min(1,Math.pow(k,1.5)+c*.5))}
  x.putImageData(id,0,0);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return SAL.tex=t}
function salSpr(col,op){const m=new THREE.SpriteMaterial({map:salFlameTex(),color:new THREE.Color(col),transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const s=new THREE.Sprite(m);s.renderOrder=11;s.frustumCulled=false;return s}
function salJet(m){const g=new THREE.Group(),J={g,jet:[],pilot:[]};const mz=SAL.mz,p=SAL.pilot;
  J.pilot.push(salSpr('#6aa8ff',.9),salSpr('#ff9a40',.85));J.pilot[0].position.set(p[0],p[1],p[2]-.004);J.pilot[1].position.set(p[0],p[1]+.008,p[2]-.008);
  for(let i=0;i<9;i++){const s=salSpr(i<2?'#fff0c8':i<5?'#ffb050':'#ff7020',i<5?.95:.75);J.jet.push(s);g.add(s)}
  J.glow=salSpr('#ff8030',.5);g.add(J.glow);for(const s of J.pilot)g.add(s);m.gun.add(g);J.mz=mz;return J}
VMX.salamander=function(V,a,dt,o,m){const J=m.salJ||(m.salJ=salJet(m));const on=!!(a.salOn&&a.alive),fd=V.act&&V.act.tag==='draw',lit=!fd||V.salLitA===V.act;
  V.salPopT=Math.max(0,(V.salPopT||0)-dt);const pop=V.salPopT/.35;
  // the pilot: a blue cone with an orange tip, flickering; a bigger burst when it catches on the first draw
  J.pilot[0].visible=J.pilot[1].visible=lit;if(lit){const f=rr(.8,1.2)*(1+pop*2.5);J.pilot[0].scale.set(.022*f,.03*f,1);J.pilot[1].scale.set(.02*f*rr(.8,1.2),.034*f*rr(.8,1.3),1);J.pilot[1].material.rotation=rr(-.2,.2)}
  for(const s of J.jet)s.visible=on;J.glow.visible=on||pop>0;
  if(on){const mz=J.mz;for(let i=0;i<J.jet.length;i++){const s=J.jet[i],u=i/(J.jet.length-1),f=rr(.75,1.25);
      s.position.set(mz[0]+rr(-1,1)*.008*u,mz[1]+rr(-1,1)*.008*u+u*.02,mz[2]-.03-u*.66);s.scale.set((.05+u*.3)*f,(.05+u*.3)*f*rr(.8,1.1),1);s.material.rotation=rr(-Math.PI,Math.PI)}
    J.glow.position.set(mz[0],mz[1],mz[2]-.08);J.glow.scale.setScalar(rr(.26,.34));J.glow.material.opacity=.45;
    const fl=rr(.75,1.15);V.U.uMuzzle.value.setRGB(2.6*fl,1.25*fl,.45*fl);
    // a heavy gun shuddering on its jet
    const j=.0016;o[0]+=rr(-j,j);o[1]+=rr(-j,j);o[2]+=.007;o[3]+=rr(-j,j)*2.4+.004;o[5]+=rr(-j,j)*2}
  else if(pop>0){J.glow.position.set(J.mz[0],J.mz[1]-.03,J.mz[2]);J.glow.scale.setScalar(.25*pop+.05);J.glow.material.opacity=.6*pop;V.U.uMuzzle.value.setRGB(1.6*pop,.8*pop,.3*pop)}
  else if(lit){const mu=V.U.uMuzzle.value,fl=rr(.85,1.15);mu.r=Math.max(mu.r,.32*fl);mu.g=Math.max(mu.g,.24*fl);mu.b=Math.max(mu.b,.32*fl)}};
// the first draw: the left hand turns the propellant bottle's valve wheel a quarter turn, the gas hisses, the igniter clicks and the
// pilot light pops alight
FDS.salig=function(P,G,m,L){const E=fdExt(G,'aux'),gp=[E.c[0],E.c[1],E.mx[2]];const a=.22,b=.4,c=.56,on=[0,0,.032],bk=[0,1,0];
  return {G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.03,.02,-.01,.06,.16,-.18),K6(c,-.03,.022,-.01,.06,.17,-.2),K6(c+.08,-.008,.004,0,.04,.06,-.06),K6(.88,.003,-.004,0,-.01,-.01,.01),K6(1)],
    H:{A:[{sup:1},{tag:'aux',at:gp}],k:[HK(0,0),HK(.05,0),HK(.14,1,[-.03,-.02,.06],.7,bk,.3),HK(a,1,on,1,bk,.85),HK(b,1,on,1,[.7,.7,0],.9),HK(b+.06,1,[-.03,.03,.05],.9,bk,.2),HK(.78,0),HK(1,0)]},
    parts:[{tag:'aux',ch:'rz',k:[[0,0],[a,0],[b,-Math.PI/2],[1,-Math.PI/2]]}],
    E:[[a,'dry',.45,.7],[b-.04,'hiss',.55,1.25],[c,'salign',.5,1.2,[.05,.25,0],[.006,0,0],'salpop']],
    vib:[[0,0],[c,0],[c+.03,.004],[.8,.001],[1,0]],
    C:[[0,0,0,0],[.18,.008,.006,-.01],[c+.03,.012,0,0],[.88,0,0,0],[1,0,0,0]]}};
{const fh=VM.fdHit;VM.fdHit=function(h){fh.call(this,h);if(h[5]==='salpop'){this.salLitA=this.act;this.salPopT=.35}}}
// the canister change sounds like a canister: a latch and a clunk out, a heavy seat and a snap in
{const rl=VM.reload;VM.reload=function(W,d,k,e){rl.call(this,W,d,k,e);const A=this.act;if(this.id!=='salamander'||!A||!A.ev)return;
  for(const v of A.ev){if(v[1]==='magout')v[1]='salout';else if(v[1]==='magin')v[1]='salin'}}}

// ---------- the roar: one looping voice, up while the player's own gun is burning (main.js) ----------
AU.flame=function(v){const c=this.ctx;if(!c||!this.sfx||c.state!=='running')return;const b=this.bank.salroar;if(!b||!b.length)return;
  if(!this.flS){if(!(v>.01))return;const s=c.createBufferSource();s.buffer=b[0];s.loop=true;const g=c.createGain();g.gain.value=0;s.connect(g);g.connect(this.sfx);s.start();this.flS=s;this.flG=g}
  const t=c.currentTime,sd=soundDesign('salroar');this.flS.playbackRate.setTargetAtTime((.94+.1*v)*(sd.rate||1),t,.08);this.flG.gain.setTargetAtTime(this.muted||!(v>.01)?0:.34*v*sd.vol,t,v>.01?.04:.09)};

// ---------- sounds (all synthesised) ----------
// the roar of the jet: a deep turbulent rumble that flutters, a hiss of fuel under pressure, crackling
function salRoar(B,len,env){const out=B.comp(-14,3,.01,.2,B.g(.9,env));
  for(const s of [-1,1]){const g=B.g(.9,B.pan(s*.4,out));B.nz('brown',0,len,B.f('lowpass',rr(650,820),.6,g));B.am(g,0,len,rr(9,13),.45)}
  {const g=B.g(.32,out);B.nz('pink',0,len,B.f('bandpass',rr(1200,1450),.7,g));B.am(g,0,len,17,.5)}
  {const g=B.g(.1,out);B.nz('white',0,len,B.f('highpass',4200,.6,g))}
  {const g=B.g(.3,B.sh(1.6,out));B.osc('sine',48,54,0,len,B.f('lowpass',120,.7,g));B.am(g,0,len,7,.4)}
  for(let i=0;i<len*22;i++){const t=rr(0,len-.05);B.grain(t,rr(900,4200),rr(2,5),rr(.004,.012),rr(.06,.18),out)}}
Object.assign(SFX,{
  // the jet catching: an igniter click, a soft low "fwoomp" opening up, a sub thump, the first crackles
  salign:{n:2,dur:1.1,ch:2,peak:.85,gain:.7,rev:.15,poly:3,pj:.04,fn:B=>{const out=B.comp(-10,4,.003,.2,B.g(.95));B.grain(0,3800,2,.006,.5,out);
    for(const s of [-1,1]){const e=B.env(.02,.05,1,.55,B.pan(s*.35,out));const lp=B.f('lowpass',200,.8,e);lp.frequency.setValueAtTime(200,.02);lp.frequency.exponentialRampToValueAtTime(2400,.14);lp.frequency.exponentialRampToValueAtTime(650,.85);B.nz('brown',.02,.9,lp)}
    {const e=B.env(.02,.01,.8,.3,B.sh(2,out));B.osc('sine',90,38,.02,.32,e)}
    {const e=B.env(.04,.06,.4,.5,out);B.nz('pink',.04,.6,B.sweep(B.f('bandpass',600,.9,e),600,2200,.04,.45))}
    for(let i=0;i<10;i++)B.grain(rr(.08,.75),rr(1500,4500),3,.008,rr(.08,.2),out)}},
  // the loop under the player's own stream (AU.flame)
  salroar:{n:1,dur:1.7,ch:2,peak:.75,gain:.6,loop:.3,fn:B=>salRoar(B,1.7)},
  // a stretch of roar for someone else's stream (played again and again while it burns)
  salgust:{n:2,dur:.75,ch:2,peak:.8,gain:.6,rev:.12,poly:4,pj:.05,fn:B=>salRoar(B,.75,B.env(0,.08,1,.62,null,.04))},
  // shut off: the valve clacks, the gas hisses away, the last of the flame puffs and sputters
  saloff:{n:2,dur:.9,ch:1,peak:.7,gain:.5,rev:.12,poly:3,fn:B=>{const out=B.g(.9);B.grain(0,2600,3,.012,.45,out);B.ring(.005,rr(900,1100),[1,1.6,2.3],[.06,.04,.03],[.12,.07,.04],out);
    {const e=B.envT(0,.01,.6,.18,out);B.nz('white',0,.8,B.sweep(B.f('bandpass',5200,1.4,e),5200,2200,0,.8))}
    {const e=B.env(0,.02,.5,.3,out);B.nz('brown',0,.4,B.f('lowpass',500,.7,e))}
    B.grain(.12,700,1.5,.03,.25,out);for(let i=0;i<5;i++)B.grain(rr(.15,.55),rr(1200,3000),3,.006,rr(.06,.14),out)}},
  // reload: the canister unlatched and pulled (a latch, a hollow clunk), the full one seated (a heavy clunk, the latch snapping, a breath of gas)
  salout:{n:2,dur:.5,peak:.85,gain:.7,rev:.08,fn:B=>{B.grain(0,3200,3,.008,.5);const e=B.env(.01,.002,.9,.12);B.nz('brown',.01,.15,B.f('lowpass',420,.8,e));
    B.ring(.012,rr(380,440),[1,2.1,3.3],[.12,.08,.05],[.25,.12,.06]);B.grain(.06,1800,4,.01,.3)}},
  salin:{n:2,dur:.6,peak:.9,gain:.75,rev:.08,fn:B=>{const e=B.env(0,.002,1,.1);B.nz('brown',0,.14,B.f('lowpass',360,.8,e));{const k=B.env(0,.002,.8,.09);B.osc('sine',110,60,0,.1,k)}
    B.ring(.004,rr(300,360),[1,2.3,3.6],[.14,.09,.05],[.3,.14,.07]);B.grain(.09,4200,2,.006,.45);B.grain(.1,2800,3,.006,.3);const h=B.envT(.14,.01,.18,.12);B.nz('white',.14,.35,B.f('highpass',3500,.7,h))}},
});
SFX_ORDER.push('salign','salroar','salgust','saloff','salout','salin');

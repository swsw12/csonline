'use strict';
// ============ v6.28 weapons: Balrog-XI (flame-fan shotgun), Plasma Gun (green splash orbs), Thunderbolt (wall-piercing railgun) ============
// Names and mechanics follow the CSO weapons; the models are this game's own box designs on the weapon atlas (three new glowing / lacquer slots).
//
// Balrog-XI: a 7-round auto shotgun fed shell by shell. Four shells in ONE pull of the trigger (spRun: letting go starts the count again) put a
// special charge into its own slot (up to 7; the Blaze-8's special-shell machinery, newguns.js). Right click looses five fireballs in a fan
// (spFlame): each grows as it flies, stops in the first zombie it touches and sets it alight, so at point blank all five land in one body.
// The charge shows as a ring round the crosshair (bxRing) and as seven ember pips on the receiver.
// Plasma Gun: 45 rounds of green plasma orbs (projectiles) that burst on contact with a splash (full at the centre, 80% at the edge).
// Every part of the body takes the same damage, a headshot never counts (no 확인사살 either) and morale does not raise it (o.flat).
// The reload pulls the glowing cell out of its cradle on the right side backwards and pushes a fresh one in (rlCell).
// Thunderbolt: a railgun with its own ammunition (30 shots, no magazine and no reload; buying ammo or a supply refills it: W.noRel).
// The beam goes through every wall (×0.85 each) and every zombie on its line (×0.9 for each one before). Standing still it never misses,
// scoped or not. Its own scope: a teal ring that turns red while the line runs over a zombie, and while scoped every zombie in view is marked,
// through walls too (tbHud). The coils along the rails light up again as it recharges (VMX.thunder).

// ---------- atlas: plasma glow (self-lit green), the Thunderbolt's blue-violet plating, its self-lit cyan ----------
const CSO_MATS=['plGlow','tbBody','tbGlow'];
for(const m of CSO_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintCsoAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // plasma: a churning lime-green glow with brighter swirls
  patch('plGlow',(xx,y,X,Y)=>{const t=nz(X,Y,5101,12),w=Math.sin(xx*.15+t*6+y*.05);let c=t>.6?'#d8ff7a':t>.42?'#8cf03a':'#4cc21c';if(w>.9)c='#f2ffc8';return c},232);
  // plating: deep blue-violet with panel seams and a faint sheen
  patch('tbBody',(xx,y,X,Y)=>{const t=nz(X,Y,5102,18)+(hash2(X,Y,5103)-.5)*.08;let c=t>.62?'#4a4a9a':t<.38?'#26285c':'#363878';if(y%32===0||xx%64===0)c='#15163a';if(y%32===1)c='#5c5cb0';return c},248);
  // energy: a hot cyan core fading to blue
  patch('tbGlow',(xx,y,X,Y)=>{const t=nz(X,Y,5104,10),b=Math.abs(Math.sin(y*.2+t*4));let c=b>.85?'#eaffff':t>.55?'#7ae8ff':'#2aa8f0';return c},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintCsoAtlas()}}

// =====================================================================================================================================
// ---------- Balrog-XI ----------
GUNS.balrog11={parts:[
  // receiver: crimson lacquer, engraved side plates, a black top rail with ember vents
  Pt(0,.03,-.05,.054,.078,.26,'lacR'),Pt(.0276,.032,-.05,.002,.054,.19,'engraved'),Pt(-.0276,.032,-.05,.002,.054,.19,'engraved'),
  Pt(0,.074,-.06,.032,.012,.21,'blk2'),...[-.14,-.1,-.06,-.02].map(z=>Pt(0,.0815,z,.018,.004,.02,'ember')),
  // the ember pips (special charges, p1..p7) along the left side of the receiver (the side the first-person view looks at)
  ...[1,2,3,4,5,6,7].map(i=>Pt(-.0286,.006,-.155+(i-1)*.022,.003,.01,.012,'ember',{tag:'p'+i})),Pt(-.0283,.006,-.089,.0022,.016,.15,'blk'),
  // barrel with a lacquered heat shield and vents, an ember ring, a flared brake
  Pt(0,.066,-.45,.026,.026,.56,'blk'),Pt(0,.088,-.4,.034,.008,.36,'lacR'),...[-.53,-.47,-.41,-.35,-.29].map(z=>Pt(0,.0925,z,.022,.002,.026,'muzzle')),
  Pt(0,.066,-.718,.042,.038,.01,'ember'),Pt(0,.066,-.745,.044,.04,.05,'lacR'),Pt(0,.066,-.772,.018,.018,.004,'muzzle'),
  Pt(.0225,.066,-.745,.002,.024,.03,'muzzle'),Pt(-.0225,.066,-.745,.002,.024,.03,'muzzle'),
  // the tube magazine and its lacquered cap
  Pt(0,.03,-.4,.03,.03,.5,'blk2'),Pt(0,.03,-.655,.034,.034,.02,'lacR'),Pt(0,.03,-.667,.022,.022,.006,'blk'),
  // crimson ribbed fore-end with black ribs; steel horns raked back from the receiver's front corners
  Pt(0,.03,-.3,.056,.06,.22,'lacR'),...[-.39,-.345,-.3,-.255,-.21].map(z=>Pt(0,.03,z,.059,.064,.008,'blk')),
  ...[1,-1].flatMap(s=>[Pt(s*.031,.062,-.17,.008,.01,.05,'chrome',{ry:s*.5,rx:-.35}),Pt(s*.033,.032,-.175,.007,.008,.045,'chrome',{ry:s*.55}),Pt(s*.031,.004,-.17,.006,.008,.04,'steel',{ry:s*.5,rx:.35})]),
  // sights: an orange bead, a ghost ring at the rear
  Pt(0,.1,-.7,.008,.014,.008,'orange'),Pt(0,.093,-.12,.024,.02,.01,'blk'),Pt(0,.094,-.12,.012,.012,.012,'muzzle'),
  // the ejection port, the charging handle (chg) on the right
  Pt(.0275,.045,-.06,.003,.028,.07,'muzzle'),...TAG('chg',[Pt(.036,.042,-.03,.014,.012,.012,'steel'),Pt(.044,.042,-.03,.006,.016,.016,'blk')]),
  // grip and guard, a black stock with a lacquered cheek riser and a rubber pad
  ...pGrip('grip2',-.045,.04,.3),...tGuard(-.01),Pt(0,.04,.18,.042,.064,.24,'blk2',{rx:-.06}),Pt(0,.078,.19,.034,.02,.16,'lacR'),Pt(0,.02,.34,.05,.12,.02,'rub',{rx:-.08})],
  grip:[0,-.03,.02],sup:[0,.005,-.3],muzzle:[0,.066,-.775],mag:[0,.0,-.12],eject:[.03,.05,-.06]};
WPN.balrog11={slot:1,kind:'shotgun',n:['발록-XI','Balrog-XI'],cost:5750,mag:7,res:49,pellets:6,dmg:24,rpm:240,spread:[.06,.075,.11],rec:[.06,.02],kb:3.2,stag:.45,hs:2,
  shellRel:.36,relStart:.32,relFire:1,spEvery:4,spMax:7,spFlame:1,spGain:'bxchg',spFanA:.2,spDmg:160,spKb:6,spStag:1.1,spBurn:3,spSpd:24,spLife:.6,
  draw:.85,speed:.9,snd:'bx11',model:'balrog11',hold:'rifle',shell:1,spose:[-.09,.1,-.02,.34,.2,-1.0]};
VM_POS.balrog11={p:[.15,-.165,-.37],r:[0,.08,.035]};
BUY_MENU.find(c=>c.k==='shotgun').items.push('balrog11');

// right click: five fireballs in a fan (newguns.js spFire hands over here when W.spFlame)
function bxFlame(a,W){const eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const b=_dv.clone(),d=new THREE.Vector3();
  for(let i=0;i<5;i++){const off=(i-2)/2*W.spFanA,c=Math.cos(off),s=Math.sin(off);d.set(b.x*c+b.z*s,b.y,-b.x*s+b.z*c).normalize();const n=csoProj(a,W,eye,d,'bxfl');if(n&&i===2&&!NET.ghost)n.light=DL.add(n.x,n.y,n.z,'#ff6a20',7,2.2,0,{flick:.2})}
  const mz=muzzleWorld(a);for(let k=0;k<3;k++)FX.muzzle(mz.x,mz.y,mz.z,b.x,b.y,b.z,true);
  for(let k=0;k<14;k++){const sp=rr(4,9);FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:b.x*sp+rr(-1.5,1.5),vy:b.y*sp+rr(-.3,.8),vz:b.z*sp+rr(-1.5,1.5),life:rr(.2,.4),s0:rr(.2,.35),s1:.05,r:1,g:rr(.45,.7),b:.15,f:11,add:1})}
  a.punchP+=W.rec[0]*2.2;a.punchY+=(Math.random()*2-1)*W.rec[1]*1.5;a.kick=1;a.shots++;
  if(a.isPlayer){AU.play('bxfire',{vol:.95});VM.fire(W,0);FX.shake=Math.max(FX.shake,.35)}else AU.at('bxfire',eye.x,eye.y,eye.z,{vol:.95,range:70});
  a.lastFire=G.t;alertBots(a,eye.x,eye.z)}
// a fireball: it grows as it flies (0.3 m to about 1.1 m), stops in the first zombie it touches (damage, a shove, burning) or at a wall
function bxPoint(t,x,y,z,r){const c=t.c,hw=(t.hitW||c.hw),top=t.head.y+.1,cy=clamp(y,c.y+.1,top),dh=Math.hypot(x-c.x,z-c.z)-hw,dv=Math.abs(y-cy);return Math.hypot(Math.max(0,dh),dv)<r}
function bxUpd(n,dt){const W=WPN.balrog11;n.r=.3+n.t*1.3;
  const sp=Math.hypot(n.vx,n.vy,n.vz),steps=Math.max(1,Math.ceil(sp*dt/.3)),h=dt/steps;let end=false;
  for(let s=0;s<steps&&!end;s++){const dx=n.vx/sp,dy=n.vy/sp,dz=n.vz/sp,L=sp*h;
    const hw=rayCast(n.x,n.y,n.z,dx,dy,dz,L+.05,SHOT_FILTER);
    if(hw&&hw.t<=L+.05){n.x+=dx*Math.max(0,hw.t-.05);n.y+=dy*Math.max(0,hw.t-.05);n.z+=dz*Math.max(0,hw.t-.05);bxBurst(n,null,dx,dz);end=true;break}
    n.x+=dx*L;n.y+=dy*L;n.z+=dz*L;
    for(const t of G.actors){if(!t.alive||t.team===n.owner.team||n.hit.has(t))continue;if(!bxPoint(t,n.x,n.y,n.z,n.r*.85+.1))continue;
      n.hit.add(t);const hl=Math.hypot(dx,dz)||1;
      damageActor(t,W.spDmg,n.owner,{w:'balrog11',dir:[dx/hl,.15,dz/hl],kb:W.spKb,stag:W.spStag,x:n.x,y:n.y,z:n.z,nocap:1});
      if(!NET.ghost&&!n.ghost&&t.alive){t.burnT=Math.max(t.burnT||0,W.spBurn);t.burnSrc=n.owner;t.burnW='balrog11'}
      bxBurst(n,t,dx,dz);if(n.owner.isPlayer)HUD.hitmark(false);end=true;break}}
  if(!end){for(let k=0;k<3;k++)FX.spawn({x:n.x+rr(-.3,.3)*n.r,y:n.y+rr(-.3,.3)*n.r,z:n.z+rr(-.3,.3)*n.r,vx:n.vx*.25+rr(-.4,.4),vy:rr(.1,.9),vz:n.vz*.25+rr(-.4,.4),life:rr(.12,.24),s0:n.r*rr(.9,1.4),s1:n.r*.3,r:1,g:rr(.42,.72),b:rr(.08,.2),f:11,add:1});
    if(Math.random()<.35)FX.spawn({x:n.x,y:n.y+.1,z:n.z,vx:rr(-.3,.3),vy:rr(.4,1),vz:rr(-.3,.3),life:rr(.5,.9),s0:n.r*.6,s1:n.r*1.6,r:.16,g:.14,b:.13,a:.35,f:2,drag:1.5,lit:1});
    if(n.light){n.light.x=n.x;n.light.y=n.y;n.light.z=n.z}}
  if(end||n.t>(W.spLife||.6)){if(n.light)n.light.dead=true;if(!end)bxBurst(n,null,0,0,true);return true}return false}
function bxBurst(n,t,dx,dz,fade){const r=n.r||.3;for(let k=0;k<(fade?6:12);k++){const a=Math.random()*TAU,sp=rr(.5,2.6);FX.spawn({x:n.x,y:n.y,z:n.z,vx:Math.cos(a)*sp+dx*1.5,vy:rr(.2,1.6),vz:Math.sin(a)*sp+dz*1.5,life:rr(.2,.4),s0:r*rr(.8,1.3),s1:r*.2,r:1,g:rr(.4,.7),b:.12,f:11,add:1})}
  if(!fade&&!AU.throttle('bxh',50))AU.at('salgust',n.x,n.y,n.z,{vol:.5,range:30,rate:1.4})}

// =====================================================================================================================================
// ---------- Plasma Gun ----------
// the cell (tag mag) lies in a cage on the left of the receiver (the side the first-person view looks at); it slides out backwards
GUNS.plasma={parts:[
  // receiver and the upper housing with its rail
  Pt(0,.035,-.04,.058,.09,.3,'blk'),Pt(0,.095,-.12,.05,.03,.36,'gunmetal'),Pt(0,.115,-.12,.026,.008,.26,'rail'),Pt(0,.094,.04,.04,.028,.06,'gunmetal'),
  Pt(.0295,.04,-.06,.002,.05,.18,'blk2'),Pt(-.031,.075,-.0,.004,.012,.012,'orange'),Pt(-.031,.075,.02,.004,.012,.012,'plGlow'),Pt(-.0298,.035,.05,.002,.03,.05,'yellow'),
  // the cradle on the right: a back plate, two cage bars, a stop at the front
  Pt(-.034,.04,-.23,.008,.07,.24,'gunmetal'),Pt(-.064,.072,-.23,.008,.006,.22,'steel'),Pt(-.064,.008,-.23,.008,.006,.22,'steel'),Pt(-.062,.04,-.348,.06,.07,.012,'gunmetal'),
  // the plasma cell (mag): a glowing tube with steel end caps and a pull ring at the rear
  ...TAG('mag',[Pt(-.062,.04,-.23,.05,.042,.2,'plGlow'),Pt(-.062,.04,-.23,.036,.058,.2,'plGlow'),Pt(-.062,.04,-.335,.054,.054,.014,'steel'),Pt(-.062,.04,-.125,.054,.054,.014,'steel'),
    Pt(-.062,.04,-.112,.024,.024,.012,'blk'),Pt(-.062,.04,-.104,.03,.008,.006,'steel')]),
  // the emitter: a shroud with cooling rings, prongs and a glowing core at the muzzle
  Pt(0,.05,-.42,.066,.066,.28,'blk'),...[-.32,-.38,-.44,-.5].map(z=>Pt(0,.05,z,.076,.076,.01,'gunmetal')),Pt(0,.05,-.575,.052,.052,.03,'gunmetal'),
  Pt(0,.05,-.592,.03,.03,.006,'plGlow'),Pt(.026,.05,-.615,.008,.02,.05,'steel'),Pt(-.026,.05,-.615,.008,.02,.05,'steel'),Pt(0,.076,-.615,.02,.008,.05,'steel'),
  Pt(0,.085,-.5,.006,.02,.012,'blk'),
  // a fore grip, the pistol grip and guard, a charging lever on the left (chg)
  Pt(0,-.03,-.36,.03,.08,.035,'grip2',{rx:.1}),...pGrip('grip2',-.06,.04,.28),...tGuard(-.01),...TAG('chg',[Pt(.036,.06,-.02,.012,.012,.03,'steel'),Pt(.044,.06,-.008,.008,.016,.012,'blk')]),
  // stock
  Pt(0,.04,.17,.05,.08,.18,'gunmetal'),Pt(0,.08,.15,.03,.02,.14,'blk'),Pt(0,.03,.27,.056,.12,.02,'rub'),Pt(-.0255,.04,.17,.002,.03,.1,'plGlow')],
  grip:[0,-.04,.02],sup:[0,-.02,-.36],muzzle:[0,.05,-.62],mag:[-.062,.04,-.23],eject:[.03,.06,-.06]};
GUNS.plorb={parts:[Pt(0,0,0,.07,.07,.07,'plGlow'),Pt(0,0,0,.05,.09,.05,'plGlow'),Pt(0,0,0,.09,.05,.05,'plGlow'),Pt(0,0,0,.05,.05,.09,'plGlow')],grip:[0,0,0],muzzle:[0,0,0]};
WPN.plasma={slot:1,kind:'rifle',n:['플라즈마 건','Plasma Gun'],cost:5500,mag:45,res:270,dmg:60,rpm:600,proj:'plasma',plR:3.8,plSpd:52,spread:[.008,.03,.08],rec:[.012,.006],kb:3.2,stag:.38,hs:1,
  reload:3.2,draw:.85,speed:.92,snd:'plfire',model:'plasma',hold:'rifle'};
VM_POS.plasma={p:[.15,-.17,-.36],r:[0,.085,.035]};
BUY_MENU.find(c=>c.k==='rifle').items.push('plasma');
function plUpd(n,dt){const r=projStep(n,dt,0,(n,ha)=>{plBoom(n,ha.a);return 'kill'},(n)=>{plBoom(n,null);return 'kill'});
  if(r==='kill')return true;
  if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.rotation.set(n.t*9,n.t*7,0);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
  FX.spawn({x:n.x,y:n.y,z:n.z,life:.1,s0:.22,s1:.08,r:.6,g:1,b:.3,a:.8,f:14,add:1});
  if(Math.random()<.6)FX.spawn({x:n.x+rr(-.05,.05),y:n.y+rr(-.05,.05),z:n.z+rr(-.05,.05),vx:rr(-.4,.4),vy:rr(-.2,.5),vz:rr(-.4,.4),life:rr(.15,.3),s0:.06,s1:.01,r:.75,g:1,b:.4,f:11,add:1});
  return n.t>2.5}
// the burst: every zombie inside plR with a clear line takes the same damage wherever it is hit (full at the centre, half at the edge; the one hit
// directly takes it in full); flat = morale does not raise it, no headshot
function plBoom(n,direct){const W=WPN.plasma,o=n.owner,x=n.x,y=n.y,z=n.z,R0=W.plR;let hit=false;
  FX.spawn({x,y,z,life:.18,s0:.3,s1:1.4,r:.6,g:1,b:.35,a:.85,f:14,add:1});FX.spawn({x,y,z,life:.12,s0:.5,s1:.9,r:.9,g:1,b:.7,f:1,add:1});
  for(let k=0;k<10;k++){const a=Math.random()*TAU,e=rr(-.4,1),sp=rr(1.5,4);FX.spawn({x,y,z,vx:Math.cos(a)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(a)*Math.cos(e)*sp,life:rr(.2,.45),s0:.07,s1:.01,r:.7,g:1,b:.35,f:11,add:1,grav:3})}
  if(!AU.throttle('plh'+(o?o.id:0),70))AU.at('plhit',x,y,z,{vol:.55,range:35});
  for(const t of G.actors){if(!t.alive||!o||t.team===o.team)continue;const c=t.c,cy=clamp(y,c.y+.2,t.head.y),dx=c.x-x,dz=c.z-z,d=Math.max(0,Math.hypot(dx,cy-y,dz)-c.hw);
    if(t!==direct&&(d>R0||!losClear(x,y,z,c.x,cy,c.z)))continue;const f=t===direct?1:1-.2*clamp(d/R0,0,1),hl=Math.hypot(dx,dz)||1;
    damageActor(t,W.dmg*f,o,{w:'plasma',flat:1,dir:[dx/hl,.05,dz/hl],kb:W.kb*(.5+.5*f),stag:W.stag,x,y,z});hit=true}
  if(hit&&o&&o.isPlayer)HUD.hitmark(false)}
// the reload: the cell out backwards along its cradle, carried down; the fresh one up, pushed in, a hum as it takes
function rlCell(W,G,m,L){const E=fdExt(G,'mag');const S=rlMag(W,G,m,L,{style:'pull',ax:[0,0,1],gp:[E.c[0],E.c[1],E.mx[2]],on:[0,0,.024],bk:[0,0,1],
    pouch:[-.16,-.4,.12],pose:[-.05,.12,-.02,.8,.24,.14]});S.E.push([.68,'plchg',.5,1]);return S}
{const rb0=rlBuild;rlBuild=function(W,G,m,L,empty){if(W&&W.model==='plasma')return rlCell(W,G,m,L);return rb0(W,G,m,L,empty)}}

// =====================================================================================================================================
// ---------- Thunderbolt ----------
GUNS.thunder={parts:[
  // receiver block, the upper deck, a status screen on the right
  Pt(0,.04,-.05,.064,.1,.36,'tbBody'),Pt(0,.1,-.08,.05,.02,.3,'blk'),Pt(-.0335,.05,-.1,.004,.05,.1,'blk'),Pt(-.0358,.05,-.1,.002,.038,.084,'tbGlow'),
  Pt(.0335,.04,-.1,.004,.06,.18,'blk2'),Pt(-.0335,.012,.04,.004,.016,.06,'tbGlow'),
  // the rails: upper and lower plates with the glowing channel between them, coil rings tc1..tc4 over dark holders
  Pt(0,.088,-.5,.032,.016,.62,'tbBody'),Pt(0,.012,-.48,.032,.016,.58,'tbBody'),Pt(0,.05,-.48,.012,.06,.6,'tbGlow'),Pt(.017,.05,-.48,.004,.06,.6,'blk'),Pt(-.017,.05,-.48,.004,.06,.6,'blk'),
  ...[1,2,3,4].flatMap(i=>{const z=-.3-(i-1)*.12;return [Pt(0,.05,z,.066,.106,.014,'blk'),Pt(0,.05,z,.07,.11,.008,'tbGlow',{tag:'tc'+i})]}),
  // the muzzle cap and its slit
  Pt(0,.05,-.81,.05,.096,.03,'tbBody'),Pt(0,.05,-.827,.014,.05,.004,'tbGlow'),
  // a long scope with glowing side strips, on two mounts
  Pt(0,.15,-.1,.05,.05,.24,'blk'),Pt(0,.15,-.226,.058,.058,.02,'tbBody'),Pt(0,.15,-.237,.046,.046,.004,'lens'),Pt(0,.15,.024,.044,.044,.012,'tbBody'),Pt(0,.15,.031,.034,.034,.004,'lens'),
  Pt(.026,.15,-.1,.002,.012,.16,'tbGlow'),Pt(-.026,.15,-.1,.002,.012,.16,'tbGlow'),Pt(0,.122,-.17,.02,.03,.022,'tbBody'),Pt(0,.122,-.03,.02,.03,.022,'tbBody'),
  // a power switch on the left (sw), a folded bipod under the rails
  ...TAG('sw',[Pt(-.037,.08,-.02,.006,.012,.026,'steel'),Pt(-.041,.08,-.008,.006,.02,.006,'tbGlow')]),Pt(.012,.0,-.56,.008,.008,.2,'steel'),Pt(-.012,.0,-.56,.008,.008,.2,'steel'),
  // grip, guard, a thumbhole stock with a cheek rest and pad
  ...pGrip('grip2',-.065,.04,.28),...tGuard(-.01),Pt(0,.06,.2,.05,.06,.26,'tbBody'),Pt(0,-.02,.25,.04,.05,.14,'tbBody'),Pt(0,.098,.18,.036,.016,.16,'blk'),Pt(0,.02,.34,.056,.13,.02,'rub')],
  grip:[0,-.04,.02],sup:[0,.0,-.42],muzzle:[0,.05,-.83],mag:[0,.05,-.48],eject:[.03,.06,-.06]};
WPN.thunder={slot:1,kind:'sniper',n:['썬더볼트','Thunderbolt'],cost:7000,mag:30,res:0,noRel:1,rail:1,dmg:650,hs:2.5,rpm:40,semi:1,spread:[0,.025,.12],spreadZ:0,zoom:[26,10],
  rec:[.1,.015],kb:26,stag:1,reload:1,draw:1,speed:.85,snd:'tbfire',model:'thunder',hold:'rifle',range:150,wallK:.85,pierceK:.9};
VM_POS.thunder={p:[.145,-.17,-.38],r:[0,.075,.03]};
BUY_MENU.find(c=>c.k==='sniper').items.push('thunder');
// the walls it passes through (each box once), then every enemy on the line (head sphere, body box, a zombie's arms; a boss's own volumes)
const TB_PASS=new Set(),TB_F={skip:b=>b.o.pass||TB_PASS.has(b)};
function tbLine(src,ox,oy,oz,dx,dy,dz,L){const out=[];
  for(const t of G.actors){if(!t.alive||t===src||t.team===src.team)continue;let ht=-1,part=null;
    if(t.epRay&&t.epRayZc===t.zc){const r=t.epRay(ox,oy,oz,dx,dy,dz,L);if(r){ht=r.t;part=r.part}}
    else{const c=t.c,h=t.headR||.14;const th=raySphere(ox,oy,oz,dx,dy,dz,t.head.x,t.head.y,t.head.z,h*1.1,L);if(th>=0){ht=th;part='head'}
      const hw=(t.hitW||c.hw)+.02,top=t.head.y-h*.85;const tb=rayAABB(ox,oy,oz,dx,dy,dz,c.x-hw,c.y,c.z-hw,c.x+hw,top,c.z+hw,L);
      if(tb>=0&&(ht<0||tb<ht)){ht=tb;part=oy+dy*tb<c.y+(top-c.y)*.45?'legs':'body'}
      if(ht<0&&t.team===TZ){const ta=rayArms(t,ox,oy,oz,dx,dy,dz,L);if(ta>=0){ht=ta;part='body'}}}
    if(ht>=0)out.push({a:t,t:ht,part})}
  return out.sort((p,q)=>p.t-q.t)}
// after every shot (the reference video): the gun swings up and rolls over, the free hand slaps the coil housing on its left twice, and it comes back
// down as the coils light again. A shot from the scope drops it; it comes back by itself once the gun is ready (the bolt snipers' way, a.tbZ).
function tbRecharge(G,L){const E=fdExt(G,'tc2'),hp=[E.mn[0],E.c[1],E.c[2]];
  return {G:[K6(0),K6(.08,.004,-.01,.01,-.04,0,0),K6(.24,-.05,.07,-.02,.55,.15,.45),K6(.62,-.05,.072,-.02,.56,.15,.47),K6(.86,.003,-.004,0,-.01,-.01,.01),K6(1)],
    H:{A:[{sup:1},{p:hp}],k:[HK(0,0),HK(.14,0),HK(.3,1,[-.05,.02,.02],1,[-1,.2,0],.4),HK(.38,1,[-.012,.004,0],1,[-1,.2,0],.6),HK(.44,1,[-.04,.02,.02],1,[-1,.2,0],.4),
       HK(.5,1,[-.012,.004,0],1,[-1,.2,0],.6),HK(.6,1,[-.05,.03,.02],1,[-1,.2,0],.3),HK(.82,0),HK(1,0)]},
    E:[[.3,'tbchg',.45,1.1],[.38,'fdgrab',.5,1.3,[.08,-.2,-.1]],[.5,'fdgrab',.5,1.25,[.08,-.2,-.1]]],
    C:[[0,0,0,0],[.25,.01,0,.008],[.7,.008,0,.006],[.9,0,0,0],[1,0,0,0]]}}
function tbShot(a,W,eye,base,sp){if(a.isPlayer&&!NET.ghost){const L=60/W.rpm;if(a.zoom>0){a.tbZ=a.zoom;a.zoom=0}try{VM.playClip(tbRecharge(GUNS.thunder,L),.07,L*.95,'tb')}catch(e){console.error(e)}}
const dir=new THREE.Vector3();spreadDir(base,sp,dir);const L=W.range||150,ox=eye.x,oy=eye.y,oz=eye.z,dx=dir.x,dy=dir.y,dz=dir.z;
  TB_PASS.clear();const walls=[];for(let k=0;k<12;k++){const h=rayCast(ox,oy,oz,dx,dy,dz,L,TB_F);if(!h)break;walls.push({t:h.t,box:h.box,n:[h.nx,h.ny,h.nz]});TB_PASS.add(h.box)}
  const hits=tbLine(a,ox,oy,oz,dx,dy,dz,L);let dmgT=0,hsAny=false;
  hits.forEach((h,i)=>{const t=h.a,nw=walls.filter(w=>w.t<h.t).length,ds=hsForce(a,h),hs=h.part==='head';hsAny=hsAny||hs;
    const x=ox+dx*h.t,y=oy+dy*h.t,z=oz+dz*h.t,dmg=W.dmg*(hs?W.hs:h.part==='legs'?.75:1)*Math.pow(W.wallK,nw)*Math.pow(W.pierceK,i);dmgT+=dmg;
    damageActor(t,dmg,a,{w:a.cur,hs,ds,dir:[dx,dy,dz],kb:W.kb,stag:W.stag,x,y,z});
    if(h.part==='ball')FX.impact(x,y,z,-dx,-dy,-dz,'metal');else FX.blood(x,y,z,dx,dy,dz,hs?2.2:1.5,false);
    if(hs&&a.isPlayer&&!t.isPlayer)AU.play('headshot',{vol:.75})});
  walls.forEach((w,i)=>{if(i>5)return;const x=ox+dx*w.t,y=oy+dy*w.t,z=oz+dz*w.t,m=w.box.o.f&&w.box.o.f[nf(w.n)]||w.box.mat;FX.impact(x,y,z,w.n[0],w.n[1],w.n[2],m);
    for(let k=0;k<4;k++)FX.spark(x,y,z,w.n[0]*rr(1,3)+rr(-1,1),rr(0,2),w.n[2]*rr(1,3)+rr(-1,1),rr(.15,.3),[.5,.85,1]);if(i===0)AU.at('imp_metal',x,y,z,{vol:.5,range:30})});
  const mz=muzzleWorld(a);tbBeam(mz.x,mz.y,mz.z,ox+dx*Math.min(L,110),oy+dy*Math.min(L,110),oz+dz*Math.min(L,110));
  return {hit:hits.length>0,hs:hsAny,dmg:dmgT}}
// the beam: a white core in a blue glow that thins and fades over half a second, sparks along its first stretch
const TB={beams:[],geo:null};
function tbBeam(x0,y0,z0,x1,y1,z1){if(!TB.geo)TB.geo=new THREE.BoxGeometry(1,1,1);const len=Math.hypot(x1-x0,y1-y0,z1-z0);if(len<.5)return;
  const mk=(col,w,op)=>{const m=new THREE.Mesh(TB.geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.lookAt(x1,y1,z1);m.scale.set(w,w,len);m.renderOrder=6;R.scene.add(m);return m};
  TB.beams.push({t:0,life:.6,core:mk(0xd8f4ff,.03,1),glow:mk(0x3a8cff,.15,.6),w:[.03,.15]});
  const dx=(x1-x0)/len,dy=(y1-y0)/len,dz=(z1-z0)/len;for(let k=0;k<26;k++){const s=rr(.5,Math.min(len,40));FX.spawn({x:x0+dx*s,y:y0+dy*s,z:z0+dz*s,vx:rr(-.3,.3),vy:rr(-.1,.4),vz:rr(-.3,.3),life:rr(.25,.6),s0:.09,s1:.01,r:.55,g:.8,b:1,f:11,add:1})}
  DL.add(x0,y0,z0,'#5aa8ff',6,2.4,.12)}
function tbUpdate(dt){for(let i=TB.beams.length-1;i>=0;i--){const b=TB.beams[i];b.t+=dt;const k=1-b.t/b.life;
    if(k<=0){for(const m of [b.core,b.glow]){R.scene.remove(m);m.material.dispose()}TB.beams.splice(i,1);continue}
    b.core.material.opacity=k;b.glow.material.opacity=.55*k*k;const s0=b.w[0]*(.4+.6*k),s1=b.w[1]*(.6+.6*(1-k));b.core.scale.x=b.core.scale.y=s0;b.glow.scale.x=b.glow.scale.y=s1}}
{const nu0=nyUpdate;nyUpdate=function(dt){nu0(dt);tbUpdate(dt)}}
// first draw: the thumb flips the power switch, the coils light up one by one with a rising whine and a shudder
FDS.rail=function(P,G,m,L){const E=fdExt(G,'sw'),sw=[E.mn[0],E.c[1],E.c[2]];
  return {G:[K6(0),K6(.1,-.01,.01,0,.06,-.04,.12),K6(.55,-.012,.012,0,.07,-.05,.14),K6(.9,.003,-.003,0,-.01,-.01,.01),K6(1)],
    H:{A:[{sup:1},{p:sw}],k:[HK(0,0),HK(.08,0),HK(.2,1,[-.02,.01,.01],1,[-1,.2,0],.4),HK(.27,1,[-.012,.004,0],1,[-1,.2,0],.6),HK(.34,1,[-.03,.02,.02],1,[-1,.2,0],.3),HK(.6,0),HK(1,0)]},
    parts:[{tag:'sw',ch:'rx',k:[[0,0],[.25,0],[.29,-.9],[.9,-.9],[.97,0]]}],
    E:[[.28,'tbsw',.6,1],[.32,'tbchg',.6,.9]],vib:[[0,0],[.3,0],[.5,.004],[.8,.002],[.95,0],[1,0]],
    C:[[0,0,0,0],[.3,.006,0,0],[.9,0,0,0],[1,0,0,0]]}};
// the coils light as it recharges (and as the first draw powers it up); the balrog's pips show the charges in the slot
VMX.thunder=function(V,a,dt,o,m){const W=WPN.thunder;let p=a.drawT>0?clamp(1-a.drawT/1.3,0,1):clamp(1-(a.nextFire-G.t)/(60/W.rpm),0,1);
  const am=a.ammo.thunder;if(!am||am.mag<=0)p=0;const k=Math.floor(p*4+.001);for(let i=1;i<=4;i++){const T=m.tags['tc'+i];if(T)T.visible=i<=k}
  if(p>=1&&!V.tbReady&&a.isPlayer&&a.drawT<=0&&G.t-(a.lastFire||-9)<3)AU.play('tbchg',{vol:.25,rate:1.3});V.tbReady=p>=1;
  if(a.tbZ&&p>=1){if(a.drawT<=0&&a.reloadT<=0&&G.t-(a.lastFire||-9)<3&&a.alive)a.zoom=a.tbZ;a.tbZ=0}};
VMX.balrog11=function(V,a,dt,o,m){const n=(a.spAm&&a.spAm.balrog11)|0;for(let i=1;i<=7;i++){const T=m.tags['p'+i];if(T)T.visible=i<=n}};

// ---------- projectiles: the plasma orb and the fireball (the remote copies come through nyProj, net.js) ----------
function csoProj(a,W,eye,dir,kind){const sp=kind==='plasma'?W.plSpd||52:W.spSpd||24;
  const n={kind,owner:a,w:a.cur,x:eye.x+dir.x*.55,y:eye.y+dir.y*.55-.06,z:eye.z+dir.z*.55,vx:dir.x*sp,vy:dir.y*sp,vz:dir.z*sp,t:0,mesh:null,spin:0,hit:new Set(),upd:PROJ_UPD[kind],r:.22};
  if(kind==='plasma'){const m=new THREE.Mesh(gunGeo('plorb'),matGun());m.position.set(n.x,n.y,n.z);R.scene.add(m);n.mesh=m}
  NADES.push(n);NET.on&&netFxPush(['p',a.id,WI[a.cur],kind,r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)]);return n}
PROJ_UPD.plasma=plUpd;PROJ_UPD.bxfl=bxUpd;
{const np0=nyProj;nyProj=function(a,W,eye,dir,kind){if(kind==='plasma'||kind==='bxfl')return csoProj(a,WPN[kind==='plasma'?'plasma':'balrog11'],eye,dir,kind);return np0(a,W,eye,dir,kind)}}

// ---------- HUD: the Balrog-XI's charge ring, the Thunderbolt's scope, marks and its ammo readout ----------
function csoHud(){const P=G.player,hud=$('hud');if(!P||!hud)return;const W=WPN[P.cur],live=P.alive&&P.team===TH&&!G.spec&&G.st!=='menu';
  // Balrog-XI: the ring fills with the shells of this pull; the count of charges in the slot under it
  let rg=$('bxRing');const showR=live&&W&&W.spFlame&&!(P.zoom>0);
  if(showR&&!rg){rg=document.createElement('div');rg.id='bxRing';rg.innerHTML='<svg viewBox="0 0 52 52"><circle class="tr" cx="26" cy="26" r="22"/><circle class="pg" cx="26" cy="26" r="22"/></svg><b></b>';hud.appendChild(rg)}
  if(rg){rg.style.display=showR?'block':'none';if(showR){const n=(P.spN&&P.spN[P.cur])|0,m=(P.spAm&&P.spAm[P.cur])|0,C=138.2;
      rg.querySelector('.pg').style.strokeDashoffset=(C*(1-(m>=W.spMax?1:n/W.spEvery))).toFixed(1);const b=rg.querySelector('b'),s=m?'◆'+m:'';if(b.textContent!==s)b.textContent=s;rg.classList.toggle('on',m>0)}}
  // Thunderbolt
  const tb=live&&W&&W.rail,sc=$('scope');let mk=$('tbMk');
  if(tb&&P.zoom>0&&sc){const e=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const lock=tbLine(P,e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,W.range).length>0;sc.className='tb'+(lock?' lock':'');
    if(!mk){mk=document.createElement('div');mk.id='tbMk';hud.appendChild(mk)}mk.style.display='block';
    const cw=innerWidth,ch=innerHeight;let i=0;
    for(const t of G.actors){if(!t.alive||t.team===P.team)continue;const d=Math.hypot(t.head.x-e.x,t.head.y-e.y,t.head.z-e.z);if(d>W.range)continue;
      _dn.set(t.c.x,(t.c.y+t.head.y)/2,t.c.z).project(R.cam);if(_dn.z>1||Math.abs(_dn.x)>1||Math.abs(_dn.y)>1)continue;
      let el=mk.children[i];if(!el){el=document.createElement('i');mk.appendChild(el)}i++;const s=clamp(1500/Math.max(d,1),16,160);
      el.style.cssText=`display:block;width:${(s*.55).toFixed(0)}px;height:${s.toFixed(0)}px;transform:translate(${((_dn.x*.5+.5)*cw).toFixed(1)}px,${((-_dn.y*.5+.5)*ch).toFixed(1)}px) translate(-50%,-50%)`;
      el.className=losClear(e.x,e.y,e.z,t.head.x,t.head.y,t.head.z)?'':'w'}
    for(;i<mk.children.length;i++)mk.children[i].style.display='none'}
  else if(mk)mk.style.display='none';
  if(live&&W&&W.noRel){const r=$('hRes');if(r&&r.textContent!=='')r.textContent=''}}
{const hu0=HUD.update;HUD.update=function(dt){hu0.call(this,dt);try{csoHud()}catch(e){console.error(e)}}}

// ---------- sounds ----------
Object.assign(SFX,{
  bx11:{n:3,dur:1.3,ch:2,peak:.95,gain:.94,rev:.15,poly:5,pj:.03,fn:B=>gunshot(B,Object.assign(GUNDEF.m14(),{drive:2.4}))},
  bxfire:{n:2,dur:1.2,ch:2,peak:.95,gain:.9,rev:.16,poly:3,pj:.04,fn:B=>{salRoar(B,.85,B.env(0,.03,1,.7,null,.05));const o=B.comp(-10,4,.002,.15,B.g(.9));
    const e=B.env(0,.002,1,.25,B.sh(2.2,o));B.osc('sine',rr(85,100),38,0,.28,e);whoosh(B,400,2200,.35,.55,o)}},
  bxchg:{n:2,dur:.7,peak:.8,gain:.55,rev:.1,poly:3,fn:B=>{B.ring(0,rr(1500,1650),[1,1.5,2.4],[.35,.22,.12],[.25,.14,.07]);const e=B.env(0,.01,.25,.25);B.osc('sine',600,1400,0,.25,e)}},
  plfire:{n:4,dur:.6,ch:2,peak:.9,gain:.7,rev:.1,poly:8,pj:.04,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.9));{const e=B.env(0,.002,.8,.16,B.f('lowpass',3800,.7,o));B.osc('square',rr(1300,1500),rr(260,300),0,.17,e)}
    {const e=B.env(0,.002,.5,.22,o);B.osc('sine',rr(700,760),rr(140,160),0,.22,e)}B.grain(0,2800,1.5,.03,.35,o);{const e=B.env(0,.002,.7,.08,B.sh(2,o));B.osc('sine',110,50,0,.1,e)}}},
  plhit:{n:3,dur:.5,peak:.85,gain:.6,rev:.08,poly:6,pj:.06,fn:B=>{B.grain(0,1800,1.2,.05,.5);B.ring(0,rr(900,1100),[1,1.5,2.1],[.12,.08,.05],[.25,.12,.06]);const e=B.env(0,.002,.6,.12);B.nz('pink',0,.14,B.f('lowpass',1600,.7,e))}},
  plchg:{n:1,dur:.9,peak:.8,gain:.5,rev:.1,fn:B=>{const e=B.env(0,.2,.3,.45);B.osc('sine',180,720,0,.6,e);const e2=B.env(.05,.15,.15,.4);B.osc('triangle',360,1500,.05,.5,e2)}},
  tbfire:{n:3,dur:1.4,ch:2,peak:.95,gain:.95,rev:.2,poly:3,pj:.03,fn:B=>{const o=B.comp(-10,4,.002,.2,B.g(.95));
    {const e=B.env(0,.004,.7,.5,B.f('bandpass',1800,1.2,o));B.osc('sawtooth',rr(2600,2900),rr(160,190),0,.5,e)}{const e=B.env(0,.002,.9,.35,o);B.osc('sine',rr(1200,1300),rr(90,110),0,.36,e)}
    {const e=B.env(0,.001,1,.18,B.sh(2.5,o));B.osc('sine',rr(70,80),32,0,.2,e)}B.grain(0,5200,.9,.12,.45,o);{const e=B.env(.02,.05,.35,.6,B.f('highpass',3000,.7,o));B.nz('white',.02,.65,e)}}},
  tbchg:{n:1,dur:.8,peak:.8,gain:.45,rev:.1,fn:B=>{const e=B.env(0,.25,.35,.3);B.osc('sine',300,1900,0,.55,e);const e2=B.env(0,.25,.15,.3);B.osc('triangle',600,3800,0,.55,e2)}},
  tbsw:{n:1,dur:.3,peak:.8,gain:.5,rev:.06,fn:B=>{B.grain(0,4200,2,.01,.6);B.ring(0,2600,[1,1.7],[.04,.02],[.15,.06])}}});
SFX_ORDER.push('bx11','bxfire','bxchg','plfire','plhit','plchg','tbfire','tbchg','tbsw');

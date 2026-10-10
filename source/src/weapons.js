'use strict';
// ============ Weapons: stats (CS/CSO names and numbers), hitscan with spread/recoil/knockback, melee, grenades ============
// spread: [standing, moving, airborne] cone half-angle (rad). kb: knockback m/s per hit. hs: headshot multiplier.
const WPN={
  knife:{slot:3,kind:'melee',n:['씰 나이프','Seal Knife'],dmg:[20,70],rate:[.45,1.05],range:[1.9,1.5],kb:[2.5,10],speed:1.02,draw:.6,model:'knife',hold:'knife',sw:1,hitT:[.15,.32]},
  axe:{slot:3,kind:'melee',n:['토마호크','Tomahawk'],cost:800,dmg:[48,145],rate:[.78,1.4],range:[2.2,2.0],kb:[6,21],speed:.96,draw:.85,model:'axe',hold:'axe',sw:.75,hitT:[.27,.52],anD:[.62,.95]},
  // long-handled sledge: slow, long reach, sends zombies flying; the heavy smash is an overhead blow that catches up to three in front
  hammer:{slot:3,kind:'melee',n:['해머','Hammer'],cost:2000,dmg:[180,112],rate:[1.25,.95],range:[2.8,2.25],kb:[9,62],up:[0,5.5],stag:[.45,1.1],speed:.84,draw:1.15,model:'hammer',hold:'hammer',sw:.52,hitT:[.7,.03],anD:[1.15,.62],blunt:1,cleave:3,stance:1,stanceSpd:.5},
  // pistols
  p9:{slot:2,kind:'pistol',n:['USP','USP'],cost:0,mag:12,res:100,dmg:34,rpm:400,semi:1,spread:[.008,.03,.08],rec:[.016,.006],kb:1.9,stag:.2,hs:3,reload:2,draw:.5,speed:1,snd:'p9',model:'p9',hold:'pistol',shell:1},
  f7:{slot:2,kind:'pistol',n:['파이브세븐','Five-seveN'],cost:750,mag:20,res:140,dmg:20,rpm:420,semi:1,spread:[.014,.035,.09],rec:[.011,.01],kb:1.4,stag:.18,hs:3,reload:2,draw:.5,speed:1,snd:'f7',model:'f7',hold:'pistol',shell:1},
  tw9:{slot:2,kind:'pistol',n:['듀얼 베레타','Dual Berettas'],cost:800,mag:30,res:150,dmg:36,rpm:620,semi:1,dual:1,spread:[.012,.035,.09],rec:[.013,.008],kb:1.8,stag:.2,hs:3,reload:2.9,draw:.7,speed:1,snd:'tw9',model:'tw9',hold:'dual',shell:1},
  d50:{slot:2,kind:'pistol',n:['데저트 이글','Desert Eagle'],cost:650,mag:7,res:49,dmg:54,rpm:240,semi:1,spread:[.012,.04,.09],rec:[.045,.012],kb:5.5,stag:.35,hs:3,reload:2.2,draw:.6,speed:.98,snd:'d50',model:'d50',hold:'pistol',shell:1},
  r6:{slot:2,kind:'pistol',n:['아나콘다','Anaconda'],cost:800,mag:6,res:36,dmg:78,rpm:160,semi:1,spread:[.01,.04,.09],rec:[.06,.015],kb:7,stag:.4,hs:3,reload:2.9,draw:.65,speed:.98,snd:'r6',model:'r6',hold:'pistol'},
  // shotguns
  sg8:{slot:1,kind:'shotgun',n:['M3','M3 Super 90'],cost:1700,mag:8,res:48,pellets:9,dmg:20,rpm:72,semi:1,spread:[.055,.07,.1],rec:[.07,.02],kb:3.3,stag:.45,hs:2,shellRel:.48,relStart:.4,draw:.8,speed:.92,snd:'sg8',model:'sg8',hold:'rifle',pump:1},
  db2:{slot:1,kind:'shotgun',n:['더블 배럴','Double Barrel'],cost:1300,mag:2,res:40,pellets:12,dmg:22,rpm:300,semi:1,spread:[.07,.085,.12],rec:[.11,.03],kb:3.6,stag:.55,hs:2,reload:2.4,brk:1,draw:.8,speed:.95,snd:'db2',model:'db2',hold:'rifle'},
  m14:{slot:1,kind:'shotgun',n:['XM1014','XM1014'],cost:3000,mag:7,res:42,pellets:6,dmg:20,rpm:260,semi:1,spread:[.06,.075,.11],rec:[.055,.02],kb:2.9,stag:.4,hs:2,shellRel:.42,relStart:.35,draw:.85,speed:.9,snd:'m14',model:'m14',hold:'rifle',shell:1},
  as12:{slot:1,kind:'shotgun',n:['USAS-12','USAS-12'],cost:3500,mag:20,res:60,pellets:6,dmg:19,rpm:220,semi:1,spread:[.065,.08,.11],rec:[.05,.02],kb:2.7,stag:.4,hs:2,shellRel:.4,relStart:.35,draw:.85,speed:.9,snd:'as12',model:'as12',hold:'rifle'},
  // smgs
  k5:{slot:1,kind:'smg',n:['MP5','MP5 Navy'],cost:1500,mag:30,res:120,dmg:26,rpm:800,spread:[.012,.03,.09],rec:[.009,.007],kb:1.7,stag:.2,hs:3,reload:2.3,draw:.6,speed:.97,snd:'k5',model:'k5',hold:'rifle',shell:1},
  k9:{slot:1,kind:'smg',n:['MAC-10','MAC-10'],cost:1400,mag:30,res:120,dmg:29,rpm:860,spread:[.013,.03,.09],rec:[.008,.008],kb:1.5,stag:.18,hs:3,reload:2.2,draw:.6,speed:.98,snd:'k9',model:'k9',hold:'rifle',shell:1},
  um45:{slot:1,kind:'smg',n:['UMP45','UMP45'],cost:1700,mag:25,res:150,dmg:30,rpm:600,spread:[.012,.03,.09],rec:[.011,.008],kb:2.2,stag:.24,hs:3,reload:2.4,draw:.6,speed:.96,snd:'um45',model:'um45',hold:'rifle',shell:1},
  pd50:{slot:1,kind:'smg',n:['P90','P90'],cost:2350,mag:50,res:200,dmg:21,rpm:860,spread:[.012,.03,.09],rec:[.008,.006],kb:1.6,stag:.2,hs:3,reload:3.1,draw:.65,speed:.96,snd:'pd50',model:'pd50',hold:'rifle',shell:1},
  // rifles
  g35:{slot:1,kind:'rifle',n:['갈릴','Galil'],cost:2000,mag:35,res:175,dmg:30,rpm:670,spread:[.006,.045,.12],rec:[.016,.01],kb:2.2,stag:.24,hs:3,reload:2.6,draw:.75,speed:.91,snd:'g35',model:'g35',hold:'rifle',shell:1},
  kv47:{slot:1,kind:'rifle',n:['AK-47','AK-47'],cost:2500,mag:30,res:180,dmg:36,rpm:600,spread:[.006,.045,.12],rec:[.019,.011],kb:2.6,stag:.25,hs:3,reload:2.5,draw:.75,speed:.9,snd:'kv47',model:'kv47',hold:'rifle',shell:1},
  br3:{slot:1,kind:'rifle',n:['파마스','FAMAS'],cost:2250,mag:25,res:150,dmg:30,rpm:900,burst:3,burstCd:.3,spread:[.004,.04,.11],rec:[.012,.006],kb:2.4,stag:.25,hs:3,reload:2.5,draw:.75,speed:.93,snd:'br3',model:'br3',hold:'rifle',shell:1},
  ar7:{slot:1,kind:'rifle',n:['M4A1','M4A1'],cost:3100,mag:30,res:180,dmg:32,rpm:670,spread:[.005,.04,.11],rec:[.013,.008],kb:2.2,stag:.25,hs:3,reload:2.6,draw:.75,speed:.92,snd:'ar7',model:'ar7',hold:'rifle',shell:1},
  ar5c:{slot:1,kind:'rifle',n:['SG552','SG552'],cost:3500,mag:30,res:180,dmg:33,rpm:680,spread:[.005,.04,.11],spreadZ:.0022,zoom:[48],rec:[.012,.007],kb:2.3,stag:.25,hs:3,reload:2.6,draw:.8,speed:.9,snd:'ar5c',model:'ar5c',hold:'rifle',shell:1},
  hr17:{slot:1,kind:'rifle',n:['SCAR-H','SCAR-H'],cost:3800,mag:20,res:140,dmg:48,rpm:520,spread:[.006,.05,.13],spreadZ:.0022,zoom:[50],rec:[.022,.012],kb:3.4,stag:.32,hs:3,reload:2.7,draw:.85,speed:.88,snd:'hr17',model:'hr17',hold:'rifle',shell:1},
  // snipers
  sr8:{slot:1,kind:'sniper',n:['스카웃','Scout'],cost:2750,mag:10,res:50,dmg:75,rpm:72,semi:1,bolt:1,spread:[.03,.07,.15],spreadZ:.0015,zoom:[32,14],rec:[.05,.01],kb:12,stag:.45,hs:3,reload:2.4,draw:.8,speed:.98,snd:'sr8',model:'sr8',hold:'rifle'},
  r700:{slot:1,kind:'sniper',n:['AWP','AWP'],cost:4750,mag:10,res:40,dmg:115,rpm:48,semi:1,bolt:1,spread:[.045,.09,.2],spreadZ:.0012,zoom:[28,10],rec:[.08,.01],kb:22,stag:.6,hs:3,reload:3,draw:.9,speed:.86,snd:'r700',model:'r700',hold:'rifle'},
  dm14:{slot:1,kind:'sniper',n:['G3SG1','G3SG1'],cost:5000,mag:20,res:80,dmg:80,rpm:240,semi:1,spread:[.012,.06,.15],spreadZ:.002,zoom:[30],rec:[.035,.01],kb:7,stag:.35,hs:3,reload:3,draw:.85,speed:.88,snd:'dm14',model:'dm14',hold:'rifle',shell:1},
  // machine guns
  hmg:{slot:1,kind:'mg',n:['M249','M249'],cost:5750,mag:100,res:300,dmg:32,rpm:750,spread:[.013,.055,.15],rec:[.011,.013],kb:2.9,stag:.3,hs:3,reload:4.6,draw:1,speed:.82,snd:'hmg',model:'hmg',hold:'rifle',shell:1},
  mg6:{slot:1,kind:'mg',n:['MG3','MG3'],cost:5000,mag:100,res:300,dmg:38,rpm:600,spread:[.014,.06,.16],rec:[.013,.014],kb:3.3,stag:.32,hs:3,reload:4.8,draw:1,speed:.8,snd:'mg6',model:'mg6',hold:'rifle',shell:1},
  gx6:{slot:1,kind:'mg',n:['M134 미니건','M134 Minigun'],cost:7500,mag:200,res:400,dmg:26,rpm:1500,spin:.55,spread:[.02,.045,.12],rec:[.005,.009],kb:2.1,stag:.3,hs:3,reload:5.2,draw:1.2,speed:.72,snd:'gx6',model:'gx6',hold:'rifle',shell:1},
  // special
  // knockback gun: a cone of compressed air that barely hurts but shoves zombies back (and off ledges), 10 blasts a second
  airb:{slot:1,kind:'special',n:['에어 버스터','Air Burster'],cost:3300,mag:100,res:200,dmg:8,rpm:600,quiet:1,air:{r:8,a:.42,kb:7.5,up:2.2,cap:12},spread:[0,0,0],rec:[.004,.005],kb:3.4,stag:.3,hs:1,reload:2.6,draw:.8,speed:.92,snd:'airb',model:'airb',hold:'rifle'},
  gl40:{slot:1,kind:'special',n:['M79','M79'],cost:4500,mag:1,res:18,dmg:380,rpm:70,semi:1,proj:'gl',spread:[.004,.02,.06],rec:[.09,.02],kb:16,stag:.8,hs:1,reload:1.9,brk:1,draw:.9,speed:.9,snd:'gl40',model:'gl40',hold:'rifle'},
  // throwables and zombie kit
  he:{slot:4,kind:'nade',n:['HE 수류탄','HE Grenade'],cost:300,model:'he',hold:'nade',draw:.5,speed:1},
  frost:{slot:4,kind:'nade',n:['냉동 수류탄','Frost Grenade'],cost:250,model:'frost',hold:'nade',draw:.5,speed:1},
  flare:{slot:4,kind:'nade',n:['조명탄','Flare'],cost:150,model:'flare',hold:'nade',draw:.5,speed:1},
  claw:{slot:3,kind:'claw',n:['손톱','Claws'],speed:1,draw:.4},
  zbomb:{slot:4,kind:'nade',n:['좀비 수류탄','Zombie Grenade'],model:'zbomb',hold:'nade',draw:.4,speed:1},
};
const BUY_MENU=[
  {k:'pistol',n:['권총','Pistols'],items:['p9','f7','tw9','d50','r6']},
  {k:'shotgun',n:['산탄총','Shotguns'],items:['sg8','db2','m14','as12']},
  {k:'smg',n:['기관단총','SMGs'],items:['k5','k9','um45','pd50']},
  {k:'rifle',n:['소총','Rifles'],items:['g35','kv47','br3','ar7','ar5c','hr17']},
  {k:'sniper',n:['저격총','Snipers'],items:['sr8','r700','dm14']},
  {k:'mg',n:['기관총','Machine Guns'],items:['mg6','hmg','gx6']},
  {k:'special',n:['특수 · 근접','Special · Melee'],items:['airb','gl40','axe','hammer']},
  {k:'equip',n:['장비','Equipment'],items:['armor','he','frost','flare','ammo']},
];
const EQUIP={armor:{n:['방탄복 + 헬멧','Kevlar + Helmet'],cost:1000},ammo:{n:['탄약 보충','Refill Ammo'],cost:200}};
const HOLDS={rifle:{off:[-.13,-.1,-.16]},pistol:{off:[-.21,-.05,-.36]},dual:{off:[-.06,-.05,-.36]},knife:{off:[-.06,-.24,-.22]},axe:{off:[-.05,-.26,-.2],rx:1.05,rz:Math.PI},hammer:{off:[-.02,-.3,-.16],rx:1.15,rz:Math.PI,ham:1},nade:{off:[-.04,-.16,-.2]}};
function holdFor(id){const W=WPN[id];if(!W||!W.model)return null;const Gd=GUNS[W.model];const H=HOLDS[W.hold]||HOLDS.rifle;
  return {kind:W.kind==='melee'?'melee':W.kind==='nade'?'nade':W.hold,grip:Gd.grip,sup:W.hold==='rifle'||W.hold==='pistol'||H.ham?Gd.sup:null,off:H.off,rx:H.rx||0,rz:H.rz||0,ham:!!H.ham,kA:H.kA,kH:H.kH,twA:H.twA,mag:Gd.mag,dual:!!W.dual}}
// ---------- hit tests ----------
const _hd=new THREE.Vector3();
function raySphere(ox,oy,oz,dx,dy,dz,cx,cy,cz,r,tmax){const lx=cx-ox,ly=cy-oy,lz=cz-oz;const tc=lx*dx+ly*dy+lz*dz;if(tc<0)return -1;const d2=lx*lx+ly*ly+lz*lz-tc*tc;if(d2>r*r)return -1;const t=tc-Math.sqrt(r*r-d2);return t>=0&&t<tmax?t:-1}
function rayAABB(ox,oy,oz,dx,dy,dz,x0,y0,z0,x1,y1,z1,tmax){let t0=0,t1=tmax;
  for(const [o,d,a,b] of [[ox,dx,x0,x1],[oy,dy,y0,y1],[oz,dz,z0,z1]]){if(Math.abs(d)<1e-9){if(o<a||o>b)return -1;continue}let ta=(a-o)/d,tb=(b-o)/d;if(ta>tb){const q=ta;ta=tb;tb=q}if(ta>t0)t0=ta;if(tb<t1)t1=tb;if(t0>t1)return -1}return t0}
// a zombie's arms: three spheres along each upper arm and forearm (kept fresh by updateVisual; -1 = missed)
// (the arm points are set by updateVisual at the end of the last frame)
function rayArms(t,ox,oy,oz,dx,dy,dz,tmax,grow){if(!t.arms||!(t.armT>G.t-.25))return -1;let best=-1,bt=tmax;
  for(let s=0;s<2;s++){const r=t.armR[s]*(grow||1),A=t.arms;for(let g=0;g<2;g++){const p=A[s*3+g],q=A[s*3+g+1];
    for(const f of [.15,.5,.85]){const th=raySphere(ox,oy,oz,dx,dy,dz,p.x+(q.x-p.x)*f,p.y+(q.y-p.y)*f,p.z+(q.z-p.z)*f,r,bt);if(th>=0){bt=th;best=th}}}}
  return best}
// nearest enemy hit along a ray before tmax: {a, t, part}
function rayActors(src,ox,oy,oz,dx,dy,dz,tmax,teamMask){let best=null,bt=tmax,part=null;
  for(const t of G.actors){if(!t.alive||t===src||t.team===src.team)continue;const c=t.c;
    // quick reject by distance to the ray
    const lx=c.x-ox,lz=c.z-oz;const tc=lx*dx+lz*dz;if(tc<-1||tc>bt+1)continue;
    const h=t.headR||.14;const th=raySphere(ox,oy,oz,dx,dy,dz,t.head.x,t.head.y,t.head.z,h,bt);if(th>=0){bt=th;best=t;part='head'}
    const hw=(t.hitW||c.hw)+.02,top=t.head.y-h*.85;const tb=rayAABB(ox,oy,oz,dx,dy,dz,c.x-hw,c.y,c.z-hw,c.x+hw,top,c.z+hw,bt);
    if(tb>=0&&tb<bt){bt=tb;best=t;const hy=oy+dy*tb;part=hy<c.y+(top-c.y)*.45?'legs':'body'}
    if(t.team===TZ){const ta=rayArms(t,ox,oy,oz,dx,dy,dz,bt);if(ta>=0&&ta<bt){bt=ta;best=t;part='body'}}}
  return best?{a:best,t:bt,part}:null}
// ---------- firing ----------
const _dv=new THREE.Vector3(),_rv=new THREE.Vector3(),_uv=new THREE.Vector3();
function aimDir(yaw,pitch,out){const cp=Math.cos(pitch);out.set(-Math.sin(yaw)*cp,Math.sin(pitch),-Math.cos(yaw)*cp);return out}
// air burst: white rings and mist out of the bell; everything in the cone with a clear line is shoved away from the gun
// (weak damage, strong push, a hop every fourth blast so a crowd gets lifted and pushed back over and over)
function airBlast(a,W,eye,dir){const C=W.air;const mz=muzzleWorld(a);const ox=mz.x,oy=mz.y,oz=mz.z,_d=new THREE.Vector3();
  FX.spawn({x:ox+dir.x*.4,y:oy+dir.y*.4,z:oz+dir.z*.4,vx:dir.x*9,vy:dir.y*9,vz:dir.z*9,life:.28,s0:.25,s1:1.6,r:.85,g:.92,b:1,a:.35,f:14,drag:3});
  for(let i=0;i<(a.isPlayer?7:4);i++){spreadDir(dir,C.a*.7,_d);const sp=C.r*rr(1.2,2.2);FX.spawn({x:ox,y:oy,z:oz,vx:_d.x*sp,vy:_d.y*sp,vz:_d.z*sp,life:rr(.25,.45),s0:rr(.1,.2),s1:rr(.6,1.2),r:.82,g:.88,b:.95,a:.22,f:5,drag:3.2})}
  const cosA=Math.cos(C.a);let n=0;const hop=a.shots%4===0;
  for(const t of G.actors){if(!t.alive||t.team===a.team)continue;const tx=t.c.x,ty=t.c.y+t.c.h*.55,tz=t.c.z;const dx=tx-eye.x,dy=ty-eye.y,dz=tz-eye.z,d=Math.hypot(dx,dy,dz);if(d>C.r+t.c.hw)continue;
    const cs=(dx*dir.x+dy*dir.y+dz*dir.z)/(d||1);if(cs<cosA&&d>1.2)continue;if(!losClear(eye.x,eye.y,eye.z,tx,ty,tz))continue;n++;
    const f=clamp(1-d/(C.r*1.25),.3,1),hd=Math.hypot(dx,dz)||1;
    damageActor(t,W.dmg*f,a,{w:a.cur,dir:[dx/hd,.15,dz/hd],kb:C.kb*(.6+.4*f),stag:W.stag,x:tx,y:ty,z:tz,up:hop&&t.c.onGround?C.up*f:0});
    FX.spawn({x:tx-dx/d*.3,y:ty,z:tz-dz/d*.3,vx:dx/d*3,vy:.5,vz:dz/d*3,life:.3,s0:.3,s1:.9,r:.85,g:.9,b:1,a:.3,f:6,drag:2})}
  if(n&&a.isPlayer)HUD.hitmark(false)}
function spreadDir(base,ang,out){if(ang<=0)return out.copy(base);
  _rv.set(0,1,0);if(Math.abs(base.y)>.95)_rv.set(1,0,0);_uv.crossVectors(base,_rv).normalize();_rv.crossVectors(_uv,base).normalize();
  const r=ang*Math.sqrt(Math.random()),th=Math.random()*TAU;out.copy(base).addScaledVector(_uv,Math.cos(th)*r).addScaledVector(_rv,Math.sin(th)*r).normalize();return out}
function curSpread(a,W){const c=a.c;const moving=Math.hypot(c.vx,c.vz)>1.2;let s=!c.onGround?W.spread[2]:moving?W.spread[1]:W.spread[0];
  if(W.zoom&&a.zoom>0){if(c.onGround&&!moving)s=W.spreadZ;else if(W.kind==='sniper')s=W.spread[1]}if(a.duck&&c.onGround)s*=.8;return s+a.recoilSpread}
function fireGun(a,W){if(W.flame){salFire(a,W);return}W=spShot(a,W);const am=a.ammo[a.cur];
  const eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const base=_dv.clone();
  if(W.dual)a.dualSide=-(a.dualSide||1);
  NET.on&&netFxPush(['f',a.id,WI[a.cur],r3(a.yaw+a.punchY),r3(a.pitch+a.punchP),a.dualSide||0]);
  const n=W.pellets||1,sp=curSpread(a,W);const dir=new THREE.Vector3();
  let hitAny=false,hsAny=false,dmgTotal=0;
  if(W.cone){coneBlast(a,W,eye.clone(),base)}
  else if(W.air){airBlast(a,W,eye.clone(),base)}
  else if(W.proj){spreadDir(base,sp,dir);launchProj(a,W,eye,dir)}
  else if(W.fan){for(let i=0;i<W.fan;i++){const off=(i-(W.fan-1)/2)/((W.fan-1)/2)*W.fanA,c=Math.cos(off),s=Math.sin(off);dir.set(base.x*c+base.z*s,base.y,-base.x*s+base.z*c).normalize();spreadDir(dir,sp,dir);
    const r=shotTrace(a,eye.x,eye.y,eye.z,dir.x,dir.y,dir.z,W,i);if(r&&r.hit){hitAny=true;if(r.hs)hsAny=true;dmgTotal+=r.dmg}}}
  else for(let i=0;i<n;i++){spreadDir(base,n>1?W.spread[0]+(sp-W.spread[0])*.5:sp,dir);if(n>1&&i>0)spreadDir(dir,W.spread[0]*.9,dir);
    const r=shotTrace(a,eye.x,eye.y,eye.z,dir.x,dir.y,dir.z,W,i);if(r&&r.hit){hitAny=true;if(r.hs)hsAny=true;dmgTotal+=r.dmg}}
  if(!W.noMag)am.mag--;a.shots++;
  // recoil: view punch + accumulating spread
  const rv=W.rec[0]*(a.duck?.75:1),rh=W.rec[1];a.punchP+=rv*(.7+Math.min(a.shots,8)*.06);a.punchY+=(Math.random()*2-1)*rh;a.recoilSpread=Math.min(W.spread[1]*1.4,a.recoilSpread+W.rec[0]*.35);a.kick=1;
  // effects + sound
  const mz=muzzleWorld(a);if(!W.quiet&&!W.cone&&W.proj!=='disc')FX.muzzle(mz.x,mz.y,mz.z,base.x,base.y,base.z,W.kind==='shotgun'||W.kind==='sniper'||W.kind==='mg'||W.kind==='special');
  a.heat=Math.min(1.4,(a.heat||0)+(W.kind==='shotgun'||W.kind==='sniper'?.35:W.kind==='mg'?.07:.09));// barrel heat: smokes when you stop
  if(W.shell){const sd=a.isPlayer?1:.6;FX.shell(mz.x-base.x*.4,mz.y-.05,mz.z-base.z*.4,Math.cos(a.yaw)*sd,-Math.sin(a.yaw)*sd,W.kind==='mg')}
  const loud=W.spin?(a.shots%2===0):true;
  if(W.sp){FX.muzzle(mz.x,mz.y,mz.z,base.x,base.y,base.z,true);if(a.isPlayer)AU.play(W.spSnd||W.snd,{vol:.9,rate:.8});else AU.at(W.spSnd||W.snd,eye.x,eye.y,eye.z,{vol:.9,range:70,rate:.8})}
  if(a.isPlayer){if(loud)AU.play(W.snd,{vol:W.spin?.75:.95});if(W.shell&&Math.random()<(W.spin?.25:.6))AU.play(W.kind==='shotgun'?'shellcase':'casing',{vol:.5,delay:rr(.25,.45)});VM.fire(W,a.dualSide);if(hitAny)HUD.hitmark(hsAny)}
  else if(loud)AU.at(W.snd,eye.x,eye.y,eye.z,{vol:.9,range:70});
  if(W.bolt){a.boltT=.95;a.zoomWas=a.zoom;a.zoom=0}
  if(W.pump){a.pumpT=.55}
  a.lastFire=G.t;alertBots(a,eye.x,eye.z)}
// one pellet/bullet: world first, then actors, apply damage/knockback/effects
const SHOT_FILTER={skip:b=>b.o.pass};
function shotTrace(a,ox,oy,oz,dx,dy,dz,W,pi){const range=110;
  const hw=rayCast(ox,oy,oz,dx,dy,dz,range,SHOT_FILTER);const tW=hw?hw.t:range;const wn=hw?[hw.nx,hw.ny,hw.nz]:null,wbox=hw?hw.box:null;
  const ha=rayActors(a,ox,oy,oz,dx,dy,dz,tW);
  const tEnd=ha?ha.t:tW;const ex=ox+dx*tEnd,ey=oy+dy*tEnd,ez=oz+dz*tEnd;
  if((a.isPlayer?Math.random()<.35:Math.random()<.55)&&(pi===0))FX.tracer(ox+dx*.8-(a.isPlayer?.05:0),oy+dy*.8-(a.isPlayer?.08:0),oz+dz*.8,ex,ey,ez);
  // near-miss whiz for the local player
  if(!a.isPlayer&&G.player&&G.player.alive&&pi===0){const P=actorEye(G.player);const lx=P.x-ox,ly=P.y-oy,lz=P.z-oz;const tc=lx*dx+ly*dy+lz*dz;if(tc>3&&tc<tEnd){const d2=lx*lx+ly*ly+lz*lz-tc*tc;if(d2<1.2&&!AU.throttle('whiz',120))AU.play('whiz',{vol:.6,pan:rr(-.6,.6)})}}
  if(ha){const t=ha.a;let dmg=W.dmg;if(W.pellets){const fall=clamp(1-(ha.t-10)/25,.35,1);dmg*=fall}
    const ds=hsForce(a,ha),hs=ha.part==='head';dmg*=hs?(W.hs||3):ha.part==='legs'?.75:1;
    const pb=1+Math.max(0,(4-ha.t)/4)*.8;// point-blank shots shove harder
    damageActor(t,dmg,a,{w:a.cur,hs,ds,dir:[dx,dy,dz],kb:W.kb*pb,stag:W.stag,x:ex,y:ey,z:ez,up:W.spUp&&t.c.onGround?W.spUp:0});
    FX.blood(ex,ey,ez,dx,dy,dz,(W.pellets?.6:1.1)*(hs?1.6:1),false);
    if(hs&&!t.isPlayer&&a.isPlayer)AU.play('headshot',{vol:.7});else if(!a.isPlayer&&t.isPlayer){}else if(Math.random()<.5)AU.at('imp_flesh',ex,ey,ez,{vol:.6});
    return {hit:true,hs,dmg}}
  if(hw){if(wbox.coffin&&a.team===TH)COFF.hurt(wbox.coffin,W.pellets?W.dmg*.8:W.dmg,a);const m=wbox.o.f&&wbox.o.f[nf(wn)]||wbox.mat;FX.impact(ex,ey,ez,wn[0],wn[1],wn[2],m);
    if(pi===0||Math.random()<.3){const mk=matKind(m),snd=mk==='metal'?'imp_metal':mk==='wood'?'imp_wood':mk==='soft'?'imp_dirt':'imp_conc';AU.at(snd,ex,ey,ez,{vol:.55,range:30})}}
  return null}
function nf(n){return n[0]>.5?'px':n[0]<-.5?'nx':n[1]>.5?'py':n[1]<-.5?'ny':n[2]>.5?'pz':'nz'}
// melee (knife or claws): short sweep in a cone in front of the attacker
function meleeHit(a,range,cone){const eye=actorEye(a);aimDir(a.yaw,a.pitch,_dv);let best=null,bd=range+1;
  for(const t of G.actors){if(!t.alive||t===a||t.team===a.team)continue;const c=t.c;const tx=c.x,ty=clamp(eye.y,c.y+.2,t.head.y),tz=c.z;
    const dx=tx-eye.x,dy=ty-eye.y,dz=tz-eye.z;const d=Math.hypot(dx,dy,dz)-c.hw;if(d>range)continue;const dot=(dx*_dv.x+dy*_dv.y+dz*_dv.z)/Math.max(.01,Math.hypot(dx,dy,dz));
    if(dot<cone&&d>.35)continue;if(!losClear(eye.x,eye.y,eye.z,tx,ty,tz))continue;if(d<bd){bd=d;best=t}}
  if(best)return {t:best,d:bd};
  const hw=rayCast(eye.x,eye.y,eye.z,_dv.x,_dv.y,_dv.z,range);if(hw)return {wall:hw,x:eye.x+_dv.x*hw.t,y:eye.y+_dv.y*hw.t,z:eye.z+_dv.z*hw.t,n:[hw.nx,hw.ny,hw.nz]};return null}
function meleeW(a,w){const W=WPN[w||a.cur];return W&&W.kind==='melee'?W:WPN.knife}
function meleeSwing(a,heavy){const W=meleeW(a);NET.on&&netFxPush(['m',a.id,heavy?1:0,a.an.atkSide||1,WI[a.cur]]);
  // a weapon with its own whoosh (swS) plays it as the stroke comes through, not at the start of the wind-up (the view model's clip times it for the player)
  if(W.swS){if(a.isPlayer)VM.melee(heavy);else nyLater(Math.max(0,W.hitT[heavy?1:0]-.12),()=>AU.at(W.swS,a.c.x,a.c.y+1.4,a.c.z,{vol:.6,rate:heavy?.9:1}));return}
  if(a.isPlayer){AU.play('kswing',{vol:.7,rate:(heavy?.8:1)*(W.sw||1)});VM.melee(heavy)}else AU.at('kswing',a.c.x,a.c.y+1.4,a.c.z,{vol:.5,rate:W.sw||1})}
// every enemy in reach in front, nearest first (the hammer's overhead smash catches several)
function meleeHits(a,range,cone,n){const eye=actorEye(a);aimDir(a.yaw,a.pitch,_dv);const out=[];
  for(const t of G.actors){if(!t.alive||t===a||t.team===a.team)continue;const c=t.c;const tx=c.x,ty=clamp(eye.y,c.y+.2,t.head.y),tz=c.z;
    const dx=tx-eye.x,dy=ty-eye.y,dz=tz-eye.z;const d=Math.hypot(dx,dy,dz)-c.hw;if(d>range)continue;const dot=(dx*_dv.x+dy*_dv.y+dz*_dv.z)/Math.max(.01,Math.hypot(dx,dy,dz));
    if(dot<cone&&d>.35)continue;if(!losClear(eye.x,eye.y,eye.z,tx,ty,tz))continue;out.push({t,d})}
  out.sort((p,q)=>p.d-q.d);return out.slice(0,n).map(o=>o.t)}
// cleave: how many one blow can hit (a number = the heavy attack only; [light, heavy] = per attack), arc: the cone of that blow (cosine, per attack)
function meleeStrike(a,heavy,w){w=w&&WPN[w]&&WPN[w].kind==='melee'?w:a.cur;const W=meleeW(a,w),hi=heavy?1:0;const cl=Array.isArray(W.cleave)?W.cleave[hi]:heavy?W.cleave:0;
  const many=cl?meleeHits(a,W.range[hi],W.arc?W.arc[hi]:.6,cl):null;
  const r=many&&many.length?{t:many[0]}:meleeHit(a,W.range[hi],heavy?.8:.65);const list=many&&many.length?many:r&&r.t?[r.t]:[];
  if(list.length){aimDir(a.yaw,0,_dv);const sl=W.kbL?W.kbL[hi]:0;if(sl){_dv.x-=Math.cos(a.yaw)*sl;_dv.z+=Math.sin(a.yaw)*sl;_dv.normalize()}let hsAny=false;
    for(const t of list){const hs=Math.abs(a.pitch)<.6&&Math.random()<(heavy?.25:.12);hsAny=hsAny||hs;
      damageActor(t,W.dmg[hi]*(hs?2:1),a,{w,hs,dir:[_dv.x,0,_dv.z],kb:W.kb[hi],stag:W.stag?W.stag[hi]:.5,up:W.up?W.up[hi]:0,x:t.c.x,y:t.c.y+1.2,z:t.c.z,knife:1,heavy:!!heavy,blunt:!!W.blunt});
      FX.blood(t.c.x,t.c.y+1.2,t.c.z,_dv.x,0,_dv.z,1.6*(W.sw<1?1.6:1),false)}
    const snd=W.hitS||(W.blunt?'hamhit':'khit'),t0=list[0];
    if(a.isPlayer){AU.play(snd,{vol:.85,rate:W.blunt||W.hitS?1:W.sw||1});HUD.hitmark(hsAny);VM.meleeHit&&VM.meleeHit(heavy,1);if(W.sw<1)FX.shake=Math.max(FX.shake,W.shk?W.shk[hi]:W.blunt?(heavy?.6:.42):.25)}else AU.at(snd,t0.c.x,t0.c.y+1,t0.c.z,{vol:.75})}
  else if(r&&r.wall){if(r.wall.box&&r.wall.box.coffin&&a.team===TH)COFF.hurt(r.wall.box.coffin,W.dmg[hi]*1.5,a);FX.impact(r.x,r.y,r.z,r.n[0],r.n[1],r.n[2],r.wall.box.mat);if(a.isPlayer){AU.play('kwall',{vol:.6,rate:W.sw||1});VM.meleeHit&&VM.meleeHit(heavy,2)}else AU.at('kwall',r.x,r.y,r.z,{vol:.5})}
  if(heavy&&W.slam)meleeSlam(a,W,list)}// a slam also hits the ground in front (skull9.js)
function knifeAttack(a,heavy){meleeSwing(a,heavy);meleeStrike(a,heavy)}
// ---------- grenades ----------
const NADES=[];
function throwNade(a,kind,X){if(!WPN[kind])return;const eye=actorEye(a);const soft=kind==='zbomb'&&a.bSoft;aimDir(a.yaw,a.pitch+(soft?.05:.12),_dv);const sp=soft?5.5:kind==='zbomb'?15:14.5;
  const n={kind,owner:a,x:eye.x+_dv.x*.4,y:eye.y+_dv.y*.4-.1,z:eye.z+_dv.z*.4,vx:_dv.x*sp+a.c.vx*.6,vy:_dv.y*sp+(soft?1:2)+Math.max(0,a.c.vy)*.5,vz:_dv.z*sp+a.c.vz*.6,t:0,fuse:kind==='flare'?1.2:kind==='zbomb'?1.3:1.6,rest:false,mesh:null,spin:rr(-12,12),ghost:NET.ghost>0};
  if(X){n.x=X.x;n.y=X.y;n.z=X.z;n.vx=X.vx;n.vy=X.vy;n.vz=X.vz}
  const m=new THREE.Mesh(gunGeo(kind==='zbomb'?'zbombT':WPN[kind].model),matGun());m.position.set(n.x,n.y,n.z);R.scene.add(m);n.mesh=m;NADES.push(n);
  if(a.isPlayer){AU.play('throw',{vol:.7})}else AU.at('throw',eye.x,eye.y,eye.z,{vol:.5});
  NET.on&&netFxPush(['n',a.id,kind,r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)])}
function launchProj(a,W,eye,dir){if(NET.ghost)return;if(W.proj==='vortex'){vortexLaunch(a,W,eye,dir);return}if(W.proj!=='gl'){nyLaunch(a,W,eye,dir);return}const sp=38;
  const n={kind:'gl',owner:a,w:a.cur,x:eye.x+dir.x*.6,y:eye.y+dir.y*.6-.06,z:eye.z+dir.z*.6,vx:dir.x*sp,vy:dir.y*sp+.6,vz:dir.z*sp,t:0,fuse:6,rest:false,mesh:null,spin:0,impact:1};
  const m=new THREE.Mesh(gunGeo('glnade'),matGun());m.position.set(n.x,n.y,n.z);R.scene.add(m);n.mesh=m;NADES.push(n);
  NET.on&&netFxPush(['p',a.id,WI[a.cur],'gl',r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)])}
// contact check against zombies for impact rounds
function projHitsActor(n,x,y,z){for(const t of G.actors){if(!t.alive||t.team===n.owner.team)continue;const c=t.c;if(Math.abs(c.x-x)<c.hw+.15&&Math.abs(c.z-z)<c.hw+.15&&y>c.y-.1&&y<t.head.y+.2)return t;
    if(t.arms&&t.armT>G.t-.25)for(let s=0;s<2;s++)for(let k=0;k<3;k++){const p=t.arms[s*3+k],r=t.armR[s]+.12;if((p.x-x)**2+(p.y-y)**2+(p.z-z)**2<r*r)return t}}return null}
function updateNades(dt){for(let i=NADES.length-1;i>=0;i--){const n=NADES[i];if(!n)continue;if(n.ghost){NET.ghost++;try{updNade(n,i,dt)}finally{NET.ghost--}}else updNade(n,i,dt)}}
function updNade(n,i,dt){{n.t+=dt;if(n.upd){if(n.upd(n,dt))removeNade(i);return}
    if(n.impact){const steps=4;let boom=false;for(let s=0;s<steps&&!boom;s++){const h=dt/steps;n.vy-=GRAV*.35*h;const d=Math.hypot(n.vx,n.vy,n.vz)*h;if(d<1e-5)continue;
        const hit=rayCast(n.x,n.y,n.z,n.vx/d*h,n.vy/d*h,n.vz/d*h,d+.05,SHOT_FILTER);
        if(hit&&hit.t<=d+.05){n.x+=n.vx/d*h*Math.max(0,hit.t-.08);n.y+=n.vy/d*h*Math.max(0,hit.t-.08);n.z+=n.vz/d*h*Math.max(0,hit.t-.08);boom=true;break}
        n.x+=n.vx*h;n.y+=n.vy*h;n.z+=n.vz*h;if(n.t>.05&&projHitsActor(n,n.x,n.y,n.z)){boom=true}}
      if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.lookAt(n.x+n.vx,n.y+n.vy,n.z+n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
      if(Math.random()<.6)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.2,.2),vy:rr(-.1,.3),vz:rr(-.2,.2),life:rr(.4,.8),s0:.08,s1:.35,r:.6,g:.6,b:.6,a:.35,f:2,drag:2});
      if(boom||n.t>n.fuse||n.y<-5){detonate(n);removeNade(i)}return}
    if(!n.rest){const steps=3;for(let s=0;s<steps;s++){const h=dt/steps;n.vy-=GRAV*.8*h;const d=Math.hypot(n.vx,n.vy,n.vz)*h;if(d<1e-5)continue;
        const hit=rayCast(n.x,n.y,n.z,n.vx/d*h,n.vy/d*h,n.vz/d*h,d+.06);
        if(hit&&hit.t<d+.06){const nx=hit.nx,ny=hit.ny,nz=hit.nz;const vn=n.vx*nx+n.vy*ny+n.vz*nz;n.vx-=1.6*vn*nx;n.vy-=1.6*vn*ny;n.vz-=1.6*vn*nz;n.vx*=.6;n.vy*=.6;n.vz*=.6;
          if(Math.abs(vn)>2&&!AU.throttle('bn'+i,90))AU.at('bounce',n.x,n.y,n.z,{vol:clamp(Math.abs(vn)/10,.2,.8)});
          if(ny>.7&&Math.hypot(n.vx,n.vy,n.vz)<1.2){n.rest=true;n.vx=n.vy=n.vz=0;break}}
        else{n.x+=n.vx*h;n.y+=n.vy*h;n.z+=n.vz*h}}
      if(n.y<-5){n.rest=true}}
    if(n.mesh){n.mesh.position.set(n.x,n.y+.03,n.z);if(!n.rest){n.mesh.rotation.x+=n.spin*dt;n.mesh.rotation.z+=n.spin*.5*dt}const pr=n.mesh.material.uniforms.uProbe.value;sampleProbe(n.x,n.y+.5,n.z,pr)}
    if(n.kind==='flare'&&n.lit){n.light.x=n.x;n.light.y=n.y+.3;n.light.z=n.z;if(Math.random()<.5)FX.spawn({x:n.x,y:n.y+.1,z:n.z,vx:rr(-1,1),vy:rr(1,3),vz:rr(-1,1),life:rr(.2,.5),s0:.05,s1:.02,r:1,g:.4,b:.3,f:0,grav:6,add:1});
      if(Math.random()<.25)FX.spawn({x:n.x,y:n.y+.2,z:n.z,vx:rr(-.2,.2),vy:rr(.5,1.2),vz:rr(-.2,.2),life:rr(1.5,2.5),s0:.2,s1:.9,r:.55,g:.3,b:.3,a:.35,f:2,drag:1});
      if(n.t>n.fuse+25){n.light.dead=true;removeNade(i)}return}
    if(n.t>=n.fuse){detonate(n);if(n.kind==='flare'){n.lit=true;n.light=DL.add(n.x,n.y+.3,n.z,'#ff5038',15,1.8,0,{flick:.25});AU.at('flare',n.x,n.y,n.z,{vol:.8});return}removeNade(i)}}}
function removeNade(i){const n=NADES[i];if(n.mesh){R.scene.remove(n.mesh);n.mesh.material.dispose()}NADES.splice(i,1)}
function clearNades(){for(let i=NADES.length-1;i>=0;i--){if(NADES[i].light)NADES[i].light.dead=true;removeNade(i)}}
function detonate(n){const k=n.kind;
  if(k==='gl'){const W=WPN.gl40;FX.explode(n.x,n.y,n.z,'he');AU.at('explode',n.x,n.y,n.z,{vol:.85,range:80,occ:false,rate:1.15});const pd=G.player?dist3(G.player.c,n):99;if(pd<10){FX.shake=Math.max(FX.shake,.8-pd/12);AU.shock(.7-pd/14)}
    for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const dx=t.c.x-n.x,dy=t.c.y+1-n.y,dz=t.c.z-n.z;const d=Math.hypot(dx,dy,dz);if(d>4.8)continue;if(!losClear(n.x,n.y+.2,n.z,t.c.x,t.c.y+1,t.c.z))continue;
      const f=1-d/4.8;damageActor(t,W.dmg*(.35+.65*f),n.owner,{w:'gl40',dir:[dx/(d||1),.3,dz/(d||1)],kb:W.kb*f,stag:.8,x:t.c.x,y:t.c.y+1,z:t.c.z,up:5*f})}
    return}
  if(k==='he'){FX.explode(n.x,n.y,n.z,'he');AU.at('explode',n.x,n.y,n.z,{vol:1,range:90,occ:false});const pd=G.player?dist3(G.player.c,n):99;if(pd<14){FX.shake=Math.max(FX.shake,1-pd/14);AU.shock(1-pd/14)}
    for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const dx=t.c.x-n.x,dy=t.c.y+1-n.y,dz=t.c.z-n.z;const d=Math.hypot(dx,dy,dz);if(d>7)continue;if(!losClear(n.x,n.y+.3,n.z,t.c.x,t.c.y+1,t.c.z))continue;
      const f=1-d/7;damageActor(t,700*f+100,n.owner,{w:'he',dir:[dx/(d||1),.3,dz/(d||1)],kb:14*f,stag:.8,x:t.c.x,y:t.c.y+1,z:t.c.z,he:1,up:6*f})}}
  else if(k==='frost'){FX.explode(n.x,n.y,n.z,'frost');AU.at('frostx',n.x,n.y,n.z,{vol:1,range:60});
    if(!NET.ghost)for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const d=Math.hypot(t.c.x-n.x,t.c.y+1-n.y,t.c.z-n.z);if(d>6)continue;if(!losClear(n.x,n.y+.3,n.z,t.c.x,t.c.y+1,t.c.z))continue;
      t.frozen=Math.max(t.frozen,t.zc==='brute'&&t.skillT>0?1.2:3.2);t.c.vx=t.c.vz=0;t.mvx=t.mvz=t.kvx=t.kvz=0;if(t.isPlayer)HUD.flashFrost()}}
  else if(k==='zbomb'){FX.spore(n.x,n.y,n.z);AU.at('zbombx',n.x,n.y,n.z,{vol:1,range:60});
    if(!NET.ghost)for(const t of G.actors){if(!t.alive||t.team!==TH)continue;const dx=t.c.x-n.x,dz=t.c.z-n.z,dy=t.c.y+1-n.y;const d=Math.hypot(dx,dy,dz);if(d>6.5)continue;if(!losClear(n.x,n.y+.3,n.z,t.c.x,t.c.y+1,t.c.z))continue;
      const f=1-d/6.5,h=Math.hypot(dx,dz)||1;t.kvx+=dx/h*13*f;t.kvz+=dz/h*13*f;t.c.vy=Math.max(t.c.vy,5+5*f);t.c.onGround=false;t.c.jumped=true;t.dizzy=Math.max(t.dizzy,2*f);if(t.isPlayer){FX.shake=Math.max(FX.shake,.6*f)}}
    zbombLaunch(n)}}

// a zombie standing on its own side's bomb sets it off
function zbombStepped(n){for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const dy=n.y-t.c.y;if(dy<-.45||dy>.55)continue;if(Math.hypot(t.c.x-n.x,t.c.z-n.z)<.6)return true}return false}
// the blast throws nearby zombies high into the air (no damage): straight on top of it = the biggest jump, carried along where they face
const ZB_R=4.5;
function zbombLaunch(n){for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;if(!t.isPlayer&&(NET.ghost||t.net))continue;
    const dx=t.c.x-n.x,dz=t.c.z-n.z,dy=t.c.y+.4-n.y,d=Math.hypot(dx,dy,dz);if(d>ZB_R)continue;if(!losClear(n.x,n.y+.3,n.z,t.c.x,t.c.y+.6,t.c.z))continue;
    const f=Math.pow(1-d/ZB_R,.7),h=Math.hypot(dx,dz);aimDir(t.yaw,0,_dv);const out=h>.25?1:h/.25;
    t.kvx+=(h>.01?dx/h:0)*9*f*out+_dv.x*6*f+t.c.vx*.4*f;t.kvz+=(h>.01?dz/h:0)*9*f*out+_dv.z*6*f+t.c.vz*.4*f;
    t.c.vy=Math.max(t.c.vy,5.5+10.5*f);t.c.onGround=false;t.c.jumped=true;t.frozen=0;t.staggerT=0;t.bombJ=G.t;
    if(t.isPlayer){FX.shake=Math.max(FX.shake,.5*f);VM.jumped();AU.play('zleap',{vol:.7*f+.2})}else AU.at('zleap',t.c.x,t.c.y+1,t.c.z,{vol:.6,range:30})}}

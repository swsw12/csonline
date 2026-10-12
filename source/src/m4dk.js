'use strict';
// ============ v6.41: M4A1 다크나이트 (M4A1 Dark Knight) — the first transcendence (초월) weapon ============
// The name and the mechanics follow the CSO weapon; the model (a black-and-gold armoured M4: a crimson gem over the grip, armour lames down
// the handguard, a knight's crest along the top, a sword's crossguard for a muzzle brake), its motions and its sounds are this game's own.
// 50 rounds of .50 (50 / 300). A (left click): full-auto, head 150 / body 90 / arms and legs 50 (W.hs, W.limbK), a strong stagger.
// Right click: B — the lames swing open over a crimson core, the crossguard turns, the view closes in a little (half zoom): every round
// does double (300 / 180 / 100), goes through every zombie on its line (×DK.PK for each one before) and through up to DK.WALLS walls
// (×DK.WALLK each), leaves a crimson trail and comes at a heavy machine-gun beat (DK.BRPM) while held, with almost no kick.
// Owning it (the account; a bot: carrying it) makes the Deadshot (6) last DK.DS s longer.
// Only from the transcendence exchange (초월 조각 × 888: shop.js, schema.sql qz_trans_exchange) — never from a decoder.
// Network: the B state goes out as ['dk', id, 0 | 1]; a B shot is replayed on the other pages from the usual 'f' event (the state says
// which); a client asking the host for its Deadshot says whether it owns one (x), the host passes it on with the event.

// ---------- atlas: black lacquered armour with gold filigree, a self-lit crimson ----------
for(const m of ['dkPlate','dkGlow']){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintDkAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  // armour: brushed black with a deep sheen, a gold filigree border and scrolls, fine scratches
  // (faces sample the tile at random places, so the gold is thin scrollwork scattered over it, not a border: the trim is its own parts)
  patch('dkPlate',(xx,y,X,Y)=>{const t=fbm(X/18,Y/18,7301,2,0)+(hash2(Math.floor(xx/12),y,7302)-.5)*.08;let c=mix('#121114','#2c2930',clamp((t-.3)*1.5,0,1));
    const sc=Math.abs(Math.sin(xx*.16+Math.sin(y*.085)*3.1)*Math.cos(y*.1+Math.sin(xx*.065)*2.2));if(sc<.018&&fbm(X/40,Y/40,7304,2,0)>.55)c='#a88438';
    if(hash2(X,Y,7303)<.008)c='#4a464e';return c},250);
  // crimson: a hot core, darker veins
  patch('dkGlow',(xx,y,X,Y)=>{const t=fbm(X/9,Y/9,7311,2,0),b=Math.abs(Math.sin(y*.21+t*5));return b>.88?'#ffd8cc':t>.56?'#ff5444':t>.42?'#ff2a24':'#c0101a'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintDkAtlas()}}

// ---------- numbers ----------
// BRPM the B beat, PK the share left after each zombie it passes, WALLS / WALLK the walls it goes through and the share left after
// each, DS the Deadshot's extra seconds, FOV the view in B (a share of the normal one)
const DK={BRPM:400,PK:.85,WALLS:2,WALLK:.6,DS:1,FOV:.82};

// ---------- the model ----------
// gun frame as every rifle: origin at the grip, the barrel along -Z. v: 'vm' first person (moving and lit parts tagged) | 'a' / 'b' the
// world models (A shut; B the lames open, the core lit, the crossguard turned)
const DK_PIV={hgL:[-.024,.086,-.33],hgR:[.024,.086,-.33],mz:[0,.058,-.665],crest:[0,.1,-.06],core:[0,.058,-.33]};
const DK_B={hgL:{rz:-.85},hgR:{rz:.85},mz:{dz:-.024,rz:Math.PI/4},crest:{dy:.008}};
function dkParts(v){const vm=v==='vm',B=v==='b',P=[];const A=l=>{for(const p of l)P.push(p)};
  const T=(t,l)=>{if(vm){A(TAG(t,l));return}if(t==='core'&&!B)return;const q=B&&DK_B[t];if(!q){A(l);return}const pv=DK_PIV[t];
    for(const p of l){let x=p.c[0]-pv[0],y=p.c[1]-pv[1];if(q.rz){const c=Math.cos(q.rz),s=Math.sin(q.rz),x2=x*c-y*s;y=x*s+y*c;x=x2}
      P.push(Object.assign({},p,{c:[x+pv[0],y+pv[1]+(q.dy||0),p.c[2]+(q.dz||0)],rz:(p.rz||0)+(q.rz||0)}))}};
  // the receivers in armour, gold lines along them, the ejection port, the magwell
  A([Pt(0,0,-.02,.052,.072,.25,'dkPlate'),Pt(0,.06,-.05,.056,.054,.31,'dkPlate'),Pt(0,-.04,-.115,.046,.03,.084,'blk2'),
    ...[1,-1].flatMap(s=>[Pt(s*.0285,.04,-.05,.0016,.004,.28,'gold'),Pt(s*.0285,.084,-.05,.0016,.003,.26,'gold'),Pt(s*.0265,-.03,-.03,.0016,.004,.2,'gold')]),
    Pt(.0285,.06,-.08,.003,.02,.06,'muzzle'),Pt(.027,.06,-.08,.004,.016,.05,'brass')]);
  // the crimson gem over the grip (both sides), set in gold
  A([1,-1].flatMap(s=>[Pt(s*.029,.028,.005,.004,.032,.032,'gold',{rx:Math.PI/4}),Pt(s*.0312,.028,.005,.004,.02,.02,'dkGlow',{rx:Math.PI/4})]));
  // the knight's crest along the top (it lifts in B), the rear and front sights
  T('crest',[Pt(0,.1,-.06,.012,.026,.2,'blk2',{r:.003}),Pt(0,.114,-.06,.005,.005,.19,'gold')]);
  A([Pt(0,.104,.06,.03,.03,.012,'dkPlate'),Pt(0,.108,.0665,.012,.012,.003,'muzzle'),Pt(0,.1,-.47,.012,.04,.012,'blk2'),Pt(0,.122,-.47,.004,.008,.004,'dkGlow')]);
  // the handguard: the barrel inside, armour top and bottom; three overlapping lames down each side, gold-edged and riveted (they swing open in B)
  A([Pt(0,.058,-.33,.022,.022,.27,'steel'),Pt(0,.088,-.33,.046,.012,.27,'dkPlate'),Pt(0,.027,-.33,.046,.012,.27,'dkPlate'),Pt(0,.0335,-.33,.048,.003,.26,'lacR')]);
  for(const [t,s] of [['hgL',-1],['hgR',1]])T(t,[-.235,-.315,-.395].flatMap(z=>[Pt(s*.029,.058,z,.01,.056,.09,'dkPlate',{r:.003}),Pt(s*.0345,.058,z-.036,.002,.05,.012,'gold'),
    Pt(s*.035,.078,z+.01,.004,.006,.006,'gold'),Pt(s*.035,.038,z+.01,.004,.006,.006,'gold')]));
  // the crimson core round the barrel (B), dark rings over it
  T('core',[Pt(0,.058,-.33,.03,.03,.25,'dkGlow',{r:.01}),...[-.24,-.29,-.34,-.39,-.43].map(z=>Pt(0,.058,z,.035,.035,.008,'blk2',{r:.008}))]);
  // the barrel on, a gas block, a short blade under it
  A([Pt(0,.058,-.555,.024,.024,.17,'steel'),Pt(0,.07,-.49,.03,.03,.03,'blk2'),Pt(0,.03,-.5,.012,.022,.02,'dkPlate'),Pt(0,.022,-.585,.005,.022,.15,'bright'),
    Pt(0,.019,-.668,.004,.012,.03,'bright',{rx:.35})]);
  // the muzzle brake: a sword's crossguard in gold (turned to an X in B)
  T('mz',[Pt(0,.058,-.665,.04,.04,.05,'blk2',{r:.006}),Pt(0,.058,-.652,.12,.016,.018,'gold'),Pt(0,.058,-.652,.016,.07,.018,'gold'),
    ...[1,-1].map(s=>Pt(s*.062,.058,-.652,.008,.024,.02,'gold')),Pt(0,.058,-.692,.03,.03,.012,'muzzle')]);
  // the stock: layered plates like a pauldron, gold trim, a crimson stripe, the butt pad
  A([Pt(0,.03,.16,.032,.034,.14,'blk2'),Pt(0,.03,.25,.054,.086,.16,'dkPlate'),Pt(0,.078,.21,.05,.012,.1,'dkPlate',{rx:-.12}),Pt(0,.074,.285,.052,.012,.08,'dkPlate',{rx:-.22}),
    ...[1,-1].map(s=>Pt(s*.0275,.03,.25,.0016,.066,.13,'gold')),Pt(0,-.012,.25,.054,.006,.15,'lacR'),Pt(0,.03,.338,.058,.112,.02,'rub')]);
  // the grip with a gold cap, the trigger guard, the forward assist and the charging handle
  A([...pGrip('grip2',-.065,.035,.28),Pt(0,-.122,.05,.036,.008,.05,'gold',{rx:.28}),...tGuard(-.005)]);
  T('aux',[Pt(.03,.07,-.01,.012,.012,.012,'blk')]);T('chg',[Pt(0,.09,.07,.04,.008,.02,'blk'),Pt(0,.087,.06,.012,.006,.02,'blk2')]);
  // the 50-round magazine: long, a gold base plate, a crimson stripe
  T('mag',[Pt(0,-.115,-.115,.036,.2,.072,'blk',{rx:-.15}),Pt(0,-.217,-.1,.04,.014,.078,'gold',{rx:-.15}),Pt(.0185,-.1,-.117,.002,.12,.02,'lacR',{rx:-.15})]);
  return P}
const DK_G={grip:[0,-.03,.02],sup:[-.005,.01,-.33],muzzle:[0,.058,-.7],mag:[0,-.15,-.115],eject:[.03,.06,-.08]};
GUNS.m4dk=Object.assign({parts:dkParts('vm'),piv:DK_PIV,wid:'m4dkw'},DK_G);
GUNS.m4dkw=Object.assign({parts:dkParts('a')},DK_G);GUNS.m4dkwb=Object.assign({parts:dkParts('b')},DK_G);

// ---------- stats ----------
WPN.m4dk={slot:1,kind:'rifle',n:['M4A1 다크나이트','M4A1 Dark Knight'],cost:6500,mag:50,res:300,dmg:90,hs:150/90,limbK:50/90,rpm:700,spread:[.005,.04,.11],rec:[.014,.008],
  kb:3.2,stag:.62,reload:2,draw:.8,speed:.93,snd:'dkfire',model:'m4dk',hold:'rifle',shell:1,alt:'dk',trans:1,kickX:[.45,.66,.3]};
// B fires these (through zombies and walls: dkShot), on the same magazine
DK.WB=Object.assign({},WPN.m4dk,{rail:1,dkp:1,dmg:180,rec:[.0018,.0012],spread:[.0015,.014,.07],kb:4.6,stag:.9,snd:'dkfireb',kickX:[.3,.34,.1]});
VM_POS.m4dk={p:[.15,-.165,-.37],r:[0,.085,.035]};
BUY_MENU.find(c=>c.k==='rifle').items.push('m4dk');
// first draw and reload: the M4's (the T-handle at the back pulled and let go, the forward assist tapped); exactly 50, no extra round chambered
GUN_DESIGN.m4dk={mag:50,ch:0,act:'ar',x:.75,d:.06};WPN.m4dk.fd=GUN_DESIGN.m4dk;WPN.m4dk.ch=0;

// ---------- B ----------
function dkSet(a,on,own){on=!!on;if(!!a.dkB===on)return;a.dkB=on;if(own&&NET.on)netFxPush(['dk',a.id,on?1:0]);
  const snd=on?'dkon':'dkoff';if(a.isPlayer)AU.play(snd,{vol:.75});else AU.at(snd,a.c.x,a.c.y+1.3,a.c.z,{vol:.6,range:30});
  if(a.isPlayer){VM.sp.rz.v+=on?.5:-.4;VM.sp.py.v+=.1;if(on&&!AU.throttle('dknote',8000))HUD.note(LI()?'B — piercing rounds ×2, held fire':'B 모드 — 관통탄 데미지 2배 · 꾹 누르면 연사',1.6)}}
// the walls it passes through (each box once; the next one stops it), then every enemy on the line before that: head sphere, body box
// (legs low on it), a zombie's arms, a boss's own volumes, the firefighter's tank
function dkLine(src,ox,oy,oz,dx,dy,dz,L){const out=[];
  for(const t of G.actors){if(!t.alive||t===src||t.team===src.team)continue;let ht=-1,part=null;
    if(t.epRay&&t.epRayZc===t.zc){const r=t.epRay(ox,oy,oz,dx,dy,dz,L);if(r){ht=r.t;part=r.part}}
    else{const c=t.c,h=t.headR||.14;const th=raySphere(ox,oy,oz,dx,dy,dz,t.head.x,t.head.y,t.head.z,h*1.05,L);if(th>=0){ht=th;part='head'}
      const hw=(t.hitW||c.hw)+.02,top=t.head.y-h*.85,tb=rayAABB(ox,oy,oz,dx,dy,dz,c.x-hw,c.y,c.z-hw,c.x+hw,top,c.z+hw,L);
      if(tb>=0&&(ht<0||tb<ht)){ht=tb;part=oy+dy*tb<c.y+(top-c.y)*.45?'legs':'body'}
      if(t.team===TZ){const ta=rayArms(t,ox,oy,oz,dx,dy,dz,ht>=0?ht:L);if(ta>=0){ht=ta;part='arm'}}
      if(t.xRay){const r=t.xRay(ox,oy,oz,dx,dy,dz,ht>=0?ht+.15:L);if(r&&r.t>=0){ht=r.t;part=r.part}}}
    if(ht>=0)out.push({a:t,t:ht,part})}
  return out.sort((p,q)=>p.t-q.t)}
function dkShot(a,W,eye,base,sp){const dir=new THREE.Vector3();spreadDir(base,sp,dir);const L=110,ox=eye.x,oy=eye.y,oz=eye.z,dx=dir.x,dy=dir.y,dz=dir.z;
  TB_PASS.clear();const walls=[];let tEnd=L;for(let k=0;k<8;k++){const h=rayCast(ox,oy,oz,dx,dy,dz,L,TB_F);if(!h)break;walls.push({t:h.t,box:h.box,n:[h.nx,h.ny,h.nz]});TB_PASS.add(h.box);if(walls.length>DK.WALLS){tEnd=h.t;break}}
  const hits=dkLine(a,ox,oy,oz,dx,dy,dz,tEnd);let dmgT=0,hsAny=false;
  hits.forEach((h,i)=>{const t=h.a,nw=walls.filter(w=>w.t<h.t).length,ds=hsForce(a,h),hs=h.part==='head';hsAny=hsAny||hs;
    const x=ox+dx*h.t,y=oy+dy*h.t,z=oz+dz*h.t,dmg=W.dmg*(hs?W.hs:h.part==='legs'||h.part==='arm'?W.limbK:1)*Math.pow(DK.WALLK,nw)*Math.pow(DK.PK,i);dmgT+=dmg;
    damageActor(t,dmg,a,{w:'m4dk',hs,ds,dir:[dx,dy,dz],kb:W.kb,stag:W.stag,x,y,z,tank:h.part==='tank'?1:0});
    if(h.part==='ball'||h.part==='tank')FX.impact(x,y,z,-dx,-dy,-dz,'metal');else FX.blood(x,y,z,dx,dy,dz,hs?2:1.4,false);
    if(hs&&a.isPlayer&&!t.isPlayer)AU.play('headshot',{vol:.7})});
  walls.forEach((w,i)=>{if(i>3)return;const x=ox+dx*w.t,y=oy+dy*w.t,z=oz+dz*w.t,m=w.box.o.f&&w.box.o.f[nf(w.n)]||w.box.mat;FX.impact(x,y,z,w.n[0],w.n[1],w.n[2],m);
    if(i<2)for(let k=0;k<3;k++)FX.spark(x,y,z,w.n[0]*rr(1,3)+rr(-1,1),rr(0,2),w.n[2]*rr(1,3)+rr(-1,1),rr(.12,.26),[1,.35,.28]);
    if(!NET.ghost&&w.box.coffin&&a.team===TH&&typeof COFF!=='undefined')COFF.hurt(w.box.coffin,W.dmg,a);if(i===0)AU.at('imp_metal',x,y,z,{vol:.45,range:30})});
  const mz=muzzleWorld(a),e=Math.min(tEnd,110);dkBeam(mz.x,mz.y,mz.z,ox+dx*e,oy+dy*e,oz+dz*e);
  return {hit:hits.length>0,hs:hsAny,dmg:dmgT}}
// the trail: a pale core in a crimson glow (the Thunderbolt's beams fade it: csoguns.js tbUpdate), embers along its first stretch
function dkBeam(x0,y0,z0,x1,y1,z1){if(!TB.geo)TB.geo=new THREE.BoxGeometry(1,1,1);const len=Math.hypot(x1-x0,y1-y0,z1-z0);if(len<.5)return;
  const mk=(col,w,op)=>{const m=new THREE.Mesh(TB.geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));
    m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.lookAt(x1,y1,z1);m.scale.set(w,w,len);m.renderOrder=6;R.scene.add(m);return m};
  TB.beams.push({t:0,life:.5,core:mk(0xffe4dc,.02,1),glow:mk(0xff1a2c,.09,.55),w:[.02,.09]});
  const dx=(x1-x0)/len,dy=(y1-y0)/len,dz=(z1-z0)/len;for(let k=0;k<12;k++){const s=rr(.5,Math.min(len,30));FX.spawn({x:x0+dx*s,y:y0+dy*s,z:z0+dz*s,vx:rr(-.3,.3),vy:rr(-.1,.4),vz:rr(-.3,.3),life:rr(.2,.5),s0:.07,s1:.01,r:1,g:.3,b:.22,f:11,add:1})}
  DL.add(x0,y0,z0,'#ff3030',4,2,.1)}
// ---------- the view: half zoom in B, the gun drawn in a little ----------
const DKV={k:0,add:0};
// the view model: the lames open, the crossguard turns, the crest lifts, the core lights; a crimson glow on the hands
VMX.m4dk=function(V,a,dt,o,m){const T=m.tags;V.dkK=approach(V.dkK||0,a.dkB?1:0,dt*6);const k=smooth(V.dkK);
  if(T.hgL)T.hgL.rotation.z=DK_B.hgL.rz*k;if(T.hgR)T.hgR.rotation.z=DK_B.hgR.rz*k;if(T.mz){T.mz.position.z+=DK_B.mz.dz*k;T.mz.rotation.z=DK_B.mz.rz*k}if(T.crest)T.crest.position.y+=DK_B.crest.dy*k;
  if(T.core){T.core.visible=k>.05;T.core.scale.set(1,1,Math.max(.05,k))}
  if(k>.02){const u=V.U.uMuzzle.value,p=k*(.45+.15*Math.sin(V.t*9));u.r=Math.max(u.r,1.05*p);u.g=Math.max(u.g,.12*p);u.b=Math.max(u.b,.1*p)}
  const z=a.isPlayer?smooth(DKV.k):0;o[0]-=.045*z;o[1]+=.028*z;o[2]+=.03*z;o[4]-=.05*z;
  V.flash.material.color.setHex(a.dkB?0xff6a58:0xffffff)};

// ---------- the Deadshot: a second longer for whoever owns one ----------
// (the local player: the account owns it — with accounts off, it is in hand; a bot: carrying it; anyone else: what their request said)
function dkOwns(a){if(!a)return false;if(a===G.player)return ACC.on?!!(ACC.signed()&&ACC.me&&ACC.me.owned&&ACC.me.owned.has('m4dk')):!!(a.inv&&a.inv[1]==='m4dk');
  if(a.bot&&!a.pup)return !!(a.inv&&a.inv[1]==='m4dk');return !!a.dkOwn}

// ---------- hooks ----------
(function(){
  // right click: B on / off (on the page that runs the human)
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='dk'){if(!NET.ghost&&!a.pup)dkSet(a,!a.dkB,true);return}return na(a,W)};
  // B rounds (every page: a remote shot is replayed with them while that player's B is on)
  const fg=fireGun;fireGun=function(a,W){if(W===WPN.m4dk&&a.dkB)return fg(a,DK.WB);return fg(a,W)};
  const tb=tbShot;tbShot=function(a,W,eye,base,sp){if(W&&W.dkp)return dkShot(a,W,eye,base,sp);return tb(a,W,eye,base,sp)};
  // B's beat (the trigger held)
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.cur!=='m4dk'||!a.dkB)return aw(a,dt);const lf=a.lastFire,r=aw(a,dt);if(a.lastFire!==lf&&a.cur==='m4dk')a.nextFire=G.t+60/DK.BRPM;return r};
  // put away, turned, a new round: back to A
  const eq=equip;equip=function(a,id,instant){const r=eq(a,id,instant);if(a&&a.dkB&&a.cur!=='m4dk')dkSet(a,false,!a.pup);return r};
  const bz=becomeZombie;becomeZombie=function(a,host){a.dkB=false;return bz(a,host)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)a.dkB=false};
  // the world model in the hand: A, or B with the lames open and the core lit
  const eg=ensureGun;ensureGun=function(a){if(a.cur!=='m4dk'||a.team!==TH||!a.ch)return eg(a);const want=a.dkB?'m4dkwb':'m4dkw';if(a.gunId===want)return;
    if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!a.gunMat)a.gunMat=matGun();
    const m=new THREE.Mesh(gunGeo(want),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}};
  const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='dk'){if(a&&!a.isPlayer&&G.actors.includes(a)&&a.alive&&a.team===TH)dkSet(a,!!f[2],false);return}return nd(a,f)};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);for(const a of G.actors)if(a.dkB&&(!a.alive||a.team!==TH))a.dkB=false};
  // the half zoom: take last frame's narrowing off before the camera works out the view, put this frame's on after (as hskill.js does)
  const cm=Main.camera;Main.camera=function(dt){const cam=R.cam,had=DKV.add;if(had){cam.fov-=had;DKV.add=0}cm.call(this,dt);
    const P=G.player,on=!!(P&&P.alive&&!G.spec&&P.team===TH&&P.cur==='m4dk'&&P.dkB&&P.reloadT<=0&&P.drawT<=0&&!(P.zoom>0)&&G.st!=='menu');
    DKV.k=approach(DKV.k,on?1:0,dt*7);const add=-cam.fov*(1-DK.FOV)*smooth(DKV.k);if(add<-.01){cam.fov+=add;DKV.add=add}if(add<-.01||had)cam.updateProjectionMatrix()};
  // HUD: a crimson crosshair in B, the mode in the weapon's name
  const hu0=HUD.update;HUD.update=function(dt){hu0.call(this,dt);const P=G.player,cr=HUD.el&&HUD.el.cross;if(!cr)return;const on=!!(P&&P.alive&&P.team===TH&&P.cur==='m4dk'&&P.dkB);if(cr.classList.contains('dkb')!==on)cr.classList.toggle('dkb',on)};
  const ct=cmbTag;cmbTag=function(P,W){return ct(P,W)+(W&&W.trans&&P&&P.team===TH&&P.dkB?(LI()?' · B piercing':' · B 관통'):'')};
  const wt=UI.wTags;UI.wTags=function(W,id){if(W&&W.trans)return LI()?'Transcendence · RMB B: half zoom, piercing rounds ×2 · Deadshot +1 s while owned · Mag 50 · auto':'초월 · 우클릭 B: 반줌 · 관통탄 데미지 ×2 · 보유 시 확인사살 +1초 · 탄창 50 · 자동';return wt.call(this,W,id)};
  // the Deadshot: a second longer for an owner, every page (the host and the others learn it from the request / the event)
  const hs0=HSK.start.bind(HSK);HSK.start=function(a,k){hs0(a,k);if(k==='ds'&&dkOwns(a)){const h=this.of(a);h.ds+=DK.DS;
    if(a===G.player)HUD.note(LI()?`DEADSHOT — ${HSK.DS+DK.DS} s (M4A1 Dark Knight +${DK.DS} s)`:`확인사살 — ${HSK.DS+DK.DS}초 (M4A1 다크나이트 +${DK.DS}초)`,1.8)}};
  const nth=netToHost;netToHost=function(m){if(m&&m.t==='hsk'&&m.k==='ds'&&dkOwns(G.player))m.x=1;return nth(m)};
  const hh=HOSTH.hsk;HOSTH.hsk=function(L,m){const a=actorOfKey(L.key);if(a&&m&&m.k==='ds')a.dkOwn=!!m.x;return hh.call(this,L,m)};
  const ne=netEv;netEv=function(t,d){if(t==='hsk'&&d&&d.k==='ds'){const a=byId(d.i);if(a&&dkOwns(a))d.x=1}return ne(t,d)};
  const ch=CLIH.hsk;CLIH.hsk=function(L,m){const a=byId(m.i);if(a&&m.k==='ds'&&a!==G.player)a.dkOwn=!!m.x;return ch.call(this,L,m)};
  // bots: B for a zombie well off, A when it gets close
  const au=AI.update.bind(AI);AI.update=function(a,dt){au(a,dt);if(a.team!==TH||a.cur!=='m4dk'||!a.bot||!a.alive||a.pup)return;const t=jnBotSees(a);a.cmd.alt=false;
    if(!t||G.t<(a.dkBotT||0))return;const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z),want=a.dkB?d>6:d>10;if(want!==!!a.dkB&&a.reloadT<=0&&a.drawT<=0){dkSet(a,want,true);a.dkBotT=G.t+1.2}};
  const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.03)L[1]='m4dk';return L};
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // A: the M4's report, heavier (.50): more drive, a deeper punch, a short ring off the armour
  dkfire:{n:4,dur:1.2,ch:2,peak:.95,gain:.88,rev:.13,poly:7,pj:.025,fn:B=>{const p=GUNDEF.ar7();p.drive=2.1;p.punch.f0=rr(108,124);p.punch.l=1.15;p.body[2].f=rr(300,360);p.body[2].l=.75;
    gunshot(B,p);B.ring(.003,rr(1900,2100),[1,2.4],[.04,.03],[.12,.06])}},
  // B: a deep thump (퉁), an energy zing tearing down, a sizzle, the armour ringing
  dkfireb:{n:3,dur:1.5,ch:2,peak:.95,gain:.95,rev:.18,poly:5,pj:.03,fn:B=>{const o=B.comp(-10,4,.002,.2,B.g(.95));
    {const e=B.env(0,.002,1,.32,B.sh(2.4,o));B.osc('sine',rr(70,80),34,0,.34,e)}{const e=B.env(0,.001,.9,.09,o);B.nz('brown',0,.12,B.f('lowpass',900,.8,e))}
    {const e=B.env(0,.002,.55,.3,B.f('bandpass',1500,1.4,o));B.osc('sawtooth',rr(1900,2200),rr(260,300),0,.32,e)}
    {const e=B.env(.004,.02,.3,.6,B.f('highpass',2500,.7,o));B.nz('white',.004,.65,e)}B.ring(.004,rr(820,900),[1,2.5,3.9],[.3,.15,.08],[.2,.1,.05],o)}},
  // B on: three latches, the lames swinging out, a rising crimson hum
  dkon:{n:1,dur:1,ch:2,peak:.85,gain:.6,rev:.12,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.9));for(const t of [0,.05,.1]){B.grain(t,rr(2600,3400),3,.01,.5,o);B.ring(t,rr(1300,1500),[1,2.3],[.08,.04],[.1,.05],o)}
    {const e=B.env(.08,.08,.4,.2,o);B.nz('pink',.08,.3,B.sweep(B.f('bandpass',900,2,e),900,2200,.08,.3))}{const e=B.env(.1,.25,.3,.5,o);B.osc('sawtooth',90,180,.1,.75,B.f('lowpass',1200,.8,e))}
    {const e=B.env(.12,.2,.12,.5,o);B.osc('sine',1400,2600,.12,.7,e)}}},
  // B off: the lames shutting, the hum falling away
  dkoff:{n:1,dur:.8,ch:2,peak:.8,gain:.55,rev:.1,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.9));{const e=B.env(0,.04,.3,.25,o);B.osc('sine',1600,500,0,.3,e)}
    for(const t of [.12,.17]){B.grain(t,rr(2200,3000),3,.012,.55,o);B.ring(t,rr(900,1100),[1,2.4],[.1,.05],[.12,.06],o)}}}});
SFX_ORDER.push('dkfire','dkfireb','dkon','dkoff');

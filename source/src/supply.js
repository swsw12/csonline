'use strict';
// ============ Supply drops and the weapon that only comes out of them ============
// During a round of the infection modes the host drops a crate on a parachute every 35-50 s (the first one 20-32 s into the
// fight, at most two on the map). It lands somewhere open near a human, pours red smoke and blinks until a human walks into it.
// Opening it gives one of: the Event Horizon (30 %, the crate-only black-hole launcher), one of the crate-only guns (30 %: AK-47 60R
// or Dual MP7A1, crateguns.js), a heavy weapon (20 %), or supplies (20 %: full ammo, armour, a set of grenades and $1000). Clients see crates appear ('sb') and get opened ('so'); whoever opens one
// applies the reward to his own inventory, the same way picked-up guns work (drops.js).

// ---------- atlas materials (rows 8-9 of the weapon atlas) ----------
const SUP_MATS=['voidC','voidG','supW','chute'];
for(const m of SUP_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintSupAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // void shell: near-black lacquer with a faint violet swirl
  patch('voidC',(xx,y,X,Y)=>{const t=nz(X,Y,81,14),s=Math.sin((xx*.09+y*.05)+t*5);let c=t>.6?'#1e1230':t<.4?'#07050c':'#120b1c';if(s>.93)c='#3a2258';if(hash2(X,Y,82)<.006)c='#6a48a0';return c},250);
  // void glow: self-lit violet energy
  patch('voidG',(xx,y,X,Y)=>{const t=nz(X,Y,83,8);return t>.64?'#f4dcff':t>.5?'#c47cff':t>.38?'#8a3cf0':'#5a1cc0'},232);
  // crate: olive planks with dark seams, nail heads and scuffs
  patch('supW',(xx,y,X,Y)=>{const t=nz(X,Y,84,10);let c=t>.58?'#5e6a3a':t<.42?'#3e4826':'#4f5a32';if(y%32<2)c='#262c16';if((xx%64===8||xx%64===56)&&y%32===8)c='#9a9a90';if(hash2(X,Y,85)<.012)c='#7a8450';return c});
  // parachute: orange and white gores
  patch('chute',(xx,y,X,Y)=>{const g=Math.floor(xx/16)%2;let c=g?'#f0ece0':'#e86a1c';if(xx%16===0)c='#8a8478';if(nz(X,Y,86,20)>.66)c=lt(c,.06);return c});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}

// ---------- models ----------
Object.assign(GUNS,{
  // Event Horizon: a long dark launcher with violet rails; a caged singularity glows over the receiver (the 'mag': it is replaced on reload)
  bhole:{parts:[...TAG('mag',[Pt(0,.115,-.08,.07,.07,.07,'voidG',{r:.035}),Pt(0,.115,-.08,.05,.05,.05,'voidC',{r:.025})]),
      Pt(0,.115,-.08,.09,.006,.09,'chrome'),Pt(.04,.115,-.08,.006,.09,.006,'chrome'),Pt(-.04,.115,-.08,.006,.09,.006,'chrome'),Pt(0,.115,-.035,.006,.09,.006,'chrome'),Pt(0,.115,-.125,.006,.09,.006,'chrome'),
      Pt(0,.03,-.12,.08,.1,.34,'voidC'),Pt(0,.072,-.12,.06,.012,.32,'blk'),Pt(.041,.03,-.15,.004,.02,.26,'voidG'),Pt(-.041,.03,-.15,.004,.02,.26,'voidG'),
      Pt(0,.03,-.37,.066,.066,.18,'voidC',{r:.026}),Pt(0,.03,-.37,.07,.016,.17,'voidG'),Pt(0,.03,-.47,.09,.09,.03,'chrome',{r:.036}),Pt(0,.03,-.49,.074,.074,.02,'voidG',{r:.03}),
      Pt(0,.03,-.502,.05,.05,.004,'muzzle',{r:.02}),Pt(0,-.02,-.3,.05,.03,.12,'lacB'),
      ...pGrip('grip2',-.05,.03,.28),...tGuard(0),Pt(0,-.04,-.25,.032,.08,.036,'rub',{rx:.1}),
      Pt(0,.02,.14,.05,.08,.2,'voidC',{rx:-.05}),Pt(0,.01,.24,.054,.11,.02,'rub',{rx:-.05}),Pt(.027,.03,.12,.004,.012,.12,'voidG',{rx:-.05})],
    grip:[0,-.03,.02],sup:[0,-.04,-.25],muzzle:[0,.03,-.5],mag:[0,.115,-.08],eject:[0,.06,-.06]},
  // the shot: a black core inside a violet glow, three spinning rings
  bholep:{parts:[Pt(0,0,0,.1,.1,.1,'voidC',{r:.05}),Pt(0,0,0,.2,.012,.2,'voidG',{r:.1}),Pt(0,0,0,.012,.2,.2,'voidG',{r:.1}),Pt(0,0,0,.2,.2,.012,'voidG',{r:.1})],grip:[0,0,0],muzzle:[0,0,0]},
  // the crate (origin at its base) with red-cross plates and a beacon, and the parachute above it
  supbox:{parts:[Pt(0,.3,0,.8,.6,.8,'supW'),...[-1,1].flatMap(s=>[Pt(s*.4,.3,0,.03,.62,.82,'steel'),Pt(0,.3,s*.4,.82,.62,.03,'steel')]),Pt(0,.005,0,.84,.03,.84,'steel'),Pt(0,.6,0,.84,.03,.84,'steel'),
      ...[[0,.402],[0,-.402]].flatMap(([x,z])=>[Pt(x,.3,z,.32,.32,.004,'white'),Pt(x,.3,z*1.008,.22,.07,.004,'red'),Pt(x,.3,z*1.008,.07,.22,.004,'red')]),
      ...[.402,-.402].flatMap(x=>[Pt(x,.3,0,.004,.32,.32,'white'),Pt(x*1.008,.3,0,.004,.07,.22,'red'),Pt(x*1.008,.3,0,.004,.22,.07,'red')]),
      Pt(0,.64,0,.08,.06,.08,'ember',{r:.02}),Pt(0,.63,0,.12,.02,.12,'blk')],grip:[0,0,0],muzzle:[0,.7,0]},
  supchute:{parts:[Pt(0,3.0,0,2.2,.22,2.2,'chute',{r:.4}),Pt(0,2.86,0,2.8,.12,2.8,'chute',{r:.3}),...[-1,1].flatMap(s=>[Pt(s*1.35,2.62,0,.14,.5,2.6,'chute',{rz:-s*.6}),Pt(0,2.62,s*1.35,2.6,.5,.14,'chute',{rx:s*.6})]),
      ...[-1,1].flatMap(s=>[Pt(s*.72,1.6,0,.012,2.45,.012,'string',{rz:-s*.34}),Pt(0,1.6,s*.72,.012,2.45,.012,'string',{rx:s*.34})])],grip:[0,0,0],muzzle:[0,0,0]}});

// ---------- the weapon ----------
// Event Horizon: fires a slow orb that turns into a black hole where it hits (or after 1.1 s): for 3.2 s it drags every zombie within
// 9 m toward its centre and lifts them off the ground, grinding whoever is inside 2.6 m, then collapses in a blast. Supply crates hand
// it to anyone; an account that owns it can also take it from the buy menu once a round (3 shots, no spare: loadout.js). Its ammo only
// comes back from another crate.
WPN.bhole={slot:1,kind:'special',sup:1,n:['이벤트 호라이즌','Event Horizon'],cost:6000,mag:3,res:3,dmg:950,rpm:45,semi:1,proj:'vortex',spread:[.004,.02,.06],rec:[.08,.02],kb:18,stag:.8,hs:1,reload:3,draw:1,speed:.9,snd:'bhole',model:'bhole',hold:'rifle'};
VM_POS.bhole={p:[.15,-.175,-.36],r:[0,.08,.035]};GUNS.bhole.piv={mag:[0,.115,-.08]};
function vortexMake(a,w,x,y,z,vx,vy,vz,ghost){const m=new THREE.Mesh(gunGeo('bholep'),matGun());m.position.set(x,y,z);R.scene.add(m);
  const n={kind:'vortex',owner:a,w,x,y,z,vx,vy,vz,t:0,ph:0,ht:0,tick:0,mesh:m,spin:0,hit:new Set(),upd:vortexUpd,ghost:!!ghost};NADES.push(n);return n}
function vortexLaunch(a,W,eye,dir){const sp=24;const n=vortexMake(a,a.cur,eye.x+dir.x*.6,eye.y+dir.y*.6-.05,eye.z+dir.z*.6,dir.x*sp,dir.y*sp,dir.z*sp,false);
  NET.on&&netFxPush(['p',a.id,WI[a.cur],'vortex',r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)])}
function vortexUpd(n,dt){const m=n.mesh;
  if(n.ph===0){const r=projStep(n,dt,1.2,()=>'stop',()=>'stop');
    if(m){m.position.set(n.x,n.y,n.z);m.rotation.x+=dt*9;m.rotation.y+=dt*6}
    FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.3,.3),vy:rr(-.3,.3),vz:rr(-.3,.3),life:rr(.25,.45),s0:.18,s1:.02,r:.7,g:.35,b:1,a:.8,f:1,add:1});
    if(r==='stop'||n.t>1.1){n.ph=1;n.ht=0;n.vx=n.vy=n.vz=0;const fl=floorBelow(n.x,n.y+.2,n.z,.1);if(n.y<fl+1.9&&charFits({hw:.2,h:.3},n.x,fl+1.9,n.z))n.y=fl+1.9;
      n.light=DL.add(n.x,n.y,n.z,'#a050ff',11,2.8,0,{flick:.12});AU.at('vortex',n.x,n.y,n.z,{vol:1,range:70,occ:false})}
    return false}
  n.ht+=dt;const T=3.2,x=n.x,y=n.y,z=n.z,k0=Math.min(1,n.ht/.35);
  if(m){m.position.set(x,y,z);m.rotation.x+=dt*14;m.rotation.y+=dt*11;m.scale.setScalar((1+k0*2.6)*(1+.12*Math.sin(n.ht*30)))}
  // visuals: violet motes spiralling in from all sides, a dark ring on the ground, rings pulsing out of the core
  for(let i=0;i<5;i++){const an=rr(0,TAU),rd=rr(2.5,7),h=rr(-1.2,2);const px=x+Math.cos(an)*rd,pz=z+Math.sin(an)*rd,py=y+h;const ix=(x-px)/rd,iz=(z-pz)/rd;
    FX.spawn({x:px,y:py,z:pz,vx:ix*rd*1.6-iz*4,vy:-h*1.4,vz:iz*rd*1.6+ix*4,life:rr(.45,.7),s0:rr(.06,.12),s1:.02,r:.75,g:.4,b:1,a:.9,f:13,add:1})}
  if(Math.random()<.35)FX.spawn({x,y,z,life:.5,s0:.4,s1:3.5,r:.55,g:.2,b:1,a:.45,f:14,add:1});
  if(Math.random()<.4){const an=rr(0,TAU),rd=rr(1,5);FX.spawn({x:x+Math.cos(an)*rd,y:y+rr(-1,1),z:z+Math.sin(an)*rd,vx:-Math.cos(an)*3,vy:0,vz:-Math.sin(an)*3,life:.6,s0:.3,s1:.05,r:.1,g:.04,b:.15,a:.6,f:2})}
  // the pull is the host's job (zombies of client players get it as an effect); the grinding is done by the owner's own copy
  if(!NET.cli)for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const dx=x-t.c.x,dz=z-t.c.z,dy=y-1-t.c.y,d=Math.hypot(dx,dy,dz);if(d>9||d<.05)continue;
    if(!losClear(x,y,z,t.c.x,t.c.y+1,t.c.z))continue;const hd=Math.hypot(dx,dz)||1,k=1-d/9,acc=(10+28*k)*(t.host?.7:1);
    t.kvx+=dx/hd*acc*dt;t.kvz+=dz/hd*acc*dt;const v=Math.hypot(t.kvx,t.kvz);if(v>9){t.kvx*=9/v;t.kvz*=9/v}
    if(d<4.5){const want=clamp(dy*2,0,3.5);if(t.c.vy<want){t.c.vy=want;t.c.onGround=false;t.c.jumped=true}}
    t.staggerT=Math.max(t.staggerT,.3)}
  n.tick-=dt;if(n.tick<=0){n.tick=.25;let hit=0;for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;if(Math.hypot(x-t.c.x,y-1-t.c.y,z-t.c.z)>2.6)continue;
      damageActor(t,60,n.owner,{w:n.w,dir:[0,0,0],kb:0,stag:.4,x:t.c.x,y:t.c.y+1,z:t.c.z});hit++}if(hit&&n.owner.isPlayer&&!n.ghost)HUD.hitmark(false)}
  if(n.light){n.light.x=x;n.light.y=y;n.light.z=z;n.light.i=2.8*(1+.3*Math.sin(n.ht*20))}
  if(n.ht<T)return false;
  // collapse
  FX.explode(x,y,z,'he');for(let i=0;i<40;i++){const an=rr(0,TAU),el=rr(-.6,1),sp=rr(6,14);FX.spawn({x,y,z,vx:Math.cos(an)*Math.cos(el)*sp,vy:Math.sin(el)*sp,vz:Math.sin(an)*Math.cos(el)*sp,life:rr(.3,.6),s0:.2,s1:.04,r:.8,g:.45,b:1,f:1,add:1,drag:3})}
  FX.spawn({x,y,z,life:.5,s0:1,s1:9,r:.6,g:.25,b:1,a:.7,f:14,add:1});DL.add(x,y,z,'#c070ff',18,4,.6);
  AU.at('explode',x,y,z,{vol:1,range:90,occ:false,rate:.72});nearShake(x,y,z,14,1);
  blastDamage(n.owner,x,y,z,6.5,WPN.bhole.dmg,18,6,n.w,{he:1});
  if(n.light)n.light.dead=true;return true}

// ---------- supply crates ----------
const SUP={list:[],seq:1,next:1e9,MAXN:2,
  reset(){for(const b of this.list)this.drop(b);this.list=[];this.next=G.mode==='scen'?1e9:rr(20,32)},
  drop(b){if(b.mesh)R.scene.remove(b.mesh),b.mesh.material.dispose();if(b.chute)R.scene.remove(b.chute),b.chute.material.dispose();if(b.light)b.light.dead=true;if(b.mk)b.mk.remove();b.mesh=b.chute=b.light=b.mk=null},
  // somewhere open with sky above, 8-26 m from a random living human
  spot(){const H=G.actors.filter(a=>a.alive&&a.team===TH);if(!H.length||!NAV.nodes.length)return null;
    for(let k=0;k<160;k++){const h=H[(Math.random()*H.length)|0],n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];if(n.e.length<18)continue;const d=Math.hypot(n.x-h.c.x,n.z-h.c.z);
      if(k<120&&(d<8||d>26))continue;if(overlapAny(n.x-.6,n.y+.15,n.z-.6,n.x+.6,n.y+24,n.z+.6))continue;return [n.x,n.y,n.z]}return null},
  spawn(id,x,y,z){const b={id,x,y,z,h:20,t:0,landed:false,mesh:new THREE.Mesh(gunGeo('supbox'),matGun()),chute:new THREE.Mesh(gunGeo('supchute'),matGun()),light:null,mk:null};
    R.scene.add(b.mesh);R.scene.add(b.chute);this.list.push(b);
    HUD.note(LI()?'Supply drop incoming!':'보급상자 투하!',3);AU.play('supply',{vol:.8});
    if(NET.host)netEv('sb',{d:id,x:r2(x),y:r2(y),z:r2(z)});return b},
  update(dt){const own=!NET.cli,ft=G.roundTime-G.time;
    if(own&&G.st==='fight'&&ft>=this.next){this.next=ft+rr(35,50);if(this.list.length<this.MAXN){const p=this.spot();if(p)this.spawn(this.seq++,p[0],p[1],p[2])}}
    const P=G.player,cam=R.cam;
    for(let i=this.list.length-1;i>=0;i--){const b=this.list[i];b.t+=dt;
      const fall=Math.max(0,b.h-b.t*4.2),sw=fall>0?Math.sin(b.t*1.7)*.12:0;
      if(fall<=0&&!b.landed){b.landed=true;if(b.chute){R.scene.remove(b.chute);b.chute.material.dispose();b.chute=null}AU.at('land',b.x,b.y,b.z,{vol:.9,range:40});
        for(let k=0;k<14;k++){const an=k/14*TAU;FX.spawn({x:b.x+Math.cos(an)*.5,y:b.y+.1,z:b.z+Math.sin(an)*.5,vx:Math.cos(an)*2,vy:.3,vz:Math.sin(an)*2,life:.8,s0:.2,s1:.7,r:.5,g:.46,b:.4,a:.5,f:6,drag:3})}
        b.light=DL.add(b.x,b.y+1,b.z,'#ff7030',6,1.4,0,{flick:.2})}
      if(b.mesh){b.mesh.position.set(b.x,b.y+fall,b.z);b.mesh.rotation.set(sw*.6,b.t*.15,sw);sampleProbe(b.x,b.y+fall+.5,b.z,b.mesh.material.uniforms.uProbe.value)}
      if(b.chute){b.chute.position.set(b.x,b.y+fall,b.z);b.chute.rotation.set(sw*.6,b.t*.15,sw);sampleProbe(b.x,b.y+fall+2.5,b.z,b.chute.material.uniforms.uProbe.value)}
      if(b.landed){if(Math.random()<.5)FX.spawn({x:b.x+rr(-.1,.1),y:b.y+.7,z:b.z+rr(-.1,.1),vx:rr(-.3,.3),vy:rr(1.6,2.6),vz:rr(-.3,.3),life:rr(2,3.2),s0:.25,s1:1.4,r:.85,g:.18,b:.1,a:.45,f:2,drag:.6,grav:-.1,lit:1});
        if(b.light)b.light.i=Math.sin(b.t*6)>0?1.6:.4}
      // marker on screen for humans: where it is and how far
      if(P&&P.team===TH&&G.st!=='menu'){if(!b.mk){b.mk=document.createElement('div');b.mk.className='supMk';$('hud').appendChild(b.mk)}
        _sv.set(b.x,b.y+fall+1,b.z).project(cam);const vis=_sv.z<1&&Math.abs(_sv.x)<1.1&&Math.abs(_sv.y)<1.1;b.mk.style.display=vis?'block':'none';
        if(vis){b.mk.style.left=((_sv.x+1)*50)+'%';b.mk.style.top=((1-_sv.y)*50)+'%';b.mk.textContent=(LI()?'SUPPLY ':'보급 ')+Math.round(Math.hypot(b.x-P.c.x,b.z-P.c.z))+'m'}}
      else if(b.mk)b.mk.style.display='none';
      // opening: host / solo decides
      if(own&&b.landed){for(const a of G.actors){if(!a.alive||a.team!==TH)continue;if(Math.abs(a.c.x-b.x)>1.1||Math.abs(a.c.z-b.z)>1.1||Math.abs(a.c.y-b.y)>1.6)continue;this.open(a,b);break}}}},
  open(a,b){const i=this.list.indexOf(b);if(i>=0)this.list.splice(i,1);this.drop(b);
    const r=Math.random(),heavy=['gx6','airb','ripper','rdc','hmg','gl40','bdc'].filter(w=>WPN[w]&&a.inv[1]!==w),cg=CRATE_GUNS.filter(w=>WPN[w]&&a.inv[1]!==w);
    let k='kit',w='';if(r<.3&&a.inv[1]!=='bhole'){k='w';w='bhole'}else if(r<.6&&cg.length){k='w';w=rpick(cg)}else if(r<.8&&heavy.length){k='w';w=rpick(heavy)}
    this.give(a,k,w,b.x,b.y,b.z);if(NET.host)netEv('so',{d:b.id,i:a.id,k,w,x:r2(b.x),y:r2(b.y),z:r2(b.z)})},
  give(a,k,w,x,y,z){const L=LI();AU.at('pickup',x,y+.5,z,{vol:.9});FX.spawn({x,y:y+.5,z,life:.5,s0:.4,s1:2.5,r:1,g:.8,b:.4,a:.6,f:14,add:1});
    if(k==='w'){const W=WPN[w];if(!W)return;a.inv[1]=w;a.ammo[w]={mag:W.mag,res:W.res};gunFresh(a,w);equip(a,w);
      if(a.isPlayer){HUD.announce(W.n[L],'h',2.5);AU.play('lvlup',{vol:.6});HUD.note(L?'From the supply crate':'보급상자에서 획득',2)}else if(G.player)HUD.note((L?`${a.name} opened a supply crate`:`${a.name}이(가) 보급상자를 열었다`),1.6)}
    else{for(const id in a.ammo){const W=WPN[id];if(W&&W.mag)a.ammo[id]={mag:W.mag,res:W.res}}a.armor=100;a.inv.he=1;a.inv.frost=1;a.inv.flare=1;
      if(a.isPlayer){HUD.announce(L?'Supplies':'보급품','h',2);HUD.note(L?'Full ammo, armour, a grenade of each kind':'탄약 가득 · 방탄복 · 수류탄 종류별로 하나씩',2.5);AU.play('armor',{vol:.6})}}}};
Object.assign(CLIH,{
  sb(L,m){if(SUP.list.some(b=>b.id===m.d))return;SUP.spawn(m.d,m.x/100,m.y/100,m.z/100)},
  so(L,m){const b=SUP.list.find(q=>q.id===m.d);if(b){SUP.list.splice(SUP.list.indexOf(b),1);SUP.drop(b)}const a=byId(m.i);if(!a)return;
    if(a===G.player)SUP.give(a,m.k,m.w,m.x/100,m.y/100,m.z/100);else if(m.k==='w'&&WPN[m.w]){a.inv[1]=m.w;AU.at('pickup',m.x/100,m.y/100+.5,m.z/100,{vol:.9})}}});

// every weapon file is in: apply the per-gun identity table (design.js 4부 — real magazine sizes, chamber, first-draw action)
applyGunDesign();

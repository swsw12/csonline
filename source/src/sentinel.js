'use strict';
// ============ v6.56: SENTINEL — a light machine gun that sets itself up as a sentry (supply crates only) ============
// Our own design. In the hands: a belt-fed light machine gun, 150 rounds a box. Right click plants it on its tripod in front of you
// and it fights on its own — the nearest zombie it can see within 24 m, 600 rounds a minute that shove them back — feeding on the
// gun's own rounds (the box, then the spares) while you carry on with your pistol. Picking it again (1, the wheel, Q) calls it back
// from anywhere: it folds up and is in your hands again. It also folds up and comes back by itself when its rounds run out or after
// 45 s on watch. It cannot be hurt; it is gone if you fall, turn, or take another primary (a supply crate, the buy menu).
// Network: the owner's page aims it and deals its damage (a client's hits go to the host as claims, like any shot); every other page
// runs the same aiming for the look and the sound only. ['st', id, 1, x, y, z, yaw] sets one down, ['st', id, 0] folds it up.

// ---------- numbers ----------
// DMG / HS a round of the sentry, RPM its rate, KB / STAG its shove; RANGE how far it looks; TURN / PTURN how fast it turns (rad/s);
// AIM how close it must be on target to fire; LIFE its watch; UNF / FOLD its setting up / folding time; H its pivot over the floor
const SNN={DMG:30,HS:2,RPM:600,KB:3.4,STAG:.25,RANGE:24,TURN:5,PTURN:3,AIM:.14,LIFE:45,UNF:.7,FOLD:.55,H:.6,SPREAD:.012,SCAN:.15};
// where the head turns on the gun (the bottom of the box: it sits on the post) and the muzzle / the eye from there
const SNT_PIV=[0,-.13,-.12],SNT_MZ=[0,.185,-.5815],SNT_EYE=[0,.27,-.05];

// ---------- the model ----------
// gun frame as every rifle (origin at the grip, the barrel along -Z); o.vm tags the moving parts, o.legs:false leaves the folded
// tripod off (the sentry's head)
function sntParts(o){o=o||{};const P=[],T=(t,list)=>{for(const p of list){if(o.vm&&t)p.tag=t;P.push(p)}};
  // the receiver in olive drab, black side plates, a cyan strip down the left (the sentry's mind), a black belly
  T(null,[Pt(0,.04,-.07,.084,.11,.34,'olive2',{r:.008}),...[1,-1].map(s=>Pt(s*.0435,.035,-.08,.004,.07,.26,'mtB')),Pt(-.0462,.062,-.1,.002,.008,.16,'tbGlow'),
    Pt(0,-.018,-.07,.06,.012,.3,'mtB')]);
  // the top cover: a rail, the sentry's eye in its housing (a lens over a cyan line); it lifts on a reload
  T('cover',[Pt(0,.105,-.08,.078,.028,.28,'mtB',{r:.004}),Pt(0,.122,-.06,.026,.008,.2,'rail'),Pt(0,.138,-.17,.05,.03,.05,'mtB',{r:.006}),
    Pt(0,.138,-.1965,.032,.022,.003,'lens'),Pt(0,.15,-.1965,.034,.004,.003,'tbGlow')]);
  // the charging handle (right)
  T('chg',[Pt(.05,.06,-.2,.03,.014,.016,'steel'),Pt(.064,.06,-.2,.008,.02,.02,'mtB')]);
  // the barrel: a vented shroud, the barrel, a brake, the carry handle
  T(null,[Pt(0,.055,-.39,.058,.058,.26,'vent',{r:.01}),Pt(0,.055,-.58,.026,.026,.14,'steel'),Pt(0,.055,-.67,.042,.042,.06,'mtB',{r:.008}),
    Pt(0,.055,-.7015,.022,.022,.004,'muzzle'),Pt(0,.098,-.34,.016,.03,.014,'mtB'),Pt(0,.098,-.44,.016,.03,.014,'mtB'),Pt(0,.116,-.39,.016,.01,.12,'mtB')]);
  // the tripod folded under the barrel (its legs come out when it is set down)
  if(o.legs!==false)T(null,[...[1,-1].flatMap(s=>[Pt(s*.016,.016,-.52,.012,.012,.24,'steel'),Pt(s*.016,.016,-.645,.018,.018,.02,'yellow')]),Pt(0,-.032,-.2,.012,.012,.18,'steel')]);
  // the box (150 rounds): olive, a hazard stripe, the belt going up into the gun
  T('mag',[Pt(0,-.07,-.12,.11,.12,.13,'olive2',{r:.008}),Pt(-.056,-.07,-.12,.002,.03,.12,'yellow'),Pt(.06,-.01,-.12,.008,.06,.09,'belt')]);
  // the grip, the trigger, a skeleton stock with a cheek rest and a rubber pad
  T(null,[...pGrip('mtP',-.07,.06,.28),...tGuard(0),Pt(0,.035,.19,.05,.03,.2,'mtB'),Pt(0,-.01,.215,.03,.07,.03,'mtB'),Pt(0,.02,.3,.056,.12,.02,'rub'),Pt(0,.06,.24,.04,.012,.1,'mtP')]);
  return P}
GUNS.sentinel={parts:sntParts({vm:1}),piv:{cover:[0,.105,-.22]},grip:[0,-.03,.03],sup:[0,0,-.34],muzzle:[0,.055,-.705],mag:[0,-.12,-.12],eject:[.05,.05,-.1]};
// the sentry: a tripod (one leg ahead, two behind) with a post, a turntable and a battery box, the gun without its folded legs as the head,
// a red eye when it fires
const _sntq=new THREE.Quaternion(),_sntu=new THREE.Vector3(0,1,0),_sntd=new THREE.Vector3(),_snte=new THREE.Euler();
function sntLeg(A,B,w,m){_sntd.set(B[0]-A[0],B[1]-A[1],B[2]-A[2]);const L=_sntd.length();_sntd.multiplyScalar(1/L);_sntq.setFromUnitVectors(_sntu,_sntd);_snte.setFromQuaternion(_sntq,'XYZ');
  return Pt((A[0]+B[0])/2,(A[1]+B[1])/2,(A[2]+B[2])/2,w,L,w,m,{rx:_snte.x,ry:_snte.y,rz:_snte.z,r:w*.3})}
GUNS.sntBase={parts:(()=>{const L=[Pt(0,.52,0,.09,.08,.09,'mtB',{r:.012}),Pt(0,.575,0,.06,.04,.06,'steel',{r:.008}),Pt(0,.594,0,.15,.012,.15,'mtB',{r:.03}),
    Pt(0,.51,.0455,.04,.02,.004,'tbGlow'),Pt(0,.36,.07,.1,.13,.07,'olive2',{r:.01}),Pt(0,.4,.106,.05,.012,.003,'tbGlow'),Pt(0,.3,.106,.08,.012,.003,'yellow')];
  for(let k=0;k<3;k++){const an=k*TAU/3+Math.PI,fx=Math.sin(an)*.44,fz=Math.cos(an)*.44;L.push(sntLeg([0,.5,0],[fx,.03,fz],.034,'gunmetal'),Pt(fx,.016,fz,.07,.032,.07,'yellow',{r:.012}))}
  return L})(),grip:[0,0,0],muzzle:[0,0,0]};
GUNS.sntHead={parts:sntParts({legs:false}),grip:[0,0,0],muzzle:[0,0,0]};
GUNS.sntEyeR={parts:[Pt(0,.138,-.1985,.034,.024,.002,'dkGlow')],grip:[0,0,0],muzzle:[0,0,0]};

// ---------- stats ----------
WPN.sentinel={slot:1,kind:'mg',crate:1,cat:'mg',n:['센티넬','Sentinel'],cost:6000,mag:150,res:300,dmg:33,rpm:720,spread:[.014,.055,.15],rec:[.012,.012],kb:3,stag:.3,hs:3,
  reload:4.4,draw:1,speed:.84,snd:'sentfire',model:'sentinel',hold:'rifle',shell:1,alt:'sentry',
  bd:['보급 전용 · 우클릭: 자동 포탑 · 1번: 회수 · 150발','Crates only · RMB: sentry · 1: call back · 150 rounds']};
VM_POS.sentinel={p:[.16,-.19,-.42],r:[0,.08,.035]};
// a crate gun (crateguns.js): out of supply crates, on the buy menu (machine guns) only for an account that owns one, lent in the range
CRATE_GUNS.push('sentinel');{const c=BUY_MENU.find(q=>q.k==='mg');if(c&&!c.items.includes('sentinel'))c.items.push('sentinel')}
GUN_DESIGN.sentinel={mag:150,ch:0,act:'belt',x:1.3,heavy:.6};WPN.sentinel.fd=GUN_DESIGN.sentinel;WPN.sentinel.ch=0;
{const rk=rlKind;rlKind=function(W,G){return W&&W.model==='sentinel'?'belt':rk(W,G)}}

// ---------- the sentries ----------
const SNT={list:[]},_sntv=new THREE.Vector3(),_sntw=new THREE.Vector3();
const sntOwn=a=>!a.pup;// (the page that runs the owner)
function sntOf(a){return SNT.list.find(T=>T.a===a)||null}
// somewhere in front to stand it: on the floor near your feet, nothing in the way
function sntSpot(a){const c=a.c;aimDir(a.yaw,0,_sntv);
  for(const d of [.95,.7,.45,0]){const x=c.x+_sntv.x*d,z=c.z+_sntv.z*d,fl=floorBelow(x,c.y+.7,z,.2);if(!(fl>c.y-.6&&fl<c.y+.6))continue;
    if(overlapAny(x-.3,fl+.08,z-.3,x+.3,fl+1,z+.3))continue;return [x,fl,z]}return null}
function sntNew(a,x,y,z,yaw,ghost){const mat=matGun(),g=new THREE.Group(),base=new THREE.Mesh(gunGeo('sntBase'),mat),yg=new THREE.Group(),pg=new THREE.Group(),
    head=new THREE.Mesh(gunGeo('sntHead'),mat),eye=new THREE.Mesh(gunGeo('sntEyeR'),mat);
  head.position.set(-SNT_PIV[0],-SNT_PIV[1],-SNT_PIV[2]);eye.position.copy(head.position);eye.visible=false;
  g.add(base);g.add(yg);yg.position.y=SNN.H;yg.add(pg);pg.add(head);pg.add(eye);g.position.set(x,y,z);g.rotation.y=yaw;R.scene.add(g);
  const T={a,x,y,z,yaw,g,yg,pg,eye,mat,hy:0,hp:-.6,t:0,fire:0,tgt:null,scan:0,fold:-1,ghost:!!ghost,life:SNN.LIFE,want:false,mk:null,lockT:0,light:null};
  SNT.list.push(T);sntPose(T);return T}
function sntRemove(T){const i=SNT.list.indexOf(T);if(i>=0)SNT.list.splice(i,1);if(T.g){R.scene.remove(T.g);T.mat.dispose()}if(T.mk){T.mk.remove();T.mk=null}if(T.light){T.light.dead=true;T.light=null}}
// the pose: growing out of its folded size as it sets up, shrinking as it folds; the head on its yaw and pitch
function sntPose(T){const u=T.fold>=0?T.fold/SNN.FOLD:smooth(clamp(T.t/SNN.UNF,0,1)),s=.45+.55*u;T.g.scale.setScalar(s);
  T.yg.rotation.y=T.hy;T.pg.rotation.x=T.hp-(1-u)*.5}
// the eye and the muzzle in the world
function sntEye(T,out){T.g.updateMatrixWorld(true);return out.set(SNT_EYE[0],SNT_EYE[1],SNT_EYE[2]).applyMatrix4(T.pg.matrixWorld)}
function sntMuzzle(T,out){return out.set(SNT_MZ[0],SNT_MZ[1],SNT_MZ[2]).applyMatrix4(T.pg.matrixWorld)}
// the nearest zombie it can see (it keeps the one it is on unless another is clearly closer)
function sntPick(T){const e=sntEye(T,_sntw);let best=null,bd=1e9;
  for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0||z.epHide)continue;const d=Math.hypot(z.c.x-e.x,z.c.z-e.z);if(d>SNN.RANGE)continue;
    if(z.zc==='runner'&&z.skillT>0&&d>4||z.mnB)continue;// (an invisible light zombie slips past it too, and a miner underground: zminer.js)
    const ty=z.c.y+z.c.h*.55;if(!losClear(e.x,e.y,e.z,z.c.x,ty,z.c.z))continue;if(typeof SMK!=='undefined'&&SMK.n&&SMK.blocks(e.x,e.y,e.z,z.c.x,ty,z.c.z))continue;
    const sc=d*(z===T.tgt?.7:1);if(sc<bd){bd=sc;best=z}}
  return best}
// one round: world first, then the zombies on the line; the owner's page deals the damage (a ghost only shows it)
function sntShot(T,dx,dy,dz){const a=T.a,m=sntMuzzle(T,_sntv),ox=m.x,oy=m.y,oz=m.z,range=SNN.RANGE+16;
  const hw=rayCast(ox,oy,oz,dx,dy,dz,range,SHOT_FILTER),tW=hw?hw.t:range,ha=rayActors(a,ox,oy,oz,dx,dy,dz,tW),tE=ha?ha.t:tW,ex=ox+dx*tE,ey=oy+dy*tE,ez=oz+dz*tE;
  if(Math.random()<.55)FX.tracer(ox+dx*.15,oy+dy*.15,oz+dz*.15,ex,ey,ez);
  if(ha){const t=ha.a,hs=ha.part==='head';if(!T.ghost)damageActor(t,SNN.DMG*(hs?SNN.HS:1),a,{w:'sentinel',hs,dir:[dx,dy,dz],kb:SNN.KB,stag:SNN.STAG,x:ex,y:ey,z:ez});
    if(ha.part==='ball'||ha.part==='tank')FX.impact(ex,ey,ez,-dx,-dy,-dz,'metal');else FX.blood(ex,ey,ez,dx,dy,dz,.8,false)}
  else if(hw){const m2=hw.box&&(hw.box.o.f&&hw.box.o.f[nf([hw.nx,hw.ny,hw.nz])]||hw.box.mat)||'conc';FX.impact(ex,ey,ez,hw.nx,hw.ny,hw.nz,m2)}
  FX.muzzle(ox,oy,oz,dx,dy,dz,false);if(Math.random()<.5){const R0=T.yaw+T.hy;FX.shell(ox+dx*.4,oy-.08,oz+dz*.4,Math.cos(R0),-Math.sin(R0),false)}
  AU.at('sentfire',ox,oy,oz,{vol:.75,range:70,rate:1.04});if(T.light){T.light.i=2.2}}
// the owner's page: put one down (right click with the gun in hand)
function sntDeploy(a){if(G.pvp||a.stOut||!a.alive||a.team!==TH||a.cur!=='sentinel'||a.reloadT>0||a.drawT>0||G.st==='end'||G.st==='over')return false;
  const am=a.ammo.sentinel;if(!am||am.mag+am.res<=0){if(a.isPlayer){HUD.note(LI()?'No rounds left for the sentry':'포탑에 넣을 탄이 없어요',1.4);AU.play('dry',{vol:.5})}return false}
  const sp=sntSpot(a);if(!sp){if(a.isPlayer){HUD.note(LI()?'No room to set it up here':'여기엔 세울 자리가 없어요',1.4);AU.play('dry',{vol:.5})}return false}
  a.stOut=true;const T=sntNew(a,sp[0],sp[1],sp[2],a.yaw,false);sntDepFx(T);
  NET.on&&netFxPush(['st',a.id,1,r2(sp[0]),r2(sp[1]),r2(sp[2]),r3(a.yaw)]);
  equip(a,bestWeapon(a));// (the pistol: bestWeapon passes over a sentry that is out)
  if(a.isPlayer)HUD.note(LI()?'SENTINEL on watch — press 1 to call it back':'센티넬 배치 — 1번을 누르면 회수',2.4);
  return true}
function sntDepFx(T){AU.at('sntdep',T.x,T.y+.5,T.z,{vol:.85,range:40});FX.spawn({x:T.x,y:T.y+.3,z:T.z,life:.4,s0:.3,s1:1.4,r:.4,g:.9,b:1,a:.5,f:14,add:1});
  for(let i=0;i<10;i++){const an=i/10*TAU;FX.spawn({x:T.x+Math.cos(an)*.3,y:T.y+.05,z:T.z+Math.sin(an)*.3,vx:Math.cos(an)*1.2,vy:.3,vz:Math.sin(an)*1.2,life:.6,s0:.12,s1:.4,r:.55,g:.52,b:.46,a:.4,f:6,drag:3})}}
// folding up (the owner's page tells the rest); want: hand it over when it is folded (called back)
function sntFold(T,why){if(T.fold>=0)return;T.fold=SNN.FOLD;T.why=why;if(!T.ghost)NET.on&&netFxPush(['st',T.a.id,0]);
  AU.at('sntfold',T.x,T.y+.5,T.z,{vol:.8,range:35});if(T.eye)T.eye.visible=false}
// the owner's page: selecting it calls it back
function sntRecall(a){const T=sntOf(a);if(!T||T.ghost){a.stOut=false;return false}T.want=true;sntFold(T,'call');
  if(a.isPlayer&&T.fold>0)HUD.note(LI()?'SENTINEL coming back':'센티넬 회수 중',1.2);return true}
// folded: gone in a blink of cyan, the gun back in its owner's slot (and in the hands, if it was called)
function sntDone(T){const a=T.a,mz=T.g.position;for(let i=0;i<14;i++)FX.spawn({x:mz.x+rr(-.3,.3),y:mz.y+rr(.2,.8),z:mz.z+rr(-.3,.3),vx:rr(-.4,.4),vy:rr(.4,1.4),vz:rr(-.4,.4),life:rr(.3,.6),s0:.06,s1:.01,r:.45,g:.95,b:1,f:11,add:1});
  FX.spawn({x:mz.x,y:mz.y+.5,z:mz.z,life:.25,s0:.3,s1:1.2,r:.4,g:.9,b:1,a:.6,f:14,add:1});sntRemove(T);if(T.ghost)return;
  a.stOut=false;if(!a.alive||a.team!==TH||a.inv[1]!=='sentinel')return;
  if(T.want||a.bot&&!a.isPlayer)equip(a,'sentinel');
  else if(a.isPlayer){HUD.note(T.why==='empty'?(LI()?'SENTINEL is out of rounds — it is back (1)':'센티넬 탄 소진 — 돌아왔어요 (1번)'):(LI()?'SENTINEL\'s watch is over — it is back (1)':'센티넬 경계 종료 — 돌아왔어요 (1번)'),2);AU.play('sntlock',{vol:.4,rate:.8})}}
// every frame, every page
function sntTick(T,dt){const a=T.a;T.t+=dt;
  // the owner gone (fallen, turned, out of the game) or the gun gone from his slot: it goes with him
  if(!G.actors.includes(a)||!a.alive||a.team!==TH||(!T.ghost&&a.inv[1]!=='sentinel')){if(!T.ghost){a.stOut=false;NET.on&&netFxPush(['st',a.id,0])}sntRemove(T);return}
  // this page took the owner over (a host that moved, a player who left and became a bot): the gun goes back to his hands
  if(T.ghost&&sntOwn(a)){a.stOut=false;NET.on&&netFxPush(['st',a.id,0]);sntRemove(T);return}
  if(T.fold>=0){T.fold-=dt;sntPose(T);if(T.fold<=0)sntDone(T);return}
  if(T.ghost&&T.t>SNN.LIFE+8){sntRemove(T);return}// (a page that missed the folding)
  const set=T.t>=SNN.UNF;
  // its watch, its rounds (the owner's page)
  if(!T.ghost){T.life-=dt;const am=a.ammo.sentinel;if(!am||am.mag+am.res<=0){AU.at('sntempty',T.x,T.y+.6,T.z,{vol:.7,range:30});sntFold(T,'empty');sntPose(T);return}if(T.life<=0){sntFold(T,'time');sntPose(T);return}}
  // a target (a few times a second)
  T.scan-=dt;if(set&&T.scan<=0){T.scan=SNN.SCAN;const was=T.tgt;T.tgt=sntPick(T);if(T.tgt&&T.tgt!==was&&G.t>T.lockT){T.lockT=G.t+.6;AU.at('sntlock',T.x,T.y+.6,T.z,{vol:.45,range:25})}}
  const tg=T.tgt&&T.tgt.alive&&T.tgt.team===TZ?T.tgt:null;if(!tg)T.tgt=null;
  // turn the head toward it (the shortest way round), or sweep slowly when there is nothing
  const e=sntEye(T,_sntw);let ry=T.hy,rp=0;
  if(tg){const ty=tg.c.y+tg.c.h*.55,dx=tg.c.x-e.x,dz=tg.c.z-e.z;ry=wrapA(Math.atan2(-dx,-dz)-T.yaw);rp=clamp(Math.atan2(ty-e.y,Math.hypot(dx,dz)),-.6,.7)}
  else if(set)ry=T.hy+Math.sin(T.t*.7)*dt*.8;
  const dY=wrapA(ry-T.hy),dP=rp-T.hp;T.hy=wrapA(T.hy+clamp(dY,-SNN.TURN*dt,SNN.TURN*dt));T.hp+=clamp(dP,-SNN.PTURN*dt,SNN.PTURN*dt);sntPose(T);
  // fire when it is on target
  const on=!!tg&&set&&Math.abs(dY)<SNN.AIM&&Math.abs(dP)<SNN.AIM*1.5;if(T.eye)T.eye.visible=!!tg&&set;
  if(on){T.fire-=dt;let n=0;while(T.fire<=0&&n<3){T.fire+=60/SNN.RPM;n++;
      if(!T.ghost){const am=a.ammo.sentinel;if(!am||am.mag+am.res<=0)break;if(am.mag>0)am.mag--;else am.res--}
      const m=sntMuzzle(T,_sntv),ty=tg.c.y+tg.c.h*.55;let dx=tg.c.x-m.x,dy=ty-m.y,dz=tg.c.z-m.z;const L=Math.hypot(dx,dy,dz)||1;dx=dx/L+rr(-1,1)*SNN.SPREAD;dy=dy/L+rr(-1,1)*SNN.SPREAD;dz=dz/L+rr(-1,1)*SNN.SPREAD;
      const L2=Math.hypot(dx,dy,dz)||1;if(T.ghost){NET.ghost++;try{sntShot(T,dx/L2,dy/L2,dz/L2)}finally{NET.ghost--}}else sntShot(T,dx/L2,dy/L2,dz/L2)}}
  else T.fire=Math.max(0,T.fire);
  // a cyan glow on its eye while it is on watch
  if(!T.light&&set)T.light=DL.add(T.x,T.y+SNN.H+.25,T.z,'#5ad8ff',2.2,.6,0,{flick:.05});if(T.light){T.light.i=Math.max(.6,T.light.i-dt*12)}
  if(T.mat&&T.mat.uniforms&&T.mat.uniforms.uProbe)sampleProbe(T.x,T.y+.6,T.z,T.mat.uniforms.uProbe.value)}
// the owner's own sentry on screen: where it is, its rounds and its watch
function sntHud(){const P=G.player;for(const T of SNT.list){const mine=P&&T.a===P&&!T.ghost&&P.alive&&G.st!=='menu';
    if(!mine){if(T.mk){T.mk.remove();T.mk=null}continue}
    if(!T.mk){T.mk=document.createElement('div');T.mk.className='sntMk';$('hud').appendChild(T.mk)}
    _sntv.set(T.x,T.y+SNN.H+.55,T.z).project(R.cam);const vis=_sntv.z<1&&Math.abs(_sntv.x)<1.05&&Math.abs(_sntv.y)<1.05;T.mk.style.display=vis?'block':'none';if(!vis)continue;
    T.mk.style.left=((_sntv.x+1)*50)+'%';T.mk.style.top=((1-_sntv.y)*50)+'%';const am=P.ammo.sentinel,n=am?am.mag+am.res:0;
    const s=(LI()?'SENTINEL ':'센티넬 ')+n+' · '+Math.max(0,Math.ceil(T.life))+(LI()?'s':'초');if(T.mk.textContent!==s)T.mk.textContent=s;
    const hot=!!T.tgt;if(T.mk.classList.contains('hot')!==hot)T.mk.classList.toggle('hot',hot)}}
// another page's sentry
function sntRemote(a,f){const T=sntOf(a);if(f[2]===1){if(T)sntRemove(T);a.stOut=true;const N=sntNew(a,f[3]/100,f[4]/100,f[5]/100,f[6]/1000,true);sntDepFx(N)}
  else{a.stOut=false;if(T)sntFold(T,'net')}}

// ---------- hooks ----------
(function(){
  // right click with it in hand: set it down
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='sentry'){if(!NET.ghost&&sntOwn(a))sntDeploy(a);return}return na(a,W)};
  // selecting it while it is out calls it back; nothing else takes it out of the slot while it stands
  // (a bot's own wish to go back to its main gun is ignored: its sentry comes back by itself)
  const eq=equip;equip=function(a,id,instant){if(id==='sentinel'&&a&&a.stOut&&sntOwn(a)&&!NET.ghost){if(a.isPlayer)sntRecall(a);return}return eq(a,id,instant)};
  const bw=bestWeapon;bestWeapon=function(a){if(a&&a.stOut&&a.inv&&a.inv[1]==='sentinel')return a.inv[2]||a.inv[3]||'knife';return bw(a)};
  // every frame; the screen marker
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st==='menu'||G.st==='over')return;for(const T of SNT.list.slice())try{sntTick(T,dt)}catch(e){console.error(e);sntRemove(T)}};
  const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);try{sntHud()}catch(e){console.error(e)}};
  // a new round: none stand
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const T of SNT.list.slice())sntRemove(T);for(const a of G.actors)a.stOut=false};
  // other pages
  const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='st'){if(a&&!a.isPlayer&&G.actors.includes(a))sntRemote(a,f);return}return nd(a,f)};
  // bots: a bot holding it sets it down when it sees a zombie coming (not too close), then fights on with its pistol
  const au=AI.update.bind(AI);AI.update=function(a,dt){au(a,dt);if(!a.bot||a.isPlayer||a.pup||a.team!==TH||!a.alive||a.cur!=='sentinel'||a.stOut||G.st!=='fight')return;
    const B=a.bot,t=B.seen&&B.seen.a;if(!t||!t.alive||G.t<(B.sntT||0))return;const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d>5&&d<26){B.sntT=G.t+4;sntDeploy(a)}};
})();

// ---------- sounds (all synthesised) ----------
// the gun: a heavy machine-gun report, a deep thump with a clipped crack; the sentry fires the same round
Object.assign(GUNDEF,{sentinel:()=>({drive:2.05,crack:.82,crackF:2100,body:[{f:rr(620,720),q:.8,l:.9,d:.11},{f:rr(1700,2000),q:1,l:.68,d:.06},{f:rr(260,310),q:.9,l:.66,d:.15,n:'pink'}],
  punch:{f0:rr(108,122),f1:52,d:.15,l:1.12},mech:{t:rr(.03,.036),f:rr(3400,4000),l:.3},tail:{l:.3,tau:.25,d:1.05,f0:2600,f1:200},echo:echoes()})});
Object.assign(SFX,{
  sentfire:{n:4,dur:1.1,ch:2,peak:.92,gain:.8,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.sentinel())},
  // setting up: a servo whining up, three legs snapping out, two beeps
  sntdep:{n:1,dur:1.1,ch:2,peak:.85,gain:.62,rev:.08,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    {const e=B.env(0,.08,.35,.15,B.f('bandpass',1400,1.2,o),.3);B.osc('sawtooth',220,780,0,.5,e)}
    for(const t of [.18,.26,.34]){B.grain(t,2400,2,.012,.7,o);B.ring(t,rr(900,1100),[1,2.4],[.06,.03],[.12,.05],o);const e=B.env(t,.001,.5,.05,o);B.nz('brown',t,.06,B.f('lowpass',700,.7,e))}
    for(const t of [.6,.74]){const e=B.env(t,.004,.35,.06,o);B.osc('square',1760,1760,t,.08,B.f('lowpass',3500,.7,e))}}},
  // folding: the servo winding down, a clack, a rising shimmer as it goes
  sntfold:{n:1,dur:.9,ch:2,peak:.85,gain:.6,rev:.12,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    {const e=B.env(0,.05,.3,.2,B.f('bandpass',1200,1.2,o),.2);B.osc('sawtooth',700,200,0,.45,e)}B.grain(.42,2000,2,.015,.7,o);
    {const e=B.env(.45,.08,.18,.35,o);B.osc('sine',1200,3200,.45,.4,e)}}},
  // a target: two quick beeps
  sntlock:{n:1,dur:.3,peak:.6,gain:.4,poly:3,fn:B=>{for(const t of [0,.08]){const e=B.env(t,.002,.4,.05);B.osc('square',2100,2100,t,.06,B.f('lowpass',4000,.7,e))}}},
  // out of rounds: three falling beeps
  sntempty:{n:1,dur:.6,peak:.6,gain:.45,fn:B=>{[[0,1400],[.12,1100],[.24,800]].forEach(([t,f])=>{const e=B.env(t,.002,.4,.08);B.osc('square',f,f,t,.1,B.f('lowpass',3000,.7,e))})}}});
SFX_ORDER.push('sentfire','sntdep','sntfold','sntlock','sntempty');

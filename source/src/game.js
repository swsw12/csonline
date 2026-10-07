'use strict';
// ============ Game: actors, movement, weapons in hand, infection rules, round flow ============
const TH=0,TZ=1;
const HSKINS=['guard','medic','soldier','hazmat'];
const HSKIN_N={guard:['박재원','Park Jae-won'],medic:['엘레나','Elena'],soldier:['메이슨','Mason'],hazmat:['서유나','Seo Yuna']};
const ZCLASS={
  rager:{n:['일반 좀비','Regular Zombie'],sk:['광폭화','Berserk'],d:['기본형 · 스킬 G: 광폭화 (5초간 이동속도 +45%, 넉백 저항 / 체력 소모)','Standard · Skill G: Berserk (5s +45% speed, knockback resistance / costs HP)'],hp:2400,armor:120,speed:5.6,jump:7.3,kb:1,dmg:55,skill:'frenzy',cd:14,dur:5,hw:.3,h:1.8,eye:1.62},
  runner:{n:['라이트 좀비','Light Zombie'],sk:['투명화','Invisibility'],d:['고속·고점프 · 스킬 G: 투명화 (8초간 거의 보이지 않음, 봇은 가까이서만 발견) · 체력 낮음','Fast, jumps high · Skill G: Invisibility (8s, nearly invisible; bots only spot you up close) · low HP'],hp:1700,armor:60,speed:6.4,jump:8.6,kb:1.3,dmg:40,skill:'invis',cd:16,dur:8,hw:.28,h:1.82,eye:1.66},
  brute:{n:['헤비 좀비','Heavy Zombie'],sk:['덫','Trap'],d:['탱커형 · 스킬 G: 덫 설치 (밟은 인간을 4초간 묶음, 최대 3개) · 느림','Tank · Skill G: Trap (roots a human who steps in it for 4s, up to 3) · slow'],hp:3600,armor:300,speed:5.0,jump:6.8,kb:.5,dmg:80,skill:'trap',cd:8,dur:0,hw:.38,h:2.05,eye:1.86},
  scream:{n:['부두 좀비','Voodoo Zombie'],sk:['치유','Heal'],d:['지원형 · 스킬 G: 치유 (자신 25%, 주변 좀비 20% 회복)','Support · Skill G: Heal (25% to itself, 20% to nearby zombies)'],hp:2000,armor:100,speed:5.5,jump:7.3,kb:1.1,dmg:48,skill:'heal',cd:12,dur:1.2,hw:.29,h:1.85,eye:1.68},
};
const ZLIST=['rager','runner','brute','scream'];
const BOT_NAMES=['칼바람','도토리','Nox','라임','Vex','곰돌이','Kite','먹구름','Pilot','쥐불','Ash','소금빵','Rook','반딧불','Echo','짱돌','Mako','새벽','Juno','고등어','Wren','탄산수','Oslo','호떡'];
const G={st:'menu',mode:'mut',round:0,rounds:7,roundTime:180,prepTime:20,time:0,t:0,actors:[],player:null,score:[0,0],moralePts:0,moraleLvl:0,endT:0,winner:-1,lastHuman:null,cfg:null,spec:null,specIdx:0,deathCam:0,
  hostN:0,beepAt:0,lastAnn:'',paused:false,stats:null};
let ACTOR_ID=0;
function mkActor(name,isPlayer,skin){const a={id:ACTOR_ID++,name,isPlayer,skin,zpick:rpick(ZLIST),team:TH,alive:false,
  c:{x:0,y:0,z:0,vx:0,vy:0,vz:0,hw:.3,h:1.8,onGround:false,stepH:.5,jumped:false},yaw:0,pitch:0,duck:false,
  hp:100,maxHp:100,armor:0,money:0,kills:0,infects:0,deaths:0,score:0,dmgDealt:0,
  inv:{1:null,2:'p9',3:'knife',he:0,frost:0,flare:0},ammo:{},cur:'p9',prev:'knife',nextFire:0,reloadT:0,relKind:null,shellT:0,drawT:0,shots:0,recoilSpread:0,punchP:0,punchY:0,kick:0,zoom:0,zoomWas:0,boltT:0,pumpT:0,throwT:0,throwKind:null,
  zc:'rager',lvl:1,infR:0,host:false,skillCD:0,skillT:0,bombs:0,frozen:0,staggerT:0,dizzy:0,shriekT:0,lastHurt:-99,
  deadT:0,permaDead:false,reviveT:0,respawnT:0,deadDir:1,reviving:0,mvx:0,mvz:0,kvx:0,kvz:0,
  cmd:{f:0,s:0,jump:false,duck:false,walk:false,fire:false,alt:false,reload:false,skill:false,slot:0,nv:false},pc:{},
  rigs:{},ch:null,gun:null,gunId:null,head:new THREE.Vector3(),headR:.14,stepPh:0,stepAcc:0,an:{atk:0,atkSide:1,flinch:0,dead:0,skill:0},flash:false,nv:false,
  bot:null,survived:false,airT:0,fallV:0,beam:null};
  return a}
// ---------- inventory ----------
function fillAmmo(a,id){const W=WPN[id];if(!W||!W.mag)return;a.ammo[id]={mag:W.mag,res:W.res}}
function giveDefault(a){a.inv={1:null,2:'p9',3:'knife',he:0,frost:0,flare:0};a.ammo={};fillAmmo(a,'p9');a.cur='p9';a.prev='knife'}
function hasWeapon(a,id){const W=WPN[id];if(!W)return false;if(W.kind==='nade')return id==='zbomb'?a.bombs>0:a.inv[id]>0;return a.inv[W.slot]===id}
// 챈샷 (quick switch): flicking back to the gun you put away a moment ago (Q twice) brings it up in under half its draw time.
// Switching already drops the bolt/pump cycle and the shot delay, so a sniper or pump gun fires again sooner than by waiting.
const QUICK_BACK=1.2,QUICK_DRAW=.45;
function equip(a,id,instant){if(!id||a.cur===id&&!instant)return;const W=WPN[id];if(!W)return;
  const quick=!instant&&id===a.awayId&&G.t-(a.awayT==null?-9:a.awayT)<QUICK_BACK;
  if(a.cur&&a.cur!==id){a.prev=a.cur;a.awayId=a.cur;a.awayT=G.t}
  a.cur=id;a.reloadT=0;a.relKind=null;a.drawT=instant?0:(W.draw||.5)*(quick?QUICK_DRAW:1);a.zoom=0;a.boltT=0;a.pumpT=0;a.shots=0;a.throwT=0;a.bSt=0;a.bT=0;a.hamB=false;a.burstN=0;a.pendingMelee=null;a.nextFire=Math.min(a.nextFire,G.t);
  if(a.isPlayer){VM.set(id==='claw'?'claw':id,a.team===TZ?'z_'+a.zc:a.skin);if(quick)VM.draw(a.drawT);if(!instant)AU.play(W.kind==='melee'?'kdraw':'draw',{vol:.5,rate:(id==='axe'?.72:id==='hammer'?.58:1)*(quick?1.3:1)})}
  // 칼 챈샷 (draw cut): a blade drawn within a second of a gunshot, with an enemy in reach in front, comes out as an instant heavy cut —
  // full heavy damage and knockback on top of the shot that was just fired
  if(!instant&&W.kind==='melee'&&a.team===TH&&a.alive&&G.t-(a.lastFire==null?-9:a.lastFire)<DRAW_CUT_WIN){const r=meleeHit(a,W.range[1],.8);
    if(r&&r.t){a.drawT=0;a.nextFire=G.t+W.rate[1]*.8;a.an.atk=1;a.an.heavy=true;a.an.atkD=meleeAtkD(W,true)*.85;if(a.isPlayer)VM.draw(.12);meleeSwing(a,true);a.pendingMelee={t:.06,heavy:true};a.drawCuts=(a.drawCuts||0)+1}}}
const DRAW_CUT_WIN=1;
// third-person swing length (seconds) for a melee weapon
function meleeAtkD(W,heavy){return W&&W.anD?W.anD[heavy?1:0]:heavy?.68:.44}
function slotPick(a,slot){if(a.team===TZ){if(slot===4&&a.bombs>0)equip(a,'zbomb');else if(slot!==4)equip(a,'claw');return}
  if(slot===4){const order=['he','frost','flare'].filter(k=>a.inv[k]>0);if(!order.length)return;const i=order.indexOf(a.cur);equip(a,order[(i+1)%order.length]);return}
  const id=slot===3?(a.inv[3]||'knife'):a.inv[slot];if(id)equip(a,id)}
function bestWeapon(a){return a.inv[1]||a.inv[2]||a.inv[3]||'knife'}
// test button in the buy menu: +$3000 (in multiplayer the host adds it, money is the host's)
const ADD_MONEY=3000;
function addMoney(a){if(!a)return;if(NET.cli){netToHost({t:'addm'});return}a.money+=ADD_MONEY;if(a.isPlayer)AU.play('buy',{vol:.6})}
function buy(a,id,force){if(a.team!==TH||!a.alive||G.st==='end'||G.st==='over')return false;const pay=c=>{if(!force)a.money-=c};
  if(EQUIP[id]){const E=EQUIP[id];if(!force&&a.money<E.cost)return false;
    if(id==='armor'){if(a.armor>=100&&!force)return false;a.armor=100}
    if(id==='ammo'){let any=false;for(const k in a.ammo){const W=WPN[k];if(a.ammo[k].res<W.res){a.ammo[k].res=W.res;any=true}}if(!any&&!force)return false}
    pay(E.cost);if(a.isPlayer)AU.play('buy',{vol:.6});return true}
  const W=WPN[id];if(!W||W.cost==null)return false;const free=!!(W.ny&&a.nyFree>0&&a.inv[W.slot]!==id);if(!force&&!free&&a.money<W.cost)return false;
  if(W.kind==='nade'){if(a.inv[id]>=1)return false;a.inv[id]=1;pay(W.cost);if(a.isPlayer)AU.play('buy',{vol:.6});return true}
  if(W.kind==='melee'){if(a.inv[3]===id)return false;a.inv[3]=id;pay(W.cost);equip(a,id);if(a.isPlayer)AU.play('buy',{vol:.6});return true}
  if(a.inv[W.slot]===id){if(!a.ammo[id])fillAmmo(a,id);if(a.ammo[id].res>=W.res)return false;a.ammo[id].res=W.res;pay(Math.round(W.cost*.1));return true}
  a.inv[W.slot]=id;fillAmmo(a,id);if(free)a.nyFree--;else pay(W.cost);equip(a,id);if(a.isPlayer)AU.play('buy',{vol:.6});return true}
// ---------- geometry helpers ----------
const _eye=new THREE.Vector3(),_mz=new THREE.Vector3();
function eyeH(a){if(a.team===TZ){const Z=ZCLASS[a.zc];return a.duck?Z.eye*.68:Z.eye}return a.duck?1.1:1.64}
function actorEye(a){return _eye.set(a.c.x,a.c.y+eyeH(a),a.c.z)}
function muzzleWorld(a){const W=WPN[a.cur];if(a.isPlayer&&!G.spec){aimDir(a.yaw,a.pitch,_dv);const e=actorEye(a);const rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);const sd=W&&W.dual?(a.dualSide>0?.12:-.12):.1;
    return _mz.set(e.x+_dv.x*.75+rx*sd,e.y+_dv.y*.75-.09,e.z+_dv.z*.75+rz*sd)}
  const g=W&&W.dual&&a.dualSide<0&&a.gun2?a.gun2:a.gun;
  if(g&&W&&W.model){const m=GUNS[W.model].muzzle;_mz.set(m[0],m[1],m[2]);g.updateMatrixWorld();_mz.applyMatrix4(g.matrixWorld);return _mz}
  return actorEye(a)}
function surfaceAt(x,y,z){_bq.length=0;boxesIn(x-.05,z-.05,x+.05,z+.05,_bq);let best=null,h=-1e9;for(const b of _bq){if(b.nosolid)continue;if(x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&b.y1<=y+.05&&b.y1>h){h=b.y1;best=b}}
  if(!best)return 'conc';const k=matKind((best.o.f&&best.o.f.py)||best.mat);return k==='metal'?'metal':k==='soft'?'dirt':k==='wood'?'wood':'conc'}
// ---------- spawning ----------
function setHull(a){const c=a.c;if(a.team===TZ){const Z=ZCLASS[a.zc];c.hw=Z.hw;c.h=a.duck?Z.h*.7:Z.h}else{c.hw=.3;c.h=a.duck?1.25:1.8}}
function placeAt(a,x,y,z,yaw){const c=a.c;c.x=x;c.y=y;c.z=z;c.vx=c.vy=c.vz=0;c.onGround=false;a.mvx=a.mvz=a.kvx=a.kvz=0;a.yaw=yaw||0;a.pitch=0;a.duck=false;setHull(a);
  // nudge out of anything we overlap
  if(!charFits(c,c.x,c.y,c.z)){for(let r=.4;r<4;r+=.4){let ok=false;for(let k=0;k<12;k++){const an=k/12*TAU;if(charFits(c,x+Math.cos(an)*r,y,z+Math.sin(an)*r)){c.x=x+Math.cos(an)*r;c.z=z+Math.sin(an)*r;ok=true;break}}if(ok)break}}}
function zSpawnPoint(){const H=G.actors.filter(t=>t.alive&&t.team===TH);let best=null,bd=-1;
  const pts=MAP.zspawns.length?MAP.zspawns:MAP.spawns;
  for(const p of pts){let md=1e9;for(const h of H)md=Math.min(md,dist2(p[0],p[1],h.c.x,h.c.z)+Math.abs((p[2]||0)-h.c.y)*2);if(md>bd){bd=md;best=p}}return best||MAP.spawns[0]}
// ---------- rigs / visuals ----------
function rigKey(a){return a.team===TZ?'z_'+a.zc+(a.host?'_h':''):'h_'+a.skin}
function ensureRig(a){const k=rigKey(a);if(a.ch&&a.ch.key===k)return;if(a.ch)R.scene.remove(a.ch.grp);
  let ch=a.rigs[k];if(!ch){ch=a.rigs[k]=makeChar(k)}a.ch=ch;R.scene.add(ch.grp);a.gunId=null;if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}
  if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}}
function ensureGun(a){const W=WPN[a.cur];const want=a.team===TH&&W&&W.model?W.model+(W.dual?'+2':''):null;if(a.gunId===want)return;
  if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!want)return;
  if(!a.gunMat)a.gunMat=matGun();
  const m=new THREE.Mesh(gunGeo(W.model),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;
  if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}
  if(W.dual){const m2=new THREE.Mesh(gunGeo(W.model),a.gunMat);m2.matrixAutoUpdate=false;a.ch.grp.add(m2);a.gun2=m2}}
const _pr=new THREE.Color(),_fyo=[0,0,0,0];
function updateVisual(a,dt){if(!a.ch)return;const ch=a.ch,c=a.c;const show=!(a.isPlayer&&!G.spec&&a.alive)&&(a.alive||a.deadT<60||!a.permaDead||G.st!=='menu');
  ch.grp.visible=show&&(a.alive||a.an.dead>0);if(!ch.grp.visible){if(a.gun)a.gun.visible=false;return}
  const an=a.an;an.atk=Math.max(0,an.atk-dt/(an.atkD||.42));an.flinch=Math.max(0,an.flinch-dt*4);an.flx=(an.flx||0)*Math.exp(-dt*5);an.skill=Math.max(0,an.skill-dt);
  if(!a.alive)an.dead=Math.min(1,an.dead+dt*2.2);else if(a.reviving>0){an.dead=a.reviving/1.2}else an.dead=0;
  // locomotion state for animation: body-space velocity, a stride clock tied to distance, turn rate, acceleration, smoothed crouch / air / sprint
  const sp=Math.hypot(c.vx,c.vz);const k10=1-Math.exp(-dt*10),k6=1-Math.exp(-dt*6);
  const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);const vF=c.vx*fx+c.vz*fz,vS=-c.vx*fz+c.vz*fx;an.mvF=lerp(an.mvF||0,vF,k10);an.mvS=lerp(an.mvS||0,vS,k10);
  const acc=(vF-(an.pvF||0))/Math.max(dt,1e-3);an.pvF=vF;an.acc=lerp(an.acc||0,clamp(acc/14,-1,1),k6);
  const yr=an.pyaw==null?0:wrapA(a.yaw-an.pyaw)/Math.max(dt,1e-3);an.pyaw=a.yaw;an.trn=lerp(an.trn||0,clamp(yr,-8,8),k6);
  an.cr=approach(an.cr||0,a.duck?1:0,dt*7);an.airS=approach(an.airS||0,(!c.onGround&&a.airT>.1)?1:0,dt*(c.onGround?9:5));an.land=Math.max(0,(an.land||0)-dt*3.2);
  // turning on the spot: the feet stay planted in the world until the body has twisted too far, then they shuffle round (left, then right)
  if(an.fy==null)an.fy=a.yaw;
  if(sp>.35||!c.onGround||!a.alive){an.fy=a.yaw;an.ft=0}
  else if(an.ft>0){an.ft=Math.max(0,an.ft-dt/.34);if(an.ft===0)an.fy=an.fyT}
  else if(Math.abs(wrapA(a.yaw-an.fy))>.5){an.fy0=an.fy;an.fyT=a.yaw;an.ft=1}
  if(an.ft>0){const q=1-an.ft,d=wrapA(an.fyT-an.fy0);const qa=smooth(clamp(q/.6,0,1)),qb=smooth(clamp((q-.4)/.6,0,1));
    _fyo[0]=wrapA(an.fy0+d*qa-a.yaw);_fyo[1]=wrapA(an.fy0+d*qb-a.yaw);_fyo[2]=Math.sin(Math.PI*clamp(q/.6,0,1))*.07;_fyo[3]=Math.sin(Math.PI*clamp((q-.4)/.6,0,1))*.07}
  else{_fyo[0]=_fyo[1]=wrapA(an.fy-a.yaw);_fyo[2]=_fyo[3]=0}
  const stride=strideLen(sp)*legScale(ch.A)*(a.team===TZ?((ZGAIT[a.zc]||{}).stride||1):1);a.stepPh+=dt*(sp>.12?sp/stride*TAU:0);
  const Wv=WPN[a.cur]||{};const sprintW=a.team===TH&&a.alive&&sp>4.3&&G.t-(a.lastFire||-9)>.6&&a.reloadT<=0&&!(an.atk>0)&&a.zoom<=0;an.spr=approach(an.spr||0,sprintW?1:0,dt*4);
  const st={spd:a.alive&&a.frozen<=0?sp:0,phase:a.stepPh,stride,footYaw:_fyo,mvF:an.mvF,mvS:an.mvS,crouch:an.cr,air:an.airS,land:an.land,accel:an.acc,turnRate:an.trn,pitch:a.pitch,t:G.t+a.id*1.7,seed:a.id,zclass:a.zc,
    dead:an.dead,deadT:a.deadT,deadDir:a.deadDir,reviving:a.alive&&a.reviving>0,zombie:a.team===TZ,
    hold:a.team===TH?holdFor(a.cur):null,kick:Wv.dual&&a.dualSide<0?0:a.kick,kick2:Wv.dual&&a.dualSide<0?a.kick:0,
    reload:a.reloadT>0&&a.relKind==='mag'?1-a.reloadT/(Wv.reload||2):0,relKind:a.reloadT>0?a.relKind:null,shellP:a.relKind==='shell'?1-a.reloadT/(Wv.shellRel||.5):a.relKind==='start'?1-a.reloadT/(Wv.relStart||.4):0,brk:!!Wv.brk,sprint:an.spr,
    atk:an.atk>0?1-an.atk:0,atkSide:an.atkSide,heavy:!!an.heavy,flinch:an.flinch,flinchX:an.flx,skill:an.skill,stun:a.frozen,turn:a.turning>0?Math.min(1,a.turning*1.5):0,frenzy:a.team===TZ&&a.zc==='rager'&&a.skillT>0};
  if(a.team===TZ)poseZombie(ch,st);else poseHuman(ch,st);
  if(a.alive&&ch.hide!==STUMPS){ch.hide=STUMPS;a.spurts=null}// anything revived is whole again
  rigCompute(ch);ch.grp.position.set(c.x,c.y,c.z);ch.grp.rotation.y=a.yaw;ch.grp.updateMatrixWorld(true);
  // arterial spurts from fresh stumps, pulsing with the last heartbeats
  if(a.spurts&&!a.alive){for(const S of a.spurts){if(S.t<=0)continue;S.t-=dt;const beat=Math.max(0,Math.sin(G.t*8.5+S.ph));if(Math.random()>dt*55*beat*Math.min(1,S.t/1.4))continue;
      const D=SPURT_D[S.b-14];_sv.setFromMatrixPosition(ch.M[S.b]).applyMatrix4(ch.grp.matrixWorld);_sd.set(D[0],D[1],D[2]).transformDirection(ch.M[S.b]).transformDirection(ch.grp.matrixWorld);
      const sp=rr(1.6,3.2)*Math.min(1,S.t/1.2+.3);FX.spawn({x:_sv.x+_sd.x*.05,y:_sv.y+_sd.y*.05,z:_sv.z+_sd.z*.05,vx:_sd.x*sp+rr(-.25,.25),vy:_sd.y*sp+rr(0,.5),vz:_sd.z*sp+rr(-.25,.25),life:rr(.5,.9),s0:.05,s1:.03,r:.5,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:Math.random()<.25?rr(.05,.1):0})}}
  // level of detail: rounded fillets up close, chamfered parts further out
  {const cp=R.cam.position,dc=Math.hypot(c.x-cp.x,c.y+1-cp.y,c.z-cp.z),g=dc<14?ch.A.geo:ch.A.geoLo;if(ch.mesh.geometry!==g)ch.mesh.geometry=g}
  sampleProbe(c.x,c.y+1.1,c.z,_pr);ch.mat.uniforms.uProbe.value.copy(_pr).multiplyScalar(1.25);
  const U=ch.mat.uniforms;U.uFlash.value=Math.max(0,U.uFlash.value-dt*8);
  // status tints: frozen (ice blue), frenzy (red), harden (stone), level glow
  const T=U.uTint.value;if(a.team===TZ&&a.zc==='runner'&&a.skillT>0&&a.alive)T.set(.08,.1,.14,-(a.skillT<.6?a.skillT/.6*.86:.86));else if(a.frozen>0)T.set(.55,.8,1,.55);else if(a.skillT>0&&a.zc==='rager')T.set(.9,.1,.05,.3+.1*Math.sin(G.t*20));else if(a.skillT>0&&a.zc==='brute')T.set(.45,.42,.38,.45);else T.set(0,0,0,0);
  U.uEmisA.value=a.team===TZ?(a.lvl>=3?1.6:a.lvl>=2?1.25:1):1;
  ensureGun(a);if(a.gun){a.gun.visible=!!ch.gunOn;if(ch.gunOn){a.gun.matrix.multiplyMatrices(ch.M[1],ch.gunM);a.gun.material.uniforms.uProbe.value.copy(U.uProbe.value)}}
  if(a.gun2){a.gun2.visible=!!ch.gunOn2;if(ch.gunOn2)a.gun2.matrix.multiplyMatrices(ch.M[1],ch.gunM2)}
  charHead(ch,a.head);a.headR=a.zc==='brute'&&a.team===TZ?.16:.14;
  // flashlight beam for human bots
  if(a.team===TH&&a.alive&&!a.isPlayer&&a.flash&&a.gun&&a.gun.visible){if(!a.beam){a.beam=mkBeam();a.gun.add(a.beam)}a.beam.visible=true}else if(a.beam)a.beam.visible=false}
let BEAM_GEO=null,BEAM_MAT=null;
function mkBeam(){if(!BEAM_GEO){BEAM_GEO=new THREE.ConeGeometry(1.5,9,10,1,true);BEAM_GEO.translate(0,-4.5,0);BEAM_GEO.rotateX(Math.PI/2);
    BEAM_MAT=new THREE.ShaderMaterial({vertexShader:'varying float vZ;varying vec3 vP;void main(){vZ=-position.z/9.;vec4 wp=modelMatrix*vec4(position,1.);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}',
      fragmentShader:'varying float vZ;varying vec3 vP;uniform float uFogD;void main(){float z=clamp(vZ,0.,1.);float a=(1.-z)*(1.-z)*.045;float d=length(vP-cameraPosition);a*=smoothstep(.8,3.,d)*exp(-uFogD*uFogD*d*d);gl_FragColor=vec4(vec3(1.,.95,.8)*a,1.);}',
      uniforms:{uFogD:LU.uFogD},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})}
  const m=new THREE.Mesh(BEAM_GEO,BEAM_MAT);m.position.set(0,.06,-.3);m.renderOrder=7;return m}
// ---------- movement ----------
function maxSpeed(a){if(a.frozen>0)return 0;let s;
  if(a.team===TZ){const Z=ZCLASS[a.zc];s=Z.speed*(a.lvl>=3?1.06:a.lvl>=2?1.03:1)*(a.bot?DIFF_Z.spd[G.diff||0]:1);if(a.skillT>0&&a.zc==='rager')s*=1.45;if(a.skillT>0&&a.zc==='brute')s*=.82;if(a.staggerT>0)s*=.5;if(a.duck)s*=.45}
  else{const W=WPN[a.cur];s=5.15*(W?W.speed:1);if(W&&W.stance&&a.hamB)s*=W.stanceSpd;if(a.zoom>0)s*=.6;if(a.duck)s*=.36;else if(a.cmd.walk)s*=.52;if(a.shriekT>0)s*=.6}
  return s}
function jumpV(a){if(a.team===TZ)return ZCLASS[a.zc].jump;return 6.3}
function actorPhysics(a,dt){const c=a.c,cmd=a.cmd;const wasG=c.onGround,vy0=c.vy;
  // crouch (in the air the legs tuck up, which is what makes crouch-jumps reach higher ledges)
  const H0=a.team===TZ?ZCLASS[a.zc].h:1.8,H1=a.team===TZ?ZCLASS[a.zc].h*.7:1.25,dh=H0-H1;
  if(cmd.duck&&!a.duck){a.duck=true;c.h=H1;if(!c.onGround&&charFits(c,c.x,c.y+dh,c.z))c.y+=dh}
  else if(!cmd.duck&&a.duck){const t={hw:c.hw,h:H0};if(c.onGround){if(charFits(t,c.x,c.y,c.z)){a.duck=false;c.h=H0}}else{if(charFits(t,c.x,c.y-dh,c.z)&&c.y-dh>floorBelow(c.x,c.y+.1,c.z,c.hw)-.01){c.y-=dh;a.duck=false;c.h=H0}else if(charFits(t,c.x,c.y,c.z)){a.duck=false;c.h=H0}}}
  if(a.team===TZ){const Z=ZCLASS[a.zc];if(c.hw!==Z.hw&&charFits({hw:Z.hw,h:c.h},c.x,c.y,c.z))c.hw=Z.hw}
  // wish velocity
  const sp=a.rootT>0?0:maxSpeed(a);let f=cmd.f,s=cmd.s;const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}
  const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);
  let wx=(fx*f+rx*s)*sp,wz=(fz*f+rz*s)*sp;if(a.dizzy>0){const w=Math.sin(G.t*3+a.id)*a.dizzy*.3;const cx=wx*Math.cos(w)-wz*Math.sin(w);wz=wx*Math.sin(w)+wz*Math.cos(w);wx=cx}
  const acc=c.onGround?(a.team===TZ?40:48):(a.team===TZ?12:9);const k=Math.min(1,acc*dt/Math.max(.001,Math.hypot(wx-a.mvx,wz-a.mvz)));
  a.mvx+=(wx-a.mvx)*k;a.mvz+=(wz-a.mvz)*k;
  // knockback decays faster on the ground
  const kd=Math.exp(-dt*(c.onGround?4:1.1));a.kvx*=kd;a.kvz*=kd;
  if(a.frozen>0){a.mvx=a.mvz=0;a.kvx*=.5;a.kvz*=.5}
  // jump
  if(cmd.jump&&!a.pc.jump&&c.onGround&&a.frozen<=0&&!(a.rootT>0)){c.vy=jumpV(a);c.onGround=false;c.jumped=true;if(a.isPlayer){VM.jumped();if(a.team===TH)AU.play('step_conc',{vol:.35})}}
  c.vx=a.mvx+a.kvx;c.vz=a.mvz+a.kvz;const ox=c.x,oz=c.z;
  moveChar(c,dt);
  // blocked axes lose their velocity
  const ddx=c.x-ox,ddz=c.z-oz;if(Math.abs(ddx)<Math.abs(c.vx*dt)*.4){a.kvx*=.2;a.mvx*=.6}if(Math.abs(ddz)<Math.abs(c.vz*dt)*.4){a.kvz*=.2;a.mvz*=.6}
  c.vx=ddx/Math.max(dt,1e-4);c.vz=ddz/Math.max(dt,1e-4);
  if(c.onGround)a.airT=0;else a.airT+=dt;
  if(!wasG&&c.onGround){const v=-vy0;if(v>2.5){a.an.land=Math.max(a.an.land||0,clamp((v-2)/9,.2,1));if(a.isPlayer)VM.landed(clamp((v-2)/10,.15,1))}if(v>6.5){if(a.isPlayer){AU.play('land',{vol:clamp(v/14,.3,.9)})}else if(a.team===TZ)AU.at('zstep',c.x,c.y,c.z,{vol:.8});
      if(a.team===TH&&v>12.5&&G.st!=='menu'){hurtHuman(a,(v-12.5)*9,null,{fall:1})}}}
  if(c.y<-20){c.y=2;c.x=0;c.z=5}
  // footsteps
  const hs=Math.hypot(c.vx,c.vz);if(c.onGround&&hs>1.5){a.stepAcc+=hs*dt;const stride=a.team===TZ?1.7:1.9;if(a.stepAcc>stride){a.stepAcc=0;footstep(a)}}}
function footstep(a){const c=a.c;if(a.team===TH&&a.cmd.walk||a.duck)return;const s=surfaceAt(c.x,c.y,c.z);
  if(a.team===TZ){if(a.isPlayer)AU.play('zstep',{vol:.35});else AU.at('zstep',c.x,c.y,c.z,{vol:.9,range:30});return}
  const nm=s==='metal'?'step_metal':s==='dirt'?'step_dirt':s==='wood'?'step_wood':'step_conc';if(a.isPlayer)AU.play(nm,{vol:.4});else AU.at(nm,c.x,c.y,c.z,{vol:.8,range:28})}
// soft player-vs-player collision (zombies can be body-blocked)
function separate(dt){const A=G.actors;for(let i=0;i<A.length;i++){const a=A[i];if(!a.alive)continue;for(let j=i+1;j<A.length;j++){const b=A[j];if(!b.alive)continue;
  const dx=b.c.x-a.c.x,dz=b.c.z-a.c.z;const r=a.c.hw+b.c.hw;if(Math.abs(dx)>r||Math.abs(dz)>r)continue;if(a.c.y+a.c.h<b.c.y+.1||b.c.y+b.c.h<a.c.y+.1)continue;
  const d=Math.hypot(dx,dz)||.01;if(d>=r)continue;const push=(r-d)*.5;const ux=dx/d,uz=dz/d;
  const wa=a.team===b.team?.5:(a.team===TZ?.35:.65);
  for(const [t,sg,w] of [[a,-1,wa],[b,1,1-wa]]){const nx=t.c.x+ux*push*2*w*sg,nz=t.c.z+uz*push*2*w*sg;if(charFits(t.c,nx,t.c.y,nz)){t.c.x=nx;t.c.z=nz}}}}}
// ---------- weapons in hand ----------
function actorWeapons(a,dt){const cmd=a.cmd,pc=a.pc;
  a.punchP*=Math.exp(-dt*7);a.punchY*=Math.exp(-dt*7);a.recoilSpread*=Math.exp(-dt*4.5);a.kick=Math.max(0,a.kick-dt*6);
  if(!cmd.fire)a.shots=Math.max(0,a.shots-dt*12);
  if(a.drawT>0)a.drawT-=dt;const W0=WPN[a.cur];
  if(a.boltT>0){a.boltT-=dt;if(a.boltT<=0&&a.zoomWas&&a.isPlayer&&cmd.alt===false&&W0&&W0.bolt)a.zoom=a.zoomWas}if(a.pumpT>0)a.pumpT-=dt;
  // rotary barrels spin up while either button is held, and wind down slowly
  if(W0&&W0.spin){const want=(cmd.fire||cmd.alt)&&a.drawT<=0&&a.reloadT<=0&&a.frozen<=0;a.spinV=clamp((a.spinV||0)+(want?dt/W0.spin:-dt/(W0.spin*1.8)),0,1)}else a.spinV=0;
  if(a.frozen>0)return;
  if(cmd.slot){slotPick(a,cmd.slot);cmd.slot=0}
  if(cmd.lastInv){equip(a,hasWeapon(a,a.prev)?a.prev:(a.team===TZ?'claw':bestWeapon(a)));cmd.lastInv=false}
  const W=WPN[a.cur];if(!W)return;
  if(a.team===TZ){zombieAttack(a,dt);return}
  // grenades
  if(W.kind==='nade'){if(a.throwT>0){a.throwT-=dt;if(a.throwT<=0){throwNade(a,a.cur);a.inv[a.cur]=Math.max(0,a.inv[a.cur]-1);const nx=['he','frost','flare'].find(k=>a.inv[k]>0);equip(a,nx||bestWeapon(a))}return}
    if(cmd.fire&&(!pc.fire||!a.isPlayer)&&a.drawT<=0){a.throwT=.28;a.an.atk=1;a.an.atkD=.55;a.an.heavy=false;if(a.isPlayer){VM.throwNade();AU.play('pin',{vol:.5})}}return}
  // melee: the swing starts now, the blade lands a moment later (heavier weapons wind up longer)
  if(W.kind==='melee'){if(a.pendingMelee){a.pendingMelee.t-=dt;if(a.pendingMelee.t<=0){meleeStrike(a,a.pendingMelee.heavy);a.pendingMelee=null}return}
    // stance weapons (the hammer): right click switches between the overhead pound (A) and the braced knock-away stance (B); left click attacks in the current stance
    if(W.stance&&a.isPlayer){if(cmd.alt&&!pc.alt&&a.drawT<=0&&G.t>=a.nextFire-.25){a.hamB=!a.hamB;AU.play('kdraw',{vol:.45,rate:a.hamB?.6:.75});VM.stance&&VM.stance(a.hamB)}
      if(G.t>=a.nextFire&&a.drawT<=0&&cmd.fire){const heavy=!!a.hamB;meleeSwing(a,heavy);a.nextFire=G.t+W.rate[heavy?1:0];a.an.atk=1;a.an.heavy=heavy;a.an.atkD=meleeAtkD(W,heavy);
        const d=W.hitT[heavy?1:0];if(d>.05)a.pendingMelee={t:d,heavy};else meleeStrike(a,heavy)}return}
    if(G.t>=a.nextFire&&a.drawT<=0&&(cmd.fire||cmd.alt)){const heavy=!!cmd.alt;if(!heavy)a.an.atkSide=-(a.an.atkSide||1);meleeSwing(a,heavy);a.nextFire=G.t+W.rate[heavy?1:0];a.an.atk=1;a.an.heavy=heavy;a.an.atkD=meleeAtkD(W,heavy);
      const d=W.hitT?W.hitT[heavy?1:0]:0;if(d>0)a.pendingMelee={t:d,heavy};else meleeStrike(a,heavy)}return}
  const am=a.ammo[a.cur];if(!am)return;
  if(W.alt&&W.kind!=='saw'&&cmd.alt&&!pc.alt&&a.drawT<=0&&a.reloadT<=0)nyAlt(a,W);
  // zoom levels cycle with the right button
  if(W.zoom&&cmd.alt&&!pc.alt&&a.drawT<=0&&a.reloadT<=0){a.zoom=(a.zoom+1)%(W.zoom.length+1);a.zoomWas=0;if(a.isPlayer)AU.play('ui',{vol:.3,rate:.7})}
  // reloading
  if(a.reloadT>0){a.reloadT-=dt;
    if(W.shellRel){if(cmd.fire&&!pc.fire&&am.mag>0&&a.relKind==='shell'){a.reloadT=0;a.relKind=null;if(a.isPlayer)VM.stopReload()}
      else if(a.reloadT<=0){if(am.mag<W.mag&&am.res>0){am.mag++;am.res--;if(a.isPlayer){AU.play('shellin',{vol:.6});VM.shellIn()}}
        if(am.mag<W.mag&&am.res>0){a.reloadT=W.shellRel;a.relKind='shell'}else{a.relKind=null;if(a.isPlayer&&W.pump){AU.play('pump',{vol:.6});VM.pumpT=.62}else if(a.isPlayer)AU.play('rack',{vol:.5})}}}
    else if(a.reloadT<=0){const need=W.mag-am.mag,take=Math.min(need,am.res);am.mag+=take;am.res-=take;a.relKind=null;if(a.isPlayer&&W.kind==='pistol')AU.play('slide',{vol:.55})}
    return}
  const wantReload=(cmd.reload&&!pc.reload)||(am.mag===0&&(cmd.fire||!a.isPlayer));
  if(wantReload&&am.mag<W.mag&&am.res>0&&a.drawT<=0&&a.boltT<=0){a.zoom=0;a.burstN=0;
    if(W.shellRel){a.reloadT=W.relStart;a.relKind='shell';if(a.isPlayer)VM.reload(W,W.relStart,'start')}
    else{a.reloadT=W.reload;a.relKind='mag';if(a.isPlayer){const wid=a.cur;VM.reload(W,W.reload,'mag');
        if(W.brk){AU.play('brk',{vol:.6});setTimeout(()=>{if(a.reloadT>0&&a.cur===wid)AU.play('shellin',{vol:.6})},W.reload*.45*1000);setTimeout(()=>{if(a.reloadT>0&&a.cur===wid)AU.play('brk',{vol:.65,rate:1.15})},W.reload*.8*1000)}
        else{AU.play('magout',{vol:.6});setTimeout(()=>{if(a.reloadT>0&&a.cur===wid)AU.play('magin',{vol:.6})},W.reload*.62*1000);if(W.dual)setTimeout(()=>{if(a.reloadT>0&&a.cur===wid)AU.play('magin',{vol:.55,rate:1.05})},W.reload*.8*1000)}}
      else AU.at('magout',a.c.x,a.c.y+1.2,a.c.z,{vol:.4,range:15})}return}
  if(W.kind==='saw'){sawUpdate(a,W,dt);return}
  const ready=a.drawT<=0&&a.boltT<=0&&G.t>=a.nextFire;
  // a burst keeps going after the trigger is released
  if(a.burstN>0){if(ready){if(am.mag<=0)a.burstN=0;else{fireGun(a,W);a.burstN--;a.nextFire=G.t+(a.burstN>0?60/W.rpm:W.burstCd)}}return}
  if(cmd.fire&&ready&&(!(W.semi||W.burst)||!pc.fire||!a.isPlayer)){
    if(am.mag<=0){if(!pc.fire&&a.isPlayer)AU.play('dry',{vol:.6});a.nextFire=G.t+.25;return}
    if(W.spin&&a.spinV<1)return;
    fireGun(a,W);a.an.atk=0;
    if(W.burst){a.burstN=W.burst-1;a.nextFire=G.t+(a.burstN>0?60/W.rpm:W.burstCd)}else a.nextFire=G.t+60/W.rpm}}
// zombies: claws, spore bomb and class skill
function zombieAttack(a,dt){const cmd=a.cmd,pc=a.pc,Z=ZCLASS[a.zc];
  if(a.cur==='zbomb'){zbombUpdate(a,dt);return}
  if(cmd.skill&&!pc.skill)useSkill(a);
  if(a.pendingClaw){a.pendingClaw.t-=dt;if(a.pendingClaw.t<=0){clawStrike(a,a.pendingClaw.heavy);a.pendingClaw=null}}
  if(a.drawT>0||G.t<a.nextFire||a.pendingClaw)return;
  if(cmd.fire||cmd.alt){const heavy=!cmd.fire&&cmd.alt;a.nextFire=G.t+(heavy?1.1:.62);a.an.atk=1;a.an.atkD=heavy?.78:.48;a.an.heavy=heavy;a.an.atkSide=-a.an.atkSide;
    if(a.isPlayer){VM.claw(heavy,a.an.atkSide);AU.play('claw',{vol:.6})}else AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:.7,range:30});
    a.pendingClaw={t:heavy?.4:.19,heavy};NET.on&&netFxPush(['c',a.id,heavy?1:0,a.an.atkSide])}}
// zombie grenade: press → a hand reaches into the bomb's mouth and yanks the bone pin out (BOMB_PULL s); keep holding to carry it armed,
// release to throw. Left click = hard throw, right click = underhand lob (drop it at your feet for a bomb jump).
const BOMB_PULL=.62;
function zbombUpdate(a,dt){const cmd=a.cmd,pc=a.pc;
  if(a.throwT>0){a.throwT-=dt;if(a.throwT<=0){throwNade(a,'zbomb');a.bombs--;a.bSoft=false;if(a.bombs>0&&a.isPlayer){a.bSt=0;equip(a,'zbomb',true);VM.draw(.35)}else equip(a,'claw')}return}
  const want=cmd.fire||cmd.alt;
  if(a.bSt===1){a.bT-=dt;if(a.bT<=0){a.bSt=2;if(a.isPlayer)AU.play('pin',{vol:.6,rate:.7})}return}
  if(a.bSt===2){if(!a.isPlayer||!want){a.bSt=3;a.throwT=a.bSoft?.16:.26;a.an.atk=1;a.an.atkD=.55;a.an.heavy=false;a.an.atkSide=1;if(a.isPlayer)VM.throwNade(a.bSoft)}return}
  if(a.bSt===3)return;
  if(want&&(!(pc.fire||pc.alt)||!a.isPlayer)&&a.drawT<=0&&a.bombs>0){a.bSt=1;a.bT=BOMB_PULL;a.bSoft=!cmd.fire&&!!cmd.alt;
    if(a.isPlayer){VM.bombPull(BOMB_PULL);AU.play('zatk',{vol:.35,rate:1.5})}else AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:.4,range:20,rate:1.5})}}
function clawStrike(a,heavy){const r=meleeHit(a,heavy?2.3:2.0,heavy?.6:.5);
  if(r&&r.t){if(!NET.ghost){if(NET.cli)netToHost({t:'claw',i:r.t.id,h:heavy?1:0});else clawApply(a,r.t,heavy)}
    if(a.isPlayer)HUD.hitmark(false)}
  else if(r&&r.wall){FX.impact(r.x,r.y,r.z,r.n[0],r.n[1],r.n[2],r.wall.box.mat);if(a.isPlayer)AU.play('kwall',{vol:.4,rate:.7})}}
function clawApply(a,t,heavy){const Z=ZCLASS[a.zc];const dmg=Z.dmg*(heavy?1.6:1)*(a.host?1.25:1)*(a.lvl>=3?1.2:a.lvl>=2?1.1:1);
  aimDir(a.yaw,0,_dv);t.kvx+=_dv.x*(heavy?4:2);t.kvz+=_dv.z*(heavy?4:2);
  if(G.st==='fight'&&humansAlive()===1){hurtHuman(t,dmg*.9,a,{claw:1})}
  else if(t.armor>0){t.armor=Math.max(0,t.armor-dmg*.72);AU.at('clawarmor',t.c.x,t.c.y+1.2,t.c.z,{vol:.9});if(NET.host)netEv('snd',{n:'clawarmor',x:r2(t.c.x),y:r2(t.c.y+1.2),z:r2(t.c.z)});
    if(t.isPlayer){HUD.hurt(.5);AU.play('armor',{vol:.5})}FX.spawn({x:t.c.x,y:t.c.y+1.2,z:t.c.z,vy:1,life:.2,s0:.3,s1:.5,r:1,g:.9,b:.6,f:1,add:1})}
  else infect(t,a)}
function useSkill(a){if(NET.cli&&!NET.ev){if(a===G.player&&a.skillCD<=0&&(G.st==='fight'||G.st==='prep'))netToHost({t:'sk'});return}
  if(a.skillCD>0||G.st!=='fight'&&G.st!=='prep')return;const Z=ZCLASS[a.zc];const c=a.c;
  if(Z.skill==='invis'||Z.skill==='trap'||Z.skill==='heal'){if(nySkill(a,Z)){a.skillCD=Z.cd;if(NET.host)netEv('sk',{i:a.id,k:Z.skill})}return}
  if(Z.skill==='frenzy'){if(a.hp<a.maxHp*.15)return;a.hp-=a.maxHp*.08;a.skillT=Z.dur;AU.at('zroar',c.x,c.y+1.5,c.z,{vol:1,range:50})}
  else if(Z.skill==='leap'){if(!c.onGround)return;aimDir(a.yaw,0,_dv);a.kvx+=_dv.x*11;a.kvz+=_dv.z*11;c.vy=6.5;c.onGround=false;c.jumped=true;a.skillT=.8;AU.at('zleap',c.x,c.y+1.5,c.z,{vol:1})}
  else if(Z.skill==='harden'){a.skillT=Z.dur;AU.at('zharden',c.x,c.y+1.5,c.z,{vol:1,range:40})}
  else if(Z.skill==='shriek'){a.skillT=Z.dur;a.an.skill=1.2;AU.at('zscream',c.x,c.y+1.6,c.z,{vol:1,range:70,occ:false});FX.spawn({x:c.x,y:c.y+1.5,z:c.z,life:.5,s0:1,s1:14,r:.6,g:1,b:.4,a:.6,f:14,add:1});
    for(const t of G.actors){if(!t.alive)continue;const d=dist3(t.c,c);if(d>10)continue;
      if(t.team===TH){if(!losClear(c.x,c.y+1.5,c.z,t.c.x,t.c.y+1.5,t.c.z))continue;t.shriekT=3.5;t.dizzy=Math.max(t.dizzy,2.5);if(t.isPlayer){FX.shake=Math.max(FX.shake,.5);HUD.daze()}}
      else{t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.18);if(t.isPlayer&&t!==a)HUD.note(T('healed'))}}}
  if(Z.skill==='frenzy'||Z.skill==='harden'||Z.skill==='leap')a.an.skill=Z.skill==='leap'?0:.8;
  a.skillCD=Z.cd;if(NET.host)netEv('sk',{i:a.id,k:Z.skill})}
// ---------- damage & infection ----------
function humansAlive(){let n=0;for(const a of G.actors)if(a.alive&&a.team===TH)n++;return n}
function zombiesAlive(){let n=0;for(const a of G.actors)if(a.team===TZ&&(a.alive||!a.permaDead))n++;return n}
function damageActor(t,dmg,src,o){if(NET.ghost)return 0;if(NET.cli)return G.st==='end'||G.st==='over'?0:netClaimHit(t,dmg,src,o);if(!t.alive||G.st==='end'||G.st==='over')return;
  if(t.team===TH){return}
  if(t.reviving>0)return;
  if(src&&src.team===TH)dmg*=1+.1*G.moraleLvl;
  if(t.skillT>0&&t.zc==='brute')dmg*=.4;
  const hp0=t.hp,ar0=t.armor;
  if(t.armor>0){const ab=Math.min(t.armor,dmg*.5);t.armor-=ab;dmg-=ab}
  t.hp-=dmg;t.lastHurt=G.t;
  const dealt=(ar0-t.armor)+(hp0-Math.max(0,t.hp));// what actually came off (armour + health), overkill excluded
  let kb=(o.kb||0)*ZCLASS[t.zc].kb*(t.host?.75:1)*(t.lvl>=3?.8:t.lvl>=2?.9:1);if(t.skillT>0&&(t.zc==='brute'))kb=0;if(t.skillT>0&&t.zc==='rager')kb*=.5;if(t.frozen>0)kb*=.2;
  if(!t.c.onGround)kb*=1.5;t.kvx+=o.dir[0]*kb;t.kvz+=o.dir[2]*kb;if(o.up){t.c.vy=Math.max(t.c.vy,o.up);t.c.onGround=false;t.c.jumped=true}
  if(t.skillT<=0||t.zc!=='brute')t.staggerT=Math.max(t.staggerT,(o.stag||.2)*.8);
  t.an.flinch=Math.min(1,t.an.flinch+.35);if(o.dir)t.an.flx=clamp((t.an.flx||0)+(o.dir[0]*Math.cos(t.yaw)-o.dir[2]*Math.sin(t.yaw))*.6,-1,1);if(t.ch)t.ch.mat.uniforms.uFlash.value=Math.min(.35,t.ch.mat.uniforms.uFlash.value+.12);
  if(src){src.dmgDealt+=dealt;src.dmgRound=(src.dmgRound||0)+dealt;src.score+=dealt/100;const m=Math.round(dealt/8);if(m>0)src.money=Math.min(16000,src.money+m);if(src.isPlayer)HUD.dmgNum(t,dealt,!!o.hs,t.hp<=0)}
  if(t.isPlayer){HUD.hurt(clamp(dmg/600,.15,.8));FX.shake=Math.max(FX.shake,.15)}
  if(Math.random()<.18&&!AU.throttle('zp'+t.id,500))AU.at('zpain',t.c.x,t.c.y+1.5,t.c.z,{vol:.7});
  if(t.bot)AI.onHurt(t,src);
  if(t.hp<=0)killZombie(t,src,o);return dealt}
function hurtHuman(t,dmg,src,o){if(NET.ghost)return;if(NET.cli&&!NET.ev){if(t===G.player&&o.fall)netToHost({t:'fall',d:Math.round(dmg)});return}if(!t.alive||t.team!==TH)return;const hp0=t.hp,ar0=t.armor;if(t.armor>0&&!o.fall){const ab=Math.min(t.armor,dmg*.5);t.armor-=ab;dmg-=ab}
  t.hp-=dmg;t.lastHurt=G.t;
  if(src){const dealt=(ar0-t.armor)+(hp0-Math.max(0,t.hp));src.dmgDealt+=dealt;src.dmgRound=(src.dmgRound||0)+dealt;if(src.isPlayer)HUD.dmgNum(t,dealt,false,t.hp<=0)}if(t.isPlayer){HUD.hurt(clamp(dmg/40,.25,1));FX.shake=Math.max(FX.shake,.3)}AU.at('hurt',t.c.x,t.c.y+1.5,t.c.z,{vol:.8});if(o.claw)AU.at('clawhit',t.c.x,t.c.y+1.2,t.c.z,{vol:.9});
  FX.blood(t.c.x,t.c.y+1.2,t.c.z,rr(-1,1),0,rr(-1,1),1,false);
  if(t.hp<=0){t.hp=0;t.alive=false;t.permaDead=true;t.deadT=0;t.deaths++;t.an.dead=Math.max(t.an.dead,.001);t.deadDir=Math.random()<.5?1:-1;AU.at('hdie',t.c.x,t.c.y+1.4,t.c.z,{vol:1});
    if(src){src.kills++;src.score+=3;src.money=Math.min(16000,src.money+500)}HUD.feed(src,src?'claw':'fall',t,{});if(t.isPlayer)onPlayerDeath(src);if(NET.host)netEv('hdie',{i:t.id,s:src?src.id:-1})}}
function killZombie(t,src,o){if(NET.cli&&!NET.ev)return;t.alive=false;t.hp=0;t.deadT=0;t.deaths++;t.frozen=0;t.skillT=0;t.reviving=0;t.an.dead=Math.max(t.an.dead,.001);// keeps the body drawn while it falls
  aimDir(t.yaw,0,_dv);t.deadDir=(o.dir&&(o.dir[0]*_dv.x+o.dir[2]*_dv.z)>0)?-1:1;
  const perma=G.mode==='mut'&&(o.knife||(!t.host&&(o.hs||o.he)));
  if(G.mode==='mut'){if(perma)t.permaDead=true;else t.reviveT=8}else{t.respawnT=5}
  if(src){src.kills++;src.score+=perma?3:2;src.money=Math.min(16000,src.money+(o.hs?500:300))}
  HUD.feed(src,o.w,t,{hs:o.hs,perma});nyOnKill(t,src);
  AU.at('zdie',t.c.x,t.c.y+1.4,t.c.z,{vol:1,range:55});
  // gore: headshot kills burst the head, explosions tear the body; every body leaves a pool
  if(o.hs&&!o.knife&&o.dir){FX.gib(t.head.x,t.head.y,t.head.z,o.dir[0],o.dir[1],o.dir[2],false);AU.at('gib',t.head.x,t.head.y,t.head.z,{vol:1,range:40})}
  else if((o.he||o.w==='gl40')&&o.dir){FX.gib(t.c.x,t.c.y+1,t.c.z,o.dir[0],.4,o.dir[2],true);AU.at('gib',t.c.x,t.c.y+1,t.c.z,{vol:1,range:45})}
  dismember(t,o,perma);
  t.poolT=.75;t.poolN=0;
  if(src&&src.isPlayer){HUD.killConfirm(o.hs);if(o.hs)AU.play('hsding',{vol:.5})}
  if(G.mode==='mut'&&src&&src.team===TH&&!NET.cli){G.moralePts+=perma?2:1;const nl=Math.min(10,Math.floor(G.moralePts/3));if(nl>G.moraleLvl){G.moraleLvl=nl;HUD.announce(T('moraleUp',nl*10),'h',2.2);if(G.player&&G.player.team===TH)AU.play('morale',{vol:.55})}}
  if(t.isPlayer)onPlayerDeath(src);
  if(NET.host)netEv('kill',{i:t.id,s:src?src.id:-1,w:o.w||'',hs:o.hs?1:0,d:o.dir?[r2(o.dir[0]),r2(o.dir[1]),r2(o.dir[2])]:0,k:o.knife?1:0,h:o.heavy?1:0,he:o.he?1:0})}
// dismemberment: only on bodies that stay down (perma kills, or the classic mode where the dead respawn elsewhere).
// Headshots take the head off (heavy guns may burst it instead), explosions tear off one or two limbs, heavy blades lop off a head or an arm,
// a close shotgun blast can take an arm.
function dismember(t,o,perma){if(!t.ch||!o.dir||!(G.mode!=='mut'||perma))return;const W=WPN[o.w]||{},big=W.kind==='sniper'||W.kind==='shotgun'||(W.dmg||0)>=60;
  const cut=(k,d,sp)=>{if(SEVER[k]&&!(t.ch.hide>>SEVER[k].root&1)){FX.limb(t,k,d,sp);severLimb(t.ch,k);(t.spurts=t.spurts||[]).push({b:SEVER[k].stump,t:2.6,ph:Math.random()*6})}};
  if(o.hs&&!o.knife){if(big&&Math.random()<.55){severLimb(t.ch,'head');(t.spurts=t.spurts||[]).push({b:14,t:2.6,ph:0})}else cut('head',o.dir,rr(3,5.5))}
  else if(o.he||o.w==='gl40'){const ks=shuffle(['armL','armR','legL','legR','head','armL','armR']);const n=Math.random()<.45?2:1;for(let i=0,c=0;i<ks.length&&c<n;i++)if(!(t.ch.hide>>SEVER[ks[i]].root&1)){cut(ks[i],[o.dir[0],.7,o.dir[2]],rr(4.5,7.5));c++}}
  else if(o.knife&&o.heavy&&!o.blunt&&(o.w==='axe'||Math.random()<.4))cut(o.hs||Math.random()<.35?'head':Math.random()<.5?'armL':'armR',[o.dir[0],.2,o.dir[2]],rr(2.5,4));
  else if(W.kind==='shotgun'&&Math.random()<.3&&G.player&&Math.hypot(t.c.x-G.player.c.x,t.c.z-G.player.c.z)<6)cut(Math.random()<.5?'armL':'armR',o.dir,rr(3,5))}
const SPURT_D=[[0,1,-.2],[-1,.35,0],[1,.35,0],[-.2,-1,0],[.2,-1,0]],_sv=new THREE.Vector3(),_sd=new THREE.Vector3();
function infect(t,src){if(NET.ghost||(NET.cli&&!NET.ev))return;if(t.team!==TH||!t.alive)return;
  HUD.feed(src,'claw',t,{infect:1});
  if(src){src.infects++;src.infR++;src.score+=2;src.money=Math.min(16000,src.money+500);src.hp=Math.min(src.maxHp,src.hp+src.maxHp*.1);
    if(G.mode==='mut'){const nl=src.infR>=5?3:src.infR>=2?2:1;if(nl>src.lvl){src.lvl=nl;const mh=Math.round(zBaseHp(src)*(nl===3?1.5:1.25));src.maxHp=Math.max(src.maxHp,mh);src.hp=src.maxHp;src.armor+=100;
        if(src.isPlayer){HUD.announce(T('lvlUp',nl),'z',2);AU.play('lvlup',{vol:.6})}AU.at('zroar',src.c.x,src.c.y+1.5,src.c.z,{vol:.8})}}}
  AU.at('clawhit',t.c.x,t.c.y+1.2,t.c.z,{vol:1});AU.at('hscream',t.c.x,t.c.y+1.5,t.c.z,{vol:1,range:60});
  FX.blood(t.c.x,t.c.y+1.4,t.c.z,0,0,0,2,false);
  t.deaths++;becomeZombie(t,false);if(NET.host)netEv('infect',{i:t.id,s:src?src.id:-1,z:t.zc});
  if(t.isPlayer){HUD.infected(src);R.PU.uInfect.value=1;FX.shake=Math.max(FX.shake,.8)}
  const n=humansAlive();if(n===1&&G.st==='fight'){const last=G.actors.find(a=>a.alive&&a.team===TH);G.lastHuman=last;HUD.announce(T('lastHuman',last.name),'h',3);AU.play('stingL',{vol:.6})}}
function zBaseHp(a){return ZCLASS[a.zc].hp}
function becomeZombie(a,host){const nh=G.actors.filter(x=>x.team===TH&&x!==a).length;
  a.team=TZ;a.host=host;a.zc=a.zpick||'rager';const Z=ZCLASS[a.zc];a.lvl=host?2:1;a.infR=0;
  a.maxHp=host?Math.round(Z.hp*1.05+160*Math.max(1,nh)/Math.max(1,G.hostN)):Z.hp;if(a.bot)a.maxHp=Math.round(a.maxHp*DIFF_Z.hp[G.diff||0]);a.hp=a.maxHp;a.armor=host?300:Z.armor;
  a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0};a.ammo={};a.bombs=G.mode==='mut'?1:0;a.skillCD=host?3:4;a.skillT=0;a.frozen=0;a.zoom=0;a.reloadT=0;a.relKind=null;a.flash=false;a.shriekT=0;a.dizzy=0;
  a.cur=null;setHull(a);ensureRig(a);equip(a,'claw',true);a.an.skill=1;a.permaDead=false;a.alive=true;a.turning=host?2:1.4;
  if(a.isPlayer){a.nv=false;VM.set('claw','z_'+a.zc);VM.draw(.9)}
  if(a.bot)AI.onTeam(a)}
function reviveZombie(a,at){if(NET.cli&&!NET.ev)return;
  // a class picked in the menu takes effect on revival (hosts keep theirs)
  if(!a.host&&a.zpick&&a.zpick!==a.zc){a.zc=a.zpick;const Z=ZCLASS[a.zc];const mult=a.lvl>=3?1.5:a.lvl>=2?1.25:1;a.maxHp=Math.round(Z.hp*mult);setHull(a);ensureRig(a);if(a.isPlayer)VM.set('claw','z_'+a.zc)}
  a.alive=true;a.reviving=1.2;a.hp=Math.round(a.maxHp*.6);a.armor=0;a.frozen=0;a.staggerT=0;a.kvx=a.kvz=0;a.mvx=a.mvz=0;
  if(at){placeAt(a,at[0],at[1],at[2],a.yaw);a.reviving=0;a.hp=a.maxHp;a.armor=Math.round(ZCLASS[a.zc].armor*.5)}else{a.c.vx=a.c.vz=0;setHull(a)}
  equip(a,'claw',true);if(G.mode==='mut'&&a.bombs<1&&Math.random()<.5)a.bombs=1;
  AU.at('zrevive',a.c.x,a.c.y+1,a.c.z,{vol:1});if(a.isPlayer){G.spec=null;VM.set('claw','z_'+a.zc);VM.draw(1);HUD.note(T('revived'))}if(a.bot)AI.onTeam(a);
  if(NET.host)netEv('rv',{i:a.id,at:at?[r2(a.c.x),r2(a.c.y),r2(a.c.z)]:0,z:a.zc})}
function onPlayerDeath(src){G.deathCam=3;G.killer=src||null;if(G.player)G.player.zoom=0}
// ---------- round flow ----------
function startMatch(cfg){G.cfg=cfg;G.mode=cfg.mode;G.rounds=cfg.rounds;G.roundTime=cfg.time;G.prepTime=20;G.diff=cfg.diff;G.round=0;G.score=[0,0];G.t=0;
  for(const a of G.actors){if(a.ch)R.scene.remove(a.ch.grp)}G.actors=[];ACTOR_ID=0;
  if(cfg.ro){G.player=null;for(const r of cfg.ro){const me=!!r[4]&&r[4]===NET.me;const a=mkActor(r[1],me,r[2]);a.id=r[0];a.zpick=me?(CFG.zclass||r[3]):r[3];a.net=r[4]||null;
      a.pup=NET.host?(!!r[4]&&!me):!me;if(!a.pup&&!r[4])a.bot=AI.mk(a);if(me)G.player=a;G.actors.push(a)}ACTOR_ID=cfg.ro.length}
  else{const P=mkActor(cfg.name||T('you'),true,cfg.skin||'guard');P.zpick=cfg.zclass||'rager';G.player=P;G.actors.push(P);
    const names=shuffle(BOT_NAMES.slice());for(let i=0;i<cfg.bots;i++){const b=mkActor(names[i%names.length],false,rpick(HSKINS));b.zpick=rpick(ZLIST);b.bot=AI.mk(b);G.actors.push(b)}}
  for(const a of G.actors){a.money=cfg.money||4000;a.survived=false}
  if(NET.cli){G.st='prep';G.time=G.prepTime;return}
  startRound()}
function startRound(plan){if(NET.cli&&!plan)return;G.round=plan?plan.n:G.round+1;G.st='prep';FX.clearLimbs();G.time=G.prepTime;G.moralePts=0;G.moraleLvl=0;G.lastHuman=null;G.spec=null;G.deathCam=0;G.winner=-1;G.beepAt=11;G.hostN=0;
  clearNades();NY.clear();for(const l of DL.list)if(l.flare)l.dead=true;
  const sp=shuffle(MAP.spawns.slice());let k=0;const pm={},out=[];if(plan)for(const q of plan.P)pm[q[0]]=q;
  for(const a of G.actors){const q=pm[a.id];const keep=plan?!!(q&&q[5]):a.survived&&a.team===TH;a.nb=null;a.team=TH;a.host=false;a.alive=true;a.dmgRound=0;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.permaDead=false;a.hp=100;a.maxHp=100;a.lvl=1;a.infR=0;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.bombs=0;a.rootT=0;a.burnT=0;a.sawRev=0;a.dragonG=0;
    a.an.dead=0;a.an.atk=0;a.pendingClaw=null;a.zoom=0;a.flash=false;a.nv=false;
    if(!keep){giveDefault(a);a.armor=0}else{for(const id in a.ammo){const W=WPN[id];a.ammo[id].mag=W.mag;a.ammo[id].res=W.res}a.cur=bestWeapon(a)}
    if(q)placeAt(a,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);else{const p=sp[k++%sp.length];placeAt(a,p[0],p[2]||0,p[1],p[3]!=null?p[3]+rr(-.4,.4):Math.PI+rr(-.6,.6))}ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;
    if(NET.host)out.push([a.id,r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw),keep?1:0]);
    if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)AI.onRound(a)}
  if(G.player&&MAP.spawnYaw!=null&&!plan){G.player.yaw=MAP.spawnYaw}
  FX.clearDecals();HUD.roundStart();AU.play('siren',{vol:.5});AU.muSet&&AU.muSet('prep');if(NET.host)netEv('round',{n:G.round,P:out})}
function selectHosts(ids){if(NET.cli&&!NET.ev)return;let H=G.actors.filter(a=>a.alive&&a.team===TH);const n=ids?Math.max(1,ids.length):Math.max(1,Math.min(3,Math.ceil(G.actors.length/10)));G.hostN=n;
  // prefer players who were not host recently
  if(ids)H=ids.map(byId).filter(a=>a&&a.alive&&a.team===TH);else{shuffle(H);H.sort((a,b)=>(a.hostCount||0)-(b.hostCount||0))}const picked=[];
  for(let i=0;i<n&&i<H.length;i++){const a=H[i];picked.push(a);a.hostCount=(a.hostCount||0)+1;a.zc=a.zpick||'rager';becomeZombie(a,true);
    AU.at('zinfect',a.c.x,a.c.y+1.5,a.c.z,{vol:1,range:80,occ:false});FX.blood(a.c.x,a.c.y+1.4,a.c.z,0,0,0,2,false);if(a.isPlayer){HUD.infected(null);R.PU.uInfect.value=1}}
  HUD.announce(T('hostAppear'),'z',3.5);AU.play('stingZ',{vol:.8});AU.muSet&&AU.muSet('fight');if(NET.host)netEv('hosts',{i:picked.map(a=>a.id),z:picked.map(a=>a.zc)})}
function endRound(win){if(NET.cli&&!NET.ev)return;if(G.st!=='fight'&&G.st!=='prep')return;G.st='end';G.endT=6;G.winner=win;G.score[win]++;
  for(const a of G.actors){a.survived=a.team===TH&&a.alive;
    a.money=Math.min(16000,a.money+(win===TH?(a.team===TH&&a.alive?2500:1400):(a.team===TZ?2200:1400)))}
  HUD.announce(win===TH?T('winH'):T('winZ'),win===TH?'h':'z',5);AU.play(win===TH?'stingH':'stingZ',{vol:.7});AU.muSet&&AU.muSet(win===TH?'win':'dead');if(NET.host)netEv('end',{w:win,sc:G.score.slice()})}
function gameUpdate(dt){if(G.st==='menu'||G.st==='over'){for(const a of G.actors)updateVisual(a,dt);return}
  G.t+=dt;
  if(G.st==='prep'){G.time-=dt;const s=Math.ceil(G.time);if(s<G.beepAt&&s>=1){G.beepAt=s;if(s<=10){AU.play(s<=3?'beep2':'beep',{vol:.5});HUD.countdown(s)}}
    if(G.time<=0){if(NET.cli)G.time=0;else{selectHosts();G.st='fight';G.time=G.roundTime}}}
  else if(G.st==='fight'){G.time-=dt;const h=humansAlive();
    if(!NET.cli){if(h===0)endRound(TZ);else if(G.time<=0)endRound(TH);else if(G.mode==='mut'&&zombiesAlive()===0)endRound(TH)}
    if(G.st==='fight'&&(G.time<30||h===1))AU.muSet&&AU.muSet('intense')}
  else if(G.st==='end'){G.endT-=dt;if(G.endT<=0&&!NET.cli){if(G.round>=G.rounds||Math.max(G.score[0],G.score[1])>G.rounds/2){G.st='over';UI.showResults();if(NET.host)netEv('over')}else startRound()}}
  for(const a of G.actors){
    if(a.alive){
      if(a.bot&&!a.pup)AI.update(a,dt);
      a.frozen=Math.max(0,a.frozen-dt);if(a.rootT>0)a.rootT=Math.max(0,a.rootT-dt);a.staggerT=Math.max(0,a.staggerT-dt);a.dizzy=Math.max(0,a.dizzy-dt);a.shriekT=Math.max(0,a.shriekT-dt);a.skillCD=Math.max(0,a.skillCD-dt);a.skillT=Math.max(0,a.skillT-dt);
      if(a.team===TZ&&!NET.cli&&G.t-a.lastHurt>5&&a.hp<a.maxHp)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*.02*dt);
      // badly hurt zombies leave a trail of blood
      if(a.team===TZ&&a.hp<a.maxHp*.45&&Math.random()<dt*2.2)FX.spawn({x:a.c.x+rr(-.15,.15),y:a.c.y+rr(.7,1.2),z:a.c.z+rr(-.15,.15),vx:rr(-.2,.2),vy:-.5,vz:rr(-.2,.2),life:1.2,s0:.04,s1:.03,r:.42,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:rr(.05,.11)});
      if(a.turning>0){a.turning-=dt;a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=a.cmd.jump=a.cmd.skill=false;a.mvx*=.8;a.mvz*=.8}
      // the get-up timer runs here, not in updateVisual: the local player's own body is never drawn, so it would never count down there
      if(a.reviving>0)a.reviving=Math.max(0,a.reviving-dt);
      if(a.pup)netPuppet(a,dt);else if(a.reviving<=0){actorPhysics(a,dt);if(!(a.turning>0))actorWeapons(a,dt)}
      if(a.team===TZ&&a.frozen>0&&Math.random()<dt*6)FX.spawn({x:a.c.x+rr(-.3,.3),y:a.c.y+rr(.2,1.8),z:a.c.z+rr(-.3,.3),vy:-.3,life:.6,s0:.08,s1:.04,r:.8,g:.95,b:1,f:10,add:1});
      Object.assign(a.pc,a.cmd)}
    else{a.deadT+=dt;
      if(a.poolT>0){a.poolT-=dt;if(a.poolT<=0&&a.poolN<2){aimDir(a.yaw,0,_dv);const k=(a.deadDir>0?-.6:.6);FX.pool(a.c.x+_dv.x*k,a.c.y,a.c.z+_dv.z*k,a.poolN?rr(1.05,1.35):rr(.6,.85));a.poolN++;a.poolT=a.poolN<2?1.6:0}}
      if(a.team===TZ&&!a.permaDead&&G.st==='fight'&&!NET.cli){if(G.mode==='mut'){a.reviveT-=dt;if(a.reviveT<=0)reviveZombie(a,null)}else{a.respawnT-=dt;if(a.respawnT<=0){const p=zSpawnPoint();reviveZombie(a,[p[0],p[2]||0,p[1]])}}}}
    // dead bodies still settle under gravity
    if(!a.alive&&a.deadT<3){a.c.vy-=GRAV*dt;a.c.vx*=.9;a.c.vz*=.9;a.c.vx+=a.kvx*.3;a.c.vz+=a.kvz*.3;a.kvx*=.8;a.kvz*=.8;moveChar(a.c,dt)}}
  separate(dt);updateNades(dt);nyUpdate(dt);
  for(const a of G.actors)updateVisual(a,dt)}

// zombie grenade: the free hand comes up, hooks two fingers into the mouth, yanks the bone pin out and drops away; armed, the bomb trembles in the fist
const _zbH=new THREE.Vector3();
VMX.zbomb=function(vm,a,dt,o,m){const T=m.tags,pin=T.mag,L=m.armL,G=GUNS.zbomb,sp=G.sup;
  if(vm.drawT>0&&!vm.pull)vm.pinOut=false;
  let show=false;
  if(vm.pull){const P=vm.pull;P.t+=dt;const p=clamp(P.t/P.d,0,1);show=p<.97;
    // hand path in the bomb's frame (mouth faces -z): up from below, in through the fangs to the throat, grip, rip it out, drop away
    const reach=smooth(clamp(p/.22,0,1)),inn=smooth(clamp((p-.2)/.18,0,1)),yank=smooth(clamp((p-.5)/.2,0,1)),away=smooth(clamp((p-.74)/.26,0,1));
    _zbH.set(.03*(1-reach)+.04*away,-.22*(1-reach)-.2*away,-.3*(1-reach)-.09*(1-inn)-.14*yank-.12*away);
    if(p>.38&&p<.5)_zbH.z+=Math.sin((p-.38)/.12*Math.PI*3)*.006;
    if(L){L.position.set(sp[0]+_zbH.x,sp[1]+_zbH.y,sp[2]+_zbH.z)}
    if(pin){const g=p>.46?1:0;pin.position.x+=g*_zbH.x;pin.position.y+=g*_zbH.y;pin.position.z+=g*_zbH.z;pin.rotation.x=away*1.4;pin.visible=p<.97}
    // the bomb is held up to meet the hand, jerks as the pin comes free, gags
    const grab=Math.sin(clamp((p-.3)/.2,0,1)*Math.PI),jerk=p>.5&&p<.64?Math.sin((p-.5)/.14*Math.PI):0,hold=reach*(1-away);
    o[0]-=.02*hold;o[1]+=.02*hold+jerk*.015;o[4]-=.12*hold;o[3]+=grab*.05-jerk*.1;o[5]+=jerk*.12;
    if(p>.5&&!vm.pinOut){vm.pinOut=true;vm.sp.rx.v+=1.4;vm.sp.pz.v+=.25}
    if(P.t>=P.d+.15)vm.pull=null}
  else if(pin)pin.visible=!vm.pinOut;
  if(L)L.visible=show;
  // armed and held: raised a little, trembling, eyes on you
  if(a.bSt===2&&!vm.pull){const tr=Math.sin(vm.t*47)*.004+Math.sin(vm.t*31)*.003;o[1]+=.025+tr;o[0]+=tr*.6;o[3]-=.12;o[5]+=Math.sin(vm.t*39)*.03}};

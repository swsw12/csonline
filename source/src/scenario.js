'use strict';
// ============ Zombie Scenario (co-op PvE): 5 stages × 3 waves, a giant at the end ============
// Humans stay human. Zombies are NPCs drawn from a fixed pool of actors (POOL slots + 1 boss slot) created with the match, so the
// network roster never changes: a zombie "spawns" by being revived at a spawn point and stays down when killed.
// Host-authoritative: the host runs the stage flow, spawns, AI, the boss and all damage to humans; clients get compact zombie
// state in the snapshot (near ones every tick, far ones every third) plus a few reliable events (stage, wave, rewards, blasts).
const SCEN={POOL:30,STAGES:5,WAVES:3,on:false,stage:1,wave:0,ph:'',t:0,lives:3,queue:[],spawnT:0,remain:0,total:0,boss:null,bossId:-1,acid:[],tq:[],
  H:[],Z:[],pickOpen:false,picked:false,offer:null,best:0,win:false,chkT:0,PH:['prep','wave','break','fail','over']};
// the horde walks a little slower than infection-mode zombies: there are many more of them
SCEN.SPD={rager:.84,runner:.88,brute:.9,scream:.84,coffin:.86,bomber:.86,spitter:.9,boss:1};
const SC_DIFF={hp:[.6,.85,1.1,1.4],n:[.7,.85,1,1.2],dmg:[.5,.75,1,1.3]};
const scHumans=()=>SCEN.H,scPool=()=>SCEN.Z;
Object.assign(STR.ko,{scen:'좀비 시나리오',scenD:'협동 PvE — 감염 없이 끝까지 인간으로 싸운다. 스테이지 5개 × 웨이브 3번, 마지막엔 거대 좀비. 팀 목숨 3개: 전멸하면 그 스테이지를 다시 하고, 다 쓰면 게임 오버. 죽어도 다음 웨이브에 부활.',scDead:'다음 웨이브에 부활 — 관전 중',allies:'아군 봇'});
Object.assign(STR.en,{scen:'Zombie Scenario',scenD:'Co-op PvE — no infection, you stay human. 5 stages × 3 waves, a giant at the end. 3 shared lives: a wipe replays the stage, losing them all ends the run. The fallen come back at the next wave.',scDead:'Back at the next wave — spectating',allies:'Ally bots'});
SCEN.later=(t,f)=>SCEN.tq.push({t,f});
// ---------- match setup ----------
// every page runs this with the same roster: the pool waits dead and out of sight
SCEN.initPool=function(){SCEN.H=G.actors.filter(a=>!a.scen);SCEN.Z=G.actors.filter(a=>a.scen);SCEN.on=true;SCEN.stage=1;SCEN.wave=0;SCEN.lives=3;SCEN.ph='prep';SCEN.t=20;SCEN.acid.length=0;SCEN.tq=[];SCEN.bossId=-1;SCEN.remain=0;
  for(const a of SCEN.Z){a.team=TZ;a.zc=a.zpick=a.boss?'boss':'rager';a.alive=false;a.permaDead=true;a.hp=0;a.maxHp=1;a.deadT=99;a.an.dead=0;a.host=false;a.lvl=1;a.bombs=0;a.money=0;
    a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0};a.ammo={};a.cur='claw';a.name=ZCLASS[a.zc].n[LI()];a.c.x=0;a.c.y=-60;a.c.z=0;setHull(a)}
  // paint every zombie skin now rather than when the first one of a kind walks in mid-wave
  for(const k of ZALL)charAsset('z_'+k)};
SCEN.begin=function(){SCEN.on=true;SCEN.stage=1;SCEN.lives=3;SCEN.best=0;SCEN.win=false;SCEN.tq=[];G.recDone=false;for(const a of G.actors)a.wup={};SCEN.stageStart('fresh')};
// ---------- stage flow (host / solo) ----------
// kind: 'fresh' (first stage), 'next' (after a clear), 'retry' (after a wipe)
SCEN.stageStart=function(kind,plan){if(NET.cli&&!plan)return;
  if(plan){SCEN.stage=plan.s;SCEN.lives=plan.l;kind=['fresh','next','retry'][plan.f]||'retry'}
  SCEN.on=true;SCEN.ph='prep';SCEN.t=20;SCEN.wave=0;SCEN.queue=[];SCEN.remain=0;SCEN.total=0;SCEN.boss=null;SCEN.bossId=-1;SCEN.tq=[];SCEN.closePick(false,true);
  G.st='prep';G.time=SCEN.t;G.spec=null;G.deathCam=0;G.winner=-1;G.beepAt=6;G.moralePts=0;G.moraleLvl=0;G.lastHuman=null;
  FX.clearLimbs();clearNades();NY.clear();SCEN.acid.length=0;for(const l of DL.list)if(l.flare)l.dead=true;
  for(const a of SCEN.Z){a.alive=false;a.permaDead=true;a.an.dead=0;a.deadT=99;a.hp=0;a.c.y=-60;a.reviving=0;a.frozen=0;a.skillT=0;a.boomT=0;a.nb=null;if(a.ch)a.ch.grp.scale.setScalar(a.boss?BOSS_S:1)}
  const sp=shuffle(MAP.spawns.slice());let k=0;const pm={},out=[];if(plan)for(const q of plan.P)pm[q[0]]=q;
  for(const a of SCEN.H){const q=pm[a.id],was=a.alive;a.team=TH;a.host=false;a.alive=true;a.permaDead=false;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.rootT=0;a.burnT=0;
    a.nb=null;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.an.dead=0;a.an.atk=0;a.pendingClaw=null;a.zoom=0;a.lvl=1;a.dmgRound=0;a.deadT=0;a.maxHp=100;
    if(kind==='fresh'){giveDefault(a);a.armor=0;a.hp=100}
    // survivors of a cleared stage keep their health and ammo (the supply drop tops them up); the fallen, bots and a replayed stage start full
    else{if(kind==='retry'||!was||a.bot){a.hp=100;for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}}a.cur=bestWeapon(a)}
    if(q)placeAt(a,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);else{const p=sp[k++%sp.length];placeAt(a,p[0],p[2]||0,p[1],p[3]!=null?p[3]+rr(-.4,.4):Math.PI+rr(-.6,.6))}
    ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;if(NET.host)out.push([a.id,r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw)]);
    if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)AI.onRound(a)
    // bots put spare money into their primary (they keep enough for armour and grenades)
    if(a.bot&&!NET.cli&&kind!=='fresh'){const id=a.inv[1];while(id&&a.money>=SCEN.upCost(a,id)+1500&&SCEN.upgrade(a,id,true)){}}}
  if(G.player&&MAP.spawnYaw!=null&&!plan)G.player.yaw=MAP.spawnYaw;
  FX.clearDecals();HUD.feedL=[];HUD.el.hFeed.innerHTML='';HUD.clearDmg();
  const L=LI(),fin=SCEN.stage===SCEN.STAGES,sn=(L?'STAGE ':'스테이지 ')+SCEN.stage+'/'+SCEN.STAGES+(fin?(L?' · FINAL':' · 최종'):'');
  if(kind==='next'){HUD.announce(L?'STAGE CLEAR!':'스테이지 클리어!','h',3);AU.play('stingH',{vol:.7});AU.muSet&&AU.muSet('win');SCEN.later(3.1,()=>{HUD.announce(sn,'w',2.5);AU.muSet&&AU.muSet('prep')})}
  else{HUD.announce(kind==='retry'?(L?'RETRY · ':'재도전 · ')+sn:sn,kind==='retry'?'z':'w',3);AU.play('siren',{vol:.5});AU.muSet&&AU.muSet('prep')}
  HUD.note(kind==='next'?(L?'Pick a supply box · buy weapons — next wave in 20 s':'보급 상자를 고르고 무기를 사 두세요 — 20초 뒤 시작'):(L?'Buy weapons — the horde comes in 20 s':'20초 뒤 좀비 무리가 몰려와요 — 무기를 사 두세요'),4);
  if(NET.host)netEv('scst',{s:SCEN.stage,l:SCEN.lives,f:['fresh','next','retry'].indexOf(kind),P:out})};
SCEN.waveStart=function(w){SCEN.wave=w;SCEN.ph='wave';SCEN.t=0;G.st='fight';G.time=0;SCEN.queue=SCEN.makeWave(SCEN.stage,w);SCEN.total=SCEN.queue.length;SCEN.spawnT=.6;SCEN.closePick(false);
  SCEN.reviveHumans();SCEN.waveFx(w);if(NET.host)netEv('scw',{w})};
SCEN.waveFx=function(w){const boss=SCEN.stage===SCEN.STAGES&&w===SCEN.WAVES,L=LI();
  HUD.announce(boss?(L?'THE GIANT IS COMING':'거대 좀비 출현'):(L?'WAVE ':'웨이브 ')+w+' / '+SCEN.WAVES,boss?'z':'w',2.5);AU.play(boss?'stingZ':'siren',{vol:.6});AU.muSet&&AU.muSet('fight')};
SCEN.waveClear=function(){for(const a of SCEN.H)a.money=Math.min(16000,a.money+500+SCEN.stage*100);
  if(SCEN.wave<SCEN.WAVES){SCEN.ph='break';SCEN.t=8;G.st='prep';G.time=SCEN.t;G.beepAt=6;SCEN.breakFx();if(NET.host)netEv('scwc',{})}
  else SCEN.stageClear()};
SCEN.breakFx=function(){HUD.announce(LI()?'WAVE CLEAR':'웨이브 클리어','h',2);AU.play('morale',{vol:.5});AU.muSet&&AU.muSet('prep')};
SCEN.stageClear=function(){SCEN.best=Math.max(SCEN.best,SCEN.stage);for(const a of SCEN.H)a.money=Math.min(16000,a.money+1500);
  if(SCEN.stage>=SCEN.STAGES){SCEN.finish(true);return}
  SCEN.stage++;SCEN.stageStart('next');
  SCEN.openPick();for(const a of SCEN.H)if(a.bot)SCEN.applyReward(a,rpick(SCEN.offerFor()),true);
  if(NET.host)netEv('scr',{s:SCEN.stage})};
SCEN.stageFail=function(){SCEN.lives--;SCEN.queue=[];
  if(SCEN.lives<=0){SCEN.finish(false);return}
  SCEN.ph='fail';SCEN.t=5;G.st='end';SCEN.failFx();if(NET.host)netEv('scf',{l:SCEN.lives})};
SCEN.failFx=function(){const L=LI();HUD.announce((L?'STAGE FAILED · lives left ':'스테이지 실패 · 남은 목숨 ')+SCEN.lives,'z',4);AU.play('stingZ',{vol:.7});AU.muSet&&AU.muSet('dead')};
SCEN.finish=function(win){SCEN.ph='over';SCEN.t=5;SCEN.win=win;G.st='end';G.endT=99;SCEN.closePick(false);const L=LI();
  HUD.announce(win?(L?'SCENARIO CLEAR!':'시나리오 클리어!'):(L?'GAME OVER':'게임 오버'),win?'h':'z',5);AU.play(win?'stingH':'stingZ',{vol:.8});AU.muSet&&AU.muSet(win?'win':'dead');
  if(NET.host)netEv('scend',{w:win?1:0,b:SCEN.best})};
// wave makeup: more and tougher zombies each stage; new kinds join as the stages go on; the last wave brings the giant
SCEN.makeWave=function(s,w){const H=SCEN.H.length,d=G.diff||0;let n=Math.round((4+1.5*s+1.5*w)*(.5+.25*H)*SC_DIFF.n[d]);
  const W=[['rager',60],['runner',22],['bomber',s>=2?14:0],['scream',s>=2?8:0],['spitter',s>=3?14:0],['brute',s>=3?10:0],['coffin',s>=4?8:0]].filter(e=>e[1]>0);
  const tot=W.reduce((t,e)=>t+e[1],0);const q=[];
  if(s===SCEN.STAGES&&w===SCEN.WAVES){q.push('boss');n=Math.round(n*.5)}
  for(let i=0;i<n;i++){let r=Math.random()*tot;for(const [k,p] of W){r-=p;if(r<=0){q.push(k);break}}}return q};
SCEN.hpFor=function(zc){const H=SCEN.H.length,d=G.diff||0;
  if(zc==='boss')return Math.round(8000*(.6+.4*H)*SC_DIFF.hp[d]);
  return Math.round(ZCLASS[zc].hp*.28*(1+.1*(H-1))*SC_DIFF.hp[d]*(1+.12*(SCEN.stage-1)+.05*(SCEN.wave-1)))};
// claw damage scale (base zombie damage is tuned for infection; here claws only wound)
SCEN.dmgMul=()=>.18*SC_DIFF.dmg[G.diff||0]*(1+.06*(SCEN.stage-1));
// ---------- spawning ----------
// a spawn point out of every human's sight and not too close; the big one needs room
SCEN.spawnPoint=function(big){const H=SCEN.H.filter(h=>h.alive);const pts=MAP.zspawns.length?MAP.zspawns:MAP.spawns;const ok=[];
  for(const p of pts){const x=p[0],z=p[1],y=p[2]||0;let md=1e9,seen=false;for(const h of H){const d=Math.hypot(x-h.c.x,z-h.c.z);md=Math.min(md,d);if(d<28&&losClear(h.c.x,h.c.y+1.6,h.c.z,x,y+1.2,z))seen=true}
    if(md<10||(seen&&md<30))continue;if(big&&!charFits({hw:.45,h:2.2},x,y+.05,z))continue;ok.push([x,y,z,md])}
  if(!ok.length){const p=zSpawnPoint();return [p[0]+rr(-1,1),p[2]||0,p[1]+rr(-1,1)]}
  ok.sort((a,b)=>a[3]-b[3]);const p=ok[Math.floor(Math.random()*Math.min(ok.length,4))];return [p[0]+rr(-.8,.8),p[1],p[2]+rr(-.8,.8)]};
// revive the longest-dead free slot of the pool as a zombie of class zc
SCEN.spawn=function(zc,at){const boss=zc==='boss';let a=null;for(const z of SCEN.Z)if(!z.alive&&!!z.boss===boss&&z.deadT>1.2&&(!a||z.deadT>a.deadT))a=z;if(!a)return null;
  const p=at||SCEN.spawnPoint(boss);const Z=ZCLASS[zc];
  if(!charFits({hw:Z.hw,h:Z.h},p[0],p[1]+.05,p[2])&&!boss)return null;
  a.zpick=zc;a.yaw=Math.random()*TAU;reviveZombie(a,p);return a};
SCEN.onRevive=function(a){if(!a.scen)return;a.zc=a.zpick;setHull(a);ensureRig(a);a.name=ZCLASS[a.zc].n[LI()];a.lvl=1;a.host=false;a.bombs=0;a.boomT=0;a.sb=null;a.reviving=0;a.turning=0;a.scSeen=G.t;a.spitT=rr(1,2);
  a.hitW=a.zc==='boss'?.85:0;a.spdMul=SCEN.SPD[a.zc]||.86;a.scHit=0;a.lastHurt=G.t;
  if(!NET.cli){a.maxHp=a.hp=SCEN.hpFor(a.zc);a.armor=a.zc==='boss'?0:Math.round(ZCLASS[a.zc].armor*.3);a.skillCD=rr(2,6)}
  if(a.zc==='boss'){SCEN.boss=a;SCEN.bossId=a.id;a.sb={pt:4,mode:'',mt:0,hit:false,sumT:0,half:false,lx:a.c.x,lz:a.c.z,stuck:0,far:0}}};
// ---------- per frame ----------
SCEN.update=function(dt){if(!SCEN.on)return;SCEN.updateAcid(dt);
  for(let i=SCEN.tq.length-1;i>=0;i--){const q=SCEN.tq[i];q.t-=dt;if(q.t<=0){SCEN.tq.splice(i,1);q.f()}}
  // corpses sink out of sight after a while (the pool reuses them)
  for(const a of SCEN.Z){if(!a.alive){if(a.an.dead>0&&a.deadT>14)a.an.dead=0;continue}
    // an armed bomber swells and shakes
    if(a.boomT>0){if(NET.cli)a.boomT=Math.max(0,a.boomT-dt);a.an.skill=Math.max(a.an.skill,.45);if(a.ch)a.ch.grp.scale.setScalar(1+.16*(1-a.boomT/.6)+Math.sin(G.t*55)*.02)}}
  const ph=SCEN.ph;
  if(ph==='prep'||ph==='break'){const s=Math.ceil(SCEN.t);if(s<G.beepAt&&s>=1){G.beepAt=s;AU.play(s<=3?'beep2':'beep',{vol:.5});HUD.countdown(s)}}
  if(NET.cli){if(ph==='wave')SCEN.t+=dt;else SCEN.t=Math.max(0,SCEN.t-dt);return}
  if(ph==='prep'){SCEN.t-=dt;G.time=SCEN.t;if(SCEN.t<=0)SCEN.waveStart(1)}
  else if(ph==='wave'){G.time+=dt;SCEN.t+=dt;
    let alive=0;for(const a of SCEN.Z)if(a.alive)alive++;
    SCEN.spawnT-=dt;if(SCEN.queue.length&&alive<SCEN.POOL&&SCEN.spawnT<=0){const zc=SCEN.queue[0];if(SCEN.spawn(zc)){SCEN.queue.shift();alive++}SCEN.spawnT=zc==='boss'?2:rr(.3,.65)}
    SCEN.remain=SCEN.queue.length+alive;SCEN.unstick(dt);
    if(humansAlive()===0)SCEN.stageFail();else if(SCEN.remain===0)SCEN.waveClear()}
  else if(ph==='break'){SCEN.t-=dt;G.time=SCEN.t;if(humansAlive()===0)SCEN.stageFail();else if(SCEN.t<=0)SCEN.waveStart(SCEN.wave+1)}
  else if(ph==='fail'){SCEN.t-=dt;G.time=SCEN.t;if(SCEN.t<=0)SCEN.stageStart('retry')}
  else if(ph==='over'){SCEN.t-=dt;if(SCEN.t<=0&&G.st!=='over'){G.st='over';UI.showResults();if(NET.host)netEv('over')}}
  for(const a of SCEN.Z)if(a.alive){if(a.zc==='bomber')SCEN.bomberTick(a,dt);else if(a.zc==='boss')SCEN.bossTick(a,dt)}};
// a zombie that has neither hurt anyone nor been hurt for a while (stuck under a ledge, lost) comes back in at a fresh spawn point
SCEN.unstick=function(dt){SCEN.chkT-=dt;if(SCEN.chkT>0)return;SCEN.chkT=2;
  for(const a of SCEN.Z){if(!a.alive)continue;const idle=G.t-Math.max(a.scSeen||0,a.scHit||0,a.lastHurt||0);
    if(idle>(a.zc==='boss'?30:22)||a.c.y<-30){a.scSeen=G.t;const p=SCEN.spawnPoint(a.zc==='boss');placeAt(a,p[0],p[1],p[2],a.yaw);if(a.bot)AI.onTeam(a)}}};
// ally bots stay with the team: they hold a spot a few metres around the leader (the player, or the first human still standing), facing out
SCEN.lead=a=>{const P=G.player;if(P&&P.alive&&!P.scen)return P;for(const h of SCEN.H)if(h.alive)return h;return null};
SCEN.spotNear=function(a){const L=SCEN.lead(a);if(!L||L===a||!a.bot)return false;const B=a.bot,i=SCEN.H.indexOf(a),ang=i*2.2+.6,r=2.6+(i%3)*.9;
  const n=navSnap(L.c.x+Math.cos(ang)*r,L.c.y,L.c.z+Math.sin(ang)*r,3)||navSnap(L.c.x,L.c.y,L.c.z,4);if(!n)return false;
  B.spot=[n.x+rr(-.2,.2),n.y,n.z+rr(-.2,.2)];B.camp={look:[n.x+Math.cos(ang)*12,n.y+1.5,n.z+Math.sin(ang)*12],p:[]};B.lead=L;B.leadAt=[L.c.x,L.c.z];B.path=null;B.repath=0;return true};
// ---------- humans come back at the start of each wave ----------
SCEN.reviveHumans=function(list){const live=SCEN.H.filter(h=>h.alive);const out=[];
  for(const a of SCEN.H){if(list){const q=list.find(e=>e[0]===a.id);if(q)SCEN.reviveOne(a,[q[1]/100,q[2]/100,q[3]/100]);continue}
    if(a.alive)continue;const buddy=live.length?rpick(live):null;let p;
    if(buddy){p=[buddy.c.x+rr(-1,1),buddy.c.y+.1,buddy.c.z+rr(-1,1)];if(!charFits(a.c,p[0],p[1],p[2]))p=[buddy.c.x,buddy.c.y+.1,buddy.c.z]}else{const s=rpick(MAP.spawns);p=[s[0],s[2]||0,s[1]]}
    SCEN.reviveOne(a,p);out.push([a.id,r2(p[0]),r2(p[1]),r2(p[2])])}
  if(NET.host&&out.length)netEv('scrh',{P:out})};
SCEN.reviveOne=function(a,p){a.alive=true;a.permaDead=false;a.hp=100;a.an.dead=0;a.reviving=0;a.frozen=0;a.rootT=0;a.dizzy=0;a.deadT=0;a.nb=null;
  placeAt(a,p[0],p[1],p[2],a.yaw);ensureRig(a);for(const id in a.ammo){const W=WPN[id];if(W&&a.ammo[id].mag+a.ammo[id].res<W.mag)a.ammo[id].res=W.mag}equip(a,bestWeapon(a),true);a.drawT=0;
  if(a.isPlayer){G.spec=null;G.deathCam=0;VM.set(a.cur,a.skin);HUD.note(LI()?'Back in the fight':'다시 전투에 합류',2)}if(a.bot)AI.onTeam(a);
  for(let i=0;i<12;i++)FX.spawn({x:a.c.x+rr(-.3,.3),y:a.c.y+rr(.2,1.8),z:a.c.z+rr(-.3,.3),vy:rr(.5,1.2),life:rr(.4,.8),s0:.1,s1:.03,r:.5,g:.8,b:1,f:8,add:1})};
// ---------- bomber: arms itself next to a human, swells, bursts ----------
SCEN.bomberTick=function(a,dt){if(a.boomT>0){a.boomT-=dt;if(Math.random()<dt*20)FX.spawn({x:a.c.x+rr(-.3,.3),y:a.c.y+rr(.6,1.6),z:a.c.z+rr(-.3,.3),vy:rr(.5,1),life:.3,s0:.12,s1:.05,r:.6,g:1,b:.3,f:8,add:1});
    if(a.boomT<=0)SCEN.bomberBlow(a,1);return}
  for(const h of SCEN.H){if(!h.alive)continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<2.1&&Math.abs(h.c.y-a.c.y)<1.6){SCEN.bomberArm(a);if(NET.host)netEv('scba',{i:a.id});break}}};
SCEN.bomberArm=function(a){a.boomT=.6;AU.at('beep2',a.c.x,a.c.y+1.2,a.c.z,{vol:1,range:25,rate:1.5});AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:1,range:30,rate:.8})};
SCEN.bomberBlow=function(a,full){if(!a||a.scBlown)return;a.scBlown=true;const x=a.c.x,y=a.c.y+1,z=a.c.z;if(a.alive)killZombie(a,null,{w:'zbomb',he:1,dir:[0,1,0]});SCEN.blast(x,y,z,4.5,full?55:30,a);if(NET.host)netEv('scb',{x:r2(x),y:r2(y),z:r2(z)})};
// explosion that hurts humans: the host applies the damage; every page pushes its own player
SCEN.blast=function(x,y,z,r,dmg,src,fxOnly){FX.explode(x,y,z,'he');FX.spore(x,y,z);AU.at('explode',x,y,z,{vol:.9,range:80,occ:false,rate:1.2});
  const P=G.player;if(P){const pd=Math.hypot(P.c.x-x,P.c.y-y,P.c.z-z);if(pd<12)FX.shake=Math.max(FX.shake,.8-pd/16)}
  for(const t of SCEN.H){if(!t.alive)continue;const dx=t.c.x-x,dz=t.c.z-z,dy=t.c.y+1-y,d=Math.hypot(dx,dy,dz);if(d>r)continue;if(!losClear(x,y,z,t.c.x,t.c.y+1,t.c.z))continue;
    const f=1-d/r,h=Math.hypot(dx,dz)||1;if(t.isPlayer||!t.pup){t.kvx+=dx/h*9*f;t.kvz+=dz/h*9*f;t.c.vy=Math.max(t.c.vy,3+4*f);t.c.onGround=false;t.c.jumped=true}
    if(!fxOnly&&!NET.cli)hurtHuman(t,(dmg*f+8)*SCEN.dmgMul()/.18,src,{})}};
// ---------- spitter: keeps its distance and lobs acid ----------
SCEN.spitAI=function(a,dt){const B=a.bot;const t=B&&B.target;if(!t||!t.alive)return;const dx=t.c.x-a.c.x,dz=t.c.z-a.c.z,d=Math.hypot(dx,dz);
  const e=actorEye(a);const see=d<18&&losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.4,t.c.z);if(!see)return;
  // stop and face the target when in range; back off when it gets close
  if(d<15){a.cmd.f=d<6?-1:0;a.cmd.s=Math.sin(G.t*1.3+a.id)>.6?1:0;a.cmd.fire=a.cmd.alt=false;AI.turnTo(a,Math.atan2(-dx,-dz),0,dt,6)}
  a.spitT-=dt;if(a.spitT<=0&&d>3&&d<17){a.spitT=rr(2.8,4);SCEN.spit(a,t)}};
SCEN.spit=function(a,t){const e=actorEye(a);const tx=t.c.x+t.c.vx*.35,tz=t.c.z+t.c.vz*.35,ty=t.c.y+1.1;const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz)||1,sp=15,T=d/sp;
  const v=[dx/d*sp,(ty-e.y)/T+.5*12*T,dz/d*sp];a.an.skill=.55;AU.at('zatk',e.x,e.y,e.z,{vol:.8,range:30,rate:1.4});
  SCEN.acidAdd(e.x,e.y-.1,e.z,v,a,false);if(NET.host)netEv('sca',{i:a.id,x:r2(e.x),y:r2(e.y-.1),z:r2(e.z),v:v.map(r2)})};
SCEN.acidAdd=function(x,y,z,v,owner,ghost){SCEN.acid.push({x,y,z,vx:v[0],vy:v[1],vz:v[2],t:0,owner,ghost})};
SCEN.updateAcid=function(dt){const L=SCEN.acid;for(let i=L.length-1;i>=0;i--){const n=L[i];n.t+=dt;n.vy-=12*dt;const d=Math.hypot(n.vx,n.vy,n.vz)*dt;let hit=false;
    const r=d>1e-5?rayCast(n.x,n.y,n.z,n.vx*dt/d,n.vy*dt/d,n.vz*dt/d,d,SHOT_FILTER):null;if(r){const k=r.t/d;n.x+=n.vx*dt*k;n.y+=n.vy*dt*k;n.z+=n.vz*dt*k;hit=true}else{n.x+=n.vx*dt;n.y+=n.vy*dt;n.z+=n.vz*dt}
    let victim=null;if(!hit)for(const h of SCEN.H){if(!h.alive)continue;if(Math.abs(h.c.x-n.x)<h.c.hw+.15&&Math.abs(h.c.z-n.z)<h.c.hw+.15&&n.y>h.c.y&&n.y<h.c.y+h.c.h+.1){victim=h;hit=true;break}}
    if(Math.random()<.8)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.3,.3),vy:rr(-.3,.3),vz:rr(-.3,.3),life:rr(.25,.45),s0:.12,s1:.04,r:.55,g:1,b:.2,f:8,add:1});
    if(hit||n.t>4){L.splice(i,1);
      for(let k=0;k<16;k++)FX.spawn({x:n.x,y:n.y+.1,z:n.z,vx:rr(-2,2),vy:rr(.5,3),vz:rr(-2,2),life:rr(.4,.8),s0:.1,s1:.05,r:.45,g:.9,b:.15,f:4,grav:9,col:.2});
      FX.spawn({x:n.x,y:n.y+.05,z:n.z,life:1.2,s0:.6,s1:1.6,r:.4,g:.8,b:.1,a:.5,f:2,drag:1});AU.at('bounce',n.x,n.y,n.z,{vol:.5,range:20,rate:.6});
      if(!n.ghost&&!NET.cli)for(const h of SCEN.H){if(!h.alive)continue;const dd=Math.hypot(h.c.x-n.x,h.c.y+.9-n.y,h.c.z-n.z);if(h===victim||dd<1.5){if(n.owner)n.owner.scHit=G.t;hurtHuman(h,(h===victim?20:10)*SCEN.dmgMul()/.18,n.owner,{})}}}}};
// ---------- the giant: charges, slams the ground, calls the horde when hurt ----------
SCEN.bossTick=function(a,dt){const S=a.sb;if(!S)return;const c=a.c;a.staggerT=0;
  // unstick: a body this big can wedge itself in a doorway — it jumps at its target
  S.stuck+=dt;if(S.stuck>4){const mv=Math.hypot(c.x-S.lx,c.z-S.lz);if(mv<.8&&a.bot&&a.bot.target&&c.onGround){const t=a.bot.target;const dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1;c.vy=9;c.onGround=false;c.jumped=true;a.kvx+=dx/d*7;a.kvz+=dz/d*7}S.stuck=0;S.lx=c.x;S.lz=c.z}
  if(!S.half&&a.hp<a.maxHp*.5){S.half=true;S.sumT=0;HUD.announce(LI()?'The giant calls the horde!':'거대 좀비가 무리를 부른다!','z',2.5);if(NET.host)netEv('scbh',{})}
  if(S.half){S.sumT-=dt;if(S.sumT<=0){S.sumT=24;SCEN.bossSummon(a)}}
  const tg=a.bot&&a.bot.target;if(tg&&tg.alive&&Math.hypot(tg.c.x-c.x,tg.c.z-c.z)>3.2)S.far+=dt;else S.far=0;
  if(S.mode){S.mt-=dt;
    if(S.mode==='leapW'){a.an.skill=Math.max(a.an.skill,.6);if(S.mt<=0){S.mode='leap';S.mt=3;const t=a.bot&&a.bot.target;if(t)SCEN.leapTo(a,t.c.x,t.c.y,t.c.z,2);AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:90,rate:.8})}}
    else if(S.mode==='leap'){if(!a.leapV||S.mt<=0){S.mode='';S.pt=rr(2.5,4);S.far=0;SCEN.slam(a)}}
    else if(S.mode==='dashW'){if(S.mt<=0){S.mode='dash';S.mt=1.1;S.hit=false;AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:80})}}
    else if(S.mode==='dash'){a.kvx=S.dx*15;a.kvz=S.dz*15;a.yaw=Math.atan2(-S.dx,-S.dz);
      if(Math.random()<dt*30)FX.spawn({x:c.x+rr(-.6,.6),y:c.y+.1,z:c.z+rr(-.6,.6),vy:rr(.3,.9),life:rr(.5,.9),s0:.3,s1:1,r:.4,g:.36,b:.3,a:.5,f:2,drag:2});
      if(!S.hit)for(const h of SCEN.H){if(!h.alive)continue;if(Math.hypot(h.c.x-c.x,h.c.z-c.z)<c.hw+1&&Math.abs(h.c.y-c.y)<3){S.hit=true;SCEN.pushHuman(h,S.dx*13,7,S.dz*13);hurtHuman(h,30*SCEN.dmgMul()/.18,a,{claw:1});break}}
      if(S.mt<=0){S.mode='';a.kvx*=.2;a.kvz*=.2;S.pt=rr(3,5)}}
    else if(S.mode==='slamW'){a.an.skill=Math.max(a.an.skill,.3);if(S.mt<=0){S.mode='';S.pt=rr(3.5,5.5);SCEN.slam(a)}}
    return}
  S.pt-=dt;const t=a.bot&&a.bot.target;if(S.pt>0||!t||!t.alive)return;const dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1;if(d>22)return;
  const hy=c.y+4.2,see=losClear(c.x,hy,c.z,t.c.x,t.c.y+1.4,t.c.z);
  // out of reach (up on something, or the way round is blocked): one huge leap onto it
  if(see&&c.onGround&&(S.far>5&&t.c.y>c.y+1.1||S.far>9)&&d<20&&losClear(c.x,hy,c.z,t.c.x,Math.max(hy,t.c.y+3),t.c.z)){S.mode='leapW';S.mt=.75;a.an.skill=1;a.yaw=Math.atan2(-dx,-dz);AU.at('zgrowl',c.x,c.y+3,c.z,{vol:1,range:70,rate:.5});if(NET.host)netEv('scbo',{k:1,i:a.id});return}
  if(!see){S.pt=.5;return}
  if(d>6&&Math.random()<.6){S.mode='dashW';S.mt=.7;S.dx=dx/d;S.dz=dz/d;a.yaw=Math.atan2(-dx,-dz);a.an.skill=.7;AU.at('zgrowl',c.x,c.y+3,c.z,{vol:1,range:60,rate:.6});if(NET.host)netEv('scbo',{k:0,i:a.id})}
  else if(d<8){S.mode='slamW';S.mt=.85;a.an.skill=1;AU.at('zroar',c.x,c.y+3,c.z,{vol:1,range:80,rate:.7});if(NET.host)netEv('scbo',{k:1,i:a.id})}
  else S.pt=1};
SCEN.slam=function(a){const c=a.c;SCEN.slamFx(c.x,c.y,c.z);if(NET.host)netEv('scsl',{x:r2(c.x),y:r2(c.y),z:r2(c.z)});
  for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>7.5||Math.abs(h.c.y-c.y)>2.5)continue;const f=1-d/7.5;
    SCEN.pushHuman(h,dx/(d||1)*10*f,4+5*f,dz/(d||1)*10*f);hurtHuman(h,(10+30*f)*SCEN.dmgMul()/.18,a,{})}};
SCEN.slamFx=function(x,y,z){for(let i=0;i<40;i++){const g=i/40*TAU;FX.spawn({x:x+Math.cos(g)*1.2,y:y+.15,z:z+Math.sin(g)*1.2,vx:Math.cos(g)*rr(5,9),vy:rr(.5,2),vz:Math.sin(g)*rr(5,9),life:rr(.6,1.1),s0:.4,s1:1.4,r:.45,g:.4,b:.34,a:.55,f:2,drag:2.5})}
  AU.at('explode',x,y+.5,z,{vol:.8,range:80,occ:false,rate:.6});const P=G.player;if(P){const pd=Math.hypot(P.c.x-x,P.c.z-z);if(pd<20)FX.shake=Math.max(FX.shake,1-pd/20)}};
SCEN.bossSummon=function(a){let n=0;for(let i=0;i<4;i++){const g=i/4*TAU+Math.random();const p=[a.c.x+Math.cos(g)*3,a.c.y+.1,a.c.z+Math.sin(g)*3];if(SCEN.spawn(Math.random()<.6?'rager':'runner',p))n++}
  if(n){AU.at('zroar',a.c.x,a.c.y+3,a.c.z,{vol:1,range:90});SCEN.slamFx(a.c.x,a.c.y,a.c.z);if(NET.host)netEv('scsl',{x:r2(a.c.x),y:r2(a.c.y),z:r2(a.c.z)})}};
// a ballistic leap onto a target standing somewhere the body cannot walk to (crates, roofs): apex a little above the higher end
SCEN.leapTo=function(a,x,y,z,over){const c=a.c,G0=GRAV;const apex=Math.max(c.y,y)+(over||1.2);const vy=Math.sqrt(2*G0*Math.max(.5,apex-c.y));
  const T=vy/G0+Math.sqrt(2*Math.max(.1,apex-y)/G0);a.leapV={x:(x-c.x)/T,z:(z-c.z)/T,t:0};c.vy=vy;c.onGround=false;c.jumped=true;a.yaw=Math.atan2(-(x-c.x),-(z-c.z))};
SCEN.leapStep=function(a,dt){const L=a.leapV;if(!L)return false;L.t+=dt;if((a.c.onGround&&L.t>.15)||L.t>3){a.leapV=null;a.kvx*=.2;a.kvz*=.2;return false}a.kvx=L.x;a.kvz=L.z;a.mvx=a.mvz=0;a.cmd.f=a.cmd.s=0;a.cmd.jump=false;return true};
// knockback: local bodies directly; a remote player gets it through an event its own page applies
SCEN.pushHuman=function(h,vx,vy,vz){if(h.net&&NET.host&&!h.isPlayer){netEv('scp',{i:h.id,v:[r2(vx),r2(vy),r2(vz)]});return}h.kvx+=vx;h.kvz+=vz;h.c.vy=Math.max(h.c.vy,vy);h.c.onGround=false;h.c.jumped=true};
// ---------- rewards: three supply boxes, take one ----------
SCEN.REW={ammo:{n:['탄약 가득','Full ammo'],d:['모든 무기 탄약 최대 + 수류탄','Every gun fully loaded + grenades'],ic:'▤'},heal:{n:['체력 회복','Heal'],d:['체력 100 + 방탄 50','100 HP and 50 armour'],ic:'✚'},
  armor:{n:['방탄복','Kevlar'],d:['방탄 100','100 armour'],ic:'◆'},weapon:{n:['랜덤 무기','Random gun'],d:['주무기 하나를 받음 (탄약 가득)','A random primary, fully loaded'],ic:'✦'}};
SCEN.offerFor=()=>shuffle(Object.keys(SCEN.REW)).slice(0,3);
SCEN.GUNS=['hmg','mg6','gx6','ar7','kv47','g35','br3','ar5c','hr17','as12','m14','sg8','volc','xbow','gaebolg','mdrill','xdz'];
SCEN.applyReward=function(a,k,host){if(!a||!a.alive)return;
  if(k==='ammo'){for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}for(const g of ['he','frost'])a.inv[g]=Math.max(a.inv[g]||0,1)}
  else if(k==='weapon'){const pool=SCEN.GUNS.filter(id=>WPN[id]&&WPN[id].slot===1&&id!==a.inv[1]);if(!pool.length)return;const id=rpick(pool);a.inv[1]=id;fillAmmo(a,id);equip(a,id);if(a.isPlayer)HUD.note((LI()?'Got: ':'획득: ')+WPN[id].n[LI()],2.5)}
  if(k==='heal'||k==='armor'){if(NET.cli&&!host){netToHost({t:'scrw',k});return}if(k==='heal'){a.hp=100;a.armor=Math.max(a.armor,50)}else a.armor=100}};
// weapon upgrade: +10% damage per level on the gun in hand (the primary otherwise), up to 5 levels
SCEN.upTarget=P=>{if(!P)return null;const W=WPN[P.cur];return W&&W.dmg&&W.kind!=='nade'&&W.kind!=='claw'?P.cur:P.inv[1]||P.inv[2]||null};
SCEN.upCost=(a,id)=>{const l=(a&&a.wup&&a.wup[id])||0;return l>=5?0:1000*(l+1)};
SCEN.upgrade=function(a,id,host){if(!a||!id||!WPN[id])return false;a.wup=a.wup||{};const l=a.wup[id]||0;if(l>=5)return false;const cost=1000*(l+1);
  if(NET.cli&&!host){if(a.money<cost)return false;netToHost({t:'scu',w:id});return true}
  if(a.money<cost)return false;a.money-=cost;a.wup[id]=l+1;return true};
SCEN.openPick=function(){const P=G.player;if(!P||!P.alive||P.bot)return;SCEN.offer=SCEN.offerFor();SCEN.picked=false;SCEN.pickOpen=true;SCEN.renderPick();$('scPick').classList.remove('off');
  if(Main.overlay&&Main.overlay!=='scpick')Main.closeOverlay(true);Main.overlay='scpick';Main.unlock()};
// closing without a choice (✕, Esc, or the wave starting) takes a box at random: the drop is never lost.
// gesture: closed by the player's own click / key, so the mouse can be captured again right away
SCEN.closePick=function(gesture,reset){const was=SCEN.pickOpen;SCEN.pickOpen=false;const el=$('scPick');if(el)el.classList.add('off');const P=G.player;
  if(was&&!reset&&!SCEN.picked&&SCEN.offer&&P&&P.alive&&G.mode==='scen'){const k=rpick(SCEN.offer);SCEN.picked=k;SCEN.applyReward(P,k);HUD.note((LI()?'Supply box (random): ':'보급 상자 자동 선택: ')+SCEN.REW[k].n[LI()],2.5)}
  if(Main.overlay==='scpick'){Main.overlay=null;if(gesture&&!Main.paused&&G.st!=='menu')Main.lock();else if(was&&!(typeof TOUCH!=='undefined'&&TOUCH.on)&&!Main.locked)HUD.note(LI()?'Click to keep playing':'클릭하면 계속',3)}};
SCEN.renderPick=function(){const el=$('scPick');const P=G.player;if(!el||!P)return;const L=LI();
  el.innerHTML=`<div class="dpHead"><b>${L?'Supply drop':'보급 상자'}</b><span>${L?'Pick one (closing picks at random)':'하나를 고르세요 (닫으면 무작위)'} · <em class="tm"></em></span><button class="x" data-act="scclose">✕</button></div>
    <div class="scBoxes">${SCEN.offer.map((k,i)=>{const R0=SCEN.REW[k];return `<div class="scBox${SCEN.picked?(SCEN.picked===k?' on':' na'):''}" data-act="scpick" data-v="${k}"><div class="lid"></div><span class="no">${i+1}</span><b class="ic">${R0.ic}</b><b>${R0.n[L]}</b><small>${R0.d[L]}</small></div>`}).join('')}</div>
    <div class="scUp"></div>`;
  SCEN.renderUp();SCEN.pickTick()};
SCEN.renderUp=function(){const el=document.querySelector('#scPick .scUp'),P=G.player;if(!el||!P)return;const L=LI(),id=SCEN.upTarget(P),W=id&&WPN[id];
  if(!W){el.innerHTML=`<span>${L?'Hold a gun to upgrade it':'총을 들고 있으면 강화할 수 있어요'}</span>`;el.dataset.k='';return}
  const lv=(P.wup&&P.wup[id])||0,cost=SCEN.upCost(P,id),k=[id,lv,P.money>=cost].join();if(el.dataset.k===k)return;el.dataset.k=k;
  el.innerHTML=`<span>${L?'Upgrade':'무기 강화'} · <b>${W.n[L]}</b> Lv.${lv} → ${lv<5?lv+1:'MAX'} <small>(${L?'damage':'공격력'} +${Math.min(5,lv+1)*10}%)</small></span><button data-act="scup"${lv>=5||P.money<cost?' disabled':''}>${lv>=5?'MAX':'$'+cost}</button>`};
// the panel is built once; only the clock and the upgrade row change while it is open (a rebuild would eat taps)
SCEN.pickTick=function(){const t=document.querySelector('#scPick .tm');if(t){const s=Math.max(0,Math.ceil(SCEN.ph==='prep'?SCEN.t:0))+(LI()?'s':'초');if(t.textContent!==s)t.textContent=s}SCEN.renderUp()};
// ---------- HUD ----------
SCEN.hud=function(){const el=$('hScen');if(!el)return;const on=G.mode==='scen'&&G.st!=='menu'&&!!G.player;const ds=on?'block':'none';if(el.style.display!==ds)el.style.display=ds;HUD.el.hud.classList.toggle('scen',on);if(!on)return;const L=LI();
  const s=`${L?'STAGE':'스테이지'} <b>${SCEN.stage}/${SCEN.STAGES}</b> · ${L?'WAVE':'웨이브'} <b>${Math.max(1,SCEN.wave)}/${SCEN.WAVES}</b> · ${L?'LEFT':'남은 좀비'} <b class="z">${SCEN.ph==='wave'?SCEN.remain:'-'}</b> · <span class="sclv">${SC_HEART.repeat(Math.max(0,SCEN.lives))}<i>${SC_HEART.repeat(Math.max(0,3-SCEN.lives))}</i></span>`;
  if(el.dataset.s!==s){el.dataset.s=s;el.querySelector('.ln').innerHTML=s}
  const b=SCEN.bossId>=0?byIdAny(SCEN.bossId):null,bar=el.querySelector('.boss');const bon=!!(b&&b.alive&&b.zc==='boss');if(bar.style.display!==(bon?'block':'none'))bar.style.display=bon?'block':'none';if(bon)bar.querySelector('u').style.width=Math.max(0,b.hp/b.maxHp*100).toFixed(1)+'%';
  // the wave clock counts up: never the red "time is running out" blink
  if(SCEN.ph==='wave'&&HUD.el.hTime.className)HUD.el.hTime.className='';
  const P=G.player,wn=HUD.el.hWName,lv=P.wup&&P.wup[P.cur];if(lv&&P.alive&&P.team===TH&&!wn.textContent.endsWith(' +'+lv))wn.textContent+=' +'+lv;
  if(SCEN.pickOpen&&!AU.throttle('scpk',250))SCEN.pickTick()};
const SC_HEART='<svg viewBox="0 0 10 9"><path d="M5 9 .7 4.7A2.6 2.6 0 0 1 5 1.5a2.6 2.6 0 0 1 4.3 3.2z"/></svg>';
function byIdAny(id){for(const a of G.actors)if(a.id===id)return a;return null}
// ---------- network ----------
// compact zombie state: [id, x, y, z, vx, vz, yaw, hp, maxHp, class (+16 airborne)]; near zombies every tick, far ones every third
SCEN.encZ=function(k){const out=[];
  for(const a of SCEN.Z){if(!a.alive)continue;let near=false;for(const h of SCEN.H)if(h.alive&&Math.abs(h.c.x-a.c.x)+Math.abs(h.c.z-a.c.z)<34){near=true;break}if(!near&&(k+a.id)%3)continue;
    const c=a.c;out.push([a.id,r2(c.x),r2(c.y),r2(c.z),r1(c.vx),r1(c.vz),r2(a.yaw),Math.ceil(a.hp),Math.round(a.maxHp),ZALL.indexOf(a.zc)|(c.onGround?0:16)])}return out};
SCEN.decZ=function(Z,ts){for(const e of Z){const a=byId(e[0]);if(!a||!a.scen)continue;const zc=ZALL[e[9]&15]||'rager';
    if(zc!==a.zc){a.zc=a.zpick=zc;setHull(a);ensureRig(a);a.name=ZCLASS[zc].n[LI()]}
    if(!a.alive)continue;netSample(a,ts,e[1]/100,e[2]/100,e[3]/100,e[4]/10,e[5]/10,e[6]/100,0,3|((e[9]&16)?0:8),WI.claw);a.nsrc='h';a.hp=e[7];a.maxHp=e[8]}};
SCEN.encState=()=>[SCEN.stage,SCEN.wave,SCEN.PH.indexOf(SCEN.ph),Math.round(SCEN.t*10),SCEN.lives,SCEN.remain,SCEN.bossId];
SCEN.decState=function(s){if(!Array.isArray(s))return;SCEN.on=true;SCEN.stage=s[0];SCEN.wave=s[1];SCEN.ph=SCEN.PH[s[2]]||SCEN.ph;SCEN.t=s[3]/10;SCEN.lives=s[4];SCEN.remain=s[5];SCEN.bossId=s[6];
  if(G.st!=='over'&&G.st!=='menu'){const st=SCEN.ph==='wave'?'fight':SCEN.ph==='fail'||SCEN.ph==='over'?'end':'prep';if(G.st!==st)G.st=st}};
// ---------- hooks into the game ----------
(function(){
  // claws only wound in the scenario
  const ca=clawApply;clawApply=function(a,t,heavy){if(G.mode!=='scen')return ca(a,t,heavy);const Z=ZCLASS[a.zc];aimDir(a.yaw,0,_dv);const kb=(heavy?4:2)*(a.zc==='boss'?3:1);
    if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}a.scHit=G.t;hurtHuman(t,Z.dmg*(heavy?1.6:1)*SCEN.dmgMul(),a,{claw:1})};
  const kz=killZombie;killZombie=function(t,src,o){const was=t.alive;kz(t,src,o);if(G.mode!=='scen'||!t.scen)return;t.permaDead=true;t.respawnT=1e9;t.reviveT=1e9;
    if(t.ch)t.ch.grp.scale.setScalar(t.zc==='boss'?BOSS_S:1);
    if(was&&t.zc==='bomber'&&!NET.cli&&!t.scBlown)SCEN.bomberBlow(t,0);if(t===SCEN.boss)SCEN.boss=null};
  const rz=reviveZombie;reviveZombie=function(a,at){if(a.scen)a.scBlown=false;rz(a,at);if(G.mode==='scen')SCEN.onRevive(a)};
  const er=ensureRig;ensureRig=function(a){er(a);if(a.ch)a.ch.grp.scale.setScalar(a.team===TZ&&a.zc==='boss'?BOSS_S:1)};
  const pc=AI.pickCamp.bind(AI);AI.pickCamp=function(a){pc(a);if(G.mode==='scen')SCEN.spotNear(a)};
  const au=AI.update.bind(AI);AI.update=function(a,dt){
    if(G.mode==='scen'&&a.alive&&a.team===TH&&a.bot){const B=a.bot;B.regT=(B.regT||0)-dt;if(B.regT<=0){B.regT=1.5;const L=SCEN.lead(a);
      if(L&&L!==a&&(B.lead!==L||!B.leadAt||Math.hypot(L.c.x-B.leadAt[0],L.c.z-B.leadAt[1])>7))SCEN.spotNear(a)}}
    au(a,dt);if(G.mode!=='scen'||!a.alive||a.team!==TZ)return;
    if(SCEN.leapStep(a,dt))return;
    if(a.zc!=='boss'&&a.c.onGround){const B=a.bot,t=B.target;let k=false;if(t&&t.alive&&!B.path){const dy=t.c.y-a.c.y,dh=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);k=dy>1.2&&dy<4.6&&dh<7.5}
      if(k){B.climbT=(B.climbT||0)+dt;if(B.climbT>1.2&&losClear(a.c.x,a.c.y+1.6,a.c.z,t.c.x,t.c.y+1.4,t.c.z)){B.climbT=0;SCEN.leapTo(a,t.c.x+rr(-.4,.4),t.c.y,t.c.z+rr(-.4,.4),1);AU.at('zleap',a.c.x,a.c.y+1.5,a.c.z,{vol:.8})}}else B.climbT=0}
    if(a.zc==='spitter')SCEN.spitAI(a,dt);
    else if(a.zc==='boss'&&a.sb){if(a.sb.mode&&a.sb.mode!=='leap'){a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=false}else{const t=a.bot.target;if(t&&t.alive&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<2.6&&Math.abs(t.c.y-a.c.y)<2.2)a.cmd.fire=Math.random()<.85}}};
  // dead players watch their teammates, not the horde
  const ns=Main.nextSpec.bind(Main);Main.nextSpec=function(){if(G.mode!=='scen')return ns();const L=SCEN.H.filter(a=>a.alive&&!a.isPlayer);if(!L.length)return ns();G.specIdx=(G.specIdx+1)%L.length;G.spec=L[G.specIdx]};
  const T0=T;T=function(k,...a){if(k==='permaDead'&&G.mode==='scen')k='scDead';return T0(k,...a)};
  // scoreboard and results list people, not the zombie pool
  const bd=UI.board.bind(UI);UI.board=function(on){if(G.mode!=='scen')return bd(on);const all=G.actors;G.actors=SCEN.H;try{bd(on)}finally{G.actors=all}
    if(on){const b=$('board'),h=b&&b.querySelector('h3'),fs=b&&b.querySelector('.finalScore'),L=LI();if(h)h.textContent=`${T('board')} — ${T('scen')} · ${L?'Stage':'스테이지'} ${SCEN.stage}/${SCEN.STAGES}`;
      if(fs)fs.innerHTML=`<span class="h">${L?'Wave':'웨이브'} ${Math.max(1,SCEN.wave)}/${SCEN.WAVES}</span> · <span class="z">${L?'Lives':'목숨'} ${SCEN.lives}</span>`}};
  const sr=UI.showResults.bind(UI);UI.showResults=function(){if(G.mode!=='scen')return sr();const all=G.actors;G.actors=SCEN.H;try{sr()}finally{G.actors=all}
    const sp=document.querySelector('#results .mvp span');if(sp)sp.textContent=sp.textContent.replace(' · '+T('infects')+' 0','');
    const L=LI(),fs=document.querySelector('#results .finalScore');if(fs)fs.innerHTML=SCEN.win?`<span class="h">${L?'SCENARIO CLEAR':'시나리오 클리어'}</span> <small>· ${L?'all':'전체'} ${SCEN.STAGES} ${L?'stages':'스테이지'}</small>`:`<span class="z">${L?'GAME OVER':'게임 오버'}</span> <small>· ${L?'cleared stages':'클리어 스테이지'} ${SCEN.best}/${SCEN.STAGES}</small>`};
  // nobody gets infected here: the infections column goes
  const tb=UI.table.bind(UI);UI.table=function(A){const h=tb(A);if(G.mode!=='scen')return h;const d=document.createElement('div');d.innerHTML=h;for(const tr of d.querySelectorAll('tr')){const c=tr.children[3];if(c)c.remove()}return d.innerHTML};
  const hi=HUD.init.bind(HUD);HUD.init=function(){hi();const el=document.createElement('div');el.id='hScen';el.innerHTML='<div class="ln"></div><div class="boss"><span>'+(LI()?'THE GIANT':'거대 좀비')+'</span><i><u></u></i></div>';$('hud').appendChild(el);
    const pk=document.createElement('div');pk.id='scPick';pk.className='panel off';$('app').appendChild(pk)};
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);SCEN.hud()};
  const co=Main.closeOverlay.bind(Main);Main.closeOverlay=function(s){if(Main.overlay==='scpick'){SCEN.closePick(!s);return}return co(s)};
  const a0=UI.act;UI.act=function(a,v,el){
    if(a==='scpick'){if(SCEN.picked||!SCEN.pickOpen||!SCEN.REW[v])return;SCEN.picked=v;SCEN.applyReward(G.player,v);AU.play('buy',{vol:.6});
      for(const b of document.querySelectorAll('#scPick .scBox'))b.classList.add(b.dataset.v===v?'on':'na');setTimeout(()=>{if(SCEN.picked===v&&SCEN.pickOpen)SCEN.closePick(true)},650);return}
    if(a==='scup'){const P=G.player,id=SCEN.upTarget(P);if(SCEN.upgrade(P,id)){AU.play('buy',{vol:.6});const W=WPN[id];if(!NET.cli)HUD.note((LI()?'Upgraded: ':'강화 완료: ')+W.n[LI()]+' +'+P.wup[id],2)}else AU.play('dry',{vol:.5});SCEN.renderUp();return}
    if(a==='scclose'){SCEN.closePick(true);return}
    return a0.call(UI,a,v,el)};
  // keys while the drop is open: 1-3 pick, U upgrade; weapon keys and the shop wait until a box is taken
  addEventListener('keydown',e=>{if(Main.overlay!=='scpick')return;const c=String(e.code||''),n=+c.replace('Digit','').replace('Numpad','');
    if(n>=1&&n<=9){e.stopImmediatePropagation();if(!e.repeat&&n<=3&&SCEN.offer&&SCEN.offer[n-1])UI.act('scpick',SCEN.offer[n-1])}
    else if(c==='KeyU'){e.stopImmediatePropagation();if(!e.repeat)UI.act('scup')}else if(c==='KeyB'||c==='KeyM')e.stopImmediatePropagation()});
  Object.assign(CLIH,{
    scst(L,m){SCEN.stageStart(null,m)},
    scw(L,m){SCEN.wave=m.w;SCEN.ph='wave';SCEN.t=0;G.st='fight';G.time=0;SCEN.closePick(false);SCEN.waveFx(m.w)},
    scwc(){SCEN.ph='break';SCEN.t=8;G.st='prep';G.beepAt=6;SCEN.breakFx()},
    scrh(L,m){SCEN.reviveHumans(m.P)},
    scr(){SCEN.openPick()},
    scf(L,m){SCEN.lives=m.l;SCEN.ph='fail';G.st='end';SCEN.failFx()},
    scend(L,m){SCEN.best=m.b;SCEN.finish(!!m.w)},
    scba(L,m){const a=byId(m.i);if(a&&a.alive)SCEN.bomberArm(a)},
    scb(L,m){SCEN.blast(m.x/100,m.y/100,m.z/100,4.5,0,null,true)},
    sca(L,m){const a=byId(m.i);if(a)a.an.skill=.55;SCEN.acidAdd(m.x/100,m.y/100,m.z/100,m.v.map(v=>v/100),null,true)},
    scsl(L,m){SCEN.slamFx(m.x/100,m.y/100,m.z/100)},
    scbo(L,m){const a=byId(m.i);if(a){a.an.skill=m.k?1:.7;AU.at(m.k?'zroar':'zgrowl',a.c.x,a.c.y+3,a.c.z,{vol:1,range:80,rate:.7})}},
    scbh(){HUD.announce(LI()?'The giant calls the horde!':'거대 좀비가 무리를 부른다!','z',2.5)},
    scp(L,m){const P=G.player;if(P&&P.id===m.i){P.kvx+=m.v[0]/100;P.kvz+=m.v[2]/100;P.c.vy=Math.max(P.c.vy,m.v[1]/100);P.c.onGround=false;P.c.jumped=true}},
    scuok(L,m){const P=G.player;if(P){P.wup=P.wup||{};P.wup[m.w]=m.l;SCEN.renderUp();HUD.note((LI()?'Upgraded: ':'강화 완료: ')+WPN[m.w].n[LI()]+' +'+m.l,2)}}});
  Object.assign(HOSTH,{
    scrw(L,m){const a=actorOfKey(L.key);if(a&&(m.k==='heal'||m.k==='armor'))SCEN.applyReward(a,m.k,true)},
    scu(L,m){const a=actorOfKey(L.key);if(a&&WPN[m.w]&&SCEN.upgrade(a,m.w,true))netSend(L.key,{t:'scuok',w:m.w,l:a.wup[m.w]})}});
})();

'use strict';
// ============ Chapters (v6.20 / v6.21): the zombie scenario told as a story ============
// A chapter (CHAP[n], registered by its boss's file: aleph.js, argus.js, ...) is the scenario (scenario.js: the pool of zombies,
// waves, three shared lives, supply boxes, upgrades) played across the zones of one map (MAP.ez), a goal per stage, then a boss.
// Players see them as chapters (1챕터 ...); the code and the database say episode / ep.
// Stage kinds (CHAP[n].stages[i].k):
//   waves   three waves of infected; prep before the first
//   terms   hold rings in turn (a human inside, no zombie inside: the clock runs)              — 1챕터 security terminals
//   act     hold E at devices (all of them, or in order: D.seq); a hit breaks it off for a moment — generators, records, valves, relays
//   hold    survive D.len s; the boss may show up meanwhile (D.meet)                            — 1챕터 the lift, 3챕터 the conveyor
//   breach  get everybody into the goal box within D.len s (C.breachOK can ask for more first) — 4챕터 the summit gate
//   boss    three phases; a wipe replays the phase it reached
//   escape  after the boss: everybody alive to the exit within 60 s (late still clears, without the bonus)
// Between stages the next door opens with a supply box; everybody inside the next zone (or 40 s) starts the next stage. The fallen
// get up when a teammate holds E next to them for 4 s (30 hp); everybody gets up between stages, between waves and at boss phases.
// Host-authoritative: the host runs the flow; clients get it in the snapshot (SCEN.encState → EP.pack) and as events (eps, epg, ...).
const EPS={},EP_N=10;// (v6.92: the chapters there are — season 2 starts with chapter 6; CHAP[n].season, 1 when not set; v6.96: chapter 7; v6.97: 8; v6.98: 9; v6.99: 10, season 2's finale)
const EP_IDS=Array.from({length:EP_N},(_,i)=>i+1);
// a season's tag before a chapter's number (season 2 on: S2)
const epSz=E=>E&&E.season>1?`<u class="sz">S${E.season}</u>`:'';
{const SOON=[null,{k:'aleph',n:['알레프','ALEPH'],code:'Q7-000'},{k:'argus',n:['아르고스','ARGUS'],code:'RT1-07'},{k:'khepri',n:['케프리','KHEPRI'],code:'Q7-303'},
  {k:'lyrebird',n:['라이어버드','LYREBIRD'],code:'RT1-05'},{k:'tiamat',n:['티아마트','TIAMAT'],code:'Q7-Ω'},{k:'legatus',n:['레가투스','LEGATUS'],code:'RT1-01',season:2},
  {k:'lorelei',n:['로렐라이','LORELEI'],code:'RT1-03',season:2},{k:'charon',n:['카론','CHARON'],code:'RT1-06',season:2},{k:'daedalus',n:['다이달로스','DAEDALUS'],code:'RT1-04',season:2},
  {k:'elpis',n:['엘피스','ELPIS'],code:'RT1-02',season:2}];
  for(let n=1;n<=EP_N;n++)EPS[n]=CHAP[n]||Object.assign({id:n,soon:1},SOON[n])}
// the scenario plays chapter 1 until the player picks another (0 = the free scenario)
const epSel=c=>c&&c.ep!=null?c.ep|0:1;
function epMapOf(c){const e=c&&c.mode==='scen'?EPS[epSel(c)]:null;return e&&!e.soon?e.map:(c&&mapOk(c.mode,c.map)?c.map:(mapsFor(c&&c.mode)[0]||'q7'))}
// radio lines every chapter may use: [ko, en, who (0 control, 1 the team)]
const EP_RADIO0={
  grab:['붙잡혔어! 누가 좀 떼어 줘!','It has me! Somebody get it off!',1],
  cut:['끊겼어! 다시 잡아!','I got hit—it cut out! Again!',1]};
Object.assign(STR.ko,{epD:'협동 PvE 이야기 모드 — 구역 4곳을 차례로 뚫고 보스를 쓰러뜨리기. 팀 목숨 3개: 전멸하면 그 구역을(보스전은 그 페이즈를) 다시. 쓰러진 아군은 옆에서 E를 4초 누르면 일으킴 (체력 30). 장치는 E를 길게 — 맞으면 끊겨요.'});
Object.assign(STR.en,{epD:'Co-op PvE story: push through four zones and bring the boss down. Three shared lives: a wipe replays the zone (the boss fight: its phase). Hold E for 4 s next to a fallen teammate to get them up (30 hp). Devices take a long E press — a hit breaks it off.'});
const fmtT=s=>{s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

const EP={on:false,id:0,C:null,st:0,ph:'',t:0,w:0,gm:0,gmT:-9,dark:false,dk:0,pow:1,obj:{i:0,p:0,h:0,z:0,ps:[]},remain:0,queue:[],spawnT:0,t0:0,bossPh:1,res:null,bf:null,meet:null,
  radioL:[],use:{t:0,tg:null,sent:-9,dev:-1,sd:-1,bd:-1},strobe:null,stT0:0,stIntro:0,grabSaid:0,devFx:[],
  PH:['prep','wave','break','run','move','board','ride','fail','over'],
  S(){const C=this.C;return C&&(C.stages[this.st]||C.stages[1])||{z:'A',k:'waves',n:['','']}},
  B(){return this.C&&this.C.boss||null},
  zone(k){return MAP.ez&&MAP.ez.zones[k]},
  inBox(b,x,z,pad){pad=pad||0;return x>=b[0]-pad&&x<=b[2]+pad&&z>=b[1]-pad&&z<=b[3]+pad},
  inCar(C,h,pad){pad=pad||0;return h.c.x>C.x0-pad&&h.c.x<C.x1+pad&&h.c.z>C.z0-pad&&h.c.z<C.z1+pad},
  bossA(){const B=this.B();if(!B)return null;for(const a of SCEN.Z)if(a.alive&&a.zc===B.zc)return a;return null},
  roll(mix){let t=0;for(const e of mix)t+=e[1];let r=Math.random()*t;for(const [k,p] of mix){if(p<=0)continue;r-=p;if(r<=0)return k}return mix[0][0]},
  hasEscape(){const C=this.C;return !!(C&&C.stages.some(s=>s&&s.k==='escape'))},
  // ---------- gates (map.js): the chapter lists its gate keys; one bit each ----------
  GK(){return this.C&&this.C.gates||[]},
  bit(k){return 1<<this.GK().indexOf(k)},
  gateIsOpen(k){return !!(this.gm&this.bit(k))},
  setGates(m,instant,remote){const was=this.gm,K=this.GK(),D=this.C&&this.C.gateDur||{};this.gm=m;
    for(let i=0;i<K.length;i++){const k=K[i],o=!!(m&1<<i);if(!!(was&1<<i)!==o||instant)gateSet(k,o,instant,D[k]||1.1)}
    if(NET.host&&!remote)netEv('epg',{m,i:instant?1:0})},
  gateOpen(k,o){this.setGates(o?this.gm|this.bit(k):this.gm&~this.bit(k))},
  stageGates(n,kind){return this.C&&this.C.stageGates?this.C.stageGates(n,kind,this.bossPh):0},
  // ---------- match set-up (every page) ----------
  reset(){this.on=false;this.id=0;this.C=null;this.st=0;this.ph='';this.t=0;this.w=0;this.gm=0;this.dark=false;this.dk=0;this.pow=1;this.pk=null;this.obj={i:0,p:0,h:0,z:0,ps:[]};this.remain=0;this.queue=[];this.res=null;this.bf=null;this.meet=null;
    this.radioL=[];this.use={t:0,tg:null,sent:-9,dev:-1,sd:-1,bd:-1};this.bossPh=1;this.grabSaid=0;this.stIntro=0;SCEN.zsp=null;BO.on=false;BO.amb=BO.lamp=1;
    if(this.strobe){for(const L of this.strobe)L.dead=true;this.strobe=null}this.devFxClear();
    for(const n in CHAP){const C=CHAP[n];if(C.boss&&C.boss.clear)C.boss.clear();if(C.clear)C.clear()}epToysClear();
    if(MAP.gates)for(const k in MAP.gates)gateSet(k,false,true);this.radioDraw()},
  setup(){const C=this.C,B=this.B();this.pow=C.pow0!=null?C.pow0:1;if(C.setup)C.setup();this.card('ep');this.barSetup()},
  begin(){this.t0=G.t;SCEN.on=true;SCEN.lives=3;SCEN.best=0;SCEN.win=false;SCEN.tq=[];G.recDone=false;for(const a of G.actors)a.wup={};this.stageStart(1,'fresh');this.say('start')},
  off(){if(!this.on)return;this.reset();const e=$('hEp');if(e)e.style.display='none';const u=$('hUse');if(u){u.className='';if(u.parentNode)u.parentNode.classList.remove('uOn')}const m=$('epMk');if(m)m.innerHTML='';this.mk=null},
  // ---------- a stage starts (host / solo, or a client following the host's plan) ----------
  // kind: fresh (the first), next (after the last one), retry (after a wipe), phase (the boss fight again from its phase);
  // arr: where a transition put each human (id → [x,y,z,yaw])
  stageStart(n,kind,plan,arr){if(NET.cli&&!plan)return;const L=LI(),C=this.C,B=this.B();
    if(plan){n=plan.s;kind=['fresh','next','retry','phase'][plan.k]||'next';SCEN.lives=plan.l;if(plan.bp)this.bossPh=plan.bp;if(plan.pw!=null)this.pow=plan.pw}
    const D=C.stages[n],keepObj=kind==='retry'&&this.st===n&&(D.k==='terms'||D.k==='act');
    // (a replay of a terms / act stage keeps what was already done)
    const ob=keepObj?this.obj:null;this.st=n;this.stT0=G.t;this.stIntro=0;SCEN.stage=Math.min(4,n);SCEN.wave=1;this.w=0;
    this.obj={i:ob?ob.i:0,p:0,h:0,z:0,ps:ob?ob.ps.slice():[]};this.queue=[];this.spawnT=1.5;this.remain=0;this.meet=null;
    SCEN.on=true;SCEN.closePick(false,true);TELE.clear();ELAS.clear();EGREN.clear();ESMK.clear();if(B&&B.stageClear)B.stageClear(kind);
    G.spec=null;G.deathCam=0;G.winner=-1;G.beepAt=6;G.lastHuman=null;FX.clearLimbs();clearNades();NY.clear();SCEN.acid.length=0;
    if(D.k==='boss'&&kind!=='phase'){this.bossPh=1;if(B&&B.clear)B.clear()}
    const Zn=this.zone(D.z);
    // zombies: the ones still chasing inside the new zone stay, the rest go (the boss stays for a phase replay)
    const gone=[];if(plan){for(const i of plan.z||[]){const a=byIdAny(i);if(a)this.despawn(a)}}
    else for(const a of SCEN.Z){if(!a.alive)continue;if(a.boss&&kind==='phase')continue;if(kind==='next'&&Zn&&!a.boss&&D.k!=='boss'&&this.inBox(Zn.box,a.c.x,a.c.z))continue;this.despawn(a);gone.push(a.id)}
    this.setGates(plan?plan.g:this.stageGates(n,kind),kind!=='next',true);this.dark=D.k==='boss'&&kind==='phase'&&!!(B&&B.darkPh)&&this.bossPh>=B.darkPh;
    SCEN.zsp=Zn?(C.zsp?C.zsp(n,Zn):Zn.zsp):null;
    // humans: placed (or left where they stand inside the zone), the fallen back on their feet
    const P={},out=[];if(plan)for(const q of plan.P)P[q[0]]=q;const starts=!Zn?[]:kind==='phase'&&C.phaseStart?C.phaseStart(Zn):Zn.start;let si=0;
    for(const a of SCEN.H){const q=P[a.id],was=a.alive;let x,y,z,yw,keep=false;
      if(q){x=q[1]/100;y=q[2]/100;z=q[3]/100;yw=q[4]/1000;keep=!!q[5]}
      else if(arr&&arr[a.id]){[x,y,z,yw]=arr[a.id]}
      else if(kind==='next'&&was&&Zn&&D.k!=='boss'&&this.inBox(Zn.box,a.c.x,a.c.z)){keep=true;x=a.c.x;y=a.c.y;z=a.c.z;yw=a.yaw}
      else{const s=starts[si++%Math.max(1,starts.length)]||[0,0,0,0];x=s[0]+rr(-.12,.12);y=s[1];z=s[2]+rr(-.12,.12);yw=s[3]}
      a.team=TH;a.host=false;a.permaDead=false;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.rootT=0;a.grabT=0;a.burnT=0;
      a.nb=null;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.an.dead=0;a.an.atk=0;a.pendingClaw=null;a.zoom=0;a.lvl=1;a.deadT=0;a.maxHp=100;a.alive=true;a.knockT=0;a.blindT=0;a.epUse=-1;a.useBlk=0;
      if(kind==='fresh'){giveDefault(a);a.armor=0;a.hp=100;a.dmgRound=0}
      else if(!was||kind==='retry'||kind==='phase'){a.hp=100;if(!a.pup)for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}}
      // the boss fight starts topped up: health, armour, every magazine, a grenade of each
      if(D.k==='boss'&&kind==='next'){a.hp=100;a.armor=100;if(!a.pup){for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}a.inv.he=Math.max(a.inv.he||0,1);a.inv.frost=Math.max(a.inv.frost||0,1);if(D.flare)a.inv.flare=Math.max(a.inv.flare||0,1)}}
      if(!keep||!was){placeAt(a,x,y,z,yw);ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0}else ensureRig(a);
      if(NET.host)out.push([a.id,r2(x),r2(y),r2(z),r3(yw),keep?1:0]);
      // (a bot's goal is asked for again: after a wipe the goal's key is the one it had before it fell, and the new round's camp spot would stand)
      if(a.isPlayer){if(!keep||!was)VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot){AI.onRound(a);a.bot.epG=null}
      if(a.bot&&!NET.cli&&kind==='next'){const id=a.inv[1];while(id&&a.money>=SCEN.upCost(a,id)&&SCEN.upgrade(a,id,true)){}}
      ldKitReset(a)}
    HUD.feedL=[];HUD.el.hFeed.innerHTML='';HUD.clearDmg();if(kind!=='next')FX.clearDecals();
    if(D.k==='act')this.devFxBuild();else this.devFxClear();
    // the stage's own start
    if(D.k==='waves'){this.ph='prep';this.t=kind==='fresh'?(D.prep||18):10;G.st='prep';G.time=this.t}
    else if(D.k==='boss'){this.ph='prep';this.t=kind==='phase'?8:(D.prep||12);G.st='prep';G.time=this.t;
      if(!NET.cli&&B)B.prepSpawn(kind,this.bossPh);
      if(kind!=='phase'){SCEN.openPick();for(const a of SCEN.H)if(a.bot)SCEN.applyReward(a,SCEN.botPick(a),true)}}
    else{this.ph='run';this.t=0;G.st='fight';G.time=D.len||0}
    if(C.stageStart)C.stageStart(n,kind);
    const sn=`${D.n[L]}`,tag=kind==='retry'||kind==='phase'?(L?'RETRY · ':'재도전 · '):'';
    // (the first stage waits for the chapter's title card to fade, the boss stage for the boss's)
    if(kind==='next'&&D.k!=='boss'){HUD.announce(L?'STAGE CLEAR!':'스테이지 클리어!','h',2.5);this.later(2.6,()=>HUD.announce(sn,'w',2.5))}
    else if(D.k==='boss'&&kind==='next')this.later(3.9,()=>HUD.announce(sn,'w',2.4));
    else if(kind==='fresh'){this.later(4.4,()=>HUD.announce(sn,'w',2.6));this.later(5.2,()=>HUD.note(L?'Hold E next to a fallen teammate to get them up':'쓰러진 아군 옆에서 E를 길게 누르면 일으켜요',5))}
    else HUD.announce(tag+sn,kind==='retry'||kind==='phase'?'z':'w',3);
    AU.play('siren',{vol:.5});AU.muSet&&AU.muSet(D.k==='boss'?'prep':'fight');
    if(D.say&&(kind==='next'||kind==='retry'&&D.sayRetry))this.radio(D.say);if(D.k==='boss'&&kind==='next')this.card('boss');
    if(NET.host)netEv('eps',{s:n,k:['fresh','next','retry','phase'].indexOf(kind),l:SCEN.lives,P:out,g:this.gm,z:gone,bp:this.bossPh,pw:this.pow})},
  later(t,f){SCEN.later(t,f)},
  despawn(a){a.alive=false;a.permaDead=true;a.hp=0;a.deadT=99;a.an.dead=0;a.c.y=-60;a.nb=null;a.leapV=null;a.boomT=0;a.reviving=0;const Z=EPZ[a.zc];if(Z&&Z.gone)Z.gone(a)},
  // ---------- per frame (every page) ----------
  update(dt){SCEN.updateAcid(dt);for(let i=SCEN.tq.length-1;i>=0;i--){const q=SCEN.tq[i];q.t-=dt;if(q.t<=0){SCEN.tq.splice(i,1);q.f()}}
    for(const a of SCEN.Z){if(!a.alive){if(a.an.dead>0&&a.deadT>14)a.an.dead=0;continue}
      if(a.boomT>0){if(NET.cli)a.boomT=Math.max(0,a.boomT-dt);a.an.skill=Math.max(a.an.skill,.45);if(a.ch)a.ch.grp.scale.setScalar(1+.16*(1-a.boomT/.6)+Math.sin(G.t*55)*.02)}}
    for(const h of SCEN.H){if(h.grabT>0)h.grabT=Math.max(0,h.grabT-dt);if(h.knockT>0)h.knockT=Math.max(0,h.knockT-dt);if(h.blindT>0)h.blindT=Math.max(0,h.blindT-dt)}
    gatesUpdate(dt);epToysUpdate(dt);const B=this.B(),C=this.C;if(B&&B.update)B.update(dt);if(C.update)C.update(dt);this.light(dt);this.useTick(dt);this.devFxTick(dt);
    if(this.ph==='prep'||this.ph==='break'){const s=Math.ceil(this.t);if(s<G.beepAt&&s>=1){G.beepAt=s;AU.play(s<=3?'beep2':'beep',{vol:.5});HUD.countdown(s)}}
    if(NET.cli)return;
    this.host(dt);
    for(const a of SCEN.Z)if(a.alive){if(a.zc==='bomber')SCEN.bomberTick(a,dt);else{const Z=EPZ[a.zc];if(Z&&Z.tick)Z.tick(a,dt)}}},
  // ---------- the flow (host / solo) ----------
  host(dt){const ph=this.ph,C=this.C,D=this.S();
    if(ph==='over'){this.t-=dt;if(this.t<=0&&G.st!=='over'){G.st='over';UI.showResults();if(NET.host)netEv('over')}return}
    if(ph==='fail'){this.t-=dt;G.time=this.t;if(this.t<=0){if(D.k==='boss')this.stageStart(this.st,'phase');else this.stageStart(this.st,'retry')}return}
    if(C.hostPh&&C.hostPh(ph,dt))return;
    if(humansAlive()===0){if(D.k==='escape')this.finish(true,false);else this.fail();return}
    if(ph==='move'){this.t-=dt;G.time=this.t;const nx=C.stages[this.st+1],Zn=nx&&this.zone(nx.z);let all=true;if(Zn)for(const h of SCEN.H)if(h.alive&&!this.inBox(Zn.box,h.c.x,h.c.z))all=false;
      if(all||this.t<=0)this.stageStart(this.st+1,'next');return}
    const H=this['h_'+D.k];if(H)H.call(this,dt)},
  // waves: three of them
  makeWave(w){const H=SCEN.H.length,d=G.diff||0,D=this.S(),n=Math.round((5+2*w)*(.5+.25*H)*SC_DIFF.n[d]*(D.wn||1));
    const mix=D.wave?D.wave(w):[['rager',60],['runner',24],['bomber',w>=2?10:0],['brute',w>=3?6:0]];const q=[];for(let i=0;i<n;i++)q.push(this.roll(mix));return q},
  h_waves(dt){const ph=this.ph;if(ph==='prep'||ph==='break'){this.t-=dt;G.time=this.t;if(this.t<=0)this.waveStart(this.w+1);return}
    G.time+=dt;let alive=0;for(const a of SCEN.Z)if(a.alive)alive++;this.spawnT-=dt;
    if(this.queue.length&&alive<SCEN.POOL&&this.spawnT<=0){if(SCEN.spawn(this.queue[0])){this.queue.shift();alive++}this.spawnT=rr(.3,.65)}
    this.remain=this.queue.length+alive;SCEN.unstick(dt);this.introTick();if(this.remain===0)this.waveClear()},
  waveStart(w){this.w=w;SCEN.wave=w;this.ph='wave';G.st='fight';G.time=0;this.queue=this.makeWave(w);this.spawnT=.6;SCEN.closePick(false);this.reviveAll();this.waveFx(w);if(NET.host)netEv('epw',{w})},
  waveFx(w){HUD.announce((LI()?'WAVE ':'웨이브 ')+w+' / 3','w',2.5);AU.play('siren',{vol:.6});AU.muSet&&AU.muSet('fight');if(w===1)this.radio('w1')},
  waveClear(){for(const a of SCEN.H)a.money=Math.min(16000,a.money+500+this.st*100);if(this.w<3){this.ph='break';this.t=8;G.st='prep';G.time=8;G.beepAt=6;SCEN.breakFx();this.reviveAll();if(NET.host)netEv('epwc',{})}else this.stageClear()},
  // a stage is done: the next door opens, a supply box, then everybody walks through
  stageClear(){const C=this.C,D=this.S();SCEN.best=Math.max(SCEN.best,this.st);for(const a of SCEN.H)a.money=Math.min(16000,a.money+1500);const nx=this.st+1;
    if(C.stageDone)C.stageDone(this.st);
    this.ph='move';this.t=40;G.st='fight';G.time=40;this.reviveAll();this.setGates(this.gm|this.stageGates(nx,'next'));this.moveFx(this.st);
    for(const a of SCEN.H)if(a.bot)SCEN.applyReward(a,SCEN.botPick(a),true);if(NET.host)netEv('epm',{n:this.st,pw:this.pow})},
  moveFx(n){const L=LI(),D=this.C.stages[n];HUD.announce(L?'STAGE CLEAR!':'스테이지 클리어!','h',3);AU.play('stingH',{vol:.7});AU.muSet&&AU.muSet('win');if(D&&D.clr)this.radio(D.clr);
    HUD.note(L?'Pick a supply box, then go through the open door':'보급 상자를 고르고 열린 문으로 이동하세요',4);SCEN.openPick()},
  // a wave of infected that never ends: as many on their feet as the team can take, topped up as they fall
  // (v6.97: a Frozen asleep in the snow does not count: charon.js)
  trickle(dt,mix,capK){const d=G.diff||0;let alive=0;for(const z of SCEN.Z)if(z.alive&&!z.boss&&!z.frDorm)alive++;const cap=Math.round((3+1.6*SCEN.H.length)*SC_DIFF.n[d]*(capK||1));
    this.spawnT-=dt;if(alive<cap&&this.spawnT<=0){const ok=SCEN.spawn(this.roll(mix));this.spawnT=ok?rr(.7,1.4)/(SC_DIFF.n[d]*(.7+.1*SCEN.H.length)):.4}},
  // a stage's new kind of infected gets a line on the radio the first time one is out
  introTick(){const I=this.S().intro;if(!I||this.stIntro||G.t-this.stT0<(I.at||8))return;for(const a of SCEN.Z)if(a.alive&&a.zc===I.zc){this.stIntro=1;this.say(I.say);break}},
  countZ(){let al=0;for(const a of SCEN.Z)if(a.alive&&!a.boss)al++;this.remain=al},
  // terms: hold the rings in turn
  h_terms(dt){G.time+=dt;const D=this.S(),TT=MAP.ez[D.ring||'terms'],T0=TT&&TT[this.obj.i];if(!T0)return;let h=0,z=0;const len=D.t||25;
    for(const a of SCEN.H)if(a.alive&&Math.abs(a.c.y-T0.y)<2&&Math.hypot(a.c.x-T0.x,a.c.z-T0.z)<T0.r)h++;
    for(const a of SCEN.Z)if(a.alive&&a.reviving<=0&&Math.abs(a.c.y-T0.y)<2&&Math.hypot(a.c.x-T0.x,a.c.z-T0.z)<T0.r)z++;
    this.obj.h=h;this.obj.z=z;if(h>0&&z===0)this.obj.p=Math.min(len,this.obj.p+dt);
    if(this.obj.p>=len){this.obj.i++;this.obj.p=0;for(const a of SCEN.H)a.money=Math.min(16000,a.money+500);AU.play('morale',{vol:.6});
      if(this.obj.i>=TT.length){this.stageClear();return}if(D.done1)this.say(D.done1);if(NET.host)netEv('epo',{i:this.obj.i})}
    this.trickle(dt,D.mix,D.cap||.85);SCEN.unstick(dt);this.countZ();this.introTick()},
  // act: hold E at the devices (D.dev = the device list's key in MAP.ez; D.seq = one after another)
  devs(){const D=this.S();return D.dev&&MAP.ez&&MAP.ez[D.dev]||[]},
  devLeft(){const L=this.devs(),O=this.obj;let n=0;for(let i=0;i<L.length;i++)if(!((O.ps[i]||0)>=L[i].t))n++;return n},
  devOpen(i){const D=this.S(),L=this.devs(),O=this.obj;if(!L[i]||(O.ps[i]||0)>=L[i].t)return false;if(!D.seq)return true;for(let j=0;j<i;j++)if((O.ps[j]||0)<L[j].t)return false;return true},
  nearDev(a,v){return Math.abs(a.c.y-v.y)<1.8&&Math.hypot(a.c.x-v.x,a.c.z-v.z)<(v.r||1.7)},
  devNear(a){const L=this.devs();let best=-1,bd=99;for(let i=0;i<L.length;i++){if(!this.devOpen(i)||!this.nearDev(a,L[i]))continue;const d=Math.hypot(a.c.x-L[i].x,a.c.z-L[i].z);if(d<bd){bd=d;best=i}}return best},
  h_act(dt){G.time+=dt;const D=this.S(),L=this.devs(),O=this.obj,E=this.meet,B=this.B();let hold=0,z=0;
    for(let i=0;i<L.length;i++){const v=L[i];if(!this.devOpen(i))continue;let h=0;for(const a of SCEN.H)if(a.alive&&a.epUse===i&&G.t>=(a.useBlk||0)&&this.nearDev(a,v))h++;
      if(h>0){hold+=h;O.ps[i]=Math.min(v.t,(O.ps[i]||0)+dt*(h>1?1.25:1));if(O.ps[i]>=v.t){this.devDone(i);if(this.ph!=='run')return}}
      for(const a of SCEN.Z)if(a.alive&&!a.boss&&Math.hypot(a.c.x-v.x,a.c.z-v.z)<4)z++}
    O.h=hold;O.z=z;O.i=L.length-this.devLeft();
    if(D.meet){if(!E&&G.t-this.stT0>=(D.meet.at||3))this.meetStart();else if(E&&E.st==='on'){E.t+=dt;if(B&&B.meetTick)B.meetTick(E,dt)}}
    this.trickle(dt,D.mix,E&&E.st==='on'?(D.meet.cap||.6):(D.cap||.85));SCEN.unstick(dt);this.countZ();this.introTick()},
  devDone(i){const D=this.S(),C=this.C;for(const a of SCEN.H)a.money=Math.min(16000,a.money+400);this.devFxApply(i);
    const left=this.devLeft();if(C.devDone)C.devDone(this.st,i,left);if(NET.host)netEv('epdv',{i});
    if(left<=0){if(D.meet&&this.meet&&this.meet.st==='on'){const B=this.B();if(B&&B.meetLeave)B.meetLeave(this.meet)}this.stageClear()}
    else{const k=D.devSay?D.devSay(i,left):null;if(k)this.say(k)}},
  devFxApply(i){AU.play('morale',{vol:.6});AU.play('powerup',{vol:.5,rate:1.4});const F=this.devFx[i];if(F)F.done=1;const v=this.devs()[i];
    if(v)for(let k=0;k<24;k++)FX.spawn({x:v.x,y:v.y+1.2,z:v.z,vx:rr(-2,2),vy:rr(.5,3),vz:rr(-2,2),life:rr(.3,.7),s0:.06,s1:.02,r:.5,g:1,b:.6,f:0,grav:6,add:1})},
  // a small lamp over every device of an act stage: red while it waits, green once done
  devFxBuild(){this.devFxClear();const L=this.devs(),O=this.obj;for(let i=0;i<L.length;i++){const v=L[i];const l=DL.add(v.x,v.y+(v.lh||2.2),v.z,'#ff3a2a',4.5,.9,0);this.devFx.push({l,done:(O.ps[i]||0)>=v.t?1:0})}},
  devFxTick(){const L=this.devs(),O=this.obj;for(let i=0;i<this.devFx.length;i++){const F=this.devFx[i],v=L[i];if(!v)continue;const done=(O.ps[i]||0)>=v.t;
      F.l.c.set(done?'#4aff7a':this.devOpen(i)?'#ffb030':'#ff3a2a');F.l.i=done?.8:(.55+.35*Math.abs(Math.sin(G.t*(this.devOpen(i)?5:2))))}},
  devFxClear(){for(const F of this.devFx)F.l.dead=true;this.devFx=[]},
  // hold: survive D.len s (the lift, the conveyor); the boss may show up meanwhile
  h_hold(dt){const D=this.S(),E=this.meet,B=this.B(),len=D.len||60;this.obj.p+=dt;G.time=Math.max(0,len-this.obj.p);
    if(D.meet){if(!E&&this.obj.p>=(D.meet.at||12))this.meetStart();else if(E&&E.st==='on'){E.t+=dt;if(B&&B.meetTick)B.meetTick(E,dt)}}
    this.trickle(dt,D.mix,E&&E.st==='on'?(D.meet.cap||.5):(D.cap||1));SCEN.unstick(dt);this.countZ();this.introTick();
    if(this.obj.p>=len){if(E&&E.st==='on'&&B&&B.meetLeave)B.meetLeave(E);if(this.C.holdDone)this.C.holdDone(this.st);else this.stageClear()}},
  // breach: everybody alive into the goal box (MAP.ez.goal[D.goal]) within D.len s
  h_breach(dt){const D=this.S(),E=this.meet,B=this.B(),len=D.len||180,gb=MAP.ez.goal&&MAP.ez.goal[D.goal];this.obj.p+=dt;G.time=Math.max(0,len-this.obj.p);
    if(D.meet){if(!E&&this.obj.p>=(D.meet.at||10))this.meetStart();else if(E&&E.st==='on'){E.t+=dt;if(B&&B.meetTick)B.meetTick(E,dt)}}
    this.trickle(dt,D.mix,D.cap||.9);SCEN.unstick(dt);this.countZ();this.introTick();
    let all=!!gb,n=0;if(gb)for(const h of SCEN.H){if(!h.alive)continue;n++;if(!this.inBox(gb.box,h.c.x,h.c.z))all=false}this.obj.h=n;
    if(all&&n&&(!this.C.breachOK||this.C.breachOK())){if(E&&E.st==='on'&&B&&B.meetLeave)B.meetLeave(E);this.stageClear();return}
    if(this.obj.p>=len){this.say(D.late||'cut');this.fail()}},
  // the boss's first appearance (and its way out)
  meetStart(){const B=this.B();this.meet={st:'on',t:0,a:null};if(B&&B.meetStart)B.meetStart(this.meet)},
  meetEnd(a){if(this.meet)this.meet.st='done';if(!a)return;for(let i=0;i<24;i++)FX.spawn({x:a.c.x+rr(-1,1),y:a.c.y+rr(0,3),z:a.c.z+rr(-1,1),vx:rr(-1,1),vy:rr(0,1),vz:rr(-1,1),life:rr(1,2),s0:.5,s1:1.6,r:.4,g:.38,b:.36,a:.5,f:2,drag:1.2});
    this.despawn(a);if(NET.host)netEv('epdz',{i:[a.id]})},
  // boss: the prep (supply boxes), then the fight
  h_boss(dt){if(this.ph==='prep'){this.t-=dt;G.time=this.t;if(this.t<=0)this.bossGo();return}G.time+=dt;this.countZ();SCEN.unstick(dt)},
  bossGo(){this.ph='run';G.st='fight';G.time=0;SCEN.closePick(false);const B=this.B(),C=this.C,tp=C.bossGo?C.bossGo()||[]:[];const b=this.bossA();if(b&&B)B.go(b);
    this.goFx();if(NET.host)netEv('epgo',{P:tp})},
  goFx(){const L=LI(),B=this.B(),D=this.S();AU.play('stingZ',{vol:.8});AU.muSet&&AU.muSet('intense');if(B&&B.goText)HUD.announce(B.goText[L],'z',3);if(D.go)this.radio(D.go)},
  bossDead(a){const D=this.S();if(D.k!=='boss')return;SCEN.best=4;for(const h of SCEN.H)h.money=Math.min(16000,h.money+3000);const nx=this.C.stages[this.st+1];
    TELE.clear();ELAS.clear();this.reviveAll();
    if(nx&&nx.k==='escape'){this.st++;this.ph='run';this.t=nx.len||60;G.st='fight';G.time=this.t;this.setDark(false);if(this.C.escapeStart)this.C.escapeStart();this.spawnT=2.5;this.deadFx();if(NET.host)netEv('epk',{e:1});return}
    // (no escape: the chapter is cleared there and then; the kill gets its moment before the clear's own announcement)
    this.deadFx();if(NET.host)netEv('epk',{e:0});this.finish(true,true,true)},
  deadFx(){const L=LI(),B=this.B();if(B&&B.deadText)HUD.announce(B.deadText[L],'h',3.5);AU.play('stingH',{vol:.8});AU.muSet&&AU.muSet(this.hasEscape()?'intense':'win');this.radio('dead')},
  // escape: everybody alive to the exit
  h_escape(dt){const D=this.S();this.t-=dt;G.time=Math.max(0,this.t);this.trickle(dt,D.mix,D.cap||1.4);SCEN.unstick(dt);const X=MAP.ez.exit;let all=true,n=0;
    for(const h of SCEN.H){if(!h.alive)continue;n++;if(!X||!this.inCar(X,h,.2))all=false}if(n&&all){this.finish(true,true);return}if(this.t<=0)this.finish(true,false)},
  fail(){SCEN.lives--;this.queue=[];TELE.clear();ELAS.clear();if(SCEN.lives<=0){this.finish(false,false);return}this.ph='fail';this.t=5;G.st='end';SCEN.failFx();if(NET.host)netEv('epf',{l:SCEN.lives})},
  finish(win,bonus,late){if(this.ph==='over')return;this.ph='over';this.t=late?8:6;SCEN.win=win;if(win)SCEN.best=4;G.st='end';G.endT=99;SCEN.closePick(false);TELE.clear();ELAS.clear();
    this.res={win,bonus:!!bonus,time:Math.round(G.t-this.t0),lost:3-Math.max(0,SCEN.lives),st:this.st,diff:G.diff||0};this.res.medal=this.medal(this.res);
    if(this.C.onFinish)this.C.onFinish(win,bonus);if(late)this.later(2.8,()=>this.endFx());else this.endFx();this.saveLocal();
    if(NET.host)netEv('epend',{w:win?1:0,b:bonus?1:0,tm:this.res.time,l:this.res.lost,s:this.st,q:late?1:0})},
  endFx(){const r=this.res,L=LI(),esc=this.hasEscape();HUD.announce(r.win?(esc&&r.bonus?(L?'ESCAPED!':'탈출 성공!'):(L?'CHAPTER CLEAR':'챕터 클리어')):(L?'GAME OVER':'게임 오버'),r.win?'h':'z',5);
    AU.play(r.win?'stingH':'stingZ',{vol:.8});AU.muSet&&AU.muSet(r.win?'win':'dead');if(r.win)this.radio(esc?(r.bonus?'esc':'late'):'clear');if(this.C&&this.C.endFx)this.C.endFx(r)},
  // (the same rule as the server's qz_claim: S no life lost within 16 min, A one at most within 22, B the rest and every clear without the escape)
  medal(r){return !r.win?'':!r.bonus?'B':r.lost===0&&r.time<=960?'S':r.lost<=1&&r.time<=1320?'A':'B'},
  // ---------- getting back up ----------
  // (beside a teammate still standing — on the teammate's side of any wall or shut gate: the body is walked there in steps; a teammate
  // pressed against a gate put a bot through it, out of the zone, and the wave could never end — v6.97)
  reviveAll(){const out=[],live=SCEN.H.filter(h=>h.alive);
    for(const a of SCEN.H){if(a.alive)continue;const b=live.length?rpick(live):null;let p;
      if(b){p=[b.c.x+rr(-1,1),b.c.y+.1,b.c.z+rr(-1,1)];if(!charFits(a.c,p[0],p[1],p[2])||!this.fitsTo(a.c,b.c,p))p=[b.c.x,b.c.y+.1,b.c.z]}else p=[a.c.x,a.c.y+.1,a.c.z];
      SCEN.reviveOne(a,p);out.push([a.id,r2(p[0]),r2(p[1]),r2(p[2]),100])}
    if(NET.host&&out.length)netEv('eprh',{P:out})},
  fitsTo(c,f,p){for(let k=1;k<=6;k++){const u=k/6;if(!charFits(c,f.x+(p[0]-f.x)*u,p[1],f.z+(p[2]-f.z)*u))return false}return true},
  reviveAt(a,by){if(a.alive||a.team!==TH)return;const p=[a.c.x,Math.max(a.c.y,-.8)+.05,a.c.z];SCEN.reviveOne(a,p);a.hp=30;
    EP.reviveNote(a,by);AU.at('heal',a.c.x,a.c.y+1,a.c.z,{vol:.8,range:30});if(NET.host)netEv('eprh',{P:[[a.id,r2(p[0]),r2(p[1]),r2(p[2]),30]]})},
  reviveNote(a,by){const L=LI(),P=G.player;if(by&&by===P)HUD.note((L?'You got ':'')+a.name+(L?' up':' 부활시킴'),2);else if(a===P&&by)HUD.note(by.name+(L?' got you up':' 님이 일으켜 줬어요'),2.5)},
  deadNear(a,r){let best=null,bd=r;for(const h of SCEN.H){if(h.alive||h===a||h.team!==TH)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<1.8){bd=d;best=h}}return best},
  reviveOK(){return this.ph!=='over'&&this.ph!=='fail'&&this.ph!=='ride'},
  // the player holds E (or the touch button): a fallen teammate next to them first (4 s), else the device in reach
  // (an act stage's devices: epUse = its index; the boss fight's own devices, like 2챕터's floodlights: 100 + the boss's index)
  useTick(dt){const P=G.player,U=this.use;if(!P||P.bot){U.t=0;U.tg=null;U.dev=U.bd=-1;return}// (a player driven by a bot, as in the tests, holds E through the bot code)
    if(!P.alive||P.team!==TH||Main.paused||P.grabT>0||P.knockT>0||!this.reviveOK()){U.t=0;U.tg=null;U.dev=U.bd=-1;this.useSend(P,-1);return}
    const tg=this.deadNear(P,1.7);if(tg!==U.tg)U.t=0;U.tg=tg;
    if(tg){U.dev=U.bd=-1;this.useSend(P,-1);if(!P.cmd.use){U.t=0;return}U.t+=dt;if(U.t>=4){U.t=0;if(NET.cli){if(G.t-U.sent>1){U.sent=G.t;netToHost({t:'eprv',i:tg.id})}}else this.reviveAt(tg,P)}return}
    U.t=0;const D=this.S(),B=this.B(),run=this.ph==='run',di=D.k==='act'&&run?this.devNear(P):-1,bd=(D.k==='boss'||D.k==='breach'&&this.C.breachDev)&&run&&B&&B.useNear?B.useNear(P):-1;U.dev=di;U.bd=bd;
    const ok=P.cmd.use&&G.t>=(P.useBlk||0);this.useSend(P,ok&&di>=0?di:ok&&bd>=0?100+bd:-1)},
  useSend(P,d){if(P.epUse===d)return;P.epUse=d;if(NET.cli)netToHost({t:'epuse',d})},
  // a hit while holding a device breaks it off for a moment
  useHit(){const P=G.player;if(!P)return;P.useBlk=G.t+.9;if(this.use.dev>=0||this.use.bd>=0){HUD.note(LI()?'Hit — it cut out!':'맞아서 끊겼어요!',1.2);AU.play('dry',{vol:.6})}},
  // ---------- the arena's light: the chapter's power (the base lights) and the boss's blackout; red strobes in the dark ----------
  setDark(on,remote){if(this.dark===!!on)return;this.dark=!!on;if(on){AU.play('blackout',{vol:.9});const P=G.player;if(P&&P.alive&&P.team===TH)P.flash=true;for(const h of SCEN.H)if(h.bot)h.flash=true}
    else AU.play('powerup',{vol:.8});if(NET.host&&!remote)netEv('epx0',{k:'dark',o:on?1:0})},
  setPow(p,remote){if(this.pow===p)return;const up=p>this.pow;this.pow=p;AU.play(up?'powerup':'blackout',{vol:.8});if(NET.host&&!remote)netEv('epx0',{k:'pow',o:p})},
  light(dt){const C=this.C;this.dk=approach(this.dk,this.dark?1:0,dt*(this.dark?2.5:.8));this.pk=approach(this.pk==null?this.pow:this.pk,this.pow,dt*.7);const k=this.dk,lo=C.powLo||[.62,.12];
    BO.amb=lerp(1,.3,k)*lerp(lo[0],1,this.pk);BO.lamp=lerp(1,.05,k)*lerp(lo[1],1,this.pk);const S=C.strobes;
    if(k>.01&&S){if(!this.strobe)this.strobe=S.map(p=>DL.add(p[0],p[1],p[2],'#ff2a14',26,0,0));const on=Math.sin(G.t*7)>.2;this.strobe.forEach((L,i)=>{L.i=(i%2?!on:on)?1.9*k:.04})}
    else if(this.strobe){for(const L of this.strobe)L.dead=true;this.strobe=null}},
  // ---------- the radio ----------
  say(k){this.radio(k);if(NET.host)netEv('epn',{k})},
  radio(k){const R0=this.C&&this.C.radio[k]||EP_RADIO0[k];if(!R0)return;this.radioL.push({txt:R0[LI()],at:G.t,who:R0[2]||0,real:performance.now()});if(this.radioL.length>4)this.radioL.shift();this.radioDraw();AU.play('ui',{vol:.3,rate:1.7})},
  radioDraw(){const el=$('hRadio');if(!el)return;const L=LI(),now=performance.now(),h=this.radioL.filter(r=>now-r.real<8000).slice(-3).map(r=>`<p class="${r.who===1?'t':r.who===2?'b':r.who===3?'v':'c'}"><b>[${r.who===1?'RT-2':r.who===2?(this.C&&this.C.voice2?this.C.voice2[L]:'???'):r.who===3?(this.C&&this.C.voice3?this.C.voice3[L]:'???'):(L?'CONTROL':'통제실')}]</b> ${esc(r.txt)}</p>`).join('');
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}},
  // ---------- the snapshot (host → clients) ----------
  bs(){const b=this.bossA(),B=this.B();if(!b||!B)return null;if(!NET.cli)return B.bsPack(b)?Object.assign(B.bsOf(b),{a:b}):null;
    const f=this.bf;return f&&f.id===b.id?Object.assign({a:b},f):null},
  pack(){const b=this.bossA(),B=this.B(),bp=b&&B&&!NET.cli?B.bsPack(b):0;
    return [this.st,this.PH.indexOf(this.ph),Math.round(this.t*10),this.w,this.obj.i,Math.round(this.obj.p*10),this.obj.h,this.obj.z,this.remain,this.gm,this.dark?1:0,this.bossPh,bp||0,
      this.obj.ps.map(v=>Math.round((v||0)*10)),this.pow]},
  unpack(s){if(!Array.isArray(s))return;this.on=true;const ph=this.PH[s[1]]||this.ph;this.st=s[0];this.ph=ph;this.t=s[2]/10;this.w=s[3];this.obj.i=s[4];this.obj.p=s[5]/10;this.obj.h=s[6];this.obj.z=s[7];this.remain=s[8];
    // a gate event missed (or still on its way): the snapshot puts it right after a moment
    if(s[9]!==this.gm&&G.t-this.gmT>1.5)this.setGates(s[9],true,true);this.dark=!!s[10];this.bossPh=s[11];
    const B=this.B();this.bf=s[12]&&B?B.bsUnpack(s[12]):null;if(Array.isArray(s[13]))this.obj.ps=s[13].map(v=>v/10);if(s[14]!=null)this.pow=s[14];
    if(G.st!=='over'&&G.st!=='menu'){const g=ph==='prep'||ph==='break'?'prep':ph==='fail'||ph==='over'?'end':'fight';if(G.st!==g)G.st=g}},
  // ---------- ally bots (host) ----------
  goal(a){const ph=this.ph,st=this.st,E=MAP.ez,C=this.C,D=this.S();if(!E)return null;const i=SCEN.H.indexOf(a);
    if(C.goal){const g=C.goal(a,i);if(g!==undefined)return g}
    if(ph==='move'&&C.stages[st+1]){const Zn=this.zone(C.stages[st+1].z),s=Zn.start[i%Zn.start.length];return [s[0],s[1],s[2],1]}
    if(ph==='run'){
      if(D.k==='terms'){const T0=E[D.ring||'terms'][this.obj.i];if(T0)return [T0.x,T0.y,T0.z,1.5]}
      if(D.k==='act'){const L=this.devs(),open=[];for(let j=0;j<L.length;j++)if(this.devOpen(j))open.push(j);if(open.length){const j=open[i%open.length],v=L[j];a.bot.epDev=j;return [v.x+(v.bx||0),v.y,v.z+(v.bz||0),.6]}}
      if(D.k==='hold'&&D.hp)return [D.hp[0],D.hp[1],D.hp[2],D.hp[3]||2.4];
      if(D.k==='breach'){const gb=E.goal&&E.goal[D.goal];if(gb)return [gb.p[0],gb.p[1],gb.p[2],2]}
      if(D.k==='boss'){const B=this.B();if(B&&B.botGoal){const g=B.botGoal(a,i+((a.bot&&a.bot.stN)|0));if(g)return g}const b=this.bossA(),Z=this.zone(D.z);
        if(b&&Z){const an=i*1.9+Math.floor(G.t/6)*.7,bx=Z.box;return [clamp(b.c.x+Math.cos(an)*12,bx[0]+3,bx[2]-3),b.c.y>2?Z.start[0][1]:b.c.y,clamp(b.c.z+Math.sin(an)*12,bx[1]+3,bx[3]-3),1.5]}}
      if(D.k==='escape'&&E.exit){const X=E.exit;return [(X.x0+X.x1)/2,0,(X.z0+X.z1)/2,1]}}
    if(D.k==='boss'&&ph==='prep'&&D.prepPt)return D.prepPt;
    return null},
  goalKey(){const D=this.S(),b=D.k==='boss'?this.bossA():null,Bo=this.B();return this.st+':'+this.ph+':'+this.obj.i+':'+(D.k==='act'?this.devLeft():0)+':'+(b?Math.round(b.c.x/6)+','+Math.round(b.c.z/6)+','+Math.floor(G.t/6)+(Bo&&Bo.goalTag?Bo.goalTag(b):''):'')},
  botPre(a,dt){const B=a.bot;B.epT=(B.epT||0)-dt;if(B.epT>0)return;B.epT=.5;const ph=this.ph,D=this.S();B.epObj=ph==='move'||ph==='board'||D.k==='escape'||(D.k==='terms'||D.k==='act'||D.k==='breach')&&ph==='run';
    // a fallen teammate close by with nothing on top of them: go and get them up (not on the way out of a zone, into the lift or in the
    // escape: the next zone gets everyone up anyway, and the escape only counts the living; nor where the chapter says it is covered:
    // C.reviveBad); the last one standing looks twice as far
    let best=null,bd=humansAlive()===1?48:24;if(this.reviveOK()&&ph!=='move'&&ph!=='board'&&D.k!=='escape')for(const h of SCEN.H){if(h.alive||h===a||h.team!==TH)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)+Math.abs(h.c.y-a.c.y)*2;
      if(d<bd&&!zNearPt(h.c.x,h.c.y,h.c.z,5)&&!this.bossNear(h.c.x,h.c.z,9)&&!TELE.at(h.c.x,h.c.z,.5)&&!(this.C.reviveBad&&this.C.reviveBad(h))){bd=d;best=h}}
    // (on the way there, and while holding E, it only backs off from a zombie right on it: B.epObj)
    if(best){if(B.epRv!==best){B.epRv=best;B.rvT=0;B.path=null;B.repath=0}B.spot=[best.c.x,best.c.y,best.c.z];B.camp=null;B.epObj=true;return}
    if(B.epRv){B.epRv=null;B.rvT=0;B.epG=null}
    const k=this.goalKey();if(B.epG!==k){SCEN.spotNear(a);B.epG=k}},
  botPost(a,dt){const B=a.bot,c=a.c,Bo=this.B();if(this.C.botPost)this.C.botPost(a,dt);
    if(a.knockT>0){a.cmd.f=a.cmd.s=0;a.cmd.jump=false;a.cmd.fire=false;return}
    // the boss fight: standing about for 4 s without firing (no way to the spot, nothing in sight) = a new path and the next spot
    if(this.ph==='run'&&this.S().k==='boss'&&a.alive){if(Math.hypot(c.x-(B.stX||0),c.z-(B.stZ||0))>1.2||Math.abs(c.y-(B.stY||0))>1||a.cmd.fire||a.epUse>=0){B.stX=c.x;B.stZ=c.z;B.stY=c.y;B.stT=0}
      else{B.stT=(B.stT||0)+dt;if(B.stT>4){B.stT=0;B.stN=(B.stN||0)+1;B.path=null;B.repath=0;B.epG=null;SCEN.spotNear(a)}}}
    if(a.blindT>0){a.cmd.fire=a.cmd.fire&&Math.random()<.15}
    // in a red warning: out of it, now (the boss may add its own dangers: laser sights, tripwires)
    const hz=TELE.at(c.x,c.z,.8)||(Bo&&Bo.danger?Bo.danger(a):null);if(hz){AI.moveDir(a,hz.ax,hz.az);a.cmd.walk=false;a.cmd.duck=!!hz.duck;a.epUse=-1;return}
    const h=B.epRv;if(h&&!h.alive&&this.reviveOK()){const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);
      if(d<1.25&&Math.abs(h.c.y-c.y)<1.6){a.cmd.f=a.cmd.s=0;B.rvT=(B.rvT||0)+dt;if(B.rvT>=4){B.rvT=0;B.epRv=null;this.reviveAt(h,a)}}else B.rvT=0;a.epUse=-1;return}
    // a device in reach: hold E there, unless a zombie is right on it (the boss fight's own devices when the boss says it is worth it)
    a.epUse=-1;const k=this.S().k;if(this.ph!=='run')return;
    if(k==='act'){const j=this.devNear(a);if(j>=0&&!zNearPt(c.x,c.y,c.z,2.6)){a.epUse=j;a.cmd.f=a.cmd.s=0;a.cmd.jump=false}}
    else if((k==='boss'||k==='breach'&&this.C.breachDev)&&Bo&&Bo.botUse){const j=Bo.botUse(a);if(j>=0&&!zNearPt(c.x,c.y,c.z,2.6)){a.epUse=100+j;a.cmd.f=a.cmd.s=0;a.cmd.jump=false}}},
  bossNear(x,z,r){const b=this.bossA();return !!(b&&Math.hypot(b.c.x-x,b.c.z-z)<r)},
  // the chapter's own zombies (the boss, the straitjackets, ...) own their controls
  zPost(a){const Z=EPZ[a.zc];if(Z&&Z.post)Z.post(a)},
  // ---------- records, unlocks ----------
  recLS(){return LS.get('eprec',{})||{}},
  // the best clear of a chapter (any difficulty, or one): {t, m (medal), d (difficulty), c (clears)}
  rec(ep,d){let best=null;const M=typeof ACC!=='undefined'&&ACC.me&&ACC.me.eps||[];const rank={S:3,A:2,B:1},better=(r)=>!best||(rank[r.m]||0)>(rank[best.m]||0)||(rank[r.m]||0)===(rank[best.m]||0)&&r.t<best.t;
    for(const r of M){if(r.ep!==ep||d!=null&&r.diff!==d||!(r.clears>0))continue;const o={t:r.best_time,m:r.best_medal,d:r.diff,c:r.clears};if(better(o))best=o}
    const E=this.recLS()[ep]||{};for(const k in E){const r=E[k];if(d!=null&&+k!==d||!(r.c>0))continue;const o={t:r.t,m:r.m,d:+k,c:r.c};if(better(o))best=o}return best},
  unlocked(n){if(n<=1)return true;const E=EPS[n];if(!E||E.soon)return false;return !!this.rec(n-1)},
  saveLocal(){const r=this.res;if(!r||!r.win||!this.id)return;const A=this.recLS(),e=A[this.id]=A[this.id]||{},o=e[r.diff]||{c:0},rank={S:3,A:2,B:1};
    o.c=(o.c||0)+1;if(!o.t||r.time<o.t)o.t=r.time;if(!o.m||rank[r.medal]>rank[o.m])o.m=r.medal;e[r.diff]=o;LS.set('eprec',A)},
  // ---------- the title cards ----------
  card(kind){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI(),E=this.C,K=E.cards||{};
    if(kind==='boss')el.innerHTML=`<div class="ec boss"><img src="${portrait('z_'+E.k,150)}"><div class="tx"><small>${E.code} · ${K.who?K.who[L]:''}</small><h2>${E.n[1]}</h2><p>${K.line?K.line[L]:''}</p></div></div>`;
    else el.innerHTML=`<div class="ec"><img class="sil" src="${portrait('z_'+E.k,150)}"><div class="tx"><small>${E.season>1?(L?'SEASON '+E.season+' · ':'시즌 '+E.season+' · '):''}${L?'CHAPTER '+this.id:this.id+'챕터'} · ${K.place?K.place[L]:''}</small><h1>${E.t[L]}</h1><p>${mapName(E.map)} — ${L?'Recovery Team 2 (RT-2)':'2차 회수팀 RT-2'}</p><b>${E.n[1]} · ${E.code}</b></div></div>`;
    el.className='on'+(kind==='boss'?' b':'');clearTimeout(this.cardT);this.cardT=setTimeout(()=>{el.className=''},kind==='boss'?3800:4800)},
  // ---------- the HUD ----------
  barSetup(){const el=$('hEp'),B=this.B(),hd=$('hud');if(hd)hd.classList.remove('epB');if(!el||!B)return;const L=LI(),bb=el.querySelector('.eb');bb.style.display='none';bb.querySelector('.bh b').textContent=B.name[1];bb.querySelector('.bh em').textContent=B.code;
    const s=bb.querySelectorAll('.hp s');(B.ticks||[60,25]).forEach((v,i)=>{if(s[i])s[i].style.left=v+'%'});
    const g2=bb.querySelector('.g2');g2.style.display=B.g2?'':'none';if(B.g2)g2.querySelector('b').textContent=B.g2[L];bb.querySelector('.g1 b').textContent=L?'STAGGER':'그로기'},
  hud(){const el=$('hEp');if(!el)return;const P=G.player,on=G.st!=='menu'&&!!P&&this.on;const ds=on?'block':'none';if(el.style.display!==ds)el.style.display=ds;
    const hs=$('hScen');if(hs&&hs.style.display!=='none')hs.style.display='none';HUD.el.hud.classList.toggle('scen',on);HUD.el.hud.classList.toggle('ep',on);if(!on)return;
    const L=LI(),D=this.S(),E=this.C,ph=this.ph,st=this.st,M=MAP.ez,Bo=this.B();
    const t1=`<b>${L?'CH.'+this.id:this.id+'챕터'} ${E.n[L]}</b><span>${L?'ZONE':'구역'} ${D.z} · ${D.n[L]}</span><span class="sclv">${SC_HEART.repeat(Math.max(0,SCEN.lives))}<i>${SC_HEART.repeat(Math.max(0,3-SCEN.lives))}</i></span>`;
    const tl=el.querySelector('.et');if(tl.dataset.s!==t1){tl.dataset.s=t1;tl.innerHTML=t1}
    // the goal line and its bar
    let ot='',pr=-1,warn='';const ts=Math.max(0,Math.ceil(this.t)),sec=L?'s':'초',on2=D.on||['',''];
    const ov=E.objText?E.objText(L,ts):null;
    if(ov){ot=ov[0];pr=ov[1]!=null?ov[1]:-1;warn=ov[2]||''}
    else if(ph==='fail')ot=L?'Wiped out — trying again':'전멸 — 다시 시작';
    else if(ph==='over')ot='';
    else if(ph==='move'){ot=(L?'Go through the open door':'열린 문으로 이동')+` · ${ts}${sec}`}
    else if(D.k==='waves'){ot=ph==='wave'?`${L?'Wave':'웨이브'} ${Math.max(1,this.w)}/3 · ${L?'left':'남은 좀비'} <b class="z">${this.remain}</b>`:ph==='break'?`${L?'Wave clear — next in':'웨이브 클리어 — 다음까지'} ${ts}${sec}`:`${on2[L]} · ${ts}${sec}`}
    else if(D.k==='terms'){const TT=M&&M[D.ring||'terms'],T0=TT&&TT[this.obj.i];ot=`${on2[L]} <b>${this.obj.i+1}/${TT?TT.length:1}</b> · ${T0?T0.n[L]:''}`;pr=this.obj.p/(D.t||25);
      warn=this.obj.z>0?(L?'Zombies in the ring!':'원 안에 좀비!'):this.obj.h===0?(L?'Stand in the ring':'원 안에 서 있어야 진행'):''}
    else if(D.k==='act'){const Lv=this.devs(),n=Lv.length,done=n-this.devLeft();ot=`${on2[L]} <b>${done}/${n}</b>`;
      // the bar: the device the player is at, else the one furthest along
      let bi=this.use.dev;if(bi<0){let bp=-1;for(let j=0;j<n;j++)if(this.devOpen(j)&&(this.obj.ps[j]||0)>bp){bp=this.obj.ps[j]||0;bi=j}}
      if(bi>=0&&Lv[bi]){pr=(this.obj.ps[bi]||0)/Lv[bi].t;ot+=` · ${Lv[bi].n[L]}`}
      warn=this.obj.h>0?(L?'Holding…':'가동 중…'):this.obj.z>0?(L?'Zombies at the device!':'장치 근처에 좀비!'):(L?'Hold E at it':'옆에서 E를 길게')}
    else if(D.k==='hold'){ot=`${on2[L]} <b>${fmtT(Math.max(0,(D.len||60)-this.obj.p))}</b>`;pr=this.obj.p/(D.len||60)}
    else if(D.k==='breach'){ot=`${on2[L]} <b class="z">${fmtT(Math.max(0,(D.len||180)-this.obj.p))}</b>`;pr=1-this.obj.p/(D.len||180)}
    else if(D.k==='boss')ot=ph==='prep'?`${Bo?Bo.wake[L]:''} ${ts}${sec} · ${L?'pick a supply box':'보급 상자를 고르세요'}`:on2[L];
    else if(D.k==='escape'){ot=`${on2[L]} <b class="z">${fmtT(this.t)}</b>`;pr=this.t/(D.len||60)}
    const ol=el.querySelector('.eo'),os=ot+'|'+warn;if(ol.dataset.s!==os){ol.dataset.s=os;ol.querySelector('span').innerHTML=ot+(warn?` <em>${warn}</em>`:'')}
    const bar=ol.querySelector('i');bar.style.display=pr>=0?'block':'none';if(pr>=0)bar.firstChild.style.width=(clamp(pr,0,1)*100).toFixed(1)+'%';
    // the boss bar
    const Bs=this.bs(),bb=el.querySelector('.eb'),bon=!!(Bs&&Bs.a.alive&&(D.k==='boss'||this.meet&&this.meet.st==='on'||D.meet&&Bs.a.alive));if(bb.style.display!==(bon?'block':'none')){bb.style.display=bon?'block':'none';const hd=$('hud');if(hd)hd.classList.toggle('epB',bon)}
    if(bon&&Bo){const a=Bs.a,H=Bo.hud(Bs,L);bb.querySelector('.hp u').style.width=Math.max(0,a.hp/a.maxHp*100).toFixed(1)+'%';
      const k=H.ss+'|'+H.sp+'|'+H.cls;if(bb.dataset.s!==k){bb.dataset.s=k;bb.querySelector('.bs').textContent=H.ss;bb.querySelector('.bs').className='bs'+(H.cls?' '+H.cls:'');bb.querySelector('.bp').textContent=H.sp}
      bb.querySelector('.g1 u').style.width=clamp(H.g1,0,1)*100+'%';const g2=bb.querySelector('.g2');if(Bo.g2){g2.style.visibility=H.g2==null?'hidden':'visible';if(H.g2!=null)g2.querySelector('u').style.width=clamp(H.g2,0,1)*100+'%'}}
    // the clock never blinks red here; the upgrade level next to the gun's name; the supply box clock
    if(HUD.el.hTime.className==='low')HUD.el.hTime.className='';const wn=HUD.el.hWName,lv=P.wup&&P.wup[P.cur];if(lv&&P.alive&&P.team===TH&&!wn.textContent.endsWith(' +'+lv))wn.textContent+=' +'+lv;
    if(SCEN.pickOpen&&!AU.throttle('scpk',250))SCEN.pickTick();
    if(!AU.throttle('eprd',500))this.radioDraw();this.useHud();this.markHud()},
  useHud(){const el=$('hUse');if(!el)return;const P=G.player,U=this.use,L=LI(),tch=typeof TOUCH!=='undefined'&&TOUCH.on;let s='',k=0,cls='';
    if(P&&P.alive&&P.grabT>0){s=this.C&&this.C.grabText?this.C.grabText[L]:(L?'PINNED — a teammate has to shoot it off':'붙잡혔다 — 동료가 쏴서 떼어 줘야 해요');cls='g'}
    else if(P&&P.alive&&P.knockT>0){s=L?'KNOCKED DOWN':'넘어졌다!';cls='g'}
    else if(P&&P.alive&&U.tg){s=(tch?(L?'Hold ✚ — get ':'✚ 길게 — '):(L?'Hold E — get ':'E 길게 — '))+esc(U.tg.name)+(L?' up':' 일으키기');k=U.t/4;cls='u'}
    else if(P&&P.alive&&U.dev>=0){const v=this.devs()[U.dev];if(v){s=(tch?(L?'Hold ✚ — ':'✚ 길게 — '):(L?'Hold E — ':'E 길게 — '))+v.act[L];k=(this.obj.ps[U.dev]||0)/v.t;cls='u'+(G.t<(P.useBlk||0)?' x':'')}}
    else if(P&&P.alive&&U.bd>=0){const Bo=this.B(),v=Bo&&Bo.useInfo?Bo.useInfo(U.bd,L):null;if(v){s=v.x?v.act:(tch?(L?'Hold ✚ — ':'✚ 길게 — '):(L?'Hold E — ':'E 길게 — '))+v.act;k=v.p;cls='u'+(v.x||G.t<(P.useBlk||0)?' x':'')}}
    const c=s?'on '+cls:'';if(el.className!==c)el.className=c;const hd=el.parentNode;if(hd&&hd.classList.contains('uOn')!==!!s)hd.classList.toggle('uOn',!!s);if(el.dataset.s!==s){el.dataset.s=s;el.querySelector('span').innerHTML=s}el.querySelector('u').style.width=(clamp(k,0,1)*100).toFixed(1)+'%';
    if(typeof TOUCH!=='undefined'&&TOUCH.el){const b=TOUCH.el.querySelector('.tUse');if(b){const on=!!(P&&P.alive&&(U.tg||U.dev>=0||U.bd>=0));if(b.classList.contains('show')!==on)b.classList.toggle('show',on)}}},
  // world markers: the goal, the boss's devices, fallen teammates
  markHud(){const lay=$('epMk'),P=G.player,M=MAP.ez;if(!lay||!P||!M)return;const L=LI(),list=[],ph=this.ph,D=this.S(),C=this.C,Bo=this.B();
    if(!(C.markers&&C.markers(list,L,P))){
      if(ph==='move'){const d=M.door&&M.door[D.z];if(d)list.push([d[0],d[1]+1.2,d[2],D.doorN?D.doorN[L]:(L?'DOOR':'출입문'),'g'])}
      else if(ph==='run'){
        if(D.k==='terms'){const T0=M[D.ring||'terms'][this.obj.i];if(T0)list.push([T0.x,T0.y+1.8,T0.z,T0.n[L],'g'])}
        else if(D.k==='act'){const Lv=this.devs();for(let j=0;j<Lv.length;j++)if(this.devOpen(j)){const v=Lv[j];list.push([v.x,v.y+(v.mh||1.9),v.z,v.n[L],'g'])}}
        else if(D.k==='hold'&&D.mk)list.push([D.mk[0],D.mk[1],D.mk[2],D.mk[3][L],'d']);
        else if(D.k==='breach'){const gb=M.goal&&M.goal[D.goal];if(gb)list.push([gb.p[0],gb.p[1]+2.5,gb.p[2],gb.n[L],'g'])}
        else if(D.k==='boss'&&Bo&&Bo.markers)Bo.markers(list,L,P);
        else if(D.k==='escape'&&M.exitMk)list.push([M.exitMk[0],M.exitMk[1],M.exitMk[2],L?'EXIT':'탈출','g'])}}
    for(const h of SCEN.H)if(!h.alive&&h!==P&&h.team===TH&&this.reviveOK())list.push([h.c.x,h.c.y+.9,h.c.z,'✚ '+h.name,'r']);
    const pool=this.mk||(this.mk=[]);while(pool.length<list.length){const d=document.createElement('div');d.className='epMk';lay.appendChild(d);pool.push(d)}
    // (a marker never sits on the chapter panel at the top)
    const W=innerWidth,H=innerHeight,cam=R.cam,he=$('hEp'),hr=he&&he.offsetParent?he.getBoundingClientRect():null;for(let i=0;i<pool.length;i++){const d=pool[i],m=list[i];if(!m){if(d.style.display!=='none')d.style.display='none';continue}
      _epv.set(m[0],m[1],m[2]).project(cam);const sx=(_epv.x*.5+.5)*W,sy=(-_epv.y*.5+.5)*H;
      if(_epv.z>1||Math.abs(_epv.x)>1.1||Math.abs(_epv.y)>1.1||hr&&sy<hr.bottom+14&&sx>hr.left-50&&sx<hr.right+50){if(d.style.display!=='none')d.style.display='none';continue}
      const dist=Math.round(Math.hypot(m[0]-P.c.x,m[2]-P.c.z)),tx=m[3]+(m[4]==='g'||m[4]==='d'?` ${dist}m`:'');if(d.dataset.t!==tx){d.dataset.t=tx;d.textContent=tx}
      const cl='epMk '+m[4];if(d.className!==cl)d.className=cl;d.style.display='block';d.style.left=sx.toFixed(1)+'px';d.style.top=sy.toFixed(1)+'px'}},
  deadText(){const L=LI(),ph=this.ph,D=this.S(),C=this.C;const ov=C.deadText?C.deadText(L):null;if(ov)return ov;
    if(ph==='move'||ph==='board')return L?'Down — a teammate can get you up, or you are back in the next zone · spectating':'쓰러짐 — 아군이 일으켜 주거나, 다음 구역에서 부활 · 관전 중';
    if(D.k==='waves')return L?'Down — back at the next wave, or when a teammate gets you up · spectating':'쓰러짐 — 다음 웨이브에, 또는 아군이 일으켜 주면 부활 · 관전 중';
    if(D.k==='escape')return L?'Down — a teammate can get you up (E, 4 s); the team still escapes without you · spectating':'쓰러짐 — 아군이 E로 일으켜 줄 수 있어요 · 남은 팀이 탈출해도 클리어 · 관전 중';
    return L?'Down — a teammate can get you up (E, 4 s) · spectating':'쓰러짐 — 아군이 옆에서 E로 일으켜 줄 수 있어요 · 관전 중'},
  resHtml(){const r=this.res||{win:!!SCEN.win,time:0,lost:3-SCEN.lives,st:this.st,medal:''},L=LI(),E=this.C||EPS[this.id]||EPS[1],esc=this.hasEscape();
    return `<div class="epRes ${r.win?'w':'l'}"><div class="top">${r.medal?`<i class="md m${r.medal}">${r.medal}</i>`:''}<div class="h"><small>${L?'CH.'+this.id:this.id+'챕터'} · ${E.t[L]}</small><b>${r.win?(esc&&r.bonus?(L?'ESCAPED':'탈출 성공'):(L?'CHAPTER CLEAR':'챕터 클리어')):(L?'GAME OVER':'게임 오버')}</b></div></div>
      <div class="rw"><span>${L?'Time':'시간'} <b>${fmtT(r.time)}</b></span><span>${L?'Lives lost':'잃은 목숨'} <b>${r.lost}</b></span><span>${L?'Reached':'도달'} <b>${Math.min(4,r.st||1)}/4</b></span><span>${T('d'+(G.diff||0))}</span>${r.win&&esc&&!r.bonus?`<span class="nb">${L?'no escape bonus':'탈출 보너스 없음'}</span>`:''}</div></div>`}};
const _epv=new THREE.Vector3();

// ---------- the lobby: chapter cards (room settings), a dropdown and a preview (multiplayer waiting room) ----------
// (v6.24: each shows the first-clear team of the difficulty picked — the hall of fame, hof.js)
function epCards(act){const L=LI(),cur=epSel(CFG);
  const card=id=>{const E=EPS[id],lk=!!E.soon||!EP.unlocked(id),on=cur===id&&!lk,rc=!E.soon&&EP.rec(id);
    return `<div class="epc${on?' on':''}${lk?' lk':''}"${lk?'':` data-act="${act}" data-v="ep:${id}"`}><div class="pi">${E.soon?'<b class="q">?</b>':`<img src="${portrait('z_'+E.k,56)}">`}</div>
      <div class="tx"><small>${epSz(E)}${L?'CH.'+id:id+'챕터'} · ${E.code}</small><b>${E.n[L]}${E.soon?` <i>${L?'coming soon':'준비 중'}</i>`:!EP.unlocked(id)?` <i>${L?'clear CH.'+(id-1)+' first':(id-1)+'챕터를 깨면 열림'}</i>`:''}</b>${E.soon?'':`<span>${mapName(E.map)}</span><em>${E.file[0][L]}</em><em>${E.file[1][L]}</em>`}${E.soon?'':HOF.cardLine(id,CFG.diff|0)}</div>
      ${rc?`<div class="rc"><i class="md m${rc.m}">${rc.m}</i><small>${T('d'+rc.d)}<br>${fmtT(rc.t)}</small></div>`:''}</div>`};
  // the chapters that can be played, then the free scenario, then the locked ones and the ones still to come
  const ids=EP_IDS,open=id=>!EPS[id].soon&&EP.unlocked(id);
  const free=`<div class="epc free${cur===0?' on':''}" data-act="${act}" data-v="ep:0"><div class="pi"><b class="q">∞</b></div><div class="tx"><small>${L?'FREE':'자유'}</small><b>${L?'Free scenario':'자유 시나리오'}</b><span>${L?'Any map · 5 stages × 3 waves · the giant':'맵 선택 · 5스테이지 × 3웨이브 · 거대 좀비'}</span></div></div>`;
  return `<div class="epl">${ids.filter(open).map(card).join('')}${free}${ids.filter(id=>!open(id)).map(card).join('')}</div>`}
function epOpts(){const L=LI(),o=[];for(const id of EP_IDS){const E=EPS[id];if(E&&!E.soon)o.push([id,`${L?'CH.'+id:id+'챕터'} · ${E.n[L]}`])}o.push([0,L?'Free scenario':'자유 시나리오']);return o}
function epPrev(id,d){const L=LI(),E=EPS[id]&&!EPS[id].soon?EPS[id]:EPS[1],rc=EP.rec(id);
  return `<div class="epPrev"><img src="${portrait('z_'+E.k,120)}"><div><small>${epSz(E)}${L?'CH.'+id:id+'챕터'} · ${E.code}</small><b>${E.t[L]}</b><span>${mapName(E.map)}</span><em>${E.file[0][L]}</em><em>${E.file[1][L]}</em>${rc?`<p>${L?'Best':'최고 기록'}: <i class="md m${rc.m}">${rc.m}</i> ${T('d'+rc.d)} · ${fmtT(rc.t)}</p>`:''}${HOF.cardLine(E.id||id,d!=null?d|0:CFG.diff|0)}</div></div><div class="rrule"><b>${L?'Rules':'규칙'}</b>${T('epD')}</div>`}

// ---------- hooks ----------
(function(){
  // a scenario match with a chapter in its settings plays the chapter
  const ip=SCEN.initPool;SCEN.initPool=function(){ip();EP.reset();const c=G.cfg||{},E=c.mode==='scen'&&c.ep?EPS[c.ep]:null;EP.on=!!(E&&!E.soon&&MAP.ez&&MAP.id===E.map);EP.id=EP.on?c.ep:0;EP.C=EP.on?E:null;if(EP.on)EP.setup()};
  const bg=SCEN.begin;SCEN.begin=function(){if(EP.on){EP.begin();return}bg()};
  const su=SCEN.update;SCEN.update=function(dt){if(EP.on){if(SCEN.on)EP.update(dt);return}su(dt)};
  const sh=SCEN.hud;SCEN.hud=function(){if(EP.on){EP.hud();return}const e=$('hEp');if(e&&e.style.display!=='none'){e.style.display='none';HUD.el.hud.classList.remove('ep')}sh()};
  const hf=SCEN.hpFor;SCEN.hpFor=function(zc){const Z=EPZ[zc];if(Z&&Z.hp)return Z.hp();return hf(zc)};
  const orv=SCEN.onRevive;SCEN.onRevive=function(a){orv(a);if(!EP.on||!a.scen)return;const Z=EPZ[a.zc];if(Z&&Z.init)Z.init(a)};
  const pt=SCEN.pickTick;SCEN.pickTick=function(){if(!EP.on)return pt();const t=document.querySelector('#scPick .tm');if(t){const s=Math.max(0,Math.ceil(EP.t))+(LI()?'s':'초');if(t.textContent!==s)t.textContent=s}SCEN.renderUp()};
  const es=SCEN.encState;SCEN.encState=function(){const s=es();if(EP.on)s.push(EP.pack());return s};
  const ds=SCEN.decState;SCEN.decState=function(s){if(EP.on&&Array.isArray(s)&&s.length>7){SCEN.on=true;SCEN.stage=s[0];SCEN.lives=s[4];SCEN.remain=s[5];SCEN.bossId=s[6];EP.unpack(s[7]);return}ds(s)};
  // (the same goal twice keeps the path the bot is on; the leader-following check of scenario.js asks again every few seconds)
  const sn=SCEN.spotNear;SCEN.spotNear=function(a){if(EP.on&&a.bot){const B=a.bot;if(B.epRv&&!B.epRv.alive)return true;const g=EP.goal(a);
      if(g){const k=EP.goalKey();B.lead=SCEN.lead(a);B.leadAt=B.lead?[B.lead.c.x,B.lead.c.z]:null;if(B.epG===k&&B.spot)return true;
        const i=SCEN.H.indexOf(a),r=g[3]||1.5,an=i*2.3+.5,n=navSnap(g[0]+Math.cos(an)*r,g[1],g[2]+Math.sin(an)*r,3)||navSnap(g[0],g[1],g[2],4);
        if(n){B.spot=[n.x+rr(-.15,.15),n.y,n.z+rr(-.15,.15)];B.camp=null;B.path=null;B.repath=0;B.epG=k;return true}}}return sn(a)};
  // the whole team's controls in a chapter: bots revive, follow the goal, hold devices, dodge; the chapter's zombies own theirs
  // (a chapter zombie with its own brain (EPZ[zc].ai returns true) skips the scenario's zombie AI altogether: 2챕터's sniper)
  const au=AI.update.bind(AI);AI.update=function(a,dt){if(!(EP.on&&G.mode==='scen')){au(a,dt);return}
    if(a.team===TH&&a.bot&&a.alive)EP.botPre(a,dt);if(a.team===TZ&&a.alive){const Z=EPZ[a.zc];if(Z&&Z.ai&&Z.ai(a,dt))return}
    au(a,dt);if(!a.alive)return;if(a.team===TH&&a.bot)EP.botPost(a,dt);else if(a.team===TZ)EP.zPost(a)};
  // damage in: the chapter's zombies (the boss's shields, weak points, gauges, phase floors) on the host; client-side sparks
  const da0=damageActor;damageActor=function(t,dmg,src,o){
    if(!(EP.on&&t&&t.alive&&t.team===TZ&&t.scen))return da0(t,dmg,src,o);const Z=EPZ[t.zc];
    if(Z&&Z.spark&&src&&src.isPlayer)Z.spark(t,o||{});
    if(NET.cli||NET.ghost||!Z)return da0(t,dmg,src,o);
    if(Z.hit)dmg=Z.hit(t,dmg,src,o||{});
    const r=da0(t,dmg,src,o);if(r>0&&Z.after)Z.after(t,r,src,o||{});return r};
  // claws: the chapter's zombies may hit harder, shove, or have none
  const ca=clawApply;clawApply=function(a,t,heavy){if(EP.on&&a&&a.scen){const Z=EPZ[a.zc];if(Z&&Z.claw&&Z.claw(a,t,heavy))return}return ca(a,t,heavy)};
  // a hit on a human holding a device breaks it off (host decides; the player who was hit hears it)
  const hh=hurtHuman;hurtHuman=function(t,dmg,src,o){const was=t&&t.alive;hh(t,dmg,src,o);if(!(EP.on&&was&&dmg>0&&!NET.cli&&t.team===TH))return;
    if(t.epUse>=0||t.isPlayer&&(EP.use.dev>=0||EP.use.bd>=0)){t.useBlk=G.t+.9;if(t.isPlayer)EP.useHit();else if(t.net&&NET.host)netEv('epui',{i:t.id})}};
  // the rig's extras every frame (all pages)
  const uv0=updateVisual;updateVisual=function(a,dt){const Z=EP.on||a.team===TZ?EPZ[a.zc]:null,z=Z&&a.team===TZ;if(z&&Z.pre)Z.pre(a,dt);uv0(a,dt);if(z&&Z.attach)Z.attach(a)};
  // a chapter's zombie dying: the boss ends its fight; the others may leave something behind
  const kz=killZombie;killZombie=function(t,src,o){const was=t.alive;kz(t,src,o);if(!(was&&EP.on&&t.scen))return;const Z=EPZ[t.zc];if(Z&&Z.die)Z.die(t,src,o);
    const B=EP.B();if(B&&t.zc===B.zc&&!NET.cli&&!(B.isEnc&&B.isEnc(t)))EP.bossDead(t)};
  // E: the use key (getting a teammate up, holding a device); a knocked-down player cannot move or shoot; the touch layout gets a button
  const pc=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc(dt);const P=G.player;if(!P||!P.alive)return;P.cmd.use=!!Main.keys.KeyE||!!(typeof TOUCH!=='undefined'&&TOUCH.on&&TOUCH.useOn);
    if(EP.on&&P.knockT>0){P.cmd.f=P.cmd.s=0;P.cmd.jump=false;P.cmd.fire=false;P.cmd.alt=false}};
  // knocked flat: the eye drops to the floor and rolls
  const cam0=Main.camera.bind(Main);Main.camera=function(dt){cam0(dt);const P=G.player;if(EP.on&&P&&P.alive&&P.knockT>0&&!G.spec){const k=Math.min(1,P.knockT/.35);R.cam.position.y-=1.05*k;R.cam.rotateZ(.5*k);R.cam.updateMatrixWorld()}};
  if(typeof TOUCH!=='undefined'){const bd=TOUCH.build.bind(TOUCH);TOUCH.build=function(){bd();const b=document.createElement('button');b.className='tb tUse';b.dataset.t='use';b.innerHTML='✚<em>'+(LI()?'USE':'사용')+'</em>';this.el.appendChild(b)};
    const pr=TOUCH.press.bind(TOUCH);TOUCH.press=function(id,on,v){if(id==='use'){TOUCH.useOn=!!on;return}return pr(id,on,v)}}
  // the strings while dead, and the boss fight's countdown
  const T1=T;T=function(k,...a){if(EP.on&&G.mode==='scen'&&G.st!=='menu'){if(k==='scDead'||k==='permaDead')return EP.deadText();if(k==='prep'&&EP.S().k==='boss'){const B=EP.B();if(B)return B.wake[LI()]+' '+a[0]+(LI()?'s':'초')}}return T1(k,...a)};
  // results: the chapter's card instead of the stage count; the scoreboard's title
  const sr=UI.showResults.bind(UI);UI.showResults=function(){const r=sr();if(EP.on&&G.mode==='scen'){const fs=document.querySelector('#results .finalScore');if(fs)fs.innerHTML=EP.resHtml()}return r};
  const bd0=UI.board.bind(UI);UI.board=function(on){bd0(on);if(!(on&&EP.on&&G.mode==='scen'))return;const b=$('board'),h=b&&b.querySelector('h3'),fs=b&&b.querySelector('.finalScore'),L=LI(),E=EP.C,D=EP.S();
    if(h)h.textContent=`${T('board')} — ${L?'CH.'+EP.id:EP.id+'챕터'} ${E.n[L]} · ${L?'zone':'구역'} ${D.z}`;if(fs)fs.innerHTML=`<span class="h">${D.n[L]}</span> · <span class="z">${L?'Lives':'목숨'} ${SCEN.lives}</span>`};
  const hi=HUD.init.bind(HUD);HUD.init=function(){hi();const h=$('hud');
    const e=document.createElement('div');e.id='hEp';e.innerHTML='<div class="et"></div><div class="eo"><span></span><i><u></u></i></div><div class="eb"><div class="bh"><b>ALEPH</b><em>Q7-000</em><span class="bs"></span><small class="bp"></small></div><i class="hp"><u></u><s style="left:60%"></s><s style="left:25%"></s></i><div class="gg"><span class="g1"><b>'+(LI()?'STAGGER':'그로기')+'</b><i><u></u></i></span><span class="g2"><b>'+(LI()?'RAGE':'분노')+'</b><i><u></u></i></span></div></div>';h.appendChild(e);
    for(const [id,html] of [['hRadio',''],['hUse','<span></span><i><u></u></i>'],['epMk','']]){const d=document.createElement('div');d.id=id;d.innerHTML=html;h.appendChild(d)}};
  // leaving the match ends the chapter's state (lights, props, markers)
  const tt=Main.toTitle.bind(Main);Main.toTitle=function(){EP.off();return tt()};
  const tl=netToLobby;netToLobby=function(){EP.off();return tl()};
  // a room playing a chapter its players have not opened yet cannot be joined
  const lb=CLIH.lobby;CLIH.lobby=function(L,m){const c=m&&m.lob&&m.lob.cfg;if(c&&c.mode==='scen'&&epSel(c)>1&&!EP.unlocked(epSel(c))&&NET.cli){netFatal(LI()?'This room plays a chapter you have not opened yet (clear the one before it first)':'아직 열지 않은 챕터를 하는 방이에요 (앞 챕터를 먼저 깨야 열려요)');return}return lb(L,m)};
  Object.assign(CLIH,{
    eps(L,m){EP.stageStart(null,null,m)},
    epw(L,m){EP.w=m.w|0;SCEN.wave=m.w|0;EP.ph='wave';G.st='fight';G.time=0;SCEN.closePick(false);EP.waveFx(m.w)},
    epwc(){EP.ph='break';EP.t=8;G.st='prep';G.beepAt=6;SCEN.breakFx()},
    epm(L,m){EP.ph='move';EP.t=40;G.st='fight';if(m.pw!=null)EP.pow=m.pw;EP.moveFx(m.n)},
    epo(L,m){EP.obj.i=m.i;EP.obj.p=0;AU.play('morale',{vol:.6})},
    epdv(L,m){const v=EP.devs()[m.i];if(v)EP.obj.ps[m.i]=v.t;EP.devFxApply(m.i)},
    epui(L,m){const P=G.player;if(P&&P.id===m.i)EP.useHit()},
    epgo(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);EP.ph='run';G.st='fight';SCEN.closePick(false);EP.goFx()},
    epk(L,m){TELE.clear();ELAS.clear();if(m.e){EP.st++;EP.ph='run';EP.t=60}EP.deadFx()},
    epf(L,m){SCEN.lives=m.l|0;EP.ph='fail';G.st='end';TELE.clear();ELAS.clear();SCEN.failFx()},
    epend(L,m){EP.res={win:!!m.w,bonus:!!m.b,time:+m.tm||0,lost:m.l|0,st:m.s|0,diff:G.diff||0};EP.res.medal=EP.medal(EP.res);EP.ph='over';SCEN.win=!!m.w;SCEN.best=m.w?4:Math.max(0,(m.s|0)-1);G.st='end';TELE.clear();ELAS.clear();if(m.q)EP.later(2.8,()=>EP.endFx());else EP.endFx();EP.saveLocal()},
    eprh(L,m){for(const q of m.P||[]){const a=byIdAny(q[0]);if(a&&!a.alive){SCEN.reviveOne(a,[q[1]/100,q[2]/100,q[3]/100]);a.hp=q[4]||100}}},
    epdz(L,m){for(const i of m.i||[]){const a=byIdAny(i);if(a)EP.despawn(a)}},
    epg(L,m){EP.setGates(m.m,!!m.i,true);EP.gmT=G.t},
    epn(L,m){EP.radio(m.k)},
    epx0(L,m){if(m.k==='dark')EP.setDark(!!m.o,true);else if(m.k==='pow')EP.setPow(m.o,true)}});
  Object.assign(HOSTH,{
    eprv(L,m){const a=actorOfKey(L.key),t=byIdAny(m.i);if(EP.on&&a&&a.alive&&t&&!t.alive&&t.team===TH&&EP.reviveOK()&&Math.hypot(a.c.x-t.c.x,a.c.z-t.c.z)<2.8)EP.reviveAt(t,a)},
    epuse(L,m){const a=actorOfKey(L.key);if(EP.on&&a)a.epUse=m.d|0}});
})();

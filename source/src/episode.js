'use strict';
// ============ Episodes (v6.20): the zombie scenario told as a story (players see them as chapters: 1챕터 「좀비 시나리오: 알레프」) ============
// An episode is the scenario (scenario.js: the pool of zombies, waves, three shared lives, supply boxes, upgrades) played across the
// zones of one map (MAP.ez), with a goal per stage, a boss and an escape (aleph.js fights them):
//   1 the outer checkpoint — three waves; then the research wing's glass doors open
//   2 the lobby — hold the two security terminals in turn (25 s each, a zombie inside the ring stops the count) while the infected
//     keep coming; then the inner security door opens
//   3 the lab corridor — hold out 60 s for the cargo lift. ALEPH bursts out of a lab, shows a charge or two and backs off once it has
//     lost a tenth of its health (or after 35 s); then the team boards, rides down 15 s and steps out in B4
//   4 B4 — the boss fight, three phases. A wipe replays the phase it reached, at that phase's health
//   5 the escape — 60 s back to the lift (late still clears, without the bonus)
// Between stages the next door opens with a supply box; everybody inside the next zone (or 40 s) starts the next stage. The fallen
// get up when a teammate holds E next to them for 4 s (30 hp); everybody gets up between stages, between waves and at boss phases.
// Host-authoritative: the host runs the flow; clients get it in the snapshot (SCEN.encState → EP.pack) and as events (eps, epg, ...).
const EPS={
  1:{id:1,k:'aleph',map:'ep1',code:'Q7-000',n:['알레프','ALEPH'],t:['좀비 시나리오: 알레프','Zombie Scenario: ALEPH'],
    file:[['최초 감염자 Q7-000. 맞을수록 분노가 차올라 폭주한다','Patient zero, Q7-000: every hit feeds its rage until it snaps'],['등의 주황 혈청 탱크가 약점 · 기둥 패널로 감전','The orange tank on its back is the weak point · shock it at the pillars']]},
  2:{id:2,k:'argus',n:['아르고스','ARGUS'],code:'RT1-07',soon:1},
  3:{id:3,k:'khepri',n:['케프리','KHEPRI'],code:'Q7-303',soon:1},
  4:{id:4,k:'lyrebird',n:['라이어버드','LYREBIRD'],code:'RT1-05',soon:1},
  5:{id:5,k:'tiamat',n:['티아마트','TIAMAT'],code:'Q7-Ω',soon:1}};
// the scenario plays episode 1 until the player picks another (0 = the free scenario)
const epSel=c=>c&&c.ep!=null?c.ep|0:1;
function epMapOf(c){const e=c&&c.mode==='scen'?EPS[epSel(c)]:null;return e&&!e.soon?e.map:(c&&MAPDEFS[c.map]&&!MAPDEFS[c.map].ep?c.map:'q7')}
const EP1=[null,
  {z:'A',k:'waves',n:['외곽 검문소','Outer checkpoint']},
  {z:'B',k:'terms',n:['로비 · 보안실','Lobby · security'],mix:[['rager',52],['runner',24],['strait',14],['spitter',6],['scream',4]]},
  {z:'C',k:'hold',n:['연구 복도','Lab corridor'],mix:[['rager',44],['runner',28],['strait',14],['bomber',10],['brute',4]]},
  {z:'D',k:'boss',n:['B4 격리 실험장','B4 isolation chamber']},
  {z:'D',k:'escape',n:['탈출','The escape'],mix:[['runner',55],['rager',33],['strait',12]]}];
// the radio: [ko, en, who (0 control, 1 the team)]
const EP_RADIO={
  start:['2차 회수팀, Q-7 외곽 검문소 도착. 1차 회수팀(RT-1)은 4시간째 응답이 없다.','RT-2, you are at the Q-7 checkpoint. RT-1 has not answered for four hours.',0],
  w1:['철조망이 뚫렸다! 검문소부터 정리해.','The wire is down! Clear the checkpoint first.',0],
  s1c:['연구동 유리문 원격 해제. 안으로 들어가.','Research wing doors unlocked. Get inside.',0],
  s2:['보안 단말 두 곳에서 출입 기록을 뽑아 — 1층 보안실, 2층 서버실.','Pull the access logs from both terminals: the security room, then the server room upstairs.',0],
  strait:['구속복 입은 놈들이다! 붙잡히면 못 쏴 — 서로 떼어 줘!','Straitjackets! One pins you and you cannot shoot — get them off each other!',1],
  t1:['첫 번째 단말 확보. 2층 서버실로.','First terminal done. Up to the server room.',0],
  s2c:['기록 확보… RT-1이 지하 B4로 내려갔다. 안쪽 보안문 연다.','Got the logs… RT-1 went down to B4. Opening the inner door.',0],
  s3:['복도 끝 화물 엘리베이터 호출 중. 60초만 버텨.','Calling the cargo lift at the end of the corridor. Hold out 60 seconds.',0],
  enc:['벽 너머에 뭔가 있어—!','Something is behind that wall—!',1],
  enc2:['저건… Q7-000, 알레프. 최초 감염자다!','That is… Q7-000. ALEPH. Patient zero!',0],
  aRet:['놈이 물러난다! 엘리베이터는?','It is pulling back! Where is that lift?',1],
  lift:['엘리베이터 도착. 전원 탑승!','The lift is here. Everybody in!',0],
  ride:['B4 격리 실험장으로 내려간다. 알레프가 거기 있다.','Going down to the B4 isolation chamber. ALEPH is there.',0],
  s4:['등의 주황 혈청 탱크가 약점이다. 기둥 전기 패널, 증기 배관도 써.','The orange tank on its back is the weak point. Use the pillar panels and the steam valves.',0],
  b0:['구속이 끊어졌다—온다!','It broke loose—here it comes!',1],
  aP2:['격벽을 뜯어 방패로 쓴다! 옆이나 뒤로 돌아, HE로 부숴!','It ripped the bulkhead off for a shield! Flank it, or break it with HE!',1],
  aP3:['전력이 나갔다! 비상등뿐이다—놈이 날뛴다!','The power is out! Emergency lights only—it is going wild!',0],
  aFren:['분노 폭주다! 거리 벌려!','It is raging! Get some distance!',1],
  aExh:['지쳤다! 지금 몰아쳐!','It is spent! Hit it now!',1],
  aDown:['쓰러졌다! 집중 사격!','It is down! Pour it on!',1],
  aTank:['혈청 탱크 파괴! 더는 분노 못 한다!','Serum tank destroyed! No more rage!',1],
  aShB:['방패가 깨졌다!','The shield broke!',1],
  aWall:['벽에 박았다—지금이야!','It hit the wall—now!',1],
  aPanel:['감전! 패널이 먹혔다!','Shocked! The panel worked!',1],
  aEnr:['놈이 더 빨라진다—시간을 끌면 안 돼!','It is getting faster—we cannot drag this out!',0],
  grab:['붙잡혔어! 누가 좀 떼어 줘!','It has me! Somebody get it off!',1],
  dead:['알레프 무력화 확인! 60초 안에 엘리베이터로 탈출해!','ALEPH is down! Back to the lift—60 seconds!',0],
  esc:['2차 회수팀 탈출 확인. 수고했다.','RT-2 is out. Good work.',0],
  late:['늦었지만… 살아 나왔군. 수고했다.','Late, but alive. Good work.',0]};
Object.assign(STR.ko,{epD:'협동 PvE 이야기 모드 — 구역 4곳을 차례로 뚫고 보스를 쓰러뜨린 뒤 60초 안에 탈출. 팀 목숨 3개: 전멸하면 그 구역을(보스전은 그 페이즈를) 다시. 쓰러진 아군은 옆에서 E를 4초 누르면 일으킴 (체력 30).'});
Object.assign(STR.en,{epD:'Co-op PvE story: push through four zones, bring the boss down, then escape within 60 s. Three shared lives: a wipe replays the zone (the boss fight: its phase). Hold E for 4 s next to a fallen teammate to get them up (30 hp).'});
const fmtT=s=>{s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

const EP={on:false,id:0,st:0,ph:'',t:0,w:0,gm:0,gmT:-9,dark:false,dk:0,obj:{i:0,p:0,h:0,z:0},remain:0,queue:[],spawnT:0,t0:0,bossPh:1,res:null,bf:null,meet:null,
  radioL:[],use:{t:0,tg:null,sent:-9},strobe:null,stT0:0,stIntro:0,grabSaid:0,
  PH:['prep','wave','break','run','move','board','ride','fail','over'],GK:['gA','gB','gC','gD','gN','gW'],
  S(){return EP1[this.st]||EP1[1]},
  zone(k){return MAP.ez&&MAP.ez.zones[k]},
  inBox(b,x,z,pad){pad=pad||0;return x>=b[0]-pad&&x<=b[2]+pad&&z>=b[1]-pad&&z<=b[3]+pad},
  inCar(C,h,pad){pad=pad||0;return h.c.x>C.x0-pad&&h.c.x<C.x1+pad&&h.c.z>C.z0-pad&&h.c.z<C.z1+pad},
  bossA(){for(const a of SCEN.Z)if(a.alive&&a.zc==='aleph')return a;return null},
  roll(mix){let t=0;for(const e of mix)t+=e[1];let r=Math.random()*t;for(const [k,p] of mix){if(p<=0)continue;r-=p;if(r<=0)return k}return mix[0][0]},
  // ---------- gates (map.js): A glass doors, B the inner security door, C / D the lift doors, N the B4 bulkhead, W the lab wall ----------
  bit(k){return 1<<this.GK.indexOf(k)},
  gateIsOpen(k){return !!(this.gm&this.bit(k))},
  setGates(m,instant,remote){const was=this.gm;this.gm=m;
    for(let i=0;i<this.GK.length;i++){const k=this.GK[i],o=!!(m&1<<i);if(!!(was&1<<i)!==o||instant)gateSet(k,o,instant,k==='gA'?.9:k==='gB'?1.6:k==='gN'||k==='gW'?.25:1.1)}
    if(NET.host&&!remote)netEv('epg',{m,i:instant?1:0})},
  gateOpen(k,o){this.setGates(o?this.gm|this.bit(k):this.gm&~this.bit(k))},
  stageGates(n,kind){const b=k=>this.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n>=4)m|=b('gW');
    if(n===4&&kind!=='phase')m|=b('gD');if(n===4&&kind==='phase'&&this.bossPh>=2)m|=b('gN');if(n===5)m|=b('gD')|b('gN');return m},
  // ---------- match set-up (every page) ----------
  reset(){this.on=false;this.id=0;this.st=0;this.ph='';this.t=0;this.w=0;this.gm=0;this.dark=false;this.dk=0;this.obj={i:0,p:0,h:0,z:0};this.remain=0;this.queue=[];this.res=null;this.bf=null;this.meet=null;
    this.radioL=[];this.use={t:0,tg:null,sent:-9};this.bossPh=1;this.grabSaid=0;this.stIntro=0;SCEN.zsp=null;BO.on=false;BO.amb=BO.lamp=1;
    if(this.strobe){for(const L of this.strobe)L.dead=true;this.strobe=null}if(typeof ALEPH!=='undefined')ALEPH.clear();
    if(MAP.gates)for(const k in MAP.gates)gateSet(k,false,true);this.radioDraw()},
  setup(){this.card('ep')},
  begin(){this.t0=G.t;SCEN.on=true;SCEN.lives=3;SCEN.best=0;SCEN.win=false;SCEN.tq=[];G.recDone=false;for(const a of G.actors)a.wup={};this.stageStart(1,'fresh');this.say('start')},
  off(){if(!this.on)return;this.reset();const e=$('hEp');if(e)e.style.display='none';const u=$('hUse');if(u)u.className='';const m=$('epMk');if(m)m.innerHTML='';this.mk=null},
  // ---------- a stage starts (host / solo, or a client following the host's plan) ----------
  // kind: fresh (the first), next (after the last one), retry (after a wipe), phase (the boss fight again from its phase);
  // arr: where the lift put each human (id → [x,y,z,yaw])
  stageStart(n,kind,plan,arr){if(NET.cli&&!plan)return;const L=LI();
    if(plan){n=plan.s;kind=['fresh','next','retry','phase'][plan.k]||'next';SCEN.lives=plan.l;if(plan.bp)this.bossPh=plan.bp}
    // (a replay of the lobby keeps the terminals already done)
    const D=EP1[n],ti=kind==='retry'&&n===2&&this.st===2?this.obj.i:0;this.st=n;this.stT0=G.t;this.stIntro=0;SCEN.stage=Math.min(4,n);SCEN.wave=1;this.w=0;this.obj={i:ti,p:0,h:0,z:0};this.queue=[];this.spawnT=1.5;this.remain=0;this.meet=null;
    SCEN.on=true;SCEN.closePick(false,true);TELE.clear();if(kind!=='next')ROCK.clear();STEAM.clear();
    G.spec=null;G.deathCam=0;G.winner=-1;G.beepAt=6;G.lastHuman=null;FX.clearLimbs();clearNades();NY.clear();SCEN.acid.length=0;
    if(n===4&&kind!=='phase'){this.bossPh=1;ALEPH.clear()}
    const Zn=this.zone(D.z);
    // zombies: the ones still chasing inside the new zone stay, the rest go (the boss stays for a phase replay)
    const gone=[];if(plan){for(const i of plan.z||[]){const a=byIdAny(i);if(a)this.despawn(a)}}
    else for(const a of SCEN.Z){if(!a.alive)continue;if(a.boss&&kind==='phase')continue;if(kind==='next'&&Zn&&!a.boss&&n<4&&this.inBox(Zn.box,a.c.x,a.c.z))continue;this.despawn(a);gone.push(a.id)}
    this.setGates(plan?plan.g:this.stageGates(n,kind),kind!=='next',true);this.dark=n===4&&kind==='phase'&&this.bossPh>=3;
    SCEN.zsp=Zn?Zn.zsp.concat(D.z==='D'&&this.gateIsOpen('gN')?Zn.cold:[]):null;
    // humans: placed (or left where they stand inside the zone), the fallen back on their feet
    const P={},out=[];if(plan)for(const q of plan.P)P[q[0]]=q;const starts=!Zn?[]:kind==='phase'?Zn.start.map(s=>[s[0],s[1],s[2]-8.4,s[3]]):Zn.start;let si=0;
    for(const a of SCEN.H){const q=P[a.id],was=a.alive;let x,y,z,yw,keep=false;
      if(q){x=q[1]/100;y=q[2]/100;z=q[3]/100;yw=q[4]/1000;keep=!!q[5]}
      else if(arr&&arr[a.id]){[x,y,z,yw]=arr[a.id]}
      else if(kind==='next'&&was&&Zn&&n<4&&this.inBox(Zn.box,a.c.x,a.c.z)){keep=true;x=a.c.x;y=a.c.y;z=a.c.z;yw=a.yaw}
      else{const s=starts[si++%Math.max(1,starts.length)]||[0,0,0,0];x=s[0]+rr(-.12,.12);y=s[1];z=s[2]+rr(-.12,.12);yw=s[3]}
      a.team=TH;a.host=false;a.permaDead=false;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.rootT=0;a.grabT=0;a.burnT=0;
      a.nb=null;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.an.dead=0;a.an.atk=0;a.pendingClaw=null;a.zoom=0;a.lvl=1;a.deadT=0;a.maxHp=100;a.alive=true;
      if(kind==='fresh'){giveDefault(a);a.armor=0;a.hp=100;a.dmgRound=0}
      else if(!was||kind==='retry'||kind==='phase'){a.hp=100;if(!a.pup)for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}}
      // the boss fight starts topped up: health, armour, every magazine, a grenade of each
      if(n===4&&kind==='next'){a.hp=100;a.armor=100;if(!a.pup){for(const id in a.ammo){const W=WPN[id];if(W)a.ammo[id]={mag:W.mag,res:W.res}}a.inv.he=Math.max(a.inv.he||0,1);a.inv.frost=Math.max(a.inv.frost||0,1)}}
      if(!keep||!was){placeAt(a,x,y,z,yw);ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0}else ensureRig(a);
      if(NET.host)out.push([a.id,r2(x),r2(y),r2(z),r3(yw),keep?1:0]);
      if(a.isPlayer){if(!keep||!was)VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)AI.onRound(a);
      if(a.bot&&!NET.cli&&kind==='next'){const id=a.inv[1];while(id&&a.money>=SCEN.upCost(a,id)&&SCEN.upgrade(a,id,true)){}}
      ldKitReset(a)}
    HUD.feedL=[];HUD.el.hFeed.innerHTML='';HUD.clearDmg();if(kind!=='next')FX.clearDecals();
    // the stage's own start
    if(n===1){this.ph='prep';this.t=kind==='fresh'?18:10;G.st='prep';G.time=this.t}
    else if(n===4){this.ph='prep';this.t=kind==='phase'?8:12;G.st='prep';G.time=this.t;
      if(!NET.cli){let b=this.bossA();const C=MAP.ez.boss.ctr;if(!b)b=ALEPH.spawn([C[0],-.8,C[2]],Math.PI,false);else if(kind!=='phase'){ALEPH.init(b,false)}
        if(b){if(kind==='phase')ALEPH.reset(b,this.bossPh);placeAt(b,C[0],-.8,C[2],Math.PI);b.yaw=Math.PI;b.al.idle=true}}
      if(kind!=='phase'){SCEN.openPick();for(const a of SCEN.H)if(a.bot)SCEN.applyReward(a,rpick(SCEN.offerFor()),true)}}
    else{this.ph='run';this.t=0;G.st='fight';G.time=n===3?60:0}
    const sn=`${D.n[L]}`,tag=kind==='retry'||kind==='phase'?(L?'RETRY · ':'재도전 · '):'';
    // (the first stage waits for the episode's title card to fade)
    if(kind==='next'&&n<4){HUD.announce(L?'STAGE CLEAR!':'스테이지 클리어!','h',2.5);this.later(2.6,()=>HUD.announce(sn,'w',2.5))}
    else if(n===4&&kind==='next')this.later(3.9,()=>HUD.announce(sn,'w',2.4));
    else if(kind==='fresh'){this.later(4.4,()=>HUD.announce(sn,'w',2.6));this.later(5.2,()=>HUD.note(L?'Hold E next to a fallen teammate to get them up':'쓰러진 아군 옆에서 E를 길게 누르면 일으켜요',5))}
    else HUD.announce(tag+sn,kind==='retry'||kind==='phase'?'z':'w',3);
    AU.play('siren',{vol:.5});AU.muSet&&AU.muSet(n===4?'prep':'fight');
    if(n===2&&kind!=='retry')this.radio('s2');if(n===3)this.radio('s3');if(n===4&&kind==='next'){this.radio('s4');this.card('boss')}
    if(NET.host)netEv('eps',{s:n,k:['fresh','next','retry','phase'].indexOf(kind),l:SCEN.lives,P:out,g:this.gm,z:gone,bp:this.bossPh})},
  later(t,f){SCEN.later(t,f)},
  despawn(a){a.alive=false;a.permaDead=true;a.hp=0;a.deadT=99;a.an.dead=0;a.c.y=-60;a.nb=null;a.leapV=null;a.boomT=0;a.reviving=0;if(a.st&&a.st.mode==='grab')STRAIT.release(a,false);if(a.st)a.st.mode='';if(a.al)a.al.mode='gone'},
  // ---------- per frame (every page) ----------
  update(dt){SCEN.updateAcid(dt);for(let i=SCEN.tq.length-1;i>=0;i--){const q=SCEN.tq[i];q.t-=dt;if(q.t<=0){SCEN.tq.splice(i,1);q.f()}}
    for(const a of SCEN.Z){if(!a.alive){if(a.an.dead>0&&a.deadT>14)a.an.dead=0;continue}
      if(a.boomT>0){if(NET.cli)a.boomT=Math.max(0,a.boomT-dt);a.an.skill=Math.max(a.an.skill,.45);if(a.ch)a.ch.grp.scale.setScalar(1+.16*(1-a.boomT/.6)+Math.sin(G.t*55)*.02)}}
    for(const h of SCEN.H)if(h.grabT>0)h.grabT=Math.max(0,h.grabT-dt);
    gatesUpdate(dt);TELE.update(dt);ROCK.update(dt);STEAM.update(dt);CHAIN.tick();this.light(dt);this.useTick(dt);if(this.ph==='ride')this.rideFx(dt);else if(this.rideL){this.rideL.dead=true;this.rideL=null}
    if(this.ph==='prep'||this.ph==='break'){const s=Math.ceil(this.t);if(s<G.beepAt&&s>=1){G.beepAt=s;AU.play(s<=3?'beep2':'beep',{vol:.5});HUD.countdown(s)}}
    if(NET.cli)return;
    this.host(dt);
    for(const a of SCEN.Z)if(a.alive){if(a.zc==='bomber')SCEN.bomberTick(a,dt);else if(a.zc==='aleph')ALEPH.tick(a,dt);else if(a.zc==='strait')STRAIT.tick(a,dt)}},
  // ---------- the flow (host / solo) ----------
  host(dt){const ph=this.ph;
    if(ph==='over'){this.t-=dt;if(this.t<=0&&G.st!=='over'){G.st='over';UI.showResults();if(NET.host)netEv('over')}return}
    if(ph==='fail'){this.t-=dt;G.time=this.t;if(this.t<=0){if(this.st===4)this.stageStart(4,'phase');else this.stageStart(this.st,'retry')}return}
    if(ph==='ride'){this.t-=dt;G.time=this.t;if(this.t<=0)this.rideEnd();return}
    if(humansAlive()===0){if(this.st===5)this.finish(true,false);else this.fail();return}
    if(ph==='move'){this.t-=dt;G.time=this.t;const Zn=this.zone(EP1[this.st+1].z);let all=true;for(const h of SCEN.H)if(h.alive&&!this.inBox(Zn.box,h.c.x,h.c.z))all=false;
      if(all||this.t<=0)this.stageStart(this.st+1,'next');return}
    if(ph==='board'){this.t-=dt;G.time=this.t;this.trickle(dt,EP1[3].mix,.75);const C=MAP.ez.carC;let all=true;for(const h of SCEN.H)if(h.alive&&!this.inCar(C,h))all=false;
      if(all||this.t<=0)this.rideStart();return}
    if(this.st===1)this.hWaves(dt);else if(this.st===2)this.hTerms(dt);else if(this.st===3)this.hHold(dt);else if(this.st===4)this.hBoss(dt);else this.hEscape(dt)},
  // stage 1: three waves
  makeWave(w){const H=SCEN.H.length,d=G.diff||0,n=Math.round((5+2*w)*(.5+.25*H)*SC_DIFF.n[d]);const mix=[['rager',60],['runner',24],['bomber',w>=2?10:0],['brute',w>=3?6:0]];
    const q=[];for(let i=0;i<n;i++)q.push(this.roll(mix));return q},
  hWaves(dt){const ph=this.ph;if(ph==='prep'||ph==='break'){this.t-=dt;G.time=this.t;if(this.t<=0)this.waveStart(this.w+1);return}
    G.time+=dt;let alive=0;for(const a of SCEN.Z)if(a.alive)alive++;this.spawnT-=dt;
    if(this.queue.length&&alive<SCEN.POOL&&this.spawnT<=0){if(SCEN.spawn(this.queue[0])){this.queue.shift();alive++}this.spawnT=rr(.3,.65)}
    this.remain=this.queue.length+alive;SCEN.unstick(dt);if(this.remain===0)this.waveClear()},
  waveStart(w){this.w=w;SCEN.wave=w;this.ph='wave';G.st='fight';G.time=0;this.queue=this.makeWave(w);this.spawnT=.6;SCEN.closePick(false);this.reviveAll();this.waveFx(w);if(NET.host)netEv('epw',{w})},
  waveFx(w){HUD.announce((LI()?'WAVE ':'웨이브 ')+w+' / 3','w',2.5);AU.play('siren',{vol:.6});AU.muSet&&AU.muSet('fight');if(w===1)this.radio('w1')},
  waveClear(){for(const a of SCEN.H)a.money=Math.min(16000,a.money+500+this.st*100);if(this.w<3){this.ph='break';this.t=8;G.st='prep';G.time=8;G.beepAt=6;SCEN.breakFx();this.reviveAll();if(NET.host)netEv('epwc',{})}else this.stageClear()},
  // stages 1 and 2 are done: the next door opens, a supply box, then everybody walks through
  stageClear(){SCEN.best=Math.max(SCEN.best,this.st);for(const a of SCEN.H)a.money=Math.min(16000,a.money+1500);const nx=this.st+1;
    this.ph='move';this.t=40;G.st='fight';G.time=40;this.reviveAll();this.setGates(this.gm|this.stageGates(nx,'next'));this.moveFx(nx);
    for(const a of SCEN.H)if(a.bot)SCEN.applyReward(a,rpick(SCEN.offerFor()),true);if(NET.host)netEv('epm',{n:nx})},
  moveFx(nx){const L=LI();HUD.announce(L?'STAGE CLEAR!':'스테이지 클리어!','h',3);AU.play('stingH',{vol:.7});AU.muSet&&AU.muSet('win');this.radio(nx===2?'s1c':'s2c');
    HUD.note(L?'Pick a supply box, then go through the open door':'보급 상자를 고르고 열린 문으로 이동하세요',4);SCEN.openPick()},
  // a wave of infected that never ends: as many on their feet as the team can take, topped up as they fall
  trickle(dt,mix,capK){const d=G.diff||0;let alive=0;for(const z of SCEN.Z)if(z.alive&&!z.boss)alive++;const cap=Math.round((3+1.6*SCEN.H.length)*SC_DIFF.n[d]*(capK||1));
    this.spawnT-=dt;if(alive<cap&&this.spawnT<=0){const ok=SCEN.spawn(this.roll(mix));this.spawnT=ok?rr(.7,1.4)/(SC_DIFF.n[d]*(.7+.1*SCEN.H.length)):.4}},
  // stage 2: the two terminals
  hTerms(dt){G.time+=dt;const T0=MAP.ez.terms[this.obj.i];if(!T0)return;let h=0,z=0;
    for(const a of SCEN.H)if(a.alive&&Math.abs(a.c.y-T0.y)<2&&Math.hypot(a.c.x-T0.x,a.c.z-T0.z)<T0.r)h++;
    for(const a of SCEN.Z)if(a.alive&&a.reviving<=0&&Math.abs(a.c.y-T0.y)<2&&Math.hypot(a.c.x-T0.x,a.c.z-T0.z)<T0.r)z++;
    this.obj.h=h;this.obj.z=z;if(h>0&&z===0)this.obj.p=Math.min(25,this.obj.p+dt);
    if(this.obj.p>=25){this.obj.i++;this.obj.p=0;for(const a of SCEN.H)a.money=Math.min(16000,a.money+500);AU.play('morale',{vol:.6});
      if(this.obj.i>=2){this.stageClear();return}this.say('t1');if(NET.host)netEv('epo',{i:this.obj.i})}
    this.trickle(dt,EP1[2].mix,.85);SCEN.unstick(dt);let al=0;for(const a of SCEN.Z)if(a.alive)al++;this.remain=al;
    if(!this.stIntro&&G.t-this.stT0>8){for(const a of SCEN.Z)if(a.alive&&a.zc==='strait'){this.stIntro=1;this.say('strait');break}}},
  // stage 3: hold out for the lift; ALEPH meets the team on the way
  hHold(dt){this.obj.p+=dt;G.time=Math.max(0,60-this.obj.p);const E=this.meet;
    if(!E&&this.obj.p>=12)this.encStart();
    if(E&&E.st==='on'){E.t+=dt;const a=E.a;if(a&&a.alive&&a.al&&E.t>35)ALEPH.floorHit(a);if(!a||!a.alive)E.st='done'}
    this.trickle(dt,EP1[3].mix,E&&E.st==='on'?.5:1);SCEN.unstick(dt);let al=0;for(const a of SCEN.Z)if(a.alive&&!a.boss)al++;this.remain=al;
    if(this.obj.p>=60)this.boardStart()},
  encStart(){this.meet={st:'on',t:0,a:null};this.setGates(this.gm|this.bit('gW'),true);ALEPH.fx({k:'brk'});const W=MAP.ez.wallW;
    const a=ALEPH.spawn([W[0],0,W[2]-1.9],Math.PI,true);if(a){this.meet.a=a;a.al.idle=false;a.al.pt=.6;ALEPH.fx({k:'w',i:a.id,s:1.3,n:1})}
    this.say('enc');this.later(2.2,()=>this.say('enc2'))},
  encEnd(a){if(this.meet)this.meet.st='done';for(let i=0;i<24;i++)FX.spawn({x:a.c.x+rr(-1,1),y:a.c.y+rr(0,3),z:a.c.z+rr(-1,1),vx:rr(-1,1),vy:rr(0,1),vz:rr(-1,1),life:rr(1,2),s0:.5,s1:1.6,r:.4,g:.38,b:.36,a:.5,f:2,drag:1.2});
    this.despawn(a);if(NET.host)netEv('epdz',{i:[a.id]})},
  boardStart(){const E=this.meet;if(E&&E.st==='on'&&E.a&&E.a.alive)ALEPH.floorHit(E.a);this.ph='board';this.t=40;G.time=40;this.setGates(this.gm|this.bit('gC'));this.boardFx();if(NET.host)netEv('epb',{})},
  boardFx(){this.radio('lift');AU.play('powerup',{vol:.8});HUD.announce(LI()?'THE LIFT IS HERE':'엘리베이터 도착','h',2.5)},
  rideStart(){const C=MAP.ez.carC,tp=[];let i=0;
    // the last ones are pulled in as the doors close
    for(const h of SCEN.H){if(!h.alive||this.inCar(C,h))continue;const x=64+(i%3)*1.4,z=-1.6+Math.floor(i/3)*1.6;i++;placeAt(h,x,0,z,-Math.PI/2);tp.push([h.id,r2(x),0,r2(z),r3(-Math.PI/2)])}
    const ids=[];for(const a of SCEN.Z)if(a.alive){this.despawn(a);ids.push(a.id)}
    this.ph='ride';this.t=15;G.st='fight';G.time=15;this.setGates(this.gm&~this.bit('gC'));SCEN.closePick(false);this.rideBegin();if(NET.host)netEv('epr',{P:tp,z:ids})},
  rideBegin(){this.radio('ride');AU.play('blackout',{vol:.55,rate:.7});HUD.announce(LI()?'GOING DOWN TO B4':'B4로 하강','w',2.5);this.rideK=0},
  rideFx(dt){const P=G.player,C=MAP.ez&&MAP.ez.carC;if(!C)return;this.rideK=(this.rideK||0)+dt;
    if(P&&P.alive&&this.inCar(C,P,.5))FX.shake=Math.max(FX.shake,.16+.06*Math.sin(G.t*13));
    if(!this.rideL)this.rideL=DL.add(65,2,0,'#ffe2b0',7,1.4,0);const L0=this.rideL;L0.x=65;L0.z=0;L0.y=4.4-((this.rideK*1.3)%1)*4.6;L0.i=1.1;
    if(Math.floor(this.rideK/2.6)!==Math.floor((this.rideK-dt)/2.6))AU.at('land',65,1,0,{vol:.45,range:20,rate:.6})},
  rideEnd(){if(this.rideL){this.rideL.dead=true;this.rideL=null}const C=MAP.ez.carC,D=MAP.ez.carD,arr={};
    for(const h of SCEN.H){if(!h.alive)continue;const d=h.c.x-C.dx,l=h.c.z-C.dz;arr[h.id]=[D.dx-l,h.c.y,D.dz+d,wrapA(h.yaw-Math.PI/2)]}
    this.stageStart(4,'next',null,arr)},
  // stage 4: the boss
  hBoss(dt){if(this.ph==='prep'){this.t-=dt;G.time=this.t;if(this.t<=0)this.bossGo();return}G.time+=dt;let al=0;for(const a of SCEN.Z)if(a.alive&&!a.boss)al++;this.remain=al;SCEN.unstick(dt)},
  bossGo(){this.ph='run';G.st='fight';G.time=0;SCEN.closePick(false);const D=MAP.ez.carD,tp=[];let i=0;
    // out of the car: the door shuts behind the team
    for(const h of SCEN.H){if(!h.alive||h.c.z<D.z0-.4)continue;const x=-3+(i%4)*2,z=70.4-Math.floor(i/4)*1.4;i++;placeAt(h,x,0,z,0);tp.push([h.id,r2(x),0,r2(z),0])}
    this.setGates(this.gm&~this.bit('gD'));const b=this.bossA();if(b&&b.al){b.al.idle=false;b.al.pt=1.2;ALEPH.fx({k:'w',i:b.id,s:1.4,n:1})}
    this.goFx();if(NET.host)netEv('epgo',{P:tp})},
  goFx(){const L=LI();AU.play('stingZ',{vol:.8});AU.muSet&&AU.muSet('intense');HUD.announce(L?'ALEPH BREAKS ITS CHAINS':'알레프가 구속을 끊었다!','z',3);this.radio('b0')},
  bossDead(a){if(this.st!==4)return;SCEN.best=4;for(const h of SCEN.H)h.money=Math.min(16000,h.money+3000);
    this.st=5;this.ph='run';this.t=60;G.st='fight';G.time=60;this.setGates(this.gm|this.bit('gD')|this.bit('gN'));this.setDark(false);TELE.clear();
    const Zn=this.zone('D');SCEN.zsp=Zn.zsp.concat(Zn.cold);this.reviveAll();this.spawnT=2.5;this.deadFx();if(NET.host)netEv('epk',{})},
  deadFx(){const L=LI();HUD.announce(L?'ALEPH IS DOWN — GET TO THE LIFT':'알레프 무력화 — 엘리베이터로!','h',3.5);AU.play('stingH',{vol:.8});AU.muSet&&AU.muSet('intense');this.radio('dead')},
  // stage 5: the run back to the lift
  hEscape(dt){this.t-=dt;G.time=Math.max(0,this.t);this.trickle(dt,EP1[5].mix,1.4);SCEN.unstick(dt);const D=MAP.ez.carD;let all=true,n=0;
    for(const h of SCEN.H){if(!h.alive)continue;n++;if(!this.inCar(D,h,.2))all=false}if(n&&all){this.finish(true,true);return}if(this.t<=0)this.finish(true,false)},
  fail(){SCEN.lives--;this.queue=[];TELE.clear();if(SCEN.lives<=0){this.finish(false,false);return}this.ph='fail';this.t=5;G.st='end';SCEN.failFx();if(NET.host)netEv('epf',{l:SCEN.lives})},
  finish(win,bonus){if(this.ph==='over')return;this.ph='over';this.t=6;SCEN.win=win;if(win)SCEN.best=4;G.st='end';G.endT=99;SCEN.closePick(false);TELE.clear();
    this.res={win,bonus:!!bonus,time:Math.round(G.t-this.t0),lost:3-Math.max(0,SCEN.lives),st:this.st,diff:G.diff||0};this.res.medal=this.medal(this.res);
    if(win&&bonus)this.setGates(this.gm&~this.bit('gD'));this.endFx();this.saveLocal();
    if(NET.host)netEv('epend',{w:win?1:0,b:bonus?1:0,tm:this.res.time,l:this.res.lost,s:this.st})},
  endFx(){const r=this.res,L=LI();HUD.announce(r.win?(r.bonus?(L?'ESCAPED!':'탈출 성공!'):(L?'CHAPTER CLEAR':'챕터 클리어')):(L?'GAME OVER':'게임 오버'),r.win?'h':'z',5);
    AU.play(r.win?'stingH':'stingZ',{vol:.8});AU.muSet&&AU.muSet(r.win?'win':'dead');if(r.win)this.radio(r.bonus?'esc':'late')},
  // (the same rule as the server's qz_claim: S no life lost within 16 min, A one at most within 22, B the rest and every clear without the escape)
  medal(r){return !r.win?'':!r.bonus?'B':r.lost===0&&r.time<=960?'S':r.lost<=1&&r.time<=1320?'A':'B'},
  // ---------- getting back up ----------
  reviveAll(){const out=[],live=SCEN.H.filter(h=>h.alive);
    for(const a of SCEN.H){if(a.alive)continue;const b=live.length?rpick(live):null;let p;
      if(b){p=[b.c.x+rr(-1,1),b.c.y+.1,b.c.z+rr(-1,1)];if(!charFits(a.c,p[0],p[1],p[2]))p=[b.c.x,b.c.y+.1,b.c.z]}else p=[a.c.x,a.c.y+.1,a.c.z];
      SCEN.reviveOne(a,p);out.push([a.id,r2(p[0]),r2(p[1]),r2(p[2]),100])}
    if(NET.host&&out.length)netEv('eprh',{P:out})},
  reviveAt(a,by){if(a.alive||a.team!==TH)return;const p=[a.c.x,Math.max(a.c.y,-.8)+.05,a.c.z];SCEN.reviveOne(a,p);a.hp=30;
    EP.reviveNote(a,by);AU.at('heal',a.c.x,a.c.y+1,a.c.z,{vol:.8,range:30});if(NET.host)netEv('eprh',{P:[[a.id,r2(p[0]),r2(p[1]),r2(p[2]),30]]})},
  reviveNote(a,by){const L=LI(),P=G.player;if(by&&by===P)HUD.note((L?'You got ':'')+a.name+(L?' up':' 부활시킴'),2);else if(a===P&&by)HUD.note(by.name+(L?' got you up':' 님이 일으켜 줬어요'),2.5)},
  deadNear(a,r){let best=null,bd=r;for(const h of SCEN.H){if(h.alive||h===a||h.team!==TH)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<1.8){bd=d;best=h}}return best},
  reviveOK(){return this.ph!=='over'&&this.ph!=='fail'&&this.ph!=='ride'},
  // the player holds E (or the touch button) next to a fallen teammate for 4 s
  useTick(dt){const P=G.player,U=this.use;if(!P){U.t=0;U.tg=null;return}
    if(!P.alive||P.team!==TH||Main.paused||P.grabT>0||!this.reviveOK()){U.t=0;U.tg=null;return}
    const tg=this.deadNear(P,1.7);if(tg!==U.tg)U.t=0;U.tg=tg;if(!tg||!P.cmd.use){U.t=0;return}
    U.t+=dt;if(U.t>=4){U.t=0;if(NET.cli){if(G.t-U.sent>1){U.sent=G.t;netToHost({t:'eprv',i:tg.id})}}else this.reviveAt(tg,P)}},
  // ---------- lights out (phase 3): the lamps die, red strobes ----------
  setDark(on,remote){if(this.dark===!!on)return;this.dark=!!on;if(on){AU.play('blackout',{vol:.9});const P=G.player;if(P&&P.alive&&P.team===TH)P.flash=true;for(const h of SCEN.H)if(h.bot)h.flash=true}
    else AU.play('powerup',{vol:.8});if(NET.host&&!remote)netEv('epx',{k:'dark',o:on?1:0})},
  light(dt){this.dk=approach(this.dk,this.dark?1:0,dt*(this.dark?2.5:.8));const k=this.dk;BO.amb=lerp(1,.3,k);BO.lamp=lerp(1,.05,k);
    if(k>.01){if(!this.strobe)this.strobe=[DL.add(-12,7,46,'#ff2a14',26,0,0),DL.add(12,7,58,'#ff2a14',26,0,0)];const on=Math.sin(G.t*7)>.2;this.strobe[0].i=on?1.9*k:.04;this.strobe[1].i=on?.04:1.9*k}
    else if(this.strobe){for(const L of this.strobe)L.dead=true;this.strobe=null}},
  // ---------- the radio ----------
  say(k){this.radio(k);if(NET.host)netEv('epn',{k})},
  radio(k){const R0=EP_RADIO[k];if(!R0)return;this.radioL.push({txt:R0[LI()],at:G.t,who:R0[2]||0,real:performance.now()});if(this.radioL.length>4)this.radioL.shift();this.radioDraw();AU.play('ui',{vol:.3,rate:1.7})},
  radioDraw(){const el=$('hRadio');if(!el)return;const L=LI(),now=performance.now(),h=this.radioL.filter(r=>now-r.real<8000).slice(-3).map(r=>`<p class="${r.who?'t':'c'}"><b>[${r.who?'RT-2':(L?'CONTROL':'통제실')}]</b> ${esc(r.txt)}</p>`).join('');
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h}},
  // ---------- the snapshot (host → clients) ----------
  bs(){const b=this.bossA();if(!b)return null;const S=b.al;if(!NET.cli&&S)return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,rage:S.rage,
      f:(S.shield?1:0)|(S.tankB?2:0)|(S.frT>0?4:0)|(S.exT>0?8:0)|(S.mode==='down'||S.mode==='stun'?16:0)|(S.invT>0&&!S.enc?32:0)|(S.enr?64:0)|(S.enc?128:0),sh:S.shMax>0?S.sh/S.shMax*100:0,tank:S.tankMax>0?S.tank/S.tankMax*100:0,a:b};
    const f=this.bf;return f&&f.id===b.id?Object.assign({a:b},f):null},
  pack(){const B=this.bs();return [this.st,this.PH.indexOf(this.ph),Math.round(this.t*10),this.w,this.obj.i,Math.round(this.obj.p*10),this.obj.h,this.obj.z,this.remain,this.gm,this.dark?1:0,this.bossPh,
    B?[B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),Math.round(B.rage),B.f,Math.round(B.sh),Math.round(B.tank)]:0]},
  unpack(s){if(!Array.isArray(s))return;this.on=true;const ph=this.PH[s[1]]||this.ph;this.st=s[0];this.ph=ph;this.t=s[2]/10;this.w=s[3];this.obj.i=s[4];this.obj.p=s[5]/10;this.obj.h=s[6];this.obj.z=s[7];this.remain=s[8];
    // a gate event missed (or still on its way): the snapshot puts it right after a moment
    if(s[9]!==this.gm&&G.t-this.gmT>1.5)this.setGates(s[9],true,true);this.dark=!!s[10];this.bossPh=s[11];
    const B=s[12];this.bf=B?{id:B[0],ph:B[1],grog:B[2],gmax:B[3],rage:B[4],f:B[5],sh:B[6],tank:B[7]}:null;
    if(G.st!=='over'&&G.st!=='menu'){const g=ph==='prep'||ph==='break'?'prep':ph==='fail'||ph==='over'?'end':'fight';if(G.st!==g)G.st=g}},
  // ---------- ally bots (host) ----------
  goal(a){const ph=this.ph,st=this.st,E=MAP.ez;if(!E)return null;const i=SCEN.H.indexOf(a);
    if(ph==='move'&&EP1[st+1]){const Zn=this.zone(EP1[st+1].z),s=Zn.start[i%Zn.start.length];return [s[0],s[1],s[2],1]}
    if(ph==='board'||ph==='ride')return [65,0,0,1.1];
    if(st===2&&ph==='run'){const T0=E.terms[this.obj.i];if(T0)return [T0.x,T0.y,T0.z,1.5]}
    if(st===3&&ph==='run')return [55,0,0,2.4];
    if(st===4&&ph==='run'){const b=this.bossA();if(b){const an=i*1.9+Math.floor(G.t/6)*.7;return [clamp(b.c.x+Math.cos(an)*12,-19,19),0,clamp(b.c.z+Math.sin(an)*12,33,71),1.5]}}
    if(st===4&&ph==='prep')return [0,0,70,2];
    if(st===5)return [0,0,77.2,1];
    return null},
  goalKey(){const b=this.st===4?this.bossA():null;return this.st+':'+this.ph+':'+this.obj.i+':'+(b?Math.round(b.c.x/6)+','+Math.round(b.c.z/6)+','+Math.floor(G.t/6):'')},
  botPre(a,dt){const B=a.bot;B.epT=(B.epT||0)-dt;if(B.epT>0)return;B.epT=.5;const ph=this.ph,st=this.st;B.epObj=ph==='move'||ph==='board'||st===5||st===2&&ph==='run';
    // a fallen teammate close by with nothing on top of them: go and get them up (not on the way out of a zone, into the lift or in the
    // escape: the next zone gets everyone up anyway, and the escape only counts the living)
    let best=null,bd=24;if(this.reviveOK()&&ph!=='move'&&ph!=='board'&&st!==5)for(const h of SCEN.H){if(h.alive||h===a||h.team!==TH)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)+Math.abs(h.c.y-a.c.y)*2;
      if(d<bd&&!zNearPt(h.c.x,h.c.y,h.c.z,5)&&!this.bossNear(h.c.x,h.c.z,9)&&!TELE.at(h.c.x,h.c.z,.5)){bd=d;best=h}}
    // (on the way there, and while holding E, it only backs off from a zombie right on it: B.epObj)
    if(best){if(B.epRv!==best){B.epRv=best;B.rvT=0;B.path=null;B.repath=0}B.spot=[best.c.x,best.c.y,best.c.z];B.camp=null;B.epObj=true;return}
    if(B.epRv){B.epRv=null;B.rvT=0;B.epG=null}
    const k=this.goalKey();if(B.epG!==k){SCEN.spotNear(a);B.epG=k}},
  botPost(a,dt){const B=a.bot,c=a.c;
    // in a red warning: out of it, now
    const hz=TELE.at(c.x,c.z,.8);if(hz){AI.moveDir(a,hz.ax,hz.az);a.cmd.walk=false;a.cmd.duck=false;return}
    const h=B.epRv;if(h&&!h.alive&&this.reviveOK()){const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);
      if(d<1.25&&Math.abs(h.c.y-c.y)<1.6){a.cmd.f=a.cmd.s=0;B.rvT=(B.rvT||0)+dt;if(B.rvT>=4){B.rvT=0;B.epRv=null;this.reviveAt(h,a)}}else B.rvT=0}},
  bossNear(x,z,r){const b=this.bossA();return !!(b&&Math.hypot(b.c.x-x,b.c.z-z)<r)},
  // ALEPH and the straitjacket zombie: their own moves own the controls
  zPost(a){if(a.zc==='aleph'&&a.al){const S=a.al;if(S.idle||S.mode){if(S.mode!=='lp'&&S.mode!=='p2l'&&S.mode!=='ret2'&&S.mode!=='tr'){a.cmd.f=a.cmd.s=0;a.cmd.jump=false}a.cmd.fire=a.cmd.alt=false;a.cmd.duck=false}
      else{const t=a.bot&&a.bot.target;a.cmd.fire=!!(t&&t.alive&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<2.8&&Math.abs(t.c.y-a.c.y)<2.2&&Math.random()<.85)}
      if(S.mode==='ch'||S.mode==='cw')a.yaw=Math.atan2(-S.dx,-S.dz)}
    else if(a.zc==='strait'){a.cmd.fire=a.cmd.alt=false;if(a.st&&(a.st.mode==='wind'||a.st.mode==='grab')){a.cmd.f=a.cmd.s=0;a.cmd.jump=false}}},
  // ---------- records, unlocks ----------
  recLS(){return LS.get('eprec',{})||{}},
  // the best clear of an episode (any difficulty, or one): {t, m (medal), d (difficulty), c (clears)}
  rec(ep,d){let best=null;const M=typeof ACC!=='undefined'&&ACC.me&&ACC.me.eps||[];const rank={S:3,A:2,B:1},better=(r)=>!best||(rank[r.m]||0)>(rank[best.m]||0)||(rank[r.m]||0)===(rank[best.m]||0)&&r.t<best.t;
    for(const r of M){if(r.ep!==ep||d!=null&&r.diff!==d||!(r.clears>0))continue;const o={t:r.best_time,m:r.best_medal,d:r.diff,c:r.clears};if(better(o))best=o}
    const E=this.recLS()[ep]||{};for(const k in E){const r=E[k];if(d!=null&&+k!==d||!(r.c>0))continue;const o={t:r.t,m:r.m,d:+k,c:r.c};if(better(o))best=o}return best},
  unlocked(n){if(n<=1)return true;const E=EPS[n];if(!E||E.soon)return false;return !!this.rec(n-1)},
  saveLocal(){const r=this.res;if(!r||!r.win||!this.id)return;const A=this.recLS(),e=A[this.id]=A[this.id]||{},o=e[r.diff]||{c:0},rank={S:3,A:2,B:1};
    o.c=(o.c||0)+1;if(!o.t||r.time<o.t)o.t=r.time;if(!o.m||rank[r.medal]>rank[o.m])o.m=r.medal;e[r.diff]=o;LS.set('eprec',A)},
  // ---------- the title cards ----------
  card(kind){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI(),E=EPS[this.id]||EPS[1];
    if(kind==='boss')el.innerHTML=`<div class="ec boss"><img src="${portrait('z_aleph',150)}"><div class="tx"><small>${E.code} · ${L?'PATIENT ZERO':'최초 감염자'}</small><h2>${E.n[1]}</h2><p>${L?'Serum subject no. 1 — feels no pain; every hit makes it angrier':'강화 혈청 1호 피험자 — 통증을 못 느끼고, 맞을수록 분노한다'}</p></div></div>`;
    else el.innerHTML=`<div class="ec"><img class="sil" src="${portrait('z_aleph',150)}"><div class="tx"><small>${L?'CHAPTER '+this.id:this.id+'챕터'} · Q-7</small><h1>${E.t[L]}</h1><p>${mapName(E.map)} — ${L?'Recovery Team 2 (RT-2)':'2차 회수팀 RT-2'}</p><b>${E.n[1]} · ${E.code}</b></div></div>`;
    el.className='on'+(kind==='boss'?' b':'');clearTimeout(this.cardT);this.cardT=setTimeout(()=>{el.className=''},kind==='boss'?3800:4800)},
  // ---------- the HUD ----------
  hud(){const el=$('hEp');if(!el)return;const P=G.player,on=G.st!=='menu'&&!!P&&this.on;const ds=on?'block':'none';if(el.style.display!==ds)el.style.display=ds;
    const hs=$('hScen');if(hs&&hs.style.display!=='none')hs.style.display='none';HUD.el.hud.classList.toggle('scen',on);HUD.el.hud.classList.toggle('ep',on);if(!on)return;
    const L=LI(),D=this.S(),E=EPS[this.id]||EPS[1],ph=this.ph,st=this.st,M=MAP.ez;
    const t1=`<b>${L?'CH.'+this.id:this.id+'챕터'} ${E.n[L]}</b><span>${L?'ZONE':'구역'} ${D.z} · ${D.n[L]}</span><span class="sclv">${SC_HEART.repeat(Math.max(0,SCEN.lives))}<i>${SC_HEART.repeat(Math.max(0,3-SCEN.lives))}</i></span>`;
    const tl=el.querySelector('.et');if(tl.dataset.s!==t1){tl.dataset.s=t1;tl.innerHTML=t1}
    // the goal line and its bar
    let ot='',pr=-1,warn='';const ts=Math.max(0,Math.ceil(this.t));
    if(ph==='fail')ot=L?'Wiped out — trying again':'전멸 — 다시 시작';
    else if(ph==='over')ot='';
    else if(ph==='move'){ot=(L?'Go through the open door':'열린 문으로 이동')+` · ${ts}${L?'s':'초'}`}
    else if(ph==='board'){ot=(L?'Into the lift!':'엘리베이터 탑승!')+` · ${ts}${L?'s':'초'}`}
    else if(ph==='ride'){ot=L?'Going down to B4…':'B4로 하강 중…';pr=1-this.t/15}
    else if(st===1){ot=ph==='wave'?`${L?'Wave':'웨이브'} ${Math.max(1,this.w)}/3 · ${L?'left':'남은 좀비'} <b class="z">${this.remain}</b>`:ph==='break'?`${L?'Wave clear — next in':'웨이브 클리어 — 다음까지'} ${ts}${L?'s':'초'}`:`${L?'Hold the checkpoint':'검문소를 지켜라'} · ${ts}${L?'s':'초'}`}
    else if(st===2){const T0=M&&M.terms[this.obj.i];ot=`${L?'Secure the terminals':'보안 단말 확보'} <b>${this.obj.i+1}/2</b> · ${T0?T0.n[L]:''}`;pr=this.obj.p/25;warn=this.obj.z>0?(L?'Zombies at the terminal!':'단말 근처에 좀비!'):this.obj.h===0?(L?'Stand at the terminal':'단말 옆에 서 있어야 진행'):''}
    else if(st===3){ot=`${L?'The lift arrives in':'엘리베이터 도착까지'} <b>${fmtT(Math.max(0,60-this.obj.p))}</b>`;pr=this.obj.p/60}
    else if(st===4)ot=ph==='prep'?`${L?'ALEPH wakes in':'알레프 각성까지'} ${ts}${L?'s':'초'} · ${L?'pick a supply box':'보급 상자를 고르세요'}`:(L?'Bring ALEPH down':'알레프를 쓰러뜨려라');
    else if(st===5){ot=`${L?'ESCAPE — the lift':'탈출 — 엘리베이터까지'} <b class="z">${fmtT(this.t)}</b>`;pr=this.t/60}
    const ol=el.querySelector('.eo'),os=ot+'|'+warn;if(ol.dataset.s!==os){ol.dataset.s=os;ol.querySelector('span').innerHTML=ot+(warn?` <em>${warn}</em>`:'')}
    const bar=ol.querySelector('i');bar.style.display=pr>=0?'block':'none';if(pr>=0)bar.firstChild.style.width=(clamp(pr,0,1)*100).toFixed(1)+'%';
    // the boss bar
    const B=this.bs(),bb=el.querySelector('.eb'),bon=!!(B&&B.a.alive&&(st===3||st===4));if(bb.style.display!==(bon?'block':'none'))bb.style.display=bon?'block':'none';
    if(bon){const a=B.a,f=B.f;bb.querySelector('.hp u').style.width=Math.max(0,a.hp/a.maxHp*100).toFixed(1)+'%';
      const ss=f&32?(L?'INVULNERABLE':'무적'):f&16?(L?'DOWN!':'그로기!'):f&4?(L?'RAGE!':'분노 폭주!'):f&8?(L?'SPENT — hit it!':'탈진 — 몰아쳐!'):f&1?(L?'SHIELD ':'방패 ')+Math.max(0,B.sh|0)+'%':f&64?(L?'ENRAGED':'광폭화'):'';
      const sp=(f&128?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&2?(L?' · TANK BROKEN':' · 탱크 파괴'):'');
      const k=ss+'|'+sp;if(bb.dataset.s!==k){bb.dataset.s=k;bb.querySelector('.bs').textContent=ss;bb.querySelector('.bs').className='bs'+(f&4?' r':f&16||f&8?' y':'');bb.querySelector('.bp').textContent=sp}
      bb.querySelector('.g1 u').style.width=clamp(B.grog/(B.gmax||100),0,1)*100+'%';const g2=bb.querySelector('.g2');g2.style.visibility=f&2||f&128?'hidden':'visible';g2.querySelector('u').style.width=clamp(B.rage/100,0,1)*100+'%'}
    // the clock never blinks red here; the upgrade level next to the gun's name; the supply box clock
    if(HUD.el.hTime.className==='low')HUD.el.hTime.className='';const wn=HUD.el.hWName,lv=P.wup&&P.wup[P.cur];if(lv&&P.alive&&P.team===TH&&!wn.textContent.endsWith(' +'+lv))wn.textContent+=' +'+lv;
    if(SCEN.pickOpen&&!AU.throttle('scpk',250))SCEN.pickTick();
    if(!AU.throttle('eprd',500))this.radioDraw();this.useHud();this.markHud()},
  useHud(){const el=$('hUse');if(!el)return;const P=G.player,U=this.use,L=LI();let s='',k=0,cls='';
    if(P&&P.alive&&P.grabT>0){s=L?'PINNED — a teammate has to shoot it off':'붙잡혔다 — 동료가 쏴서 떼어 줘야 해요';cls='g'}
    else if(P&&P.alive&&U.tg){s=(typeof TOUCH!=='undefined'&&TOUCH.on?(L?'Hold ✚ — get ':'✚ 길게 — '):(L?'Hold E — get ':'E 길게 — '))+esc(U.tg.name)+(L?' up':' 일으키기');k=U.t/4;cls='u'}
    const c=s?'on '+cls:'';if(el.className!==c)el.className=c;if(el.dataset.s!==s){el.dataset.s=s;el.querySelector('span').innerHTML=s}el.querySelector('u').style.width=(clamp(k,0,1)*100).toFixed(1)+'%';
    if(typeof TOUCH!=='undefined'&&TOUCH.el){const b=TOUCH.el.querySelector('.tUse');if(b){const on=!!(P&&P.alive&&U.tg);if(b.classList.contains('show')!==on)b.classList.toggle('show',on)}}},
  // world markers: the goal, the panels and valves in B4, fallen teammates
  markHud(){const lay=$('epMk'),P=G.player,M=MAP.ez;if(!lay||!P||!M)return;const L=LI(),list=[],ph=this.ph,st=this.st;
    if(ph==='move'){const d=st===1?M.door.A:M.door.B;list.push([d[0],d[1]+1.2,d[2],L?'DOOR':'출입문','g'])}
    else if(ph==='board')list.push([M.door.C[0]+3,2.6,0,L?'LIFT':'엘리베이터','g']);
    else if(st===2&&ph==='run'){const T0=M.terms[this.obj.i];if(T0)list.push([T0.x,T0.y+1.8,T0.z,T0.n[L],'g'])}
    else if(st===3&&ph==='run')list.push([M.door.C[0],2.8,0,L?'LIFT':'엘리베이터','d']);
    // (a panel lights up while ALEPH stands next to it; the steam valves show when they are close)
    else if(st===4&&ph==='run'){const b=this.bossA();for(const p of M.panels)if(!p.used){const hot=b&&Math.hypot(b.c.x-p.x,b.c.z-p.z)<4.8;list.push([p.x,p.y+.9,p.z,hot?(L?'⚡ SHOOT IT!':'⚡ 지금 쏴!'):(L?'⚡ panel':'⚡ 패널'),hot?'p hot':'p'])}
      for(const v of M.valves)if(Math.hypot(v.x-P.c.x,v.z-P.c.z)<16)list.push([v.x,v.y+.8,v.z,L?'steam':'증기','s'])}
    else if(st===5)list.push([M.door.D[0],2.8,M.door.D[2]+3,L?'EXIT':'탈출','g']);
    for(const h of SCEN.H)if(!h.alive&&h!==P&&h.team===TH&&this.reviveOK())list.push([h.c.x,h.c.y+.9,h.c.z,'✚ '+h.name,'r']);
    const pool=this.mk||(this.mk=[]);while(pool.length<list.length){const d=document.createElement('div');d.className='epMk';lay.appendChild(d);pool.push(d)}
    // (a marker never sits on the episode panel at the top)
    const W=innerWidth,H=innerHeight,cam=R.cam,he=$('hEp'),hr=he&&he.offsetParent?he.getBoundingClientRect():null;for(let i=0;i<pool.length;i++){const d=pool[i],m=list[i];if(!m){if(d.style.display!=='none')d.style.display='none';continue}
      _epv.set(m[0],m[1],m[2]).project(cam);const sx=(_epv.x*.5+.5)*W,sy=(-_epv.y*.5+.5)*H;
      if(_epv.z>1||Math.abs(_epv.x)>1.1||Math.abs(_epv.y)>1.1||hr&&sy<hr.bottom+14&&sx>hr.left-50&&sx<hr.right+50){if(d.style.display!=='none')d.style.display='none';continue}
      const dist=Math.round(Math.hypot(m[0]-P.c.x,m[2]-P.c.z)),tx=m[3]+(m[4]==='g'||m[4]==='d'?` ${dist}m`:'');if(d.dataset.t!==tx){d.dataset.t=tx;d.textContent=tx}
      const cl='epMk '+m[4];if(d.className!==cl)d.className=cl;d.style.display='block';d.style.left=sx.toFixed(1)+'px';d.style.top=sy.toFixed(1)+'px'}},
  deadText(){const L=LI(),st=this.st,ph=this.ph;
    if(ph==='ride')return L?'Down — back on your feet when the lift reaches B4 · spectating':'쓰러짐 — 엘리베이터가 B4에 닿으면 다시 일어나요 · 관전 중';
    if(ph==='move'||ph==='board')return L?'Down — a teammate can get you up, or you are back in the next zone · spectating':'쓰러짐 — 아군이 일으켜 주거나, 다음 구역에서 부활 · 관전 중';
    if(st===1)return L?'Down — back at the next wave, or when a teammate gets you up · spectating':'쓰러짐 — 다음 웨이브에, 또는 아군이 일으켜 주면 부활 · 관전 중';
    if(st===5)return L?'Down — a teammate can get you up (E, 4 s); the team still escapes without you · spectating':'쓰러짐 — 아군이 E로 일으켜 줄 수 있어요 · 남은 팀이 탈출해도 클리어 · 관전 중';
    return L?'Down — a teammate can get you up (E, 4 s) · spectating':'쓰러짐 — 아군이 옆에서 E로 일으켜 줄 수 있어요 · 관전 중'},
  resHtml(){const r=this.res||{win:!!SCEN.win,time:0,lost:3-SCEN.lives,st:this.st,medal:''},L=LI(),E=EPS[this.id]||EPS[1];
    return `<div class="epRes ${r.win?'w':'l'}"><div class="top">${r.medal?`<i class="md m${r.medal}">${r.medal}</i>`:''}<div class="h"><small>${L?'CH.'+this.id:this.id+'챕터'} · ${E.t[L]}</small><b>${r.win?(r.bonus?(L?'ESCAPED':'탈출 성공'):(L?'CHAPTER CLEAR':'챕터 클리어')):(L?'GAME OVER':'게임 오버')}</b></div></div>
      <div class="rw"><span>${L?'Time':'시간'} <b>${fmtT(r.time)}</b></span><span>${L?'Lives lost':'잃은 목숨'} <b>${r.lost}</b></span><span>${L?'Reached':'도달'} <b>${Math.min(4,r.st||1)}/4</b></span><span>${T('d'+(G.diff||0))}</span>${r.win&&!r.bonus?`<span class="nb">${L?'no escape bonus':'탈출 보너스 없음'}</span>`:''}</div></div>`}};
const _epv=new THREE.Vector3();

// ---------- the lobby: episode cards (room settings), a dropdown and a preview (multiplayer waiting room) ----------
function epCards(act){const L=LI(),cur=epSel(CFG);
  const card=id=>{const E=EPS[id],lk=!!E.soon||!EP.unlocked(id),on=cur===id&&!lk,rc=!E.soon&&EP.rec(id);
    return `<div class="epc${on?' on':''}${lk?' lk':''}"${lk?'':` data-act="${act}" data-v="ep:${id}"`}><div class="pi">${E.soon?'<b class="q">?</b>':`<img src="${portrait('z_'+E.k,56)}">`}</div>
      <div class="tx"><small>${L?'CH.'+id:id+'챕터'} · ${E.code}</small><b>${E.n[L]}${E.soon?` <i>${L?'coming soon':'준비 중'}</i>`:''}</b>${E.soon?'':`<span>${mapName(E.map)}</span><em>${E.file[0][L]}</em><em>${E.file[1][L]}</em>`}</div>
      ${rc?`<div class="rc"><i class="md m${rc.m}">${rc.m}</i><small>${T('d'+rc.d)}<br>${fmtT(rc.t)}</small></div>`:''}</div>`};
  // the chapters that can be played, then the free scenario, then the locked ones and the ones still to come
  const ids=[1,2,3,4,5],open=id=>!EPS[id].soon&&EP.unlocked(id);
  const free=`<div class="epc free${cur===0?' on':''}" data-act="${act}" data-v="ep:0"><div class="pi"><b class="q">∞</b></div><div class="tx"><small>${L?'FREE':'자유'}</small><b>${L?'Free scenario':'자유 시나리오'}</b><span>${L?'Any map · 5 stages × 3 waves · the giant':'맵 선택 · 5스테이지 × 3웨이브 · 거대 좀비'}</span></div></div>`;
  return `<div class="epl">${ids.filter(open).map(card).join('')}${free}${ids.filter(id=>!open(id)).map(card).join('')}</div>`}
function epOpts(){const L=LI();return [[1,`${L?'CH.1':'1챕터'} · ${EPS[1].n[L]}`],[0,L?'Free scenario':'자유 시나리오']]}
function epPrev(id){const L=LI(),E=EPS[id]||EPS[1],rc=EP.rec(id);
  return `<div class="epPrev"><img src="${portrait('z_'+E.k,120)}"><div><small>${L?'CH.'+id:id+'챕터'} · ${E.code}</small><b>${E.t[L]}</b><span>${mapName(E.map)}</span><em>${E.file[0][L]}</em><em>${E.file[1][L]}</em>${rc?`<p>${L?'Best':'최고 기록'}: <i class="md m${rc.m}">${rc.m}</i> ${T('d'+rc.d)} · ${fmtT(rc.t)}</p>`:''}</div></div><div class="rrule"><b>${L?'Rules':'규칙'}</b>${T('epD')}</div>`}

// ---------- hooks ----------
(function(){
  // a scenario match with an episode in its settings plays the episode
  const ip=SCEN.initPool;SCEN.initPool=function(){ip();EP.reset();const c=G.cfg||{},E=c.mode==='scen'&&c.ep?EPS[c.ep]:null;EP.on=!!(E&&!E.soon&&MAP.ez&&MAP.id===E.map);EP.id=EP.on?c.ep:0;if(EP.on)EP.setup()};
  const bg=SCEN.begin;SCEN.begin=function(){if(EP.on){EP.begin();return}bg()};
  const su=SCEN.update;SCEN.update=function(dt){if(EP.on){if(SCEN.on)EP.update(dt);return}su(dt)};
  const sh=SCEN.hud;SCEN.hud=function(){if(EP.on){EP.hud();return}const e=$('hEp');if(e&&e.style.display!=='none'){e.style.display='none';HUD.el.hud.classList.remove('ep')}sh()};
  const hf=SCEN.hpFor;SCEN.hpFor=function(zc){if(zc==='aleph')return ALEPH.hpFor();return hf(zc)};
  const orv=SCEN.onRevive;SCEN.onRevive=function(a){orv(a);if(!EP.on||!a.scen)return;if(a.zc==='aleph')ALEPH.init(a,ALEPH.encNext);else if(a.zc==='strait')a.st={mode:'',cd:rr(1,2.5),mt:0}};
  const pt=SCEN.pickTick;SCEN.pickTick=function(){if(!EP.on)return pt();const t=document.querySelector('#scPick .tm');if(t){const s=Math.max(0,Math.ceil(EP.t))+(LI()?'s':'초');if(t.textContent!==s)t.textContent=s}SCEN.renderUp()};
  const es=SCEN.encState;SCEN.encState=function(){const s=es();if(EP.on)s.push(EP.pack());return s};
  const ds=SCEN.decState;SCEN.decState=function(s){if(EP.on&&Array.isArray(s)&&s.length>7){SCEN.on=true;SCEN.stage=s[0];SCEN.lives=s[4];SCEN.remain=s[5];SCEN.bossId=s[6];EP.unpack(s[7]);return}ds(s)};
  // (the same goal twice keeps the path the bot is on; the leader-following check of scenario.js asks again every few seconds)
  const sn=SCEN.spotNear;SCEN.spotNear=function(a){if(EP.on&&a.bot){const B=a.bot;if(B.epRv&&!B.epRv.alive)return true;const g=EP.goal(a);
      if(g){const k=EP.goalKey();B.lead=SCEN.lead(a);B.leadAt=B.lead?[B.lead.c.x,B.lead.c.z]:null;if(B.epG===k&&B.spot)return true;
        const i=SCEN.H.indexOf(a),r=g[3]||1.5,an=i*2.3+.5,n=navSnap(g[0]+Math.cos(an)*r,g[1],g[2]+Math.sin(an)*r,3)||navSnap(g[0],g[1],g[2],4);
        if(n){B.spot=[n.x+rr(-.15,.15),n.y,n.z+rr(-.15,.15)];B.camp=null;B.path=null;B.repath=0;B.epG=k;return true}}}return sn(a)};
  // the whole team's controls in the episode: bots revive, follow the goal, dodge the red floor; ALEPH and the straitjackets own theirs
  const au=AI.update.bind(AI);AI.update=function(a,dt){if(!(EP.on&&G.mode==='scen')){au(a,dt);return}
    if(a.team===TH&&a.bot&&a.alive)EP.botPre(a,dt);au(a,dt);if(!a.alive)return;if(a.team===TH&&a.bot)EP.botPost(a,dt);else if(a.team===TZ)EP.zPost(a)};
  // ALEPH's death starts the escape
  const kz=killZombie;killZombie=function(t,src,o){const was=t.alive;kz(t,src,o);if(!(was&&EP.on&&t.scen))return;if(t.zc==='strait'&&t.st&&t.st.mode==='grab')STRAIT.release(t,false);if(t.zc==='aleph'&&!NET.cli)EP.bossDead(t)};
  // E: the use key (getting a teammate up); the touch layout gets a button for it
  const pc=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc(dt);const P=G.player;if(P&&P.alive)P.cmd.use=!!Main.keys.KeyE||!!(typeof TOUCH!=='undefined'&&TOUCH.on&&TOUCH.useOn)};
  if(typeof TOUCH!=='undefined'){const bd=TOUCH.build.bind(TOUCH);TOUCH.build=function(){bd();const b=document.createElement('button');b.className='tb tUse';b.dataset.t='use';b.innerHTML='✚<em>'+(LI()?'REVIVE':'일으키기')+'</em>';this.el.appendChild(b)};
    const pr=TOUCH.press.bind(TOUCH);TOUCH.press=function(id,on,v){if(id==='use'){TOUCH.useOn=!!on;return}return pr(id,on,v)}}
  // the strings while dead, and the boss fight's countdown
  const T1=T;T=function(k,...a){if(EP.on&&G.mode==='scen'&&G.st!=='menu'){if(k==='scDead'||k==='permaDead')return EP.deadText();if(k==='prep'&&EP.st===4)return LI()?`ALEPH wakes in ${a[0]}s`:`알레프 각성까지 ${a[0]}초`}return T1(k,...a)};
  // results: the episode's card instead of the stage count; the scoreboard's title
  const sr=UI.showResults.bind(UI);UI.showResults=function(){const r=sr();if(EP.on&&G.mode==='scen'){const fs=document.querySelector('#results .finalScore');if(fs)fs.innerHTML=EP.resHtml()}return r};
  const bd0=UI.board.bind(UI);UI.board=function(on){bd0(on);if(!(on&&EP.on&&G.mode==='scen'))return;const b=$('board'),h=b&&b.querySelector('h3'),fs=b&&b.querySelector('.finalScore'),L=LI(),E=EPS[EP.id]||EPS[1],D=EP.S();
    if(h)h.textContent=`${T('board')} — ${L?'CH.'+EP.id:EP.id+'챕터'} ${E.n[L]} · ${L?'zone':'구역'} ${D.z}`;if(fs)fs.innerHTML=`<span class="h">${D.n[L]}</span> · <span class="z">${L?'Lives':'목숨'} ${SCEN.lives}</span>`};
  const hi=HUD.init.bind(HUD);HUD.init=function(){hi();const h=$('hud');
    const e=document.createElement('div');e.id='hEp';e.innerHTML='<div class="et"></div><div class="eo"><span></span><i><u></u></i></div><div class="eb"><div class="bh"><b>ALEPH</b><em>Q7-000</em><span class="bs"></span><small class="bp"></small></div><i class="hp"><u></u><s style="left:60%"></s><s style="left:25%"></s></i><div class="gg"><span class="g1"><b>'+(LI()?'STAGGER':'그로기')+'</b><i><u></u></i></span><span class="g2"><b>'+(LI()?'RAGE':'분노')+'</b><i><u></u></i></span></div></div>';h.appendChild(e);
    for(const [id,html] of [['hRadio',''],['hUse','<span></span><i><u></u></i>'],['epMk','']]){const d=document.createElement('div');d.id=id;d.innerHTML=html;h.appendChild(d)}};
  // leaving the match ends the episode's state (lights, props, markers)
  const tt=Main.toTitle.bind(Main);Main.toTitle=function(){EP.off();return tt()};
  const tl=netToLobby;netToLobby=function(){EP.off();return tl()};
  // a room playing an episode its players have not opened yet cannot be joined
  const lb=CLIH.lobby;CLIH.lobby=function(L,m){const c=m&&m.lob&&m.lob.cfg;if(c&&c.mode==='scen'&&epSel(c)>1&&!EP.unlocked(epSel(c))&&NET.cli){netFatal(LI()?'This room plays a chapter you have not opened yet (clear the one before it first)':'아직 열지 않은 챕터를 하는 방이에요 (앞 챕터를 먼저 깨야 열려요)');return}return lb(L,m)};
  Object.assign(CLIH,{
    eps(L,m){EP.stageStart(null,null,m)},
    epw(L,m){EP.w=m.w;SCEN.wave=m.w;EP.ph='wave';G.st='fight';G.time=0;SCEN.closePick(false);EP.waveFx(m.w)},
    epwc(){EP.ph='break';EP.t=8;G.st='prep';G.beepAt=6;SCEN.breakFx()},
    epm(L,m){EP.ph='move';EP.t=40;G.st='fight';EP.moveFx(m.n)},
    epo(L,m){EP.obj.i=m.i;EP.obj.p=0;AU.play('morale',{vol:.6})},
    epb(){EP.ph='board';EP.t=40;EP.boardFx()},
    epr(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);for(const i of m.z||[]){const a=byIdAny(i);if(a)EP.despawn(a)}
      EP.ph='ride';EP.t=15;SCEN.closePick(false);EP.rideBegin()},
    epgo(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);EP.ph='run';G.st='fight';SCEN.closePick(false);EP.goFx()},
    epk(){EP.st=5;EP.ph='run';EP.t=60;TELE.clear();EP.deadFx()},
    epf(L,m){SCEN.lives=m.l;EP.ph='fail';G.st='end';TELE.clear();SCEN.failFx()},
    epend(L,m){EP.res={win:!!m.w,bonus:!!m.b,time:m.tm,lost:m.l,st:m.s,diff:G.diff||0};EP.res.medal=EP.medal(EP.res);EP.ph='over';SCEN.win=!!m.w;SCEN.best=m.w?4:Math.max(0,(m.s|0)-1);G.st='end';TELE.clear();EP.endFx();EP.saveLocal()},
    eprh(L,m){for(const q of m.P||[]){const a=byIdAny(q[0]);if(a&&!a.alive){SCEN.reviveOne(a,[q[1]/100,q[2]/100,q[3]/100]);a.hp=q[4]||100}}},
    epdz(L,m){for(const i of m.i||[]){const a=byIdAny(i);if(a)EP.despawn(a)}},
    epg(L,m){EP.setGates(m.m,!!m.i,true);EP.gmT=G.t},
    epn(L,m){EP.radio(m.k)}});
  Object.assign(HOSTH,{
    eprv(L,m){const a=actorOfKey(L.key),t=byIdAny(m.i);if(EP.on&&a&&a.alive&&t&&!t.alive&&t.team===TH&&EP.reviveOK()&&Math.hypot(a.c.x-t.c.x,a.c.z-t.c.z)<2.8)EP.reviveAt(t,a)}});
})();

'use strict';
// ============ 대인전 (v6.48): 팀 데스매치 (BLUE vs RED) · 개인전 (everyone for himself) ============
// Everyone stays a human (team TH); who may hurt whom is a.side (foe(), game.js): 0 BLUE / 1 RED in 팀 데스매치, a side of one's own
// (id + 2) in 개인전. The sides come from the roster on every page (players alternate by id, bots fill the smaller side), so no message
// carries them. One long fight instead of rounds: a 5 s warm-up (nobody moves or shoots), then the clock (5 / 8 / 10 min). The dead are
// back 3 s later — in 팀 데스매치 at their side's base unless an enemy is on it, else (and in 개인전) in the safest open spot: far from the
// enemies and out of their sight — with 2 s of spawn protection (gone at the first shot) and 12 s to change weapons (B). The first team
// (player) to the kill goal wins, or the most kills when the clock runs out. Special weapons, skills, supply drops, blackouts and death
// drops are off: the buy menu lists the plain guns only (PVP.GUNS; the shop's account locks still apply). Damage is the guns' own:
// headshots ×4 instead of ×3 (a rifle can one-tap), armour (everyone spawns with it) takes a share that depends on the gun (PVP.AP:
// snipers go through it). The host owns kills, respawns and the end (events pk / prs / pgo / pend, the start is the usual 'round' with
// the placements); a client's hits are claims the host checks against the gun (claimOk).
Object.assign(STR.ko,{tdm:'팀 데스매치',ffa:'개인전',
  tdmD:'블루 대 레드. 쓰러져도 3초 뒤 우리 진영 쪽에서 다시 태어나요 (2초 보호 · 12초 동안 무기 변경). 목표 킬을 먼저 채우거나, 시간이 끝났을 때 킬이 많은 팀이 승리. 특수 무기 · 스킬 · 보급은 꺼져 있어요.',
  ffaD:'모두가 적. 쓰러져도 3초 뒤 적에게서 먼 곳에서 다시 태어나요 (2초 보호 · 12초 동안 무기 변경). 목표 킬을 먼저 채운 사람이 우승 (시간이 끝나면 킬이 가장 많은 사람). 특수 무기 · 스킬 · 보급은 꺼져 있어요.',
  pGoal:'목표 킬',pTime:'제한 시간',assists:'어시',kill:'킬'});
Object.assign(STR.en,{tdm:'Team Deathmatch',ffa:'Free-for-all',
  tdmD:'BLUE vs RED. The fallen are back 3 s later on their side of the map (2 s of protection, 12 s to change weapons). First team to the kill goal wins, or the team with more kills when time runs out. Special weapons, skills and supply drops are off.',
  ffaD:'Everyone is an enemy. The fallen are back 3 s later far from the others (2 s of protection, 12 s to change weapons). First to the kill goal wins, or the most kills when time runs out. Special weapons, skills and supply drops are off.',
  pGoal:'Kill goal',pTime:'Time limit',assists:'Assists',kill:'kills'});
const _pvV=new THREE.Vector3();
const PVP={RESP:3,PROT:2,BUYW:12,WARM:5,ENDT:7,KCAM:1.4,SIGHT:70,HER:6.5,HED:98,
  GOALS:{tdm:[40,60,100],ffa:[15,25,40],race:[10,15,20]},TIMES:[300,480,600],BOTS:[3,5,7,9,11],MPBOTS:[0,2,4,6,8,10,12],
  SIDES:[{n:['블루','BLUE'],c:'#5ab4ff',t:[.16,.4,1]},{n:['레드','RED'],c:'#ff4b3a',t:[1,.2,.12]}],
  // what 대인전 lets in: the plain guns, the three melee weapons, HE, flares, armour and ammo (no frost, no specials, no crate guns)
  GUNS:['knife','axe','hammer','p9','f7','tw9','d50','r6','sg8','db2','m14','as12','k5','k9','um45','pd50','g35','kv47','br3','ar7','ar5c','hr17',
    'sr8','r700','dm14','hmg','mg6','he','flare','armor','ammo'],
  MEL:{knife:.85,axe:.8,hammer:.6},AP:{sniper:.97,rifle:.78,mg:.8,smg:.62,pistol:.65,shotgun:.72},
  mid:0,mode:'tdm',goal:50,time:480,assigned:false,bases:null,played:0,intel:[[],[]],recent:[],hits:[],bm0:null,bi0:null,_D:null,aiS:'',aiT:0,
  isMode(m){return m==='tdm'||m==='ffa'||m==='bomb'||m==='race'},
  // the modes with two sides (BLUE / RED): 팀 데스매치, 폭파미션 (v6.50)
  teams(){return G.mode!=='ffa'&&G.mode!=='race'},// (무기 레이스 is everyone for himself too, v6.51)
  ok(id){return (this.SET||(this.SET=new Set(this.GUNS))).has(id)},
  goalOpts(m){const L=LI();return (this.GOALS[m]||this.GOALS.tdm).map((g,i)=>[i,g+(m==='race'?(L?' steps':'단계'):(L?' kills':'킬'))])},
  timeOpts(){return this.TIMES.map(s=>[s,s/60+T('min')])},
  byId(id){return (NET.ids&&NET.ids.get(id))||G.actors.find(a=>a.id===id)||null},
  // a name's colour class: the side's in 팀 데스매치; in 개인전 me blue, everyone else red
  cls(a){if(!a)return 'h';return this.teams()?(a.side===1?'z':'h'):(a===G.player?'h':'z')},
  col(a,me){return this.teams()?this.SIDES[a.side===1?1:0].c:'#ff4b3a'},
  prot(t){return !!t&&t.pvpProt>G.t},
  canHit(t){return G.st==='fight'&&!!t&&t.alive&&!this.prot(t)},

  // ---------- the match ----------
  setup(cfg){this.mid++;this.mode=cfg.mode;if(cfg.mode==='bomb')BOMB.setup(cfg);const g=this.GOALS[cfg.mode]||this.GOALS.tdm;this.goal=g[clamp(cfg.pg==null?1:+cfg.pg|0,0,g.length-1)];if(cfg.mode==='race')RACE.setup();
    this.time=this.TIMES.includes(+cfg.ptime)?+cfg.ptime:480;this.assigned=false;this.bases=null;this.played=0;this.intel=[[],[]];this.recent=[];this.hits=[];G.pvpKC=null},
  // BLUE / RED from the roster (players alternate by id, then bots fill the smaller side); 개인전: a side each
  assign(){this.assigned=true;const A=G.actors.slice().sort((p,q)=>p.id-q.id);if(!this.teams()){for(const a of A)a.side=a.id+2;return}
    const pl=A.filter(a=>a.net||(a.isPlayer&&!NET.on)),n=[0,0];pl.forEach((a,i)=>{a.side=i%2;n[a.side]++});
    for(const a of A){if(pl.includes(a))continue;const s=n[0]<=n[1]?0:1;a.side=s;n[s]++}},
  // the buy menu while 대인전 runs: the categories keep only what PVP.GUNS lets in (an empty one goes); put back on the way out
  menu(on){if(on===!!this.bm0)return;
    if(on){this.bm0=BUY_MENU.slice();this.bi0=BUY_MENU.map(c=>c.items.slice());for(const c of BUY_MENU)c.items=c.items.filter(id=>this.ok(id));
      for(let i=BUY_MENU.length-1;i>=0;i--)if(!BUY_MENU[i].items.length)BUY_MENU.splice(i,1)}
    else{BUY_MENU.length=0;this.bm0.forEach((c,i)=>{c.items=this.bi0[i];BUY_MENU.push(c)});this.bm0=this.bi0=null}
    if(typeof UI!=='undefined')UI.buyCat=0},
  off(){G.pvp=false;this.menu(false);if(typeof BOMB!=='undefined')BOMB.off();if(typeof RACE!=='undefined')RACE.off();DROPS.LIFE=90;this.hits=[];if(this.mkL){this.mkL.innerHTML='';this.mkPool=[]}const h=$('hud');if(h)h.classList.remove('pvp');const t=$('pvTag');if(t)t.innerHTML=''},
  // everything a fresh life starts with (as a round start would do)
  fresh(a){a.nb=null;a.team=TH;a.host=false;a.alive=true;a.permaDead=false;a.hp=a.maxHp=100;a.lvl=1;a.infR=0;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;
    a.skillCD=0;a.shriekT=0;a.dizzy=0;a.bombs=0;a.rootT=0;a.burnT=0;a.sawRev=0;a.dragonG=0;a.holdT=0;a.grabT=0;a.kdP=0;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.pendingClaw=null;a.zoom=0;
    a.turning=0;a.bSt=0;a.throwT=0;a.nHold=0;a.cmb=null;a.reloadT=0;a.relKind=null;a.deadT=0;a.kvx=a.kvz=0;a.an.dead=0;a.an.atk=0;a.an.flinch=0;a.pvpRT=null;a.pvpBy={};a.pvpStreak=0},
  // the loadout of this life: the one noted (ldSnap) or given, cleaned of anything 대인전 does not allow; armour always
  kit(a){if(G.mode==='race')return RACE.kit(a);ldRestore(a);this.sanitize(a);a.armor=100;if(a.kit)a.kit.armor=1;a.cur=bestWeapon(a)},
  sanitize(a){for(const s of [1,2,3]){const id=a.inv[s];if(id&&!this.ok(id)){if(a.ammo[id])delete a.ammo[id];a.inv[s]=s===2?'p9':s===3?'knife':null;if(a.inv[s])fillAmmo(a,a.inv[s])}}
    a.inv.frost=0;const o=a.ldo;if(o){for(const s of [1,2,3])if(o[s]&&!this.ok(o[s]))o[s]=s===2?'p9':s===3?'knife':null;o.frost=0}if(a.cur&&!this.ok(a.cur)&&a.cur!=='he'&&a.cur!=='flare')a.cur=bestWeapon(a)},
  begin(plan){if(G.mode==='bomb')return BOMB.begin(plan);if(NET.cli&&!plan)return;if(!this.assigned)this.assign();AU.stopAll('countdown');dropsClear();G.round=1;G.st='prep';G.time=this.WARM;FX.clearLimbs();
    G.moralePts=0;G.moraleLvl=0;G.lastHuman=null;G.spec=null;G.deathCam=0;G.killer=null;G.winner=-1;G.beepAt=this.WARM+1;G.hostN=0;G.score=[0,0];G.pvpKC=null;
    clearNades();NY.clear();for(const l of DL.list)if(l.flare)l.dead=true;
    const pm={},out=[];if(plan)for(const q of plan.P||[])pm[q[0]]=q;const S=plan?null:this.startSpots();if(G.mode==='race')for(const a of G.actors)a.raceLv=0;
    for(const a of G.actors){this.fresh(a);a.r0={k:a.kills,i:a.infects,dm:a.dmgDealt,sc:a.score||0,hs:a.hsKills|0};
      if(a.bot&&!a.pup)a.ldo=this.botLd();this.kit(a);
      const q=pm[a.id];if(q)placeAt(a,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);else{const p=S&&S.get(a)||[0,1,0,0];placeAt(a,p[0],p[1],p[2],p[3])}
      ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;a.pvpProt=0;a.pvpBuy=G.t+this.WARM+this.BUYW;a.pvpSpawnT=G.t;
      if(NET.host)out.push([a.id,r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw),0]);
      if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)this.botInit(a);if(typeof HSK!=='undefined')HSK.clear(a)}
    BO.reset();BO.next=1e9;SUP.reset();FX.clearDecals();HUD.roundStart();
    const L=LI(),md=T(G.mode);HUD.announce(md,'w',2.6);HUD.note(G.mode==='race'?(L?`Every kill gives the next gun · ${this.goal} steps · a knife kill on the last one wins`:`처치할 때마다 다음 무기 · ${this.goal}단계 · 마지막 칼 단계에서 칼로 처치하면 우승`):L?`B: weapons · Tab: scoreboard · first to ${this.goal} kills`:`B: 무기 선택 · Tab: 점수판 · 목표 ${this.goal}킬`,5);
    AU.play('siren',{vol:.3});AU.muSet&&AU.muSet('prep');if(G.mode!=='race')this.autoSet();
    if(NET.host)netEv('round',{n:1,P:out})},
  // the warm-up is over
  go(remote){if(G.mode==='bomb')return BOMB.go(remote);if(G.st!=='prep')return;G.st='fight';G.time=this.time;const L=LI();HUD.announce(L?'FIGHT!':'전투 시작!','w',1.8);AU.play('beep2',{vol:.6});AU.muSet&&AU.muSet('fight');
    if(NET.host&&!remote)netEv('pgo',{})},
  update(dt){if(G.mode==='bomb')return BOMB.update(dt);
    if(G.st==='prep'){G.time-=dt;const s=Math.ceil(G.time);if(s<G.beepAt&&s>=1){G.beepAt=s;if(s<=3)AU.play('beep',{vol:.5})}if(G.time<=0){if(NET.cli)G.time=0;else this.go()}}
    else if(G.st==='fight'){G.time-=dt;this.played+=dt;
      for(const a of G.actors){
        if(!a.alive){if(a.pvpRT!=null){a.pvpRT-=dt;if(a.pvpRT<=0&&!NET.cli){a.pvpRT=null;this.respawn(a,this.spawnFor(a))}}continue}
        if(a.pvpProt>G.t&&(a.lastFire||-9)>a.pvpSpawnT)a.pvpProt=0}// (protection ends at the first shot)
      for(const I of this.intel)while(I.length&&G.t-I[0].t>12)I.shift();
      if(!NET.cli)this.check();
      if(G.st==='fight'){const top=G.mode==='tdm'?Math.max(G.score[0],G.score[1]):G.mode==='race'?RACE.lv(this.leader())+1:((this.leader()||{}).kills|0);if(G.time<30||top>=this.goal-3)AU.muSet&&AU.muSet('intense')}}
    else if(G.st==='end'){G.endT-=dt;if(G.endT<=0&&!NET.cli){G.st='over';UI.showResults();if(NET.host)netEv('over')}}},
  leader(){if(G.mode==='race')return this.order(G.actors)[0]||null;let b=null;for(const a of G.actors)if(!b||a.kills>b.kills||a.kills===b.kills&&(a.deaths<b.deaths||a.deaths===b.deaths&&a.dmgDealt>b.dmgDealt))b=a;return b},
  check(){const g=this.goal;if(G.mode==='race'){if(G.time<=0){const L=this.leader();this.finish(L?L.id:-1)}return}// (무기 레이스: the knife kill ends it in kill())
    if(G.mode==='tdm'){const s0=G.score[0]|0,s1=G.score[1]|0;if(s0>=g||s1>=g){this.finish(s0>=s1?0:1);return}if(G.time<=0)this.finish(s0>s1?0:s1>s0?1:-1);return}
    const L=this.leader();if(L&&L.kills>=g){this.finish(L.id);return}if(G.time<=0)this.finish(L?L.id:-1)},
  iWon(){const P=G.player;if(!P||G.winner==null||G.winner<0)return false;return this.teams()?G.winner===(P.side===1?1:0):G.winner===P.id},
  mvp(A){if(G.mode==='race')return this.order(A||G.actors)[0]||null;A=(A||G.actors).slice().sort((p,q)=>(q.kills-p.kills)||(p.deaths-q.deaths)||(q.dmgDealt-p.dmgDealt));return A[0]||null},
  finish(w,remote){if(G.st!=='fight'&&G.st!=='prep')return;G.st='end';G.endT=this.ENDT;G.winner=w;G.time=Math.max(0,G.time);
    for(const a of G.actors){a.cmd.fire=a.cmd.alt=false;a.pvpRT=null;a.pendingMelee=null}
    const won=this.iWon();AU.play(won?'stingH':'stingZ',{vol:.7});AU.muSet&&AU.muSet(won?'win':'dead');
    try{this.endCard()}catch(e){console.error(e)}
    try{shopRoundReward(TH)}catch(e){console.error(e)}// (the round reward: one for the whole match, on the card)
    if(NET.host&&!remote)netEv('pend',{w,sc:G.score.slice()})},

  // ---------- where people stand ----------
  rndOpen(){const N=NAV.nodes;if(!N||!N.length)return null;const R=this.hreach();for(let k=0;k<30;k++){const n=N[(Math.random()*N.length)|0];if(n&&n.e.length>=12&&R[n.id])return n}return null},
  // (v6.49) the nav nodes a person can walk to from the map's spawns (climbs up to 1.45 m): the graph also keeps what only a zombie's jump
  // reaches (a crane bogie, a cab roof), and nobody should come back to life up there
  hreach(){const N=NAV.nodes;if(this._hrN===N&&this._hr)return this._hr;const R=new Uint8Array(N.length),st=[];
    for(const p of (MAP.spawns||[]).concat(MAP.zspawns||[])){const n=navNode(p[0],p[2]||0,p[1]);if(n&&!R[n.id]){R[n.id]=1;st.push(n.id)}}
    while(st.length){const e=N[st.pop()].e;for(let k=0;k<e.length;k+=3){if(e[k+2]>1.45)continue;const m=e[k];if(!R[m]){R[m]=1;st.push(m)}}}
    this._hrN=N;this._hr=R;return R},
  // open spots within r of a point on about its level (and the map's spawn points there)
  around(c,r){const L=[];for(const p of (MAP.spawns||[]).concat(MAP.zspawns||[])){const x=p[0],y=p[2]||0,z=p[1];if(Math.hypot(x-c.x,z-c.z)<r&&Math.abs(y-c.y)<2.5)L.push({x,y,z})}
    for(let k=0;k<50&&L.length<24;k++){const n=navAround(c.x,c.z,0,r);if(n&&n.e.length>=10&&Math.abs(n.y-c.y)<2.5&&!L.some(q=>Math.hypot(q.x-n.x,q.z-n.z)<1.1))L.push({x:n.x,y:n.y,z:n.z})}
    if(!L.length)L.push({x:c.x,y:c.y,z:c.z});return L},
  // 팀 데스매치: two bases. The human and zombie spawns when they are well apart (Italy, Militia …), else the two open places farthest apart that a
  // path joins (tried in order of distance)
  mkBases(){const P=p=>({x:p[0],y:p[2]||0,z:p[1]}),S=(MAP.spawns||[]).map(P),Z=(MAP.zspawns||[]).map(P);
    const cen=L=>L.length?{x:L.reduce((s,p)=>s+p.x,0)/L.length,y:L.reduce((s,p)=>s+p.y,0)/L.length,z:L.reduce((s,p)=>s+p.z,0)/L.length}:null,cs=cen(S),cz=cen(Z);
    let A=null,B=null;
    if(cs&&cz&&Math.hypot(cs.x-cz.x,cs.z-cz.z)>=35){A=S.concat(this.around(cs,9));B=Z.concat(this.around(cz,9))}
    else{const C=S.concat(Z);for(let i=0;i<60;i++){const n=this.rndOpen();if(n)C.push({x:n.x,y:n.y,z:n.z})}
      const pr=[];for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++)pr.push([Math.hypot(C[i].x-C[j].x,C[i].z-C[j].z),i,j]);pr.sort((p,q)=>q[0]-p[0]);
      for(let k=0;k<Math.min(8,pr.length);k++){const a=C[pr[k][1]],b=C[pr[k][2]],na=navNode(a.x,a.y,a.z),nb=navNode(b.x,b.y,b.z);if(na&&nb&&navPath(na,nb,1.45,30000,4.3)){A=this.around(a,12);B=this.around(b,12);break}}
      if(!A&&pr.length){A=this.around(C[pr[0][1]],12);B=this.around(C[pr[0][2]],12)}}
    if(!A)return null;return Math.random()<.5?[A,B]:[B,A]},
  cen(L){return {x:L.reduce((s,p)=>s+p.x,0)/L.length,z:L.reduce((s,p)=>s+p.z,0)/L.length}},
  yawTo(x,z,tx,tz){return Math.atan2(-(tx-x),-(tz-z))},
  // the host's placements at the start: a Map actor → [x, y, z, yaw]
  startSpots(){const M=new Map(),A=G.actors;
    if(G.mode==='tdm'){this.bases=this.mkBases();if(this.bases){const ce=this.bases.map(b=>this.cen(b));
        for(const s of [0,1]){const L=shuffle(this.bases[s].slice()),T0=A.filter(a=>(a.side===1?1:0)===s),o=ce[1-s];
          T0.forEach((a,i)=>{const p=L[i%L.length],k=Math.floor(i/L.length);M.set(a,[p.x+(k?rr(-.8,.8):0),p.y,p.z+(k?rr(-.8,.8):0),this.yawTo(p.x,p.z,o.x,o.z)+rr(-.3,.3)])})}
        return M}}
    // 개인전 (or no bases): spread out, each as far as possible from those placed before
    const C=(MAP.spawns||[]).concat(MAP.zspawns||[]).map(p=>({x:p[0],y:p[2]||0,z:p[1]}));for(let i=0;i<80;i++){const n=this.rndOpen();if(n)C.push({x:n.x,y:n.y,z:n.z})}
    const used=[];for(const a of shuffle(A.slice())){let best=null,bd=-1;for(const c of C){let d=1e9;for(const u of used)d=Math.min(d,Math.hypot(u.x-c.x,u.z-c.z)+Math.abs(u.y-c.y)*2);if(d>bd){bd=d;best=c}}
      if(!best)best={x:0,y:1,z:0};used.push(best);const t=rpick(C)||best;M.set(a,[best.x,best.y,best.z,this.yawTo(best.x,best.z,t.x,t.z)])}
    return M},
  // a place to come back: far from every enemy and out of their sight; 팀 데스매치 prefers the side's base and being near teammates
  spawnFor(a){const F=G.actors.filter(t=>t!==a&&t.alive&&foe(a,t)),Mt=G.mode==='tdm'?G.actors.filter(t=>t!==a&&t.alive&&!foe(a,t)):[],C=[];
    const base=G.mode==='tdm'&&this.bases?this.bases[a.side===1?1:0]:null;if(base)for(let i=0;i<10;i++){const p=rpick(base);C.push({x:p.x,y:p.y,z:p.z,b:1})}
    for(let i=0;i<16;i++){const n=this.rndOpen();if(n)C.push({x:n.x,y:n.y,z:n.z,b:0})}
    for(const p of (MAP.spawns||[]).concat(MAP.zspawns||[]))if(Math.random()<.35)C.push({x:p[0],y:p[2]||0,z:p[1],b:0});
    for(const c of C){let de=99;for(const t of F)de=Math.min(de,Math.hypot(t.c.x-c.x,t.c.z-c.z)+Math.abs(t.c.y-c.y)*2);c.de=de;
      let sc=Math.min(de,40)*(this.teams()?.5:1)+(c.b?22:0)+rr(0,6);if(de<10)sc-=60;
      if(Mt.length){let dm=99;for(const t of Mt)dm=Math.min(dm,Math.hypot(t.c.x-c.x,t.c.z-c.z));sc+=dm<20?6:dm<35?2:0}
      for(const r of this.recent)if(G.t-r.t<4&&Math.hypot(r.x-c.x,r.z-c.z)<3)sc-=15;c.sc=sc}
    C.sort((p,q)=>q.sc-p.sc);let pick=null;
    for(let i=0;i<Math.min(7,C.length);i++){const c=C[i];if(c.de<10)break;let seen=false;for(const t of F){if(Math.hypot(t.c.x-c.x,t.c.z-c.z)>50)continue;const e=actorEye(t);if(losClear(e.x,e.y,e.z,c.x,c.y+1.4,c.z)){seen=true;break}}if(!seen){pick=c;break}}
    if(!pick)pick=C.slice().sort((p,q)=>q.de-p.de)[0]||{x:0,y:1,z:0};
    this.recent.push({x:pick.x,z:pick.z,t:G.t});if(this.recent.length>12)this.recent.shift();
    // facing: the enemy base (팀 데스매치), else the nearest enemy, else anywhere
    let tx=pick.x+1,tz=pick.z;if(base&&this.bases){const o=this.cen(this.bases[a.side===1?0:1]);tx=o.x;tz=o.z}else if(F.length){let b=F[0];for(const t of F)if(Math.hypot(t.c.x-pick.x,t.c.z-pick.z)<Math.hypot(b.c.x-pick.x,b.c.z-pick.z))b=t;tx=b.c.x;tz=b.c.z}
    return [pick.x,pick.y,pick.z,this.yawTo(pick.x,pick.z,tx,tz)]},
  respawn(a,p){if(NET.cli&&!NET.ev)return;this.fresh(a);if(a.bot&&!a.pup&&Math.random()<.15)a.ldo=this.botLd();this.kit(a);
    placeAt(a,p[0],p[1],p[2],p[3]);ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;a.pvpProt=G.t+this.PROT;a.pvpBuy=G.t+this.BUYW;a.pvpSpawnT=G.t;a.lastFire=-9;
    if(NET.host&&a.net&&!a.isPlayer)a.pvpSp={x:p[0],z:p[2],t:G.t};// (its owner's page still reports the old place for a moment: netOnState below)
    if(a.isPlayer){VM.set(a.cur,a.skin);if(VM.draw)VM.draw(.4);G.spec=null;G.deathCam=0;G.killer=null;G.pvpKC=null;G.pvpKCd=false;const L=LI();HUD.note(G.mode==='race'?(L?'Back in!':'부활!'):L?'Back in! B: change weapons (12 s)':'부활! B: 무기 변경 (12초)',2.2)}
    if(a.bot)this.botSpawn(a);if(typeof HSK!=='undefined')HSK.clear(a);
    if(NET.host)netEv('prs',{i:a.id,p:[r2(p[0]),r2(p[1]),r2(p[2]),r3(p[3])]})},

  // ---------- hits and kills ----------
  // PvP numbers on top of what the weapon dealt: headshots ×4 (the guns' own ×3 brought up), melee scaled down; HE comes in already worked out
  scale(t,dmg,o){const W=WPN[o.w]||{};if(o.he)return dmg;if(o.knife)return dmg*(this.MEL[o.w]||.85);if(o.hs&&W.hs===3)return dmg*4/3;return dmg},
  // the share of a hit that goes through armour to health
  ap(o){const W=WPN[o.w]||{};if(o.he)return .6;if(o.knife)return .85;if(W.kind==='pistol'&&(W.dmg||0)>=50)return .8;return this.AP[W.kind]||.7},
  hurt(t,dmg,src,o){o=o||{};if(G.st!=='fight'||!t.alive||!src||src===t||!foe(src,t)||this.prot(t))return 0;// (no friendly fire, no self-damage)
    const d=this.scale(t,dmg,o),hp0=t.hp,ar0=t.armor;
    if(t.armor>0){const ab=Math.min(t.armor,d*(1-this.ap(o)));t.armor-=ab;t.hp-=d-ab}else t.hp-=d;
    t.lastHurt=G.t;const dealt=(ar0-t.armor)+(hp0-Math.max(0,t.hp));
    t.pvpBy=t.pvpBy||{};t.pvpBy[src.id]=(t.pvpBy[src.id]||0)+dealt;
    src.dmgDealt+=dealt;src.dmgRound=(src.dmgRound||0)+dealt;src.score+=dealt/100;if(src.isPlayer)HUD.dmgNum(t,dealt,!!o.hs,t.hp<=0);
    if(t.isPlayer){HUD.hurt(clamp(dealt/40,.25,1));FX.shake=Math.max(FX.shake,.3);t.punchP+=.012*(o.hs?2:1);this.hitDir(src);if(hp0-t.hp<1&&ar0>t.armor)AU.play('armor',{vol:.5});else AU.play('hurt',{vol:.7})}
    else{if(!AU.throttle('ph'+t.id,250))AU.at('hurt',t.c.x,t.c.y+1.5,t.c.z,{vol:.8});
      if(NET.host&&t.net){const k='phs'+t.id;if(!AU.throttle(k,150))netSend(t.net,{t:'phit',s:src.id})}}// (a remote player learns where it came from)
    t.an.flinch=Math.min(1,t.an.flinch+.35);if(o.dir)t.an.flx=clamp((t.an.flx||0)+(o.dir[0]*Math.cos(t.yaw)-o.dir[2]*Math.sin(t.yaw))*.6,-1,1);if(t.ch)t.ch.mat.uniforms.uFlash.value=Math.min(.3,t.ch.mat.uniforms.uFlash.value+.1);
    if(t.bot)this.botHurt(t,src);
    if(t.hp<=0)this.kill(t,src,o);return dealt},
  // a client's claimed hit, checked on the host: an allowed weapon, no more than one hit of it can do, at no more than its rate of fire
  claimOk(src,t,h){if(G.st!=='fight'||this.prot(t))return false;const w=WL[h[2]],f=h[3]|0,W=WPN[w],dmg=+h[1]||0;
    if(f&8)return G.mode!=='race'&&(w==='he'||!w)&&dmg<=this.HED+2;// (a grenade still goes off after its thrower is down)
    if(!src.alive||!W||!this.ok(w))return false;if(G.mode==='race'&&!RACE.okWep(src,w))return false;
    const cap=W.kind==='melee'?Math.max(W.dmg[0],W.dmg[1])*2*1.05:(W.dmg||0)*(W.hs||3)*1.05;if(dmg>cap+.5)return false;
    const B=src.pvpTB||(src.pvpTB={n:0,t:G.t}),per=W.kind==='melee'?(W.cleave?6:3):(W.pellets||1)*(W.rpm||600)/60;B.n=Math.max(0,B.n-(G.t-B.t)*per*1.6);B.t=G.t;B.n++;
    return B.n<=Math.max(12,(W.pellets||1)*4)},
  // HE in 대인전: up to 98 at the centre, nothing past 6.5 m, not through walls; never the thrower or his side
  heBlast(n){const o=n.owner;for(const t of G.actors){if(!t.alive||t===o||!foe(o,t))continue;const dx=t.c.x-n.x,dy=t.c.y+1-n.y,dz=t.c.z-n.z,d=Math.hypot(dx,dy,dz);if(d>this.HER)continue;
    if(!losClear(n.x,n.y+.3,n.z,t.c.x,t.c.y+1,t.c.z))continue;damageActor(t,Math.round(this.HED*(1-d/this.HER)),o,{w:'he',he:1,dir:[dx/(d||1),.3,dz/(d||1)],kb:0,stag:0,x:t.c.x,y:t.c.y+1,z:t.c.z})}},
  kill(t,src,o){if(NET.cli&&!NET.ev)return;if(!t.alive)return;o=o||{};let as=o.as||[];
    if(!NET.cli){as=[];for(const id in t.pvpBy||{}){const a=this.byId(+id);if(a&&a!==src&&a!==t&&foe(a,t)&&t.pvpBy[id]>=35)as.push(a.id)}}
    ldSnap(t);t.hp=0;t.alive=false;t.permaDead=false;t.deadT=0;t.deaths++;t.frozen=0;t.zoom=0;t.reloadT=0;t.relKind=null;t.burstN=0;t.pendingMelee=null;t.throwT=0;t.nHold=0;
    t.an.dead=Math.max(t.an.dead,.001);aimDir(t.yaw,0,_dv);t.deadDir=(o.dir&&(o.dir[0]*_dv.x+o.dir[2]*_dv.z)>0)?-1:1;t.pvpRT=G.mode==='bomb'?null:this.RESP;t.pvpBy={};t.pvpStreak=0;if(G.mode==='bomb'&&!NET.cli)BOMB.drop(t);
    AU.at('hdie',t.c.x,t.c.y+1.4,t.c.z,{vol:1});
    if(src&&src!==t){src.kills++;if(o.hs)src.hsKills=(src.hsKills|0)+1;src.score+=2;src.pvpStreak=(src.pvpStreak|0)+1;if(G.mode==='tdm')G.score[src.side===1?1:0]++}
    for(const id of as){const a=this.byId(id);if(a){a.assists=(a.assists|0)+1;a.score+=1}}
    HUD.feed(src,o.w||'',t,{hs:o.hs});
    if(src&&src.isPlayer){HUD.killConfirm(o.hs);AU.play('hsding',{vol:o.hs?.55:.35,rate:o.hs?1:1.2});const n=src.pvpStreak,L=LI();
      if(n>=2)HUD.announce(n===2?(L?'DOUBLE KILL':'더블 킬'):n===3?(L?'TRIPLE KILL':'트리플 킬'):(L?`${n} KILLS IN A ROW`:`${n}연속 킬`),'w',1.4)}
    if(t.isPlayer){onPlayerDeath(src);G.deathCam=this.KCAM;G.pvpKC=src&&src!==t?src:null;G.pvpKCd=false}
    if(t.bot)this.botDie(t);
    let rw=null;if(G.mode==='race')rw=RACE.onKill(t,src,o);
    if(NET.host)netEv('pk',{i:t.id,s:src?src.id:-1,w:o.w||'',hs:o.hs?1:0,d:o.dir?[r2(o.dir[0]),r2(o.dir[1]),r2(o.dir[2])]:0,as,rl:o.rl||0});
    if(rw!=null&&!NET.cli)this.finish(rw)},
  // where a hit on me came from: a red arc round the crosshair for a second
  hitDir(src){const P=G.player;if(!src||!P)return;this.hits.push({x:src.c.x,z:src.c.z,t:G.t});if(this.hits.length>4)this.hits.shift()},

  // ---------- my loadout at the start: set 1 (what 대인전 allows and the account owns), a plain rifle if it has no primary ----------
  autoSet(){const P=G.player;if(!P||!P.alive)return;const s=ldSets()[0]||{},ids=[];
    for(const id of [s[3],s.he&&'he',s.flare&&'flare',s[2],s[1]]){if(!id||!this.ok(id)||ldLocked(P,id,true))continue;if(!buyCheck(P,id))ids.push(id)}
    if(!ids.some(id=>WPN[id]&&WPN[id].slot===1)){const fb=['kv47','ar7','g35','k5','sg8'].find(id=>!ldLocked(P,id,true)&&!buyCheck(P,id));if(fb)ids.push(fb)}
    if(!ids.length)return;const S={n:ids.length,got:0,gun:false,fail:[]};
    if(NET.cli){for(const id of ids)ldAsk(P,id,S);return}
    for(const id of ids){if(buy(P,id,false,{quiet:1})){S.got++;if(WPN[id]&&WPN[id].kind!=='nade')S.gun=true}}
    equip(P,bestWeapon(P),true);P.drawT=0;VM.set(P.cur,P.skin)},

  // ---------- bots ----------
  botLd(){const prim=[['kv47',.2],['ar7',.2],['g35',.1],['br3',.07],['ar5c',.08],['hr17',.07],['k5',.06],['k9',.04],['um45',.05],['pd50',.05],['sg8',.05],['m14',.05],['as12',.03],
      ['db2',.02],['r700',.06],['sr8',.04],['dm14',.03],['hmg',.03],['mg6',.02]].filter(p=>WPN[p[0]]);
    let t=0;for(const p of prim)t+=p[1];let r=Math.random()*t,p1=prim[0][0];for(const p of prim){r-=p[1];if(r<=0){p1=p[0];break}}
    const pr=Math.random(),p2=pr<.6?'p9':pr<.75?'d50':pr<.85?'f7':pr<.93?'tw9':'r6';
    return {1:p1,2:p2,3:'knife',he:Math.random()<.5?1:0,frost:0,flare:0,armor:1}},
  diff(){const d=DIFF[G.diff|0]||DIFF[1];if(this._D&&this._D.k===d)return this._D;return this._D={k:d,react:d.react*1.7+.08,err:d.err*1.6,turn:d.turn*.8,hsP:d.hsP*.55,tol:d.tol}},
  botInit(a){const B=a.bot;Object.assign(B,{pm:this.mid,tg:null,lkp:null,rg:null,rgT:0,path:null,pg:null,repath:0,hurtBy:null,hurtT:-9,seenT:-9,react:0,aimX:0,aimY:0,aimOX:0,aimOY:0,aimRT:0,
    aimT0:0,hs:false,hsT:0,strafe:0,strafeT:0,crouchT:0,nadeCD:rr(6,14),scanY:null,fireHold:false,burstT:0,lof:false});a.flash=false},
  botSpawn(a){const B=a.bot;B.tg=null;B.lkp=null;B.rg=null;B.path=null;B.pg=null;B.hurtBy=null;B.scanY=null;B.react=0;B.crouchT=0;a.flash=false},
  botDie(a){const B=a.bot;B.tg=null;B.path=null},
  botHurt(t,src){const B=t.bot;if(!B||!src)return;B.hurtBy=src;B.hurtT=G.t;if(!B.tg||B.tg===src||Math.random()<.5)B.lkp={x:src.c.x,y:src.c.y,z:src.c.z,t:G.t}},
  botHeard(a,t){const B=a.bot;if(B.tg)return;if(!B.lkp||G.t-B.lkp.t>1.5||Math.random()<.3)B.lkp={x:t.c.x+rr(-3,3),y:t.c.y,z:t.c.z+rr(-3,3),t:G.t,h:1}},
  // sight at ~8 Hz: the closest enemy in view (about 140°) with a clear line, one that just hurt it even behind; shots heard give a rough place
  botSee(a,D){const B=a.bot,c=a.c,e=actorEye(a),hb=B.hurtBy&&G.t-B.hurtT<2.5?B.hurtBy:null;let best=null,bd=1e9;
    for(const t of G.actors){if(t===a||!t.alive||!foe(a,t))continue;const dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz);if(d>this.SIGHT)continue;
      const known=B.tg===t&&G.t-B.seenT<1,ang=Math.abs(wrapA(Math.atan2(-dx,-dz)-a.yaw)),Wt=WPN[t.cur],heard=G.t-(t.lastFire||-9)<1.2&&d<40&&!(Wt&&Wt.quiet);
      if(ang>1.22&&d>4&&!known&&t!==hb){if(heard)this.botHeard(a,t);continue}
      if(!losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.3,t.c.z)&&!losClear(e.x,e.y,e.z,t.head.x,t.head.y,t.head.z)){if(heard||t===hb)this.botHeard(a,t);continue}
      const sc=d*(known?.7:1)*(t===hb?.5:1)*(this.prot(t)?2.5:1);if(sc<bd){bd=sc;best=t}}
    if(best){if(B.tg!==best){B.tg=best;B.react=D.react*(.7+Math.random()*.6)*(dist3(best.c,c)<5?.5:1);B.aimT0=G.t;B.hsT=0}B.seenT=G.t;B.lkp={x:best.c.x,y:best.c.y,z:best.c.z,t:G.t};
      if(this.teams()){const I=this.intel[a.side===1?1:0];I.push({x:best.c.x,y:best.c.y,z:best.c.z,t:G.t});if(I.length>10)I.shift()}}
    else if(B.tg&&(!B.tg.alive||G.t-B.seenT>.6))B.tg=null;
    const t=B.tg;B.lof=!!t&&losClear(e.x,e.y,e.z,t.c.x,B.hs?t.head.y:t.c.y+t.c.h*.6,t.c.z)},
  range(W){const k=W&&W.kind;return k==='shotgun'?[3,9]:k==='smg'?[5,16]:k==='sniper'?[14,60]:k==='pistol'?[5,18]:k==='melee'?[0,1.6]:[8,30]},
  canStep(a,dx,dz){const c=a.c;return charFits(c,c.x+dx*.6,c.y+.3,c.z+dz*.6)&&floorBelow(c.x+dx*.9,c.y+.4,c.z+dz*.9,.2)>c.y-.6},
  botWalk(a,g,dt){const B=a.bot,c=a.c;if(Math.hypot(g.x-c.x,g.z-c.z)<1.2&&Math.abs(g.y-c.y)<1.2)return false;
    const pg=B.pg,far=!pg||Math.hypot(pg.x-g.x,pg.z-g.z)>3||Math.abs(pg.y-g.y)>1.5;B.repath-=dt;
    if(!B.path||B.pi>=B.path.length||B.repath<=0||far&&B.repath<1){B.repath=1.4+rr(0,.6);B.pg={x:g.x,y:g.y,z:g.z};if(!AI.goTo(a,g.x,g.y,g.z,1.45)){B.rg=null;B.lkp=null;B.repath=.8;return false}}
    return AI.follow(a,dt,true)},
  // somewhere to go with no enemy in sight: where one was last seen or heard; 팀 데스매치: where teammates saw one, or the enemy base;
  // 개인전: toward shooting; else open ground well away
  botGoal(a){const B=a.bot,c=a.c;
    if(B.lkp&&G.t-B.lkp.t<7){if(Math.hypot(B.lkp.x-c.x,B.lkp.z-c.z)<2.5)B.lkp=null;else return B.lkp}
    if(B.rg&&G.t<B.rgT&&Math.hypot(B.rg.x-c.x,B.rg.z-c.z)>2.5)return B.rg;
    let g=null;
    if(G.mode==='tdm'){const I=this.intel[a.side===1?1:0].filter(p=>G.t-p.t<10);if(I.length&&Math.random()<.6){const p=rpick(I);g={x:p.x+rr(-4,4),y:p.y,z:p.z+rr(-4,4)}}
      else if(this.bases&&Math.random()<.4){const p=rpick(this.bases[a.side===1?0:1]);g={x:p.x,y:p.y,z:p.z}}}
    else{const F=G.actors.filter(t=>t!==a&&t.alive&&G.t-(t.lastFire||-9)<3&&Math.hypot(t.c.x-c.x,t.c.z-c.z)<60);if(F.length&&Math.random()<.6){const t=rpick(F);g={x:t.c.x+rr(-6,6),y:t.c.y,z:t.c.z+rr(-6,6)}}}
    if(!g){const n=navAround(c.x,c.z,12,40)||this.rndOpen();if(n)g={x:n.x,y:n.y,z:n.z}}
    if(g){const n=navSnap(g.x,g.y,g.z,4);if(n)g={x:n.x,y:n.y,z:n.z}}
    B.rg=g;B.rgT=G.t+rr(12,22);return g},
  // the fight itself: hold a range that suits the gun, strafe, crouch now and then; too far → walk at it
  botFight(a,tg,dt,W){const B=a.bot,c=a.c,dx=tg.c.x-c.x,dz=tg.c.z-c.z,d=Math.hypot(dx,dz),R=this.range(W),ux=dx/(d||1),uz=dz/(d||1);
    if(d>R[1]&&!(W.kind==='sniper'&&B.lof))return this.botWalk(a,{x:tg.c.x,y:tg.c.y,z:tg.c.z},dt);
    B.path=null;let mx=0,mz=0;
    if(W.kind==='melee'){mx=ux;mz=uz}
    else{if(d<R[0]){mx=-ux;mz=-uz}
      B.strafeT-=dt;if(B.strafeT<=0){B.strafeT=rr(.35,1.1);B.strafe=Math.random()<.2?0:(Math.random()<.5?-1:1)}
      const still=W.kind==='sniper'&&a.zoom>0;if(B.strafe&&!still){mx+=-uz*B.strafe*.9;mz+=ux*B.strafe*.9}
      if(B.crouchT>0){B.crouchT-=dt;a.cmd.duck=true}else if(d>14&&Math.random()<dt*.25)B.crouchT=rr(.6,1.6);
      if(c.onGround&&d<14&&!a.duck&&Math.random()<dt*.12)a.cmd.jump=true}
    if(mx||mz){const l=Math.hypot(mx,mz);mx/=l;mz/=l;if(this.canStep(a,mx,mz)){AI.moveDir(a,mx,mz);return true}if(B.strafe)B.strafe=-B.strafe}
    return false},
  botGun(a,tg,W){const B=a.bot,am=a.ammo[a.cur],cmd=a.cmd,prim=a.inv[1],pa=prim&&a.ammo[prim],side=a.inv[2],sa=side&&a.ammo[side];
    if(W.kind==='nade'){if(!tg&&a.throwT<=0)equip(a,bestWeapon(a));return}
    if(a.drawT>0)return;
    if(tg){const d=dist3(tg.c,a.c);
      if(am&&W.mag&&am.mag===0){if(a.cur===prim&&d<12&&sa&&sa.mag>0)equip(a,side);else if(am.res>0)cmd.reload=true;else if(a.cur===prim&&sa&&sa.mag+sa.res>0)equip(a,side);else equip(a,a.inv[3]||'knife')}
      else if(a.cur===side&&pa&&pa.mag+pa.res>0&&d>12&&a.reloadT<=0)equip(a,prim);
      else if(W.kind==='melee'&&d>3&&pa&&pa.mag+pa.res>0)equip(a,prim);
    }else{if(a.cur!==prim&&pa&&pa.mag+pa.res>0)equip(a,prim);else if(am&&W.mag&&am.mag<W.mag*.6&&am.res>0&&a.reloadT<=0)cmd.reload=true}},
  botAim(a,tg,dt,D,W){const B=a.bot,c=a.c,e=actorEye(a),cmd=a.cmd;
    B.hsT-=dt;if(B.hsT<=0){B.hsT=.6;B.hs=Math.random()<D.hsP}
    const tdist=dist3(tg.c,c),ty=B.hs?tg.head.y:tg.c.y+tg.c.h*.6,lead=W.kind==='sniper'?0:.06,tx=tg.c.x+tg.c.vx*lead,tz=tg.c.z+tg.c.vz*lead;
    const A=HBOT.aim,sk=clamp((G.t-B.aimT0)/.6,0,1),sig=D.err*lerp(A[0],A[1]+tdist/A[2],sk)*(Math.hypot(c.vx,c.vz)>1.5?1.3:1);
    B.aimRT-=dt;if(B.aimRT<=0){B.aimRT=rr(.12,.28);B.aimOX=gRand()*sig;B.aimOY=gRand()*sig*.6}const ka=Math.min(1,dt*8);B.aimX=lerp(B.aimX,B.aimOX,ka);B.aimY=lerp(B.aimY,B.aimOY,ka);
    const yaw=Math.atan2(-(tx-e.x),-(tz-e.z))+B.aimX,dist=Math.hypot(tx-e.x,tz-e.z),pitch=Math.atan2(ty-e.y,dist)+B.aimY;
    AI.turnTo(a,yaw,pitch,dt,D.turn*(dist<4?1.8:1));B.react-=dt;
    if(B.react>0||!B.lof||this.prot(tg)||a.drawT>0)return;
    if(W.kind==='nade'){if(a.throwT<=0){a.pitch=Math.min(.5,pitch+.08+dist*.012);cmd.fire=true}return}
    const err=Math.abs(wrapA(yaw-a.yaw))+Math.abs(pitch-a.pitch);if(err>D.tol+(W.pellets?.1:0))return;
    if(W.kind==='melee'){if(tdist<2.2){cmd.fire=Math.random()<.65;cmd.alt=!cmd.fire}return}
    if(!a.ammo[a.cur])return;
    if(W.zoom&&a.zoom===0&&dist>(W.kind==='sniper'?7:18)){cmd.alt=true;return}if(a.zoom>0&&dist<6)a.zoom=0;
    const semi=W.semi||W.burst;cmd.fire=semi?(B.fireHold=!B.fireHold):true;
    if(!semi&&dist>18){B.burstT=(B.burstT||0)+dt;if(B.burstT>.35){cmd.fire=false;if(B.burstT>.6)B.burstT=0}}},
  bot(a,dt){const B=a.bot,cmd=a.cmd,c=a.c;cmd.duck=false;if(B.pm!==this.mid)this.botInit(a);
    if(G.st==='prep'){if(B.scanY==null)B.scanY=a.yaw;AI.turnTo(a,B.scanY+Math.sin(G.t*.6+a.id)*.8,-.03,dt,2);return}
    if(G.st!=='fight')return;
    const D=this.diff();if(B.think<=0){B.think=.11+Math.random()*.06;this.botSee(a,D);
      if(B.tg&&a.inv.he>0&&WPN[a.cur]&&WPN[a.cur].kind!=='nade'){B.nadeCD-=.14;if(B.nadeCD<=0){B.nadeCD=rr(6,12);const d=dist3(B.tg.c,c);if(d>7&&d<18&&B.lof&&Math.random()<.5)equip(a,'he')}}}
    const tg=B.tg&&B.tg.alive&&foe(a,B.tg)?B.tg:null,W=WPN[a.cur]||{},bm=G.mode==='bomb';
    if(bm&&BOMB.botAct(a,dt,tg))return;
    this.botGun(a,tg,W);let moving=false;
    if(tg)moving=this.botFight(a,tg,dt,WPN[a.cur]||W);else{const g=bm?BOMB.botGoal(a):this.botGoal(a);if(g)moving=this.botWalk(a,g,dt)}
    if(tg)this.botAim(a,tg,dt,D,WPN[a.cur]||W);
    else if(moving){const v=Math.hypot(c.vx,c.vz);if(v>.5)AI.turnTo(a,Math.atan2(-c.vx,-c.vz),0,dt,6)}
    else if(bm&&B.holdY!=null)AI.turnTo(a,B.holdY+Math.sin(G.t*.45+a.id*1.7)*.42,-.03,dt,2.6);// (holding an angle in 폭파미션)
    else{if(B.scanY==null)B.scanY=a.yaw;AI.turnTo(a,B.scanY+Math.sin(G.t*.5+a.id*1.7)*1.4,-.03,dt,2.4)}},

  // ---------- on screen ----------
  ui(){const hud=$('hud');if(!hud)return;if(!this.mkL){const m=document.createElement('div');m.id='pvMarks';hud.appendChild(m);this.mkL=m;this.mkPool=[]}
    if(!this.hitL){const h=document.createElement('div');h.id='pvHit';h.innerHTML='<i class="pvhd"></i><i class="pvhd"></i><i class="pvhd"></i><i class="pvhd"></i>';hud.appendChild(h);this.hitL=h;this.hitEl=[...h.children]}
    if(!$('pvTag')){const t=document.createElement('div');t.id='pvTag';hud.appendChild(t)}},
  // teammates (팀 데스매치): a chevron over the head, the name within 28 m
  marks(){const P=G.player;let n=0;
    if(this.teams()&&P&&G.st!=='menu'&&G.st!=='over'){const cam=R.cam,W=innerWidth,H=innerHeight;this.mkL.style.setProperty('--pvc',this.SIDES[P.side===1?1:0].c);
      for(const a of G.actors){if(a===P||!a.alive||a.side!==P.side||a===G.spec&&!P.alive)continue;_pvV.set(a.head.x,a.head.y+.38,a.head.z).project(cam);if(_pvV.z>1||Math.abs(_pvV.x)>1.05||Math.abs(_pvV.y)>1.05)continue;
        const d=Math.hypot(a.c.x-cam.position.x,a.c.z-cam.position.z);let el=this.mkPool[n];if(!el){el=document.createElement('div');el.className='pvmk';this.mkL.appendChild(el);this.mkPool[n]=el}n++;
        const nm=d<28?esc(a.name):'';if(el._n!==nm){el._n=nm;el.innerHTML=`<i></i>${nm?`<span>${nm}</span>`:''}`}
        el.style.transform=`translate(${((_pvV.x*.5+.5)*W).toFixed(1)}px,${((-_pvV.y*.5+.5)*H).toFixed(1)}px)`;el.style.display='block';el.style.opacity=d>45?'.55':'1'}}
    for(let i=n;i<this.mkPool.length;i++)if(this.mkPool[i].style.display!=='none')this.mkPool[i].style.display='none'},
  drawHits(){const P=G.player;for(let i=0;i<4;i++){const h=this.hits[i],el=this.hitEl[i];if(!h||!P||!P.alive||G.t-h.t>1.1){if(el.style.opacity!=='0')el.style.opacity='0';continue}
    const dx=h.x-P.c.x,dz=h.z-P.c.z,f=dx*-Math.sin(P.yaw)+dz*-Math.cos(P.yaw),r=dx*Math.cos(P.yaw)+dz*-Math.sin(P.yaw);
    el.style.transform=`rotate(${(Math.atan2(r,f)*180/Math.PI).toFixed(1)}deg)`;el.style.opacity=(1-(G.t-h.t)/1.1).toFixed(2)}},
  // the HUD on top of the usual one (called every frame after HUD.update)
  hud(dt){const P=G.player,e=HUD.el,L=LI();if(!P)return;this.ui();const tdm=G.mode==='tdm',set=(el,v,html)=>{if(!el)return;if(html){if(el.innerHTML!==v)el.innerHTML=v}else if(el.textContent!==v)el.textContent=v};
    e.hud.classList.add('pvp');
    // top bar: the mode and the goal; the two scores (팀 데스매치) or my kills and the leader's (개인전); who is up
    const S=this.SIDES;
    if(G.mode==='bomb')BOMB.hud(dt,set);
    else if(G.mode==='race')RACE.hud(dt,set);
    else if(tdm){const ms=P.side===1?1:0;set(e.hRound,`${T('tdm')} · ${T('pGoal')} ${this.goal} · <b class="${ms?'z':'h'}">${S[ms].n[L]}</b>`,1);set(e.hSH,String(G.score[0]|0));set(e.hSZ,String(G.score[1]|0));
      let a0=0,a1=0;for(const a of G.actors)if(a.alive){if(a.side===1)a1++;else a0++}set(e.hAH,`${S[0].n[L]} ${a0}`);set(e.hAZ,`${S[1].n[L]} ${a1}`)}
    else{const R0=G.actors.slice().sort((p,q)=>(q.kills-p.kills)||(p.deaths-q.deaths)),rk=R0.indexOf(P)+1,top=R0.find(a=>a!==P);
      set(e.hRound,`${T('ffa')} · ${T('pGoal')} ${this.goal}`);set(e.hSH,String(P.kills|0));set(e.hSZ,String(top?top.kills|0:0));
      set(e.hAH,L?`Rank ${rk}/${R0.length}`:`순위 ${rk}/${R0.length}`);set(e.hAZ,top?(rk===1?(L?`2nd ${top.name}`:`2위 ${top.name}`):(L?`1st ${R0[0].name}`:`1위 ${R0[0].name}`)):'')}
    if(G.st==='prep'&&HUD.annT<=0){const s=Math.max(1,Math.ceil(G.time));set(e.hBig,L?`Fight in ${s}`:`${s}초 뒤 시작`);if(e.hBig.className!=='a cd'+(G.time<3.5?' hot':''))e.hBig.className='a cd'+(G.time<3.5?' hot':'')}
    set(e.hDmg,`${L?'Damage':'피해량'} <b>${Math.round(P.dmgDealt||0).toLocaleString('en-US')}</b>`,1);
    // dead: back in …, who did it (his weapon and the health he has left), who I am watching
    let sp='';if(!P.alive&&(G.st==='fight'||G.st==='prep')){sp=G.mode==='bomb'?(L?'Back next round':'다음 라운드에 다시 시작'):L?`Back in ${Math.max(1,Math.ceil(P.pvpRT==null?this.RESP:P.pvpRT))} s`:`${Math.max(1,Math.ceil(P.pvpRT==null?this.RESP:P.pvpRT))}초 뒤 부활`;
      const k=G.pvpKC||G.killer;if(k&&k!==P){const kw=WPN[k.cur];sp+=`<br><small>${T('killedBy',`<b class="${this.cls(k)}">${esc(k.name)}</b>`)}${kw&&kw.n?' · '+esc(kw.n[L]):''}${k.alive?(L?` · ${Math.ceil(k.hp)} HP left`:` · 남은 체력 ${Math.ceil(k.hp)}`):''}</small>`}
      if(G.spec)sp+=`<br><small>${T('spec')}: <b class="${this.cls(G.spec)}">${esc(G.spec.name)}</b> — ${T('specHint')}</small>`}
    set(e.hSpec,sp,1);e.hSpec.style.display=sp?'block':'none';
    // who is under the crosshair: the name in its colour; a teammate's health
    this.aiT-=dt;if(this.aiT<=0){this.aiT=.08;let ai='';if(P.alive&&!G.spec){const ey=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const hw=rayCast(ey.x,ey.y,ey.z,_dv.x,_dv.y,_dv.z,60);let best=null,bt=hw?hw.t:60;
        for(const t of G.actors){if(!t.alive||t===P)continue;const c=t.c,th=rayAABB(ey.x,ey.y,ey.z,_dv.x,_dv.y,_dv.z,c.x-c.hw,c.y,c.z-c.hw,c.x+c.hw,t.head.y+.15,c.z+c.hw,bt);if(th>=0&&th<bt){bt=th;best=t}}
        if(best)ai=`<span class="${this.cls(best)}">${esc(best.name)}</span>`+(!foe(P,best)?`<span class="bar t"><i style="width:${Math.round(clamp(best.hp/100,0,1)*100)}%"></i></span>`:'')}this.aiS=ai}
    set(e.aimInfo,this.aiS,1);
    // spawn protection and the buy window
    const tg=$('pvTag');let tx='';if(G.mode!=='bomb'&&P.alive&&(G.st==='prep'||G.st==='fight')){if(this.prot(P))tx+=`<div class="pr">${L?'Spawn protection':'스폰 보호 중'}</div>`;
      if(G.mode==='race'){}else if(G.st==='prep')tx+=`<div class="by">${L?'B: pick your weapons':'B: 무기 선택'}</div>`;else if(P.pvpBuy>G.t)tx+=`<div class="by">${L?`B: change weapons · ${Math.ceil(P.pvpBuy-G.t)} s`:`B: 무기 변경 · ${Math.ceil(P.pvpBuy-G.t)}초`}</div>`}
    if(G.mode!=='bomb'&&tg&&tg.innerHTML!==tx)tg.innerHTML=tx;
    this.marks();this.drawHits()},
  // the card while the match ends (the round card's place and looks; the match reward goes on it)
  endCard(){const L=LI(),A=G.actors.slice(),P=G.player,n=v=>Math.round(v).toLocaleString('en-US'),w=G.winner;
    const pic=a=>{try{return portrait('h_'+a.skin,44)}catch(_){return ''}};
    const card=(a,cls,lbl)=>a?`<div class="rmvp ${cls}"><img src="${pic(a)}"><div><small>${lbl}</small><b>${esc(a.name)}</b><span>${T('kills')} ${a.kills} · ${T('deaths')} ${a.deaths} · ${T('dmg')} ${n(a.dmgDealt)}</span></div></div>`:'';
    let hd,cls,mv;
    if(this.teams()){const S=this.SIDES;hd=w<0?(L?'Draw':'무승부'):(L?`${S[w].n[1]} wins`:`${S[w].n[0]} 팀 승리`);cls=w<0?'d':w===1?'z':'h';
      mv=card(this.mvp(A.filter(a=>a.side!==1)),'h',`${S[0].n[L]} MVP`)+card(this.mvp(A.filter(a=>a.side===1)),'z',`${S[1].n[L]} MVP`);
      hd=`<b>${hd}</b><span>${S[0].n[L]} ${G.score[0]|0} : ${G.score[1]|0} ${S[1].n[L]}</span>`}
    else{const R0=G.mode==='race'?this.order(A):A.slice().sort((p,q)=>(q.kills-p.kills)||(p.deaths-q.deaths)||(q.dmgDealt-p.dmgDealt)),win=this.byId(w);cls=!win?'d':win===P?'h':'z';
      hd=`<b>${win?(win===P?(L?'You win!':'우승!'):(L?`${esc(win.name)} wins`:`${esc(win.name)} 우승`)):(L?'Draw':'무승부')}</b><span>${G.mode==='race'?`${T('race')} · ${this.goal}${L?' steps':'단계'}`:`${T('pGoal')} ${this.goal}`}</span>`;
      mv=card(R0[0],R0[0]===P?'h':'z',L?'1st':'1위')+card(R0[1],R0[1]===P?'h':'z',L?'2nd':'2위')}
    const rows=this.order(A).slice(0,8);
    let el=$('hRRes');if(!el){el=document.createElement('div');el.id='hRRes';$('hud').appendChild(el)}
    el.innerHTML=`<div class="rhd ${cls}">${hd}</div><div class="rmvps">${mv}</div>
      <table class="rtbl"><tr><th>${T('name')}</th><th></th><th>${T('kills')}</th><th>${T('deaths')}</th><th>${T('assists')}</th><th>${T('dmg')}</th></tr>${rows.map(a=>`<tr class="${a===P?'me':''}"><td>${esc(a.name)}${HOF.crown(HOF.of(a))}</td><td class="f ${this.cls(a)}">${this.teams()?this.SIDES[a.side===1?1:0].n[L]:G.mode==='race'?`${T('lvl')} ${RACE.lv(a)+1}`:'■'}</td><td>${a.kills}</td><td>${a.deaths}</td><td>${a.assists|0}</td><td>${n(a.dmgDealt)}</td></tr>`).join('')}</table>`;
    HUD.annT=0;HUD.ann=null;$('hBig').className='a off';el.classList.remove('off');el.style.animation='none';void el.offsetWidth;el.style.animation=''},
  // the scoreboard rows (Tab, the results)
  table(A){const mp=NET.on,L=LI(),n=v=>Math.round(v).toLocaleString('en-US');
    return `<table class="tbl pvt"><tr><th></th><th>${T('name')}</th>${G.mode==='race'?`<th>${T('lvl')}</th>`:''}<th>${T('kills')}</th><th>${T('deaths')}</th><th>${T('assists')}</th><th>${T('dmg')}</th><th>${T('score')}</th>${mp?'<th>ping</th>':''}</tr>${A.map(a=>`<tr class="${a.isPlayer?'me ':''}${this.cls(a)}${a.alive?'':' dead'}"><td>■</td><td>${esc(a.name)}${HOF.crown(HOF.of(a))}${a.net?' <b class="mpp">◆</b>':''}${G.mode==='bomb'&&(G.st==='fight'||G.st==='prep')&&BOMB.carrier()===a&&G.player&&!foe(G.player,a)?' <b class="bmc">C4</b>':''}</td>${G.mode==='race'?`<td class="rclv">${RACE.lv(a)+1}<small>/${RACE.ladder().length}</small></td>`:''}<td>${a.kills}</td><td>${a.deaths}</td><td>${a.assists|0}</td><td class="dmg">${n(a.dmgDealt)}</td><td>${Math.round(a.score)}</td>${mp?`<td>${a.net?(NET.host&&a.isPlayer?'—':a.ping>=0&&a.ping!=null?a.ping+'ms':(a.isPlayer?'':'—')):'BOT'}</td>`:''}</tr>`).join('')}</table>`},
  order(A){if(G.mode==='race')return A.slice().sort((p,q)=>(RACE.lv(q)-RACE.lv(p))||(q.kills-p.kills)||(p.deaths-q.deaths)||(q.score-p.score));return A.slice().sort((p,q)=>(q.kills-p.kills)||(p.deaths-q.deaths)||(q.score-p.score))},
  scoreHTML(sm){const L=LI(),S=this.SIDES;if(this.teams())return `<div class="finalScore${sm?' sm':''}"><span class="h">${S[0].n[L]} ${G.score[0]|0}</span> : <span class="z">${G.score[1]|0} ${S[1].n[L]}</span></div>`;
    const R0=this.order(G.actors);return `<div class="finalScore${sm?' sm':''}"><span class="${R0[0]===G.player?'h':'z'}">${L?'1st':'1위'} ${esc(R0[0]?R0[0].name:'—')} · ${G.mode==='race'?`${T('lvl')} ${R0[0]?RACE.lv(R0[0])+1:0}`:`${R0[0]?R0[0].kills:0} ${T('kill')}`}</span></div>`},
  boardHTML(){const L=LI(),S=this.SIDES,head=`<h3>${T('board')} — ${T(G.mode)} · ${G.mode==='bomb'?`${T('round')} ${G.round}/${G.rounds} · ${T('pWins')} ${BOMB.W}`:G.mode==='race'?`${this.goal}${L?' steps':'단계'}`:`${T('pGoal')} ${this.goal}`}</h3>${this.scoreHTML(true)}`;
    if(this.teams())return head+[0,1].map(s=>`<div class="pvSide ${s?'z':'h'}">${S[s].n[L]} · ${G.score[s]|0}</div>`+this.table(this.order(G.actors.filter(a=>(a.side===1?1:0)===s)))).join('');
    return head+this.table(this.order(G.actors))},
  // the results screen: the usual one, with the score, the MVP and the table made for 대인전
  resPatch(){const el=$('results');if(!el)return;const L=LI(),P=G.player,w=G.winner;
    const h2=el.querySelector('h2');if(h2)h2.textContent=`${T('results')} — ${T(G.mode)}`;
    const fs=el.querySelector('.finalScore');if(fs)fs.outerHTML=this.scoreHTML(false);
    const m=this.teams()&&w>=0?this.mvp(G.actors.filter(a=>(a.side===1?1:0)===w)):this.mvp(),mv=el.querySelector('.mvp');
    if(mv&&m)mv.innerHTML=`<img src="${portrait('h_'+m.skin,56)}"><div><small>${T('mvp')}${this.teams()&&w>=0?' · '+this.SIDES[w].n[L]:''}</small><b>${esc(m.name)}</b><span>${T('kills')} ${m.kills} · ${T('deaths')} ${m.deaths} · ${T('assists')} ${m.assists|0} · ${T('dmg')} ${Math.round(m.dmgDealt).toLocaleString('en-US')}</span></div>`;
    const tb=el.querySelector('table.tbl');if(tb)tb.outerHTML=this.teams()?[0,1].map(s=>`<div class="pvSide ${s?'z':'h'}">${this.SIDES[s].n[L]} · ${G.score[s]|0}</div>`+this.table(this.order(G.actors.filter(a=>(a.side===1?1:0)===s)))).join(''):this.table(this.order(G.actors));
    const won=this.iWon();el.classList.toggle('pvwon',won)},
};

// ---------- hooks ----------
AI.pvp=function(a,dt){PVP.bot(a,dt)};
(function(){
  // a match: 대인전 on or off (the buy menu, death drops), its settings (alone: the room settings window's bots, goal and time)
  const sm=startMatch;startMatch=function(cfg){const pv=PVP.isMode(cfg&&cfg.mode);G.pvp=pv;PVP.menu(pv);DROPS.LIFE=pv?30:90;
    if(pv){if(!cfg.ro)cfg=Object.assign({},cfg,{bots:CFG.pbots??7,pg:CFG.pg??1,ptime:CFG.ptime??480,pw:CFG.pw??1});PVP.setup(cfg)}else PVP.hits=[];
    return sm.call(this,cfg)};
  const sr=startRound;startRound=function(plan){if(!G.pvp)return sr(plan);return PVP.begin(plan)};
  // no death drops (everyone gets his own guns back), no zombie class menu
  const dd=dropDeath;dropDeath=function(a){if(G.pvp)return;return dd(a)};
  const oo=Main.openOverlay.bind(Main);Main.openOverlay=function(k){if(G.pvp&&k==='zsel'){HUD.note(LI()?'No zombies in PvP':'대인전에는 좀비가 없어요',1.4);return}
    if(G.pvp&&G.mode==='race'&&k==='buy'){HUD.note(LI()?'No picking weapons in Arms Race — every kill brings the next gun':'무기 레이스에서는 무기를 고를 수 없어요 — 처치하면 다음 무기가 와요',2);return}
    if(G.pvp&&k==='buy'&&G.player&&!G.player.alive&&this.overlay!=='buy'){const L=LI();HUD.note(G.mode==='bomb'?(L?'Weapons can be changed at the start of the next round':'다음 라운드 시작 때 무기를 바꿀 수 있어요'):(L?'Weapons can be changed for 12 s after coming back':'무기는 부활 후 12초 동안 바꿀 수 있어요'),1.8);return}return oo(k)};
  // a saved set (Shift+1–3): not while down, not after the buy window
  const les=ldEquipSet;ldEquipSet=function(i){const P=G.player;if(G.pvp&&G.mode==='race')return;if(G.pvp&&P&&(!P.alive||G.st==='fight'&&G.t>(P.pvpBuy||0))){ldWhy('pvpT');return}return les(i)};
  // the warm-up and the end: no moving or shooting
  const pc=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc(dt);if(!G.pvp)return;const P=G.player;if(!P||!P.alive)return;const c=P.cmd;
    if(G.st!=='fight'){if(G.mode==='bomb'&&G.st==='end'&&!BOMB.final){c.fire=c.alt=false;c.drop=false;return}// (between rounds: walk about, no shooting)
      c.f=c.s=0;c.jump=false;c.fire=c.alt=false;c.drop=false;if(G.st!=='prep')c.reload=false}
    else if(P.bAct){c.f=c.s=0;c.jump=false;c.fire=c.alt=false;c.drop=false;c.duck=P.bAct.k==='defuse'}
    if(G.mode==='race')c.drop=false};// (무기 레이스: the gun of the step stays in hand)// (planting / defusing: hands busy, feet still)
  // spectating: the killer first, then (팀 데스매치) teammates, (개인전) anyone
  const ns=Main.nextSpec.bind(Main);Main.nextSpec=function(){if(!G.pvp)return ns();const P=G.player;
    if(G.pvpKC&&G.pvpKC.alive&&!G.pvpKCd){G.pvpKCd=true;G.spec=G.pvpKC;return}
    const Lst=G.actors.filter(a=>a.alive&&!a.isPlayer&&(!PVP.teams()||!P||a.side===P.side));if(!Lst.length){G.spec=G.pvpKC&&G.pvpKC.alive?G.pvpKC:null;return}
    G.specIdx=(Lst.indexOf(G.spec)+1)%Lst.length;G.spec=Lst[G.specIdx]};
  // buying: what 대인전 allows, within 12 s of coming back (any time in the warm-up)
  const bc=buyCheck;buyCheck=function(a,id){const r=bc(a,id);if(r||!G.pvp)return r;if(G.mode==='race')return 'na';if(!PVP.ok(id))return 'na';if(G.st==='fight'&&G.t>(a.pvpBuy||0))return 'pvpT';return ''};
  const lw=ldWhy;ldWhy=function(why,id){if(G.pvp&&(why==='pvpT'||why==='na')){const L=LI();
      HUD.note(why==='pvpT'?(G.mode==='bomb'?(L?'Weapons can only be changed in the first 20 s of a round':'무기는 라운드 시작 후 20초까지만 바꿀 수 있어요'):L?'Weapons can only be changed for 12 s after coming back':'무기는 부활 후 12초 동안만 바꿀 수 있어요'):(L?'Special weapons are off in PvP':'대인전에서는 특수 무기를 쓸 수 없어요'),2);AU.play('dry',{vol:.5});return}
    return lw(why,id)};
  const rb=UI.renderBuy;UI.renderBuy=function(){const r=rb.apply(this,arguments);if(!G.pvp)return r;const P=G.player,h=document.querySelector('#buy h3');if(!h||!P)return r;const L=LI();
    let s=h.querySelector('.pvbuy');if(!s){s=document.createElement('span');s.className='pvbuy';h.appendChild(s)}
    s.textContent=G.st==='prep'?(L?'PvP · plain guns only':'대인전 · 기본 무기만'):P.pvpBuy>G.t?(L?`${Math.ceil(P.pvpBuy-G.t)} s left`:`${Math.ceil(P.pvpBuy-G.t)}초 남음`):G.mode==='bomb'?(L?'time is up — next round':'시간 끝 — 다음 라운드에'):(L?'time is up — after the next respawn':'시간 끝 — 다음 부활 때');return r};
  // the HUD, the kill feed (names in their colours), the scoreboard and the results
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);if(G.pvp)try{PVP.hud(dt)}catch(e){console.error(e)}else if(this.el.hud&&this.el.hud.classList.contains('pvp'))this.el.hud.classList.remove('pvp')};
  const hf=HUD.feed.bind(HUD);HUD.feed=function(src,w,t,f){if(!G.pvp)return hf(src,w,t,f);const c=a=>a?(PVP.cls(a)==='z'?TZ:TH):-1;
    this.feedL.push({k:src?src.name:'',kt:c(src),v:t.name,vt:c(t),w:w||'',hs:f&&f.hs,inf:false,perma:false,me:(src&&src.isPlayer)||t.isPlayer,t:G.t});if(this.feedL.length>6)this.feedL.shift();this.renderFeed()};
  const bd=UI.board.bind(UI);UI.board=function(on){if(!G.pvp)return bd(on);const b=$('board');b.classList.toggle('off',!on);if(!on)return;b.innerHTML=PVP.boardHTML()};
  const rs=UI.showResults;UI.showResults=function(){const r=rs.apply(this,arguments);if(G.pvp)try{PVP.resPatch()}catch(e){console.error(e)}return r};
  // the rewards: won = my side (player) won, no infections; the match's "rounds" are its minutes
  const srs=shopRoundStats;shopRoundStats=function(win){const r=srs(win);if(!G.pvp)return r;const P=G.player;r.won=PVP.iWon();r.survived=false;r.infects=0;r.round=1;r.mvp=PVP.mvp()===P&&(P.kills|0)>0;return r};
  const sms=shopMatchStats;shopMatchStats=function(){const r=sms();if(!G.pvp)return r;const P=G.player;r.won=PVP.iWon();r.infects=0;r.mvp=PVP.mvp()===P&&(P.kills|0)>0;r.rounds=Math.min(10,Math.max(1,G.mode==='bomb'?G.round|0:Math.round(PVP.played/60)));return r};
  // the side's colour on every body (팀 데스매치), a white shimmer while spawn protection lasts
  const uv=updateVisual;updateVisual=function(a,dt){uv(a,dt);if(!G.pvp||!a.ch||a.team!==TH||!a.ch.grp.visible)return;const T0=a.ch.mat.uniforms.uTint.value;
    // (the side colour follows the light at the body, so a team colour does not glow in the dark)
    const pr=a.ch.mat.uniforms.uProbe.value,k=clamp((pr.r+pr.g+pr.b)*.45,.3,.85);
    if(a.alive&&a.pvpProt>G.t)T0.set(.9*k,.95*k,k,.22+.12*Math.sin(G.t*14));else if(PVP.teams()){const s=PVP.SIDES[a.side===1?1:0].t;T0.set(s[0]*k,s[1]*k,s[2]*k,.22)}};
  // the radar: an enemy who just fired shows (a silenced gun does not)
  const aw=RADAR.aware.bind(RADAR);RADAR.aware=function(P,a,dt){if(G.pvp&&G.t-(a.lastFire||-9)<1.5&&!(WPN[a.cur]&&WPN[a.cur].quiet))return true;return aw(P,a,dt)};
  // leaving
  const tt=Main.toTitle.bind(Main);Main.toTitle=function(){PVP.off();return tt()};
  const tl=netToLobby;netToLobby=function(){PVP.off();return tl.apply(this,arguments)};
  // the host: a player who just came back still reports where he died for a moment — that is not passed on until he reports the new place
  const nos=netOnState;netOnState=function(L,m){nos(L,m);if(!G.pvp||NET.ui!=='game')return;const a=actorOfKey(L.key);if(!a||!a.pvpSp)return;const r=a.nraw;if(!r)return;
    if(Math.hypot(r.x-a.pvpSp.x,r.z-a.pvpSp.z)<3||G.t-a.pvpSp.t>2)a.pvpSp=null;else{a.nraw=null;if(a.nb)a.nb.length=0}};
})();
// ---------- network: what the host tells everyone ----------
Object.assign(CLIH,{
  pgo(){PVP.go(true)},
  pk(L,m){const t=byId(m.i);if(!t)return;netWithEv(()=>PVP.kill(t,m.s>=0?byId(m.s):null,{w:m.w,hs:!!m.hs,dir:m.d?[m.d[0]/100,m.d[1]/100,m.d[2]/100]:null,as:Array.isArray(m.as)?m.as:[],rl:Array.isArray(m.rl)?m.rl:null}))},
  prs(L,m){const a=byId(m.i);if(!a||!Array.isArray(m.p))return;netWithEv(()=>PVP.respawn(a,[m.p[0]/100,m.p[1]/100,m.p[2]/100,m.p[3]/1000]))},
  pend(L,m){if(Array.isArray(m.sc))G.score=m.sc.slice(0,2);netWithEv(()=>PVP.finish(m.w,true))},
  phit(L,m){const s=byId(m.s);if(s)PVP.hitDir(s)}});

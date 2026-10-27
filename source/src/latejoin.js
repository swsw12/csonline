'use strict';
// ============ joining a match under way (v6.82) ============
// The owner's 3번: a room that had started turned everyone away (「이미 게임이 진행 중인 방이에요」), so 빠른 매칭 and the room list
// could only use rooms still waiting. Now, in the modes of NET_LATE (진화 감염 · 클래식 감염 · 팀 데스매치 · 개인전 · 무기 레이스 · 폭파미션;
// not the scenario's chapters), the host takes the newcomer in:
//   - a seat in the waiting room's list (NET.lob.pl, so the room's order of succession knows them) and an actor of their own, with the
//     next id, on every page: the others get 'jn' with its roster row, the newcomer gets 'start' with the whole roster and 'late' —
//     the match as it stands (state, clock, round, score; every actor's flags, class, health, side, place and weapon; the bomb;
//     supply boxes and dropped guns). The snapshots fill in health and places from then on, the scoreboard every half second;
//   - when they play: infection modes — at once if the round is still in its preparation (more than 2 s left), else they watch
//     (the dead-player camera: a click / the fire button for the next one) and come in with the next round's plan; 대인전 — a side
//     (the smaller team; 개인전 and 무기 레이스 their own) and in the warm-up at once, in the fight after 1.5 s, by the usual respawn
//     ('prs', then the loadout set 1 as at a match start); 폭파미션 — a side; in its freeze at once, else with the next round.
// A round watched is not claimed (no a.r0 until a round starts with them in it). Refused as before: the scenario, a full room
// (8 players, or 24 actors with the bots), a match on its last result card, a hand-over.
// The newcomer sees a line until they are in: 관전 중 — 다음 라운드부터 함께해요 (or 곧 투입돼요), with who they are watching.
// (Over the claude.ai room relay a message must fit one 4 KiB presence: there the boxes and guns on the floor are left out.)
const LATE={MAX_A:24,wait:false,el:null,
  // (host) whether this match takes a newcomer now: '' yes, else the refusal
  why(){if(!NET.host||NET.ui!=='game'||NET.mig)return 'ingame';if(!NET_LATE.includes(G.mode))return 'ingame';
    if(G.st==='over'||G.st==='end'&&this.last())return 'ingame';
    if(NET.lob.pl.length>=NET_MAXP||G.actors.length>=this.MAX_A)return 'full';return ''},
  // the result card that ends the match is up next
  last(){if(G.pvp)return G.mode!=='bomb'||!!(typeof BOMB!=='undefined'&&BOMB.final);return G.round>=G.rounds||Math.max(G.score[0],G.score[1])>G.rounds/2},
  // 대인전 but the bomb: in by a respawn, not with a round
  soon(){return G.pvp&&G.mode!=='bomb'},
  // an actor from a roster row, on this page (as startMatch makes them)
  mk(r){const me=!!r[4]&&r[4]===NET.me;const a=mkActor(r[1],me,r[2]);a.id=r[0];ACTOR_ID=Math.max(ACTOR_ID,a.id+1);
    a.zpick=me?(CFG.zclass||r[3]):r[3];a.net=r[4]||null;a.pup=NET.host?!!r[4]&&!me:!me;
    a.money=0;a.survived=false;a.ldo=null;a.ehBuy=0;a.bq=[];ldKitReset(a);a.hofC=r[6]|0;a.hofN=String(r[7]||'');a.ttC=r.length>8?r[8]:undefined;
    a.r0={k:0,i:0,dm:0,sc:0,hs:0};G.actors.push(a);NET.ids.set(a.id,a);if(me)G.player=a;return a},
  // waiting for a round or a respawn (a round only watched has no a.r0, so it is not claimed)
  hold(a){a.lateW=true;a.alive=false;if(!this.soon())a.r0=null},
  // a fresh human life where they stand (what a round start gives everyone)
  live(a){a.team=TH;a.host=false;a.alive=true;a.permaDead=false;a.hp=100;a.maxHp=100;a.lvl=1;a.infR=0;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;
    a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.bombs=0;a.rootT=0;a.burnT=0;a.dmgRound=0;a.deadT=0;a.an.dead=0;a.an.atk=0;a.zoom=0;a.flash=false;a.nv=false;a.lateW=false;
    ldRestore(a);setHull(a);ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}},
  spot(){const S=MAP.spawns&&MAP.spawns.length?MAP.spawns:[[0,0]],p=rpick(S);return [p[0],p[2]||0,p[1],p[3]!=null?p[3]:rr(0,TAU)]},
  // (대인전) the side: the smaller team, or one's own
  side(a){if(!G.pvp)return;if(!PVP.teams()){a.side=a.id+2;return}const n=[0,0];for(const b of G.actors)if(b!==a)n[b.side===1?1:0]++;a.side=n[0]<=n[1]?0:1},
  row(a){return [a.id,a.name,a.skin,a.zpick,a.net||'',a.scen?1:0,a.hofC|0,a.hofN||'',a.ttC===undefined?null:a.ttC]},
  // (host) the match as it stands, for the newcomer on link L
  state(L){const BOon=typeof BO!=='undefined'&&BO.on,d1=v=>Math.round((v||0)*10)/10;
    const s={st:G.st,t:d1(G.time),r:G.round|0,sc:[G.score[0]|0,G.score[1]|0],hn:G.hostN|0,ml:G.moraleLvl|0,bo:BOon?d1(Math.max(0,BO.dur-BO.t)):0,et:d1(G.endT||0),
      // [id, flags, zombie class, health, armour, max health, level, side, race step, x, y, z, yaw, weapon, waiting, the round's start: kills, infections, damage]
      A:G.actors.map(a=>[a.id,netFlags(a),ZI[a.zc]|0,Math.ceil(a.hp),Math.ceil(a.armor),Math.round(a.maxHp),a.lvl|0,a.side==null?-1:a.side|0,a.raceLv|0,
        r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw),WI[a.cur]??-1,a.lateW&&!a.alive?1:0,...(a.r0?[a.r0.k|0,a.r0.i|0,Math.round(a.r0.dm||0)]:[-1,0,0])])};
    if(G.mode==='bomb'&&typeof BOMB!=='undefined'){const b=BOMB.b,k=['none','carried','dropped','planted','gone'].indexOf(b.st);s.bb=[k<0?0:k,b.by?b.by.id:-1,r2(b.x),r2(b.y),r2(b.z),b.site==='B'?1:0,BOMB.final?1:0]}
    if(L.kind!=='relay'){s.sb=SUP.list.map(b=>[b.id|0,r2(b.x),r2(b.y),r2(b.z),Math.round(b.t*10)]);s.wd=DROPS.list.map(d=>[d.id|0,WI[d.w]??-1,r2(d.x),r2(d.y),r2(d.z),r3(d.yaw),Math.round(d.t),d.rest?1:0])}
    return s},
  // (host) a player said hello to a match under way
  admit(L,m){const w=this.why();if(w){netSend(L.key,{t:'bye',why:w});return}
    let p=NET.lob.pl.find(q=>q.k===L.key);if(!p){p={k:L.key};NET.lob.pl.push(p)}
    p.n=String(m.n||'?').slice(0,14);p.s=HSKINS.includes(m.s)?m.s:'guard';p.z=ZLIST.includes(m.z)?m.z:'rager';p.f=HOF.valid(m.f)?+m.f:0;p.tt=typeof m.tt==='string'?m.tt.slice(0,24):null;p.an=p.f||p.tt?String(m.an||'').slice(0,16):'';p.t=m.tc?1:0;L.name=p.n;
    const id=G.actors.reduce((x,a)=>Math.max(x,a.id),-1)+1,r=[id,p.n,p.s,p.z,L.key,0,p.f|0,p.an||'',p.tt],a=this.mk(r);this.side(a);if(G.mode==='race')a.raceLv=0;
    const sp=this.spot();placeAt(a,sp[0],sp[1],sp[2],sp[3]);
    // when they play: an infection round still preparing — now; 대인전 — by the respawn (in the warm-up, or 폭파미션's freeze, at once;
    // in the fight after 1.5 s, or 폭파미션 with the next round)
    const early=G.st==='prep'&&G.time>2,now=(G.mode==='mut'||G.mode==='orig')&&early;if(now)this.live(a);else this.hold(a);
    netEv('jn',{r,s:a.side==null?-1:a.side,p:[r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw)],a:now?1:0});
    const cfg=Object.assign({},G.cfg);delete cfg.ro;netSend(L.key,{t:'start',cfg,ro:G.actors.map(b=>this.row(b)),late:this.state(L)});L.inGame=true;
    if(this.soon()){if(G.st==='prep')PVP.respawn(a,PVP.spawnFor(a));else a.pvpRT=1.5}
    else if(G.mode==='bomb'&&early){const q=BOMB.spots().get(a);if(q)PVP.respawn(a,q)}
    HUD.note(T('mpJoined',p.n),2.5);AU.play('uiok',{vol:.4});
    // (the room's list goes to everyone a moment later, in a message of its own)
    setTimeout(()=>{if(NET.on&&NET.host)netLobbyCast()},150)},
  // (a page in the match) someone joined
  jn(m){const r=netCleanRo([m.r])[0];if(!r||!r[4]||byId(r[0])||r[4]===NET.me)return;const a=this.mk(r);
    if(G.pvp){if(Number.isFinite(m.s)&&m.s>=0)a.side=m.s|0;else this.side(a);if(G.mode==='race')a.raceLv=0}
    const p=Array.isArray(m.p)&&m.p.length>=4&&m.p.every(Number.isFinite)?m.p:null,sp=p?[p[0]/100,p[1]/100,p[2]/100,p[3]/1000]:this.spot();placeAt(a,sp[0],sp[1],sp[2],sp[3]);
    if(m.a&&(G.mode==='mut'||G.mode==='orig'))this.live(a);else this.hold(a);HUD.note(T('mpJoined',a.name),2.5)},
  // (the newcomer) the match as the host has it
  apply(s){if(!s||typeof s!=='object')return;const num=(v,d)=>Number.isFinite(+v)?+v:d,ok=(q,n)=>Array.isArray(q)&&q.length>=n&&q.slice(0,n).every(v=>typeof v==='number'&&Number.isFinite(v));
    if(ST_L.includes(s.st)&&s.st!=='menu')G.st=s.st;G.time=num(s.t,G.time);G.round=netI(s.r,0,999,G.round);if(Array.isArray(s.sc))G.score=[netI(s.sc[0],0,999,0),netI(s.sc[1],0,999,0)];
    G.hostN=netI(s.hn,0,64,0);G.moraleLvl=netI(s.ml,0,10,0);G.endT=num(s.et,6);if(G.pvp)PVP.assigned=true;
    for(const e of Array.isArray(s.A)?s.A.slice(0,96):[]){if(!ok(e,18))continue;const a=byId(e[0]);if(!a)continue;
      const F=e[1];if(G.pvp&&e[7]>=0)a.side=e[7]|0;if(G.mode==='race')a.raceLv=e[8]|0;a.r0=e[15]<0?null:{k:e[15],i:e[16],dm:e[17],sc:0,hs:0};
      placeAt(a,e[9]/100,e[10]/100,e[11]/100,e[12]/1000);
      if(e[14]&&!(F&1)){a.lateW=true;a.alive=false;continue}
      if(a===G.player&&(F&1)&&!(F&2)){this.live(a);a.hp=e[3];a.armor=e[4];continue}
      a.alive=!!(F&1);a.permaDead=!!(F&2048);a.host=!!(F&16);
      if(F&2){a.team=TZ;a.zc=ZALL[e[2]]||a.zpick||'rager';a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0,smoke:0};a.ammo={};a.cur=null}else a.team=TH;
      a.hp=e[3];a.armor=e[4];a.maxHp=e[5]||100;a.lvl=e[6]||1;setHull(a);
      // (drawn: the living, and zombies down until they rise; the rest come back with a round or a respawn)
      if(a.alive||a.team===TZ&&!a.permaDead){ensureRig(a);if(a.team===TZ)equip(a,'claw',true);else{const w=WL[e[13]];equip(a,w&&WPN[w]&&WPN[w].kind!=='claw'?w:bestWeapon(a),true)}}
      if(!a.alive){a.an.dead=1;a.deadT=a.permaDead?60:1}}
    if(G.mode==='bomb'&&typeof BOMB!=='undefined'&&ok(s.bb,7)){const q=s.bb,st=['none','carried','dropped','planted','gone'][q[0]]||'none',x=q[2]/100,y=q[3]/100,z=q[4]/100,by=byId(q[1]);
      BOMB.b=st==='carried'?(by?{st,by}:{st:'none'}):st==='dropped'?{st,by:null,x,y,z,rot:0}:st==='planted'?{st,by:null,x,y,z,site:q[5]?'B':'A',tl:G.time,planter:-1,rot:0}:{st,x,y,z};BOMB.final=!!q[6]}
    // the boxes and guns lying about, without the drop's call and sound
    const n0=HUD.note,p0=AU.play;HUD.note=()=>{};AU.play=()=>{};
    try{for(const q of Array.isArray(s.sb)?s.sb.slice(0,4):[]){if(!ok(q,5)||SUP.list.some(b=>b.id===q[0]))continue;const b=SUP.spawn(q[0],q[1]/100,q[2]/100,q[3]/100);if(!b)continue;b.t=Math.max(0,q[4]/10);
        if(b.h-b.t*4.2<=0){b.landed=true;if(b.chute){R.scene.remove(b.chute);b.chute.material.dispose();b.chute=null}b.light=DL.add(b.x,b.y+1,b.z,'#ff7030',6,1.4,0,{flick:.2})}}
      for(const q of Array.isArray(s.wd)?s.wd.slice(0,DROPS.MAX):[]){const w=ok(q,8)?WL[q[1]]:null;if(!w||!WPN[w]||DROPS.list.some(d=>d.id===q[0]))continue;
        const d=dropSpawn({id:q[0],w,x:q[2]/100,y:q[3]/100,z:q[4]/100,yaw:q[5]/1000});if(!d)continue;d.t=Math.max(0,q[6]);if(q[7]){d.rest=true;if(d.mesh)d.mesh.rotation.z=Math.PI/2}}}
    catch(e){console.error(e)}finally{HUD.note=n0;AU.play=p0}
    if(num(s.bo,0)>1&&typeof BO!=='undefined')try{BO.start(num(s.bo,0),true)}catch(e){console.error(e)}
    const P=G.player;this.wait=!!(P&&!P.alive);if(P&&!P.alive){G.deathCam=0;G.spec=null}
    // (the line under the score says when they come in; the note only that they are in, and on a desktop that a click starts)
    const L=LI(),tc=typeof TOUCH!=='undefined'&&TOUCH.on;HUD.note((L?'You joined a match under way':'진행 중인 방에 들어왔어요')+(tc?'':' · '+T('clickToPlay')),4.5);this.ban()},
  // the newcomer's line until they are in (who they watch, how to watch another); the usual "down" text gives way to it
  ban(){const P=G.player;if(!NET.on)this.wait=false;const on=this.wait&&!!P&&!P.alive&&NET.ui==='game'&&G.st!=='over'&&G.st!=='menu';
    if(this.wait&&P&&P.alive){this.wait=false;if(G.pvp&&G.mode!=='race')setTimeout(()=>{try{PVP.autoSet()}catch(e){console.error(e)}},0)}
    document.documentElement.classList.toggle('ljw',on);
    let el=this.el;if(!on){if(el)el.remove();this.el=null;return}
    if(!el){el=this.el=document.createElement('div');el.id='lateBan';(document.getElementById('app')||document.body).appendChild(el)}
    // (just under the round, score and head count, wherever the layout puts them)
    const ht=document.getElementById('hTop'),hb=ht&&ht.offsetParent?ht.getBoundingClientRect().bottom:0;el.style.top=hb>0?Math.round(hb+8)+'px':'';
    const L=LI(),soon=this.soon(),tc=typeof TOUCH!=='undefined'&&TOUCH.on,sp=G.spec&&G.spec.alive?G.spec:null;
    const t=soon?(L?'Coming in…':'곧 투입돼요…'):(L?'Watching — you are in from the next round':'관전 중 — 다음 라운드부터 함께해요');
    const s=soon?'':(sp?(L?`Watching ${sp.name} · `:`${sp.name} 보는 중 · `):'')+(tc?(L?'fire button: someone else':'사격 버튼: 다른 사람'):(L?'click: someone else':'클릭: 다른 사람'));
    const h=`<b>${esc(t)}</b>${s?`<span>${esc(s)}</span>`:''}`;if(el.innerHTML!==h)el.innerHTML=h}};
(function(){
  // a hello to a match under way: in, or turned away (a page coming back after a hand-over goes the usual way)
  const h0=HOSTH.hello;HOSTH.hello=function(L,m){
    if(NET.ui==='game'&&m&&m.v===NET_VER&&!m.mg&&!actorOfKey(L.key)){try{LATE.admit(L,m)}catch(e){console.error(e);netSend(L.key,{t:'bye',why:'ingame'})}return}
    return h0.call(this,L,m)};
  CLIH.jn=function(L,m){try{LATE.jn(m)}catch(e){console.error(e)}};
  const st0=CLIH.start;CLIH.start=function(L,m){const r=st0.call(this,L,m);if(m&&m.late)try{LATE.apply(m.late)}catch(e){console.error(e)}return r};
  // (someone waiting is in once alive: a round start, or a 대인전 respawn)
  const sr=startRound;startRound=function(){const r=sr.apply(this,arguments);for(const a of G.actors)if(a.alive)a.lateW=false;return r};
  const rs=PVP.respawn;PVP.respawn=function(a){const r=rs.apply(this,arguments);if(a&&a.alive){a.lateW=false;if(a.isPlayer&&LATE.wait)try{LATE.ban()}catch(e){console.error(e)}}return r};
  // (the line goes when they are in, or the match is over)
  setInterval(()=>{if(LATE.wait||LATE.el)try{LATE.ban()}catch(e){}},300);
  const tl=netToLobby;netToLobby=function(){LATE.wait=false;try{LATE.ban()}catch(e){}return tl.apply(this,arguments)};
})();

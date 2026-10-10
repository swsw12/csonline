'use strict';
// ============ Bots: humans buy, roam the map between camps and open ground, hold and fight; zombies path-find, leap ledges, swarm and use skills ============
const DIFF=[{react:.38,err:.05,turn:7,hsP:.1,tol:.18},{react:.24,err:.027,turn:11,hsP:.24,tol:.22},{react:.16,err:.018,turn:14,hsP:.36,tol:.24},{react:.1,err:.012,turn:18,hsP:.5,tol:.26}];
// per difficulty: bot zombie health and speed
const DIFF_Z={hp:[.85,1,1.15,1.35],spd:[.93,1,1.04,1.08]};
const CAMP_W={};// legacy weights; camps carry their own weight w
const NOISE=[];
function alertBots(src,x,z){if(src.team!==TH)return;NOISE.push({x,z,t:G.t});if(NOISE.length>24)NOISE.shift()}
function jumpCap(a){if(a.team===TH)return 1.45;const Z=ZCLASS[a.zc];return Z.jump*Z.jump/(2*GRAV)+Z.h*.3-.06}
// human bots outside the scenario: sight (m), how close a zombie may come before they back off (m), aim error [on a fresh target ×,
// settled ×, + distance / this] × the difficulty's err
const HBOT={sight:40,kite:9,aim:[2.5,.25,40]};
// the zombie pack: staging ring (m from the target), longest wait there (s), how many staged make a rush, a human this close makes it
// rush anyway (m), everyone rushes in the last `late` s; fall back under hp share [others, hosts] until `heal` or `hide` s; choosing
// a target, a human counts `share` m farther for each other zombie on it and `strag` m for each human standing by it
const ZPACK={ring:[13,20],wait:7,quorum:3,near:9,late:35,low:[.3,.25],heal:.75,hide:12,share:7,strag:2.5};
// roughly normal noise (mean 0, sd 1)
function gRand(){return (Math.random()+Math.random()+Math.random()-1.5)*2}
// live humans within r metres of a point on about the same level (ex not counted)
function hNear(x,y,z,r,ex){let n=0;for(const h of G.actors){if(h===ex||!h.alive||h.team!==TH||Math.abs(h.c.y-y)>2.2)continue;const dx=h.c.x-x,dz=h.c.z-z;if(dx*dx+dz*dz<r*r)n++}return n}
// a zombie on its feet within r metres of a point on about the same level
function zNearPt(x,y,z,r){for(const t of G.actors){if(!t.alive||t.team!==TZ||t.reviving>0||Math.abs(t.c.y-y)>2.6)continue;const dx=t.c.x-x,dz=t.c.z-z;if(dx*dx+dz*dz<r*r)return true}return false}
// a random walkable node r0–r1 m out from (x,z) on any level, or null
function navAround(x,z,r0,r1){const N=NAV;if(!N.col||!N.nodes.length)return null;const an=Math.random()*TAU,r=Math.sqrt(r0*r0+(r1*r1-r0*r0)*Math.random());
  const i=Math.floor((x+Math.cos(an)*r-N.X0)/N.S),j=Math.floor((z+Math.sin(an)*r-N.Z0)/N.S);if(i<0||j<0||i>=N.NX||j>=N.NZ)return null;const L=N.col[j*N.NX+i];return L&&L.length?L[(Math.random()*L.length)|0]:null}
// can any of these humans see a node (a zombie standing on it)?
function hSees(H,n,r){for(const h of H){const dx=h.c.x-n.x,dz=h.c.z-n.z;if(dx*dx+dz*dz>r*r)continue;const e=actorEye(h);if(losClear(e.x,e.y,e.z,n.x,n.y+1.3,n.z))return true}return false}
const AI={
  mk(a){return {path:null,pi:0,goal:null,repath:0,stuckT:0,lx:0,lz:0,think:Math.random()*.2,target:null,tgtT:0,seen:null,react:0,aimX:0,aimY:0,strafe:0,strafeT:0,nadeCD:rr(4,9),
    camp:null,spot:null,buyT:0,crouchT:0,jumpT:0,lastHp:0,hurtAcc:0,skillT:rr(1,3),bombT:rr(6,14),detour:0,wander:null,fireHold:0,flashOn:Math.random()<.85,growlT:rr(2,8),avoidT:0,roam:Math.random()<.75,roamT:0,scanY:null,seenT:-99}},
  onRound(a){const B=a.bot;B.path=null;B.target=null;B.seen=null;B.buyT=rr(.4,3);B.stuckT=0;B.goal=null;B.roamT=rr(.5,2.5);B.scanY=null;this.pickCamp(a);a.flash=false},
  onTeam(a){const B=a.bot;B.spot=B.spotC=B.gT=null;B.path=null;B.partial=false;B.target=null;B.seen=null;B.goal=null;B.repath=0;B.stuckT=0;B.wasDirect=0;B.straight=false;B.unreach=0;B.lastHp=a.hp;B.skillT=rr(1,3);B.zp=null;B.pp=null;a.cmd.fire=a.cmd.alt=false},
  // per-round state of a human bot (relocation clock, aim settle, panic, bearings), set up on its first update of the round
  hInit(a){const B=a.bot;B.hR=G.round;B.relocT=B.roam?rr(14,30):rr(30,50);B.panicT=0;B.panicZ=null;B.aimT0=G.t;B.aimRT=0;B.aimOX=B.aimOY=0;B.hsT=0;B.hs=false;B.lof=true;B.kd=99;B.kSide=Math.random()<.5?1:-1;B.spotT=0;if(B.brg==null)B.brg=Math.random()*TAU;if(B.scanOff==null)B.scanOff=rr(-1,1)},
  onHurt(a,src){const B=a.bot;if(src&&a.team===TZ&&src.alive&&(!B.target||Math.random()<.25)){B.target=src;B.repath=0}},
  // a camp to hold. Outside the scenario each camp takes a few bots at most (fewer the more are there already) and none with a zombie
  // on it; every camp full → open ground instead. Each bot gets a point of its own and looks its own way.
  pickCamp(a){const B=a.bot;const C=MAP.camps;if(!C||!C.length){this.pickRoam(a);return}const spread=G.mode!=='scen';
    const occ=new Map(),used={};let nh=1;for(const o of G.actors){if(o===a||!o.alive||o.team!==TH)continue;nh++;const ob=o.bot;if(!ob||!ob.camp)continue;occ.set(ob.camp,(occ.get(ob.camp)||0)+1);if(ob.campI!=null)used[C.indexOf(ob.camp)+':'+ob.campI]=1}
    const cw=c=>c.w||CAMP_W[c.k]||.1,capN=Math.max(2,Math.ceil(nh/5)),Zs=G.st==='fight'?G.actors.filter(z=>z.alive&&z.team===TZ):[];
    const wOf=c=>{if(!spread)return cw(c);const k=occ.get(c)||0;if(k>=Math.min(capN,c.p.length+1))return 0;for(const z of Zs)for(const p of c.p)if(Math.abs(z.c.y-p[1])<3&&Math.hypot(z.c.x-p[0],z.c.z-p[2])<10)return 0;return cw(c)/(1+1.5*k)};
    const ws=C.map(wOf);let tot=0;for(const w of ws)tot+=w;
    if(tot<=0){if(spread&&this.pickRoam(a))return;for(let i=0;i<C.length;i++)ws[i]=cw(C[i]);tot=0;for(const w of ws)tot+=w}
    let r=Math.random()*tot,ci=0;for(let i=0;i<C.length;i++){r-=ws[i];if(r<=0){ci=i;break}}const camp=C[ci];
    const free=[];for(let i=0;i<camp.p.length;i++)if(!used[ci+':'+i])free.push(i);const pi=free.length?rpick(free):(Math.random()*camp.p.length)|0,base=camp.p[pi];B.camp=camp;B.campI=pi;B.scanOff=rr(-1,1);
    const rad=free.length?.7:1.6;const n=navSnap(base[0]+rr(-rad,rad),base[1],base[2]+rr(-rad,rad),3)||navSnap(base[0],base[1],base[2],4);
    B.spot=n?[n.x+rr(-.25,.25),n.y,n.z+rr(-.25,.25)]:[base[0],base[1],base[2]];B.scanY=null;B.path=null;B.repath=0},
  // a fresh place to walk to: open ground away from the zombies, not too far up or down. Outside the scenario: 8–22 m away (5–18 while
  // buying), next to one or two teammates (or the spots they are heading for) but not into a crowd, and roughly along a bearing of the
  // bot's own (so a group breaking up does not all run into the same pocket)
  pickRoam(a){const B=a.bot,c=a.c,N=NAV.nodes;if(!N.length)return false;const Zs=G.st==='fight'?G.actors.filter(z=>z.alive&&z.team===TZ):[];const spread=G.mode!=='scen',prep=G.st==='prep';
    const r0=spread?(prep?5:8):5,r1=spread?(prep?18:22):(prep?18:28),Hs=spread?G.actors.filter(h=>h!==a&&h.alive&&h.team===TH):null;if(spread)B.brg=(B.brg||0)+rr(-.9,.9);let best=null,bs=-1e9;
    for(let i=0;i<32;i++){const n=spread?navAround(c.x,c.z,r0,r1):N[(Math.random()*N.length)|0];if(!n||n.e.length<12)continue;const d=Math.hypot(n.x-c.x,n.z-c.z);if(d<r0||d>r1)continue;
      let zd=40;for(const z of Zs)zd=Math.min(zd,Math.hypot(z.c.x-n.x,z.c.z-n.z)+Math.abs(z.c.y-n.y)*2);
      let sc=Math.random()*(spread?6:10)+Math.min(zd,25)*.6-Math.abs(n.y-c.y)*.4;
      if(spread){let k=0;for(const h of Hs){const sp=h.bot&&h.bot.spot;if(Math.abs(h.c.y-n.y)<2.5&&Math.hypot(h.c.x-n.x,h.c.z-n.z)<6)k++;else if(sp&&Math.abs(sp[1]-n.y)<2.5&&Math.hypot(sp[0]-n.x,sp[2]-n.z)<5)k++}
        sc+=Math.cos(Math.atan2(n.x-c.x,n.z-c.z)-B.brg)*3+(k===0?-1.5:k<=2?1.5:-4*(k-2))}
      if(sc>bs){bs=sc;best=n}}
    if(!best)return false;B.spot=[best.x+rr(-.25,.25),best.y,best.z+rr(-.25,.25)];B.camp=null;B.path=null;B.repath=0;B.scanY=null;return true},
  // buying is free: every bot has a loadout it likes (rolled from the weights below, the dearer guns a little likelier, rolled again now and
  // then) and at the start of a round fills in what it lacks — an empty slot, the default pistol or knife, a missing grenade, armour
  rollLd(){const prim=[['hmg',.24],['mg6',.16],['gx6',.12],['ar7',.24],['kv47',.2],['g35',.12],['br3',.1],['ar5c',.12],['hr17',.1],['as12',.18],['m14',.12],['blaze8',.05],['winchester',.05],['sg8',.13],['db2',.06],['k5',.06],['k9',.05],['um45',.05],['pd50',.07],['r700',.04],['sr8',.03],['dm14',.05],['gl40',.04],['airb',.05],['volc',.05],['xbow',.04],['xbowa',.03],['bdc',.05],['rdc',.03],['mdrill',.04],['mlaunch',.03],['xdz',.03],['gaebolg',.03],['sterling',.05],['salamander',.03]];
    const ok=prim.filter(p=>WPN[p[0]]),w=p=>p[1]*(1+(WPN[p[0]].cost||0)/3000);let t=0;for(const p of ok)t+=w(p);let r=Math.random()*t,p1=ok.length?ok[ok.length-1][0]:null;for(const p of ok){r-=w(p);if(r<=0){p1=p[0];break}}
    const pis=['d50','f7','tw9','r6','duckfoot'].filter(id=>WPN[id]);
    return {1:p1,2:pis.length&&Math.random()<.25?rpick(pis):'p9',3:Math.random()<.14?rpick(['hammer','axe','axe',WPN.skull9?'skull9':'hammer',WPN.killknife?'killknife':'axe']):'knife',
      he:Math.random()<.65?1:0,frost:Math.random()<.4?1:0,flare:Math.random()<.15?1:0,armor:Math.random()<.85?1:0}},
  buy(a){const B=a.bot;let re=false;if(!B.ld||Math.random()<.12){re=!!B.ld;B.ld=this.rollLd()}const L=B.ld;
    if(L[1]&&a.inv[1]!==L[1]&&(!a.inv[1]||re))buy(a,L[1]);
    if(L[2]&&a.inv[2]!==L[2]&&(!a.inv[2]||a.inv[2]==='p9'||re))buy(a,L[2]);
    if(L[3]&&a.inv[3]!==L[3]&&(!a.inv[3]||a.inv[3]==='knife'||re))buy(a,L[3]);
    for(const k of ['he','frost','flare'])if(L[k]&&!(a.inv[k]>0))buy(a,k);
    if(L.armor&&a.armor<100)buy(a,'armor');
    equip(a,bestWeapon(a))},
  // ---------- per-frame ----------
  update(a,dt){const B=a.bot,cmd=a.cmd;cmd.fire=cmd.alt=cmd.jump=cmd.reload=cmd.skill=false;cmd.f=cmd.s=0;cmd.walk=false;
    B.think-=dt;if(a.team===TH)this.human(a,dt);else this.zombie(a,dt);
    // stuck detection while trying to move
    if(cmd.f||cmd.s){const mv=Math.hypot(a.c.x-B.lx,a.c.z-B.lz);if(mv<dt*.8)B.stuckT+=dt;else B.stuckT=Math.max(0,B.stuckT-dt*2)}else B.stuckT=0;
    B.lx=a.c.x;B.lz=a.c.z;
    if(B.stuckT>.6&&a.c.onGround&&B.jumpT<=0){cmd.jump=true;B.jumpT=.8}if(B.stuckT>1.6){B.path=null;B.repath=0;B.detour=1.2;B.stuckT=0}
    B.jumpT-=dt;if(B.detour>0){B.detour-=dt;cmd.s=Math.sin(G.t*2+a.id)>0?1:-1}
    // big zombies (heavy, giant) squeeze through: when wedged they crouch and narrow to a normal hull for a moment
    // (the nav graph is built for a normal body; game.js widens the hull again as soon as it fits)
    if(a.team===TZ&&B.stuckT>.45){const Z=ZCLASS[a.zc];if(Z&&(Z.hw>.31||Z.h>1.85))B.squeeze=1.6}
    if(B.squeeze>0){B.squeeze-=dt;cmd.duck=true;if(a.c.hw>.3)a.c.hw=.3;B.sqz=1}else if(B.sqz){B.sqz=0;cmd.duck=false}},
  // follow the current path; returns true while moving
  follow(a,dt,run){const B=a.bot,cmd=a.cmd;if(!B.path||B.pi>=B.path.length)return false;const c=a.c;
    let n=NAV.nodes[B.path[B.pi]];if(!n){B.path=null;return false}
    if(Math.hypot(n.x-c.x,n.z-c.z)<.5&&Math.abs(n.y-c.y)<.8){B.pi++;if(B.pi>=B.path.length)return false;n=NAV.nodes[B.path[B.pi]]}
    // look ahead along same-level nodes when the straight line is clear
    if(B.think<=0){for(let k=Math.min(B.path.length-1,B.pi+5);k>B.pi;k--){const m=NAV.nodes[B.path[k]];if(Math.abs(m.y-c.y)>.35)continue;let flat=true;for(let q=B.pi;q<=k;q++)if(Math.abs(NAV.nodes[B.path[q]].y-c.y)>.35){flat=false;break}
        if(flat&&navStraight(c.x,c.y,c.z,m.x,m.z,c.hw*.9)){B.pi=k;n=m;break}}}
    const prev=B.pi>0?NAV.nodes[B.path[B.pi-1]]:navNode(c.x,c.y,c.z);const dy=n.y-c.y;
    const dx=n.x-c.x,dz=n.z-c.z,d=Math.hypot(dx,dz)||1;this.moveDir(a,dx/d,dz/d,run);
    if(dy>.55&&c.onGround&&d<(dy>1.05?2.05:1.55)&&B.jumpT<=0){cmd.jump=true;B.jumpT=.5;B.tuckT=dy>.85?.75:0}
    if(B.tuckT>0){B.tuckT-=dt;if(!c.onGround)cmd.duck=true}
    return true},
  moveDir(a,dx,dz,run){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);a.cmd.f=dx*fx+dz*fz;a.cmd.s=dx*rx+dz*rz},
  turnTo(a,yaw,pitch,dt,rate){const d=wrapA(yaw-a.yaw);const m=rate*dt;a.yaw=wrapA(a.yaw+clamp(d,-m,m));a.pitch+=clamp(pitch-a.pitch,-m*.7,m*.7)},
  goTo(a,x,y,z,maxJ,partial,pen){const B=a.bot;const s=navNode(a.c.x,a.c.y,a.c.z),t=navNode(x,y,z);B.path=navPath(s,t,maxJ,0,a.team===TH?4.3:0,partial,pen);
    B.partial=!!(B.path&&B.path.partial);B.pi=0;B.goal=[x,y,z];B.gT=null;return !!B.path},
  // ---------- human bots ----------
  human(a,dt){const B=a.bot,cmd=a.cmd,c=a.c,D=DIFF[G.diff];cmd.duck=false;if(B.hR!==G.round)this.hInit(a);
    const fight=G.st==='fight',spread=G.mode!=='scen';
    if(G.st==='prep'||fight){if(B.buyT>0){B.buyT-=dt;if(B.buyT<=0)this.buy(a)}}
    if(fight&&(B.flashOn||BO.on))a.flash=true;
    // perception at ~8 Hz: the closest zombie in view (within HBOT.sight; one that just turned next to it comes first, one on top of a
    // teammate and the one it is already on count as closer), whether the line to the aim point is clear, and the zombies close enough
    // to back away from
    if(B.think<=0){B.think=.12+Math.random()*.05;const e=actorEye(a);let best=null,bd=1e9;
      for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0)continue;const d=dist3(z.c,c);if(d>(spread?HBOT.sight:48))continue;if(z.zc==='runner'&&z.skillT>0&&d>3.5)continue;const pz=B.panicT>0&&B.panicZ===z;
        const ang=Math.abs(wrapA(Math.atan2(-(z.c.x-c.x),-(z.c.z-c.z))-a.yaw));if(ang>1.5&&d>6&&!(B.seen&&B.seen.a===z)&&!pz)continue;
        if(!losClear(e.x,e.y,e.z,z.c.x,z.c.y+(z.zc==='boss'?2.8:1.2),z.c.z))continue;const sc=d*(ang>1.5?1.5:1)*(pz?.3:1)*(B.seen&&B.seen.a===z?.75:1)*(spread&&d>4&&hNear(z.c.x,z.c.y,z.c.z,3.5,a)?.6:1);if(sc<bd){bd=sc;best=z}}
      if(best){if(!B.seen||B.seen.a!==best){B.seen={a:best,t:G.t};B.react=D.react*(.7+Math.random()*.6)*(dist3(best.c,c)<4?.35:1);B.aimT0=G.t;B.hsT=0}B.seen.ls=G.t}
      else if(B.seen&&(!B.seen.a.alive||G.t-(B.seen.ls||B.seen.t)>.5))B.seen=null;
      const tg=B.seen&&B.seen.a.alive?B.seen.a:null;B.lof=!tg||losClear(e.x,e.y,e.z,tg.c.x,B.hs?tg.head.y:tg.c.y+(tg.zc==='boss'?2.6:tg.c.h*.55),tg.c.z);
      if(fight)this.kiteScan(a,WPN[a.cur]&&WPN[a.cur].flame?4:spread?HBOT.kite:5.5,e);else B.kd=99;
      // trying to walk somewhere for 6 s without getting 1.5 m anywhere (wedged on a ledge, a coffin, a teammate): somewhere else then
      if(spread){const m=B.mv||(B.mv={x:c.x,z:c.z,t:G.t});if(Math.hypot(c.x-m.x,c.z-m.z)>1.5||!(G.t-(B.wantT||-9)<1)){m.x=c.x;m.z=c.z;m.t=G.t}else if(G.t-m.t>6){m.t=G.t;if(!this.pickRoam(a))this.pickCamp(a)}}}
    const tgt=B.seen&&B.seen.a.alive?B.seen.a:null;if(tgt)B.seenT=G.t;
    // where to stand
    let moving=false;const close=B.kd<5.5;
    const last=fight&&humansAlive()===1;
    // roamers (most bots) do not settle: after a short hold they walk on to another camp or a patch of open ground away from the zombies
    const roamer=B.roam&&!last&&spread&&(G.st==='prep'||fight);
    if(B.panicT>0)B.panicT-=dt;
    if(fight&&B.kd<99&&this.kite(a)){moving=true;B.crouchT=0}// zombies close by: back off with the gun on them
    if(spread&&fight&&!last){// a spot with a zombie near it is given up, and nobody stays anywhere for long
      B.spotT-=dt;if(B.spot&&B.spotT<=0){B.spotT=.5;if(zNearPt(B.spot[0],B.spot[1],B.spot[2],8)){B.spotT=2;if(!this.pickRoam(a))this.pickCamp(a)}}
      B.relocT-=dt;if(B.relocT<=0&&!(B.kd<12)){B.relocT=B.roam?rr(20,35):rr(35,55);if(Math.random()<.35||!this.pickRoam(a))this.pickCamp(a)}}
    if(!moving){const goal=last?this.fleeSpot(a):B.spot;
      if(goal){const gd=Math.hypot(goal[0]-c.x,goal[2]-c.z),gy=Math.abs(goal[1]-c.y);
        // a roamer with a zombie in its sights (well away, and not in a crowd) stops walking and shoots; it walks on once things are quiet
        const plant=roamer&&tgt&&fight&&B.panicT<=0&&dist3(tgt.c,c)>12&&hNear(c.x,c.y,c.z,4,a)<=2;
        if((gd>1.1||gy>.8)&&!plant){B.repath-=dt;if((!B.path||B.pi>=B.path.length||B.repath<-2)&&B.repath<=0){B.repath=last?1.2:2.5;if(!this.goTo(a,goal[0],goal[1],goal[2],1.45)){B.repath=1.5;if(!last&&!(roamer&&this.pickRoam(a)))this.pickCamp(a)}}
          moving=this.follow(a,dt,true);B.wantT=G.t}
        else{if(!plant)B.path=null;// hold: small strafes, crouch while shooting, make room for a teammate on the same spot
          B.strafeT-=dt;if(B.strafeT<=0){B.strafeT=rr(.6,2.2);B.strafe=Math.random()<.5?0:rpick([-1,1])}if(B.strafe&&tgt)cmd.s=B.strafe*.6;
          if(spread){const m=this.hSep(a);if(m)this.moveDir(a,m[0]*.6,m[1]*.6)}
          if(tgt&&B.crouchT<=0&&Math.random()<dt*.3)B.crouchT=rr(1,3);
          if(roamer&&!plant){B.roamT-=dt;if(B.roamT<=0&&!tgt&&G.t-B.seenT>2.5){const toCamp=fight&&Math.random()<.3;if(toCamp||!this.pickRoam(a))this.pickCamp(a);B.roamT=G.st==='prep'?rr(1.5,4):rr(5,15)}}}}}
    if(B.crouchT>0){B.crouchT-=dt;cmd.duck=true}
    // aim & shoot
    const W=WPN[a.cur];
    if(tgt){const e=actorEye(a);B.hsT-=dt;if(B.hsT<=0){B.hsT=.6;B.hs=Math.random()<D.hsP}const hs=B.hs,tdist=dist3(tgt.c,c);
      // empty magazine with a zombie close: switch to the sidearm instead of reloading (outside the scenario only when it is right there —
      // a pistol does not stop a zombie, a reload while backing off often does); reload early when there is time (outside the scenario:
      // under half a magazine with the target well off and nothing coming on, so the gun is not empty when one arrives)
      {const am=a.ammo[a.cur];const prim=a.cur===a.inv[1];const side=a.inv[2]&&a.ammo[a.inv[2]];
        if(am&&W&&W.mag&&prim&&am.mag===0&&tdist<(spread?5:10)&&side&&side.mag>0&&a.drawT<=0&&!(spread&&a.reloadT>0&&a.reloadT<.8))equip(a,a.inv[2]);// (not with the reload nearly done)
        else if(spread&&a.cur===a.inv[2]&&a.inv[1]&&!(B.kd<99)&&tdist>12&&a.drawT<=0&&a.ammo[a.inv[1]]&&a.ammo[a.inv[1]].mag+a.ammo[a.inv[1]].res>0)equip(a,a.inv[1]);// breathing room: back to the main gun
        else if(am&&W&&W.mag&&am.res>0&&!close&&a.reloadT<=0&&(am.mag<=Math.max(1,W.mag*.25)&&tdist>13||spread&&!(B.kd<99)&&am.mag<W.mag*.5&&tdist>14))cmd.reload=true;
        if(a.reloadT>0&&a.relKind==='shell'&&am&&am.mag>0&&tdist<7){a.reloadT=0;a.relKind=null}}const tx=tgt.c.x,tz=tgt.c.z,ty=hs?tgt.head.y:tgt.c.y+(tgt.zc==='boss'?2.6:tgt.c.h*.55);
      // aim error: wide on a fresh target, settling over ~0.6 s to an error that grows with the distance (re-drawn a few times a second);
      // the scenario's allies keep their old steady aim
      if(spread){const A=HBOT.aim,sk=clamp((G.t-B.aimT0)/.6,0,1),sig=D.err*lerp(A[0],A[1]+tdist/A[2],sk);B.aimRT-=dt;if(B.aimRT<=0){B.aimRT=rr(.12,.28);B.aimOX=gRand()*sig;B.aimOY=gRand()*sig*.6}
        const ka=Math.min(1,dt*8);B.aimX=lerp(B.aimX,B.aimOX,ka);B.aimY=lerp(B.aimY,B.aimOY,ka)}
      else{B.aimX=lerp(B.aimX,rr(-1,1)*D.err,dt*3);B.aimY=lerp(B.aimY,rr(-1,1)*D.err,dt*3)}
      const yaw=Math.atan2(-(tx-e.x),-(tz-e.z))+B.aimX,dist=Math.hypot(tx-e.x,tz-e.z),pitch=Math.atan2(ty-e.y,dist)+B.aimY;
      this.turnTo(a,yaw,pitch,dt,D.turn*(dist<4?1.8:1));B.react-=dt;
      const err=Math.abs(wrapA(yaw-a.yaw))+Math.abs(pitch-a.pitch);
      const far=spread&&tdist>25&&W&&W.mag&&a.ammo[a.cur]&&a.ammo[a.cur].mag<W.mag*.5;// a far zombie is not worth the last half of the magazine
      if(B.react<=0&&B.lof&&!far&&err<D.tol+(W&&W.pellets?.1:0)){
        if(W&&W.kind==='nade'){}else if(W&&W.kind==='melee'){const bw=bestWeapon(a);const ba=a.ammo[bw];if(bw!==a.cur&&ba&&(ba.mag+ba.res)>0)equip(a,bw);else if(tdist<2.3)cmd.fire=Math.random()<.7,cmd.alt=!cmd.fire}
        else{const am=a.ammo[a.cur];if(am&&am.mag===0&&am.res===0){const o=a.cur===a.inv[1]?a.inv[2]:null;if(o&&a.ammo[o]&&(a.ammo[o].mag+a.ammo[o].res)>0)equip(a,o);else equip(a,a.inv[3]||'knife')}
          else if(W&&W.flame&&tdist-tgt.c.hw>W.flame.r-.3){}// a flamethrower holds its fire until the zombie is in reach
          else{const semi=W&&(W.semi||W.burst);cmd.fire=semi?(B.fireHold=!B.fireHold):true;if(W&&W.zoom&&a.zoom===0&&dist>(W.kind==='sniper'?8:15)&&!cmd.alt)cmd.alt=true}}}
      if(W&&W.spin)cmd.alt=true;// keep the barrels turning while a target is in view
      if(a.zoom>0&&tdist<6)a.zoom=0;
      // grenades at groups / close zombies
      B.nadeCD-=dt;if(B.nadeCD<=0&&G.st==='fight'&&!close){const zs=G.actors.filter(z=>z.alive&&z.team===TZ&&dist3(z.c,tgt.c)<4).length;
        const kind=a.inv.he&&zs>=2&&dist>7&&dist<16?'he':a.inv.frost&&dist<11&&dist>6?'frost':null;if(kind){equip(a,kind);B.nadeCD=rr(6,12)}else B.nadeCD=rr(1,2)}
      if(W&&W.kind==='nade'&&a.drawT<=0){a.pitch=Math.min(.5,pitch+.08+dist*.012);cmd.fire=true}}
    else{// idle: scan, reload, face the camp's look point
      if(G.st==='fight'&&W&&W.kind==='nade'&&a.throwT<=0)equip(a,bestWeapon(a));
      if(a.inv[1]&&a.cur===a.inv[2]&&G.st==='fight'){const pa=a.ammo[a.inv[1]];if(pa&&pa.mag+pa.res>0)equip(a,a.inv[1])}
      const am=a.ammo[a.cur];if(am&&W&&am.mag<W.mag*.7&&am.res>0)cmd.reload=true;
      if(!moving&&B.camp){const lk=B.camp.look;const scan=Math.sin(G.t*.5+a.id*1.3)*.9+(spread?B.scanOff||0:0);const yaw=Math.atan2(-(lk[0]-c.x),-(lk[2]-c.z))+scan;this.turnTo(a,yaw,-.05,dt,2.5)}// each bot at a camp covers its own side of it
      else if(!moving){if(B.scanY==null)B.scanY=a.yaw;this.turnTo(a,B.scanY+Math.sin(G.t*.45+a.id*1.7)*1.6,-.04,dt,2.2)}// open ground: sweep around the way it came
      else if(moving){const v=Math.hypot(c.vx,c.vz);if(v>.5)this.turnTo(a,Math.atan2(-c.vx,-c.vz),0,dt,6)}
      if(G.st==='fight'&&a.inv.flare&&!B.flared&&Math.random()<dt*.02){equip(a,'flare');B.flared=1}
      if(W&&W.kind==='nade'&&a.cur==='flare'&&a.drawT<=0){a.pitch=.35;cmd.fire=true}}
    if(G.st==='prep'&&a.cur==='knife'&&!moving)equip(a,bestWeapon(a))},
  fleeSpot(a){const B=a.bot;if(B.flee&&G.t-B.fleeT<4)return B.flee;const Z=G.actors.filter(z=>z.alive&&z.team===TZ);let best=null,bd=-1;
    for(let i=0;i<14;i++){const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];let md=1e9;for(const z of Z)md=Math.min(md,Math.hypot(z.c.x-n.x,z.c.z-n.z)+Math.abs(z.c.y-n.y)*2);const self=Math.hypot(n.x-a.c.x,n.z-a.c.z);const sc=md-self*.3;if(sc>bd){bd=sc;best=[n.x,n.y,n.z]}}
    B.flee=best;B.fleeT=G.t;return best},
  // someone just turned right next to them: every bot within 10 m shoots the new zombie and scatters (12 m or more), each on a bearing of its own
  onInfect(t){if(G.mode==='scen'||!t)return;const L=[];for(const h of G.actors)if(h.bot&&!h.pup&&h.alive&&h.team===TH&&dist3(h.c,t.c)<10)L.push(h);
    L.sort((p,q)=>dist3(p.c,t.c)-dist3(q.c,t.c));const off=[0,.9,-.9,1.7,-1.7,2.5,-2.5];
    L.forEach((h,i)=>{const B=h.bot;if(B.hR!==G.round)this.hInit(h);B.panicT=3;B.panicZ=t;B.seen={a:t,t:G.t,ls:G.t};B.react=Math.min(B.react||0,DIFF[G.diff].react*.5);B.aimT0=G.t;
      this.pickScatter(h,t,Math.atan2(h.c.x-t.c.x,h.c.z-t.c.z)+off[i%off.length])})},
  pickScatter(a,z,brg){const B=a.bot,c=a.c;const Zs=G.actors.filter(o=>o.alive&&o.team===TZ);let best=null,bs=-1e9;
    for(let i=0;i<30;i++){const n=navAround(c.x,c.z,12,24);if(!n||n.e.length<10||Math.abs(n.y-c.y)>3)continue;
      let zd=40;for(const o of Zs)zd=Math.min(zd,Math.hypot(o.c.x-n.x,o.c.z-n.z)+Math.abs(o.c.y-n.y)*2);if(zd<10)continue;
      const sc=Math.cos(Math.atan2(n.x-c.x,n.z-c.z)-brg)*8+Math.min(zd,25)*.4-hNear(n.x,n.y,n.z,5,a)*4+Math.random()*3;if(sc>bs){bs=sc;best=n}}
    if(!best)return false;B.spot=[best.x,best.y,best.z];B.camp=null;B.campI=null;B.path=null;B.repath=0;B.scanY=null;B.relocT=Math.max(B.relocT,rr(12,20));return true},
  // zombies to back away from (at the perception rate): within r on about this level, in sight or right there, and either close
  // (5.5 m) or coming on — one the guns are holding back is shot at from where the bot stands (moving spoils the aim). The way out is
  // the sum of the away directions (nearer ones count more) plus a little room from teammates, so a group backing off fans out.
  kiteScan(a,r,e){const B=a.bot,c=a.c;let ax=0,az=0,dm=99;
    for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0)continue;const dy=z.c.y-c.y;if(dy<-2.4||dy>2.4)continue;const dx=c.x-z.c.x,dz=c.z-z.c.z;if(Math.abs(dx)>r||Math.abs(dz)>r)continue;const d=Math.hypot(dx,dz);if(d>r)continue;
      if(d>5.5&&(z.c.vx*dx+z.c.vz*dz)/(d||1)<1)continue;if(d>3&&!losClear(e.x,e.y,e.z,z.c.x,z.c.y+1.2,z.c.z))continue;const w=1/Math.max(1,d*d);ax+=dx/(d||1)*w;az+=dz/(d||1)*w;dm=Math.min(dm,d)}
    let l=Math.hypot(ax,az);if(dm>=99||l<1e-9){B.kd=99;return}ax/=l;az/=l;
    for(const h of G.actors){if(h===a||!h.alive||h.team!==TH)continue;const dx=c.x-h.c.x,dz=c.z-h.c.z;if(Math.abs(dx)>2.5||Math.abs(dz)>2.5||Math.abs(h.c.y-c.y)>1.5)continue;const d=Math.hypot(dx,dz);if(d>2.5||d<.01)continue;ax+=dx/d*(1-d/2.5)*.5;az+=dz/d*(1-d/2.5)*.5}
    l=Math.hypot(ax,az)||1;B.kx=ax/l;B.kz=az/l;B.kd=dm},
  // back off along that way; blocked (wall, railing, drop) → 45° then 90° to the side it last got out by. Nowhere to go → false.
  kite(a){const B=a.bot,c=a.c,sd=B.kSide||1;
    for(const an of [0,.79*sd,-.79*sd,1.57*sd,-1.57*sd]){const co=Math.cos(an),si=Math.sin(an),bx=B.kx*co-B.kz*si,bz=B.kx*si+B.kz*co;
      if(charFits(c,c.x+bx*.6,c.y+.3,c.z+bz*.6)&&floorBelow(c.x+bx*.9,c.y+.4,c.z+bz*.9,.2)>c.y-.4){this.moveDir(a,bx,bz);if(an)B.kSide=an>0?1:-1;return true}}
    B.kSide=-sd;return false},
  // a teammate standing on top of it: the way to step aside, or null
  hSep(a){const c=a.c;let bx=0,bz=0,n=0;for(const h of G.actors){if(h===a||!h.alive||h.team!==TH)continue;const dx=c.x-h.c.x,dz=c.z-h.c.z;if(Math.abs(dx)>.9||Math.abs(dz)>.9||Math.abs(h.c.y-c.y)>1.2)continue;const d=Math.hypot(dx,dz);if(d>.9)continue;
      if(d>.01){bx+=dx/d;bz+=dz/d}else{bx+=Math.cos(a.id);bz+=Math.sin(a.id)}n++}
    if(!n)return null;const l=Math.hypot(bx,bz)||1;bx/=l;bz/=l;if(!charFits(c,c.x+bx*.5,c.y+.3,c.z+bz*.5)||floorBelow(c.x+bx*.7,c.y+.4,c.z+bz*.7,.2)<c.y-.4)return null;return [bx,bz]},
  // ---------- zombie bots ----------
  zombie(a,dt){const B=a.bot,cmd=a.cmd,c=a.c,Z=ZCLASS[a.zc];cmd.duck=false;if(G.st!=='fight'&&G.mode!=='scen')return;// nothing to do on the result card or in the countdown
    if(a.cur!=='claw'&&a.cur!=='zbomb')equip(a,'claw');
    B.growlT-=dt;if(B.growlT<=0){B.growlT=rr(3,9);AU.at('zgrowl',c.x,c.y+1.5,c.z,{vol:.7,range:30})}
    const cap=jumpCap(a),bud=Math.max(2500,NAV.nodes.length*.7|0);
    // the pack (infection modes; bots only run on the host): approach, wait out of sight, rush together, fall back to heal — see zPack
    const pack=G.mode!=='scen'&&G.st==='fight',zt=G.t-(this.zpT==null?-9:this.zpT);if(pack&&(zt>=.5||zt<0)){this.zpT=G.t;this.zPack()}// (the clock restarts with every match)
    let zp=pack?B.zp:null,st=zp?zp.st:'rush';
    if(st==='stage'&&!(B.target&&B.target.alive&&B.target.team===TH)){zp=B.zp={st:'approach',t:G.t};st='approach';B.path=null;B.repath=0}
    const pen=st==='approach';// approach paths keep off gun lines and the routes of the rest of the pack
    // pick a target every so often: the nearest humans by path (three tried, six when none of those can be reached);
    // nobody reachable → the nearest one, approached as close as the ground allows (partial path), and checked again less often.
    // In the pack a human other zombies already go for, or one standing in a group, counts as farther (stragglers first, the pack
    // spreads out); a zombie waiting in position keeps its target, one falling back looks for none.
    B.tgtT-=dt;if(st!=='retreat'&&st!=='stage'&&(B.tgtT<=0||!B.target||!B.target.alive||B.target.team!==TH)){B.tgtT=rr(.8,1.4);const H=G.actors.filter(h=>h.alive&&h.team===TH);
      const K=new Map();for(const h of H){const d=dist3(h.c,c);let x=0;if(pack&&d>7){for(const o of G.actors)if(o!==a&&o.alive&&o.team===TZ&&o.bot&&o.bot.target===h)x+=ZPACK.share;x+=hNear(h.c.x,h.c.y,h.c.z,5,h)*ZPACK.strag}K.set(h,[d+Math.abs(h.c.y-c.y)*3+x,x])}
      H.sort((p,q)=>K.get(p)[0]-K.get(q)[0]);
      const s0=navNode(c.x,c.y,c.z);let best=null,bl=1e9;
      for(let i=0;i<H.length&&i<(B.unreach?3:6);i++){if(i>=3&&best)break;const h=H[i];const p=navPath(s0,navNode(h.c.x,h.c.y,h.c.z),cap,bud);if(!p)continue;
        const l=p.length+K.get(h)[1]+(h===B.target?-3:0);if(l<bl){bl=l;best=h;B.path=pen?null:p;B.partial=false;B.pi=0;B.goal=[h.c.x,h.c.y,h.c.z];B.repath=pen?0:rr(.7,1.1)}}
      if(best){B.target=best;B.unreach=0}else if(H.length){if(B.target!==H[0]||!B.unreach){B.path=null;B.repath=0}B.target=H[0];B.unreach=1;B.tgtT=rr(2.2,3.4)}}
    const t=B.target;if(!t){this.wander(a,dt);return}
    const e=actorEye(a);const dx=t.c.x-c.x,dz=t.c.z-c.z,dh=Math.hypot(dx,dz),dy=t.c.y-c.y;
    // ~7 Hz: line of sight, and whether the straight line to the target can actually be walked —
    // no wall, crate, railing, gap or ledge in between (seeing someone is not the same as being able to run at them)
    if(B.think<=0){B.think=.15;B.los=dh<22&&losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.3,t.c.z);
      B.straight=B.los&&Math.abs(dy)<.6&&dh<14&&navStraight(c.x,c.y,c.z,t.c.x,t.c.z,Math.min(.3,c.hw*.9))}
    const see=dh<22&&B.los;
    let moving=false;
    if(st==='stage'||st==='retreat')moving=this.zGo(a,dt,zp.node,cap);// to the staging point / hiding place, then still
    else if(see&&B.straight&&(st==='rush'||dh<9)){B.wasDirect=1;if(dh>.9){this.moveDir(a,dx/dh,dz/dh);moving=true}}// open ground: straight at them
    else{// otherwise the way round: the path (fresh when the straight run just ended)
      if(B.wasDirect){B.wasDirect=0;B.repath=0;B.path=null}
      B.repath-=dt;const gq=B.gT||B.goal,moved=gq?Math.hypot(gq[0]-t.c.x,gq[2]-t.c.z)+Math.abs(gq[1]-t.c.y):99;
      if((!B.path||moved>2||B.pi>=B.path.length)&&B.repath<=0){B.repath=rr(.7,1.2);
        // out of reach and well above: head for the spot under the edge of their ledge with open sky above (to climb on each other there)
        const tn=navNode(t.c.x,t.c.y,t.c.z),perch=!tn||tn.y<t.c.y-.6;// perch: standing somewhere the grid has no node for (a wall top, a railing)
        const sp=(B.partial||B.unreach||B.spot||perch)&&t.c.y-c.y>cap+.3?this.stackSpot(a,t,cap):null;B.spot=sp;
        const go=(x,y,z)=>pen?this.zPathPen(a,P=>this.goTo(a,x,y,z,cap,true,P)):this.goTo(a,x,y,z,cap,true);
        if(!(sp?go(sp.x,sp.y,sp.z):go(t.c.x,t.c.y,t.c.z))){B.path=null;B.offGrid=1;B.repath=rr(1.5,2.5);B.tgtT=Math.min(B.tgtT,.3)}
        else{B.offGrid=0;B.gT=[t.c.x,t.c.y,t.c.z];if(B.partial||sp)B.repath=rr(1.8,2.8)}}
      moving=this.follow(a,dt,true);
      // off the walkable grid altogether (knocked somewhere odd): head straight for the target as before
      if(!moving){if(B.offGrid&&dh>1){this.moveDir(a,dx/dh,dz/dh);moving=true}else moving=this.prowl(a,dt,t,dx,dz,dh,dy,see,cap)}}
    // facing: toward the next waypoint while running, toward the target when close (or while waiting in position)
    const lookAtT=see&&dh<9||st==='stage'&&!moving;let yaw;if(lookAtT)yaw=Math.atan2(-dx,-dz);else{if(B.path&&B.pi<B.path.length){const n=NAV.nodes[B.path[B.pi]];yaw=Math.atan2(-(n.x-c.x),-(n.z-c.z))}else yaw=a.yaw}
    const pitch=see&&dh<9?Math.atan2(t.c.y+1.2-e.y,Math.max(.5,dh)):0;
    // keep the move direction while turning (the move command is in body space)
    const wx=-Math.sin(a.yaw)*cmd.f+Math.cos(a.yaw)*cmd.s,wz=-Math.cos(a.yaw)*cmd.f-Math.sin(a.yaw)*cmd.s;
    this.turnTo(a,yaw,pitch,dt,9);if(moving)this.moveDir(a,wx,wz);
    // attack
    if(dh<1.35+t.c.hw&&Math.abs(dy)<1.7&&see){cmd.fire=Math.random()<.85;cmd.alt=!cmd.fire&&Math.random()<.4}
    // skills: the attacking ones only on the rush (right as it starts, even before the humans are in view), not while waiting or healing
    B.skillT-=dt;if(B.skillT<=0&&a.skillCD<=0){B.skillT=rr(.5,1.5);const go=st==='rush',rs=go&&!!zp&&G.t-zp.t<2.5;
      if(Z.skill==='frenzy'&&go&&(see||rs)&&dh<(rs?20:14)&&dh>3&&a.hp>a.maxHp*.35)cmd.skill=true;
      else if(Z.skill==='leap'&&go&&see&&dh>4.5&&dh<12&&dy<1&&dy>-3)cmd.skill=true;
      else if(Z.skill==='harden'&&(B.hurtAcc>a.maxHp*.12||(see&&dh<9)))cmd.skill=true;
      else if(Z.skill==='shriek'&&see&&dh<8)cmd.skill=true;
      else if(Z.skill==='invis'&&go&&(see||rs)&&dh>4&&dh<26)cmd.skill=true;else if(Z.skill==='trap'&&st!=='retreat'&&dh<12&&Math.random()<.35)cmd.skill=true;
      else if(Z.skill==='coffin'&&go&&see&&dh>4&&dh<22&&(B.hurtAcc>a.maxHp*.04||Math.random()<.02)){cmd.skill=true;B.detour=.9}// then step round the coffin it just stood up in its own way
      else if(Z.skill==='heal'&&(a.hp<a.maxHp*.6||G.actors.some(z=>z!==a&&z.alive&&z.team===TZ&&z.hp<z.maxHp*.5&&dist3(z.c,c)<8)))cmd.skill=true}
    B.hurtAcc=Math.max(0,B.hurtAcc*Math.exp(-dt/2)+(B.lastHp-a.hp>0?B.lastHp-a.hp:0));B.lastHp=a.hp;
    // spore bomb (one a life, on the rush): at groups, at someone up high or out of reach, when taking fire, or now and then on a clear view
    B.bombT-=dt;if(a.bombs>0&&B.bombT<=0&&st==='rush'&&see&&dh>(B.partial?2.5:5)&&dh<15){B.bombT=rr(6,12);const grp=G.actors.filter(h=>h.alive&&h.team===TH&&dist3(h.c,t.c)<4).length;
      if(grp>=2||dy>1.5||B.partial||B.hurtAcc>a.maxHp*.1||Math.random()<.4){equip(a,'zbomb');B.throwing=1}}
    if(a.cur==='zbomb'&&a.drawT<=0){a.pitch=clamp(Math.atan2(t.c.y+1-e.y,dh)+.1+dh*.012,-.4,.7);a.yaw=Math.atan2(-dx,-dz);cmd.fire=true}},
  // ---------- the zombie pack (infection modes; ~2 Hz on the host) ----------
  // approach → stage on a node 13–20 m from the target that no human can see, on a bearing at least 60° from the others staging on that group →
  // rush when enough of the pack is in place (min(3, those not yet rushing)), when a fight is already on there, after 7 s in position, when
  // a human comes within 9 m, when it gets shot, or in the last 35 s; skills and spore bombs go at the start of the rush. Badly hurt
  // (under 30 %, hosts 25 %) with more than 40 s left: fall back to a hidden node until 75 % or 12 s.
  zPack(){const Zs=[],H=[];for(const o of G.actors){if(!o.alive)continue;if(o.team===TH)H.push(o);else if(o.bot&&!o.pup&&!(o.reviving>0))Zs.push(o)}
    if(!Zs.length||!H.length)return;this.zPenalty(H,Zs);
    const P=ZPACK,late=G.time<P.late||H.length<=2;let waiting=0,staged=0;const fights=[];
    for(const z of Zs){const B=z.bot;if(!B.zp)B.zp={st:'approach',t:G.t};let zp=B.zp;const t=B.target,hp=z.hp/z.maxHp;let hd=99;for(const h of H)hd=Math.min(hd,dist3(h.c,z.c));
      if(zp.st!=='retreat'&&hp<P.low[z.host?1:0]&&G.time>P.late+5&&hd>4){const n=this.zHide(z,H);if(n){zp=B.zp={st:'retreat',t:G.t,node:n};B.path=null;B.repath=0}}
      if(zp.st==='retreat'){if(hp>=P.heal||G.t-zp.t>P.hide||hd<3.5||zp.bad){B.zp={st:'approach',t:G.t};B.path=null;B.repath=0;B.tgtT=0}continue}
      if(zp.st==='rush'){if(t&&t.alive&&t.team===TH&&dist3(t.c,z.c)<8)fights.push(t);if(!late&&G.t-zp.t>22&&hd>16){B.zp={st:'approach',t:G.t};B.path=null;B.repath=0}continue}
      waiting++;
      if(zp.st==='approach'){if(late||hd<P.near)this.zRush(z);else if(t&&t.alive&&t.team===TH&&dist3(t.c,z.c)<P.ring[1]+4){const s=this.zStage(z,t,Zs,H);if(s){B.zp={st:'stage',t:G.t,node:s.n,brg:s.b,tgt:t,tp:[t.c.x,t.c.z],arr:0};B.path=null;B.repath=0}else this.zRush(z)}}
      else if(zp.st==='stage'){const n=zp.node;if(!zp.arr&&Math.hypot(n.x-z.c.x,n.z-z.c.z)<1.6&&Math.abs(n.y-z.c.y)<1.2)zp.arr=G.t;
        if(late||hd<P.near||zp.bad||(zp.arr&&G.t-zp.arr>P.wait)||G.t-zp.t>P.wait+11||B.hurtAcc>z.maxHp*.05)this.zRush(z);
        else if(!t||!t.alive||t.team!==TH||Math.hypot(t.c.x-zp.tp[0],t.c.z-zp.tp[1])>8){B.zp={st:'approach',t:G.t};B.path=null;B.repath=0;B.tgtT=0}
        else if(zp.arr)staged++}}
    for(const z of Zs){const zp=z.bot.zp;if(!zp||zp.st!=='stage'||!zp.arr)continue;if(staged>=Math.min(P.quorum,waiting)||fights.some(f=>dist3(f.c,zp.tgt.c)<15))this.zRush(z)}},
  zRush(z){const B=z.bot;B.zp={st:'rush',t:G.t};B.path=null;B.repath=0;B.tgtT=0;B.skillT=Math.min(B.skillT,.05);B.bombT=Math.min(B.bombT,.3)},
  // a staging node: 13–20 m from the target, out of sight of every human within 30 m, on a bearing (from the target) at least 60° from the
  // others staging on the same group; the nearest such node to the zombie first
  zStage(z,t,Zs,H){const bs=[];for(const o of Zs){const q=o.bot.zp;if(o!==z&&q&&q.st==='stage'&&q.tgt&&dist3(q.tgt.c,t.c)<12)bs.push(q.brg)}
    const C=[];for(let i=0;i<28;i++){const n=navAround(t.c.x,t.c.z,ZPACK.ring[0],ZPACK.ring[1]);if(!n||n.e.length<10||Math.abs(n.y-t.c.y)>4)continue;const b=Math.atan2(n.x-t.c.x,n.z-t.c.z);if(bs.some(q=>Math.abs(wrapA(q-b))<1.05))continue;
      C.push([Math.hypot(n.x-z.c.x,n.z-z.c.z)*.6+Math.abs(n.y-z.c.y)+Math.random()*4,n,b])}
    C.sort((p,q)=>p[0]-q[0]);for(let k=0;k<C.length&&k<8;k++)if(!hSees(H,C[k][1],30))return {n:C[k][1],b:C[k][2]};return null},
  // somewhere to heal: 6–22 m off, at least 14 m from every human and out of their sight
  zHide(z,H){let best=null,bs=-1e9;for(let i=0;i<24;i++){const n=navAround(z.c.x,z.c.z,6,22);if(!n||n.e.length<10||Math.abs(n.y-z.c.y)>4)continue;let hd=99;for(const h of H)hd=Math.min(hd,Math.hypot(h.c.x-n.x,h.c.z-n.z)+Math.abs(h.c.y-n.y)*2);if(hd<14)continue;
      const sc=Math.min(hd,30)-Math.hypot(n.x-z.c.x,n.z-z.c.z)*.3+Math.random()*3;if(sc>bs&&!hSees(H,n,35)){bs=sc;best=n}}return best},
  // extra path cost (flanking): the cone in front of each human's gun (40°, up to 16 m) and the routes the other zombies already take
  zPenalty(H,Zs){const N=NAV,L=N.nodes.length;if(!this.pen||this.pen.length!==L)this.pen=new Float32Array(L);const P=this.pen;P.fill(0);const R=16,RC=Math.ceil(R/N.S);
    for(const h of H){const fx=-Math.sin(h.yaw),fz=-Math.cos(h.yaw),i0=Math.floor((h.c.x-N.X0)/N.S),j0=Math.floor((h.c.z-N.Z0)/N.S);
      for(let j=Math.max(0,j0-RC);j<=Math.min(N.NZ-1,j0+RC);j++)for(let i=Math.max(0,i0-RC);i<=Math.min(N.NX-1,i0+RC);i++){const cx=N.X0+(i+.5)*N.S-h.c.x,cz=N.Z0+(j+.5)*N.S-h.c.z,d=Math.hypot(cx,cz);if(d>R||d<2.5||cx*fx+cz*fz<.77*d)continue;
        for(const n of N.col[j*N.NX+i])if(Math.abs(n.y-h.c.y)<3)P[n.id]+=2.5*(1-d/R)}}
    for(const z of Zs){const B=z.bot;B.pp=B.path;if(B.path)for(const id of B.path)if(id<L)P[id]+=1.2}},
  // a path search with that field, minus this zombie's own route
  zPathPen(a,fn){const P=this.pen,p=a.bot.pp;if(!P||P.length!==NAV.nodes.length)return fn(null);const L=P.length;if(p)for(const id of p)if(id<L)P[id]-=1.2;try{return fn(P)}finally{if(p)for(const id of p)if(id<L)P[id]+=1.2}},
  // walk to a node of the pack plan (staging point, hiding place) and hold still there; a node it cannot reach spoils the plan
  zGo(a,dt,n,cap){const B=a.bot,c=a.c;if(!n)return false;if(Math.hypot(n.x-c.x,n.z-c.z)<1.2&&Math.abs(n.y-c.y)<1){B.path=null;return false}
    B.repath-=dt;if((!B.path||B.pi>=B.path.length)&&B.repath<=0){B.repath=rr(1.5,2.5);if((!this.zPathPen(a,P=>this.goTo(a,n.x,n.y,n.z,cap,true,P))||B.partial)&&B.zp)B.zp.bad=1}
    return this.follow(a,dt,true)},
  // end of the path and the target still out of reach (up on a roof, behind a fence): stay under it and keep at it —
  // a step straight in when that is walkable, a running jump when it is only a little above (the grid does not know every ledge
  // a zombie can claw onto), otherwise pacing side to side without walking off any edge
  prowl(a,dt,t,dx,dz,dh,dy,see,cap){const B=a.bot,c=a.c;const hi=!window.__noStack&&dy>=cap+.3&&dy<5.5&&dh<4.5;if(dh<.9&&!hi)return false;const ux=dx/(dh||1),uz=dz/(dh||1);
    if(see&&Math.abs(dy)<.6&&dh<4&&navStraight(c.x,c.y,c.z,t.c.x,t.c.z,Math.min(.3,c.hw*.9))){this.moveDir(a,ux,uz);return true}
    if(dy>.5&&dy<cap+.3&&dh<(a.onHead?4.5:3)){this.moveDir(a,ux,uz);if(c.onGround&&B.jumpT<=0&&dh<2.2){a.cmd.jump=true;B.jumpT=rr(.7,1.3)}return true}
    if(hi)return this.stack(a,dt,t,ux,uz,dh,dy,cap);
    B.prowlT=(B.prowlT||0)-dt;if(B.prowlT<=0){B.prowlT=rr(.7,1.6);B.prowlS=Math.random()<.35?0:rpick([-1,1])}if(!B.prowlS)return false;
    const px=-uz*B.prowlS,pz=ux*B.prowlS,ax=c.x+px*.7,az=c.z+pz*.7;
    if(floorBelow(ax,c.y+.45,az,.15)<c.y-.5||!charFits(c,ax,c.y+.05,az)){B.prowlS=-B.prowlS;return false}
    this.moveDir(a,px*.7,pz*.7);return true},
  // too high to jump to: climb on each other. A teammate whose head is within a jump and no farther from the target is a step —
  // run at it and jump on; nobody like that → be the step: get right under the target, hold still and crouch for the next one.
  // On a crouching zombie's head the next jump reaches about 3 m; a second zombie crouching on top of that, about 4.3 m.
  stack(a,dt,t,ux,uz,dh,dy,cap){const B=a.bot,c=a.c,sp=B.spot;let best=null,bs=1e9;
    if(sp&&!a.onHead){const ex=sp.x-c.x,ez=sp.z-c.z,ed=Math.hypot(ex,ez);if(ed>.8&&ed<6){this.moveDir(a,ex/ed,ez/ed);return true}}
    for(const b of G.actors){if(b===a||!b.alive||b.team!==a.team||b===a.onHead||b.onHead===a)continue;const rise=b.c.y+b.c.h-c.y;if(rise<.3||rise>cap-.1)continue;
      const bd=Math.hypot(b.c.x-c.x,b.c.z-c.z);if(bd>5)continue;const bt=Math.hypot(t.c.x-b.c.x,t.c.z-b.c.z);if(sp?Math.hypot(b.c.x-sp.x,b.c.z-sp.z)>1.4:bt>dh+.6)continue;const sc=bd+bt*.5;if(sc<bs){bs=sc;best=b}}
    if(best){const bx=best.c.x-c.x,bz=best.c.z-c.z,bd=Math.hypot(bx,bz)||.01;this.moveDir(a,bx/bd,bz/bd);
      if(c.onGround&&B.jumpT<=0&&bd<1.3){a.cmd.jump=true;B.jumpT=rr(.5,.9)}return true}
    a.cmd.duck=true;if(!a.onHead&&!sp&&dh>.9){const ax=c.x+ux*.5,az=c.z+uz*.5;if(floorBelow(ax,c.y+.45,az,.15)>=c.y-.5&&charFits(c,ax,c.y+.05,az)){this.moveDir(a,ux*.6,uz*.6);return true}}
    a.cmd.f=a.cmd.s=0;return true},
  // where to build the stack under someone out of reach: a reachable spot on the ground within ~4 m of them, open to the sky up to
  // their level (not under the balcony they stand on) and with their floor a step away toward them (the ledge is right there)
  stackSpot(a,t,cap){const B=a.bot,K=B.spotC;if(K&&K.t===t&&G.t<K.until&&Math.hypot(K.p[0]-t.c.x,K.p[2]-t.c.z)+Math.abs(K.p[1]-t.c.y)<1.5)return K.n;
    const N=NAV,ty=t.c.y,i0=Math.floor((t.c.x-N.X0)/N.S),j0=Math.floor((t.c.z-N.Z0)/N.S),C=[];
    for(let j=j0-4;j<=j0+4;j++)for(let i=i0-4;i<=i0+4;i++){if(i<0||j<0||i>=N.NX||j>=N.NZ)continue;for(const n of N.col[j*N.NX+i]){if(n.y>ty-cap-.3||n.y<ty-5.5)continue;
      const d=Math.hypot(n.x-t.c.x,n.z-t.c.z);if(d>4.2||d<.3)continue;if(overlapAny(n.x-.3,n.y+.1,n.z-.3,n.x+.3,ty+1.9,n.z+.3))continue;
      const mx=n.x+(t.c.x-n.x)/d,mz=n.z+(t.c.z-n.z)/d;if(floorBelow(mx,ty+.3,mz,.1)<ty-.45||overlapAny(mx-.25,ty+.05,mz-.25,mx+.25,ty+1.7,mz+.25))continue;C.push([d,n])}}
    C.sort((p,q)=>p[0]-q[0]);const s0=navNode(a.c.x,a.c.y,a.c.z);let r=null;
    for(let k=0;k<C.length&&k<5&&!r;k++)if(navPath(s0,C[k][1],cap,4000))r=C[k][1];
    B.spotC={t,p:[t.c.x,t.c.y,t.c.z],n:r,until:G.t+3};return r},
  wander(a,dt){const B=a.bot;B.repath-=dt;if(!B.wander||Math.hypot(B.wander[0]-a.c.x,B.wander[2]-a.c.z)<1.5||(!B.path&&B.repath<=0)){B.repath=2;const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];B.wander=[n.x,n.y,n.z];this.goTo(a,n.x,n.y,n.z,jumpCap(a))}
    if(this.follow(a,dt,false)){const v=Math.hypot(a.c.vx,a.c.vz);if(v>.3)this.turnTo(a,Math.atan2(-a.c.vx,-a.c.vz),0,dt,4)}},
};

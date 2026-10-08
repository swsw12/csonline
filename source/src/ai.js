'use strict';
// ============ Bots: humans buy, roam the map between camps and open ground, hold and fight; zombies path-find, leap ledges, swarm and use skills ============
const DIFF=[{react:.38,err:.05,turn:7,hsP:.1,tol:.18},{react:.24,err:.027,turn:11,hsP:.24,tol:.22},{react:.16,err:.018,turn:14,hsP:.36,tol:.24},{react:.1,err:.012,turn:18,hsP:.5,tol:.26}];
// per difficulty: bot zombie health and speed
const DIFF_Z={hp:[.85,1,1.15,1.35],spd:[.93,1,1.04,1.08]};
const CAMP_W={};// legacy weights; camps carry their own weight w
const NOISE=[];
function alertBots(src,x,z){if(src.team!==TH)return;NOISE.push({x,z,t:G.t});if(NOISE.length>24)NOISE.shift()}
function jumpCap(a){if(a.team===TH)return 1.45;const Z=ZCLASS[a.zc];return Z.jump*Z.jump/(2*GRAV)+Z.h*.3-.06}
const AI={
  mk(a){return {path:null,pi:0,goal:null,repath:0,stuckT:0,lx:0,lz:0,think:Math.random()*.2,target:null,tgtT:0,seen:null,react:0,aimX:0,aimY:0,strafe:0,strafeT:0,nadeCD:rr(4,9),
    camp:null,spot:null,buyT:0,crouchT:0,jumpT:0,lastHp:0,hurtAcc:0,skillT:rr(1,3),bombT:rr(6,14),detour:0,wander:null,fireHold:0,flashOn:Math.random()<.85,growlT:rr(2,8),avoidT:0,roam:Math.random()<.75,roamT:0,scanY:null,seenT:-99}},
  onRound(a){const B=a.bot;B.path=null;B.target=null;B.seen=null;B.buyT=rr(.4,3);B.stuckT=0;B.goal=null;B.roamT=rr(.5,2.5);B.scanY=null;this.pickCamp(a);a.flash=false},
  onTeam(a){const B=a.bot;B.path=null;B.partial=false;B.target=null;B.seen=null;B.goal=null;B.repath=0;B.stuckT=0;B.wasDirect=0;B.straight=false;B.unreach=0;B.lastHp=a.hp;B.skillT=rr(1,3);a.cmd.fire=a.cmd.alt=false},
  onHurt(a,src){const B=a.bot;if(src&&a.team===TZ&&src.alive&&(!B.target||Math.random()<.25)){B.target=src;B.repath=0}},
  pickCamp(a){const B=a.bot;const C=MAP.camps;const used={};for(const o of G.actors)if(o.bot&&o!==a&&o.bot.spot)used[o.bot.spot.join(',')]=1;
    const cw=c=>c.w||CAMP_W[c.k]||.1;let tot=0;for(const c of C)tot+=cw(c);let r=Math.random()*tot,camp=C[0];for(const c of C){r-=cw(c);if(r<=0){camp=c;break}}
    const free=camp.p.filter(p=>!used[p.join(',')]);const base=free.length?rpick(free):rpick(camp.p);B.camp=camp;
    const rad=free.length?.7:1.6;const n=navSnap(base[0]+rr(-rad,rad),base[1],base[2]+rr(-rad,rad),3)||navSnap(base[0],base[1],base[2],4);
    B.spot=n?[n.x+rr(-.25,.25),n.y,n.z+rr(-.25,.25)]:[base[0],base[1],base[2]];B.scanY=null},
  // a fresh place to walk to: open ground 5–28 m away (closer while still buying), away from the zombies, not too far up or down
  pickRoam(a){const B=a.bot,c=a.c,N=NAV.nodes;if(!N.length)return false;const Zs=G.st==='fight'?G.actors.filter(z=>z.alive&&z.team===TZ):[];const far=G.st==='prep'?18:28;let best=null,bs=-1e9;
    for(let i=0;i<28;i++){const n=N[(Math.random()*N.length)|0];if(n.e.length<12)continue;const d=Math.hypot(n.x-c.x,n.z-c.z);if(d<5||d>far)continue;
      let zd=40;for(const z of Zs)zd=Math.min(zd,Math.hypot(z.c.x-n.x,z.c.z-n.z)+Math.abs(z.c.y-n.y)*2);
      const sc=Math.random()*10+Math.min(zd,25)*.6-Math.abs(n.y-c.y)*.4;if(sc>bs){bs=sc;best=n}}
    if(!best)return false;B.spot=[best.x+rr(-.25,.25),best.y,best.z+rr(-.25,.25)];B.camp=null;B.path=null;B.repath=0;B.scanY=null;return true},
  buy(a){const m=()=>a.money;const prim=[['hmg',.24],['mg6',.16],['gx6',.12],['ar7',.24],['kv47',.2],['g35',.12],['br3',.1],['ar5c',.12],['hr17',.1],['as12',.18],['m14',.12],['sg8',.13],['db2',.06],['k5',.06],['k9',.05],['um45',.05],['pd50',.07],['r700',.04],['sr8',.03],['dm14',.05],['gl40',.04],['volc',.05],['xbow',.04],['xbowa',.03],['bdc',.05],['rdc',.03],['mdrill',.04],['mlaunch',.03],['xdz',.03],['gaebolg',.03],['sterling',.05]];
    if(!a.inv[1]){const ok=prim.filter(p=>WPN[p[0]].cost<=m()-(a.armor<100?600:0));if(ok.length){let t=0;for(const p of ok)t+=p[1]*(1+WPN[p[0]].cost/3000);let r=Math.random()*t;for(const p of ok){r-=p[1]*(1+WPN[p[0]].cost/3000);if(r<=0){buy(a,p[0]);break}}}}
    if(a.armor<100&&m()>=1000&&Math.random()<.85)buy(a,'armor');
    if(!a.inv.he&&m()>=300&&Math.random()<.65)buy(a,'he');if(!a.inv.frost&&m()>=250&&Math.random()<.4)buy(a,'frost');if(!a.inv.flare&&m()>=150&&Math.random()<.15)buy(a,'flare');
    if(a.inv[2]==='p9'&&m()>=900&&Math.random()<(a.inv[1]?.25:.6)){const s=rpick(['d50','f7','tw9','r6','duckfoot']);if(m()>=WPN[s].cost)buy(a,s)}
    if(a.inv[3]==='knife'&&m()>=2500&&Math.random()<.12)buy(a,Math.random()<.35&&m()>=3500?'hammer':'axe');
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
  goTo(a,x,y,z,maxJ,partial){const B=a.bot;const s=navNode(a.c.x,a.c.y,a.c.z),t=navNode(x,y,z);B.path=navPath(s,t,maxJ,0,a.team===TH?4.3:0,partial);
    B.partial=!!(B.path&&B.path.partial);B.pi=0;B.goal=[x,y,z];return !!B.path},
  // ---------- human bots ----------
  human(a,dt){const B=a.bot,cmd=a.cmd,c=a.c,D=DIFF[G.diff];cmd.duck=false;
    if(G.st==='prep'||G.st==='fight'){if(B.buyT>0){B.buyT-=dt;if(B.buyT<=0)this.buy(a)}}
    if(G.st==='fight'&&B.flashOn)a.flash=true;
    // perception at ~8 Hz
    if(B.think<=0){B.think=.12+Math.random()*.05;const e=actorEye(a);let best=null,bd=1e9;
      for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0)continue;const d=dist3(z.c,c);if(d>48)continue;if(z.zc==='runner'&&z.skillT>0&&d>3.5)continue;
        const ang=Math.abs(wrapA(Math.atan2(-(z.c.x-c.x),-(z.c.z-c.z))-a.yaw));if(ang>1.5&&d>6&&!(B.seen&&B.seen.a===z))continue;
        if(!losClear(e.x,e.y,e.z,z.c.x,z.c.y+(z.zc==='boss'?2.8:1.2),z.c.z))continue;const sc=d*(ang>1.5?1.5:1);if(sc<bd){bd=sc;best=z}}
      if(best){if(!B.seen||B.seen.a!==best){B.seen={a:best,t:G.t};B.react=D.react*(.7+Math.random()*.6)*(dist3(best.c,c)<4?.35:1)}}else if(B.seen&&G.t-B.seen.t>.8)B.seen=null;else if(B.seen&&!B.seen.a.alive)B.seen=null}
    const tgt=B.seen&&B.seen.a.alive?B.seen.a:null;if(tgt)B.seenT=G.t;
    // where to stand
    let moving=false;const zNear=G.actors.filter(z=>z.alive&&z.team===TZ&&dist3(z.c,c)<5.5);
    const last=G.st==='fight'&&humansAlive()===1;
    // roamers (most bots) do not settle: after a short hold they walk on to another camp or a patch of open ground away from the zombies
    const roamer=B.roam&&!last&&G.mode!=='scen'&&(G.st==='prep'||G.st==='fight');
    if(zNear.length&&G.st==='fight'){// back away from the closest zombie while keeping the gun on it
      const z=zNear.reduce((p,q)=>dist3(p.c,c)<dist3(q.c,c)?p:q);let ax=c.x-z.c.x,az=c.z-z.c.z;const l=Math.hypot(ax,az)||1;ax/=l;az/=l;
      const side=Math.sin(G.t*.7+a.id)*.6;const bx=ax-az*side,bz=az+ax*side;const t2=Math.hypot(bx,bz);
      if(charFits(c,c.x+bx/t2*.6,c.y+.3,c.z+bz/t2*.6)&&floorBelow(c.x+bx/t2*.9,c.y+.4,c.z+bz/t2*.9,.2)>c.y-.35){this.moveDir(a,bx/t2,bz/t2);moving=true}}
    if(!moving){const goal=last?this.fleeSpot(a):B.spot;
      if(goal){const gd=Math.hypot(goal[0]-c.x,goal[2]-c.z),gy=Math.abs(goal[1]-c.y);
        // a roamer with a zombie in its sights (not yet close) stops walking and shoots; it walks on once things are quiet
        const plant=roamer&&tgt&&G.st==='fight'&&dist3(tgt.c,c)>6.5;
        if((gd>1.1||gy>.8)&&!plant){B.repath-=dt;if((!B.path||B.pi>=B.path.length||B.repath<-2)&&B.repath<=0){B.repath=last?1.2:2.5;if(!this.goTo(a,goal[0],goal[1],goal[2],1.45)){B.repath=1.5;if(!last&&!(roamer&&this.pickRoam(a)))this.pickCamp(a)}}
          moving=this.follow(a,dt,true)}
        else{if(!plant)B.path=null;// hold: small strafes, crouch while shooting
          B.strafeT-=dt;if(B.strafeT<=0){B.strafeT=rr(.6,2.2);B.strafe=Math.random()<.5?0:rpick([-1,1])}if(B.strafe&&tgt)cmd.s=B.strafe*.6;
          if(tgt&&B.crouchT<=0&&Math.random()<dt*.3)B.crouchT=rr(1,3);
          if(roamer&&!plant){B.roamT-=dt;if(B.roamT<=0&&!tgt&&G.t-B.seenT>2.5){const toCamp=G.st==='fight'&&Math.random()<.3;if(toCamp||!this.pickRoam(a))this.pickCamp(a);B.roamT=G.st==='prep'?rr(1.5,4):rr(5,15)}}}}}
    if(B.crouchT>0){B.crouchT-=dt;cmd.duck=true}
    // aim & shoot
    const W=WPN[a.cur];
    if(tgt){const e=actorEye(a);const hs=Math.random()<D.hsP;const tdist=dist3(tgt.c,c);
      // empty magazine with a zombie close: switch to the sidearm instead of reloading; reload early when there is time
      {const am=a.ammo[a.cur];const prim=a.cur===a.inv[1];const side=a.inv[2]&&a.ammo[a.inv[2]];
        if(am&&W&&W.mag&&prim&&am.mag===0&&tdist<10&&side&&side.mag>0&&a.drawT<=0)equip(a,a.inv[2]);
        else if(am&&W&&W.mag&&am.mag<=Math.max(1,W.mag*.25)&&am.res>0&&tdist>13&&!zNear.length&&a.reloadT<=0)cmd.reload=true;
        if(a.reloadT>0&&a.relKind==='shell'&&am&&am.mag>0&&tdist<7){a.reloadT=0;a.relKind=null}}const tx=tgt.c.x,tz=tgt.c.z,ty=hs?tgt.head.y:tgt.c.y+(tgt.zc==='boss'?2.6:tgt.c.h*.55);
      B.aimX=lerp(B.aimX,rr(-1,1)*D.err,dt*3);B.aimY=lerp(B.aimY,rr(-1,1)*D.err,dt*3);
      const yaw=Math.atan2(-(tx-e.x),-(tz-e.z))+B.aimX,dist=Math.hypot(tx-e.x,tz-e.z),pitch=Math.atan2(ty-e.y,dist)+B.aimY;
      this.turnTo(a,yaw,pitch,dt,D.turn*(dist<4?1.8:1));B.react-=dt;
      const err=Math.abs(wrapA(yaw-a.yaw))+Math.abs(pitch-a.pitch);
      if(B.react<=0&&err<D.tol+(W&&W.pellets?.1:0)){
        if(W&&W.kind==='nade'){}else if(W&&W.kind==='melee'){const bw=bestWeapon(a);const ba=a.ammo[bw];if(bw!==a.cur&&ba&&(ba.mag+ba.res)>0)equip(a,bw);else if(tdist<2.3)cmd.fire=Math.random()<.7,cmd.alt=!cmd.fire}
        else{const am=a.ammo[a.cur];if(am&&am.mag===0&&am.res===0){const o=a.cur===a.inv[1]?a.inv[2]:null;if(o&&a.ammo[o]&&(a.ammo[o].mag+a.ammo[o].res)>0)equip(a,o);else equip(a,a.inv[3]||'knife')}
          else{const semi=W&&(W.semi||W.burst);cmd.fire=semi?(B.fireHold=!B.fireHold):true;if(W&&W.zoom&&a.zoom===0&&dist>(W.kind==='sniper'?8:15)&&!cmd.alt)cmd.alt=true}}}
      if(W&&W.spin)cmd.alt=true;// keep the barrels turning while a target is in view
      if(a.zoom>0&&tdist<6)a.zoom=0;
      // grenades at groups / close zombies
      B.nadeCD-=dt;if(B.nadeCD<=0&&G.st==='fight'&&!zNear.length){const zs=G.actors.filter(z=>z.alive&&z.team===TZ&&dist3(z.c,tgt.c)<4).length;
        const kind=a.inv.he&&zs>=2&&dist>7&&dist<16?'he':a.inv.frost&&dist<11&&dist>6?'frost':null;if(kind){equip(a,kind);B.nadeCD=rr(6,12)}else B.nadeCD=rr(1,2)}
      if(W&&W.kind==='nade'&&a.drawT<=0){a.pitch=Math.min(.5,pitch+.08+dist*.012);cmd.fire=true}}
    else{// idle: scan, reload, face the camp's look point
      if(G.st==='fight'&&W&&W.kind==='nade'&&a.throwT<=0)equip(a,bestWeapon(a));
      if(a.inv[1]&&a.cur===a.inv[2]&&G.st==='fight'){const pa=a.ammo[a.inv[1]];if(pa&&pa.mag+pa.res>0)equip(a,a.inv[1])}
      const am=a.ammo[a.cur];if(am&&W&&am.mag<W.mag*.7&&am.res>0)cmd.reload=true;
      if(!moving&&B.camp){const lk=B.camp.look;const scan=Math.sin(G.t*.5+a.id*1.3)*.9;const yaw=Math.atan2(-(lk[0]-c.x),-(lk[2]-c.z))+scan;this.turnTo(a,yaw,-.05,dt,2.5)}
      else if(!moving){if(B.scanY==null)B.scanY=a.yaw;this.turnTo(a,B.scanY+Math.sin(G.t*.45+a.id*1.7)*1.6,-.04,dt,2.2)}// open ground: sweep around the way it came
      else if(moving){const v=Math.hypot(c.vx,c.vz);if(v>.5)this.turnTo(a,Math.atan2(-c.vx,-c.vz),0,dt,6)}
      if(G.st==='fight'&&a.inv.flare&&!B.flared&&Math.random()<dt*.02){equip(a,'flare');B.flared=1}
      if(W&&W.kind==='nade'&&a.cur==='flare'&&a.drawT<=0){a.pitch=.35;cmd.fire=true}}
    if(G.st==='prep'&&a.cur==='knife'&&!moving)equip(a,bestWeapon(a))},
  fleeSpot(a){const B=a.bot;if(B.flee&&G.t-B.fleeT<4)return B.flee;const Z=G.actors.filter(z=>z.alive&&z.team===TZ);let best=null,bd=-1;
    for(let i=0;i<14;i++){const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];let md=1e9;for(const z of Z)md=Math.min(md,Math.hypot(z.c.x-n.x,z.c.z-n.z)+Math.abs(z.c.y-n.y)*2);const self=Math.hypot(n.x-a.c.x,n.z-a.c.z);const sc=md-self*.3;if(sc>bd){bd=sc;best=[n.x,n.y,n.z]}}
    B.flee=best;B.fleeT=G.t;return best},
  // ---------- zombie bots ----------
  zombie(a,dt){const B=a.bot,cmd=a.cmd,c=a.c,Z=ZCLASS[a.zc];cmd.duck=false;
    if(a.cur!=='claw'&&a.cur!=='zbomb')equip(a,'claw');
    B.growlT-=dt;if(B.growlT<=0){B.growlT=rr(3,9);AU.at('zgrowl',c.x,c.y+1.5,c.z,{vol:.7,range:30})}
    const cap=jumpCap(a),bud=Math.max(2500,NAV.nodes.length*.7|0);
    // pick a target every so often: the nearest humans by path (three tried, six when none of those can be reached);
    // nobody reachable → the nearest one, approached as close as the ground allows (partial path), and checked again less often
    B.tgtT-=dt;if(B.tgtT<=0||!B.target||!B.target.alive||B.target.team!==TH){B.tgtT=rr(.8,1.4);const H=G.actors.filter(h=>h.alive&&h.team===TH);
      H.sort((p,q)=>(dist3(p.c,c)+Math.abs(p.c.y-c.y)*3)-(dist3(q.c,c)+Math.abs(q.c.y-c.y)*3));
      const s0=navNode(c.x,c.y,c.z);let best=null,bl=1e9;
      for(let i=0;i<H.length&&i<(B.unreach?3:6);i++){if(i>=3&&best)break;const h=H[i];const p=navPath(s0,navNode(h.c.x,h.c.y,h.c.z),cap,bud);if(!p)continue;
        const l=p.length+(h===B.target?-3:0);if(l<bl){bl=l;best=h;B.path=p;B.partial=false;B.pi=0;B.goal=[h.c.x,h.c.y,h.c.z];B.repath=rr(.7,1.1)}}
      if(best){B.target=best;B.unreach=0}else if(H.length){if(B.target!==H[0]||!B.unreach){B.path=null;B.repath=0}B.target=H[0];B.unreach=1;B.tgtT=rr(2.2,3.4)}}
    const t=B.target;if(!t){this.wander(a,dt);return}
    const e=actorEye(a);const dx=t.c.x-c.x,dz=t.c.z-c.z,dh=Math.hypot(dx,dz),dy=t.c.y-c.y;
    // ~7 Hz: line of sight, and whether the straight line to the target can actually be walked —
    // no wall, crate, railing, gap or ledge in between (seeing someone is not the same as being able to run at them)
    if(B.think<=0){B.think=.15;B.los=dh<22&&losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.3,t.c.z);
      B.straight=B.los&&Math.abs(dy)<.6&&dh<14&&navStraight(c.x,c.y,c.z,t.c.x,t.c.z,Math.min(.3,c.hw*.9))}
    const see=dh<22&&B.los;
    let moving=false;
    if(see&&B.straight){B.wasDirect=1;if(dh>.9){this.moveDir(a,dx/dh,dz/dh);moving=true}}// open ground: straight at them
    else{// otherwise the way round: the path (fresh when the straight run just ended)
      if(B.wasDirect){B.wasDirect=0;B.repath=0;B.path=null}
      B.repath-=dt;const moved=B.goal?Math.hypot(B.goal[0]-t.c.x,B.goal[2]-t.c.z)+Math.abs(B.goal[1]-t.c.y):99;
      if((!B.path||moved>2||B.pi>=B.path.length)&&B.repath<=0){B.repath=rr(.7,1.2);
        if(!this.goTo(a,t.c.x,t.c.y,t.c.z,cap,true)){B.path=null;B.offGrid=1;B.repath=rr(1.5,2.5);B.tgtT=Math.min(B.tgtT,.3)}
        else{B.offGrid=0;if(B.partial)B.repath=rr(1.8,2.8)}}
      moving=this.follow(a,dt,true);
      // off the walkable grid altogether (knocked somewhere odd): head straight for the target as before
      if(!moving){if(B.offGrid&&dh>1){this.moveDir(a,dx/dh,dz/dh);moving=true}else moving=this.prowl(a,dt,t,dx,dz,dh,dy,see,cap)}}
    // facing: toward the next waypoint while running, toward the target when close
    const lookAtT=see&&dh<9;let yaw;if(lookAtT)yaw=Math.atan2(-dx,-dz);else{if(B.path&&B.pi<B.path.length){const n=NAV.nodes[B.path[B.pi]];yaw=Math.atan2(-(n.x-c.x),-(n.z-c.z))}else yaw=a.yaw}
    const pitch=lookAtT?Math.atan2(t.c.y+1.2-e.y,Math.max(.5,dh)):0;
    // keep the move direction while turning (the move command is in body space)
    const wx=-Math.sin(a.yaw)*cmd.f+Math.cos(a.yaw)*cmd.s,wz=-Math.cos(a.yaw)*cmd.f-Math.sin(a.yaw)*cmd.s;
    this.turnTo(a,yaw,pitch,dt,9);if(moving)this.moveDir(a,wx,wz);
    // attack
    if(dh<1.55+t.c.hw&&Math.abs(dy)<1.7&&see){cmd.fire=Math.random()<.85;cmd.alt=!cmd.fire&&Math.random()<.4}
    // skills
    B.skillT-=dt;if(B.skillT<=0&&a.skillCD<=0){B.skillT=rr(.5,1.5);
      if(Z.skill==='frenzy'&&see&&dh<14&&dh>3&&a.hp>a.maxHp*.35)cmd.skill=true;
      else if(Z.skill==='leap'&&see&&dh>4.5&&dh<12&&dy<1&&dy>-3)cmd.skill=true;
      else if(Z.skill==='harden'&&(B.hurtAcc>a.maxHp*.12||(see&&dh<9)))cmd.skill=true;
      else if(Z.skill==='shriek'&&see&&dh<8)cmd.skill=true;
      else if(Z.skill==='invis'&&see&&dh>4&&dh<26)cmd.skill=true;else if(Z.skill==='trap'&&dh<12&&Math.random()<.35)cmd.skill=true;
      else if(Z.skill==='coffin'&&see&&dh>4&&dh<22&&(B.hurtAcc>a.maxHp*.04||Math.random()<.02))cmd.skill=true;
      else if(Z.skill==='heal'&&(a.hp<a.maxHp*.6||G.actors.some(z=>z!==a&&z.alive&&z.team===TZ&&z.hp<z.maxHp*.5&&dist3(z.c,c)<8)))cmd.skill=true}
    B.hurtAcc=Math.max(0,B.hurtAcc*Math.exp(-dt/2)+(B.lastHp-a.hp>0?B.lastHp-a.hp:0));B.lastHp=a.hp;
    // spore bomb (one a life): at groups, at someone up high or out of reach, when taking fire, or now and then on a clear view
    B.bombT-=dt;if(a.bombs>0&&B.bombT<=0&&see&&dh>(B.partial?2.5:5)&&dh<15){B.bombT=rr(6,12);const grp=G.actors.filter(h=>h.alive&&h.team===TH&&dist3(h.c,t.c)<4).length;
      if(grp>=2||dy>1.5||B.partial||B.hurtAcc>a.maxHp*.1||Math.random()<.4){equip(a,'zbomb');B.throwing=1}}
    if(a.cur==='zbomb'&&a.drawT<=0){a.pitch=clamp(Math.atan2(t.c.y+1-e.y,dh)+.1+dh*.012,-.4,.7);a.yaw=Math.atan2(-dx,-dz);cmd.fire=true}},
  // end of the path and the target still out of reach (up on a roof, behind a fence): stay under it and keep at it —
  // a step straight in when that is walkable, a running jump when it is only a little above (the grid does not know every ledge
  // a zombie can claw onto), otherwise pacing side to side without walking off any edge
  prowl(a,dt,t,dx,dz,dh,dy,see,cap){const B=a.bot,c=a.c;if(dh<.9)return false;const ux=dx/dh,uz=dz/dh;
    if(see&&Math.abs(dy)<.6&&dh<4&&navStraight(c.x,c.y,c.z,t.c.x,t.c.z,Math.min(.3,c.hw*.9))){this.moveDir(a,ux,uz);return true}
    if(dy>.5&&dy<cap+.3&&dh<3){this.moveDir(a,ux,uz);if(c.onGround&&B.jumpT<=0&&dh<2.2){a.cmd.jump=true;B.jumpT=rr(.7,1.3)}return true}
    B.prowlT=(B.prowlT||0)-dt;if(B.prowlT<=0){B.prowlT=rr(.7,1.6);B.prowlS=Math.random()<.35?0:rpick([-1,1])}if(!B.prowlS)return false;
    const px=-uz*B.prowlS,pz=ux*B.prowlS,ax=c.x+px*.7,az=c.z+pz*.7;
    if(floorBelow(ax,c.y+.45,az,.15)<c.y-.5||!charFits(c,ax,c.y+.05,az)){B.prowlS=-B.prowlS;return false}
    this.moveDir(a,px*.7,pz*.7);return true},
  wander(a,dt){const B=a.bot;B.repath-=dt;if(!B.wander||Math.hypot(B.wander[0]-a.c.x,B.wander[2]-a.c.z)<1.5||(!B.path&&B.repath<=0)){B.repath=2;const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];B.wander=[n.x,n.y,n.z];this.goTo(a,n.x,n.y,n.z,jumpCap(a))}
    if(this.follow(a,dt,false)){const v=Math.hypot(a.c.vx,a.c.vz);if(v>.3)this.turnTo(a,Math.atan2(-a.c.vx,-a.c.vz),0,dt,4)}},
};

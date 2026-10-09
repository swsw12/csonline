'use strict';
// ============ Shooting range (사격장): a practice mode on its own map ============
// Six stalls on a covered firing line look down a 60 m range. Zombie dummies stand at 10 / 15 / 20 / 25 / 30 / 50 m, two more
// walk back and forth across it; they never fight back, get their health back a moment after you stop hitting them and get
// up again two seconds after they go down. Every weapon is free (B), ammunition never runs out, and a panel on the left
// keeps score: damage per second, accuracy, headshots, the last hit (damage, where, how far) and time to kill.
// K clears the record, J stops / starts the walking dummies. No rounds, no infection, no blackouts or supply drops.

// ---------- textures: distance boards and the board on the back wall ----------
function texRgDist(n){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){const e=x<6||y<6||x>=250||y>=122;P.set(x,y,e?'#1c1c1a':'#e8c21a')}
  P.post=x=>{x.fillStyle='#141414';x.textAlign='center';x.font='bold 84px sans-serif';x.fillText(n+'m',128,94);x.fillRect(16,104,224,6)}})}
function texRgInfo(){return paint(512,192,P=>{for(let y=0;y<192;y++)for(let x=0;x<512;x++){const e=x<8||y<8||x>=504||y>=184;P.set(x,y,e?'#2a2c2e':'#16181a')}
  P.post=x=>{x.textAlign='center';x.fillStyle='#e8c21a';x.font='bold 46px sans-serif';x.fillText('사격장  SHOOTING RANGE',256,64);x.fillStyle='#e8e8e2';x.font='bold 22px sans-serif';
    x.fillText('B 무기 무료 · FREE WEAPONS     K 기록 초기화 · RESET',256,112);x.fillText('J 이동 표적 · MOVING TARGETS     ESC 나가기 · EXIT',256,146);
    x.fillStyle='#ff5a4a';x.font='bold 15px sans-serif';x.fillText('사선 앞으로 나가지 마십시오 · STAY BEHIND THE FIRING LINE',256,174)}})}
function texRgLane(n){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const e=x<3||y<3||x>=61||y>=61;P.set(x,y,e?'#e8e8e2':'#1c3a5a')}
  P.post=x=>{x.fillStyle='#f0f0ea';x.textAlign='center';x.font='bold 44px sans-serif';x.fillText(String(n),32,48)}})}
function bakeRangeTex(){if(TEX.rgInfo)return;
  for(const n of [10,15,20,25,30,50])TEX['rgD'+n]=mkTex(texRgDist(n),false);TEX.rgInfo=mkTex(texRgInfo(),false);for(let i=1;i<=6;i++)TEX['rgL'+i]=mkTex(texRgLane(i),false);
  if(!TEX.skyDay){TEX.skyDay=mkTex(texSkyDay());TEX.skyDay.wrapT=THREE.ClampToEdgeWrapping;TEX.skyDay.magFilter=THREE.LinearFilter}
  if(!TEX.sunDisc){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}}
for(const n of [10,15,20,25,30,50])MATS['rgD'+n]={t:'rgD'+n,uv:'box',emis:.18,k:'wood'};
MATS.rgInfo={t:'rgInfo',uv:'box',emis:.3,k:'metal'};for(let i=1;i<=6;i++)MATS['rgL'+i]={t:'rgL'+i,uv:'box',emis:.2,k:'metal'};

// ---------- the map ----------
const RG={X:16,Z0:-62,LANES:[-10,-6,-2,2,6,10]};
function buildRange(){const X=RG.X,Z0=RG.Z0;
  // ground: concrete under the shelter, packed earth down range
  B(-X,-1,-1.3,X,0,9,'concf',{ground:1});B(-X,-1,Z0,X,0,-1.3,'dirt',{ground:1});
  // walls round it: the back wall behind the shooters, the long side walls, the earth bank at the far end
  B(-X-.8,0,9,X+.8,5.5,9.8,'conc');B(-X-.8,0,Z0-3,-X,5,9,'conc');B(X,0,Z0-3,X+.8,5,9,'conc');
  B(-X,0,Z0-3,X,5.5,Z0,'dirt',{f:{nz:'dirt'}});B(-X,0,Z0,X,2.6,Z0+1.6,'dirt');B(-X,0,Z0+1.6,X,.9,Z0+2.6,'sandbag');
  // the firing line: a counter in each stall, partitions between them, open passages at both ends to walk down range
  const L=RG.LANES;for(let i=0;i<L.length;i++){const x=L[i];B(x-1.9,0,-.95,x+1.9,1.02,-.35,'wood',{f:{py:'metal2'}});B(x-.2,2.62,-.74,x+.2,3.0,-.71,'rgL'+(i+1),{nosolid:true})}
  for(const x of [-12,-8,-4,0,4,8,12])B(x-.07,0,-1.05,x+.07,2.4,1.5,'plaster');
  B(-12.07,2.4,-1.05,12.07,2.55,-.72,'metal2',{nosolid:true});
  // the shelter roof, its front beam with a light strip under it, and lamps over every stall
  B(-X,3.45,-1.6,X,3.75,9,'roof');B(-X,3.05,-1.7,X,3.45,-1.35,'metal2');
  for(const x of L){B(x-1.2,3.0,-1.62,x+1.2,3.05,-1.42,'lampW',{nosolid:true});LIGHT(x,3.1,.6,'#fff1da',9,.95)}
  LIGHT(0,3.1,5.5,'#fff1da',14,.8);
  // behind the line: tables, crates, a rack, the board on the back wall
  B(-7,0,5.4,7,.86,6.2,'wood',{f:{py:'metal2'}});for(const x of [-13.5,13.5])crate(x,6.5,1.1);crate(-13.4,4.4,.9);crate(13.6,4.6,.8,0,'pallet');
  B(-4.6,1.2,8.92,4.6,3.2,9,'rgInfo',{nosolid:true});
  // down range: a painted line and a board on both side walls at every marked distance, lamps along the walls, some cover by the walls
  for(const d of [10,15,20,25,30,50]){const z=-d;B(-X,0,z-.05,X,.012,z+.05,'mark',{nosolid:true});B(X-.08,1.1,z-.8,X,1.9,z+.8,'rgD'+d,{nosolid:true});B(-X,1.1,z-.8,-X+.08,1.9,z+.8,'rgD'+d,{nosolid:true})}
  for(const z of [-12,-27,-42,-56]){lamp(-X+.5,z,5.2,'#fff4e4');lamp(X-.5,z,5.2,'#fff4e4')}
  for(const [x,z] of [[-14.5,-22],[14.4,-33],[-14.6,-45],[14.5,-52]])B(x-.7,0,z-1.2,x+.7,1,z+1.2,'sandbag');
  // spawns behind the stalls, dummy places (they also keep the walking graph alive), sun, title camera
  MAP.spawns=[];for(const x of L)MAP.spawns.push([x+rr(-.4,.4),.7+rr(0,.5),0,0]);
  MAP.zspawns=RG_DUMMIES.map(d=>[d.x,d.z,0]);MAP.camps=[];MAP.spawnYaw=0;
  MAP.moon={d:new THREE.Vector3(.3,.82,.48).normalize(),c:new THREE.Color('#fff0dc'),i:.9};
  MAP.cam=(t,cam)=>{const a=Math.sin(t*.05);cam.position.set(a*7,3.4+Math.sin(t*.08)*.4,7.5);cam.lookAt(a*2,1.2,-30)}}
MAPDEFS.range={n:['사격장','Shooting Range'],d:['연습 전용. 지붕 덮인 사선 여섯 칸과 60 m 사거리, 거리별 좀비 더미와 좌우로 움직이는 표적. 무기 무료 · 탄약 무한.','Practice only. Six covered stalls, a 60 m range, zombie dummies at marked distances and two that walk across. Every weapon free, ammunition never runs out.'],
  env:{sky:1,sun:1,skyTex:'skyDay',halo:'#ffe6c4',rain:0,storm:0,fog:'#b6c2c8',fogD:.006,bloomThr:.9,ambOut:'#7e8a92',ambIn:'#525a60'},bounds:[-18,-66,18,11],probeY:[-.5,.9,2.4,3.9,5.4],mini:[2.5,5.6],
  tex:bakeRangeTex,build:buildRange,practice:1};

// ---------- the dummies ----------
// x, z: where it stands (facing the line); mv: walks across between x0 and x1 at a share of its top speed
const RG_DUMMIES=[{x:-10,z:-10,zc:'rager'},{x:-6,z:-20,zc:'rager'},{x:-2,z:-30,zc:'rager'},{x:2,z:-50,zc:'rager'},{x:6,z:-15,zc:'brute'},{x:10,z:-25,zc:'rager'},
  {x:-9,z:-17.5,zc:'runner',mv:[-11,11,.42]},{x:8,z:-36,zc:'rager',mv:[-11,11,.6]}];
const RANGE={on:false,move:true,st:null,el:null,uiT:0,
  newStats(){return {shots:0,hitShots:0,hits:0,hs:0,dmg:0,kills:0,burst:null,dps:0,last:null,ttk:null,t0:G.t}},
  begin(){const P=G.player;this.on=true;this.move=true;this.st=this.newStats();
    for(const d of RG_DUMMIES){const a=mkActor('',false,'guard');a.rg={d,resp:0,first:0};a.zpick=d.zc;a.bot=null;G.actors.push(a);this.raise(a,true)}
    if(P){P.money=999999;P.inv[1]=P.inv[1]||'kv47';fillAmmo(P,P.inv[1]);equip(P,P.inv[1],true);P.drawT=0;VM.set(P.cur,P.skin)}
    BO.next=1e9;SUP.next=1e9;G.st='fight';G.time=0;this.panel(true);
    HUD.announce(LI()?'SHOOTING RANGE':'사격장','w',2.4);HUD.note(LI()?'B: any weapon, free · K: reset the record · J: moving targets on/off':'B: 무기 무료 · K: 기록 초기화 · J: 이동 표적 켜기/끄기',6)},
  // (re)stand a dummy at its place, whole, facing the line
  raise(a,first){const d=a.rg.d;a.team=TZ;a.zc=a.zpick=d.zc;a.host=false;a.lvl=1;a.bombs=0;a.money=0;a.name=(LI()?'Dummy ':'더미 ')+Math.round(-d.z)+'m'+(d.mv?(LI()?' (moving)':' (이동)'):'');
    if(first){a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0};a.ammo={};a.cur=null;setHull(a);ensureRig(a);equip(a,'claw',true);a.alive=true;placeAt(a,d.x,0,d.z,Math.PI)}
    else{reviveZombie(a,[d.x,0,d.z]);a.yaw=Math.PI}
    a.permaDead=false;a.maxHp=a.hp=1000;a.armor=0;a.reviving=0;a.turning=0;a.rg.resp=0;a.rg.first=0;a.rg.dir=1;a.lastHurt=-9},
  update(dt){const P=G.player;G.time+=dt;
    if(P){P.money=999999;for(const id in P.ammo){const W=WPN[id];if(W&&P.ammo[id].res<W.res)P.ammo[id].res=W.res}}
    for(const a of G.actors){const R0=a.rg;if(!R0)continue;const d=R0.d;
      if(!a.alive){R0.resp-=dt;if(R0.resp<=0)this.raise(a,false);continue}
      // whole again a moment after the last hit
      if(a.hp<a.maxHp&&G.t-a.lastHurt>2.5){a.hp=Math.min(a.maxHp,a.hp+a.maxHp*dt*3);if(a.hp>=a.maxHp)R0.first=0}
      // face the line; walkers go back and forth, the others walk back to their mark when shoved off it
      const c=a.c;let tx=d.x,tz=d.z,sp=.5;if(d.mv&&this.move){tx=R0.dir>0?d.mv[1]:d.mv[0];sp=d.mv[2];if(Math.abs(c.x-tx)<.4)R0.dir=-R0.dir}
      a.yaw=P?Math.atan2(-(P.c.x-c.x),-(P.c.z-c.z)):Math.PI;a.pitch=0;
      const dx=tx-c.x,dz=tz-c.z,dl=Math.hypot(dx,dz);a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=a.cmd.jump=a.cmd.skill=false;
      if(dl>(d.mv&&this.move?.05:.3)){const wx=dx/dl*sp,wz=dz/dl*sp,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);a.cmd.f=wx*fx+wz*fz;a.cmd.s=wx*rx+wz*rz}}
    // damage per second: one burst runs while hits keep coming (a gap over 1.2 s starts a new one)
    const S=this.st,B0=S.burst;if(B0&&G.t-B0.last>1.2)S.burst=null;
    this.uiT-=dt;if(this.uiT<=0){this.uiT=.1;this.draw()}},
  // ---- the record ----
  shot(W,hit){const S=this.st;if(!S)return;S.shots++;if(hit)S.hitShots++},
  hit(t,dealt,o){const S=this.st;if(!S||!(dealt>0))return;const P=G.player,W=WPN[o.w]||WPN[P.cur]||{};
    S.hits++;S.dmg+=dealt;if(o.hs)S.hs++;
    const B0=S.burst||(S.burst={t0:G.t,dmg:0,last:G.t,iv:W.rpm?60/W.rpm:(W.rate?W.rate[0]:.5)});B0.dmg+=dealt;B0.last=G.t;S.dps=B0.dmg/Math.max(B0.iv,B0.last-B0.t0+B0.iv);
    const e=actorEye(P),hx=o.x!=null?o.x:t.c.x,hy=o.y!=null?o.y:t.c.y+1,hz=o.z!=null?o.z:t.c.z;const dist=Math.hypot(hx-e.x,hy-e.y,hz-e.z);
    const part=o.hs?'head':(hy-t.c.y)<(t.c.h||1.8)*.45?'legs':'body';
    // hits landing in the same instant (a shotgun's pellets) add up into one "last hit"
    const L=S.last;if(L&&L.t===G.t&&L.who===t){L.dmg+=dealt;if(o.hs)L.part='head';L.n++}else S.last={t:G.t,who:t,dmg:dealt,part,dist,n:1,w:o.w};
    if(t.rg&&!t.rg.first)t.rg.first=G.t},
  kill(t){const S=this.st;if(!S)return;S.kills++;if(t.rg&&t.rg.first)S.ttk=G.t-t.rg.first+(S.burst?S.burst.iv:0)},
  reset(){this.st=this.newStats();HUD.note(LI()?'Record cleared':'기록 초기화',1.4);AU.play('ui',{vol:.4});this.draw()},
  toggleMove(){this.move=!this.move;HUD.note(this.move?(LI()?'Moving targets: on':'이동 표적: 켜짐'):(LI()?'Moving targets: off':'이동 표적: 꺼짐'),1.6);AU.play('ui',{vol:.4})},
  // ---- the panel ----
  panel(on){let el=this.el;if(on&&!el){el=this.el=document.createElement('div');el.id='hRange';$('hud').appendChild(el)}if(el)el.style.display=on?'block':'none'},
  draw(){const el=this.el,S=this.st,P=G.player;if(!el||!S||!P)return;const L=LI(),W=WPN[P.cur];
    const pct=(a,b)=>b>0?Math.round(a/b*100)+'%':'—',pn={head:L?'head':'머리',body:L?'body':'몸통',legs:L?'legs':'다리'};
    const gun=W&&W.kind!=='melee'&&W.kind!=='nade',acc=W&&W.proj?'—':pct(S.hitShots,S.shots);
    const ls=S.last?`<b>${Math.round(S.last.dmg)}</b> · ${pn[S.last.part]}${S.last.n>1?' ×'+S.last.n:''} · ${S.last.dist.toFixed(1)} m`:'—';
    const h=`<div class="rgT">${L?'SHOOTING RANGE':'사격장'}<small>${W?esc(W.n[L]):''}</small></div>
      <div class="rgR"><span>DPS</span><b class="big">${S.burst||S.dps?Math.round(S.dps):'—'}</b></div>
      <div class="rgR"><span>${L?'Accuracy':'명중률'}</span><b>${gun?acc:'—'}</b><small>${gun&&!(W&&W.proj)?S.hitShots+' / '+S.shots:''}</small></div>
      <div class="rgR"><span>${L?'Headshots':'헤드샷'}</span><b>${pct(S.hs,S.hits)}</b></div>
      <div class="rgR"><span>${L?'Last hit':'최근 피해'}</span><b>${ls}</b></div>
      <div class="rgR"><span>${L?'Kills':'처치'}</span><b>${S.kills}</b><small>${S.ttk!=null?'TTK '+S.ttk.toFixed(2)+'s':''}</small></div>
      <div class="rgR"><span>${L?'Damage':'총 피해'}</span><b>${Math.round(S.dmg).toLocaleString('en-US')}</b></div>
      <div class="rgK"><kbd>B</kbd>${L?'weapons':'무기'} <kbd>K</kbd>${L?'reset':'초기화'} <kbd>J</kbd>${L?'movers':'이동 표적'} ${this.move?'ON':'OFF'}</div>`;
    if(el.innerHTML!==h)el.innerHTML=h},
  end(){this.on=false;this.panel(false);this.st=null}};

// ---------- hooks into the game ----------
(function(){
  // starting: the player and no bots, then the range instead of a round
  const sr=startRound;startRound=function(plan){if(G.mode!=='range')return sr(plan);
    const P=G.player;dropsClear();G.round=1;G.st='fight';G.time=0;G.spec=null;G.deathCam=0;G.winner=-1;clearNades();NY.clear();FX.clearLimbs();FX.clearDecals();
    if(P){const p=MAP.spawns[2]||[0,.8,0,0];P.team=TH;P.alive=true;P.hp=P.maxHp=100;P.armor=100;P.permaDead=false;giveDefault(P);placeAt(P,p[0],p[2]||0,p[1],0);ensureRig(P);equip(P,bestWeapon(P),true);P.drawT=0;VM.set(P.cur,P.skin);R.PU.uInfect.value=0}
    HUD.resOff&&HUD.resOff();HUD.feedL=[];HUD.el.hFeed.innerHTML='';HUD.clearDmg&&HUD.clearDmg();AU.muSet&&AU.muSet('calm');RANGE.begin()};
  // the record: shots, hits, kills by the player
  const fg=fireGun;fireGun=function(a,W){if(G.mode!=='range'||!a.isPlayer)return fg(a,W);RANGE.inShot=true;RANGE.shotHit=false;try{fg(a,W)}finally{RANGE.inShot=false}RANGE.shot(W,RANGE.shotHit)};
  const da=damageActor;damageActor=function(t,dmg,src,o){const r=da(t,dmg,src,o);if(G.mode==='range'&&src&&src.isPlayer){src.money=999999;if(r>0){if(RANGE.inShot)RANGE.shotHit=true;RANGE.hit(t,r,o||{})}}return r};
  const kz=killZombie;killZombie=function(t,src,o){kz(t,src,o);if(G.mode!=='range'||!t.rg)return;t.permaDead=true;t.respawnT=1e9;t.rg.resp=2;if(src&&src.isPlayer){src.money=999999;RANGE.kill(t)}};
  // the top bar: the time spent on the range instead of a round clock
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);if(G.mode!=='range'||!this.el.hRound)return;const e=this.el,L=LI(),tm=Math.floor(G.time);
    e.hRound.textContent=L?'SHOOTING RANGE':'사격장';e.hTime.textContent=Math.floor(tm/60)+':'+String(tm%60).padStart(2,'0');e.hTime.className=''};
  // leaving
  const tt=Main.toTitle.bind(Main);Main.toTitle=function(){RANGE.end();return tt()};
  // keys (only on the range, while playing)
  addEventListener('keydown',e=>{if(G.mode!=='range'||!RANGE.on||G.st==='menu'||Main.paused||Main.overlay||e.repeat)return;if(e.code==='KeyK')RANGE.reset();else if(e.code==='KeyJ')RANGE.toggleMove()});
})();
// the lobby card and the start
Main.startRange=async function(){AU.init();if(MAP.id!=='range'){await loadMapUI('range');if(MAP.id!=='range')return}this.clearDemo();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);
  startMatch({mode:'range',bots:0,diff:0,rounds:1,time:0,skin:CFG.skin,zclass:CFG.zclass,money:999999,name:T('you')});
  HUD.show(true);this.paused=false;this.overlay=null;this.lock();window.onbeforeunload=null};

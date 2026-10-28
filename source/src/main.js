'use strict';
// ============ Boot, input, camera and the frame loop ============
function applyCfg(){if(R.ok){R.setScale(CFG.scale);R.setFov(CFG.fov);R.bloom=CFG.bloom!==false;R.shadowsOn=CFG.shadow!==false}R.PU&&(R.PU.uGamma.value=CFG.gamma);AU.vol=CFG.vol;AU.musicOn=CFG.music;AU.apply();GORE.set(CFG.gore)}
const Main={keys:{},ml:false,mr:false,locked:false,lockFail:false,lockAsked:0,overlay:null,paused:false,last:0,dtAvg:16,mx:0,my:0,boardOn:false,demo:[],shakeP:0,shakeY:0,camT:0,specCam:new THREE.Vector3(),fpsT:0,
  async boot(){const step=async(t,p)=>{$('loadT').textContent=t;$('loadFill').style.width=(p*100)+'%';await new Promise(r=>setTimeout(r,16))};
    try{cfgFix()}catch(e){console.error(e)}
    try{
      await step(T('lTex'),.05);bakeTextures();paintGunAtlas();paintNYAtlas();paintSupAtlas();paintSkAtlas();paintSalAtlas();paintKkAtlas();paintCgAtlas();
      if(!R.init($('cv'))){$('loadT').textContent='WebGL is not available on this device.';return}
      {const an=Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1);for(const k in TEX)TEX[k].anisotropy=an}
      buildSky(R.scene);{const g=MAP.gen=mapLoader(MAPDEFS[CFG.map]?CFG.map:'q7');let p=.15;for(;;){const r=g.next();if(r.done)break;p+=.15;await step(T(r.value),p)}MAP.gen=null}
      FX.init(R.scene);VM.init();mapEnv();
      {const keys=[...HSKINS.map(k=>'h_'+k),...ZLIST.flatMap(z=>['z_'+z,'z_'+z+'_h'])];for(let i=0;i<keys.length;i++){await step(T('lChar'),.7+.2*i/keys.length);charAsset(keys[i])}}
      await step(T('lChar'),.9);applyCfg();HUD.init();UI.init();UI.buildPause();
      this.setupInput();this.menuDemo();
      // warm up shaders once
      R.cam.position.set(0,6,20);R.cam.rotation.set(-.2,0,0);R.cam.updateMatrixWorld();
      LU.uSpotP.value.copy(R.cam.position);LU.uSpotD.value.set(0,-.2,-1).normalize();LU.uSpotK.value.w=1;R.render();LU.uSpotK.value.w=0;// compiles the shadow pass too
      MIXC.clear();VN_T.clear();_vnK=-1;_vnT=null;_fbC.length=0;// painting caches are not needed after boot
      await step('',1);$('load').classList.add('off');UI.show('menu');
      window.__ready=true;
      AU.prepare().catch(e=>console.warn(e));
      requestAnimationFrame(t=>{this.last=t;this.frame(t)})
    }catch(e){ERRLOG.report(e,'boot');console.error(e);$('loadT').textContent='Error: '+e.message;window.__err=String(e.stack||e)}},
  // ---------- title-screen backdrop: a few infected wandering the yard ----------
  menuDemo(){this.clearDemo();FX.clearLimbs();G.st='menu';G.actors=[];for(let i=0;i<6;i++){const a=mkActor('z'+i,false,'guard');a.zpick=rpick(ZLIST);a.zc=a.zpick;a.bot=AI.mk(a);a.team=TZ;a.alive=true;a.lvl=1;
      const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];placeAt(a,n.x,n.y,n.z,rr(0,TAU));ensureRig(a);a.cur='claw';G.actors.push(a);this.demo.push(a)}
    HUD.show(false);LU.uSpotK.value.w=0},
  clearDemo(){for(const a of this.demo){for(const k in a.rigs)R.scene.remove(a.rigs[k].grp)}this.demo=[]},
  demoUpdate(dt){for(const a of this.demo){a.cmd.f=a.cmd.s=0;a.cmd.jump=false;AI.wander(a,dt);a.cmd.f*=.45;a.cmd.s*=.45;actorPhysics(a,dt);Object.assign(a.pc,a.cmd);
      a.bot.growlT-=dt;if(a.bot.growlT<=0){a.bot.growlT=rr(4,10);AU.at('zgrowl',a.c.x,a.c.y+1.5,a.c.z,{vol:.5,range:30})}}},
  // (a scenario set to an episode plays on the episode's map: epMapOf, episode.js)
  async startGame(){AU.init();const mid=epMapOf(CFG);if(MAP.id!==mid){await loadMapUI(mid);if(MAP.id!==mid)return}this.clearDemo();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);
    startMatch({mode:CFG.mode,ep:CFG.mode==='scen'?epSel(CFG):0,bots:CFG.mode==='scen'?(CFG.scBots??3):CFG.bots,diff:CFG.diff,rounds:CFG.rounds,time:CFG.time,skin:CFG.skin,zclass:CFG.zclass,blackout:CFG.blackout??1,name:T('you')});
    HUD.show(true);this.paused=false;this.overlay=null;this.lock();window.onbeforeunload=e=>{if(G.st!=='menu'&&G.st!=='over'){e.preventDefault();e.returnValue='';return ''}}},
  toTitle(){if(NET.on)NET.leave();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);G.actors=[];G.player=null;clearNades();NY.clear();FX.clearDecals();this.closeOverlay(true);this.paused=false;
    R.PU.uNV.value=0;R.PU.uZ.value=0;R.PU.uDeath.value=0;R.PU.uInfect.value=0;R.vmVisible=false;window.onbeforeunload=null;AU.stopAll('countdown');this.menuDemo();UI.buildTitle();UI.show('menu');AU.muSet&&AU.muSet('calm')},
  pause(){if(G.st==='menu'||G.st==='over'||this.paused)return;this.paused=true;this.pausedAt=performance.now();this.closeOverlay(true);UI.buildPause();UI.show('pause')},
  resume(){UI.hideAll();this.paused=false;this.lock()},
  // v6.63: raw mouse input where the browser has it (unadjustedMovement: Chrome and Edge on Windows / Mac) — no OS acceleration and none of
  // the jumps the cursor-based movement throws in on a fast flick (they spun the view round); the plain lock elsewhere. One request at a time
  lock(){const c=$('cv');if(this.lockFail||(this.lockPend&&performance.now()-(this.lockPendAt||0)<2000)||document.pointerLockElement===c)return;if(!c.requestPointerLock){this.onLockFail(true);return}
    const fail=e=>{this.lockPend=false;this.onLockFail(e)};
    const plain=()=>{this.rawMv=false;let p;try{p=c.requestPointerLock()}catch(e){fail(e);return}if(p&&p.then){this.lockPend=true;this.lockPendAt=performance.now();p.then(()=>{this.lockPend=false},fail)}};
    if(this.rawOk===false){plain();return}
    let p;try{p=c.requestPointerLock({unadjustedMovement:true})}catch(e){this.rawOk=false;plain();return}
    if(!(p&&p.then)){this.rawOk=false;this.rawMv=false;return}// (no promise: the options are not understood, the plain lock is on its way)
    this.lockPend=true;this.lockPendAt=performance.now();p.then(()=>{this.lockPend=false;this.rawOk=true;this.rawMv=true},e=>{this.lockPend=false;if(e&&e.name==='NotSupportedError'){this.rawOk=false;plain()}else this.onLockFail(e)})},
  unlock(){if(document.pointerLockElement)try{document.exitPointerLock()}catch(e){}},
  // a refused request (clicked again within a second of Esc, the window not focused yet) is not the end of pointer lock: a note, and the next
  // click asks again. Turning at the screen edges (lockFail) only where pointer lock is not there (e true) or never once worked in four tries
  // (a frame that may not lock) — before v6.63 the first refusal switched it on for good, and a quick flick then spun the view at the edge
  onLockFail(e){if(this.lockFail)return;const t=performance.now();if(t-(this.lockFailAt||0)<300)return;this.lockFailAt=t;this.lockFails=(this.lockFails||0)+1;
    if(e===true||(this.lockFails>=4&&!this.lockedOnce)){this.lockFail=true;HUD.note(T('noLock'),6);return}
    if(G.st!=='menu'&&G.st!=='over')HUD.note(T('relock'),3)},
  // ---------- overlays during play ----------
  openOverlay(k){if(this.overlay===k){this.closeOverlay();return}this.closeOverlay(true);const P=G.player;if(!P)return;
    if(k==='buy'){if(P.team!==TH||!P.alive){HUD.note(T('zOnly'));return}UI.buyStage=0;UI.renderBuy();$('buy').classList.remove('off')}
    if(k==='zsel'){UI.renderZsel();$('zsel').classList.remove('off')}
    this.overlay=k;this.unlock()},
  closeOverlay(silent){if(!this.overlay)return;$('buy').classList.add('off');$('zsel').classList.add('off');this.overlay=null;if(!silent&&!this.paused)this.lock()},
  // free: the same check runs here and on the host (loadout.js buyCheck); a gun already in the bag is simply taken in hand
  buyItem(id){const P=G.player;if(!P)return;const W=WPN[id],why=buyCheck(P,id);
    if(why==='own'&&W&&W.kind!=='nade'){if(P.cur!==id)equip(P,id);if(W.slot<=2)this.closeOverlay();return}
    if(why){ldWhy(why,id);return}
    if(NET.cli){ldAsk(P,id,null);if(W&&W.slot<=2)this.closeOverlay();return}
    if(buy(P,id)){UI.renderBuy();if(W&&W.slot<=2)this.closeOverlay()}else ldWhy('na',id)},
  pickZ(k){const P=G.player;P.zpick=k;CFG.zclass=k;saveCfg();UI.renderZsel();AU.play('uiok',{vol:.4});setTimeout(()=>this.closeOverlay(),150)},
  // ---------- input ----------
  setupInput(){const cv=$('cv');
    document.addEventListener('pointerlockchange',()=>{this.locked=document.pointerLockElement===cv;this.lockAt=performance.now();$('app').classList.toggle('locked',this.locked);
      if(this.locked){this.lockFails=0;this.lockedOnce=true;this.lockPend=false}
      if(!this.locked&&G.player&&G.st!=='menu'&&G.st!=='over'&&!this.overlay&&!this.paused)this.pause()});
    document.addEventListener('pointerlockerror',()=>{this.lockPend=false;this.onLockFail()});
    cv.addEventListener('mousedown',e=>{AU.init();if(G.st==='menu'||G.st==='over'||this.paused)return;if(!this.locked&&!this.lockFail&&!this.overlay){this.lock();return}
      if(e.button===0)this.ml=true;if(e.button===2)this.mr=true;
      if(e.button===0&&KC.on){KC.skip();return}if(e.button===0&&this.specOn())this.specClick()});
    addEventListener('mouseup',e=>{if(e.button===0)this.ml=false;if(e.button===2)this.mr=false});
    addEventListener('contextmenu',e=>{if(G.st!=='menu')e.preventDefault()});
    addEventListener('mousemove',e=>{this.mx=e.clientX;this.my=e.clientY;if(!G.player||this.paused||G.st==='menu'||G.st==='over')return;if(!this.locked&&!this.lockFail)return;if(this.overlay&&!this.locked)return;
      const P=G.player;if(!P.alive&&!(this.fc&&this.specOn()))return;
      // the first moments after the lock engages can carry a stale jump: skipped. Raw input (rawMv) is taken as it comes, bar the absurd; the
      // browser's own movement can throw in a jump when it warps the cursor back: one event far bigger than the recent motion and against it, or
      // past 900, is dropped — never two in a row, so a real flick back loses one frame at most (before v6.63: anything past 500, both ways)
      const t=performance.now();if(t-(this.lockAt||0)<150)return;const dx=e.movementX||0,dy=e.movementY||0,ax=Math.abs(dx),ay=Math.abs(dy);if(ax>2500||ay>2500)return;
      if(t-(this.mvT||0)>120){this.mvMag=0;this.mvDX=0;this.mvDY=0}this.mvT=t;
      if(this.locked&&!this.rawMv){const m=Math.max(180,(this.mvMag||0)*5);
        if(!this.mvDrop&&(ax>900||ay>900||(ax>m&&dx*(this.mvDX||0)<0)||(ay>m&&dy*(this.mvDY||0)<0))){this.mvDrop=true;return}}
      this.mvDrop=false;this.mvMag=(this.mvMag||0)*.75+Math.max(ax,ay)*.25;this.mvDX=(this.mvDX||0)*.6+dx*.4;this.mvDY=(this.mvDY||0)*.6+dy*.4;
      if(!P.alive){const F=this.fc,k0=CFG.sens*.0022;F.yaw=wrapA(F.yaw-dx*k0);F.pitch=clamp(F.pitch-(CFG.invert?-1:1)*dy*k0,-1.53,1.53);return}
      const Wz=WPN[P.cur];const z=P.zoom>0&&Wz&&Wz.zoom?Wz.zoom[P.zoom-1]/CFG.fov:1;const k=CFG.sens*.0022*z;
      P.yaw=wrapA(P.yaw-dx*k);P.pitch=clamp(P.pitch-(CFG.invert?-1:1)*dy*k,-1.53,1.53)});
    addEventListener('wheel',e=>{const P=G.player;if(!P||!P.alive||this.paused||this.overlay||G.st==='menu')return;const order=P.team===TZ?['claw','zbomb']:[P.inv[1],P.inv[2],P.inv[3]||'knife',...H_NADES.filter(k=>P.inv[k]>0)].filter(Boolean);
      if(P.team===TZ&&P.bombs<=0)return;const i=order.indexOf(P.cur);const n=order[(i+(e.deltaY>0?1:-1)+order.length)%order.length];equip(P,n)},{passive:true});
    // v6.62: Ctrl+R (Cmd+R, with or without Shift) never reloads the page — Ctrl is crouch and R reloads, so the two together used to
    // reload the whole game. Caught first (capture) and everywhere, chat and the other text fields too; F5 and the browser's button still reload
    addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&(e.code==='KeyR'||e.key==='r'||e.key==='R'))e.preventDefault()},true);
    addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;const k=e.code;
      if(e.altKey&&(k==='Enter'||k==='NumpadEnter')){e.preventDefault();if(!e.repeat)FS.toggle();return}if(['Tab','Space','ArrowUp','ArrowDown','Backquote'].includes(k)||e.ctrlKey)e.preventDefault();AU.init();
      if(e.repeat&&k!=='Tab')return;this.keys[k]=true;const P=G.player;
      if(G.st==='menu'||G.st==='over'){if(k==='Escape'&&UI.open&&UI.open!=='menu'&&UI.open!=='results')UI.act('back');return}
      if(k==='Escape'){if(this.overlay){this.closeOverlay();return}
        // the same Esc press that released the mouse lock must not also close the pause menu again
        if(performance.now()-(this.lockAt||0)<350||performance.now()-(this.pausedAt||0)<350){if(!this.paused)this.pause();return}
        if(this.paused){if(UI.open==='pause')this.resume();else UI.act('back');return}this.pause();return}
      if(this.paused)return;
      if(this.overlay==='buy'&&e.shiftKey&&/^Digit[1-3]$/.test(k)){ldEquipSet(+k[5]-1);return}// Shift+1-3: put a saved set on
      if(this.overlay==='buy'){let n=+k.replace('Digit','').replace('Numpad','');if(k==='Digit0'||k==='Numpad0')n=10;if(n>=1&&n<=10){if(UI.buyStage===0){if(n<=BUY_MENU.length){UI.buyCat=n-1;UI.buyStage=1;UI.renderBuy()}}else{const it=BUY_MENU[UI.buyCat].items[n-1];if(it)this.buyItem(it);UI.buyStage=0}return}if(k==='KeyB'){this.closeOverlay();return}}
      if(this.overlay==='zsel'){const n=+k.replace('Digit',''),i=n===0?9:n-1;if(/^Digit\d$/.test(k)&&i<ZLIST.length){this.pickZ(ZLIST[i]);return}if(k==='KeyM'){this.closeOverlay();return}}
      if(!P)return;
      if(KC.on&&(k==='Space'||k==='KeyV')){KC.skip();return}// (Enter opens the chat, chat.js — a word while you are down)
      if(k==='KeyV'&&!P.alive)this.toggleFree();
      if(k==='Tab'){this.boardOn=true;UI.board(true)}
      if(k==='KeyB')this.openOverlay('buy');
      if(k==='KeyM')this.openOverlay('zsel');
      if(k==='KeyH'){this.pause();UI.ret='pause';UI.buildHelp();UI.show('help')}
      if(!P.alive)return;
      if(k.startsWith('Digit')){const n=+k.slice(5);if(n>=1&&n<=4)P.cmd.slot=n;else if((n===5||n===6)&&!this.overlay)P.cmd.hsk=n===5?'sp':'ds'}
      if(k==='KeyQ')P.cmd.lastInv=true;
      if(k==='KeyF'&&P.team===TH){P.flash=!P.flash;AU.play('ui',{vol:.35,rate:.6})}
      if(k==='KeyN'&&P.team===TZ){P.nv=!P.nv;AU.play('ui',{vol:.35,rate:.5})}});
    addEventListener('keyup',e=>{this.keys[e.code]=false;if(e.code==='Tab'){this.boardOn=false;UI.board(false)}});
    addEventListener('blur',()=>{this.keys={};this.ml=this.mr=false;if(this.boardOn){this.boardOn=false;UI.board(false)}})},
  // burning barrels: flames, embers and smoke plus a flickering light
  fires(dt){
    // smouldering wrecks and exhausts: thin smoke only
    for(const f of MAP.smoke){if(Math.random()<dt*5&&Math.hypot(f[0]-R.cam.position.x,f[2]-R.cam.position.z)<45)FX.spawn({x:f[0]+rr(-.3,.3),y:f[1],z:f[2]+rr(-.3,.3),vx:rr(-.15,.15),vy:rr(.5,1),vz:rr(-.15,.15),life:rr(2.5,4),s0:.3,s1:1.5,r:.14,g:.13,b:.13,a:.4,f:2,drag:.3,fadeIn:.4,lit:1})}
    // fountains: a thin spray falling back into the basin
    for(const f of MAP.spray){if(Math.hypot(f[0]-R.cam.position.x,f[2]-R.cam.position.z)<35)for(let i=0;i<3;i++)if(Math.random()<dt*22)FX.spawn({x:f[0]+rr(-.05,.05),y:f[1],z:f[2]+rr(-.05,.05),vx:rr(-.7,.7),vy:rr(1.4,2.4),vz:rr(-.7,.7),life:rr(.7,1.1),s0:.05,s1:.03,r:.75,g:.85,b:.95,a:.75,f:4,grav:9,lit:1})}
    if(!MAP.fires.length)return;if(!this.fireL){this.fireL=MAP.fires.map(f=>DL.add(f[0],f[1]+.5,f[2],'#ff8a3a',8,1.3,0,{flick:.35,fire:1}))}
    for(const f of MAP.fires){const near=Math.hypot(f[0]-R.cam.position.x,f[2]-R.cam.position.z)<40;if(!near)continue;
      if(Math.random()<dt*30)FX.spawn({x:f[0]+rr(-.2,.2),y:f[1],z:f[2]+rr(-.2,.2),vx:rr(-.2,.2),vy:rr(.8,1.6),vz:rr(-.2,.2),life:rr(.35,.6),s0:.35,s1:.12,r:1,g:rr(.45,.7),b:.2,f:11,add:1});
      if(Math.random()<dt*6)FX.spawn({x:f[0]+rr(-.1,.1),y:f[1]+.5,z:f[2]+rr(-.1,.1),vx:rr(-.3,.3),vy:rr(.8,1.4),vz:rr(-.3,.3),life:rr(2,3.5),s0:.25,s1:1.2,r:.16,g:.15,b:.14,a:.5,f:2,drag:.4,fadeIn:.3});
      if(Math.random()<dt*4)FX.spawn({x:f[0],y:f[1]+.2,z:f[2],vx:rr(-.6,.6),vy:rr(2,4),vz:rr(-.6,.6),life:rr(.8,1.6),s0:.04,s1:.02,r:1,g:.6,b:.2,f:0,grav:-.5,drag:1,add:1})}},
  // spectating: the player is down for good (or a human down in the scenario) and the death cam is over. (deathCam counts down past 0,
  // so it is compared, never tested for 0: a left click that checked !G.deathCam never moved on to the next player)
  specOn(){const P=G.player;return !!P&&!P.alive&&G.st!=='menu'&&G.deathCam<=0&&(P.permaDead||P.team===TH)},
  // the next one after the one watched now (the list changes as people die and rise)
  nextSpec(){const L=G.actors.filter(a=>a.alive&&!a.isPlayer);if(!L.length){G.spec=null;return}G.specIdx=(L.indexOf(G.spec)+1)%L.length;G.spec=L[G.specIdx]},
  // v7.1 free camera: while spectating, V (the V button on touch) lets the camera fly loose — WASD along the view (Space up, C / Ctrl down, Shift fast),
  // the mouse looks, walls stop it; V or a click goes back to following someone. this.fc = {x,y,z,yaw,pitch} while it is on
  toggleFree(){if(this.fc){this.fc=null;return}if(!this.specOn())return;const cam=R.cam,fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);
    this.fc={x:cam.position.x,y:cam.position.y,z:cam.position.z,yaw:Math.atan2(-fw.x,-fw.z),pitch:clamp(Math.asin(clamp(fw.y,-1,1)),-1.5,1.5)};AU.play('ui',{vol:.3,rate:.8})},
  specClick(){if(this.fc){this.fc=null;return}this.nextSpec()},
  freeMove(dt){const F=this.fc,k=this.keys;let f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0),s=(k.KeyD?1:0)-(k.KeyA?1:0),u=(k.Space?1:0)-(k.KeyC||k.ControlLeft||k.ControlRight?1:0);
    if(typeof TOUCH!=='undefined'&&TOUCH.on){const m=TOUCH.mv,l=Math.hypot(m.x,m.y);if(l>.1){const q=Math.min(1,(l-.1)/.75)/l;f=-m.y*q;s=m.x*q}}
    if(k.ArrowLeft)F.yaw+=dt*2.4;if(k.ArrowRight)F.yaw-=dt*2.4;
    if(!f&&!s&&!u)return;const sp=(k.ShiftLeft||k.ShiftRight?26:10)*dt,cp=Math.cos(F.pitch),fx=-Math.sin(F.yaw)*cp,fy=Math.sin(F.pitch),fz=-Math.cos(F.yaw)*cp,rx=Math.cos(F.yaw),rz=-Math.sin(F.yaw);
    const mx=(fx*f+rx*s)*sp,my=(fy*f+u)*sp,mz=(fz*f+rz*s)*sp,bb=MAP.bounds||[-300,-300,300,300];
    // a wall in the way stops that step; the other axes still slide
    const go=(ax,ay,az)=>{const L=Math.hypot(ax,ay,az);if(L<1e-5)return;const h=rayCast(F.x,F.y,F.z,ax/L,ay/L,az/L,L+.3);if(h&&h.t<L+.3)return;F.x+=ax;F.y+=ay;F.z+=az};
    go(mx,0,0);go(0,my,0);go(0,0,mz);
    F.x=clamp(F.x,bb[0]-2,bb[2]+2);F.z=clamp(F.z,bb[1]-2,bb[3]+2);F.y=clamp(F.y,.4,90)},
  playerCmd(dt){const P=G.player,k=this.keys,c=P.cmd;if(!P.alive){if(this.fc&&this.specOn())this.freeMove(dt);return}const free=!this.overlay||this.overlay;
    c.f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0);c.s=(k.KeyD?1:0)-(k.KeyA?1:0);c.jump=!!k.Space;c.duck=!!(k.KeyC||k.ControlLeft||k.ControlRight);c.walk=!!(k.ShiftLeft||k.ShiftRight);
    const canShoot=!this.overlay||this.locked;c.fire=this.ml&&canShoot;c.alt=this.mr&&canShoot;c.reload=!!k.KeyR;c.skill=!!(k.KeyG||k.KeyE);c.drop=!!k.KeyG;
    if(k.ArrowLeft)P.yaw+=dt*2.4;if(k.ArrowRight)P.yaw-=dt*2.4;
    // without pointer lock: turn while the cursor rests near the screen edge
    if(this.lockFail&&!this.overlay&&!this.paused){const ex=this.mx/innerWidth;if(ex<.06)P.yaw+=dt*2.6*(1-ex/.06);else if(ex>.94)P.yaw-=dt*2.6*((ex-.94)/.06);const ey=this.my/innerHeight;if(ey<.06)P.pitch=Math.min(1.5,P.pitch+dt*1.5);else if(ey>.94)P.pitch=Math.max(-1.5,P.pitch-dt*1.5)}},
  // ---------- camera ----------
  camera(dt){const cam=R.cam,P=G.player;FX.shake=Math.max(0,FX.shake-dt*1.6);const sh=FX.shake*FX.shake;
    this.shakeP=(Math.random()*2-1)*sh*.06;this.shakeY=(Math.random()*2-1)*sh*.06;
    let fov=CFG.fov;R.vmVisible=false;if(this.fc&&(!P||P.alive||G.st==='menu'||!this.specOn()))this.fc=null;
    if(KC.on)fov=KC.cam(dt,cam);
    else if(G.st==='menu'||!P){this.camT+=dt;if(MAP.cam)MAP.cam(this.camT,cam);else{cam.position.set(0,6,20);cam.lookAt(0,1.5,0)}LU.uSpotK.value.w=0;R.PU.uZ.value=0;R.PU.uNV.value=0;R.PU.uDeath.value=0}
    else if(P.alive&&!G.spec){const e=actorEye(P);
      // smooth crouch transitions, a light head bob, a dip on landing, a lean into strafes and the roll of melee strokes
      const eh=e.y-P.c.y;this.eyeOff=this.eyeOff==null||Math.abs(this.eyeOff-eh)>1?eh:lerp(this.eyeOff,eh,1-Math.exp(-dt*14));
      const an=P.an||{};const bobA=P.c.onGround?clamp(Math.hypot(P.c.vx,P.c.vz)/5,0,1.2):0,ph=P.stepPh||0,spr=an.spr||0;
      const bobY=-Math.abs(Math.sin(ph))*.016*bobA*(1+spr*.5),bobR=Math.sin(ph)*.0035*bobA*(1+spr),dip=(an.land||0)*.07;
      cam.position.set(e.x,P.c.y+this.eyeOff+bobY-dip,e.z);const roll=(P.dizzy>0?Math.sin(G.t*2.3)*P.dizzy*.04:0)+bobR-(an.mvS||0)*.0035+VM.camRoll;
      cam.rotation.set(P.pitch+P.punchP*.6+this.shakeP+VM.camPitch,P.yaw+P.punchY*.6+this.shakeY+VM.camYaw,roll,'YXZ');
      const Wz=WPN[P.cur];if(P.zoom>0&&Wz&&Wz.zoom)fov=Wz.zoom[Math.min(P.zoom,Wz.zoom.length)-1];R.vmVisible=P.zoom<=0;
      R.PU.uDeath.value=Math.max(0,R.PU.uDeath.value-dt*2)}
    else{// death cam, then spectate
      if(G.deathCam>0)G.deathCam-=dt;let tgt=P;
      if(this.fc&&this.specOn()){const F=this.fc;cam.position.set(F.x,F.y,F.z);cam.rotation.set(F.pitch+this.shakeP,F.yaw+this.shakeY,0,'YXZ');R.PU.uDeath.value=Math.max(0,R.PU.uDeath.value-dt*2)}else{
      if(G.deathCam<=0&&(P.permaDead||P.team===TH)){if(!G.spec||!G.spec.alive)this.nextSpec();if(G.spec)tgt=G.spec}
      if(!P.alive&&tgt===P)R.PU.uDeath.value=Math.min(.55,R.PU.uDeath.value+dt);else R.PU.uDeath.value=Math.max(0,R.PU.uDeath.value-dt*2);
      const hx=tgt.c.x,hy=tgt.c.y+(tgt.alive?1.6:.4),hz=tgt.c.z;const back=tgt===P?3.2:3.4;const yaw=tgt===P?P.yaw+G.t*.15:tgt.yaw;
      let dx=Math.sin(yaw)*back,dz=Math.cos(yaw)*back,dy=tgt===P?2.2:.7;const L=Math.hypot(dx,dy,dz);const h=rayCast(hx,hy,hz,dx/L,dy/L,dz/L,L);const k=h?Math.max(.15,(h.t-.25)/L):1;
      this.specCam.set(hx+dx*k,hy+dy*k,hz+dz*k);cam.position.lerp(this.specCam,1-Math.exp(-dt*8));cam.lookAt(hx,hy,hz)}}
    if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix()}
    cam.updateMatrixWorld();
    // listener
    AU.L.x=cam.position.x;AU.L.y=cam.position.y;AU.L.z=cam.position.z;const fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);AU.L.yaw=Math.atan2(-fw.x,-fw.z);AU.listen(cam)},
  // ---------- lights & post per frame ----------
  look(dt){const P=G.player;const PU=R.PU;
    // the flashlight rides the gun: a little right of and below the eye, aimed to cross the line of sight ~7 m out, so its shadows show beside things
    // in a blackout it shines brighter and further (26 → 32 m)
    let beam=0;const bk=this.boK=approach(this.boK||0,BO.on&&G.st!=='menu'?1:0,dt*1.5),rng=26+6*bk;LU.uSpotK.value.z=rng;
    if(P&&G.st!=='menu'&&P.alive&&!G.spec&&P.team===TH&&P.flash){const e=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
      const sp=LU.uSpotP.value.set(e.x+_dv.x*.3+rx*.15,e.y-.15+_dv.y*.3,e.z+_dv.z*.3+rz*.15);
      const h=rayCast(e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,rng-2),far=h?h.t:rng-2,aim=Math.min(7,far);
      LU.uSpotD.value.set(e.x+_dv.x*aim-sp.x,e.y+_dv.y*aim-sp.y,e.z+_dv.z*aim-sp.z).normalize();LU.uSpotK.value.w=1.55+.65*bk;
      beam=1-Math.exp(-far/7)}
    else LU.uSpotK.value.w=0;
    // a hot barrel keeps smoking for a moment after a burst
    if(P&&P.alive&&P.team===TH&&P.heat>0){P.heat=Math.max(0,P.heat-dt*.45);if(P.heat>.3&&G.t-(P.lastFire||-9)>.18&&Math.random()<dt*14*P.heat){const mz=muzzleWorld(P);
      FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:rr(-.05,.05),vy:rr(.25,.5),vz:rr(-.05,.05),life:rr(.8,1.4),s0:.03,s1:.22,r:.55,g:.55,b:.56,a:.22*Math.min(1,P.heat),f:Math.random()<.5?2:3,drag:.8,lit:1})}}
    // air in the beam: a soft haze toward the aim point, stronger the more open air the light crosses
    PU.uBeam.value=approach(PU.uBeam.value,beam*(FX.rain&&FX.rain.on?1:.6),dt*6);
    const zt=P&&P.team===TZ&&G.st!=='menu';PU.uZ.value=approach(PU.uZ.value,zt&&!P.nv?.35:0,dt*2);PU.uNV.value=approach(PU.uNV.value,zt&&P.nv&&P.alive?.88:0,dt*4);
    PU.uDmg.value=Math.max(0,PU.uDmg.value-dt*1.3);PU.uInfect.value=Math.max(0,PU.uInfect.value-dt*.36);PU.uFrost.value=approach(PU.uFrost.value,P&&P.frozen>0&&P.isPlayer?.8:P&&P.shriekT>0?.35:0,dt*3);
    PU.uWhite.value=Math.max(0,PU.uWhite.value-dt*3);
    LU.uTime.value+=dt;const fl=MAP.skyU;const BOa=G.st==='menu'?1:BO.amb;if(this.lightning>0){this.lightning-=dt;const k=Math.max(0,Math.sin(this.lightning*30))*this.lightning;fl.uFlashSky.value=k*1.5;LU.uAmb.value=BOa*(1+k*1.2)}else{fl.uFlashSky.value=0;LU.uAmb.value=BOa}LU.uLamp.value=DL.lamp=G.st==='menu'?1:BO.lamp;VM.U.uAmbV.value=Math.max(.3,BOa);
    const ps=R.rt.height/2/Math.tan(R.cam.fov*Math.PI/360);FX.A.pts.material.uniforms.uScale.value=ps;FX.B.pts.material.uniforms.uScale.value=ps},
  frame(t){requestAnimationFrame(tt=>this.frame(tt));this.lastRaf=performance.now();this.step(t,true)},
  // one simulation step; a hidden tab in a multiplayer game keeps stepping (without drawing) so friends do not freeze
  step(t,draw){let dt=Math.min(.05,Math.max(0,(t-this.last)/1000));this.last=t;if(draw)this.dtAvg=lerp(this.dtAvg,dt*1000,.05);
    if(MAP.loading)return;
    try{
      if(NET.on)NET.frameStart(dt);
      if(G.st==='menu'){this.demoUpdate(dt);gameUpdate(dt);if(KC.on||KC.rec)KC.tick(dt)}
      else if(netHold()){for(const a of G.actors)updateVisual(a,dt)}// (a multiplayer match waits while a new host takes over)
      else if(!this.paused||NET.on){if(G.player){if(!this.paused)this.playerCmd(dt);else{const c=G.player.cmd;c.f=c.s=0;c.jump=c.duck=c.walk=c.fire=c.alt=c.reload=c.skill=false}}gameUpdate(dt);KC.tick(dt)}
      if(NET.on)NET.frameEnd(dt);
      if(!draw){FX.update(dt);return}
      this.camera(dt);this.look(dt);
      if(KC.on){KC.vmTick(dt);KC.pose(dt)}else if(G.player&&G.st!=='menu'){const P=G.player;if(P.alive&&P.team===TH&&P.cur)VM.set(P.cur,P.skin);VM.vis=P.alive&&!G.spec;VM.update(dt,P,R.cam)}
      if(!this.paused||NET.on){this.fires(dt);FX.update(dt);SMK.draw(dt);DL.update(dt,R.cam)}
      if(AU.spin)AU.spin(G.player&&G.player.alive&&!this.paused&&G.st!=='menu'?G.player.spinV||0:0,G.player&&G.player.cmd.fire);
      if(AU.saw&&!(G.player&&G.player.alive&&G.player.cur==='ripper'&&!this.paused&&G.st!=='menu'))AU.saw(0);
      if(AU.flame)AU.flame(G.player&&G.player.alive&&G.player.salOn&&!this.paused&&G.st!=='menu'?1:0);
      AU.update(dt,{play:G.st==='fight',music:null,low:G.player&&G.player.alive&&G.player.team===TH&&G.lastHuman===G.player?.6:0,flash:()=>{this.lightning=.6}});
      FX.rain.k=1;AU.rainIndoor&&!AU.throttle('ri',300)&&AU.rainIndoor(rayCast(R.cam.position.x,R.cam.position.y,R.cam.position.z,0,1,0,30)?1:0);
      $('app').classList.toggle('playing',!!G.player&&G.st!=='menu'&&G.st!=='over'&&!this.paused&&!this.overlay);
      if(G.player&&G.st!=='menu')HUD.update(dt);KC.hud(dt);netHud(dt);if(this.boardOn&&!AU.throttle('bd',400))UI.board(true);
      R.render();if(!this.paused&&document.visibilityState==='visible')R.adapt(dt*1000)}catch(e){ERRLOG.report(e,'frame');console.error(e);window.__err=String(e.stack||e)}},
};
addEventListener('load',()=>{Main.boot()});
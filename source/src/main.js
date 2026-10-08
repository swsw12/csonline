'use strict';
// ============ Boot, input, camera and the frame loop ============
function applyCfg(){if(R.ok){R.setScale(CFG.scale);R.setFov(CFG.fov);R.bloom=CFG.bloom!==false;R.shadowsOn=CFG.shadow!==false}R.PU&&(R.PU.uGamma.value=CFG.gamma);AU.vol=CFG.vol;AU.musicOn=CFG.music;AU.apply()}
const Main={keys:{},ml:false,mr:false,locked:false,lockFail:false,lockAsked:0,overlay:null,paused:false,last:0,dtAvg:16,mx:0,my:0,boardOn:false,demo:[],shakeP:0,shakeY:0,camT:0,specCam:new THREE.Vector3(),fpsT:0,
  async boot(){const step=async(t,p)=>{$('loadT').textContent=t;$('loadFill').style.width=(p*100)+'%';await new Promise(r=>setTimeout(r,16))};
    try{
      await step(T('lTex'),.05);bakeTextures();paintGunAtlas();paintNYAtlas();
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
    }catch(e){console.error(e);$('loadT').textContent='Error: '+e.message;window.__err=String(e.stack||e)}},
  // ---------- title-screen backdrop: a few infected wandering the yard ----------
  menuDemo(){this.clearDemo();FX.clearLimbs();G.st='menu';G.actors=[];for(let i=0;i<6;i++){const a=mkActor('z'+i,false,'guard');a.zpick=rpick(ZLIST);a.zc=a.zpick;a.bot=AI.mk(a);a.team=TZ;a.alive=true;a.lvl=1;
      const n=NAV.nodes[(Math.random()*NAV.nodes.length)|0];placeAt(a,n.x,n.y,n.z,rr(0,TAU));ensureRig(a);a.cur='claw';G.actors.push(a);this.demo.push(a)}
    HUD.show(false);LU.uSpotK.value.w=0},
  clearDemo(){for(const a of this.demo){for(const k in a.rigs)R.scene.remove(a.rigs[k].grp)}this.demo=[]},
  demoUpdate(dt){for(const a of this.demo){a.cmd.f=a.cmd.s=0;a.cmd.jump=false;AI.wander(a,dt);a.cmd.f*=.45;a.cmd.s*=.45;actorPhysics(a,dt);Object.assign(a.pc,a.cmd);
      a.bot.growlT-=dt;if(a.bot.growlT<=0){a.bot.growlT=rr(4,10);AU.at('zgrowl',a.c.x,a.c.y+1.5,a.c.z,{vol:.5,range:30})}}},
  async startGame(){AU.init();const mid=MAPDEFS[CFG.map]?CFG.map:'q7';if(MAP.id!==mid){await loadMapUI(mid);if(MAP.id!==mid)return}this.clearDemo();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);
    startMatch({mode:CFG.mode,bots:CFG.mode==='scen'?(CFG.scBots??3):CFG.bots,diff:CFG.diff,rounds:CFG.rounds,time:CFG.time,skin:CFG.skin,zclass:CFG.zclass,money:6000,name:T('you')});
    HUD.show(true);this.paused=false;this.overlay=null;this.lock();window.onbeforeunload=e=>{if(G.st!=='menu'&&G.st!=='over'){e.preventDefault();e.returnValue='';return ''}}},
  toTitle(){if(NET.on)NET.leave();for(const a of G.actors)for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);G.actors=[];G.player=null;clearNades();NY.clear();FX.clearDecals();this.closeOverlay(true);this.paused=false;
    R.PU.uNV.value=0;R.PU.uZ.value=0;R.PU.uDeath.value=0;R.PU.uInfect.value=0;R.vmVisible=false;window.onbeforeunload=null;AU.stopAll('countdown');this.menuDemo();UI.buildTitle();UI.show('menu');AU.muSet&&AU.muSet('calm')},
  pause(){if(G.st==='menu'||G.st==='over'||this.paused)return;this.paused=true;this.pausedAt=performance.now();this.closeOverlay(true);UI.buildPause();UI.show('pause')},
  resume(){UI.hideAll();this.paused=false;this.lock()},
  lock(){const c=$('cv');if(this.lockFail)return;try{const p=c.requestPointerLock&&c.requestPointerLock();if(p&&p.catch)p.catch(()=>this.onLockFail())}catch(e){this.onLockFail()}},
  unlock(){if(document.pointerLockElement)try{document.exitPointerLock()}catch(e){}},
  onLockFail(){if(this.lockFail)return;this.lockFail=true;HUD.note(T('noLock'),6)},
  // ---------- overlays during play ----------
  openOverlay(k){if(this.overlay===k){this.closeOverlay();return}this.closeOverlay(true);const P=G.player;if(!P)return;
    if(k==='buy'){if(P.team!==TH||!P.alive){HUD.note(T('zOnly'));return}UI.buyStage=0;UI.renderBuy();$('buy').classList.remove('off')}
    if(k==='zsel'){UI.renderZsel();$('zsel').classList.remove('off')}
    this.overlay=k;this.unlock()},
  closeOverlay(silent){if(!this.overlay)return;$('buy').classList.add('off');$('zsel').classList.add('off');this.overlay=null;if(!silent&&!this.paused)this.lock()},
  buyItem(id){const P=G.player;if(!P)return;
    if(NET.cli){const W=WPN[id],E=EQUIP[id];if(!W&&!E)return;if(P.team!==TH||!P.alive){HUD.note(T('zOnly'));return}const free=W&&W.ny&&P.nyFree>0;
      if(!free&&P.money<(W||E).cost){HUD.note(T('noMoney'),1.2);AU.play('dry',{vol:.5});return}netToHost({t:'buy',w:id});if(W&&W.slot<=2)this.closeOverlay();return}
    if(buy(P,id)){UI.renderBuy();if(WPN[id]&&WPN[id].slot<=2)this.closeOverlay()}else{HUD.note(P.team!==TH?T('zOnly'):T('noMoney'),1.2);AU.play('dry',{vol:.5})}},
  pickZ(k){const P=G.player;P.zpick=k;CFG.zclass=k;saveCfg();UI.renderZsel();AU.play('uiok',{vol:.4});setTimeout(()=>this.closeOverlay(),150)},
  // ---------- input ----------
  setupInput(){const cv=$('cv');
    document.addEventListener('pointerlockchange',()=>{this.locked=document.pointerLockElement===cv;this.lockAt=performance.now();$('app').classList.toggle('locked',this.locked);
      if(!this.locked&&G.player&&G.st!=='menu'&&G.st!=='over'&&!this.overlay&&!this.paused)this.pause()});
    document.addEventListener('pointerlockerror',()=>this.onLockFail());
    cv.addEventListener('mousedown',e=>{AU.init();if(G.st==='menu'||G.st==='over'||this.paused)return;if(!this.locked&&!this.lockFail&&!this.overlay){this.lock();return}
      if(e.button===0)this.ml=true;if(e.button===2)this.mr=true;
      if(e.button===0&&G.player&&!G.player.alive&&!G.deathCam)this.nextSpec()});
    addEventListener('mouseup',e=>{if(e.button===0)this.ml=false;if(e.button===2)this.mr=false});
    addEventListener('contextmenu',e=>{if(G.st!=='menu')e.preventDefault()});
    addEventListener('mousemove',e=>{this.mx=e.clientX;this.my=e.clientY;if(!G.player||this.paused||G.st==='menu'||G.st==='over')return;if(!this.locked&&!this.lockFail)return;if(this.overlay&&!this.locked)return;
      const P=G.player;if(!P.alive)return;
      // browsers sometimes report a huge jump right after the lock engages: ignore it
      if(performance.now()-(this.lockAt||0)<150||Math.abs(e.movementX)>500||Math.abs(e.movementY)>500)return;
      const Wz=WPN[P.cur];const z=P.zoom>0&&Wz&&Wz.zoom?Wz.zoom[P.zoom-1]/CFG.fov:1;const k=CFG.sens*.0022*z;
      P.yaw=wrapA(P.yaw-e.movementX*k);P.pitch=clamp(P.pitch-(CFG.invert?-1:1)*e.movementY*k,-1.53,1.53)});
    addEventListener('wheel',e=>{const P=G.player;if(!P||!P.alive||this.paused||this.overlay||G.st==='menu')return;const order=P.team===TZ?['claw','zbomb']:[P.inv[1],P.inv[2],P.inv[3]||'knife',...['he','frost','flare'].filter(k=>P.inv[k]>0)].filter(Boolean);
      if(P.team===TZ&&P.bombs<=0)return;const i=order.indexOf(P.cur);const n=order[(i+(e.deltaY>0?1:-1)+order.length)%order.length];equip(P,n)},{passive:true});
    addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;const k=e.code;
      if(e.altKey&&(k==='Enter'||k==='NumpadEnter')){e.preventDefault();if(!e.repeat)FS.toggle();return}if(['Tab','Space','ArrowUp','ArrowDown','Backquote'].includes(k)||(e.ctrlKey&&k!=='KeyR'))e.preventDefault();AU.init();
      if(e.repeat&&k!=='Tab')return;this.keys[k]=true;const P=G.player;
      if(G.st==='menu'||G.st==='over'){if(k==='Escape'&&UI.open&&UI.open!=='menu'&&UI.open!=='results')UI.act('back');return}
      if(k==='Escape'){if(this.overlay){this.closeOverlay();return}
        // the same Esc press that released the mouse lock must not also close the pause menu again
        if(performance.now()-(this.lockAt||0)<350||performance.now()-(this.pausedAt||0)<350){if(!this.paused)this.pause();return}
        if(this.paused){if(UI.open==='pause')this.resume();else UI.act('back');return}this.pause();return}
      if(this.paused)return;
      if(this.overlay==='buy'){let n=+k.replace('Digit','').replace('Numpad','');if(k==='Digit0'||k==='Numpad0')n=10;if(n>=1&&n<=10){if(UI.buyStage===0){if(n<=BUY_MENU.length){UI.buyCat=n-1;UI.buyStage=1;UI.renderBuy()}}else{const it=BUY_MENU[UI.buyCat].items[n-1];if(it)this.buyItem(it);UI.buyStage=0}return}if(k==='KeyB'){this.closeOverlay();return}}
      if(this.overlay==='zsel'){const n=+k.replace('Digit','');if(n>=1&&n<=4){this.pickZ(ZLIST[n-1]);return}if(k==='KeyM'){this.closeOverlay();return}}
      if(!P)return;
      if(k==='Tab'){this.boardOn=true;UI.board(true)}
      if(k==='KeyB')this.openOverlay('buy');
      if(k==='KeyM')this.openOverlay('zsel');
      if(k==='KeyH'){this.pause();UI.ret='pause';UI.buildHelp();UI.show('help')}
      if(!P.alive)return;
      if(k.startsWith('Digit')){const n=+k.slice(5);if(n>=1&&n<=4)P.cmd.slot=n}
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
  nextSpec(){const L=G.actors.filter(a=>a.alive&&!a.isPlayer);if(!L.length){G.spec=null;return}G.specIdx=(G.specIdx+1)%L.length;G.spec=L[G.specIdx]},
  playerCmd(dt){const P=G.player,k=this.keys,c=P.cmd;if(!P.alive)return;const free=!this.overlay||this.overlay;
    c.f=(k.KeyW||k.ArrowUp?1:0)-(k.KeyS||k.ArrowDown?1:0);c.s=(k.KeyD?1:0)-(k.KeyA?1:0);c.jump=!!k.Space;c.duck=!!(k.KeyC||k.ControlLeft||k.ControlRight);c.walk=!!(k.ShiftLeft||k.ShiftRight);
    const canShoot=!this.overlay||this.locked;c.fire=this.ml&&canShoot;c.alt=this.mr&&canShoot;c.reload=!!k.KeyR;c.skill=!!(k.KeyG||k.KeyE);c.drop=!!k.KeyG;
    if(k.ArrowLeft)P.yaw+=dt*2.4;if(k.ArrowRight)P.yaw-=dt*2.4;
    // without pointer lock: turn while the cursor rests near the screen edge
    if(this.lockFail&&!this.overlay&&!this.paused){const ex=this.mx/innerWidth;if(ex<.06)P.yaw+=dt*2.6*(1-ex/.06);else if(ex>.94)P.yaw-=dt*2.6*((ex-.94)/.06);const ey=this.my/innerHeight;if(ey<.06)P.pitch=Math.min(1.5,P.pitch+dt*1.5);else if(ey>.94)P.pitch=Math.max(-1.5,P.pitch-dt*1.5)}},
  // ---------- camera ----------
  camera(dt){const cam=R.cam,P=G.player;FX.shake=Math.max(0,FX.shake-dt*1.6);const sh=FX.shake*FX.shake;
    this.shakeP=(Math.random()*2-1)*sh*.06;this.shakeY=(Math.random()*2-1)*sh*.06;
    let fov=CFG.fov;R.vmVisible=false;
    if(G.st==='menu'||!P){this.camT+=dt;if(MAP.cam)MAP.cam(this.camT,cam);else{cam.position.set(0,6,20);cam.lookAt(0,1.5,0)}LU.uSpotK.value.w=0;R.PU.uZ.value=0;R.PU.uNV.value=0;R.PU.uDeath.value=0}
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
      if(G.deathCam<=0&&(P.permaDead||P.team===TH)){if(!G.spec||!G.spec.alive)this.nextSpec();if(G.spec)tgt=G.spec}
      if(!P.alive&&tgt===P)R.PU.uDeath.value=Math.min(.55,R.PU.uDeath.value+dt);else R.PU.uDeath.value=Math.max(0,R.PU.uDeath.value-dt*2);
      const hx=tgt.c.x,hy=tgt.c.y+(tgt.alive?1.6:.4),hz=tgt.c.z;const back=tgt===P?3.2:3.4;const yaw=tgt===P?P.yaw+G.t*.15:tgt.yaw;
      let dx=Math.sin(yaw)*back,dz=Math.cos(yaw)*back,dy=tgt===P?2.2:.7;const L=Math.hypot(dx,dy,dz);const h=rayCast(hx,hy,hz,dx/L,dy/L,dz/L,L);const k=h?Math.max(.15,(h.t-.25)/L):1;
      this.specCam.set(hx+dx*k,hy+dy*k,hz+dz*k);cam.position.lerp(this.specCam,1-Math.exp(-dt*8));cam.lookAt(hx,hy,hz)}
    if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix()}
    cam.updateMatrixWorld();
    // listener
    AU.L.x=cam.position.x;AU.L.y=cam.position.y;AU.L.z=cam.position.z;const fw=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);AU.L.yaw=Math.atan2(-fw.x,-fw.z)},
  // ---------- lights & post per frame ----------
  look(dt){const P=G.player;const PU=R.PU;
    // the flashlight rides the gun: a little right of and below the eye, aimed to cross the line of sight ~7 m out, so its shadows show beside things
    let beam=0;
    if(P&&G.st!=='menu'&&P.alive&&!G.spec&&P.team===TH&&P.flash){const e=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const rx=Math.cos(P.yaw),rz=-Math.sin(P.yaw);
      const sp=LU.uSpotP.value.set(e.x+_dv.x*.3+rx*.15,e.y-.15+_dv.y*.3,e.z+_dv.z*.3+rz*.15);
      const h=rayCast(e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,24),far=h?h.t:24,aim=Math.min(7,far);
      LU.uSpotD.value.set(e.x+_dv.x*aim-sp.x,e.y+_dv.y*aim-sp.y,e.z+_dv.z*aim-sp.z).normalize();LU.uSpotK.value.w=1.55;
      beam=1-Math.exp(-far/7)}
    else LU.uSpotK.value.w=0;
    // a hot barrel keeps smoking for a moment after a burst
    if(P&&P.alive&&P.team===TH&&P.heat>0){P.heat=Math.max(0,P.heat-dt*.45);if(P.heat>.3&&G.t-(P.lastFire||-9)>.18&&Math.random()<dt*14*P.heat){const mz=muzzleWorld(P);
      FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:rr(-.05,.05),vy:rr(.25,.5),vz:rr(-.05,.05),life:rr(.8,1.4),s0:.03,s1:.22,r:.55,g:.55,b:.56,a:.22*Math.min(1,P.heat),f:Math.random()<.5?2:3,drag:.8,lit:1})}}
    // air in the beam: a soft haze toward the aim point, stronger the more open air the light crosses
    PU.uBeam.value=approach(PU.uBeam.value,beam*(FX.rain&&FX.rain.on?1:.6),dt*6);
    const zt=P&&P.team===TZ&&G.st!=='menu';PU.uZ.value=approach(PU.uZ.value,zt&&!P.nv?.35:0,dt*2);PU.uNV.value=approach(PU.uNV.value,zt&&P.nv&&P.alive?.88:0,dt*4);
    PU.uDmg.value=Math.max(0,PU.uDmg.value-dt*1.3);PU.uInfect.value=Math.max(0,PU.uInfect.value-dt*.6);PU.uFrost.value=approach(PU.uFrost.value,P&&P.frozen>0&&P.isPlayer?.8:P&&P.shriekT>0?.35:0,dt*3);
    PU.uWhite.value=Math.max(0,PU.uWhite.value-dt*3);
    LU.uTime.value+=dt;const fl=MAP.skyU;if(this.lightning>0){this.lightning-=dt;const k=Math.max(0,Math.sin(this.lightning*30))*this.lightning;fl.uFlashSky.value=k*1.5;LU.uAmb.value=1+k*1.2}else{fl.uFlashSky.value=0;LU.uAmb.value=1}
    const ps=R.rt.height/2/Math.tan(R.cam.fov*Math.PI/360);FX.A.pts.material.uniforms.uScale.value=ps;FX.B.pts.material.uniforms.uScale.value=ps},
  frame(t){requestAnimationFrame(tt=>this.frame(tt));this.lastRaf=performance.now();this.step(t,true)},
  // one simulation step; a hidden tab in a multiplayer game keeps stepping (without drawing) so friends do not freeze
  step(t,draw){let dt=Math.min(.05,Math.max(0,(t-this.last)/1000));this.last=t;if(draw)this.dtAvg=lerp(this.dtAvg,dt*1000,.05);
    if(MAP.loading)return;
    try{
      if(NET.on)NET.frameStart(dt);
      if(G.st==='menu'){this.demoUpdate(dt);gameUpdate(dt)}
      else if(!this.paused||NET.on){if(G.player){if(!this.paused)this.playerCmd(dt);else{const c=G.player.cmd;c.f=c.s=0;c.jump=c.duck=c.walk=c.fire=c.alt=c.reload=c.skill=false}}gameUpdate(dt)}
      if(NET.on)NET.frameEnd(dt);
      if(!draw){FX.update(dt);return}
      this.camera(dt);this.look(dt);
      if(G.player&&G.st!=='menu'){const P=G.player;if(P.alive&&P.team===TH&&P.cur)VM.set(P.cur,P.skin);VM.vis=P.alive&&!G.spec;VM.update(dt,P,R.cam)}
      if(!this.paused||NET.on){this.fires(dt);FX.update(dt);DL.update(dt,R.cam)}
      if(AU.spin)AU.spin(G.player&&G.player.alive&&!this.paused&&G.st!=='menu'?G.player.spinV||0:0,G.player&&G.player.cmd.fire);
      if(AU.saw&&!(G.player&&G.player.alive&&G.player.cur==='ripper'&&!this.paused&&G.st!=='menu'))AU.saw(0);
      AU.update(dt,{play:G.st==='fight',music:null,low:G.player&&G.player.alive&&G.player.team===TH&&G.lastHuman===G.player?.6:0,flash:()=>{this.lightning=.6}});
      FX.rain.k=1;AU.rainIndoor&&!AU.throttle('ri',300)&&AU.rainIndoor(rayCast(R.cam.position.x,R.cam.position.y,R.cam.position.z,0,1,0,30)?1:0);
      $('app').classList.toggle('playing',!!G.player&&G.st!=='menu'&&G.st!=='over'&&!this.paused&&!this.overlay);
      if(G.player&&G.st!=='menu')HUD.update(dt);netHud(dt);if(this.boardOn&&!AU.throttle('bd',400))UI.board(true);
      R.render();if(!this.paused&&document.visibilityState==='visible')R.adapt(dt*1000)}catch(e){console.error(e);window.__err=String(e.stack||e)}},
};
addEventListener('load',()=>{Main.boot()});
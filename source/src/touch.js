'use strict';
// ============ Touch controls: a floating stick on the left, drag-to-look on the right, a thumb cluster of buttons ============
// On when the device has no fine pointer (or forced in the options). Pointer lock is skipped; every control writes the same
// keys / buttons the keyboard and mouse do, so game code does not know the difference.
const TOUCH={on:false,el:null,stick:null,look:new Map(),btn:new Map(),mv:{x:0,y:0},duck:false,
  want(){const m=CFG.touch||'auto';if(m==='on')return true;if(m==='off')return false;return matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches},
  init(){this.patchMain();this.apply()},
  // (re)read the setting: build the layer the first time it is needed, hide it otherwise
  apply(){this.on=this.want();document.documentElement.style.setProperty('--tal',CFG.tal==null?.7:CFG.tal);document.documentElement.classList.toggle('touch',this.on);
    if(this.on&&CFG.mob!==1){CFG.mob=1;CFG.shadow=false;if(CFG.scale==='auto')CFG.scale=.65;saveCfg();applyCfg()}// first visit on a phone: lighter defaults
    if(this.on&&!this.el)this.build();if(this.el)this.el.style.display=this.on?'':'none';
    if(this.on&&document.pointerLockElement)Main.unlock();this.st=-1;this.update()},
  B(id,label,cls){return `<button class="tb ${cls||''}" data-t="${id}"><span>${label}</span></button>`},
  build(){const L=LI();const el=document.createElement('div');el.id='touch';
    el.innerHTML=`<div class="tzone tzL"></div><div class="tzone tzR"></div><div class="tstick off"><i></i></div>
      ${this.B('fire','<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 1v6M12 17v6M1 12h6M17 12h6" stroke="currentColor" stroke-width="2"/></svg>','tFire')}
      ${this.B('fire','<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/></svg>','tFireL')}
      ${this.B('alt',L?'ALT':'보조','tAlt')}${this.B('jump',L?'JUMP':'점프','tJump')}${this.B('duck',L?'DUCK':'앉기','tDuck')}
      ${this.B('reload','R','tRel')}${this.B('swap','⇄','tSwap')}${this.B('last','Q','tLast')}${this.B('skill',L?'SKILL':'스킬','tSkill')}
      <div class="ttop">${this.B('buy',L?'BUY':'구매','tBuy')}${this.B('zsel',L?'CLASS':'클래스','tZsel')}${this.B('light','💡','tLight')}${this.B('nv','NV','tNV')}${this.B('score','≡','tScore')}${this.B('full','⛶','tFull')}${this.B('pause','Ⅱ','tPause')}</div>
      ${this.B('close','✕','tClose')}
      <div class="trot">${L?'Turn your phone sideways':'휴대폰을 가로로 돌려 주세요'}</div>`;
    $('app').appendChild(el);this.el=el;this.stick=el.querySelector('.tstick');
    const opt={passive:false};
    el.addEventListener('touchstart',e=>e.preventDefault(),opt);el.addEventListener('touchmove',e=>e.preventDefault(),opt);
    el.addEventListener('pointerdown',e=>this.down(e));el.addEventListener('pointermove',e=>this.move(e));
    for(const t of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(t,e=>this.up(e));
    // canvas taps must not try to lock the pointer or fire through the compatibility mouse events
    $('cv').style.touchAction='none'},
  patchMain(){const M=Main;const lk=M.lock.bind(M);M.lock=function(){if(!TOUCH.on)lk()};
    const pc0=M.playerCmd.bind(M);M.playerCmd=function(dt){pc0(dt);const P=G.player;if(!TOUCH.on||!P||!P.alive)return;const c=P.cmd,m=TOUCH.mv,l=Math.hypot(m.x,m.y);
      if(l>.12){c.f=-m.y;c.s=m.x;c.walk=c.walk||l<.5}c.duck=c.duck||TOUCH.duck;
      if(TOUCH.btn.size){for(const b of TOUCH.btn.values()){if(b.id==='jump')c.jump=true;if(b.id==='reload')c.reload=true;if(b.id==='skill')c.skill=true}}}},
  // ---------- pointers ----------
  down(e){const t=e.target.closest('[data-t]'),z=e.target.closest('.tzone');AU.init();
    if(t){e.preventDefault();try{t.setPointerCapture(e.pointerId)}catch(_){}t.classList.add('on');const id=t.dataset.t;this.btn.set(e.pointerId,{id,el:t,x:e.clientX,y:e.clientY});this.press(id,true);return}
    if(!z)return;try{z.setPointerCapture(e.pointerId)}catch(_){}
    if(z.classList.contains('tzL')&&!this.stickId){this.stickId=e.pointerId;this.sx=e.clientX;this.sy=e.clientY;const s=this.stick;s.classList.remove('off');s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.firstChild.style.transform='';return}
    this.look.set(e.pointerId,{x:e.clientX,y:e.clientY})},
  move(e){if(e.pointerId===this.stickId){const R=56;let dx=e.clientX-this.sx,dy=e.clientY-this.sy;const l=Math.hypot(dx,dy);if(l>R){dx*=R/l;dy*=R/l}
      this.mv.x=dx/R;this.mv.y=dy/R;this.stick.firstChild.style.transform=`translate(${dx}px,${dy}px)`;return}
    // look: a free drag on the right, or a drag that starts on the fire / alt buttons (aim while shooting)
    const lk=this.look.get(e.pointerId)||((b=>b&&(b.id==='fire'||b.id==='alt')?b:null)(this.btn.get(e.pointerId)));if(!lk)return;
    const dx=e.clientX-lk.x,dy=e.clientY-lk.y;lk.x=e.clientX;lk.y=e.clientY;this.turn(dx,dy)},
  up(e){if(e.pointerId===this.stickId){this.stickId=null;this.mv.x=this.mv.y=0;this.stick.classList.add('off');return}
    this.look.delete(e.pointerId);const b=this.btn.get(e.pointerId);if(b){this.btn.delete(e.pointerId);b.el.classList.remove('on');this.press(b.id,false)}},
  turn(dx,dy){const P=G.player;if(!P||!P.alive||Main.paused||Main.overlay||G.st==='menu'||G.st==='over')return;
    const Wz=WPN[P.cur];const z=P.zoom>0&&Wz&&Wz.zoom?Wz.zoom[P.zoom-1]/CFG.fov:1;const k=(CFG.tsens||1)*.0042*z;
    P.yaw=wrapA(P.yaw-dx*k);P.pitch=clamp(P.pitch-(CFG.invert?-1:1)*dy*k,-1.53,1.53)},
  press(id,on){const P=G.player,M=Main;
    if(id==='fire'){if(on&&P&&!P.alive&&!G.deathCam){M.nextSpec();return}M.ml=on;return}
    if(id==='alt'){M.mr=on;return}
    if(id==='score'){M.boardOn=on;UI.board(on);return}
    if(!on)return;
    if(id==='duck'){this.duck=!this.duck;this.el.querySelector('.tDuck').classList.toggle('lat',this.duck);return}
    if(id==='pause'){if(M.overlay)M.closeOverlay();M.pause();return}
    if(id==='close'){M.closeOverlay();return}
    if(id==='full'){const d=document.documentElement;try{if(document.fullscreenElement)document.exitFullscreen();else{const p=d.requestFullscreen&&d.requestFullscreen({navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{})}}catch(_){}return}
    if(!P)return;
    if(id==='buy'){if(M.overlay==='buy')M.closeOverlay();else M.openOverlay('buy');return}
    if(id==='zsel'){if(M.overlay==='zsel')M.closeOverlay();else M.openOverlay('zsel');return}
    if(!P.alive)return;
    if(id==='swap'){const order=P.team===TZ?['claw','zbomb']:[P.inv[1],P.inv[2],P.inv[3]||'knife',...['he','frost','flare'].filter(k=>P.inv[k]>0)].filter(Boolean);
      if(P.team===TZ&&P.bombs<=0)return;const i=order.indexOf(P.cur);equip(P,order[(i+1)%order.length]);return}
    if(id==='last'){P.cmd.lastInv=true;return}
    if(id==='light'&&P.team===TH){P.flash=!P.flash;AU.play('ui',{vol:.35,rate:.6});return}
    if(id==='nv'&&P.team===TZ){P.nv=!P.nv;AU.play('ui',{vol:.35,rate:.5});return}},
  // ---------- per frame: which buttons make sense right now ----------
  update(){if(!this.el)return;if(!this.on){this.el.classList.add('off');return}const P=G.player,M=Main;const play=!!P&&G.st!=='menu'&&G.st!=='over'&&!M.paused&&UI.open!=='results';
    const st=(play?1:0)|(M.overlay?2:0)|(P&&P.team===TZ?4:0)|(P&&P.alive?8:0);if(st===this.st)return;this.st=st;
    const el=this.el;el.classList.toggle('off',!play);el.classList.toggle('ov',!!M.overlay);el.classList.toggle('zt',!!(st&4));el.classList.toggle('dead',!(st&8));
    if(!play||M.overlay){for(const [pid,b] of this.btn){b.el.classList.remove('on');this.press(b.id,false)}this.btn.clear();this.look.clear();this.stickId=null;this.mv.x=this.mv.y=0;this.stick.classList.add('off');this.duck=false;el.querySelector('.tDuck').classList.remove('lat')}}};
(function(){const fr=Main.frame?'frame':null;
  // hook into the main loop's HUD pass and into boot
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);TOUCH.update()};
  const ui0=UI.init.bind(UI);UI.init=function(){ui0();TOUCH.init()};
  // pause / results screens: the touch layer must follow even when the HUD is not updating
  const sh=UI.show.bind(UI);UI.show=function(id){sh(id);TOUCH.st=-1;TOUCH.update()};
  const hide=UI.hideAll.bind(UI);UI.hideAll=function(){hide();TOUCH.st=-1;TOUCH.update()};})();
// keyboard hints become button hints
(function(){const rs=HUD.roundStart.bind(HUD);HUD.roundStart=function(){rs();if(TOUCH.on)HUD.note(LI()?'BUY: weapons · 💡: flashlight · CLASS: zombie class':'구매: 무기 사기 · 💡: 손전등 · 클래스: 좀비 클래스',4)};
  const inf=HUD.infected.bind(HUD);HUD.infected=function(s){inf(s);if(TOUCH.on)HUD.note(LI()?'SKILL: class skill · ⇄: zombie bomb · NV: night vision':'스킬: 좀비 스킬 · ⇄: 좀비 폭탄 · NV: 야간투시',6)}})();

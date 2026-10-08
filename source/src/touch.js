'use strict';
// ============ Mobile play (v2): a thumb-first layout like mobile shooters ============
// Left: a fixed movement stick (touch on or near it). Right: drag anywhere to look, a big
// fire button you can also drag to aim, jump / crouch / scope / reload around it. Bottom centre: weapon slots with ammo.
// Top right: buy / light / score / pause. Aim assist pulls gently toward the target under the crosshair and auto-fire shoots
// when it sits on one, so phones are playable without pixel-perfect thumbs. Everything writes the same commands the
// keyboard and mouse do. On when the device has no fine pointer (or forced in the options); pointer lock is skipped.
const TOUCH={on:false,el:null,stick:null,look:new Map(),btn:new Map(),mv:{x:0,y:0},duck:false,autoF:false,tgt:null,fr:0,lastLook:0,
  want(){const m=CFG.touch||'auto';if(m==='on')return true;if(m==='off')return false;return matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches},
  init(){this.patchMain();this.patchUI();this.apply()},
  // (re)read the setting: build the layer the first time it is needed, hide it otherwise
  apply(){this.on=this.want();const de=document.documentElement;de.style.setProperty('--tal',CFG.tal==null?.75:CFG.tal);de.style.setProperty('--tsz',CFG.tsz||1);de.classList.toggle('touch',this.on);
    // first visit on a phone: lighter defaults and the helpers on
    if(this.on&&CFG.mob!==2){CFG.mob=2;CFG.shadow=false;if(CFG.scale==='auto'||CFG.scale>.7)CFG.scale=.6;if(CFG.bots>11)CFG.bots=11;CFG.autoFire=true;CFG.aimAssist=true;CFG.leftFire=true;CFG.minimap=true;saveCfg();applyCfg()}
    if(this.on&&!this.el)this.build();if(this.el){this.el.style.display=this.on?'':'none';this.el.classList.toggle('nolf',CFG.leftFire===false)}
    if(this.on&&document.pointerLockElement)Main.unlock();this.st=-1;this.wKey='';this.update()},
  B(id,label,cls,sub){return `<button class="tb ${cls||''}" data-t="${id}">${label}${sub?`<em>${sub}</em>`:''}</button>`},
  I:{fire:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="currentColor" stroke-width="2.2"/></svg>',
    jump:'<svg viewBox="0 0 24 24"><path d="M12 4l7 8h-4v7H9v-7H5z" fill="currentColor"/></svg>',
    duck:'<svg viewBox="0 0 24 24"><path d="M12 20l-7-8h4V5h6v7h4z" fill="currentColor"/></svg>',
    alt:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',
    rel:'<svg viewBox="0 0 24 24"><path d="M19 12a7 7 0 1 1-2.05-4.95L19 5v6h-6l2.53-2.53A5 5 0 1 0 17 12z" fill="currentColor"/></svg>',
    skill:'<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6z" fill="currentColor"/></svg>',
    menu:'<svg viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" fill="currentColor"/><rect x="15" y="4" width="4" height="16" fill="currentColor"/></svg>',
    score:'<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2.4"/></svg>',
    buy:'<svg viewBox="0 0 24 24"><path d="M3 5h3l2 10h10l2-7H8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>',
    light:'<svg viewBox="0 0 24 24"><path d="M9 21h6M10 18h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    swap:'<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>'},
  build(){const L=LI(),I=this.I;const el=document.createElement('div');el.id='touch';
    el.innerHTML=`<div class="tzone tzL"></div><div class="tzone tzR"></div><div class="tstick"><i></i></div>
      ${this.B('fire',I.fire,'tFire')}${this.B('fire',I.fire,'tFireL')}
      ${this.B('alt',I.alt,'tAlt',L?'AIM':'조준')}${this.B('jump',I.jump,'tJump')}${this.B('duck',I.duck,'tDuck')}${this.B('reload',I.rel,'tRel')}${this.B('skill',I.skill,'tSkill',L?'SKILL':'스킬')}
      <div class="tbar"></div>
      <div class="ttop">${this.B('buy',I.buy,'tBuy',L?'BUY':'구매')}${this.B('zsel',I.buy,'tZsel',L?'CLASS':'클래스')}${this.B('light',I.light,'tLight')}${this.B('nv',L?'NV':'NV','tNV')}${this.B('score',I.score,'tScore')}${this.B('pause',I.menu,'tPause')}</div>
      <div class="tlock"></div>
      ${this.B('close','✕','tClose')}
      <div class="trot"><p>${L?'Turn your phone sideways':'휴대폰을 가로로 돌려 주세요'}</p><button data-act="rot" class="trotb">${L?'Switch to landscape & lock':'가로모드로 전환 · 고정'}</button></div>`;
    $('app').appendChild(el);this.el=el;this.stick=el.querySelector('.tstick');this.bar=el.querySelector('.tbar');this.lockEl=el.querySelector('.tlock');
    const opt={passive:false};
    el.addEventListener('touchstart',e=>e.preventDefault(),opt);el.addEventListener('touchmove',e=>e.preventDefault(),opt);
    el.addEventListener('pointerdown',e=>this.down(e));el.addEventListener('pointermove',e=>this.move(e));
    for(const t of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(t,e=>this.up(e));
    $('cv').style.touchAction='none'},
  patchMain(){const M=Main;const lk=M.lock.bind(M);M.lock=function(){if(!TOUCH.on)lk()};
    const pc0=M.playerCmd.bind(M);M.playerCmd=function(dt){pc0(dt);const P=G.player;if(!TOUCH.on||!P||!P.alive)return;const c=P.cmd,m=TOUCH.mv,l=Math.hypot(m.x,m.y);
      if(l>.1){const k=Math.min(1,(l-.1)/.75)/l;c.f=-m.y*k;c.s=m.x*k;c.walk=c.walk||l<.45}c.duck=c.duck||TOUCH.duck;
      for(const b of TOUCH.btn.values()){if(b.id==='jump')c.jump=true;if(b.id==='reload')c.reload=true;if(b.id==='skill')c.skill=true}
      TOUCH.assist(dt);if(TOUCH.autoF&&!M.overlay)c.fire=true}},
  // buy menu: a touch grid (big cards, category chips) instead of the keyboard list
  patchUI(){const rb=UI.renderBuy.bind(UI);UI.renderBuy=function(){if(!TOUCH.on)return rb();const P=G.player;const L=LI();const cat=BUY_MENU[this.buyCat];
      const items=cat.items.map(id=>{const W=WPN[id],E=EQUIP[id];const nm=(W||E).n[L],cost=(W||E).cost;const own=W&&(W.kind==='nade'?P.inv[id]>0:P.inv[W.slot]===id)||(id==='armor'&&P.armor>=100);const free=!!(W&&W.ny&&P.nyFree>0);const ok=(P.money>=cost||free)&&!own;
        const icon=W&&W.model?`<img src="${gunIcon(W.model,30)}">`:id==='armor'?'<b class="ico">◆</b>':'<b class="ico">▤</b>';
        return `<div class="mbi${ok?'':' na'}${own?' own':''}" data-act="buy" data-v="${id}">${icon}<b>${nm}</b><span class="c">${own?T('owned'):free?T('nyFree'):'$'+cost}</span></div>`}).join('');
      $('buy').innerHTML=`<div class="mbh"><b>${T('buyT')}</b><span class="money">$ ${P.money}</span><button class="addm" data-act="addmoney">${L?'+$3000':'+3000'}</button><button class="mbq" data-act="tquick">${L?'Quick buy':'추천 구매'}</button></div>
        <div class="mcats">${BUY_MENU.map((c,i)=>`<button class="${i===this.buyCat?'on':''}" data-act="buycat" data-v="${i}">${c.n[L]}</button>`).join('')}</div><div class="mitems">${items}</div>`};
    const a0=UI.act.bind(UI);UI.act=function(a,v,el){if(a==='tquick'){TOUCH.quickBuy();return}if(a==='tfull'){FS.toggle();return}
      // starting a match on a phone: go fullscreen (Android) so the address bar does not eat the screen
      if(TOUCH.on&&(a==='go'||a==='again'||a==='mpstart'||a==='mpcreate'||a==='mpjoin'))TOUCH.full(false);return a0(a,v,el)};
    const oo=Main.openOverlay.bind(Main),co=Main.closeOverlay.bind(Main);Main.openOverlay=function(k){oo(k);TOUCH.st=-1;TOUCH.update()};Main.closeOverlay=function(s){co(s);TOUCH.st=-1;TOUCH.update()}},
  full(toggle){const d=document.documentElement;try{if(document.fullscreenElement){if(toggle)document.exitFullscreen();return}if(!d.requestFullscreen)return;const p=d.requestFullscreen({navigationUI:'hide'});
      if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{})}catch(_){}},
  // one tap: the best rifle the money allows, armour, a grenade
  quickBuy(){const P=G.player;if(!P||P.team!==TH)return;const want=[];
    const prim=['hmg','ar7','kv47','m14','g35','um45','k9'].filter(id=>WPN[id]);
    if(!P.inv[1]){const pick=prim.find(id=>WPN[id].cost<=P.money-1000)||prim.find(id=>WPN[id].cost<=P.money);if(pick)want.push(pick)}
    want.push('armor');if(WPN.he)want.push('he');for(const id of want)if(WPN[id]||EQUIP[id])buy(P,id);UI.renderBuy();AU.play('buy',{vol:.6})},
  // ---------- pointers ----------
  down(e){const t=e.target.closest('[data-t]'),z=e.target.closest('.tzone');AU.init();
    if(t){e.preventDefault();try{t.setPointerCapture(e.pointerId)}catch(_){}t.classList.add('on');const id=t.dataset.t;this.btn.set(e.pointerId,{id,el:t,x:e.clientX,y:e.clientY,v:t.dataset.v});this.press(id,true,t.dataset.v);return}
    if(!z)return;try{z.setPointerCapture(e.pointerId)}catch(_){}
    // fixed stick: it stays where it is drawn; a thumb landing on or near it steers from its centre (far away on the left = look)
    if(z.classList.contains('tzL')&&!this.stickId){const r=this.stick.getBoundingClientRect(),R=r.width*.5||60,cx=r.left+R,cy=r.top+R;
      if(Math.hypot(e.clientX-cx,e.clientY-cy)<R*2.2){this.stickId=e.pointerId;this.sx=cx;this.sy=cy;this.stick.classList.add('held');this.move(e);return}}
    this.look.set(e.pointerId,{x:e.clientX,y:e.clientY})},
  move(e){if(e.pointerId===this.stickId){const R=this.stick.offsetWidth*.5||60;let dx=e.clientX-this.sx,dy=e.clientY-this.sy;const l=Math.hypot(dx,dy);
      const l2=Math.hypot(dx,dy);if(l2>R){dx*=R/l2;dy*=R/l2}this.mv.x=dx/R;this.mv.y=dy/R;this.stick.firstChild.style.transform=`translate(${dx}px,${dy}px)`;return}
    const lk=this.look.get(e.pointerId)||((b=>b&&(b.id==='fire'||b.id==='alt'||b.id==='skill')?b:null)(this.btn.get(e.pointerId)));if(!lk)return;
    const dx=e.clientX-lk.x,dy=e.clientY-lk.y;lk.x=e.clientX;lk.y=e.clientY;this.turn(dx,dy)},
  up(e){if(e.pointerId===this.stickId){this.stickId=null;this.mv.x=this.mv.y=0;const s=this.stick;s.classList.remove('act','held');s.firstChild.style.transform='';return}
    this.look.delete(e.pointerId);const b=this.btn.get(e.pointerId);if(b){this.btn.delete(e.pointerId);b.el.classList.remove('on');this.press(b.id,false,b.v)}},
  turn(dx,dy){const P=G.player;if(!P||!P.alive||Main.paused||Main.overlay||G.st==='menu'||G.st==='over')return;this.lastLook=performance.now();
    // a little acceleration: slow drags are precise, fast flicks turn far
    const sp=Math.hypot(dx,dy),acc=1+Math.min(1.2,Math.max(0,sp-6)*.05);
    const Wz=WPN[P.cur];const z=P.zoom>0&&Wz&&Wz.zoom?Wz.zoom[P.zoom-1]/CFG.fov:1;const k=(CFG.tsens||1)*.0048*z*acc*(this.tgt?.75:1);
    P.yaw=wrapA(P.yaw-dx*k);P.pitch=clamp(P.pitch-(CFG.invert?-1:1)*dy*k*.85,-1.53,1.53)},
  press(id,on,v){const P=G.player,M=Main;
    if(id==='fire'){if(on&&P&&!P.alive&&!G.deathCam){M.nextSpec();return}M.ml=on||[...this.btn.values()].some(b=>b.id==='fire');return}
    if(id==='alt'){M.mr=on;return}
    if(id==='score'){M.boardOn=on;UI.board(on);return}
    // long press on the weapon in hand = drop it; a short tap still swaps back (quick switch)
    if(id==='slot'){if(on){if(P&&P.alive&&v===P.cur&&v!=='claw'){clearTimeout(this.slotHold);this.slotHold=setTimeout(()=>{this.slotHold=null;this.buzz(25);playerDrop(G.player)},550);return}}
      else{if(this.slotHold){clearTimeout(this.slotHold);this.slotHold=null;if(P&&P.alive)P.cmd.lastInv=true}return}}
    if(!on)return;this.buzz(8);
    if(id==='duck'){this.duck=!this.duck;this.el.querySelector('.tDuck').classList.toggle('lat',this.duck);return}
    if(id==='pause'){if(M.overlay)M.closeOverlay();M.pause();return}
    if(id==='close'){M.closeOverlay();return}
    if(!P)return;
    if(id==='buy'){if(M.overlay==='buy')M.closeOverlay();else M.openOverlay('buy');return}
    if(id==='zsel'){if(M.overlay==='zsel')M.closeOverlay();else M.openOverlay('zsel');return}
    if(!P.alive)return;
    if(id==='slot'){equip(P,v);return}
    if(id==='light'&&P.team===TH){P.flash=!P.flash;AU.play('ui',{vol:.35,rate:.6});return}
    if(id==='nv'&&P.team===TZ){P.nv=!P.nv;AU.play('ui',{vol:.35,rate:.5});return}},
  buzz(ms){if(CFG.haptic===false)return;try{navigator.vibrate&&navigator.vibrate(ms)}catch(_){}},
  // ---------- aim assist + auto-fire ----------
  assist(dt){const P=G.player;this.tgt=null;this.autoF=false;if(!P||!P.alive||Main.overlay||G.st==='menu')return;const W=WPN[P.cur];if(!W||W.kind==='nade')return;
    const zt=P.team===TZ,melee=zt||W.kind==='melee';const eye=actorEye(P);const ex=eye.x,ey=eye.y,ez=eye.z;aimDir(P.yaw,P.pitch,_tdir);
    const maxD=melee?(zt?2.4:(W.range?W.range[0]+.2:2.3)):70;let best=null,bs=1e9;
    for(const t of G.actors){if(!t.alive||t===P||t.team===P.team)continue;if(t.team===TZ&&t.zc==='runner'&&t.skillT>0&&!zt)continue;
      const ty=t.c.y+(t.team===TZ?1.15:1.2);const dx=t.c.x-ex,dy=ty-ey,dz=t.c.z-ez,d=Math.hypot(dx,dy,dz);if(d>maxD||d<.2)continue;
      const ang=Math.acos(clamp((dx*_tdir.x+dy*_tdir.y+dz*_tdir.z)/d,-1,1));const body=Math.atan(.42/d);const cone=melee?.75:Math.max(.07,body*3.2);if(ang>cone)continue;
      if(!losClear(ex,ey,ez,t.c.x,ty,t.c.z))continue;const s=ang/cone+d*.004;if(s<bs){bs=s;best={dx,dy,dz,d,ang,body}}}
    if(!best)return;this.tgt=best;
    // gentle pull toward the body (stronger while the player is actively aiming), never a hard snap
    if(CFG.aimAssist!==false&&!melee){const wy=Math.atan2(-best.dx,-best.dz),wp=Math.atan2(best.dy,Math.hypot(best.dx,best.dz));const act=performance.now()-this.lastLook<250||Main.ml;
      const k=Math.min(1,dt*(act?3.2:1.6));P.yaw=wrapA(P.yaw+wrapA(wy-P.yaw)*k);P.pitch+=(wp-P.pitch)*k*.8}
    if(CFG.autoFire===false)return;
    const on=melee?best.ang<.6:best.ang<best.body*1.15+.01;if(!on)return;
    const am=P.ammo&&P.ammo[P.cur];if(!melee&&am&&am.mag<=0)return;
    // semi-autos need a fresh press for every shot
    this.fr++;this.autoF=((W.semi&&!(W.dual&&P.dualB))||W.burst)&&!melee?(this.fr%3!==0):true},
  // ---------- weapon bar ----------
  slots(P){if(P.team===TZ){const s=[['claw',null]];if(P.bombs>0)s.push(['zbomb',null]);return s}
    const s=[];for(const id of [P.inv[1],P.inv[2],P.inv[3]||'knife'])if(id)s.push([id,null]);for(const k of ['he','frost','flare'])if(P.inv[k]>0)s.push([k,P.inv[k]]);return s},
  drawBar(P){const S=this.slots(P);const key=P.team+'|'+P.cur+'|'+S.map(s=>s[0]+(s[1]||'')).join(',')+'|'+(P.bombs||0);
    if(key!==this.wKey){this.wKey=key;const L=LI();
      this.bar.innerHTML=S.map(([id,n])=>{const W=WPN[id];const ic=id==='claw'?miniIcon('claw'):W&&W.model?gunIcon(W.model,id==='zbomb'||W.kind==='nade'?22:20):'';
        return `<button class="tb ws${P.cur===id?' cur':''}" data-t="slot" data-v="${id}"><img src="${ic}"><em>${id==='zbomb'?'×'+P.bombs:n?'×'+n:''}</em><i class="am"></i></button>`}).join('')}
    const b=this.bar.querySelector('.ws.cur .am');if(b){const am=P.ammo&&P.ammo[P.cur];const s=am&&P.team===TH&&WPN[P.cur].kind!=='melee'?am.mag+'/'+am.res:'';if(b.textContent!==s)b.textContent=s}},
  // ---------- per frame ----------
  update(){if(!this.el)return;if(!this.on){this.el.classList.add('off');return}const P=G.player,M=Main;const play=!!P&&G.st!=='menu'&&G.st!=='over'&&!M.paused&&UI.open!=='results';
    if(play&&P)this.drawBar(P);
    if(this.lockEl){const on=!!(this.tgt&&play);if(on!==this.lockOn){this.lockOn=on;this.lockEl.classList.toggle('on',on)}}
    const st=(play?1:0)|(M.overlay?2:0)|(P&&P.team===TZ?4:0)|(P&&P.alive?8:0);if(st===this.st)return;this.st=st;
    const el=this.el;el.classList.toggle('off',!play);el.classList.toggle('ov',!!M.overlay);el.classList.toggle('zt',!!(st&4));el.classList.toggle('dead',!(st&8));
    if(!play||M.overlay){for(const [pid,b] of this.btn){b.el.classList.remove('on');this.press(b.id,false,b.v)}this.btn.clear();this.look.clear();this.stickId=null;this.mv.x=this.mv.y=0;this.stick.classList.remove('act','held');this.stick.style.left=this.stick.style.top='';this.duck=false;el.querySelector('.tDuck').classList.remove('lat');M.ml=M.mr=false}}};
const _tdir=new THREE.Vector3();
(function(){
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);TOUCH.update()};
  const ui0=UI.init.bind(UI);UI.init=function(){ui0();TOUCH.init()};
  const sh=UI.show.bind(UI);UI.show=function(id){sh(id);TOUCH.st=-1;TOUCH.update()};
  const hide=UI.hideAll.bind(UI);UI.hideAll=function(){hide();TOUCH.st=-1;TOUCH.update()};
  // haptics: a tick on hits, a thump when hurt
  const hm=HUD.hitmark.bind(HUD);HUD.hitmark=function(hs){hm(hs);if(TOUCH.on)TOUCH.buzz(hs?22:10)};
  const hr=HUD.hurt.bind(HUD);HUD.hurt=function(k){hr(k);if(TOUCH.on)TOUCH.buzz(Math.round(20+k*40))};
  // keyboard hints become button hints
  const rs=HUD.roundStart.bind(HUD);HUD.roundStart=function(){rs();if(TOUCH.on)HUD.note(LI()?'Tap BUY → Quick buy · aim near a zombie and it fires for you':'구매 → 추천 구매 한 번이면 끝 · 좀비 근처로 조준하면 자동 사격',4)};
  const inf=HUD.infected.bind(HUD);HUD.infected=function(s){inf(s);if(TOUCH.on)HUD.note(LI()?'Run at humans — claws swing by themselves · ⚡ skill':'사람에게 달려가면 자동으로 할퀴어요 · ⚡ 스킬',6)}})();

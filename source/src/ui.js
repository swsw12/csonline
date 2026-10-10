'use strict';
// ============ HUD and menus (DOM over the canvas) ============
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// full-body front "paper doll" portrait from a character's skin atlas
const PORTRAITS={};
function portrait(key,s){s=s||70;const k=key+':'+s;if(PORTRAITS[k])return PORTRAITS[k];const A=charAsset(key);const d=A.def;
  const fm={};for(const f of A.faces)if(f.fk==='front')fm[f.pi]=f;let top=0;for(const p of d.parts)top=Math.max(top,p.c[1]+p.s[1]/2);
  const W=Math.ceil(1.5*s),H=Math.ceil((top+.08)*s);const [cv,x]=mkCanvas(W,H);x.imageSmoothingEnabled=false;
  const order=d.parts.map((p,i)=>i).sort((a,b)=>(d.parts[b].c[2]-d.parts[b].s[2]/2)-(d.parts[a].c[2]-d.parts[a].s[2]/2));
  for(const i of order){const p=d.parts[i],f=fm[i];if(!f||p.b>=14)continue;const dx=W/2-(p.c[0]+p.s[0]/2)*s,dy=H-(p.c[1]+p.s[1]/2)*s-.04*s;x.drawImage(A.canvas,f.x,f.y,f.w,f.h,Math.round(dx),Math.round(dy),Math.round(p.s[0]*s),Math.round(p.s[1]*s))}
  return PORTRAITS[k]=cv.toDataURL()}
// small procedural icons for the kill feed
const MINI={};
function miniIcon(k){if(MINI[k])return MINI[k];const [cv,x]=mkCanvas(k==='claw'?22:16,16);x.fillStyle='#e8e4d8';
  if(k==='claw'){for(let i=0;i<3;i++){for(let j=0;j<11;j++){x.fillRect(3+i*6+Math.round(j*.45),2+j,2,1)}}}
  else if(k==='skull'){x.fillRect(3,2,10,8);x.fillRect(5,10,6,3);x.fillStyle='#000';x.fillRect(5,5,2,2);x.fillRect(9,5,2,2);x.fillRect(7,8,2,1);x.fillRect(6,11,1,2);x.fillRect(9,11,1,2)}
  else if(k==='fall'){x.fillRect(7,1,2,9);x.fillRect(4,8,8,2);x.fillRect(6,10,4,2);x.fillRect(7,12,2,2)}
  else if(k==='bio'){for(let a=0;a<3;a++){const an=a/3*TAU-Math.PI/2;x.beginPath();x.arc(8+Math.cos(an)*4,8+Math.sin(an)*4,3.2,0,TAU);x.fill()}x.fillStyle='#000';x.beginPath();x.arc(8,8,2,0,TAU);x.fill()}
  else if(k==='lock'){x.fillRect(3,7,10,8);x.fillRect(5,2,2,6);x.fillRect(9,2,2,6);x.fillRect(5,2,6,2)}
  return MINI[k]=cv.toDataURL()}
function weaponIcon(w,h){if(w==='claw')return miniIcon('claw');if(w==='fall')return miniIcon('fall');const W=WPN[w];if(W&&W.model)return gunIcon(W.model,h||16);return miniIcon('skull')}
const _dn=new THREE.Vector3();
// ---------- fullscreen (lobby/pause/options buttons, Alt+Enter) ----------
const FS={
  el(){return document.fullscreenElement||document.webkitFullscreenElement||null},
  ok(){const d=document.documentElement;return !!(d.requestFullscreen||d.webkitRequestFullscreen)},
  standalone(){return !!(navigator.standalone||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches)},
  on(){return !!this.el()},
  toggle(){const d=document.documentElement;if(!this.ok()){this.noApi();return}try{
      if(this.on()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);return}
      if(document.fullscreenEnabled===false&&!document.webkitFullscreenEnabled){this.fail();return}
      const p=(d.requestFullscreen||d.webkitRequestFullscreen).call(d,{navigationUI:'hide'});
      if(p&&p.then)p.then(()=>{if(typeof TOUCH!=='undefined'&&TOUCH.on)try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>this.fail())}catch(_){this.fail()}},
  // embedded pages (an iframe without allow=fullscreen) refuse: say so instead of doing nothing
  // iPhone Safari has no fullscreen API for pages: the only way is installing the page to the home screen
  noApi(){const L=LI();FS.toast(this.standalone()?(L?'Already full screen.':'이미 전체화면으로 실행 중이에요.'):(L?'This browser has no fullscreen for web pages. Share → Add to Home Screen, then open it from the home screen.':'이 브라우저는 웹 전체화면을 지원하지 않아요. 공유 버튼 → 「홈 화면에 추가」 후 홈 화면 아이콘으로 열면 전체화면이에요.'))},
  fail(){const L=LI();FS.toast(L?'Fullscreen is blocked on this page — open the game in its own tab (or use F11).':'이 화면에서는 전체화면이 막혀 있어요 — 게임을 새 탭에서 열거나 F11을 눌러 주세요.')},
  toast(msg,ms){let t=$('fsToast');if(!t){t=document.createElement('div');t.id='fsToast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('on');clearTimeout(this.tt);this.tt=setTimeout(()=>t.classList.remove('on'),ms||3200)},
  label(){const L=LI();return this.on()?(L?'Windowed':'창 모드'):(L?'Fullscreen':'전체화면')},
};
// keep every fullscreen button's label in step (screens rebuilt by the resize that fullscreen causes are caught by the later passes)
FS.sync=()=>{for(const b of document.querySelectorAll('[data-act="full"] span,[data-act="full"].fslbl'))b.textContent=FS.label()};
for(const ev of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(ev,()=>{FS.sync();setTimeout(FS.sync,120);setTimeout(FS.sync,500)});
// ---------- phone: switch to landscape and lock it (for players who keep the phone's auto-rotate off) ----------
// Android Chrome only allows screen.orientation.lock() while fullscreen, so: fullscreen first, then lock.
// iPhone Safari has neither, so there the button explains the two ways (Control Center rotation lock / home-screen app).
const ROT={
  can(){try{return !!(screen.orientation&&screen.orientation.lock)}catch(_){return false}},
  go(){const L=LI(),d=document.documentElement;
    const lock=()=>{try{return screen.orientation.lock('landscape').then(()=>true,()=>false)}catch(_){return Promise.resolve(false)}};
    const hint=()=>FS.toast(L?'Your phone will not rotate by itself. Turn off Portrait Orientation Lock in Control Center (iPhone) or switch Auto-rotate on, or use Share → Add to Home Screen.':'이 브라우저는 화면 방향을 직접 바꿀 수 없어요. 아이폰은 제어센터에서 「세로 방향 잠금」을 끄고, 안드로이드는 「자동 회전」을 켠 뒤 가로로 돌려 주세요. (또는 홈 화면에 추가해서 실행)',6000);
    if(!this.can()){hint();return}
    const rq=d.requestFullscreen||d.webkitRequestFullscreen;
    const run=()=>lock().then(ok=>{if(!ok)hint()});
    if(FS.on()||!rq){run();return}
    try{const p=rq.call(d,{navigationUI:'hide'});if(p&&p.then)p.then(run,()=>lock().then(ok=>{if(!ok)hint()}));else setTimeout(run,100)}catch(_){run()}},
};
const HUD={el:{},feedL:[],ann:null,annT:0,noteT:0,hitT:0,hitHs:false,dmgK:0,cd:0,last:0,dmgL:[],dmgPool:[],wIcon:null,
  init(){RADAR.init();for(const id of ['aimInfo','hud','hRound','hTime','hSH','hSZ','hAH','hAZ','hMorale','hFeed','hBig','hSub','hNote','hHPv','hARv','hMoney','hLvl','hWName','hMag','hRes','hNades','hSkill','cross','hit','scope','hSpec','hAR','hAmmo','hBR','hBL','hDaze','dmgLayer','hDmg','hWIcon','hRel'])this.el[id]=$(id)},
  // floating damage numbers: one per target, hits landing in quick succession add up into the same number
  dmgNum(t,v,hs,kill){if(!(v>0)||!this.el.dmgLayer)return;
    // hits on the same target join one number; right after a weapon swap (knife ↔ gun combos) the window is longer so the combo shows as one total
    const P=G.player,win=P&&G.t-(P.swapT==null?-9:P.swapT)<1.5?.95:.45;let d=null;for(const o of this.dmgL)if(o.tg===t&&!o.done&&o.age<win){d=o;break}
    if(d){d.v+=v;d.hs=d.hs||hs;d.kill=d.kill||kill;d.age=Math.min(d.age,.08);d.pop=1}
    else{const el=this.dmgPool.pop()||document.createElement('div');d={tg:t,v,hs,kill,age:0,pop:1,el,ox:(Math.random()<.5?-1:1)*rr(.25,.45),done:false};el.className='dn';this.el.dmgLayer.appendChild(el);this.dmgL.push(d);if(this.dmgL.length>18)this.dmgL[0].age=99}
    d.x=t.head.x;d.y=t.head.y+.42;d.z=t.head.z;
    d.el.textContent=Math.round(d.v).toLocaleString('en-US');d.el.className='dn'+(d.kill?' k':d.hs?' hs':'')+(d.v>=500?' big':'')},
  updateDmg(dt){const L=this.dmgL;if(!L.length)return;const W=innerWidth,H=innerHeight;
    for(let i=L.length-1;i>=0;i--){const d=L[i];d.age+=dt;d.pop=Math.max(0,d.pop-dt*7);const life=d.kill?1.4:1;
      if(d.age>life){d.el.remove();this.dmgPool.push(d.el);L.splice(i,1);continue}
      const right=-Math.cos(R.cam.rotation.y),fwd=Math.sin(R.cam.rotation.y);
      _dn.set(d.x+right*d.ox,d.y+d.age*.55,d.z+fwd*d.ox).project(R.cam);
      if(_dn.z>1||Math.abs(_dn.x)>1.2||Math.abs(_dn.y)>1.2){d.el.style.opacity=0;continue}
      const sx=(_dn.x*.5+.5)*W,sy=(-_dn.y*.5+.5)*H;const sc=1+d.pop*.35+(d.kill?.15:0);
      d.el.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-50%) scale(${sc.toFixed(3)})`;d.el.style.opacity=Math.min(1,(life-d.age)/.35).toFixed(3)}},
  clearDmg(){for(const d of this.dmgL){d.el.remove();this.dmgPool.push(d.el)}this.dmgL=[]},
  show(on){this.el.hud.classList.toggle('off',!on)},
  roundStart(){this.resOff();this.feedL=[];this.el.hFeed.innerHTML='';this.clearDmg();this.announce(T('round')+' '+G.round,'w',2.2);this.note(T('prepHint'),4)},
  // end-of-round card (the 6 s between rounds): who won, the human and zombie MVPs of the round, and a short table of what
  // everyone did this round (kills, infections, damage) with what became of them (survived / infected / host)
  roundResult(win){const L=LI(),A=G.actors.filter(a=>a.r0);if(!A.length)return;
    const D=a=>({a,k:a.kills-a.r0.k,i:a.infects-a.r0.i,dm:Math.max(0,a.dmgDealt-a.r0.dm)});const R=A.map(D);
    const hs=r=>r.dm+r.k*400,zs=r=>r.i*1000+r.k*300+r.dm*.2;
    const hm=R.filter(r=>!(r.a.team===TZ&&r.a.host)).sort((p,q)=>hs(q)-hs(p))[0],zm=R.filter(r=>r.a.team===TZ&&r.i>0).sort((p,q)=>zs(q)-zs(p))[0];
    const fate=a=>a.team===TH?(a.alive?['h',L?'Survived':'생존']:['d',L?'Dead':'사망']):a.host?['z',L?'Host':'숙주']:['z',L?'Infected':'감염'];
    const pic=a=>{try{return portrait(a.team===TZ?'z_'+a.zc:'h_'+a.skin,44)}catch(_){return ''}};
    const card=(r,cls,lbl,txt)=>r?`<div class="rmvp ${cls}"><img src="${pic(r.a)}"><div><small>${lbl}</small><b>${esc(r.a.name)}</b><span>${txt}</span></div></div>`:'';
    const n=v=>Math.round(v).toLocaleString('en-US');
    const rows=R.sort((p,q)=>(hs(q)+zs(q))-(hs(p)+zs(p))).slice(0,8);const P=G.player;
    let el=$('hRRes');if(!el){el=document.createElement('div');el.id='hRRes';$('hud').appendChild(el)}
    el.innerHTML=`<div class="rhd ${win===TH?'h':'z'}"><b>${T('round')} ${G.round} · ${win===TH?T('winH'):T('winZ')}</b><span>${T('human')} ${G.score[TH]} : ${G.score[TZ]} ${T('zombie')}</span></div>
      <div class="rmvps">${card(hm&&(hm.dm>0||hm.k>0)?hm:null,'h',L?'Human MVP':'인간 MVP',`${T('kills')} ${hm?hm.k:0} · ${T('dmg')} ${hm?n(hm.dm):0}`)}${card(zm,'z',L?'Zombie MVP':'좀비 MVP',`${T('infects')} ${zm?zm.i:0} · ${T('kills')} ${zm?zm.k:0}`)}</div>
      <table class="rtbl"><tr><th>${T('name')}</th><th></th><th>${T('kills')}</th><th>${T('infects')}</th><th>${T('dmg')}</th></tr>${rows.map(r=>{const f=fate(r.a);return `<tr class="${r.a===P?'me':''}"><td>${esc(r.a.name)}</td><td class="f ${f[0]}">${f[1]}</td><td>${r.k}</td><td>${r.i}</td><td>${n(r.dm)}</td></tr>`}).join('')}</table>`;
    this.annT=0;this.ann=null;$('hBig').className='a off';// the card carries the result itself
    el.classList.remove('off');el.style.animation='none';void el.offsetWidth;el.style.animation=''},
  resOff(){const el=$('hRRes');if(el)el.classList.add('off')},
  announce(t,cls,dur){this.ann={t,cls};this.annT=dur||3;const b=this.el.hBig;b.textContent=t;b.className='a '+(cls||'w');b.style.animation='none';void b.offsetWidth;b.style.animation=''},
  countdown(s){if(G.st!=='prep')return;this.cd=s},
  note(t,dur){this.el.hNote.textContent=t;this.noteT=dur||2.5;this.el.hNote.classList.add('on')},
  hitmark(hs){this.hitT=.18;this.hitHs=hs;if(!hs)AU.play('hit',{vol:.35})},
  killConfirm(hs){this.hitT=.35;this.hitHs=true},
  hurt(k){R.PU.uDmg.value=Math.min(1,R.PU.uDmg.value+k)},
  flashFrost(){},
  daze(){this.note(T('daze'),2)},
  infected(src){this.announce(src?T('infectedBy',src.name):T('youHost'),'z',3.5);this.note(T('zHint'),6);AU.play('zinfect',{vol:.9})},
  feed(src,w,t,f){const row={k:src?src.name:'',kt:src?src.team:-1,v:t.name,vt:f.infect?TH:t.team,w,hs:f.hs,inf:f.infect,perma:f.perma,me:(src&&src.isPlayer)||t.isPlayer,t:G.t};
    this.feedL.push(row);if(this.feedL.length>6)this.feedL.shift();this.renderFeed()},
  renderFeed(){const h=this.feedL.map(r=>`<div class="fr${r.me?' me':''}">${r.k?`<span class="${r.kt===TZ?'z':'h'}">${esc(r.k)}</span>`:''}<img src="${r.inf?miniIcon('claw'):weaponIcon(r.w,14)}">${r.inf?`<img src="${miniIcon('bio')}">`:''}${r.hs?`<img src="${miniIcon('skull')}">`:''}${r.perma&&!r.hs?`<img src="${miniIcon('lock')}">`:''}<span class="${r.vt===TZ?'z':'h'}">${esc(r.v)}</span></div>`).join('');this.el.hFeed.innerHTML=h},
  update(dt){const P=G.player;if(!P)return;const e=this.el;RADAR.update(dt);if(G.st!=='end'&&$('hRRes'))this.resOff();
    // timers
    if(this.annT>0){this.annT-=dt;if(this.annT<=0){e.hBig.className='a off'}}
    if(this.noteT>0){this.noteT-=dt;if(this.noteT<=0)e.hNote.classList.remove('on')}
    if(this.feedL.length&&G.t-this.feedL[0].t>7){this.feedL.shift();this.renderFeed()}
    this.hitT-=dt;e.hit.className=this.hitT>0?(this.hitHs?'on hs':'on'):'';
    // crosshair gap from current spread
    const W=WPN[P.cur];let gap=6;if(W&&W.spread&&P.alive&&P.team===TH){const sp=curSpread(P,W);gap=clamp(sp*(R.h/2)/Math.tan(R.cam.fov*Math.PI/360),3,60)}
    const showX=P.alive&&!G.spec&&!(P.zoom>0)&&G.st!=='menu';e.cross.style.display=showX?'block':'none';e.cross.style.setProperty('--g',gap.toFixed(1)+'px');e.cross.classList.toggle('z',P.team===TZ);
    e.scope.style.display=P.alive&&P.zoom>0?'block':'none';if(P.zoom>0)e.scope.className=W&&W.kind==='sniper'?'':'r';
    this.updateDmg(dt);
    // reload progress
    {const show=P.alive&&P.team===TH&&P.reloadT>0&&P.relKind==='mag'&&W&&W.reload;e.hRel.style.display=show?'block':'none';if(show)e.hRel.firstChild.style.width=Math.round(clamp(1-P.reloadT/W.reload,0,1)*100)+'%'}
    this.last-=dt;if(this.last>0)return;this.last=.08;
    // who is under the crosshair
    let ai='';if(P.alive&&!G.spec){const e=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const hw=rayCast(e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,60);let best=null,bt=hw?hw.t:60;
      for(const t of G.actors){if(!t.alive||t===P)continue;const c=t.c;const th=rayAABB(e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,c.x-c.hw,c.y,c.z-c.hw,c.x+c.hw,t.head.y+.15,c.z+c.hw,bt);if(th>=0&&th<bt){bt=th;best=t}}
      if(best)ai=`<span class="${best.team===TZ?'z':'h'}">${esc(best.name)}</span>`+(best.team===TZ&&P.team===TH?`<span class="bar"><i style="width:${Math.round(clamp(best.hp/best.maxHp,0,1)*100)}%"></i></span>`:'')}
    if(e.aimInfo.innerHTML!==ai)e.aimInfo.innerHTML=ai;
    // top bar
    e.hRound.textContent=`${T('round')} ${G.round}/${G.rounds}`;const tm=Math.max(0,Math.ceil(G.time));e.hTime.textContent=G.st==='prep'?'0:'+String(tm).padStart(2,'0'):`${Math.floor(tm/60)}:${String(tm%60).padStart(2,'0')}`;
    e.hTime.className=G.st==='prep'?'prep':(G.st==='fight'&&tm<=30?'low':'');
    e.hSH.textContent=G.score[TH];e.hSZ.textContent=G.score[TZ];let h=0,z=0;for(const a of G.actors){if(a.team===TH&&a.alive)h++;if(a.team===TZ&&(a.alive||!a.permaDead))z++}
    e.hAH.textContent=`${T('human')} ${h}`;e.hAZ.textContent=`${T('zombie')} ${z}`;
    e.hMorale.style.display=G.mode==='mut'&&G.moraleLvl>0?'block':'none';e.hMorale.textContent=`${T('morale')} ${G.moraleLvl} · ${T('atk')} ${100+G.moraleLvl*10}%`;
    // countdown
    if(G.st==='prep'&&G.time<=10.5&&this.annT<=0){e.hBig.textContent=T('prep',Math.max(1,Math.ceil(G.time)));e.hBig.className='a cd'+(G.time<3.5?' hot':'')}
    else if(G.st==='prep'&&this.annT<=0){e.hBig.textContent=T('prep',Math.ceil(G.time));e.hBig.className='a sm'}
    // vitals
    const zt=P.team===TZ;e.hud.classList.toggle('zt',zt);
    e.hHPv.textContent=Math.max(0,Math.ceil(P.hp));e.hARv.textContent=Math.ceil(P.armor);e.hAR.style.display=P.armor>0||!zt?'flex':'none';
    e.hHPv.className=(!zt&&P.hp<35)||(zt&&P.hp<P.maxHp*.25)?'low':'';
    e.hMoney.textContent='$ '+P.money;
    {const dr=Math.round(P.dmgRound||0);const txt=dr>0||!zt?`${T('dmgRound')} <b>${dr.toLocaleString('en-US')}</b>`:'';if(e.hDmg.innerHTML!==txt)e.hDmg.innerHTML=txt}
    {const ik=zt?(P.cur==='zbomb'?'zbomb':'claw'):P.cur;if(this.wIcon!==ik){this.wIcon=ik;const src=ik==='claw'?miniIcon('claw'):ik&&WPN[ik]&&WPN[ik].model?gunIcon(WPN[ik].model,30):'';if(src)e.hWIcon.src=src;e.hWIcon.style.display=src?'block':'none';e.hWIcon.className=ik==='claw'?'cl':''}}
    e.hLvl.style.display=zt?'block':'none';if(zt){const Z=ZCLASS[P.zc];e.hLvl.innerHTML=`<b>${Z.n[LI()]}</b> ${P.host?'<span class="host">HOST</span> ':''}${T('lvl')}.${P.lvl}`}
    // weapon / skill
    if(zt){e.hAmmo.style.display='none';e.hWName.textContent=P.cur==='zbomb'?T('bomb'):WPN.claw.n[LI()];const Z=ZCLASS[P.zc];
      e.hSkill.style.display='block';e.hSkill.innerHTML=`<span class="k">G</span> ${Z.sk?Z.sk[LI()]:T('skill')}: ${P.skillCD>0?Math.ceil(P.skillCD)+'s':`<b>${T('ready')}</b>`}${P.skillT>0?' ▲':''}<br><span class="k">4</span> ${T('bomb')} ×${P.bombs}  <span class="k">N</span> ${T('nv')} ${P.nv?'ON':'OFF'}`;e.hNades.textContent=''}
    else{e.hSkill.style.display='none';const am=P.ammo[P.cur];const Wn=WPN[P.cur];e.hWName.textContent=Wn?Wn.n[LI()]+(Wn.dual&&P.dualB?(LI()?' · full auto':' · 연사'):'')+(Wn.stance?(P.hamB?(LI()?' · B knock-away':' · B 날리기'):(LI()?' · A pound':' · A 떡찧기')):''):'';
      if(am){e.hAmmo.style.display='flex';e.hMag.textContent=am.mag;e.hRes.textContent='/ '+am.res;e.hMag.className=am.mag<=Math.ceil(Wn.mag*.2)?'low':''}else e.hAmmo.style.display='none';
      e.hNades.textContent=['he','frost','flare'].filter(k=>P.inv[k]>0).map(k=>({he:'HE',frost:'FROST',flare:'FLARE'})[k]).join(' · ')+(P.flash?'  ☀':'')+nyHud(P)}
    {const Ls=P.nyL||{};const s=P.team===TH?NY_CH.map(c=>`<b class="${Ls[c]?'on':''}">${c}</b>`).join('')+(P.nyFree>0?`<small>${T('nyFree')} ×${P.nyFree}</small>`:''):'';if(this.nyS!==s){this.nyS=s;$('hNY').innerHTML=s}}
    // spectate / revive info
    let sp='';if(!P.alive){if(P.team===TZ&&!P.permaDead&&G.st==='fight'){sp=G.mode==='mut'?T('reviveIn',Math.max(1,Math.ceil(P.reviveT))):T('respawnIn',Math.max(1,Math.ceil(P.respawnT)))}else if(G.st==='fight'||G.st==='end')sp=T('permaDead')
      if(G.spec)sp+=`<br><small>${T('spec')}: <b class="${G.spec.team===TZ?'z':'h'}">${esc(G.spec.name)}</b> — ${T('specHint')}</small>`;else if(G.killer)sp+=`<br><small>${T('killedBy',esc(G.killer.name))}</small>`}
    e.hSpec.innerHTML=sp;e.hSpec.style.display=sp?'block':'none'}};
// ---------------- menus ----------------
// n small skulls (difficulty rank)
function skulls(n){const s='<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M8 1C4.1 1 1.5 3.6 1.5 7c0 2.1 1 3.6 2.5 4.4V14h2v-1.5h1V14h2v-1.5h1V14h2v-2.6c1.5-.8 2.5-2.3 2.5-4.4C14.5 3.6 11.9 1 8 1zM5.3 9.2a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zm5.4 0a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z"/></svg>';return s.repeat(n)}
const CFG=Object.assign({mode:'mut',map:'q7',minimap:true,bots:15,diff:1,rounds:7,time:180,skin:'guard',zclass:'rager',sens:1.6,fov:74,scale:'auto',bloom:true,shadow:true,vol:.7,music:true,gamma:1,invert:false},LS.get('cfg',{}));
function saveCfg(){LS.set('cfg',CFG)}
// v3 renders at full resolution by default: reset the old half-resolution default once
if(CFG.ver!==3){CFG.ver=3;CFG.scale='auto';saveCfg()}
const UI={open:null,
  init(){this.buildTitle();document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;AU.init();AU.play('ui',{vol:.5});this.act(t.dataset.act,t.dataset.v,t)})},
  show(id){for(const s of ['menu','setup','opts','help','pause','results','mp','lobby'])$(s).classList.toggle('off',s!==id);this.open=id;$('menuBg').classList.toggle('off',!id||id==='pause'&&G.st!=='menu')},
  hideAll(){for(const s of ['menu','setup','opts','help','pause','results','mp','lobby'])$(s).classList.add('off');this.open=null;$('menuBg').classList.add('off')},
  act(a,v,el){if(a==='full'){FS.toggle();return}if(a==='rot'){ROT.go();return}if(UI.mpAct&&UI.mpAct(a,v))return;
    if(a==='start'){this.buildSetup();this.show('setup')}
    else if(a==='opts'){this.ret=this.open;this.buildOpts();this.show('opts')}
    else if(a==='help'){this.ret=this.open;this.buildHelp();this.show('help')}
    else if(a==='back'){if(this.open==='lobby')return;this.show(this.ret||'menu');this.ret=null;if(this.open==='menu')this.buildTitle()}
    else if(a==='lang'){LANG=LANG==='ko'?'en':'ko';LS.set('lang',LANG);this.buildTitle();this.show('menu')}
    else if(a==='diffopen'){this.diffSel=CFG.diff;this.diffPick()}
    else if(a==='diffpick'){this.diffSel=+v;this.diffPick()}
    else if(a==='diffok'){CFG.diff=this.diffSel;saveCfg();this.closeDiff();this.buildSetup()}
    else if(a==='diffcancel'){this.closeDiff()}
    else if(a==='set'){const [k,val]=v.split(':');CFG[k]=isNaN(+val)?val:+val;saveCfg();this.buildSetup()}
    else if(a==='opt'){const [k,val]=v.split(':');CFG[k]=val==='true'?true:val==='false'?false:isNaN(+val)?val:+val;saveCfg();applyCfg();this.buildOpts()}
    else if(a==='go'){this.hideAll();Main.startGame()}
    else if(a==='range'){this.hideAll();Main.startRange()}
    else if(a==='resume'){Main.resume()}
    else if(a==='quit'){Main.toTitle()}
    else if(a==='again'){this.hideAll();Main.startGame()}
    else if(a==='buy'){Main.buyItem(v)}
    else if(a==='buycat'){this.buyCat=+v;this.renderBuy()}
    else if(a==='zsel'){Main.pickZ(v)}
    else if(a==='closeov'){Main.closeOverlay()}},
  buildTitle(){$('menu').innerHTML=`<div class="logo"><div class="lz">QUARANTINE<b>Z</b></div><div class="ls">${T('sub')}</div></div>
    <div class="mbtns"><button data-act="start" class="big">${T('start')}</button><button data-act="mp">${T('mp')}</button><button data-act="opts">${T('settings')}</button><button data-act="help">${T('controls')}</button><button data-act="lang">${T('lang')}</button></div>
    <div class="foot">${matchMedia('(pointer:coarse)').matches&&!matchMedia('(pointer:fine)').matches?(LI()?'Needs a keyboard and mouse · ':'키보드와 마우스가 필요합니다 · '):''}v5.2 · ${LI()?'solo vs bots · multiplayer with friends · '+MAPLIST().length+' maps':'봇과 싱글 플레이 · 친구와 멀티플레이 · 맵 '+MAPLIST().length+'개'} · ${LI()?Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+' weapons':'무기 '+Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+'종'}</div>`},
  // difficulty picker: a framed window of four cards (skull rank, colour band, what changes), confirm / cancel
  diffPick(){const L=LI();let el=$('diffPick');if(!el){el=document.createElement('div');el.id='diffPick';$('setup').appendChild(el)}
    const D=[[L?'Bots react slowly, miss a lot':'봇 반응 느림 · 명중률 낮음',L?'Zombies 85% HP · 93% speed':'좀비 체력 85% · 속도 93%',L?'For a first match':'처음 하는 사람 추천'],
      [L?'Standard reactions and aim':'기본 반응속도 · 명중률',L?'Zombies 100% HP · 100% speed':'좀비 체력 100% · 속도 100%',L?'The intended balance':'기본 밸런스'],
      [L?'Quick reactions, frequent headshots':'빠른 반응 · 헤드샷 잦음',L?'Zombies 115% HP · 104% speed':'좀비 체력 115% · 속도 104%',L?'For practised players':'숙련자용'],
      [L?'Near-instant reactions, precise aim':'즉각 반응 · 정밀 조준',L?'Zombies 135% HP · 108% speed':'좀비 체력 135% · 속도 108%',L?'Survive if you can':'살아남을 수 있다면']];
    el.innerHTML=`<div class="dpWin"><div class="dpHead"><b>${T('diffT')}</b><span>${L?'Bot match':'봇전'} · ${(MAPDEFS[CFG.map]||MAPDEFS.q7).n[L]}</span><button class="x" data-act="diffcancel">✕</button></div>
      <div class="dpCards">${D.map((d,i)=>`<div class="dpCard d${i}${this.diffSel===i?' on':''}" data-act="diffpick" data-v="${i}"><div class="band"></div><div class="rank">${skulls(i+1)}</div><div class="nm">${T('d'+i)}</div><div class="en">${['EASY','NORMAL','HARD','EXPERT'][i]}</div><ul>${d.slice(0,2).map(t=>`<li>${t}</li>`).join('')}</ul><div class="tip">${d[2]}</div>${this.diffSel===i?`<div class="sel">${L?'SELECTED':'선택'}</div>`:''}</div>`).join('')}</div>
      <div class="dpFoot"><button class="ok" data-act="diffok">${T('ok')}</button><button data-act="diffcancel">${T('cancel')}</button></div></div>`},
  closeDiff(){const el=$('diffPick');if(el)el.remove()},
  seg(k,opts){return `<div class="seg">${opts.map(([v,l])=>`<button data-act="set" data-v="${k}:${v}" class="${String(CFG[k])===String(v)?'on':''}">${l}</button>`).join('')}</div>`},
  buildSetup(){const L=LI();
    $('setup').innerHTML=`<h2>${T('start')}</h2><div class="setupGrid"><div class="col">
      <label>${T('mode')}</label>${this.seg('mode',[['mut',T('mut')],['orig',T('orig')]])}<p class="desc">${CFG.mode==='mut'?T('mutD'):T('origD')}</p>
      <label>${T('map')}</label>${this.seg('map',MAPLIST().map(id=>[id,MAPDEFS[id].n[L]]))}<p class="desc">${(MAPDEFS[CFG.map]||MAPDEFS.q7).d[L]}</p>
      <label>${T('bots')}</label>${this.seg('bots',[[7,7],[11,11],[15,15],[19,19]])}
      <label>${T('diff')}</label><button class="diffBtn d${CFG.diff}" data-act="diffopen"><span class="sk">${skulls(CFG.diff+1)}</span><b>${T('d'+CFG.diff)}</b><i>▸</i></button>
      <label>${T('rounds')}</label>${this.seg('rounds',[[5,5],[7,7],[9,9]])}
      <label>${T('rtime')}</label>${this.seg('time',[[120,'2'+T('min')],[180,'3'+T('min')],[240,'4'+T('min')]])}
      </div>
      <div class="col"><label>${T('char')}</label><div class="cards">${HSKINS.map(k=>`<div class="card${CFG.skin===k?' on':''}" data-act="set" data-v="skin:${k}"><img src="${portrait('h_'+k,62)}"><span>${HSKIN_N[k][L]}</span></div>`).join('')}</div>
      <label>${T('zcls')}</label><div class="cards">${ZLIST.map(k=>`<div class="card z${CFG.zclass===k?' on':''}" data-act="set" data-v="zclass:${k}"><img src="${portrait('z_'+k,k==='brute'?52:62)}"><span>${ZCLASS[k].n[L]}</span></div>`).join('')}</div>
      <p class="desc">${ZCLASS[CFG.zclass].d[L]}</p></div></div>
      <div class="mbtns row"><button data-act="back">${T('back')}</button><button data-act="go" class="big">${T('play')}</button></div>`},
  optRow(label,k,vals){return `<div class="orow"><label>${label}</label><div class="seg">${vals.map(([v,l])=>`<button data-act="opt" data-v="${k}:${v}" class="${String(CFG[k])===String(v)?'on':''}">${l}</button>`).join('')}</div></div>`},
  buildOpts(){$('opts').innerHTML=`<h2>${T('settings')}</h2><div class="opts">
    ${this.optRow(T('sens'),'sens',[[.6,'0.6'],[1,'1'],[1.6,'1.6'],[2.2,'2.2'],[3,'3'],[4,'4']])}
    ${this.optRow(T('fov'),'fov',[[64,'64'],[70,'70'],[74,'74'],[80,'80'],[88,'88']])}
    ${this.optRow(T('scale'),'scale',[['auto',T('auto')],[.4,'40%'],[.5,'50%'],[.8,'80%'],[1,'100%'],[1.5,'150%'],[2,'200%']])}
    ${this.optRow(T('bloomO'),'bloom',[[true,T('on')],[false,T('off')]])}
    ${this.optRow(T('shadowO'),'shadow',[[true,T('on')],[false,T('off')]])}
    ${this.optRow(T('miniO'),'minimap',[[true,T('on')],[false,T('off')]])}
    ${this.optRow(T('gamma'),'gamma',[[1.15,'-'],[1,'0'],[.85,'+'],[.72,'++']])}
    ${this.optRow(T('vol'),'vol',[[0,'0'],[.3,'30'],[.5,'50'],[.7,'70'],[1,'100']])}
    ${this.optRow(T('music'),'music',[[true,T('on')],[false,T('off')]])}
    ${this.optRow(T('invert'),'invert',[[false,T('off')],[true,T('on')]])}</div>
    <div class="mbtns row"><button data-act="back">${T('back')}</button></div>`},
  buildHelp(){$('help').innerHTML=`<h2>${T('controls')}</h2><div class="keys">${T('keys').map(([k,d])=>`<div><kbd>${k}</kbd><span>${d}</span></div>`).join('')}</div>
    <div class="rules"><b>${T('rulesT')}</b><ul>${T('rules').map(r=>`<li>${r}</li>`).join('')}</ul></div><div class="mbtns row"><button data-act="back">${T('back')}</button></div>`},
  buildPause(){$('pause').innerHTML=`<h2>${T('paused')}</h2>${NET.on?`<p class="hint">${T('mpPaused')}</p>`:''}<div class="mbtns"><button data-act="resume" class="big">${T('resume')}</button><button data-act="opts">${T('settings')}</button><button data-act="help">${T('controls')}</button>${true?`<button data-act="full" class="fslbl">${FS.label()}</button>`:''}<button data-act="rot" class="rotbtn">${LI()?'Landscape lock':'가로모드 고정'}</button><button data-act="quit">${T('quit')}</button></div>`},
  showResults(){const A=G.actors.slice().sort((a,b)=>b.score-a.score);const mvp=A[0];const L=LI();
    $('results').innerHTML=`<h2>${T('results')}</h2><div class="finalScore"><span class="h">${T('humanWins')} ${G.score[TH]}</span> : <span class="z">${G.score[TZ]} ${T('zombieWins')}</span></div>
      <div class="mvp"><img src="${portrait('h_'+mvp.skin,56)}"><div><small>${T('mvp')}</small><b>${esc(mvp.name)}</b><span>${T('kills')} ${mvp.kills} · ${T('infects')} ${mvp.infects} · ${T('dmg')} ${Math.round(mvp.dmgDealt).toLocaleString('en-US')} · ${T('score')} ${Math.round(mvp.score)}</span></div></div>
      ${this.table(A)}<div class="mbtns row">${NET.on?`<button data-act="mpleave">${T('mpLeave')}</button>${NET.host?`<button data-act="mplobby" class="big">${T('mpToLobby')}</button>`:`<span class="mpwait">${T('mpWait')}</span>`}`:`<button data-act="quit">${T('toTitle')}</button><button data-act="again" class="big">${T('again')}</button>`}</div>`;
    Main.unlock();this.show('results')},
  table(A){const mp=NET.on;return `<table class="tbl"><tr><th></th><th>${T('name')}</th><th>${T('kills')}</th><th>${T('infects')}</th><th>${T('deaths')}</th><th>${T('dmg')}</th><th>${T('score')}</th>${mp?'<th>ping</th>':''}</tr>${A.map(a=>`<tr class="${a.isPlayer?'me ':''}${a.team===TZ?'z':'h'}${a.alive?'':' dead'}"><td>${a.team===TZ?'●':'■'}</td><td>${esc(a.name)}${a.net?' <b class="mpp">◆</b>':''}${a.host&&a.team===TZ?' <i>HOST</i>':''}</td><td>${a.kills}</td><td>${a.infects}</td><td>${a.deaths}</td><td class="dmg">${Math.round(a.dmgDealt).toLocaleString('en-US')}</td><td>${Math.round(a.score)}</td>${mp?`<td>${a.net?(NET.host&&a.isPlayer?'—':a.ping>=0&&a.ping!=null?a.ping+'ms':(a.isPlayer?'':'—')):'BOT'}</td>`:''}</tr>`).join('')}</table>`},
  board(on){const b=$('board');b.classList.toggle('off',!on);if(!on)return;const A=G.actors.slice().sort((a,b)=>(a.team-b.team)||(b.score-a.score));
    b.innerHTML=`<h3>${T('board')} — ${G.mode==='mut'?T('mut'):T('orig')} · ${T('round')} ${G.round}/${G.rounds}</h3><div class="finalScore sm"><span class="h">${T('human')} ${G.score[TH]}</span> : <span class="z">${G.score[TZ]} ${T('zombie')}</span></div>${this.table(A)}`},
  // buy menu (CS style: category column + items, number keys)
  buyCat:0,
  statBars(W){const L=LI();if(W.kind==='melee'){const pw=Math.sqrt(W.dmg[1]/400),rt=1/W.rate[0]/2.2,kb=W.kb[1]/24,mob=(W.speed-.7)/.32;return this.bars([[L?'PWR':'위력',pw],[L?'ROF':'속도',rt],[L?'KB':'넉백',kb],[L?'MOB':'기동',mob]])}
    const n=(W.pellets||W.fan||W.slugs||1)*(W.cone?W.cone.ticks*1.5:1);return this.bars([[L?'PWR':'위력',Math.sqrt(W.dmg*n/400)],[L?'ROF':'연사',(W.rpm||0)/1500],[L?'KB':'넉백',W.kb*n*(W.rpm||60)/60/50+(W.proj?.35:0)],[L?'MOB':'기동',(W.speed-.7)/.32]])},
  bars(list){return `<span class="sbs">${list.map(([n,v])=>`<span class="sb"><em>${n}</em><i><u style="width:${Math.round(clamp(v,.05,1)*100)}%"></u></i></span>`).join('')}</span>`},
  wTags(W,id){const L=LI();if(W&&W.ny)return nyTags(W,L);const t=[];if(EQUIP[id]){return ({armor:L?'Absorbs claw hits':'할퀴기를 막아 감염을 늦춤',ammo:L?'Refill reserve ammo':'예비 탄약 가득',})[id]}
    if(id==='he')return L?'Blast + knockback':'폭발 피해 + 넉백';if(id==='frost')return L?'Freezes zombies 3s':'좀비를 3초간 얼림';if(id==='flare')return L?'Lights the area 25s':'주변을 25초간 밝힘';
    if(W.pellets)t.push((L?'Pellets ×':'산탄 ×')+W.pellets);if(W.burst)t.push(L?'3-round burst':'3점사');if(W.dual)t.push(L?'Akimbo':'쌍권총');if(W.zoom)t.push(L?'Scope':'조준경');
    if(W.spin)t.push(L?'Spin-up':'예열 회전');if(W.proj)t.push(L?'Explosive':'폭발 유탄');if(W.bolt)t.push(L?'Bolt-action':'볼트액션');if(W.kind==='melee')t.push(L?'Melee · RMB chop':'근접 · 우클릭 강타');
    if(W.mag)t.push((L?'Mag ':'탄창 ')+W.mag+(W.semi&&!W.burst&&!W.bolt?(L?' · semi':' · 반자동'):!W.semi&&!W.burst?(L?' · auto':' · 자동'):''));return t.join(' · ')},
  // everything is free: the right-hand column tells what the player has, what is used up this round and what is locked (loadout.js);
  // the three saved sets sit over the categories
  renderBuy(){const P=G.player;const L=LI();const cat=BUY_MENU[this.buyCat];
    const items=cat.items.map((id,i)=>{const W=WPN[id],E=EQUIP[id];if(!W&&!E)return '';const nm=(W||E).n[L],st=ldItemState(P,id);
      const icon=W&&W.model?`<img src="${gunIcon(W.model,26)}">`:id==='armor'?'<b class="ico">◆</b>':'<b class="ico">▤</b>';
      return `<div class="bi${st.ok?'':' na'}${st.own?' own':''}${st.lk?' lk':''}" data-act="buy" data-v="${id}"><span class="n">${i+1}</span>${icon}<div class="bn"><b>${nm}</b><small>${this.wTags(W||{},id)}</small></div>${W&&(W.dmg||W.kind==='melee')?this.statBars(W):'<span class="sbs"></span>'}<span class="c">${st.t}</span></div>`}).join('');
    $('buy').innerHTML=`<h3>${T('buyT')} <span class="bfree">${T('ldFree')}</span></h3>${ldSetsHTML(P,false)}<div class="bwrap"><div class="cats">${BUY_MENU.map((c,i)=>`<div class="cat${i===this.buyCat?' on':''}" data-act="buycat" data-v="${i}"><span class="n">${i+1}</span>${c.n[L]}</div>`).join('')}</div><div class="items">${items}</div></div><p class="hint">${T('buyHint')}</p>`},
  renderZsel(){const L=LI();const P=G.player;$('zsel').innerHTML=`<h3>${T('zselT')}</h3><div class="cards wide">${ZLIST.map((k,i)=>{const Z=ZCLASS[k];return `<div class="card z${P.zpick===k?' on':''}" data-act="zsel" data-v="${k}"><span class="n">${i+1}</span><img src="${portrait('z_'+k,k==='brute'?52:62)}"><span>${Z.n[L]}</span><small>HP ${Z.hp} · ${L?'SPD':'속도'} ${Z.speed}</small><p>${Z.d[L]}</p></div>`}).join('')}</div><p class="hint">${T('zselHint')}</p>`},
};

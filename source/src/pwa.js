'use strict';
// ============ the game as an app (v6.81): 홈 화면에 추가, the service worker, a new version's banner ============
// The owner's 4번: on an iPhone the browser's bars eat the screen (Safari has no fullscreen for a page); added to the home screen the
// game opens on its own, full screen, under its own icon. sw.js (the site's root) brings the page from the network first — a new
// version at once, since players on different versions cannot play together — and keeps a copy for a start without a network.
//   Android / desktop Chrome: 앱 설치 — the browser's own prompt (kept from beforeinstallprompt);
//   iPhone / iPad: 홈 화면에 추가 — how to (공유 → 홈 화면에 추가), as Safari has no prompt.
// Both sit in the lobby's utility buttons (on a phone the ⋯ menu), and a phone shows a one-time tip over the lobby, while the game is
// not already running as an app. A page left open for long (an app sits in the background for days) asks version.json (build.py
// writes it with the page's build id) when it comes back to the front, at most every 5 minutes, and every 30 minutes while open: a
// newer build puts a banner up (새 버전 · 새로고침); back after 30 minutes or more on the title with nothing going on, it reloads by
// itself, once per build. Only on the site (https, or localhost for tests), never in the claude.ai artifact or a file opened from disk.
const PWA={bid:'%BUILD_ID%',ev:null,newer:null,hidAt:0,askT:0,
  ICO:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v6.5M9 10.5l3 3 3-3M10 18.5h4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  SHARE:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10H5v11h14V10h-2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  site(){try{return window.top===window&&(location.protocol==='https:'||location.protocol==='http:'&&/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname))}catch(e){return false}},
  app(){try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true}catch(e){return false}},
  ios(){const u=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(u)||/Macintosh/.test(u)&&navigator.maxTouchPoints>1},
  can(){return this.site()&&!this.app()&&(!!this.ev||this.ios())},
  reg(){if(!this.site()||!('serviceWorker' in navigator))return;navigator.serviceWorker.register('/sw.js').catch(e=>console.warn('sw',e&&e.message))},
  label(L){return this.ev?(L?'Install app':'앱 설치'):(L?'Add to Home Screen':'홈 화면에 추가')},
  async install(){if(this.ev){const e=this.ev;try{e.prompt();const c=await e.userChoice;if(c&&c.outcome==='accepted'){this.ev=null;this.put()}}catch(err){console.warn('install',err)}return}
    this.how(this.app()?'app':!this.site()?'none':this.ios()?'ios':'other')},
  // how to: an iPhone / iPad (Safari has no prompt), another browser that gave none, already an app, a page that cannot be one
  how(k){const L=LI();let o=$('pwaWin');if(o)o.remove();o=document.createElement('div');o.id='pwaWin';
    const steps=k==='ios'?[L?`Tap <b>Share</b> ${this.SHARE} — at the bottom of Safari (at the top on an iPad)`:`Safari 아래쪽(아이패드는 위쪽)의 <b>공유</b> ${this.SHARE} 버튼을 눌러요`,L?'Pick <b>Add to Home Screen</b>':'목록에서 <b>홈 화면에 추가</b>를 골라요']
      :k==='other'?[L?'Chrome / Edge: the install icon at the right of the address bar, or the menu → <b>Install app</b> / <b>Add to Home screen</b>':'크롬 · 엣지: 주소창 오른쪽의 설치 아이콘, 또는 메뉴 → <b>앱 설치</b> / <b>홈 화면에 추가</b>',L?'Samsung Internet: the menu → <b>Add page to</b> → <b>Home screen</b>':'삼성 인터넷: 메뉴 → <b>현재 페이지 추가</b> → <b>홈 화면</b>']:[];
    const one=k==='app'?(L?'The game is already running as an app':'이미 앱으로 실행 중이에요'):k==='none'?(L?'Open the game from its site to install it':'게임 사이트 주소로 열면 설치할 수 있어요'):'';
    o.innerHTML=`<div class="pwin" role="dialog" aria-label="${esc(this.label(L))}"><div class="pwh">${this.ICO}<b>${esc(this.label(L))}</b><button class="x" data-pwa="x" aria-label="${L?'Close':'닫기'}">✕</button></div>
      ${steps.length?`<ol class="pwb">${steps.map(t=>`<li>${t}</li>`).join('')}<li>${L?'Open the game from its <b>QUARANTINE Z</b> icon: full screen, no address bar':'홈 화면의 <b>QUARANTINE Z</b> 아이콘으로 열면 주소창 없이 전체 화면이에요'}</li></ol>`:`<p class="pwo">${esc(one)}</p>`}
      ${k==='ios'?`<p class="pwn">${L?'In Chrome or another browser: its menu → Share → Add to Home Screen':'크롬 등 다른 브라우저에선 메뉴 → 공유 → 홈 화면에 추가'}</p>`:''}</div>`;
    document.body.appendChild(o);AU.play('ui',{vol:.3})},
  // the lobby: the utility button, and on a phone the tip (once, until closed)
  put(){const u=document.querySelector('#menu .tutil');if(u){const b=u.querySelector('[data-act="pwa"]');if(b)b.remove();
      if(this.can()){const L=LI(),t=this.label(L),f=u.querySelector('[data-act="full"]');const h=`<button data-act="pwa" class="tpwa" title="${esc(t)}">${this.ICO}<span>${esc(t)}</span></button>`;if(f)f.insertAdjacentHTML('beforebegin',h);else u.insertAdjacentHTML('beforeend',h)}}
    this.tip()},
  tip(){let t=$('pwaTip');const want=this.can()&&typeof TOUCH!=='undefined'&&TOUCH.on&&UI.open==='menu'&&G.st==='menu'&&!LS.get('pwaTip',0)&&!this.newer;
    if(!want){if(t)t.remove();return}if(t)return;const L=LI();t=document.createElement('div');t.id='pwaTip';
    t.innerHTML=`${this.ICO}<span>${L?'Add it to your home screen: full screen, like an app':'홈 화면에 추가하면 앱처럼 전체 화면으로 열려요'}</span><button data-pwa="go">${L?'Add':'추가하기'}</button><button class="x" data-pwa="tipx" aria-label="${L?'Close':'닫기'}">✕</button>`;
    document.body.appendChild(t)},
  // a newer build on the site
  async check(back){if(!this.site())return;this.askT=Date.now();let j=null;try{const r=await fetch('/version.json',{cache:'no-store'});if(r.ok)j=await r.json()}catch(e){}
    if(!j||typeof j.b!=='string'||!j.b||j.b===this.bid)return;this.newer=j;
    if(back&&this.quiet()){let done='';try{done=sessionStorage.getItem('qzAuto')||''}catch(e){}if(done!==j.b){try{sessionStorage.setItem('qzAuto',j.b)}catch(e){}location.reload();return}}
    this.show()},
  quiet(){return G.st==='menu'&&UI.open==='menu'&&!NET.on&&!(typeof MOBL!=='undefined'&&MOBL.typing())&&!document.querySelector('#shopWin,#accWin,#gPop,#gunPop,#mailWin,#rkWin,#invWin,#frWin,#inqWin,#nbWin')},
  // (× puts it away for this visit; a later build brings it back)
  show(){let b=$('pwaNew');let gone='';try{gone=sessionStorage.getItem('qzNewX')||''}catch(e){}const want=!!this.newer&&G.st==='menu'&&gone!==this.newer.b;if(!want){if(b)b.classList.add('off');return}const L=LI(),v=String(this.newer.v||'').slice(0,12);
    if(!b){b=document.createElement('div');b.id='pwaNew';document.body.appendChild(b)}
    b.innerHTML=`<span>${L?`A new version${v?' '+esc(v):''} is out`:`새 버전${v?'('+esc(v)+')':''}이 나왔어요`}</span><button data-pwa="reload">${L?'Reload':'새로고침'}</button><button class="x" data-pwa="newx" aria-label="${L?'Close':'닫기'}">✕</button>`;b.classList.remove('off');this.tip()},
  vis(){if(document.hidden){this.hidAt=Date.now();return}const away=this.hidAt?Date.now()-this.hidAt:0;this.hidAt=0;if(away>=30*60e3||Date.now()-this.askT>5*60e3)this.check(away>=30*60e3)}};
(function(){
  const act0=UI.act;UI.act=function(a,v,el){if(a==='pwa'){PWA.install();const u=document.querySelector('#menu .tutil.open');if(u)u.classList.remove('open');return}return act0.call(this,a,v,el)};
  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-pwa]');if(!b)return;const k=b.dataset.pwa;
    if(k==='x'){const o=$('pwaWin');if(o)o.remove()}else if(k==='go')PWA.install();else if(k==='tipx'){LS.set('pwaTip',1);PWA.tip()}else if(k==='reload')location.reload();else if(k==='newx'){try{sessionStorage.setItem('qzNewX',PWA.newer?PWA.newer.b:'')}catch(e){}PWA.show()}});
  if(!PWA.site())return;
  PWA.reg();
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();PWA.ev=e;try{PWA.put()}catch(err){}});
  addEventListener('appinstalled',()=>{PWA.ev=null;LS.set('pwaTip',1);try{PWA.put()}catch(err){}});
  document.addEventListener('visibilitychange',()=>PWA.vis());
  setTimeout(()=>PWA.check(false),8000);setInterval(()=>{if(!document.hidden)PWA.check(false)},30*60e3);
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{PWA.put();PWA.show()}catch(e){console.error(e)}return r};
  const sh=UI.show;UI.show=function(){const r=sh.apply(this,arguments);try{PWA.tip();PWA.show()}catch(e){}return r};
  // (a match: the tip and the banner go; the title brings them back)
  const ha=UI.hideAll;UI.hideAll=function(){const r=ha.apply(this,arguments);try{PWA.tip()}catch(e){}return r};
  const sm=startMatch;startMatch=function(){const r=sm.apply(this,arguments);try{PWA.tip();PWA.show()}catch(e){}return r};
})();

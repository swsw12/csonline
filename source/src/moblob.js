'use strict';
// ============ the phone lobby (v6.77) ============
// The owner's word: on a phone the lobby was too narrow and cramped to hold what it needs — a lobby made for phones.
// html[data-lob] = 'p' (held upright) or 'l' (sideways) wherever the desktop lobby would not fit — 900 px wide or less, or 520 px tall or
// less — by which way the screen is longer; without it the desktop lobby is as it was. The same lobby is laid out anew by style.css:
//   p — one header row (profile, coins, mail, ⋯), the 빠른 시작 hero with 방 만들기 · 멀티플레이 · 사격장 as three tiles under it, the
//       lower panels as tabs (채팅 · 미션·전적 · 공지) that fill the rest, and the top bar's buttons as a tab bar along the bottom, in
//       thumb's reach (상점 · 미션 · 업적 · 랭킹 · 가방 · 친구);
//   l — the header row with those buttons as icons; under it the hero and the tiles on the left, the tabs on the right (a screen this
//       short had no lower panels at all before).
// The tab picked is kept (LS lseg). A tab not in view shows a red dot when it has something: new chat lines (gchat.js gchDot), a
// mission or achievement to collect (the missions button's dot).
const MOBL={seg:null,obs:null,
  mode(){const w=innerWidth,h=innerHeight;if(w>900&&h>520)return '';return w>h?'l':'p'},
  // a text field has the focus (on a phone, the keyboard is up)
  typing(){const a=document.activeElement;return !!a&&(a.tagName==='TEXTAREA'||a.tagName==='INPUT'&&!/^(range|checkbox|radio|button|submit|reset|color|file|image)$/i.test(a.type||''))},
  apply(){const m=this.mode(),r=document.documentElement,was=r.dataset.lob||'';if(was===m)return;
    // (a phone's keyboard makes the window short while one types: nothing turns sideways under the fingers; leaving the field catches up)
    if(was&&(r.classList.contains('gtype')||this.typing()))return;
    if(m)r.dataset.lob=m;else delete r.dataset.lob;if(document.querySelector('#menu .lobBot'))this.pick(this.cur(),true);
    try{if(typeof MROOM!=='undefined')MROOM.relay()}catch(e){}
    try{if(typeof lobFit==='function')lobFit()}catch(e){}},
  // the tabs there are: the chat (when it can run here), the missions and record, the notices
  have(){const B=document.querySelector('#menu .lobBot');if(!B)return [];return ['chat','rec','news'].filter(s=>B.querySelector(`:scope>.lp[data-seg="${s}"]`))},
  cur(){const H=this.have();let s=this.seg||LS.get('lseg','chat');if(H.length&&!H.includes(s))s=H[0];return s},
  // after every lobby build: the tab row on top of the lower panels
  build(){const B=document.querySelector('#menu .lobBot');if(!B)return;const L=LI(),H=this.have();let row=B.querySelector(':scope>.lseg');
    if(!row){row=document.createElement('div');row.className='lseg';row.setAttribute('role','tablist');B.prepend(row)}
    const lab={chat:L?'Chat':'채팅',rec:L?'Missions':'미션 · 전적',news:L?'News':'공지'};
    row.innerHTML=H.map(s=>`<button type="button" role="tab" data-seg="${s}">${lab[s]}</button>`).join('');
    this.pick(this.cur(),true);this.watch()},
  pick(s,quiet){const B=document.querySelector('#menu .lobBot');if(!B)return;this.seg=s;if(!quiet)LS.set('lseg',s);
    for(const b of B.querySelectorAll(':scope>.lseg [data-seg]')){const on=b.dataset.seg===s;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')}
    for(const p of B.querySelectorAll(':scope>.lp'))p.classList.toggle('on',p.dataset.seg===s);
    try{if(typeof GCH!=='undefined'){GCH.mount();gchDot()}}catch(e){}this.dots();
    if(!quiet&&typeof AU!=='undefined')AU.play('ui',{vol:.3})},
  // the missions tab's dot: what the top bar's missions button carries (a reward to collect)
  dots(){const b=document.querySelector('#menu .lseg [data-seg="rec"]');if(!b)return;
    const want=!!document.querySelector('#menu .lobTop .tbtns .tmis .dot')&&!(this.seg==='rec'&&document.documentElement.dataset.lob);let d=b.querySelector('.dot');
    if(want&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d)}else if(!want&&d)d.remove()},
  watch(){if(this.obs)this.obs.disconnect();const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||typeof MutationObserver==='undefined')return;
    this.obs=new MutationObserver(()=>this.dots());this.obs.observe(tb,{childList:true,subtree:true})}};
// typing in the lobby's chat on a phone: the chat takes the screen (the cards and the tab bar step aside) until the field is left
function mobType(on){const r=document.documentElement;if(on===r.classList.contains('gtype'))return;r.classList.toggle('gtype',on);
  if(!on)setTimeout(()=>MOBL.apply(),80);try{const g=$('gchLog');if(g&&on)g.scrollTop=g.scrollHeight}catch(e){}}
(function(){
  document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.id==='gchIn'&&t.closest('#menu')&&document.documentElement.dataset.lob)mobType(true)});
  document.addEventListener('focusout',e=>{const t=e.target;if(t&&t.id==='gchIn')setTimeout(()=>{const a=document.activeElement;if(!(a&&a.id==='gchIn'))mobType(false)},150)});
  // (pressing 보내기 keeps the field focused, so the keyboard and the chat stay as they are)
  document.addEventListener('mousedown',e=>{const b=e.target&&e.target.closest&&e.target.closest('#gchBox [data-gc="send"]');if(b&&document.documentElement.classList.contains('gtype'))e.preventDefault()});
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{MOBL.build()}catch(e){console.error(e)}return r};
  document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#menu .lseg [data-seg]');if(b)MOBL.pick(b.dataset.seg)});
  // (the mode follows the screen: turning the phone, a window made narrower; a field left gets the shape the window has by then)
  let t=0;const re=()=>{clearTimeout(t);t=setTimeout(()=>MOBL.apply(),60)};addEventListener('resize',re);addEventListener('orientationchange',re);
  document.addEventListener('focusout',e=>{const x=e.target;if(x&&(x.tagName==='INPUT'||x.tagName==='TEXTAREA'))setTimeout(()=>{if(!MOBL.typing())MOBL.apply()},200)});
  MOBL.apply();
})();

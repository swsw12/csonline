'use strict';
// ============ v6.46: a weapon that came in any other way than the shop or a decoder opens a window with its picture ============
// Where they come from: an admin put it straight on the account (gun_notices — qz_me's gun_new and the heartbeat's gun count say there are
// some, qz_gun_notices lists them, qz_gun_seen marks them shown), a letter in the mailbox, a coupon (both shown the moment they are taken).
// The admin's ones wait for the lobby with nothing else open (server notices, the ban window and the new-content window go first);
// a gift from a friend keeps its own window (friends.js), shop and decoder wins keep theirs.
const GUNPOP={busy:false,off:false,
  n(){const me=ACC.signed()&&ACC.me;return me?(me.gunNew|0):0},
  from(src){const L=LI();if(src&&src.mail)return L?`From the letter 「${src.mail}」`:`우편 「${src.mail}」에서 받았어요`;
    if(src&&src.coupon)return L?`Coupon ${src.coupon}`:`쿠폰 보상 · ${src.coupon}`;return L?'An admin put it on your account':'운영자가 지급했어요'},
  // the window: every gun with its picture, its name and its kind, where it came from, OK
  show(guns,src){const G0=[...new Set((guns||[]).filter(g=>WPN[g]))];if(!G0.length)return;const L=LI();let o=$('gunPop');if(o)o.remove();
    o=document.createElement('div');o.id='gunPop';o.setAttribute('role','dialog');
    o.innerHTML=`<div class="gnw"><div class="gnh"><b>${L?(G0.length>1?'New weapons':'New weapon'):'새 무기 지급'}</b><small>${esc(this.from(src))}</small></div>
      <div class="gnl">${G0.map(g=>{const W=WPN[g],kn=(typeof KIND_N!=='undefined'&&KIND_N[W.kind])||['',''];
        return `<div class="gnr"><div class="gni">${W.model?`<img src="${gunIcon(W.model,52)}" alt="">`:''}</div><div class="gnt"><b>${esc(W.n[L])}</b><span>${esc(kn[L])}</span></div></div>`}).join('')}</div>
      <p>${L?'It is yours now — pick it from the buy menu in a match or put it in a preset.':'이제 내 무기예요 — 매치 구매 메뉴와 장비 프리셋에서 고를 수 있어요.'}</p><button data-gn="ok">${L?'OK':'확인'}</button></div>`;
    o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-gn]'))o.remove()});document.body.appendChild(o);AU.play('lvlup',{vol:.6})},
  // the admin's ones: asked only when the count says there are some
  async check(){if(this.off||this.busy||!this.n()||$('gunPop')||(typeof MBOX!=='undefined'&&MBOX.busyUI()))return;this.busy=true;
    try{const r=await ACC.rpc('qz_gun_notices'),list=Array.isArray(r)?r:[];
      if(!list.length){if(ACC.me)ACC.me.gunNew=0}
      else if(!$('gunPop')&&!(typeof MBOX!=='undefined'&&MBOX.busyUI())){this.show(list.map(x=>x.gun),null);
        await ACC.rpc('qz_gun_seen',{p_ids:list.map(x=>+x.id)}).catch(()=>{});await ACC.loadMe().catch(()=>{})}}// (the shop and the inventory see the gun at once)
    catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))this.off=true}
    this.busy=false}};
(function(){
  addEventListener('keydown',e=>{if(e.code==='Escape'&&$('gunPop')){$('gunPop').remove();e.stopPropagation()}},true);
  ACC.sub(()=>{try{if(ACC.signed())setTimeout(()=>GUNPOP.check(),900)}catch(e){console.error(e)}});
  // a window in the way closed, or the lobby came back after a match: ask again
  const WINS=/^(srvWin|giftPop|gPop|accWin|patchWin|shopWin|rkWin|nbWin|invWin|frWin|mailWin)$/;let t=0;
  new MutationObserver(ms=>{if(G.st!=='menu'||!GUNPOP.n())return;for(const m of ms)for(const n of m.removedNodes)if(n.id&&WINS.test(n.id)){clearTimeout(t);t=setTimeout(()=>GUNPOP.check(),500);return}}).observe(document.body,{childList:true});
  const sl=shopLobby;shopLobby=function(){sl();if(ACC.signed()&&GUNPOP.n())setTimeout(()=>GUNPOP.check(),800)};
  const sm=startMatch;startMatch=function(cfg){const o=$('gunPop');if(o)o.remove();return sm(cfg)};
})();

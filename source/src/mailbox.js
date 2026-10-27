'use strict';
// ============ v6.43: the mailbox (rewards an admin sent: qz_mails / qz_mail_claim) and coupons (qz_coupon_redeem) ============
// A letter button sits in the lobby's account chip while signed in, with the number of letters waiting (ACC.me.mailN: qz_me's mail_new,
// kept fresh by the heartbeat's mail count). A new letter opens the mailbox by itself once (localStorage qz_mailSeen: the newest id
// seen). In the mailbox: every letter with its rewards and 받기, 모두 받기, and the coupon box at the bottom.
const SVG_MAIL='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 3h14v10H1zm2.2 1.6L8 8.1l4.8-3.5zM2.6 6v5.4h10.8V6L8 9.9z"/></svg>';
const SVG_TICKET='<svg class="mtk" viewBox="0 0 16 16"><path fill="currentColor" d="M1 4h14v2.4a1.6 1.6 0 000 3.2V12H1V9.6a1.6 1.6 0 000-3.2zm9.5 1.4v1.2h1.2V5.4zm0 2.4v1.2h1.2V7.8zm0 2.4v1.2h1.2v-1.2z"/></svg>';
const MBOX={list:null,busy:false,off:false,res:'',resBad:false,autoAt:0,
  n(){const me=ACC.signed()&&ACC.me;return me?(me.mailN|0):0},
  async load(){if(!ACC.signed()||this.off)return [];
    try{const r=await ACC.rpc('qz_mails');this.list=Array.isArray(r)?r:[];const me=ACC.me;if(me&&(me.mailN|0)!==this.list.length){me.mailN=this.list.length;ACC.emit()}return this.list}
    catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))this.off=true;throw e}},
  // the button in the account chip (shop.js builds the chip again on every lobby build: this goes in after it)
  btn(){const ch=document.querySelector('#menu .lobTop .accChip');if(!ch)return;let b=ch.querySelector('.amail');const on=ACC.signed()&&!this.off;
    if(!on){if(b)b.remove();return}const L=LI(),n=this.n();
    if(!b){b=document.createElement('button');b.className='amail';b.dataset.act='mailbox';const c=ch.querySelector('.acoin');if(c)c.after(b);else ch.prepend(b)}
    b.title=L?'Mailbox and coupons':'우편함 · 쿠폰';const h=SVG_MAIL+(n?`<i class="n">${n>99?'99+':n}</i>`:'');if(b.innerHTML!==h)b.innerHTML=h;b.classList.toggle('has',n>0)},
  // what a bundle holds, in words
  rw(rw){const L=LI(),o=[];if(!rw)return o;
    if(rw.coins)o.push([COIN,fmtC(rw.coins)+(L?' coins':' 코인'),'c']);if(rw.frags)o.push([FRAG,(L?'Fragments ':'해독 조각 ')+fmtC(rw.frags),'f']);
    if(rw.tfrags)o.push([TFRAG,(L?'Awakening fragments ':'각성 조각 ')+fmtC(rw.tfrags),'t']);if(rw.tickets)o.push([SVG_TICKET,(L?'All-Clear decoders ':'격리해제 해독기 ')+fmtC(rw.tickets),'k']);
    if(rw.season_tickets)o.push([SVG_TICKET,(L?'Season decoders ':'시즌 해독기 ')+fmtC(rw.season_tickets),'s']);
    for(const g of rw.guns||[]){const W=WPN[g];o.push([W&&W.model?`<img src="${gunIcon(W.model,26)}" alt="">`:'⌖',W?W.n[L]:g,'g'])}return o},
  chips(rw){return this.rw(rw).map(([i,t,k])=>`<span class="mrw ${k}">${i}<b>${esc(t)}</b></span>`).join('')},
  open(){if($('mailWin'))return;const o=document.createElement('div');o.id='mailWin';o.innerHTML='<div class="pwin"></div>';
    o.addEventListener('click',e=>{if(e.target===o){this.close();return}const b=e.target.closest('[data-mb]');if(!b)return;const k=b.dataset.mb;
      if(k==='x')this.close();else if(k==='get')this.claim(+b.dataset.v,b);else if(k==='all')this.claim(null,b);else if(k==='cp'){const i=o.querySelector('input[name=cp]');this.redeem(i?i.value:'',b)}});
    o.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.name==='cp'){e.preventDefault();this.redeem(e.target.value,o.querySelector('[data-mb=cp]'))}});
    document.body.appendChild(o);this.res='';this.render();this.load().then(()=>{this.seen();this.render()}).catch(e=>{this.res=ACC.errText(e);this.resBad=true;this.render()})},
  close(){const o=$('mailWin');if(o)o.remove();this.seen()},
  seen(){const L0=this.list||[];if(!L0.length)return;const mx=Math.max(...L0.map(m=>+m.id||0));if(mx>(ACC.ls('qz_mailSeen')|0))ACC.ls('qz_mailSeen',mx)},
  render(){const o=$('mailWin');if(!o)return;const L=LI(),M=this.list,cpv=(o.querySelector('input[name=cp]')||{}).value||'';
    const body=M==null?`<p class="mem">${L?'Loading…':'불러오는 중…'}</p>`:!M.length?`<p class="mem">${L?'No letters right now.':'받을 우편이 없어요.'}</p>`
      :M.map(m=>`<div class="ml"><div class="mlh"><b>${esc(m.title)}</b><time>${esc(fmtWhen(m.at).slice(0,10))}${m.expires_at?` · ${esc(fmtWhen(m.expires_at).slice(5,16))}${L?' last day':'까지'}`:''}</time></div>
        ${m.body?`<p>${esc(m.body)}</p>`:''}<div class="mrws">${this.chips(m.rewards)}</div><button data-mb="get" data-v="${+m.id}">${L?'Take':'받기'}</button></div>`).join('');
    o.querySelector('.pwin').innerHTML=`<div class="pwh">${SVG_MAIL}<b>${L?'Mailbox':'우편함'}</b>${M&&M.length?`<small>${M.length}${L?'':'통'}</small>`:''}<button data-mb="x" aria-label="close">×</button></div>
      <div class="pwb">${body}</div>${this.res?`<div class="mres${this.resBad?' bad':''}">${this.res}</div>`:''}
      <div class="pwf"><input name="cp" maxlength="30" placeholder="${L?'Coupon code':'쿠폰 코드'}" autocomplete="off" spellcheck="false" value="${esc(cpv)}"><button data-mb="cp">${L?'Use coupon':'쿠폰 받기'}</button>${M&&M.length>1?`<button class="all" data-mb="all">${L?'Take all':'모두 받기'}</button>`:''}</div>`},
  // what came in, on the account here, and said in the mailbox
  apply(r){const me=ACC.me;if(!me||!r)return;if(r.coins!=null)me.coins=r.coins|0;if(r.fragments!=null)me.frags=r.fragments|0;if(r.tfrags!=null)me.tfrags=r.tfrags|0;
    if(r.tickets!=null)me.tickets=r.tickets|0;if(r.season_tickets!=null)me.sTickets=r.season_tickets|0;if(Array.isArray(r.owned))for(const g of r.owned)me.owned.add(g);
    if(r.left!=null)me.mailN=r.left|0;ACC.saveMe()},
  gotText(g){const L=LI(),parts=this.rw(g).map(x=>x[1]);const had=(g&&g.had||[]).map(id=>WPN[id]?WPN[id].n[L]:id);
    return (parts.length?(L?'Received: ':'받았어요: ')+parts.join(', '):(L?'Nothing new':'새로 받은 건 없어요'))+(had.length?(L?` (already owned: ${had.join(', ')})`:` (이미 가진 무기: ${had.join(', ')})`):'')},
  async claim(id,btn){if(this.busy)return;this.busy=true;if(btn)btn.disabled=true;
    try{const r=await ACC.rpc('qz_mail_claim',id==null?{}:{p_id:id});this.apply(r);this.res=esc(this.gotText(r.got));this.resBad=false;AU.play('buy',{vol:.5});
      const tl=(this.list||[]).filter(m=>(r.claimed||[]).includes(+m.id)).map(m=>m.title);// (v6.46: a gun in it opens the new-weapon window)
      if(r.got&&r.got.guns&&r.got.guns.length&&typeof GUNPOP!=='undefined')GUNPOP.show(r.got.guns,{mail:tl.length===1?tl[0]:(LI()?`${tl.length} letters`:`${tl.length}통`)});
      this.list=(this.list||[]).filter(m=>!(r.claimed||[]).includes(+m.id));await this.load().catch(()=>{})}
    catch(e){this.res=esc(ACC.errText(e));this.resBad=true}
    this.busy=false;ACC.emit();this.render()},
  async redeem(code,btn){const c=String(code||'').trim();if(!c){this.res=esc(LI()?'Type a coupon code':'쿠폰 코드를 적어 주세요');this.resBad=true;this.render();return}
    if(this.busy)return;this.busy=true;if(btn)btn.disabled=true;
    try{const r=await ACC.rpc('qz_coupon_redeem',{p_code:c});if(r&&r.error){this.res=esc(ACC.errText(new Error(r.error)));this.resBad=true}
      else{this.apply(r);this.res=esc((LI()?`Coupon ${r.code} — `:`쿠폰 ${r.code} — `)+this.gotText(r.got));this.resBad=false;AU.play('buy',{vol:.5});if(r.got&&r.got.guns&&r.got.guns.length&&typeof GUNPOP!=='undefined')GUNPOP.show(r.got.guns,{coupon:r.code});const i=$('mailWin')&&$('mailWin').querySelector('input[name=cp]');if(i)i.value=''}}
    catch(e){this.res=esc(ACC.errText(e));this.resBad=true}
    this.busy=false;ACC.emit();this.render()},
  // a new letter opens the mailbox once, in the lobby, when nothing else is open (server notices and the ban window go first: closing
  // them asks again); qz_mails is asked only when the count says something changed, at most every 20 s
  busyUI(){return G.st!=='menu'||!!document.querySelector('#mailWin,#srvWin,#giftPop,#gPop,#gunPop,#accWin,#patchWin,#shopWin,#rkWin,#nbWin,#invWin,#frWin,#inqWin')||(typeof SRVN!=='undefined'&&(SRVN.busy||!!SRVN.ban()))},
  auto(){if(this.off||!this.n()||this.busyUI())return;const L0=this.list,top=L=>Math.max(0,...L.map(m=>+m.id||0));
    if(L0&&L0.length===this.n()){if(top(L0)>(ACC.ls('qz_mailSeen')|0))this.open();return}// (the list already known: no need to ask)
    if(Date.now()-this.autoAt<20e3)return;this.autoAt=Date.now();
    this.load().then(L1=>{if(L1.length&&top(L1)>(ACC.ls('qz_mailSeen')|0)&&!this.busyUI())this.open()}).catch(()=>{})}};
(function(){
  const sl=shopLobby;shopLobby=function(){sl();try{MBOX.btn()}catch(e){console.error(e)}};
  // (the notices loaded and nothing popped up: ask now; a window in the way closed: ask again)
  if(typeof SRVN!=='undefined'){const p0=SRVN.popup;SRVN.popup=function(){const r=p0.apply(this,arguments);if(!$('srvWin'))setTimeout(()=>MBOX.auto(),300);return r}}
  const WINS=/^(srvWin|giftPop|gPop|gunPop|accWin|patchWin|shopWin|rkWin|nbWin|invWin|frWin|inqWin)$/;let awT=0;
  new MutationObserver(ms=>{if(G.st!=='menu'||!MBOX.n())return;for(const m of ms)for(const n of m.removedNodes)if(n.id&&WINS.test(n.id)){clearTimeout(awT);awT=setTimeout(()=>MBOX.auto(),450);return}}).observe(document.body,{childList:true});
  const act0=UI.act;UI.act=function(a,v,el){if(a==='mailbox'){MBOX.open();return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.code==='Escape'&&$('mailWin')){MBOX.close();e.stopPropagation()}},true);
  ACC.sub(()=>{try{MBOX.btn();if(!ACC.signed()){MBOX.list=null;const o=$('mailWin');if(o)o.remove()}else setTimeout(()=>MBOX.auto(),600)}catch(e){console.error(e)}});
  const sm=startMatch;startMatch=function(cfg){const o=$('mailWin');if(o)o.remove();return sm(cfg)};
})();

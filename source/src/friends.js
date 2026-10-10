'use strict';
// ============ Friends and gifts (v6.18) ============
// A friends window (the lobby button 친구, with a red dot while requests wait or gifts are unread): my friend code, adding by code or
// by a nickname only one player has, requests in and out, the friend list (level, when they last played) with a gift button that
// opens the shop in gift mode for that friend (shop.js: SHOP.giftTo). Gifts that came in show once, in a pop-up in the lobby.
// The database decides everything (schema.sql v6.18: qz_friends, qz_friend_add / _answer / _remove, qz_gift, qz_gift_inbox).
const SVG_FRIEND='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M6 2a2.6 2.6 0 110 5.2A2.6 2.6 0 016 2zM1 13.6c.3-2.8 2.4-4.4 5-4.4s4.7 1.6 5 4.4zM12.2 4.5h1.4v2h2v1.4h-2v2h-1.4v-2h-2V6.5h2z"/></svg>';
const SVG_GIFT='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 6h12v3H2zM3 9.6h4.3V15H3zM8.7 9.6H13V15H8.7zM8 5.4C6.6 3 4.2 2.6 4.2 4.1c0 1 1.6 1.3 3.8 1.3zm0 0c1.4-2.4 3.8-2.8 3.8-1.3 0 1-1.6 1.3-3.8 1.3z"/></svg>';
// when a friend last played (their last round or match reward)
function frAgo(t){const L=LI();if(!t)return L?'no games yet':'플레이 기록 없음';const s=Math.max(0,(Date.now()-Date.parse(t))/1000);
  if(s<3600){const m=Math.max(1,Math.round(s/60));return L?m+' min ago':m+'분 전'}if(s<86400){const h=Math.round(s/3600);return L?h+' h ago':h+'시간 전'}
  const d=Math.round(s/86400);return L?d+(d>1?' days ago':' day ago'):d+'일 전'}
const FR={msg:'',ok:false,busy:false,del:null,lastLoad:0,
  open(){let o=$('frWin');if(!o){o=document.createElement('div');o.id='frWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-fr]');if(t)this.act(t.dataset.fr,t.dataset.v)});
      o.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='frIn'){e.preventDefault();this.act('add')}})}
    if($('nbWin')&&typeof NBAN!=='undefined')NBAN.close();this.msg='';this.del=null;this.render();AU.play('ui',{vol:.35});
    if(ACC.signed()){this.lastLoad=Date.now();ACC.loadFriends().then(()=>this.render()).catch(e=>{this.msg=ACC.errText(e);this.ok=false;this.render()})}},
  close(){const o=$('frWin');if(o)o.remove();this.del=null},
  render(){const o=$('frWin');if(!o)return;const L=LI(),signed=ACC.signed(),F=ACC.fr,inp=$('frIn'),keep=inp?inp.value:'';
    const row=(f,btns,sub)=>`<div class="frr"><span class="frlv">Lv.${recLevel(f.xp|0).l}</span><span class="frnm"><b>${esc(f.nickname)}</b><small>#${esc(f.code||'')}${sub?' · '+esc(sub):''}</small></span><span class="frbt">${btns}</span></div>`;
    let body;
    if(!ACC.on)body=`<p class="frn">${L?'Accounts are not set up yet.':'계정 서버가 아직 연결되지 않았어요.'}</p>`;
    else if(!signed)body=`<p class="frn">${L?'Sign in to add friends and send them guns.':'로그인하면 친구를 추가하고 총을 선물할 수 있어요.'}</p><button class="frbig" data-fr="login">${L?'Sign in':'로그인'}</button>`;
    else{const code=(F&&F.code)||ACC.me.fcode||'',fr=F&&F.friends||[],inc=F&&F.incoming||[],out=F&&F.outgoing||[];
      body=`<div class="frme"><span>${L?'My friend code':'내 친구 코드'}</span><b class="frc">#${esc(code||'······')}</b><button data-fr="copy">${L?'Copy':'복사'}</button><small>${L?'Give it to a friend — they can add you at once.':'친구에게 알려 주면 바로 나를 추가할 수 있어요.'}</small></div>
        <div class="fradd"><input id="frIn" maxlength="24" placeholder="${L?'Friend code or nickname':'친구 코드 또는 닉네임'}" autocomplete="off" spellcheck="false"><button data-fr="add"${this.busy?' disabled':''}>${SVG_FRIEND}<span>${L?'Send request':'친구 요청'}</span></button></div>
        ${this.msg?`<div class="frm ${this.ok?'ok':'bad'}">${esc(this.msg)}</div>`:''}
        ${inc.length?`<h5>${L?'Requests for you':'받은 요청'} <i>${inc.length}</i></h5>${inc.map(f=>row(f,`<button class="ok" data-fr="yes" data-v="${esc(f.code)}">${L?'Accept':'수락'}</button><button data-fr="no" data-v="${esc(f.code)}">${L?'Decline':'거절'}</button>`,L?'wants to be friends':'친구 요청')).join('')}`:''}
        <h5>${L?'Friends':'친구'} <i>${fr.length}</i></h5>${fr.length?fr.map(f=>row(f,this.del===f.code
            ?`<button class="bad" data-fr="delok" data-v="${esc(f.code)}">${L?'Remove':'삭제'}</button><button data-fr="delno">${L?'Keep':'취소'}</button>`
            :`<button class="gift" data-fr="gift" data-v="${esc(f.code)}">${SVG_GIFT}<span>${L?'Gift':'선물'}</span></button><button data-fr="del" data-v="${esc(f.code)}">${L?'Remove':'삭제'}</button>`,frAgo(f.last))).join('')
          :`<p class="frn">${L?'No friends yet — add one by their friend code.':'아직 친구가 없어요. 친구 코드로 추가해 보세요.'}</p>`}
        ${out.length?`<h5>${L?'Sent':'보낸 요청'} <i>${out.length}</i></h5>${out.map(f=>row(f,`<button data-fr="cancel" data-v="${esc(f.code)}">${L?'Cancel':'취소'}</button>`,L?'waiting':'수락 대기 중')).join('')}`:''}`}
    o.innerHTML=`<div class="frw"><div class="frh">${SVG_FRIEND}<b>${L?'Friends':'친구'}</b><small>FRIENDS</small><span class="sgap"></span><button class="frx" data-fr="x" aria-label="close">×</button></div><div class="frb">${body}</div></div>`;
    const ni=$('frIn');if(ni)ni.value=keep},
  act(a,v){const L=LI(),F=ACC.fr||{};
    if(a==='x'){this.close();return}
    if(a==='login'){this.close();ACCW.open('in');return}
    if(a==='copy'){const c='#'+(F.code||ACC.me&&ACC.me.fcode||'');this.msg=(L?'Your code: ':'내 친구 코드: ')+c;this.ok=true;this.render();
      try{navigator.clipboard.writeText(c).then(()=>{this.msg=(L?'Copied ':'복사했어요 ')+c;this.render()},()=>{})}catch(e){}return}
    if(a==='add'){const w=(($('frIn')||{}).value||'').trim();if(!w){this.msg=L?'Type a friend code or a nickname':'친구 코드나 닉네임을 적어 주세요';this.ok=false;this.render();return}
      this.run(async()=>{const r=await ACC.friendAdd(w);const i=$('frIn');if(i)i.value='';
        return r.done==='accepted'?(L?'You are friends now (they had asked you too)':'친구가 됐어요 (상대도 요청을 보냈었어요)'):(L?'Request sent':'친구 요청을 보냈어요')});return}
    if(a==='yes'){this.run(async()=>{await ACC.friendAnswer(v,true);return L?'You are friends now':'친구가 됐어요'});return}
    if(a==='no'){this.run(async()=>{await ACC.friendAnswer(v,false);return L?'Declined':'거절했어요'});return}
    if(a==='cancel'){this.run(async()=>{await ACC.friendRemove(v);return L?'Request taken back':'요청을 취소했어요'});return}
    if(a==='del'){this.del=v;this.msg='';this.render();return}
    if(a==='delno'){this.del=null;this.render();return}
    if(a==='delok'){this.del=null;this.run(async()=>{await ACC.friendRemove(v);return L?'Removed from your friends':'친구에서 삭제했어요'});return}
    if(a==='gift'){const f=(F.friends||[]).find(x=>x.code===v);if(!f)return;this.close();SHOP.giftTo(f.code,f.nickname);return}},
  async run(fn){if(this.busy)return;this.busy=true;this.msg='';this.render();
    try{this.msg=await fn();this.ok=true;AU.play('uiok',{vol:.45})}catch(e){this.msg=ACC.errText(e);this.ok=false;AU.play('dry',{vol:.4})}
    this.busy=false;this.render()}};
// gifts that came in: shown once in the lobby (not over a match), then the server marks them seen
const GIFTS={busy:false,
  check(){const me=ACC.signed()&&ACC.me;if(!me||!(me.giftsNew>0)||this.busy||G.st!=='menu'||$('giftPop'))return;this.busy=true;
    ACC.giftInbox().then(list=>{this.busy=false;if(list.length)this.show(list)}).catch(()=>{this.busy=false})},
  show(list){const L=LI(),o=document.createElement('div');o.id='giftPop';
    o.innerHTML=`<div class="gpw"><div class="gph">${SVG_GIFT}<b>${L?(list.length>1?'Gifts for you!':'A gift for you!'):'선물이 도착했어요!'}</b></div>
      ${list.map(g=>{const W=WPN[g.gun];return `<div class="gpr">${W&&W.model?`<img src="${gunIcon(W.model,34)}" alt="">`:''}<span>${L?`<b>${esc(g.from)}</b> sent you the <b>${esc(W?W.n[1]:g.gun)}</b>`:`<b>${esc(g.from)}</b>님이 <b>${esc(W?W.n[0]:g.gun)}</b>을(를) 선물했어요`}</span></div>`}).join('')}
      <p>${L?'It is yours now — pick it from the buy menu in any match.':'이제 내 총이에요 — 매치 구매 메뉴에서 바로 고를 수 있어요.'}</p><button data-gp="ok">${L?'OK':'확인'}</button></div>`;
    o.addEventListener('click',e=>{if(e.target===o||e.target.closest('[data-gp]'))o.remove()});document.body.appendChild(o);AU.play('lvlup',{vol:.6})}};
// the lobby button (after the inventory) and its dot
function frLobby(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||!ACC.on)return;const L=LI();let b=tb.querySelector('.tfr');
  if(!b){b=document.createElement('button');b.className='tfr';b.dataset.act='friends';b.innerHTML=SVG_FRIEND+`<span>${L?'Friends':'친구'}</span>`;
    const after=tb.querySelector('.tinv')||tb.querySelector('.trank')||tb.querySelector('.tmis')||tb.querySelector('.tshop');if(after)after.after(b);else tb.prepend(b)}
  frDot()}
function frDot(){const b=document.querySelector('#menu .tbtns .tfr');if(!b)return;const me=ACC.signed()&&ACC.me,n=me?(me.friendReq|0)+(me.giftsNew|0):0,d=b.querySelector('.dot');
  if(n>0&&!d){const i=document.createElement('i');i.className='dot';i.title=LI()?'Friend requests or gifts waiting':'친구 요청이나 선물이 있어요';b.appendChild(i)}else if(!n&&d)d.remove()}
// a fresh look at requests and gifts now and then while in the lobby
function frPoll(force){if(!ACC.signed()||G.st!=='menu'||document.hidden)return;if(!force&&Date.now()-FR.lastLoad<45e3)return;FR.lastLoad=Date.now();
  ACC.loadFriends().then(()=>{if($('frWin'))FR.render()}).catch(()=>{})}
(function(){const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{frLobby();frPoll()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='friends'){FR.open();return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.key==='Escape'){if($('giftPop'))$('giftPop').remove();else if($('frWin'))FR.close()}});
  ACC.sub(()=>{try{frDot();GIFTS.check()}catch(e){console.error(e)}});
  setInterval(()=>frPoll(false),15e3);
  const sm=startMatch;startMatch=function(cfg){FR.close();const p=$('giftPop');if(p)p.remove();return sm(cfg)}})();

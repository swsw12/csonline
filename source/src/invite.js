'use strict';
// ============ Invites (v6.37): room invites and invite links ============
// Room invites: in a PeerJS waiting room, 「친구 초대」 (or an empty seat) opens the friend list with an invite button on every friend;
// the friend's game shows a pop-up (join / no). It asks the server (qz_invites) every 6 s only while it sits in the lobby with a friend
// online; the heartbeat (qz_ping) and the friend list (qz_friends) carry the count the rest of the time. 「초대 링크」 copies (or shares)
// a link that opens the game and offers to join that room (?join=CODE), with my friend code on it (&ref=CODE).
// Invite links (?ref=FRIENDCODE): an account made within 7 days applies it once (qz_ref_set): coins at once and the two become friends;
// after its 3rd finished match (qz_ref_check, asked after every match until settled) it gets 근하신년 decoders and the inviter coins +
// decoders (10 players at most). The friends window shows my link and how many it brought in. The numbers: gacha_config ref_*.
const SVG_INV='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="1.5" y="3.5" width="13" height="9" rx="1.2"/><path d="M2.2 4.6L8 8.9l5.8-4.3"/></svg>';
const INVT={list:[],shown:{},busy:false,off:false,last:0,lastN:0,sent:{},join:null,
  on(){return typeof ACC!=='undefined'&&ACC.on},
  inRoom(){return typeof NET!=='undefined'&&NET.on&&NET.kind==='peerjs'&&!!NET.code},
  // a link to the game (to a room when given), with my friend code on it when signed in
  url(room){const me=ACC.signed()&&ACC.me,q=[];if(room)q.push('join='+room);if(me&&me.fcode)q.push('ref='+me.fcode);return location.origin+location.pathname+(q.length?'?'+q.join('&'):'')},
  // copy a link; share: the phone's share sheet when there is one (else a copy). done(ok) updates the button
  copy(url,done){try{navigator.clipboard.writeText(url).then(()=>done(true),()=>done(false))}catch(e){done(false)}},
  share(url,title,done){if(navigator.share){navigator.share({title,text:title,url}).then(()=>done(true),e=>{if(!(e&&e.name==='AbortError'))this.copy(url,done)});return}this.copy(url,done)},
  // ---- the invitee: ask for invites while it makes sense, show the newest one ----
  want(){if(this.off||!ACC.signed()||document.hidden||G.st!=='menu'||$('invPop')||(typeof NET!=='undefined'&&NET.on))return 0;
    const me=ACC.me;if((me.invN|0)<this.lastN)this.lastN=me.invN|0;if((me.invN|0)>this.lastN)return 3e3;// the heartbeat or the friend list says one came in
    const F=ACC.fr;return F&&(F.friends||[]).some(frOn)?6e3:0},
  tick(){const w=this.want();if(!w||this.busy||Date.now()-this.last<w)return;this.poll()},
  async poll(){this.busy=true;this.last=Date.now();
    try{const L0=await ACC.invites();this.lastN=L0.length;this.list=L0;const key=x=>x.fc+':'+x.code+':'+x.at,n=L0.find(x=>!this.shown[key(x)]);
      if(n&&G.st==='menu'&&!(typeof NET!=='undefined'&&NET.on)){this.shown[key(n)]=1;this.show(n)}}
    catch(e){if(/Could not find the function|PGRST202/i.test(String(e&&e.message||'')+(e&&e.code||'')))this.off=true}
    this.busy=false},
  pop(id,html,on){let o=$(id);if(o)o.remove();o=document.createElement('div');o.id=id;o.className='ipop';o.innerHTML=`<div class="ipw">${html}</div>`;
    o.addEventListener('click',e=>{const t=e.target.closest('[data-ip]');if(e.target===o){o.remove();return}if(t){o.remove();on(t.dataset.ip,o)}});document.body.appendChild(o);return o},
  roomLine(map,mode,code){const L=LI();const m=typeof MAPDEFS!=='undefined'&&MAPDEFS[map]?mapName(map):(map||'');
    const md=mode?T(['scen','orig','tdm','ffa','bomb','race'].includes(mode)?mode:'mut'):'';return [m,md,(L?'room ':'방 ')+code].filter(Boolean).map(esc).join(' · ')},
  show(x){const L=LI(),left=Math.max(5e3,180e3-(Date.now()-Date.parse(x.at)||0));
    const o=this.pop('invPop',`<div class="iph">${SVG_INV}<b>${L?'Room invite':'방 초대'}</b></div>
      <div class="ipr"><span>${L?`<b>${esc(x.from)}</b>${HOF.chip(x.ft,'sm')} invites you to their room`:`<b>${esc(x.from)}</b>${HOF.chip(x.ft,'sm')}님이 방에 초대했어요`}</span><small>${this.roomLine(x.map,x.mode,x.code)}</small></div>
      <div class="ipb"><button class="ok" data-ip="join">${L?'Join':'참가하기'}</button><button data-ip="no">${L?'No thanks':'거절'}</button></div>`,(a,o)=>{o.remove();
        if(a==='join'){ACC.inviteAnswer(x.fc,x.code).catch(()=>{});this.go(x.code)}else if(a==='no'){ACC.inviteAnswer(x.fc,x.code).catch(()=>{});AU.play('ui',{vol:.3})}});
    AU.play('uiok',{vol:.6});clearTimeout(this.to);this.to=setTimeout(()=>{if(o.isConnected)o.remove()},left)},
  // join a room by its code from the lobby (the multiplayer screen does the rest, as when a public room is clicked)
  go(code){if(typeof NET==='undefined'||NET.on||G.st!=='menu')return;if(typeof FR!=='undefined')FR.close();if(typeof SHOP!=='undefined'&&$('shopWin'))SHOP.close();
    UI.act('mp');setTimeout(()=>{if(!NET.on)UI.act('mproom',code)},60)},
  // a link with ?join=CODE: offer the room once the lobby is up (a tap, so sound and fullscreen may start)
  offer(){const code=this.join;if(!code||G.st!=='menu')return;this.join=null;if(typeof NBAN!=='undefined')NBAN.close();const L=LI();
    this.pop('invPop',`<div class="iph">${SVG_INV}<b>${L?'Room invite link':'방 초대 링크'}</b></div>
      <div class="ipr"><span>${L?`Join room <b>${esc(code)}</b>?`:`방 <b>${esc(code)}</b>에 참가할까요?`}</span><small>${L?'The room has to be open still — its host keeps it.':'방장이 방을 열어 두고 있어야 들어갈 수 있어요.'}</small></div>
      <div class="ipb"><button class="ok" data-ip="join">${L?'Join':'참가하기'}</button><button data-ip="no">${L?'Later':'나중에'}</button></div>`,a=>{if(a==='join')this.go(code)})},
  // ---- the inviter ----
  async send(code){const L=LI();if(!this.inRoom())return;const c=NET.lob&&NET.lob.cfg||{};this.sent[code]=Date.now();this.frMsg('',true);
    try{const r=await ACC.invite(code,NET.code,c.map||'',c.mode||'');this.frMsg((L?'Invited ':'초대했어요 — ')+(r.to||''),true);AU.play('uiok',{vol:.45})}
    catch(e){delete this.sent[code];this.frMsg(ACC.errText(e),false);AU.play('dry',{vol:.4})}
    setTimeout(()=>{if($('frWin')&&!FR.chat)FR.render()},10200)},
  frMsg(m,ok){FR.msg=m;FR.ok=ok;if($('frWin')&&!FR.chat)FR.render()},
  // the waiting room: the buttons by the room code, and a tap on an empty seat
  room(){if(!this.inRoom())return;const L=LI(),h=document.querySelector('#lobby .dpHead > span'),acc=this.on();
    if(h&&!h.querySelector('[data-act="invlink"]'))h.insertAdjacentHTML('beforeend',`${acc?` <button class="mini invb" data-act="invfr">${SVG_INV}${L?'Invite friends':'친구 초대'}</button>`:''} <button class="mini" data-act="invlink">${L?'Invite link':'초대 링크'}</button>`);
    if(acc)for(const e of document.querySelectorAll('#lobby .slot.empty'))if(!e.dataset.act){e.dataset.act='invfr';e.classList.add('invs');e.insertAdjacentHTML('beforeend',`<em class="invh">+ ${L?'Invite':'초대'}</em>`)}},
  // the friends window: my invite link and its record; an invite button on every friend while I am in a room
  fr(){const o=$('frWin');if(!o||FR.chat||!ACC.signed())return;const L=LI(),me=ACC.me,g=ACC.gc(),f=me.ref||{},room=this.inRoom();
    const top=o.querySelector('.frme');
    if(top&&!o.querySelector('.frref')){const u=this.url(),sh=!!navigator.share;
      top.insertAdjacentHTML('afterend',`${room?`<div class="frroom">${SVG_INV}<span>${L?`Inviting to room <b>${esc(NET.code)}</b> — tap 「Invite」 on a friend, or send the link`:`지금 방 <b>${esc(NET.code)}</b>로 초대 중 — 친구의 「초대」를 누르거나 링크를 보내요`}</span><button data-fr="rjoin">${L?'Room link':'방 링크 복사'}</button></div>`:''}
        <div class="frref"><div class="frrh">${SVG_GIFT}<b>${L?'Invite friends to the game':'친구 초대 링크'}</b><span>${L?`brought in ${f.n|0} · paid ${f.paid|0}/${g.ref_cap}`:`초대한 친구 ${f.n|0}명 · 보상 ${f.paid|0}/${g.ref_cap}`}</span></div>
          <div class="frrl"><input readonly value="${esc(u)}" aria-label="link"><button data-fr="rcopy">${L?'Copy':'복사'}</button>${sh?`<button data-fr="rshare">${L?'Share':'공유'}</button>`:''}</div>
          <small>${L?`A friend who signs up with this link gets ${fmtC(g.ref_new_coins)} coins at once and you become friends. After ${g.ref_matches} finished matches they get ${g.ref_new_tickets} 근하신년 decoders and you ${fmtC(g.ref_coins)} coins + ${g.ref_tickets} decoders (up to ${g.ref_cap} friends).`
            :`이 링크로 가입한 친구는 바로 ${fmtC(g.ref_new_coins)}코인을 받고 나와 친구가 돼요. 친구가 ${g.ref_matches}판을 끝내면 친구는 근하신년 해독기 ${g.ref_new_tickets}개, 나는 ${fmtC(g.ref_coins)}코인 + 해독기 ${g.ref_tickets}개 (최대 ${g.ref_cap}명).`}</small>
          ${f.by&&!f.done?`<em class="frmy">${L?`Invited by ${esc(f.by)} — ${f.left|0} more match(es) for your decoders`:`${esc(f.by)}님의 초대로 가입 — 해독기까지 ${f.left|0}판 남음`}</em>`:''}</div>`)}
    if(!room)return;const now=Date.now();
    for(const b of o.querySelectorAll('.frbt [data-fr="chat"]')){const code=b.dataset.v,row=b.closest('.frr');if(!row||row.querySelector('[data-fr="inv"]'))continue;
      const sent=now-(this.sent[code]||0)<10e3,on=!!row.querySelector('em.on');
      b.insertAdjacentHTML('beforebegin',`<button class="inv${on?' hot':''}" data-fr="inv" data-v="${esc(code)}"${sent?' disabled':''}>${SVG_INV}<span>${sent?(L?'Invited ✓':'초대함 ✓'):(L?'Invite':'초대')}</span></button>`)}}};
// ---- invite links: the code of the link that brought this browser, applied once signed in ----
const REFL={busy:false,off:false,
  code(){const v=ACC.ls('qz_ref');if(!v||!v.c)return '';if(Date.now()-(v.t||0)>7*864e5){ACC.ls('qz_ref',null);return ''}return v.c},
  apply(){const c=this.code(),me=ACC.signed()&&ACC.me;if(!c||!me||this.busy||this.off||!me.ref)return;
    if(me.ref.by||me.fcode===c){ACC.ls('qz_ref',null);return}this.busy=true;
    ACC.refSet(c).then(r=>{ACC.ls('qz_ref',null);this.busy=false;this.welcome(r)},e=>{this.busy=false;const m=String(e&&e.message||'')+(e&&e.code||'');
      if(/ref_|not_found|friend_self/.test(m))ACC.ls('qz_ref',null);else this.off=true})},// (the server not updated yet, offline: try again on the next visit)
  welcome(r){const L=LI();INVT.pop('refPop',`<div class="iph">${SVG_GIFT}<b>${L?'Invite applied!':'초대 코드 적용!'}</b></div>
      <div class="ipr"><span>${L?`You came in on <b>${esc(r.by)}</b>'s invite — you are friends now.`:`<b>${esc(r.by)}</b>님의 초대로 들어왔어요 — 이제 친구예요.`}</span>
        <small>${COIN} +${fmtC(r.bonus)} ${L?'coins':'코인'} · ${L?`finish ${r.left} match(es) for ${r.tickets} 근하신년 decoders (and a reward for ${esc(r.by)})`:`${r.left}판을 끝내면 근하신년 해독기 ${r.tickets}개 (${esc(r.by)}님도 보상)`}</small></div>
      <div class="ipb"><button class="ok" data-ip="ok">${L?'OK':'확인'}</button></div>`,(a,o)=>o.remove());AU.play('lvlup',{vol:.6})},
  // after a counted match: settle my invite reward once I have played enough
  after(){const me=ACC.signed()&&ACC.me,f=me&&me.ref;if(!f||!f.by||f.done||this.off)return;
    ACC.refCheck().then(r=>{if(r.state!=='paid')return;const L=LI();
      INVT.pop('refPop',`<div class="iph">${SVG_GIFT}<b>${L?'Invite reward!':'초대 보상 도착!'}</b></div>
        <div class="ipr"><span>${L?`${r.got_tickets} 근하신년 decoders for you`:`근하신년 해독기 ${r.got_tickets}개를 받았어요`}</span><small>${r.inviter_paid?(L?`${esc(r.by)} got their reward too.`:`${esc(r.by)}님에게도 보상이 갔어요.`):(L?'Open them on the shop\'s 근하신년 tab.':'상점의 근하신년 해독기 탭에서 열어요.')}</small></div>
        <div class="ipb"><button class="ok" data-ip="ok">${L?'OK':'확인'}</button></div>`,(a,o)=>o.remove());AU.play('lvlup',{vol:.6})}).catch(()=>{})},
  // the inviter: rewards for players my link brought in, shown once in the lobby
  news(){const me=ACC.signed()&&ACC.me;if(!me||!me.ref||!(me.ref.new>0)||this.busy||G.st!=='menu'||$('refPop')||$('invPop')||$('giftPop'))return;this.busy=true;
    ACC.refInfo().then(r=>{this.busy=false;const got=(r.list||[]).filter(x=>x.new&&x.rewarded);if(!got.length)return;const L=LI();
      INVT.pop('refPop',`<div class="iph">${SVG_GIFT}<b>${L?'Invite rewards!':'초대 보상 도착!'}</b></div>
        ${got.map(x=>`<div class="ipr"><span>${L?`<b>${esc(x.nick)}</b> finished ${x.m} matches`:`<b>${esc(x.nick)}</b>님이 ${x.m}판을 끝냈어요`}</span><small>${COIN} +${fmtC(r.coins)} ${L?'coins':'코인'} · ${L?`${r.tickets} 근하신년 decoders`:`근하신년 해독기 ${r.tickets}개`}</small></div>`).join('')}
        <div class="ipb"><button class="ok" data-ip="ok">${L?'OK':'확인'}</button></div>`,(a,o)=>o.remove());AU.play('lvlup',{vol:.6});ACC.loadMe().catch(()=>{})},()=>{this.busy=false})}};
// ---- hooks ----
(function(){
  // the link that opened the game: ?ref=FRIENDCODE is kept for the sign-up (7 days), ?join=CODE offers the room; both leave the address bar
  try{const q=new URLSearchParams(location.search),j=(q.get('join')||'').toUpperCase().replace(/[^A-Z0-9]/g,''),r=(q.get('ref')||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(r.length===6)ACC.ls('qz_ref',{c:r,t:Date.now()});if(j.length===4)INVT.join=j;
    if(q.has('join')||q.has('ref')){q.delete('join');q.delete('ref');const s=q.toString();history.replaceState(null,'',location.pathname+(s?'?'+s:'')+location.hash)}}catch(e){}
  ACC.sub(()=>{try{REFL.apply();REFL.news()}catch(e){console.error(e)}});
  const c0=ACC.claim.bind(ACC);ACC.claim=async function(st){const r=await c0(st);try{REFL.after()}catch(e){console.error(e)}return r};
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{if(INVT.join)setTimeout(()=>INVT.offer(),900)}catch(e){console.error(e)}return r};
  const ml=UI.mpLobby;UI.mpLobby=function(){const r=ml.apply(this,arguments);try{INVT.room()}catch(e){console.error(e)}return r};
  const fr0=FR.render.bind(FR);FR.render=function(){const r=fr0();try{INVT.fr()}catch(e){console.error(e)}return r};
  const fa0=FR.act.bind(FR);FR.act=function(a,v){const L=LI();
    if(a==='inv'){INVT.send(v);return}
    if(a==='rcopy'||a==='rshare'||a==='rjoin'){const room=a==='rjoin'&&INVT.inRoom()?NET.code:'',u=INVT.url(room),b=document.querySelector(`#frWin [data-fr="${a}"]`);
      const done=ok=>{if(b)b.textContent=ok?(L?'Copied':'복사했어요'):(L?'Copy failed':'복사 실패');if(!ok){const i=document.querySelector('#frWin .frrl input');if(i){i.focus();i.select()}}};
      if(a==='rshare')INVT.share(u,L?'Play QUARANTINE Z with me':'QUARANTINE Z 같이 하자!',done);else INVT.copy(u,done);return}
    return fa0(a,v)};
  const act0=UI.act;UI.act=function(a,v,el){const L=LI();
    if(a==='invfr'){if(typeof FR!=='undefined')FR.open();return}
    if(a==='invlink'){if(!INVT.inRoom())return;const b=document.querySelector('[data-act="invlink"]'),done=ok=>{if(b)b.textContent=ok?(L?'Link copied':'링크 복사됨'):(L?'Copy failed':'복사 실패')},u=INVT.url(NET.code);
      if(typeof TOUCH!=='undefined'&&TOUCH.on)INVT.share(u,(L?'Join my room ':'내 방으로 와! 방 코드 ')+NET.code,done);else INVT.copy(u,done);return}
    return act0.call(this,a,v,el)};
  // the sign-up form: the invite that will apply
  const ar0=ACCW.render.bind(ACCW);ACCW.render=function(){const r=ar0();try{const c=REFL.code(),o=$('accWin');
      if(c&&o&&this.mode==='up'){const b=o.querySelector('.ago');const L=LI(),g=ACC.gc();if(b&&!o.querySelector('.anote.ref'))b.insertAdjacentHTML('afterend',`<p class="anote ref">${SVG_GIFT} ${L?`Invite #${esc(c)}: +${fmtC(g.ref_new_coins)} coins when you sign up, and you become friends`:`초대 코드 #${esc(c)} — 가입하면 +${fmtC(g.ref_new_coins)}코인, 초대한 친구와 바로 친구가 돼요`}</p>`)}}catch(e){console.error(e)}return r};
  addEventListener('keydown',e=>{if(e.key==='Escape'){const p=$('invPop')||$('refPop');if(p){p.remove();e.stopPropagation()}}},true);
  const sm=startMatch;startMatch=function(cfg){const p=$('invPop');if(p)p.remove();return sm(cfg)};
  setInterval(()=>{try{INVT.tick()}catch(e){console.error(e)}},1000)})();

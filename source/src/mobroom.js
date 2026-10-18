'use strict';
// ============ the phone rooms (v6.78): the waiting room and 방 만들기 on a phone ============
// The owner's 1번 after the phone lobby: upright, the waiting room was twice the screen tall (the host scrolled a long way to the
// settings, a player's name hid behind 방장 넘기기) and sideways its room chat sat off the screen; 방 만들기 ran on past the screen too.
// With moblob.js's html[data-lob], after every draw of either window its parts are put in place for a phone (the markup of lobby.js
// stays as it is: other modules find their parts by class inside #lobby / #setup):
//   header · tabs · body · footer, the body = .mrpl (the players: a summary of the room's settings and the slots) and .mrpan (the
//   panel: the settings and the map, the character picks, the room chat — each tagged data-mt, the window's data-mt shows one).
//   Waiting room upright: 플레이어 n/8 · 설정 · 캐릭터 · 채팅, one at a time. Sideways: the players stay on the left, the panel's tabs
//   (설정 · 캐릭터 · 채팅) on the right. 방 만들기: 설정 · 캐릭터.
// A room chat line while its tab is not open puts a red dot on 채팅. Turning the phone draws the open window again for the new shape.
// Typing in the room chat (html.rtype) the chat takes the screen: the header, the footer and, sideways, the players step aside.
const MROOM={tab:{lobby:'',setup:'set'},unread:false,code:'',
  lob(){return document.documentElement.dataset.lob||''},
  win(id){return document.querySelector('#'+id+'>.win.room')},
  tabs(id){if(id==='setup')return ['set','ch'];const T=['set','ch','chat'];return this.lob()==='p'?['pl',...T]:T},
  // the room's settings in a line (mode · map, bots · difficulty): every player sees what is about to be played
  sum(){const c=NET.lob&&NET.lob.cfg||{},L=LI(),ep=c.mode==='scen'&&typeof epSel==='function'?epSel(c):0,E=ep&&typeof EPS!=='undefined'?EPS[ep]:null;
    const what=E?(L?'Scenario: ':'시나리오: ')+E.n[L]:T(modeKey(c.mode))+' · '+(MAPDEFS[c.map]?mapName(c.map):'?');
    return `<b>${esc(what)}</b><span>${esc((L?'Bots ':'봇 ')+(c.bots|0)+' · '+T('d'+(c.diff|0)))}</span><i>${L?'Settings ›':'설정 ›'}</i>`},
  build(id){const w=this.win(id),m=this.lob();if(!w||!m||w.querySelector(':scope>.mrbody'))return;
    // (another room: it opens on its first tab, with nothing unread)
    if(id==='lobby'&&NET.code!==this.code){this.code=NET.code;this.tab.lobby='';this.unread=false}
    const wb=w.querySelector(':scope>.wbody');if(!wb)return;
    const L=LI(),foot=w.querySelector(':scope>.dpFoot'),head=w.querySelector(':scope>.dpHead'),wc=w.querySelector(':scope>.wchars');
    // (the room chat's field keeps its focus through the move)
    const a=document.activeElement,fo=a&&w.contains(a)&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA')?a:null;
    const body=document.createElement('div');body.className='mrbody';const pan=document.createElement('div');pan.className='mrpan';
    const put=(e,t)=>{if(e){e.dataset.mt=t;pan.appendChild(e)}};
    if(id==='lobby'){const pl=document.createElement('div');pl.className='mrpl';
      // (the map and the room chat sit inside the slots' grid: taken out before the slots move)
      const sl=wb.querySelector('.slots'),rs=wb.querySelector('.rside'),sp=wb.querySelector('.sprev'),rc=wb.querySelector('.rchat');
      const sm=document.createElement('button');sm.type='button';sm.className='mrsum';sm.dataset.mrt='set';sm.innerHTML=this.sum();pl.appendChild(sm);
      put(rs,'set');put(sp,'set');put(rc,'chat');if(sl)pl.appendChild(sl);body.appendChild(pl)}
    else{put(wb.querySelector('.rform'),'set');put(wb.querySelector('.rside'),'set')}
    put(wc,'ch');body.appendChild(pan);w.insertBefore(body,foot||null);wb.remove();
    const lab={pl:(L?'Players ':'플레이어 ')+(NET.lob&&NET.lob.pl?NET.lob.pl.length:1)+'/'+NET_MAXP,set:L?'Settings':'설정',ch:L?'Character':'캐릭터',chat:L?'Chat':'채팅'};
    const row=document.createElement('div');row.className='mtabs';row.setAttribute('role','tablist');
    row.innerHTML=this.tabs(id).map(t=>`<button type="button" role="tab" data-mrt="${t}">${esc(lab[t])}</button>`).join('');
    // (sideways the players are always there: the tabs belong to the panel)
    if(id==='lobby'&&m==='l')pan.prepend(row);else if(head)head.after(row);else w.prepend(row);
    w.classList.add('mroom');this.pick(id,this.tab[id],true);
    if(fo&&fo.isConnected&&document.activeElement!==fo)try{fo.focus()}catch(e){}},
  pick(id,t,quiet){const w=this.win(id);if(!w)return;const T=this.tabs(id);if(!T.includes(t))t=T[0];this.tab[id]=t;w.dataset.mt=t;
    for(const b of w.querySelectorAll('.mtabs [data-mrt]')){const on=b.dataset.mrt===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',on?'true':'false')}
    if(id==='lobby'&&t==='chat')this.unread=false;this.dot();
    const p=w.querySelector('.mrpan');if(p&&!quiet)p.scrollTop=0;
    if(!quiet&&typeof AU!=='undefined')AU.play('ui',{vol:.3})},
  dot(){const b=document.querySelector('#lobby .mtabs [data-mrt="chat"]');if(!b)return;const want=this.unread&&this.tab.lobby!=='chat';let d=b.querySelector('.dot');
    if(want&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d)}else if(!want&&d)d.remove()},
  // the phone turned (or the window changed shape): the open window is drawn again for it
  relay(){if(UI.open==='lobby'&&NET.on&&NET.ui==='lobby')UI.mpLobby();else if(UI.open==='setup')UI.buildSetup()},
  type(on){const r=document.documentElement;if(on===r.classList.contains('rtype'))return;r.classList.toggle('rtype',on);
    try{const b=document.getElementById('chatBox');if(b&&on)b.scrollTop=b.scrollHeight}catch(e){}}};
(function(){
  document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.id==='chatIn'&&t.closest('#lobby')&&MROOM.lob())MROOM.type(true)});
  document.addEventListener('focusout',e=>{const t=e.target;if(t&&t.id==='chatIn')setTimeout(()=>{const a=document.activeElement;if(!(a&&a.id==='chatIn'))MROOM.type(false)},150)});
  // (보내기 and 전체 keep the field focused, so the keyboard stays up; the bar stops mousedown from bubbling, so this listens first)
  document.addEventListener('mousedown',e=>{const b=e.target&&e.target.closest&&e.target.closest('#lobby #chatBar [data-c]');if(b&&document.documentElement.classList.contains('rtype'))e.preventDefault()},true);
  const ml=UI.mpLobby;UI.mpLobby=function(){const r=ml.apply(this,arguments);try{MROOM.build('lobby')}catch(e){console.error(e)}return r};
  // (방 만들기 opens on 설정; drawn again for a changed setting, it stays where it was)
  const bs=UI.buildSetup;UI.buildSetup=function(){if(UI.open!=='setup')MROOM.tab.setup='set';const r=bs.apply(this,arguments);try{MROOM.build('setup')}catch(e){console.error(e)}return r};
  document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const b=t.closest('#lobby [data-mrt], #setup [data-mrt]');if(!b)return;
    MROOM.pick(b.closest('#setup')?'setup':'lobby',b.dataset.mrt)});
  // (a room chat line while the chat tab is not open)
  if(typeof CHAT!=='undefined'){const ad=CHAT.add.bind(CHAT);CHAT.add=function(o){const r=ad(o);
    try{if(o&&!o.me&&MROOM.lob()&&UI.open==='lobby'&&MROOM.tab.lobby!=='chat'){MROOM.unread=true;MROOM.dot()}}catch(e){}return r}}
})();

'use strict';
// ============ Chat (v6.19): in a match and in the multiplayer waiting room ============
// Enter or Y: a line to everyone; U: to your own side only (humans or zombies). Lines show at the bottom left, above health, and fade
// after a while; while typing, the recent ones all come back. In the waiting room the box is a row of the room window, under the slots.
// In a multiplayer room the host relays every line (a client → the host → the others): at most 90 characters, at most 6 lines in 5 s
// a player; a team line only reaches players on the sender's side. Joins and leaves show as grey lines. Alone, the lines just show.
// Phones: the 💬 button on the top bar opens the box (and the keyboard).
const CHAT={on:false,team:false,lines:[],box:null,bar:null,inp:null,mine:[],escAt:0,
  MAXLEN:90,KEEP:60,SHOW:8,FADE:9000,
  // where it shows: a match (and its results), or a multiplayer waiting room
  where(){if(NET.on&&NET.ui==='lobby')return 'lobby';if(G.player&&G.st!=='menu')return 'game';return null},
  ensure(){if(!this.box){const L=LI();
      this.box=document.createElement('div');this.box.id='chatBox';this.box.dataset.empty=L?'No messages yet':'아직 채팅이 없어요';
      this.bar=document.createElement('div');this.bar.id='chatBar';
      this.bar.innerHTML=`<span class="cbk"></span><input id="chatIn" maxlength="${this.MAXLEN}" autocomplete="off" spellcheck="false"><button class="cbs" data-c="send">${L?'Send':'보내기'}</button><button class="cbt" data-c="team" title="${L?'Everyone / my side':'전체 / 우리 편'}"></button>`;
      this.inp=this.bar.querySelector('#chatIn');
      this.bar.addEventListener('mousedown',e=>e.stopPropagation());
      this.bar.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;if(b.dataset.c==='send')this.send();else{this.team=!this.team;this.label();this.inp.focus()}});
      this.inp.addEventListener('keydown',e=>{e.stopPropagation();
        if(e.key==='Enter'||e.key==='NumpadEnter'){e.preventDefault();if(this.inp.value.trim())this.send();else this.closeIn();return}
        if(e.key==='Escape'){e.preventDefault();this.escAt=performance.now();this.closeIn()}});
      this.inp.addEventListener('keyup',e=>e.stopPropagation());
      this.label()}
    this.place()},
  // the waiting room keeps the box inside its own window (the .rchat row under the slots); a match shows it on the page, bottom left
  place(){const slot=this.where()==='lobby'?document.querySelector('#lobby .rchat'):null,host=slot||document.body,f=document.activeElement===this.inp;
    for(const e of [this.box,this.bar])if(e&&e.parentNode!==host)host.appendChild(e);
    if(f&&document.activeElement!==this.inp)try{this.inp.focus()}catch(e){}},
  label(){if(!this.bar)return;const L=LI(),tm=this.team&&this.where()==='game';this.bar.classList.toggle('tm',tm);
    this.bar.querySelector('.cbk').textContent=tm?(L?'Team':'우리 편'):(L?'All':'전체');
    this.bar.querySelector('.cbt').textContent=tm?(L?'→ All':'→ 전체'):(L?'→ Team':'→ 우리 편');
    this.inp.placeholder=L?'Say something · Enter sends · Esc closes':'메시지 입력 · Enter 보내기 · Esc 닫기'},
  // open the box: Enter / Y (everyone), U (my side); the game stops reading the keyboard while it is open
  openIn(team){const w=this.where();if(!w)return;this.ensure();this.team=!!team&&w==='game';this.on=true;this.label();this.bar.classList.add('on');
    Main.keys={};Main.ml=Main.mr=false;this.render();try{this.inp.focus()}catch(e){}setTimeout(()=>{if(this.on)this.inp.focus()},0)},
  closeIn(){this.on=false;if(this.bar){this.bar.classList.remove('on');if(this.inp){this.inp.value='';this.inp.blur()}}this.render()},
  // a line typed here: to the host (a client), to everyone (the host), or just here (alone)
  send(){const m=this.clean(this.inp.value);this.inp.value='';if(!m){if(this.where()==='game')this.closeIn();return}const L=LI();
    const now=Date.now();this.mine=this.mine.filter(t=>now-t<5000);if(this.mine.length>=6){this.add({sys:1,m:L?'Slow down a little':'채팅이 너무 빨라요. 잠시 후에 보내 주세요'});return}this.mine.push(now);
    const tm=this.team&&this.where()==='game',P=G.player,tc=P&&G.st!=='menu'?P.team:null;
    if(NET.on&&NET.cli)netToHost({t:'chat',m,tm:tm?1:0});
    else if(NET.on&&NET.host)this.relay({n:this.myName(),m,tm,tc,k:NET.me||'host'});
    else this.add({n:this.myName(),m,tm,tc,me:1});
    if(this.where()==='game')this.closeIn();else this.inp.focus()},
  myName(){return (G.player&&G.player.name)||myName()},
  clean(t){return String(t||'').replace(/[\u0000-\u001f\u007f]/g,'').replace(/\s+/g,' ').trim().slice(0,this.MAXLEN)},
  // the host: shows a line here and sends it on (a team line only to that side)
  relay(o){const out={t:'chat',n:String(o.n||'?').slice(0,16),m:o.m,tm:o.tm?1:0,tc:o.tc==null?-1:o.tc};
    for(const [k,Lk] of NET.links){if(Lk.dead)continue;if(out.tm&&NET.ui==='game'){const a=actorOfKey(k);if(!a||a.team!==o.tc)continue}netSend(k,k===o.k?{...out,me:1}:out)}
    const P=G.player;if(!out.tm||!P||P.team===o.tc)this.add({n:out.n,m:out.m,tm:out.tm,tc:o.tc,me:o.k===(NET.me||'host')})},
  // a grey line for everyone (joins, leaves)
  sys(m){if(NET.on&&NET.host)netAll({t:'chat',s:1,m});this.add({sys:1,m})},
  add(o){this.lines.push({n:o.n||'',m:o.m||'',tm:!!o.tm,tc:o.tc==null||o.tc<0?null:o.tc,sys:!!o.sys,me:!!o.me,at:Date.now()});
    if(this.lines.length>this.KEEP)this.lines.splice(0,this.lines.length-this.KEEP);this.ensure();this.render();
    if(!o.sys&&!o.me&&this.where())AU.play('ui',{vol:.25,rate:1.6})},
  render(){if(!this.box)return;const w=this.where(),L=LI(),room=w==='lobby';this.place();
    this.box.classList.toggle('inRoom',room);this.box.classList.toggle('open',this.on||room);
    if(!w&&this.on){this.on=false;if(this.inp){this.inp.value='';this.inp.blur()}}
    if(this.bar){this.bar.classList.toggle('inRoom',room);this.bar.classList.toggle('on',!!w&&(this.on||room))}
    if(!w){this.box.style.display='none';return}this.box.style.display='';
    const now=Date.now(),open=this.on||room,list=this.lines.slice(-(room?40:open?14:this.SHOW)).filter(l=>open||now-l.at<this.FADE);
    const h=list.map(l=>{const fade=open?1:Math.min(1,(this.FADE-(now-l.at))/1200);
      if(l.sys)return `<div class="cl sys" style="opacity:${fade.toFixed(2)}">${esc(l.m)}</div>`;
      const side=l.tc===TH?'h':l.tc===TZ?'z':'n';
      return `<div class="cl ${side}${l.me?' me':''}" style="opacity:${fade.toFixed(2)}">${l.tm?`<i>${L?'[Team]':'[우리 편]'}</i> `:''}<b>${esc(l.n)}</b><span>: ${esc(l.m)}</span></div>`}).join('');
    // rebuilt only when something changed; in the room the log scrolls and follows the newest line unless it was scrolled up
    const B=this.box;if(h===B._h)return;const end=B.scrollHeight-B.scrollTop-B.clientHeight<24;B._h=h;B.innerHTML=h;if(room&&end)B.scrollTop=B.scrollHeight}};
// network: a client's line comes to the host, the host's lines come to everyone
HOSTH.chat=function(L,m){const now=Date.now();L.chatT=(L.chatT||[]).filter(t=>now-t<5000);if(L.chatT.length>=6)return;L.chatT.push(now);
  const txt=CHAT.clean(m.m);if(!txt)return;const a=NET.ui==='game'?actorOfKey(L.key):null;
  CHAT.relay({n:(a&&a.name)||L.name||'?',m:txt,tm:!!m.tm&&!!a,tc:a?a.team:null,k:L.key})};
CLIH.chat=function(L,m){if(m.s){CHAT.add({sys:1,m:CHAT.clean(m.m)});return}CHAT.add({n:String(m.n||'?').slice(0,16),m:CHAT.clean(m.m),tm:!!m.tm,tc:m.tc,me:!!m.me})};
(function(){
  // Enter / Y / U open the box (before the game's own key handling, which ignores keys typed into an input)
  addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT'))return;
    const k=e.code,w=CHAT.where();if(!w||e.altKey||e.ctrlKey||e.metaKey||e.repeat)return;if(w==='game'&&(Main.paused||Main.overlay||G.st==='over'&&!NET.on))return;
    // the waiting room: only Enter (Y / U would be the first letter of a line)
    if(k==='Enter'||k==='NumpadEnter'||w==='game'&&(k==='KeyY'||k==='KeyU')){e.preventDefault();e.stopImmediatePropagation();CHAT.openIn(k==='KeyU')}},true);
  // nothing moves or shoots while typing
  const pc0=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc0(dt);if(!CHAT.on)return;const P=G.player;if(!P)return;const c=P.cmd;c.f=c.s=0;c.jump=c.duck=c.walk=c.fire=c.alt=c.reload=c.skill=c.drop=false};
  // Esc in the box closes it, whichever comes first (the key or the mouse lock it lets go of); the game then waits
  // for a click instead of opening the pause menu. Leaving the window (alt-tab) still pauses, and closes the box.
  const pz=Main.pause.bind(Main);Main.pause=function(){const now=performance.now();
    if(CHAT.on||now-CHAT.escAt<500){if(CHAT.on){CHAT.escAt=now;CHAT.closeIn()}if(document.hasFocus())return}
    return pz()};
  // joins and leaves as grey lines (the host tells everyone)
  const hh=HOSTH.hello;HOSTH.hello=function(L,m){const had=NET.lob.pl.some(p=>p.k===L.key);hh.call(this,L,m);if(!had&&NET.lob.pl.some(p=>p.k===L.key))CHAT.sys(T('mpJoined',L.name||'?'))};
  const dp=netDropPlayer;netDropPlayer=function(k){const p=NET.lob.pl.find(x=>x.k===k);const r=dp(k);if(p&&NET.on&&NET.host)CHAT.sys(T('mpLeftL',p.n||'?'));return r};
  // the phone's top bar: a chat button
  if(typeof TOUCH!=='undefined'){const b0=TOUCH.build.bind(TOUCH);TOUCH.build=function(){const r=b0();try{const t=this.el&&this.el.querySelector('.ttop');if(t&&!t.querySelector('.tChat'))t.insertAdjacentHTML('afterbegin',this.B('chat','💬','tChat'))}catch(e){}return r};
    const p0=TOUCH.press.bind(TOUCH);TOUCH.press=function(id,on,v){if(id==='chat'){if(on)CHAT.on?CHAT.closeIn():CHAT.openIn(false);return}return p0(id,on,v)}}
  // the waiting room is rebuilt whenever a player or a setting changes: put the box back into the new window, keep the typing focus
  const ml=UI.mpLobby;UI.mpLobby=function(){const had=!!CHAT.inp&&document.activeElement===CHAT.inp;const r=ml.apply(this,arguments);
    CHAT.ensure();CHAT.render();if(had)try{CHAT.inp.focus()}catch(e){}return r};
  setInterval(()=>{try{CHAT.render()}catch(e){}},400);
  if(typeof STR.ko.prepHint==='string')STR.ko.prepHint+='  ·  Enter: 채팅';if(typeof STR.en.prepHint==='string')STR.en.prepHint+='  ·  Enter: chat'})();

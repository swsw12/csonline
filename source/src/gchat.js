'use strict';
// ============ 전체 채팅 (v6.75): the players online right now, from the lobby — nothing is kept anywhere ============
// The owner's word: a chat room for everyone connected, nothing saved, every line sent on at once. A line goes page to page over
// Supabase Realtime Broadcast on the private channel qz-lobby (schema.sql v6.75: its two policies let signed-in players read and
// unsuspended ones send; Realtime writes nothing for a line). If the project has no such policies the private join is refused and the
// public channel of the same name is used. Nothing here keeps a line past this page: the last 80 live in memory only.
// Nobody can write as someone else: this page makes an ECDSA P-256 key pair (the private half never leaves it), puts the public half
// with the account (qz_chat_key → kid) and signs every line it sends (kid, the time it was sent, the text); every page that receives a
// line asks whose key it is (qz_chat_who: nickname, titles, suspended — kept 2 minutes) and checks the signature before showing it.
// Dropped: a bad signature or an unknown key, a suspended sender, a player I blocked (friends.js), a line seen already or older than
// that sender's last, a time more than 10 minutes off, a sender's seventh within 15 s. Sending: 120 characters, one every 1.5 s, 5 in 15 s.
// The socket is open while the lobby is up, signed in, and the tab in view (closed after 2 minutes away); a match closes it.
// v6.76: the chat sits in the lobby's lower right panel (where the map list was); the waiting room and a screen too short for the
// lobby's panels use the floating window, which the same box moves into.
// v6.76 room posts: the host of a PeerJS waiting room presses 「채팅에 모집」 there and the line carries the room (r: code, mode, map,
// players, seats — signed with the text); other pages show it as a card with 참가, which joins by the code (INVT.go, as an invite).
// One room post every 30 s from a page; a receiver shows one per sender in 20 s, and a card older than 10 minutes cannot be joined.
const SVG_GCH='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1.5 2h9a1 1 0 011 1v5a1 1 0 01-1 1H6l-2.6 2.2V9H1.5a1 1 0 01-1-1V3a1 1 0 011-1zm11 3.2h2a1 1 0 011 1V11a1 1 0 01-1 1H13v2.2L10.4 12H7.6a1 1 0 01-1-1v-.6h4a2 2 0 002-2z"/></svg>';
const GCH={TOPIC:'realtime:qz-lobby',MAXLEN:120,KEEP:80,AWAY:120e3,BACK:[1,2,5,10,20,30],HB:25e3,
  ws:null,ref:0,jref:'',joined:false,priv:true,hbT:0,hbRef:'',tries:0,nextAt:0,hiddenAt:0,
  key:null,kid:'',keyFor:'',kidP:null,kidU:'',who:new Map(),wq:new Map(),wT:0,
  lines:[],seen:new Map(),last:new Map(),rate:new Map(),vN:0,vT:0,sent:[],open:false,unread:0,msg:'',msgT:0,online:null,onAt:-1e9,menu:null,uid:'',off:0,old:false,shut:false,att:false,roomAt:0,lastRoom:new Map(),
  // ---- the socket (Phoenix, vsn 1.0.0) ----
  can(){return !!(ACC.on&&SB.url&&SB.key&&typeof WebSocket!=='undefined'&&window.crypto&&crypto.subtle&&typeof TextEncoder!=='undefined')},
  want(){return this.can()&&!this.old&&!this.shut&&ACC.signed()&&G.st==='menu'&&!(document.hidden&&this.hiddenAt&&performance.now()-this.hiddenAt>this.AWAY)},
  url(){return SB.url.replace(/^http/,'ws').replace(/\/+$/,'')+'/realtime/v1/websocket?apikey='+encodeURIComponent(SB.key)+'&vsn=1.0.0'},
  me(){return ACC.signed()&&ACC.ses&&ACC.ses.user?String(ACC.ses.user.id||''):''},
  sync(){const u=this.me();if(u!==this.uid){this.uid=u;this.reset()}return u},
  tick(){this.sync();
    const w=this.want();if(w&&!this.ws&&performance.now()>=this.nextAt)this.connect();else if(!w&&this.ws)this.close(true);
    if(this.visible()&&ACC.signed()&&!this.old&&!this.shut&&performance.now()-this.onAt>60e3)this.loadOnline();
    if(this.boxEl){let ch=false;for(const x of this.lines)if(x.r&&!x.old&&this.now()-x.ts>600e3){x.old=true;ch=true}if(ch)this.renderLog();this.place()}
    if(this.unread&&this.visible()){this.unread=0;gchDot()}},
  // (over the waiting room the window sits at the top, so its 시작 / 나가기 stay in reach)
  place(){const o=$('gchWin');if(o)o.classList.toggle('inroom',UI.open==='lobby')},
  // another account (or none): its key, the lines and who is who go
  reset(){this.close(true);if(this.keyFor!==this.uid){this.key=null;this.kid='';this.keyFor=''}this.who.clear();this.lines=[];this.seen.clear();this.last.clear();this.rate.clear();this.lastRoom.clear();this.att=false;this.unread=0;this.online=null;this.onAt=-1e9;this.priv=true;this.render();gchDot()},
  connect(){let ws;try{ws=new WebSocket(this.url())}catch(e){this.fail();return}this.ws=ws;this.joined=false;
    ws.onopen=()=>{if(this.ws===ws)this.join()};
    ws.onmessage=e=>{if(this.ws!==ws||typeof e.data!=='string'||e.data.length>8192)return;let m;try{m=JSON.parse(e.data)}catch(x){return}this.rx(m)};
    ws.onclose=()=>{if(this.ws!==ws)return;this.ws=null;this.joined=false;clearInterval(this.hbT);this.fail();this.render()};
    ws.onerror=()=>{}},
  close(quiet){const ws=this.ws;this.ws=null;this.joined=false;clearInterval(this.hbT);this.hbRef='';
    if(ws){try{if(ws.readyState===1)ws.send(JSON.stringify({topic:this.TOPIC,event:'phx_leave',payload:{},ref:String(++this.ref),join_ref:this.jref}));ws.close()}catch(e){}}
    if(quiet){this.tries=0;this.nextAt=0}this.render()},
  fail(){const b=this.BACK[Math.min(this.tries,this.BACK.length-1)];this.tries++;this.nextAt=performance.now()+b*1000},
  push(ev,payload,topic){const ws=this.ws;if(!ws||ws.readyState!==1)return null;const ref=String(++this.ref);
    try{ws.send(JSON.stringify(topic==='phoenix'?{topic,event:ev,payload,ref}:{topic:this.TOPIC,event:ev,payload,ref,join_ref:this.jref}))}catch(e){return null}return ref},
  async join(){try{await ACC.fresh()}catch(e){}const ws=this.ws,ses=ACC.ses;if(!ws||ws.readyState!==1||!ses)return;this.jref=String(++this.ref);
    ws.send(JSON.stringify({topic:this.TOPIC,event:'phx_join',payload:{config:{broadcast:{ack:false,self:false},presence:{enabled:false},postgres_changes:[],private:this.priv},
      access_token:ses.access_token},ref:this.jref,join_ref:this.jref}));
    // (a heartbeat the server has not answered by the next one: the connection is dead without saying so — a new one)
    clearInterval(this.hbT);this.hbRef='';this.hbT=setInterval(()=>{if(this.ws!==ws){clearInterval(this.hbT);return}if(this.hbRef){this.close();this.fail();return}
      this.hbRef=this.push('heartbeat',{},'phoenix')||'';if(!this.hbRef)clearInterval(this.hbT)},this.HB)},
  rx(m){if(!m||typeof m!=='object')return;if(m.topic==='phoenix'){if(m.event==='phx_reply'&&m.ref===this.hbRef)this.hbRef='';return}
    if(m.topic!==this.TOPIC)return;const p=m.payload&&typeof m.payload==='object'?m.payload:{};
    if(m.event==='phx_reply'&&m.ref===this.jref){
      if(p.status==='ok'){this.joined=true;this.tries=0;if(!Array.isArray(ACC.blk))ACC.blocks().catch(()=>{});this.render();return}
      const why=String(p.response&&p.response.reason||'');
      // (no policies for the private channel on this project: the public channel of the same name)
      if(this.priv&&/Unauthori|permission|private|polic|denied|not allowed/i.test(why)){this.priv=false;this.join();return}
      this.close();this.fail();return}
    if(m.event==='phx_close'||m.event==='phx_error'||m.event==='system'&&p.status==='error'){this.close();this.fail();return}
    if(m.event==='broadcast'&&p.event==='m'&&p.payload&&typeof p.payload==='object')this.got(p.payload)},
  // a new token for this session (the game refreshed it): the private channel keeps going on it
  token(){if(this.ws&&this.joined&&this.priv&&ACC.ses)this.push('access_token',{access_token:ACC.ses.access_token})},
  // ---- keys and signatures ----
  b64(u8){let s='';for(const b of u8)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
  ub64(s){s=String(s).replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u},
  data(k,ts,t,r){return new TextEncoder().encode(k+'\n'+ts+'\n'+t+(r?'\n#room:'+r.c+'|'+r.m+'|'+r.p+'|'+r.n+'|'+r.x:''))},
  // ---- room posts (v6.76) ----
  // the room this page may post: it is the host of a PeerJS waiting room (not mid hand-over)
  roomNow(){if(typeof NET==='undefined'||!NET.on||!NET.host||NET.kind!=='peerjs'||NET.ui!=='lobby'||NET.mig||!/^[A-Z0-9]{4}$/.test(NET.code||''))return null;
    const c=NET.lob&&NET.lob.cfg||{},n=Math.max(1,(NET.lob&&NET.lob.pl||[]).length);
    return {c:NET.code,m:NET_MODES.includes(c.mode)?c.mode:'mut',p:/^[a-z0-9_]{1,24}$/.test(c.map||'')?c.map:'q7',n:Math.min(n,NET_MAXP),x:NET_MAXP}},
  roomOk(r){return !!r&&typeof r==='object'&&typeof r.c==='string'&&/^[A-Z0-9]{4}$/.test(r.c)&&typeof r.m==='string'&&NET_MODES.includes(r.m)
    &&typeof r.p==='string'&&/^[a-z0-9_]{1,24}$/.test(r.p)&&Number.isInteger(r.n)&&Number.isInteger(r.x)&&r.n>=1&&r.n<=r.x&&r.x<=NET_MAXP},
  roomText(r){const L=LI(),D=typeof MAPDEFS!=='undefined'?MAPDEFS[r.p]:null,ep=D&&D.ep&&typeof EPS!=='undefined'?EPS[D.ep]:null;
    const what=ep?(L?'Scenario: ':'시나리오: ')+ep.n[L]:T(['scen','orig','tdm','ffa','bomb','race'].includes(r.m)?r.m:'mut')+' · '+(D?mapName(r.p):r.p);
    return what+' · '+r.n+'/'+r.x+(L?'':'명')+' · '+(L?'room ':'방 ')+r.c},
  roomHtml(x){const r=x.r,L=LI(),old=!!x.old||this.now()-x.ts>600e3;
    const b=x.me?`<span class="grs">${L?'your room':'내 방'}</span>`:old?`<span class="grs">${L?'expired':'지난 모집'}</span>`:`<button class="gjoin" data-gc="join" data-v="${esc(r.c)}">${L?'Join':'참가'}</button>`;
    return `<div class="groom${old?' old':''}"><span class="grt">${esc(this.roomText(r))}</span>${b}</div>`},
  // the server's clock (lines carry the time by it, so a computer whose own clock is off still gets through): from qz_chat_key / qz_online
  clock(t0,r){const t1=Date.now();if(r&&Number.isFinite(+r.ms)&&+r.ms>0&&t1>=t0&&t1-t0<4000)this.off=Math.round(+r.ms-(t0+t1)/2)},
  now(){return Date.now()+this.off},
  // the admin page switched the chat off (or on again): qz_ping / qz_online / qz_chat_key say so
  setOn(on){const shut=!on;if(shut===this.shut)return;this.shut=shut;if(shut){this.close(true);this.lines=[];this.unread=0}this.render();gchDot()},
  // a server without the chat yet (schema.sql before v6.75): the window says so and no socket is opened
  gone(e){if(/Could not find the function|PGRST202/i.test(String(e&&e.message||'')+' '+String(e&&e.code||''))){this.old=true;this.close(true);this.render();return true}return false},
  myKey(){const u=this.sync();if(!u)return Promise.reject(new Error('not_signed_in'));if(this.key&&this.kid&&this.keyFor===u)return Promise.resolve(true);if(this.kidP&&this.kidU===u)return this.kidP;
    this.kidU=u;this.kidP=(async()=>{const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
      const raw=new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey)),pub=this.b64(raw);let r;
      // (a key put in just before — another tab, a try that was cut off — and the server's 5 s: once more after that)
      let t0=Date.now();
      try{r=await ACC.rpc('qz_chat_key',{p_pub:pub})}catch(e){if(/chat_off/.test(String(e&&e.message||'')))this.setOn(false);if(this.gone(e)||!/too_soon/.test(String(e&&e.message||'')))throw e;await new Promise(z=>setTimeout(z,5200));t0=Date.now();r=await ACC.rpc('qz_chat_key',{p_pub:pub})}
      if(this.me()!==u||!r||typeof r.kid!=='string')throw new Error('not_signed_in');this.clock(t0,r);
      this.key=pair.privateKey;this.kid=r.kid;this.keyFor=u;this.who.set(r.kid,{ok:true,pub:pair.publicKey,n:String(r.nickname||''),me:true,at:performance.now()});return true})();
    const P=this.kidP,done=()=>{if(this.kidP===P)this.kidP=null};P.then(done,done);return P},
  // whose key (asked for in batches of up to 20, kept 2 minutes; a key nobody has, 1 minute)
  resolve(k){const w=this.who.get(k),now=performance.now();if(w&&now-w.at<(w.ok?120e3:60e3))return Promise.resolve(w);
    const q=this.wq.get(k);if(q)return q.p;let res;const p=new Promise(r=>res=r);this.wq.set(k,{p,res});clearTimeout(this.wT);this.wT=setTimeout(()=>this.lookup(),150);return p},
  async lookup(){const Q=[...this.wq.entries()].slice(0,20);for(const [k] of Q)this.wq.delete(k);if(this.wq.size)this.wT=setTimeout(()=>this.lookup(),150);
    let r=null;try{r=await ACC.rpc('qz_chat_who',{p_kids:Q.map(x=>x[0])})}catch(e){this.gone(e);for(const [,q] of Q)q.res(null);return}
    const now=performance.now();
    for(const [k,q] of Q){const x=r&&typeof r==='object'?r[k]:null;let w={ok:false,at:now};
      if(x&&typeof x.pub==='string'&&x.pub.length<=100){let pub=null;try{pub=await crypto.subtle.importKey('raw',this.ub64(x.pub),{name:'ECDSA',namedCurve:'P-256'},false,['verify'])}catch(e){}
        if(pub)w={ok:true,pub,n:String(x.n||'?').slice(0,16),tt:typeof x.tt==='string'?x.tt:null,ft:x.ft|0||null,b:!!x.b,me:!!x.me,x:!!x.x,at:now}}
      this.who.set(k,w);q.res(w)}},
  async verify(w,k,ts,t,s,r){try{return await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},w.pub,this.ub64(s),this.data(k,ts,t,r))}catch(e){return false}},
  blocked(n){const B=ACC.blk;if(!Array.isArray(B)||!n)return false;const l=String(n).toLowerCase();return B.some(b=>String(b.nickname||'').toLowerCase()===l)},
  // ---- lines ----
  got(p){const u0=this.uid,u=this.sync();if(!u||u!==u0)return;const k=p.k,ts=p.ts,t=p.t,s=p.s,now=performance.now(),r0=p.r==null?null:p.r;
    if(typeof k!=='string'||!/^[0-9a-f]{20}$/.test(k)||typeof ts!=='number'||!Number.isFinite(ts)||typeof t!=='string'||!t||t.length>this.MAXLEN||typeof s!=='string'||s.length>120)return;
    if(r0!==null&&!this.roomOk(r0))return;const r=r0&&{c:r0.c,m:r0.m,p:r0.p,n:r0.n,x:r0.x};
    if(Math.abs(this.now()-ts)>600e3||ts<=(this.last.get(k)||0))return;
    const id=k+':'+ts;if(this.seen.has(id))return;
    // (a flood of bad lines is not checked one by one: 40 checks a second at most)
    if(now-this.vT>1000){this.vT=now;this.vN=0}if(++this.vN>40)return;
    this.resolve(k).then(async w=>{if(!w||!w.ok||w.b||this.uid!==u)return;if(!await this.verify(w,k,ts,t,s,r)||this.uid!==u)return;
      if(this.seen.has(id)||ts<=(this.last.get(k)||0))return;this.seen.set(id,now);if(this.seen.size>800)for(const x of [...this.seen.keys()].slice(0,300))this.seen.delete(x);
      this.last.set(k,ts);const R=(this.rate.get(k)||[]).filter(x=>now-x<15e3);if(R.length>=6){this.rate.set(k,R);return}R.push(now);this.rate.set(k,R);
      // (a sender's room posts: one in 20 s)
      if(r){if(now-(this.lastRoom.get(k)||-1e9)<20e3)return;this.lastRoom.set(k,now)}
      if(w.x||this.blocked(w.n))return;this.add({n:w.n,k,tt:TTL.row(w),t,ts,me:!!w.me,r})}).catch(()=>{})},
  add(x){this.lines.push(x);if(this.lines.length>this.KEEP)this.lines.splice(0,this.lines.length-this.KEEP);
    if(!x.me&&!this.visible()){this.unread=Math.min(99,this.unread+1);gchDot()}this.renderLog()},
  note(t){this.msg=t;this.msgT=performance.now();this.render();setTimeout(()=>{if(performance.now()-this.msgT>=3900){this.msg='';this.render()}},4000)},
  async send(text){const L=LI();this.sync();let t=String(text||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,this.MAXLEN);
    // (a room to post with it: the waiting room's host only, and not full; with no words of its own the line says 같이 하실 분!)
    const R=this.att?this.roomNow():null;if(this.att&&!R){this.att=false;this.render();this.note(L?'Only the host of a waiting room can post it':'대기실의 방장만 방을 올릴 수 있어요');return false}
    if(R&&R.n>=R.x){this.note(T('mpFull'));return false}
    if(!t&&R)t=L?'Anyone up for a game?':'같이 하실 분!';if(!t)return false;
    // (the limits count by the page's own steady clock: a computer clock set back does not stop the sending)
    const now=performance.now();this.sent=this.sent.filter(x=>now-x<15e3);
    if(this.sent.length&&now-this.sent[this.sent.length-1]<1500||this.sent.length>=5){this.note(L?'Slow down a little':'조금 천천히 보내 주세요');return false}
    if(R&&this.roomAt&&now-this.roomAt<30e3){this.note(L?'One room post every 30 seconds':'방 모집은 30초에 한 번 올릴 수 있어요');return false}
    if(!this.joined){this.note(L?'Connecting — try again in a moment':'연결 중이에요. 잠시 뒤에 다시 보내 주세요');return false}
    try{await this.myKey()}catch(e){if(this.old||this.shut)return false;this.note(/too_soon|bad_key/.test(String(e&&e.message||''))?(L?'Could not get ready to send — try again in a moment':'보낼 준비를 못 했어요. 잠시 뒤에 다시 해 주세요'):ACC.errText(e));return false}
    let ts=this.now();const lt=this.last.get(this.kid)||0;if(ts<=lt)ts=lt+1;
    let sig;try{sig=new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},this.key,this.data(this.kid,ts,t,R)))}catch(e){this.note(L?'Could not sign the message':'메시지에 서명하지 못했어요');return false}
    const pl={k:this.kid,ts,t,s:this.b64(sig)};if(R)pl.r=R;
    if(!this.push('broadcast',{type:'broadcast',event:'m',payload:pl})){this.note(L?'Not connected':'연결이 끊겼어요');return false}
    this.sent.push(now);this.last.set(this.kid,ts);this.seen.set(this.kid+':'+ts,now);if(R){this.roomAt=now;this.att=false}
    this.add({n:ACC.me.nickname,tt:TTL.mine(),t,ts,me:true,r:R});if(R)this.render();return true},
  async loadOnline(){this.onAt=performance.now();const t0=Date.now();try{const r=await ACC.rpc('qz_online');this.clock(t0,r);if(r&&typeof r.on==='boolean')this.setOn(r.on);if(r&&Number.isFinite(+r.n)){this.online=r.n|0;this.renderHead()}}catch(e){this.gone(e)}},
  // ---- the window (v6.76): one box, #gchBox, in the lobby's 전체 채팅 panel (lobby.js, where the map list was) or in the floating window
  // #gchWin (the waiting room, a screen too short for the lobby's lower panels, or 크게 보기); it moves between them as it is ----
  boxEl:null,
  q(sel){return this.boxEl?this.boxEl.querySelector(sel):null},
  box(){let b=this.boxEl;if(b)return b;b=this.boxEl=document.createElement('div');b.id='gchBox';
    b.addEventListener('keydown',e=>{if(e.target.id!=='gchIn')return;e.stopPropagation();if(e.key==='Enter'&&!e.isComposing){e.preventDefault();this.act('send')}
      else if(e.key==='Escape'){e.preventDefault();if(this.open)this.close2();else e.target.blur()}});
    // (the name menu stays by its name: scrolling the log closes it)
    b.addEventListener('scroll',()=>{if(this.menu){this.menu=null;this.renderMenu()}},true);
    return b},
  panel(){return document.querySelector('#menu .lchat')},
  // the lobby's panel is on screen with room to read in it (a phone held upright squeezes the lower panels: the top bar's 채팅 opens
  // the floating window there, as on a screen too short for the panels)
  panelShown(){const p=this.panel();return !!(p&&UI.open==='menu'&&p.getClientRects().length&&p.clientHeight>=140)},
  inPanel(){return this.panelShown()&&!!this.boxEl&&this.panel().contains(this.boxEl)},
  visible(){return this.open||this.inPanel()},
  // what the box shows lives through a move or a redraw: the words typed, the cursor, where the log was scrolled to
  keep(){const i=this.q('#gchIn'),g=this.q('#gchLog');return {v:i?i.value:null,fo:!!i&&document.activeElement===i,a:i?i.selectionStart:0,b:i?i.selectionEnd:0,st:g?g.scrollTop:0,near:!g||g.scrollHeight-g.scrollTop-g.clientHeight<48}},
  back(k){const i=this.q('#gchIn'),g=this.q('#gchLog');if(g)g.scrollTop=k.near?g.scrollHeight:k.st;if(i){if(k.v!=null)i.value=k.v;if(k.fo&&i.isConnected){i.focus();try{i.setSelectionRange(k.a,k.b)}catch(e){}}}},
  mount(k){const b=this.box();k=k||this.keep();let host=null;
    if(this.open){let o=$('gchWin');if(!o){o=document.createElement('div');o.id='gchWin';document.body.appendChild(o)}
      if(!o.querySelector('.gcw')){const L=LI();o.innerHTML=`<div class="gcw"><div class="gch">${SVG_GCH}<b>${L?'Global chat':'전체 채팅'}</b><small class="gcst"></small><span class="sgap"></span><button class="gcx" data-gc="x" aria-label="${L?'close':'닫기'}">×</button></div></div>`}
      host=o.querySelector('.gcw')}
    else host=this.panel();
    if(!b.firstChild)this.render();
    if(host&&b.parentNode!==host){host.appendChild(b);this.back(k)}
    this.place();this.renderHead();if(this.unread&&this.visible()){this.unread=0;gchDot()}},
  // the lobby's 채팅 button: to the panel when it is on screen, else the floating window
  toggle(){if(!this.open&&this.inPanel()){const i=this.q('#gchIn');if(i){i.scrollIntoView({block:'nearest'});i.focus()}return}if(this.open)this.close2();else this.show()},
  show(){this.sync();const k=this.keep();this.open=true;this.unread=0;gchDot();this.menu=null;this.renderMenu();this.mount(k);this.render();
    if(ACC.signed()){this.loadOnline();ACC.blocks().catch(()=>{});this.myKey().catch(()=>{})}
    const i=this.q('#gchIn');if(i)i.focus();AU.play('ui',{vol:.3})},
  close2(){const k=this.keep();k.fo=false;this.open=false;this.menu=null;this.renderMenu();const o=$('gchWin');
    if(o){if(this.boxEl&&o.contains(this.boxEl))this.boxEl.remove();o.remove()}this.mount(k);gchDot()},
  // a screen came up: back on the title (with its panel showing) the floating window gives way to the panel
  onShow(){if(this.open&&this.panelShown())this.close2();else this.mount()},
  time(ts){const d=new Date(ts),p=n=>(n<10?'0':'')+n;return p(d.getHours())+':'+p(d.getMinutes())},
  lineHtml(x){return `<div class="gl${x.me?' me':''}"><span class="gtm">${this.time(x.ts)}</span><b class="gn"${x.me?'':` data-gc="who" data-v="${esc(x.n)}" data-k="${esc(x.k||'')}"`}>${esc(x.n)}</b>${x.tt?TTL.chip(x.tt,'sm'):''}<span class="gx">${esc(x.t)}</span>${x.r?this.roomHtml(x):''}</div>`},
  renderHead(){const L=LI(),st=this.joined?(L?'● live':'● 연결됨'):this.ws?(L?'connecting…':'연결 중…'):(L?'offline':'연결 안 됨');
    const t=this.old||this.shut||!this.can()||!ACC.signed()?'':st+(this.online!=null?(L?` · ${this.online} online`:` · 접속 ${this.online}명`):'');
    for(const h of document.querySelectorAll('small.gcst')){h.classList.toggle('on',!!t&&this.joined);if(h.textContent!==t)h.textContent=t}},
  renderLog(){const g=this.q('#gchLog');if(!g)return;const L=LI(),near=g.scrollHeight-g.scrollTop-g.clientHeight<48;
    const V=this.lines.filter(x=>x.me||!this.blocked(x.n));
    g.innerHTML=V.length?V.map(x=>this.lineHtml(x)).join(''):`<p class="gce">${L?'No one has said anything yet — say hi!':'아직 대화가 없어요. 먼저 인사해 보세요!'}</p>`;
    if(near||this.lines.length&&this.lines[this.lines.length-1].me)g.scrollTop=g.scrollHeight},
  // the name menu (친구 요청 · 차단 · 신고): on the page itself, by the name (above it where the screen ends), so no panel cuts it off
  renderMenu(){const old=$('gcMenu');if(old)old.remove();const m=this.menu;if(!m)return;const L=LI();
    const d=document.createElement('div');d.id='gcMenu';d.className='gcm';const a=`data-v="${esc(m.n)}" data-k="${esc(m.k||'')}"`;
    d.innerHTML=`<b>${esc(m.n)}</b><button data-gc="fadd" ${a}>${L?'Add friend':'친구 요청'}</button><button data-gc="blk" ${a}>${L?'Block':'차단'}</button><button data-gc="rep" ${a}>${L?'Report':'신고'}</button>`;
    document.body.appendChild(d);const h=d.offsetHeight,w=d.offsetWidth;let x=m.x,y=m.y;if(y+h>innerHeight-6)y=Math.max(6,m.top-h-2);if(x+w>innerWidth-6)x=Math.max(6,innerWidth-w-6);
    d.style.left=x+'px';d.style.top=y+'px'},
  render(){const b=this.box(),L=LI(),signed=ACC.signed(),k=this.keep();
    let body;
    if(!this.can())body=`<p class="gce">${L?'The chat is not available here.':'여기서는 채팅을 쓸 수 없어요.'}</p>`;
    else if(this.old)body=`<p class="gce">${L?'The chat opens once the server is updated.':'서버가 업데이트되면 채팅을 쓸 수 있어요.'}</p>`;
    else if(this.shut)body=`<p class="gce">${L?'The global chat is switched off for now.':'지금은 전체 채팅이 꺼져 있어요.'}</p>`;
    else if(!signed)body=`<p class="gce">${L?'Sign in to talk with everyone online.':'로그인하면 지금 접속한 사람들과 대화할 수 있어요.'}</p><button class="gcbig" data-gc="login">${L?'Sign in':'로그인'}</button>`;
    else{const R=this.att?this.roomNow():null;if(this.att&&!R)this.att=false;
      body=`<div id="gchLog" class="gclog"></div>${this.msg?`<div class="gcmsg">${esc(this.msg)}</div>`:''}
      ${R?`<div class="gcatt"><b class="gab">${L?'ROOM':'모집'}</b><span>${esc(this.roomText(R))}</span><button data-gc="unatt" aria-label="${L?'remove':'빼기'}">×</button></div>`:''}
      <div class="gcsend"><input id="gchIn" maxlength="${this.MAXLEN}" placeholder="${R?(L?'Add a few words (or just send)':'한마디 덧붙이기 (비워도 돼요)'):(L?'Say something to everyone':'모두에게 메시지 보내기')}" autocomplete="off" spellcheck="false"><button data-gc="send">${L?'Send':'보내기'}</button></div>
      <p class="gcnote"><span class="gnl">${L?'Nothing is saved — only those online now see it. Tap a name to add, block or report.':'채팅 내용은 저장되지 않아요. 지금 접속한 사람에게만 보여요 · 이름을 누르면 친구 요청 · 차단 · 신고'}</span><span class="gns">${L?'Nothing is saved · tap a name to add, block or report':'저장 안 돼요 · 이름을 누르면 친구 요청 · 차단 · 신고'}</span></p>`}
    b.innerHTML=body;this.renderHead();this.renderLog();this.back(k)},
  act(a,v,el){const L=LI();
    if(a==='x'){this.close2();return}
    if(a==='pop'){if(this.open)this.close2();else this.show();return}
    if(a==='login'){this.close2();ACCW.open('in');return}
    if(a==='send'){const i=this.q('#gchIn');if(!i)return;const t=i.value;this.send(t).then(ok=>{if(ok){const j=this.q('#gchIn');if(j){j.value='';j.focus()}}});return}
    if(a==='unatt'){this.att=false;this.render();const i=this.q('#gchIn');if(i)i.focus();return}
    // a room card's 참가: from the lobby only, not from inside another room (the multiplayer screen does the rest, as for an invite)
    if(a==='join'){const c=String(v||'');if(!/^[A-Z0-9]{4}$/.test(c)||typeof NET==='undefined')return;
      if(NET.on){this.note(NET.code===c?(L?'You are in this room already':'이미 이 방에 있어요'):(L?'Leave your room first':'지금 방에서 나간 뒤에 참가해 주세요'));return}
      if(G.st!=='menu')return;this.close2();if(typeof INVT!=='undefined'&&INVT.go)INVT.go(c);else{UI.act('mp');setTimeout(()=>{if(!NET.on)UI.act('mproom',c)},60)}return}
    if(a==='who'){if(!el)return;const r=el.getBoundingClientRect();this.menu={n:v,k:el.dataset.k||'',x:Math.round(r.left),y:Math.round(r.bottom+2),top:Math.round(r.top)};this.renderMenu();return}
    const done=(p,ok)=>p.then(()=>{this.menu=null;this.renderMenu();this.note(ok)},e=>{this.menu=null;this.renderMenu();this.note(ACC.errText(e))});
    // (the player behind the line's key, exactly: a nickname can read like someone else's friend code)
    const k=el&&el.dataset&&/^[0-9a-f]{20}$/.test(el.dataset.k||'')?el.dataset.k:'',who=k?'k:'+k:v;
    if(a==='fadd'){this.menu=null;this.renderMenu();ACC.friendAdd(who).then(r=>{this.note(r.done==='accepted'?(L?'You are friends now':'친구가 됐어요'):(L?'Friend request sent':'친구 요청을 보냈어요'))},e=>{this.note(ACC.errText(e))});return}
    if(a==='blk'){done(ACC.block(who).then(()=>ACC.blocks()).then(()=>{const l=String(v).toLowerCase();for(const w of this.who.values())if(w.ok&&(w.n.toLowerCase()===l||k&&this.who.get(k)===w))w.x=true;
      this.lines=this.lines.filter(x=>x.me||x.k!==k&&x.n.toLowerCase()!==l);this.renderLog()}),L?'Blocked — their lines are hidden':'차단했어요 — 이 사람의 메시지는 안 보여요');return}
    if(a==='rep'){const x=[...this.lines].reverse().find(y=>y.n===v);this.menu=null;this.renderMenu();
      if(typeof INQ!=='undefined'&&INQ.open){INQ.body=(L?'[Global chat] ':'[전체 채팅] ')+v+(x?`: "${x.t}" (${this.time(x.ts)})`:'');this.close2();INQ.open('new','report')}return}}};
// the lobby button (after the friends' one) and its unread count
function gchLobby(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||!GCH.can())return;const L=LI();let b=tb.querySelector('.tgch');
  if(!b){b=document.createElement('button');b.className='tgch';b.dataset.act='gchat';b.dataset.tip=L?'Chat':'채팅';b.innerHTML=SVG_GCH+`<span>${L?'Chat':'채팅'}</span>`;
    const after=tb.querySelector('.tfr')||tb.querySelector('.tinv')||tb.querySelector('.trank');if(after)after.after(b);else tb.prepend(b)}
  gchDot()}
function gchDot(){const n=GCH.visible()?0:GCH.unread;for(const b of document.querySelectorAll('#menu .tbtns .tgch, #lobby .gchb')){const d=b.querySelector('.dot');
  if(n>0){if(!d){const i=document.createElement('i');i.className='dot';b.appendChild(i)}b.title=(LI()?'New messages':'새 메시지')+' '+n}else{if(d)d.remove();b.title=b.dataset.tip||''}}}
// (v6.76) the waiting room's footer: its host posts the room to the chat (채팅에 모집), the others open the chat
function gchRoomBtn(){const f=document.querySelector('#lobby .win.room .dpFoot');if(!f||!GCH.can()||f.querySelector('.gchb'))return;const L=LI(),host=!!(NET.host&&NET.kind==='peerjs');
  const t=host?(L?'Post to chat':'채팅에 모집'):(L?'Global chat':'전체 채팅'),b=document.createElement('button');b.className='gchb';b.dataset.act=host?'gchroom':'gchat';
  b.dataset.tip=t;b.title=t;b.setAttribute('aria-label',t);b.innerHTML=SVG_GCH+`<span>${t}</span>`;
  const lv=f.querySelector('[data-act="mpleave"]');if(lv)lv.before(b);else f.appendChild(b);gchDot()}
(function(){
  // (the lobby is drawn anew now and then: the box goes back into its new panel as it was)
  const bt=UI.buildTitle;UI.buildTitle=function(){const k=GCH.boxEl?GCH.keep():null;const r=bt.apply(this,arguments);try{gchLobby();GCH.mount(k)}catch(e){console.error(e)}return r};
  const sh=UI.show;UI.show=function(){const r=sh.apply(this,arguments);try{GCH.onShow()}catch(e){console.error(e)}return r};
  // the name menu and the chat's buttons, wherever the box is
  document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const b=t.closest('[data-gc]');
    if(GCH.menu&&!t.closest('#gcMenu')&&!(b&&b.dataset.gc==='who')){GCH.menu=null;GCH.renderMenu()}
    if(b&&t.closest('#gchBox,#gchWin,#gcMenu,.lchat'))GCH.act(b.dataset.gc,b.dataset.v,b)});
  const act0=UI.act;UI.act=function(a,v,el){if(a==='gchat'){GCH.toggle();return}if(a==='gchroom'){GCH.att=true;if(GCH.open)GCH.render();else GCH.show();const i=GCH.q('#gchIn');if(i)i.focus();return}return act0.call(this,a,v,el)};
  const ml=UI.mpLobby;UI.mpLobby=function(){const r=ml.apply(this,arguments);try{gchRoomBtn()}catch(e){console.error(e)}return r};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&GCH.open&&!(e.target&&e.target.id==='gchIn'))GCH.close2()});
  document.addEventListener('visibilitychange',()=>{GCH.hiddenAt=document.hidden?performance.now():0});
  // (the session's new token goes to the channel)
  const ss=ACC.setSes.bind(ACC);ACC.setSes=function(s){const r=ss(s);try{GCH.token()}catch(e){}return r};
  // (someone unblocked in the friends window: who is who is asked again, so their lines show at once)
  const ub=ACC.unblock.bind(ACC);ACC.unblock=async function(){const r=await ub.apply(null,arguments);try{GCH.who.clear()}catch(e){}return r};
  // (the heartbeat says whether the chat is on)
  const pg=ACC.ping.bind(ACC);ACC.ping=async function(){const r=await pg.apply(null,arguments);try{if(r&&typeof r.chat==='boolean')GCH.setOn(r.chat)}catch(e){}return r};
  ACC.sub(()=>{try{if(GCH.boxEl)GCH.render()}catch(e){console.error(e)}});
  const sm=startMatch;startMatch=function(cfg){GCH.close2();return sm(cfg)};
  setInterval(()=>{try{GCH.tick()}catch(e){console.error(e)}},1000);
  // (a token about to run out is refreshed first, so the private channel never sees an expired one)
  setInterval(()=>{const s=ACC.ses;if(GCH.joined&&GCH.priv&&s&&s.expires_at-Date.now()/1000<300)ACC.refresh().catch(()=>{})},60e3);
})();

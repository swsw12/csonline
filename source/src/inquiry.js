'use strict';
// ============ v6.66: 문의하기 — players (guests too) write to the operators; the answers come back under 「내 문의」 ============
// The lobby's top bar has a 문의하기 button (in the 더보기 menu on a small screen), and the ban window points to it. The window: what it is
// about (버그 · 계정 · 신고 · 건의 · 기타), 5..1,000 characters, a way to reach a guest if they like, and a line saying what the game adds
// (version, language, browser and screen: ctx — nothing else, and the account only when signed in). It goes to qz_inquiry_send (anyone,
// a guest too: the server limits how many). 「내 문의」 lists them with the operators' answers (qz_my_inquiries): a signed-in player's by
// the account, a guest's by the tickets this browser keeps (localStorage qz_inq, 30 at most). A new answer puts a red dot on the button
// (signed in: ACC.me.inqN from qz_me and the heartbeat; tickets: asked once when the game opens) and a toast in the lobby.
const SVG_ASK=ICO.ask;// (the lobby's icon, lobby.js)
const INQ={tab:'new',kind:'bug',body:'',contact:'',busy:false,res:'',resBad:false,rows:null,tNew:0,shown:0,peeked:false,off:false,
  KINDS:[['bug','버그 · 오류','Bug'],['account','계정 · 코인','Account · coins'],['report','플레이어 신고','Report a player'],['idea','건의','Suggestion'],['etc','기타','Other']],
  HINT:{bug:['어디서, 무엇을 하다가, 어떻게 됐는지 적어 주세요 (맵 · 모드 · 무기 · 멀티였는지)','Where, doing what, and what happened (map, mode, weapon, online or not)'],
    account:['계정 · 코인 · 무기 · 보상 문제를 적어 주세요. 비밀번호는 절대 적지 마세요','Your account, coins, weapons or rewards. Never write a password'],
    report:['신고할 플레이어의 닉네임(또는 친구 코드)과 언제, 어떤 일이 있었는지 적어 주세요','The player\'s nickname (or friend code), when, and what happened'],
    idea:['게임에 바라는 점을 자유롭게 적어 주세요','What you would like to see in the game'],etc:['운영진에게 하고 싶은 말을 적어 주세요','Anything for the operators']},
  kindName(k){const x=this.KINDS.find(z=>z[0]===k)||this.KINDS[4];return x[LI()?2:1]},
  // ---- the tickets this browser keeps (a guest's way back to the answers) ----
  tickets(){const t=ACC.ls('qz_inq');return Array.isArray(t)?t.filter(x=>/^[0-9a-f]{32}$/.test(String(x))).slice(-30):[]},
  keep(t){if(!/^[0-9a-f]{32}$/.test(String(t||'')))return;const L0=this.tickets().filter(x=>x!==t);L0.push(t);ACC.ls('qz_inq',L0.slice(-30))},
  // answers not read yet: the account's (the server counts them) + the ones only a ticket reaches
  n(){const me=ACC.signed()&&ACC.me;return (me?(me.inqN|0):0)+(this.tNew|0)},
  on(){return !!(ACC.on&&!this.off)},
  // ---- what the game adds: the version, language, browser and screen ----
  ctx(){const c={};try{c.ver=typeof PATCH!=='undefined'&&PATCH[0]?String(PATCH[0][0]):'';c.lang=LI()?'en':'ko';c.ua=String(navigator.userAgent||'').slice(0,160);
      c.scr=(screen.width|0)+'x'+(screen.height|0);c.view=(innerWidth|0)+'x'+(innerHeight|0);if(typeof TOUCH!=='undefined'&&TOUCH)c.touch=!!TOUCH.on;
      if(typeof GORE!=='undefined')c.gore=GORE.lv;if(typeof CFG!=='undefined'&&CFG&&CFG.scale!=null)c.scale=String(CFG.scale)}catch(e){}return c},
  ua(){const u=String(navigator.userAgent||''),v=re=>{const m=re.exec(u);return m?m[1]:null};let b='';
    for(const [n,re] of [['Edge',/Edg\/(\d+)/],['Whale',/Whale\/(\d+)/],['Samsung Internet',/SamsungBrowser\/(\d+)/],['Opera',/OPR\/(\d+)/],['Firefox',/Firefox\/(\d+)/],['Chrome',/Chrome\/(\d+)/],['Safari',/Version\/(\d+)[.\d]* .*Safari/]]){const x=v(re);if(x){b=n+' '+x;break}}
    const o=/Windows/.test(u)?'Windows':/Android/.test(u)?'Android':/iPhone|iPad|iPod/.test(u)?'iOS':/Mac OS X/.test(u)?'macOS':/CrOS/.test(u)?'ChromeOS':/Linux/.test(u)?'Linux':'';
    return [b,o].filter(Boolean).join(' · ')},
  ctxLine(){const c=this.ctx(),L=LI();return [c.ver,this.ua(),c.scr?c.scr.replace('x','×'):'',L?'English':'한국어'].filter(Boolean).join(' · ')},
  // ---- the server ----
  async load(mark){const r=await ACC.rpc('qz_my_inquiries',{p_tickets:this.tickets(),p_mark:mark!==false});const rows=Array.isArray(r&&r.rows)?r.rows:[];
    if(mark!==false){this.rows=rows;this.tNew=0;if(ACC.me&&ACC.me.inqN){ACC.me.inqN=0;ACC.emit()}else this.dot()}
    else{this.tNew=rows.filter(x=>x.new&&!x.mine).length;this.dot()}return rows},
  // once the account is known: the answers only tickets reach (a guest's, or ones written before signing in here)
  peek(){if(this.peeked||!this.on()||!ACC.ready)return;this.peeked=true;if(!this.tickets().length)return;
    this.load(false).catch(e=>{if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))this.off=true})},
  // ---- the dot on the button (and on 더보기 while the button sits in its menu) ----
  dot(){const n=this.on()?this.n():0,L=LI();
    for(const b of document.querySelectorAll('#menu .lobTop [data-act="inq"]')){let d=b.querySelector('.dot');if(n&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d)}else if(!n&&d)d.remove();
      b.title=(L?'Contact us':'문의하기')+(n?(L?` — ${n} new answer${n>1?'s':''}`:` — 새 답변 ${n}개`):'')}
    const tm=document.querySelector('#menu .lobTop .tmore');if(tm){let d=tm.querySelector('.dot');if(n&&!d){d=document.createElement('i');d.className='dot';tm.appendChild(d)}else if(!n&&d)d.remove()}
    if(n>this.shown){this.shown=n;if(G.st==='menu'&&!$('inqWin')&&typeof shopToast==='function')shopToast(L?'An operator answered your inquiry — Contact us → My inquiries':'문의에 답변이 왔어요 — 문의하기 → 내 문의')}
    else if(n<this.shown)this.shown=n},
  // ---- the window ----
  open(tab,kind){if(!this.on())return;const s=$('srvWin');if(s)s.remove();// (from the ban window: it goes, this one opens)
    if(kind&&this.KINDS.some(k=>k[0]===kind))this.kind=kind;this.tab=tab==='mine'||tab==='new'?tab:(this.n()?'mine':'new');this.res='';
    let o=$('inqWin');if(!o){o=document.createElement('div');o.id='inqWin';o.innerHTML='<div class="pwin"></div>';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const b=e.target.closest('[data-iq]');if(!b)return;this.act(b.dataset.iq,b.dataset.v)});
      o.addEventListener('input',e=>{if(e.target.name==='ib'){this.body=e.target.value;const c=o.querySelector('.icnt');if(c)c.textContent=`${e.target.value.length} / 1000`}else if(e.target.name==='ic')this.contact=e.target.value});
      o.addEventListener('keydown',e=>{if(e.key!=='Escape')e.stopPropagation()});o.addEventListener('keyup',e=>{if(e.key!=='Escape')e.stopPropagation()})}
    this.render();if(this.tab==='mine')this.list();else{const t=o.querySelector('textarea');if(t)setTimeout(()=>{try{t.focus()}catch(e){}},30)}},
  close(){const o=$('inqWin');if(o)o.remove()},
  list(){this.rows=this.rows||null;this.render();this.load(true).then(()=>this.render()).catch(e=>{this.res=esc(ACC.errText(e));this.resBad=true;this.render()})},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='tab'){this.tab=v;this.res='';if(v==='mine')this.list();else{this.render();const t=$('inqWin')&&$('inqWin').querySelector('textarea');if(t)t.focus()}return}
    if(a==='kind'){this.kind=v;this.render();const t=$('inqWin')&&$('inqWin').querySelector('textarea');if(t)t.focus();return}
    if(a==='login'){this.close();if(typeof ACCW!=='undefined')ACCW.open('in');return}
    if(a==='send')this.send()},
  async send(){const L=LI(),b=String(this.body||'').trim();if(this.busy)return;
    if(b.length<5){this.res=esc(L?'Write at least 5 characters':'문의 내용을 5자 이상 적어 주세요');this.resBad=true;this.render();return}
    this.busy=true;this.res='';this.render();
    try{const guest=!ACC.signed(),r=await ACC.rpc('qz_inquiry_send',{p_kind:this.kind,p_body:b.slice(0,1000),p_contact:guest&&this.contact.trim()?this.contact.trim().slice(0,100):null,p_ctx:this.ctx()});
      if(guest)this.keep(r&&r.ticket);this.body='';this.tab='mine';this.rows=null;AU.play('uiok',{vol:.5});
      this.res=esc(guest?(L?'Sent. The answer shows here under My inquiries, in this browser.':'보냈어요. 답변은 이 브라우저의 「내 문의」에 와요.'):(L?'Sent. When an operator answers, a red dot shows on Contact us.':'보냈어요. 운영진이 답변하면 문의하기 버튼에 빨간 점이 떠요.'));this.resBad=false;
      this.busy=false;this.render();this.load(true).then(()=>this.render()).catch(()=>{});return}
    catch(e){if(/Could not find the function|PGRST202/i.test((e.message||'')+' '+(e.code||'')))this.res=esc(L?'Inquiries need the server updated (schema.sql)':'문의는 서버 업데이트(schema.sql) 뒤에 쓸 수 있어요');else this.res=esc(ACC.errText(e));this.resBad=true}
    this.busy=false;this.render()},
  render(){const o=$('inqWin');if(!o)return;const L=LI(),w=o.querySelector('.pwin'),guest=!ACC.signed(),n=this.n(),tb=o.querySelector('textarea'),sel=tb?[tb.selectionStart,tb.selectionEnd]:null;
    const tabs=`<div class="itabs">${[['new',L?'Write':'문의 쓰기'],['mine',L?'My inquiries':'내 문의']].map(([k,t])=>`<button class="${this.tab===k?'on':''}" data-iq="tab" data-v="${k}">${t}${k==='mine'&&n?`<i class="n">${n}</i>`:''}</button>`).join('')}</div>`;
    let body='',foot='';
    if(this.tab==='new'){const H=this.HINT[this.kind]||this.HINT.etc;
      body=`<div class="ikinds" role="radiogroup">${this.KINDS.map(([k,ko,en])=>`<button class="${this.kind===k?'on':''}" data-iq="kind" data-v="${k}" role="radio" aria-checked="${this.kind===k}">${L?en:ko}</button>`).join('')}</div>
        <textarea name="ib" maxlength="1000" rows="7" placeholder="${esc(H[L])}">${esc(this.body)}</textarea><div class="icnt">${String(this.body||'').length} / 1000</div>
        ${guest?`<label class="ict"><span>${L?'A way to reach you':'답장 받을 연락처'} <small>${L?'(optional, e-mail or the like — only the operators see it)':'(선택 — 이메일 등, 운영진만 봐요)'}</small></span><input name="ic" maxlength="100" autocomplete="email" placeholder="you@example.com" value="${esc(this.contact)}"></label>
          <p class="inote">${L?'A guest\'s answers show under My inquiries in this browser only.':'게스트 문의의 답변은 이 브라우저의 「내 문의」에서만 볼 수 있어요.'} <button class="ilink" data-iq="login">${L?'Sign in':'로그인'}</button>${L?' to see them anywhere.':'하면 어디서든 볼 수 있어요.'}</p>`
          :`<p class="inote">${L?'Sent as':'보내는 계정'}: <b>${esc(ACC.me.nickname)}</b> — ${L?'the answer comes back here and in My inquiries.':'답변은 「내 문의」로 와요.'}</p>`}
        <p class="inote dim">${L?'Sent along':'함께 가는 정보'}: ${esc(this.ctxLine())}${typeof LEGAL!=='undefined'?` · <a href="${LEGAL.privacy}" target="_blank" rel="noopener">${L?'Privacy':'개인정보처리방침'}</a>`:''}</p>`;
      foot=`<div class="pwf"><button class="isend" data-iq="send"${this.busy?' disabled':''}>${this.busy?'…':(L?'Send':'보내기')}</button></div>`}
    else{const R=this.rows;
      body=R==null?`<p class="mem">${L?'Loading…':'불러오는 중…'}</p>`:!R.length?`<p class="mem">${L?'No inquiries yet.':'아직 보낸 문의가 없어요.'}</p>`
        :R.map(q=>`<div class="iq${q.reply?' ans':''}${q.new?' new':''}"><div class="iqh"><em>${esc(this.kindName(q.kind))}</em><time>${esc(fmtWhen(q.at))}</time><span class="st ${q.reply?'a':q.status==='done'?'d':'w'}">${q.reply?(L?'Answered':'답변 완료'):q.status==='done'?(L?'Closed':'처리 완료'):(L?'Waiting':'답변 대기')}</span></div>
          <p>${esc(q.body)}</p>${q.reply?`<div class="iqr"><div><b>${L?'Operators':'운영진 답변'}</b>${q.new?`<i>${L?'NEW':'새 답변'}</i>`:''}<time>${esc(fmtWhen(q.reply_at))}</time></div><p>${esc(q.reply)}</p></div>`:''}</div>`).join('')
        +(guest&&R.length?`<p class="inote dim">${L?'Guest inquiries are kept by this browser (30 at most).':'게스트 문의는 이 브라우저에 30개까지 남아요.'}</p>`:'');
      foot=`<div class="pwf"><button data-iq="tab" data-v="new">${L?'Write another':'새 문의 쓰기'}</button></div>`}
    w.innerHTML=`<div class="pwh">${SVG_ASK}<b>${L?'Contact us':'문의하기'}</b><button data-iq="x" aria-label="close">×</button></div>${tabs}<div class="pwb">${body}</div>${this.res?`<div class="mres${this.resBad?' bad':''}">${this.res}</div>`:''}${foot}`;
    const t2=w.querySelector('textarea');if(t2&&sel&&document.activeElement===document.body){try{t2.focus();t2.setSelectionRange(sel[0],sel[1])}catch(e){}}}};
(function(){
  const act0=UI.act;UI.act=function(a,v,el){if(a==='inq'){INQ.open(v?'new':null,v);return}return act0.call(this,a,v,el)};// (v: a kind to start on — the ban window's 문의하기)
  addEventListener('keydown',e=>{if(e.code==='Escape'&&$('inqWin')){INQ.close();e.stopPropagation()}},true);
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{INQ.dot()}catch(e){console.error(e)}return r};
  ACC.sub(()=>{try{INQ.dot();INQ.peek();if($('inqWin')&&!INQ.busy){const ta=$('inqWin').querySelector('textarea');if(!ta||document.activeElement!==ta)INQ.render()}}catch(e){console.error(e)}});
  const sm=startMatch;startMatch=function(cfg){INQ.close();return sm(cfg)};
})();

'use strict';
// ============ The gun shop (coins), the sign-in window and what they change in the game ============
// Coins come from finished matches (worked out by the database, see supabase/schema.sql) and buy guns for good. In a match,
// round money ($) only buys guns you own; the free set is everyone's. Picking a gun up off the floor, supply crates and the
// 근하신년 free pick still hand out any gun. With accounts off (no Supabase settings in account.js) every gun stays open.
// Prices: the database table gun_prices is the truth; this copy (same numbers as schema.sql) is shown until it has loaded.
const SHOP_FREE=['knife','p9','sg8','k5','g35'];
const SHOP_PRICE={f7:1200,d50:1500,tw9:1800,r6:2000,duckfoot:6000,db2:1500,m14:3500,as12:4500,volc:12000,mdrill:14000,k9:1200,um45:1800,pd50:3000,sterling:6500,br3:2500,kv47:3500,ar7:4000,ar5c:4500,hr17:5500,xbow:7000,xbowa:9000,sr8:2500,r700:6500,dm14:7000,mg6:6000,hmg:6500,gx6:10000,airb:4500,gl40:5500,axe:1500,hammer:4000,bdc:11000,rdc:16000,ripper:9000,gaebolg:10000,xdz:9500,mlaunch:13000};
const SHOP_NOTSOLD=['bhole'];
const COIN='<i class="ci"></i>';
const fmtC=n=>Math.round(n||0).toLocaleString('en-US');
const KIND_N={pistol:['권총','Pistol'],smg:['기관단총','SMG'],shotgun:['산탄총','Shotgun'],rifle:['소총','Rifle'],sniper:['저격총','Sniper'],mg:['기관총','Machine gun'],
  special:['특수','Special'],melee:['근접','Melee'],saw:['전기톱','Chainsaw']};
const SVG_LOCK='<svg class="lki" viewBox="0 0 16 16"><path fill="currentColor" d="M5 7V5a3 3 0 016 0v2h1v8H4V7zm1.6 0h2.8V5a1.4 1.4 0 00-2.8 0z"/></svg>';
const SVG_CART='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 2h2.4l.5 2H15l-1.6 6H5.2l.4 1.6H13V13H4.4L2.2 3.6H1zm4 12.5a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z"/></svg>';
const SVG_USER='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1.5a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zM2 14.5c.4-3.2 3-5 6-5s5.6 1.8 6 5z"/></svg>';

// ---------- what the shop sells, in the buy menu's order ----------
function shopCats(){const L=LI();const cats=BUY_MENU.filter(c=>c.k!=='equip').map(c=>({k:c.k,n:c.n[L],items:c.items.filter(id=>WPN[id]&&WPN[id].model)}));
  const sp=cats.find(c=>c.k==='special');if(sp)sp.items=['knife',...sp.items.filter(i=>i!=='knife'),'bhole'].filter(id=>WPN[id]);
  const seen=new Set(),all=[];for(const c of cats)for(const id of c.items)if(!seen.has(id)){seen.add(id);all.push(id)}
  return [{k:'all',n:L?'All':'전체',items:all},...cats]}
// free / own / buy / crate
function shopState(id){const p=ACC.price(id);if(!p)return 'free';if(p.free)return 'free';if(!p.sold)return 'crate';if(ACC.me&&ACC.me.owned&&ACC.me.owned.has(id))return 'own';return 'buy'}
// free ones first, then by price; crate-only ones last
function shopOrder(ids){const grp=s=>s==='free'?0:s==='crate'?2:1;return ids.slice().sort((a,b)=>{const sa=shopState(a),sb=shopState(b);
  return grp(sa)-grp(sb)||((ACC.price(a)||{}).price||0)-((ACC.price(b)||{}).price||0)})}

// ---------- the shop window ----------
const SHOP={cat:'all',sel:null,onlyOwn:false,confirm:null,msg:'',msgOk:false,busy:false,
  open(id){let o=$('shopWin');if(!o){o=document.createElement('div');o.id='shopWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-sa]');if(t)this.act(t.dataset.sa,t.dataset.v)});
      o.addEventListener('change',e=>{if(e.target.dataset.sa==='own'){this.onlyOwn=e.target.checked;this.render()}})}
    if(id){this.sel=id;this.cat='all'}this.confirm=null;this.msg='';this.scrollSel=true;this.render();AU.play('ui',{vol:.35})},
  close(){const o=$('shopWin');if(o)o.remove();this.confirm=null},
  list(){const C=shopCats(),c=C.find(x=>x.k===this.cat)||C[0];let ids=c.items;if(this.onlyOwn)ids=ids.filter(id=>{const s=shopState(id);return s==='free'||s==='own'});return {C,c,ids:shopOrder(ids)}},
  render(){const o=$('shopWin');if(!o)return;const L=LI(),{C,ids}=this.list();if(!ids.includes(this.sel))this.sel=ids[0]||null;
    const signed=ACC.signed(),coins=signed?ACC.me.coins:0,me=ACC.me;
    const head=!ACC.on?`<span class="soff">${L?'Accounts not set up — every gun is open':'계정 서버 연결 전 — 지금은 모든 총 사용 가능'}</span>`
      :signed?`<span class="scoin">${COIN}<b>${fmtC(coins)}</b></span><button class="sacc" data-sa="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`
      :`<button class="sacc hl" data-sa="login">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`;
    const cards=ids.map(id=>{const W=WPN[id],st=shopState(id),p=ACC.price(id)||{price:0};
      const tag=st==='free'?`<em class="bf">${L?'FREE':'기본'}</em>`:st==='own'?`<em class="bo">${L?'OWNED':'보유'}</em>`:st==='crate'?`<em class="bc">${L?'CRATE ONLY':'보급 전용'}</em>`
        :`<span class="pr${signed&&coins<p.price?' poor':''}">${COIN}${fmtC(p.price)}</span>`;
      return `<div class="sc ${st}${id===this.sel?' on':''}" data-sa="sel" data-v="${id}">${W.ny?'<i class="nyb">NY</i>':''}<div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b><span class="scp">${tag}</span></div>`}).join('')
      ||`<div class="sempty">${L?'Nothing here yet':'아직 없어요'}</div>`;
    o.innerHTML=`<div class="swin"><div class="swh"><b>${L?'Shop':'상점'}</b><small>SHOP</small><span class="sgap"></span>${head}<button class="sx" data-sa="x" aria-label="close">×</button></div>
      <div class="stabs"><div class="stl">${C.map(c=>`<button class="${c.k===this.cat?'on':''}" data-sa="cat" data-v="${c.k}">${esc(c.n)}</button>`).join('')}</div>
        <label class="sfil"><input type="checkbox" data-sa="own"${this.onlyOwn?' checked':''}><span>${L?'Mine only':'보유한 총만'}</span></label></div>
      <div class="sbody"><div class="sgrid">${cards}</div>${this.detail()}</div>
      <div class="sfoot">${L?'Coins come from finished matches — rounds, kills, infections, damage and wins. In a match, round money ($) only buys guns you own; floor pick-ups, supply crates and the 근하신년 free pick still give any gun. The shooting range lends you every gun to try.'
        :'코인은 매치를 끝까지 하면 라운드·킬·감염·피해량·승리에 따라 들어와요. 매치 안에서 판돈($)으로는 보유한 총만 살 수 있고, 바닥에 떨어진 총·보급상자·근하신년 무료 교환은 그대로예요. 사격장에서는 모든 총을 빌려 쏴 볼 수 있어요.'}</div></div>`;
    if(this.scrollSel){this.scrollSel=false;const c=o.querySelector('.sc.on');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest'})}},
  detail(){const L=LI(),id=this.sel,W=id&&WPN[id];if(!W)return '<div class="sdet"></div>';const st=shopState(id),p=ACC.price(id)||{price:0},signed=ACC.signed(),coins=signed?ACC.me.coins:0;
    const kn=(KIND_N[W.kind]||KIND_N.special)[L?1:0];
    const info=[kn,W.cost!=null&&W.cost>0?(L?'round $':'판돈 $')+fmtC(W.cost):null,W.mag?W.mag+(L?' rds':'발'):null,W.rpm?W.rpm+' RPM':null].filter(Boolean).join(' · ');
    let buy;
    if(!ACC.on)buy=`<div class="sbn">${L?'Accounts are not set up yet, so every gun is open for now.':'계정 서버가 연결되기 전이라 지금은 모든 총을 쓸 수 있어요.'}</div>${st==='buy'?`<div class="sbp">${COIN}${fmtC(p.price)}</div>`:''}`;
    else if(st==='free')buy=`<div class="sbn ok">${L?'Free for everyone.':'기본 지급 — 누구나 쓸 수 있어요.'}</div>`;
    else if(st==='own')buy=`<div class="sbn ok">${L?'Yours. Buy it with round money in a match.':'보유 중 — 매치에서 판돈($)으로 살 수 있어요.'}</div>`;
    else if(st==='crate')buy=`<div class="sbn">${L?'Only from supply crates.':'보급상자에서만 얻을 수 있어요.'}</div>`;
    else if(!signed)buy=`<div class="sbp">${COIN}${fmtC(p.price)}</div><button class="sbb" data-sa="login">${L?'Sign in to buy':'로그인하고 구매'}</button>`;
    else if(this.confirm===id)buy=`<div class="sbq">${L?`Buy ${esc(W.n[1])} for ${fmtC(p.price)} coins?`:`${esc(W.n[0])}, ${fmtC(p.price)} 코인에 살까요?`}</div>
      <div class="sbr"><button class="sbb" data-sa="buyok" data-v="${id}"${this.busy?' disabled':''}>${this.busy?(L?'Buying…':'구매 중…'):(L?'Buy':'구매')}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(coins>=p.price)buy=`<button class="sbb" data-sa="buy" data-v="${id}">${COIN}${fmtC(p.price)} <span>${L?'Buy':'구매'}</span></button>`;
    else buy=`<button class="sbb" disabled>${COIN}${fmtC(p.price)}</button><div class="sbn bad">${L?fmtC(p.price-coins)+' coins short':'코인 '+fmtC(p.price-coins)+' 부족'}</div>`;
    if(this.msg)buy+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    return `<div class="sdet"><div class="sdi"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${esc(W.n[L?0:1])}</small></h4><div class="sinfo">${info}</div>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p><div class="sbuy">${buy}</div></div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='cat'){this.cat=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();const g=document.querySelector('#shopWin .sgrid');if(g)g.scrollTop=0;return}
    if(a==='sel'){if(this.sel!==v){this.sel=v;this.confirm=null;this.msg='';this.render();AU.play('ui',{vol:.25})}return}
    if(a==='login'){ACCW.open('in');return}
    if(a==='acc'){ACCW.open('me');return}
    if(a==='buy'){this.confirm=v;this.msg='';this.render();return}
    if(a==='buyno'){this.confirm=null;this.render();return}
    if(a==='buyok'){this.buy(v);return}},
  async buy(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.buy(id);this.msg=(L?'Bought: ':'구매 완료 — ')+W.n[L];this.msgOk=true;AU.play('buy',{vol:.8})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});if(/not_signed_in|JWT/i.test(String(e.message)))ACCW.open('in')}
    this.busy=false;this.confirm=null;this.render()}};

// ---------- the account window: sign in / sign up / password / my account ----------
const ACCW={mode:'in',msg:'',ok:false,busy:false,f:{email:'',pw:'',nick:''},
  open(mode){let o=$('accWin');if(!o){o=document.createElement('div');o.id='accWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-aa]');if(t)this.act(t.dataset.aa,t.dataset.v)});
      o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target.tagName==='INPUT'){e.preventDefault();this.act('go')}});
      o.addEventListener('keyup',e=>e.stopPropagation())}
    this.mode=mode||'in';this.msg='';this.ok=false;this.render();const i=o.querySelector('input');if(i)setTimeout(()=>{try{i.focus()}catch(e){}},30)},
  close(){const o=$('accWin');if(o)o.remove();try{LS.set('accSeen',1)}catch(e){}},
  grab(){const o=$('accWin');if(!o)return;for(const k of ['email','pw','nick']){const i=o.querySelector('[name="'+k+'"]');if(i)this.f[k]=i.value}},
  render(){const o=$('accWin');if(!o)return;this.grab();const L=LI(),m=this.mode,f=this.f,me=ACC.me;
    const inp=(k,type,ph,ac)=>`<input name="${k}" type="${type}" placeholder="${ph}" autocomplete="${ac}" value="${esc(f[k]||'')}" maxlength="${k==='nick'?16:120}">`;
    const tabs=m==='in'||m==='up'?`<div class="atabs"><button class="${m==='in'?'on':''}" data-aa="mode" data-v="in">${L?'Sign in':'로그인'}</button><button class="${m==='up'?'on':''}" data-aa="mode" data-v="up">${L?'Sign up':'회원가입'}</button></div>`:'';
    const so=(m==='in'||m==='up')&&SB.oauth&&SB.oauth.length?`<div class="aor"><span>${L?'or':'또는'}</span></div><div class="aso">${SB.oauth.map(p=>`<button class="ao ${p}" data-aa="oauth" data-v="${p}">${p==='google'?'<b>G</b> '+(L?'Continue with Google':'Google로 계속'):p==='kakao'?'<b>K</b> '+(L?'Continue with Kakao':'카카오로 계속'):esc(p)}</button>`).join('')}</div>`:'';
    let body='';
    if(m==='in')body=`<label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label><label>${L?'Password':'비밀번호'}${inp('pw','password','••••••','current-password')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Sign in':'로그인')}</button><button class="alink" data-aa="mode" data-v="reset">${L?'Forgot your password?':'비밀번호를 잊었어요'}</button>${so}`;
    else if(m==='up')body=`<label>${L?'Nickname':'닉네임'} <small>${L?'2–16 characters':'2~16자'}</small>${inp('nick','text',L?'Survivor':'생존자','nickname')}</label><label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label>
      <label>${L?'Password':'비밀번호'} <small>${L?'6+ characters':'6자 이상'}</small>${inp('pw','password','••••••','new-password')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Create account':'가입하기')}</button><p class="anote">${COIN} ${L?'3,000 coins to start with':'가입하면 3,000 코인을 드려요'}</p>${so}`;
    else if(m==='reset')body=`<p class="anote">${L?'We will mail you a link to set a new password.':'새 비밀번호를 정할 수 있는 링크를 메일로 보내 드려요.'}</p><label>${L?'E-mail':'이메일'}${inp('email','email','you@example.com','email')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Send the link':'링크 보내기')}</button><button class="alink" data-aa="mode" data-v="in">${L?'Back to sign in':'로그인으로 돌아가기'}</button>`;
    else if(m==='newpw')body=`<p class="anote">${L?'Choose a new password.':'새 비밀번호를 정해 주세요.'}</p><label>${L?'New password':'새 비밀번호'}${inp('pw','password','••••••','new-password')}</label>
      <button class="ago" data-aa="go"${this.busy?' disabled':''}>${this.busy?'…':(L?'Save':'저장')}</button>`;
    else if(m==='sent')body=`<p class="anote big">${this.msg?esc(this.msg):''}</p><button class="ago" data-aa="mode" data-v="in">${L?'OK':'확인'}</button>`;
    else if(m==='me'&&me)body=`<div class="ame"><div class="amc">${COIN}<b>${fmtC(me.coins)}</b><small>${L?'coins':'코인'}</small></div>
        <div class="ams"><span>${L?'Earned':'모은 코인'} <b>${fmtC(me.earned||0)}</b></span><span>${L?'Matches':'정산한 판'} <b>${fmtC(me.matches||0)}</b></span><span>${L?'Left today':'오늘 남은 보상'} <b>${fmtC(me.dayLeft==null?8000:me.dayLeft)}</b></span><span>${L?'Guns owned':'보유 총'} <b>${(me.owned?me.owned.size:0)+SHOP_FREE.length}</b></span></div>
        ${me.email?`<p class="anote">${esc(me.email)}</p>`:''}</div>
      <label>${L?'Nickname':'닉네임'}${inp('nick','text',esc(me.nickname),'nickname')}</label><button class="ago" data-aa="nick"${this.busy?' disabled':''}>${L?'Change nickname':'닉네임 바꾸기'}</button>
      <div class="arow"><button class="alink" data-aa="shop">${L?'Open the shop':'상점 열기'}</button><button class="alink red" data-aa="out">${L?'Sign out':'로그아웃'}</button></div>`;
    else body=`<p class="anote">${L?'Not signed in.':'로그인되어 있지 않아요.'}</p><button class="ago" data-aa="mode" data-v="in">${L?'Sign in':'로그인'}</button>`;
    const title={in:L?'Sign in':'로그인',up:L?'Sign up':'회원가입',reset:L?'Reset password':'비밀번호 재설정',newpw:L?'New password':'새 비밀번호',sent:L?'Check your mail':'메일을 확인해 주세요',me:L?'My account':'내 계정'}[m]||'';
    o.innerHTML=`<div class="awin"><div class="awh"><b>${title}</b><button data-aa="x" aria-label="close">×</button></div>${tabs}<div class="awb">${body}
      ${m!=='sent'&&this.msg?`<div class="amsg ${this.ok?'ok':'bad'}">${esc(this.msg)}</div>`:''}
      ${m==='in'||m==='up'?`<button class="aguest" data-aa="x">${L?'Play as a guest — free guns only':'게스트로 계속 — 기본 총만 사용'}</button>`:''}</div></div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='mode'){this.grab();this.mode=v;this.msg='';this.render();return}
    if(a==='oauth'){ACC.oauth(v);return}
    if(a==='shop'){this.close();SHOP.open();return}
    if(a==='out'){ACC.signOut().then(()=>{this.close();shopToast(L?'Signed out':'로그아웃했어요')});return}
    if(a==='nick'){this.grab();this.run(async()=>{const n=await ACC.setNick(this.f.nick);this.f.nick='';this.msg=(L?'Nickname: ':'닉네임 변경 — ')+n;this.ok=true});return}
    if(a==='go'){this.grab();const f=this.f,m=this.mode;
      if((m==='in'||m==='up'||m==='reset')&&!/^\S+@\S+\.\S+$/.test(f.email.trim())){this.msg=L?'Enter your e-mail address':'이메일을 입력해 주세요';this.ok=false;this.render();return}
      if((m==='in'||m==='up'||m==='newpw')&&(f.pw||'').length<6){this.msg=L?'Use a password of at least 6 characters':'비밀번호는 6자 이상이에요';this.ok=false;this.render();return}
      if(m==='up'&&(f.nick||'').trim().length<2){this.msg=L?'Pick a nickname (2–16 characters)':'닉네임을 2~16자로 정해 주세요';this.ok=false;this.render();return}
      if(m==='in')this.run(async()=>{await ACC.signIn(f.email.trim(),f.pw);this.done(L?'Welcome back, ':'어서 와요, ')});
      else if(m==='up')this.run(async()=>{const r=await ACC.signUp(f.email.trim(),f.pw,f.nick.trim());
        if(r.confirm){this.mode='sent';this.msg=L?'We sent a confirmation link to '+f.email.trim()+'. Open it to finish signing up — you will come back here signed in.':f.email.trim()+' 로 인증 메일을 보냈어요. 메일의 링크를 누르면 로그인된 상태로 돌아와요.'}
        else this.done(L?'Welcome, ':'환영해요, ')});
      else if(m==='reset')this.run(async()=>{await ACC.recover(f.email.trim());this.mode='sent';this.msg=L?'If that e-mail has an account, a reset link is on its way.':'가입된 이메일이면 재설정 링크가 곧 도착해요.'});
      else if(m==='newpw')this.run(async()=>{await ACC.newPassword(f.pw);this.f.pw='';this.mode='me';this.msg=L?'Password changed':'비밀번호를 바꿨어요';this.ok=true});
      return}},
  done(hi){const me=ACC.me;this.f.pw='';this.close();if(me){shopToast(hi+me.nickname+' · '+fmtC(me.coins)+(LI()?' coins':' 코인'));AU.play('uiok',{vol:.5})}},
  async run(fn){if(this.busy)return;this.busy=true;this.msg='';this.render();try{await fn()}catch(e){this.msg=ACC.errText(e);this.ok=false}this.busy=false;if($('accWin'))this.render()}};
// a short line on screen: in a match the HUD's note, in the lobby a toast
function shopToast(t){if(G.st!=='menu'&&HUD.note){HUD.note(t,2.4);return}let el=$('qzToast');if(!el){el=document.createElement('div');el.id='qzToast';document.body.appendChild(el)}
  el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2600)}
addEventListener('keydown',e=>{if(e.code!=='Escape')return;if($('accWin')){ACCW.close();e.stopPropagation();e.preventDefault()}else if($('shopWin')){SHOP.close();e.stopPropagation();e.preventDefault()}},true);

// ---------- the lobby: coins, sign-in and the shop button ----------
function shopLobby(){const top=document.querySelector('#menu .lobTop');if(!top)return;const L=LI(),me=ACC.me,signed=ACC.signed();
  if(signed){const nb=top.querySelector('.prof b');if(nb)nb.textContent=me.nickname}
  const old=top.querySelector('.accChip');if(old)old.remove();
  if(ACC.on){const ch=document.createElement('div');ch.className='accChip';
    ch.innerHTML=signed||(me&&me.cached)?`<button class="acoin" data-act="shop" title="${L?'Coins':'코인'}">${COIN}<b>${fmtC(me.coins)}</b></button><button class="aname" data-act="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`
      :`<button class="alog" data-act="acc">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`;
    const pf=top.querySelector('.prof');if(pf)pf.after(ch);else top.prepend(ch)}
  const tb=top.querySelector('.tbtns');if(tb&&!tb.querySelector('.tshop')){const b=document.createElement('button');b.className='tshop';b.dataset.act='shop';b.innerHTML=SVG_CART+`<span>${L?'Shop':'상점'}</span>`;tb.prepend(b)}}

// ---------- in a match: round money only buys guns you own ----------
// (the shooting range lends every gun: try before you buy)
function shopLocked(P,id){if(!ACC.on||!P||G.mode==='range')return false;const W=WPN[id];if(!W||!W.model||W.kind==='nade')return false;if(ACC.owns(id))return false;
  if(P.inv[W.slot]===id)return false;// already in hand (picked up): ammo for it is fine
  if(W.ny&&P.nyFree>0)return false;// the 근하신년 free pick
  return true}

// ---------- after a match: the coins ----------
function shopMatchStats(){const P=G.player,A=G.actors.filter(a=>!a.scen&&!a.rg),best=A.slice().sort((a,b)=>(b.score||0)-(a.score||0))[0];
  return {mode:G.mode,rounds:G.round|0,kills:P.kills|0,infects:P.infects|0,damage:P.dmgDealt||0,won:(G.score&&G.score[TH]>G.score[TZ]),mvp:best===P&&(P.score||0)>0,
    stage:typeof SCEN!=='undefined'?(SCEN.best||SCEN.stage||0):0,cleared:typeof SCEN!=='undefined'&&!!SCEN.win}}
function shopReward(){const P=G.player,res=$('results');if(!P||!res||!ACC.on||G.mode==='range')return;const L=LI();
  const box=document.createElement('div');box.className='coinRes';const put=()=>{const fs=res.querySelector('.finalScore');if(fs)fs.after(box);else res.prepend(box)};
  if(G.coinDone){if(G.coinBox){box.innerHTML=G.coinBox;put()}return}G.coinDone=true;// shown again, never paid twice
  if(!ACC.signed())box.innerHTML=`${COIN}<span>${L?'Sign in to earn coins from every match and buy guns for good.':'로그인하면 매치마다 코인을 받고 총을 영구 구매할 수 있어요.'}</span><button data-act="acc">${L?'Sign in':'로그인'}</button>`;
  else{box.innerHTML=`${COIN}<span>${L?'Counting your coins…':'코인 정산 중…'}</span>`;
    ACC.claim(shopMatchStats()).then(r=>{G.coinBox=box.innerHTML=`${COIN}<span><b>+${fmtC(r.got)}</b> ${L?'coins':'코인'}${r.bonus?` <small>(${L?'first match today':'오늘 첫 판'} +${fmtC(r.bonus)})</small>`:''}${r.day_left<=0?` <small>${L?'— daily limit reached':'— 오늘 받을 수 있는 만큼 다 받았어요'}</small>`:''}</span><span class="crh">${L?'You have':'보유'} ${COIN}${fmtC(r.coins)}</span><button data-act="shop">${L?'Shop':'상점'}</button>`;AU.play('buy',{vol:.6})})
      .catch(e=>{G.coinBox=box.innerHTML=`${COIN}<span>${esc(ACC.errText(e))}</span>`})}
  put()}

// ---------- hooks ----------
(function(){
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{shopLobby()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){
    if(a==='shop'){SHOP.open();return}
    if(a==='acc'){ACCW.open(ACC.signed()?'me':'in');return}
    if(a==='buylk'){const W=WPN[v],p=ACC.price(v),L=LI();HUD.note(`${W?W.n[L]:''}: ${L?'buy it in the shop first':'상점에서 먼저 사야 해요'} (${fmtC(p&&p.price)} ${L?'coins':'코인'})`,2);AU.play('dry',{vol:.5});return}
    return act0.call(this,a,v,el)};
  const rb=UI.renderBuy;UI.renderBuy=function(){const r=rb.apply(this,arguments);const P=G.player;if(!ACC.on||!P)return r;const L=LI();
    for(const el of document.querySelectorAll('#buy .bi[data-v]')){const id=el.dataset.v;if(!shopLocked(P,id))continue;const p=ACC.price(id);
      el.classList.add('lk','na');el.dataset.act='buylk';const c=el.querySelector('.c');if(c)c.innerHTML=SVG_LOCK+`<small>${COIN}${fmtC(p&&p.price)}</small>`}
    const h=document.querySelector('#buy h3');if(h&&!h.querySelector('.bcoin')){const s=document.createElement('span');s.className='bcoin';s.innerHTML=ACC.signed()?`${COIN}${fmtC(ACC.me.coins)} · ${L?'locked guns are bought in the lobby shop':'잠긴 총은 로비 상점에서 구매'}`:(L?'Guest: free guns only — sign in to unlock more':'게스트: 기본 총만 — 로그인하면 더 많은 총');h.appendChild(s)}
    return r};
  const bi=Main.buyItem;Main.buyItem=function(id){const P=G.player;if(shopLocked(P,id)){UI.act('buylk',id);return}return bi.call(this,id)};
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{shopReward()}catch(e){console.error(e)}return r};
  const sm=startMatch;startMatch=function(cfg){G.coinDone=false;G.coinBox=null;return sm(cfg)};
  // the signed-in nickname is the name other players see
  const mn=myName;myName=function(){return ACC.signed()&&ACC.me.nickname||mn()};
  ACC.sub(()=>{if(G.st==='menu'&&UI.open==='menu')UI.buildTitle();if($('shopWin'))SHOP.render();if($('accWin')&&!ACCW.busy)ACCW.render()});
  ACC.init().then(kind=>{const L=LI();
    if(kind==='recovery'){ACCW.open('newpw');return}
    if(ACC.lastErr){ACCW.open('in');ACCW.msg=ACC.lastErr;ACCW.ok=false;ACCW.render();return}
    if(ACC.signed()&&kind){shopToast((L?'Welcome, ':'환영해요, ')+ACC.me.nickname);return}
    // first visit: offer to sign in once the lobby is on screen (the boot can still be painting characters)
    let seen=null;try{seen=LS.get('accSeen',null)}catch(e){}
    const ask=n=>{if(ACC.signed()||$('accWin')||G.st!=='menu')return;if(UI.open==='menu')ACCW.open('in');else if(n<60)setTimeout(()=>ask(n+1),700)};
    if(ACC.on&&!ACC.signed()&&!seen)setTimeout(()=>ask(0),700)}).catch(e=>console.error(e));
})();

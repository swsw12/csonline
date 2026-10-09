'use strict';
// ============ The gun shop (coins), the sign-in window and what they change in the game ============
// Coins come from finished matches (worked out by the database, see supabase/schema.sql) and buy guns for good. In a match,
// round money ($) only buys guns you own; the free set is everyone's. Picking a gun up off the floor, supply crates and the
// 근하신년 free pick still hand out any gun; the 근하신년 guns themselves come from the decoder bingo (or the fragment exchange). With accounts off (no Supabase settings in account.js) every gun stays open.
// Prices: the database table gun_prices is the truth; this copy (same numbers as schema.sql) is shown until it has loaded.
const SHOP_FREE=['knife','p9','sg8','k5','g35'];
const SHOP_PRICE={f7:1200,d50:1500,tw9:1800,r6:2000,db2:1500,m14:3500,as12:4500,k9:1200,um45:1800,pd50:3000,br3:2500,kv47:3500,ar7:4000,ar5c:4500,hr17:5500,sr8:2500,r700:6500,dm14:7000,mg6:6000,hmg:6500,gx6:10000,airb:4500,gl40:5500,axe:1500,hammer:4000};
const SHOP_NOTSOLD=['bhole'];
const SHOP_GACHA={S:['rdc','mdrill','mlaunch','volc','bdc','gaebolg'],A:['xdz','ripper','xbowa','xbow','sterling','duckfoot']};
// the decoder's numbers until gacha_config has loaded (same defaults as schema.sql)
const GACHA_DEF={dec_cost1:600,dec_cost10:5400,bingo_hi:49,dec_frag_min:1,dec_frag_max:3,shuffle_free:3,full_s_coins:3000,full_a_frags:30,ex_s:200,ex_a:80,daily_free:true};
// the 12 lines of the 5×5 card: rows 0-4, columns 5-9, the diagonal from the top left 10, from the top right 11
const BINGO_LINES=[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],[0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],[0,6,12,18,24],[4,8,12,16,20]];
const pad2=n=>n==null?'--':String(n).padStart(2,'0');
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
// free / own / buy / crate / gacha (근하신년: decoder bingo or exchange only)
function shopState(id){const p=ACC.price(id);if(!p||p.free)return 'free';if(ACC.me&&ACC.me.owned&&ACC.me.owned.has(id))return 'own';if(p.tier)return 'gacha';if(!p.sold)return 'crate';return 'buy'}
// free ones first, then by price; the 근하신년 guns after them (S first), crate-only last
function shopOrder(ids){const grp=id=>{const s=shopState(id),t=ACC.tier(id);return s==='free'?0:t?(t==='S'?2:3):s==='crate'?4:1};
  return ids.slice().sort((a,b)=>grp(a)-grp(b)||((ACC.price(a)||{}).price||0)-((ACC.price(b)||{}).price||0))}
const FRAG='<i class="fi"></i>';
// the 근하신년 decoder drawn in SVG: a handheld code breaker — gunmetal case, red and gold band, aerial, green read-out, keypad
function decoderSvg(cls){return `<svg class="${cls||''}" viewBox="0 0 120 150" aria-hidden="true"><defs>
  <linearGradient id="dcB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a616c"/><stop offset=".45" stop-color="#2e333a"/><stop offset="1" stop-color="#16181c"/></linearGradient>
  <linearGradient id="dcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#f2c230"/><stop offset="1" stop-color="#a87408"/></linearGradient>
  <linearGradient id="dcS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c3a12"/><stop offset="1" stop-color="#06200a"/></linearGradient></defs>
  <path d="M84 34 L94 8" stroke="#7a808a" stroke-width="3.5" stroke-linecap="round"/><circle cx="94.5" cy="7" r="4.5" fill="#e8402e" stroke="#5a0804"/>
  <rect x="20" y="30" width="80" height="112" rx="11" fill="url(#dcB)" stroke="#0a0b0d" stroke-width="2"/>
  <rect x="20" y="30" width="80" height="13" rx="6" fill="#b4221a"/><rect x="20" y="40" width="80" height="3" fill="url(#dcG)"/>
  <circle cx="30" cy="36.5" r="2.6" fill="#ffd24a"/><circle cx="38" cy="36.5" r="2.6" fill="#7dff6a"/>
  <rect x="29" y="50" width="62" height="34" rx="4" fill="url(#dcS)" stroke="#8a9078" stroke-width="1.5"/>
  <path d="M33 58 h20 M33 64 h30 M33 70 h14" stroke="#3aa83a" stroke-width="2" opacity=".55"/>
  <text x="84" y="77" text-anchor="end" font-size="17" font-weight="bold" fill="#8dff7a" font-family="Galmuri11,monospace">??</text>
  ${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${33+c*19}" y="${92+r*14}" width="15" height="10" rx="2.5" fill="${r===2&&c===2?'#b4221a':'#4a505a'}" stroke="#121417"/>`).join('')).join('')}
  <text x="60" y="137" text-anchor="middle" font-size="8.5" font-weight="bold" fill="url(#dcG)" letter-spacing="1" font-family="Galmuri11,sans-serif">근하신년</text>
</svg>`}

// ---------- the shop window: the gun shop, the 근하신년 decoder bingo, the fragment exchange ----------
const SHOP={page:'shop',cat:'all',sel:null,onlyOwn:false,confirm:null,msg:'',msgOk:false,busy:false,exSel:null,anim:null,lastN:null,bLoad:false,
  open(id,page){let o=$('shopWin');if(!o){o=document.createElement('div');o.id='shopWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-sa]');if(t)this.act(t.dataset.sa,t.dataset.v)});
      o.addEventListener('change',e=>{if(e.target.dataset.sa==='own'){this.onlyOwn=e.target.checked;this.render()}});
      // pointing at a line's reward lights up its five cells
      const hl=k=>{for(const c of o.querySelectorAll('.bc.hl'))c.classList.remove('hl');if(k==null)return;for(const i of BINGO_LINES[k]){const c=o.querySelector('.bc[data-c="'+i+'"]');if(c)c.classList.add('hl')}};
      o.addEventListener('mouseover',e=>{const t=e.target.closest('.brw');hl(t?+t.dataset.l:null)})}
    if(page)this.page=page;if(id){this.sel=id;this.cat='all';this.page='shop'}this.confirm=null;this.msg='';this.scrollSel=true;this.render();AU.play('ui',{vol:.35})},
  close(){if(this.anim)this.animSkip();const o=$('shopWin');if(o)o.remove();this.confirm=null;const p=$('gPop');if(p)p.remove()},
  list(){const C=shopCats(),c=C.find(x=>x.k===this.cat)||C[0];let ids=c.items;if(this.onlyOwn)ids=ids.filter(id=>{const s=shopState(id);return s==='free'||s==='own'});return {C,c,ids:shopOrder(ids)}},
  head(){const L=LI(),signed=ACC.signed(),me=ACC.me;
    if(!ACC.on)return `<span class="soff">${L?'Accounts not set up — every gun is open':'계정 서버 연결 전 — 지금은 모든 총 사용 가능'}</span>`;
    if(signed)return `<span class="scoin">${COIN}<b>${fmtC(me.coins)}</b></span><span class="scoin frg" title="${L?'Decoder fragments':'해독 조각'}">${FRAG}<b>${fmtC(me.frags||0)}</b></span><button class="sacc" data-sa="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`;
    return `<button class="sacc hl" data-sa="login">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`},
  render(){const o=$('shopWin');if(!o)return;const L=LI(),pg=this.page,free=ACC.signed()&&ACC.me.freeToday&&ACC.gc().daily_free;
    const ptabs=`<div class="spages"><button class="${pg==='shop'?'on':''}" data-sa="page" data-v="shop">${L?'Gun shop':'총기 상점'}</button><button class="${pg==='gacha'?'on':''} gp" data-sa="page" data-v="gacha">${L?'Decoder bingo':'근하신년 해독기'}${free?'<i class="dot"></i>':''}</button><button class="${pg==='ex'?'on':''}" data-sa="page" data-v="ex">${L?'Fragment exchange':'조각 교환'}</button></div>`;
    const body=pg==='gacha'?this.bingoPage():pg==='ex'?this.exPage():this.shopPage();
    o.innerHTML=`<div class="swin"><div class="swh"><b>${L?'Shop':'상점'}</b><small>SHOP</small><span class="sgap"></span>${this.head()}<button class="sx" data-sa="x" aria-label="close">×</button></div>${ptabs}${body}</div>`;
    if(this.scrollSel){this.scrollSel=false;const c=o.querySelector('.sc.on');if(c&&c.scrollIntoView)c.scrollIntoView({block:'nearest'})}},
  // ---- the gun shop ----
  shopPage(){const L=LI(),{C,ids}=this.list();if(!ids.includes(this.sel))this.sel=ids[0]||null;const signed=ACC.signed(),coins=signed?ACC.me.coins:0;
    const cards=ids.map(id=>{const W=WPN[id],st=shopState(id),p=ACC.price(id)||{price:0},t=ACC.tier(id);
      const tag=st==='free'?`<em class="bf">${L?'FREE':'기본'}</em>`:st==='own'?`<em class="bo">${L?'OWNED':'보유'}</em>`:st==='crate'?`<em class="bc">${L?'CRATE ONLY':'보급 전용'}</em>`
        :st==='gacha'?`<em class="bg${t}">${t} · ${L?'DECODER':'해독기 전용'}</em>`:`<span class="pr${signed&&coins<p.price?' poor':''}">${COIN}${fmtC(p.price)}</span>`;
      return `<div class="sc ${st}${t?' t'+t:''}${id===this.sel?' on':''}" data-sa="sel" data-v="${id}">${W.ny?'<i class="nyb">NY</i>':''}<div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b><span class="scp">${tag}</span></div>`}).join('')
      ||`<div class="sempty">${L?'Nothing here yet':'아직 없어요'}</div>`;
    return `<div class="stabs"><div class="stl">${C.map(c=>`<button class="${c.k===this.cat?'on':''}" data-sa="cat" data-v="${c.k}">${esc(c.n)}</button>`).join('')}</div>
        <label class="sfil"><input type="checkbox" data-sa="own"${this.onlyOwn?' checked':''}><span>${L?'Mine only':'보유한 총만'}</span></label></div>
      <div class="sbody"><div class="sgrid">${cards}</div>${this.detail()}</div>
      <div class="sfoot">${L?'Coins come from finished matches — rounds, kills, infections, damage and wins. In a match, round money ($) only buys guns you own; floor pick-ups, supply crates and the 근하신년 free pick still give any gun. The shooting range lends you every gun to try. 근하신년 guns come from the decoder bingo.'
        :'코인은 매치를 끝까지 하면 라운드·킬·감염·피해량·승리에 따라 들어와요. 매치 안에서 판돈($)으로는 보유한 총만 살 수 있고, 바닥에 떨어진 총·보급상자·근하신년 무료 교환은 그대로예요. 사격장에서는 모든 총을 빌려 쏴 볼 수 있어요. 근하신년 무기는 해독기 빙고에서만 나와요.'}</div>`},
  detail(){const L=LI(),id=this.sel,W=id&&WPN[id];if(!W)return '<div class="sdet"></div>';const st=shopState(id),p=ACC.price(id)||{price:0},signed=ACC.signed(),coins=signed?ACC.me.coins:0,t=ACC.tier(id),g=ACC.gc();
    const kn=(KIND_N[W.kind]||KIND_N.special)[L?1:0];
    const info=[kn,t?t+(L?' grade':'등급'):null,W.cost!=null&&W.cost>0?(L?'round $':'판돈 $')+fmtC(W.cost):null,W.mag?W.mag+(L?' rds':'발'):null,W.rpm?W.rpm+' RPM':null].filter(Boolean).join(' · ');
    let buy;
    if(st==='gacha')buy=`<div class="sbn">${L?'Only from a bingo line on the 근하신년 decoder card, or the fragment exchange.':'근하신년 해독기 빙고의 줄 보상이나 조각 교환으로만 얻을 수 있어요.'}</div>
      <button class="sbb red" data-sa="page" data-v="gacha">${L?'Open decoders':'해독기 열기'}</button><button class="sbx2" data-sa="exsel" data-v="${id}">${FRAG}${fmtC(t==='S'?g.ex_s:g.ex_a)} ${L?'fragments — exchange':'조각으로 교환'}</button>`;
    else if(!ACC.on)buy=`<div class="sbn">${L?'Accounts are not set up yet, so every gun is open for now.':'계정 서버가 연결되기 전이라 지금은 모든 총을 쓸 수 있어요.'}</div>${st==='buy'?`<div class="sbp">${COIN}${fmtC(p.price)}</div>`:''}`;
    else if(st==='free')buy=`<div class="sbn ok">${L?'Free for everyone.':'기본 지급 — 누구나 쓸 수 있어요.'}</div>`;
    else if(st==='own')buy=`<div class="sbn ok">${L?'Yours. Buy it with round money in a match.':'보유 중 — 매치에서 판돈($)으로 살 수 있어요.'}</div>`;
    else if(st==='crate')buy=`<div class="sbn">${L?'Only from supply crates.':'보급상자에서만 얻을 수 있어요.'}</div>`;
    else if(!signed)buy=`<div class="sbp">${COIN}${fmtC(p.price)}</div><button class="sbb" data-sa="login">${L?'Sign in to buy':'로그인하고 구매'}</button>`;
    else if(this.confirm===id)buy=`<div class="sbq">${L?`Buy ${esc(W.n[1])} for ${fmtC(p.price)} coins?`:`${esc(W.n[0])}, ${fmtC(p.price)} 코인에 살까요?`}</div>
      <div class="sbr"><button class="sbb" data-sa="buyok" data-v="${id}"${this.busy?' disabled':''}>${this.busy?(L?'Buying…':'구매 중…'):(L?'Buy':'구매')}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(coins>=p.price)buy=`<button class="sbb" data-sa="buy" data-v="${id}">${COIN}${fmtC(p.price)} <span>${L?'Buy':'구매'}</span></button>`;
    else buy=`<button class="sbb" disabled>${COIN}${fmtC(p.price)}</button><div class="sbn bad">${L?fmtC(p.price-coins)+' coins short':'코인 '+fmtC(p.price-coins)+' 부족'}</div>`;
    if(this.msg)buy+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    return `<div class="sdet"><div class="sdi${t?' t'+t:''}"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${esc(W.n[L?0:1])}</small></h4><div class="sinfo">${info}</div>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p><div class="sbuy">${buy}</div></div>`},
  // ---- the 근하신년 decoder bingo ----
  // the card on screen: the one being played out by the animation, else the account's card (a guest sees the guns on a blank card)
  bview(){if(this.anim)return this.anim.view;const b=ACC.bingo;if(b&&b.nums)return b;
    const rw=[...SHOP_GACHA.S,...SHOP_GACHA.A];return {nums:null,marked:Array(25).fill(false),drawn:[],rewards:rw,done:Array(12).fill(false),boards:0,shuffles_left:ACC.gc().shuffle_free}},
  rwTile(B,k,cls){const L=LI(),id=B.rewards[k],W=WPN[id],t=ACC.tier(id),me=ACC.me,got=B.done[k],own=!got&&me&&me.owned&&me.owned.has(id),g=ACC.gc(),A=this.anim;
    const name=W?W.n[L]:'?',sub=t==='S'?`${fmtC(g.full_s_coins)} ${L?'coins':'코인'}`:`${L?'fragments':'조각'} ${g.full_a_frags}`;
    const tip=got?(L?'Line done: ':'완성: ')+name:own?`${name} — ${L?'owned, pays':'보유 중 → 완성하면'} ${sub}`:name;
    return `<div class="brw ${cls}${t?' t'+t:''}${got?' got':''}${own?' own':''}${A&&A.flash&&A.flash.includes(k)?' pop':''}" data-l="${k}" title="${esc(tip)}">${W?`<img src="${gunIcon(W.model,22)}" alt="">`:''}${t?`<em>${t}</em>`:''}${got?'<i>✔</i>':''}</div>`},
  boardHtml(B){const A=this.anim,hot=new Set();if(A&&A.flash)for(const k of A.flash)for(const c of BINGO_LINES[k])hot.add(c);
    const cell=i=>{const n=B.nums?B.nums[i]:null,m=B.marked[i];return `<div class="bc${m?' mk':''}${A&&A.last===i?' last':''}${hot.has(i)?' lw':''}" data-c="${i}"><span>${n==null?'?':pad2(n)}</span>${m?'<i></i>':''}</div>`};
    let h='';for(let r=0;r<5;r++){h+=this.rwTile(B,r,'rr');for(let c=0;c<5;c++)h+=cell(r*5+c);h+='<div class="bsp"></div>'}
    h+=this.rwTile(B,11,'rd2');for(let c=0;c<5;c++)h+=this.rwTile(B,5+c,'rc');h+=this.rwTile(B,10,'rd1');
    return `<div class="bboard">${h}</div>`},
  bingoPage(){const L=LI(),g=ACC.gc(),signed=ACC.signed(),me=ACC.me,coins=signed?me.coins:0,A=this.anim;
    if(signed&&!ACC.bingo&&!this.bLoad){this.bLoad=true;ACC.loadBingo().catch(e=>{this.msg=ACC.errText(e);this.msgOk=false}).finally(()=>{this.bLoad=false;this.render()})}
    const B=this.bview(),hi=g.bingo_hi,lines=B.done.filter(Boolean).length,free=signed&&me.freeToday&&g.daily_free;
    const can1=signed&&coins>=g.dec_cost1,can10=signed&&coins>=g.dec_cost10,dis=this.busy||!!A;
    const btns=!ACC.on?`<div class="sbn">${L?'Decoders open once accounts are set up.':'계정 서버가 연결되면 해독기를 열 수 있어요.'}</div>`
      :!signed?`<button class="gbtn big" data-sa="login">${L?'Sign in to open decoders':'로그인하고 해독기 열기'}</button>`
      :A?`<button class="gbtn big skip" data-sa="bskip">${L?'Skip':'건너뛰기'}</button>`
      :`${free?`<button class="gbtn free" data-sa="dec" data-v="free"${dis?' disabled':''}>${L?'Today\'s free decoder':'오늘의 무료 해독기'}</button>`:''}
        <div class="gbr"><button class="gbtn" data-sa="dec" data-v="1"${can1&&!dis?'':' disabled'}><b>${L?'1 decoder':'해독기 1개'}</b><span>${COIN}${fmtC(g.dec_cost1)}</span></button>
        <button class="gbtn ten" data-sa="dec" data-v="10"${can10&&!dis?'':' disabled'}><b>${L?'10 decoders':'해독기 10개'}</b><span>${COIN}${fmtC(g.dec_cost10)}</span></button></div>`;
    const tools=signed&&!A?(this.confirm==='breset'?`<div class="bq">${L?'A new card? What is stamped now is lost.':'새 판으로 바꿀까요? 지금 찍힌 칸은 사라져요.'}<div><button data-sa="bresetok">${L?'New card':'바꾸기'}</button><button data-sa="buyno">${L?'Cancel':'취소'}</button></div></div>`
      :`<div class="btools"><button data-sa="breset"${this.busy?' disabled':''}>↻ ${L?'Reset':'초기화'}</button><button data-sa="bshuf"${this.busy||!(B.shuffles_left>0)?' disabled':''}>⇄ ${L?'Shuffle':'뒤섞기'} <small>${B.shuffles_left|0}/${g.shuffle_free}</small></button></div>`):'';
    return `<div class="gwrap bwrap"><div class="gleft"><div class="bdec${A&&A.rolling?' roll':''}">${decoderSvg('dz')}</div>
        <div class="bnum"><small>${L?`Number drawn (0–${hi})`:`추첨된 빙고 숫자 (0~${hi})`}</small><b id="bNum" class="${A&&A.hit?'hit':''}">${pad2(this.lastN)}</b></div>
        <div class="gbtns">${btns}</div>${this.msg?`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`:''}
        <div class="bstat"><span>${L?'Lines':'완성한 줄'} <b>${lines}</b>/12</span><span>${L?'Drawn':'나온 숫자'} <b>${B.drawn.length}</b>/${hi+1}</span>${B.boards?`<span>${L?'Card':'판'} <b>#${B.boards}</b></span>`:''}</div>
        ${tools}<div class="glinks"><button data-sa="rules">${L?'How it works':'규칙 · 확률'}</button>${signed?`<button data-sa="hist">${L?'History':'획득 기록'}</button>`:''}</div></div>
      <div class="gright bright">${this.boardHtml(B)}
        <div class="gnote">${L?`Each decoder shows one number from 0–${hi} not drawn on this card yet; a number on the card is stamped. Finish a row, a column or a diagonal and you get the 근하신년 gun shown at its end (owned already: an S line pays ${fmtC(g.full_s_coins)} coins, an A line ${g.full_a_frags} fragments). Every decoder also gives ${g.dec_frag_min}–${g.dec_frag_max} fragments. A full card is replaced by a new one.`
          :`해독기 1개를 열면 0~${hi} 중 이 판에서 아직 안 나온 숫자가 하나 나오고, 판에 있는 숫자면 도장이 찍혀요. 가로·세로·대각선 한 줄을 채우면 줄 끝에 있는 근하신년 무기를 받아요 (이미 가진 무기면 S줄은 ${fmtC(g.full_s_coins)} 코인, A줄은 조각 ${g.full_a_frags}개). 해독기마다 조각 ${g.dec_frag_min}~${g.dec_frag_max}개도 나오고, 판을 다 채우면 새 판이 깔려요.`}</div></div></div>`},
  // ---- the fragment exchange ----
  exPage(){const L=LI(),g=ACC.gc(),signed=ACC.signed(),me=ACC.me,fr=signed?me.frags||0:0;
    const ids=[...SHOP_GACHA.S,...SHOP_GACHA.A].filter(id=>WPN[id]);if(!ids.includes(this.exSel))this.exSel=ids.find(id=>!(me&&me.owned&&me.owned.has(id)))||ids[0];
    const cards=ids.map(id=>{const W=WPN[id],t=ACC.tier(id),own=me&&me.owned&&me.owned.has(id),cost=t==='S'?g.ex_s:g.ex_a;
      return `<div class="sc ${own?'own':'gacha'} t${t}${id===this.exSel?' on':''}" data-sa="exsel" data-v="${id}"><div class="sci"><img src="${gunIcon(W.model,30)}" alt=""></div><b>${esc(W.n[L])}</b>
        <span class="scp">${own?`<em class="bo">${L?'OWNED':'보유'}</em>`:`<span class="pr fr${signed&&fr<cost?' poor':''}">${FRAG}${fmtC(cost)}</span>`}<em class="bg${t} sm">${t}</em></span></div>`}).join('');
    const id=this.exSel,W=WPN[id],t=ACC.tier(id),own=me&&me.owned&&me.owned.has(id),cost=t==='S'?g.ex_s:g.ex_a;
    let act;
    if(!ACC.on)act=`<div class="sbn">${L?'The exchange opens once accounts are set up.':'계정 서버가 연결되면 교환할 수 있어요.'}</div>`;
    else if(!signed)act=`<button class="sbb" data-sa="login">${L?'Sign in to exchange':'로그인하고 교환'}</button>`;
    else if(own)act=`<div class="sbn ok">${L?'Already yours.':'이미 보유 중이에요.'}</div>`;
    else if(this.confirm==='ex:'+id)act=`<div class="sbq">${L?`Exchange ${fmtC(cost)} fragments for ${esc(W.n[1])}?`:`조각 ${fmtC(cost)}개로 ${esc(W.n[0])}을(를) 받을까요?`}</div>
      <div class="sbr"><button class="sbb" data-sa="exok" data-v="${id}"${this.busy?' disabled':''}>${L?'Exchange':'교환'}</button><button class="sbx2" data-sa="buyno">${L?'Cancel':'취소'}</button></div>`;
    else if(fr>=cost)act=`<button class="sbb" data-sa="ex" data-v="${id}">${FRAG}${fmtC(cost)} <span>${L?'Exchange':'교환'}</span></button>`;
    else act=`<button class="sbb" disabled>${FRAG}${fmtC(cost)}</button><div class="sbn bad">${L?fmtC(cost-fr)+' fragments short':'조각 '+fmtC(cost-fr)+'개 부족'}</div>`;
    if(this.msg)act+=`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`;
    return `<div class="sbody"><div class="sgrid">${cards}</div><div class="sdet"><div class="sdi t${t}"><img src="${gunIcon(W.model,58)}" alt=""></div><h4>${esc(W.n[L])}<small>${t}${L?' grade':'등급'} · ${esc(W.n[L?0:1])}</small></h4>
      ${UI.statBars(W)}<p class="sdesc">${UI.wTags(W,id)||''}</p><div class="sbn">${L?`You have ${fmtC(fr)} fragments. Every decoder gives ${g.dec_frag_min}–${g.dec_frag_max}, and a finished A line whose gun you own gives ${g.full_a_frags}.`:`보유 조각 ${fmtC(fr)}개 — 해독기마다 ${g.dec_frag_min}~${g.dec_frag_max}개, 이미 가진 A 무기 줄을 완성하면 ${g.full_a_frags}개가 나와요.`}</div><div class="sbuy">${act}</div></div></div>
      <div class="sfoot">${L?`An S of your choice for ${g.ex_s} fragments, an A for ${g.ex_a}.`:`원하는 S 무기는 조각 ${g.ex_s}개, A 무기는 ${g.ex_a}개로 바꿀 수 있어요.`}</div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='page'){if(this.page!==v){this.page=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();AU.play('ui',{vol:.3})}return}
    if(a==='cat'){this.cat=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();const g=document.querySelector('#shopWin .sgrid');if(g)g.scrollTop=0;return}
    if(a==='sel'){if(this.sel!==v){this.sel=v;this.confirm=null;this.msg='';this.render();AU.play('ui',{vol:.25})}return}
    if(a==='sel2'){this.page='shop';this.cat='all';this.sel=v;this.confirm=null;this.msg='';this.scrollSel=true;this.render();return}
    if(a==='exsel'){this.page='ex';if(this.exSel!==v){this.exSel=v;this.confirm=null;this.msg=''}this.render();return}
    if(a==='login'){ACCW.open('in');return}
    if(a==='acc'){ACCW.open('me');return}
    if(a==='buy'){this.confirm=v;this.msg='';this.render();return}
    if(a==='buyno'){this.confirm=null;this.render();return}
    if(a==='buyok'){this.buy(v);return}
    if(a==='ex'){this.confirm='ex:'+v;this.msg='';this.render();return}
    if(a==='exok'){this.exchange(v);return}
    if(a==='dec'){this.decode(v==='free'?1:+v,v==='free');return}
    if(a==='bskip'){this.animSkip();return}
    if(a==='breset'){this.confirm='breset';this.msg='';this.render();return}
    if(a==='bresetok'){this.confirm=null;this.tool(()=>ACC.bingoReset(),L?'A new card':'새 판을 깔았어요');return}
    if(a==='bshuf'){this.tool(()=>ACC.bingoShuffle(),L?'Shuffled the open numbers':'안 찍힌 숫자 자리를 섞었어요');return}
    if(a==='rules'){gPopRules();return}
    if(a==='hist'){gPopHist();return}},
  async buy(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.buy(id);this.msg=(L?'Bought: ':'구매 완료 — ')+W.n[L];this.msgOk=true;AU.play('buy',{vol:.8})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});if(/not_signed_in|JWT/i.test(String(e.message)))ACCW.open('in')}
    this.busy=false;this.confirm=null;this.render()},
  async exchange(id){if(this.busy)return;const L=LI(),W=WPN[id];this.busy=true;this.render();
    try{await ACC.exchange(id);this.msg=(L?'Exchanged: ':'교환 완료 — ')+W.n[L];this.msgOk=true;AU.play('lvlup',{vol:.7})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5})}
    this.busy=false;this.confirm=null;this.render()},
  async tool(fn,ok){if(this.busy||this.anim)return;this.busy=true;this.msg='';this.render();
    try{await fn();this.msg=ok;this.msgOk=true;this.lastN=null;AU.play('cylspin',{vol:.3,rate:1.6})}catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5})}
    this.busy=false;this.render()},
  // open decoders: the server answers at once; then the card plays it out — each number rolls on the read-out and lands,
  // a number on the card is stamped, a finished line flashes gold — and the line rewards turn over as cards at the end
  async decode(n,free){if(this.busy||this.anim)return;const L=LI();this.busy=true;this.msg='';this.render();
    const before=ACC.bingo&&ACC.bingo.nums?ACC.bingo:null;let r=null;AU.play('cylspin',{vol:.35,rate:1.3});
    try{r=await ACC.decode(n,free)}catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});this.busy=false;this.render();return}
    const cp=b=>({nums:b.nums.slice(),marked:b.marked.slice(),drawn:b.drawn.slice(),rewards:b.rewards.slice(),done:b.done.slice(),boards:b.boards,shuffles_left:b.shuffles_left});
    const fresh=b=>({...cp(b),marked:Array(25).fill(false),drawn:[],done:Array(12).fill(false)});
    // the card as it was before these decoders: the one on screen, else the answer's card with this batch's numbers taken back out
    let start=before?cp(before):null;
    if(!start&&!r.draws.some(d=>d.card>0)){const mine=new Set(r.draws.map(d=>d.n)),v=fresh(r.card);v.drawn=r.card.drawn.filter(x=>!mine.has(x));
      for(const x of v.drawn){const c=v.nums.indexOf(x);if(c>=0)v.marked[c]=true}BINGO_LINES.forEach((ln,k)=>{v.done[k]=ln.every(c=>v.marked[c])});start=v}
    this.anim={view:start||fresh(r.card),draws:r.draws,i:0,card:0,got:[],frags:0,flash:null,last:null,n,free,res:r,fast:n>=10};
    this.busy=false;this.render();this.animStep()},
  animStep(){const A=this.anim;if(!A)return;if(A.i>=A.draws.length){this.animEnd();return}
    const d=A.draws[A.i],g=ACC.gc(),el=()=>$('bNum');
    if(d.card>A.card){A.card=d.card;const f=A.res.card;A.view={...A.view,nums:f.nums.slice(),rewards:f.rewards.slice(),marked:Array(25).fill(false),drawn:[],done:Array(12).fill(false),boards:(A.view.boards||0)+1};
      shopToast(LI()?'BINGO card full — a new card!':'판을 다 채웠어요 — 새 판!')}
    A.flash=null;A.last=null;A.hit=false;A.rolling=true;this.render();
    const roll=A.fast?300:560,t0=performance.now();clearInterval(A.iv);
    A.iv=setInterval(()=>{const e=el();if(e)e.textContent=pad2(Math.floor(Math.random()*(g.bingo_hi+1)))},45);
    AU.play('ui',{vol:.2,rate:1.6});
    A.to=setTimeout(()=>{clearInterval(A.iv);if(this.anim!==A)return;A.rolling=false;this.lastN=d.n;A.view.drawn=[...A.view.drawn,d.n];A.frags+=d.frags|0;
      if(d.cell!=null){A.view.marked=A.view.marked.slice();A.view.marked[d.cell]=true;A.last=d.cell;A.hit=true}
      const ls=d.lines||[];if(ls.length){A.view.done=A.view.done.slice();for(const x of ls){A.view.done[x.line]=true;A.got.push(x)}A.flash=ls.map(x=>x.line)}
      this.render();
      if(ls.length)AU.play(ls.some(x=>x.tier==='S'&&x.kind==='gun')?'stingH':'lvlup',{vol:.8});else if(d.cell!=null)AU.play('hsding',{vol:.6});else AU.play('ui',{vol:.25,rate:.8});
      A.i++;A.to=setTimeout(()=>this.animStep(),ls.length?1100:d.cell!=null?(A.fast?380:650):(A.fast?220:420))},roll)},
  animSkip(){const A=this.anim;if(!A)return;clearTimeout(A.to);clearInterval(A.iv);
    for(;A.i<A.draws.length;A.i++){const d=A.draws[A.i];A.frags+=d.frags|0;for(const x of d.lines||[])A.got.push(x);this.lastN=d.n}
    this.animEnd()},
  animEnd(){const A=this.anim;if(!A)return;clearTimeout(A.to);clearInterval(A.iv);this.anim=null;const L=LI();
    if(A.res.card.drawn.length===0&&A.draws.length)shopToast(L?'BINGO card full — a new card!':'판을 다 채웠어요 — 새 판!');
    this.msg=(L?`+${A.frags} fragments`:`조각 +${A.frags}개`)+(A.got.length?(L?` · ${A.got.length} line(s)!`:` · ${A.got.length}줄 완성!`):'');this.msgOk=true;
    ACC.emit();this.render();if(A.got.length)GFX.show(A.got,A.n)}};

// ---------- the line rewards: one card per finished line, turned over one by one ----------
const GFX={res:null,n:1,timers:[],done:false,
  el(){let o=$('gFx');if(!o){o=document.createElement('div');o.id='gFx';document.body.appendChild(o);o.addEventListener('click',e=>{const t=e.target.closest('[data-gx]');if(t)this.act(t.dataset.gx);else if(this.done)this.close()})}return o},
  clear(){for(const t of this.timers)clearTimeout(t);this.timers=[]},
  later(ms,fn){this.timers.push(setTimeout(fn,ms))},
  show(res,n){this.clear();this.res=res;this.n=n;this.done=false;const o=this.el(),best=res.some(x=>x.tier==='S')?'S':'A';o.className='on';
    const fl=document.createElement('div');fl.className='gflash t'+best;o.innerHTML='';o.appendChild(fl);this.later(380,()=>this.cards(res))},
  card(x,i){const L=LI(),W=WPN[x.gun]||{n:[x.gun||'?',x.gun||'?']},many=this.res.length>5;let face='',cls='t'+(x.tier||'A');
    const ln=`<i class="gln">${L?'LINE':'빙고'} ${x.line<5?(L?'row ':'가로 ')+(x.line+1):x.line<10?(L?'col ':'세로 ')+(x.line-4):(L?'diag ':'대각 ')+(x.line-9)}</i>`;
    if(x.kind==='gun')face=`<div class="gci"><img src="${W.model?gunIcon(W.model,many?30:48):''}" alt=""></div><b>${esc(W.n[L])}</b><span class="gtg t${x.tier}">${x.tier}</span><i class="gnew">NEW</i>${ln}`;
    else if(x.kind==='coins'){cls+=' cv';face=`<div class="gci big">${COIN}</div><b>${fmtC(x.amount)}</b><span>${L?'coins':'코인'} <small>(${esc(W.n[L])} ${L?'owned':'보유 중'})</small></span>${ln}`}
    else{cls+=' fv';face=`<div class="gci big">${FRAG}</div><b>×${x.amount}</b><span>${L?'fragments':'해독 조각'} <small>(${esc(W.n[L])} ${L?'owned':'보유 중'})</small></span>${ln}`}
    return `<div class="gcard ${cls}" style="--i:${i}"><div class="gin"><div class="gback">${decoderSvg('mini')}</div><div class="gfront">${face}</div></div></div>`},
  cards(res){const o=this.el(),L=LI(),many=res.length>5,step=many?170:220;
    o.innerHTML=`<div class="gstage res${many?' ten':''}"><div class="gcap">BINGO! <small>${L?`${res.length} line(s)`:`${res.length}줄 완성`}</small></div><div class="gcards">${res.map((x,i)=>this.card(x,i)).join('')}</div>
      <div class="gbar"><button class="gskip" data-gx="skip">${L?'Skip':'건너뛰기'}</button></div></div>`;
    const cs=o.querySelectorAll('.gcard');cs.forEach((c,i)=>this.later(Math.max(260+i*step,420+i*40),()=>{// flip only once the card has slid in (a flip during the slide-in can leave the card unpainted on some phones)
      c.classList.add('open');const x=res[i];AU.play(x.kind==='gun'?(x.tier==='S'?'lvlup':'hsding'):'ui',{vol:x.kind==='gun'?.8:.3})}));
    this.later(Math.max(260+cs.length*step,420+cs.length*40)+500,()=>this.finish())},
  finish(){this.clear();const o=this.el(),L=LI();if(!o.querySelector('.gcards'))return;o.querySelectorAll('.gcard').forEach(c=>{c.style.animation='none';c.classList.add('open')});this.done=true;
    const bar=o.querySelector('.gbar');if(bar){const g=ACC.gc(),me=ACC.me,n=this.n>=10?10:1,cost=n===10?g.dec_cost10:g.dec_cost1,can=me&&me.coins>=cost;
      bar.innerHTML=`<button class="gok" data-gx="close">${L?'OK':'확인'}</button>${can?`<button class="gagain" data-gx="again">${n===10?(L?'10 more':'10개 더'):(L?'One more':'1개 더')} · ${COIN}${fmtC(cost)}</button>`:''}`}},
  act(a){if(a==='skip'){this.finish();return}if(a==='close'){this.close();return}if(a==='again'){const n=this.n>=10?10:1;this.close();SHOP.decode(n,false);return}},
  close(){this.clear();const o=$('gFx');if(o)o.remove();this.done=false}};
// odds and history windows over the shop
function gPop(title,html){let o=$('gPop');if(o)o.remove();o=document.createElement('div');o.id='gPop';o.innerHTML=`<div class="gpw"><div class="awh"><b>${title}</b><button data-gp="x">×</button></div><div class="gpb">${html}</div></div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.dataset.gp==='x')o.remove()});document.body.appendChild(o)}
function gPopRules(){const L=LI(),g=ACC.gc(),hi=g.bingo_hi,rows=[];
  const r=(a,b,h)=>rows.push(`<tr${h?' class="h"':''}><td>${a}</td><td>${b}</td></tr>`);
  r(L?'The card':'빙고판','',1);r(L?'Numbers on the card':'판의 숫자',L?`25 of 0–${hi}`:`0~${hi} 중 25개`);r(L?'Lines':'줄',L?'12 (5 rows, 5 columns, 2 diagonals)':'12줄 (가로 5 · 세로 5 · 대각 2)');
  r(L?'Line rewards':'줄 보상',L?'one 근하신년 gun each (6 S, 6 A, placed at random)':'줄마다 근하신년 무기 1개 (S 6 · A 6, 자리는 무작위)');
  r(L?'A decoder':'해독기','',1);r(L?'Price':'가격',`${COIN}${fmtC(g.dec_cost1)} · 10${L?' for ':'개 '}${COIN}${fmtC(g.dec_cost10)}`);if(g.daily_free)r(L?'Free':'무료',L?'1 a day':'하루 1개');
  r(L?'Number shown':'나오는 숫자',L?`one of 0–${hi} not drawn on this card yet (equal chance)`:`0~${hi} 중 이 판에서 아직 안 나온 숫자 (모두 같은 확률)`);
  r(L?'Hit chance, first decoder':'첫 해독기가 판에 맞을 확률',`${Math.round(25/(hi+1)*100)}%`);r(L?'Fragments':'해독 조각',L?`${g.dec_frag_min}–${g.dec_frag_max} with every decoder`:`해독기마다 ${g.dec_frag_min}~${g.dec_frag_max}개`);
  r(L?'On average (simulated)':'평균 (시뮬레이션)','',1);r(L?'First line':'첫 줄 완성',L?'about 29 decoders':'해독기 약 29개');r(L?'6 lines':'6줄',L?'about 43':'약 43개');r(L?'The whole card (12 lines)':'판 전체 (12줄)',L?`about 49 — never more than ${hi+1}`:`약 49개 — 최대 ${hi+1}개`);
  gPop(L?'How the decoder bingo works':'해독기 빙고 규칙 · 확률',`<table class="grt">${rows.join('')}</table><ul class="grl">
    <li>${L?`A line whose gun you own pays instead: S ${fmtC(g.full_s_coins)} coins, A ${g.full_a_frags} fragments.`:`이미 가진 무기의 줄을 완성하면 대신 S는 ${fmtC(g.full_s_coins)} 코인, A는 조각 ${g.full_a_frags}개.`}</li>
    <li>${L?'A full card is replaced by a new one at once (the rest of a ten goes on it).':'25칸이 다 차면 바로 새 판이 깔려요 (10개 열기의 나머지는 새 판에).'}</li>
    <li>${L?`Reset: a new card, free (what was stamped is lost). Shuffle: the numbers not stamped yet change places, ${g.shuffle_free} a day.`:`초기화: 새 판으로 (무료, 찍힌 칸은 사라짐). 뒤섞기: 안 찍힌 숫자들 자리만 바뀜, 하루 ${g.shuffle_free}번.`}</li>
    <li>${L?`Fragments: an S gun of your choice for ${g.ex_s}, an A for ${g.ex_a} (fragment exchange).`:`조각 교환: 원하는 S 무기 ${g.ex_s}개, A 무기 ${g.ex_a}개.`}</li>
    <li>${L?'Every number is drawn on the server; the game only shows it.':'숫자는 전부 서버에서 뽑고, 게임 화면은 결과만 보여줘요.'}</li></ul>`)}
async function gPopHist(){const L=LI();gPop(L?'History':'획득 기록',`<div class="gload">${L?'Loading…':'불러오는 중…'}</div>`);let rows;
  try{rows=await ACC.history()}catch(e){const b=document.querySelector('#gPop .gpb');if(b)b.innerHTML=`<div class="sbm bad">${esc(ACC.errText(e))}</div>`;return}
  const b=document.querySelector('#gPop .gpb');if(!b)return;if(!rows||!rows.length){b.innerHTML=`<div class="gload">${L?'Nothing yet':'아직 기록이 없어요'}</div>`;return}
  b.innerHTML=`<table class="grt hist">${rows.map(x=>{const d=new Date(x.at),t=`${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    const what=x.kind==='gun'?`<b class="t${x.tier}">[${x.tier}] ${esc((WPN[x.gun_id]||{n:[x.gun_id,x.gun_id]}).n[L])}</b>`:x.kind==='coins'?`${COIN}${fmtC(x.amount)}`:`${FRAG}×${x.amount}`;
    const src=x.src==='free'?(L?'free':'무료'):x.src==='exchange'?(L?'exchange':'교환'):x.src==='decode'?(L?'bingo':'빙고'):(L?'pouch':'복주머니');return `<tr${x.tier?' class="t'+x.tier+'"':''}><td>${t}</td><td>${what}${x.pity_hit?` <small>${L?'pity':'천장'}</small>`:''}</td><td><small>${src}</small></td></tr>`}).join('')}</table>`}

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
        <div class="ams"><span>${L?'Earned':'모은 코인'} <b>${fmtC(me.earned||0)}</b></span><span>${L?'Matches':'정산한 판'} <b>${fmtC(me.matches||0)}</b></span><span>${L?'Left today':'오늘 남은 보상'} <b>${fmtC(me.dayLeft==null?8000:me.dayLeft)}</b></span><span>${L?'Guns owned':'보유 총'} <b>${(me.owned?me.owned.size:0)+SHOP_FREE.length}</b></span><span>${L?'Fragments':'해독 조각'} <b>${fmtC(me.frags||0)}</b></span></div>
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
addEventListener('keydown',e=>{if(e.code!=='Escape')return;const stop=()=>{e.stopPropagation();e.preventDefault()};
  if($('gFx')){if(GFX.done)GFX.close();else GFX.finish();stop()}else if($('gPop')){$('gPop').remove();stop()}else if($('accWin')){ACCW.close();stop()}else if($('shopWin')){SHOP.close();stop()}},true);

// ---------- the lobby: coins, sign-in and the shop button ----------
function shopLobby(){const top=document.querySelector('#menu .lobTop');if(!top)return;const L=LI(),me=ACC.me,signed=ACC.signed();
  if(signed){const nb=top.querySelector('.prof b');if(nb)nb.textContent=me.nickname}
  const old=top.querySelector('.accChip');if(old)old.remove();
  if(ACC.on){const ch=document.createElement('div');ch.className='accChip';
    ch.innerHTML=signed||(me&&me.cached)?`<button class="acoin" data-act="shop" title="${L?'Coins':'코인'}">${COIN}<b>${fmtC(me.coins)}</b></button><button class="aname" data-act="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`
      :`<button class="alog" data-act="acc">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`;
    const pf=top.querySelector('.prof');if(pf)pf.after(ch);else top.prepend(ch)}
  const tb=top.querySelector('.tbtns');if(tb&&!tb.querySelector('.tshop')){const b=document.createElement('button');b.className='tshop';b.dataset.act='shop';b.innerHTML=SVG_CART+`<span>${L?'Shop':'상점'}</span>`;tb.prepend(b)}
  const sb=tb&&tb.querySelector('.tshop');if(sb){const dot=sb.querySelector('.dot'),want=signed&&me.freeToday&&ACC.gc().daily_free;if(want&&!dot){const d=document.createElement('i');d.className='dot';d.title=L?'A free decoder today':'오늘의 무료 해독기';sb.appendChild(d)}else if(!want&&dot)dot.remove()}}

// ---------- in a match: round money only buys guns you own ----------
// (the shooting range lends every gun: try before you buy)
function shopLocked(P,id){if(!ACC.on||!P||G.mode==='range')return false;const W=WPN[id];if(!W||!W.model||W.kind==='nade')return false;if(ACC.owns(id))return false;
  if(P.inv[W.slot]===id)return false;// already in hand (picked up): ammo for it is fine
  if(W.ny&&P.nyFree>0)return false;// the 근하신년 free pick
  return true}

// ---------- after a match: the coins ----------
function shopMatchStats(){const P=G.player,A=G.actors.filter(a=>!a.scen&&!a.rg),best=A.slice().sort((a,b)=>(b.score||0)-(a.score||0))[0];
  return {mode:G.mode,rounds:G.round|0,kills:P.kills|0,infects:P.infects|0,damage:P.dmgDealt||0,won:(G.score&&G.score[TH]>G.score[TZ]),mvp:best===P&&(P.score||0)>0,
    stage:typeof SCEN!=='undefined'?(SCEN.best||SCEN.stage||0):0,cleared:typeof SCEN!=='undefined'&&!!SCEN.win,score:Math.round(P.score||0)}}
function shopReward(){const P=G.player,res=$('results');if(!P||!res||!ACC.on||G.mode==='range')return;const L=LI();
  const box=document.createElement('div');box.className='coinRes';const put=()=>{const fs=res.querySelector('.finalScore');if(fs)fs.after(box);else res.prepend(box)};
  if(G.coinDone){if(G.coinBox){box.innerHTML=G.coinBox;put()}return}G.coinDone=true;// shown again, never paid twice
  if(!ACC.signed())box.innerHTML=`${COIN}<span>${L?'Sign in to earn coins from every match and buy guns for good.':'로그인하면 매치마다 코인을 받고 총을 영구 구매할 수 있어요.'}</span><button data-act="acc">${L?'Sign in':'로그인'}</button>`;
  else{box.innerHTML=`${COIN}<span>${L?'Counting your coins…':'코인 정산 중…'}</span>`;
    ACC.claim(shopMatchStats()).then(r=>{G.coinBox=box.innerHTML=`${COIN}<span><b>+${fmtC(r.got)}</b> ${L?'coins':'코인'}${r.bonus?` <small>(${L?'first match today':'오늘 첫 판'} +${fmtC(r.bonus)})</small>`:''}${r.day_left<=0?` <small>${L?'— daily limit reached':'— 오늘 받을 수 있는 만큼 다 받았어요'}</small>`:''}${r.xp_got?` <small>· +${fmtC(r.xp_got)} XP</small>`:''}</span><span class="crh">${L?'You have':'보유'} ${COIN}${fmtC(r.coins)}</span><button data-act="shop">${L?'Shop':'상점'}</button>`;AU.play('buy',{vol:.6})})
      .catch(e=>{G.coinBox=box.innerHTML=`${COIN}<span>${esc(ACC.errText(e))}</span>`})}
  put()}

// ---------- hooks ----------
(function(){
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{shopLobby()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){
    if(a==='shop'){SHOP.open();return}
    if(a==='acc'){ACCW.open(ACC.signed()?'me':'in');return}
    if(a==='buylk'){const W=WPN[v],p=ACC.price(v),L=LI();HUD.note(p&&p.tier?`${W?W.n[L]:''}: ${L?'only from the 근하신년 decoder bingo (lobby shop)':'근하신년 해독기 빙고에서만 얻을 수 있어요 (로비 상점)'}`:`${W?W.n[L]:''}: ${L?'buy it in the shop first':'상점에서 먼저 사야 해요'} (${fmtC(p&&p.price)} ${L?'coins':'코인'})`,2.2);AU.play('dry',{vol:.5});return}
    return act0.call(this,a,v,el)};
  const rb=UI.renderBuy;UI.renderBuy=function(){const r=rb.apply(this,arguments);const P=G.player;if(!ACC.on||!P)return r;const L=LI();
    for(const el of document.querySelectorAll('#buy .bi[data-v]')){const id=el.dataset.v;if(!shopLocked(P,id))continue;const p=ACC.price(id);
      el.classList.add('lk','na');el.dataset.act='buylk';const c=el.querySelector('.c');if(c)c.innerHTML=SVG_LOCK+(p&&p.tier?`<small class="gb">${L?'decoder':'해독기'}</small>`:`<small>${COIN}${fmtC(p&&p.price)}</small>`)}
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
    const ask=n=>{if(ACC.ses||ACC.signed()||$('accWin')||$('shopWin')||G.st!=='menu')return;if(UI.open==='menu')ACCW.open('in');else if(n<60)setTimeout(()=>ask(n+1),700)};
    if(ACC.on&&!ACC.signed()&&!seen)setTimeout(()=>ask(0),700)}).catch(e=>console.error(e));
})();

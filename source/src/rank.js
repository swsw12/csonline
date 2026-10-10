'use strict';
// ============ The ranking and the daily missions (v6.12): one window with two pages, opened from the lobby ============
// Ranking: the top 50 of a record (level = xp, kills, infections, best score), from the database function qz_ranking — anyone may
// look, signed in or not; the player's own place is pinned under the list. Daily missions: 3 a day per account (new ones at midnight
// in Korea), picked and counted on the server (qz_missions; every qz_claim adds the finished match), paid once by qz_mission_claim.
const RK_KINDS=[['level','레벨','Level'],['kills','킬','Kills'],['infects','감염','Infections'],['best','최고 점수','Best score']];
const MIS_TIER=[null,['쉬움','Easy'],['보통','Normal'],['어려움','Hard']];
const SVG_TROPHY='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M4 1.5h8V3h2.5v1.6c0 1.9-1.3 3.3-3.1 3.6A4 4 0 018.8 10.6V12H11v2.5H5V12h2.2v-1.4A4 4 0 014.6 8.2 3.6 3.6 0 011.5 4.6V3H4zm0 3H3v.1c0 .9.5 1.6 1.2 1.9A6 6 0 014 4.5zm8 0c0 .7 0 1.4-.2 2C12.5 6.2 13 5.5 13 4.6v-.1z"/></svg>';
const SVG_MIS='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3 1h10v14H3zm1.5 2.2v1.6h1.6V3.2zm3 .3v1h4v-1zm-3 3.3v1.6h1.6V6.8zm3 .3v1h4v-1zm-3 3.3V12h1.6v-1.6zm3 .3v1h4v-1z"/></svg>';
// a mission's line: the pool's own wording when it has one, else written from its kind and goal
function misText(m,L){const own=m[L?'en':'ko'];if(own)return own;const n=fmtC(m.goal),s=m.goal>1?'es':'';
  return ({play:L?`Finish ${n} match${s}`:`매치 ${n}판 끝까지 하기`,win:L?`Win ${n} match${s} (humans win / scenario cleared)`:`매치 ${n}번 승리 (인간 승리 · 시나리오 클리어)`,
    kills:L?`Get ${n} kills`:`${n}킬 하기`,infects:L?`Infect ${n} humans as a zombie`:`좀비로 인간 ${n}명 감염시키기`,damage:L?`Deal ${n} damage`:`피해량 ${n} 주기`,
    rounds:L?`Play ${n} rounds (scenario: stages)`:`라운드 ${n}개 진행 (시나리오: 스테이지)`,hs:L?`Get ${n} headshot kills`:`헤드샷으로 ${n}킬`})[m.kind]||m.kind}
const misRw=(m,L)=>`${m.coins?`${COIN}${fmtC(m.coins)}`:''}${m.tickets?`<span class="mtk" title="${L?'근하신년 decoder':'근하신년 해독기'}">${decoderSvg('tki')}×${m.tickets}</span>`:''}`;
const hms=s=>{s=Math.max(0,s|0);return `${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};

const RKW={page:'mis',kind:'level',data:{},at:{},load:{},msg:'',msgOk:false,busy:false,tick:0,
  open(page){let o=$('rkWin');if(!o){o=document.createElement('div');o.id='rkWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{if(e.target===o){this.close();return}const t=e.target.closest('[data-ra]');if(t)this.act(t.dataset.ra,t.dataset.v)})}
    if(page)this.page=page;this.msg='';this.fetch();this.render();clearInterval(this.tick);this.tick=setInterval(()=>this.clock(),1000);AU.play('ui',{vol:.35})},
  close(){const o=$('rkWin');if(o)o.remove();clearInterval(this.tick)},
  // what the page on screen needs from the server: the ranking of this kind (kept a minute), today's missions (fetched on every open)
  fetch(force){const L=LI();
    if(this.page==='rank'){const k=this.kind;if(this.load[k]||(!force&&this.data[k]&&Date.now()-this.at[k]<60e3))return;this.load[k]=1;
      ACC.ranking(k).then(r=>{this.data[k]=r;this.at[k]=Date.now();if(this.kind===k)this.msg=''},e=>{if(this.kind===k){this.msg=ACC.errText(e);this.msgOk=false}}).finally(()=>{this.load[k]=0;this.render()})}
    else if(ACC.signed()&&!this.load.mis){this.load.mis=1;ACC.loadMissions().catch(e=>{this.msg=ACC.errText(e);this.msgOk=false}).finally(()=>{this.load.mis=0;this.render()})}},
  // the countdown to new missions; past midnight in Korea, today's are fetched again
  clock(){if(!$('rkWin')){clearInterval(this.tick);return}const M=ACC.mis,el=$('rkReset');if(!M||M.resets_in==null)return;
    const left=M.resets_in-(Date.now()-M.at)/1000;if(el)el.textContent=hms(left);if(left<=0&&this.page==='mis'&&!this.load.mis){M.resets_in=null;this.fetch(true)}},
  head(){const L=LI(),me=ACC.me;if(!ACC.on)return '';
    if(ACC.signed())return `<span class="scoin">${COIN}<b>${fmtC(me.coins)}</b></span>${me.tickets>0?`<span class="scoin tkc" title="${L?'근하신년 decoders kept':'보유한 근하신년 해독기'}">${decoderSvg('tki')}<b>${fmtC(me.tickets)}</b></span>`:''}<button class="sacc" data-ra="acc">${SVG_USER}<span>${esc(me.nickname)}</span></button>`;
    return `<button class="sacc hl" data-ra="login">${SVG_USER}<span>${L?'Sign in':'로그인'}</span></button>`},
  render(){const o=$('rkWin');if(!o)return;const L=LI(),pg=this.page,dot=ACC.misReady()>0,sc=o.querySelector('.rklist,.mbody'),keep=sc&&o.dataset.pg===pg+this.kind?sc.scrollTop:0;
    const tabs=`<div class="spages"><button class="${pg==='mis'?'on':''}" data-ra="page" data-v="mis">${SVG_MIS}${L?'Daily missions':'일일 미션'}${dot?'<i class="dot"></i>':''}</button><button class="${pg==='rank'?'on':''}" data-ra="page" data-v="rank">${SVG_TROPHY}${L?'Ranking':'랭킹'}</button></div>`;
    o.innerHTML=`<div class="swin p${pg}"><div class="swh"><b>${pg==='rank'?(L?'Ranking':'랭킹'):(L?'Daily missions':'일일 미션')}</b><small>${pg==='rank'?'RANKING':'MISSIONS'}</small><span class="sgap"></span>${this.head()}<button class="sx" data-ra="x" aria-label="close">×</button></div>${tabs}${pg==='rank'?this.rankPage():this.misPage()}</div>`;
    o.dataset.pg=pg+this.kind;if(keep){const s2=o.querySelector('.rklist,.mbody');if(s2)s2.scrollTop=keep}this.clock()},
  // ---- the daily missions ----
  misPage(){const L=LI(),M=ACC.mis,ms=M&&M.missions||[];let body;
    if(!ACC.on)body=`<div class="rkempty">${L?'Missions open once accounts are set up.':'계정 서버가 연결되면 미션을 할 수 있어요.'}</div>`;
    else if(!ACC.signed())body=`<div class="rkempty">${L?'Sign in for 3 daily missions — coins and 근하신년 decoders for playing.':'로그인하면 매일 미션 3개 — 플레이만 해도 코인과 근하신년 해독기를 받아요.'}<button class="sbb" data-ra="login">${L?'Sign in':'로그인'}</button></div>`;
    else if(!ms.length)body=`<div class="rkempty">${this.load.mis?(L?'Loading…':'불러오는 중…'):(L?'No missions today.':'오늘은 미션이 없어요.')}</div>`;
    else body=ms.map(m=>{const done=m.progress>=m.goal,p=Math.min(1,m.progress/Math.max(1,m.goal)),t=MIS_TIER[m.tier]||MIS_TIER[1];
      return `<div class="mcard t${m.tier|0}${done?' done':''}${m.claimed?' got':''}"><em class="mtier">${t[L?1:0]}</em>
        <div class="mtx"><b>${esc(misText(m,L))}</b><div class="mbar"><u style="width:${Math.round(p*100)}%"></u></div><small>${fmtC(Math.min(m.progress,m.goal))} / ${fmtC(m.goal)}</small></div>
        <div class="mrw">${misRw(m,L)}</div>
        <button class="mcl" data-ra="claim" data-v="${m.slot}"${done&&!m.claimed&&!this.busy?'':' disabled'}>${m.claimed?(L?'Claimed ✔':'받음 ✔'):done?(L?'Claim':'보상 받기'):(L?'In progress':'진행 중')}</button></div>`}).join('');
    return `<div class="mbody">${body}${this.msg?`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`:''}</div>
      <div class="sfoot">${ACC.signed()&&M&&M.resets_in!=null?`<span class="mrs">${L?'New missions in':'새 미션까지'} <b id="rkReset">${hms(M.resets_in-(Date.now()-M.at)/1000)}</b></span>`:''}${L?'Progress is counted by the server when a match ends (the results screen), with the same limits as the coins. Mission coins do not count toward the 20,000-a-day round and match limit. A reward not claimed by midnight (Korea) is gone.'
        :'진행도는 매치가 끝나 결과 화면이 뜰 때 서버가 코인과 같은 기준으로 올려요. 미션 코인은 하루 라운드 · 매치 보상 한도(20,000)와 따로예요. 자정(한국 시간)까지 안 받은 보상은 사라져요.'}</div>`},
  // ---- the ranking ----
  rankPage(){const L=LI(),k=this.kind,R=this.data[k],lvK=k==='level';
    const val=x=>lvK?`${fmtC(x.xp)} <small>XP</small>`:fmtC(x.value);
    const row=(x,cls)=>`<div class="rkr${x.rank<=3?' r'+x.rank:''}${cls||''}"><span class="rkn">${x.rank<=3?`<i>${x.rank}</i>`:x.rank}</span><b>${esc(x.nickname)}</b><span class="rklv">Lv.${recLevel(x.xp|0).l}</span><span class="rkv">${val(x)}</span></div>`;
    let list,mine='';
    if(!ACC.on)list=`<div class="rkempty">${L?'The ranking opens once accounts are set up.':'계정 서버가 연결되면 랭킹을 볼 수 있어요.'}</div>`;
    else if(!R)list=`<div class="rkempty">${this.load[k]?(L?'Loading…':'불러오는 중…'):''}</div>`;
    else list=R.top.length?R.top.map(x=>row(x,x.me?' me':'')).join(''):`<div class="rkempty">${L?'Nobody yet — finish a match to be the first.':'아직 아무도 없어요 — 한 판 끝까지 하면 1등!'}</div>`;
    if(ACC.on&&R){const me=R.me;
      if(!ACC.signed())mine=`<div class="rkme nt"><span>${L?'Sign in to see your place':'로그인하면 내 순위가 보여요'}</span><button data-ra="login">${L?'Sign in':'로그인'}</button></div>`;
      else if(!me||!me.rank)mine=`<div class="rkme nt"><span>${L?'No record yet — finish a match to get on the board.':'아직 기록이 없어요 — 매치를 끝까지 하면 랭킹에 올라가요.'}</span></div>`;
      else mine=`<div class="rkme">${row(me,' me')}</div>`}
    const unit={level:L?'XP':'경험치',kills:L?'Kills':'킬',infects:L?'Infections':'감염',best:L?'Best score':'최고 점수'}[k];
    return `<div class="stabs"><div class="stl">${RK_KINDS.map(([id,ko,en])=>`<button class="${id===k?'on':''}" data-ra="kind" data-v="${id}">${L?en:ko}</button>`).join('')}</div>
        ${R?`<span class="rktot">${L?`${fmtC(R.total)} players`:`전체 ${fmtC(R.total)}명`}</span>`:''}<button class="rkref" data-ra="ref"${this.load[k]?' disabled':''}>↻ ${L?'Refresh':'새로고침'}</button></div>
      <div class="rkhd"><span class="rkn">${L?'#':'순위'}</span><b>${L?'Nickname':'닉네임'}</b><span class="rklv">${L?'Level':'레벨'}</span><span class="rkv">${unit}</span></div>
      <div class="rklist">${list}</div>${mine}${this.msg?`<div class="sbm ${this.msgOk?'ok':'bad'}">${esc(this.msg)}</div>`:''}
      <div class="sfoot">${L?'Top 50 · accounts with at least one finished match · ties share a place.':'상위 50명 · 매치를 1판 이상 끝낸 계정 · 같은 기록은 같은 순위.'}</div>`},
  act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='page'){if(this.page!==v){this.page=v;this.msg='';this.fetch();this.render();AU.play('ui',{vol:.3})}return}
    if(a==='kind'){if(this.kind!==v){this.kind=v;this.msg='';this.fetch();this.render();AU.play('ui',{vol:.25});const l=document.querySelector('#rkWin .rklist');if(l)l.scrollTop=0}return}
    if(a==='ref'){this.fetch(true);this.render();return}
    if(a==='login'){ACCW.open('in');return}
    if(a==='acc'){ACCW.open('me');return}
    if(a==='claim'){this.claim(+v);return}},
  async claim(slot){if(this.busy)return;const L=LI();this.busy=true;this.msg='';this.render();
    try{const r=await ACC.misClaim(slot);this.msg=(L?'Reward: ':'보상 — ')+(r.got?`+${fmtC(r.got)} ${L?'coins':'코인'}`:'')+(r.got_tickets?`${r.got?' · ':''}${L?'근하신년 decoder':'근하신년 해독기'} +${r.got_tickets}`:'');this.msgOk=true;AU.play('buy',{vol:.8})}
    catch(e){this.msg=ACC.errText(e);this.msgOk=false;AU.play('dry',{vol:.5});if(/no_mission/.test(String(e.message)))ACC.loadMissions().catch(()=>{})}
    this.busy=false;this.render()}};

// ---------- the results screen: what this match did for today's missions (under the coin box) ----------
function misResHtml(ms){if(!ms||!ms.length)return '';const L=LI(),moved=ms.filter(m=>!m.claimed&&m.progress>m.from);if(!moved.length)return '';
  return `<b class="mrh">${SVG_MIS}${L?'Daily missions':'일일 미션'}</b>${moved.map(m=>{const done=m.progress>=m.goal;
    return `<span class="mri${done?' done':''}"><u>${esc(misText(m,L))}</u><i>${fmtC(m.progress)}/${fmtC(m.goal)}</i><small>+${fmtC(m.progress-m.from)}</small>${done?`<em>${L?'DONE':'완료!'}</em>`:''}</span>`}).join('')}
    ${moved.some(m=>m.progress>=m.goal)?`<button data-act="mis">${L?'Claim':'보상 받기'}</button>`:''}`}
function misResPut(box,h){const old=box.parentNode&&box.parentNode.querySelector('.misRes');if(old)old.remove();const d=document.createElement('div');d.className='misRes';d.innerHTML=h;box.after(d)}

// ---------- the lobby: the mission and ranking buttons, next to the shop ----------
function rankLobby(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||!ACC.on)return;const L=LI();
  const add=(cls,act,ico,txt)=>{let b=tb.querySelector('.'+cls);if(!b){b=document.createElement('button');b.className=cls;b.dataset.act=act;b.innerHTML=ico+`<span>${txt}</span>`;
    const sb=tb.querySelector('.tshop'),last=tb.querySelector('.trank')||tb.querySelector('.tmis')||sb;if(last)last.after(b);else tb.prepend(b)}return b};
  const mb=add('tmis','mis',SVG_MIS,L?'Missions':'미션');add('trank','rank',SVG_TROPHY,L?'Ranking':'랭킹');
  const dot=mb.querySelector('.dot'),want=ACC.misReady()>0;if(want&&!dot){const d=document.createElement('i');d.className='dot';d.title=L?'A mission reward to claim':'받을 미션 보상이 있어요';mb.appendChild(d)}else if(!want&&dot)dot.remove()}

(function(){
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{rankLobby()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){
    if(a==='rank'){RKW.open('rank');return}
    if(a==='mis'){RKW.open('mis');return}
    return act0.call(this,a,v,el)};
  ACC.sub(()=>{if($('rkWin'))RKW.render()});
  addEventListener('keydown',e=>{if(e.code!=='Escape'||e.defaultPrevented||!$('rkWin'))return;RKW.close();e.stopPropagation();e.preventDefault()},true);
})();

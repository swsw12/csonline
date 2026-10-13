'use strict';
// ============ QUARANTINE Z — the admin page (admin.html, v6.42) ============
// A page of its own next to the game: the same Supabase project (SB, sb.js) and the game's gun and map names (GUN_NAMES, MAP_NAMES:
// build.py reads them out of the game's sources). It has no powers of its own: every call is one of the qz_admin_* functions in
// supabase/schema.sql, and each of those checks that the caller is in public.admins. Its sign-in is kept apart from the game's
// (localStorage qz_adm_ses), so the game and this page never use one refresh token at the same time.
// Views (the address's hash): #/dash, #/players[/<id>], #/settings[/prices|gacha|missions], #/notices, #/logs[/<player id>].

// ---------- small helpers ----------
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=v=>(Math.round(+v||0)).toLocaleString('ko-KR');
const pad=n=>String(n).padStart(2,'0');
function dt(t){if(!t)return '-';if(String(t)==='infinity')return '영구';const d=new Date(t);if(isNaN(d))return '-';return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`}
function md(day){const p=String(day).split('-');return p.length===3?`${+p[1]}/${+p[2]}`:String(day)}
function ago(t){if(!t)return '없음';const s=(Date.now()-new Date(t))/1000;if(isNaN(s))return '-';if(s<60)return '방금';if(s<3600)return Math.floor(s/60)+'분 전';if(s<86400)return Math.floor(s/3600)+'시간 전';
  if(s<86400*30)return Math.floor(s/86400)+'일 전';return dt(t).slice(0,10)}
function left(t){const s=(new Date(t)-Date.now())/1000;if(isNaN(s)||s<=0)return '곧 풀림';if(s<3600)return Math.ceil(s/60)+'분';if(s<86400)return Math.floor(s/3600)+'시간 '+Math.floor(s%3600/60)+'분';return Math.floor(s/86400)+'일 '+Math.floor(s%86400/3600)+'시간'}
function dur(sec){const s=Math.max(0,Math.round(+sec||0));if(s<60)return s+'초';const m=Math.floor(s/60);if(m<60)return m+'분';const h=Math.floor(m/60);if(h>=100)return N(h)+'시간';return h+'시간'+(m%60?' '+m%60+'분':'')}
function lvl(xp){let l=1,need=300,acc=0;xp=+xp||0;while(xp>=acc+need&&l<99){acc+=need;l++;need=Math.round(need*1.18)}return l}// (lobby.js recLevel)
const GN=id=>(GUN_NAMES[id]&&GUN_NAMES[id][0])||id;
const MN=id=>MAP_NAMES[id]||id||'-';
const MODE={mut:'뮤테이션',orig:'오리지널',scen:'좀비 시나리오'};
const KIND={coins:'코인',frags:'해독 조각',tfrags:'초월 조각',tickets:'근하신년 해독기',season_tickets:'시즌 해독기'};
const PROV={email:'이메일',google:'구글',kakao:'카카오',github:'깃허브',apple:'애플'};
const online=t=>!!t&&Date.now()-new Date(t)<150e3;
const ls=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
const isoLocal=t=>{if(!t)return '';const d=new Date(t);if(isNaN(d))return '';return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
const fromLocal=v=>{if(!v)return '';const d=new Date(v);return isNaN(d)?'':d.toISOString()};

// ---------- the server (the game's account.js does the same with fetch; no library) ----------
const API={ses:null,
  base(){return String(SB.url||'').replace(/\/+$/,'')},
  load(){this.ses=ls('qz_adm_ses')},
  save(s){if(!s||!s.access_token){this.ses=null;ls('qz_adm_ses',null);return}
    this.ses={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at||Math.floor(Date.now()/1000)+(+s.expires_in||3600)};ls('qz_adm_ses',this.ses)},
  async req(method,path,body,auth){const h={apikey:SB.key,'Content-Type':'application/json'};if(auth&&this.ses)h.Authorization='Bearer '+this.ses.access_token;
    let r;try{r=await fetch(this.base()+path,{method,headers:h,body:body==null?undefined:JSON.stringify(body)})}catch(e){const er=new Error('network');er.net=1;throw er}
    const tx=await r.text();let j=null;try{j=tx?JSON.parse(tx):null}catch(e){j=null}
    if(!r.ok){const er=new Error((j&&(j.message||j.msg||j.error_description||j.error))||('HTTP '+r.status));er.status=r.status;er.code=j&&(j.code||j.error_code);throw er}
    return j},
  async refresh(){const s=this.ses;if(!s||!s.refresh_token)throw new Error('not_signed_in');
    try{this.save(await this.req('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:s.refresh_token},false))}catch(e){if(!e.net)this.save(null);throw e}},
  async call(m,p,b){const s=this.ses;if(s&&s.expires_at-Date.now()/1000<90)await this.refresh();
    try{return await this.req(m,p,b,true)}catch(e){if(e.status===401&&this.ses){await this.refresh();return await this.req(m,p,b,true)}throw e}},
  rpc(name,args){return this.call('POST','/rest/v1/rpc/'+name,args||{})},
  async signIn(email,pw){this.save(await this.req('POST','/auth/v1/token?grant_type=password',{email,password:pw},false))},
  oauth(p){location.assign(this.base()+'/auth/v1/authorize?provider='+encodeURIComponent(p)+'&redirect_to='+encodeURIComponent(location.origin+location.pathname))},
  async signOut(){try{if(this.ses)await this.req('POST','/auth/v1/logout',null,true)}catch(e){}this.save(null)}};

// what went wrong, in words
function errText(e){const m=String(e&&e.message||e||''),c=String(e&&e.code||'');
  const T=[[/network|Failed to fetch/i,'서버에 연결할 수 없어요. 인터넷 연결을 확인해 주세요'],[/invalid_credentials|Invalid login credentials/i,'이메일 또는 비밀번호가 맞지 않아요'],
    [/email_not_confirmed|Email not confirmed/i,'메일함에서 인증 링크를 먼저 눌러 주세요'],[/rate limit|too many/i,'요청이 너무 많아요. 잠시 후 다시 해 주세요'],
    [/not_admin/,'이 계정은 관리자가 아니에요'],[/not_signed_in|JWT|refresh_token/i,'다시 로그인해 주세요'],[/reason_required/,'사유를 적어 주세요'],
    [/bad_amount/,'수량을 확인해 주세요 (1 ~ 1억)'],[/bad_kind/,'지급할 수 없는 항목이에요'],[/no_profile/,'플레이어를 찾을 수 없어요'],
    [/already_owned/,'이미 가진 무기예요'],[/not_owned/,'가지고 있지 않은 무기예요'],[/free_gun/,'모두가 처음부터 가진 기본 무기예요'],[/no_gun/,'목록에 없는 무기가 있어요'],
    [/ban_admin/,'관리자 계정은 정지할 수 없어요'],[/bad_days/,'정지 기간을 확인해 주세요'],[/not_banned/,'정지 중인 계정이 아니에요'],
    [/bad_price/,'가격을 확인해 주세요 (0 ~ 1,000만)'],[/gacha_only/,'근하신년 무기는 상점에서 팔 수 없어요'],[/trans_only/,'초월 무기는 상점에서 팔 수 없어요'],
    [/bad_range/,'최소값이 최대값보다 커요'],[/bad_line/,'줄 보상은 gun:무기 · coins:숫자 · frags:숫자 · tickets:숫자 꼴이어야 해요'],[/bad_key/,'없는 설정 칸이에요'],
    [/bad_value/,'값을 확인해 주세요 (0 이상, 숫자 범위는 근하신년 · 시즌 24 이상, 보조무기 25 이상)'],[/bad_title/,'제목을 적어 주세요'],[/no_notice/,'공지를 찾을 수 없어요 (이미 지워졌을 수 있어요)'],
    [/bad_id/,'미션 ID는 영문 소문자 · 숫자 · _ 로 1~24자'],[/no_config/,'설정 줄이 없어요 (schema.sql을 다시 실행해 주세요)'],
    [/Could not find the function|PGRST202/i,'서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)'],[/permission denied/i,'권한이 없어요 (schema.sql을 다시 실행해 주세요)']];
  for(const [r,t] of T)if(r.test(m)||r.test(c))return t;return '문제가 생겼어요: '+m.slice(0,120)}

// ---------- state ----------
const ST={me:null,r:{v:'dash'},dash:null,dashT:0,clkT:0,
  users:{q:'',sort:'new',rows:[],total:0,loaded:false,busy:false},user:null,utab:'coin',
  prices:null,pf:'all',pq:'',cfg:null,cfgDraft:{},missions:null,mNew:false,notices:null,nEdit:null,nLevel:'info',
  logs:{rows:[],target:null,done:false,busy:false}};
const VIEWS={
  dash:{t:'현황',ico:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 14h14v1.5H1zM2 8h3v5H2zm4.5-5h3v10h-3zM11 6h3v7h-3z"/></svg>'},
  players:{t:'플레이어',ico:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1.5a3.2 3.2 0 110 6.4 3.2 3.2 0 010-6.4zM2 14.5c0-3 2.7-5 6-5s6 2 6 5V15H2z"/></svg>'},
  settings:{t:'게임 설정',ico:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 3h7v1.6H2zm10 0h2v1.6h-2zM9.5 1.8h2v4h-2zM2 7.2h2v1.6H2zm5 0h7v1.6H7zM4.5 6h2v4h-2zM2 11.4h5V13H2zm8 0h4V13h-4zM7.5 10.2h2v4h-2z"/></svg>'},
  notices:{t:'공지',ico:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 6h3l6-3.5v11L5 10H4l1 4H3l-1-4zm11-.5h1.5v5H13z"/></svg>'},
  logs:{t:'기록',ico:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3 1h10v14H3zm2 3v1.5h6V4zm0 3v1.5h6V7zm0 3v1.5h4V10z"/></svg>'}};
const parse=()=>{const h=(location.hash||'').replace(/^#\/?/,'').split('/');return {v:VIEWS[h[0]]?h[0]:'dash',a:h[1]||null}};
const head=(t,p,side)=>`<header class="vh"><h1>${t}</h1>${p?`<p>${p}</p>`:''}${side?`<div class="sp">${side}</div>`:''}</header>`;
const errBox=(e,again)=>`<div class="err">${esc(errText(e))}${again?` <button class="btn sm" data-a="${again}">다시 시도</button>`:''}</div>`;

// ---------- a toast, a question ----------
function toast(msg,kind){let t=$('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.className='toast '+(kind||'');t.textContent=msg;clearTimeout(toast.T);toast.T=setTimeout(()=>{const x=$('toast');if(x)x.remove()},kind==='bad'?5500:2800)}
function ask(o){return new Promise(res=>{const w=document.createElement('div');w.className='ask';
  w.innerHTML=`<div class="card" role="alertdialog" aria-modal="true"><h3></h3>${o.eff?'<div class="eff"></div>':''}<p></p><div class="row"><button class="btn" data-k="0">취소</button><button class="btn ${o.danger?'kill':'pri'}" data-k="1"></button></div></div>`;
  w.querySelector('h3').textContent=o.title;if(o.eff)w.querySelector('.eff').textContent=o.eff;w.querySelector('p').textContent=o.body||'';w.querySelector('[data-k="1"]').textContent=o.ok||'확인';
  const done=v=>{w.remove();removeEventListener('keydown',kd,true);res(v)},kd=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done(false)}};
  addEventListener('keydown',kd,true);w.addEventListener('click',e=>{if(e.target===w){done(false);return}const b=e.target.closest('[data-k]');if(b)done(b.dataset.k==='1')});
  document.body.appendChild(w);w.querySelector('[data-k="1"]').focus()})}
// a form's buttons off while it works
async function busy(el,fn){const bs=el?[...el.querySelectorAll('button')]:[];bs.forEach(b=>b.disabled=true);try{return await fn()}finally{bs.forEach(b=>b.disabled=false)}}

// ---------- the way in ----------
function gate(kind,info){clearInterval(ST.dashT);clearInterval(ST.clkT);const app=$('app');app.className='';const L=(SB.oauth||[]).filter(p=>PROV[p]);
  let inner='';
  if(kind==='nocfg')inner=`<p>이 페이지가 쓸 Supabase 주소와 키가 없어요. source/src/sb.js의 SB를 채우고 다시 빌드해 주세요.</p>`;
  else if(kind==='notadmin')inner=`<p>${info?`지금 로그인한 계정(<b>${esc(info)}</b>)은`:'이 계정은'} 관리자가 아니에요. 관리자로 쓰려면 Supabase 대시보드의 SQL Editor에서 한 번 실행해 주세요.</p>
    <pre>insert into public.admins (user_id) select id from auth.users where email = '${esc(info||'관리자 계정 이메일')}' on conflict do nothing;</pre>
    <button class="btn pri" data-a="recheck">다시 확인</button><button class="btn" data-a="logout">다른 계정으로 로그인</button>`;
  else if(kind==='error')inner=`<p>${esc(errText(info))}</p><button class="btn pri" data-a="recheck">다시 시도</button><button class="btn" data-a="logout">로그아웃</button>`;
  else inner=`<p>게임과 같은 계정으로 로그인해요. 관리자로 등록된 계정만 들어올 수 있어요.</p>
    <label class="fld"><span>이메일</span><input name="email" type="email" autocomplete="username" required></label>
    <label class="fld"><span>비밀번호</span><input name="pw" type="password" autocomplete="current-password" required></label>
    <button class="btn pri">로그인</button>${L.map(p=>`<button type="button" class="btn" data-a="oauth" data-v="${p}">${PROV[p]}로 로그인</button>`).join('')}
    ${info?`<div class="err">${esc(info)}</div>`:''}`;
  app.innerHTML=`<div class="gate"><form class="card" data-f="login" novalidate><div class="wm">QUARANTINE<b>Z</b></div><b>관리 페이지</b>${inner}</form></div>`;
  const e=app.querySelector('input[name=email]');if(e)e.focus()}
async function enter(){if(!SB.url||!SB.key){gate('nocfg');return}API.load();if(!API.ses){gate('login');return}
  try{ST.me=await API.rpc('qz_admin_whoami')}
  catch(e){if(/not_admin/.test(e.message)){let em='';try{const u=await API.call('GET','/auth/v1/user');em=u&&u.email||''}catch(x){}gate('notadmin',em);return}
    if(!API.ses||e.status===401||/not_signed_in|JWT/i.test(e.message)){API.save(null);gate('login',e.net?errText(e):'');return}gate('error',e);return}
  frame();route()}
function frame(){const me=ST.me||{},app=$('app');app.className='layout';
  app.innerHTML=`<aside class="rail"><div class="brand"><div class="wm">QUARANTINE<b>Z</b></div><small>관리 페이지</small></div>
    <nav class="nav" aria-label="관리 메뉴">${Object.entries(VIEWS).map(([k,v])=>`<a href="#/${k}" data-v="${k}">${v.ico}<span>${v.t}</span></a>`).join('')}</nav>
    <div class="who"><div class="me"><b>${esc(me.nickname||'')}</b><div>${esc(me.email||'')}</div></div>
      <div class="row"><a class="btn sm" href="index.html" target="_blank" rel="noopener">게임 열기</a><button class="btn sm ghost" data-a="logout">로그아웃</button></div></div></aside>
    <main id="main"></main><div id="over"></div>`}
async function route(){if(!$('main'))return;const r=parse(),was=ST.r||{};ST.r=r;document.querySelectorAll('.nav a').forEach(a=>{const on=a.dataset.v===r.v;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  clearInterval(ST.dashT);clearInterval(ST.clkT);chartTip(null,false);
  if(r.v!=='players'||!r.a)closeSheet(true);
  if(r.v==='dash')return vDash();
  if(r.v==='players'){if(was.v!=='players'||!$('plist'))await vPlayers();if(r.a)vPlayer(r.a);return}
  if(r.v==='settings')return vSettings(r.a||'prices');
  if(r.v==='notices')return vNotices();
  if(r.v==='logs')return vLogs(r.a||null)}

// ---------- 현황 (the dashboard) ----------
const hhmm=()=>{const d=new Date(Date.now()+(new Date().getTimezoneOffset()+540)*60e3);return pad(d.getHours())+':'+pad(d.getMinutes())};// (Korean time, whatever the browser's zone)
async function vDash(soft){const M=$('main');clearInterval(ST.dashT);
  if(!soft||!$('dashB'))M.innerHTML=head('현황','오늘(한국 시간 0시부터)의 숫자예요. 30초마다 새로 고쳐요.','<button class="btn" data-a="dash">새로 고침</button>')+'<div id="dashB">'+(ST.dash?dashHtml(ST.dash):'<div class="empty">불러오는 중…</div>')+'</div>';
  const B=$('dashB');B.classList.add('loading');
  try{ST.dash=await API.rpc('qz_admin_dash');if(parse().v!=='dash'||!$('dashB'))return;$('dashB').innerHTML=dashHtml(ST.dash)}
  catch(e){if($('dashB')&&!ST.dash)$('dashB').innerHTML=errBox(e,'dash');else toast(errText(e),'bad')}
  finally{const b=$('dashB');if(b)b.classList.remove('loading')}
  ST.dashT=setInterval(()=>{if(!document.hidden&&parse().v==='dash')vDash(true)},30e3);
  clearInterval(ST.clkT);ST.clkT=setInterval(()=>{const c=$('clk');if(c)c.textContent=hhmm()},10e3)}
function dashHtml(D){const days=D.days||[],dec=D.dec||{},R=D.rooms||[];
  const kp=(l,v,s)=>`<div><span>${l}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
  return `<div class="top"><div class="hud" role="group" aria-label="지금 상태">
      <div class="h"><b>${N(D.online_now)}</b><span>접속 중</span></div><div class="c"><b id="clk">${hhmm()}</b><span>한국 시간</span></div><div class="z"><b>${N(D.banned)}</b><span>정지 중</span></div></div>
    <div class="kpis">${kp('오늘 접속',N(D.active_today)+'명')}${kp('오늘 가입',N(D.new_today)+'명')}${kp('오늘 이용 시간',dur(D.online_today),'그중 판 플레이 '+dur(D.play_today))}${kp('전체 가입자',N(D.users)+'명','누적 이용 '+dur(D.online_all))}</div></div>
  <div class="grid3" style="margin-bottom:14px">
    ${chartPanel('cA','하루 접속자','최근 14일 · 명',days.map(d=>({k:d.day,v:+d.active||0,t:N(d.active)+'명'})),'var(--c-h)',v=>N(v))}
    ${chartPanel('cS','하루 가입','최근 14일 · 명',days.map(d=>({k:d.day,v:+d.signups||0,t:N(d.signups)+'명'})),'var(--c-a)',v=>N(v))}
    ${chartPanel('cT','하루 이용 시간','최근 14일 · 시간',days.map(d=>({k:d.day,v:Math.round((+d.online||0)/360)/10,t:dur(d.online)+' (판 플레이 '+dur(d.play)+')'})),'var(--c-h)',v=>String(v))}</div>
  <div class="grid2">
    <div class="panel"><h2><span>오늘 재화</span><small>한국 시간 0시부터</small></h2><div class="pb"><div class="kv">
      <span>들어온 코인</span><b class="num">+${N(D.coins_in)}</b><span>쓴 코인</span><b class="num">−${N(D.coins_out)}</b><span>플레이어가 가진 코인 합계</span><b class="num">${N(D.coins_all)}</b>
      <span>코인으로 연 근하신년 해독기</span><b class="num">${N(dec.ny)}개</b><span>코인으로 연 시즌 해독기</span><b class="num">${N(dec.season)}개</b><span>코인으로 연 보조무기 해독기</span><b class="num">${N(dec.side)}개</b>
      <span>S급 무기 당첨</span><b class="num">${N(D.s_today)}번</b><span>초월 교환</span><b class="num">${N(D.trans_today)}번</b></div></div></div>
    <div class="panel"><h2><span>공개 방</span><small>${R.length?R.length+'개 열림':''}</small></h2>${R.length?`<div class="tw"><table class="tbl"><thead><tr><th>코드</th><th>방장</th><th class="hm">맵</th><th>모드</th><th class="num">인원</th><th class="hm">열린 지</th></tr></thead><tbody>
      ${R.map(r=>`<tr class="click" data-a="user" data-v="${esc(r.host)}"><td><code>${esc(r.code)}</code></td><td>${esc(r.host_name)}</td><td class="hm">${esc(MN(r.map))}</td><td>${esc(MODE[r.mode]||r.mode)}${r.status==='playing'?' <span class="tag">게임 중</span>':''}</td><td class="num">${N(r.players)}/${N(r.max_players)}</td><td class="hm">${esc(ago(r.since))}</td></tr>`).join('')}
      </tbody></table></div>`:'<div class="empty">지금 열린 공개 방이 없어요.</div>'}</div></div>`}
// a column chart: one series, 14 days; the newest day's value is labelled, every column answers hover and focus, a table can stand in
function chartPanel(id,title,sub,data,col,fmt){const W=320,H=150,L=30,B=22,T=16,pw=W-L-6,ph=H-B-T,n=data.length||1,band=pw/n,bw=Math.min(14,band*.62);
  const mx=Math.max(0,...data.map(d=>d.v)),top=nice(mx),y=v=>T+ph-(top?v/top:0)*ph;
  const ticks=(Number.isInteger(top/2)||!Number.isInteger(top)?[0,top/2,top]:[0,top]).filter((v,i,a)=>a.indexOf(v)===i);// (counts get whole-number ticks)
  let g=ticks.map(v=>`<line class="gl" x1="${L}" x2="${W-4}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text class="ax" x="${L-6}" y="${(y(v)+4).toFixed(1)}" text-anchor="end">${esc(fmt(v))}</text>`).join('');
  data.forEach((d,i)=>{const x=L+band*i+(band-bw)/2,yy=y(d.v),h=T+ph-yy,r=Math.min(4,h,bw/2);
    const path=h>0?`M${x.toFixed(1)},${(T+ph).toFixed(1)}V${(yy+r).toFixed(1)}Q${x.toFixed(1)},${yy.toFixed(1)} ${(x+r).toFixed(1)},${yy.toFixed(1)}H${(x+bw-r).toFixed(1)}Q${(x+bw).toFixed(1)},${yy.toFixed(1)} ${(x+bw).toFixed(1)},${(yy+r).toFixed(1)}V${(T+ph).toFixed(1)}Z`:'';
    g+=`<rect class="hit" x="${(L+band*i).toFixed(1)}" y="${T}" width="${band.toFixed(1)}" height="${ph+B}" tabindex="0" data-tip="${esc(md(d.k))}|${esc(d.t)}" aria-label="${esc(md(d.k))} ${esc(d.t)}"/>`;
    if(path)g+=`<path class="bar" d="${path}" fill="${col}"/>`;
    if(i===n-1)g+=`<text class="lbl" x="${(x+bw/2).toFixed(1)}" y="${(yy-5).toFixed(1)}" text-anchor="middle">${esc(fmt(d.v))}</text>`;
    if(i===0||i===n-1||i===Math.floor((n-1)/2))g+=`<text class="ax" x="${(x+bw/2).toFixed(1)}" y="${H-6}" text-anchor="middle">${esc(md(d.k))}</text>`});
  g+=`<line class="gl" x1="${L}" x2="${W-4}" y1="${T+ph}" y2="${T+ph}" style="stroke:#3a3e46"/>`;
  const tbl=`<table class="ctab"><thead><tr><th>날짜</th><th>값</th></tr></thead><tbody>${data.map(d=>`<tr><td>${esc(md(d.k))}</td><td>${esc(d.t)}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="panel"><h2><span>${title}</span><small>${sub}</small><button class="btn sm ghost" data-a="ctab" data-v="${id}" aria-pressed="false">표로 보기</button></h2>
    <div class="chart" id="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${g}</svg><div class="tw" hidden>${tbl}</div></div></div>`}
function nice(v){if(v<=0)return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=5?5:10)*e}
function chartTip(el,show){let t=$('ctip');if(!show){if(t)t.remove();return}if(!t){t=document.createElement('div');t.id='ctip';t.className='ctip';document.body.appendChild(t)}
  const [k,v]=String(el.dataset.tip||'').split('|');t.innerHTML=`<b>${esc(v)}</b>${esc(k)}`;const r=el.getBoundingClientRect();t.style.left=Math.min(innerWidth-160,Math.max(8,r.left+r.width/2-40))+'px';t.style.top=Math.max(8,r.top-8)+'px';
  t.style.transform='translateY(-100%)'}

// ---------- 플레이어 ----------
const SORTS=[['new','최근 가입'],['seen','최근 접속'],['coins','코인'],['xp','레벨'],['play','플레이 시간'],['online','이용 시간'],['banned','정지 중'],['admins','관리자']];
async function vPlayers(){const M=$('main'),U=ST.users;
  M.innerHTML=head('플레이어','닉네임, 친구 코드, 이메일 일부, 계정 ID로 찾아요.')+`
    <form class="search" data-f="search" role="search"><input name="q" value="${esc(U.q)}" placeholder="닉네임 · 친구 코드 · 이메일 · 계정 ID" autocomplete="off" enterkeyhint="search" aria-label="플레이어 찾기"><button class="btn pri">찾기</button></form>
    <div class="bar2"><span class="mute">정렬</span><div class="chips">${SORTS.map(([k,t])=>`<button class="chip${U.sort===k?' on':''}" data-a="sort" data-v="${k}" aria-pressed="${U.sort===k}">${t}</button>`).join('')}</div></div>
    <div class="panel" id="plist">${U.loaded?usersHtml():'<div class="empty">불러오는 중…</div>'}</div>`;
  if(!U.loaded)await loadUsers(false)}
async function loadUsers(more){const U=ST.users;if(U.busy)return;U.busy=true;const P=$('plist');if(P)P.classList.add('loading');
  try{const r=await API.rpc('qz_admin_users',{p_q:U.q,p_sort:U.sort,p_limit:50,p_offset:more?U.rows.length:0});U.rows=more?U.rows.concat(r.rows||[]):(r.rows||[]);U.total=r.total|0;U.loaded=true;
    if($('plist'))$('plist').innerHTML=usersHtml()}
  catch(e){if($('plist'))$('plist').innerHTML=errBox(e,'reusers')}
  finally{U.busy=false;const p=$('plist');if(p)p.classList.remove('loading')}}
function usersHtml(){const U=ST.users,sel=ST.r&&ST.r.a;if(!U.rows.length)return `<div class="empty">${U.q?'찾는 플레이어가 없어요. 닉네임 일부나 친구 코드 6자로 다시 찾아 보세요.':'아직 가입한 플레이어가 없어요.'}</div>`;
  return `<div class="tw"><table class="tbl"><thead><tr><th>닉네임</th><th class="hm">친구 코드</th><th class="num">레벨</th><th class="num">코인</th><th class="num">이용 시간</th><th class="num hm">판 플레이</th><th>마지막 접속</th><th class="hm">가입</th></tr></thead><tbody>
    ${U.rows.map(u=>`<tr class="click${sel===u.id?' sel':''}" data-a="user" data-v="${esc(u.id)}" tabindex="0"><td><div class="nick"><span class="dot${online(u.last_seen)?' on':''}" title="${online(u.last_seen)?'접속 중':''}"></span><b>${esc(u.nickname)}</b>${u.admin?'<span class="tag adm">관리자</span>':''}${u.banned_until&&new Date(u.banned_until)>Date.now()||String(u.banned_until)==='infinity'?'<span class="tag ban">정지</span>':''}</div></td>
      <td class="hm"><code>${esc(u.fcode||'')}</code></td><td class="num">${lvl(u.xp)}</td><td class="num">${N(u.coins)}</td><td class="num">${dur(u.online_secs)}</td><td class="num hm">${dur(u.play_secs)}</td><td>${esc(ago(u.last_seen))}</td><td class="hm">${esc(dt(u.created_at).slice(0,10))}</td></tr>`).join('')}
    </tbody></table></div><div class="more"><span>${N(U.total)}명 중 ${N(U.rows.length)}명</span>${U.rows.length<U.total?'<button class="btn sm" data-a="moreusers">50명 더 보기</button>':''}</div>`}

// ---------- one player (a sheet over the list) ----------
function closeSheet(quiet){const o=$('over');if(o)o.innerHTML='';ST.user=null;if(!quiet&&parse().v==='players'&&parse().a)location.hash='#/players';
  document.querySelectorAll('#plist tr.sel').forEach(t=>t.classList.remove('sel'))}
function sheetShell(inner){const o=$('over');if(!o)return;o.innerHTML=`<div class="sheetWrap" data-a="sheetbg"><aside class="sheet" role="dialog" aria-modal="true" aria-label="플레이어 정보" tabindex="-1">${inner}</aside></div>`;o.querySelector('.sheet').focus()}
async function vPlayer(id){document.querySelectorAll('#plist tr').forEach(t=>t.classList.toggle('sel',t.dataset.v===id));
  if(!ST.user||ST.user.id!==id)sheetShell(`<div class="sh"><h2>플레이어</h2><button class="btn sm ghost x" data-a="closesheet">닫기</button></div><div class="empty">불러오는 중…</div>`);
  if(!ST.prices)API.rpc('qz_admin_prices').then(p=>{ST.prices=p;if(ST.user&&ST.user.id===id)renderSheet()}).catch(()=>{});
  try{const u=await API.rpc('qz_admin_user',{p_id:id});if(parse().a!==id)return;ST.user=u;renderSheet()}
  catch(e){sheetShell(`<div class="sh"><h2>플레이어</h2><button class="btn sm ghost x" data-a="closesheet">닫기</button></div>${errBox(e)}`)}}
async function reloadUser(){const u=ST.user;if(!u)return;try{const n=await API.rpc('qz_admin_user',{p_id:u.id});ST.user=n;renderSheet();
  const i=ST.users.rows.findIndex(r=>r.id===n.id);if(i>=0){Object.assign(ST.users.rows[i],{nickname:n.nickname,coins:n.coins,banned_until:n.banned_until});if($('plist'))$('plist').innerHTML=usersHtml()}}catch(e){toast(errText(e),'bad')}}
const banned=u=>!!u.banned_until&&(String(u.banned_until)==='infinity'||new Date(u.banned_until)>Date.now());
function renderSheet(){const u=ST.user;if(!u)return;const sc=document.querySelector('.sheet'),y=sc?sc.scrollTop:0,rec=u.rec||{},b=banned(u),forever=String(u.banned_until)==='infinity';
  const owned=(u.owned||[]),has=new Set(owned.map(o=>o.gun)),P=ST.prices||[];
  const giveable=P.filter(p=>!p.free&&!has.has(p.gun)).sort((a,c)=>GN(a.gun).localeCompare(GN(c.gun),'ko'));
  const eps=(u.eps||[]).filter(e=>e.clears>0).map(e=>`${e.ep}챕터 ${['쉬움','보통','어려움','전문가'][e.diff]||e.diff}${e.best_medal?' '+e.best_medal:''}`);
  const days=u.days||[],dmx=Math.max(1,...days.map(d=>+d.online||0)),D14=[];for(let i=13;i>=0;i--){const d=new Date(Date.now()+(new Date().getTimezoneOffset()+540)*60e3-i*864e5),k=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;D14.push(days.find(x=>x.day===k)||{day:k,online:0,play:0})}
  const W=[['coins','코인',u.coins],['frags','해독 조각',u.frags],['tfrags','초월 조각',u.tfrags],['tickets','근하신년 해독기',u.tickets],['season_tickets','시즌 해독기',u.season_tickets]];
  const html=`<div class="sh"><span class="dot${online(u.last_seen)?' on':''}" title="${online(u.last_seen)?'접속 중':'접속 안 함'}"></span><h2>${esc(u.nickname)}</h2>${u.admin?'<span class="tag adm">관리자</span>':''}${b?'<span class="tag ban">정지</span>':''}<button class="btn sm ghost x" data-a="closesheet">닫기</button></div>
  <div class="sb">
    <div class="sec"><div class="kv">
      <span>친구 코드</span><b><code>${esc(u.fcode||'-')}</code></b><span>이메일</span><b>${esc(u.email||'-')}</b><span>로그인 방식</span><b>${esc(PROV[u.provider]||u.provider||'-')}</b>
      <span>가입</span><b>${esc(dt(u.created_at))} <span class="mute">${esc(ago(u.created_at))}</span></b><span>마지막 접속</span><b>${online(u.last_seen)?'지금 접속 중':esc(ago(u.last_seen))}</b>
      <span>마지막 로그인</span><b>${esc(dt(u.signed_in_at))}</b><span>초대한 사람</span><b>${u.ref_by?esc(u.ref_by):'없음'}</b><span>이 계정이 데려온 사람</span><b>${N(u.referred)}명</b>
      <span>친구</span><b>${N(u.friends)}명</b><span>계정 ID</span><b><code style="font-size:11px">${esc(u.id)}</code> <button class="btn sm ghost" data-a="copy" data-v="${esc(u.id)}">복사</button></b></div></div>
    <div class="sec"><h3>가진 것 <small>오늘 번 코인 ${N(u.day_earned)} / 20,000</small></h3><div class="wallet">${W.map(([k,l,v])=>`<div><span>${l}</span><b>${N(v)}</b></div>`).join('')}</div></div>
    <div class="sec"><h3>지급 · 회수</h3><form class="box stack" data-f="grant" style="gap:8px">
      <div class="row"><select name="kind" aria-label="항목">${W.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><input name="amount" class="grow" type="number" min="1" step="1" inputmode="numeric" placeholder="수량" aria-label="수량"></div>
      <div class="row"><input name="reason" class="grow" maxlength="200" placeholder="사유 (관리 기록에 남아요)" aria-label="사유"><button class="btn give" value="1">지급</button><button class="btn take" value="-1">회수</button></div>
      <p class="note">회수는 0 아래로 내려가지 않아요. 코인은 플레이어의 코인 기록에도 「관리자」로 남아요.</p></form></div>
    <div class="sec"><h3>무기 <small>기본 무기 빼고 ${N(owned.length)}개</small></h3><div class="box">
      ${owned.length?`<div class="guns">${owned.map(o=>`<span class="gun" title="${esc(dt(o.at))}${o.paid?' · '+N(o.paid)+' 코인':''}">${esc(GN(o.gun))}<button type="button" data-a="guntake" data-v="${esc(o.gun)}" aria-label="${esc(GN(o.gun))} 회수">회수</button></span>`).join('')}</div>`:'<p class="note" style="margin:0 0 10px">아직 산 무기가 없어요.</p>'}
      <form class="row" data-f="gungive"><select name="gun" class="grow" aria-label="지급할 무기"${P.length?'':' disabled'}>${P.length?giveable.map(p=>`<option value="${esc(p.gun)}">${esc(GN(p.gun))}${p.tier?' (근하신년 '+p.tier+')':''}</option>`).join(''):'<option>무기 목록을 불러오는 중…</option>'}</select>
        <input name="reason" class="grow" maxlength="200" placeholder="사유" aria-label="사유"><button class="btn give">지급</button></form></div></div>
    <div class="sec"><h3>닉네임</h3><form class="box row" data-f="rename"><input name="nick" class="grow" maxlength="16" placeholder="새 닉네임 (2~16자)" aria-label="새 닉네임"><input name="reason" class="grow" maxlength="200" placeholder="사유" aria-label="사유"><button class="btn">바꾸기</button></form></div>
    <div class="sec"><h3>이용 정지</h3><div class="box danger">${b?`<div class="kv"><span>기간</span><b>${forever?'영구 정지':esc(dt(u.banned_until))+' 까지 <span class="mute">'+esc(left(u.banned_until))+' 남음</span>'}</b><span>사유</span><b>${esc(u.ban_reason||'-')}</b></div>
        <form class="row" data-f="unban" style="margin-top:12px"><input name="reason" class="grow" maxlength="200" placeholder="해제 사유" aria-label="해제 사유"><button class="btn give">정지 풀기</button></form>`
      :u.admin?'<p class="note" style="margin:0">관리자 계정은 정지할 수 없어요.</p>'
      :`<form data-f="ban" class="stack" style="gap:10px"><div class="chips" role="radiogroup" aria-label="정지 기간">${[[1,'1일'],[3,'3일'],[7,'7일'],[30,'30일'],[0,'영구']].map(([d,t],i)=>`<button type="button" class="chip${i===2?' on':''}" data-a="bandays" data-v="${d}" role="radio" aria-checked="${i===2}">${t}</button>`).join('')}</div>
        <input type="hidden" name="days" value="7"><div class="row"><input name="reason" class="grow" maxlength="200" placeholder="사유 (플레이어의 정지 안내 창에 보여요)" aria-label="정지 사유"><button class="btn kill">이용 정지</button></div>
        <p class="note">정지 중에는 보상, 상점, 해독기, 공개 방, 친구, 메시지가 막히고 혼자 하기(봇전 · 사격장)만 돼요. 이 계정의 공개 방은 바로 목록에서 내려가요.</p></form>`}</div></div>
    <div class="sec"><h3>이용 시간 <small>v6.42 패치부터 집계</small></h3><div class="box"><div class="kv"><span>게임 켜 둔 시간</span><b class="num">${dur(u.online_secs)}</b><span>그중 판 플레이</span><b class="num">${dur(u.play_secs)}</b></div>
      <div class="days" aria-label="최근 14일 이용 시간">${D14.map(d=>`<i class="${+d.online?'':'z'}" style="height:${Math.max(2,Math.round((+d.online||0)/dmx*100))}%" title="${esc(md(d.day))} ${esc(dur(d.online))} (판 플레이 ${esc(dur(d.play))})"></i>`).join('')}</div>
      <div class="row" style="justify-content:space-between;font-size:11px;color:var(--mute);margin-top:4px"><span>${esc(md(D14[0].day))}</span><span>오늘</span></div></div></div>
    <div class="sec"><h3>전적</h3><div class="kv"><span>레벨</span><b><span class="pix">Lv.${lvl(rec.xp)}</span> <span class="mute">${N(rec.xp)} XP</span></b><span>판 수</span><b class="num">${N(rec.g)}</b><span>처치</span><b class="num">${N(rec.k)}</b><span>감염</span><b class="num">${N(rec.inf)}</b>
      <span>최고 점수</span><b class="num">${N(rec.best)}</b><span>보상 받은 판</span><b class="num">${N(u.matches)}</b><span>번 코인 누적</span><b class="num">${N(u.earned)}</b><span>챕터 클리어</span><b>${eps.length?esc(eps.join(', ')):'없음'}</b></div></div>
    <div class="sec"><div class="tabs" role="tablist">${[['coin','코인 기록'],['gacha','해독 기록'],['admin','관리 기록']].map(([k,t])=>`<button role="tab" aria-selected="${ST.utab===k}" class="${ST.utab===k?'on':''}" data-a="utab" data-v="${k}">${t}</button>`).join('')}</div><div id="ulog">${ulogHtml(u)}</div></div>
  </div>`;
  if(!document.querySelector('.sheet'))sheetShell(html);else document.querySelector('.sheet').innerHTML=html;const s2=document.querySelector('.sheet');if(s2)s2.scrollTop=y}
const COINR={welcome:'가입 보상',buy:'무기 구매',match:'판 보상',round:'라운드 보상',ep_first:'챕터 첫 클리어',mission:'미션 보상',decoder:'근하신년 해독기',bingo_win:'근하신년 빙고',
  season_decoder:'시즌 해독기',season_win:'시즌 빙고',side_decoder:'보조무기 해독기',side_win:'보조무기 빙고',gift:'선물 보냄',ref_welcome:'초대 링크 보너스',ref_reward:'초대 보상',admin:'관리자'};
const GSRC={decode:'근하신년',free:'무료 근하신년',ticket:'보유 근하신년',season:'시즌',side:'보조무기',exchange:'조각 교환',trans:'초월 교환',letters:'근하신년 글자',pull:'예전 행운 주머니'};
function ulogHtml(u){const k=ST.utab;
  if(k==='coin'){const L=u.coin_log||[];if(!L.length)return '<div class="empty">코인 기록이 없어요.</div>';
    return `<div class="tw"><table class="tbl"><thead><tr><th>시각</th><th>내용</th><th class="num">변동</th></tr></thead><tbody>${L.map(c=>{const d=c.detail||{};let x=COINR[c.reason]||c.reason;
      if(d.gun)x+=' · '+GN(d.gun);if(d.to)x+=' → '+d.to;if(d.count)x+=' '+d.count+'개';if(d.mode)x+=' · '+(MODE[d.mode]||d.mode);if(d.note)x+=' · '+d.note;
      return `<tr><td class="mute" style="white-space:nowrap">${esc(dt(c.at))}</td><td>${esc(x)}</td><td class="num" style="color:${c.delta>=0?'#8cc8ff':'#ff9a8a'}">${c.delta>=0?'+':'−'}${N(Math.abs(c.delta))}</td></tr>`}).join('')}</tbody></table></div>`}
  if(k==='gacha'){const L=u.gacha_log||[];if(!L.length)return '<div class="empty">해독 기록이 없어요.</div>';
    return `<div class="tw"><table class="tbl"><thead><tr><th>시각</th><th>어디서</th><th>받은 것</th></tr></thead><tbody>${L.map(g=>{let x=g.kind==='gun'?GN(g.gun)+(g.tier?' ('+g.tier+'급)':''):g.kind==='coins'?N(g.amount)+' 코인':g.kind==='frags'?'해독 조각 '+N(g.amount):g.kind==='tickets'?'근하신년 해독기 '+N(g.amount):g.kind==='season_ticket'?'시즌 해독기 '+N(g.amount):g.kind;
      if((g.src==='exchange'||g.src==='trans')&&g.amount<0)x+=` (조각 ${N(-g.amount)} 사용)`;return `<tr><td class="mute" style="white-space:nowrap">${esc(dt(g.at))}</td><td>${esc(GSRC[g.src]||g.src)}</td><td>${esc(x)}</td></tr>`}).join('')}</tbody></table></div>`}
  const L=u.log||[];if(!L.length)return '<div class="empty">관리자가 이 계정에 한 일이 없어요.</div>';
  return `<div class="tw"><table class="tbl"><thead><tr><th>시각</th><th>관리자</th><th>작업</th><th>사유</th></tr></thead><tbody>${L.map(l=>`<tr><td class="mute" style="white-space:nowrap">${esc(dt(l.at))}</td><td>${esc(l.by||'-')}</td><td>${logWhat(l)}</td><td>${esc(l.reason||'')}</td></tr>`).join('')}</tbody></table></div>`}

// ---------- 게임 설정 ----------
const CFG_G=[
  ['근하신년 해독기',[['dec_cost1','1개 가격','코인'],['dec_cost10','10개 가격','코인'],['bingo_hi','숫자 범위 (0 ~ 이 값)','24 이상'],['dec_frag_min','해독 조각 최소','1개당'],['dec_frag_max','해독 조각 최대','1개당'],
    ['shuffle_free','하루 뒤섞기 횟수',''],['daily_free','매일 무료 해독기 1개',''],['full_s_coins','S급을 다 가졌을 때 대신 주는 코인',''],['full_a_frags','A급을 다 가졌을 때 대신 주는 조각',''],['ex_s','S급 교환에 드는 조각',''],['ex_a','A급 교환에 드는 조각','']]],
  ['시즌 해독기',[['season_cost1','1개 가격','코인'],['season_cost10','10개 가격','코인'],['season_hi','숫자 범위 (0 ~ 이 값)','24 이상'],['season_frag_min','해독 조각 최소','1개당'],['season_frag_max','해독 조각 최대','1개당'],
    ['season_owned_coins','이미 가진 무기 줄 대신 주는 코인',''],['season_lines','빙고 줄 보상','한 줄에 하나, 12개']]],
  ['보조무기 해독기',[['side_cost1','1개 가격','코인'],['side_cost10','10개 가격','코인'],['side_hi','숫자 범위 (1 ~ 이 값)','25 이상'],['side_frag_min','해독 조각 최소','1개당'],['side_frag_max','해독 조각 최대','1개당'],
    ['side_owned_coins','이미 가진 무기 줄 대신 주는 코인',''],['side_lines','빙고 줄 보상','한 줄에 하나, 12개']]],
  ['초월',[['trans_frag_min','해독기 1개당 초월 조각 최소',''],['trans_frag_max','해독기 1개당 초월 조각 최대',''],['trans_cost','초월 무기 교환에 드는 조각',''],['trans_guns','교환할 수 있는 초월 무기','무기 ID, 한 줄에 하나']]],
  ['초대',[['ref_new_coins','새 계정이 링크로 바로 받는 코인',''],['ref_new_tickets','새 계정이 판을 채우면 받는 해독기',''],['ref_coins','초대한 사람이 받는 코인',''],['ref_tickets','초대한 사람이 받는 해독기',''],
    ['ref_matches','보상까지 새 계정이 끝내야 하는 판',''],['ref_cap','초대 보상을 받는 최대 인원',''],['ref_days','링크를 쓸 수 있는 가입 후 일수','']]],
  ['예전 행운 주머니 (지금은 안 써요)',[['cost1','1번 가격',''],['cost10','10번 가격',''],['rate_s','S 확률','0 ~ 1'],['rate_a','A 확률','0 ~ 1'],['rate_coin','코인 확률','0 ~ 1'],['pity','천장 (이 번째에 S)',''],
    ['frag_min','조각 최소',''],['frag_max','조각 최대',''],['coin_table','코인 표','[[코인, 가중치], …]']],true]];
const lineWords=s=>{const m=/^(gun|coins|frags|tickets):(.+)$/.exec(s);if(!m)return {t:s+' (알 수 없는 꼴)',g:false};const v=m[2];
  return m[1]==='gun'?{t:GN(v),g:true}:m[1]==='coins'?{t:'코인 '+N(v)}:m[1]==='frags'?{t:'해독 조각 '+N(v)}:{t:'근하신년 해독기 '+N(v)}};
async function vSettings(sub){const M=$('main');const S=[['prices','무기 가격'],['gacha','해독기 · 초월 · 초대'],['missions','일일 미션']];if(!S.some(x=>x[0]===sub))sub='prices';
  M.innerHTML=head('게임 설정','바로 게임에 반영돼요. 바꾼 값은 schema.sql을 다시 실행해도 그대로예요.')+`<div class="sub">${S.map(([k,t])=>`<a class="chip${k===sub?' on':''}" href="#/settings/${k}"${k===sub?' aria-current="page"':''}>${t}</a>`).join('')}</div><div id="setB"><div class="empty">불러오는 중…</div></div>`;
  try{if(sub==='prices'){const [p,c]=await Promise.all([API.rpc('qz_admin_prices'),ST.cfg?Promise.resolve(ST.cfg):API.rpc('qz_admin_config_get')]);ST.prices=p;ST.cfg=c;renderPrices()}
    else if(sub==='gacha'){ST.cfg=await API.rpc('qz_admin_config_get');ST.cfgDraft={};renderCfg()}
    else{ST.missions=await API.rpc('qz_admin_missions');renderMissions()}}
  catch(e){if($('setB'))$('setB').innerHTML=errBox(e,'resettings')}}
function gunCat(p){const tg=(ST.cfg&&ST.cfg.trans_guns)||[];if(p.free)return '기본 무기';if(p.tier)return '근하신년 '+p.tier+'급';if(tg.includes(p.gun))return '초월';return p.sold?'상점':'비매품'}
function renderPrices(){const B=$('setB');if(!B)return;const tg=(ST.cfg&&ST.cfg.trans_guns)||[],q=ST.pq.trim().toLowerCase();
  const F=[['all','전체'],['sold','상점 판매'],['nosale','비매품'],['set','직접 바꾼 값']];
  const rows=(ST.prices||[]).filter(p=>ST.pf==='all'||(ST.pf==='sold'?p.sold&&!p.free:ST.pf==='nosale'?!p.sold&&!p.free:p.admin_set)).filter(p=>!q||GN(p.gun).toLowerCase().includes(q)||p.gun.includes(q))
    .sort((a,b)=>(a.free-b.free)||((b.sold&&!b.free)-(a.sold&&!a.free))||(a.price-b.price)||GN(a.gun).localeCompare(GN(b.gun),'ko'));
  B.innerHTML=`<div class="bar2"><div class="chips">${F.map(([k,t])=>`<button class="chip${ST.pf===k?' on':''}" data-a="pf" data-v="${k}" aria-pressed="${ST.pf===k}">${t}</button>`).join('')}</div><input id="pq" value="${esc(ST.pq)}" placeholder="무기 이름으로 찾기" aria-label="무기 찾기" style="margin-left:auto"></div>
    <div class="panel"><div class="tw"><table class="tbl"><thead><tr><th>무기</th><th class="hm">구분</th><th class="num">가격 (코인)</th><th>상점 판매</th><th class="num hm">가진 사람</th><th class="hm">상태</th><th></th></tr></thead><tbody>
    ${rows.map(p=>{const lock=p.free||!!p.tier||tg.includes(p.gun),fix=p.free;return `<tr data-g="${esc(p.gun)}"><td><b style="font-weight:600">${esc(GN(p.gun))}</b><div class="mute" style="font-size:11px">${esc(p.gun)}</div></td><td class="hm">${esc(gunCat(p))}</td>
      <td class="num"><input type="number" min="0" max="10000000" step="100" value="${p.price}" data-pp="${esc(p.gun)}" aria-label="${esc(GN(p.gun))} 가격"${fix?' disabled':''}></td>
      <td><label class="tog"><input type="checkbox" data-ps="${esc(p.gun)}"${p.sold?' checked':''}${lock?' disabled':''} aria-label="${esc(GN(p.gun))} 상점 판매"><span>${p.free?'모두 보유':p.tier||tg.includes(p.gun)?'팔 수 없음':p.sold?'판매':'안 팖'}</span></label></td>
      <td class="num hm">${N(p.owners)}명</td><td class="hm">${p.admin_set?`<span class="tag set">직접 바꿈</span> <span class="mute" style="font-size:11px">파일: ${N(p.file_price)}${p.file_sold?'':' · 비매품'}</span>`:''}</td>
      <td class="act">${fix?'':`<button class="btn sm pri" data-a="psave" data-v="${esc(p.gun)}" disabled>저장</button>`}${p.admin_set?` <button class="btn sm ghost" data-a="preset" data-v="${esc(p.gun)}">되돌리기</button>`:''}</td></tr>`}).join('')}
    </tbody></table></div>${rows.length?'':'<div class="empty">조건에 맞는 무기가 없어요.</div>'}</div>
    <p class="mute" style="font-size:12px">「되돌리기」는 schema.sql에 적힌 가격 · 판매 여부로 돌려놔요. 근하신년 무기와 초월 무기는 상점에서 팔 수 없어요.</p>`}
function cfgVal(k){return k in ST.cfgDraft?ST.cfgDraft[k]:ST.cfg[k]}
function renderCfg(){const B=$('setB');if(!B)return;const C=ST.cfg||{},known=new Set(CFG_G.flatMap(g=>g[1].map(f=>f[0])));
  const other=Object.keys(C).filter(k=>k!=='id'&&!known.has(k)).map(k=>[k,k,'']);const groups=CFG_G.concat(other.length?[['기타',other]]:[]);
  const fld=([k,l,h])=>{if(!(k in C))return '';const v=cfgVal(k),chg=k in ST.cfgDraft,cl=`fld${chg?' chg':''}`;
    if(typeof C[k]==='boolean')return `<div class="${cl}"><span>${l}${h?` <em>${h}</em>`:''}</span><label class="tog"><input type="checkbox" data-ck="${k}"${v?' checked':''} aria-label="${esc(l)}"><span>${v?'켜짐':'꺼짐'}</span></label></div>`;
    if(Array.isArray(C[k])&&(k.endsWith('_lines')||k==='trans_guns')){const L=Array.isArray(v)?v:String(v).split('\n');
      return `<label class="${cl} wide"><span>${l} <em>${h} · 지금 ${L.filter(x=>String(x).trim()).length}개</em></span><textarea data-ck="${k}" data-kind="lines" rows="${k==='trans_guns'?2:6}" spellcheck="false">${esc(L.join('\n'))}</textarea>
        <span class="lines">${L.filter(x=>String(x).trim()).map(x=>{const w=k==='trans_guns'?{t:GN(String(x).trim()),g:true}:lineWords(String(x).trim());return `<span class="${w.g?'g':''}">${esc(w.t)}</span>`}).join('')}</span></label>`}
    if(typeof C[k]==='object'&&C[k]!==null)return `<label class="${cl} wide"><span>${l}${h?` <em>${h}</em>`:''}</span><textarea data-ck="${k}" data-kind="json" rows="2" spellcheck="false">${esc(typeof v==='string'?v:JSON.stringify(v))}</textarea></label>`;
    return `<label class="${cl}"><span>${l}${h?` <em>${h}</em>`:''}</span><input type="number" step="any" min="0" data-ck="${k}" value="${esc(v)}"></label>`};
  const n=Object.keys(ST.cfgDraft).length;
  B.innerHTML=groups.map(([t,fs,fold])=>{const body=`<div class="pb cfg">${fs.map(fld).join('')}</div>`;
      return fold?`<details class="panel" style="margin-bottom:14px"><summary style="padding:10px 14px;cursor:pointer;font-weight:600">${t}</summary>${body}</details>`:`<div class="panel" style="margin-bottom:14px"><h2><span>${t}</span></h2>${body}</div>`}).join('')+
    `<form class="savebar" data-f="cfgsave"><span>${n?`<b style="color:var(--tape)">${n}개 바뀜</b>`:'<span class="mute">바뀐 값 없음</span>'}</span><input name="reason" class="grow" maxlength="200" placeholder="메모 (선택, 관리 기록에 남아요)" aria-label="메모"${n?'':' disabled'}>
      <button type="button" class="btn ghost" data-a="cfgundo"${n?'':' disabled'}>되돌리기</button><button class="btn pri"${n?'':' disabled'}>저장</button></form>`}
const MKIND={play:'판 플레이',win:'승리',kills:'처치',infects:'감염',damage:'피해량',rounds:'라운드',hs:'헤드샷 처치'};
function renderMissions(){const B=$('setB');if(!B)return;const L=ST.missions||[];
  const row=(m,isNew)=>`<tr data-mid="${esc(m.id||'')}"${isNew?' data-new="1"':''}><td>${isNew?`<input name="id" maxlength="24" placeholder="새 ID (영문 · 숫자 · _)" style="width:150px" aria-label="미션 ID">`:`<code>${esc(m.id)}</code>${m.edited?' <span class="tag set">직접 바꿈</span>':''}`}</td>
    <td><select name="tier" aria-label="단계">${[1,2,3].map(t=>`<option value="${t}"${+m.tier===t?' selected':''}>${['','쉬움','보통','어려움'][t]}</option>`).join('')}</select></td>
    <td><select name="kind" aria-label="종류">${Object.entries(MKIND).map(([k,t])=>`<option value="${k}"${m.kind===k?' selected':''}>${t}</option>`).join('')}</select></td>
    <td class="num"><input name="goal" type="number" min="1" value="${m.goal==null?'':m.goal}" style="width:96px" aria-label="목표"></td><td class="num"><input name="coins" type="number" min="0" max="5000" value="${m.coins==null?0:m.coins}" style="width:86px" aria-label="코인"></td>
    <td class="num"><input name="tickets" type="number" min="0" max="5" value="${m.tickets==null?0:m.tickets}" style="width:64px" aria-label="해독기"></td><td class="num hm"><input name="weight" type="number" min="0" value="${m.weight==null?1:m.weight}" style="width:64px" aria-label="가중치"></td>
    <td><label class="tog"><input type="checkbox" name="active"${m.active===false?'':' checked'} aria-label="켜짐"></label></td>
    <td class="hm"><input name="ko" maxlength="80" value="${esc(m.ko||'')}" placeholder="비우면 자동 문구" style="width:160px" aria-label="문구"></td>
    <td class="act"><button class="btn sm${isNew?' pri':''}" data-a="msave">${isNew?'추가':'저장'}</button>${isNew?' <button class="btn sm ghost" data-a="mcancel">취소</button>':''}</td></tr>`;
  B.innerHTML=`<div class="panel"><div class="tw"><table class="tbl"><thead><tr><th>ID</th><th>단계</th><th>종류</th><th class="num">목표</th><th class="num">코인</th><th class="num">해독기</th><th class="num hm">가중치</th><th>켜짐</th><th class="hm">문구</th><th></th></tr></thead>
    <tbody>${L.map(m=>row(m,false)).join('')}${ST.mNew?row({tier:1,kind:'kills',goal:10,coins:150,tickets:0,weight:1,active:true},true):''}</tbody></table></div>
    <div class="more"><span>매일 세 칸(쉬움 · 보통 · 어려움)에 가중치대로 하나씩 뽑혀요. 해독기 보상은 어려움 칸에서만 줘요. 바꾼 값은 내일 미션부터 적용돼요.</span>${ST.mNew?'':'<button class="btn sm" data-a="mnew">미션 추가</button>'}</div></div>`}

// ---------- 공지 ----------
const NLV={info:'공지',warn:'점검',event:'이벤트'};
function nState(n){const now=Date.now();if(!n.active)return ['꺼짐',''];if(new Date(n.starts_at)>now)return ['예약','set'];if(n.ends_at&&new Date(n.ends_at)<=now)return ['끝남',''];return ['게시 중','live']}
async function vNotices(){const M=$('main');M.innerHTML=head('공지','게임 로비에 바로 떠요. 첫 번째 공지는 로비 위 띠로, 전부 공지사항 목록 맨 위에 보여요.')+`<div class="grid2" style="align-items:start"><div class="panel" id="nEd"></div><div class="panel" id="nList"><div class="empty">불러오는 중…</div></div></div>`;
  renderNEdit();try{ST.notices=await API.rpc('qz_admin_notices');renderNList()}catch(e){if($('nList'))$('nList').innerHTML=errBox(e,'renotices')}}
function renderNEdit(){const E=$('nEd');if(!E)return;const n=ST.nEdit||{level:ST.nLevel||'info',active:true,popup:false,title:'',body:'',starts_at:'',ends_at:''};const lv=n.level||'info';
  E.innerHTML=`<h2><span>${n.id?'공지 고치기':'공지 쓰기'}</span>${n.id?'<small><button class="btn sm ghost" data-a="nnew">새로 쓰기</button></small>':''}</h2><form class="pb nedit" data-f="nsave">
    <div class="chips" role="radiogroup" aria-label="종류">${Object.entries(NLV).map(([k,t])=>`<button type="button" class="chip${lv===k?' on':''}" data-a="nlv" data-v="${k}" role="radio" aria-checked="${lv===k}">${t}</button>`).join('')}</div>
    <input type="hidden" name="level" value="${lv}">
    <label class="fld"><span>제목 <em>80자까지</em></span><input name="title" maxlength="80" value="${esc(n.title)}" required></label>
    <label class="fld"><span>내용 <em>1000자까지, 줄바꿈 그대로</em></span><textarea name="body" rows="5" maxlength="1000">${esc(n.body)}</textarea></label>
    <div class="grid2" style="gap:10px"><label class="fld"><span>시작 <em>비우면 지금부터</em></span><input name="starts_at" type="datetime-local" value="${esc(isoLocal(n.starts_at))}"></label>
      <label class="fld"><span>끝 <em>비우면 끌 때까지</em></span><input name="ends_at" type="datetime-local" value="${esc(isoLocal(n.ends_at))}"></label></div>
    <div class="row" style="gap:18px"><label class="tog"><input type="checkbox" name="popup"${n.popup?' checked':''}><span>로비에 창으로도 띄우기 (브라우저마다 한 번)</span></label><label class="tog"><input type="checkbox" name="active"${n.active===false?'':' checked'}><span>켜기</span></label></div>
    <div class="pv" aria-live="polite"><small>로비에서 이렇게 보여요</small><div class="pvBan lv-${lv}" id="pvBan"><em>${NLV[lv]}</em><b>${esc(n.title||'제목')}</b><span>${esc((String(n.body||'').split('\n').find(s=>s.trim()))||'')}</span></div></div>
    <div class="row" style="justify-content:flex-end"><button class="btn pri">${n.id?'저장':'공지 올리기'}</button></div></form>`}
function renderNList(){const B=$('nList');if(!B)return;const L=ST.notices||[];
  B.innerHTML=`<h2><span>올린 공지</span><small>${L.length?N(L.length)+'개':''}</small></h2>${L.length?`<div class="nlist">${L.map(n=>{const [st,cl]=nState(n);return `<div class="nitem${ST.nEdit&&ST.nEdit.id===n.id?' cur':''}">
      <div class="t"><span class="tag ${cl}">${st}</span><span class="tag">${NLV[n.level]||n.level}</span><b>${esc(n.title)}</b>${n.popup?'<span class="tag">창</span>':''}</div>
      <div class="m">${esc(dt(n.starts_at))} ~ ${n.ends_at?esc(dt(n.ends_at)):'끌 때까지'}${n.by?' · '+esc(n.by):''}</div>
      <div class="a"><button class="btn sm" data-a="nedit" data-v="${n.id}">고치기</button><button class="btn sm ghost" data-a="ntog" data-v="${n.id}">${n.active?'끄기':'켜기'}</button><button class="btn sm ghost" data-a="ndel" data-v="${n.id}" aria-label="삭제" style="color:#ff8a7c">삭제</button></div></div>`}).join('')}</div>`
    :'<div class="empty">아직 올린 공지가 없어요. 왼쪽에서 첫 공지를 써 보세요.</div>'}`}

// ---------- 기록 (the admin log) ----------
const ACT={grant:'지급',gun_give:'무기 지급',gun_take:'무기 회수',rename:'닉네임 변경',ban:'이용 정지',unban:'정지 해제',price:'가격 변경',price_reset:'가격 되돌림',config:'설정 변경',mission:'미션 저장',notice_add:'공지 올림',notice_edit:'공지 고침',notice_delete:'공지 삭제'};
const CFGL=k=>{for(const g of CFG_G)for(const f of g[1])if(f[0]===k)return f[1];return k};
const short=v=>{const s=typeof v==='string'?v:JSON.stringify(v);return s.length>60?s.slice(0,57)+'…':s};
function logWhat(l){const d=l.detail||{};let a=ACT[l.action]||l.action,x='';
  if(l.action==='grant'){a=d.amount<0?'회수':'지급';x=`${KIND[d.kind]||d.kind} ${d.amount>0?'+':'−'}${N(Math.abs(d.amount))} (${N(d.old)} → ${N(d.new)})`}
  else if(l.action==='gun_give'||l.action==='gun_take')x=GN(d.gun);
  else if(l.action==='rename')x=`${d.old} → ${d.new}`;
  else if(l.action==='ban')x=d.days?d.days+'일':'영구';
  else if(l.action==='price'||l.action==='price_reset')x=`${GN(d.gun)} ${N(d.old&&d.old.price)}${d.old&&!d.old.sold?' (안 팖)':''} → ${N(d.new&&d.new.price)}${d.new&&!d.new.sold?' (안 팖)':''}`;
  else if(l.action==='config')x=Object.keys(d).map(k=>`${CFGL(k)}: ${short(d[k].old)} → ${short(d[k].new)}`).join(', ');
  else if(l.action==='mission')x=d.id+(d.old?'':' (새로 추가)');
  else if(/^notice_/.test(l.action))x=d.title||'';
  return `<b style="font-weight:600">${esc(a)}</b>${x?` <span class="dim">${esc(x)}</span>`:''}`}
async function vLogs(target){const M=$('main'),G=ST.logs;if(G.target!==target){G.rows=[];G.done=false;G.target=target}
  M.innerHTML=head('기록','관리자가 한 일이 전부 남아요. 지우거나 고칠 수 없어요.',target?'<a class="btn sm" href="#/logs">전체 보기</a>':'')+`<div class="panel" id="logB"><div class="empty">불러오는 중…</div></div>`;
  G.rows=[];G.done=false;await loadLogs()}
async function loadLogs(){const G=ST.logs;if(G.busy)return;G.busy=true;try{const before=G.rows.length?G.rows[G.rows.length-1].id:0;const r=await API.rpc('qz_admin_logs',{p_target:G.target,p_before:before,p_limit:100});
    G.rows=G.rows.concat(r||[]);G.done=!r||r.length<100;renderLogs()}catch(e){if($('logB'))$('logB').innerHTML=errBox(e,'relogs')}finally{G.busy=false}}
function renderLogs(){const B=$('logB'),G=ST.logs;if(!B)return;if(!G.rows.length){B.innerHTML='<div class="empty">아직 기록이 없어요.</div>';return}
  const who=G.target&&G.rows[0]?G.rows[0].target_name:null;
  B.innerHTML=`${G.target?`<h2><span>${esc(who||'이 플레이어')}에게 한 일</span></h2>`:''}<div class="tw"><table class="tbl"><thead><tr><th>시각</th><th>관리자</th><th>대상</th><th>작업</th><th class="hm">사유</th></tr></thead><tbody>
    ${G.rows.map(l=>`<tr><td class="mute" style="white-space:nowrap">${esc(dt(l.at))}</td><td style="white-space:nowrap">${esc(l.by||'-')}</td><td style="white-space:nowrap">${l.target?`<a href="#/players/${esc(l.target)}">${esc(l.target_name||'(지워진 계정)')}</a>`:'<span class="mute">게임 설정</span>'}</td><td>${logWhat(l)}</td><td class="hm">${esc(l.reason||'')}</td></tr>`).join('')}
    </tbody></table></div><div class="more"><span>${N(G.rows.length)}개</span>${G.done?'':'<button class="btn sm" data-a="morelogs">더 보기</button>'}</div>`}

// ---------- what the buttons do ----------
const curVal=(u,k)=>+(({coins:u.coins,frags:u.frags,tfrags:u.tfrags,tickets:u.tickets,season_tickets:u.season_tickets})[k]||0);
async function onSubmit(f,k,sub){
  if(k==='login'){const em=f.email.value.trim(),pw=f.pw.value;if(!em||!pw){toast('이메일과 비밀번호를 적어 주세요','bad');return}
    await busy(f,async()=>{try{await API.signIn(em,pw);await enter()}catch(e){gate('login',errText(e))}});return}
  if(k==='search'){ST.users.q=f.q.value.trim();ST.users.loaded=false;await loadUsers(false);return}
  const u=ST.user,why=f.reason?f.reason.value.trim():'';
  if(['grant','gungive','rename','ban','unban'].includes(k)&&!why){toast('사유를 적어 주세요','bad');f.reason.focus();return}
  if(k==='grant'){const kind=f.kind.value,amt=Math.abs(parseInt(f.amount.value,10)||0),sg=sub&&sub.value==='-1'?-1:1;if(!amt){toast('수량을 적어 주세요','bad');f.amount.focus();return}
    const cur=curVal(u,kind),nv=Math.max(0,cur+sg*amt);
    if((sg<0||amt>=(kind==='coins'?100000:1000))&&!await ask({title:`${KIND[kind]} ${sg<0?'회수':'지급'}`,eff:`${N(cur)} → ${N(nv)} (${sg<0?'−':'+'}${N(Math.abs(nv-cur))})`,body:`${u.nickname}\n사유: ${why}`,ok:sg<0?'회수하기':'지급하기',danger:sg<0}))return;
    await busy(f,async()=>{try{const r=await API.rpc('qz_admin_grant',{p_id:u.id,p_kind:kind,p_amount:sg*amt,p_reason:why});toast(`${KIND[kind]} ${sg<0?'회수':'지급'}: ${N(r.old)} → ${N(r.new)}`,'ok');f.reset();await reloadUser()}catch(e){toast(errText(e),'bad')}});return}
  if(k==='gungive'){const g=f.gun.value;if(!g)return;await busy(f,async()=>{try{await API.rpc('qz_admin_gun',{p_id:u.id,p_gun:g,p_give:true,p_reason:why});toast(`${GN(g)} 지급했어요`,'ok');await reloadUser()}catch(e){toast(errText(e),'bad')}});return}
  if(k==='rename'){const nn=f.nick.value.trim();if(nn.length<2){toast('닉네임은 2~16자로 적어 주세요','bad');f.nick.focus();return}
    await busy(f,async()=>{try{const r=await API.rpc('qz_admin_rename',{p_id:u.id,p_nick:nn,p_reason:why});toast(`닉네임을 바꿨어요: ${r.old} → ${r.new}`,'ok');await reloadUser()}catch(e){toast(errText(e),'bad')}});return}
  if(k==='ban'){const d=parseInt(f.days.value,10)||0;
    if(!await ask({title:'이용 정지',eff:d?`${d}일 (${dt(Date.now()+d*864e5)}까지)`:'영구 정지',body:`${u.nickname}\n사유: ${why}\n\n정지 중에는 보상, 상점, 해독기, 공개 방, 친구, 메시지가 막혀요.`,ok:'정지하기',danger:true}))return;
    await busy(f,async()=>{try{await API.rpc('qz_admin_ban',{p_id:u.id,p_days:d,p_reason:why});toast(`${u.nickname} 이용 정지 (${d?d+'일':'영구'})`,'ok');await reloadUser()}catch(e){toast(errText(e),'bad')}});return}
  if(k==='unban'){await busy(f,async()=>{try{await API.rpc('qz_admin_unban',{p_id:u.id,p_reason:why});toast(`${u.nickname} 정지를 풀었어요`,'ok');await reloadUser()}catch(e){toast(errText(e),'bad')}});return}
  if(k==='cfgsave'){const ch={};for(const [key,v] of Object.entries(ST.cfgDraft)){const C=ST.cfg[key];
      if(Array.isArray(C))ch[key]=(Array.isArray(v)?v:String(v).split('\n')).map(s=>String(s).trim()).filter(Boolean);
      else if(typeof C==='object'&&C!==null){try{ch[key]=JSON.parse(v)}catch(e){toast(`${CFGL(key)}: JSON 꼴이 아니에요`,'bad');return}}
      else{if(v===''||!isFinite(v)){toast(`${CFGL(key)}: 숫자를 적어 주세요`,'bad');return}ch[key]=v}}
    for(const key of ['season_lines','side_lines'])if(ch[key]){const bad=ch[key].find(s=>!/^(gun:[a-z0-9_]+|coins:[0-9]+|frags:[0-9]+|tickets:[0-9]+)$/.test(s));if(bad){toast(`${CFGL(key)}: 「${bad}」 — gun:무기ID · coins:숫자 · frags:숫자 · tickets:숫자 중 하나로 적어 주세요`,'bad');return}
      if(ch[key].length<12){toast(`${CFGL(key)}: 12줄 이상이어야 해요 (지금 ${ch[key].length}줄)`,'bad');return}}
    await busy(f,async()=>{try{ST.cfg=await API.rpc('qz_admin_config',{p_values:ch,p_reason:f.reason.value.trim()});ST.cfgDraft={};renderCfg();toast(`설정 ${Object.keys(ch).length}개를 저장했어요`,'ok')}catch(e){toast(errText(e),'bad')}});return}
  if(k==='nsave'){const n=ST.nEdit||{},row={id:n.id||null,title:f.title.value.trim(),body:f.body.value,level:f.level.value,popup:f.popup.checked,active:f.active.checked,starts_at:fromLocal(f.starts_at.value),ends_at:fromLocal(f.ends_at.value)};
    if(!row.title){toast('제목을 적어 주세요','bad');f.title.focus();return}
    await busy(f,async()=>{try{ST.notices=await API.rpc('qz_admin_notice_save',{p_row:row});toast(n.id?'공지를 고쳤어요':'공지를 올렸어요','ok');ST.nEdit=null;renderNEdit();renderNList()}catch(e){toast(errText(e),'bad')}});return}}
async function onClick(t,a,v,e){
  switch(a){
  case 'logout':await API.signOut();ST.me=null;location.hash='#/dash';gate('login');return;
  case 'recheck':await enter();return;
  case 'oauth':API.oauth(v);return;
  case 'dash':vDash(true);return;
  case 'ctab':{const c=$(v);if(!c)return;const tb=c.querySelector('.tw'),svg=c.querySelector('svg'),on=tb.hidden;tb.hidden=!on;svg.style.display=on?'none':'';t.textContent=on?'차트로 보기':'표로 보기';t.setAttribute('aria-pressed',on);return}
  case 'user':location.hash='#/players/'+v;return;
  case 'sort':ST.users.sort=v;ST.users.loaded=false;document.querySelectorAll('[data-a="sort"]').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-pressed',b.dataset.v===v)});await loadUsers(false);return;
  case 'moreusers':await busy(t.parentNode,()=>loadUsers(true));return;
  case 'reusers':await loadUsers(false);return;
  case 'closesheet':closeSheet();return;
  case 'copy':try{await navigator.clipboard.writeText(v);toast('복사했어요','ok')}catch(x){toast(v)}return;
  case 'utab':ST.utab=v;document.querySelectorAll('[data-a="utab"]').forEach(b=>{b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-selected',b.dataset.v===v)});if($('ulog'))$('ulog').innerHTML=ulogHtml(ST.user);return;
  case 'bandays':{const f=t.closest('form');f.days.value=v;f.querySelectorAll('[data-a="bandays"]').forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-checked',b===t)});return}
  case 'guntake':{const u=ST.user,f=t.closest('.box'),r=f&&f.querySelector('input[name=reason]'),why=r?r.value.trim():'';
    if(!why){toast('아래 칸에 사유를 먼저 적어 주세요','bad');if(r)r.focus();return}
    if(!await ask({title:'무기 회수',eff:GN(v),body:`${u.nickname}\n사유: ${why}`,ok:'회수하기',danger:true}))return;
    try{await API.rpc('qz_admin_gun',{p_id:u.id,p_gun:v,p_give:false,p_reason:why});toast(`${GN(v)} 회수했어요`,'ok');await reloadUser()}catch(x){toast(errText(x),'bad')}return}
  case 'pf':ST.pf=v;renderPrices();return;
  case 'psave':{const g=v,tr=t.closest('tr'),pr=tr.querySelector('[data-pp]'),sd=tr.querySelector('[data-ps]'),p=(ST.prices||[]).find(x=>x.gun===g);const price=parseInt(pr.value,10);
    if(!(price>=0)){toast('가격을 숫자로 적어 주세요','bad');pr.focus();return}
    await busy(tr,async()=>{try{await API.rpc('qz_admin_price',{p_gun:g,p_price:price,p_sold:sd?sd.checked:p.sold,p_reason:''});ST.prices=await API.rpc('qz_admin_prices');renderPrices();toast(`${GN(g)}: ${N(price)} 코인${sd&&!sd.checked?' (안 팖)':''}`,'ok')}catch(x){toast(errText(x),'bad')}});return}
  case 'preset':{if(!await ask({title:'가격 되돌리기',eff:GN(v),body:'schema.sql에 적힌 가격과 판매 여부로 돌려놔요.',ok:'되돌리기'}))return;
    try{const r=await API.rpc('qz_admin_price_reset',{p_gun:v});ST.prices=await API.rpc('qz_admin_prices');renderPrices();toast(`${GN(v)}: ${N(r.price)} 코인으로 되돌렸어요`,'ok')}catch(x){toast(errText(x),'bad')}return}
  case 'cfgundo':ST.cfgDraft={};renderCfg();return;
  case 'resettings':vSettings(parse().a||'prices');return;
  case 'mnew':{ST.mNew=true;renderMissions();const ni=document.querySelector('tr[data-new] input[name=id]');if(ni)ni.focus();return}
  case 'mcancel':ST.mNew=false;renderMissions();return;
  case 'msave':{const tr=t.closest('tr'),q=n=>tr.querySelector(`[name="${n}"]`),isNew=!!tr.dataset.new,id=isNew?q('id').value.trim():tr.dataset.mid;
    if(isNew&&!/^[a-z0-9_]{1,24}$/.test(id)){toast('미션 ID는 영문 소문자 · 숫자 · _ 로 1~24자','bad');q('id').focus();return}
    if(isNew&&(ST.missions||[]).some(m=>m.id===id)){toast('이미 있는 ID예요','bad');return}
    const row={id,tier:+q('tier').value,kind:q('kind').value,goal:parseInt(q('goal').value,10),coins:parseInt(q('coins').value,10)||0,tickets:parseInt(q('tickets').value,10)||0,weight:parseInt(q('weight').value,10),active:q('active').checked,ko:q('ko').value.trim()};
    if(!(row.goal>=1)){toast('목표는 1 이상이어야 해요','bad');q('goal').focus();return}if(!(row.weight>=0))row.weight=1;
    await busy(tr,async()=>{try{ST.missions=await API.rpc('qz_admin_mission_save',{p_row:row,p_reason:''});ST.mNew=false;renderMissions();toast(`미션 ${id} ${isNew?'추가했어요':'저장했어요'}`,'ok')}catch(x){toast(errText(x),'bad')}});return}
  case 'nlv':{const f=t.closest('form');f.level.value=v;ST.nLevel=v;if(ST.nEdit)ST.nEdit.level=v;f.querySelectorAll('[data-a="nlv"]').forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-checked',b===t)});nPreview(f);return}
  case 'nnew':ST.nEdit=null;renderNEdit();renderNList();return;
  case 'nedit':{const n=(ST.notices||[]).find(x=>String(x.id)===String(v));if(!n)return;ST.nEdit={...n};renderNEdit();renderNList();const ed=$('nEd');if(ed)ed.scrollIntoView({block:'start',behavior:'smooth'});return}
  case 'ntog':{const n=(ST.notices||[]).find(x=>String(x.id)===String(v));if(!n)return;try{ST.notices=await API.rpc('qz_admin_notice_save',{p_row:{...n,active:!n.active}});toast(n.active?'공지를 껐어요':'공지를 켰어요','ok');renderNList()}catch(x){toast(errText(x),'bad')}return}
  case 'ndel':{const n=(ST.notices||[]).find(x=>String(x.id)===String(v));if(!n)return;if(!await ask({title:'공지 삭제',eff:n.title,body:'지우면 되돌릴 수 없어요. 잠깐 내리기만 하려면 「끄기」를 쓰세요.',ok:'삭제하기',danger:true}))return;
    try{ST.notices=await API.rpc('qz_admin_notice_delete',{p_id:n.id});if(ST.nEdit&&ST.nEdit.id===n.id){ST.nEdit=null;renderNEdit()}renderNList();toast('공지를 지웠어요','ok')}catch(x){toast(errText(x),'bad')}return}
  case 'renotices':vNotices();return;
  case 'morelogs':await loadLogs();return;
  case 'relogs':vLogs(ST.logs.target);return}}
function nPreview(f){const p=$('pvBan');if(!p)return;const lv=f.level.value;p.className='pvBan lv-'+lv;p.innerHTML=`<em>${NLV[lv]}</em><b>${esc(f.title.value||'제목')}</b><span>${esc((f.body.value.split('\n').find(s=>s.trim()))||'')}</span>`}

// ---------- wiring ----------
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t)return;if(t.tagName==='A'&&t.getAttribute('href'))return;
  if(t.dataset.a==='sheetbg'){if(e.target===t)closeSheet();return}// (a click anywhere inside the sheet reaches the backdrop's handler: only the backdrop itself closes it)
  e.preventDefault();onClick(t,t.dataset.a,t.dataset.v,e).catch(x=>toast(errText(x),'bad'))});
document.addEventListener('submit',e=>{const f=e.target.closest('form[data-f]');if(!f)return;e.preventDefault();onSubmit(f,f.dataset.f,e.submitter).catch(x=>toast(errText(x),'bad'))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.ask')&&$('over')&&$('over').firstChild){closeSheet();return}
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('tr.click')){e.preventDefault();e.target.click()}});
document.addEventListener('input',e=>{const t=e.target;
  if(t.id==='pq'){ST.pq=t.value;const pos=t.selectionStart;renderPrices();const n=$('pq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}return}
  if(t.dataset.pp||t.dataset.ps){const tr=t.closest('tr'),b=tr&&tr.querySelector('[data-a="psave"]'),p=(ST.prices||[]).find(x=>x.gun===(t.dataset.pp||t.dataset.ps));if(!b||!p)return;
    const pr=tr.querySelector('[data-pp]'),sd=tr.querySelector('[data-ps]');b.disabled=(+pr.value===p.price)&&(!sd||sd.checked===p.sold);if(t.dataset.ps){const s=t.parentNode.querySelector('span');if(s)s.textContent=t.checked?'판매':'안 팖'}return}
  if(t.dataset.ck){const k=t.dataset.ck,C=ST.cfg[k];let v;if(t.type==='checkbox')v=t.checked;else if(t.dataset.kind==='lines')v=t.value.split('\n');else if(t.dataset.kind==='json')v=t.value;else v=t.value===''?'':+t.value;
    const same=t.type==='checkbox'?v===C:t.dataset.kind==='lines'?JSON.stringify(v.map(s=>s.trim()).filter(Boolean))===JSON.stringify(C):t.dataset.kind==='json'?v.replace(/\s/g,'')===JSON.stringify(C).replace(/\s/g,''):v===C;
    if(same)delete ST.cfgDraft[k];else ST.cfgDraft[k]=v;
    if(t.type==='checkbox'||t.dataset.kind==='lines'){const pos=t.selectionStart;renderCfg();const n=document.querySelector(`[data-ck="${k}"]`);if(n&&t.type!=='checkbox'){n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}}}
    else{const l=t.closest('label.fld');if(l)l.classList.toggle('chg',!same);const sb=document.querySelector('.savebar');if(sb){const n=Object.keys(ST.cfgDraft).length;sb.querySelector('span').innerHTML=n?`<b style="color:var(--tape)">${n}개 바뀜</b>`:'<span class="mute">바뀐 값 없음</span>';sb.querySelectorAll('input,button').forEach(x=>x.disabled=!n)}}
    return}
  if(t.form&&t.form.dataset.f==='nsave'&&(t.name==='title'||t.name==='body'))nPreview(t.form)});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&(t.dataset.ps||t.dataset.ck)&&t.type==='checkbox')t.dispatchEvent(new Event('input',{bubbles:true}))});
document.addEventListener('pointerover',e=>{const h=e.target.closest&&e.target.closest('.chart .hit');if(h)chartTip(h,true)});
document.addEventListener('pointerout',e=>{const h=e.target.closest&&e.target.closest('.chart .hit');if(h)chartTip(h,false)});
document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('.chart .hit'))chartTip(e.target,true)});
document.addEventListener('focusout',e=>{if(e.target.matches&&e.target.matches('.chart .hit'))chartTip(e.target,false)});
addEventListener('hashchange',()=>{if(ST.me)route()});
// a sign-in coming back from Google / Kakao: the tokens arrive in the address's hash
(function(){const hs=location.hash||'';let msg='';
  if(/access_token=|error=/.test(hs)){const q=new URLSearchParams(hs.replace(/^#/,''));if(q.get('error'))msg=q.get('error_description')||q.get('error');
    else API.save({access_token:q.get('access_token'),refresh_token:q.get('refresh_token'),expires_at:+q.get('expires_at')||0,expires_in:q.get('expires_in')});
    try{history.replaceState(null,'',location.pathname+'#/dash')}catch(e){}}
  if(msg){gate('login',msg);return}enter()})();

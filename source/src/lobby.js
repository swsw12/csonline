'use strict';
// ============ Lobby: a game-client style front end ============
// Main menu = top bar (profile, level, icon buttons) + four tall mode cards + news / record / map-list panels.
// "Create room" = a framed room-settings window (title, mode and map dropdowns, live map preview, bots, difficulty, rounds),
// and the multiplayer waiting room uses the same window with eight player slots.
// Everything is drawn here (portraits, gun icons, CSS); map previews are snapshots of the menu scene.
const THUMB={};
const ICO={
  gear:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7 1h2l.4 1.9 1.3.6 1.7-1 1.4 1.4-1 1.7.5 1.3L15 7v2l-1.9.4-.6 1.3 1 1.7-1.4 1.4-1.7-1-1.3.5L9 15H7l-.4-1.9-1.3-.5-1.7 1-1.4-1.4 1-1.7-.5-1.3L1 9V7l1.9-.4.5-1.3-1-1.7 1.4-1.4 1.7 1 1.3-.6zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>',
  keys:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 4h14v9H1zm1.5 1.5v1.5h1.5V5.5zm2.5 0v1.5h1.5V5.5zm2.5 0v1.5H9V5.5zm2.5 0v1.5h1.5V5.5zM2.5 8v1.5h1.5V8zm2.5 0v1.5h1.5V8zm2.5 0v1.5H9V8zm2.5 0v1.5h1.5V8zM4 10.5V12h8v-1.5z"/></svg>',
  globe:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5c.7 0 1.6 1.4 1.9 3.5H6.1C6.4 3.9 7.3 2.5 8 2.5zM5.9 3a7 7 0 00-1.3 3H2.9A5.5 5.5 0 015.9 3zm4.2 0a5.5 5.5 0 013 3h-1.7a7 7 0 00-1.3-3zM2.6 7.5h1.9a13 13 0 000 1H2.6zm3.4 0h4a10 10 0 010 1H6zm5.5 0h1.9v1h-1.9a13 13 0 000-1zM2.9 10h1.7a7 7 0 001.3 3 5.5 5.5 0 01-3-3zm3.2 0h3.8c-.3 2.1-1.2 3.5-1.9 3.5S6.4 12.1 6.1 10zm5.3 0h1.7a5.5 5.5 0 01-3 3 7 7 0 001.3-3z"/></svg>',
  play:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M4 2l10 6-10 6z"/></svg>',
  door:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3 1h9v14H3zm6.5 7a.9.9 0 100 1.8.9.9 0 000-1.8z"/></svg>',
  net:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M5 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM1 11c0-2.2 1.8-4 4-4s4 1.8 4 4v1H1zm8.7-3.6A4 4 0 0115 11v1h-4.6v-1a5 5 0 00-.7-3.6z"/></svg>'};
// player record: kept across visits, fed by finished matches
function recGet(){return Object.assign({g:0,k:0,inf:0,best:0,xp:0},LS.get('rec',{}))}
function recLevel(xp){let l=1,need=300,acc=0;while(xp>=acc+need&&l<99){acc+=need;l++;need=Math.round(need*1.18)}return {l,cur:xp-acc,need}}
function recMatch(){const P=G.player;if(!P||G.recDone)return;G.recDone=true;const r=recGet();r.g++;r.k+=P.kills||0;r.inf+=P.infects||0;r.best=Math.max(r.best,Math.round(P.score||0));r.xp+=Math.max(20,Math.round((P.score||0)*.6+(P.kills||0)*8+(P.infects||0)*12));LS.set('rec',r)}
function myName(){return CFG.mpName||(LI()?'Survivor':'생존자')}
const relayWhyT=w=>({nat:LI()?'router blocked a direct link':'공유기가 직접 연결을 막음',timeout:LI()?'direct link timed out':'직접 연결 시간 초과',nortc:LI()?'no WebRTC here':'이 화면은 P2P 미지원',err:LI()?'P2P error':'P2P 오류',sdp:LI()?'P2P handshake failed':'P2P 협상 실패',peer:LI()?'peer asked for relay':'상대가 중계 요청',forced:LI()?'forced':'강제'})[w]||w;
const mapName=id=>(MAPDEFS[id]||MAPDEFS.q7).n[LI()];
// ---------- map preview: one frame of the menu scene, centre-cropped ----------
UI.snap=function(){if(!MAP.id||MAP.loading||MAP.gen||G.st!=='menu'||!R.renderer)return;
  try{R.render();const c=R.renderer.domElement,[cv,x]=mkCanvas(384,216);x.imageSmoothingEnabled=true;const r=384/216;let w=c.width,h=w/r;if(h>c.height){h=c.height;w=h*r}
    x.drawImage(c,(c.width-w)/2,(c.height-h)/2,w,h,0,0,384,216);THUMB[MAP.id]=cv.toDataURL('image/jpeg',.82)}catch(e){}
  for(const im of document.querySelectorAll('img.mth[data-m="'+MAP.id+'"]'))if(THUMB[MAP.id]){im.src=THUMB[MAP.id];im.classList.add('ok')}};
UI.wantSnap=function(){if(MAP.id&&!THUMB[MAP.id]){clearTimeout(UI.snT);UI.snT=setTimeout(()=>UI.snap(),450)}};
UI.mapLoaded=function(){UI.wantSnap()};
const thumb=(id,cls)=>`<div class="mthw ${cls||''}"><div class="mtph">${esc(mapName(id))}</div>${THUMB[id]?`<img class="mth ok" data-m="${id}" src="${THUMB[id]}">`:`<img class="mth" data-m="${id}" alt="">`}</div>`;
// ---------- main lobby ----------
UI.lobTab=UI.lobTab||0;
UI.buildTitle=function(){const L=LI(),r=recGet(),lv=recLevel(r.xp),skin=HSKINS.includes(CFG.skin)?CFG.skin:'guard';
  const cards=[
    {act:'go',cls:'c0',t:L?'QUICK START':'빠른 시작',s:L?'Last room settings, straight in':'지난 방 설정 그대로 바로 출격',tag:`${T(CFG.mode==='scen'?'scen':CFG.mode==='mut'?'mut':'orig')} · ${mapName(CFG.map)} · ${T('d'+CFG.diff)}`,
      art:`<img class="a1" src="${portrait('h_'+skin,150)}"><img class="a2" src="${portrait('z_'+CFG.zclass,CFG.zclass==='brute'?120:140)}">`},
    {act:'start',cls:'c1',t:L?'CREATE ROOM':'방 만들기',s:L?'Pick the map, bots and difficulty':'맵 · 봇 · 난이도를 직접 설정',tag:L?'Bot match':'봇전',
      art:`<img class="a1" src="${portrait('z_brute',128)}"><img class="a3" src="${portrait('z_runner',96)}">`},
    {act:'mp',cls:'c2',t:L?'MULTIPLAYER':'멀티플레이',s:L?'Play with friends by room code':'방 코드로 친구와 함께',tag:L?`Up to ${NET_MAXP}`:`최대 ${NET_MAXP}명`,
      art:`<img class="a1" src="${portrait('h_'+(HSKINS[1]||skin),140)}"><img class="a3" src="${portrait('h_'+(HSKINS[2]||skin),110)}">`},
    {act:'help',cls:'c3',t:L?'TRAINING':'조작법 · 훈련',s:L?'Keys, quick switch, draw cuts':'키 설정 · 챈샷 · 칼 챈샷',tag:L?'Guide':'가이드',
      art:`<img class="gun g1" src="${gunIcon('sr8',40)}"><img class="gun g2" src="${gunIcon('hammer',58)}"><img class="gun g3" src="${gunIcon('knife',30)}">`}];
  const news=L?[['NEW','Zombie Scenario: co-op PvE, 5 stages, a giant boss'],['NEW','Coffin Zombie: raises a coffin wall that bursts'],['NEW','Sledgehammer: two-handed, huge knockback'],['NEW','Quick switch: fire, then swap to cut the delay'],['NEW','Draw cut: swap to a blade right after a shot'],['UP','Expert difficulty, add-money button'],['UP','Italy rebuilt: two levels, a house and a wine cellar']]
    :[['NEW','좀비 시나리오 — 협동 PvE, 5스테이지 + 거대 좀비'],['NEW','관짝 좀비 — 관 방패를 세우고, 부서지면 폭발'],['NEW','해머 추가 — 양손 롱해머, 넉백 최강'],['NEW','챈샷 — 쏘고 바로 무기 교체로 딜레이 단축'],['NEW','칼 챈샷 — 사격 직후 칼로 바꾸면 근접 타격'],['UP','난이도 전문가 추가 · 돈 추가 버튼'],['UP','이탈리아 맵 개편 — 2층 구조, 저택, 와인 저장고']];
  $('menu').innerHTML=`<div class="lob">
    <div class="lobTop"><div class="lobLogo">QUARANTINE<b>Z</b></div>
      <div class="prof"><img src="${portrait('h_'+skin,40)}"><div><b>${esc(myName())}</b><span class="lv">Lv.${lv.l}</span><i class="xp"><u style="width:${Math.round(lv.cur/lv.need*100)}%"></u></i></div></div>
      <div class="tbtns"><button data-act="opts">${ICO.gear}<span>${T('settings')}</span></button><button data-act="help">${ICO.keys}<span>${T('controls')}</span></button>${typeof TOUCH!=='undefined'&&TOUCH.on&&document.documentElement.requestFullscreen?`<button data-act="tfull">⛶<span>${L?'Full':'전체화면'}</span></button>`:''}<button data-act="lang">${ICO.globe}<span>${L?'한국어':'English'}</span></button></div></div>
    <div class="mcards">${cards.map(c=>`<div class="mc ${c.cls}" data-act="${c.act}"><div class="art">${c.art}</div><div class="mtag">${esc(c.tag)}</div><div class="mbar"><b>${c.t}</b><span>${c.s}</span></div></div>`).join('')}</div>
    <div class="lobBot">
      <div class="lp"><div class="lpt"><b class="on">${L?'NOTICE':'공지사항'}</b></div><ul class="news">${news.slice(0,5).map(([k,t])=>`<li><em class="${k==='NEW'?'n':'u'}">${k}</em>${t}</li>`).join('')}</ul></div>
      <div class="lp"><div class="lpt"><b class="on">${L?'MY RECORD':'내 전적'}</b></div>
        <div class="recs"><div><span>${L?'Matches':'플레이'}</span><b>${r.g}</b></div><div><span>${T('kills')}</span><b>${r.k}</b></div><div><span>${T('infects')}</span><b>${r.inf}</b></div><div><span>${L?'Best score':'최고 점수'}</span><b>${r.best}</b></div></div>
        <div class="lvrow"><span>Lv.${lv.l}</span><i class="xp"><u style="width:${Math.round(lv.cur/lv.need*100)}%"></u></i><small>${lv.cur} / ${lv.need} XP</small></div></div>
      <div class="lp"><div class="lpt"><b class="on">${L?'MAPS':'맵 목록'}</b><small>${L?'click to load':'클릭하면 배경 변경'}</small></div><div class="mlist">${MAPLIST().map(id=>`<div class="mli${CFG.map===id?' on':''}" data-act="lobmap" data-v="${id}">${thumb(id,'sm')}<b>${esc(mapName(id))}</b></div>`).join('')}</div></div>
    </div>
    <div class="foot">v5.8 · ${L?MAPLIST().length+' maps · '+Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+' weapons':'맵 '+MAPLIST().length+'개 · 무기 '+Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+'종'}${typeof TOUCH!=='undefined'&&TOUCH.on?(L?' · touch controls on':' · 터치 조작 켜짐'):''}</div></div>`;
  UI.wantSnap()};
// ---------- room settings window (bots) ----------
const dd=(chg,k,cur,opts,dis)=>`<select class="dd" data-chg="${chg}" data-k="${k}"${dis?' disabled':''}>${opts.map(([v,l])=>`<option value="${v}"${String(cur)===String(v)?' selected':''}>${esc(String(l))}</option>`).join('')}</select>`;
const OPT={mode:()=>[['mut',T('mut')],['orig',T('orig')],['scen',T('scen')]],map:()=>MAPLIST().map(id=>[id,mapName(id)]),rounds:()=>[[5,5],[7,7],[9,9]],time:()=>[[120,'2'+T('min')],[180,'3'+T('min')],[240,'4'+T('min')]],diff:()=>[0,1,2,3].map(i=>[i,T('d'+i)])};
function roomPreview(c){const L=LI();return `<div class="rprev">${thumb(c.map,'big')}<div class="rpi"><b>${esc(mapName(c.map))}</b><span>${T(c.mode==='scen'?'scen':c.mode==='mut'?'mut':'orig')}</span></div></div>
  <p class="rdesc">${(MAPDEFS[c.map]||MAPDEFS.q7).d[L]}</p><div class="rrule"><b>${L?'Rules':'규칙'}</b>${T(c.mode==='scen'?'scenD':c.mode==='mut'?'mutD':'origD')}</div>`}
function charPick(act){const L=LI();return `<div class="rsec"><div class="rst">${T('char')}</div><div class="cards">${HSKINS.map(k=>`<div class="card${CFG.skin===k?' on':''}" data-act="${act}" data-v="skin:${k}"><img src="${portrait('h_'+k,62)}"><span>${HSKIN_N[k][L]}</span></div>`).join('')}</div></div>
  ${(act==='set'?CFG.mode:NET.lob&&NET.lob.cfg.mode)==='scen'?'':`<div class="rsec"><div class="rst">${T('zcls')}<small>${ZCLASS[CFG.zclass].d[L]}</small></div><div class="cards">${ZLIST.map(k=>`<div class="card z${CFG.zclass===k?' on':''}" data-act="${act}" data-v="zclass:${k}"><img src="${portrait('z_'+k,k==='brute'?52:62)}"><span>${ZCLASS[k].n[L]}</span></div>`).join('')}</div></div>`}`}
UI.buildSetup=function(){const L=LI();const row=(l,ctl)=>`<div class="fr"><label>${l}</label>${ctl}</div>`;
  $('setup').innerHTML=`<div class="win room"><div class="dpHead"><b>${L?'Create Room':'방 만들기'}</b><span>${L?'Bot match':'봇전'} · ${esc(myName())}</span><button class="x" data-act="back">✕</button></div>
    <div class="wbody"><div class="rform">
      ${row(L?'Room title':'방 제목',`<input id="roomT" class="tin" maxlength="24" value="${esc(CFG.room||(L?myName()+"'s room":myName()+'의 방'))}" autocomplete="off" spellcheck="false">`)}
      ${row(T('mode'),dd('set','mode',CFG.mode,OPT.mode()))}
      ${row(T('map'),dd('set','map',CFG.map,OPT.map()))}
      ${CFG.mode==='scen'?row(T('allies'),dd('set','scBots',CFG.scBots??3,[0,1,3,5,7].map(v=>[v,v+(L?' allies':'명')]))):row(T('bots'),dd('set','bots',CFG.bots,[[7,7],[11,11],[15,15],[19,19]].map(([v])=>[v,v+(L?' bots':'명')])))}
      ${row(T('diff'),`<button class="diffBtn d${CFG.diff}" data-act="diffopen"><span class="sk">${skulls(CFG.diff+1)}</span><b>${T('d'+CFG.diff)}</b><i>▸</i></button>`)}
      ${CFG.mode==='scen'?row(L?'Stages':'스테이지',`<span class="fixv">${L?'5 stages × 3 waves · 3 lives':'5스테이지 × 3웨이브 · 목숨 3개'}</span>`):row(T('rounds'),dd('set','rounds',CFG.rounds,OPT.rounds().map(([v])=>[v,v+(L?' rounds':'라운드')])))+row(T('rtime'),dd('set','time',CFG.time,OPT.time()))}
    </div><div class="rside">${roomPreview(CFG)}</div></div>
    <div class="wchars">${charPick('set')}</div>
    <div class="dpFoot"><button data-act="back">${T('cancel')}</button><button class="ok" data-act="go">${ICO.play} ${L?'Start game':'게임 시작'}</button></div></div>`;
  const ti=$('roomT');ti.addEventListener('input',()=>{CFG.room=ti.value.slice(0,24);saveCfg()});UI.wantSnap()};
// ---------- multiplayer waiting room ----------
UI.mpLobby=function(){const L=LI(),lb=NET.lob,H=NET.host,c=lb.cfg;UI.mpKey=JSON.stringify([lb.cfg,lb.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);
  const row=(l,k,opts)=>`<div class="fr"><label>${l}</label>${dd('mpset',k,c[k],opts,!H)}</div>`;
  const conn=[...NET.links.values()].find(l=>l.ok);const slots=[];for(let i=0;i<NET_MAXP;i++)slots.push(lb.pl[i]||null);
  $('lobby').innerHTML=`<div class="win room"><div class="dpHead"><b>${L?'Waiting Room':'게임 대기실'}</b><span>${L?'Room code':'방 코드'} <span class="mpcode">${esc(NET.code)}</span> <button class="mini" data-act="mpcopy">${T('mpCopy')}</button> · ${T('mpShare')}</span><button class="x" data-act="mpleave">✕</button></div>
    <div class="wbody"><div class="slots">${slots.map((p,i)=>p?`<div class="slot pl${p.k===NET.me?' me':''}"><span class="no">${i+1}</span><img src="${portrait('h_'+(HSKINS.includes(p.s)?p.s:'guard'),40)}"><div><b>${esc(p.n||'?')}</b>${p.k===NET.me?`<small>(${T('mpMe')})</small>`:''}<em>${i===0?'':(p.r?T('mpRelay')+' · ':'')+(p.p||0)+'ms'}</em></div>${i===0?`<span class="ht">${T('mpHost')}</span>`:'<span class="rd">READY</span>'}</div>`
        :`<div class="slot empty"><span class="no">${i+1}</span><div>${L?'Open':'빈 자리'}</div></div>`).join('')}<div class="sprev">${roomPreview(c)}</div></div>
      <div class="rside"><div class="rform">${row(T('mode'),'mode',OPT.mode())}${row(T('map'),'map',OPT.map())}${row(c.mode==='scen'?T('allies'):T('mpBots'),'bots',c.mode==='scen'?[[0,0],[1,1],[3,3],[5,5],[7,7]]:[[0,0],[4,4],[8,8],[12,12]])}${row(T('diff'),'diff',OPT.diff())}${c.mode==='scen'?'':row(T('rounds'),'rounds',OPT.rounds())+row(T('rtime'),'time',OPT.time())}</div>
        ${H?'':`<p class="hint">${T('mpOnlyHost')}</p>`}</div></div>
    <div class="wchars">${charPick('mpme')}</div>
    <div class="dpFoot"><span class="conn">${NET.kind==='room'?(conn&&conn.kind==='relay'?T('mpRelay')+(NET.relayWhy?' ('+relayWhyT(NET.relayWhy)+')':''):T('mpDirect'))+' · claude.ai':'PeerJS · '+T('mpDirect')} · ${lb.pl.length}/${NET_MAXP}</span><button data-act="mpleave">${T('mpLeave')}</button>${H?`<button class="ok" data-act="mpstart">${ICO.play} ${T('mpStart')}</button>`:`<span class="mpwait">${T('mpWait')}</span>`}</div></div>`;
  UI.show('lobby');UI.wantSnap()};
// slot pings are patched in place (a rebuild would eat clicks)
UI.mpRender=function(){if(UI.open==='mp'){const m=$('mpMsg');if(m)m.textContent=NET.msg||'';return}if(UI.open!=='lobby')return;
  const key=JSON.stringify([NET.lob.cfg,NET.lob.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);if(key!==UI.mpKey){UI.mpLobby();return}
  const ems=document.querySelectorAll('#lobby .slot.pl em');NET.lob.pl.forEach((p,i)=>{const e=ems[i];if(e&&i>0)e.textContent=(p.r?T('mpRelay')+' · ':'')+(p.p||0)+'ms'})};
// ---------- actions ----------
(function(){const act0=UI.act.bind(UI),show0=UI.show.bind(UI),res0=UI.showResults.bind(UI);
  UI.act=function(a,v,el){
    if(a==='mpset'&&v==='mode:scen'&&NET.host&&NET.lob)NET.lob.cfg.bots=3;
    if(a==='lobmap'){CFG.map=v;saveCfg();loadMapUI(v).then(()=>{if(UI.open==='menu')UI.buildTitle()});UI.buildTitle();return}
    if(a==='set'&&v&&v.startsWith('map:')){const id=v.slice(4);CFG.map=id;saveCfg();UI.buildSetup();loadMapUI(id).then(()=>{if(UI.open==='setup')UI.buildSetup()});return}
    return act0(a,v,el)};
  UI.show=function(id){show0(id);if(id==='menu'||id==='setup'||id==='lobby')UI.wantSnap()};
  UI.showResults=function(){recMatch();return res0()};
  const rs0=HUD.roundStart.bind(HUD);HUD.roundStart=function(){if(G.round<=1)G.recDone=false;return rs0()};
  document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.chg)return;AU.init();AU.play('ui',{vol:.5});UI.act(t.dataset.chg,t.dataset.k+':'+t.value)});})();
// ---------- options window: tabs (gameplay / keyboard / mouse / audio / video), live preview, OK · Cancel · Apply ----------
const XC={green:'#7dff6a',yellow:'#ffe14a',cyan:'#5ae8ff',white:'#ffffff',pink:'#ff6ad8'};
function applyXhair(){const c=$('cross');if(!c)return;c.style.setProperty('--xc',XC[CFG.xc]||XC.green);c.style.setProperty('--g',(CFG.xg||6)+'px')}
UI.optTab=UI.optTab||'game';if(CFG.xg==null)CFG.xg=6;if(CFG.tsens==null)CFG.tsens=1;if(CFG.tsz==null)CFG.tsz=1;for(const k of ['autoFire','aimAssist','leftFire','haptic'])if(CFG[k]==null)CFG[k]=true;if(CFG.tal==null)CFG.tal=.7;if(!CFG.touch)CFG.touch='auto';if(!CFG.xc)CFG.xc='green';
UI.buildOpts=function(){const L=LI(),t=UI.optTab;
  const tch=typeof TOUCH!=='undefined'&&TOUCH.on;const tabs=[['game',L?'Gameplay':'게임플레이'],['keys',tch?(L?'Controls':'조작법'):(L?'Keyboard':'키보드')],...(tch?[]:[['mouse',L?'Mouse':'마우스']]),['audio',L?'Audio':'오디오'],['video',L?'Video':'비디오']];
  const ck=(k,l,inv)=>{const on=inv?!CFG[k]:CFG[k]!==false&&!!CFG[k];return `<label class="ck${on?' on':''}" data-act="optck" data-v="${k}${inv?':inv':''}"><i></i>${l}</label>`};
  const sl=(k,l,min,max,step,fmt,lo,hi)=>`<div class="osl"><div class="oslh"><span>${l}</span><b id="ov_${k}">${fmt(CFG[k])}</b></div><input type="range" class="rng" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${CFG[k]}"><div class="ticks">${'<i></i>'.repeat(11)}</div><div class="oslf"><small>${lo}</small><small>${hi}</small></div></div>`;
  const sel=(k,l,opts)=>`<div class="osel"><span>${l}</span>${dd('opt',k,CFG[k],opts)}</div>`;
  let body='';
  if(t==='game')body=`<div class="og2"><div>${sel('lang',L?'Language':'언어',[['ko','한국어'],['en','English']])}
      <div class="osel"><span>${L?'Nickname':'닉네임'}</span><input id="optName" class="tin" maxlength="14" value="${esc(CFG.mpName||'')}" placeholder="${esc(myName())}" autocomplete="off" spellcheck="false"></div>
      ${sel('touch',L?'Touch controls':'터치 조작 (모바일)',[['auto',L?'Auto':'자동'],['on',L?'On':'켜기'],['off',L?'Off':'끄기']])}
      ${sel('xc',L?'Crosshair colour':'조준점 색상',[['green',L?'Green':'초록'],['yellow',L?'Yellow':'노랑'],['cyan',L?'Cyan':'하늘'],['white',L?'White':'흰색'],['pink',L?'Pink':'분홍']])}</div>
    <div>${ck('minimap',L?'Show radar':'레이더(미니맵) 표시')}${ck('autoFire',L?'Auto-fire on target (touch)':'자동 사격 (조준점에 적이 오면 발사)')}${ck('aimAssist',L?'Aim assist (touch)':'조준 보정 (적 쪽으로 살짝 끌림)')}${ck('leftFire',L?'Left fire button':'왼쪽 사격 버튼')}${ck('invert',L?'Invert look (Y)':'시점 상하 반전')}${ck('haptic',L?'Vibration':'진동')}${sl('tsens',L?'Touch look speed':'터치 시점 감도',.4,2.5,.1,v=>(+v).toFixed(1),L?'slow':'느리게',L?'fast':'빠르게')}${sl('tal',L?'Button opacity':'버튼 투명도',.25,1,.05,v=>Math.round(v*100)+'%','25%','100%')}${sl('tsz',L?'Button size':'버튼 크기',.75,1.35,.05,v=>Math.round(v*100)+'%','75%','135%')}${sl('xg',L?'Crosshair gap':'조준점 간격',2,14,1,v=>v+'px',L?'tight':'좁게',L?'wide':'넓게')}
      <div class="xprev" style="--xc:${XC[CFG.xc]||XC.green};--g:${CFG.xg||6}px"><i class="t"></i><i class="b"></i><i class="l"></i><i class="r"></i><i class="d"></i></div></div></div>`;
  else if(t==='keys'&&typeof TOUCH!=='undefined'&&TOUCH.on){const g=L?[['Left thumb','Move — the stick starts wherever you touch; push past half for full speed'],['Right drag','Look around — slow drags are precise, flicks turn far'],['◎ big button','Fire. Hold it and drag to aim while shooting'],['Auto','Aim near an enemy: the sight is pulled in and it fires for you (Options)'],['Aim','Scope / alt attack / hammer stance / soft bomb lob'],['↑ ↓','Jump · crouch (toggle)'],['↻','Reload'],['Bottom bar','Tap a weapon to equip · tap the one in hand to swap back (quick switch)'],['Buy','Shop · Quick buy = best rifle + armour + grenade in one tap'],['⚡','Zombie skill · CLASS picks the zombie class · NV night vision'],['≡ / Ⅱ','Hold for the scoreboard · pause'],['Dead','Tap fire to watch the next player']]
      :[['왼손','이동 — 왼쪽 아무 데나 대면 그 자리에 스틱, 반 이상 밀면 달리기'],['오른손 드래그','시점 — 천천히 끌면 정밀, 휙 그으면 크게 회전'],['◎ 큰 버튼','사격. 누른 채로 끌면 쏘면서 조준'],['자동','적 근처로 조준하면 끌려가면서 자동 사격 (옵션에서 끄기)'],['조준','저격 줌 · 보조 공격 · 해머 자세 · 폭탄 살짝 던지기'],['↑ ↓','점프 · 앉기(토글)'],['↻','재장전'],['아래 슬롯','무기 탭해서 교체 · 들고 있는 무기 다시 탭 = 챈샷'],['구매','상점 · 추천 구매 한 번에 소총+방탄+수류탄'],['⚡','좀비 스킬 · 클래스 = 좀비 종류 · NV 야간투시'],['≡ / Ⅱ','누르는 동안 점수판 · 일시정지'],['사망 시','사격 버튼으로 다른 사람 관전']];
    body=`<div class="tguide">${g.map(([k,d])=>`<div><b>${k}</b><span>${d}</span></div>`).join('')}</div><div class="rrule" style="margin-top:10px"><b>${T('rulesT')}</b><ul>${T('rules').map(r=>`<li>${r}</li>`).join('')}</ul></div>`}
  else if(t==='keys')body=`<table class="ktbl"><tr><th>${L?'Action':'설명'}</th><th>${L?'Key / button':'키/버튼'}</th></tr>${T('keys').map(([k,d])=>`<tr><td>${d}</td><td><kbd>${k}</kbd></td></tr>`).join('')}</table>
    <div class="rrule"><b>${T('rulesT')}</b><ul>${T('rules').map(r=>`<li>${r}</li>`).join('')}</ul></div>`;
  else if(t==='mouse')body=`<div class="og2"><div>${sl('sens',L?'Mouse sensitivity':'마우스 감도',.4,4,.1,v=>(+v).toFixed(1),L?'slow':'느리게',L?'fast':'빠르게')}</div><div>${ck('invert',L?'Invert mouse (Y)':'마우스 반전 (상하)')}</div></div>`;
  else if(t==='audio')body=`<div class="og2"><div>${sl('vol',L?'Master volume':'전체 볼륨',0,1,.05,v=>Math.round(v*100),'0','100')}</div><div>${ck('music',L?'Background music':'배경 음악')}</div></div>`;
  else body=`<div class="og2"><div>${sel('scale',L?'Render resolution':'렌더 해상도',[['auto',T('auto')],[.4,'40%'],[.5,'50%'],[.65,'65%'],[.8,'80%'],[1,'100%']])}
      ${sl('fov',L?'Field of view':'시야각 (FOV)',60,95,1,v=>v+'°','60','95')}</div>
    <div>${ck('bloom',L?'Bloom (glow)':'블룸 (빛 번짐)')}${ck('shadow',L?'Dynamic shadows':'실시간 그림자')}
      ${sl('gamma',L?'Brightness':'밝기',.6,1.2,.02,v=>Math.round((1.2-v)/.6*100),L?'dark':'어둡게',L?'bright':'밝게')}</div></div>
    <p class="onote">${L?'Note: lower the render resolution if the game stutters.':'참고: 게임이 끊기면 렌더 해상도를 낮춰 보세요.'}</p>`;
  $('opts').innerHTML=`<div class="win opt"><div class="dpHead"><b>${L?'Options':'옵션'}</b><span></span><button class="x" data-act="optcancel">✕</button></div>
    <div class="otabs">${tabs.map(([k,l])=>`<button class="${t===k?'on':''}" data-act="opttab" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="obody">${body}</div>
    <div class="dpFoot"><button class="ok" data-act="optok">${T('ok')}</button><button data-act="optcancel">${T('cancel')}</button><button data-act="optapply">${L?'Apply':'적용'}</button></div></div>`;
  for(const r of document.querySelectorAll('#opts .rng'))r.addEventListener('input',()=>{const k=r.dataset.k;CFG[k]=+r.value;UI.optLive();UI.optLbl(r)});
  const nm=$('optName');if(nm)nm.addEventListener('input',()=>{CFG.mpName=nm.value.trim().slice(0,14);});
  applyXhair()};
UI.optLbl=function(r){const L=LI(),k=r.dataset.k,v=+r.value,b=$('ov_'+k);if(!b)return;b.textContent=k==='tsz'?Math.round(v*100)+'%':k==='tal'?Math.round(v*100)+'%':k==='tsens'?v.toFixed(1):k==='sens'?v.toFixed(1):k==='vol'?Math.round(v*100):k==='fov'?v+'°':k==='xg'?v+'px':k==='gamma'?Math.round((1.2-v)/.6*100):v;
  if(k==='xg'){const p=document.querySelector('#opts .xprev');if(p)p.style.setProperty('--g',v+'px')}};
UI.optLive=function(){applyCfg();applyXhair();if(typeof TOUCH!=='undefined'){document.documentElement.style.setProperty('--tal',CFG.tal==null?.7:CFG.tal);TOUCH.apply()}};
(function(){const act1=UI.act;
  UI.act=function(a,v,el){
    if(a==='opts'||a==='help'){if(UI.open!=='opts'){UI.ret=UI.open;UI.optBak=JSON.stringify(CFG)}UI.optTab=a==='help'?'keys':(UI.optTab==='keys'?'game':UI.optTab);UI.buildOpts();UI.show('opts');return}
    if(a==='back'&&UI.open==='opts')a='optcancel';
    if(a==='opttab'){UI.optTab=v;UI.buildOpts();return}
    if(a==='optck'){const [k,inv]=v.split(':');CFG[k]=inv?!CFG[k]:!(CFG[k]!==false&&!!CFG[k]);UI.optLive();UI.buildOpts();return}
    if(a==='opt'&&v&&v.startsWith('lang:')){const l=v.slice(5);if(l!==LANG){LANG=l;LS.set('lang',LANG)}UI.buildOpts();return}
    if(a==='opt'){const i=v.indexOf(':'),k=v.slice(0,i),val=v.slice(i+1);CFG[k]=val==='true'?true:val==='false'?false:isNaN(+val)?val:+val;UI.optLive();UI.buildOpts();return}
    if(a==='optapply'||a==='optok'){saveCfg();UI.optBak=JSON.stringify(CFG);if(a==='optok')UI.optClose();return}
    if(a==='optcancel'){if(UI.optBak){const b=JSON.parse(UI.optBak);for(const k in b)CFG[k]=b[k];UI.optLive()}UI.optClose();return}
    return act1(a,v,el)};
  UI.optClose=function(){UI.show(UI.ret||'menu');UI.ret=null;if(UI.open==='menu')UI.buildTitle();else if(UI.open==='pause')UI.buildPause();else if(UI.open==='setup')UI.buildSetup()};
  const ac0=applyCfg;applyCfg=function(){ac0();applyXhair()};})();

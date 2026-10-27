'use strict';
// ============ v6.57: achievements (업적) and titles (칭호) ============
// The server keeps both (schema.sql v6.57): ach_defs lists every tier of every achievement (its goal, coins, All-Clear decoders and the
// title it gives), qz_achievements reads the numbers (the record, the chapters and the counters qz_claim / qz_round_claim add up),
// qz_ach_claim pays a tier once (or every tier waiting), qz_title_wear sets the title worn. This file names them, draws the two pages
// of the mission / ranking window (업적 · 칭호), the lobby button, the results line, counts what only the game sees in a match (melee
// kills, cures, marks, supply crates, bombs planted and defused: p_ach of qz_claim) and shows the title worn next to a name everywhere a
// hall-of-fame title showed (hof.js) — the same places, one title: an achievement title or a first-clear one.
// Another player's title comes with their hello (tt + the account nickname, net.js) and shows only when the server says that nickname
// wears it (qz_titles_of, asked once for each name); a page from before v6.57 sends no tt and keeps its hall-of-fame title the old way.

// ---------- the achievements: categories, ladders (names come from here, numbers from the server) ----------
const ACH_ICO={
  all:'<path d="M8 0l2.3 4.9 5.2.6-3.9 3.6 1.1 5.2L8 11.6 3.3 14.3l1.1-5.2L.5 5.5l5.2-.6z"/>',
  combat:'<path d="M7.2 0h1.6v2.6a5.6 5.6 0 014.6 4.6H16v1.6h-2.6a5.6 5.6 0 01-4.6 4.6V16H7.2v-2.6a5.6 5.6 0 01-4.6-4.6H0V7.2h2.6a5.6 5.6 0 014.6-4.6zM8 4.2a3.8 3.8 0 100 7.6 3.8 3.8 0 000-7.6zm0 2.5a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6z"/>',
  zombie:'<path d="M2.2 1h2l3.4 14h-2zM6.6 1h2l2.8 14h-2zM11 1h2l2 14h-2z"/>',
  survive:'<path d="M8 0l7 2.6v5C15 11.6 12.1 14.7 8 16 3.9 14.7 1 11.6 1 7.6v-5z"/>',
  chapter:'<path d="M2 0h1.6v16H2zM4.4 1h9.8l-2.5 3.7 2.5 3.7H4.4z"/>',
  pvp:'<path d="M1.5 1h2.6l7.2 7.2-1.3 1.3L1.5 3.6zM14.5 1h-2.6L4.7 8.2 6 9.5l8.5-5.9zM3.2 10l2.8 2.8-1.4 1.4-.9-.9L2 14.9 1.1 14l1.6-1.6-.9-.9zM12.8 10L10 12.8l1.4 1.4.9-.9 1.7 1.6.9-.9-1.6-1.6.9-.9z"/>',
  growth:'<path d="M8 1l6.5 6.5H10V15H6V7.5H1.5z"/>',
  supply:'<path d="M1 4.2L8 1l7 3.2v7.6L8 15l-7-3.2zm2 1.6v5l4.1 1.9V7.7zm10 0L8.9 7.7v5l4.1-1.9zM8 2.9L3.9 4.8 8 6.6l4.1-1.8z"/>'};
const achIco=(k,cls)=>`<svg class="${cls||'aico'}" viewBox="0 0 16 16" aria-hidden="true"><g fill="currentColor">${ACH_ICO[k]||ACH_ICO.all}</g></svg>`;
const ACH_CAT=[['all','전체','All'],['combat','전투','Combat'],['zombie','좀비','Zombie'],['survive','생존','Survival'],['chapter','챕터','Chapters'],['pvp','대인전','PvP'],['growth','성장','Growth'],['supply','보급 무기','Crate guns']];
// one ladder: its category, name, and what a tier asks (n = the goal, already written as a number)
const ACH_GRP={
  kill:{c:'combat',n:['처치','Kills'],d:n=>[`적 ${n}명 처치`,`Kill ${n} enemies`]},
  hs:{c:'combat',n:['헤드샷','Headshots'],d:n=>[`헤드샷으로 ${n}킬`,`${n} headshot kills`]},
  dmg:{c:'combat',n:['피해량','Damage'],d:n=>[`누적 피해량 ${n}`,`Deal ${n} damage in all`]},
  knife:{c:'combat',n:['근접 처치','Melee kills'],d:n=>[`근접무기로 ${n}킬`,`${n} kills with a melee weapon`]},
  mvp:{c:'combat',n:['MVP','MVP'],d:n=>[`매치 MVP ${n}번`,`Be the match MVP ${n} times`]},
  inf:{c:'zombie',n:['감염','Infections'],d:n=>[`좀비로 인간 ${n}명 감염`,`Infect ${n} humans as a zombie`]},
  zw:{c:'zombie',n:['좀비의 승리','Zombie victories'],d:n=>[`좀비로 라운드 ${n}번 승리`,`Win ${n} rounds as a zombie`]},
  surv:{c:'survive',n:['생존','Survival'],d:n=>[`인간으로 라운드 끝까지 ${n}번 살아남기`,`Live through ${n} rounds as a human`]},
  win:{c:'survive',n:['인간 승리','Human victories'],d:n=>[`진화 감염 · 클래식 감염 매치 ${n}번 승리`,`Win ${n} Evolved Infection / Classic Infection matches`]},
  ep:{c:'chapter',n:['챕터 정복','Chapters'],d:n=>[`서로 다른 챕터 ${n}개 클리어`,`Clear ${n} different chapters`]},
  eph:{c:'chapter',n:['고난도 정복','Hard chapters'],d:n=>[`어려움 이상으로 챕터 ${n}개 클리어`,`Clear ${n} chapters on hard or expert`]},
  epx:{c:'chapter',n:['전문가','Expert chapters'],d:n=>[`전문가 난이도로 챕터 ${n}개 클리어`,`Clear ${n} chapters on expert`]},
  medal:{c:'chapter',n:['S 메달','S medals'],d:n=>[`챕터 S 메달 ${n}개`,`${n} S medals in the chapters`]},
  hof:{c:'chapter',n:['명예의 전당','Hall of fame'],d:()=>['챕터 최초 클리어 팀에 이름 올리기','Be on a first-clear team']},
  // (v7.0: the seasons, epseason.js — each tier of 시즌 2 완주 reads a number of its own: any difficulty, hard or expert, expert)
  s2c:{c:'chapter',n:['시즌 2 완주','Season 2 complete'],d:(n,t)=>t>=3?['6~10챕터를 모두 전문가로 클리어','Clear chapters 6–10, all of them, on expert']
    :t>=2?['6~10챕터를 모두 어려움 이상으로 클리어','Clear chapters 6–10, all of them, on hard or expert']:['시즌 2 — 6~10챕터를 모두 클리어 (난이도 무관)','Season 2 — clear chapters 6–10, all of them (any difficulty)']},
  tags:{c:'chapter',n:['1차 회수팀','Recovery Team 1'],d:()=>['1차 회수팀 일곱 명을 모두 쓰러뜨리기 (2 · 4 · 6~10챕터 보스)','Bring down all seven of RT-1 (the bosses of chapters 2, 4 and 6–10)']},
  pk:{c:'pvp',n:['대인전 처치','PvP kills'],d:n=>[`대인전에서 ${n}킬`,`${n} kills in PvP`]},
  pw:{c:'pvp',n:['대인전 승리','PvP wins'],d:n=>[`대인전 매치 ${n}번 승리`,`Win ${n} PvP matches`]},
  rw:{c:'pvp',n:['무기 레이스 우승','Gun race wins'],d:n=>[`무기 레이스 ${n}번 우승`,`Win ${n} arms races`]},
  bomb:{c:'pvp',n:['폭파 임무','Bomb missions'],d:n=>[`폭탄 설치 · 해체 ${n}번`,`Plant or defuse the bomb ${n} times`]},
  lv:{c:'growth',n:['레벨','Level'],d:n=>[`레벨 ${n} 달성`,`Reach level ${n}`]},
  games:{c:'growth',n:['매치','Matches'],d:n=>[`매치 ${n}판 끝까지 하기`,`Finish ${n} matches`]},
  hours:{c:'growth',n:['플레이 시간','Time played'],d:n=>[`매치에서 ${n}시간 플레이`,`Play ${n} hours of matches`]},
  guns:{c:'growth',n:['무기 수집','Arsenal'],d:n=>[`무기 ${n}종 보유`,`Own ${n} weapons`]},
  cure:{c:'supply',n:['백신 치료','Cures'],d:n=>[`Q7 백신 발사기로 좀비 ${n}명 치료`,`Cure ${n} zombies with the Q7`]},
  mark:{c:'supply',n:['사냥꾼 표식','Hunter\'s marks'],d:n=>[`블러드하운드로 좀비 ${n}마리 표식`,`Mark ${n} zombies with the Bloodhound`]},
  crate:{c:'supply',n:['보급','Supplies'],d:n=>[`보급상자 ${n}개 열기`,`Open ${n} supply crates`]}};
const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX'];
// ---------- the titles: name and grade (1 common … 5 legendary); a hall-of-fame title is 'hof:<ep*10+diff>' ----------
const TITLES={
  hunter:{n:['좀비 사냥꾼','Zombie Hunter'],g:2},slayer:{n:['학살자','Slayer'],g:4},reaper:{n:['종말의 사신','Reaper of the End'],g:5},
  marksman:{n:['명사수','Marksman'],g:2},oneshot:{n:['원샷 원킬','One Shot, One Kill'],g:4},
  firepower:{n:['화력 지원','Fire Support'],g:3},artillery:{n:['인간 포대','Human Artillery'],g:4},
  blade:{n:['칼잡이','Blade'],g:2},bladedance:{n:['칼날의 춤','Dance of Blades'],g:4},
  ace:{n:['에이스','Ace'],g:3},dominator:{n:['전장의 지배자','Lord of the Field'],g:4},
  plague:{n:['전염병','Plague'],g:2},pandemic:{n:['대유행','Pandemic'],g:3},patientzero:{n:['최초 감염자','Patient Zero'],g:5},
  horde:{n:['굶주린 무리','Hungry Horde'],g:2},legion:{n:['종말의 군단','Legion of the End'],g:4},
  survivor:{n:['생존자','Survivor'],g:2},immortal:{n:['불사신','Immortal'],g:4},lasthuman:{n:['최후의 인류','Last of Mankind'],g:5},
  resistance:{n:['저항군','Resistance'],g:3},hero:{n:['격리구역의 영웅','Hero of the Zone'],g:4},
  liberator:{n:['Q-7 해방자','Liberator of Q-7'],g:4},hellwalker:{n:['지옥에서 돌아온 자','Back from Hell'],g:4},
  expert:{n:['전문가','Expert'],g:4},nightmare:{n:['Q-7의 악몽','Nightmare of Q-7'],g:5},
  flawless:{n:['완벽주의자','Perfectionist'],g:3},perfect:{n:['무결점','Flawless'],g:5},
  rt2:{n:['2차 회수팀','Recovery Team 2'],g:3},unyielding:{n:['포기하지 않는 자','The Unyielding'],g:4},dawn:{n:['Q-7의 새벽','Dawn of Q-7'],g:5},dogtags:{n:['일곱 개의 군번줄','Seven Dog Tags'],g:4},
  gunslinger:{n:['총잡이','Gunslinger'],g:2},duelist:{n:['결투의 달인','Duel Master'],g:4},
  merc:{n:['용병','Mercenary'],g:3},warhound:{n:['전쟁의 개','Dog of War'],g:4},armsmaster:{n:['무기 마스터','Arms Master'],g:4},
  demolition:{n:['폭파 전문가','Demolitions Expert'],g:3},
  recruit:{n:['신병','Recruit'],g:1},veteran:{n:['베테랑','Veteran'],g:2},elite:{n:['엘리트','Elite'],g:3},oldguard:{n:['백전노장','Old Guard'],g:4},
  regular:{n:['단골손님','Regular'],g:2},resident:{n:['격리구역 주민','Zone Resident'],g:3},legend:{n:['격리구역의 전설','Legend of the Zone'],g:5},
  nightshift:{n:['야간 근무','Night Shift'],g:2},oldtimer:{n:['터줏대감','Old-Timer'],g:4},
  collector:{n:['수집가','Collector'],g:2},arsenal:{n:['걸어 다니는 무기고','Walking Arsenal'],g:4},
  medic:{n:['백신 의사','Vaccine Doctor'],g:3},savior:{n:['구원의 손길','Saving Hand'],g:4},
  tracker:{n:['추적자','Tracker'],g:3},supply:{n:['보급병','Supply Runner'],g:2}};
const TT_GRADE=[null,['일반','Common'],['고급','Uncommon'],['희귀','Rare'],['영웅','Epic'],['전설','Legendary']];
const SVG_MEDAL='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3.5 0h3l1.5 3.6L9.5 0h3l-2.6 5.4A5.4 5.4 0 118 5a5.6 5.6 0 00-1.9.4zM8 6.6a3.9 3.9 0 100 7.8 3.9 3.9 0 000-7.8zm0 1.5l.9 1.9 2 .2-1.5 1.4.4 2L8 12.6l-1.8 1 .4-2-1.5-1.4 2-.2z"/></svg>';
const SVG_TAG='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M0 2.6A1.6 1.6 0 011.6 1h6.6L16 8.4 8.6 16 0 8.6zm3.9 1.2a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z"/></svg>';

// ---------- the titles: what each reads as, and who wears which ----------
const TTL={vc:{},q:new Set(),qt:0,off:false,ver:1,
  isHof(t){return typeof t==='string'&&/^hof:\d{2,3}$/.test(t)&&HOF.valid(+t.slice(4))},// (v7.0: 3 digits — chapter 10 on: hof:103)
  valid(t){return this.isHof(t)||!!(t&&TITLES[t])},
  grade(t){return this.isHof(t)?6:TITLES[t]?TITLES[t].g:0},
  name(t,L){if(this.isHof(t))return HOF.name(+t.slice(4),L);const T0=TITLES[t];return T0?T0.n[L?1:0]:''},
  full(t,L){if(this.isHof(t))return HOF.full(+t.slice(4),L);const T0=TITLES[t];return T0?`${T0.n[L?1:0]} · ${TT_GRADE[T0.g][L?1:0]}`:''},
  // mine: what the server says (v6.57: me.title, null = none); a database from before it: the hall-of-fame title
  mine(){if(typeof ACC==='undefined'||!ACC.on||!ACC.me)return null;const me=ACC.me;if(me.title!==undefined)return this.valid(me.title)?me.title:null;
    const c=HOF.mine();return c?'hof:'+c:null},
  // what this page tells the others: the hall-of-fame code (pages from before v6.57 read it) and the title worn (tt: '' = nothing)
  hello(){const o=HOF.hello();if(ACC.on&&ACC.me&&ACC.me.title!==undefined&&ACC.signed()){const t=this.mine();o.tt=t||'';if(t)o.an=String(ACC.me.nickname||'').slice(0,16)}return o},
  // someone else's: an actor (ttC from the roster, hofC / hofN), a waiting-room player (tt, f, an), a chat line (tt, f, an)
  of(x){if(!x)return null;if(x.isPlayer||NET.on&&x.k&&x.k===NET.me)return this.mine();
    const tt=x.ttC!==undefined?x.ttC:x.tt,an=x.hofN!=null?x.hofN:x.an;
    if(tt===undefined||tt===null){const c=HOF.of(x);return c?'hof:'+c:null}// (a page from before v6.57: its hall-of-fame title, the old way)
    return tt&&this.ok(tt,an)?tt:null},
  line(l){if(l.me)return this.mine();if(l.tt===undefined||l.tt===null){const c=HOF.line(l);return c?'hof:'+c:null}return l.tt&&this.ok(l.tt,l.an)?l.tt:null},
  // a row the server wrote (ranking, friends, invites): tt (v6.57), else the hall-of-fame code ft
  row(x){if(!x)return null;if('tt' in x)return this.valid(x.tt)?x.tt:null;return HOF.valid(x.ft)?'hof:'+x.ft:null},
  // another player's claim holds when the server says that account nickname wears it (asked once a name, kept 5 minutes); until it
  // answers, a hall-of-fame title stands on the hall of fame's own list
  ok(t,an){if(!this.valid(t)||!an)return false;const v=this.vc[an];
    if(v&&v.ts)return v.ts.includes(t);if(this.isHof(t)&&HOF.ok(+t.slice(4),an))return true;if(!v)this.want(an);return false},
  want(an){if(!ACC.on||this.off)return;const v=this.vc[an];if(v&&Date.now()-v.at<300e3)return;this.vc[an]={pend:1,at:Date.now()};this.q.add(an);
    if(!this.qt)this.qt=setTimeout(()=>this.flush(),250)},
  flush(){this.qt=0;const A=[...this.q],L0=A.slice(0,16);this.q=new Set(A.slice(16));if(this.q.size)this.qt=setTimeout(()=>this.flush(),250);if(!L0.length)return;
    ACC.titlesOf(L0).then(r=>{for(const n of L0)this.vc[n]={ts:r&&Array.isArray(r[n])?r[n]:[],at:Date.now()};this.ver++;this.changed()},
      e=>{if(/Could not find the function|PGRST202/i.test(String(e&&e.message||'')+' '+String(e&&e.code||'')))this.off=true;for(const n of L0)this.vc[n]={ts:null,at:Date.now()};this.ver++;this.changed()})},
  changed(){try{this.slots()}catch(e){console.error(e)}},
  // ---- how it shows ----
  // a chip next to a name (cls: sm = the small one of lists, pf = the lobby profile; long: the grade / "first clear" too)
  chip(t,cls,long){if(!this.valid(t))return '';const L=LI();
    if(this.isHof(t)){const c=+t.slice(4);return `<span class="hoft${cls?' '+cls:''}" data-t="${t}" title="${esc(HOF.full(c,L))}">${SVG_CROWN}<b>${esc(long?HOF.full(c,L):HOF.name(c,L))}</b></span>`}
    const g=this.grade(t);return `<span class="ttl g${g}${cls?' '+cls:''}" data-t="${t}" title="${esc(this.full(t,L))}"><i>◆</i><b>${esc(this.name(t,L))}</b>${long?`<em>${esc(TT_GRADE[g][L?1:0])}</em>`:''}</span>`},
  // the tables (scoreboard, results): a small mark with the title as its tooltip
  mini(t){if(!this.valid(t))return '';if(this.isHof(t))return HOF.crown(+t.slice(4));return `<i class="ttm g${this.grade(t)}" title="${esc(this.full(t,LI()))}">◆</i>`},
  // over a player's head
  tag(t){const L=LI();if(this.isHof(t))return `<small class="hn">${SVG_CROWN}${esc(HOF.name(+t.slice(4),L))}</small>`;return `<small class="hn tg${this.grade(t)}">◆ ${esc(this.name(t,L))}</small>`},
  // the lobby: under my name (opens the titles page)
  prof(){const pf=document.querySelector('#menu .lobTop .prof > div');if(!pf)return;const old=pf.querySelector('.hoft.pf,.ttl.pf'),t=this.mine();
    if(!t){if(old)old.remove();return}if(old&&old.dataset.t===t)return;const h=this.chip(t,'pf',this.isHof(t)).replace('<span ','<span data-act="ttl" ');
    if(old)old.outerHTML=h;else pf.insertAdjacentHTML('beforeend',h)},
  // the waiting room: a chip under each titled player's name
  slots(){const lb=NET.lob;if(!lb||UI.open!=='lobby')return;
    document.querySelectorAll('#lobby .slot.pl').forEach((el,i)=>{const p=lb.pl[i],t=p?this.of(p):null,b=el.querySelector('div > b');if(!b)return;const s=el.querySelector('.hoft,.ttl');
      if(!t){if(s)s.remove();return}if(s&&s.dataset.t===t)return;if(s)s.remove();b.insertAdjacentHTML('afterend',this.chip(t,'sm'))})}};

// ---------- the account: achievements, titles ----------
Object.assign(ACC,{
  async loadAch(){const r=await this.rpc('qz_achievements');this.ach={...r,at:Date.now()};const me=this.me;
    if(me){me.achReady=r.ready|0;me.title=r.worn||null;me.titleSet=r.title||null;this.ls('qz_me',{...this.ls('qz_me'),title:me.title})}this.emit();return this.ach},
  // one tier (id) or every tier waiting (null) → {got, got_tickets, ids, titles, coins, tickets, ach}
  async achClaim(id){const r=await this.rpc('qz_ach_claim',{p_id:id||null});this.ach={...r.ach,at:Date.now()};const me=this.me;
    if(me){me.coins=r.coins;me.tickets=r.tickets|0;me.earned=(me.earned||0)+(r.got|0);me.achReady=r.ach.ready|0;me.title=r.ach.worn||null;me.titleSet=r.ach.title||null;this.saveMe();this.ls('qz_me',{...this.ls('qz_me'),title:me.title})}
    this.emit();return r},
  // the title to wear: an id, 'none', or null (automatic) → {title, worn}
  async titleWear(t){const r=await this.rpc('qz_title_wear',{p_title:t==null?null:t});const me=this.me;
    if(me){me.title=r.worn||null;me.titleSet=r.title||null;this.ls('qz_me',{...this.ls('qz_me'),title:me.title})}if(this.ach){this.ach.title=r.title;this.ach.worn=r.worn}this.emit();return r},
  titlesOf(names){return this.rpc('qz_titles_of',{p_names:names})}});

// ---------- the achievements page and the titles page (the mission / ranking window, rank.js) ----------
const ACH={cat:'all',res:null,
  // the ladders as the server lists them, in its order, with what each stands at
  // (v7.0: each tier reads its own number, d.v — 시즌 2 완주's three read three; the card shows the next tier's)
  groups(){const A=ACC.ach;if(!A||!Array.isArray(A.defs))return [];const S=A.stats||{},cl=new Set(A.claimed||[]),G0=[],gi={};
    for(const d of A.defs){let g=gi[d.grp];if(!g){g=gi[d.grp]={id:d.grp,stat:d.stat,tiers:[]};G0.push(g)}g.tiers.push(d)}
    for(const g of G0){g.tiers.sort((a,b)=>a.tier-b.tier);for(const d of g.tiers)d.v=+S[d.stat]||0;g.next=g.tiers.find(d=>!cl.has(d.id))||null;const cur=g.next||g.tiers[g.tiers.length-1];
      g.stat=cur?cur.stat:g.stat;g.v=cur?cur.v:0;g.done=!g.next;g.ready=!!g.next&&g.next.v>=g.next.goal;
      g.nReady=g.tiers.filter(d=>!cl.has(d.id)&&d.v>=d.goal).length;g.got=g.tiers.filter(d=>cl.has(d.id)).length;g.cl=cl}
    return G0},
  num(g,v){return g.stat==='lv'?'Lv.'+fmtC(v):g.stat==='hours'?fmtC(v)+(LI()?' h':'시간'):fmtC(v)},
  rw(d,L){if(!d)return '';const t=d.title&&TITLES[d.title]?TTL.chip(d.title,'sm'):'';
    return `${d.coins?`<span class="arc">${COIN}${fmtC(d.coins)}</span>`:''}${d.tickets?`<span class="mtk" title="${L?'All-Clear decoder':'격리해제 해독기'}">${decoderSvg('tki')}×${d.tickets}</span>`:''}${t}`},
  // ---- 업적 ----
  page(){const L=LI(),A=ACC.ach;let body,top='';
    if(!ACC.on)body=`<div class="rkempty">${L?'Achievements open once accounts are set up.':'계정 서버가 연결되면 업적을 볼 수 있어요.'}</div>`;
    else if(!ACC.signed())body=`<div class="rkempty">${L?'Sign in for achievements — coins, All-Clear decoders and titles for what you have done (your record so far counts).':'로그인하면 업적 — 지금까지의 기록도 그대로 쳐서 코인 · 격리해제 해독기 · 칭호를 받아요.'}<button class="sbb" data-ra="login">${L?'Sign in':'로그인'}</button></div>`;
    else if(!A)body=`<div class="rkempty">${RKW.load.ach?(L?'Loading…':'불러오는 중…'):''}</div>`;
    else{const G0=this.groups(),cat=this.cat,all=A.defs.length,got=(A.claimed||[]).filter(id=>A.defs.some(d=>d.id===id)).length,ready=G0.reduce((s,g)=>s+g.nReady,0);
      const catReady=c=>G0.some(g=>g.nReady>0&&(c==='all'||(ACH_GRP[g.id]||{}).c===c));
      top=`<div class="achTop"><div class="achSum">${achIco('all','aico big')}<div><b>${fmtC(got)}<small> / ${fmtC(all)}</small></b><span>${L?'tiers done':'단계 달성'}</span></div></div>
        <div class="achBar"><u style="width:${Math.round(got/Math.max(1,all)*100)}%"></u></div>
        <button class="achAll" data-ra="aclaim" data-v=""${ready&&!RKW.busy?'':' disabled'}>${ready?(L?`Claim all (${ready})`:`모두 받기 (${ready})`):(L?'Nothing to claim':'받을 보상 없음')}</button></div>
        <div class="stabs"><div class="stl">${ACH_CAT.map(([id,ko,en])=>`<button class="${id===cat?'on':''}" data-ra="acat" data-v="${id}">${achIco(id)}${L?en:ko}${catReady(id)?'<i class="dot"></i>':''}</button>`).join('')}</div></div>`;
      const shown=G0.filter(g=>cat==='all'||(ACH_GRP[g.id]||{}).c===cat).sort((a,b)=>(b.ready-a.ready)||(a.done-b.done));
      body=shown.length?shown.map(g=>this.card(g,L)).join(''):`<div class="rkempty">${L?'Nothing here.':'없어요.'}</div>`}
    return `${top}<div class="mbody achL">${body}${RKW.msg&&(RKW.page==='ach')?`<div class="sbm ${RKW.msgOk?'ok':'bad'}">${esc(RKW.msg)}</div>`:''}</div>
      <div class="sfoot">${L?'The numbers move when a match (or a round) ends and its reward is paid, with the same limits as the coins; kills, infections, matches, level, time, guns and chapters come from your record as it stands. Achievement coins do not count toward the daily limit.'
        :'진행도는 매치(라운드)가 끝나 보상을 받을 때 코인과 같은 기준으로 올라가고, 킬 · 감염 · 판 수 · 레벨 · 플레이 시간 · 보유 무기 · 챕터는 지금까지의 기록을 그대로 읽어요. 업적 코인은 하루 보상 한도와 따로예요.'}</div>`},
  card(g,L){const M=ACH_GRP[g.id]||{c:'all',n:[g.id,g.id],d:n=>[n,n]},d=g.next||g.tiers[g.tiers.length-1],goal=d?d.goal:1,
      p=g.done?1:Math.min(1,g.v/Math.max(1,goal)),desc=M.d(this.num(g,goal),d?d.tier:1)[L?1:0];
    const pips=g.tiers.map(t=>`<i class="${g.cl.has(t.id)?'on':t.v>=t.goal?'rd':''}" title="${ROMAN[t.tier]}"></i>`).join('');
    return `<div class="achC c${M.c}${g.ready?' ready':''}${g.done?' done':''}"><div class="achI">${achIco(M.c)}</div>
      <div class="achT"><b>${esc(M.n[L?1:0])} <em>${ROMAN[d?d.tier:1]}</em></b><small>${esc(desc)}</small>
        <div class="achP">${pips}</div><div class="achB"><u style="width:${Math.round(p*100)}%"></u></div><span class="achN">${g.done?(L?'All done':'모두 달성'):`${this.num(g,Math.min(g.v,goal))} / ${this.num(g,goal)}`}</span></div>
      <div class="achR">${g.done?'':this.rw(d,L)}</div>
      <button class="mcl" data-ra="aclaim" data-v="${g.ready?d.id:''}"${g.ready&&!RKW.busy?'':' disabled'}>${g.done?(L?'Done ✔':'완료 ✔'):g.ready?(L?'Claim':'보상 받기'):(L?'In progress':'진행 중')}</button></div>`},
  async claim(id){if(RKW.busy)return;const L=LI();RKW.busy=true;RKW.msg='';RKW.render();
    try{const r=await ACC.achClaim(id||null),parts=[];if(r.got)parts.push(`+${fmtC(r.got)} ${L?'coins':'코인'}`);if(r.got_tickets)parts.push(`${L?'All-Clear decoder':'격리해제 해독기'} +${r.got_tickets}`);
      const tn=(r.titles||[]).filter(t=>TITLES[t]).map(t=>`「${TTL.name(t,L)}」`);if(tn.length)parts.push((L?'new title ':'새 칭호 ')+tn.join(' '));
      RKW.msg=(L?'Reward: ':'보상 — ')+parts.join(' · ');RKW.msgOk=true;AU.play('buy',{vol:.8});if(tn.length)AU.play('lvlup',{vol:.55})}
    catch(e){const m=String(e&&e.message||'');RKW.msg=/not_done/.test(m)?(L?'Not reached yet':'아직 달성하지 못했어요'):ACC.errText(e);RKW.msgOk=false;AU.play('dry',{vol:.5});if(/not_done|already_claimed/.test(m))ACC.loadAch().catch(()=>{})}
    RKW.busy=false;RKW.render()},
  // ---- 칭호 ----
  ttlPage(){const L=LI(),A=ACC.ach;let body,top='';
    if(!ACC.on)body=`<div class="rkempty">${L?'Titles open once accounts are set up.':'계정 서버가 연결되면 칭호를 볼 수 있어요.'}</div>`;
    else if(!ACC.signed())body=`<div class="rkempty">${L?'Sign in to earn titles and wear one next to your name.':'로그인하면 칭호를 얻고 이름 옆에 달 수 있어요.'}<button class="sbb" data-ra="login">${L?'Sign in':'로그인'}</button></div>`;
    else if(!A)body=`<div class="rkempty">${RKW.load.ach?(L?'Loading…':'불러오는 중…'):''}</div>`;
    else{const cl=new Set(A.claimed||[]),src={},own=[];
      for(const d of A.defs||[])if(d.title&&TITLES[d.title]){const s=src[d.title];if(!s||cl.has(d.id)&&!s.has)src[d.title]={d,has:cl.has(d.id)}}
      for(const c of HOF.myList())own.push({t:'hof:'+c,src:L?'Hall of fame':'명예의 전당'});
      for(const t in src)if(src[t].has)own.push({t,src:this.srcName(src[t].d,L)});
      own.sort((a,b)=>TTL.grade(b.t)-TTL.grade(a.t));
      const locked=Object.keys(src).filter(t=>!src[t].has).sort((a,b)=>TTL.grade(b)-TTL.grade(a)||(src[a].d.ord-src[b].d.ord));
      const worn=A.worn||null,set=A.title,auto=set==null,none=set==='none';
      top=`<div class="ttNow"><span>${L?'Wearing':'착용 중'}</span>${worn?TTL.chip(worn,'',true):`<i class="ttNo">${L?'no title':'칭호 없음'}</i>`}<small>${auto?(L?'(automatic: the rarest you have)':'(자동: 가진 것 중 가장 높은 등급)'):''}</small><span class="sgap"></span>
        <button data-ra="wear" data-v="auto"${auto||RKW.busy?' disabled':''}>${L?'Automatic':'자동'}</button><button data-ra="wear" data-v="none"${none||RKW.busy?' disabled':''}>${L?'Hide':'숨기기'}</button></div>`;
      const item=(o,has)=>`<div class="ttI${has?'':' lk'}${has&&worn===o.t&&!auto?' on':''}">${TTL.chip(o.t,'',true)}<small>${esc(o.src)}</small>${has?`<button data-ra="wear" data-v="${o.t}"${(worn===o.t&&!auto)||RKW.busy?' disabled':''}>${worn===o.t&&!auto?(L?'Worn':'착용 중'):(L?'Wear':'착용')}</button>`:`<em>${L?'locked':'잠김'}</em>`}</div>`;
      body=`<div class="ttH">${L?`Your titles (${own.length})`:`보유한 칭호 (${own.length})`}</div>${own.length?`<div class="ttG">${own.map(o=>item(o,true)).join('')}</div>`:`<div class="rkempty sm">${L?'None yet — titles come with some achievement tiers.':'아직 없어요 — 업적의 몇몇 단계를 달성하면 칭호가 생겨요.'}</div>`}
        <div class="ttH">${L?`Still to earn (${locked.length})`:`아직 못 얻은 칭호 (${locked.length})`}</div><div class="ttG">${locked.map(t=>item({t,src:this.srcName(src[t].d,L)},false)).join('')}</div>`}
    return `${top}<div class="mbody ttL">${body}${RKW.msg&&(RKW.page==='ttl')?`<div class="sbm ${RKW.msgOk?'ok':'bad'}">${esc(RKW.msg)}</div>`:''}</div>
      <div class="sfoot">${L?'One title shows next to your name: in the lobby, the waiting room, over your head, in chat, on the scoreboard, the ranking and friend lists. Automatic wears the rarest one you have (a hall-of-fame title first).'
        :'칭호 하나가 이름 옆에 붙어요: 로비 · 대기실 · 머리 위 · 채팅 · 점수판 · 랭킹 · 친구 목록. 자동은 가진 것 중 가장 높은 등급을 달아요 (명예의 전당 칭호가 먼저).'}</div>`},
  srcName(d,L){const M=ACH_GRP[d.grp];return (M?M.n[L?1:0]:d.grp)+' '+ROMAN[d.tier]},
  async wear(v){if(RKW.busy)return;const L=LI();RKW.busy=true;RKW.msg='';RKW.render();
    try{const r=await ACC.titleWear(v==='auto'?null:v);RKW.msg=r.worn?(L?'Now wearing ':'이제 이 칭호를 달아요 — ')+TTL.name(r.worn,L):(L?'No title shown':'칭호를 숨겼어요');RKW.msgOk=true;AU.play('ui',{vol:.45});TTL.prof()}
    catch(e){RKW.msg=ACC.errText(e);RKW.msgOk=false;AU.play('dry',{vol:.5})}
    RKW.busy=false;RKW.render()},
  // ---- the results: the tiers this match reached (under the coin box) ----
  resHtml(){const r=this.res;if(!r||!r.ids.length)return '';const L=LI();
    return `<b class="arh">${SVG_MEDAL}${L?'Achievements':'업적 달성!'}</b>${r.ids.map(id=>{const m=/^(.*?)(\d+)$/.exec(id),M=m&&ACH_GRP[m[1]];return M?`<span class="ari">${esc(M.n[L?1:0])} <em>${ROMAN[+m[2]]||m[2]}</em></span>`:''}).join('')}<button data-act="ach">${L?'Claim':'보상 받기'}</button>`},
  resPut(){const r=this.res,res=$('results');if(!r||!res||r.mt!==G.mt)return;let el=res.querySelector('.achRes');const h=this.resHtml();if(!h){if(el)el.remove();return}
    if(!el){el=document.createElement('div');el.className='achRes';const at=res.querySelector('.misRes')||res.querySelector('.coinRes')||res.querySelector('.finalScore');if(at)at.after(el);else res.prepend(el)}
    if(el.innerHTML!==h)el.innerHTML=h},
  // a match was paid (account.js ACC.claim): what it reached, how many wait
  claimed(r){if(!r)return;const me=ACC.me;if(me&&r.ach_ready!=null){me.achReady=r.ach_ready|0}
    if(Array.isArray(r.ach_hit)&&r.ach_hit.length){this.res={ids:r.ach_hit.slice(0,12),mt:G.mt};AU.play('lvlup',{vol:.5});setTimeout(()=>this.resPut(),60)}
    if(ACC.ach)ACC.loadAch().catch(()=>{});else ACC.emit();
    if(r.ep_hof)setTimeout(()=>ACC.loadMe().catch(()=>{}),1500)},// (a first clear: the automatic title may now be that one)
  // the lobby: the achievements button next to the missions (a red dot while a reward waits)
  lobby(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||!ACC.on)return;const L=LI();let b=tb.querySelector('.tach');
    if(!b){b=document.createElement('button');b.className='tach';b.dataset.act='ach';b.innerHTML=SVG_MEDAL+`<span>${L?'Achievements':'업적'}</span>`;const at=tb.querySelector('.tmis')||tb.querySelector('.tshop');if(at)at.after(b);else tb.prepend(b)}
    this.dot()},
  dot(){const b=document.querySelector('#menu .lobTop .tbtns .tach');if(!b)return;const want=ACC.signed()&&(ACC.me.achReady|0)>0,L=LI();
    const put=(el,on,cls)=>{if(!el)return;const d=el.querySelector('.dot.'+cls);if(on&&!d){if(el.querySelector('.dot'))return;const i=document.createElement('i');i.className='dot '+cls;i.title=L?'An achievement reward to claim':'받을 업적 보상이 있어요';el.appendChild(i)}else if(!on&&d)d.remove()};
    // (phones hide the button: the missions button carries the dot, the window opens on its tabs)
    const hid=b.offsetParent===null;put(b,want&&!hid,'ad');put(document.querySelector('#menu .lobTop .tbtns .tmis'),want&&hid,'ad')}};

// ---------- hooks ----------
(function(){
  // the hall of fame's own places now show the title worn
  HOF.prof=function(){TTL.prof()};HOF.slots=function(){TTL.slots()};
  // every player's title from the roster ([8], a host from before v6.57 sends none) and this match's own counters
  const sm=startMatch;startMatch=function(cfg){const r=sm.apply(this,arguments);
    try{G.achX={kn:0,cu:0,mk:0,cr:0,pl:0,df:0};ACH.res=null;if(cfg&&Array.isArray(cfg.ro))for(const q of cfg.ro){if(q[5])continue;const a=G.actors.find(x=>x.id===q[0]);if(a)a.ttC=q.length>8&&(q[8]===null||typeof q[8]==='string')?q[8]:undefined}}catch(e){console.error(e)}
    return r};
  const cnt=k=>{if(G.achX)G.achX[k]=(G.achX[k]|0)+1};
  // melee kills (the infection modes and the scenario; 대인전 below)
  const kz=killZombie;killZombie=function(t,src,o){const me=src&&src===G.player&&t&&t.alive&&o&&o.knife;const r=kz.apply(this,arguments);if(me&&!t.alive)cnt('kn');return r};
  if(typeof PVP!=='undefined'&&PVP.kill){const pk=PVP.kill.bind(PVP);PVP.kill=function(t,src,o){const W=o&&WPN[o.w],me=src&&src===G.player&&t&&t.alive&&o&&(o.knife||W&&W.kind==='melee');const r=pk(t,src,o);if(me&&!t.alive)cnt('kn');return r}}
  // the Q7's cures, the Bloodhound's new marks, the supply crates opened
  const vc=vaxCure;vaxCure=function(t,src){const me=src&&src===G.player&&t&&t.team===TZ;const r=vc.apply(this,arguments);if(me&&t.team===TH)cnt('cu');return r};
  const hf=hndFx;hndFx=function(t,fresh,src){if(fresh&&src&&src===G.player)cnt('mk');return hf.apply(this,arguments)};
  const sg=SUP.give;SUP.give=function(a){if(a&&a===G.player)cnt('cr');return sg.apply(this,arguments)};
  // the bomb: planted (every page hears of it), defused (the host knows who and tells everyone: bdf)
  if(typeof BOMB!=='undefined'){const pl=BOMB.planted.bind(BOMB);BOMB.planted=function(a){if(a&&a===G.player)cnt('pl');return pl.apply(this,arguments)};
    const st=BOMB.stop.bind(BOMB);BOMB.stop=function(a,remote){const x=a&&a.bAct;if(x&&x.k==='defuse'&&x.t>=BOMB.DEFUSE&&!remote&&!NET.cli){if(a===G.player)cnt('df');if(NET.host)netEv('bdf',{i:a.id})}return st(a,remote)};
    CLIH.bdf=function(L,m){const a=byId(m.i);if(a&&a===G.player)cnt('df')}}
  // they go with the match's claim (p_ach); what it reached comes back
  const ms=shopMatchStats;shopMatchStats=function(){const r=ms.apply(this,arguments);if(G.achX)r.ach=Object.assign({},G.achX);return r};
  const cl=ACC.claim.bind(ACC);ACC.claim=async function(st){const r=await cl(st);try{ACH.claimed(r)}catch(e){console.error(e)}return r};
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{ACH.resPut()}catch(e){console.error(e)}return r};
  // the lobby, the window
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{ACH.lobby();TTL.prof()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='ach'){RKW.open('ach');return}if(a==='ttl'){RKW.open('ttl');return}return act0.call(this,a,v,el)};
  ACC.sub(()=>{try{ACH.dot();TTL.prof()}catch(e){}});
})();

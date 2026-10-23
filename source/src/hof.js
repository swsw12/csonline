'use strict';
// ============ The hall of fame (v6.24): the first team to clear each chapter × difficulty, and its members' titles ============
// The database keeps it (schema.sql v6.24: ep_firsts · ep_first_members, filled by qz_claim; qz_ep_firsts reads it, signed in or not).
// Every match carries one id (G.mt): the host's NET.start puts it in the match settings, so all pages of a match claim with the
// same one. The first clear the server accepts for a chapter × difficulty starts its row, and every account of that same match
// that claims within 15 minutes joins the team (8 at most). A title is ep * 10 + diff (21 = chapter 2, normal); the one worn next
// to a name is the best: the latest chapter, then the hardest difficulty.
// Where it shows: the lobby profile, the waiting-room slots, name tags over players, chat, the scoreboard and the results table,
// the ranking and the friend list (those two straight from the server), and the chapter cards (the team of the difficulty picked);
// the ranking window has a page with all of them. Another player's title comes with their hello (code + account nickname, net.js)
// and only shows when the hall of fame lists that nickname in that team.
const SVG_CROWN='<svg class="crn" viewBox="0 0 16 16"><path fill="currentColor" d="M1 4.3l3.7 3L8 2l3.3 5.3 3.7-3L13.6 12H2.4zM2.6 13.1h10.8V15H2.6z"/></svg>';
const HOF={list:null,at:0,busy:null,ver:1,err:'',res:null,
  // ---- the list from the server: [{ep, diff, at, time, team:[nicknames]}] ----
  on(){return typeof ACC!=='undefined'&&ACC.on},
  load(force){if(!this.on())return Promise.resolve(null);if(this.busy)return this.busy;
    if(!force&&(this.list||this.err==='old')&&Date.now()-this.at<60e3)return Promise.resolve(this.list);
    this.busy=ACC.rpc('qz_ep_firsts').then(r=>{this.list=Array.isArray(r)?r:[];this.err=''},
      e=>{const m=String(e&&e.message||'')+' '+String(e&&e.code||'');this.err=/Could not find the function|PGRST202/i.test(m)?'old':ACC.errText(e)})
      .then(()=>{this.at=Date.now();this.ver++;this.busy=null;this.changed();return this.list});
    return this.busy},
  get(ep,d){if(!this.list)return null;for(const e of this.list)if(e.ep===ep&&e.diff===d)return e;return null},
  valid(c){c=+c;return c===Math.floor(c)&&c>=10&&c<=303&&c%10<=3},// (v7.0: chapters 1–30 as the records take them — chapter 6 on, 60–103, was turned away)
  ep(c){return Math.floor(c/10)},dd(c){return c%10},
  // ---- whose title ----
  // mine: what the server says this account is in (qz_me / qz_claim → firsts)
  myList(){const me=this.on()&&ACC.signed()&&ACC.me;return me&&Array.isArray(me.firsts)?me.firsts.filter(c=>this.valid(c)):[]},
  mine(){let b=0;for(const c of this.myList())if(c>b)b=c;return b},
  // what this page tells the others (the hello, the waiting room's player list): the code and the account nickname, only with a title
  hello(){const c=this.mine();return {f:c,an:c?String(ACC.me.nickname||'').slice(0,16):''}},
  // someone else's: only when the hall of fame lists that account nickname in that team
  ok(c,an){if(!this.valid(c)||!an)return false;const e=this.get(this.ep(c),this.dd(c));if(!e||!Array.isArray(e.team))return false;
    const n=String(an).toLowerCase();return e.team.some(t=>String(t).toLowerCase()===n)},
  // an actor (hofC / hofN from the roster) or a waiting-room player (f / an): the title it wears, 0 = none (kept until the list changes)
  of(x){if(!x)return 0;if(x.isPlayer||NET.on&&x.k&&x.k===NET.me)return this.mine();
    if(x._hv!==this.ver){x._hv=this.ver;const c=x.hofC!=null?x.hofC:x.f,n=x.hofN!=null?x.hofN:x.an;x._hc=this.ok(c,n)?+c:0}return x._hc},
  // a chat line ({me, f, an})
  line(l){return l.me?this.mine():this.ok(l.f,l.an)?+l.f:0},
  // ---- how it reads ----
  name(c,L){const E=EPS[this.ep(c)];return (E&&E.n?E.n[L]:'CH.'+this.ep(c))+' '+T('d'+this.dd(c))},
  full(c,L){return L?`${this.name(c,L)} · first clear`:`${this.name(c,L)} 최초 클리어`},
  // the gold chip next to a name (long: "… 최초 클리어"; cls sm: the small one of lists)
  chip(c,cls,long){if(!this.valid(c))return '';const L=LI();return `<span class="hoft${cls?' '+cls:''}" data-c="${c}" title="${esc(this.full(c,L))}">${SVG_CROWN}<b>${esc(long?this.full(c,L):this.name(c,L))}</b></span>`},
  crown(c){return this.valid(c)?`<i class="hofc" title="${esc(this.full(c,LI()))}">${SVG_CROWN}</i>`:''},
  date(t,L){const d=new Date(t);if(isNaN(d))return '';return L?`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`:`${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`},
  // ---- the chapter cards: the team of one difficulty (an empty placeholder until the list is in, filled in place then) ----
  cardLine(ep,d){if(!this.on())return '';if(!this.list)return `<div class="hofl" data-hof="${ep}:${d}"></div>`;
    const L=LI(),e=this.get(ep,d),me=this.myList().includes(ep*10+d),tm=e&&Array.isArray(e.team)?e.team:[];
    return `<div class="hofl${e?' on':''}${me?' me':''}" data-hof="${ep}:${d}">${SVG_CROWN}<b>${L?T('d'+d)+' · first clear':T('d'+d)+' 최초 클리어'}</b>${e?`<span>${tm.length?tm.map(n=>esc(n)).join(' · '):'—'}</span>`:`<span class="no">${L?'nobody yet':'아직 없음'}</span>`}</div>`},
  // ---- the ranking window's page: every chapter × difficulty ----
  page(){const L=LI();let body;
    if(!this.on())body=`<div class="rkempty">${L?'The hall of fame opens once accounts are set up.':'계정 서버가 연결되면 명예의 전당을 볼 수 있어요.'}</div>`;
    else if(!this.list&&this.err==='old')body=`<div class="rkempty">${L?'The database needs the new schema.sql':'서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)'}</div>`;
    else if(!this.list)body=`<div class="rkempty">${this.busy||!this.err?(L?'Loading…':'불러오는 중…'):esc(this.err)}</div>`;
    // (v7.0: a tab a season — its finishers (epseason.js) over its chapters)
    else{const mine=this.myList(),Z=typeof EPSZ!=='undefined'?EPSZ:null,sz=Z?Z.hofSz():0;body=(Z?Z.hofTop(sz):'')+EP_IDS.filter(id=>EPS[id]&&!EPS[id].soon&&(!sz||Z.of(id)===sz)).map(id=>{const E=EPS[id];
      return `<div class="hofc"><div class="hch"><img src="${portrait('z_'+E.k,44)}"><div><small>${L?'CH.'+id:id+'챕터'} · ${esc(E.code)}</small><b>${esc(E.n[L])}</b></div></div>
        <div class="hrs">${[0,1,2,3].map(d=>{const e=this.get(id,d),tm=e&&Array.isArray(e.team)?e.team:[],me=mine.includes(id*10+d);
          return `<div class="hr d${d}${e?' on':''}${me?' me':''}"><em>${T('d'+d)}</em>${e?`<span class="tm">${tm.length?tm.map(n=>`<b>${esc(n)}</b>`).join(''):'<b>—</b>'}</span><small>${this.date(e.at,L)}${e.time?' · '+(L?'cleared in ':'클리어 ')+fmtT(e.time):''}</small>`
            :`<span class="no">${L?'Nobody yet — be the first':'아직 없음 — 첫 팀이 되어 보세요'}</span>`}</div>`}).join('')}</div></div>`}).join('')}
    return `<div class="mbody hofp">${body}</div><div class="sfoot">${L?'The first team to clear each chapter on each difficulty, on the whole server. Everyone in it wears the title next to their name: in the lobby, the waiting room, over their head, in chat, the ranking and friend lists. A season is finished by clearing all five of its chapters — the hardest level counts for the easier ones too.'
      :'챕터 × 난이도마다 서버에서 가장 먼저 클리어한 팀이에요. 그 팀원은 로비 · 대기실 · 머리 위 이름 · 채팅 · 랭킹 · 친구 목록에서 이름 옆에 칭호를 달아요. 시즌 완주는 그 시즌의 다섯 챕터를 모두 깬 순서예요 (어려운 난이도로 깬 건 쉬운 쪽에도 쳐요).'}</div>`},
  // ---- the lobby: my title under my name (opens the page) ----
  prof(){const pf=document.querySelector('#menu .lobTop .prof > div');if(!pf)return;const el=pf.querySelector('.hoft'),c=this.mine(),L=LI();
    if(!c){if(el)el.remove();return}const n=this.myList().length;
    const h=`<span class="hoft pf" data-act="hof" data-c="${c}" title="${esc(this.full(c,L))}${n>1?(L?` (+${n-1} more)`:` 외 ${n-1}개`):''}">${SVG_CROWN}<b>${esc(this.full(c,L))}</b>${n>1?`<i>+${n-1}</i>`:''}</span>`;
    if(el)el.outerHTML=h;else pf.insertAdjacentHTML('beforeend',h)},
  // ---- the waiting room: a chip under each titled player's name (patched in place) ----
  slots(){const lb=NET.lob;if(!lb||UI.open!=='lobby')return;
    document.querySelectorAll('#lobby .slot.pl').forEach((el,i)=>{const p=lb.pl[i],c=p?this.of(p):0,b=el.querySelector('div > b');if(!b)return;const s=el.querySelector('.hoft');
      if(!c){if(s)s.remove();return}if(s&&s.dataset.c===String(c))return;if(s)s.remove();b.insertAdjacentHTML('afterend',this.chip(c,'sm'))})},
  // ---- the results: a gold line when this account just joined a first-clear team ----
  resHtml(){const r=this.res;if(!r)return '';const L=LI(),e=this.get(this.ep(r.c),this.dd(r.c)),tm=e&&Array.isArray(e.team)?e.team:[];
    return `${SVG_CROWN}<div><small>${L?'HALL OF FAME':'명예의 전당'}</small><b>${esc(this.full(r.c,L))}!</b><span>${tm.length?(L?'Team: ':'팀: ')+tm.map(n=>esc(n)).join(' · '):(L?'Your name is on it':'이름이 올라갔어요')}</span><em>${L?'Your title now shows next to your name':'이제 이름 옆에 칭호가 붙어요'}</em></div>`},
  resPut(){const r=this.res,res=$('results');if(!r||!res||r.mt!==G.mt)return;let el=res.querySelector('.hofRes');
    if(!el){el=document.createElement('div');el.className='hofRes';const fs=res.querySelector('.finalScore');if(fs)fs.after(el);else res.prepend(el)}
    const h=this.resHtml();if(el.innerHTML!==h)el.innerHTML=h},
  // a claim came back (account.js ACC.claim)
  claimed(st,r){if(!st||!st.ep||!r)return;
    if(r.ep_hof){this.res={c:(st.ep|0)*10+(st.diff|0),mt:G.mt};AU.play('lvlup',{vol:.7});this.resPut()}
    // (the team fills up as the others' claims come in: a second look a few seconds later)
    if(r.ep_clear||r.ep_hof){this.load(true);setTimeout(()=>this.load(true),6000)}},
  // the list changed: everything on screen that shows it
  changed(){try{
    for(const el of document.querySelectorAll('[data-hof]')){const [ep,d]=el.dataset.hof.split(':').map(Number),h=this.cardLine(ep,d);if(h&&el.outerHTML!==h)el.outerHTML=h}
    this.slots();this.resPut();if($('rkWin')&&typeof RKW!=='undefined'&&RKW.page==='hof')RKW.render()}catch(e){console.error(e)}}};

// ---------- hooks ----------
(function(){
  // the match's id (the host's comes in the settings) and every player's title from the roster ([6] code, [7] account nickname)
  const sm=startMatch;startMatch=function(cfg){const r=sm.apply(this,arguments);
    try{G.mt=cfg&&cfg.mt||netKey(12);HOF.res=null;if(cfg&&Array.isArray(cfg.ro))for(const q of cfg.ro){if(q[5])continue;const a=G.actors.find(x=>x.id===q[0]);if(a){a.hofC=q[6]|0;a.hofN=String(q[7]||'')}}}catch(e){console.error(e)}
    return r};
  const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{HOF.prof()}catch(e){console.error(e)}return r};
  const bs=UI.buildSetup;UI.buildSetup=function(){const r=bs.apply(this,arguments);if(CFG.mode==='scen')HOF.load();return r};
  const ml=UI.mpLobby;UI.mpLobby=function(){const r=ml.apply(this,arguments);try{HOF.slots();HOF.load()}catch(e){console.error(e)}return r};
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{HOF.resPut()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='hof'){RKW.open('hof');return}return act0.call(this,a,v,el)};
  setTimeout(()=>HOF.load(),1200);
})();

'use strict';
// ============ v7.0: the chapter seasons (시즌) — and what finishing one gives ============
// Five chapters a season: season 1 = chapters 1–5 (격리구역 Q-7), season 2 = 6–10 (1차 회수팀). Finishing season 2 pays through the
// achievements (schema.sql v7.0): 「시즌 2 완주」 I · II · III — chapters 6–10, all of them, cleared on any difficulty / on hard or expert /
// on expert (each tier reads its own number: s2a, s2h, s2x) — and 「1차 회수팀」, RT-1's seven brought down (rt1: the bosses of chapters
// 2, 4 and 6–10), each with a title. Shown here:
//   * a strip over the chapter list (room settings): the season's five chapters by the hardest difficulty cleared, the tiers done, the
//     next one and its title (signed in: the server's records, the ones the rewards read; a guest: this browser's); it opens the
//     achievements on their chapter page
//   * the hall of fame's season pages: a tab a season (the latest first) — how many have finished it on each level, the first ten and this
//     account's place (qz_ep_seasons, anyone may read it) — over that season's chapters and their first-clear teams (hof.js)
//   * a banner on the results when the match just reached a tier (the claim's ach_hit), with the place it got on the server
const SZ_NAME={1:['격리구역 Q-7','Quarantine Zone Q-7'],2:['1차 회수팀','Recovery Team 1']};
// a season's tiers: the achievement, the level it asks (0 any difficulty, 2 hard or expert, 3 expert), the title it gives (as schema.sql)
const SZ_TIERS={2:[{id:'s2c1',lv:0,t:'rt2'},{id:'s2c2',lv:2,t:'unyielding'},{id:'s2c3',lv:3,t:'dawn'}]};
const SVG_DAWN='<svg class="szd" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1 12.2h14v1.5H1zM8 6.6a4.6 4.6 0 014.6 4.6H3.4A4.6 4.6 0 018 6.6zM7.25 1.6h1.5v3.1h-1.5zM2.3 4.4l1.06-1.06 2.1 2.1L4.4 6.5zM13.7 4.4l-1.06-1.06-2.1 2.1 1.06 1.06zM.6 9.4h2.6v1.4H.6zM12.8 9.4h2.6v1.4h-2.6z"/></svg>';
const SVG_DOGTAG='<svg class="szd" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" opacity=".55" fill-rule="evenodd" d="M3.6 2.6h4.6A1.4 1.4 0 019.6 4v7.6A1.4 1.4 0 018.2 13H3.6a1.4 1.4 0 01-1.4-1.4V4a1.4 1.4 0 011.4-1.4zm2.3 1.1a.75.75 0 100 1.5.75.75 0 000-1.5z"/><path fill="currentColor" fill-rule="evenodd" d="M7.4 4.8h5a1.5 1.5 0 011.5 1.5v7.9a1.5 1.5 0 01-1.5 1.5h-5a1.5 1.5 0 01-1.5-1.5V6.3a1.5 1.5 0 011.5-1.5zm2.5 1.1a.8.8 0 100 1.6.8.8 0 000-1.6zM7.9 9.4h4v.9h-4zm0 1.9h4v.9h-4z"/><path fill="none" stroke="currentColor" stroke-width=".9" stroke-dasharray="1 .7" d="M9.9 5.9L8 .4 5.9 3.7"/></svg>';
const EPSZ={list:null,at:0,busy:null,err:'',hs:0,res:null,
  LV:[0,2,3],
  of(ep){return Math.floor((+ep+4)/5)},
  eps(s){return [1,2,3,4,5].map(i=>s*5-5+i)},
  // the seasons out (all five of its chapters there) and the latest of them
  out(){const o=[];for(let s=1;s*5<=EP_N;s++)if(this.eps(s).every(id=>EPS[id]&&!EPS[id].soon))o.push(s);return o},
  cur(){const o=this.out();return o.length?o[o.length-1]:0},
  lvName(lv,L){return lv===3?T('d3'):lv===2?(L?'Hard or expert':'어려움 이상'):(L?'Any difficulty':'난이도 무관')},
  // ---- this account's progress: the hardest difficulty each chapter was cleared on (-1: not yet) ----
  best(id){const me=typeof ACC!=='undefined'&&ACC.signed()&&ACC.me;
    if(me&&Array.isArray(me.eps)){let b=-1;for(const r of me.eps)if(r&&r.ep===id&&r.clears>0&&r.diff>b)b=r.diff;return b}
    for(let d=3;d>=0;d--)if(EP.rec(id,d))return d;return -1},
  // per chapter, and per level how many of the five
  prog(s){const b=this.eps(s).map(id=>this.best(id));return {b,n:this.LV.map(lv=>b.filter(x=>x>=lv).length)}},
  // ---- the strip over the chapter list (room settings; epCards) ----
  strip(){const s=this.cur(),TT=SZ_TIERS[s];if(!TT)return '';const L=LI(),P=this.prog(s),k=TT.findIndex((x,i)=>P.n[i]<5);
    const sq=this.eps(s).map((id,i)=>{const b=P.b[i],E=EPS[id];
      return `<i class="${b>=0?'d'+b:'no'}" title="${esc((L?'CH.'+id:id+'챕터')+(E&&E.n?' '+E.n[L]:'')+' — '+(b>=0?(L?'best: ':'최고: ')+T('d'+b):(L?'not cleared yet':'아직 클리어 안 함')))}">${id}</i>`}).join('');
    const tr=TT.map((x,i)=>`<em class="${P.n[i]>=5?'on':i===k?'nx':''}" title="${esc(this.lvName(x.lv,L))}">${ROMAN[i+1]}</em>`).join('');
    const ask=i=>i===2?(L?'All on expert':'모두 전문가로'):i===1?(L?'All on hard or expert':'모두 어려움 이상'):(L?`All of ${s*5-4}–${s*5} cleared`:`${s*5-4}~${s*5}챕터 모두 클리어`);
    const nx=k<0?`<span class="ok">${L?'Finished — expert and all':'전문가까지 완주'} ✔</span>${TTL.chip(TT[2].t,'sm')}`:`<span>${ask(k)}</span><b>${P.n[k]}/5</b>${TTL.chip(TT[k].t,'sm')}`;
    const tip=TT.map((x,i)=>`${ROMAN[i+1]} ${this.lvName(x.lv,L)} — ${TTL.name(x.t,L)}`).join('  ·  ');
    return `<div class="szs${k<0?' all':''}" data-act="szach" title="${esc((L?'Season '+s+' complete — ':'시즌 '+s+' 완주 — ')+tip)}"><div class="r1"><u class="sz">S${s}</u><b>${L?'Season '+s+' complete':'시즌 '+s+' 완주'}</b><small>${esc((SZ_NAME[s]||['',''])[L?1:0])}</small><span class="tr">${tr}</span></div>
      <div class="r2"><span class="sq">${sq}</span><span class="nx">${nx}</span></div></div>`},
  // ---- the server's list: [{season, from, to, tiers:[{lv, n, first:[{nick, at}], me:{rank, at}|null}]}] ----
  load(force){if(typeof ACC==='undefined'||!ACC.on)return Promise.resolve(null);if(this.busy)return this.busy;
    if(!force&&(this.list||this.err==='old')&&Date.now()-this.at<60e3)return Promise.resolve(this.list);
    this.busy=ACC.rpc('qz_ep_seasons').then(r=>{this.list=Array.isArray(r)?r:[];this.err=''},
      e=>{const m=String(e&&e.message||'')+' '+String(e&&e.code||'');this.err=/Could not find the function|PGRST202/i.test(m)?'old':ACC.errText(e)})
      .then(()=>{this.at=Date.now();this.busy=null;this.changed();return this.list});
    return this.busy},
  get(s){if(!Array.isArray(this.list))return null;for(const x of this.list)if(x&&x.season===s)return x;return null},
  tier(s,lv){const S=this.get(s);if(!S||!Array.isArray(S.tiers))return null;for(const t of S.tiers)if(t&&t.lv===lv)return t;return null},
  changed(){try{this.resPut();if($('rkWin')&&typeof RKW!=='undefined'&&RKW.page==='hof')RKW.render()}catch(e){console.error(e)}},
  // ---- the hall of fame (hof.js page): the season picked (the latest out until one is), its tabs and finishers ----
  hofSz(){const o=this.out();if(!o.length)return 0;if(!o.includes(this.hs))this.hs=o[o.length-1];return this.hs},
  hofTop(s){if(!s)return '';const L=LI(),o=this.out().slice().reverse();
    const tabs=`<div class="szTabs">${o.map(x=>`<button class="${x===s?'on':''}" data-ra="hsz" data-v="${x}"><span><u class="sz">S${x}</u>${L?'Season '+x:'시즌 '+x}</span><small>${esc((SZ_NAME[x]||['',''])[L?1:0])} · ${L?'CH.'+(x*5-4)+'–'+(x*5):(x*5-4)+'~'+(x*5)+'챕터'}</small></button>`).join('')}</div>`;
    let inner;
    if(!this.list&&this.err==='old')inner=`<div class="szNo">${L?'The database needs the new schema.sql':'서버 업데이트가 필요해요 (supabase/schema.sql 다시 실행)'}</div>`;
    else if(!this.list)inner=`<div class="szNo">${this.busy||!this.err?(L?'Loading…':'불러오는 중…'):esc(this.err)}</div>`;
    else inner=`<div class="szk">${this.LV.map(lv=>this.col(s,lv,L)).join('')}</div>`;
    const TT=SZ_TIERS[s],rw=TT?`<div class="szRw">${L?'Titles':'칭호'} ${TT.map((x,i)=>`<span><em>${ROMAN[i+1]}</em>${TTL.chip(x.t,'sm')}</span>`).join('')}${s===2?`<span><em>${L?'RT-1':'1차 회수팀'}</em>${TTL.chip('dogtags','sm')}</span>`:''}</div>`:'';
    return `${tabs}<div class="szh s${s}"><div class="szhT">${SVG_DAWN}<div><b>${L?'Season '+s+' — finished':'시즌 '+s+' 완주'}</b><small>${L?`Everyone who has cleared all five of chapters ${s*5-4}–${s*5} on the level, in the order they did it`:`${s*5-4}~${s*5}챕터 다섯 개를 모두 그 난이도 이상으로 깬 순서`}</small></div></div>${inner}${rw}</div>`},
  col(s,lv,L){const T0=this.tier(s,lv),first=T0&&Array.isArray(T0.first)?T0.first:[],n=T0?T0.n|0:0,me=T0&&T0.me&&T0.me.rank?T0.me:null;
    const rows=first.map((x,i)=>`<li class="${i<3?'r'+(i+1):''}${me&&me.rank===i+1?' me':''}"><i>${i===0?SVG_CROWN:i+1}</i><b>${esc(String(x&&x.nick||'?'))}</b><small>${HOF.date(x&&x.at,L)}</small></li>`).join('');
    return `<div class="szc l${lv}"><em>${this.lvName(lv,L)}</em>${first.length?`<ol>${rows}</ol>`:`<span class="no">${L?'Nobody yet — be the first':'아직 없음 — 첫 완주자가 되어 보세요'}</span>`}
      <span class="szn">${L?`${fmtC(n)} finished`:`완주 ${fmtC(n)}명`}${me?` · <b>${L?'you: #'+me.rank:'나: '+me.rank+'번째'}</b>`:''}</span></div>`},
  // ---- the results: the match just reached a tier (ACC.claim → ach_hit) ----
  claimed(st,r){if(!r||!Array.isArray(r.ach_hit))return;const TT=SZ_TIERS[2],lv=[];TT.forEach((x,i)=>{if(r.ach_hit.includes(x.id))lv.push(i)});const tags=r.ach_hit.includes('tags1');
    if(!lv.length&&!tags)return;this.res={s:2,lv,tags,mt:G.mt};setTimeout(()=>AU.play('morale',{vol:.6}),650);this.load(true);setTimeout(()=>this.resPut(),80)},// (the achievements' own lvlup plays first)
  resHtml(){const r=this.res;if(!r)return '';const L=LI(),TT=SZ_TIERS[r.s]||[],top=r.lv.length?r.lv[r.lv.length-1]:-1,me=top>=0?(this.tier(r.s,TT[top].lv)||{}).me:null;
    const head=top<0?(L?'All seven of RT-1 brought down':'1차 회수팀 일곱 명, 전원 확인'):top===2?(L?`Season ${r.s} complete — on expert!`:`전문가로 시즌 ${r.s} 완주!`)
      :top===1?(L?`Season ${r.s} complete — on hard or expert!`:`어려움 이상으로 시즌 ${r.s} 완주!`):(L?`Season ${r.s} complete!`:`시즌 ${r.s} 완주!`);
    const titles=[...r.lv.map(i=>TT[i].t),...(r.tags?['dogtags']:[])].map(t=>TTL.chip(t,'sm')).join('');
    return `<div class="szi">${top<0?SVG_DOGTAG:SVG_DAWN}</div><div class="szx"><small>${top<0?(L?'RECOVERY TEAM 1':'1차 회수팀'):(L?'SEASON '+r.s+' · '+(SZ_NAME[r.s]||['',''])[1].toUpperCase():'시즌 '+r.s+' · '+(SZ_NAME[r.s]||['',''])[0])}</small><b>${head}</b>
      ${me&&me.rank?`<span>${L?`#${fmtC(me.rank)} on the server to finish it`:`서버에서 ${fmtC(me.rank)}번째 완주`}</span>`:''}${top>=0&&r.tags?`<span>${L?'…and all seven of RT-1 brought down':'1차 회수팀 일곱 명도 전원 확인'}</span>`:''}
      <em>${L?'Titles waiting in Achievements':'업적에서 받을 칭호'}${titles}</em></div>`},
  resPut(){const r=this.res,res=$('results');if(!r||!res||r.mt!==G.mt)return;let el=res.querySelector('.szRes');
    if(!el){el=document.createElement('div');el.className='szRes';const at=res.querySelector('.hofRes')||res.querySelector('.finalScore');if(at)at.after(el);else res.prepend(el)}
    const h=this.resHtml();if(el.innerHTML!==h)el.innerHTML=h}};

// ---------- hooks ----------
(function(){
  const sm=startMatch;startMatch=function(cfg){const r=sm.apply(this,arguments);EPSZ.res=null;return r};
  const cl=ACC.claim.bind(ACC);ACC.claim=async function(st){const r=await cl(st);try{EPSZ.claimed(st,r)}catch(e){console.error(e)}return r};
  const sr=UI.showResults;UI.showResults=function(){const r=sr.apply(this,arguments);try{EPSZ.resPut()}catch(e){console.error(e)}return r};
  // the strip (and the news card) open the achievements on their chapter page
  const act0=UI.act;UI.act=function(a,v,el){if(a==='szach'){ACH.cat='chapter';RKW.open('ach');return}return act0.call(this,a,v,el)};
})();

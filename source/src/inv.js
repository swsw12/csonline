'use strict';
// ============ the inventory: 근·하·신·년 letters (and their exchange), owned weapons, the three loadout presets, zombie and character ============
// Opened from the lobby's 인벤토리 button. Letters, kept decoders and owned guns come from the account (ACC.me); the presets
// (CFG.sets, loadout.js) and the zombie / character picks (CFG.zclass, CFG.skin) are this device's settings and work for guests too.
const INV={tab:'ny',busy:false,msg:'',ok:true,
  open(tab){if(tab)this.tab=tab;this.msg='';if($('nbWin')&&typeof NBAN!=='undefined')NBAN.close();let o=$('invWin');if(!o){o=document.createElement('div');o.id='invWin';document.body.appendChild(o);
      o.addEventListener('click',e=>{const t=e.target.closest('[data-iv]');if(!t){if(e.target===o)this.close();return}this.act(t.dataset.iv,t.dataset.v,t)});
      o.addEventListener('change',e=>{const t=e.target.closest('[data-ivc]');if(t)this.change(t.dataset.ivc,t.value,t)})}
    if(ACC.signed&&ACC.signed()&&ACC.loadMe)ACC.loadMe().then(()=>this.render()).catch(()=>{});this.render()},
  close(){const o=$('invWin');if(o)o.remove()},
  async act(a,v){const L=LI();
    if(a==='x'){this.close();return}
    if(a==='tab'){this.tab=v;this.msg='';this.render();return}
    if(a==='login'){this.close();ACCW.open('in');return}
    if(a==='ex'){if(this.busy)return;this.busy=true;this.render();
      try{const r=await ACC.nyExchange(v);this.msg=v==='ny'?(L?'+2 근하신년 decoders':'근하신년 해독기 +2개'):(L?'+1 season decoder':'시즌 해독기 +1개');this.ok=true;AU.play('lvlup',{vol:.6})}
      catch(e){this.msg=ACC.errText(e);this.ok=false;AU.play('dry',{vol:.5})}this.busy=false;this.render();return}
    if(a==='openny'||a==='opensz'){this.close();SHOP.open();SHOP.act('page',a==='openny'?'gacha':'season');return}
    if(a==='gun'){this.close();SHOP.open(v);return}
    if(a==='zc'){CFG.zclass=v;saveCfg();AU.play('ui',{vol:.4});this.render();return}
    if(a==='skin'){CFG.skin=v;saveCfg();AU.play('ui',{vol:.4});this.render();return}
    if(a==='nade'){const [i,k]=v.split(':');const s=ldSets()[+i];s[k]=s[k]?0:1;saveCfg();this.render();return}
    if(a==='armor'){const s=ldSets()[+v];s.armor=s.armor?0:1;saveCfg();this.render();return}
    if(a==='reset'){CFG.sets[+v]=Object.assign({},LD_SETS0[+v]);saveCfg();this.render();return}},
  change(k,val){const [i,slot]=k.split(':');const s=ldSets()[+i];s[slot]=val||null;saveCfg();AU.play('ui',{vol:.35});this.render()},
  // the guns this player may take: on the buy menu (or the knife) and owned (or free, or accounts off)
  mine(slot){const out=[],seen=new Set();for(const c of BUY_MENU)for(const id of c.items){const W=WPN[id];if(!W||!W.model||W.kind==='nade'||W.slot!==slot||seen.has(id))continue;seen.add(id);
      if(!ACC.on||ACC.owns(id))out.push(id)}if(slot===3&&!seen.has('knife'))out.unshift('knife');return out},
  render(){const o=$('invWin');if(!o)return;const L=LI(),signed=ACC.signed&&ACC.signed(),me=ACC.me;
    const tabs=[['ny',L?'근·하·신·년':'근하신년 글자'],['guns',L?'My weapons':'보유 무기'],['sets',L?'Presets':'장비 프리셋'],['char',L?'Zombie · character':'좀비 · 캐릭터']];
    const body=this.tab==='guns'?this.guns(L):this.tab==='sets'?this.sets(L):this.tab==='char'?this.chars(L):this.ny(L,signed,me);
    o.innerHTML=`<div class="ivw"><div class="ivh"><b>${L?'Inventory':'인벤토리'}</b><small>INVENTORY</small><span class="sgap"></span>
      ${signed?`<span class="scoin">${COIN}<b>${fmtC(me.coins)}</b></span>`:''}<button class="ivx" data-iv="x" aria-label="close">×</button></div>
      <div class="ivt">${tabs.map(([k,n])=>`<button class="${k===this.tab?'on':''}" data-iv="tab" data-v="${k}">${n}</button>`).join('')}</div>
      <div class="ivb">${body}</div>${this.msg?`<div class="ivm ${this.ok?'ok':'bad'}">${esc(this.msg)}</div>`:''}</div>`},
  ny(L,signed,me){const N=signed&&me&&me.ny?me.ny:[0,0,0,0],sets=Math.min(...N),busy=this.busy;
    const tiles=NY_CH.map((c,i)=>`<div class="ivl${N[i]>0?' on':''}"><b>${c}</b><span>×${N[i]}</span></div>`).join('');
    return `<div class="ivny"><p class="ivd">${L?'Zombies you kill sometimes drop a 근·하·신·년 letter: walk over it to pick it up. Every letter picked up in a match is kept here once the match ends (signed in). One of each letter makes a set.':'좀비를 잡으면 가끔 근·하·신·년 글자가 떨어져요. 밟으면 줍고, 매치가 끝나면 주운 글자가 여기 저장돼요 (로그인). 네 글자를 하나씩 모으면 한 세트.'}</p>
      <div class="ivls">${tiles}</div><div class="ivsets">${L?'Sets':'모은 세트'} <b>${sets}</b></div>
      ${!ACC.on?`<div class="ivn">${L?'Accounts are not set up yet.':'계정 서버가 연결되면 쓸 수 있어요.'}</div>`:!signed?`<button class="ivbtn big" data-iv="login">${L?'Sign in to keep letters':'로그인하고 글자 모으기'}</button>`
      :`<div class="ivex"><button class="ivbtn gold" data-iv="ex" data-v="ny"${sets<1||busy?' disabled':''}>${decoderSvg('tki')}<span><b>${L?'2 근하신년 decoders':'근하신년 해독기 2개'}</b><small>${L?'one set':'세트 1개로 교환'}</small></span></button>
        <button class="ivbtn vio" data-iv="ex" data-v="season"${sets<1||busy?' disabled':''}>${seasonSvg('tki')}<span><b>${L?'1 season decoder':'시즌 해독기 1개'}</b><small>${L?'one set':'세트 1개로 교환'}</small></span></button></div>
      <div class="ivkept"><span>${decoderSvg('tki')} ${L?'근하신년 decoders kept':'보유 근하신년 해독기'} <b>${me.tickets|0}</b></span><button data-iv="openny">${L?'Open':'열러 가기'} ›</button>
        <span>${seasonSvg('tki')} ${L?'Season decoders kept':'보유 시즌 해독기'} <b>${me.sTickets|0}</b></span><button data-iv="opensz">${L?'Open':'열러 가기'} ›</button></div>`}</div>`},
  guns(L){const K=typeof KIND_N!=='undefined'?KIND_N:{};const all=[];for(const s of [1,2,3])for(const id of this.mine(s))all.push(id);
    const by={};for(const id of all){const k=WPN[id].kind;(by[k]=by[k]||[]).push(id)}
    const sec=Object.keys(by).map(k=>`<div class="ivgs"><div class="ivgk">${esc((K[k]||[k,k])[L])} <small>${by[k].length}</small></div><div class="ivgg">${by[k].map(id=>{const W=WPN[id],ic=gunIcon(W.model,W.kind==='melee'?24:28);
      return `<button class="ivg" data-iv="gun" data-v="${id}" title="${esc(W.n[L])}">${ic?`<img src="${ic}" alt="">`:''}<span>${esc(W.n[L])}</span>${W.ny?'<i class="nyb">NY</i>':''}</button>`}).join('')}</div></div>`).join('');
    return `<p class="ivd">${ACC.on&&!(ACC.signed&&ACC.signed())?(L?'Guest: the free guns only. Sign in to see what you own.':'게스트는 기본 총만 보여요. 로그인하면 보유한 총이 전부 떠요.'):(L?'Everything you can take in a match. Click one to see it in the shop.':'매치에서 고를 수 있는 무기 전부예요. 누르면 상점에서 자세히 봐요.')} <b>${all.length}</b>${L?'':'종'}</p>${sec}`},
  sets(L){const S=ldSets(),opt=(i,slot,cur)=>{const ids=this.mine(slot);const has=cur&&!ids.includes(cur)&&WPN[cur];
      return `<select class="dd" data-ivc="${i}:${slot}">${slot!==3?`<option value="">${L?'— none —':'— 없음 —'}</option>`:''}${has?`<option value="${cur}" selected>${esc(WPN[cur].n[L])} (${L?'locked':'잠김'})</option>`:''}${ids.map(id=>`<option value="${id}"${id===cur?' selected':''}>${esc(WPN[id].n[L])}</option>`).join('')}</select>`};
    const ic=id=>{const W=WPN[id];if(!W||!W.model)return '<i class="ivno"></i>';const s=gunIcon(W.model,24);return s?`<img src="${s}" alt="">`:''};
    return `<p class="ivd">${L?'The three sets of the buy menu (Shift+1 / 2 / 3 in a match). Set them up here before playing.':'매치 구매 메뉴의 장비 세트 3개예요 (매치에서 Shift+1 / 2 / 3). 여기서 미리 맞춰 두세요.'}</p>
      <div class="ivsetl">${S.map((s,i)=>`<div class="ivset"><div class="ivsh"><b>${L?'Set':'세트'} ${i+1}</b><kbd>Shift+${i+1}</kbd><button data-iv="reset" data-v="${i}">${L?'Default':'기본값'}</button></div>
        ${[[1,L?'Primary':'주무기'],[2,L?'Pistol':'보조무기'],[3,L?'Melee':'근접']].map(([sl,n])=>`<div class="ivrow"><span>${n}</span><div class="ivic">${ic(s[sl])}</div>${opt(i,sl,s[sl])}</div>`).join('')}
        <div class="ivrow"><span>${L?'Grenades':'수류탄'}</span><div class="ivnd">${LD_NADES.filter(k=>WPN[k]).map(k=>`<button class="${s[k]?'on':''}" data-iv="nade" data-v="${i}:${k}">${esc(WPN[k].n[L])}</button>`).join('')}</div></div>
        <div class="ivrow"><span>${L?'Armour':'방탄복'}</span><div class="ivnd"><button class="${s.armor?'on':''}" data-iv="armor" data-v="${i}">${s.armor?(L?'On':'착용'):(L?'Off':'안 함')}</button></div></div></div>`).join('')}</div>`},
  chars(L){return `<p class="ivd">${L?'The zombie you turn into when infected, and the survivor you play.':'감염됐을 때 변할 좀비와 플레이할 생존자 캐릭터예요.'}</p>
      <div class="ivck"><div class="ivgk">${L?'Zombie':'좀비'}</div><div class="ivcc">${ZLIST.filter(k=>ZCLASS[k]).map(k=>`<button class="ivc${CFG.zclass===k?' on':''}" data-iv="zc" data-v="${k}"><img src="${portrait('z_'+k,86)}" alt=""><b>${esc(ZCLASS[k].n[L])}</b><small>${esc((ZCLASS[k].sk||['',''])[L])}</small></button>`).join('')}</div>
        <p class="ivzd">${esc(ZCLASS[CFG.zclass]?ZCLASS[CFG.zclass].d[L]:'')}</p></div>
      <div class="ivck"><div class="ivgk">${L?'Survivor':'생존자'}</div><div class="ivcc">${HSKINS.map(k=>`<button class="ivc${CFG.skin===k?' on':''}" data-iv="skin" data-v="${k}"><img src="${portrait('h_'+k,86)}" alt=""><b>${esc(HSKIN_N[k][L])}</b></button>`).join('')}</div></div>`}};
// the lobby button (next to the shop), and a fresh count of this match's letters at every start
const SVG_BAG='<svg viewBox="0 0 16 16"><path fill="currentColor" d="M5.5 4V3a2.5 2.5 0 015 0v1H14l-1 11H3L2 4zm1.4 0h2.2V3a1.1 1.1 0 00-2.2 0z"/></svg>';
function invLobby(){const tb=document.querySelector('#menu .lobTop .tbtns');if(!tb||tb.querySelector('.tinv'))return;const L=LI();
  const b=document.createElement('button');b.className='tinv';b.dataset.act='inv';b.innerHTML=SVG_BAG+`<span>${L?'Inventory':'인벤토리'}</span>`;
  const after=tb.querySelector('.trank')||tb.querySelector('.tmis')||tb.querySelector('.tshop');if(after)after.after(b);else tb.prepend(b);
  const N=ACC.me&&ACC.me.ny;if(N&&Math.min(...N)>0){const d=document.createElement('i');d.className='dot';b.appendChild(d)}}
(function(){const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{invLobby()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='inv'){INV.open();return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&$('invWin'))INV.close()});
  const sm=startMatch;startMatch=function(cfg){INV.close();if(G.player)G.player.nyM=[0,0,0,0];const r=sm(cfg);if(G.player)G.player.nyM=[0,0,0,0];return r}})();

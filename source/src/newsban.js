'use strict';
// ============ the "new" banner: new weapons, zombies, maps and features, shown when the game starts ============
// Shown once per page load when the lobby first appears (after a sign-in window that is already open closes), unless
// "don't show for 2 hours" was chosen less than 2 hours ago (LS 'nbHide' = the time it was chosen). X closes it for this load;
// the NEW button on the notice panel opens it again. To add an entry, put it at the top of NEW_CONTENT:
//   kind 'weapon' (ref = WPN id) / 'zombie' (ref = ZCLASS id) / 'map' (ref = map id) / 'feature' (ico = a symbol); missing refs are skipped.
const NEW_CONTENT=[
  {kind:'weapon',ref:'blaze8',tag:['상점 6,000 코인','Shop · 6,000 coins'],t:['블레이즈-8','Blaze-8'],
    d:['골드 각인 반자동 샷건. 8발을 한 발씩 장전하는데 장전 도중 쏘면 바로 끊고 발사. 3발 쏠 때마다 특수탄이 들어가 좀비를 크게 밀어냄.','A gold-engraved semi-auto shotgun: 8 shells loaded one by one, and firing mid-reload shoots at once. Every 3 shells a special shell is loaded that blows zombies back.']},
  {kind:'weapon',ref:'winchester',tag:['상점 4,500 코인','Shop · 4,500 coins'],t:['윈체스터 M1887','Winchester M1887'],
    d:['레버 액션 샷건. 쏠 때마다 레버를 철컥. 한 방이 묵직하고, 장전 중 쏘면 바로 끊고 발사.','A lever-action shotgun: rack the lever after every shot. Heavy single blasts; firing mid-reload shoots at once.']},
  {kind:'weapon',ref:'killknife',tag:['상점 3,000 코인','Shop · 3,000 coins'],t:['킬나이프','Kill Knife'],
    d:['커다란 전투 칼. 기본 칼보다 사거리 · 데미지 · 경직이 훨씬 높고, 강공격은 두 마리까지 벰.','A big combat knife: far more reach, damage and stagger than the standard knife; the heavy attack cuts two.']},
  {kind:'weapon',ref:'salamander',tag:['시즌 해독기','Season decoder'],t:['샐러맨더','Salamander'],
    d:['화염방사기. 8m 안의 좀비를 한꺼번에 태우고 불붙여 느리게 만듦. 벽은 못 넘음.','A flamethrower: burns every zombie within 8 m at once and slows them; stopped by walls.']},
  {kind:'weapon',ref:'skull9',tag:['시즌 해독기','Season decoder'],t:['스컬-9','SKULL-9'],
    d:['양손 전투도끼. 좌클릭 가로 베기 3마리, 우클릭 일자 내려찍기 2마리 + 띄우기.','A two-handed battle axe: the sweep cuts three, the straight overhead slam two and pops them up.']},
  {kind:'feature',ico:'◎',tag:['신규 기능','New'],t:['공개 방 · 일일 미션 · 랭킹','Public rooms · daily missions · ranking'],
    d:['멀티플레이 메뉴에 열린 방 목록, 매일 바뀌는 미션 3개(해독기 보상), 레벨 · 킬 · 감염 TOP 50 랭킹.','Open rooms in the multiplayer menu, three daily missions (decoders to win) and a top-50 ranking.']}];
const NBAN={i:0,timer:null,shown:false,
  list(){return NEW_CONTENT.filter(e=>e.kind==='weapon'?!!(WPN[e.ref]&&GUNS[WPN[e.ref].model]):e.kind==='zombie'?!!ZCLASS[e.ref]:e.kind==='map'?!!MAPDEFS[e.ref]:true)},
  hidden(){const t=LS.get('nbHide',0);return t>0&&Date.now()-t<2*3600e3},
  art(e){if(e.kind==='weapon'){const W=WPN[e.ref],s=gunIcon(W.model,W.kind==='melee'?54:66);return s?`<img class="nbw${W.kind==='melee'?' m':''}" src="${s}" alt="">`:''}
    if(e.kind==='zombie')return `<img class="nbz" src="${portrait('z_'+e.ref,150)}" alt="">`;if(e.kind==='map')return `<div class="nbm">${thumb(e.ref,'big')}</div>`;return `<b class="nbi">${e.ico||'★'}</b>`},
  open(){const L=this.list();if(!L.length)return;this.close();this.i=0;const o=document.createElement('div');o.id='nbWin';document.body.appendChild(o);
    o.addEventListener('click',ev=>{const t=ev.target.closest('[data-nb]');if(!t){if(ev.target===o)this.close();return}const a=t.dataset.nb;
      if(a==='x')this.close();else if(a==='hide'){LS.set('nbHide',Date.now());this.close()}else if(a==='p')this.go(this.i-1,1);else if(a==='n')this.go(this.i+1,1);
      else if(a==='d')this.go(+t.dataset.v,1);else if(a==='shop'){const id=t.dataset.v;this.close();if(typeof SHOP!=='undefined')SHOP.open(id)}});
    this.render();this.timer=setInterval(()=>{if(!this.hold)this.go(this.i+1)},6500);AU.play&&AU.play('ui',{vol:.4})},
  go(i,user){const n=this.list().length;this.i=(i+n)%n;if(user){this.hold=true;setTimeout(()=>this.hold=false,9000)}this.render()},
  render(){const o=$('nbWin');if(!o)return;const L=LI(),A=this.list(),e=A[this.i],n=A.length;if(!e){this.close();return}
    const W=e.kind==='weapon'?WPN[e.ref]:null,kn=W?((typeof KIND_N!=='undefined'&&KIND_N[W.kind])||['',''])[L]:'';
    o.innerHTML=`<div class="nbw0"><div class="nbh"><b>${L?'NEW':'신규 소개'}</b><small>${L?'What\'s new in QUARANTINE Z':'새로 들어온 무기 · 기능'}</small><button class="nbx" data-nb="x" aria-label="close">×</button></div>
      <div class="nbb"><button class="nbar l" data-nb="p"${n<2?' disabled':''}>‹</button><div class="nbc k${e.kind}" key="${this.i}"><div class="nba">${this.art(e)}<i class="nbg"></i></div>
        <div class="nbt"><span class="nbtag">${esc(e.tag?e.tag[L]:'')}</span>${kn?`<span class="nbk">${esc(kn)}</span>`:''}<h3>${esc(e.t[L])}</h3><p>${esc(e.d[L])}</p>
        ${W&&typeof SHOP!=='undefined'?`<button class="nbgo" data-nb="shop" data-v="${e.ref}">${L?'See it in the shop':'상점에서 보기'} ›</button>`:''}</div></div><button class="nbar r" data-nb="n"${n<2?' disabled':''}>›</button></div>
      <div class="nbf"><div class="nbd">${A.map((_,k)=>`<i class="${k===this.i?'on':''}" data-nb="d" data-v="${k}"></i>`).join('')}</div><button class="nbh2" data-nb="hide">${L?'Don\'t show for 2 hours':'2시간 동안 보지 않기'}</button></div></div>`},
  close(){const o=$('nbWin');if(o)o.remove();clearInterval(this.timer);this.timer=null},
  // first lobby of this page load: wait for the lobby and for a sign-in window already open to close
  boot(){if(this.shown||this.hidden()||!this.list().length)return;this.shown=true;let n=0;
    const tryOpen=()=>{if(G.st!=='menu'||UI.open!=='menu'||$('accWin')||$('shopWin')||$('rkWin')){if(++n<120)setTimeout(tryOpen,800);return}this.open()};setTimeout(tryOpen,1200)}};
(function(){const bt=UI.buildTitle;UI.buildTitle=function(){const r=bt.apply(this,arguments);try{NBAN.boot()}catch(e){console.error(e)}return r};
  const act0=UI.act;UI.act=function(a,v,el){if(a==='nbopen'){NBAN.open();return}return act0.call(this,a,v,el)};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&$('nbWin'))NBAN.close()});
  const sm=startMatch;startMatch=function(cfg){NBAN.close();return sm(cfg)}})();

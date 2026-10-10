'use strict';
// ============ Loadouts: free buying, the gear that carries over between rounds, three saved sets ============
// In a match guns, ammo and gear cost nothing (the account locks of shop.js still apply; money is only the scenario's upgrade budget).
// Grenades and armour come once per round each, the round-start refill included; the Event Horizon is for the accounts that own it:
// once a round, 3 shots. A human's loadout {1,2,3,he,frost,flare,armor} is noted when he goes down or turns (and at the end of the round
// for the living) and handed back at the start of the next round. The player keeps three sets of his own in CFG.sets.
Object.assign(STR.ko,{ldSet:'세트',ldEq:'장착',ldSave:'현재 장비 저장',ldFree:'무료',ldOnce:'라운드 1회',ldUsed:'사용함',ldFull:'가득',ldNyPick:'무료 픽',ldEh:'1회 · 3발',
  ldEhOwn:'보유자 전용',ldCrate:'보급상자 전용',boSet:'정전 이벤트'});
Object.assign(STR.en,{ldSet:'Set',ldEq:'Equip',ldSave:'Save current',ldFree:'FREE',ldOnce:'1 / round',ldUsed:'used',ldFull:'full',ldNyPick:'free pick',ldEh:'1× · 3 rds',
  ldEhOwn:'owners only',ldCrate:'crates only',boSet:'Blackouts'});
const LD_NADES=['he','frost','flare'];
const LD_DEF={1:null,2:'p9',3:'knife',he:0,frost:0,flare:0,armor:0};
// the starting sets: the free guns everyone has
const LD_SETS0=[{1:'g35',2:'p9',3:'knife',he:1,frost:0,flare:0,armor:1},{1:'sg8',2:'p9',3:'knife',he:0,frost:1,flare:0,armor:1},{1:'k5',2:'p9',3:'knife',he:1,frost:1,flare:1,armor:1}];
function ldSets(){if(!Array.isArray(CFG.sets))CFG.sets=[];for(let i=0;i<3;i++)if(!CFG.sets[i]||typeof CFG.sets[i]!=='object')CFG.sets[i]=Object.assign({},LD_SETS0[i]);return CFG.sets}
// what can be taken at all: whatever is on the buy menu (built late: other files add rows to BUY_MENU) and the knife (a set puts it back)
let LD_OK=null;
function ldBuyable(id){let n=0;for(const c of BUY_MENU)n+=c.items.length;if(!LD_OK||LD_OK.n!==n){LD_OK=new Set(['knife']);LD_OK.n=n;for(const c of BUY_MENU)for(const i of c.items)LD_OK.add(i)}return LD_OK.has(id)}
const ldLimited=()=>G.mode!=='range';// the shooting range hands out everything without limits
// does the account own this gun? Only the local player's page knows (a remote player's page has checked before asking the host)
function ldOwns(a,id){return !a.isPlayer||!ACC.on||ACC.owns(id)}
// Event Horizon: owners only, and only with accounts on (offline it stays a supply-crate gun). The host trusts a remote player's request; bots never.
function ehOK(a){if(a.isPlayer)return !!(ACC.on&&ACC.owns('bhole'));return !!(a.net&&!a.bot)}
// locked for the local player: the account locks (shop.js), the Event Horizon rule; a set never spends the 근하신년 free pick
function ldLocked(a,id,set){const W=WPN[id];if(!W)return false;if(id==='bhole')return !ehOK(a);if(set&&W.ny&&!ldOwns(a,id))return true;return !!(a.isPlayer&&typeof shopLocked==='function'&&shopLocked(a,id))}
function ldKitReset(a){a.kit={he:0,frost:0,flare:0,armor:0,bhole:0}}
// why a buy cannot happen, '' when it can: zombie · end · na (not on the menu) · lock · crate · own (has it, ammo full) · full · lim (once a round)
function buyCheck(a,id){if(!a||a.team!==TH||!a.alive)return 'zombie';if(G.st==='end'||G.st==='over')return 'end';if(!ldBuyable(id))return 'na';const K=a.kit||{},lim=ldLimited();
  if(id==='armor')return a.armor>=100?'own':lim&&K.armor?'lim':'';
  if(id==='ammo'){for(const k in a.ammo){const W=WPN[k];if(W&&W.mag&&k!=='bhole'&&a.inv[W.slot]===k&&a.ammo[k].res<W.res)return ''}return 'full'}
  const W=WPN[id];if(!W)return 'na';
  if(id==='bhole'){if(!ehOK(a))return ACC.on?'lock':'crate';return a.inv[1]==='bhole'?'own':lim&&K.bhole?'lim':''}
  if(W.kind==='nade')return a.inv[id]>=1?'own':lim&&K[id]?'lim':'';
  if(a.isPlayer&&typeof shopLocked==='function'&&shopLocked(a,id))return 'lock';
  if(W.kind==='melee')return a.inv[3]===id?'own':'';
  if(a.inv[W.slot]===id){const am=a.ammo[id];return am&&am.res>=W.res?'own':''}
  return ''}
// force: the host has said yes (a client putting its own buy in). o.quiet: no draw and no sound (a set going on)
function buy(a,id,force,o){if(force?(!a||a.team!==TH||!a.alive):buyCheck(a,id))return false;
  const q=!!(o&&o.quiet),K=a.kit||(a.kit={}),L=a.ldo||(a.ldo=Object.assign({},LD_DEF)),done=()=>{if(a.isPlayer&&!q)AU.play('buy',{vol:.6});return true};
  if(id==='armor'){a.armor=100;K.armor=1;return done()}
  if(id==='ammo'){for(const k in a.ammo){const W=WPN[k];if(W&&W.mag&&k!=='bhole'&&a.ammo[k].res<W.res)a.ammo[k].res=W.res}return done()}
  const W=WPN[id];if(!W)return false;
  if(W.kind==='nade'){a.inv[id]=Math.max(1,a.inv[id]|0);K[id]=1;return done()}
  // (a remote player's copy on the host is not drawn here: its weapon in hand comes from its own page)
  if(W.kind==='melee'){a.inv[3]=id;L[3]=id;if(!q&&!a.pup)equip(a,id);return done()}
  if(a.inv[W.slot]===id&&id!=='bhole'){if(!a.ammo[id])fillAmmo(a,id);a.ammo[id].res=W.res;return done()}
  if(W.ny&&a.isPlayer&&a.nyFree>0&&!ldOwns(a,id))a.nyFree--;// the 근하신년 free pick only goes on a gun the account does not own
  a.inv[W.slot]=id;fillAmmo(a,id);gunFresh(a,id);L[W.slot]=id;
  if(id==='bhole'){a.ammo.bhole.res=0;K.bhole=1;a.ehBuy=1}// one magazine a round, no spare
  if(!q&&!a.pup)equip(a,id);return done()}
// money is the scenario's upgrade budget only (damage and kills pay into it there)
function scEarn(a,v){if(G.mode==='scen'&&a&&v>0)a.money=Math.min(16000,(a.money||0)+v)}

// ---------- the loadout that carries over ----------
// guns in hand (a crate-only Event Horizon does not count) or else the last ones picked; the grenades and armour of this round
const ehKeep=a=>!!(a.ehBuy&&!a.bot);// an Event Horizon taken from the buy menu (a bot that took over a player's place loses it)
function ldCur(a){const o=a.ldo||LD_DEF,K=a.kit||{},inv=a.inv||{},n={};
  for(const s of [1,2,3]){const id=inv[s];n[s]=id&&WPN[id]&&(id!=='bhole'||ehKeep(a))?id:o[s]&&(o[s]!=='bhole'||ehKeep(a))?o[s]:s===2?'p9':s===3?'knife':null}
  for(const k of LD_NADES)n[k]=K[k]||inv[k]>0?1:0;n.armor=K.armor||a.armor>0?1:0;return n}
// noted on every page as a human goes down or turns (before his primary drops) and for the living at the round's end
function ldSnap(a){if(a&&a.team===TH)a.ldo=ldCur(a)}
// the start of a round: the noted loadout, fresh ammo, armour if he had it (the refill uses up this round's grenades and armour)
function ldRestore(a){const L=a.ldo||LD_DEF;a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0};a.ammo={};ldKitReset(a);
  for(const s of [1,2,3]){let id=L[s];const W=WPN[id];if(!W||W.slot!==s||id==='bhole'&&!ehKeep(a))id=s===2?'p9':s===3?'knife':null;if(!id)continue;
    a.inv[s]=id;fillAmmo(a,id);gunFresh(a,id);if(id==='bhole'){a.ammo.bhole.res=0;a.kit.bhole=1}}
  for(const k of LD_NADES)if(L[k]){a.inv[k]=1;a.kit[k]=1}
  a.armor=L.armor?100:0;a.kit.armor=L.armor?1:0;a.ldo=Object.assign({},L,{1:a.inv[1],2:a.inv[2],3:a.inv[3]});a.cur=bestWeapon(a);a.prev='knife'}

// ---------- the buy menu ----------
function ldWhy(why,id){const L=LI(),W=WPN[id]||EQUIP[id],n=W?W.n[L]:'';
  if(why==='lock'&&id!=='bhole'){UI.act('buylk',id);return}
  const M={zombie:T('zOnly'),end:L?'The round is over':'라운드가 끝났어요',na:L?'You cannot take that now':'지금은 받을 수 없어요',
    own:L?`You already have the ${n}`:`${n} — 이미 가지고 있어요`,full:L?'Your ammo is full':'탄약이 이미 가득해요',
    lim:L?`${n}: once a round — it comes back next round`:`${n} — 라운드당 한 번이에요 (다음 라운드에 다시 채워져요)`,
    lock:L?'Event Horizon: only for accounts that own it — once a round, 3 shots':'이벤트 호라이즌 — 보유한 계정만 쓸 수 있어요 (라운드당 1번 · 3발)',
    crate:L?'The Event Horizon only comes from supply crates':'이벤트 호라이즌은 보급상자에서만 나와요'};
  HUD.note(M[why]||M.na,why==='lim'||why==='lock'?2.4:1.5);AU.play('dry',{vol:.5})}
// one row of the menu for the player: ok (can be taken), own (has it), lk (locked), t (the right-hand column)
function ldItemState(P,id){const W=WPN[id],why=buyCheck(P,id),own=!!(W&&(W.kind==='nade'?P.inv[id]>0:P.inv[W.slot]===id))||(id==='armor'&&P.armor>=100);
  if(ldLocked(P,id))return {ok:false,own:false,lk:1,t:id==='bhole'?SVG_LOCK+`<small>${T(ACC.on?'ldEhOwn':'ldCrate')}</small>`:shopLockTag(id)};// shop.js: where a locked gun comes from
  let t='';if(own)t=T('owned');else if(why==='lim')t=T('ldUsed');else if(why==='full')t=T('ldFull');else if(id==='bhole')t=T('ldEh');
  else if(W&&W.ny&&P.nyFree>0&&!ldOwns(P,id))t=T('ldNyPick');else if((id==='armor'||W&&W.kind==='nade')&&ldLimited())t=`<small>${T('ldOnce')}</small>`;
  return {ok:!why||why==='own',own,lk:0,t}}
// the three sets, over the categories (mob: the touch layout)
function ldSetsHTML(P,mob){const L=LI();
  const ic=(id,h,k)=>{const W=WPN[id];if(!W||!W.model)return '';const lk=P&&ldLocked(P,id,true);return `<i class="lsg ${k}${lk?' lk':''}" title="${esc(W.n[L])}"><img src="${gunIcon(W.model,h)}" alt="">${lk?SVG_LOCK:''}</i>`};
  return `<div class="lsets${mob?' m':''}">${ldSets().map((s,i)=>`<div class="lset"><div class="lsh"><b>${T('ldSet')} ${i+1}</b>${mob?'':`<kbd>Shift+${i+1}</kbd>`}</div>
    <div class="lsi">${ic(s[1],mob?17:20,'s1')}${ic(s[2],mob?15:18,'s2')}${ic(s[3],mob?15:18,'s3')}<span class="lsn">${LD_NADES.filter(k=>s[k]&&WPN[k]).map(k=>`<i class="lsg n" title="${esc(WPN[k].n[L])}"><img src="${gunIcon(WPN[k].model,14)}" alt=""><em>×${s[k]}</em></i>`).join('')}</span>${s.armor?`<b class="lsa" title="${esc(EQUIP.armor.n[L])}">◆</b>`:''}</div>
    <div class="lsb"><button class="lse" data-act="lsEq" data-v="${i}">${T('ldEq')}</button><button data-act="lsSave" data-v="${i}">${T('ldSave')}</button></div></div>`).join('')}</div>`}
// put a whole set on: the melee weapon, grenades and armour first, the pistol, then the primary (drawn once at the end).
// Locked guns are skipped with a note. A client asks the host for each piece (the usual 'buy'); the answers go in quietly.
function ldEquipSet(i){const P=G.player,s=ldSets()[i],L=LI();if(!P||!s)return;if(P.team!==TH||!P.alive){HUD.note(T('zOnly'),1.5);return}if(G.st==='end'||G.st==='over'){ldWhy('end');return}
  const ids=[],skip=[];
  for(const id of [s[3],s.he&&'he',s.frost&&'frost',s.flare&&'flare',s.armor&&'armor',s[2],s[1]]){if(!id||!WPN[id]&&!EQUIP[id])continue;
    if(ldLocked(P,id,true)){skip.push(id);continue}const why=buyCheck(P,id);if(!why)ids.push(id);else if(why!=='own'&&why!=='lim'&&why!=='full')skip.push(id)}
  const nm=id=>(WPN[id]||EQUIP[id]).n[L];
  HUD.note(`${T('ldSet')} ${i+1}${L?' equipped':' 장착'}${skip.length?(L?' · skipped: ':' · 건너뜀: ')+skip.map(nm).join(', '):''}`,skip.length?2.6:1.6);
  Main.closeOverlay();
  if(!ids.length){AU.play('ui',{vol:.4});return}
  const S={n:ids.length,got:0,gun:false,fail:[]};
  if(NET.cli){for(const id of ids)ldAsk(P,id,S);return}
  for(const id of ids){if(buy(P,id,false,{quiet:1})){S.got++;if(WPN[id]&&WPN[id].kind!=='nade')S.gun=true}else S.fail.push(id)}
  ldSetDone(P,S)}
function ldSetDone(P,S){if(S.got){if(S.gun&&P.alive&&P.team===TH)equip(P,bestWeapon(P));AU.play('buy',{vol:.6})}
  if(S.fail.length)HUD.note((LI()?'Not taken: ':'받지 못함: ')+S.fail.map(id=>(WPN[id]||EQUIP[id]).n[LI()]).join(', '),2);if(Main.overlay==='buy')UI.renderBuy()}
function ldSaveSet(i){const P=G.player,L=LI();if(!P||P.team!==TH||!P.alive){HUD.note(T('zOnly'),1.5);return}
  ldSets()[i]=ldCur(P);saveCfg();AU.play('uiok',{vol:.4});HUD.note(L?`Saved to set ${i+1}`:`세트 ${i+1}에 저장했어요`,1.6);if(Main.overlay==='buy')UI.renderBuy()}
// a client asks the host (the usual 'buy') and the answers come back one by one, in order (net.js buyok / buyno): each is matched with its
// request, the pieces of a set go in quietly and the gun is drawn after the set's last answer
function ldAsk(P,id,S){(P.bq||(P.bq=[])).push({id,S});netToHost({t:'buy',w:id})}
function ldAnswer(P,id){const q=P.bq||[],i=q.findIndex(e=>e.id===id);return i<0?null:q.splice(i,1)[0]}
function ldBuyOk(id){const P=G.player;if(!P)return;const e=ldAnswer(P,id),S=e&&e.S;const ok=buy(P,id,true,S?{quiet:1}:null);
  if(S){S.n--;if(ok){S.got++;if(WPN[id]&&WPN[id].kind!=='nade')S.gun=true}else S.fail.push(id);if(S.n<=0)ldSetDone(P,S)}
  else if(ok&&Main.overlay==='buy')UI.renderBuy()}
function ldBuyNo(id){const P=G.player;if(!P)return;const e=ldAnswer(P,id),S=e&&e.S;if(S){S.n--;S.fail.push(id);if(S.n<=0)ldSetDone(P,S);return}ldWhy('na',id)}

(function(){
  // the Event Horizon has a row of the special category (its own rule above); the lobby shop lists it once
  const sp=BUY_MENU.find(c=>c.k==='special');if(sp&&!sp.items.includes('bhole'))sp.items.push('bhole');
  const sc=shopCats;shopCats=function(){const r=sc.apply(this,arguments);for(const c of r){const s=new Set();c.items=c.items.filter(i=>!s.has(i)&&s.add(i))}return r};
  const a0=UI.act;UI.act=function(a,v,el){if(a==='lsEq'){ldEquipSet(+v);return}if(a==='lsSave'){ldSaveSet(+v);return}return a0.call(this,a,v,el)};
})();

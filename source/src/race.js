'use strict';
// ============ 무기 레이스 (v6.51): every kill moves you to the next gun; a knife kill on the last step, the knife, wins ============
// A 대인전 mode played like 개인전 (G.pvp, a side of one's own, back 3 s after a death with 2 s of protection). Nobody picks weapons:
// everyone carries the gun of his step (RACE.ladder(): 10 / 15 / 20 steps from the room's pg, rifles → machine gun → SMGs → shotguns →
// snipers → pistols → the knife) and the knife. A kill hands over the next gun on the spot (a fresh magazine, a quick draw); a knife kill
// also sets the victim back a step. The last step is the knife alone, and a knife kill there wins. When the clock (5 / 8 / 10 min)
// runs out, the highest step wins (then kills, then fewer deaths). The host works the steps out and sends them with the kill (pk.rl);
// a client's hit claim has to come from its gun, the one before it (a level-up still on its way) or the knife.
Object.assign(STR.ko,{race:'무기 레이스',
  raceD:'모두가 적. 처치할 때마다 다음 무기로 바뀌고, 마지막 칼 단계에서 칼로 처치하면 우승. 칼에 당하면 한 단계 내려가요. 쓰러져도 3초 뒤 부활 · 무기는 고를 수 없어요. 시간이 끝나면 가장 높은 단계가 우승.',
  pLadder:'단계 수',lvl:'단계'});
Object.assign(STR.en,{race:'Arms Race',
  raceD:'Everyone is an enemy. Every kill moves you to the next gun; a knife kill on the last step, the knife, wins. A knife kill on you sets you back a step. The fallen are back 3 s later; nobody picks weapons. When time runs out, the highest step wins.',
  pLadder:'Steps',lvl:'Level'});
const RACE={
  LADDERS:{10:['kv47','ar7','pd50','k5','m14','r700','sr8','d50','p9','knife'],
    15:['ar7','kv47','hr17','g35','hmg','pd50','um45','k9','m14','sg8','r700','sr8','d50','p9','knife'],
    20:['kv47','ar7','ar5c','hr17','g35','mg6','hmg','pd50','um45','k5','k9','as12','m14','sg8','dm14','r700','sr8','d50','p9','knife']},
  L:null,bar:null,barK:'',
  setup(){this.L=this.LADDERS[PVP.goal]||this.LADDERS[15]},
  ladder(){return this.L||this.LADDERS[15]},
  lv(a){return clamp(a&&a.raceLv|0,0,this.ladder().length-1)},
  wep(a){return this.ladder()[this.lv(a)]},
  // what a hit may come from: the gun of this step, the one before it (a level-up the client has not seen yet) or the knife
  okWep(a,w){if(w==='knife')return true;const L=this.ladder(),i=this.lv(a);return w===L[i]||i>0&&w===L[i-1]},
  name(id){const W=WPN[id];return W&&W.n?W.n[LI()]:id},
  // the kit of a life: the gun of this step (a full magazine and its spare), the knife, armour
  kit(a){const id=this.wep(a);a.inv={1:null,2:null,3:'knife',he:0,frost:0,flare:0};a.ammo={};ldKitReset(a);
    if(id!=='knife'){const W=WPN[id];a.inv[W.slot]=id;fillAmmo(a,id)}a.armor=100;a.kit.armor=1;a.cur=id;a.prev='knife'},
  // a level-up while alive: the old gun goes, the next one comes out
  give(a){const id=this.wep(a);for(const s of [1,2])if(a.inv[s]&&a.inv[s]!==id){delete a.ammo[a.inv[s]];a.inv[s]=null}
    if(id!=='knife'){const W=WPN[id];a.inv[W.slot]=id;fillAmmo(a,id)}a.reloadT=0;a.relKind=null;equip(a,id);a.prev='knife'},// (Q goes to the knife and back)
  // a kill: the killer a step up (a knife kill on the last step wins), a knife kill sets the victim one back. The host works it out and
  // puts it on the kill (o.rl, sent as pk.rl); a client takes the host's numbers. Returns the winner's id on the host
  onKill(t,src,o){const N=this.ladder().length,P=G.player,L=LI(),knife=o.w==='knife',lv0=src?this.lv(src):0;let win=null;
    if(Array.isArray(o.rl)){if(src)src.raceLv=o.rl[0]|0;t.raceLv=o.rl[1]|0}
    else{if(src&&src!==t){if(lv0===N-1&&knife)win=src.id;else src.raceLv=Math.min(N-1,lv0+1)}if(knife&&src&&src!==t)t.raceLv=Math.max(0,this.lv(t)-1);o.rl=[src?this.lv(src):0,this.lv(t)]}
    const up=src&&src!==t&&this.lv(src)>lv0;if(up&&src.alive)this.give(src);
    if(up&&src===P){const lv=this.lv(P);AU.play('lvlup',{vol:.5});
      if(lv===N-1)HUD.announce(L?'THE KNIFE — one more':'마지막 칼 단계!','w',2);HUD.note(lv===N-1?(L?'A knife kill wins it':'칼로 처치하면 우승'):`${L?'Level':'단계'} ${lv+1}/${N} · ${this.name(this.wep(P))}`,2.2)}
    else if(up&&this.lv(src)===N-1)HUD.note(L?`${src.name} is on the knife`:`${src.name} — 칼 단계 도달`,2.5);
    if(t===P&&knife&&src&&src!==t)HUD.note(L?'Knifed — down a step':'칼에 당했어요 — 한 단계 내려가요',2.4);
    return win},
  // the HUD: the top bar (my step, the leader's, my place) and the ladder bar under it (my gun, the next, a dot per step)
  hud(dt,set){const P=G.player,e=HUD.el,L=LI(),N=this.ladder().length,O=PVP.order(G.actors),rk=O.indexOf(P)+1,top=O.find(a=>a!==P);
    set(e.hRound,`${T('race')} · ${N}${L?' steps':'단계'}`);set(e.hSH,String(this.lv(P)+1));set(e.hSZ,String(top?this.lv(top)+1:0));
    set(e.hAH,L?`Rank ${rk}/${O.length}`:`순위 ${rk}/${O.length}`);set(e.hAZ,top?(rk===1?(L?`2nd ${top.name}`:`2위 ${top.name}`):(L?`1st ${O[0].name}`:`1위 ${O[0].name}`)):'');
    if(!this.bar){const b=document.createElement('div');b.id='rcBar';$('hud').appendChild(b);this.bar=b}
    const me=this.lv(P),ld=O[0]===P?(top?this.lv(top):-1):this.lv(O[0]),k=me+':'+ld+':'+N+':'+L;
    if(k!==this.barK){this.barK=k;const Ld=this.ladder(),cur=Ld[me],nx=Ld[me+1];let dots='';for(let i=0;i<N;i++)dots+=`<i class="${i<=me?'me':''}${i===ld?' ld':''}${i===N-1?' kn':''}"></i>`;
      this.bar.innerHTML=`<b>${L?'LV':'단계'} ${me+1}/${N}</b><span class="cur"><img src="${weaponIcon(cur,16)}">${esc(this.name(cur))}</span>${nx?`<i class="ar">▶</i><span class="nx"><img src="${weaponIcon(nx,14)}">${esc(this.name(nx))}</span>`:''}<span class="seg">${dots}</span>`}
    if(this.bar.style.display!=='flex')this.bar.style.display='flex'},
  off(){if(this.bar)this.bar.style.display='none';this.barK=''},
};

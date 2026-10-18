'use strict';
// ============ 폭파미션 (v6.50): bomb defusal on a map with two bomb sites (MAPDEFS[id].bomb: the 항만 터미널) ============
// A 대인전 mode (G.pvp, pvp.js does the fighting, the kits, the kill feed and the scoreboard): BLUE (side 0) against RED (side 1) in rounds,
// no respawns. The first half RED attacks, then the roles swap (BOMB.att()). Attackers start at MAP.zspawns, defenders at MAP.spawns.
// A round: 6 s frozen at the start (buying), then 1:45. One attacker carries the bomb (C4): inside a site (centre and radius from the
// map) he holds E for 3.2 s to plant it, which turns the clock into the bomb's 40 s. A defender holds E next to it for 6 s to defuse.
// Attackers win when the bomb goes off or every defender is down; defenders when it is defused, every attacker is down before a
// plant, or the time runs out without one. Dropped by a dead carrier, the bomb lies where he fell until an attacker walks over it.
// First side to BOMB.W rounds (4 / 6 / 8) wins the match. Weapons can be changed for 20 s into each round; the dead come back with
// their loadout at the next round, the living keep theirs (refilled, armour every round).
// The host owns everything (events bst: the bomb's state, bact: a plant or defuse starting or stopping, bend: a round's end; the start is
// the usual 'round' with the placements and the carrier); a client asks to plant or defuse with 'bu' and the host checks it.
Object.assign(STR.ko,{bomb:'폭파미션',
  bombD:'블루 대 레드, 라운드제 · 부활 없음. 공격팀은 폭탄을 A나 B 사이트에 설치(E 길게 3초)해 터뜨리고, 수비팀은 막거나 해체(E 길게 6초)해요. 한쪽이 전멸해도 라운드 끝. 전반이 끝나면 공수 교대 — 목표 승수를 먼저 채운 팀이 승리.',
  pWins:'목표 승수',win:'승'});
Object.assign(STR.en,{bomb:'Bomb Defusal',
  bombD:'BLUE vs RED in rounds, no respawns. The attackers plant the bomb on site A or B (hold E for 3 s) and let it go off; the defenders stop them or defuse it (hold E for 6 s). Wiping out the other side also wins a round. The sides swap at half time — first to the round goal wins.',
  pWins:'Rounds to win',win:'wins'});
// ---------- the bomb's model (the weapon atlas): four blocks taped together, a timer with a green display, a red light, two wires ----------
Object.assign(GUNS,{c4:{parts:[Pt(-.085,.03,0,.16,.06,.22,'tan'),Pt(.085,.03,0,.16,.06,.22,'tan'),Pt(-.085,.09,0,.16,.06,.22,'tan2'),Pt(.085,.09,0,.16,.06,.22,'tan2'),
    Pt(0,.062,-.07,.352,.128,.026,'blk'),Pt(0,.062,.07,.352,.128,.026,'blk'),Pt(0,.137,0,.15,.03,.1,'blk2'),Pt(0,.153,-.016,.09,.004,.034,'heGreen'),Pt(0,.153,.026,.08,.004,.03,'steel'),
    Pt(.058,.157,-.03,.014,.01,.014,'red'),Pt(-.05,.13,.06,.007,.007,.08,'red',{rx:.4}),Pt(.05,.13,.06,.007,.007,.08,'yellow',{rx:.4})],grip:[0,0,0],muzzle:[0,.15,0]}});
// ---------- sounds ----------
Object.assign(SFX,{
  c4beep:{n:1,dur:.16,peak:.7,gain:.5,rev:.05,pj:0,fn:B=>tone(B,0,2350,.07,.6,'square')},
  c4key:{n:3,dur:.14,peak:.6,gain:.42,rev:.03,pj:0,fn:(B,v)=>{tone(B,0,[1209,1336,1477][v],.06,.5,'sine');B.grain(0,3000,2,.004,.3)}},
  c4arm:{n:1,dur:1.1,peak:.8,gain:.55,rev:.2,pj:0,fn:B=>{for(const [t,f] of [[0,1568],[.16,1568],[.32,2093]])tone(B,t,f,.12,.55,'square')}},
  c4def:{n:2,dur:.5,peak:.7,gain:.45,rev:.05,fn:B=>{for(let i=0;i<4;i++)B.grain(i*.09,rr(2400,3600),3,.01,.6)}},
  c4done:{n:1,dur:.9,peak:.8,gain:.5,rev:.2,pj:0,fn:B=>{tone(B,0,1046.5,.18,.5,'sine');tone(B,.14,1568,.3,.5,'sine')}}});
SFX_ORDER.push('c4beep','c4key','c4arm','c4def','c4done');
STR.ko.keys.push(['E (길게)','폭파미션 — 폭탄 설치 · 해체']);STR.en.keys.push(['E (hold)','Bomb Defusal — plant · defuse the bomb']);
const _bmV=new THREE.Vector3();
const BOMB={FREEZE:6,ROUND:105,TIMER:40,PLANT:3.2,DEFUSE:6,BUYT:20,ENDT:5,REACH:1.7,KR:15,MR:30,WINS:[4,6,8],
  W:6,half:5,b:{st:'none'},final:false,site:'A',beepT:0,mesh:null,led:null,mkL:null,mkE:null,pbar:null,ctr:null,
  on(){return G.mode==='bomb'},
  D(){return (MAPDEFS[MAP.id]||{}).bomb||null},
  winOpts(){const L=LI();return this.WINS.map((w,i)=>[i,L?`first to ${w}`:`${w}${T('win')}`])},
  // the side attacking this round: RED for the first half, BLUE after it
  att(){return G.round>this.half?0:1},
  isAtt(a){return !!a&&(a.side===1?1:0)===this.att()},
  sites(){const D=this.D();return D?[['A',D.A],['B',D.B]]:[]},
  // the site a spot is in (a level within 3.5 m of the ground)
  siteAt(x,y,z){for(const [k,s] of this.sites())if(Math.hypot(x-s.x,z-s.z)<=s.r&&y<3.5)return k;return null},
  setup(cfg){const i=clamp(cfg.pw==null?1:+cfg.pw|0,0,this.WINS.length-1);this.W=this.WINS[i];this.half=this.W-1;G.rounds=this.W*2-1;this.final=false;this.b={st:'none'};this.clearFx()},
  carrier(){const b=this.b;return b.st==='carried'?b.by:null},

  // ---------- a round ----------
  // the host: placements (attackers at the attack start, defenders at theirs), the bomb to a random attacker; a client: the host's plan
  begin(plan){if(NET.cli&&!plan)return;if(!PVP.assigned)PVP.assign();AU.stopAll('countdown');dropsClear();
    const first=plan?plan.n===1:G.round===0;G.round=plan?plan.n:G.round+1;G.rounds=this.W*2-1;if(first){G.score=[0,0];this.final=false}
    G.st='prep';G.time=this.FREEZE;FX.clearLimbs();G.moralePts=0;G.moraleLvl=0;G.lastHuman=null;G.spec=null;G.deathCam=0;G.killer=null;G.winner=-1;G.beepAt=this.FREEZE+1;G.hostN=0;G.pvpKC=null;
    clearNades();NY.clear();for(const l of DL.list)if(l.flare)l.dead=true;this.clearFx();PVP.intel=[[],[]];PVP.hits=[];
    const pm={},out=[];if(plan)for(const q of plan.P||[])pm[q[0]]=q;const S=plan?null:this.spots();
    for(const a of G.actors){if(!first&&a.alive)ldSnap(a);PVP.fresh(a);a.r0={k:a.kills,i:a.infects,dm:a.dmgDealt,sc:a.score||0,hs:a.hsKills|0};a.bAct=null;a.dmgRound=0;
      if(a.bot&&!a.pup&&(first||Math.random()<.25))a.ldo=PVP.botLd();PVP.kit(a);
      const q=pm[a.id];if(q)placeAt(a,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);else{const p=S&&S.get(a)||[0,1,0,0];placeAt(a,p[0],p[1],p[2],p[3])}
      ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;a.pvpProt=0;a.pvpRT=null;a.pvpBuy=G.t+this.FREEZE+this.BUYT;a.pvpSpawnT=G.t;
      if(NET.host){out.push([a.id,r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw),0]);if(a.net&&!a.isPlayer)a.pvpSp={x:a.c.x,z:a.c.z,t:G.t}}
      if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)PVP.botInit(a);if(typeof HSK!=='undefined')HSK.clear(a)}
    // the bomb: the plan says who has it; the host picks a random attacker
    const A=G.actors.filter(a=>this.isAtt(a)),cid=plan&&plan.bb!=null?plan.bb:(A.length?rpick(A).id:-1),c=PVP.byId(cid);
    this.b=c?{st:'carried',by:c}:{st:'none'};
    if(!plan)this.botPlan();
    BO.reset();BO.next=1e9;SUP.reset();FX.clearDecals();HUD.roundStart();
    const L=LI(),P=G.player,me=P&&this.isAtt(P);
    HUD.announce(`${T('round')} ${G.round} · ${me?(L?'ATTACK':'공격'):(L?'DEFEND':'수비')}`,me?'z':'h',2.4);
    if(G.round===this.half+1&&!first)HUD.note(L?'Half time — the sides have swapped':'후반전 — 공수 교대',4);
    else HUD.note(me?(this.carrier()===P?(L?'You have the bomb — hold E on site A or B to plant it':'폭탄을 가졌어요 — A나 B 사이트에서 E를 길게 눌러 설치'):(L?'Plant the bomb on A or B, or wipe them out':'폭탄을 A나 B에 설치하거나 적을 전멸시키세요'))
      :(L?'Stop the plant — if it goes in, hold E on it for 6 s':'설치를 막으세요 — 설치되면 폭탄 옆에서 E를 6초 눌러 해체'),5);
    AU.play('siren',{vol:.25});AU.muSet&&AU.muSet('prep');if(first)PVP.autoSet();
    if(NET.host)netEv('round',{n:G.round,P:out,bb:cid})},
  // placements: each side at its start, spread over the spots (and around them when there are more people than spots)
  spots(){const M=new Map(),P=p=>({x:p[0],y:p[2]||0,z:p[1]}),SC=[(MAP.spawns||[]).map(P),(MAP.zspawns||[]).map(P)];// [defenders, attackers]
    for(const k of [0,1]){if(!SC[k].length)SC[k]=PVP.around({x:0,y:0,z:0},20)}
    const cen=L=>PVP.cen(L),ce=[cen(SC[0]),cen(SC[1])];
    for(const k of [0,1]){const L=shuffle(SC[k].slice()),T0=G.actors.filter(a=>(this.isAtt(a)?1:0)===k),o=ce[1-k];
      T0.forEach((a,i)=>{const p=L[i%L.length],j=Math.floor(i/L.length);M.set(a,[p.x+(j?rr(-.8,.8):0),p.y,p.z+(j?rr(-.8,.8):0),PVP.yawTo(p.x,p.z,o.x,o.z)+rr(-.25,.25)])})}
    return M},
  go(remote){if(G.st!=='prep')return;G.st='fight';G.time=this.ROUND;const L=LI();HUD.announce(L?'GO!':'작전 개시!','w',1.4);AU.play('beep2',{vol:.6});AU.muSet&&AU.muSet('fight');
    if(NET.host&&!remote)netEv('pgo',{})},
  update(dt){
    if(G.st==='prep'){G.time-=dt;const s=Math.ceil(G.time);if(s<G.beepAt&&s>=1){G.beepAt=s;if(s<=3)AU.play('beep',{vol:.5})}if(G.time<=0){if(NET.cli)G.time=0;else this.go()}}
    else if(G.st==='fight'){G.time-=dt;PVP.played+=dt;for(const I of PVP.intel)while(I.length&&G.t-I[0].t>12)I.shift();
      this.myUse(dt);this.acts(dt);
      if(!NET.cli){const b=this.b;if(b.st==='carried'&&(!b.by||!G.actors.includes(b.by)||!b.by.alive)){if(b.by&&G.actors.includes(b.by))this.drop(b.by);else this.b={st:'none'}}this.pickup();this.check()}
      if(G.st==='fight'&&this.b.st==='planted')AU.muSet&&AU.muSet('intense')}
    else if(G.st==='end'){G.endT-=dt;if(G.endT<=0&&!NET.cli){if(this.final){G.st='over';UI.showResults();if(NET.host)netEv('over')}else startRound()}}
    this.fx(dt)},
  // who has won the round (the host)
  check(){const b=this.b,at=this.att(),df=1-at;let nA=0,nD=0,hA=0,hD=0;
    for(const a of G.actors){const s=(a.side===1?1:0)===at;if(s){hA++;if(a.alive)nA++}else{hD++;if(a.alive)nD++}}
    if(b.st==='planted'){if(G.time<=0){this.explode();return}if(hD&&!nD){this.end(at,'elim');return}return}
    if(hD&&!nD){this.end(at,'elim');return}if(hA&&!nA){this.end(df,'elim');return}if(G.time<=0)this.end(df,'time')},
  // a round's end: the score, the call, the next round (or the match when a side has its wins)
  end(w,why,remote,fin){if(G.st!=='fight'&&!(remote&&G.st==='prep'))return;
    if(!remote){G.score[w]=(G.score[w]|0)+1;fin=G.score[w]>=this.W}
    for(const a of G.actors){a.bAct=null;a.cmd.fire=a.cmd.alt=false}
    const L=LI(),S=PVP.SIDES,P=G.player,won=P&&(P.side===1?1:0)===w;
    const W0={elim:['적 전멸','Wiped out'],time:['시간 종료','Time ran out'],bomb:['목표 폭파','Target destroyed'],defuse:['폭탄 해체','Bomb defused']}[why]||['',''];
    HUD.announce(`${S[w].n[L]} ${L?'win':'승리'} — ${W0[L]}`,w?'z':'h',3.2);HUD.note(`${S[0].n[L]} ${G.score[0]|0} : ${G.score[1]|0} ${S[1].n[L]}`,4);
    if(why==='bomb')this.boomFx();if(why==='defuse')AU.play('c4done',{vol:.7});
    if(NET.host&&!remote)netEv('bend',{w,why,sc:G.score.slice(),f:fin?1:0});
    if(fin){this.final=true;PVP.finish(w,remote);return}
    G.st='end';G.endT=this.ENDT;G.winner=w;AU.play(won?'stingH':'stingZ',{vol:.55});AU.muSet&&AU.muSet(won?'win':'dead')},

  // ---------- the bomb: carried, dropped, picked up, planted, defused, gone off ----------
  drop(a){const b=this.b;if(b.by!==a||b.st!=='carried')return;const f=floorBelow(a.c.x,a.c.y+.6,a.c.z,.1),y=f>-1e8?f:a.c.y;
    this.b={st:'dropped',by:null,x:a.c.x,y,z:a.c.z,rot:Math.random()*TAU};
    if(NET.host)netEv('bst',{s:'d',p:[r2(a.c.x),r2(y),r2(a.c.z)]});const P=G.player;if(P&&this.isAtt(P)&&P!==a)HUD.note(LI()?'The bomb was dropped — pick it up':'폭탄이 떨어졌어요 — 주우세요',2.5)},
  // an attacker who walks over the dropped bomb takes it (the host)
  pickup(){const b=this.b;if(b.st!=='dropped')return;for(const a of G.actors){if(!a.alive||!this.isAtt(a))continue;if(Math.hypot(a.c.x-b.x,a.c.z-b.z)<1.25&&Math.abs(a.c.y-b.y)<1.4){this.take(a);return}}},
  take(a){this.b={st:'carried',by:a};a.bmWayOk=true;a.bmPlant=null;if(NET.host)netEv('bst',{s:'c',i:a.id});if(a.isPlayer){AU.play('pickup',{vol:.6});HUD.note(LI()?'You have the bomb — hold E on A or B':'폭탄을 주웠어요 — A나 B에서 E 길게',2.5)}},
  planted(a,p,site){const L=LI();this.b={st:'planted',by:null,x:p[0],y:p[1],z:p[2],site,tl:this.TIMER,planter:a?a.id:-1,rot:a?a.yaw:0};G.time=this.TIMER;this.beepT=0;
    if(a)a.bAct=null;for(const t of G.actors)if(t.bAct&&t.bAct.k==='plant')t.bAct=null;
    HUD.announce(L?`Bomb planted — ${site}`:`폭탄 설치 — ${site} 사이트`,'z',2.6);AU.play('c4arm',{vol:.75});
    if(NET.host)netEv('bst',{s:'p',i:a?a.id:-1,p:[r2(p[0]),r2(p[1]),r2(p[2])],k:site})},
  explode(){const b=this.b;if(b.st!=='planted')return;const src=PVP.byId(b.planter);
    for(const t of G.actors){if(!t.alive)continue;const d=Math.hypot(t.c.x-b.x,t.c.y+1-b.y,t.c.z-b.z);if(d>=this.MR)continue;
      const dmg=d<=this.KR?999:120*(this.MR-d)/(this.MR-this.KR);const ab=t.armor>0?Math.min(t.armor,dmg*.25):0;t.armor-=ab;t.hp-=dmg-ab;
      if(t.isPlayer){HUD.hurt(1);FX.shake=Math.max(FX.shake,1)}if(t.hp<=0)PVP.kill(t,src&&foe(src,t)?src:null,{w:'c4',dir:[(t.c.x-b.x)/(d||1),.3,(t.c.z-b.z)/(d||1)]})}
    this.end(this.att(),'bomb')},
  // the explosion on every page: a ball of fire, debris, a long rumble; the screen shakes near it
  boomFx(){const b=this.b;if(b.st!=='planted')return;const x=b.x,y=b.y,z=b.z;FX.explode(x,y,z,'he');
    for(let i=0;i<6;i++){const a=i/6*TAU;FX.explode(x+Math.cos(a)*2.4,y+rr(.2,1.4),z+Math.sin(a)*2.4,'he')}
    for(let i=0;i<26;i++){const a=Math.random()*TAU,s=rr(2,9);FX.spawn({x,y:y+.5,z,vx:Math.cos(a)*s,vy:rr(2,9),vz:Math.sin(a)*s,life:rr(.6,1.4),s0:1.4,s1:4.2,r:1,g:rr(.4,.65),b:.18,f:11,drag:1.6,add:1})}
    for(let i=0;i<40;i++){const a=Math.random()*TAU,s=rr(.5,5);FX.spawn({x,y:y+1,z,vx:Math.cos(a)*s,vy:rr(1,6),vz:Math.sin(a)*s,life:rr(3,6),s0:2,s1:7,r:.18,g:.17,b:.16,a:.7,f:2,drag:1.2,grav:-.4,fadeIn:.1,lit:1})}
    DL.add(x,y+3,z,'#ffb060',40,5,1.4);AU.at('explode',x,y+1,z,{vol:1,range:220,occ:false,rate:.62});AU.play('thunder',{vol:.45});
    const P=G.player;if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<60){FX.shake=Math.max(FX.shake,1.4-d/50);AU.shock(1-d/70)}}
    this.b={st:'gone',x,y,z}},

  // ---------- planting and defusing ----------
  // what E does for this actor here and now: 'plant' (the carrier on a site, on his feet), 'defuse' (a defender at the planted bomb)
  canAct(a){if(G.st!=='fight'||!a||!a.alive)return null;const b=this.b;
    if(b.st==='carried'&&b.by===a&&(a.c.onGround||a.net&&!a.isPlayer)&&this.siteAt(a.c.x,a.c.y,a.c.z))return 'plant';// (a remote player's feet are his own page's business)
    if(b.st==='planted'&&!this.isAtt(a)&&Math.hypot(a.c.x-b.x,a.c.z-b.z)<this.REACH&&Math.abs(a.c.y-b.y)<1.3)return 'defuse';return null},
  start(a,k,remote){if(a.bAct&&a.bAct.k===k)return;a.bAct={k,t:0};AU.at(k==='plant'?'c4key':'c4def',a.c.x,a.c.y+.8,a.c.z,{vol:.7,range:30});
    // the defuse kit's clicks carry: attackers' bots within 35 m come to look
    if(k==='defuse'&&!NET.cli)for(const t of G.actors)if(t.bot&&t.alive&&this.isAtt(t)&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<35&&!t.bot.tg)t.bot.lkp={x:a.c.x+rr(-1,1),y:a.c.y,z:a.c.z+rr(-1,1),t:G.t,h:1};
    if(NET.host&&!remote)netEv('bact',{i:a.id,k:k==='plant'?1:2})},
  stop(a,remote){if(!a.bAct)return;a.bAct=null;if(NET.host&&!remote)netEv('bact',{i:a.id,k:0})},
  // my own E (or the touch ⚡ button): start, hold, let go. A client asks the host ('bu'); the bar on its screen runs on its own
  myUse(dt){const P=G.player;if(!P)return;const want=!!(Main.keys&&Main.keys.KeyE)||(typeof TOUCH!=='undefined'&&TOUCH.on&&TOUCH.btn&&[...TOUCH.btn.values()].some(b=>b.id==='skill'));
    const k=want&&!Main.overlay?this.canAct(P):null;
    if(k){if(!P.bAct||P.bAct.k!==k){if(NET.cli){P.bAct={k,t:0};AU.play(k==='plant'?'c4key':'c4def',{vol:.6});netSend(NET.hostKey,{t:'bu',on:1})}else this.start(P,k)}}
    else if(P.bAct){if(NET.cli){P.bAct=null;netSend(NET.hostKey,{t:'bu',on:0})}else this.stop(P)}
    if(NET.cli&&P.bAct)P.bAct.t+=dt},
  // the host runs every plant and defuse: still valid, moving on, done
  acts(dt){if(NET.cli)return;for(const a of G.actors){const x=a.bAct;if(!x)continue;if(this.canAct(a)!==x.k){this.stop(a);continue}x.t+=dt;
      if(x.k==='plant'&&x.t>=this.PLANT){const f=floorBelow(a.c.x,a.c.y+.6,a.c.z,.1);this.planted(a,[a.c.x,f>-1e8?f:a.c.y,a.c.z],this.siteAt(a.c.x,a.c.y,a.c.z));return}
      if(x.k==='defuse'&&x.t>=this.DEFUSE){this.stop(a);this.end(1-this.att(),'defuse');return}}},

  // ---------- on every frame: the bomb's model, its light and beeps ----------
  clearFx(){if(this.mesh)this.mesh.visible=false;if(this.led){this.led.dead=true;this.led=null}},
  fx(dt){const b=this.b;if(!this.mesh&&(b.st==='carried'||b.st==='dropped'||b.st==='planted')){this.mesh=new THREE.Mesh(gunGeo('c4'),matGun());this.mesh.matrixAutoUpdate=true;R.scene.add(this.mesh)}
    const m=this.mesh;if(!m)return;const P=G.player;let vis=false;
    if(b.st==='carried'&&b.by&&b.by.alive){const a=b.by,me=a===P&&!G.spec&&P.alive;if(!me){const s=Math.sin(a.yaw),c=Math.cos(a.yaw),h=a.duck?.86:1.16;
        m.position.set(a.c.x+s*.2,a.c.y+h,a.c.z+c*.2);m.rotation.set(Math.PI/2-.12,a.yaw,0,'YXZ');vis=true}}
    else if(b.st==='dropped'||b.st==='planted'){m.position.set(b.x,b.y+.005,b.z);m.rotation.set(0,b.rot||0,0);vis=true}
    m.visible=vis;if(vis)sampleProbe(m.position.x,m.position.y+.3,m.position.z,m.material.uniforms.uProbe.value);
    if(b.st==='planted'&&G.st==='fight'){b.tl=Math.max(0,G.time);this.beepT-=dt;
      if(this.beepT<=0){const f=clamp(b.tl/this.TIMER,0,1);this.beepT=.1+.9*Math.pow(f,1.4);AU.at('c4beep',b.x,b.y+.2,b.z,{vol:.75,range:50});
        if(!this.led)this.led=DL.add(b.x,b.y+.35,b.z,'#ff2a1a',3.2,0,0);this.led.i=1.6}
      if(this.led)this.led.i=Math.max(0,this.led.i-dt*9)}
    else if(this.led){this.led.dead=true;this.led=null}},

  // ---------- bots ----------
  // the round's plan (the host): the attackers' site and each one's way in, the defenders' split over the sites, a few seconds' wait
  botPlan(){const D=this.D();if(!D)return;this.site=Math.random()<.5?'A':'B';const ways=D.way[this.site]||[];
    shuffle(G.actors.filter(a=>this.isAtt(a))).forEach((a,i)=>{a.bmWay=ways.length?ways[i%ways.length]:null;a.bmWayOk=!a.bmWay;a.bmPost=null;a.bmPlant=null;a.bmGuard=null;a.bmGo=G.t+this.FREEZE+rr(0,5)});
    const df=shuffle(G.actors.filter(a=>!this.isAtt(a))),f0=Math.random()<.5?'A':'B',f1=f0==='A'?'B':'A';df.forEach((a,i)=>{a.bmSite=i%2?f1:f0;a.bmHold=null;a.bmRot=0})},
  ctCen(){const L=(MAP.spawns||[]).map(p=>({x:p[0],z:p[1]}));return L.length?PVP.cen(L):{x:0,z:0}},
  // an open spot within r0–r1 of a point, about its level
  near(x,y,z,r0,r1){for(let k=0;k<12;k++){const n=navAround(x,z,r0,r1);if(n&&Math.abs(n.y-y)<1.6&&PVP.hreach()[n.id])return {x:n.x,y:n.y,z:n.z}}const n=navSnap(x,y,z,3);return n?{x:n.x,y:n.y,z:n.z}:{x,y,z}},
  // where this bot wants to be, and which way to face once there (B.holdY)
  botGoal(a){const B=a.bot,b=this.b,D=this.D();if(!D)return PVP.botGoal(a);const c=a.c;B.holdY=null;
    // a fresh trail: an enemy seen or heard close by is worth a look
    if(B.lkp&&G.t-B.lkp.t<5&&Math.hypot(B.lkp.x-c.x,B.lkp.z-c.z)<(b.st==='planted'&&this.isAtt(a)?36:14)&&!(a===this.carrier())&&!(b.st==='planted'&&!this.isAtt(a))){if(Math.hypot(B.lkp.x-c.x,B.lkp.z-c.z)<2.5)B.lkp=null;else return B.lkp}
    const face=(g,t)=>{if(Math.hypot(g.x-c.x,g.z-c.z)<2.2&&t)B.holdY=PVP.yawTo(c.x,c.z,t.x,t.z);return g};
    if(this.isAtt(a)){
      if(b.st==='planted'){if(!a.bmGuard||a.bmGuardK!==b.site){a.bmGuard=this.near(b.x,b.y,b.z,3,9);a.bmGuardK=b.site;const w=(D.way[b.site]||[]).map(p=>({x:p[0],z:p[1]})).concat([this.ctCen()]);a.bmLook=rpick(w)}
        return face(a.bmGuard,a.bmLook)}
      if(b.st==='dropped'){let best=null,bd=1e9;for(const t of G.actors)if(t.alive&&this.isAtt(t)){const d=Math.hypot(t.c.x-b.x,t.c.z-b.z);if(d<bd){bd=d;best=t}}
        if(best===a)return {x:b.x,y:b.y,z:b.z}}
      if(G.t<(a.bmGo||0))return null;// (a moment at the start before moving out)
      const S=D[this.site];
      if(!a.bmWayOk&&a.bmWay){const w={x:a.bmWay[0],y:0,z:a.bmWay[1]};if(Math.hypot(w.x-c.x,w.z-c.z)<4)a.bmWayOk=true;else return w}
      if(this.carrier()===a){if(!a.bmPlant)a.bmPlant=this.near(S.x,0,S.z,0,Math.max(1,S.r-2.6));return a.bmPlant}
      if(!a.bmPost)a.bmPost=this.near(S.x,0,S.z,2,S.r+1.5);return face(a.bmPost,this.ctCen())}
    // defenders
    if(b.st==='planted')return {x:b.x,y:b.y,z:b.z};
    // teammates saw attackers at the other site: about half the defenders go over to help
    const I=PVP.intel[a.side===1?1:0].filter(p=>G.t-p.t<6);if(I.length&&G.t>(a.bmRot||0)){a.bmRot=G.t+8;for(const [k,s] of this.sites())if(k!==a.bmSite&&I.some(p=>Math.hypot(p.x-s.x,p.z-s.z)<s.r+10)&&Math.random()<.5){a.bmSite=k;a.bmHold=null}}
    const k=a.bmSite||'A';if(!a.bmHold){const H=(D.hold[k]||[]).map(p=>({x:p[0]+rr(-.8,.8),y:p[2]||0,z:p[1]+rr(-.8,.8)}));a.bmHold=H.length?rpick(H):this.near(D[k].x,0,D[k].z,1,D[k].r);
      const w=(D.way[k]||[]).map(p=>({x:p[0],z:p[1]}));a.bmLook=w.length?rpick(w):{x:D[k].x,z:D[k].z}}
    return face(a.bmHold,a.bmLook)},
  // planting or defusing: stand still and keep at it, unless someone shoots and it is not too late to stop
  botAct(a,dt,tg){const B=a.bot,x=a.bAct,b=this.b;
    if(!x){const k=this.canAct(a);if(!k||NET.cli)return false;
      if(k==='plant'&&(tg||G.t-B.seenT<1.2||!a.bmPlant||Math.hypot(a.c.x-a.bmPlant.x,a.c.z-a.bmPlant.z)>2.2&&this.siteAt(a.bmPlant.x,0,a.bmPlant.z)))return false;
      if(k==='defuse'&&tg&&b.tl>this.DEFUSE+1.5)return false;
      this.start(a,k);return true}
    const commit=x.k==='defuse'?(b.tl<this.DEFUSE+1.5||!tg):x.t>this.PLANT*.6;if(tg&&!commit){this.stop(a);return false}
    const cmd=a.cmd;cmd.f=cmd.s=0;cmd.fire=cmd.alt=false;cmd.jump=false;cmd.duck=x.k==='defuse';AI.turnTo(a,a.yaw,-.75,dt,2.5);B.path=null;return true},

  // ---------- on screen ----------
  ui(){const hud=$('hud');if(!hud)return;if(!this.mkL){const m=document.createElement('div');m.id='bmMarks';m.innerHTML='<div class="bmk s" data-k="A">A</div><div class="bmk s" data-k="B">B</div><div class="bmk c4"><i></i><span></span></div>';hud.appendChild(m);this.mkL=m;this.mkE=[...m.children]}
    if(!this.pbar){const p=document.createElement('div');p.id='bmBar';p.innerHTML='<b></b><span><i></i></span>';hud.appendChild(p);this.pbar=p}},
  off(){if(this.mkL)this.mkL.style.display='none';if(this.pbar)this.pbar.style.display='none';this.clearFx();const h=$('hTime');if(h)h.classList.remove('bomb');this.b={st:'none'}},
  // the top bar, the bomb's clock, the hints under the crosshair, the progress bar, the markers (site letters, the bomb)
  hud(dt,set){const P=G.player,e=HUD.el,L=LI();if(!P)return;this.ui();const S=PVP.SIDES,b=this.b,at=this.att(),me=P.side===1?1:0,role=me===at;
    set(e.hRound,`${T('bomb')} · ${T('round')} ${G.round|0}/${G.rounds|0} · <b class="${me?'z':'h'}">${role?(L?'ATTACK':'공격'):(L?'DEFEND':'수비')}</b>`,1);set(e.hSH,String(G.score[0]|0));set(e.hSZ,String(G.score[1]|0));
    let a0=0,a1=0;for(const a of G.actors)if(a.alive){if(a.side===1)a1++;else a0++}set(e.hAH,`${S[0].n[L]} ${a0}`);set(e.hAZ,`${S[1].n[L]} ${a1}`);
    const pl=b.st==='planted'&&G.st==='fight';e.hTime.classList.toggle('bomb',pl);if(pl){const t=Math.max(0,G.time);set(e.hTime,`C4 ${Math.floor(t)}.${Math.floor(t*10)%10}`)}
    // under the crosshair: the buy window, what I can do with E
    const tg=$('pvTag');let tx='';if(P.alive&&!P.bAct&&(G.st==='prep'||G.st==='fight')){// (while planting / defusing only the bar shows)
      if(G.st==='prep')tx+=`<div class="by">${L?'B: pick your weapons':'B: 무기 선택'}</div>`;else if(P.pvpBuy>G.t)tx+=`<div class="by">${L?`B: change weapons · ${Math.ceil(P.pvpBuy-G.t)} s`:`B: 무기 변경 · ${Math.ceil(P.pvpBuy-G.t)}초`}</div>`;
      const k=this.canAct(P),key=typeof TOUCH!=='undefined'&&TOUCH.on?'⚡':'E';
      if(b.st==='carried'&&b.by===P)tx+=`<div class="bm">${k==='plant'?(L?`Hold ${key} to plant the bomb`:`${key} 길게: 폭탄 설치`):(L?'You have the bomb — plant it on A or B':'폭탄 소지 — A나 B 사이트에 설치')}</div>`;
      else if(k==='defuse')tx+=`<div class="bm">${L?`Hold ${key} to defuse`:`${key} 길게: 폭탄 해체`}</div>`}
    if(tg&&tg.innerHTML!==tx)tg.innerHTML=tx;
    // the progress bar (mine, or the one I watch)
    const w=G.spec&&!P.alive?G.spec:P,x=w&&w.bAct,pb=this.pbar;if(x&&G.st==='fight'){const tot=x.k==='plant'?this.PLANT:this.DEFUSE,f=clamp(x.t/tot,0,1),late=x.k==='defuse'&&b.st==='planted'&&b.tl<tot-x.t;
      pb.style.display='block';pb.className=x.k+(late?' late':'');const lb=x.k==='plant'?(L?'Planting the bomb…':'폭탄 설치 중…'):(L?'Defusing…':'해체 중…');if(pb.firstChild.textContent!==lb)pb.firstChild.textContent=lb;pb.lastChild.firstChild.style.width=(f*100).toFixed(1)+'%'}
    else if(pb.style.display!=='none')pb.style.display='none';
    this.marks()},
  // the site letters over each site, the bomb where it lies (dropped: attackers only) or ticks
  marks(){const P=G.player,cam=R.cam,W=innerWidth,H=innerHeight,b=this.b,E=this.mkE;this.mkL.style.display=G.st==='menu'||G.st==='over'?'none':'block';
    const put=(el,x,y,z,show,txt)=>{if(!show){if(el.style.display!=='none')el.style.display='none';return}_bmV.set(x,y,z).project(cam);if(_bmV.z>1){el.style.display='none';return}
      const sx=clamp((_bmV.x*.5+.5)*W,24,W-24),sy=clamp((-_bmV.y*.5+.5)*H,40,H-90);el.style.display='block';el.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;if(txt!=null&&el._t!==txt){el._t=txt;el.lastChild.textContent=txt}};
    const ey=actorEye(G.spec&&!P.alive?G.spec:P);
    for(const [i,[k,s]] of this.sites().entries()){const d=Math.hypot(s.x-ey.x,s.z-ey.z);put(E[i],s.x,3.2,s.z,d>s.r+2&&G.st!=='end'&&b.st!=='planted');if(E[i].style.display!=='none')E[i].style.opacity=d>45?'.45':'.7'}
    const c=E[2],see=b.st==='planted'||(b.st==='dropped'&&P&&this.isAtt(P));if(see){const d=Math.hypot(b.x-ey.x,b.z-ey.z);c.className='bmk c4'+(b.st==='planted'?' on':'');put(c,b.x,b.y+.7,b.z,G.st==='fight',`${Math.round(d)}m`)}else put(c,0,0,0,false)},
  // the radar: the site letters, the bomb (dropped: attackers only; planted: everyone)
  mini(x,tg,cs,sn,s,c,R0,d){const b=this.b,P=G.player;x.font=`bold ${Math.round(11*d)}px sans-serif`;x.textAlign='center';x.textBaseline='middle';
    const at=(wx,wz)=>{let sx=((wx-tg.c.x)*cs-(wz-tg.c.z)*sn)*s,sy=((wx-tg.c.x)*sn+(wz-tg.c.z)*cs)*s;const l=Math.hypot(sx,sy),lim=R0-7*d;if(l>lim){sx*=lim/l;sy*=lim/l}return [c+sx,c+sy]};
    for(const [k,st] of this.sites()){const [px,py]=at(st.x,st.z);x.fillStyle='rgba(0,0,0,.55)';x.beginPath();x.arc(px,py,6.4*d,0,TAU);x.fill();x.fillStyle='#ffb43a';x.fillText(k,px,py+.5*d)}
    if(b.st==='planted'||(b.st==='dropped'&&P&&this.isAtt(P))){const [px,py]=at(b.x,b.z);x.fillStyle=b.st==='planted'?(Math.sin(G.t*9)>0?'#ff3a2a':'#7a1a10'):'#ffd04a';x.fillRect(px-3.4*d,py-2.4*d,6.8*d,4.8*d);x.strokeStyle='rgba(0,0,0,.8)';x.lineWidth=d;x.strokeRect(px-3.4*d,py-2.4*d,6.8*d,4.8*d)}
    const cr=this.carrier();if(cr&&cr.alive&&P&&!foe(P,cr)&&cr!==tg){const [px,py]=at(cr.c.x,cr.c.z);x.strokeStyle='#ffd04a';x.lineWidth=1.6*d;x.strokeRect(px-4.4*d,py-4.4*d,8.8*d,8.8*d)}},
};
// ---------- network ----------
Object.assign(CLIH,{
  bst(L,m){const B=BOMB;if(m.s==='d'&&Array.isArray(m.p)){const a=B.b.by;B.b={st:'dropped',by:null,x:m.p[0]/100,y:m.p[1]/100,z:m.p[2]/100,rot:Math.random()*TAU};const P=G.player;if(P&&B.isAtt(P)&&P!==a)HUD.note(LI()?'The bomb was dropped — pick it up':'폭탄이 떨어졌어요 — 주우세요',2.5)}
    else if(m.s==='c'){const a=byId(m.i);if(a)B.take(a)}
    else if(m.s==='p'&&Array.isArray(m.p))B.planted(byId(m.i),[m.p[0]/100,m.p[1]/100,m.p[2]/100],m.k==='B'?'B':'A')},
  bact(L,m){const a=byId(m.i);if(!a||a.isPlayer)return;if(m.k)BOMB.start(a,m.k===1?'plant':'defuse',true);else BOMB.stop(a,true)},
  bend(L,m){if(Array.isArray(m.sc))G.score=m.sc.slice(0,2);BOMB.end(m.w===1?1:0,String(m.why||''),true,!!m.f)}});
Object.assign(HOSTH,{
  // a player asks to plant or defuse (E held) or stops; the host checks it every frame from then on
  bu(L,m){const a=actorOfKey(L.key);if(!a||!G.pvp||G.mode!=='bomb')return;if(m.on){const k=BOMB.canAct(a);if(k)BOMB.start(a,k)}else BOMB.stop(a)}});
// the radar: the site letters and the bomb go in with the pings (drawn under the people)
if(typeof PING!=='undefined'){const pm=PING.mini;PING.mini=function(){pm.apply(this,arguments);if(G.mode==='bomb')try{BOMB.mini.apply(BOMB,arguments)}catch(e){console.error(e)}}}

'use strict';
// ============ 기초 훈련 (v6.70): the tutorial, a guided run on the shooting range ============
// Started from the lobby: the shooting range card's 「기초 훈련」 button, or the question a player who has never played (and has not
// done it) gets once per browser on 빠른 시작 / 방 만들기 / 멀티플레이. It is the shooting range (G.mode 'range', range.js) with TUT.on:
// the range's record panel, its keys and its moving targets are off, chat is off, and a panel at the top walks the player through
// eleven steps. A step is done when the player has really done it: looking round, walking, a jump and a crouch, ten hits on the
// dummies, three headshots, a reload, a pick from the buy menu, the knife on a training dummy put behind the line, a grenade, three
// training zombies that walk up to the line (they never strike), and the rules (read, then Enter). Enter or the panel's button skips a
// step after 10 s. At the end: the reward (qz_tut_claim, 1,000 coins once per account; a guest's is taken on the next sign-in) and
// the lobby or more practice on the range. localStorage: qz_tutDone (finished on this browser), qz_tutAsk (the lobby asked once).
const TUT_REWARD=1000;
const TUT_LS='tutDone';
const tutWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const TUT_V=new THREE.Vector3();
const tutTouch=()=>typeof TOUCH!=='undefined'&&!!TOUCH.on;
const tutGun=W=>!!W&&!!W.mag&&W.kind!=='melee'&&W.kind!=='nade'&&W.kind!=='claw';
// the steps: t = title, d = what to do (L 0 Korean / 1 English, touch = phone controls), tip = a second line, enter = set-up,
// prog = how far: {k: 0..1, s: label} or {list: [[label, done]]}, done when k reaches 1 or every item is done; info: no task, Enter moves on
const TUT_STEPS=[
  {id:'look',t:['둘러보기','Look around'],
    d:(L,tc)=>tc?['화면 오른쪽을 드래그해서 주변을 둘러보세요','Drag on the right half of the screen to look around'][L]:['<kbd>마우스</kbd>를 움직여 주변을 둘러보세요','Move the <kbd>mouse</kbd> to look around'][L],
    tip:(L,tc)=>tc?['조준 보조가 켜져 있으면 조준점이 좀비 쪽으로 살짝 끌려가요','With aim assist on, the crosshair drifts gently onto zombies'][L]:['화면을 클릭하면 마우스가 게임에 잡혀요 · <kbd>Esc</kbd>로 풀기','Click the screen to capture the mouse · <kbd>Esc</kbd> lets it go'][L],
    prog:d=>({k:d.look/2.4})},
  {id:'move',t:['이동','Move'],
    d:(L,tc)=>tc?['왼쪽 스틱으로 걸어 보세요','Walk with the left stick'][L]:['<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>로 걸어 보세요','Walk with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>'][L],
    tip:(L,tc)=>tc?['스틱을 조금만 밀면 천천히 걸어요 — 발소리가 안 나요','Push the stick only a little to walk — no footsteps'][L]:['<kbd>Shift</kbd>를 누른 채 걸으면 발소리가 안 나요','Hold <kbd>Shift</kbd> to walk without footsteps'][L],
    prog:d=>({k:d.dist/6})},
  {id:'jump',t:['점프 · 앉기','Jump · crouch'],
    d:(L,tc)=>tc?['<b>↑</b> 버튼으로 점프, <b>↓</b> 버튼으로 앉기 — 둘 다 해 보세요','Jump with <b>↑</b> and crouch with <b>↓</b> — try both'][L]:['<kbd>Space</kbd> 점프 · <kbd>Ctrl</kbd> 또는 <kbd>C</kbd> 앉기 — 둘 다 해 보세요','<kbd>Space</kbd> jumps · <kbd>Ctrl</kbd> or <kbd>C</kbd> crouches — try both'][L],
    tip:L=>['앉아서 쏘면 반동이 줄고, 앉은 채로는 발소리도 안 나요','Crouching cuts the recoil, and makes no footsteps'][L],
    prog:(d,L)=>({list:[[L?'Jump':'점프',d.jump],[L?'Crouch':'앉기',d.duck]]})},
  {id:'shoot',t:['사격','Shoot'],
    d:(L,tc)=>tc?(CFG.autoFire!==false?['사선 너머 좀비 더미에 조준점을 올리면 저절로 쏴요 — 10발 맞히기','Put the crosshair on a dummy down the range and it fires by itself — land 10 hits']:['사격 버튼으로 사선 너머의 좀비 더미를 쏘세요 — 10발 맞히기','Shoot the dummies down the range with the fire button — land 10 hits'])[L]
      :['<kbd>좌클릭</kbd>으로 사선 너머의 좀비 더미를 쏘세요 — 10발 맞히기','Shoot the zombie dummies down the range with the <kbd>left button</kbd> — land 10 hits'][L],
    tip:(L,tc)=>tc?['짧게 끊어 쏘면 더 잘 맞아요 · 조준 버튼은 총마다 하는 일이 달라요','Short bursts land better · the aim button does something different on each gun'][L]:['짧게 끊어 쏘면 더 잘 맞아요 · <kbd>우클릭</kbd>은 총마다 달라요 (조준경, 연사 모드 …)','Short bursts land better · the <kbd>right button</kbd> depends on the gun (scope, fire mode …)'][L],
    prog:(d,L)=>({k:d.hits/10,s:(L?'Hits ':'명중 ')+Math.min(10,d.hits)+' / 10'})},
  {id:'hs',t:['헤드샷','Headshots'],
    d:L=>['머리를 맞히면 피해가 몇 배로 들어가요 — 헤드샷 3번','A hit to the head does several times the damage — land 3 headshots'][L],
    tip:L=>['10 m 더미가 제일 쉬워요','The 10 m dummy is the easiest'][L],
    prog:(d,L)=>({k:d.hs/3,s:(L?'Headshots ':'헤드샷 ')+Math.min(3,d.hs)+' / 3'})},
  {id:'reload',t:['재장전','Reload'],
    enter(P){if(!tutGun(WPN[P.cur])){const g=P.inv[1]||P.inv[2];if(g)equip(P,g)}const A=P.ammo[P.cur];if(A&&tutGun(WPN[P.cur]))A.mag=Math.min(A.mag,3)},
    d:(L,tc)=>tc?['탄이 얼마 안 남았어요 — <b>↻</b> 버튼으로 재장전하세요','Almost empty — reload with the <b>↻</b> button'][L]:['탄이 얼마 안 남았어요 — <kbd>R</kbd>로 재장전하세요','Almost empty — press <kbd>R</kbd> to reload'][L],
    tip:(L,tc)=>tc?['탄창이 비면 저절로 재장전해요 · 좀비가 가까우면 권총으로 바꾸는 게 더 빨라요','An empty magazine reloads by itself · with a zombie close, switching to the pistol is quicker'][L]:['탄창이 비면 저절로 재장전해요 · 좀비가 가까우면 권총(<kbd>2</kbd>)으로 바꾸는 게 더 빨라요','An empty magazine reloads by itself · with a zombie close, switching to the pistol (<kbd>2</kbd>) is quicker'][L],
    prog:(d,L)=>({k:d.relDone?1:d.rel?.5:0,s:d.rel&&!d.relDone?(L?'Reloading…':'재장전 중…'):''})},
  {id:'buy',t:['무기 고르기','Pick a weapon'],
    d:(L,tc)=>tc?['오른쪽 위 <b>구매</b> 버튼을 누르고 다른 총을 하나 골라 보세요','Tap <b>BUY</b> at the top right and pick another gun'][L]:['<kbd>B</kbd>로 구매 메뉴를 열고 다른 총을 하나 골라 보세요 (숫자 키나 클릭)','Open the buy menu with <kbd>B</kbd> and pick another gun (number keys or a click)'][L],
    tip:L=>['무기는 공짜예요 · 실전에선 수류탄과 방탄복은 라운드마다 한 번, 상점 총은 코인으로 사야 열려요','Weapons are free · in a match grenades and armour come once a round, and shop guns open once bought with coins'][L],
    prog:d=>({k:d.bought?1:Main.overlay==='buy'?.5:0})},
  {id:'knife',t:['칼','Knife'],
    enter(){TUT.knifeDummy()},
    d:(L,tc)=>tc?['아래 무기 칸에서 <b>칼</b>을 고르고, 뒤에 있는 훈련 더미를 사격 버튼으로 베세요','Pick the <b>knife</b> in the weapon bar and cut the training dummy behind you with fire'][L]:['<kbd>3</kbd>으로 칼을 꺼내 뒤에 있는 훈련 더미를 베세요 · <kbd>좌클릭</kbd> 베기 · <kbd>우클릭</kbd> 강하게','Press <kbd>3</kbd> for the knife and cut the training dummy behind you · <kbd>left</kbd> slash · <kbd>right</kbd> heavy'][L],
    tip:(L,tc)=>tc?['칼을 들면 더 빨리 달려요','You run faster with the knife out'][L]:['<kbd>1</kbd>~<kbd>4</kbd>나 마우스 휠로 무기를 바꿔요 · <kbd>Q</kbd>는 방금 쓴 무기 · 칼을 들면 더 빨리 달려요','<kbd>1</kbd>–<kbd>4</kbd> or the wheel switch weapons · <kbd>Q</kbd> the last one · you run faster with the knife out'][L],
    prog:(d,L)=>({list:[[L?'Knife out':'칼 꺼내기',d.knife],[L?'Cut the dummy':'더미 베기',d.cut]]})},
  {id:'nade',t:['수류탄','Grenade'],
    enter(P){P.inv.he=Math.max(P.inv.he|0,2)},
    d:(L,tc)=>tc?['무기 칸에서 <b>수류탄</b>을 고르고 사격 버튼으로 더미 쪽에 던지세요','Pick the <b>grenade</b> in the weapon bar and throw it at the dummies with fire'][L]:['<kbd>4</kbd>로 수류탄을 꺼내 <kbd>좌클릭</kbd>으로 더미 쪽에 던지세요','Press <kbd>4</kbd> for the grenade and throw it at the dummies with the <kbd>left button</kbd>'][L],
    tip:L=>['HE는 좀비를 크게 날려 보내요 · 냉동은 얼리고 · 조명탄은 밝히고 · 연막탄은 시야를 가려요','HE blasts zombies away · frost freezes them · a flare lights things up · smoke blocks the view'][L],
    prog:(d,L)=>({k:d.thrown?Math.min(1,.5+d.thrownT/2.8):0,s:d.thrown?(L?'Thrown!':'던졌어요!'):''})},
  {id:'zombies',t:['좀비 막기','Hold them off'],
    enter(P){const g=P.inv[1]||P.inv[2];if(g&&!tutGun(WPN[P.cur]))equip(P,g);TUT.wave()},
    d:L=>['좀비 세 마리가 다가와요 — 쏴서 밀어내고 모두 처치하세요','Three zombies are coming — shoot them back and take them all down'][L],
    tip:L=>['총알은 좀비를 뒤로 밀어내요(넉백) — 산탄총과 기관총이 특히 세요','Bullets push zombies back — shotguns and machine guns most of all'][L],
    prog:(d,L)=>({k:d.kills/3,s:(L?'Down ':'처치 ')+Math.min(3,d.kills)+' / 3'})},
  {id:'rules',t:['좀비 모드 규칙','Zombie mode rules'],info:1,
    d:(L,tc)=>`<ul class="tuR">${T('rules').map(r=>`<li>${esc(r)}</li>`).join('')}
      <li>${tc?['인간 스킬: <b>질주</b> · <b>확인사살</b> 버튼 (라운드마다 한 번)','Human skills: the <b>SPRINT</b> and <b>DEADSHOT</b> buttons (once a round)'][L]:['인간 스킬: <kbd>5</kbd> 전력질주 · <kbd>6</kbd> 확인사살 (라운드마다 한 번)','Human skills: <kbd>5</kbd> sprint · <kbd>6</kbd> deadshot (once a round)'][L]}</li>
      <li>${tc?['좀비가 되면: 사격 버튼으로 할퀴기 · 스킬 버튼 · 오른쪽 위 <b>클래스</b>로 좀비 고르기','As a zombie: fire to claw · the skill button · <b>CLASS</b> at the top right picks your zombie'][L]:['좀비가 되면: <kbd>좌클릭</kbd> 할퀴기 · <kbd>G</kbd> 스킬 · <kbd>M</kbd> 좀비 고르기','As a zombie: <kbd>left button</kbd> claws · <kbd>G</kbd> skill · <kbd>M</kbd> picks your zombie'][L]}</li></ul>`,
    prog:d=>({k:null})}];
const TUT={on:false,pending:false,i:-1,st:'off',okT:0,t:0,d:null,el:null,html:'',zs:[],kd:null,mks:[],endEl:null,askEl:null,skipped:[],rw:null,
  lastYaw:null,lastPitch:0,lx:0,lz:0,claiming:0,
  done(){return !!LS.get(TUT_LS,0)||!!(typeof ACC!=='undefined'&&ACC.me&&ACC.me.tut)},
  // the lobby button: a gold badge with the reward while it is still to be had
  pillHTML(L){const dn=this.done(),rw=!dn&&typeof ACC!=='undefined'&&ACC.on;
    return `<button class="mtut${dn?'':' new'}" data-act="tut" title="${L?'Basic training — the controls and the rules in two minutes':'기초 훈련 — 조작과 규칙을 2분 만에'}">▶ ${L?'Basic training':'기초 훈련'}${rw?`<i>+${fmtC(TUT_REWARD)}</i>`:''}</button>`},
  // ---- starting (Main.startTut) and setting up once the range has begun ----
  setup(){const P=G.player;this.on=true;this.i=-1;this.skipped=[];this.rw=null;this.zs=[];this.kd=null;
    RANGE.panel(false);RANGE.move=false;
    if(P){P.inv[1]=P.inv[1]||'kv47';P.inv[2]=P.inv[2]||'p9';P.inv[3]=P.inv[3]||'knife';P.inv.he=0;fillAmmo(P,P.inv[1]);equip(P,P.inv[1],true);P.drawT=0;VM.set(P.cur,P.skin)}
    if(!this.el){const el=this.el=document.createElement('div');el.id='hTut';$('app').appendChild(el)}
    this.el.style.display='';this.html='';
    HUD.announce('','w',.05);// (the range's own 사격장 title would sit behind the panel)
    {const L=LI(),tc=tutTouch();HUD.note(tc?(L?'The pause button at the top right lets you leave any time':'오른쪽 위 일시정지 버튼으로 언제든 나갈 수 있어요'):(L?'Esc: pause · leave any time':'Esc: 일시정지 · 언제든 나갈 수 있어요'),4)}
    this.go(0)},
  go(i){const P=G.player;this.i=i;this.st='run';this.t=0;this.okT=0;this.html='';
    this.d={look:0,dist:0,jump:0,duck:0,hits:0,hs:0,rel:0,relDone:0,bought:0,knife:0,cut:0,thrown:0,thrownT:0,kills:0};
    this.lastYaw=null;const S=TUT_STEPS[i];if(!S){this.finish();return}
    if(S.enter&&P)S.enter(P);if(i>0)AU.play('ui',{vol:.55,rate:1.15});this.render()},
  // a step done: a moment of "좋아요!", then the next one
  ok(){if(this.st!=='run')return;this.st='ok';this.okT=.9;AU.play('uiok',{vol:.6});this.render()},
  skip(){const S=TUT_STEPS[this.i];if(!this.on||this.st!=='run'||!S)return;if(!S.info&&this.t<10)return;if(!S.info)this.skipped.push(S.id);this.ok()},
  prog(S){return S.prog(this.d,LI())},
  isDone(p){return p.list?p.list.every(x=>x[1]):p.k!=null&&p.k>=1},
  update(dt){if(!this.on)return;const P=G.player;if(!P)return;const d=this.d,S=TUT_STEPS[this.i];
    if(this.st==='end'){this.markers();return}
    if(!S)return;this.t+=dt;
    // what the player does, measured every frame
    if(this.lastYaw!=null&&P.alive){const dy=Math.abs(tutWrap(P.yaw-this.lastYaw)),dp=Math.abs(P.pitch-this.lastPitch);if(dy<1.5)d.look+=dy+dp*.5;
      const mv=Math.hypot(P.c.x-this.lx,P.c.z-this.lz);if(mv<1)d.dist+=mv}
    this.lastYaw=P.yaw;this.lastPitch=P.pitch;this.lx=P.c.x;this.lz=P.c.z;
    if(!P.c.onGround&&P.c.vy>1.5)d.jump=1;if(P.duck)d.duck=1;
    if(P.reloadT>0)d.rel=1;else if(d.rel)d.relDone=1;
    {const W=WPN[P.cur];if(W&&W.kind==='melee')d.knife=1}
    if(d.thrown)d.thrownT+=dt;
    this.zombies(dt);this.markers();
    if(this.st==='run'){if(this.isDone(this.prog(S)))this.ok()}
    else if(this.st==='ok'){this.okT-=dt;if(this.okT<=0){if(S.id==='buy'&&Main.overlay==='buy')Main.closeOverlay();if(S.id==='knife')this.dropKnifeDummy();this.go(this.i+1);return}}
    this.render()},
  // ---- what the player did (hooks below) ----
  hit(t,r,o){const d=this.d,S=TUT_STEPS[this.i];if(!S||this.st!=='run')return;
    if(t.rg){d.hits++;if(o.hs)d.hs++}
    if(t===this.kd&&o.knife)d.cut=1},
  thrown(kind){if(kind!=='zbomb'&&!this.d.thrown){this.d.thrown=1;this.d.thrownT=0}},
  bought(){this.d.bought=1},
  // ---- the dummies and zombies the tutorial puts on the range ----
  mkZ(x,z,zc,hp,name){const a=mkActor('',false,'guard');a.tut=1;a.zpick=zc;a.bot=null;G.actors.push(a);
    a.team=TZ;a.zc=zc;a.host=false;a.lvl=1;a.bombs=0;a.money=0;a.name=name;
    a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0,smoke:0};a.ammo={};a.cur=null;setHull(a);ensureRig(a);equip(a,'claw',true);a.alive=true;placeAt(a,x,0,z,Math.PI);
    a.permaDead=false;a.maxHp=a.hp=hp;a.armor=0;a.reviving=0;a.turning=0;a.lastHurt=-9;return a},
  knifeDummy(){const P=G.player;if(this.kd&&this.kd.alive)return;const x=clamp(P?P.c.x:-2,-10,10);this.kd=this.mkZ(x,3.4,'brute',3000,LI()?'Training dummy':'훈련 더미');this.kd.tutKd=1},
  dropKnifeDummy(){if(this.kd){this.remove(this.kd);this.kd=null}},
  wave(){const L=LI();this.zs=[[-8,-36,.5],[0,-41,.56],[4,-46,.62]].map(([x,z,sp])=>{const a=this.mkZ(x,z,'rager',330,L?'Training zombie':'훈련 좀비');a.tutZ=1;a.tutSp=sp;return a})},
  remove(a){for(const k in a.rigs)R.scene.remove(a.rigs[k].grp);if(a.gun&&a.gun.parent)a.gun.parent.remove(a.gun);const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1)},
  clearActors(){for(const a of G.actors.slice())if(a.tut)this.remove(a);this.zs=[];this.kd=null},
  // the training zombies walk up to the firing line (they stop in front of the counters and never strike); the dummy just watches
  zombies(dt){const P=G.player;
    for(const a of G.actors){if(!a.tut||!a.alive)continue;const c=a.c;a.yaw=Math.atan2(-(P.c.x-c.x),-(P.c.z-c.z));a.pitch=0;a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=a.cmd.jump=a.cmd.skill=false;
      if(!a.tutZ)continue;const tx=clamp(P.c.x,-11,11),tz=-1.8,dx=tx-c.x,dz=tz-c.z,dl=Math.hypot(dx,dz);
      if(dl>.6){const sp=a.tutSp||.5,wx=dx/dl*sp,wz=dz/dl*sp,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);a.cmd.f=wx*fx+wz*fz;a.cmd.s=wx*rx+wz*rz}}},
  // markers over what the step is about (the dummy behind the line, the zombies coming in); off screen they sit at the edge
  markers(){const P=G.player,want=[];const S=TUT_STEPS[this.i],L=LI();
    if(this.on&&this.st!=='end'&&S&&P){if(S.id==='knife'&&this.kd&&this.kd.alive)want.push([this.kd,L?'DUMMY':'더미','k']);
      if(S.id==='zombies')for(const a of this.zs)if(a.alive)want.push([a,(L?'ZOMBIE ':'좀비 ')+Math.round(Math.hypot(a.c.x-P.c.x,a.c.z-P.c.z))+'m','z'])}
    while(this.mks.length<want.length){const m=document.createElement('div');m.className='tutMk';$('hud').appendChild(m);this.mks.push(m)}
    const v=TUT_V;
    for(let i=0;i<this.mks.length;i++){const m=this.mks[i],w=want[i];if(!w){m.style.display='none';continue}const a=w[0];
      v.set(a.c.x,a.c.y+(a.c.h||1.8)+.35,a.c.z).project(R.cam);let x=v.x,y=v.y,off=false;
      if(v.z>1){x=-x;y=-1;off=true}if(Math.abs(x)>.92||Math.abs(y)>.86){off=true;const s=Math.max(Math.abs(x)/.92,Math.abs(y)/.86);x/=s;y/=s}
      m.style.display='block';m.style.left=((x+1)*50)+'%';m.style.top=((1-y)*50)+'%';m.className='tutMk '+w[2]+(off?' edge':'');
      const tx=off&&v.z>1?(L?'↓ behind you · ':'↓ 뒤에 있어요 · ')+w[1]:w[1];if(m.textContent!==tx)m.textContent=tx}},
  // ---- the panel ----
  render(){const el=this.el;if(!el)return;const S=TUT_STEPS[this.i];if(!this.on||!S||this.st==='end'){this.html='';if(el.innerHTML)el.innerHTML='';el.style.display='none';return}
    el.style.display=Main.paused||Main.overlay==='buy'||Main.overlay==='zsel'?'none':'';// (out of the way of the pause menu and the buy menu)
    const L=LI(),tc=tutTouch(),p=this.prog(S),n=TUT_STEPS.length,ok=this.st==='ok',canSkip=S.info||this.t>=10;
    const seg=TUT_STEPS.map((s,k)=>`<u class="${k<this.i||k===this.i&&ok?'y':k===this.i?'c':''}"></u>`).join('');
    const pr=p.list?`<div class="tuC">${p.list.map(([k,v])=>`<span class="${v?'y':''}">${v?'✓':'·'} ${esc(k)}</span>`).join('')}</div>`
      :p.k!=null?`<div class="tuP"><i><u style="width:${Math.round(clamp(p.k,0,1)*100)}%"></u></i>${p.s?`<span>${esc(p.s)}</span>`:''}</div>`:'';
    const sk=!ok&&canSkip?`<div class="tuK"><button class="tuB" data-tut="next">${tc?'':'<kbd>Enter</kbd> '}${S.info?(L?'Continue ▶':'계속 ▶'):(L?'Skip':'건너뛰기')}</button></div>`:'';
    const h=`<div class="tuH"><b>${L?'BASIC TRAINING':'기초 훈련'}</b><span>${this.i+1} / ${n}</span><i class="tuSeg">${seg}</i></div>
      <div class="tuT">${ok?(L?'✓ Nice!':'✓ 좋아요!'):esc(S.t[L])}</div><div class="tuD">${S.d(L,tc)}</div>${pr}${S.tip?`<div class="tuS">${S.tip(L,tc)}</div>`:''}${sk}`;
    if(h!==this.html){this.html=h;el.innerHTML=h}el.className=(ok?'ok':'')+(S.info?' info':'')},
  // ---- the end: the reward, then the lobby or more practice ----
  async finish(){const P=G.player;this.st='end';this.render();LS.set(TUT_LS,1);AU.play('uiok',{vol:.9,rate:.8});if(P){P.cmd.fire=false}
    this.rw=null;if(typeof ACC!=='undefined'&&ACC.on){if(ACC.signed()){this.rw={busy:1};this.showEnd();try{const r=await ACC.tutClaim();this.rw={got:r&&r.got|0}}catch(e){this.rw={err:1}}}else this.rw={guest:1}}
    this.showEnd()},
  // the window holds the game as an overlay of its own, so letting the mouse go does not open the pause menu
  showEnd(){if(!this.on)return;const L=LI(),rw=this.rw;if(Main.overlay!=='tut'){Main.closeOverlay(true);Main.overlay='tut'}Main.unlock();
    let el=this.endEl;if(!el){el=this.endEl=document.createElement('div');el.id='tutEnd';document.body.appendChild(el)}
    const names=TUT_STEPS.filter(s=>!s.info).map(s=>`<span class="${this.skipped.includes(s.id)?'sk':'y'}">${this.skipped.includes(s.id)?'–':'✓'} ${esc(s.t[L])}</span>`).join('');
    const rl=!rw?'':rw.busy?(L?'Taking the reward…':'보상을 받는 중…'):rw.got>0?`<b class="tuG">+${fmtC(rw.got)} ${L?'coins':'코인'}</b>${L?' — the reward for finishing':' — 훈련 완료 보상을 받았어요'}`
      :rw.got===0?(L?'This account has had its reward already.':'이 계정은 보상을 이미 받았어요.'):rw.err?(L?'The reward could not be taken now — it will be tried again when you next sign in.':'보상을 지금은 받지 못했어요 — 다음에 로그인할 때 다시 받아요.')
      :rw.guest?(L?`Sign in and get <b class="tuG">+${fmtC(TUT_REWARD)} coins</b> (taken on your next sign-in).`:`로그인하면 <b class="tuG">+${fmtC(TUT_REWARD)} 코인</b>을 받아요 (다음 로그인 때 자동으로).`):'';
    el.innerHTML=`<div class="tuW"><div class="tuWh">${L?'BASIC TRAINING COMPLETE':'기초 훈련 완료!'}</div>
      <div class="tuWb"><div class="tuWs">${names}</div>${rl?`<p class="tuWr">${rl}</p>`:''}
      <p class="tuWn">${L?'Next: try a bot match from <b>QUICK START</b> or <b>CREATE ROOM</b>.':'다음은 <b>빠른 시작</b>이나 <b>방 만들기</b>로 봇전 한 판!'}</p></div>
      <div class="tuWf"><button class="tuBtn" data-tut="range">${L?'Keep practising':'사격장에서 계속 연습'}</button><button class="tuBtn pri" data-tut="lobby">${L?'To the lobby':'로비로'} <kbd>Enter</kbd></button></div></div>`;
    el.style.display=''},
  hideEnd(){if(this.endEl)this.endEl.style.display='none';if(Main.overlay==='tut')Main.overlay=null},
  // more practice: the tutorial's things go and the range is the plain range again
  toRange(){this.hideEnd();this.end();RANGE.move=true;RANGE.st=RANGE.newStats();RANGE.panel(true);HUD.announce(LI()?'SHOOTING RANGE':'사격장','w',2);Main.lock()},
  end(){this.on=false;this.st='off';this.i=-1;this.clearActors();for(const m of this.mks)m.remove();this.mks=[];if(this.el){this.el.style.display='none';this.el.innerHTML='';this.html=''}this.hideEnd()},
  // ---- the lobby's question for a first-time player (once per browser) ----
  shouldAsk(){return !this.done()&&!LS.get('tutAsk',0)&&!(typeof NET!=='undefined'&&NET.on)&&recGet().g===0},
  ask(a,v,el0){LS.set('tutAsk',1);const L=LI();let el=this.askEl;if(!el){el=this.askEl=document.createElement('div');el.id='tutAsk';document.body.appendChild(el)}
    this.askGo=[a,v,el0];const rw=typeof ACC!=='undefined'&&ACC.on;
    el.innerHTML=`<div class="tuW"><div class="tuWh">${L?'First time here?':'처음이세요?'}</div>
      <div class="tuWb"><p>${L?'Two minutes of <b>basic training</b> on the shooting range: moving, shooting, picking weapons, the knife and grenades, holding off zombies and the rules.':'사격장에서 2분짜리 <b>기초 훈련</b>으로 이동 · 사격 · 무기 고르기 · 칼과 수류탄 · 좀비 막기 · 규칙을 익혀요.'}</p>
      ${rw?`<p class="tuWr">${L?`Finish it signed in: <b class="tuG">+${fmtC(TUT_REWARD)} coins</b> (once an account).`:`로그인한 채 끝내면 <b class="tuG">+${fmtC(TUT_REWARD)} 코인</b> (계정마다 한 번).`}</p>`:''}
      <p class="tuWn">${L?'You can always find it on the SHOOTING RANGE card.':'나중에도 로비의 사격장 카드에서 할 수 있어요.'}</p></div>
      <div class="tuWf"><button class="tuBtn" data-tut="askno">${L?'Just play':'바로 할게요'}</button><button class="tuBtn pri" data-tut="askyes">${L?'Basic training':'기초 훈련 시작'}</button></div></div>`;
    el.style.display=''},
  hideAsk(){if(this.askEl)this.askEl.style.display='none'},
  cmd(c){if(c==='next')this.skip();else if(c==='lobby'){this.hideEnd();Main.toTitle()}else if(c==='range')this.toRange();
    else if(c==='askyes'){this.hideAsk();Main.startTut()}else if(c==='askno'){this.hideAsk();const g=this.askGo;this.askGo=null;if(g)TUT.uiAct(g[0],g[1],g[2])}}};

// ---------- the reward on the account ----------
if(typeof ACC!=='undefined'){
  ACC.tutClaim=async function(){const r=await this.rpc('qz_tut_claim');if(this.me){if(r&&r.coins!=null)this.me.coins=r.coins|0;this.me.tut=true}LS.set(TUT_LS,1);this.emit();return r};
  // a guest who finished it on this browser gets it on signing in (and an account whose claim failed, on the next load)
  ACC.sub(()=>{const me=ACC.me;if(!me||me.cached||me.tut!==false||!LS.get(TUT_LS,0)||TUT.claiming||TUT.on)return;TUT.claiming=1;
    ACC.tutClaim().then(r=>{if(r&&r.got>0)FS.toast(LI()?`Basic training reward: +${fmtC(r.got)} coins`:`기초 훈련 보상 +${fmtC(r.got)} 코인을 받았어요`,3500)}).catch(()=>{}).finally(()=>setTimeout(()=>{TUT.claiming=0},60000))})}

// ---------- hooks ----------
(function(){
  Main.startTut=async function(){TUT.hideAsk();if(typeof NBAN!=='undefined'&&NBAN.close)NBAN.close();UI.hideAll();TUT.pending=true;try{await Main.startRange()}finally{TUT.pending=false}};
  const rb=RANGE.begin.bind(RANGE);RANGE.begin=function(){rb();if(TUT.pending)TUT.setup();else if(TUT.on)TUT.end()};
  const ru=RANGE.update.bind(RANGE);RANGE.update=function(dt){ru(dt);if(TUT.on)TUT.update(dt)};
  const rd=RANGE.draw.bind(RANGE);RANGE.draw=function(){if(!TUT.on)rd()};
  const re=RANGE.end.bind(RANGE);RANGE.end=function(){TUT.end();re()};
  const da=damageActor;damageActor=function(t,dmg,src,o){const r=da(t,dmg,src,o);if(TUT.on&&src&&src===G.player&&r>0)TUT.hit(t,r,o||{});return r};
  const kz=killZombie;killZombie=function(t,src,o){kz(t,src,o);if(!t.tut)return;t.permaDead=true;t.respawnT=1e9;t.reviveT=0;if(TUT.on&&t.tutZ&&TUT.d)TUT.d.kills++};
  const tn=throwNade;throwNade=function(a,kind,X){const r=tn(a,kind,X);if(TUT.on&&a===G.player)TUT.thrown(kind);return r};
  const bi=Main.buyItem.bind(Main);Main.buyItem=function(id){const P=G.player,b=P?JSON.stringify([P.cur,P.inv,P.armor]):'';bi(id);if(TUT.on&&P&&JSON.stringify([P.cur,P.inv,P.armor])!==b)TUT.bought(id)};
  // the top bar says what this is
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);if(TUT.on&&this.el.hRound)this.el.hRound.textContent=LI()?'BASIC TRAINING':'기초 훈련'};
  // no chat during the tutorial (Enter moves the steps on)
  if(typeof CHAT!=='undefined'){const cw=CHAT.where.bind(CHAT);CHAT.where=function(){return TUT.on&&G.mode==='range'?null:cw()}}
  // the pause menu: the panel goes at once (the game loop that draws it stops while paused)
  const mp=Main.pause.bind(Main);Main.pause=function(){mp();if(TUT.on&&TUT.el)TUT.el.style.display='none'};
  // nothing fires while the end window is up
  const pc=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc(dt);const P=G.player;if(TUT.on&&TUT.st==='end'&&P){P.cmd.fire=false;P.cmd.alt=false}};
  // the lobby: the button on the range card, and the question before a first match
  const ua=UI.act.bind(UI);TUT.uiAct=ua;UI.act=function(a,v,el){if(a==='tut'){Main.startTut();return}
    if((a==='go'||a==='start'||a==='mp')&&TUT.shouldAsk()){TUT.ask(a,v,el);return}return ua(a,v,el)};
  // Enter: the next step / the lobby from the end window; Esc on the end window: the lobby
  addEventListener('keydown',e=>{if(!TUT.on||e.repeat||G.mode!=='range')return;const k=e.code;
    if(TUT.st==='end'&&TUT.endEl&&TUT.endEl.style.display!=='none'){if(k==='Enter'||k==='NumpadEnter'||k==='Escape'){e.preventDefault();e.stopImmediatePropagation();TUT.cmd('lobby')}
      else if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&k!=='F11')e.stopImmediatePropagation();return}// (the game's keys wait while the window is up: no buy menu or pause over it)
    if((k==='Enter'||k==='NumpadEnter')&&!Main.paused&&!Main.overlay){e.preventDefault();TUT.skip()}},true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-tut]');if(!b)return;e.preventDefault();AU.init();AU.play('ui',{vol:.5});TUT.cmd(b.dataset.tut)});
})();

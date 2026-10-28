'use strict';
// ============ v6.56: Q7 VACCINE LAUNCHER — a dart gun that turns zombies back into people (supply crates only) ============
// Our own design. A pneumatic dart rifle: five vaccine darts a vial, a pump stroke between shots. A dart in a zombie at half its health or
// less cures it: it gets up a human again, on your side, with its own sidearm and knife (a player too) and the vaccine still in the blood
// (no claw turns it for 4 s). The first zombies of a round (the hosts) carry the strain itself: they cannot be cured. Above half health a
// dart hurts and the vaccine burns: the zombie runs slower for 2 s. The bio-scanner in the sight marks every zombie in view: green when a
// dart would cure it, its health while it would not, IMMUNE on a host. Cures happen in the infection modes only (Classic Infection, Evolved Infection): in
// the scenario, the range and the episodes it is a dart gun that slows.
// Network: the host decides (a client's dart is a claim, like any shot) and tells everyone: 'cure' (who, by whom), 'vxs' (a slowed zombie).

// ---------- numbers ----------
// HP: the share of health at or under which a dart cures; SLOW / SLOWT: the burn's speed factor and time; IMM: no infection after a cure;
// HUM: the health a cured human gets up with; SCAN: the scanner's reach (m)
const VAX={HP:.5,SLOW:.55,SLOWT:2,IMM:4,HUM:60,SCAN:40};

// ---------- the model ----------
// gun frame as every rifle (origin at the grip, the barrel along -Z): a pale teal receiver with green lines and a green cross on each side, the
// bio-scanner sight (a lens at the back, a green screen ahead), a slim barrel in a black shroud, the pump forend under it (the air), the
// gas bottle, the vial of vaccine as the magazine (a window on each side), a black skeleton stock
function vaxParts(B){B=B||'sl_medic';const P=[];
  P.push(Pt(0,.04,-.07,.068,.088,.3,B,{r:.014}),...[1,-1].map(s=>Pt(s*.0345,.058,-.07,.002,.008,.24,'plGlow')),Pt(0,-.008,-.07,.05,.012,.26,'mtB'),
    ...[1,-1].flatMap(s=>[Pt(s*.0345,.03,-.15,.002,.034,.011,'plGlow'),Pt(s*.0345,.03,-.15,.002,.011,.034,'plGlow')]),
    Pt(0,.088,-.07,.046,.01,.24,'mtB'),Pt(0,.098,-.07,.02,.008,.18,'rail'));
  // the scanner
  P.push(Pt(0,.118,-.05,.044,.036,.08,'mtB',{r:.008}),Pt(0,.118,-.0095,.032,.024,.002,'lens'),Pt(0,.118,-.0905,.032,.024,.002,'plGlow'),Pt(.024,.118,-.05,.004,.012,.03,'steel'));
  // the barrel, its shroud and the muzzle
  P.push(Pt(0,.05,-.27,.044,.044,.1,'mtB',{r:.012}),Pt(0,.05,-.4,.024,.024,.2,'steel'),Pt(0,.05,-.505,.036,.036,.03,'mtB',{r:.008}),Pt(0,.05,-.5215,.02,.02,.003,'muzzle'));
  // the pump forend (it slides back after every dart) and the gas bottle behind it
  P.push(...TAG('pump',[Pt(0,.006,-.34,.05,.042,.15,'mtP',{r:.012}),...[-.3,-.34,-.38].map(z=>Pt(0,-.0155,z,.052,.004,.012,'rub'))]),Pt(0,.01,-.2,.034,.034,.1,'chrome',{r:.016}));
  // the vial: a black holder, green vaccine behind a window on each side, a white cap
  P.push(...TAG('mag',[Pt(0,-.05,-.12,.036,.09,.05,'mtB',{r:.006}),...[1,-1].map(s=>Pt(s*.0185,-.05,-.12,.002,.064,.03,'plGlow')),Pt(0,-.097,-.12,.04,.012,.054,'white',{r:.004})]));
  // the grip, the trigger, the stock
  P.push(...pGrip('mtP',-.07,.06,.24),...tGuard(0),Pt(0,.05,.16,.04,.03,.16,'mtP',{r:.008}),Pt(0,-.0,.19,.03,.07,.03,'mtP',{r:.006}),Pt(0,.035,.25,.05,.1,.02,'rub'),Pt(0,.072,.19,.03,.01,.08,'mtP'));
  return P}
GUNS.q7vac={parts:vaxParts(),grip:[0,-.03,.03],sup:[0,0,-.34],muzzle:[0,.05,-.52],mag:[0,-.1,-.12],eject:[.04,.05,-.08]};

// ---------- stats ----------
WPN.q7vac={slot:1,kind:'rifle',crate:1,cat:'special',n:['Q7 백신 발사기','Q7 Vaccine Launcher'],cost:5000,mag:5,res:15,dmg:90,rpm:66,semi:1,pump:1,
  spread:[.002,.03,.08],rec:[.03,.01],kb:1.2,stag:.4,hs:2,reload:3,draw:.8,speed:.95,snd:'vaxfire',model:'q7vac',hold:'rifle',
  bd:['보급 전용 · 체력 절반 이하 좀비 치료 → 아군 · 숙주 면역','Crates only · cures zombies at half health or less · hosts immune']};
VM_POS.q7vac={p:[.15,-.17,-.37],r:[0,.08,.035]};
GUN_DESIGN.q7vac={mag:5,ch:0,act:'pump',x:.5,rl:'mag'};WPN.q7vac.fd=GUN_DESIGN.q7vac;WPN.q7vac.ch=0;
CRATE_GUNS.push('q7vac');{const c=BUY_MENU.find(q=>q.k==='special');if(c&&!c.items.includes('q7vac'))c.items.push('q7vac')}

// ---------- who a dart cures ----------
const vaxMode=()=>(G.mode==='orig'||G.mode==='mut')&&!G.pvp&&!(typeof EP!=='undefined'&&EP.on);
function vaxCurable(t){return vaxMode()&&!!t&&t.alive&&t.team===TZ&&!t.host&&!t.scen&&!(t.reviving>0)&&t.maxHp>0&&t.hp<=t.maxHp*VAX.HP}

// ---------- the cure (host / solo decides; every page runs it on the event) ----------
// back to the human side: the sidearm and the knife of his loadout, no armour, a little health, the vaccine's immunity
function vaxHuman(a){a.team=TH;a.host=false;a.lvl=1;a.infR=0;a.maxHp=100;a.hp=VAX.HUM;a.armor=0;a.bombs=0;a.skillCD=0;a.skillT=0;a.frozen=0;a.zoom=0;a.reloadT=0;a.relKind=null;
  a.shriekT=0;a.turning=0;a.clawLock=0;a.holdT=0;a.rootT=0;a.burnT=0;a.staggerT=0;a.reviving=0;a.reviveT=0;a.respawnT=0;a.permaDead=false;a.alive=true;a.pendingClaw=null;
  a.bSt=0;a.bT=0;a.throwT=0;a.nHold=0;a.grabT=0;a.vaxSlowT=0;a.hndT=0;a.an.skill=0;a.dizzy=Math.max(a.dizzy||0,1.2);a.vaxImm=G.t+VAX.IMM;
  const L=a.ldo||{},ok=(id,s)=>!!(id&&WPN[id]&&WPN[id].slot===s&&!WPN[id].crate),side=ok(L[2],2)?L[2]:'p9',mel=ok(L[3],3)?L[3]:'knife';
  a.inv={1:null,2:side,3:mel,he:0,frost:0,flare:0,smoke:0};a.ammo={};fillAmmo(a,side);a.prev=mel;
  a.cur=null;setHull(a);ensureRig(a);equip(a,side,true);a.drawT=.7;
  if(a.isPlayer){a.nv=false;R.PU.uInfect.value=0;VM.set(side,a.skin);VM.draw(.9)}
  if(a.bot&&!a.pup)AI.onTeam(a);
  if(G.lastHuman&&humansAlive()>1)G.lastHuman=null}
function vaxCure(t,src){if(NET.cli&&!NET.ev)return;if(!t||t.team!==TZ)return;
  vaxHuman(t);vaxCureFx(t);HUD.feed(src,'q7vac',t,{cure:1});
  if(src){src.score+=3;src.cures=(src.cures|0)+1;scEarn(src,400)}
  // Evolved Infection: a cure lifts the humans' morale as a kill does
  if(G.mode==='mut'&&src&&src.team===TH&&!NET.cli){G.moralePts+=2;const nl=Math.min(ZBAL.moraleMax,Math.floor(G.moralePts/3));if(nl>G.moraleLvl){G.moraleLvl=nl;HUD.announce(T('moraleUp',nl*10),'h',2.2);if(G.player&&G.player.team===TH)AU.play('morale',{vol:.55})}}
  const L=LI();if(t.isPlayer){HUD.announce(L?'CURED — you are human again':'백신 치료 — 인간으로 돌아왔어요','h',3.2);HUD.note(L?'The vaccine keeps the claws off for a few seconds':'몇 초 동안은 감염되지 않아요',3);AU.play('vaxcure',{vol:.9})}
  else if(src&&src.isPlayer){HUD.note(L?`${t.name} cured — on our side now`:`${t.name} 치료 성공 — 이제 아군이에요`,2.4);AU.play('vaxcure',{vol:.7})}
  if(NET.host)netEv('cure',{i:t.id,s:src?src.id:-1})}
// a dart that did not cure: the vaccine burns (slower for a while)
function vaxSlow(t){if(!t.alive||t.team!==TZ)return;t.vaxSlowT=G.t+VAX.SLOWT;vaxHitFx(t);if(NET.host)netEv('vxs',{i:t.id})}

// ---------- effects ----------
function vaxCureFx(t){const c=t.c,x=c.x,y=c.y,z=c.z;
  for(let i=0;i<22;i++){const an=rr(0,TAU),sp=rr(.4,1.6);FX.spawn({x:x+Math.cos(an)*rr(0,.45),y:y+rr(.2,1.8),z:z+Math.sin(an)*rr(0,.45),vx:Math.cos(an)*sp,vy:rr(.6,2),vz:Math.sin(an)*sp,life:rr(.8,1.6),s0:rr(.05,.1),s1:rr(.1,.2),r:.55,g:1,b:.6,a:.9,f:13,drag:1.2,grav:-.4,add:1})}
  for(let i=0;i<10;i++){const an=i/10*TAU;FX.spawn({x:x+Math.cos(an)*.4,y:y+.1,z:z+Math.sin(an)*.4,vx:Math.cos(an)*2,vy:.2,vz:Math.sin(an)*2,life:.6,s0:.2,s1:.6,r:.7,g:1,b:.75,a:.4,f:5,drag:2.5,add:1})}
  FX.spawn({x,y:y+.08,z,life:.8,s0:.4,s1:3,r:.45,g:1,b:.55,a:.7,f:14,add:1});FX.spawn({x,y:y+1.1,z,life:.35,s0:.6,s1:2.2,r:.8,g:1,b:.85,a:.6,f:1,add:1});
  DL.add(x,y+1.2,z,'#7dff9a',7,2.4,.9);AU.at('vaxcure',x,y+1.2,z,{vol:1,range:60})}
function vaxHitFx(t){const c=t.c;for(let i=0;i<6;i++)FX.spawn({x:c.x+rr(-.2,.2),y:c.y+rr(.8,1.5),z:c.z+rr(-.2,.2),vx:rr(-.5,.5),vy:rr(.2,.9),vz:rr(-.5,.5),life:rr(.4,.7),s0:.1,s1:.35,r:.45,g:1,b:.5,a:.5,f:5,drag:2,add:1});
  if(!AU.throttle('vxh'+t.id,250))AU.at('vaxhit',c.x,c.y+1.3,c.z,{vol:.7,range:30})}
// every frame: the slowed drip green, the freshly cured shimmer
function vaxTick(dt){for(const a of G.actors){if(!a.alive)continue;
    if(a.vaxSlowT>G.t&&a.team===TZ&&Math.random()<dt*10)FX.spawn({x:a.c.x+rr(-.25,.25),y:a.c.y+rr(.6,1.6),z:a.c.z+rr(-.25,.25),vy:-.6,life:.7,s0:.05,s1:.03,r:.45,g:1,b:.4,a:.8,f:4,grav:6,add:1});
    if(a.vaxImm>G.t&&a.team===TH&&Math.random()<dt*14)FX.spawn({x:a.c.x+rr(-.35,.35),y:a.c.y+rr(.1,1.8),z:a.c.z+rr(-.35,.35),vy:rr(.3,.8),life:rr(.5,.9),s0:.05,s1:.01,r:.6,g:1,b:.7,a:.8,f:11,add:1})}}

// ---------- the bio-scanner: markers over the zombies in view while it is in hand ----------
const VXH={mk:[],t:0,list:[]};
function vaxHud(dt){const P=G.player,on=!!(P&&P.alive&&P.team===TH&&P.cur==='q7vac'&&vaxMode()&&G.st!=='menu');
  if(!on){if(VXH.list.length||VXH.mk.some(m=>m.style.display!=='none')){VXH.list.length=0;for(const m of VXH.mk)m.style.display='none'}return}
  VXH.t-=dt;if(VXH.t<=0){VXH.t=.12;const e=actorEye(P),L=[];
    for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0||z.epHide)continue;if(z.zc==='runner'&&z.skillT>0||z.mnB)continue;const d=Math.hypot(z.c.x-e.x,z.c.z-e.z);if(d>VAX.SCAN)continue;
      if(!losClear(e.x,e.y,e.z,z.c.x,z.head.y,z.c.z))continue;L.push([d,z])}
    L.sort((p,q)=>p[0]-q[0]);VXH.list=L.slice(0,6).map(q=>q[1])}
  const Li=LI();
  for(let i=0;i<Math.max(VXH.list.length,VXH.mk.length);i++){const z=VXH.list[i];let m=VXH.mk[i];
    if(!z||!z.alive||z.team!==TZ){if(m)m.style.display='none';continue}
    if(!m){m=VXH.mk[i]=document.createElement('div');m.className='vaxMk';$('hud').appendChild(m)}
    _vxv.set(z.c.x,z.head.y+.42,z.c.z).project(R.cam);const vis=_vxv.z<1&&Math.abs(_vxv.x)<1.05&&Math.abs(_vxv.y)<1.05;m.style.display=vis?'block':'none';if(!vis)continue;
    m.style.left=((_vxv.x+1)*50)+'%';m.style.top=((1-_vxv.y)*50)+'%';
    const k=z.host?'imm':vaxCurable(z)?'ok':'',s=k==='imm'?(Li?'IMMUNE':'면역'):k==='ok'?(Li?'+ CURE':'+ 치료'):Math.max(1,Math.ceil(z.hp/Math.max(1,z.maxHp)*100))+'%';
    if(m.textContent!==s)m.textContent=s;const cn='vaxMk'+(k?' '+k:'');if(m.className!==cn)m.className=cn}}
const _vxv=new THREE.Vector3();
// the kill feed: the cross after the gun on a cure row
function vaxIcon(){if(MINI.vax)return MINI.vax;const [cv,x]=mkCanvas(16,16);x.fillStyle='#7dff9a';x.fillRect(6,2,4,12);x.fillRect(2,6,12,4);return MINI.vax=cv.toDataURL()}

// ---------- hooks ----------
(function(){
  // a dart: a cure when it can (the host / solo page decides), otherwise the hurt and the burn
  const da=damageActor;damageActor=function(t,dmg,src,o){
    if(o&&o.w==='q7vac'&&!NET.ghost&&!NET.cli&&t&&t.alive&&t.team===TZ&&G.st!=='end'&&G.st!=='over'){
      if(vaxCurable(t)){vaxCure(t,src);return 0}
      const r=da.apply(this,arguments);if(t.alive&&t.team===TZ)vaxSlow(t);return r}
    return da.apply(this,arguments)};
  // the vaccine in the blood: no infection for a few seconds after a cure (the host decides)
  const inf=infect;infect=function(t,src){if(t&&t.team===TH&&t.vaxImm>G.t&&!NET.ev){if(!AU.throttle('vxi'+t.id,400)){vaxHitFx(t);AU.at('vaxhit',t.c.x,t.c.y+1.3,t.c.z,{vol:.6,range:25,rate:1.3})}return}return inf(t,src)};
  // the burn: a slowed zombie runs at VAX.SLOW
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);return a&&a.team===TZ&&a.vaxSlowT>G.t?s*VAX.SLOW:s};
  // a new round: nothing carried over
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){a.vaxSlowT=0;a.vaxImm=0}VXH.list.length=0;for(const m of VXH.mk)m.style.display='none'};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st==='menu'||G.st==='over')return;try{vaxTick(dt)}catch(e){console.error(e)}};
  const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);try{vaxHud(dt)}catch(e){console.error(e)}};
  // the kill feed: a cure is a row of its own (the name comes out on the human side) with the cross
  const hf=HUD.feed;HUD.feed=function(src,w,t,f){if(!(f&&f.cure))return hf.call(this,src,w,t,f);
    this.feedL.push({k:src?src.name:'',kt:src?src.team:-1,v:t.name,vt:TH,w:w||'q7vac',cure:1,me:(src&&src.isPlayer)||t.isPlayer,t:G.t});if(this.feedL.length>6)this.feedL.shift();this.renderFeed()};
  const rf=HUD.renderFeed;HUD.renderFeed=function(){rf.call(this);const L=this.feedL,E=this.el.hFeed.children;
    for(let i=0;i<L.length&&i<E.length;i++)if(L[i].cure&&!E[i].querySelector('.vxI')){const im=E[i].querySelector('img');if(!im)continue;const n=document.createElement('img');n.className='vxI';n.src=vaxIcon();im.after(n)}};
  // the host's word
  Object.assign(CLIH,{
    cure(L,m){const t=byId(m.i);if(!t||t.team!==TZ)return;netWithEv(()=>vaxCure(t,byId(m.s)))},
    vxs(L,m){const t=byId(m.i);if(!t||!t.alive||t.team!==TZ)return;t.vaxSlowT=G.t+VAX.SLOWT;vaxHitFx(t)}});
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // a dart: the valve's hiss and thump, a light metal click, then the pump stroke (back, the air, forward)
  vaxfire:{n:3,dur:.8,ch:2,peak:.85,gain:.62,rev:.1,poly:4,fn:B=>{const o=B.comp(-14,4,.002,.12,B.g(.95));
    {const e=B.env(0,.002,.9,.07,B.f('bandpass',rr(2900,3400),.8,o));B.nz('white',0,.1,e)}
    {const e=B.env(0,.001,.85,.07,o);B.osc('sine',rr(170,190),70,0,.09,e)}
    B.ring(.004,rr(2600,3000),[1,2.7],[.05,.02],[.05,.02],o);
    B.grain(.3,1700,2,.014,.55,o);{const e=B.env(.33,.02,.32,.12,B.f('bandpass',2300,.9,o));B.nz('pink',.33,.16,e)}B.grain(.5,2100,2,.012,.6,o)}},
  // a cure: a deep breath of air, a rising bright chime over a soft chord
  vaxcure:{n:1,dur:1.8,ch:2,peak:.85,gain:.6,rev:.3,fn:B=>{const o=B.comp(-14,4,.002,.2,B.g(.95));
    {const e=B.env(0,.25,.25,.5,B.f('bandpass',900,.7,o));B.nz('pink',0,.8,e)}
    [[0,523],[.09,659],[.18,784],[.3,1047]].forEach(([t,f])=>{const e=B.env(t,.004,.32,.7,o);B.osc('sine',f,f,t,.75,e);const e2=B.env(t,.004,.1,.4,o);B.osc('triangle',f*2,f*2,t,.45,e2)});
    {const e=B.env(.3,.3,.22,.9,o);B.osc('sine',392,392,.3,1.2,e);const e2=B.env(.3,.3,.16,.9,o);B.osc('sine',523,523,.3,1.2,e2)}
    for(let i=0;i<6;i++)B.grain(.35+i*.11,rr(5000,7500),3,.02,.18,o)}},
  // a dart that burns: a short wet hiss
  vaxhit:{n:2,dur:.4,peak:.7,gain:.45,poly:3,fn:B=>{const e=B.env(0,.004,.6,.22,B.f('highpass',2400,.7));B.nz('white',0,.26,e);const e2=B.env(0,.002,.3,.05);B.osc('sine',900,500,0,.06,e2)}}});
SFX_ORDER.push('vaxfire','vaxcure','vaxhit');

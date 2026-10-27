'use strict';
// ============ v6.40: 쇼크 크로우바 (Shock Crowbar) — a crowbar with a stun device strapped under its head ============
// The model (dark forged steel, hazard-taped grip, a black-and-yellow stun pack with two
// prongs under the gooseneck), its swings and its sounds are this game's own.
// Left click: heavy diagonal swings that alternate (forehand, backhand), up to two zombies a blow, less than the Jungle Machete.
// Right click: the bar is levelled and driven straight in, prongs first: one zombie, and an electric shock — CB.SHOCK s of a body that
// can barely move (×CB.SPD speed), cannot jump or use its skill and twitches with sparks (bosses only flinch: CB.BOSS s, no slowdown).
// The stab reaches a little further than the Jungle Machete's (2.45 m against 2.2).
// Network (host-authoritative): the host (or a solo game) shocks whoever the stab hit and tells every page ('cbsh'), so the page that moves
// the zombie slows it and every page shows the sparks; the striking page shows the spark of the hit at once.

const CB={SHOCK:3,BOSS:.6,SPD:.12};
// ---------- the model ----------
// gun frame: origin where the fist holds the grip, the bar along -Z; at the far end the bar bends up (+Y) into the gooseneck and its claw;
// the stun pack sits under the head (-Y) with its prongs pointing ahead, so the stab lands prongs first.
// w: the world model (no arc between the prongs, nothing that blinks)
const CB_NECK=-.47,CB_R=.045,CB_TIP=[0,-.026,-.5];
function cbParts(w){const P=[];
  // the bar: forged hex steel, a worn flat catching the light, wire ties
  P.push(Pt(0,0,-.19,.022,.022,.56,'forged',{r:.006}),Pt(0,.0112,-.25,.008,.0006,.38,'steel'));
  // the gooseneck: the bar bends up through ~146°, widening and thinning toward the claw; the claw splits in two
  const N=9,te=2.55;for(let i=0;i<N;i++){const t0=i/N*te,t1=(i+1)/N*te,tm=(t0+t1)/2,y=CB_R*(1-Math.cos(tm)),z=CB_NECK-CB_R*Math.sin(tm),k=i/N;
    P.push(Pt(0,y,z,.022+.012*k,.022-.008*k,CB_R*(t1-t0)+.004,'forged',{rx:tm,r:.004}))}
  {const ye=CB_R*(1-Math.cos(te)),ze=CB_NECK-CB_R*Math.sin(te),ty=Math.sin(te),tz=-Math.cos(te);
    for(const s of [-1,1])P.push(Pt(s*.0085,ye+ty*.02,ze+tz*.02,.01,.008,.042,'forged',{rx:te,r:.002}),Pt(s*.0085,ye+ty*.043,ze+tz*.043,.008,.004,.01,'steel',{rx:te,r:.0015}))}
  // the stun pack: a black housing with hazard bands, a red battery cap, vents, two steel mounting blocks round the bar
  P.push(Pt(0,-.026,-.39,.04,.03,.12,'blk2',{r:.006}),Pt(0,-.026,-.35,.042,.032,.016,'yellow',{r:.003}),Pt(0,-.026,-.432,.042,.032,.012,'yellow',{r:.003}),
    Pt(0,-.026,-.3275,.034,.024,.006,'red',{r:.004}),...[1,-1].map(s=>Pt(s*.0205,-.026,-.39,.002,.018,.06,'vent')),
    ...[-.365,-.415].map(z=>Pt(0,-.014,z,.044,.054,.008,'steel',{r:.002})),
    // the window of the charge light (the light itself blinks: tag led), the insulator, the two prongs and their bright tips
    Pt(0,-.0412,-.4,.02,.0016,.038,'muzzle'),Pt(0,-.026,-.456,.036,.026,.012,'rub',{r:.004}),
    ...[1,-1].flatMap(s=>[Pt(s*.011,-.026,-.482,.005,.005,.04,'chrome',{r:.0015}),Pt(s*.011,-.026,-.503,.007,.007,.004,'bright',{r:.002})]));
  const led=[Pt(0,-.0421,-.4,.014,.0012,.03,'tbGlow')];if(w)P.push(...led);else P.push(...TAG('led',led));
  // the arc between the prong tips: a jagged line (the first-person view makes it crackle)
  if(!w){const q=[[-.011,0],[-.005,.007],[.002,-.006],[.007,.004],[.011,0]];
    for(let i=0;i<q.length-1;i++){const [x0,y0]=q[i],[x1,y1]=q[i+1],L=Math.hypot(x1-x0,y1-y0);P.push(Pt((x0+x1)/2,CB_TIP[1]+(y0+y1)/2,CB_TIP[2],L+.0015,.0017,.0017,'tbGlow',{rz:Math.atan2(y1-y0,x1-x0),tag:'arc'}))}
    P.push(Pt(0,CB_TIP[1],CB_TIP[2],.016,.006,.0012,'tbGlow',{tag:'arc'}))}
  // red and black wires from the pack along the underside of the bar to the grip, held by ties
  P.push(Pt(.0055,-.0122,-.2,.0026,.0026,.25,'red'),Pt(-.0055,-.0122,-.2,.0026,.0026,.25,'blk'),...[-.12,-.2,-.28].map(z=>Pt(0,-.001,z,.026,.026,.004,'blk',{r:.002})));
  // the grip: a rubber wrap between two bands of hazard tape, the stun button where the thumb lies, a pommel with a lanyard loop
  P.push(Pt(0,0,.02,.032,.032,.15,'rub',{r:.01}),Pt(0,0,-.06,.0345,.0345,.014,'yellow',{r:.004}),Pt(0,0,.098,.0345,.0345,.012,'yellow',{r:.004}),
    Pt(0,-.0165,-.045,.016,.002,.02,'blk2'),Pt(0,-.0172,-.045,.011,.004,.013,'red',{r:.002}),Pt(0,0,.113,.036,.036,.014,'blk',{r:.008}),Pt(0,0,.126,.006,.016,.012,'steel'));
  return P}

// ---------- first-person rest pose: low on the right, the bar rising forward and to the left, the gooseneck curling out to the right, the stun
// pack on the side toward the eye ----------
const CB_REST={p:[.24,-.2,-.4],d:[-.22,.55,-.8],b:[.9,.28,0]},CB_ELB=[.34,-.6,-.16];
VM_POS.cbmav=skPose(CB_REST.p,CB_REST.d,CB_REST.b);
// the fist round the grip (katana.js kaHand: the grip crosses the palm, the forearm toward the elbow); one hand only
function cbVmArms(armR,armL){const P=VM_POS.cbmav;_skE.set(P.r[0],P.r[1],P.r[2],'XYZ');_skQ.setFromEuler(_skE).invert();
  const eg=_skB.set(CB_ELB[0]-P.p[0],CB_ELB[1]-P.p[1],CB_ELB[2]-P.p[2]).applyQuaternion(_skQ),H=kaHand([0,0,0],[eg.x,eg.y,eg.z],false);
  armR.position.copy(H.w);_skM.makeBasis(H.X,H.Y,H.Z);armR.quaternion.setFromRotationMatrix(_skM);armR.visible=true;if(armR.userData.hand)armR.userData.hand.rest=.95;vmHandCurl(armR,.95);
  if(armL)armL.visible=false}
GUNS.cbmav={parts:cbParts(false),grip:[0,0,0],muzzle:CB_TIP.slice(),piv:{arc:CB_TIP.slice()},vmFix:cbVmArms,wid:'cbmavw',trail:[0,0,-.27,0,.05,-.5]};
GUNS.cbmavw={parts:cbParts(true),grip:[0,0,0],muzzle:CB_TIP.slice()};

// ---------- stats ----------
WPN.cbmav={slot:3,kind:'melee',n:['쇼크 크로우바','Shock Crowbar'],cost:5000,dmg:[80,210],rate:[.55,1.15],range:[2.55,2.45],kb:[6,3.5],stag:[.8,1.2],
  speed:1,draw:.7,model:'cbmav',hold:'cbmav',sw:.9,hitT:[.16,.27],anD:[.46,.8],cleave:[2,1],arc:[.5,.8],shk:[.3,.4],blunt:1,
  swS:'cbswing',hitS:'cbhit',drawS:'cbdraw'};
BUY_MENU.find(c=>c.k==='special').items.push('cbmav');
// drawn: up from below the right hip, the head swinging up into place (not the knife's twirl: vm.js W.drKey)
VMK.drCb=[[0,[.1,-.32,.12,-1.15,.3,.5]],[.55,[0,.015,0,.1,0,-.05]],[.8,[0,-.005,0,-.02,0,.01]],[1,[0,0,0,0,0,0]]];WPN.cbmav.drKey='drCb';
// third person: one hand, the bar out in front (the knife's slash and stab)
HOLDS.cbmav={off:[-.06,-.25,-.21]};

// ---------- first-person swings (on the knife's clip engine, vmknife.js: the fist stays on the grip, the elbow travels with the stroke) ----------
// forehand (side -1, the first swing): cocked back high over the right shoulder, then chopped down across to the lower left; backhand
// (side 1): wound down across to the left, swept back up and out to the right. The stab: the bar comes down level, drawn back a hand's width while the arc between the prongs flares, then driven
// straight in and held a beat while it discharges, and pulled out.
// a key from a pose in camera space — the grip point p, the bar's direction d, the hook's side b — as offsets from the rest pose (the view
// model adds the clip's channels to its rest position and angles); each angle is unwrapped against the previous key's
function cbKey(u,p,d,b,prev,md){const P=skPose(p,d,b),R0=VM_POS.cbmav,o=[];for(let i=0;i<3;i++){let x=P.r[i]-R0.r[i];if(prev){while(x-prev[i+4]>Math.PI)x-=TAU;while(x-prev[i+4]<-Math.PI)x+=TAU}o.push(x)}
  const k=[u,p[0]-R0.p[0],p[1]-R0.p[1],p[2]-R0.p[2],o[0],o[1],o[2]];if(md)k.push(md);return k}
function cbClip(heavy,side,m){if(!m||!m.armR||!m.armR.userData.q0)return null;const g=knGrip(m),bk=g.bk,E0=KN_ELB;
  const on=(u,c)=>HK(u,1,[0,0,0],1,bk,c==null?1:c),R=(keys,elb)=>({A:[{grip:1},{p:g.palm}],k:[HK(0,0),...keys,HK(1,0)],elbT:elb});
  if(heavy){// poses in camera space (grip point, the bar's direction, the hook's side), turned into offsets from the rest pose
    let pv=null;const K=(u,p,d,b,md)=>pv=cbKey(u,p,d,b,pv,md);
    return {cbH:1,
      G:[K6(0),K(.12,[.2,-.16,-.36],[-.1,.14,-.99],[.7,.7,.05]),K(.3,[.21,-.16,-.3],[-.1,.15,-.98],[.7,.7,.05]),K(.34,[.21,-.16,-.3],[-.1,.15,-.98],[.7,.7,.05]),
         K(.42,[.16,-.135,-.56],[-.07,.1,-.99],[.7,.7,.05],1),K(.47,[.16,-.135,-.565],[-.07,.1,-.99],[.7,.7,.05]),K(.6,[.17,-.14,-.53],[-.08,.11,-.99],[.7,.7,.05]),
         K(.78,[.2,-.17,-.42],[-.14,.3,-.94],[.8,.55,.02]),K6(1)],
      R:R([on(.1,.95),on(.3,1),on(.42,1),on(.62,1),on(.85,.97)],[[0,...E0],[.16,.3,-.42,.1],[.34,.32,-.4,.16],[.44,.2,-.34,-.12],[.62,.21,-.35,-.09],[.84,.26,-.44,-.04],[1,...E0]]),
      C:[[0,0,0,0],[.3,.01,.004,-.004],[.42,-.024,-.004,.006],[.56,-.012,0,.002],[1,0,0,0]],trail:[.37,.47],
      E:[[.04,'cbchg',.7,1],[.36,'cbswing',.75,1.25]]}}
  const sd=side>0?1:-1;
  if(sd>0)return {
    G:[K6(0),K6(.17,.06,.07,.05,.4,-.45,-.25),K6(.25,.07,.08,.055,.44,-.5,-.28),K6(.35,-.09,.0,-.1,-.3,.5,.3),K6(.46,-.24,-.1,-.05,-.75,.85,.45),
       K6(.6,-.22,-.11,-.03,-.7,.78,.42),K6(.8,-.06,-.02,-.01,-.18,.2,.1),K6(1)],
    R:R([on(.14,.95),on(.25),on(.35),on(.46),on(.64),on(.86,.97)],[[0,...E0],[.2,.38,-.36,.06],[.27,.39,-.35,.07],[.36,.16,-.44,-.12],[.47,-.04,-.52,-.1],[.62,-.02,-.52,-.08],[.84,.2,-.48,-.04],[1,...E0]]),
    C:[[0,0,0,0],[.25,.006,-.006,-.01],[.36,-.008,.014,.022],[.47,-.006,.016,.026],[.7,0,.004,.006],[1,0,0,0]],trail:[.27,.52],E:[[.24,'cbswing',.75,1]]};
  return {
    G:[K6(0),K6(.17,-.1,.02,-.02,-.12,.55,.35),K6(.25,-.11,.025,-.025,-.14,.6,.38),K6(.35,.02,.04,-.1,.1,-.3,-.2),K6(.46,.12,.035,-.06,.22,-.66,-.32),
       K6(.6,.1,.03,-.04,.2,-.58,-.28),K6(.8,.03,.005,-.01,.06,-.2,-.1),K6(1)],
    R:R([on(.14,.95),on(.25),on(.35),on(.46),on(.64),on(.86,.97)],[[0,...E0],[.2,.1,-.42,-.1],[.27,.08,-.41,-.11],[.36,.24,-.4,-.12],[.47,.38,-.4,-.02],[.62,.36,-.42,-.01],[.84,.28,-.45,-.03],[1,...E0]]),
    C:[[0,0,0,0],[.25,.006,.006,.008],[.36,-.008,-.014,-.02],[.47,-.006,-.016,-.024],[.7,0,-.004,-.006],[1,0,0,0]],trail:[.27,.52],E:[[.24,'cbswing',.75,1.08]]}}
VM.cbSwing=function(heavy){const m=this.cur,W=WPN.cbmav;if(!m)return false;
  const side=this.cbSide=heavy?(this.cbSide||-1):(this.cbSide<0?1:-1);let S=null;try{S=cbClip(heavy,side,m)}catch(e){console.error(e)}if(!S)return false;
  const d=heavy?.8:Math.min(.46,W.rate[0]-.06);const A=this.playClip(S,0,d,'mel');if(!A)return false;A.mel=1;this.mel=null;this.trail.S.length=0;return true};
{const vm0=VM.melee;VM.melee=function(heavy){if(this.id==='cbmav'&&this.cbSwing&&this.cbSwing(heavy))return;return vm0.call(this,heavy)}}
// every frame: the arc crackles now and then (and flares through the stab), the charge light blinks while it is not ready, a blue glow on the hand
VMX.cbmav=function(V,a,dt,o,m){const T=m.tags,A=V.act,stab=!!(A&&A.mel&&A.S&&A.S.cbH);
  V.cbArc=(V.cbArc||0)-dt;if(V.cbArc<-(V.cbGap||(V.cbGap=rr(1.2,3.2)))){V.cbArc=rr(.06,.14);V.cbGap=rr(1.2,3.2);if(V.vis)AU.play('cbcrk',{vol:.22,rate:rr(1.1,1.4)})}
  const on=stab&&A.u>.04&&A.u<.56||V.cbArc>0;
  if(T.arc){T.arc.visible=on&&Math.random()<.85;if(on){T.arc.rotation.z=rr(-.5,.5)+(Math.random()<.5?Math.PI:0);T.arc.scale.set(1,rr(.6,1.6),1)}}
  if(T.led)T.led.visible=G.t>=a.nextFire-.05||Math.sin(V.t*18)>0;
  if(on){const u=V.U.uMuzzle.value,p=stab?.9:.5;u.r=Math.max(u.r,.25*p);u.g=Math.max(u.g,.5*p);u.b=Math.max(u.b,1*p)}
  // the discharge at the end of the stab, in front of the eye (where the prongs are)
  if(stab&&A.u>.36&&A.u<.52&&V.vis&&Math.random()<.6){const p=muzzleWorld(a);for(let k=0;k<3;k++)FX.spark(p.x,p.y,p.z,rr(-2,2),rr(-1,2),rr(-2,2),rr(.06,.14),[.6,.85,1]);
    if(Math.random()<.4)FX.spawn({x:p.x,y:p.y,z:p.z,life:.05,s0:.1,s1:.25,r:.6,g:.85,b:1,f:1,add:1})}};

// ---------- the shock ----------
const CB_BOSSES={boss:1,aleph:1,argus:1,khepri:1,lyrebird:1,tiamat:1,centi:1};
const cbBoss=t=>!!(t&&(CB_BOSSES[t.zc]||ZBIG[t.zc]||t.epRay));
// host / solo: the stab went in
function cbShock(t,src){if(!t||!t.alive||t.team!==TZ)return;const d=cbBoss(t)?CB.BOSS:CB.SHOCK;cbShockOn(t,d);if(NET.host)netEv('cbsh',{i:t.id,d:Math.round(d*10)})}
// every page
function cbShockOn(t,d){const was=t.shockT>0;t.shockT=Math.max(t.shockT||0,d);if(!cbBoss(t)){t.mvx*=.2;t.mvz*=.2;if(t.fmC>0&&typeof FM!=='undefined'&&!NET.cli)FM.end(t,'frost')}
  if(t.isPlayer&&!was){HUD.note(LI()?'Shocked! You can barely move':'감전! 몸이 말을 안 들어요',1.6);FX.shake=Math.max(FX.shake,.35)}}
// the spark of the hit (the striking page at once; others see it with the swing)
function cbZapFx(t){if(!t||G.t-(t.cbZap||-9)<.25)return;t.cbZap=G.t;const c=t.c,y=c.y+1.15;
  FX.spawn({x:c.x,y,z:c.z,life:.12,s0:.4,s1:1.4,r:.55,g:.8,b:1,a:.9,f:14,add:1});FX.spawn({x:c.x,y,z:c.z,life:.07,s0:.3,s1:.6,r:.9,g:.95,b:1,f:1,add:1});
  for(let i=0;i<16;i++)FX.spark(c.x,y,c.z,rr(-4,4),rr(-1,4),rr(-4,4),rr(.15,.35),[.55,.82,1]);DL.add(c.x,y,c.z,'#6cbcff',7,2.6,.16);AU.at('cbzap',c.x,y,c.z,{vol:.95,range:45})}
// sparks crawling over a shocked body, a crackle, twitching
function cbShockFx(a,dt){const c=a.c,h=c.h||1.8;
  if(Math.random()<dt*24){const y=c.y+rr(.2,h*.95),g=rr(0,TAU),r=(a.hitW||c.hw)+.05,x=c.x+Math.cos(g)*r,z=c.z+Math.sin(g)*r;
    for(let k=0;k<4;k++)FX.spark(x,y,z,rr(-2,2),rr(-1,2),rr(-2,2),rr(.08,.18),[.6,.85,1]);FX.spawn({x,y,z,life:.06,s0:.12,s1:.32,r:.6,g:.85,b:1,a:.9,f:1,add:1})}
  if(Math.random()<dt*5)DL.add(c.x,c.y+1.2,c.z,'#6ab8ff',4,1.5,.08);
  if(!AU.throttle('cbs'+a.id,420))AU.at('cbcrk',c.x,c.y+1.2,c.z,{vol:.55,range:28});
  if(Math.random()<dt*7&&a.an)a.an.flinch=Math.min(1,(a.an.flinch||0)+.5)}

// ---------- hooks ----------
(function(){
  // the stab: the spark at once on the page that struck; the shock where hits are decided
  const da=damageActor;damageActor=function(t,dmg,src,o){
    if(o&&o.w==='cbmav'&&o.heavy&&t&&t.alive&&t.team===TZ){cbZapFx(t);if(!NET.ghost&&!NET.cli){const r=da(t,dmg,src,o);if(t.alive)cbShock(t,src);return r}}
    return da(t,dmg,src,o)};
  // a shocked zombie: a crawl, no jumps, no skill
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);return a.shockT>0&&a.team===TZ&&!cbBoss(a)?s*CB.SPD:s};
  const ap=actorPhysics;actorPhysics=function(a,dt){if(a.shockT>0&&a.team===TZ&&!cbBoss(a))a.cmd.jump=false;return ap(a,dt)};
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.shockT>0&&a.team===TZ&&!cbBoss(a))a.cmd.skill=false;return aw(a,dt)};
  // the arc crackling at the tip as someone else winds up a stab
  const sw=meleeSwing;meleeSwing=function(a,heavy){sw(a,heavy);if(!heavy||a.cur!=='cbmav'||a.isPlayer&&!G.spec)return;
    for(let i=0;i<5;i++)nyLater(i*.05,()=>{if(!a.alive||a.cur!=='cbmav')return;const p=muzzleWorld(a);for(let k=0;k<3;k++)FX.spark(p.x,p.y,p.z,rr(-1.5,1.5),rr(-.5,1.5),rr(-1.5,1.5),rr(.06,.14),[.6,.85,1]);
      FX.spawn({x:p.x,y:p.y,z:p.z,life:.05,s0:.08,s1:.18,r:.6,g:.85,b:1,f:1,add:1})});AU.at('cbchg',a.c.x,a.c.y+1.3,a.c.z,{vol:.5,range:30})};
  // every frame: the shock's time and its sparks; the electric tint over the body; the shocked player's screen
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st==='menu'||G.st==='over')return;
    for(const a of G.actors){if(!(a.shockT>0))continue;if(!a.alive||a.team!==TZ){a.shockT=0;continue}a.shockT=Math.max(0,a.shockT-dt);cbShockFx(a,dt)}
    const P=G.player,hud=HUD.el&&HUD.el.hud,sh=!!(P&&P.alive&&P.team===TZ&&P.shockT>0);if(hud&&hud.classList.contains('shk')!==sh)hud.classList.toggle('shk',sh)};
  const uv=updateVisual;updateVisual=function(a,dt){uv(a,dt);if(a.shockT>0&&a.alive&&a.team===TZ&&a.ch&&!(a.frozen>0)){const U=a.ch.mat.uniforms;U.uTint.value.set(.55,.82,1,.16+.22*Math.random());if(Math.random()<.2)U.uFlash.value=Math.max(U.uFlash.value,.18)}};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors)a.shockT=0};
  Object.assign(CLIH,{cbsh(L,m){const t=byId(m.i);if(t&&t.alive&&t.team===TZ)cbShockOn(t,(m.d|0)/10)}});
  // bots: now and then one carries it
  const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.06)L[3]='cbmav';return L};
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // a heavy bar through the air
  cbswing:{n:3,dur:.5,peak:.75,gain:.5,pj:.06,fn:B=>{whoosh(B,500,1800,.24,.75);whoosh(B,240,700,.3,.35);const e=B.env(.06,.04,.05,.14);B.osc('sine',1400,900,.06,.18,e)}},
  // steel on a body: a dull thud, a crunch, the bar ringing
  cbhit:{n:3,dur:.6,peak:.9,gain:.75,rev:.08,poly:3,fn:B=>{{const e=B.env(0,.002,1,.12,B.sh(1.8));B.nz('brown',0,.16,B.f('lowpass',420,.8,e))}
    {const e=B.env(0,.002,.6,.08);B.nz('pink',0,.1,B.f('bandpass',1300,1.6,e))}B.grain(.004,2600,2,.012,.4);B.ring(.002,rr(1150,1300),[1,2.76,4.4],[.22,.12,.06],[.2,.1,.04])}},
  // the discharge: a hard crack and a raw electric buzz with a high zing over it
  cbzap:{n:3,dur:.9,ch:2,peak:.95,gain:.85,rev:.12,poly:4,pj:.04,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    for(const s of [-1,1]){const e=B.env(0,.0005,1,.03,B.pan(s*.3,o));B.nz('white',0,.05,B.f('highpass',2500,.7,e))}
    {const e=B.env(0,.004,.7,.45,B.f('bandpass',900,1.1,o));const g=B.g(1,e);B.osc('square',rr(110,130),rr(95,105),0,.5,g);B.osc('sawtooth',rr(230,250),rr(200,215),0,.5,B.g(.5,g));B.am(g,0,.5,60,.7)}
    {const e=B.env(0,.01,.35,.3,B.f('highpass',4000,.7,o));B.nz('white',0,.35,e)}{const e=B.env(.01,.02,.25,.35,o);B.osc('sine',5200,2800,.01,.4,e)}
    for(let i=0;i<8;i++){const t=rr(.05,.5);B.grain(t,rr(3000,6500),3,.006,rr(.15,.35),B.pan(rr(-.8,.8),o))}}},
  // a short crackle
  cbcrk:{n:3,dur:.35,peak:.6,gain:.35,poly:4,fn:B=>{for(let i=0;i<7;i++){const t=Math.pow(Math.random(),1.3)*.25;B.grain(t,rr(2800,6500),3,rr(.003,.008),rr(.2,.5))}
    const e=B.env(0,.005,.15,.12,B.f('bandpass',1200,2));B.osc('square',120,110,0,.14,e)}},
  // the stab charging: a rising whine and crackles
  cbchg:{n:2,dur:.6,peak:.75,gain:.45,poly:3,fn:B=>{const e=B.env(0,.18,.35,.2,B.f('lowpass',3000,.8));B.osc('sawtooth',180,760,0,.4,e);
    for(let i=0;i<6;i++)B.grain(rr(.02,.38),rr(3000,6000),3,.005,rr(.15,.3))}},
  // drawn: the pack's switch clicks on, a whine up, a crackle at the prongs
  cbdraw:{n:1,dur:.8,peak:.8,gain:.5,rev:.12,fn:B=>{B.grain(0,3600,2.5,.01,.6);B.grain(.05,2400,3,.008,.4);const e=B.env(.06,.2,.3,.2);B.osc('sine',300,1700,.06,.42,e);
    for(let i=0;i<6;i++)B.grain(rr(.3,.55),rr(3200,6000),3,.005,rr(.2,.4))}}});
SFX_ORDER.push('cbswing','cbhit','cbzap','cbcrk','cbchg','cbdraw');

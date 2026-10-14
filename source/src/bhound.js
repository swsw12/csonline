'use strict';
// ============ v6.56: BLOODHOUND — the hunter's marking rifle (supply crates only) ============
// Our own design. A bolt-action rifle with a tracker round: every zombie it hits is MARKED for 10 s. A marked zombie cannot hide: every
// human sees it through walls (a red mark with its distance, and on the radar), it glows red, and it takes half again as much damage from
// everyone (a boss a quarter more). The hunter who marked it gets an assist when someone else brings it down. A player zombie who is marked
// is told so. Five rounds a magazine, two zoom levels, a heavy bolt.
// Network: the host marks (a client's hit is a claim, like any shot) and tells everyone ('hnd': who, by whom); the extra damage is
// the host's alone (it decides every hit).

// ---------- numbers ----------
// T: how long a mark lasts; AMP / AMPB: damage taken while marked (a zombie / a boss); MAX: the marks drawn on screen at once
const HND={T:10,AMP:1.5,AMPB:1.25,MAX:8};

// ---------- the model ----------
// gun frame as every rifle (origin at the grip, the barrel along -Z): a blued receiver, a long barrel with a ported brake, the scope with a
// red ring round its front lens and a rangefinder with a red eye on its side, the tracker magazine (a red band), the bolt on the right, a
// walnut thumbhole stock with a rubber pad
function hndParts(){const P=[];
  P.push(Pt(0,.025,-.07,.05,.06,.3,'bluesteel',{r:.008}),Pt(0,.0,-.07,.046,.012,.28,'mtB'),Pt(0,.05,-.07,.036,.012,.24,'rail'));
  P.push(Pt(0,.04,-.5,.026,.026,.56,'bluesteel'),Pt(0,.04,-.33,.034,.034,.1,'mtB',{r:.01}),Pt(0,.04,-.8,.036,.036,.07,'steel',{r:.008}),...[-.785,-.81].flatMap(z=>[1,-1].map(s=>Pt(s*.018,.04,z,.002,.014,.012,'muzzle'))),Pt(0,.04,-.8365,.02,.02,.003,'muzzle'));
  // the scope: tube, bells, the lenses (the front one ringed red), turrets, the rangefinder
  P.push(...scope(.112,-.26,.12,.042,'mtB'),Pt(0,.112,-.2625,.056,.056,.003,'dkGlow'),Pt(0,.112,-.2645,.044,.044,.002,'lens'),
    Pt(-.05,.112,-.12,.03,.034,.07,'mtB',{r:.006}),Pt(-.0655,.112,-.12,.003,.012,.012,'dkGlow'),Pt(-.05,.112,-.156,.02,.02,.003,'lens'),
    Pt(0,.072,-.14,.02,.03,.02,'mtB'),Pt(0,.072,.0,.02,.03,.02,'mtB'));
  // the bolt (right) and the tracker magazine (a red band)
  P.push(...TAG('bolt',[Pt(.04,.03,.035,.034,.012,.012,'steel'),Pt(.06,.022,.035,.018,.018,.018,'mtB',{r:.008})]),
    ...TAG('mag',[Pt(0,-.035,-.07,.034,.06,.075,'mtB',{r:.004}),Pt(0,-.04,-.07,.036,.012,.077,'mtRed'),Pt(0,-.067,-.07,.036,.008,.079,'steel')]));
  // the stock: forend, a thumbhole butt, a cheek rest, the pad
  P.push(Pt(0,.0,-.3,.05,.05,.3,'wood2',{r:.012}),Pt(0,-.04,-.36,.012,.012,.1,'mtB'),...pGrip('wood2',-.06,.045,.3),...tGuard(-.005),
    Pt(0,.0,.19,.048,.1,.28,'wood2',{r:.012,rx:-.06}),Pt(0,-.01,.12,.05,.035,.06,'mtB'),Pt(0,.05,.17,.044,.024,.16,'wood2',{r:.008}),Pt(0,-.015,.335,.052,.13,.02,'rub',{rx:-.06}));
  return P}
GUNS.bhound={parts:hndParts(),grip:[0,-.03,.03],sup:[0,0,-.3],muzzle:[0,.04,-.84],mag:[0,-.07,-.07],eject:[.03,.04,-.02]};

// ---------- stats ----------
WPN.bhound={slot:1,kind:'sniper',crate:1,cat:'sniper',n:['블러드하운드','Bloodhound'],cost:5500,mag:5,res:20,dmg:105,rpm:50,semi:1,bolt:1,spread:[.045,.09,.2],spreadZ:.0012,zoom:[28,10],
  rec:[.085,.012],kb:18,stag:.6,hs:3,reload:3.2,draw:.9,speed:.88,snd:'bhfire',model:'bhound',hold:'rifle',
  bd:['보급 전용 · 맞힌 좀비 10초 표식: 벽 너머 노출 · 받는 피해 +50%','Crates only · a hit marks a zombie for 10 s: seen through walls · takes 50% more']};
VM_POS.bhound={p:[.145,-.165,-.38],r:[0,.075,.03]};
GUN_DESIGN.bhound={mag:5,ch:0,act:'bolt',x:.8,heavy:.6};WPN.bhound.fd=GUN_DESIGN.bhound;WPN.bhound.ch=0;
CRATE_GUNS.push('bhound');{const c=BUY_MENU.find(q=>q.k==='sniper');if(c&&!c.items.includes('bhound'))c.items.push('bhound')}

// ---------- the mark ----------
const hndBoss=t=>!!(ZBIG[t.zc]||typeof EP!=='undefined'&&EP.on&&EP.B()&&EP.B().zc===t.zc);
const hndOn=t=>!!(t&&t.alive&&t.team===TZ&&t.hndT>G.t);
// the host / solo page marks; every page hears of it
function hndMark(t,src){if(NET.cli&&!NET.ev)return;if(!t.alive||t.team!==TZ)return;const fresh=!(t.hndT>G.t);t.hndT=G.t+HND.T;t.hndBy=src||null;
  hndFx(t,fresh,src);if(NET.host)netEv('hnd',{i:t.id,s:src?src.id:-1})}
function hndFx(t,fresh,src){const c=t.c,y=c.y+(t.c.h||1.8)+.3;
  for(let i=0;i<10;i++){const an=i/10*TAU;FX.spawn({x:c.x+Math.cos(an)*.25,y,z:c.z+Math.sin(an)*.25,vx:Math.cos(an)*1.4,vy:.2,vz:Math.sin(an)*1.4,life:.45,s0:.06,s1:.02,r:1,g:.2,b:.15,f:11,add:1})}
  FX.spawn({x:c.x,y,z:c.z,life:.4,s0:.2,s1:1.1,r:1,g:.18,b:.12,a:.7,f:14,add:1});
  if(src&&src.isPlayer){if(!AU.throttle('hndp',120))AU.play('bhmark',{vol:fresh?.7:.45,rate:fresh?1:1.25})}
  if(t.isPlayer&&fresh){HUD.note(LI()?'MARKED — every human can see you for 10 s':'사냥꾼 표식 — 10초 동안 위치가 노출돼요',2.6);AU.play('bhmark',{vol:.6,rate:.7})}}

// ---------- the marks on screen (every human page): a red diamond and the distance, through walls ----------
const HNH={mk:[]},_hnv=new THREE.Vector3();
function hndHud(){const P=G.player,me=P&&(P.alive?P:(G.spec&&G.spec.alive?G.spec:null)),on=!!(me&&me.team===TH&&G.st!=='menu');let n=0;
  if(on)for(const z of G.actors){if(n>=HND.MAX)break;if(!hndOn(z)||z.reviving>0)continue;
    _hnv.set(z.c.x,z.head.y+.5,z.c.z).project(R.cam);if(!(_hnv.z<1&&Math.abs(_hnv.x)<1.05&&Math.abs(_hnv.y)<1.05))continue;
    let m=HNH.mk[n];if(!m){m=HNH.mk[n]=document.createElement('div');m.className='hndMk';$('hud').appendChild(m)}n++;
    m.style.display='block';m.style.left=((_hnv.x+1)*50)+'%';m.style.top=((1-_hnv.y)*50)+'%';
    const s='◆ '+Math.round(Math.hypot(z.c.x-me.c.x,z.c.z-me.c.z))+'m';if(m.textContent!==s)m.textContent=s;const end=z.hndT-G.t<2;if(m.classList.contains('end')!==end)m.classList.toggle('end',end)}
  for(let i=n;i<HNH.mk.length;i++)if(HNH.mk[i].style.display!=='none')HNH.mk[i].style.display='none'}

// ---------- hooks ----------
(function(){
  // the host's hits: a marked zombie takes more (from everyone); a Bloodhound round marks what it hits
  const da=damageActor;damageActor=function(t,dmg,src,o){
    if(!NET.ghost&&!NET.cli&&t&&t.alive&&t.team===TZ&&G.st!=='end'&&G.st!=='over'){
      if(t.hndT>G.t&&src&&src.team===TH)dmg*=hndBoss(t)?HND.AMPB:HND.AMP;
      const r=da.call(this,t,dmg,src,o);if(o&&o.w==='bhound'&&t.alive&&t.team===TZ)hndMark(t,src);return r}
    return da.apply(this,arguments)};
  // brought down while marked by someone else: the hunter's assist
  const kz=killZombie;killZombie=function(t,src,o){const by=t&&t.hndT>G.t?t.hndBy:null;const r=kz.apply(this,arguments);
    if(by&&by!==src&&!NET.cli&&by.team===TH){by.score+=1;by.assists=(by.assists|0)+1}if(t){t.hndT=0;t.hndBy=null}return r};
  // the radar shows a marked zombie to every human
  const aw=RADAR.aware;RADAR.aware=function(P,a,dt){if(P&&P.team===TH&&hndOn(a))return true;return aw.call(this,P,a,dt)};
  // the red glow of a mark (over no other tint)
  const uv=updateVisual;updateVisual=function(a,dt){uv(a,dt);if(hndOn(a)&&a.ch&&!(a.frozen>0)){const T=a.ch.mat.uniforms.uTint.value;if(T.w===0)T.set(1,.12,.08,.2+.12*Math.sin(G.t*9))}};
  const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);try{hndHud()}catch(e){console.error(e)}};
  // a new round, a zombie that turns back: no mark
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){a.hndT=0;a.hndBy=null}for(const m of HNH.mk)m.style.display='none'};
  Object.assign(CLIH,{hnd(L,m){const t=byId(m.i);if(!t||!t.alive||t.team!==TZ)return;const fresh=!(t.hndT>G.t);t.hndT=G.t+HND.T;t.hndBy=byId(m.s)||null;hndFx(t,fresh,t.hndBy)}});
})();

// ---------- sounds (all synthesised) ----------
// the shot: a heavy rifle, a deep punch and a long rolling tail; the mark: a bright sonar ping with a falling echo
Object.assign(GUNDEF,{bhound:()=>({drive:2.25,crack:1.15,crackF:2400,body:[{f:rr(640,760),q:.8,l:1,d:.12},{f:rr(1800,2200),q:1,l:.8,d:.08},{f:rr(230,290),q:.8,l:.85,d:.22,n:'pink'}],
  punch:{f0:rr(96,110),f1:40,d:.22,l:1.35},mech:null,tail:{l:.5,tau:.5,d:1.8,f0:2400,f1:140},echo:[{t:rr(.26,.34),l:.14,f:850,pan:rr(-.8,.8)},{t:rr(.55,.7),l:.07,f:520,pan:rr(-.8,.8)}]})});
Object.assign(SFX,{
  bhfire:{n:3,dur:2.1,ch:2,peak:.95,gain:1,rev:.22,poly:3,pj:.02,fn:B=>gunshot(B,GUNDEF.bhound())},
  bhmark:{n:1,dur:.9,ch:2,peak:.7,gain:.5,rev:.25,fn:B=>{const o=B.comp(-14,4,.002,.15,B.g(.95));
    {const e=B.env(0,.002,.5,.35,o);B.osc('sine',1760,1720,0,.4,e)}{const e=B.env(0,.002,.2,.2,o);B.osc('triangle',3520,3480,0,.24,e)}
    {const e=B.env(.16,.002,.16,.4,o);B.osc('sine',1320,1300,.16,.45,e)}{const e=B.env(.32,.002,.07,.4,o);B.osc('sine',990,980,.32,.45,e)}}}});
SFX_ORDER.push('bhfire','bhmark');

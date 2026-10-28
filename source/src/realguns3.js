'use strict';
// ============ v7.10: two more real guns for the shop — the M1 Garand and the Thompson M1928 ============
// M1 GARAND (rifle): the .30-06 semi-auto of 1936 fed by an eight-round en-bloc clip. A heavy round that shoves a zombie hard; the empty
// clip flies out of the top with its ping as the last round goes (GAR.ping, every page hears it) and the bolt stays open; a fresh clip
// is thumbed down into the receiver and the bolt slams home. A clip cannot be topped up: a reload with rounds left first pulls the op rod
// and the part-used clip springs out (its rounds go back to the spares), which takes longer (GAR.PART s more).
// THOMPSON M1928 (SMG): the .45 with the fifty-round drum, the finned barrel and the Cutts compensator, a vertical fore-grip; it shoves
// zombies harder than any other SMG. An open-bolt gun: from empty the knob on top is pulled back after the drum change.
// Models: boxes on the weapon atlas, our own drawings of the real guns' shapes (dark walnut stocks, parkerized and blued steel, brass).

// ---------- helpers ----------
const RG3X=[1,-1];
// a short cylinder along x (a drum's body): one part, round across x (cyl, gunart.js partGeo)
const rg3Drum=(x,y,z,w,d,m,r)=>[Pt(x,y,z,w,d,d,m,{cyl:'x',r:r==null?.006:r})];

// ---------- M1 Garand ----------
// the receiver in parkerized steel sunk into a walnut stock; the clip of brass in the open top; the op rod down the right side and its
// handle (tag chg); the rear aperture sight with its two knobs; the barrel under the upper handguards, the gas cylinder and its lock under
// the muzzle with the winged front sight; the lower band with its swivel; the stock's wrist, the comb and the steel butt plate
function garParts(){const P=[],X=RG3X,S='park',Wd='wood',Wd2='wood';
  // ---- the receiver ----
  P.push(Pt(0,.052,-.07,.04,.05,.2,S,{r:.006}),Pt(0,.059,.032,.036,.04,.035,S,{r:.006}),Pt(0,.0778,-.085,.026,.002,.075,'muzzle'),
    ...X.map(s=>Pt(s*.0198,.068,-.085,.002,.018,.072,S)),Pt(0,.072,-.026,.02,.016,.048,'steel',{r:.004}),Pt(0,.073,-.04,.006,.006,.03,'bright'));
  // the rear sight: its base, the aperture leaf (and its hole), the windage and elevation knobs
  P.push(Pt(0,.084,.028,.03,.014,.03,S,{r:.003}),Pt(0,.1,.024,.016,.02,.004,S,{r:.001}),Pt(0,.101,.0218,.0045,.0045,.0012,'muzzle'),...X.map(s=>Pt(s*.0195,.087,.03,.008,.016,.016,S,{r:.0045})));
  // the op rod along the right side, its handle (it runs back with every shot and stays back on an empty clip)
  P.push(Pt(.0205,.038,-.3,.009,.011,.44,S,{r:.003}));
  P.push(...TAG('chg',[Pt(.026,.046,-.046,.014,.016,.026,S,{r:.004}),Pt(.035,.046,-.046,.011,.019,.017,S,{r:.0055})]));
  // the clip and its rounds (tag mag): the steel clip's sides and the top two cartridges, bullets forward
  P.push(...TAG('mag',[...X.map(s=>Pt(s*.0124,.073,-.086,.0018,.014,.07,'steel')),Pt(-.0055,.0803,-.083,.0104,.0104,.058,'brass',{r:.005}),Pt(.0055,.0763,-.083,.0104,.0104,.058,'brass',{r:.005}),
    Pt(-.0055,.0803,-.119,.0074,.0074,.014,'orange',{r:.0035}),Pt(.0055,.0763,-.119,.0074,.0074,.014,'orange',{r:.0035}),Pt(0,.0685,-.051,.026,.012,.004,'steel')]));
  // ---- the barrel, the gas cylinder, its lock and the front sight ----
  P.push(Pt(0,.058,-.5,.021,.021,.62,S,{r:.0095}),Pt(0,.058,-.8125,.015,.015,.004,'muzzle',{r:.006}),Pt(0,.036,-.725,.024,.024,.11,S,{r:.011}),
    Pt(0,.048,-.786,.03,.046,.02,S,{r:.006}),Pt(0,.08,-.786,.004,.017,.006,S),...X.map(s=>Pt(s*.0085,.075,-.786,.003,.017,.009,S)));
  // the lower band (and its swivel), the ferrule between the handguards
  P.push(Pt(0,.047,-.6,.035,.042,.017,S,{r:.006}),Pt(0,.014,-.6,.006,.02,.012,'steel',{r:.002}),Pt(0,.074,-.364,.031,.021,.012,S,{r:.004}));
  // ---- the stock: the upper handguards over the barrel, the fore-end, round the receiver, the wrist, the butt ----
  P.push(Pt(0,.075,-.27,.03,.017,.17,Wd,{r:.007}),Pt(0,.074,-.475,.028,.016,.2,Wd,{r:.007}),Pt(0,.03,-.37,.046,.042,.42,Wd,{r:.013}),Pt(0,.03,-.57,.042,.04,.02,Wd,{r:.012}),
    Pt(0,.026,-.07,.05,.032,.22,Wd,{r:.01}),...X.map(s=>Pt(s*.0235,.05,-.25,.002,.01,.2,Wd2)));
  P.push(Pt(0,.006,.086,.044,.062,.13,Wd,{rx:-.24,r:.014}),Pt(0,-.026,.25,.046,.13,.2,Wd,{rx:-.1,r:.015}),Pt(0,.03,.205,.04,.012,.13,Wd,{rx:-.06,r:.005}),
    Pt(0,-.034,.352,.049,.136,.01,S,{rx:-.1,r:.003}),Pt(0,-.094,.272,.006,.02,.02,'steel',{r:.002}),...X.map(s=>Pt(s*.0235,-.02,.24,.002,.07,.11,Wd2,{rx:-.1})));
  // the trigger guard, the trigger, the safety at the guard's front
  P.push(Pt(0,-.006,.022,.013,.006,.072,S,{r:.002}),Pt(0,-.026,.002,.012,.034,.006,S,{r:.002}),Pt(0,-.004,.014,.004,.022,.005,'steel',{rx:.15}),Pt(0,.006,-.016,.01,.008,.012,S,{r:.002}));
  return P}
GUNS.garand={parts:garParts(),grip:[0,-.022,.08],sup:[0,.03,-.4],muzzle:[0,.058,-.815],mag:[0,.075,-.086],eject:[.02,.085,-.08]};

// ---------- Thompson M1928 ----------
// the blued receiver with the knob on top (tag chg), the Lyman rear sight; the finned barrel and the Cutts compensator with its slots;
// the vertical fore-grip with its finger grooves; the fifty-round drum in front of the trigger guard (tag mag; its face plate turns a
// little with every shot: tag aux) with the winding key; the raked pistol grip, the detachable stock and its butt plate
function tomParts(){const P=[],X=RG3X,S='bluesteel',Wd='wood',Wd2='wood2';
  P.push(Pt(0,.055,-.03,.044,.06,.2,S,{r:.007}),Pt(0,.0855,-.035,.008,.002,.09,'muzzle'),Pt(0,.06,.075,.04,.05,.012,S,{r:.006}),
    ...X.map(s=>Pt(s*.0225,.05,-.03,.002,.034,.17,'gunmetal')),Pt(.0228,.062,-.02,.0015,.016,.04,'muzzle'),Pt(-.0232,.036,-.005,.004,.012,.018,'steel',{r:.002}),Pt(-.0232,.036,.02,.004,.012,.018,'steel',{r:.002}));
  P.push(...TAG('chg',[Pt(0,.093,-.06,.013,.02,.02,S,{r:.006}),Pt(0,.1,-.06,.015,.006,.022,'gunmetal',{r:.003})]));
  P.push(Pt(0,.094,.052,.03,.018,.034,S,{r:.003}),Pt(0,.108,.05,.006,.018,.004,S),Pt(0,.08,-.472,.004,.016,.008,S));
  // the barrel and its fins, the compensator
  P.push(Pt(0,.058,-.29,.02,.02,.34,S,{r:.008}));for(let i=0;i<11;i++)P.push(Pt(0,.058,-.145-i*.024,.031,.031,.008,S,{r:.013}));
  P.push(Pt(0,.06,-.482,.033,.035,.062,S,{r:.008}),...[0,1,2,3].map(i=>Pt(0,.0778,-.46-i*.012,.023,.002,.005,'muzzle')),Pt(0,.06,-.5135,.016,.016,.002,'muzzle'));
  // the fore-grip
  P.push(Pt(0,.038,-.25,.022,.02,.03,S,{r:.004}),Pt(0,-.012,-.252,.036,.1,.046,Wd,{r:.016}),...[0,1,2].map(i=>Pt(0,-.042+i*.026,-.2755,.034,.009,.004,Wd2)));
  // the lower frame, the trigger guard and trigger, the pistol grip
  P.push(Pt(0,.016,.005,.04,.03,.17,S,{r:.006}),Pt(0,-.006,.03,.012,.006,.06,S,{r:.002}),Pt(0,-.003,.03,.004,.02,.005,'steel',{rx:.15}),
    Pt(0,-.044,.058,.032,.092,.046,Wd,{rx:.3,r:.015}),Pt(0,-.044,.034,.034,.06,.004,Wd2,{rx:.3}));
  // the drum (tag mag): its body, both face plates, the winding key, the feed throat up to the frame
  P.push(...TAG('mag',[...rg3Drum(0,-.052,-.078,.056,.18,S,.008),...X.map(s=>Pt(s*.0292,-.052,-.078,.004,.15,.15,'gunmetal',{cyl:'x',r:.002})),...X.map(s=>Pt(s*.0296,-.052,-.078,.003,.05,.05,S,{cyl:'x',r:.001})),
    Pt(0,.0,-.078,.03,.04,.052,S,{r:.006})]));
  P.push(...TAG('aux',[Pt(-.034,-.052,-.078,.006,.044,.012,'steel',{r:.003}),Pt(-.034,-.052,-.078,.006,.012,.044,'steel',{r:.003}),Pt(-.0312,-.052,-.078,.002,.03,.03,'muzzle',{r:.006})]));
  // the stock
  P.push(Pt(0,.042,.125,.042,.05,.1,Wd,{rx:-.08,r:.012}),Pt(0,.016,.265,.044,.122,.2,Wd,{rx:-.12,r:.016}),Pt(0,.009,.366,.046,.126,.01,S,{rx:-.12,r:.003}),
    Pt(0,.05,.083,.04,.04,.02,S,{r:.005}),...X.map(s=>Pt(s*.0225,.02,.25,.002,.06,.12,Wd2,{rx:-.12})));
  return P}
GUNS.tommy={parts:tomParts(),grip:[0,-.035,.05],sup:[0,-.03,-.252],muzzle:[0,.06,-.515],mag:[0,-.052,-.078],eject:[.024,.075,-.04],piv:{aux:[0,-.052,-.078]},armL:[-.55,-.35,.75]};

// ---------- stats ----------
const GAR={PART:.7};
WPN.garand={slot:1,kind:'rifle',n:['M1 개런드','M1 Garand'],cost:4800,mag:8,res:80,dmg:62,rpm:330,semi:1,spread:[.003,.045,.12],rec:[.05,.014],kickX:[.7,1.4,.45],kb:4.6,stag:.45,hs:3.2,
  reload:2,draw:.85,speed:.93,snd:'garfire',model:'garand',hold:'rifle',shell:1,
  bd:['.30-06 반자동 · 한 발이 묵직하고 세게 밀어냄 · 8발 클립 — 다 쏘면 「팅」 하고 튀어나옴 · 남은 채로 재장전하면 클립을 뽑느라 느림','.30-06 semi-auto · a heavy round that shoves hard · 8-round clip — out with its ping when empty · a reload with rounds left pulls the clip first (slower)']};
WPN.tommy={slot:1,kind:'smg',n:['톰슨 M1928','Thompson M1928'],cost:3600,mag:50,res:200,dmg:30,rpm:720,spread:[.011,.034,.09],rec:[.011,.009],kickX:[.35,.62,.36],kb:2.8,stag:.26,hs:3,
  reload:3.4,draw:.7,speed:.95,snd:'tomfire',model:'tommy',hold:'rifle',shell:1,
  bd:['.45 기관단총 · 50발 드럼 · 분당 720발 · 기관단총 중 가장 세게 밀어냄','.45 SMG · 50-round drum · 720 rpm · shoves zombies harder than any other SMG']};
VM_POS.garand={p:[.15,-.168,-.42],r:[0,.075,.03]};
VM_POS.tommy={p:[.145,-.16,-.37],r:[0,.08,.035]};
// the buy menu (shop guns: bought with coins in the lobby, then in every match's buy menu)
for(const [id,k] of [['garand','rifle'],['tommy','smg']]){const c=BUY_MENU.find(q=>q.k===k);if(c&&!c.items.includes(id))c.items.push(id)}
Object.assign(SHOP_PRICE,{garand:5500,tommy:3800});
// the real guns' identity (design.js 4부): the Garand's op rod handle pulled on the right and let fly; the Thompson's knob on top (open bolt)
Object.assign(GUN_DESIGN,{garand:{mag:8,ch:0,act:'charge',x:.75,side:'r',d:.075,roll:.35,heavy:.55},tommy:{mag:50,ch:0,act:'charge',x:.6,side:'t',d:.06,roll:.2,ob:1}});
for(const id of ['garand','tommy']){WPN[id].fd=GUN_DESIGN[id];WPN[id].ch=GUN_DESIGN[id].ch}
// reloads: the Garand's clip is thumbed down into the top (the top-magazine reload, vmrel.js), the Thompson's drum slides out sideways
{const rk=rlKind;rlKind=function(W,G){if(W.model==='garand')return 'top';if(W.model==='tommy')return 'side';return rk(W,G)}}

// ---------- the Garand's clip ----------
// out with the last round: the ping, the clip spinning away up and to the right (a brass glint), the bolt left open
GAR.ping=function(a,part){const W=WPN.garand;if(!a||!a.alive)return;const mz=muzzleWorld(a),e=actorEye(a);aimDir(a.yaw,a.pitch,_dv);
  const x=a.isPlayer?e.x+_dv.x*.35+Math.cos(a.yaw)*.08:mz.x-_dv.x*.55,y=a.isPlayer?e.y-.05:mz.y+.03,z=a.isPlayer?e.z+_dv.z*.35-Math.sin(a.yaw)*.08:mz.z-_dv.z*.55;
  if(a.isPlayer)AU.play('garping',{vol:.75,delay:part?0:.02});else AU.at('garping',x,y,z,{vol:.8,range:36});
  if(!a.isPlayer||!part){const rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);FX.spawn({x,y,z,vx:rx*rr(1.2,2)+rr(-.3,.3),vy:rr(3,4.2),vz:rz*rr(1.2,2)+rr(-.3,.3),life:1.1,s0:.05,s1:.045,r:.75,g:.75,b:.72,f:10,grav:11,col:.3});
    for(let i=0;i<3;i++)FX.spark(x,y,z,rx*rr(.5,2),rr(1,3),rz*rr(.5,2),rr(.1,.25),[1,.9,.6])}
  if(a.isPlayer&&VM.cur&&VM.id==='garand')VM.garFly=G.t};
{const fg=fireGun;fireGun=function(a,W){const r=fg.apply(this,arguments);
  if(W&&W.model==='garand'&&!NET.ghost&&a.ammo&&a.ammo.garand&&a.ammo.garand.mag===0){GAR.ping(a,false);NET.on&&netFxPush(['gp',a.id])}return r}}
{const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='gp'){if(a&&!a.isPlayer&&G.actors.includes(a))GAR.ping(a,false);return}return nd(a,f)}}
// a reload with rounds left: the part-used clip comes out first (its rounds back to the spares), and it takes GAR.PART s longer
{const aw=actorWeapons;actorWeapons=function(a,dt){const k0=a.relKind,r=aw(a,dt);
  if(a.cur==='garand'&&a.team===TH&&a.relKind==='mag'&&k0!=='mag'&&a.reloadT>0){const am=a.ammo.garand;
    if(am&&am.mag>0){am.res+=am.mag;am.mag=0;a.relCh=false;a.reloadT+=GAR.PART;if(a.isPlayer)VM.reload(WPN.garand,a.reloadT,'mag',false);nyLater(.16,()=>{if(a.alive&&a.cur==='garand'&&a.relKind==='mag')GAR.ping(a,true)})}}
  return r}}
// first person: the op rod rides back with every shot and stays back on an empty clip; the clip itself is gone until a fresh one goes in,
// and on its last round it is seen springing up out of the receiver
VMX.garand=function(V,a,dt,o,m){const T=m.tags,am=a.ammo&&a.ammo.garand;if(!T||!am)return;const rel=a.reloadT>0&&a.relKind==='mag';
  if(T.chg){const e=G.t-(a.lastFire||-9);let k=0;if(e>=0&&e<.09)k=Math.sin(e/.09*Math.PI);if(am.mag===0&&!rel)k=1;T.chg.position.z+=k*.06}
  if(T.mag&&!rel){const f=G.t-(V.garFly||-9);if(am.mag===0&&f<.35){const u=f/.35;T.mag.visible=true;T.mag.position.y+=u*.16;T.mag.position.x+=u*.06;T.mag.rotation.z+=u*2.4}else T.mag.visible=am.mag>0}
  else if(T.mag)T.mag.visible=true};
// the Thompson: the knob on top runs back and forth with the bolt while it fires; the drum's face turns a little with every shot
VMX.tommy=function(V,a,dt,o,m){const T=m.tags,am=a.ammo&&a.ammo.tommy;if(!T||!am)return;
  if(T.chg){const e=G.t-(a.lastFire||-9);if(e>=0&&e<.083)T.chg.position.z+=Math.sin(e/.083*Math.PI)*.04}
  if(T.aux){const tg=(WPN.tommy.mag-am.mag)*.09;V.tomA=V.tomA==null?tg:V.tomA+(tg-V.tomA)*Math.min(1,dt*20);T.aux.rotation.x+=V.tomA}};

// ---------- the bots and 대인전 ----------
{const rl=AI.rollLd;AI.rollLd=function(){const L=rl.apply(this,arguments);const r=Math.random();if(r<.05)L[1]='garand';else if(r<.1)L[1]='tommy';return L}}

// ---------- sounds ----------
// the Garand: the .30-06's big crack and a long roll off the hills; its ping (a thin spring-steel clip: a bright ring with a fast-falling
// overtone and a click); the Thompson: the .45's deep, heavy chatter
Object.assign(GUNDEF,{
  garand:()=>({drive:2.25,crack:1.15,crackF:2200,body:[{f:rr(620,720),q:.75,l:.95,d:.13},{f:rr(1500,1750),q:.9,l:.8,d:.085},{f:rr(220,270),q:.8,l:.85,d:.2,n:'brown'}],
    punch:{f0:rr(92,104),f1:42,d:.2,l:1.3},mech:{t:.045,f:3000,l:.28},tail:{l:.45,tau:.42,d:1.5,f0:2600,f1:160},echo:echoes()}),
  tommy:()=>({drive:1.65,crack:.8,crackF:2400,body:[{f:rr(950,1100),q:.85,l:.85,d:.07},{f:rr(2100,2500),q:1,l:.65,d:.05},{f:rr(330,390),q:.9,l:.55,d:.1,n:'pink'}],
    punch:{f0:rr(120,132),f1:52,d:.11,l:.85},mech:{t:rr(.016,.02),f:rr(4200,4800),l:.25},tail:{l:.24,tau:.18,d:.8,f0:2800,f1:240},echo:echoes()})});
Object.assign(SFX,{
  garfire:{n:3,dur:1.8,ch:2,peak:.95,gain:.95,rev:.18,poly:4,pj:.02,fn:B=>gunshot(B,GUNDEF.garand())},
  tomfire:{n:4,dur:.9,ch:2,peak:.9,gain:.78,rev:.12,poly:10,pj:.03,fn:B=>gunshot(B,GUNDEF.tommy())},
  garping:{n:2,dur:1.3,ch:2,peak:.8,gain:.55,rev:.16,poly:2,fn:B=>{const out=B.g(.9);B.grain(0,6200,.8,.004,.7,out);const f=rr(2950,3150);
    B.ring(.002,f,[1,2.32,3.86,5.6],[.95,.45,.26,.15],[.55,.3,.16,.08],B.pan(.25,out));B.ring(.003,f*1.004,[1,2.31],[.7,.3],[.25,.1],B.pan(-.2,out));B.grain(.006,3400,2,.01,.35,out)}}});
SFX_ORDER.push('garfire','tomfire','garping');

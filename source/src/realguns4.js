'use strict';
// ============ v7.11: two more real guns for the shop — the Lewis Gun and the Mosin-Nagant M91/30 PU ============
// LEWIS GUN (MG): the .303 British light machine gun of the First World War. The fat cooling casing round the barrel, the 47-round pan
// on top that turns a step with every shot, the round clock-spring case under the body, the wooden butt and pistol grip, the bipod
// folded back under the casing. An open bolt: from empty its cocking handle on the right is pulled after the pan change. The casing
// keeps a long burst tight (W.recS: the spread a burst piles up grows at less than half the rate); it is lighter to carry than the
// belt-fed guns and its reload is quicker (the pan is lifted off the top, a fresh one laid on and pressed down).
// MOSIN-NAGANT M91/30 PU (sniper): the 7.62×54R bolt action with the PU scope on its side mount and the bolt handle bent down out of its
// way. A round goes on through the first zombie into the one behind (W.pen 2). The scope sits where a stripper clip would go, so the
// five rounds are thumbed in one at a time through the open action (the shell-by-shell reload: fire whenever you like — the bolt is
// run home first, MSN.CLOSE s); the stiff bolt is worked after every shot with its two-stage clack. The scope shows the PU's three posts.
// Models: boxes on the weapon atlas, our own drawings of the real guns' shapes (blued steel, a black-painted casing, walnut, and the
// Mosin's orange-red shellacked birch).

// ---------- atlas: the Lewis casing's worn black paint, the Mosin's shellacked birch ----------
const RG4_MATS=['lewCase','msWood'];
for(const m of RG4_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintRg4Atlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the casing: a flat black enamel over steel, rubbed through to grey-brown here and there, faint lengthwise streaks, a few chips
  patch('lewCase',(xx,y,X,Y)=>{const t=hash2(X,Y,7502)*.55+nz(X,Y,7501,40)*.45;let c=t>.62?'#2a2c2e':t<.38?'#1d1e20':'#242628';if(Math.sin(xx*.35+nz(X,Y,7503,30)*2)>.94)c='#303336';
    if(hash2(X,Y,7505)<.005)c='#4c4a46';return c},246);
  // birch under an orange-red shellac: warm amber with long darker streaks of grain, the lacquer pooled darker in places
  patch('msWood',(xx,y,X,Y)=>{const g=Math.sin(y*.21+nz(X,Y,7511,26)*9)*.5+.5,p=nz(X,Y,7512,34);let c=mix('#4a1e0c','#7e3c18',g*.7+p*.3);
    if(Math.sin(y*.9+nz(X,Y,7513,12)*4)>.96)c=dk(c,.35);if(p<.3)c=dk(c,.2);if(p>.72)c=lt(c,.08);if(hash2(X,Y,7514)<.02)c=dk(c,.25);return c},247);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintRg4Atlas()}}

// ---------- helpers ----------
const RG4X=[1,-1];
// a round bar from point p to point q (any direction), w thick
function rg4Seg(p,q,w,m,o){const dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L=Math.hypot(dx,dy,dz)||1e-4;
  return Pt((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,w,w,L,m,Object.assign({rx:Math.atan2(-dy/L,dz/L),ry:Math.asin(clamp(dx/L,-1,1)),r:w*.45},o||{}))}

// ---------- the Lewis Gun ----------
// PAN the pan's centre (gun frame), STEP how far it turns a round, RECS what the casing leaves of the spread a burst piles up
const LEW={PAN:[0,.118,-.09],STEP:TAU/25,RECS:.45};
// the body in blued steel: the receiver and its cover, the feed arm and the magazine post under the pan, the rear sight's leaf, the clock-
// spring case underneath, the cocking handle on the right (tag chg: it runs with the bolt); the casing in black paint with its rings,
// the bipod's clamp, the taper, the mouth and the muzzle deep inside it, the front sight; the bipod folded back underneath; the
// wooden pistol grip and butt, the steel butt plate; the pan (tag mag) with its sixteen ribs, the centre cap and its latch
function lewParts(){const P=[],X=RG4X,S='gunmetal',C='lewCase',Wd='wood';
  // ---- the body ----
  P.push(Pt(0,.055,-.05,.052,.07,.3,S,{r:.012}),Pt(0,.0915,-.075,.044,.007,.21,S,{r:.003}),Pt(.011,.0975,-.11,.008,.004,.1,'steel',{ry:.32,r:.001}),
    Pt(0,.1,-.09,.024,.012,.024,'steel',{cyl:'y',r:.004}),...X.map(s=>Pt(s*.0262,.055,-.06,.0015,.05,.2,'gunmetal')),Pt(0,.05,.115,.044,.05,.03,S,{r:.008}));
  // the rear sight: its base, the leaf standing up with its aperture, the slide on the leaf
  P.push(Pt(0,.096,.062,.026,.012,.05,S,{r:.003}),Pt(0,.122,.072,.014,.042,.004,S,{r:.001}),Pt(0,.137,.0742,.0045,.0045,.0012,'muzzle'),Pt(0,.118,.072,.02,.008,.008,'steel',{r:.002}));
  // the trigger guard, the trigger, the raked wooden pistol grip and its steel cap
  P.push(Pt(0,.0,.028,.012,.006,.07,S,{r:.002}),Pt(0,.01,-.006,.012,.026,.006,S,{r:.002}),Pt(0,.004,.022,.004,.022,.005,'steel',{rx:.18}),
    Pt(0,-.034,.066,.034,.1,.05,Wd,{rx:.34,r:.014}),Pt(0,.014,.06,.04,.02,.05,S,{r:.006}),Pt(0,-.083,.083,.03,.008,.042,S,{rx:.34,r:.004}));
  // the clock-spring case under the body, its cap and screw slot
  P.push(Pt(-.004,.0,-.06,.034,.07,.07,S,{cyl:'x',r:.004}),Pt(-.0225,.0,-.06,.004,.026,.026,'steel',{cyl:'x',r:.002}),Pt(-.0244,.0,-.06,.0015,.014,.003,'muzzle'));
  // the cocking handle in its slot along the right side (and the ejection port in front of it)
  P.push(Pt(.0265,.034,-.07,.002,.008,.13,'muzzle'),Pt(.0265,.066,-.02,.002,.018,.05,'muzzle'));
  P.push(...TAG('chg',[Pt(.031,.034,-.012,.01,.01,.014,'steel',{r:.002}),Pt(.041,.034,-.012,.012,.018,.018,'steel',{cyl:'x',r:.004})]));
  // ---- the cooling casing ----
  P.push(Pt(0,.052,-.515,.1,.1,.63,C,{cyl:'z',r:.004}),Pt(0,.052,-.205,.106,.106,.022,S,{cyl:'z',r:.004}),Pt(0,.052,-.4,.104,.104,.01,S,{cyl:'z',r:.003}),
    Pt(0,.052,-.765,.108,.108,.03,S,{cyl:'z',r:.004}),Pt(0,.054,-.844,.084,.084,.03,C,{cyl:'z',r:.004}),Pt(0,.056,-.866,.066,.066,.018,C,{cyl:'z',r:.004}),
    Pt(0,.058,-.9,.052,.052,.05,C,{cyl:'z',r:.004}),Pt(0,.058,-.922,.056,.056,.008,S,{cyl:'z',r:.003}),Pt(0,.058,-.9265,.04,.04,.002,'muzzle',{cyl:'z'}),
    Pt(0,.024,-.874,.022,.02,.03,S,{r:.004}));
  // the front sight on the casing's top, its two guards
  P.push(Pt(0,.107,-.792,.016,.012,.028,S,{r:.003}),Pt(0,.12,-.794,.003,.016,.008,S),...X.map(s=>Pt(s*.0085,.116,-.794,.003,.014,.012,S)));
  // the bipod folded back under the casing: the hinge under the clamp, the two legs splayed a little, their feet
  P.push(Pt(0,-.004,-.765,.034,.016,.03,S,{r:.004}),...X.map(s=>rg4Seg([s*.012,-.006,-.76],[s*.026,-.008,-.5],.009,'steel')),...X.map(s=>Pt(s*.027,-.008,-.494,.016,.008,.022,S,{r:.003})));
  // ---- the butt: the wrist, the butt, its comb, the steel butt plate and its tang, a sling swivel ----
  P.push(Pt(0,.0075,.26,.042,.125,.28,Wd,{kz:[.92,1,.42,1],ay:1,r:.014}),Pt(0,.008,.403,.046,.128,.008,S,{r:.003}),Pt(0,.071,.39,.02,.004,.03,S),Pt(0,-.05,.34,.006,.02,.02,'steel',{r:.003}));
  // ---- the pan (tag mag) ----
  const [px,py,pz]=LEW.PAN,pan=[Pt(px,py,pz,.19,.042,.19,'blk2',{cyl:'y',r:.006}),Pt(px,py+.019,pz,.196,.005,.196,S,{cyl:'y',r:.002})];
  for(let i=0;i<16;i++){const a=i/16*TAU;pan.push(Pt(px+Math.sin(a)*.06,py+.0225,pz+Math.cos(a)*.06,.006,.004,.055,S,{ry:a,r:.001}))}
  pan.push(Pt(px,py+.024,pz,.052,.008,.052,'steel',{cyl:'y',r:.003}),Pt(px,py+.03,pz,.012,.006,.032,'steel',{r:.002}),Pt(px,py-.021,pz,.04,.004,.04,'steel',{cyl:'y'}));
  P.push(...TAG('mag',pan));
  return P}
GUNS.lewis={parts:lewParts(),grip:[0,-.03,.065],sup:[0,.004,-.36],muzzle:[0,.058,-.928],mag:LEW.PAN.slice(),eject:[.03,.066,-.02],piv:{mag:LEW.PAN.slice()}};

// ---------- the Mosin-Nagant ----------
// Y the bore's height, CLOSE how long the bolt takes to go home after the last round (or a reload cut short), LAST the last round's clip
const MSN={Y:.045,CLOSE:.32,LAST:.62};
// the round receiver and its ring, the tang, the open top over the bolt; the magazine box and its floor plate; the bolt (tag bolt): its
// body, the cocking piece's big knob, the handle bent down past the stock and its ball; the trigger guard and the long trigger; the
// barrel with the chamber's step, the leaf sight, the hooded front post, the cleaning rod under it; the birch stock round the receiver,
// the fore-end, the upper handguard, two bands, the sling slots, the straight wrist, the butt and the steel butt plate; the PU scope on
// its side mount: the base on the receiver's left, the arm over to the two rings, the tube with its turrets, both bells and lenses
function msnParts(){const P=[],X=RG4X,S='bluesteel',Wd='msWood',Y=MSN.Y,SY=.1;
  // ---- the receiver ----
  P.push(Pt(0,Y,-.07,.031,.031,.16,S,{cyl:'z',r:.004}),Pt(0,Y,-.137,.035,.035,.028,S,{cyl:'z',r:.004}),Pt(0,Y-.004,.03,.022,.016,.05,S,{r:.004}),
    Pt(0,Y+.0152,-.05,.012,.0012,.09,'muzzle'),Pt(0,.012,-.075,.027,.042,.075,S,{r:.004}),Pt(0,-.0095,-.075,.029,.004,.082,S,{r:.002}));
  // ---- the bolt ----
  P.push(...TAG('bolt',[Pt(0,Y,-.035,.02,.02,.13,'steel',{cyl:'z',r:.003}),Pt(0,Y,.05,.026,.026,.024,S,{cyl:'z',r:.005}),Pt(0,Y,.064,.012,.012,.008,S,{cyl:'z'}),
    Pt(.014,Y,.02,.014,.012,.014,'steel',{r:.003}),rg4Seg([.018,Y-.002,.022],[.044,Y-.034,.03],.0085,'steel'),Pt(.047,Y-.04,.031,.018,.018,.018,'steel',{r:.0085})]));
  // ---- the trigger guard and its floor-plate catch, the trigger ----
  P.push(Pt(0,-.014,-.004,.012,.006,.07,S,{r:.002}),Pt(0,-.004,-.038,.012,.02,.006,S,{r:.002}),Pt(0,.0,.002,.004,.024,.005,'steel',{rx:.28}),Pt(0,-.011,-.03,.008,.004,.012,'steel'));
  // ---- the barrel and its sights, the cleaning rod ----
  P.push(Pt(0,Y,-.185,.028,.028,.07,S,{cyl:'z',r:.004}),Pt(0,Y,-.53,.021,.021,.66,S,{cyl:'z',r:.004}),Pt(0,Y,-.861,.017,.017,.003,'muzzle',{cyl:'z'}),
    Pt(0,Y+.014,-.25,.024,.01,.06,S,{r:.003}),Pt(0,Y+.021,-.245,.016,.004,.055,S,{r:.001}),
    Pt(0,Y+.013,-.845,.02,.008,.022,S,{r:.002}),Pt(0,Y+.02,-.846,.003,.014,.005,S),...X.map(s=>Pt(s*.0105,Y+.022,-.846,.003,.024,.016,S)),Pt(0,Y+.0335,-.846,.024,.003,.016,S),
    Pt(0,Y-.02,-.79,.0065,.0065,.13,'steel',{cyl:'z'}),Pt(0,Y-.02,-.857,.0095,.0095,.01,'steel',{cyl:'z',r:.002}));
  // ---- the stock ----
  P.push(Pt(0,.022,-.08,.044,.044,.24,Wd,{r:.011}),Pt(0,.024,-.43,.042,.04,.46,Wd,{r:.011}),Pt(0,.027,-.7,.036,.034,.08,Wd,{r:.009}),
    Pt(0,Y+.016,-.44,.03,.016,.32,Wd,{r:.007}),Pt(0,.036,-.6,.046,.058,.016,S,{r:.007}),Pt(0,.038,-.735,.04,.05,.014,S,{r:.007}),
    ...X.map(s=>Pt(s*.0215,.012,-.56,.002,.012,.03,'muzzle')),...X.map(s=>Pt(s*.0235,-.03,.245,.002,.012,.03,'muzzle')),
    Pt(0,-.0225,.2075,.044,.125,.355,Wd,{kz:[.85,1,.36,1],ay:1,sy:[.0085,0],r:.012}),Pt(0,-.0225,.389,.046,.127,.01,S,{r:.003}));
  // ---- the PU scope ----
  P.push(Pt(-.0195,Y+.004,-.075,.006,.026,.1,S,{r:.002}),Pt(-.013,SY-.02,-.075,.016,.012,.085,S,{r:.003}),
    ...[-.125,-.035].map(z=>Pt(0,SY,z,.034,.034,.012,S,{cyl:'z',r:.003})),...[-.125,-.035].map(z=>Pt(-.012,SY-.013,z,.012,.016,.012,S)),
    Pt(0,SY,-.09,.026,.026,.17,'blk',{cyl:'z',r:.004}),Pt(0,SY,-.18,.033,.033,.022,'blk',{cyl:'z',r:.004}),Pt(0,SY,.004,.035,.035,.028,'blk',{cyl:'z',r:.005}),
    Pt(0,SY,.024,.032,.032,.012,'rub',{cyl:'z',r:.004}),Pt(0,SY,-.1915,.026,.026,.002,'lens',{cyl:'z'}),Pt(0,SY,.0305,.024,.024,.002,'lens',{cyl:'z'}),
    Pt(0,SY+.018,-.085,.016,.012,.016,'blk',{cyl:'y',r:.003}),Pt(-.019,SY,-.085,.012,.016,.016,'blk',{cyl:'x',r:.003}));
  return P}
GUNS.mosin={parts:msnParts(),grip:[0,-.002,.085],sup:[0,.004,-.36],muzzle:[0,MSN.Y,-.862],mag:[0,.012,-.075],eject:[.02,.062,-.05],scope:[0,.1,-.09],piv:{bolt:[0,MSN.Y,0]}};
// a 7.62×54R round in the hand while the rifle is loaded (brass case with its rim, the copper-jacketed point)
FD_PROPS.msround=()=>[Pt(0,0,.004,.012,.012,.052,'brass',{cyl:'z',r:.004}),Pt(0,0,.031,.014,.014,.003,'brass',{cyl:'z'}),Pt(0,0,-.03,.009,.009,.018,'orange',{cyl:'z',r:.004})];

// ---------- stats ----------
WPN.lewis={slot:1,kind:'mg',n:['루이스 기관총','Lewis Gun'],cost:5200,mag:47,res:188,dmg:41,rpm:550,spread:[.011,.05,.14],rec:[.012,.011],kickX:[.45,.8,.42],kb:3.6,stag:.34,hs:3,
  reload:3.8,draw:1,speed:.86,snd:'lewfire',model:'lewis',hold:'rifle',shell:1,recS:LEW.RECS,
  bd:['.303 기관총 · 47발 팬 탄창(위에 얹혀 쏠 때마다 돔) · 냉각통 덕에 길게 쏴도 덜 퍼짐 · 기관총 중 가볍고 장전이 빠름','.303 MG · 47-round pan on top (it turns with every shot) · the cooling casing keeps long bursts tight · light and quick to reload for an MG']};
WPN.mosin={slot:1,kind:'sniper',n:['모신나강','Mosin-Nagant'],cost:4300,mag:5,res:40,dmg:108,rpm:46,semi:1,bolt:1,pen:2,penK:.7,spread:[.04,.085,.19],spreadZ:.0011,zoom:[26],
  rec:[.075,.012],kickX:[1,2,.5],kb:17,stag:.55,hs:3.2,shellRel:.52,relStart:.48,draw:.9,speed:.9,snd:'mosfire',model:'mosin',hold:'rifle',
  bd:['7.62×54R 볼트액션 · 좀비 2마리 관통 · PU 조준경 · 5발 — 조준경이 클립 자리를 막아 한 발씩 장전 (중간에 쏠 수 있음)','7.62×54R bolt action · goes through 2 zombies · PU scope · 5 rounds — the scope blocks the clip, so they go in one by one (fire any time)']};
VM_POS.lewis={p:[.19,-.232,-.44],r:[0,.08,.035]};
VM_POS.mosin={p:[.145,-.165,-.39],r:[0,.075,.03]};
// the buy menu (shop guns: bought with coins in the lobby, then in every match's buy menu)
for(const [id,k] of [['lewis','mg'],['mosin','sniper']]){const c=BUY_MENU.find(q=>q.k===k);if(c&&!c.items.includes(id))c.items.push(id)}
Object.assign(SHOP_PRICE,{lewis:6000,mosin:5000});
// the guns' identity (design.js 4부): the Lewis's handle on the right pulled back to cock the open bolt; the Mosin's stiff bolt
Object.assign(GUN_DESIGN,{lewis:{mag:47,ch:0,act:'charge',x:.75,side:'r',d:.07,roll:.3,heavy:.5,ob:1},mosin:{mag:5,ch:0,act:'bolt',x:.85,heavy:.6}});
for(const id of ['lewis','mosin']){WPN[id].fd=GUN_DESIGN[id];WPN[id].ch=GUN_DESIGN[id].ch}
// reloads: the Lewis's pan comes off the top (the top-magazine reload, vmrel.js); the Mosin's own clips below
{const rk=rlKind;rlKind=function(W,G){if(W.model==='lewis')return 'top';return rk(W,G)}}

// ---------- the Lewis: the casing keeps a burst tight ----------
{const fg=fireGun;fireGun=function(a,W){const rs=a.recoilSpread,r=fg.apply(this,arguments);if(W&&W.recS&&a.recoilSpread>rs)a.recoilSpread=rs+(a.recoilSpread-rs)*W.recS;return r}}
// first person: the pan turns a step with every round (smoothly, as the feed arm drags it round); the cocking handle runs forward and back
// with the bolt while it fires
VMX.lewis=function(V,a,dt,o,m){const T=m.tags,am=a.ammo&&a.ammo.lewis;if(!T||!am)return;
  if(T.chg){const e=G.t-(a.lastFire||-9);if(e>=0&&e<.105)T.chg.position.z-=Math.sin(e/.105*Math.PI)*.055}
  if(T.mag){const tg=(WPN.lewis.mag-am.mag)*LEW.STEP;if(V.lewA==null||Math.abs(tg-V.lewA)>LEW.STEP*6)V.lewA=tg;else V.lewA+=(tg-V.lewA)*Math.min(1,dt*24);T.mag.rotation.y+=V.lewA}};

// ---------- the Mosin: the bolt after every shot, the rounds one at a time ----------
// the bolt's clack a beat after the shot (up, back, forward, down)
{const fg=fireGun;fireGun=function(a,W){const r=fg.apply(this,arguments);
  if(W&&W.model==='mosin'&&a.alive){if(a.isPlayer)AU.play('msbolt',{vol:.7,delay:.3});else{const e=actorEye(a);AU.at('msbolt',e.x,e.y,e.z,{vol:.6,range:24,delay:.32})}}return r}}
// the clips (the right hand works the bolt and feeds the rounds; the left stays under the fore-end):
//   start  the hand off the grip to the bolt's ball: up, back (the action open), down to the pouch for the first round
//   shell  the round pressed down into the open action (a click), down to the pouch, back with the next
//   last   the last round in, the hand to the ball: forward, down (locked), back to the grip
//   close  (the reload cut short to fire) forward and down at once
function msnClip(ph,W,G,m){const Y=MSN.Y,kn=[.047,Y-.04,.031],port=[0,Y+.034,-.05],pouch=[.13,-.34,.1],bk=[.4,1,0],on=[.008,.014,.006],
  pr=[-.045,.012,-.05,.06,.12,.32],pp=u=>K6(u,...pr),bump=(u,k)=>K6(u,pr[0],pr[1]-.006*k,pr[2],pr[3]-.03*k,pr[4],pr[5]),
  A=[{grip:1},{tag:'bolt',at:kn},{p:port},{p:[port[0]+pouch[0],port[1]+pouch[1],port[2]+pouch[2]]}],
  above=[0,.026,.012],into=[0,.004,.004],rbk=[.2,-1,.3],prop={arm:'R',kind:'msround',pos:[0,-.03,-.07],rot:[0,0,0]},
  open=[{tag:'bolt',ch:'rz',k:[[0,1.1],[1,1.1]]},{tag:'bolt',ch:'pz',k:[[0,.07],[1,.07]]}];
  if(ph==='start'){const lu0=.2,lu1=.36,pb0=.38,pb1=.56;
    return {G:[K6(0),K6(.08,.004,-.006,0,-.03,-.03,-.04),pp(.22),pp(pb1),bump(pb1+.04,.6),pp(1)],
      R:{elb:[.46,-.24,-.04],A,k:[HK(0,0),HK(.06,0),HK(.15,1,[.035,.035,.04],.6,[.3,1,0],.3),HK(lu0-.02,1,[.014,.02,.01],1,bk,.35),HK(lu0,1,on,1,bk,.75),HK(pb1,1,on,1,bk,.75),
        HK(pb1+.05,1,[.024,.03,.02],1,bk,.15),HK(.82,3,[0,0,0],.9,[.4,-1,0],.6),HK(.9,3,[0,0,0],.9,rbk,.7),HK(1,2,above,1,rbk,.75)]},
      parts:[{tag:'bolt',ch:'rz',k:[[0,0],[lu0,0],[lu1,1.1,1],[1,1.1]]},{tag:'bolt',ch:'pz',k:[[0,0],[pb0,0],[pb1,.07,1],[1,.07]]}],
      props:[{...prop,on:[[.86,1]]}],E:[[lu1-.04,'msbup',.7,1]],C:[[0,0,0,0],[.22,.006,.004,.012],[1,.006,.004,.012]],hold:.3}}
  const push=[HK(0,2,above,1,rbk,.75),HK(.14,2,into,1,rbk,.6),HK(.2,2,[0,.012,.008],1,rbk,.4)];
  if(ph==='shell')return {G:[pp(0),bump(.13,1),pp(.28),pp(1)],R:{elb:[.46,-.24,-.04],A,k:push.concat([HK(.48,3,[0,0,0],.9,[.4,-1,0],.6),HK(.62,3,[0,0,0],.9,rbk,.7),HK(1,2,above,1,rbk,.75)])},
    parts:open,props:[{...prop,on:[[0,.15],[.6,1]]}],E:[[.13,'msround',.6,.95+Math.random()*.1,[.04,-.1,0]]],C:[[0,.006,.004,.012],[1,.006,.004,.012]],hold:.3};
  if(ph==='last'){const fw0=.36,fw1=.5,dn0=.52,dn1=.64;
    return {G:[pp(0),bump(.12,1),pp(.3),pp(dn1),bump(dn1+.03,.8),K6(.86,.004,-.004,.002,-.01,-.02,-.02),K6(1)],
      R:{elb:[.46,-.24,-.04],A,k:push.concat([HK(.3,1,[.024,.03,.02],1,bk,.3),HK(fw0,1,on,1,bk,.75),HK(dn1,1,on,1,bk,.75),HK(dn1+.04,1,[.024,.03,.02],1,bk,.15),HK(.84,0),HK(1,0)])},
      parts:[{tag:'bolt',ch:'pz',k:[[0,.07],[fw0,.07],[fw1,0,1],[1,0]]},{tag:'bolt',ch:'rz',k:[[0,1.1],[dn0,1.1],[dn1,0,1],[1,0]]}],
      props:[{...prop,on:[[0,.15]]}],E:[[.12,'msround',.6,1],[dn1-.04,'msbdn',.75,1,[.1,-.3,.05],[.006,0,.004]]],C:[[0,.006,.004,.012],[.3,.006,.004,.012],[.86,0,0,0],[1,0,0,0]]}}
  // close: forward and down at once, back to the grip
  return {G:[pp(0),pp(.4),bump(.48,.8),K6(.8,.004,-.004,.002,-.01,-.02,-.02),K6(1)],
    R:{elb:[.46,-.24,-.04],A,k:[HK(0,1,[.024,.03,.02],1,bk,.3),HK(.12,1,on,1,bk,.75),HK(.46,1,on,1,bk,.75),HK(.52,1,[.024,.03,.02],1,bk,.15),HK(.8,0),HK(1,0)]},
    parts:[{tag:'bolt',ch:'pz',k:[[0,.07],[.14,.07],[.3,0,1],[1,0]]},{tag:'bolt',ch:'rz',k:[[0,1.1],[.32,1.1],[.46,0,1],[1,0]]}],
    E:[[.42,'msbdn',.75,1.05,[.1,-.3,.05],[.006,0,.004]]],C:[[0,.006,.004,.012],[.8,0,0,0],[1,0,0,0]]}}
{const vr=VM.reload;VM.reload=function(W,dur,kind,empty){if(!(W&&W.model==='mosin'&&kind==='start'))return vr.apply(this,arguments);
  this.rel={t:0,d:dur,kind:'start'};this.slapped=false;this.act=null;this.rlEmpty=!!empty;const m=this.cur,G=GUNS.mosin;if(!m||!G||this.id!=='mosin')return;
  try{const A=this.playClip(msnClip('start',W,G,m),0,dur,'shell');if(A)A.rl=1}catch(e){console.error(e);this.act=null}}}
{const si=VM.shellIn;VM.shellIn=function(last,next){if(this.id!=='mosin')return si.apply(this,arguments);const W=WPN.mosin,m=this.cur,G=GUNS.mosin;this.rel={t:0,d:.4,kind:'shell'};
  if(!m){this.sp.py.v+=.12;return}const L=last?MSN.LAST:Math.max(.2,next||W.shellRel);
  try{const A=this.playClip(msnClip(last?'last':'shell',W,G,m),0,L,'shell');if(A){A.rl=1;A.msnLast=!!last}}catch(e){console.error(e);this.act=null}}}
VM.msnClose=function(){const m=this.cur;if(!m||this.id!=='mosin')return;try{const A=this.playClip(msnClip('close',WPN.mosin,GUNS.mosin,m),0,MSN.CLOSE,'shell');if(A)A.rl=1}catch(e){console.error(e);this.act=null}};
// the reload over (the last round in, or cut short to fire): the bolt goes home before the next shot
{const aw=actorWeapons;actorWeapons=function(a,dt){const k0=a.relKind,c0=a.cur,r=aw.apply(this,arguments);
  if(c0==='mosin'&&a.cur==='mosin'&&k0==='shell'&&a.relKind!=='shell'&&a.team===TH&&a.alive){a.nextFire=Math.max(a.nextFire,G.t+MSN.CLOSE);
    if(a.isPlayer&&VM.id==='mosin'&&!(VM.act&&VM.act.msnLast))VM.msnClose();else if(!a.isPlayer){const e=actorEye(a);AU.at('msbdn',e.x,e.y,e.z,{vol:.5,range:18,delay:.2})}}
  return r}}
// the PU scope: its three posts (style.css #scope.pu)
{const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);const P=G.player,sc=$('scope');if(sc&&P&&P.alive&&P.cur==='mosin'&&P.zoom>0&&!G.spec)sc.className='pu'}}

// ---------- the bots ----------
{const rl=AI.rollLd;AI.rollLd=function(){const L=rl.apply(this,arguments);const r=Math.random();if(r<.045)L[1]='lewis';else if(r<.085)L[1]='mosin';return L}}

// ---------- sounds ----------
// the Lewis: the .303's crack over the heavy, slower chug of the gas piston and the clock spring; the Mosin: the 7.62×54R's big flat bang
// and long roll; its bolt: two stiff clacks up and back, two forward and down (msbup / msbdn are the halves), a round pressed in
Object.assign(GUNDEF,{
  lewis:()=>({drive:2.1,crack:.95,crackF:2100,body:[{f:rr(560,650),q:.8,l:.95,d:.13},{f:rr(1350,1600),q:1,l:.7,d:.08},{f:rr(210,250),q:.85,l:.8,d:.18,n:'brown'}],
    punch:{f0:rr(96,108),f1:44,d:.18,l:1.25},mech:{t:rr(.028,.034),f:rr(2400,2800),l:.38},tail:{l:.34,tau:.3,d:1.15,f0:2400,f1:170},echo:echoes()}),
  mosin:()=>({drive:2.35,crack:1.2,crackF:2300,body:[{f:rr(640,740),q:.75,l:1,d:.14},{f:rr(1700,1950),q:.9,l:.85,d:.09},{f:rr(230,280),q:.8,l:.9,d:.22,n:'brown'}],
    punch:{f0:rr(92,104),f1:40,d:.22,l:1.35},mech:null,tail:{l:.5,tau:.5,d:1.8,f0:2400,f1:140},echo:[{t:rr(.26,.34),l:.13,f:850,pan:rr(-.8,.8)},{t:rr(.6,.75),l:.08,f:560,pan:rr(-.8,.8)},{t:rr(1,1.2),l:.045,f:420,pan:rr(-.8,.8)}]})});
// one clack of the bolt: a hard steel knock, a scrape of the lugs, a low body thunk
const msnClack=(B,t,f,l,o)=>{B.grain(t,f,2.5,.01,.75*l,o);B.grain(t+.004,f*1.6,3,.006,.4*l,o);const e=B.env(t,.004,.3*l,.06,o);B.nz('white',t,.08,B.f('bandpass',f*.55,2,e));
  const k=B.env(t,.001,.28*l,.05,o);B.osc('sine',rr(220,260),150,t,.06,k)};
Object.assign(SFX,{
  lewfire:{n:4,dur:1.2,ch:2,peak:.93,gain:.84,rev:.12,poly:8,pj:.025,fn:B=>gunshot(B,GUNDEF.lewis())},
  mosfire:{n:3,dur:2.1,ch:2,peak:.95,gain:1,rev:.2,poly:3,pj:.02,fn:B=>gunshot(B,GUNDEF.mosin())},
  msbolt:{n:2,dur:.75,peak:.82,gain:.6,rev:.06,poly:2,fn:B=>{const o=B.g(.95);msnClack(B,0,2900,1,o);
    {const se=B.env(.05,.04,.32,.1,o);B.nz('white',.05,.18,B.sweep(B.f('bandpass',1800,1.8,se),1800,3200,.05,.2))}msnClack(B,.2,2300,.9,o);
    {const se=B.env(.3,.03,.3,.08,o);B.nz('white',.3,.14,B.sweep(B.f('bandpass',3000,1.8,se),3000,1600,.3,.14))}msnClack(B,.42,2600,1,o);msnClack(B,.52,3400,.95,o)}},
  msbup:{n:2,dur:.45,peak:.8,gain:.55,rev:.06,poly:2,fn:B=>{const o=B.g(.95);msnClack(B,0,2900,1,o);const se=B.env(.05,.04,.32,.1,o);B.nz('white',.05,.18,B.sweep(B.f('bandpass',1800,1.8,se),1800,3200,.05,.2));msnClack(B,.2,2300,.9,o)}},
  msbdn:{n:2,dur:.4,peak:.8,gain:.55,rev:.06,poly:2,fn:B=>{const o=B.g(.95);const se=B.env(0,.03,.3,.08,o);B.nz('white',0,.14,B.sweep(B.f('bandpass',3000,1.8,se),3000,1600,0,.14));msnClack(B,.11,2600,1,o);msnClack(B,.21,3400,.95,o)}},
  msround:{n:3,dur:.3,peak:.8,gain:.5,poly:3,fn:B=>{B.grain(0,3600,2,.006,.6);const se=B.env(0,.008,.25,.05);B.nz('white',0,.07,B.sweep(B.f('bandpass',2400,2,se),2400,1200,0,.06));
    B.ring(.03,rr(2800,3200),[1,1.5,2.2],[.03,.02,.015],[.25,.12,.06]);B.grain(.045,2200,3,.008,.45);const k=B.env(.045,.001,.3,.04);B.osc('sine',380,220,.045,.05,k)}}});
SFX_ORDER.push('lewfire','mosfire','msbolt','msbup','msbdn','msround');

'use strict';
// ============ v6.59: the Glock and the Double Glock ============
// GLOCK (글록): a plain 9 mm service pistol, sold in the shop — 17 rounds, semi-auto, a little weaker a shot than the USP but quicker
// and with more rounds; right click switches it to 3-round bursts and back (the mode stays with the gun: game.js gBurst / gbOn).
// Numbers: the Glock 27 a round, 450 rpm (about the USP's 230 a second, more rounds, a quicker reload); the pair 30 a round at 1,250 rpm —
// 20 rounds a second at 60 fps, about 600 a second on the body, as the crate primaries (Dual MP7A1 480 / 640 sprayed, AK-47 Drum 580).
// DOUBLE GLOCK (더블 글록): a pair of full-auto machine pistols (Glock 18C pattern: compensator cuts over a gold barrel, the selector on
// the slide, 33-round magazines standing out under the grips) — out of supply crates only, crate-gun numbers in the sidearm slot. Right
// click: 6-round bursts, the two guns in turn, tighter and 10 % harder (for range); again: full auto.
// Models are boxes on the weapon atlas (no new materials: the atlas is full) — our own drawings of the real guns' shapes.

// ---------- the model ----------
// gun frame as the other pistols: origin at the top of the grip, the barrel along -Z. S = one gun's scheme: s slide, f frame, b barrel,
// t trigger, mp magazine floor plate, dot sight dots; comp: compensator cuts on the slide, sel: the selector, ext: the 33-round magazine
const GLK_RK=.3;// the grip's rake (the Glock's steep angle): its bottom further back than its top
const glkAt=(ly,lz)=>{const c=Math.cos(GLK_RK),s=Math.sin(GLK_RK);return [-.04+ly*c+lz*s,.013-ly*s+lz*c]};// a point on the grip (from its centre, along it)
function glkParts(S){const P=[],X=[1,-1],R={rx:-GLK_RK};// (a negative rx tips a part's bottom back: glkAt runs the same way)
  const G=(ly,lz,w,h,d,m,o)=>{const [y,z]=glkAt(ly,lz);return Pt(0,y,z,w,h,d,m,Object.assign({},R,o||{}))};
  // the slide (it runs back on every shot): the squared block, cocking serrations at the rear, the ejection port with the barrel hood
  // in it, the extractor, the front sight and the U-notch rear sight with white dots; the compensator cuts and the selector on the 18C
  const SL=[Pt(0,.046,-.057,.026,.031,.186,S.s,{r:.0035}),Pt(0,.0612,-.057,.019,.0016,.18,S.s,{r:.0008}),
    Pt(.0129,.0563,-.026,.0016,.0095,.046,'muzzle'),Pt(.0055,.0619,-.026,.0115,.0012,.044,S.b),Pt(.0131,.0505,.0,.0012,.004,.02,'steel'),
    Pt(0,.0652,-.141,.0045,.0075,.006,S.s),Pt(0,.0672,-.1442,.0024,.0024,.0008,S.dot),
    Pt(0,.0636,.029,.02,.005,.009,S.s),...X.map(s=>Pt(s*.0062,.0676,.029,.0072,.0042,.009,S.s)),...X.map(s=>Pt(s*.0062,.0676,.0244,.0018,.0018,.0008,S.dot))];
  for(let k=0;k<6;k++)for(const s of X)SL.push(Pt(s*.0131,.0465,.0075+k*.0052,.0012,.022,.0022,'muzzle'));
  if(S.comp)for(const z of [-.131,-.116,-.101])SL.push(Pt(0,.0617,z,.0105,.0016,.0085,'muzzle'),Pt(0,.0622,z,.0052,.0012,.0042,S.b));
  if(S.sel)SL.push(Pt(-.0136,.0515,.023,.0016,.0085,.011,'mtB'),Pt(-.0148,.0548,.023,.0022,.0034,.013,S.t));
  P.push(...TAG('slide',SL));
  // the barrel: its crown in the slide's front face (it stays as the slide runs back)
  P.push(Pt(0,.0505,-.122,.0112,.0112,.06,S.b,{r:.004}),Pt(0,.0505,-.1512,.0118,.0118,.0026,S.b,{r:.005}),Pt(0,.0505,-.1526,.0066,.0066,.0008,'muzzle',{r:.003}));
  // the frame (polymer): the dust cover with its one-slot rail, the part over the trigger, the slide lock tabs, the slide stop (left)
  P.push(Pt(0,.0225,-.092,.024,.017,.116,S.f,{r:.003}),Pt(0,.0122,-.112,.019,.0045,.05,S.f,{r:.001}),...X.map(s=>Pt(s*.0097,.0158,-.112,.0012,.0016,.05,'muzzle')),
    Pt(0,.0118,-.112,.0195,.0052,.0035,'muzzle'),Pt(0,.0225,-.003,.026,.017,.07,S.f,{r:.003}),Pt(0,.006,-.012,.026,.02,.03,S.f,{r:.003}),
    ...X.map(s=>Pt(s*.0133,.025,-.036,.0016,.004,.012,'mtB')),Pt(-.0136,.0292,-.012,.0014,.004,.024,'mtB'));
  // the trigger guard: square-fronted, a small hook under the front; the trigger with its safety blade; the magazine release (left)
  P.push(Pt(0,-.014,-.044,.009,.005,.06,S.f,{r:.002}),Pt(0,-.0005,-.0715,.009,.028,.006,S.f,{r:.002}),Pt(0,-.0162,-.0775,.009,.0045,.007,S.f,{r:.0015}),
    Pt(0,.0005,-.0405,.0042,.024,.006,S.t,{rx:.18,r:.0015}),Pt(0,.0002,-.0432,.0016,.013,.0016,'muzzle',{rx:.18}),Pt(-.0128,-.006,-.021,.0024,.007,.008,'mtB'));
  // the grip: raked steeply, stippled panels down both sides, three finger grooves on the front strap, the beavertail at the top rear
  P.push(G(0,0,.029,.1,.048,S.f,{r:.006}),...X.map(s=>Object.assign(G(-.003,.002,.0012,.072,.04,'grip2'),{c:[s*.0148,...glkAt(-.003,.002)]})),
    ...[.012,-.012,-.036].map(ly=>G(ly,-.0245,.026,.006,.004,S.f,{r:.002})),G(.046,.026,.024,.012,.016,S.f,{r:.004}));
  // the magazine (comes out on a reload): its body in the grip and the floor plate; the 33-round one stands out well below the grip
  const M=S.ext?[G(-.062,.003,.021,.2,.032,'mtP'),G(-.165,.006,.027,.012,.042,S.mp,{r:.003}),...X.map(s=>Object.assign(G(-.11,.003,.0012,.07,.024,'mtB'),{c:[s*.0108,...glkAt(-.11,.003)]}))]
    :[G(-.004,.003,.021,.09,.032,'mtP'),G(-.0535,.004,.028,.009,.046,S.mp,{r:.003})];
  P.push(...TAG('mag',M));
  return P}
const GLK_AT={grip:[0,-.02,.005],muzzle:[0,.0505,-.155],mag:[0,-.07,.02],eject:[.014,.056,-.026]};
GUNS.glock=Object.assign({parts:glkParts({s:'mtB',f:'mtP',b:'gunmetal',t:'mtB',mp:'mtP',dot:'white'}),sup:[-.012,-.045,.01]},GLK_AT);
// the pair: two-tone and its mirror — the right gun a black slide on a desert-tan frame, the left a tan slide on black; gold barrels and triggers,
// red floor plates on the long magazines
GUNS.dglock=Object.assign({parts:glkParts({s:'mtB',f:'tan2',b:'deGoldP',t:'deGoldP',mp:'mtRed',dot:'white',comp:1,sel:1,ext:1}),sup:null,alt:'dglockL',iconDual:[-.12,.06]},GLK_AT,{mag:[0,-.1,.03]});
GUNS.dglockL=Object.assign({parts:glkParts({s:'tan2',f:'mtP',b:'deGoldP',t:'deGoldP',mp:'mtRed',dot:'white',comp:1,sel:1,ext:1}),sup:null},GLK_AT,{mag:[0,-.1,.03]});

// ---------- stats ----------
WPN.glock={slot:2,kind:'pistol',n:['글록','Glock'],cost:400,mag:17,res:119,dmg:27,rpm:450,semi:1,gBurst:{n:3,rpm:1300,cd:.42,spr:1.3},
  spread:[.009,.032,.085],rec:[.013,.007],kb:1.6,stag:.18,hs:3,reload:1.9,draw:.45,speed:1,snd:'glock',model:'glock',hold:'pistol',shell:1,
  bd:['9mm 반자동 · 우클릭: 3점사 전환 · 탄창 17','9 mm semi-auto · RMB: 3-round burst · Mag 17']};
WPN.dglock={slot:2,kind:'pistol',crate:1,cat:'pistol',n:['더블 글록','Double Glock'],cost:5000,mag:66,res:264,dmg:30,rpm:1250,dual:1,gBurst:{n:6,rpm:2000,cd:.32,spr:.55,dm:1.1},
  spread:[.012,.032,.09],rec:[.009,.008],kickX:[.32,1.15,.38],kb:2,stag:.22,hs:3,reload:2.9,draw:.7,speed:1,snd:'dglock',model:'dglock',hold:'dual',shell:1,
  bd:['보급 전용 · 양손 기관권총 연사 · 우클릭: 6점사 (정확 · 피해 +10%) · 탄창 33×2','Crates only · akimbo machine pistols, full auto · RMB: 6-round burst (tighter, +10% damage) · Mag 33×2']};
VM_POS.glock={p:[.12,-.135,-.37],r:[0,.07,.02]};
VM_POS.dglock={p:[0,-.17,-.39],r:[0,0,0],dx:.15};// dx: each gun's distance from the middle
// the buy menu (pistols): the Glock after the USP; the Double Glock is a crate gun (crateguns.js): locked unless the account owns one, lent in the range
{const c=BUY_MENU.find(q=>q.k==='pistol');if(c){if(!c.items.includes('glock'))c.items.splice(Math.max(0,c.items.indexOf('p9'))+1,0,'glock');if(!c.items.includes('dglock'))c.items.push('dglock')}}
CRATE_GUNS.push('dglock');
// the real guns' identity (design.js 4부): 17 rounds and 33 × 2, one in the chamber (+1 / +2), the slide racked on the first draw
GUN_DESIGN.glock={mag:17,ch:1,act:'slide',x:.4,d:.04,roll:.3};WPN.glock.fd=GUN_DESIGN.glock;WPN.glock.ch=1;
GUN_DESIGN.dglock={mag:66,ch:1,act:'slide',x:.5,d:.04};WPN.dglock.fd=GUN_DESIGN.dglock;WPN.dglock.ch=1;

// ---------- the weapon name on the HUD: the burst mode ----------
{const ct=cmbTag;cmbTag=function(P,W){return ct(P,W)+(W&&P&&gbOn(P,W)?' · '+gbName(W,true,LI()):'')}}
// touch: the aim button says what it switches to while a gun with a second mode is in hand (점사 / 펌프, or back to 반자동 / 연사); the label goes
// back to 조준 after, unless the Morta or a Twinface has taken the button over (their own labels)
function glkTouch(P){if(typeof TOUCH==='undefined'||!TOUCH.el)return;const bt=TOUCH.el.querySelector('.tAlt'),em=bt&&bt.querySelector('em');if(!em)return;
  const W=P&&P.alive&&P.team===TH?WPN[P.cur]:null,L=LI();
  if(W&&(W.gBurst||W.gMode)){const t=gbShort(W,!gbOn(P,W),L);if(em.textContent!==t)em.textContent=t;bt.dataset.gb='1'}
  else if(bt.dataset.gb){delete bt.dataset.gb;if(!bt.dataset.th&&!bt.classList.contains('jn'))em.textContent=L?'AIM':'조준'}}
{const hu=HUD.update;HUD.update=function(dt){const r=hu.apply(this,arguments);try{glkTouch(G.player)}catch(e){console.error(e)}return r}}

// ---------- sounds ----------
// the Glock: a snappy, bright 9 mm crack (lighter than the USP's .45); the pair: the same round, tighter and shorter for the fast fire
Object.assign(GUNDEF,{
  glock:()=>({drive:1.45,crack:1,crackF:3200,body:[{f:rr(1700,1950),q:.9,l:.78,d:.055},{f:rr(3400,3900),q:1.1,l:.68,d:.042},{f:rr(580,660),q:.9,l:.38,d:.065,n:'pink'}],
    punch:{f0:rr(185,205),f1:82,d:.075,l:.66},mech:{t:rr(.016,.021),f:rr(5000,5800),l:.3},tail:{l:.19,tau:.15,d:.66,f0:3700,f1:330},echo:echoes()}),
  dglock:()=>({drive:1.5,crack:1,crackF:3400,body:[{f:rr(1800,2050),q:.95,l:.76,d:.045},{f:rr(3600,4100),q:1.15,l:.64,d:.035},{f:rr(600,690),q:.9,l:.34,d:.05,n:'pink'}],
    punch:{f0:rr(190,212),f1:86,d:.06,l:.6},mech:{t:rr(.015,.019),f:rr(5200,6000),l:.24},tail:{l:.15,tau:.12,d:.55,f0:3800,f1:340},echo:echoes()})});
Object.assign(SFX,{
  glock:{n:4,dur:.8,ch:2,peak:.92,gain:.74,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.glock())},
  dglock:{n:4,dur:.7,ch:2,peak:.9,gain:.68,rev:.12,poly:12,pj:.03,fn:B=>gunshot(B,GUNDEF.dglock())}});
SFX_ORDER.push('glock','dglock');

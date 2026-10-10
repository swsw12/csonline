'use strict';
// ============ v6.16 supply-crate guns: AK-47 60R and Dual MP7A1 ============
// Both come out of supply crates (supply.js) and are never sold (the shop shows them as crate-only cards). On the buy menu they are
// locked unless the account owns one (v6.18: granted in the database); a crate gun that is not owned is not carried into the next round
// and never goes into a saved set. The shooting range lends them to everyone.
// AK-47 60R: a heavy matte-black AK with a scope on the gas tube and a 60-round half-moon magazine; right click: one zoom step.
// Dual MP7A1: a pair of H&K MP7A1s, one in each hand, firing in turns; right click: the spray stance (both guns rolled outward,
// fire rate x bRpm, spread x bSpread: game.js). The charging handles do not lock back (fd.nolock: vm.js, vmrel.js).
// Models are boxes on the weapon atlas; the half-moon magazine is built in slices round its arc.

// ---------- atlas: matte black metal, matte black polymer, painted red ----------
const CG_MATS=['mtB','mtP','mtRed'];
for(const m of CG_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintCgAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // matte metal: a flat dark grey-black with a faint grain, no shine, no scratches
  patch('mtB',(xx,y,X,Y)=>{const t=nz(X,Y,111,14)+(hash2(X,Y,112)-.5)*.06;let c=t>.62?'#26292c':t<.38?'#1f2124':'#232528';if(hash2(X,Y,113)<.004)c='#2c2f33';return c});
  // matte polymer: finely stippled, a touch darker than the metal
  patch('mtP',(xx,y,X,Y)=>{const s=hash2(X>>1,Y>>1,114);let c=s<.5?'#1d1f22':'#212326';if(nz(X,Y,115,22)>.64)c=dk(c,.06);return c});
  // painted red (selector levers, the MP7 magazine floor plates)
  patch('mtRed',(xx,y,X,Y)=>{const t=nz(X,Y,116,10)+(hash2(X,Y,117)-.5)*.1;return t>.62?'#b0261f':t<.38?'#86140f':'#9c1c17'});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}

// ---------- AK-47 60R ----------
// The half-moon magazine: slices round an arc under the receiver. Angle 0 points to the rear at the magazine well; it sweeps down
// through the bottom (90°) and forward until it points ahead under the handguard. Each slice is turned (rx = its angle) so its
// height runs along the arc; the first slice is the one in the well (the reload takes the well's direction from it).
const AK60={yc:-.026,zc:-.262,ri:.115,ro:.192,a1:152*Math.PI/180,N:36};
function ak60Mag(){const P=[],{yc,zc,ri,ro,a1,N}=AK60,rm=(ri+ro)/2,da=a1/N;
  const at=(r,a)=>[yc-r*Math.sin(a),zc+r*Math.cos(a)];
  for(let i=0;i<N;i++){const a=(i+.5)*da,t=i/(N-1),w=.04-.004*t,d=(ro-ri)*(1-.08*t),[y,z]=at(rm-(ro-ri)*.04*t,a);
    P.push(Pt(0,y,z,w,ro*da*1.06,d,'mtB',{rx:a,r:.0015}));
    // a raised rib along each side, at mid-depth
    if(i%2===0){const [ry,rz]=at(rm,a);P.push(Pt(0,ry,rz,w+.004,ro*da*2.1,.014,'mtB',{rx:a,r:.001}))}
    // a groove across the face every few slices (the stacks of rounds)
    if(i%6===3)P.push(Pt(0,y,z,w+.0012,.0025,d*.86,'blk2',{rx:a}))}
  // the floor plate at the tip, and the locking lugs at the top (front and rear) that the catch grips
  {const a=a1+.012,[y,z]=at(rm,a);P.push(Pt(0,y,z,.044,.012,ro-ri+.008,'mtB',{rx:a,r:.003}),Pt(0,y,z,.046,.004,ro-ri-.02,'blk2',{rx:a}))}
  {const [y,z]=at(ro+.004,.05);P.push(Pt(0,y+.004,z,.03,.014,.01,'mtB',{rx:.05}))}
  {const [y,z]=at(ri-.004,.05);P.push(Pt(0,y+.004,z,.032,.012,.012,'mtB',{rx:.05}))}
  return TAG('mag',P)}
// scout scope on the gas-tube rail: long eye relief, a sunshade on the objective, two rings
function ak60Scope(){const y=.138,P=[Pt(0,y,-.35,.031,.031,.2,'mtB',{r:.014}),
    Pt(0,y,-.445,.045,.045,.052,'mtB',{r:.021}),Pt(0,y,-.478,.043,.043,.018,'mtB',{r:.02}),Pt(0,y,-.4875,.036,.036,.002,'lens'),
    Pt(0,y,-.262,.039,.039,.042,'mtB',{r:.018}),Pt(0,y,-.236,.041,.041,.012,'rub',{r:.019}),Pt(0,y,-.2295,.032,.032,.002,'lens'),
    Pt(0,y,-.29,.036,.036,.014,'mtB',{r:.017}),...[-.294,-.286].map(z=>Pt(0,y,z,.0368,.0368,.002,'blk2',{r:.017})),
    Pt(0,y+.022,-.35,.019,.016,.019,'mtB',{r:.007}),Pt(0,y+.031,-.35,.021,.004,.021,'mtB',{r:.009}),Pt(.022,y,-.35,.016,.019,.019,'mtB',{r:.007}),Pt(.031,y,-.35,.004,.021,.021,'mtB',{r:.009})];
  for(const z of [-.305,-.4]){P.push(Pt(0,y,z,.037,.037,.015,'mtB',{r:.017}),Pt(0,.115,z,.028,.02,.019,'mtB',{r:.003}),Pt(.016,.113,z,.006,.008,.008,'steel',{r:.002}),Pt(0,y+.019,z,.014,.006,.013,'mtB'))}
  return P}
GUNS.ak60r={parts:[
  // receiver: a thick stamped box, rivets over the magazine well, the dust cover with its ribs and release button
  Pt(0,.007,-.035,.058,.074,.3,'mtB',{r:.006}),Pt(0,.054,-.045,.054,.027,.28,'mtB',{r:.012}),...[-.13,-.08,-.03,.02].map(z=>Pt(0,.0665,z,.044,.004,.007,'mtB',{r:.002})),
  Pt(0,.05,.098,.016,.014,.012,'blk2'),Pt(.0283,.034,-.06,.002,.016,.075,'muzzle'),
  ...[-1,1].flatMap(s=>[Pt(s*.0284,.016,-.115,.002,.005,.005,'blk2'),Pt(s*.0284,.016,-.075,.002,.005,.005,'blk2'),Pt(s*.0284,.0,.06,.002,.005,.005,'blk2'),Pt(s*.0282,.002,-.095,.002,.022,.03,'blk2')]),
  Pt(0,-.031,-.104,.048,.008,.09,'mtB',{r:.003}),Pt(0,-.034,-.063,.014,.01,.012,'mtB',{r:.002}),
  // rear sight block and leaf, the gas tube under its polymer cover, the scope rail on the cover
  Pt(0,.058,-.205,.036,.032,.06,'mtB',{r:.004}),Pt(0,.079,-.192,.03,.007,.07,'mtB',{rx:-.06}),Pt(0,.083,-.163,.008,.008,.006,'blk2'),
  Pt(0,.082,-.49,.03,.028,.12,'mtB',{r:.01}),Pt(0,.086,-.325,.05,.04,.23,'mtP',{r:.014}),rail(.1095,-.43,-.225,.026),Pt(0,.105,-.33,.03,.004,.2,'mtB'),
  // handguard: thick polymer with grip grooves down both sides, a steel retainer at its front
  Pt(0,.03,-.345,.072,.072,.29,'mtP',{r:.016}),...[-.43,-.39,-.35,-.31,-.27,-.23].flatMap(z=>[Pt(.0362,.03,z,.002,.046,.012,'muzzle',{r:.001}),Pt(-.0362,.03,z,.002,.046,.012,'muzzle',{r:.001})]),
  Pt(0,-.0065,-.345,.05,.002,.23,'blk2'),Pt(0,.045,-.496,.062,.062,.014,'mtB',{r:.008}),
  // barrel, gas block, front sight with its protective ears, bayonet lug, cleaning rod, a ported muzzle brake
  Pt(0,.055,-.6,.026,.026,.27,'mtB',{r:.008}),Pt(0,.078,-.555,.036,.05,.05,'mtB',{r:.006}),
  Pt(0,.07,-.665,.032,.054,.04,'mtB',{r:.005}),Pt(.012,.106,-.665,.006,.032,.02,'mtB'),Pt(-.012,.106,-.665,.006,.032,.02,'mtB'),Pt(0,.104,-.665,.004,.026,.004,'mtB'),
  Pt(0,.038,-.665,.016,.02,.03,'mtB'),Pt(0,.036,-.58,.008,.008,.17,'steel',{r:.003}),
  Pt(0,.055,-.765,.036,.036,.06,'mtB',{r:.012}),Pt(.0178,.055,-.77,.002,.012,.016,'muzzle'),Pt(-.0178,.055,-.77,.002,.012,.016,'muzzle'),Pt(0,.0728,-.776,.012,.002,.012,'muzzle'),
  Pt(0,.055,-.7955,.02,.02,.002,'muzzle'),
  // the big safety lever down the right side, the charging handle on the carrier (tag: pulled on the first draw / from empty)
  Pt(.0298,.018,-.065,.003,.014,.13,'mtB',{r:.001}),Pt(.0308,.006,-.122,.004,.022,.016,'mtB',{r:.002}),
  ...TAG('chg',[Pt(.031,.04,-.07,.006,.012,.1,'mtB'),Pt(.041,.046,-.018,.02,.012,.014,'mtB',{r:.004})]),
  // trigger guard, trigger, pistol grip (polymer, raked back) with stippled panels
  Pt(0,-.036,-.012,.008,.006,.088,'mtB'),Pt(0,-.018,-.055,.008,.036,.008,'mtB'),Pt(0,-.016,.03,.008,.03,.008,'mtB'),Pt(0,-.014,-.014,.005,.026,.006,'steel',{rx:.2}),
  Pt(0,-.062,.048,.036,.112,.05,'mtP',{rx:-.3,r:.012}),Pt(.0185,-.064,.049,.002,.08,.034,'grip2',{rx:-.3}),Pt(-.0185,-.064,.049,.002,.08,.034,'grip2',{rx:-.3}),
  Pt(0,-.118,.066,.038,.008,.052,'mtP',{rx:-.3,r:.004}),
  // fixed polymer stock with the AK drop, a tang into the receiver, a rubber pad
  Pt(0,.022,.12,.042,.05,.04,'mtB',{r:.004}),Pt(0,.01,.165,.044,.064,.1,'mtP',{rx:-.1,r:.012}),Pt(0,-.012,.275,.05,.116,.17,'mtP',{rx:-.15,r:.016}),
  Pt(0,.04,.25,.046,.016,.17,'mtP',{rx:-.13,r:.007}),Pt(0,-.069,.27,.04,.01,.06,'blk2',{rx:-.15}),Pt(0,-.03,.362,.056,.146,.022,'rub',{rx:-.15,r:.007}),
  ...ak60Scope(),...ak60Mag()],
  grip:[0,-.04,.041],sup:[0,-.004,-.44],muzzle:[0,.055,-.798],mag:[0,-.14,-.2],eject:[.03,.05,-.06]};
WPN.ak60r={slot:1,kind:'rifle',crate:1,cat:'rifle',n:['AK-47 60R','AK-47 60R'],cost:5500,mag:60,res:240,dmg:58,rpm:650,spread:[.005,.04,.11],spreadZ:.0018,zoom:[44],
  rec:[.017,.01],kb:3.8,stag:.35,hs:3,reload:3.3,draw:.85,speed:.88,snd:'ak60r',model:'ak60r',hold:'rifle',shell:1};
VM_POS.ak60r={p:[.15,-.17,-.37],r:[0,.085,.035]};

// ---------- Dual MP7A1 ----------
// H&K MP7A1 to its real proportions (415 mm with the stock in): the full-length top rail with flip-up sights, short side rails at
// the front, the folding vertical grip down, the magazine in the pistol grip (a 40-round one, standing out below it, red floor
// plate), the big polymer trigger guard, red ambidextrous selector levers, the T charging handle at the top rear (tag 'slide': both
// are racked on the first draw) and the retracted stock: two rods and the butt plate close behind the receiver.
const MP7_RK=-.17;// pistol-grip rake (the bottom back)
function mp7Parts(){const S=[-1,1],ax=(d,w,h,dd,m,o,x)=>Pt(x||0,-.047-Math.cos(MP7_RK)*d,.008-Math.sin(MP7_RK)*d,w,h,dd,m,Object.assign({rx:MP7_RK},o||{}));// a part on the grip's axis, d below its centre
  return [
    // housing: one block from the front face to behind the grip, the rear block above the stock, a fillet under it
    Pt(0,.046,-.088,.05,.06,.234,'mtP',{r:.008}),Pt(0,.008,-.081,.05,.018,.22,'mtP',{r:.006}),Pt(0,.017,-.1864,.05,.024,.03,'mtP',{rx:-.69,r:.004}),Pt(0,.046,.077,.05,.06,.096,'mtP',{r:.008}),Pt(0,.012,.049,.046,.022,.05,'mtP',{rx:-.35,r:.004}),
    ...S.map(s=>Pt(s*.0252,.016,-.04,.0015,.0015,.33,'blk2')),...S.flatMap(s=>[Pt(s*.0254,.008,-.12,.002,.006,.006,'mtB'),Pt(s*.0254,.034,.1,.002,.006,.006,'mtB')]),
    // top rail end to end on its riser, the flip-up front sight (ears and post) and rear sight (aperture)
    rail(.08,-.2,.12,.022),Pt(0,.0775,-.04,.026,.004,.32,'mtB'),
    Pt(0,.087,-.188,.022,.006,.022,'mtB'),...S.map(s=>Pt(s*.0085,.098,-.188,.004,.018,.01,'mtB')),Pt(0,.096,-.188,.003,.014,.003,'mtB'),
    Pt(0,.087,.1,.024,.006,.024,'mtB'),Pt(0,.1,.1,.02,.022,.005,'mtB',{r:.002}),Pt(0,.104,.0972,.006,.006,.002,'muzzle'),
    // short side rails at the front
    ...S.flatMap(s=>[Pt(s*.0255,.044,-.168,.002,.02,.064,'mtB'),Pt(s*.0272,.044,-.168,.004,.014,.06,'rail')]),
    // barrel stub and thread protector out of the front face, the bore
    Pt(0,.05,-.217,.017,.017,.026,'mtB',{r:.007}),Pt(0,.05,-.239,.021,.021,.02,'mtB',{r:.009}),Pt(0,.05,-.239,.0216,.0216,.004,'blk2',{r:.009}),Pt(0,.05,-.2495,.009,.009,.002,'muzzle'),
    // ejection port and the deflector bump behind it (right side), the bolt catch (left)
    Pt(.0252,.05,-.07,.002,.017,.05,'muzzle'),Pt(.027,.052,-.04,.004,.014,.01,'mtP',{r:.002}),Pt(-.0262,.02,-.035,.003,.01,.022,'mtB'),
    // folding vertical grip, down, raked forward: pivot block, grip, end cap
    Pt(0,-.003,-.172,.03,.008,.034,'mtB'),Pt(0,-.04,-.178,.024,.07,.03,'mtP',{rx:.15,r:.008}),Pt(0,-.077,-.1836,.026,.008,.032,'mtP',{rx:.15,r:.003}),
    // trigger guard: the front post and the bottom bar, the trigger, the magazine release paddle behind the guard
    Pt(0,-.023,-.088,.016,.048,.014,'mtP',{r:.004}),Pt(0,-.0435,-.053,.016,.011,.074,'mtP',{r:.004}),Pt(0,-.014,-.05,.006,.028,.008,'mtB',{rx:.2}),Pt(0,-.03,-.016,.028,.007,.01,'mtB'),
    // pistol grip: stippled side panels, a beavertail at the top rear
    ax(0,.038,.1,.05,'mtP',{r:.011}),...S.map(s=>ax(.004,.002,.07,.038,'grip2',null,s*.0192)),Pt(0,.004,.034,.034,.012,.02,'mtP',{rx:-.4,r:.004}),
    // ambidextrous selector levers (red) on their bosses
    ...S.flatMap(s=>[Pt(s*.0258,.03,0,.004,.012,.012,'mtB',{r:.004}),Pt(s*.0262,.03,.015,.003,.011,.032,'mtRed',{r:.002})]),
    // retracted stock: rods, butt plate, rubber pad, release button
    ...S.flatMap(s=>[Pt(s*.017,.004,.137,.005,.005,.022,'steel'),Pt(s*.017,.042,.137,.005,.005,.022,'steel')]),Pt(0,.022,.152,.044,.08,.016,'mtP',{r:.006}),Pt(0,.022,.162,.042,.076,.006,'mtB',{r:.003}),
    Pt(0,.0,.12,.02,.008,.012,'mtB'),
    // charging handle (T) at the top rear
    ...TAG('slide',[Pt(0,.068,.13,.01,.01,.016,'mtB'),Pt(0,.068,.138,.046,.009,.01,'mtB',{r:.003}),...S.map(s=>Pt(s*.024,.068,.137,.006,.012,.014,'mtB',{r:.003}))]),
    // magazine: the body inside the grip, the 40-round extension below it, the red floor plate
    ...TAG('mag',[ax(.005,.026,.09,.034,'mtB'),ax(.08,.03,.06,.04,'mtB',{r:.003}),ax(.115,.034,.01,.046,'mtRed',{r:.003})])]}
GUNS.dmp7={parts:mp7Parts(),grip:[0,-.035,.012],sup:null,muzzle:[0,.05,-.25],mag:[0,-.13,.02],eject:[.027,.05,-.07],
  iconDual:[-.12,.06]};// the shop / buy-menu / kill-feed silhouette shows the pair: the far gun ahead and above the near one (gunart.js)
WPN.dmp7={slot:1,kind:'smg',crate:1,cat:'smg',n:['듀얼 MP7A1','Dual MP7A1'],cost:5000,mag:80,res:320,dmg:32,rpm:1100,dual:1,bRpm:1.3,bSpread:1.5,
  spread:[.011,.03,.085],rec:[.008,.007],kb:2.2,stag:.24,hs:3,reload:3,draw:.75,speed:1,snd:'dmp7',model:'dmp7',hold:'dual',shell:1};
VM_POS.dmp7={p:[0,-.19,-.46],r:[0,0,0],dx:.15};// dx: each gun's distance from the middle
const CRATE_GUNS=['ak60r','dmp7'];
// on the buy menu in their category (v6.18): locked for everyone but an account that owns one (granted in the database: owned_guns), and lent
// to everyone in the shooting range (loadout.js crateOK)
for(const id of CRATE_GUNS){const c=BUY_MENU.find(q=>q.k===WPN[id].cat);if(c&&!c.items.includes(id))c.items.push(id)}

// ---------- sounds ----------
// AK-47 60R: a heavier, lower AK report with the bolt's clack; MP7A1: the sharp, high crack of the small 4.6 mm round
Object.assign(GUNDEF,{
  ak60r:()=>({drive:1.9,crack:.9,crackF:2000,body:[{f:rr(700,820),q:.8,l:.9,d:.11},{f:rr(1750,2050),q:1,l:.72,d:.065},{f:rr(280,330),q:.9,l:.62,d:.15,n:'pink'}],
    punch:{f0:rr(112,126),f1:52,d:.15,l:1.05},mech:{t:rr(.03,.036),f:rr(3200,3800),l:.2},tail:{l:.3,tau:.24,d:rr(.95,1.05),f0:2700,f1:200},echo:echoes()}),
  dmp7:()=>({drive:1.45,crack:.95,crackF:3600,body:[{f:rr(1900,2200),q:1,l:.72,d:.04},{f:rr(3800,4300),q:1.2,l:.6,d:.03},{f:rr(600,700),q:.9,l:.32,d:.045,n:'pink'}],
    punch:{f0:rr(185,205),f1:90,d:.05,l:.48},mech:{t:rr(.018,.022),f:rr(4800,5600),l:.16},tail:{l:.15,tau:.12,d:.55,f0:3800,f1:320},echo:echoes()})});
Object.assign(SFX,{
  ak60r:{n:4,dur:1.2,ch:2,peak:.92,gain:.84,rev:.12,poly:7,pj:.03,fn:B=>gunshot(B,GUNDEF.ak60r())},
  dmp7:{n:4,dur:.7,ch:2,peak:.9,gain:.66,rev:.12,poly:10,pj:.03,fn:B=>gunshot(B,GUNDEF.dmp7())}});
SFX_ORDER.push('ak60r','dmp7');

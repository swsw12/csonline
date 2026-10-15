'use strict';
// ============ v6.60: five more guns — three real ones for the shop, two crate guns on real ones ============
// KRISS VECTOR (SMG): the .45 with the Super V recoil system — a high rate, almost no climb, a short magazine. AN-94 (rifle): the Russian
// rifle with the hyperburst — the first two rounds of every pull go off at 1,800 a minute (hyperRpm 1900: two frames) before the recoil arrives, then 620; right click
// keeps it to those two (game.js W.hyper, gBurst). BARRETT M82A1 (sniper): the .50 semi-auto; a round goes through up to four zombies
// (penTrace, weapons.js shotTrace's W.pen), the barrel recoils into the receiver (VMX). From the supply crates: SPAS-12 DRAGON'S BREATH
// (shotgun): magnesium shells that set every zombie they hit alight, a plume of fire out of the muzzle; right click switches the real
// gun's pump and semi-auto (game.js gMode). M32 CLUSTER (special): the six-shot revolving 40 mm launcher with cluster grenades — each
// bursts and throws five bomblets that go off where they land; right click ripples off the rest of the cylinder (the Crimson's fanning).
// Models: boxes on the weapon atlas, our own drawings of the real guns' shapes (v6.61: redone in far more detail, with their own finishes).

// ---------- v6.61: the models redone, and their materials ----------
// The weapon atlas grew to 256 slots (gunart.js), so these guns get their own finishes: flat dark earth polymer and its stippled panels,
// parkerized steel, a black polymer a shade off the matte metal, AK-74 plum bakelite, olive drab paint (and a darker one), dragon scales
// edged in gold, perforated sheet steel. Parts may now be tapered and slanted (gunart.js partDef: kz / ay / sy, ky).
const RG2_MATS=['fde','fdeG','park','polyB','plum','odg','odgD','dScale','perf'];
for(const m of RG2_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintRg2Atlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // flat dark earth polymer: an even sand-brown with a fine molded grain and the faintest clouding
  patch('fde',(xx,y,X,Y)=>{const t=nz(X,Y,201,26)*.5+hash2(X,Y,202)*.5;let c=t>.64?'#8a7c62':t<.36?'#7a6d56':'#82755c';if(hash2(X,Y,203)<.006)c='#948770';return c});
  // the same stippled (grip panels, the stock's cheek weld)
  patch('fdeG',(xx,y,X,Y)=>{const s=hash2(X>>1,Y>>1,204);return s<.33?'#6a5e48':s<.7?'#776a53':'#84765e'});
  // parkerized steel: a dark grey with a touch of green, fine crystalline grain
  patch('park',(xx,y,X,Y)=>{const t=hash2(X,Y,205)*.6+nz(X,Y,206,12)*.4;let c=t>.62?'#474b44':t<.38?'#33362f':'#3d4039';if(hash2(X,Y,207)<.008)c='#575c53';return c},252);
  // black polymer: a shade lighter than the matte metal so the two read apart, a fine grain
  patch('polyB',(xx,y,X,Y)=>{const t=hash2(X,Y,208)*.55+nz(X,Y,209,20)*.45;return t>.64?'#303236':t<.36?'#26282b':'#2b2d31'});
  // AK-74 plum: a deep red-brown bakelite with darker swirls
  patch('plum',(xx,y,X,Y)=>{const w=Math.sin(Y*.09+nz(X,Y,210,30)*7)*.5+.5,t=nz(X,Y,211,10);let c=mix('#2c1c1c','#432a28',w*.8+t*.2);if(hash2(X,Y,212)<.01)c='#52342f';return c},252);
  // olive drab paint, even, and a darker one for the frame's recesses
  patch('odg',(xx,y,X,Y)=>{const t=nz(X,Y,213,24)*.55+hash2(X,Y,214)*.45;return t>.64?'#4d5138':t<.36?'#40442e':'#474b33'});
  patch('odgD',(xx,y,X,Y)=>{const t=nz(X,Y,216,20)*.5+hash2(X,Y,217)*.5;return t>.64?'#3c3f2c':t<.36?'#303322':'#363927'});
  // dragon scales: overlapping crimson scales edged in gold on black (the Dragon's Breath's receiver)
  patch('dScale',(xx,y,X,Y)=>{let c='#160a08';const j0=Math.floor(y/8);for(const j of [j0,j0-1]){const off=(j&1)*4,cx=Math.round((xx-off)/8)*8+off,cy=j*8,d=Math.hypot(xx-cx,y-cy);
    if(d<6&&y>=cy)c=d>4.9?'#c9952e':mix('#9a1416','#320406',clamp((y-cy)/6*.85+(hash2(X,Y,218)-.5)*.2,0,1))}return c},252);
  // perforated sheet steel (the SPAS heat shield): small round holes on a staggered grid
  patch('perf',(xx,y,X,Y)=>{const r=Math.floor(y/9),cx=((xx+(r&1)*5)%10)-5,cy=(y%9)-4.5,d=Math.hypot(cx,cy);if(d<2.6)return '#060607';if(d<3.4)return '#3a3d41';
    const t=hash2(X,Y,219);return t>.8?'#2e3134':t<.2?'#222427':'#282a2e'},252);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintRg2Atlas()}}

// ---------- helpers ----------
const X2=[1,-1];
// a point on a line raked by k from (y0,z0) (positive k: the bottom forward): grips and magazines built along their rake
const rakeZ=(y,y0,z0,k)=>z0+(y-y0)*Math.tan(k);
// turn parts about the z axis through (px, py): their places and their own turns (the AN-94's magazine, canted to the right)
const _rq=new THREE.Quaternion(),_rq2=new THREE.Quaternion(),_re=new THREE.Euler(),_rz=new THREE.Vector3(0,0,1);
function cantZ(L,th,px,py){const c=Math.cos(th),s=Math.sin(th);_rq.setFromAxisAngle(_rz,th);
  return L.map(p=>{const x=p.c[0]-px,y=p.c[1]-py;_re.set(p.rx||0,p.ry||0,p.rz||0,'XYZ');_rq2.setFromEuler(_re).premultiply(_rq);_re.setFromQuaternion(_rq2,'XYZ');
    return Object.assign({},p,{c:[px+x*c-y*s,py+x*s+y*c,p.c[2]],rx:_re.x,ry:_re.y,rz:_re.z})})}

// ---------- KRISS Vector (flat dark earth) ----------
// the tall upper with the bore low in it, the top front cut back, the rail end to end with flip-up sights; the Super V nose under the
// barrel (a short flat with its rail, then the slope down to the magazine well), the big guard, the raked grip; the squared shroud with
// its vents and an A2-type flash hider; the folding adapter, the tube and an M4-type stock (collapsed); a Glock-pattern .45 magazine
// with its base extension
function vecParts(){const X=X2;const P=[],F='fde',F2='fdeG',B='mtB',K='blk';
  // ---- the upper: one tall body (the bore runs through its lower part), the top front cut back under the rail ----
  P.push(Pt(0,.059,-.08,.046,.094,.27,F,{r:.006}),                                    // z -.215..0.055, y .012..0.106
    Pt(0,.059,-.225,.046,.094,.022,F,{kz:[1,1,.72,1],ay:-1,r:.004}),                  // the front, its top sloping down
    Pt(0,.059,.064,.046,.094,.02,F,{r:.005}));                                        // the rear cap
  // seams and molded lines along both sides; the left's charging slot, the right's ejection port and deflector
  P.push(...X.map(s=>Pt(s*.0233,.0125,-.05,.0012,.0016,.21,'muzzle')),...X.map(s=>Pt(s*.0233,.094,-.09,.0011,.0022,.25,F2)),
    ...X.map(s=>Pt(s*.0233,.0655,.02,.0011,.03,.0016,F2)),...X.map(s=>Pt(s*.0233,.0655,-.19,.0011,.03,.0016,F2)),Pt(-.0234,.083,.022,.0011,.014,.04,F2),...X.map(s=>Pt(s*.0228,-.016,-.03,.003,.0045,.0045,'steel',{r:.002})),...X.map(s=>Pt(s*.0228,-.016,.012,.003,.0045,.0045,'steel',{r:.002})),...X.map(s=>Pt(s*.0228,.03,-.205,.003,.005,.005,'steel',{r:.002})));
  P.push(Pt(-.0234,.068,-.118,.0012,.0075,.1,'muzzle'));
  P.push(...TAG('chg',[Pt(-.0286,.068,-.158,.011,.012,.016,B,{r:.004}),Pt(-.0345,.068,-.158,.004,.018,.022,B,{r:.002}),Pt(-.0372,.068,-.158,.0012,.012,.016,'blk2')]));
  P.push(Pt(.0234,.046,-.096,.0012,.02,.05,'muzzle'),Pt(.0236,.046,-.096,.0008,.01,.036,'steel'),Pt(.0262,.059,-.066,.005,.006,.014,F,{r:.002}));
  // ---- the top rail end to end with its slots; the flip-up sights ----
  P.push(Pt(0,.1105,-.08,.024,.009,.282,'rail',{r:.001}));
  for(let k=0;k<24;k++)P.push(Pt(0,.1152,-.212+k*.0114,.0246,.0012,.0044,'muzzle'));
  P.push(Pt(0,.1195,-.205,.024,.009,.026,B,{r:.002}),...X.map(s=>Pt(s*.0094,.132,-.205,.0042,.02,.016,B,{r:.0015})),Pt(0,.131,-.205,.0036,.018,.0042,B),Pt(0,.1395,-.205,.0016,.003,.0016,'white'));
  P.push(Pt(0,.1195,.045,.024,.009,.026,B,{r:.002}),...X.map(s=>Pt(s*.0094,.132,.045,.0042,.02,.016,B,{r:.0015})),Pt(0,.1315,.045,.0125,.015,.0035,B,{r:.001}),Pt(0,.1335,.0432,.0048,.0048,.001,'muzzle'));
  // ---- the nose under the barrel (the Super V housing): a short flat with its rail, then the slope down to the magazine well ----
  P.push(Pt(0,.004,-.2155,.044,.016,.041,F,{r:.003}),Pt(0,-.008,-.2155,.022,.008,.036,'rail'),...[-.228,-.216,-.204].map(z=>Pt(0,-.0124,z,.0225,.0012,.004,'muzzle')));
  P.push(Pt(0,-.029,-.165,.044,.082,.06,F,{kz:[1,1,.195,1],ay:1,r:.003}));
  // the magazine well, raked a little forward like the magazine, with a lip round its mouth; the release button behind it on both sides
  const MK=.1,mw=(y)=>rakeZ(y,-.05,-.1135,MK);
  P.push(Pt(0,-.037,-.1135,.042,.098,.043,F,{rx:MK,r:.003}),Pt(0,-.0855,mw(-.0855),.044,.007,.047,F2,{rx:MK,r:.002}));
  P.push(...X.map(s=>Pt(s*.0215,-.041,-.087,.003,.01,.01,B,{r:.002})));
  // ---- the lower: over the guard, the big guard itself, the trigger, the controls ----
  P.push(Pt(0,-.009,-.009,.044,.042,.166,F,{r:.004}));
  P.push(Pt(0,-.062,-.046,.014,.008,.092,F,{r:.0035}),Pt(0,-.0455,-.002,.014,.037,.012,F,{r:.003}));
  P.push(Pt(0,-.041,-.064,.006,.028,.008,B,{rx:.18,r:.002}),Pt(0,-.054,-.0685,.005,.006,.006,B,{r:.002}));
  P.push(...X.map(s=>Pt(s*.0228,-.003,.006,.003,.012,.02,B,{r:.002})),...X.map(s=>Pt(s*.0242,-.003,-.001,.0012,.003,.003,'red')));
  P.push(Pt(-.0228,-.014,-.055,.003,.007,.024,B,{r:.0015}),Pt(-.0232,.022,.06,.004,.012,.012,B,{r:.002}),Pt(-.0236,.022,.06,.002,.006,.006,'muzzle'));
  // ---- the grip: raked, FDE with textured side panels, finger ridge, the beavertail ----
  const GK=.22,gz=(y)=>rakeZ(y,-.062,.03,-GK);
  P.push(Pt(0,-.062,.03,.034,.106,.046,F,{rx:-GK,r:.008}),...X.map(s=>Pt(s*.0172,-.066,gz(-.066)+.002,.0016,.07,.034,F2,{rx:-GK})),
    Pt(0,-.054,gz(-.054)-.0235,.028,.008,.006,F,{rx:-GK,r:.003}),Pt(0,-.117,gz(-.117),.037,.009,.05,F,{rx:-GK,r:.003}),Pt(0,-.034,.056,.03,.01,.024,F,{r:.004}));
  // ---- the shroud: squared, three vents a side, two on top, the front collar; an A2-type flash hider ----
  P.push(Pt(0,.036,-.272,.034,.034,.076,B,{r:.006}),Pt(0,.036,-.2395,.038,.038,.01,B,{r:.007}),Pt(0,.036,-.3085,.037,.037,.008,B,{r:.008}));
  for(const z of [-.255,-.274,-.293]){P.push(...X.map(s=>Pt(s*.0172,.036,z,.0012,.012,.014,'muzzle')));P.push(Pt(0,.0532,z,.012,.0012,.014,'muzzle'))}
  P.push(Pt(0,.036,-.322,.02,.02,.028,K,{r:.008}),...[0,1,2,3].map(k=>Pt(Math.sin(k*Math.PI/2+.78)*.0101,.036+Math.cos(k*Math.PI/2+.78)*.0101,-.326,.0026,.0026,.016,'muzzle')),
    Pt(0,.036,-.3362,.011,.011,.001,'muzzle',{r:.004}));
  // ---- the stock: the folding adapter and its hinge, the tube, a black M4-type stock (collapsed) with its lever, sling slot, cheek line, pad ----
  P.push(Pt(0,.078,.084,.04,.05,.026,B,{r:.005}),Pt(.0212,.078,.084,.004,.014,.014,'steel',{r:.003}),Pt(-.0212,.078,.084,.004,.014,.014,'steel',{r:.003}));
  P.push(Pt(0,.084,.16,.028,.028,.13,B,{r:.012}),...[.11,.122,.134].map(z=>Pt(0,.084,z,.0292,.0292,.003,'blk2',{r:.012})));
  P.push(Pt(0,.0525,.1785,.04,.104,.125,'polyB',{kz:[1,1,.56,1],ay:1,r:.006}),Pt(0,.1045,.175,.03,.006,.118,'polyB',{r:.002}),
    Pt(0,.035,.133,.012,.008,.03,B,{r:.002}),...X.map(s=>Pt(s*.0205,.02,.217,.001,.012,.032,'muzzle')),...X.map(s=>Pt(s*.0205,.072,.18,.0011,.0025,.1,'blk2')));
  P.push(Pt(0,.0505,.2455,.042,.113,.012,'rub',{r:.004}),...[.0,.02,.04,.06,.08].map(y=>Pt(0,y,.2522,.043,.0016,.0012,'blk2')));
  // ---- the magazine: a Glock-pattern .45 with its long base extension, raked like the well (tag mag) ----
  P.push(...TAG('mag',[Pt(0,-.142,mw(-.142),.028,.15,.036,B,{rx:MK,r:.003}),Pt(0,-.198,mw(-.198),.0335,.05,.042,B,{rx:MK,r:.004}),
    Pt(0,-.2275,mw(-.2275),.036,.01,.046,'mtP',{rx:MK,r:.003}),...X.map(s=>Pt(s*.0169,-.198,mw(-.198),.0011,.036,.03,'blk2',{rx:MK})),
    Pt(0,-.12,mw(-.12)+.0182,.012,.06,.0011,'blk2',{rx:MK})]));
  return P}
GUNS.vector={parts:vecParts(),grip:[0,-.02,.012],sup:[0,-.016,-.21],muzzle:[0,.036,-.337],mag:[0,-.1,-.125],eject:[.026,.046,-.096]};

// ---------- AN-94 ----------
// the stamped receiver (rivets, pressed panels), the ribbed dust cover and the drum rear sight; the polymer handguards round the barrel
// group (grooves, vents); the tall front sight with its hood, the bayonet lug (right), the big cup brake; the AK-74M grip and the
// side-folding stock; an AK-74 magazine in plum, canted 15° to the right
// the AK-74 magazine in plum: slices round its curve, stiffening ribs down both sides, steel feed lips, the floor plate
function an94Mag(){const X=X2;const P=[],R=.36,yc=-.032,zc=-.078-R,N=12,a1=.56,da=a1/N,ri=R-.041,ro=R+.041,M='plum';
  const at=(r,a)=>[yc-r*Math.sin(a),zc+r*Math.cos(a)];
  for(let i=0;i<N;i++){const a=(i+.5)*da,t=i/(N-1),[y,z]=at(R,a);P.push(Pt(0,y,z,.031-.0015*t,R*da*1.05,(ro-ri)*(1-.04*t),M,{rx:a,r:.002}))}
  for(const a of [.12,.26,.4]){const [y,z]=at(R-.012,a);P.push(...X.map(s=>Pt(s*.0158,y,z,.0016,R*da*.5,.05,M,{rx:a})))}
  {const [y,z]=at(ro-.004,.03);P.push(Pt(0,y,z,.033,.012,.012,M,{rx:.03,r:.003}))}
  {const [y,z]=at(ri+.006,.05);P.push(Pt(0,y,z,.033,.016,.012,M,{rx:.05,r:.003}))}
  {const [y,z]=at(R,a1+.006);P.push(Pt(0,y,z,.035,.011,ro-ri+.006,M,{rx:a1,r:.003}),Pt(0,...at(R,a1+.012),.03,.004,ro-ri-.012,'mtB',{rx:a1}))}
  P.push(Pt(0,-.026,-.096,.024,.008,.056,'steel',{r:.002}));
  return P}
function an94Parts(){const X=X2;const P=[],B='blk',PB='polyB',D='mtB';
  // ---- receiver: the stamped body with rivets and a pressed panel each side; the dust cover with its ribs; the drum rear sight ----
  P.push(Pt(0,.008,-.04,.056,.074,.31,B,{r:.005}),...X.map(s=>Pt(s*.0283,.004,-.02,.0012,.042,.19,'mtB',{r:.0006})));
  for(const z of [-.172,-.152,.07,.092])P.push(...X.map(s=>Pt(s*.0288,-.016,z,.0024,.0055,.0055,'steel',{r:.002})));
  for(const z of [-.172,-.152])P.push(...X.map(s=>Pt(s*.0288,.03,z,.0024,.0055,.0055,'steel',{r:.002})));
  P.push(Pt(0,.0565,-.045,.05,.023,.29,B,{r:.009}),Pt(0,.0685,-.045,.012,.004,.28,B,{r:.0015}),...[-.17,-.15,-.13].map(z=>Pt(0,.067,z,.04,.004,.006,B,{r:.0015})),
    Pt(0,.06,.106,.02,.01,.012,'blk',{r:.002}));
  P.push(Pt(0,.073,.086,.034,.014,.032,B,{r:.004}),Pt(0,.087,.086,.044,.024,.024,D,{r:.011}),...X.map(s=>Pt(s*.0226,.087,.086,.002,.018,.018,'blk',{r:.007})),
    Pt(0,.087,.0738,.007,.007,.001,'muzzle'),Pt(0,.0992,.086,.003,.002,.008,'white'));
  // left: the optics rail with its stop; right: the AK charging handle (tag chg) and the long safety lever
  P.push(Pt(-.0302,.016,-.06,.005,.024,.15,'blk2'),Pt(-.0312,.016,-.137,.007,.02,.008,B,{r:.002}));
  P.push(...TAG('chg',[Pt(.0312,.042,-.13,.006,.012,.056,B),Pt(.0405,.046,-.108,.019,.013,.015,B,{r:.004})]));
  P.push(Pt(.0298,.022,-.055,.003,.016,.15,B,{r:.001}),Pt(.0312,.008,-.123,.004,.024,.02,B,{r:.002}));
  // ---- the lower handguard (polymer) round the barrel group: grooves along it, a steel cap; the upper one over the gas tube with vents ----
  P.push(Pt(0,.02,-.2,.058,.078,.012,B,{r:.004}),Pt(0,.017,-.336,.066,.066,.27,PB,{r:.014}));
  for(const y of [.034,.018,.002])P.push(...X.map(s=>Pt(s*.0332,y,-.336,.0012,.005,.24,'muzzle')));
  P.push(Pt(0,-.0162,-.336,.04,.0012,.22,'muzzle'),Pt(0,.022,-.4765,.068,.072,.01,B,{r:.012}));
  P.push(Pt(0,.075,-.33,.044,.03,.25,PB,{r:.012}),...[-.25,-.29,-.33,-.37,-.41].flatMap(z=>X.map(s=>Pt(s*.0222,.078,z,.0012,.009,.026,'muzzle'))),Pt(0,.075,-.459,.046,.032,.01,B,{r:.01}));
  // ---- the barrel, the gas block, the tall front sight with its hood, the bayonet lug (right), the big cup brake ----
  P.push(Pt(0,.052,-.58,.022,.022,.21,B,{r:.008}),Pt(0,.062,-.505,.032,.04,.04,B,{r:.005}),Pt(0,.07,-.49,.02,.016,.03,B,{r:.004}));
  P.push(Pt(0,.068,-.61,.03,.03,.036,B,{r:.006}),Pt(0,.098,-.61,.012,.036,.016,B,{r:.002}),...X.map(s=>Pt(s*.0112,.12,-.61,.0042,.026,.018,B,{r:.0015})),
    Pt(0,.1225,-.61,.0032,.016,.0035,B),Pt(0,.1335,-.61,.026,.004,.018,B,{r:.0015}));
  P.push(Pt(.021,.032,-.61,.009,.024,.065,B,{r:.002}),Pt(.021,.032,-.6435,.006,.012,.004,'muzzle'));
  P.push(Pt(0,.052,-.703,.054,.054,.082,B,{r:.021}),Pt(0,.052,-.7445,.044,.044,.002,'muzzle',{r:.019}),Pt(0,.052,-.7455,.016,.016,.002,'muzzle'),
    ...X.flatMap(s=>[Pt(s*.0272,.052,-.69,.0016,.026,.018,'muzzle'),Pt(s*.0272,.052,-.717,.0016,.026,.018,'muzzle')]),Pt(0,.0792,-.703,.022,.0016,.05,'muzzle'),
    Pt(0,.052,-.66,.058,.058,.006,B,{r:.022}));
  // ---- trigger guard, trigger, magazine catch; the AK-74M grip with its grooves ----
  P.push(Pt(0,-.038,-.012,.009,.006,.09,B,{r:.002}),Pt(0,-.022,-.056,.009,.032,.008,B,{r:.002}),Pt(0,-.016,-.016,.005,.026,.006,'steel',{rx:.2,r:.0015}),
    Pt(0,-.033,-.064,.014,.012,.012,B,{r:.003}));
  const GK=.3,gz=(y)=>rakeZ(y,-.066,.05,-GK);
  P.push(Pt(0,-.066,.05,.033,.112,.048,PB,{rx:-GK,r:.009}),Pt(0,-.124,gz(-.124),.036,.008,.052,PB,{rx:-GK,r:.003}));
  for(const o of [-.012,0,.012])P.push(...X.map(s=>Pt(s*.0168,-.07,gz(-.07)+o,.0012,.08,.004,'muzzle',{rx:-GK})));
  // ---- the side-folding stock (open): hinge, the polymer stock with its cheek rest and pressed side panels, the sling swivel, the pad ----
  P.push(Pt(0,.02,.13,.05,.064,.03,B,{r:.005}),Pt(.026,.02,.13,.004,.016,.016,'steel',{r:.004}));
  P.push(Pt(0,-.006,.2425,.046,.136,.205,PB,{kz:[1,1,.62,1],ay:1,r:.012}),Pt(0,.066,.255,.04,.01,.15,PB,{r:.004}),
    ...X.map(s=>Pt(s*.0232,.002,.255,.0012,.05,.12,D,{kz:[1,1,.7,1],ay:1})),Pt(-.024,-.058,.318,.004,.012,.014,'steel',{r:.003}));
  P.push(Pt(0,-.006,.35,.048,.138,.012,'rub',{r:.005}),...[-.05,-.025,0,.025,.05].map(y=>Pt(0,y,.3565,.049,.0016,.0012,'blk2')));
  // ---- the magazine, canted 15° to the right (tag mag) ----
  P.push(...TAG('mag',cantZ(an94Mag(),.26,0,-.032)));
  return P}
GUNS.an94={parts:an94Parts(),grip:[0,-.04,.041],sup:[0,-.012,-.34],muzzle:[0,.052,-.747],mag:[0,-.12,-.12],eject:[.03,.05,-.06]};

// ---------- Barrett M82A1 ----------
// the parkerized upper, solid at the back and open at the front (five windows a side, the barrel and the recoil springs inside), the rail
// and a big scope; the barrel (tag aux: it recoils) fluted, with the arrowhead brake; the bipod folded under it; the black lower with the
// 10-round box, running back into the buttstock (cheek riser, rear grip and monopod, the big pad)
function m82Parts(){const X=X2;const P=[],U='park',B='blk',D='mtB',PB='polyB';
  // ---- the upper receiver (parkerized): solid at the back, open at the front — five windows a side show the barrel running inside ----
  P.push(Pt(0,.052,.01,.066,.066,.22,U,{r:.006}));                                            // z -.10..0.12
  P.push(Pt(0,.0805,-.255,.066,.009,.31,U,{r:.003}),Pt(0,.0235,-.255,.066,.009,.31,U,{r:.003}),...X.map(s=>Pt(s*.0332,.0805,-.255,.0012,.0016,.3,'muzzle')));// top and bottom of the open part (z -.41..-.10)
  const H=[[-.1,-.115],[-.162,-.177],[-.224,-.239],[-.286,-.301],[-.348,-.363],[-.395,-.41]];// the posts between the windows (z from, to)
  for(const [z1,z0] of H)P.push(...X.map(s=>Pt(s*.0315,.052,(z0+z1)/2,.003,.05,z1-z0,U,{r:.0012})));
  P.push(Pt(0,.052,-.255,.002,.048,.31,D),...X.map(s=>Pt(s*.021,.068,-.255,.006,.006,.3,'steel',{r:.002})),...X.map(s=>Pt(s*.021,.036,-.255,.006,.006,.3,'steel',{r:.002})));
  P.push(Pt(0,.052,-.4135,.07,.07,.008,U,{r:.006}),Pt(0,.052,-.418,.04,.04,.004,D,{r:.015}));
  // seam lines, the bolt carrier's slot (right) and the charging handle (tag chg), the rear sling loop
  P.push(...X.map(s=>Pt(s*.0332,.072,.01,.0012,.0016,.21,'muzzle')),Pt(.0332,.06,.04,.0012,.022,.04,'muzzle'),...X.map(s=>Pt(s*.0334,.04,.095,.003,.007,.007,'steel',{r:.002})));
  P.push(...TAG('chg',[Pt(.04,.058,-.03,.014,.016,.03,D,{r:.004}),Pt(.05,.058,-.03,.012,.026,.012,'steel',{r:.004})]));
  // ---- the scope rail over the upper (with its slots) ----
  P.push(Pt(0,.0895,-.14,.026,.009,.38,'rail',{r:.001}));
  for(let k=0;k<32;k++)P.push(Pt(0,.0942,-.322+k*.0115,.0265,.0012,.0045,'muzzle'));
  // ---- the scope: two rings clamped to the rail, the tube, the objective bell (a cone up to it, the lens deep in its sunshade), the
  // turrets (elevation on top with its scale, windage right, parallax left), the magnification ring, the eyepiece and its rubber cup ----
  const SY=.136;
  for(const z of [-.17,-.035])P.push(Pt(0,.106,z,.034,.024,.024,D,{r:.003}),Pt(0,SY,z,.044,.044,.022,D,{r:.012}),Pt(0,SY+.022,z,.03,.006,.022,D,{r:.002}),
    Pt(-.0215,.105,z,.009,.014,.018,'steel',{r:.003}),...X.map(s=>Pt(s*.0226,SY,z,.003,.008,.008,'steel',{r:.002})));
  P.push(Pt(0,SY,-.1,.032,.032,.2,D,{r:.011}),Pt(0,SY,-.215,.05,.05,.03,D,{kz:[1,.66,1,.66],r:.012}),Pt(0,SY,-.27,.054,.054,.08,D,{r:.015}),
    Pt(0,SY,-.311,.056,.056,.006,D,{r:.016}),Pt(0,SY,-.3005,.044,.044,.002,'lens',{r:.013}));
  P.push(Pt(0,SY+.025,-.1,.028,.02,.028,D,{r:.008}),Pt(0,SY+.037,-.1,.03,.006,.03,'steel',{r:.008}),...[-.112,-.1,-.088].map(z=>Pt(.0152,SY+.025,z,.0012,.016,.002,'white')),
    Pt(.026,SY,-.1,.02,.026,.026,D,{r:.008}),Pt(.036,SY,-.1,.004,.022,.022,'steel',{r:.007}),Pt(-.025,SY,-.1,.018,.024,.024,D,{r:.008}));
  P.push(Pt(0,SY,-.015,.036,.036,.02,D,{r:.012}),...[-.022,-.015,-.008].map(z=>Pt(0,SY+.0182,z,.012,.0012,.002,'steel')),
    Pt(0,SY,.025,.04,.04,.05,D,{kz:[.85,1,.85,1],r:.012}),Pt(0,SY,.0565,.046,.046,.014,'rub',{r:.013}),Pt(0,SY,.0635,.03,.03,.001,'muzzle',{r:.01}),Pt(0,SY,.0641,.012,.012,.0008,'bluesteel',{r:.004}));
  // ---- the barrel (tag aux: it recoils into the upper): fluted, and the arrowhead brake with two windows a side ----
  const A=[Pt(0,.052,-.415,.034,.034,.72,'gunmetal',{r:.011})];
  for(const s of X)A.push(Pt(s*.0172,.059,-.58,.0012,.006,.3,'muzzle'),Pt(s*.0172,.045,-.58,.0012,.006,.3,'muzzle'));
  A.push(Pt(0,.0692,-.58,.006,.0012,.3,'muzzle'),Pt(0,.052,-.762,.04,.04,.016,U,{r:.012}));
  A.push(Pt(0,.052,-.808,.078,.062,.092,U,{r:.006}),...X.flatMap(s=>[Pt(s*.0395,.052,-.787,.002,.042,.026,'muzzle'),Pt(s*.0395,.052,-.827,.002,.042,.026,'muzzle')]),
    ...X.map(s=>Pt(s*.0215,.052,-.866,.046,.062,.014,U,{ry:-s*.57,r:.003})),Pt(0,.052,-.8665,.03,.034,.02,U,{r:.006}),Pt(0,.052,-.8775,.018,.018,.002,'muzzle'),
    Pt(0,.0835,-.808,.05,.0012,.06,'muzzle'));
  P.push(...TAG('aux',A));
  // ---- the bipod, folded forward under the barrel (it stays with the upper) ----
  P.push(Pt(0,.008,-.39,.052,.028,.04,B,{r:.005}),Pt(0,.008,-.39,.06,.012,.012,'steel',{r:.005}));
  for(const s of X)P.push(Pt(s*.022,-.004,-.555,.014,.014,.29,B,{r:.005}),Pt(s*.022,-.004,-.62,.016,.016,.05,'steel',{r:.006}),Pt(s*.022,-.006,-.712,.028,.02,.03,'rub',{r:.005}));
  // ---- the lower receiver (black): the magazine well, the guard, the trigger, the grip ----
  P.push(Pt(0,-.008,-.04,.062,.054,.32,D,{r:.004}),...X.map(s=>Pt(s*.0312,-.008,-.04,.0012,.0016,.3,'muzzle')),
    ...X.map(s=>Pt(s*.0316,-.018,-.17,.003,.006,.006,'steel',{r:.002})),...X.map(s=>Pt(s*.0316,-.018,.09,.003,.006,.006,'steel',{r:.002})));
  P.push(Pt(0,-.04,-.13,.06,.014,.11,B,{r:.003}),Pt(0,-.036,-.068,.016,.012,.014,'steel',{r:.003}));
  P.push(Pt(0,-.055,.004,.01,.007,.08,B,{r:.002}),Pt(0,-.044,-.036,.01,.026,.008,B,{r:.002}),Pt(0,-.034,.001,.006,.026,.007,'steel',{rx:.2,r:.0015}),
    Pt(-.0318,-.022,.02,.004,.01,.02,D,{r:.002}));
  const GK=.25,gz=(y)=>rakeZ(y,-.075,.048,-GK);
  P.push(Pt(0,-.075,.048,.036,.114,.05,PB,{rx:-GK,r:.01}),...X.map(s=>Pt(s*.0182,-.078,gz(-.078)+.002,.0016,.08,.036,'grip2',{rx:-GK})),
    Pt(0,-.134,gz(-.134),.039,.009,.056,PB,{rx:-GK,r:.003}));
  // ---- the 10-round box magazine (tag mag) ----
  P.push(...TAG('mag',[Pt(0,-.098,-.13,.054,.11,.104,D,{r:.004}),...X.map(s=>Pt(s*.0272,-.098,-.13,.0012,.08,.07,'blk2')),
    Pt(0,-.158,-.13,.058,.012,.11,D,{r:.003}),Pt(0,-.098,-.0775,.03,.07,.002,'blk2')]));
  // ---- the buttstock: the lower runs back into it, deeper toward the pad — the cheek riser, a pressed panel each side, the rear grip and the
  // monopod folded under it, the big pad ----
  P.push(Pt(0,.022,.275,.062,.126,.31,D,{kz:[1,1,.86,1],ay:1,r:.008}),Pt(0,.0935,.3,.054,.019,.19,PB,{r:.006}),...X.map(s=>Pt(s*.0312,.006,.3,.0012,.0016,.2,'muzzle')),...X.map(s=>Pt(s*.0312,.05,.3,.0012,.0016,.2,'muzzle')),...X.map(s=>Pt(s*.0312,-.01,.4,.001,.014,.03,'muzzle')),Pt(0,-.044,.25,.05,.012,.18,D,{r:.004}));
  P.push(Pt(0,-.065,.36,.022,.03,.1,'steel',{r:.006}),Pt(0,-.062,.305,.032,.032,.016,D,{r:.004}),Pt(0,-.067,.414,.036,.022,.016,'rub',{r:.005}));
  P.push(Pt(0,.022,.4395,.066,.15,.03,'rub',{r:.01}),...[-.035,-.015,.005,.025,.045,.065].map(y=>Pt(0,y,.4555,.067,.0016,.002,'blk2')),Pt(0,.022,.4255,.07,.156,.006,U,{r:.004}));
  return P}
GUNS.m82={parts:m82Parts(),grip:[0,-.04,.04],sup:[0,.006,-.3],muzzle:[0,.052,-.879],mag:[0,-.12,-.13],eject:[.034,.06,.04]};

// ---------- SPAS-12 Dragon's Breath ----------
// black and gold: dragon-scale panels framed in gold on the receiver, the perforated heat shield with gold bands, a gold-ringed crown with
// an ember in it; the big ribbed forend (tag pump) with a crimson line, the pistol grip, the top-folding stock with its arm hook; a side
// saddle of dragon's breath shells on the right
function spasParts(){const X=X2;const P=[],D='mtB',PB='polyB',GD='gold';
  // ---- the receiver: rounded below, a flat rib on top, the peep sight at the back; dragon-scale panels framed in gold on both sides ----
  P.push(Pt(0,.033,-.032,.052,.09,.236,D,{r:.012}),Pt(0,.0805,-.045,.02,.005,.19,D,{r:.002}),...X.map(s=>Pt(s*.0104,.0832,-.045,.0016,.0012,.19,GD)));
  P.push(Pt(0,.0855,.062,.024,.011,.02,D,{r:.002}),...X.map(s=>Pt(s*.0092,.0955,.062,.0042,.014,.014,D,{r:.0015})),Pt(0,.095,.062,.0124,.012,.003,D),Pt(0,.0955,.0605,.0045,.0045,.001,'muzzle'));
  for(const s of X)P.push(Pt(s*.0262,.032,-.04,.0012,.046,.14,'dScale'),Pt(s*.0267,.0563,-.04,.0016,.0026,.144,GD),Pt(s*.0267,.0077,-.04,.0016,.0026,.144,GD),
    Pt(s*.0267,.032,-.1115,.0016,.051,.0026,GD),Pt(s*.0267,.032,.0315,.0016,.051,.0026,GD),Pt(s*.0267,.032,-.04,.0016,.012,.012,GD,{r:.003}));
  // the right side: the ejection port with the bolt, the cocking handle, a side saddle of five dragon's breath shells (gold heads)
  P.push(Pt(.0262,.066,-.03,.0012,.016,.06,'muzzle'),Pt(.0266,.066,-.03,.0008,.008,.046,'steel'),Pt(.034,.066,-.004,.014,.01,.012,'steel',{r:.003}));
  P.push(Pt(.0288,.032,-.04,.004,.05,.096,D,{r:.002}));for(let k=0;k<5;k++){const z=-.076+k*.018;P.push(Pt(.037,.036,z,.012,.04,.014,'mtRed',{r:.006}),Pt(.037,.0125,z,.0126,.008,.0146,GD,{r:.006}))}
  // below: the loading port; the left: the bolt release
  P.push(Pt(0,-.0125,-.09,.03,.002,.08,'muzzle'),Pt(-.0268,.016,-.128,.003,.008,.008,'steel',{r:.002}));
  // ---- the barrel under its perforated heat shield (five strips round the top half), the end bands; the gold-ringed crown with an ember in it ----
  P.push(Pt(0,.055,-.445,.026,.026,.6,D,{r:.009}));
  for(const [a,w] of [[0,.018],[.72,.018],[-.72,.018],[1.32,.016],[-1.32,.016]]){const x=Math.sin(a)*.0218,y=.055+Math.cos(a)*.0218;P.push(Pt(x,y,-.395,w,.0026,.48,'perf',{rz:-a,r:.0008}))}
  P.push(Pt(0,.066,-.153,.05,.03,.008,GD,{r:.004}),Pt(0,.066,-.637,.05,.03,.008,GD,{r:.004}));
  P.push(Pt(0,.055,-.749,.032,.032,.01,GD,{r:.01}),Pt(0,.055,-.7545,.019,.019,.001,'muzzle',{r:.006}),Pt(0,.055,-.7538,.011,.011,.0012,'ember',{r:.004}));
  P.push(Pt(0,.0775,-.718,.012,.02,.014,D,{r:.003}),Pt(0,.0895,-.718,.0045,.0045,.008,'ember'));
  // ---- the magazine tube, its gold-ringed cap and sling loop, the band that ties it to the barrel ----
  P.push(Pt(0,.017,-.42,.03,.03,.52,D,{r:.011}),Pt(0,.017,-.687,.034,.034,.018,D,{r:.011}),Pt(0,.017,-.676,.0346,.0346,.004,GD,{r:.011}),
    Pt(0,.036,-.64,.034,.068,.016,D,{r:.006}),Pt(0,-.003,-.69,.004,.014,.014,'steel',{r:.003}));
  // ---- the forend (tag pump): big and ribbed, flared rims, a crimson line down each side, the selector button under it, the action bars ----
  const PU=[Pt(0,.017,-.31,.068,.062,.2,PB,{r:.018}),Pt(0,.017,-.207,.072,.066,.012,PB,{r:.02}),Pt(0,.017,-.413,.072,.066,.012,PB,{r:.02})];
  for(const y of [.003,.017,.031])PU.push(...X.map(s=>Pt(s*.0342,y,-.31,.0012,.005,.17,'muzzle')));
  PU.push(...X.map(s=>Pt(s*.0346,.0425,-.31,.001,.0026,.18,'mtRed')),Pt(0,-.0148,-.36,.012,.004,.02,'steel',{r:.0015}),...X.map(s=>Pt(s*.0158,.012,-.175,.003,.008,.07,'steel')));
  P.push(...TAG('pump',PU));
  // ---- trigger guard, a gold trigger, the safety; the pistol grip with stippled panels ----
  P.push(Pt(0,-.04,-.012,.01,.007,.09,D,{r:.002}),Pt(0,-.024,-.056,.01,.032,.008,D,{r:.002}),Pt(0,-.018,-.016,.006,.026,.007,GD,{rx:.2,r:.0015}),
    Pt(0,-.004,-.047,.014,.006,.006,'mtRed',{r:.002}));
  const GK=.3,gz=(y)=>rakeZ(y,-.064,.052,-GK);
  P.push(Pt(0,-.064,.052,.034,.112,.048,PB,{rx:-GK,r:.009}),...X.map(s=>Pt(s*.0172,-.068,gz(-.068)+.002,.0016,.078,.034,'grip2',{rx:-GK})),
    Pt(0,-.1215,gz(-.1215),.037,.008,.052,D,{rx:-GK,r:.003}));
  // ---- the top-folding stock, open: its pivot, two arms, a brace, the butt plate and pad, the arm hook under it ----
  P.push(Pt(0,.068,.098,.042,.024,.026,D,{r:.005}),...X.map(s=>Pt(s*.0215,.068,.098,.004,.012,.012,'steel',{r:.004})));
  P.push(...X.map(s=>Pt(s*.017,.066,.25,.007,.014,.3,D,{r:.003})),Pt(0,.066,.36,.04,.01,.01,D,{r:.003}));
  P.push(Pt(0,.03,.405,.046,.11,.012,D,{r:.004}),Pt(0,.03,.4125,.044,.104,.006,'rub',{r:.003}),
    Pt(0,-.041,.405,.012,.034,.01,D,{r:.003}),Pt(0,-.06,.401,.012,.012,.018,D,{r:.005}),Pt(0,-.063,.384,.012,.01,.03,D,{r:.004}),Pt(0,-.058,.369,.012,.014,.008,D,{r:.003}));
  return P}
GUNS.spas12d={parts:spasParts(),grip:[0,-.04,.044],sup:[0,-.004,-.3],muzzle:[0,.055,-.756],eject:[.026,.066,-.03]};

// ---------- M32 Cluster ----------
// olive drab: the six-shot cylinder (tag mag, turning about its axle: piv) — dark olive chambers with the cluster rounds' deep yellow
// bands, the rounds' noses in their mouths; the frame (rear and front frames, the top strap with its rail, the bottom strap); the
// 40 mm barrel in a four-rail handguard with a hazard band, a vertical foregrip, a reflex sight; the grip and the stock on its tube
const M32G={cy:-.02,rc:.052,z0:-.07,z1:-.22};
function m32Parts(){const X=X2;const P=[],{cy,rc,z0,z1}=M32G,zc=(z0+z1)/2,L=z0-z1,O='odg',OD='odgD',D='mtB',PB='polyB';
  // ---- the cylinder (tag mag: a sixth a shot; out whole on a reload): six chambers in dark olive with the cluster rounds' deep yellow
  // bands, their mouths and the rounds' noses in them, the star plates front and back, the axle and the spring housing's cap ----
  const C=[Pt(0,cy,zc,.018,.018,L+.012,'steel',{r:.006}),Pt(0,cy,z1-.009,.03,.03,.014,D,{r:.009}),Pt(0,cy,z1-.0165,.016,.016,.002,'steel',{r:.005})];
  for(let k=0;k<6;k++){const a=Math.PI/2+k*Math.PI/3,x=Math.cos(a)*rc,y=cy+Math.sin(a)*rc;
    C.push(Pt(x,y,zc,.044,.044,L,OD,{r:.013}),Pt(x,y,zc-.04,.0448,.0448,.005,'dyel',{r:.013}),Pt(x,y,zc+.045,.0446,.0446,.003,'olive2',{r:.013}),
      Pt(x,y,z1-.0008,.034,.034,.002,'muzzle',{r:.01}),Pt(x,y,z1-.0012,.024,.024,.002,'olive2',{r:.008}),Pt(x,y,z1-.0016,.01,.01,.001,'dyel',{r:.004}),
      Pt(x,y,z0+.0008,.03,.03,.002,'brass',{r:.009}));
    const a2=a+Math.PI/6;C.push(Pt(Math.cos(a2)*(rc-.004),cy+Math.sin(a2)*(rc-.004),zc,.008,.008,L-.02,D,{r:.003}))}
  for(const z of [z0-.004,z1+.004])for(let k=0;k<3;k++)C.push(Pt(0,cy,z,.104,.104,.006,OD,{rz:k*Math.PI/6,r:.012}));
  P.push(...TAG('mag',C));
  // ---- the frame: the rear frame (recoil shield) and the front frame, the top strap with its rail, the bottom strap, hinge and latch ----
  P.push(Pt(0,-.006,z0+.014,.05,.17,.024,O,{r:.006}),Pt(0,.0,z1-.012,.05,.156,.022,O,{r:.006}),
    Pt(0,.068,zc,.038,.016,L+.05,O,{r:.004}),Pt(0,.0795,zc,.024,.008,L+.04,'rail'),...[-.2,-.185,-.17,-.155,-.14,-.125,-.11,-.095].map(z=>Pt(0,.0838,z,.0245,.0012,.004,'muzzle')),
    Pt(0,-.104,zc,.03,.012,L+.05,O,{r:.004}),Pt(0,-.1,z1-.012,.032,.018,.032,'steel',{r:.005}),Pt(0,-.108,z0+.014,.03,.016,.03,D,{r:.004}));
  P.push(...X.map(s=>Pt(s*.0256,-.006,z0+.014,.0012,.12,.0016,'muzzle')),...X.map(s=>Pt(s*.0256,.03,z1-.012,.0016,.016,.016,'steel',{r:.004})));
  // ---- the barrel group: the 40 mm barrel in its four-rail handguard, a hazard band at the front, the crown; the vertical foregrip ----
  P.push(Pt(0,.032,-.345,.056,.056,.22,D,{r:.016}),Pt(0,.032,-.34,.068,.068,.18,O,{r:.012}));
  P.push(Pt(0,.0705,-.34,.024,.009,.17,'rail'),...X.map(s=>Pt(s*.0385,.032,-.34,.009,.024,.17,'rail')),Pt(0,-.0065,-.34,.024,.009,.17,'rail'));
  for(let k=0;k<12;k++){const z=-.418+k*.0142;P.push(Pt(0,.0752,z,.0245,.0012,.004,'muzzle'),...X.map(s=>Pt(s*.0432,.032,z,.0012,.0245,.004,'blk2')))}
  P.push(Pt(0,.032,-.435,.07,.07,.014,'yellow',{r:.012}),Pt(0,.032,-.244,.07,.07,.008,OD,{r:.012}));
  P.push(Pt(0,.032,-.458,.062,.062,.01,D,{r:.017}),Pt(0,.032,-.4635,.046,.046,.002,'muzzle',{r:.015}));
  P.push(Pt(0,-.016,-.36,.03,.012,.04,D,{r:.003}),Pt(0,-.06,-.362,.03,.08,.034,PB,{rx:.08,r:.012}),Pt(0,-.103,-.366,.034,.008,.038,D,{rx:.08,r:.004}),
    ...[-.045,-.06,-.075].map(y=>Pt(0,y,rakeZ(y,-.06,-.362,.08)-.0172,.026,.004,.002,'muzzle',{rx:.08})));
  // ---- the reflex sight on the top strap: mount, body, the two lens windows, the hood and the brightness knob ----
  P.push(Pt(0,.0885,zc,.03,.01,.05,D,{r:.002}),Pt(0,.11,zc,.05,.034,.07,D,{r:.008}),Pt(0,.129,zc,.044,.006,.074,D,{r:.003}),
    Pt(0,.111,zc-.0355,.036,.022,.002,'lens',{r:.004}),Pt(0,.111,zc+.0355,.036,.022,.002,'lens',{r:.004}),Pt(.0285,.11,zc,.006,.016,.02,'steel',{r:.003}),Pt(-.0262,.098,zc+.02,.003,.008,.014,'dyel'));
  // ---- behind the cylinder: the housing, the guard, trigger and safety; the grip; the stock tube and the stock with its pad ----
  P.push(Pt(0,.025,-.02,.046,.08,.072,O,{r:.006}),Pt(-.0236,.02,-.012,.004,.012,.012,'mtRed',{r:.003}),Pt(.0236,.045,-.02,.003,.006,.04,'muzzle'));
  P.push(Pt(0,-.045,-.026,.01,.007,.062,D,{r:.002}),Pt(0,-.03,-.054,.01,.026,.008,D,{r:.002}),Pt(0,-.024,-.024,.006,.024,.007,'steel',{rx:.2,r:.0015}));
  const GK=.24,gz=(y)=>rakeZ(y,-.06,.03,-GK);
  P.push(Pt(0,-.06,.03,.034,.108,.046,PB,{rx:-GK,r:.009}),...X.map(s=>Pt(s*.0172,-.064,gz(-.064)+.002,.0016,.074,.032,'grip2',{rx:-GK})),Pt(0,-.115,gz(-.115),.037,.008,.05,D,{rx:-GK,r:.003}));
  P.push(Pt(0,.042,.11,.03,.03,.2,D,{r:.011}),...[.06,.09,.12].map(z=>Pt(0,.042,z,.031,.031,.003,'blk2',{r:.011})));
  P.push(Pt(0,.033,.205,.046,.104,.12,O,{kz:[1,1,.72,1],ay:1,r:.009}),Pt(0,.082,.205,.036,.008,.11,OD,{r:.003}),Pt(0,.042,.16,.012,.008,.03,D,{r:.002}),
    ...X.map(s=>Pt(s*.0235,.012,.24,.001,.012,.03,'muzzle')),...X.map(s=>Pt(s*.0235,.05,.2,.0012,.008,.05,'yellow')));
  P.push(Pt(0,.033,.2705,.048,.108,.012,'rub',{r:.004}),...[.0,.02,.04,.06].map(y=>Pt(0,y,.277,.049,.0016,.0012,'blk2')));
  return P}
GUNS.m32c={parts:m32Parts(),grip:[0,-.02,.012],sup:[0,-.03,-.36],muzzle:[0,.032,-.464],mag:[0,M32G.cy,-.145],eject:[0,0,0],piv:{mag:[0,M32G.cy,(M32G.z0+M32G.z1)/2]}};
// a bomblet in flight: a small olive drab body with a deep yellow band and four fins
GUNS.m32bomb={parts:[Pt(0,0,0,.032,.032,.05,'odg',{r:.013}),Pt(0,0,-.006,.0325,.0325,.01,'dyel',{r:.013}),Pt(0,0,.03,.042,.004,.014,'mtB'),Pt(0,0,.03,.004,.042,.014,'mtB')],grip:[0,0,0],muzzle:[0,0,0]};

// ---------- stats ----------
WPN.vector={slot:1,kind:'smg',n:['크리스 벡터','KRISS Vector'],cost:3500,mag:25,res:125,dmg:25,rpm:1150,spread:[.01,.026,.08],rec:[.005,.004],kickX:[.3,.55,.3],kb:1.6,stag:.2,hs:3,
  reload:2.4,draw:.55,speed:.99,snd:'vecfire',model:'vector',hold:'rifle',shell:1,bd:['.45 기관단총 · 분당 1,150발 · 반동이 거의 없음 · 탄창 25','.45 SMG · 1,150 rpm · almost no recoil · Mag 25']};
WPN.an94={slot:1,kind:'rifle',n:['AN-94','AN-94'],cost:5000,mag:30,res:180,dmg:33,rpm:620,hyper:2,hyperRpm:1900,gBurst:{n:2,rpm:1900,cd:.28,spr:.45,rk:.3},
  spread:[.005,.042,.115],rec:[.014,.009],kb:2.4,stag:.26,hs:3,reload:2.6,draw:.75,speed:.91,snd:'an94fire',model:'an94',hold:'rifle',shell:1,
  bd:['하이퍼버스트: 당길 때마다 첫 2발은 분당 1,800발 · 우클릭: 2점사 전환 · 탄창 30','Hyperburst: the first 2 rounds of every pull at 1,800 rpm · RMB: 2-round bursts · Mag 30']};
WPN.m82={slot:1,kind:'sniper',n:['바렛 M82A1','Barrett M82A1'],cost:8500,mag:10,res:30,dmg:165,rpm:110,semi:1,pen:4,penK:.75,spread:[.04,.09,.2],spreadZ:.001,zoom:[30,12],
  rec:[.11,.025],kickX:[1.3,2.8,.6],kb:26,stag:.75,hs:3,reload:3.7,draw:1.05,speed:.82,snd:'m82fire',model:'m82',hold:'rifle',shell:1,
  bd:['.50 BMG 반자동 저격 · 좀비 4마리까지 관통 · 조준경 · 탄창 10','.50 BMG semi-auto · goes through up to 4 zombies · scope · Mag 10']};
WPN.spas12d={slot:1,kind:'shotgun',crate:1,cat:'shotgun',n:['SPAS-12 드래곤브레스','SPAS-12 Dragon’s Breath'],cost:6000,mag:8,res:48,pellets:9,dmg:21,rpm:230,semi:1,
  dragon:1,dbBurn:3,spread:[.055,.07,.105],rec:[.065,.02],kb:3.4,stag:.5,hs:2,shellRel:.42,relStart:.38,draw:.85,speed:.9,snd:'spasfire',model:'spas12d',hold:'rifle',shell:1,
  gMode:{o:{pump:1,rpm:85,dmg:27,spread:[.038,.05,.08],kb:4.4,stag:.6},n:['펌프 액션','Pump action'],n0:['반자동','Semi-auto'],s:['펌프','PUMP'],s0:['반자동','SEMI']},
  bd:['보급 전용 · 맞은 좀비가 불타요 (3초) · 우클릭: 펌프 (더 세고 모임) ↔ 반자동 · 8발','Crates only · sets every zombie it hits alight (3 s) · RMB: pump (harder, tighter) or semi-auto · 8 shells']};
WPN.m32c={slot:1,kind:'special',crate:1,cat:'special',n:['M32 클러스터','M32 Cluster'],cost:7000,mag:6,res:18,dmg:200,rpm:150,semi:1,proj:'gl',cluster:5,alt:'fan',fanRpm:300,fanDm:1,burstCd:.6,
  spread:[.004,.02,.06],rec:[.085,.02],kb:16,stag:.8,hs:1,reload:3.4,draw:.95,speed:.88,snd:'m32fire',model:'m32c',hold:'rifle',
  bd:['보급 전용 · 6연발 유탄 · 터지면 자탄 5개가 흩어져 터져요 · 우클릭: 남은 탄 연속 발사','Crates only · six 40 mm rounds · each bursts into 5 bomblets · RMB: ripple off the rest']};
VM_POS.vector={p:[.14,-.15,-.37],r:[0,.08,.03]};
VM_POS.an94={p:[.15,-.165,-.36],r:[0,.085,.035]};
VM_POS.m82={p:[.15,-.17,-.42],r:[0,.075,.03]};
VM_POS.spas12d={p:[.15,-.165,-.38],r:[0,.08,.035]};
VM_POS.m32c={p:[.155,-.16,-.36],r:[0,.08,.035]};
// the buy menu: the three in their categories (bought in the shop); the crate pair locked unless the account owns one, lent in the range (crateguns.js)
for(const [id,k] of [['vector','smg'],['an94','rifle'],['m82','sniper'],['spas12d','shotgun'],['m32c','special']]){const c=BUY_MENU.find(q=>q.k===k);if(c&&!c.items.includes(id))c.items.push(id)}
CRATE_GUNS.push('spas12d','m32c');
// the real guns' identity (design.js 4부): the Vector's charging handle on the left, the AN-94's AK handle, the Barrett's heavy one, the SPAS
// pumped once, the M32's cylinder wound a sixth by hand (FDS.wind below)
Object.assign(GUN_DESIGN,{vector:{mag:25,ch:1,act:'charge',x:.5,side:'l',d:.045,roll:.25},an94:{mag:30,ch:1,act:'charge',x:.65,side:'r',d:.07,roll:.4,heavy:.4},
  m82:{mag:10,ch:1,act:'charge',x:.85,side:'r',d:.08,roll:.35,heavy:1},spas12d:{mag:8,ch:0,act:'pump',x:.5},m32c:{mag:6,ch:0,act:'wind',x:.7}});
for(const id of ['vector','an94','m82','spas12d','m32c']){WPN[id].fd=GUN_DESIGN[id];WPN[id].ch=GUN_DESIGN[id].ch}

// ---------- the M82: a round through several zombies ----------
// every zombie on the line to the first wall (tbLine, csoguns.js), up to W.pen of them, each next one taking W.penK of the one before; the
// tracer runs on through them to the wall (or to the last one the round stops in)
function penTrace(a,ox,oy,oz,dx,dy,dz,W,pi){const range=140,hw=rayCast(ox,oy,oz,dx,dy,dz,range,SHOT_FILTER),tW=hw?hw.t:range;
  const hits=tbLine(a,ox,oy,oz,dx,dy,dz,tW).slice(0,W.pen||1);
  if(!hits.length){const W0=Object.assign({},W,{pen:0});return shotTrace(a,ox,oy,oz,dx,dy,dz,W0,pi)}// (the wall: the usual impact)
  let hsAny=false,dmgT=0;
  hits.forEach((h,i)=>{const t=h.a,ds=hsForce(a,h),hs=h.part==='head',x=ox+dx*h.t,y=oy+dy*h.t,z=oz+dz*h.t;hsAny=hsAny||hs;
    const dmg=W.dmg*(hs?(W.hs||3):h.part==='legs'?.75:1)*Math.pow(W.penK||.75,i);dmgT+=dmg;
    damageActor(t,dmg,a,{w:a.cur,hs,ds,dir:[dx,dy,dz],kb:W.kb*(i?.6:1),stag:W.stag,x,y,z});
    if(h.part==='ball'||h.part==='tank')FX.impact(x,y,z,-dx,-dy,-dz,'metal');else FX.blood(x,y,z,dx,dy,dz,hs?2.2:1.6,false);
    if(hs&&a.isPlayer&&!t.isPlayer)AU.play('headshot',{vol:.7});else if(Math.random()<.5)AU.at('imp_flesh',x,y,z,{vol:.6})});
  const stop=hits.length>=(W.pen||1),tE=stop?hits[hits.length-1].t:tW;
  FX.tracer(ox+dx*.8-(a.isPlayer?.05:0),oy+dy*.8-(a.isPlayer?.08:0),oz+dz*.8,ox+dx*tE,oy+dy*tE,oz+dz*tE);
  if(!stop&&hw){const ex=ox+dx*tW,ey=oy+dy*tW,ez=oz+dz*tW,m=hw.box.o.f&&hw.box.o.f[nf([hw.nx,hw.ny,hw.nz])]||hw.box.mat;FX.impact(ex,ey,ez,hw.nx,hw.ny,hw.nz,m)}
  return {hit:true,hs:hsAny,dmg:dmgT}}
// the barrel and its brake run back into the receiver on every shot and come home
VMX.m82=function(V,a,dt,o,m){const T=m.tags&&m.tags.aux;if(!T)return;const e=G.t-(a.lastFire||-9);if(e>=0&&e<.16){const k=e<.03?e/.03:1-(e-.03)/.13;T.position.z+=k*.035}};

// ---------- the SPAS-12: dragon's breath ----------
// a plume of burning magnesium out of the muzzle with every shell (on every page); a zombie hit by a pellet burns for dbBurn s (the burn of
// nyw.js: the host deals it; a client's burn reaches the host with its effects)
function spdFlame(a,W){const mz=muzzleWorld(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const d=_dv,n=a.isPlayer?28:16,o0=a.isPlayer?.9:.5;
  for(let i=0;i<n;i++){const s=rr(18,40),j=rr(.03,.11),ux=d.x+rr(-j,j),uy=d.y+rr(-j,j)*.8,uz=d.z+rr(-j,j),q=rr(.05,o0);
    FX.spawn({x:mz.x+d.x*q,y:mz.y+d.y*q,z:mz.z+d.z*q,vx:ux*s,vy:uy*s+rr(0,1),vz:uz*s,life:rr(.2,.48),s0:rr(.07,.15),s1:rr(.45,.95),r:1,g:rr(.42,.72),b:rr(.08,.22),f:11,drag:1.5,add:1})}
  for(let i=0;i<(a.isPlayer?14:6);i++){const s=rr(24,46);FX.spark(mz.x,mz.y,mz.z,d.x*s+rr(-2.5,2.5),d.y*s+rr(-1,2.5),d.z*s+rr(-2.5,2.5),rr(.3,.85),[1,rr(.55,.8),.25])}
  for(let i=0;i<3;i++)FX.spawn({x:mz.x+d.x*rr(.5,2),y:mz.y+d.y*rr(.5,2)+.1,z:mz.z+d.z*rr(.5,2),vx:d.x*rr(1,3),vy:rr(.4,1),vz:d.z*rr(1,3),life:rr(.8,1.4),s0:.3,s1:1.3,r:.18,g:.16,b:.15,a:.4,f:2,drag:1.4,lit:1});
  DL.add(mz.x+d.x*1.5,mz.y+d.y*1.5,mz.z+d.z*1.5,'#ff8a3a',10,2.6,.12);
  if(a.isPlayer)AU.play('salgust',{vol:.32,rate:1.5});else AU.at('salgust',mz.x,mz.y,mz.z,{vol:.4,range:40,rate:1.5})}
{const fg=fireGun;fireGun=function(a,W){const r=fg.apply(this,arguments);try{if(W&&W.dragon)spdFlame(a,W)}catch(e){console.error(e)}return r}}
{const da=damageActor;damageActor=function(t,dmg,src,o){const r=da.apply(this,arguments);
  if(o&&o.w==='spas12d'&&!o.dot&&!NET.ghost&&t&&t.alive&&t.team===TZ){t.burnT=Math.max(t.burnT||0,WPN.spas12d.dbBurn);t.burnSrc=src;t.burnW='spas12d'}return r}}

// ---------- the M32: cluster rounds ----------
// the grenade's own blast (smaller than the M79's, a permanent kill: he), then five bomblets thrown back from what it hit and out to the sides;
// each bursts where it lands, on a zombie or after a moment. Every page makes them from the grenade (a client's bomblets are its own, harmless)
const M32C={R:4,DMG:200,KB:12,STAG:.7,UP:4,N:5,BR:2.6,BDMG:85,BKB:5,BSTAG:.45,BUP:2.4};
function m32Split(n){const hv=Math.hypot(n.vx,n.vz),b0=hv>.5?Math.atan2(-n.vz,-n.vx):Math.random()*TAU,N=M32C.N;
  for(let i=0;i<N;i++){const an=b0+(i/(N-1)-.5)*(hv>.5?2.6:TAU*.8)+rr(-.25,.25),sp=rr(3.5,6.5);
    const c={kind:'glc',owner:n.owner,w:n.w,x:n.x,y:n.y+.15,z:n.z,vx:Math.cos(an)*sp,vy:rr(3,5.5),vz:Math.sin(an)*sp,t:0,fuse:rr(.9,1.5),rest:false,mesh:null,spin:0,impact:1,ghost:!!n.ghost};
    const m=new THREE.Mesh(gunGeo('m32bomb'),matGun());m.position.set(c.x,c.y,c.z);R.scene.add(m);c.mesh=m;NADES.push(c)}}
function m32Pop(n){const x=n.x,y=n.y,z=n.z;
  FX.spawn({x,y:y+.2,z,life:.18,s0:.6,s1:2.6,r:1,g:.78,b:.45,f:1,add:1});
  for(let i=0;i<14;i++){const a=Math.random()*TAU,e=rr(.1,1.2),s=rr(4,10);FX.spark(x,y+.2,z,Math.cos(a)*Math.cos(e)*s,Math.sin(e)*s,Math.sin(a)*Math.cos(e)*s,rr(.2,.6))}
  for(let i=0;i<8;i++){const a=Math.random()*TAU,s=rr(1,4);FX.spawn({x,y:y+.2,z,vx:Math.cos(a)*s,vy:rr(.5,2.5),vz:Math.sin(a)*s,life:rr(.25,.45),s0:.35,s1:.7,r:1,g:rr(.45,.7),b:.2,f:11,drag:3,add:1})}
  for(let i=0;i<7;i++){const a=Math.random()*TAU,s=rr(.4,2);FX.spawn({x,y:y+.3,z,vx:Math.cos(a)*s,vy:rr(.4,1.6),vz:Math.sin(a)*s,life:rr(1,2),s0:.35,s1:1.4,r:.2,g:.19,b:.18,a:.55,f:2,drag:1.6,grav:-.3,lit:1})}
  DL.add(x,y+.5,z,'#ffb060',7,2.2,.18);AU.at('explode',x,y,z,{vol:.55,range:60,occ:false,rate:1.6});
  const pd=G.player?dist3(G.player.c,n):99;if(pd<7)FX.shake=Math.max(FX.shake,.32*(1-pd/7));
  for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const dx=t.c.x-x,dy=t.c.y+1-y,dz=t.c.z-z,d=Math.hypot(dx,dy,dz);if(d>M32C.BR)continue;if(!losClear(x,y+.2,z,t.c.x,t.c.y+1,t.c.z))continue;
    const f=1-d/M32C.BR;damageActor(t,M32C.BDMG*(.4+.6*f),n.owner,{w:n.w||'m32c',dir:[dx/(d||1),.3,dz/(d||1)],kb:M32C.BKB*f,stag:M32C.BSTAG,x:t.c.x,y:t.c.y+1,z:t.c.z,up:M32C.BUP*f,he:1})}}
{const dt0=detonate;detonate=function(n){if(n&&n.kind==='glc'){m32Pop(n);return}
  const W=n&&n.kind==='gl'?WPN[n.w]:null,cl=!!(W&&W.cluster);
  if(cl&&n.dmg==null)Object.assign(n,{R:M32C.R,dmg:M32C.DMG,kb:M32C.KB,stag:M32C.STAG,up:M32C.UP,jw:n.w,he:1});
  dt0(n);if(cl)m32Split(n)}}
// the cylinder turns a sixth with every shot (and back a sixth with every round loaded)
VMX.m32c=function(V,a,dt,o,m){const T=m.tags&&m.tags.mag,am=a.ammo&&a.ammo.m32c,W=WPN.m32c;if(!T||!am)return;
  const tg=(W.mag-am.mag)*TAU/6;if(V.m32A==null||Math.abs(tg-V.m32A)>TAU*.55)V.m32A=tg;V.m32A+=(tg-V.m32A)*Math.min(1,dt*22);T.rotation.z+=V.m32A};
// the first draw: the free hand takes the cylinder and gives it a sixth of a turn against its spring (the 'cylspin' spin of vmdraw.js, on the cylinder)
FDS.wind=function(P,G,m,L){const E=fdExt(G,'mag'),sp=[E.mn[0],(E.mn[1]+E.mx[1])/2-.02,(E.mn[2]+E.mx[2])/2];
  return {G:[K6(0),K6(.08,-.04,.02,-.03,.06,.2,-.15),K6(.25,-.045,.024,-.03,.065,.22,-.17),K6(.32,-.04,.02,-.03,.055,.2,-.12),K6(.75,-.042,.022,-.03,.06,.2,-.15),K6(.92,.003,-.003,0,-.01,-.01,-.01),K6(1)],
    H:{A:[{sup:1},{tag:'mag',at:sp,ride:0}],k:[HK(0,0),HK(.06,0),HK(.18,1,[-.03,-.05,.02],.8,[-1,-.3,0],.3),HK(.24,1,[-.022,-.012,0],1,[-1,0,0],.2),HK(.3,1,[-.02,.07,.01],1,[-1,.3,0],.1),HK(.5,0),HK(1,0)]},
    spins:[{tag:'mag',ch:'rz',kick:[[.27,-9]],fric:3,stop:.62,snap:TAU/6}],E:[[.27,'cylspin',.7,.75],[.62,'dry',.55,.7,[.05,-.2,0]]],C:[[0,0,0,0],[.25,.006,0,.008],[.9,0,0,0],[1,0,0,0]]}};

// ---------- the bots: the three shop guns now and then (PvP lets in the Vector and the AN-94: pvp.js PVP.GUNS) ----------
{const rl=AI.rollLd;AI.rollLd=function(){const L=rl.apply(this,arguments);const r=Math.random();if(r<.05)L[1]='vector';else if(r<.1)L[1]='an94';else if(r<.125)L[1]='m82';return L}}

// ---------- sounds ----------
// the Vector: a quick, dry .45 thump with the bolt's whir; the AN-94: a sharp 5.45 crack; the Barrett: the deep .50 boom with a long tail; the
// SPAS: a heavy twelve-gauge (the fire's whoosh comes from spdFlame); the M32: the 40 mm thunk and the cylinder's clack
Object.assign(GUNDEF,{
  vector:()=>({drive:1.55,crack:.7,crackF:2600,body:[{f:rr(1100,1300),q:.85,l:.8,d:.055},{f:rr(2400,2800),q:1,l:.6,d:.04},{f:rr(400,470),q:.9,l:.45,d:.07,n:'pink'}],
    punch:{f0:rr(145,160),f1:66,d:.085,l:.7},mech:{t:rr(.014,.018),f:rr(5200,6000),l:.22},tail:{l:.18,tau:.15,d:.62,f0:3100,f1:270},echo:echoes()}),
  an94:()=>({drive:1.75,crack:.95,crackF:2600,body:[{f:rr(900,1040),q:.85,l:.82,d:.085},{f:rr(2200,2600),q:1.05,l:.7,d:.055},{f:rr(340,400),q:.9,l:.5,d:.11,n:'pink'}],
    punch:{f0:rr(130,144),f1:58,d:.12,l:.9},mech:{t:.024,f:3600,l:.2},tail:{l:.27,tau:.22,d:.95,f0:3000,f1:230},echo:echoes()}),
  m82:()=>({drive:2.6,crack:1.3,crackF:2000,body:[{f:rr(520,620),q:.75,l:1,d:.16},{f:rr(1500,1800),q:.95,l:.85,d:.1},{f:rr(180,230),q:.8,l:.95,d:.26,n:'brown'}],
    punch:{f0:rr(70,82),f1:32,d:.28,l:1.6},mech:{t:.05,f:2600,l:.3},tail:{l:.55,tau:.55,d:2,f0:2200,f1:120},
    echo:[{t:rr(.25,.32),l:.14,f:800,pan:rr(-.8,.8)},{t:rr(.55,.7),l:.08,f:550,pan:rr(-.8,.8)},{t:rr(.9,1.1),l:.05,f:400,pan:rr(-.8,.8)}]}),
  spas12d:()=>({drive:2.3,crack:.85,crackF:1700,body:[{f:rr(420,520),q:.7,l:1,d:.17},{f:rr(1150,1450),q:.8,l:.8,d:.1},{f:rr(170,220),q:.8,l:.95,d:.24,n:'brown'}],
    punch:{f0:rr(90,104),f1:40,d:.24,l:1.35},mech:{t:.04,f:3200,l:.25},tail:{l:.42,tau:.34,d:1.35,f0:2100,f1:150},echo:echoes()})});
function m32Fn(B){glFn(B);const out=B.comp(-12,4,.002,.15,B.g(.8));B.grain(.075,2600,3,.012,.45,out);B.grain(.09,1800,2,.01,.3,out)}
Object.assign(SFX,{
  vecfire:{n:4,dur:.8,ch:2,peak:.9,gain:.72,rev:.12,poly:10,pj:.03,fn:B=>gunshot(B,GUNDEF.vector())},
  an94fire:{n:4,dur:1.1,ch:2,peak:.92,gain:.82,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.an94())},
  m82fire:{n:3,dur:2.2,ch:2,peak:.96,gain:1,rev:.22,poly:3,pj:.02,fn:B=>gunshot(B,GUNDEF.m82())},
  spasfire:{n:3,dur:1.5,ch:2,peak:.95,gain:.95,rev:.16,poly:4,pj:.03,fn:B=>gunshot(B,GUNDEF.spas12d())},
  m32fire:{n:2,dur:1.1,ch:2,peak:.9,gain:.82,rev:.12,poly:4,pj:.04,fn:m32Fn}});
SFX_ORDER.push('vecfire','an94fire','m82fire','spasfire','m32fire');

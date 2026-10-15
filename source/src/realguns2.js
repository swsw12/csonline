'use strict';
// ============ v6.60: five more guns — three real ones for the shop, two crate guns on real ones ============
// KRISS VECTOR (SMG): the .45 with the Super V recoil system — a high rate, almost no climb, a short magazine. AN-94 (rifle): the Russian
// rifle with the hyperburst — the first two rounds of every pull go off at 1,800 a minute (hyperRpm 1900: two frames) before the recoil arrives, then 620; right click
// keeps it to those two (game.js W.hyper, gBurst). BARRETT M82A1 (sniper): the .50 semi-auto; a round goes through up to four zombies
// (penTrace, weapons.js shotTrace's W.pen), the barrel recoils into the receiver (VMX). From the supply crates: SPAS-12 DRAGON'S BREATH
// (shotgun): magnesium shells that set every zombie they hit alight, a plume of fire out of the muzzle; right click switches the real
// gun's pump and semi-auto (game.js gMode). M32 CLUSTER (special): the six-shot revolving 40 mm launcher with cluster grenades — each
// bursts and throws five bomblets that go off where they land; right click ripples off the rest of the cylinder (the Crimson's fanning).
// Models: boxes on the weapon atlas (the atlas is full: no new materials), our own drawings of the real guns' shapes.

// ---------- helpers ----------
// turn parts about the z axis through (px, py): their places and their own turns (the AN-94's magazine, canted to the right)
const _rq=new THREE.Quaternion(),_rq2=new THREE.Quaternion(),_re=new THREE.Euler(),_rz=new THREE.Vector3(0,0,1);
function cantZ(L,th,px,py){const c=Math.cos(th),s=Math.sin(th);_rq.setFromAxisAngle(_rz,th);
  return L.map(p=>{const x=p.c[0]-px,y=p.c[1]-py;_re.set(p.rx||0,p.ry||0,p.rz||0,'XYZ');_rq2.setFromEuler(_re).premultiply(_rq);_re.setFromQuaternion(_rq2,'XYZ');
    return Object.assign({},p,{c:[px+x*c-y*s,py+x*s+y*c,p.c[2]],rx:_re.x,ry:_re.y,rz:_re.z})})}
// a pistol grip raked back by k (rad): the block, stippled side panels, the base
const rgGrip=(y,z,k,m)=>[Pt(0,y,z,.034,.108,.048,m||'mtP',{rx:-k,r:.01}),...[1,-1].map(s=>Pt(s*.0175,y-.002,z+.001,.002,.078,.034,'grip2',{rx:-k})),
  Pt(0,y-.056*Math.cos(k),z+.056*Math.sin(k),.036,.008,.05,m||'mtP',{rx:-k,r:.003})];

// ---------- KRISS Vector ----------
// the tall polymer receiver (the bore runs low, in line with the hand), the rail end to end with flip-up sights, a vented shroud on the
// short barrel, the magazine just ahead of the trigger guard, a short rail under the front, the charging handle on the left, an M4-type
// stock on a folding adapter
function vecParts(){const P=[],X=[1,-1];
  P.push(Pt(0,.058,-.055,.05,.096,.26,'mtP',{r:.006}),Pt(0,.074,-.19,.046,.05,.034,'mtP',{rx:.55,r:.004}),Pt(0,.032,-.192,.046,.04,.03,'mtP',{r:.004}),
    ...X.map(s=>Pt(s*.0252,.07,-.07,.0012,.05,.18,'blk2')),Pt(.0252,.044,-.085,.002,.022,.05,'muzzle'),
    rail(.111,-.185,.072,.022),Pt(0,.1065,-.057,.03,.004,.258,'mtB'),
    Pt(0,.121,-.168,.022,.01,.022,'mtB'),...X.map(s=>Pt(s*.0072,.131,-.168,.0036,.016,.012,'mtB')),Pt(0,.128,-.168,.003,.01,.003,'mtB'),
    Pt(0,.121,.052,.022,.01,.02,'mtB'),Pt(0,.133,.052,.019,.016,.004,'mtB',{r:.002}),Pt(0,.135,.0498,.006,.006,.001,'muzzle'));
  // the shroud and the barrel's end with its thread protector
  P.push(Pt(0,.036,-.25,.036,.036,.11,'mtB',{r:.008}),...[-.218,-.238,-.258,-.278].flatMap(z=>[...X.map(s=>Pt(s*.0182,.036,z,.002,.012,.01,'muzzle')),Pt(0,.0542,z,.012,.002,.01,'muzzle')]),Pt(0,.036,-.2,.04,.04,.012,'mtB',{r:.008}),Pt(0,.036,-.312,.024,.024,.016,'mtB',{r:.006}),Pt(0,.036,-.3205,.011,.011,.002,'muzzle'));
  // the lower: the front block with its short rail, the magazine well, the body over the guard
  P.push(Pt(0,-.006,-.18,.044,.03,.064,'mtP',{r:.004}),Pt(0,-.025,-.18,.02,.008,.05,'rail'),Pt(0,-.026,-.12,.042,.052,.052,'mtP',{rx:.1,r:.004}),
    Pt(0,-.006,-.035,.046,.032,.14,'mtP',{r:.004}));
  // trigger guard (big, polymer), the trigger, the ambidextrous selector, the charging handle on the left (tag chg)
  P.push(Pt(0,-.048,-.05,.012,.007,.082,'mtP',{r:.003}),Pt(0,-.031,-.089,.012,.034,.008,'mtP',{r:.002}),Pt(0,-.022,-.055,.005,.026,.006,'mtB',{rx:.15,r:.001}),
    ...X.map(s=>Pt(s*.0262,.026,.012,.004,.01,.014,'mtB',{r:.002})),
    Pt(-.0252,.078,-.12,.001,.006,.07,'muzzle'),...TAG('chg',[Pt(-.031,.078,-.152,.012,.012,.022,'mtB',{r:.003})]));
  P.push(...rgGrip(-.06,.03,.22));
  // the stock: the folding adapter's hinge, the buffer tube, the stock with its cheek rest and pad
  P.push(Pt(0,.058,.092,.04,.046,.034,'mtB',{r:.004}),Pt(0,.06,.17,.028,.028,.13,'mtB',{r:.012}),Pt(0,.046,.25,.04,.085,.1,'mtP',{r:.01}),
    Pt(0,.083,.25,.032,.01,.09,'mtP',{r:.004}),Pt(0,.042,.3015,.042,.095,.012,'rub',{r:.004}));
  // the magazine (a long one for the .45, raked a little forward)
  P.push(...TAG('mag',[Pt(0,-.125,-.128,.026,.17,.033,'mtB',{rx:.1,r:.002}),Pt(0,-.213,-.137,.03,.012,.04,'mtP',{rx:.1,r:.003}),Pt(.0132,-.13,-.128,.001,.12,.02,'blk2',{rx:.1})]));
  return P}
GUNS.vector={parts:vecParts(),grip:[0,-.02,.012],sup:[0,-.02,-.17],muzzle:[0,.036,-.322],mag:[0,-.1,-.125],eject:[.026,.045,-.08]};

// ---------- AN-94 ----------
// a black stamped receiver with a long ribbed cover, the rear sight's drum on its end and a side rail (left); the barrel group in a black
// polymer housing with grooves; the front sight high on its post, the big cup-shaped brake; the 30-round magazine canted 15° to the right;
// an AK safety lever and charging handle (right); a polymer folding stock, open
function an94Mag(){const P=[],R=.36,yc=-.032,zc=-.078-R,N=10,a1=.56,da=a1/N,ri=R-.042,ro=R+.042;
  const at=(r,a)=>[yc-r*Math.sin(a),zc+r*Math.cos(a)];
  for(let i=0;i<N;i++){const a=(i+.5)*da,t=i/(N-1),[y,z]=at(R,a);P.push(Pt(0,y,z,.032-.002*t,R*da*1.06,(ro-ri)*(1-.05*t),'mtP',{rx:a,r:.002}));
    if(i%3===1){const [ry,rz]=at(R+.02,a);P.push(Pt(0,ry,rz,.034,R*da*.5,.012,'mtP',{rx:a}))}}
  {const [y,z]=at(R,a1+.01);P.push(Pt(0,y,z,.036,.012,ro-ri+.006,'mtP',{rx:a1,r:.003}))}
  return P}
function an94Parts(){const P=[],X=[1,-1];
  P.push(Pt(0,.008,-.04,.056,.074,.31,'mtB',{r:.006}),Pt(0,.053,-.05,.052,.026,.29,'mtB',{r:.012}),...[-.16,-.11,-.06,-.01].map(z=>Pt(0,.0665,z,.04,.004,.007,'mtB',{r:.002})),
    Pt(0,.07,.085,.03,.018,.034,'mtB',{r:.004}),Pt(0,.077,.085,.036,.018,.018,'mtB',{r:.008}),Pt(0,.077,.085,.038,.005,.005,'steel'),
    Pt(-.0305,.012,-.07,.006,.026,.13,'mtB'),Pt(-.0336,.012,-.07,.002,.018,.12,'blk2'),Pt(.0283,.034,-.06,.002,.016,.075,'muzzle'));
  // the polymer housing round the barrel group, its grooves, the gas cover above
  P.push(Pt(0,.03,-.31,.07,.08,.24,'mtP',{r:.014}),...[-.4,-.36,-.32,-.28,-.24].flatMap(z=>X.map(s=>Pt(s*.0352,.022,z,.002,.05,.012,'muzzle',{r:.001}))),
    Pt(0,.08,-.33,.04,.03,.2,'mtP',{r:.012}),Pt(0,-.011,-.31,.05,.002,.2,'blk2'));
  // the barrel, the front sight high on its post (ears round the post), the bayonet lug, the cup brake
  P.push(Pt(0,.052,-.55,.024,.024,.24,'mtB',{r:.008}),Pt(0,.07,-.6,.03,.03,.034,'mtB',{r:.004}),Pt(0,.098,-.6,.008,.03,.01,'mtB'),Pt(0,.115,-.6,.004,.012,.004,'mtB'),
    ...X.map(s=>Pt(s*.011,.11,-.6,.004,.028,.016,'mtB')),Pt(0,.031,-.585,.016,.016,.03,'mtB'),
    Pt(0,.052,-.712,.05,.05,.07,'mtB',{r:.021}),Pt(0,.052,-.7485,.042,.042,.003,'blk2',{r:.018}),Pt(0,.052,-.75,.016,.016,.002,'muzzle'),
    ...X.map(s=>Pt(s*.026,.052,-.712,.002,.022,.03,'muzzle')));
  // the guard, trigger, safety lever, charging handle (tag chg), grip
  P.push(Pt(0,-.036,-.012,.008,.006,.088,'mtB'),Pt(0,-.018,-.055,.008,.036,.008,'mtB'),Pt(0,-.014,-.014,.005,.026,.006,'steel',{rx:.2}),
    Pt(.0298,.018,-.065,.003,.014,.13,'mtB',{r:.001}),Pt(.0308,.006,-.122,.004,.022,.016,'mtB',{r:.002}),
    ...TAG('chg',[Pt(.031,.042,-.13,.006,.012,.06,'mtB'),Pt(.041,.046,-.105,.02,.012,.014,'mtB',{r:.004})]),...rgGrip(-.06,.048,.3));
  // the stock, open: the hinge, a top bar and a lower bar, the butt with a rubber pad
  P.push(Pt(0,.02,.13,.048,.06,.03,'mtB',{r:.004}),Pt(0,.034,.225,.038,.028,.17,'mtP',{r:.008}),Pt(0,-.026,.235,.034,.022,.17,'mtP',{rx:-.16,r:.008}),
    Pt(0,.002,.325,.046,.13,.036,'mtP',{r:.01}),Pt(0,.002,.3465,.048,.134,.008,'rub',{r:.004}));
  P.push(...TAG('mag',cantZ(an94Mag(),.26,0,-.032)));
  return P}
GUNS.an94={parts:an94Parts(),grip:[0,-.04,.041],sup:[0,-.004,-.33],muzzle:[0,.052,-.752],mag:[0,-.12,-.12],eject:[.03,.05,-.06]};

// ---------- Barrett M82A1 ----------
// the long pressed-steel upper with lightening cuts and the rail end to end, a big scope; the lower with the 10-round box and the grip, running
// back into the stock (cheek riser, monopod folded under, a thick pad); the barrel (tag aux: it recoils) with the arrowhead brake and its
// two windows a side; the bipod folded forward under it
function m82Parts(){const P=[],X=[1,-1];
  P.push(Pt(0,.052,-.12,.064,.064,.5,'mtB',{r:.006}),...[-.3,-.23,-.16,-.09].flatMap(z=>X.map(s=>Pt(s*.0325,.052,z,.002,.024,.045,'blk2',{r:.002}))),
    rail(.088,-.36,.12,.026),Pt(.0325,.06,.06,.002,.026,.06,'muzzle'),
    ...TAG('chg',[Pt(.039,.06,-.02,.014,.016,.03,'mtB',{r:.004}),Pt(.049,.06,-.02,.012,.024,.012,'steel',{r:.004})]));
  P.push(Pt(0,.004,-.06,.058,.036,.36,'mtB',{r:.004}),Pt(0,-.026,-.13,.062,.036,.12,'mtB',{r:.004}),Pt(-.0295,.0,-.04,.002,.008,.03,'steel'));
  P.push(...TAG('mag',[Pt(0,-.1,-.13,.054,.12,.104,'mtB',{r:.004}),Pt(0,-.163,-.13,.058,.008,.108,'mtB',{r:.002}),Pt(.0275,-.09,-.13,.002,.08,.06,'blk2')]));
  P.push(Pt(0,-.036,-.02,.01,.007,.08,'mtB'),Pt(0,-.02,-.058,.01,.034,.008,'mtB'),Pt(0,-.016,-.022,.006,.026,.007,'steel',{rx:.2}),...rgGrip(-.064,.038,.25));
  P.push(Pt(0,.03,.27,.06,.1,.3,'mtB',{r:.008}),Pt(0,.088,.29,.05,.018,.18,'mtP',{r:.006}),Pt(0,-.035,.37,.02,.03,.1,'steel',{r:.004}),Pt(0,-.055,.37,.04,.01,.03,'rub',{r:.003}),
    Pt(0,.03,.432,.064,.14,.026,'rub',{r:.008}),...X.map(s=>Pt(s*.0302,.03,.27,.002,.05,.2,'blk2')));
  P.push(...TAG('aux',[Pt(0,.052,-.56,.034,.034,.38,'bluesteel',{r:.013}),Pt(0,.052,-.8,.076,.062,.104,'mtB',{r:.006}),
    ...X.flatMap(s=>[Pt(s*.0385,.052,-.783,.002,.044,.028,'muzzle'),Pt(s*.0385,.052,-.818,.002,.044,.028,'muzzle'),Pt(s*.03,.052,-.855,.034,.054,.012,'mtB',{ry:s*.5,r:.003})]),
    Pt(0,.052,-.858,.03,.036,.02,'mtB',{r:.008}),Pt(0,.052,-.8685,.018,.018,.002,'muzzle')]));
  P.push(Pt(0,.004,-.39,.05,.03,.04,'mtB',{r:.004}),...X.flatMap(s=>[Pt(s*.022,-.004,-.555,.014,.014,.3,'mtB',{r:.005}),Pt(s*.022,-.004,-.71,.026,.02,.03,'rub',{r:.004})]));
  P.push(Pt(0,.14,-.12,.034,.034,.26,'mtB',{r:.016}),Pt(0,.14,-.275,.05,.05,.07,'mtB',{r:.024}),Pt(0,.14,-.3105,.042,.042,.002,'lens'),
    Pt(0,.14,.03,.042,.042,.05,'mtB',{r:.02}),Pt(0,.14,.058,.044,.044,.012,'rub',{r:.02}),Pt(0,.14,.0645,.03,.03,.002,'lens'),
    Pt(0,.163,-.11,.022,.016,.022,'mtB',{r:.008}),Pt(.025,.14,-.11,.016,.022,.022,'mtB',{r:.008}),
    ...[-.06,-.19].flatMap(z=>[Pt(0,.14,z,.04,.04,.016,'mtB',{r:.019}),Pt(0,.108,z,.03,.03,.02,'mtB')]));
  return P}
GUNS.m82={parts:m82Parts(),grip:[0,-.04,.04],sup:[0,.01,-.3],muzzle:[0,.052,-.87],mag:[0,-.12,-.13],eject:[.034,.06,.06]};

// ---------- SPAS-12 Dragon's Breath ----------
// the alloy receiver, the barrel under its perforated heat shield, the magazine tube with the big ribbed forend (tag pump,
// a red line down each side), the steep grip, the top-folding steel stock open with its arm hook; a side saddle of red magnesium shells (left)
function spasParts(){const P=[],X=[1,-1];
  P.push(Pt(0,.03,-.03,.05,.085,.22,'mtB',{r:.012}),Pt(0,.08,.05,.02,.012,.014,'mtB'),Pt(0,.088,.05,.016,.008,.004,'mtB'),Pt(0,.0895,.048,.005,.005,.001,'muzzle'),
    Pt(.0252,.045,-.03,.002,.03,.06,'muzzle'),Pt(.031,.042,-.05,.012,.012,.018,'steel',{r:.004}),Pt(0,-.0135,-.07,.03,.002,.08,'muzzle'),
    Pt(-.0252,.012,.0,.002,.008,.02,'steel'));
  P.push(Pt(0,.055,-.43,.026,.026,.58,'mtB',{r:.01}),Pt(0,.068,-.37,.038,.024,.45,'vent',{r:.008}),
    Pt(0,.055,-.735,.032,.032,.03,'mtB',{r:.012}),Pt(0,.055,-.7505,.02,.02,.002,'muzzle'),Pt(0,.078,-.7,.014,.02,.012,'mtB'),Pt(0,.09,-.7,.004,.004,.004,'red'));
  P.push(Pt(0,.017,-.43,.03,.03,.5,'mtB',{r:.013}),Pt(0,.017,-.685,.034,.034,.014,'mtB',{r:.012}),Pt(0,.036,-.62,.036,.06,.016,'mtB',{r:.006}));
  P.push(...TAG('pump',[Pt(0,.015,-.3,.064,.056,.2,'mtP',{r:.014}),...[-.25,-.28,-.31,-.34,-.37].flatMap(z=>X.map(s=>Pt(s*.0325,.008,z,.002,.03,.008,'blk2'))),
    ...X.map(s=>Pt(s*.0327,.03,-.3,.001,.006,.18,'mtRed')),Pt(0,-.014,-.39,.012,.008,.016,'steel')]));
  P.push(Pt(0,-.036,-.012,.01,.007,.088,'mtB',{r:.002}),Pt(0,-.02,-.055,.01,.036,.008,'mtB'),Pt(0,-.016,-.014,.006,.026,.007,'steel',{rx:.2}),...rgGrip(-.064,.052,.3));
  // the stock (open): the pivot, the top arm, the butt plate and the hook under it
  P.push(Pt(0,.068,.088,.03,.02,.02,'mtB',{r:.004}),Pt(0,.068,.25,.016,.016,.31,'mtB',{r:.004}),Pt(0,.058,.25,.01,.006,.29,'blk2'),
    Pt(0,.03,.415,.04,.1,.016,'rub',{r:.004}),Pt(0,.03,.4,.044,.104,.01,'mtB',{r:.003}),Pt(0,-.035,.405,.01,.05,.01,'mtB',{rx:-.2}),Pt(0,-.06,.388,.01,.012,.034,'mtB',{rx:.4}));
  // the side saddle: six red shells, brass bases down
  P.push(Pt(-.0285,.03,-.03,.004,.05,.12,'mtB'));for(let k=0;k<6;k++){const z=-.075+k*.018;P.push(Pt(-.037,.034,z,.012,.04,.014,'dred',{r:.006}),Pt(-.037,.011,z,.0125,.007,.0145,'brass',{r:.006}))}
  return P}
GUNS.spas12d={parts:spasParts(),grip:[0,-.04,.044],sup:[0,-.004,-.3],muzzle:[0,.055,-.752],eject:[.026,.045,-.03]};

// ---------- M32 Cluster ----------
// the six-shot cylinder (tag mag: it turns a sixth with every shot and drops out whole on a reload) between the rear and front frames, a top and
// a bottom strap, the 40 mm barrel in a four-sided rail with a vertical grip, the reflex sight over the cylinder, an M4-type stock;
// the chambers wear two deep yellow bands (cluster rounds)
const M32G={cy:-.02,rc:.052,z0:-.07,z1:-.22};
function m32Parts(){const P=[],X=[1,-1],{cy,rc,z0,z1}=M32G,zc=(z0+z1)/2,L=z0-z1;
  const C=[Pt(0,cy,zc,.018,.018,L+.01,'steel',{r:.008})];// (the axle first: the reload drops it straight down)
  for(let k=0;k<6;k++){const a=Math.PI/2+k*Math.PI/3,x=Math.cos(a)*rc,y=cy+Math.sin(a)*rc;
    C.push(Pt(x,y,zc,.044,.044,L,'mtP',{r:.02}),Pt(x,y,z1-.0015,.034,.034,.002,'muzzle',{r:.015}),Pt(x,y,zc+.035,.0446,.0446,.009,'dyel',{r:.02}),Pt(x,y,zc-.035,.0446,.0446,.009,'dyel',{r:.02}))}
  for(const z of [z0-.004,z1+.004])for(let k=0;k<3;k++)C.push(Pt(0,cy,z,.1,.1,.006,'mtB',{rz:k*Math.PI/6,r:.01}));
  P.push(...TAG('mag',C));
  P.push(Pt(0,-.005,z0+.012,.05,.17,.022,'mtB',{r:.006}),Pt(0,.002,z1-.012,.05,.15,.022,'mtB',{r:.006}),Pt(0,.09,zc,.036,.016,L+.05,'mtB',{r:.004}),Pt(0,-.103,zc,.03,.012,L+.05,'mtB',{r:.004}));
  P.push(Pt(0,.032,-.345,.054,.054,.22,'mtB',{r:.022}),Pt(0,.032,-.457,.058,.058,.008,'mtB',{r:.024}),Pt(0,.032,-.4615,.042,.042,.002,'muzzle',{r:.018}),
    Pt(0,.066,-.34,.024,.012,.2,'rail'),...X.map(s=>Pt(s*.034,.032,-.34,.012,.024,.2,'rail')),Pt(0,-.002,-.34,.024,.012,.2,'rail'),
    Pt(0,-.05,-.35,.03,.085,.034,'mtP',{rx:.12,r:.01}),Pt(0,-.094,-.355,.034,.008,.038,'mtP',{rx:.12,r:.003}));
  P.push(Pt(0,.106,zc,.03,.016,.05,'mtB'),Pt(0,.13,zc,.05,.036,.07,'mtB',{r:.008}),Pt(0,.132,zc-.0355,.036,.026,.002,'lens'),Pt(0,.132,zc+.0355,.036,.026,.002,'lens'),Pt(.027,.13,zc,.006,.016,.02,'mtB',{r:.003}));
  P.push(Pt(0,.025,-.02,.046,.08,.07,'mtB',{r:.006}),Pt(0,-.045,-.025,.01,.007,.06,'mtB',{r:.002}),Pt(0,-.028,-.054,.01,.034,.008,'mtB'),Pt(0,-.024,-.022,.005,.024,.006,'steel',{rx:.2}),
    ...rgGrip(-.06,.03,.24),Pt(.0235,.04,-.02,.004,.012,.012,'steel',{r:.003}));
  P.push(Pt(0,.04,.12,.03,.03,.22,'mtB',{r:.012}),Pt(0,.026,.21,.044,.1,.12,'mtP',{r:.01}),Pt(0,.072,.21,.036,.012,.11,'mtP',{r:.004}),Pt(0,.026,.2715,.046,.104,.012,'rub',{r:.004}));
  return P}
GUNS.m32c={parts:m32Parts(),grip:[0,-.02,.012],sup:[0,-.03,-.35],muzzle:[0,.032,-.462],mag:[0,M32G.cy,-.145],eject:[0,0,0]};
// a bomblet in flight: a small olive body with a deep yellow band and four fins
GUNS.m32bomb={parts:[Pt(0,0,0,.032,.032,.05,'olive2',{r:.013}),Pt(0,0,-.006,.0325,.0325,.01,'dyel',{r:.013}),Pt(0,0,.03,.042,.004,.014,'mtB'),Pt(0,0,.03,.004,.042,.014,'mtB')],grip:[0,0,0],muzzle:[0,0,0]};

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

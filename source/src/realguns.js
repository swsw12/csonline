'use strict';
// ============ Real guns with a story (실제로 있었던 특이한 총) ============
// Real firearms whose layout or mechanism is unusual enough to feel new in the game. Names and numbers follow the real guns;
// the models are boxes drawn here (original designs) and the sounds are synthesised.

// ---------- Pancor Jackhammer (잭해머) ----------
// A 1980s bullpup automatic shotgun that never got past prototypes. Its ten shells sit in a rotating cassette behind the pistol
// grip, like a big revolver cylinder: every shot turns it a tenth of a turn, and a reload swaps the whole cassette. Full auto,
// 240 rounds a minute. Here: 8 pellets × 20, the cassette turning on screen with each shot (VMX.jhammer), the first draw works the
// forearm once (design.js GUN_DESIGN), the cassette drops out under the gun on a reload (vmrel.js rlMag), no shells fly out (the
// empties stay in the cassette).
// gun frame: origin at the top of the pistol grip, the barrel along -Z; the cassette turns about the axis (0, JH.cy, z)
const JH={cy:.02,cz:.14,R:.054,L:.146};
function jhParts(){const P=[],A=[...Array(10)].map((_,k)=>k*Math.PI/5),{cy,cz,R,L}=JH,ap=R*Math.cos(Math.PI/10),t=.022,s=2*R*Math.sin(Math.PI/10),rc=ap-t/2;
  // receiver (black polymer), a selector by the thumb, the cassette's axle pin coming through at the back
  P.push(Pt(0,.022,-.03,.054,.09,.17,'blk',{r:.006}),Pt(0,.066,-.03,.044,.004,.15,'blk2'),Pt(.028,.008,.034,.004,.01,.016,'steel',{r:.002}),Pt(-.028,.008,.034,.004,.01,.016,'steel',{r:.002}));
  // the carry handle running the length of the gun, its three posts, a sight channel along the top, the rear aperture's ears and the
  // front post between its guards
  P.push(Pt(0,.112,.04,.03,.022,.5,'blk',{r:.006}),Pt(0,.1245,.04,.008,.003,.46,'blk2'),
    Pt(0,.083,-.19,.024,.04,.022,'blk'),Pt(0,.084,-.02,.026,.034,.04,'blk'),Pt(0,.083,.27,.024,.04,.03,'blk'));
  for(const sx of [1,-1])P.push(Pt(sx*.008,.13,.25,.004,.012,.012,'blk'),Pt(sx*.009,.128,-.19,.004,.012,.014,'blk'));
  P.push(Pt(0,.131,-.19,.004,.016,.006,'blk2'),Pt(0,.127,.25,.006,.006,.004,'muzzle'));
  // barrel: a vented shroud over its back half, the steel tube in front, a ported muzzle
  P.push(Pt(0,.03,-.2,.046,.05,.17,'blk',{r:.01}));
  for(const z of [-.15,-.18,-.21,-.24])P.push(Pt(0,.0555,z,.022,.002,.014,'muzzle'),Pt(.0232,.035,z,.002,.012,.016,'muzzle'),Pt(-.0232,.035,z,.002,.012,.016,'muzzle'));
  P.push(Pt(0,.03,-.36,.026,.026,.16,'steel',{r:.012}),Pt(0,.03,-.452,.036,.034,.04,'blk',{r:.006}),Pt(0,.03,-.4725,.018,.018,.002,'muzzle',{r:.008}));
  for(const sx of [1,-1])for(const z of [-.443,-.459])P.push(Pt(sx*.0182,.03,z,.002,.012,.008,'muzzle'));
  // the forearm (it slides back once on the first draw): ribbed, a hand stop at its front
  P.push(...TAG('pump',[Pt(0,-.013,-.215,.05,.037,.17,'blk2',{r:.008}),Pt(0,-.036,-.296,.05,.034,.016,'blk',{r:.004}),Pt(0,.004,-.215,.052,.004,.16,'blk')]));
  // pistol grip, a big trigger guard (for gloves), the trigger
  P.push(...pGrip('grip2',-.062,.03,.22),Pt(0,-.05,-.012,.01,.007,.085,'blk',{r:.003}),Pt(0,-.03,-.054,.01,.04,.008,'blk',{r:.003}),Pt(0,-.022,-.012,.005,.024,.007,'steel',{rx:.25}));
  // the cassette (tag mag): ten olive staves round the axle with a groove down each, end plates, ten chamber mouths in front and
  // ten brass shell heads behind
  const C=[];
  for(const a of A){const c=Math.cos(a),n=Math.sin(a);
    C.push(Pt(c*rc,cy+n*rc,cz,t,s,L,'olive',{rz:a,r:.003}),Pt(c*(ap+.0002),cy+n*(ap+.0002),cz,.001,.007,L*.82,'blk2',{rz:a}),
      Pt(c*.036,cy+n*.036,cz-L/2-.0015,.016,.016,.002,'muzzle',{rz:a,r:.006}),Pt(c*.036,cy+n*.036,cz+L/2+.0015,.019,.019,.002,'brass',{r:.009}),
      Pt(c*.036,cy+n*.036,cz+L/2+.0028,.005,.005,.001,'bright',{r:.002}))}
  for(const z of [cz-L/2+.0005,cz+L/2-.0005])for(let k=0;k<3;k++)C.push(Pt(0,cy,z,.062,.062,.004,'olive',{rz:k*Math.PI/6}));
  C.push(Pt(0,cy,cz,.016,.016,L+.006,'steel',{r:.007}));
  P.push(...TAG('mag',C));
  // the butt behind the cassette: a recoil pad, a sling stud, the cassette release on the left
  P.push(Pt(0,.032,.272,.056,.15,.07,'blk',{r:.01}),Pt(0,.032,.313,.058,.152,.014,'rub',{r:.004}),Pt(0,-.045,.27,.008,.008,.02,'steel'),Pt(-.029,cy,.25,.004,.012,.012,'steel',{r:.002}));
  return P}
GUNS.jhammer={parts:jhParts(),grip:[0,-.035,.025],sup:[0,-.03,-.235],muzzle:[0,.03,-.472],mag:[0,JH.cy,JH.cz],eject:[.03,.05,-.03]};
WPN.jhammer={slot:1,kind:'shotgun',n:['잭해머','Jackhammer'],cost:7500,mag:10,res:50,pellets:8,dmg:20,rpm:240,spread:[.06,.075,.105],rec:[.05,.02],kb:3,stag:.42,hs:2,
  reload:3.2,draw:.9,speed:.9,snd:'jhfire',model:'jhammer',hold:'rifle'};
VM_POS.jhammer={p:[.155,-.17,-.38],r:[0,.08,.035]};
// the reload: the gun swung round to the left so the cassette's bay behind the grip comes into view; the old cassette drops out
// below, a fresh one is pushed up into the bay (vmrel.js rlMag)
RL_POSE.jhammer=[-.14,.1,-.14,-.1,.7,.45];
BUY_MENU.find(c=>c.k==='shotgun').items.push('jhammer');
// the cassette turns a tenth of a turn with every shot (quickly, the way a cylinder indexes); a fresh cassette looks the same from
// any tenth of a turn, so the count simply starts over after a reload
VMX.jhammer=function(vm,a,dt,K,m){const T=m.tags&&m.tags.mag,am=a.ammo&&a.ammo.jhammer,W=WPN.jhammer;if(!T||!am)return;
  const tg=(W.mag-am.mag)*TAU/10;if(vm.jhA==null||Math.abs(tg-vm.jhA)>TAU*.55)vm.jhA=tg;vm.jhA+=(tg-vm.jhA)*Math.min(1,dt*26);T.rotation.z+=vm.jhA};
// the shot: a deep twelve-gauge boom, the cassette's index clack right after it
GUNDEF.jhammer=()=>({drive:2.3,crack:.8,crackF:1800,body:[{f:rr(440,540),q:.7,l:1,d:.15},{f:rr(1200,1450),q:.8,l:.75,d:.085},{f:rr(170,220),q:.8,l:.95,d:.22,n:'brown'}],
  punch:{f0:rr(88,100),f1:40,d:.22,l:1.35},mech:{t:.06,f:2400,l:.4},tail:{l:.4,tau:.32,d:1.3,f0:2100,f1:150},echo:echoes()});
SFX.jhfire={n:3,dur:1.5,ch:2,peak:.95,gain:.95,rev:.16,poly:5,pj:.03,fn:B=>gunshot(B,GUNDEF.jhammer())};
SFX_ORDER.push('jhfire');

// ---------- Dual Desert Eagle (듀얼 데저트 이글) ----------
// Two .50 AE Desert Eagles (Mark XIX build: the fixed barrel with its three-sided profile and a rail on top, the short slide
// behind it, the square-fronted trigger guard), fired hand after hand. Each heavy round hits hard, staggers and shoves; the guns
// kick high. Dressed up here: a ported muzzle brake on each, gold scrollwork on the barrel flats, a red dot on the front sight.
// The right gun is black with a gold barrel and dark red grips, the left one bright chrome with black grips; gold hammers,
// triggers and safeties on both. Right click: the wide stance of the dual pistols (holding the trigger keeps firing there).
const DE_MATS=['deGold','deGoldP'];
for(const m of DE_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintDeAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  // alpha = gloss level for the view model's shader (240..254 = sheen)
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // polished gold: warm and deep, a bright band where the light runs along it
  const gold=(xx,y,X,Y)=>{const t=nz(X,Y,151,14)+(hash2(X,Y,152)-.5)*.06,b=Math.max(0,1-Math.abs(((y+xx*.35)%48)-24)/6);
    return mix(mix('#7a5a16','#d8b04a',clamp((t-.25)*1.6,0,1)),'#fbe6a0',b*.55)};
  patch('deGoldP',gold,252);
  // engraved gold: scrolls cut into it, dark in the cuts, bright on their edges
  patch('deGold',(xx,y,X,Y)=>{let c=gold(xx,y,X,Y);const v=Math.abs(Math.sin(xx*.22+Math.sin(y*.16+Math.sin(xx*.05)*2)*2.4)),w=Math.abs(Math.sin(y*.2+Math.sin(xx*.14)*2.1));
    if(v<.1||w<.06)c='#4a3608';else if(v<.18)c=lt(c,.12);if(hash2(X,Y,153)<.01)c='#3a2a06';return c},250);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintDeAtlas()}}
// gun frame as the other pistols: origin at the top of the grip, the barrel along -Z. S = the colour scheme of one gun:
// slide, barrel, frame, accents, grips, grip medallions
function deParts(S){const P=[],X=[1,-1];
  // barrel: the three-sided block (a broad lower body, a narrower top, the rail with its cross slots), the bore, the engraved flats,
  // a groove under them, the front sight with its red dot
  P.push(Pt(0,.047,-.165,.03,.03,.16,S.b,{r:.003}),Pt(0,.0655,-.165,.022,.008,.16,S.b,{r:.002}),Pt(0,.0715,-.165,.012,.005,.15,S.rail,{r:.001}));
  for(let z=-.232;z<-.1;z+=.012)P.push(Pt(0,.0742,z,.0125,.001,.003,'blk2'));
  for(const s of X)P.push(Pt(s*.0152,.044,-.16,.0008,.018,.12,S.engr),Pt(s*.0152,.0335,-.16,.0009,.003,.13,'blk'));
  P.push(Pt(0,.0775,-.236,.005,.008,.008,S.acc),Pt(0,.0815,-.236,.003,.003,.005,'red'));
  // the muzzle brake: ports on top and on both sides, the bore through it
  P.push(Pt(0,.05,-.265,.032,.036,.04,S.b,{r:.004}),Pt(0,.0685,-.257,.016,.001,.008,'muzzle'),Pt(0,.0685,-.273,.016,.001,.008,'muzzle'),Pt(0,.052,-.2855,.014,.014,.002,'muzzle',{r:.007}));
  for(const s of X)for(const z of [-.257,-.273])P.push(Pt(s*.0162,.052,z,.0008,.014,.008,'muzzle'));
  // the slide (it runs back on every shot): rear sight with its notch, cocking grooves, the ejection port, an inlaid line,
  // the safety levers
  const SL=[Pt(0,.05,-.015,.034,.044,.14,S.s,{r:.003}),Pt(0,.0745,.045,.024,.006,.01,'mblk'),...X.map(s=>Pt(s*.008,.079,.045,.006,.005,.01,'mblk')),
    Pt(.0172,.06,-.04,.0008,.014,.04,'muzzle'),...X.map(s=>Pt(s*.0172,.036,-.02,.0008,.003,.1,S.acc)),...X.map(s=>Pt(s*.0185,.045,.048,.004,.008,.016,S.acc,{r:.002}))];
  for(const s of X)for(let z=.02;z<=.05;z+=.006)SL.push(Pt(s*.0172,.05,z,.0008,.03,.003,'blk'));
  P.push(...TAG('slide',SL));
  // the hammer, the frame under slide and barrel (the takedown lever at its front, the slide stop on the left)
  P.push(Pt(0,.068,.062,.012,.014,.012,S.acc,{rx:-.3,r:.004}),Pt(0,.017,-.07,.032,.024,.22,S.f,{r:.003}),Pt(0,.022,-.176,.034,.006,.012,S.acc,{r:.002}),Pt(-.0172,.025,-.03,.002,.006,.03,'steel'));
  // the square-fronted trigger guard and the trigger
  P.push(Pt(0,-.022,-.05,.012,.007,.07,S.f,{r:.002}),Pt(0,-.008,-.083,.012,.035,.008,S.f,{r:.002}),Pt(0,-.008,-.045,.005,.026,.008,S.acc,{rx:.2,r:.001}));
  // the grip: frame, backstrap, side panels with a medallion each
  P.push(Pt(0,-.045,.018,.032,.1,.044,S.f,{rx:.2,r:.004}),Pt(0,-.042,.042,.026,.1,.008,S.f,{rx:.2,r:.002}));
  for(const s of X)P.push(Pt(s*.0172,-.045,.018,.003,.088,.036,S.g,{rx:.2,r:.002}),Pt(s*.0187,-.03,.016,.002,.01,.01,S.med,{rx:.2,r:.003}));
  // the magazine (comes out on a reload): its body in the grip and the base plate
  P.push(...TAG('mag',[Pt(0,-.1,.03,.036,.012,.052,S.base,{rx:.2,r:.003}),Pt(0,-.05,.02,.026,.088,.036,'steel',{rx:.2})]));
  return P}
const DE_AT={grip:[0,-.02,.005],sup:null,muzzle:[0,.052,-.287],mag:[0,-.08,.02],eject:[.022,.06,-.04]};
GUNS.dde=Object.assign({parts:deParts({s:'mblk',b:'deGoldP',rail:'mblk',f:'mblk',acc:'deGoldP',engr:'deGold',g:'dred',med:'deGoldP',base:'deGoldP'}),alt:'ddeL',iconDual:[-.12,.06]},DE_AT);
GUNS.ddeL=Object.assign({parts:deParts({s:'chrome',b:'chrome',rail:'mblk',f:'mblk',acc:'deGoldP',engr:'deGold',g:'grip2',med:'chrome',base:'mblk'})},DE_AT);
WPN.dde={slot:2,kind:'pistol',n:['듀얼 데저트 이글','Dual Desert Eagle'],cost:8500,mag:14,res:42,dmg:110,rpm:300,semi:1,dual:1,bSpread:1.4,spread:[.014,.045,.1],
  rec:[.055,.016],kickX:[.8,2.9,.7],kb:12,stag:.75,hs:3,reload:3.3,draw:.85,speed:.94,snd:'ddefire',model:'dde',hold:'dual',shell:1};
VM_POS.dde={p:[0,-.17,-.385],r:[0,0,0],dx:.155};// dx: each gun's distance from the middle
BUY_MENU.find(c=>c.k==='pistol').items.push('dde');
// the shot: a deep, heavy .50 AE boom with a sharp crack on top and a long tail
GUNDEF.dde=()=>({drive:2.2,crack:1.05,crackF:2200,body:[{f:rr(760,900),q:.8,l:.95,d:.11},{f:rr(1900,2300),q:1,l:.75,d:.07},{f:rr(240,300),q:.9,l:.8,d:.16,n:'pink'}],
  punch:{f0:rr(100,115),f1:46,d:.18,l:1.3},mech:{t:rr(.022,.028),f:rr(3400,3900),l:.32},tail:{l:.36,tau:.3,d:1.2,f0:2600,f1:180},echo:echoes()});
SFX.ddefire={n:3,dur:1.3,ch:2,peak:.95,gain:.92,rev:.16,poly:6,pj:.03,fn:B=>gunshot(B,GUNDEF.dde())};
SFX_ORDER.push('ddefire');

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

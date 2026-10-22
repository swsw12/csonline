'use strict';
// ============ Chapter 9 「다이달로스」 (season 2): the boss DAEDALUS (RT1-04), the cable car up Mount Seolryeong, sentry guns, mines and tripwires,
// the lightning rods, the Static zombie ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, laser sights, enemy bullets, scripted leaps,
// ammo boxes — are in epbase.js). Host-authoritative: the host runs DAEDALUS's brain, the sentries, the mines, the storm and decides every
// hit; clients get his gauges and the rods in the chapter snapshot (EP.pack → bsPack) and the moments as events ('e9').
// DAEDALUS, RT-1's engineer, kept FERRY 06 flying for CHARON. The feeling the suppressant held down was grief: he had lost everyone, so he
// would not lose anything more — he walled the summit in, set guns on the walls and waited at the radar for 06. 26,000 × (0.6 + 0.4 ×
// humans) × difficulty health, his own brain (EPZ.daedalus.ai).
//   phase 1 (100–70 %) 「작업장」 on the radome plaza, cover to cover, behind a steel plate he holds in front of him (shots from within ±63° of
//            where he faces, below his chin, do 40 % in sparks: get round him — his back carries the battery): sentry guns set up
//            (kneeling 1.4 s, two at most), nail-gun volleys (three
//            red strips in a fan, .8 s: 16 each; two strips at once pin you .7 s), mines tossed three at a time (they arm in 1.2 s; step within
//            1.6 m and .35 s later 2.4 m of blast, 34 and knocked flat; a shot sets one off), the wrench up close, a damaged sentry repaired
//            (2.4 s of welding: 2 % of his health breaks it off, +30 stagger)
//   70 %     he lets the plate fall and goes up the radome's tower onto its catwalk (8 m above the plaza)
//   phase 2 (70–30 %) 「레이더」 the radar every 17 s (enraged 13): from the dome a red beam turns twice round the plaza (1 s warming up,
//            then 8 s: 12 to whoever it finds in the open, once a turn — under the catwalk, or something solid between you and the dome,
//            crouched behind it will do); nails and mines from the catwalk, the welding torch for whoever comes up (a strip 5.5 m, .8 s: 28 and
//            dazed); he jumps down among the rest for 12 s (nails, mines, the wrench — no more sentries) when two of the team come up there
//            with him, and every 18 s anyway (enraged 14), then goes back up
//   30 %     the wings: FERRY 06's spare rotor blades and a tarp strapped to his frame (2.4 s, invulnerable)
//   phase 3 (30–0 %) 「날개」 from perch to perch (the catwalk's corners, the antenna mast, the observation deck, the sheds' roofs): swoops (a
//            red strip 2.2 × 26 m, 1.2 s, then he glides it at 20 m/s: 28 and knocked flat), landing at its end (3.5 s, ×1.5 damage) before he
//            leaps back up; mines and nails from the perches (often off to another perch after them); the storm at its worst
// The lightning rods (the boss stage's devices): the antenna mast, a mast by the workshop, one before the observation deck and the radome's
// own (its switch at the tower's south foot). Hold E 3 s at a switch: armed 25 s, and the storm's next strike comes to it within seconds —
// DAEDALUS close to the rod (the radome's: anywhere on the catwalk) takes 4 % of his health and +40 stagger (out of the air: he falls, down
// 6 s); anyone of the team that close is hit too (30, knocked flat). 20 s to cool. Unarmed, the storm strikes whoever stands in the open
// (a blue ring, 1.6 s: 35 and knocked flat) every 16 s (phase 3: 11). Stagger also: his frame pack's battery from behind (×1.4), HE +10,
// frost +10; full gauge: down 6 s (×1.5 damage). Every phase change is 3.5 s of invulnerability and gets the team back up; enraged after
// 240 s (expert 180).
// The Static zombie: the station's crew, struck in the storm. Its claws daze; it dies in a discharge (a blue ring 3.2 m, .7 s: 22 and
// dazed); a strike within 10 m supercharges it for 12 s (faster, harder claws, bright).
// The sentry gun (EPZ.sentry, an actor that never moves): sweeps its head, sees ±70° of where it points (28 m; one at its feet, or one that
// has just shot it, wherever), locks on for 1 s (a laser sight), fires a burst of eight (5 each — 4 on expert; DAEDALUS's 4), rests 2 s; blasts hurt
// it 2.5×.
// DAEDALUS's: 400 × (0.6 + 0.4 × humans) × difficulty, four bursts and 30 s of battery in it (then it fizzles out); the maze's three:
// 700 (× difficulty), never empty.
const DA_PH=[1,.7,.3],DA_S=1.15;
const DA_POSE=['','kneel','throw','aim','weld','perch','glide','down','wings','land'];
const DA_MIX=[['static',30],['rager',34],['runner',22],['scream',6],['bomber',8]];
const daYaw=(dx,dz)=>Math.atan2(-dx,-dz),daAng=(a,b)=>wrapA(b-a);
const _daV=new THREE.Vector3(),_daV2=new THREE.Vector3(),_daV3=new THREE.Vector3(),_daM=new THREE.Matrix4();
const on9=()=>EP.on&&EP.id===9;

// ---------- atlas materials: the cable car's red paint and its frame, the window glass, the wings' tarp, red and blue lamps, the sentry
// gun's paint, a mine's casing ----------
const DA_MATS=['daCab','daCabD','daGlass','daTarp','daLed','daLedB','daSent','daMine'];
for(const m of DA_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintDaAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the cabin: signal red, panel seams and rivets, a white band low down, snow and grime along the top
  patch('daCab',(xx,y,X,Y)=>{const t=nz(X,Y,9301,20);let c=t>.58?'#b8321f':t>.4?'#a82a1c':'#982418';const v=y/PS;if(v>.74&&v<.82)c='#e8e4dc';if(v>.82&&v<.84)c='#2a2a2a';
    if(xx%42<1)c=dk(c,.3);if(xx%42===3&&y%7===3)c=lt(c,.2);if(v<.06)c=mix(c,'#e2e8ee',.6);if(nz(X,Y,9302,8)>.7)c=mix(c,'#3a2420',.35);return c},243);
  patch('daCabD',(xx,y,X,Y)=>{let c=mix('#2a2e32','#363a3e',nz(X,Y,9311,12));if(xx%32<1||y%32<1)c='#1a1c1e';if(xx%32===16&&y%32===16)c='#6a6e70';return c},245);
  patch('daGlass',(xx,y,X,Y)=>{let c=mix('#1a3440','#2a4a58',nz(X,Y,9321,10));if((xx+y*.6)%52<6)c='#5a8494';if(xx<3||y<3||xx>PS-4||y>PS-4)c='#1a1c1c';return c},248);
  // the tarp of his wings: blue-grey canvas, stitched seams, oil and grime
  patch('daTarp',(xx,y,X,Y)=>{const t=nz(X,Y,9331,14);let c=t>.56?'#4a6274':t>.4?'#3e5262':'#344656';if(y%40<2||xx%56<2)c=dk(c,.25);if(y%40===3&&xx%6<3)c=lt(c,.2);
    if(nz(X,Y,9332,9)>.68)c=mix(c,'#1e1e1a',.45);return c});
  patch('daLed',(xx,y)=>{const r=Math.hypot(xx-64,y-64);return r<20?'#fff0e0':r<44?'#ff6a4a':'#ff2a14'},232);
  patch('daLedB',(xx,y)=>{const r=Math.hypot(xx-64,y-64);return r<20?'#f4fbff':r<44?'#8ad4ff':'#2a8aff'},232);
  // the sentry gun: olive-grey steel, a yellow and black band, RT-1's stencil
  patch('daSent',(xx,y,X,Y)=>{const t=nz(X,Y,9341,16);let c=t>.55?'#5a5e4c':t>.4?'#4e5242':'#464a3a';const v=y/PS;if(v>.8)c=((xx+y)%24<12)?'#d8b020':'#1a1a1a';
    if(v>.3&&v<.42&&xx>20&&xx<108&&((xx>>3)+(y>>3))%3===0)c='#c8ccb8';if(xx%48<1)c=dk(c,.3);if(nz(X,Y,9342,8)>.72)c=mix(c,'#2a2a22',.4);return c},243);
  patch('daMine',(xx,y,X,Y)=>{const r=Math.hypot(xx-64,y-64);let c=mix('#3a4230','#454e38',nz(X,Y,9351,10));if(r>40&&r<48)c='#c8a018';if(r<10)c='#1a1a1a';return c},244);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintDaAtlas()}}

// ---------- the models (the weapon material) ----------
// the cable car's cabin: x across the line, y up, z along it (−z uphill); y 0 is the floor's top, the grip on the rope at y 4.1. The window
// band is open here (the glass is a see-through mesh of its own: E9CAR.build) so whoever rides sees the mountain go by
{const W=3.4,D=2.4,cab=[
    Pt(0,-.1,0,W,.2,D,'daCabD'),
    // the ends: the panels under and over the windows, the posts and mullions
    ...[-1,1].flatMap(s=>[Pt(0,.5,s*1.16,W,1,.08,'daCab'),Pt(0,2.3,s*1.16,W,.4,.08,'daCab'),Pt(-.85,1.55,s*1.16,.06,1.1,.1,'daCabD'),Pt(.85,1.55,s*1.16,.06,1.1,.1,'daCabD'),Pt(0,1.55,s*1.16,.06,1.1,.1,'daCabD'),
      Pt(0,1.02,s*1.18,W,.04,.06,'daCabD')]),
    // the sides: panels round the door, the band over it, the corner posts
    ...[-1,1].flatMap(s=>[Pt(s*1.66,.5,-1.01,.08,1,.22,'daCab'),Pt(s*1.66,.5,1.01,.08,1,.22,'daCab'),Pt(s*1.66,2.3,0,.08,.4,D,'daCab'),Pt(s*1.66,1.55,-1.01,.08,1.1,.06,'daCabD'),Pt(s*1.66,1.55,1.01,.08,1.1,.06,'daCabD'),
      Pt(s*1.66,1.55,-1.16,.1,1.1,.1,'daCabD'),Pt(s*1.66,1.55,1.16,.1,1.1,.1,'daCabD'),Pt(s*1.66,2.12,0,.1,.06,1.84,'daCabD')]),
    // the roof under its snow, the ceiling's handrail and lamp, the yoke, the hanger up to the grip and the grip's wheels on the rope
    Pt(0,2.575,0,W+.1,.15,D+.1,'daCabD'),Pt(0,2.67,0,W-.2,.04,D-.2,'frSnow'),Pt(0,1.98,0,W-.4,.035,.035,'steel'),Pt(0,2.46,0,.62,.06,.32,'lgLamp'),
    Pt(0,2.76,0,1.5,.12,.3,'gunmetal'),Pt(-.7,2.7,0,.1,.2,.1,'gunmetal'),Pt(.7,2.7,0,.1,.2,.1,'gunmetal'),Pt(0,3.42,.08,.14,1.36,.14,'gunmetal'),Pt(0,3.95,.04,.1,.46,.1,'gunmetal',{rx:.25}),
    Pt(0,4.2,0,.34,.28,.92,'daCabD'),Pt(0,4.32,-.3,.12,.22,.22,'blk2'),Pt(0,4.32,.3,.12,.22,.22,'blk2'),Pt(0,4.16,-.5,.2,.06,.06,'daLed')];
  Object.assign(GUNS,{
  daCar:{parts:cab,grip:[0,0,0],muzzle:[0,0,0]},
  // a door leaf (each side has two that slide apart along the outside of the cabin): the panel under the window, its frame and handle
  daDoor:{parts:[Pt(0,.5,0,.06,1,.88,'daCab'),Pt(0,1.55,-.42,.06,1.1,.05,'daCabD'),Pt(0,1.55,.42,.06,1.1,.05,'daCabD'),Pt(0,2.08,0,.06,.06,.88,'daCabD'),Pt(-.04,1.05,0,.03,.04,.3,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
  // the sentry gun: a tripod and its column (daSentB, on the ground) and the head that turns (daSentH, its pivot 0.95 up; the barrel along −z)
  daSentB:{parts:[Pt(0,.48,0,.12,.9,.12,'gunmetal'),...[0,1,2].map(k=>{const g=k/3*TAU;return Pt(Math.sin(g)*.36,.2,Math.cos(g)*.36,.07,.06,.82,'daSent',{ry:g,rx:-.45})}),
    Pt(0,.08,0,.5,.06,.5,'blk2'),Pt(0,.92,0,.24,.08,.24,'gunmetal')],grip:[0,0,0],muzzle:[0,0,0]},
  daSentH:{parts:[Pt(0,.1,.02,.42,.3,.5,'daSent'),Pt(0,.1,-.5,.07,.07,.62,'gunmetal'),Pt(0,.1,-.83,.1,.1,.08,'blk'),Pt(.26,.06,.06,.12,.2,.3,'olive'),Pt(-.15,.3,-.18,.12,.1,.14,'blk2'),
    Pt(-.15,.3,-.26,.06,.06,.02,'daLed'),Pt(0,.28,.18,.3,.04,.18,'frSnow')],grip:[0,0,0],muzzle:[0,.1,-.88]},
  // a mine (an octagon of olive steel, the red lamp on top) and the tripwire's claymore on its legs
  daMine:{parts:[Pt(0,.035,0,.3,.07,.3,'daMine'),Pt(0,.035,0,.3,.07,.3,'daMine',{ry:Math.PI/4}),Pt(0,.08,0,.07,.025,.07,'daLed')],grip:[0,0,0],muzzle:[0,0,0]},
  daClay:{parts:[Pt(0,.16,0,.24,.13,.05,'olive',{rx:-.12}),Pt(-.08,.05,0,.015,.12,.015,'blk2',{rz:.3}),Pt(.08,.05,0,.015,.12,.015,'blk2',{rz:-.3}),Pt(0,.25,0,.03,.02,.03,'daLed')],grip:[0,0,0],muzzle:[0,0,0]},
  // his nail gun (the grip at the hand: yellow and black, the coil magazine under it), the wrench, the welding torch
  daNailGun:{parts:[Pt(0,.02,-.12,.07,.1,.34,'yellow'),Pt(0,.02,-.32,.05,.06,.1,'blk'),Pt(0,-.09,0,.05,.16,.07,'blk2'),Pt(0,-.06,-.14,.09,.09,.09,'blk2'),Pt(0,.03,-.38,.02,.02,.04,'steel')],grip:[0,0,0],muzzle:[0,.02,-.42]},
  daWrench:{parts:[Pt(0,0,-.2,.035,.02,.42,'steel'),Pt(0,0,-.44,.09,.022,.08,'steel'),Pt(0,0,-.03,.05,.03,.06,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
  daTorch:{parts:[Pt(0,0,-.1,.035,.035,.24,'steel'),Pt(0,0,-.25,.022,.022,.08,'brass'),Pt(0,-.04,.02,.03,.08,.03,'blk2')],grip:[0,0,0],muzzle:[0,0,-.3]},
  // the plate he holds in front of him in phase 1 (a cabin door's steel, welded seams, a slit to look through, a hazard band, bolts)
  daPlate:{parts:[Pt(0,0,0,.66,.9,.04,'gunmetal'),Pt(0,.3,-.024,.36,.045,.012,'blk'),Pt(-.17,-.06,-.023,.025,.62,.01,'steel'),Pt(.19,-.04,-.023,.025,.58,.01,'steel'),
    Pt(0,-.1,-.023,.58,.025,.01,'steel'),Pt(0,-.39,-.025,.62,.07,.012,'yellow'),...[[-1,1],[1,1],[-1,-1],[1,-1]].map(([u,v])=>Pt(u*.28,v*.4,-.026,.035,.035,.014,'steel')),
    Pt(0,.05,.03,.08,.3,.03,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  // the wings: a frame across his back, a rotor blade each side (FERRY 06's spares, the yellow tips), the tarp lashed between blade and frame
  daWings:{parts:[Pt(0,0,0,.7,.08,.08,'gunmetal'),Pt(0,-.25,.02,.06,.5,.06,'gunmetal'),...[-1,1].flatMap(s=>[Pt(s*2.25,.04,0,3.9,.05,.4,'chRotor'),Pt(s*4.05,.045,0,.32,.055,.41,'yellow'),
    Pt(s*1.55,-.02,.32,2.7,.02,.62,'daTarp',{rz:s*.05}),Pt(s*.9,-.2,.18,.05,.45,.05,'chRope',{rz:s*.7}),Pt(s*2.8,-.03,.62,.05,.05,.05,'chRope')])],grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: the nail gun, a sentry's servos, a Static's crackle, a strike right overhead, the radar spinning up, the cable car's chime ----------
Object.assign(SFX,{
  danail:{n:3,dur:.5,ch:2,peak:.85,gain:.75,rev:.15,poly:8,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.002,1,.05,out);B.nz('white',0,.07,B.f('bandpass',2200+v*300,1.2,e))}
    {const e=B.env(0,.003,.9,.09,out);B.osc('sine',180,60,0,.12,e)}{const e=B.env(.01,.004,.4,.12,out);B.nz('pink',.01,.14,B.f('highpass',3000,.7,e))}}},
  daservo:{n:2,dur:.7,ch:1,peak:.7,gain:.5,rev:.1,poly:4,fn:(B,v)=>{const out=B.g(.9);const e=B.env(0,.03,.6,.1,out,.45);const f=B.f('bandpass',1400,4,e);B.sweep(f,900+v*200,2200,0,.55);B.osc('sawtooth',220,330,0,.6,f)}},
  dazap:{n:3,dur:.8,ch:2,peak:.8,gain:.7,rev:.2,poly:6,fn:(B,v)=>{const out=B.g(.9);for(let i=0;i<26;i++){const t=Math.pow(Math.random(),1.3)*.6;B.grain(t,rr(2500,9000),rr(8,16),rr(.003,.012),rr(.3,.7)*(1-t),B.pan(rr(-.5,.5),out))}
    {const e=B.env(0,.01,.35,.4,out,.2);B.osc('sawtooth',120,118,0,.6,B.f('bandpass',600,1.5,e))}}},
  dastrike:{n:2,dur:4,ch:2,peak:.98,gain:.98,rev:.55,poly:2,fn:(B,v)=>{const out=B.comp(-10,6,.001,.3,B.g(.95));{const e=B.env(0,.001,1,.08,out);B.nz('white',0,.1,B.f('highpass',1200,.6,e))}
    {const e=B.env(0,.002,1,.35,out);B.nz('white',0,.4,B.f('bandpass',3500,.8,e))}{const e=B.env(.02,.05,.95,3.2,out,.3);B.nz('brown',.02,3.6,B.f('lowpass',260+v*60,.7,e))}
    {const e=B.env(0,.002,1,.6,out);B.osc('sine',70,30,0,.7,e)}for(let i=0;i<18;i++)B.grain(rr(0,.3),rr(1500,6000),rr(5,10),rr(.004,.02),rr(.3,.7),B.pan(rr(-.8,.8),out))}},
  daradar:{n:1,dur:1.6,ch:1,peak:.75,gain:.6,rev:.25,poly:1,fn:B=>{const out=B.g(.9);{const e=B.env(0,.3,.7,.3,out,1);B.osc('sine',220,880,0,1.5,e)}{const e=B.env(0,.3,.35,.3,out,1);B.osc('square',110,440,0,1.5,B.f('lowpass',1600,.8,e))}
    {const e=B.env(.9,.05,.5,.5,out,.2);B.osc('sine',1320,1320,.9,.7,e)}}},
  dachime:{n:1,dur:1.2,ch:1,peak:.7,gain:.5,rev:.3,poly:1,fn:B=>{const out=B.g(.9);for(const [t,f] of [[0,880],[.32,660]]){const e=B.env(t,.005,.7,.6,out);B.osc('sine',f,f,t,.7,e);const e2=B.env(t,.005,.2,.3,out);B.osc('sine',f*2,f*2,t,.4,e2)}}}});
SFX_ORDER.push('danail','daservo','dazap','dastrike','daradar','dachime');

// ---------- the cable car (every page) ----------
// At the valley dock until the team boards, up the cable in the ride, at the summit dock after (the escape's end). At the docks its boxes are
// the map's (mapep9.js: e9carBoxes); on the move a copy rides with it in the world grid (dynamic boxes, the doors shut) and whoever is
// inside is carried along — every page its own player, the host its bots too; the rest are drawn where the car is (netPuppet's hook).
// The ride (26 s): the doors close, 9 s up to the pylon, a strike on it stops the car for 3 s, then on to the summit.
const _e9p=[0,0,0],_e9q=[0,0,0];
const E9CAR={g:null,cab:null,mat:null,doors:[],glassM:null,lamp:null,boxes:[],dyn:false,mode:'',s:0,t:0,dk:1,x:0,y:.25,z:150,v:0,sw:0,swV:0,swZ:0,swZV:0,
  RIDE:26,L:0,SST:0,pyl:0,segs:null,fxS:0,pT:0,
  SLOTS:[[-1.15,-.5],[-.4,-.5],[.4,-.5],[1.15,-.5],[-1.15,.5],[-.4,.5],[.4,.5],[1.15,.5]],
  init(){if(this.segs)return true;const C=MAP.ez&&MAP.ez.car;if(!C)return false;let acc=0;this.segs=[];
    for(let k=0;k<C.path.length-1;k++){const [z0,y0]=C.path[k],[z1,y1]=C.path[k+1],l=Math.hypot(z1-z0,y1-y0);this.segs.push({z0,y0,z1,y1,l,a:acc});acc+=l}
    this.L=acc;this.pyl=this.sOfZ(104);this.SST=this.pyl-2;return true},
  sOfZ(z){for(const S of this.segs)if((z-S.z0)*(z-S.z1)<=0)return S.a+S.l*(z-S.z0)/(S.z1-S.z0);return 0},
  at(s,out){s=clamp(s,0,this.L);for(const S of this.segs)if(s<=S.a+S.l+1e-6){const u=(s-S.a)/S.l;out[0]=0;out[1]=lerp(S.y0,S.y1,u);out[2]=lerp(S.z0,S.z1,u);return out}
    const S=this.segs[this.segs.length-1];out[0]=0;out[1]=S.y1;out[2]=S.z1;return out},
  // how far up the cable at ride time t: 1.5 s for the doors, eased up to the stop short of the pylon (9 s), 3 s stopped, eased on to
  // the summit (11.5 s); and the ending's way back down
  sAt(t){const S1=this.SST,v1=S1/8,D2=this.L-S1,v2=D2/9.25;if(t<1.5)return 0;
    if(t<10.5){const u=t-1.5;return u<2?v1*u*u/4:Math.min(S1,v1*(u-1))}if(t<13.5)return S1;
    const u=t-13.5;if(u<2)return S1+v2*u*u/4;if(u<9)return S1+v2*(u-1);if(u<11.5){const w=u-9;return S1+v2*8+v2*(w-w*w/5)}return this.L},
  sDown(t){const u=t-1.4;return u<=0?0:u<3?5*u*u/6:5*(u-1.5)},
  sOf(M,t){return M==='ride'?this.sAt(t):M==='down'?Math.max(0,this.L-this.sDown(t)):M==='valley'?0:this.L},
  want(){if(!on9()||!MAP.ez||!MAP.ez.car)return '';if(this.mode==='down')return 'down';if(EP.ph==='ride')return 'ride';return EP.st<=1?'valley':'summit'},
  slot(i){return this.SLOTS[i%this.SLOTS.length]},
  // inside the cabin (where it stands now)
  inside(h,pad){pad=pad||0;const c=h.c;return Math.abs(c.x-this.x)<1.62+pad&&Math.abs(c.z-this.z)<1.12+pad&&c.y>this.y-.5&&c.y<this.y+2.4},
  update(dt){const M=this.want();if(!M){if(this.g&&this.g.visible)this.hide();return}if(!this.init())return;if(!this.g)this.build();this.g.visible=true;
    if(M!==this.mode)this.enter(M);
    if(M==='ride'){this.t+=dt;if(NET.cli&&EP.t>0){const tt=this.RIDE-EP.t;if(Math.abs(tt-this.t)>.8)this.t=tt}this.dk=clamp(1-(this.t-.3),0,1)}
    else if(M==='down'){this.t+=dt;this.dk=clamp(1-(this.t-.2),0,1)}else this.dk=approach(this.dk,1,dt*1.1);
    this.moveTo(this.sOf(M,this.t),dt);this.fx(dt,M)},
  enter(M){this.mode=M;this.fxS=0;if(M==='ride'||M==='down'){this.t=M==='ride'&&NET.cli&&EP.t>0&&EP.t<this.RIDE-.5?this.RIDE-EP.t:0;this.at(this.sOf(M,this.t),_e9p);this.x=_e9p[0];this.y=_e9p[1];this.z=_e9p[2];this.dynOn()}
    else{this.dynOff();this.t=0}},
  depart(){if(!this.init())return;this.mode='down';this.enter('down')},
  moveTo(s,dt){const p=this.at(s,_e9p),dx=p[0]-this.x,dy=p[1]-this.y,dz=p[2]-this.z;
    if(this.dyn&&(dx||dy||dz))this.carry(dx,dy,dz);this.x=p[0];this.y=p[1];this.z=p[2];this.s=s;if(this.dyn)this.place();
    // the cabin swings on its hanger: kicked along the line by the speed changing, across it by the wind
    const v=Math.hypot(dx,dy,dz)/Math.max(dt,1e-3),acc=clamp((v-this.v)/Math.max(dt,1e-3),-40,40);this.v=v;
    this.swV+=(acc*.006-this.sw*6)*dt;this.swV*=Math.exp(-dt*.9);this.sw=clamp(this.sw+this.swV*dt,-.2,.2);
    const wind=this.mode==='ride'||this.mode==='down'?1:.15;this.swZV+=(-this.swZ*5+(Math.sin(G.t*.7)*.025+(Math.random()-.5)*.05)*wind)*dt;this.swZV*=Math.exp(-dt*1.2);this.swZ=clamp(this.swZ+this.swZV*dt,-.1,.1);
    this.pose()},
  // everyone this page moves itself, inside the car: along with it
  carry(dx,dy,dz){const x=this.x,y=this.y,z=this.z;for(const a of G.actors){if(!a.alive||a.pup)continue;const c=a.c;
      if(Math.abs(c.x-x)<1.75&&Math.abs(c.z-z)<1.25&&c.y>y-.6&&c.y<y+2.6){c.x+=dx;c.y+=dy;c.z+=dz}}},
  // (another page's player or bot riding: drawn in the car where this page has it, not where the delayed samples put it)
  pup(a){const c=a.c,p=this.at(this.sOf(this.mode,this.t-NET_DELAY/1000),_e9q),lx=c.x-p[0],ly=c.y-p[1],lz=c.z-p[2];if(Math.abs(lx)>3||Math.abs(lz)>3||ly<-2||ly>4)return;
    c.x=this.x+clamp(lx,-1.3,1.3);c.y=this.y+clamp(ly,0,1.2);c.z=this.z+clamp(lz,-.8,.8);c.onGround=ly<.2},
  dynOn(){if(!this.boxes.length){e9carBoxes(0,0,(x0,y0,z0,x1,y1,z1,o)=>{this.boxes.push({l:[x0,y0,z0,x1,y1,z1],x0,y0,z0,x1,y1,z1,mat:'metalx',o:Object.assign({e9car:1},o)})});
      for(const s of [-1,1]){const x0=s<0?-1.7:1.62,x1=s<0?-1.62:1.7;this.boxes.push({l:[x0,0,-.9,x1,1,.9],x0,y0:0,z0:-.9,x1,y1:1,z1:.9,door:1,mat:'metalx',o:{e9car:1}},{l:[x0,1,-.9,x1,2.1,.9],x0,y0:1,z0:-.9,x1,y1:2.1,z1:.9,door:1,mat:'metalx',o:{e9car:1,pass:1}})}}
    this.dyn=true;this.place()},
  dynOff(){if(!this.dyn)return;this.dyn=false;for(const b of this.boxes)worldRemoveDyn(b)},
  place(){const x=this.x,y=this.y,z=this.z,shut=this.dk<.5;for(const b of this.boxes){worldRemoveDyn(b);if(b.door&&!shut)continue;const L=b.l;b.x0=x+L[0];b.y0=y+L[1];b.z0=z+L[2];b.x1=x+L[3];b.y1=y+L[4];b.z1=z+L[5];worldAddDyn(b)}},
  build(){const g=new THREE.Group(),cab=new THREE.Group();cab.position.y=-4.1;g.add(cab);const mat=matGun();this.mat=mat;
    const body=new THREE.Mesh(gunGeo('daCar'),mat);body.frustumCulled=false;cab.add(body);
    this.doors=[];for(const s of [-1,1])for(const h of [-1,1]){const m=new THREE.Mesh(gunGeo('daDoor'),mat);m.frustumCulled=false;if(s>0)m.rotation.y=Math.PI;cab.add(m);this.doors.push({m,s,h})}
    // the glass: see-through panes in the window band (the ends, beside the doors, the doors' own)
    const gl=new THREE.MeshBasicMaterial({color:0x9ab8c8,transparent:true,opacity:.13,depthWrite:false});this.glassM=gl;
    const pane=(par,x,y,z,w,h,d)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),gl);m.position.set(x,y,z);m.renderOrder=2;par.add(m)};
    for(const s of [-1,1]){pane(cab,0,1.55,s*1.16,3.3,1.1,.02);pane(cab,s*1.66,1.55,-1.01,.02,1.1,.22);pane(cab,s*1.66,1.55,1.01,.02,1.1,.22)}
    for(const D of this.doors)pane(D.m,0,1.55,0,.02,1.1,.8);
    R.scene.add(g);this.g=g;this.cab=cab},
  pose(){const g=this.g;if(!g)return;g.position.set(this.x,this.y+4.1,this.z);g.rotation.set(this.sw,0,this.swZ);
    const o=smooth(this.dk);for(const D of this.doors)D.m.position.set(D.s*1.73,0,D.h*(.45+.75*o));
    this.pT-=.016;if(this.pT<=0){this.pT=.25;sampleProbe(this.x,this.y+1.4,this.z,this.mat.uniforms.uProbe.value)}},
  // the ride's moments on every page: the chime and the doors, the motor, the rollers on the pylon, the strike and the stop, the summit
  fx(dt,M){const L=this.lamp||(this.lamp=DL.add(this.x,this.y+2.2,this.z,'#ffd8a0',6,.9,0));L.x=this.x;L.y=this.y+2.25;L.z=this.z;
    const P=G.player,inP=!!(P&&P.alive&&this.inside(P,.3));
    if(M!=='ride'&&M!=='down'){L.c.set('#ffd8a0');L.i=.8;L.flick=0;return}
    const t=this.t,once=(b,f)=>{if(!(this.fxS&b)){this.fxS|=b;f()}};
    if(t>.3)once(1,()=>{AU.at('dachime',this.x,this.y+2,this.z,{vol:.9,range:40});AU.at('rack',this.x,this.y+1,this.z,{vol:.5,range:20,rate:.7})});
    if(t>1.5)once(2,()=>{AU.at('powerup',this.x,this.y+4,this.z,{vol:.7,range:60,rate:.6});if(inP)FX.shake=Math.max(FX.shake,.3)});
    if(M==='ride'){
      // the pylon: a strike on its arm as the car comes up to it, the lights go, the car stops dead and swings; backup power at 13.5 s
      if(t>10.5)once(4,()=>{E9STORM.bolt(.6,25.2,104,true);this.swV+=.9;if(inP){FX.shake=Math.max(FX.shake,1);AU.play('blackout',{vol:.8})}AU.at('chalarm',this.x,this.y+2,this.z,{vol:.6,range:30})});
      if(t>13.5)once(8,()=>{AU.at('powerup',this.x,this.y+4,this.z,{vol:.8,range:60,rate:.75});if(inP)FX.shake=Math.max(FX.shake,.4)});
      if(this.s>this.pyl-1.2)once(16,()=>{AU.at('land',this.x,this.y+4,this.z,{vol:.7,range:40,rate:.5});SCEN.later(.35,()=>AU.at('land',this.x,this.y+4,this.z,{vol:.6,range:40,rate:.55}));if(inP)FX.shake=Math.max(FX.shake,.35)});
      if(t>25)once(32,()=>{AU.at('land',this.x,this.y+3,this.z,{vol:.7,range:30,rate:.7});AU.at('dachime',this.x,this.y+2,this.z,{vol:.8,range:40})});
      const dark=t>10.5&&t<13.5;L.c.set(dark?'#ff3020':t>13.5?'#ffc070':'#ffd8a0');L.i=dark?(Math.random()<.3?.05:.5):.85;
      // (the motor's hum: a low creak now and then while it moves; the wind on the cabin)
      if(this.v>.5&&Math.random()<dt*.5)AU.at('land',this.x,this.y+4,this.z,{vol:.25,range:20,rate:.45});if(Math.random()<dt*.35)AU.at('salgust',this.x,this.y+2,this.z,{vol:.4,range:30,rate:.8})}
    if(inP&&this.v>.5)FX.shake=Math.max(FX.shake,.06+.04*Math.sin(G.t*11))},
  hide(){if(this.g)this.g.visible=false;this.dynOff();if(this.lamp){this.lamp.dead=true;this.lamp=null}this.mode=''},
  clear(){this.hide();this.mode='';this.t=0;this.s=0;this.dk=1;this.sw=this.swV=this.swZ=this.swZV=0;this.v=0;this.segs=null;this.boxes=[]}};

// ---------- the storm (every page): a strike's bolt, its flash and the crack right on top of it ----------
const E9STORM={L:[],geo:null,mat:null,
  init(){if(this.geo)return;this.geo=new THREE.BoxGeometry(1,1,1);this.geo.translate(0,0,.5);this.mat=new THREE.MeshBasicMaterial({color:0xd8ecff,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending})},
  // a jagged bolt from the cloud down to (x,y,z), a few branches off it (big: the thick one that finds a rod)
  bolt(x,y,z,big){this.init();const n=9,top=y+60,s0=[x+rr(-6,6),top,z+rr(-6,6)],pts=[s0];for(let i=1;i<n;i++){const u=i/n;pts.push([lerp(s0[0],x,u)+rr(-2.2,2.2)*(1-u),lerp(top,y,u),lerp(s0[2],z,u)+rr(-2.2,2.2)*(1-u)])}pts.push([x,y,z]);
    const segs=[],seg=(a,b,w)=>{const m=new THREE.Mesh(this.geo,this.mat.clone());m.position.set(a[0],a[1],a[2]);m.lookAt(b[0],b[1],b[2]);m.scale.set(w,w,Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]));m.frustumCulled=false;m.renderOrder=6;R.scene.add(m);segs.push(m)};
    for(let i=0;i<pts.length-1;i++)seg(pts[i],pts[i+1],big?.34:.2);
    for(let k=0;k<3;k++){const a=pts[1+Math.floor(Math.random()*(n-3))];seg(a,[a[0]+rr(-5,5),a[1]-rr(4,9),a[2]+rr(-5,5)],.1)}
    this.L.push({segs,t:0,T:.42});if(typeof Main!=='undefined')Main.lightning=.7;DL.add(x,y+3,z,'#c8e0ff',big?46:34,big?5:3.6,.35);AU.at('dastrike',x,y+2,z,{vol:1,range:400,occ:false});
    for(let i=0;i<30;i++)FX.spawn({x,y:y+.2,z,vx:rr(-6,6),vy:rr(1,7),vz:rr(-6,6),life:rr(.3,.8),s0:.08,s1:.03,r:.8,g:.9,b:1,f:0,grav:9,add:1});
    const P=G.player;if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.y-y,P.c.z-z);if(d<26){FX.shake=Math.max(FX.shake,.9-d/30);if(AU.shock)AU.shock(.7-d/40)}}},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const B=this.L[i];B.t+=dt;const f=B.t>B.T?0:(Math.random()<.25?.3:1)*(1-B.t/B.T*.6);for(const m of B.segs)m.material.opacity=f;
      if(B.t>B.T){for(const m of B.segs){R.scene.remove(m);m.material.dispose()}this.L.splice(i,1)}}},
  clear(){for(const B of this.L)for(const m of B.segs){R.scene.remove(m);m.material.dispose()}this.L=[]}};

// ---------- the lightning rods (the boss stage's devices): hold E 3 s at a switch → armed 25 s; struck, they cool 20 s ----------
// st 0 ready, 1 armed, 2 cooling; p the hold so far, t the time left armed or cooling; sy the switch's floor. The host runs them; the boss
// snapshot carries them to the clients.
const E9ROD={L:[],T:3,ARM:25,CD:20,
  build(){this.clear();this.L=(MAP.ez&&MAP.ez.rods||[]).map(R=>Object.assign({st:0,p:0,t:0,lt:null,sy:R.dome?R.y-8:R.y},R))},
  near(R,h){return Math.abs(h.c.y-R.sy)<1.8&&Math.hypot(h.c.x-R.bx,h.c.z-R.bz)<1.5},
  hostTick(dt){for(const R of this.L){if(R.st===1){R.t-=dt;if(R.t<=0){R.st=0;R.t=0;R.p=0;DAED.fx({k:'rx',i:R.i})}continue}
      if(R.st===2){R.t-=dt;if(R.t<=0){R.st=0;R.t=0}continue}
      let h=0;for(const a of SCEN.H)if(a.alive&&a.epUse===100+R.i&&G.t>=(a.useBlk||0)&&this.near(R,a))h++;
      if(h){R.p=Math.min(this.T,R.p+dt*(h>1?1.25:1));if(R.p>=this.T){R.st=1;R.t=this.ARM;R.p=0;DAED.armed(R)}}else R.p=Math.max(0,R.p-dt*.5)}},
  pack(){return this.L.map(R=>[R.st,Math.round(R.p*10),Math.round(R.t)])},
  sync(A){if(!Array.isArray(A))return;A.forEach((q,i)=>{const R=this.L[i];if(R&&Array.isArray(q)){R.st=q[0]|0;R.p=(q[1]|0)/10;R.t=q[2]|0}})},
  // every page: an armed rod's tip crackles blue and lights the snow round it
  update(dt){for(const R of this.L){const on=R.st===1;if(on&&!R.lt)R.lt=DL.add(R.x,R.top,R.z,'#7ab8ff',10,1.5,0,{flick:.5});if(!on&&R.lt){R.lt.dead=true;R.lt=null}
      if(on&&Math.random()<dt*16)FX.spawn({x:R.x+rr(-.2,.2),y:R.top+rr(-.5,.2),z:R.z+rr(-.2,.2),vx:rr(-1.5,1.5),vy:rr(-.5,1.5),vz:rr(-1.5,1.5),life:rr(.1,.25),s0:.06,s1:.02,r:.6,g:.85,b:1,f:0,add:1})}},
  clear(){for(const R of this.L)if(R.lt){R.lt.dead=true;R.lt=null}this.L=[]}};

// ---------- mines (DAEDALUS tosses them): the host decides, every page draws ----------
// st 0 in the air, 1 arming (1.2 s), 2 live, 3 set off (.35 s, then the blast). A shot sets one off at once (its box: o.eh {k:'mine'}).
const E9MINE={L:[],id:0,MAX:5,
  toss(x,y,z,tx,ty,tz,T,id,remote){const m=new THREE.Mesh(gunGeo('daMine'),matGun());m.frustumCulled=false;m.position.set(x,y,z);R.scene.add(m);
    const M={id:id||++this.id,x0:x,y0:y,z0:z,x:tx,y:ty,z:tz,T,t:0,st:0,m,box:null,blink:0};this.L.push(M);
    if(NET.host&&!remote)DAED.fxSend({k:'mn',id:M.id,a:[r2(x),r2(y),r2(z),r2(tx),r2(ty),r2(tz)],T:r2(T)});
    // (too many about: the oldest fizzles out)
    if(!NET.cli){const live=this.L.filter(q=>q.st<3);while(live.length>this.MAX)this.kill(live.shift(),0)}return M},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const M=this.L[i];if(!M.m.parent){this.L.splice(i,1);continue}M.t+=dt;const m=M.m;
      if(M.st===0){const u=Math.min(1,M.t/M.T);m.position.set(lerp(M.x0,M.x,u),lerp(M.y0,M.y,u)+6.4*u*(1-u),lerp(M.z0,M.z,u));m.rotation.y+=dt*9;m.rotation.x=Math.sin(M.t*7)*.6;
        if(u>=1){M.st=1;M.t=0;m.position.set(M.x,M.y,M.z);m.rotation.set(0,Math.random()*TAU,0);AU.at('land',M.x,M.y,M.z,{vol:.45,range:25,rate:1.7});
          M.box={x0:M.x-.17,y0:M.y,z0:M.z-.17,x1:M.x+.17,y1:M.y+.1,z1:M.z+.17,mat:'metalx',o:{eh:{k:'mine',i:M.id}}};worldAddDyn(M.box)}}
      else if(M.st===1){if(M.t>=1.2){M.st=2;M.t=0;AU.at('beep2',M.x,M.y,M.z,{vol:.4,range:16,rate:1.4})}}
      else if(M.st===3){M.blink-=dt;if(M.blink<=0){M.blink=.09;AU.at('beep2',M.x,M.y,M.z,{vol:.6,range:22,rate:2})}}
      // the lamp: blinking while it arms, a slow pulse once live, flickering fast when it goes
      const on=M.st===1?Math.sin(M.t*14)>0:M.st===2?Math.sin(G.t*3+M.id)>-.5:M.st===3?Math.sin(G.t*45)>0:false;
      if(M.st===0||(G.t*10+M.id)%3<1)sampleProbe(m.position.x,m.position.y+.3,m.position.z,m.material.uniforms.uProbe.value);m.material.uniforms.uEmisA.value=on?1.5:.12;
      if(NET.cli)continue;
      if(M.st===2){if(M.t>30){this.kill(M,0);continue}for(const h of SCEN.H){if(!h.alive||h.c.y<M.y-.6||h.c.y>M.y+.9)continue;if(Math.hypot(h.c.x-M.x,h.c.z-M.z)<1.6){this.trig(M);break}}}
      else if(M.st===3&&M.t>=.35)this.boom(M)}},
  trig(M,remote){M.st=3;M.t=0;M.blink=0;if(!remote)TELE.add({k:'c',x:M.x,y:M.y,z:M.z,r:2.4,d:.35});if(NET.host&&!remote)DAED.fxSend({k:'mt',id:M.id})},
  // the blast: 34 and knocked flat within 2.4 m (in sight of it)
  boom(M){if(!NET.cli){const b=EP.bossA();for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-M.x,h.c.z-M.z);if(d>2.4||Math.abs(h.c.y-M.y)>2)continue;if(!losClear(M.x,M.y+.3,M.z,h.c.x,h.c.y+1,h.c.z))continue;
        const f=1-d/2.4;hurtHuman(h,EPD(34*(.4+.6*f)),b&&b.alive?b:null,{});epFx(h,'kd',.9);SCEN.pushHuman(h,(h.c.x-M.x)/(d||1)*6*f,3+2*f,(h.c.z-M.z)/(d||1)*6*f)}
      DAED.fxSend({k:'mx',id:M.id})}
    this.blast(M);this.remove(M)},
  blast(M){FX.explode(M.x,M.y+.2,M.z,'he');AU.at('explode',M.x,M.y,M.z,{vol:.9,range:80,occ:false,rate:1.2});const P=G.player;if(P){const d=Math.hypot(P.c.x-M.x,P.c.z-M.z);if(d<10)FX.shake=Math.max(FX.shake,.7-d/14)}},
  kill(M,shot){if(shot){this.boom(M);return}DAED.fxSend({k:'mr',id:M.id});this.remove(M)},
  remove(M){const i=this.L.indexOf(M);if(i>=0)this.L.splice(i,1);if(M.box){worldRemoveDyn(M.box);M.box=null}R.scene.remove(M.m);M.m.material.dispose()},
  byId(id){return this.L.find(M=>M.id===id)||null},
  near(x,y,z,r){for(const M of this.L)if(M.st>=1&&Math.abs(M.y-y)<1.5&&Math.hypot(M.x-x,M.z-z)<r)return M;return null},
  clear(){for(const M of this.L.slice())this.remove(M);this.L=[]}};

// ---------- the maze's tripwires: a red beam at shin height from a claymore to the far wall; walk through it and .7 s later the claymore
// goes (30 and knocked flat within 3 m). Jump it, or shoot the claymore first. The host decides; every page draws ----------
const E9TRIP={L:[],
  build(){this.clear();const W=MAP.ez&&MAP.ez.trip||[],Y=E9Y;ELAS.init();
    for(let i=0;i<W.length;i++){const [x0,z0,x1,z1]=W[i],T={i,x0,z0,x1,z1,y:Y,st:0,t:0};
      const cm=new THREE.Mesh(gunGeo('daClay'),matGun());cm.position.set(x0,Y,z0);cm.rotation.y=Math.atan2(-(x1-x0),-(z1-z0));R.scene.add(cm);sampleProbe(x0,Y+.5,z0,cm.material.uniforms.uProbe.value);T.cm=cm;
      const bm=new THREE.Mesh(ELAS.geo,new THREE.MeshBasicMaterial({color:0xff2a14,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));
      bm.position.set(x0,Y+.3,z0);bm.lookAt(x1,Y+.3,z1);bm.scale.set(.025,.025,Math.hypot(x1-x0,z1-z0));bm.frustumCulled=false;bm.renderOrder=4;R.scene.add(bm);T.bm=bm;
      T.box={x0:x0-.15,y0:Y,z0:z0-.15,x1:x0+.15,y1:Y+.32,z1:z0+.15,mat:'metalx',o:{eh:{k:'trip',i}}};worldAddDyn(T.box);this.L.push(T)}},
  // a point's distance from a wire (on the floor plan)
  dist(T,x,z){const dx=T.x1-T.x0,dz=T.z1-T.z0,l=dx*dx+dz*dz||1,u=clamp(((x-T.x0)*dx+(z-T.z0)*dz)/l,0,1);return Math.hypot(T.x0+dx*u-x,T.z0+dz*u-z)},
  hostTick(dt){for(const T of this.L){if(T.st===1){T.t-=dt;if(T.t<=0)this.boom(T);continue}if(T.st!==0)continue;
      for(const h of SCEN.H){if(!h.alive||h.c.y-T.y>.34||h.c.y<T.y-.5)continue;if(this.dist(T,h.c.x,h.c.z)<.32){this.trig(T);break}}}},
  trig(T,remote){T.st=1;T.t=.7;T.bm.visible=false;AU.at('beep2',T.x0,T.y+.3,T.z0,{vol:.9,range:30,rate:1.8});if(!remote){TELE.add({k:'c',x:T.x0,y:T.y,z:T.z0,r:3,d:.7});DAED.fxSend({k:'tw',i:T.i,s:1})}},
  boom(T,remote){if(T.st===2)return;T.st=2;if(T.box){worldRemoveDyn(T.box);T.box=null}// (its own box out of the way first: the blast's sight lines start inside it)
    if(!NET.cli){for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-T.x0,h.c.z-T.z0);if(d>3||Math.abs(h.c.y-T.y)>2)continue;if(!losClear(T.x0,T.y+.3,T.z0,h.c.x,h.c.y+1,h.c.z))continue;
        const f=1-d/3;hurtHuman(h,EPD(30*(.45+.55*f)),null,{});epFx(h,'kd',.7);SCEN.pushHuman(h,(h.c.x-T.x0)/(d||1)*6*f,3,(h.c.z-T.z0)/(d||1)*6*f)}
      if(!remote)DAED.fxSend({k:'tw',i:T.i,s:2})}
    FX.explode(T.x0,T.y+.3,T.z0,'he');AU.at('explode',T.x0,T.y,T.z0,{vol:.9,range:80,occ:false,rate:1.1});this.drop(T)},
  drop(T){if(T.cm){R.scene.remove(T.cm);T.cm.material.dispose();T.cm=null}if(T.bm){R.scene.remove(T.bm);T.bm.material.dispose();T.bm=null}if(T.box){worldRemoveDyn(T.box);T.box=null}},
  set(i,s){const T=this.L[i];if(!T||T.st>=s)return;if(s===1)this.trig(T,true);else this.boom(T,true)},
  update(dt){for(const T of this.L)if(T.st===0&&T.bm)T.bm.material.opacity=.45+.35*Math.abs(Math.sin(G.t*6+T.i))},
  // (a bot about to walk into a live one jumps it)
  ahead(a){const c=a.c;for(const T of this.L){if(T.st!==0)continue;if(this.dist(T,c.x,c.z)<.75&&Math.abs(c.y-T.y)<.4)return T}return null},
  clear(){for(const T of this.L)this.drop(T);this.L=[]}};

// ---------- the sentry guns (EPZ.sentry: actors that never move; the host runs their brains) ----------
// scan (sweeping its head; it sees ±70° of where it points) → lock (1 s, a laser sight on the mark) → fire (eight rounds, 6 each) → rest 2 s
const E9SENT={next:null,
  spawn(p,yaw,boss){this.next=boss?'b':'m';const a=SCEN.spawn('sentry',[p[0],p[1],p[2]]);this.next=null;if(!a)return null;a.yaw=yaw||0;if(a.se){a.se.yaw0=a.yaw;a.se.boss=!!boss}a.c.vx=a.c.vz=a.c.vy=0;return a},
  hpFor(){if(this.next==='b'){const H=SCEN.H.length,d=G.diff||0;return Math.round(400*(.6+.4*H)*SC_DIFF.hp[d])}return Math.round(700*SC_DIFF.hp[G.diff||0])},
  list(boss){return SCEN.Z.filter(a=>a.alive&&a.zc==='sentry'&&(boss==null||!!(a.se&&a.se.boss)===boss))},
  muz(a,out){out=out||_daV;return out.set(a.c.x-Math.sin(a.yaw)*.9,a.c.y+1.05,a.c.z-Math.cos(a.yaw)*.9)},
  find(a,m){const S=a.se;let best=null,bd=28;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d>bd||Math.abs(h.c.y-a.c.y)>12)continue;
      if(d>4&&!(S&&S.hb===h&&G.t-S.hbT<3)&&Math.abs(daAng(a.yaw,daYaw(h.c.x-a.c.x,h.c.z-a.c.z)))>1.22)continue;
      if(ESMK.at(h.c.x,h.c.z,0)||ESMK.blocks(a.c.x,a.c.z,h.c.x,h.c.z))continue;if(!losClear(m.x,m.y,m.z,h.c.x,h.c.y+1.25,h.c.z))continue;bd=d;best=h}return best},
  face(a,h,k){const want=daYaw(h.c.x-a.c.x,h.c.z-a.c.z);a.yaw=wrapA(a.yaw+clamp(daAng(a.yaw,want),-k,k))},
  ai(a,dt){const S=a.se;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=false;a.staggerT=0;a.frozen=0;a.c.vx=a.c.vz=0;a.kvx=a.kvz=0;
    if(S.rep>0){S.rep-=dt;return true}// (DAEDALUS is welding it: it waits)
    S.life-=dt;if(S.life<=0&&S.st!=='empty'){S.st='empty';S.t=.6;ELAS.stop(a)}// (his: 30 s of battery at most)
    const m=this.muz(a);
    if(S.st==='scan'){S.sw+=dt*.8;const w=wrapA(S.yaw0+Math.sin(S.sw)*.75);a.yaw=wrapA(a.yaw+clamp(daAng(a.yaw,w),-dt*4,dt*4));S.t-=dt;if(S.t>0)return true;S.t=.25;const h=this.find(a,m);
      if(h){S.tg=h;S.st='lock';S.t=1*EPTW();S.lost=0;ELAS.add(a,h,S.t);DAED.fxSend({k:'sv',i:a.id})}}
    else if(S.st==='lock'){const h=S.tg;if(!h||!h.alive){this.drop(a,S);return true}this.face(a,h,dt*6);S.t-=dt;
      if(!losClear(m.x,m.y,m.z,h.c.x,h.c.y+1.25,h.c.z)){S.lost+=dt;if(S.lost>.45){this.drop(a,S);return true}}else S.lost=0;
      if(S.t<=0){S.st='fire';S.n=8;S.t=0;ELAS.stop(a)}}
    else if(S.st==='fire'){const h=S.tg;if(!h||!h.alive){S.st='rest';S.t=2;return true}this.face(a,h,dt*8);S.t-=dt;if(S.t>0)return true;S.t=.15;S.n--;
      const r=EBUL.shot(m.x,m.y,m.z,h.c.x,h.c.y+(h.duck?.9:1.25),h.c.z,.035,{dmg:S.boss||(G.diff||0)>=3?4:5,w:'m',src:a});if(S.n<=0){S.st='rest';S.t=2;if(--S.am<=0){S.st='empty';S.t=1.2}}
      // (a bot it hits turns on it, wherever it is: the shots tell it where)
      const B=r&&r.bot&&!r.pup?r.bot:null;if(B&&!(B.seen&&B.seen.a===a)&&!(B.seen&&B.seen.a.boss&&Math.random()<.5)){B.seen={a,t:G.t,ls:G.t};B.react=Math.min(B.react||.3,.3);B.aimT0=G.t}}
    else if(S.st==='rest'){S.t-=dt;if(S.t<=0){S.st='scan';S.t=.2;S.yaw0=a.yaw;S.sw=0}}
    else if(S.st==='empty'){S.t-=dt;if(S.t<=0){DAED.fx({k:'se0',i:a.id});EP.despawn(a)}}// (out of rounds: it fizzles and is gone)
    return true},
  drop(a,S){S.st='scan';S.t=.6;S.tg=null;S.yaw0=a.yaw;S.sw=0;ELAS.stop(a)},
  // every page: the tripod where it stands, the head turned its way, the laser's lamp
  rigX(ch){const mat=matGun(),g=new THREE.Group(),b=new THREE.Mesh(gunGeo('daSentB'),mat),h=new THREE.Mesh(gunGeo('daSentH'),mat);b.frustumCulled=h.frustumCulled=false;h.position.y=.95;g.add(b,h);R.scene.add(g);return {g,h,mat,pT:0}}};

// ---------- the radar (phase 2): from the dome, a red beam turns twice round the plaza; whoever it finds in the open burns (once a turn) ----------
const E9RAD={on:false,t:0,a0:0,dir:1,W:8,WU:1,hit:new Map(),m:null,
  build(){const N=12,R0=46,DY=-12,B=.17,pos=[];for(let i=0;i<N;i++){const b0=-B+2*B*i/N,b1=-B+2*B*(i+1)/N;pos.push(0,0,0,R0*Math.cos(b1),DY,R0*Math.sin(b1),R0*Math.cos(b0),DY,R0*Math.sin(b0))}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff3a1a,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.frustumCulled=false;m.renderOrder=5;
    const core=new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(.5,0,0),new THREE.MeshBasicMaterial({color:0xff6a3a,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));
    core.scale.set(Math.hypot(R0,DY),.08,.08);core.rotation.z=Math.atan2(DY,R0);m.add(core);R.scene.add(m);this.m=m},
  start(a0,dir,remote){const D=MAP.ez.dome;this.on=true;this.t=0;this.a0=a0;this.dir=dir;this.hit.clear();if(!this.m)this.build();this.m.visible=true;
    AU.at('daradar',D.x,D.y,D.z,{vol:1,range:140,occ:false});if(NET.host&&!remote)DAED.fxSend({k:'rd',a:r3(a0),d:dir})},
  ang(){return this.a0+this.dir*Math.max(0,this.t-this.WU)*(4*Math.PI/this.W)},
  update(dt){if(!this.on)return;this.t+=dt;const D=MAP.ez.dome,m=this.m;m.position.set(D.x,D.y,D.z);m.rotation.y=-this.ang();
    const k=this.t<this.WU?.4+.3*Math.sin(this.t*30):1;m.material.opacity=.2*k;m.children[0].material.opacity=.6*k;
    if(Math.random()<dt*6)AU.at('hiss',D.x,D.y,D.z,{vol:.3,range:60,rate:.6});
    if(!NET.cli&&this.t>=this.WU)this.hostHit();if(this.t>=this.WU+this.W)this.stop()},
  // (seen from just outside the dome, 2 m up off the catwalk: under the catwalk, behind the tower, crouched behind something solid is safe)
  hostHit(){const D=MAP.ez.dome,th=this.ang(),b=EP.bossA();for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-D.x,dz=h.c.z-D.z,d=Math.hypot(dx,dz);if(d<9||d>48)continue;
      if(Math.abs(wrapA(Math.atan2(dz,dx)-th))>.17)continue;if(G.t-(this.hit.get(h)||-9)<1.6)continue;const ox=D.x+dx/d*9.4,oz=D.z+dz/d*9.4,oy=D.cat+2;
      const y1=h.duck?.75:1.2,y2=h.duck?1.05:1.7;if(!losClear(ox,oy,oz,h.c.x,h.c.y+y1,h.c.z)&&!losClear(ox,oy,oz,h.c.x,h.c.y+y2,h.c.z))continue;this.hit.set(h,G.t);hurtHuman(h,EPD(12),b&&b.alive?b:null,{});epFx(h,'dz',.5)}},
  // where the beam will be in dt seconds (the bots duck when it is about to reach them)
  soon(x,z,dt){if(!this.on)return false;const D=MAP.ez.dome,th=this.ang(),ph=Math.atan2(z-D.z,x-D.x),w=this.dir*daAng(th,ph);return w>-.17&&w<(4*Math.PI/this.W)*dt},
  stop(){this.on=false;if(this.m)this.m.visible=false},
  clear(){this.stop();if(this.m){R.scene.remove(this.m);this.m=null}}};

// ---------- DAEDALUS ----------
const DAED={cur:null,said:{},sayT:{},encNext:false,dutyT:0,dutyD:null,stormT:14,ammoT:null,escT:0,
  zc:'daedalus',name:['다이달로스','DAEDALUS'],code:'RT1-04',ticks:[70,30],
  wake:['다이달로스가 기다린다 —','DAEDALUS is waiting —'],goText:['다이달로스의 작업장','DAEDALUS\'S WORKSHOP'],deadText:['다이달로스 무력화','DAEDALUS IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(26000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.dd&&a.dd.enc)},
  fx(m){this.fxApply(m);if(NET.host)netEv('e9',m)},
  fxSend(m){if(NET.host)netEv('e9',m)},
  sayOnce(k){if(this.said[k])return;this.said[k]=1;EP.say(k)},
  sayEvery(k,t){if(G.t-(this.sayT[k]||-99)<t)return;this.sayT[k]=G.t;EP.say(k)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: at his workshop by the west shed (a replay starts the phase it reached)
  prepSpawn(kind,bp){let b=EP.bossA();const p=MAP.ez.dEnter;if(!b)b=this.spawn(p,Math.PI,false);else if(kind!=='phase'){this.init(b,false);placeAt(b,p[0],p[1],p[2],Math.PI)}if(!b)return;
    if(kind==='phase')this.reset(b,bp);b.dd.idle=true},
  go(b){const S=b.dd;if(!S)return;S.idle=false;S.pt=1;Object.assign(S.cd,{sent:2.5,nail:5,mine:8,rep:9,radar:4,swoop:3});this.stormT=14;this.ammoT=10},
  // the first meeting (stage 2): on top of the stacked containers in the middle of the maze; away north when he has had enough
  meetStart(E){const M=MAP.ez.dMeet,a=this.spawn(M.p,M.yaw,true);if(!a)return;E.a=a;const S=a.dd;S.idle=false;Object.assign(S.cd,{nail:5,mine:9});
    this.fx({k:'meet',i:a.id});EP.say('enc');EP.later(3.2,()=>EP.say('enc2'));EP.later(7,()=>EP.say('dMeet'))},
  meetTick(E,dt){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.dd)this.retreat(E.a)},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='daedalus';a.deadT=99;this.encNext=!!enc;reviveZombie(a,[p[0],p[1],p[2]]);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){a.dd={ph:1,mode:'',mt:0,pt:1,enc:!!enc,idle:!enc,invT:0,enr:false,fightT:0,grog:0,grogN:0,grogMax:100,slowT:0,dmgW:0,dmgWT:0,encT:0,downQ:0,
      high:false,wings:false,air:false,perch:-1,gndT:0,upT:0,cov:null,covT:0,goT:0,tg:null,plate:!enc,hopQ:0,
      cd:{sent:6,nail:4,mine:7,rep:9,torch:2,radar:5,swoop:3},st:null,nl:null,mn:null,tc:null,sw:null,rp:null,fl:null};
    a.ddPose='';a.epDown=0;a.kin=null;a.epHide=false},
  // a replay of the boss fight starts the phase it reached again, at that phase's health
  reset(a,ph){a.hp=a.maxHp*DA_PH[ph-1];this.init(a,false);const S=a.dd,E=MAP.ez;S.ph=ph;S.idle=true;a.frozen=0;a.kvx=a.kvz=0;this.ammoT=6;
    if(ph===1){const p=E.dEnter;placeAt(a,p[0],p[1],p[2],Math.PI)}
    else{const p=E.cat[0];placeAt(a,p[0],p[1],p[2],Math.PI);S.high=true;if(ph===3){S.wings=true;S.air=true;S.perch=0;a.ddPose='perch'}}},
  // ---------- small helpers ----------
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=daYaw(x-a.c.x,z-a.c.z)},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}return n?[x/n,E9Y,z/n]:[0,E9Y,-40]},
  nearH(a,r,dy){let b=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<(dy||1.6)){bd=d;b=h}}return b},
  gun(a,out){out=out||_daV2;return out.set(a.c.x-Math.sin(a.yaw)*.4,a.c.y+1.55*DA_S,a.c.z-Math.cos(a.yaw)*.4)},
  // whoever he can see (the ones at a rod's switch first: they frighten him most), then the nearest
  target(a,r){const e=this.gun(a);let best=null,bs=1e9;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d>r)continue;
      if(!losClear(e.x,e.y,e.z,h.c.x,h.c.y+1.2,h.c.z))continue;let s=d;if(h.epUse>=100&&h.epUse<=103)s-=8;if(h===a.dd.tg)s-=3;if(s<bs){bs=s;best=h}}a.dd.tg=best;return best},
  onCat(h){const D=MAP.ez.dome,r=D.ring;return h.c.y>D.cat-.6&&h.c.y<D.cat+2&&h.c.x>r[0]-.3&&h.c.x<r[2]+.3&&h.c.z>r[1]-.3&&h.c.z<r[3]+.3},
  claw(a){const h=this.nearH(a,2.3);if(!h)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,10);AI.moveDir(a,wx,wz)}a.spdMul=(S.enr?1.2:1)*(S.slowT>0?.6:1)*mul},
  sents(boss){return E9SENT.list(boss)},
  zN(){let n=0;for(const z of SCEN.Z)if(z.alive&&!z.boss&&z.zc!=='sentry')n++;return n},
  // ---------- host: the brain (EPZ.daedalus.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.dd;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;a.spdMul=S.enr?1.2:1;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.dmgWT-=dt;if(S.dmgWT<=0){S.dmgWT=4;S.dmgW=0}
    if(a.frozen>0){a.frozen=0;a.c.vx=a.c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=(EP.ph==='run'||S.enc)&&!S.idle&&S.mode!=='gone';if(live&&S.enc)S.encT+=dt;
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('dEnr')}}
    const cdm=S.enr?1/.7:1;if(live)for(const k in S.cd)S.cd[k]-=dt*cdm;
    if(!live){a.ddPose=S.air?'perch':'';return true}
    if(S.sw&&S.sw.on)this.swoopHit(a,S);
    if(a.kin)return true;// (a leap or a glide under way: epbase.js flies the body)
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(S.downQ){const t=S.downQ;S.downQ=0;this.down(a,t);return true}
    if(S.enc)this.pEnc(a,dt,S);else if(S.ph===1)this.p1(a,dt,S);else if(S.ph===2)this.p2(a,dt,S);else this.p3(a,dt,S);
    return true},
  // ---------- the first meeting: on the containers, nails and mines into the maze (the maze has its own sentries); away after 35 s ----------
  pEnc(a,dt,S){if(S.encT>35){this.retreat(a);return}a.ddPose='';if(this.claw(a))return;S.pt-=dt;if(S.pt>0)return;S.pt=.3;const t=this.target(a,36);if(!t)return;this.face(a,t.c.x,t.c.z);
    if(S.cd.nail<=0){S.cd.nail=6;this.nailStart(a,S,t);return}if(S.cd.mine<=0){S.cd.mine=9;this.mineStart(a,S,t)}},
  retreat(a){const S=a.dd;S.invT=99;this.clearPat(a,S);S.mode='ret';S.mt=4;EP.say('dRet');const p=MAP.ez.dMeet.out;a.ddPose='glide';epKin(a,p[0],p[1],p[2],1.7,4,b=>{b.ddPose='';EP.meetEnd(b)})},
  // ---------- phase 1 (and phase 2 when he has jumped down): cover to cover on the plaza ----------
  p1(a,dt,S){a.ddPose='';if(this.claw(a))return;S.pt-=dt;
    if(S.pt<=0){S.pt=.3;const t=this.target(a,34);
      if(t){const cap=S.ph>=2?0:2;// (sentries in phase 1 only: on the ground in phase 2 he fights with what he carries)
        if(S.cd.rep<=0){const q=this.repTarget(a,14);if(q){this.repStart(a,S,q);return}}
        if(S.cd.sent<=0&&this.sents(true).length<cap){S.cd.sent=S.enr?13:18;this.sentStart(a,S,t);return}
        if(S.cd.nail<=0&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<22){S.cd.nail=S.enr?5:7;this.nailStart(a,S,t);return}
        if(S.cd.mine<=0){S.cd.mine=S.enr?8:11;this.mineStart(a,S,t);return}}}
    S.covT-=dt;if(!S.cov||S.covT<=0){S.cov=this.pickCover(a);S.covT=rr(6,9)}
    if(S.cov){if(Math.hypot(S.cov[0]-a.c.x,S.cov[2]-a.c.z)>1.2)this.walk(a,dt,S,S.cov,1);else{const t=this.target(a,40);if(t)this.face(a,t.c.x,t.c.z)}}},
  // a cover point 10–16 m from the team: not by an armed rod, nobody right on it
  pickCover(a){const C=this.cen(),E=MAP.ez,L=E.cover.map(p=>{let s=Math.abs(Math.hypot(p[0]-C[0],p[2]-C[2])-13)+hash2(Math.round(p[0]),Math.round(p[2]),Math.floor(G.t/9))*5;
      for(const R of E9ROD.L)if(R.st===1&&!R.dome&&Math.hypot(p[0]-R.x,p[2]-R.z)<R.r+2)s+=30;for(const h of SCEN.H)if(h.alive&&Math.hypot(p[0]-h.c.x,p[2]-h.c.z)<6)s+=20;return [p,s]}).sort((p,q)=>p[1]-q[1]);
    return L.length?L[Math.floor(Math.random()*Math.min(3,L.length))][0]:null},
  // ---------- phase 2: up on the radome's catwalk ----------
  p2(a,dt,S){if(!S.high){S.gndT-=dt;if(S.gndT<=0&&!a.kin){this.climb(a,S,false);return}this.p1(a,dt,S);return}
    a.ddPose='';const up=SCEN.H.filter(h=>h.alive&&this.onCat(h));S.upT+=dt;
    // two of the team up here with him: down among the rest for a while; and every 22 s (enraged 17) anyway, when the radar is still
    if(up.length>=2&&!S.mode){this.dropDown(a,S,up);return}
    if(S.upT>(S.enr?14:18)&&!S.mode&&!E9RAD.on){this.dropDown(a,S,null);return}
    if(this.claw(a))return;
    const nb=this.nearH(a,5,1.5);if(nb&&S.cd.torch<=0){S.cd.torch=S.enr?3:4;this.torchStart(a,S,nb);return}
    this.radarTick(a,S);
    S.pt-=dt;if(S.pt<=0){S.pt=.3;const t=this.target(a,46);
      if(t){if(S.cd.rep<=0){const q=this.repTarget(a,9);if(q){this.repStart(a,S,q);return}}
        if(S.cd.nail<=0){S.cd.nail=S.enr?5:6.5;this.nailStart(a,S,t);return}
        if(S.cd.mine<=0){S.cd.mine=S.enr?10:13;this.mineStart(a,S,t);return}}}
    // round the catwalk to where he sees the most of them
    S.covT-=dt;if(!S.cov||S.covT<=0){S.covT=rr(5,8);const C=this.cen();let best=null,bs=-1;for(const p of MAP.ez.cat){let n=0;for(const h of SCEN.H)if(h.alive&&losClear(p[0],p[1]+1.7,p[2],h.c.x,h.c.y+1.2,h.c.z))n++;const s=n*10-Math.hypot(p[0]-C[0],p[2]-C[2])*.1+Math.random()*3;if(s>bs){bs=s;best=p}}S.cov=best}
    if(S.cov){if(Math.hypot(S.cov[0]-a.c.x,S.cov[2]-a.c.z)>1)this.walk(a,dt,S,S.cov,.9);else{const t=this.target(a,46);if(t)this.face(a,t.c.x,t.c.z)}}},
  radarTick(a,S){if(S.cd.radar>0||E9RAD.on)return;S.cd.radar=S.enr?13:17;const D=MAP.ez.dome,C=this.cen();E9RAD.start(Math.atan2(C[2]-D.z,C[0]-D.x)+Math.PI*.6*(Math.random()<.5?1:-1),Math.random()<.5?1:-1);this.sayEvery('dRadar',28)},
  // up onto the catwalk (the 70 % mark, or back from the plaza): a leap to the catwalk's nearest corner
  climb(a,S,first){this.clearPat(a,S);const c=a.c;let best=null,bd=1e9;for(const p of MAP.ez.cat){const d=Math.hypot(p[0]-c.x,p[2]-c.z);if(d<bd){bd=d;best=p}}
    S.mode='climb';S.mt=9;a.ddPose='glide';this.fx({k:'w',i:a.id,s:'jp'});epKin(a,best[0],best[1],best[2],Math.max(1.1,bd/9),4,b=>{const T=b.dd;if(!T)return;T.mode='';T.high=true;T.upT=0;T.cov=null;b.ddPose=''});if(!first)this.sayEvery('dUp',20)},
  // (away from those who came up; otherwise among the rest, about 11 m from the middle of them)
  dropDown(a,S,up){this.clearPat(a,S);const E=MAP.ez,C=this.cen();let best=null,bs=-1e9;for(const p of E.cover){const d=Math.hypot(p[0],p[2]-E.dome.z);if(d<12||d>22)continue;let s;
      if(up){s=1e9;for(const h of up)s=Math.min(s,Math.hypot(p[0]-h.c.x,p[2]-h.c.z))}else s=-Math.abs(Math.hypot(p[0]-C[0],p[2]-C[2])-11);s+=Math.random()*4;if(s>bs){bs=s;best=p}}
    if(!best)best=E.cover[0];S.mode='drop';S.mt=9;S.high=false;S.gndT=12;S.upT=0;a.ddPose='glide';this.fx({k:'w',i:a.id,s:'jp'});EP.say('dDrop');epKin(a,best[0],best[1],best[2],1.3,2,b=>{const T=b.dd;if(T){T.mode='';T.cov=null}b.ddPose=''})},
  // ---------- phase 3: perch to perch on the wings ----------
  p3(a,dt,S){if(!S.air){if(!a.kin)this.toPerch(a,S);return}
    a.ddPose='perch';S.pt-=dt;const t=this.target(a,48);if(t)this.face(a,t.c.x,t.c.z);
    if(S.hopQ&&S.pt<=0){S.hopQ=0;this.toPerch(a,S);return}// (after a volley from a perch, often off to the next one)
    if(S.cd.swoop<=0&&S.pt<=0){let sw=t&&this.swoopPlan(a,t);if(!sw)for(const h of SCEN.H){if(h===t||!h.alive)continue;sw=this.swoopPlan(a,h);if(sw)break}
      if(sw){S.cd.swoop=S.enr?3.5:4.5;this.swoopStart(a,S,sw);return}S.pt=.5;if(Math.random()<.3){this.toPerch(a,S);return}}
    if(t&&S.cd.nail<=0){S.cd.nail=S.enr?5:7;S.hopQ=Math.random()<.2?1:0;this.nailStart(a,S,t);return}
    if(t&&S.cd.mine<=0){S.cd.mine=S.enr?12:18;S.hopQ=Math.random()<.2?1:0;this.mineStart(a,S,t);return}},
  // the next perch: one he has not just left, nobody on it, 12–30 m from the team
  toPerch(a,S){const P=MAP.ez.perch,C=this.cen();let L=[];P.forEach((p,i)=>{if(i===S.perch)return;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-p[0],h.c.z-p[2])<4)return;
      const d=Math.hypot(p[0]-C[0],p[2]-C[2]);L.push([i,Math.abs(d-20)+Math.random()*8])});if(!L.length)P.forEach((p,i)=>{if(i!==S.perch)L.push([i,Math.random()])});L.sort((p,q)=>p[1]-q[1]);
    const i=L[0][0],p=P[i],d=Math.hypot(p[0]-a.c.x,p[2]-a.c.z);this.clearPat(a,S);S.mode='hop';S.mt=9;S.air=true;a.ddPose='glide';this.fx({k:'w',i:a.id,s:'fl'});
    epKin(a,p[0],p[1],p[2],clamp(.8+d/15,1,3),3+d*.08,b=>{const T=b.dd;if(!T)return;T.mode='';T.perch=i;T.pt=rr(2.5,4.5);b.ddPose='perch'})},
  // a swoop: from just below his perch (or a few metres out from it, off a deck or a platform), up to 26 m along the floor through (or
  // within 2 m of) the one he has picked — the line straight at them, or turned up to 17° either way, whichever is clear for 8 m and more
  // (shortened where it would hit something)
  swoopPlan(a,t){const Y=E9Y,dx=t.c.x-a.c.x,dz=t.c.z-a.c.z,d=Math.hypot(dx,dz);if(d<6||d>32||Math.abs(t.c.y-Y)>1.2)return null;const a0=Math.atan2(dz,dx);
    for(const o of [0,.15,-.15,.3,-.3]){const ux=Math.cos(a0+o),uz=Math.sin(a0+o);let n=navSnap(a.c.x+ux*1.5,Y,a.c.z+uz*1.5,2.5);if(!n||Math.abs(n.y-Y)>.6)n=navSnap(a.c.x+ux*5,Y,a.c.z+uz*5,3.5);if(!n||Math.abs(n.y-Y)>.6)continue;
      const h=rayCast(n.x,Y+1.3,n.z,ux,0,uz,26,SHOT_FILTER),L=h?h.t-.9:26;if(L<8)continue;const al=(t.c.x-n.x)*ux+(t.c.z-n.z)*uz,sd=Math.abs((t.c.x-n.x)*uz-(t.c.z-n.z)*ux);
      if(al<1||al>L||sd>2)continue;return {x:n.x,z:n.z,y:Y,yaw:daYaw(ux,uz),l:L,ux,uz}}return null},
  swoopStart(a,S,sw){const T=1.2*EPTW();TELE.add({k:'r',x:sw.x,y:sw.y,z:sw.z,yaw:sw.yaw,w:2.2,l:sw.l,d:T});S.sw=Object.assign(sw,{on:false,hit:new Set()});S.mode='swoop';S.mt=T;a.ddPose='perch';
    this.face(a,sw.x+sw.ux*5,sw.z+sw.uz*5);this.fx({k:'w',i:a.id,s:'sw'});this.sayEvery('dSwoop',16)},
  // the dive off the perch to the strip's start, then the glide along it at 20 m/s; the landing at its end (3.5 s, ×1.5)
  swoopGo(a,S){const W=S.sw;W.on=true;a.ddPose='glide';S.air=false;S.perch=-1;S.mode='glide';S.mt=9;
    epKin(a,W.x,W.y+1.1,W.z,.45,.4,b=>{const ex=W.x+W.ux*W.l,ez=W.z+W.uz*W.l;epKin(b,ex,W.y,ez,W.l/20,.15,c=>{W.on=false;const T=c.dd;if(!T)return;T.mode='land';T.mt=3.5;c.ddPose='land';DAED.fx({k:'ld',i:c.id});DAED.sayEvery('dLand',14)})})},
  swoopHit(a,S){const W=S.sw;for(const h of SCEN.H){if(!h.alive||W.hit.has(h))continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)>1.5||Math.abs(h.c.y-a.c.y)>2)continue;W.hit.add(h);
      hurtHuman(h,EPD(28),a,{});epFx(h,'kd',1);SCEN.pushHuman(h,W.ux*7,3.5,W.uz*7);this.fxSend({k:'swh',i:h.id})}},
  // ---------- the patterns (host) ----------
  sentStart(a,S,t){this.face(a,t.c.x,t.c.z);S.mode='sent';S.mt=1.4;a.ddPose='kneel';S.st={tg:t};this.fx({k:'w',i:a.id,s:'se'});this.sayEvery('dSent',22)},
  sentPut(a,S){const c=a.c,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),hull={hw:.42,h:1.25};let p=null;
    for(const [f,s] of [[1.5,0],[1.5,.9],[1.5,-.9],[1,1.3],[1,-1.3],[2.2,0]]){const x=c.x+fx*f+fz*s,z=c.z+fz*f-fx*s,y=floorBelow(x,c.y+1,z,.3);if(y<c.y-1.2||y>c.y+.6)continue;if(charFits(hull,x,y+.02,z)&&losClear(c.x,c.y+1,c.z,x,y+1,z)){p=[x,y+.02,z];break}}
    if(!p)return;const t=S.st&&S.st.tg,yaw=t?daYaw(t.c.x-p[0],t.c.z-p[2]):a.yaw;E9SENT.spawn(p,yaw,true)},
  nailStart(a,S,t){const T=.8*EPTW(),y0=daYaw(t.c.x-a.c.x,t.c.z-a.c.z),fy=Math.abs(t.c.y-a.c.y)<1.5?a.c.y:t.c.y;this.face(a,t.c.x,t.c.z);
    // (from up on the catwalk the strips start on the plaza below him)
    const st=[-.21,0,.21].map(o=>({x:a.c.x,y:fy,z:a.c.z,yaw:y0+o,w:1.2,l:18}));for(const q of st)TELE.add({k:'r',x:q.x,y:q.y,z:q.z,yaw:q.yaw,w:q.w,l:q.l,d:T});
    S.mode='nail';S.mt=T;S.nl={st,fired:false};a.ddPose='aim';this.fx({k:'w',i:a.id,s:'nl'});this.sayEvery('dNail',22)},
  nailFire(a,S){const N=S.nl;N.fired=true;const g=this.gun(a),hits=new Map();
    for(const q of N.st){const fx=-Math.sin(q.yaw),fz=-Math.cos(q.yaw),rx=Math.cos(q.yaw),rz=-Math.sin(q.yaw);
      for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-q.x,dz=h.c.z-q.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<0||al>q.l||Math.abs(sd)>q.w/2+.25)continue;
        if(!losClear(g.x,g.y,g.z,h.c.x,h.c.y+1.2,h.c.z))continue;hits.set(h,(hits.get(h)||0)+1)}}
    for(const [h,n] of hits){hurtHuman(h,EPD(16*n),a,{});if(n>=2){h.rootT=Math.max(h.rootT||0,.7);this.fxSend({k:'pin',i:h.id})}}
    this.fx({k:'nf',x:r2(g.x),y:r2(g.y),z:r2(g.z),a:N.st.map(q=>r3(q.yaw)),ty:r2(N.st[0].y)})},
  mineStart(a,S,t){this.face(a,t.c.x,t.c.z);S.mode='mine';S.mt=.75;S.mn={tg:t,n:0,x:t.c.x+t.c.vx*.5,z:t.c.z+t.c.vz*.5,y:t.c.y};a.ddPose='throw';this.fx({k:'w',i:a.id,s:'mn'});this.sayEvery('dMine',24)},
  mineThrow(a,S){const M=S.mn,k=M.n++,an=k*2.1+Math.random(),r=k?rr(1.6,2.6):rr(0,.8),x=M.x+Math.cos(an)*r,z=M.z+Math.sin(an)*r,n=navSnap(x,M.y,z,2.5);if(!n)return;
    const g=this.gun(a),d=Math.hypot(n.x-g.x,n.z-g.z);E9MINE.toss(g.x,g.y,g.z,n.x,n.y,n.z,clamp(d/15,.5,1.2))},
  torchStart(a,S,h){const T=.8*EPTW(),yaw=daYaw(h.c.x-a.c.x,h.c.z-a.c.z);this.face(a,h.c.x,h.c.z);TELE.add({k:'r',x:a.c.x,y:a.c.y,z:a.c.z,yaw,w:2.4,l:5.5,d:T});
    S.mode='torch';S.mt=T;S.tc={yaw,x:a.c.x,z:a.c.z,y:a.c.y};a.ddPose='weld';this.fx({k:'w',i:a.id,s:'tc'});this.sayEvery('dTorch',18)},
  torchFire(a,S){const Q=S.tc,fx=-Math.sin(Q.yaw),fz=-Math.cos(Q.yaw),rx=Math.cos(Q.yaw),rz=-Math.sin(Q.yaw);
    for(const h of SCEN.H){if(!h.alive||Math.abs(h.c.y-Q.y)>1.6)continue;const dx=h.c.x-Q.x,dz=h.c.z-Q.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<-.3||al>5.5||Math.abs(sd)>1.45)continue;hurtHuman(h,EPD(28),a,{});epFx(h,'dz',.6)}
    this.fx({k:'tf',x:r2(Q.x),y:r2(Q.y),z:r2(Q.z),yw:r3(Q.yaw)})},
  // a sentry of his that has taken a beating, close enough to get to: he walks over and welds it whole (2.4 s)
  repTarget(a,r){let best=null,bd=r;for(const s of this.sents(true)){if(s.hp>s.maxHp*.6||Math.abs(s.c.y-a.c.y)>1.5)continue;const d=Math.hypot(s.c.x-a.c.x,s.c.z-a.c.z);if(d<bd){bd=d;best=s}}return best},
  repStart(a,S,s){S.cd.rep=10;S.mode='repGo';S.mt=6;S.rp={s,d:0};a.ddPose=''},
  repBreak(a,S){const s=S.rp&&S.rp.s;if(s&&s.se)s.se.rep=0;S.rp=null;S.mode='';a.ddPose='';this.grog(a,30);this.fx({k:'rpx',i:a.id});EP.say('dRepX')},
  // the pattern under way
  step(a,dt,S){const m=S.mode;
    if(m==='sent'){if(S.mt<=0){this.sentPut(a,S);S.mode='';a.ddPose=''}return}
    if(m==='nail'){if(S.mt<=0){if(!S.nl.fired)this.nailFire(a,S);if(S.mt<=-.35){S.mode='';a.ddPose='';S.nl=null}}return}
    if(m==='mine'){const M=S.mn;if(S.mt<=.4&&M.n<1)this.mineThrow(a,S);if(S.mt<=.25&&M.n<2)this.mineThrow(a,S);if(S.mt<=.1&&M.n<3)this.mineThrow(a,S);if(S.mt<=0){S.mode='';a.ddPose='';S.mn=null}return}
    if(m==='torch'){if(S.mt<=0){if(S.tc){this.torchFire(a,S);S.tc=null}if(S.mt<=-.3){S.mode='';a.ddPose=''}}return}
    if(m==='repGo'){const s=S.rp&&S.rp.s;if(!s||!s.alive||S.mt<=0){S.mode='';S.rp=null;return}const d=Math.hypot(s.c.x-a.c.x,s.c.z-a.c.z);
      if(d>1.5){this.walk(a,dt,S,[s.c.x,s.c.y,s.c.z],1);return}this.face(a,s.c.x,s.c.z);S.mode='rep';S.mt=2.4;a.ddPose='weld';if(s.se)s.se.rep=2.6;this.fx({k:'rp',i:a.id,s:s.id});this.sayEvery('dRep',20);return}
    if(m==='rep'){const s=S.rp&&S.rp.s;if(!s||!s.alive){S.mode='';S.rp=null;a.ddPose='';return}if(S.mt<=0){s.hp=s.maxHp;if(s.se)s.se.rep=0;S.rp=null;S.mode='';a.ddPose='';this.fx({k:'rpd',i:s.id})}return}
    if(m==='swoop'){if(S.mt<=0)this.swoopGo(a,S);return}
    if(m==='land'){if(S.mt<=0){S.mode='';this.toPerch(a,S)}return}
    if(m==='wings'){if(S.mt<=0){S.mode='';S.wings=true;if(S.high){let bi=0,bd=1e9;MAP.ez.perch.forEach((p,i)=>{const d=Math.hypot(p[0]-a.c.x,p[1]-a.c.y,p[2]-a.c.z);if(d<bd){bd=d;bi=i}});
        if(bd<5){S.air=true;S.perch=bi;S.pt=2;a.ddPose='perch'}else this.toPerch(a,S)}else this.toPerch(a,S)}return}
    if(m==='down'){a.ddPose='down';if(S.mt<=0){S.mode='';a.ddPose=''}return}
    if(m==='ret'||m==='climb'||m==='drop'||m==='hop'||m==='glide'||m==='fall'){if(S.mt<=0)S.mode='';return}
    S.mode=''},
  clearPat(a,S){ELAS.stop(a);S.st=S.nl=S.mn=S.tc=null;if(S.rp){const s=S.rp.s;if(s&&s.se)s.se.rep=0;S.rp=null}if(S.sw){S.sw.on=false;S.sw=null}},
  // ---------- stagger, downs ----------
  grog(a,v){const S=a.dd;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='wings'||S.mode==='ret'||S.mode==='gone'||S.mode==='climb')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);if(a.kin)S.downQ=6;else this.down(a,6);EP.say('dDown')}},
  // down 6 s (×1.5); in the air he falls first
  down(a,t){const S=a.dd;if(!S||S.mode==='gone'||S.mode==='ret')return;this.clearPat(a,S);this.fx({k:'dn',i:a.id});
    if(S.air||a.c.y>E9Y+1.2&&!S.high){this.fall(a,S,t);return}S.mode='down';S.mt=t;a.ddPose='down'},
  // out of the air (a strike on a rod near him, or the stagger gauge): down to the plaza below, then down on the snow
  fall(a,S,t){const c=a.c;let n=navSnap(c.x,E9Y,c.z,4);if(!n||Math.abs(n.y-E9Y)>1)n=navSnap(c.x*.8,E9Y,c.z+(c.z<-56?3:-3),8);const p=n?[n.x,n.y,n.z]:[c.x,E9Y,c.z];
    S.air=false;S.perch=-1;S.high=false;S.gndT=12;S.mode='fall';S.mt=9;a.ddPose='down';this.fx({k:'fall',i:a.id});
    epKin(a,p[0],p[1],p[2],.55,.2,b=>{const T=b.dd;if(!T)return;T.mode='down';T.mt=t;b.ddPose='down'})},
  // ---------- phases ----------
  floorHit(a){const S=a.dd;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone')this.retreat(a);return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  toPhase(a,n){const S=a.dd;S.ph=n;S.invT=3.5;S.grog=0;S.downQ=0;this.clearPat(a,S);S.mode='';EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();
    Object.assign(S.cd,{sent:6,nail:3,mine:6,rep:8,torch:2,radar:3,swoop:2.5});
    if(n===2){if(S.plate){S.plate=false;this.fx({k:'pd',i:a.id})}if(!a.kin)this.climb(a,S,true);EP.say('dP2');EP.later(3,()=>EP.say('dP2l'));EP.later(10,()=>this.sayOnce('dDome'));return}
    // 30 %: the wings, wherever he is (the radar stops)
    E9RAD.stop();S.mode='wings';S.mt=2.4;S.invT=Math.max(S.invT,2.8);a.ddPose='wings';this.fx({k:'wg',i:a.id});EP.say('dP3');EP.later(2.8,()=>EP.say('dP3l'))},
  // ---------- host: damage in (before the game applies it) ----------
  hit(t,dmg,src,o){const S=t.dd;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret'||S.mode==='wings')return 0;let mul=1;
    const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    if(!o.rod){o.kb=(o.kb||0)*.3;o.up=0;
      // the plate (phase 1): from in front of him it takes 40 %, in sparks; the frame pack's battery, from behind: ×1.4 and it fills the
      // stagger gauge
      if(!o.he&&this.plateOn(t)&&S.mode!=='down'&&this.plateHit(t,src,o)){mul=.4;if(!AU.throttle('ddpl',80))this.plateFx(t,o,true);if(src&&src.team===TH)this.sayOnce('dPlate')}
      else if(o.x!=null&&!o.he){const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hy=(o.y-t.c.y)/DA_S;if((o.x-t.c.x)*fx+(o.z-t.c.z)*fz<-.1&&hy>1.05&&hy<1.85){mul=1.4;if(!S.enc)this.grog(t,dmg*1.4/t.maxHp*300);if(!AU.throttle('ddbat',500))this.fxSend({k:'bt',i:t.id})}}
      if(o.he&&!S.enc)this.grog(t,10)}
    if(S.mode==='down'||S.mode==='land')mul*=1.5;
    let out=dmg*mul;if(S.mode==='rep'&&S.rp){S.rp.d+=out*em;if(S.rp.d>=t.maxHp*.02)this.repBreak(t,S)}
    const fl=t.maxHp*(S.enc?.85:S.ph===1?DA_PH[1]:S.ph===2?DA_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    S.dmgW+=out*em;return out},
  // the plate: in the boss stage's phase 1 (not in the first meeting); a shot from within ±63° of where he faces, below his chin, hits it
  plateOn(a){const S=a.dd;return !!(S&&S.plate&&S.ph===1&&!S.enc)},
  plateHit(t,src,o){let dx,dz;if(src&&src.c&&src!==t){dx=src.c.x-t.c.x;dz=src.c.z-t.c.z}else if(o.x!=null){dx=o.x-t.c.x;dz=o.z-t.c.z}else return false;
    const d=Math.hypot(dx,dz)||1;if((-dx*Math.sin(t.yaw)-dz*Math.cos(t.yaw))/d<.45)return false;return !(o.y!=null&&(o.y-t.c.y)/DA_S>1.6)},
  // (sparks off it where it was hit, or off its middle; a ring of steel)
  plateFx(t,o,snd){const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw);let x=t.c.x+fx*.5,y=t.c.y+1.35*DA_S,z=t.c.z+fz*.5;if(o&&o.x!=null){x=o.x;y=Math.min(o.y,t.c.y+1.75*DA_S);z=o.z}
    for(let i=0;i<5;i++)FX.spark(x,y,z,fx*rr(1,4)+rr(-2,2),rr(-.5,3),fz*rr(1,4)+rr(-2,2),rr(.1,.3));if(snd)AU.at('imp_metal',x,y,z,{vol:.7,range:40,rate:rr(.85,1.1)})},
  // ---------- host: the storm over the boss stage — an armed rod draws the next strike; otherwise whoever stands in the open ----------
  armed(R){this.stormT=Math.min(this.stormT,rr(3.5,5));this.fx({k:'ra',i:R.i});this.sayOnce('dArm')},
  stormTick(dt,b){if(EP.st!==4||EP.ph!=='run'||!b||!b.alive||!b.dd||b.dd.idle||b.dd.enc)return;const S=b.dd;this.stormT-=dt;if(this.stormT>0)return;
    const armed=E9ROD.L.filter(R=>R.st===1);
    if(armed.length){let R=armed[0],bd=1e9;for(const q of armed){const d=q.dome&&this.onCat(b)?0:Math.hypot(q.x-b.c.x,q.z-b.c.z);if(d<bd){bd=d;R=q}}this.rodStrike(R,b);this.stormT=S.ph>=3?9:12;return}
    this.stormT=(S.ph>=3?11:16)*(S.enr?.75:1);const H=SCEN.H.filter(h=>h.alive&&!rayCast(h.c.x,h.c.y+1.95,h.c.z,0,1,0,30));if(!H.length)return;const h=rpick(H);
    const x=h.c.x+rr(-.8,.8),z=h.c.z+rr(-.8,.8),y=h.c.y;TELE.add({k:'c',x,y,z,r:3,d:1.6,col:0x4a8aff});this.sayEvery('dStrike',30);EP.later(1.6,()=>this.strikeAt(x,y,z,4))},
  // a strike on open ground: 35 and knocked flat within 3 m
  strikeAt(x,y,z,st){if(EP.st!==st||EP.ph!=='run')return;this.fx({k:'bo',x:r2(x),y:r2(y),z:r2(z)});
    for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>3||Math.abs(h.c.y-y)>3)continue;hurtHuman(h,EPD(35*(.5+.5*(1-d/3))),null,{});epFx(h,'kd',.8)}this.charge(x,z)},
  // a strike on an armed rod: him close to it — 4 % of his health and +40 stagger (out of the air: he falls); the team close to it too
  rodStrike(R,b){R.st=2;R.t=E9ROD.CD;R.p=0;const S=b.dd;this.fx({k:'bo',x:r2(R.x),y:r2(R.top),z:r2(R.z),b:1,r:R.i});
    for(const h of SCEN.H){if(!h.alive)continue;const near=R.dome?this.onCat(h):Math.hypot(h.c.x-R.x,h.c.z-R.z)<4&&Math.abs(h.c.y-R.y)<3;if(!near)continue;hurtHuman(h,EPD(30),null,{});epFx(h,'kd',.8)}
    const hitB=R.dome?this.onCat(b):Math.hypot(b.c.x-R.x,b.c.z-R.z)<R.r&&b.c.y>R.y-1&&b.c.y<R.y+10;
    if(hitB&&S.invT<=0&&S.mode!=='wings'){damageActor(b,b.maxHp*.04,null,{rod:1,dir:[0,1,0],kb:0,stag:0,x:b.c.x,y:b.c.y+1,z:b.c.z});if(b.alive&&b.dd){this.grog(b,40);if(b.dd.air&&b.dd.mode!=='down'&&b.dd.mode!=='fall'){this.clearPat(b,b.dd);this.fall(b,b.dd,6)}}EP.say('dRod')}
    else this.sayEvery('dMiss',14);this.charge(R.x,R.z)},
  // the Static close to a strike: supercharged 12 s
  charge(x,z){const L=[];for(const a of SCEN.Z)if(a.alive&&a.zc==='static'&&Math.hypot(a.c.x-x,a.c.z-z)<10){a.stSupT=G.t+12;L.push(a.id)}if(L.length)this.fx({k:'sup',i:L})},
  // ---------- ammo boxes (host): at the sheds' doors and the deck's stairs, every 30 s wherever none is lying ----------
  ammoTick(dt,b){if(EP.st!==4||EP.ph!=='run'||!b||!b.alive||!b.dd||b.dd.enc)return;this.ammoT=(this.ammoT==null?12:this.ammoT)-dt;if(this.ammoT>0)return;this.ammoT=30;let w=0;
    for(const p of MAP.ez.ammo){if(EPK.list.some(k=>Math.hypot(k.x-p[0],k.z-p[2])<2))continue;const n=navSnap(p[0],p[1],p[2],1.5);if(!n)continue;EPK.spawn(n.x,n.y,n.z);w=1}if(w)this.sayOnce('dAmmo')},
  // ---------- bots ----------
  lowAm(a){const p=a.inv&&a.inv[1],id=p&&a.ammo[p]?p:a.inv&&a.inv[2],W=id&&WPN[id],A=id&&a.ammo[id];return !!(W&&A&&W.res&&!a.pup&&A.res<W.mag)},
  boxNear(a,r){let best=null,bd=r;for(const k of EPK.list){const d=Math.hypot(k.x-a.c.x,k.z-a.c.z);if(d<bd&&Math.abs(k.y-a.c.y)<2&&!TELE.at(k.x,k.z,.4)){bd=d;best=k}}return best},
  // in reach of a rod: the radome's anywhere on the catwalk, the others within their reach on the floor (the bots arm the one he is by)
  inReach(R,b){const S=b.dd;if(R.dome)return this.onCat(b)&&!(S&&S.mode==='drop');return Math.hypot(b.c.x-R.x,b.c.z-R.z)<R.r-.8&&b.c.y>R.y-1&&b.c.y<R.y+8},
  duty(){const now=G.t;if(this.dutyT>now)return this.dutyD;this.dutyT=now+1;this.dutyD=null;const b=EP.bossA();if(!b||!b.dd||EP.ph!=='run'||b.dd.enc||E9ROD.L.some(R=>R.st===1))return null;
    let R=null;for(const q of E9ROD.L)if(q.st===0&&this.inReach(q,b)){R=q;break}if(!R)return null;
    let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-R.bx,h.c.z-R.bz);if(d<bd){bd=d;best=h}}return this.dutyD=best&&bd<45?{x:R.bx,y:R.sy,z:R.bz,bot:best.id,k:R.i}:null},
  botGoal(a,i){const b=EP.bossA();if(!b||!b.dd||EP.ph!=='run')return null;const S=b.dd;if(S.enc)return null;
    const D=this.duty();if(D&&D.bot===a.id)return [D.x,D.y,D.z,.3];
    if(this.lowAm(a)){const k=this.boxNear(a,50);if(k)return [k.x,k.y,k.z,.05]}
    // the radar sweeping, or about to: in under the catwalk at the tower's foot on their own side till it stops (the beam cannot reach there)
    if(S.ph===2&&(E9RAD.on||S.high&&S.cd.radar<1.2)){const D=MAP.ez.dome,an=Math.atan2(a.c.z-D.z,a.c.x-D.x),cx=Math.cos(an),sz=Math.sin(an),m=Math.max(Math.abs(cx),Math.abs(sz))||1;
      return [D.x+cx/m*8,E9Y,D.z+sz/m*8,.6]}
    // him up on the catwalk (or on a perch): cover out on the plaza about 16 m from him, from where he can be seen
    if(S.high&&S.ph===2||S.ph>=3&&S.air&&S.perch>=0){const ex=b.c.x,ey=b.c.y+1.7,ez=b.c.z,L=MAP.ez.cover.map(p=>[p,Math.abs(Math.hypot(p[0]-ex,p[2]-ez)-16)+hash2(Math.round(p[0]),Math.round(p[2]),a.id)*6+(losClear(p[0],p[1]+1.6,p[2],ex,ey,ez)?0:40)]).sort((p,q)=>p[1]-q[1]);
      const p=L[i%Math.min(L.length,6)];return p?[p[0][0],p[0][1],p[0][2],1.2]:null}
    // (the plate in front of him: round to his back, where the battery is)
    const Z=EP.zone('D').box,r=11,an=this.plateOn(b)&&!S.high?Math.atan2(Math.cos(b.yaw),Math.sin(b.yaw))+((i%4)-1.5)*.6:i*1.9+Math.floor(G.t/6)*.8;return [clamp(b.c.x+Math.cos(an)*r,Z[0]+3,Z[2]-3),E9Y,clamp(b.c.z+Math.sin(an)*r,Z[1]+3,Z[3]-3),2]},
  goalTag(b){const S=b.dd;if(!S)return '';const D=this.duty();return S.ph+(S.high?'h':S.air?'a':'g')+(D?D.k+':'+D.bot:'')+(this.plateOn(b)?'y'+Math.round(b.yaw/1.05):'')+(S.ph===2&&(E9RAD.on||S.high&&S.cd.radar<1.2)?'R':'')},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;const R=E9ROD.L[j],b=EP.bossA();return R&&R.st===0&&b&&b.dd&&this.inReach(R,b)?j:-1},
  // out of a live mine's reach; down low when the radar beam is about to come round
  danger(a){if(!on9())return null;const c=a.c,M=E9MINE.near(c.x,c.y,c.z,2.4);if(M){const dx=c.x-M.x,dz=c.z-M.z,d=Math.hypot(dx,dz)||1;return {ax:dx/d,az:dz/d}}
    if(E9RAD.on&&E9RAD.t>E9RAD.WU-.4&&E9RAD.soon(c.x,c.z,.6))return {ax:0,az:0,duck:true};return null},
  // ---------- the boss stage's own devices: the rods' switches (0-3) ----------
  useNear(h){if(!on9()||EP.st!==4)return -1;for(const R of E9ROD.L)if(E9ROD.near(R,h))return R.i;return -1},
  useInfo(i,L){const R=E9ROD.L[i];if(!R)return null;if(R.st===0)return {act:R.dome?(L?'arm the radome\'s rod':'돔 피뢰침 작동'):(L?'arm the lightning rod':'피뢰침 작동'),p:R.p/E9ROD.T,x:0};
    if(R.st===1)return {act:(L?'Armed — the lightning is coming · ':'작동 중 — 번개가 온다 · ')+Math.max(0,Math.ceil(R.t))+(L?' s':'초'),p:1,x:1};
    return {act:(L?'Cooling ':'식는 중 ')+Math.max(0,Math.ceil(R.t))+(L?' s':'초'),p:1-R.t/E9ROD.CD,x:1}},
  // ---------- every page ----------
  update(dt){if(!on9())return;const b=EP.bossA();if(this.junk.length)this.junkTick(dt);
    if(NET.cli){const f=EP.bf;if(f&&f.rods)E9ROD.sync(f.rods)}
    else{this.stormTick(dt,b);this.ammoTick(dt,b);if(EP.st===4&&EP.ph==='run')E9ROD.hostTick(dt)}},
  stageClear(kind){ELAS.clear()},
  clear(){this.cur=null;this.said={};this.sayT={};this.encNext=false;this.dutyT=0;this.dutyD=null;this.stormT=14;this.ammoT=null;this.escT=0;this.junkClear()},
  // the plate he lets go of at 70 % (every page): it falls flat on the plaza and lies there
  junk:[],
  junkDrop(a){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),m=new THREE.Mesh(gunGeo('daPlate'),matGun());m.frustumCulled=false;const x=a.c.x+fx*.6,z=a.c.z+fz*.6;
    m.position.set(x,a.c.y+1.2*DA_S,z);m.rotation.set(0,a.yaw,0);m.scale.setScalar(DA_S);R.scene.add(m);sampleProbe(x,a.c.y+.5,z,m.material.uniforms.uProbe.value);
    this.junk.push({m,t:0,y0:a.c.y+1.2*DA_S,y1:a.c.y+.03,sp:rr(-.4,.4),x,z})},
  junkTick(dt){for(const J of this.junk){if(J.t>=1)continue;J.t=Math.min(1,J.t+dt*1.8);const k=J.t*J.t;J.m.position.y=lerp(J.y0,J.y1,k);J.m.rotation.x=-Math.PI/2*k;J.m.rotation.z=J.sp*k;
      if(J.t>=1){AU.at('imp_metal',J.x,J.y1+.1,J.z,{vol:.9,range:50,rate:.55});AU.at('hamhit',J.x,J.y1+.1,J.z,{vol:.6,range:40,rate:.7});for(let i=0;i<10;i++)FX.spawn({x:J.x+rr(-.4,.4),y:J.y1+.1,z:J.z+rr(-.4,.4),vx:rr(-1,1),vy:rr(.5,1.5),vz:rr(-1,1),life:rr(.5,1),s0:.15,s1:.4,r:.85,g:.88,b:.92,a:.6,f:2,drag:2,lit:1})}}},
  junkClear(){for(const J of this.junk){R.scene.remove(J.m);J.m.material.dispose()}this.junk=[]},
  // the boss bar: gauges and what he is doing (flags: 1 on the catwalk, 2 down, 4 invulnerable, 8 enraged, 16 first meeting, 32 the wings,
  // 64 in the air, 128 repairing, 256 the radar turning, 512 landed, 1024 the plate in front of him)
  bsOf(b){const S=b.dd;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.high?1:0)|(S.mode==='down'?2:0)|(S.invT>0&&!S.enc?4:0)|(S.enr?8:0)|(S.enc?16:0)|(S.wings?32:0)|(S.air||b.kin&&S.ph>=3?64:0)|(S.mode==='rep'?128:0)|(E9RAD.on?256:0)|(S.mode==='land'?512:0)|(this.plateOn(b)?1024:0),
    pose:Math.max(0,DA_POSE.indexOf(b.ddPose||'')),rods:E9ROD.pack()}},
  bsPack(b){if(!b.dd)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pose,B.rods]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pose:B[5],rods:Array.isArray(B[6])?B[6]:null,rt:performance.now()}},
  hud(B,L){const f=B.f;return {ss:f&4?(L?'INVULNERABLE':'무적'):f&2?(L?'DOWN!':'그로기!'):f&512?(L?'LANDED — NOW!':'착지 — 지금!'):f&128?(L?'REPAIRING — break it off!':'포탑 수리 중 — 끊어!'):f&256?(L?'RADAR — TAKE COVER':'레이더 — 엄폐!'):f&8?(L?'ENRAGED':'광폭화'):'',
    cls:f&8||f&256?'r':f&2||f&512||f&128?'y':'',sp:(f&16?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&16?'':f&32?(L?' · WINGS':' · 날개'):f&1?(L?' · ON THE RADOME':' · 레이더 탑 위'):f&1024?(L?' · STEEL PLATE':' · 강철판'):''),g1:B.grog/(B.gmax||100)}},
  // the rods: ready (hot when he is in reach of it), armed
  markers(list,L,P){const Bs=EP.bs();if(!Bs||Bs.f&16)return;const b=Bs.a;
    for(const R of E9ROD.L){if(R.st===0){const hot=!!(b&&b.alive&&(R.dome?Bs.f&1:Math.hypot(b.c.x-R.x,b.c.z-R.z)<R.r));list.push([R.bx,R.sy+1.9,R.bz,R.dome?(L?'⚡ RADOME ROD':'⚡ 돔 피뢰침'):(L?'⚡ ROD':'⚡ 피뢰침'),hot?'p hot':'p'])}
      else if(R.st===1)list.push([R.x,R.top+.8,R.z,(L?'◎ ARMED ':'◎ 대기 ')+Math.max(0,Math.ceil(R.t)),'p'])}},
  // ---------- every page: before the rig is posed — the pose, where the bots aim ----------
  pre(a,dt){this.cur=a;const S=a.dd;let pose=a.ddPose||'',f=0;
    if(!NET.cli&&S){f=this.bsOf(a).f}else{const bf=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(bf){pose=DA_POSE[bf.pose]||'';f=bf.f}}
    a.ddPose=pose;a.ddF=f;a.epDown=approach(a.epDown||0,a.alive&&f&2?1:0,dt*3);a.epHide=false;a.epPri=f&64?.4:.35;a.epAimY=1.5},
  // the rig's extras: 1.15×, the nail gun in his right hand (the torch when he welds), the wrench on his belt, the plate in front of him
  // (phase 1), the wings on his frame
  rigX(ch){const mk=k=>{const m=new THREE.Mesh(gunGeo(k),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);return m},o=ch.A.def.o;
    return {ng:mk('daNailGun'),tc:mk('daTorch'),wr:mk('daWrench'),wg:mk('daWings'),pl:mk('daPlate'),
      plM:new THREE.Matrix4().makeTranslation(-.05,.12,-(o.torsoD*.5+.13)),
      hand:new THREE.Matrix4().makeTranslation(0,-o.fore-.03,-.02).multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2)),
      hip:new THREE.Matrix4().makeTranslation(-.25,-.1,.03).multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2)),
      back:new THREE.Matrix4().makeTranslation(0,o.torsoH*.84,o.torsoD*.5+.3).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2))}},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_daedalus')return;if(ch.grp.scale.x!==DA_S)ch.grp.scale.setScalar(DA_S);a.hitW=.32;a.headR=.19;
    const X=ch.ddX||(ch.ddX=this.rigX(ch)),vis=ch.grp.visible,P=a.ddPose||'',f=a.ddF||0,weld=P==='weld';
    X.ng.visible=vis&&!weld&&P!=='wings'&&P!=='glide';X.ng.matrix.multiplyMatrices(ch.M[6],X.hand);X.tc.visible=vis&&weld;X.tc.matrix.multiplyMatrices(ch.M[6],X.hand);
    X.wr.visible=vis;X.wr.matrix.multiplyMatrices(ch.M[0],X.hip);X.wg.visible=vis&&!!(f&32);X.wg.matrix.multiplyMatrices(ch.M[1],X.back);
    X.pl.visible=vis&&!!(f&1024);X.pl.matrix.multiplyMatrices(ch.M[1],X.plM);
    for(const m of [X.ng,X.tc,X.wr,X.wg,X.pl])m.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value);
    if(weld&&vis&&Math.random()<.6){const p=_daV3.set(0,-.3,0).applyMatrix4(X.tc.matrix).applyMatrix4(ch.grp.matrixWorld);FX.spawn({x:p.x,y:p.y,z:p.z,vx:rr(-2,2),vy:rr(-.5,2.5),vz:rr(-2,2),life:rr(.1,.3),s0:.04,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1})}
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(f&4)T.set(1,.92,.98,.16+.08*Math.sin(G.t*30));else if(f&8)T.set(.9,.2,.1,.14+.06*Math.sin(G.t*9));else if(f&128)T.set(1,.6,.2,.06+.04*Math.sin(G.t*20))}},
  // ---------- the escape: the radome comes down (his dead man's switch) — every page ----------
  collapse(){const D=MAP.ez.dome;this.colT=0;E9RAD.stop();AU.play('siren',{vol:.6});
    for(let k=0;k<6;k++)SCEN.later(k*.8+rr(0,.3),()=>{const x=D.x+rr(-5,5),y=D.cat+rr(0,7),z=D.z+rr(-5,5);FX.explode(x,y,z,'he');AU.at('explode',x,y,z,{vol:1,range:220,occ:false,rate:.75})})},
  colTick(dt){if(this.colT==null||!E9M.dome)return;this.colT+=dt;const m=E9M.dome,D=MAP.ez.dome,k=clamp((this.colT-1)/7,0,1);m.position.y=D.y-k*k*7;m.rotation.z=k*.35;m.rotation.x=k*.18;
    if(this.colT<14&&Math.random()<dt*5)FX.spawn({x:D.x+rr(-5,5),y:D.cat+rr(0,5),z:D.z+rr(-5,5),vx:rr(-.5,.5),vy:rr(1,2.5),vz:rr(-.5,.5),life:rr(2,3.5),s0:1,s1:3,r:.25,g:.24,b:.24,a:.6,f:2,drag:.5,lit:1})},
  colReset(){this.colT=null;const m=E9M.dome;if(m&&MAPDEFS.ep9){m.position.y=E9Y+12;m.rotation.set(0,0,0)}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=typeof m.i==='number'?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const c=a.c;if(m.s==='se')AU.at('daservo',c.x,c.y+1,c.z,{vol:.8,range:40});else if(m.s==='nl')AU.at('reload',c.x,c.y+1.5,c.z,{vol:.7,range:40,rate:.8});
      else if(m.s==='mn')AU.at('zgrowl',c.x,c.y+1.8,c.z,{vol:.6,range:40,rate:1.2});else if(m.s==='tc')AU.at('hiss',c.x,c.y+1.5,c.z,{vol:.8,range:30,rate:1.4});
      else AU.at('salgust',c.x,c.y+2,c.z,{vol:1,range:70,rate:m.s==='sw'?1.6:1.2})}break;
    case 'nf':{const x=m.x/100,y=m.y/100,z=m.z/100,ty=m.ty/100;for(const yw of m.a||[]){const w=yw/1000,ex=x-Math.sin(w)*18,ez=z-Math.cos(w)*18;for(let k=0;k<3;k++)FX.tracer(x,y,z,ex+rr(-.4,.4),ty+rr(.6,1.6),ez+rr(-.4,.4),[.9,.85,.7])}
      for(let k=0;k<3;k++)SCEN.later(k*.07,()=>AU.at('danail',x,y,z,{vol:1,range:90}));break}
    case 'pin':if(P&&P.id===m.i){P.rootT=Math.max(P.rootT||0,.7);HUD.note(L?'Nailed down!':'못에 박혀 움직일 수 없다!',1.2)}break;
    case 'mn':if(NET.cli){const A=m.a;E9MINE.toss(A[0]/100,A[1]/100,A[2]/100,A[3]/100,A[4]/100,A[5]/100,m.T/100,m.id,true)}break;
    case 'mt':if(NET.cli){const M=E9MINE.byId(m.id);if(M)E9MINE.trig(M,true)}break;
    case 'mx':if(NET.cli){const M=E9MINE.byId(m.id);if(M){E9MINE.blast(M);E9MINE.remove(M)}}break;
    case 'mr':if(NET.cli){const M=E9MINE.byId(m.id);if(M)E9MINE.remove(M)}break;
    case 'tw':if(NET.cli)E9TRIP.set(m.i,m.s);break;
    case 'sv':if(a)AU.at('daservo',a.c.x,a.c.y+1,a.c.z,{vol:.6,range:35,rate:1.2});break;
    case 'bo':E9STORM.bolt(m.x/100,m.y/100,m.z/100,!!m.b);if(m.r!=null){const R=E9ROD.L[m.r];if(R){R.st=2;R.t=E9ROD.CD}}break;
    case 'ra':{const R=E9ROD.L[m.i];if(R){R.st=1;R.t=E9ROD.ARM;AU.at('powerup',R.bx,R.sy+1,R.bz,{vol:.8,range:50,rate:1.3});AU.at('dazap',R.x,R.top,R.z,{vol:.9,range:60})}
      HUD.note(L?'A rod is armed — the lightning is coming':'피뢰침 작동 — 번개가 온다',2);break}
    case 'rx':{const R=E9ROD.L[m.i];if(R){R.st=0;R.t=0}break}
    case 'rd':if(NET.cli)E9RAD.start(m.a/1000,m.d,true);if(P&&P.alive&&P.team===TH)HUD.note(L?'The radar is turning — put something solid between you and the dome':'레이더가 돈다 — 돔과 나 사이에 엄폐물을 둬!',2.2);break;
    case 'sup':for(const id of m.i||[]){const z=byIdAny(id);if(z){z.stSupT=G.t+12;AU.at('dazap',z.c.x,z.c.y+1,z.c.z,{vol:.8,range:40})}}break;
    case 'sd':{const x=m.x/100,y=m.y/100,z=m.z/100;AU.at('dazap',x,y+1,z,{vol:1,range:50,rate:.8});DL.add(x,y+1,z,'#7ab8ff',9,3,.3);
      for(let i=0;i<36;i++){const g=i/36*TAU;FX.spawn({x,y:y+.4,z,vx:Math.cos(g)*7,vy:rr(.2,2),vz:Math.sin(g)*7,life:rr(.25,.5),s0:.08,s1:.03,r:.6,g:.85,b:1,f:0,add:1})}break}
    case 'zp':if(a)AU.at('dazap',a.c.x,a.c.y+1.2,a.c.z,{vol:.6,range:25,rate:1.3});break;
    case 'tf':{const x=m.x/100,y=m.y/100,z=m.z/100,w=m.yw/1000,fx=-Math.sin(w),fz=-Math.cos(w);AU.at('salgust',x,y+1.2,z,{vol:.9,range:40,rate:1.8});
      for(let i=0;i<40;i++){const d=rr(.5,5.5);FX.spawn({x:x+fx*d+rr(-.4,.4),y:y+rr(.8,1.6),z:z+fz*d+rr(-.4,.4),vx:fx*2,vy:rr(0,1),vz:fz*2,life:rr(.2,.5),s0:.2,s1:.5,r:1,g:rr(.5,.8),b:.3,f:11,add:1})}
      DL.add(x+fx*2.5,y+1.4,z+fz*2.5,'#ffb060',8,2.4,.4);break}
    case 'rp':if(a)AU.at('hiss',a.c.x,a.c.y+1,a.c.z,{vol:.7,range:30,rate:1.6});break;
    case 'rpd':if(a)AU.at('powerup',a.c.x,a.c.y+1,a.c.z,{vol:.5,range:30,rate:1.5});break;
    case 'rpx':HUD.announce(L?'REPAIR BROKEN OFF':'수리를 끊었다!','h',1.6);break;
    case 'bt':if(a&&!AU.throttle('ddbt2',300)){const c=a.c;for(let i=0;i<8;i++)FX.spawn({x:c.x+Math.sin(a.yaw)*.3,y:c.y+1.5*DA_S,z:c.z+Math.cos(a.yaw)*.3,vx:rr(-2,2),vy:rr(0,3),vz:rr(-2,2),life:rr(.15,.3),s0:.05,s1:.02,r:1,g:.9,b:.4,f:0,grav:9,add:1})}break;
    case 'swh':if(P&&P.id===m.i)FX.shake=Math.max(FX.shake,.8);break;
    case 'ld':if(a){AU.at('land',a.c.x,a.c.y,a.c.z,{vol:1,range:60,rate:.6});for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-1,1),y:a.c.y+.2,z:a.c.z+rr(-1,1),vx:rr(-3,3),vy:rr(.5,2),vz:rr(-3,3),life:rr(.5,1),s0:.3,s1:.9,r:.9,g:.93,b:.96,a:.6,f:2,drag:1.5})}break;
    case 'fall':HUD.announce(L?'OUT OF THE SKY':'날개가 꺾였다 — 추락!','h',2);break;
    case 'dn':if(a)HUD.note(L?'Down — ×1.5 damage':'그로기 — 피해 1.5배',2.5);break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'ph':HUD.announce(m.n===2?(L?'UP ON THE RADOME':'레이더 탑 위로'):(L?'THE WINGS':'날개'),'z',3);AU.play('stingZ',{vol:.7});if(m.n===3)E9RAD.stop();break;
    case 'pd':if(a)this.junkDrop(a);break;
    case 'rh':AU.at('heal',E9CAR.x,E9CAR.y+1.2,E9CAR.z,{vol:.8,range:30});HUD.note(L?'The car\'s first-aid box — patched up to 75':'케이블카 구급함 — 체력 75까지 회복',2.5);break;
    case 'se0':if(a){const c=a.c;for(let i=0;i<12;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+1+rr(0,.3),z:c.z+rr(-.3,.3),vx:rr(-.4,.4),vy:rr(.6,1.6),vz:rr(-.4,.4),life:rr(.8,1.6),s0:.2,s1:.7,r:.3,g:.3,b:.3,a:.6,f:2,drag:1,lit:1});
      AU.at('dry',c.x,c.y+1,c.z,{vol:.8,range:30});AU.at('hiss',c.x,c.y+1,c.z,{vol:.5,range:30,rate:1.3});if(NET.cli&&a.alive)EP.despawn(a)}break;
    case 'wg':if(a){AU.at('salgust',a.c.x,a.c.y+2,a.c.z,{vol:1,range:80,rate:.7});AU.at('rack',a.c.x,a.c.y+1.5,a.c.z,{vol:.8,range:40,rate:.6})}break;
    case 'enr':HUD.announce(L?'DAEDALUS IS ENRAGED':'다이달로스 광폭화','z',2.5);break;
    case 'meet':if(a)AU.at('daservo',a.c.x,a.c.y+1,a.c.z,{vol:.8,range:60,rate:.7});break;
    case 'esc':this.collapse();break;
    case 'zx':if(NET.cli&&Array.isArray(m.z))for(const i of m.z){const z=byIdAny(i);if(z&&z.alive)EP.despawn(z)}break}}};
EPZ.daedalus={hp:()=>DAED.hpFor(),init:a=>DAED.init(a,DAED.encNext),ai:(a,dt)=>DAED.ai(a,dt),
  hit:(t,dmg,src,o)=>t.dd?DAED.hit(t,dmg,src,o):dmg,
  spark(t,o){t.ddHitT=G.t;if(NET.cli&&(t.ddF&1024)&&!(t.ddF&2)&&DAED.plateHit(t,G.player,o))DAED.plateFx(t,o,true)},
  // the wrench: 26 (34 heavy), a shove
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?6:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?34:26),a,{claw:1});
    AU.at('imp_metal',t.c.x,t.c.y+1.2,t.c.z,{vol:.7,range:30});return true},
  pre:(a,dt)=>DAED.pre(a,dt),attach:a=>DAED.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;if(t.dd&&!t.dd.enc&&!NET.cli){EP.say('dDie');E9RAD.stop()}},
  gone(a){ELAS.stop(a,true);a.kin=null;if(a.dd)a.dd.mode='gone'}};
// the Static: its claws daze (supercharged: harder); it dies in a discharge
EPZ.static={init(a){a.stSupT=0},
  claw(a,t){if(!t||!t.alive||t.team!==TH)return false;epFx(t,'dz',.8);if(a.stSupT>G.t)hurtHuman(t,EPD(12),a,{claw:1});if(!AU.throttle('dazp'+a.id,600))DAED.fx({k:'zp',i:a.id});return false},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_static'||!a.alive)return;const sup=a.stSupT>G.t,c=a.c;
    if(Math.random()<(sup?.5:.12))FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.5,1.8),z:c.z+rr(-.3,.3),vx:rr(-2,2),vy:rr(-1,2),vz:rr(-2,2),life:rr(.08,.2),s0:.05,s1:.02,r:.6,g:.85,b:1,f:0,add:1});
    if(sup&&a.frozen<=0)ch.mat.uniforms.uTint.value.set(.5,.8,1,.18+.1*Math.sin(G.t*25))},
  die(t){if(NET.cli)return;const x=t.c.x,y=t.c.y,z=t.c.z;TELE.add({k:'c',x,y,z,r:3.2,d:.7,col:0x4a8aff});
    EP.later(.7,()=>{if(!on9())return;DAED.fx({k:'sd',x:r2(x),y:r2(y),z:r2(z)});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>3.2||Math.abs(h.c.y-y)>2)continue;hurtHuman(h,EPD(22),null,{});epFx(h,'dz',.6)}})},
  gone(a){a.stSupT=0}};
// the sentry gun: no claws, no knockback; blasts hurt it 2.5×; its own hit box (a metal clang); the turret drawn where it stands
EPZ.sentry={hp:()=>E9SENT.hpFor(),init(a){const bs=E9SENT.next==='b';a.se={st:'scan',t:rr(.4,1),tg:null,n:0,yaw0:a.yaw,boss:bs,am:bs?4:1e9,life:bs?30:1e9,sw:Math.random()*TAU,lost:0,rep:0,hb:null,hbT:-9};a.epHide=false},
  ai:(a,dt)=>E9SENT.ai(a,dt),
  hit(t,dmg,src,o){o.kb=0;o.up=0;const S=t.se;if(S&&src&&src.team===TH){S.hb=src;S.hbT=G.t;if(S.st==='scan'){S.yaw0=daYaw(src.c.x-t.c.x,src.c.z-t.c.z);S.sw=0;S.t=Math.min(S.t,.1)}}return o.he?dmg*2.5:dmg},
  spark(t,o){if(!o||o.x==null||AU.throttle('e9sp',60))return;for(let i=0;i<4;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.1,.25),s0:.05,s1:.02,r:1,g:.85,b:.4,f:0,grav:9,add:1})},
  claw(){return true},
  // (the bots aim at its head — not at the hidden body's: epAimP)
  pre(a){if(!a.alive)return;a.epAimY=.95;a.epPri=.32;a.epHide=false;const c=a.c;a.epAimP=(a.seAim||(a.seAim=new THREE.Vector3())).set(c.x,c.y+.95,c.z);if(!a.seRay)a.seRay=(ox,oy,oz,dx,dy,dz,t)=>{const q=a.c,r=rayAABB(ox,oy,oz,dx,dy,dz,q.x-.36,q.y,q.z-.36,q.x+.36,q.y+1.32,q.z+.36,t);return r>=0?{t:r,part:'ball'}:null};
    a.epRay=a.seRay;a.epRayZc='sentry';a.epMuz=E9SENT.muz(a,a.seMuz||(a.seMuz=new THREE.Vector3()));void c},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_sentry')return;ch.mesh.visible=false;const X=ch.seX||(ch.seX=E9SENT.rigX(ch)),vis=ch.grp.visible&&a.alive;X.g.visible=vis;if(!vis)return;
    X.g.position.set(a.c.x,a.c.y,a.c.z);X.h.rotation.y=a.yaw;X.pT-=.016;if(X.pT<=0){X.pT=.3;sampleProbe(a.c.x,a.c.y+1,a.c.z,X.mat.uniforms.uProbe.value)}X.mat.uniforms.uEmisA.value=1+.6*Math.sin(G.t*9);
    const T=X.mat.uniforms.uTint.value;if(a.frozen>0)T.set(.55,.8,1,.5);else T.set(0,0,0,0)},
  die(t){const c=t.c;FX.explode(c.x,c.y+.9,c.z,'he');AU.at('explode',c.x,c.y+1,c.z,{vol:.8,range:70,occ:false,rate:1.4});ELAS.stop(t,true);if(t.ch&&t.ch.seX)t.ch.seX.g.visible=false;t.epAimP=t.epMuz=null;if(t.epRayZc==='sentry'){t.epRay=null;t.epRayZc=null}},
  gone(a){ELAS.stop(a,true);if(a.ch&&a.ch.seX)a.ch.seX.g.visible=false;a.epAimP=a.epMuz=null;if(a.epRayZc==='sentry'){a.epRay=null;a.epRayZc=null}}};
Object.assign(ZGAIT,{daedalus:{stride:1,knee:1,runK:1.05,bob:.85,twist:.7,sway:.8},static:{stride:.95,knee:.9,runK:1,bob:1.1,twist:1.2,sway:1.3},sentry:{stride:0,knee:0,runK:0,bob:0,twist:0,sway:0}});
Object.assign(JAW0,{daedalus:.15,static:.3,sentry:0});

// ---------- the rig poses (every page): DAEDALUS kneeling to set a sentry up, tossing mines, aiming the nail gun, welding, crouched on a
// perch, gliding (arms and wings out), spreading the wings, landing, down; the Static twitching ----------
{const pz=poseZombie;
  // [spine pitch (+ back), head pitch (+ up), L shoulder fwd, L shoulder out (−), L elbow, R shoulder fwd, R shoulder out (+), R elbow, jaw]
  const PT={idle:[-.05,.05,.3,-.18,.5,.62,.12,.95,.2],kneel:[-.25,-.2,.75,-.3,.9,.85,.2,.9,.2],throw:[.18,.15,.45,-.4,.6,2.5,.35,.35,.4],aim:[-.04,.04,1.25,-.12,1.15,1.5,.06,.06,.15],
    weld:[-.32,-.3,1.1,-.22,1.3,1.25,.1,1.15,.12],perch:[-.5,.35,.45,-1.2,.3,.45,1.2,.3,.3],glide:[-1.15,.95,.25,-1.5,.1,.25,1.5,.1,.5],down:[-.78,.3,.16,-.24,.4,.24,.26,.32,.85],
    wings:[.22,.45,.35,-1.45,.2,.35,1.45,.2,.65],land:[-.6,.25,.65,-.95,.5,.65,.95,.5,.4]};
  // the legs where the gait is no use [L hip, L knee, L ankle, R hip, R knee, R ankle, the drop of the hips]
  const LG={kneel:[1.45,-1.5,.05,-.12,-1.55,.65,-.47],perch:[1.5,-2.1,.6,1.5,-2.1,.6,-.55],glide:[-.25,-.35,.3,-.25,-.35,.3,0],land:[1.15,-1.55,.4,1.15,-1.55,.4,-.38]};
  const STILL={kneel:1,weld:1,perch:1,glide:1,wings:1,land:1};
  const ease=(a,key,t,rate)=>{const dt=clamp(t-(a[key]==null?t:a[key]),0,.1);a[key]=t;return 1-Math.exp(-dt*rate)};
  poseZombie=function(ch,st){
  if(st.zclass==='static'&&!(st.dead>0)){pz(ch,st);const R=ch.R,t=st.t||0,sd=st.seed||0,j=Math.sin(t*61+sd)>.93?Math.sin(t*97+sd)*.22:0;if(j){_daM.makeRotationZ(j);R[2].multiply(_daM);_daM.makeRotationX(j*.6);R[3].multiply(_daM)}return}
  if(st.zclass!=='daedalus'||st.dead>0||!DAED.cur||DAED.cur.ch!==ch){pz(ch,st);return}
  const a=DAED.cur,R=ch.R,t=st.t||0,P0=a.ddPose||'',P=st.down>.3&&P0!=='glide'&&P0!=='perch'?'down':P0||'idle';
  if(STILL[P]){st.spd=0;st.mvF=st.mvS=0;st.air=0;st.accel=0;st.turnRate=0;st.land=0}
  pz(ch,st);if(st.atk>0&&!STILL[P]){a.ddT0=t;return}
  const q=PT[P]||PT.idle,E=a.ddE||(a.ddE=q.slice()),k=ease(a,'ddT0',t,9);for(let i=0;i<9;i++)E[i]+=(q[i]-E[i])*k;
  const vib=P==='weld'?Math.sin(t*31)*.03:0,flap=P==='glide'?Math.sin(t*2.2)*.12:P==='perch'?Math.sin(t*1.3)*.05:0,sw=P==='idle'?Math.sin(t*1.3+(st.seed||0))*.05:0;
  setE(R[1],E[0],sw,Math.sin(t*.9)*.03);setE(R[2],E[1]+vib*.3,0,0);
  setE(R[3],E[2]+sw*.5,0,E[3]+flap);setE(R[4],Math.max(-.05,E[4]),0,0);setE(R[5],E[5]-sw*.5+vib,0,E[6]-flap);setE(R[6],Math.max(-.05,E[7]),0,0);setE(R[11],-clamp(E[8],0,1.45),0,0);
  const L=LG[P];if(L){setE(R[0],0,0,0);setE(R[7],L[0],0,-.06);setE(R[8],L[1],0,0);setE(R[12],L[2],0,0);setE(R[9],L[3],0,.06);setE(R[10],L[4],0,0);setE(R[13],L[5],0,0);ch.root.set(0,L[6],0)}}}

// ---------- chapter 9 「다이달로스」: the Seolryeong weather radar station (season 2) ----------
//   1 the valley station's plaza — three waves; the Static first show up; then into the cable car (40 s) and the ride up (26 s; its
//     first-aid box patches the riders up to 75)
//   2 the summit maze — 'breach' 180 s: everybody to the station's gate through RT1-04's containers (three sentry guns, six tripwires);
//     DAEDALUS's first appearance on the stacked containers (nails, mines); away north at 85 % or after 35 s. A bot left in the maze while
//     the rest wait at the gate is brought up to them after 8 s
//   3 the station compound — 'act': defuse the three charges (the transformer, the fuel tank's valve, the radar console; 9 s each); 02's log
//   4 the radome plaza — the boss fight, three phases (the workshop, the radar, the wings). A wipe replays the phase it reached
//   5 the escape — 90 s back through the compound and the maze to the cable car, the radome coming down behind (his mines and the
//     infected about the plaza gone when he falls)
CHAP[9]={id:9,k:'daedalus',map:'ep9',code:'RT1-04',season:2,n:['다이달로스','DAEDALUS'],t:['좀비 시나리오: 다이달로스','Zombie Scenario: DAEDALUS'],
  file:[['1차 회수팀 공병 RT1-04. 산꼭대기 기상 레이더 기지를 컨테이너와 포탑으로 둘러싸고 06을 기다린다','RT-1\'s engineer, RT1-04: he walled the mountaintop radar station in with containers and guns, and waits there for 06'],
    ['케이블카 · 컨테이너 미로와 포탑 · 인계철선 · 지뢰 · 피뢰침으로 번개를 끌어와라 · 감전 좀비 · 날개','The cable car · the container maze and its sentry guns · tripwires · mines · draw the lightning with the rods · the Static · the wings']],
  cards:{place:['설령산 기상 레이더 기지 · 뇌설이 내리는 밤','SEOLRYEONG RADAR STATION · A NIGHT OF THUNDERSNOW'],who:['1차 회수팀 공병','RT-1 ENGINEER'],line:['더는 아무것도 잃기 싫었다 — 그래서 벽을 쌓았다','He could not bear to lose anything more — so he built walls']},
  boss:DAED,voice2:['다이달로스','DAEDALUS'],voice3:['02의 기록','RT1-02 LOG'],
  // gates: A the valley station's doors, B the summit station's doors into the maze, C the compound's gate, D the blast gate onto the plaza
  gates:['gA','gB','gC','gD'],gateDur:{gA:1.2,gB:1.2,gC:1.6,gD:3},
  stages:[null,
    {z:'A',k:'waves',n:['하부 정류장','The valley station'],on:['정류장 광장을 지켜라','Hold the station plaza'],prep:18,clr:'s1c',intro:{zc:'static',say:'stc',at:3},doorN:['케이블카','CABLE CAR'],get wn(){return (G.diff||0)>=3?.75:1},
      wave:w=>[['rager',44],['runner',22],['static',w>=2?18:12],['bomber',w>=2?6:0],['brute',w>=3?6:0],['scream',w>=2?4:0]]},
    {z:'B',k:'breach',n:['정상 미로','The summit maze'],on:['미로를 지나 관측소 철문 앞으로','Through the maze to the station gate'],goal:'maze',len:180,meet:{at:10},get cap(){return (G.diff||0)>=3?.32:.45},gap:1.3,say:'s2',clr:'s2c',late:'mzLate',
      intro:{zc:'sentry',say:'sent',at:1.5},doorN:['관측소 철문','STATION GATE'],mix:[['rager',48],['runner',18],['static',20],['scream',8],['bomber',6]]},
    {z:'C',k:'act',n:['기상 관측동','The station compound'],on:['폭약 해체','Defuse the charges'],dev:'chg',say:'s3',clr:'s3c',devSay:(i,left)=>left===2?'d1':'d2',get cap(){const d=G.diff||0;return d>=3?.33:d>=2?.4:.44},gap:1.7,doorN:['방폭문','BLAST GATE'],
      mix:[['static',30],['rager',38],['runner',12],['bomber',10],['brute',4],['scream',6]]},
    {z:'D',k:'boss',n:['레이더 돔 광장','The radome plaza'],on:['다이달로스를 쓰러뜨려라','Bring DAEDALUS down'],say:'s4',go:'b0',prepPt:[0,40,-34,2]},
    {z:'D',k:'escape',n:['케이블카로','Back to the cable car'],on:['케이블카로 돌아가라','Back to the cable car'],len:90,mix:[['static',35],['rager',65]],get cap(){return (G.diff||0)>=3?.45:.6},gap:1.6}],
  // (the blast gate stays open through the boss stage's prep: bossGo shuts it behind the team)
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA')|b('gB');if(n>=3)m|=b('gC');if(n===4&&kind!=='phase')m|=b('gD');return m},
  setup(){DAED.said={};DAED.sayT={};E9CAR.clear();DAED.colReset();DAED.junkClear();
    // (once: the trickle leaves the sentries out of its count — they never come for you —, and a stage may space its spawns out (D.gap).
    // episode.js loads after this file, so it is done here)
    if(!EP.tr9){const tr=EP.trickle;EP.tr9=1;EP.trickle=function(dt,mix,capK){if(!on9())return tr.call(this,dt,mix,capK);const d=G.diff||0;let alive=0;for(const z of SCEN.Z)if(z.alive&&!z.boss&&z.zc!=='sentry')alive++;
      const cap=Math.round((3+1.6*SCEN.H.length)*SC_DIFF.n[d]*(capK||1));this.spawnT-=dt;if(alive<cap&&this.spawnT<=0){const ok=SCEN.spawn(this.roll(mix)),D=this.S();this.spawnT=ok?rr(.7,1.4)*(D&&D.gap||1)/(SC_DIFF.n[d]*(.7+.1*SCEN.H.length)):.4}}}},
  // every stage: the maze's sentries and tripwires (stage 2), the rods (stage 4)
  stageStart(n,kind){E9MINE.clear();E9TRIP.clear();E9RAD.stop();if(n===2)E9TRIP.build();if(n===4)E9ROD.build();else E9ROD.clear();DAED.colReset();
    if(!NET.cli){DAED.stormT=14;DAED.escT=0;if(n===2){for(const s of MAP.ez.sentry)E9SENT.spawn([s.x,s.y,s.z],s.yaw,false);EP.later(5,()=>{if(EP.st===2&&EP.ph==='run')EP.say('trip')})}}},
  stageDone(st){if(st===3)EP.later(4,()=>EP.say('log3'))},
  devDone(st,i,left){if(st===3&&left>0)EP.later(3,()=>EP.say(left===2?'log1':'log2'))},
  // ---------- the cable car: board (40 s, the 'move' after stage 1), the ride up (26 s), out at the summit ----------
  hostPh(ph,dt){if(ph==='ride'){EP.t-=dt;G.time=Math.max(0,EP.t);this.rideTick();if(EP.t<=0)this.rideEnd();return true}
    if(ph==='move'&&EP.st===1){if(humansAlive()===0){EP.fail();return true}EP.t-=dt;G.time=EP.t;EP.trickle(dt,CHAP[9].stages[1].wave(3),.7);this.botsIn(MAP.ez.car.valley);
      let all=true,n=0;for(const h of SCEN.H)if(h.alive){n++;if(!E9CAR.inside(h))all=false}if(all&&n||EP.t<=0)this.rideStart();return true}
    return false},
  // (a bot at a door is lifted in to its place: four in one cabin jostle in its doorways)
  botsIn(C){let i=0;for(const h of SCEN.H){if(!h.alive)continue;const k=i++;if(!h.bot||E9CAR.inside(h))continue;
      if(Math.abs(h.c.y-C[1])>1.4||Math.abs(h.c.x-C[0])>3.4||Math.abs(h.c.z-C[2])>2.6)continue;const s=E9CAR.slot(k);placeAt(h,C[0]+s[0],C[1]+.02,C[2]+s[1],h.yaw)}},
  // (the last ones are pulled in as the doors close)
  rideStart(){const tp=[],C=MAP.ez.car.valley;let i=0;
    for(const h of SCEN.H){if(!h.alive||E9CAR.inside(h))continue;const s=E9CAR.slot(i++),x=C[0]+s[0],z=C[2]+s[1];placeAt(h,x,C[1]+.02,z,0);tp.push([h.id,r2(x),r2(C[1]+.02),r2(z),0])}
    const ids=[];for(const a of SCEN.Z)if(a.alive){EP.despawn(a);ids.push(a.id)}SCEN.closePick(false);
    EP.ph='ride';EP.t=E9CAR.RIDE;G.st='fight';G.time=EP.t;this.rideBegin();if(NET.host)netEv('e9r',{P:tp,z:ids})},
  rideBegin(){EP.radio('ride');HUD.announce(LI()?'UP TO THE SUMMIT':'정상으로','w',2.5);this.rideSaid=0},
  // (5 s up: the car's first-aid box — whoever is riding is patched up to 75)
  rideTick(){const t=E9CAR.t,once=(b,k)=>{if(!(this.rideSaid&b)){this.rideSaid|=b;EP.say(k)}};if(t>10.7)once(1,'ride2');if(t>12)once(2,'rIC');if(t>13.6)once(4,'ride3');
    if(t>5&&!(this.rideSaid&8)){this.rideSaid|=8;for(const h of SCEN.H)if(h.alive&&E9CAR.inside(h,.3))h.hp=Math.max(h.hp,75);DAED.fx({k:'rh'})}},
  rideEnd(){const arr={};for(const h of SCEN.H){if(!h.alive)continue;arr[h.id]=[h.c.x,h.c.y,h.c.z,h.yaw]}EP.stageStart(2,'next',null,arr)},
  // (whoever is still out on the steps when the blast gate shuts is put on the plaza: the clients get their places in epgo)
  bossGo(){EP.setGates(EP.gm&~EP.bit('gD'));const Z=MAP.ez.zones.D,out=[];let i=0;
    for(const h of SCEN.H){if(!h.alive||EP.inBox(Z.box,h.c.x,h.c.z,0))continue;const s=Z.start[i++%Z.start.length];placeAt(h,s[0],s[1],s[2],s[3]);out.push([h.id,r2(s[0]),r2(s[1]),r2(s[2]),r3(s[3])])}return out},
  // the escape: every gate back to the car open, the radome coming down; his mines go dead with him, what was on the plaza scatters, then
  // the infected come out of the compound and off the plaza behind them
  escapeStart(){EP.setGates(EP.gm|EP.bit('gD')|EP.bit('gC')|EP.bit('gB'));const Z=MAP.ez.zones;SCEN.zsp=Z.C.zsp.concat(Z.D.zsp);
    if(!NET.cli){for(const M of E9MINE.L.slice())E9MINE.kill(M,0);const ids=[];for(const a of SCEN.Z)if(a.alive&&!a.boss){EP.despawn(a);ids.push(a.id)}if(ids.length)DAED.fxSend({k:'zx',z:ids})}DAED.escT=7;DAED.fx({k:'esc'});EP.later(1.4,()=>EP.say('eStart'))},
  onFinish(win){if(win)EP.t=Math.max(EP.t,9)},
  endFx(r){if(r.win){this.ending();if(r.bonus)E9CAR.depart()}},
  clear(){DAED.clear();E9CAR.clear();E9ROD.clear();E9MINE.clear();E9TRIP.clear();E9RAD.clear();E9STORM.clear();DAED.colReset();this.rideSaid=0},
  // every page, every frame: the car, the storm, the rods, the mines, the wires, the radar, the radome coming down; host: the wires, the
  // escape's strikes
  update(dt){E9CAR.update(dt);E9STORM.update(dt);E9ROD.update(dt);E9MINE.update(dt);E9TRIP.update(dt);E9RAD.update(dt);DAED.colTick(dt);
    if(NET.cli)return;if(EP.st===2&&EP.ph==='run'){E9TRIP.hostTick(dt);this.mazeCatch(dt)}
    if(EP.S().k==='escape'&&EP.ph==='run'){this.botsIn(MAP.ez.car.summit);DAED.escT-=dt;if(DAED.escT<=0){DAED.escT=rr(9,13);const H=SCEN.H.filter(h=>h.alive&&!rayCast(h.c.x,h.c.y+1.95,h.c.z,0,1,0,30));
      if(H.length){const h=rpick(H),x=h.c.x+rr(-1,1),z=h.c.z+rr(-1,1),y=h.c.y;TELE.add({k:'c',x,y,z,r:3,d:1.6,col:0x4a8aff});EP.later(1.6,()=>DAED.strikeAt(x,y,z,5))}}}},
  // (the bots do not go to get a fallen one up in sight of a sentry — of DAEDALUS's only within 15 m: two of them up through most of
  // phase 1 would have kept everyone down for good, and with none of his counted the bots went down one after another by one of them)
  reviveBad(h){for(const s of SCEN.Z){if(!s.alive||s.zc!=='sentry')continue;if(Math.hypot(s.c.x-h.c.x,s.c.z-h.c.z)>(s.se&&s.se.boss?15:26)||Math.abs(s.c.y-h.c.y)>12)continue;const m=E9SENT.muz(s);if(losClear(m.x,m.y,m.z,h.c.x,h.c.y+.8,h.c.z))return true}return false},
  // the maze: only bots still out in it, the rest at the gate (one of the players among them, or at least as many as are out) — 8 s
  // later they are brought up to the gate (a bot lost in the maze would keep them all waiting)
  mazeCatch(dt){const gb=MAP.ez.goal.maze;let inN=0,real=0;const out=[];for(const h of SCEN.H){if(!h.alive)continue;if(EP.inBox(gb.box,h.c.x,h.c.z)){inN++;if(!h.bot)real++}else out.push(h)}
    if(!out.length||!inN||out.some(h=>!h.bot)||!real&&inN<out.length){this.mzT=0;return}this.mzT=(this.mzT||0)+dt;if(this.mzT<8)return;this.mzT=0;
    let k=0;for(const h of out){const n=navSnap(-3+(k++%4)*2,gb.p[1],gb.p[2],2.5);if(n)placeAt(h,n.x,n.y+.02,n.z,Math.PI)}},
  // bots: into the car (a place each); stock still in the ride; over the tripwires; the charges together; the escape a gate at a time (the plaza → the compound
  // → the maze → the station hall → the car: one path the whole way is more than the path search will look through)
  goal(a,i){if(EP.st===1&&EP.ph==='move'){const C=MAP.ez.car.valley,s=E9CAR.slot(i);return [C[0]+s[0],C[1],C[2]+s[1],.25]}if(EP.ph==='ride')return [E9CAR.x,E9CAR.y,E9CAR.z,1];
    if(EP.S().k==='escape'){const w=this.escW(a);if(w<3)return this.escP[w];const C=MAP.ez.car.summit,s=E9CAR.slot(i);return [C[0]+s[0],C[1],C[2]+s[1],.25]}
    // the compound's charges: the bots stay together, on the open one nearest the team (alone at one far apart, they were picked off)
    if(EP.st===3&&EP.ph==='run'&&EP.S().k==='act'){const L=EP.devs(),C=DAED.cen();let j=-1,bd=1e9;for(let k=0;k<L.length;k++){if(!EP.devOpen(k))continue;const d=Math.hypot(L[k].x-C[0],L[k].z-C[2]);if(d<bd){bd=d;j=k}}
      if(j>=0){const v=L[j];a.bot.epDev=j;return [v.x+(v.bx||0),v.y,v.z+(v.bz||0),i%2?1.6:.6]}}},
  escP:[[0,E9Y,-17,2],[0,E9Y,16,2],[0,E9Y,51,1.5]],
  escW(a){const z=a.c.z;return z<-21.5?0:z<12.7?1:z<47.9?2:3},
  botPost(a){if(EP.ph==='ride'){a.cmd.f=a.cmd.s=0;a.cmd.jump=false;return}if(EP.st===2&&a.c.onGround&&E9TRIP.ahead(a))a.cmd.jump=true;
    if(EP.ph==='run'&&EP.S().k==='escape'){const B=a.bot,w=this.escW(a);if(B&&B.e9w!==w){B.e9w=w;B.epG=null}}},
  markers(list,L){if(EP.st===1&&EP.ph==='move'){const C=MAP.ez.car.valley;list.push([C[0],C[1]+3,C[2],L?'CABLE CAR':'케이블카','g']);return true}return EP.ph==='ride'},
  objText(L,ts){if(EP.st===1&&EP.ph==='move')return [(L?'Into the cable car!':'케이블카 탑승!')+` · ${ts}${L?'s':'초'}`,EP.t/40];
    if(EP.ph==='ride')return [L?'Up to the summit…':'정상으로 올라가는 중…',clamp(E9CAR.t/E9CAR.RIDE,0,1)];return null},
  deadText(L){if(EP.ph==='ride')return L?'Down — back on your feet when the car reaches the summit · spectating':'쓰러짐 — 케이블카가 정상에 닿으면 다시 일어나요 · 관전 중';return null},
  // a shot on a mine or a tripwire's claymore sets it off (a client tells the host)
  boxShot(eh,a,W){if(eh.k!=='mine'&&eh.k!=='trip')return;if(NET.cli){if(!AU.throttle('e9s'+eh.k+eh.i,150))netToHost({t:'e9s',k:eh.k,i:eh.i});return}this.shotHit(eh.k,eh.i)},
  shotHit(k,i){if(k==='mine'){const M=E9MINE.byId(i);if(M&&M.st>=1)E9MINE.kill(M,true)}else{const T=E9TRIP.L[i];if(T&&T.st===0)E9TRIP.boom(T)}},
  // after the clear: 02's last log; a card for the season so far
  ending(){EP.later(3,()=>EP.radio('end0'));EP.later(6.5,()=>EP.radio('end1'));EP.later(9.5,()=>EP.radio('end2'));EP.later(11,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'ZOMBIE SCENARIO · SEASON 2':'좀비 시나리오 · 시즌 2'}</small><h1>${L?'CHAPTER 9 CLEAR':'9챕터 클리어'}</h1><p>${L?'One of RT-1 left — 02, gone back to Q-7\'s central lab alone.':'1차 회수팀은 이제 하나 — 02, 홀로 격리구역 Q-7 중앙 연구소로.'}</p><b>${L?'NEXT — CHAPTER 10 「ELPIS」 · THE SEASON 2 FINALE':'다음 이야기 — 10챕터 「엘피스」 · 시즌 2 최종장'}</b></div></div>`;
    el.className='on';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},7000)},
  radio:{
    start:['2차 회수팀, 설령산이다. 기상 레이더 기지는 산꼭대기 — 올라가는 길은 저 케이블카뿐이야. 하부 정류장부터 확보해.','RT-2, this is Mount Seolryeong. The radar station is on the summit — the only way up is that cable car. Secure the valley station first.',0],
    w1:['정류장 광장으로 몰려온다!','They are pouring into the station plaza!',1],
    stc:['저놈 몸에서 불꽃이 튄다 — 번개 맞은 놈들이야! 할퀴면 어지럽고, 죽을 때 방전된다. 파란 원에서 떨어져!','Sparks coming off that one — struck in the storm! Its claws daze you, and it discharges when it dies. Out of the blue ring!',1],
    s1c:['광장 확보. 정류장 문 연다 — 케이블카에 타! 다 타면 출발한다.','Plaza clear. Opening the station — into the cable car! We go when everyone is in.',0],
    ride:['출발한다. 정상까지 금방이야 — 구급함으로 정비해 두고, 밖을 잘 봐 둬.','Moving. It is not far to the top — patch up from the first-aid box, and keep your eyes outside.',0],
    ride2:['번개가 철탑에 떨어졌다! 멈췄어—','Lightning hit the pylon! We have stopped—',1],
    rIC:['…내려가. 여긴 아무것도 없어.','…Go back down. There is nothing up here.',2],
    ride3:['예비 전원이다 — 다시 움직인다!','Backup power — we are moving again!',0],
    s2:['정상 정류장 도착. 밖은 컨테이너로 쌓은 미로야 — 누가 일부러 길을 막아 놨어. 끝까지 가서 관측소 철문 앞에 모여.','Summit station. Outside is a maze of containers — somebody walled the way in on purpose. Get through to the station gate and gather there.',0],
    sent:['자동 포탑이다! 빨간 레이저가 잡으면 바로 쏜다 — 뒤쪽은 못 봐, 돌아가서 부숴!','Sentry gun! Once its red laser is on you it fires — it cannot see behind it: get round it and break it!',1],
    trip:['바닥에 빨간 선 — 인계철선이다! 뛰어넘거나, 끝에 달린 지뢰를 쏴서 터뜨려!','A red line across the floor — a tripwire! Jump it, or shoot the mine at its end!',1],
    enc:['컨테이너 위에 누가 있다 — 공병 장비를 멘 놈이야!','Somebody on top of the containers — he is carrying engineer gear!',1],
    enc2:['…1차 회수팀 공병 RT1-04, 다이달로스. 페리 06을 정비하던 사람이다.','…RT-1\'s engineer, RT1-04. DAEDALUS. He kept FERRY 06 flying.',0],
    dMeet:['…06을 떨어뜨렸지. 너희가.','…You brought 06 down. You did.',2],
    dRet:['빠진다 — 관측소 쪽으로 넘어갔어!','He is pulling back — over toward the station!',1],
    mzLate:['시간이 없어 — 다시!','Out of time — again!',0],
    s2c:['미로 통과. 관측소 철문 연다.','Through the maze. Opening the station gate.',0],
    s3:['관측동에 폭약이 걸려 있다 — 발전실 변압기, 유류 탱크 밸브, 레이더 콘솔. 셋 다 해체해. 하나라도 터지면 산꼭대기가 날아간다.','He has rigged the station with charges — the transformer, the fuel tank\'s valve, the radar console. Defuse all three. If one goes, the whole summit goes.',0],
    d1:['하나 해체. 둘 남았다.','One defused. Two to go.',0],
    d2:['마지막 하나!','Last one!',0],
    log1:['…02 기록. 억제제가 떨어져 간다. 04는 아직 버틴다 — 벽을 쌓고 있다.','…02, log. The suppressant is running low. 04 is still holding on — he is building walls.',3],
    log2:['…02 기록. 04는 06을 기다린다. 헬기 소리가 날 때마다 레이더 앞에 앉는다.','…02, log. 04 waits for 06. Every time he hears a rotor, he sits down at the radar.',3],
    log3:['…02 기록. 06은 오지 않는다. 04에게 말하지 못했다.','…02, log. 06 is not coming. I could not tell 04.',3],
    s3c:['해체 완료. 방폭문 연다 — 레이더 돔 광장이다. 저 위에 있다.','All defused. Opening the blast gate — the radome plaza. He is up there.',0],
    s4:['광장에 피뢰침이 넷 — 스위치에서 E를 3초 누르면 25초 동안 번개를 끌어온다. 놈이 그 피뢰침 가까이 있을 때 걸어. 돔 피뢰침 스위치는 탑 남쪽 아래야.','Four lightning rods round the plaza — hold E at a switch for three seconds and it draws the lightning for 25. Arm the one he is close to. The radome\'s rod has its switch at the tower\'s south foot.',0],
    b0:['여기까지 왔구나. …더는 아무것도 못 가져가.','So you came all this way. …You are taking nothing else from me.',2],
    dSent:['포탑을 깐다 — 부숴!','He is setting up a sentry — break it!',1],
    dPlate:['철판을 들고 있다 — 앞에서 쏘면 튕겨 나가! 돌아가서 등 뒤 배터리를 노려!','He is behind a steel plate — shots from the front glance off! Get round him and go for the battery on his back!',1],
    dNail:['못총이다 — 빨간 띠 세 줄에서 비켜!','Nail gun — out of the three red strips!',1],
    dMine:['지뢰를 던진다 — 밟지 말고 쏴서 터뜨려!','He is throwing mines — do not step on them, shoot them!',1],
    dRep:['포탑을 고친다 — 몰아쳐서 끊어!','He is repairing a sentry — hit him hard and break it off!',1],
    dRepX:['수리를 끊었다!','Broke off his repair!',1],
    dArm:['피뢰침 작동 — 곧 번개가 떨어진다!','The rod is armed — the lightning is coming!',1],
    dRod:['피뢰침에 번개! 놈한테 들어갔다!','Lightning on the rod — it went right through him!',1],
    dMiss:['번개가 피뢰침에 떨어졌는데 놈이 너무 멀었어!','The lightning took the rod, but he was too far away!',1],
    dP2:['레이더 탑 위로 올라간다! 돔의 레이더가 돈다 — 빨간 빛줄기에 걸리지 마, 엄폐물 뒤로!','He is going up the radar tower! The radar is spinning up — stay out of the red beam, get behind cover!',1],
    dP2l:['…이 레이더로 06을 기다렸어. 매일 밤.','…I waited for 06 on this radar. Every night.',2],
    dDome:['돔 피뢰침 스위치는 탑 남쪽 아래야 — 놈이 탑 위에 있을 때 걸어!','The radome rod\'s switch is at the tower\'s south foot — arm it while he is up there!',0],
    dRadar:['레이더가 돈다 — 엄폐물 뒤에 숙여!','The radar is turning — get down behind something solid!',1],
    dTorch:['용접 토치! 탑 위에선 떨어져!','Welding torch! Keep your distance up there!',1],
    dDrop:['내려왔다 — 지금이야!','He has jumped down — now!',1],
    dUp:['다시 탑 위로 올라간다!','He is going back up the tower!',1],
    dP3:['…날개?! 헬기 날개를 등에 묶었어!','…Wings?! He has strapped the helicopter\'s blades to his back!',1],
    dP3l:['06은 날았어. 나도 날 수 있어.','06 flew. So can I.',2],
    dSwoop:['내리꽂는다 — 빨간 띠에서 비켜!','He is diving — out of the red strip!',1],
    dLand:['착지했다 — 쏴!','He has landed — fire!',1],
    dDown:['휘청거린다 — 집중 사격!','He is staggering — pour it on!',1],
    dStrike:['파란 원 — 번개가 떨어진다! 벗어나!','Blue ring — lightning is coming! Get out of it!',1],
    dEnr:['시간 끌면 안 돼 — 점점 거칠어진다!','We cannot drag this out — he is getting wilder!',0],
    dAmmo:['창고에서 1차 팀 탄약 상자가 나왔다 — 밟으면 보충된다.','RT-1 ammo crates out of the sheds — walk over them to top up.',1],
    dDie:['…06… 이제 같이 가자…','…06… let us go together now…',2],
    dead:['다이달로스 무력화. 1차 회수팀 공병, 확인했다.','DAEDALUS is down. RT-1\'s engineer, confirmed.',0],
    eStart:['돔이 무너진다 — 놈의 데드맨 스위치야! 케이블카로 돌아가, 90초!','The radome is coming down — his dead man\'s switch! Back to the cable car — 90 seconds!',0],
    esc:['다 탔다 — 케이블카 출발!','Everyone is in — the car is moving!',0],
    late:['…케이블카는 놓쳤다. 그래도 놈은 끝났어.','…We missed the car. But he is finished.',0],
    clear:['…02의 마지막 기록이 남아 있다.','…There is one more log from 02.',0],
    end0:['…02 마지막 기록. 억제제가 듣지 않는다. 원액은 Q-7 중앙 연구소에만 있다.','…02, last log. The suppressant is not working. The pure stock is only at Q-7\'s central lab.',3],
    end1:['혼자 간다. 04, 기다리지 마.','I am going alone. 04 — do not wait.',3],
    end2:['1차 회수팀은 이제 하나 — RT1-02. 격리구역 Q-7로 돌아갔다.','One of RT-1 left — RT1-02. Gone back to Quarantine Zone Q-7.',0]}};

// ---------- hooks ----------
(function(){
  Object.assign(CLIH,{e9(L,m){DAED.fxApply(m)},
    e9r(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);for(const i of m.z||[]){const a=byIdAny(i);if(a)EP.despawn(a)}
      EP.ph='ride';EP.t=E9CAR.RIDE;SCEN.closePick(false);CHAP[9].rideBegin()}});
  Object.assign(HOSTH,{e9s(L,m){if(!on9()||!actorOfKey(L.key))return;CHAP[9].shotHit(m.k==='trip'?'trip':'mine',m.i|0)}});
  // a sentry stays where it was set up: no physics, and nobody shoves it
  const ap=actorPhysics;actorPhysics=function(a,dt){if(a.zc==='sentry'&&a.alive&&on9())return;return ap(a,dt)};
  const sp0=separate;separate=function(dt){if(!on9())return sp0(dt);const S=[];for(const a of SCEN.Z)if(a.alive&&a.zc==='sentry')S.push([a,a.c.x,a.c.z]);sp0(dt);for(const [a,x,z] of S){a.c.x=x;a.c.z=z}};
  // a supercharged Static runs faster
  const ms=maxSpeed;maxSpeed=function(a){let s=ms(a);if(on9()&&a.zc==='static'&&a.stSupT>G.t)s*=1.35;return s};
  // the riders of the cable car another page moves: drawn in the car
  const np=netPuppet;netPuppet=function(a,dt){np(a,dt);if(E9CAR.dyn&&on9()&&a.alive&&a.team===TH)E9CAR.pup(a)};
})();

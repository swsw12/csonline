'use strict';
// ============ Chapter 8 「카론」 (season 2): the boss CHARON (RT1-06), RT-1's extraction helicopter FERRY 06, the AA guns, the Frozen zombie ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, laser sights, scripted leaps — are in epbase.js).
// Host-authoritative: the host flies the helicopter, runs CHARON's brain and every Frozen's sleep, and decides every hit; clients get the
// helicopter's pose, his gauges, the guns in the chapter snapshot (EP.pack → bsPack) and the moments as events ('ech').
// CHARON, RT-1's pilot, flew the team's extraction helicopter. The feeling the suppressant held down was fear: he was afraid to touch the
// ground among the dead, so he never came down. 16,000 × (0.6 + 0.4 × humans) × difficulty health and his own brain (EPZ.charon.ai).
//   phase 1 (100–70 %) in the air over the apron, circling the team at 16–19 m: the door gunner's strafes (a red strip 20 m long through
//            one of them, 1.2 s, then the bullets walk it: 22 each), rocket walks (six red rings in a line, 30 and knocked flat), passengers
//            let down on ropes (the helicopter hovers at 8 m, 3 s: its rotor wash shoves whoever is under it). The door gunner has his own
//            health (6 % of CHARON's): shot out of the door, no more strafes. Its hull takes 30 % of a hit, the cockpit (him) all of it,
//            the engine on top ×2.2 (and it fills the stagger gauge), the tail rotor ×1.4.
//   70 %     the engine catches fire
//   phase 2 (70–30 %) lower (9–13 m), faster, smoking: strafes (or, the gunner gone, the nose gun's shorter ones), rocket walks, burning
//            fuel dumped along a line (7 s of fire), rotor-wash dives (a red ring 7 m: 26, knocked flat and thrown), passengers.
//   30 %     the tail rotor goes: it spins down onto the apron (a red ring 9 m round where it will hit: 55 and knocked flat), the wreck
//            burns on (cover, and fire round it); the blizzard closes in (a whiteout). CHARON crawls out of the cockpit.
//   phase 3 (30–0 %) on foot, terrified: he runs from whoever comes near; his flare gun (a red ring 2.6 m, then 6 s of fire), a mayday
//            (kneeling 2.6 s at his radio: Frozen burst up out of the snow round the team — 4 % of his health breaks it), a scream when
//            they crowd him (dizzy, thrown back), claws when cornered.
// Three AA guns on the apron (hold E 3 s at the loader): a loaded gun fires a flak burst at the helicopter when it is within 85 m and in
// sight — 2.5 % of his health and +28 stagger — then reloads for 30 s. Stagger also: the engine, the tail rotor, HE +15, frost +10.
// Full gauge: in the air the helicopter sinks to 5 m, wobbling, 6 s (×1.5 damage); on foot he is down 6 s. Every phase change is 3.5 s of
// invulnerability and gets the team back up; enraged after 240 s (expert 180).
// The Frozen: the airfield's ground crew, frozen in the drifts. They lie buried (a mound, a hand) until someone comes within 5 m, fires
// within 18 m or hits them, then burst up and rush for 2.6 s; fire and blasts hurt them 1.6×, their claws chill (−25 % speed 1.8 s).
const CH_PH=[1,.7,.3],CH_S=1.15;
const CH_POSE=['','seat','flare','kneel','scream','crawl','run','down','point'];
const CH_MIX=[['frozen',30],['rager',34],['runner',24],['scream',6],['squad',6]];
const CH_PAX=[['rager',45],['runner',35],['squad',20]];// the passengers he lets down on the ropes
const chYaw=(dx,dz)=>Math.atan2(-dx,-dz),chAng=(a,b)=>wrapA(b-a);
const _chV=new THREE.Vector3(),_chV2=new THREE.Vector3(),_chV3=new THREE.Vector3(),_chM=new THREE.Matrix4();

// ---------- atlas materials: the helicopter's winter paint, its glass, the rotor blades, the AA guns, the flare gun, the Frozen's snow ----------
const CH_MATS=['chSkin','chSkinD','chGlass','chRotor','chMark','chBurn','chAA','chAAd','chFlare','chRope','chInst','frSnow','frHand'];
for(const m of CH_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintChAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // winter grey over olive drab, the panel lines, rivets, exhaust soot and oil streaks
  patch('chSkin',(xx,y,X,Y)=>{const t=nz(X,Y,8101,22),w=nz(X,Y,8102,30);let c=t>.58?'#9aa09c':t>.4?'#8a908c':'#7c827e';if(w>.62)c=mix(c,'#56603e',clamp((w-.62)*3,0,.7));
    if(xx%42<1||y%36<1)c=dk(c,.3);if((xx%42===4||xx%42===38)&&y%6===3)c=lt(c,.15);if(nz(X,Y,8103,8)>.72)c=mix(c,'#3a3428',.4);return c},242);
  patch('chSkinD',(xx,y,X,Y)=>{const t=nz(X,Y,8111,16);let c=t>.55?'#4a4e4c':'#3e4240';if(xx%32<1||y%32<1)c='#2a2e2c';if(nz(X,Y,8112,10)>.7)c=mix(c,'#1a1a18',.5);return c},242);
  patch('chGlass',(xx,y,X,Y)=>{let c=mix('#0e2830','#1c3e46',nz(X,Y,8121,10));if((xx+y*.5)%46<5)c='#4a7a84';if(xx<3||y<3||xx>PS-4||y>PS-4)c='#1a1c1c';return c},246);
  patch('chRotor',(xx,y)=>{let c=y%40<2?'#2a2c2c':'#161818';if(xx>PS-18)c='#d8b020';return c},244);
  // the flank marking: a red band, RT-1's white chevron and the tail number 06 in block figures
  patch('chMark',(xx,y,X,Y)=>{let c=nz(X,Y,8131,20)>.5?'#8e9490':'#848a86';const u=xx/PS,v=y/PS;if(v>.78)c='#a81e16';if(v<.7&&Math.abs(v-.36-Math.abs(u-.24)*.9)<.06&&u<.48)c='#e8e8e0';
    const seg=(x0,y0,x1,y1)=>u>x0&&u<x1&&v>y0&&v<y1;if(seg(.56,.14,.62,.62)||seg(.56,.14,.72,.2)||seg(.56,.56,.72,.62)||seg(.66,.14,.72,.62))c='#f0f0e8';
    if(seg(.78,.14,.84,.62)||seg(.78,.14,.94,.2)||seg(.78,.35,.94,.41)||seg(.78,.56,.94,.62)||seg(.88,.35,.94,.62))c='#f0f0e8';return c},243);
  patch('chBurn',(xx,y,X,Y)=>{const t=nz(X,Y,8141,10);let c=t>.6?'#4a2a14':t>.42?'#1c1a18':'#0e0e0e';if(hash2(X,Y,8142)<.02)c='#8a4a1e';return c});
  patch('chAA',(xx,y,X,Y)=>{const t=nz(X,Y,8151,18);let c=t>.55?'#5a6244':'#4e563a';if(nz(X,Y,8152,30)>.62)c=mix(c,'#d8dcd8',.5);if(xx%48<1||y%48<1)c=dk(c,.25);return c},243);
  patch('chAAd',(xx,y,X,Y)=>{let c=mix('#2a2e2e','#363a3a',nz(X,Y,8161,12));if(y%24<2)c='#1a1c1c';return c},244);
  patch('chFlare',(xx,y,X,Y)=>{let c=mix('#d8621a','#e87428',nz(X,Y,8171,10));if(xx<6||xx>PS-7)c='#a8481a';return c},245);
  patch('chRope',(xx,y)=>((xx+y)%10<5?'#8a7a5a':'#6a5a40'));
  patch('chInst',(xx,y)=>{let c=(xx%16<12&&y%16<10)?((xx+y)%32<16?'#3aff7a':'#ffb030'):'#0a1a0e';return c},234);
  // the Frozen's drift: blown snow with a crust; its hand frozen grey-blue
  patch('frSnow',(xx,y,X,Y)=>{const t=nz(X,Y,8181,14);return t>.62?'#f4f8fa':t>.4?'#e2e8ec':'#cdd6de'},255);
  patch('frHand',(xx,y,X,Y)=>{let c=mix('#8a9aa8','#a8b8c4',nz(X,Y,8191,6));if(nz(X,Y,8192,9)>.66)c='#e8f2f8';return c},250);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintChAtlas()}}

// ---------- the models (the weapon material) ----------
// FERRY 06's frame: x right, y up, -z forward (mesh.rotation.y = its yaw); y 0 is the bottom of the skids, the main rotor's hub at
// (0, 3.85, -0.8); the cockpit -5.4..-3.4, the cabin -3.4..1.8 with a door each side, the tail boom out to z 8.6
{const blades=(n,R,w,mat)=>{const L=[Pt(0,0,0,.62,.3,.62,'gunmetal')];for(let k=0;k<n;k++){const g=k/n*TAU,cx=Math.sin(g)*R/2,cz=Math.cos(g)*R/2;
    L.push(Pt(cx,.02,cz,w,.05,R,mat,{ry:g}),Pt(Math.sin(g)*(R-.25),.025,Math.cos(g)*(R-.25),w*.98,.055,.5,'yellow',{ry:g}))}return L};
  Object.assign(GUNS,{
  chHull:{parts:[
    // the cabin; the cockpit's tub (its glazing is a see-through mesh of its own: HELI.build, so he shows in his seat), the nose, the glare
    // shield and the panel, the window frame, the roof, two seats and the stick; the doors (dark openings), the engine deck, exhausts, the mast
    Pt(0,1.62,-.8,2.4,2.24,5.2,'chSkin'),Pt(0,.9,-4.4,2.2,.8,2,'chSkin'),Pt(0,1.12,-5.72,1.6,1.1,.8,'chSkinD'),Pt(0,1.48,-5.2,1.8,.22,.4,'chSkinD'),Pt(0,1.44,-4.99,1.5,.16,.02,'chInst'),
    Pt(1.06,1.93,-5.36,.08,1.26,.08,'chSkinD'),Pt(-1.06,1.93,-5.36,.08,1.26,.08,'chSkinD'),Pt(0,1.93,-5.38,.06,1.26,.06,'chSkinD'),Pt(1.06,1.93,-3.46,.08,1.26,.08,'chSkinD'),Pt(-1.06,1.93,-3.46,.08,1.26,.08,'chSkinD'),
    Pt(0,2.6,-4.4,2.2,.08,2,'chSkin'),Pt(-.48,1.02,-4.2,.52,.14,.52,'blk2'),Pt(-.48,1.45,-3.9,.52,.8,.1,'blk2'),Pt(.48,1.02,-4.2,.52,.14,.52,'blk2'),Pt(.48,1.45,-3.9,.52,.8,.1,'blk2'),Pt(-.48,1.2,-4.72,.04,.42,.04,'blk'),
    Pt(1.205,1.55,-1.6,.02,1.45,1.7,'blk2'),Pt(-1.205,1.55,-1.6,.02,1.45,1.7,'blk2'),Pt(1.21,1.92,1.05,.02,.62,1.3,'chMark'),Pt(-1.21,1.92,1.05,.02,.62,1.3,'chMark'),
    Pt(0,3.03,-.4,1.7,.72,3.4,'chSkinD'),Pt(.72,3.12,1.42,.32,.32,.46,'chBurn'),Pt(-.72,3.12,1.42,.32,.32,.46,'chBurn'),Pt(0,3.56,-.8,.3,.52,.3,'gunmetal'),
    // stub wings with the rocket pods, the skids on their struts, the searchlight under the nose, the steps
    Pt(1.72,1.22,-1.1,1,.14,.9,'chSkinD'),Pt(-1.72,1.22,-1.1,1,.14,.9,'chSkinD'),Pt(2.28,1.02,-1.1,.38,.38,1.3,'chAAd'),Pt(-2.28,1.02,-1.1,.38,.38,1.3,'chAAd'),
    Pt(2.28,1.02,-1.76,.3,.3,.02,'blk'),Pt(-2.28,1.02,-1.76,.3,.3,.02,'blk'),
    Pt(1.05,.06,-1.2,.1,.1,4.8,'gunmetal'),Pt(-1.05,.06,-1.2,.1,.1,4.8,'gunmetal'),...[-2.8,.3].flatMap(z=>[Pt(1,.3,z,.08,.5,.08,'gunmetal'),Pt(-1,.3,z,.08,.5,.08,'gunmetal')]),
    Pt(0,.42,-4.8,.36,.24,.36,'gunmetal'),Pt(0,.29,-4.8,.28,.02,.28,'lgLamp'),Pt(1.26,.62,-1.6,.14,.04,1.2,'gunmetal'),Pt(-1.26,.62,-1.6,.14,.04,1.2,'gunmetal'),
    // snow caked on the engine deck and the stub wings
    Pt(0,3.4,-.6,1.5,.04,2.4,'frSnow'),Pt(1.72,1.3,-1.1,.9,.03,.8,'frSnow'),Pt(-1.72,1.3,-1.1,.9,.03,.8,'frSnow')],grip:[0,0,0],muzzle:[0,0,0]},
  // the tail boom (its own mesh: broken off on the wreck), the fin and the stabiliser, a red band
  chBoom:{parts:[Pt(0,2.12,5.1,.72,.84,6.6,'chSkin'),Pt(0,2.22,8.2,.5,.62,1.4,'chSkin'),Pt(0,3.2,8.7,.12,2.1,1.3,'chSkin',{rx:-.28}),Pt(0,2.24,7.6,2.4,.1,.72,'chSkin'),Pt(0,2.12,6.4,.74,.86,.3,'red')],grip:[0,0,0],muzzle:[0,0,0]},
  chRotor:{parts:blades(4,7,.42,'chRotor'),grip:[0,0,0],muzzle:[0,0,0]},
  chTailR:{parts:[Pt(0,0,0,.18,.3,.3,'gunmetal'),Pt(.06,.7,0,.04,1.4,.2,'chRotor'),Pt(.06,-.7,0,.04,1.4,.2,'chRotor'),Pt(.06,1.32,0,.045,.18,.21,'yellow'),Pt(.06,-1.32,0,.045,.18,.21,'yellow')],grip:[0,0,0],muzzle:[0,0,0]},
  // the door gun on its pintle (its own frame: barrel along -z), the door gunner (an RT-1 crewman, seated in the right door, facing out)
  chDoorGun:{parts:[Pt(0,0,-.45,.09,.13,1.05,'blk2'),Pt(0,0,-1.12,.035,.035,.55,'gunmetal'),Pt(.12,-.06,-.32,.13,.15,.2,'olive'),Pt(0,-.22,-.2,.04,.36,.04,'gunmetal')],grip:[0,0,0],muzzle:[0,0,-1.4]},
  chGunner:{parts:[Pt(0,1.56,0,.3,.3,.32,'olive'),Pt(0,1.42,-.16,.24,.17,.04,'frHand'),Pt(0,1.62,-.15,.28,.08,.05,'blk'),Pt(0,1.06,0,.42,.62,.3,'olive2'),Pt(0,1.1,-.13,.4,.4,.06,'olive'),
    Pt(.21,1.14,-.26,.12,.12,.46,'olive2'),Pt(-.21,1.14,-.26,.12,.12,.46,'olive2'),Pt(.21,1.14,-.5,.1,.1,.1,'glove'),Pt(-.21,1.14,-.5,.1,.1,.1,'glove'),
    Pt(.12,.62,-.25,.16,.16,.5,'olive'),Pt(-.12,.62,-.25,.16,.16,.5,'olive'),Pt(.12,.36,-.5,.15,.5,.16,'olive'),Pt(-.12,.36,-.5,.15,.5,.16,'olive'),Pt(.12,.1,-.55,.16,.12,.26,'blk2'),Pt(-.12,.1,-.55,.16,.12,.26,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  // the AA gun: a pedestal, the turret that turns on it, the twin barrels that rise in its cradle
  chAABase:{parts:[Pt(0,.3,0,1.3,.6,1.3,'chAAd'),Pt(0,.64,0,1,.08,1,'gunmetal')],grip:[0,0,0],muzzle:[0,0,0]},
  chAATur:{parts:[Pt(0,.18,0,1.5,.36,1.7,'chAA'),Pt(.66,.72,0,.16,.84,1,'chAA'),Pt(-.66,.72,0,.16,.84,1,'chAA'),Pt(0,.42,.86,.6,.12,.44,'blk2'),Pt(0,.68,1.02,.6,.5,.08,'blk2'),Pt(.44,1.16,.24,.12,.22,.14,'blk'),
    Pt(0,.37,0,1.4,.03,1.6,'frSnow')],grip:[0,0,0],muzzle:[0,0,0]},
  chAABar:{parts:[Pt(0,0,-.1,.96,.46,.84,'chAA'),Pt(.32,0,-1.6,.14,.14,2.9,'chAAd'),Pt(-.32,0,-1.6,.14,.14,2.9,'chAAd'),Pt(.32,0,-3.08,.22,.22,.26,'blk2'),Pt(-.32,0,-3.08,.22,.22,.26,'blk2'),
    Pt(.32,.32,.12,.2,.2,.5,'brass'),Pt(-.32,.32,.12,.2,.2,.5,'brass')],grip:[0,0,0],muzzle:[0,0,-3.2]},
  // CHARON's flare pistol (the grip at the hand), a flare in flight, the rope he lets the passengers down on
  chFlareGun:{parts:[Pt(0,0,-.1,.06,.09,.26,'chFlare'),Pt(0,.02,-.27,.075,.075,.2,'chFlare'),Pt(0,-.1,0,.05,.15,.07,'blk2'),Pt(0,-.04,-.05,.012,.06,.03,'blk')],grip:[0,0,0],muzzle:[0,.02,-.38]},
  chFlareP:{parts:[Pt(0,0,0,.09,.09,.14,'lgLamp'),Pt(0,0,.1,.06,.06,.1,'chFlare')],grip:[0,0,0],muzzle:[0,0,0]},
  chRopeM:{parts:[Pt(0,-.5,0,.05,1,.05,'chRope')],grip:[0,0,0],muzzle:[0,0,0]},
  // a Frozen's drift: a snow mound, a frozen hand and forearm out of it (at the buried body's origin + 1.45)
  // (heaped unevenly — lumps at either end, a few chunks — with the hi-vis cuff at the wrist)
  frMound:{parts:[Pt(0,1.49,0,1.7,.14,.95,'frSnow',{ry:.12}),Pt(.08,1.6,-.1,1.25,.16,.72,'frSnow',{ry:-.2}),Pt(-.1,1.71,.08,.7,.12,.5,'frSnow',{ry:.5}),
    Pt(.45,1.56,.4,.52,.15,.42,'frSnow',{ry:.9}),Pt(-.55,1.54,-.36,.46,.13,.38,'frSnow',{ry:-.7}),Pt(.66,1.5,-.44,.22,.08,.2,'frSnow',{ry:.4}),Pt(-.72,1.49,.3,.18,.06,.16,'frSnow',{ry:1.1}),
    Pt(.27,1.74,-.12,.14,.1,.14,'chFlare',{rz:-.25}),Pt(.3,1.88,-.12,.1,.28,.1,'frHand',{rz:-.25}),Pt(.35,2.04,-.12,.12,.08,.14,'frHand',{rz:-.25})],grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: the rotor and turbine (a loop), rockets, the AA guns and their flak, the crash, a cockpit alarm, the mayday, the flare
// gun, the Frozen breaking out of the ice, the ropes ----------
// (the rotor: blade slaps at 4.5 a second — nine in the 2 s loop — over the turbine's whine and the wash of air)
function chSlap(B,t,a,out){const e=B.env(t,.004,a,.09,out);B.nz('brown',t,.12,B.f('lowpass',380,.9,e));const e2=B.env(t,.002,a*.5,.04,out);B.nz('pink',t,.05,B.f('bandpass',900,1.2,e2))}
Object.assign(SFX,{
  chrotor:{n:1,dur:2,ch:1,peak:.8,gain:.8,rev:.1,poly:1,loop:.02,fn:B=>{const out=B.g(.9);for(let i=0;i<9;i++)chSlap(B,i*(2/9),1,out);
    {const e=B.env(0,.05,.18,.05,out,1.9);B.osc('sine',1740,1740,0,2,B.f('bandpass',1740,6,e))}{const e=B.env(0,.05,.26,.05,out,1.9);B.nz('pink',0,2,B.f('lowpass',700,.6,e))}
    {const e=B.env(0,.05,.1,.05,out,1.9);B.osc('sawtooth',63,63,0,2,B.f('lowpass',240,.8,e))}}},
  chrkt:{n:2,dur:1.6,ch:2,peak:.88,gain:.85,rev:.3,poly:4,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.005,1,.08,out);B.nz('white',0,.1,B.f('highpass',1500,.7,e))}
    {const e=B.env(.02,.05,.8,1.2,out,.2);const f=B.f('bandpass',1200,1.4,e);B.sweep(f,2600,v?500:700,.02,1.4);B.nz('pink',.02,1.5,f)}{const e=B.env(0,.004,.8,.25,out);B.osc('sine',90,40,0,.3,e)}}},
  chflak:{n:2,dur:.9,ch:2,peak:.92,gain:.9,rev:.2,poly:4,fn:(B,v)=>{const out=B.comp(-10,4,.002,.15,B.g(.9));for(let i=0;i<4;i++){const t=i*.19+(v?.02:0);
    {const e=B.env(t,.002,1,.12,out);B.nz('white',t,.14,B.f('lowpass',2600,.7,e))}{const e=B.env(t,.002,1,.22,out);B.osc('sine',110,38,t,.25,e)}}}},
  chburst:{n:3,dur:1.4,ch:2,peak:.88,gain:.8,rev:.5,poly:6,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.002,1,.06,out);B.nz('white',0,.08,B.f('highpass',900+v*300,.7,e))}
    {const e=B.env(.01,.01,.8,1.1,out);B.nz('brown',.01,1.2,B.f('lowpass',500,.6,e))}}},
  chcrash:{n:1,dur:3,ch:2,peak:.95,gain:.95,rev:.45,poly:1,fn:B=>{const out=B.comp(-12,5,.002,.25,B.g(.9));{const e=B.env(0,.003,1,.9,out);B.osc('sine',60,26,0,1.1,e)}
    {const e=B.env(0,.002,1,.6,out);B.nz('brown',0,.8,B.f('lowpass',900,.7,e))}{const e=B.env(.05,.02,.7,1.6,out,.2);const f=B.f('bandpass',1400,2,e);B.sweep(f,2200,500,.05,1.8);B.nz('white',.05,2,f)}
    for(let i=0;i<60;i++){const t=Math.pow(Math.random(),1.6)*2.2;B.grain(t,rr(1500,7000),rr(5,12),rr(.008,.04),rr(.15,.55)*(1-t/2.6),B.pan(rr(-.9,.9),out))}
    for(let i=0;i<6;i++)B.ring(rr(.05,.9),rr(700,1600),[1,2.3,3.9],[.5,.3,.2],[.35,.2,.1],B.pan(rr(-.6,.6),out))}},
  chalarm:{n:1,dur:1.2,ch:1,peak:.7,gain:.55,rev:.1,poly:1,fn:B=>{const out=B.g(.9);for(let i=0;i<4;i++){const t=i*.3,f=i%2?880:1320;const e=B.env(t,.005,.8,.04,out,.16);B.osc('square',f,f,t,.2,B.f('lowpass',3000,.7,e))}}},
  // the mayday over his radio: a man's voice, clipped and squelched — vowels through a radio band
  chmay:{n:2,dur:2.4,ch:1,peak:.8,gain:.75,rev:.3,poly:1,fn:(B,v)=>{const out=B.sh(5,B.f('highpass',500,.7,B.f('lowpass',2800,.7,B.g(.9))));const V=[[700,1100,2500],[500,1500,2500],[300,2200,2900],[550,900,2400]];let t=.12;
    {const e=B.env(0,.002,.5,.08,out);B.nz('white',0,.1,B.f('bandpass',2400,1,e))}
    for(let i=0;i<9;i++){const d=rr(.12,.22),vw=V[(hash2(i,v+1,8201)*V.length)|0],fb=B.oc.createGain();for(let k=0;k<3;k++)fb.connect(B.f('bandpass',vw[k],7,B.g([1,.5,.25][k],out)));
      const e=B.env(t,.015,1,.05,fb,d);const o=B.oc.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(rr(128,150)*(i%3===2?1.25:1),t);o.frequency.linearRampToValueAtTime(rr(115,140),t+d);o.connect(e);o.start(t);o.stop(t+d+.1);
      t+=d+(i%3===2?rr(.14,.24):rr(.02,.05));if(t>2.1)break}{const e=B.env(t,.002,.5,.12,out);B.nz('white',t,.14,B.f('bandpass',2400,1,e))}}},
  chflare:{n:2,dur:1.4,ch:2,peak:.85,gain:.8,rev:.3,poly:4,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.002,1,.05,out);B.nz('white',0,.06,B.f('bandpass',1600,1,e))}{const e=B.env(0,.002,.8,.12,out);B.osc('sine',180,70,0,.14,e)}
    {const e=B.env(.03,.08,.45,.9,out,.3);B.nz('pink',.03,1.3,B.f('highpass',2400+v*400,.7,e))}}},
  // a Frozen breaking out: the snow bursting, the ice cracking off; shattering when it dies
  frburst:{n:3,dur:1.1,ch:2,peak:.85,gain:.78,rev:.25,poly:6,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.01,1,.4,out);B.nz('pink',0,.5,B.f('lowpass',1800+v*300,.6,e))}
    for(let i=0;i<14;i++)B.grain(rr(.02,.5),rr(2500,7000),rr(6,12),rr(.006,.02),rr(.25,.6),B.pan(rr(-.5,.5),out))}},
  frshat:{n:2,dur:1.2,ch:2,peak:.85,gain:.75,rev:.3,poly:6,fn:(B,v)=>{const out=B.g(.9);for(let i=0;i<36;i++){const t=Math.pow(Math.random(),1.5)*.9;B.grain(t,rr(3000,9000),rr(8,16),rr(.004,.02),rr(.2,.6)*(1-t),B.pan(rr(-.8,.8),out))}
    for(let i=0;i<4;i++)B.ring(rr(0,.2),rr(2200,4200),[1,2.76,5.4],[.5,.3,.2],[.25,.12,.06],B.pan(rr(-.5,.5),out))}},
  chrope:{n:1,dur:1,ch:1,peak:.7,gain:.55,rev:.2,poly:3,fn:B=>{const out=B.g(.9);const e=B.env(0,.05,.7,.3,out,.5);const f=B.f('bandpass',1500,1.2,e);B.sweep(f,900,2600,0,.8);B.nz('white',0,.9,f)}}});
SFX_ORDER.push('chrotor','chrkt','chflak','chburst','chcrash','chalarm','chmay','chflare','frburst','frshat','chrope');
// (the rotor plays as one looping voice at the helicopter, its level and filter from the distance, through the head when there is room)
const CHSND={src:null,g:null,p:null,f:null,
  start(){const c=AU.ctx;if(!c||!AU.sfx||c.state!=='running'||this.src)return;const b=AU.bank&&AU.bank.chrotor;if(!b||!b.length)return;
    const s=c.createBufferSource();s.buffer=b[0];s.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=9000;f.Q.value=.5;const g=c.createGain();g.gain.value=0;s.connect(f);f.connect(g);
    let p=null;if(c.createPanner){p=c.createPanner();p.panningModel=CFG.hrtf===false?'equalpower':'HRTF';p.distanceModel='linear';p.rolloffFactor=0;p.refDistance=1;p.maxDistance=1e4;g.connect(p);p.connect(AU.sfx)}else g.connect(AU.sfx);
    s.start();this.src=s;this.g=g;this.p=p;this.f=f},
  stop(){if(!this.src)return;const c=AU.ctx;try{this.g.gain.setTargetAtTime(0,c.currentTime,.08);this.src.stop(c.currentTime+.5)}catch(e){}this.src=null;this.g=this.p=this.f=null},
  // every frame: where it is, how fast the rotor turns (0..1)
  update(x,y,z,rpm){const c=AU.ctx;if(!c)return;if(!(rpm>.02)||AU.muted||!(AU.vol>0)){this.stop();return}if(!this.src)this.start();if(!this.src)return;
    const L=AU.L,dx=x-L.x,dy=y-L.y,dz=z-L.z,d=Math.hypot(dx,dy,dz),R0=170,t=c.currentTime;const att=d>R0?0:Math.pow(1-d/R0,1.4)/(1+d*.025);
    const occ=d>4&&!losClear(L.x,L.y,L.z,x,y,z);const sd=soundDesign('chrotor');
    this.g.gain.setTargetAtTime(att*rpm*(occ?.6:1)*1.1*(sd.vol==null?1:sd.vol),t,.08);this.f.frequency.setTargetAtTime(occ?900:lerp(9000,1800,clamp(d/R0,0,1)),t,.1);this.src.playbackRate.setTargetAtTime(.6+.4*rpm,t,.2);
    if(this.p){const P=this.p;if(P.positionX){P.positionX.setTargetAtTime(x,t,.03);P.positionY.setTargetAtTime(y,t,.03);P.positionZ.setTargetAtTime(z,t,.03)}else P.setPosition(x,y,z)}}};

// ---------- FERRY 06, the helicopter (every page draws it; the host flies it) ----------
// x, y, z: its frame's origin (the bottom of the skids); yaw; pitch (+ nose down) and roll (+ right side down), the look of how it flies;
// v*: its velocity; rpm 0..1; smoke 0..1 (the engine on fire); gun: the door gunner still in his door; rope: the ropes out (a drop);
// wreck: burnt out on the apron (its boxes block the world then). The host's brain (CHARON) sets where it should be (tx, ty, tz), how fast
// (vmax) and the heading to hold (fy, or null: into its own flight); HELI.fly takes it there.
const HELI={on:false,vis:false,wreck:false,x:0,y:0,z:0,yaw:0,pitch:0,roll:0,vx:0,vy:0,vz:0,rpm:0,spinA:0,smoke:0,gun:true,rope:0,wob:0,spinY:0,sl:null,gunT:null,
  tx:0,ty:20,tz:0,vmax:12,fy:null,ax:0,az:0,
  g:null,body:null,hull:null,boom:null,rotor:null,disc:null,tailR:null,dgun:null,gunner:null,glass:null,ropes:[],mat:null,beam:null,beamMat:null,lt:{},inv:new THREE.Matrix4(),boxes:[],prT:0,alT:0,smT:0,
  // local hit volumes [x0,y0,z0,x1,y1,z1,part]
  BX:[[-1.1,.5,-6.1,1.1,2.62,-3.4,'cockpit'],[-1.2,.5,-3.4,1.2,2.74,1.8,'body'],[-.85,2.67,-2.1,.85,3.4,1.65,'engine'],[-.36,1.7,1.8,.36,2.54,8.9,'body'],[-.1,2.2,8,.1,4.3,9.4,'body'],
    [.3,1.6,8.1,.56,4.4,9.1,'tail'],[-2.5,.8,-1.8,2.5,1.32,-.4,'body']],
  GB:[.7,.55,-2.05,1.48,1.95,-1.15,'gunner'],
  build(){if(this.g)return;const mat=this.mat=matGun(),g=this.g=new THREE.Group();g.visible=false;R.scene.add(g);
    const mk=(id,parent,x,y,z)=>{const m=new THREE.Mesh(gunGeo(id),mat);m.frustumCulled=false;const q=new THREE.Group();q.position.set(x||0,y||0,z||0);q.add(m);parent.add(q);return q};
    const body=this.body=new THREE.Group();g.add(body);
    this.hull=mk('chHull',body);this.boom=mk('chBoom',body);this.rotor=mk('chRotor',body,0,3.85,-.8);this.tailR=mk('chTailR',body,.42,3.05,8.62);
    this.dgun=mk('chDoorGun',body,1.34,1.36,-1.7);this.gunner=mk('chGunner',body,.98,.6,-1.6);this.gunner.rotation.y=-Math.PI/2;
    // the rotor's blur: a soft disc that shows as it spins up
    {const [cv,x]=mkCanvas(128,128);const gr=x.createRadialGradient(64,64,8,64,64,63);gr.addColorStop(0,'rgba(40,44,46,0)');gr.addColorStop(.35,'rgba(40,44,46,.55)');gr.addColorStop(.9,'rgba(60,64,66,.7)');gr.addColorStop(.97,'rgba(200,170,40,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');
      x.fillStyle=gr;x.fillRect(0,0,128,128);const geo=new THREE.CircleGeometry(7.05,40);geo.rotateX(-Math.PI/2);
      this.disc=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));this.disc.position.set(0,3.86,-.8);this.disc.renderOrder=2;body.add(this.disc)}
    // the cockpit's glazing: tinted, see-through, fogged like the world
    {const gm=new THREE.ShaderMaterial({uniforms:{uFogC:LU.uFogC,uFogD:LU.uFogD},transparent:true,depthWrite:false,
        vertexShader:'varying vec3 vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
        fragmentShader:'uniform vec3 uFogC;uniform float uFogD;varying vec3 vP;void main(){float d=length(vP-cameraPosition);float f=1.-exp(-uFogD*uFogD*d*d);gl_FragColor=vec4(mix(vec3(.3,.42,.48),uFogC,f),.3*(1.-f*.6));}'});
      this.glass=new THREE.Mesh(new THREE.BoxGeometry(2.14,1.24,1.94),gm);this.glass.position.set(0,1.93,-4.4);this.glass.renderOrder=2;this.glass.frustumCulled=false;body.add(this.glass)}
    // the ropes (shown for a drop), the searchlight's beam (a soft cone toward where it looks)
    for(const sd of [-1,1]){const r=new THREE.Mesh(gunGeo('chRopeM'),mat);r.frustumCulled=false;r.visible=false;r.position.set(sd*1.34,1.1,-1.6);body.add(r);this.ropes.push(r)}
    const cg=new THREE.CylinderGeometry(.1,1,1,16,1,true);cg.rotateX(-Math.PI/2);cg.translate(0,0,.5);const p=cg.attributes.position,col=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const k=1-.9*p.getZ(i);col[i*3]=col[i*3+1]=col[i*3+2]=k}
    cg.setAttribute('color',new THREE.BufferAttribute(col,3));this.beamMat=new THREE.MeshBasicMaterial({color:0xfff2d8,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
    this.beam=new THREE.Mesh(cg,this.beamMat);this.beam.frustumCulled=false;this.beam.renderOrder=2;this.beam.visible=false;R.scene.add(this.beam)},
  lights(on){const L=this.lt;if(on&&!L.r){L.r=DL.add(0,0,0,'#ff2a14',5,0,0);L.gr=DL.add(0,0,0,'#2aff5a',5,0,0);L.ac=DL.add(0,0,0,'#ff3a1a',9,0,0);L.sl=DL.add(0,0,0,'#fff2d8',12,0,0);L.fi=DL.add(0,0,0,'#ff8a3a',12,0,0,{flick:.35})}
    if(!on)for(const k in L){if(L[k])L[k].dead=true;L[k]=null}},
  show(on){this.vis=!!on;if(this.g)this.g.visible=this.vis;if(this.beam&&!on)this.beam.visible=false;this.lights(this.vis);if(!on)CHSND.stop()},
  // a fresh FERRY 06 in the air (host and clients alike)
  place(x,y,z,yaw){this.build();Object.assign(this,{on:true,wreck:false,x,y,z,yaw,pitch:0,roll:0,vx:0,vy:0,vz:0,rpm:1,smoke:0,gun:true,rope:0,wob:0,spinY:0,tx:x,ty:y,tz:z,vmax:12,fy:null,sl:null,gunT:null});
    this.unwreck();this.tint(false);this.boom.position.set(0,0,0);this.boom.rotation.set(0,0,0);this.rotor.visible=this.tailR.visible=this.disc.visible=this.glass.visible=true;this.show(true);this.prT=0;this.pose()},
  hide(){this.on=false;this.wreck=false;this.rope=0;this.unwreck();this.show(false)},
  clear(){this.hide();CHSND.stop();if(this.g){R.scene.remove(this.g);this.g=null}if(this.glass){this.glass.geometry.dispose();this.glass.material.dispose();this.glass=null}if(this.beam){R.scene.remove(this.beam);this.beam.geometry.dispose();this.beamMat.dispose();this.beam=null}if(this.mat){this.mat.dispose();this.mat=null}
    this.ropes=[];this.disc=null},
  tint(burnt){if(!this.mat)return;const T=this.mat.uniforms.uTint.value;if(burnt)T.set(.05,.04,.035,.75);else T.set(0,0,0,0)},
  flying(){return this.on&&this.vis&&!this.wreck},
  // the frame: its matrices from the pose; a local point to the world (out), the world to local
  pose(){if(!this.g)return;this.g.position.set(this.x,this.y,this.z);this.g.rotation.y=this.yaw;this.body.rotation.set(-this.pitch,0,-this.roll);this.g.updateMatrixWorld(true);this.inv.copy(this.body.matrixWorld).invert()},
  toW(lx,ly,lz,out){out=out||_chV;out.set(lx,ly,lz);if(this.body)out.applyMatrix4(this.body.matrixWorld);else out.set(this.x+lx,this.y+ly,this.z+lz);return out},
  seat(out){return this.toW(-.48,.95,-4.35,out)},// the pilot's seat (left), where CHARON sits
  muzzle(out){out=out||_chV3;if(this.dgun){out.set(0,0,-1.4);return out.applyMatrix4(this.dgun.matrixWorld)}return this.toW(1.4,1.36,-3,out)},
  // a shot at it: the ray into its own frame, the nearest of its volumes (bullets go through the rotor)
  ray(ox,oy,oz,dx,dy,dz,tmax){if(!this.flying())return null;const qx=this.x-ox,qy=this.y+2-oy,qz=this.z-oz,tc=qx*dx+qy*dy+qz*dz;if(tc<-12||tc>tmax+12)return null;
    const mx=qx-dx*tc,my=qy-dy*tc,mz=qz-dz*tc;if(mx*mx+my*my+mz*mz>110)return null;
    const o=_chV.set(ox,oy,oz).applyMatrix4(this.inv),d=_chV2.set(dx,dy,dz).transformDirection(this.inv);let bt=tmax,part=null;
    for(const b of this.BX){const t=rayAABB(o.x,o.y,o.z,d.x,d.y,d.z,b[0],b[1],b[2],b[3],b[4],b[5],bt);if(t>=0&&t<bt){bt=t;part=b[6]}}
    if(this.gun){const b=this.GB,t=rayAABB(o.x,o.y,o.z,d.x,d.y,d.z,b[0],b[1],b[2],b[3],b[4],b[5],bt);if(t>=0&&t<bt){bt=t;part='gunner'}}
    if(part)this.lastPart=part;return part?{t:bt,part}:null},
  // which volume a hit point (on its surface) belongs to
  partAt(x,y,z){if(x==null)return this.lastPart||'body';const p=_chV.set(x,y,z).applyMatrix4(this.inv),m=.08,inn=b=>p.x>b[0]-m&&p.x<b[3]+m&&p.y>b[1]-m&&p.y<b[4]+m&&p.z>b[2]-m&&p.z<b[5]+m;
    if(this.gun&&inn(this.GB))return 'gunner';for(const k of ['engine','tail','cockpit'])for(const b of this.BX)if(b[6]===k&&inn(b))return k;return 'body'},
  // ---------- the host's flying: toward (tx, ty, tz) at up to vmax, eased in; heading fy (or into its flight); the look from the accelerations ----------
  fly(dt){if(!this.on||this.wreck)return;const dx=this.tx-this.x,dz=this.tz-this.z,dh=Math.hypot(dx,dz),want=Math.min(this.vmax,Math.sqrt(2*5*Math.max(0,dh-.2)));
    const wx=dh>.05?dx/dh*want:0,wz=dh>.05?dz/dh*want:0,ax=clamp((wx-this.vx)*2.2,-9,9),az=clamp((wz-this.vz)*2.2,-9,9);
    this.vx+=ax*dt;this.vz+=az*dt;this.vy=approach(this.vy,clamp((this.ty-this.y)*1.3,-6,4.5),7*dt);this.x+=this.vx*dt;this.y+=this.vy*dt;this.z+=this.vz*dt;this.ax=ax;this.az=az;
    if(this.spinY)this.yaw=wrapA(this.yaw+this.spinY*dt);
    else{const sp=Math.hypot(this.vx,this.vz),fy=this.fy!=null?this.fy:(sp>3?chYaw(this.vx,this.vz):this.yaw);this.yaw=wrapA(this.yaw+clamp(chAng(this.yaw,fy),-1.25*dt,1.25*dt))}
    const fx=-Math.sin(this.yaw),fz=-Math.cos(this.yaw),rx=Math.cos(this.yaw),rz=-Math.sin(this.yaw),fa=ax*fx+az*fz,la=ax*rx+az*rz,fv=this.vx*fx+this.vz*fz;
    this.pitch=approach(this.pitch,clamp(fa*.04+fv*.012,-.28,.34),dt*1.6);this.roll=approach(this.roll,clamp(la*.05,-.42,.42),dt*1.8)},
  // ---------- the wreck (phase 3): down where it crashed, the tail boom broken off beside it; boxes in the world for cover ----------
  wreckAt(x,z,yaw){this.build();const q=Math.round(yaw/(Math.PI/2))*(Math.PI/2);Object.assign(this,{on:true,wreck:true,x,y:0,z,yaw:q,pitch:-.06,roll:.16,vx:0,vy:0,vz:0,rpm:0,rope:0,gun:false,spinY:0,smoke:1});
    this.show(true);this.tint(true);this.rotor.visible=this.disc.visible=this.glass.visible=false;this.tailR.visible=false;this.boom.position.set(.6,-1.7,1.2);this.boom.rotation.set(.12,.62,.5);this.pose();this.unwreck();
    const al=Math.abs(Math.sin(q))>.7,hx=al?3.9:1.35,hz=al?1.35:3.9;const cx=x-Math.sin(q)*2.15,cz=z-Math.cos(q)*2.15;
    const add=(x0,y0,z0,x1,y1,z1)=>{const b={x0,y0,z0,x1,y1,z1,mat:'metalx',o:{chWreck:1}};worldAddDyn(b);this.boxes.push(b)};add(cx-hx,0,cz-hz,cx+hx,2.5,cz+hz);
    this.boom.updateMatrixWorld(true);const bw=_chV2.set(0,1.6,5.6).applyMatrix4(this.boom.matrixWorld);add(bw.x-1,0,bw.z-1,bw.x+1,1.2,bw.z+1);this.navPen()},
  unwreck(){for(const b of this.boxes)worldRemoveDyn(b);this.boxes=[];this.pen=null},
  // (the nav nodes under the wreck cost a lot, so the paths go round it: AI.goTo, in the hooks below)
  navPen(){const N=NAV.nodes,P=new Float32Array(N.length);for(const b of this.boxes)for(const n of N){if(n.y>b.y1-.3||n.y<b.y0-.6)continue;
      if(n.x>b.x0-.45&&n.x<b.x1+.45&&n.z>b.z0-.45&&n.z<b.z1+.45)P[n.id]=400}this.pen=P},
  // ---------- every frame (every page): the pose, the rotor, the lights, smoke, the rotor wash, the sound ----------
  update(dt){if(!this.on||!this.g)return;
    if(NET.cli&&!this.wreck){const f=EP.bf,P=f&&f.hp;if(P){const age=Math.min(.25,(performance.now()-(f.rt||0))/1000),k=Math.min(1,dt*8);
        const px=P[0]+P[6]*age,py=P[1]+P[7]*age,pz=P[2]+P[8]*age;this.x+=(px-this.x)*k;this.y+=(py-this.y)*k;this.z+=(pz-this.z)*k;this.vx=P[6];this.vy=P[7];this.vz=P[8];
        this.yaw=wrapA(this.yaw+chAng(this.yaw,P[3])*k);this.pitch+=(P[4]-this.pitch)*k;this.roll+=(P[5]-this.roll)*k;this.rpm=approach(this.rpm,P[9],dt*.8);this.smoke=P[10];this.rope=P[11];this.gun=!!(f.f&32)}}
    this.pose();if(!this.vis)return;
    this.spinA+=dt*this.rpm*23;this.rotor.rotation.y=this.spinA;this.tailR.rotation.x=this.spinA*2.4;if(this.disc)this.disc.material.opacity=this.wreck?0:clamp((this.rpm-.3)*.3,0,.2);
    this.gunner.visible=this.gun&&!this.wreck;this.dgun.visible=!this.wreck;
    // the door gun swings toward what the gunner is shooting at (else straight out of the door)
    {let gy=-Math.PI/2,gp=-.15;if(this.gunT&&this.gun){const l=_chV.copy(this.gunT).applyMatrix4(this.inv),dx=l.x-1.34,dy=l.y-1.36,dz=l.z+1.7;gy=clamp(Math.atan2(-dx,-dz),-Math.PI/2-1.2,-Math.PI/2+1.2);gp=clamp(Math.atan2(dy,Math.hypot(dx,dz)),-1.1,.4)}
      this.dgun.rotation.set(gp,gy,0,'YXZ')}
    // the ropes down to the ground under the doors
    for(let i=0;i<2;i++){const r=this.ropes[i],on=this.rope>0&&!this.wreck;r.visible=on;if(on){const len=Math.max(.5,this.y+1.1-floorY(this.x,this.y,this.z));r.scale.set(1,len,1)}}
    this.prT-=dt;if(this.prT<=0){this.prT=.3;sampleProbe(this.x,this.y+1.6,this.z,this.mat.uniforms.uProbe.value)}
    // lights: red to port, green to starboard, the red beacon blinking on top, the searchlight on its mark, the fire
    const L=this.lt,live=!this.wreck,bl=Math.sin(G.t*6.3)>.7;
    if(L.r){const a=this.toW(-2.55,1.1,-1.1,_chV2);L.r.x=a.x;L.r.y=a.y;L.r.z=a.z;L.r.i=live?.9:0;const b=this.toW(2.55,1.1,-1.1,_chV2);L.gr.x=b.x;L.gr.y=b.y;L.gr.z=b.z;L.gr.i=live?.9:0;
      const c=this.toW(0,3.5,1.2,_chV2);L.ac.x=c.x;L.ac.y=c.y;L.ac.z=c.z;L.ac.i=live&&bl?1.6:0}
    let bOn=false;if(live&&this.sl){const s=this.toW(0,.3,-4.8,_chV2),ex=this.sl.x,ey=this.sl.y,ez=this.sl.z,Ld=Math.hypot(ex-s.x,ey-s.y,ez-s.z);
      if(Ld>1&&Ld<90){bOn=true;this.beam.position.copy(s);this.beam.lookAt(ex,ey,ez);const r=Math.max(.6,Ld*.12);this.beam.scale.set(r,r,Ld);this.beamMat.opacity=.08;if(L.sl){L.sl.x=ex;L.sl.y=ey+1.4;L.sl.z=ez;L.sl.i=2.2}}}
    this.beam.visible=bOn;if(!bOn&&L.sl)L.sl.i=0;
    if(L.fi){const e=this.toW(0,3.2,.6,_chV2);L.fi.x=e.x;L.fi.y=e.y;L.fi.z=e.z;L.fi.i=this.wreck?1.6:this.smoke>.6?1.2:0}
    // smoke and fire out of the engine; the wreck burns
    if(this.smoke>.05||this.wreck){this.smT-=dt;if(this.smT<=0){this.smT=this.wreck?.04:.05;const e=this.toW(rr(-.6,.6),3.3,rr(-.4,1.6),_chV2);
      FX.spawn({x:e.x,y:e.y,z:e.z,vx:rr(-.4,.4)-this.vx*.2,vy:rr(.8,2),vz:rr(-.4,.4)-this.vz*.2,life:rr(1.2,2.4),s0:.4,s1:2,r:.1,g:.1,b:.1,a:.55,f:2,drag:.7});
      if(this.wreck||this.smoke>.6)FX.spawn({x:e.x,y:e.y,z:e.z,vx:rr(-.5,.5),vy:rr(1.2,2.6),vz:rr(-.5,.5),life:rr(.3,.6),s0:.4,s1:.1,r:1,g:.5,b:.15,a:.9,f:11,add:1})}}
    // the rotor wash: snow thrown out under it when it is low
    if(live&&this.rpm>.5){const gy=floorY(this.x,this.y,this.z),h=this.y-gy;if(h<11&&Math.random()<dt*(26-h*2)){const a=Math.random()*TAU,r=rr(2,8);
      FX.spawn({x:this.x+Math.cos(a)*r,y:gy+.2,z:this.z+Math.sin(a)*r,vx:Math.cos(a)*rr(4,9),vy:rr(.3,1.4),vz:Math.sin(a)*rr(4,9),life:rr(.6,1.2),s0:.4,s1:1.6,r:.86,g:.9,b:.94,a:.5,f:2,drag:1.4})}}
    if(live){const P=this.toW(0,2.6,-.8,_chV2);CHSND.update(P.x,P.y,P.z,this.rpm);if(this.smoke>.3){this.alT-=dt;if(this.alT<=0){this.alT=1.3;AU.at('chalarm',P.x,P.y,P.z,{vol:.55,range:45})}}}else CHSND.stop()}};

// ---------- the AA guns: three twin 35 mm guns in sandbag pits on the apron (the boss fight's devices) ----------
// st: 0 ready (hold E 3 s at the loader box: loaded), 1 loaded (it fires at FERRY 06 the moment it is within 85 m and in sight), 2 firing
// (2.2 s of flak, then the hit), 3 reloading (30 s). Every page turns them toward the helicopter and shows the bursts.
const AAG={L:[],T:3,CD:30,R:85,FT:2.2,
  build(){if(this.L.length||!MAP.ez||!MAP.ez.aa)return;for(const s of MAP.ez.aa){const mat=matGun(),base=new THREE.Mesh(gunGeo('chAABase'),mat);base.position.set(s.x,.5,s.z);base.frustumCulled=false;R.scene.add(base);
      const tur=new THREE.Group();tur.position.set(s.x,1.18,s.z);R.scene.add(tur);const tm=new THREE.Mesh(gunGeo('chAATur'),mat);tm.frustumCulled=false;tur.add(tm);
      const bar=new THREE.Group();bar.position.set(0,.98,0);tur.add(bar);const bm=new THREE.Mesh(gunGeo('chAABar'),mat);bm.frustumCulled=false;bar.add(bm);sampleProbe(s.x,1.8,s.z,mat.uniforms.uProbe.value);
      this.L.push({i:s.i,x:s.x,z:s.z,bx:s.bx,bz:s.bz,st:0,p:0,cd:0,ft:0,yaw:Math.PI,pitch:.25,base,tur,bar,bm,mat,lamp:null,fxT:0,rc:0})}},
  reset(){for(const G0 of this.L){G0.st=0;G0.p=0;G0.cd=0;G0.ft=0}},
  near(G0,h){return Math.hypot(h.c.x-G0.bx,h.c.z-G0.bz)<1.6&&h.c.y<1.4},
  muz(G0,out){out=out||_chV;out.set(0,0,-3.2).applyMatrix4(G0.bar.matrixWorld);return out},
  aimPt(out){return HELI.toW(0,2,-1.2,out)},
  inReach(G0){if(!HELI.flying())return false;const c=this.aimPt(_chV2),d=Math.hypot(c.x-G0.x,c.y-2,c.z-G0.z);return d<=this.R&&losClear(G0.x,2.8,G0.z,c.x,c.y,c.z)},
  ready(){let n=0;for(const G0 of this.L)if(G0.st===0)n++;return n},
  // host: the loaders held, the shots, the reloads
  hostTick(dt){const run=EP.st===4&&EP.ph==='run';for(const G0 of this.L){
      if(G0.st===0){let n=0;if(run&&HELI.flying())for(const h of SCEN.H)if(h.alive&&h.epUse===100+G0.i&&G.t>=(h.useBlk||0)&&this.near(G0,h))n++;
        if(n){G0.p+=dt*(n>1?1.25:1);if(G0.p>=this.T){G0.p=0;this.set(G0.i,1)}}else G0.p=Math.max(0,G0.p-dt*1.5)}
      else if(G0.st===1){if(run&&this.inReach(G0))this.set(G0.i,2)}
      else if(G0.st===2){G0.ft+=dt;if(G0.ft>=this.FT){const b=EP.bossA();if(b&&b.cn&&HELI.flying())CHARON.flak(b,G0);this.set(G0.i,3,this.CD)}}
      else if(G0.st===3){G0.cd-=dt;if(G0.cd<=0)this.set(G0.i,0)}}},
  set(i,st,cd,remote){const G0=this.L[i];if(!G0)return;const was=G0.st;G0.st=st;G0.cd=cd||0;G0.ft=0;if(st!==0)G0.p=0;
    if(st===1&&was!==1){AU.at('magin',G0.x,1.6,G0.z,{vol:.9,range:30,rate:.7});AU.at('pickup',G0.x,1.6,G0.z,{vol:.5,range:20,rate:.6})}
    if(st===2&&was!==2)AU.at('chflak',G0.x,2,G0.z,{vol:1,range:150,occ:false});
    if(NET.host&&!remote)netEv('ech',{k:'ag',i,s:st,c:Math.ceil(cd||0)})},
  // every page: the guns turn toward the helicopter, the loader's lamp, the burst
  update(dt){const on=EP.st===4,P=G.player;for(const G0 of this.L){
      if(!G0.lamp)G0.lamp=DL.add(G0.bx,1.7,G0.bz,'#ffb030',4,0,0);
      let ty=G0.yaw,tp=.25;if(HELI.flying()&&on){const c=this.aimPt(_chV2),dx=c.x-G0.x,dy=c.y-2.2,dz=c.z-G0.z;ty=chYaw(dx,dz);tp=clamp(Math.atan2(dy,Math.hypot(dx,dz)),.05,1.35)}
      const rate=G0.st>=1&&G0.st<=2?3.2:1.4;G0.yaw=wrapA(G0.yaw+clamp(chAng(G0.yaw,ty),-rate*dt,rate*dt));G0.pitch=approach(G0.pitch,tp,dt*rate*.7);G0.tur.rotation.y=G0.yaw;G0.bar.rotation.x=G0.pitch;
      const k=G0.st,L=G0.lamp;L.c.set(k===0?'#ffb030':k===1?'#4aff7a':k===2?'#ff8a3a':'#ff2a14');L.i=!on?0:k===0?(.6+.4*Math.abs(Math.sin(G.t*4))):k===1?(Math.sin(G.t*9)>0?1.3:.3):k===2?1.5:.35;
      G0.rc=Math.max(0,G0.rc-dt*7);G0.bm.position.z=G0.rc*.14;
      if(k===2&&on){G0.fxT-=dt;if(G0.fxT<=0){G0.fxT=.1;G0.tur.updateMatrixWorld(true);const m=this.muz(G0,_chV);G0.rc=1;FX.muzzle(m.x,m.y,m.z,0,1,0,true);DL.add(m.x,m.y,m.z,'#ffc070',10,2.4,.06);
          if(HELI.flying()){const c=HELI.toW(rr(-3,3),rr(0,4),rr(-6,6),_chV2);FX.tracer(m.x,m.y,m.z,c.x,c.y,c.z,[1,.75,.35]);
            if(Math.random()<.65){FX.spawn({x:c.x,y:c.y,z:c.z,life:.22,s0:1.3,s1:2.6,r:1,g:.78,b:.4,a:.9,f:1,add:1});FX.spawn({x:c.x,y:c.y,z:c.z,vy:.3,life:rr(1.2,2),s0:1,s1:3,r:.16,g:.15,b:.14,a:.6,f:2,drag:.8});
              if(!AU.throttle('chbu'+G0.i,170))AU.at('chburst',c.x,c.y,c.z,{vol:.85,range:160,occ:false})}}
          if(!AU.throttle('chfl'+G0.i,760))AU.at('chflak',G0.x,2,G0.z,{vol:1,range:150,occ:false});
          if(P&&P.alive&&Math.hypot(P.c.x-G0.x,P.c.z-G0.z)<10)FX.shake=Math.max(FX.shake,.22)}}}},
  pack(){const o=[];for(const G0 of this.L)o.push(G0.st,Math.round(G0.p*10),Math.ceil(G0.cd));return o},
  sync(a){if(!Array.isArray(a))return;for(let i=0;i<this.L.length;i++){const G0=this.L[i],s=a[i*3];if(s==null)continue;if(s!==G0.st){G0.st=s;G0.ft=0}G0.p=(a[i*3+1]|0)/10;G0.cd=a[i*3+2]|0}},
  clear(){for(const G0 of this.L){R.scene.remove(G0.base);R.scene.remove(G0.tur);G0.mat.dispose();if(G0.lamp)G0.lamp.dead=true}this.L=[]}};

// ---------- fire on the ground: burning fuel along a line, a flare's fire, the wreck (every page draws it; the host hurts) ----------
// {k:'c', x, z, r} a disc or {k:'r', x, z, yaw, w, l} a strip from x,z along yaw; y; life (s); dmg (a second, on normal)
const CHFIRE={L:[],id:0,hT:0,nT:0,
  add(o,remote){const F=Object.assign({t:0,y:0},o);F.id=o.id||++this.id;const cx=F.k==='c'?F.x:F.x-Math.sin(F.yaw)*F.l/2,cz=F.k==='c'?F.z:F.z-Math.cos(F.yaw)*F.l/2;
    F.light=DL.add(cx,F.y+1.2,cz,'#ff8a3a',F.k==='c'?F.r*3+5:14,0,0,{flick:.4});this.L.push(F);
    if(NET.host&&!remote)netEv('ech',{k:'fi',id:F.id,f:F.k,x:r2(F.x),z:r2(F.z),y:r2(F.y),r:r2(F.r||0),yw:r3(F.yaw||0),w:r2(F.w||0),l:r2(F.l||0),life:r2(F.life),d:F.dmg});return F},
  inF(F,x,z,pad){pad=pad||0;if(F.k==='c')return Math.hypot(x-F.x,z-F.z)<F.r+pad;const fx=-Math.sin(F.yaw),fz=-Math.cos(F.yaw),rx=Math.cos(F.yaw),rz=-Math.sin(F.yaw),dx=x-F.x,dz=z-F.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;
    return al>-pad&&al<F.l+pad&&Math.abs(sd)<F.w/2+pad},
  // a fire over this point and the way out of it (bots step out)
  at(x,z,pad){for(const F of this.L){if(F.t>F.life||!this.inF(F,x,z,pad))continue;if(F.k==='c'){const dx=x-F.x,dz=z-F.z,d=Math.hypot(dx,dz)||1;return {ax:dx/d,az:dz/d}}
      const rx=Math.cos(F.yaw),rz=-Math.sin(F.yaw),s=(x-F.x)*rx+(z-F.z)*rz>=0?1:-1;return {ax:rx*s,az:rz*s}}return null},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const F=this.L[i];F.t+=dt;if(F.t>F.life){if(F.light)F.light.dead=true;this.L.splice(i,1);continue}
      const k=F.t<.4?F.t/.4:F.life-F.t<1.2?(F.life-F.t)/1.2:1;if(F.light)F.light.i=1.5*k;
      const area=F.k==='c'?F.r*F.r*3:F.w*F.l,want=area*dt*1.4*k;let n=Math.floor(want);if(Math.random()<want-n)n++;n=Math.min(9,n);for(let j=0;j<n;j++){let x,z;
        if(F.k==='c'){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*F.r;x=F.x+Math.cos(a)*r;z=F.z+Math.sin(a)*r}
        else{const al=Math.random()*F.l,sd=rr(-.5,.5)*F.w;x=F.x-Math.sin(F.yaw)*al+Math.cos(F.yaw)*sd;z=F.z-Math.cos(F.yaw)*al-Math.sin(F.yaw)*sd}
        FX.spawn({x,y:F.y+.1,z,vx:rr(-.3,.3),vy:rr(1,2.4),vz:rr(-.3,.3),life:rr(.35,.7),s0:rr(.35,.6),s1:.08,r:1,g:rr(.4,.6),b:.12,a:.9,f:11,add:1});
        if(Math.random()<.22)FX.spawn({x,y:F.y+.6,z,vx:rr(-.2,.2),vy:rr(.8,1.6),vz:rr(-.2,.2),life:rr(1,2),s0:.4,s1:1.6,r:.12,g:.11,b:.1,a:.45,f:2,drag:.8})}}
    // (every page: its own player is told)
    const P=G.player;this.nT-=dt;if(P&&P.alive&&this.nT<=0&&this.L.some(F=>F.t>.3&&Math.abs(P.c.y-F.y)<1.2&&this.inF(F,P.c.x,P.c.z,.2))){this.nT=1.2;HUD.note(LI()?'Fire — get out of it!':'불이다 — 빠져나와!',1)}
    if(NET.cli)return;this.hT-=dt;if(this.hT>0)return;this.hT=.25;
    for(const F of this.L){if(F.t<.3)continue;for(const h of SCEN.H){if(!h.alive||h.c.y-F.y>1.2||h.c.y<F.y-1||!this.inF(F,h.c.x,h.c.z,.2))continue;hurtHuman(h,EPD(F.dmg*.25),null,{})}}},
  clear(){for(const F of this.L)if(F.light)F.light.dead=true;this.L=[]}};

// ---------- the whiteout (phase 3): the blizzard closes in ----------
const CHFOG={cur:0,on:false,c0:null,cW:new THREE.Color('#8e979f'),
  base(){return MAP.env&&MAP.env.fogD||.045},sky0(){return MAP.env&&MAP.env.skyFog||0},
  reset(){this.on=false;if(MAP.id!=='ep8'||!this.cur){this.cur=0;return}this.cur=this.base();LU.uFogD.value=this.cur;if(this.c0)LU.uFogC.value.copy(this.c0);
    const SP=MAP.skyParts;if(SP&&SP.dome)SP.dome.material.uniforms.uSkyFog.value=this.sky0()},
  update(dt){const b=this.base(),T=this.on?.046:b;if(!this.cur)this.cur=b;this.cur=approach(this.cur,T,dt*(this.on?.01:.02));LU.uFogD.value=this.cur;
    if(!this.c0)this.c0=new THREE.Color(MAP.env&&MAP.env.fog||'#0a0c12');const k=clamp((this.cur-b)/(.046-b),0,1);LU.uFogC.value.copy(this.c0).lerp(this.cW,k*.7);
    const SP=MAP.skyParts;if(SP&&SP.dome)SP.dome.material.uniforms.uSkyFog.value=clamp(this.sky0()+k*.38,0,1)}};

// ---------- the Frozen (EPZ.frozen): asleep in the drifts until something wakes it, then up out of the snow in a burst ----------
const FRZ={tT:0,
  // host: n of them asleep at a zone's drift points (none close to the team)
  lay(n,pts){if(NET.cli||!pts)return;const H=SCEN.H.filter(h=>h.alive),L=pts.filter(p=>!H.some(h=>Math.hypot(h.c.x-p[0],h.c.z-p[2])<14));
    for(let k=0;k<n&&L.length;k++){const p=L.splice((Math.random()*L.length)|0,1)[0];const a=SCEN.spawn('frozen',[p[0]+rr(-.3,.3),p[1]||0,p[2]+rr(-.3,.3)]);if(a)this.sleep(a)}},
  sleep(a){a.frDorm=true;a.kin=null;a.c.y=-1.45;a.c.vx=a.c.vz=a.c.vy=0;a.c.onGround=true;a.mvx=a.mvz=a.kvx=a.kvz=0},
  wake(a){if(!a.frDorm||!a.alive)return;a.frDorm=false;a.frBurst=0;const y=floorY(a.c.x,.2,a.c.z);epKin(a,a.c.x,y,a.c.z,.75,.35);a.frRushT=G.t+2.6;CHARON.fx({k:'fw',i:a.id,x:r2(a.c.x),y:r2(y),z:r2(a.c.z)})},
  // where one bursts up near the team: 10–15 m from one of them, out in the open (no roof), 8 m from all of them, inside the zone
  burstPt(){const H=SCEN.H.filter(h=>h.alive);if(!H.length)return null;const Zn=EP.zone(EP.S().z),box=Zn&&Zn.box;
    for(let k=0;k<16;k++){const h=rpick(H),a=Math.random()*TAU,r=rr(10,15),x=h.c.x+Math.cos(a)*r,z=h.c.z+Math.sin(a)*r;if(box&&!EP.inBox(box,x,z,-1))continue;
      if(H.some(o=>Math.hypot(o.c.x-x,o.c.z-z)<8))continue;const n=navSnap(x,0,z,1.5);if(!n||n.y>.4||n.e.length<12)continue;if(rayCast(n.x,.6,n.z,0,1,0,30))continue;return [n.x,0,n.z]}return null},
  // host, five times a second: the sleepers feel whoever comes near and hear shots and running (lorelei.js's HEAR)
  tick(dt){this.tT-=dt;if(this.tT>0)return;this.tT=.2;let any=false;for(const a of SCEN.Z)if(a.alive&&a.frDorm){any=true;break}if(!any)return;
    const hr=typeof HEAR!=='undefined';if(hr)HEAR.tick();for(const a of SCEN.Z){if(!a.alive||!a.frDorm)continue;let w=a.frBurst>0&&G.t>=a.frBurst;
      if(!w)for(const h of SCEN.H){if(!h.alive)continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<5&&Math.abs(h.c.y-a.c.y-1.45)<2.5){w=true;break}}
      if(!w&&hr)for(const [h,r] of HEAR.L){if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<Math.min(18,r*.42)){w=true;break}}
      if(w)this.wake(a)}},
  // the rig's extras: the drift over it while it sleeps
  rigX(ch){const m=new THREE.Mesh(gunGeo('frMound'),matGun());m.frustumCulled=false;ch.grp.add(m);return {mound:m}}};

// ---------- what the events draw on every page: strafes, rockets, flares, the door gunner's fall, the sweep through the tower's cab ----------
const CHGFX={L:[],
  add(o){o.t=0;this.L.push(o);return o},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const q=this.L[i];q.t+=dt;if(this[q.k](q,dt)===false){if(q.m){R.scene.remove(q.m);if(q.m.material&&q.m.material.dispose)q.m.material.dispose()}if(q.lt)q.lt.dead=true;this.L.splice(i,1)}}},
  // a strafe: the rounds walking down the strip (tracers from the door gun, or from the nose)
  gf(q,dt){if(q.t>q.d+.05){if(NET.cli)HELI.gunT=null;return false}q.n=(q.n||0)-dt;if(q.n>0)return;q.n=.05;const s=clamp(q.t/q.d,0,1)*q.l,fx=-Math.sin(q.yw),fz=-Math.cos(q.yw),rx=Math.cos(q.yw),rz=-Math.sin(q.yw),j=rr(-1,1),x=q.x+fx*s+rx*j,z=q.z+fz*s+rz*j,y=q.y+.05;
    if(!HELI.flying())return false;const m=q.nose?HELI.toW(0,.55,-6,_chV):HELI.muzzle(_chV);FX.tracer(m.x,m.y,m.z,x,y,z,[1,.78,.45]);FX.muzzle(m.x,m.y,m.z,x-m.x,y-m.y,z-m.z,false);FX.impact(x,y,z,0,1,0,'conc');
    if(!AU.throttle('chgf',85))AU.at('mg6',m.x,m.y,m.z,{vol:.85,range:130});if(Math.random()<.5)FX.spawn({x,y:y+.1,z,vx:rr(-1,1),vy:rr(1,3),vz:rr(-1,1),life:.5,s0:.2,s1:.6,r:.85,g:.88,b:.92,a:.6,f:2,drag:2})},
  // the sweep through the cab: tracers across it at chest height
  sw(q,dt){if(q.t>q.d){if(NET.cli)HELI.gunT=null;return false}q.n=(q.n||0)-dt;if(q.n>0)return;q.n=.06;if(!HELI.flying())return false;const T=MAP.ez.tower,b=T.box,m=HELI.muzzle(_chV),u=clamp(q.t/q.d,0,1);
    const x=lerp(b[0],b[2],q.dir>0?u:1-u)+rr(-.4,.4),z=lerp(b[1],b[3],hash2(Math.floor(q.t*30),1,8301))+rr(-.3,.3),y=T.y+1.45;const dx=x-m.x,dy=y-m.y,dz=z-m.z,L=Math.hypot(dx,dy,dz)||1;
    const h=rayCast(m.x,m.y,m.z,dx/L,dy/L,dz/L,L+8,SHOT_FILTER),e=h?[m.x+dx/L*h.t,m.y+dy/L*h.t,m.z+dz/L*h.t]:[x,y,z];FX.tracer(m.x,m.y,m.z,e[0],e[1],e[2],[1,.78,.45]);FX.muzzle(m.x,m.y,m.z,dx,dy,dz,false);
    if(h)FX.impact(e[0],e[1],e[2],h.nx,h.ny,h.nz,h.box&&h.box.mat||'metal');if(!AU.throttle('chgf',85))AU.at('mg6',m.x,m.y,m.z,{vol:.85,range:130})},
  // rockets: each one leaves a pod .55 s before it lands, a smoke trail, the blast in its ring
  rk(q,dt){let left=0;for(const P of q.p){if(P.b)continue;left++;const t0=P[3]-.55;if(q.t<t0)continue;if(!P.f){P.f=1;const pod=HELI.flying()?HELI.toW(P.s*2.28,1.02,-1.8,_chV):_chV.set(P[0],P[1]+20,P[2]);P.o=[pod.x,pod.y,pod.z];if(!AU.throttle('chrk',60))AU.at('chrkt',pod.x,pod.y,pod.z,{vol:.9,range:140})}
      const u=clamp((q.t-t0)/.55,0,1),x=lerp(P.o[0],P[0],u),y=lerp(P.o[1],P[1],u),z=lerp(P.o[2],P[2],u);FX.spawn({x,y,z,vy:.2,life:rr(.6,1),s0:.25,s1:.9,r:.6,g:.6,b:.62,a:.5,f:2,drag:1});FX.spawn({x,y,z,life:.06,s0:.35,s1:.1,r:1,g:.7,b:.3,a:1,f:1,add:1});
      if(u>=1){P.b=1;FX.explode(P[0],P[1]+.2,P[2],'he');AU.at('explode',P[0],P[1],P[2],{vol:.9,range:110,occ:false});const Pl=G.player;if(Pl){const d=Math.hypot(Pl.c.x-P[0],Pl.c.z-P[2]);if(d<12){FX.shake=Math.max(FX.shake,.8-d/16);AU.shock(.7-d/18)}}}}
    return left>0},
  // a flare: up and over in an arc; it lands where the ring was (the fire is the host's CHFIRE)
  fl(q,dt){const u=clamp(q.t/q.T,0,1);if(!q.m){q.m=new THREE.Mesh(gunGeo('chFlareP'),matGun());q.m.frustumCulled=false;R.scene.add(q.m);q.lt=DL.add(q.a[0],q.a[1],q.a[2],'#ff4a2a',10,2,0,{flick:.3});AU.at('chflare',q.a[0],q.a[1],q.a[2],{vol:1,range:80})}
    const x=lerp(q.a[0],q.b[0],u),z=lerp(q.a[2],q.b[2],u),y=lerp(q.a[1],q.b[1],u)+Math.sin(u*Math.PI)*q.h;q.m.position.set(x,y,z);q.m.rotation.x+=dt*14;q.lt.x=x;q.lt.y=y;q.lt.z=z;
    FX.spawn({x,y,z,vy:.3,life:rr(.4,.8),s0:.3,s1:.06,r:1,g:.35,b:.2,a:.9,f:11,add:1});if(u>=1){for(let i=0;i<20;i++)FX.spawn({x,y:y+.2,z,vx:rr(-3,3),vy:rr(1,4),vz:rr(-3,3),life:rr(.3,.7),s0:.12,s1:.02,r:1,g:.4,b:.2,f:0,grav:8,add:1});return false}},
  // the fuel dumped from its belly while the strip is orange
  fu(q,dt){if(q.t>q.T||!HELI.flying())return false;const n=Math.random()<dt*40?2:0;for(let i=0;i<n;i++){const p=HELI.toW(rr(-.6,.6),.55,rr(-1,1.5),_chV2);
      FX.spawn({x:p.x,y:p.y,z:p.z,vx:HELI.vx*.6+rr(-.5,.5),vy:rr(-2,-.5),vz:HELI.vz*.6+rr(-.5,.5),life:rr(.6,1),s0:.12,s1:.34,r:.92,g:.62,b:.22,a:.8,f:0,grav:7})}},
  // the door gunner falling out of the door
  gd(q,dt){if(!q.m){q.m=new THREE.Mesh(gunGeo('chGunner'),matGun());q.m.frustumCulled=false;R.scene.add(q.m);q.m.position.set(q.x,q.y,q.z);q.m.rotation.y=q.yw;q.vx=rr(-1,1)+q.vx;q.vz=rr(-1,1)+q.vz;q.vy=1.5;q.g=floorY(q.x,q.y,q.z)}
    const m=q.m;if(!q.down){q.vy-=GRAV*.9*dt;m.position.x+=q.vx*dt;m.position.y+=q.vy*dt;m.position.z+=q.vz*dt;m.rotation.x+=dt*3.1;m.rotation.z+=dt*1.7;
      if(m.position.y<=q.g){m.position.y=q.g;q.down=1;m.rotation.set(-Math.PI/2,q.yw,0);AU.at('bodyfall',m.position.x,q.g,m.position.z,{vol:1,range:50});for(let i=0;i<16;i++)FX.spawn({x:m.position.x,y:q.g+.2,z:m.position.z,vx:rr(-2,2),vy:rr(.5,2),vz:rr(-2,2),life:rr(.5,1),s0:.3,s1:.9,r:.88,g:.9,b:.94,a:.6,f:2,drag:2})}}
    if(q.t>14)return false},
  clear(){for(const q of this.L){if(q.m)R.scene.remove(q.m);if(q.lt)q.lt.dead=true}this.L=[]}};

// ---------- CHARON ----------
const CHARON={cur:null,said:{},sayT:{},encNext:false,dutyT:0,dutyD:null,cs:-1,cyaw:0,gunDead:false,logN:0,
  zc:'charon',name:['카론','CHARON'],code:'RT1-06',ticks:[70,30],g2:['사수','GUNNER'],
  wake:['카론의 헬기가 오기까지','FERRY 06 inbound in'],goText:['회수 헬기 접근','FERRY 06 INBOUND'],deadText:['카론 무력화','CHARON IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(16000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.cn&&a.cn.enc)},
  fx(m){this.fxApply(m);if(NET.host)netEv('ech',m)},
  sayOnce(k){if(this.said[k])return;this.said[k]=1;EP.say(k)},
  sayEvery(k,t){if(G.t-(this.sayT[k]||-99)<t)return;this.sayT[k]=G.t;EP.say(k)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: FERRY 06 hovering out over the runway (a replay of phase 3: on foot by the wreck)
  prepSpawn(kind,bp){let b=EP.bossA();const E=MAP.ez;if(!b)b=this.spawn(E.enter,0,false);else if(kind!=='phase')this.init(b,false);if(!b)return;
    if(kind==='phase')this.reset(b,bp);else this.board(b,E.enter[0],E.enter[1],E.enter[2],0);b.cn.idle=true},
  go(b){const S=b.cn;if(!S)return;S.idle=false;S.pt=1;if(S.fly){S.cd.gun=4;S.cd.rkt=8;S.cd.drop=13}else{S.cd.flare=2.5;S.cd.may=11;S.cd.scr=6}},
  // the first meeting (stage 2): round the control tower, the door gun into the cab; away north when it has had enough
  meetStart(E){const M=MAP.ez.meet,a=this.spawn(M.from,Math.PI/2,true);if(!a)return;E.a=a;const S=a.cn;S.idle=false;S.cd.sweep=5;S.cd.gun=9;S.orb=Math.atan2(M.from[2]-M.c[1],M.from[0]-M.c[0]);
    this.fx({k:'meet',i:a.id});EP.say('enc');EP.later(3,()=>EP.say('enc2'));EP.later(7.5,()=>EP.say('cMeet'))},
  meetTick(E,dt){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.cn)this.retreat(E.a)},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='charon';a.deadT=99;this.encNext=!!enc;reviveZombie(a,[p[0],p[1],p[2]]);a.yaw=yaw||0;this.encNext=false;
    this.board(a,p[0],p[1],p[2],yaw||0);return a},
  // into FERRY 06's left seat (every page follows from the snapshot's flag)
  board(a,x,y,z,yaw){HELI.place(x,y,z,yaw);HELI.gun=!this.gunDead;a.cnFly=true;a.kin=null;if(a.cn){a.cn.fly=true}this.seatIn(a);if(NET.host)netEv('ech',{k:'hp',x:r2(x),y:r2(y),z:r2(z),yw:r3(yaw),g:HELI.gun?1:0})},
  seatIn(a){HELI.seat(_chV);const c=a.c;c.x=_chV.x;c.y=_chV.y-.42;c.z=_chV.z;c.vx=HELI.vx;c.vz=HELI.vz;c.vy=0;c.onGround=true;a.yaw=HELI.yaw;a.mvx=a.mvz=a.kvx=a.kvz=0},
  init(a,enc){a.cn={ph:1,mode:'',mt:0,pt:1,enc:!!enc,idle:!enc,invT:0,enr:false,fightT:0,grog:0,grogN:0,grogMax:100,slowT:0,dmgW:0,dmgWT:0,encT:0,fly:true,downQ:0,
      gunHp:0,gunMax:0,orb:Math.random()*TAU,od:Math.random()<.5?1:-1,tg:null,goT:0,fleeP:null,fleeT:0,
      cd:{gun:5,rkt:8,drop:14,fuel:10,dive:12,sweep:4,flare:3,may:12,scr:6},st:null,rk:null,dp:null,fu:null,dv:null,sw:null,may:null,fl:null,crash:null};
    const S=a.cn;S.gunMax=S.gunHp=Math.round((a.maxHp||1)*.06);a.cnPose='seat';a.cnHitT=-9;a.epDown=0;a.kin=null;a.epHide=false},
  // a replay of the boss fight starts the phase it reached again, at that phase's health (the gunner, if shot, stays shot)
  reset(a,ph){a.hp=a.maxHp*CH_PH[ph-1];this.init(a,false);this.ammoT=6;const S=a.cn,E=MAP.ez;S.ph=ph;S.idle=true;a.frozen=0;a.kvx=a.kvz=0;if(this.gunDead)S.gunHp=0;
    if(ph<3){this.board(a,E.enter[0],E.enter[1],E.enter[2],0);if(ph===2)HELI.smoke=1;CHFOG.on=false}
    else{S.fly=false;a.cnFly=false;const C=E.crash[this.cs>=0?this.cs:0];this.wreckHere(C[0],C[2],this.cyaw||0);const p=this.exitPt();placeAt(a,p[0],p[1],p[2],0);CHFOG.on=true;this.fx({k:'wo',o:1})}},
  // ---------- small helpers ----------
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=chYaw(x-a.c.x,z-a.c.z)},
  eye(a){return a.head&&a.head.y>a.c.y?a.head:_chV.set(a.c.x,a.c.y+1.9,a.c.z)},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}return n?[x/n,0,z/n]:[0,0,-62]},
  nearH(a,r){let b=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<3){bd=d;b=h}}return b},
  seen(x,y,z,r){const out=[];for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>r)continue;if(losClear(x,y,z,h.c.x,h.c.y+1.25,h.c.z)||losClear(x,y,z,h.c.x,h.c.y+1.6,h.c.z))out.push([d+(h.epMark>G.t?-8:0),h])}
    out.sort((p,q)=>p[0]-q[0]);return out.map(q=>q[1])},
  // from the helicopter: whoever it can see, the ones at the AA guns first (they frighten him most), then the nearest
  target(a,r){const c=HELI.toW(0,1,-2,_chV2),cx=c.x,cy=c.y,cz=c.z;let best=null,bs=1e9;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-cx,h.c.z-cz);if(d>r)continue;
      if(!losClear(cx,cy,cz,h.c.x,h.c.y+1.2,h.c.z))continue;let s=d;if(h.epUse>=100&&h.epUse<=102)s-=22;if(h===a.cn.tg)s-=4;if(s<bs){bs=s;best=h}}a.cn.tg=best;return best},
  zN(){let n=0;for(const z of SCEN.Z)if(z.alive&&!z.boss&&!z.frDorm)n++;return n},
  zCap(){return Math.round((3+1.5*SCEN.H.length)*SC_DIFF.n[G.diff||0])},
  claw(a){const h=this.nearH(a,2.2);if(!h||Math.abs(h.c.y-a.c.y)>1.5)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,10);AI.moveDir(a,wx,wz)}a.spdMul=(S.enr?1.2:1)*(S.slowT>0?.6:1)*mul},
  // ---------- host: the brain (EPZ.charon.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.cn;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;a.spdMul=S.enr?1.2:1;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.dmgWT-=dt;if(S.dmgWT<=0){S.dmgWT=4;S.dmgW=0}
    if(a.frozen>0){a.frozen=0;a.c.vx=a.c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=(EP.ph==='run'||S.enc)&&!S.idle&&S.mode!=='gone';
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('cEnr')}}
    const cdm=S.enr?1/.7:1;if(live)for(const k in S.cd)S.cd[k]-=dt*cdm;
    if(S.fly){this.flyTick(a,dt,S,live);return true}
    if(!live){a.cnPose='';return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(S.downQ){const t=S.downQ;S.downQ=0;this.down(a,t);return true}
    if(a.kin)return true;
    this.p3(a,dt,S);return true},
  // in the air: the pattern under way (stepF) or the next one, then the flying itself, and him in his seat
  flyTick(a,dt,S,live){a.cnPose='seat';
    if(!live){HELI.tx=HELI.x;HELI.tz=HELI.z;HELI.fy=null;HELI.vmax=5;HELI.fly(dt);this.seatIn(a);return}
    if(S.mode){S.mt-=dt;this.stepF(a,dt,S)}else if(S.downQ){const t=S.downQ;S.downQ=0;this.down(a,t)}else if(S.enc)this.pEnc(a,dt,S);else this.pAir(a,dt,S);
    if(S.mode!=='crash')HELI.fly(dt);if(S.fly)this.seatIn(a)},
  // ---------- the first meeting: round the tower, the searchlight into the cab, a sweep through it now and then ----------
  pEnc(a,dt,S){const M=MAP.ez.meet;S.encT+=dt;if(S.encT>40){this.retreat(a);return}
    S.orb+=dt*.42*S.od;HELI.tx=M.c[0]+Math.cos(S.orb)*M.r;HELI.tz=M.c[1]+Math.sin(S.orb)*M.r;HELI.ty=M.alt;HELI.vmax=10;
    const dx=M.c[0]-HELI.x,dz=M.c[1]-HELI.z,d=Math.hypot(dx,dz)||1;HELI.fy=Math.atan2(-dz/d,dx/d);HELI.sl=HELI.sl||{};HELI.sl.x=M.c[0];HELI.sl.y=6.2;HELI.sl.z=M.c[1];
    S.pt-=dt;if(S.pt>0)return;S.pt=.4;const C=this.inCab();
    if(S.cd.sweep<=0&&C.length){S.cd.sweep=6.4;this.sweepStart(a,S,C[0]);return}
    if(S.cd.gun<=0){const t=this.target(a,42);if(t&&!this.inCabH(t)){S.cd.gun=7;this.gunStart(a,S,t);return}}},
  inCabH(h){const T=MAP.ez.tower,b=T.box;return h.alive&&h.c.y>T.y-.6&&h.c.y<T.y+2.5&&h.c.x>b[0]-.3&&h.c.x<b[2]+.3&&h.c.z>b[1]-.3&&h.c.z<b[3]+.3},
  inCab(){return SCEN.H.filter(h=>this.inCabH(h))},
  sweepStart(a,S,t){const T=1.2*EPTW(),Tw=MAP.ez.tower;ELAS.add(a,t,T);TELE.add({k:'c',x:Tw.x,y:Tw.y,z:Tw.z,r:4.6,d:T,nb:1});S.sw={t:0,T,f:0,hit:new Set(),dir:Math.random()<.5?1:-1};S.mode='sweep';S.mt=T+1.4;
    this.fx({k:'w',i:a.id,s:'sw'});this.sayEvery('cSweep',14)},
  retreat(a){const S=a.cn;S.invT=99;S.mode='ret';S.mt=8;S.st=S.rk=S.sw=null;ELAS.stop(a);HELI.sl=null;HELI.gunT=null;EP.say('cRet')},
  // ---------- phases 1 and 2 in the air: circling the team, the patterns ----------
  pAir(a,dt,S){const E=MAP.ez,F=E.fly,ph=S.ph,C=this.cen(),ox=clamp(C[0],F.x0+14,F.x1-14),oz=clamp(C[2],F.z0+12,F.z1-12);
    const r=ph===1?29:23,alt=(ph===1?17.5:11)+Math.sin(G.t*.4)*1.2,w=(ph===1?10:13)/r*S.od*(S.enr?1.2:1);S.orb+=w*dt;
    HELI.tx=clamp(ox+Math.cos(S.orb)*r,F.x0,F.x1);HELI.tz=clamp(oz+Math.sin(S.orb)*r,F.z0,F.z1);HELI.ty=alt;HELI.vmax=ph===1?11:14;HELI.fy=null;HELI.sl=null;HELI.gunT=null;
    S.pt-=dt;if(S.pt>0)return;S.pt=.4;const t=this.target(a,50);
    if(S.cd.drop<=0&&this.zN()<this.zCap()){S.cd.drop=ph===1?24:26;if(this.dropStart(a,S))return}
    if(t&&S.cd.gun<=0){S.cd.gun=(ph===1?5.5:4.2)*(HELI.gun?1:1.3);this.gunStart(a,S,t);return}
    if(t&&S.cd.rkt<=0){S.cd.rkt=ph===1?11:8.5;this.rktStart(a,S,t);return}
    if(ph===2&&t&&S.cd.fuel<=0){S.cd.fuel=S.enr?12:16;this.fuelStart(a,S,t);return}
    if(ph===2&&t&&S.cd.dive<=0){S.cd.dive=S.enr?10:13;this.diveStart(a,S,t);return}},
  // the door gun (or, the gunner gone, the nose gun): a strip through one of them, then the rounds walk it
  gunStart(a,S,t){const dx=t.c.x-HELI.x,dz=t.c.z-HELI.z,d=Math.hypot(dx,dz)||1,yw=chYaw(dx,dz),fx=dx/d,fz=dz/d,nose=!HELI.gun,L=nose?14:20,b=nose?5:7,x0=t.c.x-fx*b,z0=t.c.z-fz*b,y=floorY(t.c.x,t.c.y,t.c.z),T=1.2*EPTW();
    TELE.add({k:'r',x:x0,y,z:z0,yaw:yw,w:2.6,l:L,d:T});S.st={x0,z0,y,yw,L,T,t:0,f:0,nose,hit:new Set(),d:nose?.8:1};S.mode='gun';S.mt=T+S.st.d+.3;HELI.gunT=new THREE.Vector3(t.c.x,y+1,t.c.z);
    this.fx({k:'w',i:a.id,s:'gun'});this.sayOnce('cGun')},
  // rockets from the pods: six rings in a line through one of them, a beat apart
  rktStart(a,S,t){const dx=t.c.x-HELI.x,dz=t.c.z-HELI.z,d=Math.hypot(dx,dz)||1,fx=dx/d,fz=dz/d,T0=1.3*EPTW(),P=[];
    for(let k=0;k<6;k++){const s=(k-2.5)*3.2,x=t.c.x+fx*s,z=t.c.z+fz*s,y=floorY(x,t.c.y+1,z),T=T0+k*.12;TELE.add({k:'c',x,y,z,r:2.8,d:T});P.push([x,y,z,T])}
    S.rk={P,t:0,i:0};S.mode='rkt';S.mt=T0+6*.12+.5;HELI.fy=chYaw(dx,dz);this.fx({k:'rk',i:a.id,p:P.map(q=>[r2(q[0]),r2(q[1]),r2(q[2]),r2(q[3])])});this.sayOnce('cRkt')},
  // the passengers: hover low near the team, let them down on the ropes (⌈humans / 2⌉, one more in phase 2)
  dropStart(a,S){const P=this.dropPt();if(!P)return false;S.dp={x:P[0],y:P[1],z:P[2],t:0,n:(S.ph===1?0:1)+Math.ceil(SCEN.H.length/2),k:0,st:'go',nT:0};S.mode='drop';S.mt=14;this.sayEvery('cDrop',25);return true},
  dropPt(){const H=SCEN.H.filter(h=>h.alive),F=MAP.ez.fly;if(!H.length)return null;for(let k=0;k<16;k++){const h=rpick(H),g=Math.random()*TAU,r=rr(10,15),x=clamp(h.c.x+Math.cos(g)*r,F.x0+4,F.x1-4),z=clamp(h.c.z+Math.sin(g)*r,F.z0+4,F.z1-4);
      if(H.some(o=>Math.hypot(o.c.x-x,o.c.z-z)<8))continue;const n=navSnap(x,0,z,2);if(!n||n.y>.5)continue;if(rayCast(n.x,.6,n.z,0,1,0,30))continue;return [n.x,n.y,n.z]}return null},
  // phase 2: burning fuel dumped along a line (orange first, then 7 s of fire)
  fuelStart(a,S,t){const dx=t.c.x-HELI.x,dz=t.c.z-HELI.z,d=Math.hypot(dx,dz)||1,fx=dx/d,fz=dz/d,yw=chYaw(dx,dz),L=22,x0=t.c.x-fx*L/2,z0=t.c.z-fz*L/2,y=floorY(t.c.x,t.c.y,t.c.z),T=1.1*EPTW();
    const F=MAP.ez.fly;TELE.add({k:'r',x:x0,y,z:z0,yaw:yw,w:3.2,l:L,d:T,col:0xff8a2a});S.fu={x0,z0,y,yw,L,T,t:0,ex:clamp(t.c.x+fx*(L/2+10),F.x0,F.x1),ez:clamp(t.c.z+fz*(L/2+10),F.z0,F.z1),lit:0};S.mode='fuel';S.mt=T+2.4;this.fx({k:'fu',T:r2(T)});this.sayOnce('cFuel')},
  // phase 2: a dive through a red ring 7 m round one of them — the rotor wash knocks them flat
  diveStart(a,S,t){const x=t.c.x,z=t.c.z,y=floorY(x,t.c.y,z),T=1.4*EPTW(),dx=x-HELI.x,dz=z-HELI.z,d=Math.hypot(dx,dz)||1;TELE.add({k:'c',x,y,z,r:7,d:T});
    S.dv={x,y,z,T,t:0,hit:0,ex:x+dx/d*22,ez:z+dz/d*22,sx:HELI.x,sz:HELI.z};S.mode='dive';S.mt=T+2.6;this.fx({k:'w',i:a.id,s:'dv'});this.sayOnce('cDive')},
  // ---------- the patterns under way in the air (host) ----------
  stepF(a,dt,S){const F=MAP.ez.fly;switch(S.mode){
    case 'gun':{const Q=S.st;if(!Q){S.mode='';break}Q.t+=dt;HELI.tx=HELI.x+HELI.vx*.2;HELI.tz=HELI.z+HELI.vz*.2;HELI.vmax=3;
      const fx=-Math.sin(Q.yw),fz=-Math.cos(Q.yw);HELI.fy=Q.nose?Q.yw:Math.atan2(-fz,fx);
      if(Q.t>=Q.T){if(!Q.f){Q.f=1;this.fx({k:'gf',x:r2(Q.x0),z:r2(Q.z0),y:r2(Q.y),yw:r3(Q.yw),l:r2(Q.L),d:Q.d,n:Q.nose?1:0})}
        const s0=clamp((Q.t-dt-Q.T)/Q.d,0,1)*Q.L,s1=clamp((Q.t-Q.T)/Q.d,0,1)*Q.L,rx=Math.cos(Q.yw),rz=-Math.sin(Q.yw),m=Q.nose?HELI.toW(0,.55,-6,_chV):HELI.muzzle(_chV);
        for(const h of SCEN.H){if(!h.alive||Q.hit.has(h))continue;const dx=h.c.x-Q.x0,dz=h.c.z-Q.z0,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<s0-.6||al>s1+.6||Math.abs(sd)>1.6||Math.abs(h.c.y-Q.y)>2.5)continue;
          Q.hit.add(h);if(!losClear(m.x,m.y,m.z,h.c.x,h.c.y+1.1,h.c.z))continue;hurtHuman(h,EPD(22),a,{});SCEN.pushHuman(h,fx*2,1,fz*2)}}
      if(S.mt<=0){S.st=null;S.mode='';HELI.gunT=null}break}
    case 'sweep':{const Q=S.sw;if(!Q){S.mode='';break}Q.t+=dt;HELI.tx=HELI.x;HELI.tz=HELI.z;HELI.vmax=2;const M=MAP.ez.meet,dx=M.c[0]-HELI.x,dz=M.c[1]-HELI.z,d=Math.hypot(dx,dz)||1;HELI.fy=Math.atan2(-dz/d,dx/d);
      HELI.gunT=HELI.gunT||new THREE.Vector3();HELI.gunT.set(M.c[0],MAP.ez.tower.y+1.4,M.c[1]);
      if(Q.t>=Q.T){if(!Q.f){Q.f=1;this.fx({k:'sw',d:1.2,dir:Q.dir})}const m=HELI.muzzle(_chV);
        for(const h of this.inCab()){if(Q.hit.has(h)||h.duck)continue;if(!losClear(m.x,m.y,m.z,h.c.x,h.c.y+1.35,h.c.z))continue;if(Math.random()<dt*5){Q.hit.add(h);hurtHuman(h,EPD(18),a,{});SCEN.pushHuman(h,0,.5,0)}}}
      if(S.mt<=0){S.sw=null;S.mode='';HELI.gunT=null}break}
    case 'rkt':{const Q=S.rk;if(!Q){S.mode='';break}Q.t+=dt;HELI.tx=HELI.x;HELI.tz=HELI.z;HELI.vmax=3;
      while(Q.i<Q.P.length&&Q.t>=Q.P[Q.i][3]){const p=Q.P[Q.i++];for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-p[0],h.c.z-p[2]);if(d>2.8||Math.abs(h.c.y-p[1])>2.4)continue;const f=1-d/2.8;
          hurtHuman(h,EPD(30*(.4+.6*f)),a,{});SCEN.pushHuman(h,(h.c.x-p[0])/(d||1)*6*f,3+2*f,(h.c.z-p[2])/(d||1)*6*f);if(f>.45)epFx(h,'kd',.9)}}
      if(S.mt<=0){S.rk=null;S.mode=''}break}
    case 'drop':{const Q=S.dp;if(!Q){S.mode='';break}Q.t+=dt;
      if(Q.st==='go'){HELI.tx=Q.x;HELI.tz=Q.z;HELI.ty=Q.y+8;HELI.vmax=13;HELI.fy=null;if(Math.hypot(HELI.x-Q.x,HELI.z-Q.z)<2.2&&HELI.y<Q.y+9.2){Q.st='hold';Q.t=0;HELI.rope=1;this.fx({k:'rp',o:1})}else if(Q.t>9)S.mt=0}
      else if(Q.st==='hold'){HELI.tx=Q.x;HELI.tz=Q.z;HELI.ty=Q.y+8;HELI.vmax=2;Q.nT-=dt;
        if(Q.nT<=0&&Q.k<Q.n){Q.nT=.55;const sd=Q.k%2?1:-1,p=HELI.toW(sd*1.4,.8,-1.6,_chV2),g=floorY(p.x,p.y,p.z);const z=SCEN.spawn(EP.roll(CH_PAX),[p.x,p.y,p.z]);
          if(z){epKin(z,p.x+sd*.3,g,p.z,1,0);AU.at('chrope',p.x,p.y,p.z,{vol:.8,range:40})}Q.k++}
        if(Q.k>=Q.n&&Q.nT<=0||Q.t>4.2){Q.st='up';HELI.rope=0;this.fx({k:'rp',o:0});S.mt=Math.min(S.mt,1.2)}}
      else{HELI.ty=S.ph===1?17:11;HELI.vmax=10}
      if(S.mt<=0){if(HELI.rope){HELI.rope=0;this.fx({k:'rp',o:0})}S.dp=null;S.mode=''}break}
    case 'fuel':{const Q=S.fu;if(!Q){S.mode='';break}Q.t+=dt;HELI.tx=Q.ex;HELI.tz=Q.ez;HELI.ty=8;HELI.vmax=17;HELI.fy=Q.yw;
      if(!Q.lit&&Q.t>=Q.T){Q.lit=1;CHFIRE.add({k:'r',x:Q.x0,z:Q.z0,y:Q.y,yaw:Q.yw,w:3.2,l:Q.L,life:7,dmg:10});AU.at('explode',Q.x0-Math.sin(Q.yw)*Q.L/2,Q.y,Q.z0-Math.cos(Q.yw)*Q.L/2,{vol:.8,range:90,rate:.6,occ:false})}
      if(S.mt<=0){S.fu=null;S.mode=''}break}
    case 'dive':{const Q=S.dv;if(!Q){S.mode='';break}Q.t+=dt;
      if(Q.t<Q.T){const u=Q.t/Q.T;HELI.tx=Q.x;HELI.tz=Q.z;HELI.ty=lerp(HELI.y,4.6,Math.min(1,u*1.4));HELI.vmax=Math.max(8,Math.hypot(Q.x-HELI.x,Q.z-HELI.z)/Math.max(.25,Q.T-Q.t)*1.1);HELI.fy=chYaw(Q.x-Q.sx,Q.z-Q.sz)}
      else{if(!Q.hit){Q.hit=1;this.fx({k:'dw',x:r2(Q.x),y:r2(Q.y),z:r2(Q.z)});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-Q.x,h.c.z-Q.z);if(d>7||Math.abs(h.c.y-Q.y)>3)continue;
          hurtHuman(h,EPD(26),a,{});epFx(h,'kd',1);SCEN.pushHuman(h,(h.c.x-Q.x)/(d||1)*8,3,(h.c.z-Q.z)/(d||1)*8)}}
        HELI.tx=clamp(Q.ex,F.x0,F.x1);HELI.tz=clamp(Q.ez,F.z0,F.z1);HELI.ty=12;HELI.vmax=15}
      if(S.mt<=0){S.dv=null;S.mode=''}break}
    case 'downF':{const g=floorY(HELI.x,HELI.y,HELI.z);HELI.tx=clamp(HELI.x,F.x0+6,F.x1-6);HELI.tz=clamp(HELI.z,F.z0+6,F.z1-6);HELI.ty=g+5;HELI.vmax=3;HELI.fy=null;HELI.wob=1;
      if(S.mt<=0){S.mode='';HELI.wob=0}break}
    case 'p2a':{HELI.ty=16;HELI.vmax=6;HELI.wob=.6;if(S.mt<=0){S.mode='';HELI.wob=0;S.pt=.6}break}
    // the crash: spinning down onto its site; the impact; out of the cockpit he comes
    case 'crash':{const Q=S.crash;if(!Q){S.mode='';break}Q.t+=dt;const u=clamp(Q.t/Q.T,0,1),e=u*u;HELI.spinY=0;
      HELI.x=lerp(Q.x0,Q.x,u);HELI.z=lerp(Q.z0,Q.z,u);HELI.y=lerp(Q.y0,0,e);HELI.vx=(Q.x-Q.x0)/Q.T;HELI.vz=(Q.z-Q.z0)/Q.T;HELI.vy=-2*Q.y0*u/Q.T;
      HELI.yaw=wrapA(HELI.yaw+lerp(1.2,4.2,u)*dt);HELI.pitch=approach(HELI.pitch,.16,dt);HELI.roll=.22*Math.sin(Q.t*4.4);HELI.rpm=lerp(1,.55,u);
      if(u>=1)this.crashHit(a,S);break}
    case 'ret':{const M=MAP.ez.meet;HELI.tx=M.out[0];HELI.tz=M.out[2];HELI.ty=M.out[1];HELI.vmax=16;HELI.fy=null;if(S.mt<=0||Math.hypot(HELI.x-M.out[0],HELI.z-M.out[2])<4){S.mode='gone';EP.meetEnd(a)}break}
    default:{if(S.mt<=0)S.mode=''}}},
  // ---------- phase 3, on foot: he runs from whoever comes near; the flare gun, the mayday, a scream when they crowd him ----------
  p3(a,dt,S){const c=a.c;a.cnPose='';if(this.claw(a))return;
    const near=this.nearH(a,8);S.fleeT-=dt;if(near&&S.fleeT<=0){S.fleeP=this.fleePt(a);S.fleeT=3.2}
    if(S.fleeP&&S.fleeT>0){const d=Math.hypot(S.fleeP[0]-c.x,S.fleeP[2]-c.z);if(d>1){a.cnPose='run';this.walk(a,dt,S,S.fleeP,1.05);
        S.stuckT=Math.hypot(c.vx,c.vz)<.5?(S.stuckT||0)+dt:0;if(S.stuckT>1.2){S.stuckT=0;S.fleeP=this.fleePt(a,S.fleeP)||S.fleeP;S.goT=0}}else S.fleeT=0}
    else{const t=this.nearH(a,45);if(t)this.face(a,t.c.x,t.c.z)}
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;const e=this.eye(a),L=this.seen(e.x,e.y,e.z,30),t=L[0]||null;
    if(S.cd.scr<=0&&this.crowd(a)){S.cd.scr=S.enr?6:9;this.scrStart(a,S);return}
    if(S.cd.may<=0&&this.zN()<Math.max(2,this.zCap()*.5)){S.cd.may=S.enr?22:28;this.mayStart(a,S);return}
    if(S.cd.flare<=0&&t&&Math.hypot(t.c.x-c.x,t.c.z-c.z)<26){S.cd.flare=S.enr?3.8:5.5;this.flareStart(a,S,t);return}},
  crowd(a){let n=0,cl=0;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<6&&Math.abs(h.c.y-a.c.y)<2.5)n++;if(d<4)cl=1}return n>=2||cl},
  // somewhere away from all of them (cover on the apron, the crash sites, the pad), not too far from him, out of any fire
  fleePt(a,skip){const E=MAP.ez,c=a.c,H=SCEN.H.filter(h=>h.alive);let best=null,bs=-1e9;const L=E.cover.concat(E.crash,[E.pad]);
    for(const p of L){const d=Math.hypot(p[0]-c.x,p[2]-c.z);if(d>26||d<3||skip&&p[0]===skip[0]&&p[2]===skip[2])continue;if(CHFIRE.at(p[0],p[2],.8))continue;let md=1e9;for(const h of H)md=Math.min(md,Math.hypot(h.c.x-p[0],h.c.z-p[2]));
      const s=md-d*.25+rr(0,2);if(s>bs){bs=s;best=p}}return best?[best[0],best[1],best[2]]:null},
  flareStart(a,S,t){const T=.9*EPTW(),y=floorY(t.c.x,t.c.y,t.c.z);TELE.add({k:'c',x:t.c.x,y,z:t.c.z,r:2.6,d:T+.55});S.fl={x:t.c.x,y,z:t.c.z};S.mode='flw';S.mt=T;a.cnPose='flare';this.face(a,t.c.x,t.c.z);this.fx({k:'w',i:a.id,s:'fl'});this.sayOnce('cFlare')},
  mayStart(a,S){S.mode='may';S.mt=2.6;S.may={d:0};a.cnPose='kneel';this.fx({k:'may',i:a.id});EP.say('cMay')},
  mayBreak(a,S){S.may=null;S.mode='stag';S.mt=1.5;this.grog(a,30);this.fx({k:'mayx',i:a.id});this.sayEvery('cMayX',10)},
  scrStart(a,S){const T=.7*EPTW();TELE.add({k:'c',x:a.c.x,y:floorY(a.c.x,a.c.y,a.c.z),z:a.c.z,r:6,d:T,col:0xff4aa8});S.mode='scrw';S.mt=T;a.cnPose='scream';this.fx({k:'w',i:a.id,s:'scr'})},
  // ---------- the patterns under way on foot (host) ----------
  step(a,dt,S){const c=a.c;switch(S.mode){
    case 'flw':{a.cnPose='flare';const Q=S.fl;if(Q)this.face(a,Q.x,Q.z);if(S.mt<=0){if(Q){const h=a.ch&&a.ch.M?_chV.setFromMatrixPosition(a.ch.M[6]):_chV.set(c.x,c.y+1.6,c.z);
          this.fx({k:'fl',a:[r2(h.x),r2(h.y),r2(h.z)],b:[r2(Q.x),r2(Q.y),r2(Q.z)],T:.55});EP.later(.55,()=>{if(EP.st!==4)return;CHFIRE.add({k:'c',x:Q.x,z:Q.z,y:Q.y,r:2.6,life:6,dmg:9});
            for(const h2 of SCEN.H){if(!h2.alive)continue;const d=Math.hypot(h2.c.x-Q.x,h2.c.z-Q.z);if(d<2.6&&Math.abs(h2.c.y-Q.y)<2){hurtHuman(h2,EPD(10),a,{});epFx(h2,'bl',.6)}}})}
        S.fl=null;S.mode='rec';S.mt=.5}break}
    case 'may':{a.cnPose='kneel';if(S.mt<=0){S.may=null;const n=1+Math.ceil(SCEN.H.length/2);for(let i=0;i<n;i++){const p=FRZ.burstPt();if(!p)continue;const z=SCEN.spawn('frozen',p);if(z){FRZ.sleep(z);z.frBurst=G.t+.25+i*.2}}
        this.fx({k:'mayok',i:a.id});S.mode='rec';S.mt=.6}break}
    case 'scrw':{a.cnPose='scream';if(S.mt<=0){this.fx({k:'scr',i:a.id});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d>6||Math.abs(h.c.y-c.y)>2.5)continue;
          hurtHuman(h,EPD(12),a,{});epFx(h,'dz',1.2);SCEN.pushHuman(h,(h.c.x-c.x)/(d||1)*6,2,(h.c.z-c.z)/(d||1)*6)}S.mode='rec';S.mt=.6}break}
    case 'p3a':{a.cnPose='crawl';if(S.mt<=0){S.mode='';S.pt=.6;S.cd.flare=1.5;S.fleeT=0}break}
    case 'stag':{a.cnPose='down';if(S.mt<=0){S.mode='';S.pt=.5}break}
    case 'down':{a.cnPose='down';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'rec':{if(S.mt<=0){S.mode='';S.pt=.3}break}
    default:{if(S.mt<=0)S.mode=''}}},
  // ---------- stagger, downs ----------
  grog(a,v){const S=a.cn;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='downF'||S.mode==='crash'||S.mode==='gone'||S.mode==='ret'||S.mode==='p2a'||S.mode==='p3a')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);if(S.mode&&S.mode!=='gun'&&S.mode!=='flw'&&S.mode!=='rec')S.downQ=6;else this.down(a,6);EP.say('cDown')}},
  down(a,t){const S=a.cn;if(!S||S.mode==='gone'||S.mode==='ret'||S.mode==='crash')return;ELAS.stop(a);S.st=S.rk=S.fu=S.dv=S.sw=S.fl=null;if(S.may)S.may=null;HELI.gunT=null;
    if(S.dp){S.dp=null;if(HELI.rope){HELI.rope=0;this.fx({k:'rp',o:0})}}this.fx({k:'dn',i:a.id,f:S.fly?1:0});if(S.fly){S.mode='downF';S.mt=t;HELI.wob=1}else{S.mode='down';S.mt=t}},
  // an AA gun's flak burst: 2.5 % of his health and +28 stagger
  flak(b,G0){const S=b.cn;if(!S||!S.fly||S.invT>0||S.enc)return;damageActor(b,b.maxHp*.025,null,{aa:1,dir:[0,1,0],kb:0,stag:0,x:b.c.x,y:b.c.y+1,z:b.c.z});this.grog(b,28);this.fx({k:'aah',i:G0.i});this.sayEvery('cAA',18)},
  gunnerDie(a,S){S.gunHp=0;HELI.gun=false;this.gunDead=true;const p=HELI.toW(1.2,.7,-1.6,_chV2);this.fx({k:'gd',x:r2(p.x),y:r2(p.y),z:r2(p.z),yw:r3(HELI.yaw-Math.PI/2),vx:r2(HELI.vx),vz:r2(HELI.vz)});this.grog(a,40);EP.say('cGunX')},
  // ---------- phases ----------
  floorHit(a){const S=a.cn;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone')this.retreat(a);return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  toPhase(a,n){const S=a.cn;S.ph=n;S.invT=3.5;S.grog=0;S.downQ=0;S.st=S.rk=S.dp=S.fu=S.dv=S.sw=S.fl=S.may=null;if(HELI.rope){HELI.rope=0;this.fx({k:'rp',o:0})}HELI.gunT=null;HELI.wob=0;ELAS.stop(a);
    EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();Object.assign(S.cd,{gun:3,rkt:5,drop:9,fuel:4,dive:7,flare:2,may:8,scr:5});
    if(n===2){S.mode='p2a';S.mt=2.4;HELI.smoke=1;this.fx({k:'eng',i:a.id});EP.say('cP2');EP.later(2.8,()=>EP.say('cP2l'));return}
    // 30 %: the tail rotor goes; down onto the crash site furthest from the team
    const E=MAP.ez,H=SCEN.H.filter(h=>h.alive);let bi=0,bs=-1;E.crash.forEach((p,i)=>{let md=1e9;for(const h of H)md=Math.min(md,Math.hypot(h.c.x-p[0],h.c.z-p[2]));md-=Math.hypot(p[0]-HELI.x,p[2]-HELI.z)*.2;if(md>bs){bs=md;bi=i}});
    const C=E.crash[bi],T=3.6;this.cs=bi;S.crash={x:C[0],z:C[2],x0:HELI.x,y0:HELI.y,z0:HELI.z,t:0,T};S.mode='crash';S.mt=T+1.5;TELE.add({k:'c',x:C[0],y:0,z:C[2],r:9,d:T});this.fx({k:'crs',i:a.id});EP.say('cP3')},
  crashHit(a,S){const Q=S.crash;S.crash=null;HELI.spinY=0;const yaw=HELI.yaw;this.cyaw=yaw;this.fx({k:'cr',x:r2(Q.x),z:r2(Q.z),yw:r3(yaw),cs:this.cs});for(const h of SCEN.H)if(h.bot&&h.alive)this.unstuck(h);
    for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-Q.x,h.c.z-Q.z);if(d>9)continue;const f=1-d/9;hurtHuman(h,EPD(55*(.35+.65*f)),a,{});epFx(h,'kd',1.3);SCEN.pushHuman(h,(h.c.x-Q.x)/(d||1)*10*f,4+3*f,(h.c.z-Q.z)/(d||1)*10*f)}
    const e=HELI.toW(0,0,1.2,_chV2);CHFIRE.add({k:'c',x:e.x,z:e.z,y:0,r:2.3,life:1e6,dmg:8});
    S.fly=false;a.cnFly=false;this.ammoT=Math.min(this.ammoT==null?4:this.ammoT,4);const p=this.exitPt();placeAt(a,p[0],p[1],p[2],yaw+Math.PI/2);S.mode='p3a';S.mt=2;S.invT=3.5;a.cnPose='crawl';CHFOG.on=true;EP.later(2.6,()=>EP.say('cP3l'));EP.later(5,()=>EP.say('cWo'))},
  // (every page: the wreck where the crash put it)
  wreckHere(x,z,yaw){HELI.wreckAt(x,z,yaw)},
  // a body caught inside the wreck's boxes: out to the nearest side
  unstuck(h){if(!h||!h.alive)return;const c=h.c,r=(c.hw||.3)+.05;for(const b of HELI.boxes){if(c.x<b.x0-r||c.x>b.x1+r||c.z<b.z0-r||c.z>b.z1+r||c.y>b.y1-.2)continue;
      const L=[[b.x0-r-.1-c.x,0],[b.x1+r+.1-c.x,0],[0,b.z0-r-.1-c.z],[0,b.z1+r+.1-c.z]].sort((p,q)=>Math.abs(p[0]+p[1])-Math.abs(q[0]+q[1]))[0];c.x+=L[0];c.z+=L[1]}},
  // where he crawls out: beside the cockpit, on whichever side is clear
  exitPt(){for(const sd of [-1,1]){const p=HELI.toW(sd*2.6,0,-4.2,_chV2),n=navSnap(p.x,0,p.z,2.5);if(n)return [n.x,n.y,n.z]}const n=navSnap(HELI.x+3,0,HELI.z,6);return n?[n.x,n.y,n.z]:[HELI.x+3,0,HELI.z]},
  // ---------- host: damage in (before the game applies it) ----------
  hit(t,dmg,src,o){const S=t.cn;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret'||S.mode==='crash'||S.mode==='p3a')return 0;let mul=1;
    const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    if(S.fly&&!o.aa){o.kb=0;o.up=0;const part=o.he?'he':HELI.partAt(o.x,o.y,o.z);
      if(part==='gunner'){if(HELI.gun&&!S.enc){S.gunHp-=dmg*em;if(S.gunHp<=0)this.gunnerDie(t,S)}return 0}
      if(part==='he')mul=.9;else if(part==='engine'){mul=2.2;if(!S.enc)this.grog(t,dmg*2.2/t.maxHp*380)}else if(part==='tail'){mul=1.4;if(!S.enc)this.grog(t,dmg*1.4/t.maxHp*160)}else if(part==='cockpit')mul=1;else mul=.3}
    else if(!S.fly)o.kb=(o.kb||0)*.4;
    if(S.mode==='downF'||S.mode==='down')mul*=1.5;if(o.he&&!o.aa)this.grog(t,15);
    let out=dmg*mul;if(S.mode==='may'&&S.may){S.may.d+=out*em;if(S.may.d>=t.maxHp*.04)this.mayBreak(t,S)}
    const fl=t.maxHp*(S.enc?.85:S.ph===1?CH_PH[1]:S.ph===2?CH_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    S.dmgW+=out*em;return out},
  // ---------- host, every frame: the rotor wash on the bots; every page its own player ----------
  wash(h,dt){if(!h||!h.alive||h.team!==TH||!HELI.flying()||HELI.rpm<.5)return;const g=floorY(HELI.x,HELI.y,HELI.z),ht=HELI.y-g;if(ht>9)return;const dx=h.c.x-HELI.x,dz=h.c.z-HELI.z,d=Math.hypot(dx,dz);if(d>9||d<.3)return;
    const f=(1-d/9)*(1-ht/9)*6*(h.duck?.5:1);h.kvx=approach(h.kvx,dx/d*f,dt*10);h.kvz=approach(h.kvz,dz/d*f,dt*10)},
  // ---------- ammo boxes (host): one in each AA gun's pit and, once it is down, two at the wreck's cabin doors (RT-1's cargo);
  // every 30 s wherever none is lying (a long fight against something in the sky empties the guns) ----------
  ammoPts(){const out=[],ok=n=>n&&!CHFIRE.at(n.x,n.z,.5)&&!HELI.boxes.some(b=>n.x>b.x0-.5&&n.x<b.x1+.5&&n.z>b.z0-.5&&n.z<b.z1+.5);
    for(const s of MAP.ez.aa){const n=navSnap(s.x-1.6,0,s.z+1.6,1.2);if(ok(n))out.push([n.x,n.y,n.z])}
    if(HELI.wreck&&HELI.on)for(const sd of [-1,1]){const p=HELI.toW(sd*2.5,0,-2,_chV2),n=navSnap(p.x,0,p.z,1.2);if(ok(n))out.push([n.x,n.y,n.z,1])}return out},
  ammoTick(dt,b){if(EP.st!==4||EP.ph!=='run'||!b||!b.alive||!b.cn||b.cn.enc)return;this.ammoT=(this.ammoT==null?12:this.ammoT)-dt;if(this.ammoT>0)return;this.ammoT=30;let w=0;
    for(const p of this.ammoPts()){if(EPK.list.some(k=>Math.hypot(k.x-p[0],k.z-p[2])<2))continue;EPK.spawn(p[0],p[1],p[2]);if(p[3])w=1}if(w)this.sayOnce('cAmmo')},
  // ---------- bots ----------
  // (under a magazine left in reserve for the main gun (or the pistol, with no main gun): the nearest ammo box first)
  lowAm(a){const p=a.inv&&a.inv[1],id=p&&a.ammo[p]?p:a.inv&&a.inv[2],W=id&&WPN[id],A=id&&a.ammo[id];return !!(W&&A&&W.res&&!a.pup&&A.res<W.mag)},
  boxNear(a,r){let best=null,bd=r;for(const k of EPK.list){const d=Math.hypot(k.x-a.c.x,k.z-a.c.z);if(d<bd&&Math.abs(k.y-a.c.y)<2&&!CHFIRE.at(k.x,k.z,.4)&&!TELE.at(k.x,k.z,.4)){bd=d;best=k}}return best},
  // the one with the duty: the ready AA gun nearest the helicopter, the bot nearest its loader
  duty(){const now=G.t;if(this.dutyT>now)return this.dutyD;this.dutyT=now+1;this.dutyD=null;const b=EP.bossA();if(!b||!b.cn||EP.ph!=='run'||b.cn.enc||!HELI.flying())return null;
    let G1=null,gd=1e9;for(const G0 of AAG.L){if(G0.st!==0)continue;const d=Math.hypot(G0.x-HELI.x,G0.z-HELI.z);if(d<gd){gd=d;G1=G0}}if(!G1)return null;
    let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-G1.bx,h.c.z-G1.bz);if(d<bd){bd=d;best=h}}
    return this.dutyD=best?{x:G1.bx,z:G1.bz,bot:best.id,k:G1.i}:null},
  botGoal(a,i){const b=EP.bossA();if(!b||!b.cn||EP.ph!=='run')return null;const S=b.cn;if(S.enc)return null;
    const D=this.duty();if(D&&D.bot===a.id)return [D.x,0,D.z,.3];
    if(this.lowAm(a)){const k=this.boxNear(a,50);if(k)return [k.x,k.y,k.z,.05]}
    if(S.fly){const C=this.cen(),L=MAP.ez.cover.map(p=>[p,Math.abs(Math.hypot(p[0]-C[0],p[2]-C[2])-9)+hash2(Math.round(p[0]),Math.round(p[2]),a.id)*6+(CHFIRE.at(p[0],p[2],1)?40:0)]).sort((p,q)=>p[1]-q[1]);
      const p=L[i%Math.min(L.length,5)];return p?[p[0][0],p[0][1],p[0][2],1.2]:null}
    const Z=EP.zone('D').box,an=i*1.9+Math.floor(G.t/6)*.8,r=10.5;return [clamp(b.c.x+Math.cos(an)*r,Z[0]+3,Z[2]-3),0,clamp(b.c.z+Math.sin(an)*r,Z[1]+3,Z[3]-3),2]},
  goalTag(b){const S=b.cn;if(!S)return '';const D=this.duty();return S.ph+(S.fly?'a':'g')+(D?D.k+':'+D.bot:'')},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;const G0=AAG.L[j];return G0&&G0.st===0&&HELI.flying()?j:-1},
  // out of the fires, out from under a low rotor, down below the sills when the door gun sweeps the cab
  danger(a){if(!(EP.st===4||EP.meet&&EP.meet.st==='on'))return null;const c=a.c,f=CHFIRE.at(c.x,c.z,.5);if(f)return f;const b=EP.bossA(),S=b&&b.cn;if(!S)return null;
    if(S.mode==='sweep'&&this.inCabH(a))return {ax:0,az:0,duck:true};
    if(HELI.flying()){const g=floorY(HELI.x,HELI.y,HELI.z);if(HELI.y-g<8){const dx=c.x-HELI.x,dz=c.z-HELI.z,d=Math.hypot(dx,dz)||1;if(d<7)return {ax:dx/d,az:dz/d}}}
    return null},
  // ---------- the boss stage's own devices: the AA guns' loaders (0-2) ----------
  useNear(h){if(!EP.on||EP.id!==8||EP.st!==4)return -1;for(const G0 of AAG.L)if(AAG.near(G0,h))return G0.i;return -1},
  useInfo(i,L){const G0=AAG.L[i];if(!G0)return null;if(!HELI.flying())return {act:L?'Nothing in the sky to shoot at':'쏠 헬기가 없다',p:0,x:1};
    if(G0.st===0)return {act:L?'load the AA gun':'대공포 장전',p:G0.p/AAG.T,x:0};if(G0.st===1)return {act:L?'Loaded — it fires once the helicopter is in range':'장전 완료 — 헬기가 사거리에 들면 쏜다',p:1,x:1};
    if(G0.st===2)return {act:L?'Firing!':'발사 중!',p:1,x:1};return {act:(L?'Reloading ':'재장전 ')+Math.max(0,Math.ceil(G0.cd))+(L?' s':'초'),p:1-G0.cd/AAG.CD,x:1}},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==8)return;const b=EP.bossA();
    if(NET.cli){const f=EP.bf;if(f&&f.hp&&!HELI.on)HELI.place(f.hp[0],f.hp[1],f.hp[2],f.hp[3]);HELI.sl=f&&f.f&16?(this.slT||(this.slT={x:MAP.ez.meet.c[0],y:6.2,z:MAP.ez.meet.c[1]})):null;if(f){AAG.sync(f.aa);const wo=!!(f.f&128);if(CHFOG.on!==wo)CHFOG.on=wo;if(f.ph===3&&f.cs>=0&&!HELI.wreck&&EP.st===4&&!(f.f&1)){this.cs=f.cs;this.wreckHere(MAP.ez.crash[f.cs][0],MAP.ez.crash[f.cs][2],this.cyaw||0)}}}
    else{AAG.hostTick(dt);FRZ.tick(dt);this.ammoTick(dt,b);if(HELI.flying())for(const h of SCEN.H)if(h.bot)this.wash(h,dt)}
    this.wash(G.player,dt);HELI.update(dt);AAG.update(dt);CHFIRE.update(dt);CHGFX.update(dt);CHFOG.update(dt)},
  stageClear(kind){CHGFX.clear();ELAS.clear()},
  clear(){this.cur=null;this.said={};this.sayT={};this.encNext=false;this.dutyT=0;this.dutyD=null;this.cs=-1;this.cyaw=0;this.gunDead=false;this.logN=0;this.ammoT=null;CHGFX.clear()},
  // the boss bar: gauges and what he is doing (flags: 1 flying, 2 down / staggered / sinking, 4 invulnerable, 8 enraged, 16 first meeting,
  // 32 the gunner still in his door, 64 the engine on fire, 128 the whiteout, 256 a mayday, 512 crashing, 1024 the ropes out)
  bsOf(b){const S=b.cn;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.fly?1:0)|(S.mode==='downF'||S.mode==='down'||S.mode==='stag'?2:0)|(S.invT>0&&!S.enc?4:0)|(S.enr?8:0)|(S.enc?16:0)|(HELI.gun&&S.fly?32:0)|(HELI.smoke>.3?64:0)|(CHFOG.on?128:0)|(S.mode==='may'?256:0)|(S.mode==='crash'?512:0)|(HELI.rope>0?1024:0),
    pose:Math.max(0,CH_POSE.indexOf(b.cnPose||'')),gh:S.gunMax?Math.max(0,S.gunHp)/S.gunMax:0,cs:this.cs,aa:AAG.pack()}},
  bsPack(b){if(!b.cn)return 0;const B=this.bsOf(b),H=HELI;return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pose,Math.round(B.gh*100),B.cs,B.aa,
    H.on&&!H.wreck?[Math.round(H.x*100),Math.round(H.y*100),Math.round(H.z*100),Math.round(H.yaw*1000),Math.round(H.pitch*1000),Math.round(H.roll*1000),Math.round(H.vx*100),Math.round(H.vy*100),Math.round(H.vz*100),Math.round(H.rpm*100),Math.round(H.smoke*100),H.rope?1:0,Math.round(H.wob*100)]:0]},
  bsUnpack(B){const h=B[9];return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pose:B[5],gh:(B[6]|0)/100,cs:B[7]==null?-1:B[7],aa:Array.isArray(B[8])?B[8]:null,
    hp:Array.isArray(h)?[h[0]/100,h[1]/100,h[2]/100,h[3]/1000,h[4]/1000,h[5]/1000,h[6]/100,h[7]/100,h[8]/100,h[9]/100,h[10]/100,h[11],h[12]/100]:null,rt:performance.now()}},
  hud(B,L){const f=B.f,air=!!(f&1);return {ss:f&4?(L?'INVULNERABLE':'무적'):f&512?(L?'GOING DOWN':'추락한다!'):f&2?(air?(L?'IT IS SINKING — POUR IT ON':'기체가 흔들린다 — 집중 사격!'):(L?'DOWN!':'그로기!')):f&256?(L?'MAYDAY — break it!':'메이데이 — 끊어!'):f&8?(L?'ENRAGED':'광폭화'):air&&f&1024?(L?'PASSENGERS ON THE ROPES':'로프로 승객이 내려온다'):f&128?(L?'WHITEOUT':'화이트아웃'):'',
    cls:f&8||f&256||f&512?'r':f&2?'y':'',sp:(f&16?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(air&&!(f&16)?(L?' · IN THE AIR':' · 비행 중'):''),
    g1:B.grog/(B.gmax||100),g2:f&32&&!(f&16)?B.gh:null}},
  // the AA guns (ready: load it; loaded: waiting), the door gunner
  markers(list,L,P){const Bs=EP.bs();if(!Bs)return;const air=!!(Bs.f&1);if(!air||Bs.f&16)return;
    for(const G0 of AAG.L){if(G0.st===0){const c=HELI.toW(0,2,-1,_chV2),hot=Math.hypot(c.x-G0.x,c.z-G0.z)<AAG.R;list.push([G0.bx,1.9,G0.bz,L?'⚡ LOAD THE AA GUN':'⚡ 대공포 장전',hot?'p hot':'p'])}else if(G0.st===1)list.push([G0.x,3.2,G0.z,L?'◎ AA GUN LOADED':'◎ 대공포 대기','p'])}
    if(Bs.f&32){const g=HELI.toW(1.3,1.6,-1.6,_chV2);list.push([g.x,g.y+.9,g.z,L?'◎ THE GUNNER':'◎ 사수','b'])}},
  // ---------- every page: before the rig is posed — in his seat or on his feet, the shot volumes, where the bots aim ----------
  pre(a,dt){this.cur=a;const S=a.cn;let pose=a.cnPose||'',f=0;
    if(!NET.cli&&S){f=this.bsOf(a).f}else{const bf=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(bf){pose=CH_POSE[bf.pose]||'';f=bf.f}}
    a.cnFly=!!(f&1)&&HELI.on&&!HELI.wreck;if(a.cnFly){this.seatIn(a);pose='seat'}
    if(pose!==a.cnPose)a.cnPk=0;a.cnPose=pose;a.cnF=f;a.epDown=approach(a.epDown||0,a.alive&&f&2&&!a.cnFly?1:0,dt*3);a.epHide=false;a.epPri=a.cnFly?.55:(f&2?.3:.4);a.epAimY=1.55;
    if(a.cnFly){if(!a.cnRay)a.cnRay=(ox,oy,oz,dx,dy,dz,t)=>{const r=HELI.ray(ox,oy,oz,dx,dy,dz,t);return r?{t:r.t,part:'ball'}:null};a.epRay=a.cnRay;a.epRayZc='charon';
      // (where the bots aim: the cockpit, the hull or the engine by turns, as a team's shots spread over it)
      const k=Math.floor(G.t/2.2)%7,P=k<3?HELI.toW(0,1.7,-4.4,_chV2):k<6?HELI.toW(0,1.6,-.8,_chV2):HELI.toW(0,3.1,-.4,_chV2);a.epAimP=a.cnAim||(a.cnAim={x:0,y:0,z:0});a.epAimP.x=P.x;a.epAimP.y=P.y;a.epAimP.z=P.z;a.epMuz=a.cnMuz||(a.cnMuz=new THREE.Vector3());HELI.muzzle(a.epMuz)}
    else{if(a.epRayZc==='charon'){a.epRay=null;a.epRayZc=null}a.epAimP=null;a.epMuz=null}},
  // the rig's extras: 1.15× on his feet (1× in the seat), the flare gun (in his hand to fire, else in its holster), the tints
  rigX(ch){const m=new THREE.Mesh(gunGeo('chFlareGun'),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);const o=ch.A.def.o;
    return {fg:m,hand:new THREE.Matrix4().makeTranslation(0,-o.fore-.03,-.02).multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2)),hip:new THREE.Matrix4().makeTranslation(.23,-.1,.02).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2))}},
  // (in the air the rig sits in the cockpit and tilts with it; on his feet it stands upright again)
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_charon')return;const fly=a.cnFly&&!!HELI.body&&HELI.flying();
    if(fly){if(ch.grp.scale.x!==1)ch.grp.scale.setScalar(1);ch.grp.position.copy(HELI.toW(-.48,.53,-4.35,_chV3));_chM.extractRotation(HELI.body.matrixWorld);ch.grp.quaternion.setFromRotationMatrix(_chM);ch.grp.updateMatrixWorld(true)}
    else{if(ch.grp.scale.x!==CH_S)ch.grp.scale.setScalar(CH_S);if(ch.grp.rotation.x||ch.grp.rotation.z){ch.grp.rotation.set(0,a.yaw,0);ch.grp.updateMatrixWorld(true)}}
    a.hitW=.32;a.headR=.19;
    const X=ch.cnX||(ch.cnX=this.rigX(ch)),vis=ch.grp.visible,P=a.cnPose||'',f=a.cnF||0,inHand=P==='flare'||P==='point';
    X.fg.visible=vis&&!a.cnFly;X.fg.matrix.multiplyMatrices(inHand?ch.M[6]:ch.M[0],inHand?X.hand:X.hip);X.fg.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value);
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(f&4)T.set(1,.92,.98,.16+.08*Math.sin(G.t*30));else if(f&8)T.set(.9,.2,.1,.14+.06*Math.sin(G.t*9));else if(f&256)T.set(1,.5,.2,.08+.05*Math.sin(G.t*13))}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'hp':if(NET.cli){HELI.place(m.x/100,m.y/100,m.z/100,m.yw/1000);HELI.gun=!!m.g}break;
    case 'w':if(a){const c=a.c;if(m.s==='gun'||m.s==='sw')AU.at('rack',HELI.x,HELI.y+1.6,HELI.z,{vol:.8,range:80,rate:.8});else if(m.s==='fl')AU.at('magin',c.x,c.y+1.5,c.z,{vol:.7,range:40,rate:1.3});
      else if(m.s==='scr')AU.at('zroar',c.x,c.y+1.8,c.z,{vol:1,range:70,rate:1.25});else if(m.s==='dv')AU.at('chalarm',HELI.x,HELI.y+2,HELI.z,{vol:.8,range:70});
      if(m.s==='sw'&&P&&P.alive&&this.inCabH(P))HUD.note(L?'The door gun — get down below the sills!':'문 기관총 — 앉아서 창틀 아래로!',2)}break;
    case 'gf':{const q=CHGFX.add({k:'gf',x:m.x/100,z:m.z/100,y:m.y/100,yw:m.yw/1000,l:m.l/100,d:m.d||1,nose:!!m.n});if(NET.cli)HELI.gunT=new THREE.Vector3(q.x-Math.sin(q.yw)*q.l/2,q.y+1,q.z-Math.cos(q.yw)*q.l/2);break}
    case 'sw':{CHGFX.add({k:'sw',d:m.d||1.2,dir:m.dir||1});if(NET.cli){const T=MAP.ez.tower;HELI.gunT=new THREE.Vector3(T.x,T.y+1.4,T.z)}break}
    case 'rk':CHGFX.add({k:'rk',p:(m.p||[]).map((v,i)=>Object.assign([v[0]/100,v[1]/100,v[2]/100,v[3]/100],{s:i%2?1:-1}))});break;
    case 'rp':HELI.rope=m.o?1:0;if(m.o)AU.at('chrope',HELI.x,HELI.y,HELI.z,{vol:.8,range:50});break;
    case 'fu':CHGFX.add({k:'fu',T:(m.T||110)/100});AU.at('salgust',HELI.x,HELI.y,HELI.z,{vol:.8,range:60,rate:1.4});break;
    case 'dw':{const x=m.x/100,y=m.y/100,z=m.z/100;for(let i=0;i<40;i++){const g=i/40*TAU;FX.spawn({x,y:y+.3,z,vx:Math.cos(g)*11,vy:rr(.3,1.5),vz:Math.sin(g)*11,life:rr(.6,1),s0:.5,s1:1.8,r:.88,g:.92,b:.95,a:.55,f:2,drag:1.6})}
      AU.at('salgust',x,y,z,{vol:1,range:70});if(P&&P.alive&&Math.hypot(P.c.x-x,P.c.z-z)<12)FX.shake=Math.max(FX.shake,.7);break}
    case 'fi':if(NET.cli)CHFIRE.add({id:m.id,k:m.f,x:m.x/100,z:m.z/100,y:m.y/100,r:m.r/100,yaw:m.yw/1000,w:m.w/100,l:m.l/100,life:m.life/100,dmg:m.d},true);break;
    case 'fl':CHGFX.add({k:'fl',a:m.a.map(v=>v/100),b:m.b.map(v=>v/100),T:m.T||.55,h:3});break;
    case 'may':if(a){AU.at('chmay',a.c.x,a.c.y+1.6,a.c.z,{vol:1,range:90});if(P&&P.alive)HUD.note(L?'Mayday — break his radio call!':'메이데이 — 집중 사격으로 끊어!',2.2)}break;
    case 'mayx':if(a){AU.at('lrbreak',a.c.x,a.c.y+1.6,a.c.z,{vol:.9,range:80,rate:.6});HUD.announce(L?'MAYDAY CUT':'메이데이를 끊었다!','h',1.8)}break;
    case 'mayok':if(a)AU.at('frburst',a.c.x,a.c.y,a.c.z,{vol:.9,range:60});break;
    case 'scr':if(a){AU.at('zroar',a.c.x,a.c.y+1.8,a.c.z,{vol:1,range:90,rate:.95});for(let i=0;i<30;i++){const g=i/30*TAU;FX.spawn({x:a.c.x,y:a.c.y+1,z:a.c.z,vx:Math.cos(g)*9,vy:rr(-.3,.3),vz:Math.sin(g)*9,life:.6,s0:.3,s1:1,r:1,g:.6,b:.85,a:.35,f:2,drag:1.2,add:1})}}break;
    case 'ag':if(NET.cli)AAG.set(m.i,m.s,m.c,true);break;
    case 'aah':{const G0=AAG.L[m.i];if(HELI.flying()){const c=HELI.toW(0,2,-1,_chV2);FX.explode(c.x,c.y,c.z,'he');AU.at('explode',c.x,c.y,c.z,{vol:1,range:160,occ:false});for(let i=0;i<24;i++)FX.spawn({x:c.x,y:c.y,z:c.z,vx:rr(-5,5),vy:rr(-3,4),vz:rr(-5,5),life:rr(.4,.9),s0:.12,s1:.03,r:1,g:.7,b:.3,f:0,grav:9,add:1})}
      HUD.announce(L?'AA HIT':'대공포 명중!','h',1.4);break}
    case 'gd':CHGFX.add({k:'gd',x:m.x/100,y:m.y/100,z:m.z/100,yw:m.yw/1000,vx:m.vx/100,vz:m.vz/100});HUD.announce(L?'THE GUNNER IS DOWN':'사수 처치!','h',2);HELI.gun=false;break;
    case 'dn':if(a){AU.at('chalarm',HELI.x,HELI.y+2,HELI.z,{vol:1,range:90});HUD.note(m.f?(L?'It is sinking — ×1.5 damage':'기체가 흔들린다 — 피해 1.5배'):(L?'Down — ×1.5 damage':'그로기 — 피해 1.5배'),2.5)}break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'eng':if(HELI.flying()){const c=HELI.toW(0,3.1,.4,_chV2);FX.explode(c.x,c.y,c.z,'he');AU.at('explode',c.x,c.y,c.z,{vol:1,range:150,occ:false,rate:.8})}HELI.smoke=1;break;
    case 'crs':AU.at('chalarm',HELI.x,HELI.y+2,HELI.z,{vol:1,range:120});AU.at('lrbreak',HELI.x,HELI.y+3,HELI.z,{vol:1,range:140,rate:.4});HUD.announce(L?'IT IS GOING DOWN':'추락한다!','z',2.4);break;
    case 'cr':{const x=m.x/100,z=m.z/100;this.cs=m.cs;this.cyaw=m.yw/1000;this.wreckHere(x,z,this.cyaw);if(P&&P.alive)this.unstuck(P);FX.explode(x,1,z,'he');FX.explode(x+rr(-2,2),2,z+rr(-2,2),'he');AU.at('chcrash',x,1,z,{vol:1,range:200,occ:false});AU.at('explode',x,1,z,{vol:1,range:200,occ:false,rate:.7});
      for(let i=0;i<60;i++)FX.spawn({x:x+rr(-3,3),y:rr(.3,3),z:z+rr(-3,3),vx:rr(-7,7),vy:rr(2,9),vz:rr(-7,7),life:rr(.6,1.6),s0:.2,s1:.05,r:1,g:.6,b:.2,f:0,grav:9,add:1});
      if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<30){FX.shake=Math.max(FX.shake,1.2-d/30);AU.shock(1-d/36)}}CHSND.stop();break}
    case 'wo':CHFOG.on=!!m.o;break;
    case 'ph':HUD.announce(m.n===2?(L?'THE ENGINE IS BURNING':'엔진 화재'):(L?'WHITEOUT — HE IS ON THE GROUND':'화이트아웃 — 땅 위의 카론'),'z',3);AU.play('stingZ',{vol:.7});if(m.n===3)CHFOG.on=true;break;
    case 'enr':HUD.announce(L?'CHARON IS ENRAGED':'카론 광폭화','z',2.5);break;
    case 'meet':AU.at('chalarm',HELI.x,HELI.y,HELI.z,{vol:.5,range:120});break;
    case 'fw':{const x=m.x/100,y=m.y/100,z=m.z/100;AU.at('frburst',x,y,z,{vol:1,range:45});AU.at('zgrowl',x,y+1,z,{vol:.8,range:40,rate:.8});
      for(let i=0;i<26;i++)FX.spawn({x:x+rr(-.6,.6),y:y+rr(.1,.8),z:z+rr(-.6,.6),vx:rr(-2.4,2.4),vy:rr(1.5,4.5),vz:rr(-2.4,2.4),life:rr(.6,1.2),s0:.25,s1:.8,r:.9,g:.94,b:.97,a:.75,f:2,drag:1.5,grav:3});break}
    case 'fs':if(a){const c=a.c;AU.at('frshat',c.x,c.y+1,c.z,{vol:1,range:45});for(let i=0;i<22;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.3,1.6),z:c.z+rr(-.3,.3),vx:rr(-3,3),vy:rr(.5,4),vz:rr(-3,3),life:rr(.5,1),s0:.08,s1:.04,r:.8,g:.92,b:1,a:.9,f:0,grav:9})}break;
    case 'chl':{const v=m.h?byIdAny(m.v):P&&P.id===m.v?P:null;if(v){v.frChillT=G.t+1.8;if(v===P)HUD.note(L?'Frozen stiff — slowed':'얼어붙었다 — 느려짐',1.2)}break}}}};
EPZ.charon={hp:()=>CHARON.hpFor(),init:a=>CHARON.init(a,CHARON.encNext),ai:(a,dt)=>CHARON.ai(a,dt),
  hit:(t,dmg,src,o)=>t.cn?CHARON.hit(t,dmg,src,o):dmg,
  spark(t,o){t.cnHitT=G.t},
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?6:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?30:22),a,{claw:1});return true},
  pre:(a,dt)=>CHARON.pre(a,dt),attach:a=>CHARON.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;t.cnFly=false;if(t.epRayZc==='charon'){t.epRay=null;t.epRayZc=null}t.epAimP=null;if(t.cn&&!t.cn.enc&&!NET.cli){EP.say('cDie');CHARON.fx({k:'wo',o:0})}},
  gone(a){ELAS.stop(a,true);a.kin=null;a.cnFly=false;if(a.epRayZc==='charon'){a.epRay=null;a.epRayZc=null}a.epAimP=null;a.epMuz=null;if(a.cn)a.cn.mode='gone';HELI.hide()}};
// the Frozen: asleep (its own brain: nothing), a hit wakes it, fire and blasts hurt it more, its claws chill; it shatters
EPZ.frozen={init(a){a.frDorm=false;a.frBurst=0;a.frRushT=0;a.epHide=false;a.frRvAt=G.t},
  ai(a,dt){if(!a.frDorm)return false;a.scSeen=G.t;const c=a.cmd;c.f=c.s=0;c.fire=c.jump=c.alt=false;return true},
  hit(t,dmg,src,o){if(t.frDorm&&!NET.cli)FRZ.wake(t);return o.he||o.fire||o.dot||o.w&&WPN[o.w]&&WPN[o.w].flame?dmg*1.6:dmg},
  claw(a,t){if(!t||!t.alive||t.team!==TH)return false;if(t.net&&t!==G.player)netEv('ech',{k:'chl',v:t.id});else CHARON.fxApply({k:'chl',v:t.id,h:1});return false},
  pre(a){if(!NET.cli)a.epHide=!!a.frDorm},
  // (every page, from where it is: under the snow its drift shows, not its body; just revived, nothing until the snapshot has it down)
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_frozen')return;const X=ch.frX||(ch.frX=FRZ.rigX(ch)),y=a.c.y,dorm=a.alive&&y<-1.25,fresh=a.alive&&G.t-(a.frRvAt||-9)<.25&&y>-1;
    X.mound.visible=ch.grp.visible&&dorm;ch.mesh.visible=!(a.alive&&y<-1.38)&&!fresh;
    if(dorm){X.pT=(X.pT||0)-.016;if(X.pT<=0){X.pT=.5;sampleProbe(a.c.x,.6,a.c.z,X.mound.material.uniforms.uProbe.value)}}
    else if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(T.w===0)T.set(.72,.88,1,.14)}},
  die(t){t.frDorm=false;t.epHide=false;CHARON.fxApply({k:'fs',i:t.id})},
  gone(a){a.frDorm=false;a.epHide=false}};
Object.assign(ZGAIT,{charon:{stride:1,knee:1,runK:1.1,bob:.9,twist:.7,sway:.9},frozen:{stride:.8,knee:.55,runK:.75,bob:.55,twist:.45,sway:.7}});
Object.assign(JAW0,{charon:.2,frozen:.1});

// ---------- the rig poses (every page): CHARON in his seat (hands on the stick and the collective, looking out), firing the flare gun,
// kneeling at his radio, screaming, crawling out of the wreck, running for his life (looking back over his shoulder), down; the Frozen
// shivering (the zombie gait and the claws are the base pose's) ----------
{const pz=poseZombie;
  // [spine pitch (+ back), head pitch (+ up), L shoulder fwd, L shoulder out (−), L elbow, R shoulder fwd, R shoulder out (+), R elbow, jaw]
  const PT={idle:[-.05,.05,.3,-.18,.5,.32,.18,.5,.25],seat:[.1,-.08,.42,-.22,.95,.62,.06,1.05,.15],flare:[-.04,.28,.42,-.3,1,1.9,.1,.06,.45],point:[-.04,.2,.3,-.2,.5,1.5,.06,.1,.3],
    kneel:[-.2,-.08,.62,-1.05,2.2,.45,.2,.6,.35],scream:[.3,.55,.5,-1.5,.25,.5,1.5,.25,1.35],crawl:[-1.15,.75,1.25,-.12,.25,1.25,.12,.25,.6],run:[-.28,.12,.25,-.3,1.3,.25,.3,1.3,.55],
    down:[-.78,.3,.16,-.24,.4,.24,.26,.32,.85]};
  // the legs where the gait is no use: seated, one knee down, on all fours [L hip, L knee, L ankle, R hip, R knee, R ankle, the drop of the hips]
  const LG={seat:[1.45,-1.45,.05,1.45,-1.45,.05,-.43],kneel:[1.45,-1.5,.05,-.12,-1.55,.65,-.47],crawl:[1.3,-1.6,.45,1.3,-1.6,.45,-.6]};
  const ease=(a,key,t,rate)=>{const dt=clamp(t-(a[key]==null?t:a[key]),0,.1);a[key]=t;return 1-Math.exp(-dt*rate)};
  poseZombie=function(ch,st){
  if(st.zclass==='frozen'&&!(st.dead>0)){pz(ch,st);const R=ch.R,t=st.t||0,sd=st.seed||0,j=Math.sin(t*37+sd)*.035+Math.sin(t*23+sd*2)*.02;
    _chM.makeRotationZ(j);R[2].multiply(_chM);_chM.makeRotationX(j*.8);R[3].multiply(_chM);R[5].multiply(_chM);return}
  if(st.zclass!=='charon'||st.dead>0||!CHARON.cur||CHARON.cur.ch!==ch){pz(ch,st);return}
  const a=CHARON.cur,R=ch.R,t=st.t||0,P0=a.cnPose||'',P=st.down>.3&&P0!=='seat'?'down':P0||'idle';
  if(P==='seat'){st.spd=0;st.mvF=st.mvS=0;st.air=0;st.accel=0;st.turnRate=0;st.land=0}
  pz(ch,st);if(st.atk>0&&P!=='seat'){a.cnT0=t;return}
  const q=PT[P]||PT.idle,E=a.cnE||(a.cnE=q.slice()),k=ease(a,'cnT0',t,P==='seat'?30:9);for(let i=0;i<9;i++)E[i]+=(q[i]-E[i])*k;
  let aL=E[2],aR=E[5];if(P==='run'){const s=Math.sin(st.phase||0);aL+=s*.8;aR-=s*.8}
  const vib=P==='scream'?Math.sin(t*37)*.06:P==='kneel'?Math.sin(t*9)*.03:0,sw=P==='idle'?Math.sin(t*1.3+(st.seed||0))*.05:0;
  // (he looks round all the time: back over his shoulder as he runs, out of the windows in his seat)
  const look=P==='run'?(Math.sin(t*.9)>.55?(Math.sin(t*.45)>=0?1.3:-1.3):0):P==='seat'?Math.sin(t*.6)*.5:P==='idle'?Math.sin(t*.8)*.45:0;
  setE(R[1],E[0],sw,Math.sin(t*.9)*.03);setE(R[2],E[1]+vib*.3,look,0);
  setE(R[3],aL+sw*.5,0,E[3]);setE(R[4],Math.max(-.05,E[4]),0,0);setE(R[5],aR-sw*.5,0,E[6]);setE(R[6],Math.max(-.05,E[7]),0,0);setE(R[11],-clamp(E[8]+vib,0,1.45),0,0);
  const L=LG[P];if(L){setE(R[0],0,0,0);setE(R[7],L[0],0,-.06);setE(R[8],L[1],0,0);setE(R[12],L[2],0,0);setE(R[9],L[3],0,.06);setE(R[10],L[4],0,0);setE(R[13],L[5],0,0);ch.root.set(0,L[6],0)}}}

// ---------- chapter 8 「카론」: Seolryeong Airfield, north of Hanseol (season 2) ----------
//   1 the car park outside the wire — three waves; the Frozen first show up (buried in the snow); then the perimeter gate slides open
//   2 the control tower — 'hold' 80 s in its cab while the radio pulls RT-1's flight log; CHARON's first appearance: FERRY 06 circles
//     the tower and sweeps the cab with its door gun (down below the sills); away north at 85 % or after 40 s
//   3 the hangars — 'act': the generator, the AA shells, the AA fire control (9 s each, any order)
//   4 the apron — the boss fight, three phases (in the air, the burning helicopter, on foot in the whiteout). A wipe replays the phase it reached
CHAP[8]={id:8,k:'charon',map:'ep8',code:'RT1-06',season:2,n:['카론','CHARON'],t:['협동 작전: 카론','Co-op Operation: CHARON'],
  file:[['1차 회수팀 조종사 RT1-06. 땅에 내리지 못한 채 회수 헬기 「페리 06」을 몰고 있다','RT-1\'s pilot, RT1-06: he never came down — he is still flying the team\'s extraction helicopter, FERRY 06'],
    ['대공포 세 문 장전 · 엔진과 꼬리를 노려라 · 문 사수 · 눈 속의 동사자 · 추락 뒤엔 화이트아웃','Load the three AA guns · aim for the engine and the tail · the door gunner · the Frozen in the drifts · after the crash, a whiteout']],
  cards:{place:['설령 비행장 · 해 질 녘 눈보라','SEOLRYEONG AIRFIELD · A BLIZZARD AT DUSK'],who:['1차 회수팀 조종사','RT-1 PILOT'],line:['땅에 내리는 게 무서웠다 — 그래서 한 번도 내려오지 않았다','He was afraid of the ground — so he never came down']},
  boss:CHARON,voice2:['카론','CHARON'],voice3:['관제 무전','TOWER RADIO'],
  // gates: A the perimeter fence's gate, B the airside gate, C hangar 1's big doors onto the apron
  gates:['gA','gB','gC'],gateDur:{gA:1.4,gB:1.2,gC:3.4},
  stages:[null,
    // (the open car park, cars to hide behind on every side: on expert its waves come .8 the size)
    {z:'A',k:'waves',n:['정문 주차장','The car park'],on:['주차장을 지켜라','Hold the car park'],prep:18,clr:'s1c',intro:{zc:'frozen',say:'frz',at:3},doorN:['철조망 정문','PERIMETER GATE'],get wn(){return (G.diff||0)>=3?.8:1},
      wave:w=>[['rager',46],['runner',22],['frozen',w>=2?16:12],['bomber',w>=2?6:0],['brute',w>=3?6:0],['scream',w>=2?4:0]]},
    {z:'B',k:'hold',n:['관제탑','The control tower'],on:['관제탑을 지켜라 — 비행 기록 내려받는 중','Hold the tower — the flight log is coming in'],len:80,hp:[-22,6,20,2.2],mk:[-22,7.9,20,['관제실','TOWER CAB']],
      meet:{at:16,cap:.55},cap:1,say:'s2',clr:'s2c',doorN:['격납고 구역 문','AIRSIDE GATE'],mix:[['rager',40],['runner',26],['frozen',20],['scream',8],['squad',6]]},
    {z:'C',k:'act',n:['격납고','The hangars'],on:['대공포 준비','Get the AA guns ready'],dev:'aaDev',say:'s3',clr:'s3c',devSay:(i,left)=>left===2?'d1':'d2',get cap(){return (G.diff||0)>=3?.5:.7},doorN:['격납고 대문','HANGAR DOORS'],
      mix:[['rager',38],['runner',24],['frozen',22],['bomber',6],['brute',4],['scream',6]]},
    {z:'D',k:'boss',n:['계류장','The apron'],on:['카론을 격추하라','Bring CHARON down'],say:'s4',go:'b0',prepPt:[22,0,-40,2]}],
  // (the hangar doors stay open through the boss stage's prep: bossGo shuts them behind the team)
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n===4&&kind!=='phase')m|=b('gC');return m},
  setup(){AAG.build();CHARON.said={};CHARON.sayT={}},
  // every stage: its drifts get their sleepers (host; none close to where the team starts)
  stageStart(n,kind){AAG.build();CHFIRE.clear();CHGFX.clear();CHARON.logN=0;if(!(n===4&&kind==='phase'&&EP.bossPh>=3))CHFOG.on=false;if(n===4)AAG.reset();
    if(!NET.cli){const Z=MAP.ez.drifts,k=['','A','B','C','D'][n];if(Z&&Z[k])FRZ.lay(Math.round((2+SCEN.H.length*.75)*(n===2?.6:1)),Z[k])}},
  // (whoever is still in the hangar when its doors shut is put out on the apron: the clients get their places in epgo)
  bossGo(){EP.setGates(EP.gm&~EP.bit('gC'));const Z=MAP.ez.zones.D,out=[];let i=0;
    for(const h of SCEN.H){if(!h.alive||EP.inBox(Z.box,h.c.x,h.c.z,0))continue;const s=Z.start[i++%Z.start.length];placeAt(h,s[0],s[1],s[2],s[3]);out.push([h.id,r2(s[0]),r2(s[1]),r2(s[2]),r3(s[3])])}return out},
  clear(){CHARON.clear();HELI.clear();AAG.clear();CHFIRE.clear();CHGFX.clear();CHFOG.reset();FRZ.tT=0},
  // every page, every frame: the windsock; host: a wave's last ones buried in the snow get up and come, the flight log on the radio
  update(dt){const m=E8SOCK.m;if(m){m.rotation.y=-.6+Math.sin(G.t*.7)*.25+Math.sin(G.t*2.3)*.06;m.rotation.z=-.08+Math.sin(G.t*1.9)*.05}
    if(NET.cli)return;
    if(EP.S().k==='waves'&&EP.ph==='wave'&&!EP.queue.length){let dorm=0,awake=0;for(const z of SCEN.Z){if(!z.alive||z.boss)continue;if(z.frDorm)dorm++;else awake++}
      if(dorm&&awake<=1)for(const z of SCEN.Z)if(z.alive&&z.frDorm)FRZ.wake(z)}
    if(EP.st===2&&EP.ph==='run'){const p=EP.obj.p;if(CHARON.logN<1&&p>=34){CHARON.logN=1;EP.say('log1')}else if(CHARON.logN<2&&p>=62){CHARON.logN=2;EP.say('log2')}}},
  endFx(r){if(r.win)this.ending()},
  // after the clear: the flight log's last line; a card for the season so far
  ending(){EP.later(3,()=>EP.radio('end0'));EP.later(7,()=>EP.radio('end1'));EP.later(9.6,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'CO-OP OPERATION · SEASON 2':'협동 작전 · 시즌 2'}</small><h1>${L?'CHAPTER 8 CLEAR':'8챕터 클리어'}</h1><p>${L?'Two of RT-1 left — 02 and 04, up at the Seolryeong weather radar station.':'1차 회수팀은 이제 둘 — 02와 04, 설령산 기상 레이더 기지.'}</p><b>${L?'NEXT — CHAPTER 9 「DAEDALUS」':'다음 이야기 — 9챕터 「다이달로스」'}</b></div></div>`;
    el.className='on';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},6500)},
  radio:{
    start:['2차 회수팀, 설령 비행장이다. 1차 팀이 빠져나가려던 곳 — 남은 셋 중 하나가 여기 있다. 회전날개 소리가 들리면 바로 알려.','RT-2, this is Seolryeong Airfield — where RT-1 meant to get out. One of the three left is here. If you hear a rotor, call it.',0],
    w1:['주차장으로 몰려온다!','They are coming across the car park!',1],
    frz:['눈더미 조심해 — 안에 사람이 묻혀 있어! 다가가거나 근처에서 총을 쏘면 튀어나온다.','Watch the snow mounds — there are bodies under them! Get close or fire nearby and they burst out.',1],
    s1c:['주차장 확보. 정문 연다.','Car park clear. Opening the gate.',0],
    s2:['관제탑으로 올라가. 무전 콘솔에 1차 팀 비행 기록이 남아 있다 — 다 받을 때까지 버텨.','Up into the tower. RT-1\'s flight log is still on the radio console — hold out until it is all in.',0],
    enc:['헬기다! 서쪽에서 온다 — 문에 기관총이 있어!','Helicopter! In from the west — there is a gun in the door!',1],
    enc2:['…1차 회수팀 조종사 RT1-06, 카론. 1차 팀 회수 헬기 「페리 06」이다.','…RT-1\'s pilot, RT1-06. CHARON. That is RT-1\'s extraction bird, FERRY 06.',0],
    cMeet:['…안 내려가. 절대로.','…I am not coming down. Not ever.',2],
    cSweep:['관제실을 쓸어 버린다 — 엎드려! 창틀 아래로!','It is raking the cab — get down! Below the sills!',1],
    cRet:['북쪽으로 빠진다 — 계류장 쪽이다.','It is pulling away north — toward the apron.',1],
    log1:['기록 절반. …1차 팀 마지막 비행이 사흘 전이다.','Half the log. …RT-1\'s last flight was three days ago.',0],
    log2:['거의 다 됐다. 탑승자 02, 04 — 조종 06.','Nearly there. On board: 02 and 04 — 06 flying.',0],
    s2c:['기록 확보. 격납고 구역으로 — 저 헬기를 떨어뜨리려면 대공포가 있어야 해.','Got the log. On to the hangars — to bring that helicopter down we need the AA guns.',0],
    s3:['대공포 세 문을 깨워야 한다 — 발전기, 무기고의 탄약, 격납고 2층 관제반.','Three AA guns to wake up — the generator, the shells in the armory, the fire control in the hangar office.',0],
    d1:['하나 됐다. 둘 남았다.','One done. Two to go.',0],
    d2:['마지막 하나!','Last one!',0],
    s3c:['대공포 준비 끝. 격납고 대문 연다 — 저 소리, 돌아왔다.','The AA guns are ready. Opening the hangar doors — hear that? It is back.',0],
    s4:['계류장에 대공포 세 문 — 장전기에서 E를 3초. 헬기가 사거리에 들면 알아서 쏜다. 진지마다 탄약 상자도 있다.','Three AA guns on the apron — hold E at the loader for three seconds. Once the helicopter is in range they fire on their own. There is ammo in every pit.',0],
    b0:['…아래는 죽은 것들뿐이야. 내려가면 나도 그렇게 돼.','…Everything down there is dead. If I come down, so am I.',2],
    cGun:['문 기관총 — 빨간 띠에서 비켜!','Door gun — out of the red strip!',1],
    cRkt:['로켓! 빨간 원에서 벗어나!','Rockets! Out of the red rings!',1],
    cDrop:['로프로 내려온다 — 헬기에서 놈들이 떨어진다!','Ropes out — they are coming down off it!',1],
    cGunX:['사수 처치! 이제 문 기관총은 없다.','Got the gunner! No more door gun.',1],
    cAA:['대공포 명중!','AA hit!',1],
    cP2:['엔진에 불붙었다! 더 낮게 온다 — 조심해!','The engine is on fire! It is coming in lower — careful!',1],
    cP2l:['…괜찮아. 아직 날 수 있어.','…It is all right. I can still fly.',2],
    cFuel:['연료를 뿌린다 — 주황 띠에 불붙는다!','It is dumping fuel — the orange strip is going to burn!',1],
    cDive:['낮게 덮친다 — 빨간 원 밖으로!','It is diving at us — out of the red ring!',1],
    cDown:['기체가 흔들린다! 집중 사격!','It is wobbling! Pour it on!',1],
    cP3:['꼬리 회전날개가 나갔다 — 떨어진다! 빨간 원에서 피해!','The tail rotor is gone — it is going down! Clear the red ring!',1],
    cP3l:['…안 돼… 땅이야… 땅은 싫어…','…No… the ground… not the ground…',2],
    cWo:['눈보라가 짙어진다 — 화이트아웃이다. 붙어서 움직여!','The blizzard is closing in — a whiteout. Stay together!',0],
    cAmmo:['잔해에서 1차 팀 탄약 상자가 쏟아졌다 — 밟으면 보충된다.','RT-1\'s ammo crates spilled out of the wreck — walk over them to top up.',1],
    cFlare:['조명탄 권총이다 — 빨간 원에 불이 붙는다!','A flare gun — the red ring is going to burn!',1],
    cMay:['메이데이를 친다 — 집중 사격으로 무전을 끊어!','He is calling a mayday — focus fire to cut his radio!',1],
    cMayX:['무전을 끊었다!','Cut him off!',1],
    cEnr:['시간 끌면 안 돼 — 점점 거칠어진다!','We cannot drag this out — he is getting wilder!',0],
    cDie:['…이제… 내려왔어…','…There… I came down…',2],
    dead:['카론 무력화. 1차 회수팀 조종사, 확인했다.','CHARON is down. RT-1\'s pilot, confirmed.',0],
    clear:['…비행 기록 마지막 줄이다. "06: 02 · 04 수송. 목적지 설령산 기상 레이더 기지. 돌아와서 기다린다."','…The last line of the flight log: "06: carried 02 and 04. Destination: the Seolryeong weather radar station. Back to wait."',0],
    end0:['설령산 기상 레이더 기지 — 산꼭대기다. 남은 건 둘, 02하고 04.','The Seolryeong weather radar station — the mountaintop. Two left: 02 and 04.',0],
    end1:['…헬기 없이 올라가야겠군.','…We are climbing up there without a helicopter, then.',1]}};

// ---------- hooks ----------
(function(){
  Object.assign(CLIH,{ech(L,m){CHARON.fxApply(m)}});
  const on8=()=>EP.on&&EP.id===8;
  // the Frozen of a wave or a trickle come up out of the snow near the team (host)
  const sp=SCEN.spawn;SCEN.spawn=function(zc,at){if(zc!=='frozen'||at||NET.cli||!on8())return sp(zc,at);const p=FRZ.burstPt();if(!p)return sp(zc,at);
    const a=sp(zc,p);if(a){FRZ.sleep(a);a.frBurst=G.t+rr(.25,1.1)}return a};
  // paths round the wreck (phase 3)
  const gt=AI.goTo;AI.goTo=function(a,x,y,z,maxJ,partial,pen){return gt.call(this,a,x,y,z,maxJ,partial,pen||(HELI.wreck&&HELI.pen&&on8()?HELI.pen:pen))};
  // a Frozen asleep and CHARON in his seat: no physics (the seat puts him where he is)
  const ap=actorPhysics;actorPhysics=function(a,dt){if((a.frDorm||a.cnFly)&&a.alive&&on8())return;return ap(a,dt)};
  // a Frozen's rush out of the snow; a human its claws chilled
  const ms=maxSpeed;maxSpeed=function(a){let s=ms(a);if(!on8())return s;if(a.frRushT>G.t)s*=1.45;if(a.frChillT>G.t)s*=.75;return s};
  // the bots cannot see one asleep in the snow, and it does not count as a zombie close by
  const eh=epHid;epHid=function(a,z,d){if(z.frDorm)return true;return eh(a,z,d)};
  const zn=zNearPt;zNearPt=function(x,y,z,r){if(!on8())return zn(x,y,z,r);for(const t of G.actors){if(!t.alive||t.team!==TZ||t.reviving>0||t.frDorm||Math.abs(t.c.y-y)>2.6)continue;
      const dx=t.c.x-x,dz=t.c.z-z;if(dx*dx+dz*dz<r*r)return true}return false};
  // (a Frozen has a brain of its own while it sleeps, so the scenario's check for a stuck zombie skips them all: it runs here for the waking)
  const us=SCEN.unstick;SCEN.unstick=function(dt){const run=!(SCEN.chkT-dt>0);us(dt);if(!run||!on8())return;
    for(const a of SCEN.Z){if(!a.alive||a.zc!=='frozen'||a.frDorm||a.kin)continue;const idle=G.t-Math.max(a.scSeen||0,a.scHit||0,a.lastHurt||0);
      if(idle>22||a.c.y<-30){a.scSeen=G.t;const p=SCEN.spawnPoint(false);placeAt(a,p[0],p[1],p[2],a.yaw);if(a.bot)AI.onTeam(a)}}};
})();

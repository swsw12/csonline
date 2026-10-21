'use strict';
// ============ Chapter 6 「레가투스」 (season 2): the boss LEGATUS (RT1-01), his command APC TESTUDO, the RT-1 shield trooper ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, laser sights, enemy bullets, grenades,
// smoke, scripted leaps — are in epbase.js). Host-authoritative: the host runs LEGATUS's brain, drives TESTUDO and decides every hit;
// clients get his gauges, the APC's pose, the spike strips and the wreck in the chapter snapshot (EP.pack → bsPack) and the moments as
// events ('elg'). Every page pushes its own player out of the APC; the host pushes its bots and the zombies.
// LEGATUS, RT-1's leader, has 15,000 × (0.6 + 0.4 × humans) × difficulty health and his own brain (EPZ.legatus.ai). The feeling the
// suppressant held down was guilt: he will not have it that his squad is dead, and he still gives the RT-1 squad zombies their orders.
//   phase 1 (100–70 %) up in the command hatch of TESTUDO, an eight-wheeled APC with a plough blade, on the checkpoint's road (MAP.ez.road:
//            a loop round two islands and a crossing between them; it never turns round in a lane — it backs up a short way or drives on
//            round): the hatch machine gun (0.7 s to traverse with its searchlight, 1.8 s bursts, 4 a round), a ram down the lane at whoever stands in it
//            (a red strip 1.2 s first; 46 and knocked flat), smoke when it is pressed, the rear ramp dropping two or three troopers every
//            24 s. The armour takes a fifth of what hits it, the engine at the back ×2.4 (and it fills the stagger gauge), the wheels
//            ×.45, the gun shield and the plough next to nothing, LEGATUS himself the full amount (his helmeted head half its usual
//            bonus). Three spike-strip cases by the road (hold E 3 s): the strip lies across the road until TESTUDO drives over it — a
//            tyre bursts (5 s stopped, ×1.5 damage taken, 22 % slower after, twice at most), the strip spent for 30 s.
//   70 %     the engine catches fire: TESTUDO rolls to a stop on a straight and LEGATUS jumps down; the burning wreck stays as cover
//   phase 2 (70–30 %) on foot, cover to cover: rifle bursts (a laser 0.9 s, three rounds of 16), the M79 (a red ring, 45), a target
//            marked with a laser (8 s: every zombie goes for that one), orders over the radio pack on his back — "charge" (the troopers
//            40 % faster for 6 s) and "shields forward" (two shield troopers in front of him). The pack (5 % of his health, ×2.5 there)
//            breaks: no more orders, +50 stagger.
//   30 %     the wreck blows up (a red ring 7 m round it first when anyone is near: 60 and knocked flat)
//   phase 3 (30–0 %) "nobody gets left behind": the rally (kneeling 2.5 s with a flare — 3.6 s with the radio broken — the troopers that
//            fell in the last 25 s within 25 m get up again; 4 % of his health or a stagger breaks it), artillery on his own position
//            (eight red rings round him, 55 each), bayonet charges (a red strip, 42), faster bursts, leaps up onto the high spots.
// Stagger: the engine (phase 1), HE +15, frost +10 and a slow, the radio pack +50, the fuel bowser on the north island (shoot it and it
// goes up: within 7.5 m of him 6 % of his health and +45). Full gauge: down 6 s (×1.5), the next one 25 % longer. Every phase change is
// 3.5 s of invulnerability and gets the whole team back up; enraged after 240 s (expert 180).
const LG_PH=[1,.7,.3],LG_S=1.25,LG_HY=1.38;// phase floors; his rig's scale; how high his feet stand in the hatch (the road is y 0)
const LG_POSE=['','rifle','gl','order','hatch','down','kneel','charge','throw','brace','hdown'];
const LG_MIX=[['rager',40],['runner',26],['squad',26],['shield',8]];
const APC_AX=[2.35,.8,-.8,-2.35];// TESTUDO's axles along its length (w forward)
const lgAng=(a,b)=>wrapA(b-a);
const lgYaw=(dx,dz)=>Math.atan2(-dx,-dz);

// ---------- atlas materials: TESTUDO's paint (olive under a whitewash), tyres, the engine grille, snow, its lamps, the shield ----------
const LG_MATS=['lgOD','lgODd','lgTire','lgGrille','lgSnow','lgLamp','lgMark','lgGlass','lgBlade','lgBurn','lgShield','lgVisor','lgRadio'];
for(const m of LG_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintLgAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // olive drab under a winter whitewash brushed on in the field (worn through on the edges), scratches, rust bloom
  patch('lgOD',(xx,y,X,Y)=>{const t=nz(X,Y,6101,20),w=nz(X,Y,6102,34),s=nz(X,Y,6103,6);let c=t>.6?'#56603e':t>.42?'#4a5436':'#3e482e';
    if(w>.52)c=mix(c,s>.5?'#d6dad6':'#bec4c0',clamp((w-.52)*3.4,0,.85));if(hash2(X,Y,6104)<.01)c='#2a3020';if(nz(X,Y,6105,9)>.74)c=mix(c,'#6a4428',.5);return c},242);
  patch('lgODd',(xx,y,X,Y)=>{const t=nz(X,Y,6111,18);let c=t>.55?'#3a4430':'#2e3626';if(nz(X,Y,6112,30)>.6)c=mix(c,'#9aa09a',.35);if(hash2(X,Y,6113)<.012)c='#1a1e14';return c},242);
  // tyre rubber: chevron tread across, the sidewall darker
  patch('lgTire',(xx,y)=>{let c=((xx+(y%32<16?y%16:16-y%16))%14)<6?'#141414':'#222222';if(y<10||y>PS-10)c='#1a1a1a';if(hash2(xx,y,6121)<.03)c='#3a3a3a';return c});
  // the engine deck: louvres, soot round them
  patch('lgGrille',(xx,y,X,Y)=>{let c=y%10<4?'#0e0f0e':'#3a3e34';if(nz(X,Y,6131,12)>.55)c=mix(c,'#101010',.5);if(xx<4||xx>PS-5)c='#2a2e24';return c});
  patch('lgSnow',(xx,y,X,Y)=>{const t=nz(X,Y,6141,14);return t>.6?'#eef2f4':t>.4?'#dfe5e9':'#c8d0d8'});
  // the headlamps' lenses (they glow)
  patch('lgLamp',(xx,y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v);return r<.45?'#fffef0':r<.85?'#fff0c8':'#c8b888'},232);
  // RT-1's mark: a white chevron on the olive
  patch('lgMark',(xx,y,X,Y)=>{const u=xx/PS,v=y/PS;let c=nz(X,Y,6151,16)>.5?'#4a5436':'#3e482e';if(Math.abs(v-.5-Math.abs(u-.5)*.8)<.09)c='#e8e8e0';return c});
  patch('lgGlass',(xx,y,X,Y)=>{let c=mix('#123a3a','#1e5450',nz(X,Y,6161,10));if((xx+y)%40<4)c='#3a7a74';return c},246);
  // the plough blade: yellow and black, scraped bright along its cutting edge
  patch('lgBlade',(xx,y,X,Y)=>{let c=(Math.floor((xx+y)/16))%2?'#c8a020':'#181816';if(y>PS-16)c='#8a8e8c';if(nz(X,Y,6171,8)>.66)c=mix(c,'#6a4a28',.6);return c},244);
  patch('lgBurn',(xx,y,X,Y)=>{const t=nz(X,Y,6181,10);let c=t>.62?'#5a2a12':t>.45?'#1c1a18':'#0e0e0e';if(hash2(X,Y,6182)<.02)c='#8a4a1e';return c});
  // the shield: dark composite, a faint weave
  patch('lgShield',(xx,y,X,Y)=>{let c=mix('#2a2e32','#353a3e',nz(X,Y,6191,12));if((xx>>2)%2===(y>>2)%2)c=dk(c,.06);if(xx<3||y<3||xx>PS-4||y>PS-4)c='#1a1c1e';return c},243);
  patch('lgVisor',(xx,y)=>((xx+y)%30<5?'#4a5a66':'#121a20'),248);
  // the radio pack: olive canvas, a speaker grille, a red lamp (it glows)
  patch('lgRadio',(xx,y,X,Y)=>{let c=mix('#3a4230','#4a5238',nz(X,Y,6201,10));if(xx>20&&xx<70&&y>20&&y<64&&(xx%6<2||y%6<2))c='#1a1c16';if(Math.hypot(xx-96,y-30)<8)c='#d82018';return c});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintLgAtlas()}}

// ---------- the models (the weapon material): TESTUDO's hull, a wheel, the turret, the rear ramp, a spike strip, the shield, the pack ----------
// TESTUDO's frame: x right (u), y up, -z forward (so mesh.rotation.y = its yaw); the road is y 0, the hull 7.4 × 3.2 m, the turret 2.4 m up
{const lgSpike=()=>{const L=[Pt(0,.03,0,6.9,.06,.34,'blk2'),Pt(0,.065,0,6.9,.012,.2,'steel')];for(let i=0;i<30;i++){const x=-3.3+i*.228;L.push(Pt(x,.11,.07,.03,.1,.03,'steel'),Pt(x+.11,.11,-.07,.03,.1,.03,'steel'))}return L};
  Object.assign(GUNS,{
  lgHull:{parts:[
    // the lower hull between the wheels, the upper hull overhanging them, the sloped glacis, the nose plate
    Pt(0,.88,0,2.2,.66,6.8,'lgODd'),Pt(0,1.63,.5,2.9,.84,5.8,'lgOD'),Pt(0,1.42,-2.92,2.9,.62,1.25,'lgOD',{rx:-.42}),Pt(0,.92,-3.28,2.2,.74,.3,'lgODd',{rx:.32}),
    // the engine deck at the back (louvres), its exhaust stacks; the rear plate round the ramp
    Pt(0,2.075,2.35,2.5,.06,1.9,'lgGrille'),Pt(1.18,2.3,1.6,.14,.46,.14,'lgBurn'),Pt(1.18,2.55,1.6,.18,.06,.18,'blk'),Pt(-1.18,2.3,1.6,.14,.46,.14,'lgBurn'),
    Pt(0,1.95,3.38,2.9,.2,.06,'lgODd'),Pt(1.25,1.25,3.38,.4,1.4,.06,'lgODd'),Pt(-1.25,1.25,3.38,.4,1.4,.06,'lgODd'),Pt(0,1.72,3.42,1.4,.3,.04,'lgGrille'),
    // fenders over the wheel pairs, stowage boxes on the sides, the RT-1 chevrons, tow hooks
    Pt(1.42,1.22,-1.58,.26,.06,2.5,'lgODd'),Pt(-1.42,1.22,-1.58,.26,.06,2.5,'lgODd'),Pt(1.42,1.22,1.58,.26,.06,2.5,'lgODd'),Pt(-1.42,1.22,1.58,.26,.06,2.5,'lgODd'),
    Pt(1.47,1.68,-.15,.1,.48,1.7,'lgODd'),Pt(-1.47,1.68,-.15,.1,.48,1.7,'lgODd'),Pt(1.456,1.62,1.3,.012,.42,.95,'lgMark'),Pt(-1.456,1.62,1.3,.012,.42,.95,'lgMark'),
    Pt(.8,.62,-3.42,.12,.16,.16,'steel'),Pt(-.8,.62,-3.42,.12,.16,.16,'steel'),Pt(.8,.62,3.42,.12,.16,.16,'steel'),Pt(-.8,.62,3.42,.12,.16,.16,'steel'),
    // lamps: two headlamps in the nose, tail lamps; the driver's vision blocks
    Pt(1.02,1.5,-3.47,.28,.2,.06,'lgLamp'),Pt(-1.02,1.5,-3.47,.28,.2,.06,'lgLamp'),Pt(1.25,1.75,3.42,.16,.1,.04,'red'),Pt(-1.25,1.75,3.42,.16,.1,.04,'red'),
    Pt(-.55,1.86,-2.45,.42,.09,.05,'lgGlass',{rx:-.42}),Pt(.15,1.86,-2.45,.42,.09,.05,'lgGlass',{rx:-.42}),
    // snow on the roof and the glacis
    Pt(0,2.09,-.55,2.6,.05,3.4,'lgSnow'),Pt(0,1.72,-2.86,2.5,.04,1,'lgSnow',{rx:-.42}),
    // the plough blade on its arms
    Pt(0,.72,-3.78,3.25,1.12,.12,'lgBlade',{rx:.2}),Pt(.95,.7,-3.55,.14,.14,.55,'gunmetal'),Pt(-.95,.7,-3.55,.14,.14,.55,'gunmetal'),Pt(0,1.32,-3.68,3.25,.06,.18,'lgSnow')],grip:[0,0,0],muzzle:[0,0,0]},
  lgWheel:{parts:[Pt(0,0,0,.42,1.16,1.16,'lgTire',{r:.42}),Pt(.2,0,0,.05,.56,.56,'gunmetal',{r:.2}),Pt(.23,0,0,.03,.2,.2,'steel',{r:.06})],grip:[0,0,0],muzzle:[0,0,0]},
  // the turret ring (its pivot on the roof), the hatch rim, the gun shield in front of the hatch, smoke launchers, a searchlight, aerials
  lgTurret:{parts:[Pt(0,.17,0,1.7,.34,1.7,'lgOD',{r:.1}),Pt(0,.36,0,1.04,.06,1.04,'gunmetal'),Pt(0,.66,-.6,1.26,.6,.07,'lgODd'),Pt(.66,.6,-.47,.07,.46,.36,'lgODd',{ry:.5}),Pt(-.66,.6,-.47,.07,.46,.36,'lgODd',{ry:-.5}),
    Pt(0,.98,-.6,1.26,.04,.09,'lgSnow'),Pt(0,.72,-.64,.42,.07,.02,'blk'),
    ...[-.2,0,.2].flatMap(k=>[Pt(.84,.32,k,.13,.13,.24,'gunmetal',{rx:-.55}),Pt(-.84,.32,k,.13,.13,.24,'gunmetal',{rx:-.55})]),
    Pt(.55,.56,-.3,.26,.2,.22,'gunmetal'),Pt(.55,.56,-.42,.2,.15,.02,'lgLamp'),Pt(-.62,1.25,.6,.025,1.9,.025,'blk'),Pt(-.48,1.05,.66,.025,1.5,.025,'blk'),Pt(0,.62,-.36,.08,.5,.08,'gunmetal')],grip:[0,0,0],muzzle:[0,0,0]},
  // the rear ramp: hinged at its foot (the pivot), up when shut
  lgRamp:{parts:[Pt(0,.72,.03,2.06,1.42,.08,'lgODd'),Pt(0,.72,-.02,1.9,1.3,.02,'blk2'),Pt(0,1.35,.08,2.06,.06,.08,'lgSnow')],grip:[0,0,0],muzzle:[0,0,0]},
  // a spike strip lying across a road (along x; turned for the crossing)
  lgSpike:{parts:lgSpike(),grip:[0,0,0],muzzle:[0,0,0]},
  // the shield trooper's ballistic shield, its viewport, the grips behind; LEGATUS's radio pack (and its whip aerial); the rally flare
  lgShieldP:{parts:[Pt(0,0,0,.62,1.15,.06,'lgShield',{r:.03}),Pt(0,.36,-.034,.32,.1,.01,'lgVisor'),Pt(0,-.1,-.034,.4,.05,.005,'white'),Pt(-.12,0,.05,.04,.3,.06,'blk2'),Pt(.12,0,.05,.04,.3,.06,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  lgRadioP:{parts:[Pt(0,0,0,.34,.42,.18,'lgRadio',{r:.03}),Pt(.12,.5,.02,.016,.85,.016,'blk'),Pt(-.12,.25,.02,.03,.1,.03,'gunmetal'),Pt(-.17,.02,-.06,.06,.14,.05,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  lgFlare:{parts:[Pt(0,.14,0,.05,.28,.05,'red'),Pt(0,.3,0,.04,.04,.04,'lgLamp')],grip:[0,0,0],muzzle:[0,0,0]},
  lgC4:{parts:[Pt(0,0,0,.34,.22,.08,'olive'),Pt(0,.05,-.045,.12,.06,.01,'red'),Pt(.12,-.06,-.045,.05,.05,.01,'lgLamp'),Pt(-.1,.13,0,.012,.1,.012,'blk')],grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: the APC's diesel, its revving for a ram, air brakes, shells coming in, the ramp ----------
Object.assign(SFX,{
  lgeng:{n:2,dur:1.6,ch:2,peak:.8,gain:.7,rev:.15,poly:2,fn:B=>{const out=B.g(.9);
    {const e=B.env(0,.15,1,.5,out,1);const g=B.g(1,B.f('lowpass',220,.8,e));B.osc('sawtooth',38,41,0,1.6,g);B.osc('square',57,61,0,1.6,B.g(.35,g));B.am(g,0,1.6,26,.55)}
    for(const s of [-1,1]){const e=B.env(0,.2,.5,.6,B.pan(s*.4,out),1);B.nz('brown',0,1.6,B.f('lowpass',300,.7,e))}}},
  lgrev:{n:1,dur:1.6,ch:2,peak:.85,gain:.8,rev:.18,poly:2,fn:B=>{const out=B.g(.9);
    {const e=B.env(0,.08,1,.7,out,.9);const g=B.g(1,B.f('lowpass',520,.9,e));B.osc('sawtooth',42,96,0,1.5,g);B.osc('sawtooth',63,140,0,1.5,B.g(.4,g));B.am(g,0,1.5,34,.5)}
    {const e=B.env(.1,.2,.4,.8,out);B.nz('brown',.1,1.4,B.f('bandpass',380,.8,e))}}},
  lgbrake:{n:2,dur:1.1,ch:2,peak:.8,gain:.62,rev:.2,poly:2,fn:B=>{const out=B.g(.9);
    {const e=B.env(0,.01,.8,.5,out);B.nz('white',0,.7,B.f('bandpass',2600,1.2,e))}{const e=B.env(.02,.05,.45,.6,out);B.osc('sawtooth',1100,700,.02,.8,B.f('bandpass',1500,4,e))}}},
  lgshell:{n:2,dur:1.3,ch:2,peak:.8,gain:.62,rev:.25,poly:4,fn:B=>{const out=B.g(.9);{const e=B.env(0,.2,.7,.25,out,.9);B.osc('sine',1900,520,0,1.25,e)}{const e=B.env(.3,.4,.25,.4,out);B.nz('pink',.3,.9,B.f('bandpass',900,2,e))}}},
  lgramp:{n:1,dur:1.2,ch:2,peak:.8,gain:.7,rev:.2,poly:1,fn:B=>{const out=B.g(.9);{const e=B.env(0,.05,.7,.7,out,.6);B.osc('sawtooth',90,60,0,1,B.f('lowpass',500,.8,e))}{const e=B.env(.9,.002,1,.25,out);B.osc('sine',70,40,.9,.3,e);B.nz('brown',.9,.25,B.f('lowpass',500,.8,e))}}}});
SFX_ORDER.push('lgeng','lgrev','lgbrake','lgshell','lgramp');

// ---------- TESTUDO: the command APC (every page draws it; the host drives it) ----------
// x, z, yaw: its pose on the road (y 0); v: its speed (negative backing up); ty: the turret's yaw in the world; ramp 0 shut .. 1 down;
// eng: how badly the engine burns (0..1); flats: tyres burst; wreck: burnt out where it stopped (axis-aligned; its boxes block the
// world then). The host's brain (LEGATUS.p1) sets the path and the mode; APC.drive / coast set the speed, APC.move moves it.
const APC={on:false,vis:false,wreck:false,x:0,z:0,yaw:0,v:0,ty:0,gy:0,ramp:0,rampTo:0,eng:0,fire:0,flats:0,path:null,pi:0,rev:false,spd:1,revMax:3.2,
  g:null,mat:null,hull:null,tur:null,rampM:null,wh:[],wa:0,lamp:null,fireL:null,beam:null,beamMat:null,beamL:null,boxes:[],tgt:null,engT:0,prT:0,cv:0,
  // ---------- the meshes (built once per match) ----------
  build(){if(this.g)return;const mat=this.mat=matGun(),g=this.g=new THREE.Group();g.visible=false;R.scene.add(g);
    const mk=(id,parent,x,y,z)=>{const m=new THREE.Mesh(gunGeo(id),mat);m.frustumCulled=false;const q=new THREE.Group();q.position.set(x||0,y||0,z||0);q.add(m);parent.add(q);return q};
    this.hull=mk('lgHull',g);this.tur=mk('lgTurret',g,0,2.05,.2);this.rampM=mk('lgRamp',g,0,.55,3.38);
    this.wh=[];for(const aw of APC_AX)for(const sd of [-1,1]){const q=mk('lgWheel',g,sd*1.3,.58,-aw);q.children[0].rotation.y=sd<0?Math.PI:0;this.wh.push(q)}
    // the searchlight's beam (a soft cone toward what the gun is aimed at)
    const cg=new THREE.CylinderGeometry(.06,1,1,16,1,true);cg.rotateX(-Math.PI/2);cg.translate(0,0,.5);const p=cg.attributes.position,col=new Float32Array(p.count*3);for(let i=0;i<p.count;i++){const k=1-.9*p.getZ(i);col[i*3]=col[i*3+1]=col[i*3+2]=k}
    cg.setAttribute('color',new THREE.BufferAttribute(col,3));this.beamMat=new THREE.MeshBasicMaterial({color:0xfff2d8,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
    this.beam=new THREE.Mesh(cg,this.beamMat);this.beam.frustumCulled=false;this.beam.renderOrder=2;this.beam.visible=false;R.scene.add(this.beam)},
  lights(on){if(on&&!this.lamp){this.lamp=DL.add(0,1.5,0,'#fff2d0',16,0,0);this.beamL=DL.add(0,1,0,'#fff0d8',9,0,0)}
    if(!on){for(const k of ['lamp','beamL','fireL'])if(this[k]){this[k].dead=true;this[k]=null}}},
  show(on){this.vis=!!on;if(this.g)this.g.visible=this.vis;if(this.beam&&!on)this.beam.visible=false;if(!on)this.lights(false)},
  // a fresh TESTUDO at a pose (host and clients alike)
  place(x,z,yaw){this.build();Object.assign(this,{on:true,wreck:false,x,z,yaw,v:0,ty:yaw,ramp:0,rampTo:0,eng:0,fire:0,flats:0,path:null,pi:0,rev:false,spd:1,revMax:3.2,cv:0,tgt:null});
    this.unwreck();this.tint(false);this.show(true);this.prT=0},
  hide(){this.on=false;this.wreck=false;this.path=null;this.v=0;this.tgt=null;this.unwreck();this.show(false)},
  clear(){this.hide();if(this.g){R.scene.remove(this.g);this.g=null}if(this.beam){R.scene.remove(this.beam);this.beam.geometry.dispose();this.beamMat.dispose();this.beam=null}if(this.mat){this.mat.dispose();this.mat=null}},
  tint(burnt){if(!this.mat)return;const T=this.mat.uniforms.uTint.value;if(burnt)T.set(.05,.04,.035,.72);else T.set(0,0,0,0)},
  fwd(){return [-Math.sin(this.yaw),-Math.cos(this.yaw)]},
  // a point in TESTUDO's frame (u right, w forward) to the world, and back
  toW(u,w){const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw);return [this.x+u*cy-w*sy,this.z-u*sy-w*cy]},
  toL(x,z){const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),px=x-this.x,pz=z-this.z;return [px*cy-pz*sy,-px*sy-pz*cy]},
  hatch(){return this.toW(0,-.2)},
  solid(){return this.on&&this.vis&&!this.wreck},
  // ---------- hits: its hull's boxes in its own frame (u, y, w); the gun shield turns with the turret round the hatch ----------
  BX:[[-1.1,.55,-3.4,1.1,1.21,3.4],[-1.45,1.21,-3.4,1.45,2.05,2.4],[-1.45,1.21,2.4,1.45,1.66,3.4],[-1.62,.15,3.4,1.62,1.28,3.92],[-.85,2.05,-1,.85,2.4,.6]],
  SH:[-.66,2.4,.5,.66,3.03,.7],// the gun shield in the turret's frame (forward from the hatch)
  // the turret's frame: from TESTUDO's (u, w) about the hatch (0, -0.2), turned by the turret's yaw against the hull's
  toT(u,w){const r=wrapA(this.ty-this.yaw),c=Math.cos(r),s=Math.sin(r),pw=w+.2;return [u*c-pw*s,u*s+pw*c]},
  ray(ox,oy,oz,dx,dy,dz,tmax){if(!this.solid())return null;
    // (a quick reject first: the ray's closest approach to its middle)
    const qx=this.x-ox,qz=this.z-oz,hl=dx*dx+dz*dz;if(hl>1e-8){const tc=(qx*dx+qz*dz)/hl;if(tc<-6||tc>tmax+6)return null;const mx=ox+dx*tc-this.x,mz=oz+dz*tc-this.z;if(mx*mx+mz*mz>30)return null}
    const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),px=ox-this.x,pz=oz-this.z;
    const ou=px*cy-pz*sy,ow=-px*sy-pz*cy,du=dx*cy-dz*sy,dw=-dx*sy-dz*cy,oy0=oy-this.gy;let bt=tmax,hit=false;
    for(const b of this.BX){const t=rayAABB(ou,oy0,ow,du,dy,dw,b[0],b[1],b[2],b[3],b[4],b[5],bt);if(t>=0&&t<bt){bt=t;hit=true}}
    for(const aw of APC_AX)for(const sd of [-1,1]){const u0=sd<0?-1.52:1.06,u1=sd<0?-1.06:1.52,t=rayAABB(ou,oy0,ow,du,dy,dw,u0,0,aw-.58,u1,1.16,aw+.58,bt);if(t>=0&&t<bt){bt=t;hit=true}}
    {const [tu,tw]=this.toT(ou,ow),[tdu,tdw]=this.toT2(du,dw),S=this.SH,t=rayAABB(tu,oy0,tw,tdu,dy,tdw,S[0],S[1],S[2],S[3],S[4],S[5],bt);if(t>=0&&t<bt){bt=t;hit=true}}
    return hit?{t:bt,part:'ball'}:null},
  // (a direction into the turret's frame: the turn only)
  toT2(u,w){const r=wrapA(this.ty-this.yaw),c=Math.cos(r),s=Math.sin(r);return [u*c-w*s,u*s+w*c]},
  // which part a hit point (on its surface) belongs to
  partAt(x,y,z){const [u,w]=this.toL(x,z),h=y-this.gy;if(Math.abs(u)>1.8||w>4.15||w<-3.8||h>3.6||h<-.2)return null;
    {const [tu,tw]=this.toT(u,w),S=this.SH;if(tu>S[0]-.06&&tu<S[3]+.06&&tw>S[2]-.1&&tw<S[5]+.08&&h>S[1]-.04)return 'shield'}
    if(w>3.36)return 'blade';
    if(Math.abs(u)>1.04&&h<1.22){for(const aw of APC_AX)if(Math.abs(w-aw)<.62)return 'wheel'}
    if(w<-1.42&&h>1.86||w<-3.22&&h>1.5)return 'engine';if(w<-3.22&&this.ramp>.5)return 'inside';return 'hull'},
  // ---------- pushing people out of its way (each page its own player; the host its bots and the zombies) ----------
  push(a){if(!this.solid()||!a.alive||a.lgRide||a.kin)return;const c=a.c;if(c.y>this.gy+2.25)return;const hw=(c.hw||.3);
    const [u,w]=this.toL(c.x,c.z),U=1.62+hw,F=3.92+hw,Bk=3.42+hw;if(Math.abs(u)>=U||w>=F||w<=-Bk)return;
    const pu=U-Math.abs(u),pf=F-w,pb=w+Bk;let du=0,dw=0;if(pu<=pf&&pu<=pb)du=(u>=0?1:-1)*(pu+.01);else if(pf<pb)dw=pf+.01;else dw=-(pb+.01);
    const cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),mx=du*cy-dw*sy,mz=-du*sy-dw*cy;
    if(charFits(c,c.x+mx,c.y,c.z+mz)){c.x+=mx;c.z+=mz}
    // (against a wall: out the other side instead)
    else if(du){const ox=-(2*U-Math.abs(du))*Math.sign(du),nx=ox*cy,nz=-ox*sy;if(charFits(c,c.x+nx,c.y,c.z+nz)){c.x+=nx;c.z+=nz}}
    // whoever is in front of it when it moves is carried along
    if(dw>0&&this.v>.4){const [fx,fz]=this.fwd();a.kvx=fx*this.v;a.kvz=fz*this.v}else if(dw<0&&this.v<-.4){const [fx,fz]=this.fwd();a.kvx=fx*this.v;a.kvz=fz*this.v}},
  // ---------- the host's driving: a path of [x, z, top speed] points, followed with the corners already rounded ----------
  pathOf(pts,v){const out=[[pts[0][0],pts[0][1],v]],R0=4.5;
    for(let i=1;i<pts.length-1;i++){const p=pts[i-1],q=pts[i],n=pts[i+1];let ax=q[0]-p[0],az=q[1]-p[1],bx=n[0]-q[0],bz=n[1]-q[1];const la=Math.hypot(ax,az),lb=Math.hypot(bx,bz);if(la<.05||lb<.05)continue;
      ax/=la;az/=la;bx/=lb;bz/=lb;const th=Math.acos(clamp(ax*bx+az*bz,-1,1));if(th<.05){out.push([q[0],q[1],v]);continue}
      const r=Math.min(R0,la*.45/Math.tan(th/2),lb*.45/Math.tan(th/2)),t=r*Math.tan(th/2),sx=q[0]-ax*t,sz=q[1]-az*t,ex=q[0]+bx*t,ez=q[1]+bz*t;
      const cr=ax*bz-az*bx>0?1:-1,cx=sx-az*cr*r,cz=sz+ax*cr*r,a0=Math.atan2(sz-cz,sx-cx),da=wrapA(Math.atan2(ez-cz,ex-cx)-a0);
      const va=Math.min(v,Math.sqrt(3*r)+.5),N=Math.max(2,Math.ceil(Math.abs(da)*r/1.1));for(let k=0;k<=N;k++){const g=a0+da*k/N;out.push([cx+Math.cos(g)*r,cz+Math.sin(g)*r,va])}}
    const L=pts[pts.length-1];out.push([L[0],L[1],0]);return out},
  go(pts,v,rev){this.path=this.pathOf(pts,v);this.pi=0;this.rev=!!rev},
  stop(){this.path=null},
  // one step along the path (host): the speed and the heading (move() then moves it)
  drive(dt){const P=this.path;if(!P){this.v=approach(this.v,0,9*dt);return}
    // past points left behind
    while(this.pi<P.length-1){const p=P[this.pi],q=P[this.pi+1],sx=q[0]-p[0],sz=q[1]-p[1],l2=sx*sx+sz*sz||1,t=((this.x-p[0])*sx+(this.z-p[1])*sz)/l2;if(t>=1)this.pi++;else break}
    const last=P[P.length-1],dEnd=Math.hypot(last[0]-this.x,last[1]-this.z);
    if(this.pi>=P.length-1||dEnd<.6&&Math.abs(this.v)<1.2){this.path=null;this.v=approach(this.v,0,9*dt);return}
    if(this.rev){// backing up a straight: no steering, the line held by a small sideways nudge
      const tv=-Math.min(this.revMax*this.spd,Math.sqrt(2*4*Math.max(0,dEnd-.3)));this.v=approach(this.v,tv,(this.v>tv?3:6)*dt);
      const p=P[this.pi],q=P[Math.min(P.length-1,this.pi+1)],sx=q[0]-p[0],sz=q[1]-p[1],l=Math.hypot(sx,sz)||1,nx=-sz/l,nz=sx/l,off=(this.x-p[0])*nx+(this.z-p[1])*nz;this.x-=nx*off*Math.min(1,dt*2);this.z-=nz*off*Math.min(1,dt*2);return}
    // the point a little way ahead along the path, and the speed the path allows from here
    const L=2.6+Math.abs(this.v)*.35;let rem=L,lx,lz,vmax=1e9,acc=0,px,pz;
    {const p=P[this.pi],q=P[this.pi+1],sx=q[0]-p[0],sz=q[1]-p[1],l=Math.hypot(sx,sz)||1,t=clamp(((this.x-p[0])*sx+(this.z-p[1])*sz)/(l*l),0,1);px=lx=p[0]+sx*t;pz=lz=p[1]+sz*t}
    for(let i=this.pi+1;i<P.length;i++){const q=P[i],sl=Math.hypot(q[0]-px,q[1]-pz);
      if(rem>0){if(sl>=rem){lx=px+(q[0]-px)/sl*rem;lz=pz+(q[1]-pz)/sl*rem;rem=0}else{rem-=sl;lx=q[0];lz=q[1]}}
      acc+=sl;vmax=Math.min(vmax,Math.sqrt(q[2]*q[2]+2*5.5*Math.max(0,acc-.3)));px=q[0];pz=q[1];if(acc>40)break}
    // (it creeps the last metres in rather than stopping short)
    const top=Math.max(Math.min(vmax,P[this.pi][2]||vmax)*this.spd,dEnd>.4?.9:0),want=lgYaw(lx-this.x,lz-this.z),dy=lgAng(this.yaw,want),rate=Math.abs(this.v)/3.9+.12;
    this.yaw=wrapA(this.yaw+clamp(dy,-rate*dt,rate*dt));const tv=Math.abs(dy)>1.3?Math.min(top,1.2):top;this.v=approach(this.v,tv,(this.v<tv?3.4:6.5)*dt)},
  // straight ahead at its own speed (rams, braking: no path)
  coast(dt,tv,a){this.v=approach(this.v,tv,a*dt)},
  move(dt){const [fx,fz]=this.fwd();this.x+=fx*this.v*dt;this.z+=fz*this.v*dt;this.wa+=this.v*dt/.58},
  // ---------- the road (MAP.ez.road): which lane it is on, plans along it ----------
  edgeAt(x,z){const R=MAP.ez.road;let best=-1,bd=1e9,bt=0;for(let e=0;e<R.e.length;e++){const a=R.n[R.e[e][0]],b=R.n[R.e[e][1]],sx=b[0]-a[0],sz=b[1]-a[1],l2=sx*sx+sz*sz,t=clamp(((x-a[0])*sx+(z-a[1])*sz)/l2,0,1),d=Math.hypot(a[0]+sx*t-x,a[1]+sz*t-z);if(d<bd){bd=d;best=e;bt=t}}return {e:best,t:bt,d:bd}},
  // the directed lane it drives (edge e, from node a to node b)
  dirNow(){const R=MAP.ez.road,E=this.edgeAt(this.x,this.z),ed=R.e[E.e],a=R.n[ed[0]],b=R.n[ed[1]],[fx,fz]=this.fwd(),f=(b[0]-a[0])*fx+(b[1]-a[1])*fz>=0;return {e:E.e,t:E.t,a:f?ed[0]:ed[1],b:f?ed[1]:ed[0],tAB:f?E.t:1-E.t,off:E.d}},
  // the road's points it can stop at: each lane at a fifth, half and four fifths of its length
  spots(){if(this.spL)return this.spL;const R=MAP.ez.road,L=[];for(let e=0;e<R.e.length;e++){const a=R.n[R.e[e][0]],b=R.n[R.e[e][1]];for(const t of [.2,.5,.8])L.push({e,t,x:lerp(a[0],b[0],t),z:lerp(a[1],b[1],t)})}return this.spL=L},
  // the shortest way there that never turns round in a lane: the nodes to pass, and its length (or the short way back: rev)
  plan(sp){const R=MAP.ez.road,D=this.dirNow(),N=R.n,len=(i,j)=>Math.hypot(N[j][0]-N[i][0],N[j][1]-N[i][1]);
    const ed=R.e[sp.e];if(sp.e===D.e){const tS=D.a===ed[0]?sp.t:1-sp.t,ahead=(tS-D.tAB)*len(D.a,D.b);if(ahead>.5)return {pts:[[this.x,this.z],[sp.x,sp.z]],L:ahead,rev:false};if(ahead>-20&&ahead<-.5)return {pts:[[this.x,this.z],[sp.x,sp.z]],L:-ahead,rev:true}}
    // Dijkstra over directed lanes [from, to] (no U-turn at a node)
    const dl=[];for(const [i,j] of R.e){dl.push([i,j]);dl.push([j,i])}const dist=dl.map(()=>1e9),prev=dl.map(()=>-1),done=dl.map(()=>false);
    const rem=(1-D.tAB)*len(D.a,D.b);for(let k=0;k<dl.length;k++)if(dl[k][0]===D.b&&dl[k][1]!==D.a){dist[k]=rem;prev[k]=-2}
    for(;;){let k=-1,bd=1e9;for(let q=0;q<dl.length;q++)if(!done[q]&&dist[q]<bd){bd=dist[q];k=q}if(k<0)break;done[k]=true;const [i,j]=dl[k],l=len(i,j);
      for(let q=0;q<dl.length;q++)if(dl[q][0]===j&&dl[q][1]!==i&&dist[k]+l<dist[q]){dist[q]=dist[k]+l;prev[q]=k}}
    let bk=-1,bc=1e9;for(let k=0;k<dl.length;k++){const [i,j]=dl[k];let tt;if(i===ed[0]&&j===ed[1])tt=sp.t;else if(i===ed[1]&&j===ed[0])tt=1-sp.t;else continue;if(dist[k]>=1e9)continue;const c=dist[k]+tt*len(i,j);if(c<bc){bc=c;bk=k}}
    if(bk<0)return null;const nodes=[];for(let k=bk;k>=0;k=prev[k])nodes.unshift(dl[k][0]);
    return {pts:[[this.x,this.z]].concat(nodes.map(n=>[N[n][0],N[n][1]]),[[sp.x,sp.z]]),L:bc,rev:false}},
  // ---------- the wreck: boxes added to the world where it burnt out (cover; it blocks shots and sight) ----------
  wreckAt(x,z,yaw){this.build();this.on=true;this.wreck=true;this.x=x;this.z=z;this.yaw=yaw;this.ty=yaw;this.v=0;this.path=null;this.ramp=this.rampTo=0;this.eng=1;this.fire=1;this.tgt=null;this.show(true);this.tint(true);this.unwreck();
    const al=Math.abs(Math.sin(yaw))>.7,hx=al?3.45:1.45,hz=al?1.45:3.45,W=WORLD,cs=W.cell;
    const add=(x0,y0,z0,x1,y1,z1)=>{const b={x0,y0,z0,x1,y1,z1,mat:'metal',o:{lgWreck:1},id:W.boxes.length,mark:0};W.boxes.push(b);
      const cx0=Math.max(0,Math.floor((x0-W.gx0)/cs)),cx1=Math.min(W.gw-1,Math.floor((x1-W.gx0)/cs)),cz0=Math.max(0,Math.floor((z0-W.gz0)/cs)),cz1=Math.min(W.gh-1,Math.floor((z1-W.gz0)/cs));
      for(let gz=cz0;gz<=cz1;gz++)for(let gx=cx0;gx<=cx1;gx++)W.cells[gz*W.gw+gx].push(b);this.boxes.push(b)};
    add(x-hx,0,z-hz,x+hx,2.05,z+hz);const [tx,tz]=this.toW(0,-.2);add(tx-.85,2.05,tz-.85,tx+.85,2.4,tz+.85)},
  unwreck(){const W=WORLD;if(!this.boxes.length)return;for(const b of this.boxes){const i=W.boxes.indexOf(b);if(i>=0)W.boxes.splice(i,1);
      const cs=W.cell,cx0=Math.max(0,Math.floor((b.x0-W.gx0)/cs)),cx1=Math.min(W.gw-1,Math.floor((b.x1-W.gx0)/cs)),cz0=Math.max(0,Math.floor((b.z0-W.gz0)/cs)),cz1=Math.min(W.gh-1,Math.floor((b.z1-W.gz0)/cs));
      for(let gz=cz0;gz<=cz1;gz++)for(let gx=cx0;gx<=cx1;gx++){const cell=W.cells[gz*W.gw+gx],j=cell.indexOf(b);if(j>=0)cell.splice(j,1)}}
    this.boxes=[];for(let i=0;i<W.boxes.length;i++)W.boxes[i].id=i},
  // the wheels' contact points (spike strips)
  wheelPts(){const out=[];for(const aw of APC_AX)for(const sd of [-1,1])out.push(this.toW(sd*1.3,aw));return out},
  // ---------- every frame (every page): the meshes, lamps, smoke, fire, the diesel ----------
  update(dt){if(!this.on||!this.g)return;
    if(NET.cli&&!this.wreck){// the snapshot's pose, carried on at its speed between snapshots and eased into
      const f=EP.bf;if(f&&f.ap){const k=Math.min(1,dt*9),fx=-Math.sin(f.ap[2]),fz=-Math.cos(f.ap[2]),age=Math.min(.25,(performance.now()-(f.rt||0))/1000);
        const px=f.ap[0]+fx*f.ap[4]*age,pz=f.ap[1]+fz*f.ap[4]*age,ox=this.x,oz=this.z;this.x+=(px-this.x)*k;this.z+=(pz-this.z)*k;this.yaw=wrapA(this.yaw+lgAng(this.yaw,f.ap[2])*k);this.ty=wrapA(this.ty+lgAng(this.ty,f.ap[3])*Math.min(1,dt*12));
        this.v=f.ap[4];this.ramp=approach(this.ramp,f.ap[5],dt*2.4);this.eng=f.ap[6];this.flats=f.ap[7];this.wa+=Math.hypot(this.x-ox,this.z-oz)*Math.sign(this.v||1)/.58}}
    else if(!this.wreck)this.ramp=approach(this.ramp,this.rampTo,dt*1.6);
    const g=this.g;g.position.set(this.x,this.gy,this.z);g.rotation.y=this.yaw;this.tur.rotation.y=wrapA(this.ty-this.yaw);this.rampM.rotation.x=this.ramp*1.95;
    // the hull rocks a little on the move and dips when it brakes
    const bob=this.wreck?0:Math.sin(G.t*9)*.012*Math.min(1,Math.abs(this.v)/3);this.hull.position.y=bob;this.hull.rotation.x=this.wreck?0:clamp((this.cv-this.v)/Math.max(dt,1e-3)*.006,-.05,.05);this.cv=this.v;
    for(const q of this.wh)q.children[0].rotation.x=-this.wa*(q.position.x<0?-1:1);
    this.prT-=dt;if(this.prT<=0){this.prT=.35;sampleProbe(this.x,1.4,this.z,this.mat.uniforms.uProbe.value)}
    // lamps, the searchlight on the gun's mark, exhaust and the engine's smoke, fire on the wreck
    const [fx,fz]=this.fwd(),live=!this.wreck;this.lights(this.vis);
    if(this.lamp){this.lamp.x=this.x+fx*5;this.lamp.z=this.z+fz*5;this.lamp.y=1.2;this.lamp.i=live?1.6:0}
    const tg=live?this.tgt:null;let bOn=false;
    if(tg&&tg.alive&&this.vis){const [hx,hz]=this.hatch(),ct=Math.cos(this.ty),st=Math.sin(this.ty),sx=hx+.55*ct-.42*st,sz=hz-.55*st-.42*ct,sy=2.61;
      const ex=tg.c.x,ey=tg.c.y+.4,ez=tg.c.z,L=Math.hypot(ex-sx,ey-sy,ez-sz);if(L>1&&L<70){bOn=true;this.beam.position.set(sx,sy,sz);this.beam.lookAt(ex,ey,ez);const r=Math.max(.5,L*.13);this.beam.scale.set(r,r,L);this.beamMat.opacity=.09;
        if(this.beamL){this.beamL.x=ex;this.beamL.y=ey+1.2;this.beamL.z=ez;this.beamL.i=2}}}
    if(this.beam)this.beam.visible=bOn;if(!bOn&&this.beamL)this.beamL.i=0;
    if(!this.vis)return;
    {const [ex,ez]=this.toW(1.18,-1.6);if(live&&Math.random()<dt*(Math.abs(this.v)>1?14:5))FX.spawn({x:ex,y:2.6,z:ez,vx:rr(-.2,.2),vy:rr(.8,1.6),vz:rr(-.2,.2),life:rr(.6,1.1),s0:.12,s1:.5,r:.18,g:.18,b:.18,a:.45,f:2,drag:1})}
    if(this.eng>.05||this.wreck){const [gx,gz]=this.toW(rr(-.8,.8),rr(-3,-1.6));if(Math.random()<dt*(6+this.eng*20))FX.spawn({x:gx,y:2.2,z:gz,vx:rr(-.3,.3),vy:rr(1,2.2),vz:rr(-.3,.3),life:rr(1,2),s0:.3,s1:1.4,r:.12,g:.11,b:.1,a:.5,f:2,drag:.8});
      if((this.eng>.55||this.wreck)&&Math.random()<dt*(this.wreck?26:14))FX.spawn({x:gx,y:2.15,z:gz,vx:rr(-.4,.4),vy:rr(1.2,2.6),vz:rr(-.4,.4),life:rr(.3,.6),s0:.35,s1:.08,r:1,g:.5,b:.15,a:.9,f:11,add:1});
      if(this.wreck||this.eng>.55){if(!this.fireL)this.fireL=DL.add(gx,2.8,gz,'#ff8a3a',10,1.4,0,{flick:.35});const [cx,cz]=this.toW(0,-2.4);this.fireL.x=cx;this.fireL.z=cz}}
    // snow thrown up by the wheels
    if(live&&Math.abs(this.v)>4&&Math.random()<dt*20){const P=this.wheelPts(),p=P[(Math.random()*P.length)|0];FX.spawn({x:p[0],y:.15,z:p[1],vx:rr(-1,1)-fx*this.v*.2,vy:rr(.6,1.8),vz:rr(-1,1)-fz*this.v*.2,life:rr(.4,.8),s0:.15,s1:.5,r:.85,g:.88,b:.92,a:.5,f:2,drag:1.6})}
    // the diesel: a rumble that rises with the speed
    if(live){this.engT-=dt;if(this.engT<=0){this.engT=1.25;AU.at('lgeng',this.x,1.2,this.z,{vol:.55+.25*Math.min(1,Math.abs(this.v)/8),range:70,rate:.85+.25*Math.min(1,Math.abs(this.v)/10)})}}}};

// ---------- the spike strips: a case by the road (hold E 3 s) lays a strip across it; TESTUDO driving over it bursts a tyre ----------
// st: 0 ready in its case, 1 across the road, 2 spent (cd, then back in the case)
const SPIKE={L:[],T:3,
  build(){if(this.L.length||!MAP.ez||!MAP.ez.spikes)return;MAP.ez.spikes.forEach((s,i)=>{const m=new THREE.Mesh(gunGeo('lgSpike'),matGun());const along=s.x1-s.x0>s.z1-s.z0;
    m.position.set((s.x0+s.x1)/2,0,(s.z0+s.z1)/2);m.rotation.y=along?0:Math.PI/2;m.visible=false;m.frustumCulled=false;R.scene.add(m);sampleProbe(m.position.x,.6,m.position.z,m.material.uniforms.uProbe.value);
    this.L.push({i,s,m,st:0,p:0,cd:0,k:0,along})})},
  near(F,h){return Math.hypot(h.c.x-F.s.bx,h.c.z-F.s.bz)<1.75&&Math.abs(h.c.y-.18)<1.6},
  set(i,st,cd,remote){const F=this.L[i];if(!F)return;const was=F.st;F.st=st;F.cd=cd||0;F.p=0;
    if(was!==st){const s=F.s;if(st===1)AU.at('trapset',(s.x0+s.x1)/2,.3,(s.z0+s.z1)/2,{vol:.9,range:40});else if(st===2)AU.at('imp_metal',(s.x0+s.x1)/2,.3,(s.z0+s.z1)/2,{vol:1,range:50,rate:.7})}
    if(NET.host&&!remote)netEv('elg',{k:'spk',i,s:st,cd:Math.ceil(cd||0)})},
  over(F){if(F.st!==1||!APC.solid()||Math.abs(APC.v)<.8)return false;const s=F.s;for(const p of APC.wheelPts())if(p[0]>s.x0-.25&&p[0]<s.x1+.25&&p[1]>s.z0-.25&&p[1]<s.z1+.25)return true;return false},
  // a ready case on the road TESTUDO is heading down (within 45 m ahead of it, near its line): the one to lay now (every page)
  hot(F){if(F.st!==0||!APC.solid()||APC.v<1)return false;const s=F.s,cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2,[u,w]=APC.toL(cx,cz);return w>4&&w<45&&Math.abs(u)<3.5},
  update(dt){for(const F of this.L){F.k=approach(F.k,F.st===1?1:0,dt*3);F.m.visible=F.k>.02&&EP.st===4;if(F.m.visible)F.m.scale.set(Math.max(.02,F.k),1,1);
      if(NET.cli)continue;if(F.st===2){F.cd-=dt;if(F.cd<=0)this.set(F.i,0,0)}}},
  pack(){const o=[];for(const F of this.L)o.push(F.st,Math.round(F.p*10),Math.ceil(F.cd));return o},
  unpack(a){if(!Array.isArray(a))return;for(let i=0;i<this.L.length;i++){const F=this.L[i],s=a[i*3];if(s==null)continue;if(s!==F.st)this.set(i,s,a[i*3+2],true);F.p=(a[i*3+1]||0)/10;F.cd=a[i*3+2]||0}},
  reset(){for(const F of this.L){F.st=0;F.p=0;F.cd=0;F.k=0;F.m.visible=false}},
  clear(){for(const F of this.L){R.scene.remove(F.m);F.m.material.dispose()}this.L=[]}};

// ---------- the north island's fuel bowser: shot enough it goes up, and hurts whatever stands by it ----------
const FUEL={hp:380,gone:false,fT:0,L:null,
  reset(){this.hp=380;this.gone=false;if(this.L){this.L.dead=true;this.L=null}},
  hit(d){if(this.gone||NET.cli)return;this.hp-=d;if(this.hp<=0)this.boom()},
  // (burnt out already, without the blast: a page that joins late)
  burnt(){if(this.gone)return;this.gone=true;const F=MAP.ez.fuel;if(F&&!this.L)this.L=DL.add(F.x,F.y+1.6,F.z,'#ff8a3a',12,1.6,0,{flick:.4})},
  boom(remote){if(this.gone)return;this.gone=true;const F=MAP.ez.fuel;if(!F)return;const x=F.x,y=F.y,z=F.z;
    FX.explode(x,y,z,'he');FX.explode(x+1.5,y+.5,z,'he');AU.at('explode',x,y,z,{vol:1,range:120,occ:false,rate:.75});DL.add(x,y+2,z,'#ff8a3a',22,4,.6);
    for(let i=0;i<40;i++)FX.spawn({x:x+rr(-3,3),y:y+rr(0,1.5),z:z+rr(-1,1),vx:rr(-5,5),vy:rr(2,8),vz:rr(-5,5),life:rr(.6,1.4),s0:.5,s1:.1,r:1,g:.6,b:.2,a:.9,f:11,add:1,grav:4});
    const P=G.player;if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<18){FX.shake=Math.max(FX.shake,1-d/20);AU.shock(.9-d/24)}}
    if(!this.L)this.L=DL.add(x,y+1.6,z,'#ff8a3a',12,1.6,0,{flick:.4});
    if(NET.cli||remote)return;netEv('elg',{k:'fuel'});EP.say('lFuel');
    for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>7||Math.abs(h.c.y-y)>3)continue;const f=1-d/7;hurtHuman(h,EPD(60*f+10),null,{});SCEN.pushHuman(h,(h.c.x-x)/(d||1)*8*f,4,(h.c.z-z)/(d||1)*8*f);if(f>.4)epFx(h,'kd',1.2)}
    for(const zz of SCEN.Z){if(!zz.alive||zz.boss)continue;const d=Math.hypot(zz.c.x-x,zz.c.z-z);if(d<6.5)damageActor(zz,2400*(1-d/7),null,{he:1,dir:[0,1,0]})}
    const b=EP.bossA();if(b&&b.lg){const bx=b.lgRide?APC.x:b.c.x,bz=b.lgRide?APC.z:b.c.z,d=Math.hypot(bx-x,bz-z);if(d<7.5)LEGATUS.fuelHit(b,1-d/7.5)}},
  update(dt){if(!this.gone||!MAP.ez||!MAP.ez.fuel)return;const F=MAP.ez.fuel;this.fT-=dt;if(this.fT>0)return;this.fT=.05;
    FX.spawn({x:F.x+rr(-3.4,3.4),y:F.y+rr(.5,1.4),z:F.z+rr(-1,1),vx:rr(-.3,.3),vy:rr(1,2.4),vz:rr(-.3,.3),life:rr(.4,.8),s0:.5,s1:.1,r:1,g:.5,b:.15,a:.9,f:11,add:1});
    if(Math.random()<.4)FX.spawn({x:F.x+rr(-2,2),y:F.y+2,z:F.z,vx:rr(-.3,.3),vy:rr(1,2),vz:rr(-.3,.3),life:rr(2,3.4),s0:.6,s1:2.4,r:.1,g:.1,b:.1,a:.45,f:2,drag:.6})}};

// ---------- the barricade's charges (stage 2): a prop where each one went, its lamp blinking; the blast ----------
const C4={L:[],
  set(i){const v=MAP.ez.c4&&MAP.ez.c4[i];if(!v||this.L[i])return;const m=new THREE.Mesh(gunGeo('lgC4'),matGun());m.position.set(v.x,1.2,v.z-.62);R.scene.add(m);sampleProbe(v.x,1.2,v.z,m.material.uniforms.uProbe.value);this.L[i]={m,v,t:0};AU.at('pin',v.x,1.2,v.z,{vol:.7,range:30})},
  update(dt){for(const C of this.L){if(!C)continue;C.t+=dt;if(C.t%.8<dt)FX.spawn({x:C.m.position.x+.12,y:C.m.position.y-.06,z:C.m.position.z-.06,life:.25,s0:.12,s1:.04,r:1,g:.15,b:.1,a:1,f:1,add:1})}},
  blast(){const v=MAP.ez.c4||[];for(const p of v){FX.explode(p.x,1.4,p.z-.8,'he');for(let i=0;i<24;i++)FX.spawn({x:p.x+rr(-2,2),y:rr(.5,3),z:p.z-rr(0,1),vx:rr(-6,6),vy:rr(2,9),vz:rr(-8,2),life:rr(.6,1.4),s0:.12,s1:.06,r:.4,g:.38,b:.34,f:7,grav:9})}
    AU.at('explode',0,2,4,{vol:1,range:160,occ:false,rate:.7});AU.at('explode',0,2,4,{vol:.9,range:160,occ:false,rate:.95,delay:.12});DL.add(0,3,3,'#ffb070',30,4,.5);
    const P=G.player;if(P&&P.alive){const d=Math.hypot(P.c.x,P.c.z-4);if(d<40){FX.shake=Math.max(FX.shake,1-d/44);AU.shock(.9-d/50)}}this.clear()},
  clear(){for(const C of this.L)if(C){R.scene.remove(C.m);C.m.material.dispose()}this.L=[]}};

// ---------- the target LEGATUS marks (phase 2 and 3): a red light on them, every zombie goes for them (ai.js: h.epMark) ----------
const LGMARK={h:null,until:0,L:null,
  set(h,t,remote){this.clear();if(!h||!h.alive)return;this.h=h;this.until=G.t+t;h.epMark=this.until;this.L=DL.add(h.c.x,h.c.y+2,h.c.z,'#ff2a14',7,1.6,0);
    if(h===G.player){HUD.announce(LI()?'YOU ARE MARKED':'표적 지정됨 — 좀비가 몰려온다','z',2.4);AU.play('beep2',{vol:.8,rate:.7})}
    if(!NET.cli&&!remote){for(const z of SCEN.Z)if(z.alive&&z.bot&&Math.hypot(z.c.x-h.c.x,z.c.z-h.c.z)<40)z.bot.tgtT=0;if(NET.host)netEv('elg',{k:'mark',i:h.id,t:r2(t)})}},
  update(dt){const h=this.h;if(!h)return;if(G.t>this.until||!h.alive){this.clear();return}if(this.L){this.L.x=h.c.x;this.L.y=h.c.y+2.2;this.L.z=h.c.z;this.L.i=1.2+.6*Math.sin(G.t*9)}
    if(Math.random()<dt*14)FX.spawn({x:h.c.x+rr(-.25,.25),y:h.c.y+rr(1.6,2.4),z:h.c.z+rr(-.25,.25),vy:rr(.4,1),life:rr(.4,.8),s0:.12,s1:.04,r:1,g:.12,b:.06,a:1,f:1,add:1})},
  clear(){if(this.h)this.h.epMark=0;this.h=null;if(this.L){this.L.dead=true;this.L=null}}};

// ---------- LEGATUS ----------
const _lgV=new THREE.Vector3();
const LEGATUS={cur:null,H:null,fallen:[],said:{},encNext:false,duty:null,dutyT:0,g2T:0,
  zc:'legatus',name:['레가투스','LEGATUS'],code:'RT1-01',ticks:[70,30],g2:['엔진','ENGINE'],darkPh:0,
  wake:['레가투스가 출격하기까지','LEGATUS moves out in'],goText:['테스투도가 움직인다','TESTUDO IS MOVING'],deadText:['레가투스 무력화','LEGATUS IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(15000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.lg&&a.lg.enc)},
  holds(){if(!this.H)this.H={rifle:holdFor('ar7'),gl:holdFor('gl40'),mg:holdFor('mg6'),nade:holdFor('smoke')};return this.H},
  fx(m){this.fxApply(m);if(NET.host)netEv('elg',m)},
  sayOnce(k){if(this.said[k])return;this.said[k]=1;EP.say(k)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: in TESTUDO's hatch on the far road (a replay of phase 2 or 3: on foot by the wreck)
  prepSpawn(kind,bp){let b=EP.bossA();const E=MAP.ez;if(!b)b=this.spawn([E.apc.x,LG_HY,E.apc.z],E.apc.yaw,false);else if(kind!=='phase')this.init(b,false);if(!b)return;
    if(kind==='phase')this.reset(b,bp);else{APC.place(E.apc.x,E.apc.z,E.apc.yaw);this.mount(b)}
    const S=b.lg;S.idle=true;b.lgPose=S.ride?'hatch':''},
  go(b){const S=b.lg;if(!S)return;S.idle=false;S.pt=1;S.holdT=1.5;if(S.ride){S.cd.drop=14;S.cd.ram=6}},
  // the first meeting (stage 3): out of the checkpoint's gate, down the cleared lane; back through the gate when it is over
  meetStart(E){const C=MAP.ez.apcC,a=this.spawn([C.x,LG_HY,-70],C.yaw,true);if(!a)return;E.a=a;APC.place(C.x,-70,C.yaw);this.mount(a);const S=a.lg;S.idle=false;S.mode='enter';S.mt=S.mt0=10;S.cd.drop=16;S.cd.ram=8;
    EP.gateOpen('gC',true);EP.say('enc');EP.later(2.6,()=>EP.say('enc2'));EP.later(6,()=>EP.say('lMeet'))},
  meetTick(){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.lg)this.retreat(E.a)},
  // the boss slot of the pool comes back as LEGATUS
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='legatus';a.deadT=99;this.encNext=!!enc;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){const m=a.maxHp||1;
    a.lg={ph:1,mode:'',mt:0,mt0:1,pt:1,ride:false,enc:!!enc,idle:!enc,invT:0,enr:false,fightT:0,grog:0,grogN:0,grogMax:100,slowT:0,dmgW:0,dmgWT:0,
      cd:{ram:6,drop:14,smk:8,brst:0,gl:5,mk:9,ord:6,sh:12,rally:4,arty:10,chg:6},holdT:0,spot:null,spotT:0,atk:0,goT:0,n2:0,burstT:0,tg:null,lane:0,dropped:0,ordK:'',
      mg:{st:'',t:0,tg:null,sh:0,lost:0,pick:0},pack:m*.05,packMax:m*.05,rally:null,chg:null,ramL:0,ramD:0,ramHit:new Set(),dieQ:false,perch:-1,hopT:6};
    a.lgPose='';a.lgPitch=0;a.lgKick=0;a.lgAtk=0;a.epDown=0;a.kin=null;a.lgRide=false;a.epHide=false},
  mount(a){const S=a.lg;if(!S)return;S.ride=true;a.lgRide=true;a.kin=null;a.leapV=null;this.seat(a);a.lgPose='hatch'},
  // into the hatch: his feet LG_HY above the road, facing where the gun points
  seat(a){const [hx,hz]=APC.hatch(),c=a.c;c.x=hx;c.z=hz;c.y=APC.gy+LG_HY;const [fx,fz]=APC.fwd();c.vx=fx*APC.v;c.vz=fz*APC.v;c.vy=0;c.onGround=true;a.yaw=APC.ty;a.mvx=a.mvz=a.kvx=a.kvz=0},
  // a replay of the boss fight starts the phase it reached again, at that phase's health (the radio pack stays as it was)
  reset(a,ph){const pk=a.lg?a.lg.pack:null;a.hp=a.maxHp*LG_PH[ph-1];this.init(a,false);const S=a.lg;S.ph=ph;S.idle=true;if(pk!=null)S.pack=pk;a.frozen=0;a.kvx=a.kvz=0;
    const E=MAP.ez;if(ph===1){APC.place(E.apc.x,E.apc.z,E.apc.yaw);this.mount(a);return}
    if(!APC.wreck){const W=E.wreck;APC.wreckAt(W.x,W.z,W.yaw)}
    const sp=ph===3?E.perch[0]:null,n=sp?null:navSnap(APC.x+3.4,0,APC.z+4,6),p=sp?[sp.x,sp.y,sp.z]:n?[n.x,n.y,n.z]:[APC.x+3.4,0,APC.z];
    placeAt(a,p[0],p[1],p[2],0);if(sp)S.perch=0;a.lgPose=''},
  // ---------- small helpers ----------
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=lgYaw(x-a.c.x,z-a.c.z)},
  eye(a){return a.head&&a.head.y>a.c.y?a.head:_lgV.set(a.c.x,a.c.y+2.3,a.c.z)},
  muz(a){return a.epMuz||this.eye(a)},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}const P=MAP.ez.pad;return n?[x/n,0,z/n]:[P[0],0,P[2]]},
  nearH(a,r){for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<r&&Math.abs(h.c.y-a.c.y)<3)return h;return null},
  // the humans it can shoot at from a point (the hatch gun, his rifle), nearest first (the marked one first); smoke hides them
  seen(x,y,z,r){const out=[];for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>r)continue;if(d>4&&(ESMK.at(h.c.x,h.c.z,0)||ESMK.blocks(x,z,h.c.x,h.c.z)))continue;
    if(losClear(x,y,z,h.c.x,h.c.y+1.25,h.c.z)||losClear(x,y,z,h.c.x,h.c.y+1.6,h.c.z))out.push([d+(h.epMark>G.t?-10:0),h])}out.sort((p,q)=>p[0]-q[0]);return out.map(q=>q[1])},
  // ---------- host: the brain (EPZ.legatus.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.lg;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.dmgWT-=dt;if(S.dmgWT<=0){S.dmgWT=4;S.dmgW=0}
    if(a.frozen>0){a.frozen=0;a.c.vx=a.c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone';
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('lEnr')}}
    const cdm=S.enr?1/.7:1;if(live)for(const k in S.cd)S.cd[k]-=dt*cdm;
    a.spdMul=(S.enr?1.3:1)*(S.slowT>0?.6:1);APC.spd=(1-.22*APC.flats)*(S.enr?1.2:1)*(S.slowT>0?.6:1)*[.82,1,1.08,1.15][G.diff||0];
    if(S.ride){if(S.mode)S.mt-=dt;
      if(live||S.mode==='ret')this.p1(a,dt,S);else{APC.coast(dt,0,6);APC.tgt=null;a.lgPose='hatch'}
      if(S.ride){APC.move(dt);this.seat(a)}return true}
    if(!live){a.lgPose='';return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(a.kin)return true;
    if(S.ph===2)this.p2(a,dt,S);else this.p3(a,dt,S);return true},
  // ---------- phase 1 (and the first meeting): TESTUDO ----------
  p1(a,dt,S){a.lgPose='hatch';
    switch(S.mode){
    // (the first meeting: the gate opens, then out and down to the lane's north end)
    case 'enter':{this.mg(a,dt,S);if(S.mt>S.mt0-1.6){APC.coast(dt,0,9);return}APC.drive(dt);
      if(!APC.path&&Math.abs(APC.v)<.3||S.mt<=0){S.mode='';if(EP.st===3&&EP.ph==='run')EP.gateOpen('gC',false);S.lane=0;S.holdT=2}return}
    case 'ret':{this.mgOff(S);APC.tgt=null;if(!APC.path){APC.revMax=5;APC.go([[APC.x,APC.z],[0,-72]],5,Math.abs(lgAng(APC.yaw,0))>1.6)}APC.drive(dt);
      if(APC.z<-67||S.mt<=0){S.mode='gone';APC.revMax=3.2;EP.meetEnd(a);APC.hide();if(EP.st===3&&EP.ph==='run')EP.gateOpen('gC',false)}return}
    case 'ramW':a.lgPose='brace';this.mgOff(S);APC.coast(dt,0,9);if(S.mt<=0){S.mode='ram';S.mt=6;S.ramD=0;S.ramHit.clear();this.fx({k:'w',i:a.id,s:'ram2'})}return;
    case 'ram':{a.lgPose='brace';const left=S.ramL-S.ramD,stopD=APC.v*APC.v/(2*16);if(left<=stopD+.3||S.mt<=0){S.mode='brake';this.fx({k:'w',i:a.id,s:'brk'})}else APC.coast(dt,15*Math.min(1.15,APC.spd),10);S.ramD+=Math.max(0,APC.v)*dt;return}
    case 'brake':a.lgPose='brace';APC.coast(dt,0,16);if(Math.abs(APC.v)<.2){APC.v=0;S.mode='rstop';S.mt=1;if(S.dieQ){S.dieQ=false;this.dying(a)}}return;
    case 'rstop':this.mg(a,dt,S);APC.coast(dt,0,9);if(S.mt<=0){S.mode='';S.holdT=.4}return;
    case 'drop':{this.mg(a,dt,S);APC.coast(dt,0,9);const t=S.mt0-S.mt;APC.rampTo=t<2.4?1:0;
      if(!S.dropped&&t>.95){S.dropped=1;const n=(SCEN.H.length>=4||S.enr?3:2)-(S.enc?1:0);let k=0;
        for(let i=0;i<n;i++){const [x,z]=APC.toW((i-(n-1)/2)*.9,-4.4-(i%2)*.8),zc=i===0&&(S.enc||Math.random()<.35)?'shield':'squad';if(SCEN.spawn(zc,[x,0,z]))k++}if(k)EP.say('lDrop');this.fx({k:'w',i:a.id,s:'drop'})}
      if(S.mt<=0){S.mode='';APC.rampTo=0;S.holdT=.5}return}
    case 'stall':a.lgPose='hdown';this.mgOff(S);APC.coast(dt,0,12);if(S.mt<=0){S.mode='';S.holdT=.3;this.fx({k:'up',i:a.id})}return;
    // (the engine burning out: on round the bend it is in, stopped once square on a straight, then out of the hatch)
    case 'dying':{a.lgPose='hdown';this.mgOff(S);if(APC.path)APC.drive(dt);else APC.coast(dt,0,6);
      const ax=Math.round(APC.yaw/(Math.PI/2))*(Math.PI/2),sq=Math.abs(wrapA(APC.yaw-ax))<.05;
      if(!APC.path&&sq||S.mt<=0){APC.stop();APC.coast(dt,0,10);if(Math.abs(APC.v)<.15||S.mt<-2)this.bail(a)}return}
    default:if(S.mode)S.mode=''}
    // ---- cruising / holding: the gun, then what to do next ----
    this.mg(a,dt,S);APC.drive(dt);S.pt-=dt;if(S.pt>0)return;S.pt=.35;
    const H=SCEN.H.filter(h=>h.alive);if(!H.length)return;
    // smoke when pressed: a lot of damage just now, or two of them right behind it
    let behind=0;for(const h of H){const [u,w]=APC.toL(h.c.x,h.c.z);if(w<-2&&w>-11&&Math.abs(u)<5)behind++}
    if(S.cd.smk<=0&&(S.dmgW>a.maxHp*.06||behind>=2)){S.cd.smk=18;this.smoke(a,S);if(!S.enc)this.nextSpot(a,S,true);return}
    // a ram at whoever stands in the lane ahead
    if(S.cd.ram<=0&&!APC.rev&&APC.v>=-.2){const r=this.ramTarget(a,S);if(r){this.ramStart(a,S,r);return}}
    // the troopers out of the back while it stands
    if(S.cd.drop<=0&&Math.abs(APC.v)<1.2&&behind===0){S.cd.drop=S.enc?99:24;S.mode='drop';S.mt=S.mt0=3.2;S.dropped=0;APC.stop();this.sayOnce('lDropT');return}
    if(S.enc){this.laneStep(a,S);return}
    // arrived (or never went): hold a while, then the next spot
    if(!APC.path){S.holdT-=.35;if(S.holdT<=0)this.nextSpot(a,S,false)}},
  // the first meeting: up and down the cleared lane (forward to its south end, backing up to its north end), stopping to shoot
  laneStep(a,S){const C=MAP.ez.laneC;if(APC.path)return;S.holdT-=.35;if(S.holdT>0)return;const toS=S.lane!==1;S.lane=toS?1:0;S.holdT=rr(2.6,4.2);
    const tz=toS?C.z1:C.z0;if(Math.abs(tz-APC.z)<2)return;const rev=Math.abs(lgAng(APC.yaw,lgYaw(0,tz-APC.z)))>1.6;APC.go([[APC.x,APC.z],[C.x,tz]],5.2,rev)},
  // the next place to stop on the road: one that sees the most of them, not too close, not far to drive
  nextSpot(a,S,away){const L=APC.spots(),C=this.cen();let bs=-1e9,bp=null;
    for(const sp of L){if(Math.hypot(sp.x-APC.x,sp.z-APC.z)<6)continue;const p=APC.plan(sp);if(!p)continue;let vis=0,near=1e9;
      for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-sp.x,h.c.z-sp.z);near=Math.min(near,d);if(d<55&&losClear(sp.x,3,sp.z,h.c.x,h.c.y+1.3,h.c.z))vis++}
      let s=vis*9-Math.abs(near-17)*.5-(near<7?20:0)-p.L*(away?-.05:.12)+rr(0,7);if(away)s+=Math.hypot(sp.x-C[0],sp.z-C[2])*.4;if(s>bs){bs=s;bp=p}}
    if(!bp){S.holdT=1;return}APC.go(bp.pts,away?7.4:6.4,bp.rev);S.holdT=rr(3.2,5.6)*(S.enr?.7:1)},
  // whoever stands in its lane ahead (7–30 m, within 3 m of its line, on the ground): on the checkpoint's road, or the bridge's lane
  ramTarget(a,S){const [fx,fz]=APC.fwd();let left;
    if(S.enc){if(Math.abs(APC.x-MAP.ez.laneC.x)>1.2||Math.abs(Math.abs(fz)-1)>.01)return null;left=fz>0?-4-APC.z:APC.z+56}
    else{const D=APC.dirNow();if(D.off>1.2)return null;const R=MAP.ez.road,A=R.n[D.a],B=R.n[D.b];
      if(Math.abs(wrapA(APC.yaw-lgYaw(B[0]-A[0],B[1]-A[1])))>.12)return null;left=(1-D.tAB)*Math.hypot(B[0]-A[0],B[1]-A[1])}
    let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||h.c.y>1.4)continue;const px=h.c.x-APC.x,pz=h.c.z-APC.z,w=px*fx+pz*fz,u=Math.abs(px*fz-pz*fx);if(w<7||w>Math.min(30,left-3)||u>3)continue;if(w<bd){bd=w;best=h}}
    return best?{h:best,d:bd,left}:null},
  ramStart(a,S,r){S.cd.ram=S.enr?6:9.5;APC.stop();const T=1.2*EPTW(),[fx,fz]=APC.fwd(),L=Math.max(4,Math.min(r.left-1.5,r.d+7));S.ramL=L;S.mode='ramW';S.mt=T;
    TELE.add({k:'r',x:APC.x+fx*3.9,y:0,z:APC.z+fz*3.9,yaw:APC.yaw,w:3.6,l:L,d:T+.9});this.fx({k:'w',i:a.id,s:'ram'});this.sayOnce('lRam')},
  smoke(a,S){for(const [u,w] of [[0,0],[-3.4,-1],[3.4,1]]){const [x,z]=APC.toW(u,w);ESMK.add(x,0,z,5.5,9)}this.fx({k:'w',i:a.id,s:'smk'});EP.say('lSmoke')},
  // the hatch gun: traverse onto the mark, a burst, a pause
  mg(a,dt,S){const M=S.mg,[hx,hz]=APC.hatch(),m=this.muz(a);M.pick-=dt;
    if(M.st===''){if(M.pick<=0){M.pick=.3;const L=this.seen(hx,3,hz,58);M.tg=L[0]||null;if(M.tg){M.st='aim';M.t=.7*EPTW();this.fx({k:'w',i:a.id,s:'mg'})}}}
    const t=M.tg;APC.tgt=t&&t.alive?t:null;
    const want=t&&t.alive?lgYaw(t.c.x-hx,t.c.z-hz):APC.yaw,dy=lgAng(APC.ty,want);APC.ty=wrapA(APC.ty+clamp(dy,-2.4*dt,2.4*dt));
    if(M.st==='aim'){M.t-=dt;if(!t||!t.alive){M.st='';return}if(M.t<=0&&Math.abs(dy)<.16){M.st='fire';M.t=1.8;M.sh=0;M.lost=0}}
    else if(M.st==='fire'){M.t-=dt;M.sh-=dt;if(!t||!t.alive){M.st='cool';M.t=1;return}
      if(M.sh<=0){M.sh=.13;const vis=losClear(m.x,m.y,m.z,t.c.x,t.c.y+1.2,t.c.z);if(!vis){M.lost+=.13;if(M.lost>.4){M.st='cool';M.t=1.1;return}}else M.lost=0;
        const k=clamp(1-M.t/1.8,0,1),sp=lerp(.065,.03,k)*(t.duck?1.2:1);EBUL.shot(m.x,m.y,m.z,t.c.x+t.c.vx*.12,t.c.y+(t.duck?.9:1.2),t.c.z+t.c.vz*.12,sp,{dmg:4,w:'g',src:a})}
      if(M.t<=0){M.st='cool';M.t=[2.2,1.5,1.3,1.1][G.diff||0]}}
    else if(M.st==='cool'){M.t-=dt;if(M.t<=0)M.st=''}},
  mgOff(S){const M=S.mg;if(M.st==='fire'||M.st==='aim'){M.st='cool';M.t=.8}},
  // the engine took it: on round the bend it is in (a short path to the end of it), else stopped where it is; then out of the hatch
  dying(a){const S=a.lg;S.mode='dying';S.mt=7;APC.eng=1;APC.fire=1;S.dieQ=false;this.mgOff(S);this.fx({k:'eng',i:a.id});
    const P=APC.path;if(P&&!APC.rev){let k=APC.pi;while(k<P.length-1&&P[k][2]<P[0][2]-.01)k++;const stop=P.slice(APC.pi+1,Math.min(P.length,k+3)).map(p=>[p[0],p[1]]);
      if(stop.length)APC.go([[APC.x,APC.z]].concat(stop),3.4);else APC.stop()}else APC.stop()},
  // out of the hatch: the wreck stays where it stopped (squared to the road), he lands beside it — phase 2
  bail(a){const S=a.lg,yw=Math.round(APC.yaw/(Math.PI/2))*(Math.PI/2);APC.v=0;APC.path=null;
    // (onto the lane's line if it is close to one)
    const D=APC.dirNow();if(D.off<.9){const R=MAP.ez.road,A=R.n[D.a],B=R.n[D.b],sx=B[0]-A[0],sz=B[1]-A[1],l2=sx*sx+sz*sz,t=clamp(((APC.x-A[0])*sx+(APC.z-A[1])*sz)/l2,0,1);APC.x=A[0]+sx*t;APC.z=A[1]+sz*t}
    APC.wreckAt(APC.x,APC.z,yw);this.fx({k:'wreck',x:r2(APC.x),z:r2(APC.z),y:r3(yw)});
    S.ride=false;a.lgRide=false;
    // the side away from the most of them, on the floor
    const C=this.cen(),[cu]=APC.toL(C[0],C[2]),sd=cu>0?-1:1;let [ux,uz]=APC.toW(sd*3.1,-.6),n=navSnap(ux,0,uz,4);if(!n){[ux,uz]=APC.toW(-sd*3.1,-.6);n=navSnap(ux,0,uz,4)}if(!n)n={x:ux,y:0,z:uz};
    S.mode='p2a';S.mt=3;a.lgPose='';this.face(a,n.x,n.z);
    epKin(a,n.x,n.y,n.z,.9,1.6,()=>{this.fx({k:'land',x:r2(n.x),y:r2(n.y),z:r2(n.z)});this.fx({k:'roar',i:a.id})});EP.say('lP2');EP.later(3.2,()=>EP.say('lP2l'));
    this.summon(a,2,'squad');this.summon(a,1,'shield')},
  // ---------- phase 2: on foot, cover to cover ----------
  p2(a,dt,S){const c=a.c;a.lgPose='';
    if(c.y>2.4&&S.perch<0){const n=navSnap(c.x+rr(-3,3),0,c.z+rr(-3,3),5);if(n){S.mode='hop';S.mt=2.4;epKin(a,n.x,n.y,n.z,1,1,()=>{S.mode=''})}return}
    S.spotT+=dt;const close=this.nearH(a,5);
    if(!S.spot||S.atk>=2||S.spotT>9||close&&S.spotT>2.5){S.spot=this.coverPick(a,S);S.atk=0;S.spotT=0;S.goT=0}
    const sp=S.spot;if(!sp)return;const d=Math.hypot(sp[0]-c.x,sp[2]-c.z);
    if(d>1.3){this.walk(a,dt,S,sp,1.3);this.claw(a);return}
    this.attacks(a,dt,S)},
  // the patterns from where he stands (phase 2 and 3)
  attacks(a,dt,S){const c=a.c;if(this.claw(a))return;const e=this.eye(a),L=this.seen(e.x,e.y,e.z,40),t=L[0]||null;if(t)this.face(a,t.c.x,t.c.z);else S.spotT+=dt;
    S.pt-=dt;if(S.pt>0||!t)return;const dd=Math.hypot(t.c.x-c.x,t.c.z-c.z),radio=S.pack>0,P3=S.ph===3;
    if(P3&&S.cd.rally<=0&&this.fallenNear(a).length>=2){this.rallyStart(a,S);return}
    if(P3&&S.cd.arty<=0&&dd<26){S.cd.arty=24;this.arty(a,S);return}
    if(P3&&S.cd.chg<=0&&dd>4&&dd<14&&Math.abs(t.c.y-c.y)<1.2&&this.chargeW(a,S,t))return;
    if(radio&&S.cd.ord<=0&&this.troops(a,40)>=2){S.cd.ord=16;S.mode='ord';S.mt=S.mt0=.8;S.ordK='chg';S.atk++;this.fx({k:'w',i:a.id,s:'ord'});EP.say('lCharge');return}
    if(radio&&S.cd.sh<=0){S.cd.sh=28;S.mode='ord';S.mt=S.mt0=.8;S.ordK='sh';S.atk++;this.fx({k:'w',i:a.id,s:'ord'});EP.say('lShield');return}
    if(S.cd.mk<=0&&L.length>=2&&!(LGMARK.h&&LGMARK.h.alive)){S.cd.mk=20;S.mode='mkw';S.mt=1*EPTW();S.tg=t;ELAS.add(a,t,S.mt);this.fx({k:'w',i:a.id,s:'mk'});S.atk++;return}
    if(S.cd.gl<=0&&dd>6&&dd<30){S.cd.gl=P3?6:8;S.mode='glw';S.mt=S.mt0=.75*EPTW();S.tg=t;S.atk++;this.fx({k:'w',i:a.id,s:'gl'});return}
    if(S.cd.smk<=0&&(S.dmgW>a.maxHp*.07||this.nearH(a,8))){S.cd.smk=18;S.mode='thr';S.mt=S.mt0=.5*EPTW();this.fx({k:'w',i:a.id,s:'thr'});return}
    if(S.cd.brst<=0&&dd<38){S.cd.brst=P3?2.4:3.2;S.mode='lsr';S.mt=(P3?.7:.9)*EPTW();S.tg=t;S.n2=3;ELAS.add(a,t,S.mt);this.fx({k:'w',i:a.id,s:'lsr'});return}
    S.pt=.3},
  // ---------- phase 3: the rally, the guns, the charges, the high spots ----------
  p3(a,dt,S){const c=a.c;a.lgPose='';S.hopT-=dt;
    if(S.perch>=0){this.attacks(a,dt,S);if(S.mode)return;if(S.hopT<=0||this.nearH(a,6)){S.perch=-1;const n=navSnap(c.x+rr(-4,4),0,c.z+rr(-4,4),6);if(n){S.mode='hop';S.mt=2.4;epKin(a,n.x,n.y,n.z,.9,1.2,()=>{S.mode='';S.hopT=rr(8,12)});this.fx({k:'hop',i:a.id})}}return}
    if(S.hopT<=0&&!this.nearH(a,5)){const k=this.perchPick(a),P=k>=0?this.perchAt(k):null;if(P){S.hopT=rr(7,10);const d=Math.hypot(P.x-c.x,P.z-c.z),T=clamp(.55+d/18,.7,1.6);S.mode='hop';S.mt=T+1.5;
      epKin(a,P.x,P.y,P.z,T,clamp(1.5+d*.08,1.5,4.2),()=>{S.mode='';S.perch=k;S.hopT=rr(5,7)});this.fx({k:'hop',i:a.id});return}S.hopT=3}
    this.p2(a,dt,S)},
  // the high spots: the stacked containers, the inspection office's roof, the porta-cabins; the wreck's roof
  perchAt(k){const E=MAP.ez;if(k<E.perch.length)return E.perch[k];if(APC.wreck)return {x:APC.x,y:2.06,z:APC.z};return null},
  perchPick(a){const C=this.cen(),n=MAP.ez.perch.length+(APC.wreck?1:0);let best=-1,bs=1e9;for(let k=0;k<n;k++){const P=this.perchAt(k);if(!P)continue;const d=Math.hypot(P.x-C[0],P.z-C[2]);let s=Math.abs(d-18)+rr(0,8)+Math.hypot(P.x-a.c.x,P.z-a.c.z)*.15;
    for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-P.x,h.c.z-P.z)<6)s+=30;if(s<bs){bs=s;best=k}}return best},
  coverPick(a,S){const C=this.cen(),L=MAP.ez.cover;let best=null,bs=1e9;
    for(const p of L){if(p===S.spot)continue;const d=Math.hypot(p[0]-C[0],p[2]-C[2]);let s=Math.abs(d-16)+rr(0,7)+Math.hypot(p[0]-a.c.x,p[2]-a.c.z)*.15;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-p[0],h.c.z-p[2])<6)s+=25;if(s<bs){bs=s;best=p}}return best},
  troops(a,r){let n=0;for(const z of SCEN.Z)if(z.alive&&(z.zc==='squad'||z.zc==='shield')&&Math.hypot(z.c.x-a.c.x,z.c.z-a.c.z)<r)n++;return n},
  claw(a){const h=this.nearH(a,2.2);if(!h||Math.abs(h.c.y-a.c.y)>1.5)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1.4;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,10);AI.moveDir(a,wx,wz)}a.spdMul*=mul},
  // ---------- the patterns ----------
  shoot(a,t,sp,dmg){const m=this.muz(a);EBUL.shot(m.x,m.y,m.z,t.c.x+t.c.vx*.08,t.c.y+(t.duck?.95:1.3),t.c.z+t.c.vz*.08,sp,{dmg,w:'r',src:a})},
  glShot(a,S){const t=S.tg;if(!t||!t.alive)return;const m=this.muz(a),tx=t.c.x+t.c.vx*.5,tz=t.c.z+t.c.vz*.5;let ty=floorBelow(tx,t.c.y+1.2,tz,.2);if(!(ty>-50))ty=t.c.y;
    const T=clamp(Math.hypot(tx-m.x,tz-m.z)/20,.7,1.3)*EPTW();EGREN.throw('he',m.x,m.y,m.z,tx,ty,tz,T,{src:a,dmg:45});AU.at('gl40',m.x,m.y,m.z,{vol:.9,range:90});this.sayOnce('lGl')},
  chargeW(a,S,t){const c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz),yw=lgYaw(dx,dz),L=Math.min(16,d+2.5),fx=-Math.sin(yw),fz=-Math.cos(yw);
    if(!navStraight(c.x,c.y,c.z,c.x+fx*L,c.z+fz*L,.4))return false;S.cd.chg=S.enr?6:9;S.mode='chw';S.mt=.75*EPTW();S.chg={yw,L,d:0,hit:new Set()};a.yaw=yw;
    TELE.add({k:'r',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,yaw:yw,w:1.8,l:L,d:S.mt+.4});this.fx({k:'w',i:a.id,s:'ch'});EP.say('lBay');return true},
  // the troopers nearby that fell lately (the rally gets them up)
  fallenNear(a){const L=[];for(const f of this.fallen)if(G.t-f.t<25&&Math.hypot(f.x-a.c.x,f.z-a.c.z)<25)L.push(f);return L.slice(-4)},
  rallyStart(a,S){S.cd.rally=22;S.mode='rally';S.mt=S.mt0=(S.pack>0?2.5:3.6)*(S.enr?.8:1);S.rally={d:0};this.fx({k:'w',i:a.id,s:'rally'});EP.say('lRally')},
  rallyDone(a,S){let n=0;for(const f of this.fallenNear(a)){if(SCEN.spawn(f.zc,[f.x,f.y,f.z])){n++;this.fallen.splice(this.fallen.indexOf(f),1)}}this.fx({k:'rally',i:a.id,n});S.rally=null},
  rallyBreak(a,S){S.mode='down';S.mt=1.4;S.rally=null;this.fx({k:'rallyx',i:a.id});EP.say('lRallyX')},
  // eight rings round himself (and on whoever is near), one every 0.4 s, each a shell 1.6 s later
  arty(a,S){S.mode='arty';S.mt=1.2;this.fx({k:'w',i:a.id,s:'arty'});EP.say('lArty');EP.later(1.3,()=>EP.say('lArtyT'));const c=a.c,cx=c.x,cz=c.z,H=SCEN.H.filter(h=>h.alive&&Math.hypot(h.c.x-cx,h.c.z-cz)<18);
    for(let i=0;i<8;i++){EP.later(.5+i*.4,()=>{if(!a.alive||EP.st!==4||EP.ph!=='run')return;let x,z;const h=i%2===0&&H.length?rpick(H):null;if(h&&h.alive){x=h.c.x+rr(-1.5,1.5);z=h.c.z+rr(-1.5,1.5)}else{const g=rr(0,TAU),r=rr(6,15);x=cx+Math.cos(g)*r;z=cz+Math.sin(g)*r}
      const n=navSnap(x,0,z,3),y=n?n.y:0;if(n){x=n.x;z=n.z}const T=1.6*EPTW();TELE.add({k:'c',x,y,z,r:4,d:T});EP.later(Math.max(.1,T-1.1),()=>{if(EP.st===4&&EP.ph==='run')this.fx({k:'whz',x:r2(x),y:r2(y),z:r2(z)})});EP.later(T,()=>this.shell(a,x,y,z))})}},
  shell(a,x,y,z){if(EP.st!==4||EP.ph!=='run')return;this.fx({k:'shell',x:r2(x),y:r2(y),z:r2(z)});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>4||Math.abs(h.c.y-y)>2.5)continue;const f=1-d/4;
    hurtHuman(h,EPD(55*(.4+.6*f)),a.alive?a:null,{});SCEN.pushHuman(h,(h.c.x-x)/(d||1)*7*f,3+3*f,(h.c.z-z)/(d||1)*7*f);if(f>.45)epFx(h,'kd',1)}},
  // up to n of a kind out of the pool (twice as many when enraged)
  summon(a,n,zc){const S=a.lg,k=S&&S.enr?2:1;let s=0;for(let i=0;i<n*k;i++)if(SCEN.spawn(zc))s++;return s},
  // ---------- stagger, downs ----------
  grog(a,v){const S=a.lg;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='stall'||S.mode==='dying'||S.mode==='gone'||S.mode==='p2a'||S.mode==='p3a')return;S.grog+=v;
    if(S.rally)this.rallyBreak(a,S);
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6);EP.say(S.ride?'lEng':'lDown')}},
  down(a,t){const S=a.lg;if(S.mode==='gone'||S.mode==='ret'||S.mode==='dying')return;ELAS.stop(a);S.n2=0;S.grog=0;S.rally=null;this.mgOff(S);this.fx({k:'dn',i:a.id});
    if(S.ride){S.mode='stall';S.mt=t;APC.stop()}else{a.kin=null;S.mode='down';S.mt=t}},
  // a burst tyre: stopped 5 s (×1.5), slower after
  flat(a,F){const S=a.lg;if(!S||!S.ride||S.mode==='dying'||S.mode==='gone'||S.mode==='ret')return;APC.flats=Math.min(2,APC.flats+1);SPIKE.set(F.i,2,30);this.fx({k:'flat',i:a.id,n:F.i});EP.say('lFlat');
    if(S.mode==='ram'||S.mode==='brake')APC.v*=.4;S.mode='stall';S.mt=5;APC.stop()},
  // the bowser blowing up by him: 6 % of his health (a little less further off) and +45 stagger
  fuelHit(a,f){const S=a.lg;if(!S)return;damageActor(a,a.maxHp*.06*clamp(f*1.4,0,1),null,{he:1,fuel:1,dir:[0,1,0]});this.grog(a,45)},
  // ---------- phases ----------
  floorHit(a){const S=a.lg;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone')this.retreat(a);return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  retreat(a){const S=a.lg;S.invT=99;S.mode='ret';S.mt=14;APC.stop();this.mgOff(S);EP.gateOpen('gC',true);EP.say('lRet')},
  toPhase(a,n){const S=a.lg;S.ph=n;S.invT=3.5;S.grog=0;S.n2=0;S.spot=null;S.perch=-1;ELAS.stop(a);EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();
    Object.assign(S.cd,{brst:2,gl:4,mk:8,ord:5,sh:10,rally:1,arty:8,chg:5,smk:6});S.hopT=6;
    if(n===2){if(S.ride){if(S.mode==='ram'||S.mode==='ramW'||S.mode==='brake')S.dieQ=true;else this.dying(a)}return}
    // phase 3: the wreck goes up (a red ring first if anyone is near it), a roar, the squad called back
    S.mode='p3a';S.mt=2;a.kin=null;this.fx({k:'roar',i:a.id,b:1});EP.say('lP3l');
    if(APC.wreck){const wx=APC.x,wz=APC.z;let near=false;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-wx,h.c.z-wz)<9)near=true;const T=near?2.2:.4;if(near){TELE.add({k:'c',x:wx,y:0,z:wz,r:7,d:T});EP.say('lP3')}
      EP.later(T,()=>{if(EP.st!==4)return;this.fx({k:'boom',x:r2(wx),z:r2(wz)});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-wx,h.c.z-wz);if(d>7)continue;const f=1-d/7;
        hurtHuman(h,EPD(60*(.4+.6*f)),null,{});SCEN.pushHuman(h,(h.c.x-wx)/(d||1)*9*f,4+3*f,(h.c.z-wz)/(d||1)*9*f);epFx(h,'kd',1.2)}})}
    this.summon(a,2,'squad')},
  // ---------- host: damage in (before the game applies it) and after ----------
  hit(t,dmg,src,o){const S=t.lg;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret')return 0;let mul=1;const part=this.partAt(t,o.x,o.y,o.z);
    if(S.ride){o.kb=0;o.up=0;
      if(o.he)mul=o.fuel?1:.9;else if(part==='head')mul=.5;// (the helmet: half the headshot's bonus up there)
      else if(part==='engine'){mul=2.4;if(!S.enc){APC.eng=Math.min(1,APC.eng+dmg*2.4/(t.maxHp*.2));this.grog(t,dmg*2.4/t.maxHp*450)}}
      else if(part==='inside')mul=2;else if(part==='wheel')mul=.45;else if(part==='shield'||part==='blade')mul=.05;else if(part==='hull')mul=.22}
    else{o.kb=(o.kb||0)*.35;
      if(part==='pack'&&S.pack>0){mul=2.5;S.pack-=dmg*2.5;if(S.pack<=0){S.pack=0;this.fx({k:'radio',i:t.id});EP.say('lRadio');this.grog(t,50)}}
      if(S.mode==='chg')mul*=1.15}
    if(S.mode==='down'||S.mode==='stall')mul*=1.5;if(o.he&&!o.fuel)this.grog(t,15);
    let out=dmg*mul;const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    if(S.rally){S.rally.d+=out*em;if(S.rally.d>=t.maxHp*.04)this.rallyBreak(t,S)}
    const fl=t.maxHp*(S.enc?.85:S.ph===1?LG_PH[1]:S.ph===2?LG_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    S.dmgW+=out*em;return out},
  after(t,dealt){},
  // which part a hit landed on: his head, his radio pack, his body; TESTUDO's parts while he stands in its hatch
  partAt(a,x,y,z){if(x==null)return null;const c=a.c,h=a.head;if(h&&Math.hypot(x-h.x,y-h.y,z-h.z)<.33)return 'head';
    const cy=Math.cos(a.yaw),sy=Math.sin(a.yaw),px=x-c.x,pz=z-c.z,u=px*cy-pz*sy,w=-px*sy-pz*cy,hy=y-c.y;
    if(!a.lgRide&&w<-.12&&w>-.66&&Math.abs(u)<.32&&hy>1.22&&hy<2.08)return 'pack';
    if(a.lgRide&&APC.solid()){if(Math.hypot(px,pz)<.48&&y>APC.gy+2.36)return 'body';return APC.partAt(x,y,z)||'hull'}
    return hy<1.15?'legs':'body'},
  // every page: his own hit volumes (head, body, the pack) and TESTUDO's while he rides it
  ray(a,ox,oy,oz,dx,dy,dz,tmax){let bt=tmax,part=null;const c=a.c,h=a.head;if(!h)return null;
    {const t=raySphere(ox,oy,oz,dx,dy,dz,h.x,h.y,h.z,.24,bt);if(t>=0&&t<bt){bt=t;part='head'}}
    const ride=a.lgRide&&APC.solid(),y0=ride?Math.max(c.y+1.12,APC.gy+2.38):c.y,top=h.y-.2;
    {const t=rayAABB(ox,oy,oz,dx,dy,dz,c.x-.34,y0,c.z-.34,c.x+.34,top,c.z+.34,bt);if(t>=0&&t<bt){bt=t;const hy=oy+dy*t-c.y;part=!ride&&hy<1.15?'legs':'body'}}
    // the pack behind his back (in his own frame)
    if(!ride&&this.packOn(a)){const cy=Math.cos(a.yaw),sy=Math.sin(a.yaw),px=ox-c.x,pz=oz-c.z,ou=px*cy-pz*sy,ow=-px*sy-pz*cy,du=dx*cy-dz*sy,dw=-dx*sy-dz*cy;
      const t=rayAABB(ou,oy-c.y,ow,du,dy,dw,-.28,1.26,-.62,.28,2.02,-.14,bt);if(t>=0&&t<bt){bt=t;part='ball'}}
    if(ride){const r=APC.ray(ox,oy,oz,dx,dy,dz,bt);if(r&&r.t<bt){bt=r.t;part='ball'}}
    return part?{t:bt,part}:null},
  packOn(a){if(!NET.cli)return !!(a.lg&&a.lg.pack>0);const f=EP.bf;return !(f&&f.id===a.id&&f.f&64)},
  // ---------- host, every frame: the spike cases, the APC's ram, the minions ----------
  hostTick(dt){const b=EP.bossA(),S=b&&b.lg,run=EP.st===4&&EP.ph==='run';
    for(const F of SPIKE.L){if(run&&F.st===0){let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+F.i&&G.t>=(h.useBlk||0)&&SPIKE.near(F,h))n++;
        if(n){F.p+=dt*(n>1?1.25:1);if(F.p>=SPIKE.T){F.p=0;SPIKE.set(F.i,1,0)}}else F.p=Math.max(0,F.p-dt*1.5)}else if(F.st!==0)F.p=0;
      if(run&&b&&S&&S.ride&&SPIKE.over(F))this.flat(b,F)}
    // the APC (rams, and its plough at speed) hits whoever it runs into
    if(b&&S&&S.ride&&APC.solid()&&EP.ph==='run'&&S.mode!=='ret'){const fast=Math.abs(APC.v)>4.2;
      for(const h of SCEN.H){if(!h.alive)continue;const [u,w]=APC.toL(h.c.x,h.c.z),hw=h.c.hw||.3;if(h.c.y>2||Math.abs(u)>1.64+hw||w>3.95+hw||w<-3.45-hw)continue;
        if(fast&&!S.ramHit.has(h)&&(w>2.4||S.mode==='ram')){S.ramHit.add(h);const ram=S.mode==='ram'||APC.v>9,[fx,fz]=APC.fwd(),sd=u>=0?1:-1,rx=Math.cos(APC.yaw)*sd,rz=-Math.sin(APC.yaw)*sd;
          hurtHuman(h,EPD(ram?46:20),b,{});epFx(h,'kd',ram?1.2:.8);SCEN.pushHuman(h,fx*Math.max(5,APC.v)*.8+rx*5,4,fz*Math.max(5,APC.v)*.8+rz*5);this.fx({k:'thud',x:r2(h.c.x),z:r2(h.c.z)})}}
      if(!fast&&S.mode!=='ram')S.ramHit.clear()}
    if(!S||!run||S.idle)return;
    EP.trickle(dt,LG_MIX,[.2,.32,.36][S.ph-1]*(S.enr?1.8:1))},
  // ---------- bots ----------
  // one bot minds the spike case on the road TESTUDO is heading for; stopped / down: everybody closes in (on its back); else cover round it
  botGoal(a,i){const b=EP.bossA();if(!b||!b.lg||EP.ph!=='run')return null;const S=b.lg;
    if(S.ride){const F=this.spikeDuty();if(F&&F.bot===a.id)return [F.s.bx,.18,F.s.bz,.3];
      const [fx,fz]=APC.fwd();if(S.mode==='stall'){const an=i*1.2-.6;return [APC.x-fx*8+Math.cos(an)*3,0,APC.z-fz*8+Math.sin(an)*3,2]}
      const L=MAP.ez.cover.map(p=>{const dx=p[0]-APC.x,dz=p[2]-APC.z,d=Math.hypot(dx,dz),back=(dx*fx+dz*fz)/(d||1);return [p,Math.abs(d-17)+back*6+hash2(Math.round(p[0]),Math.round(p[2]),a.id)*4]}).sort((p,q)=>p[1]-q[1]);
      const p=L[i%Math.min(L.length,4)];return p?[p[0][0],p[0][1],p[0][2],1.2]:null}
    if(S.mode==='down'){const an=i*1.7+.4;return [b.c.x+Math.cos(an)*6,0,b.c.z+Math.sin(an)*6,2]}
    const an=i*1.9+Math.floor(G.t/7)*.8,Z=EP.zone('D').box;return [clamp(b.c.x+Math.cos(an)*12,Z[0]+3,Z[2]-3),.1,clamp(b.c.z+Math.sin(an)*12,Z[1]+3,Z[3]-3),2]},
  goalTag(b){const S=b.lg;if(!S)return '';const F=this.spikeDuty();return (S.ride?'r':'f')+(S.mode==='stall'||S.mode==='down'?'d':'')+(F?F.i+':'+F.bot:'')},
  // the case on the road ahead of TESTUDO (ready, the APC coming its way within 45 m), and the bot nearest to it
  spikeDuty(){if(!APC.solid()||!APC.path)return null;const now=G.t;if(this.dutyT>now)return this.duty;this.dutyT=now+1;this.duty=null;
    const P=APC.path;let best=null,bd=1e9;for(const F of SPIKE.L){if(F.st!==0)continue;const s=F.s,cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2;let on=false,acc=0,px=APC.x,pz=APC.z;
      for(let k=APC.pi;k<P.length&&acc<45;k++){const q=P[k];acc+=Math.hypot(q[0]-px,q[1]-pz);px=q[0];pz=q[1];if(Math.hypot(q[0]-cx,q[1]-cz)<4){on=true;break}}if(!on)continue;
      for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-s.bx,h.c.z-s.bz);if(d<bd){bd=d;best={i:F.i,s,bot:h.id}}}}
    return this.duty=best},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;const F=SPIKE.L[j];return F&&F.st===0?j:-1},
  // out of the APC's way (it is coming down the lane at them), out of the hatch gun's or a laser's line (to cover from LEGATUS)
  danger(a){if(!(EP.st===4||EP.meet&&EP.meet.st==='on'))return null;
    if(APC.solid()&&APC.v>2){const [u,w]=APC.toL(a.c.x,a.c.z);if(w>2&&w<12&&Math.abs(u)<2.6){const s=u>=0?1:-1;return {ax:Math.cos(APC.yaw)*s,az:-Math.sin(APC.yaw)*s}}}
    const b=EP.bossA(),S=b&&b.lg;if(!S)return null;
    // (the hatch gun swinging onto it, its searchlight first: a step out of its line before the burst)
    if(S.ride&&S.mg.tg===a&&S.mg.st==='aim')return this.coverDir(a,this.muz(b));
    for(const L of ELAS.list)if(L.tg===a&&L.src===b)return this.coverDir(a,this.muz(b));
    return null},
  // the nearest step out of sight of a point (one it can walk to in a straight line; a few tries, held half a second)
  coverDir(a,e){const B=a.bot,c=a.c;if(!losClear(e.x,e.y,e.z,c.x,c.y+1.3,c.z))return null;
    if(!(B.lgCovT>G.t)){B.lgCovT=G.t+.5;B.lgCov=null;let bd=1e9;for(let k=0;k<12;k++){const n=navAround(c.x,c.z,1,6);if(!n||Math.abs(n.y-c.y)>1.2)continue;
        if(losClear(e.x,e.y,e.z,n.x,n.y+1.3,n.z)||!navStraight(c.x,c.y,c.z,n.x,n.z,c.hw*.9))continue;const d=Math.hypot(n.x-c.x,n.z-c.z);if(d<bd){bd=d;B.lgCov=[n.x,n.z]}}}
    const p=B.lgCov;if(!p)return null;const dx=p[0]-c.x,dz=p[1]-c.z,d=Math.hypot(dx,dz);return d<.4?null:{ax:dx/d,az:dz/d}},
  // ---------- the boss stage's own devices: the three spike-strip cases ----------
  useNear(h){if(!EP.on||EP.id!==6||EP.st!==4)return -1;for(const F of SPIKE.L)if(SPIKE.near(F,h))return F.i;return -1},
  useInfo(i,L){const F=SPIKE.L[i];if(!F)return null;if(F.st===1)return {act:L?'The strip is down across the road':'스파이크 띠 설치됨',p:1,x:1};
    if(F.st===2)return {act:(L?'Spent — back in ':'다시 쓰려면 ')+Math.ceil(F.cd)+(L?'s':'초'),p:0,x:1};return {act:L?'lay the spike strip across the road':'스파이크 띠 깔기',p:F.p/SPIKE.T,x:0}},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==6)return;
    if(NET.cli){const f=EP.bf;// TESTUDO as the host has it: driving, burnt out where it stopped, or gone
      if(f&&f.ap){if(!APC.on||APC.wreck)APC.place(f.ap[0],f.ap[1],f.ap[2])}
      else if(f&&f.wr){if(!APC.wreck||Math.hypot(APC.x-f.wr[0],APC.z-f.wr[1])>.5)APC.wreckAt(f.wr[0],f.wr[1],f.wr[2])}
      else if(APC.on)APC.hide();
      if(f){SPIKE.unpack(f.sp);if(f.f&256)FUEL.burnt();if(f.mk!=null&&f.mk>=0&&(!LGMARK.h||LGMARK.h.id!==f.mk)){const h=byIdAny(f.mk);if(h)LGMARK.set(h,6,true)}}}
    else this.hostTick(dt);
    // (the charges on the barricade where its devices are done: a page that joins late too)
    if(EP.st===2&&EP.ph==='run'){const L=EP.devs();for(let i=0;i<L.length;i++)if((EP.obj.ps[i]||0)>=L[i].t)C4.set(i)}
    APC.update(dt);SPIKE.update(dt);FUEL.update(dt);LGMARK.update(dt);C4.update(dt);
    for(const g of E6GLOW.L){const on=Math.sin(G.t*2.2+g.ph)>-.2;g.sp.material.opacity=on?1:.15;g.sp.scale.set(g.s*(on?1:.7),g.s*(on?1:.7),1)}
    // the second gauge's name follows the phase (the engine, then the radio pack)
    this.g2T-=dt;if(this.g2T<=0){this.g2T=.5;const Bs=EP.bs(),el=$('hEp');if(Bs&&el){const L=LI(),n=Bs.ph>=2?(L?'RADIO':'무전기'):(L?'ENGINE':'엔진'),b=el.querySelector('.eb .g2 b');if(b&&b.textContent!==n)b.textContent=n}}},
  stageClear(kind){LGMARK.clear()},
  // (between stages and matches: the APC put away, the props reset; CHAP[6].clear takes the meshes down)
  clear(){this.cur=null;this.fallen=[];this.said={};this.dutyT=0;this.duty=null;APC.hide();SPIKE.reset();FUEL.reset();LGMARK.clear()},
  // the boss bar: gauges and what he is doing (flags: 1 riding, 2 down / stalled, 4 invulnerable, 8 enraged, 16 first meeting, 32 tyres gone,
  // 64 the radio broken, 128 rallying, 256 the fuel bowser burnt out)
  bsOf(b){const S=b.lg;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.ride?1:0)|(S.mode==='down'||S.mode==='stall'?2:0)|(S.invT>0&&!S.enc?4:0)|(S.enr?8:0)|(S.enc?16:0)|(APC.flats?32:0)|(S.pack<=0?64:0)|(S.mode==='rally'?128:0)|(FUEL.gone?256:0),
    pose:Math.max(0,LG_POSE.indexOf(b.lgPose||'')),pk:S.packMax>0?S.pack/S.packMax:0,eng:APC.eng,
    ap:APC.on&&!APC.wreck?[r2(APC.x),r2(APC.z),r3(APC.yaw),r3(APC.ty),r1(APC.v),r1(APC.ramp),r2(APC.eng),APC.flats]:0,wr:APC.wreck?[r2(APC.x),r2(APC.z),r3(APC.yaw)]:0,
    sp:SPIKE.pack(),mk:LGMARK.h?LGMARK.h.id:-1,mg:S.mg.tg&&S.mg.tg.alive?S.mg.tg.id:-1}},
  bsPack(b){if(!b.lg)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pose,Math.round(B.pk*100),Math.round(B.eng*100),B.ap,B.wr,B.sp,B.mk,B.mg]},
  bsUnpack(B){const ap=Array.isArray(B[8])?[B[8][0]/100,B[8][1]/100,B[8][2]/1000,B[8][3]/1000,B[8][4]/10,B[8][5]/10,B[8][6]/100,B[8][7]|0]:null,wr=Array.isArray(B[9])?[B[9][0]/100,B[9][1]/100,B[9][2]/1000]:null;
    return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pose:B[5],pk:(B[6]|0)/100,eng:(B[7]|0)/100,ap,wr,sp:B[10]||null,mk:B[11],mg:B[12],rt:performance.now()}},
  hud(B,L){const f=B.f;return {ss:f&4?(L?'INVULNERABLE':'무적'):f&2?(f&1?(L?'STOPPED — ×1.5 damage':'멈췄다 — 피해 1.5배'):(L?'DOWN!':'그로기!')):f&128?(L?'RALLYING — break it!':'집결 중 — 끊어!'):f&8?(L?'ENRAGED':'광폭화'):f&32?(L?'TYRES BURST':'바퀴 펑크'):'',
    cls:f&8||f&128?'r':f&2||f&32?'y':'',sp:(f&16?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&1?(L?' · IN TESTUDO':' · 테스투도 탑승'):f&64?(L?' · RADIO DOWN':' · 무전기 파괴'):''),
    g1:B.grog/(B.gmax||100),g2:f&16?null:B.ph>=2?B.pk:1-B.eng}},
  // the spike cases (hot when TESTUDO is coming their way), a laid strip, the marked one, the fuel bowser when he is near it
  markers(list,L,P){const Bs=EP.bs();
    for(const F of SPIKE.L){const s=F.s,d=Math.hypot(s.bx-P.c.x,s.bz-P.c.z);if(F.st===1){if(d<40)list.push([(s.x0+s.x1)/2,.8,(s.z0+s.z1)/2,L?'SPIKES':'스파이크','s'])}
      else if(F.st===0&&Bs&&Bs.f&1){const hot=SPIKE.hot(F);if(hot||d<26)list.push([s.bx,1.6,s.bz,hot?(L?'⚡ LAY THE SPIKES!':'⚡ 스파이크 깔아!'):(L?'spike strip':'스파이크 띠'),hot?'p hot':'p'])}}
    const h=LGMARK.h;if(h&&h.alive&&h!==P)list.push([h.c.x,h.c.y+2.5,h.c.z,'◎ '+(L?'MARKED':'표적'),'b']);
    const F=MAP.ez.fuel,b=EP.bossA();if(F&&!FUEL.gone&&b){const ride=Bs&&Bs.f&1&&APC.on,bx=ride?APC.x:b.c.x,bz=ride?APC.z:b.c.z;if(Math.hypot(bx-F.x,bz-F.z)<9)list.push([F.x,F.y+1.8,F.z,L?'⚡ SHOOT THE BOWSER!':'⚡ 유조차를 쏴!','p hot'])}},
  // ---------- every page: before the rig is posed — his pose, the hatch, the aim's pitch, the recoil, his hit volumes ----------
  pre(a,dt){this.cur=a;const S=a.lg;let pose=a.lgPose||'',down=0,inv=false,enr=false,ride=!!a.lgRide;
    if(a.epRayZc!=='legatus'||!a.epRay){a.epRay=(ox,oy,oz,dx,dy,dz,t)=>LEGATUS.ray(a,ox,oy,oz,dx,dy,dz,t);a.epRayZc='legatus'}
    if(!NET.cli&&S){down=S.mode==='down'||S.mode==='stall'?1:0;inv=S.invT>0&&!S.enc;enr=S.enr}
    else{const f=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(f){pose=LG_POSE[f.pose]||'';down=f.f&2?1:0;inv=!!(f.f&4);enr=!!(f.f&8);ride=!!(f.f&1)}a.lgRide=ride}
    if(pose!==a.lgPose)a.lgThT=0;else a.lgThT=(a.lgThT||0)+dt;a.lgPose=pose;a.lgAtk=pose==='throw'?clamp(a.lgThT/.9,0,1):pose==='order'?.32:0;
    // a client keeps him in the hatch of the APC it draws
    if(NET.cli&&ride&&APC.on&&!APC.wreck){const [hx,hz]=APC.hatch();a.c.x=hx;a.c.z=hz;a.c.y=APC.gy+LG_HY;a.c.onGround=true;a.yaw=APC.ty}
    a.epDown=approach(a.epDown||0,a.alive?down:0,dt*3);a.lgInv=inv;a.lgEnr=enr;a.lgKick=a.epKick||0;a.epKick=Math.max(0,(a.epKick||0)-dt*5);
    a.epAimY=ride?1.85:1.6;a.epPri=down?.3:.6;a.epHide=false;
    // the bots aim at what shows: the engine at the back from behind, else him over his gun shield; on foot the pack from behind, else his chest
    {const P=a.epAimP||(a.epAimP=new THREE.Vector3()),c=a.c;let best=null,bd=1e9;for(const h of SCEN.H)if(h.alive&&h.bot){const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<bd){bd=d;best=h}}
      if(ride&&APC.solid()){const [u,w]=best?APC.toL(best.c.x,best.c.z):[0,10];if(w<-3.5&&Math.abs(u)<6){const [ex,ez]=APC.toW(0,-3.3);P.set(ex,1.8,ez)}else P.set(c.x,c.y+1.85,c.z)}
      else{let w=1;if(best){const cy=Math.cos(a.yaw),sy=Math.sin(a.yaw);w=-(best.c.x-c.x)*sy-(best.c.z-c.z)*cy}
        if(w<-1&&this.packOn(a))P.set(c.x+Math.sin(a.yaw)*.42,c.y+1.65,c.z+Math.cos(a.yaw)*.42);else P.set(c.x,c.y+1.55,c.z)}}
    // the aim's pitch: toward the gun's mark (or the laser's)
    let t=null;for(const L of ELAS.list)if(L.src===a){t=L.tg;break}if(!t&&ride){const f=EP.bf;t=NET.cli?(f&&f.mg>=0?byIdAny(f.mg):null):(S&&S.mg.tg)}if(!t&&S&&!NET.cli)t=S.tg;
    if(t&&t.alive&&t!==a){const ey=a.head&&a.head.y>a.c.y?a.head.y:a.c.y+2.2,dh=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);a.lgPitch=clamp(Math.atan2(t.c.y+1.2-ey,Math.max(1,dh)),-1,.6)}else a.lgPitch=0;
    if(ride&&NET.cli&&APC.on)APC.tgt=t&&t.alive?t:null},
  // the rig's extras: 1.25× the size, the rifle / the M79 / the hatch gun in his hands (the rifle slung otherwise), the radio pack on his back
  rigX(ch){const D=ch.A.def,o=D.o,zb=o.belly*.25+(o.torsoD+o.belly)/2;
    const mk=id=>{const m=new THREE.Mesh(gunGeo(id),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);return m};
    return {rifle:mk(WPN.ar7.model),gl:mk(WPN.gl40.model),mg:mk(WPN.mg6.model),pack:mk('lgRadioP'),flare:mk('lgFlare'),w:new THREE.Matrix4(),
      back:new THREE.Matrix4().makeTranslation(-.08,.12,zb+.24).multiply(new THREE.Matrix4().makeRotationZ(-.5)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2)),
      packM:new THREE.Matrix4().makeTranslation(0,.34,zb+.1),flareM:new THREE.Matrix4().makeTranslation(.1,-.12,-.08),
      mzR:new THREE.Vector3().fromArray(GUNS[WPN.ar7.model].muzzle||[0,.04,-.5]),mzG:new THREE.Vector3().fromArray(GUNS[WPN.gl40.model].muzzle||[0,.04,-.4]),mzM:new THREE.Vector3().fromArray(GUNS[WPN.mg6.model].muzzle||[0,.04,-.7])}},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_legatus')return;if(ch.grp.scale.x!==LG_S)ch.grp.scale.setScalar(LG_S);a.hitW=.38;a.headR=.22;
    const X=ch.lgX||(ch.lgX=this.rigX(ch)),vis=ch.grp.visible,P=a.lgPose||'',U=ch.mat.uniforms.uProbe.value,g=ch.gunOn;
    const mH=(P==='hatch'||P==='brace'||P==='hdown')&&g,gH=P==='gl'&&g,rH=!mH&&!gH&&g&&P!=='order'&&P!=='throw'&&P!=='kneel';
    X.mg.visible=vis&&mH;if(mH)X.mg.matrix.multiplyMatrices(ch.M[1],ch.gunM);X.gl.visible=vis&&gH;if(gH)X.gl.matrix.multiplyMatrices(ch.M[1],ch.gunM);
    X.rifle.visible=vis&&!mH;X.rifle.matrix.multiplyMatrices(ch.M[1],rH?ch.gunM:X.back);
    X.pack.visible=vis&&this.packOn(a);X.pack.matrix.multiplyMatrices(ch.M[1],X.packM);X.flare.visible=vis&&P==='kneel';if(X.flare.visible)X.flare.matrix.multiplyMatrices(ch.M[1],ch.gunM).multiply(X.flareM);
    for(const m of [X.rifle,X.gl,X.mg,X.pack,X.flare])m.material.uniforms.uProbe.value.copy(U);
    const gm=mH?X.mg:gH?X.gl:X.rifle,mz=mH?X.mzM:gH?X.mzG:X.mzR;X.w.multiplyMatrices(ch.grp.matrixWorld,gm.matrix);a.epMuz=(a.epMuz||new THREE.Vector3()).copy(mz).applyMatrix4(X.w);
    if(P==='kneel'&&vis&&Math.random()<.5){const v=_lgV.setFromMatrixPosition(X.flare.matrix).applyMatrix4(ch.grp.matrixWorld);FX.spawn({x:v.x,y:v.y+.3,z:v.z,vx:rr(-.4,.4),vy:rr(1,2),vz:rr(-.4,.4),life:rr(.3,.6),s0:.14,s1:.04,r:1,g:.2,b:.1,a:1,f:1,add:1})}
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(a.lgInv)T.set(1,.95,.85,.16+.08*Math.sin(G.t*30));else if(a.lgEnr)T.set(.9,.1,.05,.14+.06*Math.sin(G.t*9))}},
  // ---------- the modes (on foot) ----------
  step(a,dt,S){
    switch(S.mode){
    case 'lsr':{const t=S.tg;a.lgPose='rifle';if(!t||!t.alive){ELAS.stop(a);S.mode='';S.pt=.4;break}this.face(a,t.c.x,t.c.z);if(S.mt<=0){ELAS.stop(a,true);S.mode='brst';S.mt=.6;S.burstT=0}break}
    case 'brst':{const t=S.tg;a.lgPose='rifle';if(t&&t.alive)this.face(a,t.c.x,t.c.z);S.burstT-=dt;if(S.burstT<=0&&S.n2>0&&t&&t.alive){S.burstT=.1;S.n2--;this.shoot(a,t,.012,16)}
      if(S.n2<=0||!t||!t.alive){S.mode='rec';S.mt=.5}break}
    case 'rec':{if(S.mt<=0){S.mode='';S.pt=.5}break}
    case 'glw':{const t=S.tg;a.lgPose='gl';if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0){this.glShot(a,S);S.mode='rec';S.mt=.6}break}
    case 'mkw':{const t=S.tg;a.lgPose='rifle';if(!t||!t.alive){ELAS.stop(a);S.mode='';S.pt=.4;break}this.face(a,t.c.x,t.c.z);if(S.mt<=0){ELAS.stop(a,true);LGMARK.set(t,8);EP.say('lMark');EP.later(.8,()=>EP.say('lMarkL'));S.mode='rec';S.mt=.5}break}
    case 'ord':{a.lgPose='order';if(S.mt<=0){this.order(a,S);S.mode='rec';S.mt=.4}break}
    case 'thr':{a.lgPose='throw';if(S.mt<=0){const c=a.c,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);let ty=floorBelow(c.x+fx,c.y+1.5,c.z+fz,.2);if(!(ty>-50))ty=c.y;EGREN.throw('sm',c.x+fx*.5,c.y+2.2,c.z+fz*.5,c.x+fx*1.2,ty,c.z+fz*1.2,.45,{src:a,r:7,life:9});EP.say('lSmoke');S.mode='rec';S.mt=.4;S.spot=null}break}
    case 'rally':{a.lgPose='kneel';if(S.mt<=0){this.rallyDone(a,S);S.mode='rec';S.mt=.6}break}
    case 'arty':{a.lgPose='order';if(S.mt<=0){S.mode='';S.pt=.4}break}
    case 'chw':{a.lgPose='charge';a.yaw=S.chg.yw;if(S.mt<=0){S.mode='chg';S.mt=2.5;this.fx({k:'w',i:a.id,s:'ch2'})}break}
    case 'chg':{a.lgPose='charge';const C=S.chg,c=a.c,fx=-Math.sin(C.yw),fz=-Math.cos(C.yw),v=13*(S.enr?1.15:1),st=Math.min(v*dt,C.L-C.d);a.yaw=C.yw;
      if(st<=.01||S.mt<=0){S.mode='rec';S.mt=.8;break}const nx=c.x+fx*st,nz=c.z+fz*st;if(!charFits(c,nx,c.y,nz)){S.mode='down';S.mt=1.2;this.grog(a,20);SCEN.slamFx(c.x,c.y,c.z);break}c.x=nx;c.z=nz;C.d+=st;
      for(const h of SCEN.H){if(!h.alive||C.hit.has(h))continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<1.3&&Math.abs(h.c.y-c.y)<1.6){C.hit.add(h);hurtHuman(h,EPD(42),a,{});epFx(h,'kd',1.1);SCEN.pushHuman(h,fx*8,4,fz*8)}}break}
    case 'down':{a.lgPose='down';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'p2a':{a.lgPose='';if(S.mt<=0&&!a.kin){S.mode='';S.pt=.6}break}
    case 'p3a':{a.lgPose='order';if(S.mt<=0){S.mode='';S.pt=.4;if(this.fallenNear(a).length)this.rallyStart(a,S)}break}
    // (scripted leaps: their landing sets the next mode; the clock only rescues one that went wrong)
    default:{if(!a.kin&&S.mt<-1)S.mode=''}}},
  // an order over the radio: the troopers nearby charge (40 % faster for 6 s), or two shield troopers come up in front of him
  order(a,S){if(S.pack<=0)return;if(S.ordK==='chg'){for(const z of SCEN.Z)if(z.alive&&(z.zc==='squad'||z.zc==='shield')&&Math.hypot(z.c.x-a.c.x,z.c.z-a.c.z)<40){z.lgRushT=G.t+6;if(z.bot)z.bot.tgtT=0}this.fx({k:'ordc'});return}
    let n=0;for(const z of SCEN.Z)if(z.alive&&z.zc==='shield'&&n<2&&Math.hypot(z.c.x-a.c.x,z.c.z-a.c.z)<30){z.lgEsc=a;n++}
    for(;n<2;n++){const sp=navSnap(a.c.x+rr(-2,2),0,a.c.z+rr(-2,2),4);const z=SCEN.spawn('shield',sp?[sp.x,sp.y,sp.z]:null);if(z)z.lgEsc=a}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const e=a.epMuz||a.c;
      if(m.s==='mg')AU.at('rack',e.x,e.y,e.z,{vol:.8,range:70,rate:.8});else if(m.s==='ram'){AU.at('lgrev',APC.x,1.2,APC.z,{vol:1,range:110});HUD.note(L?'TESTUDO is about to ram!':'장갑차가 들이받는다!',1.6)}else if(m.s==='ram2')AU.at('lgrev',APC.x,1.2,APC.z,{vol:1,range:110,rate:1.25});
      else if(m.s==='brk')AU.at('lgbrake',APC.x,.6,APC.z,{vol:1,range:80});else if(m.s==='drop')AU.at('lgramp',APC.x,1,APC.z,{vol:1,range:60});else if(m.s==='smk')for(let i=0;i<3;i++)AU.at('gl40',APC.x,2.6,APC.z,{vol:.7,range:70,rate:1.3,delay:i*.12});
      else if(m.s==='lsr'||m.s==='mk')AU.at('chg',e.x,e.y,e.z,{vol:.55,range:80,rate:m.s==='mk'?.8:1.4});else if(m.s==='gl')AU.at('rack',e.x,e.y,e.z,{vol:.7,range:50,rate:1.2});
      else if(m.s==='ord'||m.s==='arty')AU.play('ui',{vol:.5,rate:.6});else if(m.s==='rally'){AU.at('flare',a.c.x,a.c.y+1,a.c.z,{vol:1,range:70});HUD.announce(L?'LEGATUS RALLIES HIS SQUAD':'레가투스가 분대를 일으킨다','z',2)}
      else if(m.s==='ch'||m.s==='ch2')AU.at('zroar',a.c.x,a.c.y+2,a.c.z,{vol:.9,range:70,rate:m.s==='ch'?1.1:.9});else if(m.s==='thr')AU.at('pin',e.x,e.y,e.z,{vol:.8,range:40})}break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'dn':if(a){AU.at('zpain',a.c.x,a.c.y+2,a.c.z,{vol:1,range:70,rate:.7});HUD.note(L?'Down — ×1.5 damage':'그로기 — 피해 1.5배',2.5)}break;
    case 'up':break;
    case 'flat':{const F=SPIKE.L[m.n];if(F){const s=F.s,cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2;for(let k=0;k<26;k++)FX.spawn({x:cx+rr(-1,1),y:.4,z:cz+rr(-1,1),vx:rr(-3,3),vy:rr(1,3),vz:rr(-3,3),life:rr(.3,.7),s0:.2,s1:.6,r:.3,g:.3,b:.3,a:.6,f:2,drag:2})}
      AU.at('explode',APC.x,.6,APC.z,{vol:.7,range:90,rate:2.2,occ:false});AU.at('hiss',APC.x,.6,APC.z,{vol:1,range:60,rate:.8});HUD.announce(L?'ITS TYRES BURST':'타이어 펑크!','h',2.2)}break;
    case 'spk':if(NET.cli)SPIKE.set(m.i,m.s,m.cd,true);break;
    case 'eng':AU.at('explode',APC.x,2,APC.z,{vol:.9,range:110,rate:1.1,occ:false});HUD.announce(L?'TESTUDO IS BURNING':'테스투도에 불이 붙었다','z',2.6);APC.eng=1;break;
    case 'wreck':if(NET.cli)APC.wreckAt(m.x/100,m.z/100,m.y/1000);HUD.announce(L?'LEGATUS JUMPS DOWN':'레가투스가 뛰어내린다','z',2.6);AU.play('stingZ',{vol:.7});break;
    case 'land':SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('land',m.x/100,m.y/100,m.z/100,{vol:1,range:60,rate:.7});break;
    case 'hop':if(a)AU.at('zleap',a.c.x,a.c.y+1.5,a.c.z,{vol:.9,range:60,rate:.75});break;
    case 'roar':if(a){AU.at('zroar',a.c.x,a.c.y+2,a.c.z,{vol:1,range:110,rate:m.b?.72:.92});if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<16)FX.shake=Math.max(FX.shake,.6-d/30)}}break;
    case 'ph':HUD.announce(m.n===2?(L?'TESTUDO IS DYING':'테스투도가 멈춰 간다'):(L?'NOBODY GETS LEFT BEHIND':'아무도 두고 가지 않는다'),'z',3);AU.play('stingZ',{vol:.7});break;
    case 'enr':HUD.announce(L?'LEGATUS IS ENRAGED':'레가투스 광폭화','z',2.5);break;
    case 'boom':{const x=m.x/100,z=m.z/100;FX.explode(x,1.4,z,'he');FX.explode(x,2.2,z+1,'he');AU.at('explode',x,1,z,{vol:1,range:140,occ:false,rate:.62});DL.add(x,3,z,'#ff8a3a',24,4,.6);
      for(let i=0;i<30;i++)FX.spawn({x:x+rr(-1.5,1.5),y:rr(1,2.6),z:z+rr(-1.5,1.5),vx:rr(-8,8),vy:rr(3,10),vz:rr(-8,8),life:rr(.7,1.5),s0:.14,s1:.08,r:.2,g:.2,b:.2,f:7,grav:10});
      if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<20){FX.shake=Math.max(FX.shake,1-d/22);AU.shock(.9-d/26)}}break}
    case 'whz':AU.at('lgshell',m.x/100,m.y/100+6,m.z/100,{vol:.8,range:80});break;
    case 'shell':{const x=m.x/100,y=m.y/100,z=m.z/100;FX.explode(x,y+.3,z,'he');AU.at('explode',x,y,z,{vol:.9,range:100,occ:false,rate:1.05});if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<14){FX.shake=Math.max(FX.shake,.85-d/16);AU.shock(.7-d/20)}}break}
    case 'rally':if(a){HUD.note((L?'Back up: ':'다시 일어난 분대원 ')+(m.n|0),2.2);AU.at('zrevive',a.c.x,a.c.y+1,a.c.z,{vol:1,range:60})}break;
    case 'rallyx':HUD.announce(L?'RALLY BROKEN':'집결 실패!','h',2);break;
    case 'mark':if(NET.cli){const h=byIdAny(m.i);if(h)LGMARK.set(h,m.t/100,true)}break;
    case 'radio':if(a){HUD.announce(L?'HIS RADIO IS SMASHED':'무전기 파괴!','h',2.4);AU.at('imp_metal',a.c.x,a.c.y+1.7,a.c.z,{vol:1,range:60,rate:.6});for(let i=0;i<24;i++)FX.spawn({x:a.c.x,y:a.c.y+1.8,z:a.c.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.2,.5),s0:.05,s1:.02,r:1,g:.8,b:.4,f:0,grav:8,add:1})}break;
    case 'ordc':for(const z of SCEN.Z)if(z.alive&&(z.zc==='squad'||z.zc==='shield'))AU.at('zroar',z.c.x,z.c.y+1.6,z.c.z,{vol:.5,range:40,rate:1.2});break;
    case 'fuel':if(NET.cli)FUEL.boom(true);break;
    case 'thud':AU.at('hamhit',m.x/100,1,m.z/100,{vol:1,range:50,rate:.8});AU.at('imp_metal',m.x/100,1,m.z/100,{vol:.9,range:50,rate:.6});break;
    case 'c4c':HUD.announce(L?'BLOWING THE BARRICADE IN 3':'바리케이드 폭파 3초 전!','z',2.6);AU.play('beep2',{vol:.8});EP.later(1,()=>AU.play('beep2',{vol:.8}));EP.later(2,()=>AU.play('beep2',{vol:.9,rate:1.2}));break;
    case 'c4b':C4.blast();break;
    case 'c4s':if(NET.cli)C4.set(m.n);break}}};

// ---------- the RT-1 shield trooper: a ballistic shield stops every bullet from the front ----------
// From its front (within 60° of where it faces) a bullet does nothing (a spark and a clang); from the side or behind the full amount;
// blasts, fire and blades go round the shield. Its shield bash shoves. Ordered forward (LEGATUS's "shields forward"), it stands in front
// of him, shield up.
const SHIELD={
  front(t,o){if(!o||!o.dir||o.he||o.knife||o.blunt||o.claw||TM_FIRE[o.w])return false;const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hl=Math.hypot(o.dir[0],o.dir[2])||1;return (o.dir[0]*fx+o.dir[2]*fz)/hl<-.5},
  // the escort: two metres in front of LEGATUS toward the nearest human, facing them
  ai(a,dt){const L=a.lgEsc;if(!L||!L.alive||L.lgRide||!L.lg||L.lg.ph===1){a.lgEsc=null;return false}let t=null,bd=40;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-L.c.x,h.c.z-L.c.z);if(d<bd){bd=d;t=h}}if(!t)return false;
    if(Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<3)return false;// (somebody right on it: it fights as usual)
    const dx=t.c.x-L.c.x,dz=t.c.z-L.c.z,d=Math.hypot(dx,dz)||1,i=a.id%2?1:-1,gx=L.c.x+dx/d*2.2-dz/d*i*.9,gz=L.c.z+dz/d*2.2+dx/d*i*.9,c=a.c,cmd=a.cmd;cmd.f=cmd.s=0;cmd.fire=false;cmd.jump=false;
    a.yaw=lgYaw(dx,dz);const ex=gx-c.x,ez=gz-c.z,ed=Math.hypot(ex,ez);if(ed>.6)AI.moveDir(a,ex/ed,ez/ed);return true}};
EPZ.legatus={hp:()=>LEGATUS.hpFor(),init:a=>LEGATUS.init(a,LEGATUS.encNext),ai:(a,dt)=>LEGATUS.ai(a,dt),
  hit:(t,dmg,src,o)=>t.lg?LEGATUS.hit(t,dmg,src,o):dmg,after:(t,r)=>{if(t.lg)LEGATUS.after(t,r)},
  // (the shooter's own page) sparks off the APC's armour or the radio pack
  spark(t,o){if(!o||o.x==null||AU.throttle('lgsp',70))return;const p=LEGATUS.partAt(t,o.x,o.y,o.z);if(p==='head'||p==='body'||p==='legs')return;
    const big=p==='engine'||p==='inside'||p==='pack';for(let i=0;i<(big?8:4);i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2.5,2.5),vy:rr(0,2.5),vz:rr(-2.5,2.5),life:rr(.12,.3),s0:.05,s1:.02,r:1,g:big?.6:.85,b:big?.2:.5,f:0,grav:8,add:1});
    if(p==='shield'||p==='blade'||p==='hull')AU.at('imp_metal',o.x,o.y,o.z,{vol:.4,range:30,rate:1.4})},
  // his rifle butt (close quarters)
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?6:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?34:24),a,{claw:1});return true},
  pre:(a,dt)=>LEGATUS.pre(a,dt),attach:a=>LEGATUS.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;t.lgRide=false;if(t.lg&&!t.lg.enc&&!NET.cli)EP.say('lDie')},
  gone(a){ELAS.stop(a,true);a.kin=null;a.lgRide=false;if(a.lg)a.lg.mode='gone'}};
EPZ.shield={init(a){a.lgEsc=null},ai:(a,dt)=>SHIELD.ai(a,dt),
  hit(t,dmg,src,o){if(SHIELD.front(t,o)){o.kb=(o.kb||0)*.3;return src&&src.bot&&!src.isPlayer?dmg*.3:0}return dmg},// (the team's bots, which cannot go round it, chip it)
  spark(t,o){if(!SHIELD.front(t,o)||o.x==null||AU.throttle('shsp',80))return;for(let i=0;i<6;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2,2)-o.dir[0],vy:rr(0,2),vz:rr(-2,2)-o.dir[2],life:rr(.1,.25),s0:.05,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1});AU.at('imp_metal',o.x,o.y,o.z,{vol:.5,range:25,rate:.9})},
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?7:5;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?30:20),a,{claw:1});if(heavy)epFx(t,'dz',.8);return true},
  pre(a){a.epPri=2.2},
  // the shield on its arms, held up in front (a bash brings it forward)
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_shield')return;let X=ch.shX;if(!X){const D=ch.A.def,o=D.o,zf=o.belly*.25-(o.torsoD+o.belly)/2;const m=new THREE.Mesh(gunGeo('lgShieldP'),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);
      X=ch.shX={m,zf,T:new THREE.Matrix4()}}
    const k=a.an&&a.an.atk>0?Math.sin(clamp(a.an.atk,0,1)*Math.PI):0;X.T.makeTranslation(-.04,.2,X.zf-.3-k*.26);X.m.matrix.multiplyMatrices(ch.M[1],X.T);X.m.visible=ch.grp.visible&&a.alive;X.m.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value)},
  die(t){if(!NET.cli&&EP.on&&EP.id===6)LEGATUS.fallen.push({zc:'shield',x:t.c.x,y:t.c.y,z:t.c.z,t:G.t})},
  gone(a){a.lgEsc=null}};
Object.assign(ZGAIT,{legatus:{stride:1.05,knee:1.1,runK:1,bob:1,twist:1.1,sway:1},shield:{stride:.9,knee:1,runK:.85,bob:1.1,twist:.8}});
Object.assign(JAW0,{legatus:.08,shield:.1});

// ---------- the rig poses (every page): LEGATUS — the hatch gun, the rifle, the M79, an arm up for an order, kneeling with the flare;
// the shield trooper — both forearms up behind its shield ----------
{const pz=poseZombie;poseZombie=function(ch,st){
  if(st.zclass==='shield'&&!(st.dead>0)){pz(ch,st);const R=ch.R,a=st.atk||0,k=a>0?Math.sin(clamp(a,0,1)*Math.PI):0,b=Math.sin((st.t||0)*1.3)*.03;
    setE(R[3],.34+k*.55+b,0,.22);setE(R[4],1.85-k*.7,0,0);setE(R[5],.3+k*.55-b,0,-.24);setE(R[6],1.9-k*.7,0,0);return}
  if(st.zclass!=='legatus'||st.dead>0||!LEGATUS.cur){pz(ch,st);return}const a=LEGATUS.cur,P=a.lgPose||'',H=LEGATUS.holds();
  if(P==='down'){st.zclass='rager';pz(ch,st);st.zclass='legatus';return}
  const hatch=P==='hatch'||P==='brace'||P==='hdown';st.hold=hatch?H.mg:P==='gl'?H.gl:P==='throw'||P==='order'?H.nade:H.rifle;
  st.pitch=P==='hdown'?-.55:P==='brace'?-.12:P===''||P==='charge'?0:P==='kneel'?-.7:(a.lgPitch||0);st.kick=a.lgKick||0;st.atk=P==='throw'||P==='order'?a.lgAtk||0:0;
  if(hatch){st.spd=0;st.sprint=0;st.crouch=P==='hdown'?.35:0}else{st.sprint=(P==='charge'||P==='')&&st.spd>3.2?1:0;st.crouch=P==='kneel'?1:0}st.reload=0;st.relKind=null;poseHuman(ch,st)}}

// ---------- chapter 6 「레가투스」: the North Gate Bridge on Containment Line 1 (season 2) ----------
//   1 the south toll plaza — three waves; the RT-1 shield troopers first show up; then RT-1's road blockers sink
//   2 the bridge approach — a charge on each part of RT-1's barricade (10 s each, any order): 3 s later it blows and the way opens
//   3 the main span — everybody across to the checkpoint gate within 150 s, TESTUDO coming down the cleared lane at them meanwhile
//     (it pulls back through the gate once they are across, or once it has lost 15 % of its health)
//   4 the north checkpoint — the boss fight, three phases. A wipe replays the phase it reached, at that phase's health
CHAP[6]={id:6,k:'legatus',map:'ep6',code:'RT1-01',season:2,n:['레가투스','LEGATUS'],t:['좀비 시나리오: 레가투스','Zombie Scenario: LEGATUS'],
  file:[['1차 회수팀 대장 RT1-01. 지휘 장갑차 테스투도의 해치에서 기관총을 쏘고, 길을 막는 사람을 들이받는다','RT-1\'s leader, RT1-01: he fires from the hatch of the command APC TESTUDO and runs down whoever stands in its road'],
    ['약점은 장갑차 뒤쪽 엔진 · 스파이크 띠를 깔면 바퀴가 터진다 · 내려선 뒤엔 등의 무전기','Its engine at the back is the weak spot · spike strips burst its tyres · on foot: the radio on his back']],
  cards:{place:['제1 봉쇄선 북문대교','NORTH GATE BRIDGE · LINE 1'],who:['1차 회수팀 대장','RT-1 LEADER'],line:['아무도 두고 가지 않는다 — 죽은 부하들에게 아직도 명령을 내린다','Leave no one behind — he still gives his dead squad their orders']},
  boss:LEGATUS,voice2:['레가투스','LEGATUS'],voice3:['미확인 송신','UNKNOWN SIGNAL'],
  // gates: A the road blockers onto the bridge, B RT-1's barricade (blown), C the checkpoint's gate
  gates:['gA','gB','gC'],gateDur:{gA:1.2,gB:.35,gC:1.6},
  stages:[null,
    {z:'A',k:'waves',n:['남단 요금소','South toll plaza'],on:['요금소를 지켜라','Hold the toll plaza'],prep:18,clr:'s1c',intro:{zc:'shield',say:'shield',at:5},doorN:['다리 입구','BRIDGE'],
      wave:w=>[['rager',54],['runner',22],['squad',w>=2?14:10],['shield',w>=2?11:7],['bomber',w>=2?6:0],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['대교 진입로','Bridge approach'],on:['바리케이드에 폭약 설치','Plant charges on the barricade'],dev:'c4',say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'c1':'c2',doorN:['바리케이드','BARRICADE'],
      mix:[['rager',44],['runner',24],['squad',18],['shield',10],['bomber',4]]},
    {z:'C',k:'breach',n:['대교 본선','Main span'],on:['다리를 건너 검문소 정문까지','Get across to the checkpoint gate'],goal:'c',len:150,say:'s3',sayRetry:1,clr:'s3c',meet:{at:6},late:'late3',doorN:['검문소 정문','GATE'],
      mix:[['rager',42],['runner',26],['squad',20],['shield',12]]},
    {z:'D',k:'boss',n:['북단 검문소','North checkpoint'],on:['레가투스를 쓰러뜨려라','Bring LEGATUS down'],say:'s4',go:'b0',prepPt:[0,.2,-78,2]}],
  // (after the charges the barricade only blows 3 s later: gB opens then, not with the stage's clear — the stage-3 start after it has it)
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3&&!(n===3&&kind==='next'&&EP.st===2))m|=b('gB');if(n===4&&kind!=='phase')m|=b('gC');return m},
  setup(){SPIKE.build();FUEL.reset();LEGATUS.fallen=[];LEGATUS.said={}},
  stageStart(n,kind){SPIKE.build();if(n<4){LGMARK.clear();if(APC.on)APC.hide()}if(n===4&&kind!=='phase'){SPIKE.reset();FUEL.reset()}if(!(n===2&&kind==='retry'))C4.clear()},
  stageDone(n){if(n===2){LEGATUS.fx({k:'c4c'});EP.later(3,()=>{LEGATUS.fx({k:'c4b'});EP.gateOpen('gB',true)})}},
  devDone(st,i){if(st===2){C4.set(i);if(NET.host)netEv('elg',{k:'c4s',n:i})}},
  bossGo(){EP.setGates(EP.gm&~EP.bit('gC'));return []},
  boxShot(eh,a,W){if(eh.k!=='fuel')return;const dmg=(W&&W.dmg||30)*(W&&W.pellets?.6:1);if(NET.cli){if(!AU.throttle('elgs',120))netToHost({t:'elgs',d:Math.round(dmg)});return}FUEL.hit(dmg)},
  clear(){LEGATUS.clear();APC.clear();SPIKE.clear();C4.clear()},
  endFx(r){if(r.win)this.ending()},
  // after the clear: the signal is still there; a card for the season so far
  ending(){EP.later(3,()=>EP.radio('end0'));EP.later(6.4,()=>EP.radio('end1'));EP.later(8.8,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'ZOMBIE SCENARIO · SEASON 2':'좀비 시나리오 · 시즌 2'}</small><h1>${L?'CHAPTER 6 CLEAR':'6챕터 클리어'}</h1><p>${L?'The signal comes from further north.':'신호는 더 북쪽에서 온다.'}</p><b>${L?'NEXT — CHAPTER 7 「LORELEI」':'다음 이야기 — 7챕터 「로렐라이」'}</b></div></div>`;
    el.className='on';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},6500)},
  radio:{
    start:['2차 회수팀, 북문대교 남단이다. 레가투스의 무전 — "북쪽으로 와라" — 은 다리 건너 검문소에서 나오고 있다.','RT-2, you are at the south end of the North Gate Bridge. LEGATUS\'s broadcast — "come north" — is coming from the checkpoint across it.',0],
    w1:['요금소 남쪽에서 몰려온다!','They are coming through the toll lanes from the south!',0],
    shield:['방패다! 정면은 다 막혀 — 옆이나 뒤로 돌아서 쏴, 아니면 수류탄!','Shields! The front stops everything — get round the side or the back, or use a grenade!',1],
    s1c:['요금소 확보. 다리 입구 차단기 내린다.','Toll plaza clear. Lowering the blockers onto the bridge.',0],
    s2:['1차 팀이 다리를 막아 놨다 — 버스, 컨테이너, 군용 트럭. 하나씩 폭약을 설치해, 10초씩.','RT-1 blocked the bridge — a coach, a container, an army truck. A charge on each, ten seconds apiece.',0],
    c1:['하나 설치. 두 개 남았다.','One charge set. Two to go.',0],
    c2:['마지막 하나!','Last one!',0],
    s2c:['폭약 설치 완료 — 3초 뒤 폭파한다, 물러나!','All charges set — it blows in three, get back!',0],
    s3:['다리 본선이다. 검문소 정문까지 건너가.','The main span. Get across to the checkpoint gate.',0],
    enc:['장갑차다! 가운데 차로로 내려온다 — 엄폐해!','An APC! Coming down the middle lane — take cover!',1],
    enc2:['…저건 1차 팀 지휘 차량 테스투도다. 해치에 서 있는 건… RT1-01, 레가투스.','…That is RT-1\'s command vehicle, TESTUDO. And in the hatch… RT1-01, LEGATUS.',0],
    lMeet:['2차 회수팀? …좋다. 대열에 서라. 아무도 두고 가지 않는다.','RT-2? …Good. Fall in. Nobody gets left behind.',2],
    lRam:['장갑차가 들이받는다! 빨간 띠에서 비켜!','It is ramming! Get out of the red strip!',1],
    lRet:['장갑차가 검문소 안으로 물러난다.','The APC is pulling back into the checkpoint.',1],
    late3:['다리 위에서 시간이 다 됐다… 다시 간다.','We ran out of time on the bridge… Again.',0],
    s3c:['정문 앞 확보. 레가투스는 검문소 안이다. 문 연다.','At the gate. LEGATUS is inside the checkpoint. Opening it.',0],
    s4:['검문소 도로 세 곳에 스파이크 띠 상자가 있다. 장갑차가 지나갈 길에 깔아. 엔진은 뒤쪽이다.','There are spike-strip cases by three of the roads in there. Lay them where the APC will pass. Its engine is at the back.',0],
    b0:['분대, 대열 맞춰. 우리는 아직 살아 있다.','Squad, form up. We are still alive.',2],
    lDrop:['분대, 하차! 엄호해!','Squad, dismount! Cover me!',2],
    lDropT:['뒤 해치가 열린다 — 분대원이 내린다!','The rear hatch is opening — troopers coming out!',1],
    lSmoke:['연막이다! 놈이 자리를 옮긴다.','Smoke! He is moving.',1],
    lFlat:['바퀴가 터졌다! 멈췄어 — 몰아쳐!','Its tyres are gone! It has stopped — pour it on!',1],
    lEng:['엔진이 멈췄다! 지금이야!','The engine has stalled! Now!',1],
    lP2:['장갑차가 불탄다… 레가투스가 뛰어내렸다! 등에 멘 무전기를 노려!','The APC is burning… LEGATUS jumped out! Go for the radio on his back!',1],
    lP2l:['테스투도가… 아니, 상관없다. 분대, 내 뒤로.','TESTUDO is… no. It does not matter. Squad, on me.',2],
    lMark:['표적 지정이다! 찍힌 사람한테 다 몰려온다 — 붙어 있어!','He has marked someone! They will all go for whoever it is — stay together!',1],
    lMarkL:['저기다. 저 녀석부터.','There. That one first.',2],
    lCharge:['분대, 돌격!','Squad — charge!',2],
    lShield:['방패, 앞으로!','Shields, forward!',2],
    lRadio:['무전기 박살 났다! 이제 명령을 못 내린다.','His radio is smashed! He cannot give orders now.',1],
    lGl:['유탄이다! 빨간 원 밖으로!','Grenade launcher! Out of the red ring!',1],
    lP3:['장갑차가 터진다 — 떨어져!','The APC is going to blow — get clear!',1],
    lP3l:['다들 일어나라… 아무도 두고 가지 않는다!','Get up, all of you… Nobody gets left behind!',2],
    lRally:['쓰러진 놈들을 다시 일으킨다! 끊어 — 집중 사격!','He is getting the fallen back up! Break it — focus fire!',1],
    lRallyX:['집결을 끊었다!','We broke it up!',1],
    lArty:['좌표… 내 위치. 쏴라!','Coordinates… my position. Fire!',2],
    lArtyT:['포격이다! 빨간 원 다 피해!','Shells incoming! Clear every red ring!',1],
    lBay:['총검 돌격이다!','Bayonet charge!',1],
    lDown:['쓰러졌다! 집중 사격!','He is down! Pour it on!',1],
    lEnr:['시간 끌면 안 돼 — 점점 거세진다!','We cannot drag this out — he is getting worse!',0],
    lFuel:['유조차가 터졌다!','The fuel bowser went up!',1],
    lDie:['…다들… 이제 쉬어도 된다.','…All of you… you can rest now.',2],
    dead:['레가투스 무력화. 1차 회수팀 대장, 확인했다.','LEGATUS is down. RT-1\'s leader, confirmed.',0],
    clear:['…송출기가 아직 돌아간다. 레가투스의 목소리가 녹음돼 반복되고 있었어 — 그런데 그 밑에 다른 신호가 깔려 있다. 더 북쪽이다.','…The transmitter is still running. LEGATUS\'s voice, recorded, on a loop — but there is another signal under it. From further north.',0],
    end0:['…북쪽으로 와라. 우리는 기다리고 있다.','…Come north. We are waiting.',3],
    end1:['역탐지 안 된다. 다리 너머, 봉쇄선 밖이다.','We cannot trace it. Beyond the bridge — outside the containment line.',0]}};

// ---------- hooks ----------
(function(){
  // riding: no physics of his own (the APC carries him); everybody else is pushed out of the APC (each page its own player, the host the rest)
  const ap=actorPhysics;actorPhysics=function(a,dt){if(a.lgRide&&a.alive&&EP.on&&EP.id===6)return;const r=ap(a,dt);
    if(EP.on&&EP.id===6&&APC.solid()&&(a===G.player||!NET.cli&&!a.net))APC.push(a);return r};
  // the troopers' charge order: 40 % faster for 6 s
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);return a.lgRushT>G.t&&EP.on&&EP.id===6?s*1.4:s};
  // the squad troopers that fall in this chapter (the rally gets them up)
  const kz=killZombie;killZombie=function(t,src,o){const was=t.alive;kz(t,src,o);if(was&&!NET.cli&&EP.on&&EP.id===6&&t.scen&&t.zc==='squad')LEGATUS.fallen.push({zc:'squad',x:t.c.x,y:t.c.y,z:t.c.z,t:G.t})};
  Object.assign(CLIH,{elg(L,m){LEGATUS.fxApply(m)}});
  Object.assign(HOSTH,{elgs(L,m){const a=actorOfKey(L.key);if(EP.on&&EP.id===6&&a&&a.alive&&a.team===TH)FUEL.hit(clamp(m.d|0,0,400))}});
})();

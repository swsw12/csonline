'use strict';
// ============ Chapter 10 「엘피스」 (season 2's finale): the boss ELPIS (RT1-02), the freight elevator down to B5, her AEDs, the UV
// banks, the gas, the flares, the Patient zombie ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, laser sights, enemy bullets, scripted leaps,
// shockwaves, ammo boxes — are in epbase.js; chapter 9's mines are borrowed from daedalus.js). Host-authoritative: the host runs her brain,
// the AEDs, the UV banks, the gas and the fire and decides every hit; clients get her gauges and the banks in the chapter snapshot
// (EP.pack → bsPack) and the moments as events ('e10').
// ELPIS, RT-1's medic, carried the suppressant and gave it to the others. The feeling it held down was hope: she could not give anyone up.
// She came back to Q-7 alone for the stock, found the vault empty, and has kept Q-7's infected "alive" in the B5 ward ever since. 28,000 ×
// (0.6 + 0.4 × humans) × difficulty health (expert 1.2, not the scenario's 1.4; her attacks there ×1.5, not ×1.73), her own brain
// (EPZ.elpis.ai).
//   phase 1 (100–65 %) 「응급 처치」 round her ward's beds, cover to cover: sedative darts (a green strip 26 m, .7 s: 24 and dazed — asleep
//            on the floor if already dazed), the AED (thrown onto a body killed cleanly in the last 12 s, within 20 m: 3.2 s later it shocks
//            the body back up, whole and faster, unless it is shot apart first), the defibrillator up close (a ring 3.6 m, .7 s: 24 and
//            knocked flat), anaesthetic gas (a canister: a pale green cloud 4 m for 7 s — 3.5 a second and slowed)
//   65 %     the dog tags (3.5 s, invulnerable)
//   phase 2 (65–30 %) 「기억」 she calls on the rest of RT-1 as if they were still with her, one after another, all six before any again:
//            07 ARGUS's laser (1.5 s, then 36 if she still sees you), 01 LEGATUS's artillery (a ring on each of the team, 1.8 s: 30 — once
//            each, however the rings overlap — and knocked flat), 06 CHARON's flare (a ring that burns 6 s: 9 a second), 04 DAEDALUS's mines (three), 03 LORELEI's song (2.6 s:
//            everyone in sight within 24 m pulled to her — crouch to hold — then the defibrillator), 05 LYREBIRD's fog (she slips away in
//            it); darts and AEDs between
//   30 %     the last vial of the stock, kept for 04, into her own neck (2.8 s, invulnerable)
//   phase 3 (30–0 %) 「마지막 한 병」 faster (×1.3): the lunge (a red strip 14 m, .8 s, then at 22 m/s: 30 and knocked flat; 1.2 s to get up,
//            ×1.3 taken), mass resuscitation every 20 s (a green shockwave — jump it: 14 — and up to three AEDs at once), a memory every 14 s
// The UV banks (the boss stage's devices): one for each quarter of the vault, the switch on the wall. Hold E 3 s: the quarter's tubes burn
// 10 s, then 20 s to cool. Caught in it as it lights, she is blinded (2.5 s, +40 stagger) and takes ×1.25 while she stays in it; the
// infected in it burn (10 % of their health a second) and nothing in it can be brought back up (a body, an AED). Stagger also: the IV pack
// on her back (×1.3), HE +10, frost +10; full gauge: down 6 s (×1.5). Every phase change is invulnerable and gets the team back up;
// enraged after 240 s (expert 180).
// The Patient zombie: Q-7's patients from the ward, still on her drips. It gets back up once (3 s later, at 45 %), unless it was finished
// with a headshot, a blast or fire (or inside a burning UV quarter).
// The AED (EPZ.aed, an actor that never moves, like chapter 9's sentry): 260 × difficulty.
const EL_PH=[1,.65,.3],EL_S=1.1;
const EL_POSE=['','aim','throw','shock','kneel','tags','call','vial','sing','lunge','down','blind','rec'];
const EL_MIX=[['patient',44],['rager',30],['runner',18],['scream',4],['bomber',4]];
const EL_MEM=['argus','legatus','charon','daedalus','lorelei','lyrebird'];
const EL_MEMI={argus:['RT1-07 · 아르고스','RT1-07 · ARGUS','r700'],legatus:['RT1-01 · 레가투스','RT1-01 · LEGATUS','lgRadioP'],charon:['RT1-06 · 카론','RT1-06 · CHARON','chFlareGun'],
  daedalus:['RT1-04 · 다이달로스','RT1-04 · DAEDALUS','daMine'],lorelei:['RT1-03 · 로렐라이','RT1-03 · LORELEI','lrMega'],lyrebird:['RT1-05 · 라이어버드','RT1-05 · LYREBIRD','lyPack']};
const elYaw=(dx,dz)=>Math.atan2(-dx,-dz),elAng=(a,b)=>wrapA(b-a);
const _elV=new THREE.Vector3(),_elV2=new THREE.Vector3(),_elV3=new THREE.Vector3(),_elM=new THREE.Matrix4(),_elC=new THREE.Color();
const on10=()=>EP.on&&EP.id===10;
// her own attacks on expert: ×1.5 (not the scenario's ×1.73 — EPD × .87), like her health (1.2, not 1.4)
const elK=()=>(G.diff||0)>=3?.87:1;
// a clean kill (it stays down): a headshot, a blast, fire (e10k: 1 headshot, 2 blast, 4 fire, 8 sterilized by UV, 16 its AED shot apart)
const elFire=o=>!!(o&&(o.fire||o.dot||o.w&&WPN[o.w]&&WPN[o.w].flame));

// ---------- atlas materials: the freight car's yellow steel and its dark floor plate, an AED's casing, the stock's green glow, a gas canister ----------
const EL_MATS=['elCage','elPlate','elAed','elGlow','elGas','elLedG'];
for(const m of EL_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintElAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the car: safety-yellow steel gone grubby, black chevrons along its edges, rivets
  patch('elCage',(xx,y,X,Y)=>{const t=nz(X,Y,10301,18);let c=t>.56?'#c8a01e':t>.4?'#b8901a':'#a88216';if(y%64<6)c=((xx+y)%20<10)?'#1a1a1a':'#d8b020';if(xx%32===4&&y%16===8)c='#6a5a2a';
    if(nz(X,Y,10302,8)>.7)c=mix(c,'#3a3020',.4);return c},243);
  patch('elPlate',(xx,y,X,Y)=>{let c=mix('#3a3e42','#464a4e',nz(X,Y,10311,12));if(((xx>>3)+(y>>3))%2===0&&xx%8>2&&xx%8<6&&y%8>1&&y%8<4)c='#5a5e62';if(nz(X,Y,10312,7)>.72)c=mix(c,'#5a2a1a',.3);return c},245);
  // an AED: lime-yellow casing, the black handle, the heart and bolt on its face
  patch('elAed',(xx,y,X,Y)=>{let c=mix('#c8d020','#d8e030',nz(X,Y,10321,14));const dx=xx-64,dy=y-60;if(Math.hypot(dx,dy)<22)c='#1a6a2a';if(Math.abs(dx+dy*.3)<4&&Math.abs(dy)<16)c='#f4f8e8';
    if(y>104)c='#1a1a1a';if(xx<4||y<4||xx>PS-5)c='#3a3e20';return c},244);
  patch('elGlow',(xx,y,X,Y)=>{const t=nz(X,Y,10331,10);return t>.6?'#c8ffd8':t>.4?'#5aff8a':'#2ad86a'},232);
  patch('elGas',(xx,y,X,Y)=>{let c=mix('#8aa890','#9ab8a0',nz(X,Y,10341,12));if(y>PS*.4&&y<PS*.55)c='#e8e8d8';if(y<10)c='#3a3e3a';return c},244);
  patch('elLedG',(xx,y)=>{const r=Math.hypot(xx-64,y-64);return r<20?'#f0fff4':r<44?'#7aff9a':'#1aff5a'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintElAtlas()}}

// ---------- the models (the weapon material) ----------
// the freight car: x across (±3), y up from its floor, z along the shaft (±5); open ends (its gates are elGate leaves the car slides),
// mesh sides, the crosshead and the ropes up into the dark
{const W=6,D=10,H=3.5,car=[Pt(0,-.08,0,W,.16,D,'elPlate'),
    ...[-1,1].flatMap(s=>[Pt(s*2.98,.08,0,.08,.16,D,'elCage'),Pt(s*2.98,H-.06,0,.1,.12,D,'elCage'),Pt(s*2.98,1.05,0,.06,.08,D,'elCage'),
      ...[-4.95,-2.5,0,2.5,4.95].map(z=>Pt(s*2.98,H/2,z,.12,H,.12,'elCage')),
      ...Array.from({length:21},(_,i)=>Pt(s*2.99,H/2,-5+i*.5,.025,H-.2,.025,'gunmetal'))]),
    ...[-1,1].flatMap(s=>[Pt(0,H-.06,s*4.95,W,.12,.12,'elCage'),Pt(0,.08,s*4.95,W,.16,.12,'elCage')]),
    Pt(0,H+.05,0,W,.06,D,'elPlate'),Pt(0,H+.35,0,1.4,.5,1.4,'gunmetal'),Pt(0,H-.12,0,1.2,.06,.3,'lgLamp'),
    ...[-.3,.3].map(x=>Pt(x,H+8,0,.05,15,.05,'gunmetal'))];
  Object.assign(GUNS,{
  elCar:{parts:car,grip:[0,0,0],muzzle:[0,0,0]},
  // a gate leaf (3 m of vertical bars between two rails, a hazard band on its bottom rail)
  elGate:{parts:[Pt(0,.1,0,3,.12,.06,'elCage'),Pt(0,2.1,0,3,.1,.06,'elCage'),...Array.from({length:10},(_,i)=>Pt(-1.38+i*.306,1.1,0,.04,2,.04,'gunmetal'))],grip:[0,0,0],muzzle:[0,0,0]},
  // her dart pistol (a CO2 gun, the cartridge under the barrel, an orange-tufted dart showing at the muzzle)
  elDart:{parts:[Pt(0,.02,-.1,.05,.07,.26,'blk2'),Pt(0,-.035,-.13,.03,.035,.18,'steel'),Pt(0,-.06,0,.045,.14,.06,'blk'),Pt(0,.02,-.25,.015,.015,.06,'orange'),Pt(0,.05,-.05,.02,.02,.08,'steel')],grip:[0,0,0],muzzle:[0,.02,-.28]},
  // a defibrillator paddle (the grip, the round plate)
  elPad:{parts:[Pt(0,0,-.04,.05,.05,.14,'blk2'),Pt(0,0,-.14,.12,.03,.12,'steel'),Pt(0,.02,-.04,.02,.012,.04,'red')],grip:[0,0,0],muzzle:[0,0,0]},
  // the AED she throws on a body: the casing, its handle, its screen, the two pads on their leads
  elAed:{parts:[Pt(0,.09,0,.34,.18,.26,'elAed'),Pt(0,.2,0,.2,.04,.04,'blk'),Pt(.06,.185,.05,.12,.01,.08,'elLedG'),Pt(-.3,.01,.12,.14,.02,.1,'white'),Pt(-.32,.01,-.1,.14,.02,.1,'white'),
    Pt(-.16,.02,.08,.2,.015,.015,'blk2',{ry:.4}),Pt(-.17,.02,-.06,.2,.015,.015,'blk2',{ry:-.3})],grip:[0,0,0],muzzle:[0,0,0]},
  // the IV bag on her pack (glowing with the stock), the dog tags on their chain, the last vial in its injector, a gas canister
  elBag:{parts:[Pt(0,0,0,.14,.22,.05,'elGlow'),Pt(0,.13,0,.03,.04,.03,'white'),Pt(0,-.14,0,.012,.08,.012,'white')],grip:[0,0,0],muzzle:[0,0,0]},
  elTags:{parts:[Pt(0,0,0,.04,.06,.004,'steel'),Pt(.02,-.02,.004,.04,.06,.004,'steel',{rz:.4}),Pt(-.02,-.03,-.004,.04,.06,.004,'steel',{rz:-.3}),Pt(0,.06,0,.006,.08,.006,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
  elTag:{parts:[Pt(0,0,0,.03,.004,.05,'steel'),Pt(0,.003,-.035,.012,.002,.02,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
  elVial:{parts:[Pt(0,0,-.05,.04,.04,.12,'white'),Pt(0,0,-.08,.03,.03,.07,'elGlow'),Pt(0,0,-.14,.006,.006,.05,'steel'),Pt(0,0,.03,.05,.012,.012,'blk2')],grip:[0,0,0],muzzle:[0,0,-.17]},
  elCan:{parts:[Pt(0,0,0,.08,.2,.08,'elGas',{r:.015}),Pt(0,.12,0,.04,.04,.04,'steel')],grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: the dart pistol, the defibrillator charging and firing, the UV tubes striking, the sterilization klaxon ----------
Object.assign(SFX,{
  eldart:{n:3,dur:.35,ch:2,peak:.8,gain:.7,rev:.12,poly:6,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.002,1,.06,out);B.nz('white',0,.08,B.f('bandpass',3400+v*300,1.4,e))}
    {const e=B.env(0,.004,.5,.12,out);B.nz('pink',0,.16,B.f('highpass',1800,.8,e))}{const e=B.env(.002,.002,.6,.03,out);B.osc('square',900,300,0,.05,e)}}},
  elshock:{n:2,dur:1.3,ch:2,peak:.9,gain:.85,rev:.2,poly:3,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.5,.45,.05,out,.6);B.osc('sine',600,2600,0,.66,e)}
    {const e=B.env(.66,.003,1,.25,out);B.nz('white',.66,.3,B.f('bandpass',1800,.8,e));B.osc('sine',90,40,.66,.4,e)}for(let i=0;i<14;i++)B.grain(.66+Math.random()*.2,rr(2000,7000),rr(8,14),rr(.004,.01),rr(.3,.6),B.pan(rr(-.5,.5),out))}},
  eluv:{n:1,dur:1.6,ch:2,peak:.8,gain:.7,rev:.25,poly:2,fn:B=>{const out=B.g(.9);for(const t of [0,.12,.3]){const e=B.env(t,.002,.8,.06,out);B.nz('white',t,.07,B.f('bandpass',2600,1.2,e))}
    {const e=B.env(.3,.2,.4,.6,out,.5);B.osc('sawtooth',120,120,.3,1.2,B.f('bandpass',480,3,e));B.osc('sine',240,240,.3,1.2,e)}}},
  elklax:{n:1,dur:2.4,ch:2,peak:.9,gain:.85,rev:.3,poly:2,fn:B=>{const out=B.sh(1.4,B.g(.9));for(let k=0;k<4;k++){const t=k*.55,f=k%2?520:700,e=B.env(t,.02,1,.08,out,.4);for(const [ty,m] of [['square',1],['sawtooth',1.5]])B.osc(ty,f*m,f*m,t,.5,B.f('lowpass',2400,.8,B.g(m>1?.3:1,e)))}}}});
SFX_ORDER.push('eldart','elshock','eluv','elklax');

// ---------- the freight elevator (every page) ----------
// At the top landing until the team boards (stages 1–2), down the shaft in the ride (24 s: 9.5 s down to B3, the power cut there 3.5 s,
// on down to B5), at the bottom after; up again in the ending. Its floor at the top landing is a map box (taken away while the car is not
// there); its cage, roof, gates and moving floor are boxes of its own that ride with it, and whoever is inside is carried along — every page
// its own player, the host its bots too; the rest are drawn where the car is (netPuppet's hook).
const _e10p=[0,0,0];
const E10CAR={g:null,mat:null,gates:[],lamp:null,boxes:[],mode:'',t:0,y:30,v:0,dk:[1,0],sw:0,swV:0,pT:0,fxS:0,RIDE:24,UP:15,
  SLOTS:[[-1.8,-2.6],[0,-2.6],[1.8,-2.6],[-1.8,0],[0,0],[1.8,0],[-1.8,2.6],[1.8,2.6]],
  C(){return MAP.ez&&MAP.ez.car},
  // how far down the shaft at ride time t (0 at the top, 30 at B5)
  sAt(t){if(t<1.5)return 0;if(t<9.5){const u=t-1.5,v1=17/7;return u<2?v1*u*u/4:Math.min(17,v1*(u-1))}if(t<13)return 17;const u=clamp((t-13)/9,0,1);return 17+13*u*u*(3-2*u)},
  // (and on the way up in the ending: 30 at B5, 0 at the top)
  sUp(t){const u=clamp((t-1.4)/12,0,1);return 30*(1-u*u*(3-2*u))},
  want(){if(!on10()||!this.C())return '';if(this.mode==='up')return 'up';if(EP.ph==='ride')return 'ride';return EP.st<=2?'top':'bot'},
  slot(i){return this.SLOTS[i%this.SLOTS.length]},
  inside(h,pad){pad=pad||0;const c=h.c;return Math.abs(c.x)<2.9+pad&&Math.abs(c.z-51)<4.9+pad&&c.y>this.y-.6&&c.y<this.y+2.6},
  update(dt){const M=this.want();if(!M){if(this.g&&this.g.visible)this.hide();return}if(!this.g)this.build();this.g.visible=true;if(M!==this.mode)this.enter(M);
    let y=this.y;if(M==='ride'){this.t+=dt;if(NET.cli&&EP.t>0){const tt=this.RIDE-EP.t;if(Math.abs(tt-this.t)>.8)this.t=tt}y=30-this.sAt(this.t)}
    else if(M==='up'){this.t+=dt;y=30-this.sUp(this.t)}else y=M==='top'?30:0;
    // the gates: the landing's side open at a landing, both shut on the way (dk: south, north; 1 open)
    const want=M==='top'?[1,0]:M==='bot'?[0,1]:M==='ride'?(this.t>22.2?[0,1]:[0,0]):this.t>14.2?[1,0]:[0,0];for(let i=0;i<2;i++)this.dk[i]=approach(this.dk[i],want[i],dt*.9);
    this.move(y,dt);this.fx(dt,M)},
  enter(M){this.mode=M;this.fxS=0;this.t=M==='ride'&&NET.cli&&EP.t>0&&EP.t<this.RIDE-.5?this.RIDE-EP.t:0;this.y=M==='bot'?0:M==='up'?0:30;
    // (the top landing's floor box is there only while the car is)
    const C=this.C();if(C&&C.topBox)C.topBox.nosolid=M!=='top';this.dynOn()},
  depart(){if(!this.C())return;this.enter('up')},
  move(y,dt){const dy=y-this.y;if(dy)this.carry(dy);this.y=y;this.place();
    const v=dy/Math.max(dt,1e-3),acc=clamp((v-this.v)/Math.max(dt,1e-3),-30,30);this.v=v;this.swV+=(acc*.004-this.sw*7)*dt;this.swV*=Math.exp(-dt*1.4);this.sw=clamp(this.sw+this.swV*dt,-.05,.05);this.pose()},
  // everyone this page moves itself, inside the car: along with it
  carry(dy){const y=this.y;for(const a of G.actors){if(!a.alive||a.pup)continue;const c=a.c;if(Math.abs(c.x)<3.1&&Math.abs(c.z-51)<5.1&&c.y>y-.8&&c.y<y+2.8)c.y+=dy}},
  // (another page's player or bot riding: drawn in the car where this page has it)
  pup(a){const c=a.c;if(Math.abs(c.x)>3.4||Math.abs(c.z-51)>5.4)return;const ly=c.y-this.y;if(ly<-3||ly>4)return;c.y=this.y+clamp(ly,0,1.2);c.onGround=ly<.2},
  dynOn(){if(!this.boxes.length){const add=(x0,y0,z0,x1,y1,z1,o,g)=>this.boxes.push({l:[x0,y0,z0,x1,y1,z1],x0,y0,z0,x1,y1,z1,mat:'metalx',g:g==null?-1:g,o:Object.assign({e10car:1},o||{})});
      add(-3,-.2,46,3,0,56);add(-3.1,0,46,-3,3.4,56,{pass:1});add(3,0,46,3.1,3.4,56,{pass:1});add(-3.1,3.4,46,3.1,3.55,56);
      add(-3,0,55.92,3,2.2,56,{pass:1},0);add(-3,0,46,3,2.2,46.08,{pass:1},1)}
    this.place()},
  dynOff(){for(const b of this.boxes)worldRemoveDyn(b)},
  place(){const y=this.y;for(const b of this.boxes){worldRemoveDyn(b);if(b.g>=0&&this.dk[b.g]>.5)continue;const L=b.l;b.x0=L[0];b.y0=y+L[1];b.z0=L[2];b.x1=L[3];b.y1=y+L[4];b.z1=L[5];worldAddDyn(b)}},
  build(){const g=new THREE.Group(),mat=matGun();this.mat=mat;const body=new THREE.Mesh(gunGeo('elCar'),mat);body.frustumCulled=false;g.add(body);
    this.gates=[];for(const s of [0,1])for(const h of [-1,1]){const m=new THREE.Mesh(gunGeo('elGate'),mat);m.frustumCulled=false;g.add(m);this.gates.push({m,s,h})}
    R.scene.add(g);this.g=g},
  pose(){const g=this.g;if(!g)return;g.position.set(0,this.y,51);g.rotation.set(this.sw,0,this.sw*.4);
    for(const G0 of this.gates){const o=smooth(this.dk[G0.s]);G0.m.position.set(G0.h*(1.5+1.35*o),0,G0.s?-4.96:4.96)}
    this.pT-=.016;if(this.pT<=0){this.pT=.25;sampleProbe(0,this.y+1.4,51,this.mat.uniforms.uProbe.value)}},
  // the ride's moments on every page: the gates and the bell, the motor, the floors going by, the cut at B3 and its red light, the landing
  fx(dt,M){const L=this.lamp||(this.lamp=DL.add(0,this.y+3.1,51,'#f4e2c4',8,1,0));L.y=this.y+3.1;const P=G.player,inP=!!(P&&P.alive&&this.inside(P,.3));
    if(M!=='ride'&&M!=='up'){L.c.set('#f4e2c4');L.i=.9;return}
    const t=this.t,once=(b,f)=>{if(!(this.fxS&b)){this.fxS|=b;f()}};
    if(t>.2)once(1,()=>{AU.at('dachime',0,this.y+2,51,{vol:.9,range:40,rate:.85});AU.at('rack',0,this.y+1,51,{vol:.6,range:20,rate:.6})});
    if(t>1.5)once(2,()=>{AU.at('powerup',0,this.y+4,51,{vol:.7,range:60,rate:.5});if(inP)FX.shake=Math.max(FX.shake,.3)});
    if(M==='ride'){
      if(t>9.5)once(4,()=>{AU.play('blackout',{vol:.9});AU.at('land',0,this.y+3,51,{vol:.9,range:30,rate:.45});this.swV+=.6;if(inP)FX.shake=Math.max(FX.shake,1.1);
        for(let i=0;i<24;i++)FX.spawn({x:rr(-2.6,2.6),y:this.y+3.5,z:51+rr(-4,4),vx:rr(-2,2),vy:rr(-1,1),vz:rr(-2,2),life:rr(.2,.6),s0:.05,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1})});
      if(t>10.6)once(8,()=>{for(let k=0;k<3;k++)SCEN.later(k*.45,()=>AU.at('land',rr(-2,2),this.y+3.6,51+rr(-3,3),{vol:.7,range:16,rate:rr(.7,.9)}))});
      if(t>13)once(16,()=>{AU.at('powerup',0,this.y+4,51,{vol:.8,range:60,rate:.62});if(inP)FX.shake=Math.max(FX.shake,.5)});
      if(t>22)once(32,()=>{AU.at('land',0,this.y+.5,51,{vol:.8,range:30,rate:.6});AU.at('dachime',0,this.y+2,51,{vol:.8,range:40,rate:.85})});
      const dark=t>9.5&&t<13;L.c.set(dark?'#ff2a14':t>13?'#ffc890':'#f4e2c4');L.i=dark?(Math.random()<.25?.05:.7):.95;
      // (the floors going by: a landing's lip passes the car every 6 m)
      const fl=Math.floor((30-this.y)/6);if(fl!==this.lastFl){this.lastFl=fl;if(t>2&&fl>0&&fl<5)AU.at('land',0,this.y+.3,51,{vol:.35,range:14,rate:1.4})}}
    else{if(t>.3)once(64,()=>AU.at('dachime',0,this.y+2,51,{vol:.8,range:50,rate:.9}));L.c.set('#ffd8a0');L.i=.9}
    if(inP&&Math.abs(this.v)>.4)FX.shake=Math.max(FX.shake,.05+.03*Math.sin(G.t*13))},
  hide(){if(this.g)this.g.visible=false;this.dynOff();if(this.lamp){this.lamp.dead=true;this.lamp=null}this.mode='';const C=this.C();if(C&&C.topBox)C.topBox.nosolid=false},
  clear(){this.hide();this.t=0;this.y=30;this.v=0;this.sw=this.swV=0;this.dk=[1,0];this.boxes=[]}};

// ---------- gas (her canisters, a Hazmat's tank burst here): a pale green cloud that slows and hurts whoever is in it ----------
const ELGAS={L:[],id:0,
  add(x,y,z,r,life,dps,id,remote){const S={id:id||++this.id,x,y,z,r,life,dps,t:0};this.L.push(S);S.sm=ESMK.add(x,y,z,r,life,true,[.6,.78,.62]);AU.at('hiss',x,y+.5,z,{vol:.9,range:40,rate:.8});
    if(NET.host&&!remote)ELP.fxSend({k:'gs',id:S.id,x:r2(x),y:r2(y),z:r2(z),r:r2(r),l:r2(life),d:dps});return S},
  in(h,m){for(const S of this.L)if(S.t<S.life&&Math.hypot(h.c.x-S.x,h.c.z-S.z)<S.r*.9+(m||0)&&Math.abs(h.c.y-S.y)<3)return S;return null},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const S=this.L[i];S.t+=dt;if(S.t>S.life+.5){this.L.splice(i,1);continue}if(NET.cli||S.t>S.life)continue;
      S.tk=(S.tk||0)-dt;if(S.tk>0)continue;S.tk=.5;for(const h of SCEN.H){if(!h.alive||(h.elGT||0)>G.t||Math.hypot(h.c.x-S.x,h.c.z-S.z)>S.r*.9||Math.abs(h.c.y-S.y)>3)continue;h.elGT=G.t+.45;hurtHuman(h,EPD(S.dps*.5*elK()),null,{});h.elSlowT=G.t+.7;if(Math.random()<.3)epFx(h,'dz',.5)}}},
  clear(){this.L=[]}};

// ---------- fire (06's flare, the incinerator's vents in the escape): a patch that burns whoever stands in it — the infected too ----------
// {k:'c', x,y,z, r} or {k:'r', x,y,z, yaw, w, l}; t counts up to life; dps; jet: a vent's sheet of fire up out of its grate
const ELFIRE={L:[],id:0,
  add(o,remote){const F=Object.assign({id:++this.id,t:0},o);this.L.push(F);F.lt=DL.add(F.k==='c'?F.x:F.x-Math.sin(F.yaw)*F.l/2,F.y+1,F.k==='c'?F.z:F.z-Math.cos(F.yaw)*F.l/2,'#ff8a3a',F.k==='c'?F.r*3:F.l*.8,1.8,0,{flick:.4});
    AU.at('salgust',F.x,F.y+1,F.z,{vol:.8,range:50,rate:1.6});if(F.jet)this.burst(F);
    if(NET.host&&!remote)ELP.fxSend({k:'fi',o:{k:o.k,x:r2(o.x),y:r2(o.y),z:r2(o.z),r:r2(o.r||0),yaw:r3(o.yaw||0),w:r2(o.w||0),l:r2(o.l||0),life:r2(o.life),dps:o.dps,zb:o.zb?1:0,j:o.jet?1:0}});return F},
  // a point on the patch (u 0–1 along it, s −.5–.5 across)
  pt(F,u,s){if(F.k==='c'){const a=u*TAU,d=Math.sqrt(Math.abs(s)*2)*F.r;return [F.x+Math.cos(a)*d,F.z+Math.sin(a)*d]}const al=u*F.l,sd=s*F.w;return [F.x-Math.sin(F.yaw)*al+Math.cos(F.yaw)*sd,F.z-Math.cos(F.yaw)*al-Math.sin(F.yaw)*sd]},
  // (a vent catching: the whoosh, a wall of flame up out of the grate and its smoke)
  burst(F){const n=Math.min(90,Math.round(F.l*F.w*2.2));AU.at('explode',F.x-Math.sin(F.yaw)*F.l/2,F.y+.5,F.z-Math.cos(F.yaw)*F.l/2,{vol:.5,range:40,rate:1.7});
    for(let k=0;k<n;k++){const p=this.pt(F,Math.random(),rr(-.5,.5));FX.spawn({x:p[0],y:F.y+.1,z:p[1],vx:rr(-.6,.6),vy:rr(4,7.5),vz:rr(-.6,.6),life:rr(.4,.8),s0:rr(.5,.8),s1:rr(.12,.25),r:1,g:rr(.4,.65),b:.15,f:11,drag:1.2,add:1})}
    for(let k=0;k<n/3;k++){const p=this.pt(F,Math.random(),rr(-.4,.4));FX.spawn({x:p[0],y:F.y+1.4,z:p[1],vx:rr(-.4,.4),vy:rr(1.5,3),vz:rr(-.4,.4),life:rr(1,1.8),s0:.5,s1:1.6,r:.2,g:.19,b:.18,a:.55,f:2,drag:1.4})}},
  inF(F,x,y,z,m){m=m||0;if(Math.abs(y-F.y)>2.2)return false;if(F.k==='c')return Math.hypot(x-F.x,z-F.z)<F.r+m;const fx=-Math.sin(F.yaw),fz=-Math.cos(F.yaw),rx=Math.cos(F.yaw),rz=-Math.sin(F.yaw),dx=x-F.x,dz=z-F.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;return al>-m&&al<F.l+m&&Math.abs(sd)<F.w/2+m},
  at(x,y,z,m){for(const F of this.L)if(F.t<F.life&&this.inF(F,x,y,z,m))return F;return null},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const F=this.L[i];F.t+=dt;if(F.t>F.life){if(F.lt)F.lt.dead=true;this.L.splice(i,1);continue}
      // the flames: tongues over the patch (a vent's: a tall sheet, thinning as it dies down)
      const J=F.jet,fade=J?clamp((F.life-F.t)/.6,.25,1):1,n=(F.k==='c'?F.r*F.r*.8:Math.min(40,F.l*F.w*(J?1.1:.25)))*fade;
      for(let k=0;k<n;k++)if(Math.random()<dt*9){const p=this.pt(F,Math.random(),rr(-.5,.5));
        FX.spawn(J?{x:p[0],y:F.y+.1,z:p[1],vx:rr(-.4,.4),vy:rr(2.8,5.2),vz:rr(-.4,.4),life:rr(.35,.65),s0:rr(.38,.62),s1:rr(.08,.18),r:1,g:rr(.42,.68),b:.16,f:11,drag:.6,add:1}
          :{x:p[0],y:F.y+.1,z:p[1],vx:rr(-.3,.3),vy:rr(1.5,3.2),vz:rr(-.3,.3),life:rr(.35,.7),s0:rr(.25,.45),s1:rr(.05,.15),r:1,g:rr(.45,.7),b:.18,f:11,add:1})}
      if(J){if(Math.random()<dt*6){const p=this.pt(F,Math.random(),rr(-.3,.3));FX.spawn({x:p[0],y:F.y+2,z:p[1],vx:rr(-.3,.3),vy:rr(1,2),vz:rr(-.3,.3),life:rr(1,1.6),s0:.5,s1:1.4,r:.18,g:.17,b:.16,a:.45,f:2,drag:1.2})}
        for(let k=0;k<Math.min(10,F.l*.8)*fade;k++)if(Math.random()<dt*9){const p=this.pt(F,Math.random(),rr(-.3,.3));FX.spawn({x:p[0],y:F.y+.3,z:p[1],vy:rr(.4,1.2),life:rr(.25,.45),s0:rr(1,1.5),s1:rr(.5,.8),r:1,g:.45,b:.12,a:.45,f:1,add:1})}}
      if(F.lt)F.lt.i=1.4+Math.random()*.8;if(NET.cli)continue;F.tk=(F.tk||0)-dt;if(F.tk>0)continue;F.tk=.25;
      // (one patch at a time: where two overlap, the one that ticks first)
      for(const h of SCEN.H){if(!h.alive||(h.elFT||0)>G.t||!this.inF(F,h.c.x,h.c.y,h.c.z))continue;h.elFT=G.t+.2;hurtHuman(h,EPD(F.dps*.25*elK()),null,{});h.burnT=Math.max(h.burnT||0,.6)}
      if(F.zb)for(const z of SCEN.Z){if(!z.alive||z.boss||z.zc==='aed'||!this.inF(F,z.c.x,z.c.y,z.c.z))continue;damageActor(z,z.maxHp*.07,null,{w:'fire',fire:1,dir:[0,1,0],kb:0,stag:0,x:z.c.x,y:z.c.y+1,z:z.c.z})}}},
  clear(){for(const F of this.L)if(F.lt)F.lt.dead=true;this.L=[]}};

// ---------- the UV banks (the boss stage's devices): hold E 3 s at a quarter's switch → its tubes burn 10 s; then 20 s to cool ----------
// st 0 ready, 1 burning, 2 cooling; p the hold so far, t the time left. The host runs them; the boss snapshot carries them to the clients.
const ELUV={L:[],T:3,ON:10,CD:20,
  build(){this.clear();this.L=(MAP.ez&&MAP.ez.uv||[]).map(U=>Object.assign({st:0,p:0,t:0,lts:[],ov:null},U))},
  near(U,h){return Math.abs(h.c.y-U.sy)<1.8&&Math.hypot(h.c.x-U.bx,h.c.z-U.bz)<1.6},
  inSec(U,x,z){const s=U.sec;return x>=s[0]&&x<=s[2]&&z>=s[1]&&z<=s[3]},
  lit(x,z){for(const U of this.L)if(U.st===1&&this.inSec(U,x,z))return U;return null},
  secOf(x,z){for(const U of this.L)if(this.inSec(U,x,z))return U;return null},
  hostTick(dt){for(const U of this.L){if(U.st===1){U.t-=dt;this.burn(U,dt);if(U.t<=0){U.st=2;U.t=this.CD;ELP.fx({k:'uvx',i:U.i})}continue}
      if(U.st===2){U.t-=dt;if(U.t<=0){U.st=0;U.t=0}continue}
      let h=0;for(const a of SCEN.H)if(a.alive&&a.epUse===100+U.i&&G.t>=(a.useBlk||0)&&this.near(U,a))h++;
      if(h){U.p=Math.min(this.T,U.p+dt*(h>1?1.25:1));if(U.p>=this.T){U.st=1;U.t=this.ON;U.p=0;ELP.uvOn(U)}}else U.p=Math.max(0,U.p-dt*.5)}},
  // (host) the infected in it burn — clean: they stay down; the bodies in it can never be brought up again
  burn(U,dt){U.bk=(U.bk||0)-dt;if(U.bk>0)return;U.bk=.25;for(const z of SCEN.Z){if(!this.inSec(U,z.c.x,z.c.z)||z.c.y>7)continue;
      if(!z.alive){if(z.scen&&z.c.y>-50)z.e10k=(z.e10k|0)|8;continue}if(z.boss)continue;damageActor(z,z.maxHp*(z.zc==='aed'?.12:.025),null,{w:'uv',fire:1,dir:[0,1,0],kb:0,stag:0,x:z.c.x,y:z.c.y+1,z:z.c.z})}},
  pack(){return this.L.map(U=>[U.st,Math.round(U.p*10),Math.round(U.t)])},
  sync(A){if(!Array.isArray(A))return;A.forEach((q,i)=>{const U=this.L[i];if(U&&Array.isArray(q)){const was=U.st;U.st=q[0]|0;U.p=(q[1]|0)/10;U.t=q[2]|0;if(was!==1&&U.st===1)this.fxOn(U)}})},
  // every page: a burning quarter's violet glare (lights under its tubes, a sheet of violet over its floor), the hum
  fxOn(U){AU.at('eluv',(U.sec[0]+U.sec[2])/2,10,(U.sec[1]+U.sec[3])/2,{vol:1,range:90,occ:false})},
  update(dt){for(const U of this.L){const on=U.st===1,cx=(U.sec[0]+U.sec[2])/2,cz=(U.sec[1]+U.sec[3])/2;
      if(on&&!U.lts.length)for(const [dx,dz] of [[-5,-5],[5,-5],[-5,5],[5,5]])U.lts.push(DL.add(cx+dx,10.6,cz+dz,'#a46aff',15,2.2,0,{flick:.12}));
      if(!on&&U.lts.length){for(const L of U.lts)L.dead=true;U.lts=[]}
      if(on&&!U.ov){const w=U.sec[2]-U.sec[0],d=U.sec[3]-U.sec[1],m=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x9a5aff,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}));
        m.position.set(cx,.06,cz);m.renderOrder=3;m.frustumCulled=false;R.scene.add(m);U.ov=m}
      if(U.ov){U.ov.visible=on;if(on)U.ov.material.opacity=.13+.05*Math.sin(G.t*30)}
      if(on&&Math.random()<dt*14)FX.spawn({x:rr(U.sec[0],U.sec[2]),y:rr(.2,3),z:rr(U.sec[1],U.sec[3]),vy:rr(.2,.8),life:rr(.3,.7),s0:.06,s1:.02,r:.75,g:.5,b:1,f:0,add:1})}},
  clear(){for(const U of this.L){for(const L of U.lts)L.dead=true;if(U.ov){R.scene.remove(U.ov);U.ov.geometry.dispose();U.ov.material.dispose()}}this.L=[]}};

// ---------- thrown things in flight (every page): an AED arcing onto a body, a gas canister, the flare's shell ----------
const ELTHROW={L:[],
  add(k,x,y,z,tx,ty,tz,T,done){const m=new THREE.Mesh(gunGeo(k==='gas'?'elCan':'elAed'),matGun());m.position.set(x,y,z);m.frustumCulled=false;R.scene.add(m);
    this.L.push({k,m,x0:x,y0:y,z0:z,x:tx,y:ty,z:tz,T:Math.max(.2,T),t:0,done})},
  update(dt){for(let i=this.L.length-1;i>=0;i--){const Q=this.L[i];Q.t+=dt;const u=Math.min(1,Q.t/Q.T),m=Q.m;m.position.set(lerp(Q.x0,Q.x,u),lerp(Q.y0,Q.y,u)+3.6*u*(1-u),lerp(Q.z0,Q.z,u));m.rotation.y+=dt*8;m.rotation.x=Math.sin(Q.t*9)*.5;
      sampleProbe(m.position.x,m.position.y,m.position.z,m.material.uniforms.uProbe.value);if(u>=1){R.scene.remove(m);m.material.dispose();this.L.splice(i,1);if(Q.done)Q.done()}}},
  clear(){for(const Q of this.L){R.scene.remove(Q.m);Q.m.material.dispose()}this.L=[]}};

// ---------- the AEDs (EPZ.aed: actors that never move; the host runs their timers) ----------
const ELAED={next:null,
  hpFor(){return Math.round(260*SC_DIFF.hp[G.diff||0])},
  list(){return SCEN.Z.filter(a=>a.alive&&a.zc==='aed')},
  // a body fit to be brought back: died lately (≤ 12 s), not cleanly, not already being brought back, not in a burning quarter
  ok(z){return !z.alive&&z.scen&&!z.boss&&z.zc!=='aed'&&z.zc!=='elpis'&&z.c.y>-50&&z.deadT<12&&z.an.dead>0&&!(z.e10k&31)&&!z.elHold&&!z.ptUp&&!ELUV.lit(z.c.x,z.c.z)},
  // the bodies she can reach from where she stands, nearest first
  bodies(a,r,n){const e=ELP.gun(a),L=[];for(const z of SCEN.Z){if(!this.ok(z))continue;const d=Math.hypot(z.c.x-a.c.x,z.c.z-a.c.z);if(d>r||Math.abs(z.c.y-a.c.y)>4)continue;
      if(!losClear(e.x,e.y,e.z,z.c.x,z.c.y+.4,z.c.z))continue;L.push([z,d])}L.sort((p,q)=>p[1]-q[1]);return L.slice(0,n).map(p=>p[0])},
  // throw one onto a body: it flies, lands beside it and starts charging (the host spawns the AED; every page draws the throw)
  throw(a,z){z.elHold=1;const g=ELP.gun(a),tx=z.c.x+rr(-.4,.4),tz=z.c.z+rr(-.4,.4),ty=z.c.y,T=clamp(Math.hypot(tx-g.x,tz-g.z)/22,.35,.8);
    ELP.fx({k:'at',a:[r2(g.x),r2(g.y),r2(g.z),r2(tx),r2(ty),r2(tz)],T:r2(T)});EP.later(T,()=>{if(!on10()||!a.alive){z.elHold=0;return}this.land(z,tx,ty,tz)})},
  land(z,x,y,zz){if(z.alive||z.c.y<-50){z.elHold=0;return}this.next=z.id;const n=navSnap(x,y,zz,1)||{x,y,z:zz},p=[n.x,n.y+.02,n.z];const a=SCEN.spawn('aed',p);this.next=null;
    if(!a){z.elHold=0;return}a.yaw=elYaw(z.c.x-p[0],z.c.z-p[2]);a.c.vx=a.c.vz=0;ELP.fxSend({k:'al',i:a.id,z:z.id,y:r3(a.yaw)})},
  // its timer (host): the body bounced in time with its beeps; at the end the shock — the body gets up
  ai(a,dt){const S=a.ae;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=false;a.staggerT=0;a.frozen=0;a.c.vx=a.c.vz=0;a.kvx=a.kvz=0;
    const z=byIdAny(S.tg);if(!z||z.alive||z.c.y<-50||(z.e10k&31)){this.fizzle(a,z);return true}
    if(ELUV.lit(a.c.x,a.c.z)){z.e10k=(z.e10k|0)|8;this.fizzle(a,z);return true}
    S.t-=dt;if(S.t>0)return true;ELP.rise(z,true);ELP.fx({k:'az',i:a.id,z:z.id});EP.despawn(a);return true},
  fizzle(a,z){if(z)z.elHold=0;ELP.fx({k:'ax',i:a.id});EP.despawn(a)},
  // every page: the unit on the floor, the leads to the body, its light beating faster as it charges
  rigX(){const mat=matGun(),m=new THREE.Mesh(gunGeo('elAed'),mat);m.frustumCulled=false;R.scene.add(m);
    const lead=new THREE.Mesh(new THREE.BoxGeometry(1,1,1).translate(0,0,.5),new THREE.MeshBasicMaterial({color:0x1a1a1a}));lead.frustumCulled=false;R.scene.add(lead);return {m,lead,mat,pT:0,beep:0}}};

// ---------- ELPIS ----------
const ELP={cur:null,said:{},sayT:{},encNext:false,dutyT:0,dutyD:null,ammoT:null,escT:0,ventT:0,vaultT:0,
  zc:'elpis',name:['엘피스','ELPIS'],code:'RT1-02',ticks:[65,30],
  wake:['엘피스가 기다린다 —','ELPIS is waiting —'],goText:['엘피스의 병동','ELPIS\'S WARD'],deadText:['엘피스 무력화','ELPIS IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(28000*(.6+.4*H)*(d>=3?1.2:SC_DIFF.hp[d]))},
  isEnc(a){return !!(a.el&&a.el.enc)},
  fx(m){this.fxApply(m);if(NET.host)netEv('e10',m)},
  fxSend(m){if(NET.host)netEv('e10',m)},
  sayOnce(k){if(this.said[k])return;this.said[k]=1;EP.say(k)},
  sayEvery(k,t){if(G.t-(this.sayT[k]||-99)<t)return;this.sayT[k]=G.t;EP.say(k)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: by RT-1's table, kneeling (a replay starts the phase it reached)
  prepSpawn(kind,bp){let b=EP.bossA();const p=MAP.ez.eEnter;if(!b)b=this.spawn(p,0,false);else if(kind!=='phase'){this.init(b,false);placeAt(b,p[0],p[1],p[2],0)}if(!b)return;
    if(kind==='phase')this.reset(b,bp);b.el.idle=true;b.elPose=b.el.ph===1?'kneel':''},
  go(b){const S=b.el;if(!S)return;S.idle=false;S.pt=1;Object.assign(S.cd,{dart:3,aed:5,shock:2,gas:9,mem:3,lunge:3,mass:6});this.ammoT=10;b.elPose=''},
  // the first meeting (stage 3): out of the ward onto the nurses' station; back into the ward when she has had enough
  meetStart(E){const M=MAP.ez.meet,a=this.spawn(M.p,M.yaw,true);if(!a)return;E.a=a;const S=a.el;S.idle=false;Object.assign(S.cd,{dart:4,aed:3,shock:2});
    // (the ward's doors stay open from here on, and the infected come out of the ward too)
    EP.setGates(EP.gm|EP.bit('gW'));SCEN.zsp=MAP.ez.zones.C.zsp.concat(MAP.ez.zW);this.fx({k:'meet',i:a.id});EP.say('enc');EP.later(3,()=>EP.say('enc2'));EP.later(6.5,()=>EP.say('eMeet'))},
  meetTick(E,dt){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.el)this.retreat(E.a)},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='elpis';a.deadT=99;this.encNext=!!enc;reviveZombie(a,[p[0],p[1],p[2]]);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){a.el={ph:1,mode:'',mt:0,pt:1,enc:!!enc,idle:!enc,invT:0,enr:false,fightT:0,grog:0,grogN:0,grogMax:100,slowT:0,dmgW:0,dmgWT:0,encT:0,downQ:0,uvIn:0,
      cov:null,covT:0,goT:0,tg:null,memQ:[],mm:null,dt:null,sh:null,ln:null,sg:null,
      cd:{dart:4,aed:6,shock:2,gas:10,mem:4,lunge:4,mass:8}};
    a.elPose='';a.epDown=0;a.kin=null;a.epHide=false},
  // a replay of the boss fight starts the phase it reached again, at that phase's health
  reset(a,ph){a.hp=a.maxHp*EL_PH[ph-1];this.init(a,false);const S=a.el;S.ph=ph;S.idle=true;a.frozen=0;a.kvx=a.kvz=0;this.ammoT=6;const p=MAP.ez.eEnter;placeAt(a,p[0],p[1],p[2],0)},
  // ---------- small helpers ----------
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=elYaw(x-a.c.x,z-a.c.z)},
  cen(){let x=0,z=0,y=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;y+=h.c.y;n++}return n?[x/n,y/n,z/n]:[0,0,-20]},
  nearH(a,r,dy){let b=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<(dy||1.6)){bd=d;b=h}}return b},
  gun(a,out){out=out||_elV2;return out.set(a.c.x-Math.sin(a.yaw)*.4,a.c.y+1.5*EL_S,a.c.z-Math.cos(a.yaw)*.4)},
  // whoever she can see (the ones at a UV switch first: she fears the light), then the nearest
  target(a,r){const e=this.gun(a);let best=null,bs=1e9;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d>r)continue;
      if(!losClear(e.x,e.y,e.z,h.c.x,h.c.y+1.2,h.c.z))continue;let s=d;if(h.epUse>=100&&h.epUse<=103)s-=8;if(h===a.el.tg)s-=3;if(s<bs){bs=s;best=h}}a.el.tg=best;return best},
  claw(a){const h=this.nearH(a,2.3);if(!h)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,10);AI.moveDir(a,wx,wz)}a.spdMul=this.spd(S)*mul},
  spd(S){return (S.enr?1.2:1)*(S.ph>=3&&!S.enc?1.3:1)*(S.slowT>0?.6:1)},
  // ---------- host: the brain (EPZ.elpis.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.el;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;a.spdMul=this.spd(S);
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.dmgWT-=dt;if(S.dmgWT<=0){S.dmgWT=4;S.dmgW=0}
    if(a.frozen>0){a.frozen=0;a.c.vx=a.c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=(EP.ph==='run'||S.enc)&&!S.idle&&S.mode!=='gone';if(live&&S.enc)S.encT+=dt;
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('eEnr')}}
    const cdm=S.enr?1/.7:1;if(live)for(const k in S.cd)S.cd[k]-=dt*cdm;
    if(!live){a.elPose=S.idle&&S.ph===1&&EP.st===4?'kneel':'';return true}
    // (standing in a burning quarter: she gets out of it)
    S.uvIn=ELUV.lit(a.c.x,a.c.z)&&!S.enc?S.uvIn+dt:0;
    if(S.sg)this.songTick(a,S,dt);if(S.ln&&S.ln.on)this.lungeHit(a,S);
    if(a.kin)return true;// (a leap or the lunge under way: epbase.js flies the body)
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(S.downQ){const t=S.downQ;S.downQ=0;this.down(a,t);return true}
    if(S.enc)this.pEnc(a,dt,S);else if(S.ph===1)this.p1(a,dt,S);else if(S.ph===2)this.p2(a,dt,S);else this.p3(a,dt,S);
    return true},
  // ---------- the first meeting: on the nurses' station — darts, AEDs on the team's kills, the defibrillator; away after 35 s ----------
  pEnc(a,dt,S){if(S.encT>35){this.retreat(a);return}a.elPose='';if(this.claw(a))return;S.pt-=dt;if(S.pt>0)return;S.pt=.3;
    const nb=this.nearH(a,3.2,2);if(nb&&S.cd.shock<=0){S.cd.shock=6;this.shockStart(a,S);return}
    if(S.cd.aed<=0&&ELAED.list().length<1){const B=ELAED.bodies(a,24,1);if(B.length){S.cd.aed=8;this.aedStart(a,S,B);return}}
    const t=this.target(a,30);if(!t)return;this.face(a,t.c.x,t.c.z);if(S.cd.dart<=0){S.cd.dart=5.5;this.dartStart(a,S,t)}},
  retreat(a){const S=a.el;S.invT=99;this.clearPat(a,S);S.mode='ret';S.mt=5;EP.say('eRet');const p=MAP.ez.meet.ward;a.elPose='';
    epKin(a,p[0],p[1],p[2],1.6,1.6,b=>{b.elPose='';EP.meetEnd(b)})},
  // ---------- phase 1: round the beds, cover to cover ----------
  p1(a,dt,S){a.elPose='';if(this.claw(a))return;S.pt-=dt;
    if(S.pt<=0){S.pt=.3;
      const nb=this.nearH(a,3.2,2);if(nb&&S.cd.shock<=0){S.cd.shock=5;this.shockStart(a,S);return}
      if(S.cd.aed<=0&&ELAED.list().length<2){const B=ELAED.bodies(a,20,1);if(B.length){S.cd.aed=S.enr?5:7;this.aedStart(a,S,B);return}}
      const t=this.target(a,32);
      if(t){const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(S.cd.dart<=0&&d<26){S.cd.dart=S.enr?4.5:6;this.dartStart(a,S,t);return}
        if(S.cd.gas<=0&&d<22&&d>5){S.cd.gas=S.enr?10:13;this.gasStart(a,S,t);return}}}
    this.moveCov(a,dt,S)},
  moveCov(a,dt,S){S.covT-=dt;if(!S.cov||S.covT<=0||S.uvIn>.2){S.cov=this.pickCover(a);S.covT=rr(5,8)}
    if(S.cov){if(Math.hypot(S.cov[0]-a.c.x,S.cov[2]-a.c.z)>1.2)this.walk(a,dt,S,S.cov,1);else{const t=this.target(a,40);if(t)this.face(a,t.c.x,t.c.z)}}},
  // a cover point 10–16 m from the team: not in a burning quarter, nobody right on it
  pickCover(a){const C=this.cen(),E=MAP.ez,L=E.cover.map(p=>{let s=Math.abs(Math.hypot(p[0]-C[0],p[2]-C[2])-12)+hash2(Math.round(p[0]),Math.round(p[2]),Math.floor(G.t/9))*5;
      if(ELUV.lit(p[0],p[2]))s+=40;for(const h of SCEN.H)if(h.alive&&Math.hypot(p[0]-h.c.x,p[2]-h.c.z)<6)s+=20;return [p,s]}).sort((p,q)=>p[1]-q[1]);
    return L.length?L[Math.floor(Math.random()*Math.min(3,L.length))][0]:null},
  // ---------- phase 2: the memories ----------
  p2(a,dt,S){a.elPose='';if(this.claw(a))return;S.pt-=dt;
    if(S.pt<=0){S.pt=.3;
      const nb=this.nearH(a,3.2,2);if(nb&&S.cd.shock<=0){S.cd.shock=5;this.shockStart(a,S);return}
      const t=this.target(a,40);
      if(S.cd.mem<=0&&t){S.cd.mem=S.enr?5.5:7.5;this.memStart(a,S,t);return}
      if(S.cd.aed<=0&&ELAED.list().length<2){const B=ELAED.bodies(a,20,1);if(B.length){S.cd.aed=S.enr?8:11;this.aedStart(a,S,B);return}}
      if(t&&S.cd.dart<=0&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<26){S.cd.dart=S.enr?6:8;this.dartStart(a,S,t);return}}
    this.moveCov(a,dt,S)},
  // ---------- phase 3: the last vial — at them ----------
  p3(a,dt,S){a.elPose='';if(this.claw(a))return;S.pt-=dt;const t=this.target(a,44);
    if(S.pt<=0){S.pt=.25;
      const nb=this.nearH(a,3.2,2);if(nb&&S.cd.shock<=0){S.cd.shock=4;this.shockStart(a,S);return}
      if(S.cd.mass<=0){S.cd.mass=S.enr?15:20;this.massStart(a,S);return}
      if(t&&S.cd.mem<=0){S.cd.mem=S.enr?10:14;this.memStart(a,S,t);return}
      if(t&&S.cd.lunge<=0){const L=this.lungePlan(a,t);if(L){S.cd.lunge=S.enr?4.5:6.5;this.lungeStart(a,S,L);return}}
      if(S.cd.aed<=0&&ELAED.list().length<3){const B=ELAED.bodies(a,20,1);if(B.length){S.cd.aed=S.enr?6:8;this.aedStart(a,S,B);return}}}
    // (towards them, to about 7 m — the lunge's reach — or away from a burning quarter)
    if(S.uvIn>.2){this.moveCov(a,dt,S);return}
    if(t){const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d>7)this.walk(a,dt,S,[t.c.x,t.c.y,t.c.z],1);else this.face(a,t.c.x,t.c.z)}else this.moveCov(a,dt,S)},
  // ---------- the patterns (host) ----------
  // darts: a green strip, then three darts down it — 24 and dazed (asleep if already dazed)
  dartStart(a,S,t){const T=.7*EPTW(),y0=elYaw(t.c.x-a.c.x,t.c.z-a.c.z),fy=Math.abs(t.c.y-a.c.y)<1.5?a.c.y:t.c.y;this.face(a,t.c.x,t.c.z);
    S.dt={x:a.c.x,y:fy,z:a.c.z,yaw:y0,w:1.1,l:26,n:0};TELE.add({k:'r',x:S.dt.x,y:fy,z:S.dt.z,yaw:y0,w:1.1,l:26,d:T,col:0x3aff7a});S.mode='dart';S.mt=T;a.elPose='aim';this.fx({k:'w',i:a.id,s:'dt'});this.sayEvery('eDart',24)},
  dartFire(a,S){const Q=S.dt,g=this.gun(a),fx=-Math.sin(Q.yaw),fz=-Math.cos(Q.yaw),rx=Math.cos(Q.yaw),rz=-Math.sin(Q.yaw);
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-Q.x,dz=h.c.z-Q.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<0||al>Q.l||Math.abs(sd)>Q.w/2+.25||Math.abs(h.c.y-Q.y)>2)continue;
      if(!losClear(g.x,g.y,g.z,h.c.x,h.c.y+1.2,h.c.z))continue;const slept=(h.dizzy||0)>.3;hurtHuman(h,EPD(24*elK()),a,{});if(slept){epFx(h,'kd',.9);this.fxSend({k:'zz',i:h.id})}else epFx(h,'dz',1.4)}
    this.fx({k:'df',x:r2(g.x),y:r2(g.y),z:r2(g.z),yw:r3(Q.yaw),ty:r2(Q.y)})},
  // the AED thrown onto a body
  aedStart(a,S,B){const z=B[0];this.face(a,z.c.x,z.c.z);S.mode='aedT';S.mt=.55;S.ae=B;a.elPose='throw';z.elHold=1;this.fx({k:'w',i:a.id,s:'ae'});this.sayEvery('eAed',20)},
  // the defibrillator: a ring round her, then the shock
  shockStart(a,S){const T=.7*EPTW();TELE.add({k:'c',x:a.c.x,y:a.c.y,z:a.c.z,r:3.6,d:T,col:0x9adcff});S.mode='shock';S.mt=T;S.sh={x:a.c.x,y:a.c.y,z:a.c.z};a.elPose='shock';this.fx({k:'w',i:a.id,s:'sh'});this.sayEvery('eShock',20)},
  shockFire(a,S){const Q=S.sh;for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-Q.x,dz=h.c.z-Q.z,d=Math.hypot(dx,dz);if(d>3.6||Math.abs(h.c.y-Q.y)>1.8)continue;
      hurtHuman(h,EPD(24*elK()),a,{});epFx(h,'kd',.8);SCEN.pushHuman(h,dx/(d||1)*6,3,dz/(d||1)*6)}this.fx({k:'sf',x:r2(Q.x),y:r2(Q.y),z:r2(Q.z)})},
  // anaesthetic gas: a canister lobbed at them, a cloud where it lands
  gasStart(a,S,t){this.face(a,t.c.x,t.c.z);S.mode='gas';S.mt=.6;S.gs={x:t.c.x+t.c.vx*.6,y:t.c.y,z:t.c.z+t.c.vz*.6};a.elPose='throw';this.fx({k:'w',i:a.id,s:'gs'});this.sayEvery('eGas',26)},
  gasThrow(a,S){const Q=S.gs,n=navSnap(Q.x,Q.y,Q.z,3)||{x:Q.x,y:Q.y,z:Q.z},g=this.gun(a),T=clamp(Math.hypot(n.x-g.x,n.z-g.z)/18,.5,1.1);
    this.fx({k:'gt',a:[r2(g.x),r2(g.y),r2(g.z),r2(n.x),r2(n.y),r2(n.z)],T:r2(T)});EP.later(T,()=>{if(on10()&&EP.ph==='run')ELGAS.add(n.x,n.y,n.z,4,7,3.5)})},
  // ---------- the memories: one of RT-1 at a time (the queue holds all six before any comes again) ----------
  memStart(a,S,t){if(!S.memQ.length)S.memQ=shuffle(EL_MEM.slice());let k=S.memQ.shift();
    // (no LORELEI with nobody near enough to pull; no LYREBIRD with nowhere to slip off to)
    if(k==='lorelei'&&!SCEN.H.some(h=>h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<22)){S.memQ.push(k);k=S.memQ.shift()}
    this.clearPat(a,S);S.mm={k,t:0,tg:t,n:0};S.mode='mem';S.mt=9;this.fx({k:'mem',i:a.id,m:EL_MEM.indexOf(k)});EP.say('m_'+k);
    if(k==='argus'){const far=SCEN.H.filter(h=>h.alive&&losClear(this.gun(a).x,this.gun(a).y,this.gun(a).z,h.c.x,h.c.y+1.2,h.c.z)).sort((p,q)=>Math.hypot(q.c.x-a.c.x,q.c.z-a.c.z)-Math.hypot(p.c.x-a.c.x,p.c.z-a.c.z))[0]||t;
      S.mm.tg=far;S.mm.T=1.5*EPTW();ELAS.add(a,far,S.mm.T);a.elPose='aim'}
    else if(k==='legatus'){S.mm.T=1.8*EPTW();a.elPose='call';const L=[];for(const h of SCEN.H)if(h.alive)L.push([h.c.x+h.c.vx*.5,h.c.y,h.c.z+h.c.vz*.5]);
      const c=this.cen();L.push([c[0]+rr(-4,4),c[1],c[2]+rr(-4,4)]);S.mm.rings=L.map(p=>{const n=navSnap(p[0],p[1],p[2],2.5)||{x:p[0],y:p[1],z:p[2]};TELE.add({k:'c',x:n.x,y:n.y,z:n.z,r:3,d:S.mm.T});return [n.x,n.y,n.z]})}
    else if(k==='charon'){S.mm.T=1*EPTW();a.elPose='aim';const n=navSnap(t.c.x+t.c.vx*.5,t.c.y,t.c.z+t.c.vz*.5,2.5)||{x:t.c.x,y:t.c.y,z:t.c.z};S.mm.p=[n.x,n.y,n.z];
      TELE.add({k:'c',x:n.x,y:n.y,z:n.z,r:3.2,d:S.mm.T,col:0xff8a2a});this.fx({k:'fl',a:[r2(this.gun(a).x),r2(this.gun(a).y),r2(this.gun(a).z),r2(n.x),r2(n.y),r2(n.z)],T:r2(S.mm.T)})}
    else if(k==='daedalus'){S.mm.T=.8;a.elPose='throw';S.mm.p=[t.c.x+t.c.vx*.5,t.c.y,t.c.z+t.c.vz*.5]}
    else if(k==='lorelei'){S.mm.T=2.6;a.elPose='sing';S.sg={t:0,T:2.6,R:24};this.fx({k:'sg',i:a.id,T:26})}
    else if(k==='lyrebird'){S.mm.T=1.2;a.elPose='call';ESMK.add(a.c.x,a.c.y,a.c.z,6.5,8,false,[.55,.6,.62])}},
  memStep(a,dt,S){const M=S.mm;if(!M){S.mode='';return}M.t+=dt;const k=M.k;
    if(k==='argus'){const h=M.tg;if(h&&h.alive)this.face(a,h.c.x,h.c.z);if(M.t>=M.T&&!M.n){M.n=1;ELAS.stop(a);if(h&&h.alive){const g=this.gun(a);if(losClear(g.x,g.y,g.z,h.c.x,h.c.y+1.2,h.c.z))EBUL.shot(g.x,g.y,g.z,h.c.x,h.c.y+(h.duck?.9:1.25),h.c.z,0,{dmg:36*elK(),w:'s',src:a})}}if(M.t>=M.T+.4)this.memEnd(a,S);return}
    if(k==='legatus'){if(M.t>=M.T&&!M.n){M.n=1;const hit=new Set();for(const p of M.rings){this.fx({k:'ar',x:r2(p[0]),y:r2(p[1]),z:r2(p[2])});for(const h of SCEN.H){if(!h.alive||hit.has(h)||Math.hypot(h.c.x-p[0],h.c.z-p[2])>3||Math.abs(h.c.y-p[1])>2.5)continue;hit.add(h);hurtHuman(h,EPD(30*elK()),a,{});epFx(h,'kd',.8)}}}if(M.t>=M.T+.5)this.memEnd(a,S);return}
    if(k==='charon'){if(M.t>=M.T&&!M.n){M.n=1;const p=M.p;ELFIRE.add({k:'c',x:p[0],y:p[1],z:p[2],r:3.2,life:6,dps:9,zb:1})}if(M.t>=M.T+.3)this.memEnd(a,S);return}
    if(k==='daedalus'){const p=M.p,g=this.gun(a);for(let i=M.n;i<3&&M.t>=.3+i*.15;i++){M.n++;const an=i*2.1+Math.random(),r=i?rr(1.6,2.6):rr(0,.8),n=navSnap(p[0]+Math.cos(an)*r,p[1],p[2]+Math.sin(an)*r,2.5);
        if(n)E9MINE.toss(g.x,g.y,g.z,n.x,n.y,n.z,clamp(Math.hypot(n.x-g.x,n.z-g.z)/15,.5,1.2))}if(M.t>=M.T+.2)this.memEnd(a,S);return}
    if(k==='lorelei'){if(M.t>=M.T){S.sg=null;this.fx({k:'sgx',i:a.id});if(this.nearH(a,3.6,2)){this.memEnd(a,S);this.shockStart(a,S)}else this.memEnd(a,S)}return}
    if(k==='lyrebird'){if(M.t>=M.T&&!M.n){M.n=1;const C=this.cen();let best=null,bs=-1;for(const p of MAP.ez.cover){const d=Math.hypot(p[0]-a.c.x,p[2]-a.c.z),dc=Math.hypot(p[0]-C[0],p[2]-C[2]);if(d<10||ELUV.lit(p[0],p[2]))continue;const s=dc+rr(0,6);if(s>bs){bs=s;best=p}}
        if(best){a.elPose='lunge';S.hideT=G.t+6;epKin(a,best[0],best[1],best[2],1.1,2.2,b=>{b.elPose='';const T=b.el;if(T){T.mode='';T.mm=null;T.cov=best;T.covT=6}});return}}
      if(M.t>=M.T+.2)this.memEnd(a,S);return}
    this.memEnd(a,S)},
  memEnd(a,S){S.mm=null;S.mode='';a.elPose='';ELAS.stop(a)},
  // LORELEI's song: every page pulls its own player to her while it lasts (crouched: a third as hard); the host its bots
  songTick(a,S,dt){S.sg.t+=dt;if(S.sg.t>S.sg.T)S.sg=null},
  pullTick(dt){const Bs=EP.bs();if(!Bs||!(Bs.f&128))return;const b=Bs.a;if(!b||!b.alive)return;const P=G.player;
    const pull=(h)=>{if(!h.alive||h.team!==TH||h.grabT>0)return;const dx=b.c.x-h.c.x,dz=b.c.z-h.c.z,d=Math.hypot(dx,dz);if(d>24||d<2)return;
      if(!(h.elLosT>G.t)){h.elLosT=G.t+.25;h.elLos=losClear(b.c.x,b.c.y+1.9,b.c.z,h.c.x,h.c.y+1.4,h.c.z)}if(!h.elLos)return;
      const f=3.2*(1-d/24*.4)*(h.duck?.35:1);h.kvx=approach(h.kvx,dx/d*f,dt*14);h.kvz=approach(h.kvz,dz/d*f,dt*14)};
    if(P)pull(P);if(!NET.cli)for(const h of SCEN.H)if(h.bot&&h!==P)pull(h)},
  // the lunge (phase 3): along a clear line through the one she wants, 14 m at most
  lungePlan(a,t){const dx=t.c.x-a.c.x,dz=t.c.z-a.c.z,d=Math.hypot(dx,dz);if(d<3||d>13||Math.abs(t.c.y-a.c.y)>1.2)return null;const ux=dx/d,uz=dz/d;
    const h=rayCast(a.c.x,a.c.y+1,a.c.z,ux,0,uz,14,SHOT_FILTER),L=Math.min(14,h?h.t-.8:14);if(L<d-.5)return null;return {x:a.c.x,y:a.c.y,z:a.c.z,ux,uz,l:L,yaw:elYaw(ux,uz)}},
  lungeStart(a,S,L){const T=.8*EPTW();TELE.add({k:'r',x:L.x,y:L.y,z:L.z,yaw:L.yaw,w:2,l:L.l,d:T});S.ln=Object.assign(L,{on:false,hit:new Set()});S.mode='lunge';S.mt=T;a.elPose='lunge';a.yaw=L.yaw;this.fx({k:'w',i:a.id,s:'ln'});this.sayEvery('eLunge',16)},
  lungeGo(a,S){const L=S.ln;L.on=true;S.mode='lgo';S.mt=9;const ex=L.x+L.ux*L.l,ez=L.z+L.uz*L.l,n=navSnap(ex,L.y,ez,2)||{x:ex,y:L.y,z:ez};
    epKin(a,n.x,n.y,n.z,L.l/22,.25,b=>{L.on=false;const T=b.el;if(!T)return;T.mode='rec';T.mt=1.2;b.elPose='rec';ELP.fx({k:'lr',i:b.id})})},
  // (within the strip's half width and a body's: a step off the red strip is a step out of her way)
  lungeHit(a,S){const L=S.ln;for(const h of SCEN.H){if(!h.alive||L.hit.has(h))continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)>1.25||Math.abs(h.c.y-a.c.y)>2)continue;L.hit.add(h);
      hurtHuman(h,EPD(30*elK()),a,{});epFx(h,'kd',1);SCEN.pushHuman(h,L.ux*7,3.5,L.uz*7);this.fxSend({k:'lh',i:h.id})}},
  // mass resuscitation (phase 3): a slam, a green shockwave, AEDs onto the bodies round her
  massStart(a,S){S.mode='mass';S.mt=1*EPTW();a.elPose='kneel';this.fx({k:'w',i:a.id,s:'ms'});EP.say('eMass')},
  massGo(a,S){const x=a.c.x,y=a.c.y,z=a.c.z,W=EWAVE.add(x,y,z,22,11,14*elK(),a,true);W.m.material.color.set(0x5aff8a);this.fx({k:'mw',x:r2(x),y:r2(y),z:r2(z)});const B=ELAED.bodies(a,22,3);for(const b of B)ELAED.throw(a,b)},
  // the pattern under way
  step(a,dt,S){const m=S.mode;
    if(m==='dart'){if(S.mt<=0){const Q=S.dt;if(Q&&Q.n<3){if(S.mt<=-Q.n*.12){Q.n++;if(Q.n===1)this.dartFire(a,S);else this.fx({k:'df',x:r2(this.gun(a).x),y:r2(this.gun(a).y),z:r2(this.gun(a).z),yw:r3(Q.yaw),ty:r2(Q.y)})}}
      if(S.mt<=-.5){S.mode='';a.elPose='';S.dt=null}}return}
    if(m==='aedT'){if(S.mt<=0){const B=S.ae||[];for(const z of B)if(!z.alive)ELAED.throw(a,z);S.ae=null;S.mode='';a.elPose=''}return}
    if(m==='shock'){if(S.mt<=0){if(S.sh){this.shockFire(a,S);S.sh=null}if(S.mt<=-.35){S.mode='';a.elPose=''}}return}
    if(m==='gas'){if(S.mt<=0){if(S.gs){this.gasThrow(a,S);S.gs=null}if(S.mt<=-.25){S.mode='';a.elPose=''}}return}
    if(m==='mem'){this.memStep(a,dt,S);return}
    if(m==='lunge'){if(S.mt<=0)this.lungeGo(a,S);return}
    if(m==='mass'){if(S.mt<=0&&!S.msd){S.msd=1;this.massGo(a,S)}if(S.mt<=-.6){S.msd=0;S.mode='';a.elPose=''}return}
    if(m==='rec'){a.elPose='rec';if(S.mt<=0){S.mode='';a.elPose=''}return}
    if(m==='blind'){a.elPose='blind';if(S.mt<=0){S.mode='';a.elPose='';S.cov=null}return}
    if(m==='tags'){a.elPose='tags';if(S.mt<=0){S.mode='';a.elPose='';S.cov=null}return}
    if(m==='vial'){a.elPose='vial';if(S.mt<=0){S.mode='';a.elPose='';S.cov=null}return}
    if(m==='down'){a.elPose='down';if(S.mt<=0){S.mode='';a.elPose=''}return}
    if(m==='ret'||m==='lgo'){if(S.mt<=0)S.mode='';return}
    S.mode=''},
  clearPat(a,S){ELAS.stop(a);if(S.dt)S.dt=null;S.sh=S.gs=null;if(S.ae){for(const z of S.ae)z.elHold=0;S.ae=null}S.mm=null;if(S.sg){S.sg=null;this.fx({k:'sgx',i:a.id})}if(S.ln){S.ln.on=false;S.ln=null}S.msd=0},
  // ---------- stagger, downs, the UV ----------
  grog(a,v){const S=a.el;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='tags'||S.mode==='vial'||S.mode==='ret'||S.mode==='gone')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);if(a.kin)S.downQ=6;else this.down(a,6);EP.say('eDown')}},
  down(a,t){const S=a.el;if(!S||S.mode==='gone'||S.mode==='ret')return;this.clearPat(a,S);this.fx({k:'dn',i:a.id});S.mode='down';S.mt=t;a.elPose='down'},
  // a quarter lit with her in it: blinded 2.5 s, +40 stagger
  uvOn(U){this.fx({k:'uv',i:U.i});this.sayOnce('eUvOn');const b=EP.bossA();if(!b||!b.el||b.el.enc||EP.st!==4)return;const S=b.el;
    if(ELUV.inSec(U,b.c.x,b.c.z)&&b.c.y<7&&S.invT<=0&&S.mode!=='tags'&&S.mode!=='vial'&&S.mode!=='down'){if(b.kin)return;this.clearPat(b,S);S.mode='blind';S.mt=2.5;b.elPose='blind';this.grog(b,40);this.fx({k:'bl',i:b.id});EP.say('eBlind')}},
  // ---------- phases ----------
  floorHit(a){const S=a.el;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone')this.retreat(a);return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  toPhase(a,n){const S=a.el;S.ph=n;S.invT=n===2?3.6:3;S.grog=0;S.downQ=0;this.clearPat(a,S);S.mode='';EP.bossPh=n;this.fx({k:'ph',n,i:a.id});EP.reviveAll();
    Object.assign(S.cd,{dart:4,aed:5,shock:2,gas:8,mem:4.5,lunge:3,mass:7});
    if(n===2){S.mode='tags';S.mt=3.5;a.elPose='tags';S.memQ=shuffle(EL_MEM.slice());EP.say('eP2');EP.later(3.6,()=>EP.say('eP2l'));EP.later(9,()=>this.sayOnce('eP2r'));return}
    S.mode='vial';S.mt=2.8;a.elPose='vial';EP.say('eP3');EP.later(3,()=>EP.say('eP3l'))},
  // ---------- host: damage in (before the game applies it) ----------
  hit(t,dmg,src,o){const S=t.el;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret'||S.mode==='tags'||S.mode==='vial')return 0;let mul=1;
    const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    o.kb=(o.kb||0)*.3;o.up=0;
    // the IV pack on her back: ×1.3, and it fills the stagger gauge
    if(o.x!=null&&!o.he){const fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw),hy=(o.y-t.c.y)/EL_S;if((o.x-t.c.x)*fx+(o.z-t.c.z)*fz<-.1&&hy>1.05&&hy<1.75){mul=1.3;if(!S.enc)this.grog(t,dmg*1.3/t.maxHp*300);if(!AU.throttle('elbag',500))this.fxSend({k:'bg',i:t.id})}}
    if(o.he&&!S.enc)this.grog(t,10);
    if(S.mode==='down')mul*=1.5;else if(S.mode==='rec')mul*=1.3;if(S.uvIn>0&&!S.enc)mul*=1.25;
    let out=dmg*mul;const fl=t.maxHp*(S.enc?.85:S.ph===1?EL_PH[1]:S.ph===2?EL_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    S.dmgW+=out*em;return out},
  // ---------- a body brought back (the AED's shock, her slam, a Patient's own rise): up from the floor, whole and faster ----------
  rise(z,boost){if(z.alive||z.c.y<-50)return;const p=[z.c.x,z.c.y+.05,z.c.z];z.elHold=0;z.elRiseB=!!boost;z.ptRiseNow=1;reviveZombie(z,p,true);if(!z.alive){z.ptRiseNow=0;return}z.reviving=1.4;
    if(boost){z.elB=1;z.spdMul=(z.spdMul||.86)*1.25}this.fx({k:'rz',i:z.id,b:boost?1:0})},
  // ---------- the escape's fire (host): the vents ahead of the team one after another; after 25 s the vault behind them too ----------
  escTick(dt){this.ventT-=dt;if(this.ventT<=0){this.ventT=rr(1.6,2.6);const V=MAP.ez.vents;const L=[];for(const v of V){const cx=v[0]-Math.sin(v[2])*v[4]/2,cz=v[1]-Math.cos(v[2])*v[4]/2;let near=99;for(const h of SCEN.H)if(h.alive)near=Math.min(near,Math.hypot(h.c.x-cx,h.c.z-cz));
        if(near<20&&!ELFIRE.L.some(F=>F.vi===v))L.push(v)}if(L.length){const v=rpick(L);TELE.add({k:'r',x:v[0],y:0,z:v[1],yaw:v[2],w:v[3],l:v[4],d:1.4,col:0xff7a2a});this.fx({k:'vw',x:r2(v[0]),z:r2(v[1]),yw:r3(v[2]),w:r2(v[3]),l:r2(v[4])});EP.later(1.4,()=>{if(on10()&&EP.S().k==='escape'){const F=ELFIRE.add({k:'r',x:v[0],y:0,z:v[1],yaw:v[2],w:v[3],l:v[4],life:2.4,dps:14,jet:1});F.vi=v}})}}
    this.vaultT+=dt;if(this.vaultT>25){this.vaultT=25-rr(2.5,3.5);for(const h of SCEN.H){if(!h.alive||h.c.z>2||h.c.x<-22)continue;const x=h.c.x+rr(-1,1),z=h.c.z+rr(-1,1),y=h.c.y;TELE.add({k:'c',x,y,z,r:3.4,d:1.5,col:0xff7a2a});
        EP.later(1.5,()=>{if(on10()&&EP.S().k==='escape')ELFIRE.add({k:'c',x,y,z,r:3.4,life:4,dps:16})})}}},
  // ---------- ammo boxes (host): from the supply lockers every 30 s wherever none is lying ----------
  ammoTick(dt,b){if(EP.st!==4||EP.ph!=='run'||!b||!b.alive||!b.el||b.el.enc)return;this.ammoT=(this.ammoT==null?12:this.ammoT)-dt;if(this.ammoT>0)return;this.ammoT=30;let w=0;
    for(const p of MAP.ez.ammo){if(EPK.list.some(k=>Math.hypot(k.x-p[0],k.z-p[2])<2))continue;const n=navSnap(p[0],p[1],p[2],1.5);if(!n)continue;EPK.spawn(n.x,n.y,n.z);w=1}if(w)this.sayOnce('eAmmo')},
  // ---------- bots ----------
  lowAm(a){const p=a.inv&&a.inv[1],id=p&&a.ammo[p]?p:a.inv&&a.inv[2],W=id&&WPN[id],A=id&&a.ammo[id];return !!(W&&A&&W.res&&!a.pup&&A.res<W.mag)},
  boxNear(a,r){let best=null,bd=r;for(const k of EPK.list){const d=Math.hypot(k.x-a.c.x,k.z-a.c.z);if(d<bd&&Math.abs(k.y-a.c.y)<2&&!TELE.at(k.x,k.z,.4)){bd=d;best=k}}return best},
  // the UV duty: the quarter she stands in, ready — the bot nearest its switch goes to light it
  duty(){const now=G.t;if(this.dutyT>now)return this.dutyD;this.dutyT=now+1;this.dutyD=null;const b=EP.bossA();if(!b||!b.el||EP.ph!=='run'||b.el.enc||b.c.y>7)return null;
    const U=ELUV.secOf(b.c.x,b.c.z);if(!U||U.st!==0)return null;let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-U.bx,h.c.z-U.bz);if(d<bd){bd=d;best=h}}
    return this.dutyD=best&&bd<40?{x:U.bx,y:U.sy,z:U.bz,bot:best.id,k:U.i}:null},
  botGoal(a,i){const b=EP.bossA();if(!b||!b.el||EP.ph!=='run')return null;const S=b.el;if(S.enc)return null;
    const D=this.duty();if(D&&D.bot===a.id)return [D.x,D.y,D.z,.3];
    if(this.lowAm(a)){const k=this.boxNear(a,50);if(k)return [k.x,k.y,k.z,.05]}
    // (round her at about 12 m — out in the open: not against a wall or the tanks, not on a stair, not behind the column — the nearest
    // place round the ring to its own; out of a burning quarter's way is her problem, not theirs)
    const r=S.ph>=3?13:11,an0=i*1.9+Math.floor(G.t/6)*.8;
    for(let k=0;k<12;k++){const an=an0+(k%2?1:-1)*Math.ceil(k/2)*.4,x=b.c.x+Math.cos(an)*r,z=b.c.z+Math.sin(an)*r;if(this.openAt(x,z))return [x,0,z,2]}
    return [clamp(b.c.x+Math.cos(an0)*r,-17,17),0,clamp(b.c.z+Math.sin(an0)*r,-38,-4),2]},
  openAt(x,z){return x>-17.5&&x<17.5&&z>-38.5&&z<-3.5&&Math.hypot(x,z+21)>5&&!(x<-17&&z<-25)&&!(x>13.5&&z>-16)},
  goalTag(b){const S=b.el;if(!S)return '';const D=this.duty();return S.ph+(D?D.k+':'+D.bot:'')},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;const U=ELUV.L[j],b=EP.bossA();return U&&U.st===0&&b&&b.el&&ELUV.inSec(U,b.c.x,b.c.z)?j:-1},
  // out of a live mine's reach, the gas, the fire; crouched against her song
  danger(a){if(!on10())return null;const c=a.c,M=E9MINE.near(c.x,c.y,c.z,2.4);if(M){const dx=c.x-M.x,dz=c.z-M.z,d=Math.hypot(dx,dz)||1;return {ax:dx/d,az:dz/d}}
    const S=ELGAS.in(a,.7);if(S){const dx=c.x-S.x,dz=c.z-S.z,d=Math.hypot(dx,dz)||1;return {ax:dx/d,az:dz/d}}
    const F=ELFIRE.at(c.x,c.y,c.z,.9);if(F){if(F.k==='c'){const dx=c.x-F.x,dz=c.z-F.z,d=Math.hypot(dx,dz)||1;return {ax:dx/d,az:dz/d}}const rx=Math.cos(F.yaw),rz=-Math.sin(F.yaw),sd=(c.x-F.x)*rx+(c.z-F.z)*rz,s=sd>=0?1:-1;return {ax:rx*s,az:rz*s}}
    const Bs=EP.bs();if(Bs&&Bs.f&128&&Bs.a&&Math.hypot(Bs.a.c.x-c.x,Bs.a.c.z-c.z)<24)return {ax:0,az:0,duck:true};return null},
  // ---------- the boss stage's own devices: the UV switches (0-3) ----------
  useNear(h){if(!on10()||EP.st!==4)return -1;for(const U of ELUV.L)if(ELUV.near(U,h))return U.i;return -1},
  useInfo(i,L){const U=ELUV.L[i];if(!U)return null;if(U.st===0)return {act:L?'light the UV':'UV 멸균등 켜기',p:U.p/ELUV.T,x:0};
    if(U.st===1)return {act:(L?'Burning · ':'멸균 중 · ')+Math.max(0,Math.ceil(U.t))+(L?' s':'초'),p:1,x:1};
    return {act:(L?'Cooling ':'식는 중 ')+Math.max(0,Math.ceil(U.t))+(L?' s':'초'),p:1-U.t/ELUV.CD,x:1}},
  // ---------- every page ----------
  update(dt){if(!on10())return;const b=EP.bossA();
    if(this.meetL){const M=MAP.ez.meet.p;if(EP.st!==3||G.t>this.meetT&&(!b||!b.alive||Math.hypot(b.c.x-M[0],b.c.z-M[2])>6)){this.meetL.dead=true;this.meetL=null}}
    if(NET.cli){const f=EP.bf;if(f&&f.uv)ELUV.sync(f.uv)}
    else{this.ammoTick(dt,b);if(EP.st===4&&EP.ph==='run'){ELUV.hostTick(dt);const S=b&&b.el;if(S&&!S.idle&&!S.enc)EP.trickle(dt,EL_MIX,[.22,.25,.26][S.ph-1]*(S.enr?1.4:1)*((G.diff||0)>=3?.6:1))}}
    this.pullTick(dt)},
  stageClear(kind){ELAS.clear()},
  clear(){if(this.meetL){this.meetL.dead=true;this.meetL=null}this.cur=null;this.said={};this.sayT={};this.encNext=false;this.dutyT=0;this.dutyD=null;this.ammoT=null;this.escT=0;this.ventT=0;this.vaultT=0},
  // the boss bar: gauges and what she is doing (flags: 1 a memory, 2 down, 4 invulnerable, 8 enraged, 16 first meeting, 32 the last vial
  // taken, 64 blinded, 128 singing, 256 lunging, 512 getting up after it, 1024 hidden in the fog, 2048 throwing an AED, 4096 in a burning quarter)
  bsOf(b){const S=b.el;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.mode==='mem'?1:0)|(S.mode==='down'?2:0)|(S.invT>0&&!S.enc||S.mode==='tags'||S.mode==='vial'?4:0)|(S.enr?8:0)|(S.enc?16:0)|(S.ph>=3&&S.mode!=='vial'?32:0)|(S.mode==='blind'?64:0)|(S.sg?128:0)|
      (S.mode==='lunge'||S.mode==='lgo'?256:0)|(S.mode==='rec'?512:0)|(S.hideT>G.t?1024:0)|(S.mode==='aedT'?2048:0)|(S.uvIn>0?4096:0),
    pose:Math.max(0,EL_POSE.indexOf(b.elPose||'')),mk:S.mm?EL_MEM.indexOf(S.mm.k):-1,uv:ELUV.pack()}},
  bsPack(b){if(!b.el)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pose,B.mk,B.uv]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pose:B[5],mk:B[6],uv:Array.isArray(B[7])?B[7]:null,rt:performance.now()}},
  hud(B,L){const f=B.f,mk=B.mk>=0?EL_MEMI[EL_MEM[B.mk]]:null;return {ss:f&4?(L?'INVULNERABLE':'무적'):f&2?(L?'DOWN!':'그로기!'):f&64?(L?'BLINDED — NOW!':'눈이 부시다 — 지금!'):f&512?(L?'GETTING UP — NOW!':'일어나는 중 — 지금!'):
      f&128?(L?'HER SONG — CROUCH':'노래 — 앉아서 버텨!'):mk?(L?'MEMORY · '+mk[1]:'기억 · '+mk[0]):f&8?(L?'ENRAGED':'광폭화'):'',
    cls:f&8?'r':f&2||f&64||f&512?'y':f&128||f&1?'r':'',sp:(f&16?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&16?'':f&32||B.ph>=3?(L?' · THE LAST VIAL':' · 마지막 한 병'):B.ph===2?(L?' · MEMORIES':' · 기억'):(L?' · TRIAGE':' · 응급 처치')),g1:B.grog/(B.gmax||100)}},
  // the UV switches (hot when she is in that quarter), the AEDs charging (shoot them!)
  markers(list,L,P){const Bs=EP.bs();if(Bs&&!(Bs.f&16)){const b=Bs.a;
      for(const U of ELUV.L){if(U.st===0){const hot=!!(b&&b.alive&&b.c.y<7&&ELUV.inSec(U,b.c.x,b.c.z));list.push([U.bx,U.sy+2,U.bz,L?'☀ UV':'☀ 멸균등',hot?'p hot':'p'])}
        else if(U.st===1)list.push([(U.sec[0]+U.sec[2])/2,9,(U.sec[1]+U.sec[3])/2,(L?'☀ BURNING ':'☀ 멸균 중 ')+Math.max(0,Math.ceil(U.t)),'p'])}}
    for(const a of SCEN.Z)if(a.alive&&a.zc==='aed')list.push([a.c.x,a.c.y+.9,a.c.z,L?'⚡ AED — SHOOT IT':'⚡ 제세동기 — 쏴!','r'])},
  // ---------- every page: before the rig is posed — the pose, where the bots aim ----------
  pre(a,dt){this.cur=a;const S=a.el;let pose=a.elPose||'',f=0,mk=-1;
    if(!NET.cli&&S){const B=this.bsOf(a);f=B.f;mk=B.mk}else{const bf=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(bf){pose=EL_POSE[bf.pose]||'';f=bf.f;mk=bf.mk}}
    a.elPose=pose;a.elF=f;a.elMk=mk;a.epDown=approach(a.epDown||0,a.alive&&f&2?1:0,dt*3);a.epHide=!!(f&1024);a.epPri=f&64||f&2||f&512?.3:.4;a.epAimY=1.5},
  // the rig's extras: 1.1×, the dart pistol in her right hand (a memory's thing instead while she calls on it), the paddles for the shock,
  // the IV bag on her pack, the dog tags in her left hand (phase 2 on), the vial
  rigX(ch){const mk=k=>{const m=new THREE.Mesh(gunGeo(k),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);return m},o=ch.A.def.o;
    return {dart:mk('elDart'),padL:mk('elPad'),padR:mk('elPad'),bag:mk('elBag'),tags:mk('elTags'),vial:mk('elVial'),mem:{},mk,
      hand:new THREE.Matrix4().makeTranslation(0,-o.fore-.03,-.02).multiply(new THREE.Matrix4().makeRotationX(-Math.PI/2)),
      back:new THREE.Matrix4().makeTranslation(.06,o.torsoH*.72,o.torsoD*.5+.21)}},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_elpis')return;if(ch.grp.scale.x!==EL_S)ch.grp.scale.setScalar(EL_S);a.hitW=.3;a.headR=.18;
    const X=ch.elX||(ch.elX=this.rigX(ch)),vis=ch.grp.visible,P=a.elPose||'',f=a.elF||0,mk=a.elMk==null?-1:a.elMk,mi=mk>=0?EL_MEMI[EL_MEM[mk]][2]:null;
    for(const k in X.mem)X.mem[k].visible=false;
    if(mi&&GUNS[mi]){const m=X.mem[mi]||(X.mem[mi]=X.mk(mi));m.visible=vis;m.matrix.multiplyMatrices(ch.M[6],X.hand);m.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value)}
    X.dart.visible=vis&&!mi&&P!=='shock'&&P!=='vial'&&P!=='tags'&&P!=='blind'&&P!=='down';X.dart.matrix.multiplyMatrices(ch.M[6],X.hand);
    X.padL.visible=X.padR.visible=vis&&P==='shock';X.padR.matrix.multiplyMatrices(ch.M[6],X.hand);X.padL.matrix.multiplyMatrices(ch.M[4],X.hand);
    X.bag.visible=vis;X.bag.matrix.multiplyMatrices(ch.M[1],X.back);X.tags.visible=vis&&(P==='tags'||(EP.bossPh>=2&&P!=='shock'&&P!=='vial'));X.tags.matrix.multiplyMatrices(ch.M[4],X.hand);
    X.vial.visible=vis&&P==='vial';X.vial.matrix.multiplyMatrices(ch.M[6],X.hand);
    for(const m of [X.dart,X.padL,X.padR,X.bag,X.tags,X.vial])m.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value);
    X.bag.material.uniforms.uEmisA.value=f&32?1.8+.7*Math.sin(G.t*9):1.4+.4*Math.sin(G.t*3);X.vial.material.uniforms.uEmisA.value=2;
    if(vis&&f&32&&Math.random()<.4){const p=_elV3.set(rr(-.3,.3),rr(.6,1.7),rr(-.2,.2)).applyMatrix4(ch.grp.matrixWorld);FX.spawn({x:p.x,y:p.y,z:p.z,vx:rr(-.4,.4),vy:rr(.3,1.2),vz:rr(-.4,.4),life:rr(.3,.7),s0:.05,s1:.02,r:.45,g:1,b:.55,f:0,add:1})}
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(f&4)T.set(1,.95,.98,.16+.08*Math.sin(G.t*30));else if(f&64)T.set(.7,.4,1,.22+.08*Math.sin(G.t*24));else if(f&8)T.set(.9,.2,.1,.14+.06*Math.sin(G.t*9));
      else if(f&32)T.set(.3,1,.45,.12+.08*Math.sin(G.t*4));else T.set(0,0,0,0)}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=typeof m.i==='number'?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const c=a.c;if(m.s==='dt')AU.at('reload',c.x,c.y+1.5,c.z,{vol:.6,range:35,rate:1.3});else if(m.s==='sh')AU.at('elshock',c.x,c.y+1.2,c.z,{vol:1,range:45});
      else if(m.s==='ae'||m.s==='gs')AU.at('zgrowl',c.x,c.y+1.8,c.z,{vol:.5,range:40,rate:1.4});else if(m.s==='ln')AU.at('zroar',c.x,c.y+1.6,c.z,{vol:.9,range:70,rate:1.3});
      else if(m.s==='ms'){AU.at('zroar',c.x,c.y+1.6,c.z,{vol:1,range:90,rate:.9});AU.at('heart',c.x,c.y+1,c.z,{vol:1,range:60})}}break;
    case 'df':{const x=m.x/100,y=m.y/100,z=m.z/100,w=m.yw/1000,ty=m.ty/100;for(let k=0;k<1;k++){const ex=x-Math.sin(w)*26,ez=z-Math.cos(w)*26;FX.tracer(x,y,z,ex+rr(-.3,.3),ty+rr(.8,1.4),ez+rr(-.3,.3),[.5,1,.6])}
      AU.at('eldart',x,y,z,{vol:1,range:70});break}
    case 'zz':if(P&&P.id===m.i)HUD.note(L?'Sedated — out cold!':'진정제 — 잠들었다!',1.4);break;
    case 'sf':{const x=m.x/100,y=m.y/100,z=m.z/100;DL.add(x,y+1,z,'#bfe8ff',12,4,.25);for(let i=0;i<40;i++){const g=i/40*TAU;FX.spawn({x,y:y+.5,z,vx:Math.cos(g)*8,vy:rr(.2,2),vz:Math.sin(g)*8,life:rr(.2,.4),s0:.08,s1:.03,r:.75,g:.9,b:1,f:0,add:1})}
      AU.at('dazap',x,y+1,z,{vol:1,range:50,rate:.9});break}
    case 'at':{const A=m.a;ELTHROW.add('aed',A[0]/100,A[1]/100,A[2]/100,A[3]/100,A[4]/100,A[5]/100,m.T/100);break}
    case 'gt':{const A=m.a;ELTHROW.add('gas',A[0]/100,A[1]/100,A[2]/100,A[3]/100,A[4]/100,A[5]/100,m.T/100);break}
    case 'gs':if(NET.cli)ELGAS.add(m.x/100,m.y/100,m.z/100,m.r/100,m.l/100,m.d,m.id,true);break;
    case 'fi':if(NET.cli){const o=m.o;ELFIRE.add({k:o.k,x:o.x/100,y:o.y/100,z:o.z/100,r:o.r/100,yaw:o.yaw/1000,w:o.w/100,l:o.l/100,life:o.life/100,dps:o.dps,zb:o.zb,jet:o.j},true)}break;
    case 'fl':{const A=m.a,x=A[0]/100,y=A[1]/100,z=A[2]/100,X=A[3]/100,Y=A[4]/100,Z=A[5]/100;FX.tracer(x,y,z,X,Y+.3,Z,[1,.6,.3]);AU.at('flare',x,y,z,{vol:.9,range:70});DL.add(X,Y+1,Z,'#ff8a3a',10,2.4,m.T/100);break}
    case 'ar':{const x=m.x/100,y=m.y/100,z=m.z/100;FX.explode(x,y+.2,z,'he');AU.at('explode',x,y,z,{vol:.95,range:110,occ:false,rate:.9});if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<12)FX.shake=Math.max(FX.shake,.8-d/16)}break}
    case 'mem':if(a){const I=EL_MEMI[EL_MEM[m.m]];if(I)HUD.announce(I[L?1:0],'z',2.2);AU.at('ui',a.c.x,a.c.y+1.6,a.c.z,{vol:.6,range:60,rate:.6})}break;
    case 'sg':if(a){AU.at('lycall',a.c.x,a.c.y+1.8,a.c.z,{vol:1,range:90,rate:1.15});if(P&&P.alive&&P.team===TH)HUD.note(L?'Her song — crouch and hold!':'노래다 — 앉아서 버텨!',2)}break;
    case 'sgx':break;
    case 'lh':if(P&&P.id===m.i)FX.shake=Math.max(FX.shake,.8);break;
    case 'lr':if(a)AU.at('land',a.c.x,a.c.y,a.c.z,{vol:.9,range:50,rate:.7});break;
    case 'mw':{if(NET.cli){const W=EWAVE.add(m.x/100,m.y/100,m.z/100,22,11,0,null,true);W.m.material.color.set(0x5aff8a)}DL.add(m.x/100,m.y/100+1,m.z/100,'#5aff8a',18,3,.5);break}
    case 'rz':{const z=byIdAny(m.i);if(z){if(NET.cli){z.reviving=1.4;if(m.b)z.elB=1;else z.ptR=1}const c=z.c;AU.at('heart',c.x,c.y+.5,c.z,{vol:.9,range:30});
        DL.add(c.x,c.y+.8,c.z,'#5aff8a',7,2.4,.6);for(let i=0;i<24;i++)FX.spawn({x:c.x+rr(-.5,.5),y:c.y+rr(.1,1.4),z:c.z+rr(-.5,.5),vx:rr(-1,1),vy:rr(.5,2.2),vz:rr(-1,1),life:rr(.5,1),s0:.07,s1:.02,r:.4,g:1,b:.5,f:0,add:1})}break}
    case 'az':{if(a){const c=a.c;DL.add(c.x,c.y+.5,c.z,'#bfe8ff',9,3.2,.25);AU.at('elshock',c.x,c.y+.5,c.z,{vol:.9,range:40,rate:1.2})}break}
    case 'ax':if(a){const c=a.c;for(let i=0;i<14;i++)FX.spark(c.x,c.y+.2,c.z,rr(-3,3),rr(.5,3),rr(-3,3),rr(.1,.3));AU.at('dry',c.x,c.y+.3,c.z,{vol:.8,range:30});if(NET.cli&&a.alive)EP.despawn(a)}break;
    case 'uv':{const U=ELUV.L[m.i];if(U){if(NET.cli){U.st=1;U.t=ELUV.ON}ELUV.fxOn(U)}if(P&&P.alive&&P.team===TH)HUD.note(L?'UV on — the infected in it burn':'멸균등 켜짐 — 안의 좀비가 탄다',2);break}
    case 'uvx':{const U=ELUV.L[m.i];if(U&&NET.cli){U.st=2;U.t=ELUV.CD}break}
    case 'bl':if(a){HUD.announce(L?'BLINDED — POUR IT ON':'눈이 멀었다 — 몰아쳐!','h',2);AU.at('zpain',a.c.x,a.c.y+1.6,a.c.z,{vol:1,range:60,rate:1.2})}break;
    case 'bg':if(a&&!AU.throttle('elbg2',300)){const c=a.c;for(let i=0;i<8;i++)FX.spawn({x:c.x+Math.sin(a.yaw)*.3,y:c.y+1.55*EL_S,z:c.z+Math.cos(a.yaw)*.3,vx:rr(-1.5,1.5),vy:rr(0,2),vz:rr(-1.5,1.5),life:rr(.3,.6),s0:.06,s1:.02,r:.4,g:1,b:.5,f:0,grav:9,add:1})}break;
    case 'dn':if(a)HUD.note(L?'Down — ×1.5 damage':'그로기 — 피해 1.5배',2.5);break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'ph':HUD.announce(m.n===2?(L?'MEMORIES':'기억'):(L?'THE LAST VIAL':'마지막 한 병'),'z',3);AU.play('stingZ',{vol:.7});
      if(m.n===3&&a){const c=a.c;DL.add(c.x,c.y+1.5,c.z,'#5aff8a',26,5,1.2);AU.at('heart',c.x,c.y+1,c.z,{vol:1,range:90});SCEN.later(.5,()=>AU.at('heart',c.x,c.y+1,c.z,{vol:1,range:90}));
        for(let i=0;i<60;i++)FX.spawn({x:c.x,y:c.y+1.4,z:c.z,vx:rr(-5,5),vy:rr(-1,5),vz:rr(-5,5),life:rr(.5,1.2),s0:.1,s1:.03,r:.4,g:1,b:.55,f:0,add:1})}break;
    case 'enr':HUD.announce(L?'ELPIS IS ENRAGED':'엘피스 광폭화','z',2.5);break;
    // (the nurses' station's lamp stutters on over her while she stands there)
    case 'meet':{const M=MAP.ez.meet.p;AU.at('heart',M[0],M[1]+1,M[2],{vol:.9,range:50});if(this.meetL)this.meetL.dead=true;this.meetL=DL.add(M[0],M[1]+2.5,M[2],'#e2fff0',8,2.6,0,{flick:.12});this.meetT=G.t+2;
      AU.at('powerup',M[0],M[1]+3,M[2],{vol:.5,range:40,rate:1.6});break}
    case 'esc':AU.play('elklax',{vol:.8});if(NET.cli){ELUV.clear();ELGAS.clear();ELTHROW.clear()}break;
    case 'kit':{AU.play('heal',{vol:.8});HUD.note(L?'ELPIS\'s medic bag — patched up to 60':'엘피스의 구급 가방 — 체력 60까지 회복',2.5);
      for(const h of SCEN.H)if(h.alive)for(let i=0;i<10;i++)FX.spawn({x:h.c.x+rr(-.4,.4),y:h.c.y+rr(.3,1.6),z:h.c.z+rr(-.4,.4),vy:rr(.4,1.2),life:rr(.5,.9),s0:.1,s1:.03,r:.5,g:1,b:.6,f:8,add:1});break}
    case 'rh':AU.at('heal',0,E10CAR.y+1.2,51,{vol:.8,range:30});HUD.note(L?'RT-1\'s first-aid kit — patched up to 75':'1차 팀 구급함 — 체력 75까지 회복',2.5);break;
    case 'al':{if(NET.cli&&a){a.ae=a.ae||{t:3.2*EPTW(),T:3.2*EPTW()};a.ae.tg=m.z;a.aeT0=G.t;a.yaw=m.y/1000}const c=a&&a.c;if(c)AU.at('land',c.x,c.y,c.z,{vol:.5,range:20,rate:1.6});break}
    // (a vent about to catch: its grate glows and spits embers, the burner roars up below)
    case 'vw':{const F={k:'r',x:m.x/100,y:0,z:m.z/100,yaw:m.yw/1000,w:m.w/100,l:m.l/100},c=ELFIRE.pt(F,.5,0);DL.add(c[0],.4,c[1],'#ff5a14',F.l*.7,1.1,1.4,{flick:.3});AU.at('hiss',c[0],.5,c[1],{vol:.8,range:30,rate:.6});
      for(let k=0;k<18;k++){const p=ELFIRE.pt(F,Math.random(),rr(-.5,.5));FX.spawn({x:p[0],y:.05,z:p[1],vx:rr(-.4,.4),vy:rr(.6,2.2),vz:rr(-.4,.4),life:rr(.5,1.3),s0:.06,s1:.02,r:1,g:rr(.4,.7),b:.15,f:0,add:1})}break}
    case 'zx':if(NET.cli&&Array.isArray(m.z))for(const i of m.z){const z=byIdAny(i);if(z&&z.alive)EP.despawn(z)}break}}};
EPZ.elpis={hp:()=>ELP.hpFor(),init:a=>ELP.init(a,ELP.encNext),ai:(a,dt)=>ELP.ai(a,dt),
  hit:(t,dmg,src,o)=>t.el?ELP.hit(t,dmg,src,o):dmg,
  // the scalpel: 24 (32 heavy), 30 / 38 after the last vial; a shove
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?5:3.5,p3=EP.bossPh>=3;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.4,_dv.z*kb);a.scHit=G.t;
    hurtHuman(t,EPD((heavy?(p3?38:32):(p3?30:24))*elK()),a,{claw:1});return true},
  pre:(a,dt)=>ELP.pre(a,dt),attach:a=>ELP.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;if(t.el&&!t.el.enc&&!NET.cli){EP.say('eDie');if(t.el.sg){t.el.sg=null}}},
  gone(a){ELAS.stop(a,true);a.kin=null;if(a.el)a.el.mode='gone'}};
// the Patient: once, it gets back up (unless finished cleanly, or in a burning UV quarter)
EPZ.patient={init(a){a.ptR=a.ptRiseNow?1:0;a.ptRiseNow=0;a.ptUp=0},
  die(t,src,o){if(NET.cli||t.ptR||t.zc!=='patient')return;if(o&&(o.hs||o.he||o.w==='gl40'||elFire(o)))return;if(ELUV.lit(t.c.x,t.c.z))return;t.ptUp=G.t+3},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_patient')return;if(a.alive&&a.frozen<=0&&(a.ptR||a.elB))ch.mat.uniforms.uTint.value.set(.3,1,.45,.1+.06*Math.sin(G.t*5+a.id))},
  gone(a){a.ptUp=0}};
// the AED: no claws, no knockback; its own small hit box; the unit drawn where it lies with its leads to the body
EPZ.aed={hp:()=>ELAED.hpFor(),init(a){a.ae={t:3.2*EPTW(),tg:ELAED.next,T:3.2*EPTW()};a.epHide=false;a.elB=0;a.aeT0=null},
  ai:(a,dt)=>ELAED.ai(a,dt),
  hit(t,dmg,src,o){o.kb=0;o.up=0;return dmg},
  spark(t,o){if(!o||o.x==null||AU.throttle('e10sp',60))return;for(let i=0;i<4;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.1,.25),s0:.05,s1:.02,r:.8,g:1,b:.5,f:0,grav:9,add:1})},
  claw(){return true},
  pre(a){if(!a.alive)return;a.epAimY=.2;a.epPri=.28;a.epHide=false;const c=a.c;a.epAimP=(a.aeAim||(a.aeAim=new THREE.Vector3())).set(c.x,c.y+.15,c.z);
    if(!a.aeRay)a.aeRay=(ox,oy,oz,dx,dy,dz,t)=>{const q=a.c,r=rayAABB(ox,oy,oz,dx,dy,dz,q.x-.3,q.y,q.z-.3,q.x+.3,q.y+.42,q.z+.3,t);return r>=0?{t:r,part:'body'}:null};
    a.epRay=a.aeRay;a.epRayZc='aed'},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_aed')return;ch.mesh.visible=false;const X=ch.aeX||(ch.aeX=ELAED.rigX()),vis=ch.grp.visible&&a.alive;X.m.visible=X.lead.visible=vis;if(!vis)return;
    X.m.position.set(a.c.x,a.c.y,a.c.z);X.m.rotation.y=a.yaw;X.pT-=.016;if(X.pT<=0){X.pT=.3;sampleProbe(a.c.x,a.c.y+.5,a.c.z,X.mat.uniforms.uProbe.value)}
    // (the beat: slow, then quick as the charge fills; the client counts its own from when it saw the unit land)
    if(a.aeT0==null)a.aeT0=G.t;const k=clamp((G.t-a.aeT0)/3.2,0,1),rate=1.4+k*5;X.beep-=.016*rate;const on=X.beep>.6;if(X.beep<=0){X.beep=1;AU.at('beep2',a.c.x,a.c.y+.3,a.c.z,{vol:.55,range:24,rate:1.2+k*.6})}
    X.mat.uniforms.uEmisA.value=on?2.2:.3;
    const z=a.ae?byIdAny(a.ae.tg):null;if(z&&!z.alive&&z.c.y>-50){const dx=z.c.x-a.c.x,dz=z.c.z-a.c.z,L=Math.hypot(dx,dz);X.lead.position.set(a.c.x,a.c.y+.04,a.c.z);X.lead.lookAt(z.c.x,z.c.y+.25,z.c.z);X.lead.scale.set(.02,.02,Math.max(.1,L));
      if(on&&Math.random()<.3)FX.spawn({x:z.c.x+rr(-.3,.3),y:z.c.y+.4,z:z.c.z+rr(-.3,.3),vy:rr(.3,1),life:.3,s0:.05,s1:.02,r:.4,g:1,b:.6,f:0,add:1})}else X.lead.visible=false},
  die(t){const c=t.c;for(let i=0;i<22;i++)FX.spark(c.x,c.y+.2,c.z,rr(-4,4),rr(.5,4),rr(-4,4),rr(.15,.4));DL.add(c.x,c.y+.6,c.z,'#bfe8ff',7,2.6,.18);
    FX.spawn({x:c.x,y:c.y+.3,z:c.z,vy:.6,life:1.2,s0:.3,s1:1.1,r:.35,g:.36,b:.38,a:.5,f:2,drag:1});AU.at('dry',c.x,c.y+.3,c.z,{vol:.9,range:40});AU.at('dazap',c.x,c.y+.3,c.z,{vol:.7,range:30,rate:1.4});if(t.ch&&t.ch.aeX){t.ch.aeX.m.visible=t.ch.aeX.lead.visible=false}
    if(!NET.cli&&t.ae){const z=byIdAny(t.ae.tg);if(z&&!z.alive){z.e10k=(z.e10k|0)|16;z.elHold=0}if(!ELP.said.aedX)ELP.sayOnce('aedX')}t.epAimP=null;if(t.epRayZc==='aed'){t.epRay=null;t.epRayZc=null}},
  gone(a){if(a.ch&&a.ch.aeX){a.ch.aeX.m.visible=a.ch.aeX.lead.visible=false}a.epAimP=null;a.aeT0=null;if(a.epRayZc==='aed'){a.epRay=null;a.epRayZc=null}}};
Object.assign(ZGAIT,{elpis:{stride:1,knee:1,runK:1.08,bob:.9,twist:.9,sway:.9},patient:{stride:.85,knee:.8,runK:1,bob:1.2,twist:1.3,sway:1.5},aed:{stride:0,knee:0,runK:0,bob:0,twist:0,sway:0}});
Object.assign(JAW0,{elpis:.12,patient:.35,aed:0});

// ---------- the rig poses (every page): ELPIS aiming, throwing, the paddles out, kneeling, the dog tags to her chest, the radio at her ear,
// the vial at her neck, singing into the loudhailer, lunging, down, blinded, getting up; the Patient's lolling head ----------
{const pz=poseZombie;
  // [spine pitch (+ back), head pitch (+ up), L shoulder fwd, L shoulder out (−), L elbow, R shoulder fwd, R shoulder out (+), R elbow, jaw]
  const PT={idle:[-.04,.04,.3,-.16,.5,.7,.12,.9,.18],aim:[-.04,.04,1.05,-.1,1,1.5,.06,.06,.14],throw:[.18,.15,.45,-.4,.6,2.5,.35,.35,.4],shock:[-.22,-.08,1.35,-.3,.35,1.35,.3,.35,.35],
    kneel:[-.38,-.32,.95,-.2,1.05,.95,.2,1.05,.2],tags:[-.32,-.5,1.25,.25,2.15,.4,.12,.6,.1],call:[-.06,.12,.3,-.2,.5,1.55,.5,2.45,.3],vial:[-.2,.32,.5,-.3,.8,1.35,.65,2.5,.65],
    sing:[-.1,.28,.4,-.2,.6,1.45,.1,.4,.75],lunge:[-1,.7,.8,-.6,.2,.8,.6,.2,.6],down:[-.78,.3,.16,-.24,.4,.24,.26,.32,.85],blind:[-.28,-.38,1.6,.12,2.3,1.6,-.12,2.3,.5],rec:[-.62,.2,.4,-.3,.5,.4,.3,.5,.5]};
  const LG={kneel:[1.45,-1.5,.05,-.12,-1.55,.65,-.47],lunge:[-.25,-.35,.3,-.25,-.35,.3,0],rec:[1.15,-1.55,.4,1.15,-1.55,.4,-.38]};
  const STILL={kneel:1,tags:1,vial:1,sing:1,lunge:1,blind:1,rec:1,down:1};
  const ease=(a,key,t,rate)=>{const dt=clamp(t-(a[key]==null?t:a[key]),0,.1);a[key]=t;return 1-Math.exp(-dt*rate)};
  poseZombie=function(ch,st){
  if(st.zclass==='patient'&&!(st.dead>0)){pz(ch,st);const R=ch.R,t=st.t||0,sd=st.seed||0;_elM.makeRotationZ(Math.sin(t*.9+sd)*.22);R[2].multiply(_elM);_elM.makeRotationX(.12+Math.sin(t*1.3+sd)*.08);R[2].multiply(_elM);return}
  if(st.zclass!=='elpis'||st.dead>0||!ELP.cur||ELP.cur.ch!==ch){pz(ch,st);return}
  const a=ELP.cur,R=ch.R,t=st.t||0,P0=a.elPose||'',P=st.down>.3&&P0!=='lunge'?'down':P0||'idle';
  if(STILL[P]){st.spd=0;st.mvF=st.mvS=0;st.air=0;st.accel=0;st.turnRate=0;st.land=0}
  pz(ch,st);if(st.atk>0&&!STILL[P]){a.elT0=t;return}
  const q=PT[P]||PT.idle,E=a.elE||(a.elE=q.slice()),k=ease(a,'elT0',t,9);for(let i=0;i<9;i++)E[i]+=(q[i]-E[i])*k;
  const vib=P==='blind'?Math.sin(t*23)*.05:P==='sing'?Math.sin(t*9)*.03:0,sw=P==='idle'?Math.sin(t*1.2+(st.seed||0))*.05:0;
  setE(R[1],E[0],sw,Math.sin(t*.9)*.03);setE(R[2],E[1]+vib,0,0);
  setE(R[3],E[2]+sw*.5,0,E[3]);setE(R[4],Math.max(-.05,E[4]),0,0);setE(R[5],E[5]-sw*.5+vib,0,E[6]);setE(R[6],Math.max(-.05,E[7]),0,0);setE(R[11],-clamp(E[8],0,1.45),0,0);
  const L=LG[P];if(L){setE(R[0],0,0,0);setE(R[7],L[0],0,-.06);setE(R[8],L[1],0,0);setE(R[12],L[2],0,0);setE(R[9],L[3],0,.06);setE(R[10],L[4],0,0);setE(R[13],L[5],0,0);ch.root.set(0,L[6],0)}}}

// ---------- chapter 10 「엘피스」: Q-7's central laboratory (season 2's finale) ----------
//   1 the decon checkpoint in the yard — three waves; the Patient first shows up; then the lab's glass doors open
//   2 the atrium — 'act': three overrides, any order, 10 s each (the reception's security console, the control room's server on the west
//     gallery, the elevator's machine room on the east); 02's logs; then into the freight elevator (40 s) and down (24 s: the power cut at
//     B3, her voice on the PA; RT-1's first-aid cart in the car patches the riders up to 75)
//   3 B5's antechamber — 'hold' 75 s while the vault door's decontamination runs; at 10 s the ward's doors open and ELPIS steps out onto the
//     nurses' station (darts, AEDs on the team's kills, the defibrillator); back into the ward at 85 % or after 35 s
//   4 the stock vault — the boss fight, three phases (the triage, the memories, the last vial). A wipe replays the phase it reached
//   5 the escape — 75 s: the sterilization protocol locks the vault door and burns B5 out; through the vault's service door, the corridor,
//     the ward and the antechamber to the freight elevator (the incinerator's vents fire along the way). The car takes them up into the dawn
CHAP[10]={id:10,k:'elpis',map:'ep10',code:'RT1-02',season:2,n:['엘피스','ELPIS'],t:['좀비 시나리오: 엘피스','Zombie Scenario: ELPIS'],
  file:[['1차 회수팀 의무병 RT1-02. 억제제를 들고 혼자 격리구역 Q-7로 돌아와, 지하 병동에서 감염자들을 계속 되살리고 있다','RT-1\'s medic, RT1-02: she came back to Q-7 alone with the suppressant, and in the ward underground she keeps bringing the infected back'],
    ['시즌 2 최종장 · 화물 승강기로 지하 B5 · 제세동기를 쏴서 부숴라 · 자외선 멸균등 · 1차 회수팀의 기억 · 환자 좀비','Season 2\'s finale · down to B5 in the freight elevator · shoot the AEDs apart · the UV banks · the memories of RT-1 · the Patient']],
  cards:{place:['격리구역 Q-7 중앙 연구소 · 새벽','Q-7 CENTRAL LABORATORY · DAWN'],who:['1차 회수팀 의무병','RT-1 MEDIC'],line:['포기할 수 없었다 — 그래서 혼자 돌아왔다','She could not give up — so she came back alone']},
  boss:ELP,voice2:['엘피스','ELPIS'],voice3:['02의 기록','RT1-02 LOG'],
  // gates: A the lab's glass doors, B the elevator's top landing, L its bottom landing (B5), V the vault door, W the ward's doors, S the vault's
  // service door (the escape)
  gates:['gA','gB','gL','gV','gW','gS'],gateDur:{gA:1.2,gB:1.4,gL:1.4,gV:3.2,gW:1.2,gS:1.2},
  stages:[null,
    {z:'A',k:'waves',n:['제독 검문소','The decon checkpoint'],on:['검문소를 지켜라','Hold the checkpoint'],prep:18,clr:'s1c',intro:{zc:'patient',say:'pat',at:3},doorN:['연구소 정문','LAB DOORS'],get wn(){return (G.diff||0)>=3?.62:1},
      wave:w=>[['rager',40],['runner',20],['patient',w>=2?22:16],['strait',w>=2?8:4],['squad',w>=2?6:0],['bomber',w>=2?5:0],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['본관 아트리움','The atrium'],on:['보안 해제','The overrides'],dev:'ovr',say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'o1':'o2',get cap(){const d=G.diff||0;return d>=3?.31:d>=2?.42:.46},gap:1.4,doorN:['화물 승강기','FREIGHT ELEVATOR'],
      intro:{zc:'hazmat',say:'hzm',at:6},mix:[['rager',38],['runner',15],['patient',22],['hazmat',9],['strait',6],['scream',5],['bomber',5]]},
    {z:'C',k:'hold',n:['B5 격리 전실','B5\'s antechamber'],on:['보관실 문 해제까지 버텨라','Hold till the vault door opens'],len:75,meet:{at:10,cap:.45},get cap(){return (G.diff||0)>=3?.44:.6},gap:1.3,
      say:'s3',clr:'s3c',hp:[0,0,24,2.6],mk:[0,4.4,5.4,['원액 보관실 문','VAULT DOOR']],doorN:['원액 보관실','STOCK VAULT'],intro:{zc:'aed',say:'aedT',at:2},
      mix:[['patient',50],['rager',28],['runner',16],['scream',6]]},
    {z:'D',k:'boss',n:['원액 보관실','The stock vault'],on:['엘피스를 쓰러뜨려라','Bring ELPIS down'],say:'s4',go:'b0',prepPt:[0,0,-4,2]},
    {z:'D',k:'escape',n:['멸균 프로토콜','The sterilization protocol'],on:['화물 승강기로','To the freight elevator'],len:75,mix:[['patient',50],['rager',32],['runner',18]],get cap(){return (G.diff||0)>=3?.45:.6},gap:1.5}],
  // (the vault door stays open through the boss stage's prep: bossGo shuts it behind the team; the ward's doors open at the meeting)
  // (the top landing's gate opens for the boarding — stage 2 cleared, the 'move' —, the bottom one from B5 on)
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n===3&&EP.ph==='move')m|=b('gB');else if(n>=3)m|=b('gL');if(n>=4)m|=b('gW');if(n===4&&kind!=='phase')m|=b('gV');return m},
  setup(){ELP.said={};ELP.sayT={};E10CAR.clear();this.rideSaid=0;
    // (once: the trickle leaves the AEDs out of its count, and a stage may space its spawns out (D.gap); episode.js loads after this file)
    if(!EP.tr10){const tr=EP.trickle;EP.tr10=1;EP.trickle=function(dt,mix,capK){if(!on10())return tr.call(this,dt,mix,capK);const d=G.diff||0;let alive=0;for(const z of SCEN.Z)if(z.alive&&!z.boss&&z.zc!=='aed'&&z.zc!=='sentry')alive++;
      const cap=Math.round((3+1.6*SCEN.H.length)*SC_DIFF.n[d]*(capK||1));this.spawnT-=dt;if(alive<cap&&this.spawnT<=0){const ok=SCEN.spawn(this.roll(mix)),D=this.S();this.spawnT=ok?rr(.7,1.4)*(D&&D.gap||1)/(SC_DIFF.n[d]*(.7+.1*SCEN.H.length)):.4}}}},
  // every stage: the mines, the gas, the fire cleared; the UV banks in the boss stage
  stageStart(n,kind){E9MINE.clear();ELGAS.clear();ELFIRE.clear();ELTHROW.clear();if(n===4)ELUV.build();else ELUV.clear();
    if(!NET.cli){ELP.escT=0;ELP.ventT=0;ELP.vaultT=0}},
  stageDone(st){if(st===2)EP.later(4,()=>EP.say('log3'));if(st===3)EP.later(2.5,()=>EP.say('s3d'))},
  devDone(st,i,left){if(st===2&&left>0)EP.later(3,()=>EP.say(left===2?'log1':'log2'))},
  // ---------- the freight elevator: board (40 s, the 'move' after stage 2), the ride down (24 s), out at B5 ----------
  hostPh(ph,dt){if(ph==='ride'){EP.t-=dt;G.time=Math.max(0,EP.t);this.rideTick();if(EP.t<=0)this.rideEnd();return true}
    if(ph==='move'&&EP.st===2){if(humansAlive()===0){EP.fail();return true}EP.t-=dt;G.time=EP.t;EP.trickle(dt,CHAP[10].stages[2].mix,(G.diff||0)>=3?.45:.6);this.botsIn();
      let all=true,n=0;for(const h of SCEN.H)if(h.alive){n++;if(!E10CAR.inside(h))all=false}if(all&&n||EP.t<=0)this.rideStart();return true}
    return false},
  // (a bot at the car's door is lifted in to its place)
  botsIn(){const C=MAP.ez.car.top;let i=0;for(const h of SCEN.H){if(!h.alive)continue;const k=i++;if(!h.bot||E10CAR.inside(h))continue;
      if(Math.abs(h.c.y-C[1])>1.4||Math.abs(h.c.x-C[0])>3.4||h.c.z<C[2]-5.5||h.c.z>C[2]+8)continue;const s=E10CAR.slot(k);placeAt(h,C[0]+s[0],C[1]+.02,C[2]+s[1],Math.PI)}},
  // (the last ones are pulled in as the gate shuts)
  rideStart(){const tp=[],C=MAP.ez.car.top;let i=0;
    for(const h of SCEN.H){if(!h.alive||E10CAR.inside(h))continue;const s=E10CAR.slot(i++),x=C[0]+s[0],z=C[2]+s[1];placeAt(h,x,C[1]+.02,z,Math.PI);tp.push([h.id,r2(x),r2(C[1]+.02),r2(z),r3(Math.PI)])}
    const ids=[];for(const a of SCEN.Z)if(a.alive){EP.despawn(a);ids.push(a.id)}SCEN.closePick(false);EP.setGates(EP.gm&~EP.bit('gB'));
    EP.ph='ride';EP.t=E10CAR.RIDE;G.st='fight';G.time=EP.t;this.rideBegin();if(NET.host)netEv('e10r',{P:tp,z:ids})},
  rideBegin(){EP.radio('ride');HUD.announce(LI()?'DOWN TO B5':'B5로','w',2.5);this.rideSaid=0},
  // (5 s down: RT-1's first-aid cart — whoever is riding is patched up to 75; the cut at B3; her voice; the landing)
  rideTick(){const t=E10CAR.t,once=(b,k)=>{if(!(this.rideSaid&b)){this.rideSaid|=b;if(k)EP.say(k)}};if(t>9.7)once(1,'ride2');if(t>11)once(2,'rPA');if(t>13.1)once(4,'ride3');if(t>22.2){once(16,null);if(!EP.gateIsOpen('gL'))EP.setGates(EP.gm|EP.bit('gL'))}
    if(t>5&&!(this.rideSaid&8)){this.rideSaid|=8;for(const h of SCEN.H)if(h.alive&&E10CAR.inside(h,.3))h.hp=Math.max(h.hp,75);ELP.fx({k:'rh'})}},
  rideEnd(){const arr={};for(const h of SCEN.H){if(!h.alive)continue;arr[h.id]=[h.c.x,h.c.y,h.c.z,h.yaw]}EP.stageStart(3,'next',null,arr)},
  // (whoever is still in the vault door's way when it shuts is put inside: the clients get their places in epgo)
  bossGo(){EP.setGates(EP.gm&~EP.bit('gV'));const Z=MAP.ez.zones.D,out=[];let i=0;
    for(const h of SCEN.H){if(!h.alive||EP.inBox(Z.box,h.c.x,h.c.z,0))continue;const s=Z.start[i++%Z.start.length];placeAt(h,s[0],s[1],s[2],s[3]);out.push([h.id,r2(s[0]),r2(s[1]),r2(s[2]),r3(s[3])])}return out},
  // the escape: the vault door locks, its service door opens; her mines, gas and AEDs go with her; the infected come out of the ward and the
  // antechamber ahead of them
  escapeStart(){EP.setGates((EP.gm&~EP.bit('gV'))|EP.bit('gS')|EP.bit('gW')|EP.bit('gL'));SCEN.zsp=MAP.ez.zW.concat(MAP.ez.zones.C.zsp,MAP.ez.zones.D.zsp);
    if(!NET.cli){for(const M of E9MINE.L.slice())E9MINE.kill(M,0);ELGAS.clear();const ids=[];for(const a of SCEN.Z)if(a.alive&&!a.boss){EP.despawn(a);ids.push(a.id)}if(ids.length)ELP.fxSend({k:'zx',z:ids});ELP.ventT=4;ELP.vaultT=0}
    ELUV.clear();ELP.fx({k:'esc'});EP.later(1.2,()=>EP.say('eStart'));
    // (her medic bag, dropped where she fell: whoever is up is patched up to 60 for the run — they came out of phase 3 on what it left them)
    if(!NET.cli)EP.later(2.6,()=>{if(!on10()||EP.S().k!=='escape'||EP.ph!=='run')return;for(const h of SCEN.H)if(h.alive)h.hp=Math.max(h.hp,60);ELP.fx({k:'kit'});EP.say('kit')})},
  onFinish(win){if(win)EP.t=Math.max(EP.t,22)},
  endFx(r){if(r.win){this.ending();if(r.bonus)E10CAR.depart()}},
  clear(){ELP.clear();E10CAR.clear();ELUV.clear();ELGAS.clear();ELFIRE.clear();ELTHROW.clear();E9MINE.clear();this.rideSaid=0;this.fogK=this.fogK0=null;
    if(MAP.id==='ep10'&&MAP.env){LU.uFogC.value.set(MAP.env.fog);LU.uFogD.value=MAP.env.fogD}},
  // every page, every frame: the car, the gas, the fire, the throws, the banks, the mines; the air (the dawn's haze up top, B5's own below);
  // host: the Patients getting back up, the escape's fire
  update(dt){E10CAR.update(dt);ELGAS.update(dt);ELFIRE.update(dt);ELTHROW.update(dt);ELUV.update(dt);E9MINE.update(dt);this.air(dt);
    if(NET.cli)return;this.rises();if(E10CAR.mode==='up'&&E10CAR.t>14&&!EP.gateIsOpen('gB'))EP.setGates(EP.gm|EP.bit('gB'));if(EP.S().k==='escape'&&EP.ph==='run'){this.botsDown();ELP.escTick(dt)}},
  air(dt){const E=MAP.env||{},under=R.cam.position.y<17,fc=under?'#0e1218':E.fog||'#8a8496',fd=under?.024:E.fogD||.013,k=Math.min(1,dt*2.5);
    if(this.fogK!==fc){this.fogK=fc;this.fogC=new THREE.Color(fc)}LU.uFogC.value.lerp(this.fogC,this.fogK0===fc?k:1);this.fogK0=fc;LU.uFogD.value+=(fd-LU.uFogD.value)*k},
  // a Patient's own rise, 3 s after it fell (if nothing finished it meanwhile)
  rises(){for(const z of SCEN.Z){if(!z.ptUp||z.alive)continue;if(z.c.y<-50||(z.e10k&31)||ELUV.lit(z.c.x,z.c.z)){z.ptUp=0;continue}if(G.t<z.ptUp)continue;z.ptUp=0;ELP.rise(z,false);if(z.alive){z.hp=z.maxHp*.45;ELP.sayOnce('patUp')}}},
  // (the car waits at B5 with its gate open: a bot reaching it is put in its place)
  botsDown(){const C=MAP.ez.car.bot;let i=0;for(const h of SCEN.H){if(!h.alive)continue;const k=i++;if(!h.bot||E10CAR.inside(h))continue;
      if(Math.abs(h.c.y-C[1])>1.4||Math.abs(h.c.x-C[0])>3.4||h.c.z<C[2]-7.5||h.c.z>C[2]+5.5)continue;const s=E10CAR.slot(k);placeAt(h,C[0]+s[0],C[1]+.02,C[2]+s[1],0)}},
  // bots: into the car (a place each); stock still on the ride; the escape a door at a time (the vault's service door → the corridor's end →
  // the ward's doors → the car: one path the whole way is more than the path search will look through)
  goal(a,i){if(EP.st===2&&EP.ph==='move'){const C=MAP.ez.car.top,s=E10CAR.slot(i);return [C[0]+s[0],C[1],C[2]+s[1],.25]}if(EP.ph==='ride')return [0,E10CAR.y,51,1];
    if(EP.S().k==='escape'){const w=this.escW(a);if(w<3)return MAP.ez.escP[w];const C=MAP.ez.car.bot,s=E10CAR.slot(i);return [C[0]+s[0],C[1],C[2]+s[1],.25]}},
  escW(a){const x=a.c.x,z=a.c.z;if(x>-22.2&&z<2.2)return 0;if(x<-22.2&&z<7.6)return 1;if(x<-14.2)return 2;return 3},
  botPost(a){if(EP.ph==='ride'){a.cmd.f=a.cmd.s=0;a.cmd.jump=false;return}
    if(EP.ph==='run'&&EP.S().k==='escape'){const B=a.bot,w=this.escW(a);if(B&&B.e10w!==w){B.e10w=w;B.epG=null}}},
  markers(list,L){if(EP.st===2&&EP.ph==='move'){const C=MAP.ez.car.top;list.push([C[0],C[1]+3.2,C[2]+2,L?'FREIGHT ELEVATOR':'화물 승강기','g']);return true}return EP.ph==='ride'},
  objText(L,ts){if(EP.st===2&&EP.ph==='move')return [(L?'Into the freight elevator!':'화물 승강기 탑승!')+` · ${ts}${L?'s':'초'}`,EP.t/40];
    if(EP.ph==='ride')return [L?'Going down to B5…':'B5로 내려가는 중…',clamp(E10CAR.t/E10CAR.RIDE,0,1)];return null},
  deadText(L){if(EP.ph==='ride')return L?'Down — back on your feet when the car reaches B5 · spectating':'쓰러짐 — 승강기가 B5에 닿으면 다시 일어나요 · 관전 중';return null},
  // a shot on one of her mines sets it off (a client tells the host)
  boxShot(eh,a,W){if(eh.k!=='mine')return;if(NET.cli){if(!AU.throttle('e10s'+eh.i,150))netToHost({t:'e10s',i:eh.i});return}this.shotHit(eh.i)},
  shotHit(i){const M=E9MINE.byId(i);if(M&&M.st>=1)E9MINE.kill(M,true)},
  // after the clear: the recorder in her vest; the season's card
  ending(){EP.later(2.6,()=>EP.radio('clear'));EP.later(5.4,()=>EP.radio('end0'));EP.later(9.4,()=>EP.radio('end1'));EP.later(13.4,()=>EP.radio('end2'));EP.later(16.4,()=>EP.radio('end3'));EP.later(18.6,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'ZOMBIE SCENARIO · SEASON 2':'좀비 시나리오 · 시즌 2'}</small><h1>${L?'SEASON 2 COMPLETE':'시즌 2 완결'}</h1><p>${L?'All seven of RT-1 — it is over. The stock had already left Q-7.':'1차 회수팀 일곱 명 — 모두 끝났다. 원액은 이미 Q-7을 떠났다.'}</p><b>${L?'NEXT — SEASON 3 · COMING SOON':'다음 이야기 — 시즌 3 · 준비 중'}</b></div></div>`;
    el.className='on';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},9000)},
  radio:{
    start:['2차 회수팀, 격리구역 Q-7이다. 모든 게 시작된 곳 — 02는 중앙 연구소 지하에 있다. 제독 검문소부터 확보해.','RT-2, this is Quarantine Zone Q-7. Where it all began — 02 is underneath the central lab. Secure the decon checkpoint first.',0],
    w1:['검문소로 몰려온다!','They are coming at the checkpoint!',1],
    pat:['환자복을 입은 놈들이다 — 팔에 링거 바늘이 꽂혀 있어. 쓰러뜨려도 다시 일어난다! 머리를 쏘거나 폭발이나 불로 끝내!','Those ones are in hospital gowns — drip needles still in their arms. Put them down and they get back up! Finish them with a headshot, a blast or fire!',1],
    patUp:['저놈 또 일어났어! 머리를 노려!','That one got back up! Go for the head!',1],
    s1c:['검문소 확보. 연구소 정문 연다.','The checkpoint is ours. Opening the lab\'s doors.',0],
    s2:['02가 건물 전체를 잠가 놨다. 보안 해제 셋 — 안내 데스크 콘솔, 2층 중앙 통제실 서버, 승강기 기계실. 그래야 B5로 내려가는 화물 승강기가 움직인다.','02 has locked the whole building down. Three overrides — the reception\'s console, the control room\'s server upstairs, the elevator\'s machine room. Then the freight elevator down to B5 will run.',0],
    hzm:['방호복 입은 연구원이다 — 쓰러뜨리면 등의 탱크가 터져서 마취 가스가 퍼진다. 떨어져서 쏴!','A researcher in a hazmat suit — put it down and the tank on its back bursts into gas. Shoot it from a distance!',1],
    o1:['하나 해제. 둘 남았다.','One done. Two to go.',0],
    o2:['마지막 하나!','Last one!',0],
    log1:['…02 기록. Q-7 도착. 연구소엔 아직 전기가 들어온다. 원액은 B5 보관실에 있다.','…02, log. Made it to Q-7. The lab still has power. The stock is in the vault on B5.',3],
    log2:['…02 기록. 보관실이 비어 있다. 반출 기록이 있다 — 수령처는 지워져 있다.','…02, log. The vault is empty. There is a release record — the recipient has been erased.',3],
    log3:['…02 기록. 괜찮아. 내가 만들면 돼. 환자는 여기 많으니까.','…02, log. It is all right. I will make it myself. There are plenty of patients here.',3],
    s2c:['보안 해제 완료 — 화물 승강기에 전원이 들어왔다. 타! 다 타면 내려간다.','Overrides done — the freight elevator has power. Get in! We go down when everyone is aboard.',0],
    ride:['B5까지 내려간다. 카트에 1차 팀 이름표가 붙은 구급함이 있어 — 02가 두고 간 거다. 써.','Going down to B5. There is a first-aid kit on a cart with RT-1\'s tag on it — 02 left it. Use it.',0],
    ride2:['전원이 나갔다—! 멈췄어!','The power is gone—! We have stopped!',1],
    rPA:['…환자분들, 조금만 기다리세요. 곧 치료해 드릴게요.','…Patients, please wait a little longer. I will be with you soon.',2],
    ride3:['예비 전원 — 다시 내려간다.','Backup power — going down again.',0],
    s3:['B5 격리 전실이다. 원액 보관실 문이 제독을 돌리고 있어 — 75초. 그동안 버텨.','B5\'s antechamber. The vault door is running its decontamination — 75 seconds. Hold out till then.',0],
    enc:['병동 문이 열린다 — 누가 나온다!','The ward\'s doors are opening — someone is coming out!',1],
    enc2:['…1차 회수팀 의무병 RT1-02, 엘피스. 억제제를 들고 다니던 사람이다.','…RT-1\'s medic, RT1-02. ELPIS. She was the one who carried the suppressant.',0],
    eMeet:['다쳤어? 이리 와. 치료해 줄게.','Are you hurt? Come here. I will look after you.',2],
    aedT:['시체에 제세동기를 붙인다! 그 기계를 쏴서 부숴 — 아니면 일어난다!','She is putting an AED on a body! Shoot the unit apart — or it gets back up!',1],
    aedX:['제세동기 부쉈다 — 그건 못 일어나!','The AED is wrecked — that one stays down!',1],
    eRet:['병동 안으로 들어갔다.','She has gone back into the ward.',1],
    s3c:['제독 끝 — 보관실 문이 열린다.','Decontamination done — the vault door is opening.',0],
    s3d:['…저 안이다. 02가 기다리고 있어.','…In there. 02 is waiting.',0],
    s4:['보관실 네 구역 천장에 자외선 멸균등이 있다 — 벽 스위치에서 E를 3초. 그 구역에 있는 엘피스는 눈이 멀고, 안의 좀비는 타고, 시체는 다시 못 일어난다.','There are UV banks over each quarter of the vault — hold E 3 s at a wall switch. ELPIS caught in that quarter is blinded, the infected in it burn, and the bodies in it can never get up again.',0],
    b0:['…다들 여기 있어. 아무도 포기 안 해. 너희도.','…Everyone is here. I am not giving up on anyone. Not on you either.',2],
    eDart:['진정제 다트다 — 초록 띠에서 비켜!','Sedative darts — out of the green strip!',1],
    eAed:['또 제세동기다 — 시체 옆의 기계를 쏴!','Another AED — shoot the unit by the body!',1],
    eShock:['전기 충격 — 원에서 떨어져!','Defibrillator — get out of the ring!',1],
    eGas:['마취 가스 — 초록 연기에서 나와!','Anaesthetic gas — out of the green cloud!',1],
    eUvOn:['멸균등이 켜졌다 — 그 구역 안의 좀비가 탄다!','The UV is on — the infected in that quarter are burning!',1],
    eBlind:['눈이 멀었다 — 지금 몰아쳐!','She is blinded — pour it on!',1],
    eDown:['쓰러졌다! 집중 사격!','She is down! Pour it on!',1],
    eP2:['군번줄을 꺼낸다… 1차 팀 전원 거다.','She is taking out dog tags… all of RT-1\'s.',1],
    eP2l:['다들 아직 여기 있잖아. 같이 하자.','You are all still here. Let us do this together.',2],
    eP2r:['누구랑 말하는 거야…? 아무도 없잖아.','Who is she talking to…? There is nobody there.',1],
    m_argus:['07, 엄호해.','07, cover me.',2],
    m_legatus:['01, 좌표 보낼게. 포격 부탁해.','01, sending you coordinates. Fire for me.',2],
    m_charon:['06, 조명탄!','06, flare!',2],
    m_daedalus:['04, 지뢰 깔아 줘.','04, lay the mines.',2],
    m_lorelei:['03, 노래해 줘. 다들 모이게.','03, sing for me. Bring them all in.',2],
    m_lyrebird:['05, 우리 안 보이게 해 줘.','05, keep us hidden.',2],
    eP3:['주사기를 꺼낸다 — 그게 마지막 원액이야!','She has a syringe — that is the last of the stock!',1],
    eP3l:['…04, 미안. 이건 내가 쓸게.','…04, I am sorry. I am using this one myself.',2],
    eLunge:['덮친다 — 빨간 띠에서 비켜!','She is lunging — out of the red strip!',1],
    eMass:['바닥을 내리친다 — 뛰어넘어! 시체마다 제세동기가 붙는다!','She is slamming the floor — jump it! There is an AED on every body!',1],
    eEnr:['시간 끌면 안 돼 — 점점 거세진다!','We cannot drag this out — she is getting worse!',0],
    eAmmo:['보급 사물함에서 탄약 상자가 나왔다 — 밟으면 보충된다.','Ammo crates out of the supply lockers — walk over them to top up.',1],
    eDie:['…괜찮아… 다들… 살 수 있어…','…It is all right… everyone… can still live…',2],
    dead:['엘피스 무력화. 1차 회수팀 의무병 RT1-02 — 확인했다. 1차 회수팀 일곱 명, 전원 확인.','ELPIS is down. RT-1\'s medic, RT1-02 — confirmed. All seven of RT-1, accounted for.',0],
    kit:['그녀의 구급 가방이다 — 다들 써! 그리고 뛰어!','Her medic bag — everyone, use it! Then run!',1],
    eStart:['멸균 프로토콜이다 — B5를 통째로 태운다! 보관실 문이 잠겼어 — 뒤쪽 설비 통로로, 병동을 지나 승강기까지 75초!','The sterilization protocol — it is burning out all of B5! The vault door has locked — out the back through the service corridor and the ward to the elevator, 75 seconds!',0],
    esc:['전원 탑승 — 올라간다!','Everyone is in — going up!',0],
    late:['…승강기는 놓쳤다. 그래도 끝났어.','…We missed the elevator. But it is over.',0],
    clear:['…엘피스의 조끼에 기록 장치가 있다.','…There is a recorder in ELPIS\'s vest.',0],
    end0:['…02 마지막 기록. 원액 12병 — 봉쇄 하루 전에 반출됐다. 수령처는 지워져 있다.','…02, last log. Twelve vials of the stock — taken out the day before the lockdown. The recipient has been erased.',3],
    end1:['…반출 기록 맨 끝에 한 줄이 더 있다. 「2차 회수팀 — 투여 완료. 관찰 기간 30일.」','…There is one more line at the very end of the release record. 「RT-2 — dose given. Observation period: 30 days.」',3],
    end2:['…투여? 우리가 맞은 건 출동 전 예방 주사뿐인데.','…A dose? All we got was the shot before we deployed.',1],
    end3:['…2차 회수팀. 기록 장치는 열지 말고 그대로 가져와라. 복귀하라.','…RT-2. Bring the recorder back unopened. Return to base.',0]}};

// ---------- hooks ----------
(function(){
  Object.assign(CLIH,{e10(L,m){ELP.fxApply(m)},
    e10r(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);for(const i of m.z||[]){const a=byIdAny(i);if(a)EP.despawn(a)}
      EP.ph='ride';EP.t=E10CAR.RIDE;SCEN.closePick(false);CHAP[10].rideBegin()}});
  Object.assign(HOSTH,{e10s(L,m){if(!on10()||!actorOfKey(L.key))return;CHAP[10].shotHit(m.i|0)}});
  // an AED stays where it landed: no physics, and nobody shoves it
  const ap=actorPhysics;actorPhysics=function(a,dt){if(a.zc==='aed'&&a.alive&&on10())return;return ap(a,dt)};
  const sp0=separate;separate=function(dt){if(!on10())return sp0(dt);const S=[];for(const a of SCEN.Z)if(a.alive&&a.zc==='aed')S.push([a,a.c.x,a.c.z]);sp0(dt);for(const [a,x,z] of S){a.c.x=x;a.c.z=z}};
  // slowed in the gas; a body brought back runs faster (its spdMul, set as it rose); the riders of the car another page moves: drawn in it
  const ms=maxSpeed;maxSpeed=function(a){let s=ms(a);if(on10()&&a.team===TH&&a.elSlowT>G.t)s*=.65;return s};
  const np=netPuppet;netPuppet=function(a,dt){np(a,dt);if(on10()&&a.alive&&a.team===TH&&(E10CAR.mode==='ride'||E10CAR.mode==='up'))E10CAR.pup(a)};
  // how a zombie of this chapter died (a clean kill stays down); a body being brought back is not recycled by the pool meanwhile
  // (an AED is a machine: no blood, no limbs, no pool)
  const kz=killZombie;killZombie=function(t,src,o){const was=t.alive;o=o||{};const aed=on10()&&t.zc==='aed';if(aed)o=Object.assign({},o,{dir:null,hs:false,he:false});
    else if(was&&on10()&&t.scen)t.e10k=(o.hs?1:0)|(o.he||o.w==='gl40'?2:0)|(elFire(o)?4:0);kz(t,src,o);if(aed){t.poolT=0;t.spurts=null}};
  // (an AED landing is no zombie getting up: not its groan)
  const rz0=reviveZombie;reviveZombie=function(a,at,rise){if(!(a.zpick==='aed'&&on10()))return rz0(a,at,rise);const au=AU.at;AU.at=function(k){if(k==='zrevive')return null;return au.apply(AU,arguments)};try{return rz0(a,at,rise)}finally{AU.at=au}};
  const sp=SCEN.spawn;SCEN.spawn=function(zc,at){if(!on10())return sp(zc,at);const hold=[];for(const z of SCEN.Z)if(!z.alive&&(z.ptUp||z.elHold)){hold.push([z,z.deadT]);z.deadT=0}const r=sp(zc,at);for(const [z,t] of hold)z.deadT=t;return r};
  // a fresh one forgets how it last died and what it was; a body brought back by her keeps the green
  const orv=SCEN.onRevive;SCEN.onRevive=function(a){orv(a);if(!on10()||!a.scen)return;a.e10k=0;a.elHold=0;if(!a.elRiseB)a.elB=0;a.elRiseB=false};
  // a Hazmat's tank bursts into her gas here (chapter 5's spores belong to chapter 5)
  if(EPZ.hazmat){const hd=EPZ.hazmat.die;EPZ.hazmat.die=function(t,src,o){if(on10()){if(!NET.cli)ELGAS.add(t.c.x,t.c.y,t.c.z,3.2,5,3.5);return}return hd(t,src,o)}}
  // a body brought back glows green (every page)
  const uv0=updateVisual;updateVisual=function(a,dt){uv0(a,dt);if(on10()&&a.team===TZ&&a.alive&&a.elB&&a.ch&&a.zc!=='patient'&&a.frozen<=0)a.ch.mat.uniforms.uTint.value.set(.3,1,.45,.1+.06*Math.sin(G.t*5+a.id))};
})();

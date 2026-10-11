'use strict';
// ============ Chapter 5 「티아마트」: the boss TIAMAT (Q7-Ω), the drowned and hazmat zombies, the little centipedes, the water ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, smoke, ammo boxes — are in epbase.js;
// the larva zombie and its swarms come from khepri.js). Host-authoritative: the host runs TIAMAT's brain, every hit, the water levels
// and the devices; clients get the gauges and states in the chapter snapshot (EP.pack → bsPack) and the moments as events ('etm').
// TIAMAT, Q7's chief researcher fused with the origin strain: a centipede 36 m long (a head with the researcher's upper body sunk into
// it, 14 segments behind), 23,500 × (0.6 + 0.4 × humans) × difficulty health. Its head is the actor; the body follows the path the head
// took (every page keeps that trail itself). It cannot be hurt under the water. Parts: the head ×1.2, the segments ×0.3, the core
// under its jaw ×3 (only while it roars or breathes), four egg sacs on its back (4 % each: a burst one staggers it and lets out grubs,
// all four floor it for 8 s), three glowing joints (4 % each: a cut one drops every segment behind it — they crawl on as little
// centipedes, 3 % each).
//   phase 1 (100–70 %, the surge tank, shallow water)  it cruises the two trenches at the surface like a crocodile (it can be shot)
//            and goes deep to strike. The rise (red ripples under a target 1.5 s: 36 and thrown up, then it arcs 20 m over into the
//            other trench, the body bare all the way), the tail (rises 1 s out of the water, an 8 m strip: 30 and 3 s of venom, 4 a
//            second), beaching (people crowding the pump dais: it throws itself across it, 20 and knocked flat, then lies stuck 4 s: ×1.5)
//   70 %     it bursts the inflow sluice: the hall floods to 1.2 m (−40 % speed, no jumping, grenades sink); the walkways stay dry
//   phase 2 (70–40 %)  it swims through the flooded hall, its egg sacs out of the water. Coiling a pillar with people on its platform
//            (30 a second for 3 s; the glowing section loses 3 % of its health → it lets go), spore breath (8.5 m, 9 s, 6 a second;
//            the vent fans blow it away), calling the drowned (3), the rise from the floor. The two drain wheels (6 s each, together)
//            empty the hall for 10 s: stranded on the floor, ×1.5 (45 s before the next drain)
//   40 %     it breaks the gate to shaft No. 3 and climbs its column; the team follows up the ramp
//   phase 3 (40–0 %)  the surface gauge: 2 minutes to the top (100 = it gets out: a life lost, the phase again); every egg sac and every
//            4 % of its health knocks it back 8. The nest on the shaft's floor boils (8 a second): the fight is up the ramp. Rocks on the ramp (35), water jets that wash people down it (20), the drowned and
//            runners; at 10 % the core opens for good
// Stagger: the core, the sacs, the joints, a stranding, HE +15 (above the water), frost +10. Enraged after 240 s (expert 180).
// TM_K: the body's models are built at 1/1.4 of its size (the head 2.9 m across, a segment 2.7 m)
const TM_PH=[1,.7,.4],TM_K=1.4,TM_N=14,TM_GAP=2.4*1.4,TM_HD=2.2*1.4,TM_SACS=[3,5,7,9],TM_JOINTS=[5,9,12];
const TM_MODE=['','er','erW','tl','tlW','bch','bchW','bchX','coil','coilW','coilS','coilR','br','brW','sum','str','climb','ph','down','ret','gone','gl','lc','top','dive'];
const TM_FIRE={salamander:1,bdc:1,rdc:1,gas:1},TM_AIM={core:6,head:5,sac:4.5,joint:3,sting:2.5,tail:2,seg:1};

// ---------- atlas materials: the carapace, its plates, the glowing membrane, the egg sacs, the core, infected flesh, the lab coat ----------
const TM_MATS=['tmCarap','tmPlate','tmMemb','tmSac','tmCore','tmFlesh','tmCoat'];
for(const m of TM_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintTmAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){let c=fn(xx,y,x0+xx,y0+y),a=alpha||255;if(!c)continue;if(Array.isArray(c)){a=c[1];c=c[0]}const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=a}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the carapace: wet teal-black, an oily green sheen in streaks, pale scar lines
  patch('tmCarap',(xx,y,X,Y)=>{const t=nz(X,Y,5501,18),u=nz(X,Y,5502,6);let c=t>.66?'#1e3836':t>.48?'#142624':'#0c1716';if(u>.7)c=mix(c,'#2e5a4a',.45);if(y%31<2)c='#060a0a';if(hash2(X,Y,5503)<.01)c='#8a9a8a';return c},247);
  // the plates and the legs: red-brown chitin, like a scolopendra's
  patch('tmPlate',(xx,y,X,Y)=>{const t=nz(X,Y,5504,12);let c=t>.62?'#7a3422':t>.44?'#5a2418':'#3e170e';if(y%22<2)c='#1e0a06';if(hash2(X,Y,5505)<.02)c='#b8705a';return c},246);
  // the membrane between the plates: glowing magenta-green
  patch('tmMemb',(xx,y,X,Y)=>{const t=nz(X,Y,5506,10),v=Math.abs(Math.sin(xx*.18+nz(X,Y,5507,20)*6));let c=t>.6?'#e070c8':t>.42?'#a040a0':'#6a2a70';if(v<.1)c='#9aff9a';return c},232);
  // an egg sac: a stretched yellow-green skin over dark curled shapes, glowing veins
  patch('tmSac',(xx,y,X,Y)=>{const t=nz(X,Y,5508,14),e=nz(X,Y,5509,7);let c=t>.6?'#b8c070':t>.42?'#8a9a4a':'#5e6a30';if(e>.66)c=mix(c,'#2a2a14',.6);if(Math.abs(Math.sin(xx*.25+y*.06))<.06)return ['#d8ff8a',232];return [c,246]});
  patch('tmCore',(xx,y,X,Y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v),t=nz(X,Y,5510,8);let c=r<.35?'#ffffff':t>.55?'#e8b8ff':'#a868ff';if(Math.abs(Math.sin(Math.atan2(v,u)*5+r*9))<.08)c='#6aff9a';return c},230);
  patch('tmFlesh',(xx,y,X,Y)=>{const t=nz(X,Y,5511,12);let c=t>.6?'#9a8a8e':t>.42?'#7a6a70':'#5a4a52';const v=Math.abs(Math.sin(xx*.15+nz(X,Y,5512,22)*8));if(v<.07)c='#3a5a3a';if(hash2(X,Y,5513)<.03)c='#5a1a1a';return c},244);
  patch('tmCoat',(xx,y,X,Y)=>{const t=nz(X,Y,5514,16);let c=t>.55?'#c8c8be':t>.4?'#a8a89e':'#88887e';if(nz(X,Y,5515,10)>.66)c=mix(c,'#5a1010',.6);if(nz(X,Y,5516,24)>.7)c=mix(c,'#3a4a2a',.5);if(y%40<1)c='#6a6a62';return c},255);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintTmAtlas()}}

// ---------- models (the weapon material): the head, the researcher sunk into it, the venom fangs, the core, a segment, a leg, an egg sac,
// a glowing joint, the tail; the little centipede's head; a vent fan's blades. Metres; -z forward, +y up; parts about their pivot ----------
const tmMir=L=>L.map(p=>Object.assign({},p,{c:[-p.c[0],p.c[1],p.c[2]],ry:p.ry?-p.ry:p.ry,rz:p.rz?-p.rz:p.rz}));
{const fang=[Pt(.12,0,-.32,.24,.2,.72,'tmCarap',{r:.07,ry:-.25}),Pt(.02,-.02,-.78,.16,.14,.48,'tmPlate',{r:.04,ry:.35}),Pt(-.1,-.03,-1.06,.07,.07,.28,'tmCore',{ry:.85})];
  const ant=[Pt(0,0,-.45,.09,.09,.95,'tmPlate',{r:.03}),Pt(0,0,-1.3,.07,.07,.8,'tmCarap',{r:.02}),Pt(0,0,-2.0,.05,.05,.7,'tmPlate',{r:.02}),Pt(0,0,-2.5,.035,.035,.35,'tmCore')];
  const legR=[Pt(.42,0,0,.88,.22,.24,'tmCarap',{r:.07}),Pt(.86,.02,0,.2,.2,.22,'tmPlate',{r:.05}),Pt(.98,-.52,0,.17,1.05,.19,'tmPlate',{r:.05,rz:.18}),Pt(1.06,-1.08,0,.09,.24,.11,'tmCarap',{rz:.4})];
  const seg=(v)=>{const L=[Pt(0,.32,0,1.95,.58,2.25,'tmCarap',{r:.27}),Pt(0,.52,-1.0,1.75,.14,.32,'tmPlate',{r:.05}),Pt(1.06,.12,0,.42,.32,2.0,'tmPlate',{r:.09}),Pt(-1.06,.12,0,.42,.32,2.0,'tmPlate',{r:.09}),
      Pt(0,-.24,0,1.5,.42,2.1,'tmFlesh',{r:.16}),Pt(.45,.74,.4,.13,.42,.13,'tmPlate',{rx:-.55}),Pt(-.45,.74,.4,.13,.42,.13,'tmPlate',{rx:-.55}),Pt(0,.62,.85,1.4,.08,.18,'tmMemb',{r:.03})];
    // infected bodies stuck to the carapace (some segments): an arm, a skull, ribs, a hand clawing out
    if(v===1)L.push(Pt(.55,.66,.1,.13,.13,.75,'tmFlesh',{ry:.6,rx:-.25}),Pt(.84,.62,-.24,.1,.08,.14,'tmFlesh'),Pt(-.48,.7,-.25,.24,.24,.26,'tmFlesh',{r:.08}),Pt(-.48,.7,-.39,.12,.05,.02,'blk2'),Pt(-.2,.64,.55,.5,.06,.24,'white'));
    if(v===2)L.push(Pt(-.5,.66,.3,.36,.2,.5,'tmCoat',{r:.06,ry:.3}),Pt(.4,.68,-.3,.22,.22,.24,'tmFlesh',{r:.08}),Pt(.6,.6,.35,.11,.11,.6,'tmFlesh',{rx:.4,ry:-.5}));
    return L};
  Object.assign(GUNS,{
    // the head: a broad flat shield, the front rim, clusters of glowing eyes; the fangs, the core, the antennae and the researcher are their own pieces
    tmHead:{parts:[Pt(0,.22,.05,2.05,.78,2.3,'tmCarap',{r:.42}),Pt(0,.5,.2,1.6,.3,1.6,'tmCarap',{r:.25}),Pt(0,-.02,-1.05,1.65,.36,.52,'tmPlate',{r:.15}),Pt(0,-.2,-.25,1.5,.4,1.6,'tmFlesh',{r:.18}),
      ...[[.62,.42,-.62,.16],[.74,.34,-.42,.12],[.54,.52,-.38,.1],[-.62,.42,-.62,.16],[-.74,.34,-.42,.12],[-.54,.52,-.38,.1]].map(([x,y,z,s])=>Pt(x,y,z,s,s*.8,s*.9,'tmCore',{r:s*.3})),
      Pt(0,.3,1.1,1.7,.3,.2,'tmMemb',{r:.05}),Pt(.55,.56,.6,.14,.34,.14,'tmPlate',{rx:-.6}),Pt(-.55,.56,.6,.14,.34,.14,'tmPlate',{rx:-.6})],grip:[0,0,0],muzzle:[0,0,0]},
    tmFangR:{parts:fang,grip:[0,0,0],muzzle:[0,0,0]},tmFangL:{parts:tmMir(fang),grip:[0,0,0],muzzle:[0,0,0]},
    tmCoreM:{parts:[Pt(0,0,0,.72,.72,.72,'tmCore',{r:.35}),Pt(0,0,0,.86,.5,.86,'tmMemb',{r:.24}),Pt(0,.1,0,.5,.82,.5,'tmMemb',{r:.22})],grip:[0,0,0],muzzle:[0,0,0]},
    tmAnt:{parts:ant,grip:[0,0,0],muzzle:[0,0,0]},
    // the chief researcher, sunk to the hips in the carapace: lab coat in rags, the badge, the head lolling back, arms hanging, tendrils
    tmRes:{parts:[Pt(0,.36,0,.44,.62,.27,'tmCoat',{r:.06}),Pt(0,.36,-.14,.24,.32,.02,'tmFlesh'),Pt(0,.82,-.02,.21,.26,.23,'tmFlesh',{r:.07,rx:.45}),Pt(0,.94,.06,.23,.12,.22,'blk2',{rx:.45}),
      Pt(.05,.84,-.13,.03,.02,.01,'tmCore'),Pt(-.05,.84,-.13,.03,.02,.01,'tmCore'),Pt(.29,.44,0,.1,.4,.1,'tmCoat',{rz:.28}),Pt(-.29,.44,0,.1,.4,.1,'tmCoat',{rz:-.28}),
      Pt(.4,.12,-.08,.08,.38,.08,'tmFlesh',{rz:.12,rx:-.35}),Pt(-.4,.12,-.08,.08,.38,.08,'tmFlesh',{rz:-.12,rx:-.35}),Pt(0,.02,.04,.54,.22,.34,'tmCoat',{r:.05}),Pt(.1,.5,-.142,.06,.08,.01,'white'),
      Pt(.16,-.04,.12,.12,.26,.12,'tmMemb',{rz:.5}),Pt(-.16,-.04,.12,.12,.26,.12,'tmMemb',{rz:-.5}),Pt(0,.2,.16,.1,.4,.1,'tmMemb',{rx:.3})],grip:[0,0,0],muzzle:[0,0,0]},
    tmSeg:{parts:seg(0),grip:[0,0,0],muzzle:[0,0,0]},tmSegB:{parts:seg(1),grip:[0,0,0],muzzle:[0,0,0]},tmSegC:{parts:seg(2),grip:[0,0,0],muzzle:[0,0,0]},
    tmLegR:{parts:legR,grip:[0,0,0],muzzle:[0,0,0]},tmLegL:{parts:tmMir(legR),grip:[0,0,0],muzzle:[0,0,0]},
    tmSacM:{parts:[Pt(0,0,0,.96,.76,1.12,'tmSac',{r:.36}),Pt(.32,.18,.32,.5,.42,.52,'tmSac',{r:.2}),Pt(-.3,.16,-.32,.46,.38,.46,'tmSac',{r:.18}),Pt(0,.37,0,.06,.05,1.0,'tmMemb')],grip:[0,0,0],muzzle:[0,0,0]},
    tmJoint:{parts:[Pt(0,.12,0,1.62,1.02,.42,'tmMemb',{r:.32}),Pt(0,.12,0,1.2,.7,.5,'tmCore',{r:.22})],grip:[0,0,0],muzzle:[0,0,0]},
    tmTail:{parts:[Pt(0,.26,0,1.5,.48,1.9,'tmCarap',{r:.22}),Pt(.42,.3,1.55,.13,.13,1.7,'tmPlate',{ry:.32}),Pt(-.42,.3,1.55,.13,.13,1.7,'tmPlate',{ry:-.32}),Pt(0,.42,1.2,.2,.2,1.0,'tmCarap',{rx:.55}),Pt(0,.85,1.62,.12,.3,.12,'tmCore',{rx:.9})],grip:[0,0,0],muzzle:[0,0,0]},
    tmMiniHead:{parts:[Pt(0,.12,0,1.5,.62,1.7,'tmCarap',{r:.32}),Pt(.5,.26,-.62,.2,.16,.2,'tmCore',{r:.06}),Pt(-.5,.26,-.62,.2,.16,.2,'tmCore',{r:.06}),Pt(.38,-.12,-.95,.18,.16,.62,'tmPlate',{ry:-.3}),Pt(-.38,-.12,-.95,.18,.16,.62,'tmPlate',{ry:.3})],grip:[0,0,0],muzzle:[0,0,0]},
    tmFanB:{parts:[0,1,2,3].map(i=>Pt(Math.cos(i*Math.PI/2)*.7,0,Math.sin(i*Math.PI/2)*.7,i%2?.3:1.3,.05,i%2?1.3:.3,'gunmetal',{ry:.35})),grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: its roar (wet, with a chitinous rattle), the clicking of a thousand legs, a burst of water, the rush of a flood,
// a handwheel's screech, an egg sac bursting, a joint snapping ----------
Object.assign(SFX,{
  tmroar:{n:2,dur:2.4,ch:2,peak:.95,gain:.9,rev:.45,poly:2,fn:B=>{const out=B.sh(2.2,B.g(.9));voice(B,{f0:rr(58,66),fm:rr(90,110),f1:44,len:2.1,F:[260,620,1500],drive:4,rasp:1,rf:420,gurgle:24,lp:3200});
    for(const s of [-1,1]){const e=B.env(.15,.4,.8,1.4,B.pan(s*.5,out),.4);for(let i=0;i<26;i++)B.grain(rr(.2,2),rr(900,2600),3,.015,rr(.08,.2),e)}
    const e2=B.env(0,.3,1,1.6,out,.3);B.nz('brown',0,2.2,B.f('lowpass',180,.9,e2))}},
  tmclick:{n:3,dur:1.1,ch:1,peak:.7,gain:.55,rev:.15,poly:3,fn:B=>{const out=B.f('highpass',600,.7,B.g(.9));for(let i=0;i<34;i++)B.grain(rr(0,1),rr(1400,4200),4,.01,rr(.1,.35),out);const e=B.env(0,.05,.4,.9,out,.1);B.nz('pink',0,1,B.f('bandpass',2600,2,e))}},
  tmsplash:{n:3,dur:1.6,ch:2,peak:.9,gain:.85,rev:.3,poly:3,fn:B=>{const out=B.g(.9);for(const s of [-1,1]){const e=B.env(0,.02,1,1.3,B.pan(s*.4,out),.1);B.nz('white',0,1.5,B.sweep(B.f('lowpass',5200,.7,e),5200,700,0,1.4))}
    const e2=B.env(0,.01,1,.4,out,.05);B.nz('brown',0,.5,B.f('lowpass',260,1,e2));for(let i=0;i<20;i++)B.grain(rr(.05,1.2),rr(500,1800),2,.02,rr(.1,.25),out)}},
  tmgush:{n:1,dur:3.2,ch:2,peak:.85,gain:.8,rev:.4,poly:2,fn:B=>{const out=B.g(.9);for(const s of [-1,1]){const e=B.env(0,.6,1,1.4,B.pan(s*.6,out),1.2);B.nz('white',0,3.1,B.f('bandpass',900,.6,e));B.nz('brown',0,3.1,B.f('lowpass',240,.8,e))}}},
  tmwheel:{n:2,dur:.9,ch:1,peak:.7,gain:.45,rev:.2,poly:2,fn:B=>{const out=B.g(.9);const e=B.env(0,.05,.8,.7,out,.1);for(const k of [1,2.03,3.1])B.osc('sawtooth',380*k,300*k,0,.85,B.f('bandpass',1100*k,6,e));B.nz('pink',0,.8,B.f('bandpass',3000,3,e))}},
  tmpop:{n:3,dur:.8,ch:1,peak:.8,gain:.7,rev:.2,poly:3,fn:B=>{const out=B.g(.9);const e=B.env(0,.005,1,.3,out,.02);B.nz('brown',0,.35,B.f('lowpass',500,1.2,e));const e2=B.env(.02,.01,.6,.6,out,.1);B.nz('pink',.02,.7,B.sweep(B.f('bandpass',1800,1.5,e2),2200,500,0,.6))}},
  tmcrack:{n:2,dur:.9,ch:1,peak:.85,gain:.75,rev:.25,poly:2,fn:B=>{const out=B.g(.9);for(let i=0;i<4;i++){const t=i*.05,e=B.env(t,.002,1,.12,out,.01);B.nz('white',t,.14,B.f('highpass',1500,1,e))}
    const e=B.env(.05,.02,.7,.7,out,.1);B.nz('brown',.05,.8,B.f('lowpass',300,.9,e))}}});
SFX_ORDER.push('tmroar','tmclick','tmsplash','tmgush','tmwheel','tmpop','tmcrack');

// ---------- the water (every page): three regions — the tunnel's channel (fixed), the tank and the shaft (their levels move) ----------
// Wading deeper than 0.75 m: humans −40 % speed and no jumping, zombies −25 % (the drowned do not care). Out of their depth humans swim
// (they float with the head out, slowly, and climb out where the edge is low or by the steps); zombies walk the bottom. A grenade under
// the surface sinks and fizzles. The camera under the surface sees through murky green. The shaft's churning water pulls people under
// instead: drowning there (the escape, as it fills) costs 15 a second.
const WATER={lv:{C:.3,D:.3},tg:{C:.3,D:.3},rate:{C:.3,D:.3},drainT:0,ch:0,uw:0,fog:null,
  reset(){this.drainT=0;this.ch=0;this.uw=0},
  // the surface over (x, z), for something at height y (it has to be under the region's roof); -1e9 = no water there
  // (WATER.k: which region the last call found — 'B', 'C', 'D' or '')
  surf(x,z,y){const W=MAP.ez&&MAP.ez.water;this.k='';if(!W)return -1e9;if(y==null)y=0;
    if(x>-32&&x<32&&z>-20&&z<20&&y<17){this.k='C';return this.lv.C}
    const D=W.D.circ;if(y<44&&(x-D[0])*(x-D[0])+(z-D[1])*(z-D[1])<D[2]*D[2]){this.k='D';return this.lv.D}
    if(y<6)for(const r of W.B.rects)if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]){this.k='B';return W.B.y}return -1e9},
  depth(a){return this.surf(a.c.x,a.c.z,a.c.y)-a.c.y},
  // host: a region heads for a level at a rate (m/s); the clients hear it
  set(k,y,rate,remote){this.tg[k]=y;this.rate[k]=rate||.4;if(NET.host&&!remote)netEv('etw',{k,y:r2(y),r:r2(rate||.4)})},
  snap(k,y){this.lv[k]=this.tg[k]=y},
  update(dt){const C=this.lv;for(const k of ['C','D']){const d=this.tg[k]-C[k];if(Math.abs(d)>1e-3){C[k]+=Math.sign(d)*Math.min(Math.abs(d),this.rate[k]*dt)}}
    if(E5W.C)E5W.C.position.y=C.C;if(E5W.D)E5W.D.position.y=C.D;
    const moving=Math.abs(this.tg.C-C.C)>.02||Math.abs(this.tg.D-C.D)>.02;this.ch=approach(this.ch,moving?1:0,dt*.8);if(E5W.mat)E5W.mat.uniforms.uChurn.value=this.ch;
    if(this.drainT>0)this.drainT=Math.max(0,this.drainT-dt);
    // the camera under the surface: a murky green and close fog
    const cam=R.cam.position,s=this.surf(cam.x,cam.z,cam.y),under=s>cam.y+.02;this.uw=approach(this.uw,under?1:0,dt*4);this.camFx()},
  camFx(){let el=$('e5uw');if(!el){el=document.createElement('div');el.id='e5uw';el.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:6;opacity:0;background:radial-gradient(ellipse at center,rgba(20,70,60,.35) 0%,rgba(8,40,34,.7) 70%,rgba(4,22,20,.88) 100%)';($('app')||document.body).appendChild(el)}
    const o=this.uw.toFixed(2);if(el.style.opacity!==o)el.style.opacity=o;
    if(this.uw>.01){if(!this.fog)this.fog={c:LU.uFogC.value.clone(),d:LU.uFogD.value};LU.uFogC.value.copy(this.fog.c).lerp(_tmFogC,this.uw);LU.uFogD.value=lerp(this.fog.d,.2,this.uw)}
    else if(this.fog){LU.uFogC.value.copy(this.fog.c);LU.uFogD.value=this.fog.d;this.fog=null}},
  off(){this.uw=0;this.camFx();const el=$('e5uw');if(el)el.style.opacity=0}};
const _tmFogC=new THREE.Color('#0c2a26');

// ---------- the tank's and shaft's hazards (every page; the host decides): spore clouds, the drain wheels and vent fans of the boss fight,
// rocks and water jets on the ramp, the shaft caving in after the kill ----------
const E5X={spores:[],id:0,wheel:[0,0],wcd:0,fcd:[0,0],rocks:[],jets:[],cave:false,caveT:0,tick:0,ammoT:0,
  reset(){this.spores=[];this.wheel=[0,0];this.wcd=0;this.fcd=[0,0];this.rocks=[];this.jets=[];this.cave=false;this.caveT=0;for(const S of ESMK.list.slice())if(S.tm)ESMK.list.splice(ESMK.list.indexOf(S),1)},
  // a spore cloud (TIAMAT's breath, a hazmat's tank): a green cloud that hurts whoever is in it
  sporeAdd(x,y,z,r,life,dps,id,remote){const S={id:id||++this.id,x,y,z,r,life,dps,t:0};this.spores.push(S);const sm=ESMK.add(x,y,z,r,life,true,[.42,.62,.32]);sm.tm=1;S.sm=sm;
    if(NET.host&&!remote)netEv('etm',{k:'sp',id:S.id,x:r2(x),y:r2(y),z:r2(z),r:r2(r),l:r2(life),d:dps});return S},
  sporeClear(remote){for(const S of this.spores){S.life=Math.min(S.life,S.t+.6);if(S.sm)S.sm.life=Math.min(S.sm.life,S.sm.t+.4)}
    for(let i=0;i<60;i++){const S=this.spores[i%Math.max(1,this.spores.length)];if(!S)break;FX.spawn({x:S.x+rr(-S.r,S.r),y:S.y+rr(.5,3),z:S.z+rr(-S.r,S.r),vx:rr(-6,6),vy:rr(2,6),vz:rr(-6,6),life:rr(.5,1),s0:.8,s1:2.6,r:.45,g:.65,b:.35,a:.4,f:2,drag:.4})}
    if(NET.host&&!remote)netEv('etm',{k:'spx'})},
  inSpore(h){for(const S of this.spores)if(S.t<S.life&&Math.hypot(h.c.x-S.x,h.c.z-S.z)<S.r*.85&&Math.abs(h.c.y-S.y)<4.5)return S;return null},
  // the drain wheels and fans during the boss fight (devices 100+0..3)
  wheelNear(h,i){const v=MAP.ez.wheels[i];return Math.hypot(h.c.x-v.x,h.c.z-v.z)<1.9&&Math.abs(h.c.y-v.y)<1.6},
  fanNear(h,i){const v=MAP.ez.fans[i];return Math.hypot(h.c.x-v.bx,h.c.z-v.bz)<1.8&&Math.abs(h.c.y-v.y)<1.6},
  drainReady(){return EP.st===4&&EP.bossPh===2&&this.wcd<=0&&WATER.drainT<=0&&WATER.tg.C>1},
  hostDev(dt){if(!(EP.st===4&&EP.ph==='run'))return;const W=this.wheel;
    if(this.wcd>0)this.wcd-=dt;
    if(this.drainReady()){for(let i=0;i<2;i++){let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+i&&G.t>=(h.useBlk||0)&&this.wheelNear(h,i))n++;if(n){const was=W[i];W[i]=Math.min(6,W[i]+dt*(n>1?1.3:1));if(Math.floor(was*1.4)!==Math.floor(W[i]*1.4))this.fx({k:'wh',i})}else if(W[i]<6)W[i]=Math.max(0,W[i]-dt*.15)}// (a wheel turned all the way stays: one person can do both)
      if(W[0]>=6&&W[1]>=6)this.drain(10,45)}
    for(let i=0;i<2;i++){if(this.fcd[i]>0){this.fcd[i]-=dt;continue}let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===102+i&&G.t>=(h.useBlk||0)&&this.fanNear(h,i))n++;
      if(n){this.fcd[i]=20;this.fx({k:'fan',i});this.sporeClear()}}},
  // the hall empties for t seconds (to the trenches' level), then floods again
  drain(t,cd){this.wheel=[0,0];this.wcd=cd||45;WATER.drainT=t;WATER.set('C',-2.5,1.6);EP.later(t,()=>{if(EP.st===4&&EP.bossPh===2)WATER.set('C',1.2,.45)});this.fx({k:'dr',t});EP.say('tStrNow')},
  // ---------- phase 3: rocks onto the ramp (a red ring, then the hit), water jets along it (a red strip down the slope) ----------
  rockAt(x,y,z,r,d,dmg){this.rocks.push({x,y,z,r,t:0,d,dmg});TELE.add({k:'c',x,y,z,r,d})},
  jetAt(h){const D=E5D,n=e5Near(h.c.x,h.c.y,h.c.z);if(!n)return false;const u0=Math.min(D.U-.2,n.u+2.2/13.4),r=13.4,p=e5At(u0,r),q=e5At(Math.max(0,u0-.62),r),yaw=Math.atan2(-(q.x-p.x),-(q.z-p.z));
    const J={x:p.x,y:p.y,z:p.z,yaw,l:Math.hypot(q.x-p.x,q.z-p.z)+1,w:3.4,t:0,d:1.05*EPTW(),dx:(q.x-p.x),dz:(q.z-p.z)};const dl=Math.hypot(J.dx,J.dz)||1;J.dx/=dl;J.dz/=dl;this.jets.push(J);
    TELE.add({k:'r',x:J.x,y:J.y,z:J.z,yaw,w:J.w,l:J.l,d:J.d,col:0x40c0ff});this.fx({k:'jw',x:r2(J.x),y:r2(J.y),z:r2(J.z)});return true},
  update(dt){const host=!NET.cli;
    for(let i=this.spores.length-1;i>=0;i--){const S=this.spores[i];S.t+=dt;if(S.t>S.life+.5){this.spores.splice(i,1);continue}}
    // the rocks fall (every page draws them; the host's hurt)
    for(let i=this.rocks.length-1;i>=0;i--){const R0=this.rocks[i];R0.t+=dt;if(R0.t<R0.d){if(Math.random()<dt*14)FX.spawn({x:R0.x+rr(-R0.r,R0.r)*.6,y:R0.y+rr(6,10),z:R0.z+rr(-R0.r,R0.r)*.6,vy:-rr(10,16),life:rr(.4,.7),s0:.12,s1:.1,r:.4,g:.38,b:.34,f:7,grav:6,col:.3});continue}
      this.rocks.splice(i,1);SCEN.slamFx(R0.x,R0.y,R0.z);AU.at('explode',R0.x,R0.y,R0.z,{vol:.7,range:60,occ:false,rate:.6});AU.at('imp_conc',R0.x,R0.y+1,R0.z,{vol:1,range:40,rate:.6});
      for(let k=0;k<18;k++)FX.spawn({x:R0.x,y:R0.y+.4,z:R0.z,vx:rr(-4,4),vy:rr(2,6),vz:rr(-4,4),life:rr(.6,1.1),s0:.12,s1:.1,r:.42,g:.4,b:.36,f:7,grav:14,col:.3});
      const P=G.player;if(P){const d=Math.hypot(P.c.x-R0.x,P.c.z-R0.z);if(d<12&&Math.abs(P.c.y-R0.y)<6)FX.shake=Math.max(FX.shake,.7-d/18)}
      if(host)for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-R0.x,h.c.z-R0.z);if(d<R0.r&&Math.abs(h.c.y-R0.y)<2.2){hurtHuman(h,EPD(R0.dmg),EP.bossA(),{});epFx(h,'kd',.7)}}}
    // the jets
    for(let i=this.jets.length-1;i>=0;i--){const J=this.jets[i];J.t+=dt;if(J.t<J.d)continue;if(!J.fired){J.fired=1;this.jetFx(J);
        if(host)for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-J.x,dz=h.c.z-J.z,fx=-Math.sin(J.yaw),fz=-Math.cos(J.yaw),al=dx*fx+dz*fz,sd=dx*Math.cos(J.yaw)-dz*Math.sin(J.yaw);
          if(al>-.5&&al<J.l+.5&&Math.abs(sd)<J.w/2+.3&&Math.abs(h.c.y-J.y)<3){hurtHuman(h,EPD(20),EP.bossA(),{});epFx(h,'kd',1);SCEN.pushHuman(h,J.dx*11,2.5,J.dz*11)}}}
      if(J.t>J.d+.8)this.jets.splice(i,1)}
    if(host)this.hostTick(dt)},
  jetFx(J){const n=40;for(let k=0;k<n;k++){const f=k/n;FX.spawn({x:J.x+J.dx*J.l*f+rr(-1,1),y:J.y+rr(2,7)*(1-f*.5),z:J.z+J.dz*J.l*f+rr(-1,1),vx:J.dx*rr(4,9),vy:-rr(6,12),vz:J.dz*rr(4,9),life:rr(.4,.8),s0:.25,s1:.9,r:.7,g:.82,b:.9,a:.6,f:2,drag:.8})}
    AU.at('tmsplash',J.x,J.y+2,J.z,{vol:1,range:70,rate:.8});AU.at('tmgush',J.x,J.y+2,J.z,{vol:.7,range:60,rate:1.4})},
  hostTick(dt){this.hostDev(dt);this.tick-=dt;if(this.tick>0)return;this.tick=.25;const T=.25;
    for(const h of SCEN.H){if(!h.alive)continue;
      // spores (a hazmat suit does not help a human); venom (TIAMAT's tail)
      const S=this.inSpore(h);if(S){hurtHuman(h,EPD(S.dps*T),null,{});if(h.isPlayer||!AU.throttle('e5sp'+h.id,900))epFx(h,'du',.6)}
      if(h.tmVen>0){h.tmVen-=T;hurtHuman(h,EPD(4*T),EP.bossA(),{})}
      // phase 3: the nest on the shaft's floor boils (the fight is up the ramp)
      if(this.nestOn()&&h.c.y<.7&&Math.hypot(h.c.x-E5D.cx,h.c.z-E5D.cz)<15.3){hurtHuman(h,EPD(8*T),null,{});if(!AU.throttle('e5ns'+h.id,1500))epFx(h,'du',.4)}
      // drowning: the head under the shaft's water
      if(WATER.depth(h)>1.7&&WATER.k==='D'){hurtHuman(h,EPD(15*T),null,{});if(!AU.throttle('e5dr'+h.id,1200))FX.spawn({x:h.c.x,y:h.c.y+1.7,z:h.c.z,vy:1.5,life:.6,s0:.08,s1:.15,r:.8,g:.9,b:1,a:.6,f:5})}}
    // the shaft caving in after the kill: rocks near the climbers
    if(this.cave){this.caveT-=T;if(this.caveT<=0){this.caveT=rr(1.8,3);const L=SCEN.H.filter(h=>h.alive&&Math.hypot(h.c.x-E5D.cx,h.c.z-E5D.cz)<15.5);
        if(L.length){const h=rpick(L);const n=e5Near(h.c.x,h.c.y,h.c.z);if(n){const p=e5At(n.u+rr(-.15,.15),rr(12.6,14.4));this.rockAt(p.x,p.y,p.z,2.4,1.1*EPTW(),20);this.fx({k:'rk',x:r2(p.x),y:r2(p.y),z:r2(p.z),r:240,d:r2(1.1*EPTW())})}}}}
    // ammo on the shaft's landings while the fight is up there
    if(EP.st>=4&&EP.bossPh>=3){this.ammoT-=T;if(this.ammoT<=0){this.ammoT=28;for(const p of MAP.ez.landAmmo)if(!EPK.list.some(k=>Math.hypot(k.x-p.x,k.z-p.z)<2&&Math.abs(k.y-p.y)<2))EPK.spawn(p.x,p.y,p.z)}}},
  nestOn(){return EP.st===4&&EP.bossPh>=3&&EP.ph==='run'},
  fx(m){this.fxApply(m);if(NET.host)netEv('etm',m)},
  fxApply(m){const E=MAP.ez,L=LI();
    switch(m.k){
    case 'wh':{const v=E.wheels[m.i];if(v)AU.at('tmwheel',v.x,v.y+1,v.z,{vol:.8,range:40,rate:rr(.85,1.1)});break}
    case 'fan':{const v=E.fans[m.i];if(v){AU.at('powerup',v.x,v.y+1,v.z,{vol:.8,range:60,rate:.7});AU.at('salgust',v.x,v.y+1,v.z,{vol:1,range:80,rate:.6})}if(NET.cli)this.fcd[m.i]=20;HUD.note(L?'The vent fans roar — the spores are blown away':'환풍기 가동 — 포자가 날아간다',2.2);break}
    case 'dr':{if(NET.cli){this.wheel=[0,0];this.wcd=45;WATER.drainT=m.t}AU.play('tmgush',{vol:.9,rate:.8});HUD.announce(L?'THE HALL IS DRAINING':'배수 — 물이 빠진다','h',2.2);break}
    case 'rk':if(NET.cli)this.rocks.push({x:m.x/100,y:m.y/100,z:m.z/100,r:m.r/100,t:0,d:m.d/100,dmg:0});break;
    case 'jw':AU.at('tmgush',m.x/100,m.y/100+6,m.z/100,{vol:.8,range:60,rate:1.6});break;
    case 'sp':if(NET.cli)this.sporeAdd(m.x/100,m.y/100,m.z/100,m.r/100,m.l/100,m.d,m.id,true);break;
    case 'spx':this.sporeClear(true);break}},
  pack(){return [Math.round(this.wheel[0]*10),Math.round(this.wheel[1]*10),Math.ceil(this.wcd),Math.ceil(this.fcd[0]),Math.ceil(this.fcd[1]),Math.round(WATER.drainT*10),r2(WATER.lv.C),r2(WATER.lv.D),r2(WATER.tg.C),r2(WATER.tg.D)]},
  unpack(a){if(!Array.isArray(a))return;this.wheel=[a[0]/10,a[1]/10];this.wcd=a[2];this.fcd=[a[3],a[4]];WATER.drainT=a[5]/10;
    for(const [k,i] of [['C',6],['D',7]]){const y=a[i]/100,t=a[i+2]/100;WATER.tg[k]=t;if(Math.abs(WATER.lv[k]-y)>.6)WATER.lv[k]=y}}};

// ---------- the body (every page): a trail of where the head has been, the segments laid along it, legs rippling, the hit volumes ----------
const _tmA=new THREE.Vector3(),_tmB=new THREE.Vector3(),_tmX=new THREE.Vector3(),_tmY=new THREE.Vector3(),_tmZ=new THREE.Vector3(),_tmM=new THREE.Matrix4(),_tmQ=new THREE.Quaternion(),_tmP={x:0,y:0,z:0},_tmP2={x:0,y:0,z:0};
const TMV={g:null,mat:null,head:null,segs:[],trail:[],parts:[],bs:{x:0,y:0,z:0,r:0},len:TM_N,sacs:15,jts:7,core:0,coil:-1,climb:0,flags:0,lastH:null,fall:[],dead:null,t:0,vis:false,
  build(){if(this.g)return;const mat=this.mat=matGun(),g=this.g=new THREE.Group();g.visible=false;R.scene.add(g);
    const mk=(id,parent,x,y,z)=>{const m=new THREE.Mesh(gunGeo(id),mat);m.frustumCulled=false;const q=new THREE.Group();q.position.set(x||0,y||0,z||0);q.add(m);parent.add(q);return q};
    const H=this.head={grp:new THREE.Group()};H.grp.scale.setScalar(TM_K);g.add(H.grp);H.shell=mk('tmHead',H.grp);H.res=mk('tmRes',H.grp,0,.5,.25);H.fangR=mk('tmFangR',H.grp,.42,-.22,-.92);H.fangL=mk('tmFangL',H.grp,-.42,-.22,-.92);
    H.core=mk('tmCoreM',H.grp,0,-.38,-.82);H.antR=mk('tmAnt',H.grp,.36,.32,-1.05);H.antL=mk('tmAnt',H.grp,-.36,.32,-1.05);for(const q of [H.fangR,H.fangL,H.antR,H.antL,H.res])q.rotation.order='YXZ';
    this.segs=[];for(let k=0;k<TM_N;k++){const S={k,grp:new THREE.Group(),legs:[]};S.grp.scale.setScalar(TM_K);g.add(S.grp);const last=k===TM_N-1;S.body=mk(last?'tmTail':k%4===1?'tmSegB':k%5===3?'tmSegC':'tmSeg',S.grp);
      for(const sd of [-1,1]){const hip=new THREE.Group();hip.position.set(sd*.98,-.08,0);S.grp.add(hip);const m=new THREE.Mesh(gunGeo(sd>0?'tmLegR':'tmLegL'),mat);m.frustumCulled=false;hip.add(m);hip.rotation.order='YZX';S.legs.push({hip,sd})}
      if(TM_SACS.includes(k)){S.sac=mk('tmSacM',S.grp,0,.86,.15)}
      this.segs.push(S)}
    this.joints=TM_JOINTS.map(j=>{const q=new THREE.Group();q.scale.setScalar(TM_K);g.add(q);mk('tmJoint',q);return q})},
  clear(){if(this.g){R.scene.remove(this.g);this.mat.dispose()}this.g=null;this.segs=[];this.trail=[];this.parts=[];for(const F of this.fall)R.scene.remove(F.g);this.fall=[];this.dead=null;this.lastH=null;this.vis=false},
  // the trail: oldest first, the newest point (the head) last; a jump (a respawn, a phase) lays a fresh one straight behind the head
  push(x,y,z,yaw){const T=this.trail,L=T[T.length-1];
    if(!L||Math.hypot(x-L.x,y-L.y,z-L.z)>9){this.trail=[];const fx=Math.sin(yaw),fz=Math.cos(yaw);for(let i=60;i>=1;i--)this.trail.push({x:x+fx*i*.7,y:y-(this.sub?0:0),z:z+fz*i*.7});this.trail.push({x,y,z});return}
    if(Math.hypot(x-L.x,y-L.y,z-L.z)>=.25){T.push({x,y,z});if(T.length>260)T.splice(0,T.length-260)}else{L.x=x;L.y=y;L.z=z}},
  // positions at distances back from the head along the trail (sorted ascending), one pass
  along(ds,out){const T=this.trail;let i=T.length-1,acc=0,k=0;while(k<ds.length&&i>0){const p=T[i],q=T[i-1],d=Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z);
      while(k<ds.length&&ds[k]<=acc+d){const f=d>1e-6?(ds[k]-acc)/d:0,o=out[k];o.x=p.x+(q.x-p.x)*f;o.y=p.y+(q.y-p.y)*f;o.z=p.z+(q.z-p.z)*f;k++}acc+=d;i--}
    // past the oldest point: straight on
    if(k<ds.length){const n=T.length,p=T[0],q=T[Math.min(1,n-1)];let dx=p.x-q.x,dy=p.y-q.y,dz=p.z-q.z;const l=Math.hypot(dx,dy,dz)||1;dx/=l;dy/=l;dz/=l;
      for(;k<ds.length;k++){const e=ds[k]-acc,o=out[k];o.x=p.x+dx*e;o.y=p.y+dy*e;o.z=p.z+dz*e}}},
  _ds:null,_pt:null,
  update(a,dt){this.build();const g=this.g;this.t+=dt;
    if(!a||!EP.on||EP.id!==5){g.visible=false;this.vis=false;this.parts=[];this.fallTick(dt);return}
    let hx,hy,hz;if(a.alive){hx=a.c.x;hy=a.c.y+.8;hz=a.c.z;this.dead=null}
    else{// the death: the head drops, the body after it; gone after a while
      if(a.c.y<-30){g.visible=false;this.vis=false;this.parts=[];this.fallTick(dt);return}
      const D=this.dead||(this.dead={x:a.c.x,y:a.c.y+.8,z:a.c.z,vy:0,t:0});D.t+=dt;D.vy-=9*dt;const fl=Math.max(WATER.surf(D.x,D.z,D.y)-.6,floorBelow(D.x,D.y,D.z,.4)+.6);D.y=Math.max(fl,D.y+D.vy*dt);if(D.y<=fl)D.vy=0;
      hx=D.x;hy=D.y;hz=D.z;if(D.t>14){g.visible=false;this.vis=false;this.parts=[];return}}
    this.push(hx,hy,hz,a.yaw);g.visible=true;this.vis=true;
    const n=this.len,ds=this._ds||(this._ds=[]),pt=this._pt||(this._pt=[]);ds.length=0;
    // for each segment: its centre and a point a little ahead and behind (the heading)
    for(let k=0;k<TM_N;k++){const s=TM_HD+k*TM_GAP;ds.push(s-.9,s,s+.9)}
    while(pt.length<ds.length)pt.push({x:0,y:0,z:0});this.along(ds,pt);
    const climb=this.climb,parts=this.parts;parts.length=0;
    const surfAt=(x,z,y)=>WATER.surf(x,z,y);
    let bx=hx,by=hy,bz=hz;
    for(let k=0;k<TM_N;k++){const S=this.segs[k],on=k<n;S.grp.visible=on;if(!on)continue;const a0=pt[k*3],c=pt[k*3+1],b0=pt[k*3+2];
      _tmZ.set(b0.x-a0.x,b0.y-a0.y,b0.z-a0.z);if(_tmZ.lengthSq()<1e-6)_tmZ.set(0,0,1);_tmZ.normalize();// local +z = backward
      if(climb)_tmY.set(c.x-E5D.cx,0,c.z-E5D.cz).normalize();else _tmY.set(0,1,0);
      _tmX.crossVectors(_tmY,_tmZ);if(_tmX.lengthSq()<1e-4){_tmX.set(1,0,0)}_tmX.normalize();_tmY.crossVectors(_tmZ,_tmX).normalize();
      _tmM.makeBasis(_tmX,_tmY,_tmZ);S.grp.quaternion.setFromRotationMatrix(_tmM);S.grp.position.set(c.x,c.y,c.z);
      // the legs ripple in a wave down the body (faster when it moves); flailing when stranded
      const sp=this.speed||0,str=this.flags&2,ph=this.t*(str?9:2.5+sp*.9)-k*.75;
      for(const L of S.legs){const s=L.sd,sw=Math.sin(ph+(s>0?0:Math.PI))*(str?.6:.38),up=Math.max(0,Math.cos(ph+(s>0?0:Math.PI)))*(str?.5:.25);L.hip.rotation.set(0,(s>0?0:Math.PI)+sw*s,(-.35+up)*s*-1)}
      if(S.sac)S.sac.visible=!!(this.sacs&(1<<TM_SACS.indexOf(k)));
      const sub=c.y<surfAt(c.x,c.z,c.y)-.55;
      if(!sub)parts.push({k:'seg',i:k,x:c.x+_tmY.x*.15*TM_K,y:c.y+_tmY.y*.15*TM_K,z:c.z+_tmY.z*.15*TM_K,r:.98*TM_K});
      if(S.sac&&S.sac.visible){_tmA.set(0,.86*TM_K,.15*TM_K).applyQuaternion(S.grp.quaternion);const sx=c.x+_tmA.x,sy=c.y+_tmA.y,sz=c.z+_tmA.z;if(sy>surfAt(sx,sz,sy)-.3)parts.push({k:'sac',i:TM_SACS.indexOf(k),x:sx,y:sy,z:sz,r:.62*TM_K})}
      bx=c.x;by=c.y;bz=c.z}
    // the glowing joints (between segment k and k+1)
    TM_JOINTS.forEach((j,ji)=>{const q=this.joints[ji],on=j+1<n&&!!(this.jts&(1<<ji));q.visible=on;if(!on)return;const A=this.segs[j].grp,Bq=this.segs[j+1].grp;
      q.position.copy(A.position).lerp(Bq.position,.5);q.quaternion.copy(A.quaternion).slerp(Bq.quaternion,.5);
      if(q.position.y>surfAt(q.position.x,q.position.z,q.position.y)-.3)parts.push({k:'joint',i:ji,x:q.position.x,y:q.position.y+.12*TM_K,z:q.position.z,r:.62*TM_K})});
    // the head looks away from its first segment
    const H=this.head,s0=this.segs[0].grp.position;_tmZ.set(s0.x-hx,s0.y-hy,s0.z-hz);if(_tmZ.lengthSq()<1e-4)_tmZ.set(Math.sin(a.yaw),0,Math.cos(a.yaw));_tmZ.normalize();
    if(climb)_tmY.set(hx-E5D.cx,0,hz-E5D.cz).normalize();else _tmY.set(0,1,0);_tmX.crossVectors(_tmY,_tmZ);if(_tmX.lengthSq()<1e-4)_tmX.set(1,0,0);_tmX.normalize();_tmY.crossVectors(_tmZ,_tmX).normalize();
    _tmM.makeBasis(_tmX,_tmY,_tmZ);H.grp.quaternion.setFromRotationMatrix(_tmM);H.grp.position.set(hx,hy,hz);
    const op=this.core?1:this.flags&256?.6:0,T=this.t;H.fangR.rotation.set(0,-.15-op*.7+Math.sin(T*7)*.06*(op?1:.3),0);H.fangL.rotation.set(0,.15+op*.7-Math.sin(T*7)*.06*(op?1:.3),0);
    H.antR.rotation.set(-.35+Math.sin(T*2.1)*.25,-.35+Math.sin(T*1.7)*.2,0);H.antL.rotation.set(-.35+Math.sin(T*2.3+1)*.25,.35-Math.sin(T*1.5+2)*.2,0);
    H.res.rotation.set(-.15+Math.sin(T*.9)*.12+op*.35,Math.sin(T*.6)*.25,Math.sin(T*1.1)*.08);H.core.scale.setScalar(.85+op*.45+Math.sin(T*6)*.05);
    const hs=hy<surfAt(hx,hz,hy)-.6;if(!hs){_tmA.set(0,.15*TM_K,-.1*TM_K).applyQuaternion(H.grp.quaternion);parts.push({k:'head',i:0,x:hx+_tmA.x,y:hy+_tmA.y,z:hz+_tmA.z,r:1.18*TM_K})}
    if(op&&!hs){_tmA.set(0,-.38*TM_K,-.95*TM_K).applyQuaternion(H.grp.quaternion);parts.push({k:'core',i:0,x:hx+_tmA.x,y:hy+_tmA.y,z:hz+_tmA.z,r:.55*TM_K})}
    a.head.set(hx,hy,hz);a.headR=1.1*TM_K;
    // the tail-sting's own body, if one is up
    TMT.parts(parts);
    // a bounding sphere for the quick reject
    let mx=0,my=0,mz=0;for(const p of parts){mx+=p.x;my+=p.y;mz+=p.z}const np=parts.length||1;mx/=np;my/=np;mz/=np;let rr0=0;for(const p of parts)rr0=Math.max(rr0,Math.hypot(p.x-mx,p.y-my,p.z-mz)+p.r);this.bs={x:mx,y:my,z:mz,r:rr0};
    // tints: invulnerable (pale flicker), enraged (red), frozen (blue); the glow breathes (brighter with the core open)
    const U=this.mat.uniforms;sampleProbe(hx,hy,hz,U.uProbe.value);U.uEmisA.value=.8+.3*Math.sin(T*3)+op*.8;
    if(this.flags&8)U.uTint.value.set(1,.95,.9,.14+.08*Math.sin(T*30));else if(this.flags&16)U.uTint.value.set(.9,.1,.06,.12+.06*Math.sin(T*9));else if(a.frozen>0)U.uTint.value.set(.55,.8,1,.45);else U.uTint.value.set(0,0,0,0);
    // the water churns where the body breaks the surface
    this.wake(dt);this.fallTick(dt)},
  wake(dt){if(Math.random()>dt*30)return;const k=Math.floor(Math.random()*this.len),S=this.segs[k];if(!S||!S.grp.visible)return;const p=S.grp.position,s=WATER.surf(p.x,p.z,p.y);if(s<-100||Math.abs(p.y-s)>1.1)return;
    FX.spawn({x:p.x+rr(-1,1),y:s+.05,z:p.z+rr(-1,1),vx:rr(-1.2,1.2),vy:rr(.6,1.8),vz:rr(-1.2,1.2),life:rr(.4,.8),s0:.2,s1:.7,r:.7,g:.82,b:.85,a:.5,f:2,drag:1.6})},
  // segments cut off fall away (every page)
  drop(from){const n=this.len;if(from>=n)return;const L=[];for(let k=from;k<n;k++){const S=this.segs[k];if(!S)continue;const c=S.body.children[0].clone();const q=new THREE.Group();q.position.copy(S.grp.position);q.quaternion.copy(S.grp.quaternion);q.scale.setScalar(TM_K);q.add(c);R.scene.add(q);
      L.push({g:q,vy:rr(0,2),vx:rr(-1.5,1.5),vz:rr(-1.5,1.5),sp:rr(-2,2),t:0})}this.fall.push(...L);this.len=from},
  fallTick(dt){for(let i=this.fall.length-1;i>=0;i--){const F=this.fall[i];F.t+=dt;F.vy-=12*dt;const p=F.g.position;const fl=floorBelow(p.x,p.y+.5,p.z,.5)+.5;p.x+=F.vx*dt;p.z+=F.vz*dt;p.y=Math.max(fl,p.y+F.vy*dt);if(p.y<=fl){F.vy=0;F.vx*=.9;F.vz*=.9}
      F.g.rotation.z+=F.sp*dt*(p.y>fl?1:.2);if(F.t>4){F.g.position.y-=dt*.6}if(F.t>7){R.scene.remove(F.g);this.fall.splice(i,1)}}},
  ray(ox,oy,oz,dx,dy,dz,tmax){const B0=this.bs;if(!this.vis||!this.parts.length)return null;if(raySphere(ox,oy,oz,dx,dy,dz,B0.x,B0.y,B0.z,B0.r,tmax)<0){const ix=B0.x-ox,iy=B0.y-oy,iz=B0.z-oz;if(ix*ix+iy*iy+iz*iz>B0.r*B0.r)return null}
    let bt=tmax,best=null;for(const p of this.parts){const t=raySphere(ox,oy,oz,dx,dy,dz,p.x,p.y,p.z,p.r,bt);if(t>=0&&t<bt){bt=t;best=p}}
    return best?{t:bt,part:best.k==='head'?'head':'body',tp:best}:null},
  // the part nearest a point (the host works out what a hit landed on)
  partAt(x,y,z){let best=null,bd=1e9;if(x==null)return null;for(const p of this.parts){const d=Math.hypot(p.x-x,p.y-y,p.z-z)-p.r*(p.k==='core'||p.k==='sac'||p.k==='joint'?1.15:1);if(d<bd){bd=d;best=p}}return bd<1.2?best:null}};

// ---------- the tail rising out of the water for a sting (every page draws it; the host's hits) ----------
const TMT={L:[],
  add(x,y,z,yaw,w,id){const g=new THREE.Group();const mat=TMV.mat||matGun();const segs=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(gunGeo(i===3?'tmTail':'tmSeg'),mat);m.frustumCulled=false;const q=new THREE.Group();q.scale.setScalar(TM_K);q.add(m);g.add(q);segs.push(q)}
    R.scene.add(g);const T={id,x,y,z,yaw,w,t:0,g,segs,hit:false,pts:[]};this.L.push(T);AU.at('tmsplash',x,y+1,z,{vol:.9,range:60,rate:1.3});return T},
  clear(){for(const T of this.L)R.scene.remove(T.g);this.L=[]},
  // the shape: a curl rising from the water, cocked back for the wind-up, then whipped forward along its yaw
  update(dt){for(let i=this.L.length-1;i>=0;i--){const T=this.L[i];T.t+=dt;const w=T.w,u=T.t<w?T.t/w:1,st=T.t<w?0:clamp((T.t-w)/.3,0,1),sink=clamp((T.t-w-.9)/.7,0,1);
      if(T.t>w+1.7){R.scene.remove(T.g);this.L.splice(i,1);continue}const fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw);T.pts.length=0;
      for(let k=0;k<4;k++){const f=(k+1)/4,rise=smooth(u)*(1-sink),lean=lerp(-.9,1.35,st)*f;const h=(1.2+k*1.5)*rise-(1-rise)*2,off=Math.sin(lean)*k*1.4;
        const px=T.x+fx*off,py=T.y-1+h*Math.cos(lean*.5),pz=T.z+fz*off;const q=T.segs[k];q.position.set(px,py,pz);q.rotation.set(-1.2+lean*.9,T.yaw,0,'YXZ');T.pts.push({x:px,y:py,z:pz,k})}
      if(Math.random()<dt*10)FX.spawn({x:T.x+rr(-1,1),y:T.y+.05,z:T.z+rr(-1,1),vy:rr(.5,2),life:.6,s0:.2,s1:.6,r:.7,g:.82,b:.85,a:.5,f:2,drag:1.5})}},
  parts(out){for(const T of this.L)for(const p of T.pts)if(p.y>WATER.surf(p.x,p.z,p.y)-.4)out.push({k:p.k===3?'sting':'tail',i:p.k,x:p.x,y:p.y,z:p.z,r:(p.k===3?.7:.85)*TM_K})}};

// ---------- TIAMAT ----------
const TIAMAT={encNext:0,
  zc:'tiamat',name:['티아마트','TIAMAT'],code:'Q7-Ω',ticks:[70,40],g2:['지상 도달','SURFACE'],darkPh:0,
  wake:['티아마트가 움직이기까지','TIAMAT moves in'],goText:['물이 끓는다 — 티아마트','THE WATER BOILS — TIAMAT'],deadText:['티아마트 무력화','TIAMAT IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(23500*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.tm&&a.tm.enc)},
  // ---------- where it can swim ----------
  // P1: the trenches (centre −2.5 under the floor); the flooded hall: lanes between the pillars (centre 0.42 under 1.2 m of water)
  LX:[-30.5,-22,-12,12,22,30.5],LZ:[-18,-9.5,0,9.5,18],// (no lane down the middle: the dais, and the stairs up to the drain wheels)
  laneNode(x,z){let bi=0,bj=0,bd=1e9;for(let i=0;i<this.LX.length;i++)for(let j=0;j<this.LZ.length;j++){const d=Math.hypot(this.LX[i]-x,this.LZ[j]-z);if(d<bd){bd=d;bi=i;bj=j}}return [bi,bj]},
  // a path over the lane grid (x first then z, or z first: whichever does not cross the dais)
  lanePath(fx,fz,tx,tz,y){const [i0,j0]=this.laneNode(fx,fz),[i1,j1]=this.laneNode(tx,tz),LX=this.LX,LZ=this.LZ,P=[];
    const viaZ=LZ[j0]===0&&Math.min(LX[i0],LX[i1])<0&&Math.max(LX[i0],LX[i1])>0;// the middle lane is cut by the dais: go round by another lane
    let j=j0;if(viaZ){j=j0+(j1>j0?1:-1);if(j<0||j>=LZ.length)j=j0+1;P.push([LX[i0],y,LZ[j]])}
    if(i1!==i0)P.push([LX[i1],y,LZ[j]]);if(j1!==j)P.push([LX[i1],y,LZ[j1]]);P.push([tx,y,tz]);return P},
  // the dive point for a rise: a trench point (P1) or a lane point (flooded) 15–24 m from (x, z)
  divePt(x,z,flood){const C=[];if(flood){for(const lx of this.LX)for(const lz of this.LZ)C.push([lx,.42,lz])}else for(const tz of [-9.5,9.5])for(let tx=-28;tx<=28;tx+=4)C.push([tx,-2.5,tz]);
    const ok=C.filter(p=>{const d=Math.hypot(p[0]-x,p[2]-z);return d>=15&&d<=24});return ok.length?rpick(ok):C.reduce((b,p)=>Math.abs(Math.hypot(p[0]-x,p[2]-z)-19)<Math.abs(Math.hypot(b[0]-x,b[2]-z)-19)?p:b,C[0])},
  flooded(){return WATER.tg.C>.9||WATER.lv.C>.9},
  // deep (out of reach) and cruising: in the trenches −2.5 / −0.3 (like a crocodile: the head's crown, the back and the egg sacs at the
  // surface — it can be shot), the flooded hall 0.42 (only the egg sacs show)
  swimY(){return this.flooded()?.42:-2.5},cruiseY(){return this.flooded()?.42:-.3},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: under the north trench (a phase replay: the flooded hall, the shaft's column)
  prepSpawn(kind,bp){let b=EP.bossA();const ph=kind==='phase'?bp:1;const p=ph>=3?[E5D.cx-4.2,.6,0]:ph===2?[-22,.42,0]:[-26,-2.5,-9.5];
    if(!b)b=this.spawn(p,Math.PI/2,0);else if(kind!=='phase')this.init(b,0);if(!b)return;if(kind==='phase')this.reset(b,ph);const S=b.tm;this.setH(b,S,p[0],p[1],p[2]);S.idle=true;S.mode='';S.mv=null;b.yaw=-Math.PI/2},
  go(b){const S=b.tm;if(!S)return;S.idle=false;S.pt=1.2;if(S.ph===3){this.climbStart(b,S)}this.fx({k:'roar',i:b.id})},
  // the meetings: stage 2's glimpse in the channel (enc 2), stage 3's lurking in the flooded tank (enc 1)
  meetStart(E){if(EP.st===2){const a=this.spawn([60,-1.25,-44],Math.PI/2,2);if(a){E.a=a;const S=a.tm;S.idle=false;S.mode='gl';S.gl={st:0,t:0};this.setH(a,S,60,-1.25,-44);this.swim(S,[[30,-1.25,-44]],6.5)}EP.say('enc5a');EP.later(3.4,()=>EP.say('enc5b'))}
    else{const a=this.spawn([-26,.42,-18],Math.PI/2,1);if(a){E.a=a;const S=a.tm;S.idle=false;S.pt=2;S.cd.er=3;S.cd.tl=6;this.setH(a,S,-26,.42,-18)}EP.say('enc')}},
  meetTick(){},
  meetLeave(E){const a=E.a;if(!a||!a.alive||!a.tm)return;const S=a.tm;if(S.enc===1){S.mode='str';S.mt=4.5;S.mv=null;S.invT=99;this.fx({k:'str',i:a.id,o:1})}},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='tiamat';a.deadT=99;this.encNext=enc||0;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=0;return a},
  init(a,enc){a.tm={ph:1,mode:'',mt:0,mt0:1,pt:2,cd:{er:3,tl:5,bch:6,coil:5,br:7,sum:10,rock:4,jet:7,smn:12},grog:0,grogN:0,grogMax:100,invT:enc===2?999:0,enr:false,fightT:0,enc:enc||0,idle:!enc,
      tg:null,tgT:0,thr:{},H:{x:a.c.x,y:a.c.y+.8,z:a.c.z},mv:null,sub:true,sacs:TM_SACS.map(()=>a.maxHp*.04),jts:TM_JOINTS.map(()=>a.maxHp*.04),len:TM_N,coreT:0,
      coil:null,gauge:0,dmgAcc:0,daisT:0,last:false,tl:null,er:null,cl:{ang:Math.PI,y:.6},spd:0,touch:{}};
    a.epHide=true;a.tmSub=true;a.kin=null;a.frozen=0},
  // a retry of the boss fight starts the phase it reached again, at that phase's health
  reset(a,ph){a.hp=a.maxHp*TM_PH[ph-1];this.init(a,0);const S=a.tm;S.ph=ph;S.idle=true;if(ph>=2){S.sacs=S.sacs.map((v,i)=>i<2?-1:v)}if(ph>=3)S.gauge=0},
  setH(a,S,x,y,z){S.H.x=x;S.H.y=y;S.H.z=z;a.c.x=x;a.c.y=y-.8;a.c.z=z;a.c.vx=a.c.vz=a.c.vy=0;a.head.set(x,y,z)},
  fx(m){this.fxApply(m);if(NET.host)netEv('etm',m)},
  // ---------- motion (host): swim along points, an arc, a coil round a pillar, the climb ----------
  swim(S,pts,v){S.mv={k:'sw',pts,i:0,v}},
  arc(S,x,y,z,T,h){const H=S.H;S.mv={k:'arc',x0:H.x,y0:H.y,z0:H.z,x1:x,y1:y,z1:z,T,t:0,h}},
  move(a,dt,S){const H=S.H,mv=S.mv,ox=H.x,oy=H.y,oz=H.z,slow=(S.slowT>0?.6:1)*(S.enr?1.2:1);
    if(mv&&!mv.done)switch(mv.k){
      case 'sw':{let rem=mv.v*dt*slow;while(rem>0&&mv.i<mv.pts.length){const p=mv.pts[mv.i],dx=p[0]-H.x,dy=p[1]-H.y,dz=p[2]-H.z,d=Math.hypot(dx,dy,dz);if(d<=rem){H.x=p[0];H.y=p[1];H.z=p[2];rem-=d;mv.i++}else{H.x+=dx/d*rem;H.y+=dy/d*rem;H.z+=dz/d*rem;rem=0}}if(mv.i>=mv.pts.length)mv.done=true;break}
      case 'arc':{mv.t+=dt;const u=Math.min(1,mv.t/mv.T),hh=Math.max(mv.y0,mv.y1)+mv.h-(mv.y0+mv.y1)/2;H.x=lerp(mv.x0,mv.x1,u);H.z=lerp(mv.z0,mv.z1,u);H.y=lerp(mv.y0,mv.y1,u)+4*hh*u*(1-u);if(u>=1)mv.done=true;break}
      case 'coil':{mv.t+=dt;const u=Math.min(1,mv.t/mv.T),an=mv.a0+mv.w*Math.min(mv.t,mv.T);H.x=mv.px+Math.cos(an)*mv.r;H.z=mv.pz+Math.sin(an)*mv.r;H.y=lerp(mv.y0,mv.y1,smooth(u));if(u>=1)mv.done=true;break}
      case 'climb':{const C=S.cl,w=(S.enr?.56:.44)*(S.slowT>0?.6:1)*(S.mode==='down'?0:1);C.ang+=w*dt;const yt=1.2+.41*S.gauge;C.y=approach(C.y,yt,dt*(yt>C.y?1.1:2.6));H.x=E5D.cx+Math.cos(C.ang)*4.25;H.z=E5D.cz+Math.sin(C.ang)*4.25;H.y=C.y;break}}
    const vx=(H.x-ox)/dt,vz=(H.z-oz)/dt;S.spd=Math.hypot(vx,vz,(H.y-oy)/dt);if(Math.hypot(H.x-ox,H.z-oz)>.01)a.yaw=Math.atan2(-(H.x-ox),-(H.z-oz));
    a.c.x=H.x;a.c.y=H.y-.8;a.c.z=H.z;a.c.vx=vx;a.c.vz=vz;a.c.vy=(H.y-oy)/dt;a.c.onGround=true;a.head.set(H.x,H.y,H.z);
    S.sub=H.y<WATER.surf(H.x,H.z,H.y)-.6},
  // ---------- host: the brain (EPZ.tiamat.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.tm;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,(S.slowT||0)-dt);S.coreT=Math.max(0,S.coreT-dt);
    if(a.frozen>0){a.frozen=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone'&&S.enc!==2;
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('tEnr')}}
    // (a smaller team gets more room: with fewer than four, its attacks come round up to 1.6× slower)
    const nH=SCEN.H.length,cdm=(S.enr?1/.7:1)/(nH>=4?1:1+.2*(4-nH));for(const k in S.cd)S.cd[k]-=dt*cdm;
    if(S.enc===2){this.glimpse(a,dt,S);this.move(a,dt,S);return true}
    if(!live){if(S.mode==='ret'||S.mode==='str'){S.mt-=dt;this.step(a,dt,S)}this.move(a,dt,S);return true}
    // phase 3: the surface gauge (the top is a life lost)
    if(S.ph===3&&S.mode!=='ph'&&EP.st===4){S.gauge+=dt*(100/120)*(S.enr?1.3:1)*((G.diff||0)>=3?1.12:1)*(S.mode==='down'?0:1);if(S.gauge>=100&&S.mode!=='top'){S.gauge=100;this.topOut(a,S);return true}}
    // a drain (phase 2) strands it on the floor wherever it is, whatever it was doing
    if(S.ph===2&&WATER.drainT>0&&WATER.lv.C<.5&&!['str','ph','down','top','gone'].includes(S.mode))this.strand(a,S);
    if(S.mode){S.mt-=dt;this.step(a,dt,S)}else this.think(a,dt,S);
    this.move(a,dt,S);if(!S.sub)this.contact(a,S);return true},
  strand(a,S){const H=S.H;let z=H.z;const az=Math.abs(z);if(az>7&&az<12)z=Math.sign(z)*(az<9.5?6.4:12.6);S.mode='str';S.mt=WATER.drainT;S.coil=null;S.tl=null;S.bArc=false;S.brUp=0;S.cr=0;
    this.arc(S,clamp(H.x,-30,30),.78,clamp(z,-18.5,18.5),.8,.5);this.fx({k:'str',i:a.id,o:1});this.fx({k:'cg',g:-1})},
  // who it goes for: whoever has hurt it most lately, else the nearest; nobody hidden in smoke
  target(a,S,filter){if(S.tg&&S.tg.alive&&G.t<S.tgT&&(!filter||filter(S.tg)))return S.tg;let best=null,bs=1e9;const c=S.H;
    for(const h of SCEN.H){if(!h.alive||(filter&&!filter(h)))continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z)+Math.abs(h.c.y-c.y)*.5;if(d>70)continue;if(d>6&&ESMK.at(h.c.x,h.c.z,0))continue;
      const e=S.thr[h.id],th=e?e.v*Math.exp(-(G.t-e.t)/3):0,sc=d-Math.min(25,th/80)+rr(0,6);if(sc<bs){bs=sc;best=h}}
    S.tg=best;S.tgT=G.t+3;return best},
  threat(t,r,src){const S=t.tm;if(!S||!src||src.team!==TH)return;const e=S.thr[src.id]||(S.thr[src.id]={v:0,t:G.t});e.v=e.v*Math.exp(-(G.t-e.t)/3)+r;e.t=G.t},
  inHall(h){return h.c.x>-32&&h.c.x<32&&h.c.z>-20&&h.c.z<20},
  onDais(h){const D=MAP.ez.dais.box;return h.c.x>D[0]-.3&&h.c.x<D[2]+.3&&h.c.z>D[1]-.3&&h.c.z<D[3]+.3&&h.c.y>1.2&&h.c.y<3.5},
  think(a,dt,S){const H=S.H;S.pt-=dt;
    // idle swimming: P1 along a trench toward the action, flooded through the lanes
    if(!S.mv||S.mv.done){const t=this.target(a,S,h=>this.inHall(h));if(S.ph===1&&!this.flooded()){const tz=t?(t.c.z<0?-9.5:9.5):(H.z<0?-9.5:9.5),tx=clamp(t?t.c.x+rr(-10,10):rr(-26,26),-29,29),cy=this.cruiseY();
        this.swim(S,Math.abs(H.z-tz)>1?[[H.x,-2.5,tz],[tx,cy,tz]]:[[tx,cy,tz]],6)}
      else{const tx=t?t.c.x+rr(-8,8):rr(-26,26),tz=t?t.c.z+rr(-8,8):rr(-16,16);this.swim(S,this.lanePath(H.x,H.z,clamp(tx,-30,30),clamp(tz,-18,18),.42),6.5)}}
    if(S.pt>0)return;S.pt=.4;
    const enc=S.enc===1,P=enc?2:S.ph;
    // beaching: people crowding the pump dais (phase 1)
    // (not in the first 25 s: the fight starts with everyone on the dais)
    if(P===1){let n=0;for(const h of SCEN.H)if(h.alive&&this.onDais(h))n++;S.daisT=n?S.daisT+.4:0;if(S.cd.bch<=0&&S.fightT>25&&(n>=2||n>=1&&S.daisT>4)){S.cd.bch=16;this.bchW(a,S);return}}
    if(P===2&&!enc){
      if(S.cd.coil<=0){const pi=this.coilPick(a,S);if(pi>=0){S.cd.coil=18;this.coilW(a,S,pi);return}}
      if(S.cd.br<=0){const c=this.cluster(9);if(c){S.cd.br=17;this.brW(a,S,c);return}}
      if(S.cd.sum<=0){S.cd.sum=26;this.sumW(a,S);return}}
    // (stage 3's lurking only goes for people down in the water: the walkways are safe from it then)
    if(S.cd.er<=0){const t=this.target(a,S,h=>this.inHall(h)&&(!enc||h.c.y<2));if(t){S.cd.er=enc?9:P===1?7.5:9;this.erW(a,S,t);return}}
    if(S.cd.tl<=0){const t=this.target(a,S,h=>this.inHall(h)&&h.c.y<(enc?2:5));if(t){S.cd.tl=enc?11:P===1?7:10;this.tlW(a,S,t);return}}},
  // a knot of at least two people within r of each other (the centre), or null
  cluster(r){const L=SCEN.H.filter(h=>h.alive&&this.inHall(h));let best=null,bn=1;for(const h of L){let n=0,x=0,y=0,z=0;for(const q of L)if(Math.hypot(q.c.x-h.c.x,q.c.z-h.c.z)<r*.8&&Math.abs(q.c.y-h.c.y)<3){n++;x+=q.c.x;y+=q.c.y;z+=q.c.z}if(n>bn){bn=n;best={x:x/n,y:y/n,z:z/n,n}}}return best},
  // ---------- the rise: ripples under the target, then up through the water and over in an arc ----------
  erW(a,S,t){const E={x:t.c.x+t.c.vx*.4,y:t.c.y,z:t.c.z+t.c.vz*.4};E.y=Math.max(floorY(E.x,E.y+.5,E.z),-4);const sy=Math.min(this.swimY(),E.y-1.6);
    const dist=Math.hypot(E.x-S.H.x,E.z-S.H.z);this.swim(S,[[S.H.x,sy,S.H.z],[E.x,sy,E.z]],Math.max(14,dist/1.1));S.er=E;S.mode='erW';S.mt=S.mt0=1.5*EPTW();
    const wy=Math.max(E.y,WATER.surf(E.x,E.z,E.y));TELE.add({k:'c',x:E.x,y:wy,z:E.z,r:4,d:S.mt,col:0xff3a3a});this.fx({k:'ew',x:r2(E.x),y:r2(wy),z:r2(E.z),d:r2(S.mt)})},
  erGo(a,S){const E=S.er,D=this.divePt(E.x,E.z,this.flooded()),apex=Math.max(E.y,0)+7.5;S.H.x=E.x;S.H.z=E.z;this.arc(S,D[0],D[1],D[2],2.3,apex-Math.max(S.H.y,D[1]));S.mode='er';S.mt=2.4;S.erHit=false;
    this.fx({k:'eu',i:a.id,x:r2(E.x),y:r2(Math.max(E.y,WATER.surf(E.x,E.z,E.y))),z:r2(E.z)})},
  erStrike(a,S){const E=S.er;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-E.x,h.c.z-E.z);if(d>3.8||Math.abs(h.c.y-E.y)>2.6)continue;const f=1-d/4.2;
      SCEN.pushHuman(h,(h.c.x-E.x)/(d||1)*5,7+4*f,(h.c.z-E.z)/(d||1)*5);hurtHuman(h,EPD((S.enc?24:36)*(.6+.4*f)),a,{});epFx(h,'kd',.9)}},
  // ---------- the tail: up out of the water next to the target, cocked 1 s, then whipped along an 8 m strip ----------
  tlW(a,S,t){const an=Math.atan2(t.c.z-S.H.z,t.c.x-S.H.x)+rr(-.5,.5),bx=t.c.x-Math.cos(an)*4.6,bz=t.c.z-Math.sin(an)*4.6,by=Math.max(WATER.surf(bx,bz,t.c.y),floorY(bx,t.c.y+.5,bz)),yaw=Math.atan2(-(t.c.x-bx),-(t.c.z-bz)),w=1*EPTW();
    S.tl={x:bx,y:by,z:bz,yaw,w,t:0};S.mode='tl';S.mt=w+1.7;TELE.add({k:'r',x:bx,y:by,z:bz,yaw,w:3.2,l:8.4,d:w,col:0x9aff3a});this.fx({k:'tl',x:r2(bx),y:r2(by),z:r2(bz),yaw:r3(yaw),w:r2(w),id:++E5X.id})},
  tlStrike(a,S){const T=S.tl,fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw);for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-T.x,dz=h.c.z-T.z,al=dx*fx+dz*fz,sd=dx*Math.cos(T.yaw)-dz*Math.sin(T.yaw);
      if(al<-.5||al>8.6||Math.abs(sd)>1.9||Math.abs(h.c.y-T.y)>2.4)continue;hurtHuman(h,EPD(S.enc?18:30),a,{claw:1});h.tmVen=3;SCEN.pushHuman(h,fx*6,3,fz*6);if(h.net&&NET.host)netEv('etm',{k:'ven',i:h.id})}},
  // ---------- beaching onto the dais (phase 1) ----------
  bchW(a,S){const sz=S.H.z<0?-9.5:9.5;this.swim(S,[[S.H.x,-2.5,sz],[0,-2.5,sz]],16);S.mode='bchW';S.mt=1.3*EPTW()+.6;S.bz=sz;TELE.add({k:'c',x:0,y:1.55,z:0,r:5.4,d:S.mt+.9,col:0xff3a3a});this.fx({k:'w',i:a.id,s:'bch'})},
  // ---------- phase 2: coiling a pillar ----------
  coilPick(a,S){const P=MAP.ez.pillars;let best=-1,bs=-1;for(let i=0;i<P.length;i++){const b=P[i].box;let n=0;for(const h of SCEN.H)if(h.alive&&h.c.y>3.4&&h.c.y<5.5&&h.c.x>b[0]&&h.c.x<b[2]&&h.c.z>b[1]&&h.c.z<b[3])n++;
      if(n>bs||n===bs&&n>0&&Math.random()<.5){bs=n;best=i}}return bs>0?best:-1},
  coilW(a,S,pi){const P=MAP.ez.pillars[pi],an=Math.atan2(S.H.z-P.z,S.H.x-P.x),r=3.75,x=P.x+Math.cos(an)*r,z=P.z+Math.sin(an)*r;
    this.swim(S,this.lanePath(S.H.x,S.H.z,x,z,.42).concat([[x,.42,z]]),11);S.coil={p:pi,a0:an,glow:-1,dmg:0,t:0};S.mode='coilW';S.mt=6},
  coilUp(a,S){const C=S.coil,P=MAP.ez.pillars[C.p];S.mv={k:'coil',px:P.x,pz:P.z,r:3.75,y0:S.H.y,y1:6.4,T:2.3,t:0,a0:Math.atan2(S.H.z-P.z,S.H.x-P.x),w:3.9};S.mode='coil';S.mt=2.3;
    TELE.add({k:'c',x:P.x,y:4,z:P.z,r:4.8,d:2.3*EPTW(),col:0xff3a3a});this.fx({k:'co',i:a.id,p:C.p});EP.say('tCoil')},
  coilBreak(a,S){if(!S.coil||S.mode!=='coilS')return;this.grog(a,35);S.mode='coilR';S.mt=0;this.fx({k:'cob',i:a.id});EP.say('tCoilB')},
  // ---------- phase 2: spore breath ----------
  brW(a,S,c){const an=Math.atan2(S.H.z-c.z,S.H.x-c.x),x=clamp(c.x+Math.cos(an)*8,-30,30),z=clamp(c.z+Math.sin(an)*8,-18,18);this.swim(S,this.lanePath(S.H.x,S.H.z,x,z,.42).concat([[x,.42,z]]),12);S.br={x:c.x,y:c.y,z:c.z,sx:x,sz:z};S.mode='brW';S.mt=6},
  // ---------- phase 2: calling the drowned ----------
  sumW(a,S){S.mode='sum';S.mt=1.8;S.coreT=1.8;this.arc(S,S.H.x,2.6,S.H.z,.6,.4);this.fx({k:'roar',i:a.id,c:1});EP.say('tSum')},
  summon(a,L){let s=0;const k=a.tm&&a.tm.enr?1.5:1;for(const [zc,n] of L)for(let i=0;i<Math.round(n*k);i++){const p=this.risePt();if(SCEN.spawn(zc,p))s++}return s},
  // where a drowned one climbs out: the hall's floor (or the shaft's bottom in phase 3), away from everybody's feet
  risePt(){const D=EP.bossPh>=3;for(let k=0;k<12;k++){let x,y,z;if(D){const an=rr(0,TAU),r=rr(5,13);x=E5D.cx+Math.cos(an)*r;z=E5D.cz+Math.sin(an)*r;y=0}else{x=rr(-30,30);z=rpick([-18,-14,0,14,18])+rr(-1,1);y=0}
      let ok=true;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-x,h.c.z-z)<6)ok=false;if(ok&&charFits({hw:.32,h:1.85},x,y+.05,z))return [x,y,z]}return null},
  // ---------- the modes ----------
  step(a,dt,S){const H=S.H;
    switch(S.mode){
    case 'erW':{if(S.mt<=0)this.erGo(a,S);break}
    case 'er':{if(!S.erHit&&S.mv&&S.mv.t>.22){S.erHit=true;this.erStrike(a,S)}if(S.mv&&S.mv.done){S.mode='dive';S.mt=1.6;const y=this.swimY();if(this.flooded()){this.swim(S,[[H.x+rr(-4,4),y,clamp(H.z+rr(-4,4),-18,18)]],6)}else this.swim(S,[[clamp(H.x+(Math.random()<.5?-5:5),-29,29),-2.5,H.z<0?-9.5:9.5]],6);this.fx({k:'dv',x:r2(H.x),y:r2(WATER.surf(H.x,H.z,H.y)),z:r2(H.z)})}break}
    case 'dive':{if(S.mt<=0){S.mode='';S.pt=S.ph===2&&!S.enc?rr(1.4,2.4):rr(.4,1)}break}
    case 'tl':{const T=S.tl;T.t+=dt;if(!T.hit&&T.t>=T.w){T.hit=true;this.tlStrike(a,S)}if(S.mt<=0){S.mode='';S.tl=null;S.pt=.5}break}
    case 'bchW':{if(S.mv&&S.mv.done&&!S.bArc){S.bArc=true;this.arc(S,0,2.3,0,1.1,4.2);this.fx({k:'eu',i:a.id,x:r2(H.x),y:r2(WATER.surf(H.x,H.z,0)),z:r2(H.z)})}
      if(S.bArc&&S.mv&&S.mv.done){S.bArc=false;S.mode='bch';S.mt=4;S.coreT=1.2;S.mv={k:'hold'};this.fx({k:'bch',i:a.id});EP.say('tBch');
        for(const h of SCEN.H)if(h.alive&&this.onDais(h)){hurtHuman(h,EPD(20),a,{});epFx(h,'kd',1.2);SCEN.pushHuman(h,(h.c.x)/(Math.abs(h.c.x)||1)*6,4,(h.c.z-S.bz)/(Math.abs(h.c.z-S.bz)||1)*4)}}
      if(S.mt<-3){S.bArc=false;S.mode='';S.mv=null}break}
    case 'bch':{if(S.mt<=0){S.mode='bchX';S.mt=3;const oz=-S.bz;this.swim(S,[[0,1.4,oz*.45],[0,-.4,oz*.8],[rr(-6,6),-2.5,oz]],6)}break}
    case 'bchX':{if(S.mt<=0||S.mv&&S.mv.done){S.mode='';S.pt=.6}break}
    case 'coilW':{if(S.mv&&S.mv.done)this.coilUp(a,S);else if(S.mt<=0){S.mode='';S.coil=null}break}
    case 'coil':{if(S.mv&&S.mv.done){S.mode='coilS';S.mt=3;S.mv={k:'hold'};this.fx({k:'cs',i:a.id})}break}
    case 'coilS':{const C=S.coil,P=MAP.ez.pillars[C.p],b=P.box;C.t+=dt;C.tick=(C.tick||0)-dt;
      // the glowing section: the segment that lies at the platform's height
      if(C.glow<0){let bi=-1,bd=1e9;for(const p of TMV.parts)if(p.k==='seg'){const d=Math.abs(p.y-4.4);if(d<bd){bd=d;bi=p.i}}C.glow=bi;this.fx({k:'cg',g:bi})}
      if(C.tick<=0){C.tick=.25;for(const h of SCEN.H)if(h.alive&&h.c.y>3.3&&h.c.y<5.8&&h.c.x>b[0]-.2&&h.c.x<b[2]+.2&&h.c.z>b[1]-.2&&h.c.z<b[3]+.2&&Math.hypot(h.c.x-P.x,h.c.z-P.z)<4.9){hurtHuman(h,EPD(30*.25),a,{claw:1});if(Math.random()<.3)epFx(h,'dz',.5)}}
      if(S.mt<=0){S.mode='coilR';S.mt=0}break}
    case 'coilR':{if(!S.cr){S.cr=1;const P=MAP.ez.pillars[S.coil.p],an=Math.atan2(H.z-P.z,H.x-P.x)+rr(-.6,.6),x=clamp(P.x+Math.cos(an)*12,-29,29),z=clamp(P.z+Math.sin(an)*12,-17,17);this.arc(S,x,.42,z,1.3,1.5)}
      if(S.mv&&S.mv.done){S.cr=0;S.coil=null;S.mode='dive';S.mt=1;this.fx({k:'dv',x:r2(H.x),y:r2(WATER.surf(H.x,H.z,H.y)),z:r2(H.z)});this.fx({k:'cg',g:-1})}break}
    case 'brW':{if(S.mv&&S.mv.done&&!S.brUp){S.brUp=1;this.arc(S,S.br.sx,3.4,S.br.sz,.5,.3);S.mt=1*EPTW()+.5;S.coreT=S.mt+1.4;TELE.add({k:'c',x:S.br.x,y:S.br.y,z:S.br.z,r:8,d:S.mt,col:0x7aff3a});this.fx({k:'bri',i:a.id})}
      if(S.brUp&&S.mt<=0){S.brUp=0;S.mode='br';S.mt=1.4;S.mv={k:'hold'};E5X.sporeAdd(S.br.x,S.br.y,S.br.z,8.5,9,6);this.fx({k:'bro',i:a.id,x:r2(S.br.x),y:r2(S.br.y),z:r2(S.br.z)});EP.say('tBreath')}
      else if(!S.brUp&&S.mt<=0){S.mode=''}break}
    case 'br':{if(S.mt<=0){S.mode='dive';S.mt=1;this.swim(S,[[H.x,.42,H.z]],3)}break}
    case 'sum':{if(S.mt<=0){this.summon(a,[['drowned',3]]);S.mode='dive';S.mt=.8;this.swim(S,[[H.x,this.swimY(),H.z]],3)}break}
    case 'str':{if(!S.mv||S.mv.done||S.mv.k!=='arc')S.mv={k:'hold'};if(S.mv.k==='hold')H.y=approach(H.y,S.enc===1?.8:.78,dt*2);
      if(WATER.drainT<=0&&S.enc!==1){S.mode='';S.pt=.6;S.invT=0;this.fx({k:'str',i:a.id,o:0})}
      if(S.enc===1&&S.mt<=0)this.retreat(a,S);break}
    case 'ret':{if(S.mv&&S.mv.done||S.mt<=0){S.mode='gone';EP.meetEnd(a);EP.say('tRet')}break}
    case 'ph':this.phStep(a,dt,S);break;
    case 'down':{if(S.mt<=0){S.mode=S.ph===3?'climb':'';S.pt=.6;this.fx({k:'up',i:a.id})}break}
    case 'climb':this.climbThink(a,dt,S);break;
    case 'lc':{if(S.mt<=0){S.mode='climb'}break}
    case 'top':{if(S.mv&&S.mv.done&&!S.topped){S.topped=1;this.fx({k:'top',x:r2(H.x),y:r2(H.y),z:r2(H.z)});EP.say('tTop');EP.later(1.2,()=>{if(EP.st===4)EP.fail()})}break}}},
  // the encounter's end: once stranded, it slides back into a trench and away
  retreat(a,S){S.mode='ret';S.mt=6;S.invT=99;const z=S.H.z<0?-9.5:9.5;this.swim(S,[[S.H.x,-.5,z],[S.H.x,-2.5,z],[-31,-2.5,z]],8);this.fx({k:'roar',i:a.id})},
  // touching the body when it is out of the water: a shove and a scrape
  contact(a,S){const tch=S.touch;for(const p of TMV.parts){if(p.k!=='seg'&&p.k!=='head')continue;for(const h of SCEN.H){if(!h.alive||G.t<(tch[h.id]||0))continue;const dx=h.c.x-p.x,dy=h.c.y+.9-p.y,dz=h.c.z-p.z,d=Math.hypot(dx,dz);
      if(d>p.r+.45||Math.abs(dy)>p.r+.9)continue;tch[h.id]=G.t+.9;if(S.spd<2.5&&S.mode!=='coilS')continue;SCEN.pushHuman(h,dx/(d||1)*7,3,dz/(d||1)*7);hurtHuman(h,EPD(S.spd>8?14:8),a,{claw:1})}}},
  // ---------- glimpse in the tunnel (stage 2): along the channel, one rise over the walkway, round the corner and gone ----------
  glimpse(a,dt,S){const G0=S.gl,H=S.H;G0.t+=dt;
    if(G0.st===0){let near=null,nd=1e9;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-H.x,h.c.z-H.z);if(d<nd){nd=d;near=h}}
      if((nd<10&&near&&near.c.x<H.x)||H.x<=31||(S.mv&&S.mv.done)){G0.st=1;const tx=Math.max(4,H.x-15),hz=near&&Math.abs(near.c.z+44)<6?near.c.z:-48.6;
        G0.E={x:(H.x+tx)/2,y:0,z:clamp(hz,-49,-39)};this.arc(S,tx,-1.25,-44,1.9,5.6);TELE.add({k:'c',x:G0.E.x,y:0,z:G0.E.z,r:3.4,d:.9,col:0xff3a3a});this.fx({k:'eu',i:a.id,x:r2(H.x),y:r2(-.7),z:r2(H.z)});G0.hit=false}}
    else if(G0.st===1){if(!G0.hit&&S.mv&&S.mv.t>.9){G0.hit=true;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-G0.E.x,h.c.z-G0.E.z);if(d<3.6&&Math.abs(h.c.y)<2){hurtHuman(h,EPD(25),a,{});SCEN.pushHuman(h,0,6,(h.c.z-G0.E.z)*2);epFx(h,'kd',.8)}}}
      if(S.mv&&S.mv.done){G0.st=2;this.fx({k:'dv',x:r2(H.x),y:r2(-.7),z:r2(H.z)});this.swim(S,[[0,-1.25,-44],[0,-1.25,-30],[0,-1.25,-22]],7.5);EP.later(1.5,()=>EP.say('enc5c'))}}
    else if(S.mv&&S.mv.done||G0.t>40){S.mode='gone';EP.meetEnd(a)}},
  // ---------- phase 3: the climb ----------
  climbStart(a,S){S.mode='climb';S.mv={k:'climb'};S.cl={ang:Math.atan2(S.H.z-E5D.cz,S.H.x-E5D.cx),y:S.H.y};S.pt=2;Object.assign(S.cd,{rock:3,jet:6,smn:8});EP.later(1.5,()=>EP.say('tNest'))},
  climbThink(a,dt,S){if(!S.mv||S.mv.k!=='climb')S.mv={k:'climb'};S.pt-=dt;if(S.pt>0)return;S.pt=.5;
    if(!S.last&&a.hp<a.maxHp*.1){S.last=true;S.coreT=999;S.mode='lc';S.mt=2;this.fx({k:'roar',i:a.id,c:1});EP.say('tLast');this.summon(a,[['drowned',3],['runner',3]]);return}
    const inD=SCEN.H.filter(h=>h.alive&&Math.hypot(h.c.x-E5D.cx,h.c.z-E5D.cz)<15.2);if(!inD.length)return;
    if(S.cd.rock<=0){S.cd.rock=7;const n=Math.min(inD.length,inD.length>2?2:1);for(const h of shuffle(inD.slice()).slice(0,n))if(h.c.y>.5){this.rocks(h);}this.fx({k:'shk'});EP.say('tRock');return}
    if(S.cd.jet<=0){const L=inD.filter(h=>h.c.y>1.5);if(L.length){S.cd.jet=11;const h=rpick(L);if(E5X.jetAt(h))EP.say('tJet');return}}
    if(S.cd.smn<=0){S.cd.smn=17;this.summon(a,[['drowned',2],['runner',2]]);return}},
  rocks(h){const p={x:h.c.x+h.c.vx*.5,y:h.c.y,z:h.c.z+h.c.vz*.5},d=1.1*EPTW();E5X.rockAt(p.x,p.y,p.z,2.6,d,35);E5X.fx({k:'rk',x:r2(p.x),y:r2(p.y),z:r2(p.z),r:260,d:r2(d)})},
  topOut(a,S){S.mode='top';S.mt=3;this.arc(S,E5D.cx+Math.cos(S.cl.ang)*3,E5D.top+4,E5D.cz+Math.sin(S.cl.ang)*3,1.4,2);S.invT=99},
  // ---------- stagger, the big falls, the parts ----------
  grog(a,v){const S=a.tm;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='ph'||S.mode==='top')return;S.grog+=v;if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,S,6)}},
  down(a,S,t){if(S.mode==='ph'||S.mode==='top'||S.mode==='gone')return;S.grog=0;S.mode='down';S.mt=t;S.coreT=Math.max(S.coreT,t*.6);if(S.ph<3){const y=Math.max(WATER.lv.C+.5,.8);this.arc(S,S.H.x,y,S.H.z,.6,.3)}else S.mv={k:'climb'};this.fx({k:'dn',i:a.id});EP.say('tDown')},
  sacHit(a,S,i,d){if(S.sacs[i]<=0)return;S.sacs[i]-=d;if(S.sacs[i]>0)return;S.sacs[i]=-1;const p=TMV.parts.find(q=>q.k==='sac'&&q.i===i);this.fx({k:'sac',i:a.id,s:i,x:r2(p?p.x:S.H.x),y:r2(p?p.y:S.H.y),z:r2(p?p.z:S.H.z)});
    if(p&&typeof KX!=='undefined'){const s0=KX.swarmAdd(p.x,Math.max(p.y-1,floorY(p.x,p.y,p.z)),p.z);if(NET.host)netEv('ekh',{k:'sw',x:r2(p.x),y:r2(p.y-1),z:r2(p.z),id:s0.id})}
    if(S.ph===3)S.gauge=Math.max(0,S.gauge-8);this.grog(a,30);if(S.sacs.every(v=>v<=0)){S.grog=0;this.down(a,S,8);EP.say('tSacAll')}else EP.say('tSac')},
  jointHit(a,S,i,d){if(S.jts[i]<=0||TM_JOINTS[i]+1>=S.len)return;S.jts[i]-=d;if(S.jts[i]>0)return;S.jts[i]=-1;const from=TM_JOINTS[i]+1,p=TMV.parts.find(q=>q.k==='joint'&&q.i===i);
    for(let j=0;j<TM_JOINTS.length;j++)if(TM_JOINTS[j]>=from)S.jts[j]=-1;S.len=from;this.grog(a,25);this.fx({k:'cut',i:a.id,n:from});EP.say('tJoint');
    if(p)for(let k=0;k<2;k++){const q=[p.x+rr(-1.5,1.5),Math.max(floorY(p.x,p.y,p.z),WATER.surf(p.x,p.z,p.y)>p.y?floorY(p.x,p.y,p.z):floorY(p.x,p.y,p.z)),p.z+rr(-1.5,1.5)];if(charFits({hw:.42,h:.9},q[0],q[1]+.05,q[2]))SCEN.spawn('centi',q)}},
  // ---------- phases ----------
  floorHit(a){const S=a.tm;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone'){S.invT=99;this.retreat(a,S)}return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  toPhase(a,n){const S=a.tm;S.ph=n;S.grog=0;S.mode='ph';S.pst=0;S.mt=2.4;S.invT=99;S.coreT=2.2;S.mv={k:'hold'};S.coil=null;S.tl=null;EP.bossPh=n;this.fx({k:'ph',n,i:a.id});EP.reviveAll();
    Object.assign(S.cd,{er:6,tl:8,coil:6,br:9,sum:12,rock:3,jet:6,smn:10});this.arc(S,S.H.x,Math.max(2.6,S.H.y+2),S.H.z,.8,.5);EP.say(n===2?'tP2':'tP3')},
  // the phase changes as a little script: roar, then off to the sluice (P2) or the shaft gate (P3), through it, and on
  phStep(a,dt,S){const H=S.H;
    if(S.pst===0){if(S.mt<=0){S.pst=1;const t=S.ph===2?MAP.ez.sluiceW:MAP.ez.sluiceE,x=t[0]+(S.ph===2?3:-3);this.swim(S,this.lanePath(H.x,H.z,x,0,.42).concat([[x,.42,0]]),13)}}
    else if(S.pst===1){if(S.mv&&S.mv.done){S.pst=2;S.mt=.9;this.arc(S,H.x+(S.ph===2?-1.5:1.5),1.6,0,.5,.6);this.fx({k:'smash',g:S.ph===2?'gW':'gS'})}}
    else if(S.pst===2){if(S.mt<=0){S.pst=3;if(S.ph===2){EP.gateOpen('gW',true);WATER.set('C',1.2,.22);this.fx({k:'gush'});S.mode='';S.invT=0;S.pt=1.5;this.swim(S,this.lanePath(H.x,H.z,-12,0,.42),8)}
        else{EP.gateOpen('gS',true);this.swim(S,[[36,.9,0],[42,.7,0],[E5D.cx-6,.6,0],[E5D.cx-4.25,.6,0]],10);SCEN.zsp=EP.zone('D').zsp}}}
    else if(S.pst===3){if(S.mv&&S.mv.done){S.invT=0;S.gauge=0;this.climbStart(a,S);this.fx({k:'roar',i:a.id})}}},
  // ---------- host: damage in (before the game applies it) ----------
  hit(t,dmg,src,o){const S=t.tm;if(S.invT>0||S.idle&&!S.enc||S.enc===2||S.mode==='gone'||S.mode==='ret'||S.mode==='top')return 0;o.kb=0;o.up=0;
    const p=TMV.partAt(o.x,o.y,o.z);let mul=1;if(o.hs){const W=WPN[o.w];mul*=1.2/((W&&W.hs)||3)}
    // (the first contacts only drive it off: its sacs and joints hold until the real fight)
    if(p){if(p.k==='seg'||p.k==='tail')mul*=.3;else if(p.k==='core'){mul*=3;this.grog(t,dmg/(t.maxHp*.01))}else if(p.k==='sac'){if(!S.enc)this.sacHit(t,S,p.i,dmg)}else if(p.k==='joint'){if(!S.enc)this.jointHit(t,S,p.i,dmg)}
      if(S.coil&&S.mode==='coilS'&&p.k==='seg'&&p.i===S.coil.glow){S.coil.dmg+=dmg;if(S.coil.dmg>=t.maxHp*.03)this.coilBreak(t,S)}}
    else if(!o.he&&!TM_FIRE[o.w]&&o.x!=null)return 0;// (a hit that found no exposed part: under the water)
    if((S.mode==='str'||S.mode==='bch'||S.mode==='down')&&!(p&&p.k==='core'))mul*=1.5;// (the core's ×3 does not stack with it)
    if(o.he){if(!(o.y!=null&&WATER.surf(o.x,o.z,o.y)>o.y))this.grog(t,15);else mul*=.2}
    if(S.enc===1)mul*=.5;if(S.mode==='ph')return 0;
    return this.floor(t,S,dmg*mul,src,o)},
  floor(t,S,out,src,o){const em=(src&&src.team===TH&&!(o&&o.flat)?1+.1*G.moraleLvl:1)*(src&&src.wup&&o&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    const fl=t.maxHp*(S.enc?.85:S.ph===1?TM_PH[1]:S.ph===2?TM_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}return out},
  // (after) the threat list; phase 3: every 4 % knocks the gauge back
  after(t,r,src){this.threat(t,r,src);const S=t.tm;if(S&&S.ph===3&&!S.enc){S.dmgAcc+=r;const st=t.maxHp*.04;while(S.dmgAcc>=st){S.dmgAcc-=st;S.gauge=Math.max(0,S.gauge-8)}}},
  // ---------- the boss fight's own devices: the two drain wheels (0, 1), the two fan switches (2, 3) ----------
  useNear(h){if(!EP.on||EP.id!==5||EP.st!==4||EP.bossPh!==2)return -1;for(let i=0;i<2;i++)if(E5X.wheelNear(h,i))return i;for(let i=0;i<2;i++)if(E5X.fanNear(h,i))return 2+i;return -1},
  useInfo(i,L){if(i<2){if(WATER.drainT>0)return {act:(L?'Draining — ':'배수 중 — ')+Math.ceil(WATER.drainT)+(L?'s':'초'),p:1,x:1};if(E5X.wcd>0)return {act:(L?'The drain gates reset in ':'배수 수문 복귀까지 ')+Math.ceil(E5X.wcd)+(L?'s':'초'),p:0,x:1};
      const o=E5X.wheel[1-i]>=6;return {act:(L?'turn the drain wheel':'배수 수문 핸들 돌리기')+(o?(L?' — the other one is done':' — 반대쪽은 끝남'):(L?' — both are needed':' — 두 개 다 돌려야 함')),p:E5X.wheel[i]/6,x:0}}
    const f=i-2;if(E5X.fcd[f]>0)return {act:(L?'Fan cooling down — ':'환풍기 대기 — ')+Math.ceil(E5X.fcd[f])+(L?'s':'초'),p:0,x:1};return {act:L?'start the vent fans':'환풍기 가동',p:0,x:0}},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;if(j<2)return E5X.drainReady()&&E5X.wheel[j]<6?j:-1;return E5X.fcd[j-2]<=0&&E5X.spores.some(S=>S.t<S.life-1)?j:-1},
  // ---------- bots ----------
  // phase 1–2: the walkway grid (the platforms round the pillars, away from the coiled one), closing in when it is stuck; phase 3: up the
  // ramp a little below it; the drain wheels and the fans when they are worth it
  botGoal(a,i){const b=EP.bossA();if(!b||!b.tm||EP.ph!=='run')return null;const S=b.tm,E=MAP.ez;
    if(S.ph>=3||S.mode==='ph'&&S.pst>=2&&S.ph===3){const y=clamp(S.cl.y-4-(i%3)*1.5,2.5,31);let u=0;for(let k=0;k<200;k++){const uu=k/200*E5D.U;if(e5H(uu)>=y){u=uu;break}}u=clamp(u+(i%2?.2:-.15)+Math.floor(G.t/8)%2*.08,0,E5D.U-.1);const p=e5At(u,13.3);return [p.x,p.y,p.z,.7]}
    if(S.ph===2&&E5X.drainReady()&&S.mode!=='str'&&!S.coil){for(let w=0;w<2;w++){if(E5X.wheel[w]>=6)continue;if(this.dutyBot(w,(h,j)=>Math.hypot(h.c.x-E.wheels[j].x,h.c.z-E.wheels[j].z))===a){const v=E.wheels[w];return [v.x+v.bx,v.y,v.z+v.bz,.35]}}}
    if(E5X.spores.length&&E5X.fcd.some(c=>c<=0)){const f=E5X.fcd[0]<=0?0:1;if(this.dutyBot(9,()=>0)===a&&E5X.spores.some(Sp=>Math.hypot(Sp.x-a.c.x,Sp.z-a.c.z)<14)){const v=E.fans[f];return [v.bx,v.y,v.bz,.35]}}
    const close=S.mode==='str'||S.mode==='bch'||S.mode==='down';const P=E.pillars,H=S.H;
    // a platform 8–16 m from it (not the one it is coiling), a different one for each bot; stuck: the floor or the dais edge near it
    if(close&&S.mode==='bch'){const an=i*1.3+.4;return [Math.cos(an)*7,0,Math.sin(an)*5.5,1.2]}
    const L=[];for(let k=0;k<P.length;k++){if(S.coil&&S.coil.p===k)continue;const d=Math.hypot(P[k].x-H.x,P[k].z-H.z);if(d<(close?4:7)||d>(close?13:19))continue;L.push(k)}
    if(!L.length)for(let k=0;k<P.length;k++)L.push(k);L.sort((u,v)=>Math.hypot(P[u].x-H.x,P[u].z-H.z)-Math.hypot(P[v].x-H.x,P[v].z-H.z));
    const k=L[(i+Math.floor(G.t/9))%L.length],pl=P[k],an=i*1.9+Math.floor(G.t/7)*.6;return [pl.x+Math.cos(an)*2.7,4,pl.z+Math.sin(an)*2.7,.6]},
  // the bot (alive, a bot) nearest the j-th spot by f, picked once per check: the one that takes a duty
  dutyBot(j,f){let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=f(h,j);if(d<bd){bd=d;best=h}}return best},
  goalTag(b){const S=b.tm;if(!S)return '';return S.mode+(S.coil?S.coil.p:'')+(E5X.drainReady()?'d':'')+(E5X.spores.length?'s':'')+(S.ph===3?Math.round(S.cl.y/4):'')},
  // a red warning is TELE's; also: the coiled platform, spore clouds, the beaching dais
  danger(a){if(EP.st!==4&&!(EP.meet&&EP.meet.st==='on'))return null;const c=a.c,b=EP.bossA();
    if(b&&b.tm&&b.tm.coil&&(b.tm.mode==='coil'||b.tm.mode==='coilS')){const P=MAP.ez.pillars[b.tm.coil.p],bx=P.box;if(c.y>3.3&&c.x>bx[0]-.3&&c.x<bx[2]+.3&&c.z>bx[1]-.3&&c.z<bx[3]+.3){const dx=c.x-P.x,dz=c.z-P.z,l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}}
    const Sp=E5X.inSpore(a);if(Sp){const dx=c.x-Sp.x,dz=c.z-Sp.z,l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}
    for(const T of TMT.L){const dx=c.x-T.x,dz=c.z-T.z;if(Math.hypot(dx,dz)<9&&T.t<T.w+.4){const l=Math.hypot(dx,dz)||1;return {ax:-dz/l,az:dx/l}}}
    return null},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==5)return;TMT.update(dt);const b=EP.bossA()||SCEN.Z.find(z=>z.boss&&z.zc==='tiamat');if(!b||b.zc!=='tiamat'){TMV.update(null,dt);return}
    if(NET.cli){const f=EP.bf;if(f&&f.id===b.id){TMV.len=f.len;TMV.sacs=f.sacs;TMV.jts=f.jts;TMV.core=f.f&4?1:0;TMV.climb=f.f&512?1:0;TMV.flags=f.f;TMV.coil=f.cg;if(f.e5)E5X.unpack(f.e5)}}
    else if(b.tm){const S=b.tm;TMV.len=S.len;TMV.sacs=S.sacs.reduce((m,v,i)=>v>0?m|1<<i:m,0);TMV.jts=S.jts.reduce((m,v,i)=>v>0?m|1<<i:m,0);TMV.core=S.coreT>0?1:0;TMV.climb=S.mode==='climb'||S.mode==='down'&&S.ph===3||S.mode==='lc'?1:0;TMV.flags=this.flagsOf(b,S);TMV.coil=S.coil?S.coil.glow:-1}
    TMV.speed=Math.hypot(b.c.vx||0,b.c.vz||0)},
  stageClear(){TMT.clear()},
  clear(){TMV.clear();TMT.clear()},
  flagsOf(b,S){return (S.sub?1:0)|(S.mode==='str'||S.mode==='bch'?2:0)|(S.coreT>0?4:0)|(S.invT>0&&!S.enc?8:0)|(S.enr?16:0)|(S.enc?32:0)|(S.mode==='coilS'?64:0)|(S.mode==='down'?128:0)|(S.mode==='erW'||S.mode==='brW'?256:0)|(TMV.climb?512:0)},
  // the boss bar's snapshot
  bsOf(b){const S=b.tm;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,f:this.flagsOf(b,S),gauge:S.gauge,len:S.len,sacs:TMV.sacs,jts:TMV.jts,cg:S.coil?S.coil.glow:-1,mode:Math.max(0,TM_MODE.indexOf(S.mode))}},
  bsPack(b){if(!b.tm)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,Math.round(B.gauge*10),B.len,B.sacs,B.jts,B.cg,B.mode,E5X.pack()]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],gauge:B[5]/10,len:B[6],sacs:B[7],jts:B[8],cg:B[9],mode:B[10],e5:B[11]||null}},
  hud(B,L){const f=B.f,ns=[0,1,2,3].filter(i=>B.sacs&1<<i).length;
    return {ss:f&8?(L?'INVULNERABLE':'무적'):f&128?(L?'DOWN — pour it on!':'쓰러졌다 — 몰아쳐!'):f&2?(L?'STRANDED — ×1.5':'좌초 — 피해 1.5배'):f&4?(L?'THE CORE IS OPEN — ×3':'코어 노출 — 3배!'):f&64?(L?'COILING — shoot the glowing section!':'휘감기 — 빛나는 마디를 쏴!'):f&1&&!(f&512)?(L?'UNDER THE WATER':'물속 — 총알이 안 들어감'):f&16?(L?'ENRAGED':'광폭화'):'',
      cls:f&16||f&64?'r':f&128||f&2||f&4?'y':'',sp:(f&32?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(L?' · SACS ':' · 알주머니 ')+ns+'/4',g1:B.grog/(B.gmax||100),g2:B.ph>=3&&!(f&32)?B.gauge/100:null}},
  // the drain wheels (hot while the hall is flooded and they are ready), the fan switches (when spores hang), the glowing coil section
  markers(list,L,P){const E=MAP.ez,b=EP.bossA(),S=b&&!NET.cli?b.tm:null,ph=EP.bossPh;
    if(ph===2){const rdy=E5X.wcd<=0&&WATER.drainT<=0&&WATER.lv.C>.9;for(let i=0;i<2;i++){const v=E.wheels[i];if(rdy&&E5X.wheel[i]<6)list.push([v.x,v.y+2.4,v.z,L?'⚡ DRAIN WHEEL':'⚡ 배수 핸들','p hot']);else if(!rdy&&E5X.wcd>0&&Math.hypot(v.x-P.c.x,v.z-P.c.z)<30)list.push([v.x,v.y+2.3,v.z,(L?'drain ':'배수 ')+Math.ceil(E5X.wcd)+(L?'s':'초'),'s'])}
      if(E5X.spores.length)for(let i=0;i<2;i++)if(E5X.fcd[i]<=0){const v=E.fans[i];list.push([v.x,v.y+2.4,v.z,L?'🌀 VENT FAN':'🌀 환풍기','p hot'])}}
    if(ph===3&&P.c.x<33&&EP.ph==='run')list.push([36,2.2,0,L?'SHAFT No. 3':'제3수직구','g']);
    const cg=TMV.coil;if(cg>=0){const s=TMV.segs[cg];if(s&&s.grp.visible){const p=s.grp.position;list.push([p.x,p.y+1.4,p.z,L?'💥 GLOWING SECTION':'💥 빛나는 마디','p hot'])}}
    if(TMV.core&&TMV.vis){const h=TMV.head.grp.position;list.push([h.x,h.y+1.8,h.z,L?'💥 CORE':'💥 코어','p hot'])}void S},
  // ---------- every page: before the rig is posed ----------
  // (bots aim at the best part out of the water — the open core, the glowing section of a coil, the head, an egg sac, a joint, the tail,
  // a segment — and do not see it at all when nothing shows)
  pre(a,dt){a.epAimY=.8;const f=EP.bf&&EP.bf.id===a.id?EP.bf:null;
    let best=null,bs=-1;for(const p of TMV.parts){const s=p.k==='seg'&&p.i===TMV.coil?5.5:TM_AIM[p.k]||1;if(s>bs){bs=s;best=p}}a.epAimP=best?(a.epAimP0||(a.epAimP0={x:0,y:0,z:0})):null;if(best){a.epAimP.x=best.x;a.epAimP.y=best.y;a.epAimP.z=best.z}
    a.tmSub=!best;a.epPri=a.tmSub?3:.35;a.epHide=true;
    a.epRay=a.epRay||((ox,oy,oz,dx,dy,dz,t)=>TMV.ray(ox,oy,oz,dx,dy,dz,t));a.epRayZc='tiamat'},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_tiamat')return;ch.mesh.visible=false;const dt=Math.min(.05,G.t-(this.at||G.t)||.016);this.at=G.t;TMV.update(a,dt)},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI(),E=MAP.ez;
    const shake=(x,z,r,k)=>{if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<r)FX.shake=Math.max(FX.shake,k*(1-d/r))}};
    const splash=(x,y,z,n,s)=>{for(let k=0;k<n;k++){const g=Math.random()*TAU,v=rr(1,s);FX.spawn({x:x+Math.cos(g)*rr(0,1.5),y:y+.1,z:z+Math.sin(g)*rr(0,1.5),vx:Math.cos(g)*v,vy:rr(3,9),vz:Math.sin(g)*v,life:rr(.6,1.2),s0:.18,s1:.5,r:.7,g:.82,b:.86,a:.7,f:2,grav:9,drag:.6})}};
    switch(m.k){
    case 'roar':if(a){const h=a.head;AU.at('tmroar',h.x,h.y,h.z,{vol:1,range:140,rate:m.c?.85:1});shake(h.x,h.z,26,.6)}break;
    case 'w':if(a)AU.at('tmclick',a.c.x,a.c.y+1,a.c.z,{vol:1,range:80,rate:.8});break;
    case 'ew':{const x=m.x/100,y=m.y/100,z=m.z/100,d=m.d/100;AU.at('tmclick',x,y+.5,z,{vol:1,range:50,rate:.7});AU.at('bhole',x,y,z,{vol:.5,range:40,rate:.5});
      const t0=G.t;const bub=()=>{if(G.t-t0>d||!EP.on)return;for(let k=0;k<6;k++)FX.spawn({x:x+rr(-3.4,3.4),y:y+.05,z:z+rr(-3.4,3.4),vy:rr(.5,1.6),life:rr(.3,.6),s0:.12,s1:.3,r:.7,g:.85,b:.85,a:.6,f:5});SCEN.later(.08,bub)};bub();shake(x,z,12,.25);break}
    case 'eu':{const x=m.x/100,y=m.y/100,z=m.z/100;splash(x,y,z,60,7);AU.at('tmsplash',x,y+1,z,{vol:1,range:90});AU.at('tmroar',x,y+2,z,{vol:.8,range:90,rate:1.15});shake(x,z,16,.8);
      for(let k=0;k<20;k++)FX.spawn({x:x+rr(-1,1),y:y+.3,z:z+rr(-1,1),vx:rr(-5,5),vy:rr(2,7),vz:rr(-5,5),life:rr(.5,1),s0:.1,s1:.07,r:.3,g:.32,b:.3,f:7,grav:13,col:.3});break}
    case 'dv':{const x=m.x/100,y=m.y/100,z=m.z/100;splash(x,y,z,36,5);AU.at('tmsplash',x,y+1,z,{vol:.8,range:70,rate:.85});break}
    case 'tl':if(NET.cli||!NET.host||true){TMT.add(m.x/100,m.y/100,m.z/100,m.yaw/1000,m.w/100,m.id);AU.at('tmclick',m.x/100,m.y/100+1,m.z/100,{vol:1,range:60,rate:1.2})}break;
    case 'ven':{if(P&&P.id===m.i)P.tmVen=3;break}
    case 'bch':if(a){const h=a.head;SCEN.slamFx(h.x,h.y-.6,h.z);AU.at('hamhit',h.x,h.y,h.z,{vol:1,range:80,rate:.45});splash(h.x,1.5,h.z,30,5);shake(h.x,h.z,18,.9);HUD.note(L?'It is stuck on the dais — the head and the sacs!':'단상에 걸렸다 — 머리와 알주머니!',2.4)}break;
    case 'co':if(a){AU.at('tmclick',a.c.x,a.c.y+3,a.c.z,{vol:1,range:90,rate:.6});AU.at('tmroar',a.c.x,a.c.y+3,a.c.z,{vol:.7,range:90,rate:1.2})}break;
    case 'cs':if(a)AU.at('kroll',a.c.x,a.c.y+2,a.c.z,{vol:1,range:60,rate:.7});break;
    case 'cg':TMV.coil=m.g;break;
    case 'cob':if(a){AU.at('tmcrack',a.c.x,a.c.y+2,a.c.z,{vol:1,range:70});HUD.note(L?'It let go!':'풀었다!',1.6)}break;
    case 'bri':if(a){AU.at('hiss',a.c.x,a.c.y+3,a.c.z,{vol:1,range:70,rate:.5});HUD.note(L?'It is breathing in — get away, or ready the vent fans!':'숨을 들이마신다 — 피하거나 환풍기를!',2.2)}break;
    case 'bro':{const x=m.x/100,y=m.y/100,z=m.z/100;if(a){const h=a.head;for(let k=0;k<50;k++){const f=Math.random();FX.spawn({x:lerp(h.x,x,f)+rr(-1,1),y:lerp(h.y,y+1,f)+rr(-1,1),z:lerp(h.z,z,f)+rr(-1,1),vx:(x-h.x)*.4,vy:rr(-.5,.5),vz:(z-h.z)*.4,life:rr(.6,1.2),s0:.4,s1:1.6,r:.45,g:.7,b:.35,a:.5,f:2,drag:1})}AU.at('salgust',h.x,h.y,h.z,{vol:1,range:80,rate:.55})}break}
    case 'str':if(a){if(m.o){AU.at('tmroar',a.c.x,a.c.y+1,a.c.z,{vol:.8,range:90,rate:1.3});HUD.note(L?'Stranded — pour it on!':'바닥에 걸렸다 — 몰아쳐!',2.2)}else AU.at('tmsplash',a.c.x,a.c.y+1,a.c.z,{vol:.7,range:60})}break;
    case 'dn':if(a){AU.at('bodyfall',a.c.x,a.c.y,a.c.z,{vol:1,range:70,rate:.4});AU.at('tmroar',a.c.x,a.c.y+1,a.c.z,{vol:.7,range:90,rate:.75});HUD.note(L?'It is down — the core is open!':'쓰러졌다 — 코어가 열렸다!',2.4)}break;
    case 'up':if(a)AU.at('tmclick',a.c.x,a.c.y+1,a.c.z,{vol:1,range:60,rate:.9});break;
    case 'sac':{const x=m.x/100,y=m.y/100,z=m.z/100;AU.at('tmpop',x,y,z,{vol:1,range:60});for(let k=0;k<40;k++)FX.spawn({x,y,z,vx:rr(-4,4),vy:rr(1,6),vz:rr(-4,4),life:rr(.5,1),s0:.1,s1:.05,r:.75,g:.85,b:.35,f:0,grav:11});HUD.announce(L?'EGG SAC BURST!':'알주머니 파괴!','h',1.8);break}
    case 'cut':{if(NET.cli||true)TMV.drop(m.n);if(a)AU.at('tmcrack',a.c.x,a.c.y+1,a.c.z,{vol:1,range:90});HUD.announce(L?'A SECTION IS CUT OFF!':'마디가 끊어졌다!','h',2);break}
    case 'ph':HUD.announce(m.n===2?(L?'TIAMAT BREAKS THE SLUICE — THE HALL FLOODS':'티아마트가 수문을 부순다 — 홀이 잠긴다'):(L?'TIAMAT GOES FOR THE SHAFT':'티아마트가 수직갱으로 간다'),'z',3);AU.play('stingZ',{vol:.7});if(a)AU.at('tmroar',a.c.x,a.c.y+1,a.c.z,{vol:1,range:150,rate:.8});break;
    case 'smash':{const p=m.g==='gW'?[-32,1.8,0]:[32,1.8,0];AU.at('explode',p[0],p[1],p[2],{vol:1,range:120,occ:false,rate:.6});AU.at('imp_metal',p[0],p[1],p[2],{vol:1,range:90,rate:.4});shake(p[0],p[2],30,.9);
      for(let k=0;k<40;k++)FX.spawn({x:p[0],y:p[1]+rr(-1,1.5),z:p[2]+rr(-2.5,2.5),vx:rr(-6,6),vy:rr(1,6),vz:rr(-6,6),life:rr(.6,1.2),s0:.1,s1:.08,r:.35,g:.4,b:.45,f:7,grav:13,col:.3});break}
    case 'gush':{AU.play('tmgush',{vol:1});AU.at('tmgush',-32,1.5,0,{vol:1,range:120,rate:.8});E5W.gushT=12;break}
    case 'fz':if(a){const h=a.head;for(let i=0;i<24;i++)FX.spawn({x:h.x+rr(-1.5,1.5),y:h.y+rr(-1,1),z:h.z+rr(-1.5,1.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1})}break;
    case 'shk':{const P0=G.player;if(P0&&Math.hypot(P0.c.x-E5D.cx,P0.c.z-E5D.cz)<16){FX.shake=Math.max(FX.shake,.5);AU.play('thunder',{vol:.5,rate:1.6})}AU.at('imp_conc',E5D.cx,20,E5D.cz,{vol:1,range:80,rate:.4});break}
    case 'top':{const x=m.x/100,y=m.y/100,z=m.z/100;AU.at('explode',x,y,z,{vol:1,range:200,occ:false,rate:.5});for(let k=0;k<50;k++)FX.spawn({x:x+rr(-3,3),y,z:z+rr(-3,3),vx:rr(-6,6),vy:rr(-4,6),vz:rr(-6,6),life:rr(.8,1.6),s0:.14,s1:.1,r:.35,g:.36,b:.38,f:7,grav:12,col:.3});
      HUD.announce(L?'TIAMAT REACHED THE SURFACE':'티아마트가 지상에 닿았다','z',3);break}
    case 'enr':HUD.announce(L?'TIAMAT IS ENRAGED':'티아마트 광폭화','z',2.5);break}}};

// ---------- the drowned zombie: it climbs out of the water and holds an ankle (half speed, 6 a second) until it is shot ----------
EPZ.drowned={init(a){a.dwG=null;a.dwCD=rr(1,3);if(!NET.cli)for(let k=0;k<14;k++)FX.spawn({x:a.c.x+rr(-.6,.6),y:a.c.y+.2,z:a.c.z+rr(-.6,.6),vx:rr(-1.5,1.5),vy:rr(2,5),vz:rr(-1.5,1.5),life:rr(.4,.8),s0:.12,s1:.3,r:.7,g:.82,b:.86,a:.6,f:2,grav:9})},
  tick(a,dt){a.dwCD=(a.dwCD||0)-dt;const g=a.dwG;
    if(g){a.dwT-=dt;const d=Math.hypot(g.c.x-a.c.x,g.c.z-a.c.z);if(!g.alive||a.dwT<=0||d>2.6||a.frozen>0){this.free(a);return}a.dwTk=(a.dwTk||0)-dt;if(a.dwTk<=0){a.dwTk=.25;hurtHuman(g,EPD(6*.25),a,{})}return}
    if(a.dwCD>0)return;for(const h of SCEN.H){if(!h.alive||h.ankleBy&&h.ankleBy.alive||Math.abs(h.c.y-a.c.y)>.9)continue;if(Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<1.45){a.dwG=h;a.dwT=4;h.ankleBy=a;h.ankleT=4;AU.at('fdgrab',h.c.x,h.c.y+.3,h.c.z,{vol:.8,range:30});
        if(NET.host)netEv('etm',{k:'ank',i:h.id,t:40});if(h.isPlayer)HUD.note(LI()?'Something has your ankle — shoot it!':'발목을 잡혔다 — 쏴서 떼어내!',2);if(!EP.ankSaid){EP.ankSaid=1;EP.say('ankle')}break}}},
  free(a){const g=a.dwG;a.dwG=null;a.dwCD=3;if(g){g.ankleBy=null;g.ankleT=0;if(NET.host)netEv('etm',{k:'ank',i:g.id,t:0})}},
  post(a){if(a.dwG){const g=a.dwG;a.cmd.f=a.cmd.s=0;a.cmd.jump=false;a.cmd.duck=true;a.yaw=Math.atan2(-(g.c.x-a.c.x),-(g.c.z-a.c.z))}},
  claw(a){return !!a.dwG},after(t){if(t.dwG)this.free(t)},die(t){if(t.dwG)this.free(t)},gone(a){if(a.dwG)this.free(a)}};
// ---------- the hazmat researcher: its back tank bursts into a cloud of spores when it falls ----------
EPZ.hazmat={die(t){if(NET.cli)return;E5X.sporeAdd(t.c.x,t.c.y,t.c.z,3.6,6,5);if(!EP.hzSaid){EP.hzSaid=1;EP.say('hzBurst')}}};
// ---------- the little centipedes (a severed part of TIAMAT): fast, low, a venom bite ----------
EPZ.centi={hp:()=>{const b=EP.bossA();return Math.round(((b&&b.zc==='tiamat'?b.maxHp:TIAMAT.hpFor())*.03))},
  init(a){a.ctr=[]},pre(a){a.epAimY=.45;a.epPri=.7},
  claw(a,t){return false},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_centi')return;ch.mesh.visible=false;let V=ch.cV;if(!V){V=ch.cV={grp:new THREE.Group(),segs:[],tr:[]};const m=matGun();V.mat=m;
      const hd=new THREE.Mesh(gunGeo('tmMiniHead'),m);hd.frustumCulled=false;V.head=new THREE.Group();V.head.add(hd);V.head.scale.setScalar(.45);V.grp.add(V.head);
      for(let k=0;k<5;k++){const q=new THREE.Group();const b=new THREE.Mesh(gunGeo(k===4?'tmTail':'tmSeg'),m);b.frustumCulled=false;q.add(b);for(const sd of [-1,1]){const l=new THREE.Mesh(gunGeo(sd>0?'tmLegR':'tmLegL'),m);l.frustumCulled=false;l.position.set(sd*.98,-.08,0);l.rotation.z=sd*.35;q.add(l)}q.scale.setScalar(.42);V.grp.add(q);V.segs.push(q)}R.scene.add(V.grp)}
    const vis=ch.grp.visible&&a.alive;V.grp.visible=vis;if(!vis){V.tr.length=0;return}
    const T=V.tr,x=a.c.x,y=a.c.y+.32,z=a.c.z,Lp=T[T.length-1];if(!Lp||Math.hypot(x-Lp.x,z-Lp.z)>4){T.length=0;for(let i=12;i>=1;i--)T.push({x:x+Math.sin(a.yaw)*i*.25,y,z:z+Math.cos(a.yaw)*i*.25});T.push({x,y,z})}else if(Math.hypot(x-Lp.x,y-Lp.y,z-Lp.z)>.12){T.push({x,y,z});if(T.length>60)T.shift()}
    V.head.position.set(x,y+.05,z);V.head.rotation.set(0,a.yaw,0);sampleProbe(x,y,z,V.mat.uniforms.uProbe.value);V.mat.uniforms.uEmisA.value=1.3+.4*Math.sin(G.t*5);
    const wig=G.t*14;for(let k=0;k<5;k++){const s=.95+k*1.0;let acc=0,i=T.length-1,px=x,py=y,pz=z,qx=x,qz=z;while(i>0){const p=T[i],q=T[i-1],d=Math.hypot(q.x-p.x,q.z-p.z);if(acc+d>=s){const f=(s-acc)/(d||1);px=p.x+(q.x-p.x)*f;py=p.y+(q.y-p.y)*f;pz=p.z+(q.z-p.z)*f;qx=p.x;qz=p.z;break}acc+=d;i--;px=q.x;py=q.y;pz=q.z}
      const S=V.segs[k];S.position.set(px,py,pz);S.rotation.set(0,Math.atan2(-(qx-px),-(qz-pz))+Math.sin(wig-k)*.18,0)}
    if(a.frozen>0)V.mat.uniforms.uTint.value.set(.55,.8,1,.5);else V.mat.uniforms.uTint.value.set(0,0,0,0)},
  gone(a){const ch=a.ch;if(ch&&ch.cV)ch.cV.grp.visible=false}};
EPZ.tiamat={hp:()=>TIAMAT.hpFor(),init:a=>TIAMAT.init(a,TIAMAT.encNext),ai:(a,dt)=>TIAMAT.ai(a,dt),
  hit:(t,dmg,src,o)=>t.tm?TIAMAT.hit(t,dmg,src,o):dmg,after:(t,r,src)=>TIAMAT.after(t,r,src),
  // (the shooter's own page) the carapace sparks; the sacs and joints spurt
  spark(t,o){if(!o||o.x==null||AU.throttle('tmsp',70))return;const p=TMV.partAt(o.x,o.y,o.z);if(!p)return;
    if(p.k==='seg'||p.k==='tail')for(let i=0;i<5;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.12,.25),s0:.05,s1:.02,r:.6,g:1,b:.7,f:0,grav:9,add:1});
    else if(p.k==='sac'||p.k==='joint'||p.k==='core')for(let i=0;i<6;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2,2),vy:rr(0,3),vz:rr(-2,2),life:rr(.3,.6),s0:.08,s1:.04,r:.7,g:.9,b:.4,f:0,grav:9})},
  claw(){return true},pre:(a,dt)=>TIAMAT.pre(a,dt),attach:a=>TIAMAT.attach(a),
  die(t){if(!NET.cli&&t.tm&&!t.tm.enc){EP.say('tDie')}TMV.dead=null},
  gone(a){if(a.tm)a.tm.mode='gone'}};
Object.assign(ZGAIT,{drowned:{stride:.85,knee:1.1,runK:.8,bob:1.3,twist:1.3,sway:1.5},hazmat:{stride:.8,knee:.8,runK:.75,bob:.8,twist:.7,sway:.9},centi:{stride:1,knee:1,runK:1,bob:.5,twist:.5,sway:.5}});
Object.assign(JAW0,{drowned:.18,hazmat:.06,tiamat:0,centi:0});

// ---------- the cards' portraits: TIAMAT's head with the researcher sunk into it; a little centipede ----------
{const pt=portrait;portrait=function(key,s){if(key!=='z_tiamat'&&key!=='z_centi')return pt(key,s);s=s||70;const k=key+':'+s;if(PORTRAITS[k])return PORTRAITS[k];
  const W=Math.ceil(1.5*s),H=Math.ceil(1.9*s),[cv,x]=mkCanvas(W,H),cx=W/2,u=s/70;x.lineCap='round';
  if(key==='z_centi'){for(let i=4;i>=0;i--){const y=1.55*s-i*.18*s,w=(.3-i*.02)*s;x.strokeStyle='#2a1e14';x.lineWidth=3*u;for(const sd of [-1,1]){x.beginPath();x.moveTo(cx+sd*w*.8,y);x.lineTo(cx+sd*(w+.18*s),y+.08*s);x.stroke()}
      const g=x.createRadialGradient(cx,y-.03*s,.02*s,cx,y,w);g.addColorStop(0,'#2e5a4a');g.addColorStop(1,'#0a1412');x.fillStyle=g;x.beginPath();x.ellipse(cx,y,w,.09*s,0,0,TAU);x.fill()}
    x.fillStyle='#142624';x.beginPath();x.ellipse(cx,.72*s,.26*s,.22*s,0,0,TAU);x.fill();for(const sd of [-1,1]){x.fillStyle='#c8ff9a';x.beginPath();x.arc(cx+sd*.1*s,.68*s,.035*s,0,TAU);x.fill()}
    return PORTRAITS[k]=cv.toDataURL()}
  // legs fanned out behind, the head shield, the fangs, the glowing core between them, the researcher rising out of the head
  for(let i=0;i<7;i++){const y=1.25*s+i*.08*s;x.strokeStyle='#1a1410';x.lineWidth=(5-i*.4)*u;for(const sd of [-1,1]){x.beginPath();x.moveTo(cx+sd*.3*s,y);x.lineTo(cx+sd*(.62-i*.02)*s,y-.1*s);x.lineTo(cx+sd*(.66-i*.02)*s,y+.12*s);x.stroke()}}
  let g=x.createRadialGradient(cx-.1*s,1.15*s,.05*s,cx,1.25*s,.62*s);g.addColorStop(0,'#2e5a4a');g.addColorStop(.5,'#132624');g.addColorStop(1,'#050a0a');x.fillStyle=g;x.beginPath();x.ellipse(cx,1.3*s,.58*s,.38*s,0,0,TAU);x.fill();
  const cg=x.createRadialGradient(cx,1.55*s,0,cx,1.55*s,.2*s);cg.addColorStop(0,'#ffffff');cg.addColorStop(.35,'#d8a0ff');cg.addColorStop(1,'rgba(120,60,200,0)');x.fillStyle=cg;x.beginPath();x.arc(cx,1.55*s,.2*s,0,TAU);x.fill();
  for(const sd of [-1,1]){x.strokeStyle='#0e1a18';x.lineWidth=8*u;x.beginPath();x.moveTo(cx+sd*.28*s,1.42*s);x.quadraticCurveTo(cx+sd*.3*s,1.7*s,cx+sd*.06*s,1.78*s);x.stroke();x.strokeStyle='#9aff9a';x.lineWidth=2*u;x.beginPath();x.moveTo(cx+sd*.12*s,1.76*s);x.lineTo(cx+sd*.05*s,1.79*s);x.stroke()}
  for(const [dx,dy,r] of [[.3,1.22,.05],[.38,1.3,.035],[-.3,1.22,.05],[-.38,1.3,.035]]){x.fillStyle='#e8c0ff';x.beginPath();x.arc(cx+dx*s,dy*s,r*s,0,TAU);x.fill()}
  for(const sd of [-1,1]){x.strokeStyle='#4a4028';x.lineWidth=2.5*u;x.beginPath();x.moveTo(cx+sd*.2*s,1.05*s);x.quadraticCurveTo(cx+sd*.5*s,.55*s,cx+sd*.62*s,.2*s);x.stroke()}
  x.fillStyle='#b8b8ae';x.beginPath();x.moveTo(cx-.17*s,1.12*s);x.lineTo(cx-.15*s,.72*s);x.lineTo(cx+.15*s,.72*s);x.lineTo(cx+.17*s,1.12*s);x.closePath();x.fill();
  x.fillStyle='#7a6a70';x.beginPath();x.ellipse(cx,.6*s,.1*s,.12*s,.25,0,TAU);x.fill();x.fillStyle='#141210';x.beginPath();x.ellipse(cx+.02*s,.52*s,.11*s,.07*s,.25,0,TAU);x.fill();
  x.fillStyle='#9aff9a';x.beginPath();x.arc(cx-.03*s,.61*s,.015*s,0,TAU);x.arc(cx+.04*s,.62*s,.015*s,0,TAU);x.fill();
  x.strokeStyle='#5a1010';x.lineWidth=1.5*u;x.beginPath();x.moveTo(cx-.1*s,.8*s);x.lineTo(cx-.12*s,1.05*s);x.stroke();
  return PORTRAITS[k]=cv.toDataURL()}}

// ---------- chapter 5 「티아마트」: the Saebyeok deep tunnel ----------
//   1 the control yard (on the surface, in the storm) — three waves; then the cage lift 33 m down
//   2 the inflow tunnel — work the three hand pumps (10 s each); something huge passes along the channel and rises once
//   3 the surge tank — flooded: turn the two drain wheels (6 s each) while TIAMAT lurks in the water; drained, it is stranded and leaves
//   4 the boss fight — the tank (phases 1–2), then shaft No. 3 (phase 3). A wipe replays its phase
//   5 the escape — the shaft caves in and fills: 75 s up the ramp to the surface
CHAP[5]={id:5,k:'tiamat',map:'ep5',code:'Q7-Ω',n:['티아마트','TIAMAT'],t:['좀비 시나리오: 티아마트','Zombie Scenario: TIAMAT'],
  file:[['Q7 수석연구원과 원종이 합쳐진 거대 지네 군체 Q7-Ω. 물속에선 총알이 안 들어간다','Q7-Ω: the chief researcher fused with the origin strain — a giant centipede colony. Bullets cannot reach it under the water'],
    ['솟구칠 때·좌초됐을 때·코어가 열릴 때를 노려라 · 수문으로 물을 빼고, 수직갱에선 지상에 닿기 전에','Hit it when it rises, when it is stranded, when its core opens · drain the hall, and stop it before it reaches the surface']],
  cards:{place:['새벽천 대심도 방수로','SAEBYEOK DEEP TUNNEL'],who:['Q7 연구팀 수석연구원 · 원종','Q7 CHIEF RESEARCHER · THE ORIGIN STRAIN'],line:['괴물들의 어머니 — 지상의 강에 닿으면 물길 전체가 오염된다','The mother of monsters — if it reaches the river, every waterway is infected']},
  boss:TIAMAT,voice2:['수석연구원','CHIEF RESEARCHER'],voice3:['레가투스','LEGATUS'],
  // gates: the cage doors (top, bottom), the tank's mouth, the inflow sluice, the shaft gate, the yard door
  gates:['gLt','gLb','gB','gW','gS','gX'],gateDur:{gLt:1,gLb:1,gB:2.2,gW:.35,gS:.9,gX:1.6},
  pow0:1,powLo:[.7,.35],
  stages:[null,
    {z:'A',k:'waves',n:['관리동 마당','Control yard'],on:['마당을 지켜라','Hold the yard'],prep:18,clr:'s1c',doorN:['승강기','LIFT'],
      wave:w=>[['rager',50],['runner',24],['spitter',w>=2?8:4],['bomber',w>=2?8:0],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['유입 수로','Inflow tunnel'],on:['수동 펌프 가동','Work the hand pumps'],dev:'pumps',say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'p1':'p2',intro:{zc:'drowned',say:'drowned',at:5},meet:{at:20,cap:.6},
      mix:[['rager',40],['runner',22],['drowned',24],['larva',8],['spitter',6]]},
    {z:'C',k:'act',n:['조압수조','Surge tank'],on:['배수 수문 핸들 돌리기','Turn the drain wheels'],dev:'wheels',say:'s3',sayRetry:1,clr:'s3c',devSay:()=>'w1n',intro:{zc:'hazmat',say:'hazmat',at:9},meet:{at:7,cap:.55},doorN:['펌프 단상','PUMP DAIS'],
      mix:[['rager',36],['runner',22],['drowned',18],['hazmat',16],['larva',8]]},
    {z:'E',k:'boss',n:['조압수조 · 제3수직구','Surge tank · shaft No. 3'],on:['티아마트를 쓰러뜨려라','Bring TIAMAT down'],say:'s4',go:'b0',prepPt:[0,1.5,0,2.4]},
    {z:'D',k:'escape',n:['탈출','The escape'],on:['탈출 — 지상까지','ESCAPE — up to the surface'],len:75,cap:.9,mix:[['runner',60],['rager',40]]}],
  stageGates(n,kind,bp){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gLb');if(n>=3)m|=b('gB');if(n===4&&kind==='phase'&&bp>=2)m|=b('gW');if(n===4&&kind==='phase'&&bp>=3)m|=b('gS');if(n>=5)m|=b('gW')|b('gS')|b('gX');return m},
  zsp(n,Zn){return n===4&&EP.bossPh>=3?EP.zone('D').zsp:Zn.zsp},
  phaseStart(Zn){return EP.bossPh>=3?EP.zone('D').start:Zn.start},
  setup(){if(typeof KX!=='undefined')KX.build();WATER.reset();E5X.reset()},
  // the water and the sound of each stage: the yard in the storm, the deep tunnel (rain far above), the tank (flooded for stage 3; shallow
  // for the fight, flooded again from phase 2), the shaft
  stageStart(n,kind){const bp=EP.bossPh;WATER.snap('D',.3);if(n===3)WATER.snap('C',1.2);else if(n===4)WATER.snap('C',bp>=2?1.2:.3);else WATER.snap('C',.3);WATER.drainT=0;
    if(n!==4||kind!=='phase')E5X.reset();else{E5X.wheel=[0,0];E5X.wcd=0;E5X.rocks=[];E5X.jets=[]}TMT.clear();
    const E=MAP.env||{};if(AU.setEnv)AU.setEnv(n===1||n===5?E:Object.assign({},E,{under:1,storm:0}));
    if(n===4&&bp>=3&&!NET.cli)EP.later(.5,()=>{for(const p of MAP.ez.landAmmo)EPK.spawn(p.x,p.y,p.z)})},
  stageDone(n){if(n===1)this.liftOpen()},
  // stage 3's two wheels done: the hall drains (TIAMAT stranded), then the shallow water of the fight comes back
  devDone(st,i,left){if(st===3&&left===0&&!NET.cli){WATER.set('C',-2.5,1.5);EP.later(9,()=>{if(EP.st<=4&&EP.bossPh<2)WATER.set('C',.3,.35)})}},
  bossGo(){return []},
  // (everyone standing gets patched up to 70 for the run; the water starts after 3 s)
  escapeStart(){EP.setGates(EP.gm|EP.bit('gX')|EP.bit('gS')|EP.bit('gW'));SCEN.zsp=EP.zone('D').zsp;EP.later(3,()=>{if(EP.st===5)WATER.set('D',31.5,.42)});E5X.cave=true;E5X.caveT=3;if(AU.setEnv)AU.setEnv(MAP.env);
    for(const h of SCEN.H)if(h.alive)h.hp=Math.max(h.hp,70);
    for(const p of MAP.ez.landAmmo)EPK.spawn(p.x,p.y,p.z);if(NET.host)netEv('etm',{k:'esc'})},
  onFinish(win){if(win)EP.t=Math.max(EP.t,15.5)},
  endFx(r){if(r.win)this.ending()},
  // ---------- the cage lift between stage 1 and 2 (the 'move' after stage 1 is the boarding; then a 12 s ride down) ----------
  liftOpen(){EP.setGates(EP.gm|EP.bit('gLt'));EP.radio('lift')},
  inCage(h,y0){const C=MAP.ez.cage;return h.c.x>C.x0-.1&&h.c.x<C.x1+.1&&h.c.z>C.z0-.1&&h.c.z<C.z1+.1&&Math.abs(h.c.y-y0)<1.5},
  hostPh(ph,dt){if(ph==='ride'){EP.t-=dt;G.time=EP.t;if(EP.t<=0)this.rideEnd();return true}
    if(ph==='move'&&EP.st===1){if(humansAlive()===0){EP.fail();return true}EP.t-=dt;G.time=EP.t;let all=true,n=0;for(const h of SCEN.H)if(h.alive){n++;if(!this.inCage(h,33))all=false}if(all&&n||EP.t<=0)this.rideStart();return true}
    return false},
  rideStart(){const C=MAP.ez.cage,tp=[];let i=0;
    for(const h of SCEN.H){if(!h.alive||this.inCage(h,33))continue;const x=C.x0+1+(i%4)*1.3,z=C.z0+1.2+Math.floor(i/4)*1.4;i++;placeAt(h,x,33,z,-Math.PI/2);tp.push([h.id,r2(x),3300,r2(z),r3(-Math.PI/2)])}
    const ids=[];for(const a of SCEN.Z)if(a.alive){EP.despawn(a);ids.push(a.id)}SCEN.closePick(false);
    EP.ph='ride';EP.t=12;G.st='fight';G.time=12;EP.setGates(EP.gm&~EP.bit('gLt'));this.rideBegin();if(NET.host)netEv('e5r',{P:tp,z:ids})},
  rideBegin(){EP.radio('ride');AU.play('blackout',{vol:.55,rate:.6});HUD.announce(LI()?'GOING DOWN — 33 m':'지하 33 m로 하강','w',2.5);this.rideK=0},
  rideEnd(){if(this.rideL){this.rideL.dead=true;this.rideL=null}const arr={};for(const h of SCEN.H){if(!h.alive)continue;arr[h.id]=[h.c.x,h.c.y-33,h.c.z,h.yaw]}EP.stageStart(2,'next',null,arr)},
  rideFx(dt){const P=G.player,C=MAP.ez.cage;this.rideK=(this.rideK||0)+dt;if(P&&P.alive&&this.inCage(P,33))FX.shake=Math.max(FX.shake,.16+.06*Math.sin(G.t*13));
    if(!this.rideL)this.rideL=DL.add(73,35,-44,'#ffe2b0',7,1.4,0);const L0=this.rideL;L0.x=73;L0.z=-44;L0.y=33+4.4-((this.rideK*1.6)%1)*4.6;L0.i=1.1;
    if(Math.floor(this.rideK/2.2)!==Math.floor((this.rideK-dt)/2.2))AU.at('land',73,34,-44,{vol:.45,range:20,rate:.6});void C},
  update(dt){WATER.update(dt);E5X.update(dt);if(typeof KX!=='undefined')KX.update(dt);
    if(E5X.nestOn()){for(let k=0;k<3;k++)if(Math.random()<dt*20){const an=rr(0,TAU),r=rr(3.2,14.6);FX.spawn({x:E5D.cx+Math.cos(an)*r,y:.15,z:E5D.cz+Math.sin(an)*r,vy:rr(.4,1.4),life:rr(.5,1),s0:.1,s1:.35,r:.45,g:1,b:.55,a:.6,f:10,add:1})}
      const P0=G.player;if(P0&&P0.alive&&P0.c.y<.7&&Math.hypot(P0.c.x-E5D.cx,P0.c.z-E5D.cz)<15.3&&!AU.throttle('e5nest',4000))HUD.note(LI()?'The nest is boiling — get up the ramp!':'둥지가 끓는다 — 경사로로 올라가!',2)}
    if(EP.ph==='ride')this.rideFx(dt);else if(this.rideL){this.rideL.dead=true;this.rideL=null}
    if(E5W.gushT>0){E5W.gushT-=dt;if(Math.random()<dt*40)FX.spawn({x:-31.5,y:rr(.3,3),z:rr(-2.6,2.6),vx:rr(5,10),vy:rr(-1,1.5),vz:rr(-1.5,1.5),life:rr(.5,1),s0:.3,s1:1.2,r:.7,g:.82,b:.86,a:.6,f:2,grav:6,drag:.6})}
    // the player held by a drowned one, or in venom: what it feels like
    const P=G.player;if(P&&P.alive){if(P.ankleT>0)P.ankleT=Math.max(0,P.ankleT-dt);if(P.tmVen>0&&NET.cli)P.tmVen=Math.max(0,P.tmVen-dt)}},
  clear(){WATER.reset();WATER.off();E5X.reset();TMT.clear();if(typeof KX!=='undefined')KX.clear();EP.ankSaid=0;EP.hzSaid=0;EP.swSaid=0;if(this.rideL){this.rideL.dead=true;this.rideL=null}},
  // bots: into the cage; out of the shaft by the top door; the rest is TIAMAT's botGoal
  goal(a){const E=MAP.ez;if(EP.st===1&&EP.ph==='move'){const C=E.cage,i=SCEN.H.indexOf(a);return [C.x0+1.2+(i%3)*1.6,33,C.z0+1.2+Math.floor(i/3)%3*1.6,.4]}if(EP.ph==='ride')return [73,33,-44,1];
    if(EP.S().k==='escape')return [53,33,-18.6,1.2]},
  botPost(a){if(WATER.depth(a)>.75&&a.cmd)a.cmd.jump=false},
  objText(L,ts){if(EP.st===1&&EP.ph==='move')return [(L?'Into the lift!':'승강기 탑승!')+` · ${ts}${L?'s':'초'}`,EP.t/40];if(EP.ph==='ride')return [L?'Going down 33 m…':'지하 33 m로 하강 중…',1-EP.t/12];
    if(EP.st===4&&EP.bossPh>=3&&EP.ph==='run')return [L?'Stop TIAMAT before it reaches the surface':'티아마트가 지상에 닿기 전에 쓰러뜨려라'];
    if(EP.st===4&&EP.bossPh===2&&EP.ph==='run'&&E5X.wcd<=0&&WATER.drainT<=0)return [(L?'Bring TIAMAT down · the drain wheels are ready':'티아마트를 쓰러뜨려라 · 배수 수문 준비됨')];return null},
  deadText(L){if(EP.ph==='ride')return L?'Down — back on your feet at the bottom of the shaft · spectating':'쓰러짐 — 승강기가 바닥에 닿으면 다시 일어나요 · 관전 중';return null},
  grabText:['붙잡혔다 — 동료가 쏴서 떼어 줘야 해요','PINNED — a teammate has to shoot it off'],
  // the season's end (every page, from endFx): RT-1's leader on the radio, then the season card
  ending(){EP.later(2.8,()=>EP.radio('end0'));EP.later(5.2,()=>EP.radio('end1'));EP.later(8,()=>EP.radio('end2'));EP.later(9.8,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'ZOMBIE SCENARIO · SEASON 1':'좀비 시나리오 · 시즌 1'}</small><h1>${L?'SEASON 1 COMPLETE':'시즌 1 완결'}</h1><p>${L?'Q-7 was only the beginning.':'격리구역 Q-7은 시작에 불과했다.'}</p><b>${L?'NEXT — LEGATUS · RT1-01':'다음 이야기 — 레가투스 · RT1-01'}</b></div></div>`;
    el.className='on s1';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},6000)},
  radio:{
    start:['2차 회수팀, 새벽천 대심도 방수로 제3수직구 도착. 연구 일지에 따르면 수석연구원이 원종 샘플을 들고 여기로 내려갔다.','RT-2, you are at shaft No. 3 of the Saebyeok deep tunnel. The logs say the chief researcher came down here with the origin-strain sample.',0],
    w1:['폭우에 배수로가 넘친다 — 사방에서 몰려온다!','The drains are overflowing in this rain — they are coming from everywhere!',1],
    s1c:['마당 정리 완료. 수직구 승강기로 지하 33 m까지 내려간다.','The yard is clear. We take the shaft lift 33 metres down.',0],
    lift:['승강기 문 열렸다. 전원 타면 바로 내려간다.','The lift is open. We go down as soon as everyone is in.',0],
    ride:['하강 중… 이 아래 어딘가에 둥지가 있다. 무전이 끊길 수 있다.','Going down… the nest is somewhere below. The radio may cut out.',0],
    s2:['유입 수로다. 수위가 너무 높아 — 수동 펌프 세 개를 돌려서 물을 빼. 하나에 10초.','The inflow tunnel. The water is too high — work the three hand pumps. Ten seconds each.',0],
    drowned:['물속에서 기어 나온다… 익사체다! 발목 잡히면 그놈을 쏴서 떼어내!','Something is climbing out of the water… drowned ones! If one grabs your ankle, shoot it off!',1],
    ankle:['발목 잡혔어! 누가 저것 좀 쏴 줘!','It has my ankle! Somebody shoot it!',1],
    p1:['펌프 하나 가동. 다음!','One pump running. Next!',0],p2:['마지막 펌프!','Last pump!',0],
    enc5a:['수로에 뭔가 큰 게 있어… 물이 움직인다!','There is something big in the channel… the water is moving!',1],
    enc5b:['…지네? 저게 다 하나라고?','…a centipede? All of that is one thing?',1],
    enc5c:['Q7-Ω… 티아마트. 수석연구원이다. 원종을 자기 몸에 넣었어.','Q7-Ω… TIAMAT. The chief researcher. She put the origin strain into her own body.',0],
    s2c:['수위가 내려간다. 조압수조로 가는 수문을 연다.','The level is dropping. Opening the sluice into the surge tank.',0],
    s3:['조압수조가 잠겨 있다. 북쪽과 남쪽 통로의 배수 수문 핸들을 돌려 — 하나에 6초.','The surge tank is flooded. Turn the drain wheels on the north and south walkways — six seconds each.',0],
    hazmat:['방호복 입은 연구원들이다. 쓰러지면 등의 가스통이 터진다 — 포자 조심!','Researchers in hazmat suits. Their tanks burst when they go down — mind the spores!',1],
    hzBurst:['가스통이 터졌다 — 포자 안에 있지 마!','The tank burst — get out of the spores!',1],
    swarm:['유충 떼다! 불이나 폭발로 날려 버려!','A swarm of grubs! Burn it or blow it away!',1],
    enc:['물속에 있다 — 거기선 총알이 안 들어가! 솟구칠 때 쏴!','It is in the water — bullets cannot reach it there! Shoot it when it comes up!',1],
    w1n:['핸들 하나 끝. 반대쪽 핸들!','One wheel done. The other one!',0],
    s3c:['물이 빠진다! 놈이 바닥에 걸렸어—','The water is draining! It is stranded—',1],
    tRet:['…물러났다. 펌프 단상으로 모여. 놈이 다시 온다.','…it has gone. Regroup on the pump dais. It will be back.',0],
    s4:['티아마트는 물속에선 무적이다. 솟구칠 때, 좌초됐을 때, 코어가 열릴 때를 노려. 등의 알주머니와 빛나는 관절도 약점이다.','TIAMAT cannot be hurt under the water. Hit it when it rises, when it is stranded, when the core opens. The egg sacs and the glowing joints are weak too.',0],
    b0:['물이 끓는다—온다!','The water is boiling—here it comes!',1],
    tBch:['단상에 걸렸다! 머리랑 알주머니!','It is stuck on the dais! The head and the egg sacs!',1],
    tSac:['알주머니 터뜨렸다!','Egg sac burst!',1],tSacAll:['알주머니 전부 터졌다—쓰러졌어! 몰아쳐!','All the egg sacs are gone—it is down! Pour it on!',1],
    tJoint:['마디가 끊어졌다! 떨어진 놈들 조심!','A section came off! Watch the pieces!',1],
    tP2:['수문을 부쉈다—홀에 물이 찬다! 발판 위로 올라가!','It smashed the sluice—the hall is flooding! Up onto the walkways!',0],
    tCoil:['기둥을 휘감는다—그 발판에서 내려와! 빛나는 마디를 쏴!','It is coiling round a pillar—get off that platform! Shoot the glowing section!',1],
    tCoilB:['풀었다!','It let go!',1],
    tBreath:['포자 숨결! 환풍기 스위치로 날려 버려!','Spore breath! Blow it away with the vent fans!',1],
    tStrNow:['물이 빠진다—놈이 바닥에 걸렸다! 지금!','The hall is draining—it is stranded! Now!',1],
    tSum:['익사체들을 부른다!','It is calling the drowned!',1],
    tDown:['쓰러졌다! 코어를 쏴!','It is down! Shoot the core!',1],
    tP3:['수직갱으로 간다! 지상에 닿으면 끝이야 — 따라가!','It is heading for the shaft! If it reaches the surface it is over — after it!',0],
    tNest:['바닥 둥지가 끓어오른다 — 경사로로 올라가서 쫓아가!','The nest on the floor is boiling — get up the ramp and after it!',1],
    tRock:['낙석!','Rocks!',1],tJet:['물기둥—벽에 붙어!','Water jet—hug the wall!',1],
    tLast:['코어가 완전히 열렸다! 전부 쏟아부어!','The core is wide open! Everything you have!',1],
    tTop:['지상에 닿았다—!','It reached the surface—!',1],
    tEnr:['시간이 없어—놈이 더 빨라진다!','No time—it is getting faster!',0],
    tDie:['…아이들아… 강으로…','…my children… to the river…',2],
    dead:['코어 파괴! 티아마트 무력화! 수직갱이 무너지고 물이 찬다 — 75초 안에 지상으로!','The core is gone! TIAMAT is down! The shaft is caving in and filling — get to the surface in 75 seconds!',0],
    esc:['2차 회수팀 지상 탈출 확인. …잘했다.','RT-2 is out on the surface. …Well done.',0],
    late:['늦었지만 살아 나왔군. 방수로는 봉쇄한다.','Late, but alive. We are sealing the tunnel.',0],
    clear:['티아마트 반응 소멸. 2차 회수팀, 수고했다.','TIAMAT\'s signal is gone. Good work, RT-2.',0],
    end0:['…잠깐. 처음 듣는 주파수다. 1차 회수팀 암호…','…Wait. A frequency we have not heard. RT-1\'s code…',0],
    end1:['…여기는 레가투스, 1차 회수팀 RT1-01. 이 무전이 들린다면 —','…This is LEGATUS, RT-1, RT1-01. If anyone can hear this —',3],
    end2:['Q-7은 시작에 불과했다. 우리는 아직 살아 있다. 북쪽으로 와라.','Q-7 was only the beginning. We are still alive. Come north.',3]}};

// ---------- hooks ----------
(function(){
  // TIAMAT's body is placed by its brain: no physics for it
  const ap=actorPhysics;actorPhysics=function(a,dt){if(a.zc==='tiamat'&&a.tm&&EP.on){a.c.onGround=true;return}return ap(a,dt)};
  // the water slows whoever wades in it and stops their jumps; a drowned one's grip halves a human's speed
  const ms=maxSpeed;maxSpeed=function(a){let s=ms(a);if(!(EP.on&&EP.id===5)||!a.alive)return s;const d=WATER.depth(a);
    if(a.team===TH){if(d>.75)s*=.6;else if(d>.3)s*=.85;if(a.ankleT>0)s*=.5}else if(a.zc!=='drowned'&&a.zc!=='tiamat'&&d>.75)s*=.75;return s};
  // (and out of their depth humans float, head out: the tank and the tunnel; the shaft pulls them under. A swimmer counts as on the
  // ground for the step-up, so it climbs out where the edge is low and up the steps)
  const ap2=actorPhysics;actorPhysics=function(a,dt){if(EP.on&&EP.id===5&&a.alive&&a.cmd){const c=a.c,d=WATER.surf(c.x,c.z,c.y)-c.y;if(d>.75)a.cmd.jump=false;
      if(a.team===TH&&d>1.3&&WATER.k!=='D'){c.vy=clamp((d-1.42)*4,-2.5,3)+GRAV*dt;c.onGround=true;a.swim=1}else a.swim=0}
    return ap2(a,dt)};
  // a grenade under the surface sinks and fizzles; a blast near TIAMAT's bare body reaches it even far from its head
  const dt0=detonate;detonate=function(n){if(EP.on&&EP.id===5&&(n.kind==='he'||n.kind==='gl')&&WATER.surf(n.x,n.z,n.y)>n.y+.3){const s=WATER.surf(n.x,n.z,n.y);
      for(let k=0;k<24;k++)FX.spawn({x:n.x+rr(-.6,.6),y:s+.05,z:n.z+rr(-.6,.6),vx:rr(-1,1),vy:rr(2,6),vz:rr(-1,1),life:rr(.5,.9),s0:.15,s1:.5,r:.7,g:.82,b:.86,a:.6,f:2,grav:9});AU.at('tmsplash',n.x,s,n.z,{vol:.6,range:40,rate:1.6});
      if(n.owner&&n.owner.isPlayer&&!AU.throttle('e5sink',4000))HUD.note(LI()?'The grenade sank — no use under the water':'수류탄이 가라앉았다 — 물속에선 소용없어요',2);return}
    dt0(n);if(!(EP.on&&EP.id===5)||n.ghost||!n.owner||n.owner.team!==TH||NET.cli||(n.kind!=='he'&&n.kind!=='gl'))return;const b=EP.bossA();if(!b||!b.tm)return;
    const hd=Math.hypot(b.c.x-n.x,b.c.y+1-n.y,b.c.z-n.z);if(hd<=(n.kind==='gl'?4.8:7))return;let best=null,bd=1e9;for(const p of TMV.parts){const d=Math.hypot(p.x-n.x,p.y-n.y,p.z-n.z)-p.r;if(d<bd){bd=d;best=p}}
    const R0=n.kind==='gl'?3.5:5;if(!best||bd>R0)return;const f=1-Math.max(0,bd)/R0;damageActor(b,(n.kind==='gl'?380:700)*f+100,n.owner,{w:n.kind==='gl'?'gl40':'he',he:1,dir:[0,0,0],kb:0,stag:0,x:best.x,y:best.y,z:best.z})};
  // bots do not see what is under the water
  const eh=epHid;epHid=function(a,z,d){if(z.zc==='tiamat'&&z.tmSub)return true;return eh(a,z,d)};// (tmSub: nothing of it above the water)
  Object.assign(CLIH,{
    etm(L,m){if(['wh','fan','dr','rk','jw','sp','spx'].includes(m.k))E5X.fxApply(m);else if(m.k==='ank'){const h=byIdAny(m.i);if(h){h.ankleT=m.t/10;if(m.t&&h.isPlayer)HUD.note(LI()?'Something has your ankle — shoot it!':'발목을 잡혔다 — 쏴서 떼어내!',2)}}
      else if(m.k==='esc'){E5X.cave=true}else TIAMAT.fxApply(m)},
    etw(L,m){WATER.set(m.k,m.y/100,m.r/100,true)},
    e5r(L,m){const P=G.player;for(const q of m.P||[])if(P&&q[0]===P.id)placeAt(P,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);for(const i of m.z||[]){const a=byIdAny(i);if(a)EP.despawn(a)}
      EP.ph='ride';EP.t=12;SCEN.closePick(false);CHAP[5].rideBegin()}});
})();

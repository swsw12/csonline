'use strict';
// ============ Chapter 3 「케프리」: the boss KHEPRI (Q7-303), the larva and scrap-armour zombies, the steel works' hazards ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, smoke, scripted leaps — are in epbase.js).
// Host-authoritative: the host runs KHEPRI's brain, its ball, every hit and every hazard; clients get the boss's gauges, its ball and the
// ladle in the chapter snapshot (EP.pack → bsPack) and the moments as events ('ekh').
// KHEPRI, a dung beetle grown huge on the infected (4 m long), has 22,000 × (0.6 + 0.4 × humans) × difficulty health and its own brain
// (EPZ.khepri.ai) and its own hit volumes (a.epRay: the ball, the joint under the horn, the shell). It rolls a ball of scrap in front of it:
//   the ball takes what comes from the front: bullets do a tenth of their damage to it (and every 1,500 they put in makes it heavier:
//   +1 weight, up to 10 — bigger, 10 % harder hitting and 4 % slower per weight); fire, blasts (HE, the explosive drums, the gas
//   pillars) and molten iron take it apart. Broken: KHEPRI flails for 10 s (×1.5 damage), then rolls a new one at a scrap heap (15 s).
//   phase 1 (100–60 %, the slag yard)  the charge (0.8 s of hind legs kicking dirt: 14 m/s, 30 + 3 a weight, a wall bounces it back
//              and stuns it), the throw (a red ring 4 m, 40), dirt kicked at two or more behind it (15, dust in the eyes), scrap
//              picked up every 20 s (+1 weight)
//   60 %       it opens its wing cases and flies to the furnace: the belly shows (×2.5)
//   phase 2 (60–30 %, the furnace)     the ball split into three (15 m/s, 20), an iron-dust storm (10 m, 4 s of haze and 6 a second),
//              short flights up onto the catwalks to drop the ball on whoever is below (a red ring 4 m, 40)
//   30 %       it flies to the casting bay
//   phase 3 (30–0 %, the casting bay)  the ball turns molten passing a runner (it leaves fire behind: 12 a second for 5 s), chains
//              of three charges
// The ladle over the casting bay's pour spot: both lever desks held together 2 s (or one alone 5 s) pour molten iron there — it melts
// the ball, and on the body takes 12 % of its health and floors it for 8 s; full again 40 s later. The weak points: the belly while it
// flies or lies on its back (×2.5 and stagger), the joint under the horn (×2). Stagger: belly hits, HE +15, frost +10, a wall +12.
// Enraged after 240 s (expert 180).
const KH_PH=[1,.6,.3],KH_BST=['held','air','loose','none','grow'],KH_POSE=['','walk','charge','lift','kick','fly','perch','down','flail','dust','roll'];
const KH_MIX=[['rager',34],['runner',24],['larva',24],['scrap',18]];
const KH_FIREW={salamander:1,bdc:1,rdc:1,gas:1};
const khFire=o=>!!(o&&(o.fire||KH_FIREW[o.w]));
// how far ahead of the beetle's middle the ball rides: its shovel pressed into it low down (lifted, the ball sits up on the horn)
const khFwd=(r,l)=>lerp(2.3+Math.sqrt(Math.max(0,2*r-1)),1.9+r*.5,l||0);

// ---------- atlas materials: the wing cases, chitin, the belly, the hind wings, rust, molten metal ----------
const KH_MATS=['epEly','epChit','epBelly','epWing','epRust','epMolt'];
for(const m of KH_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintKhAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // wing cases: blue-black lacquer, rows of fine pits (the striae), an oily blue sheen
  patch('epEly',(xx,y,X,Y)=>{const t=nz(X,Y,3501,22),u=nz(X,Y,3511,7);let c=t>.68?'#253250':t>.5?'#18213a':'#10151f';if(u>.7)c=mix(c,'#2e3e62',.35);if(xx%9===0&&y%4<2)c='#06080c';if(hash2(X,Y,3502)<.012)c='#3a4a76';return c},247);
  patch('epChit',(xx,y,X,Y)=>{const t=nz(X,Y,3503,12);let c=t>.64?'#241a16':t>.44?'#18120f':'#100c0a';if(hash2(X,Y,3504)<.025)c='#33261e';return c},245);
  // the belly: amber plates, dark seams, soft
  patch('epBelly',(xx,y,X,Y)=>{const t=nz(X,Y,3505,12);let c=t>.58?'#9a6430':t>.4?'#7a4a22':'#563218';if(y%22<3)c='#2a1a0e';if(hash2(X,Y,3506)<.02)c='#c08a44';return c},243);
  // the hind wings: smoky amber membrane, a few dark veins fanning along it
  patch('epWing',(xx,y,X,Y)=>{const t=nz(X,Y,3507,20);let c=t>.6?'#7a6644':t>.4?'#665638':'#54462e';const v=Math.abs(((xx+y*.18+nz(X,Y,3512,30)*14)%34)-17);if(v<1.1)c='#2a2014';if(y%61<1)c='#30261a';return c},242);
  patch('epRust',(xx,y,X,Y)=>{const t=nz(X,Y,3508,10);let c=t>.66?'#7e4a26':t>.5?'#62381c':t>.36?'#4a3222':'#33292a';if(hash2(X,Y,3509)<.04)c='#5e5a56';return c});
  patch('epMolt',(xx,y,X,Y)=>{const t=nz(X,Y,3510,9);return t>.62?'#fff2a0':t>.46?'#ffb030':t>.32?'#ff6a10':'#c03008'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintKhAtlas()}}

// ---------- models (the weapon material): the beetle's parts, the scrap ball, the props ----------
// the beetle's frame: metres, +y up, -z forward, the origin on the ground under the middle of its body; each part is drawn about its pivot
const khMir=L=>L.map(p=>Object.assign({},p,{c:[-p.c[0],p.c[1],p.c[2]],ry:p.ry?-p.ry:p.ry,rz:p.rz?-p.rz:p.rz}));
// a ball of scrap round a rusty core, radius 1 (the game scales it): panels, rebar, crushed drums, tyres, pipes laid on a sphere
function khBallParts(n,seed,core){const L=[Pt(0,0,0,1.62,1.62,1.62,'epRust',{r:.8})];if(core)L.push(Pt(.12,.08,-.1,1.4,1.4,1.4,'forged',{r:.69}));
  const M=['red','bluesteel','olive','white','dyel','tan','gunmetal','epRust','steel','dred','forged'];
  for(let i=0;i<n;i++){const k=(i+.5)/n,ph=Math.acos(1-2*k),th=i*2.39996+seed,d=[Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)];
    const g=Math.acos(clamp(d[1],-1,1)),be=Math.atan2(d[2],-d[0]),h=hash2(i,seed*7|0,1),m=M[Math.floor(hash2(i,seed*7|0,2)*M.length)],o={rz:g,ry:be},at=R=>[d[0]*R,d[1]*R,d[2]*R];
    if(h<.4){const p=at(.86);L.push(Pt(p[0],p[1],p[2],.5+hash2(i,3,seed*7|0)*.25,.06,.36+hash2(i,4,seed*7|0)*.2,m,o))}
    else if(h<.55){const p=at(.98);L.push(Pt(p[0],p[1],p[2],.06,.52,.06,'forged',o))}
    else if(h<.7){const p=at(.88);L.push(Pt(p[0],p[1],p[2],.26,.3,.26,m==='white'?'red':m,Object.assign({r:.11},o)))}
    else if(h<.8){const p=at(.84);L.push(Pt(p[0],p[1],p[2],.38,.12,.38,'rub',Object.assign({r:.12},o)))}
    else{const p=at(.86);L.push(Pt(p[0],p[1],p[2],.62,.08,.08,'gunmetal',Object.assign({r:.03},o)))}}
  return L}
// a scarab's build: broad and domed — the shield behind the head as wide as the wing cases, which close into one rounded back
// (each wing case's top runs flat right to the middle, so the two close without a valley between them)
{const elyL=[Pt(-.445,-.575,1.22,1.75,1.1,2.5,'epEly',{r:.45}),Pt(-.4,-.08,1.12,1.2,.4,2.1,'epEly',{r:.2}),Pt(-.015,.126,1.1,.03,.012,1.9,'epChit'),
    Pt(-1.29,-.78,1.2,.08,.22,2.3,'epChit',{r:.03}),...[-.22,-.44,-.66].map(x=>Pt(x,.126,1.1,.03,.012,1.6,'epChit'))];
  const wingL=[Pt(-1.35,0,1,2.7,.03,1.6,'epWing',{r:.015}),Pt(-1.35,.02,.45,2.6,.04,.06,'epChit'),Pt(-.85,.02,1.15,1.6,.04,.05,'epChit',{ry:-.25})];
  Object.assign(GUNS,{
    // the shield behind the head (its dome, its front lip), the body under the wing cases, the belly plates and their seams, the chest
    khBody:{parts:[Pt(0,1.08,-.95,2.5,.86,1.25,'epEly',{r:.4}),Pt(0,1.42,-.92,1.9,.48,1,'epEly',{r:.22}),Pt(0,.98,-1.56,1.7,.36,.16,'epChit',{r:.08}),
      Pt(0,.92,.85,2.36,1,2.6,'epChit',{r:.42}),Pt(0,.48,.85,1.7,.16,2.3,'epBelly',{r:.07}),...[-.2,.3,.8,1.3,1.8].map(z=>Pt(0,.4,z,1.5,.04,.07,'epChit')),
      Pt(0,.56,-.75,1.4,.3,1.1,'epBelly',{r:.1}),Pt(0,1.79,-.3,.34,.08,.32,'epEly',{r:.04})],grip:[0,0,0],muzzle:[0,0,0]},
    khElyL:{parts:elyL,grip:[0,0,0],muzzle:[0,0,0]},khElyR:{parts:khMir(elyL),grip:[0,0,0],muzzle:[0,0,0]},
    khWingL:{parts:wingL,grip:[0,0,0],muzzle:[0,0,0]},khWingR:{parts:khMir(wingL),grip:[0,0,0],muzzle:[0,0,0]},
    // the head about the neck: the capsule, the wide toothed shovel of the clypeus (rounded at the front), the horn curving up and back,
    // glowing eyes, the antennae with their fanned clubs, the jaws; the soft joint under the horn (the weak point)
    khHead:{parts:[Pt(0,.06,-.3,1.3,.56,.7,'epChit',{r:.22}),Pt(0,-.14,-.8,1.8,.12,.6,'epChit',{r:.05}),Pt(0,-.14,-1.06,1.3,.11,.3,'epChit',{r:.05}),
      ...[-.5,-.3,-.1,.1,.3,.5].map(x=>Pt(x,-.14,-1.22,.13,.08,.14,'epChit',{r:.03})),
      Pt(0,.36,-.52,.32,.46,.32,'epChit',{r:.12,rx:-.35}),Pt(0,.74,-.66,.24,.44,.24,'epChit',{r:.09,rx:-.12}),Pt(0,1.1,-.64,.18,.4,.18,'epChit',{r:.07,rx:.35}),Pt(0,1.36,-.5,.11,.24,.11,'epChit',{r:.04,rx:.85}),
      Pt(.6,.05,-.42,.17,.2,.24,'epMolt',{r:.06}),Pt(-.6,.05,-.42,.17,.2,.24,'epMolt',{r:.06}),Pt(.55,-.04,-.74,.05,.05,.4,'epChit',{ry:.7}),Pt(-.55,-.04,-.74,.05,.05,.4,'epChit',{ry:-.7}),
      Pt(.72,-.04,-.9,.16,.15,.06,'epChit',{ry:.7}),Pt(-.72,-.04,-.9,.16,.15,.06,'epChit',{ry:-.7}),Pt(.74,-.04,-.95,.16,.15,.04,'epChit',{ry:.7}),Pt(-.74,-.04,-.95,.16,.15,.04,'epChit',{ry:-.7}),
      Pt(.22,-.26,-.62,.12,.1,.3,'epChit',{r:.03}),Pt(-.22,-.26,-.62,.12,.1,.3,'epChit',{r:.03}),Pt(0,.1,-.02,.85,.38,.3,'epBelly',{r:.1})],grip:[0,0,0],muzzle:[0,0,0]},
    // a leg: the thigh along +x from the hip, the shin hanging along -y from the knee, spines and the foot's claws on the outer side
    // (the front shins are broad spades with four teeth for digging)
    khFem:{parts:[Pt(.46,0,0,.96,.28,.34,'epChit',{r:.1}),Pt(.9,.02,0,.2,.22,.24,'epChit',{r:.06}),Pt(.3,.15,0,.06,.1,.06,'epChit'),Pt(.6,.15,0,.06,.1,.06,'epChit')],grip:[0,0,0],muzzle:[0,0,0]},
    khTib:{parts:[Pt(0,-.6,0,.2,1.2,.22,'epChit',{r:.06}),...[-.3,-.6,-.9].map(y=>Pt(.13,y,0,.12,.06,.06,'epChit')),Pt(.1,-1.2,0,.34,.08,.11,'epChit',{r:.03}),Pt(.29,-1.22,0,.08,.06,.07,'epChit')],grip:[0,0,0],muzzle:[0,0,0]},
    khTibF:{parts:[Pt(0,-.55,0,.38,1.1,.16,'epChit',{r:.05}),...[-.25,-.5,-.75,-1].map(y=>Pt(.25,y,0,.2,.11,.12,'epChit',{r:.02})),Pt(.06,-1.16,0,.28,.08,.12,'epChit',{r:.03})],grip:[0,0,0],muzzle:[0,0,0]},
    khBall:{parts:khBallParts(36,1.3,true),grip:[0,0,0],muzzle:[0,0,0]},
    khMini:{parts:khBallParts(12,7.7,false),grip:[0,0,0],muzzle:[0,0,0]},
    // an explosive drum: red, black bands, a flame sign
    khDrum:{parts:[Pt(0,.45,0,.58,.9,.58,'red',{r:.27}),Pt(0,.04,0,.6,.06,.6,'gunmetal',{r:.28}),Pt(0,.86,0,.6,.06,.6,'gunmetal',{r:.28}),Pt(0,.45,0,.6,.05,.6,'blk2',{r:.28}),
      Pt(0,.62,-.292,.22,.22,.012,'yellow'),Pt(0,.6,-.298,.1,.14,.01,'blk2'),Pt(.14,.91,.06,.08,.04,.08,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
    // loose scrap the ball can pick up: a crumpled sheet, a car door, a pipe, a crushed drum
    khScrapP:{parts:[Pt(0,.14,0,1.1,.28,.8,'epRust',{r:.1,ry:.3}),Pt(.2,.38,.1,.8,.06,.6,'bluesteel',{rz:.4,ry:-.2}),Pt(-.3,.34,-.2,.08,.08,1.2,'forged',{rx:.2,ry:.8}),
      Pt(.35,.24,-.3,.4,.4,.4,'red',{r:.15}),Pt(-.2,.52,.25,.6,.05,.5,'steel',{rx:.5})],grip:[0,0,0],muzzle:[0,0,0]},
    // the ladle (its pivot on the trunnions; the bucket below, the lip toward +x) and the bail it hangs from
    khLadle:{parts:[Pt(0,-1.25,0,3.4,2.5,3.4,'gunmetal',{r:1.3}),Pt(0,.04,0,3.6,.22,3.6,'forged',{r:1.35}),Pt(0,-.06,0,3,.04,3,'epMolt',{r:1.1}),Pt(1.85,-.02,0,.42,.24,.9,'forged',{r:.1}),
      Pt(1.82,-.24,0,.2,.3,.8,'epRust',{r:.06}),Pt(0,-1.25,1.72,2.2,1.6,.06,'epRust'),Pt(0,-1.25,-1.72,2.2,1.6,.06,'epRust'),Pt(1.85,0,0,.3,.3,.3,'steel'),Pt(-1.85,0,0,.3,.3,.3,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
    khLadleB:{parts:[Pt(1.98,.8,0,.12,1.8,.22,'forged'),Pt(-1.98,.8,0,.12,1.8,.22,'forged'),Pt(0,1.72,0,4.1,.2,.24,'forged'),Pt(0,1.92,0,.5,.3,.5,'yellow')],grip:[0,0,0],muzzle:[0,0,0]}})}

// ---------- sounds: wing cases buzzing, the ball's rumble ----------
Object.assign(SFX,{
  kbuzz:{n:2,dur:1.3,ch:1,peak:.8,gain:.62,rev:.12,poly:2,fn:B=>{const out=B.g(.9);const e=B.env(.03,.12,.95,.35,out,.75),fl=B.g(1,e);const n=Math.floor(1.2*24*8),cv=new Float32Array(n);
    for(let i=0;i<n;i++)cv[i]=.25+.75*(.5+.5*Math.sin(i/8*TAU));fl.gain.setValueCurveAtTime(cv,0,1.2);
    B.osc('sawtooth',110,122,0,1.25,B.f('bandpass',620,1.1,fl));B.osc('square',220,236,0,1.25,B.f('bandpass',1250,2,fl));const e2=B.env(.03,.1,.35,.3,out,.7);B.nz('pink',0,1.25,B.f('bandpass',1800,2.2,e2))}},
  kroll:{n:2,dur:1.6,ch:2,peak:.8,gain:.72,rev:.2,poly:2,fn:B=>{const out=B.g(.9);for(const s of [-1,1]){const e=B.env(0,.25,1,.5,B.pan(s*.3,out),.6);B.nz('brown',0,1.6,B.f('lowpass',130,.8,e))}
    for(let i=0;i<8;i++)B.ring(rr(0,1.4),rr(260,800),[1,2.3,3.7],[.06,.04,.02],[.2,.12,.06],out);for(let i=0;i<12;i++)B.grain(rr(0,1.5),rr(400,1300),2,.02,rr(.1,.28),out)}}});
SFX_ORDER.push('kbuzz','kroll');

// ---------- the steel works' hazards (every page; the host decides): explosive drums, gas valves, coolant tanks, loose scrap, the scrap
// heaps, fire on the floor, larva swarms, the little balls of a split, the runners of molten iron ----------
const KX={drums:[],gas:[],scrap:[],heap:[],fire:[],swarm:[],mini:[],built:false,id:0,botShotT:0,flareN:0,flareL:null,railT:0,swT:0,
  build(){if(this.built||!MAP.ez||!MAP.ez.drums)return;this.built=true;const E=MAP.ez;
    this.drums=E.drums.map((d,i)=>{const m=new THREE.Mesh(gunGeo('khDrum'),matGun());m.position.set(d.x,d.y,d.z);m.rotation.y=hash2(i,1,3601)*TAU;R.scene.add(m);sampleProbe(d.x,d.y+.5,d.z,m.material.uniforms.uProbe.value);
      return {i,x:d.x,y:d.y,z:d.z,zn:d.zn,m,box:{x0:d.x-.3,x1:d.x+.3,y0:d.y,y1:d.y+.9,z0:d.z-.3,z1:d.z+.3,mat:'metalx',o:{eh:{k:'dr',i}}},alive:false,hp:50,rT:0}});
    this.gas=E.gas.map((g,i)=>({i,x:g.x,y:g.y,z:g.z,px:g.px,pz:g.pz,zn:g.zn,t:0,cd:0,tick:0,light:null}));
    this.scrap=E.scrap.map((p,i)=>{const m=new THREE.Mesh(gunGeo('khScrapP'),matGun());m.position.set(p.x,p.y,p.z);m.rotation.y=hash2(i,2,3601)*TAU;R.scene.add(m);sampleProbe(p.x,p.y+.5,p.z,m.material.uniforms.uProbe.value);
      return {i,x:p.x,y:p.y,z:p.z,m,alive:true,rT:0}});
    this.heap=E.heaps.map((h,i)=>({i,x:h.x,z:h.z,fx:h.fx,fz:h.fz,burnT:0}));LADLE.build()},
  clear(){for(const D of this.drums){R.scene.remove(D.m);D.m.material.dispose();worldRemoveDyn(D.box)}for(const S0 of this.scrap){R.scene.remove(S0.m);S0.m.material.dispose()}
    for(const G0 of this.gas)if(G0.light){G0.light.dead=true;G0.light=null}this.clearMini();if(this.flareL){this.flareL.dead=true;this.flareL=null}
    this.drums=[];this.gas=[];this.scrap=[];this.heap=[];this.fire=[];this.swarm=[];this.built=false;this.flareN=0;LADLE.clear()},
  // a stage's start: every drum back, the hazards quiet, the ladle full
  reset(){for(const D of this.drums)this.drumSet(D,true);for(const G0 of this.gas){G0.t=0;G0.cd=0}for(const S0 of this.scrap)this.scrapSet(S0,true);for(const H of this.heap)H.burnT=0;
    this.fire=[];this.swarm=[];this.clearMini();LADLE.reset()},
  drumSet(D,on){D.alive=on;D.hp=50;D.rT=0;D.m.visible=on;if(on){if(!D.box.cellsIn)worldAddDyn(D.box)}else worldRemoveDyn(D.box)},
  scrapSet(S0,on){S0.alive=on;S0.rT=0;S0.m.visible=on},
  // ---------- host: a shot or a blast on a prop ----------
  boxHit(k,i,dmg){if(k==='dr'){const D=this.drums[i];if(!D||!D.alive)return;D.hp-=dmg;if(D.hp<=0)this.drumBoom(D)}else if(k==='gv')this.gasFire(i);else if(k==='ct')this.coolant(i)},
  drumBoom(D){if(!D.alive)return;this.drumSet(D,false);D.rT=40;const x=D.x,y=D.y+.5,z=D.z;this.fx({k:'dr',i:D.i});
    this.blast(x,y,z,4.5,{hum:45,zom:900,ball:1100});this.fireAdd(x,D.y,z,1.8,4,true);
    for(const o of this.drums)if(o.alive&&Math.hypot(o.x-x,o.z-z)<3.6&&Math.abs(o.y-D.y)<2)EP.later(.18+Math.random()*.15,()=>this.drumBoom(o))},
  // a blast (a drum, a grenade): people thrown, zombies hit as by HE, the ball, swarms, loose scrap, a heap set burning
  blast(x,y,z,R,o){for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-x,dz=h.c.z-z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-y)>2.6||!o.hum)continue;if(!losClear(x,y+.3,z,h.c.x,h.c.y+1,h.c.z))continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*8*f,3+4*f,dz/(d||1)*8*f);hurtHuman(h,EPD(o.hum*(.35+.65*f)),null,{});if(f>.55)epFx(h,'kd',.7)}
    if(o.zom)for(const t of SCEN.Z){if(!t.alive)continue;const dx=t.c.x-x,dz=t.c.z-z,d=Math.hypot(dx,dz);if(d>R+(t.zc==='khepri'?1.6:0)||Math.abs(t.c.y-y)>3)continue;const f=1-Math.min(1,d/(R+1));
      damageActor(t,o.zom*(.35+.65*f),o.src||null,{w:'drum',he:1,dir:[dx/(d||1),.3,dz/(d||1)],kb:8*f,stag:.8,x:t.c.x,y:t.c.y+1,z:t.c.z})}
    if(o.ball)KHEPRI.blastAt(x,y,z,R,o.ball);this.swarmKill(x,z,R);for(const D of this.drums)if(D.alive&&Math.hypot(D.x-x,D.z-z)<R*.65&&Math.abs(D.y-y)<2.5)EP.later(.12,()=>this.drumBoom(D));for(const S0 of this.scrap)if(S0.alive&&Math.hypot(S0.x-x,S0.z-z)<R*.7)this.scrapGone(S0,0);
    for(const H of this.heap)if(Math.hypot(H.x-x,H.z-z)<R+2.5)this.heapBurn(H)},
  // a gas valve shot open: a pillar of fire for 3 s at its nozzle (15 s before it can go again)
  gasFire(i){const G0=this.gas[i];if(!G0||G0.cd>0||!EP.on||EP.ph==='prep')return;G0.cd=15;G0.t=3;G0.tick=0;this.fx({k:'gv',i})},
  coolant(i){const T=MAP.ez&&MAP.ez.cool[i];if(!T||G.t<(T.cd||0))return;T.cd=G.t+20;ESMK.add(T.x,T.y+.6,T.z,7,8);AU.at('hiss',T.x,T.y+2,T.z,{vol:1,range:50,rate:.6});this.fx({k:'ct',i})},
  heapBurn(H){if(H.burnT>6)return;H.burnT=12;this.fx({k:'hb',i:H.i})},
  scrapGone(S0,how){if(!S0.alive)return;this.scrapSet(S0,false);S0.rT=45;this.fx({k:'sc',i:S0.i,b:how})},
  // a patch of fire on the floor (the molten ball's trail, a drum's burning oil): 12 a second to whoever stands in it
  fireAdd(x,y,z,r,life,net){this.fire.push({x,y,z,r,t:0,life});if(this.fire.length>70)this.fire.shift();if(net&&NET.host)netEv('ekh',{k:'fz',x:r2(x),y:r2(y),z:r2(z),r:r2(r),l:r2(life)})},
  swarmAdd(x,y,z,id){const S0={id:id||++this.id,x,y,z,t:0,life:3,r:3};this.swarm.push(S0);AU.at('kbuzz',x,y+1,z,{vol:.7,range:30,rate:2.2});return S0},
  swarmKill(x,z,R){for(let i=this.swarm.length-1;i>=0;i--){const S0=this.swarm[i];if(Math.hypot(S0.x-x,S0.z-z)<R+S0.r*.5){this.swarm.splice(i,1);this.swarmFx(S0);if(NET.host)netEv('ekh',{k:'swx',id:S0.id})}}},
  swarmFx(S0){for(let k=0;k<16;k++)FX.spawn({x:S0.x+rr(-1,1),y:S0.y+rr(.3,1.6),z:S0.z+rr(-1,1),vx:rr(-1,1),vy:rr(.5,2),vz:rr(-1,1),life:rr(.3,.6),s0:.08,s1:.02,r:1,g:.6,b:.2,f:0,grav:3,add:1})},
  // the split: three little balls rolling out (every page simulates them; the host's hit them)
  miniAdd(L){for(const q of L){const m=new THREE.Mesh(gunGeo('khMini'),KHEPRI.ballMat());m.scale.setScalar(.85);R.scene.add(m);this.mini.push({x:q[0],z:q[1],y:q[2],dx:q[3],dz:q[4],v:15,t:0,life:1.9,m,hits:new Set(),q:new THREE.Quaternion()})}},
  clearMini(){for(const M of this.mini)R.scene.remove(M.m);this.mini=[]},
  miniBreak(M){for(let k=0;k<14;k++)FX.spawn({x:M.x,y:M.y+.6,z:M.z,vx:rr(-4,4),vy:rr(1,5),vz:rr(-4,4),life:rr(.6,1.1),s0:.09,s1:.07,r:.4,g:.32,b:.26,f:7,grav:13,col:.3});AU.at('imp_metal',M.x,M.y+.5,M.z,{vol:.9,range:40,rate:.7})},
  fx(m){this.fxApply(m);if(NET.host)netEv('ekh',m)},
  // ---------- every frame (every page) ----------
  update(dt){if(!this.built)return;const host=!NET.cli,run=EP.ph==='run'||EP.ph==='wave'||EP.ph==='move'||EP.ph==='break';
    // drums and scrap come back after a while (the host)
    if(host){for(const D of this.drums)if(!D.alive&&D.rT>0){D.rT-=dt;if(D.rT<=0){let clear=true;for(const a of G.actors)if(a.alive&&Math.hypot(a.c.x-D.x,a.c.z-D.z)<1.2)clear=false;if(clear){this.drumSet(D,true);this.fx({k:'dra',i:D.i})}else D.rT=2}}
      for(const S0 of this.scrap)if(!S0.alive&&S0.rT>0){S0.rT-=dt;if(S0.rT<=0){this.scrapSet(S0,true);this.fx({k:'sc',i:S0.i,b:2})}}}
    for(const H of this.heap)if(H.burnT>0){H.burnT-=dt;if(Math.random()<dt*14)FX.spawn({x:H.x+rr(-2.6,2.6),y:rr(.4,2.4),z:H.z+rr(-2.6,2.6),vx:rr(-.3,.3),vy:rr(1,2.2),vz:rr(-.3,.3),life:rr(.4,.8),s0:rr(.3,.5),s1:.12,r:1,g:rr(.45,.65),b:.15,a:.9,f:11,add:1})}
    // gas pillars
    for(const G0 of this.gas){if(G0.cd>0)G0.cd-=dt;if(G0.t<=0){if(G0.light){G0.light.dead=true;G0.light=null}continue}G0.t-=dt;
      if(!G0.light)G0.light=DL.add(G0.x,G0.y+1.6,G0.z,'#ff8a3a',11,2.4,0,{flick:.4});G0.light.i=2.4*Math.min(1,G0.t*2);
      for(let k=0;k<3;k++)if(Math.random()<dt*40)FX.spawn({x:G0.x+rr(-.4,.4),y:G0.y+rr(0,.6),z:G0.z+rr(-.4,.4),vx:rr(-.6,.6),vy:rr(5,9),vz:rr(-.6,.6),life:rr(.35,.6),s0:rr(.5,.8),s1:rr(.2,.4),r:1,g:rr(.5,.75),b:.2,a:.9,f:11,drag:1.2,add:1});
      if(host){G0.tick-=dt;if(G0.tick<=0){G0.tick=.25;this.pillarHit(G0,.25)}}}
    // fire on the floor
    for(let i=this.fire.length-1;i>=0;i--){const F=this.fire[i];F.t+=dt;if(F.t>F.life){this.fire.splice(i,1);continue}const k=Math.min(1,(F.life-F.t)/1.2);
      if(Math.random()<dt*7*k*F.r)FX.spawn({x:F.x+rr(-F.r,F.r)*.7,y:F.y+.05,z:F.z+rr(-F.r,F.r)*.7,vx:rr(-.2,.2),vy:rr(.6,1.6),vz:rr(-.2,.2),life:rr(.3,.6),s0:rr(.25,.45),s1:.1,r:1,g:rr(.4,.6),b:.12,a:.85,f:11,add:1})}
    // swarms: a cloud of buzzing grubs
    for(let i=this.swarm.length-1;i>=0;i--){const S0=this.swarm[i];S0.t+=dt;if(S0.t>S0.life){this.swarm.splice(i,1);continue}
      for(let k=0;k<4;k++)if(Math.random()<dt*30){const a=Math.random()*TAU,r=Math.random()*S0.r;FX.spawn({x:S0.x+Math.cos(a)*r,y:S0.y+rr(.2,1.9),z:S0.z+Math.sin(a)*r,vx:rr(-2,2),vy:rr(-.5,.8),vz:rr(-2,2),life:rr(.25,.5),s0:.05,s1:.04,r:.16,g:.14,b:.08,a:.95,f:0,drag:2})}}
    // the split's little balls
    for(let i=this.mini.length-1;i>=0;i--){const M=this.mini[i];M.t+=dt;const st=M.v*dt;const h=rayCast(M.x,M.y+.6,M.z,M.dx,0,M.dz,st+.75,SHOT_FILTER);
      if(h||M.t>M.life){this.miniBreak(M);R.scene.remove(M.m);this.mini.splice(i,1);continue}
      M.x+=M.dx*st;M.z+=M.dz*st;const fy=floorBelow(M.x,M.y+1.2,M.z,.3);if(fy>-50)M.y=fy;M.m.position.set(M.x,M.y+.68,M.z);_khQ.setFromAxisAngle(_khV.set(M.dz,0,-M.dx).normalize(),st/.68);M.q.premultiply(_khQ);M.m.quaternion.copy(M.q);
      sampleProbe(M.x,M.y+.7,M.z,M.m.material.uniforms.uProbe.value);if(Math.random()<dt*20)FX.spawn({x:M.x,y:M.y+.1,z:M.z,vy:rr(.3,.8),life:rr(.4,.7),s0:.3,s1:.8,r:.4,g:.36,b:.3,a:.45,f:2,drag:2});
      if(host)for(const hm of SCEN.H){if(!hm.alive||M.hits.has(hm))continue;if(Math.hypot(hm.c.x-M.x,hm.c.z-M.z)<1.05&&Math.abs(hm.c.y-M.y)<1.6){M.hits.add(hm);SCEN.pushHuman(hm,M.dx*10,5,M.dz*10);hurtHuman(hm,EPD(20),EP.bossA(),{claw:1})}}}
    // the flare stack over the rail yard: one more flame for each fuel valve open
    {const F=MAP.ez.flare;if(F&&this.flareN>0){if(!this.flareL)this.flareL=DL.add(F[0],F[1]+1,F[2],'#ff9a40',16,1.6,0,{flick:.35});this.flareL.i=.7+.5*this.flareN;
      for(let k=0;k<this.flareN;k++)if(Math.random()<dt*22)FX.spawn({x:F[0]+rr(-.3,.3),y:F[1],z:F[2]+rr(-.3,.3),vx:rr(-.4,.4)+.6,vy:rr(3,5)+k,vz:rr(-.4,.4),life:rr(.4,.8),s0:rr(.5,.9),s1:.3,r:1,g:rr(.5,.7),b:.2,a:.9,f:11,drag:1,add:1})}}
    if(host)this.hostTick(dt)},
  // host: fire, swarms, the runners and the pillars hurt people (and the ball)
  hostTick(dt){this.railT-=dt;if(this.railT>0)return;this.railT=.25;const T=.25;
    for(const h of SCEN.H){if(!h.alive)continue;const c=h.c;let hot=0;
      for(const F of this.fire)if(F.t<F.life&&Math.hypot(c.x-F.x,c.z-F.z)<F.r+.2&&Math.abs(c.y-F.y)<1)hot=Math.max(hot,12);
      if(EP.pow>.5&&c.y<.6&&this.onRail(c.x,c.z,c.hw||.3))hot=Math.max(hot,12);
      if(hot){hurtHuman(h,EPD(hot*T),null,{});if(Math.random()<.5)FX.spawn({x:c.x,y:c.y+.2,z:c.z,vy:1.5,life:.4,s0:.3,s1:.1,r:1,g:.5,b:.15,f:11,add:1})}
      for(const S0 of this.swarm)if(Math.hypot(c.x-S0.x,c.z-S0.z)<S0.r&&Math.abs(c.y-S0.y)<2.2){hurtHuman(h,EPD(5*T),null,{});break}}
    // fire burns the swarms away
    for(let i=this.swarm.length-1;i>=0;i--){const S0=this.swarm[i];let burn=false;for(const F of this.fire)if(Math.hypot(S0.x-F.x,S0.z-F.z)<F.r+1)burn=true;for(const G0 of this.gas)if(G0.t>0&&Math.hypot(S0.x-G0.x,S0.z-G0.z)<3.2)burn=true;
      if(burn){this.swarm.splice(i,1);this.swarmFx(S0);netEv('ekh',{k:'swx',id:S0.id})}}},
  // a pillar of fire: 20 a second to people in it, the ball's iron, the beetle itself, the heaps
  pillarHit(G0,T){for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-G0.x,h.c.z-G0.z)<1.7&&h.c.y-G0.y<3.6&&h.c.y-G0.y>-1)hurtHuman(h,EPD(20*T),null,{});
    const b=EP.bossA();if(b&&b.kh){const p=KHEPRI.ballPos(b),S=b.kh;if(S.b.st!=='none'&&S.b.st!=='grow'&&Math.hypot(p.x-G0.x,p.z-G0.z)<1.8+S.b.r)KHEPRI.ballHit(b,S,520*T,0);
      if(Math.hypot(b.c.x-G0.x,b.c.z-G0.z)<2.8)damageActor(b,320*T,null,{w:'gas',fire:1,dir:[0,0,0],kb:0,stag:.1,x:b.c.x,y:b.c.y+1,z:b.c.z})}
    for(const t of SCEN.Z)if(t.alive&&t.zc!=='khepri'&&Math.hypot(t.c.x-G0.x,t.c.z-G0.z)<2)damageActor(t,180*T,null,{w:'gas',fire:1,dir:[0,0,0],kb:0,stag:.2,x:t.c.x,y:t.c.y+1,z:t.c.z});
    for(const H of this.heap)if(Math.hypot(H.x-G0.x,H.z-G0.z)<4.5)this.heapBurn(H)},
  // standing in a runner of molten iron (the box of each stretch, padded by the body's half width)
  onRail(x,z,pad){const RL=MAP.ez.rails;if(!RL)return false;for(const r of RL)if(x>r[0]-pad&&x<r[2]+pad&&z>r[1]-pad&&z<r[3]+pad)return true;return false},
  railNear(x,z,d){const RL=MAP.ez.rails;if(!RL)return false;for(const r of RL)if(x>r[0]-d&&x<r[2]+d&&z>r[1]-d&&z<r[3]+d)return true;return false},
  // ---------- every page: what the events show ----------
  fxApply(m){const E=MAP.ez,P=G.player,L=LI();
    switch(m.k){
    case 'dr':{const D=this.drums[m.i];if(!D)break;if(NET.cli){this.drumSet(D,false)}const x=D.x,y=D.y+.5,z=D.z;FX.explode(x,y,z,'he');AU.at('explode',x,y,z,{vol:1,range:90,occ:false,rate:.9});
      for(let k=0;k<18;k++)FX.spawn({x,y,z,vx:rr(-5,5),vy:rr(2,7),vz:rr(-5,5),life:rr(.6,1.2),s0:.08,s1:.06,r:.5,g:.12,b:.08,f:7,grav:13,col:.3});
      if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<14){FX.shake=Math.max(FX.shake,.9-d/16);AU.shock(.8-d/18)}}break}
    case 'dra':{const D=this.drums[m.i];if(D&&NET.cli)this.drumSet(D,true);break}
    case 'gv':{const G0=this.gas[m.i];if(!G0)break;if(NET.cli){G0.t=3;G0.cd=15}AU.at('salign',G0.x,G0.y+1,G0.z,{vol:1,range:60,rate:.8});AU.at('salgust',G0.x,G0.y+1,G0.z,{vol:1,range:60,rate:.7});
      AU.at('hiss',G0.px,G0.y+1.4,G0.pz,{vol:.8,range:40,rate:1.3});break}
    case 'ct':{const T=E&&E.cool[m.i];if(T&&NET.cli)T.cd=G.t+20;break}
    case 'hb':{const H=this.heap[m.i];if(H){H.burnT=12;AU.at('salign',H.x,1,H.z,{vol:.8,range:50,rate:.6})}break}
    case 'sc':{const S0=this.scrap[m.i];if(!S0)break;if(m.b===2){this.scrapSet(S0,true);break}if(NET.cli)this.scrapSet(S0,false);
      if(m.b===1){const b=EP.bossA(),p=b?KHEPRI.ballPos(b):null;for(let k=0;k<14;k++){const tx=p?p.x:S0.x,tz=p?p.z:S0.z;FX.spawn({x:S0.x+rr(-.4,.4),y:S0.y+rr(.2,.6),z:S0.z+rr(-.4,.4),vx:(tx-S0.x)*rr(1,1.6),vy:rr(2,4),vz:(tz-S0.z)*rr(1,1.6),life:rr(.4,.7),s0:.1,s1:.08,r:.45,g:.35,b:.28,f:7,grav:8})}
        AU.at('imp_metal',S0.x,S0.y+.5,S0.z,{vol:1,range:50,rate:.6});HUD.note(L?'The ball took the scrap — heavier':'공이 고철을 붙였다 — 더 무거워짐',1.8)}
      else{for(let k=0;k<12;k++)FX.spawn({x:S0.x,y:S0.y+.4,z:S0.z,vx:rr(-3,3),vy:rr(1,4),vz:rr(-3,3),life:rr(.5,1),s0:.08,s1:.06,r:.4,g:.32,b:.26,f:7,grav:13,col:.3})}break}
    case 'fz':if(NET.cli)this.fire.push({x:m.x/100,y:m.y/100,z:m.z/100,r:m.r/100,t:0,life:m.l/100});break;
    case 'sw':if(NET.cli)this.swarmAdd(m.x/100,m.y/100,m.z/100,m.id);break;
    case 'swx':{const i=this.swarm.findIndex(S0=>S0.id===m.id);if(i>=0){const S0=this.swarm[i];this.swarm.splice(i,1);this.swarmFx(S0)}break}
    case 'spl':this.miniAdd(m.L.map(q=>[q[0]/100,q[1]/100,q[2]/100,q[3]/1000,q[4]/1000]));break;
    case 'fl':this.flareN=m.n;break}}};
const _khQ=new THREE.Quaternion(),_khV=new THREE.Vector3(),_khM=new THREE.Matrix4(),_khW=new THREE.Vector3();

// ---------- the ladle over the casting bay's pour spot (every page; the host decides) ----------
// st: 'full' (the levers work: both held 2 s, one alone 5 s; let go and it creeps back slowly, so it can be pulled most of the way and
// the pour timed), 'tilt' (0.5 s), 'pour' (3 s: the stream, 30 a second under it), 'empty' (40 s, a puddle at first)
const LADLE={st:'full',t:0,p:0,cd:0,ang:0,m:null,mb:null,str:null,strM:null,pud:null,pudM:null,light:null,tick:0,pT:0,
  build(){if(this.m||!MAP.ez||!MAP.ez.ladle)return;const L=MAP.ez.ladle;this.m=new THREE.Mesh(gunGeo('khLadle'),matGun());this.m.position.set(L.x,L.y,L.z);R.scene.add(this.m);
    this.mb=new THREE.Mesh(gunGeo('khLadleB'),matGun());this.mb.position.set(L.x,L.y,L.z);R.scene.add(this.mb);for(const m of [this.m,this.mb])sampleProbe(L.x,L.y,L.z,m.material.uniforms.uProbe.value);
    // the stream: the runners' molten-iron texture pouring down it (uLen its length, so the texture keeps its size)
    const g=new THREE.CylinderGeometry(.42,.6,1,12,1,true);g.translate(0,-.5,0);
    this.strM=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:TEX.e3moltA},uLen:{value:8},uA:{value:.92}},LU),vertexShader:VS_WORLD,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      fragmentShader:GLSL_DYN+`uniform sampler2D map;uniform float uTime;uniform float uLen;uniform float uA;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
        void main(){vec2 u=vec2(vUv.x*2.,vUv.y*uLen*.35+uTime*1.8);vec3 a=texture2D(map,u).rgb,b=texture2D(map,u*vec2(.6,.5)+vec2(.3,uTime*.7)).rgb;gl_FragColor=vec4((a*.75+b*.45)*1.5,uA);}`});
    this.str=new THREE.Mesh(g,this.strM);this.str.visible=false;this.str.frustumCulled=false;R.scene.add(this.str);
    // the pool it leaves: the same iron, a ragged edge, fading as it cools (uA)
    const pg=new THREE.CircleGeometry(1,28);pg.rotateX(-Math.PI/2);
    this.pudM=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:TEX.e3moltA},uA:{value:0}},LU),vertexShader:VS_WORLD,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      fragmentShader:GLSL_DYN+`uniform sampler2D map;uniform float uTime;uniform float uA;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
        void main(){vec3 a=texture2D(map,vPos.xz*.22+vec2(uTime*.03,0.)).rgb,b=texture2D(map,vPos.xz*.13+vec2(.4,uTime*.02)).rgb;float d=length(vUv-.5)*2.+(b.g-.5)*.3;
          gl_FragColor=vec4((a*.8+b*.4)*1.4,uA*smoothstep(1.,.75,d));}`});
    this.pud=new THREE.Mesh(pg,this.pudM);this.pud.position.set(L.spot[0],.04,L.spot[2]);this.pud.scale.setScalar(L.r);this.pud.visible=false;R.scene.add(this.pud)},
  clear(){for(const k of ['m','mb','str','pud']){const o=this[k];if(o){R.scene.remove(o);if(o.material&&o.material.dispose)o.material.dispose()}this[k]=null}if(this.light){this.light.dead=true;this.light=null}this.st='full';this.p=0;this.cd=0;this.ang=0},
  reset(){this.st='full';this.t=0;this.p=0;this.cd=0;this.pT=0},
  code(){return ['full','tilt','pour','empty'].indexOf(this.st)},
  set(st,remote){const was=this.st;this.st=st;const L=MAP.ez.ladle;if(st==='tilt'){this.t=.5;AU.at('spinup',L.x,L.y+2,L.z,{vol:1,range:80,rate:.6});AU.at('imp_metal',L.x,L.y,L.z,{vol:.9,range:60,rate:.5})}
    else if(st==='pour'){this.t=3;this.tick=0;this.hitBody=false;this.hitBall=false;AU.at('salign',L.spot[0],2,L.spot[2],{vol:1,range:90,rate:.5});AU.at('kroll',L.spot[0],2,L.spot[2],{vol:1,range:90,rate:1.6});HUD.announce(LI()?'MOLTEN IRON — POURING':'쇳물 낙하!','z',2)}
    else if(st==='empty'){this.cd=40;this.pT=8}else if(st==='full'&&was==='empty')AU.at('powerup',L.x,L.y,L.z,{vol:.6,range:60,rate:.7});
    if(NET.host&&!remote)netEv('ekh',{k:'ld',s:this.code()})},
  // host: the levers, the pour
  hostTick(dt){const L=MAP.ez.ladle,run=EP.st===4&&EP.ph==='run';
    if(this.st==='full'){let n0=0,n1=0;if(run)for(const h of SCEN.H){if(!h.alive||G.t<(h.useBlk||0))continue;if(h.epUse===100&&this.near(h,0))n0++;if(h.epUse===101&&this.near(h,1))n1++}
      const rate=n0&&n1?1/2:n0||n1?1/5:-.12;this.p=clamp(this.p+rate*dt,0,1);if(this.p>=1){this.p=0;this.set('tilt')}}
    else if(this.st==='tilt'){this.t-=dt;if(this.t<=0)this.set('pour')}
    else if(this.st==='pour'){this.t-=dt;this.tick-=dt;if(this.tick<=0){this.tick=.25;const sx=L.spot[0],sz=L.spot[2];
        for(const h of SCEN.H)if(h.alive&&h.c.y<1.5&&Math.hypot(h.c.x-sx,h.c.z-sz)<L.r)hurtHuman(h,EPD(30*.25),null,{});
        const b=EP.bossA();if(b&&b.kh&&b.alive){const S=b.kh,p=KHEPRI.ballPos(b);
          if(!this.hitBall&&(S.b.st==='held'||S.b.st==='loose')&&Math.hypot(p.x-sx,p.z-sz)<L.r+S.b.r*.5){this.hitBall=true;KHEPRI.ballBreak(b,S,'ladle')}
          if(!this.hitBody&&Math.hypot(b.c.x-sx,b.c.z-sz)<L.r+1){this.hitBody=true;KHEPRI.ladleHit(b,S)}}
        for(const t of SCEN.Z)if(t.alive&&t.zc!=='khepri'&&Math.hypot(t.c.x-sx,t.c.z-sz)<L.r)damageActor(t,600*.25,null,{w:'ladle',fire:1,dir:[0,0,0],kb:0,stag:.3,x:t.c.x,y:t.c.y+1,z:t.c.z})}
      if(this.t<=0)this.set('empty')}
    else if(this.st==='empty'){if(this.pT>0){this.pT-=dt;this.tick-=dt;if(this.tick<=0){this.tick=.25;const sx=L.spot[0],sz=L.spot[2];for(const h of SCEN.H)if(h.alive&&h.c.y<.6&&Math.hypot(h.c.x-sx,h.c.z-sz)<L.r*.85)hurtHuman(h,EPD(12*.25),null,{});
          // the pool melts a ball rolled into it
          const b=EP.bossA();if(b&&b.kh&&b.alive){const S=b.kh,p=KHEPRI.ballPos(b);if((S.b.st==='held'||S.b.st==='loose')&&Math.hypot(p.x-sx,p.z-sz)<L.r*.85+S.b.r*.3)KHEPRI.ballBreak(b,S,'ladle')}}}
      this.cd-=dt;if(this.cd<=0)this.set('full')}},
  near(h,i){const v=MAP.ez.ladle.lev[i];return Math.hypot(h.c.x-v.x,h.c.z-v.z)<1.6&&Math.abs(h.c.y)<1.6},
  // every page: the tilt, the stream, the puddle
  update(dt){if(!this.m)return;const L=MAP.ez.ladle;if(NET.cli&&this.st!=='full'){if(this.st==='tilt'||this.st==='pour')this.t-=dt;if(this.st==='empty'){this.cd-=dt;if(this.pT>0)this.pT-=dt}}
    const want=this.st==='tilt'?.55:this.st==='pour'?1.15:0;this.ang=approach(this.ang,want,dt*(this.st==='empty'?.35:1.4));this.m.rotation.z=-this.ang;
    const pour=this.st==='pour';this.str.visible=pour;const lx=1.95,ly=.05,ca=Math.cos(this.ang),sa=Math.sin(this.ang),px=L.x+lx*ca+ly*sa,py=L.y-lx*sa+ly*ca;
    if(pour){this.str.position.set(px,py,L.z);this.str.scale.set(1,py,1);this.strM.uniforms.uA.value=.8+.15*Math.sin(G.t*30);this.strM.uniforms.uLen.value=py;
      for(let k=0;k<3;k++)if(Math.random()<dt*40)FX.spawn({x:L.spot[0]+rr(-.8,.8),y:.15,z:L.spot[2]+rr(-.8,.8),vx:rr(-4,4),vy:rr(2,6),vz:rr(-4,4),life:rr(.3,.7),s0:.08,s1:.03,r:1,g:rr(.6,.85),b:.25,f:0,grav:11,add:1});
      if(Math.random()<dt*14)FX.spawn({x:L.spot[0]+rr(-1.5,1.5),y:.3,z:L.spot[2]+rr(-1.5,1.5),vy:rr(1,2.5),life:rr(.8,1.4),s0:.6,s1:2,r:.5,g:.4,b:.36,a:.4,f:2,drag:1.2})}
    const pk=pour?1:this.st==='empty'&&this.pT>0?this.pT/8:0;this.pud.visible=pk>0;this.pudM.uniforms.uA.value=.9*pk;
    if(pk>0||pour){if(!this.light)this.light=DL.add(L.spot[0],1.4,L.spot[2],'#ff8a30',14,0,0,{flick:.3});this.light.i=2.8*Math.max(pk,pour?1:0)}else if(this.light){this.light.dead=true;this.light=null}
    this.m.material.uniforms.uEmisA.value=this.st==='empty'?.25:1.4},
  pack(){return [this.code(),Math.round(this.p*100),Math.ceil(this.cd)]},
  unpack(a){if(!a)return;const s=['full','tilt','pour','empty'][a[0]];if(s&&s!==this.st)this.set(s,true);this.p=(a[1]||0)/100;if(this.st==='empty')this.cd=a[2]||0}};

// ---------- KHEPRI ----------
const KHEPRI={encNext:0,KB:null,
  zc:'khepri',name:['케프리','KHEPRI'],code:'Q7-303',ticks:[60,30],g2:['고철 공','BALL'],darkPh:0,
  wake:['케프리가 공을 굴리기까지','KHEPRI starts rolling in'],goText:['케프리가 공을 굴리기 시작했다','KHEPRI STARTS ROLLING'],deadText:['케프리 무력화','KHEPRI IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(22000*(.6+.4*H)*SC_DIFF.hp[d])},
  ballFor(enc){const H=SCEN.H.length,d=G.diff||0;return Math.round(1300*(.6+.4*H)*SC_DIFF.hp[d]*(enc?.8:1))},
  isEnc(a){return !!(a.kh&&a.kh.enc)},
  rr(w){return 1.25+.075*w},
  ballMat(){const m=matGun();return m},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: by the first scrap heap in the slag yard, rolling its ball (a phase replay: the furnace, the casting bay)
  prepSpawn(kind,bp){let b=EP.bossA();const E=MAP.ez,P=E.pf[kind==='phase'?bp-1:0];
    if(!b)b=this.spawn([P[0],P[1],P[2]],-Math.PI/2,0);else if(kind!=='phase')this.init(b,0);if(!b)return;
    if(kind==='phase')this.reset(b,bp);placeAt(b,P[0],P[1],P[2],0);this.face(b,8,6);b.kh.idle=true;b.kh.mode=''},
  go(b){const S=b.kh;if(!S)return;S.idle=false;S.pt=1;this.fx({k:'roar',i:b.id})},
  // the first meeting: through the conveyor gallery's wall; gone at the end of the wait (or once its ball breaks, or at 85 %)
  meetStart(E){const g=MAP.ez.gal;EP.gateOpen('gW',true);this.fx({k:'brk'});const a=this.spawn([g.x,g.y,g.z],Math.PI/2,1);
    if(a){E.a=a;a.kh.idle=false;a.kh.pt=1.4;this.face(a,g.x-10,g.z)}EP.say('enc');EP.later(2.2,()=>EP.say('enc2'))},
  meetTick(){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.kh)this.retreat(E.a)},
  // the boss slot of the pool comes back as KHEPRI
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='khepri';a.deadT=99;this.encNext=enc||0;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=0;return a},
  init(a,enc){const bm=this.ballFor(enc===1);
    a.kh={ph:1,mode:'',mt:0,mt0:1,pt:2,cd:{ch:2.5,th:6,kk:3,sc:20,sp:4,ds:6,fl:7,cc:3,bp:1.5},thr:{},grog:0,grogN:0,grogMax:100,invT:enc===2?999:0,enr:false,fightT:0,enc:enc||0,idle:!enc,
      tg:null,tgT:0,dx:0,dz:-1,hits:null,chT:0,lx:a.c.x,lz:a.c.z,blk:0,ccN:0,slowT:0,fly:0,perch:-1,tp:null,goT:0,heap:-1,rb:0,trD:0,rollT:0,ladled:false,dustT:0,stuck:0,sx:a.c.x,sz:a.c.z,
      b:{st:'held',x:a.c.x,y:a.c.y+1.25,z:a.c.z,r:1.25,w:0,wAcc:0,dur:bm,durMax:bm,mol:0,lift:0,air:null,touch:{}}};
    a.epDown=0;a.kin=null;a.epHide=false;a.khFly=0;a.khPose='';a.khPh=0},
  // a retry of the boss fight starts the phase it reached again, at that phase's health, with a fresh ball
  reset(a,ph){a.hp=a.maxHp*KH_PH[ph-1];this.init(a,0);a.kh.ph=ph;a.kh.idle=true;a.leapV=null;a.kin=null;a.kvx=a.kvz=0;a.frozen=0},
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=Math.atan2(-(x-a.c.x),-(z-a.c.z))},
  fx(m){this.fxApply(m);if(NET.host)netEv('ekh',m)},
  // where the ball is: in front of the head (lifted onto the horn for a throw, under the body in flight), or where it lies / flies
  ballPos(a,S){S=S||a.kh;const out=_khW;if(!S){const f=EP.bf;if(f&&f.id===a.id&&f.bs!==0){out.set(f.bx,f.by,f.bz);return out}}
    const B=S?S.b:null,st=S?B.st:KH_BST[(EP.bf&&EP.bf.bs)||0];if(st!=='held'){if(B)out.set(B.x,B.y,B.z);return out}
    const r=S?B.r:this.rr(EP.bf?EP.bf.w:0),lift=S?B.lift:(EP.bf?EP.bf.lift:0),fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),fly=S?S.fly:(EP.bf&&EP.bf.f&1?1:0);
    if(fly)return out.set(a.c.x+fx*.3,a.c.y+.2-r*.2,a.c.z+fz*.3);
    const fwd=khFwd(r,lift);return out.set(a.c.x+fx*fwd,a.c.y+r+lift*(1.6+r*.35),a.c.z+fz*fwd)},
  // ---------- host: the brain (EPZ.khepri.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.kh;if(!S)return true;const c=a.c,cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);
    if(a.frozen>0){a.frozen=0;c.vx=c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone'&&S.enc!==2;
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('kEnr')}}
    const cdm=S.enr?1/.7:1;for(const k in S.cd)S.cd[k]-=dt*cdm;
    const b=S.b;b.r=b.st==='grow'?b.r:this.rr(b.w);
    a.spdMul=(1-.04*b.w)*(S.enr?1.15:1)*(S.slowT>0?.6:1)*(b.st==='none'?1.2:1);
    this.ballTick(a,dt,S);
    if(S.enc===2){if(S.mode){S.mt-=dt;this.step(a,dt,S)}return true}
    if(!live){a.khPose=b.st==='grow'?'roll':'';if(S.mode==='ret'||S.mode==='ret2'){S.mt-=dt;this.step(a,dt,S)}return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(a.kin)return true;
    this.think(a,dt,S);return true},
  think(a,dt,S){const b=S.b,c=a.c;a.khPose='walk';
    if(b.st==='loose'){this.fetch(a,dt,S);return}
    if(b.st==='none'||b.st==='grow'){this.rebuild(a,dt,S);return}
    if(b.st==='air'){a.khPose='';return}
    const t=this.target(a,S);if(!t){const P=MAP.ez.pf[Math.min(2,S.ph-1)];if(Math.hypot(P[0]-c.x,P[2]-c.z)>3)this.walk(a,dt,S,P,.8);else a.khPose='';return}
    const d=Math.hypot(t.c.x-c.x,t.c.z-c.z);if(d>3.2)this.walk(a,dt,S,[t.c.x,t.c.y,t.c.z],1);else{this.turn(a,dt,t.c.x,t.c.z,2.5);a.khPose=''}
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;
    const see=losClear(c.x,c.y+1.4,c.z,t.c.x,t.c.y+1.2,t.c.z),P=S.enc?1:S.ph;
    // dirt in the face of those behind it; a shove of the ball at whoever is right in front
    if(S.cd.kk<=0&&this.behind(a,6.5)>=2){S.cd.kk=8;this.kickW(a,S);return}
    if(S.cd.bp<=0&&b.st==='held'&&d<6&&Math.abs(wrapA(Math.atan2(-(t.c.x-c.x),-(t.c.z-c.z))-a.yaw))<.7){S.cd.bp=4.5;this.bumpW(a,t,S);return}
    if(P===1){
      if(see&&S.cd.ch<=0&&d>4.5&&d<24&&this.lane(a,t)){S.cd.ch=5;this.chargeW(a,t,S,false);return}
      if(!S.enc&&S.cd.th<=0){const ft=this.far(a,12,32);if(ft){S.cd.th=12;this.throwW(a,ft,S);return}}
      return}
    if(P===2){
      if(S.cd.ds<=0&&this.near(a,10)>=2){S.cd.ds=16;this.dustW(a,S);return}
      if(see&&S.cd.sp<=0&&d>4&&d<20){S.cd.sp=14;this.splitW(a,S);return}
      if(S.cd.fl<=0){const k=this.perchPick(a,S);if(k>=0){S.cd.fl=18;this.flyW(a,S,k);return}}
      if(see&&S.cd.ch<=0&&d>5&&d<24&&this.lane(a,t)){S.cd.ch=7.5;this.chargeW(a,t,S,false);return}
      if(S.cd.th<=0){const ft=this.far(a,12,32);if(ft){S.cd.th=15;this.throwW(a,ft,S);return}}
      return}
    if(see&&S.cd.cc<=0&&d>5&&d<22){S.cd.cc=12;S.ccN=3;this.chargeW(a,t,S,true);return}
    if(see&&S.cd.ch<=0&&d>5&&d<24&&this.lane(a,t)){S.cd.ch=6;this.chargeW(a,t,S,false);return}
    if(S.cd.th<=0){const ft=this.far(a,12,32);if(ft){S.cd.th=13;this.throwW(a,ft,S);return}}},
  // who it goes for: whoever has been hurting it most these last seconds (it turns its ball on them), else the nearest it can see;
  // nobody hidden in steam or smoke (it keeps a target for 2.5 s)
  target(a,S){const c=a.c;if(S.tg&&S.tg.alive&&G.t<S.tgT&&!ESMK.at(S.tg.c.x,S.tg.c.z,0))return S.tg;let best=null,bs=1e9;
    for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z)+Math.abs(h.c.y-c.y)*2;if(d>60)continue;if(d>5&&ESMK.at(h.c.x,h.c.z,0))continue;if(d>14&&!losClear(c.x,c.y+1.4,c.z,h.c.x,h.c.y+1.2,h.c.z))continue;
      const e=S.thr[h.id],th=e?e.v*Math.exp(-(G.t-e.t)/2.5):0,sc=d-Math.min(30,th/60);if(sc<bs){bs=sc;best=h}}
    S.tg=best;S.tgT=G.t+2.5;return best},
  // (EPZ.khepri.after) the damage each human has been doing to it
  threat(t,r,src){const S=t.kh;if(!S||!src||src.team!==TH)return;const e=S.thr[src.id]||(S.thr[src.id]={v:0,t:G.t});e.v=e.v*Math.exp(-(G.t-e.t)/2.5)+r;e.t=G.t},
  // ---------- the shove: the ball heaved at whoever is right in front (0.45 s) ----------
  bumpW(a,t,S){const c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1;S.dx=dx/d;S.dz=dz/d;a.yaw=Math.atan2(-S.dx,-S.dz);S.mode='bw';S.mt=.45*EPTW();
    TELE.add({k:'r',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,yaw:a.yaw,w:2*S.b.r+.6,l:khFwd(S.b.r)+S.b.r+4.5,d:S.mt});this.fx({k:'w',i:a.id,s:'bp'})},
  far(a,lo,hi){const c=a.c;let best=null,bd=lo;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<bd||d>hi||ESMK.at(h.c.x,h.c.z,0))continue;
      if(!losClear(c.x,c.y+3.2,c.z,h.c.x,h.c.y+1.2,h.c.z))continue;bd=d;best=h}return best},
  near(a,r){let n=0;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z)<r&&Math.abs(h.c.y-a.c.y)<4)n++;return n},
  behind(a,r){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);let n=0;for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-a.c.x,dz=h.c.z-a.c.z,d=Math.hypot(dx,dz);if(d<r&&d>1&&Math.abs(h.c.y-a.c.y)<2.5&&(dx*fx+dz*fz)/d<-.45)n++}return n},
  // a straight run at the target with room for the ball (it charges at walls too: that is its weakness)
  lane(a,t){const c=a.c,r=this.rr(a.kh.b.w);return navStraight(c.x,c.y,c.z,t.c.x,t.c.z,Math.min(1,r*.5))||Math.random()<.35},
  // walking: it turns like a tank and pushes the ball ahead of it
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1.2;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    let wx,wz;if(mv){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);wx=fx*cmd.f+rx*cmd.s;wz=fz*cmd.f+rz*cmd.s}else{wx=p[0]-c.x;wz=p[2]-c.z}
    const l=Math.hypot(wx,wz);cmd.f=cmd.s=0;cmd.jump=false;if(l<.05)return;const want=Math.atan2(-wx,-wz),dy=wrapA(want-a.yaw);AI.turnTo(a,want,0,dt,2.6);
    cmd.f=Math.max(0,Math.cos(dy))*(Math.abs(dy)<1.2?1:.25);a.spdMul*=mul;
    // stuck against something: back off and turn
    if(Math.hypot(c.x-S.sx,c.z-S.sz)>.6){S.sx=c.x;S.sz=c.z;S.stuck=0}else{S.stuck+=dt;if(S.stuck>2.2){S.stuck=0;S.goT=0;a.kvx+=Math.sin(a.yaw)*4;a.kvz+=Math.cos(a.yaw)*4;a.yaw=wrapA(a.yaw+rr(-1.2,1.2))}}},
  turn(a,dt,x,z,rate){AI.turnTo(a,Math.atan2(-(x-a.c.x),-(z-a.c.z)),0,dt,rate||2.6)},
  // ---------- the charge ----------
  chSpd(S){return 14*(1-.04*S.b.w)*(S.enr?1.12:1)*(S.slowT>0?.65:1)},
  chargeW(a,t,S,chain){const c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz)||1;S.dx=dx/d;S.dz=dz/d;a.yaw=Math.atan2(-S.dx,-S.dz);S.mode='cw';S.mt=S.mt0=(chain?.6:.8)*EPTW();
    const r=S.b.r,len=Math.min(25,this.chSpd(S)*1.6+r*2);TELE.add({k:'r',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,yaw:a.yaw,w:2*r+1,l:len,d:S.mt});this.fx({k:'w',i:a.id,s:'ch'})},
  // the ball against a wall: it bounces back on the beetle, which reels
  wallHit(a,S){const c=a.c;a.kvx=a.kvz=0;const p=this.ballPos(a,S);this.fx({k:'wall',x:r2(p.x+S.dx*S.b.r),y:r2(p.y),z:r2(p.z+S.dz*S.b.r)});this.grog(a,12);S.ccN=0;
    S.mode='bnc';S.mt=.45;S.hits=new Set();EP.say('kWall')},
  // ---------- the throw: the ball lifted on the horn (1 s, a red ring where it lands), then thrown ----------
  throwW(a,t,S){S.tg=t;S.mode='tw';S.mt=S.mt0=1*EPTW();this.face(a,t.c.x,t.c.z);const p=this.landPt(t.c.x+t.c.vx*.5,t.c.y,t.c.z+t.c.vz*.5);S.tp=p;
    TELE.add({k:'c',x:p[0],y:p[1],z:p[2],r:4,d:S.mt+1.1});this.fx({k:'w',i:a.id,s:'th'})},
  landPt(x,y,z){let fy=floorBelow(x,y+1.5,z,.3);if(!(fy>-50))fy=y;return [x,fy,z]},
  // the ball leaves for (x1, y1, z1) in T s (kind 'th' a throw, 'dr' dropped from a catwalk)
  ballThrow(a,S,p,T,kind){const B=S.b,o=this.ballPos(a,S);B.st='air';B.lift=0;B.air={x0:o.x,y0:o.y,z0:o.z,x1:p[0],y1:p[1]+B.r,z1:p[2],T,t:0,k:kind||'th',h:kind==='dr'?.6:3.5};B.x=o.x;B.y=o.y;B.z=o.z;
    this.fx({k:'bt',a:[r2(o.x),r2(o.y),r2(o.z),r2(p[0]),r2(p[1]+B.r),r2(p[2])],T:r2(T),h:r2(B.air.h)})},
  ballLand(a,S){const B=S.b,A=B.air;B.st='loose';B.air=null;B.x=A.x1;B.y=A.y1;B.z=A.z1;const R=4;
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-B.x,dz=h.c.z-B.z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-(B.y-B.r))>2.5)continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*9*f,4+3*f,dz/(d||1)*9*f);hurtHuman(h,EPD(40*(.5+.5*f)),a,{});if(f>.5)epFx(h,'kd',.7)}
    this.fx({k:'land',x:r2(B.x),y:r2(B.y-B.r),z:r2(B.z)});if(this.railNear(B.x,B.z,1))B.mol=Math.max(B.mol,S.ph===3?22:0)},
  railNear(x,z,d){return EP.pow>.5&&KX.railNear(x,z,d)},
  // the beetle walks to its ball where it lies and takes it back
  fetch(a,dt,S){const B=S.b,c=a.c,r=B.r,dx=B.x-c.x,dz=B.z-c.z,d=Math.hypot(dx,dz)||1,want=khFwd(r);a.khPose='walk';
    if(d<want+.9){this.turn(a,dt,B.x,B.z,3);if(Math.abs(wrapA(Math.atan2(-dx,-dz)-a.yaw))<.5){B.st='held';S.pt=.6;this.fx({k:'grab',i:a.id})}return}
    this.walk(a,dt,S,[B.x-dx/d*want,B.y-r,B.z-dz/d*want],1.1)},
  // ---------- dirt kicked back (0.5 s): 15 and dust in the eyes of whoever is behind it ----------
  kickW(a,S){const c=a.c,yb=a.yaw+Math.PI,fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);S.mode='kw';S.mt=.5*EPTW();TELE.add({k:'r',x:c.x-fx*1.6,y:floorY(c.x,c.y,c.z),z:c.z-fz*1.6,yaw:yb,w:5.5,l:6,d:S.mt});this.fx({k:'w',i:a.id,s:'kk'})},
  kick(a){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-a.c.x,dz=h.c.z-a.c.z,d=Math.hypot(dx,dz);if(d>7.6||Math.abs(h.c.y-a.c.y)>2.5||(dx*fx+dz*fz)/(d||1)>-.4)continue;
      SCEN.pushHuman(h,dx/(d||1)*6,3,dz/(d||1)*6);hurtHuman(h,EPD(15),a,{});epFx(h,'du',2)}this.fx({k:'kick',i:a.id})},
  // ---------- phase 2: the split, the dust storm, the catwalks ----------
  splitW(a,S){S.mode='sw';S.mt=S.mt0=.8*EPTW();const c=a.c,p=this.ballPos(a,S),L=[];
    const H=SCEN.H.filter(h=>h.alive).sort((u,v)=>Math.hypot(u.c.x-c.x,u.c.z-c.z)-Math.hypot(v.c.x-c.x,v.c.z-c.z)).slice(0,3);
    for(let i=0;i<3;i++){let an;const h=H[i];if(h)an=Math.atan2(-(h.c.x-p.x),-(h.c.z-p.z));else an=a.yaw+(i-1)*.6;L.push(an)}
    S.split=L;for(const an of L)TELE.add({k:'r',x:p.x,y:floorY(p.x,c.y,p.z),z:p.z,yaw:an,w:1.9,l:22,d:S.mt});this.fx({k:'w',i:a.id,s:'sp'})},
  split(a,S){const p=this.ballPos(a,S),L=[];for(const an of S.split||[]){const dx=-Math.sin(an),dz=-Math.cos(an);L.push([r2(p.x+dx*S.b.r),r2(p.z+dz*S.b.r),r2(floorY(p.x,a.c.y,p.z)),r3(dx),r3(dz)])}
    S.b.w=Math.max(0,S.b.w-3);KX.fx({k:'spl',L});this.fx({k:'slam',x:r2(p.x),y:r2(a.c.y),z:r2(p.z)})},
  dustW(a,S){S.mode='dw';S.mt=1*EPTW();TELE.add({k:'c',x:a.c.x,y:floorY(a.c.x,a.c.y,a.c.z),z:a.c.z,r:10,d:S.mt,col:0xc88a40});this.fx({k:'w',i:a.id,s:'ds'})},
  // a catwalk perch to fly up to: one with people near enough below it to drop the ball on
  perchPick(a,S){const L=MAP.ez.perch;let best=-1,bs=1e9;for(let k=0;k<L.length;k++){if(k===S.perch)continue;const P=L[k];let n=0,dd=1e9;
      for(const h of SCEN.H){if(!h.alive||h.c.y>P.y-2)continue;const d=Math.hypot(h.c.x-P.x,h.c.z-P.z);if(d<11){n++;dd=Math.min(dd,d)}}
      if(!n)continue;const s=dd-n*3+Math.hypot(P.x-a.c.x,P.z-a.c.z)*.2+rr(0,4);if(s<bs){bs=s;best=k}}return best},
  flyW(a,S,k){const P=MAP.ez.perch[k];let t=null,bd=12;for(const h of SCEN.H){if(!h.alive||h.c.y>P.y-2)continue;const d=Math.hypot(h.c.x-P.x,h.c.z-P.z);if(d<bd){bd=d;t=h}}if(!t)return;
    S.perch=k;S.tp=this.landPt(t.c.x+t.c.vx*.4,t.c.y,t.c.z+t.c.vz*.4);S.mode='fw';S.mt=.8*EPTW();const T=S.mt+1.4+.8;
    TELE.add({k:'c',x:S.tp[0],y:S.tp[1],z:S.tp[2],r:4,d:T});this.fx({k:'w',i:a.id,s:'fl'})},
  // ---------- the modes ----------
  step(a,dt,S){const c=a.c,B=S.b;
    switch(S.mode){
    case 'cw':{a.khPose='kick';a.yaw=Math.atan2(-S.dx,-S.dz);if(S.mt<=0){S.mode='ch';S.mt=1.6;S.hits=new Set();S.lx=c.x;S.lz=c.z;S.chT=0;S.blk=0;this.fx({k:'roar',i:a.id,c:1})}break}
    case 'ch':{a.khPose='charge';const v=this.chSpd(S);a.kvx=S.dx*v;a.kvz=S.dz*v;a.mvx=a.mvz=0;a.yaw=Math.atan2(-S.dx,-S.dz);S.chT+=dt;const p=this.ballPos(a,S),r=B.r;
      if(Math.random()<dt*30)FX.spawn({x:c.x+rr(-.8,.8),y:c.y+.1,z:c.z+rr(-.8,.8),vy:rr(.3,.9),life:rr(.5,.9),s0:.3,s1:1,r:.4,g:.36,b:.3,a:.5,f:2,drag:2});
      for(const h of SCEN.H){if(!h.alive||S.hits.has(h))continue;const dh=Math.hypot(h.c.x-p.x,h.c.z-p.z);if(dh<r+.6&&Math.abs(h.c.y+.9-p.y)<r+1){S.hits.add(h);
          SCEN.pushHuman(h,S.dx*14,7,S.dz*14);hurtHuman(h,EPD((30+3*B.w)*(B.mol>0?1.2:1)),a,{claw:1});epFx(h,'kd',.8)}}
      // the ball meets a wall (or something big): it bounces
      if(B.st==='held'&&S.chT>.1){const w1=rayCast(p.x,p.y-r*.45,p.z,S.dx,0,S.dz,r+.35,SHOT_FILTER),w2=rayCast(p.x,p.y+r*.1,p.z,S.dx,0,S.dz,r+.35,SHOT_FILTER);
        if(w1&&Math.abs(w1.ny)<.5||w2&&Math.abs(w2.ny)<.5){this.wallHit(a,S);break}}
      const mv=Math.hypot(c.x-S.lx,c.z-S.lz);S.lx=c.x;S.lz=c.z;if(S.chT>.15&&mv<v*dt*.3)S.blk+=dt;else S.blk=0;if(S.blk>.08){this.wallHit(a,S);break}
      if(S.mt<=0){a.kvx*=.2;a.kvz*=.2;if(S.ccN>1)this.chainNext(a,S);else{S.mode='';S.pt=rr(.8,1.3);S.ccN=0}}break}
    case 'bw':{a.khPose='kick';a.yaw=Math.atan2(-S.dx,-S.dz);if(S.mt<=0){S.mode='bp';S.mt=.5;S.hits=new Set()}break}
    case 'bp':{a.khPose='charge';a.kvx=S.dx*9;a.kvz=S.dz*9;a.mvx=a.mvz=0;const p=this.ballPos(a,S),r=B.r;
      for(const h of SCEN.H){if(!h.alive||S.hits.has(h))continue;if(Math.hypot(h.c.x-p.x,h.c.z-p.z)<r+.6&&Math.abs(h.c.y+.9-p.y)<r+1){S.hits.add(h);SCEN.pushHuman(h,S.dx*10,5,S.dz*10);hurtHuman(h,EPD(20+2*B.w),a,{claw:1});epFx(h,'kd',.5)}}
      if(S.mt<=0){a.kvx*=.2;a.kvz*=.2;S.mode='';S.pt=.5}break}
    case 'bnc':{a.khPose='flail';const v=-8;a.kvx=S.dx*v;a.kvz=S.dz*v;
      for(const h of SCEN.H){if(!h.alive||S.hits.has(h))continue;const dx=h.c.x-c.x,dz=h.c.z-c.z;if(Math.hypot(dx,dz)<2.2&&Math.abs(h.c.y-c.y)<2&&(dx*S.dx+dz*S.dz)<0){S.hits.add(h);SCEN.pushHuman(h,-S.dx*9,4,-S.dz*9);hurtHuman(h,EPD(15),a,{claw:1})}}
      if(S.mt<=0){a.kvx=a.kvz=0;S.mode='stn';S.mt=1.1}break}
    case 'stn':{a.khPose='flail';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'tw':{a.khPose='lift';const t=S.tg;if(t&&t.alive)this.turn(a,dt,t.c.x,t.c.z,3);B.lift=clamp(1-S.mt/S.mt0,0,1);if(S.mt<=0){this.ballThrow(a,S,S.tp,1.1,'th');S.mode='tw2';S.mt=.5}break}
    case 'tw2':{a.khPose='';if(S.mt<=0){S.mode='';S.pt=.4}break}
    case 'kw':{a.khPose='kick';if(S.mt<=0){this.kick(a);S.mode='kw2';S.mt=.35}break}
    case 'kw2':{a.khPose='kick';if(S.mt<=0){S.mode='';S.pt=.5}break}
    case 'sw':{a.khPose='lift';B.lift=clamp(1-S.mt/S.mt0,0,1)*.7;if(S.mt<=0){B.lift=0;this.split(a,S);S.mode='sw2';S.mt=.5}break}
    case 'sw2':{a.khPose='';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'dw':{a.khPose='dust';if(S.mt<=0){S.mode='ds';S.mt=4;S.dustT=0;this.fx({k:'dst',i:a.id})}break}
    case 'ds':{a.khPose='dust';S.dustT-=dt;if(S.dustT<=0){S.dustT=.5;for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-c.x,h.c.z-c.z)<10&&Math.abs(h.c.y-c.y)<4){hurtHuman(h,EPD(3),a,{});epFx(h,'du',.9)}}
      if(S.mt<=0){S.mode='';S.pt=.8}break}
    // the short flight: up onto a catwalk, the ball dropped on the red ring, a moment up there without it, then down to the ball
    case 'fw':{a.khPose='dust';if(S.mt<=0){const P=MAP.ez.perch[S.perch];S.fly=1;S.mode='fa';const d=Math.hypot(P.x-c.x,P.z-c.z),T=clamp(.8+d/14,1,1.6);S.mt=T+2;
      epKin(a,P.x,P.y,P.z,T,3,()=>{S.fly=0;S.mode='fd';S.mt=.3;this.fx({k:'land',x:r2(P.x),y:r2(P.y),z:r2(P.z),s:1})});this.fx({k:'fly',i:a.id})}break}
    case 'fa':{a.khPose='fly';if(!a.kin&&S.mt<-1){S.mode='';S.fly=0}break}
    case 'fd':{a.khPose='perch';if(S.mt<=0){if(B.st==='held')this.ballThrow(a,S,S.tp,.8,'dr');S.mode='fp';S.mt=2.6}break}
    case 'fp':{a.khPose='perch';if(S.mt<=0){const tp=B.st==='loose'?[B.x,B.y-B.r,B.z]:S.tp||[c.x,0,c.z],n=navSnap(tp[0]+rr(-3,3),tp[1],tp[2]+rr(-3,3),5)||{x:tp[0],y:tp[1],z:tp[2]};
      S.mode='fdn';S.mt=3;S.fly=1;epKin(a,n.x,n.y,n.z,1,1.6,()=>{S.fly=0;S.mode='';S.pt=.5;this.fx({k:'land',x:r2(n.x),y:r2(n.y),z:r2(n.z)})});this.fx({k:'fly',i:a.id})}break}
    case 'fdn':{a.khPose='fly';if(!a.kin&&S.mt<-1){S.mode='';S.fly=0}break}
    // the phase flights: the wing cases open (1 s of buzzing), then away to the next part of the hall, the belly showing
    case 'pfw':{a.khPose='dust';if(S.mt<=0){const P=MAP.ez.pf[S.ph-1],d=Math.hypot(P[0]-c.x,P[2]-c.z),T=clamp(1.2+d/16,1.8,3.2);S.fly=1;S.mode='pfa';S.mt=T+2;
      epKin(a,P[0],P[1],P[2],T,7,()=>{S.fly=0;S.mode='pfl';S.mt=1.2;this.slam(a,4.5,20);this.fx({k:'roar',i:a.id,b:1});this.summon(a,S.ph===2?[['larva',2],['scrap',2]]:[['runner',3],['larva',2]])});this.fx({k:'fly',i:a.id,b:1})}break}
    case 'pfa':{a.khPose='fly';if(!a.kin&&S.mt<-1){S.mode='';S.fly=0}break}
    case 'pfl':{a.khPose='';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'down':{a.khPose='down';a.kvx*=.8;a.kvz*=.8;if(S.mt<=0){S.mode='';S.pt=.8;this.fx({k:'up',i:a.id})}break}
    case 'flail':{a.khPose='flail';if(S.mt<=0){S.mode='';S.pt=.4}break}
    // rolling a new ball at a heap (15 s): it grows from nothing; a heap set burning stops it
    case 'roll':{a.khPose='roll';const H=KX.heap[S.heap];if(!H||H.burnT>0){B.st='none';S.mode='';S.heap=-1;S.pt=1;break}B.st='grow';S.rb+=dt;B.r=lerp(.35,1.25,clamp(S.rb/15,0,1));
      const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),fw=khFwd(B.r);B.x=c.x+fx*fw;B.z=c.z+fz*fw;B.y=c.y+B.r;
      if(S.rb>=15){B.st='held';B.dur=B.durMax;B.w=0;B.wAcc=0;B.r=this.rr(0);S.mode='';S.heap=-1;S.pt=.6;this.fx({k:'nb',i:a.id});EP.say('kNew')}break}
    // the first meeting ends: a roar, then out through the hole in the gallery wall
    case 'ret':{a.khPose='dust';if(S.mt<=0){const g=MAP.ez.gal;S.mode='ret2';S.mt=3;S.fly=1;epKin(a,g.out[0],g.out[1],g.out[2],1.3,1.5,()=>{S.mode='gone';EP.meetEnd(a)});this.fx({k:'fly',i:a.id})}break}
    case 'ret2':{a.khPose='fly';break}
    // stage 1's glimpse: rolling its ball along the top of the scrap mountain, then over the back wall
    case 'cut':{a.khPose='walk';if(!a.kin){const C=MAP.ez.cut;S.mode='cut2';S.mt=3;S.fly=1;epKin(a,C.out[0],C.out[1],C.out[2],1.5,2.2,()=>{S.mode='gone';EP.despawn(a);if(NET.host)netEv('epdz',{i:[a.id]})})}break}
    case 'cut2':{a.khPose='fly';break}
    default:{if(!a.kin&&S.mt<-1){S.mode='';S.fly=0}}}},
  chainNext(a,S){S.ccN--;const t=this.target(a,S);if(!t){S.mode='';S.ccN=0;S.pt=1;return}this.chargeW(a,t,S,true)},
  slam(a,R,dmg){const c=a.c;SCEN.slamFx(c.x,c.y,c.z);if(NET.host)netEv('scsl',{x:r2(c.x),y:r2(c.y),z:r2(c.z)});
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,d=Math.hypot(dx,dz);if(d>R||Math.abs(h.c.y-c.y)>2.5)continue;const f=1-d/R;
      SCEN.pushHuman(h,dx/(d||1)*9*f,3+4*f,dz/(d||1)*9*f);hurtHuman(h,EPD(dmg*(.5+.5*f)),a,{})}},
  summon(a,L){const k=a.kh&&a.kh.enr?2:1;let s=0;for(const [zc,n] of L)for(let i=0;i<n*k;i++)if(SCEN.spawn(zc))s++;return s},
  // ---------- the ball every frame (host): the weight, molten iron, scrap picked up, people run over ----------
  ballTick(a,dt,S){const B=S.b,c=a.c;
    if(B.st==='air'&&B.air){const A=B.air;A.t+=dt;const u=Math.min(1,A.t/A.T);B.x=lerp(A.x0,A.x1,u);B.z=lerp(A.z0,A.z1,u);B.y=lerp(A.y0,A.y1,u)+4*A.h*u*(1-u);if(u>=1)this.ballLand(a,S)}
    else if(B.st==='held'){const p=this.ballPos(a,S);B.x=p.x;B.y=p.y;B.z=p.z}
    if(B.mol>0){B.mol-=dt;if(B.mol<=0){B.mol=0;this.fx({k:'mol',i:a.id,o:0})}}
    if(S.enc||EP.st!==4||EP.ph!=='run'){B.touch={};return}
    // passing a runner in phase 3: the ball turns molten (and leaves fire where it rolls)
    if(S.ph===3&&B.st==='held'&&this.railNear(B.x,B.z,B.r*.5+.6)){if(B.mol<=0)this.fx({k:'mol',i:a.id,o:1});B.mol=22}
    // scrap within reach of the ball sticks to it every 20 s
    if(S.cd.sc<=0&&B.st==='held'&&B.mol<=0){S.cd.sc=3;for(const S0 of KX.scrap)if(S0.alive&&Math.hypot(S0.x-B.x,S0.z-B.z)<B.r+5){KX.scrapGone(S0,1);B.w=Math.min(10,B.w+1);S.cd.sc=20;break}}
    // walking into people: a shove and a knock (the charge's own hits are its mode's)
    const sp=Math.hypot(c.vx,c.vz);if(B.st==='held'&&S.mode!=='ch'&&sp>2.2)for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-B.x,h.c.z-B.z);if(d>B.r+.55||Math.abs(h.c.y+.9-B.y)>B.r+1)continue;
      if(G.t<(B.touch[h.id]||0))continue;B.touch[h.id]=G.t+.9;const dx=h.c.x-B.x,dz=h.c.z-B.z,l=Math.hypot(dx,dz)||1;SCEN.pushHuman(h,dx/l*6,3,dz/l*6);hurtHuman(h,EPD(12*(B.mol>0?1.5:1)),a,{claw:1})}},
  // a blast at (x, y, z): the ball takes its share if it is in reach (host)
  blastAt(x,y,z,R,amt){const b=EP.bossA();if(!b||!b.kh||!b.alive)return;const S=b.kh,B=S.b;if(B.st==='none'||B.st==='grow'||S.invT>0&&!S.enc)return;const p=this.ballPos(b,S),d=Math.hypot(p.x-x,p.z-z)-B.r;
    if(d>R||Math.abs(p.y-y)>R+B.r)return;this.ballHit(b,S,amt*(.4+.6*(1-Math.max(0,d)/R)),0)},
  ballHit(a,S,dmg,bullets){const B=S.b;if(B.st==='none'||B.st==='grow'||S.idle&&!S.enc||S.enc===2)return;B.dur-=dmg;
    if(bullets){B.wAcc+=bullets;while(B.wAcc>=1500&&B.w<10){B.wAcc-=1500;B.w++;if(B.w%3===0)EP.say('kHeavy')}if(B.w>=10)B.wAcc=0}
    if(B.dur<=0)this.ballBreak(a,S,'hit')},
  // the ball comes apart (blasts, fire, the ladle's iron): KHEPRI flails 10 s, then goes for a heap; in the first meeting it leaves
  ballBreak(a,S,why){const B=S.b;if(B.st==='none'||B.st==='grow')return;const p=this.ballPos(a,S);B.st='none';B.dur=0;B.w=0;B.wAcc=0;B.mol=0;B.lift=0;B.air=null;
    this.fx({k:'bk',x:r2(p.x),y:r2(p.y),z:r2(p.z),r:r2(B.r),m:why==='ladle'?1:0});EP.say(why==='ladle'?'kMelt':'kBreak');
    if(S.enc===1){this.retreat(a);return}
    if(S.mode&&S.mode!=='down'&&S.mode[0]!=='p'&&S.mode!=='fa'&&S.mode!=='fdn'&&S.mode!=='fp'){S.mode='flail';S.mt=10}else S.flailNext=1;a.kvx=a.kvz=0},
  // no ball: to the nearest heap that is not burning, then roll a new one there
  rebuild(a,dt,S){const B=S.b,c=a.c;if(S.flailNext){S.flailNext=0;S.mode='flail';S.mt=10;return}
    let H=S.heap>=0?KX.heap[S.heap]:null;if(!H||H.burnT>0){let bd=1e9;H=null;for(const h of KX.heap){if(h.burnT>0)continue;const d=Math.hypot(h.fx-c.x,h.fz-c.z);if(d<bd){bd=d;H=h}}S.heap=H?H.i:-1}
    if(!H){a.khPose='flail';return}const d=Math.hypot(H.fx-c.x,H.fz-c.z);
    if(d<1.3){this.turn(a,dt,H.x,H.z,3);if(Math.abs(wrapA(Math.atan2(-(H.x-c.x),-(H.z-c.z))-a.yaw))<.3){S.mode='roll';S.mt=99;S.rb=0;B.st='grow';B.r=.35;this.fx({k:'rb',i:a.id})}return}
    this.walk(a,dt,S,[H.fx,0,H.fz],1.15)},
  // ---------- stagger, downs, the ladle ----------
  grog(a,v){const S=a.kh;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='gone'||S.mode==='roll'||S.mode[0]==='p'||S.fly)return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6)}},
  // down: thrown on its back, legs in the air, the belly up (the ball rolls off in front)
  down(a,t){const S=a.kh,B=S.b;if(S.mode==='gone'||S.mode[0]==='p'||S.fly)return;a.kin=null;S.mode='down';S.mt=t;S.grog=0;S.ccN=0;a.kvx=a.kvz=0;
    if(B.st==='held'){const p=this.ballPos(a,S);B.st='loose';B.lift=0;B.x=p.x;B.z=p.z;B.y=floorY(p.x,p.y,p.z)+B.r}this.fx({k:'dn',i:a.id});EP.say('kDown')},
  ladleHit(a,S){if(S.enc||S.invT>0)return;damageActor(a,a.maxHp*.12,null,{w:'ladle',fire:1,dir:[0,0,0],kb:0,stag:0,x:a.c.x,y:a.c.y+1,z:a.c.z});if(!a.alive)return;
    S.grog=0;S.mode='';a.kin=null;S.fly=0;this.down(a,8);EP.say('kLadle')},
  // ---------- phases ----------
  floorHit(a){const S=a.kh;if(S.enc){if(S.mode!=='ret'&&S.mode!=='ret2'&&S.mode!=='gone'){S.invT=99;this.retreat(a)}return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  retreat(a){const S=a.kh;S.invT=99;S.mode='ret';S.mt=.8;S.ccN=0;a.kvx=a.kvz=0;this.fx({k:'roar',i:a.id});EP.say('kRet')},
  // a phase change: everybody back up, a fresh start for the cooldowns; the flight to the next part of the hall (no invulnerability:
  // the belly shows all the way)
  toPhase(a,n){const S=a.kh,B=S.b;S.ph=n;S.grog=0;S.ccN=0;a.kvx=a.kvz=0;S.perch=-1;Object.assign(S.cd,{ch:3,th:6,kk:3,sp:4,ds:5,fl:8,cc:4});EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();
    if(B.st==='loose'||B.st==='air'){B.st='held';B.air=null}if(B.st==='none'||B.st==='grow'){B.st='held';B.dur=B.durMax*.6;B.w=0;B.r=this.rr(0)}S.mode='pfw';S.mt=1*EPTW();a.kin=null;S.fly=0;EP.say(n===2?'kP2':'kP3')},
  // ---------- host: damage in (before the game applies it) and after ----------
  hit(t,dmg,src,o){const S=t.kh;if(S.invT>0||S.idle||S.enc===2||S.mode==='gone'||S.mode==='ret'||S.mode==='ret2')return 0;o.kb=0;o.up=0;const B=S.b;
    if(o.w==='ladle')return this.floor(t,S,dmg,src,o);
    const fire=khFire(o),he=!!o.he,held=B.st==='held'||B.st==='loose'||B.st==='air';let mul=1;
    // what hits the ball stays in the ball (bullets: a tenth, and weight)
    if(held&&!he&&!fire&&o.x!=null){const p=this.ballPos(t,S);if(Math.hypot(o.x-p.x,o.y-p.y,o.z-p.z)<B.r+.35){this.ballHit(t,S,dmg*.1,dmg);if(src&&src.isPlayer)HUD.hitmark(false);return 0}}
    // fire licks the ball first
    if(fire&&B.st==='held'){this.ballHit(t,S,dmg,0);mul*=.5}
    // the joint under the horn ×2 (not the gun's own headshot multiplier)
    if(o.hs){const W=WPN[o.w];mul*=2/((W&&W.hs)||3)}
    // the belly: in flight, or on its back
    if(S.fly||S.mode==='down'){mul*=S.mode==='down'?1.8:2.5;if(!he)this.grog(t,dmg/(t.maxHp*.01)*1.5)}
    if(S.mode==='flail'||S.mode==='roll')mul*=1.5;if(he)this.grog(t,15);if(S.enc===1)mul*=.5;
    return this.floor(t,S,dmg*mul,src,o)},
  floor(t,S,out,src,o){const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    const fl=t.maxHp*(S.enc?.8:S.ph===1?KH_PH[1]:S.ph===2?KH_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}return out},
  // ---------- every page: the hit volumes (a.epRay) ----------
  // the ball (a sphere), the joint under the horn (a sphere at the head), the shell (a box in the beetle's frame)
  ray(a,ox,oy,oz,dx,dy,dz,tmax){const V=a.khV;if(!V)return null;let bt=tmax,part=null;
    if(V.bv){const t=raySphere(ox,oy,oz,dx,dy,dz,V.bx,V.by,V.bz,V.br,bt);if(t>=0&&t<bt){bt=t;part='ball'}}
    {const t=raySphere(ox,oy,oz,dx,dy,dz,a.head.x,a.head.y,a.head.z,.44,bt);if(t>=0&&t<bt){bt=t;part='head'}}
    const c=a.c,cy=Math.cos(a.yaw),sy=Math.sin(a.yaw),px=ox-c.x,pz=oz-c.z;// local: u right, w forward
    const ou=px*cy-pz*sy,ow=-px*sy-pz*cy,du=dx*cy-dz*sy,dw=-dx*sy-dz*cy,y0=V.dn?.1:.3,y1=V.dn?1.6:1.85,yo=V.fy||0;
    const tb=rayAABB(ou,oy-c.y-yo,ow,du,dy,dw,-1.3,y0,-2.2,1.3,y1,1.7,bt);if(tb>=0&&tb<bt){bt=tb;part='body'}
    return part?{t:bt,part}:null},
  // ---------- the boss stage's own devices: the two ladle levers ----------
  useNear(h){if(!EP.on||EP.id!==3||!MAP.ez.ladle)return -1;for(let i=0;i<2;i++)if(LADLE.near(h,i))return i;return -1},
  useInfo(i,L){const st=LADLE.st;if(st==='empty')return {act:(L?'The ladle is refilling — ':'래들 채우는 중 — ')+Math.ceil(LADLE.cd)+(L?'s':'초'),p:0,x:1};
    if(st!=='full')return {act:L?'Pouring…':'쇳물 붓는 중…',p:1,x:1};
    let both=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+(1-i)&&LADLE.near(h,1-i))both=1;
    return {act:(L?'tilt the ladle':'래들 기울이기')+(both?(L?' — both levers: 2 s':' — 양쪽 같이: 2초'):(L?' — alone: 5 s':' — 혼자: 5초'))+(LADLE.p>.5?(L?' · time it as it comes':' · 케프리가 올 때 끝까지'):''),p:LADLE.p,x:0}},
  // ---------- bots ----------
  botGoal(a,i){const b=EP.bossA();if(!b||!b.kh||EP.ph!=='run')return null;const S=b.kh,B=S.b,L=MAP.ez.ladle;
    // the ladle: the two bots nearest the levers mind them while KHEPRI is near the pour spot
    if(LADLE.st==='full'&&this.spotNear(b)){const j=this.levBot(a);if(j>=0){const v=L.lev[j];return [v.x+v.bx,0,v.z+v.bz,.35]}
      if(B.st!=='none'&&S.mode!=='down'){const dx=L.spot[0]-b.c.x,dz=L.spot[2]-b.c.z,l=Math.hypot(dx,dz)||1,sd=(i%2?1:-1)*1.6;return [clamp(L.spot[0]+dx/l*6.5-dz/l*sd,11,30.5),0,clamp(L.spot[2]+dz/l*6.5+dx/l*sd,4,40),1.2]}}
    // its ball gone (flailing, rolling a new one), down on its back: everybody closes in
    if(B.st==='none'||B.st==='grow'||S.mode==='down'){const an=i*1.7+.4;return [b.c.x+Math.cos(an)*7,0,b.c.z+Math.sin(an)*7,2]}
    // otherwise its sides, 12 m out (never the front: the charge; never right behind: the dirt)
    const side=i%2?1:-1,an=a.id*.37%1,ya=b.yaw+side*(Math.PI/2+(an-.5)*.7),r=11+(i%3)*1.5,Z=EP.zone('D').box;
    return [clamp(b.c.x-Math.sin(ya)*r,Z[0]+2,Z[2]-2),0,clamp(b.c.z-Math.cos(ya)*r,Z[1]+2,Z[3]-2),1.8]},
  spotNear(b){const L=MAP.ez.ladle;return Math.hypot(b.c.x-L.spot[0],b.c.z-L.spot[2])<13||b.kh&&b.kh.ph===3},
  // the lever this bot minds (the bot nearest each lever), -1 if none
  levBot(a){const L=MAP.ez.ladle;for(let j=0;j<2;j++){const v=L.lev[j];let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const o=this.levOf(h,j);if(o)continue;const d=Math.hypot(h.c.x-v.x,h.c.z-v.z);if(d<bd){bd=d;best=h}}if(best===a)return j}return -1},
  levOf(h,j){if(j===0)return false;const L=MAP.ez.ladle,v=L.lev[0];let best=null,bd=1e9;for(const q of SCEN.H){if(!q.alive||!q.bot)continue;const d=Math.hypot(q.c.x-v.x,q.c.z-v.z);if(d<bd){bd=d;best=q}}return best===h},
  goalTag(b){const S=b.kh;if(!S)return '';return (S.b.st==='none'||S.b.st==='grow'?'n':'')+(S.mode==='down'?'d':'')+(LADLE.st==='full'&&this.spotNear(b)?'l':'')},
  // (the levers pulled most of the way, then the rest once KHEPRI is on the spot)
  botUse(a){const b=EP.bossA();if(!b||!b.kh)return -1;const j=this.useNear(a);if(j<0||LADLE.st!=='full')return -1;const L=MAP.ez.ladle;
    return LADLE.p<.82||Math.hypot(b.c.x-L.spot[0],b.c.z-L.spot[2])<6.5?j:-1},
  // a red warning, the charge coming its way, a little ball, a runner, fire, a swarm: out of it
  danger(a){if(!(EP.st===4||EP.meet&&EP.meet.st==='on'))return null;const c=a.c,b=EP.bossA();
    if(b&&b.kh&&b.kh.mode==='ch'){const S=b.kh,dx=c.x-b.c.x,dz=c.z-b.c.z,al=dx*S.dx+dz*S.dz,sd=-dx*S.dz+dz*S.dx;if(al>0&&al<18&&Math.abs(sd)<S.b.r+1.6){const s=sd>=0?1:-1;return {ax:-S.dz*s,az:S.dx*s}}}
    for(const M of KX.mini){const dx=c.x-M.x,dz=c.z-M.z,al=dx*M.dx+dz*M.dz,sd=-dx*M.dz+dz*M.dx;if(al>-.5&&al<10&&Math.abs(sd)<1.6){const s=sd>=0?1:-1;return {ax:-M.dz*s,az:M.dx*s}}}
    for(const F of KX.fire)if(Math.hypot(c.x-F.x,c.z-F.z)<F.r+.8&&Math.abs(c.y-F.y)<1.2){const dx=c.x-F.x,dz=c.z-F.z,l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}
    for(const S0 of KX.swarm)if(Math.hypot(c.x-S0.x,c.z-S0.z)<S0.r+.6){const dx=c.x-S0.x,dz=c.z-S0.z,l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}
    for(const G0 of KX.gas)if(G0.t>0&&Math.hypot(c.x-G0.x,c.z-G0.z)<2.4){const dx=c.x-G0.x,dz=c.z-G0.z,l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}
    if(EP.pow>.5&&c.y<.6){const RL=MAP.ez.rails;for(const r of RL)if(c.x>r[0]-.9&&c.x<r[2]+.9&&c.z>r[1]-.9&&c.z<r[3]+.9){const cz=(r[1]+r[3])/2,cx=(r[0]+r[2])/2,lx=r[2]-r[0]>r[3]-r[1];return lx?{ax:0,az:c.z>=cz?1:-1}:{ax:c.x>=cx?1:-1,az:0}}}
    const L=MAP.ez.ladle;if(L&&(LADLE.st==='pour'||LADLE.st==='tilt'||LADLE.st==='empty'&&LADLE.pT>0)&&Math.hypot(c.x-L.spot[0],c.z-L.spot[2])<L.r+.8){const dx=c.x-L.spot[0],dz=c.z-L.spot[2],l=Math.hypot(dx,dz)||1;return {ax:dx/l,az:dz/l}}
    return null},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==3)return;LADLE.update(dt);if(NET.cli){const f=EP.bf;if(f&&f.ld)LADLE.unpack(f.ld)}else if(LADLE.m)LADLE.hostTick(dt);this.ballVis(dt)},
  // the ball's mesh: wherever the ball is, rolling as it moves; it glows when molten
  ballVis(dt){const b=EP.bossA();let K=this.KB;if(!K){const m=new THREE.Mesh(gunGeo('khBall'),this.ballMat());m.frustumCulled=false;R.scene.add(m);K=this.KB={m,q:new THREE.Quaternion(),lx:0,lz:0,ly:0,air:null,st:'',light:null,trD:0}}
    let st='none',r=1.25,mol=0,x=0,y=0,z=0;
    if(b&&b.alive&&EP.st>=1){const S=!NET.cli?b.kh:null,f=EP.bf&&EP.bf.id===b.id?EP.bf:null;
      if(S){st=S.b.st;r=S.b.r;mol=S.b.mol>0?1:0}else if(f){st=KH_BST[f.bs]||'held';r=f.bs===4?f.gr:this.rr(f.w);mol=f.f&64?1:0}
      if(st==='air'&&NET.cli&&K.air){const A=K.air;A.t+=dt;const u=Math.min(1,A.t/A.T);x=lerp(A.x0,A.x1,u);z=lerp(A.z0,A.z1,u);y=lerp(A.y0,A.y1,u)+4*A.h*u*(1-u);if(u>=1)K.air=null}
      else if(st!=='none'){const p=this.ballPos(b,S);x=p.x;y=p.y;z=p.z}}
    const vis=st!=='none';K.m.visible=vis;if(b){const V=b.khV||(b.khV={});V.bv=vis&&st!=='grow';V.bx=x;V.by=y;V.bz=z;V.br=r}
    if(!vis){K.st=st;if(K.light){K.light.dead=true;K.light=null}return}
    const dx=x-K.lx,dz=z-K.lz,dd=Math.hypot(dx,dz);if(K.st!==st||dd>6){K.lx=x;K.lz=z}else if(dd>1e-3&&st!=='air'){_khQ.setFromAxisAngle(_khV.set(dz/dd,0,-dx/dd),dd/r);K.q.premultiply(_khQ);K.lx=x;K.lz=z}
    else if(st==='air'){_khQ.setFromAxisAngle(_khV.set(1,0,0),dt*3);K.q.premultiply(_khQ);K.lx=x;K.lz=z}
    K.st=st;K.m.position.set(x,y,z);K.m.quaternion.copy(K.q);K.m.scale.setScalar(r);const U=K.m.material.uniforms;sampleProbe(x,y,z,U.uProbe.value);
    if(mol){U.uTint.value.set(1,.42,.08,.5+.08*Math.sin(G.t*9));U.uEmisA.value=2.4;if(!K.light)K.light=DL.add(x,y,z,'#ff7a2a',9,1.8,0,{flick:.3});K.light.x=x;K.light.y=y;K.light.z=z;
      // its trail: a patch of fire every 1.1 m rolled (every page draws it, the host's hurts)
      K.trD+=dd;if(K.trD>1.1&&st==='held'){K.trD=0;KX.fireAdd(x,y-r,z,1.25,5,false)}
      if(Math.random()<dt*25)FX.spawn({x:x+rr(-r,r)*.7,y:y+rr(-r,r)*.6,z:z+rr(-r,r)*.7,vx:rr(-1,1),vy:rr(.5,2),vz:rr(-1,1),life:rr(.3,.6),s0:.08,s1:.03,r:1,g:rr(.6,.8),b:.2,f:0,grav:4,add:1})}
    else{U.uTint.value.set(0,0,0,0);U.uEmisA.value=1;if(K.light){K.light.dead=true;K.light=null}}
    // the rumble as it rolls
    if(st==='held'&&b){const sp=Math.hypot(b.c.vx,b.c.vz);K.rollT=(K.rollT||0)-dt;if(sp>1.5&&K.rollT<=0){K.rollT=1.35;AU.at('kroll',x,y,z,{vol:clamp(sp/12,.25,1),range:60,rate:1.1-r*.06})}}},
  stageClear(){},
  clear(){if(this.KB){R.scene.remove(this.KB.m);this.KB.m.material.dispose();if(this.KB.light)this.KB.light.dead=true;this.KB=null}},
  // the boss bar (flags: 1 belly up (in flight), 2 down, 4 ball broken (flailing), 8 invulnerable, 16 enraged, 32 first meeting, 64 molten,
  // 128 rolling a new ball)
  bsOf(b){const S=b.kh,B=S.b,p=this.ballPos(b,S);return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.fly?1:0)|(S.mode==='down'?2:0)|(S.mode==='flail'?4:0)|(S.invT>0&&!S.enc?8:0)|(S.enr?16:0)|(S.enc?32:0)|(B.mol>0?64:0)|(B.st==='grow'?128:0),
    bs:Math.max(0,KH_BST.indexOf(B.st)),bx:p.x,by:p.y,bz:p.z,w:B.w,dur:B.durMax?B.dur/B.durMax:0,lift:B.lift,gr:B.r,pose:Math.max(0,KH_POSE.indexOf(b.khPose||'')),ld:LADLE.pack()}},
  bsPack(b){if(!b.kh)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.bs,Math.round(B.bx*100),Math.round(B.by*100),Math.round(B.bz*100),B.w,Math.round(B.dur*100),Math.round(B.lift*100),Math.round(B.gr*100),B.pose,B.ld]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],bs:B[5],bx:B[6]/100,by:B[7]/100,bz:B[8]/100,w:B[9],dur:B[10]/100,lift:B[11]/100,gr:B[12]/100,pose:B[13],ld:B[14]||null}},
  hud(B,L){const f=B.f,nob=B.bs===3||B.bs===4;
    return {ss:f&8?(L?'INVULNERABLE':'무적'):f&2?(L?'ON ITS BACK — the belly!':'뒤집혔다 — 배를 노려라!'):f&1?(L?'IN FLIGHT — the belly ×2.5':'날고 있다 — 배 2.5배'):f&4?(L?'NO BALL — ×1.5':'공이 깨졌다 — 피해 1.5배'):f&128?(L?'ROLLING A NEW BALL':'새 공을 굴리는 중'):f&64?(L?'MOLTEN BALL!':'쇳물 공!'):f&16?(L?'ENRAGED':'광폭화'):'',
      cls:f&64||f&16?'r':f&2||f&1||f&4||f&128?'y':'',sp:(f&32?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(nob?(L?' · NO BALL':' · 공 없음'):(L?' · WEIGHT ':' · 무게 ')+B.w),g1:B.grog/(B.gmax||100),g2:nob?null:B.dur}},
  // the levers (hot while KHEPRI is near the pour spot), the pour spot, drums and gas valves next to the ball
  markers(list,L,P){const b=EP.bossA(),E=MAP.ez,Ld=E.ladle,Bs=EP.bs();
    if(Ld){const near=b&&Math.hypot(b.c.x-Ld.spot[0],b.c.z-Ld.spot[2])<11;
      for(let i=0;i<2;i++){const v=Ld.lev[i],d=Math.hypot(v.x-P.c.x,v.z-P.c.z);if(LADLE.st==='full'){if(near)list.push([v.x,2.2,v.z,L?'⚡ PULL THE LEVER!':'⚡ 래들 레버!','p hot']);else if(d<30)list.push([v.x,2.2,v.z,L?'ladle lever':'래들 레버','p'])}
        else if(LADLE.st==='empty'&&d<24)list.push([v.x,2.1,v.z,(L?'ladle ':'래들 ')+Math.ceil(LADLE.cd)+(L?'s':'초'),'s'])}
      if(LADLE.st==='full'&&near)list.push([Ld.spot[0],1,Ld.spot[2],L?'POUR SPOT':'쇳물 낙하 지점','s'])}
    if(Bs&&Bs.bs!==3&&Bs.bs!==4){const bx=Bs.bx,bz=Bs.bz;
      for(const D of KX.drums)if(D.alive&&Math.hypot(D.x-bx,D.z-bz)<5&&Math.hypot(D.x-P.c.x,D.z-P.c.z)<40)list.push([D.x,D.y+1.5,D.z,L?'💥 SHOOT':'💥 쏴!','p hot']);
      for(const G0 of KX.gas)if(G0.cd<=0&&Math.hypot(G0.x-bx,G0.z-bz)<3.6&&Math.hypot(G0.x-P.c.x,G0.z-P.c.z)<40)list.push([G0.px,G0.y+2,G0.pz,L?'🔥 SHOOT THE VALVE':'🔥 밸브를 쏴!','p hot'])}},
  // ---------- every page: before the rig is posed (the state from the host's own data, or the snapshot) ----------
  pre(a,dt){const S=!NET.cli?a.kh:null,f=EP.bf&&EP.bf.id===a.id?EP.bf:null;let pose=a.khPose||'',fly=0,down=0,inv=false,enr=false,lift=0;
    if(S){fly=S.fly?1:0;down=S.mode==='down'?1:0;inv=S.invT>0&&!S.enc;enr=S.enr;lift=S.b.lift}
    else if(f){pose=KH_POSE[f.pose]||'';fly=f.f&1?1:0;down=f.f&2?1:0;inv=!!(f.f&8);enr=!!(f.f&16);lift=f.lift}
    a.khPose=pose;a.khFly=approach(a.khFly||0,fly||pose==='dust'?(pose==='dust'?.45:1):0,dt*4);a.khDn=approach(a.khDn||0,a.alive?down:0,dt*2.2);a.khLift=lift;a.khInv=inv;a.khEnr=enr;
    a.epAimY=a.khDn>.5?.9:1.05;a.epPri=down||pose==='flail'||pose==='roll'||fly?.3:.6;a.epHide=false;a.epRay=a.epRay||((ox,oy,oz,dx,dy,dz,t)=>KHEPRI.ray(a,ox,oy,oz,dx,dy,dz,t));a.epRayZc='khepri';
    const V=a.khV||(a.khV={});V.dn=a.khDn>.5;V.fy=0},
  // the beetle: its own meshes on the rig's group (the humanoid placeholder hidden), posed every frame
  rigX(ch){const mat=matGun(),X={mat,root:new THREE.Group(),body:new THREE.Group(),legs:[],t:0,wp:0};ch.grp.add(X.root);X.root.add(X.body);
    const mk=(id,parent,x,y,z)=>{const m=new THREE.Mesh(gunGeo(id),mat);m.frustumCulled=false;const g=new THREE.Group();g.position.set(x||0,y||0,z||0);g.add(m);parent.add(g);return g};
    X.shell=mk('khBody',X.body);X.elyL=mk('khElyL',X.body,-.04,1.66,-.32);X.elyR=mk('khElyR',X.body,.04,1.66,-.32);X.wingL=mk('khWingL',X.body,-.3,1.45,-.15);X.wingR=mk('khWingR',X.body,.3,1.45,-.15);
    X.head=mk('khHead',X.body,0,.85,-1.5);for(const g of [X.elyL,X.elyR,X.wingL,X.wingR,X.head])g.rotation.order='YXZ';
    // legs: front (spades), middle, hind, out from under the body, the knees up level with its sides; side -1 left, +1 right;
    // tripod groups; fl the thigh's length, tl the shin's (to the claws)
    [[-1.15,.6,.75,'khTibF',.85,1.2],[-.15,.6,.8,'khTib',.95,1.24],[.85,.6,.78,'khTib',1.05,1.24]].forEach(([z,y,x,tib,fl,tl],pi)=>{for(const sd of [-1,1]){const hip=new THREE.Group();hip.position.set(sd*x,y,z);hip.rotation.order='YZX';X.body.add(hip);
      const fm=new THREE.Mesh(gunGeo('khFem'),mat);fm.scale.set(fl,1,1);fm.frustumCulled=false;hip.add(fm);const knee=new THREE.Group();knee.position.set(.92*fl,0,0);hip.add(knee);const tm=new THREE.Mesh(gunGeo(tib),mat);tm.frustumCulled=false;knee.add(tm);
      X.legs.push({hip,knee,sd,pi,hy:y,kl:.92*fl,tl,grp:(pi+(sd>0?0:1))%2,base:[.62,.05,-.55][pi]})}});
    ch.mesh.visible=false;return X},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_khepri')return;ch.mesh.visible=false;const X=ch.khX||(ch.khX=this.rigX(ch)),vis=ch.grp.visible,dt=Math.min(.05,G.t-(X.t||G.t)||.016);X.t=G.t;
    X.root.visible=vis;X.mat.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value);const P=a.khPose||'',sp=Math.hypot(a.c.vx,a.c.vz),T=G.t;
    // the gait: two tripods, a stride clock tied to the speed (faster in a charge)
    X.wp+=dt*(sp>.3?sp*1.5+2:P==='roll'?5:0)*(P==='charge'?1.3:1);const fl=a.khFly||0,dn=a.khDn||0,lift=a.khLift||0;
    // standing, each shin is angled out just so its claws reach the ground (fu lifts a foot off it in the stride)
    for(const L of X.legs){let sw=0,up=0,fu=0,bend=null;const ph=X.wp+L.grp*Math.PI;
      if(dn>.4){sw=Math.sin(T*9+L.pi*2+L.sd)*.5;up=Math.sin(T*11+L.pi)*.4;bend=-.4}
      else if(fl>.5){sw=-.25-L.pi*.12;up=-.45;bend=.3}
      else if(P==='kick'&&L.pi===2){sw=-.6+Math.sin(T*28)*.45;fu=.35}
      else if(P==='flail'){sw=Math.sin(T*10+L.pi*1.7+L.sd)*.45;up=Math.abs(Math.sin(T*8+L.pi))*.3;fu=.3}
      else if(sp>.3||P==='roll'){sw=Math.sin(ph)*.34;fu=Math.max(0,Math.cos(ph))*.34}
      else{sw=Math.sin(T*.7+L.pi*2.1+L.sd)*.04}
      if(L.pi===0&&lift>0&&dn<.4){up+=lift*.8;sw-=lift*.4}
      const a1=.6+up;if(bend==null)bend=Math.acos(clamp((L.hy+L.kl*Math.sin(a1)-fu)/L.tl,0,1));
      const by=L.base+sw;L.hip.rotation.set(0,L.sd>0?by:Math.PI-by,a1);L.knee.rotation.z=-a1+bend}
    // the wing cases open for flight (and buzz half open in the dust storm); the hind wings beat
    const eo=fl;X.elyL.rotation.set(-.25*eo,0,-.95*eo);X.elyR.rotation.set(-.25*eo,0,.95*eo);const wv=eo>.25;X.wingL.visible=X.wingR.visible=wv&&vis;
    if(wv){const fb=Math.sin(T*55)*.55;X.wingL.rotation.set(0,-.25,-(.2+fb)*eo);X.wingR.rotation.set(0,.25,(.2+fb)*eo)}
    // the head: raised to lift the ball, nodding as it walks
    X.head.rotation.set(lift*.45+(sp>.3?Math.sin(X.wp*2)*.04:0),0,0);
    // on its back: rolled over
    X.body.rotation.set(0,0,dn*Math.PI);X.body.position.set(0,dn*1.82+Math.sin(dn*Math.PI)*.6+(fl>.5?Math.sin(T*9)*.05:0),0);
    // lifting the ball it rears up on its hind legs (pivoting about the hind feet, 1.6 m back), the ball up on its raised shovel
    const rear=P==='lift'&&dn<.4?lift*.3:0;X.root.rotation.x=P==='charge'?.06:rear;X.root.position.set(0,1.6*Math.sin(rear),1.6*(1-Math.cos(rear)));
    // the hit sphere of the head joint, the tints
    ch.grp.updateMatrixWorld(true);X.head.updateMatrixWorld(true);_khW.set(0,.1,-.2).applyMatrix4(X.head.matrixWorld);a.head.copy(_khW);a.headR=.44;
    const U=X.mat.uniforms;U.uEmisA.value=a.alive?1.5+.4*Math.sin(T*3):.2;if(a.khInv)U.uTint.value.set(1,.95,.85,.16+.08*Math.sin(T*30));else if(a.khEnr)U.uTint.value.set(.9,.1,.05,.14+.06*Math.sin(T*9));else if(a.frozen>0)U.uTint.value.set(.55,.8,1,.5);else U.uTint.value.set(0,0,0,0)},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI(),E=MAP.ez;
    switch(m.k){
    case 'w':if(a){const s=m.s,x=a.c.x,y=a.c.y+1,z=a.c.z;if(s==='ch'){AU.at('zgrowl',x,y,z,{vol:1,range:80,rate:.5});AU.at('imp_dirt',x,y,z,{vol:1,range:40,rate:.6})}else if(s==='th')AU.at('zatk',x,y,z,{vol:1,range:70,rate:.55});
      else if(s==='kk')AU.at('imp_dirt',x,y,z,{vol:1,range:40,rate:.8});else if(s==='bp')AU.at('zgrowl',x,y,z,{vol:.9,range:50,rate:.75});else if(s==='sp')AU.at('zroar',x,y,z,{vol:1,range:90,rate:.6});else if(s==='ds'||s==='fl')AU.at('kbuzz',x,y+.5,z,{vol:1,range:80,rate:s==='ds'?.8:1})}break;
    case 'roar':if(a){AU.at('zroar',a.c.x,a.c.y+1.5,a.c.z,{vol:1,range:110,rate:m.b?.5:m.c?.62:.7});if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<18)FX.shake=Math.max(FX.shake,.6-d/30)}}break;
    case 'wall':{const x=m.x/100,y=m.y/100,z=m.z/100;SCEN.slamFx(x,y-1,z);AU.at('hamhit',x,y,z,{vol:1,range:70,rate:.5});AU.at('imp_metal',x,y,z,{vol:1,range:60,rate:.45});
      for(let k=0;k<20;k++)FX.spawn({x,y,z,vx:rr(-5,5),vy:rr(1,6),vz:rr(-5,5),life:rr(.2,.5),s0:.06,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1});if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<16)FX.shake=Math.max(FX.shake,.8-d/20)}
      HUD.note(L?'It hit the wall — stunned!':'벽에 박았다 — 비틀거린다!',1.8);break}
    case 'bt':{const A=m.a,K=this.KB;if(K&&NET.cli)K.air={x0:A[0]/100,y0:A[1]/100,z0:A[2]/100,x1:A[3]/100,y1:A[4]/100,z1:A[5]/100,T:m.T/100,t:0,h:m.h/100};AU.at('throw',A[0]/100,A[1]/100,A[2]/100,{vol:1,range:60,rate:.4});break}
    case 'land':{const x=m.x/100,y=m.y/100,z=m.z/100;SCEN.slamFx(x,y,z);AU.at('explode',x,y,z,{vol:.8,range:70,occ:false,rate:.5});AU.at('imp_metal',x,y+1,z,{vol:1,range:60,rate:.4});
      if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<14)FX.shake=Math.max(FX.shake,.7-d/20)}break}
    case 'grab':if(a)AU.at('imp_metal',a.c.x,a.c.y+1,a.c.z,{vol:.9,range:40,rate:.6});break;
    case 'kick':if(a){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);for(let k=0;k<40;k++)FX.spawn({x:a.c.x-fx*1.8+rr(-.8,.8),y:a.c.y+rr(.1,.6),z:a.c.z-fz*1.8+rr(-.8,.8),vx:-fx*rr(4,10)+rr(-2,2),vy:rr(1,4),vz:-fz*rr(4,10)+rr(-2,2),life:rr(.5,1.1),s0:.25,s1:1.1,r:.42,g:.34,b:.26,a:.6,f:2,drag:2.2,lit:1});
      AU.at('imp_dirt',a.c.x,a.c.y,a.c.z,{vol:1,range:40,rate:.5})}break;
    case 'slam':SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('hamhit',m.x/100,m.y/100+1,m.z/100,{vol:1,range:70,rate:.5});break;
    case 'dst':if(a){const c=a.c;AU.at('kbuzz',c.x,c.y+1,c.z,{vol:1,range:80,rate:.75});for(let k=0;k<70;k++){const an=Math.random()*TAU,r=Math.random()*9;FX.spawn({x:c.x+Math.cos(an)*r*.3,y:c.y+rr(.4,2.5),z:c.z+Math.sin(an)*r*.3,vx:Math.cos(an)*rr(2,5),vy:rr(-.2,.6),vz:Math.sin(an)*rr(2,5),life:rr(2.5,4),s0:rr(.6,1),s1:rr(2.4,3.4),r:.36,g:.3,b:.24,a:.55,f:2,drag:.7,lit:1})}
      HUD.note(L?'Iron dust — get out of it!':'쇳가루 폭풍 — 범위 밖으로!',2)}break;
    case 'fly':if(a)AU.at('kbuzz',a.c.x,a.c.y+1,a.c.z,{vol:1,range:90,rate:m.b?.85:1});if(m.b)HUD.note(L?'It flies — shoot the belly!':'날아오른다 — 배를 쏴!',2.2);break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-1,1),y:a.c.y+rr(.4,1.8),z:a.c.z+rr(-1,1),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'dn':if(a){AU.at('bodyfall',a.c.x,a.c.y,a.c.z,{vol:1,range:60,rate:.5});AU.at('imp_metal',a.c.x,a.c.y+1,a.c.z,{vol:.9,range:50,rate:.5});HUD.note(L?'On its back — shoot the belly!':'뒤집혔다 — 배를 쏴!',2.5)}break;
    case 'up':if(a)AU.at('zgrowl',a.c.x,a.c.y+1,a.c.z,{vol:1,range:60,rate:.5});break;
    case 'bk':{const x=m.x/100,y=m.y/100,z=m.z/100,r=m.r/100;FX.explode(x,y,z,'he');AU.at('explode',x,y,z,{vol:1,range:100,occ:false,rate:.6});AU.at('imp_metal',x,y,z,{vol:1,range:70,rate:.35});
      for(let k=0;k<50;k++){const g=Math.random()*TAU,e=rr(-.4,1);FX.spawn({x:x+Math.cos(g)*r*.6,y:y+e*r*.5,z:z+Math.sin(g)*r*.6,vx:Math.cos(g)*rr(4,10),vy:rr(2,8),vz:Math.sin(g)*rr(4,10),life:rr(.8,1.6),s0:rr(.08,.16),s1:.08,r:rr(.3,.5),g:.3,b:.26,f:7,grav:14,col:.4})}
      if(m.m)for(let k=0;k<30;k++)FX.spawn({x,y,z,vx:rr(-4,4),vy:rr(1,5),vz:rr(-4,4),life:rr(.4,.9),s0:.1,s1:.04,r:1,g:.7,b:.25,f:0,grav:10,add:1});
      if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<18)FX.shake=Math.max(FX.shake,1-d/20)}HUD.announce(m.m?(L?'THE BALL MELTED!':'공이 녹아내렸다!'):(L?'THE BALL BROKE!':'공이 부서졌다!'),'h',2.4);if(this.KB)this.KB.st='';break}
    case 'nb':if(a){AU.at('imp_metal',a.c.x,a.c.y+1,a.c.z,{vol:1,range:60,rate:.5});HUD.note(L?'KHEPRI has a new ball':'케프리가 새 공을 다 굴렸다',2)}break;
    case 'rb':if(a)HUD.note(L?'Rolling a new ball at the heap — stop it! (fire on the heap)':'고철 더미에서 새 공을 굴린다 — 더미를 태우면 늦출 수 있다',3);break;
    case 'mol':if(a&&m.o){AU.at('salign',a.c.x,a.c.y+1,a.c.z,{vol:1,range:70,rate:.6});HUD.note(L?'The ball is molten — stay off its trail!':'쇳물 공 — 지나간 자리를 피해라!',2.4)}break;
    case 'brk':if(E&&E.gal){const g=E.gal;for(let i=0;i<46;i++)FX.spawn({x:g.x+rr(-2,2),y:g.y+rr(.2,3.4),z:-3.5,vx:rr(-3,3),vy:rr(0,4),vz:rr(1,6),life:rr(.6,1.2),s0:.08,s1:.06,r:.42,g:.38,b:.34,f:7,grav:12,col:.3});
      for(let i=0;i<24;i++)FX.spawn({x:g.x+rr(-2,2),y:g.y+rr(0,3),z:-3,vx:rr(-1,1),vy:rr(0,.6),vz:rr(.5,2.5),life:rr(1,2),s0:.4,s1:1.4,r:.5,g:.46,b:.42,a:.45,f:2,drag:1.2});
      AU.at('explode',g.x,g.y+1.5,g.z,{vol:1,range:90,occ:false,rate:.6});AU.at('imp_metal',g.x,g.y+1.5,g.z,{vol:1,range:70,rate:.4});if(P){const d=Math.hypot(P.c.x-g.x,P.c.z-g.z);if(d<25)FX.shake=Math.max(FX.shake,.9-d/30)}}break;
    case 'ph':HUD.announce(m.n===2?(L?'KHEPRI TAKES WING — TO THE FURNACE':'케프리가 날아오른다 — 고로로'):(L?'KHEPRI FLIES TO THE CASTING BAY':'케프리가 주조장으로 날아간다'),'z',3);AU.play('stingZ',{vol:.7});break;
    case 'enr':HUD.announce(L?'KHEPRI IS ENRAGED':'케프리 광폭화','z',2.5);break}}};

// ---------- the larva zombie: when it dies (not by fire), a swarm of grubs bursts out: 3 s, 3 m, 5 a second ----------
// ---------- the scrap-armour zombie: bullets −50 %, fire and blasts ×2 ----------
EPZ.larva={die(t,src,o){if(NET.cli)return;o=o||{};if(t.burnT>0||khFire(o)||o.he)return;const S0=KX.swarmAdd(t.c.x,t.c.y,t.c.z);if(NET.host)netEv('ekh',{k:'sw',x:r2(t.c.x),y:r2(t.c.y),z:r2(t.c.z),id:S0.id});
    if(!EP.swSaid){EP.swSaid=1;EP.say('swarm')}}};
EPZ.scrap={hit(t,dmg,src,o){return khFire(o)||o.he?dmg*2:dmg*.5},
  spark(t,o){if(!o||o.x==null||khFire(o)||o.he||AU.throttle('scsp',90))return;for(let i=0;i<5;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-2,2),vy:rr(0,2),vz:rr(-2,2),life:rr(.1,.25),s0:.04,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1});AU.at('imp_metal',o.x,o.y,o.z,{vol:.4,range:20,rate:1.2})},
  die(t){for(let i=0;i<10;i++)FX.spawn({x:t.c.x,y:t.c.y+rr(.5,1.6),z:t.c.z,vx:rr(-3,3),vy:rr(1,4),vz:rr(-3,3),life:rr(.6,1.1),s0:.08,s1:.06,r:.42,g:.36,b:.3,f:7,grav:13,col:.3})}};
EPZ.khepri={hp:()=>KHEPRI.hpFor(),init:a=>KHEPRI.init(a,KHEPRI.encNext),ai:(a,dt)=>KHEPRI.ai(a,dt),
  hit:(t,dmg,src,o)=>t.kh?KHEPRI.hit(t,dmg,src,o):dmg,after:(t,r,src)=>KHEPRI.threat(t,r,src),
  // (the shooter's own page) sparks off the ball, a clang off the shell
  spark(t,o){if(!o||o.x==null||AU.throttle('khsp',70))return;const V=t.khV;if(V&&V.bv&&Math.hypot(o.x-V.bx,o.y-V.by,o.z-V.bz)<V.br+.35){for(let i=0;i<6;i++)FX.spawn({x:o.x,y:o.y,z:o.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.15,.3),s0:.05,s1:.02,r:1,g:.8,b:.45,f:0,grav:9,add:1})}},
  claw(){return true},pre:(a,dt)=>KHEPRI.pre(a,dt),attach:a=>KHEPRI.attach(a),
  die(t){t.kin=null;if(!NET.cli&&t.kh&&!t.kh.enc){EP.say('kDie');const B=t.kh.b;if(B.st!=='none'){const p=KHEPRI.ballPos(t,t.kh);KHEPRI.fx({k:'bk',x:r2(p.x),y:r2(p.y),z:r2(p.z),r:r2(B.r),m:0});B.st='none'}}},
  gone(a){a.kin=null;if(a.kh)a.kh.mode='gone'}};
Object.assign(ZGAIT,{larva:{stride:1,knee:1,runK:.9,bob:1.2,twist:1.2,sway:1.2},scrap:{stride:.9,knee:.9,runK:.85,bob:.9,twist:.8,sway:.9}});
Object.assign(JAW0,{larva:.14,scrap:.1,khepri:0});

// ---------- KHEPRI's card portrait: the beetle head-on (the rig in design.js is only a placeholder) ----------
{const pt=portrait;portrait=function(key,s){if(key!=='z_khepri')return pt(key,s);s=s||70;const k='kh:'+s;if(PORTRAITS[k])return PORTRAITS[k];
  const W=Math.ceil(1.5*s),H=Math.ceil(1.9*s),[cv,x]=mkCanvas(W,H),cx=W/2,u=s/70;
  x.lineCap='round';x.strokeStyle='#120c0a';for(const sd of [-1,1])for(const [y0,ex,ey,w] of [[.98,.62,1.12,5],[1.14,.7,1.5,6],[1.3,.6,1.82,6]]){x.lineWidth=w*u;x.beginPath();x.moveTo(cx+sd*.3*s,y0*s);x.lineTo(cx+sd*ex*s,ey*s-.18*s);x.lineTo(cx+sd*(ex+.04)*s,ey*s);x.stroke()}
  let g=x.createRadialGradient(cx-.12*s,1.0*s,.05*s,cx,1.2*s,.62*s);g.addColorStop(0,'#4a5a8a');g.addColorStop(.45,'#1a2238');g.addColorStop(1,'#06080e');x.fillStyle=g;x.beginPath();x.ellipse(cx,1.22*s,.6*s,.48*s,0,0,TAU);x.fill();
  x.strokeStyle='rgba(10,12,18,.9)';x.lineWidth=2*u;x.beginPath();x.moveTo(cx,.8*s);x.lineTo(cx,1.7*s);x.stroke();
  g=x.createRadialGradient(cx-.08*s,1.0*s,.02*s,cx,1.05*s,.42*s);g.addColorStop(0,'#3a4a72');g.addColorStop(1,'#0a0e18');x.fillStyle=g;x.beginPath();x.ellipse(cx,1.06*s,.44*s,.24*s,0,0,TAU);x.fill();
  x.fillStyle='#1c1410';x.beginPath();x.ellipse(cx,1.18*s,.26*s,.14*s,0,0,TAU);x.fill();
  x.fillStyle='#24180f';x.beginPath();x.moveTo(cx-.07*s,1.1*s);x.quadraticCurveTo(cx-.12*s,.62*s,cx+.02*s,.2*s);x.quadraticCurveTo(cx+.1*s,.55*s,cx+.07*s,1.1*s);x.closePath();x.fill();
  x.strokeStyle='#3a2a1e';x.lineWidth=1.5*u;x.beginPath();x.moveTo(cx-.02*s,1.02*s);x.quadraticCurveTo(cx-.06*s,.62*s,cx+.02*s,.26*s);x.stroke();
  x.fillStyle='#120c0a';for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(cx+i*.07*s-.03*s,1.28*s);x.lineTo(cx+i*.07*s,1.36*s);x.lineTo(cx+i*.07*s+.03*s,1.28*s);x.fill()}
  for(const sd of [-1,1]){x.fillStyle='rgba(255,150,40,.35)';x.beginPath();x.arc(cx+sd*.17*s,1.14*s,.06*s,0,TAU);x.fill();x.fillStyle='#ffb030';x.beginPath();x.arc(cx+sd*.17*s,1.14*s,.032*s,0,TAU);x.fill()}
  return PORTRAITS[k]=cv.toDataURL()}}

// ---------- chapter 3 「케프리」: the rusted steel works ----------
//   1 the scrap yard — three waves; the scrap-armour zombies show up (fire and blasts); KHEPRI is glimpsed on the scrap mountain
//   2 the rail yard — open the three fuel valves in turn (12 s each): the furnace is lit, the runners fill
//   3 the conveyor gallery — hold out 60 s; KHEPRI bursts through the wall and rolls its ball down the gallery (half damage in there);
//     it goes once its ball breaks (or it has lost 20 %, or the wait is over)
//   4 the blast-furnace hall — the boss fight, three phases (the slag yard, the furnace, the casting bay). A wipe replays its phase
CHAP[3]={id:3,k:'khepri',map:'ep3',code:'Q7-303',n:['케프리','KHEPRI'],t:['좀비 시나리오: 케프리','Zombie Scenario: KHEPRI'],
  file:[['곤충 매개 계획 실험체 3호 Q7-303. 고철을 뭉친 공을 굴린다 — 정면 총알은 공이 다 막는다','Insect-vector subject no. 3, Q7-303: it rolls a ball of scrap that soaks up the bullets from the front'],
    ['드럼통·가스 밸브·래들 쇳물로 공을 깨라 · 날 때 드러나는 배가 약점','Break the ball with drums, gas valves and the ladle\'s iron · the belly shows when it flies']],
  cards:{place:['청운제철 제2공장','CHEONGUN STEEL WORKS'],who:['곤충 매개 계획 실험체 3호','INSECT-VECTOR SUBJECT 3'],line:['쇠붙이를 굴리던 습성만 남았다 — 몸집만 한 고철 공이 갑옷이자 무기','All that is left is the urge to roll — a ball of scrap as big as itself, its armour and its weapon']},
  boss:KHEPRI,voice2:['KHEPRI','KHEPRI'],
  // gates: A the rail yard's gate, B the stair cage up to the gallery, W the gallery wall it bursts through, C the hall's door
  gates:['gA','gB','gW','gC'],gateDur:{gA:1.3,gB:1.2,gW:.2,gC:1.3},
  pow0:0,powLo:[.92,.75],
  stages:[null,
    {z:'A',k:'waves',n:['고철 야적장','Scrap yard'],on:['고철장을 지켜라','Hold the scrap yard'],prep:18,clr:'s1c',intro:{zc:'scrap',say:'scrap',at:5},
      wave:w=>[['rager',50],['runner',22],['scrap',w>=2?20:14],['bomber',w>=2?8:4],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['철로 야적장','Rail yard'],on:['연료 밸브 열기','Open the fuel valves'],dev:'valve',seq:1,say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'v1':'v2',intro:{zc:'larva',say:'larva',at:6},
      mix:[['rager',42],['runner',24],['larva',18],['scrap',10],['spitter',6]]},
    {z:'C',k:'hold',n:['원료 컨베이어 통로','Conveyor gallery'],on:['고로 홀 셔터가 열릴 때까지','The hall shutter opens in'],len:60,say:'s3',sayRetry:1,meet:{at:8,cap:.5},hp:[8,8,-1.4,2.6],mk:[-12.5,10,0,['고로 홀 문','HALL DOOR']],
      mix:[['rager',44],['runner',30],['larva',18],['scrap',8]]},
    {z:'D',k:'boss',n:['고로 홀 · 주조장','Blast-furnace hall'],on:['케프리를 쓰러뜨려라','Bring KHEPRI down'],say:'s4',go:'b0',prepPt:[9,0,8,2]}],
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n>=4)m|=b('gW');if(n===4&&kind!=='phase')m|=b('gC');return m},
  setup(){KX.build();E3MOLT.uOn.value=EP.pow},
  // the furnace has no fire until the fuel valves are open (the runners dull, the flare stack out)
  stageStart(n){EP.pow=n>=3?1:0;KX.reset();KX.flareN=n>=3?3:0;E3MOLT.uOn.value=EP.pow},
  stageDone(n){if(n===1)this.glimpse();if(n===2){EP.setPow(1);KX.flareN=3;if(NET.host)netEv('ekh',{k:'fl',n:3})}},
  devDone(st,i,left){if(st===2){KX.flareN=3-left;if(NET.host)netEv('ekh',{k:'fl',n:KX.flareN})}},
  // stage 1's end: KHEPRI on the scrap mountain, rolling its ball across the top and over the back wall
  glimpse(){if(NET.cli)return;const C=MAP.ez.cut,a=KHEPRI.spawn([C.p0[0],C.p0[1],C.p0[2]],Math.PI/2,2);if(!a)return;const S=a.kh;S.idle=false;S.invT=999;
    a.yaw=Math.PI/2;S.mode='cut';S.mt=9;epKin(a,C.p1[0],C.p1[1],C.p1[2],5,0,null);EP.later(.6,()=>EP.say('cut1'));EP.later(3,()=>EP.say('cut2'))},
  bossGo(){EP.setGates(EP.gm&~EP.bit('gC'));return []},
  update(dt){KX.update(dt);E3MOLT.uOn.value=approach(E3MOLT.uOn.value,EP.pow>.5?1:0,dt*.5)},
  // bots shoot a drum or a gas valve when the ball is right next to it
  botPost(a,dt){const B=a.bot;if(!B)return;if(B.khAim&&G.t<B.khAim.t){const e=actorEye(a),q=B.khAim,dx=q.x-e.x,dy=q.y-e.y,dz=q.z-e.z;a.yaw=Math.atan2(-dx,-dz);a.pitch=Math.atan2(dy,Math.hypot(dx,dz));a.cmd.fire=true;return}
    B.khT=(B.khT||0)-dt;if(B.khT>0||EP.ph!=='run'||(EP.st!==4&&EP.st!==3))return;B.khT=.45;if(G.t<KX.botShotT)return;const b=EP.bossA();if(!b||!b.kh)return;const S=b.kh;if(S.b.st==='none'||S.b.st==='grow')return;
    const p=KHEPRI.ballPos(b,S),e=actorEye(a);
    for(const D of KX.drums){if(!D.alive||Math.hypot(D.x-p.x,D.z-p.z)>3.9+S.b.r*.4)continue;const d=Math.hypot(D.x-a.c.x,D.z-a.c.z);if(d<6||d>34||!losClear(e.x,e.y,e.z,D.x,D.y+.5,D.z))continue;
      B.khAim={x:D.x,y:D.y+.5,z:D.z,t:G.t+.6};KX.botShotT=G.t+1.6;return}
    for(const G0 of KX.gas){if(G0.cd>0||Math.hypot(G0.x-p.x,G0.z-p.z)>1.6+S.b.r)continue;const vx=G0.px+Math.sign(G0.x-G0.px)*.42,vz=G0.pz+Math.sign(G0.z-G0.pz)*.42,vy=G0.y+1.28,d=Math.hypot(vx-a.c.x,vz-a.c.z);
      if(d<4||d>30||!losClear(e.x,e.y,e.z,vx,vy,vz))continue;B.khAim={x:vx,y:vy,z:vz,t:G.t+.6};KX.botShotT=G.t+1.6;return}},
  // a shot on a prop (epbase.js epBoxShot): the host acts, a client tells it
  boxShot(eh,a,W){const dmg=(W&&W.dmg||30)*(W&&W.pellets?.6:1);if(NET.cli){if(!AU.throttle('ekhs'+eh.k+eh.i,120))netToHost({t:'ekhs',k:eh.k,i:eh.i,d:Math.round(dmg)});return}KX.boxHit(eh.k,eh.i,dmg)},
  clear(){KX.clear();EP.swSaid=0},
  radio:{
    start:['2차 회수팀, 청운제철 제2공장 도착. 곤충 매개 계획 실험체가 여기로 옮겨졌다는 기록이 있다.','RT-2, you are at Cheongun Steel Works, plant 2. The records say an insect-vector subject was moved here.',0],
    w1:['고철장 사방에서 몰려온다! 자리 잡아.','They are coming from all over the scrap yard! Hold your ground.',0],
    scrap:['고철 두른 놈은 총알이 반밖에 안 먹혀! 드럼통을 쏴서 터뜨리거나 불로 지져!','The ones in scrap armour shrug off half your bullets! Blow the drums next to them or burn them!',1],
    s1c:['철로 야적장 문 연다. 고로를 다시 살려야 그 안으로 들어갈 수 있어.','Opening the rail yard gate. We need the furnace running before we can get in there.',0],
    cut1:['저기, 고철 산 꼭대기! 뭔가 공을 굴린다!','Up there — on top of the scrap pile! Something is rolling a ball!',1],
    cut2:['Q7-303… 케프리. 곤충 매개 계획 실험체 3호다. 쇠똥구리였던 놈이야.','Q7-303… KHEPRI. Insect-vector subject no. 3. It used to be a dung beetle.',0],
    s2:['연료 밸브 세 개를 차례로 열어 — 중유 탱크, 펌프실, 신호소 2층. 하나에 12초.','Open the three fuel valves in order: the oil tank, the pump house, upstairs in the signal box. Twelve seconds each.',0],
    larva:['저 좀비… 몸속에서 뭔가 꿈틀거린다. 죽으면 벌레가 쏟아진다 — 떨어져서 쏴, 불이면 다 탄다!','That one… something is wriggling inside it. Grubs pour out when it dies — shoot it from a distance, fire burns them!',1],
    swarm:['유충 떼다! 떨어져!','A swarm of grubs! Back off!',1],
    v1:['밸브 하나 열렸다. 다음은 펌프실.','One valve open. The pump house next.',0],
    v2:['마지막 — 신호소 2층!','Last one — upstairs in the signal box!',0],
    s2c:['연료가 들어간다… 고로에 불이 붙었다. 컨베이어 통로로 올라가.','The fuel is going in… the furnace is alight. Up to the conveyor gallery.',0],
    s3:['고로 홀 셔터를 여는 중이다. 60초만 통로에서 버텨.','We are opening the hall shutter. Hold the gallery for 60 seconds.',0],
    enc:['벽이—! 피해!','The wall—! Get clear!',1],
    enc2:['케프리다! 통로에서 공에 깔리면 끝이야 — 옆 칸이나 컨베이어 위로 피해! 드럼통하고 가스 밸브로 공을 깨!','KHEPRI! Get rolled over in here and you are done — duck into the bays or up on the conveyor! Break the ball with the drums and the gas valve!',0],
    kRet:['물러난다! 벽 구멍으로 날아갔어.','It is pulling back! Out through the hole.',1],
    s4:['고로 홀이다. 공이 정면을 다 막는다 — 드럼통, 가스 밸브, 주조장 래들로 공을 깨. 래들 레버는 양쪽 조종석에 있다.','The furnace hall. The ball blocks everything from the front — break it with the drums, the gas valves and the ladle in the casting bay. The levers are in the two booths.',0],
    b0:['공을 굴리기 시작했다 — 옆으로 돌아!','It is rolling — get to its sides!',1],
    kWall:['벽에 박았다! 지금!','It hit the wall! Now!',1],
    kHeavy:['공이 무거워진다 — 정면에 총알 박지 마!','The ball is getting heavier — stop pumping bullets into the front of it!',1],
    kBreak:['공이 부서졌다! 몰아쳐!','The ball is broken! Pour it on!',1],
    kMelt:['쇳물에 공이 녹았다!','The iron melted the ball!',1],
    kNew:['새 공을 다 굴렸다…','It has a new ball…',1],
    kDown:['뒤집혔다! 배를 쏴!','It is on its back! Shoot the belly!',1],
    kLadle:['쇳물 직격! 뒤집혔다!','A direct hit with the iron! It is on its back!',1],
    kP2:['날아오른다 — 배다! 고로 쪽으로 간다!','It is flying — the belly! It is heading for the furnace!',1],
    kP3:['주조장으로 간다! 쇳물 레일 옆을 지나면 공이 달아오른다!','It is going for the casting bay! If the ball passes the runners it turns molten!',0],
    kEnr:['시간 끌면 안 돼 — 놈이 더 빨라진다!','We cannot drag this out — it is getting faster!',0],
    kDie:['…','…',2],
    dead:['케프리 무력화. 실험체 3호, 확인했다.','KHEPRI is down. Subject no. 3, confirmed.',0],
    clear:['2차 회수팀, 수고했다. 곤충 매개 계획… 다음 실험체 기록을 찾아야겠군.','Good work, RT-2. The insect-vector programme… we have to find the records on the next subject.',0]}};

// ---------- hooks ----------
(function(){
  // a grenade's blast reaches the drums, the ball, the heaps and the swarms (the host decides; a client tells it about its own; 5챕터 has
  // only the swarms of its larva zombies and egg sacs)
  const dt0=detonate;detonate=function(n){dt0(n);if(!EP.on||EP.id!==3&&EP.id!==5||n.ghost||!n.owner||n.owner.team!==TH)return;if(n.kind!=='he'&&n.kind!=='gl')return;
    if(NET.cli){netToHost({t:'ekhb',x:r2(n.x),y:r2(n.y),z:r2(n.z),k:n.kind==='gl'?1:0});return}KX.blast(n.x,n.y,n.z,n.kind==='gl'?4:5.5,{ball:n.kind==='gl'?Math.round(520*(n.dmg||380)/380):900})};
  // a flamethrower's jet burns swarms away (3챕터 and 5챕터)
  if(typeof salHits==='function'){const sh=salHits;salHits=function(a,W,eye,dir){const n=sh(a,W,eye,dir);if(EP.on&&(EP.id===3||EP.id===5)&&!NET.ghost&&KX.swarm.length){const R0=W.flame.r;
      for(let i=KX.swarm.length-1;i>=0;i--){const S0=KX.swarm[i],mx=S0.x-eye.x,mz=S0.z-eye.z,s=mx*dir.x+mz*dir.z;if(s<0||s>R0+S0.r)continue;const lat=Math.hypot(eye.x+dir.x*s-S0.x,eye.z+dir.z*s-S0.z);if(lat>S0.r+.5)continue;
        if(NET.cli){if(!AU.throttle('ekhf',250))netToHost({t:'ekhf',id:S0.id})}else{KX.swarm.splice(i,1);KX.swarmFx(S0);netEv('ekh',{k:'swx',id:S0.id})}}}return n}}
  Object.assign(CLIH,{ekh(L,m){if(['dr','dra','gv','ct','hb','sc','fz','sw','swx','spl','fl'].includes(m.k))KX.fxApply(m);else if(m.k==='ld')LADLE.set(['full','tilt','pour','empty'][m.s],true);else KHEPRI.fxApply(m)}});
  Object.assign(HOSTH,{
    ekhs(L,m){if(EP.on&&EP.id===3&&actorOfKey(L.key))KX.boxHit(m.k,m.i|0,clamp(+m.d||0,0,400))},
    ekhb(L,m){if(EP.on&&(EP.id===3||EP.id===5)&&actorOfKey(L.key))KX.blast(m.x/100,m.y/100,m.z/100,m.k?4:5.5,{ball:m.k?520:900})},
    ekhf(L,m){if(!(EP.on&&(EP.id===3||EP.id===5)&&actorOfKey(L.key)))return;const i=KX.swarm.findIndex(S0=>S0.id===m.id);if(i>=0){const S0=KX.swarm[i];KX.swarm.splice(i,1);KX.swarmFx(S0);netEv('ekh',{k:'swx',id:S0.id})}}});
})();

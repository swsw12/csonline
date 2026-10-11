'use strict';
// ============ Chapter 4 「라이어버드」: the boss LYREBIRD (RT1-05), its mirages and decoys, the radio-operator and spore zombies, the fog
// and the alarm sirens ============
// episode.js runs the story; this file is what fights in it. Host-authoritative: the host runs LYREBIRD's brain, every hit, the sirens
// and the mirages; clients get the gauges, its pose, its disguise and the sirens in the chapter snapshot (EP.pack → bsPack) and the
// moments as events ('ely').
// LYREBIRD, RT-1's signaller, infected (1.4× a man, a long neck, a radio pack on its back, spore vents in its shoulders, on all fours),
// has 19,000 × (0.6 + 0.4 × humans) × difficulty health and its own brain (EPZ.lyrebird.ai). It hunts in the fog: it stalks whoever
// is furthest from the others, comes from behind (0.5 s of breathing first) and pounces — 12 on landing, flat on the ground, pinned 2 s,
// 18 a second (the first meeting: 8 and 12); a teammate putting 3.5 % of its health into it, or the pinned player's knife, gets it
// off. Three claws (15 each) up close.
// It climbs: roofs, the mast platforms, the siren tower's top, then comes down somewhere else.
//   the fake radio (from 90 %, every 30–40 s): a chat line in a teammate's name ("Ammo over here!") and a ping where it waits —
//            the teammate's dot on the minimap is somewhere else. Within 6 m of a fake ping its pounce does +50 %.
//   decoy radios: thrown into the fog, playing gunfire and footsteps; shoot one and it breaks
//   phase 2 (65–30 %) mirages: 2–3 "teammates" walking up out of the fog (no flashlight): within 4 m one grabs (1.5 s, 21); the sonic cry
//            (the throat sac swells 1 s, the weak point open): within 25 m 2 s dizzy (up to 14 within 18 m) and the fog 10 s thicker; echoes (the last
//            gun fired heard from the wrong side)
//   phase 3 (30–0 %) the disguise: 10 s in the top scorer's shape and name (it cannot attack); come close and it shows itself and
//            pounces; the fake siren (a red wave, no light on the tower: whoever comes out for it gets jumped); pounces in pairs
// Weak points: the throat sac while it is open (mimicking, crying: ×2.5), the radio pack on its back (8 % of its health: broken, no more
// fake radio and mirages, and 6 s down). Stagger: the sac, a siren, the pack, HE +15, frost +10.
// The alarm sirens (hold E 1 s at the box; 45 s to recharge): a wave out to 40 m — 10 s of clear air, the mirages and decoys gone,
// LYREBIRD's outline through walls; within 25 m it is stunned 3 s. The centre one from the start, the east and west ones in phase 3.
// The radio-operator zombie's set traces LYREBIRD for 5 s when it dies; the spore zombie bursts into a patch of thick fog.
// Every phase change is 1.6 s of roaring (invulnerable) and gets the whole team back up; enraged after 240 s (expert 180).
const LY_PH=[1,.65,.3],LY_S=1.4;
const LY_POSE=['','run','stand','pin','leap','perch','claw','down','sonic','stun','dsg','mimic'];
const LY_MIX=[['rager',34],['runner',28],['squad',16],['radioman',12],['spore',10]];
// the lines it fakes in a teammate's name
const LY_FAKE=[['여기 탄약 있어! 이쪽으로 와','Ammo over here! Come this way'],['도와줘… 다리를 다쳤어, 이쪽이야','Help… my leg is hurt, over here'],['여기 깨끗해, 이리로 모여','It is clear here, regroup on me'],
  ['라이어버드 봤어! 이쪽으로 갔어','I saw LYREBIRD! It went this way'],['사이렌 여기서 울릴 수 있어, 와 봐','I can set a siren off from here, come and see'],['나 혼자야… 누구 없어?','I am on my own… is anyone there?']];

// ---------- atlas materials: the throat sac (glows), the beacon glass (glows when lit), a speaker grille ----------
const LY_MATS=['epSac','epBeacon','epSpk'];
for(const m of LY_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintLyAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the throat sac: a stretched, glowing membrane, violet-white, dark veins over it
  patch('epSac',(xx,y,X,Y)=>{const t=nz(X,Y,4501,10),v=Math.abs(Math.sin(xx*.21+nz(X,Y,4502,18)*7));let c=t>.6?'#d8a8ff':t>.42?'#a070e0':'#7040b8';if(v<.09)c='#2a1040';return c},232);
  patch('epBeacon',(xx,y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v);let c=r<.4?'#fff0b0':r<.8?'#ffb030':'#c86a10';if(((xx>>3)+(y>>3))%2===0&&r>.4)c='#e88a20';return c},232);
  patch('epSpk',(xx,y)=>((xx%6)<3&&(y%6)<3)?'#060606':'#2a2c2a',249);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintLyAtlas()}}

// ---------- props (the weapon material): the throat sac, the radio pack (and what is left of it), a decoy set, a siren's beacon ----------
Object.assign(GUNS,{
  lySac:{parts:[Pt(0,0,0,.17,.15,.13,'epSac',{r:.065}),Pt(0,-.06,-.05,.1,.05,.05,'epSac',{r:.02})],grip:[0,0,0],muzzle:[0,0,0]},
  // the pack: a field radio (its face out, +z), the dials, the speaker, a whip antenna, the handset clipped to its side
  lyPack:{parts:[Pt(0,0,0,.34,.42,.18,'olive',{r:.02}),Pt(0,.08,.092,.28,.17,.01,'blk2'),Pt(-.08,.12,.1,.045,.045,.02,'steel'),Pt(.06,.12,.1,.045,.045,.02,'steel'),Pt(0,-.1,.092,.22,.1,.008,'epSpk'),
    Pt(.12,.22,0,.045,.06,.045,'steel'),Pt(.12,.435,.374,.012,.86,.012,'blk',{rx:1.05}),Pt(-.19,-.04,.02,.05,.16,.06,'blk',{r:.015}),Pt(0,.215,0,.36,.02,.2,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  lyPackB:{parts:[Pt(0,-.1,0,.34,.2,.18,'olive',{r:.02}),Pt(.06,.03,.04,.012,.12,.012,'red'),Pt(-.05,.02,.05,.01,.1,.01,'yellow'),Pt(.1,.0,0,.06,.04,.06,'blk')],grip:[0,0,0],muzzle:[0,0,0]},
  lyDecoy:{parts:[Pt(0,.1,0,.3,.2,.14,'olive',{r:.02}),Pt(0,.12,-.071,.22,.1,.006,'epSpk'),Pt(.1,.42,0,.01,.5,.01,'blk'),Pt(-.09,.17,-.072,.03,.03,.008,'epSac')],grip:[0,0,0],muzzle:[0,0,0]},
  lyBeacon:{parts:[Pt(0,.16,0,.38,.3,.38,'epBeacon',{r:.16}),Pt(0,0,0,.44,.06,.44,'steel',{r:.02}),Pt(0,.33,0,.12,.04,.12,'steel')],grip:[0,0,0],muzzle:[0,0,0]}});

// ---------- sounds: its breath before a pounce, a radio's crackle, the garbled mimic, its sonic cry, the alarm siren ----------
Object.assign(SFX,{
  lybreath:{n:2,dur:.9,ch:1,peak:.8,gain:.7,rev:.15,poly:2,fn:B=>{const out=B.f('lowpass',1400,.7,B.g(.9));const e=B.env(0,.32,1,.5,out,.05);B.nz('pink',0,.85,B.sweep(B.f('bandpass',380,1.2,e),300,900,0,.35));
    const e2=B.env(.36,.04,.6,.4,out);B.nz('brown',.36,.5,B.f('bandpass',220,1.4,e2));voice(B,{f0:rr(70,80),f1:55,len:.6,F:[320,700,1800],drive:3,rasp:1,rf:500,gurgle:18})}},
  lyradio:{n:3,dur:.9,ch:1,peak:.75,gain:.5,rev:.08,poly:3,fn:B=>{const out=B.f('highpass',700,.7,B.f('lowpass',3800,.7,B.g(.9)));const e=B.env(0,.01,1,.75,out,.05);B.am(e,0,.85,45,.85);B.nz('white',0,.85,B.f('bandpass',1700,.9,e));
    const s=B.env(.62,.005,.5,.12,out);B.osc('square',1150,1150,.62,.14,s)}},
  lycall:{n:3,dur:1.4,ch:1,peak:.8,gain:.65,rev:.12,poly:2,fn:B=>{const out=B.f('highpass',450,.7,B.f('lowpass',3000,.8,B.sh(3,B.g(.9))));const g=B.g(1,out);B.am(g,0,1.3,14,.75);
    for(const [t,f0,f1] of [[0,240,320],[.3,300,210],[.62,260,360],[.95,330,220]]){const e=B.env(t,.03,1,.2,g,.06);for(const k of [1,2.02,3.1])B.osc('sawtooth',f0*k,f1*k,t,.3,B.f('bandpass',900*k,3,e))}
    const n=B.env(0,.01,.4,1.2,out,.1);B.nz('white',0,1.3,B.f('bandpass',2200,1,n))}},
  lysonic:{n:2,dur:1.8,ch:2,peak:.9,gain:.85,rev:.35,poly:2,fn:B=>{voice(B,{f0:rr(380,420),fm:rr(900,1000),f1:640,len:1.5,F:[1500,2900,4200],drive:2.4,rasp:.6,rf:3200,rn:'white',vib:22,vibD:.12,lp:7000});
    for(const s of [-1,1]){const e=B.env(.1,.3,.5,1.2,B.pan(s*.6,B.g(.8)));B.osc('sine',2200,3400,.1,1.4,B.f('bandpass',2800,6,e))}}},
  lysiren:{n:1,dur:3.2,ch:2,peak:.9,gain:.95,rev:.4,poly:2,fn:B=>{const out=B.sh(1.6,B.g(.9));for(const s of [-1,1]){const e=B.env(0,.25,1,.6,B.pan(s*.5,out),2.3);
      for(const [ty,k] of [['sawtooth',1],['square',2.01]]){const o=B.oc.createOscillator();o.type=ty;const f=o.frequency;f.setValueAtTime(260*k,0);f.linearRampToValueAtTime(720*k,1.1);f.setValueAtTime(720*k,1.9);f.linearRampToValueAtTime(380*k,3.1);
        o.connect(B.f('lowpass',2600,.8,B.g(k>1?.35:1,e)));o.start(0);o.stop(3.15)}}}}});
SFX_ORDER.push('lybreath','lyradio','lycall','lysonic','lysiren');

// ---------- the fog (every page, from its own camera): thick in the stage's zone, thinner round a lit relay, gone for a siren's 10 s,
// thicker after the sonic cry; bots see as far as the fog lets them ----------
const EPFOG={cur:.045,clrT:0,thkT:0,
  base(n){return [.045,.045,.06,.085,.1][n]||.06},
  reset(){this.clrT=this.thkT=0;this.cur=this.base(EP.st||1)},
  // the density the camera should be in now
  target(){const st=EP.st||1,cam=R.cam.position,E=MAP.ez;let D=this.base(st);
    if(st===4&&E&&cam.z<E.cliffZ)D*=1+clamp((E.cliffZ-cam.z)/10,0,1)*.3;
    if(st>=2&&E&&E.relay)for(let i=0;i<E.relay.length;i++){const v=E.relay[i],lit=st>2||(EP.obj.ps[i]||0)>=v.t;if(!lit)continue;const d=Math.hypot(cam.x-v.x,cam.z-v.z);if(d<16)D*=lerp(.5,1,d/16)}
    if(this.thkT>0)D*=1.5;if(this.clrT>0)D=Math.min(D,.02);return D},
  update(dt){this.clrT=Math.max(0,this.clrT-dt);this.thkT=Math.max(0,this.thkT-dt);const T=this.target();this.cur=approach(this.cur,T,dt*(T<this.cur?.1:.025));LU.uFogD.value=this.cur;
    const SP=MAP.skyParts;if(SP&&SP.dome){SP.dome.material.uniforms.uSkyFog.value=clamp((this.cur-.02)/.035,0,1);const clear=this.cur<.035;SP.moon.visible=SP.halo.visible=clear}},
  // how far a bot sees a zombie (the host's view of the stage, not its camera)
  botSee(){let D=this.base(EP.st||1);if(this.thkT>0)D*=1.5;if(this.clrT>0)D=.02;return clamp(2.3/D,18,90)}};

// ---------- the alarm sirens: a beacon that lights for its 10 s, the wave rings, the box to hold E at (host decides) ----------
const SIREN={L:[],rings:[],T:1,ringGeo:null,
  build(){if(this.L.length||!MAP.ez||!MAP.ez.sirens)return;
    MAP.ez.sirens.forEach((s,i)=>{const m=new THREE.Mesh(gunGeo('lyBeacon'),matGun());m.position.set(s.x,s.y+s.h+.12,s.z);R.scene.add(m);sampleProbe(s.x,s.y+s.h,s.z,m.material.uniforms.uProbe.value);m.material.uniforms.uEmisA.value=.12;
      this.L.push({i,s,m,cd:0,p:0,lit:0,light:null,rot:0})})},
  live(S){return EP.st===4&&EP.ph==='run'&&EP.bossPh>=S.s.ph},
  near(S,h){return Math.hypot(h.c.x-S.s.bx,h.c.z-S.s.bz)<1.9&&Math.abs(h.c.y-S.s.y)<1.8},
  // the wave (every page): a ring racing out to 40 m over the yard (white-blue a real one, red a fake), the siren's wail
  wave(i,fake){const S=this.L[i];if(!S)return;const s=S.s;if(!this.ringGeo){this.ringGeo=new THREE.RingGeometry(.9,1,72);this.ringGeo.rotateX(-Math.PI/2)}
    for(let k=0;k<2;k++){const m=new THREE.Mesh(this.ringGeo,new THREE.MeshBasicMaterial({color:fake?0xff3a22:0xbfe8ff,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
      m.position.set(s.x,s.y+.4+k*1.2,s.z);m.frustumCulled=false;m.renderOrder=6;R.scene.add(m);this.rings.push({m,t:-k*.25,T:1.7})}
    AU.at('lysiren',s.x,s.y+s.h,s.z,{vol:1,range:220,occ:false,rate:fake?.97:1});DL.add(s.x,s.y+s.h,s.z,fake?'#ff3a22':'#cfe8ff',30,fake?1.6:2.4,1.2);
    const P=G.player;if(P&&P.alive){const d=Math.hypot(P.c.x-s.x,P.c.z-s.z);if(d<30)FX.shake=Math.max(FX.shake,.35-d/90)}},
  light(S,on){S.lit=on?10:0;S.m.material.uniforms.uEmisA.value=on?3.2:.12;if(on&&!S.light)S.light=DL.add(S.s.x,S.s.y+S.s.h+.3,S.s.z,'#ffb030',16,2.2,0,{flick:.15});if(!on&&S.light){S.light.dead=true;S.light=null}},
  update(dt){for(let i=this.rings.length-1;i>=0;i--){const R0=this.rings[i];R0.t+=dt;const u=clamp(R0.t/R0.T,0,1);R0.m.visible=R0.t>0;R0.m.scale.setScalar(1+39*u);R0.m.material.opacity=.85*(1-u)*(1-u);
      if(R0.t>R0.T){R.scene.remove(R0.m);R0.m.material.dispose();this.rings.splice(i,1)}}
    for(const S of this.L){if(S.lit>0){S.lit=Math.max(0,S.lit-dt);S.rot+=dt*7;if(S.light){S.light.x=S.s.x+Math.cos(S.rot)*.8;S.light.z=S.s.z+Math.sin(S.rot)*.8}if(S.lit<=0)this.light(S,false)}
      if(NET.cli)S.cd=Math.max(0,S.cd-dt)}},
  pack(){const o=[];for(const S of this.L)o.push(Math.ceil(S.cd),Math.ceil(S.lit),Math.round(S.p*10));return o},
  unpack(a){if(!a)return;for(let i=0;i<this.L.length;i++){const S=this.L[i];if(a[i*3]==null)continue;S.cd=a[i*3];S.p=(a[i*3+2]||0)/10;const lit=a[i*3+1]>0;if(lit&&S.lit<=0)this.light(S,true);else if(!lit&&S.lit>0)this.light(S,false)}},
  reset(){for(const S of this.L){S.cd=0;S.p=0;this.light(S,false)}},
  clear(){for(const S of this.L){R.scene.remove(S.m);S.m.material.dispose();if(S.light)S.light.dead=true}this.L=[];for(const R0 of this.rings){R.scene.remove(R0.m);R0.m.material.dispose()}this.rings=[]}};

// ---------- decoy radios: thrown into the fog, playing gunfire and footsteps for 20 s; a shot breaks one ----------
const DECOY={list:[],id:0,
  add(x,y,z,id,remote){const m=new THREE.Mesh(gunGeo('lyDecoy'),matGun());m.position.set(x,y+.02,z);m.rotation.y=Math.random()*TAU;R.scene.add(m);sampleProbe(x,y+.5,z,m.material.uniforms.uProbe.value);
    const D={id:id||++this.id,x,y,z,m,t:0,life:20,nx:rr(.6,1.4),box:{x0:x-.2,x1:x+.2,y0:y,y1:y+.3,z0:z-.12,z1:z+.12,mat:'metalx',o:{eh:{k:'dc',i:0}}}};D.box.o.eh.i=D.id;worldAddDyn(D.box);this.list.push(D);
    AU.at('land',x,y,z,{vol:.6,range:30,rate:1.5});if(NET.host&&!remote)LYRE.fxSend({k:'dc',id:D.id,x:r2(x),y:r2(y),z:r2(z)});return D},
  // what it plays: the guns the team carries, a burst of steps, now and then a shout of static
  update(dt){const W=SCEN.H.map(h=>WPN[h.cur]).filter(w=>w&&w.snd&&w.kind!=='melee'&&w.kind!=='nade');
    for(let i=this.list.length-1;i>=0;i--){const D=this.list[i];D.t+=dt;D.nx-=dt;if(D.nx<=0){D.nx=rr(.9,2.2);const r=Math.random();
        if(r<.55&&W.length){const w=rpick(W),n=1+Math.floor(Math.random()*3);for(let k=0;k<n;k++)SCEN.later(k*rr(.09,.16),()=>{if(D.m.parent)AU.at(w.snd,D.x,D.y+1,D.z,{vol:.85,range:70})})}
        else if(r<.85){for(let k=0;k<4;k++)SCEN.later(k*.3,()=>{if(D.m.parent)AU.at('step_conc',D.x+rr(-1,1),D.y,D.z+rr(-1,1),{vol:.7,range:25})})}else AU.at('lyradio',D.x,D.y+.4,D.z,{vol:.7,range:30})}
      if(Math.random()<dt*3)FX.spawn({x:D.x-.09,y:D.y+.18,z:D.z,life:.15,s0:.06,s1:.04,r:1,g:.5,b:1,a:.9,f:1,add:1});
      if(D.t>D.life&&!NET.cli)this.kill(D,0)}},
  kill(D,shot){const i=this.list.indexOf(D);if(i<0)return;this.list.splice(i,1);worldRemoveDyn(D.box);R.scene.remove(D.m);D.m.material.dispose();
    if(shot){for(let k=0;k<14;k++)FX.spawn({x:D.x,y:D.y+.15,z:D.z,vx:rr(-3,3),vy:rr(.5,3),vz:rr(-3,3),life:rr(.15,.35),s0:.05,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1});AU.at('dischit',D.x,D.y,D.z,{vol:.7,range:40})}
    if(NET.host)LYRE.fxSend({k:'dcx',id:D.id,s:shot?1:0})},
  byId(id){return this.list.find(D=>D.id===id)||null},
  near(x,z,r){return this.list.filter(D=>Math.hypot(D.x-x,D.z-z)<r)},
  clear(){for(const D of this.list.slice()){worldRemoveDyn(D.box);R.scene.remove(D.m);D.m.material.dispose()}this.list=[]}};

// ---------- stage 3: the summit gate's console (hold E 10 s, two at once 1.5×; it runs back slowly when nobody is on it) ----------
// the progress lives in EP.obj.ps[0] (the chapter snapshot carries it); the host counts who holds it
const GATEC={T:10,
  near(h){const g=MAP.ez&&MAP.ez.gateC;return !!g&&Math.hypot(h.c.x-g.bx,h.c.z-g.bz)<1.7&&Math.abs(h.c.y-g.y)<1.8},
  p(){return EP.obj.ps[0]||0},done(){return this.p()>=this.T},
  tick(dt){if(EP.st!==3||EP.ph!=='run'||this.done())return;let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===103&&G.t>=(h.useBlk||0)&&this.near(h))n++;
    const ps=EP.obj.ps,v=ps[0]||0;ps[0]=n?Math.min(this.T,v+dt*(n>1?1.5:1)):Math.max(0,v-dt*.3);if(ps[0]>=this.T)LYRE.fx({k:'gt'})}};

// ---------- LYREBIRD ----------
const _lyV=new THREE.Vector3(),_lyM=new THREE.Matrix4();
const LYRE={cur:null,encNext:false,revT:0,trT:0,trP:null,rigs:{},
  zc:'lyrebird',name:['라이어버드','LYREBIRD'],code:'RT1-05',ticks:[65,30],g2:['무전기 배낭','RADIO PACK'],darkPh:0,
  wake:['라이어버드가 사냥을 시작하기까지','LYREBIRD starts hunting in'],goText:['라이어버드가 안개 속으로 사라졌다','LYREBIRD IS IN THE FOG'],deadText:['라이어버드 무력화','LYREBIRD IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(19000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.ly&&a.ly.enc)},
  fx(m){this.fxApply(m);if(NET.host)netEv('ely',m)},
  fxSend(m){if(NET.host)netEv('ely',m)},
  zone(){return EP.st===3?'C':'D'},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: crouched on the signals block's roof, listening (a phase replay: a mast platform)
  prepSpawn(kind,bp){let b=EP.bossA();const P=MAP.ez.perch.D,p=kind==='phase'?P[bp===2?0:2]:P[3];
    if(!b)b=this.spawn([p.x,p.y,p.z],0,false);else if(kind!=='phase')this.init(b,false);if(!b)return;if(kind==='phase')this.reset(b,bp);
    placeAt(b,p.x,p.y,p.z,.9);const S=b.ly;S.idle=true;S.perch=kind==='phase'?(bp===2?0:2):3;b.lyPose='perch'},
  go(b){const S=b.ly;if(!S)return;S.idle=false;S.pt=.8;S.mode='pc';S.mt=rr(1,2)},
  // the first meeting (stage 3): up on the radar block, then stalking the team across the compound; gone once it has lost 15 %
  meetStart(E){const p=MAP.ez.perch.C[1],a=this.spawn([p.x,p.y,p.z],Math.PI/2,true);if(a){E.a=a;const S=a.ly;S.idle=false;S.perch=1;S.mode='pc';S.mt=2.5;S.cd.fr=5;S.cd.dc=14}
    EP.say('enc');EP.later(2.6,()=>EP.say('enc2'))},
  meetTick(){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.ly)this.retreat(E.a)},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='lyrebird';a.deadT=99;this.encNext=!!enc;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){const m=a.maxHp||1;
    a.ly={ph:1,mode:'',mt:0,mt0:1,pt:1.5,cd:{pn:3,cl:2,fr:enc?5:9,mi:6,so:8,ec:7,ds:4,fs:9,dp:0,dc:enc?14:12,cb:rr(18,25)},grog:0,grogN:0,grogMax:100,invT:0,enr:false,fightT:0,enc:!!enc,idle:!enc,
      tg:null,vic:null,pinT:0,pinDmg:0,pinTick:0,amb:false,fp:null,packMax:m*.08,packHp:m*.08,packOn:true,sacT:0,dsg:null,stunT:0,perch:-1,lurk:null,goT:0,sx:0,sz:0,stuck:0,
      hurt:[],stalkT:0,fsP:null,dpN:0};
    a.lyPose='perch';a.lyAs=null;a.epAsH=false;a.epName='';a.kin=null;a.epHide=true;a.epDown=0},
  reset(a,ph){const S0=a.ly,pk=S0?S0.packOn:true,ph0=S0?S0.packHp:0;a.hp=a.maxHp*LY_PH[ph-1];this.init(a,false);const S=a.ly;S.ph=ph;S.idle=true;S.packOn=pk;if(S0)S.packHp=ph0;
    a.leapV=null;a.kin=null;a.kvx=a.kvz=0;a.frozen=0},
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=Math.atan2(-(x-a.c.x),-(z-a.c.z))},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}const M=MAP.ez.mid;return n?[x/n,M[1],z/n]:[M[0],M[1],M[2]]},
  nearH(a,r,dy){let best=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<(dy||2)){bd=d;best=h}}return best},
  // whom it hunts: the one furthest from the others, facing away, not too far
  prey(a,S){let best=null,bs=-1e9;for(const h of SCEN.H){if(!h.alive||h.grabT>0)continue;let iso=1e9;for(const o of SCEN.H)if(o!==h&&o.alive)iso=Math.min(iso,Math.hypot(o.c.x-h.c.x,o.c.z-h.c.z));if(iso>1e8)iso=30;
      const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d>70)continue;const fx=-Math.sin(h.yaw),fz=-Math.cos(h.yaw),look=((a.c.x-h.c.x)*fx+(a.c.z-h.c.z)*fz)/(d||1);
      const s=Math.min(iso,20)-d*.25+(look<.3?5:0)+(S.tg===h?3:0)+rr(0,2);if(s>bs){bs=s;best=h}}return best},
  // a spot to come at the prey from: behind it in the fog, 8–12 m off, nobody else close to it (the cliff side preferred up top)
  lurkFor(a,h){const fx=-Math.sin(h.yaw),fz=-Math.cos(h.yaw);let best=null,bs=1e9;
    for(let k=0;k<14;k++){const an=Math.atan2(-fx,-fz)+rr(-1.1,1.1),r=rr(8,12),x=h.c.x+Math.sin(an)*r*-1,z=h.c.z+Math.cos(an)*r*-1;const n=navSnap(x,h.c.y,z,3);if(!n||Math.abs(n.y-h.c.y)>2.5)continue;
      let s=Math.hypot(n.x-a.c.x,n.z-a.c.z)*.2+rr(0,2);for(const o of SCEN.H)if(o.alive&&o!==h&&Math.hypot(o.c.x-n.x,o.c.z-n.z)<6)s+=12;if(EP.st===4&&n.z<MAP.ez.cliffZ)s-=3;
      if(s<bs){bs=s;best=[n.x,n.y,n.z]}}return best||[h.c.x-fx*9,h.c.y,h.c.z-fz*9]},
  // ---------- host: the brain (EPZ.lyrebird.ai, every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.ly;if(!S)return true;const c=a.c,cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;
    S.invT=Math.max(0,S.invT-dt);S.sacT=Math.max(0,S.sacT-dt);S.stunT=Math.max(0,S.stunT-dt);
    if(a.frozen>0){a.frozen=0;c.vx=c.vz=0;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=EP.ph==='run'&&!S.idle&&S.mode!=='gone';
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('lyEnr')}}
    const cdm=S.enr?1/.7:1;for(const k in S.cd)S.cd[k]-=dt*cdm;a.spdMul=(S.enr?1.2:1);
    for(let i=S.hurt.length-1;i>=0;i--)if(G.t-S.hurt[i][0]>3)S.hurt.splice(i,1);
    if(!live){a.lyPose=S.perch>=0?'perch':'';if(S.mode==='ret'||S.mode==='ret2'){S.mt-=dt;this.step(a,dt,S)}return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(a.kin)return true;
    this.think(a,dt,S);return true},
  think(a,dt,S){const c=a.c,P=S.enc?1:S.ph;a.lyPose='run';
    S.pt-=dt;if(S.pt>0){this.stalk(a,dt,S);return}S.pt=.3;
    const near=this.nearH(a,2.4,1.6);
    if(near&&S.cd.cl<=0){S.cd.cl=4;this.clawW(a,near,S);return}
    // its voices first (they need the pack for the fake radio and the mirages)
    if(S.packOn&&S.cd.fr<=0&&(P>1||a.hp<=a.maxHp*.9||S.enc)){S.cd.fr=rr(30,40);S.mode='fr';S.mt=S.mt0=1.2*EPTW();S.sacT=S.mt+.3;this.fx({k:'w',i:a.id,s:'fr'});return}
    if(S.cd.dc<=0&&(P>1||a.hp<=a.maxHp*.85||S.enc)){S.cd.dc=rr(20,26);S.mode='dc';S.mt=.6;this.fx({k:'w',i:a.id,s:'dc'});return}
    if(P===2){
      if(S.packOn&&S.cd.mi<=0&&this.mirN()<2){S.cd.mi=20;S.mode='mi';S.mt=.8;S.sacT=1;this.fx({k:'w',i:a.id,s:'mi'});return}
      if(S.cd.so<=0&&this.nearH(a,22,4)){S.cd.so=15;S.mode='so';S.mt=S.mt0=1*EPTW();S.sacT=S.mt+.4;this.fx({k:'w',i:a.id,s:'so'});return}
      if(S.cd.ec<=0){S.cd.ec=12;this.echo(a)}}
    if(P===3){
      if(S.cd.ds<=0&&!S.dsg){S.cd.ds=28;this.disguise(a,S);return}
      if(S.cd.fs<=0){S.cd.fs=30;this.fakeSiren(a,S);return}}
    // up a wall now and then, or when it is being shot up (6 % in 3 s)
    let hurt=0;for(const q of S.hurt)hurt+=q[1];
    if(S.cd.cb<=0||hurt>a.maxHp*.07){S.cd.cb=rr(18,25);S.hurt=[];if(this.climb(a,S))return}
    // the pounce: close enough and in sight
    const t=S.tg&&S.tg.alive?S.tg:null;
    if(t&&S.cd.pn<=0){const d=Math.hypot(t.c.x-c.x,t.c.z-c.z);if(d<13&&d>2&&Math.abs(t.c.y-c.y)<3&&losClear(c.x,c.y+1.2,c.z,t.c.x,t.c.y+1.1,t.c.z)&&(d<9||S.stalkT>6||!this.faces(t,a))){this.pounceW(a,t,S,false);return}}
    this.stalk(a,dt,S)},
  faces(h,a){const fx=-Math.sin(h.yaw),fz=-Math.cos(h.yaw),dx=a.c.x-h.c.x,dz=a.c.z-h.c.z,d=Math.hypot(dx,dz)||1;return (dx*fx+dz*fz)/d>.55},
  // stalking: on all fours to the lurk spot behind its prey (fresh every 1.5 s)
  stalk(a,dt,S){const c=a.c;S.stalkT+=dt;S.goT-=dt;
    if(!S.tg||!S.tg.alive||S.goT<=0){const t=this.prey(a,S);if(t!==S.tg)S.stalkT=0;S.tg=t;S.goT=1.5;if(t)S.lurk=S.fsP&&G.t<S.fsP.t?S.fsP.p:S.fp&&G.t-S.fp.t<18?[S.fp.x,S.fp.y,S.fp.z]:this.lurkFor(a,t)}
    if(!S.lurk){a.lyPose='stand';return}this.walk(a,dt,S,S.lurk,1.2)},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;if(Math.hypot(p[0]-c.x,p[2]-c.z)<1.2){a.lyPose='stand';return}
    if(!B.path||B.pi>=B.path.length||!B.lyG||Math.hypot(B.lyG[0]-p[0],B.lyG[2]-p[2])>1.5){B.lyG=p;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,11);AI.moveDir(a,wx,wz)}a.spdMul*=mul;
    if(Math.hypot(c.x-S.sx,c.z-S.sz)>.6){S.sx=c.x;S.sz=c.z;S.stuck=0}else{S.stuck+=dt;if(S.stuck>2.5){S.stuck=0;S.goT=0;B.path=null;this.climb(a,S)}}},
  // ---------- the pounce ----------
  pounceW(a,t,S,amb){S.tg=t;S.mode='pw';S.mt=S.mt0=.5*EPTW();S.amb=amb||(S.fp&&G.t-S.fp.t<20&&Math.hypot(t.c.x-S.fp.x,t.c.z-S.fp.z)<6)||(S.fsP&&G.t<S.fsP.t+2&&Math.hypot(t.c.x-S.fsP.p[0],t.c.z-S.fsP.p[2])<7);S.cd.pn=10;this.face(a,t.c.x,t.c.z);this.fx({k:'w',i:a.id,s:'pw'})},
  pounce(a,S){const t=S.tg;if(!t||!t.alive){S.mode='';S.pt=.4;return}const c=a.c,tx=t.c.x+t.c.vx*.3,tz=t.c.z+t.c.vz*.3,d=Math.hypot(tx-c.x,tz-c.z),T=clamp(d/17,.32,.85);
    S.mode='pl';S.mt=T+1;epKin(a,tx,t.c.y,tz,T,clamp(.8+d*.06,.8,1.8),()=>this.land(a,S));this.fx({k:'w',i:a.id,s:'pl'})},
  land(a,S){S.mode='';const c=a.c;let v=null,bd=1.6;for(const h of SCEN.H){if(!h.alive||h.grabT>0)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<bd&&Math.abs(h.c.y-c.y)<1.6){bd=d;v=h}}
    if(v){this.pin(a,S,v);return}SCEN.slamFx(c.x,c.y,c.z);const n=this.nearH(a,2.6,1.6);if(n&&S.cd.cl<=1){S.cd.cl=4;this.clawW(a,n,S);return}S.pt=.5},
  pin(a,S,v){S.mode='pin';S.mt=2;S.vic=v;S.pinDmg=0;S.pinTick=.25;v.grabT=2.3;v.rootT=2.3;v.lyPin=2.3;epFx(v,'kd',2.2);a.kin=null;hurtHuman(v,EPD(S.enc?8:S.amb?18:12),a,{claw:1});this.fx({k:'pn',i:a.id,v:v.id,b:S.amb?1:0});
    if(!EP.grabSaid){EP.grabSaid=1}EP.say(S.amb?'lyAmb':'lyPin')},
  release(a,S,freed){const v=S.vic;S.vic=null;if(v){v.grabT=0;v.rootT=0;v.lyPin=0}this.fx({k:'ug',i:a.id,v:v?v.id:-1,f:freed?1:0});S.amb=false;S.fp=null;
    if(freed){S.mode='stun';S.mt=1;S.stunT=1;EP.say('lyFree');return}
    // phase 3: straight on to a second one
    if(S.ph===3&&!S.enc&&S.cd.dp<=0){const t2=this.prey(a,S);if(t2&&t2!==v&&Math.hypot(t2.c.x-a.c.x,t2.c.z-a.c.z)<14){S.cd.dp=14;S.cd.pn=0;this.pounceW(a,t2,S,false);return}}
    this.away(a,S)},
  // off the one it has just let go: a leap into the fog (or up a wall)
  away(a,S){if(Math.random()<.25&&this.climb(a,S))return;const C=this.cen(),dx=a.c.x-C[0],dz=a.c.z-C[2],l=Math.hypot(dx,dz)||1;let n=null;
    for(let k=0;k<10&&!n;k++){const an=Math.atan2(dx,dz)+rr(-.9,.9),r=rr(10,15),m=navSnap(a.c.x+Math.sin(an)*r,a.c.y,a.c.z+Math.cos(an)*r,3);if(m&&Math.abs(m.y-a.c.y)<3)n=m}
    if(!n){S.mode='';S.pt=.6;return}const d=Math.hypot(n.x-a.c.x,n.z-a.c.z);S.mode='aw';S.mt=3;epKin(a,n.x,n.y,n.z,clamp(d/15,.5,1.1),1.6,()=>{S.mode='';S.pt=.8;S.goT=0});this.fx({k:'w',i:a.id,s:'aw'})},
  // ---------- claws ----------
  clawW(a,t,S){S.tg=t;S.mode='cw';S.mt=S.mt0=.4*EPTW();S.cn=0;this.face(a,t.c.x,t.c.z);this.fx({k:'w',i:a.id,s:'cw'})},
  clawHit(a,S){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);a.an.atk=1;a.an.atkD=.25;a.an.atkSide=S.cn%2?1:-1;
    for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-a.c.x,dz=h.c.z-a.c.z,d=Math.hypot(dx,dz);if(d>2.9||Math.abs(h.c.y-a.c.y)>1.8||(dx*fx+dz*fz)/(d||1)<.2)continue;
      SCEN.pushHuman(h,fx*3,1,fz*3);hurtHuman(h,EPD(15),a,{claw:1})}this.fx({k:'cs',i:a.id,n:S.cn})},
  // ---------- climbing: a perch in this part of the station, away from the team, out of reach ----------
  climb(a,S){const L=MAP.ez.perch[this.zone()];if(!L)return false;const C=this.cen();let best=-1,bs=1e9;
    for(let k=0;k<L.length;k++){if(k===S.perch)continue;const P=L[k],d=Math.hypot(P.x-a.c.x,P.z-a.c.z);if(d>34)continue;let s=d*.3+rr(0,6);const dc=Math.hypot(P.x-C[0],P.z-C[2]);s+=dc<8?20:Math.abs(dc-16)*.4;
      for(const h of SCEN.H)if(h.alive&&Math.hypot(h.c.x-P.x,h.c.z-P.z)<4)s+=25;if(s<bs){bs=s;best=k}}
    if(best<0)return false;const P=L[best],d=Math.hypot(P.x-a.c.x,P.z-a.c.z);S.perch=-1;S.mode='cb';S.mt=3;a.lyPose='leap';
    epKin(a,P.x,P.y,P.z,clamp(.55+d/18,.7,1.6),clamp(1.5+(P.y-a.c.y)*.25,1.5,4),()=>{S.perch=best;S.mode='pc';S.mt=rr(1,1.8)});this.fx({k:'w',i:a.id,s:'cb'});return true},
  // off a perch: a pounce on whoever is below within 14 m, else down into the fog
  fromPerch(a,S){const t=this.prey(a,S);if(t&&S.cd.pn<=2){const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d<15&&losClear(a.c.x,a.c.y+1.2,a.c.z,t.c.x,t.c.y+1.1,t.c.z)){S.perch=-1;this.pounceW(a,t,S,false);S.mt=.35;return}}
    const t2=t||SCEN.H.find(h=>h.alive);if(!t2){S.mode='';return}const p=this.lurkFor(a,t2),d=Math.hypot(p[0]-a.c.x,p[2]-a.c.z);S.perch=-1;S.mode='pd';S.mt=3;
    epKin(a,p[0],p[1],p[2],clamp(.5+d/18,.6,1.4),1,()=>{S.mode='';S.pt=.4;S.goT=0;S.tg=t2;S.lurk=p});this.fx({k:'w',i:a.id,s:'cb'})},
  // ---------- the fake radio: a teammate's name, a line, a ping where it will wait ----------
  fakeRadio(a,S){const H=SCEN.H.filter(h=>h.alive);if(!H.length)return;const C=this.cen();
    // the one it speaks as: whoever is furthest from the others; the spot: 12–24 m from the team, off to the side it came from
    let X=H[0],bx=-1;for(const h of H){const d=Math.hypot(h.c.x-C[0],h.c.z-C[2]);if(d>bx){bx=d;X=h}}
    let spot=null;for(let k=0;k<16&&!spot;k++){const an=Math.atan2(a.c.x-C[0],a.c.z-C[2])+rr(-1,1),r=rr(12,22),n=navSnap(C[0]+Math.sin(an)*r,C[1],C[2]+Math.cos(an)*r,3);
      if(!n)continue;let ok=true;for(const h of H)if(Math.hypot(h.c.x-n.x,h.c.z-n.z)<9)ok=false;if(ok)spot=n}
    if(!spot)spot={x:a.c.x,y:a.c.y,z:a.c.z};const m=Math.floor(Math.random()*LY_FAKE.length);
    S.fp={x:spot.x,y:spot.y,z:spot.z,t:G.t};S.lurk=[spot.x,spot.y,spot.z];S.goT=3;
    this.fx({k:'fr',i:a.id,o:X.id,m,x:r2(spot.x),y:r2(spot.y+.2),z:r2(spot.z)});if(!this.frSaid){this.frSaid=1;EP.later(3.4,()=>EP.say('lyFake'))}},
  // a teammate's line on the chat and their ping (every page; on the copied player's own page another teammate's name is used)
  fakeShow(m){const L=LI(),P=G.player;let X=byIdAny(m.o);if(X&&X===P){X=SCEN.H.find(h=>h!==P&&h.alive)||null}
    const n=X?X.name:null,x=m.x/100,y=m.y/100,z=m.z/100;if(n&&typeof CHAT!=='undefined')CHAT.add({n,m:LY_FAKE[m.m%LY_FAKE.length][L],tm:1,tc:TH});
    if(n)PING.add({n,tc:TH,x,y,z,by:-2});const a=byIdAny(m.i);if(a)AU.at('lycall',a.c.x,a.c.y+1.6,a.c.z,{vol:.9,range:45})},
  // ---------- the decoy radio ----------
  decoy(a,S){const C=this.cen();let n=null;for(let k=0;k<12&&!n;k++){const an=Math.random()*TAU,r=rr(9,15),m=navSnap(C[0]+Math.sin(an)*r,C[1],C[2]+Math.cos(an)*r,3);
      if(m&&!SCEN.H.some(h=>h.alive&&Math.hypot(h.c.x-m.x,h.c.z-m.z)<6))n=m}
    if(!n)return;DECOY.add(n.x,n.y,n.z);if(!this.dcSaid){this.dcSaid=1;EP.later(4,()=>EP.say('lyDecoy'))}},
  // ---------- phase 2: mirages, the sonic cry, echoes ----------
  mirN(){let n=0;for(const z of SCEN.Z)if(z.alive&&z.zc==='mirage')n++;return n},
  mirages(a,S){const H=SCEN.H.filter(h=>h.alive);if(!H.length)return;const n=Math.min(3,1+SCEN.H.length>>1)+(Math.random()<.5?1:0);let made=0;
    for(let k=0;k<30&&made<n;k++){const h=rpick(H),an=Math.random()*TAU,r=rr(9,17),m=navSnap(h.c.x+Math.sin(an)*r,h.c.y,h.c.z+Math.cos(an)*r,3);if(!m||Math.abs(m.y-h.c.y)>2.5)continue;
      if(H.some(o=>Math.hypot(o.c.x-m.x,o.c.z-m.z)<7))continue;const X=rpick(H),z=SCEN.spawn('mirage',[m.x,m.y,m.z]);if(!z)continue;MIRAGE.make(z,X);made++}
    if(made&&!this.miSaid){this.miSaid=1;EP.later(2.5,()=>EP.say('lyMir'))}},
  sonic(a){const c=a.c;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<25&&Math.abs(h.c.y-c.y)<8){epFx(h,'dz',2);if(d<18)hurtHuman(h,EPD(14*(1-d/30)),a,{})}}
    this.fx({k:'so',i:a.id,x:r2(c.x),y:r2(c.y),z:r2(c.z)});EP.say('lySonic')},
  // the last gun one of them fired, heard again from the other side of them
  echo(a){let src=null,lf=-9;for(const h of SCEN.H)if(h.alive&&(h.lastFire||-9)>lf){lf=h.lastFire;src=h}if(!src||G.t-lf>6)return;const W=WPN[src.cur];if(!W||!W.snd)return;
    const C=this.cen(),an=Math.atan2(C[0]-a.c.x,C[2]-a.c.z)+rr(-.6,.6),x=C[0]+Math.sin(an)*16,z=C[2]+Math.cos(an)*16;this.fx({k:'ec',w:src.cur,x:r2(x),y:r2(C[1]+1.2),z:r2(z)})},
  // ---------- phase 3: the disguise, the fake siren ----------
  disguise(a,S){let X=null,bs=-1;for(const h of SCEN.H){if(!h.alive)continue;const s=(h.dmgRound||0)+(h.kills||0)*100;if(s>bs){bs=s;X=h}}if(!X)return;
    // (out of sight first: a hop into the fog)
    S.dsg={as:X.id,t:8,T:8,dmg:0};S.mode='ds';S.mt=8;S.tg=X;this.fx({k:'ds',i:a.id,o:X.id});EP.later(1.5,()=>EP.say('lyDsg'))},
  undisguise(a,S,why){if(!S.dsg)return;S.dsg=null;this.fx({k:'rv',i:a.id});const t=this.nearH(a,13,3)||this.prey(a,S);if(t){S.cd.pn=0;this.pounceW(a,t,S,true);S.mt=.3}else{S.mode='';S.pt=.4}},
  fakeSiren(a,S){const L=SIREN.L;if(!L.length)return;let i=0,bd=1e9;for(const T of L){const d=Math.hypot(T.s.x-a.c.x,T.s.z-a.c.z)+(T.lit>0?100:0);if(d<bd){bd=d;i=T.i}}
    const s=L[i].s,n=navSnap(s.x+rr(-4,4),s.y,s.z+rr(-6,-3),3)||{x:s.x,y:s.y,z:s.z-4};S.fsP={p:[n.x,n.y,n.z],t:G.t+9};S.lurk=S.fsP.p;S.goT=4;this.fx({k:'fs',i});EP.later(2.2,()=>EP.say('lyFS'))},
  // ---------- the modes ----------
  step(a,dt,S){const c=a.c;
    switch(S.mode){
    case 'pw':{a.lyPose='perch';const t=S.tg;if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0)this.pounce(a,S);break}
    case 'pl':{a.lyPose='leap';if(!a.kin&&S.mt<0){S.mode='';S.pt=.4}break}
    case 'pin':{a.lyPose='pin';const v=S.vic;if(!v||!v.alive||v.team!==TH){this.release(a,S,false);break}v.grabT=Math.max(v.grabT,.3);v.rootT=Math.max(v.rootT,.3);v.lyPin=Math.max(v.lyPin||0,.3);
      const fx=-Math.sin(v.yaw),fz=-Math.cos(v.yaw),px=v.c.x+fx*.5,pz=v.c.z+fz*.5;if(charFits(c,px,v.c.y,pz)){c.x=px;c.z=pz;c.y=v.c.y}c.vx=c.vz=0;a.kvx=a.kvz=a.mvx=a.mvz=0;this.face(a,v.c.x,v.c.z);
      S.pinTick-=dt;if(S.pinTick<=0){S.pinTick=.25;hurtHuman(v,EPD((S.enc?12:18)*.25*(S.amb?1.5:1)),a,{claw:1})}
      if(S.pinDmg>=a.maxHp*.035){this.release(a,S,true);break}if(S.mt<=0)this.release(a,S,false);break}
    case 'aw':{a.lyPose='leap';if(!a.kin&&S.mt<0){S.mode='';S.pt=.5}break}
    case 'cw':{a.lyPose='claw';const t=S.tg;if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0){S.mode='cs';S.mt=.2;S.cn=0;this.clawHit(a,S)}break}
    case 'cs':{a.lyPose='claw';const t=S.tg;if(t&&t.alive)this.face(a,t.c.x,t.c.z);if(S.mt<=0){S.cn++;if(S.cn<3){S.mt=.2;this.clawHit(a,S)}else{S.mode='';S.pt=.5;if(Math.random()<.5)this.away(a,S)}}break}
    case 'cb':{a.lyPose='leap';if(!a.kin&&S.mt<0){S.mode='';S.pt=.4}break}
    case 'pc':{a.lyPose='perch';const t=this.prey(a,S);if(t)this.face(a,t.c.x,t.c.z);if(S.mt<=0)this.fromPerch(a,S);break}
    case 'pd':{a.lyPose='leap';if(!a.kin&&S.mt<0){S.mode='';S.pt=.4}break}
    case 'fr':{a.lyPose='mimic';if(S.mt<=0){this.fakeRadio(a,S);S.mode='';S.pt=.3}break}
    case 'dc':{a.lyPose='stand';if(S.mt<=0){this.decoy(a,S);S.mode='';S.pt=.3}break}
    case 'mi':{a.lyPose='mimic';if(S.mt<=0){this.mirages(a,S);S.mode='';S.pt=.4}break}
    case 'so':{a.lyPose='sonic';if(S.mt<=0){this.sonic(a);S.mode='so2';S.mt=.6}break}
    case 'so2':{a.lyPose='sonic';if(S.mt<=0){S.mode='';S.pt=.5}break}
    // disguised: it walks up to the team as one of them; close to someone, shot, or out of time: it shows itself and pounces
    case 'ds':{a.lyPose='dsg';const D=S.dsg;if(!D){S.mode='';break}D.t-=dt;const C=this.cen(),t=this.nearH(a,3.2,2);
      if(t||D.dmg>=a.maxHp*.02||D.t<=0){this.undisguise(a,S);break}this.walk(a,dt,S,[C[0],C[1],C[2]],.62);break}
    case 'stun':{a.lyPose='stun';if(S.mt<=0){S.mode='';S.pt=.4;if(Math.random()<.6)this.away(a,S)}break}
    case 'down':{a.lyPose='down';a.kvx*=.8;a.kvz*=.8;if(S.mt<=0){S.mode='';S.pt=.5;this.fx({k:'up',i:a.id})}break}
    case 'ph':{a.lyPose='sonic';if(S.mt<=0){S.mode='';S.pt=.5;this.away(a,S)}break}
    case 'ret':{a.lyPose='stand';if(S.mt<=0){const g=MAP.ez.goal.g.p;S.mode='ret2';S.mt=3;epKin(a,g[0]+4,g[1]+5,g[2]-6,1.2,3,()=>{S.mode='gone';EP.meetEnd(a)});this.fx({k:'w',i:a.id,s:'cb'})}break}
    case 'ret2':{a.lyPose='leap';break}
    default:{if(!a.kin&&S.mt<-1){S.mode=''}}}},
  // ---------- stagger, downs, the siren ----------
  grog(a,v){const S=a.ly;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='ph'||S.mode==='gone')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6);EP.say('lyDown')}},
  down(a,t){const S=a.ly;if(S.mode==='ph'||S.mode==='gone'||S.mode==='ret'||S.mode==='ret2')return;if(S.vic)this.release(a,S,true);if(S.dsg){S.dsg=null;this.fx({k:'rv',i:a.id,q:1})}
    S.grog=0;S.perch=-1;const c=a.c;this.fx({k:'dn',i:a.id});
    if(a.kin||c.y>MAP.ez.mid[1]+1.5&&EP.st===4||EP.st===3&&c.y>7.5){const n=navSnap(c.x+rr(-2,2),c.y-3,c.z+rr(-2,2),6)||{x:c.x,y:c.y,z:c.z};S.mode='fall';S.mt=3;epKin(a,n.x,n.y,n.z,.6,.3,()=>{S.mode='down';S.mt=t;this.fx({k:'land',x:r2(n.x),y:r2(n.y),z:r2(n.z)})})}
    else{a.kin=null;S.mode='down';S.mt=t}},
  // a siren went off (host): its outline for everyone, the fog away; within 25 m it is knocked off its feet for 3 s
  sirenHit(i){const b=EP.bossA(),S=b&&b.ly,T=SIREN.L[i];if(!S||!T)return;
    for(const z of SCEN.Z)if(z.alive&&z.zc==='mirage'&&Math.hypot(z.c.x-T.s.x,z.c.z-T.s.z)<40)MIRAGE.vanish(z);for(const D of DECOY.near(T.s.x,T.s.z,40))DECOY.kill(D,1);
    if(S.enc||S.invT>0||S.mode==='gone')return;const d=Math.hypot(b.c.x-T.s.x,b.c.z-T.s.z);if(d>25)return;
    if(S.dsg){S.dsg=null;this.fx({k:'rv',i:b.id,q:1})}if(S.vic)this.release(b,S,true);this.grog(b,40);if(S.mode==='down'||S.mode==='fall')return;
    const c=b.c;S.perch=-1;S.mode='stun';S.mt=3;S.stunT=3;if(b.kin||c.y>T.s.y+1.5){const n=navSnap(c.x,T.s.y,c.z,6)||{x:c.x,y:T.s.y,z:c.z};epKin(b,n.x,n.y,n.z,.55,.3,null)}this.fx({k:'stn',i:b.id});EP.say('lyStun')},
  // ---------- phases ----------
  floorHit(a){const S=a.ly;if(S.enc){if(S.mode!=='ret'&&S.mode!=='ret2'&&S.mode!=='gone'){S.invT=99;this.retreat(a)}return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  retreat(a){const S=a.ly;S.invT=99;if(S.vic)this.release(a,S,false);a.kin=null;S.mode='ret';S.mt=.8;this.fx({k:'roar',i:a.id});EP.say('lyRet')},
  toPhase(a,n){const S=a.ly;if(S.vic)this.release(a,S,false);if(S.dsg){S.dsg=null;this.fx({k:'rv',i:a.id,q:1})}S.ph=n;S.invT=1.6;S.grog=0;S.perch=-1;S.fp=null;S.fsP=null;a.kin=null;
    Object.assign(S.cd,{pn:2,cl:1,fr:6,mi:3,so:7,ec:5,ds:4,fs:10,dp:0,dc:9,cb:rr(12,16)});EP.bossPh=n;S.mode='ph';S.mt=1.6;this.fx({k:'ph',n,i:a.id});EP.reviveAll();
    if(n===2){this.summon(a,[['radioman',2],['spore',2]]);EP.say('lyP2')}else{this.summon(a,[['squad',2],['runner',2]]);EP.say('lyP3')}},
  summon(a,L){const k=a.ly&&a.ly.enr?2:1;for(const [zc,n] of L)for(let i=0;i<n*k;i++)SCEN.spawn(zc)},
  // ---------- host: damage in ----------
  hit(t,dmg,src,o){const S=t.ly;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret'||S.mode==='ret2')return 0;let mul=1;const V=t.lyV;
    if(t.kin||S.perch>=0){o.kb=0;o.up=0}else o.kb=(o.kb||0)*.35;
    // the throat sac (open while it mimics or cries), the radio pack on its back
    if(V&&o.x!=null){if(S.sacT>0&&Math.hypot(o.x-V.sac.x,o.y-V.sac.y,o.z-V.sac.z)<.34){mul*=2.5;this.grog(t,Math.min(12,dmg*.025));if(src&&src.isPlayer)HUD.hitmark(true)}
      else if(S.packOn&&!S.dsg&&Math.hypot(o.x-V.pack.x,o.y-V.pack.y,o.z-V.pack.z)<.42){const q=o.dir,fx=-Math.sin(t.yaw),fz=-Math.cos(t.yaw);mul*=.6;
        // (only from behind it or from above: a shot from the front ends in its shoulders)
        if(!q||q[0]*fx+q[2]*fz>.25||q[1]<-.5){S.packHp-=dmg;if(S.packHp<=0)this.packBreak(t,S)}}}
    if(S.mode==='down'||S.mode==='fall')mul*=1.5;else if(S.mode==='stun')mul*=1.25;if(o.he)this.grog(t,15);
    let out=dmg*mul;const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    const fl=t.maxHp*(S.enc?.85:S.ph===1?LY_PH[1]:S.ph===2?LY_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    return out},
  after(t,r,src,o){const S=t.ly;if(!S)return;S.hurt.push([G.t,r]);if(S.vic&&src&&src!==S.vic)S.pinDmg+=r;if(S.dsg)S.dsg.dmg+=r;
    // the pinned player's own knife frees them (their blade is the only thing they can swing)
    if(S.vic&&src===S.vic&&o&&o.knife)this.release(t,S,true)},
  packBreak(t,S){if(!S.packOn)return;S.packOn=false;S.packHp=0;for(const z of SCEN.Z)if(z.alive&&z.zc==='mirage')MIRAGE.vanish(z);this.fx({k:'pk',i:t.id});EP.say('lyPack');this.down(t,6)},
  // ---------- host, every frame: the siren boxes, the minions ----------
  hostTick(dt){GATEC.tick(dt);const b=EP.bossA(),S=b&&b.ly,run=EP.st===4&&EP.ph==='run';
    for(const T of SIREN.L){if(T.cd>0)T.cd=Math.max(0,T.cd-dt);
      if(run&&T.cd<=0&&SIREN.live(T)){let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+T.i&&G.t>=(h.useBlk||0)&&SIREN.near(T,h))n++;
        if(n){T.p+=dt*(n>1?1.25:1);if(T.p>=SIREN.T){T.p=0;this.sirenFire(T.i)}}else T.p=Math.max(0,T.p-dt*2)}else T.p=0}
    if(!S||!run||S.idle)return;EP.trickle(dt,LY_MIX,[.3,.36,.4][S.ph-1]*(S.enr?1.6:1))},
  sirenFire(i){const T=SIREN.L[i];if(!T)return;T.cd=45;this.fx({k:'sr',i});this.sirenHit(i);if(!this.srSaid){this.srSaid=1;EP.later(.8,()=>EP.say('lySiren'))}},
  // ---------- bots ----------
  // together round the centre siren (spread on a ring), in on it while it is down or stunned, one of them to a siren box when it would
  // catch LYREBIRD in its 25 m (or clear the mirages)
  botGoal(a,i){const b=EP.bossA();if(!b||!b.ly||EP.ph!=='run')return null;const S=b.ly,E=MAP.ez;
    const duty=this.sirenDuty(a);if(duty)return duty;
    if((S.mode==='down'||S.mode==='stun')&&Math.abs(b.c.y-E.mid[1])<2){const an=i*1.7+.4;return [b.c.x+Math.cos(an)*5,b.c.y,b.c.z+Math.sin(an)*5,1.4]}
    const R0=E.rally,p=R0[i%R0.length];return [p[0],p[1],p[2],1.2]},
  sirenDuty(a){const b=EP.bossA(),S=b&&b.ly;if(!S||S.dsg)return null;let best=null,bd=1e9;
    for(const T of SIREN.L){if(T.cd>0||!SIREN.live(T))continue;const db=Math.hypot(b.c.x-T.s.x,b.c.z-T.s.z),mir=this.mirN();if(db>22&&mir<2)continue;
      let nb=null,nd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-T.s.bx,h.c.z-T.s.bz);if(d<nd){nd=d;nb=h}}if(nb===a&&nd<bd){bd=nd;best=[T.s.bx,T.s.y,T.s.bz+.3,.3]}}return best},
  goalTag(b){const S=b.ly;return S?(S.mode==='down'||S.mode==='stun'?'d':'')+(SIREN.L.map(T=>T.cd>0?0:1).join('')):''},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;if(j===3)return EP.st===3&&!GATEC.done()?3:-1;const T=SIREN.L[j];if(!T||T.cd>0||!SIREN.live(T))return -1;const b=EP.bossA(),S=b&&b.ly;if(!S)return -1;
    const db=Math.hypot(b.c.x-T.s.x,b.c.z-T.s.z);return db<23||this.mirN()>=2?j:-1},
  danger(){return null},
  useNear(h){if(!EP.on||EP.id!==4)return -1;if(EP.st===3)return GATEC.near(h)&&!GATEC.done()?3:-1;for(const T of SIREN.L)if(SIREN.near(T,h))return T.i;return -1},
  useInfo(i,L){if(i===3)return GATEC.done()?null:{act:L?'unlock the summit gate':'정상 정문 잠금 해제',p:GATEC.p()/GATEC.T,x:0};const T=SIREN.L[i];if(!T)return null;if(!SIREN.live(T))return {act:L?'This siren is not wired up yet':'아직 전원이 안 들어온 사이렌',p:0,x:1};
    if(T.cd>0)return {act:(L?'The siren is recharging — ':'사이렌 재충전 — ')+Math.ceil(T.cd)+(L?'s':'초'),p:0,x:1};return {act:L?'sound the siren':'경보 사이렌 울리기',p:T.p/SIREN.T,x:0}},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==4)return;SIREN.update(dt);DECOY.update(dt);this.revT=Math.max(0,this.revT-dt);this.trT=Math.max(0,this.trT-dt);
    if(NET.cli){const f=EP.bf;if(f&&f.sr)SIREN.unpack(f.sr)}else this.hostTick(dt)},
  stageClear(){},
  clear(){DECOY.clear();this.cur=null;this.revT=this.trT=0;this.frSaid=this.dcSaid=this.miSaid=this.srSaid=0},
  // the boss bar (flags: 1 disguised, 2 down, 4 pinning, 8 invulnerable, 16 enraged, 32 first meeting, 64 outlined, 128 sac open,
  // 256 perched, 512 stunned)
  bsOf(b){const S=b.ly;return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
    f:(S.dsg?1:0)|(S.mode==='down'||S.mode==='fall'?2:0)|(S.vic?4:0)|(S.invT>0&&!S.enc?8:0)|(S.enr?16:0)|(S.enc?32:0)|(this.revT>0?64:0)|(S.sacT>0?128:0)|(S.perch>=0||S.mode==='cb'?256:0)|(S.mode==='stun'?512:0),
    pk:S.packOn?Math.round(S.packHp/S.packMax*100):-1,pose:Math.max(0,LY_POSE.indexOf(b.lyPose||'')),as:S.dsg?S.dsg.as:-1,vic:S.vic?S.vic.id:-1,sr:SIREN.pack()}},
  bsPack(b){if(!b.ly)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pk,B.pose,B.as,B.vic,B.sr]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pk:B[5],pose:B[6],as:B[7],vic:B[8],sr:B[9]||null}},
  hud(B,L){const f=B.f;
    return {ss:f&8?(L?'INVULNERABLE':'무적'):f&2?(L?'DOWN!':'그로기!'):f&512?(L?'STUNNED BY THE SIREN':'사이렌에 기절!'):f&4?(L?'IT HAS SOMEONE — SHOOT IT OFF':'붙잡았다 — 쏴서 떼어 내!'):f&128?(L?'THE THROAT SAC IS OPEN':'울음주머니가 열렸다 — 목을 쏴!'):f&16?(L?'ENRAGED':'광폭화'):'',
      cls:f&16||f&4?'r':f&2||f&512||f&128?'y':'',sp:(f&32?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(B.pk<0?(L?' · PACK BROKEN':' · 배낭 파괴'):''),g1:B.grog/(B.gmax||100),g2:B.pk<0?null:B.pk/100}},
  // the siren boxes (hot when one would catch it), LYREBIRD itself while it is outlined or traced
  markers(list,L,P){const Bs=EP.bs(),b=Bs&&Bs.a&&Bs.a.alive?Bs.a:null;
    for(const T of SIREN.L){if(!SIREN.live(T))continue;const d=Math.hypot(T.s.bx-P.c.x,T.s.bz-P.c.z),hot=b&&T.cd<=0&&!(Bs.f&1)&&Math.hypot(b.c.x-T.s.x,b.c.z-T.s.z)<25;
      if(T.cd>0){if(d<24)list.push([T.s.bx,T.s.y+2.4,T.s.bz,(L?'siren ':'사이렌 ')+Math.ceil(T.cd)+(L?'s':'초'),'s'])}
      else if(hot)list.push([T.s.bx,T.s.y+2.6,T.s.bz,L?'⚡ SOUND THE SIREN!':'⚡ 사이렌 울려!','p hot']);else list.push([T.s.bx,T.s.y+2.4,T.s.bz,L?'📢 siren':'📢 사이렌','p'])}
    if(b&&(this.revT>0||this.trT>0))list.push([b.c.x,(b.head?b.head.y:b.c.y+2)+.6,b.c.z,'LYREBIRD','b'])},
  // before the rig is posed (every page): the pose, the disguise (the rig it borrows), where the bots aim
  pre(a,dt){this.cur=a;const S=!NET.cli?a.ly:null,f=EP.bf&&EP.bf.id===a.id?EP.bf:null;let pose=a.lyPose||'',down=0,inv=false,enr=false,as=-1,sac=0,rev=this.revT>0||this.trT>0;
    if(S){down=S.mode==='down'||S.mode==='fall'?1:0;inv=S.invT>0&&!S.enc;enr=S.enr;as=S.dsg?S.dsg.as:-1;sac=S.sacT>0?1:0}
    else if(f){pose=LY_POSE[f.pose]||'';down=f.f&2?1:0;inv=!!(f.f&8);enr=!!(f.f&16);as=f.as;sac=f.f&128?1:0}
    const X=as>=0?byIdAny(as):null;a.lyAs=X&&a.alive?X.skin:null;a.lyW=X?X.cur:null;a.epAsH=!!a.lyAs;a.epName=X?X.name:'';a.lyPose=pose;a.lyDn=approach(a.lyDn||0,a.alive?down:0,dt*3);
    a.lyInv=inv;a.lyEnr=enr;a.lySac=approach(a.lySac||0,sac,dt*4);a.lyRev=rev;a.epDown=0;
    a.epAimY=a.lyAs?1.2:pose===''||pose==='run'||pose==='perch'||pose==='pin'?1.05:1.6;a.epPri=down||pose==='stun'?.3:.55;a.epHide=true;
    a.epRay=a.epRay||((ox,oy,oz,dx,dy,dz,t)=>LYRE.ray(a,ox,oy,oz,dx,dy,dz,t));a.epRayZc='lyrebird';
    if(a.ch&&a.ch.key!==rigKey(a))ensureRig(a)},
  // its hit volumes: the head, the sac, the pack (while there is one), three spheres along the spine; disguised: a man's box and head
  ray(a,ox,oy,oz,dx,dy,dz,tmax){const V=a.lyV;let bt=tmax,part=null;
    if(a.lyAs){const c=a.c,t=rayAABB(ox,oy,oz,dx,dy,dz,c.x-.3,c.y,c.z-.3,c.x+.3,c.y+1.62,c.z+.3,bt);if(t>=0&&t<bt){bt=t;part='body'}
      const th=raySphere(ox,oy,oz,dx,dy,dz,a.head.x,a.head.y,a.head.z,.16,bt);if(th>=0&&th<bt){bt=th;part='head'}return part?{t:bt,part}:null}
    if(!V)return null;
    const th=raySphere(ox,oy,oz,dx,dy,dz,V.head.x,V.head.y,V.head.z,.24,bt);if(th>=0&&th<bt){bt=th;part='head'}
    const ts=raySphere(ox,oy,oz,dx,dy,dz,V.sac.x,V.sac.y,V.sac.z,.2,bt);if(ts>=0&&ts<bt){bt=ts;part='body'}
    if(V.pk){const tp=raySphere(ox,oy,oz,dx,dy,dz,V.pack.x,V.pack.y,V.pack.z,.36,bt);if(tp>=0&&tp<bt){bt=tp;part='body'}}
    for(const s of [V.hip,V.mid,V.chest]){const t=raySphere(ox,oy,oz,dx,dy,dz,s.x,s.y,s.z,.4,bt);if(t>=0&&t<bt){bt=t;part='body'}}
    return part?{t:bt,part}:null},
  // the rig's extras: 1.4×, the sac on the throat (it glows and swells), the radio pack on the back (or its stub), the hit points
  rigX(ch){const D=ch.A.def,o=D.o,P=ch.A.piv,zb=(o.belly||0)*.25+(o.torsoD+(o.belly||0))/2,sY=P[1][1];
    const mk=id=>{const m=new THREE.Mesh(gunGeo(id),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);return m};
    const X={sac:mk('lySac'),pack:mk('lyPack'),packB:mk('lyPackB'),
      sacM:new THREE.Matrix4().makeTranslation(0-P[2][0],P[2][1]+o.neck*.45-P[2][1],o.headZ*.4-.085-P[2][2]),
      packM:new THREE.Matrix4().makeTranslation(0-P[1][0],sY+o.torsoH*.55-P[1][1],zb+.1-P[1][2])};
    return X},
  attach(a){const ch=a.ch;if(!ch)return;const U=ch.mat.uniforms;
    if(ch.key!=='z_lyrebird'){// disguised: a teammate's rig, a gun in its hands, no outline
      this.gunFor(a,ch);ch.mat.depthTest=true;ch.mesh.renderOrder=0;return}
    if(ch.grp.scale.x!==LY_S)ch.grp.scale.setScalar(LY_S);a.hitW=.42;a.headR=.24;if(a.lyGun)a.lyGun.visible=false;
    const X=ch.lyX||(ch.lyX=this.rigX(ch)),vis=ch.grp.visible,f=EP.bf&&EP.bf.id===a.id?EP.bf:null,pk=NET.cli?(f?f.pk>=0:true):!!(a.ly&&a.ly.packOn);
    X.sac.visible=vis;const sw=1+.55*(a.lySac||0)+.06*Math.sin(G.t*9);_lyM.makeScale(sw,sw,sw);X.sac.matrix.multiplyMatrices(ch.M[2],X.sacM).multiply(_lyM);
    X.pack.visible=vis&&pk;X.packB.visible=vis&&!pk;const pm=pk?X.pack:X.packB;pm.matrix.multiplyMatrices(ch.M[1],X.packM);
    for(const m of [X.sac,X.pack,X.packB])m.material.uniforms.uProbe.value.copy(U.uProbe.value);
    X.sac.material.uniforms.uEmisA.value=a.alive?.45+1.15*(a.lySac||0)+.15*Math.sin(G.t*3):.1;
    // the hit points (world)
    const V=a.lyV||(a.lyV={head:new THREE.Vector3(),sac:new THREE.Vector3(),pack:new THREE.Vector3(),hip:new THREE.Vector3(),mid:new THREE.Vector3(),chest:new THREE.Vector3(),pk:true});V.pk=pk;
    const W=ch.grp.matrixWorld;V.head.copy(a.head);V.sac.setFromMatrixPosition(_lyM.multiplyMatrices(ch.M[2],X.sacM)).applyMatrix4(W);V.pack.setFromMatrixPosition(_lyM.multiplyMatrices(ch.M[1],X.packM)).applyMatrix4(W);
    V.hip.setFromMatrixPosition(ch.M[0]).applyMatrix4(W);V.chest.setFromMatrixPosition(ch.M[2]).applyMatrix4(W);V.mid.copy(V.hip).lerp(V.chest,.5);
    // spores puffing out of the shoulder vents
    if(vis&&a.alive&&Math.random()<.12){const sb=Math.random()<.5?3:5;_lyV.setFromMatrixPosition(ch.M[sb]).applyMatrix4(W);FX.spawn({x:_lyV.x,y:_lyV.y+.1,z:_lyV.z,vx:rr(-.3,.3),vy:rr(.2,.6),vz:rr(-.3,.3),life:rr(1,1.8),s0:.12,s1:.5,r:.62,g:.7,b:.5,a:.35,f:2,drag:1})}
    // outlined (a siren, a traced radio): drawn over everything, lit up
    const rev=!!a.lyRev&&a.alive;ch.mat.depthTest=!rev;ch.mesh.renderOrder=rev?9:0;for(const m of [X.sac,X.pack,X.packB]){m.material.depthTest=!rev;m.renderOrder=rev?9:0}
    if(a.alive&&a.frozen<=0){const T=U.uTint.value;if(rev)T.set(1,.55,.3,.35+.1*Math.sin(G.t*12));else if(a.lyInv)T.set(1,.95,.85,.16+.08*Math.sin(G.t*30));else if(a.lyEnr)T.set(.9,.1,.05,.14+.06*Math.sin(G.t*9))}},
  // a gun in a disguise's (or a mirage's) hands: the copied teammate's
  gunFor(a,ch){const id=a.zc==='mirage'?a.mirW:a.lyW,W=WPN[id];const model=W&&W.model;
    if(a.lyGunK!==model||a.lyGunCh!==ch){if(a.lyGun){a.lyGun.parent&&a.lyGun.parent.remove(a.lyGun);a.lyGun=null}a.lyGunK=model;a.lyGunCh=ch;if(model){const m=new THREE.Mesh(gunGeo(model),a.lyGunMat||(a.lyGunMat=matGun()));m.matrixAutoUpdate=false;ch.grp.add(m);a.lyGun=m}}
    if(a.lyGun){a.lyGun.visible=!!ch.gunOn&&ch.grp.visible;if(ch.gunOn)a.lyGun.matrix.multiplyMatrices(ch.M[1],ch.gunM);a.lyGun.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value)}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const x=a.c.x,y=a.c.y+1.4,z=a.c.z;if(m.s==='pw')AU.at('lybreath',x,y,z,{vol:1,range:26});else if(m.s==='pl'||m.s==='cb'||m.s==='aw')AU.at('zleap',x,y,z,{vol:.9,range:50,rate:.75});
      else if(m.s==='cw')AU.at('zatk',x,y,z,{vol:.9,range:30,rate:.8});else if(m.s==='fr'||m.s==='mi')AU.at('lyradio',x,y+.4,z,{vol:.9,range:40});else if(m.s==='so')AU.at('lysonic',x,y+.6,z,{vol:1,range:120});
      else if(m.s==='dc')AU.at('throw',x,y,z,{vol:.8,range:30})}break;
    case 'cs':if(a){a.an.atk=1;a.an.atkD=.22;a.an.atkSide=m.n%2?1:-1;AU.at('claw',a.c.x,a.c.y+1.2,a.c.z,{vol:.9,range:30})}break;
    case 'pn':{if(a)AU.at('zatk',a.c.x,a.c.y+1,a.c.z,{vol:1,range:40,rate:.7});const v=byIdAny(m.v);
      if(v&&v===P){P.grabT=2.3;P.rootT=Math.max(P.rootT||0,2.3);P.lyPin=2.3;FX.shake=Math.max(FX.shake,.7);AU.play('hurt',{vol:.7});HUD.note(L?'Pinned! Your knife works — or a teammate shoots it off':'붙잡혔다! 칼로 찌르거나 동료가 쏴서 떼어 내야 해요',2.6)}break}
    case 'ug':{const v=byIdAny(m.v);if(v){v.grabT=0;v.lyPin=0;if(v===P||!v.pup)v.rootT=Math.min(v.rootT||0,.05)}if(a&&m.f)AU.at('zpain',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:50,rate:.8});break}
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.3,1.8),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'fr':this.fakeShow(m);break;
    case 'dc':if(NET.cli)DECOY.add(m.x/100,m.y/100,m.z/100,m.id,true);break;
    case 'dcx':if(NET.cli){const D=DECOY.byId(m.id);if(D)DECOY.kill(D,m.s)}break;
    case 'so':{const x=m.x/100,y=m.y/100,z=m.z/100;EPFOG.thkT=10;if(!SIREN.ringGeo){SIREN.ringGeo=new THREE.RingGeometry(.9,1,72);SIREN.ringGeo.rotateX(-Math.PI/2)}
      const r=new THREE.Mesh(SIREN.ringGeo,new THREE.MeshBasicMaterial({color:0xb48aff,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));r.position.set(x,y+1,z);r.frustumCulled=false;r.renderOrder=6;R.scene.add(r);SIREN.rings.push({m:r,t:0,T:1.1});
      if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<28)FX.shake=Math.max(FX.shake,.7-d/40)}HUD.note(L?'Its cry — the fog closes in':'울음소리 — 안개가 짙어진다',2);break}
    case 'ec':{const W=WPN[m.w];if(W&&W.snd){const x=m.x/100,y=m.y/100,z=m.z/100,n=2+Math.floor(Math.random()*3);for(let k=0;k<n;k++)SCEN.later(k*rr(.1,.16),()=>AU.at(W.snd,x,y,z,{vol:.9,range:80}))}break}
    case 'ds':if(a)for(let i=0;i<30;i++)FX.spawn({x:a.c.x+rr(-.8,.8),y:a.c.y+rr(.2,2),z:a.c.z+rr(-.8,.8),vx:rr(-.5,.5),vy:rr(0,.6),vz:rr(-.5,.5),life:rr(1,1.8),s0:.3,s1:1.2,r:.6,g:.66,b:.56,a:.45,f:2,drag:1});break;
    case 'rv':if(a){AU.at('zroar',a.c.x,a.c.y+1.6,a.c.z,{vol:1,range:90,rate:.85});for(let i=0;i<34;i++)FX.spawn({x:a.c.x+rr(-.6,.6),y:a.c.y+rr(.3,2),z:a.c.z+rr(-.6,.6),vx:rr(-2,2),vy:rr(0,2),vz:rr(-2,2),life:rr(.8,1.4),s0:.3,s1:1.1,r:.62,g:.7,b:.55,a:.5,f:2,drag:1.2});
      if(!m.q&&P&&P.alive&&Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z)<16)HUD.announce(L?'IT WAS LYREBIRD!':'라이어버드였다!','z',1.8)}break;
    case 'fs':SIREN.wave(m.i,true);break;
    case 'sr':SIREN.wave(m.i,false);const T=SIREN.L[m.i];if(T)SIREN.light(T,true);EPFOG.clrT=10;this.revT=10;HUD.announce(L?'ALARM SIREN — THE FOG LIFTS':'경보 사이렌 — 안개가 걷힌다','h',2.2);break;
    case 'stn':if(a){AU.at('zpain',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:80,rate:.7});HUD.note(L?'LYREBIRD is stunned — ×1.25':'라이어버드 기절 — 피해 1.25배',2.4)}break;
    case 'tr':{this.trT=5;const x=m.x/100,z=m.z/100;AU.at('lyradio',x,1,z,{vol:.8,range:30});HUD.note(L?'Its radio traced LYREBIRD — 5 s':'역탐지 — 라이어버드 위치 5초',2.4);break}
    case 'pk':if(a&&a.lyV){const v=a.lyV.pack;for(let i=0;i<30;i++)FX.spawn({x:v.x,y:v.y,z:v.z,vx:rr(-4,4),vy:rr(0,4),vz:rr(-4,4),life:rr(.2,.5),s0:.06,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1});
      AU.at('dischit',v.x,v.y,v.z,{vol:1,range:70});AU.at('explode',v.x,v.y,v.z,{vol:.5,range:50,rate:1.8});HUD.announce(L?'THE RADIO PACK IS DESTROYED':'무전기 배낭 파괴!','h',2.4)}break;
    case 'dn':if(a){AU.at('zpain',a.c.x,a.c.y+1.4,a.c.z,{vol:1,range:70,rate:.7});HUD.note(L?'LYREBIRD is down — ×1.5 damage':'라이어버드 그로기 — 피해 1.5배',2.5)}break;
    case 'up':break;
    case 'land':SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('land',m.x/100,m.y/100,m.z/100,{vol:1,range:50,rate:.8});break;
    case 'roar':if(a){AU.at('lysonic',a.c.x,a.c.y+1.6,a.c.z,{vol:1,range:110,rate:.8});if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<16)FX.shake=Math.max(FX.shake,.5-d/32)}}break;
    case 'ph':if(a)AU.at('lysonic',a.c.x,a.c.y+1.6,a.c.z,{vol:1,range:140,rate:.7});HUD.announce(m.n===2?(L?'THE FOG STARTS TO TALK':'안개가 말을 걸어온다'):(L?'LYREBIRD WEARS YOUR FACES':'라이어버드가 우리 얼굴을 쓴다'),'z',3);AU.play('stingZ',{vol:.7});
      if(m.n===3)EP.later(2,()=>HUD.note(L?'The east and west sirens are live':'동쪽 · 서쪽 사이렌에 전원이 들어왔다',3));break;
    case 'enr':HUD.announce(L?'LYREBIRD IS ENRAGED':'라이어버드 광폭화','z',2.5);break;
    case 'mi':{const z=byIdAny(m.i),X=byIdAny(m.o);if(z&&X&&NET.cli)MIRAGE.dress(z,X);break}
    case 'mg':{const v=byIdAny(m.v);if(v&&v===P){P.grabT=1.6;P.rootT=Math.max(P.rootT||0,1.6);FX.shake=Math.max(FX.shake,.5);AU.play('hurt',{vol:.6});HUD.note(L?'A mirage — it grabbed you!':'환각이었다 — 붙잡혔어요!',2)}if(z_(m.i))AU.at('zatk',z_(m.i).c.x,z_(m.i).c.y+1.4,z_(m.i).c.z,{vol:.9,range:30,rate:1.2});break}
    case 'mx':{const z=byIdAny(m.i);if(z)MIRAGE.puff(z);break}
    case 'gt':{const g=MAP.ez&&MAP.ez.gateC;if(g){AU.at('powerup',g.x,g.y+1,g.z,{vol:.9,range:60});DL.add(g.x,g.y+1.6,g.z,'#9ad8ff',8,2.4,.8)}HUD.announce(L?'THE GATE IS UNLOCKED — EVERYONE TO IT':'정문 잠금 해제 — 전원 정문 앞으로!','h',2.4);if(!NET.cli)EP.say('gate');break}
    case 'rc':if(a&&NET.cli)AU.at('lyradio',a.c.x,a.c.y+1.5,a.c.z,{vol:.6,range:28});break}}};
const z_=i=>byIdAny(i);

// ---------- mirages: a teammate's shape standing in the fog (host brain); it holds that teammate's gun but has no flashlight ----------
const MIRAGE={
  // host: what it looks like (every page is told), how long it lasts
  make(z,X){z.mi={of:X.id,mode:'',mt:0,life:rr(26,34),look:Math.random()*TAU,lt:0,vic:null};this.dress(z,X);LYRE.fxSend({k:'mi',i:z.id,o:X.id})},
  dress(z,X){z.mirOf=X.id;z.mirSkin=X.skin;z.mirW=X.cur;z.epAsH=true;z.epName=X.name;ensureRig(z)},
  ai(a,dt){const S=a.mi;if(!S)return true;const c=a.c,cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=false;a.staggerT=0;S.life-=dt;
    if(S.mode==='grab'){const v=S.vic;S.mt-=dt;if(v&&v.alive){v.grabT=Math.max(v.grabT,.3);v.rootT=Math.max(v.rootT,.3);const fx=-Math.sin(v.yaw),fz=-Math.cos(v.yaw),px=v.c.x+fx*.45,pz=v.c.z+fz*.45;if(charFits(c,px,v.c.y,pz)){c.x=px;c.z=pz;c.y=v.c.y}c.vx=c.vz=0;a.kvx=a.kvz=0;
        a.yaw=Math.atan2(-(v.c.x-c.x),-(v.c.z-c.z));S.tk=(S.tk||0)-dt;if(S.tk<=0){S.tk=.25;hurtHuman(v,EPD(14*.25),a,{claw:1})}}
      if(S.mt<=0||!v||!v.alive){if(v){v.grabT=0;v.rootT=0}this.vanish(a)}return true}
    if(S.mode==='lunge'){S.mt-=dt;if(S.mt<=0){const v=S.vic;if(v&&v.alive&&Math.hypot(v.c.x-c.x,v.c.z-c.z)<2.2&&v.grabT<=0){S.mode='grab';S.mt=1.5;v.grabT=1.6;v.rootT=1.6;LYRE.fx({k:'mg',i:a.id,v:v.id});if(!this.said){this.said=1;EP.say('lyMirG')}}else{S.mode='';S.vic=null}}return true}
    if(S.life<=0){this.vanish(a);return true}
    // walking up to whoever is nearest (within 25 m) like a teammate would, else standing, looking about; within 4 m it lunges
    let v=null,bd=4,w=null,wd=25;for(const h of SCEN.H){if(!h.alive||h.grabT>0)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(Math.abs(h.c.y-c.y)>2.5)continue;if(d<wd){wd=d;w=h}if(d<bd&&Math.abs(h.c.y-c.y)<1.6){bd=d;v=h}}
    if(w&&!v)this.walk(a,dt,S,[w.c.x,w.c.y,w.c.z]);
    else{S.lt-=dt;if(S.lt<=0){S.lt=rr(1.2,2.6);S.look=a.yaw+rr(-1,1)}a.yaw+=wrapA(S.look-a.yaw)*Math.min(1,dt*2)}
    if(v){S.mode='lunge';S.mt=.3;S.vic=v;a.yaw=Math.atan2(-(v.c.x-c.x),-(v.c.z-c.z));epKin(a,v.c.x,v.c.y,v.c.z,.3,.4,null)}return true},
  walk(a,dt,S,p){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;
    if(!B.path||B.pi>=B.path.length||!B.miG||Math.hypot(B.miG[0]-p[0],B.miG[2]-p[2])>2){B.miG=p;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,6);AI.moveDir(a,wx,wz)}a.spdMul=.34},
  vanish(z){if(!z.alive)return;LYRE.fx({k:'mx',i:z.id});EP.despawn(z);if(NET.host)netEv('epdz',{i:[z.id]})},
  puff(z){for(let i=0;i<26;i++)FX.spawn({x:z.c.x+rr(-.4,.4),y:z.c.y+rr(.2,1.8),z:z.c.z+rr(-.4,.4),vx:rr(-.6,.6),vy:rr(0,.6),vz:rr(-.6,.6),life:rr(1,1.8),s0:.3,s1:1.1,r:.6,g:.68,b:.56,a:.5,f:2,drag:1});
    AU.at('hiss',z.c.x,z.c.y+1,z.c.z,{vol:.6,range:30,rate:1.3})}};

// ---------- what the chapter's zombies do (episode.js dispatches through EPZ) ----------
EPZ.lyrebird={hp:()=>LYRE.hpFor(),init:a=>LYRE.init(a,LYRE.encNext),ai:(a,dt)=>LYRE.ai(a,dt),
  hit:(t,dmg,src,o)=>t.ly?LYRE.hit(t,dmg,src,o):dmg,after:(t,r,src,o)=>{if(t.ly)LYRE.after(t,r,src,o)},
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?5:3;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?24:15),a,{claw:1});return true},
  pre:(a,dt)=>LYRE.pre(a,dt),attach:a=>LYRE.attach(a),
  die(t){t.kin=null;if(t.ly&&t.ly.vic)LYRE.release(t,t.ly,false);DECOY.clear();if(t.ly&&!t.ly.enc&&!NET.cli)EP.say('lyDie')},
  gone(a){a.kin=null;if(a.ly){if(a.ly.vic)LYRE.release(a,a.ly,false);a.ly.mode='gone'}}};
EPZ.mirage={hp:()=>{const d=G.diff||0;return Math.round(320*SC_DIFF.hp[d]*(.8+.1*SCEN.H.length))},init(a){a.epHide=true},ai:(a,dt)=>MIRAGE.ai(a,dt),claw(){return true},
  pre(a){a.epAsH=!!a.mirSkin&&a.alive;a.epAimY=1.2;a.epHide=true},attach:a=>{if(a.ch&&a.ch.key!=='z_mirage')LYRE.gunFor(a,a.ch)},
  die(t){MIRAGE.puff(t);if(t.mi&&t.mi.vic){t.mi.vic.grabT=0;t.mi.vic.rootT=0}t.mi=null},gone(a){if(a.mi&&a.mi.vic){a.mi.vic.grabT=0;a.mi.vic.rootT=0}a.mi=null}};
// the radio-operator zombie: a crackle now and then while it lives; dead, its set traces LYREBIRD for 5 s
EPZ.radioman={init(a){a.rmT=rr(1,4);a.epHide=true},tick(a,dt){a.rmT-=dt;if(a.rmT<=0){a.rmT=rr(3,6);LYRE.fxSend({k:'rc',i:a.id});AU.at('lyradio',a.c.x,a.c.y+1.5,a.c.z,{vol:.6,range:28})}},
  die(t){if(NET.cli)return;const b=EP.bossA();if(b&&b.ly&&b.alive)LYRE.fx({k:'tr',x:r2(t.c.x),z:r2(t.c.z)});if(!LYRE.trSaid){LYRE.trSaid=1;EP.say('radio2')}}};
// the spore zombie: bursts into a cloud of thick fog where it falls
EPZ.spore={init(a){a.epHide=true},die(t){if(NET.cli)return;ESMK.add(t.c.x,t.c.y+.3,t.c.z,6,10,false,[.6,.7,.55])}};
Object.assign(ZGAIT,{lyrebird:{stride:.95,knee:1.2,runK:1.1,bob:1,twist:1.1,sway:1},radioman:{stride:1,knee:1,runK:.9,bob:1.1,twist:1.1},spore:{stride:.92,knee:.9,runK:.8,bob:1.2,twist:.9,sway:1.3},mirage:{stride:1,knee:1,runK:1,bob:1,twist:1}});
Object.assign(JAW0,{lyrebird:.22,radioman:.1,spore:.14,mirage:0});

// ---------- the rig (every page): LYREBIRD on all fours, rearing up to mimic and cry; a disguise and the mirages pose as people ----------
{const pz=poseZombie;poseZombie=function(ch,st){const z=st.zclass;
  if(z==='mirage'||z==='lyrebird'&&ch.key!=='z_lyrebird'){// a teammate's shape: a soldier's stance with the copied gun
    const a=z==='mirage'?MIRAGE_CUR:LYRE.cur,id=a?(z==='mirage'?a.mirW:a.lyW):null;if(st.dead>0){pz(ch,st);return}
    st.hold=holdFor(id)||holdFor('ar7');st.pitch=0;st.kick=0;st.atk=0;st.sprint=st.spd>3.4?1:0;st.reload=0;st.relKind=null;st.zombie=false;poseHuman(ch,st);return}
  if(z!=='lyrebird'||st.dead>0||!LYRE.cur){pz(ch,st);return}
  const a=LYRE.cur,P=a.lyPose||'';
  // upright: the light zombie's hunch, then the head and arms as the moment wants
  if(P==='mimic'||P==='sonic'||P==='claw'||P==='stun'){st.zclass='runner';if(P==='claw'){st.atk=a.an.atk>0?1-a.an.atk:0;st.atkSide=a.an.atkSide}pz(ch,st);st.zclass='lyrebird';const R0=ch.R,k=a.lySac||0;
    if(P==='mimic'||P==='sonic'){setE(R0[2],.55+.35*k+Math.sin(G.t*14)*.04,Math.sin(G.t*2)*.2,Math.sin(G.t*3)*.1);setE(R0[11],-(.5+.8*k),0,0);if(P==='sonic'){setE(R0[3],.4,0,-1.1);setE(R0[5],.4,0,1.1);setE(R0[4],.3,0,0);setE(R0[6],.3,0,0)}}
    if(P==='stun'){setE(R0[2],-.3+Math.sin(G.t*9)*.25,Math.sin(G.t*7)*.4,0)}return}
  lyCrawl(ch,st,a,P)}}
let MIRAGE_CUR=null;
{const uv=updateVisual;updateVisual=function(a,dt){if(a.zc==='mirage')MIRAGE_CUR=a;
  // (a reused actor never keeps a borrowed shape)
  if(a.epAsH&&!(a.alive&&(a.zc==='mirage'||a.zc==='lyrebird')))a.epAsH=false;uv(a,dt)}}
// on all fours: the spine about level, the hands and feet planted on the ground by IK (a trot: the left hand with the right foot), the
// long neck craned forward; its clock is the stride clock, so planted hands and feet stay put. Pinning: hunched over its prey, the hands
// either side of it, the head down biting; perched: a gargoyle's crouch, hands in front of the feet; down: flat on its belly, sprawled;
// leaping: stretched out, the arms reaching
const _lq={M0:new THREE.Matrix4(),M1:new THREE.Matrix4(),I:new THREE.Matrix4(),m:new THREE.Matrix4(),S:new THREE.Vector3(),T:new THREE.Vector3(),H:new THREE.Vector3(),F:{x:0,y:0,z:0,g:0}};
// a limb's offset along the body (model z, + = back) and its lift at clock ph: planted (front to back), then swung forward
function lyStep(ph,off,beta,halfS,lift){let u=((ph+off)/TAU)%1;if(u<0)u+=1;
  if(u<beta){const s=u/beta;return [-halfS+2*halfS*s,0]}const w=(u-beta)/(1-beta);return [halfS-2*halfS*smooth(w),lift*Math.sin(Math.PI*w)]}
function lyCrawl(ch,st,a,P){const R=ch.R,Pv=ch.A.piv,A=ch.A,t=st.t,sp=st.spd||0,Q=_lq;
  if(P==='leap'){ch.root.set(0,-.2,.1);setE(R[0],-1.2,0,0);setE(R[1],-.02,0,0);setE(R[2],1.4+Math.sin(t*1.7)*.06,0,0);
    setE(R[3],2.4,0,-.18);setE(R[4],.15,0,0);setE(R[5],2.4,0,.18);setE(R[6],.15,0,0);setE(R[7],.2,0,-.06);setE(R[8],-.4,0,0);setE(R[9],.2,0,.06);setE(R[10],-.4,0,0);
    setE(R[12],.5,0,0);setE(R[13],.5,0,0);setE(R[11],-.8,0,0);ch.gunOn=ch.gunOn2=false;return}
  const still=P==='perch'||P==='pin'||P==='down',amp=still?0:smooth(clamp(sp/1.6,0,1)),run=clamp((sp-3)/3,0,1),ph=st.phase||0;
  // the body: pitch T from upright, the pelvis's height and how far behind the middle it sits, the chest's bend, the neck's own pitch
  // (from upright), the jaw; where the hands (x out, z from the shoulder) and the feet (x out, z from the pelvis) go
  let T=lerp(1.45,1.56,run),hipH=lerp(.72,.67,run),back=.26,chest=-.17,neck=lerp(-.42,-.66,run),jaw=.25,hx=.27,hz=-.05,fx=.15,fz=.06,scan=.2;
  if(P==='perch'){T=1.12;hipH=.5;back=.18;chest=-.12;neck=-.2+Math.sin(t*1.3)*.06;hx=.2;hz=-.14;fx=.17;fz=.02;scan=.35}
  else if(P==='pin'){T=1.86;hipH=.8;back=.3;chest=-.15;neck=-1.15+Math.sin(t*16)*.1;jaw=.9+Math.abs(Math.sin(t*14))*.4;hx=.33;hz=-.32;fx=.16;fz=.12;scan=.05}
  else if(P==='down'){T=1.62;hipH=.36;back=.22;chest=.05;neck=-1.25+Math.sin(t*2.3)*.08;jaw=.9;hx=.56;hz=-.1;fx=.3;fz=.22;scan=.1}
  const C=(st.stride||2)/LY_S,beta=lerp(.58,.44,run),halfS=C*beta*.5*amp,lift=lerp(.1,.17,run)*amp;
  const bob=amp*(.022+.03*run)*Math.abs(Math.sin(ph)),tw=.07*amp*Math.sin(ph),rl=.05*amp*Math.sin(ph)+(P==='down'?Math.sin(t*1.9)*.04:0);
  const root=ch.root.set(0,hipH-Pv[0][1]-bob,back);
  setE(R[0],-T+.03*amp*Math.sin(2*ph),tw,rl);setE(R[1],chest,-tw*1.3,-rl*.7);
  setE(R[2],neck+T-chest,Math.sin(t*.9+a.id)*scan,Math.sin(t*1.3)*.08);
  // where the spine is (model space), for the hands' IK
  Q.M0.copy(R[0]).setPosition(Pv[0][0]+root.x,Pv[0][1]+root.y,Pv[0][2]+root.z);Q.m.copy(R[1]).setPosition(Pv[1][0]-Pv[0][0],Pv[1][1]-Pv[0][1],Pv[1][2]-Pv[0][2]);
  Q.M1.multiplyMatrices(Q.M0,Q.m);Q.I.copy(Q.M1).invert();
  for(let i=0;i<2;i++){const sh=i?5:3,el=i?6:4,sd=i?1:-1;
    // a hand (left with the right foot, right with the left)
    const [dz,ly]=lyStep(ph,i?Math.PI:0,beta,halfS,lift);Q.S.set(Pv[sh][0]-Pv[1][0],Pv[sh][1]-Pv[1][1],Pv[sh][2]-Pv[1][2]);Q.T.copy(Q.S).applyMatrix4(Q.M1);
    Q.T.set(sd*hx,.07+ly,Q.T.z+hz+dz).applyMatrix4(Q.I);Q.H.set(sd*.55,.15,1).transformDirection(Q.I);ik2(Q.S,Q.T,A.la,A.lb,Q.H,R[sh],R[el]);
    // a foot
    const L=LEGS[i],[fz2,fy]=lyStep(ph,i?0:Math.PI,beta,halfS,lift),F=Q.F;F.x=sd*fx;F.y=A.def.foot.ah+fy;F.z=root.z+fz+fz2;F.g=fy>.01?-.3:0;
    const o=solveLeg(ch,i,root.x,root.y,root.z,F,-T+.03*amp*Math.sin(2*ph));setE(R[L.h],o.x,0,o.z);setE(R[L.k],o.k,0,0);setE(R[L.f],o.f,0,-o.z*.8)}
  setE(R[11],-clamp(jaw+.15*Math.pow(Math.max(0,Math.sin(t*17)),3),0,1.4),0,0);ch.gunOn=false;ch.gunOn2=false}

// ---------- chapter 4 「라이어버드」: the Unmubong signal station ----------
//   1 the checkpoint at the foot — three waves; the spore zombies first show up; then the road's barrier opens
//   2 the mountain road — restart three relays (10 s each, any order): the fog thins round each one, and the fallen get up at it
//   3 the radar compound — break through to the summit gate within 3 min; LYREBIRD's first fake radio, it hunts the team and goes
//     once it has lost 15 %; the radio-operator zombies show up
//   4 the summit antenna yard — the boss fight, three phases. A wipe replays the phase it reached, at that phase's health
CHAP[4]={id:4,k:'lyrebird',map:'ep4',code:'RT1-05',n:['라이어버드','LYREBIRD'],t:['좀비 시나리오: 라이어버드','Zombie Scenario: LYREBIRD'],
  file:[['1차 회수팀 통신병 RT1-05. 무전을 엿듣고 우리 목소리를 흉내 낸다 — 가짜 무전 · 가짜 핑','RT-1\'s signaller, RT1-05: it listens in and fakes our voices — false radio calls, false pings'],
    ['미니맵에 그 아군 점이 없으면 가짜 · 경보 사이렌이 안개를 걷어 낸다','No teammate\'s dot where the voice says: a fake · the alarm siren clears the fog']],
  cards:{place:['운무봉 통신기지','UNMUBONG SIGNAL STATION'],who:['1차 회수팀 통신병','RT-1 SIGNALLER'],line:['살아 있는 사람이 부러워서 따라 한다 — 그 사이에 섞이려고','It envies the living, so it copies them — to slip in among them']},
  boss:LYRE,voice2:['LYREBIRD','LYREBIRD'],
  // gates: A the road's barrier, B the radar compound's gate, C the summit gate
  gates:['gA','gB','gC'],gateDur:{gA:1.3,gB:1.2,gC:1.3},
  pow0:1,powLo:[1,1],breachDev:1,
  breachOK(){return GATEC.done()},
  // stage 3: one bot to the console until it is done (the others to the gate box)
  goal(a,i){if(EP.st!==3||EP.ph!=='run'||GATEC.done())return undefined;const B=SCEN.H.filter(h=>h.alive&&h.bot&&!h.isPlayer),g=MAP.ez.gateC;if(g&&B[0]===a)return [g.bx,g.y,g.bz,.35];return undefined},
  markers(list,L){if(EP.st===3&&EP.ph==='run'&&!GATEC.done()){const g=MAP.ez.gateC;if(g)list.push([g.x,g.y+2,g.z,L?'⚙ GATE CONSOLE':'⚙ 정문 콘솔','g'])}return false},
  stages:[null,
    {z:'A',k:'waves',n:['산 아래 검문소','Checkpoint'],on:['검문소를 지켜라','Hold the checkpoint'],prep:18,clr:'s1c',intro:{zc:'spore',say:'spore',at:5},
      wave:w=>[['rager',50],['runner',22],['spore',w>=2?16:12],['squad',w>=2?10:6],['bomber',w>=2?6:0],['brute',w>=3?6:0]]},
    {z:'B',k:'act',n:['산악 도로 · 벙커','Mountain road'],on:['중계기 재가동','Restart the relays'],dev:'relay',say:'s2',clr:'s2c',devSay:(i,left)=>left===2?'r1':'r2',
      mix:[['rager',42],['runner',26],['squad',14],['spore',12],['spitter',6]]},
    {z:'C',k:'breach',n:['레이더 돔 단지','Radar compound'],on:['정상 정문까지','Reach the summit gate'],goal:'g',len:180,say:'s3',sayRetry:1,clr:'s3c',late:'late3',meet:{at:12,cap:.55},intro:{zc:'radioman',say:'radio',at:9},
      mix:[['rager',40],['runner',28],['squad',12],['radioman',12],['spore',8]]},
    {z:'D',k:'boss',n:['정상 안테나 야드','Summit antenna yard'],on:['라이어버드를 쓰러뜨려라','Bring LYREBIRD down'],say:'s4',go:'b0',prepPt:[28,10,-30,2]}],
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n>=4)m|=b('gC');return m},
  setup(){SIREN.build();EPFOG.reset()},
  stageStart(n){EPFOG.reset();SIREN.reset();DECOY.clear()},
  // the fallen on the mountain road get up at a lit relay after 10 s
  hostPh(ph,dt){if(EP.st!==2||ph!=='run'||NET.cli)return false;const L=MAP.ez.relay;
    for(const h of SCEN.H){if(h.alive||h.team!==TH)continue;h.lyDT=(h.lyDT||0)+dt;if(h.lyDT<10)continue;let best=null,bd=1e9;
      for(let i=0;i<L.length;i++){if((EP.obj.ps[i]||0)<L[i].t)continue;const d=Math.hypot(h.c.x-L[i].x,h.c.z-L[i].z);if(d<bd){bd=d;best=L[i]}}
      if(best){h.lyDT=0;const p=[best.x+rr(-1,1),best.y+.1,best.z+rr(-1.5,-.8)];SCEN.reviveOne(h,p);h.hp=50;if(NET.host)netEv('eprh',{P:[[h.id,r2(p[0]),r2(p[1]),r2(p[2]),50]]});if(h.isPlayer)HUD.note(LI()?'Back up at the relay':'중계기에서 다시 일어났어요',2.5)}}
    for(const h of SCEN.H)if(h.alive)h.lyDT=0;return false},
  bossGo(){EP.setGates(EP.gm&~EP.bit('gC'));return []},
  update(dt){EPFOG.update(dt);const t=G.t;for(const g of E4GLOW.L){const k=.55+.45*Math.max(0,Math.sin(t*2.2+g.ph*3));g.sp.material.opacity=k*clamp(.35+EPFOG.cur*6,.4,1);g.sp.scale.set(g.s*(1+EPFOG.cur*4),g.s*(1+EPFOG.cur*4),1)}},
  // bots carry their lights here (the mirages are the ones without)
  botPost(a){a.flash=true},
  // a shot on a decoy radio (the host breaks it; a client tells the host)
  boxShot(eh,a,W){if(eh.k!=='dc')return;if(NET.cli){if(!AU.throttle('elys'+eh.i,150))netToHost({t:'elys',i:eh.i});return}const D=DECOY.byId(eh.i);if(D)DECOY.kill(D,1)},
  clear(){SIREN.clear();DECOY.clear();EPFOG.reset();LU.uFogD.value=MAP.env&&MAP.env.fogD||.045},
  radio:{
    start:['2차 회수팀, 운무봉 통신기지 아래 도착. 1차 회수팀 통신병의 신호가 마지막으로 잡힌 곳이다.','RT-2, you are at the foot of Unmubong signal station. That is where RT-1\'s signaller was last heard from.',0],
    w1:['산길에서 내려온다! 검문소부터 지켜.','They are coming down the mountain! Hold the checkpoint.',0],
    spore:['저 부푼 놈 — 터지면 그 자리가 안개로 덮인다. 멀리서 쏴!','That bloated one — when it bursts the fog swallows the spot. Shoot it from a distance!',1],
    s1c:['차단기 연다. 산악 도로 위로 올라가.','Opening the barrier. Up the mountain road.',0],
    s2:['중계기 세 대를 다시 살려 — 아래 도로, 굽은 길, 윗길 끝. 하나에 10초. 켜진 중계기 근처는 안개가 옅어지고, 쓰러져도 거기서 다시 일어난다.','Restart the three relays — the lower road, the hairpin, the top of the road. Ten seconds each. The fog thins round a running relay, and anyone who goes down gets back up at one.',0],
    r1:['중계기 하나 돌아간다. 두 대 남았다.','One relay is up. Two to go.',0],
    r2:['마지막 중계기!','Last relay!',0],
    s2c:['중계 연결됐다… 잠깐, 이 채널에 우리 말고 누가 있어. 레이더 단지로 올라가.','The link is up… wait, there is someone else on this channel. Up to the radar compound.',0],
    s3:['3분 안에 정상 정문까지. 정문 옆 콘솔을 10초 잡고 있어야 잠금이 풀린다 — 안개 속에서 흩어지지 마.','Three minutes to the summit gate. Its console has to be held for ten seconds to unlock it — do not split up in the fog.',0],
    gate:['잠금 해제! 전원 정문 앞으로!','Unlocked! Everyone to the gate!',0],
    enc:['…들려? 여기 사람 있어. 이쪽이야.','…can you hear me? There are people here. Over here.',2],
    enc2:['방금 그거 누구 목소리야? 우리 채널인데… 미니맵에 아무도 없어!','Whose voice was that? It is our channel… and there is nobody on the minimap!',1],
    radio:['무전기 멘 놈이다 — 저 무전기, 아직 라이어버드 신호를 잡고 있어. 쓰러뜨리면 역탐지된다!','That one carries a radio — it is still locked on LYREBIRD\'s signal. Drop it and we can trace it!',1],
    radio2:['역탐지 됐다! 지금 저 위치야!','Traced! That is where it is!',1],
    lyFake:['잠깐 — 그 무전, 미니맵에 그 대원 점이 없어! 라이어버드가 흉내 내는 거야. 핑 찍힌 데 가지 마!','Wait — that call, the minimap has nobody there! LYREBIRD is faking it. Stay away from that ping!',0],
    lyDecoy:['총소리? 아니야, 저건 무전기에서 나는 소리야 — 쏴서 꺼!','Gunfire? No — that is a radio playing it. Shoot it!',1],
    lyPin:['붙잡혔다! 쏴서 떼어 내 — 칼로 찔러도 돼!','It has someone! Shoot it off — or use your knife!',1],
    lyAmb:['함정이었어! 핑 찍힌 데서 덮쳤다!','A trap! It jumped them right at the ping!',1],
    lyFree:['떨어졌다!','It is off!',1],
    lyRet:['놈이 물러난다… 정상 쪽으로 사라졌어.','It is pulling back… gone up toward the summit.',1],
    late3:['늦었다 — 안개에 다 둘러싸였어!','Too late — the fog has closed round us!',0],
    s3c:['정문 열었다. 정상 안테나 야드 — 놈이 거기 있다.','The gate is open. The summit yard — it is up there.',0],
    s4:['정상이다. 가운데 경보 사이렌을 울리면 안개가 걷히고 놈 윤곽이 보인다 — 가까이 있으면 기절해. 서로 떨어지지 마.','The summit. Sound the alarm siren in the middle and the fog lifts and its outline shows — close enough and it is stunned. Stay together.',0],
    b0:['…다들 여기 있었구나. 나도 끼워 줘.','…so this is where you all were. Let me in.',2],
    lySiren:['사이렌 울렸다! 안개 걷힌다 — 지금 쏴!','The siren is going! The fog is lifting — shoot it now!',1],
    lyStun:['사이렌에 기절했다! 몰아쳐!','The siren stunned it! Pour it on!',1],
    lyDown:['쓰러졌다! 집중 사격!','It is down! Pour it on!',1],
    lyPack:['무전기 배낭이 부서졌다! 이제 흉내 못 낸다!','The radio pack is gone! No more fake calls!',1],
    lyP2:['안개 속에 누가 서 있어… 우리 대원? 손전등이 없으면 가짜야!','Someone is standing in the fog… one of ours? No flashlight means it is a fake!',1],
    lyMir:['저 대원, 손전등이 없어! 환각이야 — 다가가지 말고 쏴!','That one has no flashlight! A mirage — shoot it, do not go near it!',1],
    lyMirG:['환각한테 붙잡혔다! 떼어 내!','A mirage has someone! Get it off!',1],
    lySonic:['울음소리다 — 귀 막아! 안개가 짙어진다!','That cry — cover your ears! The fog is getting thicker!',1],
    lyP3:['이제 우리 얼굴을 쓴다… 미니맵 점이랑 이름표를 꼭 맞춰 봐!','Now it is wearing our faces… check the minimap dots against the name tags!',1],
    lyDsg:['…잠깐, 미니맵에 같은 대원이 둘이야! 하나는 라이어버드다!','…wait, the minimap shows the same teammate twice! One of them is LYREBIRD!',1],
    lyFS:['사이렌 소리? 탑에 불이 안 켜졌어 — 가짜야, 나가지 마!','A siren? The tower\'s light is not on — it is a fake, stay put!',1],
    lyEnr:['시간 끌면 안 돼 — 놈이 더 빨라진다!','We cannot drag this out — it is getting faster!',0],
    lyDie:['…나도… 너희처럼…','…I just… wanted to be… like you…',2],
    dead:['라이어버드 무력화. 1차 팀 통신병, 확인했다.','LYREBIRD is down. RT-1\'s signaller, confirmed.',0],
    clear:['2차 회수팀, 수고했다. 놈의 무전기에 남은 기록… 1차 팀이 마지막에 어디로 갔는지 알겠군.','Good work, RT-2. What is left on its radio… now we know where RT-1 went at the end.',0]}};

// ---------- hooks ----------
(function(){
  // a mirage borrows a teammate's rig; LYREBIRD in disguise too
  const rk=rigKey;rigKey=function(a){if(a.team===TZ){if(a.zc==='mirage'&&a.mirSkin)return 'h_'+a.mirSkin;if(a.zc==='lyrebird'&&a.lyAs)return 'h_'+a.lyAs}return rk(a)};
  // in the fog a bot sees only as far as the fog lets it (every zombie here is flagged epHide); a disguise is one of the team to a bot
  const eh=epHid;epHid=function(a,z,d){if(EP.on&&EP.id===4){if(z.epAsH&&d>3.5){const D=z.ly&&z.ly.dsg;if(!(z.zc==='mirage'?d<9:D&&D.T-D.t>2.5+(a.id%3)*.7&&d<20))return true}if(d>EPFOG.botSee()&&!(z.zc==='lyrebird'&&(LYRE.revT>0||LYRE.trT>0)))return true}return eh(a,z,d)};
  const orv=SCEN.onRevive;SCEN.onRevive=function(a){orv(a);if(EP.on&&EP.id===4&&a.scen){a.epHide=true;if(a.zc!=='mirage'){a.mirSkin=null;a.epAsH=false}}};
  // pinned by LYREBIRD: the knife works (game.js lets the swing through); the swing frees you (the host decides)
  const pc=Main.playerCmd.bind(Main);Main.playerCmd=function(dt){pc(dt);const P=G.player;if(!P||!P.alive||!(P.lyPin>0))return;P.lyPin=Math.max(0,P.lyPin-dt);const W=WPN[P.cur];
    if(W&&W.kind==='melee'&&P.cmd.fire&&!AU.throttle('lyknife',500)){if(NET.cli)netToHost({t:'elyk'});else{const b=EP.bossA();if(b&&b.ly&&b.ly.vic===P)LYRE.release(b,b.ly,true)}}};
  Object.assign(CLIH,{ely(L,m){LYRE.fxApply(m)}});
  Object.assign(HOSTH,{
    elyk(L,m){const a=actorOfKey(L.key),b=EP.bossA();if(EP.on&&EP.id===4&&a&&b&&b.ly&&b.ly.vic===a)LYRE.release(b,b.ly,true)},
    elys(L,m){if(!EP.on||EP.id!==4||!actorOfKey(L.key))return;const D=DECOY.byId(m.i);if(D)DECOY.kill(D,1)}});
})();

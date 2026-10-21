'use strict';
// ============ Chapter 7 「로렐라이」 (season 2): the boss LORELEI (RT1-03), the Listener zombie, the hall's speakers and chandelier ============
// episode.js runs the story; this file is what fights in it (the shared toys — floor warnings, laser sights, scripted leaps — are in
// epbase.js). Host-authoritative: the host runs LORELEI's brain and every Listener's ears and decides every hit; clients get her gauges,
// the song, the speakers, the chandelier in the chapter snapshot (EP.pack → bsPack) and the moments as events ('elr'). Every page pulls
// its own player toward her while she sings; the host pulls its bots.
// LORELEI, RT-1's negotiator, read the evacuation broadcasts that called the survivors here ("come north, we are waiting"). The feeling the
// suppressant held down was loneliness: she cannot bear to be left alone, so she calls everyone to her. 13,000 × (0.6 + 0.4 × humans) ×
// difficulty health and her own brain (EPZ.lorelei.ai).
//   phase 1 (100–70 %) on the stage, the curtain rising: her song (3.2 s: everybody within reach is pulled toward her — 34 m with the four
//            speakers on, 31 / 27 / 22 with fewer, 16 with none; crouching holds you nearly still; 5 % of her health in damage breaks it, else a
//            pink ring 8 m round her bursts at its end: 40 and knocked flat), a scream through her bullhorn (a red strip 5.5 m wide, 22 long:
//            30 and dizzy), calling her audience (Listeners through the doors).
//   70 %     she leaps up into the fly tower
//   phase 2 (70–30 %) from perch to perch — the fly galleries, the upper boxes, the balconies — and down onto the floor to hunt: the
//            embrace (a laser 1.2 s, then the one marked is pulled at 4.8 m/s; caught, they are held 2.6 s until 3 % of her health in damage
//            frees them), the follow spot (8 s: every zombie goes for whoever it lights), lighting bars cut down onto the stage (red strips:
//            34 and knocked flat), songs and screams.
//   30 %     the blackout: emergency strobes, flashlights
//   phase 3 (30–0 %) she hunts by sound like her audience and can hardly be seen (seen while she sings, screams, lunges or holds someone,
//            close up, in a flashlight): lunges at the loudest of them (a strip 0.8 s, 38 and knocked flat), a shriek ring 7.5 m round her
//            (30, dizzy), short songs, decoys — her humming from the speakers still standing (the real one has footsteps).
// The speakers (four stacks: shot to pieces, or their power box held 3 s): each one gone is +30 stagger and shortens her song's reach;
// with none she has no decoys. The chandelier over the stalls (its chain shot, or the winch on the west wall held 2 s) comes down in
// a red ring 5.5 m round: under it she loses 8 % of her health and +60 stagger; once. Stagger also: a broken song +30, HE +15, frost +10.
// Full gauge: down 6 s (×1.5), the next 25 % longer. Every phase change is 3.5 s of invulnerability and gets the team back up; enraged
// after 240 s (expert 180).
const LR_PH=[1,.7,.3],LR_S=1.2;
const LR_POSE=['','sing','scream','reach','hug','lunge','perch','down','bow','call'];
const LR_MIX=[['listener',40],['rager',28],['runner',24],['scream',8]];
const lrYaw=(dx,dz)=>Math.atan2(-dx,-dz);

// ---------- atlas materials: the bullhorn, the chandelier's gilt and crystal, its bulbs, the lighting bars ----------
const LR_MATS=['lrHorn','lrHornW','lrCrys','lrGilt','lrBulb','lrPipe','lrBurnt'];
for(const m of LR_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintLrAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the bullhorn: scuffed white plastic, a red band, RT-1's stencil
  patch('lrHorn',(xx,y,X,Y)=>{let c=mix('#d8dcd8','#c4c8c4',nz(X,Y,7001,10));if(y>54&&y<72)c='#c81c1c';if(nz(X,Y,7002,6)>.7)c=dk(c,.25);return c},244);
  patch('lrHornW',(xx,y)=>((xx>>2)+(y>>2))%2?'#141414':'#2a2a2a',246);
  // cut crystal: pale facets, a cold glint (they glow a little)
  patch('lrCrys',(xx,y,X,Y)=>{const f=((xx>>3)+(y>>3))%3;let c=f===0?'#e8f4ff':f===1?'#b8d0e8':'#d0e0f0';if(nz(X,Y,7011,8)>.7)c='#ffffff';return c},236);
  patch('lrGilt',(xx,y,X,Y)=>{let c=mix('#8a6a1a','#e0b850',nz(X,Y,7021,6));if((xx+y)%18<2)c=lt(c,.3);return c},242);
  patch('lrBulb',(xx,y)=>{const u=(xx/PS-.5)*2,v=(y/PS-.5)*2,r=Math.hypot(u,v);return r<.5?'#fffbe8':r<.9?'#ffe8b0':'#d8b878'},232);
  patch('lrPipe',(xx,y,X,Y)=>{let c=mix('#1a1a1c','#2a2a2e',nz(X,Y,7031,8));if(y%32<2)c='#3a3a3e';return c},246);
  // a speaker's front once it has blown: the grille torn, the cone a black hole with ragged paper round it, soot
  patch('lrBurnt',(xx,y,X,Y)=>{const u=xx/PS-.5,v=y/PS-.5,r=Math.hypot(u,v)+(nz(X,Y,7041,5)-.5)*.1;let c=mix('#1a1816','#2c2824',nz(X,Y,7042,9));
    // the hole, torn paper round it (grey, scorched brown at its edge), the grille's frame bent, soot up from it
    if(r<.16)c=mix('#020202','#090909',nz(X,Y,7043,4));else if(r<.27)c=nz(X,Y,7044,3)>.42?mix('#8a8278','#5a4a38',clamp((r-.16)*9,0,1)):'#0a0908';else if(r<.31)c='#3a2a1c';
    if((xx%6<2||y%6<2)&&r>.31&&nz(X,Y,7045,7)>.5)c='#4a4a48';if(v<0&&Math.abs(u)<.22&&nz(X,Y,7046,6)>.55)c=dk(c,.55);return c},250);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintLrAtlas()}}

// ---------- the models (the weapon material): her bullhorn (its bell down -y), the chandelier (hung from its top), a lighting bar ----------
function lrChandParts(){const L=[Pt(0,-.35,0,.08,.7,.08,'lrGilt'),Pt(0,-.76,0,.3,.14,.3,'lrGilt'),Pt(0,-.05,0,.16,.1,.16,'lrGilt')];
  const ring=(r,y,n,cry,blb)=>{for(let i=0;i<n;i++){const g=i/n*TAU,x=Math.cos(g)*r,z=Math.sin(g)*r;L.push(Pt(x,y,z,TAU*r/n*1.1,.07,.07,'lrGilt',{ry:Math.PI/2-g}));
      if(cry)L.push(Pt(x,y-.2,z,.05,.26,.05,'lrCrys'),Pt(x,y-.4,z,.035,.1,.035,'lrCrys'));if(blb&&i%2===0)L.push(Pt(x,y+.08,z,.035,.1,.035,'lrGilt'),Pt(x,y+.17,z,.055,.09,.055,'lrBulb'))}};
  ring(1.55,-1.5,20,1,1);ring(1.05,-1.15,14,1,1);ring(.6,-.86,10,1,0);
  for(let i=0;i<6;i++){const g=i/6*TAU;L.push(Pt(Math.cos(g)*.8,-1.2,Math.sin(g)*.8,1.55,.05,.05,'lrGilt',{ry:-g}))}
  for(let i=0;i<16;i++){const g=i/16*TAU;for(let k=0;k<4;k++){const r=.66+k*.26;L.push(Pt(Math.cos(g)*r,-1.62-Math.sin(k/3*Math.PI)*.2,Math.sin(g)*r,.04,.04,.04,'lrCrys'))}}
  L.push(Pt(0,-1.9,0,.5,.26,.5,'lrGilt'),Pt(0,-2.15,0,.14,.3,.14,'lrCrys'),Pt(0,-2.36,0,.08,.14,.08,'lrCrys'));return L}
Object.assign(GUNS,{
  lrMega:{parts:[Pt(0,-.02,0,.034,.11,.04,'blk2'),Pt(0,-.1,0,.075,.1,.075,'lrHorn',{r:.03}),Pt(0,-.2,0,.12,.1,.12,'lrHorn',{r:.04}),Pt(0,-.28,0,.17,.06,.17,'lrHorn',{r:.05}),
    Pt(0,-.313,0,.15,.008,.15,'lrHornW'),Pt(.05,-.04,0,.028,.07,.034,'blk',{rz:.3}),Pt(-.05,-.08,0,.02,.02,.08,'blk')],grip:[0,0,0],muzzle:[0,-.32,0]},
  lrChand:{parts:lrChandParts(),grip:[0,0,0],muzzle:[0,0,0]},
  lrBatten:{parts:[Pt(0,0,0,28,.11,.11,'lrPipe'),...[-12,-8,-4,0,4,8,12].flatMap(x=>[Pt(x,-.24,0,.34,.38,.3,'lrPipe'),Pt(x,-.44,0,.26,.02,.24,'lrBulb')])],grip:[0,0,0],muzzle:[0,0,0]}});

// ---------- sounds: her song (a wordless vocalise), her hum, the bullhorn scream, the crescendo, a broken note, the shelter's broadcast,
// the Listeners' hum and their gasp when they hear you, the chandelier's chain and its crash, a speaker blowing, a lighting bar falling ----------
// a sung vowel: sawtooth voices through three formant bands, vibrato, a breath of noise; notes [[midi, seconds], ...]
function lrVoice(B,notes,o){const oc=B.oc,out=o.dst,F=o.F||[800,1150,2900],Q=o.Q||[6,8,10],Gs=o.Gs||[1,.55,.3],att=o.att||.12;
  const fb=oc.createGain();for(let i=0;i<3;i++)fb.connect(B.f('bandpass',F[i],Q[i],B.g(Gs[i],out)));
  const total=notes.reduce((s,n)=>s+n[1],0),env=B.env(o.t0||0,att,1,o.rel||.45,fb,Math.max(.02,total-att-.1));
  for(const det of o.det||[1,1.006]){const osc=oc.createOscillator();osc.type='sawtooth';const fr=osc.frequency;let t=o.t0||0;
    for(const [m,d] of notes){const f=440*Math.pow(2,(m-69)/12)*det*(o.oct||1);if(t===(o.t0||0))fr.setValueAtTime(f,t);else fr.linearRampToValueAtTime(f,t+.07);fr.setValueAtTime(f,t+Math.max(.08,d-.02));t+=d}
    const lfo=oc.createOscillator();lfo.frequency.value=o.vib||5.6;const lg=oc.createGain();lg.gain.value=o.vd==null?6:o.vd;lfo.connect(lg);lg.connect(fr);lfo.start(0);lfo.stop((o.t0||0)+total+.6);
    const og=oc.createGain();og.gain.value=det===1?1:.5;osc.connect(og);og.connect(env);osc.start(o.t0||0);osc.stop((o.t0||0)+total+.6)}
  if(o.breath!==0){const e=B.env(o.t0||0,.2,o.breath||.1,.4,out,Math.max(.05,total-.3));B.nz('pink',o.t0||0,total+.3,B.f('bandpass',2800,1.2,e))}
  return total}
Object.assign(SFX,{
  lrsong:{n:2,dur:4,ch:2,peak:.85,gain:.85,rev:.55,poly:2,fn:(B,v)=>{const out=B.g(.9);
    const N=v?[[76,.5],[74,.42],[72,.46],[71,.86],[69,1.26]]:[[69,.46],[72,.36],[71,.42],[76,.86],[74,.42],[69,1]];
    lrVoice(B,N,{dst:B.pan(-.2,out),det:[1]});lrVoice(B,N.map(n=>[n[0]-12,n[1]]),{dst:B.pan(.2,out),det:[1.004],Gs:[.6,.3,.12],breath:0})}},
  lrhum:{n:2,dur:2.4,ch:2,peak:.7,gain:.6,rev:.4,poly:3,fn:(B,v)=>{const out=B.g(.9);lrVoice(B,v?[[64,.7],[62,.6],[64,.6]]:[[62,.6],[64,.8],[60,.5]],{dst:out,F:[300,900,2400],Q:[8,10,12],Gs:[1,.18,.04],att:.25,rel:.5,vd:3,breath:.04,oct:.5})}},
  lrscream:{n:2,dur:1.4,ch:2,peak:.9,gain:.9,rev:.35,poly:2,fn:(B,v)=>{const out=B.comp(-10,4,.002,.2,B.g(.9));const dist=B.sh(7,B.f('highpass',500,.7,B.f('bandpass',1900,.8,out)));
    for(const det of [1,1.013,.988]){const e=B.env(0,.03,1,.5,dist,.7);const o=B.oc.createOscillator();o.type='sawtooth';const f=o.frequency;const b=(v?860:780)*det;
      f.setValueAtTime(b,0);f.linearRampToValueAtTime(b*1.75,.16);f.linearRampToValueAtTime(b*1.45,.6);f.exponentialRampToValueAtTime(b*.8,1.2);o.connect(e);o.start(0);o.stop(1.3)}
    {const e=B.env(0,.01,.6,.4,out,.5);B.nz('white',0,1,B.f('bandpass',3200,.9,e))}{const e=B.env(0,.005,.7,.12,out);B.osc('square',620,560,0,.15,B.f('bandpass',900,2,e))}}},
  lrcresc:{n:1,dur:1.8,ch:2,peak:.9,gain:.9,rev:.6,poly:1,fn:B=>{const out=B.g(.9);for(const m of [81,84,88])lrVoice(B,[[m,1.1]],{dst:B.pan((m-84)/10,out),det:[1],att:.03,rel:.5,Gs:[.8,.5,.4]});
    {const e=B.env(.05,.01,1,.8,out);B.nz('pink',.05,1,B.f('bandpass',1600,.6,e))}{const e=B.env(.05,.01,1,.9,out);B.osc('sine',90,40,.05,1,e)}}},
  lrbreak:{n:1,dur:.9,ch:2,peak:.85,gain:.8,rev:.4,poly:1,fn:B=>{const out=B.g(.9),fb=B.f('bandpass',1150,6,out);const e=B.env(0,.02,1,.35,fb,.25);const o=B.oc.createOscillator();o.type='sawtooth';const f=o.frequency;
    f.setValueAtTime(880,0);for(let i=0;i<9;i++)f.setValueAtTime([880,1320,620,1760,540,1100,400,900,300][i],.05+i*.045);o.connect(e);o.start(0);o.stop(.8);
    {const e2=B.env(.02,.002,1,.03,out);B.nz('white',.02,.05,B.f('highpass',2000,.7,e2))}}},
  lrpa:{n:1,dur:3.6,ch:1,peak:.75,gain:.7,rev:.5,poly:1,fn:B=>{const out=B.sh(3,B.f('highpass',420,.7,B.f('lowpass',3200,.7,B.g(.9))));const V=[[800,1150,2900],[400,2000,2600],[450,800,2830],[325,700,2530],[270,2300,3000]];let t=.1;
    for(let i=0;i<14;i++){const d=rr(.12,.24),vw=V[(hash2(i,1,7091)*V.length)|0],fb=B.oc.createGain();for(let k=0;k<3;k++)fb.connect(B.f('bandpass',vw[k],8,B.g([1,.5,.25][k],out)));
      const e=B.env(t,.02,1,.06,fb,d);const o=B.oc.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(rr(215,250),t);o.frequency.linearRampToValueAtTime(rr(195,235),t+d);o.connect(e);o.start(t);o.stop(t+d+.1);
      t+=d+(i%4===3?rr(.18,.3):rr(.02,.06));if(t>3.3)break}}},
  lshum:{n:3,dur:2,ch:1,peak:.6,gain:.5,rev:.3,poly:6,fn:(B,v)=>{const m=[52,50,55][v];lrVoice(B,[[m,.8],[m-1,.8]],{dst:B.g(.9),F:[300,870,2240],Q:[8,10,12],Gs:[1,.25,.06],att:.3,rel:.4,vd:2,breath:.03,det:[1,1.01]})}},
  lsalert:{n:2,dur:.8,ch:1,peak:.8,gain:.7,rev:.2,poly:4,fn:(B,v)=>{const out=B.g(.9);{const e=B.env(0,.25,.8,.08,out);const f=B.f('highpass',1500,.8,e);B.sweep(f,1200,3800,0,.3);B.nz('white',0,.35,f)}
    grunt(B,v?115:98,.32,[480,900,2000],1.5)}},
  lrchain:{n:1,dur:.9,ch:2,peak:.8,gain:.7,rev:.25,poly:1,fn:B=>{const out=B.g(.9);for(let i=0;i<26;i++){const t=i*.028+rr(0,.01);B.grain(t,rr(2400,6200),rr(4,9),rr(.01,.03),rr(.3,.8),B.pan(rr(-.4,.4),out))}}},
  lrcrash:{n:1,dur:2.2,ch:2,peak:.9,gain:.9,rev:.4,poly:1,fn:B=>{const out=B.comp(-10,4,.002,.2,B.g(.9));{const e=B.env(0,.004,1,.6,out);B.osc('sine',70,34,0,.7,e)}{const e=B.env(0,.002,1,.35,out);B.nz('brown',0,.4,B.f('lowpass',600,.7,e))}
    for(let i=0;i<70;i++){const t=Math.pow(Math.random(),1.8)*1.6;B.grain(t,rr(3000,9000),rr(6,14),rr(.006,.03),rr(.15,.6)*(1-t/1.9),B.pan(rr(-.9,.9),out))}
    for(let i=0;i<5;i++){const t=rr(.02,.4);B.ring(t,rr(1800,3200),[1,2.76,5.4],[.5,.3,.2],[.3,.15,.08],B.pan(rr(-.6,.6),out))}}},
  lrspk:{n:1,dur:1.4,ch:2,peak:.85,gain:.8,rev:.3,poly:2,fn:B=>{const out=B.g(.9);{const e=B.env(0,.001,1,.05,out);B.nz('white',0,.06,B.f('highpass',1200,.7,e))}
    {const e=B.env(.01,.01,.5,1.1,out);B.osc('square',60,58,.01,1.2,B.f('lowpass',300,.8,e))}{const e=B.env(.04,.05,.35,.9,out,.2);B.osc('sine',2600,1900,.04,1.2,e)}}},
  lrbat:{n:1,dur:1.4,ch:2,peak:.9,gain:.85,rev:.35,poly:2,fn:B=>{const out=B.g(.9);B.ring(0,rr(300,420),[1,2.4,4.1,6.3],[1,.7,.5,.3],[.6,.4,.3,.2],out);{const e=B.env(0,.003,1,.4,out);B.nz('brown',0,.45,B.f('lowpass',800,.7,e))}
    for(let i=0;i<14;i++)B.grain(rr(0,.5),rr(2000,6000),rr(5,10),rr(.005,.02),rr(.2,.5),B.pan(rr(-.7,.7),out))}}});
SFX_ORDER.push('lrsong','lrhum','lrscream','lrcresc','lrbreak','lrpa','lshum','lsalert','lrchain','lrcrash','lrspk','lrbat');

// ---------- what the Listeners (and LORELEI in the dark) hear: each human's noise right now (host, once a frame) ----------
// r = how far it carries: a shot 44 m (fading over a second; a silenced gun 9, a blade 5), running feet 15, walking 7, crouch-walking
// or the walk key 2.4, a reload 6, a device being worked 11; whoever is within 1.8 m is felt anyway
const HEAR={t:-1,L:[],
  tick(){if(this.t===G.t)return;this.t=G.t;this.L.length=0;
    for(const h of SCEN.H){if(!h.alive||h.team!==TH)continue;const c=h.c,sp=Math.hypot(c.vx,c.vz),W=WPN[h.cur]||{},sh=G.t-(h.lastFire==null?-9:h.lastFire);let r=1.8;
      if(sh<1.2)r=Math.max(r,W.quiet?9:W.kind==='melee'?5:44-sh*14);
      if(c.onGround&&sp>1.2){const q=h.duck||!!(h.cmd&&h.cmd.walk);r=Math.max(r,q?2.4:sp>4.4?15:7)}
      if(h.reloadT>0)r=Math.max(r,6);if(h.epUse>=0)r=Math.max(r,11);this.L.push([h,r])}},
  // the human a listener at x,y,z hears best: the loudest whose noise reaches it (a wall in between: as if 60 % further)
  best(x,y,z){let b=null,bs=-1;for(const [h,r] of this.L){let d=Math.hypot(h.c.x-x,h.c.z-z)+Math.abs(h.c.y-y)*1.5;if(d>r)continue;
      if(d>3&&!losClear(x,y+1.5,z,h.c.x,h.c.y+1.3,h.c.z)){d*=1.6;if(d>r)continue}if(r-d>bs){bs=r-d;b=h}}return b},
  noise(h){for(const q of this.L)if(q[0]===h)return q[1];return 0}};

// ---------- the Listener: blind (bandaged), it goes for what it hears; silence and it stands, head on one side, listening ----------
const LISTEN={cur:null,
  // host: its own ears instead of the zombie AI's eyes (the AI still does the chasing while it hears somebody)
  ai(a,dt){const B=a.bot;if(!B)return false;const S=a.ls||(a.ls={mem:null,memT:-9,lx:a.c.x,ly:a.c.y,lz:a.c.z,goT:0,idleT:0,alT:-9});HEAR.tick();const c=a.c;
    const h=HEAR.best(c.x,c.y,c.z);
    if(h){if((S.mem!==h||G.t-S.memT>2.5)&&G.t-S.alT>3){S.alT=G.t;LORELEI.fx({k:'la',i:a.id})}S.mem=h;S.memT=G.t;S.lx=h.c.x;S.ly=h.c.y;S.lz=h.c.z;S.idleT=0}
    const base=SCEN.SPD.listener||.86;
    // heard somebody in the last 2.5 s: the zombie AI hunts them (at an ordinary zombie's pace; it shuffles at half that while it listens)
    if(S.mem&&S.mem.alive&&S.mem.team===TH&&G.t-S.memT<2.5){B.target=S.mem;B.tgtT=Math.max(B.tgtT,.5);a.spdMul=base;return false}
    a.spdMul=base*.5;S.idleT+=dt;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.fire=cmd.jump=false;
    // gone quiet: to where it last heard something; a long silence and it drifts toward the nearest of them (it smells them); a very long one, it is moved
    let g=[S.lx,S.ly,S.lz];if(S.idleT>12){let bd=1e9;for(const o of SCEN.H)if(o.alive){const d=Math.hypot(o.c.x-c.x,o.c.z-c.z);if(d<bd){bd=d;g=[o.c.x,o.c.y,o.c.z]}}}
    if(S.idleT>32){let far=true;for(const o of SCEN.H)if(o.alive&&Math.hypot(o.c.x-c.x,o.c.z-c.z)<30)far=false;if(far){S.idleT=0;const p=SCEN.spawnPoint(false);if(p){placeAt(a,p[0],p[1],p[2],a.yaw);AI.onTeam(a)}}return true}
    if(Math.hypot(g[0]-c.x,g[2]-c.z)>1.6){S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1.5;AI.goTo(a,g[0],g[1],g[2],jumpCap(a),true)}
      B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;if(!AI.follow(a,dt,false)){const dx=g[0]-c.x,dz=g[2]-c.z,d=Math.hypot(dx,dz)||1;AI.moveDir(a,dx/d,dz/d)}if(B.think<=0)B.think=.15;
      const wx=-Math.sin(a.yaw)*cmd.f+Math.cos(a.yaw)*cmd.s,wz=-Math.cos(a.yaw)*cmd.f-Math.sin(a.yaw)*cmd.s;if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,5);AI.moveDir(a,wx,wz)}}
    return true},
  // every page: its humming (heard nearby, in 3D), and how fast it moves (the pose: hunting arms out, listening arms down)
  pre(a,dt){this.cur=a;a.lsSpd=Math.hypot(a.c.vx,a.c.vz);if(!a.alive)return;a.lsHumT=(a.lsHumT==null?rr(1,4):a.lsHumT)-dt;
    if(a.lsHumT<=0){a.lsHumT=rr(3.5,6.5);const P=G.player;if(P&&Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z)<26)AU.at('lshum',a.c.x,a.c.y+1.6,a.c.z,{vol:.55,range:24,rate:rr(.92,1.08)})}}};
EPZ.listener={init(a){a.ls=null;a.lsHumT=rr(1,4)},ai:(a,dt)=>LISTEN.ai(a,dt),pre:(a,dt)=>LISTEN.pre(a,dt),gone(a){a.ls=null}};

// ---------- the hall's speakers: four stacks; shot to pieces or their power cut (hold E 3 s at the box) ----------
// Each has a red power lamp low on its front (a glow) while it is on; once it is gone its front is a torn black hole that smokes.
const lrDotTex=()=>LRFX.dotTex||(LRFX.dotTex=(()=>{const [cv,x]=mkCanvas(32,32);const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(cv)})());
const SPK={L:[],T:3,
  build(){if(this.L.length||!MAP.ez||!MAP.ez.spk)return;for(const s of MAP.ez.spk){const D={i:s.i,x:s.x,z:s.z,h:s.h,w:s.w||1.6,bx:s.bx,bz:s.bz,hp:0,alive:true,p:0,smT:0,led:null,burnt:null};
      const sp=D.led=new THREE.Sprite(new THREE.SpriteMaterial({map:lrDotTex(),color:0xff2a14,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(D.x+D.w*.35,.5,D.z+.83);sp.scale.set(.22,.22,1);sp.renderOrder=5;sp.visible=false;R.scene.add(sp);
      // (the blown front: square-ish tiles up its height, so the holes stay round)
      const n=Math.max(1,Math.round(D.h/D.w)),th=D.h/n,id='lrSpkX'+D.i;GUNS[id]={parts:Array.from({length:n},(_,k)=>Pt(0,th*(k+.5),0,D.w-.06,th-.04,.02,'lrBurnt')),grip:[0,0,0],muzzle:[0,0,0]};
      const m=D.burnt=new THREE.Mesh(gunGeo(id),matGun());m.position.set(D.x,0,D.z+.812);m.visible=false;m.frustumCulled=false;R.scene.add(m);sampleProbe(D.x,2,D.z+1.5,m.material.uniforms.uProbe.value);this.L.push(D)}},
  hpMax(){return Math.round(360*SC_DIFF.hp[G.diff||0])},
  alive(){let n=0;for(const D of this.L)if(D.alive)n++;return n},
  reset(){for(const D of this.L){D.alive=true;D.hp=this.hpMax();D.p=0;if(D.burnt)D.burnt.visible=false}},
  // host: damage from a shot (the box's own hit), the power cut
  hit(i,d){const D=this.L[i];if(!D||!D.alive||NET.cli)return;D.hp-=d;if(D.hp<=0)this.kill(i)},
  kill(i,remote){const D=this.L[i];if(!D||!D.alive)return;D.alive=false;D.p=0;this.fxDead(D,true);if(NET.cli||remote)return;LORELEI.fx({k:'spk',n:i});
    const b=EP.bossA();if(b&&b.lr&&!b.lr.enc)LORELEI.grog(b,30);EP.say(this.alive()?'lSpk':'lSpkAll')},
  fxDead(D,loud){if(D.burnt)D.burnt.visible=true;if(!loud)return;AU.at('lrspk',D.x,D.h*.6,D.z,{vol:1,range:70});DL.add(D.x,D.h*.6,D.z+1.2,'#ffb060',7,2.2,.25);
    for(let k=0;k<34;k++)FX.spawn({x:D.x+rr(-.6,.6),y:rr(.6,D.h),z:D.z+.85,vx:rr(-3,3),vy:rr(0,4),vz:rr(.5,4),life:rr(.2,.6),s0:.06,s1:.02,r:1,g:.8,b:.4,f:0,grav:9,add:1});
    for(let k=0;k<10;k++)FX.spawn({x:D.x+rr(-.5,.5),y:rr(1,D.h),z:D.z+1,vx:rr(-.4,.4),vy:rr(.3,1),vz:rr(.2,.8),life:rr(1,2),s0:.5,s1:1.5,r:.14,g:.13,b:.12,a:.55,f:2,drag:.8})},
  // a client: the snapshot's mask (a speaker gone while it was away goes quietly)
  sync(mask,pw){for(const D of this.L){const on=!!(mask&1<<D.i);if(D.alive&&!on){D.alive=false;this.fxDead(D,false)}else if(!D.alive&&on){D.alive=true;if(D.burnt)D.burnt.visible=false}if(pw)D.p=(pw[D.i]||0)/10}},
  update(dt){const on4=EP.st===4;for(const D of this.L){if(D.led){D.led.visible=on4&&D.alive;if(D.led.visible){const k=D.p>0?.5+.5*Math.abs(Math.sin(G.t*14)):1;D.led.material.opacity=k}}
      if(!D.alive&&on4){D.smT-=dt;if(D.smT<=0){D.smT=.35;FX.spawn({x:D.x+rr(-.3,.3),y:D.h+.1,z:D.z+rr(-.3,.3),vx:rr(-.2,.2),vy:rr(.6,1.2),vz:rr(-.2,.2),life:rr(1.2,2),s0:.3,s1:1.2,r:.12,g:.12,b:.12,a:.5,f:2,drag:.8});
        if(Math.random()<.2)FX.spawn({x:D.x+rr(-.5,.5),y:rr(.5,D.h),z:D.z+.9,vx:rr(-1,1),vy:rr(0,2),vz:rr(0,1.5),life:.25,s0:.05,s1:.02,r:1,g:.85,b:.5,f:0,grav:9,add:1})}}}},
  pack(){let m=0;for(const D of this.L)if(D.alive)m|=1<<D.i;return m},
  clear(){for(const D of this.L){if(D.led){R.scene.remove(D.led);D.led.material.dispose()}if(D.burnt){R.scene.remove(D.burnt);D.burnt.material.dispose()}}this.L=[]}};

// ---------- the chandelier: over the stalls; its chain shot through or the winch let go, it comes down once ----------
// st: 0 hanging, 1 falling, 2 down on the floor (smashed, tilted, crystals everywhere: low cover then)
const CHAND={st:0,t:0,hp:150,p:0,T:2,g:null,m:null,L:null,box:null,y0:12.6,yR:2,rot:[.2,.5,.26],
  build(){if(this.g||!MAP.ez||!MAP.ez.chand)return;const C=MAP.ez.chand;const m=this.m=new THREE.Mesh(gunGeo('lrChand'),matGun());m.frustumCulled=false;const g=this.g=new THREE.Group();g.add(m);g.position.set(C.x,this.y0,C.z);R.scene.add(g);
    sampleProbe(C.x,10,C.z,m.material.uniforms.uProbe.value);m.material.uniforms.uProbe.value.multiplyScalar(1.6)},
  reset(){this.st=0;this.t=0;this.hp=150;this.p=0;if(this.box){worldRemoveDyn(this.box);this.box=null}if(this.g){const C=MAP.ez.chand,U=this.m.material.uniforms.uProbe.value;this.g.position.set(C.x,this.y0,C.z);this.g.rotation.set(0,0,0);sampleProbe(C.x,10,C.z,U);U.multiplyScalar(1.6)}},
  hit(d){if(this.st!==0||NET.cli)return;this.hp-=d;if(this.hp<=0)this.release()},
  // host: let go (a ring where it will land), the clients follow the event
  release(remote){if(this.st!==0)return;this.st=1;this.t=0;this.p=0;const C=MAP.ez.chand;AU.at('lrchain',C.x,this.y0,C.z,{vol:1,range:80});
    if(NET.cli||remote)return;TELE.add({k:'c',x:C.x,y:0,z:C.z,r:C.r,d:1.02,col:0xffd060});LORELEI.fx({k:'chf'});EP.say('lChandX')},
  // it lands (every page: the crash; the host: who was under it)
  crash(remote){const C=MAP.ez.chand,x=C.x,z=C.z;this.st=2;this.downPose();AU.at('lrcrash',x,1,z,{vol:1,range:120,occ:false});AU.at('explode',x,.5,z,{vol:.6,range:90,occ:false,rate:1.6});DL.add(x,1.5,z,'#ffe0b0',14,2.4,.35);
    for(let i=0;i<70;i++){const g=rr(0,TAU),s=rr(2,10);FX.spawn({x:x+rr(-1,1),y:rr(.3,1.5),z:z+rr(-1,1),vx:Math.cos(g)*s,vy:rr(1,6),vz:Math.sin(g)*s,life:rr(.4,1.1),s0:.06,s1:.03,r:.85,g:.92,b:1,a:1,f:10,grav:12,col:.3,add:1})}
    for(let i=0;i<22;i++)FX.spawn({x:x+rr(-2,2),y:.3,z:z+rr(-2,2),vx:rr(-1,1),vy:rr(.3,1),vz:rr(-1,1),life:rr(1,2),s0:.4,s1:1.6,r:.6,g:.58,b:.55,a:.4,f:2,drag:1,lit:1});
    const P=G.player;if(P&&P.alive){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<16){FX.shake=Math.max(FX.shake,1-d/18);AU.shock(.8-d/22)}}
    this.clearOut(P);if(NET.cli||remote)return;
    for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>C.r||h.c.y>2)continue;const f=1-d/C.r;hurtHuman(h,EPD(50*(.5+.5*f)),null,{});epFx(h,'kd',1.2);SCEN.pushHuman(h,(h.c.x-x)/(d||1)*7,3,(h.c.z-z)/(d||1)*7)}
    for(const zz of SCEN.Z){if(!zz.alive||zz.boss)continue;const d=Math.hypot(zz.c.x-x,zz.c.z-z);if(d<C.r)damageActor(zz,3000,null,{he:1,dir:[0,1,0]})}
    const b=EP.bossA();if(b&&b.lr){const d=Math.hypot(b.c.x-x,b.c.z-z);if(d<C.r+.5&&b.c.y<2)LORELEI.chandHit(b)}
    for(const a of G.actors)if(a.alive&&!a.net&&a!==P)this.clearOut(a)},
  // (nobody stays inside the wreck: out to its nearest side; each page its own player, the host everyone it moves)
  clearOut(a){const B0=this.box;if(!a||!a.alive||!B0)return;const c=a.c,hw=c.hw||.3;if(c.y>B0.y1||c.x<B0.x0-hw||c.x>B0.x1+hw||c.z<B0.z0-hw||c.z>B0.z1+hw)return;
    const o=[[B0.x0-hw-.05-c.x,0],[B0.x1+hw+.05-c.x,0],[0,B0.z0-hw-.05-c.z],[0,B0.z1+hw+.05-c.z]].sort((p,q)=>Math.hypot(p[0],p[1])-Math.hypot(q[0],q[1]));
    for(const [dx,dz] of o)if(charFits(c,c.x+dx,c.y,c.z+dz)){c.x+=dx;c.z+=dz;return}},
  // lying on the stalls where it fell: smashed down, tilted; a low box in the world (cover)
  downPose(){const C=MAP.ez.chand;if(this.g){this.g.position.set(C.x,this.yR,C.z);this.g.rotation.set(this.rot[0],this.rot[1],this.rot[2]);sampleProbe(C.x,1.2,C.z,this.m.material.uniforms.uProbe.value)}if(this.L){this.L.dead=true;this.L=null}
    if(!this.box){this.box={x0:C.x-1.2,y0:0,z0:C.z-1.2,x1:C.x+1.2,y1:1.05,z1:C.z+1.2,mat:'metalx',o:{}};worldAddDyn(this.box)}},
  update(dt){if(!this.g)return;this.g.visible=EP.st>=3;const C=MAP.ez.chand;this.m.material.uniforms.uEmisA.value=this.st===2?.12:EP.dark?.35:1;
    if(this.st===0){if(!this.L)this.L=DL.add(C.x,this.y0-1.6,C.z,'#ffe2b0',18,0,0,{flick:.04});this.L.i=EP.dark?.15:1.1;this.g.rotation.y+=dt*.03}
    // falling: 20 m/s² from its hook to where it smashes down (its top 2 m over the floor then), tipping as it goes
    else if(this.st===1){this.t+=dt;const y1=this.yR,y=Math.max(y1,this.y0-.5*20*this.t*this.t),u=clamp((this.y0-y)/(this.y0-y1),0,1);this.g.position.y=y;
      this.g.rotation.set(this.rot[0]*u*u,this.g.rotation.y,this.rot[2]*u*u);if(this.L){this.L.y=y-1.6;this.L.i=.8+.6*Math.random()}
      if(y<=y1)this.crash(NET.cli)}
    if(NET.cli&&EP.bf){const cs=EP.bf.cs|0;if(cs===2&&this.st===0){this.st=2;this.downPose()}else if(cs===0&&this.st===2)this.reset()}},
  clear(){if(this.box){worldRemoveDyn(this.box);this.box=null}if(this.g){R.scene.remove(this.g);this.m.material.dispose();this.g=null}if(this.L){this.L.dead=true;this.L=null}this.st=0}};

// ---------- the follow spot (phase 2): a beam from the lighting bridge onto one of them; every zombie goes for them (ai.js: h.epMark) ----------
const LRSPOT={h:null,until:0,L:null,beam:null,mat:null,
  set(h,t,remote){this.clear();if(!h||!h.alive)return;this.h=h;this.until=G.t+t;h.epMark=this.until;this.L=DL.add(h.c.x,h.c.y+3,h.c.z,'#fff6e0',7,1.6,0);
    if(!this.beam){const cg=new THREE.CylinderGeometry(.08,1,1,16,1,true);cg.rotateX(-Math.PI/2);cg.translate(0,0,.5);this.mat=new THREE.MeshBasicMaterial({color:0xfff4e0,transparent:true,opacity:.1,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
      this.beam=new THREE.Mesh(cg,this.mat);this.beam.frustumCulled=false;this.beam.renderOrder=2;R.scene.add(this.beam)}this.beam.visible=true;
    if(h===G.player){HUD.announce(LI()?'THE SPOTLIGHT IS ON YOU':'조명이 당신을 비춘다 — 좀비가 몰려온다','z',2.4);AU.play('beep2',{vol:.8,rate:.7})}
    if(!NET.cli&&!remote){for(const z of SCEN.Z)if(z.alive&&z.bot&&Math.hypot(z.c.x-h.c.x,z.c.z-h.c.z)<40)z.bot.tgtT=0;LORELEI.fx({k:'spot',v:h.id,t:r2(t)})}},
  update(dt){const h=this.h;if(!h)return;if(G.t>this.until||!h.alive){this.clear();return}if(this.L){this.L.x=h.c.x;this.L.y=h.c.y+2.6;this.L.z=h.c.z}
    if(this.beam){const sx=0,sy=11,sz=1.2,ex=h.c.x,ey=h.c.y+.9,ez=h.c.z,L=Math.hypot(ex-sx,ey-sy,ez-sz);this.beam.position.set(sx,sy,sz);this.beam.lookAt(ex,ey,ez);const r=Math.max(.8,L*.05);this.beam.scale.set(r,r,L)}},
  clear(){if(this.h)this.h.epMark=0;this.h=null;if(this.L){this.L.dead=true;this.L=null}if(this.beam)this.beam.visible=false}};

// ---------- lighting bars cut down onto the stage (phase 2): they lie there till the stage is over ----------
const BATT={L:[],
  drop(z){const m=new THREE.Mesh(gunGeo('lrBatten'),matGun());m.position.set(0,9.8,z);m.frustumCulled=false;R.scene.add(m);sampleProbe(0,3,z,m.material.uniforms.uProbe.value);this.L.push({m,z,t:0})},
  update(dt){for(const B0 of this.L){B0.t+=dt;const y=Math.max(1.62,9.8-.5*24*B0.t*B0.t);B0.m.position.y=y;if(y<=1.62&&!B0.hit){B0.hit=1;B0.m.rotation.z=.04;AU.at('lrbat',0,1.6,B0.z,{vol:1,range:70});
      for(let i=0;i<24;i++)FX.spawn({x:rr(-13,13),y:1.7,z:B0.z+rr(-.4,.4),vx:rr(-2,2),vy:rr(.5,3),vz:rr(-2,2),life:rr(.3,.7),s0:.15,s1:.5,r:.5,g:.48,b:.45,a:.5,f:2,drag:2});
      const P=G.player;if(P&&P.alive&&Math.abs(P.c.z-B0.z)<6&&P.c.y>.8)FX.shake=Math.max(FX.shake,.5)}}},
  clear(){for(const B0 of this.L){R.scene.remove(B0.m);B0.m.material.dispose()}this.L=[]}};

// ---------- her decoys in the dark: her humming and footsteps from the speakers still standing (every page plays them) ----------
const LRDEC={L:[],
  start(P,t){this.L=[];for(let i=0;i+1<P.length;i+=2)this.L.push({x:P[i]/100,z:P[i+1]/100,t,hT:rr(0,.6),sT:rr(0,.4)})},
  update(dt){const b=EP.bossA();for(let i=this.L.length-1;i>=0;i--){const D=this.L[i];D.t-=dt;if(D.t<=0||!b){this.L.splice(i,1);continue}D.hT-=dt;D.sT-=dt;
      if(D.hT<=0){D.hT=rr(1.3,1.8);AU.at('lrhum',D.x,1.7,D.z,{vol:.8,range:50,rate:rr(.95,1.05)});if(typeof SNDV!=='undefined')SNDV.ping(b,'step',45,D.x,D.z)}
      if(D.sT<=0){D.sT=rr(.5,.7);AU.stepAt('zstep',D.x,.1,D.z,{vol:1.3,range:30,rate:.9});if(typeof SNDV!=='undefined')SNDV.ping(b,'step',30,D.x,D.z)}}},
  clear(){this.L=[]}};

// ---------- the song's look on every page: rings of sound out from her, the glowing sac, the pink haze on a player within reach ----------
const LRFX={rings:[],tex:null,glow:null,el:null,rT:0,
  ringTex(){if(this.tex)return this.tex;const [cv,x]=mkCanvas(128,128);const g=x.createRadialGradient(64,64,40,64,64,62);g.addColorStop(0,'rgba(255,120,200,0)');g.addColorStop(.6,'rgba(255,150,220,.85)');g.addColorStop(1,'rgba(255,120,200,0)');
    x.fillStyle=g;x.fillRect(0,0,128,128);return this.tex=new THREE.CanvasTexture(cv)},
  ring(x,y,z,big){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:this.ringTex(),color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(x,y,z);sp.scale.set(1,1,1);sp.renderOrder=6;R.scene.add(sp);
    this.rings.push({sp,t:0,T:big?1.1:1.4,s:big?20:14})},
  update(dt,b,Bs){for(let i=this.rings.length-1;i>=0;i--){const r=this.rings[i];r.t+=dt;const u=r.t/r.T;if(u>=1){R.scene.remove(r.sp);r.sp.material.dispose();this.rings.splice(i,1);continue}r.sp.scale.setScalar(1+u*r.s);r.sp.material.opacity=.6*(1-u)}
    const sing=!!(b&&b.alive&&Bs&&Bs.f&1),P=G.player;
    if(sing){this.rT-=dt;if(this.rT<=0){this.rT=.32;this.ring(b.c.x,b.c.y+1.9,b.c.z,false)}}
    // the sac at her throat glows while she sings (and in the dark when she shows herself)
    const lit=b&&b.alive&&Bs&&(sing||Bs.f&1024||Bs.f&64);if(lit){if(!this.glow)this.glow=DL.add(0,0,0,'#ff5ac0',6,0,0);const h=b.head||b.c;this.glow.x=h.x;this.glow.y=(h.y||b.c.y+2)-.3;this.glow.z=h.z;this.glow.i=sing?1.6+.5*Math.sin(G.t*13):.9}
    else if(this.glow){this.glow.dead=true;this.glow=null}
    // a pink haze closing in on a player she is pulling
    let k=0;if(sing&&P&&P.alive&&P.team===TH){const d=Math.hypot(b.c.x-P.c.x,b.c.z-P.c.z),R0=Bs.lr||20;if(d<R0)k=clamp(1-d/R0*.6,0,1)}
    if(Bs&&Bs.f&128&&P&&Bs.hg===P.id)k=1;
    const e=this.el||(this.el=EPV.el('epLure','position:absolute;inset:0;pointer-events:none;z-index:7;opacity:0;box-shadow:inset 0 0 140px 50px rgba(255,80,190,.8)'));const o=k>0?(k*(.45+.3*Math.sin(G.t*9))).toFixed(2):'0';if(e.style.opacity!==o)e.style.opacity=o},
  clear(){for(const r of this.rings){R.scene.remove(r.sp);r.sp.material.dispose()}this.rings=[];if(this.glow){this.glow.dead=true;this.glow=null}if(this.el)this.el.style.opacity='0'}};

// ---------- LORELEI ----------
const _lrV=new THREE.Vector3(),_lrM=new THREE.Matrix4(),_lrR=new THREE.Matrix4();
const LORELEI={cur:null,said:{},sayT:{},encNext:false,dutyT:0,dutyD:null,g2T:0,
  zc:'lorelei',name:['로렐라이','LORELEI'],code:'RT1-03',ticks:[70,30],g2:['스피커','SPEAKERS'],darkPh:3,
  wake:['로렐라이의 공연까지','LORELEI takes the stage in'],goText:['막이 오른다','THE CURTAIN RISES'],deadText:['로렐라이 무력화','LORELEI IS DOWN'],
  hpFor(){const H=SCEN.H.length,d=G.diff||0;return Math.round(13000*(.6+.4*H)*SC_DIFF.hp[d])},
  isEnc(a){return !!(a.lr&&a.lr.enc)},
  fx(m){this.fxApply(m);if(NET.host)netEv('elr',m)},
  sayOnce(k){if(this.said[k])return;this.said[k]=1;EP.say(k)},
  sayEvery(k,t){if(G.t-(this.sayT[k]||-99)<t)return;this.sayT[k]=G.t;EP.say(k)},
  // ---------- the chapter's hooks (episode.js) ----------
  // the boss stage's prep: center stage behind the curtain (a replay of phase 2: up on a fly gallery)
  prepSpawn(kind,bp){let b=EP.bossA();if(!b)b=this.spawn([0,1.4,-57],Math.PI,false);else if(kind!=='phase')this.init(b,false);if(!b)return;
    if(kind==='phase')this.reset(b,bp);else placeAt(b,0,1.4,-57,Math.PI);b.lr.idle=true;b.lrPose=''},
  go(b){const S=b.lr;if(!S)return;S.idle=false;S.pt=1.2;if(S.ph===1){S.cd.lure=1.6;S.cd.scr=5;S.cd.call=12}},
  // the first meeting (stage 3): up on the scene dock's catwalk, singing; away through the fly hatch when she has had enough
  meetStart(E){const M=MAP.ez.meet,a=this.spawn(M.a,Math.PI/2,true);if(!a)return;E.a=a;const S=a.lr;S.idle=false;S.cd.lure=1.5;S.cd.scr=4;S.spot=M.a;S.spotT=rr(4,6);
    this.fx({k:'meet',i:a.id});EP.say('enc');EP.later(2.8,()=>EP.say('enc2'));EP.later(6.5,()=>EP.say('lMeet'))},
  meetTick(E,dt){},
  meetLeave(E){if(E.a&&E.a.alive&&E.a.lr)this.retreat(E.a)},
  spawn(p,yaw,enc){const a=SCEN.Z.find(z=>z.boss);if(!a)return null;if(a.alive)EP.despawn(a);a.zpick='lorelei';a.deadT=99;this.encNext=!!enc;reviveZombie(a,p);a.yaw=yaw||0;this.encNext=false;return a},
  init(a,enc){const m=a.maxHp||1;
    a.lr={ph:1,mode:'',mt:0,mt0:1,pt:1,enc:!!enc,idle:!enc,invT:0,enr:false,fightT:0,grog:0,grogN:0,grogMax:100,slowT:0,dmgW:0,dmgWT:0,encT:0,
      cd:{lure:6,scr:4,call:14,hug:8,spot:10,bat:9,lunge:3,ring:7,decoy:5},spot:null,spotT:0,goT:0,tg:null,perch:-1,hopT:6,hops:0,floorT:0,
      song:null,hug:null,scr:null,lg:null,rng:null};
    a.lrPose='';a.lrHitT=-9;a.epDown=0;a.kin=null;a.epHide=false},
  // a replay of the boss fight starts the phase it reached again, at that phase's health
  reset(a,ph){a.hp=a.maxHp*LR_PH[ph-1];this.init(a,false);const S=a.lr;S.ph=ph;S.idle=true;a.frozen=0;a.kvx=a.kvz=0;
    if(ph===2){const P=MAP.ez.perch[0];placeAt(a,P.x,P.y,P.z,Math.PI/2);S.perch=0;S.hopT=4}else placeAt(a,0,1.4,-57,Math.PI)},
  // ---------- small helpers ----------
  face(a,x,z){if(Math.hypot(x-a.c.x,z-a.c.z)>.2)a.yaw=lrYaw(x-a.c.x,z-a.c.z)},
  eye(a){return a.head&&a.head.y>a.c.y?a.head:_lrV.set(a.c.x,a.c.y+2.1,a.c.z)},
  cen(){let x=0,z=0,n=0;for(const h of SCEN.H)if(h.alive){x+=h.c.x;z+=h.c.z;n++}return n?[x/n,0,z/n]:[0,0,-26]},
  nearH(a,r){let b=null,bd=r;for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d<bd&&Math.abs(h.c.y-a.c.y)<3){bd=d;b=h}}return b},
  seen(x,y,z,r){const out=[];for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d>r)continue;if(losClear(x,y,z,h.c.x,h.c.y+1.25,h.c.z)||losClear(x,y,z,h.c.x,h.c.y+1.6,h.c.z))out.push([d+(h.epMark>G.t?-8:0),h])}
    out.sort((p,q)=>p[0]-q[0]);return out.map(q=>q[1])},
  // the one making the most noise (phase 3 and her floor hunts): HEAR's reach, nearer counts a little
  loudest(a,r){HEAR.tick();let b=null,bs=-1e9;for(const [h,n] of HEAR.L){const d=Math.hypot(h.c.x-a.c.x,h.c.z-a.c.z);if(d>r)continue;const s=n-d*.35+(h===a.lr.tg?4:0);if(s>bs){bs=s;b=h}}return b},
  audN(){let n=0;for(const z of SCEN.Z)if(z.alive&&z.zc==='listener')n++;return n},
  audCap(){return 2+SCEN.H.length},
  // (her song's reach: 34 m with all four speakers on, then 31 / 27 / 22, 16 with none)
  lureR(){return [16,22,27,31,34][clamp(SPK.alive(),0,4)]},
  claw(a){const h=this.nearH(a,2.2);if(!h||Math.abs(h.c.y-a.c.y)>1.5)return false;this.face(a,h.c.x,h.c.z);a.cmd.fire=Math.random()<.85;return true},
  walk(a,dt,S,p,mul){const B=a.bot,c=a.c,cmd=a.cmd;if(!B)return;S.goT-=dt;if(S.goT<=0||!B.path||B.pi>=B.path.length){S.goT=1.2;AI.goTo(a,p[0],p[1],p[2],jumpCap(a),true)}
    B.think=(B.think||0)-dt;B.jumpT=(B.jumpT||0)-dt;const mv=AI.follow(a,dt,true);if(B.think<=0)B.think=.15;
    if(!mv){const dx=p[0]-c.x,dz=p[2]-c.z,d=Math.hypot(dx,dz);if(d>.4)AI.moveDir(a,dx/d,dz/d)}
    const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw),wx=fx*cmd.f+rx*cmd.s,wz=fz*cmd.f+rz*cmd.s;
    if(Math.hypot(wx,wz)>.1){AI.turnTo(a,Math.atan2(-wx,-wz),0,dt,9);AI.moveDir(a,wx,wz)}a.spdMul=(S.enr?1.25:1)*(S.slowT>0?.6:1)*mul},
  // ---------- host: the brain (EPZ.lorelei.ai: every frame instead of the zombie AI) ----------
  ai(a,dt){const S=a.lr;if(!S)return true;const cmd=a.cmd;cmd.f=cmd.s=0;cmd.jump=cmd.fire=cmd.alt=cmd.duck=cmd.skill=false;a.staggerT=0;a.spdMul=S.enr?1.25:1;
    S.invT=Math.max(0,S.invT-dt);S.slowT=Math.max(0,S.slowT-dt);S.dmgWT-=dt;if(S.dmgWT<=0){S.dmgWT=4;S.dmgW=0}
    if(a.frozen>0){a.frozen=0;a.c.vx=a.c.vz=0;S.slowT=3;this.grog(a,10);this.fx({k:'fz',i:a.id})}
    const live=(EP.ph==='run'||S.enc)&&!S.idle&&S.mode!=='gone';
    if(live&&!S.enc){S.fightT+=dt;if(!S.enr&&S.fightT>((G.diff||0)>=3?180:240)){S.enr=true;this.fx({k:'enr',i:a.id});EP.say('lEnr')}}
    const cdm=S.enr?1/.7:1;if(live)for(const k in S.cd)S.cd[k]-=dt*cdm;
    if(!live){a.lrPose='';return true}
    if(S.mode){S.mt-=dt;this.step(a,dt,S);return true}
    if(a.kin)return true;
    if(S.enc)this.pEnc(a,dt,S);else if(S.ph===1)this.p1(a,dt,S);else if(S.ph===2)this.p2(a,dt,S);else this.p3(a,dt,S);return true},
  // ---------- the first meeting: up and down the catwalk, a short song, screams at whoever is under her ----------
  pEnc(a,dt,S){const M=MAP.ez.meet,c=a.c;a.lrPose='perch';S.encT+=dt;if(S.encT>42){this.retreat(a);return}if(this.claw(a)){a.lrPose='';return}
    const t=this.nearH(a,50);S.spotT-=dt;if(S.spotT<=0){S.spot=S.spot===M.a?M.b:M.a;S.spotT=rr(5,8)}
    const sp=S.spot,d=Math.hypot(sp[0]-c.x,sp[2]-c.z);if(d>.8){a.lrPose='';this.walk(a,dt,S,sp,.65)}else if(t)this.face(a,t.c.x,t.c.z);
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;
    if(S.cd.lure<=0){S.cd.lure=16;this.singStart(a,S,{T:2.6,R:20,brk:.04,cresc:false,k:1.8,short:1});return}
    const L=this.seen(this.eye(a).x,this.eye(a).y,this.eye(a).z,30);if(S.cd.scr<=0&&L.length){S.cd.scr=7.5;this.scrStart(a,S,L[0]);return}},
  retreat(a){const S=a.lr;S.invT=99;S.mode='ret';S.mt=12;S.song=null;ELAS.stop(a);EP.say('lRet')},
  // ---------- phase 1: the stage ----------
  p1(a,dt,S){const c=a.c;a.lrPose='';if(this.claw(a))return;
    S.spotT-=dt;if(!S.spot||S.spotT<=0){const L=MAP.ez.stageP.filter(p=>p!==S.spot);S.spot=rpick(L);S.spotT=rr(4,7)}
    const sp=S.spot,d=Math.hypot(sp[0]-c.x,sp[2]-c.z);if(d>.7)this.walk(a,dt,S,sp,.55);else{const C=this.cen();this.face(a,C[0],C[2])}
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;const e=this.eye(a),L=this.seen(e.x,e.y,e.z,44),t=L[0]||null;
    if(S.cd.lure<=0){S.cd.lure=S.enr?12:16;this.singStart(a,S,this.lureO(S));return}
    if(S.cd.call<=0&&this.audN()<this.audCap()){S.cd.call=22;this.callStart(a,S);return}
    if(S.cd.scr<=0&&t){S.cd.scr=S.enr?4.6:6.5;this.scrStart(a,S,t);return}},
  lureO(S,short){return {T:short?2.4:3.2,R:this.lureR()*(short?.8:1),brk:short?.035:.04,cresc:!short,k:2.6*(1+.1*(S.ph-1)),short:short?1:0}},
  // ---------- phase 2: the perches, and down on the floor to hunt ----------
  p2(a,dt,S){const c=a.c;
    if(S.perch>=0){a.lrPose='perch';const e=this.eye(a),L=this.seen(e.x,e.y,e.z,55),t=L[0]||null;if(t)this.face(a,t.c.x,t.c.z);S.hopT-=dt;
      if(S.hopT<=0||this.nearH(a,3.5)){S.hops++;if(S.hops%2===0||!t)this.hopFloor(a,S);else this.hopPerch(a,S);return}
      S.pt-=dt;if(S.pt>0)return;S.pt=.35;const fly=S.perch<=1;
      if(S.cd.lure<=0){S.cd.lure=S.enr?14:20;this.singStart(a,S,this.lureO(S));return}
      if(fly&&S.cd.bat<=0&&this.onStage()>0){S.cd.bat=15;this.batStart(a,S);return}
      if(S.cd.spot<=0&&L.length>=2&&!(LRSPOT.h&&LRSPOT.h.alive)){S.cd.spot=18;S.mode='spot';S.mt=.8;S.tg=t;this.fx({k:'w',i:a.id,s:'spot'});return}
      if(S.cd.call<=0&&this.audN()<this.audCap()){S.cd.call=24;this.callStart(a,S);return}
      if(S.cd.scr<=0&&t){S.cd.scr=S.enr?4.4:6;this.scrStart(a,S,t);return}return}
    // on the floor: after the loudest of them; back up to a perch when the hunt is over
    a.lrPose='';S.floorT-=dt;if(S.floorT<=0&&!this.nearH(a,3)){this.hopPerch(a,S);return}
    if(this.claw(a))return;
    const tg=this.loudest(a,60)||this.nearH(a,60);S.tg=tg;if(tg){const d=Math.hypot(tg.c.x-c.x,tg.c.z-c.z);if(d>2.4)this.walk(a,dt,S,[tg.c.x,tg.c.y,tg.c.z],1);else this.face(a,tg.c.x,tg.c.z)}
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;const e=this.eye(a),L=this.seen(e.x,e.y,e.z,40),t=L[0]||null;
    if(S.cd.hug<=0&&t&&Math.hypot(t.c.x-c.x,t.c.z-c.z)<15&&Math.abs(t.c.y-c.y)<1.5&&!(t.grabT>0)){S.cd.hug=S.enr?9:13;this.hugStart(a,S,t);return}
    if(S.cd.lure<=0){S.cd.lure=S.enr?14:20;this.singStart(a,S,this.lureO(S));return}
    if(S.cd.scr<=0&&t){S.cd.scr=S.enr?4.4:6;this.scrStart(a,S,t);return}},
  // (on a floor she can walk from: the stalls, the stage, the rear platform, the balconies; not up in a box or on a fly gallery)
  onFloor(a){return a.c.y<5},
  onStage(){let n=0;for(const h of SCEN.H)if(h.alive&&h.c.z<-46.5&&h.c.y>1)n++;return n},
  // ---------- her leaps (host) ----------
  // The house and the stage house meet only through the proscenium's opening (z -46, |x| < 13, under 10.5 m): a leap whose line would go
  // through the wall either side of it goes by way of a point on the stage's front edge or out in the stalls in front of it
  PZ:-46,
  crossOK(x0,z0,x1,z1){if(z0<this.PZ===z1<this.PZ)return true;const t=(this.PZ-z0)/(z1-z0),x=x0+(x1-x0)*t;return Math.abs(x)<11.5},
  VIA:[[0,1.4,-49],[-8,1.4,-49],[8,1.4,-49],[0,0,-39],[-9,0,-38],[9,0,-38]],
  leap(a,S,x,y,z,done){const c=a.c;let pts=[[x,y,z]];
    if(!this.crossOK(c.x,c.z,x,z)){let bd=1e9;for(const V of this.VIA){if(!this.crossOK(c.x,c.z,V[0],V[2])||!this.crossOK(V[0],V[2],x,z))continue;const d=Math.hypot(V[0]-c.x,V[2]-c.z)+Math.hypot(x-V[0],z-V[2]);if(d<bd){bd=d;pts=[V,[x,y,z]]}}}
    const go=(i)=>{const p=pts[i],last=i===pts.length-1,d=Math.hypot(p[0]-c.x,p[2]-c.z),T=clamp(.55+d/18,.7,1.6);let h=clamp(1.5+d*.08,1.5,4.5);
      // (through the opening: under its top)
      if(c.z<this.PZ!==p[2]<this.PZ)h=Math.max(.4,Math.min(h,9.6-Math.max(c.y,p[1])));
      S.mode='hop';S.mt=T+1.5;epKin(a,p[0],p[1],p[2],T,h,()=>{this.fx({k:'land',x:r2(p[0]),y:r2(p[1]),z:r2(p[2])});if(last){if(done)done()}else go(i+1)});this.fx({k:'hop',i:a.id})};
    go(0)},
  // up onto one of the perches (the fly galleries, the upper boxes, the balconies, center stage), away from whoever is near
  hopPerch(a,S,only){const E=MAP.ez,C=this.cen();let best=-1,bs=1e9;for(let k=0;k<E.perch.length;k++){if(k===S.perch)continue;if(only&&!only(k))continue;const P=E.perch[k];
      // (where she sees the most of them — and they her — about 20 m off, not right by one of them)
      let s=Math.abs(Math.hypot(P.x-C[0],P.z-C[2])-20)+rr(0,10)+Math.hypot(P.x-a.c.x,P.z-a.c.z)*.12;for(const h of SCEN.H){if(!h.alive)continue;if(Math.hypot(h.c.x-P.x,h.c.z-P.z)<5&&Math.abs(h.c.y-P.y)<2)s+=30;if(losClear(P.x,P.y+1.9,P.z,h.c.x,h.c.y+1.5,h.c.z))s-=7}if(s<bs){bs=s;best=k}}
    if(best<0){S.hopT=3;return}const P=E.perch[best];S.perch=-1;
    this.leap(a,S,P.x,P.y,P.z,()=>{S.mode='rec';S.mt=.3;S.perch=best;S.hopT=rr(5,7.5)})},
  // down onto the floor near the loudest of them, for a hunt of 8-11 s (the chandelier's spot comes up now and then)
  hopFloor(a,S){const tg=this.loudest(a,80)||this.nearH(a,80),E=MAP.ez;let p=null;
    if(CHAND.st===0&&Math.random()<.4)p=[E.chand.x+rr(-2,2),0,E.chand.z+rr(-2,2)];else if(tg)p=[tg.c.x+rr(-5,5),tg.c.y,tg.c.z+rr(-5,5)];else p=rpick(E.floorP);
    const n=navSnap(p[0],p[1],p[2],5)||navSnap(p[0],0,p[2],8);if(!n){this.hopPerch(a,S);return}S.perch=-1;
    this.leap(a,S,n.x,n.y,n.z,()=>{S.mode='rec';S.mt=.3;S.floorT=rr(11,14)})},
  // ---------- phase 3: in the dark, by ear ----------
  p3(a,dt,S){const c=a.c;a.lrPose='';
    if(S.perch>=0){S.hopT-=dt;if(S.hopT<=0||this.nearH(a,3.5)){this.hopFloor(a,S);return}}
    else if(this.claw(a))return;
    const tg=this.loudest(a,70)||this.nearH(a,70);S.tg=tg;if(tg&&S.perch<0){const d=Math.hypot(tg.c.x-c.x,tg.c.z-c.z);if(d>3)this.walk(a,dt,S,[tg.c.x,tg.c.y,tg.c.z],.9);else this.face(a,tg.c.x,tg.c.z)}
    S.pt-=dt;if(S.pt>0)return;S.pt=.35;if(!tg)return;const dd=Math.hypot(tg.c.x-c.x,tg.c.z-c.z);
    if(S.cd.ring<=0&&dd<7){S.cd.ring=S.enr?6.5:9.5;this.ringStart(a,S);return}
    if(S.cd.lunge<=0&&dd>4&&dd<15&&Math.abs(tg.c.y-c.y)<1.2&&this.lungeStart(a,S,tg))return;
    if(S.cd.decoy<=0){S.cd.decoy=12;this.decoyStart(a,S);return}
    if(S.cd.lure<=0){S.cd.lure=S.enr?12:16;this.singStart(a,S,this.lureO(S,true));return}
    if(S.cd.call<=0&&this.audN()<this.audCap()){S.cd.call=24;this.callStart(a,S);return}
    if(S.perch<0&&Math.random()<.04&&!this.nearH(a,6)){S.hopT=rr(5,7);this.hopPerch(a,S,k=>MAP.ez.perch[k].y<5)}},
  // ---------- the patterns ----------
  // the song: she stands and sings; within its reach everybody is pulled to her (every page its own player, the host its bots)
  singStart(a,S,o){S.mode='sing';S.mt=o.T+1;S.song=Object.assign({t:0,d:0,tele:0},o);this.fx({k:'sing',i:a.id,T:r2(o.T),s:o.short?1:0});
    if(!S.enc)this.sayEvery('lLure',25)},
  songEnd(a,S,broken){const g=S.song;S.song=null;if(!g)return;if(!broken&&g.cresc)this.crescendo(a,g);S.mode='rec';S.mt=.6},
  breakSong(a,S){S.song=null;S.mode='stag';S.mt=1.5;this.fx({k:'brk',i:a.id});this.sayEvery('lBreak',10);if(!S.enc)this.grog(a,30)},
  crescendo(a,g){const c=a.c;this.fx({k:'cr',i:a.id});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);
      if(d<8&&Math.abs(h.c.y-c.y)<3&&(d<2||losClear(c.x,c.y+1.6,c.z,h.c.x,h.c.y+1.2,h.c.z))){hurtHuman(h,EPD(40),a,{});epFx(h,'kd',1);SCEN.pushHuman(h,(h.c.x-c.x)/(d||1)*7,3,(h.c.z-c.z)/(d||1)*7)}else if(d<g.R)epFx(h,'dz',1)}},
  // the bullhorn: a red strip toward the one it is aimed at, then the scream down it
  scrStart(a,S,t){const c=a.c,yw=lrYaw(t.c.x-c.x,t.c.z-c.z),T=1*EPTW(),y=floorY(t.c.x,t.c.y,t.c.z);S.scr={yw,y,L:22,w:5.5};S.mode='scrw';S.mt=T;a.yaw=yw;
    TELE.add({k:'r',x:c.x,y,z:c.z,yaw:yw,w:5.5,l:22,d:T});this.fx({k:'w',i:a.id,s:'scr'});if(!S.enc)this.sayOnce('lScream')},
  scream(a,S){const c=a.c,Q=S.scr;if(!Q)return;const fx=-Math.sin(Q.yw),fz=-Math.cos(Q.yw),rx=Math.cos(Q.yw),rz=-Math.sin(Q.yw);this.fx({k:'scr',i:a.id,x:r2(c.x),z:r2(c.z),y:r3(Q.yw)});
    const e=this.eye(a),ex=e.x,ey=e.y,ez=e.z;for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-c.x,dz=h.c.z-c.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;if(al<-.5||al>Q.L+.5||Math.abs(sd)>Q.w/2+.3||Math.abs(h.c.y-Q.y)>5)continue;
      if(!losClear(ex,ey,ez,h.c.x,h.c.y+1.3,h.c.z)&&!losClear(ex,ey,ez,h.c.x,h.c.y+.5,h.c.z))continue;
      hurtHuman(h,EPD(S.enc?20:30),a,{});epFx(h,'dz',S.enc?1:1.4);SCEN.pushHuman(h,fx*7,2,fz*7)}S.scr=null},
  // calling her audience: Listeners in through the hall's doors
  callStart(a,S){S.mode='call';S.mt=1.3;this.fx({k:'w',i:a.id,s:'call'});this.sayEvery('lCall',30)},
  callDone(a,S){const n=(S.ph===3?1:2)+Math.floor(SCEN.H.length/2)+(S.enr?1:0);let k=0;for(let i=0;i<n;i++)if(SCEN.spawn('listener'))k++;S.mode='rec';S.mt=.4},
  // the embrace: a laser on one of them, then they are pulled in; caught, held until 3 % of her health frees them
  hugStart(a,S,t){const T=1.2*EPTW();S.mode='hugw';S.mt=T;S.hug={v:t,st:'w',d:0,tick:.5};ELAS.add(a,t,T);this.fx({k:'w',i:a.id,s:'hug'});this.sayEvery('lHug',20)},
  hugEnd(a,S,freed){const H=S.hug;S.hug=null;ELAS.stop(a,true);const v=H&&H.v;if(v){v.grabT=0;v.rootT=0}this.fx({k:'ug',i:a.id,v:v?v.id:-1,f:freed?1:0});S.mode='rec';S.mt=freed?1.2:.5;if(freed)this.sayEvery('lHugX',12)},
  // lighting bars cut down across the stage (two of them, red strips first)
  batStart(a,S){const Z=[-50,-53.5,-57,-60.5,-64],pick=[];const z0=rpick(Z);pick.push(z0);let z1=rpick(Z);if(z1===z0)z1=Z[(Z.indexOf(z0)+2)%Z.length];pick.push(z1);const T=1.3*EPTW();
    for(const z of pick)TELE.add({k:'r',x:-14,y:1.4,z,yaw:-Math.PI/2,w:1.8,l:28,d:T});S.mode='batw';S.mt=T;S.bat=pick;this.fx({k:'w',i:a.id,s:'bat'});this.sayOnce('lBatten')},
  batDrop(a,S){for(const z of S.bat||[]){this.fx({k:'bat',z:r2(z)});for(const h of SCEN.H){if(!h.alive||Math.abs(h.c.z-z)>1.1||Math.abs(h.c.x)>14.5||h.c.y<1||h.c.y>3)continue;hurtHuman(h,EPD(34),a,{});epFx(h,'kd',1.1)}}S.bat=null;S.mode='rec';S.mt=.5},
  // the lunge (phase 3): a strip, then she drives down it
  lungeStart(a,S,t){const c=a.c,dx=t.c.x-c.x,dz=t.c.z-c.z,d=Math.hypot(dx,dz),yw=lrYaw(dx,dz),L=Math.min(16,d+3),fx=-Math.sin(yw),fz=-Math.cos(yw);
    if(!navStraight(c.x,c.y,c.z,c.x+fx*L,c.z+fz*L,.4))return false;S.cd.lunge=S.enr?3.2:4.5;S.mode='lgw';S.mt=.8*EPTW();S.lg={yw,L,d:0,hit:new Set()};a.yaw=yw;
    TELE.add({k:'r',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,yaw:yw,w:2,l:L,d:S.mt+.3});this.fx({k:'w',i:a.id,s:'lg'});this.sayOnce('lLunge');return true},
  // the shriek ring (phase 3): 7.5 m round her
  ringStart(a,S){const c=a.c,T=1.2*EPTW();S.mode='rngw';S.mt=T;TELE.add({k:'c',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,r:7.5,d:T,col:0xff4aa8});this.fx({k:'w',i:a.id,s:'rng'})},
  ring(a,S){const c=a.c;this.fx({k:'rng',i:a.id});for(const h of SCEN.H){if(!h.alive)continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d>7.5||Math.abs(h.c.y-c.y)>3||d>2&&!losClear(c.x,c.y+1.6,c.z,h.c.x,h.c.y+1.2,h.c.z))continue;
    hurtHuman(h,EPD(30),a,{});epFx(h,'dz',1.4);SCEN.pushHuman(h,(h.c.x-c.x)/(d||1)*8,2.5,(h.c.z-c.z)/(d||1)*8)}},
  // decoys: her hum from up to three places — the speakers still on, else spots on the floor
  decoyStart(a,S){const P=[];for(const D of SPK.L)if(D.alive)P.push(D.x,D.z+1.2);if(P.length<4){const f=rpick(MAP.ez.floorP);P.push(f[0],f[2])}while(P.length>6)P.splice((Math.random()*P.length/2|0)*2,2);
    S.mode='decoy';S.mt=.6;this.fx({k:'dec',p:P.map(v=>r2(v)),t:8});this.sayOnce('lDecoy')},
  // ---------- stagger, downs ----------
  grog(a,v){const S=a.lr;if(!S||S.enc||S.invT>0||S.mode==='down'||S.mode==='gone'||S.mode==='ret'||S.mode==='p2a'||S.mode==='p3a')return;S.grog+=v;
    if(S.grog>=S.grogMax){S.grog=0;S.grogN++;S.grogMax=100*Math.pow(1.25,S.grogN);this.down(a,6);EP.say('lDown')}},
  // (she goes down where she stands, a perch too; mid-leap she lands first)
  down(a,t){const S=a.lr;if(S.mode==='gone'||S.mode==='ret')return;ELAS.stop(a);if(S.song)S.song=null;if(S.hug)this.hugEnd(a,S,false);S.grog=0;this.fx({k:'dn',i:a.id});
    if(a.kin){const K=a.kin;K.done=()=>{S.mode='down';S.mt=t};S.mode='hop';S.mt=K.T+1;return}S.mode='down';S.mt=t},
  chandHit(a){const S=a.lr;if(!S||S.enc)return;damageActor(a,a.maxHp*.08,null,{he:1,chand:1,dir:[0,1,0]});this.grog(a,60);EP.say('lChand')},
  // ---------- phases ----------
  floorHit(a){const S=a.lr;if(S.enc){if(S.mode!=='ret'&&S.mode!=='gone')this.retreat(a);return}if(S.ph<3)this.toPhase(a,S.ph+1)},
  toPhase(a,n){const S=a.lr;S.ph=n;S.invT=3.5;S.grog=0;S.spot=null;S.song=null;if(S.hug)this.hugEnd(a,S,false);ELAS.stop(a);EP.bossPh=n;this.fx({k:'ph',n});EP.reviveAll();
    Object.assign(S.cd,{lure:5,scr:3,call:8,hug:6,spot:6,bat:5,lunge:2,ring:5,decoy:3});S.hops=0;
    if(n===2){S.mode='p2a';S.mt=1.4;a.kin=null;this.fx({k:'roar',i:a.id});EP.say('lP2');EP.later(2.6,()=>EP.say('lP2l'));return}
    S.mode='p3a';S.mt=2.2;a.kin=null;S.perch=-1;this.fx({k:'roar',i:a.id,b:1});EP.setDark(true);EP.say('lP3');EP.later(2.4,()=>EP.say('lP3l'))},
  // ---------- host: damage in (before the game applies it) ----------
  hit(t,dmg,src,o){const S=t.lr;if(S.invT>0||S.idle||S.mode==='gone'||S.mode==='ret')return 0;let mul=1;
    if(S.mode==='down')mul*=1.5;if(S.mode==='hugh')mul*=1.25;if(o.he&&!o.chand)this.grog(t,15);
    let out=dmg*mul;const em=(src&&src.team===TH?1+.1*G.moraleLvl:1)*(src&&src.wup&&o.w&&src.wup[o.w]?1+.1*src.wup[o.w]:1);
    if(S.song){S.song.d+=out*em;if(S.song.d>=t.maxHp*S.song.brk)this.breakSong(t,S)}
    if(S.hug&&S.mode==='hugh'){S.hug.d+=out*em;if(S.hug.d>=t.maxHp*.03)this.hugEnd(t,S,true)}
    const fl=t.maxHp*(S.enc?.85:S.ph===1?LR_PH[1]:S.ph===2?LR_PH[2]:0);if(fl>0&&t.hp-out*em<=fl){out=Math.max(0,(t.hp-fl)/em);this.floorHit(t)}
    S.dmgW+=out*em;return out},
  // ---------- host, every frame: the props' devices, the pull on the bots, the trickle ----------
  hostTick(dt){const b=EP.bossA(),S=b&&b.lr,run=EP.st===4&&EP.ph==='run';
    if(run){for(const D of SPK.L){if(!D.alive){D.p=0;continue}let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===100+D.i&&G.t>=(h.useBlk||0)&&Math.hypot(h.c.x-D.bx,h.c.z-D.bz)<1.7)n++;
        if(n){D.p+=dt*(n>1?1.25:1);if(D.p>=SPK.T)SPK.kill(D.i)}else D.p=Math.max(0,D.p-dt*1.5)}
      if(CHAND.st===0){const V=MAP.ez.chand.lever;let n=0;for(const h of SCEN.H)if(h.alive&&h.epUse===104&&G.t>=(h.useBlk||0)&&Math.hypot(h.c.x-V.x,h.c.z-V.z)<1.7)n++;
        if(n){CHAND.p+=dt;if(CHAND.p>=CHAND.T)CHAND.release()}else CHAND.p=Math.max(0,CHAND.p-dt*1.5)}}
    if(!S||S.idle)return;
    if(run)EP.trickle(dt,LR_MIX,[.2,.28,.3][S.ph-1]*(S.enr?1.6:1))},
  // every page: its own player pulled toward her while she sings (and the one she reaches for, harder); the host its bots
  pullTick(dt){const Bs=EP.bs();if(!Bs)return;const b=Bs.a;if(!b||!b.alive)return;const P=G.player;
    const pull=(h,R0,k)=>{if(!h.alive||h.team!==TH||h.grabT>0)return;const dx=b.c.x-h.c.x,dz=b.c.z-h.c.z,d=Math.hypot(dx,dz);if(d>R0||d<1.6)return;
      if(d>12){if(!(h.lrLosT>G.t)){h.lrLosT=G.t+.25;h.lrLos=losClear(b.c.x,b.c.y+1.9,b.c.z,h.c.x,h.c.y+1.4,h.c.z)}if(!h.lrLos)return}
      const f=k*(1-d/R0*.4)*(h.duck?.35:1);h.kvx=approach(h.kvx,dx/d*f,dt*14);h.kvz=approach(h.kvz,dz/d*f,dt*14)};
    if(Bs.f&1){const R0=Bs.lr||20,k=Bs.lk||2.6;if(P)pull(P,R0,k);if(!NET.cli)for(const h of SCEN.H)if(h.bot&&h!==P)pull(h,R0,k)}
    if(Bs.f&128&&Bs.hg>=0){const v=byIdAny(Bs.hg);if(v&&(v===P||!NET.cli&&v.bot))pull(v,60,4.8)}},
  // ---------- the hug and the song each frame (host) ----------
  step(a,dt,S){const c=a.c;
    switch(S.mode){
    case 'sing':{a.lrPose='sing';const g=S.song;if(!g){S.mode='rec';S.mt=.4;break}g.t+=dt;
      if(g.cresc&&!g.tele&&g.t>=g.T-1.2*EPTW()){g.tele=1;TELE.add({k:'c',x:c.x,y:floorY(c.x,c.y,c.z),z:c.z,r:8,d:Math.max(.3,g.T-g.t),col:0xff4aa8})}
      if(g.t>=g.T)this.songEnd(a,S,false);break}
    case 'stag':{a.lrPose='down';if(S.mt<=0){S.mode='';S.pt=.5}break}
    case 'scrw':{a.lrPose='scream';if(S.scr)a.yaw=S.scr.yw;if(S.mt<=0){this.scream(a,S);S.mode='rec';S.mt=.7}break}
    case 'call':{a.lrPose='call';if(S.mt<=0)this.callDone(a,S);break}
    case 'hugw':{a.lrPose='reach';const v=S.hug&&S.hug.v;if(!v||!v.alive){if(S.hug)this.hugEnd(a,S,false);else S.mode='';break}this.face(a,v.c.x,v.c.z);
      if(S.mt<=0){ELAS.stop(a,true);S.mode='hugp';S.mt=2.6;S.hug.st='p';this.fx({k:'w',i:a.id,s:'hugp'})}break}
    case 'hugp':{a.lrPose='reach';const v=S.hug&&S.hug.v;if(!v||!v.alive){this.hugEnd(a,S,false);break}this.face(a,v.c.x,v.c.z);const d=Math.hypot(v.c.x-c.x,v.c.z-c.z);
      if(d>2){const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),st=Math.min(1.6*dt,d-1.8);if(charFits(c,c.x+fx*st,c.y,c.z+fz*st)){c.x+=fx*st;c.z+=fz*st}}
      if(d<2.1&&Math.abs(v.c.y-c.y)<1.6&&!(v.grabT>0)){S.mode='hugh';S.mt=2.6;S.hug.st='h';S.hug.d=0;v.grabT=2.6;v.rootT=2.6;this.fx({k:'gr',i:a.id,v:v.id});hurtHuman(v,EPD(10),a,{claw:1});break}
      if(S.mt<=0)this.hugEnd(a,S,false);break}
    case 'hugh':{a.lrPose='hug';const v=S.hug&&S.hug.v;if(!v||!v.alive||v.team!==TH){this.hugEnd(a,S,false);break}v.grabT=Math.max(v.grabT,.3);v.rootT=Math.max(v.rootT,.3);
      const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),px=c.x+fx*.8,pz=c.z+fz*.8;if(Math.hypot(v.c.x-px,v.c.z-pz)>.3&&charFits(v.c,px,v.c.y,pz)&&!v.pup){v.c.x=px;v.c.z=pz}
      S.hug.tick-=dt;if(S.hug.tick<=0){S.hug.tick=.5;hurtHuman(v,EPD(10),a,{claw:1})}if(S.mt<=0)this.hugEnd(a,S,false);break}
    case 'spot':{a.lrPose='call';if(S.mt<=0){const t=S.tg&&S.tg.alive?S.tg:this.nearH(a,60);if(t){LRSPOT.set(t,8);EP.say('lSpot')}S.mode='rec';S.mt=.4}break}
    case 'batw':{a.lrPose='call';if(S.mt<=0)this.batDrop(a,S);break}
    case 'lgw':{a.lrPose='lunge';a.yaw=S.lg.yw;if(S.mt<=0){S.mode='lg';S.mt=1.6;this.fx({k:'w',i:a.id,s:'lg2'})}break}
    case 'lg':{a.lrPose='lunge';const Q=S.lg,fx=-Math.sin(Q.yw),fz=-Math.cos(Q.yw),v=15*(S.enr?1.15:1),st=Math.min(v*dt,Q.L-Q.d);a.yaw=Q.yw;
      if(st<=.01||S.mt<=0){S.mode='rec';S.mt=.7;break}const nx=c.x+fx*st,nz=c.z+fz*st;if(!charFits(c,nx,c.y,nz)){S.mode='rec';S.mt=1;break}c.x=nx;c.z=nz;Q.d+=st;
      for(const h of SCEN.H){if(!h.alive||Q.hit.has(h))continue;const d=Math.hypot(h.c.x-c.x,h.c.z-c.z);if(d<1.4&&Math.abs(h.c.y-c.y)<1.6){Q.hit.add(h);hurtHuman(h,EPD(38),a,{});epFx(h,'kd',1.1);SCEN.pushHuman(h,fx*8,3,fz*8)}}break}
    case 'rngw':{a.lrPose='call';if(S.mt<=0){this.ring(a,S);S.mode='rec';S.mt=.6}break}
    case 'decoy':{a.lrPose='';if(S.mt<=0){S.mode='';S.pt=.4}break}
    case 'down':{a.lrPose='down';if(S.mt<=0){S.mode='';S.pt=.6}break}
    case 'rec':{if(S.mt<=0){S.mode='';S.pt=.3}break}
    case 'p2a':{a.lrPose='call';if(S.mt<=0){S.mode='';this.hopPerch(a,S,k=>MAP.ez.perch[k].y>8)}break}
    // (the lights out: down from wherever she was, to hunt)
    case 'p3a':{a.lrPose='bow';if(S.mt<=0){S.mode='';S.pt=.6;S.cd.decoy=1.5;if(!this.onFloor(a))this.hopFloor(a,S)}break}
    case 'ret':{a.lrPose='';const M=MAP.ez.meet,h=M.hatch,d=Math.hypot(h[0]-c.x,h[2]-c.z);if(d>1.2&&S.mt>0){this.walk(a,dt,S,h,1.2);break}
      S.mode='gone';EP.meetEnd(a);break}
    case 'hop':{if(!a.kin&&S.mt<-1)S.mode='';break}
    default:{if(!a.kin&&S.mt<-1)S.mode=''}}},
  // ---------- bots ----------
  // the one with the duty: the winch when she is under the chandelier, else the nearest speaker still on that she is not by
  duty(){const now=G.t;if(this.dutyT>now)return this.dutyD;this.dutyT=now+1;this.dutyD=null;const b=EP.bossA();if(!b||!b.lr||EP.ph!=='run'||b.lr.enc)return null;const S=b.lr,C=MAP.ez.chand;
    const botNear=(x,z)=>{let best=null,bd=1e9;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-x,h.c.z-z);if(d<bd){bd=d;best=h}}return best};
    if(CHAND.st===0&&S.ph>=2&&Math.hypot(b.c.x-C.x,b.c.z-C.z)<8&&b.c.y<1.5){const h=botNear(C.lever.x,C.lever.z);if(h)return this.dutyD={x:C.lever.x+.6,z:C.lever.z,bot:h.id,k:4}}
    if(S.mode==='sing')return null;let best=null,bd=1e9;for(const D of SPK.L){if(!D.alive||Math.hypot(b.c.x-D.bx,b.c.z-D.bz)<9)continue;for(const h of SCEN.H){if(!h.alive||!h.bot)continue;const d=Math.hypot(h.c.x-D.bx,h.c.z-D.bz);if(d<bd){bd=d;best={x:D.bx,z:D.bz,bot:h.id,k:D.i}}}}
    // (no speaker to see to: one waits by the winch for her to come under the chandelier)
    if(!best&&CHAND.st===0&&S.ph>=2){const h=botNear(C.lever.x,C.lever.z);if(h)best={x:C.lever.x+.6,z:C.lever.z,bot:h.id,k:4}}
    return this.dutyD=best},
  botGoal(a,i){const b=EP.bossA();if(!b||!b.lr||EP.ph!=='run')return null;const S=b.lr;if(S.enc)return null;
    const D=this.duty();if(D&&D.bot===a.id)return [D.x,0,D.z,.3];
    const Z=EP.zone('D').box,bx=b.c.x,bz=b.c.z;
    if(S.ph===1){const L=MAP.ez.cover.filter(p=>p[1]<1).map(p=>[p,Math.abs(Math.hypot(p[0]-bx,p[2]-bz)-20)+hash2(Math.round(p[0]),Math.round(p[2]),a.id)*5]).sort((p,q)=>p[1]-q[1]);
      const p=L[i%Math.min(L.length,5)];return p?[p[0][0],p[0][1],p[0][2],1.2]:null}
    const an=i*1.9+Math.floor(G.t/6)*.8,r=S.ph===3?13:11;return [clamp(bx+Math.cos(an)*r,Z[0]+3,Z[2]-3),0,clamp(bz+Math.sin(an)*r,-41,Z[3]-3),2]},
  goalTag(b){const S=b.lr;if(!S)return '';const D=this.duty();return S.ph+(S.perch>=0?'p':'f')+(D?D.k+':'+D.bot:'')},
  botUse(a){const j=this.useNear(a);if(j<0)return -1;if(j===4){const b=EP.bossA(),C=MAP.ez.chand;return b&&Math.hypot(b.c.x-C.x,b.c.z-C.z)<5.5&&b.c.y<1.5?4:-1}const D=SPK.L[j];return D&&D.alive?j:-1},
  // out of her song's reach (crouched), out of the embrace's pull, out of a laser's line
  danger(a){if(!(EP.st===4||EP.meet&&EP.meet.st==='on'))return null;const b=EP.bossA(),S=b&&b.lr;if(!S)return null;const c=a.c,dx=c.x-b.c.x,dz=c.z-b.c.z,d=Math.hypot(dx,dz)||1;
    if(S.mode==='sing'&&S.song&&d<S.song.R)return {ax:dx/d,az:dz/d,duck:d<S.song.R*.8};
    if(S.hug&&S.hug.v===a&&(S.mode==='hugw'||S.mode==='hugp'))return {ax:dx/d,az:dz/d};
    return null},
  // ---------- the boss stage's own devices: the speakers' power boxes (0-3), the chandelier's winch (4) ----------
  useNear(h){if(!EP.on||EP.id!==7||EP.st!==4)return -1;for(const D of SPK.L)if(D.alive&&Math.hypot(h.c.x-D.bx,h.c.z-D.bz)<1.6&&h.c.y<1.4)return D.i;
    if(CHAND.st===0){const V=MAP.ez.chand.lever;if(Math.hypot(h.c.x-V.x,h.c.z-V.z)<1.6&&h.c.y<1.4)return 4}return -1},
  useInfo(i,L){if(i===4)return CHAND.st===0?{act:L?'let the chandelier go':'샹들리에 떨어뜨리기',p:CHAND.p/CHAND.T,x:0}:null;const D=SPK.L[i];if(!D)return null;
    if(!D.alive)return {act:L?'The speaker is off':'스피커 꺼짐',p:1,x:1};return {act:L?'cut the speaker\'s power':'스피커 전원 끊기',p:D.p/SPK.T,x:0}},
  // ---------- every page ----------
  update(dt){if(!EP.on||EP.id!==7)return;const Bs=EP.bs(),b=EP.bossA();
    if(NET.cli){const f=EP.bf;if(f){SPK.sync(f.sm,f.pw);if(f.pw&&f.pw.length>4)CHAND.p=(f.pw[4]|0)/10;if(f.cs!=null&&f.cs===0&&CHAND.st===2)CHAND.reset();if(f.sp!=null&&f.sp>=0&&(!LRSPOT.h||LRSPOT.h.id!==f.sp)){const h=byIdAny(f.sp);if(h)LRSPOT.set(h,6,true)}}}
    else this.hostTick(dt);
    this.pullTick(dt);SPK.update(dt);CHAND.update(dt);LRSPOT.update(dt);BATT.update(dt);LRDEC.update(dt);LRFX.update(dt,b,Bs);
    // the second gauge: the speakers still on
    this.g2T-=dt;if(this.g2T<=0){this.g2T=.5;const el=$('hEp');if(el){const L=LI(),n=(L?'SPEAKERS ':'스피커 ')+SPK.alive()+'/4',bb=el.querySelector('.eb .g2 b');if(bb&&bb.textContent!==n)bb.textContent=n}}},
  stageClear(kind){LRSPOT.clear();LRDEC.clear();LRFX.clear()},
  clear(){this.cur=null;this.said={};this.sayT={};this.dutyT=0;this.dutyD=null;LRSPOT.clear();LRDEC.clear();BATT.clear();LRFX.clear()},
  // the boss bar: gauges and what she is doing (flags: 1 singing, 2 down / staggered, 4 invulnerable, 8 enraged, 16 first meeting,
  // 32 shrouded in the dark, 64 holding someone, 128 pulling someone in, 256 perched, 1024 showing herself in the dark)
  bsOf(b){const S=b.lr,g=S.song,rev=S.mode==='sing'||S.mode==='scrw'||S.mode==='lgw'||S.mode==='lg'||S.mode==='rngw'||S.mode==='hugh'||S.mode==='hugp'||S.mode==='down'||S.mode==='stag'||S.mode==='call'||G.t-(b.lrHitT||-9)<.5;
    return {id:b.id,ph:S.ph,grog:S.grog,gmax:S.grogMax,
      f:(S.mode==='sing'&&g?1:0)|(S.mode==='down'||S.mode==='stag'?2:0)|(S.invT>0&&!S.enc?4:0)|(S.enr?8:0)|(S.enc?16:0)|(S.ph===3&&!S.enc?32:0)|(S.mode==='hugh'?64:0)|(S.mode==='hugp'?128:0)|(S.perch>=0?256:0)|(rev?1024:0),
      pose:Math.max(0,LR_POSE.indexOf(b.lrPose||'')),sk:g?g.t/g.T:0,lr:g?g.R:0,lk:g?g.k:0,sm:SPK.pack(),cs:CHAND.st,hg:S.hug&&S.hug.v?S.hug.v.id:-1,sp:LRSPOT.h?LRSPOT.h.id:-1,pw:SPK.L.map(D=>Math.round(D.p*10)).concat([Math.round(CHAND.p*10)])}},
  bsPack(b){if(!b.lr)return 0;const B=this.bsOf(b);return [B.id,B.ph,Math.round(B.grog),Math.round(B.gmax),B.f,B.pose,Math.round(B.sk*100),Math.round(B.lr*10),Math.round(B.lk*10),B.sm,B.cs,B.hg,B.sp,B.pw]},
  bsUnpack(B){return {id:B[0],ph:B[1],grog:B[2],gmax:B[3],f:B[4],pose:B[5],sk:(B[6]|0)/100,lr:(B[7]|0)/10,lk:(B[8]|0)/10,sm:B[9]|0,cs:B[10]|0,hg:B[11]==null?-1:B[11],sp:B[12]==null?-1:B[12],pw:Array.isArray(B[13])?B[13]:null,rt:performance.now()}},
  hud(B,L){const f=B.f;return {ss:f&4?(L?'INVULNERABLE':'무적'):f&2?(L?'DOWN!':'그로기!'):f&64?(L?'SHE HAS ONE OF US — SHOOT HER':'붙잡았다 — 쏴서 떼어 내!'):f&1?(L?'SINGING — break it!':'노래 중 — 끊어!'):f&8?(L?'ENRAGED':'광폭화'):f&32?(L?'IN THE DARK — listen':'암전 — 소리를 들어'):'',
    cls:f&8||f&1||f&64?'r':f&2?'y':'',sp:(f&16?(L?'FIRST CONTACT':'첫 조우'):(L?'PHASE ':'페이즈 ')+B.ph)+(f&256?(L?' · UP HIGH':' · 높은 곳'):''),
    g1:B.grog/(B.gmax||100),g2:f&16?null:SPK.alive()/4}},
  // the speakers' power boxes (hot while she sings), the chandelier when she is under it, the lit one, the one she is holding
  markers(list,L,P){const Bs=EP.bs();if(!Bs)return;const sing=!!(Bs.f&1);
    for(const D of SPK.L){if(!D.alive)continue;const d=Math.hypot(D.bx-P.c.x,D.bz-P.c.z);if(d<22||sing)list.push([D.bx,1.7,D.bz,sing?(L?'⚡ CUT THE SPEAKER':'⚡ 스피커 전원!'):(L?'speaker power':'스피커 전원'),sing?'p hot':'p'])}
    const C=MAP.ez.chand,b=Bs.a;if(CHAND.st===0&&b&&Math.hypot(b.c.x-C.x,b.c.z-C.z)<6&&b.c.y<1.5)list.push([C.lever.x,1.9,C.lever.z,L?'⚡ DROP THE CHANDELIER!':'⚡ 샹들리에를 떨어뜨려!','p hot'],[C.x,13.4,C.z,L?'⚡ SHOOT THE CHAIN':'⚡ 사슬을 쏴!','p hot']);
    const h=LRSPOT.h;if(h&&h.alive&&h!==P)list.push([h.c.x,h.c.y+2.5,h.c.z,'◎ '+(L?'SPOTLIT':'조명'),'b']);
    if(Bs.f&64&&Bs.hg>=0){const v=byIdAny(Bs.hg);if(v&&v!==P&&v.alive)list.push([v.c.x,v.c.y+2.2,v.c.z,L?'✚ SHOOT HER OFF':'✚ 쏴서 떼어 내!','r'])}},
  // ---------- every page: before the rig is posed — her pose, the shroud, her humming in the dark ----------
  pre(a,dt){this.cur=a;const S=a.lr;let pose=a.lrPose||'',down=0,f=0;
    if(!NET.cli&&S){const B=this.bsOf(a);f=B.f}else{const bf=EP.bf&&EP.bf.id===a.id?EP.bf:null;if(bf){pose=LR_POSE[bf.pose]||'';f=bf.f}}
    down=f&2?1:0;if(pose!==a.lrPose)a.lrPk=0;a.lrPose=pose;a.lrPk=Math.min(1,(a.lrPk||0)+dt*7);a.lrF=f;
    a.epDown=approach(a.epDown||0,a.alive?down:0,dt*3);a.epAimY=1.75;a.epPri=down?.3:.6;a.epHide=false;
    // in the dark: her humming as she moves (in 3D), heard on every page
    if(a.alive&&f&32){a.lrHumT=(a.lrHumT||0)-dt;if(a.lrHumT<=0){a.lrHumT=rr(1.4,1.9);AU.at('lrhum',a.c.x,a.c.y+1.9,a.c.z,{vol:.85,range:50,rate:rr(.96,1.04)})}}},
  // the rig's extras: 1.2× the size, the bullhorn (at her mouth to scream, else hanging at her hip), the shroud, the tints
  rigX(ch){const m=new THREE.Mesh(gunGeo('lrMega'),matGun());m.matrixAutoUpdate=false;m.frustumCulled=false;ch.grp.add(m);const o=ch.A.def.o;
    return {mega:m,mouth:new THREE.Matrix4().makeTranslation(0,o.headH*.26,-(o.headD/2+.025)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2)),
      hip:new THREE.Matrix4().makeTranslation(.21,-.08,.03).multiply(new THREE.Matrix4().makeRotationZ(.2))}},
  attach(a){const ch=a.ch;if(!ch||ch.key!=='z_lorelei')return;if(ch.grp.scale.x!==LR_S)ch.grp.scale.setScalar(LR_S);a.hitW=.34;a.headR=.2;
    const X=ch.lrX||(ch.lrX=this.rigX(ch)),vis=ch.grp.visible,P=a.lrPose||'',f=a.lrF||0;
    // shrouded in the dark: barely there unless she shows herself, is close, or a flashlight finds her
    let sh=0;if(f&32&&a.alive){sh=f&1024||G.t-(a.lrHitT||-9)<.5?0:.9;const Pl=G.player;if(sh&&Pl){const d=Math.hypot(Pl.c.x-a.c.x,Pl.c.z-a.c.z);if(d<7)sh=.55;else if(Pl.flash&&d<18){aimDir(Pl.yaw,Pl.pitch||0,_lrV);const dx=a.c.x-Pl.c.x,dy=a.c.y+1.4-(Pl.c.y+1.6),dz=a.c.z-Pl.c.z,l=Math.hypot(dx,dy,dz)||1;
      if((_lrV.x*dx+_lrV.y*dy+_lrV.z*dz)/l>.92)sh=.45}}}
    // (the bots go for the others first while she is hidden)
    if(sh>=.9)a.epPri=1.6;
    const sc=P==='scream'&&a.alive;X.mega.visible=vis&&sh<.8;X.mega.matrix.multiplyMatrices(sc?ch.M[2]:ch.M[0],sc?X.mouth:X.hip);X.mega.material.uniforms.uProbe.value.copy(ch.mat.uniforms.uProbe.value);
    if(a.alive&&a.frozen<=0){const T=ch.mat.uniforms.uTint.value;if(sh>0)T.set(.62,.66,.78,-sh);else if(f&4)T.set(1,.92,.98,.16+.08*Math.sin(G.t*30));else if(f&8)T.set(.9,.1,.4,.14+.06*Math.sin(G.t*9));else if(f&1)T.set(1,.4,.75,.08+.05*Math.sin(G.t*13))}},
  // ---------- every page: what the events show ----------
  fxApply(m){const a=m.i!=null?byIdAny(m.i):null,P=G.player,L=LI();
    switch(m.k){
    case 'w':if(a){const c=a.c;if(m.s==='scr')AU.at('rack',c.x,c.y+1.8,c.z,{vol:.6,range:50,rate:1.6});else if(m.s==='call'){AU.at('lrhum',c.x,c.y+2,c.z,{vol:1,range:90,rate:1.2});HUD.note(L?'She is calling her audience':'로렐라이가 청중을 부른다',2)}
      else if(m.s==='hug')AU.at('lrhum',c.x,c.y+2,c.z,{vol:.9,range:60,rate:.85});else if(m.s==='hugp')AU.at('lrsong',c.x,c.y+2,c.z,{vol:.7,range:50,rate:1.4});
      else if(m.s==='bat'){AU.at('lrchain',0,9.5,-56,{vol:1,range:80});HUD.note(L?'The lighting bars are coming down!':'조명대가 떨어진다!',1.8)}else if(m.s==='spot')AU.at('ui',c.x,c.y,c.z,{vol:.5,range:30,rate:.6});
      else if(m.s==='lg'||m.s==='lg2')AU.at('zroar',c.x,c.y+1.8,c.z,{vol:.9,range:70,rate:m.s==='lg'?1.35:1.15});else if(m.s==='rng')AU.at('lrhum',c.x,c.y+1.8,c.z,{vol:1,range:70,rate:1.5})}break;
    case 'sing':if(a){AU.at('lrsong',a.c.x,a.c.y+2,a.c.z,{vol:1,range:110,rate:m.s?1.3:1,rev:.6});if(!m.s&&P&&P.alive)HUD.note(L?'Her song — crouch and break it!':'노래 — 앉아서 버티고 끊어!',2)}break;
    case 'brk':if(a){AU.at('lrbreak',a.c.x,a.c.y+2,a.c.z,{vol:1,range:90});HUD.announce(L?'SONG BROKEN':'노래를 끊었다!','h',1.8);for(let i=0;i<18;i++)FX.spawn({x:a.c.x,y:a.c.y+2,z:a.c.z,vx:rr(-3,3),vy:rr(0,3),vz:rr(-3,3),life:rr(.3,.6),s0:.08,s1:.02,r:1,g:.5,b:.8,f:0,grav:6,add:1})}break;
    case 'cr':if(a){AU.at('lrcresc',a.c.x,a.c.y+2,a.c.z,{vol:1,range:120,occ:false});LRFX.ring(a.c.x,a.c.y+1.4,a.c.z,true);LRFX.ring(a.c.x,a.c.y+.6,a.c.z,true);
      if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<16){FX.shake=Math.max(FX.shake,.8-d/22);AU.shock(.6-d/30)}}}break;
    case 'scr':{const x=m.x/100,z=m.z/100,yw=m.y/1000,fx=-Math.sin(yw),fz=-Math.cos(yw);if(a)AU.at('lrscream',a.c.x,a.c.y+2,a.c.z,{vol:1,range:110});
      for(let i=0;i<40;i++){const s=rr(2,22),j=rr(-.25,.25);FX.spawn({x:x+fx*s*.2,y:(a?a.c.y:1)+rr(1.2,2.2),z:z+fz*s*.2,vx:(fx+j*fz)*s,vy:rr(-.4,.4),vz:(fz-j*fx)*s,life:rr(.3,.6),s0:.2,s1:.9,r:1,g:.7,b:.9,a:.35,f:2,drag:1.5,add:1})}
      if(P&&P.alive){const dx=P.c.x-x,dz=P.c.z-z,al=dx*fx+dz*fz,sd=Math.abs(dx*Math.cos(yw)-dz*Math.sin(yw));if(al>-1&&al<23&&sd<3.5)FX.shake=Math.max(FX.shake,.6)}break}
    case 'rng':if(a){AU.at('lrscream',a.c.x,a.c.y+2,a.c.z,{vol:1,range:110,rate:.85});LRFX.ring(a.c.x,a.c.y+1,a.c.z,true);for(let i=0;i<36;i++){const g=i/36*TAU;FX.spawn({x:a.c.x,y:a.c.y+1,z:a.c.z,vx:Math.cos(g)*12,vy:rr(-.3,.3),vz:Math.sin(g)*12,life:.7,s0:.3,s1:1,r:1,g:.6,b:.85,a:.35,f:2,drag:1.2,add:1})}}break;
    case 'dn':if(a){AU.at('zpain',a.c.x,a.c.y+2,a.c.z,{vol:1,range:70,rate:1.2});HUD.note(L?'Down — ×1.5 damage':'그로기 — 피해 1.5배',2.5)}break;
    case 'fz':if(a)for(let i=0;i<20;i++)FX.spawn({x:a.c.x+rr(-.5,.5),y:a.c.y+rr(.4,2.4),z:a.c.z+rr(-.5,.5),vy:rr(-.3,.4),life:rr(.5,1),s0:.12,s1:.4,r:.75,g:.92,b:1,a:.6,f:10,add:1});break;
    case 'gr':{const v=byIdAny(m.v);if(v&&v===P){P.grabT=2.6;P.rootT=Math.max(P.rootT||0,2.6);FX.shake=Math.max(FX.shake,.5);AU.play('hurt',{vol:.7});HUD.note(L?'She has you! A teammate has to shoot her':'붙잡혔다! 동료가 로렐라이를 쏴야 풀려요',2.6)}
      if(a)AU.at('lrhum',a.c.x,a.c.y+2,a.c.z,{vol:1,range:50,rate:.7});if(!EP.grabSaid&&!NET.cli){EP.grabSaid=1;EP.say('grab')}break}
    case 'ug':{const v=byIdAny(m.v);if(v){v.grabT=0;if(v===P||!v.pup)v.rootT=Math.min(v.rootT||0,.05)}if(a&&m.f)AU.at('zpain',a.c.x,a.c.y+2,a.c.z,{vol:1,range:50,rate:1.3});break}
    case 'spot':if(NET.cli){const h=byIdAny(m.v);if(h)LRSPOT.set(h,m.t/100,true)}AU.play('ui',{vol:.4,rate:.5});break;
    case 'bat':BATT.drop(m.z/100);break;
    case 'dec':LRDEC.start(m.p||[],m.t||8);break;
    case 'spk':if(NET.cli)SPK.kill(m.n,true);break;
    case 'chf':if(NET.cli)CHAND.release(true);HUD.announce(L?'THE CHANDELIER IS FALLING':'샹들리에가 떨어진다!','z',2);break;
    case 'land':SCEN.slamFx(m.x/100,m.y/100,m.z/100);AU.at('land',m.x/100,m.y/100,m.z/100,{vol:1,range:60,rate:.85});break;
    case 'hop':if(a)AU.at('zleap',a.c.x,a.c.y+1.5,a.c.z,{vol:.9,range:60,rate:1.1});break;
    case 'roar':if(a){AU.at('lrscream',a.c.x,a.c.y+2,a.c.z,{vol:1,range:120,rate:m.b?.7:.85});if(P&&P.alive){const d=Math.hypot(P.c.x-a.c.x,P.c.z-a.c.z);if(d<18)FX.shake=Math.max(FX.shake,.6-d/32)}}break;
    case 'ph':HUD.announce(m.n===2?(L?'INTERMISSION':'막간'):(L?'FINALE — THE LIGHTS GO OUT':'피날레 — 불이 꺼진다'),'z',3);AU.play('stingZ',{vol:.7});if(m.n===3){LRDEC.clear()}break;
    case 'enr':HUD.announce(L?'LORELEI IS ENRAGED':'로렐라이 광폭화','z',2.5);break;
    case 'la':if(a){AU.at('lsalert',a.c.x,a.c.y+1.6,a.c.z,{vol:.9,range:30});if(typeof SNDV!=='undefined')SNDV.ping(a,'shot',30)}break;
    case 'meet':if(a)AU.at('lrsong',a.c.x,a.c.y+2,a.c.z,{vol:.7,range:80,rate:.9});break}}};
EPZ.lorelei={hp:()=>LORELEI.hpFor(),init:a=>LORELEI.init(a,LORELEI.encNext),ai:(a,dt)=>LORELEI.ai(a,dt),
  hit:(t,dmg,src,o)=>t.lr?LORELEI.hit(t,dmg,src,o):dmg,
  // (the shooter's own page) a hit shows her in the dark for a moment
  spark(t,o){t.lrHitT=G.t},
  claw(a,t,heavy){aimDir(a.yaw,0,_dv);const kb=heavy?6:4;if(t.isPlayer||!t.pup){t.kvx+=_dv.x*kb;t.kvz+=_dv.z*kb}else SCEN.pushHuman(t,_dv.x*kb,1.5,_dv.z*kb);a.scHit=G.t;hurtHuman(t,EPD(heavy?36:26),a,{claw:1});return true},
  pre:(a,dt)=>LORELEI.pre(a,dt),attach:a=>LORELEI.attach(a),
  die(t){ELAS.stop(t,true);t.kin=null;if(t.lr&&t.lr.hug){const v=t.lr.hug.v;if(v){v.grabT=0;v.rootT=0}t.lr.hug=null}if(t.lr&&!t.lr.enc&&!NET.cli)EP.say('lDie')},
  gone(a){ELAS.stop(a,true);a.kin=null;if(a.lr){if(a.lr.hug&&a.lr.hug.v){a.lr.hug.v.grabT=0;a.lr.hug.v.rootT=0}a.lr.hug=null;a.lr.mode='gone'}}};
Object.assign(ZGAIT,{lorelei:{stride:1.1,knee:1.05,runK:1,bob:.8,twist:.8,sway:1.3},listener:{stride:.85,knee:.8,runK:.7,bob:1.1,twist:.9,sway:1.4}});
Object.assign(JAW0,{lorelei:.22,listener:.14});

// ---------- the rig poses (every page): LORELEI's upper body for each thing she does (eased from one to the next): standing, singing,
// screaming through the bullhorn, calling, reaching, holding, lunging, perched, bowing, down; the Listener listening — arms down,
// head on one side, turning — until it hears something (the zombie gait and its claws are the base pose's) ----------
{const pz=poseZombie;
  // [spine pitch (+ back), head pitch (+ up), L shoulder fwd, L shoulder out (−), L elbow, R shoulder fwd, R shoulder out (+), R elbow, jaw]
  const PT={idle:[-.06,.08,.16,-.2,.42,.14,.2,.4,.2],sing:[.24,.5,.35,-2,.35,.35,2,.35,1.05],call:[.25,.5,1.15,-.85,.7,1.15,.85,.7,1.2],scream:[-.22,-.08,-.25,-.55,.4,1.25,.32,2.05,1.3],
    reach:[-.15,.05,1.5,-.05,.08,1.5,.05,.08,.9],hug:[-.3,-.15,1.3,.45,.9,1.3,-.45,.9,.7],lunge:[-.7,.4,-.5,-.3,.6,-.5,.3,.6,1.2],perch:[-.55,.45,.45,-.2,1,.45,.2,1,.4],
    bow:[-1,-.3,.1,-.6,.3,.1,.6,.3,.5],down:[-.78,.3,.16,-.24,.4,.24,.26,.32,.85]};
  const ease=(a,key,t,rate)=>{const dt=clamp(t-(a[key]==null?t:a[key]),0,.1);a[key]=t;return 1-Math.exp(-dt*rate)};
  poseZombie=function(ch,st){
  if(st.zclass==='listener'&&!(st.dead>0)){pz(ch,st);const a=LISTEN.cur;if(!a||a.ch!==ch)return;const R=ch.R,t=st.t||0,sd=st.seed||0;
    const k=ease(a,'lsT0',t,5),want=!(a.lsSpd>2.4)&&!(st.atk>0)&&!(st.down>0)?1:0;a.lsW=(a.lsW||0)+(want-(a.lsW||0))*k;const w=a.lsW;if(w<.02||st.atk>0||st.down>0)return;
    // (listening: arms hanging, the bandaged head tipped to one side and turning slowly to follow a sound; hunting: the reach)
    const s=sd%2?1:-1,L=(h,i)=>h+(i-h)*w;
    setE(R[3],L(1.02+Math.sin(t*1.7+sd)*.1,.16+Math.sin(t*1.1+sd)*.05),0,L(-.1,-.14));setE(R[4],L(.3,.42),0,0);setE(R[5],L(.95+Math.sin(t*1.9+sd*2)*.1,.1+Math.sin(t*1.3+sd)*.05),0,L(.12,.14));setE(R[6],L(.25,.36),0,0);
    setE(R[2],L(.15,-.08+Math.sin(t*.5+sd)*.07),L(0,Math.sin(t*.35+sd*2)*.55),L(0,s*(.4+Math.sin(t*.8+sd)*.1)));return}
  if(st.zclass!=='lorelei'||st.dead>0||!LORELEI.cur||LORELEI.cur.ch!==ch){pz(ch,st);return}
  const a=LORELEI.cur,R=ch.R,t=st.t||0;pz(ch,st);if(st.atk>0){a.lrT0=t;return}
  const P=st.down>.3?'down':a.lrPose||'idle',q=PT[P]||PT.idle,E=a.lrE||(a.lrE=q.slice()),k=ease(a,'lrT0',t,9);for(let i=0;i<9;i++)E[i]+=(q[i]-E[i])*k;
  const vib=P==='sing'?Math.sin(t*11)*.08:P==='call'||P==='scream'?Math.sin(t*37)*.06:0,sw=P==='idle'?Math.sin(t*1.1+(st.seed||0))*.05:0;
  setE(R[1],E[0],sw,Math.sin(t*.9)*.03);setE(R[2],E[1]+vib*.3,P==='idle'?Math.sin(t*.4)*.3:0,P==='sing'?Math.sin(t*1.3)*.12:0);
  setE(R[3],E[2]+sw*.5,0,E[3]);setE(R[4],Math.max(-.05,E[4]),0,0);setE(R[5],E[5]-sw*.5,0,E[6]);setE(R[6],Math.max(-.05,E[7]),0,0);setE(R[11],-clamp(E[8]+vib,0,1.45),0,0)}}

// ---------- chapter 7 「로렐라이」: the Hanseol Arts Center shelter, beyond Containment Line 1 (season 2) ----------
//   1 the snowed-in square — three waves; the Listeners first show up; then the chained doors slide open
//   2 the shelter foyer — 'terms': the team traces the broadcast from three points in turn (20 s each, nobody infected in the ring)
//   3 backstage (no power) — 'act': the three dimmer racks (9 s each, any order); LORELEI's first appearance on the scene dock's
//     catwalk (she leaves by the fly hatch once she has lost 15 %, or when the power is back)
//   4 the main hall — the boss fight, three phases (the curtain rises at the start of each). A wipe replays the phase it reached
CHAP[7]={id:7,k:'lorelei',map:'ep7',code:'RT1-03',season:2,n:['로렐라이','LORELEI'],t:['좀비 시나리오: 로렐라이','Zombie Scenario: LORELEI'],
  file:[['1차 회수팀 협상 요원 RT1-03. 대피 방송을 하던 목소리로 노래를 불러 사람을 끌어당긴다','RT-1\'s negotiator, RT1-03: the voice from the evacuation broadcasts now sings, and it pulls you in'],
    ['노래는 집중 사격으로 끊어 · 앉으면 덜 끌려간다 · 스피커 · 샹들리에 · 암전엔 소리로 찾아라','Break her song with focused fire · crouch to resist · the speakers · the chandelier · in the dark, find her by ear']],
  cards:{place:['봉쇄선 밖 · 한설 아트센터','BEYOND THE LINE · HANSEOL ARTS CENTER'],who:['1차 회수팀 협상 요원','RT-1 NEGOTIATOR'],line:['혼자 남겨지는 게 무서웠다 — 그래서 모두를 불러 모은다','She could not bear to be left alone — so she calls everyone to her']},
  boss:LORELEI,voice2:['로렐라이','LORELEI'],voice3:['대피 방송','EVACUATION BROADCAST'],
  // gates: A the chained glass doors, B the fire door to backstage, C the house's side doors, D the main curtain (it rises at each go)
  gates:['gA','gB','gC','gD'],gateDur:{gA:1.4,gB:1,gC:1.2,gD:3.2},pow0:1,powLo:[.34,.05],
  strobes:[[-22,5,0],[22,5,0],[-22,5,-42],[22,5,-42]],
  stages:[null,
    {z:'A',k:'waves',n:['눈 덮인 광장','The snowed-in square'],on:['광장을 지켜라','Hold the square'],prep:18,clr:'s1c',intro:{zc:'listener',say:'listen',at:5},doorN:['정문','MAIN DOORS'],
      wave:w=>[['rager',50],['runner',22],['listener',w>=2?18:14],['bomber',w>=2?6:0],['brute',w>=3?6:0],['scream',w>=2?5:0]]},
    {z:'B',k:'terms',n:['대피소 로비','The shelter foyer'],on:['방송 역탐지','Trace the broadcast'],ring:'dfind',t:20,say:'s2',clr:'s2c',done1:'df',doorN:['방화문','FIRE DOOR'],
      mix:[['rager',42],['runner',24],['listener',24],['scream',6],['bomber',4]]},
    {z:'C',k:'act',n:['무대 뒤','Backstage'],on:['조광기 전원 올리기','Get the dimmers back on'],dev:'dim',say:'s3',clr:'s3c',devSay:(i,left)=>left===2?'d1':'d2',meet:{at:9,cap:.45},cap:.7,doorN:['객석 옆문','HOUSE DOORS'],
      mix:[['listener',36],['rager',32],['runner',24],['scream',8]]},
    {z:'D',k:'boss',n:['대공연장','The main hall'],on:['로렐라이를 쓰러뜨려라','Bring LORELEI down'],say:'s4',go:'b0',prepPt:[18,0,-29,2]}],
  // (the curtain stays down through every prep: bossGo raises it and shuts the side doors behind the team)
  stageGates(n,kind){const b=k=>EP.bit(k);let m=0;if(n>=2)m|=b('gA');if(n>=3)m|=b('gB');if(n===4&&kind!=='phase')m|=b('gC');return m},
  setup(){SPK.build();CHAND.build();LORELEI.said={};LORELEI.sayT={};this.paT=4;this.paN=0},
  stageStart(n,kind){SPK.build();CHAND.build();LRSPOT.clear();LRDEC.clear();BATT.clear();LRFX.clear();
    if(n===3&&EP.devLeft()>0){EP.setPow(0);const L=LI(),P=G.player;if(P&&P.alive&&P.team===TH&&!P.flash){P.flash=true;AU.play('ui',{vol:.35,rate:.6})}for(const h of SCEN.H)if(h.bot)h.flash=true;
      EP.later(.6,()=>HUD.note(L?'No power backstage — your flashlight is on (F)':'무대 뒤는 전기가 없다 — 손전등을 켰어요 (F)',4))}
    if(n===4){if(EP.pow!==1)EP.setPow(1);if(kind!=='phase'){SPK.reset();CHAND.reset()}}},
  stageDone(n){if(n===3)EP.setPow(1)},
  bossGo(){EP.setGates((EP.gm|EP.bit('gD'))&~EP.bit('gC'));return []},
  boxShot(eh,a,W){if(eh.k!=='spk'&&eh.k!=='chain')return;if(EP.st!==4)return;const dmg=(W&&W.dmg||30)*(W&&W.pellets?.6:1);
    if(NET.cli){if(!AU.throttle('elrs'+eh.k+eh.i,110))netToHost({t:'elrs',k:eh.k,i:eh.i|0,d:Math.round(dmg)});return}
    if(eh.k==='spk')SPK.hit(eh.i,dmg);else CHAND.hit(dmg)},
  clear(){LORELEI.clear();SPK.clear();CHAND.clear()},
  // every page, every frame: the broadcast from the square's loudspeakers (stages 1-2), the foyer tree's lights
  update(dt){if(EP.st<=2&&EP.ph!=='over'){this.paT=(this.paT==null?4:this.paT)-dt;if(this.paT<=0){this.paT=rr(10,13);const L=EP.st===1?[[-22,7,46],[22,7,46],[-14,7,80],[14,7,80]]:[[0,1.2,8]];
        L.forEach((p,i)=>AU.at('lrpa',p[0],p[1],p[2],{vol:EP.st===1?.55:.7,range:EP.st===1?60:45,delay:i*.09}));if(EP.st===1&&(this.paN=(this.paN|0)+1)%3===1)EP.radio('pa')}}
    for(const g of E7GLOW.L){const on=g.k<0?1:Math.sin(G.t*(1.3+g.k*.4)+g.ph)>-.3;g.sp.material.opacity=on?1:.12;if(g.k<0)g.sp.scale.setScalar(g.s*(.9+.1*Math.sin(G.t*2)))}},
  endFx(r){if(r.win)this.ending()},
  // after the clear: the roster in her vest; a card for the season so far
  ending(){EP.later(3,()=>EP.radio('end0'));EP.later(7,()=>EP.radio('end1'));EP.later(9.6,()=>this.seasonCard())},
  seasonCard(){let el=$('epCard');if(!el){el=document.createElement('div');el.id='epCard';$('app').appendChild(el)}const L=LI();
    el.innerHTML=`<div class="ec s1"><div class="tx"><small>${L?'ZOMBIE SCENARIO · SEASON 2':'좀비 시나리오 · 시즌 2'}</small><h1>${L?'CHAPTER 7 CLEAR':'7챕터 클리어'}</h1><p>${L?'Three of RT-1 are still out there — north, at the airfield.':'1차 회수팀은 아직 셋 남았다 — 북쪽 비행장.'}</p><b>${L?'NEXT — COMING SOON':'다음 이야기 — 준비 중'}</b></div></div>`;
    el.className='on';clearTimeout(EP.cardT);EP.cardT=setTimeout(()=>{el.className=''},6500)},
  radio:{
    start:['2차 회수팀, 봉쇄선 밖 한설시다. "북쪽으로 와라" — 그 방송은 저 아트센터 확성기에서 나온다. 대피소였던 곳이다.','RT-2, this is Hanseol, beyond the line. "Come north" — that broadcast is coming from the arts center\'s loudspeakers. It was a shelter.',0],
    pa:['…생존자 여러분, 북쪽으로 오십시오. 우리는 기다리고 있습니다…','…Survivors, come north. We are waiting for you…',3],
    w1:['광장으로 몰려온다!','They are pouring into the square!',0],
    listen:['저놈들, 눈을 가리고 있어! 소리로 쫓아온다 — 총 쏘면 몰려오고, 앉아서 걸으면 못 찾아.','Those ones have their eyes bound! They hunt by sound — shoot and they come running; crouch-walk and they cannot find you.',1],
    s1c:['광장 확보. 정문 쇠사슬 끊는다.','Square clear. Cutting the chain on the doors.',0],
    s2:['대피소 로비다. 방송이 어디서 나오는지 역탐지한다 — 세 곳에 차례로 서서 20초씩 버텨.','The shelter foyer. We trace the broadcast — stand at three points in turn, twenty seconds each.',0],
    df:['좋아, 신호 잡았다. 다음 지점.','Good, got a fix. Next point.',0],
    s2c:['신호 위치 확인 — 대공연장 무대다. 객석 문은 안에서 막혀 있어. 무대 뒤로 돌아가.','Fixed — the main hall\'s stage. The house doors are blocked from inside. Go round through backstage.',0],
    s3:['무대 뒤는 전원이 나갔다. 조광기 세 곳을 올려 — 소리가 크니까 놈들이 몰려올 거야.','No power backstage. Get the three dimmer racks back on — they are loud, they will come.',0],
    d1:['하나 켰다. 두 개 남았다.','One on. Two to go.',0],
    d2:['마지막 하나!','Last one!',0],
    enc:['위다! 작업 통로에 누가 있어 — 노래를 부른다…','Up there! Someone on the catwalk — singing…',1],
    enc2:['…1차 회수팀 협상 요원 RT1-03, 로렐라이. 대피 방송을 하던 그 목소리야.','…RT-1\'s negotiator, RT1-03. LORELEI. That is the voice from the evacuation broadcasts.',0],
    lMeet:['…왔구나. 다들 기다렸어. 이리 와.','…You came. Everyone has been waiting. Come here.',2],
    lRet:['위로 사라졌다 — 무대 쪽이다.','She is gone up — towards the stage.',1],
    s3c:['전원 복구. 객석 옆문 연다. 막이 내려와 있다…','Power is back. Opening the side doors to the house. The curtain is down…',0],
    s4:['객석에 스피커가 네 개 — 전원을 끊거나 부숴. 노래가 멀리 못 간다. 천장엔 샹들리에가 있다.','Four speakers in the house — cut them or smash them and her song will not carry. And there is the chandelier.',0],
    b0:['…공연을 시작할게. 아무도 나가지 마.','…The performance begins. Nobody leaves.',2],
    lLure:['노래다 — 끌려간다! 앉아서 버티고, 집중 사격으로 끊어!','Her song — it is pulling us in! Crouch and hold, and break it with focused fire!',1],
    lBreak:['노래를 끊었다!','We broke her song!',1],
    lScream:['비명이다! 빨간 띠에서 비켜!','Scream! Out of the red strip!',1],
    lSpk:['스피커 하나 끝!','One speaker down!',1],
    lSpkAll:['스피커 전부 꺼졌다 — 노래가 멀리 못 간다!','Every speaker is out — her song cannot carry now!',1],
    lCall:['청중을 부른다 — 문 쪽에서 들어온다!','She is calling her audience — they are coming through the doors!',1],
    lP2:['막간이다 — 위로 올라갔어! 작업 통로하고 발코니를 봐!','Intermission — she went up! Watch the fly galleries and the balconies!',1],
    lP2l:['…아직이야. 앙코르가 남았어.','…Not yet. There is still the encore.',2],
    lSpot:['조명이 한 명을 비춘다 — 그 사람한테 다 몰려온다!','The spotlight is on one of us — everything will go for them!',1],
    lHug:['한 명을 끌어당긴다 — 붙잡히면 쏴서 떼어 내!','She is pulling one of us in — if she grabs you, shoot her off!',1],
    lHugX:['…가지 마. 혼자 두지 마.','…Do not go. Do not leave me alone.',2],
    lBatten:['조명대가 떨어진다!','The lighting bars are coming down!',1],
    lChand:['샹들리에 밑에 깔렸다!','The chandelier came down on her!',1],
    lChandX:['샹들리에가 떨어진다 — 피해!','The chandelier is coming down — get clear!',1],
    lP3:['정전이다… 안 보여! 발소리를 들어!','Blackout… I cannot see her! Listen for her footsteps!',1],
    lP3l:['…불을 끄면, 다들 내 노래만 듣게 돼.','…With the lights out, all you hear is my song.',2],
    lDecoy:['소리가 여러 군데서 난다 — 진짜는 발소리가 나는 쪽이야!','Her voice is coming from everywhere — the real one has footsteps!',1],
    lLunge:['덮친다!','She is lunging!',1],
    lDown:['쓰러졌다! 집중 사격!','She is down! Pour it on!',1],
    lEnr:['시간 끌면 안 돼 — 점점 거세진다!','We cannot drag this out — she is getting worse!',0],
    lDie:['…이제… 혼자가 아니야…','…Now… I am not alone…',2],
    dead:['로렐라이 무력화. 1차 회수팀 협상 요원, 확인했다.','LORELEI is down. RT-1\'s negotiator, confirmed.',0],
    clear:['…방송이 멈췄다. 조끼 주머니에 1차 팀 명단이 있어. 01, 05, 07에 줄이 그어져 있다 — 우리가 쓰러뜨린 셋. 02, 04, 06은 그대로다.','…The broadcast has stopped. There is an RT-1 roster in her vest. 01, 05 and 07 are crossed out — the three we put down. 02, 04 and 06 are not.',0],
    end0:['명단 뒤에 적혀 있다: "나머지는 북쪽 비행장으로 갔다. 나는 남아서 기다린다."','On the back: "The others went north, to the airfield. I stay and wait."',0],
    end1:['비행장… 1차 팀이 아직 셋 남았다는 거군.','The airfield… so three of RT-1 are still out there.',1]}};

// ---------- hooks ----------
(function(){
  Object.assign(CLIH,{elr(L,m){LORELEI.fxApply(m)}});
  Object.assign(HOSTH,{elrs(L,m){const a=actorOfKey(L.key);if(!(EP.on&&EP.id===7&&EP.st===4&&a&&a.alive&&a.team===TH)||AU.throttle('elrs'+a.id,60))return;const d=clamp(m.d|0,0,400);if(m.k==='spk')SPK.hit(clamp(m.i|0,0,3),d);else if(m.k==='chain')CHAND.hit(d)}});
})();

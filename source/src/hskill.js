'use strict';
// ============ Human active skills (CSO 인간 전용 액티브): 5 전력질주 (Sprint) · 6 확인사살 (Deadshot) ============
// A living human can use each one once a round (once a stage in the scenario; on the shooting range they come back when they wear off).
// Sprint: 10 s at ×1.45 the base run speed whatever the gun weighs (crouch, scope, walk and the hammer stance still slow you),
// then 5 s out of breath at ×0.4. Deadshot: for 5 s every bullet, bolt or disc that hits a zombie counts as a headshot
// (head damage multiplier, headshot kill rules: in Mutation a non-host killed that way stays down). Both reset at round / stage
// start and are cleared when a human turns.
// Hooks in shared files: maxSpeed (game.js) calls hskSpeed; shotTrace (weapons.js) and the bolt / disc (nyw.js) call hsForce;
// keys 5 / 6 (main.js) set cmd.hsk. Everything else wraps from here.
// Multiplayer (host-authoritative): a client asks {t:'hsk',k:'sp'|'ds'}; the host checks it (alive human, prep / fight, not used)
// and tells everyone with the 'hsk' event {i,k}. Movement is simulated by its owner, so a client's sprint runs on its own page.
// A hit that the Deadshot turned into a headshot carries HSK.BIT in the client's hit claim; the host honours it only inside that
// player's window (plus the link's round trip) and otherwise turns it back into a body hit. NET_VER gets '-hsk1'.
const HSK={SP:10,EX:5,DS:5,SPM:1.45,EXM:.4,BIT:256,fovAdd:0,fovK:0,botT:-9,pant:[],el:null,shown:null,
  ICON:{sp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="15.5" cy="3.8" r="2.1" fill="currentColor" stroke="none"/><path d="M14 7.6l-2.8 5.6 3.9 2.9-1 5.2M11.2 13.2l-3 3.4H4.6M13.4 8.4l3.4 2.7 2.7-1.5M13.4 8.4l-4 .8-2 2.6M1.5 9.2h3.8M1 12.6h3.2"/></svg>',
    ds:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7.4"/><path d="M12 1.6v5M12 17.4v5M1.6 12h5M17.4 12h5"/><circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none"/></svg>'},
  of(a){return a.hsk||(a.hsk={sp:0,ex:0,ds:0,uS:0,uD:0,off:-99,pend:0})},
  // round / stage start, infection: everything off and unused again
  clear(a){if(a.hsk)a.hsk=null;if(a===G.player)this.stopPant()},
  // a key / button / bot asked for skill k on this page
  use(a,k){if(!a||!a.alive||a.team!==TH||(k!=='sp'&&k!=='ds'))return false;if(G.st!=='prep'&&G.st!=='fight')return false;const h=this.of(a),me=a===G.player;
    if(k==='sp'?h.uS:h.uD){if(me){const sc=G.mode==='scen';HUD.note(LI()?'Already used — it comes back next '+(sc?'stage':'round'):'이미 사용했어요 — 다음 '+(sc?'스테이지':'라운드')+'에 다시 쓸 수 있어요',1.4);AU.play('dry',{vol:.45})}return false}
    if(NET.cli){if(!me||h.pend>G.t)return false;h.pend=G.t+1.2;netToHost({t:'hsk',k});return true}
    this.start(a,k);if(NET.host)netEv('hsk',{i:a.id,k});return true},
  // the skill goes on (every page runs this: the host / solo from use(), clients from the host's event)
  start(a,k){const h=this.of(a),c=a.c,me=a===G.player,L=LI();h.pend=0;
    if(k==='sp'){h.uS=1;h.sp=this.SP;h.ex=0;
      if(me){AU.play('hsprint',{vol:.85});HUD.note(L?'SPRINT — 10 s':'전력질주 — 10초',1.6)}else AU.at('hsprint',c.x,c.y+1.4,c.z,{vol:.75,range:30});
      for(let i=0;i<10;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+.08,z:c.z+rr(-.3,.3),vx:rr(-1.2,1.2),vy:rr(.2,.8),vz:rr(-1.2,1.2),life:rr(.4,.7),s0:.12,s1:.45,r:.55,g:.52,b:.48,a:.35,f:6,drag:2.5,lit:1})}
    else{h.uD=1;h.ds=this.DS;h.off=-99;
      if(me){AU.play('hdshot',{vol:.9});HUD.note(L?'DEADSHOT — every hit is a headshot for 5 s':'확인사살 — 5초간 맞히는 탄은 전부 헤드샷',1.8)}else AU.at('hdshot',c.x,c.y+1.5,c.z,{vol:.8,range:35});
      if(!me){FX.spawn({x:a.head.x,y:a.head.y,z:a.head.z,life:.35,s0:.15,s1:.9,r:1,g:.16,b:.1,a:.8,f:14,add:1});DL.add(a.head.x,a.head.y,a.head.z,'#ff3020',3,1.2,.35)}}},
  // sprint over: out of breath
  tired(a){const c=a.c;if(a===G.player){this.stopPant();const v1=AU.play('hpant',{vol:.75}),v2=AU.play('hpant',{vol:.6,delay:2.45});this.pant=[v1,v2];HUD.note(LI()?'Out of breath — slow for 5 s':'숨이 차요 — 5초 동안 느려져요',1.8)}
    else AU.at('hpant',c.x,c.y+1.5,c.z,{vol:.55,range:16})},
  stopPant(){const c=AU.ctx;if(c)for(const v of this.pant){if(!v)continue;try{v.g.gain.setTargetAtTime(0,c.currentTime,.05);v.s.stop(c.currentTime+.3)}catch(e){}}this.pant=[]},
  // commands from keys, touch buttons and bots (one-shot, like cmd.slot)
  pre(){for(const a of G.actors){const k=a.cmd.hsk;if(!k)continue;a.cmd.hsk=0;if(!a.pup)this.use(a,k)}},
  tick(dt){const P=G.player;
    for(const a of G.actors){const h=a.hsk;if(!h)continue;
      if(!a.alive||a.team!==TH){if(h.sp||h.ex||h.ds){h.sp=h.ex=h.ds=0;h.off=G.t;if(a===P)this.stopPant()}continue}
      if(h.sp>0){h.sp-=dt;if(h.sp<=0){h.sp=0;h.ex=this.EX;this.tired(a)}}else if(h.ex>0)h.ex=Math.max(0,h.ex-dt);
      if(h.ds>0){h.ds-=dt;if(h.ds<=0){h.ds=0;h.off=G.t;if(a===P)AU.play('hskoff',{vol:.55})}}
      // the shooting range: they come back as soon as they wear off
      if(G.mode==='range'){if(h.uS&&h.sp<=0&&h.ex<=0)h.uS=0;if(h.uD&&h.ds<=0)h.uD=0}
      // what everyone else sees: dust kicked up at a sprint, eyes glowing red during a Deadshot
      if(a===P)continue;const c=a.c;
      if(h.sp>0&&c.onGround&&Math.hypot(c.vx,c.vz)>5.6&&Math.random()<dt*9)FX.spawn({x:c.x+rr(-.2,.2),y:c.y+.06,z:c.z+rr(-.2,.2),vx:-c.vx*.08,vy:rr(.2,.5),vz:-c.vz*.08,life:rr(.35,.6),s0:.1,s1:.38,r:.5,g:.47,b:.43,a:.3,f:6,drag:2.5,lit:1});
      if(h.ds>0&&Math.random()<dt*18)FX.spawn({x:a.head.x,y:a.head.y+.02,z:a.head.z,life:.12,s0:.13,s1:.08,r:1,g:.12,b:.07,a:.85,f:1,add:1})}},
  // the host: is a forced headshot from this player inside their window? (a client's window runs about half a round trip behind)
  dsOk(a,L){const h=a.hsk;if(!h)return false;if(h.ds>0)return true;return G.t-h.off<clamp(.35+((L&&L.rtt)||0)/1000,.35,1.25)},
  // guns whose hits can be headshots: everything that traces bullets, plus the bolt and the disc (not air, flame or explosive shots)
  dsGun(W){return !!W&&W.kind!=='melee'&&W.kind!=='nade'&&!W.air&&!W.cone&&(!W.proj||W.proj==='bolt'||W.proj==='disc')},
  // ---------- bots (host / solo): Sprint to get away or when they are the last one standing; Deadshot into a crowd or at a host ----------
  bot(a,dt){const B=a.bot;if(!B||NET.cli||G.st!=='fight'||!a.alive||a.team!==TH||a.cmd.hsk)return;const h=this.of(a);if(h.uS&&h.uD)return;
    B.hskT=(B.hskT||0)-dt;if(B.hskT>0)return;B.hskT=rr(.3,.6);if(B.hskP==null)B.hskP=rr(.2,.65);
    const c=a.c;let nz=null,nd=1e9,n12=0,host=false;
    for(const z of G.actors){if(!z.alive||z.team!==TZ||z.reviving>0)continue;const d=dist3(z.c,c);if(d<nd){nd=d;nz=z}if(d<12)n12++;if((z.host||z.zc==='boss')&&d<10)host=true}
    if(!nz)return;
    if(!h.uS){const last=humansAlive()===1;let flee=false;
      // backing off: the way it is walking points away from the nearest zombie
      if(nd<6){const f=a.cmd.f,s=a.cmd.s;if(f||s){const mx=-Math.sin(a.yaw)*f+Math.cos(a.yaw)*s,mz=-Math.cos(a.yaw)*f-Math.sin(a.yaw)*s;flee=mx*(c.x-nz.c.x)+mz*(c.z-nz.c.z)>0}}
      if((flee||last&&nd<16)&&Math.random()<(last?.7:B.hskP)){a.cmd.hsk='sp';return}}
    if(!h.uD&&(n12>=2||host)&&G.t-this.botT>.5){const W=WPN[a.cur],am=a.ammo[a.cur];if(!this.dsGun(W)||!am||am.mag<=0)return;
      const e=actorEye(a);if(!losClear(e.x,e.y,e.z,nz.c.x,nz.c.y+1.2,nz.c.z))return;
      if(Math.random()<B.hskP){a.cmd.hsk='ds';this.botT=G.t}}},
  // ---------- HUD: two slots under the ammo, a red rim and crosshair during a Deadshot, a dark breathing rim when out of breath ----------
  hudInit(){const L=LI(),br=$('hBR'),hud=$('hud');if(!br||!hud)return;
    const el=document.createElement('div');el.id='hHsk';
    el.innerHTML=['sp','ds'].map(k=>`<div class="hk ${k}"><span class="k">${k==='sp'?5:6}</span><b></b><i>${this.ICON[k]}</i><em></em><u><s></s></u></div>`).join('');br.appendChild(el);this.el=el;
    const T=k=>{const d=el.querySelector('.'+k);return {k,el:d,em:d.querySelector('em'),sec:d.querySelector('b'),bar:d.querySelector('s'),st:null,nm:null,w:null,s:null}};this.tS=T('sp');this.tD=T('ds');
    const vD=document.createElement('div');vD.id='hHskD';const vE=document.createElement('div');vE.id='hHskE';hud.insertBefore(vE,hud.firstChild);hud.insertBefore(vD,hud.firstChild);this.vD=vD;this.vE=vE;this.shown=null;this.tb=null},
  tile(t,st,p,sec,nm){if(t.st!==st){t.st=st;t.el.className='hk '+t.k+(st?' '+st:'')}if(t.nm!==nm){t.nm=nm;t.em.textContent=nm}
    const w=Math.round(clamp(p,0,1)*1000)/10+'%';if(t.w!==w){t.w=w;t.bar.style.width=w}const s=sec>0?String(Math.ceil(sec)):'';if(t.s!==s){t.s=s;t.sec.textContent=s}},
  hud(dt){if(!this.el)return;const P=G.player,h=P&&P.hsk,L=LI();const show=!!(P&&P.alive&&P.team===TH&&G.st!=='menu'&&G.st!=='over');
    if(show!==this.shown){this.shown=show;this.el.style.display=show?'':'none'}
    const sp=show&&!!h&&h.sp>0,ex=show&&!!h&&h.ex>0,ds=show&&!!h&&h.ds>0;
    if(show){this.tile(this.tS,sp?'on':ex?'ex':h&&h.uS?'used':'',sp?h.sp/this.SP:ex?h.ex/this.EX:0,sp?h.sp:ex?h.ex:0,ex?(L?'TIRED':'숨 참'):(L?'SPRINT':'전력질주'));
      this.tile(this.tD,ds?'on':h&&h.uD?'used':'',ds?h.ds/this.DS:0,ds?h.ds:0,L?'DEADSHOT':'확인사살')}
    const cr=HUD.el.cross;if(cr&&cr.classList.contains('ds')!==ds)cr.classList.toggle('ds',ds);
    if(this.vD.classList.contains('on')!==ds)this.vD.classList.toggle('on',ds);
    const ve=ex?'ex':sp?'sp':'';if(this.vE.className!==ve)this.vE.className=ve;
    // the touch buttons show the same: a filling ring while on, orange when out of breath, faded once used
    if(typeof TOUCH!=='undefined'&&TOUCH.on&&TOUCH.el){if(!this.tb)this.tb={sp:TOUCH.el.querySelector('.tHsp'),ds:TOUCH.el.querySelector('.tHds')};
      for(const k of ['sp','ds']){const b=this.tb[k];if(!b)continue;const on=k==='sp'?sp:ds,used=!!(h&&(k==='sp'?h.uS:h.uD)),tx=k==='sp'&&ex;
        const c='tb tHsk '+(k==='sp'?'tHsp':'tHds')+(on?' hon':tx?' hex':used?' hused':'');if(b.className.replace(/ on\b/,'')!==c)b.className=c+(b.classList.contains('on')?' on':'');
        if(on||tx){const p=(k==='sp'?(on?h.sp/this.SP:h.ex/this.EX):h.ds/this.DS).toFixed(3);if(b.style.getPropertyValue('--p')!==p)b.style.setProperty('--p',p)}}}},
  // sprinting: the view widens a little with the speed (never while scoped)
  fov(dt,cam){const P=G.player,h=P&&P.hsk,on=!!(h&&h.sp>0&&P.alive&&!G.spec&&P.team===TH&&!(P.zoom>0)&&G.st!=='menu');
    const v=on?clamp((Math.hypot(P.c.vx,P.c.vz)-5)/2.2,0,1):0;this.fovK=approach(this.fovK,v,dt*(v>this.fovK?4:2.5));return cam.fov*.085*this.fovK}};

// game.js maxSpeed (human branch): a sprint replaces the gun's speed factor; out of breath is a flat ×0.4
function hskSpeed(a,W){const h=a.hsk;return h.sp>0?HSK.SPM:h.ex>0?HSK.EXM:W?W.speed:1}
// weapons.js shotTrace, nyw.js bolt / disc: inside a Deadshot window a hit on a zombie anywhere is taken as a head hit (ha.part
// becomes 'head', so the damage, the hit marker and the kill rules follow). Returns true when it did, for the client's hit claim.
function hsForce(a,ha){if(!ha||ha.part==='head'||!a||a.team!==TH||!(a.hsk&&a.hsk.ds>0)||!ha.a||ha.a.team!==TZ)return false;ha.part='head';return true}

// ---------- sounds (rendered with the rest of the bank, like nyw.js does) ----------
Object.assign(SFX,{
  // Sprint: a sharp breath in through the teeth, a clipped 'hup', two quick heartbeats and a rising rush of air
  hsprint:{n:2,dur:1.15,ch:2,peak:.85,gain:.6,rev:.08,poly:2,fn:B=>{const out=B.g(.9);
    {const e=B.env(0,.15,.55,.07,out);B.nz('pink',0,.26,B.sweep(B.f('bandpass',900,1.6,e),900,2400,0,.21))}
    {const e=B.env(.02,.11,.22,.05,out);B.nz('white',.02,.2,B.f('highpass',3600,.7,e))}
    {const t=.2,e=B.env(t,.012,.5,.12,out);const f1=B.f('bandpass',720,5,e),f2=B.f('bandpass',1250,6,B.g(.5,e));B.osc('sawtooth',158,118,t,.15,B.g(1,f1));B.osc('sawtooth',158,118,t,.15,B.g(1,f2));B.nz('pink',t,.14,B.f('bandpass',1500,.8,B.g(.4,e)))}
    for(const [t,l] of [[.3,1],[.47,.75]]){const e=B.env(t,.006,l,.13,out);B.osc('sine',64,42,t,.16,e);B.nz('brown',t,.08,B.f('lowpass',150,.7,B.env(t,.004,l*.35,.06,out)))}
    for(const s of [-1,1]){const e=B.env(.24,.32,.4,.4,B.pan(s*.55,out));B.nz('white',.24,.8,B.sweep(B.f('bandpass',380,1.1,e),380,2600,.24,.95))}}},
  // out of breath: four ragged in-and-out pants, slowing down
  hpant:{n:2,dur:2.8,peak:.8,gain:.5,rev:.05,poly:2,pj:.03,fn:B=>{const out=B.g(.9);let t=0;
    for(let i=0;i<4;i++){const k=1-i*.12,ti=rr(.15,.2)*(1+i*.1),te=rr(.22,.3)*(1+i*.12);
      {const e=B.env(t,ti*.7,.45*k,ti*.3,out);B.nz('pink',t,ti+.05,B.f('bandpass',rr(1300,1700),1.3,e))}
      {const e=B.env(t,ti*.7,.16*k,ti*.3,out);B.nz('white',t,ti+.05,B.f('highpass',3200,.7,e))}
      const t2=t+ti+.03;{const e=B.env(t2,.02,.6*k,te,out);B.nz('pink',t2,te+.05,B.sweep(B.f('bandpass',1100,1.1,e),1100,650,t2,t2+te))}
      {const e=B.env(t2,.02,.12*k,te*.8,out);B.osc('sawtooth',rr(125,140),105,t2,te,B.f('bandpass',750,4,e))}
      t=t2+te+rr(.12,.2)*(1+i*.25)}}},
  // Deadshot: a bolt locking (two hard clicks), a scope glint ringing, a low boom under a rising whine, one heavy heartbeat
  hdshot:{n:2,dur:1.3,ch:2,peak:.9,gain:.7,rev:.18,poly:2,fn:B=>{const out=B.comp(-12,4,.002,.2,B.g(.95));
    B.grain(0,5200,1.5,.006,.8,out);B.grain(0,1900,2,.016,.6,out);B.osc('sine',240,150,0,.06,B.env(0,.001,.5,.05,out));
    B.grain(.09,6400,1.2,.005,.7,out);B.grain(.09,2400,2,.014,.55,out);
    B.ring(.1,rr(3100,3300),[1,1.414,2.18,2.94],[.5,.35,.22,.12],[.3,.16,.09,.05],out);
    {const e=B.env(.1,.01,.9,.6,out);B.osc('sine',58,34,.1,.65,e)}
    for(const s of [-1,1]){const e=B.env(.12,.35,.12,.4,B.pan(s*.5,out));B.osc('sine',520+s*6,1650+s*15,.12,.7,e)}
    {const e=B.env(.72,.006,.7,.14,out);B.osc('sine',60,40,.72,.17,e)}}},
  // Deadshot over: a short falling tone
  hskoff:{n:1,dur:.6,peak:.6,gain:.35,rev:.1,pj:0,fn:B=>{const e=B.env(0,.01,.4,.4);B.osc('sine',1400,500,0,.42,B.f('lowpass',3000,.7,e));const e2=B.env(.02,.02,.2,.3);B.nz('pink',.02,.35,B.sweep(B.f('bandpass',2000,2,e2),2000,600,.02,.35))}}});
SFX_ORDER.push('hsprint','hpant','hdshot','hskoff');

// ---------- strings: two rows in the controls list, a word in the round-start hint ----------
{const rows={ko:[['5','전력질주 (인간 · 라운드당 1번) — 10초간 총 무게와 상관없이 아주 빠르게 달린다. 끝나면 5초간 숨이 차서 느려짐'],['6','확인사살 (인간 · 라운드당 1번) — 5초간 좀비에게 맞힌 총알이 전부 헤드샷']],
    en:[['5','Sprint (human, once a round) — 10 s of much faster running whatever you carry, then 5 s out of breath (slow)'],['6','Deadshot (human, once a round) — for 5 s every bullet that hits a zombie is a headshot']]};
  for(const l in rows){const K=STR[l]&&STR[l].keys;if(!Array.isArray(K))continue;const i=K.findIndex(r=>r[0]==='G');K.splice(i<0?K.length:i,0,...rows[l])}
  if(typeof STR.ko.prepHint==='string')STR.ko.prepHint+='  ·  5 · 6: 질주 · 확인사살';if(typeof STR.en.prepHint==='string')STR.en.prepHint+='  ·  5 / 6: Sprint · Deadshot'}

// ---------- hooks ----------
(function(){
  // commands first, then the frame, then the timers
  const gu=gameUpdate;gameUpdate=function(dt){const live=G.st!=='menu'&&G.st!=='over';if(live)HSK.pre();gu(dt);if(G.st!=='menu'&&G.st!=='over')HSK.tick(dt)};
  // round / stage start and infection wipe them (a client runs these from the host's events too)
  const sr=startRound;startRound=function(plan){const run=!(NET.cli&&!plan);const r=sr(plan);if(run)for(const a of G.actors)HSK.clear(a);return r};
  const bz=becomeZombie;becomeZombie=function(a,host){const r=bz(a,host);HSK.clear(a);return r};
  const ss=SCEN.stageStart;SCEN.stageStart=function(kind,plan){const run=!(NET.cli&&!plan);const r=ss.call(this,kind,plan);if(run)for(const a of G.actors)if(!a.scen)HSK.clear(a);return r};
  // out of breath: heavy, dragging steps
  const fs=footstep;footstep=function(a){const h=a.hsk;if(!h||!(h.ex>0)||a.team!==TH||a.cmd.walk||a.duck)return fs(a);const c=a.c,s=surfaceAt(c.x,c.y,c.z);
    const nm=s==='metal'?'step_metal':s==='dirt'?'step_dirt':s==='wood'?'step_wood':'step_conc';
    if(a.isPlayer){AU.play(nm,{vol:.42,rate:.74});AU.play('step_dirt',{vol:.13,rate:.55,delay:.07})}else AU.at(nm,c.x,c.y,c.z,{vol:.8,range:26,rate:.74})};
  // bots decide after their own logic has run (ai.js keeps AI.human as the entry point)
  const ah=AI.human;AI.human=function(a,dt){ah.call(this,a,dt);HSK.bot(a,dt)};
  // HUD
  const hi=HUD.init.bind(HUD);HUD.init=function(){hi();HSK.hudInit()};
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);HSK.hud(dt)};
  // the field-of-view kick: take last frame's kick off before the camera works out the view, put this frame's back on after
  const cm=Main.camera;Main.camera=function(dt){const cam=R.cam,had=HSK.fovAdd;if(had){cam.fov-=had;HSK.fovAdd=0}cm.call(this,dt);
    const add=HSK.fov(dt,cam);if(add>.01){cam.fov+=add;HSK.fovAdd=add}if(add>.01||had)cam.updateProjectionMatrix()};
  // touch: two buttons left of crouch (humans only)
  if(typeof TOUCH!=='undefined'){const tb=TOUCH.build;TOUCH.build=function(){tb.call(this);const L=LI(),w=document.createElement('div');
      w.innerHTML=this.B('hsk_sp',HSK.ICON.sp,'tHsk tHsp',L?'SPRINT':'질주')+this.B('hsk_ds',HSK.ICON.ds,'tHsk tHds',L?'DEADSHOT':'확인사살');const bar=this.el.querySelector('.tbar');
      while(w.firstChild)this.el.insertBefore(w.firstChild,bar);HSK.tb=null};
    const tp=TOUCH.press;TOUCH.press=function(id,on,v){if(id!=='hsk_sp'&&id!=='hsk_ds')return tp.call(this,id,on,v);if(!on)return;const P=G.player;if(P&&P.alive&&P.team===TH){this.buzz(14);P.cmd.hsk=id==='hsk_sp'?'sp':'ds'}}}
  // ---------- network ----------
  const nt=netTables;netTables=function(){const fresh=!WL.length;nt();if(fresh&&WL.length)NET_VER+='-hsk1'};
  // a client's hit claim: mark the hits the Deadshot turned into headshots
  const nc=netClaimHit;netClaimHit=function(t,dmg,src,o){const n=NET.hits.length,r=nc(t,dmg,src,o);if(o&&o.ds&&NET.hits.length>n)NET.hits[n][3]|=HSK.BIT;return r};
  // the host: a forced headshot outside that player's window goes back to a body hit
  const hh=HOSTH.h;HOSTH.h=function(L,m){const src=actorOfKey(L.key);if(src&&Array.isArray(m.L)){let ok=null;
      for(const q of m.L){if(!Array.isArray(q)||!((q[3]|0)&HSK.BIT))continue;if(ok===null)ok=HSK.dsOk(src,L);
        if(!ok){const W=WPN[WL[q[2]]]||{};q[3]&=~(1|HSK.BIT);q[1]=W.hsDmg?W.dmg:(+q[1]||0)/(W.hs||3)}}}
    return hh.call(this,L,m)};
  Object.assign(HOSTH,{hsk(L,m){const a=actorOfKey(L.key);if(a)HSK.use(a,m.k)}});
  Object.assign(CLIH,{hsk(L,m){const a=byId(m.i);if(a&&a.alive&&a.team===TH&&(m.k==='sp'||m.k==='ds'))HSK.start(a,m.k)}});
})();

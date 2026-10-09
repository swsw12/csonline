'use strict';
// ============ First draw: each gun made ready its own way (racked, charged, slapped, cocked, spun up, started) ============
// Played the first time a gun comes out after it was bought, picked up or taken from a crate (GUN_DESIGN in design.js).
// The normal raise runs first (VM.drawT), then the action: a pose for the whole gun, the moving parts (model tags chg / slide /
// bolt / pump / mag / aux / cover / spin), the free hand going to the part and riding along with it, and sounds and kicks at
// set moments. q runs 0..1 through the action. Every function adds its pose to K = [x,y,z, rx,ry,rz] (rz + = right side up).
const _fdv=new THREE.Vector3(),_fdk=[0,0,0,0,0,0],_fdk2=[0,0,0,0,0,0];
const fdSeg=(q,a,b)=>clamp((q-a)/(b-a),0,1);
// a handle going back a..b, held to c, coming home c..e (snap = released under spring: fast at first)
function fdPull(q,a,b,c,e,snap){if(q<a)return 0;if(q<b)return smooth((q-a)/(b-a));if(q<c)return 1;if(q<e){const u=(q-c)/(e-c);return snap?1-Math.sqrt(u):1-smooth(u)}return 0}
// ease in over a..b, out over c..e
function fdEnv(q,a,b,c,e){return q<a?0:q<b?smooth((q-a)/(b-a)):q<c?1:q<e?1-smooth((q-c)/(e-c)):0}
// free hand to a point in gun space (w 0 = stays on the support grip, 1 = there)
function fdHand(m,x,y,z,w){if(!m.armL||!m.armL.visible||w<=0)return;m.armL.position.lerp(_fdv.set(x,y,z),Math.min(1,w))}
function fdTag(G,t,fb){return (G&&G._tc&&G._tc[t])||fb||[0,.05,0]}
const fdJit=(K,j)=>{K[0]+=(Math.random()-.5)*j;K[1]+=(Math.random()-.5)*j;K[3]+=(Math.random()-.5)*j*2.5};
// timing of a charge-type pull from the gun's heaviness: [hand on it, pulled back, released, home]
const fdT=h=>{const a=.3+h*.04,b=.46+h*.1,c=b+.05;return [a,b,c]};

const FD={
  // pistols: the free hand comes over the top, pinches the back of the slide and pulls it to the stop; it slams home
  slide(V,q,m,G,W,P,K){const d=P.d||.045,h=P.heavy||0,a=.28+h*.04,b=.46+h*.08,c=b+.04,s=fdPull(q,a,b,c,c+.05,true);
    if(m.gun2){// Dual Berettas: the guns meet in front, both slides go back together
      const e=fdEnv(q,0,.18,.78,1);m.gun.position.x-=.085*e;m.gun2.position.x+=.085*e;m.gun.position.z-=.03*e;m.gun2.position.z-=.03*e;
      m.gun.rotation.z+=.75*e;m.gun2.rotation.z-=.75*e;m.gun.rotation.y+=.25*e;m.gun2.rotation.y-=.25*e;K[1]+=.035*e;K[3]+=.08*e;
      if(q>.5&&q<.6){const k=Math.sin(fdSeg(q,.5,.6)*Math.PI);m.gun.position.x+=.012*k;m.gun2.position.x-=.012*k}// the two slides bite on each other
      for(const T of [m.tags,m.tags2])if(T&&T.slide)T.slide.position.z+=s*d;return}
    // turned muzzle-left so the slide is seen side-on; the hand takes the back of it and pulls toward the camera
    const e=fdEnv(q,0,.16,.8,1);K[4]+=(.85+h*.1)*e;K[0]-=.065*e;K[1]+=.05*e;K[2]-=.03*e;K[5]+=(P.roll||.2)*e;K[3]+=(.08+h*.04)*e;
    if(m.tags.slide)m.tags.slide.position.z+=s*d;
    const g=fdTag(G,'slide');fdHand(m,g[0],g[1]+.014,g[2]+.1+s*d,fdEnv(q,.05,a,c+.02,.86));
    if(h&&q>c&&q<c+.08)K[3]+=Math.sin(fdSeg(q,c,c+.08)*Math.PI)*.05},
  // revolver: crane out to the left, a spin, shut with a flick of the wrist, then the thumb cocks the hammer
  revolver(V,q,m,G,W,P,K){const C=m.tags.mag,H=m.tags.aux;const e=fdEnv(q,0,.12,.86,1);K[4]+=.8*e;K[0]-=.06*e;K[1]+=.05*e;K[2]-=.02*e;K[3]+=.08*e;K[5]+=.15*e;
    const o=q<.1?0:q<.22?smooth((q-.1)/.12):q<.6?1:q<.65?1-fdSeg(q,.6,.65):0;const u=fdSeg(q,.24,.6),spin=(1-Math.pow(1-u,2.2))*TAU*2.5;
    if(C){C.position.x-=.03*o;C.position.y-=.012*o;C.rotation.z+=spin}
    if(q>.6&&q<.72){const k=Math.sin(fdSeg(q,.6,.72)*Math.PI);K[4]-=k*.35;K[5]+=k*.25}// the flick that shuts it
    const hk=fdPull(q,.74,.84,.9,.98,false);if(H)H.rotation.x-=hk*.7;
    const cc=fdTag(G,'mag');fdHand(m,cc[0]-.035,cc[1]-.012-.03*o,cc[2],fdEnv(q,.12,.26,.56,.66))},
  // a side / top / bottom handle: the free hand goes to it, pulls it to the stop and lets it fly (open bolt: eases it forward)
  charge(V,q,m,G,W,P,K){const T=m.tags.chg,d=P.d||.05,h=P.heavy||0,side=P.side||'r',[a,b,c]=fdT(h),s=fdPull(q,a,b,c,c+(P.ob?.14:.04),!P.ob);
    const e=fdEnv(q,0,.16,.8,1),r=P.roll==null?.3:P.roll;
    if(side==='r')K[5]+=r*e;else if(side==='l')K[5]-=r*e;else if(side==='t'){K[3]+=.1*e;K[1]-=.01*e}else{K[3]-=.16*e;K[5]+=r*e;K[1]+=.03*e;K[4]+=.25*e}
    K[0]-=.04*e;K[1]+=.028*e;
    if(T)T.position.z+=s*d;
    const g=fdTag(G,'chg'),o=side==='r'?[.022,.006,.01]:side==='l'?[-.022,.006,.01]:side==='t'?[0,.03,.02]:[0,-.03,.01];
    fdHand(m,g[0]+o[0],g[1]+o[1],g[2]+o[2]+s*d,fdEnv(q,.06,a,c+.01,.86));
    if(!P.ob&&q>c&&q<c+.08)K[3]+=Math.sin(fdSeg(q,c,c+.08)*Math.PI)*(.03+h*.03)},
  // HK slap: pull the lever back, flip it up into its notch, take the hand away and slap it down — the bolt slams home
  hk(V,q,m,G,W,P,K){const T=m.tags.chg,d=P.d||.05,h=P.heavy||0;const e=fdEnv(q,0,.14,.84,1);K[5]-=.3*e;K[0]-=.04*e;K[1]+=.03*e;K[3]+=.03*e;
    const pull=q<.28?0:q<.42?smooth((q-.28)/.14):q<.7?1:q<.73?1-fdSeg(q,.7,.73):0,lock=fdEnv(q,.42,.48,.7,.71);
    if(T){T.position.z+=pull*d;T.position.y+=lock*.007}
    const g=fdTag(G,'chg');let hy=g[1]+.012;if(q>.5&&q<.7)hy+=Math.sin(fdSeg(q,.5,.7)*Math.PI*.95)*.07;
    fdHand(m,g[0]-.02,hy,g[2]+pull*d+.008,fdEnv(q,.05,.28,.8,.95));
    if(q>.7&&q<.8){const k=Math.sin(fdSeg(q,.7,.8)*Math.PI);K[1]-=k*(.012+h*.008);K[3]-=k*.03}},
  // M4: the T-handle behind the sight comes back and snaps forward, then a tap on the forward assist
  ar(V,q,m,G,W,P,K){const T=m.tags.chg,A=m.tags.aux,d=P.d||.06;const e=fdEnv(q,0,.16,.84,1);K[3]+=.13*e;K[1]+=.01*e;K[2]+=.03*e;K[5]+=.07*e;K[0]-=.03*e;
    const s=fdPull(q,.28,.44,.48,.52,true);if(T)T.position.z+=s*d;
    const fa=fdPull(q,.68,.71,.72,.76,false);if(A)A.position.x-=fa*.006;
    const g=fdTag(G,'chg'),f=fdTag(G,'aux',[.03,.07,-.01]),t=smooth(fdSeg(q,.54,.66));
    fdHand(m,lerp(g[0]-.015,f[0]+.02,t),lerp(g[1]+.012,f[1],t),lerp(g[2]+s*d+.012,f[2]+.01,t),fdEnv(q,.06,.28,.76,.9));
    if(q>.48&&q<.56)K[3]+=Math.sin(fdSeg(q,.48,.56)*Math.PI)*.04},
  // pump: one stroke, back and home
  pump(V,q,m,G,W,P,K){const T=m.tags.pump;const e=fdEnv(q,0,.15,.8,1);K[5]+=.18*e;K[3]+=.04*e;
    const s=q<.25?0:q<.42?smooth((q-.25)/.17):q<.47?1:q<.62?1-smooth((q-.47)/.15):0;
    if(T)T.position.z+=s*.095;if(m.armL)m.armL.position.z+=s*.095;K[3]-=s*.035;K[5]+=s*.03},
  // bolt action: lift, pull, push, lower
  bolt(V,q,m,G,W,P,K){const T=m.tags.bolt,h=P.heavy||0;const e=fdEnv(q,0,.14,.86,1);K[5]+=.16*e;K[0]-=.035*e;K[1]+=.025*e;
    const lift=fdEnv(q,.18,.28,.72,.82),pull=fdEnv(q,.3,.46,.52,.68);
    if(T){T.rotation.z+=lift*1.1;T.position.z+=pull*(.07+h*.015)}
    const g=fdTag(G,'bolt');fdHand(m,g[0]+.012,g[1]+.012+lift*.012,g[2]+pull*(.07+h*.015),fdEnv(q,.04,.18,.82,.94));K[5]+=lift*.06},
  // break action: open on the hinge, look into the chambers, flick it shut
  break(V,q,m,G,W,P,K){const T=m.tags.mag,A=m.tags.aux;kfv(VMK.relB,q,_fdk2);for(let i=0;i<6;i++)K[i]+=_fdk2[i];const e=fdEnv(q,0,.12,.8,.95),L=P.lift==null?.08:P.lift;K[1]+=L*e;K[0]-=.035*e;K[2]+=L*.5*e;K[3]+=L*1.5*e;
    const open=q<.12?smooth(q/.12):q<.72?1:q<.8?1-smooth((q-.72)/.08):0;if(T)T.rotation.x+=-open*(P.open||.62);if(A)A.rotation.y+=open*.5;
    const hg=G.hinge||[0,.03,-.1];fdHand(m,hg[0]-.03,hg[1]-.06,hg[2]-.08,fdEnv(q,.15,.3,.6,.75))},
  // belt-fed: lift the top cover, lay the belt in the tray, slam the cover, then pull the charging handle
  belt(V,q,m,G,W,P,K){const C=m.tags.cover,T=m.tags.chg,h=P.heavy||0;
    const eT=fdEnv(q,0,.1,.5,.6),eR=fdEnv(q,.52,.62,.9,1);K[3]+=.14*eT;K[1]-=.01*eT;K[5]+=.06*eT+.26*eR;K[0]-=.02*(eT+eR);
    const o=q<.1?0:q<.24?smooth((q-.1)/.14):q<.46?1:q<.5?1-fdSeg(q,.46,.5):0;if(C)C.rotation.x-=o*1.05;
    const cv=fdTag(G,'cover'),g=fdTag(G,'chg'),s=fdPull(q,.68,.8,.84,.92,false);if(T)T.position.z+=s*(.075+h*.01);
    if(q<.56){const u=fdSeg(q,.26,.4),b=Math.sin(fdSeg(q,.26,.44)*Math.PI);fdHand(m,cv[0]-.01,cv[1]+.035+o*.05-b*.06,cv[2]+.13-u*.06,fdEnv(q,.02,.1,.48,.56))}
    else fdHand(m,g[0]+.022,g[1]+.004,g[2]+s*(.075+h*.01)+.01,fdEnv(q,.56,.68,.9,.98));
    if(q>.46&&q<.54){const k=Math.sin(fdSeg(q,.46,.54)*Math.PI);K[1]-=k*.012;K[3]-=k*.03}},
  // rotating barrels / drum / drill / disc: spin up, then let it run down
  spin(V,q,m,G,W,P,K,dt){const T=m.tags.spin;const sp=q<.45?smooth(q/.45):1-smooth((q-.45)/.55);V.fdAng+=sp*dt*(P.rps||10)*TAU;
    if(T){if(P.axis==='x')T.rotation.x+=V.fdAng;else T.rotation.z+=V.fdAng}K[3]+=.05*fdEnv(q,0,.2,.8,1);fdJit(K,sp*(P.shake||.004))},
  // chainsaw: two pulls on the starter — the first one coughs and dies, the second one catches
  saw(V,q,m,G,W,P,K){const T=m.tags.chg;const e=fdEnv(q,0,.1,.85,1);K[5]-=.22*e;K[0]+=.01*e;K[3]+=.04*e;
    const s=Math.max(fdPull(q,.12,.21,.22,.32,false),fdPull(q,.42,.5,.51,.62,false));const ox=-.08*s,oy=-.01*s,oz=.13*s;K[1]-=.02*e;K[0]+=.02*e;
    if(T){T.position.x+=ox;T.position.y+=oy;T.position.z+=oz}
    const g=fdTag(G,'chg');fdHand(m,g[0]-.012+ox,g[1]+.01+oy,g[2]+oz,fdEnv(q,.03,.12,.64,.76));
    K[5]-=s*.07;K[0]-=s*.014;if(q>.5)fdJit(K,.005*fdEnv(q,.5,.55,.8,1))},
  // crossbow: the cocking slide draws the string back until it latches
  xbow(V,q,m,G,W,P,K){const T=m.tags.chg;const e=fdEnv(q,0,.15,.82,1);K[3]+=.22*e;K[1]+=.01*e;K[2]+=.02*e;
    const s=fdPull(q,.25,.55,.6,.75,false);if(T)T.position.z+=s*.14;
    const g=fdTag(G,'chg');fdHand(m,g[0],g[1]+.022,g[2]+s*.14+.01,fdEnv(q,.05,.25,.62,.8));if(q>.58&&q<.64)K[3]-=Math.sin(fdSeg(q,.58,.64)*Math.PI)*.04},
  // harpoon gun: the spear slides home into the barrel and locks
  harpoon(V,q,m,G,W,P,K){const T=m.tags.mag;const e=fdEnv(q,0,.15,.82,1);K[5]-=.12*e;K[3]+=.05*e;
    const s=1-smooth(fdSeg(q,.15,.55));if(T){T.position.z-=s*.22;T.visible=true}
    const g=fdTag(G,'mag');fdHand(m,g[0]-.02,g[1]-.012,g[2]-s*.22+.08,fdEnv(q,.02,.15,.58,.72));if(q>.56&&q<.62)K[2]+=Math.sin(fdSeg(q,.56,.62)*Math.PI)*.012},
  // air tank: twist the valve open, the gun shivers while the pressure comes up
  tank(V,q,m,G,W,P,K){const T=m.tags.mag;const e=fdEnv(q,0,.15,.84,1);K[5]-=.2*e;K[3]+=.06*e;
    const tw=fdEnv(q,.25,.4,.48,.6);if(T)T.rotation.z+=tw*.6;const g=fdTag(G,'mag');fdHand(m,g[0]-.04,g[1],g[2]+.02,fdEnv(q,.05,.25,.6,.74));
    if(q>.42)fdJit(K,.004*fdEnv(q,.42,.48,.8,.95))},
  // the caged singularity wakes up: it spins and swells
  orb(V,q,m,G,W,P,K){const T=m.tags.mag;const e=fdEnv(q,0,.15,.85,1);K[3]+=.08*e;K[5]-=.12*e;
    const sp=fdEnv(q,.1,.5,.7,1);V.fdAng+=sp*V.fdDt*9*TAU;if(T){T.rotation.y+=V.fdAng;T.scale.setScalar(1+.35*Math.sin(fdSeg(q,.15,.8)*Math.PI))}fdJit(K,.002*sp)},
  // dragon cannons: push a round up into the breech, then a breath of fire at the mouth
  dragon(V,q,m,G,W,P,K){const T=m.tags.mag;const e=fdEnv(q,0,.15,.85,1);K[5]+=.2*e;K[3]+=.04*e;
    const s=1-smooth(fdSeg(q,.18,.42));if(T)T.position.y-=s*.06;
    const g=fdTag(G,'mag');fdHand(m,g[0],g[1]-.03-s*.06,g[2],fdEnv(q,.04,.18,.45,.58));if(q>.58&&q<.74)K[3]+=Math.sin(fdSeg(q,.58,.74)*Math.PI)*.12},
  // thumb on the hammer
  cock(V,q,m,G,W,P,K){const H=m.tags.aux;const e=fdEnv(q,0,.15,.82,1);K[4]+=.5*e;K[0]-=.04*e;K[5]+=.15*e;K[3]+=.2*e;K[1]+=.04*e;const c=fdPull(q,.3,.48,.8,.95,false);if(H)H.rotation.x-=c*.75},
  // multi-barrel: turn the cluster a third of a turn by hand until it clicks
  barrel(V,q,m,G,W,P,K){const T=m.tags.spin;const e=fdEnv(q,0,.15,.82,1);K[5]+=.18*e;K[3]+=.05*e;
    const r=smooth(fdSeg(q,.25,.55));if(T)T.rotation.z+=r*TAU/3;const g=fdTag(G,'spin');fdHand(m,g[0]-.045,g[1],g[2],fdEnv(q,.05,.25,.58,.75))}};

// sound and kick cues [q, sound, volume, rate, [push up, pitch, roll] kick, special]
function fdCues(P){const h=P.heavy||0;
  switch(P.act){
    case 'slide':{const c=.5+h*.12;return [[.3+h*.04,'slide',.45,.8-h*.15],[c,'rack',.75,1.15-h*.3,[.2+h*.15,-.5-h*.5,0]]]}
    case 'revolver':return [[.11,'brk',.55,1.6],[.25,'cylspin',.8,1],[.61,'brk',.7,1.35,[.15,0,.9]],[.84,'dry',.6,.7]];
    case 'charge':{const [a,,c]=fdT(h);return [[a+.01,'chg',.65,1.15-h*.35],P.ob?[c+.02,'dry',.55,.75]:[c,'slide',.8,1-h*.3,[.2+h*.1,-.6-h*.4,0]]]}
    case 'hk':return [[.29,'chg',.6,1.1-h*.25],[.47,'dry',.5,1.4],[.7,'hkslap',.95,1-h*.2,[.3,-.9,0]]];
    case 'ar':return [[.29,'chg',.6,1.05],[.48,'slide',.8,.9,[.25,-.6,0]],[.71,'dry',.5,1.8]];
    case 'pump':return [[.24,'pump',.85,1]];
    case 'bolt':return [[.17,'bolt',.85,1-h*.15]];
    case 'break':return [[.06,'brk',.6,1],[.78,'brk',.7,1.15,[.2,1.6,0]]];
    case 'belt':return [[.1,'brk',.55,.8],[.33,'magin',.6,.75],[.47,'brk',.85,.7,[.3,-.8,0]],[.69,'chg',.7,.75-h*.1],[.87,'slide',.6,.7-h*.1]];
    case 'spin':{const S=P.snd||['spinup',.8,1];return [[.02,S[0],S[1],S[2]]]}
    case 'saw':return [[.12,'sawpull',.8,1],[.42,'sawpull',.9,1.06],[.5,'sawrev',.8,1]];
    case 'xbow':return [[.26,'xbowcock',.75,1],[.59,'dry',.65,.6,[.1,-.4,0]]];
    case 'harpoon':return [[.2,'slide',.5,.6],[.56,'magin',.7,.7],[.6,'dry',.6,.8,[.1,0,0]]];
    case 'tank':return [[.3,'dry',.5,.6],[.42,'hiss',.8,1]];
    case 'orb':return [[.08,'bhole',.3,1.8],[.4,'hiss',.35,.6]];
    case 'dragon':return [[.42,'shellin',.7,.8,[.1,0,0]],[.6,'flare',.7,1.2,[.15,.8,0],'flame']];
    case 'cock':return [[.48,'dry',.6,.7]];
    case 'barrel':return [[.27,'cylspin',.55,.8],[.56,'dry',.6,.8]];}
  return []}
// VM side: start, and run one frame (after every other layer, just before the view model's transform is written)
VM.firstDraw=function(raise,extra,P){this.draw(raise);this.act={P,t:0,raise,d:raise+extra,ci:0,cues:fdCues(P)};this.fdAng=0};
VM.actFrame=function(dt,m,W,K){const A=this.act;if(!A)return;A.t+=dt;if(A.t<A.raise)return;const f=FD[A.P.act];if(!f){this.act=null;return}
  const q=clamp((A.t-A.raise)/Math.max(.05,A.d-A.raise),0,1);_fdk.fill(0);this.fdDt=dt;f(this,q,m,GUNS[W.model],W,A.P,_fdk,dt);for(let i=0;i<6;i++)K[i]+=_fdk[i];
  const S=this.sp;while(A.ci<A.cues.length&&q>=A.cues[A.ci][0]){const c=A.cues[A.ci++];if(c[1])AU.play(c[1],{vol:c[2],rate:c[3]});
    if(c[4]){S.py.v+=c[4][0];S.rx.v+=c[4][1];S.rz.v+=c[4][2]}if(c[5]==='flame'){this.flashT=.32;this.U.uMuzzle.value.setRGB(1.8,.7,.25);this.flash.scale.setScalar(2.2)}}
  if(A.t>=A.d)this.act=null};

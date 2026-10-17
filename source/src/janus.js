'use strict';
// ============ v6.40: JANUS-1 — a five-shot grenade-launcher pistol that opens into the JANUS form ============
// The name and the mechanics follow the CSO weapon; the model (a stubby 40 mm revolver with a two-faced mask on its frame), its motions
// and its sounds are this game's own.
// Five grenades and no reload: a supply crate (zombie modes) or an ammo box (the chapters) fills it up again; the buy menu's ammo and
// buying it again do not (W.supOnly), and putting it down and taking a new one hands back the rounds it had (a.jnLeft).
// Every blast that catches at least one zombie counts once toward the JANUS charge (one count however many it catches). Five counts
// (not necessarily in a row) give the signal: the eyes of the mask light violet and so does the crosshair. Right click within JN.SIG s
// opens it into the JANUS form (else the signal lapses and the count starts again): JN.B s of grenades without limit, full-auto at
// JN.BRPM (one every 0.28 s, up to 18; the trigger or the touch fire button held). Then it closes up by itself and the count starts again.
// Putting it away, dying, turning or a new round ends the form (the signal keeps running while it is holstered).
// Motions: after every shot the hammer falls and comes back while the drum turns a fifth. Opening: the gun is raised and turned up,
// the free hand slaps down on the mask, the barrel splits into two shells (up, down) round a glowing violet core, the fins on its sides
// swing out, the crest on the mask lifts and the five chambers light. Closing: it shuts with a clank and lets off steam.
// Network: the state changes go out as ['jn', id, 0 shut | 1 signal | 2 opening]; the grenades are projectiles like the others.
// v6.55: JANUS-2 (janus2.js) runs on the same machinery: what differs between the two (the form's round, sounds, clips, light, the
// grenades) sits in JNW / JNP; WPN[id].jn names the JANUS weapon a WPN entry belongs to. v6.68: a JNW entry may also set its own opening
// and closing times (oT / cT), how far open it is (openK), calm (no burst, kick or shake when the form comes on or the world model
// changes) and no light while open (lit null) — the Dick gun's second sheet.

// ---------- atlas: one self-lit violet ----------
for(const m of ['jnGlow']){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintJnAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');const i=GA.idx.jnGlow;if(i==null||i>=GA_SLOTS)return;
  const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
  for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const X=x0+xx,Y=y0+y,t=fbm(X/10,Y/10,7101,2,0),b=Math.abs(Math.sin(y*.19+t*5));
    const c=b>.86?'#f6e2ff':t>.56?'#c983ff':t>.42?'#a45cff':'#7f34ea';const r=rgbOf(c),k=(y*PS+xx)*4;D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=232}
  x.putImageData(id,x0,y0);GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintJnAtlas()}}

// ---------- numbers ----------
const JN={N:5,SIG:35,B:5,OPEN:.62,CLOSE:.55,RPM:75,BRPM:214,R:4.8,DMG:130,BDMG:150,SCEN:2.5,KB:9,BKB:2.5,STAG:.7,BSTAG:.2,UP:3,BUP:.8,SPD:38,BSPD:46};
const JN_BY=.064,JN_CY=.039,JN_CZ=-.036,JN_RC=.025,JN_MY=.12,JN_MZ=.016,JN_OPEN_Y=.019,JN_FIN=.62,JN_CREST=.011,JN_COCK=.36;
// where the moving groups turn (gun space)
const JN_PIV={cyl:[0,JN_CY,JN_CZ],cg:[0,JN_CY,JN_CZ],fL:[-.031,JN_BY,-.236],fR:[.031,JN_BY,-.236],aux:[0,.074,.042]};

// ---------- the model ----------
// gun frame as every pistol: origin at the grip, the barrel along -Z. v: 'vm' the first-person model (moving and lit parts tagged) |
// 'n' / 's' / 'b' the world models — shut, signal (lit eyes and inlays), JANUS form (open, everything lit) — each one fixed pose
function jnParts(v){const vm=v==='vm',B=v==='b',S=v==='s'||B,P=[],BY=JN_BY,CY=JN_CY,CZ=JN_CZ,RC=JN_RC,MY=JN_MY,MZ=JN_MZ;
  const show=t=>t==='eye'||t==='gl'||/^h\d$/.test(t)?S:t==='cg'?B:true;
  const pose=t=>t==='aux'?[0,0,0,JN_COCK,0]:!B?null:t==='bU'?[0,JN_OPEN_Y,0,0,0]:t==='bD'?[0,-JN_OPEN_Y,0,0,0]:t==='fL'?[0,0,0,0,-JN_FIN]:t==='fR'?[0,0,0,0,JN_FIN]:t==='crest'?[0,JN_CREST,0,0,0]:null;
  const T=(t,list)=>{for(const p of list){if(vm){p.tag=t;P.push(p);continue}if(!show(t))continue;const q=pose(t);
    if(q){const pv=JN_PIV[t]||[0,0,0];let x=p.c[0]-pv[0],y=p.c[1]-pv[1],z=p.c[2]-pv[2];
      if(q[3]){const c=Math.cos(q[3]),s=Math.sin(q[3]),y2=y*c-z*s;z=y*s+z*c;y=y2;p.rx=(p.rx||0)+q[3]}
      if(q[4]){const c=Math.cos(q[4]),s=Math.sin(q[4]),x2=x*c+z*s;z=-x*s+z*c;x=x2;p.ry=(p.ry||0)+q[4]}
      p.c=[x+pv[0]+q[0],y+pv[1]+q[1],z+pv[2]+q[2]]}P.push(p)}};
  const A=list=>{for(const p of list)P.push(p)};
  // the frame: lower frame, a wide recoil shield behind the drum, the top strap over it, the front under the barrel, engraved plates
  A([Pt(0,0,-.03,.042,.03,.16,'blk',{r:.006}),Pt(0,.05,.021,.05,.088,.026,'blk',{r:.008}),Pt(0,.098,-.04,.032,.014,.128,'blk',{r:.005}),
    Pt(0,.024,-.099,.04,.048,.042,'blk',{r:.006}),...[1,-1].flatMap(s=>[Pt(s*.0222,.006,.01,.003,.007,.007,'brass',{r:.002}),Pt(s*.0222,.006,-.075,.003,.007,.007,'brass',{r:.002})]),...[1,-1].map(s=>Pt(s*.0215,0,-.035,.002,.022,.11,'engraved')),Pt(0,-.016,-.02,.03,.006,.11,'blk2'),
    Pt(0,.05,.0345,.05,.06,.002,'blk2')]);
  // the drum: five chambers, flutes between them, a ratchet at the back (turns about the axis under the bore)
  const ch=k=>{const a=Math.PI/2+k*TAU/5;return [Math.cos(a)*RC,CY+Math.sin(a)*RC]};
  T('cyl',[Pt(0,CY,CZ,.09,.09,.086,'bluesteel',{r:.04}),Pt(0,CY,CZ,.084,.084,.092,'gunmetal',{r:.037}),
    ...[0,1,2,3,4].map(k=>{const [x,y]=ch(k);return Pt(x,y,CZ-.0465,.026,.026,.004,'muzzle',{r:.012})}),
    ...[0,1,2,3,4].map(k=>{const a=Math.PI/2+(k+.5)*TAU/5;return Pt(Math.cos(a)*.043,CY+Math.sin(a)*.043,CZ,.012,.012,.06,'muzzle',{rz:a,r:.004})}),
    Pt(0,CY,CZ+.046,.026,.026,.004,'steel',{r:.01})]);
  T('cg',[0,1,2,3,4].map(k=>{const [x,y]=ch(k);return Pt(x,y,CZ-.0485,.02,.02,.002,'jnGlow',{r:.009})}));
  // the barrel: two shells round a glowing core (dark coil rings over it), a brake collar on each, the bore halves, a rib and bead on top
  T('bU',[Pt(0,BY+.0142,-.177,.058,.0284,.186,'gunmetal',{r:.01}),Pt(0,BY+.016,-.256,.066,.032,.028,'blk2',{r:.008}),Pt(0,BY+.0095,-.2705,.04,.019,.002,'muzzle',{r:.006}),
    Pt(0,BY+.031,-.17,.012,.006,.15,'blk'),Pt(0,BY+.036,-.252,.005,.008,.01,'white'),Pt(0,BY+.0285,-.12,.03,.004,.04,'engraved')]);
  T('bD',[Pt(0,BY-.0142,-.177,.058,.0284,.186,'gunmetal',{r:.01}),Pt(0,BY-.016,-.256,.066,.032,.028,'blk2',{r:.008}),Pt(0,BY-.0095,-.2705,.04,.019,.002,'muzzle',{r:.006}),
    Pt(0,BY-.0285,-.18,.03,.004,.08,'blk2')]);
  A([Pt(0,BY,-.18,.032,.032,.17,'jnGlow',{r:.013}),...[-.115,-.155,-.195,-.235].map(z=>Pt(0,BY,z,.037,.037,.006,'blk2',{r:.015}))]);
  // fins on both sides of the barrel (they swing out at the back), a violet line under each
  for(const s of [-1,1]){T(s<0?'fL':'fR',[Pt(s*.0315,BY,-.171,.005,.036,.13,'blk2',{r:.002}),Pt(s*.0345,BY,-.171,.002,.03,.11,'steel'),
      Pt(s*.0352,BY+.011,-.2,.0025,.004,.05,'blk2'),Pt(s*.0352,BY-.011,-.2,.0025,.004,.05,'blk2')]);A([Pt(s*.0294,BY,-.171,.0008,.022,.11,'jnGlow')])}
  // the mask on the frame: a dark head with a silver face plate front and back — one looks back at the shooter, one ahead — a V of a brow
  // over slanted eye slits, a nose ridge, a thin mouth, cheek guards; a fin along the crown
  A([Pt(0,MY,MZ,.026,.026,.026,'blk',{r:.008}),Pt(0,.1045,MZ,.02,.012,.024,'blk2',{r:.004}),...[1,-1].map(s=>Pt(s*.0142,MY+.003,MZ,.004,.016,.022,'blk2',{ry:s*.2,rz:-s*.25,r:.0015})),
    ...[1,-1].flatMap(f=>{const z=MZ+f*.0142;return [Pt(0,MY-.001,z,.03,.032,.003,'chrome',{r:.004}),Pt(0,MY-.018,z,.016,.006,.003,'chrome',{r:.002}),
      ...[1,-1].flatMap(s=>[Pt(s*.0072,MY+.0085,z+f*.0018,.015,.0035,.0016,'blk2',{rz:-s*.38}),Pt(s*.0074,MY+.002,z+f*.0016,.0105,.0042,.0012,'muzzle',{rz:-s*.26}),
        Pt(s*.0128,MY-.008,z+f*.0016,.0035,.012,.0012,'blk2',{rz:s*.15})]),
      Pt(0,MY-.002,z+f*.0018,.0035,.011,.0016,'bright'),Pt(0,MY-.0125,z+f*.0016,.011,.0018,.0012,'muzzle')]}),
    Pt(0,MY+.0165,MZ,.005,.004,.03,'jnGlow')]);
  T('eye',[1,-1].flatMap(f=>{const z=MZ+f*.0162;return [1,-1].map(s=>Pt(s*.0074,MY+.002,z,.0095,.003,.0012,'jnGlow',{rz:-s*.26}))}));
  T('crest',[Pt(0,MY+.018,MZ,.007,.007,.034,'blk2',{r:.002}),Pt(0,MY+.0215,MZ,.0035,.0015,.03,'brass'),Pt(0,MY+.0225,MZ-.011,.004,.004,.011,'blk2')]);
  // the hammer (cocked at rest)
  T('aux',[Pt(0,.088,.045,.012,.03,.01,'steel',{r:.003}),Pt(0,.104,.047,.016,.007,.016,'steel',{r:.002}),Pt(0,.1045,.047,.017,.002,.017,'blk')]);
  // the grip (dark inlays down its sides), the trigger guard and trigger
  A([Pt(0,-.046,.02,.036,.1,.05,'grip2',{rx:.24,r:.01}),Pt(0,-.096,.032,.038,.012,.054,'blk',{rx:.24,r:.004}),...[1,-1].map(s=>Pt(s*.0182,-.045,.02,.0016,.064,.012,'muzzle',{rx:.24})),
    Pt(0,-.032,-.04,.007,.005,.07,'blk2'),Pt(0,-.019,-.073,.007,.03,.007,'blk2'),Pt(0,-.021,-.034,.005,.02,.007,'steel',{rx:.25})]);
  // violet inlays (lit in the signal and the form): down the grip, along the frame
  T('gl',[...[1,-1].map(s=>Pt(s*.0196,-.045,.02,.0012,.058,.008,'jnGlow',{rx:.24})),...[1,-1].map(s=>Pt(s*.0232,.0085,-.035,.0012,.003,.1,'jnGlow'))]);
  // the charge: five pips on the left of the frame (the side the first-person view sees) light one by one with the blasts that hit
  for(let i=1;i<=5;i++){const z=-.09+i*.017;A([Pt(-.0228,-.003,z,.0016,.009,.011,'muzzle')]);T('h'+i,[Pt(-.0238,-.003,z,.0012,.007,.009,'jnGlow')])}
  return P}
const JN_G={grip:[0,-.02,.005],sup:[-.012,-.055,.014],muzzle:[0,JN_BY,-.275],mag:[0,JN_CY,JN_CZ],eject:[.02,.06,-.03]};
GUNS.janus1=Object.assign({parts:jnParts('vm'),piv:JN_PIV,wid:'janus1n'},JN_G);// the first-person model; everything in the world uses janus1n / s / b
GUNS.janus1n=Object.assign({parts:jnParts('n')},JN_G);GUNS.janus1s=Object.assign({parts:jnParts('s')},JN_G);GUNS.janus1b=Object.assign({parts:jnParts('b')},JN_G);
// the grenades: a dark shell with a violet nose; the JANUS form's are all light
GUNS.jnnade={parts:[Pt(0,0,0,.04,.04,.06,'gunmetal',{r:.016}),Pt(0,0,-.035,.034,.034,.016,'jnGlow',{r:.012}),Pt(0,0,.034,.032,.032,.008,'brass',{r:.01})],grip:[0,0,0],muzzle:[0,0,0]};
GUNS.jnorb={parts:[Pt(0,0,0,.05,.05,.07,'jnGlow',{r:.022}),Pt(0,0,0,.034,.034,.1,'jnGlow',{r:.014})],grip:[0,0,0],muzzle:[0,0,0]};
// (a model may name the world model that stands in for it: wid)
{const gg=gunGeo;gunGeo=function(id){const G=GUNS[id];return gg(G&&G.wid?G.wid:id)}}

// ---------- stats ----------
WPN.janus1={slot:2,kind:'pistol',n:['JANUS-1','JANUS-1'],cost:6000,mag:5,res:0,noRel:1,supOnly:1,jn:'janus1',dmg:JN.DMG,rpm:JN.RPM,semi:1,proj:'jn',alt:'janus',
  spread:[.004,.02,.06],rec:[.08,.02],kb:JN.KB,stag:JN.STAG,hs:1,reload:1,draw:.7,speed:.97,snd:'jnfire',model:'janus1',hold:'pistol',kickX:[1.15,3,.65]};
// the JANUS form fires these (unlimited, lighter kick)
JN.WB=Object.assign({},WPN.janus1,{proj:'jnb',noMag:1,snd:'jnfireb',rec:[.026,.012],spread:[.006,.022,.05],kickX:[.5,1.25,.35]});
// what differs between the JANUS weapons: the form's round (wb), the sounds of opening / the form coming on / closing, the first-person
// clips, the bursts, the light while open (lit) and its sparks, the view model's glow in the form (mz), a crosshair class (cx), the
// flash of a shot in the form (bfx) and the puff after a normal one (sfx), what closing lets off (cfx)
const JNW={janus1:{wb:JN.WB,sOpen:'jnopen',sOn:'jnon',sClose:'jnclose',open:()=>jnOpenClip(),close:()=>jnCloseClip(),burst:(x,y,z,s)=>jnBurst(x,y,z,s),
  lit:'#9a50ff',spark:[.8,.5,1],mz:[1.2,.5,2.4],cx:'',
  bfx(a){const mz=muzzleWorld(a),me=a.isPlayer&&!G.spec;FX.spawn({x:mz.x,y:mz.y,z:mz.z,life:.07,s0:me?.22:.4,s1:me?.38:.7,r:.75,g:.4,b:1,a:1,f:14,add:1});if(a.isPlayer)VM.U.uMuzzle.value.setRGB(.9,.4,1.8)},
  sfx(a){const mz=muzzleWorld(a);for(let i=0;i<5;i++)FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:rr(-.4,.4),vy:rr(.2,.9),vz:rr(-.4,.4),life:rr(.6,1.1),s0:.06,s1:rr(.25,.4),r:.58,g:.56,b:.62,a:.35,f:2,drag:2})},
  cfx(a,mz){for(let i=0;i<14;i++)FX.spawn({x:mz.x+rr(-.08,.08),y:mz.y+rr(-.04,.06),z:mz.z+rr(-.08,.08),vx:rr(-.5,.5),vy:rr(.4,1.4),vz:rr(-.5,.5),life:rr(.6,1.2),s0:.05,s1:rr(.25,.45),r:.86,g:.84,b:.92,a:.4,f:2,drag:2})}}};
// the JANUS weapon an id is (its JNW entry), the one in the hands, the one this actor's state belongs to
const jnW=id=>{const W=id&&WPN[id];return W&&W.jn?JNW[W.jn]||null:null};
const jnHeld=a=>!!(a&&jnW(a.cur));
const jnC=a=>jnW(a.cur)||JNW[a.jnWid]||JNW.janus1;
// the grenades: whose they are, how fast they leave, the model they fly as (B = the form's)
const JNP={jn:{w:'janus1',sp:JN.SPD,mdl:'jnnade'},jnb:{w:'janus1',sp:JN.BSPD,mdl:'jnorb',B:1}};
VM_POS.janus1={p:[.145,-.175,-.44],r:[.03,.48,.26]};
BUY_MENU.find(c=>c.k==='pistol').items.push('janus1');
// first draw: the drum swiped round under the thumb, the hammer cocked; a flicker in the eyes
GUN_DESIGN.janus1={mag:5,ch:0,act:'janus',x:.9};WPN.janus1.fd=GUN_DESIGN.janus1;WPN.janus1.ch=0;
FDS.janus=function(P,G,m,L){const cyL=[-.046,JN_CY-.005,JN_CZ],hm=[0,.106,.05];
  return {
    G:[K6(0),K6(.08,.004,-.006,0,-.03,-.06,.05),K6(.2,-.035,.035,-.012,.14,.5,.12),K6(.5,-.036,.037,-.012,.15,.52,.13),K6(.6,-.03,.042,-.01,.2,.42,.05),
       K6(.72,-.032,.04,-.012,.16,.46,.1),K6(.88,.004,-.004,.002,-.012,-.02,.02),K6(1)],
    H:{A:[{sup:1},{tag:'cyl',at:cyL,ride:0},{p:hm}],k:[HK(0,0),HK(.06,0),
       HK(.16,1,[-.03,-.04,.015],.7,[-1,-.3,0],.3),HK(.24,1,[-.016,-.012,0],1,[-1,-.1,0],.3),HK(.3,1,[-.014,.034,.004],1,[-1,.3,0],.1),// a swipe up the drum
       HK(.42,1,[-.04,.03,.02],.85,[-1,.2,0],.35),HK(.52,2,[-.012,.03,.014],1,[-.3,1,.2],.4),HK(.6,2,[-.002,.01,.008],1,[-.3,1,.2],.65),// the thumb rides the hammer back
       HK(.68,2,[-.02,.04,.025],.9,[-.3,1,.2],.3),HK(.84,0),HK(1,0)]},
    parts:[{tag:'aux',ch:'rx',k:[[0,-JN_COCK],[.52,-JN_COCK],[.6,0,1],[1,0]]}],
    spins:[{tag:'cyl',ch:'rz',kick:[[.3,-24]],fric:2.4,stop:.5,snap:TAU/5},{tag:'cg',ch:'rz',kick:[[.3,-24]],fric:2.4,stop:.5,snap:TAU/5}],
    E:[[.3,'cylspin',.75,1.2],[.5,'dry',.5,1.1,[.04,-.1,0]],[.6,'dry',.65,.75,[.06,-.25,0]],[.66,'jnsig',.18,1.7]],
    C:[[0,0,0,0],[.2,.008,.006,.01],[.6,.01,.004,.008],[.9,0,0,0],[1,0,0,0]]}};

// ---------- the state ----------
// jnH counts (owner), jnS signal s, jnO opening s, jnB form s, jnC closing s (visual), jnLeft rounds left when it last left the hands
const jnForm=a=>a.jnO>0||a.jnB>0;
// how far the shells are open (0..1): they burst open at 40 % of the opening with an overshoot, ease shut while it closes
function jnEaseBack(x){const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)}
function jnOpenK(a){const C=jnC(a);if(C.openK)return C.openK(a);if(a.jnO>0){const u=1-a.jnO/JN.OPEN;return u<.4?0:jnEaseBack(clamp((u-.4)/.42,0,1))}if(a.jnB>0)return 1;
  if(a.jnC>0){const u=1-a.jnC/JN.CLOSE;return 1-smooth(clamp((u-.1)/.55,0,1))}return 0}
// how long the opening and the closing take (v6.68: a JANUS weapon may set its own, oT / cT)
const jnOT=a=>jnC(a).oT||JN.OPEN,jnCT=a=>jnC(a).cT||JN.CLOSE;
function jnReset(a){a.jnH=0;a.jnS=0;a.jnO=0;a.jnB=0;a.jnC=0;if(a.jnL){a.jnL.dead=true;a.jnL=null}}
// the page that runs this human (its own page, or the host / a solo game for bots)
const jnOwn=a=>!a.pup;
function jnSend(a,st){if(NET.on)netFxPush(['jn',a.id,st])}
function jnAt(a,snd,vol,rate){if(a.isPlayer)AU.play(snd,{vol,rate:rate||1});else AU.at(snd,a.c.x,a.c.y+1.3,a.c.z,{vol,rate:rate||1,range:45})}
// a blast that caught someone (the shooter's page)
function jnScore(a){if(!a||a.team!==TH||!a.alive||a.jnS>0||jnForm(a))return;a.jnH=Math.min(JN.N,(a.jnH|0)+1);
  if(a.isPlayer&&a.jnH<JN.N)AU.play('jncyc',{vol:.35,rate:1.5+a.jnH*.1});if(a.jnH>=JN.N)jnSignal(a)}
function jnSignal(a){a.jnH=JN.N;a.jnS=JN.SIG;jnSigFx(a);jnSend(a,1);
  if(a.isPlayer)HUD.note(LI()?`JANUS signal! Right click to open it (${JN.SIG}s)`:`JANUS 시그널! 우클릭으로 변신 (${JN.SIG}초)`,2.6)}
function jnSigFx(a){jnAt(a,'jnsig',.8);if(a.isPlayer){VM.sp.rz.v+=.7;VM.sp.py.v+=.12}}
// right click (own page): open it
function jnAlt(a){if(NET.ghost||!jnOwn(a))return;if(jnForm(a)||a.jnC>0)return;
  if(!(a.jnS>0)){if(a.isPlayer&&!AU.throttle('jnno',700)){HUD.note(LI()?`JANUS — ${a.jnH|0} / ${JN.N} hits`:`JANUS — 적중 ${a.jnH|0} / ${JN.N}`,1.2);AU.play('dry',{vol:.4,rate:1.3})}return}
  if(a.drawT>0||a.fmKd>0||a.grabT>0)return;jnOpen(a)}
function jnOpen(a){a.jnS=0;a.jnO=jnOT(a);a.jnB=0;a.jnC=0;a.jnH=0;jnSend(a,2);jnOpenFx(a)}
function jnOpenFx(a){const C=jnC(a);jnAt(a,C.sOpen,.85);if(a.isPlayer){try{VM.playClip(C.open(),0,C.oT||JN.OPEN,'jn')}catch(e){console.error(e)}}}
// the opening is over: the form is on (C.calm: no burst of light, no kick, no shake — v6.68, the Dick gun's sheet)
function jnBStart(a){const C=jnC(a);a.jnB=JN.B;if(C.sOn)jnAt(a,C.sOn,.85);if(!C.calm&&!(a.isPlayer&&!G.spec)){const mz=muzzleWorld(a);C.burst(mz.x,mz.y,mz.z,1)}// (the player sees it on the view model)
  if(a.isPlayer){if(!C.calm){VM.U.uMuzzle.value.setRGB(C.mz[0],C.mz[1],C.mz[2]);VM.sp.pz.v+=.45;VM.sp.rx.v-=.8;FX.shake=Math.max(FX.shake,.3)}
    HUD.note(LI()?`JANUS — ${JN.B}s of grenades without limit, hold to fire`:`JANUS 모드 — ${JN.B}초간 유탄 무한 연사 (꾹 누르기)`,2)}}
// it closes (its time is up, or it was put away): every page, own pages tell the rest; was = it was open (or opening) until now
function jnClose(a,own,was){a.jnB=0;a.jnO=0;a.jnH=0;if(own)jnSend(a,0);if(!was)return;
  if(jnHeld(a)&&a.alive){const C=jnC(a);a.jnC=jnCT(a);jnAt(a,C.sClose,.8);C.cfx(a,muzzleWorld(a));
    if(a.isPlayer){a.nextFire=Math.max(a.nextFire,G.t+a.jnC*.9);try{VM.playClip(C.close(),0,a.jnC,'jn')}catch(e){console.error(e)}}}}
// another page's state change
function jnRemote(a,st){if(!a||a.team!==TH)return;if(st===1){a.jnS=JN.SIG;a.jnO=a.jnB=a.jnC=0;jnSigFx(a)}else if(st===2){a.jnS=0;a.jnO=jnOT(a);a.jnB=0;a.jnC=0;jnOpenFx(a)}else{jnClose(a,false,a.jnB>0||a.jnO>0);a.jnS=0}}
// a violet burst (the form opening, a JANUS blast)
function jnBurst(x,y,z,s){FX.spawn({x,y,z,life:.2,s0:.3*s,s1:1.8*s,r:.75,g:.4,b:1,a:.85,f:14,add:1});FX.spawn({x,y,z,life:.1,s0:.25*s,s1:.6*s,r:1,g:.85,b:1,f:1,add:1});
  for(let i=0;i<10;i++){const g=Math.random()*TAU,e=rr(-.5,1),sp=rr(1.5,4)*s;FX.spawn({x,y,z,vx:Math.cos(g)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(g)*Math.cos(e)*sp,life:rr(.2,.4),s0:.06,s1:.01,r:.8,g:.5,b:1,f:11,add:1,grav:2})}
  DL.add(x,y,z,'#a55cff',5*s,2,.18)}

// the zombie a human bot has in its sights (ai.js B.seen)
const jnBotSees=a=>{const B=a.bot,s=B&&B.seen;return s&&s.a&&s.a.alive?s.a:null};
// ---------- every frame ----------
function jnTick(a,dt){const own=jnOwn(a);
  if(!a.alive||a.team!==TH){if(a.jnS||a.jnO||a.jnB||a.jnH||a.jnC||a.jnL)jnReset(a);return}
  // the state belongs to the JANUS weapon in the pistol slot: another one there (JANUS-1 ↔ JANUS-2) starts the count again
  const sid=a.inv&&jnW(a.inv[2])?a.inv[2]:null;
  if(sid&&a.jnWid&&sid!==a.jnWid&&own){if(jnForm(a))jnClose(a,true,true);else if(a.jnS>0)jnSend(a,0);a.jnH=0;a.jnS=0}
  if(sid)a.jnWid=sid;
  if(a.jnS>0){a.jnS=Math.max(0,a.jnS-dt);if(a.jnS<=0&&own){a.jnH=0;jnSend(a,0);if(a.isPlayer)HUD.note(LI()?'The JANUS signal faded':'JANUS 시그널이 사라졌어요',1.6)}}
  if(a.jnO>0){a.jnO-=dt;if(own&&!jnHeld(a))jnClose(a,true,true);else if(a.jnO<=0){a.jnO=0;jnBStart(a)}}
  if(a.jnB>0){a.jnB-=dt;if(own&&!jnHeld(a))jnClose(a,true,true);else if(a.jnB<=0)jnClose(a,own,true)}
  if(a.jnC>0)a.jnC=Math.max(0,a.jnC-dt);
  // the rounds it holds and its spares (a refill shows up as more), so putting it down and taking a new one does not fill it again
  const am=sid&&a.ammo&&a.ammo[sid];if(am)(a.jnLeft||(a.jnLeft={}))[sid]=[am.mag,am.res|0];
  // the world model: shut / signal / open (with a burst when it changes, unless C.calm), and a light while it is open (C.lit)
  const hid=jnHeld(a)?a.cur:'',C=jnC(a),fm=hid&&hid+(jnOpenK(a)>.5?'b':a.jnS>0||a.jnO>0?'s':'n');
  if(fm!==a.jnFm){if(a.jnFm&&fm&&a.gun&&!C.calm&&!(a.isPlayer&&!G.spec)){const mz=muzzleWorld(a);C.burst(mz.x,mz.y,mz.z,.6)}a.jnFm=fm}
  if(hid&&C.lit&&jnOpenK(a)>.05){const mz=muzzleWorld(a),s=C.spark;if(!a.jnL)a.jnL=DL.add(mz.x,mz.y,mz.z,C.lit,4,1.3,0,{flick:.18});a.jnL.x=mz.x;a.jnL.y=mz.y;a.jnL.z=mz.z;
    if(!(a.isPlayer&&!G.spec)&&Math.random()<dt*14)FX.spawn({x:mz.x+rr(-.05,.05),y:mz.y+rr(-.05,.05),z:mz.z+rr(-.05,.05),vy:rr(.1,.4),life:rr(.15,.3),s0:.05,s1:.01,r:s[0],g:s[1],b:s[2],f:11,add:1})}
  else if(a.jnL){a.jnL.dead=true;a.jnL=null}
  // a bot with the signal takes it out again (its last grenade emptied it) and opens it as soon as there is a zombie to use it on
  if(own&&a.bot&&!a.isPlayer&&a.jnS>0){const t=jnBotSees(a),near=t&&Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)<28;
    if(near&&!jnHeld(a)&&sid&&WPN[a.cur]&&WPN[a.cur].kind!=='nade')equip(a,sid);else if(near&&jnHeld(a)&&a.drawT<=0&&!(a.reloadT>0))jnOpen(a)}}

// ---------- the grenades ----------
function jnProj(a,eye,dir,kind){const P=JNP[kind],sp=P.sp;
  const n={kind,owner:a,w:P.w,x:eye.x+dir.x*.55,y:eye.y+dir.y*.55-.06,z:eye.z+dir.z*.55,vx:dir.x*sp,vy:dir.y*sp+.5,vz:dir.z*sp,t:0,mesh:null,spin:0,hit:new Set(),upd:PROJ_UPD[kind]};
  const m=new THREE.Mesh(gunGeo(P.mdl),matGun());m.position.set(n.x,n.y,n.z);m.lookAt(n.x+n.vx,n.y+n.vy,n.z+n.vz);R.scene.add(m);n.mesh=m;NADES.push(n);
  NET.on&&netFxPush(['p',a.id,WI[P.w],kind,r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)]);return n}
function jnUpd(n,dt){const r=projStep(n,dt,GRAV*.35,(n)=>{jnBoom(n);return 'kill'},(n)=>{jnBoom(n);return 'kill'});if(r==='kill')return true;
  if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.lookAt(n.x+n.vx,n.y+n.vy,n.z+n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
  if(n.kind==='jnb'){FX.spawn({x:n.x,y:n.y,z:n.z,life:.09,s0:.28,s1:.1,r:.72,g:.38,b:1,a:.8,f:14,add:1});if(Math.random()<.5)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.4,.4),vy:rr(-.2,.4),vz:rr(-.4,.4),life:rr(.12,.25),s0:.05,s1:.01,r:.85,g:.55,b:1,f:11,add:1})}
  else{if(Math.random()<.6)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.2,.2),vy:rr(-.1,.3),vz:rr(-.2,.2),life:rr(.4,.8),s0:.08,s1:.35,r:.6,g:.58,b:.64,a:.35,f:2,drag:2});
    if(Math.random()<.4)FX.spawn({x:n.x,y:n.y,z:n.z,life:.06,s0:.08,s1:.02,r:.8,g:.5,b:1,f:11,add:1})}
  if(n.t>6||n.y<-10){jnBoom(n);return true}return false}
// the blast: the grenade launcher's (weapons.js detonate 'gl': radius, damage and push from the round, the coffins' and chapters' hooks too),
// a violet flash over it; one count toward the signal if it caught anyone (the shooter's page, normal rounds only)
function jnBoom(n){const B=n.kind==='jnb',sc=G.mode==='scen'?JN.SCEN:1;
  const g={kind:'gl',owner:n.owner,w:'janus1',x:n.x,y:n.y,z:n.z,ghost:!!n.ghost,jw:'janus1',R:JN.R,dmg:(B?JN.BDMG:JN.DMG)*sc,kb:B?JN.BKB:JN.KB,stag:B?JN.BSTAG:JN.STAG,up:B?JN.BUP:JN.UP,he:1,
    vol:B?.6:.85,rate:B?1.35:1.12,shk:B?.55:1};
  detonate(g);jnBurst(n.x,n.y,n.z,B?.9:1.2);
  if(!n.ghost&&!NET.ghost&&!B&&g.hitN>0)jnScore(n.owner)}
PROJ_UPD.jn=jnUpd;PROJ_UPD.jnb=jnUpd;
{const np0=nyProj;nyProj=function(a,W,eye,dir,kind){if(JNP[kind])return jnProj(a,eye,dir,kind);return np0(a,W,eye,dir,kind)}}

// ---------- first-person clips ----------
// opening: the gun is raised, muzzle up, a beat — then snapped down level and stopped dead: the shells burst apart on the snap (driven by
// jnOpenK), the gun bucks and settles with a tremble
function jnOpenClip(){
  return {G:[K6(0),K6(.18,0,.02,.03,.42,.06,-.12),K6(.32,0,.025,.035,.48,.07,-.14),[.4,.004,-.012,-.025,-.16,.02,.05,1],K6(.5,.002,-.004,-.012,-.05,0,.02),
      K6(.66,0,.003,0,.03,0,-.01),K6(1)],
    E:[[.12,'jncyc',.4,.8],[.4,'',0,0,[.18,-.9,.15,.16],[.016,0,.006]]],vib:[[0,0],[.4,0],[.44,.004],[.7,.0015],[1,0]],
    C:[[0,0,0,0],[.3,.012,0,-.006],[.42,-.02,0,.008],[.7,0,0,0],[1,0,0,0]]}}
// closing: it rocks as the shells clamp shut
function jnCloseClip(){return {G:[K6(0),K6(.18,-.004,.008,.004,.06,-.02,.08),K6(.45,.002,-.006,0,-.06,0,-.04),K6(.6,0,.002,0,.02,0,.01),K6(1)],
    E:[[.46,'',0,0,[.1,.35,0],[.006,0,0]]],C:[[0,0,0,0],[.2,.004,0,.006],[.5,-.006,0,0],[1,0,0,0]]}}
// every frame on the view model: the drum and hammer after each shot, the shells, fins and crest, the lights
VMX.janus1=function(V,a,dt,o,m){const T=m.tags;
  if(V.jnSN!==(a.jnShots|0)){if(V.jnSN!=null&&(a.jnShots|0)>V.jnSN){V.jnCT=(V.jnCT||0)-TAU/5;V.jnHm=0;V.jnClk=0}V.jnSN=a.jnShots|0}
  const fast=a.jnB>0;V.jnHm=Math.min(1,(V.jnHm==null?1:V.jnHm)+dt/(fast?.16:.32));const hu=V.jnHm,cock=hu<.25?0:smooth((hu-.25)/.75);
  if(hu>.25){V.jnCA=(V.jnCA||0)+((V.jnCT||0)-(V.jnCA||0))*Math.min(1,dt*(fast?32:15));if(!V.jnClk&&!fast){V.jnClk=1;AU.play('jncyc',{vol:.4})}}
  if(T.cyl)T.cyl.rotation.z+=V.jnCA||0;if(T.cg)T.cg.rotation.z+=V.jnCA||0;if(T.aux)T.aux.rotation.x+=JN_COCK*cock;
  const k=jnOpenK(a);
  if(k){if(T.bU)T.bU.position.y+=JN_OPEN_Y*k;if(T.bD)T.bD.position.y-=JN_OPEN_Y*k;if(T.fL)T.fL.rotation.y-=JN_FIN*k;if(T.fR)T.fR.rotation.y+=JN_FIN*k;if(T.crest)T.crest.position.y+=JN_CREST*k}
  const sig=a.jnS>0,form=jnForm(a)||a.jnC>0,since=JN.SIG-(a.jnS||0),blink=!sig||since>.5||Math.sin(since*40)>0;
  if(T.eye)T.eye.visible=sig&&blink||form&&k>.1;
  const hn=sig||form?JN.N:Math.min(JN.N,a.jnH|0);for(let i=1;i<=JN.N;i++){const t=T['h'+i];if(t)t.visible=i<=hn&&(!sig||Math.sin(V.t*6+i*.7)>-.6)}
  if(T.cg)T.cg.visible=k>.3;if(T.gl)T.gl.visible=sig||k>.05;
  if(k>.02){const u=V.U.uMuzzle.value,p=(.4+.15*Math.sin(V.t*13))*k;u.r=Math.max(u.r,.6*p);u.g=Math.max(u.g,.22*p);u.b=Math.max(u.b,1.1*p)}
  V.flash.material.color.setHex(fast?0xcf9cff:0xffffff);
  if(fast){const j=.0009;o[0]+=rr(-j,j);o[1]+=rr(-j,j);o[5]+=rr(-j,j)*3}};
// (the muzzle flash goes back to its own colour on any other gun)
{const vs=VM.set;VM.set=function(id,skin){vs.call(this,id,skin);if(this.flash&&!jnW(id))this.flash.material.color.setHex(0xffffff)}}

// ---------- HUD: the crosshair, a ring of five round it (the charge; the signal; the form's time), ∞ in the form ----------
function jnHud(){const P=G.player,hud=$('hud');if(!P||!hud)return;const W=WPN[P.cur],live=!!(P.alive&&P.team===TH&&!G.spec&&G.st!=='menu'&&W&&W.jn);
  const sig=live&&P.jnS>0,B=live&&jnForm(P),cr=HUD.el.cross,cx=(live&&jnW(P.cur)||{}).cx||'';
  if(cr){if(cr.classList.contains('jn')!==!!(sig||B))cr.classList.toggle('jn',!!(sig||B));if(cr.classList.contains('jnb')!==!!B)cr.classList.toggle('jnb',!!B);
    for(const k in JNW){const c=JNW[k].cx;if(c&&cr.classList.contains(c)!==(cx===c))cr.classList.toggle(c,cx===c)}}
  let rg=$('jnRing');if(live&&!rg){rg=document.createElement('div');rg.id='jnRing';rg.innerHTML='<svg viewBox="0 0 60 60"><circle class="tr" cx="30" cy="30" r="24"/><circle class="pg" cx="30" cy="30" r="24"/></svg><b></b>';hud.appendChild(rg)}
  if(rg){const on=live&&!(P.zoom>0);rg.style.display=on?'block':'none';if(on){const pg=rg.querySelector('.pg'),b=rg.querySelector('b'),C=150.8,seg=C/5;
      const cls=(B?'b':sig?'sig':'')+(cx?' '+cx:'');if(rg.className!==cls)rg.className=cls;let da,off=0,s='';
      if(B){da=C+' '+C;off=P.jnO>0?0:C*(1-clamp(P.jnB/JN.B,0,1));s='∞'}
      else{const n=sig?JN.N:Math.min(JN.N,P.jnH|0);da=n?Array(n).fill((seg-4).toFixed(2)+' 4').join(' ')+' 0 '+C:'0 '+C;if(sig)s=Math.ceil(P.jnS)+''}
      if(pg.getAttribute('stroke-dasharray')!==da)pg.setAttribute('stroke-dasharray',da);const os=off.toFixed(1);if(pg.getAttribute('stroke-dashoffset')!==os)pg.setAttribute('stroke-dashoffset',os);
      if(b.textContent!==s)b.textContent=s}}
  if(B){const m=HUD.el.hMag;if(m&&m.textContent!=='∞'){m.textContent='∞';m.className=''}}
  // touch: the aim button turns into the transform button while the signal is up
  if(typeof TOUCH!=='undefined'&&TOUCH.el){const bt=TOUCH.el.querySelector('.tAlt');if(bt&&bt.classList.contains('jn')!==!!sig){bt.classList.toggle('jn',!!sig);const em=bt.querySelector('em');if(em)em.textContent=sig?(LI()?'JANUS':'변신'):(LI()?'AIM':'조준')}
    if(bt)for(const k in JNW){const c=JNW[k].cx;if(c&&bt.classList.contains(c)!==(sig&&cx===c))bt.classList.toggle(c,!!(sig&&cx===c))}}}
// the weapon name: the charge, the signal's time, the form's time
function jnTag(P){if(jnForm(P))return LI()?` · JANUS ∞ ${Math.max(0,P.jnB).toFixed(1)}s`:` · JANUS ∞ ${Math.max(0,P.jnB).toFixed(1)}초`;
  if(P.jnS>0)return LI()?` · JANUS ready (right click) ${Math.ceil(P.jnS)}s`:` · JANUS 준비 (우클릭) ${Math.ceil(P.jnS)}초`;
  const n=Math.min(JN.N,P.jnH|0);return ' · '+'◆'.repeat(n)+'◇'.repeat(JN.N-n)}

// ---------- hooks ----------
(function(){
  // right click
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='janus'){jnAlt(a);return}return na(a,W)};
  // the JANUS form fires its own rounds (every page: a remote shot is replayed with the form's sound and flash too)
  const fg=fireGun;fireGun=function(a,W){const C=W&&W.jn&&W===WPN[W.jn]?JNW[W.jn]:null;if(!C)return fg(a,W);a.jnShots=(a.jnShots|0)+1;
    if(a.jnB>0){fg(a,C.wb);C.bfx(a);return}
    fg(a,W);C.sfx(a)};
  // the JANUS form: full-auto while the trigger is held (touch included), no magazine to run dry; nothing fires while it opens or closes
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.team!==TH||!jnHeld(a)||!a.alive)return aw(a,dt);
    if(a.jnO>0||a.jnC>0){a.cmd.fire=false;return aw(a,dt)}
    if(!(a.jnB>0))return aw(a,dt);
    const am=a.ammo[a.cur];if(!am)return aw(a,dt);const m0=am.mag,lf=a.lastFire;am.mag=Math.max(1,m0);a.pc.fire=false;
    try{return aw(a,dt)}finally{am.mag=m0;if(a.lastFire!==lf)a.nextFire=G.t+60/JN.BRPM}};
  // the five rounds come from supplies only: the buy menu's ammo passes it by, buying the one in hand does nothing
  const hide=(a,f)=>{const S={};for(const k in a.ammo){const W=WPN[k];if(W&&W.supOnly){S[k]=a.ammo[k];delete a.ammo[k]}}try{return f()}finally{Object.assign(a.ammo,S)}};
  const bc=buyCheck;buyCheck=function(a,id){if(id==='ammo'&&a&&a.ammo)return hide(a,()=>bc(a,id));const W=WPN[id];if(W&&W.supOnly&&a&&a.inv&&a.inv[W.slot]===id&&a.team===TH&&a.alive)return 'own';return bc(a,id)};
  const b0=buy;buy=function(a,id,force,o){if(id==='ammo'&&a&&a.ammo)return hide(a,()=>b0(a,id,force,o));const W=WPN[id];if(W&&W.supOnly&&a&&a.inv&&a.inv[W.slot]===id)return force?true:b0(a,id,force,o);return b0(a,id,force,o)};
  // taken again in the same round: the rounds it had (and the spares), not a full drum
  const fa=fillAmmo;fillAmmo=function(a,id){fa(a,id);const L=a.jnLeft&&a.jnLeft[id],A=a.ammo&&a.ammo[id];
    if(L&&A&&jnW(id)){A.mag=Math.min(A.mag,L[0]);A.res=Math.max(A.res|0,Math.min(L[1]|0,WPN[id].mag))}};
  // a fresh round: everything starts again (before the loadouts are handed back)
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){jnReset(a);a.jnLeft=null}};
  // the world model in the hand: shut / signal / open
  const eg=ensureGun;ensureGun=function(a){if(!jnHeld(a)||a.team!==TH||!a.ch)return eg(a);const want=a.cur+(jnOpenK(a)>.5?'b':a.jnS>0||a.jnO>0?'s':'n');if(a.gunId===want)return;
    if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!a.gunMat)a.gunMat=matGun();
    const m=new THREE.Mesh(gunGeo(want),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}};
  // the state from other pages
  const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='jn'){if(a&&!a.isPlayer&&G.actors.includes(a))jnRemote(a,f[2]|0);return}return nd(a,f)};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st==='menu'||G.st==='over')return;for(const a of G.actors)try{jnTick(a,dt)}catch(e){console.error(e)}};
  const hu0=HUD.update;HUD.update=function(dt){hu0.call(this,dt);try{jnHud()}catch(e){console.error(e)}};
  const ct=cmbTag;cmbTag=function(P,W){return ct(P,W)+(W&&W.jn&&P&&P.team===TH?jnTag(P):'')};
  // bots: they keep it in hand while it is open (its drum reads empty) or about to be, and fire it at what they see
  const eq=equip;equip=function(a,id,instant){if(a&&a.bot&&!a.isPlayer&&jnHeld(a)&&id!==a.cur&&a.team===TH&&a.alive&&(a.jnO>0||a.jnB>0||a.jnS>0&&jnBotSees(a))&&WPN[id]&&WPN[id].kind!=='claw')return;return eq(a,id,instant)};
  const au=AI.update.bind(AI);AI.update=function(a,dt){au(a,dt);if(a.team===TH&&jnHeld(a)&&a.jnB>0&&a.bot&&jnBotSees(a)&&a.bot.lof)a.cmd.fire=true};
  // bots: now and then one carries it as its sidearm
  const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.07)L[2]='janus1';return L};
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // a deep pop of the launcher, the drum's steel ringing after it, a faint violet shimmer
  jnfire:{n:3,dur:1.2,ch:2,peak:.95,gain:.9,rev:.14,poly:3,pj:.03,fn:B=>{glFn(B);B.ring(.004,rr(900,1000),[1,2.7,4.1],[.16,.09,.05],[.25,.12,.06]);
    const e=B.env(.02,.05,.12,.4);B.osc('sine',2400,3400,.02,.45,B.f('bandpass',3000,3,e))}},
  // the form: a shorter, harder thump with an electric zing
  jnfireb:{n:4,dur:.8,ch:2,peak:.9,gain:.82,rev:.1,poly:6,pj:.05,fn:B=>{const o=B.comp(-10,4,.002,.12,B.g(.95));
    {const e=B.env(0,.002,1,.12,B.sh(2.4,o));B.osc('sine',rr(150,170),60,0,.14,e)}{const e=B.env(0,.001,.7,.05,o);B.nz('brown',0,.07,B.f('lowpass',1100,.7,e))}
    {const e=B.env(0,.002,.45,.22,B.f('bandpass',1800,1.4,o));B.osc('sawtooth',rr(2200,2500),rr(380,420),0,.24,e)}B.grain(0,3600,2,.01,.3,o);
    {const e=B.env(.01,.02,.2,.3,B.f('highpass',2400,.7,o));B.nz('white',.01,.32,e)}}},
  // the signal: two glassy notes going up, a shimmer
  jnsig:{n:1,dur:1.3,peak:.8,gain:.6,rev:.25,fn:B=>{B.ring(0,880,[1,2,3.01],[.5,.3,.18],[.35,.16,.08]);B.ring(.13,1318,[1,2,3.02],[.7,.4,.22],[.4,.18,.08]);
    const e=B.env(.1,.25,.12,.6);B.osc('sine',2600,5200,.1,.8,e)}},
  // opening: the clasps letting go one after another, the shells driven apart, a rising hum into a deep whoomp
  jnopen:{n:1,dur:1.5,ch:2,peak:.9,gain:.8,rev:.18,fn:B=>{const o=B.comp(-12,4,.002,.2,B.g(.95));
    for(const [t,f] of [[.1,2600],[.14,2200],[.18,3000],[.21,1900],[.245,2400]]){B.grain(t,f,3,.012,.55,B.pan(rr(-.5,.5),o));B.ring(t,f*.42,[1,2.3],[.05,.03],[.18,.08],o)}
    {const e=B.env(0,.22,.5,.12,B.f('lowpass',1400,.8,o));B.osc('sawtooth',90,420,0,.36,e)}
    {const e=B.env(.25,.004,1,.5,B.sh(2,o));B.osc('sine',110,42,.25,.55,e)}{const e=B.env(.25,.02,.35,.7,B.f('bandpass',2200,1.2,o));B.nz('white',.25,.8,e)}
    {const e=B.env(.3,.1,.18,.7);B.osc('sine',1800,2600,.3,.8,e)}}},
  // the form is on: a low power swell under a violet shimmer
  jnon:{n:1,dur:1.2,ch:2,peak:.85,gain:.7,rev:.2,fn:B=>{const o=B.comp(-12,4,.003,.2,B.g(.9));{const e=B.env(0,.08,.8,.7,o);B.osc('sine',55,85,0,.8,e)}
    {const e=B.env(0,.15,.3,.7,B.f('lowpass',2000,.8,o));B.osc('sawtooth',160,320,0,.85,e)}for(const s of [-1,1]){const e=B.env(.05,.2,.12,.7,B.pan(s*.6,o));B.osc('sine',2900+s*40,3900+s*60,.05,.9,e)}}},
  // closing: two clanks as the shells clamp shut, a jet of steam, a falling tone
  jnclose:{n:1,dur:1.3,ch:2,peak:.85,gain:.75,rev:.16,fn:B=>{const o=B.comp(-12,4,.002,.2,B.g(.95));
    for(const t of [.0,.24]){B.grain(t,1800,2.2,.02,.6,o);B.ring(t,rr(700,800),[1,2.4,3.7],[.12,.07,.04],[.3,.12,.06],o);const e=B.env(t,.003,.5,.12,o);B.nz('brown',t,.15,B.f('lowpass',500,.7,e))}
    {const e=B.env(.26,.03,.4,.7,B.f('highpass',2600,.7,o));B.nz('white',.26,.8,e)}{const e=B.env(.05,.05,.15,.6);B.osc('sine',1500,500,.05,.65,e)}}},
  // the drum turning a fifth: two ratchet ticks
  jncyc:{n:2,dur:.25,peak:.6,gain:.35,poly:3,fn:B=>{B.grain(0,3800,3,.006,.6);B.grain(.045,3200,3,.006,.45);B.ring(.045,2100,[1,2.6],[.03,.02],[.12,.05])}}});
SFX_ORDER.push('jnfire','jnfireb','jnsig','jnopen','jnon','jnclose','jncyc');

'use strict';
// ============ v6.55: JANUS-2 — a holy sawed-off grenade pistol, a relic restored ============
// (v6.55.1: shown as 「이태훈 딕건」 / Lee Tae-hoon Dick Gun at the owner's word; the ids, the decoder line and the price row stay janus2)
// Built to the design sheet the player sent: its parts, points, colours, numbers, motions and sounds as written there. Small changes:
// the figure of Christ and its lit eyes stand out of the back of the sight (in the sheet they sat inside it, face flush with its back),
// a short bridge joins the sight to the barrel (in the sheet it floated over the frame), the golden inner barrel is a millimetre longer
// with a bore in its mouth (no flicker where it met the shroud's face), and Mary's figure (only named in the sheet) is drawn here: a blue
// veil, face and folded hands, gold rays round her head, lit eyes.
// One-handed (the sheet has no supporting hand): the free hand only comes up to put a grenade in on a reload.
// Five grenades and no spares: a supply crate (zombie modes) hands back the missing ones as spares, an ammo box (the chapters) half of
// them, and the break-open reload (1 s) puts them in — the barrel tips 45° on its hinge, the spent case flies back over the shoulder, a
// new grenade goes in, a flick of the wrist swings it shut. The buy menu's ammo and buying it again do not fill it (as JANUS-1).
// The JANUS form is JANUS-1's (janus.js): every blast that catches a zombie counts once, five give the signal, a right click within
// 35 s opens it for 5 s of grenades without limit, full-auto at 214 a minute. Opening: Christ sinks into the sight and Mary comes out
// of it, the outer barrel parts 1 cm to each side round the golden barrel, the thorns along it rise; the crosshair turns blue violet.
// Damage 80 a blast (×2.5 in the chapters, as JANUS-1), half of it still at the edge (the sheet's splash ×0.5); the sheet's 20 against
// people has nothing to hit (no friendly fire, the JANUS guns are not in PvP).

// ---------- atlas: the blue-grey steel, the gold, the green grip, the figures, the eyes' light ----------
// (these fill the weapon atlas: 128 of 128 slots)
const J2_MATS=['j2Blue','j2Gold','j2Green','j2Skin','j2Glow'];
for(const m of J2_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintJ2Atlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  // alpha: 248..254 a sheen on the world model (the sheet's gloss; lower would light itself in the view model), 255 matte, 232 self-lit
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // scratches: short light strokes at a slant, as many as the sheet's scratch asks
  const scr=(xx,y,s,k)=>hash2(Math.floor((xx+y*.4)/3),Math.floor(y/7),s)<k*.06;
  // brushed metal in the sheet's three tones (dark, mid, light): fine streaks over a slow cloud, a soft band of sheen
  const brushed=(c,s,k)=>(xx,y,X,Y)=>{const t=.5+(hash2(Math.floor(xx/24)+s,y,s)-.5)*.32+(nz(X,Y,s+1,22)-.5)*.75,b=Math.max(0,1-Math.abs(((y+xx*.3)%64)-32)/10);
    let o=t<.5?mix(c[0],c[1],clamp(t*2,0,1)):mix(c[1],c[2],clamp(t*2-1,0,1));o=mix(o,c[2],b*.3);if(scr(xx,y,s+2,k))o=lt(c[2],.15);return o};
  patch('j2Blue',brushed(['#1A2421','#2F3E3B','#4A5D59'],1701,.2),248);
  patch('j2Gold',brushed(['#B8860B','#DAA520','#FFD700'],1711,.1),251);
  // the grip: dark green with a grain running along it
  patch('j2Green',(xx,y,X,Y)=>{const g=Math.sin(xx*.35+nz(X,Y,1721,20)*7)*.5+.5,t=nz(X,Y,1722,10);let o=g>.72?'#2E493A':g<.3?'#1A2B22':'#243A2E';if(t>.66)o=lt(o,.06);
    if(scr(xx,y,1723,.2))o='#3C5A4A';return o});
  // the figures: carved and smooth, wheat to bisque
  patch('j2Skin',(xx,y,X,Y)=>{const t=nz(X,Y,1731,12)+(hash2(X,Y,1732)-.5)*.1;return t>.6?'#FFE4C4':t<.4?'#D2B48C':'#F5DEB3'});
  // the eyes' light: gold with white and pale yellow in it (gold reads against the pale figure)
  patch('j2Glow',(xx,y,X,Y)=>{const t=nz(X,Y,1741,10)+(hash2(X,Y,1742)-.5)*.2;return t<.3?'#FFFFFF':t<.45?'#FFFFCC':'#FFD700'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintJ2Atlas()}}

// ---------- the model ----------
// the sheet's hinge; in the form the outer barrel's halves part this far, the thorns rise this much; the figures sink this deep; the break
const J2={HINGE:[0,.02,-.07],SPREAD:.01,THORN:.5,SINK:.009,OPEN:.785};
// the four thorns (the sheet's thorn_r / thorn_l): tag, centre, tilt, angle
const J2_TH=[['thR1',.015,.04,-.13,0,.5],['thR2',.015,.05,-.2,.3,.6],['thL1',-.015,.04,-.13,0,-.5],['thL2',-.015,.05,-.2,.3,-.6]];
// turn a part about the gun's z axis through a point (the thorns rising), then shift it sideways
const _j2q=new THREE.Quaternion(),_j2r=new THREE.Quaternion(),_j2e=new THREE.Euler(),_j2z=new THREE.Vector3(0,0,1);
function j2Turn(p,pv,rz,dx){if(rz){const c=Math.cos(rz),s=Math.sin(rz),x=p.c[0]-pv[0],y=p.c[1]-pv[1];p.c=[pv[0]+x*c-y*s,pv[1]+x*s+y*c,p.c[2]];
    _j2q.setFromAxisAngle(_j2z,rz);_j2r.setFromEuler(_j2e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ'));_j2q.multiply(_j2r);_j2e.setFromQuaternion(_j2q,'XYZ');p.rx=_j2e.x;p.ry=_j2e.y;p.rz=_j2e.z}
  if(dx)p.c=[p.c[0]+dx,p.c[1],p.c[2]];return p}
// Mary, on the back of the sight where Christ stands: a blue veil to the foot, face and robe, folded hands, lit eyes, gold rays round her head
function j2Mary(){const L=[Pt(0,.0805,-.0327,.013,.019,.0056,'j2Blue',{r:.0015}),Pt(0,.0857,-.0293,.0056,.0066,.0016,'j2Skin',{r:.0007}),Pt(0,.0752,-.0293,.0072,.0096,.0016,'j2Skin',{r:.0007}),
    Pt(0,.0776,-.028,.0026,.0036,.0012,'j2Skin',{r:.0005}),Pt(0,.0863,-.0283,.0042,.0011,.0005,'j2Glow')];
  for(let i=0;i<7;i++){const a=(i-3)*.45;L.push(Pt(Math.sin(a)*.0094,.0857+Math.cos(a)*.0094,-.0337,.0012,.0042,.001,'j2Gold',{rz:-a}))}
  return L}
// v: 'vm' the first-person model (moving parts tagged) | 'n' the world model | 'b' the world model in the JANUS form
function j2Parts(v){const vm=v==='vm',B=v==='b',P=[];
  const T=(t,list)=>{for(const p of list){if(vm)p.tag=t;P.push(p)}};
  // the body: the grip in two blocks with a gold butt, the receiver, the two gold blocks round the hinge (one turned 45°), the trigger
  P.push(Pt(0,-.04,.04,.03,.08,.05,'j2Green',{rx:.35,r:.005}),Pt(0,-.09,.07,.028,.06,.04,'j2Green',{rx:.5,r:.005}),Pt(0,-.125,.088,.03,.015,.042,'j2Gold',{rx:.5,r:.002}),
    Pt(0,.02,-.02,.032,.04,.08,'j2Blue',{r:.003}),Pt(0,.02,-.07,.036,.036,.036,'j2Gold',{rz:.785,r:.002}),Pt(0,.02,-.07,.036,.036,.036,'j2Gold',{r:.002}));
  T('trg',[Pt(0,-.01,.01,.004,.02,.015,'blk',{rx:.2,r:.001})]);
  // what breaks open on the hinge: the golden inner barrel (a bore in its mouth), the sight on its bridge, a gold strip down its right
  T('mag',[Pt(0,.04,-.18,.022,.03,.162,'j2Gold',{r:.003}),Pt(0,.04,-.2615,.012,.012,.001,'muzzle'),Pt(0,.057,-.08,.016,.014,.05,'blk',{r:.002}),
    Pt(0,.08,-.06,.026,.03,.05,'blk',{r:.002}),Pt(.014,.08,-.06,.002,.02,.03,'deGold',{r:.001})]);
  // the outer barrel in two halves (they part in the form), with the engraved gold strip under it and the rail on top halved the same way
  for(const s of [-1,1]){const d=B?s*J2.SPREAD:0;T(s<0?'j2L':'j2R',[Pt(s*.007+d,.04,-.18,.014,.038,.16,'j2Blue',{r:.002}),Pt(s*.0075+d,.018,-.16,.015,.006,.1,'deGold',{r:.001}),
    Pt(s*.005+d,.062,-.17,.01,.005,.14,'rail',{r:.001})])}
  // the thorns along both sides (they rise in the form)
  for(const [t,x,y,z,rx,rz] of J2_TH){const p=Pt(x,y,z,.015,.008,.008,'j2Gold',{rx,rz,r:.001});if(B)j2Turn(p,[x,y,z],Math.sign(x)*J2.THORN,Math.sign(x)*J2.SPREAD);T(t,[p])}
  // the figure of Christ on the back of the sight and its eyes; Mary takes its place in the form
  if(!B){T('j2J',[Pt(0,.08,-.033,.012,.018,.01,'j2Skin',{r:.001})]);T('j2E',[Pt(0,.085,-.033,.004,.004,.011,'j2Glow',{r:0})])}
  if(B||vm)T('j2M',j2Mary());
  // the grenade's case in the chamber
  T('shell',[Pt(0,.04,-.07,.018,.018,.06,'brass',{r:.005})]);
  return P}
const J2_G={grip:[0,-.02,.01],muzzle:[0,.04,-.27],mag:[0,.04,-.07],eject:[0,.06,-.07],scope:[0,.08,-.04]};
{const H=J2.HINGE,piv={trg:[0,0,.012],j2L:H,j2R:H,j2J:H,j2E:H,j2M:H,shell:H};for(const [t,x,y,z] of J2_TH)piv[t]=[x,y,z];
  GUNS.janus2=Object.assign({parts:j2Parts('vm'),hinge:H.slice(),piv,wid:'janus2n'},J2_G)}// the first-person model; the world uses janus2n / s / b
GUNS.janus2n=Object.assign({parts:j2Parts('n')},J2_G);GUNS.janus2s=GUNS.janus2n;GUNS.janus2b=Object.assign({parts:j2Parts('b')},J2_G);
// the grenades: a brass case and a blue-grey head with a gold nose; the form's are blue-violet light round a white-gold core
GUNS.j2nade={parts:[Pt(0,0,.012,.034,.034,.04,'brass',{r:.012}),Pt(0,0,-.022,.036,.036,.03,'j2Blue',{r:.014}),Pt(0,0,-.04,.016,.016,.01,'j2Gold',{r:.006})],grip:[0,0,0],muzzle:[0,0,0]};
GUNS.j2orb={parts:[Pt(0,0,0,.05,.05,.07,'jnGlow',{r:.022}),Pt(0,0,0,.032,.032,.1,'j2Glow',{r:.013})],grip:[0,0,0],muzzle:[0,0,0]};
// a fresh grenade in the hand on a reload
FD_PROPS.j2nade=()=>[Pt(0,0,.01,.018,.018,.034,'brass',{r:.005}),Pt(0,0,-.017,.019,.019,.022,'j2Blue',{r:.007}),Pt(0,0,-.031,.009,.009,.007,'j2Gold',{r:.003})];
// the barrel's moving parts ride on it: the halves, the thorns, the figures and the case are hung under the barrel's group (they turn
// with it as it breaks open, and move on their own in the form); the free hand waits out of sight below
function j2Rig(m){const T=m.tags,mg=T.mag;if(!mg)return;
  for(const t of ['j2L','j2R','thR1','thR2','thL1','thL2','j2J','j2E','j2M','shell']){const g=T[t];if(!g)continue;mg.add(g);g.position.sub(mg.position)}
  if(T.j2M)T.j2M.visible=false;
  if(m.armL){lookArm(m.armL,[-.09,-.36,.06],[-.35,-.7,.6]);m.armL.visible=false}}
{const bv=buildVM;buildVM=function(id,skinKey,U,dual){const m=bv(id,skinKey,U,dual);if(id==='janus2')try{j2Rig(m)}catch(e){console.error(e)}return m}}

// ---------- stats ----------
const J2N={DMG:80,R:4.4,SCEN:2.5,KB:.5,STAG:.35,UP:.8,SP:.5,SPD:40,BSPD:46};
WPN.janus2={slot:2,kind:'pistol',n:['이태훈 딕건','Lee Tae-hoon Dick Gun'],cost:6000,mag:5,res:0,supOnly:1,jn:'janus2',dmg:J2N.DMG,rpm:214,semi:1,proj:'j2',alt:'janus',
  spread:[.015,.06,.12],rec:[.15,.04],kb:J2N.KB,stag:J2N.STAG,hs:1,reload:1,brk:1,draw:.9,speed:.94,snd:'j2fire',drawS:'j2draw',model:'janus2',hold:'pistol',
  kickX:[1.05,2.9,.6],bd:['적중 시 게이지 충전 · 폭발 유탄 · 5발','Explosive rounds · Charge on hit · 5 Ammo']};
// the JANUS form fires these (unlimited, a lighter kick)
const J2WB=Object.assign({},WPN.janus2,{proj:'j2b',noMag:1,snd:'j2fireb',rec:[.05,.016],spread:[.008,.03,.07],kickX:[.5,1.3,.35]});
VM_POS.janus2={p:[.12,-.15,-.38],r:[0,.07,.02]};
BUY_MENU.find(c=>c.k==='pistol').items.push('janus2');
// first draw (the sheet's): broken open with the thumb, rolled over for a look into the chamber, flicked shut — heavy
GUN_DESIGN.janus2={mag:5,ch:0,act:'break',x:.3,d:.15,side:'t',heavy:.7,roll:.4,open:J2.OPEN,opS:'j2open',shut:'j2shut'};WPN.janus2.fd=GUN_DESIGN.janus2;WPN.janus2.ch=0;
// the buy menu's line under the name (the sheet's)
{const wt=UI.wTags;UI.wTags=function(W,id){if(W&&W.bd)return W.bd[LI()];return wt.call(this,W,id)}}

// ---------- the JANUS machinery's own bits (janus.js) ----------
JNW.janus2={wb:J2WB,sOpen:'j2awake',sOn:'',sClose:'j2end',open:()=>j2OpenClip(),close:()=>j2CloseClip(),burst:(x,y,z,s)=>j2Burst(x,y,z,s,true),
  lit:'#8a2be2',spark:[1,.85,.45],mz:[.9,.35,2],cx:'j2',
  bfx(a){const mz=muzzleWorld(a),me=a.isPlayer&&!G.spec;FX.spawn({x:mz.x,y:mz.y,z:mz.z,life:.07,s0:me?.22:.4,s1:me?.38:.7,r:.6,g:.25,b:1,a:1,f:14,add:1});
    FX.spawn({x:mz.x,y:mz.y,z:mz.z,life:.05,s0:me?.1:.2,s1:me?.2:.35,r:1,g:.9,b:.6,a:1,f:1,add:1});if(a.isPlayer)VM.U.uMuzzle.value.setRGB(.8,.35,1.7)},
  sfx(a){const mz=muzzleWorld(a);for(let i=0;i<4;i++)FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:rr(-.4,.4),vy:rr(.2,.9),vz:rr(-.4,.4),life:rr(.6,1.1),s0:.06,s1:rr(.25,.4),r:.6,g:.58,b:.55,a:.35,f:2,drag:2})},
  // closing: motes of gold drifting up from the barrel
  cfx(a,mz){for(let i=0;i<16;i++)FX.spawn({x:mz.x+rr(-.08,.08),y:mz.y+rr(-.04,.06),z:mz.z+rr(-.08,.08),vx:rr(-.3,.3),vy:rr(.3,1),vz:rr(-.3,.3),life:rr(.5,1),s0:.04,s1:.01,r:1,g:.85,b:.45,f:11,add:1})}};
JNP.j2={w:'janus2',sp:J2N.SPD,mdl:'j2nade'};JNP.j2b={w:'janus2',sp:J2N.BSPD,mdl:'j2orb',B:1};

// a burst of light: gold (a normal blast), blue violet round a white-gold heart (the form)
function j2Burst(x,y,z,s,B){FX.spawn({x,y,z,life:.2,s0:.3*s,s1:1.7*s,r:B?.55:1,g:B?.2:.78,b:B?1:.32,a:.8,f:14,add:1});FX.spawn({x,y,z,life:.1,s0:.25*s,s1:.6*s,r:1,g:.95,b:.8,f:1,add:1});
  for(let i=0;i<10;i++){const g=Math.random()*TAU,e=rr(-.5,1),sp=rr(1.5,4)*s;FX.spawn({x,y,z,vx:Math.cos(g)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(g)*Math.cos(e)*sp,life:rr(.2,.4),s0:.06,s1:.01,r:1,g:.85,b:B?.7:.45,f:11,add:1,grav:2})}
  DL.add(x,y,z,B?'#8a2be2':'#ffc860',5*s,2,.18)}

// ---------- the grenades ----------
function j2Upd(n,dt){const r=projStep(n,dt,GRAV*.35,(n)=>{j2Boom(n);return 'kill'},(n)=>{j2Boom(n);return 'kill'});if(r==='kill')return true;
  if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.lookAt(n.x+n.vx,n.y+n.vy,n.z+n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
  if(n.kind==='j2b'){FX.spawn({x:n.x,y:n.y,z:n.z,life:.09,s0:.28,s1:.1,r:.55,g:.22,b:1,a:.8,f:14,add:1});if(Math.random()<.5)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.4,.4),vy:rr(-.2,.4),vz:rr(-.4,.4),life:rr(.12,.25),s0:.05,s1:.01,r:1,g:.88,b:.55,f:11,add:1})}
  else{if(Math.random()<.6)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.2,.2),vy:rr(-.1,.3),vz:rr(-.2,.2),life:rr(.4,.8),s0:.08,s1:.35,r:.62,g:.6,b:.56,a:.35,f:2,drag:2});
    if(Math.random()<.4)FX.spawn({x:n.x,y:n.y,z:n.z,life:.06,s0:.08,s1:.02,r:1,g:.82,b:.4,f:11,add:1})}
  if(n.t>6||n.y<-10){j2Boom(n);return true}return false}
// the blast: the grenade launcher's (weapons.js detonate 'gl') with the sheet's numbers, half the damage left at its edge; a burst of light
// over it; one count toward the signal if it caught anyone (the shooter's page, normal rounds only)
function j2Boom(n){const B=n.kind==='j2b',sc=G.mode==='scen'?J2N.SCEN:1;
  const g={kind:'gl',owner:n.owner,w:'janus2',x:n.x,y:n.y,z:n.z,ghost:!!n.ghost,jw:'janus2',R:J2N.R,dmg:J2N.DMG*sc,kb:J2N.KB,stag:J2N.STAG,up:J2N.UP,sp:J2N.SP,he:1,
    vol:B?.6:.8,rate:B?1.3:1.08,shk:B?.5:.85};
  detonate(g);j2Burst(n.x,n.y,n.z,B?.9:.6,B);
  if(!n.ghost&&!NET.ghost&&!B&&g.hitN>0)jnScore(n.owner)}
PROJ_UPD.j2=j2Upd;PROJ_UPD.j2b=j2Upd;

// ---------- first-person clips ----------
// the form opening: the gun is brought up close and tipped toward the eye while Christ sinks into the sight and Mary rises, a held
// tremble — then the halves burst apart (jnOpenK) with a kick, and it settles
function j2OpenClip(){
  return {G:[K6(0),K6(.16,-.03,.03,.05,-.12,.05,-.05),K6(.36,-.032,.034,.056,-.14,.06,-.06),[.4,-.004,-.004,-.02,.12,.02,.04,1],K6(.52,.002,-.004,-.01,.02,0,.01),
      K6(.68,0,.003,0,-.01,0,0),K6(1)],
    E:[[.4,'',0,0,[.18,-.85,.12,.15],[.015,0,.006]]],vib:[[0,0],[.1,.0006],[.36,.0014],[.42,.004],[.7,.0014],[1,0]],
    C:[[0,0,0,0],[.3,.01,0,-.006],[.42,-.02,0,.008],[.7,0,0,0],[1,0,0,0]]}}
// closing: it rocks as the halves clamp shut
function j2CloseClip(){return {G:[K6(0),K6(.18,-.004,.008,.004,.06,-.02,.08),K6(.45,.002,-.006,0,-.06,0,-.04),K6(.6,0,.002,0,.02,0,.01),K6(1)],
    E:[[.38,'',0,0,[.1,.35,0],[.006,0,0]]],C:[[0,0,0,0],[.2,.004,0,.006],[.5,-.006,0,0],[1,0,0,0]]}}
// one-handed break action (a gun with no supporting hand): the thumb trips the latch and the barrel drops open under its own weight, the
// gun rolls over for a look into the chamber (roll), then a flick of the wrist swings it shut with a heavy clack (heavy: slower, lower,
// harder)
function fdBreak1(P,G,m,L){const op=P.open||.62,h=P.heavy||0,rl=P.roll||0,lf=P.lift||0,o0=.1,o1=.2,fl=.6;
  return {
    G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.03),K6(o0,-.008,.008,-.006,-.1,.04,.3*rl),K6(o1+.06,-.026,.024+lf,-.008,.16,.12,.75*rl),K6(fl-.08,-.028,.028+lf,-.008,.2,.13,.8*rl),
       K6(fl,-.022,.044+lf,-.014,.5+.1*h,.1,.5*rl),K6(fl+.1,-.014,.016,-.01,-.05,.06,.3*rl),K6(.88,.003,-.004,.002,-.012,-.02,.02),K6(1)],
    parts:[{tag:'mag',ch:'rx',k:[[0,0],[o0,0],[o1,-op*1.08,1],[o1+.04,-op*.93],[o1+.08,-op]],rel:fl-.06,A:260+h*60,e:.14,home:[P.shut||'brk',1,.95-h*.1,[.26+h*.08,1.2+h*.4,0],[-.018,0,0]]}],
    E:[[o0,P.opS||'brk',.75,1-h*.06]],
    C:[[0,0,0,0],[o1,.01,0,-.012],[fl-.06,.012,0,-.014],[fl+.06,-.006,0,0],[.88,0,0,0],[1,0,0,0]]}}
{const fb=FDS.break;FDS.break=function(P,G,m,L){return G&&!G.sup?fdBreak1(P,G,m,L):fb(P,G,m,L)}}
// the reload of a one-handed break action: tripped open as above, the extractor flicks the spent case back over the shoulder, the free
// hand comes up from the belt with a fresh grenade and pushes it into the chamber, then the flick of the wrist
function rlBrk1(W,G,m,L){const P=W.fd||{},op=P.open||.62,h=P.heavy||0,rl=P.roll||0;
  const o0=.07,o1=.15,ej=.19,ld0=.4,ld1=.5,fl=.6,ch=[0,.04,-.035],bk=[-1,.4,0];// ch: the chamber's mouth (it rides the barrel); bk: the back of the hand to the left
  return {
    G:[K6(0),K6(.04,.003,-.006,0,-.02,-.02,-.03),K6(o0,-.008,.008,-.006,-.1,.03,.25*rl),K6(o1+.04,-.03,.026,0,.22,.1,.6*rl),K6(ej+.04,-.032,.03,0,.26,.1,.65*rl),
       K6(ld0,-.036,.03,.004,.28,.12,.7*rl),K6(ld1+.04,-.034,.028,.004,.26,.12,.68*rl),K6(fl,-.024,.046,-.01,.5+.1*h,.1,.45*rl),K6(fl+.1,-.014,.016,-.01,-.04,.06,.3*rl),
       K6(.86,.003,-.004,.002,-.012,-.02,.02),K6(1)],
    H:{A:[{sup:1},{tag:'mag',at:ch},{p:[-.12,-.3,.12]}],k:[HK(0,0),HK(.16,0),HK(.24,2,[0,0,0],.6,[-1,-.3,0],.6),
       HK(ld0-.06,1,[-.06,.035,.012],1,bk,.7),HK(ld0,1,[-.04,.022,.008],1,bk,.7),HK(ld1-.02,1,[-.028,.012,.004],1,bk,.5),HK(ld1+.02,1,[-.036,.02,.008],1,bk,.25),
       HK(ld1+.12,2,[0,0,0],.6,[-1,-.3,0],.5),HK(.82,0),HK(1,0)]},
    parts:[{tag:'mag',ch:'rx',k:[[0,0],[o0,0],[o1,-op*1.08,1],[o1+.03,-op*.94],[o1+.06,-op]],rel:fl-.02,A:260+h*60,e:.14,home:[P.shut||'brk',1,.95-h*.1,[.26+h*.08,1.2+h*.4,0],[-.018,0,0]]},
      // the spent case: drawn out of the chamber, flung back over the shoulder and gone; the fresh one slides in under the fingers
      {tag:'shell',ch:'pz',k:[[0,0],[ej-.01,0],[ej+.02,.03,1],[ej+.1,.34],[ej+.11,.06],[ld1-.08,.06],[ld1,0,1]]},
      {tag:'shell',ch:'py',k:[[0,0],[ej+.02,0],[ej+.1,.06],[ej+.11,0]]},
      {tag:'shell',ch:'rx',k:[[0,0],[ej+.02,0],[ej+.1,1.8],[ej+.11,0]]},
      {tag:'shell',ch:'s',k:[[0,0],[ej+.09,0],[ej+.1,-1],[ld1-.07,-1],[ld1-.06,0]]}],
    props:[{arm:'L',kind:'j2nade',on:[[.22,ld1-.06]],pos:[0,-.03,-.075],rot:[0,0,0]}],
    E:[[o0,P.opS||'brk',.75,1-h*.06],[ej+.01,'shellcase',.55,.85],[ej+.1,'shellcase',.3,.95],[ld1-.02,'shellin',.6,.8]],
    C:[[0,0,0,0],[o1,.01,0,-.01],[ld0,.012,0,-.012],[fl,-.006,0,0],[.88,0,0,0],[1,0,0,0]]}}
{const rb=rlBrk;rlBrk=function(W,G,m,L){return G&&!G.sup?rlBrk1(W,G,m,L):rb(W,G,m,L)}}
// how far the figures have changed places (0 Christ .. 1 Mary): in the first half of the opening, back in the closing
function j2SwapK(a){if(a.jnO>0){const u=1-a.jnO/JN.OPEN;return smooth(clamp((u-.12)/.42,0,1))}if(a.jnB>0)return 1;
  if(a.jnC>0){const u=1-a.jnC/JN.CLOSE;return 1-smooth(clamp((u-.05)/.55,0,1))}return 0}
// every frame on the view model: the free hand, the trigger, the halves and thorns, the figures, the eyes, the light
VMX.janus2=function(V,a,dt,o,m){const T=m.tags;
  // one-handed: the free hand shows only while a clip brings it up (the reload)
  if(m.armL)m.armL.visible=!!(V.act&&V.act.S&&V.act.S.H);
  // the trigger after each shot
  if(V.j2SN!==(a.jnShots|0)){if(V.j2SN!=null&&(a.jnShots|0)>V.j2SN)V.j2Tr=1;V.j2SN=a.jnShots|0}
  V.j2Tr=Math.max(0,(V.j2Tr||0)-dt*8);if(T.trg)T.trg.rotation.x-=.4*V.j2Tr;
  // the form: the outer barrel's halves part round the golden barrel, the thorns rise and go with them
  const k=jnOpenK(a);if(k){const d=J2.SPREAD*k;if(T.j2L)T.j2L.position.x-=d;if(T.j2R)T.j2R.position.x+=d;
    for(const [t,x] of J2_TH){const g=T[t],s=Math.sign(x);if(g){g.position.x+=s*d;g.rotation.z+=s*J2.THORN*k}}}
  // the figures: Christ sinks into the back of the sight and Mary comes out of it (and the other way when it closes)
  const w=j2SwapK(a),j=smooth(clamp(w*2,0,1)),mq=1-smooth(clamp(w*2-1,0,1)),sig=a.jnS>0;
  if(T.j2J){T.j2J.position.z-=J2.SINK*j;T.j2J.visible=j<.98}
  if(T.j2E){T.j2E.position.z-=J2.SINK*j;T.j2E.visible=j<.98&&(!sig||Math.sin(V.t*14)>-.35)}// (they flicker on the signal)
  if(T.j2M){T.j2M.position.z-=J2.SINK*mq;T.j2M.visible=w>.5}
  // the light: a gold pulse on the signal, blue violet round the barrel in the form
  const u=V.U.uMuzzle.value;if(k>.02){const p=(.4+.15*Math.sin(V.t*13))*k;u.r=Math.max(u.r,.5*p);u.g=Math.max(u.g,.18*p);u.b=Math.max(u.b,1*p)}
  else if(sig){const p=.12+.08*Math.sin(V.t*7);u.r=Math.max(u.r,.9*p);u.g=Math.max(u.g,.7*p);u.b=Math.max(u.b,.25*p)}
  const fast=a.jnB>0;V.flash.material.color.setHex(fast?0xc39bff:0xfff0d0);
  if(fast){const jt=.0009;o[0]+=rr(-jt,jt);o[1]+=rr(-jt,jt);o[5]+=rr(-jt,jt)*3}};

// ---------- spares and bots ----------
// a supply crate hands back the grenades it is missing as spares (the reload puts them in), an ammo box half of them, the shooting
// range keeps it topped up; never past five in all
function j2Top(A,n){const room=Math.max(0,WPN.janus2.mag-A.mag-(A.res|0)),add=Math.min(room,n);A.res=(A.res|0)+add;return add>0}
{const sg=SUP.give.bind(SUP);SUP.give=function(a,k,w,x,y,z){const A0=k!=='w'&&a&&a.ammo&&a.ammo.janus2?Object.assign({},a.ammo.janus2):null;sg(a,k,w,x,y,z);
  const A=A0&&a.ammo.janus2;if(A){A.mag=A0.mag;A.res=A0.res|0;j2Top(A,99)}}}
{const eg=EPK.give.bind(EPK);EPK.give=function(h){const A=h&&!h.pup&&h.ammo&&h.ammo.janus2,more=A?j2Top(A,Math.ceil(WPN.janus2.mag*.5)):false;return eg(h)||more}}
{const ru=RANGE.update.bind(RANGE);RANGE.update=function(dt){ru(dt);const A=G.player&&G.player.ammo&&G.player.ammo.janus2;if(A)j2Top(A,99)}}
// bots: now and then one carries it as its sidearm
{const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.05)L[2]='janus2';return L}}

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // the shot: a deep, heavy 펑 under a short sharp crack, rolling away for 0.8 s
  j2fire:{n:3,dur:1.3,ch:2,peak:.95,gain:.88,rev:.16,poly:4,pj:.03,fn:B=>{const o=B.comp(-10,4,.002,.15,B.g(.95));
    {const e=B.env(0,.002,1,.2,B.sh(2.6,o));B.osc('sine',rr(118,132),46,0,.22,e)}{const e=B.env(0,.001,.75,.09,o);B.nz('brown',0,.12,B.f('lowpass',800,.7,e))}
    {const e=B.env(.002,.004,.5,.14,o);B.nz('pink',0,.18,B.f('bandpass',rr(420,520),2.2,e))}
    for(const s of [-1,1]){const e=B.env(0,.0006,.9,.016,B.pan(s*.25,o));B.nz('white',0,.03,B.f('highpass',3800,.7,e))}B.grain(.001,2600,2.5,.012,.45,o);
    for(const s of [-1,1]){const te=B.envT(.02,.04,.24,.27,B.pan(s*.65,o));B.nz('pink',.02,1.1,B.f('lowpass',1300,.6,te))}
    {const te=B.envT(.03,.06,.18,.3,o);B.nz('brown',.03,1.05,B.f('lowpass',380,.7,te))}}},
  // the form: shorter and brighter, a bell over the thump
  j2fireb:{n:4,dur:1,ch:2,peak:.9,gain:.8,rev:.14,poly:6,pj:.05,fn:B=>{const o=B.comp(-10,4,.002,.12,B.g(.95));
    {const e=B.env(0,.002,1,.13,B.sh(2.4,o));B.osc('sine',rr(140,158),55,0,.15,e)}{const e=B.env(0,.001,.6,.05,o);B.nz('brown',0,.07,B.f('lowpass',1000,.7,e))}
    for(const s of [-1,1]){const e=B.env(0,.0006,.7,.014,B.pan(s*.25,o));B.nz('white',0,.025,B.f('highpass',4200,.7,e))}
    B.ring(.004,rr(1480,1560),[1,2.01,3.02,4.2],[.35,.22,.14,.08],[.12,.07,.04,.02],o);
    {const e=B.env(.005,.01,.25,.3,B.f('bandpass',2600,1.2,o));B.osc('sawtooth',rr(2000,2200),rr(700,800),.005,.3,e)}
    for(const s of [-1,1]){const te=B.envT(.02,.04,.14,.2,B.pan(s*.6,o));B.nz('pink',.02,.8,B.f('lowpass',1500,.6,te))}}},
  // breaking it open: the latch (철) and the heavy clack of the gold ornaments meeting (깍)
  j2open:{n:2,dur:.6,ch:2,peak:.85,gain:.6,rev:.08,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    B.grain(0,3400,3,.02,.5,o);B.grain(.025,2600,2,.012,.4,o);const t=.07;B.grain(t,1900,1.5,.018,.9,o);B.ring(t,rr(820,900),[1,2.31,3.6,5.1],[.16,.1,.06,.04],[.22,.12,.07,.04],o);
    {const e=B.env(t,.001,.7,.07,o);B.nz('brown',t,.09,B.f('lowpass',700,.7,e))}{const e=B.env(t,.002,.5,.08,o);B.osc('sine',210,120,t,.1,e)}}},
  // shutting it: a dull, quick 텅
  j2shut:{n:2,dur:.6,ch:2,peak:.88,gain:.65,rev:.1,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    {const e=B.env(0,.001,1,.13,B.sh(2,o));B.osc('sine',rr(150,165),85,0,.16,e)}{const e=B.env(0,.001,.8,.06,o);B.nz('brown',0,.08,B.f('lowpass',600,.7,e))}
    B.grain(0,1500,1.2,.02,.6,o);B.ring(.002,rr(420,460),[1,2.7,4.1],[.2,.1,.05],[.14,.06,.03],o)}},
  // drawing it: the relic humming faintly (웅-), then the 철컥
  j2draw:{n:2,dur:1.1,ch:2,peak:.75,gain:.5,rev:.2,poly:2,fn:B=>{const o=B.comp(-14,3,.003,.2,B.g(.9));
    for(const [f,p] of [[196,-.4],[197.6,.4]]){const e=B.env(0,.18,.32,.55,B.pan(p,o),.1);B.osc('sine',f,f,0,.9,e)}{const e=B.env(.05,.2,.08,.5,o,.05);B.osc('sine',784,790,.05,.8,e)}
    const t=.42;B.grain(t,3200,3,.015,.55,o);B.grain(t+.045,2300,2,.012,.7,o);B.ring(t+.045,1250,[1,2.2,3.4],[.06,.04,.025],[.12,.06,.03],o)}},
  // the form opening: the weapon wakes with a low, heavy 우웅-, a choir-like shimmer over it, the halves parting with a clank
  j2awake:{n:1,dur:1.8,ch:2,peak:.9,gain:.8,rev:.22,fn:B=>{const o=B.comp(-12,4,.003,.25,B.g(.95));
    {const e=B.env(0,.35,.9,.9,o,.2);B.osc('sine',48,72,0,1.5,e)}{const e=B.env(0,.3,.35,.8,B.f('lowpass',900,.9,o),.2);B.osc('sawtooth',96,144,0,1.4,e)}
    for(const [f,p] of [[523,-.5],[659,.5],[784,0]]){const e=B.env(.15,.35,.06,.8,B.pan(p,o),.15);B.osc('sine',f,f*1.003,.15,1.4,e)}
    const t=.25;B.grain(t,2100,1.5,.02,.7,o);B.ring(t,rr(700,760),[1,2.4,3.8],[.2,.12,.06],[.18,.1,.05],o);{const e=B.env(t,.002,.6,.12,o);B.nz('brown',t,.14,B.f('lowpass',500,.7,e))}}},
  // the form closing: the halves clamp shut twice, the hum dies away
  j2end:{n:1,dur:1.2,ch:2,peak:.85,gain:.7,rev:.18,fn:B=>{const o=B.comp(-12,4,.002,.2,B.g(.95));
    for(const t of [0,.2]){const e=B.env(t,.001,.9,.12,B.sh(1.8,o));B.osc('sine',rr(150,170),80,t,.15,e);B.grain(t,1600,1.4,.02,.55,o);B.ring(t,rr(560,620),[1,2.5,3.9],[.18,.1,.05],[.12,.06,.03],o)}
    {const e=B.env(.05,.05,.5,.9,o);B.osc('sine',90,40,.05,1,e)}{const e=B.env(.1,.1,.08,.7,o);B.osc('sine',1046,880,.1,.8,e)}}}});
SFX_ORDER.push('j2fire','j2fireb','j2open','j2shut','j2draw','j2awake','j2end');

'use strict';
// ============ v6.14 weapons: Blaze-8 (gold semi-auto shotgun), Winchester M1887 (lever-action shotgun), Kill Knife ============
// Models are boxes on the existing atlas materials (no new atlas slots); sounds reuse the game's synthesised ones.
// relFire: a shell-by-shell reload is cut short by a trigger press and that same press fires (game.js reload block).
// spEvery: every spEvery shells fired, the next shot is a special shell (sp* fields: heavier knockback, a pop-up, longer stagger).

// ---------- Blaze-8: tube-fed semi-auto, gold furniture with dark engraving, black barrel / tube / skeletal stock ----------
GUNS.blaze8={parts:[
  // receiver (gold) with engraved panels and a short top rail
  Pt(0,.03,-.05,.054,.08,.26,'brass'),Pt(.0275,.032,-.05,.002,.058,.21,'engraved'),Pt(-.0275,.032,-.05,.002,.058,.21,'engraved'),
  Pt(.0282,.032,-.05,.0012,.004,.21,'blk'),Pt(-.0282,.032,-.05,.0012,.004,.21,'blk'),
  Pt(0,.076,-.07,.03,.012,.17,'rail'),Pt(0,.083,-.07,.02,.004,.15,'blk'),
  // barrel and the magazine tube under it (black), a gold tube cap
  Pt(0,.068,-.45,.024,.024,.6,'blk'),Pt(0,.068,-.751,.017,.017,.004,'muzzle'),Pt(0,.068,-.74,.03,.026,.02,'blk2'),
  Pt(0,.03,-.39,.028,.028,.48,'blk2'),Pt(0,.03,-.635,.033,.033,.022,'brass'),Pt(0,.03,-.648,.022,.022,.006,'blk'),
  // fore-end (gold) with dark grooves and an engraved band
  Pt(0,.03,-.31,.054,.056,.21,'brass'),Pt(0,.003,-.31,.05,.006,.19,'blk'),Pt(.028,.03,-.31,.002,.04,.17,'engraved'),Pt(-.028,.03,-.31,.002,.04,.17,'engraved'),
  ...[-.36,-.33,-.3,-.27].map(z=>Pt(0,.03,z,.0565,.05,.004,'blk2')),
  // sights, the bolt handle on the right, a gold trigger guard
  Pt(0,.086,-.72,.008,.014,.008,'orange'),Pt(0,.088,-.12,.016,.012,.01,'blk'),
  ...TAG('chg',[Pt(.036,.042,-.03,.014,.012,.014,'bright'),Pt(.045,.042,-.03,.006,.018,.018,'blk')]),Pt(.027,.045,-.07,.003,.026,.07,'muzzle'),
  ...pGrip('grip2',-.045,.04,.3),Pt(0,-.012,-.01,.006,.005,.064,'brass'),Pt(0,.0,-.042,.006,.026,.006,'brass'),Pt(0,.006,-.006,.004,.02,.006,'steel'),
  // skeletal stock: a black tube, a lower strut, a gold cheek piece, a rubber pad
  Pt(0,.045,.21,.03,.03,.28,'blk'),segV(-.035,.08,.0,.33,0,.02,.02,'blk'),Pt(0,.078,.22,.036,.032,.17,'brass'),Pt(.019,.078,.22,.002,.022,.14,'engraved'),Pt(-.019,.078,.22,.002,.022,.14,'engraved'),
  Pt(0,.02,.345,.05,.13,.025,'rub'),Pt(0,.02,.33,.044,.11,.012,'blk2')],
  grip:[0,-.03,.02],sup:[0,.005,-.31],muzzle:[0,.068,-.75],mag:[0,.0,-.12],eject:[.03,.05,-.06]};
WPN.blaze8={slot:1,kind:'shotgun',n:['블레이즈-8','Blaze-8'],cost:6000,mag:8,res:48,pellets:7,dmg:22,rpm:250,semi:1,spread:[.055,.07,.1],rec:[.055,.02],kb:3,stag:.42,hs:2,
  shellRel:.38,relStart:.32,relFire:1,spEvery:3,spKb:9,spUp:2.6,spStag:.9,draw:.85,speed:.9,snd:'m14',spSnd:'db2',model:'blaze8',hold:'rifle',shell:1};
VM_POS.blaze8={p:[.15,-.165,-.37],r:[0,.08,.035]};

// ---------- Winchester M1887: lever-action, walnut and blued steel, a brass bead; the lever swings down after every shot ----------
GUNS.winchester={parts:[
  // receiver (blued) and its brass-edged loading gate
  Pt(0,.03,-.04,.05,.075,.2,'bluesteel'),Pt(.026,.03,-.06,.002,.04,.08,'brass'),Pt(-.026,.035,-.04,.002,.05,.15,'steel'),Pt(0,.072,-.04,.03,.01,.18,'blk'),
  // long barrel and the tube magazine under it, a brass front bead, a barrel band
  Pt(0,.06,-.48,.026,.026,.68,'bluesteel'),Pt(0,.06,-.823,.019,.019,.004,'muzzle'),Pt(0,.077,-.8,.006,.008,.006,'brass'),
  Pt(0,.03,-.39,.026,.026,.5,'bluesteel'),Pt(0,.045,-.63,.03,.05,.014,'blk'),
  // walnut fore-end
  Pt(0,.032,-.25,.05,.052,.22,'wood3'),Pt(0,.008,-.25,.044,.008,.2,'wood2'),
  // the lever loop (tag: swings about the pin at the front of the trigger area)
  ...TAG('lever',[Pt(0,-.018,.0,.008,.008,.09,'bluesteel'),Pt(0,-.05,.035,.008,.07,.008,'bluesteel'),Pt(0,-.085,.0,.008,.008,.08,'bluesteel'),Pt(0,-.05,-.035,.008,.07,.008,'bluesteel'),
    Pt(0,-.006,-.045,.005,.024,.005,'steel')]),
  // hammer, the wrist and a straight walnut stock with a dark butt plate
  Pt(0,.07,.05,.012,.022,.018,'bluesteel'),segV(.0,.06,-.035,.22,0,.042,.07,'wood3'),Pt(0,-.005,.26,.046,.12,.2,'wood3',{rx:-.12}),Pt(0,-.012,.365,.048,.13,.014,'blk',{rx:-.12}),
  Pt(.024,0,.25,.002,.06,.12,'wood2',{rx:-.12})],
  grip:[0,-.03,.05],sup:[0,.008,-.25],muzzle:[0,.06,-.82],mag:[0,.0,-.12],eject:[.0,.08,-.04],leverPiv:[0,-.01,-.045]};
WPN.winchester={slot:1,kind:'shotgun',n:['윈체스터 M1887','Winchester M1887'],cost:4500,mag:6,res:42,pellets:9,dmg:24,rpm:72,semi:1,spread:[.05,.065,.095],rec:[.075,.025],kb:3.8,stag:.55,hs:2,
  shellRel:.42,relStart:.36,relFire:1,draw:.8,speed:.92,snd:'db2',model:'winchester',hold:'rifle',pump:1,lever:1};
VM_POS.winchester={p:[.15,-.165,-.37],r:[0,.08,.035]};

// ---------- Kill Knife: a long hazy-grey blade that curves down to the point, a bright honed edge, blood along the belly,
// a handle of the same steel running on from it (built in slices along the blade so the spine and the edge can curve) ----------
// stained steel: the hazy grey of 'steel' with old blood soaked into it, faint (kkS1) to deep (kkS3), blotchy so it reads as a stain
const KK_MATS=['kkS1','kkS2','kkS3'];
for(const m of KK_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintKkAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  KK_MATS.forEach((name,lv)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const X=x0+xx,Y=y0+y,t=hash2(Math.floor(xx/10),y,3)*.55+fbm(X/12,Y/12,4,2,0)*.45;
      let c=t>.62?'#71767b':t<.35?'#45494e':'#5a5f64';
      const b=fbm(X/22,Y/22,90+lv,2,0)+(hash2(X,Y,91)-.5)*.08,amt=[.3,.48,.64][lv]*Math.max(.35,Math.min(1,(b-.15)*2));
      c=mix(c,lv>1?'#5a2420':'#6e3a32',amt);const r=rgbOf(c),k=(y*PS+xx)*4;D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=255}
    x.putImageData(id,x0,y0)})}
function kkParts(){const P=[],N=26,z0=-.045,z1=-.37;
  const ys=t=>.036-.07*Math.pow(t,2.2),ye=t=>-.03+.02*t-.02*t*t*t;// spine and edge heights, t 0 at the bolster .. 1 at the point
  for(let i=0;i<N;i++){const t=(i+.5)/N,z=z0+(z1-z0)*t,dz=(z1-z0)/N,a=ys(t),b=ye(t)+.006,th=.0078-.0036*t;if(a-b<.003)continue;
    P.push(Pt(0,(a+b)/2,z,th,a-b,Math.abs(dz)+.002,t>.86?'kkS3':t>.74?'kkS2':t>.6?'kkS1':'steel',{r:.001}));
    if(i%5===2)P.push(Pt(0,a-.003,z,th+.0006,.004,Math.abs(dz)*.9,'gunmetal'))}// a darker spine line every few slices
  // the honed edge along the bottom, following the curve
  for(let i=0;i<N-1;i++){const t0=i/N,t1=(i+1)/N;P.push(segV(ye(t0)+.003,z0+(z1-z0)*t0,ye(t1)+.003,z0+(z1-z0)*t1,0,.0042,.008,t0>.8?'kkS2':t0>.66?'kkS1':'bright',{r:.001}))}
  // the point
  P.push(segV(ys(.97),z1+.012,ye(1)+.002,z1-.004,0,.004,.006,'kkS3'));
  // (the old blood is in the steel itself: the slices toward the point use the kkS1..kkS3 stained steels, see paintKkAtlas)
  // the edge faces the other way in the hand: mirror the blade top to bottom (the curve then sweeps up toward the point)
  for(const q of P){q.c[1]=-q.c[1];if(q.rx)q.rx=-q.rx}
  // the handle: one piece of the same dark-grey steel running on from the blade (no bolster break), a darker groove down each side,
  // three flush rivets and a rounded steel pommel with a lanyard hole
  P.push(Pt(0,.003,-.036,.024,.066,.018,'steel'),Pt(0,.002,-.022,.024,.056,.012,'steel'));
  P.push(Pt(0,.0,.04,.026,.042,.13,'steel'),Pt(0,-.004,.04,.028,.03,.12,'steel'));
  for(const sx of [1,-1])P.push(Pt(sx*.0141,.002,.04,.0012,.008,.11,'gunmetal'));
  for(const z of [.0,.04,.08])P.push(Pt(0,.008,z,.0285,.007,.007,'chrome'));
  P.push(Pt(0,-.002,.108,.026,.04,.016,'steel'),Pt(0,-.004,.118,.022,.03,.008,'steel'),Pt(0,-.004,.112,.0285,.008,.008,'blk'));
  return P}
GUNS.killknife={parts:kkParts(),grip:[0,0,0],muzzle:[0,.03,-.36],trail:[0,.0,-.12,0,.028,-.35]};
WPN.killknife={slot:3,kind:'melee',n:['킬나이프','Kill Knife'],cost:12000,dmg:[95,330],rate:[.5,1.1],range:[2.7,2.2],kb:[5,15],stag:[2.2,3],cleave:[1,2],arc:[.55,.6],
  speed:1,draw:.65,model:'killknife',hold:'knife',sw:1,hitT:[.15,.32]};
VM_POS.killknife={p:[.16,-.17,-.34],r:[.15,.25,-.15]};

BUY_MENU.find(c=>c.k==='shotgun').items.push('blaze8','winchester');
BUY_MENU.find(c=>c.k==='special').items.push('killknife');

// ---------- the special shell (Blaze-8) ----------
// a.spN[id] = shells fired toward the next special one; at spEvery the next shot is special
function spShot(a,W){if(!W.spEvery)return W;const c=a.spN||(a.spN={}),n=c[a.cur]|0;
  if(n>=W.spEvery){c[a.cur]=0;a.spFx=G.t;return Object.assign({},W,{kb:W.spKb,stag:W.spStag,spUp:W.spUp,sp:1})}c[a.cur]=n+1;return W}
// the HUD's weapon name: three pips filling, then the special shell ready
function spTag(P,W){if(!W||!W.spEvery)return '';const n=(P.spN&&P.spN[P.cur])|0;return n>=W.spEvery?(LI()?' · ◆ SPECIAL':' · ◆ 특수탄'):' · '+'●'.repeat(n)+'○'.repeat(W.spEvery-n)}

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

// ---------- Kill Knife: a big single-edged blade of worn steel, a honed edge, a riveted dark-wood handle ----------
GUNS.killknife={parts:[
  // handle: wood scales over the tang, three rivets, a steel bolster and a pommel
  Pt(0,0,.035,.03,.04,.14,'wood2'),Pt(0,-.004,.035,.032,.03,.13,'wood3'),...[.0,.04,.08].map(z=>Pt(0,.002,z,.034,.008,.008,'chrome')),
  Pt(0,.0,.108,.03,.034,.014,'steel'),Pt(0,.0,-.04,.034,.044,.016,'steel'),
  // blade: a wide worn body, a brighter edge along the bottom, a spine, a clip point, stains
  Pt(0,.006,-.19,.007,.062,.28,'forged'),Pt(0,-.025,-.19,.0055,.012,.28,'bright'),Pt(0,.037,-.17,.008,.008,.24,'steel'),
  segV(.037,-.29,.012,-.345,0,.008,.008,'steel'),segV(-.03,-.33,.012,-.35,0,.0055,.01,'bright'),Pt(0,.0,-.315,.006,.04,.04,'forged'),
  Pt(.0038,.012,-.12,.0008,.02,.05,'dred'),Pt(-.0038,-.006,-.23,.0008,.016,.04,'dred'),Pt(.0038,.02,-.25,.0008,.01,.06,'blk')],
  grip:[0,0,0],muzzle:[0,.006,-.34],trail:[0,.006,-.12,0,.006,-.34]};
WPN.killknife={slot:3,kind:'melee',n:['킬나이프','Kill Knife'],cost:3000,dmg:[42,150],rate:[.5,1.1],range:[2.7,2.2],kb:[4.5,14],stag:[1.3,1.6],cleave:[1,2],arc:[.55,.6],
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

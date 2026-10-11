'use strict';
// ============ v6.27 weapon: Balrog-5 (a heavy assault rifle with a combo gauge) ============
// Every bullet that lands fills the gauge (+1, a headshot +2). At W.cmb the gauge is full and the NEXT bullet carries an explosive charge:
// it hits as usual and blows up where it lands (blastDamage: radius cmbR, cmbDmg at the centre, a hard shove and a hop), then the gauge is empty.
// a.cmb[id] = the gauge (per weapon, cleared every round). The first-person model shows it as five lit segments on the left of the handguard
// and a red lamp on top once it is full; the HUD name carries the count (ui.js: cmbTag). The hooks: weapons.js fireGun / shotTrace (a.shotEnd).
// The model is boxes on the existing atlas materials: a dark carbon receiver, a dark-red handguard with steel bands, a muzzle brake.

GUNS.balrog5={parts:[
  // receiver: lower and upper, a rear top rail and a front one, a red dot sight, the sights
  Pt(0,.0,-.03,.052,.07,.26,'carbon'),Pt(0,.058,-.04,.056,.05,.33,'blk'),rail(.091,-.5,-.2,.026),rail(.091,-.17,.12,.026),
  ...redDot(.12,-.06),Pt(0,.105,-.46,.012,.03,.016,'blk'),Pt(0,.12,-.46,.006,.012,.006,'steel'),Pt(0,.1,.08,.02,.026,.016,'blk'),
  // the ejection port and its brass deflector, a selector lever
  Pt(.0285,.06,-.06,.003,.022,.07,'muzzle'),Pt(.03,.048,-.01,.006,.012,.034,'brass'),Pt(.0295,.012,-.01,.004,.012,.03,'bright'),
  // handguard: dark red with steel bands and a vented underside, a short rail below
  Pt(0,.052,-.37,.07,.07,.34,'dred'),...[-.24,-.33,-.42,-.5].map(z=>Pt(0,.052,z,.074,.074,.012,'blk2')),Pt(0,.015,-.37,.05,.012,.3,'vent'),Pt(.0365,.052,-.37,.004,.03,.26,'vent'),
  // the gauge bed on the left side of the handguard, the side the first-person view looks at (the lit segments are the tags g1..g5; v6.28: was on the right)
  Pt(-.0372,.052,-.37,.004,.034,.27,'blk'),
  ...[1,2,3,4,5].map(i=>Pt(-.0392,.052,-.255-(i-1)*.052,.004,.026,.04,i<5?'orange':'red',{tag:'g'+i})),
  // barrel, a muzzle brake with side slots, a bright ring behind it
  Pt(0,.055,-.58,.026,.026,.14,'steel'),Pt(0,.055,-.69,.044,.044,.08,'blk'),Pt(0,.055,-.735,.022,.022,.006,'muzzle'),
  Pt(.0225,.055,-.69,.002,.03,.05,'muzzle'),Pt(-.0225,.055,-.69,.002,.03,.05,'muzzle'),Pt(0,.055,-.64,.05,.05,.01,'bright'),
  // the charge lamp on top of the receiver: dark until the gauge is full (tag rdy)
  ...TAG('rdy',[Pt(0,.0965,-.2,.03,.006,.03,'red'),Pt(0,.1,-.2,.016,.004,.016,'orange')]),
  ...TAG('aux',[Pt(.03,.07,-.01,.012,.012,.012,'blk')]),...TAG('chg',[Pt(0,.09,.07,.04,.008,.02,'blk'),Pt(0,.087,.06,.012,.006,.02,'blk2')]),
  // grip, a long 35-round magazine with a red floor plate, the trigger guard
  ...pGrip('grip2',-.065,.035,.28),...TAG('mag',[Pt(0,-.1,-.11,.035,.17,.07,'blk',{rx:-.12}),Pt(0,-.185,-.1,.038,.012,.074,'red',{rx:-.12})]),...tGuard(-.005),
  // stock: a tube, a dark red body with a cheek rest, the pad
  Pt(0,.03,.16,.03,.03,.14,'blk2'),Pt(0,.03,.25,.05,.08,.16,'dred'),Pt(0,.062,.25,.04,.008,.14,'rub'),Pt(0,.03,.338,.056,.11,.02,'rub')],
  grip:[0,-.03,.02],sup:[-.005,.01,-.37],muzzle:[0,.055,-.74],mag:[0,-.15,-.11],eject:[.03,.06,-.08]};
WPN.balrog5={slot:1,kind:'rifle',n:['발록-5','Balrog-5'],cost:6500,mag:35,res:210,dmg:34,rpm:640,spread:[.005,.04,.11],rec:[.014,.008],kb:2.6,stag:.28,hs:3,reload:2.7,draw:.8,speed:.9,
  snd:'balrog5',model:'balrog5',hold:'rifle',shell:1,cmb:8,cmbR:3.6,cmbDmg:230,cmbKb:13,cmbUp:4.2};
VM_POS.balrog5={p:[.15,-.165,-.36],r:[0,.085,.035]};
BUY_MENU.find(c=>c.k==='rifle').items.push('balrog5');

// ---------- the gauge ----------
function cmbReady(a,W){return !!(a.cmb&&(a.cmb[a.cur]|0)>=W.cmb)}
// called by fireGun after the shot: xb = this bullet was the explosive one
function cmbAfter(a,W,hit,hs,xb){const c=a.cmb||(a.cmb={});
  if(xb){c[a.cur]=0;const e=a.shotEnd;if(e)cmbBoom(a,W,e[0],e[1],e[2]);return}
  if(!hit)return;const v=Math.min(W.cmb,(c[a.cur]|0)+(hs?2:1));c[a.cur]=v;
  if(v>=W.cmb&&a.isPlayer){AU.play('slide',{vol:.55,rate:1.7});HUD.note(LI()?'Balrog-5 — the next bullet explodes':'발록-5 — 다음 한 발은 폭발탄',1.6)}}
function cmbBoom(a,W,x,y,z){miniBlast(x,y,z,1.1);AU.at('explode',x,y,z,{vol:.85,range:70,occ:false,rate:1.35});nearShake(x,y,z,9,.6);
  blastDamage(a,x,y,z,W.cmbR,W.cmbDmg,W.cmbKb,W.cmbUp,a.cur,{he:1})}
// the HUD's weapon name: the count, or the call that the explosive round is in the chamber
function cmbTag(P,W){if(!W||!W.cmb)return '';const v=(P.cmb&&P.cmb[P.cur])|0;return v>=W.cmb?(LI()?' · EXPLOSIVE ROUND':' · 폭발탄 장전!'):` · ${v}/${W.cmb}`}
// first-person: segments light up as the gauge fills, the lamp blinks when it is full
VMX.balrog5=function(V,a,dt,o,m){const W=WPN.balrog5,v=a.cmb?(a.cmb.balrog5|0):0,k=Math.floor(v/W.cmb*5),full=v>=W.cmb;
  for(let i=1;i<=5;i++){const T=m.tags['g'+i];if(T)T.visible=i<=k||full}
  const L=m.tags.rdy;if(L)L.visible=full&&Math.sin(V.t*14)>-.2};

// ---------- the sound: a heavier, lower report than the M4A1 ----------
Object.assign(GUNDEF,{
  balrog5:()=>({drive:1.8,crack:.95,crackF:2600,body:[{f:rr(900,1050),q:.8,l:.95,d:.1},{f:rr(2200,2600),q:1,l:.75,d:.06},{f:rr(300,380),q:.9,l:.6,d:.14,n:'pink'}],
    punch:{f0:rr(130,150),f1:56,d:.14,l:1},mech:{t:rr(.03,.034),f:rr(3000,3600),l:.2},tail:{l:.28,tau:.22,d:rr(.9,1),f0:2600,f1:190},echo:echoes()})});
Object.assign(SFX,{balrog5:{n:4,dur:1.1,ch:2,peak:.92,gain:.84,rev:.12,poly:7,pj:.03,fn:B=>gunshot(B,GUNDEF.balrog5())}});
SFX_ORDER.push('balrog5');

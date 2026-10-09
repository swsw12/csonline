'use strict';
// ============ 근하신년 (Lunar New Year) weapon series and CSO zombie-class skills ============
// Names, numbers and mechanics follow CSO; every model, texture and sound here is drawn/synthesised in code (original designs).

// ---------- extra atlas materials (slots 48..55 of the 8x8 weapon atlas) ----------
const NY_MATS=['gold','lacR','lacB','scale','chain','string','sawd','ember','scaleB'];
for(const m of NY_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintNYAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  // alpha = gloss level for the character shader (248..254 = sheen), 232 = self-lit
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  patch('gold',(xx,y,X,Y)=>{const b=Math.sin(y*.21+xx*.04)*.5+.5,t=nz(X,Y,61,10);let c=mix('#6e4a10','#eac866',b*.65+t*.35);if((y+Math.floor(xx*.3))%32<2)c='#fff2b8';if(hash2(X,Y,62)<.02)c='#5a3a0c';return c},252);
  patch('lacR',(xx,y,X,Y)=>{const t=nz(X,Y,63,20);let c=t>.6?'#b8261c':t<.4?'#640e0a':'#8e1810';if(Math.sin((xx+y)*.08)>.86)c=lt(c,.3);if(hash2(X,Y,64)<.007)c='#e8c460';return c},249);
  patch('lacB',(xx,y,X,Y)=>{const t=nz(X,Y,65,20);let c=t>.6?'#2a2432':t<.4?'#0d0b11':'#18141e';if(Math.sin((xx+y)*.08)>.9)c='#463e54';if(hash2(X,Y,66)<.009)c='#c8a040';return c},249);
  patch('scale',(xx,y)=>{const S=16,H=11,row=Math.floor(y/H),off=row%2?S/2:0;const u=((xx+off)%S)-S/2,v=y%H;const d=Math.hypot(u,(v-1)*1.25)/(S*.56);
    let c=d<.62?'#2c0f0c':d<.86?'#6e2014':d<1?'#c8602a':'#120505';if(v===0&&Math.abs(u)<3)c='#e8a050';return c},248);
  patch('scaleB',(xx,y)=>{const S=16,H=11,row=Math.floor(y/H),off=row%2?S/2:0;const u=((xx+off)%S)-S/2,v=y%H;const d=Math.hypot(u,(v-1)*1.25)/(S*.56);
    let c=d<.62?'#141018':d<.86?'#2a2232':d<1?'#8a7038':'#08060a';if(v===0&&Math.abs(u)<3)c='#c8a050';return c},248);
  patch('chain',(xx,y)=>{const r=xx%10,t=y%8;let c=r<2?'#121214':t<2?'#dfe3e6':'#8a8e93';if(r>=7&&t>=4)c='#54585c';return c});
  patch('string',(xx,y)=>((xx+y)%6<3)?'#ece4cc':'#a89a7c');
  patch('sawd',(xx,y,X,Y)=>{const t=hash2(Math.floor(xx/12),y,67)*.5+nz(X,Y,68,10)*.5;let c=t>.6?'#d4d8dc':t<.35?'#80868c':'#a8aeb4';if(y<4||y>123)c='#f4f8fc';if((xx*3+y)%37===0)c='#5a1008';return c},250);
  patch('ember',(xx,y,X,Y)=>{const t=nz(X,Y,69,8);return t>.62?'#fff2a8':t>.45?'#ffb040':'#e85010'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}

// ---------- models ----------
// seg: a box from (x0,z0) to (x1,z1) in the horizontal plane; segV: from (y0,z0) to (y1,z1) in the vertical plane
const seg=(x0,z0,x1,z1,y,h,w,m,o)=>{const dx=x1-x0,dz=z1-z0;return Pt((x0+x1)/2,y,(z0+z1)/2,Math.hypot(dx,dz),h,w,m,Object.assign({ry:Math.atan2(-dz,dx)},o||{}))};
const segV=(y0,z0,y1,z1,x,w,d,m,o)=>{const dy=y1-y0,dz=z1-z0;return Pt(x,(y0+y1)/2,(z0+z1)/2,w,Math.hypot(dy,dz),d,m,Object.assign({rx:Math.atan2(dz,dy)},o||{}))};
const boltLoaded=()=>TAG('mag',[Pt(0,.08,-.36,.008,.008,.44,'bright'),Pt(0,.08,-.59,.014,.014,.03,'steel'),Pt(0,.091,-.17,.002,.016,.05,'red'),Pt(.008,.08,-.17,.014,.002,.05,'red')]);
const discV=(cy,cz,D,teeth)=>{const P=[];for(let k=0;k<4;k++)P.push(Pt(0,cy,cz,.008,D,D*.42,'sawd',{rx:k*Math.PI/4}));
  for(let k=0;k<teeth;k++){const a=k/teeth*TAU;P.push(Pt(0,cy+Math.cos(a)*D*.5,cz+Math.sin(a)*D*.5,.009,.022,.022,'steel',{rx:a}))}
  P.push(Pt(0,cy,cz,.016,D*.24,D*.24,'gold'),Pt(0,cy,cz,.02,D*.1,D*.1,'blk'));return P};
const NYG={
  xbow:{parts:[Pt(0,.03,-.06,.05,.065,.3,'blk'),Pt(0,.064,-.36,.034,.018,.52,'wood2'),Pt(0,.05,-.36,.024,.02,.5,'blk2'),...boltLoaded(),
    Pt(0,.064,-.6,.07,.045,.045,'blk'),seg(-.035,-.6,-.29,-.55,.064,.02,.026,'blk2'),seg(.035,-.6,.29,-.55,.064,.02,.026,'blk2'),
    Pt(-.29,.064,-.548,.022,.034,.022,'gold'),Pt(.29,.064,-.548,.022,.034,.022,'gold'),
    seg(-.29,-.55,0,-.2,.072,.004,.004,'string'),seg(.29,-.55,0,-.2,.072,.004,.004,'string'),...TAG('chg',[Pt(0,.076,-.2,.032,.016,.03,'steel')]),
    ...scope(.118,-.14,.0,.022),Pt(0,.092,-.07,.016,.02,.02,'blk'),Pt(0,-.02,-.3,.03,.07,.035,'grip2'),
    ...pGrip('grip2',-.06,.04,.28),...tGuard(-.005),Pt(0,.0,.19,.044,.09,.26,'wood',{rx:-.1}),Pt(0,-.014,.33,.048,.11,.02,'rub',{rx:-.1}),Pt(0,.03,.04,.054,.02,.06,'gold')],
    grip:[0,-.03,.02],sup:[0,-.02,-.3],muzzle:[0,.08,-.61],mag:[0,.08,-.36],eject:[0,.07,-.1],scope:[0,.118,-.07]},
  xbowa:{parts:[Pt(0,.03,-.06,.05,.07,.3,'carbon'),Pt(0,.064,-.36,.034,.018,.52,'blk'),Pt(0,.048,-.36,.024,.02,.5,'gunmetal'),...boltLoaded(),
    Pt(0,.064,-.6,.08,.05,.05,'gunmetal'),seg(-.04,-.6,-.2,-.5,.064,.032,.02,'carbon'),seg(.04,-.6,.2,-.5,.064,.032,.02,'carbon'),
    Pt(-.21,.064,-.5,.014,.056,.056,'chrome'),Pt(.21,.064,-.5,.014,.056,.056,'chrome'),Pt(-.21,.064,-.5,.018,.02,.02,'gold'),Pt(.21,.064,-.5,.018,.02,.02,'gold'),
    seg(-.21,-.5,0,-.22,.072,.004,.004,'string'),seg(.21,-.5,0,-.22,.072,.004,.004,'string'),seg(-.21,-.5,-.04,-.6,.058,.003,.003,'string'),seg(.21,-.5,.04,-.6,.058,.003,.003,'string'),
    ...TAG('chg',[Pt(0,.076,-.22,.032,.016,.03,'steel')]),rail(.09,-.3,-.05,.026),...redDot(.115,-.12),Pt(0,-.02,-.3,.03,.07,.035,'grip2'),
    ...pGrip('grip2',-.06,.04,.28),...tGuard(-.005),Pt(0,.042,.14,.012,.02,.24,'carbon'),Pt(0,-.02,.14,.012,.02,.24,'carbon'),Pt(0,.01,.27,.05,.11,.02,'rub'),Pt(0,.04,-.06,.054,.012,.08,'gold')],
    grip:[0,-.03,.02],sup:[0,-.02,-.3],muzzle:[0,.08,-.61],mag:[0,.08,-.36],eject:[0,.07,-.1]},
  volc:{parts:[...TAG('spin',[...[0,1,2,3,4,5].map(i=>{const a=i/6*TAU;return Pt(Math.cos(a)*.042,.045+Math.sin(a)*.042,-.4,.03,.03,.46,'gunmetal')}),
      ...[0,1,2,3,4,5].map(i=>{const a=i/6*TAU;return Pt(Math.cos(a)*.042,.045+Math.sin(a)*.042,-.633,.018,.018,.006,'muzzle')}),
      Pt(0,.045,-.6,.13,.13,.02,'gold'),Pt(0,.045,-.36,.12,.12,.02,'blk'),Pt(0,.045,-.625,.112,.112,.012,'blk')]),
    Pt(0,.045,-.08,.13,.13,.24,'lacB'),Pt(0,.045,-.2,.124,.124,.04,'gold'),Pt(.067,.045,-.08,.004,.08,.18,'ember'),Pt(-.067,.045,-.08,.004,.08,.18,'ember'),
    Pt(0,.15,-.1,.02,.06,.03,'blk'),Pt(0,.18,-.1,.022,.022,.18,'grip2'),...TAG('mag',[Pt(0,-.085,-.06,.13,.12,.14,'gunmetal'),Pt(0,-.085,-.06,.134,.02,.144,'gold')]),
    Pt(0,-.06,-.25,.035,.09,.035,'grip2'),...pGrip('grip2',-.05,.08,.15),Pt(0,.045,.1,.07,.1,.08,'blk2'),Pt(0,.04,.15,.08,.13,.02,'rub')],
    grip:[0,-.035,.08],sup:[0,-.06,-.25],muzzle:[0,.045,-.65],mag:[0,-.09,-.06],eject:[.08,.0,-.06],spinAxis:[0,.045]},
  bdc:{parts:[Pt(0,.07,-.34,.088,.088,.56,'lacB'),Pt(0,.07,-.12,.098,.098,.03,'gold'),Pt(0,.07,-.32,.098,.098,.025,'gold'),Pt(0,.07,-.53,.1,.1,.03,'gold'),
    Pt(.046,.07,-.33,.006,.07,.4,'scaleB'),Pt(-.046,.07,-.33,.006,.07,.4,'scaleB'),Pt(0,.116,-.33,.07,.006,.4,'scaleB'),
    Pt(0,.108,-.68,.11,.036,.2,'lacB',{rx:-.12}),Pt(0,.03,-.67,.1,.03,.17,'lacB',{rx:.14}),Pt(0,.07,-.67,.08,.06,.14,'muzzle'),
    ...[0,1,2,3].map(k=>Pt(-.03+k*.02,.09,-.765,.008,.018,.01,'gold')),...[0,1,2].map(k=>Pt(-.02+k*.02,.048,-.75,.008,.016,.01,'gold')),
    Pt(.057,.112,-.63,.008,.014,.024,'ember'),Pt(-.057,.112,-.63,.008,.014,.024,'ember'),
    segV(.12,-.6,.2,-.5,.04,.012,.012,'gold'),segV(.12,-.6,.2,-.5,-.04,.012,.012,'gold'),segV(.118,-.2,.15,-.52,0,.006,.03,'scaleB'),
    Pt(0,.06,-.02,.08,.1,.12,'lacB'),Pt(0,.06,.045,.086,.106,.014,'gold'),Pt(0,.04,.17,.05,.08,.2,'lacB',{rx:-.05}),Pt(0,.03,.28,.056,.11,.02,'rub'),
    ...pGrip('grip2',-.04,.03,.22),...tGuard(-.02),Pt(0,-.02,-.3,.032,.08,.034,'grip2'),Pt(0,.02,-.3,.04,.02,.05,'gold'),
    ...TAG('mag',[Pt(0,-.035,-.13,.05,.07,.09,'lacB'),Pt(.026,-.035,-.13,.003,.045,.06,'ember')])],
    grip:[0,-.03,.03],sup:[0,-.03,-.3],muzzle:[0,.07,-.77],mag:[0,-.04,-.13],eject:[0,.06,-.06]},
  rdc:{parts:[Pt(0,.075,-.36,.1,.1,.6,'lacR'),Pt(0,.075,-.12,.11,.11,.03,'gold'),Pt(0,.075,-.3,.11,.11,.025,'gold'),Pt(0,.075,-.48,.11,.11,.025,'gold'),Pt(0,.075,-.6,.114,.114,.035,'gold'),
    Pt(.052,.075,-.36,.006,.08,.44,'scale'),Pt(-.052,.075,-.36,.006,.08,.44,'scale'),
    Pt(0,.12,-.72,.12,.04,.22,'lacR',{rx:-.16}),Pt(0,.03,-.71,.11,.034,.19,'lacR',{rx:.18}),Pt(0,.075,-.71,.09,.07,.15,'muzzle'),
    ...[0,1,2,3,4].map(k=>Pt(-.04+k*.02,.1,-.81,.008,.02,.01,'gold')),...[0,1,2,3].map(k=>Pt(-.03+k*.02,.05,-.795,.008,.018,.01,'gold')),
    Pt(.062,.122,-.67,.01,.016,.028,'ember'),Pt(-.062,.122,-.67,.01,.016,.028,'ember'),
    segV(.13,-.64,.24,-.52,.045,.014,.014,'gold'),segV(.13,-.64,.24,-.52,-.045,.014,.014,'gold'),segV(.24,-.52,.27,-.42,.045,.01,.01,'gold'),segV(.24,-.52,.27,-.42,-.045,.01,.01,'gold'),
    seg(.05,-.42,.15,-.3,.09,.006,.12,'scale',{rz:-.4}),seg(-.05,-.42,-.15,-.3,.09,.006,.12,'scale',{rz:.4}),segV(.126,-.18,.17,-.56,0,.008,.04,'gold'),
    Pt(0,.065,-.02,.09,.11,.12,'lacR'),Pt(0,.065,.045,.096,.116,.014,'gold'),Pt(0,.045,.17,.055,.085,.2,'lacR',{rx:-.05}),Pt(0,.035,.28,.06,.115,.02,'rub'),
    ...pGrip('grip2',-.04,.03,.22),...tGuard(-.02),Pt(0,-.02,-.32,.032,.08,.034,'grip2'),Pt(0,.02,-.32,.044,.02,.05,'gold'),
    ...TAG('mag',[Pt(0,-.035,-.14,.054,.075,.1,'lacR'),Pt(.028,-.035,-.14,.003,.05,.065,'ember')])],
    grip:[0,-.03,.03],sup:[0,-.03,-.32],muzzle:[0,.075,-.82],mag:[0,-.04,-.14],eject:[0,.06,-.06]},
  ripper:{parts:[Pt(0,0,.02,.03,.032,.13,'blk'),Pt(0,.04,.08,.03,.08,.02,'blk'),Pt(0,-.035,-.03,.006,.03,.012,'orange'),
    Pt(0,.05,-.13,.1,.13,.22,'orange'),Pt(0,.12,-.13,.092,.02,.2,'blk'),Pt(.051,.05,-.13,.004,.07,.12,'vent'),Pt(-.051,.05,-.13,.004,.09,.16,'blk2'),
    Pt(0,.05,-.245,.104,.134,.012,'gold'),Pt(.054,.02,-.06,.006,.03,.05,'ember'),Pt(0,.0,-.13,.09,.03,.18,'blk'),
    Pt(0,.17,-.26,.12,.02,.022,'blk'),Pt(.06,.11,-.26,.02,.12,.022,'blk'),Pt(-.06,.11,-.26,.02,.12,.022,'blk'),
    Pt(0,.04,-.53,.012,.075,.52,'bright'),Pt(0,.04,-.79,.012,.055,.04,'bright'),Pt(.0065,.04,-.5,.001,.03,.36,'gold'),Pt(-.0065,.04,-.5,.001,.03,.36,'gold'),
    ...TAG('spin',[Pt(0,.082,-.53,.018,.012,.52,'chain'),Pt(0,-.002,-.53,.018,.012,.52,'chain'),Pt(0,.04,-.816,.018,.074,.012,'chain')]),
    ...TAG('mag',[Pt(0,.135,-.08,.03,.012,.03,'gold')]),...TAG('chg',[Pt(-.058,.1,-.06,.012,.014,.05,'blk'),Pt(-.053,.1,-.06,.004,.006,.012,'string')])],
    grip:[0,0,.02],sup:[-.06,.17,-.26],muzzle:[0,.04,-.82],mag:[0,.135,-.08],eject:[0,.1,-.1]},
  gaebolg:{parts:[Pt(0,.05,-.25,.056,.056,.44,'gunmetal'),Pt(0,.05,-.05,.064,.064,.03,'gold'),Pt(0,.05,-.46,.066,.066,.04,'gold'),Pt(0,.05,-.482,.04,.04,.006,'muzzle'),
    ...TAG('mag',[Pt(0,.05,-.6,.014,.014,.3,'steel'),Pt(0,.05,-.775,.036,.01,.07,'gold',{rz:.785}),Pt(0,.05,-.775,.036,.01,.07,'gold',{rz:-.785}),Pt(0,.05,-.815,.014,.014,.03,'gold'),
      seg(0,-.74,.03,-.7,.05,.008,.008,'gold'),seg(0,-.74,-.03,-.7,.05,.008,.008,'gold')]),
    Pt(0,-.015,-.22,.044,.044,.26,'lacR'),Pt(.024,-.015,-.18,.004,.022,.022,'white'),Pt(0,-.015,-.36,.048,.048,.02,'gold'),
    Pt(0,.1,-.2,.02,.02,.2,'blk'),...redDot(.122,-.2),...pGrip('grip2',-.04,.03,.26),...tGuard(-.01),Pt(0,.02,-.02,.05,.07,.1,'blk'),
    Pt(0,.03,.14,.044,.08,.2,'blk2',{rx:-.06}),Pt(0,.02,.25,.05,.1,.02,'rub'),Pt(0,-.06,-.33,.03,.07,.034,'grip2')],
    grip:[0,-.03,.02],sup:[0,-.06,-.33],muzzle:[0,.05,-.83],mag:[0,.05,-.6],eject:[0,.06,-.06]},
  xdz:{parts:[Pt(0,.03,-.08,.06,.08,.28,'lacB'),Pt(0,.03,-.08,.064,.084,.02,'gold'),Pt(0,.068,-.27,.02,.02,.14,'gold'),Pt(0,-.008,-.27,.02,.02,.14,'gold'),
    ...TAG('spin',discV(.03,-.43,.25,12)),...pGrip('grip2',-.05,.03,.25),...tGuard(-.01),Pt(0,.1,-.1,.02,.03,.12,'blk'),Pt(0,-.04,-.22,.03,.07,.034,'grip2'),
    Pt(0,.03,.12,.05,.08,.16,'blk2',{rx:-.06}),Pt(0,.02,.21,.055,.1,.02,'rub'),Pt(.034,.03,-.1,.004,.04,.1,'ember')],
    grip:[0,-.03,.02],sup:[0,-.04,-.22],muzzle:[0,.03,-.56],mag:[0,-.04,-.08],eject:[0,.06,-.06],spinC:[0,.03,-.43]},
  mdrill:{parts:[Pt(0,.04,-.06,.07,.1,.28,'gunmetal'),Pt(0,.04,-.06,.074,.104,.02,'gold'),Pt(0,.1,-.08,.03,.03,.22,'blk'),
    ...TAG('spin',[...[0,1,2,3,4,5,6].map(i=>{const s=.1-i*.012;return Pt(0,.045,-.3-i*.045,s,s,.05,i%2?'chrome':'gold',{rz:i*.39})}),Pt(0,.045,-.62,.012,.012,.04,'chrome')]),
    Pt(0,.045,-.24,.09,.09,.03,'blk'),...TAG('mag',[Pt(0,-.06,-.1,.08,.1,.12,'gunmetal'),Pt(0,-.06,-.1,.084,.02,.124,'gold')]),
    ...pGrip('grip2',-.05,.05,.25),...tGuard(-.02),Pt(0,-.05,-.22,.03,.08,.034,'grip2'),Pt(0,.04,.14,.05,.09,.2,'blk2',{rx:-.06}),Pt(0,.03,.25,.056,.11,.02,'rub'),Pt(.037,.05,-.08,.004,.05,.12,'ember')],
    grip:[0,-.03,.03],sup:[0,-.05,-.22],muzzle:[0,.045,-.64],mag:[0,-.07,-.1],eject:[.04,.06,-.06],spinAxis:[0,.045]},
  mlaunch:{spinAxis:[0,.05],parts:[...TAG('spin',[...[0,1,2].map(i=>{const a=Math.PI/2+i/3*TAU;return Pt(Math.cos(a)*.032,.05+Math.sin(a)*.032,-.32,.036,.036,.36,'gunmetal')}),
    ...[0,1,2].map(i=>{const a=Math.PI/2+i/3*TAU;return Pt(Math.cos(a)*.032,.05+Math.sin(a)*.032,-.502,.024,.024,.004,'muzzle')}),
    Pt(0,.05,-.3,.104,.104,.03,'gold'),Pt(0,.05,-.47,.104,.104,.035,'gold')]),Pt(0,.04,-.05,.08,.1,.2,'lacR'),Pt(0,.12,-.08,.03,.03,.2,'blk'),
    ...TAG('mag',[Pt(0,-.05,-.08,.07,.07,.1,'gold'),Pt(0,-.05,-.08,.074,.02,.104,'blk')]),...pGrip('grip2',-.05,.05,.25),...tGuard(-.02),
    Pt(0,-.04,-.26,.03,.08,.034,'grip2'),Pt(0,.04,.12,.05,.09,.18,'blk2',{rx:-.06}),Pt(0,.03,.22,.056,.11,.02,'rub')],
    grip:[0,-.03,.03],sup:[0,-.04,-.26],muzzle:[0,.05,-.51],mag:[0,-.05,-.08],eject:[0,.06,-.06]},
  duckfoot:{piv:{aux:[0,.045,.02]},parts:[...pGrip('wood2',-.035,.012,.25),...tGuard(-.035),Pt(0,.02,-.03,.07,.03,.08,'brass'),Pt(0,.02,-.03,.072,.006,.06,'gold'),
    ...[0,1,2,3].flatMap(k=>{const a=(k-1.5)*.11,x0=(k-1.5)*.014,x1=x0+Math.sin(a)*.17,z1=-.06-Math.cos(a)*.17;return [seg(x0,-.06,x1,z1,.032,.017,.017,'gunmetal'),Pt(x1,.032,z1,.022,.022,.01,'brass',{ry:-a})]}),
    ...TAG('aux',[Pt(0,.05,-.01,.02,.02,.04,'steel'),Pt(0,.056,.03,.008,.02,.012,'steel',{rx:-.4})])],
    grip:[0,-.02,.005],sup:[-.012,-.045,.01],muzzle:[0,.032,-.23],mag:[0,.03,-.04],eject:[.02,.05,-.03]},
  sterling:{parts:[Pt(0,.03,-.12,.05,.05,.36,'vent'),Pt(0,.03,-.12,.054,.054,.02,'blk'),Pt(0,.03,-.3,.056,.056,.03,'gold'),Pt(0,.03,-.32,.02,.02,.04,'steel'),Pt(0,.03,-.342,.014,.014,.004,'muzzle'),
    ...TAG('mag',[Pt(-.09,.025,-.1,.13,.028,.034,'blk'),Pt(-.155,.025,-.1,.008,.032,.038,'blk2')]),Pt(-.03,.025,-.1,.012,.034,.04,'steel'),...TAG('chg',[Pt(.03,.045,.02,.014,.012,.012,'steel'),Pt(.04,.045,.02,.006,.018,.018,'blk')]),
    ...pGrip('grip2',-.04,.03,.25),...tGuard(-.01),Pt(0,-.015,-.36,.006,.024,.22,'bright'),Pt(0,-.015,-.47,.006,.012,.03,'bright'),Pt(0,-.012,-.25,.02,.03,.03,'steel'),Pt(0,-.01,-.24,.03,.008,.008,'gold'),
    Pt(.02,.0,.12,.008,.012,.24,'blk2'),Pt(-.02,.0,.12,.008,.012,.24,'blk2'),Pt(0,-.01,.24,.05,.07,.012,'blk2')],
    grip:[0,-.03,.02],sup:[-.07,.02,-.1],muzzle:[0,.03,-.345],mag:[-.09,.025,-.1],eject:[.03,.04,-.06]},
  // projectiles and the heavy zombie's trap (open / sprung)
  boltp:{parts:[Pt(0,0,0,.008,.008,.42,'bright'),Pt(0,0,-.215,.014,.014,.03,'steel'),Pt(0,.009,.17,.002,.018,.06,'red'),Pt(.009,0,.17,.018,.002,.06,'red')],grip:[0,0,0],muzzle:[0,0,0]},
  harpp:{parts:[Pt(0,0,0,.016,.016,.36,'steel'),Pt(0,0,-.2,.04,.01,.08,'gold',{rz:.785}),Pt(0,0,-.2,.04,.01,.08,'gold',{rz:-.785}),Pt(0,0,-.245,.016,.016,.03,'gold'),Pt(0,0,.17,.03,.03,.03,'lacR')],grip:[0,0,0],muzzle:[0,0,0]},
  discp:{parts:[...[0,1,2,3].map(k=>Pt(0,0,0,.26,.008,.11,'sawd',{ry:k*Math.PI/4})),...[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>{const a=k/12*TAU;return Pt(Math.cos(a)*.13,0,Math.sin(a)*.13,.024,.009,.024,'steel',{ry:-a})}),Pt(0,0,0,.06,.016,.06,'gold')],grip:[0,0,0],muzzle:[0,0,0]},
  slugp:{parts:[Pt(0,0,0,.04,.04,.06,'gold'),Pt(0,0,-.035,.03,.03,.02,'red'),Pt(0,0,.032,.042,.042,.006,'brass')],grip:[0,0,0],muzzle:[0,0,0]},
  trap:{parts:[Pt(0,.01,0,.34,.02,.34,'blk'),Pt(.2,.025,0,.05,.03,.12,'steel'),Pt(-.2,.025,0,.05,.03,.12,'steel'),Pt(0,.024,0,.12,.008,.12,'gunmetal'),
    Pt(0,.022,-.17,.36,.014,.04,'steel'),Pt(0,.022,.17,.36,.014,.04,'steel'),...[0,1,2,3,4,5].flatMap(k=>[Pt(-.15+k*.06,.04,-.17,.014,.03,.014,'bright'),Pt(-.15+k*.06,.04,.17,.014,.03,.014,'bright')]),Pt(.05,.021,.06,.08,.004,.06,'flesh')],grip:[0,0,0],muzzle:[0,0,0]},
  trapC:{parts:[Pt(0,.01,0,.34,.02,.34,'blk'),Pt(.2,.025,0,.05,.03,.12,'steel'),Pt(-.2,.025,0,.05,.03,.12,'steel'),
    Pt(0,.12,-.03,.36,.2,.016,'steel',{rx:.16}),Pt(0,.12,.03,.36,.2,.016,'steel',{rx:-.16}),...[0,1,2,3,4,5].map(k=>Pt(-.15+k*.06,.23,0,.014,.04,.05,'bright'))],grip:[0,0,0],muzzle:[0,0,0]},
};
Object.assign(GUNS,NYG);

// ---------- stats (CSO numbers where known; mechanics in the comments) ----------
Object.assign(WPN,{
  // crossbows: quiet bolts with travel time, scope on RMB; the Advance's bolts pass through up to three targets
  xbow:{slot:1,kind:'rifle',ny:1,n:['크로스보우','Crossbow'],cost:3000,mag:50,res:150,dmg:30,rpm:400,semi:1,spread:[.003,.03,.09],spreadZ:.0008,zoom:[40],rec:[.012,.004],kb:2.4,stag:.25,hs:3,reload:2.8,draw:.7,speed:.95,snd:'xbow',model:'xbow',hold:'rifle',proj:'bolt',quiet:1},
  xbowa:{slot:1,kind:'rifle',ny:1,n:['크로스보우 어드밴스','Crossbow Advance'],cost:3800,mag:50,res:150,dmg:33,rpm:520,semi:1,spread:[.003,.028,.09],spreadZ:.0006,zoom:[38],rec:[.012,.004],kb:2.6,stag:.25,hs:3,reload:2.6,draw:.7,speed:.95,snd:'xbowa',model:'xbowa',hold:'rifle',proj:'bolt',pierce:3,quiet:1},
  // Volcano: 40 rounds of 12-gauge out of six turning barrels
  volc:{slot:1,kind:'shotgun',ny:1,n:['볼케이노','Volcano'],cost:7000,mag:40,res:120,pellets:6,dmg:27,rpm:420,spin:.25,spread:[.05,.065,.1],rec:[.03,.02],kb:2.4,stag:.35,hs:2,reload:4.2,draw:1,speed:.82,snd:'volc',model:'volc',hold:'rifle',shell:1},
  // dragon cannons: a cone of dragon fire that hits everything in front three times and sets it alight
  bdc:{slot:1,kind:'special',ny:1,n:['흑룡포','Black Dragon Cannon'],cost:6500,mag:20,res:40,dmg:85,rpm:55,semi:1,cone:{r:9,a:.55,ticks:3,burn:3,kb:9,up:3.5},spread:[0,0,0],rec:[.12,.03],kb:9,stag:.8,hs:1,shellRel:.32,relStart:.35,draw:1,speed:.85,snd:'bdc',model:'bdc',hold:'rifle'},
  rdc:{slot:1,kind:'special',ny:1,n:['적룡포','Red Dragon Cannon'],cost:9000,mag:30,res:60,dmg:100,rpm:60,semi:1,cone:{r:10,a:.6,ticks:3,burn:4,kb:11,up:4,red:1},alt:'dragon',spread:[0,0,0],rec:[.12,.03],kb:11,stag:.8,hs:1,shellRel:.3,relStart:.35,draw:1,speed:.84,snd:'rdc',model:'rdc',hold:'rifle'},
  // Ripper: hold LMB to grind (no knockback, heavy stagger, uses fuel); RMB swings it into a crowd (huge knockback, free)
  ripper:{slot:1,kind:'saw',ny:1,n:['리퍼','Ripper'],cost:5000,mag:200,res:400,dmg:34,rpm:600,range:2.2,alt:'swing',swDmg:120,swKb:20,swCd:.9,reload:3.2,draw:1.1,speed:.95,snd:'sawrev',model:'ripper',hold:'rifle',spread:[0,0,0],rec:[0,0],kb:0,stag:.6,hs:1},
  // Gae Bolg: the harpoon sticks and blows up a second later; RMB blows every harpoon at once (and you can ride the blast)
  gaebolg:{slot:1,kind:'special',ny:1,n:['게이볼그','Gae Bolg'],cost:6000,mag:3,res:21,dmg:114,rpm:90,semi:1,proj:'harpoon',alt:'detonate',spread:[.003,.02,.06],rec:[.08,.02],kb:4,stag:.5,hs:1,shellRel:.6,relStart:.35,draw:.9,speed:.9,snd:'harpoon',model:'gaebolg',hold:'rifle'},
  // 혈적자: a spinning blade that cuts through everything for 19 m and comes back; a head hit grinds for 126
  xdz:{slot:1,kind:'special',ny:1,n:['혈적자','Blood Dripper'],cost:5500,mag:50,res:100,dmg:32,hsDmg:126,rpm:150,proj:'disc',spread:[.002,.015,.05],rec:[.03,.01],kb:3,stag:.4,hs:1,reload:3,draw:.8,speed:.95,snd:'disc',model:'xdz',hold:'rifle'},
  // Magnum Drill: automatic 12-gauge through a turning drill; RMB drives the drill into whatever is in front
  mdrill:{slot:1,kind:'shotgun',ny:1,n:['매그넘 드릴','Magnum Drill'],cost:8000,mag:30,res:90,pellets:7,dmg:28,rpm:400,spread:[.05,.065,.1],rec:[.035,.02],kb:2.6,stag:.35,hs:2,reload:3.8,alt:'drill',draw:1,speed:.85,snd:'mdrill',model:'mdrill',hold:'rifle',shell:1},
  // Magnum Launcher: three explosive slugs per pull
  mlaunch:{slot:1,kind:'special',ny:1,n:['매그넘 런처','Magnum Launcher'],cost:7500,mag:10,res:30,dmg:160,rpm:100,semi:1,proj:'slug',slugs:3,spread:[.02,.04,.08],rec:[.1,.03],kb:10,stag:.7,hs:1,reload:3.4,draw:.9,speed:.86,snd:'mlaunch',model:'mlaunch',hold:'rifle'},
  // the 2017 rewards: a four-barrel volley pistol and a bayonet SMG (RMB stab)
  duckfoot:{slot:2,kind:'pistol',ny:1,n:['스페셜 덕 풋 건','Special Duck Foot Gun'],cost:2000,mag:8,res:40,dmg:45,rpm:150,semi:1,fan:4,fanA:.17,spread:[.006,.02,.06],rec:[.07,.02],kb:3,stag:.35,hs:3,reload:3,draw:.6,speed:.98,snd:'duck',model:'duckfoot',hold:'pistol'},
  sterling:{slot:1,kind:'smg',ny:1,n:['스털링 바요넷','Sterling Bayonet'],cost:2600,mag:34,res:170,dmg:26,rpm:550,alt:'bayonet',bayDmg:95,bayKb:7,bayCd:.65,spread:[.012,.03,.09],rec:[.01,.008],kb:2,stag:.22,hs:3,reload:2.6,draw:.65,speed:.97,snd:'sterling',model:'sterling',hold:'rifle',shell:1},
});
const NY_LIST=['xbow','xbowa','volc','bdc','rdc','ripper','gaebolg','xdz','mdrill','mlaunch'];
BUY_MENU.find(c=>c.k==='pistol').items.push('duckfoot');BUY_MENU.find(c=>c.k==='smg').items.push('sterling');
BUY_MENU.splice(BUY_MENU.length-1,0,{k:'ny',n:['근하신년','New Year'],items:NY_LIST});
Object.assign(VM_POS,{xbow:{p:[.15,-.16,-.34],r:[0,.085,.035]},xbowa:{p:[.15,-.16,-.34],r:[0,.085,.035]},volc:{p:[.17,-.2,-.47],r:[0,.075,.03]},
  bdc:{p:[.17,-.22,-.38],r:[0,.07,.03]},rdc:{p:[.17,-.225,-.38],r:[0,.07,.03]},ripper:{p:[.2,-.25,-.2],r:[.1,.2,.06]},gaebolg:{p:[.15,-.17,-.36],r:[0,.08,.035]},
  xdz:{p:[.15,-.17,-.33],r:[0,.08,.035]},mdrill:{p:[.16,-.19,-.38],r:[0,.08,.035]},mlaunch:{p:[.16,-.19,-.37],r:[0,.08,.035]},duckfoot:{p:[.12,-.14,-.36],r:[0,.07,.02]},sterling:{p:[.14,-.16,-.33],r:[0,.08,.03]}});

// ---------- shared state ----------
const NY={pend:[],dragons:[],traps:[],letters:[],tex:{},
  clear(){this.pend.length=0;for(const d of this.dragons)if(d.light)d.light.dead=true;this.dragons.length=0;for(const t of this.traps)R.scene.remove(t.mesh);this.traps.length=0;
    for(const l of this.letters){R.scene.remove(l.spr);if(l.light)l.light.dead=true}this.letters.length=0}};
function nyLater(t,fn){NY.pend.push({t,fn,g:NET.ghost>0})}

// ---------- firing ----------
const _nd=new THREE.Vector3(),_nyq=new THREE.Vector3();
function nyLaunch(a,W,eye,dir){
  if(W.proj==='slug'){for(let i=0;i<(W.slugs||1);i++){const d=i===0?dir:spreadDir(dir,W.spread[0]*2+.035,_nyq.clone());nyProj(a,W,eye,d,'slug')}return}
  nyProj(a,W,eye,dir,W.proj)}
function nyProj(a,W,eye,dir,kind){const sp={bolt:78,harpoon:56,disc:24,slug:46}[kind];const mdl={bolt:'boltp',harpoon:'harpp',disc:'discp',slug:'slugp'}[kind];
  const n={kind,owner:a,w:a.cur,x:eye.x+dir.x*.55,y:eye.y+dir.y*.55-.06,z:eye.z+dir.z*.55,vx:dir.x*sp,vy:dir.y*sp,vz:dir.z*sp,t:0,mesh:null,spin:0,hit:new Set(),upd:PROJ_UPD[kind]};
  if(kind==='disc'){n.out=true;n.dist=0}
  const m=new THREE.Mesh(gunGeo(mdl),matGun());m.position.set(n.x,n.y,n.z);if(kind!=='disc')m.lookAt(n.x-n.vx,n.y-n.vy,n.z-n.vz);R.scene.add(m);n.mesh=m;NADES.push(n);
  NET.on&&netFxPush(['p',a.id,WI[a.cur],kind,r2(n.x),r2(n.y),r2(n.z),r2(n.vx),r2(n.vy),r2(n.vz)]);return n}
// nearest enemy along a ray that this projectile has not hit yet
function rayActorsX(n,ox,oy,oz,dx,dy,dz,tmax){const src=n.owner;let best=null,bt=tmax,part=null;
  for(const t of G.actors){if(!t.alive||t===src||t.team===src.team||n.hit.has(t))continue;const c=t.c;const lx=c.x-ox,lz=c.z-oz;const tc=lx*dx+lz*dz;if(tc<-1||tc>bt+1)continue;
    const h=t.headR||.14;const th=raySphere(ox,oy,oz,dx,dy,dz,t.head.x,t.head.y,t.head.z,h*1.15,bt);if(th>=0){bt=th;best=t;part='head'}
    const hw=(t.hitW||c.hw)+.04,top=t.head.y-h*.85;const tb=rayAABB(ox,oy,oz,dx,dy,dz,c.x-hw,c.y,c.z-hw,c.x+hw,top,c.z+hw,bt);if(tb>=0&&tb<bt){bt=tb;best=t;part=(oy+dy*tb)<c.y+(top-c.y)*.45?'legs':'body'}}
  return best?{a:best,t:bt,part}:null}
// move a projectile through the world for dt: onActor/onWorld answer 'go' (keep flying), 'stop' (stay where it is) or 'kill' (remove)
function projStep(n,dt,grav,onActor,onWorld){const sp0=Math.hypot(n.vx,n.vy,n.vz);const steps=Math.max(1,Math.ceil(sp0*dt/.5));const h=dt/steps;
  for(let s=0;s<steps;s++){n.vy-=grav*h;const sp=Math.hypot(n.vx,n.vy,n.vz);let rem=sp*h;if(rem<1e-6)continue;const dx=n.vx/sp,dy=n.vy/sp,dz=n.vz/sp;
    for(let guard=0;guard<6&&rem>1e-5;guard++){const hw=rayCast(n.x,n.y,n.z,dx,dy,dz,rem+.02,SHOT_FILTER);const tW=hw?Math.min(rem,hw.t):rem;const wn=hw?[hw.nx,hw.ny,hw.nz]:null,box=hw?hw.box:null;
      const ha=rayActorsX(n,n.x,n.y,n.z,dx,dy,dz,tW);
      if(ha){n.x+=dx*ha.t;n.y+=dy*ha.t;n.z+=dz*ha.t;rem-=ha.t;const r=onActor(n,ha,dx,dy,dz);if(r!=='go')return r;continue}
      if(hw&&hw.t<=rem+.02){const k=Math.max(0,tW-.03);n.x+=dx*k;n.y+=dy*k;n.z+=dz*k;return onWorld(n,wn,box,dx,dy,dz)}
      n.x+=dx*rem;n.y+=dy*rem;n.z+=dz*rem;rem=0}}
  return null}
function projHitFx(n,ha,dx,dy,dz,amt){FX.blood(n.x,n.y,n.z,dx,dy,dz,amt,false);AU.at('imp_flesh',n.x,n.y,n.z,{vol:.6});if(n.owner.isPlayer){HUD.hitmark(ha.part==='head');if(ha.part==='head')AU.play('headshot',{vol:.6})}}
function projWallFx(n,wn,box,snd){const m=box&&(box.o.f&&box.o.f[nf(wn)]||box.mat)||'conc';FX.impact(n.x,n.y,n.z,wn[0],wn[1],wn[2],m);AU.at(snd||'hstick',n.x,n.y,n.z,{vol:.55,range:28})}
const PROJ_UPD={
  bolt(n,dt){const W=WPN[n.w]||WPN.xbow;
    if(n.stuck){n.life-=dt;return n.life<=0}
    const r=projStep(n,dt,2.5,(n,ha,dx,dy,dz)=>{const t=ha.a,hs=ha.part==='head';damageActor(t,W.dmg*(hs?W.hs:ha.part==='legs'?.75:1),n.owner,{w:n.w,hs,dir:[dx,dy,dz],kb:W.kb,stag:W.stag,x:n.x,y:n.y,z:n.z});
        n.hit.add(t);projHitFx(n,ha,dx,dy,dz,hs?1.4:.8);return W.pierce&&n.hit.size<W.pierce?'go':'kill'},
      (n,wn,box)=>{projWallFx(n,wn,box);n.stuck=true;n.life=8;return 'stop'});
    if(r==='kill')return true;
    if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);if(!n.stuck)n.mesh.lookAt(n.x-n.vx,n.y-n.vy,n.z-n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
    return (!n.stuck&&n.t>3)||n.y<-10},
  harpoon(n,dt){const W=WPN.gaebolg;
    if(n.stuck){if(n.stA){const t=n.stA;if(!t.alive)n.stA=null;else{n.x=t.c.x+n.off[0];n.y=t.c.y+n.off[1];n.z=t.c.z+n.off[2]}}
      n.fuse-=dt;if(n.mesh)n.mesh.position.set(n.x,n.y,n.z);
      if(Math.random()<dt*24)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.3,.3),vy:rr(.2,.8),vz:rr(-.3,.3),life:.2,s0:.07,s1:.02,r:1,g:.55,b:.2,f:1,add:1});
      if(n.fuse<=0){harpoonBoom(n);return true}return false}
    const r=projStep(n,dt,4,(n,ha,dx,dy,dz)=>{const t=ha.a;damageActor(t,W.dmg,n.owner,{w:'gaebolg',hs:false,dir:[dx,dy,dz],kb:W.kb,stag:.6,x:n.x,y:n.y,z:n.z});projHitFx(n,ha,dx,dy,dz,1);
        n.stuck=true;n.stA=t.alive?t:null;n.off=[n.x-t.c.x,n.y-t.c.y,n.z-t.c.z];n.fuse=1;AU.at('hstick',n.x,n.y,n.z,{vol:.8});return 'stop'},
      (n,wn,box)=>{projWallFx(n,wn,box);n.stuck=true;n.fuse=1;return 'stop'});
    if(r==='kill')return true;
    if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);if(!n.stuck)n.mesh.lookAt(n.x-n.vx,n.y-n.vy,n.z-n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
    if(Math.random()<.5)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.1,.1),vy:rr(0,.2),vz:rr(-.1,.1),life:rr(.3,.5),s0:.05,s1:.18,r:.6,g:.6,b:.6,a:.3,f:2,drag:2});
    return n.t>6||n.y<-10},
  disc(n,dt){const W=WPN.xdz,o=n.owner;n.spin+=dt*38;
    if(!n.out){if(!o.alive)return true;const e=actorEye(o);const dx=e.x-n.x,dy=e.y-.3-n.y,dz=e.z-n.z,d=Math.hypot(dx,dy,dz);if(d<.8){if(o.isPlayer)AU.play('pickup',{vol:.35,rate:1.4});return true}
      const sp=28,k=Math.min(1,dt*7);n.vx=lerp(n.vx,dx/d*sp,k);n.vy=lerp(n.vy,dy/d*sp,k);n.vz=lerp(n.vz,dz/d*sp,k)}
    const x0=n.x,z0=n.z;
    const r=projStep(n,dt,0,(n,ha,dx,dy,dz)=>{const t=ha.a,hs=ha.part==='head';damageActor(t,hs?W.hsDmg:W.dmg*(ha.part==='legs'?.75:1),n.owner,{w:'xdz',hs,dir:[dx,0,dz],kb:W.kb,stag:.45,x:n.x,y:n.y,z:n.z});
        n.hit.add(t);projHitFx(n,ha,dx,dy,dz,hs?2:1);if(!AU.throttle('dh'+n.owner.id,60))AU.at('dischit',n.x,n.y,n.z,{vol:.7});return 'go'},
      (n,wn,box,dx,dy,dz)=>{projWallFx(n,wn,box,'dischit');for(let i=0;i<6;i++)FX.spark(n.x,n.y,n.z,wn[0]*rr(2,5)+rr(-2,2),rr(0,3),wn[2]*rr(2,5)+rr(-2,2),rr(.1,.3));
        if(n.out){n.out=false;n.hit.clear();const vn=n.vx*wn[0]+n.vy*wn[1]+n.vz*wn[2];n.vx-=2*vn*wn[0];n.vy-=2*vn*wn[1];n.vz-=2*vn*wn[2];return 'stop'}return 'kill'});
    if(r==='kill')return true;
    if(n.out){n.dist+=Math.hypot(n.x-x0,n.z-z0);if(n.dist>19){n.out=false;n.hit.clear()}}
    if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.rotation.set(0,n.spin,0);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
    if(Math.random()<.4)FX.spawn({x:n.x,y:n.y,z:n.z,life:.12,s0:.3,s1:.1,r:.9,g:.4,b:.3,a:.35,f:14,add:1});
    return n.t>7},
  slug(n,dt){const r=projStep(n,dt,6,(n)=>{slugBoom(n);return 'kill'},(n)=>{slugBoom(n);return 'kill'});if(r==='kill')return true;
    if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.lookAt(n.x-n.vx,n.y-n.vy,n.z-n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
    FX.spawn({x:n.x,y:n.y,z:n.z,life:.08,s0:.12,s1:.04,r:1,g:.7,b:.3,f:1,add:1});if(Math.random()<.6)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.2,.2),vy:rr(0,.3),vz:rr(-.2,.2),life:rr(.4,.7),s0:.06,s1:.25,r:.5,g:.5,b:.5,a:.35,f:2,drag:2});
    if(n.t>4){slugBoom(n);return true}return false},
};
// explosions
function blastDamage(src,x,y,z,R0,dmg,kb,up,w,o){let n=0;for(const t of G.actors){if(!t.alive||t.team===src.team)continue;const dx=t.c.x-x,dy=t.c.y+1-y,dz=t.c.z-z,d=Math.hypot(dx,dy,dz);if(d>R0)continue;
    if(!losClear(x,y+.25,z,t.c.x,t.c.y+1,t.c.z))continue;const f=1-d/R0;damageActor(t,dmg*(.35+.65*f),src,Object.assign({w,dir:[dx/(d||1),.3,dz/(d||1)],kb:kb*f,stag:.8,x:t.c.x,y:t.c.y+1,z:t.c.z,up:up*f},o||{}));n++}return n}
function nearShake(x,y,z,r,k){if(!G.player)return;const d=Math.hypot(G.player.c.x-x,G.player.c.y+1-y,G.player.c.z-z);if(d<r){FX.shake=Math.max(FX.shake,k*(1-d/r));AU.shock(k*.8*(1-d/r))}}
function harpoonBoom(n){const x=n.x,y=n.y,z=n.z;FX.explode(x,y,z,'he');AU.at('explode',x,y,z,{vol:.9,range:80,occ:false,rate:1.18});nearShake(x,y,z,11,.8);
  blastDamage(n.owner,x,y,z,4.5,330,14,5,'gaebolg',{he:1});
  // the blast can throw its own shooter (a rocket jump); it never hurts humans
  const o=n.owner;if(!NET.ghost&&o&&o.alive&&o.team===TH){const dx=o.c.x-x,dy=o.c.y+.9-y,dz=o.c.z-z,d=Math.hypot(dx,dy,dz);if(d<3.6){const f=1-d/3.6,h=Math.hypot(dx,dz)||1;o.c.vy=Math.max(o.c.vy,4+8.5*f);o.c.onGround=false;o.c.jumped=true;o.kvx+=dx/h*7*f;o.kvz+=dz/h*7*f}}}
function miniBlast(x,y,z,s){FX.spawn({x,y:y+.2,z,life:.2,s0:1.2*s,s1:3*s,r:1,g:.75,b:.4,f:1,add:1});FX.spawn({x,y:y+.15,z,life:.25,s0:.5*s,s1:5*s,r:1,g:.8,b:.55,a:.6,f:14,add:1});
  for(let i=0;i<14;i++){const a=Math.random()*TAU,e=rr(.1,1.2),sp=rr(5,12);FX.spark(x,y+.2,z,Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp,Math.sin(a)*Math.cos(e)*sp,rr(.2,.6))}
  for(let i=0;i<10;i++){const a=Math.random()*TAU,sp=rr(1.5,5);FX.spawn({x,y:y+.3,z,vx:Math.cos(a)*sp,vy:rr(.5,3),vz:Math.sin(a)*sp,life:rr(.25,.5),s0:.35*s,s1:.8*s,r:1,g:rr(.45,.7),b:.2,f:11,drag:3,add:1})}
  for(let i=0;i<12;i++){const a=Math.random()*TAU,sp=rr(.4,2.5);FX.spawn({x,y:y+.4,z,vx:Math.cos(a)*sp,vy:rr(.4,2),vz:Math.sin(a)*sp,life:rr(1.2,2.4),s0:.4*s,s1:1.6*s,r:.2,g:.19,b:.18,a:.55,f:Math.random()<.5?2:3,drag:1.6,grav:-.3,lit:1})}
  DL.add(x,y+.8,z,'#ffa040',10*s,2.6,.45);const h=rayCast(x,y+.3,z,0,-1,0,2);if(h)FX.decal(x,y+.3-h.t,z,0,1,0,.9*s,8,[1,1,1],.85)}
function slugBoom(n){const W=WPN.mlaunch;miniBlast(n.x,n.y,n.z,1);AU.at('explode',n.x,n.y,n.z,{vol:.55,range:60,occ:false,rate:1.55});nearShake(n.x,n.y,n.z,8,.45);
  blastDamage(n.owner,n.x,n.y,n.z,2.8,W.dmg,W.kb,3,'mlaunch',{he:1})}
// dragon fire: every enemy inside the cone with a clear line takes three hits over a third of a second and starts burning
function coneBlast(a,W,eye,dir){const C=W.cone,red=!!C.red;const mz=muzzleWorld(a);const ox=mz.x,oy=mz.y,oz=mz.z;
  for(let i=0;i<64;i++){spreadDir(dir,C.a*.8,_nd);const sp=C.r*rr(1.3,2.3);FX.spawn({x:ox,y:oy,z:oz,vx:_nd.x*sp,vy:_nd.y*sp+rr(0,.9),vz:_nd.z*sp,life:rr(.32,.58),s0:rr(.16,.3),s1:rr(.7,1.3),r:1,g:red?rr(.3,.5):rr(.42,.62),b:red?.1:.18,a:.7,f:11,drag:2.4,add:1})}
  for(let i=0;i<22;i++){spreadDir(dir,C.a*.7,_nd);const sp=C.r*rr(.6,1.4);FX.spawn({x:ox,y:oy,z:oz,vx:_nd.x*sp,vy:_nd.y*sp+rr(.3,1),vz:_nd.z*sp,life:rr(.9,1.6),s0:.3,s1:rr(1.4,2.4),r:red?.22:.1,g:red?.12:.08,b:red?.1:.12,a:.55,f:Math.random()<.5?2:3,drag:2,grav:-.4,lit:1})}
  for(let i=0;i<20;i++){spreadDir(dir,C.a,_nd);const sp=rr(8,18);FX.spark(ox,oy,oz,_nd.x*sp,_nd.y*sp+rr(0,2),_nd.z*sp,rr(.3,.7),red?[1,.55,.2]:[1,.8,.35])}
  FX.spawn({x:ox+dir.x*.6,y:oy+dir.y*.6,z:oz+dir.z*.6,life:.12,s0:.6,s1:1.2,r:1,g:red?.45:.6,b:.2,a:.8,f:1,add:1});FX.spawn({x:ox+dir.x*.5,y:oy+dir.y*.5,z:oz+dir.z*.5,life:.25,s0:.3,s1:2.2,r:1,g:.7,b:.35,a:.45,f:14,add:1});
  DL.add(ox+dir.x*2.5,oy+dir.y*2.5,oz+dir.z*2.5,red?'#ff4818':'#ff7a30',13,3.4,.4);
  const cosA=Math.cos(C.a);let n=0;
  for(const t of G.actors){if(!t.alive||t.team===a.team)continue;const tx=t.c.x,ty=t.c.y+t.c.h*.55,tz=t.c.z;const dx=tx-eye.x,dy=ty-eye.y,dz=tz-eye.z,d=Math.hypot(dx,dy,dz);if(d>C.r+t.c.hw)continue;
    const cs=(dx*dir.x+dy*dir.y+dz*dir.z)/(d||1);if(cs<cosA&&d>1.3)continue;if(!losClear(eye.x,eye.y,eye.z,tx,ty,tz))continue;n++;
    const f=clamp(1-d/(C.r*1.4),.3,1),id=a.cur;
    for(let k=0;k<C.ticks;k++)nyLater(k*.11,()=>{if(!t.alive)return;const dealt=damageActor(t,W.dmg*(.6+.4*f),a,{w:id,dir:[dx/d,.2,dz/d],kb:C.kb*f/C.ticks,stag:.6,x:tx,y:ty,z:tz,up:k===0?C.up*f:0})||0;
      FX.spawn({x:tx+rr(-.2,.2),y:ty+rr(-.3,.3),z:tz+rr(-.2,.2),vy:rr(.5,1.2),life:rr(.3,.5),s0:.35,s1:.1,r:1,g:.5,b:.15,f:11,add:1});
      if(W.alt==='dragon'&&a.alive)a.dragonG=Math.min(1,(a.dragonG||0)+dealt/2600)});
    if(!NET.ghost){t.burnT=Math.max(t.burnT||0,C.burn);t.burnSrc=a;t.burnW=a.cur}}
  if(n&&a.isPlayer)HUD.hitmark(false)}

// ---------- the Ripper ----------
function sawUpdate(a,W,dt){const cmd=a.cmd,pc=a.pc,am=a.ammo[a.cur];
  const cutting=!!cmd.fire&&am.mag>0&&a.drawT<=0;a.sawRev=approach(a.sawRev||0,cutting?1:.22,dt*(cutting?6:2));a.sawCut=cutting;
  if(cutting&&G.t>=a.nextFire){a.nextFire=G.t+60/W.rpm;am.mag--;a.an.atk=Math.max(a.an.atk,.55);a.an.atkD=.3;a.an.heavy=false;a.lastFire=G.t;
    const r=meleeHit(a,W.range,.55);
    if(r&&r.t){const t=r.t;aimDir(a.yaw,0,_dv);damageActor(t,W.dmg,a,{w:a.cur,dir:[_dv.x,0,_dv.z],kb:0,stag:.9,x:t.c.x,y:t.c.y+1.1,z:t.c.z});if(!NET.ghost){t.staggerT=Math.max(t.staggerT,.6);t.an.flinch=1}
      FX.blood(t.c.x,t.c.y+1.1,t.c.z,_dv.x,.4,_dv.z,1.4,false);if(Math.random()<.5)FX.spark(t.c.x,t.c.y+1.1,t.c.z,rr(-2,2),rr(1,3),rr(-2,2),.2,[1,.6,.4]);
      if(!AU.throttle('saw'+a.id,150))AU.at('sawhit',t.c.x,t.c.y+1.1,t.c.z,{vol:.85});if(a.isPlayer){HUD.hitmark(false);FX.shake=Math.max(FX.shake,.14)}a.sawBite=1}
    else if(r&&r.wall){if(Math.random()<.5)FX.impact(r.x,r.y,r.z,r.n[0],r.n[1],r.n[2],r.wall.box.mat);for(let i=0;i<3;i++)FX.spark(r.x,r.y,r.z,r.n[0]*rr(2,6)+rr(-2,2),rr(1,4),r.n[2]*rr(2,6)+rr(-2,2),rr(.15,.4));
      if(!AU.throttle('sawW'+a.id,180))AU.at('kwall',r.x,r.y,r.z,{vol:.5,rate:1.3})}}
  if(!a.isPlayer&&cutting&&!AU.throttle('sawB'+a.id,500))AU.at('sawrev',a.c.x,a.c.y+1.2,a.c.z,{vol:.6,range:35});
  if(cmd.alt&&!pc.alt&&G.t>=(a.altNext||0)&&a.drawT<=0){a.altNext=G.t+W.swCd;sawSwing(a,W)}}
function sawSwing(a,W){a.an.atk=1;a.an.atkD=.6;a.an.heavy=true;a.an.atkSide=-(a.an.atkSide||1);NET.on&&netFxPush(['s',a.id]);
    if(a.isPlayer){AU.play('kswing',{vol:.85,rate:.7});VM.nySwing=.55}else AU.at('kswing',a.c.x,a.c.y+1.3,a.c.z,{vol:.6,rate:.7});
    nyLater(.2,()=>{if(!a.alive||a.cur!=='ripper')return;const e=actorEye(a);aimDir(a.yaw,0,_dv);let n=0;
      for(const t of G.actors){if(!t.alive||t.team===a.team)continue;const dx=t.c.x-e.x,dz=t.c.z-e.z,d=Math.hypot(dx,dz)-t.c.hw;if(d>2.6||Math.abs(t.c.y-a.c.y)>1.6)continue;if((dx*_dv.x+dz*_dv.z)/(Math.hypot(dx,dz)||1)<.3&&d>.4)continue;
        if(!losClear(e.x,e.y,e.z,t.c.x,t.c.y+1.1,t.c.z))continue;damageActor(t,W.swDmg,a,{w:a.cur,dir:[_dv.x,.15,_dv.z],kb:W.swKb,stag:.75,x:t.c.x,y:t.c.y+1.1,z:t.c.z,up:3});FX.blood(t.c.x,t.c.y+1.1,t.c.z,_dv.x,.3,_dv.z,1.6,false);n++}
      if(n){AU.at('khit',a.c.x,a.c.y+1.2,a.c.z,{vol:.9,rate:.8});if(a.isPlayer){HUD.hitmark(false);FX.shake=Math.max(FX.shake,.35)}}})}

// ---------- right-button actions ----------
function nyAlt(a,W){
  if(W.alt==='detonate'){let n=0;for(const p of NADES)if(p.kind==='harpoon'&&p.owner===a){p.stuck=true;p.fuse=Math.min(p.fuse==null?0:p.fuse,0);p.vx=p.vy=p.vz=0;n++}if(n){if(a.isPlayer)AU.play('ui',{vol:.4,rate:1.4});nyAltFx(a)}return}
  if(W.alt==='bayonet'){if(G.t<(a.altNext||0))return;nyAltFx(a);a.altNext=G.t+W.bayCd;a.nextFire=Math.max(a.nextFire,G.t+.35);a.an.atk=1;a.an.atkD=.4;a.an.heavy=false;
    if(a.isPlayer){VM.nyStab=.38;AU.play('kswing',{vol:.7,rate:1.2})}else AU.at('kswing',a.c.x,a.c.y+1.3,a.c.z,{vol:.5,rate:1.2});
    nyLater(.13,()=>{if(!a.alive||a.cur!=='sterling')return;const r=meleeHit(a,2.15,.62);if(r&&r.t){const t=r.t;aimDir(a.yaw,0,_dv);damageActor(t,W.bayDmg,a,{w:'sterling',dir:[_dv.x,0,_dv.z],kb:W.bayKb,stag:.5,x:t.c.x,y:t.c.y+1.2,z:t.c.z});
        FX.blood(t.c.x,t.c.y+1.2,t.c.z,_dv.x,0,_dv.z,1.4,false);if(a.isPlayer){AU.play('khit',{vol:.8});HUD.hitmark(false)}else AU.at('khit',t.c.x,t.c.y+1,t.c.z,{vol:.7})}
      else if(r&&r.wall){FX.impact(r.x,r.y,r.z,r.n[0],r.n[1],r.n[2],r.wall.box.mat);if(a.isPlayer)AU.play('kwall',{vol:.5})}});return}
  if(W.alt==='drill'){if(G.t<(a.altNext||0))return;nyAltFx(a);a.altNext=G.t+2.6;a.drillT=1.1;a.nextFire=Math.max(a.nextFire,G.t+1.15);a.an.atk=1;a.an.atkD=1.1;a.an.heavy=true;
    if(a.isPlayer){VM.nyDrill=1.1;AU.play('drill',{vol:.85})}else AU.at('drill',a.c.x,a.c.y+1.2,a.c.z,{vol:.8,range:40});
    for(let k=0;k<11;k++)nyLater(.06+k*.1,()=>{if(!a.alive||a.cur!=='mdrill')return;const r=meleeHit(a,2.15,.6);if(r&&r.t){const t=r.t,last=k===10;aimDir(a.yaw,0,_dv);
        damageActor(t,last?120:42,a,{w:'mdrill',dir:[_dv.x,.1,_dv.z],kb:last?17:.6,stag:.5,x:t.c.x,y:t.c.y+1.1,z:t.c.z,up:last?3:0});FX.blood(t.c.x,t.c.y+1.1,t.c.z,_dv.x,.3,_dv.z,1.2,false);
        FX.spark(t.c.x,t.c.y+1.1,t.c.z,rr(-2,2),rr(1,3),rr(-2,2),.25,[1,.7,.4]);if(a.isPlayer){HUD.hitmark(false);FX.shake=Math.max(FX.shake,.12)}}
      else if(r&&r.wall){for(let i=0;i<3;i++)FX.spark(r.x,r.y,r.z,r.n[0]*rr(2,6)+rr(-2,2),rr(1,4),r.n[2]*rr(2,6)+rr(-2,2),rr(.15,.4))}});return}
  if(W.alt==='dragon'){if((a.dragonG||0)<1){if(a.isPlayer){HUD.note(T('nyDragonNo',Math.floor((a.dragonG||0)*100)),1.4);AU.play('dry',{vol:.5})}return}
    a.dragonG=0;nyAltFx(a);summonDragon(a)}}
function nyAltFx(a){NET.on&&netFxPush(['x',a.id,WI[a.cur]])}
function summonDragon(a){const d={owner:a,t:8,ang:Math.random()*TAU,acc:0,ghost:NET.ghost>0,light:DL.add(a.c.x,a.c.y+1.6,a.c.z,'#ff5020',8,2.4,0,{flick:.15})};NY.dragons.push(d);
  AU.at('dragon',a.c.x,a.c.y+1.5,a.c.z,{vol:1,range:80,occ:false});if(a.isPlayer){HUD.announce(T('nyDragon'),'h',2);FX.shake=Math.max(FX.shake,.4)}}
function updDragons(dt){for(let i=NY.dragons.length-1;i>=0;i--){const d=NY.dragons[i],o=d.owner;d.t-=dt;
    if(d.t<=0||!o.alive||o.team!==TH){if(d.light)d.light.dead=true;NY.dragons.splice(i,1);continue}
    d.ang+=dt*2.7;const R0=2.2,cx=o.c.x,cy=o.c.y+1.5,cz=o.c.z;
    // a body of glowing segments trailing the head round the summoner
    for(let k=0;k<16;k++){const an=d.ang-k*.13,x=cx+Math.cos(an)*R0,z=cz+Math.sin(an)*R0,y=cy+Math.sin(an*2.2+k*.5)*.3-k*.015;const s=k===0?.34:.26-k*.012;
      FX.spawn({x,y,z,vx:rr(-.1,.1),vy:rr(.05,.3),vz:rr(-.1,.1),life:rr(.08,.14),s0:s,s1:s*.5,r:1,g:k===0?.8:rr(.28,.45),b:.1,a:.8,f:k%3?11:1,add:1})}
    {const x=cx+Math.cos(d.ang)*R0,z=cz+Math.sin(d.ang)*R0;FX.spawn({x,y:cy,z,life:.08,s0:.9,s1:.5,r:1,g:.8,b:.35,f:1,add:1});if(Math.random()<.5)FX.spark(x,cy,z,rr(-2,2),rr(0,3),rr(-2,2),rr(.2,.5),[1,.8,.35]);
      if(d.light){d.light.x=x;d.light.y=cy;d.light.z=z}}
    d.acc+=dt;if(d.acc>=.45){d.acc-=.45;if(!d.ghost)for(const t of G.actors){if(!t.alive||t.team===TH)continue;const dx=t.c.x-cx,dz=t.c.z-cz,dd=Math.hypot(dx,dz);if(dd>4.6||Math.abs(t.c.y+1-cy)>2.5)continue;
        damageActor(t,150,o,{w:'rdc',dir:[dx/(dd||1),.2,dz/(dd||1)],kb:4,stag:.5,x:t.c.x,y:t.c.y+1.1,z:t.c.z});t.burnT=Math.max(t.burnT||0,2);t.burnSrc=o;t.burnW='rdc'}}}}

// ---------- burning ----------
function updBurn(dt){for(const t of G.actors){if(!(t.burnT>0))continue;if(!t.alive||t.team!==TZ){t.burnT=0;continue}t.burnT-=dt;t.burnAcc=(t.burnAcc||0)+dt;
    if(Math.random()<dt*26){const h=rr(.2,t.c.h*.95);FX.spawn({x:t.c.x+rr(-.25,.25),y:t.c.y+h,z:t.c.z+rr(-.25,.25),vx:rr(-.2,.2),vy:rr(.8,1.6),vz:rr(-.2,.2),life:rr(.25,.45),s0:rr(.2,.34),s1:.06,r:1,g:rr(.45,.65),b:.15,f:11,add:1})}
    if(Math.random()<dt*5)FX.spawn({x:t.c.x,y:t.c.y+t.c.h,z:t.c.z,vx:rr(-.2,.2),vy:rr(.6,1.2),vz:rr(-.2,.2),life:rr(.8,1.4),s0:.2,s1:.8,r:.15,g:.14,b:.13,a:.45,f:2,drag:1,lit:1});
    if(t.burnAcc>=.25&&NET.cli)t.burnAcc=0;
    if(t.burnAcc>=.25){t.burnAcc-=.25;const src=t.burnSrc&&G.actors.includes(t.burnSrc)?t.burnSrc:null;damageActor(t,11,src,{w:t.burnW||'bdc',dir:[0,0,0],kb:0,stag:.05,x:t.c.x,y:t.c.y+1,z:t.c.z})}}}

// ---------- CSO zombie skills: Light (invisibility), Heavy (trap), Voodoo (heal) ----------
function nySkill(a,Z){const c=a.c;
  if(Z.skill==='invis'){a.skillT=Z.dur;a.an.skill=.5;AU.at('invis',c.x,c.y+1.5,c.z,{vol:.9,range:30});for(let i=0;i<16;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.2,1.8),z:c.z+rr(-.3,.3),vx:rr(-.5,.5),vy:rr(-.2,.5),vz:rr(-.5,.5),life:rr(.4,.8),s0:.15,s1:.4,r:.5,g:.6,b:.7,a:.4,f:5,drag:2});
    if(a.isPlayer)HUD.note(T('nyInvis'),2);return true}
  if(Z.skill==='trap'){if(!c.onGround)return false;const fl=floorBelow(c.x,c.y+.3,c.z,.05);const T0=nyTrapAdd(a,c.x,fl>-50?fl:c.y,c.z,a.yaw);a.an.skill=.4;if(a.isPlayer)HUD.note(T('nyTrapSet'),1.5);
    if(NET.host)netEv('trap',{i:T0.id,o:a.id,x:r2(T0.x),y:r2(T0.y),z:r2(T0.z),r:r3(a.yaw)});return true}
  if(Z.skill==='heal'){a.skillT=Z.dur;a.an.skill=1.2;AU.at('heal',c.x,c.y+1.5,c.z,{vol:1,range:50});FX.spawn({x:c.x,y:c.y+1.2,z:c.z,life:.6,s0:1,s1:12,r:.4,g:1,b:.5,a:.55,f:14,add:1});DL.add(c.x,c.y+1.5,c.z,'#60ff80',9,2,.6);
    for(const t of G.actors){if(!t.alive||t.team!==TZ)continue;const d=dist3(t.c,c);if(d>8)continue;const k=t===a?.25:.2;t.hp=Math.min(t.maxHp,t.hp+t.maxHp*k);
      for(let i=0;i<8;i++)FX.spawn({x:t.c.x+rr(-.3,.3),y:t.c.y+rr(.3,1.8),z:t.c.z+rr(-.3,.3),vy:rr(.4,1),life:rr(.5,.9),s0:.12,s1:.04,r:.5,g:1,b:.55,f:8,add:1});if(t.isPlayer)HUD.note(T('healed'),1.5)}return true}
  return false}
function nyTrapAdd(a,x,y,z,yaw,id){const mine=NY.traps.filter(t=>t.owner===a);if(mine.length>=3){const o=mine[0];R.scene.remove(o.mesh);NY.traps.splice(NY.traps.indexOf(o),1)}
  const m=new THREE.Mesh(gunGeo('trap'),matGun());m.position.set(x,y,z);m.rotation.y=yaw;R.scene.add(m);sampleProbe(x,y+.3,z,m.material.uniforms.uProbe.value);
  const T0={id:id||(NY.tid=(NY.tid||0)+1),owner:a,x,y,z,mesh:m,t:45,arm:.8,closed:0,victim:null};NY.traps.push(T0);AU.at('trapset',x,y+.3,z,{vol:.9,range:25});return T0}
function nyTrapSnap(id,h){const T0=NY.traps.find(t=>t.id===id);if(!T0||T0.closed>0)return;T0.victim=h;T0.closed=1.2;R.scene.remove(T0.mesh);
  const m=new THREE.Mesh(gunGeo('trapC'),T0.mesh.material);m.position.copy(T0.mesh.position);m.rotation.y=T0.mesh.rotation.y;R.scene.add(m);T0.mesh=m;AU.at('trapsnap',T0.x,T0.y+.3,T0.z,{vol:1,range:40});
  if(h){FX.blood(h.c.x,h.c.y+.3,h.c.z,0,.5,0,.8,false);if(h.isPlayer){HUD.note(T('nyTrapped'),2.5);FX.shake=Math.max(FX.shake,.4);HUD.hurt(.25)}}}
function updTraps(dt){for(let i=NY.traps.length-1;i>=0;i--){const T0=NY.traps[i];T0.t-=dt;T0.arm-=dt;
    if(T0.closed>0){T0.closed-=dt;if(T0.victim&&T0.victim.alive&&T0.victim.rootT>0){T0.closed=Math.max(T0.closed,.3)}if(T0.closed<=0){R.scene.remove(T0.mesh);NY.traps.splice(i,1)}continue}
    if(T0.t<=0){R.scene.remove(T0.mesh);NY.traps.splice(i,1);continue}
    if(T0.arm>0||NET.cli)continue;
    for(const h of G.actors){if(!h.alive||h.team!==TH)continue;if(Math.abs(h.c.x-T0.x)>.5||Math.abs(h.c.z-T0.z)>.5||Math.abs(h.c.y-T0.y)>.5)continue;
      h.rootT=4;h.c.vx=h.c.vz=0;h.mvx=h.mvz=h.kvx=h.kvz=0;nyTrapSnap(T0.id,h);if(NET.host)netEv('tsnap',{i:T0.id,v:h.id});break}}}

// ---------- 근·하·신·년 letters: zombies you kill sometimes drop one; collect all four for a free 근하신년 weapon ----------
const NY_CH=['근','하','신','년'];
function letterTex(ch){if(NY.tex[ch])return NY.tex[ch];const [cv,x]=mkCanvas(64,64);x.clearRect(0,0,64,64);x.font="bold 44px 'Galmuri11',sans-serif";x.textAlign='center';x.textBaseline='middle';
  x.shadowColor='#ff8a00';x.shadowBlur=14;x.fillStyle='#ffe08a';x.fillText(ch,32,35);x.shadowBlur=0;x.lineWidth=2;x.strokeStyle='#8a4400';x.strokeText(ch,32,35);
  const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return NY.tex[ch]=t}
function nyOnKill(t,src){if(!src||src.team!==TH||!src.isPlayer||G.st!=='fight')return;if(Math.random()>.28)return;
  const have=src.nyL||{};const miss=NY_CH.filter(c=>!have[c]);const ch=miss.length&&Math.random()<.65?rpick(miss):rpick(NY_CH);
  const fl=floorBelow(t.c.x,t.c.y+.5,t.c.z,.05);const y=(fl>-50?fl:t.c.y)+.9;
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:letterTex(ch),transparent:true,depthWrite:false,fog:false}));spr.scale.set(.55,.55,.55);spr.position.set(t.c.x,y,t.c.z);spr.renderOrder=8;R.scene.add(spr);
  NY.letters.push({ch,x:t.c.x,y,z:t.c.z,t:25,spr,owner:src,light:DL.add(t.c.x,y,t.c.z,'#ffb030',3,1,0)})}
function updLetters(dt){for(let i=NY.letters.length-1;i>=0;i--){const L=NY.letters[i];L.t-=dt;const bob=Math.sin(G.t*3+i)*.08;L.spr.position.y=L.y+bob;L.spr.material.opacity=L.t<3?(Math.sin(G.t*20)>0?1:.3):1;
    if(Math.random()<dt*6)FX.spawn({x:L.x+rr(-.2,.2),y:L.y+bob+rr(-.2,.2),z:L.z+rr(-.2,.2),vy:rr(.2,.6),life:rr(.4,.8),s0:.06,s1:.02,r:1,g:.8,b:.3,f:8,add:1});
    const P=L.owner;let got=false;if(P&&P.alive&&P.team===TH&&Math.hypot(P.c.x-L.x,P.c.z-L.z)<1.2&&Math.abs(P.c.y+1-L.y)<1.6){got=true;nyCollect(P,L.ch)}
    if(got||L.t<=0){R.scene.remove(L.spr);L.spr.material.dispose();if(L.light)L.light.dead=true;NY.letters.splice(i,1)}}}
function nyCollect(P,ch){P.nyL=P.nyL||{};const fresh=!P.nyL[ch];P.nyL[ch]=1;AU.play('nyletter',{vol:.7});
  if(NY_CH.every(c=>P.nyL[c])){P.nyL={};P.nyFree=(P.nyFree||0)+1;HUD.announce(T('nyComplete'),'h',3);AU.play('stingH',{vol:.6})}
  else HUD.note(fresh?T('nyGot',ch):T('nyDup',ch),1.6)}

// ---------- per frame ----------
function nyUpdate(dt){for(let i=NY.pend.length-1;i>=0;i--){const p=NY.pend[i];p.t-=dt;if(p.t<=0){NY.pend.splice(i,1);if(p.g)NET.ghost++;try{p.fn()}catch(e){console.error(e)}finally{if(p.g)NET.ghost--}}}
  updBurn(dt);updDragons(dt);updTraps(dt);updLetters(dt)}

// ---------- first-person extras: saw judder and swing, bayonet stab, drill thrust, spinning blades ----------
const VMX={
  ripper(V,a,dt,o,m){const rev=a.sawRev||0;const j=.0012+rev*.0035+(a.sawBite||0)*.004;a.sawBite=Math.max(0,(a.sawBite||0)-dt*6);o[0]+=rr(-j,j);o[1]+=rr(-j,j);o[3]+=rr(-j,j)*3;
    if(a.sawCut){o[2]-=.05;o[3]+=.04}const T=m.tags.spin;if(T){T.rotation.set(0,0,0);T.position.z+=Math.sin(V.t*90*(.3+rev))*.004}
    if(V.nySwing>0){V.nySwing=Math.max(0,V.nySwing-dt);const p=1-V.nySwing/.55;kfv(NY_SW,p,_vk);for(let i=0;i<6;i++)o[i]+=_vk[i];V.camRoll+=_vk[5]*.05;V.camYaw+=_vk[4]*.03}
    AU.saw&&AU.saw(a.alive?Math.max(.25,rev):0,a.sawCut)},
  sterling(V,a,dt,o){if(V.nyStab>0){V.nyStab=Math.max(0,V.nyStab-dt);const p=1-V.nyStab/.38;const s=p<.35?smooth(p/.35):1-smooth((p-.35)/.65);o[2]-=s*.2;o[1]+=s*.03;o[3]-=s*.08}},
  mdrill(V,a,dt,o,m){const T=m.tags.spin;V.nyDrA=(V.nyDrA||0)+dt*((V.nyDrill>0?60:0)+(a.cmd.fire&&a.lastFire>G.t-.2?25:0));if(T)T.rotation.z=V.nyDrA;
    if(V.nyDrill>0){V.nyDrill=Math.max(0,V.nyDrill-dt);const p=1-V.nyDrill/1.1;const s=p<.12?smooth(p/.12):p>.86?1-smooth((p-.86)/.14):1;o[2]-=s*.16;o[0]-=s*.04;o[0]+=rr(-.004,.004)*s;o[1]+=rr(-.004,.004)*s}},
  xdz(V,a,dt,o,m){const T=m.tags.spin;V.nyDiscA=(V.nyDiscA||0)+dt*(a.cmd.fire?40:8);if(T)T.rotation.set(V.nyDiscA,0,0)},
  gaebolg(V,a,dt,o,m){const T=m.tags.mag,am=a.ammo.gaebolg;if(T)T.visible=!!am&&(am.mag>0||(a.reloadT>0&&V.rel&&V.rel.t/V.rel.d>.5))},
  xbow(V,a,dt,o,m){const T=m.tags.mag,am=a.ammo[V.id];if(T)T.visible=!!am&&(am.mag>0||(a.reloadT>0&&V.rel&&V.rel.t/V.rel.d>.5))}};
VMX.xbowa=VMX.xbow;
const NY_SW=[[0,[0,0,0,0,0,0]],[.25,[.12,.08,.04,.25,-.6,.5]],[.45,[-.08,.02,-.18,-.1,.7,-.6]],[.7,[-.06,-.02,-.06,-.05,.3,-.25]],[1,[0,0,0,0,0,0]]];

// ---------- buy-menu text ----------
function nyTags(W,L){const t=[];
  if(W.proj==='bolt')t.push(L?(W.pierce?'Piercing bolts':'Silent bolts'):(W.pierce?'관통 볼트':'저소음 볼트'));if(W.zoom)t.push(L?'Scope':'조준경');
  if(W.cone)t.push(L?'Dragon fire cone · burns':'용의 화염 · 화상');if(W.air)t.push(L?'Air blast cone · huge knockback':'압축공기 분사 · 강한 넉백');if(W.alt==='dragon')t.push(L?'RMB: summon a dragon':'우클릭: 적룡 소환');
  if(W.kind==='saw')t.push(L?'Hold to grind · RMB swing':'갈아버리기 · 우클릭 휘두르기');if(W.proj==='harpoon')t.push(L?'Sticky harpoon · RMB detonate':'작살 1초 뒤 폭발 · 우클릭 즉시 폭발');
  if(W.proj==='disc')t.push(L?'Returning blade · pierces':'관통 후 되돌아오는 칼날');if(W.alt==='drill')t.push(L?'RMB: drill':'우클릭: 드릴');if(W.proj==='slug')t.push(L?'3 explosive slugs':'폭발탄 3발');
  if(W.spin)t.push(L?'Rotary barrels':'회전 총열');if(W.pellets)t.push((L?'Pellets ×':'산탄 ×')+W.pellets);if(W.fan)t.push(L?'4-barrel volley':'4연장 일제사격');if(W.alt==='bayonet')t.push(L?'RMB: bayonet':'우클릭: 대검');
  t.push((L?(W.kind==='saw'?'Fuel ':'Ammo '):(W.kind==='saw'?'연료 ':'탄창 '))+W.mag);return t.join(' · ')}
function nyHud(P){const W=WPN[P.cur];if(!W)return '';const L=LI();
  if(P.cur==='gaebolg'){const n=NADES.filter(p=>p.kind==='harpoon'&&p.owner===P&&p.stuck).length;return n?(L?`  ·  stuck ${n}`:`  ·  박힌 작살 ${n}`):''}
  if(P.cur==='rdc')return (L?'  ·  DRAGON ':'  ·  용 게이지 ')+Math.floor((P.dragonG||0)*100)+'%';return ''}

// ---------- sounds (all synthesised) ----------
function twang(B,f,l){B.ring(0,f,[1,2.01,3.02,4.1],[.32,.2,.12,.07],[.55*l,.3*l,.16*l,.08*l]);B.grain(0,2600,2,.006,.5*l);const e=B.env(0,.002,.35*l,.05);B.osc('sine',f*.5,f*.4,0,.06,e)}
function dragonFire(B,red){const out=B.comp(-10,4,.003,.2,B.g(.95));
  for(const s of [-1,1]){const e=B.env(0,.04,1,.9,B.pan(s*.4,out));const lp=B.f('lowpass',400,.7,e);lp.frequency.setValueAtTime(400,0);lp.frequency.exponentialRampToValueAtTime(red?3200:2600,.25);lp.frequency.exponentialRampToValueAtTime(300,1);B.nz('brown',0,1.1,lp)}
  {const e=B.env(0,.003,1,.6,B.sh(2.5,out));B.osc('sine',red?70:78,30,0,.6,e)}
  {const e=B.env(.02,.05,.45,.8,out);B.nz('white',0,.9,B.f('bandpass',red?1800:1400,.8,e))}
  for(let i=0;i<24;i++){const t=rr(.05,1);const e=B.env(t,.001,rr(.1,.3),.012,B.pan(rr(-.8,.8),out));B.nz('white',t,.02,B.f('bandpass',rr(1500,5000),3,e))}}
Object.assign(SFX,{
  xbow:{n:3,dur:.7,peak:.85,gain:.6,rev:.08,poly:5,pj:.04,fn:B=>{twang(B,rr(150,175),1);whoosh(B,900,2600,.18,.4);B.grain(.004,4200,1.5,.004,.6)}},
  xbowa:{n:3,dur:.7,peak:.85,gain:.62,rev:.08,poly:6,pj:.04,fn:B=>{twang(B,rr(200,230),1);B.ring(.01,rr(1400,1600),[1,1.5],[.08,.05],[.12,.06]);whoosh(B,1100,3000,.16,.4);B.grain(.004,4800,1.5,.004,.6)}},
  hstick:{n:3,dur:.4,peak:.85,gain:.6,rev:.08,poly:6,pj:.06,fn:B=>{const e=B.env(0,.001,.8,.06);B.nz('brown',0,.08,B.f('lowpass',500,.7,e));B.ring(0,rr(600,800),[1,1.6,2.4],[.12,.08,.05],[.25,.12,.06])}},
  volc:{n:3,dur:1.2,ch:2,peak:.95,gain:.92,rev:.14,poly:6,pj:.03,fn:B=>gunshot(B,{drive:2.4,crack:.85,crackF:1900,body:[{f:rr(460,560),q:.7,l:1,d:.13},{f:rr(1300,1600),q:.8,l:.8,d:.08},{f:rr(170,220),q:.8,l:.95,d:.2,n:'brown'}],punch:{f0:rr(95,108),f1:40,d:.2,l:1.35},mech:{t:.03,f:3000,l:.2},tail:{l:.34,tau:.26,d:1.05,f0:2300,f1:170},echo:echoes()})},
  mdrill:{n:3,dur:1.2,ch:2,peak:.95,gain:.9,rev:.14,poly:6,pj:.03,fn:B=>{gunshot(B,{drive:2.3,crack:.85,crackF:2000,body:[{f:rr(500,600),q:.7,l:.95,d:.12},{f:rr(1400,1700),q:.8,l:.75,d:.08},{f:rr(180,230),q:.8,l:.9,d:.19,n:'brown'}],punch:{f0:rr(100,112),f1:42,d:.19,l:1.3},mech:null,tail:{l:.32,tau:.25,d:1,f0:2400,f1:180},echo:echoes()});B.ring(.02,rr(1800,2100),[1,1.4,2.2],[.2,.12,.08],[.12,.06,.03])}},
  bdc:{n:2,dur:1.6,ch:2,peak:.95,gain:.95,rev:.2,poly:3,pj:.04,fn:B=>dragonFire(B,false)},
  rdc:{n:2,dur:1.8,ch:2,peak:.95,gain:1,rev:.22,poly:3,pj:.04,fn:B=>dragonFire(B,true)},
  harpoon:{n:2,dur:.9,ch:2,peak:.9,gain:.8,rev:.12,poly:3,pj:.04,fn:B=>{const out=B.comp(-10,4,.002,.15,B.g(.95));{const e=B.env(0,.002,1,.16,B.sh(2.2,out));B.osc('sine',rr(110,125),48,0,.18,e)}
    {const e=B.env(0,.004,.7,.28,out);const f=B.f('highpass',2400,.7,e);B.sweep(f,2400,6000,0,.3);B.nz('white',0,.32,f)}B.ring(.01,rr(700,820),[1,1.62,2.5],[.25,.16,.1],[.25,.12,.06],out);whoosh(B,500,1800,.3,.5,out)}},
  disc:{n:3,dur:.7,peak:.85,gain:.6,rev:.08,poly:4,pj:.05,fn:B=>{const g=B.g(1);const e=B.env(0,.05,.6,.5,g);const f=B.f('bandpass',1200,3,e);B.sweep(f,900,2600,0,.5);B.nz('white',0,.6,f);B.am(g,0,.6,70,.8);B.ring(0,rr(2600,3000),[1,1.33,1.9],[.3,.2,.12],[.15,.08,.04])}},
  dischit:{n:3,dur:.45,peak:.85,gain:.6,rev:.06,poly:5,pj:.06,fn:B=>{B.grain(0,5200,.8,.004,.8);B.ring(0,rr(2200,2600),[1,1.42,2.3,3.1],[.22,.14,.09,.05],[.3,.18,.1,.05]);const e=B.env(0,.002,.5,.08);B.nz('pink',0,.1,B.f('bandpass',1600,2,e))}},
  mlaunch:{n:2,dur:1.2,ch:2,peak:.9,gain:.85,rev:.12,poly:3,pj:.04,fn:B=>{for(const t of [0,.035,.07]){const e=B.env(t,.002,.9,.14,B.sh(2.4,B.g(.8)));B.osc('sine',rr(120,140),52,t,.16,e);B.grain(t,3000,2,.01,.35)}
    for(const s of [-1,1]){const te=B.envT(.01,.03,.22,.3,B.pan(s*.6));B.nz('pink',0,1,B.f('lowpass',1400,.6,te))}}},
  duck:{n:3,dur:1,ch:2,peak:.95,gain:.88,rev:.14,poly:4,pj:.03,fn:B=>{gunshot(B,GUNDEF.d50());gunshot(B,GUNDEF.p9())}},
  sterling:{n:3,dur:.8,ch:2,peak:.9,gain:.7,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,{drive:1.55,crack:.7,crackF:2600,body:[{f:rr(1250,1450),q:.85,l:.75,d:.055},{f:rr(2600,3000),q:1.1,l:.6,d:.04},{f:rr(430,500),q:.9,l:.4,d:.07,n:'pink'}],punch:{f0:rr(150,170),f1:70,d:.08,l:.6},mech:{t:.022,f:4600,l:.22},tail:{l:.19,tau:.16,d:.7,f0:3100,f1:280},echo:echoes()})},
  sawloop:{n:1,dur:1.2,peak:.75,gain:.55,loop:.25,fn:B=>{const out=B.sh(2.2,B.g(.9));for(const [f,l] of [[92,.6],[184,.35],[276,.2],[368,.1]]){const g=B.g(l,out);B.osc('sawtooth',f,f,0,1.2,B.f('lowpass',1800,.7,g))}const r=B.g(.4,out);B.nz('pink',0,1.2,B.f('bandpass',1400,1.2,r));B.am(r,0,1.2,46,.7)}},
  sawrev:{n:2,dur:.7,peak:.8,gain:.55,rev:.08,poly:3,fn:B=>{const out=B.sh(2.4,B.g(.9));const e=B.env(0,.05,.7,.5,out);for(const [f,l] of [[150,.6],[300,.3],[450,.15]])B.osc('sawtooth',f*.7,f,0,.6,B.f('lowpass',2400,.7,B.g(l,e)));B.nz('pink',0,.6,B.f('bandpass',1800,1.5,B.g(.3,e)))}},
  sawhit:{n:3,dur:.4,peak:.85,gain:.7,rev:.05,poly:4,pj:.06,fn:B=>{const g=B.g(1);const e=B.env(0,.004,.8,.25,g);B.nz('white',0,.3,B.f('bandpass',rr(1100,1500),1.8,e));B.am(g,0,.3,55,.85);const k=B.env(0,.002,.8,.08);B.nz('brown',0,.1,B.f('lowpass',380,.8,k))}},
  drill:{n:1,dur:1.4,peak:.85,gain:.75,rev:.08,fn:B=>{const out=B.sh(2,B.g(.9));const e=B.env(0,.08,.8,1,out,.1);for(const [f,l] of [[420,.5],[840,.3],[1680,.12]])B.osc('sawtooth',f*.8,f,0,1.2,B.f('bandpass',f*1.5,2,B.g(l,e)));const r=B.g(.5,e);B.nz('white',0,1.3,B.f('bandpass',3000,2,r));B.am(r,0,1.3,80,.7)}},
  dragon:{n:1,dur:2.4,ch:2,peak:.95,gain:.95,rev:.35,fn:B=>{voice(B,{f0:rr(80,90),fm:rr(120,135),f1:48,len:1.8,F:[380,760,2000],drive:4.2,rasp:1,rf:600,gurgle:9,vibD:.08});dragonFire(B,true)}},
  nyletter:{n:1,dur:1,peak:.65,gain:.45,rev:.25,pj:0,fn:B=>{[659,784,988,1319].forEach((f,i)=>tone(B,i*.06,f,.45,.28,'triangle'));B.ring(.25,2637,[1,2.7],[.4,.2],[.12,.05])}},
  trapset:{n:2,dur:.5,peak:.8,gain:.6,rev:.06,fn:B=>{B.ring(0,rr(500,600),[1,1.7,2.6],[.15,.1,.06],[.3,.15,.08]);B.grain(.05,2600,2,.01,.5);const e=B.env(0,.002,.5,.06);B.nz('brown',0,.08,B.f('lowpass',400,.7,e))}},
  trapsnap:{n:2,dur:.6,peak:.9,gain:.85,rev:.08,fn:B=>{B.grain(0,4000,.7,.004,.9);B.ring(0,rr(900,1100),[1,1.5,2.3,3.4],[.25,.18,.12,.08],[.4,.25,.12,.06]);const e=B.env(0,.001,1,.08);B.nz('brown',0,.1,B.f('lowpass',500,.7,e));B.grain(.02,1800,3,.02,.5)}},
  invis:{n:1,dur:1.2,peak:.8,gain:.6,rev:.3,fn:B=>{const e=B.env(0,.2,.6,.8);const f=B.f('bandpass',3000,4,e);B.sweep(f,3000,600,0,1);B.nz('white',0,1.1,f);for(let i=0;i<8;i++)B.ring(rr(0,.6),rr(2000,5000),[1,1.5],[.15,.1],[.06,.03])}},
  heal:{n:1,dur:1.6,peak:.85,gain:.7,rev:.3,fn:B=>{voice(B,{f0:rr(140,160),fm:rr(180,200),f1:110,len:1,F:[600,1100,2500],drive:2.5,rasp:.5,rf:1200,vib:5,vibD:.05});[523,659,784].forEach((f,i)=>tone(B,.2+i*.1,f,.6,.12,'sine'))}},
});
SFX_ORDER.push('xbow','xbowa','hstick','volc','mdrill','bdc','rdc','harpoon','disc','dischit','mlaunch','duck','sterling','sawloop','sawrev','sawhit','drill','dragon','nyletter','trapset','trapsnap','invis','heal');
// the Ripper's engine: one looping voice whose pitch and level follow the throttle
AU.saw=function(v,cut){const c=this.ctx;if(!c||!this.sfx||c.state!=='running')return;const b=this.bank.sawloop;if(!b||!b.length)return;
  if(!this.sawS){if(!(v>.01))return;const s=c.createBufferSource();s.buffer=b[0];s.loop=true;const g=c.createGain();g.gain.value=0;s.connect(g);g.connect(this.sfx);s.start();this.sawS=s;this.sawG=g}
  const t=c.currentTime;const sd=soundDesign('sawloop');this.sawS.playbackRate.setTargetAtTime((.55+.9*v)*(sd.rate||1),t,.05);this.sawG.gain.setTargetAtTime(this.muted||!(v>.01)?0:(.12+.3*v)*(cut?1.1:1)*sd.vol,t,.05)};

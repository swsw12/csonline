'use strict';
// ============ Weapon art: one painted material atlas, box-part models (world + first-person), kill icons ============
// gun frame: origin at the firing hand's grip, barrel along -Z, up +Y, metres
const GA_MATS=['blk','blk2','steel','bright','wood','olive','tan','rub','brass','glove','sl_guard','sl_medic','sl_soldier','sl_hazmat','skin','zs_rager',
  'zs_runner','zs_brute','zs_scream','claw','red','heGreen','frost','lens','muzzle','white','wood2','gunmetal','cuff','hglove','nail','flesh',
  'tan2','smoke','carbon','rail','vent','engraved','wood3','bluesteel','grip2','orange','yellow','olive2','camo','belt','chrome','axehead','forged','zbSkin','zbEye','zbMouth','zbTongue','burlap','coffW','coffL','zs_coffin','dred','dyel'];
const GA={W:1024,H:1024,P:128,idx:{},tex:null,texVM:null,canvas:null};
GA_MATS.forEach((m,i)=>GA.idx[m]=i);
function paintGunAtlas(){const PS=GA.P;
  const cv=paint(GA.W,GA.H,P=>{
    const patch=(name,fn)=>{const i=GA.idx[name];const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;for(let y=0;y<PS;y++)for(let x=0;x<PS;x++){const c=fn(x,y,x0+x,y0+y);if(c)P.set(x0+x,y0+y,c)}};
    const nz=(X,Y,s,c)=>P.n(X,Y,c||16,s,2);
    const scr=(x,y,X,Y,s)=>hash2(Math.floor((x+y*.35)/3),Math.floor(y/9),s)<.012;// faint diagonal scratches
    patch('blk',(x,y,X,Y)=>{const t=nz(X,Y,3,20)+(hash2(X,Y,1)-.5)*.18;let c=t>.62?'#34383d':t<.38?'#1b1d20':'#25282c';if(scr(x,y,X,Y,5))c='#50565c';if(hash2(X,Y,6)<.01)c='#3e434a';return c});
    patch('blk2',(x,y,X,Y)=>{const r=y%8;let c=r===0?'#3c4044':r>=6?'#16181a':'#26292c';if(hash2(X,Y,2)<.07)c=dk(c,.18);if(x%32===0&&r<6)c='#202326';return c});
    patch('steel',(x,y,X,Y)=>{const t=hash2(Math.floor(x/10),y,3)*.55+nz(X,Y,4,12)*.45;let c=t>.62?'#71767b':t<.35?'#45494e':'#5a5f64';if(scr(x,y,X,Y,7))c='#8a9096';return c});
    patch('bright',(x,y,X,Y)=>{const t=hash2(Math.floor(x/14),y,4);let c=t>.7?'#d8dce0':t<.3?'#8a9096':'#b2b8be';const b=(y+Math.floor(x*.2))%40;if(b<2)c='#f2f6fa';else if(b<5)c='#cfd4d8';return c});
    patch('chrome',(x,y,X,Y)=>{const b=Math.sin(y*.12+x*.02)*.5+.5;let c=mix('#454b52','#b4bac0',b*b);if(scr(x,y,X,Y,44))c='#d0d6dc';return c});
    patch('wood',(x,y,X,Y)=>{const g=Math.sin(y*.32+nz(X,Y,6,24)*8)*.5+.5;let c=mix('#4a2a16','#7c4e2c',g);if(hash2(X,Y,6)<.03)c=dk(c,.3);if(hash2(Math.floor(x/6),y,7)<.01)c='#2e1a0c';return c});
    patch('wood2',(x,y,X,Y)=>{const g=Math.sin(y*.25+nz(X,Y,7,28)*7)*.5+.5;let c=mix('#5a3a20','#8a5c34',g);if(((x+y)%6===0||(x-y+128)%6===0)&&y>20&&y<108)c=dk(c,.25);return c});
    patch('wood3',(x,y,X,Y)=>{const g=Math.sin(y*.3+nz(X,Y,8,26)*6)*.5+.5;return mix('#8a6a40','#b8925c',g)});
    patch('olive',(x,y,X,Y)=>{const t=nz(X,Y,8,16)+(hash2(X,Y,7)-.5)*.14;let c=t>.6?'#5c6644':t<.4?'#3c4430':'#4c5638';if(scr(x,y,X,Y,9))c='#6e7858';return c});
    patch('olive2',(x,y,X,Y)=>{const t=nz(X,Y,48,18)+(hash2(X,Y,47)-.5)*.12;return t>.6?'#6a6a48':t<.4?'#4a4a30':'#5a5a3c'});
    patch('tan',(x,y,X,Y)=>{const t=nz(X,Y,9,16)+(hash2(X,Y,8)-.5)*.14;let c=t>.6?'#a89870':t<.4?'#7c6c4c':'#92825e';if(scr(x,y,X,Y,10))c='#c2b28a';return c});
    patch('tan2',(x,y,X,Y)=>{const t=nz(X,Y,31,14)+(hash2(X,Y,32)-.5)*.2;return t>.6?'#8e7a58':t<.4?'#6a5a3e':'#7c6a4a'});
    patch('camo',(x,y,X,Y)=>{const a=nz(X,Y,33,24),b=nz(X,Y,34,18);return a>.6?'#3a3424':b>.58?'#7a6e4c':a<.36?'#5c6440':'#6a6a48'});
    patch('rub',(x,y)=>((x>>2)+(y>>2))&1?'#26272a':'#18191b');
    patch('grip2',(x,y,X,Y)=>hash2(X,Y,35)<.35?'#141517':(hash2(X,Y,36)<.5?'#232427':'#1c1d20'));
    patch('brass',(x,y,X,Y)=>{const r=x%14;let c=r<2?'#6a4a1c':r<4?'#e8c070':'#b08a3a';if(y%32<4)c='#8a6a2a';if(y%32<2)c='#4a3418';return c});
    patch('belt',(x,y)=>{const r=x%18;let c=r<3?'#3a3a36':r<5?'#d8b060':'#a07a32';if(y%24<3)c='#7a5a24';return c});
    patch('rail',(x,y)=>{const r=y%10;let c=r<4?'#3a3e44':r<6?'#16181b':'#24272b';if(x<3||x>124)c='#141618';return c});
    patch('vent',(x,y,X,Y)=>{const cx=x%24,cy=y%32;const d=Math.hypot((cx-12)/7,(cy-16)/11);let c=d<1?'#08090a':(d<1.2?'#3a3e42':'#262a2e');if(hash2(X,Y,37)<.05)c=dk(c,.15);return c});
    patch('carbon',(x,y)=>{const a=(Math.floor(x/4)+Math.floor(y/4))&1;const s=a?(x%4):(y%4);return a?(s<2?'#2a2c30':'#1a1c1f'):(s<2?'#222428':'#121315')});
    patch('smoke',(x,y,X,Y)=>{const m=y%32;let c=m<16?'#2e2a26':'#262320';if(Math.abs(m-16)<3&&x%12<7)c=m<16?'#6a5430':'#58462a';if(hash2(X,Y,45)<.02)c='#3c3833';return c});
    patch('engraved',(x,y)=>{const sc=Math.sin(x*.18+Math.sin(y*.21)*2.2)*Math.cos(y*.16+Math.cos(x*.12)*1.8);let c=sc>.55?'#3e4348':'#62686e';if(sc>.75)c='#2c3034';if(y<3||y>124)c='#3a3f44';return c});
    patch('bluesteel',(x,y,X,Y)=>{const t=nz(X,Y,38,14)+(hash2(X,Y,39)-.5)*.1;return t>.6?'#2e3848':t<.4?'#141a24':'#202836'});
    patch('gunmetal',(x,y,X,Y)=>{const t=nz(X,Y,24,16)+(hash2(X,Y,25)-.5)*.14;let c=t>.6?'#4a5058':t<.4?'#2c3036':'#3a4048';if(scr(x,y,X,Y,26))c='#5c636c';return c});
    patch('orange',(x,y,X,Y)=>nz(X,Y,40,10)>.55?'#d86a1c':'#b85614');
    patch('yellow',(x,y,X,Y)=>{const s=Math.floor((x+y)/16)%2;return s?'#d8a41e':'#1c1c1a'});
    patch('forged',(x,y,X,Y)=>{const t=nz(X,Y,44,10)+(hash2(X,Y,45)-.5)*.12;let c=t>.6?'#5a5e62':t<.38?'#33363a':'#464a4e';const d=Math.hypot(((x+3)%22)-11,((y+7)%19)-9.5);if(d<4)c=d<2?'#2a2c2f':'#6a6e72';if(hash2(X,Y,46)<.03)c='#7c8084';return c});
    patch('axehead',(x,y,X,Y)=>{let c=nz(X,Y,41,12)>.5?'#b82218':'#9a1a12';if(hash2(X,Y,42)<.05)c='#6a6a66';if(y<10)c=y<4?'#e8ecee':'#a8aeb2';return c});
    patch('glove',(x,y,X,Y)=>{let c=nz(X,Y,10,20)>.55?'#2c2c2e':'#222224';if(y<40&&(x%32<24)&&(y%20<14))c='#18181a';if(x%32===31)c='#121214';if(y===40)c='#121214';return c});
    patch('hglove',(x,y,X,Y)=>{let c=nz(X,Y,10,20)>.55?'#d8dcd4':'#c4c8c0';if(x%32===31)c='#a8aca4';if(hash2(X,Y,43)<.02)c='#b0b4ac';return c});
    patch('cuff',(x,y)=>y%12<2?'#141416':'#1e1e20');
    const sleeve=(name,base,camo)=>patch(name,(x,y,X,Y)=>{const t=nz(X,Y,11,22)+(Math.sin(x*.2+hash2(Math.floor(y/12),2,1)*4)*.5)*.2;let c=t>.62?lt(base,.08):t<.38?dk(base,.15):base;
      if(camo){const n=nz(X,Y,13,24);if(n>.62)c=mix(c,camo[0],.7);else if(n<.36)c=mix(c,camo[1],.7)}if(y<2||y>125)c=dk(c,.3);if(x%40===0)c=dk(c,.2);return c});
    // sleeve and zombie-arm colours come from ARM_DESIGN (design.js)
    for(const k of ['sl_guard','sl_medic','sl_soldier','sl_hazmat']){const a=ARM_DESIGN[k];sleeve(k,a[0],a.length>2?[a[1],a[2]]:null)}
    patch('skin',(x,y,X,Y)=>{const t=nz(X,Y,14,18);return t>.6?'#d4a684':t<.4?'#b48464':'#c49474'});
    const zs=(name,base,blot)=>patch(name,(x,y,X,Y)=>{const t=nz(X,Y,15,10),t2=nz(X,Y,16,24);let c=t>.62?dk(base,.25):t<.32?lt(base,.1):base;if(t2>.64)c=mix(c,blot,.5);
      if(hash2(X,Y,17)<.02)c='#3a0c0a';if(((x*7+y*3)%41===0)&&hash2(x,y,18)<.5)c=dk(base,.45);const v=Math.abs(Math.sin(x*.09+Math.sin(y*.07)*2.5));if(v<.03)c=mix(c,'#3a2a40',.6);
      // torn skin showing muscle, smeared blood
      const w=nz(X,Y,46,22);if(w>.68){const fib=Math.sin(x*.5+y*.15)*.5+.5;c=mix('#4a0606','#a02a1e',fib);if(w>.75&&hash2(X,Y,47)<.12)c='#d8c8a0'}else if(w>.645)c=dk(c,.55);
      const bl=nz(X,Y,48,16);if(bl>.66)c=mix(c,'#5a0808',clamp((bl-.66)*4,0,.8));return c});
    for(const k of ['zs_rager','zs_runner','zs_brute','zs_scream','zs_coffin']){const a=ARM_DESIGN[k];zs(k,a[0],a[1])}
    patch('claw',(x,y,X,Y)=>{const t=y/127;let c=mix('#d8d0b0','#3a2a20',Math.pow(t,1.6));if(x%16===0)c=dk(c,.2);if(t<.45&&nz(X,Y,49,12)>.45)c=mix(c,'#6a0a08',.7);return c});
    patch('nail',(x,y)=>mix('#c8bca0','#2a1c14',y/127));
    patch('coffW',(x,y,X,Y)=>{const pl=Math.floor(x/26),g=nz(X,Y,91+pl,14)+Math.sin(y*.35+pl*2.1+nz(X,Y,92,30)*4)*.08;let c=g>.62?'#2e1c10':g<.4?'#4a3020':'#3a2616';if(x%26===0)c='#160c06';if(hash2(X,Y,93)<.01)c='#5a4030';return c});
    patch('coffL',(x,y,X,Y)=>{const g=nz(X,Y,94,12)+Math.sin(y*.5+nz(X,Y,95,24)*5)*.07;let c=g>.6?'#3a1410':g<.4?'#561e16':'#481a12';if(x<3||y<3||x>124||y>124)c='#1a0806';return c});
    patch('burlap',(x,y,X,Y)=>{const t=nz(X,Y,81,8);let c=((x>>1)+(y>>1))%2?'#9a7646':'#8a6838';if(t>.62)c=dk(c,.18);if(t<.3)c=lt(c,.08);if(x%32===0||y%32===0)c='#5e4424';return c});
    patch('zbSkin',(x,y,X,Y)=>{const t=nz(X,Y,71,10),w=Math.sin(y*.55+nz(X,Y,72,20)*7);let c=t>.62?'#a3301c':t<.36?'#d8653a':'#c0472a';
      if(w>.82)c=dk(c,.32);else if(w<-.9)c=lt(c,.12);const vein=Math.abs(Math.sin(x*.11+Math.sin(y*.05)*2.6)*16-((y*.41)%16));if(vein<1.2&&t>.4)c='#6a1410';if(hash2(X,Y,73)<.015)c='#f09060';return c});
    P.ga=232;patch('zbEye',(x,y)=>{const r=Math.hypot(x-64,y-64);return r<22?'#fff6b0':r<44?'#ffc838':'#e85a10'});P.ga=255;
    patch('zbMouth',(x,y,X,Y)=>{const t=nz(X,Y,74,8);return t>.6?'#4a0a0a':t<.35?'#140202':'#2a0505'});
    patch('zbTongue',(x,y,X,Y)=>{const t=nz(X,Y,75,9);let c=t>.6?'#b03848':t<.38?'#e07884':'#c85060';if(Math.abs(x-64)<3)c='#8a2030';return c});
    patch('flesh',(x,y,X,Y)=>{const t=nz(X,Y,19,10);return t>.6?'#8a1a14':t<.4?'#4a0806':'#6a100c'});
    patch('red',(x,y,X,Y)=>{let c=nz(X,Y,20,16)>.5?'#b82218':'#9a1a12';if(y<12)c='#e8e0d0';return c});
    patch('heGreen',(x,y,X,Y)=>{let c=nz(X,Y,21,16)>.55?'#4a5a34':'#3a4828';if(y%32===0||x%32===0)c='#2a3420';if(y%32===1||x%32===1)c='#5a6a44';return c});
    patch('frost',(x,y,X,Y)=>{let c=nz(X,Y,22,16)>.5?'#5a8ab8':'#4a78a4';if(hash2(X,Y,23)<.06)c='#d8eeff';if(y<16)c='#d8e8f4';return c});
    patch('lens',(x,y)=>{const r=Math.hypot(x-48,y-48);let c=y<x*.5?'#1a2a4a':'#0c1424';if(r<16)c='#8ab8e8';if(r<6)c='#d8f0ff';if(Math.abs(x-y-20)<3)c='#2a4a7a';return c});
    // Dual Berettas: one deep red clouded with black, one deep yellow
    patch('dred',(x,y,X,Y)=>{const t=nz(X,Y,96,14)+(hash2(X,Y,97)-.5)*.12,b=nz(X,Y,98,26);let c=t>.62?'#460a0e':t<.38?'#260406':'#36070a';
      if(b>.52)c=mix(c,'#080203',clamp((b-.52)*4,0,.85));if(scr(x,y,X,Y,99))c='#5a1216';return c});
    patch('dyel',(x,y,X,Y)=>{const t=nz(X,Y,100,14)+(hash2(X,Y,101)-.5)*.12;let c=t>.62?'#866008':t<.38?'#5c4004':'#725006';if(scr(x,y,X,Y,102))c='#a07820';return c});
    patch('muzzle',()=>'#08080a');
    patch('white',(x,y)=>(y%16===0)?'#8a8a84':'#b8b8b0');
  });
  GA.canvas=cv;
  GA.tex=new THREE.CanvasTexture(cv);GA.tex.magFilter=THREE.NearestFilter;GA.tex.minFilter=THREE.NearestMipmapLinearFilter;
  GA.texVM=new THREE.CanvasTexture(cv);GA.texVM.magFilter=THREE.NearestFilter;GA.texVM.minFilter=THREE.LinearFilter;GA.texVM.generateMipmaps=false}
// part: {c:[x,y,z], s:[w,h,d], m, rx?, ry?, rz?, tag?}
const GD=560;// pixels per metre inside a patch (view model); world models use fewer
// parts become bevelled boxes (rbox): a chamfer catches the light along every edge; o.bevel sets the default size (0 = plain boxes for distant models), p.r overrides per part
function partGeo(parts,o){o=o||{};const pos=[],nrm=[],uv=[],idx=[];const W=GA.W,H=GA.H,PS=GA.P,LIM=PS-2;const m4=new THREE.Matrix4(),e=new THREE.Euler(),v=new THREE.Vector3(),n=new THREE.Vector3();
  const bev=o.bevel==null?.0035:o.bevel;
  parts.forEach((p,pi)=>{const [cx,cy,cz]=p.c,[sx,sy,sz]=p.s;const mi=GA.idx[p.m]!=null?GA.idx[p.m]:0;const px0=(mi%8)*PS,py0=Math.floor(mi/8)*PS;
    e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ');m4.makeRotationFromEuler(e);const mn=Math.min(sx,sy,sz);const r=p.r!=null?Math.min(p.r,mn*.5):Math.min(bev,mn*.22);
    rbox(p.s,{r},0,(fk,g)=>{const [fu,fv]=faceDims(p.s,fk);const pw=Math.min(LIM,Math.max(1,fu*(o.gd||GD))),ph=Math.min(LIM,Math.max(1,fv*(o.gd||GD)));
      const ox=px0+1+Math.floor(hash2(pi,FK.indexOf(fk),3)*(LIM-pw)),oy=py0+1+Math.floor(hash2(pi,FK.indexOf(fk),4)*(LIM-ph));const base=pos.length/3;
      for(let j=0;j<g.nb;j++)for(let i=0;i<g.na;i++){const k=(j*g.na+i)*3;v.set(g.P[k],g.P[k+1],g.P[k+2]).applyMatrix4(m4);pos.push(v.x+cx,v.y+cy,v.z+cz);
        n.set(g.N[k],g.N[k+1],g.N[k+2]).applyMatrix4(m4);nrm.push(n.x,n.y,n.z);uv.push((ox+g.A[i]*pw)/W,1-(oy+(1-g.B[j])*ph)/H)}
      for(let j=0;j<g.nb-1;j++)for(let i=0;i<g.na-1;i++){const v0=base+j*g.na+i,v3=v0+g.na;idx.push(v0,v0+1,v3+1,v0,v3+1,v3)}})});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeBoundingSphere();return g}
// ---------- weapon models ----------
const Pt=(x,y,z,w,h,d,m,o)=>Object.assign({c:[x,y,z],s:[w,h,d],m},o||{});
const TAG=(tag,list)=>list.map(p=>Object.assign(p,{tag}));
const rail=(y,z0,z1,w,x)=>Pt(x||0,y,(z0+z1)/2,w||.024,.008,Math.abs(z1-z0),'rail');
const redDot=(y,z)=>[Pt(0,y,z,.03,.03,.05,'blk'),Pt(0,y-.02,z,.024,.012,.04,'blk2'),Pt(0,y+.003,z-.0265,.02,.016,.003,'lens'),Pt(.017,y+.004,z,.006,.008,.012,'blk')];
const scope=(y,z0,z1,r,m)=>{const L=Math.abs(z1-z0),zc=(z0+z1)/2;m=m||'blk';return [Pt(0,y,zc,r*.85,r*.85,L*.55,m),Pt(0,y,z0+L*.12,r*1.25,r*1.25,L*.24,m),Pt(0,y,z1-L*.1,r*1.15,r*1.15,L*.2,m),
  Pt(0,y,z0-.002,r*1.05,r*1.05,.004,'lens'),Pt(0,y,z1+.002,r*.9,r*.9,.004,'lens'),Pt(0,y+r*.75,zc,r*.5,r*.4,r*.5,m),Pt(r*.72,y,zc,r*.4,r*.5,r*.5,m),
  Pt(0,y-r*.75,zc-L*.22,r*.5,r*.5,r*.6,'blk2'),Pt(0,y-r*.75,zc+L*.22,r*.5,r*.5,r*.6,'blk2')]};
const pGrip=(m,y,z,rx)=>[Pt(0,y,z,.032,.1,.046,m||'rub',{rx:rx==null?.24:rx}),Pt(0,y-.054,z+.012,.034,.01,.048,'blk',{rx:rx==null?.24:rx})];
const tGuard=(z)=>[Pt(0,-.012,z,.005,.004,.06,'blk2'),Pt(0,.0,z-.03,.005,.026,.005,'blk2'),Pt(0,.006,z+.004,.004,.02,.006,'steel')];
// zombie grenade: a swollen red creature head, jaw hanging wide open on rows of fangs; deep in the throat sits a glowing gland
// (tag 'mag' = the gland: the hand goes into the mouth and rips it out)
function zbParts(pin){const S='zbSkin',F=-.03,L=[
    Pt(0,.005,F+.03,.165,.155,.13,S,{r:.062}),Pt(0,.0,F+.02,.18,.12,.1,S,{r:.05}),Pt(0,.056,F-.02,.158,.07,.14,S,{r:.033}),Pt(0,.035,F-.078,.13,.03,.034,S,{r:.012}),
    Pt(0,-.066,F-.03,.14,.05,.15,S,{r:.024}),Pt(0,-.05,F-.098,.11,.022,.03,S,{r:.01}),
    Pt(.07,-.012,F-.035,.034,.085,.11,S,{r:.016}),Pt(-.07,-.012,F-.035,.034,.085,.11,S,{r:.016}),
    Pt(.04,.09,F+.01,.05,.024,.06,S,{r:.011}),Pt(-.045,.086,F+.03,.04,.02,.05,S,{r:.009}),Pt(0,-.004,F+.085,.12,.1,.02,S,{r:.01}),
    // throat: back wall, roof, tongue
    Pt(0,-.01,F+.004,.11,.07,.012,'zbMouth'),Pt(0,.024,F-.04,.11,.01,.09,'zbMouth'),Pt(.056,-.01,F-.04,.006,.07,.09,'zbMouth'),Pt(-.056,-.01,F-.04,.006,.07,.09,'zbMouth'),
    Pt(0,-.038,F-.05,.08,.014,.09,'zbTongue',{r:.006}),Pt(0,-.034,F-.08,.05,.012,.04,'zbTongue',{r:.008,rx:-.25})];
  // fangs: upper row hanging from the brow, lower row standing on the jaw, more along the cheeks
  for(let i=0;i<8;i++){const x=-.049+i*.014,big=i===1||i===6,h=big?.03:.02;L.push(Pt(x,.02-h/2,F-.088,.007,h,.007,'white',{rz:(i%2?.18:-.18),r:.002}))}
  for(let i=0;i<7;i++){const x=-.042+i*.014,big=i===0||i===6,h=big?.03:.018;L.push(Pt(x,-.04+h/2,F-.104,.007,h,.007,'white',{rz:(i%2?-.15:.15),rx:-.2,r:.002}))}
  for(const sx of [-1,1])for(let j=0;j<3;j++){L.push(Pt(sx*.05,.012,F-.07+j*.022,.006,.018,.006,'white',{rz:sx*.2,r:.002}),Pt(sx*.05,-.03,F-.08+j*.022,.006,.016,.006,'white',{rz:-sx*.2,r:.002}))}
  // small sunken eyes under the brow, wrinkles and veins over the dome
  for(const sx of [-1,1])L.push(Pt(sx*.038,.044,F-.092,.022,.012,.008,'blk',{r:.004}),Pt(sx*.038,.044,F-.096,.011,.008,.004,'zbEye',{r:.002}));
  for(let i=0;i<4;i++)L.push(Pt(0,.07+i*.008,F-.05+i*.018,.13-i*.012,.006,.012,S,{r:.003}));
  for(let i=0;i<6;i++){const a=i/6*TAU;L.push(Pt(Math.cos(a)*.05,.09,F+.02+Math.sin(a)*.04,.006,.006,.05,'flesh',{ry:a,rx:-.6,r:.002}))}
  if(pin)L.push(...TAG('mag',[Pt(0,-.012,F-.012,.034,.034,.03,'zbEye',{r:.013}),Pt(0,-.012,F-.03,.014,.014,.02,'flesh',{r:.005}),Pt(.01,-.004,F-.002,.006,.006,.03,'flesh',{rx:.4,r:.002})]));
  return L}
const GUNS={
  knife:{parts:[Pt(0,0,.015,.03,.036,.11,'grip2'),Pt(0,0,.074,.034,.034,.018,'steel'),Pt(0,.0,-.048,.064,.022,.012,'steel'),Pt(0,-.001,-.042,.03,.03,.012,'blk'),
    Pt(0,.006,-.15,.006,.034,.18,'bright'),Pt(0,.012,-.25,.006,.02,.03,'bright'),Pt(0,-.006,-.235,.0065,.014,.04,'bright'),Pt(0,.021,-.12,.0075,.006,.11,'steel'),Pt(0,-.01,-.1,.0062,.004,.08,'chrome'),
    Pt(.0165,0,.015,.003,.026,.09,'blk'),Pt(-.0165,0,.015,.003,.026,.09,'blk')],grip:[0,0,0],muzzle:[0,.006,-.27]},
  axe:{parts:[Pt(0,0,-.2,.03,.036,.62,'wood3'),Pt(0,0,.06,.034,.04,.12,'rub'),Pt(0,0,.125,.036,.044,.012,'blk'),Pt(0,.04,-.49,.022,.06,.1,'axehead'),Pt(0,.1,-.49,.012,.08,.11,'axehead'),Pt(0,.146,-.49,.008,.014,.12,'chrome'),
    Pt(0,-.035,-.49,.016,.06,.04,'axehead'),Pt(0,-.075,-.49,.01,.04,.025,'steel'),Pt(0,.0,-.42,.034,.038,.04,'blk')],grip:[0,0,0],muzzle:[0,.1,-.49]},
  hammer:{parts:[Pt(0,0,-.36,.032,.034,.98,'wood3'),Pt(0,0,.05,.038,.04,.16,'rub'),Pt(0,0,.135,.042,.046,.014,'blk'),Pt(0,0,-.3,.037,.039,.15,'grip2'),Pt(0,0,-.715,.044,.048,.07,'blk'),
    Pt(0,0,-.81,.09,.25,.1,'forged'),Pt(0,.137,-.81,.098,.024,.108,'chrome'),Pt(0,-.137,-.81,.098,.024,.108,'chrome'),Pt(0,0,-.81,.094,.05,.104,'bluesteel'),Pt(0,0,-.866,.03,.03,.012,'blk')],
    grip:[0,0,0],sup:[0,0,-.3],muzzle:[0,.14,-.81],armR:[.29,.06,.96],armL:[-.08,.66,.74]},
  p9:{parts:[...TAG('slide',[Pt(0,.045,-.06,.03,.034,.19,'blk'),Pt(0,.047,-.155,.012,.012,.008,'muzzle'),Pt(0,.066,.025,.022,.008,.008,'blk'),Pt(0,.066,-.14,.006,.008,.006,'steel'),
      Pt(.0152,.05,-.02,.002,.018,.05,'muzzle'),Pt(.0152,.044,.02,.002,.026,.004,'blk2'),Pt(.0152,.044,.012,.002,.026,.004,'blk2'),Pt(.0152,.044,.004,.002,.026,.004,'blk2'),Pt(-.0152,.044,.02,.002,.026,.004,'blk2'),Pt(-.0152,.044,.012,.002,.026,.004,'blk2')]),
    Pt(0,.02,-.06,.028,.02,.17,'blk2'),Pt(0,.009,-.11,.024,.008,.06,'rail'),...pGrip('grip2',-.035,.012,.22),...TAG('mag',[Pt(0,-.087,.024,.031,.012,.048,'blk',{rx:.22})]),...tGuard(-.035),Pt(.0145,.022,-.03,.004,.006,.012,'steel')],
    grip:[0,-.02,.005],sup:[-.012,-.045,.01],muzzle:[0,.047,-.16],mag:[0,-.07,.02],eject:[.02,.05,-.03]},
  // Dual Berettas: right hand deep red (black-clouded), left hand deep yellow; alt = the left-hand twin
  tw9:{parts:[...TAG('slide',[Pt(0,.045,-.065,.03,.034,.2,'dred'),Pt(0,.047,-.165,.012,.012,.008,'muzzle'),Pt(0,.066,.025,.022,.008,.008,'blk'),Pt(0,.066,-.15,.006,.008,.006,'steel'),Pt(.0152,.05,-.02,.002,.018,.05,'muzzle')]),
    Pt(0,.02,-.06,.028,.02,.17,'dred'),...pGrip('grip2',-.035,.012,.2),...TAG('mag',[Pt(0,-.087,.024,.031,.012,.048,'blk',{rx:.2})]),...tGuard(-.035)],
    grip:[0,-.02,.005],sup:null,muzzle:[0,.047,-.17],mag:[0,-.07,.02],eject:[.02,.05,-.03],alt:'tw9b'},
  tw9b:{parts:[...TAG('slide',[Pt(0,.045,-.065,.03,.034,.2,'dyel'),Pt(0,.047,-.165,.012,.012,.008,'muzzle'),Pt(0,.066,.025,.022,.008,.008,'blk'),Pt(0,.066,-.15,.006,.008,.006,'steel'),Pt(.0152,.05,-.02,.002,.018,.05,'muzzle')]),
    Pt(0,.02,-.06,.028,.02,.17,'dyel'),...pGrip('grip2',-.035,.012,.2),...TAG('mag',[Pt(0,-.087,.024,.031,.012,.048,'blk',{rx:.2})]),...tGuard(-.035)],
    grip:[0,-.02,.005],sup:null,muzzle:[0,.047,-.17],mag:[0,-.07,.02],eject:[.02,.05,-.03]},
  f7:{parts:[...TAG('slide',[Pt(0,.045,-.055,.03,.034,.17,'blk'),Pt(0,.046,-.16,.034,.03,.04,'blk2'),Pt(.017,.05,-.16,.002,.014,.026,'muzzle'),Pt(-.017,.05,-.16,.002,.014,.026,'muzzle'),Pt(0,.047,-.181,.012,.012,.004,'muzzle'),Pt(0,.066,.02,.022,.008,.008,'blk')]),
    Pt(0,.02,-.055,.028,.02,.16,'blk2'),Pt(0,-.02,-.115,.02,.05,.02,'blk2',{rx:-.2}),...pGrip('rub',-.035,.012,.22),...TAG('mag',[Pt(0,-.11,.03,.026,.15,.04,'blk',{rx:.22}),Pt(0,-.19,.05,.03,.012,.046,'blk2',{rx:.22})]),...tGuard(-.035),Pt(.016,.028,-.01,.006,.01,.02,'orange')],
    grip:[0,-.02,.005],sup:[0,-.04,-.115],muzzle:[0,.047,-.185],mag:[0,-.09,.03],eject:[.02,.05,-.03]},
  d50:{parts:[...TAG('slide',[Pt(0,.05,-.07,.036,.044,.25,'gunmetal'),Pt(0,.053,-.195,.016,.016,.008,'muzzle'),Pt(0,.076,.04,.024,.01,.01,'blk'),Pt(0,.076,-.18,.008,.01,.008,'blk'),
      Pt(.0182,.055,-.03,.002,.022,.06,'muzzle'),Pt(.0182,.05,.03,.002,.03,.004,'blk'),Pt(.0182,.05,.02,.002,.03,.004,'blk'),Pt(-.0182,.05,.03,.002,.03,.004,'blk')]),
    Pt(0,.02,-.07,.034,.024,.23,'gunmetal'),Pt(0,.03,-.17,.03,.018,.06,'gunmetal'),...pGrip('wood2',-.04,.014,.2),...TAG('mag',[Pt(0,-.097,.026,.036,.012,.054,'blk',{rx:.2})]),...tGuard(-.045),Pt(.0175,.03,-.02,.004,.008,.016,'steel'),Pt(0,.066,.045,.012,.012,.012,'steel')],
    grip:[0,-.02,.005],sup:[-.012,-.05,.01],muzzle:[0,.053,-.205],mag:[0,-.08,.02],eject:[.022,.06,-.04]},
  r6:{parts:[Pt(0,.03,-.035,.03,.052,.1,'bluesteel'),...TAG('mag',[Pt(0,.046,-.035,.044,.044,.052,'bluesteel'),Pt(.0225,.046,-.035,.002,.03,.044,'blk'),Pt(-.0225,.046,-.035,.002,.03,.044,'blk'),Pt(0,.0685,-.035,.03,.002,.044,'blk')]),
    Pt(0,.062,-.16,.022,.024,.17,'bluesteel'),Pt(0,.046,-.16,.018,.016,.16,'bluesteel'),Pt(0,.0626,-.2452,.012,.012,.004,'muzzle'),Pt(0,.08,-.235,.006,.012,.014,'bluesteel'),Pt(0,.078,.012,.014,.006,.012,'blk'),
    Pt(0,.072,.022,.008,.022,.014,'steel',{rx:-.4}),Pt(0,.0745,-.1,.012,.002,.1,'rail'),...pGrip('wood2',-.04,.022,.35),...tGuard(-.03),Pt(.016,.03,-.02,.004,.016,.016,'steel')],
    grip:[0,-.02,.01],sup:[-.012,-.045,.015],muzzle:[0,.062,-.25],mag:[0,.046,-.035],eject:[.02,.05,-.03]},
  k5:{parts:[Pt(0,.03,-.08,.044,.06,.28,'blk'),Pt(0,.04,-.27,.034,.034,.1,'vent'),Pt(0,.04,-.34,.018,.018,.05,'steel'),Pt(0,.042,-.368,.024,.024,.01,'blk'),Pt(0,.042,-.3735,.014,.014,.002,'muzzle'),
    rail(.064,-.15,.05,.024),Pt(0,.083,-.01,.016,.02,.02,'blk'),Pt(0,.083,-.2,.01,.022,.01,'blk'),Pt(.0225,.036,-.07,.002,.016,.05,'muzzle'),Pt(-.028,.05,-.15,.012,.01,.04,'blk2'),
    ...pGrip('grip2',-.04,.016,.25),...TAG('mag',[Pt(0,-.06,-.12,.026,.13,.042,'blk',{rx:-.18}),Pt(0,-.125,-.11,.03,.012,.046,'blk2',{rx:-.18})]),
    Pt(0,.03,.1,.022,.022,.12,'steel'),Pt(0,.0,.1,.02,.02,.12,'steel'),Pt(0,.02,.17,.03,.08,.02,'blk2'),Pt(0,-.035,-.22,.03,.07,.035,'blk2'),...tGuard(-.035)],
    grip:[0,-.02,.008],sup:[0,-.05,-.22],muzzle:[0,.042,-.375],mag:[0,-.1,-.11],eject:[.025,.05,-.06]},
  k9:{parts:[Pt(0,.045,-.08,.05,.075,.3,'blk'),Pt(0,-.005,-.07,.046,.07,.18,'olive2',{rx:.22}),Pt(0,.045,-.255,.036,.036,.07,'vent'),Pt(0,.045,-.31,.022,.022,.05,'steel'),Pt(0,.045,-.337,.014,.014,.004,'muzzle'),
    rail(.087,-.2,.05,.026),...redDot(.11,-.06),Pt(.026,.05,-.1,.002,.02,.06,'muzzle'),
    ...pGrip('grip2',-.045,.035,.25),...TAG('mag',[Pt(0,-.085,-.02,.028,.15,.04,'blk',{rx:-.05}),Pt(0,-.162,-.016,.032,.012,.044,'blk2')]),Pt(0,-.035,-.205,.03,.08,.032,'olive2'),
    Pt(0,.045,.13,.03,.05,.16,'blk2'),Pt(0,.035,.215,.036,.09,.02,'rub'),...tGuard(-.025)],
    grip:[0,-.025,.03],sup:[0,-.055,-.205],muzzle:[0,.045,-.34],mag:[0,-.1,-.02],eject:[.028,.06,-.08]},
  um45:{parts:[Pt(0,.03,-.08,.05,.078,.31,'olive'),rail(.073,-.2,.06,.028),Pt(0,.035,-.255,.022,.022,.07,'steel'),Pt(0,.036,-.2925,.016,.016,.004,'muzzle'),Pt(0,.0,-.2,.05,.03,.12,'vent'),
    Pt(0,.095,-.03,.026,.03,.05,'blk'),Pt(0,.095,-.19,.01,.024,.01,'blk'),Pt(.0255,.04,-.06,.002,.018,.06,'muzzle'),Pt(-.028,.048,-.12,.014,.01,.04,'blk'),
    ...pGrip('grip2',-.045,.025,.25),...TAG('mag',[Pt(0,-.085,-.1,.034,.15,.052,'blk'),Pt(0,-.162,-.1,.038,.012,.056,'blk2')]),
    Pt(0,.025,.13,.03,.06,.15,'olive'),Pt(0,.02,.21,.04,.1,.022,'rub'),...tGuard(-.03)],
    grip:[0,-.025,.02],sup:[0,-.01,-.2],muzzle:[0,.036,-.295],mag:[0,-.11,-.1],eject:[.028,.05,-.07]},
  pd50:{parts:[Pt(0,.0,-.07,.058,.075,.34,'tan2'),Pt(0,.03,-.07,.05,.03,.3,'tan2'),...TAG('mag',[Pt(0,.066,-.1,.044,.03,.27,'smoke'),Pt(0,.066,.04,.04,.026,.02,'blk2')]),
    Pt(0,.005,-.255,.054,.06,.06,'tan2',{rx:.4}),Pt(0,.03,-.29,.02,.02,.07,'steel'),Pt(0,.03,-.327,.026,.026,.012,'blk'),Pt(0,.03,-.3345,.014,.014,.003,'muzzle'),
    Pt(0,.105,-.19,.03,.036,.08,'blk'),Pt(0,.105,-.2305,.022,.022,.003,'lens'),Pt(0,.105,-.15,.024,.02,.01,'blk2'),Pt(.03,.025,-.17,.004,.012,.03,'blk'),Pt(-.03,.025,-.17,.004,.012,.03,'blk'),
    Pt(0,-.06,-.17,.05,.05,.05,'tan2'),Pt(0,-.06,-.12,.03,.04,.05,'blk2'),Pt(0,-.065,.065,.056,.07,.12,'tan2'),Pt(0,-.03,.025,.03,.03,.05,'blk2'),Pt(0,.0,.12,.06,.1,.024,'rub'),
    ...pGrip('tan2',-.04,.02,.12),...tGuard(-.02),Pt(.03,.0,-.06,.003,.03,.1,'blk')],
    grip:[0,-.025,.02],sup:[0,-.055,-.17],muzzle:[0,.03,-.336],mag:[0,.07,-.09],eject:[0,-.05,.05]},
  ar7:{parts:[Pt(0,.0,-.02,.05,.07,.24,'blk'),Pt(0,.058,-.05,.054,.05,.3,'blk'),Pt(0,.055,-.33,.064,.064,.26,'vent'),rail(.091,-.46,-.2,.026),rail(.091,-.18,.1,.026),
    Pt(0,.057,-.55,.024,.024,.2,'steel'),Pt(0,.06,-.665,.034,.036,.04,'blk'),Pt(0,.06,-.686,.02,.02,.006,'muzzle'),Pt(.019,.06,-.665,.002,.03,.026,'muzzle'),Pt(-.019,.06,-.665,.002,.03,.026,'muzzle'),
    ...redDot(.12,-.07),Pt(0,.1,-.43,.016,.034,.02,'blk'),Pt(0,.115,-.43,.006,.012,.006,'steel'),Pt(.0285,.06,-.06,.003,.022,.07,'muzzle'),Pt(.03,.07,-.01,.012,.012,.012,'blk'),Pt(0,.09,.07,.04,.008,.02,'blk'),
    ...pGrip('grip2',-.065,.035,.28),...TAG('mag',[Pt(0,-.1,-.11,.035,.17,.07,'blk',{rx:-.12}),Pt(0,-.185,-.1,.038,.012,.074,'blk2',{rx:-.12})]),
    Pt(0,.03,.16,.03,.03,.14,'blk2'),Pt(0,.03,.25,.05,.08,.16,'blk2'),Pt(0,.03,.338,.056,.11,.02,'rub'),...tGuard(-.005),Pt(.027,.06,-.08,.004,.02,.06,'brass'),Pt(-.035,.055,-.33,.008,.03,.08,'rail')],
    grip:[0,-.03,.02],sup:[-.005,.01,-.33],muzzle:[0,.06,-.69],mag:[0,-.15,-.11],eject:[.03,.06,-.08]},
  ar5c:{parts:[Pt(0,.02,-.04,.05,.072,.28,'olive'),Pt(0,.04,-.27,.058,.058,.2,'vent'),Pt(0,.045,-.43,.022,.022,.14,'steel'),Pt(0,.046,-.51,.03,.03,.03,'blk'),Pt(0,.046,-.5265,.016,.016,.003,'muzzle'),
    ...scope(.11,-.17,.06,.036),rail(.072,-.18,.08,.026),Pt(.026,.04,-.06,.003,.02,.07,'muzzle'),Pt(.03,.05,-.01,.014,.01,.012,'blk'),
    ...pGrip('grip2',-.06,.04,.28),...TAG('mag',[Pt(0,-.08,-.1,.032,.15,.065,'smoke',{rx:-.12}),Pt(0,-.155,-.09,.036,.012,.068,'blk2',{rx:-.12})]),
    Pt(0,.03,.18,.016,.06,.2,'blk'),Pt(0,.0,.18,.016,.016,.2,'blk'),Pt(0,.02,.285,.04,.1,.02,'rub'),...tGuard(-.005)],
    grip:[0,-.03,.02],sup:[0,.0,-.28],muzzle:[0,.046,-.53],mag:[0,-.13,-.1],eject:[.03,.05,-.07],scope:[0,.11,-.05]},
  kv47:{parts:[Pt(0,.01,-.03,.05,.07,.28,'gunmetal'),Pt(0,.05,-.05,.046,.024,.26,'gunmetal'),Pt(0,.03,-.32,.06,.06,.24,'wood'),Pt(0,.07,-.3,.046,.03,.18,'wood2'),Pt(0,.055,-.56,.024,.024,.26,'steel'),Pt(0,.08,-.62,.014,.04,.02,'gunmetal'),
    Pt(0,.055,-.7,.03,.03,.04,'gunmetal'),Pt(0,.055,-.722,.018,.018,.006,'muzzle'),Pt(0,.08,-.16,.018,.02,.03,'gunmetal'),Pt(0,.09,-.16,.008,.008,.012,'steel'),Pt(0,.03,-.48,.022,.022,.14,'gunmetal'),
    ...pGrip('wood2',-.06,.04,.3),...TAG('mag',[Pt(0,-.09,-.11,.034,.12,.07,'gunmetal',{rx:-.25}),Pt(0,-.17,-.075,.034,.08,.065,'gunmetal',{rx:-.55}),Pt(0,-.205,-.05,.036,.012,.068,'blk',{rx:-.7})]),
    Pt(0,.0,.2,.044,.09,.26,'wood',{rx:-.12}),Pt(0,-.012,.33,.048,.12,.02,'rub',{rx:-.12}),...tGuard(-.005),Pt(.028,.04,-.06,.006,.012,.1,'steel'),Pt(.028,.046,-.01,.016,.008,.012,'steel'),Pt(-.028,.01,-.08,.004,.04,.02,'steel')],
    grip:[0,-.03,.02],sup:[0,.0,-.33],muzzle:[0,.055,-.725],mag:[0,-.14,-.1],eject:[.03,.05,-.06]},
  g35:{parts:[Pt(0,.01,-.03,.05,.075,.28,'gunmetal'),Pt(0,.052,-.05,.046,.022,.24,'gunmetal'),Pt(0,.03,-.3,.056,.06,.22,'wood3'),Pt(0,.068,-.3,.044,.026,.16,'wood3'),Pt(0,.055,-.52,.024,.024,.22,'steel'),
    Pt(0,.08,-.58,.012,.04,.014,'gunmetal'),Pt(0,.055,-.65,.032,.032,.04,'blk'),Pt(0,.055,-.6715,.018,.018,.003,'muzzle'),Pt(0,.09,-.02,.012,.02,.012,'gunmetal'),Pt(.03,.05,-.06,.03,.01,.01,'steel'),
    ...pGrip('blk2',-.06,.04,.3),...TAG('mag',[Pt(0,-.085,-.11,.034,.13,.07,'gunmetal',{rx:-.2}),Pt(0,-.165,-.085,.034,.07,.065,'gunmetal',{rx:-.45})]),
    Pt(.0,.04,.17,.018,.018,.2,'steel'),Pt(0,-.02,.17,.018,.018,.2,'steel'),Pt(0,.01,.27,.04,.12,.02,'blk'),...tGuard(-.005)],
    grip:[0,-.03,.02],sup:[0,.0,-.3],muzzle:[0,.055,-.675],mag:[0,-.13,-.1],eject:[.03,.05,-.06]},
  hr17:{parts:[Pt(0,.06,-.08,.056,.055,.38,'tan'),Pt(0,.0,-.02,.05,.07,.2,'blk'),rail(.093,-.27,.1,.03),Pt(.032,.06,-.2,.008,.03,.16,'rail'),Pt(-.032,.06,-.2,.008,.03,.16,'rail'),
    Pt(0,.058,-.36,.026,.026,.2,'steel'),Pt(0,.058,-.48,.038,.036,.05,'blk'),Pt(0,.058,-.5065,.018,.018,.003,'muzzle'),Pt(.02,.064,-.48,.002,.012,.03,'muzzle'),Pt(-.02,.064,-.48,.002,.012,.03,'muzzle'),
    ...scope(.125,-.12,.02,.026),Pt(-.03,.075,-.08,.012,.012,.05,'blk'),
    ...pGrip('grip2',-.06,.04,.3),...TAG('mag',[Pt(0,-.085,-.1,.04,.13,.075,'blk'),Pt(0,-.155,-.1,.044,.012,.078,'blk2')]),
    Pt(0,.045,.17,.05,.09,.2,'tan'),Pt(0,.025,.24,.03,.06,.06,'tan'),Pt(0,.04,.275,.056,.12,.02,'rub'),...tGuard(-.005)],
    grip:[0,-.03,.02],sup:[0,.02,-.27],muzzle:[0,.058,-.51],mag:[0,-.12,-.1],eject:[.03,.06,-.08],scope:[0,.125,-.05]},
  br3:{parts:[Pt(0,.03,-.01,.052,.09,.42,'olive'),Pt(0,.12,-.08,.02,.022,.32,'blk'),Pt(0,.095,-.21,.014,.03,.014,'blk'),Pt(0,.095,.06,.014,.03,.014,'blk'),Pt(0,.04,-.26,.054,.06,.12,'vent'),
    Pt(0,.04,-.38,.022,.022,.16,'steel'),Pt(0,.04,-.47,.03,.03,.03,'blk'),Pt(0,.04,-.4865,.016,.016,.003,'muzzle'),Pt(0,.0,-.37,.012,.012,.14,'blk'),Pt(0,.133,-.08,.008,.008,.08,'steel'),
    ...pGrip('grip2',-.055,-.04,.25),...TAG('mag',[Pt(0,-.07,.1,.03,.14,.06,'blk',{rx:-.15}),Pt(0,-.142,.112,.034,.012,.064,'blk2',{rx:-.15})]),
    Pt(0,.03,.215,.056,.11,.02,'rub'),Pt(.027,.05,.06,.003,.022,.07,'muzzle'),...tGuard(-.06)],
    grip:[0,-.03,-.04],sup:[0,.0,-.28],muzzle:[0,.04,-.49],mag:[0,-.1,.1],eject:[.03,.05,.06]},
  sg8:{parts:[Pt(0,.03,-.05,.05,.075,.24,'blk'),Pt(0,.065,-.45,.026,.026,.62,'steel'),Pt(0,.066,-.762,.018,.018,.006,'muzzle'),Pt(0,.03,-.4,.026,.026,.5,'blk2'),...TAG('pump',[Pt(0,.03,-.3,.05,.05,.2,'wood'),Pt(0,.03,-.3,.052,.04,.14,'wood2')]),
    Pt(0,.08,-.74,.008,.012,.008,'bright'),Pt(0,.072,-.02,.012,.01,.06,'blk'),Pt(.0255,.035,-.06,.003,.03,.08,'muzzle'),Pt(.027,.03,-.03,.004,.012,.012,'steel'),Pt(0,.03,-.655,.03,.03,.02,'steel'),
    ...pGrip('rub',-.045,.04,.32),Pt(0,.0,.21,.046,.085,.3,'wood',{rx:-.1}),Pt(0,-.015,.36,.05,.12,.02,'rub',{rx:-.1}),...tGuard(-.01)],
    grip:[0,-.03,.02],sup:[0,.005,-.3],muzzle:[0,.066,-.765],mag:[0,.0,-.12],eject:[.03,.05,-.06]},
  as12:{parts:[Pt(0,.03,-.06,.06,.1,.32,'blk'),Pt(0,.11,-.12,.024,.04,.22,'blk2'),Pt(0,.05,-.4,.07,.07,.24,'vent'),Pt(0,.055,-.6,.03,.03,.2,'steel'),Pt(0,.056,-.704,.04,.04,.03,'blk'),Pt(0,.056,-.72,.024,.024,.006,'muzzle'),
    rail(.135,-.2,-.04,.024),Pt(.031,.04,-.07,.003,.04,.09,'muzzle'),Pt(.033,.05,-.02,.014,.01,.012,'blk'),
    ...pGrip('grip2',-.07,.04,.25),...TAG('mag',[Pt(0,-.08,-.14,.06,.13,.09,'blk'),Pt(0,-.15,-.14,.064,.012,.094,'blk2')]),Pt(0,.03,.21,.05,.1,.22,'blk2'),Pt(0,.03,.33,.056,.13,.02,'rub'),...tGuard(-.03),Pt(0,-.02,-.36,.034,.08,.04,'blk2')],
    grip:[0,-.03,.02],sup:[0,-.05,-.36],muzzle:[0,.056,-.725],mag:[0,-.14,-.14],eject:[.035,.06,-.08]},
  db2:{parts:[...TAG('mag',[Pt(-.014,.055,-.36,.026,.026,.58,'gunmetal'),Pt(.014,.055,-.36,.026,.026,.58,'gunmetal'),Pt(0,.071,-.36,.008,.006,.56,'steel'),Pt(-.014,.055,-.6515,.016,.016,.003,'muzzle'),Pt(.014,.055,-.6515,.016,.016,.003,'muzzle'),
      Pt(0,.03,-.22,.046,.034,.18,'wood'),Pt(0,.078,-.63,.006,.006,.008,'bright')]),
    Pt(0,.04,-.03,.05,.06,.12,'engraved'),Pt(0,.08,.0,.008,.008,.045,'steel'),Pt(0,.068,.01,.012,.01,.02,'steel'),...pGrip('wood',-.03,.05,.32),Pt(0,.0,.19,.044,.075,.28,'wood',{rx:-.12}),Pt(0,-.02,.33,.048,.1,.02,'rub',{rx:-.12}),...tGuard(-.01)],
    grip:[0,-.025,.03],sup:[0,.0,-.22],muzzle:[0,.055,-.655],mag:[0,.04,-.25],eject:[0,.06,-.06],hinge:[0,.03,-.09]},
  m14:{parts:[Pt(0,.03,-.05,.052,.075,.25,'blk'),Pt(0,.065,-.42,.024,.024,.55,'steel'),Pt(0,.066,-.6965,.016,.016,.003,'muzzle'),Pt(0,.03,-.37,.026,.026,.42,'blk2'),Pt(0,.03,-.3,.05,.05,.2,'blk2'),
    Pt(0,.085,-.35,.03,.012,.3,'vent'),Pt(0,.1,-.02,.026,.022,.02,'blk'),Pt(0,.083,-.68,.008,.014,.008,'orange'),Pt(.032,.03,-.05,.008,.04,.1,'brass'),Pt(.027,.045,-.06,.003,.028,.07,'muzzle'),
    ...pGrip('grip2',-.045,.04,.3),Pt(0,.02,.2,.046,.085,.28,'blk2',{rx:-.08}),Pt(0,.0,.34,.05,.12,.02,'rub',{rx:-.08}),...tGuard(-.01)],
    grip:[0,-.03,.02],sup:[0,.005,-.3],muzzle:[0,.066,-.7],mag:[0,.0,-.12],eject:[.03,.05,-.06]},
  r700:{parts:[Pt(0,.02,-.06,.046,.055,.26,'blk'),Pt(0,.04,-.48,.024,.024,.56,'bluesteel'),Pt(0,.04,-.764,.03,.03,.012,'blk'),Pt(0,.04,-.771,.016,.016,.004,'muzzle'),...scope(.105,-.24,.12,.04),
    Pt(0,.068,-.12,.02,.03,.02,'blk'),Pt(0,.068,.0,.02,.03,.02,'blk'),...TAG('bolt',[Pt(.045,.04,.035,.04,.012,.012,'steel'),Pt(.065,.04,.035,.016,.016,.016,'blk')]),
    ...TAG('mag',[Pt(0,-.035,-.06,.034,.05,.07,'blk')]),...pGrip('tan',-.06,.04,.25),Pt(0,.0,-.3,.05,.06,.34,'tan'),Pt(0,.0,.2,.05,.11,.3,'tan',{rx:-.06}),Pt(0,.04,.15,.044,.03,.1,'tan'),Pt(0,-.005,.36,.054,.14,.02,'rub',{rx:-.06}),
    Pt(0,-.035,-.38,.012,.01,.12,'blk'),...tGuard(-.005)],
    grip:[0,-.03,.02],sup:[0,-.01,-.32],muzzle:[0,.04,-.775],mag:[0,-.06,-.06],eject:[.03,.05,-.04],scope:[0,.105,-.06]},
  sr8:{parts:[Pt(0,.02,-.06,.04,.05,.24,'blk'),Pt(0,.04,-.42,.02,.02,.48,'steel'),Pt(0,.04,-.6625,.014,.014,.003,'muzzle'),...scope(.095,-.2,.06,.03,'bluesteel'),
    ...TAG('bolt',[Pt(.04,.04,.03,.036,.01,.01,'steel'),Pt(.058,.04,.03,.014,.014,.014,'blk')]),...TAG('mag',[Pt(0,-.03,-.06,.03,.04,.06,'blk')]),
    ...pGrip('olive',-.055,.04,.25),Pt(0,.0,-.27,.044,.05,.3,'olive'),Pt(0,.0,.19,.044,.1,.28,'olive',{rx:-.06}),Pt(0,-.005,.335,.048,.12,.02,'rub',{rx:-.06}),...tGuard(-.005)],
    grip:[0,-.03,.02],sup:[0,-.01,-.28],muzzle:[0,.04,-.665],mag:[0,-.05,-.06],eject:[.03,.05,-.04],scope:[0,.095,-.07]},
  dm14:{parts:[Pt(0,.025,-.06,.048,.06,.3,'gunmetal'),Pt(0,.05,-.5,.024,.024,.5,'steel'),Pt(0,.05,-.76,.034,.03,.04,'gunmetal'),Pt(0,.05,-.7815,.016,.016,.003,'muzzle'),...scope(.115,-.2,.07,.034),
    Pt(.028,.035,-.2,.008,.01,.24,'steel'),Pt(0,.07,-.12,.02,.03,.02,'blk'),Pt(0,.07,.02,.02,.03,.02,'blk'),...TAG('mag',[Pt(0,-.06,-.08,.04,.09,.08,'blk'),Pt(0,-.105,-.08,.044,.012,.084,'blk2')]),
    Pt(0,.01,-.36,.05,.06,.3,'wood'),...pGrip('wood',-.045,.04,.3),Pt(0,.0,.2,.048,.1,.3,'wood',{rx:-.08}),Pt(0,-.01,.35,.052,.13,.02,'rub',{rx:-.08}),...tGuard(-.01)],
    grip:[0,-.03,.02],sup:[0,.0,-.36],muzzle:[0,.05,-.785],mag:[0,-.09,-.08],eject:[.03,.05,-.06],scope:[0,.115,-.06]},
  hmg:{parts:[Pt(0,.04,-.06,.08,.11,.34,'olive'),Pt(0,.11,-.06,.074,.03,.3,'blk'),Pt(0,.06,-.42,.06,.06,.38,'vent'),Pt(0,.06,-.68,.03,.03,.16,'steel'),Pt(0,.06,-.78,.044,.044,.05,'blk'),Pt(0,.06,-.806,.026,.026,.006,'muzzle'),
    Pt(0,.15,-.24,.02,.05,.02,'blk'),Pt(0,.17,-.24,.02,.02,.12,'blk'),Pt(.05,.02,-.1,.04,.08,.1,'olive'),rail(.13,-.2,.06,.03),...redDot(.155,-.06),
    ...pGrip('grip2',-.07,.06,.28),...TAG('mag',[Pt(0,-.07,-.12,.12,.13,.13,'olive'),Pt(.065,-.02,-.12,.008,.06,.1,'belt'),Pt(0,-.07,-.12,.124,.02,.134,'blk')]),
    Pt(0,.03,.22,.06,.12,.24,'olive'),Pt(0,.03,.345,.065,.14,.02,'rub'),Pt(0,.01,-.52,.03,.03,.24,'blk'),Pt(-.02,-.02,-.55,.012,.012,.2,'blk'),Pt(.02,-.02,-.55,.012,.012,.2,'blk'),...tGuard(.0)],
    grip:[0,-.03,.03],sup:[0,.02,-.4],muzzle:[0,.06,-.81],mag:[0,-.12,-.12],eject:[.05,.05,-.1]},
  mg6:{parts:[Pt(0,.04,-.05,.07,.1,.36,'gunmetal'),Pt(0,.1,-.06,.066,.03,.2,'gunmetal'),Pt(0,.05,-.45,.034,.034,.4,'steel'),Pt(0,.05,-.45,.042,.03,.24,'vent'),Pt(0,.02,-.42,.018,.018,.36,'gunmetal'),
    Pt(0,.05,-.67,.04,.04,.05,'blk'),Pt(0,.05,-.6965,.02,.02,.003,'muzzle'),Pt(0,.1,-.4,.014,.05,.014,'blk'),Pt(0,.125,-.4,.014,.012,.12,'blk'),Pt(0,.08,-.64,.008,.03,.01,'gunmetal'),
    Pt(-.018,-.01,-.6,.01,.01,.22,'blk'),Pt(.018,-.01,-.6,.01,.01,.22,'blk'),Pt(0,.02,-.26,.06,.06,.16,'wood2'),
    ...pGrip('wood2',-.06,.06,.3),...TAG('mag',[Pt(0,-.065,-.08,.1,.12,.13,'olive2'),Pt(.055,.0,-.08,.012,.08,.1,'belt')]),Pt(0,.03,.25,.06,.12,.24,'wood2'),Pt(0,.03,.375,.064,.13,.02,'rub'),...tGuard(.0)],
    grip:[0,-.03,.03],sup:[0,.0,-.26],muzzle:[0,.05,-.7],mag:[0,-.1,-.08],eject:[.045,.05,-.08]},
  gx6:{parts:[...TAG('spin',[0,1,2,3,4,5].map(i=>{const a=i/6*TAU;return Pt(Math.cos(a)*.034,.04+Math.sin(a)*.034,-.42,.017,.017,.56,'steel')}).concat([Pt(0,.04,-.62,.1,.1,.02,'blk'),Pt(0,.04,-.42,.096,.096,.02,'blk'),Pt(0,.04,-.7,.08,.08,.012,'blk')])),
    Pt(0,.04,-.07,.13,.13,.24,'blk'),Pt(0,.04,-.2,.11,.11,.04,'blk2'),Pt(0,.15,-.08,.02,.06,.03,'blk2'),Pt(0,.18,-.08,.02,.02,.18,'grip2'),Pt(.07,.04,-.07,.012,.07,.16,'vent'),Pt(-.07,.04,-.07,.012,.07,.16,'vent'),
    Pt(0,-.06,-.22,.035,.09,.035,'grip2'),...pGrip('grip2',-.05,.08,.15),...TAG('mag',[Pt(0,-.1,-.04,.14,.13,.17,'olive2'),Pt(.08,-.02,-.05,.03,.06,.12,'belt')]),Pt(0,.04,.07,.11,.1,.04,'blk')],
    grip:[0,-.035,.08],sup:[0,-.04,-.22],muzzle:[0,.04,-.71],mag:[0,-.12,-.04],eject:[.07,.0,-.06],spinAxis:[0,.04]},
  // Air Burster: a pistol-gripped air cannon — painted air tank on top (the 'mag': it is swapped on reload), short barrel ending in a
  // flared bell with an orange rim, pressure gauge on the right, a hose from the tank valve down to the barrel, stock and front grip
  airb:{parts:[...TAG('mag',[Pt(0,.122,-.1,.074,.074,.34,'olive',{r:.034}),Pt(0,.122,.075,.06,.06,.014,'chrome',{r:.026}),Pt(0,.122,-.275,.06,.06,.014,'chrome',{r:.026}),
      Pt(0,.122,-.02,.077,.077,.022,'orange',{r:.035}),Pt(0,.122,-.2,.077,.077,.022,'orange',{r:.035}),Pt(0,.122,-.11,.078,.03,.09,'white',{r:.012}),Pt(0,.165,.06,.018,.018,.03,'steel',{r:.006})]),
    Pt(0,.03,-.11,.072,.092,.3,'blk2'),Pt(0,.078,-.11,.05,.012,.28,'blk'),Pt(0,.03,-.33,.054,.054,.16,'steel',{r:.022}),Pt(0,.03,-.33,.062,.062,.02,'blk',{r:.026}),
    Pt(0,.03,-.43,.072,.072,.05,'blk',{r:.03}),Pt(0,.03,-.47,.092,.092,.035,'blk',{r:.036}),Pt(0,.03,-.5,.112,.112,.03,'blk',{r:.044}),Pt(0,.03,-.52,.124,.124,.014,'orange',{r:.05}),
    Pt(0,.03,-.527,.09,.09,.004,'muzzle',{r:.04}),Pt(0,.03,-.523,.03,.03,.012,'steel',{r:.012}),
    Pt(.047,.07,-.02,.014,.052,.052,'chrome',{r:.022}),Pt(.055,.07,-.02,.003,.044,.044,'white',{r:.02}),Pt(.058,.074,-.024,.002,.004,.022,'orange',{rx:.7}),
    Pt(-.046,.11,.0,.018,.018,.06,'rub',{rx:.6}),Pt(-.05,.07,-.06,.018,.018,.1,'rub'),Pt(-.046,.05,-.15,.018,.018,.08,'rub',{rx:-.4}),Pt(-.04,.04,-.2,.022,.022,.02,'chrome',{r:.008}),
    ...pGrip('grip2',-.05,.03,.28),...tGuard(-.0),Pt(0,-.035,-.27,.032,.085,.036,'rub',{rx:.1}),Pt(0,-.08,-.272,.036,.01,.04,'blk'),
    Pt(0,.02,.13,.046,.072,.18,'blk2',{rx:-.05}),Pt(0,.01,.225,.05,.105,.02,'rub',{rx:-.05}),Pt(0,.0,.06,.03,.03,.06,'blk')],
    grip:[0,-.03,.02],sup:[0,-.04,-.27],muzzle:[0,.03,-.53],mag:[0,.122,-.1],eject:[0,.06,-.06]},
  gl40:{parts:[...TAG('mag',[Pt(0,.06,-.24,.062,.062,.36,'olive'),Pt(0,.06,-.4225,.046,.046,.004,'muzzle'),Pt(0,.06,-.07,.066,.066,.02,'blk'),Pt(0,.095,-.33,.01,.012,.04,'blk')]),
    Pt(0,.03,-.03,.054,.075,.14,'blk'),Pt(0,.11,-.04,.03,.034,.01,'blk'),Pt(0,.1,-.04,.006,.012,.012,'orange'),Pt(0,.0,-.24,.05,.04,.16,'blk2'),Pt(0,-.03,-.27,.032,.06,.034,'grip2'),
    ...pGrip('grip2',-.05,.04,.28),Pt(0,.02,.18,.044,.08,.24,'blk2',{rx:-.06}),Pt(0,.01,.31,.048,.11,.02,'rub',{rx:-.06}),...tGuard(-.01)],
    grip:[0,-.03,.02],sup:[0,-.03,-.27],muzzle:[0,.06,-.43],mag:[0,.06,-.24],eject:[0,.06,-.06],hinge:[0,.025,-.065]},
  he:{parts:[Pt(0,.0,-.03,.055,.075,.055,'heGreen'),Pt(0,.048,-.03,.026,.024,.026,'steel'),Pt(.02,.03,-.03,.008,.07,.014,'steel'),Pt(-.02,.05,-.03,.014,.014,.004,'bright'),Pt(0,-.04,-.03,.04,.008,.04,'heGreen')],grip:[0,0,0],muzzle:[0,0,-.03]},
  frost:{parts:[Pt(0,.0,-.03,.055,.075,.055,'frost'),Pt(0,.048,-.03,.026,.024,.026,'steel'),Pt(.02,.03,-.03,.008,.07,.014,'steel'),Pt(-.02,.05,-.03,.014,.014,.004,'bright'),Pt(0,-.04,-.03,.04,.008,.04,'frost')],grip:[0,0,0],muzzle:[0,0,-.03]},
  flare:{parts:[Pt(0,.02,-.03,.036,.14,.036,'red'),Pt(0,.097,-.03,.03,.016,.03,'white'),Pt(0,-.055,-.03,.04,.012,.04,'blk')],grip:[0,0,0],muzzle:[0,0,-.03]},
  zbomb:{parts:zbParts(true),grip:[0,0,0],sup:[.01,-.03,-.12],armL:[.55,-.45,-.7],muzzle:[0,0,-.03]},
  zbombT:{parts:zbParts(false),grip:[0,0,0],muzzle:[0,0,-.03]},
  glnade:{parts:[Pt(0,0,0,.04,.04,.07,'olive'),Pt(0,0,-.04,.034,.034,.02,'brass'),Pt(0,0,.04,.03,.03,.012,'yellow')],grip:[0,0,0],muzzle:[0,0,0]},
};
const GUN_CACHE={};
function gunGeo(id){if(GUN_CACHE[id])return GUN_CACHE[id];return GUN_CACHE[id]=partGeo(GUNS[id].parts,{gd:300,bevel:0})}
// world model material: probe-lit like characters
function matGun(){return new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:GA.tex},uProbe:{value:new THREE.Color(.4,.4,.45)},uFlash:{value:0},uTint:{value:new THREE.Vector4(0,0,0,0)},uEmisA:{value:1}},LU),vertexShader:VS_WORLD,fragmentShader:FS_CHAR})}
// kill-feed / buy-menu icon: side silhouette with a light rim
const ICONS={};
function gunIcon(id,h){h=h||22;const key=id+':'+h;if(ICONS[key])return ICONS[key];const G=GUNS[id];if(!G)return null;
  let z0=1e9,z1=-1e9,y0=1e9,y1=-1e9;const quads=[];
  for(const p of G.parts){if(p.c[0]<-.01&&G.parts.some(q=>q!==p&&Math.abs(q.c[0]+p.c[0])<.002&&q.c[2]===p.c[2]))continue;const c=Math.cos(p.rx||0),s=Math.sin(p.rx||0);const pts=[];for(const a of [-1,1])for(const b of [-1,1]){const dy=a*p.s[1]/2,dz=b*p.s[2]/2;const yy=p.c[1]+dy*c-dz*s,zz=p.c[2]+dy*s+dz*c;pts.push([zz,yy]);z0=Math.min(z0,zz);z1=Math.max(z1,zz);y0=Math.min(y0,yy);y1=Math.max(y1,yy)}quads.push(pts)}
  const sc=(h-4)/Math.max(.05,y1-y0);const w=Math.ceil((z1-z0)*sc)+4;const [cv,x]=mkCanvas(w,h);
  for(const pass of [0,1]){x.fillStyle=pass?'#e8e4d8':'#000';for(const q of quads){x.beginPath();const o=[q[0],q[1],q[3],q[2]];o.forEach((p,i)=>{const px=2+(z1-p[0])*sc+(pass?0:1),py=2+(y1-p[1])*sc+(pass?0:1);i?x.lineTo(px,py):x.moveTo(px,py)});x.closePath();x.fill()}}
  return ICONS[key]=cv.toDataURL()}
// ---------- first-person view models ----------
// arm: a sleeve box ending at the wrist + glove/hand with fingers; built along -Z from the wrist, oriented with lookAt
function armMesh(sleeve,hand,mat,o){o=o||{};const g=new THREE.Group();
  // rounded sleeve and cuff, a padded palm, knuckle row, two-segment fingers and a thumb
  const parts=[Pt(0,0,.21,.066,.066,.38,sleeve,{r:.03}),Pt(0,.0,.3,.07,.07,.02,sleeve,{r:.009}),Pt(0,0,.035,.074,.074,.05,o.cuff||sleeve,{r:.028}),Pt(0,-.004,-.04,.058,.07,.085,hand,{r:.02}),Pt(0,.028,-.04,.05,.012,.07,hand,{r:.005})];
  if(o.claws){for(let i=0;i<4;i++){const x=-.022+i*.015;parts.push(Pt(x,-.022,-.1,.012,.016,.05,hand,{rx:.25,r:.005}));parts.push(Pt(x,-.03+Math.abs(i-1.5)*.004,-.15-(i===1||i===2?.012:0),.009,.012,.1,'claw',{rx:.32,r:.003}))}}
  else{for(let i=0;i<4;i++){const x=-.021+i*.014;parts.push(Pt(x,-.03,-.088,.013,.02,.03,hand,{r:.005}));parts.push(Pt(x,-.045,-.1,.012,.03,.016,hand,{r:.005}))}}
  if(o.thumb)parts.push(Pt(-.035,.01,-.05,.022,.022,.05,hand,{ry:.4,r:.008}));
  const m=new THREE.Mesh(partGeo(parts),mat);m.frustumCulled=false;g.add(m);return g}
function lookArm(arm,hand,dir){arm.position.set(hand[0],hand[1],hand[2]);arm.lookAt(hand[0]+dir[0],hand[1]+dir[1],hand[2]+dir[2])}
// one gun (statics + animated tag groups) under a group
function vmGun(G,mat){const gun=new THREE.Group();const statics=G.parts.filter(p=>!p.tag),tags={};
  if(statics.length){const m=new THREE.Mesh(partGeo(statics),mat);m.frustumCulled=false;gun.add(m)}
  for(const t of ['mag','slide','pump','bolt','spin']){let ps=G.parts.filter(p=>p.tag===t);if(!ps.length)continue;const grp=new THREE.Group();
    if(t==='spin'&&G.spinAxis){const [ax,ay]=G.spinAxis;ps=ps.map(p=>Object.assign({},p,{c:[p.c[0]-ax,p.c[1]-ay,p.c[2]]}));grp.position.set(ax,ay,0)}
    else if(t==='spin'&&G.spinC){const [cx,cy,cz]=G.spinC;ps=ps.map(p=>Object.assign({},p,{c:[p.c[0]-cx,p.c[1]-cy,p.c[2]-cz]}));grp.position.set(cx,cy,cz)}
    if(t==='mag'&&G.hinge){const [hx,hy,hz]=G.hinge;ps=ps.map(p=>Object.assign({},p,{c:[p.c[0]-hx,p.c[1]-hy,p.c[2]-hz]}));grp.position.set(hx,hy,hz)}
    const m=new THREE.Mesh(partGeo(ps),mat);m.frustumCulled=false;grp.add(m);gun.add(grp);tags[t]=grp}
  return {gun,tags}}
// returns {root, gun, tags, armR, armL, gun2?}
function buildVM(id,skinKey,U,dual){const G=GUNS[id];const mat=matVM(GA.texVM,U);const root=new THREE.Group();
  const A=vmGun(G,mat);const gun=A.gun;root.add(gun);
  const zs=skinKey&&skinKey.startsWith('z');
  const sleeve=zs?'zs_'+skinKey.slice(2):'sl_'+(skinKey||'guard'),hand=zs?'zs_'+skinKey.slice(2):(skinKey==='medic'?'hglove':'glove');
  const armR=armMesh(sleeve,hand,mat,{cuff:zs?null:'cuff',thumb:1}),armL=armMesh(sleeve,hand,mat,{cuff:zs?null:'cuff',thumb:1});
  gun.add(armR);
  const gr=G.grip||[0,0,0];lookArm(armR,[gr[0]+.012,gr[1]-.02,gr[2]+.02],G.armR||[.35,-.42,1]);
  let gun2=null,tags2=null;
  if(dual){const B=vmGun(G.alt?GUNS[G.alt]:G,mat);gun2=B.gun;tags2=B.tags;root.add(gun2);gun2.add(armL);lookArm(armL,[gr[0]-.012,gr[1]-.02,gr[2]+.02],[-.35,-.42,1])}
  else{gun.add(armL);if(G.sup){lookArm(armL,G.sup,G.armL||[-.45,-.6,.75])}else{armL.visible=false}}
  return {id,root,gun,tags:A.tags,armR,armL,mat,gun2,tags2}}
// zombie claws: two arms only
function buildClaws(zk,U){const mat=matVM(GA.texVM,U);const root=new THREE.Group();const sk='zs_'+zk;
  const mk=s=>{const g=new THREE.Group();const a=armMesh(sk,sk,mat,{claws:1});g.add(a);a.rotation.set(0,0,0);return g};
  const R=mk(1),L=mk(-1);root.add(R);root.add(L);
  lookArm(R.children[0],[0,0,0],[.25,-.5,1]);lookArm(L.children[0],[0,0,0],[-.25,-.5,1]);
  let vd=false,doll=null;if(zk==='scream'){vd=true;// voodoo zombie: a pinned rag doll in the right fist, legs in the grip, head forward
    const B='burlap',dp=[Pt(0,-.004,-.075,.044,.04,.07,B,{r:.012}),Pt(0,-.004,-.15,.07,.054,.1,B,{r:.018}),Pt(0,0,-.235,.075,.066,.072,B,{r:.024}),
      Pt(-.05,-.004,-.16,.034,.026,.026,B,{r:.01}),Pt(.05,-.004,-.16,.034,.026,.026,B,{r:.01}),Pt(0,.024,-.15,.03,.004,.03,'red'),
      Pt(-.016,.03,-.23,.016,.004,.016,'blk'),Pt(.016,.03,-.23,.016,.004,.016,'blk'),Pt(0,.03,-.208,.03,.003,.004,'blk')];
    for(const [x,z,h] of [[-.02,-.24,.06],[.022,-.226,.05],[.012,-.14,.055]]){dp.push(Pt(x,.03+h/2,z,.004,h,.004,'steel'),Pt(x,.032+h,z,.012,.012,.012,'red',{r:.005}))}
    // the doll hangs from a wrist pivot at the fist so the swing can flick it up and chop it down
    for(const q of dp)q.c=[q.c[0],q.c[1]+.004,q.c[2]+.065];doll=new THREE.Group();doll.position.set(0,-.004,-.065);doll.add(new THREE.Mesh(partGeo(dp),mat));R.children[0].add(doll)}
  return {id:'claw',root,gun:root,tags:{},armR:R,armL:L,mat,vd,doll}}

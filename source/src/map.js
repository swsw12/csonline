'use strict';
// ============ Maps: brush geometry, light baking, the map registry and map switching ============
// Every solid is an axis-aligned brush; geometry, collision, light baking and navigation are all derived from this list.
// A face whose material is not in MATS (e.g. 'none') is not drawn: hidden outer faces of underground shells use it.
const MATS={
  conc:{t:'conc',s:2},concf:{t:'concf',s:2},asph:{t:'asph',s:3},dirt:{t:'dirt',s:2.5},brick:{t:'brick',s:2},metal:{t:'metal',s:2},metal2:{t:'metal2',s:2},
  plate:{t:'plate',s:1.5},tile:{t:'tile',s:2},plaster:{t:'plaster',s:2},roof:{t:'roof',s:2},hazard:{t:'hazard',s:1},
  wood:{t:'wood',uv:'box'},door:{t:'door',uv:'box'},win:{t:'win',uv:'box'},winLit:{t:'winLit',uv:'box',emis:.55},
  contR:{t:'contR',uv:'boxV',s:6},contB:{t:'contB',uv:'boxV',s:6},contG:{t:'contG',uv:'boxV',s:6},
  lampW:{t:'lampW',uv:'box',emis:1.4},lampO:{t:'lampO',uv:'box',emis:1.3},lampR:{t:'lampR',uv:'box',emis:1.3},
  signQ:{t:'signQ',uv:'box',emis:.12},signN:{t:'signN',uv:'box',emis:.08},signE:{t:'signE',uv:'box',emis:.9},signW:{t:'signW',uv:'box',emis:.1},
  sandbag:{t:'sandbag',s:1.6},pallet:{t:'pallet',uv:'box'},fence:{t:'fence',s:2},barrier:{t:'barrier',uv:'boxV',s:2},pipe:{t:'pipe',s:1},mark:{t:'mark',s:1},poster0:{t:'poster0',uv:'box',emis:.05},poster1:{t:'poster1',uv:'box',emis:.05},
  // v5.2 Q-7 detail props (k = surface kind for impacts and footsteps)
  tent:{t:'tent',s:2,k:'soft'},cot:{t:'cot',s:1,k:'soft'},cross:{t:'cross',uv:'box',k:'wood'},car:{t:'car',s:2,k:'metal'},carR:{t:'carR',s:2,k:'metal'},carBurnt:{t:'carBurnt',s:2,k:'metal'},
  carGl:{t:'carGl',uv:'box',k:'glass'},tire:{t:'tire',s:.6,k:'soft'},screen:{t:'screen',uv:'box',emis:.6,k:'glass'},cone:{t:'cone',s:.7,k:'soft'},bag:{t:'bag',s:1,k:'soft'},paintY:{t:'paintY',s:2,k:'metal'},
  signMed:{t:'signMed',uv:'box',emis:.15,k:'soft'},
};
// surface kind of a material: 'metal' | 'wood' | 'soft' | 'glass' | 'stone'
const MATK={metalx:'metal',tirex:'soft'};
function matKind(m){if(!m)return 'stone';const M=MATS[m];if(M&&M.k)return M.k;if(MATK[m])return MATK[m];
  return /metal|cont|plate|hazard|lamp|pipe|fence|roof/.test(m)?'metal':/wood|door|pallet/.test(m)?'wood':/dirt|asph|sandbag/.test(m)?'soft':/win/.test(m)?'glass':'stone'}
const MAP={id:null,boxes:[],lights:[],spawns:[],camps:[],zspawns:[],deco:[],fires:[],smoke:[],spray:[],dyn:[],moon:null,meshes:[],probe:null,probeY:null,env:null,cam:null,spawnYaw:Math.PI};
const MOON_D=new THREE.Vector3(-.42,.78,.46).normalize();
// rays that light the map and let bots see ignore see-through boxes (chain-link)
const SEE_THRU={skip:b=>b.o.pass};
function B(x0,y0,z0,x1,y1,z1,mat,o){const b={x0:Math.min(x0,x1),y0:Math.min(y0,y1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z1:Math.max(z0,z1),mat,o:o||{}};
  if(b.o.nosolid)b.nosolid=true;MAP.boxes.push(b);return b}
function LIGHT(x,y,z,col,range,int,o){MAP.lights.push(Object.assign({x,y,z,c:new THREE.Color(col),r:range,i:int},o||{}))}
// wall along X (thin in Z) or along Z (thin in X) with rectangular openings [u0,u1,y0,y1]
function wallX(x0,x1,z0,z1,y0,y1,mat,holes,o){holes=(holes||[]).slice().sort((a,b)=>a[0]-b[0]);let u=x0;
  for(const [h0,h1,hy0,hy1] of holes){if(h0>u)B(u,y0,z0,h0,y1,z1,mat,o);if(hy0>y0)B(h0,y0,z0,h1,hy0,z1,mat,o);if(hy1<y1)B(h0,hy1,z0,h1,y1,z1,mat,o);u=h1}if(u<x1)B(u,y0,z0,x1,y1,z1,mat,o)}
function wallZ(x0,x1,z0,z1,y0,y1,mat,holes,o){holes=(holes||[]).slice().sort((a,b)=>a[0]-b[0]);let u=z0;
  for(const [h0,h1,hy0,hy1] of holes){if(h0>u)B(x0,y0,u,x1,y1,h0,mat,o);if(hy0>y0)B(x0,y0,h0,x1,hy0,h1,mat,o);if(hy1<y1)B(x0,hy1,h0,x1,y1,h1,mat,o);u=h1}if(u<z1)B(x0,y0,u,x1,y1,z1,mat,o)}
// solid stair flight rising from (along=a0, y=y0) to (along=a1, y=y1); axis 'z' or 'x'
function stairs(axis,c0,c1,a0,a1,y0,y1,n,mat,o){const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1);
  if(axis==='z')B(c0,y0,s0,c1,top,s1,mat,Object.assign({stair:1},o||{}));else B(s0,y0,c0,s1,top,c1,mat,Object.assign({stair:1},o||{}))}}
// oil drum: a lit cylinder for looks, an invisible metal box for collision
function drum(x,z,y,mat){y=y||0;MAP.deco.push({k:'drum',x,y,z,r:.29,h:.88,mat:mat||'drumB',rot:hash2(Math.round(x*10),Math.round(z*10),5)*TAU});B(x-.2,y,z-.2,x+.2,y+.88,z+.2,'metalx')}
function fenceX(x0,x1,z,h){B(x0,0,z-.015,x1,h,z+.015,'fence',{pass:1});for(let x=x0;x<=x1+.01;x+=Math.max(1.2,(x1-x0)/Math.ceil((x1-x0)/2.6)))B(x-.05,0,z-.05,x+.05,h+.08,z+.05,'metal2')}
function fenceZ(z0,z1,x,h){B(x-.015,0,z0,x+.015,h,z1,'fence',{pass:1});for(let z=z0;z<=z1+.01;z+=Math.max(1.2,(z1-z0)/Math.ceil((z1-z0)/2.6)))B(x-.05,0,z-.05,x+.05,h+.08,z+.05,'metal2')}
function crate(x,z,s,y,mat){s=s||1.2;y=y||0;return B(x-s/2,y,z-s/2,x+s/2,y+s,z+s/2,mat||'wood')}
function lamp(x,z,h,col){B(x-.09,0,z-.09,x+.09,h,z+.09,'metal2');B(x-.38,h,z-.22,x+.38,h+.16,z+.22,'metal2',{nosolid:true});B(x-.3,h-.04,z-.16,x+.3,h,z+.16,'lampO',{nosolid:true});
  LIGHT(x,h-.35,z,col||'#ffae58',14,1.05,{lamp:1})}
// ground partition without overlaps: rectangles win over the default
function ground(rects,def){const xs=new Set([-31,31]),zs=new Set([-31,31]);for(const r of rects){xs.add(r[0]);xs.add(r[2]);zs.add(r[1]);zs.add(r[3])}
  const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
  for(let j=0;j<Z.length-1;j++){let run=null;for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2,cz=(Z[j]+Z[j+1])/2;let m=def;for(const r of rects)if(cx>r[0]&&cx<r[2]&&cz>r[1]&&cz<r[3])m=r[4];
      if(run&&run.m===m){run.x1=X[i+1]}else{if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1});run={x0:X[i],x1:X[i+1],m}}}
    if(run)B(run.x0,-1,Z[j],run.x1,0,Z[j+1],run.m,{ground:1})}}
// fill a rectangle with boxes, leaving rectangular holes [x0,z0,x1,z1]; runs along x are merged
function slab(x0,z0,x1,z1,y0,y1,mat,holes,o){const xs=new Set([x0,x1]),zs=new Set([z0,z1]);
  for(const h of holes){for(const v of [h[0],h[2]])if(v>x0&&v<x1)xs.add(v);for(const v of [h[1],h[3]])if(v>z0&&v<z1)zs.add(v)}
  const X=[...xs].sort((a,b)=>a-b),Z=[...zs].sort((a,b)=>a-b);
  for(let j=0;j<Z.length-1;j++){let run=null;const cz=(Z[j]+Z[j+1])/2;
    for(let i=0;i<X.length-1;i++){const cx=(X[i]+X[i+1])/2;const hole=holes.some(h=>cx>h[0]&&cx<h[2]&&cz>h[1]&&cz<h[3]);
      if(!hole){if(run)run.x1=X[i+1];else run={x0:X[i],x1:X[i+1]}}else if(run){B(run.x0,y0,Z[j],run.x1,y1,Z[j+1],mat,o);run=null}}
    if(run)B(run.x0,y0,Z[j],run.x1,y1,Z[j+1],mat,o)}}
// stacked tyres: a lit cylinder like the drums, an invisible box for collision
function tireStack(x,z,n,y){y=y||0;MAP.deco.push({k:'drum',x,y,z,r:.34,h:.24*n,mat:'tire',rot:hash2(Math.round(x*10),Math.round(z*10),7)*TAU});B(x-.26,y,z-.26,x+.26,y+.24*n,z+.26,'tirex')}
// traffic cone (decor only)
function cone(x,z){const o={nosolid:true};B(x-.2,0,z-.2,x+.2,.04,z+.2,'cone',o);B(x-.12,.04,z-.12,x+.12,.28,z+.12,'cone',o);B(x-.085,.28,z-.085,x+.085,.5,z+.085,'cone',o);B(x-.05,.5,z-.05,x+.05,.66,z+.05,'cone',o)}
// car: body, glass cabin, bumpers, wheels; the long side picks the axis, the front is at x0/z0
function car(x0,z0,x1,z1,mat,o){o=o||{};const ax=(x1-x0)>=(z1-z0);const L=ax?x1-x0:z1-z0,W=ax?z1-z0:x1-x0;
  const LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax?B(x0+a0,y0,z0+c0,x0+a1,y1,z0+c1,m,oo):B(x0+c0,y0,z0+a0,x0+c1,y1,z0+a1,m,oo);
  LB(.12,L-.12,0,W,.32,.95,mat);LB(1.15,L-1.0,.1,W-.1,.95,1.48,o.burnt?mat:'carGl',{f:{py:mat}});
  LB(0,.12,.08,W-.08,.3,.62,'metal2');LB(L-.12,L,.08,W-.08,.3,.62,'metal2');
  for(const a of [.55,L-1.25])for(const c of [-.04,W-.24])LB(a,a+.7,c,c+.28,0,.64,'tire');
  if(!o.burnt)for(const c of [.18,W-.53])LB(-.012,.002,c,c+.35,.62,.78,o.lights?'lampW':'metal2',{nosolid:true})}
// field tent: canvas walls, stepped ridge roof, a door on the +x side with a sign over it
function tent(x0,z0,x1,z1,d0,d1){const h=2.4,t=.06;
  wallX(x0,x1,z0,z0+t,0,h,'tent');wallX(x0,x1,z1-t,z1,0,h,'tent');wallZ(x0,x0+t,z0+t,z1-t,0,h,'tent');wallZ(x1-t,x1,z0+t,z1-t,0,h,'tent',[[d0,d1,0,2.25]]);
  const cz=(z0+z1)/2,hw=(z1-z0)/2+.15;
  B(x0-.12,h,cz-hw,x1+.12,h+.26,cz+hw,'tent');B(x0-.12,h+.26,cz-hw*.64,x1+.12,h+.5,cz+hw*.64,'tent');B(x0-.12,h+.5,cz-hw*.3,x1+.12,h+.68,cz+hw*.3,'tent');
  B(x1+.12,2.45,d0-.25,x1+.15,2.85,d1+.25,'signMed',{nosolid:true});
  B(x1-.04,0,d0-.08,x1+.04,2.3,d0,'metal2',{nosolid:true});B(x1-.04,0,d1,x1+.04,2.3,d1+.08,'metal2',{nosolid:true});B(x1,2.12,d0,x1+.2,2.3,d1,'tent',{nosolid:true})}
// screen on a monitor: only the given face shows the picture
function monitor(x0,y0,z0,x1,y1,z1,face){const f={px:'metal',nx:'metal',py:'metal',ny:'metal',pz:'metal',nz:'metal'};f[face]='screen';B(x0,y0,z0,x1,y1,z1,'screen',{f,nosolid:true})}
function buildQ7(){
  ground([[-14,-12,13,21,'asph'],[-30,-30,4.4,-12,'concf'],[14,-6.4,30,14.4,'tile'],[-30,2,-22,9,'concf'],[6,21,9.6,24.6,'concf'],[13,14.4,30,30,'asph']],'dirt');
  // ---- perimeter (6 m concrete) with the south gate
  B(-31,0,-31,31,6,-30,'conc');B(-31,0,-30,-30,6,30,'conc');B(30,0,-30,31,6,30,'conc');B(-31,0,30,-4,6,31,'conc');B(4,0,30,31,6,31,'conc');B(-4,0,30.3,4,2.4,30.7,'hazard');
  B(-4.4,0,30,-4,6.6,30.4,'metal2');B(4,0,30,4.4,6.6,30.4,'metal2');
  B(-22,3.2,-29.95,-14,4.6,-29.9,'signN',{nosolid:true});B(-6,2.2,29.95,6,3.4,30,'signQ',{nosolid:true});
  // ---- warehouse B (north-west): metal shell, mezzanine along the north wall, racks, stairs on the east end
  B(-31,6,-31,4.4,8.3,-30,'metal');B(-31,6,-30,-30,8.3,-12,'metal');
  wallZ(4,4.4,-30,-12.4,0,8,'metal',[[-15.1,-13.1,0,2.4]]);
  wallX(-30,4.4,-12.4,-12,0,8,'metal',[[-19,-11,0,4.6],[-1,1,0,2.4]]);
  B(-30,8,-30,4.4,8.4,-12,'roof',{f:{ny:'metal'}});
  B(-30,3.7,-30,4,4.0,-25,'plate',{f:{ny:'metal2'}});
  for(const x of [-26,-18,-10,-2])B(x,0,-25.4,x+.4,3.7,-25,'metal2');
  B(-30,4.0,-25.12,1.3,5.0,-25,'metal2',{rail:1});B(4,4,-25.1,4,5,-25,'metal2',{nosolid:true});
  stairs('z',1.6,3.8,-15.4,-25,0,4,16,'plate');B(1.45,0,-25,1.6,5,-15.4,'metal2',{rail:1,nosolid:true});
  B(-26,0,-21.5,-12,3.2,-20.5,'metal2',{f:{py:'wood'}});B(-26,0,-17.5,-12,3.2,-16.5,'metal2',{f:{py:'wood'}});
  for(const [x,z,y] of [[-24,-21,3.2],[-21.5,-21,3.2],[-15,-17,3.2],[-19,-17,3.2]])crate(x,z,1,y);
  crate(-8.4,-14.4);crate(-7.2,-14.4);crate(-7.8,-14.4,1.1,1.2);crate(-27.6,-13.8,1.1);crate(-26.5,-14.2,1);crate(-3,-27.5,1.2,4);crate(-1.8,-27.5,1.2,4);
  B(-17,5.2,-11.95,-13,6.4,-11.85,'signW',{nosolid:true});
  for(const [x,z] of [[-24,-21],[-14,-21],[-4,-21],[-24,-15],[-14,-15],[-4,-15]]){B(x-1,7.7,z-.18,x+1,7.85,z+.18,'lampW',{nosolid:true});LIGHT(x,7.3,z,'#cfe0ff',12,.95,{flick:x===-14&&z===-15})}
  LIGHT(-12,3.3,-27.5,'#cfe0ff',9,.55);LIGHT(-26,3.3,-27.5,'#cfe0ff',7,.4);B(-12.6,3.62,-27.7,-11.4,3.7,-27.3,'lampW',{nosolid:true});
  B(-6,6.7,-11.95,-5,7.1,-11.6,'lampW',{nosolid:true});LIGHT(-5.5,6.4,-10.3,'#dfe8ff',22,1.15,{flood:1});
  B(-1.6,2.5,-11.98,-1.1,2.75,-11.9,'lampR',{nosolid:true});LIGHT(-1.35,2.4,-11.4,'#ff3a2a',4.5,.7);
  // ---- office block (east): brick, two floors, stairwell in the south-east corner, windows over the yard
  const inner={px:'plaster'};
  wallZ(14,14.4,-6.4,14.4,0,7.4,'brick',[[2,4,0,2.4],[-3.5,-.5,4.6,6.2],[6,9,4.6,6.2],[-3.5,-.5,1.1,2.3]],{f:inner});
  wallX(14,30,-6.4,-6,0,7.4,'brick',[[20,22,0,2.4]],{f:{pz:'plaster'}});
  wallX(14,30,14,14.4,0,7.4,'brick',[[18,21,1.1,2.3],[22,25,4.6,6.2]],{f:{nz:'plaster'}});
  B(29.6,0,-6,30,7.4,14,'brick',{f:{nx:'plaster'}});B(30,6,-6.4,31,7.4,14.4,'brick');
  B(14,7.4,-6.4,30,7.7,14.4,'roof',{f:{ny:'plaster'}});
  const slab={f:{py:'tile',ny:'plaster'}};B(14.4,3.4,-6,26.2,3.7,14,'plaster',slab);B(26.2,3.4,-6,29.6,3.7,4.4,'plaster',slab);B(26.2,3.4,12.6,29.6,3.7,14,'plaster',slab);
  stairs('z',27.4,29.6,12.6,4.4,0,3.7,15,'conc');
  B(26.2,3.7,4.4,26.35,4.7,12.6,'metal2',{rail:1});B(26.2,3.7,12.45,27.4,4.7,12.6,'metal2',{rail:1});
  B(17,0,-3.6,19.6,.8,-1.8,'wood');B(21,0,-6,21.3,2.6,1.2,'plaster');B(15,0,10.5,18,1.1,11.4,'wood');B(23.5,0,-5.4,25.5,1.9,-4.6,'metal2');B(26,0,-5.4,28,1.9,-4.6,'metal2');
  B(15,3.7,-3.2,16.8,4.5,-.8,'wood');B(15,3.7,6.4,16.8,4.5,8.6,'wood');B(20,3.7,0,20.3,5.9,8,'plaster');B(22,3.7,-5.4,24,5.6,-4.6,'metal2');
  for(const [x,y,z,k] of [[20,3.1,0,.9],[22,3.1,9,.7],[18,7,-2,.8],[23,7,8,.65]]){B(x-.8,y+.22,z-.15,x+.8,y+.3,z+.15,'lampW',{nosolid:true});LIGHT(x,y,z,'#e6f2ff',9,k)}
  B(13.7,2.6,2.6,14,2.85,3.4,'lampO',{nosolid:true});LIGHT(13.2,2.5,3,'#ffb050',7,.9);
  B(14.42,2.45,2.3,14.46,2.85,3.7,'signE',{nosolid:true});B(28.5,3.15,13.95,29.2,3.3,14,'lampR',{nosolid:true});LIGHT(28.8,3,13.2,'#ff3a2a',5,.6);
  for(const [z0,z1,m] of [[-3.5,-.5,'winLit'],[6,9,'win']])B(13.9,4.6,z0,14.42,6.2,z1,m,{nosolid:true,glass:1});
  B(13.6,6.4,10,13.95,6.8,11,'lampW',{nosolid:true});LIGHT(12.8,6.2,10.5,'#dfe8ff',18,.9,{flood:1});
  // ---- shipping containers, crates and a truck in the yard
  B(-8,0,2,-2,2.6,4.5,'contR');B(-8,0,4.5,-2,2.6,7,'contB');B(-8,2.6,4.5,-2,5.2,7,'contG');
  crate(-5,1.4,1.2);B(-5.4,0,-.4,-4.6,.6,.8,'wood');
  B(4,0,-7,6.5,2.6,-1,'contB');B(-14,0,11,-8,2.6,13.5,'contR');B(-13.2,2.6,11,-9.2,5.2,13.5,'contG');
  crate(7.6,-3.4);crate(8.8,-3.4);crate(8.2,-3.4,1.1,1.2);crate(-10.6,-3);crate(-1,15.5);crate(.2,15.5);crate(11,4.5);crate(-12,6);crate(-12,7.2,1);
  B(2,.45,10.2,9.8,.9,12.2,'metal2');B(2,.9,10,7.6,3.4,12.4,'metal');B(7.8,.9,10.2,9.8,2.8,12.2,'contR');B(9.8,1.2,10.4,9.9,2.4,12,'win',{nosolid:true});
  for(const [x,z] of [[2.6,10],[2.6,12.4],[6.6,10],[6.6,12.4],[9,10],[9,12.4]])B(x-.45,0,z-.18,x+.45,.85,z+.18,'metal2');
  // ---- pump house (west) with roof access stairs
  wallX(-30,-22,2,2.4,0,3.2,'conc');wallX(-30,-22,8.6,9,0,3.2,'conc',[[-27,-25.6,0,2.2]]);wallZ(-22.4,-22,2.4,8.6,0,3.2,'conc',[[4.6,6.4,1.1,2.1]]);
  B(-30,3.2,2,-22,3.5,9,'roof',{f:{ny:'conc'}});B(-30,3.5,2,-22,4.1,2.2,'conc');B(-30,3.5,8.8,-22,4.1,9,'conc');B(-22.2,3.5,4.4,-22,4.1,9,'conc');
  stairs('z',-22,-19.8,12.2,4.4,0,3.5,14,'conc');B(-22,0,2,-19.8,3.5,4.4,'conc');
  B(-29,0,4,-26.4,1.4,6,'metal2');B(-24,0,3,-23,1.8,3.8,'metal2');LIGHT(-26,2.9,6.2,'#ffd080',6,.75);B(-26.6,3.12,6,-25.4,3.2,6.4,'lampO',{nosolid:true});
  B(-29.6,0,11,-27.4,1.9,15,'metal2');B(-26.8,0,11.2,-25.2,1.6,13,'metal2');
  // ---- guard booth (south)
  wallX(6,9.6,21,21.3,0,2.8,'conc',[[7,8.3,0,2.2]]);wallX(6,9.6,24.3,24.6,0,2.8,'conc',[[7,8.6,1.1,2.0]]);wallZ(6,6.3,21.3,24.3,0,2.8,'conc',[[22,23.6,1.1,2.0]]);wallZ(9.3,9.6,21.3,24.3,0,2.8,'conc',[[22,23.6,1.1,2.0]]);
  B(5.8,2.8,20.8,9.8,3.05,24.8,'roof',{f:{ny:'conc'}});B(6.4,0,23.4,8,.9,24.2,'wood');LIGHT(7.8,2.5,22.8,'#fff0c0',5,.75);B(7.4,2.72,22.6,8.2,2.8,23,'lampW',{nosolid:true});
  // ---- lamp posts and other yard lights
  for(const [x,z] of [[-6,-5],[6,5],[-11,17],[10,-10],[-1,23],[18,21],[-20,-6],[-22,22],[24,26]])lamp(x,z,5.6);
  MAP.fires=[];for(const [x,z] of [[-12,4.2],[13,25.5]]){B(x-.3,0,z-.3,x+.3,.85,z+.3,'metal2');B(x-.32,.05,z-.32,x+.32,.12,z+.32,'hazard',{nosolid:true});LIGHT(x,1.3,z,'#ff8a3a',7,.9);MAP.fires.push([x,.9,z])}
  // ---- props: sandbag nests, jersey barriers, a van, a fenced storage pen, drums, pallets, pipes, posters, road paint
  B(-3.2,0,25.6,3.2,1.05,26.3,'sandbag');B(-3.2,0,24.3,-2.5,1.05,25.6,'sandbag');B(2.5,0,24.3,3.2,1.05,25.6,'sandbag');
  B(-1,0,-4.2,1.6,1.05,-3.6,'sandbag');B(1.6,0,-4.2,2.2,1.05,-2.8,'sandbag');
  for(const x0 of [15.5,20.5,25.5])B(x0,0,17.5,x0+2.8,.85,18.1,'barrier');
  B(21,.45,21.6,25,2.6,23.6,'metal');B(25,.45,21.7,26.3,2.0,23.5,'metal');B(26.28,1.2,21.85,26.33,1.9,23.35,'win',{nosolid:true});B(21.6,1.3,21.55,24.4,1.55,21.6,'hazard',{nosolid:true});
  for(const [x,z] of [[21.8,21.6],[21.8,23.6],[25.4,21.7],[25.4,23.5]])B(x-.42,0,z-.16,x+.42,.8,z+.16,'metal2');
  fenceX(7,9.4,-20,2.6);fenceX(11.2,14,-20,2.6);fenceZ(-30,-20,14,2.6);fenceZ(-30,-20,7,2.6);
  crate(8.2,-28.6);crate(9.4,-28.6);crate(8.8,-28.6,1.1,1.2);B(10.8,0,-29,12.4,.14,-27.6,'pallet');drum(11.25,-28.55,.14,'drumR');drum(11.95,-28.05,.14,'drumB');drum(12.6,-25,0,'drumB');drum(12.5,-24.3,0,'drumR');drum(11.85,-24.7,0,'drumB');
  B(10,4.4,-29.98,11,4.62,-29.72,'lampO',{nosolid:true});LIGHT(10.5,4.1,-29.1,'#ffae58',11,.95);
  B(-10.8,0,-28.6,-9.6,.14,-27.4,'pallet');crate(-10.2,-28,1,.14);B(-12.4,0,-28.6,-11.2,.14,-27.4,'pallet');
  drum(-24.2,10.3);drum(-23.5,10.65,0,'drumR');drum(-1.3,4.6);drum(-.65,5.15,0,'drumR');drum(5.3,-17.2,0,'drumR');drum(5.95,-17.65);drum(16.4,24.6);
  B(-30,3.1,-11.95,-19.9,3.35,-11.7,'pipe',{nosolid:true});B(-19.95,0,-11.95,-19.7,3.35,-11.7,'pipe',{nosolid:true});B(-29.9,2.45,9.02,-22.1,2.7,9.25,'pipe',{nosolid:true});
  B(13.97,1.0,4.6,14.0,2.6,5.8,'poster0',{nosolid:true});B(-8,1.0,-12.0,-6.8,2.6,-11.97,'poster1',{nosolid:true});B(9.6,.9,22.2,9.63,2.1,23.1,'poster0',{nosolid:true});
  for(let z=-11;z<10.5;z+=3.5)B(-12.06,0,z,-11.94,.02,Math.min(z+2,10.5),'mark',{nosolid:true});
  for(const x of [16,19,22,25,28])B(x-.06,0,26.6,x+.06,.02,29.8,'mark',{nosolid:true});
  for(const x of [-4.2,4.2]){B(x-.15,6.6,30.05,x+.15,6.82,30.35,'lampR',{nosolid:true});LIGHT(x,6.3,29.4,'#ff3a2a',5,.6)}
  for(const [x0,z0,x1,z1] of [[-31,-30.56,31,-30.44],[-30.56,-30,-30.44,30],[30.44,-30,30.56,30],[-31,30.44,-4.4,30.56],[4.4,30.44,31,30.56]])B(x0,6,z0,x1,6.5,z1,'fence',{pass:1,nosolid:true});
  // ================= v5.2 detail pass =================
  // ---- perimeter: pilasters and a coping strip along the inner face of the 6 m wall
  for(const x of [8,19,25])B(x-.3,0,-30,x+.3,6,-29.62,'conc');
  for(const z of [-24,-16,20,26])B(29.62,0,z-.3,30,6,z+.3,'conc');
  for(const x of [-25,-18,-11,11,19,25])B(x-.3,0,29.62,x+.3,6,30,'conc');
  for(const z of [-6,12,18,24])B(-30,0,z-.3,-29.62,6,z+.3,'conc');
  B(4.4,5.72,-30,30,6.08,-29.78,'conc');B(29.78,5.72,-30,30,6.08,-6.4,'conc');B(29.78,5.72,14.4,30,6.08,30,'conc');
  B(-30,5.72,29.78,-4.4,6.08,30,'conc');B(4.4,5.72,29.78,30,6.08,30,'conc');B(-30,5.72,-12,-29.78,6.08,30,'conc');
  // ---- watchtower in the south-west corner: legs, a sandbagged platform, a roof and a floodlight over the yard
  for(const [x,z] of [[-27.75,25.25],[-24.25,25.25],[-27.75,28.75],[-24.25,28.75]]){B(x-.12,0,z-.12,x+.12,4.6,z+.12,'metal2');B(x-.06,4.85,z-.06,x+.06,7.4,z+.06,'metal2')}
  for(const y of [1.4,3.0]){B(-27.7,y,25.2,-24.3,y+.08,25.3,'metal2',{nosolid:true});B(-27.7,y,28.7,-24.3,y+.08,28.8,'metal2',{nosolid:true});B(-27.8,y,25.3,-27.7,y+.08,28.7,'metal2',{nosolid:true});B(-24.3,y,25.3,-24.2,y+.08,28.7,'metal2',{nosolid:true})}
  B(-28,4.6,25,-24,4.85,29,'plate',{f:{ny:'metal2'}});
  stairs('z',-27,-25,18,25,0,4.85,11,'plate');
  B(-28,4.85,25,-27.2,5.55,25.6,'sandbag');B(-24.8,4.85,25,-24,5.55,25.6,'sandbag');B(-28,4.85,25.6,-27.4,5.55,29,'sandbag');B(-27.4,4.85,28.4,-24,5.55,29,'sandbag');B(-24.6,4.85,25.6,-24,5.55,28.4,'sandbag');
  B(-28.3,7.4,24.7,-23.7,7.62,29.3,'roof',{f:{ny:'metal2'}});
  B(-24.1,6.95,24.75,-23.6,7.35,25.15,'metal2',{nosolid:true});B(-24.05,7,24.7,-23.65,7.3,24.75,'lampW',{nosolid:true});LIGHT(-23.8,6.7,23.4,'#e4ecff',18,.95,{flood:1});
  // ---- field clinic: two canvas tents in the west yard with cots, drips and body bags
  tent(-28.4,-10.2,-22.6,-5.6,-9,-7);tent(-28.4,-3.8,-22.6,.8,-2,0);
  for(const z of [-9.8,-6.8,-3.4,-.4]){B(-27.9,0,z,-26,.45,z+.8,'cot',{f:{nx:'metal2',px:'metal2'}})}
  for(const [x,z] of [[-25.6,-9.3],[-25.6,-6.3],[-25.6,-2.9]]){B(x-.03,0,z-.03,x+.03,1.75,z+.03,'metal2',{nosolid:true});B(x-.12,1.4,z-.06,x+.12,1.7,z+.06,'cot',{nosolid:true});B(x-.2,0,z-.2,x+.2,.04,z+.2,'metal2',{nosolid:true})}
  crate(-27.5,-7.9,.7,0,'cross');crate(-27.6,-1.5,.7,0,'cross');B(-25.2,0,-9.9,-23.4,.26,-9.2,'bag');
  B(-25.4,0,-.4,-24.2,.78,.4,'wood');monitor(-25.2,.78,-.1,-24.6,1.18,.0,'pz');
  LIGHT(-25.4,2.05,-7.9,'#ffd8a0',6.5,.8);LIGHT(-25.4,2.05,-1.5,'#ffd8a0',6.5,.8);B(-25.6,2.36,-8.1,-25.2,2.4,-7.7,'lampO',{nosolid:true});B(-25.6,2.36,-1.7,-25.2,2.4,-1.3,'lampO',{nosolid:true});
  B(-22,0,-11.3,-20.2,.26,-10.6,'bag');B(-21.8,0,-10.4,-20,.26,-9.7,'bag');B(-21.6,0,1.2,-19.8,.26,1.85,'bag');
  // ---- cars: one crashed with a headlight still on, two in the parking bays (one burnt out and smouldering)
  car(-12.6,24.1,-8.4,25.9,'car',{lights:1});LIGHT(-13.4,.72,25,'#fff0d0',6,.5);
  car(19.65,26.1,21.35,29.9,'carBurnt',{burnt:1});car(25.65,26.1,27.35,29.9,'carR');
  MAP.smoke.push([20.5,1.6,27.6],[17.1,2.75,-25.3]);
  // ---- generator and a floodlight mast in the north-east yard
  B(16.5,0,-26.5,20,.25,-24,'metal2');B(16.6,.25,-26.4,19.9,1.75,-24.1,'metal',{f:{py:'plate'}});B(16.6,1.2,-24.12,19.9,1.3,-24.08,'hazard',{nosolid:true});
  B(19.9,.6,-25.8,19.96,1.4,-24.7,'pipe',{nosolid:true});B(17,1.75,-25.4,17.2,2.75,-25.2,'pipe',{nosolid:true});B(18.6,1.4,-24.1,18.9,1.6,-24.06,'lampO',{nosolid:true});
  drum(21,-25.9,0,'drumR');drum(21.3,-25.2);
  B(23.85,0,-24.15,24.15,7.5,-23.85,'metal2');B(23.3,7.3,-24.5,24.7,7.8,-23.5,'metal2',{nosolid:true});B(23.35,7.25,-24.45,24.65,7.3,-23.55,'lampW',{nosolid:true});LIGHT(24,6.9,-23,'#e8f0ff',22,1.05,{flood:1});
  for(let x=20.1;x<23.8;x+=.9)B(x,0,-24.3,x+.9,.03,-24.2,'tire',{nosolid:true});
  B(15.6,0,-23.4,20.6,1.05,-22.8,'sandbag');B(15.6,0,-26.8,16.2,1.05,-23.4,'sandbag');
  // ---- office: monitors, bunks upstairs, a water cooler
  monitor(17.5,.8,-3.4,18.3,1.32,-3.3,'pz');monitor(18.6,.8,-3.4,19.4,1.32,-3.3,'pz');B(17.6,.8,-2.9,18.4,.83,-2.65,'metal2',{nosolid:true});LIGHT(18.4,1.3,-2.5,'#7aff9a',2.8,.35);
  monitor(15.15,4.5,-2.5,15.25,5,-1.6,'px');monitor(15.15,4.5,7,15.25,5,7.9,'px');LIGHT(15.8,5,-2,'#7aff9a',2.4,.3);
  for(const z of [-5.8,-3.6]){B(27.6,3.7,z,29.5,4.2,z+.9,'cot',{f:{nx:'metal2',px:'metal2'}});B(27.6,5.0,z,29.5,5.22,z+.9,'cot',{f:{nx:'metal2',px:'metal2',ny:'metal2'}});
    for(const [x,zz] of [[27.6,z],[29.44,z],[27.6,z+.84],[29.44,z+.84]])B(x,3.7,zz,x+.06,5.5,zz+.06,'metal2',{nosolid:true})}
  B(22.6,0,13.4,23.2,1.2,13.95,'plaster',{f:{py:'pipe'}});
  // ---- warehouse: a forklift with a raised pallet, hanging chains, sacks under the mezzanine
  B(-24.2,.15,-15.15,-22.2,1.25,-13.95,'paintY');B(-24.6,.15,-15.05,-24.2,1.15,-14.05,'metal');
  for(const [x,z] of [[-23.9,-15.25],[-23.9,-14.12],[-22.7,-15.25],[-22.7,-14.12]])B(x-.25,0,z,x+.25,.52,z+.27,'tire');
  for(const [x,z] of [[-23.9,-15.1],[-23.9,-14.06],[-22.3,-15.1],[-22.3,-14.06]])B(x,1.25,z,x+.06,2.3,z+.06,'metal2',{nosolid:true});
  B(-23.95,2.25,-15.12,-22.25,2.33,-14.0,'metal2');B(-23.6,1.25,-14.85,-23.1,1.6,-14.25,'tire');
  B(-22.2,.15,-15,-22,2.6,-14.1,'metal2');B(-22,.86,-15,-20.8,.94,-14.1,'metal2');B(-22,.94,-15.05,-20.8,1.08,-14.05,'pallet');crate(-21.4,-14.55,.85,1.08);
  for(const [x,z] of [[-20,-23],[-8,-19],[-15.5,-14.5],[-3,-17]]){B(x-.03,4.6,z-.03,x+.03,8,z+.03,'metal2',{nosolid:true});B(x-.1,4.45,z-.06,x+.1,4.6,z+.06,'metal2',{nosolid:true})}
  B(-27.8,0,-24.6,-26.2,.7,-23.4,'sandbag');B(-27.6,.7,-24.4,-26.6,1.15,-23.6,'sandbag');
  // ---- the yard: curbs along the asphalt, cones at the gate, tyre stacks, an electrical box, AC units and down-pipes
  const curb=(x0,z0,x1,z1)=>B(x0,0,z0,x1,.12,z1,'conc',{f:{py:'concf'}});
  curb(-14,20.85,-4.6,21.15);curb(4.6,20.85,6,21.15);curb(9.6,20.85,13,21.15);curb(-14.15,-12,-13.85,10.8);curb(-14.15,13.7,-13.85,20.85);curb(12.85,-12,13.15,14.4);
  for(const x of [-3.4,-1.7,1.7,3.4])cone(x,28.6);cone(-13.7,23.3);cone(-7.5,23.5);cone(16.1,-22.3);
  tireStack(11.5,27.6,3);tireStack(12.2,27.1,2);tireStack(-15.6,26,4);tireStack(-16.3,26.6,2);tireStack(26.6,-27.6,3);
  B(-10.2,.9,-12,-9.3,2.1,-11.72,'metal2');B(-10.2,1.95,-11.72,-9.3,2.05,-11.7,'hazard',{nosolid:true});B(-9.8,2.1,-11.95,-9.7,4.4,-11.85,'pipe',{nosolid:true});
  B(15.2,2.6,14.4,16.4,3.3,14.86,'metal2');B(26.5,4.8,14.4,27.7,5.5,14.86,'metal2');B(15.5,2.75,14.86,16.1,3.15,14.88,'pipe',{nosolid:true});B(26.8,4.95,14.86,27.4,5.35,14.88,'pipe',{nosolid:true});
  B(13.82,0,-6.3,13.98,7.4,-6.14,'pipe',{nosolid:true});B(13.82,0,14.12,13.98,7.4,14.28,'pipe',{nosolid:true});B(29.62,0,14.42,29.78,7.4,14.58,'pipe',{nosolid:true});
  // spawns, camps (for bots), zombie respawn points and the moon
  MAP.spawns=[];for(const x of [-6,-2,2,6,10])for(const z of [9,13,17])MAP.spawns.push([x+rr(-.6,.6),z+rr(-.6,.6)]);MAP.spawns.push([0,0],[-4,-8],[8,0]);
  MAP.zspawns=MAP.spawns.concat([[-20,-20],[-10,-16],[22,-2],[24,10],[-26,6],[-14,24],[20,24],[0,-2]]);
  MAP.camps=[
    {k:'mezz',w:.3,p:[[0,4,-27.6],[-3,4,-27.6],[-6,4,-26.6],[3,4,-28.6],[-9,4,-27]],look:[2.7,1,-16]},
    {k:'office',w:.3,p:[[27.8,3.7,1.6],[24.5,3.7,2.6],[16,3.7,-2],[16.2,3.7,7.5],[23,3.7,10]],look:[28.5,1.5,12]},
    {k:'cont',w:.1,p:[[-6.4,2.6,3.2],[-3.6,2.6,3.2]],look:[-5,0,-2]},
    {k:'pump',w:.14,p:[[-27,3.5,6],[-24.4,3.5,7.6],[-28,3.5,4]],look:[-21,2,12]},
    {k:'booth',w:.05,p:[[7.8,0,22.8]],look:[7.6,1,18]},
    {k:'rack',w:.11,p:[[-27.5,0,-19],[-27.5,0,-15]],look:[-10,1,-15]},
    {k:'tower',w:.1,p:[[-26,4.85,26],[-25.5,4.85,27.4],[-26.5,4.85,27.4]],look:[-14,1,12]},
    {k:'tent',w:.05,p:[[-25.4,0,-7.9],[-25.4,0,-1.5]],look:[-20,1,-6]},
  ];
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#4a5a7c'),i:.62};
  MAP.spawnYaw=Math.PI;
  // title backdrop: a slow orbit over the yard
  MAP.cam=(t,cam)=>{const a=t*.05;cam.position.set(Math.sin(a)*15,4.5+Math.sin(a*1.7),Math.cos(a)*15+4);cam.lookAt(0,1.5,2)};
}
// ---------- geometry: faces split into ~0.5 m cells (vertex-lit, so finer cells = sharper light pools and shadows); hidden cells are dropped ----------
function insideSolid(x,y,z,self){_bq.length=0;boxesIn(x,z,x,z,_bq);for(const b of _bq){if(b===self||b.nosolid)continue;if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1&&z>b.z0&&z<b.z1)return true}return false}
function buildMapGeometry(){
  const groups={};const g=m=>groups[m]||(groups[m]={pos:[],nrm:[],uv:[],col:[],tn:[]});
  const FACES=[['px',[1,0,0]],['nx',[-1,0,0]],['py',[0,1,0]],['ny',[0,-1,0]],['pz',[0,0,1]],['nz',[0,0,-1]]];
  for(const b of MAP.boxes){
    for(const [fk,n] of FACES){
      if(fk==='ny'&&b.y0<=-.99)continue;if(b.o.ground&&fk!=='py')continue;
      const mat=(b.o.f&&b.o.f[fk])||b.mat;const M=MATS[mat];if(!M)continue;
      // face rectangle: axis a (u) and b (v)
      let ax,bx,fixed,fv;if(n[0]){ax=2;bx=1;fixed=0;fv=n[0]>0?b.x1:b.x0}else if(n[1]){ax=0;bx=2;fixed=1;fv=n[1]>0?b.y1:b.y0}else{ax=0;bx=1;fixed=2;fv=n[2]>0?b.z1:b.z0}
      const lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.y1,b.z1];const ua=lo[ax],ub=hi[ax],va=lo[bx],vb=hi[bx];
      const CS=M.cs||(M.emis>=1?2:.5);const nu=Math.max(1,Math.round((ub-ua)/CS)),nv=Math.max(1,Math.round((vb-va)/CS));
      const G=g(mat);const TN=(fk==='py'?b.o.ttop:b.o.tint)||null;// optional per-box colour tint (multiplies the baked light)
      for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
        const u0=ua+(ub-ua)*i/nu,u1=ua+(ub-ua)*(i+1)/nu,v0=va+(vb-va)*j/nv,v1=va+(vb-va)*(j+1)/nv;
        const c=[0,0,0];c[ax]=(u0+u1)/2;c[bx]=(v0+v1)/2;c[fixed]=fv+n[fixed]*.02;
        // a cell buried in another solid is dropped, unless part of it still shows (a ramp or stair beside a wall)
        if(!b.nosolid&&insideSolid(c[0],c[1],c[2],b)){let part=false;for(const [du,dv] of [[.04,.04],[.96,.04],[.04,.96],[.96,.96]]){const q=[0,0,0];q[ax]=u0+(u1-u0)*du;q[bx]=v0+(v1-v0)*dv;q[fixed]=c[fixed];if(!insideSolid(q[0],q[1],q[2],b)){part=true;break}}if(!part)continue}
        const corners=[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];const P=corners.map(([u,v])=>{const p=[0,0,0];p[ax]=u;p[bx]=v;p[fixed]=fv;return p});
        // winding: make the triangle normal match n
        const e1=[P[1][0]-P[0][0],P[1][1]-P[0][1],P[1][2]-P[0][2]],e2=[P[2][0]-P[0][0],P[2][1]-P[0][1],P[2][2]-P[0][2]];
        const cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const flip=(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2])<0;
        const order=flip?[0,2,1,0,3,2]:[0,1,2,0,2,3];
        for(const k of order){const p=P[k];G.pos.push(p[0],p[1],p[2]);G.nrm.push(n[0],n[1],n[2]);G.uv.push(...faceUV(b,M,fk,p));if(TN)G.tn.push(TN[0],TN[1],TN[2]);else G.tn.push(1,1,1)}
      }
    }
  }
  return groups}
function faceUV(b,M,fk,p){
  const s=M.s||2;
  if(M.uv==='box'){let u,v;if(fk==='px'||fk==='nx'){u=(p[2]-b.z0)/(b.z1-b.z0);v=(p[1]-b.y0)/(b.y1-b.y0);if(fk==='px')u=1-u}
    else if(fk==='py'||fk==='ny'){u=(p[0]-b.x0)/(b.x1-b.x0);v=(p[2]-b.z0)/(b.z1-b.z0)}else{u=(p[0]-b.x0)/(b.x1-b.x0);v=(p[1]-b.y0)/(b.y1-b.y0);if(fk==='nz')u=1-u}return [u,v]}
  if(M.uv==='boxV'){if(fk==='py'||fk==='ny')return [p[0]/s,p[2]/s];const along=fk==='px'?b.z1-p[2]:fk==='nx'?p[2]-b.z0:fk==='pz'?p[0]-b.x0:b.x1-p[0];return [along/s,(p[1]-b.y0)/(b.y1-b.y0)]}
  if(M.uv==='boxU'&&(fk==='py'||fk==='ny'))return [(p[0]-b.x0)/(b.x1-b.x0),p[2]/s];
  // world-space tiling; uo shifts u, vo/sv place v in absolute height (train sides line up across door openings)
  const uo=M.uo||0,vo=M.vo||0,sv=M.sv||s;
  if(fk==='px'||fk==='nx')return [(fk==='px'?-p[2]:p[2])/s+uo,(p[1]-vo)/sv];if(fk==='pz'||fk==='nz')return [(fk==='nz'?-p[0]:p[0])/s+uo,(p[1]-vo)/sv];return [p[0]/s,p[2]/s]}
// ---------- light baking: per-vertex ambient occlusion, sky visibility, moonlight and point lights with shadows ----------
const AMB_OUT=new THREE.Color('#252c40'),AMB_IN=new THREE.Color('#12141c');
const HEMI=(()=>{const d=[];for(let i=0;i<8;i++){const a=i/8*TAU,el=i%2?.35:.75;d.push([Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)])}return d})();
function lightAt(px,py,pz,nx,ny,nz,probe){
  const ox=px+nx*.04,oy=py+ny*.04,oz=pz+nz*.04;let r=0,gg=0,b=0;
  // ambient occlusion over a hemisphere around the normal
  let occ=0;if(!probe){for(const d of HEMI){let dx=d[0],dy=d[1],dz=d[2];if(dx*nx+dy*ny+dz*nz<0){dx=-dx;dy=-dy;dz=-dz}dx+=nx*.6;dy+=ny*.6;dz+=nz*.6;const l=Math.hypot(dx,dy,dz);if(rayCast(ox,oy,oz,dx/l,dy/l,dz/l,1.3,SEE_THRU))occ++}}
  const ao=1-.6*occ/HEMI.length;
  const E=MAP.env||{};const sky=E.sky&&!rayCast(ox,oy,oz,0,1,0,40,SEE_THRU);const A=sky?(MAP.ambOut||AMB_OUT):(MAP.ambIn||AMB_IN);const skyF=probe?1:(.55+.45*Math.max(ny,0));r+=A.r*ao*skyF;gg+=A.g*ao*skyF;b+=A.b*ao*skyF;
  const M=MAP.moon;if(M){const ml=probe?.6:(M.d.x*nx+M.d.y*ny+M.d.z*nz);if(ml>0&&!rayCast(ox,oy,oz,M.d.x,M.d.y,M.d.z,60,SEE_THRU)){r+=M.c.r*M.i*ml;gg+=M.c.g*M.i*ml;b+=M.c.b*M.i*ml}}
  for(const L of MAP.lights){const dx=L.x-ox,dy=L.y-oy,dz=L.z-oz;const d=Math.hypot(dx,dy,dz);if(d>=L.r)continue;const lam=probe?.7:(dx*nx+dy*ny+dz*nz)/d;if(lam<=0)continue;
    if(rayCast(ox,oy,oz,dx/d,dy/d,dz/d,d-.25,SEE_THRU))continue;const a=(1-d/L.r);const f=Math.pow(a,1.35)*L.i*1.55*(.25+.75*lam)*(probe?1:ao*.5+.5);r+=L.c.r*f;gg+=L.c.g*f;b+=L.c.b*f}
  return [Math.min(r,2.2),Math.min(gg,2.2),Math.min(b,2.2)]}
function bakeGroups(groups){const cache=new Map();let n=0;
  for(const k in groups){const G=groups[k];const M=MATS[k];G.col=new Array(G.pos.length);
    for(let i=0;i<G.pos.length;i+=3){if(M.emis>=1){G.col[i]=1;G.col[i+1]=1;G.col[i+2]=1;continue}
      const key=Math.round(G.pos[i]*50)+','+Math.round(G.pos[i+1]*50)+','+Math.round(G.pos[i+2]*50)+','+G.nrm[i]+G.nrm[i+1]+G.nrm[i+2];let c=cache.get(key);
      if(!c){c=lightAt(G.pos[i],G.pos[i+1],G.pos[i+2],G.nrm[i],G.nrm[i+1],G.nrm[i+2]);cache.set(key,c);n++}
      const T=G.tn;G.col[i]=c[0]*(T?T[i]:1);G.col[i+1]=c[1]*(T?T[i+1]:1);G.col[i+2]=c[2]*(T?T[i+2]:1)}}
  return n}
// light probes for characters: grid every 1.5 m, 5 heights
function bakeProbes(){const bb=MAP.bounds||[-30,-30,30,30],S=1.5,X0=bb[0],Z0=bb[1],NX=Math.ceil((bb[2]-bb[0])/S)+1,NZ=Math.ceil((bb[3]-bb[1])/S)+1,YS=MAP.probeY||[.9,2.2,3.6,4.9,6.4],D=new Float32Array(NX*NZ*YS.length*3);
  for(let yi=0;yi<YS.length;yi++)for(let zi=0;zi<NZ;zi++)for(let xi=0;xi<NX;xi++){const x=X0+xi*S,z=Z0+zi*S,y=YS[yi];let c;if(insideSolid(x,y,z))c=null;else c=lightAt(x,y,z,0,1,0,true);
    const i=((yi*NZ+zi)*NX+xi)*3;if(c){D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2]}else{D[i]=-1}}
  // fill probes buried in walls from their neighbours
  for(let pass=0;pass<3;pass++)for(let yi=0;yi<YS.length;yi++)for(let zi=0;zi<NZ;zi++)for(let xi=0;xi<NX;xi++){const i=((yi*NZ+zi)*NX+xi)*3;if(D[i]>=0)continue;let s=[0,0,0],k=0;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x2=xi+dx,z2=zi+dz;if(x2<0||z2<0||x2>=NX||z2>=NZ)continue;const j=((yi*NZ+z2)*NX+x2)*3;if(D[j]>=0){s[0]+=D[j];s[1]+=D[j+1];s[2]+=D[j+2];k++}}
    if(k){D[i]=s[0]/k;D[i+1]=s[1]/k;D[i+2]=s[2]/k}}
  const AI=MAP.ambIn||AMB_IN;for(let i=0;i<D.length;i+=3)if(D[i]<0){D[i]=AI.r;D[i+1]=AI.g;D[i+2]=AI.b}
  MAP.probe={S,X0,Z0,NX,NZ,YS,D}}
function sampleProbe(x,y,z,out){const P=MAP.probe;if(!P){out.setRGB(.4,.4,.45);return out}
  const fx=clamp((x-P.X0)/P.S,0,P.NX-1.001),fz=clamp((z-P.Z0)/P.S,0,P.NZ-1.001);const xi=Math.floor(fx),zi=Math.floor(fz),tx=fx-xi,tz=fz-zi;
  let yi=0;while(yi<P.YS.length-2&&y>P.YS[yi+1])yi++;const ty=clamp((y-P.YS[yi])/(P.YS[yi+1]-P.YS[yi]),0,1);
  const at=(a,b,c,k)=>P.D[((a*P.NZ+c)*P.NX+b)*3+k];const res=[0,0,0];
  for(let k=0;k<3;k++){const l0=lerp(lerp(at(yi,xi,zi,k),at(yi,xi+1,zi,k),tx),lerp(at(yi,xi,zi+1,k),at(yi,xi+1,zi+1,k),tx),tz);const l1=lerp(lerp(at(yi+1,xi,zi,k),at(yi+1,xi+1,zi,k),tx),lerp(at(yi+1,xi,zi+1,k),at(yi+1,xi+1,zi+1,k),tx),tz);res[k]=lerp(l0,l1,ty)}
  out.setRGB(res[0],res[1],res[2]);return out}
// static map buffers live on the GPU only once uploaded
function freeArr(){this.array=null}
function buildMapMeshes(scene){
  const groups=buildMapGeometry();const nb=bakeGroups(groups);
  for(const k in groups){const G=groups[k];if(!G.pos.length)continue;const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(G.nrm,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));
    geo.computeBoundingSphere();for(const a of ['position','normal','uv','color'])geo.attributes[a].onUpload(freeArr);
    const M=MATS[k];const mesh=new THREE.Mesh(geo,matWorld(TEX[M.t],{emis:M.emis||0}));mesh.matrixAutoUpdate=false;scene.add(mesh);MAP.meshes.push(mesh)}
  // round props (drums): merged per texture, vertex-lit by the same baker
  const dg={};for(const d of MAP.deco){const g=new THREE.CylinderGeometry(d.r,d.r,d.h,18,2,false);g.rotateY(d.rot||0);g.translate(d.x,d.y+d.h/2,d.z);
    // a slightly smaller lid sits inside the rim
    const lid=new THREE.CylinderGeometry(d.r*.86,d.r*.86,.012,18,1,false);lid.translate(d.x,d.y+d.h+.004,d.z);(dg[d.mat]=dg[d.mat]||[]).push(g.toNonIndexed(),lid.toNonIndexed())}
  for(const k in dg){const parts=dg[k];let n=0;for(const g of parts)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nrm=new Float32Array(n*3),uv=new Float32Array(n*2),col=new Float32Array(n*3);let o=0;
    for(const g of parts){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),nx=N.getX(i),ny=N.getY(i),nz=N.getZ(i);
        pos.set([x,y,z],(o+i)*3);nrm.set([nx,ny,nz],(o+i)*3);uv.set([U.getX(i)*2,U.getY(i)],(o+i)*2);const c=lightAt(x+nx*.02,y+ny*.02,z+nz*.02,nx,ny,nz);col.set(c,(o+i)*3)}o+=P.count;g.dispose()}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nrm,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const mesh=new THREE.Mesh(geo,matWorld(TEX[k]));mesh.matrixAutoUpdate=false;scene.add(mesh);MAP.meshes.push(mesh)}
  return nb}
// sky: dome + star field + moon, kept centred on the camera (built once; maps without a sky hide it)
function buildSky(scene){
  const SG=new THREE.Group();
  const skyU={map:{value:TEX.sky},uAmb:LU.uAmb,uFlashSky:{value:0}};MAP.skyU=skyU;
  const dome=new THREE.Mesh(new THREE.SphereGeometry(160,32,12,0,TAU,0,Math.PI*.55),new THREE.ShaderMaterial({uniforms:skyU,vertexShader:VS_WORLD,fragmentShader:FS_SKY,side:THREE.BackSide,depthWrite:false}));
  dome.renderOrder=-3;SG.add(dome);
  const N=700,sp=new Float32Array(N*3),sc=new Float32Array(N);for(let i=0;i<N;i++){let x,y,z;do{x=Math.random()*2-1;y=Math.random();z=Math.random()*2-1}while(x*x+y*y+z*z>1||y<.12);const l=Math.hypot(x,y,z);sp[i*3]=x/l*150;sp[i*3+1]=y/l*150;sp[i*3+2]=z/l*150;sc[i]=Math.pow(Math.random(),3)*.8+.15}
  const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('aB',new THREE.BufferAttribute(sc,1));
  const stars=new THREE.Points(sg,new THREE.ShaderMaterial({uniforms:{uTime:LU.uTime},vertexShader:'attribute float aB;varying float vB;uniform float uTime;void main(){vB=aB*(.75+.25*sin(uTime*2.3+position.x*7.))*smoothstep(10.,40.,position.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=aB>.7?2.:1.;}',
    fragmentShader:'varying float vB;void main(){gl_FragColor=vec4(vec3(.8,.84,1.)*vB,1.);}',depthWrite:false,blending:THREE.AdditiveBlending,transparent:true}));
  stars.renderOrder=-2;stars.frustumCulled=false;SG.add(stars);MAP.skyParts={dome,stars};
  const md=MOON_D;const moon=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:TEX.moon,transparent:true,depthWrite:false,fog:false,color:0xb8bccc}));
  moon.position.set(md.x*140,md.y*140,md.z*140);moon.lookAt(0,0,0);moon.renderOrder=-2;SG.add(moon);MAP.skyParts.moon=moon;
  const halo=new THREE.Mesh(new THREE.PlaneGeometry(46,46),new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    uniforms:{uC:{value:new THREE.Color(.42,.48,.62)}},fragmentShader:'uniform vec3 uC;varying vec2 vUv;void main(){float r=length(vUv-.5)*2.;float a=pow(max(0.,1.-r),2.6)*.35;gl_FragColor=vec4(uC*a,1.);}',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.position.copy(moon.position).multiplyScalar(1.02);halo.lookAt(0,0,0);halo.renderOrder=-2;SG.add(halo);MAP.skyParts.halo=halo;
  scene.add(SG);MAP.sky=SG;
}
// ---------- map registry ----------
// env: sky (dome + sky light), rain, storm (thunder and lightning), under (underground ambience), fog colour/density, ambIn (indoor ambient),
// boAmb (the share of the baked light left in a blackout: night maps keep more, they are dark already; .3 when not given)
const MAPDEFS={
  q7:{n:['격리구역 Q-7','Quarantine Zone Q-7'],d:['비 내리는 밤의 격리시설. 창고 중2층·사무동 2층·펌프장 옥상·감시탑과 넓은 마당.','A rainy night at the quarantine facility: warehouse mezzanine, two-storey office, pump-house roof, a watchtower and a wide yard.'],
    env:{sky:1,rain:1,storm:1,fog:'#0a0c12',fogD:.045,boAmb:.5},build:buildQ7},
};
const MAPLIST=()=>Object.keys(MAPDEFS).filter(k=>!MAPDEFS[k].practice);// (the shooting range is not a match map)
function buildMapData(id){const D=MAPDEFS[id];
  Object.assign(MAP,{id,boxes:[],lights:[],spawns:[],camps:[],zspawns:[],deco:[],fires:[],smoke:[],spray:[],dyn:[],moon:null,probe:null,probeY:D.probeY||null,env:D.env,cam:null,spawnYaw:null,
    ambIn:D.env.ambIn?new THREE.Color(D.env.ambIn):null,ambOut:D.env.ambOut?new THREE.Color(D.env.ambOut):null,bounds:D.bounds||[-30,-30,30,30],miniCut:D.mini||null});
  D.build()}
// ---------- loading and switching: a built map is kept (GPU meshes, collision grid, nav graph, probes) so switching back is instant ----------
const MAPCACHE={};
const MAPKEYS=['mini','miniCut','id','boxes','lights','spawns','camps','zspawns','deco','fires','smoke','spray','dyn','moon','meshes','probe','probeY','env','cam','spawnYaw','ambIn','ambOut','bounds'];
function* mapLoader(id){
  if(MAP.id){const C=MAPCACHE[MAP.id]={};for(const k of MAPKEYS)C[k]=MAP[k];C.cells=WORLD.cells;C.grid=[WORLD.gx0,WORLD.gz0,WORLD.gw,WORLD.gh];
    C.nav={nodes:NAV.nodes,col:NAV.col,g:NAV.g,f:NAV.f,came:NAV.came,mark:NAV.mark,heap:NAV.heap,hf:NAV.hf,X0:NAV.X0,Z0:NAV.Z0,NX:NAV.NX,NZ:NAV.NZ};C.rainHM=FX.rain?FX.rain.hm:null;
    for(const m of MAP.meshes)R.scene.remove(m)}
  const C=MAPCACHE[id];
  if(C){for(const k of MAPKEYS)MAP[k]=C[k];WORLD.boxes=MAP.boxes;WORLD.cells=C.cells;if(C.grid)[WORLD.gx0,WORLD.gz0,WORLD.gw,WORLD.gh]=C.grid;Object.assign(NAV,C.nav);if(FX.rain&&C.rainHM)FX.rain.hm=C.rainHM;for(const m of MAP.meshes)R.scene.add(m)}
  else{yield 'lMap';const D=MAPDEFS[id];if(D.tex)D.tex();buildMapData(id);WORLD.boxes=MAP.boxes;worldIndex();
    yield 'lLight';MAP.meshes=[];buildMapMeshes(R.scene);if(D.mesh)D.mesh(R.scene);bakeProbes();
    yield 'lNav';{const bb=MAP.bounds;NAV.X0=bb[0];NAV.Z0=bb[1];NAV.NX=Math.round(bb[2]-bb[0]);NAV.NZ=Math.round(bb[3]-bb[1])}buildNav();MAP.mini=null;navPrune(MAP.spawns.map(p=>[p[0],p[2]||0,p[1]]).concat(MAP.zspawns.map(p=>[p[0],p[2]||0,p[1]])),Math.max(...ZLIST.map(k=>{const Z=ZCLASS[k];return Z.jump*Z.jump/(2*GRAV)+Z.h*.3})));MAP.mini=miniBuild();if(FX.rain&&(MAP.env.rain||MAP.env.snow))FX.buildRainHM()}
  // bots holding paths through the old graph start over
  for(const a of G.actors)if(a.bot){a.bot.path=null;a.bot.goal=null;a.bot.wander=null;a.bot.spot=null}
  mapEnv()}
// finish a load that is in progress (another caller needs the map right now)
function mapFinish(){const g=MAP.gen;if(!g)return;MAP.gen=null;for(const _ of g){}MAP.loading=false}
// synchronous load (multiplayer start, boot)
function loadMap(id){if(!MAPDEFS[id])id='q7';mapFinish();if(MAP.id===id)return false;MAP.gen=mapLoader(id);mapFinish();return true}
// load behind the loading screen, one phase per frame
async function loadMapUI(id){if(!MAPDEFS[id])id='q7';MAP.want=id;mapFinish();if(MAP.id===id)return;
  const L=$('load'),nm=MAPDEFS[id].n[LI()];L.classList.add('mapload');L.classList.remove('off');$('loadFill').style.width='0%';$('loadT').textContent=nm;
  const g=MAP.gen=mapLoader(id);MAP.loading=true;let p=.05;
  await new Promise(res=>setTimeout(res,40));
  while(MAP.gen===g){const r=g.next();if(r.done){MAP.gen=null;break}p+=.3;$('loadT').textContent=nm+' — '+T(r.value);$('loadFill').style.width=(p*100)+'%';await new Promise(res=>setTimeout(res,30))}
  MAP.loading=false;L.classList.add('off');L.classList.remove('mapload');
  if(G.st==='menu'&&MAP.id===id&&Main.menuDemo)Main.menuDemo();if(UI.mapLoaded)UI.mapLoaded()}
// per-map look and sound: sky, fog, rain, ambience, dynamic lights
function mapEnv(){const E=MAP.env||{};if(MAP.sky)MAP.sky.visible=!!E.sky;
  const SP=MAP.skyParts;if(SP&&E.sky){SP.dome.material.uniforms.map.value=TEX[E.skyTex||'sky'];SP.stars.visible=!E.sun;
    const d=E.sun?MAP.moon.d:MOON_D;SP.moon.position.set(d.x*140,d.y*140,d.z*140);SP.moon.lookAt(0,0,0);SP.moon.material.map=TEX[E.sun?'sunDisc':'moon'];SP.moon.material.color.set(E.sun?'#fff0d8':'#b8bccc');SP.moon.scale.setScalar(E.sun?1.6:1);SP.moon.material.needsUpdate=true;
    SP.halo.position.copy(SP.moon.position).multiplyScalar(1.02);SP.halo.lookAt(0,0,0);SP.halo.material.uniforms.uC.value.set(E.halo||(E.sun?'#c87040':'#6b7a9e'));SP.halo.scale.setScalar(E.sun?2.4:1)}
  LU.uFogC.value.set(E.fog||'#0a0c12');LU.uFogD.value=E.fogD||.045;
  if(R.mBright)R.mBright.uniforms.uThr.value=E.bloomThr||.74;// bright daylight maps bloom only on the hottest highlights
  if(FX.rain){FX.rain.on=!!(E.rain||E.snow);FX.rain.snow=!!E.snow;FX.rain.L.material.uniforms.uK.value=E.snow?2.6:1}if(AU.setEnv)AU.setEnv(E);
  for(const l of DL.list)if(l.map||l.fire)l.dead=true;if(typeof Main!=='undefined'){Main.fireL=null;Main.lightning=0}
  for(const d of MAP.dyn)DL.add(d[0],d[1],d[2],d[3],d[4],d[5],0,{flick:d[6]||0,map:1});
  if(FX.dec)FX.clearDecals()}

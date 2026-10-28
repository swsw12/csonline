'use strict';
// ============ Maps: brush geometry, light baking, the map registry and map switching ============
// Every solid is an axis-aligned brush; geometry, collision, light baking and navigation are all derived from this list.
// A face whose material is not in MATS (e.g. 'none') is not drawn: hidden outer faces of underground shells use it.
const MATS={
  conc:{t:'conc',s:2},concf:{t:'concf',s:2},asph:{t:'asph',s:3},dirt:{t:'dirt',s:2.5},brick:{t:'brick',s:2},metal:{t:'metal',s:2},metal2:{t:'metal2',s:2},
  plate:{t:'plate',s:1.5},tile:{t:'tile',s:2},plaster:{t:'plaster',s:2},roof:{t:'roof',s:2},hazard:{t:'hazard',s:1},
  wood:{t:'wood',uv:'box'},woodP:{t:'woodP',s:1.2,k:'wood'},door:{t:'door',uv:'box'},win:{t:'win',uv:'box'},winLit:{t:'winLit',uv:'box',emis:.55},
  contR:{t:'contR',uv:'boxV',s:6,end:'contRe'},contB:{t:'contB',uv:'boxV',s:6,end:'contBe'},contG:{t:'contG',uv:'boxV',s:6,end:'contGe'},
  contRe:{t:'contRe',uv:'box',k:'metal'},contBe:{t:'contBe',uv:'box',k:'metal'},contGe:{t:'contGe',uv:'box',k:'metal'},// (v7.6: a container's door end, buildMapGeometry)
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
// (v7.6) a lamp may sit inside a box that glows from within (a lab tank): o.lp lets its light out
const LIGHT_THRU={skip:b=>b.o.pass||b.o.lp};
function B(x0,y0,z0,x1,y1,z1,mat,o){const b={x0:Math.min(x0,x1),y0:Math.min(y0,y1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z1:Math.max(z0,z1),mat,o:o||{}};
  if(b.o.nosolid)b.nosolid=true;MAP.boxes.push(b);return b}
function LIGHT(x,y,z,col,range,int,o){MAP.lights.push(Object.assign({x,y,z,c:new THREE.Color(col),r:range,i:int},o||{}))}
// wall along X (thin in Z) or along Z (thin in X) with rectangular openings [u0,u1,y0,y1]
// (v7.6) holes that overlap along the wall (a door under a window, two windows one above the other) get a real partition: in the plain
// cut each hole's column above and below it filled the other hole, so those windows were never open and their faces flickered
function holesOverlap(H){for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)if(H[i][0]<H[j][1]-1e-6&&H[j][0]<H[i][1]-1e-6)return true;return false}
function wallCut(u0,u1,y0,y1,holes,put){const us=new Set([u0,u1]);for(const h of holes)for(const v of [h[0],h[1]])if(v>u0&&v<u1)us.add(v);
  const U=[...us].sort((a,b)=>a-b);let run=null;const flush=()=>{if(run)for(const [a,b] of run.s)put(run.u0,run.u1,a,b);run=null};
  for(let i=0;i<U.length-1;i++){const a=U[i],b=U[i+1],m=(a+b)/2;const hs=holes.filter(h=>h[0]<m&&h[1]>m).map(h=>[Math.max(y0,h[2]),Math.min(y1,h[3])]).filter(h=>h[1]>h[0]).sort((p,q)=>p[0]-q[0]);
    const s=[];let y=y0;for(const [h0,h1] of hs){if(h0>y)s.push([y,h0]);y=Math.max(y,h1)}if(y<y1)s.push([y,y1]);
    const key=s.map(q=>q.join(',')).join(';');if(run&&run.k===key)run.u1=b;else{flush();run={u0:a,u1:b,s,k:key}}}
  flush()}
function wallX(x0,x1,z0,z1,y0,y1,mat,holes,o){holes=(holes||[]).slice().sort((a,b)=>a[0]-b[0]);if(holesOverlap(holes)){wallCut(x0,x1,y0,y1,holes,(a,b,c,d)=>B(a,c,z0,b,d,z1,mat,o));return}let u=x0;
  for(const [h0,h1,hy0,hy1] of holes){if(h0>u)B(u,y0,z0,h0,y1,z1,mat,o);if(hy0>y0)B(h0,y0,z0,h1,hy0,z1,mat,o);if(hy1<y1)B(h0,hy1,z0,h1,y1,z1,mat,o);u=h1}if(u<x1)B(u,y0,z0,x1,y1,z1,mat,o)}
function wallZ(x0,x1,z0,z1,y0,y1,mat,holes,o){holes=(holes||[]).slice().sort((a,b)=>a[0]-b[0]);if(holesOverlap(holes)){wallCut(z0,z1,y0,y1,holes,(a,b,c,d)=>B(x0,c,a,x1,d,b,mat,o));return}let u=z0;
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
// (gates do not count: they open later, so nothing behind one is hidden)
function insideSolid(x,y,z,self){_bq.length=0;boxesIn(x,z,x,z,_bq);for(const b of _bq){if(b===self||b.nosolid||b.o.gate)continue;if(x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1&&z>b.z0&&z<b.z1)return true}return false}
// pick: only the boxes it accepts (a gate's own mesh); by default every box except gates
// the material a face is drawn with (null: not drawn). A box reaching below -.99 has no bottom (it is ground); (v7.6) a ground slab
// shows its sides too — buried ones are dropped like any other, the rest face something lower beside it (a pit, a ditch, a basement)
// and were holes into the void before — in its own material, the map's gside or an f override
// (v7.9) a box reaching more than a metre under the ground has no bottom; a map deeper than that says where its own buried part
// begins (D.noBottomY: 회색 채석장's pit goes 8 m down, so the steps, the timbers and the adit's roof under -1 still have their undersides)
function faceMatOf(b,fk){if(fk==='ny'){const D=MAPDEFS[MAP.id],nb=D&&D.noBottomY!=null?D.noBottomY:-.99;if(b.y0<=nb)return null}const f=b.o.f&&b.o.f[fk];if(b.o.ground&&fk!=='py'){if(fk==='ny'&&!f)return null;return f||MAP.gside||b.mat}return f||b.mat}
const matOf=k=>MATS[k.endsWith('|d')?k.slice(0,-2):k];
function buildMapGeometry(pick){
  const groups={};const g=m=>groups[m]||(groups[m]={pos:[],nrm:[],uv:[],col:[],tn:[]});
  const FACES=[['px',[1,0,0]],['nx',[-1,0,0]],['py',[0,1,0]],['ny',[0,-1,0]],['pz',[0,0,1]],['nz',[0,0,-1]]];
  for(const b of MAP.boxes){if(pick?!pick(b):b.o.gate)continue;
    for(let fi=0;fi<6;fi++){const [fk,n]=FACES[fi];
      let mat=faceMatOf(b,fk);if(!mat)continue;let M=MATS[mat];if(!M)continue;
      // face rectangle: axis a (u) and b (v)
      let ax,bx,fixed,fv;if(n[0]){ax=2;bx=1;fixed=0;fv=n[0]>0?b.x1:b.x0}else if(n[1]){ax=0;bx=2;fixed=1;fv=n[1]>0?b.y1:b.y0}else{ax=0;bx=1;fixed=2;fv=n[2]>0?b.z1:b.z0}
      const lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.y1,b.z1];const ua=lo[ax],ub=hi[ax],va=lo[bx],vb=hi[bx];
      // (v7.6) a container's short end (M.end): its doors, not a slice of the long side
      if(M.end&&!(b.o.f&&b.o.f[fk])&&fk!=='py'&&fk!=='ny'){const len=fk[1]==='x'?b.x1-b.x0:b.z1-b.z0;if(ub-ua<=2.7&&len>=5){mat=M.end;M=MATS[mat]}}
      const CS=M.cs||(M.emis>=1?2:.5);const nu=Math.max(1,Math.round((ub-ua)/CS)),nv=Math.max(1,Math.round((vb-va)/CS));
      const G=g(b._dec&&(b._dec>>fi&1)?mat+'|d':mat);const TN=(fk==='py'?b.o.ttop:b.o.tint)||null;// optional per-box colour tint (multiplies the baked light), and a decal face (mapDecals) goes to its material's |d group
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
  // (v7.6) ru: a plain box picture repeated across a face wider than it is; rot: a top or bottom face's picture turned to run along z (mapFitSigns)
  if(M.uv==='box'){let u,v;if(fk==='px'||fk==='nx'){u=(p[2]-b.z0)/(b.z1-b.z0);v=(p[1]-b.y0)/(b.y1-b.y0);if(fk==='px')u=1-u}
    else if(fk==='py'||fk==='ny'){if(M.rot){u=(p[2]-b.z0)/(b.z1-b.z0);v=fk==='py'?(p[0]-b.x0)/(b.x1-b.x0):(b.x1-p[0])/(b.x1-b.x0)}else{u=(p[0]-b.x0)/(b.x1-b.x0);v=(p[2]-b.z0)/(b.z1-b.z0)}}else{u=(p[0]-b.x0)/(b.x1-b.x0);v=(p[1]-b.y0)/(b.y1-b.y0);if(fk==='nz')u=1-u}return [u*(M.ru||1),v]}
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
    if(rayCast(ox,oy,oz,dx/d,dy/d,dz/d,d-.25,LIGHT_THRU))continue;const a=(1-d/L.r);const f=Math.pow(a,1.35)*L.i*1.55*(.25+.75*lam)*(probe?1:ao*.5+.5);r+=L.c.r*f;gg+=L.c.g*f;b+=L.c.b*f}
  return [Math.min(r,2.2),Math.min(gg,2.2),Math.min(b,2.2)]}
function bakeGroups(groups){const cache=new Map();let n=0;
  for(const k in groups){const G=groups[k];const M=matOf(k);G.col=new Array(G.pos.length);
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
    const M=matOf(k);const mesh=new THREE.Mesh(geo,matWorld(TEX[M.t],{emis:M.emis||0,dec:k.endsWith('|d')}));mesh.matrixAutoUpdate=false;scene.add(mesh);MAP.meshes.push(mesh)}
  // round props (drums): merged per texture, vertex-lit by the same baker
  const dg={};for(const d of MAP.deco){const g=new THREE.CylinderGeometry(d.r,d.r,d.h,18,2,false);g.rotateY(d.rot||0);g.translate(d.x,d.y+d.h/2,d.z);
    // a slightly smaller lid sits inside the rim
    const lid=new THREE.CylinderGeometry(d.r*.86,d.r*.86,.012,18,1,false);lid.translate(d.x,d.y+d.h+.004,d.z);(dg[d.mat]=dg[d.mat]||[]).push(g.toNonIndexed(),lid.toNonIndexed())}
  for(const k in dg){const parts=dg[k];let n=0;for(const g of parts)n+=g.attributes.position.count;const pos=new Float32Array(n*3),nrm=new Float32Array(n*3),uv=new Float32Array(n*2),col=new Float32Array(n*3);let o=0;
    // (the cylinders are not indexed: a corner is shared by up to six triangles, so its light is worked out once)
    const lc=new Map();for(const g of parts){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),nx=N.getX(i),ny=N.getY(i),nz=N.getZ(i);
        pos.set([x,y,z],(o+i)*3);nrm.set([nx,ny,nz],(o+i)*3);uv.set([U.getX(i)*2,U.getY(i)],(o+i)*2);const key=Math.round(x*200)+','+Math.round(y*200)+','+Math.round(z*200)+','+Math.round(nx*100)+','+Math.round(ny*100)+','+Math.round(nz*100);
        let c=lc.get(key);if(!c){c=lightAt(x+nx*.02,y+ny*.02,z+nz*.02,nx,ny,nz);lc.set(key,c)}col.set(c,(o+i)*3)}o+=P.count;g.dispose()}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nrm,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
    const mesh=new THREE.Mesh(geo,matWorld(TEX[k],{emis:(MATS[k]&&MATS[k].emis)||0}));mesh.matrixAutoUpdate=false;scene.add(mesh);MAP.meshes.push(mesh)}
  gateMeshes(scene);return nb}
// ---------- gates: boxes that open (doors, a wall that is burst through) — their own meshes, solid until opened ----------
// o.gate = the gate's key, o.gs = how far that box slides as it opens [dx,dy,dz] (boxes sliding the same way share a mesh)
function gateMeshes(scene){MAP.gates={};for(const b of MAP.boxes){const k=b.o.gate;if(!k)continue;const G0=MAP.gates[k]||(MAP.gates[k]={k,boxes:[],parts:[],open:false,anim:1});G0.boxes.push(b)}
  for(const k in MAP.gates){const G0=MAP.gates[k],by={};for(const b of G0.boxes){const s=String(b.o.gs||[0,0,0]);(by[s]=by[s]||[]).push(b)}
    for(const s in by){const set=new Set(by[s]),groups=buildMapGeometry(b=>set.has(b));bakeGroups(groups);const part={gs:by[s][0].o.gs||[0,0,0],meshes:[]};
      for(const m in groups){const G=groups[m];if(!G.pos.length)continue;const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(G.nrm,3));
        geo.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(G.col,3));geo.computeBoundingSphere();
        const M=matOf(m);const mesh=new THREE.Mesh(geo,matWorld(TEX[M.t],{emis:M.emis||0,dec:m.endsWith('|d')}));mesh.matrixAutoUpdate=false;scene.add(mesh);MAP.meshes.push(mesh);part.meshes.push(mesh)}
      G0.parts.push(part)}}}
function gateFrame(G0){const e=G0.open?smooth(G0.anim):1-smooth(G0.anim);for(const p of G0.parts)for(const m of p.meshes){m.position.set(p.gs[0]*e,p.gs[1]*e,p.gs[2]*e);m.updateMatrix();m.visible=!(G0.open&&G0.anim>=1)}}
// open (or shut) a gate: it stops blocking at once and slides away over dur seconds (instant: no slide)
function gateSet(k,open,instant,dur){const G0=MAP.gates&&MAP.gates[k];if(!G0)return false;if(G0.open===!!open&&(instant||G0.anim<1))return false;G0.open=!!open;for(const b of G0.boxes)b.nosolid=G0.open;G0.dur=dur||1;G0.anim=instant?1:0;gateFrame(G0);return true}
function gatesUpdate(dt){const GS=MAP.gates;if(!GS)return;for(const k in GS){const G0=GS[k];if(G0.anim>=1)continue;G0.anim=Math.min(1,G0.anim+dt/(G0.dur||1));gateFrame(G0)}}
// sky: dome + star field + moon, kept centred on the camera (built once; maps without a sky hide it)
function buildSky(scene){
  const SG=new THREE.Group();
  const skyU={map:{value:TEX.sky},uAmb:LU.uAmb,uFlashSky:{value:0},uFogC:LU.uFogC,uSkyFog:{value:0}};MAP.skyU=skyU;
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
// env: sky (dome + sky light), rain, snow, ash (snow's drift, warm grey), storm (thunder and lightning), under (underground ambience), fog colour/density, ambIn (indoor ambient),
// boAmb (the share of the baked light left in a blackout: night maps keep more, they are dark already; .3 when not given)
const MAPDEFS={
  q7:{n:['격리구역 Q-7','Quarantine Zone Q-7'],d:['비 내리는 밤의 격리시설. 창고 중2층·사무동 2층·펌프장 옥상·감시탑과 넓은 마당.','A rainy night at the quarantine facility: warehouse mezzanine, two-storey office, pump-house roof, a watchtower and a wide yard.'],
    env:{sky:1,rain:1,storm:1,fog:'#0a0c12',fogD:.045,boAmb:.5},build:buildQ7},
};
const MAPLIST=()=>Object.keys(MAPDEFS).filter(k=>!MAPDEFS[k].practice&&!MAPDEFS[k].ep);// (the shooting range and the episode maps are not match maps)
// (v6.49) the maps a mode can be played on: a 대인전 전용맵 (D.pvp) only in the PvP modes
function mapOk(mode,id){const D=MAPDEFS[id];if(!D||D.practice||D.ep)return false;if(mode==='bomb')return !!D.bomb;return !D.pvp||PVP.isMode(mode)}// (v6.50: 폭파미션 only where there are bomb sites)
function mapsFor(mode){return MAPLIST().filter(id=>mapOk(mode,id))}
function buildMapData(id){const D=MAPDEFS[id];
  Object.assign(MAP,{id,gates:{},ez:null,boxes:[],lights:[],spawns:[],camps:[],zspawns:[],deco:[],fires:[],smoke:[],spray:[],dyn:[],moon:null,probe:null,probeY:D.probeY||null,env:D.env,cam:null,spawnYaw:null,
    ambIn:D.env.ambIn?new THREE.Color(D.env.ambIn):null,ambOut:D.env.ambOut?new THREE.Color(D.env.ambOut):null,bounds:D.bounds||[-30,-30,30,30],miniCut:D.mini||null,miniName:D.miniName||null,gside:D.gside||null});
  D.build();if(D.mirror)mapMirrorX();mapFixWood();mapFitSigns();mapDecals();mapFreeSpawns();mapFreeLights()}
// a lamp placed inside a solid (a lantern on a rock face, a light in a prefab hut, a floodlight on its mast's axis) lit nothing — the
// bake's shadow rays stop .25 short of a light and so ended inside the box. It moves to the nearest free point along the six axis
// directions (in .25 m steps, up to 6 m: two rocks or two stacked containers are passed through), .3 m clear of any solid
function mapFreeLights(){const S=MAP.boxes.filter(b=>!b.nosolid&&!b.o.pass&&!b.o.lp&&!b.o.gate),inside=(x,y,z,m)=>S.some(b=>x>b.x0-m&&x<b.x1+m&&y>b.y0-m&&y<b.y1+m&&z>b.z0-m&&z<b.z1+m);
  for(const L of MAP.lights){if(!S.some(b=>L.x>b.x0+.2&&L.x<b.x1-.2&&L.y>b.y0+.2&&L.y<b.y1-.2&&L.z>b.z0+.2&&L.z<b.z1-.2))continue;let best=null;
    for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])for(let d=.25;d<=6;d+=.25){const x=L.x+dx*d,y=L.y+dy*d,z=L.z+dz*d;if(inside(x,y,z,.3))continue;if(!best||d<best[0])best=[d,x,y,z];break}
    if(best){L.x=best[1];L.y=best[2];L.z=best[3]}}}
// ---------- v7.6: finishing passes over every map ----------
// 'wood' is a crate's face (frame, X brace, nails, stencil): only crate-shaped boxes keep it; tables, benches, counters, beams and shelves
// made of it get plain planks (woodP, tiled in world space) instead of a stretched crate
function mapFixWood(){for(const b of MAP.boxes){const f=b.o.f,fw=f&&Object.keys(f).filter(k=>f[k]==='wood');if(b.mat!=='wood'&&!(fw&&fw.length))continue;
  const s=[b.x1-b.x0,b.y1-b.y0,b.z1-b.z0].sort((p,q)=>p-q);if(s[0]>=.35&&s[2]/s[0]<=1.6)continue;if(b.mat==='wood')b.mat='woodP';
  if(fw&&fw.length){const g=Object.assign({},f);for(const k of fw)g[k]='woodP';b.o=Object.assign({},b.o,{f:g})}}}
// a box-mapped picture on a face of another shape is stretched. A face the picture was not drawn for — a board's thin edge, a small
// side it would be squeezed onto, the top of a box standing taller than it is wide (a cabinet, a terminal, a shelf) — is plain, unless
// the map set that face itself (plainOf). A top or bottom face turns the picture to run along its long side when that fits better.
// A sign that can be painted again (canvas._rp: texSign and the like) is painted at the face's proportions — the same lettering, more
// board; another lettered picture is widened by carrying its background out to the new edges; a plain picture (a door, window,
// shutter, panel) repeats across a wide face. One variant per size, shared.
const WIDEN_NO=new Set();
// the plain stand-in for a box picture: M.edge (M.top on a top or bottom face), else by kind for lettering (planks, concrete, steel) and
// for a plain steel or wooden picture (steel, planks); none (the picture stays) for glass, cloth and stone pictures without M.edge
function plainOf(M,I,top){if(top&&M.top)return M.top;if(M.edge)return M.edge;const k=M.k;if(I._txt)return k==='wood'?'woodP':k==='stone'?'conc':'metal2';return k==='metal'?'metal2':k==='wood'?'woodP':null}
function mapFitSigns(){const FK=['px','nx','pz','nz','py','ny'],L2=Math.log(2);
  for(const b of MAP.boxes){const sx=b.x1-b.x0,sy=b.y1-b.y0,sz=b.z1-b.z0,A=[sy*sz,sx*sz,sx*sy],mx=Math.max(A[0],A[1],A[2]),bi=A.indexOf(mx),bs=bi===0?Math.min(sy,sz):bi===1?Math.min(sx,sz):Math.min(sx,sy);
    for(const fk of FK){const own=b.o.f&&b.o.f[fk],mat=own||b.mat;const M=MATS[mat];if(!M||M.uv!=='box'||(M.emis||0)>=1||M.fit===false)continue;const T=TEX[M.t];const I=T&&T.image;if(!I||!I.width)continue;
      const top=fk[1]==='y',du=fk[1]==='x'?sz:sx,dv=top?sz:sy,ta=I.width/I.height,a=du*dv,e=Math.min(du,dv);let r=(du/dv)/ta;
      if(!own){const pl=plainOf(M,I,top);
        if(pl&&MATS[pl]&&((I._txt&&e<.15&&a<.3*mx)||(e<=.5*bs+.01&&a<.51*mx)||(a<.3*mx&&Math.abs(Math.log(r))>L2)||(top&&a<.8*Math.max(A[0],A[2])))){b.o=Object.assign({},b.o,{f:Object.assign({},b.o.f||{},{[fk]:pl})});continue}}
      if(du<.25||dv<.25)continue;
      // (a face wider than its picture can be widened or repeated; a narrower one stays squeezed unless it can be painted again)
      const bad=q=>I._rp?(q>=1?0:-Math.log(q)*.1):q>=1.3?.05:Math.abs(Math.log(q));let rot=0;if(top){const r2=(dv/du)/ta;if(bad(r2)<bad(r)-.04){rot=1;r=r2}}
      let vk=null,VM=null;
      if(r<1.3&&r>1/1.3){if(!rot)continue;VM=M;vk=M.t+'@o'}
      else{const WW=Math.min(2048,Math.round(I.width*r/2)*2),wk=M.t+'@w'+WW;
        // a widened copy is made once per size; a picture whose text runs to its edges (WIDEN_NO) repeats instead
        if(!I._rp&&I._txt&&r>=1.3&&!TEX[wk]&&!WIDEN_NO.has(wk)){const cv=texWiden(I,WW);if(cv)TEX[wk]=mkTex(cv,false);else WIDEN_NO.add(wk)}
        if(I._rp){let W=I.width,H=I.height;if(r>1)W=WW;else H=Math.min(1024,Math.round(H/r/2)*2);vk=M.t+'@'+W+'x'+H;
          if(!TEX[vk])TEX[vk]=mkTex(I._rp(W,H),false);VM=Object.assign({},M,{t:vk})}
        else if(I._txt&&r>=1.3&&TEX[wk]){vk=wk;VM=Object.assign({},M,{t:vk})}
        else if(r>=1.5){const k=Math.round(r);let t=M.t;if(T.wrapS!==THREE.RepeatWrapping){t=M.t+'@r';if(!TEX[t]){const C=TEX[t]=T.clone();C.wrapS=THREE.RepeatWrapping;C.needsUpdate=true}}VM=Object.assign({},M,{t,ru:k});vk=M.t+'@r'+k}
        else if(rot){VM=M;vk=M.t+'@o'}else continue}
      if(rot)VM=Object.assign({},VM,{rot:1});
      const nm=mat+'@'+vk.split('@')[1]+(rot?'R':'');if(!MATS[nm])MATS[nm]=VM;
      b.o=Object.assign({},b.o,{f:Object.assign({},b.o.f||{},{[fk]:nm})})}}}
// widen a lettered picture to W px: the middle keeps the picture; the margins repeat the column of background just inside each side
// border (a board's lettering keeps clear of its edges); the borders move out to the new edges
function texWiden(src,W){const H=src.height,w=src.width,B=Math.max(2,Math.min(8,Math.floor(w/24))),off=Math.round((W-w)/2),T=src._tx||[];
  const clear=X=>!T.some(t=>X>=t[0]-2&&X<=t[1]+2);let L=B,R=w-B-1;while(L<w/4&&!clear(L))L++;while(R>w*3/4&&!clear(R))R--;if(!clear(L)||!clear(R))return null;
  // the carried column must be the board's ground, not a frame (a door's, a panel's): row by row it matches the row's middle (the median
  // pixel there, so lettering does not count), on most rows
  const D=src.getContext('2d').getImageData(0,0,w,H).data,px=(x,y)=>{const i=(y*w+x)*4;return [D[i],D[i+1],D[i+2]]},x0=Math.round(w*.25),x1=Math.round(w*.75),lit=(x,y)=>T.some(t=>x>=t[0]&&x<=t[1]&&(t[2]==null||(y>=t[2]&&y<=t[3])));let ok=0,n=0;
  for(let y=0;y<H;y++){const row=[];for(let x=x0;x<x1;x+=2)if(!lit(x,y))row.push(px(x,y));if(row.length<6)continue;n++;row.sort((a,b)=>(a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]));const m=row[row.length>>1];
    const near=q=>Math.abs(q[0]-m[0])+Math.abs(q[1]-m[1])+Math.abs(q[2]-m[2])<=60;if(near(px(L,y))&&near(px(R,y)))ok++}
  if(!n||ok<n*.7)return null;
  const [c,x]=mkCanvas(W,H);x.drawImage(src,L,0,R-L+1,H,off+L,0,R-L+1,H);x.drawImage(src,L,0,1,H,B,0,off+L-B,H);x.drawImage(src,R,0,1,H,off+R+1,0,W-B-(off+R+1),H);
  x.drawImage(src,0,0,B,H,0,0,B,H);x.drawImage(src,w-B,0,B,H,W-B,0,B,H);c._txt=1;c._tx=T.map(t=>[t[0]+off,t[1]+off,t[2],t[3]]);return c}
// two faces in one plane, facing the same way, over the same spot flicker (z-fighting): the thinner box's face (a sign or poster on a
// wall, a gate in its arch) — or the one standing up to a centimetre proud (road paint) — is drawn as a decal, pulled forward in depth
function mapDecals(){const K=['px','nx','py','ny','pz','nz'],P=new Map();
  for(const b of MAP.boxes){b._dec=0;if(b.o.gate)continue;const lo=[b.x0,b.y0,b.z0],hi=[b.x1,b.y1,b.z1];
    for(let f=0;f<6;f++){const m=faceMatOf(b,K[f]);if(!m||!MATS[m])continue;const ax=f>>1,s=f&1?-1:1,fv=s>0?hi[ax]:lo[ax],ua=ax?0:2,va=ax===1?2:1;
      const F={b,f,s,fv,u0:lo[ua],u1:hi[ua],v0:lo[va],v1:hi[va],t:hi[ax]-lo[ax],A:(hi[ua]-lo[ua])*(hi[va]-lo[va])};const k=f*1e6+Math.floor(fv*50);let a=P.get(k);if(!a)P.set(k,a=[]);a.push(F)}}
  for(const [k,L] of P){const N=P.get(k+1),C=N?L.concat(N):L;if(C.length<2)continue;C.sort((p,q)=>p.u0-q.u0);
    for(let i=0;i<C.length;i++){const A=C[i];for(let j=i+1;j<C.length;j++){const Q=C[j];if(Q.u0>=A.u1)break;if(A.b===Q.b)continue;const d=(Q.fv-A.fv)*A.s;if(Math.abs(d)>.012)continue;
        if(Math.min(A.u1,Q.u1)-Math.max(A.u0,Q.u0)<=.001||Math.min(A.v1,Q.v1)-Math.max(A.v0,Q.v0)<=.001)continue;
        const w=Math.abs(d)>.0005?(d>0?Q:A):A.t<Q.t-1e-4?A:Q.t<A.t-1e-4?Q:A.A<=Q.A?A:Q;w.b._dec|=1<<w.f}}}}
// ---------- v7.3: map edits ----------
// a map built mirrored east-west (D.mirror): every box, light, prop, spawn and camp, the bounds and the title camera flip x -> -x after
// D.build(). The sun / moon direction is left alone (it matches the sky texture), so the light falls on the mirrored town from the old side.
function mapMirrorX(){const SW={px:'nx',nx:'px'};
  for(const b of MAP.boxes){const x0=-b.x1,x1=-b.x0;b.x0=x0;b.x1=x1;const f=b.o.f;
    if(f&&(f.px!==undefined||f.nx!==undefined)){const g={};for(const k in f)g[SW[k]||k]=f[k];b.o=Object.assign({},b.o,{f:g})}}
  for(const L of MAP.lights)L.x=-L.x;
  for(const d of MAP.deco){d.x=-d.x;if(d.rot!=null)d.rot=-d.rot}
  for(const k of ['fires','smoke','spray','dyn'])for(const p of MAP[k])p[0]=-p[0];
  for(const p of MAP.spawns){p[0]=-p[0];if(p[3]!=null)p[3]=-p[3]}
  for(const p of MAP.zspawns)p[0]=-p[0];
  for(const c of MAP.camps){for(const p of c.p)p[0]=-p[0];if(c.look)c.look[0]=-c.look[0]}
  if(MAP.spawnYaw!=null)MAP.spawnYaw=-MAP.spawnYaw;
  const bb=MAP.bounds;MAP.bounds=[-bb[2],bb[1],-bb[0],bb[3]];
  if(MAP.cam){const c0=MAP.cam,P=new THREE.Vector3(),T=new THREE.Vector3(),fake={position:{set:(x,y,z)=>P.set(x,y,z)},lookAt:(x,y,z)=>T.set(x,y,z)};
    MAP.cam=(t,cam)=>{c0(t,fake);cam.position.set(-P.x,P.y,P.z);cam.lookAt(-T.x,T.y,T.z)}}}
// cut a region out of the boxes already placed: each box it overlaps is split into the pieces outside it. o.fl / o.wall / o.ceil
// re-surface the faces the cut opens (the floor left under it, the walls round it, the ceiling over it); o.keep(b) spares a box.
function boxCut(x0,y0,z0,x1,y1,z1,o){o=o||{};const out=[];
  const face=(b,k,m)=>{if(!m)return b;b.o=Object.assign({},b.o,{f:Object.assign({},b.o.f||{},{[k]:m})},k==='py'?{ttop:null}:{});return b};
  for(const b of MAP.boxes){if(b.x1<=x0||b.x0>=x1||b.y1<=y0||b.y0>=y1||b.z1<=z0||b.z0>=z1||(o.keep&&o.keep(b))){out.push(b);continue}
    const piece=(a0,a1,c0,c1,e0,e1,k,m)=>{if(a1-a0>1e-4&&c1-c0>1e-4&&e1-e0>1e-4)out.push(face(Object.assign({},b,{x0:a0,x1:a1,y0:c0,y1:c1,z0:e0,z1:e1}),k,m))};
    const cy0=Math.max(b.y0,y0),cy1=Math.min(b.y1,y1),cx0=Math.max(b.x0,x0),cx1=Math.min(b.x1,x1);
    piece(b.x0,b.x1,b.y0,Math.min(b.y1,y0),b.z0,b.z1,'py',o.fl);piece(b.x0,b.x1,Math.max(b.y0,y1),b.y1,b.z0,b.z1,'ny',o.ceil);
    piece(b.x0,Math.min(b.x1,x0),cy0,cy1,b.z0,b.z1,'px',o.wall);piece(Math.max(b.x0,x1),b.x1,cy0,cy1,b.z0,b.z1,'nx',o.wall);
    piece(cx0,cx1,cy0,cy1,b.z0,Math.min(b.z1,z0),'pz',o.wall);piece(cx0,cx1,cy0,cy1,Math.max(b.z0,z1),b.z1,'nz',o.wall)}
  MAP.boxes.length=0;for(const b of out)MAP.boxes.push(b)}
// v7.3: after the nav graph is built on a mirrored map, a camp point with no walkable node under it (the mirror moves box edges across
// the 1 m sample points) snaps to the nearest node within 2.5 m on its floor, or is dropped; a camp left with no point is dropped
function campsToNav(){const ok=[];for(const c of MAP.camps){const P=[];for(const p of c.p){const n=navNode(p[0],p[1],p[2]);if(!n||Math.abs(n.y-p[1])>1)continue;const d=Math.hypot(n.x-p[0],n.z-p[2]);
      if(d<=1.2)P.push(p);else if(d<=2.5)P.push([n.x,n.y,n.z])}if(P.length){c.p=P;ok.push(c)}}MAP.camps.length=0;for(const c of ok)MAP.camps.push(c)}
// spawn points that the edits buried: each moves to the nearest free spot on the same floor (rings of .5 m, up to 4 m out)
function mapFreeSpawns(){const solidAt=(x,y,z)=>MAP.boxes.some(b=>!b.nosolid&&!b.o.pass&&x>b.x0-.35&&x<b.x1+.35&&z>b.z0-.35&&z<b.z1+.35&&y+.1<b.y1&&y+1.7>b.y0);
  const fix=(p,y)=>{if(!solidAt(p[0],y,p[1]))return;for(let r=.5;r<=4;r+=.5)for(let a=0;a<16;a++){const x=p[0]+Math.cos(a/16*TAU)*r,z=p[1]+Math.sin(a/16*TAU)*r;if(!solidAt(x,y,z)){p[0]=x;p[1]=z;return}}};
  for(const p of MAP.spawns)fix(p,p[2]||0);for(const p of MAP.zspawns)fix(p,p[2]||0);
  for(const c of MAP.camps)for(const p of c.p){const q=[p[0],p[2]];fix(q,p[1]);p[0]=q[0];p[2]=q[1]}}
// ---------- loading and switching: a built map is kept (GPU meshes, collision grid, nav graph, probes) so switching back is instant ----------
const MAPCACHE={};
const MAPKEYS=['gates','ez','mini','miniCut','id','boxes','lights','spawns','camps','zspawns','deco','fires','smoke','spray','dyn','moon','meshes','probe','probeY','env','cam','spawnYaw','ambIn','ambOut','bounds','miniName'];
// (v7.8) but a built map holds 15–75 MB of geometry on the GPU, and its textures: past mapKeep() kept maps (the one in play not
// counted — 1 on a phone, 3 on a computer) the one left longest ago goes: its meshes, their materials and the map textures no kept
// map uses (MAPTEXK: the TEX keys that came while a map was built; those made in a build and kept nowhere else) are freed, its data
// dropped; going back to it builds it again (the bakers keep their canvases: the textures go up to the GPU again)
const MAPTEXK=new Set();
function mapTexNew(k0){for(const k in TEX)if(!k0.has(k))MAPTEXK.add(k)}
function mapKeep(){return (typeof TOUCH!=='undefined'&&TOUCH.on)||CFG.mob===2?1:3}
function mapMats(o,f){const ms=Array.isArray(o.material)?o.material.slice():o.material?[o.material]:[];if(o.userData&&o.userData.dm)ms.push(o.userData.dm);for(const m of ms)f(m)}
function mapTexs(m,f){for(const k in m)if(m[k]&&m[k].isTexture)f(m[k]);if(m.uniforms)for(const k in m.uniforms){const v=m.uniforms[k]&&m.uniforms[k].value;if(v&&v.isTexture)f(v)}}
function mapDrop(id){const C=MAPCACHE[id];if(!C||id===MAP.id)return false;delete MAPCACHE[id];
  // what the map in play and the other kept maps use stays (and the gun models, shared with the weapons)
  const kM=new Set(),kT=new Set(),kG=new Set(Object.values(GUN_CACHE));
  for(const L of [MAP.meshes||[],...Object.values(MAPCACHE).map(c=>c.meshes||[])])for(const m of L)m.traverse(o=>{if(o.geometry)kG.add(o.geometry);mapMats(o,mt=>{kM.add(mt);mapTexs(mt,t=>kT.add(t))})});
  // (and the gun atlas: chapter 10's props on the table wear it, as does every gun in the world and in hand — gunart.js)
  const base=new Set();for(const k in TEX)if(!MAPTEXK.has(k))base.add(TEX[k]);if(typeof GA!=='undefined'){if(GA.tex)base.add(GA.tex);if(GA.texVM)base.add(GA.texVM)}
  for(const m of C.meshes||[]){if(m.parent)m.parent.remove(m);m.traverse(o=>{if(o.geometry&&!kG.has(o.geometry))o.geometry.dispose();
    mapMats(o,mt=>{if(kM.has(mt))return;kM.add(mt);mapTexs(mt,t=>{if(!kT.has(t)&&!base.has(t)){kT.add(t);t.dispose()}});mt.dispose()})})}
  return true}
function mapEvict(){const ids=Object.keys(MAPCACHE).filter(k=>k!==MAP.id).sort((a,b)=>(MAPCACHE[b].used||0)-(MAPCACHE[a].used||0));for(const id of ids.slice(mapKeep()))mapDrop(id)}
function* mapLoader(id){
  if(MAP.id){const C=MAPCACHE[MAP.id]={used:performance.now()};for(const k of MAPKEYS)C[k]=MAP[k];C.cells=WORLD.cells;C.grid=[WORLD.gx0,WORLD.gz0,WORLD.gw,WORLD.gh];
    C.nav={nodes:NAV.nodes,col:NAV.col,g:NAV.g,f:NAV.f,came:NAV.came,mark:NAV.mark,heap:NAV.heap,hf:NAV.hf,X0:NAV.X0,Z0:NAV.Z0,NX:NAV.NX,NZ:NAV.NZ};C.rainHM=FX.rain?FX.rain.hm:null;
    for(const m of MAP.meshes)R.scene.remove(m)}
  const C=MAPCACHE[id];
  if(C){for(const k of MAPKEYS)MAP[k]=C[k];WORLD.boxes=MAP.boxes;WORLD.cells=C.cells;if(C.grid)[WORLD.gx0,WORLD.gz0,WORLD.gw,WORLD.gh]=C.grid;Object.assign(NAV,C.nav);if(FX.rain&&C.rainHM)FX.rain.hm=C.rainHM;for(const m of MAP.meshes)R.scene.add(m)}
  else{yield 'lMap';const D=MAPDEFS[id];let tk=new Set(Object.keys(TEX));if(D.tex)D.tex();buildMapData(id);WORLD.boxes=MAP.boxes;worldIndex();if(D.post)D.post();// (v7.6: D.post runs with the collision grid in place)
    mapTexNew(tk);yield 'lLight';tk=new Set(Object.keys(TEX));MAP.meshes=[];buildMapMeshes(R.scene);if(D.mesh)D.mesh(R.scene);bakeProbes();mapTexNew(tk);
    yield 'lNav';{const bb=MAP.bounds;NAV.X0=bb[0];NAV.Z0=bb[1];NAV.NX=Math.round(bb[2]-bb[0]);NAV.NZ=Math.round(bb[3]-bb[1])}
    // the graph is built with every gate open (they open as the map is played; a shut one simply blocks the way for now)
    const GT=Object.values(MAP.gates||{});for(const G0 of GT)for(const b of G0.boxes)b.nosolid=true;
    buildNav();MAP.mini=null;navPrune(MAP.spawns.map(p=>[p[0],p[2]||0,p[1]]).concat(MAP.zspawns.map(p=>[p[0],p[2]||0,p[1]])),Math.max(...ZLIST.map(k=>{const Z=ZCLASS[k];return Z.jump*Z.jump/(2*GRAV)+Z.h*.3})));if(D.mirror)campsToNav();
    for(const G0 of GT)for(const b of G0.boxes)b.nosolid=G0.open;MAP.mini=miniBuild();if(FX.rain&&(MAP.env.rain||MAP.env.snow||MAP.env.ash))FX.buildRainHM()}
  // bots holding paths through the old graph start over
  for(const a of G.actors)if(a.bot){a.bot.path=null;a.bot.goal=null;a.bot.wander=null;a.bot.spot=null}
  mapEnv();mapEvict()}
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
  const SP=MAP.skyParts;if(SP&&E.sky){SP.dome.material.uniforms.map.value=TEX[E.skyTex||'sky'];SP.stars.visible=!E.sun&&!E.noStars;SP.moon.visible=SP.halo.visible=true;SP.dome.material.uniforms.uSkyFog.value=E.skyFog||0;
    const d=E.sun?MAP.moon.d:MOON_D;SP.moon.position.set(d.x*140,d.y*140,d.z*140);SP.moon.lookAt(0,0,0);SP.moon.material.map=TEX[E.sun?'sunDisc':'moon'];SP.moon.material.color.set(E.sun?'#fff0d8':'#b8bccc');SP.moon.scale.setScalar(E.sun?1.6:1);SP.moon.material.needsUpdate=true;
    SP.halo.position.copy(SP.moon.position).multiplyScalar(1.02);SP.halo.lookAt(0,0,0);SP.halo.material.uniforms.uC.value.set(E.halo||(E.sun?'#c87040':'#6b7a9e'));SP.halo.scale.setScalar(E.sun?2.4:1)}
  LU.uFogC.value.set(E.fog||'#0a0c12');LU.uFogD.value=E.fogD||.045;
  if(R.mBright)R.mBright.uniforms.uThr.value=E.bloomThr||.74;// bright daylight maps bloom only on the hottest highlights
  if(FX.rain){FX.rain.on=!!(E.rain||E.snow||E.ash);FX.rain.snow=!!(E.snow||E.ash);const RU=FX.rain.L.material.uniforms;RU.uK.value=E.snow?2.6:E.ash?1.5:1;if(RU.uTn)RU.uTn.value.setRGB(E.ash?1.35:1,E.ash?.92:1,E.ash?.62:1)}if(AU.setEnv)AU.setEnv(E);
  for(const l of DL.list)if(l.map||l.fire)l.dead=true;if(typeof Main!=='undefined'){Main.fireL=null;Main.lightning=0}
  for(const d of MAP.dyn)DL.add(d[0],d[1],d[2],d[3],d[4],d[5],0,{flick:d[6]||0,map:1});
  if(FX.dec)FX.clearDecals()}

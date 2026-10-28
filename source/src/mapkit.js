'use strict';
// ============ (v7.9) pieces the outdoor maps share (솔고개 훈련장, 회색 채석장): open stairs and railings, and the meshes boxes cannot make ============
// stairKit(BARS): helpers that place boxes (B) and push sloping bars onto BARS for barMeshes to draw
//   bar(x0,y0,z0,x1,y1,z1,w,h,mat)   a sloping bar from one point to another, w wide and h tall
//   tst(axis,c0,c1,a0,a1,y0,y1,n,mat) n thin treads (.14 thick) from a0 (at y0, the low end) to a1 (y1), across c0..c1, on two stringers;
//                                     an open flight you can walk under (nav: 1.6 m wide on a half-metre, its ends in line with a deck cell)
//   hrail(axis,c0,c1,a0,a1,y0,y1,n,mat) a handrail beside such a flight: a band 1 m over each tread to bump into (invisible, bullets and
//                                     eyes pass), and to look at a top rail and a knee rail parallel to the nosings on posts
//   rail(x0,z0,x1,z1,y,h,mat)         a railing along a deck's edge: the same see-through band, and posts, two rails and a kick plate
function stairKit(BARS,dm){const CV={nosolid:true},PS={pass:1};dm=dm||'drSteel';
  const bar=(x0,y0,z0,x1,y1,z1,w,h,mat)=>BARS.push([x0,y0,z0,x1,y1,z1,w,h,mat]);
  const AX=(axis,c,a,y)=>axis==='z'?[c,y,a]:[a,y,c];
  const tst=(axis,c0,c1,a0,a1,y0,y1,n,mat,sm)=>{const da=(a1-a0)/n,dy=(y1-y0)/n;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1),bot=top-.14;
    if(axis==='z')B(c0,bot,Math.min(s0,s1),c1,top,Math.max(s0,s1),mat,{stair:1});else B(Math.min(s0,s1),bot,c0,Math.max(s0,s1),top,c1,mat,{stair:1})}
    // (the stringers run .2 under the treads' tops, from the foot to the middle of the last tread)
    sm=sm||(mat==='drPlank'?'drPost':mat);for(const c of [c0+.05,c1-.05])bar(...AX(axis,c,a0,y0+dy*.5-.2),...AX(axis,c,a1-da*.5,y1-.2),.1,.26,sm)};
  const hrail=(axis,c0,c1,a0,a1,y0,y1,n,mat)=>{mat=mat||dm;const da=(a1-a0)/n,dy=(y1-y0)/n,c=(c0+c1)/2;for(let i=0;i<n;i++){const s0=a0+da*i,s1=a0+da*(i+1),top=y0+dy*(i+1);
      if(axis==='z')B(c0,top,Math.min(s0,s1),c1,top+1,Math.max(s0,s1),'metalx',PS);else B(Math.min(s0,s1),top,c0,Math.max(s0,s1),top+1,c1,'metalx',PS)}
    const ya=a=>y0+dy+(a-a0)/da*dy,r0=a0+da*.2,r1=a1-da*.8;for(const k of [.92,.48])bar(...AX(axis,c,r0,ya(r0)+k),...AX(axis,c,r1,ya(r1)+k),.05,.05,mat);
    const every=Math.max(1,Math.round((n-1)/Math.max(1,Math.round(Math.abs(a1-a0)/2.2)))),J=new Set([0,n-1]);for(let i=every;i<n-1;i+=every)if(n-1-i>=every/2)J.add(i);
    for(const j of J){const am=a0+da*(j+.5),top=y0+dy*(j+1)-.32,t1=ya(am)+.94;
      if(axis==='z')B(c-.025,top,am-.025,c+.025,t1,am+.025,mat,CV);else B(am-.025,top,c-.025,am+.025,t1,c+.025,mat,CV)}};
  const rail=(x0,z0,x1,z1,y,h,mat)=>{mat=mat||dm;B(x0,y,z0,x1,y+h,z1,'metalx',PS);const ax=x1-x0>=z1-z0,L=ax?x1-x0:z1-z0,c=ax?(z0+z1)/2:(x0+x1)/2,a0=ax?x0:z0;
    const R=(p,q,ya,yb,w)=>ax?B(p,ya,c-w/2,q,yb,c+w/2,mat,CV):B(c-w/2,ya,p,c+w/2,yb,q,mat,CV);
    R(a0,a0+L,y+h-.06,y+h,.06);R(a0,a0+L,y+.5,y+.55,.04);R(a0,a0+L,y,y+.12,.03);
    const np=Math.max(1,Math.round(L/1.4));for(let i=0;i<=np;i++){const a=a0+(L-.05)*i/np;R(a,a+.05,y,y+h-.06,.05)}};
  return {bar,AX,tst,hrail,rail}}
// meshKit(scene): accumulate triangles per texture with a light per corner (acc / add), then make the mesh (mk); lit is the baker's own light
function meshKit(scene){
  const mk=(A,tex)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));g.setAttribute('color',new THREE.Float32BufferAttribute(A.C,3));
    const m=new THREE.Mesh(g,matWorld(TEX[tex]));m.matrixAutoUpdate=false;m.frustumCulled=false;scene.add(m);MAP.meshes.push(m);return m};
  const acc=()=>({P:[],N:[],U:[],C:[]});
  const add=(A,g,us,vs,light)=>{const q=g.index?g.toNonIndexed():g;const p=q.attributes.position,n=q.attributes.normal,u=q.attributes.uv;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);A.P.push(x,y,z);A.N.push(nx,ny,nz);A.U.push(u.getX(i)*us,u.getY(i)*vs);const c=light(x,y,z,nx,ny,nz);A.C.push(c[0],c[1],c[2])}
    if(q!==g)q.dispose();g.dispose()};
  const lit=(x,y,z,nx,ny,nz)=>lightAt(x+nx*.02,y+ny*.02,z+nz*.02,nx,ny,nz);
  return {acc,add,mk,lit}}
// sunProbe(D): the light at a point beside a thing (a trunk's collider, a stringer inside its steps would see nothing from inside): o
// metres towards the sun, or round the other sides if that is in something solid
function sunProbe(D){const hl=Math.hypot(D.x,D.z)||1,hx=D.x/hl,hz=D.z/hl;
  return (x,y,z,o)=>{for(const [dx,dz] of [[hx,hz],[-hz,hx],[hz,-hx],[-hx,-hz]]){const px=x+dx*o,pz=z+dz*o;if(!insideSolid(px,y,pz))return lightAt(px,y,pz,0,1,0,true)}return lightAt(x,y+.5,z,0,1,0,true)}}
// the sloping bars (stairKit's BARS): boxes turned along their length, one look at the light beside each, the sun side brighter
function barMeshes(BARS,D,K,probeAt){const G={},X=new THREE.Vector3(),Y=new THREE.Vector3(),Z=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0),M4=new THREE.Matrix4();
  for(const [x0,y0,z0,x1,y1,z1,w,h,mat] of BARS){X.set(x1-x0,y1-y0,z1-z0);const len=X.length();if(len<.01)continue;X.divideScalar(len);
    Z.crossVectors(X,UP);if(Z.lengthSq()<1e-6)Z.set(0,0,1);Z.normalize();Y.crossVectors(Z,X).normalize();
    const g=new THREE.BoxGeometry(len,h,w);M4.makeBasis(X,Y,Z).setPosition((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);g.applyMatrix4(M4);
    const Lb=probeAt((x0+x1)/2,(y0+y1)/2+.1,(z0+z1)/2,.35);
    K.add(G[mat]=G[mat]||K.acc(),g,Math.max(1,len/1.6),1,(px,py,pz,nx,ny,nz)=>{const k=.6+.5*Math.max(0,nx*D.x+ny*D.y+nz*D.z)+.1*ny;return [Lb[0]*k,Lb[1]*k,Lb[2]*k]})}
  for(const k in G)K.mk(G[k],k)}
// pines [x,y,z,s]: a trunk and four tiers of needles each, lit by a look at the light beside the crown and beside the trunk
function pineMeshes(PINES,D,K,probeAt,bark,needles){const T=K.acc(),L=K.acc();
  for(const [x,y,z,s] of PINES){const Lc=probeAt(x,y+3.4*s,z,.2*s+.45),Lt=probeAt(x,y+1.2*s,z,.2*s+.45);
    const lf=(Lb,k0)=>(px,py,pz,nx,ny,nz)=>{const k=k0*(.62+.55*Math.max(0,nx*D.x+ny*D.y+nz*D.z));return [Lb[0]*k,Lb[1]*k,Lb[2]*k]};
    const tg=new THREE.CylinderGeometry(.11*s,.19*s,3.4*s,6);tg.translate(x,y+1.7*s,z);const lt0=lf(Lt,.78);K.add(T,tg,2,2,(px,py,pz,nx,ny,nz)=>{const c=lt0(px,py,pz,nx,ny,nz),k=.5+.5*clamp((py-y)/(1.6*s),0,1);return [c[0]*k,c[1]*k,c[2]*k]});
    for(let t=0;t<4;t++){const r=(1.85-t*.42)*s,h=(2.1-t*.15)*s,yy=y+(1.5+t*1.15)*s,cg=new THREE.ConeGeometry(r,h,8);cg.rotateY(hash2(Math.round(x*10),t,12711)*TAU);cg.translate(x,yy+h/2,z);K.add(L,cg,3,1.5,lf(Lc,.78+t*.08))}}
  if(T.P.length){K.mk(T,bark);K.mk(L,needles)}}
// the hills beyond a map's edge: a heightfield of gnd(x,z) (well under the map's own ground inside it), shaded by the sun
function hillMesh(scene,gnd,tex,D,S,NI,O){const pos=new Float32Array(NI*NI*3),uv=new Float32Array(NI*NI*2),idx=[];
  for(let j=0;j<NI;j++)for(let i=0;i<NI;i++){const k=j*NI+i,x=O+i*S,z=O+j*S;pos[k*3]=x;pos[k*3+1]=gnd(x,z);pos[k*3+2]=z;uv[k*2]=x/14;uv[k*2+1]=z/14}
  for(let j=0;j<NI-1;j++)for(let i=0;i<NI-1;i++){const a=j*NI+i,b=a+1,c=a+NI,d=c+1;idx.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const n=g.attributes.normal,col=new Float32Array(NI*NI*3),A0=MAP.ambOut||new THREE.Color('#727866'),SC=MAP.moon?MAP.moon.c:new THREE.Color(1,1,1),SI=MAP.moon?MAP.moon.i:1;
  for(let k=0;k<NI*NI;k++){const l=Math.max(0,n.getX(k)*D.x+n.getY(k)*D.y+n.getZ(k)*D.z);col[k*3]=A0.r*.9+SC.r*SI*l*.8;col[k*3+1]=A0.g*.9+SC.g*SI*l*.8;col[k*3+2]=A0.b*.9+SC.b*SI*l*.8}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(g,matWorld(TEX[tex]));m.matrixAutoUpdate=false;m.frustumCulled=false;scene.add(m);MAP.meshes.push(m)}
// the forest up the hills: dark spires on gnd(x,z) where out(x,z) (how far outside the map, in metres) is e0..e1, thinner in clearings
function forestMesh(K,gnd,out,D,tex,o){o=Object.assign({n:1300,tries:4200,R:158,e0:15,e1:112,seed:12801},o||{});
  const A=K.acc(),A0=MAP.ambOut||new THREE.Color('#727866'),SC=MAP.moon?MAP.moon.c:new THREE.Color(1,1,1),SI=MAP.moon?MAP.moon.i:1;let n=0;
  for(let i=0;i<o.tries&&n<o.n;i++){const x=-o.R+hash2(i,1,o.seed)*o.R*2,z=-o.R+hash2(i,2,o.seed)*o.R*2,e=out(x,z);if(e<o.e0||e>o.e1)continue;
    if(fbm(x/34,z/34,o.seed+1,3,0)<.4+(e>80?.06:0))continue;const s=1.15+hash2(i,3,o.seed)*1.2,y=gnd(x,z)-.3,r=1.25*s,h=5.6*s;
    const cg=new THREE.ConeGeometry(r,h,5,1,true);cg.rotateY(hash2(i,4,o.seed)*TAU);cg.translate(x,y+h/2+.2,z);
    const tone=.72+hash2(i,5,o.seed)*.22;K.add(A,cg,2,1.6,(px,py,pz,nx,ny,nz)=>{const l=Math.max(0,nx*D.x+ny*D.y+nz*D.z),k=tone*(py>y+h*.8?1.1:1);
      return [(A0.r*.82+SC.r*SI*l*.72)*k,(A0.g*.82+SC.g*SI*l*.72)*k,(A0.b*.82+SC.b*SI*l*.72)*k]});n++}
  if(A.P.length)K.mk(A,tex)}

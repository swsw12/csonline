'use strict';
// ============ Effects: dynamic light pool, point-sprite particles, tracers, decals, rain ============
// ---- dynamic lights: up to 4 reach the shader each frame (closest/brightest to the camera win) ----
const DL={list:[],
  add(x,y,z,col,range,int,life,o){const L=Object.assign({x,y,z,c:new THREE.Color(col),r:range,i:int,life,t:0,flick:0},o||{});this.list.push(L);return L},
  update(dt,cam){const L=this.list;for(let i=L.length-1;i>=0;i--){const l=L[i];l.t+=dt;if(l.life>0&&l.t>=l.life||l.dead)L.splice(i,1)}
    const cx=cam.position.x,cy=cam.position.y,cz=cam.position.z;
    const sc=l=>{const d=Math.hypot(l.x-cx,l.y-cy,l.z-cz);return l.i*l.r/(d+2)};
    const s=L.slice().sort((a,b)=>sc(b)-sc(a));
    for(let i=0;i<4;i++){const l=s[i];const P=LU.uPL.value[i],C=LU.uPLc.value[i];
      if(!l){P.set(0,-99,0,1);C.setRGB(0,0,0);continue}
      let k=l.i;if(l.life>0){const f=1-l.t/l.life;k*=l.fade==='lin'?f:f*f}if(l.flick)k*=1-l.flick*Math.random();
      P.set(l.x,l.y,l.z,l.r);C.copy(l.c).multiplyScalar(k)}}};
// ---- particle atlas: 4x4 frames of 32px (shapes are designed on a 16-unit grid and sampled twice as finely) ----
// 0 spark 1 glow 2 smoke 3 smoke2 4 drop 5 mist 6 dust 7 chunk 8 star 9 star2 10 shard 11 flame 12 splash 13 spore 14 ring 15 square
function texParticles(){return paint(128,128,P=>{
  for(let i=0;i<128*128*4;i+=4)P.D[i+3]=0;
  const F=(f,fn)=>{const ox=(f%4)*32,oy=Math.floor(f/4)*32;for(let y=0;y<32;y++)for(let x=0;x<32;x++){const r=fn((x-15.5)/2,(y-15.5)/2,x/2,y/2);if(!r)continue;const i=((oy+y)*128+ox+x)*4;P.D[i]=r[0];P.D[i+1]=r[1];P.D[i+2]=r[2];P.D[i+3]=r[3]}};
  const W=(a)=>[255,255,255,clamp(a,0,255)|0];
  F(0,(x,y)=>{const d=Math.hypot(x,y*.45);return d<2.2?W(255*(1-d/2.2)):null});
  F(1,(x,y)=>{const d=Math.hypot(x,y)/7.5;return d<1?W(255*Math.pow(1-d,1.8)):null});
  F(2,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7.5+(hash2(X,Y,3)-.5)*.35+(vnoise(X/3,Y/3,5,0)-.5)*.5;return d<1?W(200*Math.pow(1-d,.9)):null});
  F(3,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7.5+(vnoise(X/2.5,Y/2.5,9,0)-.5)*.7;return d<1?W(190*Math.pow(1-d,.8)):null});
  F(4,(x,y)=>{const d=Math.hypot(x,y*.7)/3.2;return d<1?[255,255,255,255]:null});
  F(5,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7+(hash2(X,Y,4)-.5)*.6;return d<1&&hash2(X,Y,7)<.75?W(220*(1-d)):null});
  F(6,(x,y,X,Y)=>{const d=Math.hypot(x,y)/6.5;return d<1&&hash2(X,Y,8)<.55?W(160*(1-d)):null});
  F(7,(x,y)=>Math.abs(x)<2.2&&Math.abs(y)<1.6?[255,255,255,255]:null);
  F(8,(x,y)=>{const d=Math.hypot(x,y)/7.5;const a=Math.atan2(y,x);const st=Math.pow(Math.abs(Math.cos(a*2)),6)*.7+.3;return d<st?W(255*Math.pow(1-d/st,1.2)):null});
  F(9,(x,y)=>{const d=Math.hypot(x,y)/7.5;const a=Math.atan2(y,x);const st=Math.pow(Math.abs(Math.cos(a*3+.5)),5)*.75+.25;return d<st?W(255*Math.pow(1-d/st,1.1)):null});
  F(10,(x,y)=>{const u=x*.7+y*.7,v=-x*.7+y*.7;return Math.abs(u)<4.5&&Math.abs(v)<1.4?W(255):null});
  F(11,(x,y,X,Y)=>{const d=Math.hypot(x,(y+2)*.7)/7+(vnoise(X/2,Y/2,13,0)-.5)*.5;return d<1?W(255*(1-d)):null});
  F(12,(x,y)=>{const d=Math.abs(Math.hypot(x,y*1.6)-5);return d<1.2&&y<1?W(200):null});
  F(13,(x,y)=>{const d=Math.hypot(x,y)/2.5;return d<1?W(255):null});
  F(14,(x,y)=>{const d=Math.abs(Math.hypot(x,y)-6);return d<1.3?W(255*(1-d/1.3)):null});
  F(15,(x,y)=>Math.abs(x)<5&&Math.abs(y)<5?W(255):null);
})}
function mkPS(n,additive){const g=new THREE.BufferGeometry();const pos=new Float32Array(n*3),sz=new Float32Array(n),col=new Float32Array(n*4),fr=new Float32Array(n);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aSize',new THREE.BufferAttribute(sz,1).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aCol',new THREE.BufferAttribute(col,4).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aFrame',new THREE.BufferAttribute(fr,1).setUsage(THREE.DynamicDrawUsage));
  const pts=new THREE.Points(g,matPoints(FX.ptex,additive));pts.frustumCulled=false;pts.renderOrder=additive?5:4;
  return {n,g,pts,pos,sz,col,fr,P:[],live:0}}
const _pc=new THREE.Color(),_gbT=new THREE.Matrix4(),_gbq=new THREE.Quaternion(),_gbq2=new THREE.Quaternion(),_gbv=new THREE.Vector3(),_gbv2=new THREE.Vector3(),_gb1=new THREE.Vector3(1,1,1);
const FX={ptex:null,A:null,B:null,tr:null,dec:null,rain:null,shake:0,
  init(scene){this.ptex=new THREE.CanvasTexture(texParticles());this.ptex.magFilter=THREE.NearestFilter;this.ptex.minFilter=THREE.NearestFilter;this.ptex.generateMipmaps=false;
    this.A=mkPS(1800,true);this.B=mkPS(1800,false);scene.add(this.A.pts);scene.add(this.B.pts);
    this.initTracers(scene);this.initDecals(scene);this.initRain(scene);this.initSparks(scene);this.initBlobs(scene)},
  // spawn: o={x,y,z,vx,vy,vz,life,s0,s1,r,g,b,a,f(frame),grav,drag,add,col(bounce),fa(frame anim count)}
  spawn(o){const S=o.add?this.A:this.B;if(S.P.length>=S.n){S.P.shift()}const p={x:o.x,y:o.y,z:o.z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,t:0,life:o.life||1,s0:o.s0||.1,s1:o.s1==null?o.s0||.1:o.s1,
    r:o.r==null?1:o.r,g:o.g==null?1:o.g,b:o.b==null?1:o.b,a:o.a==null?1:o.a,f:o.f||0,grav:o.grav||0,drag:o.drag||0,col:o.col||0,fadeIn:o.fadeIn||0,splat:o.splat||0};
    // smoke and dust pick up the light where they are born
    if(o.lit){sampleProbe(p.x,p.y,p.z,_pc);const k=clamp(.6+(_pc.r+_pc.g+_pc.b)*.55,.55,1.7);p.r*=k*(.8+_pc.r*.4);p.g*=k*(.8+_pc.g*.4);p.b*=k*(.8+_pc.b*.4)}
    S.P.push(p);return p},
  update(dt){for(const S of [this.A,this.B]){const P=S.P;let w=0;
      for(let i=0;i<P.length;i++){const p=P[i];p.t+=dt;if(p.t>=p.life)continue;
        p.vy-=p.grav*dt;if(p.drag){const k=Math.exp(-p.drag*dt);p.vx*=k;p.vy*=k;p.vz*=k}
        const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt,nz=p.z+p.vz*dt;
        if(p.col&&p.vy<0){const fl=floorBelow(nx,p.y+.05,nz,.02);if(ny<fl){p.y=fl+.01;if(p.splat){this.decal(nx,fl,nz,0,1,0,p.splat,4+((Math.random()*3)|0),[.6,.05,.04],.92);p.splat=0}p.vy*=-p.col;p.vx*=.6;p.vz*=.6;if(Math.abs(p.vy)<.4){p.vy=0;p.grav=0;p.vx*=.3;p.vz*=.3}p.x=nx;p.z=nz;P[w++]=p;continue}}
        p.x=nx;p.y=ny;p.z=nz;P[w++]=p}
      P.length=w;
      const n=Math.min(P.length,S.n);for(let i=0;i<n;i++){const p=P[i],k=p.t/p.life;S.pos[i*3]=p.x;S.pos[i*3+1]=p.y;S.pos[i*3+2]=p.z;S.sz[i]=lerp(p.s0,p.s1,k);
        let a=p.a*(1-k*k);if(p.fadeIn&&p.t<p.fadeIn)a*=p.t/p.fadeIn;S.col[i*4]=p.r;S.col[i*4+1]=p.g;S.col[i*4+2]=p.b;S.col[i*4+3]=a;S.fr[i]=p.f}
      S.g.setDrawRange(0,n);for(const k of ['position','aSize','aCol','aFrame'])S.g.attributes[k].needsUpdate=true}
    this.updTracers(dt);this.updRain(dt);this.updSparks(dt);this.updBlobs();this.updLimbs(dt);this.updEmit(dt)},
  // ---- sparks: short additive streaks that fall, stretch with speed and skip once off the floor ----
  initSparks(scene){const n=300;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*6),col=new Float32Array(n*6);
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.BufferAttribute(col,3).setUsage(THREE.DynamicDrawUsage));
    const L=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));L.frustumCulled=false;L.renderOrder=6;scene.add(L);this.sp={n,g,pos,col,list:[]}},
  spark(x,y,z,vx,vy,vz,life,c){const S=this.sp;if(!S)return;if(S.list.length>=S.n)S.list.shift();S.list.push({x,y,z,vx,vy,vz,t:0,life:life||.4,c:c||[1,.72,.32],fl:floorBelow(x,y+.05,z,.02),b:0})},
  updSparks(dt){const S=this.sp;let w=0;for(const p of S.list){p.t+=dt;if(p.t>=p.life)continue;p.vy-=14*dt;const k=Math.exp(-1.2*dt);p.vx*=k;p.vz*=k;
      let ny=p.y+p.vy*dt;if(ny<p.fl&&p.vy<0){if(p.b>0){p.t=p.life;continue}ny=p.fl+.01;p.vy*=-.32;p.vx*=.55;p.vz*=.55;p.b=1}
      p.x+=p.vx*dt;p.y=ny;p.z+=p.vz*dt;S.list[w++]=p}S.list.length=w;
    for(let i=0;i<w;i++){const p=S.list[i];const f=1-p.t/p.life,b=f*f;const L=.03;
      S.pos.set([p.x,p.y,p.z,p.x-p.vx*L,p.y-p.vy*L,p.z-p.vz*L],i*6);S.col.set([p.c[0]*b*1.2,p.c[1]*b*1.2,p.c[2]*b,p.c[0]*b*.35,p.c[1]*b*.15,p.c[2]*b*.05],i*6)}
    S.g.setDrawRange(0,w*2);S.g.attributes.position.needsUpdate=true;S.g.attributes.color.needsUpdate=true},
  // ---- blob shadows: a soft dark disc under every visible character, fading as they leave the ground ----
  initBlobs(scene){const n=48;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*12),uv=new Float32Array(n*8),al=new Float32Array(n*4),idx=[];
    for(let i=0;i<n;i++){const b=i*4;idx.push(b,b+1,b+2,b,b+2,b+3);uv.set([0,0,1,0,1,1,0,1],i*8)}
    g.setIndex(idx);g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aA',new THREE.BufferAttribute(al,1).setUsage(THREE.DynamicDrawUsage));
    const m=new THREE.ShaderMaterial({uniforms:{uFogD:LU.uFogD},vertexShader:'attribute float aA;varying vec2 vUv;varying float vA;varying float vD;void main(){vUv=uv;vA=aA;vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform float uFogD;varying vec2 vUv;varying float vA;varying float vD;void main(){float r=length(vUv-.5)*2.;float a=clamp(1.-r,0.,1.);a=a*a*(3.-2.*a)*vA*exp(-uFogD*uFogD*vD*vD);gl_FragColor=vec4(vec3(1.-a*.72),1.);}',
      transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.SrcColorFactor,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3});
    const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=1;scene.add(mesh);this.bl={n,g,pos,al}},
  updBlobs(){const B=this.bl;if(!B||typeof G==='undefined')return;let k=0;
    for(const a of G.actors){if(k>=B.n)break;if(!a.ch||!a.ch.grp.visible)continue;const c=a.c;const fl=floorBelow(c.x,c.y+.2,c.z,.05);if(fl<-50)continue;const h=Math.max(0,c.y-fl);if(h>3)continue;
      const dead=!a.alive;const r=(a.team===TZ?ZCLASS[a.zc].hw:.3)*1.6*(1+h*.3)*(dead?1.45:1),al=clamp(1-h/3,0,1)*(dead?.7:1),y=fl+.012;
      B.pos.set([c.x-r,y,c.z-r,c.x+r,y,c.z-r,c.x+r,y,c.z+r,c.x-r,y,c.z+r],k*12);B.al.fill(al,k*4,k*4+4);k++}
    B.g.setDrawRange(0,k*6);B.g.attributes.position.needsUpdate=true;B.g.attributes.aA.needsUpdate=true},
  // ---- tracers: moving streaks ----
  initTracers(scene){const n=96;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*6),col=new Float32Array(n*6);
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.BufferAttribute(col,3).setUsage(THREE.DynamicDrawUsage));
    const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});const L=new THREE.LineSegments(g,m);L.frustumCulled=false;L.renderOrder=6;scene.add(L);
    this.tr={n,g,pos,col,list:[]}},
  tracer(x0,y0,z0,x1,y1,z1,c){const T=this.tr;if(T.list.length>=T.n)T.list.shift();const d=Math.hypot(x1-x0,y1-y0,z1-z0);if(d<1)return;
    T.list.push({x0,y0,z0,dx:(x1-x0)/d,dy:(y1-y0)/d,dz:(z1-z0)/d,d,t:0,c:c||[1,.85,.55]})},
  updTracers(dt){const T=this.tr;let w=0;const sp=320,len=5;
    for(const t of T.list){t.t+=dt;const head=t.t*sp;if(head-len>t.d)continue;T.list[w++]=t}T.list.length=w;
    for(let i=0;i<w;i++){const t=T.list[i];const h=Math.min(t.d,t.t*sp),tl=Math.max(0,h-len);
      T.pos.set([t.x0+t.dx*tl,t.y0+t.dy*tl,t.z0+t.dz*tl,t.x0+t.dx*h,t.y0+t.dy*h,t.z0+t.dz*h],i*6);T.col.set([0,0,0,t.c[0]*.9,t.c[1]*.9,t.c[2]*.9],i*6)}
    T.g.setDrawRange(0,w*2);T.g.attributes.position.needsUpdate=true;T.g.attributes.color.needsUpdate=true},
  // ---- decals: quads laid on surfaces (bullet holes, blood, scorch) ----
  initDecals(scene){const n=320;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*12),uv=new Float32Array(n*8),col=new Float32Array(n*16),idx=[];
    for(let i=0;i<n;i++){const b=i*4;idx.push(b,b+1,b+2,b,b+2,b+3)}
    g.setIndex(idx);g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('uv',new THREE.BufferAttribute(uv,2).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aC',new THREE.BufferAttribute(col,4).setUsage(THREE.DynamicDrawUsage));
    const tex=new THREE.CanvasTexture(texDecals());tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
    const m=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:tex}},LU),vertexShader:`attribute vec4 aC;varying vec2 vUv;varying vec4 vC;varying vec3 vPos;void main(){vUv=uv;vC=aC;vec4 wp=modelMatrix*vec4(position,1.);vPos=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`,
      fragmentShader:GLSL_DYN+`uniform sampler2D map;varying vec2 vUv;varying vec4 vC;varying vec3 vPos;void main(){vec4 t=texture2D(map,vUv);float a=t.a*vC.a;if(a<.03)discard;vec3 c=t.rgb*vC.rgb*(uAmb*.6+dynLight(vPos,vec3(0.,1.,0.))*.6+.25);gl_FragColor=vec4(applyFog(c,vPos),a);}`,
      transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
    const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=2;scene.add(mesh);this.dec={n,g,pos,uv,col,i:0}},
  // frame: 0..3 holes, 4..7 blood, 8 scorch, 9 frost, 10 spore
  decal(x,y,z,nx,ny,nz,size,frame,c,a){const D=this.dec;const i=D.i;D.i=(D.i+1)%D.n;
    let ux,uy,uz;if(Math.abs(ny)>.9){ux=1;uy=0;uz=0}else{ux=-nz;uy=0;uz=nx;const l=Math.hypot(ux,uz);ux/=l;uz/=l}
    const vx=ny*uz-nz*uy,vy=nz*ux-nx*uz,vz=nx*uy-ny*ux;const r=Math.random()*TAU,cr=Math.cos(r),sr=Math.sin(r);
    const ax=(ux*cr+vx*sr)*size,ay=(uy*cr+vy*sr)*size,az=(uz*cr+vz*sr)*size,bx=(vx*cr-ux*sr)*size,by=(vy*cr-uy*sr)*size,bz=(vz*cr-uz*sr)*size;
    const ox=x+nx*.012,oy=y+ny*.012,oz=z+nz*.012;
    D.pos.set([ox-ax-bx,oy-ay-by,oz-az-bz,ox+ax-bx,oy+ay-by,oz+az-bz,ox+ax+bx,oy+ay+by,oz+az+bz,ox-ax+bx,oy-ay+by,oz-az+bz],i*12);
    const fx=(frame%4)*.25,fy=1-Math.floor(frame/4)*.25-.25;D.uv.set([fx,fy,fx+.25,fy,fx+.25,fy+.25,fx,fy+.25],i*8);
    c=c||[1,1,1];for(let k=0;k<4;k++)D.col.set([c[0],c[1],c[2],a==null?1:a],i*16+k*4);
    D.g.attributes.position.needsUpdate=true;D.g.attributes.uv.needsUpdate=true;D.g.attributes.aC.needsUpdate=true},
  clearDecals(){const D=this.dec;D.col.fill(0);D.g.attributes.aC.needsUpdate=true},
  // ---- rain: streaks that stop at the first roof/ground below them ----
  initRain(scene){const n=700;const g=new THREE.BufferGeometry();const pos=new Float32Array(n*6),col=new Float32Array(n*6);
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('color',new THREE.BufferAttribute(col,3));
    for(let i=0;i<n;i++){const k=.25+Math.random()*.3;col.set([k*.6,k*.68,k*.8,k*.9,k*.95,k],i*6)}
    // streaks glint where they cross the flashlight cone
    const mat=new THREE.ShaderMaterial({uniforms:{uSpotP:LU.uSpotP,uSpotD:LU.uSpotD,uSpotK:LU.uSpotK,uK:{value:1}},vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
      vertexShader:'uniform vec3 uSpotP;uniform vec3 uSpotD;uniform vec4 uSpotK;uniform float uK;varying vec3 vC;void main(){vec4 wp=modelMatrix*vec4(position,1.);vec3 L=wp.xyz-uSpotP;float d=max(length(L),.01);float sp=smoothstep(uSpotK.x-.05,uSpotK.y,dot(L/d,uSpotD))*clamp(1.-d/12.,0.,1.)*uSpotK.w;vC=color*.55*uK*(1.+sp*4.)+vec3(.5,.47,.4)*sp*.4;gl_Position=projectionMatrix*viewMatrix*wp;}',
      fragmentShader:'varying vec3 vC;void main(){gl_FragColor=vec4(vC,1.);}'});
    const L=new THREE.LineSegments(g,mat);L.frustumCulled=false;L.renderOrder=3;scene.add(L);
    const drops=[];for(let i=0;i<n;i++)drops.push({x:0,y:-99,z:0,f:-99,v:rr(14,18)});
    this.rain={n,g,pos,drops,L,on:true,cx:0,cz:0,hm:null,k:1};this.buildRainHM()},
  buildRainHM(){const bb=MAP.bounds||[-31,-31,31,31],S=.5,X0=Math.min(bb[0],bb[1]),N=Math.ceil((Math.max(bb[2],bb[3])-X0)/S),hm=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=X0+(i+.5)*S,z=X0+(j+.5)*S;hm[j*N+i]=Math.max(0,floorBelow(x,40,z,.01))}this.rain.hm={S,N,X0,hm}},
  rainTop(x,z){const H=this.rain.hm;const i=Math.floor((x-H.X0)/H.S),j=Math.floor((z-H.X0)/H.S);if(i<0||j<0||i>=H.N||j>=H.N)return 0;return H.hm[j*H.N+i]},
  updRain(dt){const R0=this.rain;if(!R0||!R0.on){if(R0)R0.L.visible=false;return}R0.L.visible=true;const c=R.cam.position;const n=Math.floor(R0.n*R0.k);
    for(let i=0;i<R0.n;i++){const d=R0.drops[i];if(i>=n){R0.pos.fill(0,i*6,i*6+6);continue}
      const sn=R0.snow;if(sn){d.y-=d.v*.1*dt;d.x+=Math.sin(G.t*.8+i*1.7)*.5*dt+.35*dt;d.z+=Math.cos(G.t*.6+i)*.3*dt}else d.y-=d.v*dt;if(d.y<d.f||Math.abs(d.x-c.x)>20||Math.abs(d.z-c.z)>20){
        if(!sn&&d.y<d.f&&d.f>-50&&Math.random()<.08&&Math.hypot(d.x-c.x,d.z-c.z)<9)this.spawn({x:d.x,y:d.f+.02,z:d.z,vy:.6,life:.25,s0:.05,s1:.12,r:.5,g:.55,b:.65,a:.5,f:12});
        d.x=c.x+rr(-20,20);d.z=c.z+rr(-20,20);d.f=this.rainTop(d.x,d.z);d.y=Math.max(c.y+rr(2,14),d.f+.5)}
      const l=sn?.05:.45;R0.pos.set([d.x,d.y+l,d.z,d.x-(sn?.04:.02),d.y,d.z+.01],i*6)}
    R0.g.attributes.position.needsUpdate=true},
  // ---------- composite effects ----------
  muzzle(x,y,z,dx,dy,dz,big){this.spawn({x,y,z,life:.05,s0:big?.55:.4,s1:big?.7:.5,r:1,g:.8,b:.45,a:1,f:Math.random()<.5?8:9,add:1});
    this.spawn({x,y,z,life:.06,s0:big?.45:.3,s1:big?.18:.1,r:1,g:.92,b:.75,a:1,f:1,add:1});
    for(let i=0;i<(big?3:2);i++){const s=rr(2.5,6);this.spawn({x:x+dx*.04,y:y+dy*.04,z:z+dz*.04,vx:dx*s+rr(-.4,.4),vy:dy*s+rr(-.3,.4),vz:dz*s+rr(-.4,.4),life:rr(.035,.07),s0:big?.3:.2,s1:.05,r:1,g:rr(.5,.75),b:.25,a:.9,f:11,add:1})}
    for(let i=0;i<(big?2:1);i++)this.spawn({x:x+dx*.15,y:y+dy*.15,z:z+dz*.15,vx:dx*rr(1.5,2.5)+rr(-.2,.2),vy:dy*2+rr(.1,.4),vz:dz*rr(1.5,2.5)+rr(-.2,.2),life:rr(.35,.6),s0:.1,s1:big?.55:.4,r:.45,g:.45,b:.46,a:.3,f:Math.random()<.5?2:3,drag:3,lit:1});
    if(Math.random()<(big?.6:.25))for(let i=0;i<2;i++)this.spark(x,y,z,dx*rr(8,14)+rr(-1.5,1.5),dy*rr(8,14)+rr(-.5,2),dz*rr(8,14)+rr(-1.5,1.5),rr(.08,.2));
    DL.add(x,y,z,'#ffb860',big?7:5.5,big?2.2:1.6,.06)},
  // bullet impacts by surface: metal sparks (+ a blink of light up close), concrete chips and a dust puff, wood splinters, dirt clods,
  // and on rain-wet ground a splash of water
  impact(x,y,z,nx,ny,nz,mat){const mk=matKind(mat),metal=mk==='metal',wood=mk==='wood',soft=mk==='soft',glass=mk==='glass',stone=!metal&&!wood&&!soft;
    if(glass)for(let i=0;i<6;i++)this.spawn({x:x+nx*.02,y:y+ny*.02,z:z+nz*.02,vx:nx*rr(.5,2.5)+rr(-1,1),vy:rr(-.5,1.5),vz:nz*rr(.5,2.5)+rr(-1,1),life:rr(.5,.9),s0:rr(.03,.05),s1:.03,r:.75,g:.85,b:.95,a:.9,f:10,grav:11,col:.2,lit:1});
    const ox=x+nx*.03,oy=y+ny*.03,oz=z+nz*.03,cam=R.cam.position,near=Math.hypot(x-cam.x,y-cam.y,z-cam.z)<16;
    this.decal(x,y,z,nx,ny,nz,metal?.05:.06,metal?1:wood?2:Math.random()<.5?0:3,null,.95);
    // a white-hot flash at the hit point
    this.spawn({x:ox,y:oy,z:oz,life:.05,s0:metal?.22:.14,s1:.04,r:1,g:metal?.85:.9,b:metal?.5:.75,f:1,add:1});
    if(metal){for(let i=0;i<9;i++)this.spark(x+nx*.02,y+ny*.02,z+nz*.02,nx*rr(2,7)+rr(-3,3),ny*rr(2,7)+rr(0,4),nz*rr(2,7)+rr(-3,3),rr(.15,.5));
      if(near&&Math.random()<.5)DL.add(ox,oy,oz,'#ffb050',2.6,.9,.07);
      // a ricochet streak now and then
      if(Math.random()<.25){const s=rr(18,30);this.spark(ox,oy,oz,nx*s*.6+rr(-6,6),ny*s*.3+rr(-1,5),nz*s*.6+rr(-6,6),.12,[1,.9,.6])}}
    else if(stone&&Math.random()<.6)this.spark(x+nx*.02,y+ny*.02,z+nz*.02,nx*rr(2,4)+rr(-2,2),ny*rr(2,4)+rr(0,2),nz*rr(2,4)+rr(-2,2),rr(.08,.18),[1,.8,.5]);
    const dc=wood?[.5,.38,.25]:soft?[.32,.28,.22]:metal?[.42,.42,.42]:[.52,.52,.49];
    // dust: a fast jet out of the hole then a lazy cloud
    for(let i=0;i<(soft?6:metal?2:5);i++)this.spawn({x:ox,y:oy,z:oz,vx:nx*rr(.5,2.4)+rr(-.5,.5),vy:ny*rr(.5,2.4)+rr(0,1),vz:nz*rr(.5,2.4)+rr(-.5,.5),life:rr(.5,1.2),s0:.06,s1:rr(.28,.42),r:dc[0],g:dc[1],b:dc[2],a:.55,f:Math.random()<.5?2:6,drag:3.2,grav:-.15,lit:1});
    if(!metal)this.spawn({x:ox,y:oy,z:oz,vx:nx*4,vy:ny*4+.3,vz:nz*4,life:.18,s0:.05,s1:.22,r:dc[0]*1.2,g:dc[1]*1.2,b:dc[2]*1.2,a:.7,f:6,drag:9,lit:1});
    if(wood)for(let i=0;i<5;i++)this.spawn({x,y,z,vx:nx*rr(1,3.5)+rr(-1.2,1.2),vy:ny*rr(1,3)+rr(1,3),vz:nz*rr(1,3.5)+rr(-1.2,1.2),life:rr(.6,1.1),s0:rr(.04,.07),s1:.05,r:.6,g:.46,b:.3,f:10,grav:12,col:.2});
    // chips and grit
    for(let i=0;i<(stone?4:soft?3:2);i++)this.spawn({x,y,z,vx:nx*rr(1,3.5)+rr(-1.2,1.2),vy:ny*rr(1,3)+rr(.5,2.5),vz:nz*rr(1,3.5)+rr(-1.2,1.2),life:rr(.4,.8),s0:.025,s1:.025,r:dc[0]*.75,g:dc[1]*.75,b:dc[2]*.75,f:7,grav:12,col:.3});
    if(ny>.6&&this.rain&&this.rain.on&&!metal){for(let i=0;i<6;i++){const a=Math.random()*TAU,sp=rr(.6,1.8);this.spawn({x,y:y+.02,z,vx:Math.cos(a)*sp,vy:rr(1.6,3),vz:Math.sin(a)*sp,life:rr(.3,.5),s0:.03,s1:.02,r:.62,g:.68,b:.78,a:.8,f:13,grav:10,lit:1})}
      this.spawn({x,y:y+.03,z,life:.25,s0:.06,s1:.22,r:.6,g:.66,b:.75,a:.6,f:12,lit:1})}},
  blood(x,y,z,dx,dy,dz,amt,green){const c=green?[.32,.42,.1]:[.42,.03,.02];amt=amt||1;
    // droplets (some land as small splats), a spray of mist, and with heavier hits chunks of flesh
    for(let i=0;i<5*amt;i++)this.spawn({x,y,z,vx:dx*rr(.8,3.2)+rr(-1.2,1.2),vy:rr(-.3,2.2),vz:dz*rr(.8,3.2)+rr(-1.2,1.2),life:rr(.45,.9),s0:rr(.04,.07),s1:.03,r:c[0],g:c[1],b:c[2],f:4,grav:9.8,col:.05,splat:Math.random()<.3?rr(.05,.1):0});
    for(let i=0;i<3*amt;i++)this.spawn({x,y,z,vx:dx*rr(.3,1.4)+rr(-.5,.5),vy:rr(-.2,.6),vz:dz*rr(.3,1.4)+rr(-.5,.5),life:rr(.3,.65),s0:.12,s1:.5,r:c[0]*1.3,g:c[1]*1.2,b:c[2]*1.2,a:.75,f:5,drag:4,lit:1});
    if(amt>=1&&!green)for(let i=0;i<Math.round(amt*1.5*Math.random()+(amt>1.5?1:0));i++)this.spawn({x,y,z,vx:dx*rr(1,3)+rr(-1.2,1.2),vy:rr(.5,2.5),vz:dz*rr(1,3)+rr(-1.2,1.2),life:rr(.8,1.4),s0:rr(.04,.07),s1:.05,r:rr(.32,.5),g:.04,b:.03,f:7,grav:12,col:.25,splat:rr(.08,.16)});
    // splat on the wall/floor behind
    const h=rayCast(x,y,z,dx*.7,dy*.7-.3,dz*.7,2.5);if(h&&Math.random()<.7){const hx=x+dx*.7*h.t,hy=y+(dy*.7-.3)*h.t,hz=z+dz*.7*h.t;this.decal(hx,hy,hz,h.nx,h.ny,h.nz,rr(.15,.32),4+rint(0,3),green?[.5,.7,.2]:[.8,.12,.08],.9)}},
  explode(x,y,z,kind){const fr=kind==='frost';
    if(fr){for(let i=0;i<40;i++){const a=Math.random()*TAU,s=rr(2,9);this.spawn({x,y:y+.2,z,vx:Math.cos(a)*s,vy:rr(0,4),vz:Math.sin(a)*s,life:rr(.5,1.1),s0:.12,s1:.05,r:.7,g:.9,b:1,f:10,grav:6,drag:2,add:1})}
      for(let i=0;i<18;i++){const a=Math.random()*TAU,s=rr(1,5);this.spawn({x,y:y+.3,z,vx:Math.cos(a)*s,vy:rr(0,1.5),vz:Math.sin(a)*s,life:rr(1,2),s0:.5,s1:1.6,r:.75,g:.88,b:1,a:.5,f:2,drag:2.5})}
      this.spawn({x,y:y+.3,z,life:.35,s0:1,s1:7,r:.6,g:.85,b:1,f:14,add:1});DL.add(x,y+.8,z,'#8cd0ff',10,3,.6);
      const h=rayCast(x,y+.3,z,0,-1,0,3);if(h)this.decal(x,y+.3-h.t,z,0,1,0,2.2,9,[.8,.9,1],.85);return}
    this.spawn({x,y:y+.4,z,life:.25,s0:2,s1:5,r:1,g:.75,b:.4,f:1,add:1});this.spawn({x,y:y+.25,z,life:.32,s0:.6,s1:10,r:1,g:.8,b:.55,a:.7,f:14,add:1});
    for(let i=0;i<34;i++){const a=Math.random()*TAU,e=rr(.1,1.3),s=rr(6,16);this.spark(x,y+.3,z,Math.cos(a)*Math.cos(e)*s,Math.sin(e)*s,Math.sin(a)*Math.cos(e)*s,rr(.3,.9))}
    for(let i=0;i<10;i++){const a=Math.random()*TAU,s=rr(3,8);this.spawn({x,y:y+.3,z,vx:Math.cos(a)*s,vy:rr(3,7),vz:Math.sin(a)*s,life:rr(.8,1.4),s0:.07,s1:.07,r:.16,g:.15,b:.14,f:7,grav:14,col:.35})}
    for(let i=0;i<22;i++){const a=Math.random()*TAU,e=Math.random()*1.4,s=rr(2,7);this.spawn({x,y:y+.3,z,vx:Math.cos(a)*Math.cos(e)*s,vy:Math.sin(e)*s+1,vz:Math.sin(a)*Math.cos(e)*s,life:rr(.3,.6),s0:.5,s1:1.1,r:1,g:rr(.45,.7),b:.2,f:11,drag:3,add:1})}
    for(let i=0;i<30;i++){const a=Math.random()*TAU,s=rr(.5,4);this.spawn({x,y:y+.5,z,vx:Math.cos(a)*s,vy:rr(.5,3.4),vz:Math.sin(a)*s,life:rr(1.6,3.6),s0:.6,s1:2.6,r:.2,g:.19,b:.18,a:.65,f:Math.random()<.5?2:3,drag:1.6,grav:-.35,fadeIn:.1,lit:1})}
    for(let i=0;i<24;i++){const a=Math.random()*TAU,s=rr(4,14);this.spawn({x,y:y+.3,z,vx:Math.cos(a)*s,vy:rr(2,8),vz:Math.sin(a)*s,life:rr(.4,1.2),s0:.05,s1:.02,r:1,g:.7,b:.3,f:0,grav:12,add:1,col:.3})}
    // a dust wave rolling out along the ground, a rising fireball, burning debris that trails smoke
    for(let i=0;i<20;i++){const a=i/20*TAU+rr(-.1,.1),s=rr(5,8);this.spawn({x:x+Math.cos(a)*.3,y:y+.15,z:z+Math.sin(a)*.3,vx:Math.cos(a)*s,vy:rr(0,.6),vz:Math.sin(a)*s,life:rr(.9,1.6),s0:.4,s1:1.4,r:.34,g:.31,b:.27,a:.55,f:2,drag:2.8,fadeIn:.04,lit:1})}
    for(let i=0;i<8;i++)this.spawn({x:x+rr(-.3,.3),y:y+.6,z:z+rr(-.3,.3),vx:rr(-.6,.6),vy:rr(2.4,4),vz:rr(-.6,.6),life:rr(.5,.8),s0:.9,s1:1.8,r:1,g:rr(.4,.6),b:.15,a:.85,f:11,drag:2.2,add:1});
    for(let i=0;i<5;i++){const a=Math.random()*TAU,s=rr(4,9);this.emit({x,y:y+.4,z,vx:Math.cos(a)*s,vy:rr(4,8),vz:Math.sin(a)*s,life:rr(.9,1.5),grav:14,rate:30,fn:(e,f)=>{this.spawn({x:e.x,y:e.y,z:e.z,vx:rr(-.2,.2),vy:rr(.2,.6),vz:rr(-.2,.2),life:rr(.5,1),s0:.12,s1:.45,r:.18,g:.17,b:.16,a:.5*f,f:2,drag:2,lit:1});
      if(Math.random()<.5)this.spawn({x:e.x,y:e.y,z:e.z,life:.12,s0:.16,s1:.08,r:1,g:.6,b:.2,f:11,add:1})}})}
    // flames licking the scorch for a moment, with their own flickering light
    const fl=floorBelow(x,y+.5,z,.05);if(fl>-50&&y-fl<1.5){const L=DL.add(x,fl+.5,z,'#ff8a30',7,1.4,2.6,{flick:.35});
      this.emit({x,y:fl+.05,z,life:2.6,rate:22,fn:(e,f)=>{const a=Math.random()*TAU,r=Math.sqrt(Math.random())*1.1;this.spawn({x:e.x+Math.cos(a)*r,y:e.y,z:e.z+Math.sin(a)*r,vy:rr(.6,1.4),life:rr(.25,.5),s0:rr(.2,.4)*f+.05,s1:.05,r:1,g:rr(.45,.65),b:.15,a:.9,f:11,add:1});
        if(Math.random()<.4)this.spawn({x:e.x+Math.cos(a)*r,y:e.y+.3,z:e.z+Math.sin(a)*r,vx:rr(-.2,.2),vy:rr(.6,1.2),vz:rr(-.2,.2),life:rr(1,2),s0:.3,s1:1.2,r:.16,g:.15,b:.14,a:.45*f,f:3,drag:1.2,lit:1})}})}
    DL.add(x,y+1,z,'#ffa040',16,3.5,.7);const h=rayCast(x,y+.3,z,0,-1,0,3);if(h)this.decal(x,y+.3-h.t,z,0,1,0,1.6,8,[1,1,1],.9)},
  // ---- emitters: short-lived sources that move (optionally ballistic) and call fn(e, fraction of life left) at a fixed rate ----
  emitters:[],
  emit(o){const e=Object.assign({vx:0,vy:0,vz:0,grav:0,t:0,acc:0},o);this.emitters.push(e);if(this.emitters.length>40)this.emitters.shift();return e},
  updEmit(dt){const E=this.emitters;let w=0;for(const e of E){e.t+=dt;if(e.t>=e.life)continue;e.vy-=e.grav*dt;const ny=e.y+e.vy*dt;
      if(e.grav){const fl=floorBelow(e.x,e.y+.05,e.z,.02);if(ny<fl){e.y=fl+.02;e.vy*=-.25;e.vx*=.5;e.vz*=.5}else e.y=ny}else e.y=ny;e.x+=e.vx*dt;e.z+=e.vz*dt;
      e.acc+=dt*e.rate;while(e.acc>=1){e.acc-=1;e.fn(e,1-e.t/e.life)}E[w++]=e}E.length=w},
  // a head (or body) bursting: flesh chunks that splatter where they land, bone shards, a red mist, a big splash on the wall behind
  gib(x,y,z,dx,dy,dz,big){const n=big?1.6:1;
    for(let i=0;i<14*n;i++){const a=Math.random()*TAU,s=rr(1.5,5);this.spawn({x,y,z,vx:Math.cos(a)*s+dx*2.5,vy:rr(1,4.5),vz:Math.sin(a)*s+dz*2.5,life:rr(.7,1.4),s0:rr(.05,.11),s1:.06,r:rr(.32,.55),g:.04,b:.03,f:7,grav:12,col:.3,splat:rr(.1,.24)})}
    for(let i=0;i<7*n;i++){const a=Math.random()*TAU,s=rr(2,6);this.spawn({x,y,z,vx:Math.cos(a)*s+dx*2,vy:rr(1.5,5),vz:Math.sin(a)*s+dz*2,life:rr(.6,1.1),s0:.05,s1:.04,r:.85,g:.8,b:.68,f:10,grav:13,col:.3})}
    for(let i=0;i<12*n;i++)this.spawn({x:x+rr(-.1,.1),y:y+rr(-.1,.1),z:z+rr(-.1,.1),vx:dx*rr(.5,2)+rr(-1.2,1.2),vy:rr(-.2,1.5),vz:dz*rr(.5,2)+rr(-1.2,1.2),life:rr(.5,1.1),s0:.2,s1:rr(.7,1.2),r:.5,g:.03,b:.03,a:.7,f:5,drag:3,lit:1});
    for(let i=0;i<16*n;i++)this.spawn({x,y,z,vx:dx*rr(1,5)+rr(-2,2),vy:rr(0,3.5),vz:dz*rr(1,5)+rr(-2,2),life:rr(.5,1),s0:.05,s1:.03,r:.45,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:Math.random()<.4?rr(.06,.12):0});
    const h=rayCast(x,y,z,dx,dy*.5-.1,dz,4);if(h)this.decal(x+dx*h.t,y+(dy*.5-.1)*h.t,z+dz*h.t,h.nx,h.ny,h.nz,rr(.5,.85),4+rint(0,2),[.65,.06,.04],.95);
    DL.add(x,y,z,'#ff2010',2.5,.5,.12)},
  // blood pooling under a body
  // ---- torn-off limbs: the rig's own mesh drawn with only the severed bones, thrown as a tumbling rigid body ----
  limbs:[],
  limb(a,key,dir,speed){const ch=a.ch,S=SEVER[key];if(!ch||!S||(ch.hide>>S.root&1))return null;
    const P=ch.A.piv,def=ch.A.def,W=ch.grp.matrixWorld;const com=key==='head'?def.headC:P[S.bones[1]];
    const R0=new THREE.Matrix4().multiplyMatrices(W,ch.M[S.root]).multiply(_gbT.makeTranslation(com[0]-P[S.root][0],com[1]-P[S.root][1],com[2]-P[S.root][2]));
    const inv=R0.clone().invert(),uB=[];
    for(let i=0;i<NB;i++){const m=new THREE.Matrix4();if(S.bones.includes(i))m.multiplyMatrices(inv,W).multiply(ch.uB[i]);else m.makeScale(0,0,0);uB.push(m)}
    const U=ch.mat.uniforms;const mat=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:ch.A.tex},uBones:{value:uB},uProbe:{value:U.uProbe.value.clone()},uFlash:{value:0},uTint:{value:new THREE.Vector4(0,0,0,0)},uEmisA:{value:U.uEmisA.value},
      uTexel:{value:U.uTexel.value},uBump:{value:U.uBump.value}},LU),vertexShader:VS_SKIN,fragmentShader:FS_CHAR,extensions:{derivatives:true}});
    const mesh=new THREE.Mesh(ch.A.geo,mat);mesh.matrixAutoUpdate=false;mesh.frustumCulled=false;mesh.layers.enable(1);mesh.userData.dm=depthMatS(uB);R.scene.add(mesh);
    const pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();R0.decompose(pos,q,sc);
    const o=def.o,half=key==='head'?.1:key[0]==='a'?(o.upper+o.fore+o.hand)/2:(o.thigh+P[8][1]-P[12][1])/2,thick=key==='head'?.1:key[0]==='a'?o.armW*.5:o.legW*.5;
    speed=speed||4;const L={mesh,mat,key,pos,q,v:new THREE.Vector3(dir[0]*speed+rr(-.6,.6)+(a.c.vx||0)*.5,(dir[1]||0)*speed+rr(1.8,3.6),dir[2]*speed+rr(-.6,.6)+(a.c.vz||0)*.5),
      w:new THREE.Vector3(rr(-9,9),rr(-6,6),rr(-9,9)),t:0,half,thick,rest:0,bleed:2.2,hits:0,probeT:0};
    this.limbs.push(L);if(this.limbs.length>10){const o2=this.limbs.shift();this.killLimb(o2)}
    // a burst of blood and scraps where it tore
    for(let i=0;i<16;i++)this.spawn({x:pos.x,y:pos.y,z:pos.z,vx:L.v.x*.4+rr(-1.6,1.6),vy:rr(.5,3.5),vz:L.v.z*.4+rr(-1.6,1.6),life:rr(.5,1),s0:.05,s1:.03,r:.45,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:Math.random()<.5?rr(.06,.13):0});
    for(let i=0;i<6;i++)this.spawn({x:pos.x,y:pos.y,z:pos.z,vx:rr(-.8,.8),vy:rr(-.2,1),vz:rr(-.8,.8),life:rr(.5,.9),s0:.15,s1:rr(.5,.8),r:.5,g:.03,b:.03,a:.6,f:5,drag:3,lit:1});
    return L},
  killLimb(L){R.scene.remove(L.mesh);L.mat.dispose();L.mesh.userData.dm.dispose()},
  clearLimbs(){for(const L of this.limbs)this.killLimb(L);this.limbs.length=0;this.emitters.length=0},
  updLimbs(dt){const Ls=this.limbs;for(let i=Ls.length-1;i>=0;i--){const L=Ls[i];L.t+=dt;
      if(L.t>45){L.pos.y-=dt*.06;if(L.t>48){this.killLimb(L);Ls.splice(i,1);continue}}
      else if(L.rest<1){const v=L.v,p=L.pos;v.y-=16*dt;const k=Math.exp(-.25*dt);v.x*=k;v.z*=k;
        const ox=p.x,oz=p.z;p.addScaledVector(v,dt);if(insideSolid(p.x,p.y,p.z)){p.x=ox;p.z=oz;v.x*=-.3;v.z*=-.3;L.w.multiplyScalar(.5)}
        // spin
        const w=L.w,wl=w.length();if(wl>1e-4){_gbq.setFromAxisAngle(_gbv.copy(w).multiplyScalar(1/wl),wl*dt);L.q.premultiply(_gbq).normalize()}
        // lowest point: the centre for a head, either end of a limb along its bone axis
        _gbv.set(0,1,0).applyQuaternion(L.q);const ey=Math.abs(_gbv.y)*L.half;const low=p.y-Math.max(L.thick,ey);
        const fl=floorBelow(p.x,p.y+.4,p.z,.05);
        if(low<fl){p.y+=fl-low;if(v.y<0)v.y*=-.25;v.x*=.6;v.z*=.6;w.multiplyScalar(.55);
          if(L.hits++<3){this.decal(p.x,fl,p.z,0,1,0,rr(.18,.32),4+((Math.random()*3)|0),[.5,.04,.03],.92);if(L.hits===1)AU.at('bodyfall',p.x,p.y,p.z,{vol:.5,range:20})}
          // settle: lay a limb flat along the floor, let a head roll to a stop
          if(Math.hypot(v.x,v.y,v.z)<.7){L.rest=Math.min(1,L.rest+dt*2.5);v.multiplyScalar(.8);w.multiplyScalar(.8);
            if(L.key!=='head'){_gbv.set(0,1,0).applyQuaternion(L.q);const hz=Math.hypot(_gbv.x,_gbv.z)||1e-3;_gbv2.set(_gbv.x/hz,0,_gbv.z/hz);_gbq.setFromUnitVectors(_gbv,_gbv2);_gbq2.identity().slerp(_gbq,Math.min(1,dt*6));L.q.premultiply(_gbq2).normalize()}}}
        // blood trail while it flies
        if(L.bleed>0){L.bleed-=dt;if(Math.random()<dt*30)this.spawn({x:p.x,y:p.y,z:p.z,vx:v.x*.2+rr(-.3,.3),vy:rr(-.2,.6),vz:v.z*.2+rr(-.3,.3),life:rr(.4,.8),s0:.04,s1:.025,r:.42,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:Math.random()<.3?rr(.05,.1):0})}}
      if((L.probeT-=dt)<=0){L.probeT=.3;sampleProbe(L.pos.x,L.pos.y+.2,L.pos.z,L.mat.uniforms.uProbe.value);L.mat.uniforms.uProbe.value.multiplyScalar(1.25)}
      L.mesh.matrix.compose(L.pos,L.q,_gb1);L.mesh.matrixWorldNeedsUpdate=true}},
  pool(x,y,z,s){const fl=floorBelow(x,y+.6,z,.05);if(fl<-50||y-fl>1.2)return;this.decal(x,fl,z,0,1,0,s||rr(.7,1.05),4+((Math.random()*3)|0),[.45,.03,.025],.93)},
  spore(x,y,z){for(let i=0;i<30;i++){const a=Math.random()*TAU,s=rr(1,6);this.spawn({x,y:y+.3,z,vx:Math.cos(a)*s,vy:rr(0,3),vz:Math.sin(a)*s,life:rr(.8,1.6),s0:.4,s1:1.6,r:.45,g:.55,b:.2,a:.55,f:3,drag:2})}
    this.spawn({x,y:y+.3,z,life:.3,s0:1,s1:6,r:.6,g:.8,b:.3,f:14,add:1});DL.add(x,y+.8,z,'#a0ff60',9,2,.5)},
  shell(x,y,z,dx,dz,big){this.spawn({x,y,z,vx:dx*rr(1.2,2)+rr(-.3,.3),vy:rr(1.4,2.4),vz:dz*rr(1.2,2)+rr(-.3,.3),life:1.4,s0:big?.035:.025,s1:big?.035:.025,r:.75,g:.6,b:.25,f:7,grav:11,col:.35})},
};
function texDecals(){return paint(128,128,P=>{
  for(let i=0;i<128*128*4;i+=4)P.D[i+3]=0;
  const F=(f,fn)=>{const ox=(f%4)*32,oy=Math.floor(f/4)*32;for(let y=0;y<32;y++)for(let x=0;x<32;x++){const r=fn((x-15.5)/2,(y-15.5)/2,x/2,y/2);if(!r)continue;const i=((oy+y)*128+ox+x)*4;P.D[i]=r[0];P.D[i+1]=r[1];P.D[i+2]=r[2];P.D[i+3]=r[3]}};
  const hole=(f,s)=>F(f,(x,y,X,Y)=>{const d=Math.hypot(x,y);if(d<1.6)return [8,8,8,255];if(d<2.6)return [30,28,26,230];if(d<5+hash2(X,Y,s)*2.5&&hash2(X,Y,s+1)<.55)return [60,58,54,140];return null});
  hole(0,1);F(1,(x,y,X,Y)=>{const d=Math.hypot(x,y);if(d<1.6)return [10,10,12,255];if(d<3)return [150,150,150,200];if(d<4.2)return [70,70,72,150];return null});
  F(2,(x,y,X,Y)=>{const d=Math.hypot(x*.7,y*1.3);if(d<1.6)return [12,8,6,255];if(d<4&&hash2(X,Y,3)<.6)return [120,90,60,180];return null});hole(3,7);
  const blood=(f,s)=>F(f,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7+(vnoise(X/2.2,Y/2.2,s,0)-.5)*.75;if(d<.85)return [255,255,255,d<.5?240:200];if(hash2(X,Y,s)<.06&&d<1.3)return [255,255,255,220];return null});
  blood(4,11);blood(5,12);blood(6,13);F(7,(x,y,X,Y)=>{const d=Math.hypot(x,y*.4)/7+(vnoise(X/2,Y/2,14,0)-.5)*.5;return d<.8||(Math.abs(x)<1&&y>0&&y<7)?[255,255,255,220]:null});
  F(8,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7.5+(vnoise(X/2,Y/2,15,0)-.5)*.5;return d<1?[10,8,6,clamp(255*(1-d)*1.4,0,230)|0]:null});
  F(9,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7.5+(vnoise(X/1.5,Y/1.5,16,0)-.5)*.4;return d<1?[220,240,255,clamp(220*(1-d*d),0,220)|0]:null});
  F(10,(x,y,X,Y)=>{const d=Math.hypot(x,y)/7.5+(vnoise(X/2,Y/2,17,0)-.5)*.6;return d<1?[110,140,50,clamp(200*(1-d),0,200)|0]:null});
})}

'use strict';
// ============ Renderer: world -> scene buffer (+ first-person layer) -> bloom -> post pass (FXAA, grade, overlays) -> screen ============
// Render scale is adaptive by default: full resolution with FXAA, stepping down (to chunky nearest-neighbour pixels) when frames run long.
const SCALE_STEPS=[1,.8,.66,.5,.4];
const R={renderer:null,scene:null,cam:null,vmScene:null,vmCam:null,rt:null,post:null,postCam:null,postMat:null,PU:null,
  scale:1,auto:true,lvl:0,w:0,h:0,fov:74,vmVisible:true,ok:false,bloom:true,ema:16,adaptT:0,goodT:0,
  init(canvas){
    let r;
    try{r=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',alpha:false,stencil:false,preserveDrawingBuffer:false})}catch(e){return false}
    r.setPixelRatio(1);r.autoClear=false;r.sortObjects=true;this.renderer=r;
    this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(this.fov,16/9,.04,240);this.cam.rotation.order='YXZ';
    this.vmScene=new THREE.Scene();this.vmCam=new THREE.PerspectiveCamera(56,16/9,.01,10);
    const lin={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,depthBuffer:false,stencilBuffer:false,generateMipmaps:false};
    this.bA=new THREE.WebGLRenderTarget(4,4,lin);this.bB=new THREE.WebGLRenderTarget(4,4,lin);this.bC=new THREE.WebGLRenderTarget(4,4,lin);this.bD=new THREE.WebGLRenderTarget(4,4,lin);
    const PU=this.PU={tDiffuse:{value:null},tBloom:{value:this.bA.texture},tBloom2:{value:this.bC.texture},uBloom:{value:1},uFxaa:{value:1},uRes:{value:new THREE.Vector2(4,4)},uTime:LU.uTime,uNV:{value:0},uDmg:{value:0},uWhite:{value:0},uInfect:{value:0},uFrost:{value:0},uZ:{value:0},uDeath:{value:0},uGamma:{value:1},uBeam:{value:0}};
    this.postMat=new THREE.ShaderMaterial({uniforms:PU,vertexShader:VS_POST,fragmentShader:FS_POST,depthTest:false,depthWrite:false});
    this.post=new THREE.Scene();const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.postMat);q.frustumCulled=false;this.post.add(q);
    this.mBright=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},uTexel:{value:new THREE.Vector2()},uThr:{value:.74}},vertexShader:VS_POST,fragmentShader:FS_BRIGHT,depthTest:false,depthWrite:false});
    this.mBlur=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},uDir:{value:new THREE.Vector2()}},vertexShader:VS_POST,fragmentShader:FS_BLUR,depthTest:false,depthWrite:false});
    this.qScene=new THREE.Scene();this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.mBlur);this.quad.frustumCulled=false;this.qScene.add(this.quad);
    this.postCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.resize();addEventListener('resize',()=>this.resize());this.ok=true;return true},
  setScale(s){if(s==='auto'){this.auto=true;this.scale=SCALE_STEPS[this.lvl]}else{this.auto=false;this.scale=+s||1}this.resize()},
  // the scene buffer: bilinear + FXAA near native size, nearest (deliberate pixels) when it is much smaller than the screen
  makeRT(rw,rh){const smooth=this.scale>=.6;const f=smooth?THREE.LinearFilter:THREE.NearestFilter;
    if(this.rt&&this.rt.width===rw&&this.rt.height===rh&&this.rt.texture.magFilter===f)return;if(this.rt)this.rt.dispose();
    this.rt=new THREE.WebGLRenderTarget(rw,rh,{minFilter:f,magFilter:f,depthBuffer:true,stencilBuffer:false,generateMipmaps:false});this.PU.tDiffuse.value=this.rt.texture;this.PU.uFxaa.value=smooth?1:0},
  resize(){if(!this.renderer)return;const w=Math.max(320,innerWidth),h=Math.max(200,innerHeight);this.w=w;this.h=h;
    // above 100% the canvas itself gets more pixels (up to the device pixel ratio), so phones and retina screens show native detail
    const pr=this.scale>1?Math.min(this.scale,Math.max(1,window.devicePixelRatio||1)):1;if(this.renderer.getPixelRatio()!==pr)this.renderer.setPixelRatio(pr);this.renderer.setSize(w,h,false);
    const rh=Math.max(180,Math.round(h*this.scale)),rw=Math.max(240,Math.round(rh*w/h));this.makeRT(rw,rh);this.PU.uRes.value.set(rw,rh);
    const bw=Math.max(16,Math.round(w/4)),bh=Math.max(16,Math.round(h/4));this.bA.setSize(bw,bh);this.bB.setSize(bw,bh);this.bC.setSize(Math.max(8,bw>>1),Math.max(8,bh>>1));this.bD.setSize(Math.max(8,bw>>1),Math.max(8,bh>>1));
    this.cam.aspect=w/h;this.cam.updateProjectionMatrix();this.vmCam.aspect=w/h;this.vmCam.updateProjectionMatrix()},
  setFov(v){this.fov=v;this.cam.fov=v;this.cam.updateProjectionMatrix()},
  // adaptive resolution: drop a step after sustained slow frames; climb back only after a long good stretch,
  // and wait longer each time a level has failed, so the scale never oscillates (a 60 Hz cap reads as "good")
  badT:0,cool:[],lockT:[],
  adapt(dtMs){if(!this.auto)return;const s=dtMs/1000;this.ema=lerp(this.ema,Math.min(dtMs,60),.05);this.adaptT+=s;if(this.adaptT<3)return;
    if(this.ema>24){this.badT+=s;this.goodT=0}else{this.badT=0;this.goodT=this.ema<18?this.goodT+s:0}
    const now=performance.now();
    if(this.badT>1.5&&this.lvl<SCALE_STEPS.length-1){const l=this.lvl;this.cool[l]=(this.cool[l]||20)*2;this.lockT[l]=now+this.cool[l]*1000;this.lvl++;this.scale=SCALE_STEPS[this.lvl];this.resize();this.badT=0;this.ema=18}
    else if(this.goodT>8&&this.lvl>0&&now>(this.lockT[this.lvl-1]||0)){this.lvl--;this.scale=SCALE_STEPS[this.lvl];this.resize();this.goodT=0}},
  pass(mat,src,dst){this.quad.material=mat;mat.uniforms.tDiffuse.value=src.texture;this.renderer.setRenderTarget(dst);this.renderer.render(this.qScene,this.postCam)},
  blur(src,tmp){this.mBlur.uniforms.uDir.value.set(1/src.width,0);this.pass(this.mBlur,src,tmp);this.mBlur.uniforms.uDir.value.set(0,1/tmp.height);this.pass(this.mBlur,tmp,src)},
  // ---- flashlight shadows: world, bodies and torn limbs drawn from the lamp into packed linear depth (layer 1 = casters) ----
  shadowsOn:true,sh:null,
  renderShadow(){const r=this.renderer,K=LU.uSpotK.value,on=this.shadowsOn&&K.w>0;LU.uShOn.value=on?1:0;if(!on)return;
    let S=this.sh;if(!S){S=this.sh={rt:new THREE.WebGLRenderTarget(1024,1024,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:true,stencilBuffer:false,generateMipmaps:false}),
        cam:new THREE.PerspectiveCamera(68,1,.06,26),t:new THREE.Vector3(),sw:[]};S.cam.layers.set(1);LU.uShMap.value=S.rt.texture;LU.uShTexel.value.set(1/1024,1/1024)}
    const cam=S.cam,D=LU.uSpotD.value;cam.position.copy(LU.uSpotP.value);cam.up.set(0,1,0);if(Math.abs(D.y)>.98)cam.up.set(0,0,1);cam.lookAt(S.t.copy(cam.position).add(D));
    cam.far=K.z;cam.fov=Math.acos(clamp(K.x,.3,.999))*2*57.3+8;cam.updateProjectionMatrix();cam.updateMatrixWorld();
    SHU.uLP.value.copy(cam.position);SHU.uFar.value=cam.far;LU.uShM.value.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);
    const sw=S.sw;sw.length=0;const swap=(m,dm)=>{sw.push(m,m.material);m.material=dm};
    for(const m of MAP.meshes){if(!m.userData.dm){m.userData.dm=depthMatW(m.material);m.layers.enable(1)}swap(m,m.userData.dm)}
    for(const a of G.actors){const ch=a.ch;if(!ch||!ch.grp.visible)continue;if(!ch.dm)ch.dm=depthMatS(ch.uB);swap(ch.mesh,ch.dm)}
    for(const L of FX.limbs)swap(L.mesh,L.mesh.userData.dm);
    r.setRenderTarget(S.rt);r.setClearColor(0xffffff,1);r.clear(true,true,false);r.render(this.scene,cam);
    for(let i=0;i<sw.length;i+=2)sw[i].material=sw[i+1]},
  render(){const r=this.renderer;if(MAP.sky)MAP.sky.position.copy(this.cam.position);
    this.renderShadow();
    r.setRenderTarget(this.rt);r.setClearColor(LU.uFogC.value,1);r.clear(true,true,false);r.render(this.scene,this.cam);
    if(this.vmVisible&&this.vmScene.children.length){r.clearDepth();r.render(this.vmScene,this.vmCam)}
    if(this.bloom){this.mBright.uniforms.uTexel.value.set(1/this.rt.width,1/this.rt.height);this.pass(this.mBright,this.rt,this.bA);this.blur(this.bA,this.bB);
      // a wider, softer second level from the first
      this.mBlur.uniforms.uDir.value.set(1/this.bA.width,0);this.pass(this.mBlur,this.bA,this.bC);this.mBlur.uniforms.uDir.value.set(0,1/this.bC.height);this.pass(this.mBlur,this.bC,this.bD);
      this.mBlur.uniforms.uDir.value.set(2/this.bD.width,0);this.pass(this.mBlur,this.bD,this.bC);this.PU.uBloom.value=1}
    else this.PU.uBloom.value=0;
    r.setRenderTarget(null);r.render(this.post,this.postCam)},
};

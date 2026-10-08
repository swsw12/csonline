'use strict';
// ============ Materials: baked vertex light + flashlight + a few dynamic point lights + exp2 fog ============
// All lit materials share one uniform block, so moving the flashlight or a muzzle flash updates everything at once.
const LU={
  uFogC:{value:new THREE.Color('#0a0c12')},uFogD:{value:.045},
  uSpotP:{value:new THREE.Vector3()},uSpotD:{value:new THREE.Vector3(0,0,-1)},uSpotK:{value:new THREE.Vector4(.86,.97,26,0)},uSpotC:{value:new THREE.Color('#fff2d8')},
  uPL:{value:[0,1,2,3].map(()=>new THREE.Vector4(0,-99,0,1))},uPLc:{value:[0,1,2,3].map(()=>new THREE.Color(0,0,0))},
  uAmb:{value:1},uTime:{value:0},uLamp:{value:1},// uLamp: lit windows, signs and lamps (0 in a blackout)
  // flashlight shadow map: packed linear distance from the lamp, its view-projection, on/off, texel size
  uShMap:{value:null},uShM:{value:new THREE.Matrix4()},uShOn:{value:0},uShTexel:{value:new THREE.Vector2(1/1024,1/1024)},
};
const GLSL_DYN=`
uniform vec3 uSpotP;uniform vec3 uSpotD;uniform vec4 uSpotK;uniform vec3 uSpotC;uniform vec4 uPL[4];uniform vec3 uPLc[4];uniform vec3 uFogC;uniform float uFogD;uniform float uAmb;
uniform sampler2D uShMap;uniform mat4 uShM;uniform float uShOn;uniform vec2 uShTexel;
float gSh=1.;// flashlight visibility of the current fragment (dynLight computes it, dynSpec reuses it)
float unpackD(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float spotShadow(vec3 p,vec3 n,float d){if(uShOn<.5)return 1.;vec4 q=uShM*vec4(p+n*(.015+.004*d),1.);if(q.w<=.01)return 1.;vec2 uv=q.xy/q.w*.5+.5;
  if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)return 1.;float z=d/uSpotK.z-.0015-.0004*d;vec2 o=uShTexel*1.25;
  float s=step(z,unpackD(texture2D(uShMap,uv)))*2.+step(z,unpackD(texture2D(uShMap,uv+vec2(o.x,o.y))))+step(z,unpackD(texture2D(uShMap,uv+vec2(-o.x,o.y))))
    +step(z,unpackD(texture2D(uShMap,uv+vec2(o.x,-o.y))))+step(z,unpackD(texture2D(uShMap,uv+vec2(-o.x,-o.y))));return s/6.;}
vec3 dynLight(vec3 p,vec3 n){vec3 acc=vec3(0.);gSh=1.;
  if(uSpotK.w>0.){vec3 L=uSpotP-p;float d=max(length(L),.001);L/=d;float cs=dot(-L,uSpotD);float sp=smoothstep(uSpotK.x,uSpotK.y,cs);
    sp*=.55+.45*smoothstep(uSpotK.y,1.,cs)+.12*sin(cs*180.);float at=clamp(1.-d/uSpotK.z,0.,1.);at*=at*mix(.42,1.,smoothstep(.4,4.5,d));
    if(sp*at>0.){gSh=spotShadow(p,n,d);acc+=uSpotC*(sp*at*uSpotK.w*gSh)*(max(dot(n,L),0.)*.85+.15);}}
  for(int i=0;i<4;i++){vec3 l=uPL[i].xyz-p;float dd=max(length(l),.001);float a=clamp(1.-dd/uPL[i].w,0.,1.);a*=a;acc+=uPLc[i]*a*(max(dot(n,l/dd),0.)*.85+.15);}
  return acc;}
// Blinn-Phong highlights from the flashlight and the dynamic point lights (wet gore, plates, rubber); pw = shininess
vec3 dynSpec(vec3 p,vec3 n,vec3 v,float pw){vec3 acc=vec3(0.);
  if(uSpotK.w>0.){vec3 L=uSpotP-p;float d=max(length(L),.001);L/=d;float cs=dot(-L,uSpotD);float sp=smoothstep(uSpotK.x,uSpotK.y,cs);float at=clamp(1.-d/uSpotK.z,0.,1.);at*=at*mix(.42,1.,smoothstep(.4,4.5,d));
    acc+=uSpotC*(sp*at*uSpotK.w*gSh)*pow(max(dot(n,normalize(L+v)),0.),pw)*step(0.,dot(n,L));}
  for(int i=0;i<4;i++){vec3 l=uPL[i].xyz-p;float dd=max(length(l),.001);l/=dd;float a=clamp(1.-dd/uPL[i].w,0.,1.);a*=a;acc+=uPLc[i]*a*pow(max(dot(n,normalize(l+v)),0.),pw)*step(0.,dot(n,l));}
  return acc*(pw+8.)/25.;}
vec3 applyFog(vec3 c,vec3 p){float d=length(p-cameraPosition);float f=1.-exp(-uFogD*uFogD*d*d);return mix(c,uFogC,f);}`;
// relief from the painted albedo: the texel gradient of luminance tilts the normal through a screen-space cotangent frame (no tangents needed).
// g = height difference to the next texel in +u and +v. Fades out once texels shrink below ~1.5 px so distant surfaces do not shimmer. Needs derivatives.
const GLSL_BUMP=`
const vec3 LWB=vec3(.3,.59,.11);
vec3 perturb(vec3 n,vec3 p,vec2 uv,vec2 g,vec2 texel){vec3 dp1=dFdx(p),dp2=dFdy(p);vec2 du1=dFdx(uv),du2=dFdy(uv);
  vec3 d2=cross(dp2,n),d1=cross(n,dp1);vec3 T=d2*du1.x+d1*du2.x,B=d2*du1.y+d1*du2.y;float s=inversesqrt(max(max(dot(T,T),dot(B,B)),1e-24));
  float tpp=max(length(du1)/texel.x,length(du2)/texel.y);g*=clamp(1.6-tpp,0.,1.);
  return normalize(n-(g.x*T+g.y*B)*s);}`;
const VS_WORLD=`varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vUv=uv;
#ifdef USE_COLOR
vCol=color;
#else
vCol=vec3(1.);
#endif
vec4 wp=modelMatrix*vec4(position,1.);vPos=wp.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*wp;}`;
const FS_WORLD=GLSL_DYN+`uniform sampler2D map;uniform float uEmis;uniform float uLamp;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;vec3 n=normalize(vN);vec3 lig=vCol*uAmb+dynLight(vPos,n);
  vec3 c=t.rgb*lig+t.rgb*uEmis*uLamp;gl_FragColor=vec4(applyFog(c,vPos),1.);}`;
function matWorld(tex,o){o=o||{};return new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:tex},uEmis:{value:o.emis||0}},LU),vertexShader:VS_WORLD,fragmentShader:FS_WORLD,vertexColors:o.vc!==false,side:o.side||THREE.FrontSide,transparent:false})}
// characters / props: light probe (sampled from the baked light grid) instead of vertex light, hit flash and status tint
const FS_CHAR=GLSL_DYN+GLSL_BUMP+`uniform sampler2D map;uniform vec3 uProbe;uniform float uFlash;uniform vec4 uTint;uniform float uEmisA;uniform vec2 uTexel;uniform float uBump;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;vec3 n=normalize(vN);
  if(uTint.a<0.){float hn=fract(sin(dot(floor(gl_FragCoord.xy*.5),vec2(12.9898,78.233)))*43758.5453);if(hn< -uTint.a)discard;}
  float a8=t.a*255.;float gl=(a8>239.5&&a8<254.5)?(a8-239.)/15.:0.;
  if(uBump>0.){float h0=dot(t.rgb,LWB);vec2 g=vec2(dot(texture2D(map,vUv+vec2(uTexel.x,0.)).rgb,LWB)-h0,dot(texture2D(map,vUv+vec2(0.,uTexel.y)).rgb,LWB)-h0);
    n=perturb(n,vPos,vUv,g*uBump*(1.+gl*1.5),uTexel);}
  float form=.62+.38*clamp(n.y*.5+.5,0.,1.)+.12*max(dot(n,normalize(vec3(-.4,.6,.5))),0.);
  vec3 lig=uProbe*form*uAmb*vCol.x+dynLight(vPos,n)*(.6+.4*vCol.x);vec3 c=t.rgb*lig;// vCol.x = baked occlusion (1 for props)
  // atlas alpha 240..254 = surface gloss (skin < rubber < plate < wet flesh and blood): highlights from the flashlight, lamps and the sky
  if(gl>0.){vec3 v=normalize(cameraPosition-vPos);float pw=mix(12.,80.,gl);float fr=1.-max(dot(n,v),0.);fr*=fr*fr;
    vec3 sp=dynSpec(vPos,n,v,pw)*.55+uProbe*uAmb*(pow(max(dot(n,normalize(vec3(-.3,.9,.3)+v)),0.),pw)*(pw+8.)/60.+fr*.3);
    c+=sp*gl*mix(vec3(1.),t.rgb*1.4+.25,.4);}
  // highlights roll off instead of clipping, so a flashlight up close keeps the gore readable
  vec3 sh=max(c-.66,0.);c=min(c,.66)+.34*(1.-exp(-sh/.34));
  // texels painted with alpha 232 are glowing (eyes, lamps, veins) and keep their colour in the dark
  if(t.a<.935)c=max(c,t.rgb*uEmisA);
  c=mix(c,uTint.rgb,uTint.a<0.?.65:uTint.a);c=mix(c,vec3(1.),uFlash);gl_FragColor=vec4(applyFog(c,vPos),1.);}`;
function matChar(tex){return new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:tex},uProbe:{value:new THREE.Color(.5,.5,.55)},uFlash:{value:0},uTint:{value:new THREE.Vector4(0,0,0,0)},uEmisA:{value:1},
  uTexel:{value:new THREE.Vector2(1/tex.image.width,1/tex.image.height)},uBump:{value:0}},LU),vertexShader:VS_WORLD,fragmentShader:FS_CHAR,vertexColors:false,extensions:{derivatives:true}})}
// shadow pass: packed linear distance from the flashlight (world meshes alpha-test their texture; skinned characters use VS_SKIN)
const FS_DEPTH=`uniform vec3 uLP;uniform float uFar;uniform sampler2D map;uniform float uAT;varying vec3 vPos;varying vec2 vUv;
vec4 packD(float v){vec4 r=fract(vec4(1.,255.,65025.,16581375.)*v);r-=r.yzww*vec4(1./255.,1./255.,1./255.,0.);return r;}
void main(){if(uAT>0.&&texture2D(map,vUv).a<.5)discard;gl_FragColor=packD(clamp(length(vPos-uLP)/uFar,0.,.9999));}`;
const SHU={uLP:{value:new THREE.Vector3()},uFar:{value:26}};
function depthMatW(src){const m=src.uniforms&&src.uniforms.map&&src.uniforms.map.value;return new THREE.ShaderMaterial({uniforms:{uLP:SHU.uLP,uFar:SHU.uFar,map:{value:m},uAT:{value:m?1:0}},vertexShader:VS_WORLD,fragmentShader:FS_DEPTH,side:THREE.DoubleSide})}
// first-person weapon: lit by the probe at the player plus the flashlight pointing straight ahead
const FS_VM=`uniform sampler2D map;uniform vec3 uProbe;uniform float uSpot;uniform vec3 uMuzzle;uniform float uAmbV;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;vec3 n=normalize(vN);
  float key=max(dot(n,normalize(vec3(.35,.8,.6))),0.);float rim=pow(1.-max(n.z,0.),2.)*.25;
  vec3 lig=uProbe*(.55+.55*key)*uAmbV+vec3(1.,.95,.85)*uSpot*(.25+.55*max(n.z,0.)+.3*max(n.y,0.))+uMuzzle*(.6+.4*max(-n.z,0.)+.3*max(n.y,0.))+rim*uProbe;
  vec3 c=t.rgb*lig;
  // unsaturated mid/high texels read as bare metal: give them a sheen from the key light, the flashlight and muzzle flashes
  float lum=dot(t.rgb,vec3(.3,.59,.11)),sat=max(t.r,max(t.g,t.b))-min(t.r,min(t.g,t.b));float metal=smoothstep(.1,.32,lum)*(1.-smoothstep(.04,.16,sat));
  vec3 H=normalize(normalize(vec3(.35,.8,.6))+vec3(0.,0.,1.));float sp=pow(max(dot(n,H),0.),22.)*(.35+.65*metal);
  c+=(uProbe*1.1+vec3(1.,.95,.85)*uSpot*.6+uMuzzle*.7)*sp*(.12+.55*metal);
  if(t.a<.97)c=max(c,t.rgb);gl_FragColor=vec4(c,1.);}`;
function matVM(tex,U){return new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:tex}},U),vertexShader:VS_WORLD,fragmentShader:FS_VM,vertexColors:false})}
// sky dome
const FS_SKY=`uniform sampler2D map;uniform float uAmb;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;uniform float uFlashSky;
void main(){vec3 c=texture2D(map,vUv).rgb*(.9+.1*uAmb)+vec3(.55,.6,.8)*uFlashSky*(1.-vUv.y);gl_FragColor=vec4(c,1.);}`;
// billboard particles: point sprites from a texture atlas (4x4 frames), per-point size/colour/alpha/frame
const VS_PT=`attribute float aSize;attribute vec4 aCol;attribute float aFrame;uniform float uScale;varying vec4 vC;varying float vF;varying float vFog;uniform float uFogD;
void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float d=-mv.z;gl_PointSize=aSize*uScale/max(d,.05);vC=aCol;vF=aFrame;vFog=1.-exp(-uFogD*uFogD*d*d);}`;
const FS_PT=`uniform sampler2D map;uniform vec3 uFogC;uniform float uAdd;varying vec4 vC;varying float vF;varying float vFog;
void main(){vec2 uv=gl_PointCoord;uv.y=1.-uv.y;float fx=mod(vF,4.),fy=floor(vF/4.);vec4 t=texture2D(map,(vec2(fx,3.-fy)+uv)/4.);float a=t.a*vC.a;if(a<.02)discard;
  vec3 c=t.rgb*vC.rgb;if(uAdd>.5){gl_FragColor=vec4(c*a*(1.-vFog),1.);}else{gl_FragColor=vec4(mix(c,uFogC,vFog),a);}}`;
function matPoints(tex,additive){return new THREE.ShaderMaterial({uniforms:{map:{value:tex},uScale:{value:300},uFogC:LU.uFogC,uFogD:LU.uFogD,uAdd:{value:additive?1:0}},vertexShader:VS_PT,fragmentShader:FS_PT,
  transparent:true,depthWrite:false,blending:additive?THREE.CustomBlending:THREE.NormalBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.OneFactor,blendDst:additive?THREE.OneFactor:THREE.OneMinusSrcAlphaFactor})}
// ---------- post: low-res buffer -> grade, night vision, damage/frost/infection overlays, dither -> screen ----------
const VS_POST=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const FS_POST=`uniform sampler2D tDiffuse;uniform sampler2D tBloom;uniform sampler2D tBloom2;uniform float uBloom;uniform float uFxaa;uniform vec2 uRes;uniform float uTime;uniform float uNV;uniform float uDmg;uniform float uWhite;uniform float uInfect;uniform float uFrost;uniform float uZ;uniform float uDeath;uniform float uGamma;uniform float uBeam;varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
const vec3 LW=vec3(.299,.587,.114);
// FXAA (Lottes, console variant): only used when the scene buffer is close to screen resolution
vec3 fxaa(vec2 uv,vec2 px){vec3 nw=texture2D(tDiffuse,uv+vec2(-1.,-1.)*px).rgb,ne=texture2D(tDiffuse,uv+vec2(1.,-1.)*px).rgb,sw=texture2D(tDiffuse,uv+vec2(-1.,1.)*px).rgb,se=texture2D(tDiffuse,uv+vec2(1.,1.)*px).rgb,m=texture2D(tDiffuse,uv).rgb;
  float lNW=dot(nw,LW),lNE=dot(ne,LW),lSW=dot(sw,LW),lSE=dot(se,LW),lM=dot(m,LW);float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))),lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));
  if(lMax-lMin<max(.03,lMax*.1))return m;
  vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));float dr=max((lNW+lNE+lSW+lSE)*.03125,1./128.);float rcp=1./(min(abs(dir.x),abs(dir.y))+dr);
  dir=clamp(dir*rcp,vec2(-8.),vec2(8.))*px;
  vec3 A=.5*(texture2D(tDiffuse,uv+dir*(1./3.-.5)).rgb+texture2D(tDiffuse,uv+dir*(2./3.-.5)).rgb);vec3 B=A*.5+.25*(texture2D(tDiffuse,uv-dir*.5).rgb+texture2D(tDiffuse,uv+dir*.5).rgb);
  float lB=dot(B,LW);return (lB<lMin||lB>lMax)?A:B;}
void main(){vec2 uv=vUv;vec3 c=uFxaa>.5?fxaa(uv,1./uRes):texture2D(tDiffuse,uv).rgb;
  if(uInfect>0.){vec2 o=(uv-.5)*.03*uInfect*uInfect;c.r=texture2D(tDiffuse,uv+o).r;c.b=texture2D(tDiffuse,uv-o).b;}// infection: the picture tears apart
  vec3 bl=texture2D(tBloom,uv).rgb*.75+texture2D(tBloom2,uv).rgb*.9;c+=bl*uBloom;
  // flashlight haze: a cone of lit air from the lamp (bottom right) toward the aim point, softer and wider near the eye
  if(uBeam>0.){vec2 a=vec2(.78,-.25),b=vec2(.5,.5);vec2 ab=b-a;float t=clamp(dot(uv-a,ab)/dot(ab,ab),0.,1.);vec2 d=(uv-(a+ab*t))*vec2(uRes.x/uRes.y,1.);
    float w=mix(.2,.07,t);float hz=exp(-dot(d,d)/(w*w))*mix(.35,1.,t)+exp(-dot((uv-b)*vec2(uRes.x/uRes.y,1.),(uv-b)*vec2(uRes.x/uRes.y,1.))/.05)*.6;
    c+=vec3(1.,.94,.8)*hz*uBeam*.12*(1.-clamp(dot(c,vec3(.33))*1.5,0.,.8));}
  c=c/(1.+c*.18);c=pow(max(c,0.),vec3(uGamma));
  float l=dot(c,LW);
  c=mix(vec3(l),c,1.06);c=mix(c,c*vec3(.94,1.,1.08),.35*(1.-l));
  if(uNV>0.){float nl=pow(clamp(l*3.2+.06,0.,1.),.75);nl+=(h(uv*uRes+uTime*61.)-.5)*.14;float sc=.92+.08*sin(uv.y*uRes.y*1.6);vec3 g=vec3(.2,1.,.35)*nl*sc;c=mix(c,g,uNV);}
  if(uZ>0.){c=mix(c,vec3(l*1.3,l*.55,l*.45)+vec3(.05,0.,0.),uZ*.55);}
  vec2 q=uv-.5;float r=dot(q,q);c*=1.-r*.9;
  c=mix(c,vec3(.55,0.,0.),uDmg*smoothstep(.08,.5,r));
  c=mix(c,vec3(.75,.9,1.),uFrost*smoothstep(.05,.45,r)*.8);
  // infection: a red flash, then the colour drains to blood red while dark veins creep in from the edges, pulsing with the heartbeat
  if(uInfect>0.){float k=uInfect;vec2 p=q*vec2(uRes.x/uRes.y,1.);float an=atan(p.y,p.x),rd=length(p);
    float v1=sin(an*9.+sin(an*23.+rd*14.)*1.4+rd*7.)*.5+.5,v2=sin(an*17.-rd*22.+sin(an*5.+rd*9.)*3.)*.5+.5;
    float vein=smoothstep(.9,.995,v1)+smoothstep(.93,.998,v2)*.75;float reach=smoothstep(.95-.55*k,1.05-.3*k,rd*1.35);float beat=.7+.3*sin(uTime*8.5);
    c=mix(c,vec3(dot(c,LW))*vec3(1.15,.32,.28),.65*k);
    c=mix(c,vec3(.22,0.,.02),clamp(vein*reach,0.,1.)*k*beat);
    c=mix(c,vec3(.42,.01,.01),smoothstep(.12,.55,r)*.75*k*beat);
    c=mix(c,vec3(.65,.06,.03)+c*.3,smoothstep(.8,1.,k)*.85);}
  c=mix(c,vec3(1.),uWhite);
  c*=1.-uDeath*.75;
  c+=(h(uv*uRes+fract(uTime)*7.)-.5)/80.;
  gl_FragColor=vec4(c,1.);}`;
// bloom: bright pass (max channel, soft knee) while downsampling, then separable 9-tap gaussian (5 linear taps)
const FS_BRIGHT=`uniform sampler2D tDiffuse;uniform vec2 uTexel;uniform float uThr;varying vec2 vUv;
vec3 bp(vec2 o){vec3 c=texture2D(tDiffuse,vUv+o*uTexel).rgb;float l=max(c.r,max(c.g,c.b));return c*smoothstep(uThr,uThr+.3,l);}
void main(){vec3 c=bp(vec2(-1.,-1.))+bp(vec2(1.,-1.))+bp(vec2(-1.,1.))+bp(vec2(1.,1.))+bp(vec2(0.));gl_FragColor=vec4(c*.2,1.);}`;
const FS_BLUR=`uniform sampler2D tDiffuse;uniform vec2 uDir;varying vec2 vUv;
void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.227;c+=(texture2D(tDiffuse,vUv+uDir*1.385).rgb+texture2D(tDiffuse,vUv-uDir*1.385).rgb)*.316;
  c+=(texture2D(tDiffuse,vUv+uDir*3.231).rgb+texture2D(tDiffuse,vUv-uDir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}`;

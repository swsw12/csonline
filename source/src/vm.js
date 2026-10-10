'use strict';
// ============ First-person view model ============
// Rest pose per weapon, a spring layer (look sway, strafe tilt, recoil, landings, sprint carry) and keyframed actions
// (draws, slashes, chops, throws, reloads) on top. Melee swings leave a fading motion trail and roll the camera with the stroke.
const VM_POS={
  rifle:{p:[.15,-.16,-.36],r:[0,.085,.035]},pistol:{p:[.12,-.135,-.37],r:[0,.07,.02]},dual:{p:[0,-.155,-.4],r:[0,0,0]},
  knife:{p:[.16,-.17,-.33],r:[.15,.25,-.15]},axe:{p:[.22,-.31,-.36],r:[.5,-.35,2.75]},hammer:{p:[.2,-.5,-.48],r:[1.2,.05,1.57]},hammerB:{p:[.2,-.34,-.32],r:[.45,.42,.3]},nade:{p:[.15,-.16,-.32],r:[.1,.15,0]},zbomb:{p:[.19,-.14,-.4],r:[-.5,2.45,.12]},claw:{p:[0,0,0],r:[0,0,0]},
  d50:{p:[.12,-.14,-.38],r:[0,.07,.02]},r6:{p:[.12,-.14,-.37],r:[0,.07,.02]},
  k5:{p:[.14,-.15,-.33],r:[0,.08,.03]},k9:{p:[.14,-.155,-.33],r:[0,.08,.03]},um45:{p:[.14,-.155,-.34],r:[0,.08,.03]},pd50:{p:[.14,-.16,-.33],r:[0,.08,.03]},
  sg8:{p:[.15,-.165,-.37],r:[0,.08,.035]},as12:{p:[.155,-.17,-.38],r:[0,.08,.035]},m14:{p:[.15,-.165,-.37],r:[0,.08,.035]},db2:{p:[.15,-.165,-.36],r:[0,.08,.035]},
  ar5c:{p:[.15,-.165,-.36],r:[0,.085,.035]},hr17:{p:[.15,-.17,-.36],r:[0,.085,.035]},br3:{p:[.15,-.16,-.31],r:[0,.085,.035]},
  r700:{p:[.145,-.165,-.38],r:[0,.075,.03]},sr8:{p:[.145,-.16,-.37],r:[0,.075,.03]},dm14:{p:[.145,-.165,-.38],r:[0,.075,.03]},
  hmg:{p:[.16,-.19,-.42],r:[0,.08,.035]},mg6:{p:[.16,-.185,-.41],r:[0,.08,.035]},gx6:{p:[.19,-.235,-.43],r:[0,.07,.03]},gl40:{p:[.15,-.17,-.37],r:[0,.08,.035]},airb:{p:[.15,-.18,-.36],r:[0,.08,.035]}};
// recoil impulses: [push back m/s, pitch rad/s, random roll rad/s]
function vmKick(W){if(W.flame)return [.1,.16,.18];if(W.spin)return [.16,.25,.25];if(W.kind==='shotgun'||W.kind==='special')return [1.05,2.4,.7];if(W.kind==='sniper')return [.95,2.1,.5];if(W.kind==='pistol')return [.42,1.7,.45];if(W.kind==='mg')return [.5,.75,.4];return [.42,.6,.3]}
// keyframed first-person actions: [t, [x,y,z, rx,ry,rz]] offsets from the rest pose
const VMK={
  // knife: forehand slash right-to-left, rising backhand, heavy stab (hold, then a straight thrust)
  knA:[[0,[0,0,0,0,0,0]],[.16,[.08,.06,-.01,.28,.5,-.3]],[.27,[.06,.05,-.02,.2,.36,-.18]],[.4,[-.12,.07,-.14,-.02,-.5,.45]],[.52,[-.26,-.02,-.06,-.25,-1,.7]],[.72,[-.1,-.01,0,-.1,-.4,.28]],[1,[0,0,0,0,0,0]]],
  knB:[[0,[0,0,0,0,0,0]],[.16,[-.14,-.04,.03,-.15,-.7,.45]],[.27,[-.11,-.02,-.02,-.08,-.48,.3]],[.4,[.04,.08,-.14,.15,.45,-.35]],[.52,[.14,.12,-.05,.32,.9,-.6]],[.72,[.05,.04,0,.1,.32,-.2]],[1,[0,0,0,0,0,0]]],
  knH:[[0,[0,0,0,0,0,0]],[.28,[.03,.05,.13,.42,.12,-.18]],[.36,[.025,.045,.12,.4,.11,-.16]],[.46,[-.06,.07,-.3,-.08,-.08,.08]],[.6,[-.06,.06,-.32,-.1,-.08,.08]],[.8,[-.015,.01,-.08,-.03,0,.02]],[1,[0,0,0,0,0,0]]],
  // fire axe: wind up over the shoulder, chop through, settle; heavy = bigger arc and a longer hold at the top
  axA:[[0,[0,0,0,0,0,0]],[.25,[.08,.1,0,.65,-.3,.2]],[.33,[.08,.105,-.01,.68,-.3,.2]],[.45,[-.04,.05,-.12,-.05,.35,-.25]],[.56,[-.1,-.03,-.1,-.45,.6,-.4]],[.78,[-.03,-.01,-.02,-.1,.15,-.1]],[1,[0,0,0,0,0,0]]],
  axH:[[0,[0,0,0,0,0,0]],[.35,[.1,.15,0,.9,-.3,.15]],[.45,[.1,.145,-.01,.87,-.3,.15]],[.56,[-.04,.06,-.14,0,.3,-.1]],[.68,[-.08,-.06,-.12,-.55,.45,-.15]],[.85,[-.02,-.02,-.03,-.15,.1,-.05]],[1,[0,0,0,0,0,0]]],
  // sledge: light = a diagonal sweep from over the right shoulder down to the left; heavy = lift it high, hang, slam straight down
  hmA:[[0,[0,0,0,0,0,0]],[.3,[.1,.1,-.04,.34,-.4,.2]],[.4,[.11,.11,-.04,.36,-.42,.21]],[.5,[.02,.02,-.1,-.15,.2,-.1]],[.6,[-.16,-.12,-.08,-.7,.75,-.35]],[.82,[-.05,-.04,-.02,-.2,.2,-.1]],[1,[0,0,0,0,0,0]]],
  hmH:[[0,[0,0,0,0,0,0]],[.36,[0,.15,-.03,.72,-.05,.05]],[.48,[0,.16,-.03,.75,-.05,.05]],[.56,[0,.04,-.12,-.2,0,0]],[.64,[-.01,-.2,-.16,-1.05,.05,0]],[.84,[0,-.06,-.04,-.3,0,0]],[1,[0,0,0,0,0,0]]],
  // zombie claws (striking arm, right side; the left arm mirrors x/ry/rz); heavy = both arms overhead then down
  clL:[[0,[.19,-.19,-.34,.3,-.75,.65]],[.22,[.3,-.02,-.3,.5,-.65,.55]],[.32,[.29,0,-.31,.5,-.65,.55]],[.46,[0,-.1,-.45,.75,.05,.65]],[.6,[-.22,-.27,-.36,.65,.35,.65]],[.8,[-.02,-.22,-.34,.4,-.5,.7]],[1,[.19,-.19,-.34,.3,-.75,.65]]],
  clH:[[0,[.19,-.19,-.34,.3,-.75,.65]],[.35,[.24,.26,-.44,.2,-.8,.55]],[.45,[.235,.25,-.45,.2,-.8,.55]],[.58,[.08,-.1,-.5,.2,.15,.97]],[.72,[.12,-.26,-.42,.2,.4,.9]],[.9,[.18,-.21,-.36,.28,-.5,.8]],[1,[.19,-.19,-.34,.3,-.75,.65]]],
  // grenade: pull back high, throw, follow through low
  // underhand lob: dip, swing up and forward low
  lob:[[0,[0,0,0,0,0,0]],[.3,[.01,-.12,.05,-.5,0,.1]],[.55,[-.02,-.04,-.18,.5,0,-.05]],[.8,[-.02,-.16,-.06,.2,0,0]],[1,[0,-.22,0,-.4,0,0]]],
  nade:[[0,[0,0,0,0,0,0]],[.4,[.02,.1,.14,.95,.12,-.25]],[.5,[.02,.1,.15,1,.12,-.25]],[.62,[-.03,-.05,-.3,-.6,-.1,.15]],[.8,[-.05,-.2,-.1,-.9,-.15,.2]],[1,[0,-.22,0,-.6,0,0]]],
  // draws: rise from below with a little overshoot; knives twirl in, pistols roll up from the holster
  drR:[[0,[.06,-.24,.06,-.85,.25,.45]],[.55,[0,.012,0,.06,-.03,-.06]],[.78,[0,-.005,0,-.02,0,.02]],[1,[0,0,0,0,0,0]]],
  drP:[[0,[.05,-.2,.05,-.5,.4,.9]],[.55,[0,.012,0,.06,-.05,-.1]],[.8,[0,-.004,0,-.02,0,.02]],[1,[0,0,0,0,0,0]]],
  drK:[[0,[.03,-.11,.02,-.35,.25,-6.6]],[.55,[0,.012,0,.05,0,.15]],[.8,[0,-.004,0,-.01,0,-.03]],[1,[0,0,0,0,0,0]]],
  // B stance knock-away: explodes forward and up from the brace right away, then hauls back into the brace
  hmB:[[0,[0,0,0,0,0,0]],[.05,[.02,.02,-.08,.12,-.35,-.1]],[.13,[.06,.05,-.18,.38,-1.0,-.3]],[.28,[.05,.03,-.12,.3,-.85,-.25]],[.6,[.01,0,-.03,.06,-.2,-.05]],[1,[0,0,0,0,0,0]]],
  drH:[[0,[.12,-.34,.14,-1.4,.3,.5]],[.62,[0,.02,0,.14,0,-.06]],[.86,[0,-.006,0,-.02,0,.01]],[1,[0,0,0,0,0,0]]],
  drA:[[0,[.1,-.25,.1,-1.2,.3,.4]],[.6,[0,.02,0,.12,0,-.06]],[.85,[0,-.005,0,-.02,0,.01]],[1,[0,0,0,0,0,0]]],
  drC:[[0,[0,-.32,.05,-.6,0,0]],[.65,[0,.02,0,.08,0,0]],[1,[0,0,0,0,0,0]]],
  // magazine reload: tilt the gun to the left hand, hold, push back up after the slap, cant the other way while working the action
  rel:[[0,[0,0,0,0,0,0]],[.12,[-.04,-.02,.02,.14,.06,-.42]],[.6,[-.04,-.025,.02,.16,.07,-.46]],[.74,[-.03,-.015,.01,.1,.05,-.32]],[.84,[-.01,-.01,0,.05,-.04,-.1]],[.93,[.01,0,0,-.04,-.06,.06]],[1,[0,0,0,0,0,0]]],
  relB:[[0,[0,0,0,0,0,0]],[.12,[0,-.02,.02,-.45,.08,.2]],[.72,[0,-.03,.02,-.5,.1,.22]],[.8,[0,.01,0,.22,0,0]],[.9,[0,0,0,-.04,0,0]],[1,[0,0,0,0,0,0]]],
};
const _vkA=[0,0,0,0,0,0],_vv=new THREE.Vector3(),_vw=new THREE.Vector3(),_vk=[0,0,0,0,0,0],_vk2=[0,0,0,0,0,0],_vd=new THREE.Vector3(),_vb=new THREE.Vector3(),_vq=new THREE.Quaternion();
// [hand x,y,z, toward-elbow x,y,z, wrist flick of the doll (+ = doll tipped up/back, - = chopped down)]
const VD_REST=[.09,-.2,-.36,.3,-.55,.78,.25],_vdk=[0,0,0,0,0,0,0];
VMK.vdA=[[0,VD_REST],[.22,[.17,0,-.4,.3,-.7,.65,1.3]],[.32,[.17,.01,-.4,.3,-.7,.65,1.35]],[.46,[.03,-.1,-.52,.15,-.45,.88,-.65]],[.6,[.05,-.18,-.46,.2,-.6,.78,-.55]],[.82,[.08,-.23,-.38,.28,-.55,.8,0]],[1,VD_REST]];
VMK.vdH=[[0,VD_REST],[.32,[.18,.06,-.42,.3,-.75,.6,1.6]],[.44,[.18,.07,-.42,.3,-.75,.6,1.65]],[.56,[.03,-.13,-.54,.15,-.4,.9,-.8]],[.72,[.05,-.22,-.47,.2,-.6,.78,-.7]],[.9,[.08,-.24,-.38,.28,-.55,.8,0]],[1,VD_REST]];
const CLAW_REST=[.19,-.19,-.34,.3,-.75,.65],_vca=[new Float32Array(6),new Float32Array(6)];
function vspr(s,target,k,dt){const d=2*Math.sqrt(k)*.62;const a=k*(target-s.x)-d*s.v;s.v+=a*dt;s.x+=s.v*dt}
const _vpB={p:[0,0,0],r:[0,0,0]};
// Dual Berettas: stance B offsets (b*) and the draw-time X-cross (x*), per gun; sides mirror
const DUAL_POSE={bX:.1,bY:-.005,bZ:.0,bRoll:-1.25,bYaw:.15,bPitch:.02, xX:.05,xY:.06,xZ:-.01,xPitch:.6,xYaw:.55,xRoll:.25};
const VM={U:null,cache:{},cur:null,id:null,skin:null,t:0,swx:0,swy:0,drawT:0,drawD:.5,rel:null,pumpT:0,boltT:0,mel:null,throwT:0,flash:null,flashT:0,lastYaw:0,lastPitch:0,land:0,vis:true,spinA:0,
  sp:null,camRoll:0,camYaw:0,camPitch:0,slapped:false,trail:null,
  init(){this.U={uProbe:{value:new THREE.Color(.5,.5,.55)},uSpot:{value:0},uMuzzle:{value:new THREE.Color(0,0,0)},uAmbV:{value:1}};
    this.sp={};for(const k of ['px','py','pz','rx','ry','rz'])this.sp[k]={x:0,v:0};
    const tex=new THREE.CanvasTexture(paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const dx=(x-31.5)/31.5,dy=(y-31.5)/31.5,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
      const st=Math.pow(Math.abs(Math.cos(a*2.5)),5)*.7+.25+.08*Math.sin(a*11);const k=clamp(1-r/st,0,1);const core=clamp(1-r/.28,0,1);const i=(y*64+x)*4;
      P.D[i]=255;P.D[i+1]=Math.min(255,190+65*k+40*core);P.D[i+2]=Math.min(255,100+110*k*k+120*core);P.D[i+3]=255*Math.min(1,Math.pow(k,1.25)+core*.6)}}));
    this.flash=new THREE.Mesh(new THREE.PlaneGeometry(.24,.24),new THREE.MeshBasicMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,fog:false}));this.flash.visible=false;this.flash.renderOrder=10;
    const side=new THREE.Mesh(new THREE.PlaneGeometry(.06,.2),this.flash.material);side.rotation.set(Math.PI/2,0,0);side.position.z=-.05;side.renderOrder=10;this.flash.add(side);
    this.initTrail()},
  // motion trail: a ribbon between the blade root and tip over the last few frames of a swing
  initTrail(){const N=18;const g=new THREE.BufferGeometry();const pos=new Float32Array(N*2*3),al=new Float32Array(N*2),idx=[];
    for(let i=0;i<N-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(idx);
    g.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aA',new THREE.BufferAttribute(al,1).setUsage(THREE.DynamicDrawUsage));
    const m=new THREE.ShaderMaterial({uniforms:{uCol:{value:new THREE.Color(1,1,1)},uOp:{value:.4}},vertexShader:'attribute float aA;varying float vA;void main(){vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform vec3 uCol;uniform float uOp;varying float vA;void main(){gl_FragColor=vec4(uCol,vA*uOp);}',transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=9;this.trail={N,g,pos,al,mesh,S:[],mat:m,on:false}},
  trailPush(b,t){const T=this.trail;T.S.unshift({b:b.clone(),t:t.clone(),age:0});if(T.S.length>T.N)T.S.pop()},
  trailUpdate(dt,life){const T=this.trail;if(!T.mesh.parent)R.vmScene.add(T.mesh);for(const s of T.S)s.age+=dt;while(T.S.length&&T.S[T.S.length-1].age>life)T.S.pop();
    const n=T.S.length;for(let i=0;i<T.N;i++){const s=T.S[Math.min(i,Math.max(0,n-1))];if(!s){T.al[i*2]=T.al[i*2+1]=0;continue}
      T.pos.set([s.b.x,s.b.y,s.b.z,s.t.x,s.t.y,s.t.z],i*6);const a=i<n?Math.pow(Math.max(0,1-s.age/life),1.5)*(1-i/T.N):0;T.al[i*2]=a*.25;T.al[i*2+1]=a}
    T.g.attributes.position.needsUpdate=true;T.g.attributes.aA.needsUpdate=true;T.mesh.visible=n>1&&this.vis},
  set(id,skin){if(this.id===id&&this.skin===skin&&this.cur)return;const key=id+'|'+skin;
    if(this.cur)R.vmScene.remove(this.cur.root);
    let m=this.cache[key];if(!m){const W=WPN[id];m=id==='claw'?buildClaws(skin.slice(2),this.U):buildVM(W.model,skin,this.U,!!W.dual);this.cache[key]=m;
      for(const T of [m.tags,m.tags2])if(T)for(const t in T)T[t].userData.base=T[t].position.clone();for(const A of [m.armL,m.armR])if(A){A.userData.base=A.position.clone();A.userData.q0=A.quaternion.clone()}}
    this.cur=m;this.id=id;this.skin=skin;this.spinA=0;R.vmScene.add(m.root);this.trail.S.length=0;
    if(this.flash.parent)this.flash.parent.remove(this.flash);const W=WPN[id];
    if(id!=='claw'&&W.kind!=='melee'&&W.kind!=='nade'){m.gun.add(this.flash);const mz=GUNS[W.model].muzzle;this.flash.position.set(mz[0],mz[1],mz[2]-.06)}
    this.draw(W.draw||.5)},
  draw(d){this.drawT=d;this.drawD=d;this.act=null;this.rel=null;this.mel=null;this.throwT=0;this.pull=null;this.pinOut=false;this.pumpT=0;this.boltT=0},
  fire(W,side){const m=this.cur,S=this.sp,K=vmKick(W);
    if(m&&m.gun2){const g=side<0?m.gun2:m.gun;if(this.flash.parent!==g){if(this.flash.parent)this.flash.parent.remove(this.flash);g.add(this.flash);const mz=GUNS[W.model].muzzle;this.flash.position.set(mz[0],mz[1],mz[2]-.06)}
      if(side<0)this.kick2=1;else this.kick=1;S.px.v+=side<0?-.15:.15}
    S.pz.v+=K[0];S.rx.v+=K[1]*rr(.85,1.15);S.rz.v+=(Math.random()*2-1)*K[2];S.ry.v+=(Math.random()*2-1)*K[2]*.4;S.py.v+=K[0]*.15;
    this.flashT=W.quiet||W.cone?0:W.spin?.03:.045;this.flash.rotation.z=Math.random()*TAU;const s=W.kind==='shotgun'||W.kind==='mg'||W.kind==='special'?1.35:W.kind==='pistol'?.75:W.kind==='sniper'?1.2:1;this.flash.scale.setScalar(s*rr(.8,1.2));
    if(!W.quiet)this.U.uMuzzle.value.setRGB(W.cone?1.6:1.2,W.cone?.7:.8,W.cone?.3:.45);if(W.pump)this.pumpT=.62;if(W.bolt)this.boltT=.95},
  reload(W,dur,kind){this.rel={t:0,d:dur,kind:kind||'mag'};this.slapped=false;this.act=null},
  shellIn(){this.rel={t:0,d:.4,kind:'shell'};this.sp.py.v+=.12},
  stopReload(){this.rel=null},
  stance(b){this.sp.py.v-=.2;this.sp.rx.v+=b?.8:-.6},
  melee(heavy){if(this.id==='knife'&&this.knSwing&&this.knSwing(heavy))return;if(this.id==='skull9'&&this.skSwing&&this.skSwing(heavy))return;const W=WPN[this.id];/* the knife swings on a clip (vmknife.js) */this.mel={t:0,d:W&&W.anD?W.anD[heavy?1:0]:(heavy?.75:.42),heavy,side:this.mel&&this.mel.side>0?-1:1};this.trail.S.length=0},
  claw(heavy,side){this.mel={t:0,d:heavy?.75:.46,heavy,side:side||1};this.trail.S.length=0},
  // voodoo zombie: the right fist holds the doll, the left fist sits just behind it on the doll's legs; light = overhead bash, heavy = bigger slam
  vdPose(A,dt,m){const M=this.mel;let tr=false;const K=_vdk;
    if(M){M.t+=dt;const p=clamp(M.t/M.d,0,1);kfv(M.heavy?VMK.vdH:VMK.vdA,p,K);tr=M.heavy?(p>.44&&p<.62):(p>.34&&p<.52);
      const s=M.heavy?(p>.44&&p<.72?Math.sin((p-.44)/.28*Math.PI):0):(p>.34&&p<.6?Math.sin((p-.34)/.26*Math.PI):0);this.camPitch=-s*(M.heavy?.08:.045)+(p<.4?smooth(p/.4)*.02:0);
      if(p>=1)this.mel=null}
    else for(let i=0;i<7;i++)K[i]=VD_REST[i];
    for(let i=0;i<6;i++)A[0][i]=K[i];if(m.doll)m.doll.rotation.x=K[6];
    const n=Math.hypot(A[0][3],A[0][4],A[0][5])||1,dx=A[0][3]/n,dy=A[0][4]/n,dz=A[0][5]/n;
    A[1][0]=A[0][0]+dx*.07-.014;A[1][1]=A[0][1]+dy*.07-.006;A[1][2]=A[0][2]+dz*.07;A[1][3]=dx-.6;A[1][4]=dy;A[1][5]=dz;return tr},
  throwNade(soft){this.throwT=.5;this.soft=!!soft;this.pull=null},
  bombPull(d){this.pull={t:0,d};this.pinOut=false},
  landed(k){const S=this.sp;S.py.v-=k*.55;S.rx.v+=k*1.4},
  jumped(){this.sp.py.v+=.25;this.sp.rx.v-=.3},
  update(dt,a,cam){if(!this.cur)return;const m=this.cur,W=WPN[this.id]||WPN.knife,S=this.sp;this.t+=dt;
    const kind=this.id==='claw'?'claw':W.kind==='melee'?(this.id==='axe'||this.id==='hammer'||this.id==='skull9'?this.id:'knife'):W.kind==='nade'?'nade':W.hold;
    let VP=VM_POS[this.id]||VM_POS[kind]||VM_POS.rifle;
    // hammer stance: blend the upright A pose into the braced B pose
    if(this.id==='hammer'){const tgt=a.hamB?1:0;this.stB=(this.stB||0)+(tgt-(this.stB||0))*Math.min(1,dt*11);const k=smooth(clamp(this.stB,0,1)),A=VM_POS.hammer,B=VM_POS.hammerB;
      VP=_vpB;for(let i=0;i<3;i++){VP.p[i]=A.p[i]+(B.p[i]-A.p[i])*k;VP.r[i]=A.r[i]+(B.r[i]-A.r[i])*k}}
    const base=VP.p;
    // ---- spring layer: look lag, strafe tilt, crouch/air offsets, sprint carry ----
    const idt=1/Math.max(dt,1e-3);const yawR=wrapA(a.yaw-this.lastYaw)*idt,pitR=(a.pitch-this.lastPitch)*idt;this.lastYaw=a.yaw;this.lastPitch=a.pitch;
    const an=a.an||{};const spr=an.spr||0,mvS=an.mvS||0,cr=an.cr||0;
    const tx=clamp(yawR*.0035,-.045,.045)-mvS*.004-cr*.012+spr*.03*(kind==='claw'?0:1),ty=clamp(-pitR*.003,-.035,.035)-cr*.01-spr*.038+(a.c.onGround?0:clamp(a.c.vy*.004,-.03,.02)),tz=spr*.04;
    const trx=clamp(-pitR*.008,-.08,.08)-spr*.26,trY=clamp(yawR*.011,-.1,.1)+spr*.45,trz=clamp(-mvS*.016,-.08,.08)+spr*.35+cr*.04;
    const sub=dt>1/50?2:1,h=dt/sub;for(let i=0;i<sub;i++){vspr(S.px,tx,170,h);vspr(S.py,ty,170,h);vspr(S.pz,tz,150,h);vspr(S.rx,trx,190,h);vspr(S.ry,kind==='claw'?trY*.5:trY,170,h);vspr(S.rz,trz,170,h)}
    // ---- walk / run bob: a figure-eight path, bigger and looser when sprinting; slow breathing at rest ----
    const sp=Math.hypot(a.c.vx,a.c.vz),onG=a.c.onGround;const bobA=onG?clamp(sp/5,0,1.2)*(1+spr*.7):0;const ph=a.stepPh||0;
    let x=base[0]+S.px.x+Math.sin(ph)*.012*bobA,y=base[1]+S.py.x-Math.abs(Math.sin(ph))*.011*bobA+Math.sin(this.t*1.6)*.0025*(1-bobA*.5),z=base[2]+S.pz.x;
    let rx=VP.r[0]+S.rx.x+Math.sin(this.t*1.6+.5)*.004+Math.abs(Math.cos(ph))*.012*bobA,ry=VP.r[1]+S.ry.x+Math.sin(ph)*.01*bobA,rz=VP.r[2]+S.rz.x+Math.sin(ph)*.016*bobA;
    this.camRoll=0;this.camYaw=0;this.camPitch=0;
    // ---- draw ----
    let drY=0,drX=0;if(this.drawT>0){this.drawT=Math.max(0,this.drawT-dt);const p=1-this.drawT/this.drawD;const D=kind==='knife'?VMK.drK:kind==='axe'?VMK.drA:kind==='hammer'?VMK.drH:kind==='skull9'?VMK.drS:kind==='claw'?VMK.drC:(kind==='pistol'||kind==='dual')?VMK.drP:VMK.drR;
      kfv(D,p,_vk);x+=_vk[0];y+=_vk[1];z+=_vk[2];rx+=_vk[3];ry+=_vk[4];rz+=_vk[5];drY=_vk[1];drX=_vk[3]}
    // reset animated parts
    const tags=m.tags;for(const T of [tags,m.tags2])if(T)for(const t in T){const b=T[t].userData.base;T[t].position.copy(b);T[t].rotation.set(0,0,0);T[t].scale.set(1,1,1)}
    if(m.armL&&m.armL.userData.base)m.armL.position.copy(m.armL.userData.base);
    if(kind!=='claw')for(const A of [m.armL,m.armR])if(A&&A.userData.q0){A.position.copy(A.userData.base);A.quaternion.copy(A.userData.q0);if(A.userData.hand)vmHandCurl(A,A.userData.hand.rest);fdPropsHide(A)}// a clip may have moved the hands
    this.kick=Math.max(0,(this.kick||0)-dt*10);this.kick2=Math.max(0,(this.kick2||0)-dt*10);
    if(m.gun2){const k=this.kick*this.kick,k2=this.kick2*this.kick2;m.gun.position.set(.13,0,k*.035-.02);m.gun.rotation.set(k*.14,.05,0);m.gun2.position.set(-.13,0,k2*.035-.02);m.gun2.rotation.set(k2*.14,-.05,0);
      // Dual Berettas: an X-cross flourish while drawing; the aim key toggles stance B (wide apart, rolled outward on their sides)
      const tgt=a.dualB?1:0;this.stD=(this.stD||0)+(tgt-(this.stD||0))*Math.min(1,dt*10);const kB=smooth(clamp(this.stD,0,1));
      let kX=0;if(this.drawT>0&&this.drawD>0){const p=1-this.drawT/this.drawD;kX=p<.3?smooth(p/.3):p<.62?1:1-smooth((p-.62)/.38)}
      for(const [g,sd] of [[m.gun,1],[m.gun2,-1]]){const P=DUAL_POSE;
        g.position.x+=sd*P.bX*kB;g.position.y+=P.bY*kB;g.position.z+=P.bZ*kB;g.rotation.z-=sd*P.bRoll*kB;g.rotation.y+=sd*P.bYaw*kB;g.rotation.x+=P.bPitch*kB;
        g.position.x-=sd*P.xX*kX;g.position.y+=P.xY*kX;g.position.z+=(P.xZ-sd*.012)*kX;g.rotation.x+=P.xPitch*kX;g.rotation.y+=sd*P.xYaw*kX;g.rotation.z+=sd*P.xRoll*kX}}
    if(tags.spin){this.spinA+=dt*(a.spinV||0)*40;tags.spin.rotation.z=this.spinA}
    // slide lock: an empty pistol's slide stays back after the last shot (a reload from empty releases it)
    if(W.fd&&W.fd.act==='slide'&&!(this.act&&this.act.rl)){const am=a.ammo&&a.ammo[this.id];if(am&&am.mag===0)for(const T of [tags,m.tags2])if(T&&T.slide)T.slide.position.z+=W.fd.d||.045}
    // ---- reload choreography ----
    // (a v2 reload clip from vmrel.js does the work; this older choreography only runs if no clip could be built)
    if(this.rel){const R0=this.rel;R0.t+=dt;const p=clamp(R0.t/R0.d,0,1),v2=this.act&&this.act.rl;
      if(v2){}else if(R0.kind==='mag'){
        if(W.brk&&tags.mag){// break the action open on its hinge, feed, snap shut
          kfv(VMK.relB,p,_vk);x+=_vk[0];y+=_vk[1];z+=_vk[2];rx+=_vk[3];ry+=_vk[4];rz+=_vk[5];
          const open=p<.12?smooth(p/.12):p<.72?1:p<.8?1-smooth((p-.72)/.08):0;tags.mag.rotation.x=-open*.62+(p>.8&&p<.86?-Math.sin((p-.8)/.06*Math.PI)*.04:0);
          if(p>.8&&!this.slapped){this.slapped=true;S.rx.v+=1.6;S.py.v+=.2}
          if(m.armL&&m.armL.visible&&p>.2&&p<.76){const w=Math.sin((p-.2)/.56*Math.PI);const h2=GUNS[W.model].hinge;m.armL.position.lerp(_vv.set(h2[0]-.03,h2[1]-.07-.05*Math.sin((p-.2)/.56*TAU),h2[2]+.07),w*.85)}}
        else{kfv(VMK.rel,p,_vk);
          // the old mag drops (accelerating, tumbling), the new one comes up with the hand, is seated with a slap, then the action is worked
          let off=0,tumble=0;if(p>.16&&p<.42){const u=(p-.16)/.26;off=-.34*u*u;tumble=u*.9}else if(p>=.42&&p<.52)off=-.4;else if(p>=.52&&p<.72){const u=smooth((p-.52)/.2);off=-.3*(1-u)+.006*Math.sin(u*Math.PI)}
          if(p>.72&&!this.slapped){this.slapped=true;S.py.v+=.3;S.rx.v-=.9;S.rz.v-=.6}
          if(m.gun2){y+=_vk[1]*1.4;rx+=_vk[3]*1.2;m.gun.rotation.z+=_vk[5]*1.1;m.gun2.rotation.z-=_vk[5]*1.1;
            for(const T of [tags,m.tags2]){if(T.mag){T.mag.position.y+=off;T.mag.position.z-=off*.1;T.mag.rotation.x=tumble*.6}if(T.slide&&p>.84)T.slide.position.z+=Math.sin((p-.84)/.16*Math.PI)*.04}}
          else{x+=_vk[0];y+=_vk[1];z+=_vk[2];rx+=_vk[3];ry+=_vk[4];rz+=_vk[5];
            if(tags.mag){tags.mag.position.y+=off;tags.mag.position.z+=off*-.1;tags.mag.rotation.x=tumble*.7;tags.mag.rotation.z=tumble*.25;
              if(m.armL&&m.armL.visible&&p>.28&&p<.8){const g=GUNS[W.model];const w=Math.sin((p-.28)/.52*Math.PI);m.armL.position.lerp(_vv.set(g.mag[0]-.02,g.mag[1]-.05+Math.min(0,off)*.9,g.mag[2]),w*.88)}}
            if(tags.slide&&p>.82){const s=p<.88?smooth((p-.82)/.06):1-smooth((p-.88)/.08);tags.slide.position.z+=s*.045}
            if(tags.bolt&&p>.8){const s=p<.88?smooth((p-.8)/.08):1-smooth((p-.88)/.1);tags.bolt.position.z+=s*.055;tags.bolt.rotation.z=s*.8;if(m.armL&&m.armL.visible)m.armL.position.lerp(_vv.set(.03,.06,.03),Math.sin(clamp((p-.8)/.2,0,1)*Math.PI)*.6)}}}}
      else if(R0.kind==='shell'&&!v2){const s=Math.sin(p*Math.PI);rz+=.25;rx+=.12;y-=.02;if(m.armL&&m.armL.visible){m.armL.position.y-=s*.07;m.armL.position.z+=s*.05;m.armL.position.x-=s*.01}}
      else if(R0.kind==='start'&&!v2){const s=smooth(p);rz+=.25*s;rx+=.12*s;y-=.02*s}
      if(R0.t>=R0.d&&R0.kind!=='start')this.rel=null}
    // pump / bolt after a shot
    if(this.pumpT>0){this.pumpT=Math.max(0,this.pumpT-dt);const p=1-this.pumpT/.62;if(p>.2&&tags.pump){const q=clamp((p-.2)/.8,0,1);const s=q<.45?smooth(q/.45):1-smooth((q-.45)/.55);tags.pump.position.z+=s*.095;if(m.armL)m.armL.position.z+=s*.095;rx-=s*.035;rz+=s*.03}}
    if(this.boltT>0){this.boltT=Math.max(0,this.boltT-dt);const p=1-this.boltT/.95;if(p>.25&&tags.bolt){const q=clamp((p-.25)/.75,0,1);const lift=q<.2?smooth(q/.2):q<.8?1:1-smooth((q-.8)/.2),pull=q<.2?0:q<.5?smooth((q-.2)/.3):q<.8?1-smooth((q-.5)/.3):0;
      tags.bolt.rotation.z=lift*1.1;tags.bolt.position.z+=pull*.07;rz+=lift*.12;x-=lift*.01;rx+=pull*.03}}
    // ---- melee: anticipation, a fast stroke with a trail, follow-through, recovery; the camera rolls with the stroke ----
    let trailOn=false;
    if(this.mel&&kind!=='claw'){const M=this.mel;M.t+=dt;const p=clamp(M.t/M.d,0,1);
      if(kind==='knife'){kfv(M.heavy?VMK.knH:(M.side>0?VMK.knA:VMK.knB),p,_vk);trailOn=M.heavy?(p>.38&&p<.58):(p>.24&&p<.6)}
      else if(kind==='axe'){kfv(M.heavy?VMK.axH:VMK.axA,p,_vk);trailOn=M.heavy?(p>.47&&p<.74):(p>.36&&p<.62)}
      else if(kind==='hammer'){kfv(M.heavy?VMK.hmB:VMK.hmH,p,_vk);trailOn=M.heavy?(p>.02&&p<.3):(p>.5&&p<.68)}
      else _vk.fill(0);
      x+=_vk[0];y+=_vk[1];z+=_vk[2];rx+=_vk[3];ry+=_vk[4];rz+=_vk[5];this.camRoll=_vk[5]*.05;this.camYaw=_vk[4]*.025;this.camPitch=_vk[3]*.02;
      if(p>=1)this.mel=null}
    // grenade throw
    if(this.throwT>0){this.throwT=Math.max(0,this.throwT-dt);const p=1-this.throwT/.5;kfv(this.soft?VMK.lob:VMK.nade,p,_vk);x+=_vk[0];y+=_vk[1];z+=_vk[2];rx+=_vk[3];ry+=_vk[4];rz+=_vk[5];this.camPitch=_vk[3]*.015}
    if(VMX[this.id]){_vk2.fill(0);VMX[this.id](this,a,dt,_vk2,m);x+=_vk2[0];y+=_vk2[1];z+=_vk2[2];rx+=_vk2[3];ry+=_vk2[4];rz+=_vk2[5]}
    // ---- the gun's own first-draw action (vmdraw.js) ----
    if(this.act&&kind!=='claw'){_vkA.fill(0);this.actFrame(dt,m,W,_vkA);x+=_vkA[0];y+=_vkA[1];z+=_vkA[2];rx+=_vkA[3];ry+=_vkA[4];rz+=_vkA[5]}
    if(this.act&&this.act.mel){const A=this.act,tr=A.S.trail;trailOn=!!tr&&A.u>tr[0]&&A.u<tr[1]}
    m.root.position.set(x,y,z);m.root.rotation.set(rx,ry,rz);
    if(this.act&&kind!=='claw')this.actArms(m);
    // ---- zombie claws: two arms with their own strokes ----
    if(kind==='claw'){const R_=m.armR,L_=m.armL;const A=_vca;A[0].set(CLAW_REST);A[1].set(CLAW_REST);A[1][0]=-A[1][0];A[1][3]=-A[1][3];
      if(m.vd)trailOn=this.vdPose(A,dt,m);
      else if(this.mel){const M=this.mel;M.t+=dt;const p=clamp(M.t/M.d,0,1);
        if(M.heavy){kfv(VMK.clH,p,_vk);A[0].set(_vk);A[1].set(_vk);A[1][0]=-_vk[0];A[1][3]=-_vk[3];trailOn=p>.47&&p<.74;this.camPitch=-Math.sin(clamp((p-.45)/.3,0,1)*Math.PI)*.05+(p<.45?smooth(p/.45)*.02:0)}
        else{kfv(VMK.clL,p,_vk);const sd=M.side>0?1:-1,S1=A[sd>0?0:1];S1.set(_vk);if(sd<0){S1[0]=-_vk[0];S1[3]=-_vk[3]}
          // the other arm pulls back as the body turns into the swipe
          const O=A[sd>0?1:0],k=Math.sin(p*Math.PI);O[2]+=k*.05;O[1]-=k*.03;trailOn=p>.36&&p<.64;this.camRoll=sd*Math.sin(clamp((p-.3)/.4,0,1)*Math.PI)*.035;this.camYaw=sd*Math.sin(clamp((p-.3)/.4,0,1)*Math.PI)*.02}
        if(p>=1)this.mel=null}
      // breathing, walk bob, finger twitches
      const idle=Math.sin(this.t*2.4)*.01;A[0][1]+=idle-Math.abs(Math.cos(ph))*.014*bobA;A[1][1]+=-idle-Math.abs(Math.sin(ph))*.014*bobA;A[0][2]+=Math.sin(ph)*.02*bobA;A[1][2]-=Math.sin(ph)*.02*bobA;
      const tw=[jerk(this.t,3,1.9,.4)*.12,jerk(this.t,5,2.3,.4)*.1];
      for(let i=0;i<2;i++){const g=i?L_:R_,v=A[i];g.position.set(v[0],v[1],v[2]);_vd.set(v[3],v[4],v[5]).normalize();_vb.set(i?-.25:.25,-.5,1).normalize();
        g.quaternion.setFromUnitVectors(_vb,_vd);_vq.setFromAxisAngle(_vd,tw[i]+(i?.12:-.12));g.quaternion.premultiply(_vq)}
      m.root.position.set(S.px.x*.6,S.py.x*.6+drY,0);m.root.rotation.set(S.rx.x*.4+drX,S.ry.x*.5,S.rz.x*.5)}
    // ---- trail sampling ----
    if(trailOn){m.root.updateMatrixWorld(true);
      if(kind==='claw'&&m.vd){const am=m.doll;am.localToWorld(_vv.set(0,0,-.08));am.localToWorld(_vw.set(0,.02,-.22));this.trailPush(_vv,_vw)}
      else if(kind==='claw'){const M=this.mel;const arms=M&&M.heavy?[m.armR,m.armL]:[M&&M.side>0?m.armR:m.armL];const am=arms[0].children[0];am.localToWorld(_vv.set(0,-.02,-.08));am.localToWorld(_vw.set(0,-.05,-.22));this.trailPush(_vv,_vw)}
      else if(kind==='axe'){m.gun.localToWorld(_vv.set(0,.03,-.49));m.gun.localToWorld(_vw.set(0,.15,-.49));this.trailPush(_vv,_vw)}
      else if(kind==='hammer'){m.gun.localToWorld(_vv.set(0,-.13,-.81));m.gun.localToWorld(_vw.set(0,.13,-.81));this.trailPush(_vv,_vw)}
      else if(kind==='skull9'){const q=GUNS.skull9.trail;m.gun.localToWorld(_vv.set(q[0],q[1],q[2]));m.gun.localToWorld(_vw.set(q[3],q[4],q[5]));this.trailPush(_vv,_vw)}
      else{m.gun.localToWorld(_vv.set(0,.006,-.1));m.gun.localToWorld(_vw.set(0,.006,-.28));this.trailPush(_vv,_vw)}}
    const T=this.trail;T.mat.uniforms.uCol.value.set(kind==='claw'?'#7a0a08':'#e8eef4');T.mat.uniforms.uOp.value=kind==='claw'?.6:.42;this.trailUpdate(dt,.11);
    // muzzle flash + lights
    this.flashT-=dt;this.flash.visible=this.flashT>0&&this.vis;const mu=this.U.uMuzzle.value;mu.multiplyScalar(Math.exp(-dt*30));
    sampleProbe(a.c.x,a.c.y+1.4,a.c.z,this.U.uProbe.value);this.U.uProbe.value.multiplyScalar(1.15).addScalar(.04);
    this.U.uSpot.value=a.flash?1.1:0;
    m.root.visible=this.vis}};


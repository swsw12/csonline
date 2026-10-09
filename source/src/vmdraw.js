'use strict';
// ============ First draw v2: every gun made ready its own way ============
// Played the first time a gun comes out after it was bought, picked up or taken from a crate (GUN_DESIGN in design.js).
// Every action is a small animation clip, built per gun from its GUN_DESIGN entry and its model (part positions, tags):
//   G      the whole gun's pose   [u, x,y,z, rx,ry,rz]   x + right, y + up, z + toward the eye, rx + muzzle up, ry + muzzle left, rz + right side up
//   H / R  the free (left) hand, and the gun (right) hand when it leaves the grip: {A: anchors, k: HK(u, anchor, offset, w, back, curl)}
//          An anchor is a point on the gun: {sup} the hand's rest place, {grip}, {p:[x,y,z]}, or {tag, at} a point on a moving
//          part that rides along with it; the offset puts the palm's centre relative to it. w blends the arm from its rest pose
//          (0) into the reach (1), where the forearm is turned toward an elbow off screen so a reaching hand stays on an arm;
//          back is the way the back of the hand faces (gun space, default up = palm down); curl closes the fingers
//          (0 flat open .. 1 fist, below 0 spread; missing = the hand's resting grip).
//   parts  moving parts: keyed while a hand holds them, then let go — a spring-loaded part (slide, carrier, cover) flies home
//          under constant acceleration, bounces and settles, and its sound and kick fire on the impact itself
//   spins  turning parts (cylinder, barrel cluster, drum, drill, orb): kicked by a hand or driven by a motor, friction, indexing
//   E      timed sounds / kicks / effects      C  the camera [u, pitch, yaw, roll]      vib  engine shake [u, amount]
// Keys run through a monotone cubic (no overshoot between keys, flat at both ends), so each clip eases out of and back into the
// idle pose; anticipation and overshoot are keyed on purpose. u runs 0..1 over the clip, which starts while the normal raise is
// still finishing (at 62% of it) and ends exactly when the gun is ready to fire.
// (window.__FDT lets the tuning harness override a few poses per clip; nothing in the game sets it.)
const FD_ELB=[new THREE.Vector3(-.2,-.44,-.12),new THREE.Vector3(.26,-.46,-.04)],_fEL=new THREE.Vector3(),_fER=new THREE.Vector3();// left / right elbow (camera space; a clip may move it)
const _fa=new THREE.Vector3(),_fb=new THREE.Vector3(),_fe=new THREE.Vector3(),_fUp=new THREE.Vector3(0,1,0),_fZ=new THREE.Vector3(0,0,1),
  _fq=new THREE.Quaternion(),_fq2=new THREE.Quaternion(),_fm=new THREE.Matrix4(),_fo=[0,0,0,0,0,0],_fwt=[0,0],
  _fT=new Float64Array(32),_fV=new Float64Array(32),_fM=new Float64Array(32),_fP=[];
for(let i=0;i<10;i++)_fP.push(new THREE.Vector3());
const K6=(u,x,y,z,rx,ry,rz)=>[u,x||0,y||0,z||0,rx||0,ry||0,rz||0];
const fdJit=(K,j)=>{K[0]+=(Math.random()-.5)*j;K[1]+=(Math.random()-.5)*j;K[3]+=(Math.random()-.5)*j*2.5;K[5]+=(Math.random()-.5)*j*1.5};

// ---- curves: monotone cubic (Fritsch–Carlson / PCHIP) ----
function fdSlopes(t,v,n,m){m[0]=0;m[n-1]=0;for(let i=1;i<n-1;i++){m[i]=0;const h0=t[i]-t[i-1],h1=t[i+1]-t[i];if(h0<=0||h1<=0)continue;
  const d0=(v[i]-v[i-1])/h0,d1=(v[i+1]-v[i])/h1;if(d0*d1<=0)continue;const w1=2*h1+h0,w2=h1+2*h0;m[i]=(w1+w2)/(w1/d0+w2/d1)}}
// md (per key): 1 = accelerate into this key and stop dead on it (a hit), 2 = leave the previous key at full speed (a snap away)
function fdHerm(t,v,m,n,u,md){if(u<=t[0])return v[0];if(u>=t[n-1])return v[n-1];let i=1;while(u>t[i])i++;const h=t[i]-t[i-1];if(h<=1e-9)return v[i];const s=(u-t[i-1])/h;
  const k=md&&md[i];if(k===1)return v[i-1]+(v[i]-v[i-1])*s*s;if(k===2)return v[i-1]+(v[i]-v[i-1])*(1-(1-s)*(1-s));
  const s2=s*s,s3=s2*s;return (2*s3-3*s2+1)*v[i-1]+(s3-2*s2+s)*h*m[i-1]+(-2*s3+3*s2)*v[i]+(s3-s2)*h*m[i]}
// a track of rows [u, v0, v1, ...] (all rows the same length)
function fdTrack(K,u,out){const n=K.length;if(!K._t){const d=K._d=K[0].length-1;K._t=K.map(k=>k[0]);K._v=[];K._m=[];
    for(let c=0;c<d;c++){const v=K.map(k=>k[c+1]||0),m=new Array(n);fdSlopes(K._t,v,n,m);K._v.push(v);K._m.push(m)}}
  for(let c=0;c<K._d;c++)out[c]=fdHerm(K._t,K._v[c],K._m[c],n,u);return out}
// a single-value track of rows [u, v, mode?]
function fdKey1(K,u){const n=K.length;if(!K._t){K._t=K.map(k=>k[0]);K._v=K.map(k=>k[1]);K._md=K.map(k=>k[2]||0);K._m=new Array(n);fdSlopes(K._t,K._v,n,K._m)}
  return fdHerm(K._t,K._v,K._m,n,u,K._md)}

// ---- the model: where things are ----
// bounds of a tagged part at rest (gun space)
function fdExt(G,t){const B={mn:[9,9,9],mx:[-9,-9,-9],c:[0,0,0]};let n=0;
  for(const p of G.parts){if(p.tag!==t)continue;n++;for(let i=0;i<3;i++){const s=(p.s?p.s[i]:0)/2;B.mn[i]=Math.min(B.mn[i],p.c[i]-s);B.mx[i]=Math.max(B.mx[i],p.c[i]+s);B.c[i]+=p.c[i]}}
  if(!n){const c=(G._tc&&G._tc[t])||[0,.05,0];return {mn:c.slice(),mx:c.slice(),c:c.slice()}}for(let i=0;i<3;i++)B.c[i]/=n;return B}
// an anchor's current point in its gun's space
function fdAnc(m,G,a,out){if(a.sup)return out.copy(m.armL.userData.base);if(a.grip)return out.copy(m.armR.userData.base);
  const c=a.at||a.p||(a.tag&&G._tc&&G._tc[a.tag])||[0,0,0];out.set(c[0],c[1],c[2]);if(!a.tag||a.ride===0)return out;
  const T=(a.two?m.tags2:m.tags);const g=T&&T[a.tag];if(g&&g.userData.base)out.sub(g.userData.base).multiply(g.scale).applyQuaternion(g.quaternion).add(g.position);return out}
// the hand's palm point at u: every key's point is taken now (anchors ride moving parts), a monotone cubic runs through them
function fdHandAt(m,G,S,u,out,rest){const H=S.k,n=H.length;for(let i=0;i<S.A.length;i++)fdAnc(m,G,S.A[i],_fP[i]);
  for(let i=0;i<n;i++)_fT[i]=H[i][0];const o=_fwt;
  for(let c=0;c<3;c++){for(let i=0;i<n;i++){const k=H[i],p=_fP[k[1]];_fV[i]=(c===0?p.x:c===1?p.y:p.z)+k[2+c]}fdSlopes(_fT,_fV,n,_fM);_fo[c]=fdHerm(_fT,_fV,_fM,n,u)}
  out.set(_fo[0],_fo[1],_fo[2]);if(!S._wt)S._wt=H.map(k=>[k[0],k[5],k[9]==null?rest:k[9]]);fdTrack(S._wt,u,o);return o}// [w, curl]
// pose an arm: P = palm centre in the arm's parent (gun) space. The wrist sits behind the palm toward the elbow and the forearm
// points at the elbow. Where the back of the hand faces: every key's direction becomes a roll of the hand about the forearm,
// the rolls are unwrapped (never more than half a turn between keys) and eased like the other channels — so turning the palm
// over goes the way a wrist turns instead of flipping. w blends from the rest pose.
const _fr=new THREE.Vector3(),_fs=new THREE.Vector3();
function fdArm(arm,P,w,S,u,elb){if(!arm||!arm.visible)return;const q0=arm.userData.q0;if(w<=.001||!q0){arm.position.copy(P);return}
  _fe.copy(elb);arm.parent.worldToLocal(_fe);_fa.copy(_fe).sub(P).normalize();_fb.copy(P).addScaledVector(_fa,.045*Math.min(1,w));arm.position.copy(_fb);
  const H=S.k,n=H.length;if(!S._b)S._b=H.map(k=>{const v=new THREE.Vector3(k[6],k[7],k[8]);return v.lengthSq()<1e-8?v.set(0,1,0):v.normalize()});
  _fr.set(0,1,0).addScaledVector(_fa,-_fa.y);if(_fr.lengthSq()<1e-6)_fr.set(1,0,0).addScaledVector(_fa,-_fa.x);_fr.normalize();_fs.crossVectors(_fa,_fr);
  // the branch of each key's roll is settled once, on the first frame, by unwrapping key to key; later frames keep to it
  let prev=0;const A0=S._a0;for(let i=0;i<n;i++){const b=S._b[i],x=b.dot(_fr),y=b.dot(_fs);let a=x*x+y*y<1e-8?(A0?A0[i]:prev):Math.atan2(y,x);const ref=A0?A0[i]:prev;
    while(a-ref>Math.PI)a-=TAU;while(a-ref<-Math.PI)a+=TAU;_fT[i]=H[i][0];_fV[i]=a;prev=a}
  if(!A0)S._a0=Array.from(_fV.subarray(0,n));
  fdSlopes(_fT,_fV,n,_fM);const th=fdHerm(_fT,_fV,_fM,n,u);_fUp.copy(_fr).multiplyScalar(Math.cos(th)).addScaledVector(_fs,Math.sin(th));
  _fm.lookAt(_fe,_fb,_fUp);_fq.setFromRotationMatrix(_fm);
  // blend from the rest pose along a path that stays continuous: the target keeps its sign from frame to frame (a plain slerp
  // would jump to the other way round the moment the hand passes half a turn from its rest pose)
  const pq=arm.userData.fdq;if(pq){if(pq.dot(_fq)<0)_fq.set(-_fq.x,-_fq.y,-_fq.z,-_fq.w);pq.copy(_fq)}else{if(q0.dot(_fq)<0)_fq.set(-_fq.x,-_fq.y,-_fq.z,-_fq.w);arm.userData.fdq=_fq.clone()}
  fdSlerp(q0,_fq,Math.min(1,w),arm.quaternion)}
function fdSlerp(a,b,t,out){const c=clamp(a.x*b.x+a.y*b.y+a.z*b.z+a.w*b.w,-1,1),th=Math.acos(c),sn=Math.sin(th);
  if(sn<1e-4)return out.copy(t<.5?a:b);const k0=Math.sin((1-t)*th)/sn,k1=Math.sin(t*th)/sn;return out.set(a.x*k0+b.x*k1,a.y*k0+b.y*k1,a.z*k0+b.z*k1,a.w*k0+b.w*k1).normalize()}
function fdApply(T,ch,v){switch(ch){case 'px':T.position.x+=v;break;case 'py':T.position.y+=v;break;case 'pz':T.position.z+=v;break;
  case 'rx':T.rotation.x+=v;break;case 'ry':T.rotation.y+=v;break;case 'rz':T.rotation.z+=v;break;case 's':T.scale.multiplyScalar(1+v);break}}
// hand key: HK(u, anchor index, [offset], w, [back of the hand], curl) → [u, a, ox,oy,oz, w, bx,by,bz, curl]
const HK=(u,a,o,w,b,c)=>[u,a,o?o[0]:0,o?o[1]:0,o?o[2]:0,w||0,b?b[0]:0,b?b[1]:1,b?b[2]:0,c==null?null:c];

// ---- the clips ----
// P = GUN_DESIGN entry, G = model, m = view model, L = clip length in seconds (sound-synced keys convert seconds to u with it)
const FDS={
  // Pistols: the gun turns side-on, the free hand swings up from under it, lands on the back of the slide and clamps it, yanks
  // it to the stop and lets go — the fingers spring open and the slide slams home on its spring (sound + kick on the impact).
  slide(P,G,m,L){if(m.gun2)return FDS.slideDual(P,G,m,L);const T=(window.__FDT&&window.__FDT.slide)||{};
    const h=P.heavy||0,d=P.d||.045,S=fdExt(G,'slide');
    const a=.27+h*.02,b=a+.13+h*.07,c=b+.04;// fingers on it, at the stop, let go
    const pr=T.pose||[-.07,.065,-.03,.5,.4+h*.05,(P.roll==null?.3:P.roll)+.02];// presented: muzzle up and to the left, top toward the eye
    const gp=T.gp||[S.mn[0],S.mx[1]-.014,S.mx[2]-.02],on=T.on||[-.021,.006,0],bk=T.bk||[-1,.2,0];// the back of the slide's left face
    const pp=u=>K6(u,...pr),pull=(u,k)=>K6(u,pr[0]+.008*k,pr[1]-.006*k,pr[2]+.006*k,pr[3]-.05*k,pr[4]+.05*k,pr[5]+.05*k);
    return {
      G:[K6(0),K6(.06,.006,-.008,.004,-.03,-.06,-.04),pp(.22),pp(a),pull(b,1+h*.4),pull(c,.8),pp(c+.12),K6(.84,.005,-.004,.002,-.02,-.035,-.025),K6(1)],
      H:{elb:T.elb,A:[{sup:1},{tag:'slide',at:gp},{p:[gp[0],gp[1],gp[2]+d]}],k:[HK(0,0),HK(.06,0),
         HK(.15,1,T.ap||[-.06,-.05,.02],.6,[-1,-.2,.2],.25),// out from under the grip, opening
         HK(a-.04,1,T.ap2||[-.04,.012,.004],1,bk,.15),        // beside the slide
         HK(a,1,on,1,bk,.5),HK(a+.03,1,on,1,bk,.8),          // the palm lands on it, the fingers clamp over the top
         HK(b,1,on,1,bk,.85),HK(c,2,on,1,bk,.85),            // ride it back to the stop, hold
         HK(c+.03,2,T.fl||[-.034,-.004,.004],1,[-1,.2,0],-.1),// let go: the hand springs off it, fingers open
         HK(c+.13,2,[-.06,-.055,.015],.8,[-1,-.3,0],.35),HK(.86,0),HK(1,0)]},
      parts:[{tag:'slide',ch:'pz',k:[[0,0],[a+.01,0],[b,d],[c,d]],rel:c,A:1300-h*550,e:.22,home:['fdslam',.9,1.1-h*.3,[.26+h*.2,-.75-h*.65,.15],[.012+h*.01,0,.008]]}],
      E:[[a,'fdgrab',.45,1],[a+.01,'slide',.45,.9-h*.2]],
      C:[[0,0,0,0],[.22,.006,.006,.01],[c,.008,.007,.013],[.84,0,0,0],[1,0,0,0]]}},
  // Dual Berettas: the guns meet in front with their tops tipped together, drag both slides back against each other and push
  // apart — both slides slam home a beat apart.
  slideDual(P,G,m,L){const d=P.d||.04;const a=.3,b=.43,c=.47;
    return {
      G:[K6(0),K6(.07,0,-.008,0,-.03,0,0),K6(.24,0,.03,-.02,.08,0,0),K6(a,0,.03,-.02,.08,0,0),K6(b,0,.036,.012,.1,0,0),K6(c,0,.034,.008,.095,0,0),K6(c+.1,0,.03,-.015,.07,0,0),K6(.86,0,-.004,0,-.01,0,0),K6(1)],
      D:[[0,0],[.08,0],[.24,1],[b,1],[c,1.05],[c+.06,.62],[.8,.15],[1,0]],DP:[-.098,.012,-.01,.04,.18,.72],
      parts:[{tag:'slide',ch:'pz',k:[[0,0],[a,0],[b,d],[c,d]],rel:c,A:1200,e:.2,home:['fdslam',.85,1.08,[.3,-.7,0],[.012,0,0]]},
             {tag:'slide',two:1,ch:'pz',k:[[0,0],[a,0],[b,d],[c+.012,d]],rel:c+.012,A:1200,e:.2,home:['fdslam',.8,.98,[.15,-.4,0]]}],
      E:[[a-.02,'slide',.5,.95],[a-.005,'slide',.4,.85]],
      C:[[0,0,0,0],[.24,.008,0,0],[c,.01,0,0],[.86,0,0,0],[1,0,0,0]]}},
  // Revolver: turned to show its left side, the fingers push the cylinder out toward the eye, swipe it spinning (ratchet clicks
  // running down), a flick of the wrist swings it shut — it locks with a clack and indexes on a chamber — and the thumb cocks it.
  revolver(P,G,m,L){const C=fdExt(G,'mag'),cx=C.mn[0],cy=(C.mn[1]+C.mx[1])/2,cz=(C.mn[2]+C.mx[2])/2,out=[cx-.028,cy-.012,cz];
    return {
      G:[K6(0),K6(.06,.004,-.006,0,-.03,-.05,.04),K6(.16,-.045,.04,-.015,.12,.62,.15),K6(.54,-.045,.043,-.015,.13,.64,.16),
         K6(.585,-.04,.05,-.012,.16,.56,-.25),K6(.63,-.043,.044,-.014,.1,.61,.1),K6(.72,-.045,.04,-.015,.1,.62,.12),K6(.82,-.046,.038,-.015,.075,.63,.13),
         K6(.92,.004,-.004,.002,-.01,-.03,.02),K6(1)],
      H:{A:[{sup:1},{tag:'mag',at:[cx,cy,cz]},{p:out}],k:[HK(0,0),HK(.06,0),
         HK(.13,1,[-.03,-.045,.01],.7,[-1,-.3,0],.3),HK(.17,1,[-.02,-.008,0],1,[-1,-.2,0],.55),HK(.29,1,[-.02,-.008,0],1,[-1,-.2,0],.6),// fingers push it out
         HK(.31,2,[-.022,-.022,0],1,[-1,-.2,0],.35),HK(.34,2,[-.022,.03,0],1,[-1,.2,0],.15),// a swipe up its side sets it spinning
         HK(.42,2,[-.04,.06,.02],.9,[-1,.4,0],.3),HK(.56,0),HK(1,0)]},
      parts:[{tag:'mag',ch:'px',k:[[0,0],[.17,0],[.24,-.03,1],[.27,-.027],[.3,-.028]],rel:.585,A:900,e:.15,home:['brk',.8,1.35,[.12,0,.7],[.006,0,.012]]},
             {tag:'mag',ch:'py',k:[[0,0],[.17,0],[.24,-.013,1],[.27,-.0115],[.3,-.012]],rel:.585,A:390,e:.15},
             {tag:'aux',ch:'rx',k:[[0,0],[.74,0],[.8,-.72,1],[.9,-.72],[.99,0]]}],
      spins:[{tag:'mag',ch:'rz',kick:[[.335,38]],fric:2.2,stop:.585,snap:TAU/6}],
      E:[[.16,'brk',.45,1.7],[.335,'cylspin',.8,1],[.8,'dry',.6,.7,[.05,-.2,0]]],
      C:[[0,0,0,0],[.16,.008,.006,.01],[.55,.008,.006,.012],[.6,.008,.004,-.006],[.9,0,0,0],[1,0,0,0]]}},
  // Charging handle on the side / top: the gun rolls to show it, the free hand comes back from the handguard, takes the handle,
  // yanks it to the stop and lets it fly — the carrier slams home. Open bolt: it catches on the sear with a click and the hand
  // rides it forward. (P90 'u': its handles sit low on both sides — taken on the left.)
  charge(P,G,m,L){const T=(window.__FDT&&window.__FDT.charge)||{};const h=P.heavy||0,d=P.d||.05,sd=P.side==='u'?'l':(P.side||'r'),r=P.roll==null?.3:P.roll,ob=!!P.ob,E=fdExt(G,'chg');
    const a=.26+h*.03,b=a+.13+h*.05,c=b+.04;
    const cy=(E.mn[1]+E.mx[1])/2,cz=(E.mn[2]+E.mx[2])/2;
    const gp=sd==='r'?[E.mx[0],cy,cz]:sd==='l'?[E.mn[0],cy,cz]:[E.mn[0],E.mx[1],cz];
    // right: the hand comes up under the gun and takes the handle from below, palm up, fingers round it (the gun rolls to show it);
    // left: from the side; top: from the left side with the fingers hooked over the knob
    const on=T.on||(sd==='r'?[.004,-.026,.006]:sd==='l'?[-.022,.006,.006]:[-.022,-.004,.004]);// palm centre from the grab point
    const bk=T.bk||(sd==='r'?[0,-1,0]:sd==='l'?[-1,.25,0]:[-1,.3,0]);// back of the hand
    const ap=T.ap||(sd==='r'?[-.03,-.08,.03]:sd==='l'?[-.065,-.02,-.02]:[-.06,-.03,-.01]);// coming in from
    const fl=T.fl||(sd==='r'?[.01,-.06,.02]:sd==='l'?[-.034,-.004,.012]:[-.034,.004,.01]);// thrown off after letting go
    const sg=sd==='l'?-1:1,pr=T.pose||(sd==='r'?[-.05,.035,-.01,.05,.06,r+.25]:sd==='l'?[-.03,.026,-.012,.05,.14,-r]:[-.035,0,-.065,.14,.16,.3]);
    const pp=u=>K6(u,...pr),pull=(u,k)=>K6(u,pr[0]+.006*k,pr[1]-.004*k,pr[2]+.008*k,pr[3]-.025*k,pr[4]+.03*k,pr[5]+.04*sg*k);
    const mid=sd==='r'?[-1,-.3,0]:bk;// the wrist turning the palm up goes through 'back of the hand to the left'
    const H=[HK(0,0),HK(.04,0),HK(a-.12,1,ap,.5,mid,.3),HK(a-.03,1,[on[0]*1.5,on[1]*1.5,on[2]+.01],1,bk,.3),HK(a,1,on,1,bk,.55),HK(a+.03,1,on,1,bk,.8),HK(b,1,on,1,bk,.85)];
    if(ob)H.push(HK(c+.16,1,on,1,bk,.8),HK(c+.28,1,fl.map(v=>v*.6),.8,mid,.2),HK(.9,0),HK(1,0));
    else H.push(HK(c,2,on,1,bk,.85),HK(c+.035,2,fl,1,bk,.05),HK(c+.18,2,[ap[0],ap[1]-.03,ap[2]],.7,mid,.4),HK(.88,0),HK(1,0));
    return {
      G:[K6(0),K6(.06,.004,-.006,0,-.03,-.03,-.04*sg),pp(.2),pp(a),pull(b,1),pull(c,.8),pp(c+.14),K6(.86,.004,-.004,.002,-.012,-.02,-.02*sg),K6(1)],
      H:{elb:T.elb,A:[{sup:1},{tag:'chg',at:gp},{p:[gp[0],gp[1],gp[2]+d]}],k:H},
      parts:[ob?{tag:'chg',ch:'pz',k:[[0,0],[a+.01,0],[b,d,1],[c+.02,d],[c+.16,0]]}
              :{tag:'chg',ch:'pz',k:[[0,0],[a+.01,0],[b,d],[c,d]],rel:c,A:1000-h*350,e:.2,home:['fdhome',.9,1.05-h*.25,[.24+h*.12,-.65-h*.45,.15*sg],[.012+h*.008,0,.008*sg]]}],
      E:ob?[[a,'fdgrab',.4,1],[a-.02,'chg',.6,1.1-h*.3],[b,'dry',.65,.75,[.06,-.2,0]],[c+.16,'dry',.35,1.3]]:[[a,'fdgrab',.4,1],[a-.02,'chg',.6,1.1-h*.3]],
      C:[[0,0,0,0],[.2,.006,.006,.012*sg],[b,.009,.008,.016*sg],[.86,0,0,0],[1,0,0,0]]}},
  // HK slap: the free hand pulls the cocking lever back and flips it up into its notch, lets go, winds up with an open palm and
  // slaps it down — the bolt slams home with a bang that jolts the whole gun.
  hk(P,G,m,L){const h=P.heavy||0,d=P.d||.045,E=fdExt(G,'chg');const a=.25,b=.38+h*.03,lk=b+.05,wu=lk+.11,sl=wu+.035;
    const gp=[E.mn[0],(E.mn[1]+E.mx[1])/2,E.mx[2]],lock=[gp[0],gp[1]+.009,gp[2]+d],on=[-.022,.004,.004],bk=[-1,.2,0];
    return {
      G:[K6(0),K6(.06,.004,-.006,0,-.02,.03,.05),K6(.2,-.03,.025,-.01,.06,.1,-.3),K6(b,-.026,.022,-.004,.04,.13,-.34),K6(lk,-.028,.026,-.01,.06,.11,-.33),
         K6(wu,-.03,.03,-.01,.08,.1,-.31),K6(sl,-.03,.022,-.008,.04,.1,-.3),K6(sl+.07,-.03,.025,-.01,.05,.1,-.31),K6(.86,.004,-.004,.002,-.01,-.02,.02),K6(1)],
      H:{A:[{sup:1},{tag:'chg',at:gp},{p:lock}],k:[HK(0,0),HK(.06,0),HK(.16,1,[-.06,-.03,.02],.6,[-1,0,0],.3),HK(a-.025,1,[-.032,.01,.006],1,bk,.35),
         HK(a,1,on,1,bk,.6),HK(a+.03,1,on,1,bk,.8),HK(b,1,on,1,bk,.85),HK(lk,2,[-.022,.01,.004],1,[-1,.6,0],.85),// flipped up into the notch
         HK(lk+.035,2,[-.04,.03,.01],1,[-.6,1,0],.1),HK(wu,2,[-.034,.058,.006],1,[-.2,1,0],-.05),// let go, the open hand winds up over it
         HK(sl,2,[-.006,.026,-.004],1,[0,1,0],.05),HK(sl+.035,2,[-.012,.004,-.014],1,[0,1,0],.15),// SLAP, follow through
         HK(sl+.13,2,[-.06,-.03,0],.75,[-1,0,0],.45),HK(.88,0),HK(1,0)]},
      parts:[{tag:'chg',ch:'pz',k:[[0,0],[a+.01,0],[b,d],[sl,d]],rel:sl,A:1500-h*350,e:.2,home:['hkslap',.95,1-h*.2,[.34+h*.12,-1.05-h*.35,-.2],[.016+h*.008,0,-.01]]},
             {tag:'chg',ch:'py',k:[[0,0],[b,0],[lk,.009],[sl,.009],[sl+.01,0,1]]}],
      E:[[a,'fdgrab',.4,1],[a-.025,'chg',.55,1.1-h*.25],[lk,'dry',.5,1.45]],
      C:[[0,0,0,0],[.2,.006,.004,-.012],[wu,.01,.004,-.012],[.86,0,0,0],[1,0,0,0]]}},
  // M4: the free hand goes back over the receiver, two fingers hook the T-handle behind the sight, pull, let go — the carrier
  // slams home — then the heel of the hand knocks the forward assist.
  ar(P,G,m,L){const d=P.d||.06,E=fdExt(G,'chg'),X=fdExt(G,'aux');const a=.27,b=.41,c=.45,f0=.58,f1=.635;
    const gp=[E.c[0],E.mx[1],E.mn[2]],fa=[X.mx[0],(X.mn[1]+X.mx[1])/2,X.c[2]],on=[-.02,.022,-.02],bk=[-.8,.6,.1];// fingers hook its left wing
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.03,-.03,-.03),K6(.2,-.02,-.012,-.07,.16,.2,.2),K6(b,-.017,-.016,-.062,.14,.22,.22),K6(c+.06,-.02,-.012,-.07,.16,.2,.2),
         K6(f0,-.024,-.01,-.07,.13,.16,.3),K6(f1+.05,-.022,-.012,-.07,.13,.15,.28),K6(.88,.004,-.004,.002,-.01,-.02,-.02),K6(1)],
      H:{A:[{sup:1},{tag:'chg',at:gp},{p:[gp[0],gp[1],gp[2]+d]},{p:[-.02,.09,-.12]},{tag:'aux',at:fa}],k:[HK(0,0),HK(.06,0),
         HK(.16,3,[0,.02,0],.7,[0,1,0],.3),HK(a-.03,1,[0,.042,-.036],1,[0,1,.2],.3),HK(a,1,on,1,bk,.55),HK(a+.03,1,on,1,bk,.8),HK(b,1,on,1,bk,.85),HK(c,2,on,1,bk,.85),
         HK(c+.035,2,[-.02,.035,-.03],1,[0,1,.3],.05),HK(f0,4,[.042,.012,0],1,[1,.3,0],.35),HK(f1-.012,4,[.025,.004,0],1,[1,.2,0],.4),HK(f1+.03,4,[.046,.012,0],1,[1,.3,0],.4),HK(.9,0),HK(1,0)]},
      parts:[{tag:'chg',ch:'pz',k:[[0,0],[a+.01,0],[b,d],[c,d]],rel:c,A:950,e:.2,home:['fdhome',.85,1.05,[.25,-.6,.1],[.011,0,.006]]},
             {tag:'aux',ch:'px',k:[[0,0],[f1-.012,0],[f1,-.006,1],[f1+.05,0]]}],
      E:[[a,'fdgrab',.4,1],[a-.025,'chg',.55,1.05],[f1,'dry',.55,1.8,[.06,0,-.25]]],
      C:[[0,0,0,0],[.2,.008,.004,.012],[b,.01,.004,.014],[.88,0,0,0],[1,0,0,0]]}},
  // Pump: the gun tips up, the pump is torn back to the stop and slammed forward — the gun lurches with it.
  pump(P,G,m,L){const a=.21,b=.3,c=.36,sup=G.sup||[0,0,-.3];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.03,-.03,-.03),K6(.18,-.05,.02,-.03,.12,.36,.3),K6(a,-.05,.02,-.03,.12,.36,.3),K6(b,-.046,.012,-.014,.08,.39,.33),
         K6(c,-.047,.014,-.016,.09,.38,.32),K6(c+.07,-.05,.026,-.04,.16,.35,.28),K6(.56,-.05,.02,-.03,.12,.36,.3),K6(.86,.004,-.004,.002,-.012,-.02,-.02),K6(1)],
      H:{A:[{tag:'pump',at:sup}],k:[HK(0,0),HK(.17,0,null,0,null,.98),HK(.5,0,null,0,null,.98),HK(.7,0),HK(1,0)]},
      parts:[{tag:'pump',ch:'pz',k:[[0,0],[a,0],[b,.095,1],[c,.095]],rel:c,A:85,e:.12,home:['pumpf',.95,1,[.32,-.7,.12,-.3],[.014,0,.006]]}],
      E:[[b-.055/L,'pumpb',.9,1]],
      C:[[0,0,0,0],[.18,.006,.004,.01],[b,.01,.004,.012],[.86,0,0,0],[1,0,0,0]]}},
  // Bolt action: the gun hand leaves the grip and runs the bolt — up, back, forward, down — in step with the sound's four clicks.
  bolt(P,G,m,L){const h=P.heavy||0,rt=1-h*.15,t0=.26,s=x=>t0+x/rt/L,E=fdExt(G,'bolt');
    const lu0=s(0),lu1=s(.05),pb0=s(.07),pb1=s(.12),pf0=s(.22),pf1=s(.3),ld0=s(.38),ld1=s(.45),pl=.07+h*.015;
    const kn=[E.mx[0]-.006,(E.mn[1]+E.mx[1])/2,(E.mn[2]+E.mx[2])/2],on=[.008,.014,.006],bk=[.4,1,0];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.03,-.03,-.04),K6(.2,-.05,.0,-.06,.06,.14,.34),K6(pb1,-.048,-.002,-.054,.05,.16,.36),K6(pf0,-.049,-.001,-.056,.055,.15,.35),
         K6(pf1,-.05,-.003,-.064,.065,.14,.34),K6(ld1+.05,-.05,0,-.06,.06,.14,.34),K6(.88,.004,-.004,.002,-.01,-.02,-.02),K6(1)],
      R:{elb:[.46,-.24,-.04],A:[{grip:1},{tag:'bolt',at:kn}],k:[HK(0,0),HK(.07,0),HK(.17,1,[.035,.035,.04],.6,[.3,1,0],.3),HK(t0-.015,1,[.014,.02,.01],1,bk,.35),HK(t0,1,on,1,bk,.75),
         HK(ld1,1,on,1,bk,.75),HK(ld1+.03,1,[.024,.03,.02],1,bk,.15),HK(ld1+.1,1,[.04,.03,.04],.7,[.3,1,0],.5),HK(.9,0),HK(1,0)]},
      parts:[{tag:'bolt',ch:'rz',k:[[0,0],[lu0,0],[lu1,1.1],[ld0,1.1],[ld1,0,1]]},{tag:'bolt',ch:'pz',k:[[0,0],[pb0,0],[pb1,pl,1],[pf0,pl],[pf1,0,1]]}],
      E:[[t0,'bolt',.85,rt],[pb1,'',0,0,[.06,.15,.05]],[pf1,'',0,0,[.12,-.35,.06],[.006,0,.004]]],
      C:[[0,0,0,0],[.2,.006,.004,.012],[.88,0,0,0],[1,0,0,0]]}},
  // Break action: the thumb pushes the lever, the barrels drop open on the hinge, a look into the chambers, then a flick of the
  // wrist swings them shut with a heavy clack.
  break(P,G,m,L){const op=P.open||.62,lf=P.lift||0,sup=G.sup||[0,0,-.22];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,-.03,-.03),K6(.14,-.06,.01,-.04,-.02,.5,.08),K6(.27,-.064,.02+lf,-.045,-.06,.52,.1),K6(.54,-.065,.022+lf,-.046,-.05,.53,.1),
         K6(.6,-.058,.035+lf,-.045,.2,.48,.06),K6(.67,-.062,.024+lf,-.045,-.02,.51,.09),K6(.88,.004,-.004,.002,-.012,-.02,.02),K6(1)],
      H:{A:[{tag:'mag',at:sup}],k:[HK(0,0),HK(.12,0,null,0,null,.9),HK(.27,0,[0,-.006,0],.35,[0,-1,.3],.9),HK(.55,0,[0,-.006,0],.35,[0,-1,.3],.9),HK(.66,0),HK(1,0)]},
      parts:[{tag:'aux',ch:'ry',k:[[0,0],[.08,0],[.12,.5,1],[.6,.5],[.63,0]]},
             {tag:'mag',ch:'rx',k:[[0,0],[.12,0],[.21,-op*1.06,1],[.24,-op*.95],[.27,-op]],rel:.6,A:240,e:.16,home:['brk',.95,.82,[.22,1.1,0],[-.016,0,0]]}],
      E:[[.12,'brk',.55,1.05]],
      C:[[0,0,0,0],[.27,.012,0,-.01],[.55,.012,0,-.012],[.6,-.004,0,0],[.88,0,0,0],[1,0,0,0]]}},
  // Belt-fed: fingers under the top cover's back edge lift it, the hand lays the belt across the tray, pushes the cover down —
  // it slams — then pulls the charging handle back and runs it home.
  belt(P,G,m,L){const h=P.heavy||0,cv=fdExt(G,'cover'),cg=fdExt(G,'chg');
    const o0=.15,o1=.25,ly0=.3,ly1=.38,pu=.47,ch0=.6,cha=.66,chb=.77,chc=.83,chd=.9,pl=.075+h*.01;
    const cr=[cv.mn[0]+.008,cv.mx[1],cv.mn[2]+.6*(cv.mx[2]-cv.mn[2])],gp=[cg.mx[0],(cg.mn[1]+cg.mx[1])/2,(cg.mn[2]+cg.mx[2])/2],tray=[0,cv.mn[1]+.01,(cv.mn[2]+cv.mx[2])/2],on=[.004,-.026,.006],bk=[0,-1,0];// the cover by its left edge; the handle from below
    return {
      G:[K6(0),K6(.05,.003,-.006,0,-.02,-.02,-.02),K6(.14,-.03,-.004,-.012,.1,.07,.1),K6(ly1,-.03,.0,-.012,.11,.07,.12),K6(pu+.08,-.03,-.006,-.01,.08,.08,.12),
         K6(ch0,-.04,.02,-.02,.05,.08,.5),K6(chb,-.036,.016,-.014,.04,.09,.52),K6(chd,-.04,.02,-.02,.05,.08,.5),K6(.95,.003,-.003,.002,-.008,-.01,-.01),K6(1)],
      H:{A:[{sup:1},{tag:'cover',at:cr},{p:tray},{tag:'chg',at:gp},{p:[gp[0],gp[1],gp[2]+pl]}],k:[HK(0,0),HK(.03,0),
         HK(.1,1,[-.03,-.01,.04],.7,[-1,-.4,.2],.3),HK(o0,1,[0,-.012,.012],1,[0,-1,.3],.6),HK(o1,1,[0,-.012,.012],1,[0,-1,.3],.6),// lift the cover
         HK(ly0,2,[-.04,.05,.04],1,[-1,.3,0],.3),HK(ly0+.05,2,[-.03,.012,0],1,[0,1,0],.25),HK(ly1,2,[.04,.012,-.02],1,[0,1,0],.25),// lay the belt across
         HK(pu-.04,1,[0,.05,.01],1,[0,1,0],.2),HK(pu,1,[0,.028,.01],1,[0,1,0],.15),HK(pu+.06,1,[0,.028,.01],1,[0,1,0],.25),// push the cover shut
         HK(ch0,3,[-.03,-.08,.03],.9,[-1,-.3,0],.3),HK(cha,3,on,1,bk,.72),HK(chb,3,on,1,bk,.8),HK(chd,3,on,1,bk,.8),
         HK(chd+.03,3,[.01,-.06,.02],.9,[-1,-.3,0],.1),HK(.97,0),HK(1,0)]},
      parts:[{tag:'cover',ch:'rx',k:[[0,0],[o0,0],[o1,-.46],[o1+.04,-.4],[pu,-.42]],rel:pu,A:90,e:.15,home:['brk',.95,.7-h*.08,[.3+h*.1,-.8-h*.3,0],[.014,0,0]]},
             {tag:'chg',ch:'pz',k:[[0,0],[cha,0],[chb,pl,1],[chc,pl],[chd,0,1]]}],
      E:[[o0,'brk',.5,.9],[ly0+.03,'magin',.65,.72],[ly1-.03,'casing',.35,.6],[cha-.025,'chg',.7,.8-h*.1],[chd,'dry',.6,.7,[.1,-.25,0]]],
      C:[[0,0,0,0],[.14,.01,0,.006],[ly1,.012,0,.008],[ch0,.006,.006,.014],[.95,0,0,0],[1,0,0,0]]}},
  // Rotating barrels / drill / disc: a motor spins it up and lets it run down; the gun torques against it and buzzes.
  // Volcano: the drum is swiped round by hand and clicks to a stop on a chamber.
  spin(P,G,m,L){const sn=P.snd||['spinup',.8,1],ch=P.axis==='x'?'rx':'rz';
    if(sn[0]==='cylspin'){const E=fdExt(G,'spin'),sp=[E.mn[0],(E.mn[1]+E.mx[1])/2-.02,E.mx[2]-.08];// the drum's left side
      return {G:[K6(0),K6(.08,-.04,.02,-.03,.06,.2,-.15),K6(.25,-.045,.024,-.03,.065,.22,-.17),K6(.32,-.04,.02,-.03,.055,.2,-.12),K6(.75,-.042,.022,-.03,.06,.2,-.15),K6(.92,.003,-.003,0,-.01,-.01,-.01),K6(1)],
        H:{A:[{sup:1},{tag:'spin',at:sp,ride:0}],k:[HK(0,0),HK(.06,0),HK(.18,1,[-.03,-.05,.02],.8,[-1,-.3,0],.3),HK(.24,1,[-.022,-.012,0],1,[-1,0,0],.2),HK(.3,1,[-.02,.07,.01],1,[-1,.3,0],.1),HK(.5,0),HK(1,0)]},
        spins:[{tag:'spin',ch,kick:[[.27,-16]],fric:2.4,stop:.8,snap:TAU/6}],E:[[.27,sn[0],sn[1],sn[2]],[.8,'dry',.5,.8,[.05,-.2,0]]],C:[[0,0,0,0],[.25,.006,0,.008],[.9,0,0,0],[1,0,0,0]]}}
    const w=(P.rps||10)*TAU,up=sn[0]==='spinup'?.5/L:.35;
    return {
      G:[K6(0),K6(.08,-.01,.01,0,.05,.04,.06),K6(.5,-.012,.012,0,.06,.04,.06),K6(.9,.003,-.003,0,-.01,-.01,-.01),K6(1)],
      H:{A:[{sup:1}],k:[HK(0,0),HK(.05,0,null,0,null,.98),HK(.6,0,null,0,null,.98),HK(.9,0),HK(1,0)]},
      spins:[{tag:'spin',ch,motor:[[0,0],[.05,0],[.05+up,w],[.6,w],[.97,0]],resp:7,torque:ch==='rz'?.00035:0,shake:P.shake||.004,wmax:w}],
      E:[[.04,sn[0],sn[1],sn[2]]],C:[[0,0,0,0],[.4,.006,0,0],[.9,0,0,0],[1,0,0,0]]}},
  // Chainsaw: two yanks on the starter cord — the first coughs and dies, the second catches and the engine roars into life.
  saw(P,G,m,L){const E=fdExt(G,'chg'),gp=[E.mn[0],(E.mn[1]+E.mx[1])/2,(E.mn[2]+E.mx[2])/2];
    const p1=.15,p1b=p1+.13/L,p2=.4,p2b=p2+.13/L,cat=p2+.3/L;const ox=-.13,oy=.06,oz=.02,on=[-.012,.012,0],bk=[-1,.3,0];
    const pull=(k)=>[[0,0],[p1,0],[p1b,k,1],[p1b+.05,0,2],[p2,0],[p2b,k*1.08,1],[p2b+.05,0,2]];
    return {
      G:[K6(0),K6(.08,-.03,.06,-.07,.04,.12,-.26),K6(p1,-.03,.07,-.08,.04,.12,-.28),K6(p1b,-.04,.06,-.08,.0,.22,-.38),K6(p1b+.06,-.03,.068,-.08,.03,.14,-.27),
         K6(p2,-.03,.07,-.08,.04,.12,-.28),K6(p2b,-.042,.058,-.08,-.01,.24,-.4),K6(p2b+.06,-.03,.068,-.08,.03,.14,-.27),K6(.75,-.02,.04,-.05,.03,.08,-.18),K6(1)],
      H:{A:[{sup:1},{tag:'chg',at:gp}],k:[HK(0,0),HK(.05,0),HK(.11,1,[-.03,.035,.02],.8,bk,.3),HK(p1-.02,1,on,1,bk,.6),HK(p1,1,on,1,bk,.9),HK(p2b+.05,1,on,1,bk,.9),
         HK(p2b+.1,1,[-.04,.05,.02],.8,bk,.1),HK(.78,0),HK(1,0)]},
      parts:[{tag:'chg',ch:'px',k:pull(ox)},{tag:'chg',ch:'py',k:pull(oy)},{tag:'chg',ch:'pz',k:pull(oz)}],
      E:[[p1,'sawpull',.85,1],[p2,'sawpull',.9,1.06],[cat,'sawrev',.85,1,[.15,.4,0],[.01,0,0],'eng']],
      vib:[[0,0],[p1+.2/L,0],[p1+.24/L,.006],[p1+.42/L,0],[cat-.01,0],[cat+.02,.012],[cat+.15,.006],[1,.003]],eng0:0,
      C:[[0,0,0,0],[p1b,.004,.006,-.01],[p2b,.006,.008,-.012],[.8,0,0,0],[1,0,0,0]]}},
  // Crossbow: the hand draws the cocking slide back against the bow's pull (it gets harder toward the end) until the string
  // latches, then runs the slide home.
  xbow(P,G,m,L){const E=fdExt(G,'chg'),gp=[E.c[0],E.mx[1],E.mx[2]];const a=.22,b=a+.36/L,c=b+.06,on=[0,.026,-.006];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.01,.012,-.01,.2,.05,.1),K6(a,-.01,.012,-.01,.2,.05,.1),K6(b,-.008,.006,.008,.15,.06,.12),K6(c+.04,-.01,.012,-.01,.2,.05,.1),
         K6(.86,.003,-.004,.002,-.01,-.02,-.01),K6(1)],
      H:{A:[{sup:1},{tag:'chg',at:gp}],k:[HK(0,0),HK(.05,0),HK(.14,1,[-.03,.01,-.04],.7,[0,1,0],.3),HK(a-.02,1,[0,.04,-.012],1,[0,1,.1],.35),HK(a,1,on,1,[0,1,.1],.8),HK(c+.16,1,on,1,[0,1,.1],.8),
         HK(c+.21,1,[-.02,.05,-.02],.8,[0,1,0],.2),HK(.88,0),HK(1,0)]},
      parts:[{tag:'chg',ch:'pz',k:[[0,0],[a,0],[a+(b-a)*.55,.1],[b,.14,1],[c,.14],[c+.16,0]]}],
      E:[[a,'xbowcock',.75,1],[b,'',0,0,[.12,-.4,0],[.01,0,0]]],
      vib:[[0,0],[a+(b-a)*.5,0],[b-.01,.0025],[b+.01,0],[1,0]],
      C:[[0,0,0,0],[.18,.012,0,.006],[b,.006,0,.008],[.86,0,0,0],[1,0,0,0]]}},
  // Harpoon gun: the hand takes the spear sticking out of the muzzle and pushes it down the barrel until it locks.
  harpoon(P,G,m,L){const E=fdExt(G,'mag'),z0=E.mx[2]-.05,tr=.12;const a=.22,b=.46,c=.51,on=[-.014,.026,0],bk=[-.5,1,0];// the shaft just in front of the barrel
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.03,.03,.1,.06,.3,-.12),K6(b,-.028,.028,.11,.05,.32,-.12),K6(c,-.028,.025,.1,.04,.31,-.12),K6(.85,.003,-.004,0,-.01,-.02,.01),K6(1)],
      H:{elb:[-.2,-.6,-.4],A:[{sup:1},{tag:'mag',at:[0,E.mx[1],z0]}],k:[HK(0,0),HK(.05,0),HK(.15,1,[-.04,.0,.04],.7,bk,.3),HK(a,1,on,1,bk,.8),HK(b,1,on,1,bk,.85),HK(b+.06,1,[-.04,.04,.03],.9,bk,.2),HK(.8,0),HK(1,0)]},
      parts:[{tag:'mag',ch:'pz',k:[[0,-tr],[a,-tr],[b,-.02],[c,0,1]]}],
      E:[[a+.02,'slide',.5,.6],[c-.07/L,'magin',.75,.7],[c,'dry',.65,.75,[.12,0,0,.15],[.006,0,0]]],
      C:[[0,0,0,0],[.18,.006,.008,0],[.85,0,0,0],[1,0,0,0]]}},
  // Air tank: the hand twists the tank's valve open — a hiss, the gun shivering while the pressure comes up.
  tank(P,G,m,L){const E=fdExt(G,'mag'),gp=[.02,E.mx[1]-.01,E.mx[2]-.02];const a=.24,b=.4,on=[.006,.02,0],bk=[.3,1,0];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,.02,.03),K6(.18,-.02,.0,-.01,.08,.06,-.2),K6(b+.1,-.02,.0,-.01,.08,.06,-.22),K6(.86,.003,-.004,0,-.01,-.01,.01),K6(1)],
      H:{A:[{sup:1},{tag:'mag',at:gp}],k:[HK(0,0),HK(.05,0),HK(.15,1,[.03,-.02,.04],.7,bk,.3),HK(a,1,on,1,bk,.85),HK(b,1,on,1,bk,.9),HK(b+.06,1,[.03,.05,.02],.9,bk,.2),HK(.8,0),HK(1,0)]},
      parts:[{tag:'mag',ch:'rz',k:[[0,0],[a,0],[b,.75],[.85,.75],[.97,0]]}],
      E:[[a,'dry',.5,.6],[b,'hiss',.8,1,[.08,.2,0]]],
      vib:[[0,0],[b,0],[b+.04,.005],[.8,.002],[.92,0],[1,0]],
      C:[[0,0,0,0],[.18,.008,0,-.01],[.86,0,0,0],[1,0,0,0]]}},
  // The caged singularity wakes: the open hand hovers over it while it spins up, swells and hums.
  orb(P,G,m,L){const E=fdExt(G,'mag');
    return {
      G:[K6(0),K6(.1,-.01,.01,0,.09,.05,-.08),K6(.6,-.012,.012,0,.1,.06,-.1),K6(.9,.003,-.003,0,-.01,-.01,.01),K6(1)],
      H:{A:[{sup:1},{p:[E.c[0],E.mx[1],E.c[2]]}],k:[HK(0,0),HK(.08,0),HK(.25,1,[-.01,.05,0],.9,[0,1,0],-.1),HK(.6,1,[-.005,.045,0],.9,[0,1,0],-.05),HK(.75,0),HK(1,0)]},
      parts:[{tag:'mag',ch:'s',k:[[0,0],[.15,0],[.5,.35],[.72,.12],[.9,0]]}],
      spins:[{tag:'mag',ch:'ry',motor:[[0,0],[.1,0],[.5,56],[.8,20],[1,4]],resp:4}],
      E:[[.08,'bhole',.3,1.8],[.4,'hiss',.35,.6]],vib:[[0,0],[.2,0],[.5,.003],[.8,.001],[1,0]],
      C:[[0,0,0,0],[.3,.006,0,0],[.9,0,0,0],[1,0,0,0]]}},
  // Dragon cannons: the free hand comes up the beast's flank and slaps its neck awake — a round clicks up into the breech —
  // and the dragon's mouth breathes a puff of fire.
  dragon(P,G,m,L){const E=fdExt(G,'mag'),bb=G.parts.reduce((B,p)=>{for(let i=0;i<3;i++){B[0][i]=Math.min(B[0][i],p.c[i]-p.s[i]/2);B[1][i]=Math.max(B[1][i],p.c[i]+p.s[i]/2)}return B},[[9,9,9],[-9,-9,-9]]);
    const nk=[bb[0][0]*.8,bb[1][1]*.55,-.3],a=.2,s1=.32,b=.4,f=.6,bk=[-1,.4,0];// a spot high on the left flank
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.16,-.03,.02,-.01,.05,.16,-.12),K6(s1-.01,-.03,.022,-.01,.05,.17,-.13),K6(s1+.03,-.026,.012,-.008,.02,.2,-.09),
         K6(f-.04,-.03,.02,-.01,.05,.16,-.12),K6(f+.04,-.026,.03,.008,.17,.12,-.08),K6(.86,.003,-.004,0,-.01,-.02,-.01),K6(1)],
      H:{A:[{sup:1},{p:nk}],k:[HK(0,0),HK(.05,0),HK(a,1,[-.06,-.02,.02],.8,bk,.3),HK(s1-.04,1,[-.05,.04,.01],1,bk,.1),HK(s1,1,[-.022,0,0],1,bk,.15),HK(s1+.04,1,[-.03,-.005,.01],1,bk,.35),
         HK(s1+.14,1,[-.06,-.04,.02],.8,bk,.4),HK(.75,0),HK(1,0)]},
      parts:[{tag:'mag',ch:'py',k:[[0,-.07],[s1,-.07],[b-.03,-.006],[b,0,1]]}],
      E:[[s1,'khit',.5,.75,[.15,-.3,.3],[.008,.004,.012]],[b-.06/L,'shellin',.7,.8],[b,'',0,0,[.1,0,0]],[f,'flare',.7,1.2,[.15,.8,0],[.012,0,0],'flame']],
      C:[[0,0,0,0],[.16,.006,.004,-.008],[.86,0,0,0],[1,0,0,0]]}},
  // Duck foot: the free hand comes over the top and its thumb rolls the hammer back to full cock.
  cock(P,G,m,L){const E=fdExt(G,'aux'),gp=[E.c[0],E.mx[1],E.mx[2]];const a=.3,b=.42,on=[0,.024,.004],bk=[-.3,1,.2];
    return {
      G:[K6(0),K6(.06,.004,-.006,0,-.03,-.05,-.04),K6(.2,-.04,.04,-.01,.2,.45,.12),K6(b,-.038,.036,-.006,.17,.47,.13),K6(b+.08,-.04,.04,-.01,.2,.45,.12),K6(.86,.004,-.004,.002,-.012,-.03,-.02),K6(1)],
      H:{A:[{sup:1},{tag:'aux',at:gp}],k:[HK(0,0),HK(.06,0),HK(.17,1,[-.03,0,.06],.7,bk,.3),HK(a-.02,1,[-.004,.034,.012],1,bk,.35),HK(a,1,on,1,bk,.6),HK(b,1,on,1,bk,.7),HK(b+.06,1,[-.02,.05,.03],1,bk,.2),HK(.82,0),HK(1,0)]},
      parts:[{tag:'aux',ch:'rx',k:[[0,0],[a,0],[b,-.75,1],[.86,-.75],[.97,0]]}],
      E:[[b,'dry',.65,.7,[.06,-.25,0]]],
      C:[[0,0,0,0],[.2,.008,.006,.006],[.86,0,0,0],[1,0,0,0]]}},
  // Magnum launcher: the hand takes the barrel cluster and turns it a third of a turn until it clicks into line.
  barrel(P,G,m,L){const E=fdExt(G,'spin');const a=.24,b=.52,on=[-.02,0,0],bk=[-1,.3,0];
    return {
      G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.04,.02,-.02,.06,.22,-.2),K6(b,-.04,.02,-.02,.06,.23,-.22),K6(.86,.003,-.004,0,-.01,-.02,-.01),K6(1)],
      H:{A:[{sup:1},{tag:'spin',at:[E.mn[0],(E.mn[1]+E.mx[1])/2-.01,(E.mn[2]*.4+E.mx[2]*.6)]}],k:[HK(0,0),HK(.05,0),HK(.15,1,[-.04,-.04,.03],.7,bk,.3),HK(a,1,on,1,bk,.8),HK(b,1,on,1,bk,.85),HK(b+.06,1,[-.045,.02,.02],.8,bk,.3),HK(.82,0),HK(1,0)]},
      parts:[{tag:'spin',ch:'rz',k:[[0,0],[a,0],[b-.03,-TAU/3*1.04],[b,-TAU/3]]}],
      E:[[a+.02,'cylspin',.55,.8],[b,'dry',.6,.8,[.06,0,.2]]],
      C:[[0,0,0,0],[.2,.006,.004,.01],[.86,0,0,0],[1,0,0,0]]}}};

// ---- running a clip (VM side) ----
VM.firstDraw=function(raise,extra,P){this.draw(raise);const m=this.cur,W=WPN[this.id];const f=FDS[P.act];if(!f||!m||!W)return;for(const a of [m.armL,m.armR])if(a)a.userData.fdq=null;
  const st=raise*.62,d=raise+extra,L=d-st,S=f(P,GUNS[W.model],m,L);
  this.act={P,S,t:0,st,d,L,u:0,ev:(S.E||[]).slice().sort((a,b)=>a[0]-b[0]),ei:0,ps:(S.parts||[]).map(()=>({x:0,v:0,free:false,hits:0,done:false,sd:1,v1:0})),
    ss:(S.spins||[]).map(()=>({a:0,w:0,ki:0,wp:0})),cam:{p:{x:0,v:0},y:{x:0,v:0},r:{x:0,v:0}},hp:new THREE.Vector3(),hpR:new THREE.Vector3(),hw:null,hwR:null,eng:S.eng0==null?1:S.eng0}};
// a sound / kick / effect: [sound, vol, rate, [push up, pitch, roll, push back] gun kick, [pitch, yaw, roll] camera kick, effect]
VM.fdHit=function(h){const A=this.act,S=this.sp;if(h[0])AU.play(h[0],{vol:h[1],rate:h[2]});
  if(h[3]){S.py.v+=h[3][0];S.rx.v+=h[3][1];S.rz.v+=h[3][2]||0;S.pz.v+=h[3][3]||0}
  if(h[4]&&A){A.cam.p.v+=h[4][0]*30;A.cam.y.v+=(h[4][1]||0)*30;A.cam.r.v+=(h[4][2]||0)*30}
  const fx=h[5];if(fx==='flame'){this.flashT=.32;this.U.uMuzzle.value.setRGB(1.8,.7,.25);this.flash.scale.setScalar(2.2)}else if(fx==='eng'&&A)A.eng=1};
// one frame, after every other layer and before the view model's transform is written: the gun pose into K, parts, hand targets
VM.actFrame=function(dt,m,W,K){const A=this.act;if(!A)return;A.t+=dt;if(A.t<A.st)return;const S=A.S,G=GUNS[W.model];const u=A.u=clamp((A.t-A.st)/A.L,0,1);
  if(S.G){fdTrack(S.G,u,_fo);for(let i=0;i<6;i++)K[i]+=_fo[i]}
  // the two guns of a pair (mirrored)
  if(S.D&&m.gun2){const k=fdKey1(S.D,u),Q=S.DP;for(const [g,sd] of [[m.gun,1],[m.gun2,-1]]){g.position.x+=sd*Q[0]*k;g.position.y+=Q[1]*k;g.position.z+=Q[2]*k;g.rotation.x+=Q[3]*k;g.rotation.y+=sd*Q[4]*k;g.rotation.z+=sd*Q[5]*k}}
  // moving parts: keyed, then free under their spring
  if(S.parts)for(let i=0;i<S.parts.length;i++){const p=S.parts[i],s=A.ps[i],TT=p.two?m.tags2:m.tags,T=TT&&TT[p.tag],home=p.at||0;
    if(!s.free){s.x=p.k?fdKey1(p.k,u):0;if(p.rel!=null&&u>=p.rel){s.free=true;s.v=0;s.sd=Math.sign(s.x-home)||1}}
    else if(!s.done){const n=4,h=dt/n;for(let j=0;j<n;j++){s.v-=s.sd*p.A*h;s.x+=s.v*h;
        if(s.sd*(s.x-home)<=0){s.x=home;const sp=Math.abs(s.v);if(!s.hits){s.v1=sp;if(p.home)this.fdHit(p.home)}s.hits++;s.v=-s.v*(p.e||0);
          if(s.hits>3||Math.abs(s.v)<s.v1*.08){s.v=0;s.done=true;break}}}}
    if(T)fdApply(T,p.ch,s.x)}
  // turning parts
  if(S.spins)for(let i=0;i<S.spins.length;i++){const p=S.spins[i],s=A.ss[i],T=m.tags[p.tag];
    while(p.kick&&s.ki<p.kick.length&&u>=p.kick[s.ki][0]){s.w=p.kick[s.ki][1];s.ki++}
    if(p.motor){const tg=fdKey1(p.motor,u);s.w+=(tg-s.w)*Math.min(1,dt*(p.resp||5))}else s.w*=Math.exp(-(p.fric||2)*dt);
    if(p.stop!=null&&u>=p.stop){const q=p.snap||TAU;if(s.tg==null)s.tg=(s.w>=0?Math.ceil(s.a/q-.02):Math.floor(s.a/q+.02))*q;s.a+=(s.tg-s.a)*Math.min(1,dt*24);s.w=0}
    else s.a+=s.w*dt;
    // the gun twists against the motor's acceleration (smoothed) and buzzes with its speed; both fade out as the clip ends
    const al=(s.w-s.wp)/Math.max(dt,1e-3);s.wp=s.w;s.al=(s.al||0)+(al-(s.al||0))*Math.min(1,dt*8);if(T)fdApply(T,p.ch||'rz',s.a);const fo=1-smooth(clamp((u-.86)/.14,0,1));
    if(p.torque)K[5]-=clamp(s.al*p.torque,-.07,.07)*fo;if(p.shake)fdJit(K,Math.min(1,Math.abs(s.w)/(p.wmax||60))*p.shake*fo)}
  // hands (posed after the root transform, in actArms)
  A.hw=null;A.hwR=null;
  const rh=(g,d)=>g&&g.userData.hand?g.userData.hand.rest:d;
  if(S.H&&m.armL&&m.armL.visible){A.hw=fdHandAt(m,G,S.H,u,A.hp,rh(m.armL,.82)).slice()}
  if(S.R&&m.armR){A.hwR=fdHandAt(m,G,S.R,u,A.hpR,rh(m.armR,.95)).slice()}
  if(S.vib){const j=fdKey1(S.vib,u);if(j>0)fdJit(K,j)}
  // camera: keyed sway plus kicks ringing out
  const C=A.cam;vspr(C.p,0,260,dt);vspr(C.y,0,260,dt);vspr(C.r,0,260,dt);let cp=C.p.x,cy=C.y.x,cr=C.r.x;
  if(S.C){fdTrack(S.C,u,_fo);cp+=_fo[0];cy+=_fo[1];cr+=_fo[2]}this.camPitch+=cp;this.camYaw+=cy;this.camRoll+=cr;
  while(A.ei<A.ev.length&&u>=A.ev[A.ei][0]){const e=A.ev[A.ei++];this.fdHit(e.slice(1))}
  if(A.t>=A.d)this.act=null};
// the hands, once the view model's transform is in place (the elbows live in camera space)
VM.actArms=function(m){const A=this.act;if(!A||(!A.hw&&!A.hwR))return;m.root.updateMatrixWorld(true);
  const S=A.S,eL=S.H&&S.H.elb?_fEL.set(...S.H.elb):FD_ELB[0],eR=S.R&&S.R.elb?_fER.set(...S.R.elb):FD_ELB[1];
  for(const [arm,P,o,e,H] of [[m.armL,A.hp,A.hw,eL,S.H],[m.armR,A.hpR,A.hwR,eR,S.R]])if(o){fdArm(arm,P,o[0],H,A.u,e);vmHandCurl(arm,o[1])}};

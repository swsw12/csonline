'use strict';
// ============ Knife swings v2: clips on the first-draw engine (vmdraw.js) ============
// The fist stays round the grip and the knife moves with it; the forearm is carried to an elbow that travels with the stroke,
// so the arm swings from the shoulder instead of the whole view model turning as one stiff piece. Every swing has a wind-up
// that holds for a beat, a stroke that is fastest where the blade meets the target, a follow-through and an easy recovery.
// A blow that lands holds the clip still for a few hundredths of a second (hit-stop) and kicks the view.
// Light swings alternate: a forehand slash from right to left, then a backhand from left to right. The heavy attack is a
// raised stab driven straight in. Timings match the game's (WPN.knife.hitT): the blade is at the target at hitT.

// where the palm sits on the grip at rest (the arm's rest point is its wrist), and which way the back of the hand faces
function knGrip(m){const A=m.armR,q0=A.userData.q0,b=A.userData.base;
  const palm=new THREE.Vector3(0,-.004,-.045).applyQuaternion(q0).add(b),bk=new THREE.Vector3(0,1,0).applyQuaternion(q0);
  return {palm:[palm.x,palm.y,palm.z],bk:[bk.x,bk.y,bk.z]}}
const KN_ELB=[.26,-.46,-.04];// the right elbow at rest (camera space, as FD_ELB[1])
function knClip(heavy,side,m){if(!m||!m.armR||!m.armR.userData.q0)return null;const g=knGrip(m),bk=g.bk;
  const on=(u,c)=>HK(u,1,[0,0,0],1,bk,c==null?1:c);
  const R=(keys,elb)=>({A:[{grip:1},{p:g.palm}],k:[HK(0,0),...keys,HK(1,0)],elbT:elb});
  if(heavy){// raised high and drawn back, a held breath, then driven in and stopped dead; held there, drawn out
    return {G:[K6(0),K6(.16,.02,.07,.06,.45,-.1,-.2),K6(.3,.03,.1,.1,.62,-.16,-.28),K6(.34,.032,.104,.105,.65,-.17,-.3),
        [.43,-.08,.065,-.2,-.38,.1,.1,1],K6(.47,-.082,.062,-.205,-.39,.1,.1),K6(.6,-.08,.058,-.195,-.36,.09,.09),K6(.78,-.03,.015,-.05,-.08,.02,.02),K6(1)],
      R:R([on(.12,.95),on(.3,1),on(.43,1),on(.62,1),on(.85,.97)],[[0,...KN_ELB],[.18,.3,-.38,.04],[.34,.32,-.35,.07],[.45,.12,-.38,-.14],[.62,.13,-.39,-.13],[.84,.24,-.45,-.06],[1,...KN_ELB]]),
      C:[[0,0,0,0],[.3,.012,.004,-.006],[.43,-.022,-.004,.006],[.55,-.012,0,.002],[1,0,0,0]],trail:[.37,.6]}}
  const sd=side>0?1:-1;
  if(sd>0)// forehand: cocked out to the right, the blade laid back, then whipped across to the left and down
    return {G:[K6(0),K6(.18,.07,.07,.04,.3,-.55,-.45),K6(.26,.08,.08,.045,.33,-.63,-.51),K6(.38,-.1,.09,-.15,.08,.35,.25),
        K6(.5,-.26,0,-.08,-.15,.95,.55),K6(.64,-.23,-.02,-.05,-.13,.86,.5),K6(.82,-.06,-.004,-.012,-.035,.24,.14),K6(1)],
      R:R([on(.14,.95),on(.26),on(.38),on(.5),on(.66),on(.86,.97)],[[0,...KN_ELB],[.2,.36,-.38,.04],[.27,.37,-.37,.05],[.38,.16,-.4,-.13],[.5,-.02,-.46,-.11],[.64,0,-.47,-.09],[.84,.2,-.46,-.05],[1,...KN_ELB]]),
      C:[[0,0,0,0],[.26,.004,-.006,-.008],[.38,-.006,.012,.018],[.5,-.004,.014,.022],[.7,0,.004,.006],[1,0,0,0]],trail:[.29,.56]};
  // backhand: wound across the body to the left, then thrown out to the right, the back of the hand leading
  return {G:[K6(0),K6(.18,-.12,.08,-.02,.25,.6,.45),K6(.26,-.13,.088,-.026,.28,.67,.5),K6(.38,0,.09,-.15,.08,-.3,-.25),
      K6(.5,.12,.01,-.07,-.13,-.85,-.5),K6(.64,.1,-.01,-.04,-.1,-.76,-.45),K6(.82,.03,-.003,-.01,-.025,-.2,-.12),K6(1)],
    R:R([on(.14,.95),on(.26),on(.38),on(.5),on(.66),on(.86,.97)],[[0,...KN_ELB],[.2,.08,-.42,-.1],[.27,.06,-.41,-.11],[.38,.22,-.4,-.12],[.5,.36,-.41,-.03],[.64,.34,-.42,-.02],[.84,.28,-.45,-.03],[1,...KN_ELB]]),
    C:[[0,0,0,0],[.26,.004,.006,.008],[.38,-.006,-.012,-.018],[.5,-.004,-.014,-.022],[.7,0,-.004,-.006],[1,0,0,0]],trail:[.29,.56]}}
// the game's hooks (vm.js calls knSwing from VM.melee; weapons.js calls VM.meleeHit when the blade lands)
VM.knSwing=function(heavy){const m=this.cur,W=WPN[this.id];if(!m||!W)return false;
  const side=this.knSide=heavy?(this.knSide||1):(this.knSide>0?-1:1);let S=null;try{S=knClip(heavy,side,m)}catch(e){console.error(e)}if(!S)return false;
  // the clip ends a little before the next swing may start, so a hit-stop never runs into it
  const d=heavy?.75:Math.min(.4,(W.rate?W.rate[0]:.45)-.06);const A=this.playClip(S,0,d,'mel');if(!A)return false;A.mel=1;this.mel=null;this.trail.S.length=0;return true};
VM.meleeHit=function(heavy,what){const A=this.act;if(!A||!A.mel||A.fade)return;// what: 1 a body, 2 a wall
  A.hold=what===1?(heavy?.085:.055):.035;const k=what===1?(heavy?1:.7):.45;A.cam.p.v-=.5*k;A.cam.r.v+=(A.S.C&&A.S.C[2]?Math.sign(A.S.C[2][3]||0):0)*.6*k;this.sp.pz.v+=.35*k};

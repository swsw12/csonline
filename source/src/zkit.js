'use strict';
// ============ v7.10: three new zombies to pick — what they share: atlas slots, first-person tools, pose states, the tools' sounds ============
// 광부 좀비 (zminer.js: burrows), 도축업자 좀비 (zbutcher.js: a hook on a chain), 고적대 좀비 (zdrummer.js: a war drum). Each claws with a
// tool in hand — its body and the tool in its fist are design.js's, its swings models.js poseZombie's (KF.mnA … KF.drH). This file has
// the weapon-atlas slots for their first-person arms and tools, the first-person rigs (buildClaws: m.zp poses both arms each frame and
// m.zt gives the trail of the tool's edge, vm.js), a hook on visState for the classes' own pose fields (ZK.st), and the swings' sounds.
const ZK={cls:{miner:1,butcher:1,drummer:1},vm:{},st:{},sw:{}};
const isZk=a=>!!a&&a.team===TZ&&!!ZK.cls[a.zc];

// ---------- atlas: the arms' sleeves and skins, earth, chain, the cleaver's blade, the drum, gold braid, felt ----------
const ZK_MATS=['sl_miner','sl_drummer','mnDirt','bhChain','bhBlade','drShell','drHead','drGold','drFelt','mnHaft','mnIron'];
for(const m of ZK_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
for(const m of ['zs_miner','zs_butcher','zs_drummer']){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}if(!GA_ZARMS.includes(m))GA_ZARMS.push(m)}// (the zombie-arm painter: gunart.js)
function paintZkAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0),AD=k=>(typeof ARM_DESIGN!=='undefined'&&ARM_DESIGN[k])||['#555555','#888888'];
  // the miner's sleeve: dark canvas with its folds and coal dust; the drummer's: red wool
  {const b=AD('sl_miner')[0];patch('sl_miner',(xx,y,X,Y)=>{const t=nz(X,Y,7201,20)+Math.sin(xx*.18+hash2(Math.floor(y/12),2,7202)*4)*.1;let c=t>.62?lt(b,.07):t<.38?dk(b,.16):b;
    if(nz(X,Y,7203,9)>.66)c=dk(c,.22);if(hash2(X,Y,7204)<.02)c='#1a1c1e';if(y<2||y>125)c=dk(c,.3);return c})}
  {const b=AD('sl_drummer')[0];patch('sl_drummer',(xx,y,X,Y)=>{const t=nz(X,Y,7211,18)+(hash2(X,Y,7212)-.5)*.14;let c=t>.62?lt(b,.06):t<.38?dk(b,.14):b;if(((xx+y*2)%5)===0)c=dk(c,.06);
    if(nz(X,Y,7213,24)>.7)c=mix(c,'#3a1210',.35);if(y<2||y>125)c=dk(c,.3);return c})}
  // gold braid: a twisted cord, bright twists on dark gold
  patch('drGold',(xx,y)=>{const tw=((xx+y)%8+8)%8;let c=tw<3?'#e8c058':tw<6?'#b88a2c':'#7a5a1a';if(hash2(xx,y,7221)<.03)c='#f4dc8a';return c},250);
  // the pickaxe: a dark, worn hickory haft black with coal dust where the hands go; the head's rough forged iron with rust in its pits
  patch('mnHaft',(xx,y,X,Y)=>{const g=Math.sin(y*.35+nz(X,Y,7291,22)*7)*.5+.5;let c=mix('#3e2c1a','#6a4a2c',g);const d=nz(X,Y,7292,14);if(d>.62)c=dk(c,.3);if(d<.3)c=lt(c,.06);
    if(hash2(X,Y,7293)<.012)c='#8a6a44';return c});
  patch('mnIron',(xx,y,X,Y)=>{const t=nz(X,Y,7301,9)+(hash2(X,Y,7302)-.5)*.16;let c=t>.62?'#4e5052':t<.36?'#262829':'#383a3c';const r=nz(X,Y,7303,16);
    if(r>.66)c=mix(c,r>.74?'#6a3a1e':'#4a2e1c',.7);if(hash2(Math.floor(xx/3),y,7304)<.012)c='#8a8e90';return c},248);
  // earth thrown up by a burrow: brown-grey soil, stones
  patch('mnDirt',(xx,y,X,Y)=>{const t=nz(X,Y,7231,10),s=nz(X,Y,7232,5);let c=t>.6?'#5e5242':t<.38?'#3a3228':'#4c4234';if(s>.72)c=lt(c,.18);if(s<.22)c=dk(c,.25);if(hash2(X,Y,7233)<.02)c='#8a8270';return c});
  // chain: oval links end to end, every other one edge on; rust here and there
  patch('bhChain',(xx,y,X,Y)=>{const L=16,j=Math.floor(y/L),v=(y%L)-L/2+.5,u=(xx%16)-7.5;let c='#141416';
    if(j&1){if(Math.abs(u)<2.2)c=Math.abs(u)<1?'#8a8e92':'#5a5e62'}else{const d=Math.hypot(u/6.5,v/9);if(d<1&&d>.55)c=d<.75?'#9a9ea2':'#5c6064'}
    if(c!=='#141416'&&hash2(X,Y,7241)<.08)c='#6a3a2a';return c},252);
  // the cleaver's blade: brushed steel smeared with blood (grime below the full blood setting)
  patch('bhBlade',(xx,y,X,Y)=>{const t=hash2(Math.floor(xx/12),y,7251);let c=t>.7?'#c8ccd0':t<.3?'#8a9096':'#aab0b6';const b=nz(X,Y,7252,18);
    if(b>.58)c=mix(c,GORE.lv>=2?'#5a0606':'#4a4038',clamp((b-.58)*3,0,.85));if(y<4)c='#e4e8ec';return c},250);
  // the drum: red lacquer; its head off-white calf with a painted gold ring and a red centre; felt for the mallets
  // (the drum's parts are round across their axis, gunart.js partGeo cyl: the shell's faces each wrap a quarter of it, so the cord runs corner to
  // corner of the patch; a head's patch squares come out as rings)
  patch('drShell',(xx,y,X,Y)=>{const t=nz(X,Y,7261,22);let c=t>.62?'#c62420':t<.38?'#8e1612':'#aa1c18';if(hash2(X,Y,7262)<.006)c='#e85040';
    const v=y/127,u=xx/127,w=1-Math.abs(2*v-1),d=Math.min(Math.abs(u-(.1+.8*w)),Math.abs(u-(.9-.8*w)))*127;if(d<2.2)c=d<1.2?'#efe9da':'#a8a090';return c},248);
  patch('drHead',(xx,y,X,Y)=>{const r=Math.max(Math.abs(xx-63.5),Math.abs(y-63.5));let c=nz(X,Y,7271,14)>.6?'#ece6d6':'#ddd6c4';if(r>50&&r<56)c='#c89a34';else if(r<9)c='#c89a34';else if(r<17)c='#b21e1a';
    if(hash2(X,Y,7272)<.01)c='#a89e88';if(GORE.lv>=2&&nz(X,Y,7273,20)>.72)c=mix(c,'#6a0a08',.6);return c});
  patch('drFelt',(xx,y,X,Y)=>{const t=nz(X,Y,7281,6);let c=t>.6?'#f2ece0':t<.35?'#cfc6b2':'#e2dacc';if(nz(X,Y,7282,20)>.7)c=GORE.lv>=2?'#6a1010':'#8a8070';return c});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintZkAtlas()}}
{const gr=gaGoreRepaint;gaGoreRepaint=function(){gr();paintZkAtlas()}}// (the blood on the blade, the drum, the felt follows the blood setting)

// ---------- first person: arms with a fist round a tool, tools as part lists (grip at the origin, the tool along -z) ----------
// the arm: a fist (the human arm in the zombie's skin, curled round the haft) or a claw (the zombie arm)
function zkArm(sleeve,hand,mat,o){o=o||{};const g=new THREE.Group();
  const a=o.claws?armMesh(sleeve,hand,mat,{claws:1,cuff:o.cuff}):armMesh(sleeve,hand,mat,{left:!!o.left,cuff:o.cuff});if(!o.claws)vmHandCurl(a,o.curl==null?1:o.curl,o.tc);
  g.add(a);lookArm(a,[0,0,0],[o.left||o.L?-.25:.25,-.5,1]);return g}
// a tool held in an arm's fist: a group at the grip that the pose turns (its wrist)
function zkTool(arm,parts,mat,at){const T=new THREE.Group();T.position.set(...(at||[0,-.012,-.045]));const m=new THREE.Mesh(partGeo(parts),mat);m.frustumCulled=false;T.add(m);arm.children[0].add(T);return T}
{const bc=buildClaws;buildClaws=function(zk,U){const B=ZK.vm[zk];if(!B)return bc(zk,U);const mat=matVM(GA.texVM,U),root=new THREE.Group();
  const K=B(mat,root);root.add(K.armR);root.add(K.armL);
  return {id:'claw',root,gun:root,tags:{},armR:K.armR,armL:K.armL,mat,vd:false,doll:null,fmTank:null,zp:K.zp,zt:K.zt||null,zq:K.zq||null,zk:K}}}
// the claw arm's light swipe (vm.js, the stock claws), for a free hand: side -1 = the left arm
function zkClawSwipe(V,A,p,sd){kfv(VMK.clL,p,_zkk);const S1=A[sd>0?0:1];for(let i=0;i<6;i++)S1[i]=_zkk[i];if(sd<0){S1[0]=-_zkk[0];S1[3]=-_zkk[3]}
  const O=A[sd>0?1:0],k=Math.sin(p*Math.PI);O[2]+=k*.05;O[1]-=k*.03;V.camRoll=sd*Math.sin(clamp((p-.3)/.4,0,1)*Math.PI)*.035;V.camYaw=sd*Math.sin(clamp((p-.3)/.4,0,1)*Math.PI)*.02;
  return p>.36&&p<.64}
const _zkk=[0,0,0,0,0,0,0,0,0],_zkv=new THREE.Vector3();
// a key track for a hand with a tool: [[t,[hand x,y,z, toward-elbow x,y,z, pitch, yaw, roll]],...] (zkAim); the arm's six go into A[i],
// the whole key comes back
function zkPose(K,p,A,i,out){const o=kfv(K,p,out||_zkk);for(let j=0;j<6;j++)A[i][j]=o[j];return o}
// a held tool aimed in the view's own space: its haft points (pitch up, yaw to the right) out of the fist and its head's leading side — the
// tool's -x: the pick's point, the cleaver's edge — faces down the swing, turned roll about the haft (roll > 0 turns it to the left of an
// upright haft). The rig's m.zq (vm.js, once the arms are placed) turns each tool's group so, whatever the fist's own turn.
const _zkQ=new THREE.Quaternion(),_zkQ2=new THREE.Quaternion(),_zkM=new THREE.Matrix4(),_zkX=new THREE.Vector3(),_zkY=new THREE.Vector3(),_zkZ=new THREE.Vector3(),_zkD=new THREE.Vector3(),_zkL=new THREE.Vector3();
function zkDir(pitch,yaw,out){const cp=Math.cos(pitch);return out.set(cp*Math.sin(yaw),Math.sin(pitch),-cp*Math.cos(yaw))}
function zkAim(T,pitch,yaw,roll){zkDir(pitch,yaw,_zkD);const sp=Math.sin(pitch),cp=Math.cos(pitch);_zkL.set(sp*Math.sin(yaw),-cp,-sp*Math.cos(yaw));if(roll)_zkL.applyAxisAngle(_zkD,roll);
  _zkZ.copy(_zkD).negate();_zkX.copy(_zkL).negate();_zkY.crossVectors(_zkZ,_zkX);_zkM.makeBasis(_zkX,_zkY,_zkZ);_zkQ.setFromRotationMatrix(_zkM);
  T.parent.getWorldQuaternion(_zkQ2);T.quaternion.copy(_zkQ2.invert().multiply(_zkQ))}
// the other hand on the same haft, nearer its butt (two-handed blows): where along the haft (m from the grip, negative = towards the butt)
function zkSecond(A,o,along,out){zkDir(o[6],o[7],_zkv);const L=out||A[1];L[0]=A[0][0]+_zkv.x*along-.02;L[1]=A[0][1]+_zkv.y*along;L[2]=A[0][2]+_zkv.z*along+.02;
  L[3]=-.32;L[4]=-.62;L[5]=.72;return L}

// ---------- the classes' own pose fields (models.js poseZombie reads them; the kill cam records them with the rest) ----------
{const vs=visState;visState=function(a,dt){const st=vs(a,dt);if(a.team===TZ){const f=ZK.st[a.zc];if(f)f(a,st,dt)}return st}}

// ---------- the tools' swings: a heavier whoosh for the pickaxe, a quick hiss of the cleaver, the mallets' thrum ----------
// ZK.sw[class] = [sound, volume, rate]; the miner's and the butcher's every other light blow is the free hand's claw (the claw's own sound)
function zkSwing(a,heavy){const S=ZK.sw[a.zc];if(!S||a.team!==TZ)return false;const free=!heavy&&(a.an.atkSide||1)<0&&(a.zc==='miner'||a.zc==='butcher');if(free)return false;
  const r=S[2]*(heavy?.85:1)*rr(.95,1.05);if(a.isPlayer)AU.play(S[0],{vol:S[1],rate:r});else AU.at(S[0],a.c.x,a.c.y+1.4,a.c.z,{vol:S[1]*.8,range:32,rate:r});return true}
Object.assign(ZK.sw,{miner:['mnswing',.75,1],butcher:['bhswing',.7,1],drummer:['drswing',.65,1]});
// another page's zombie swings (net.js 'c'): its tool's whoosh with the growl
{const nd=netDoFx;netDoFx=function(a,f){const r=nd(a,f);if(f&&f[0]==='c'&&a&&a.alive&&isZk(a)&&!a.isPlayer)zkSwing(a,!!f[2]);return r}}

// ---------- sounds ----------
function zkThud(B,t,f0,f1,len,lvl,dst){const e=B.env(t,.002,lvl,len,dst);B.osc('sine',f0,f1,t,len+.03,e)}
Object.assign(SFX,{
  // the pickaxe: a slow, heavy whoosh with a low woom under it; the cleaver: a quick, thin hiss; the mallet: a soft round thrum
  mnswing:{n:3,dur:.5,peak:.8,gain:.62,pj:.05,poly:3,fn:B=>{whoosh(B,220,950,.32,.8);const e=B.env(.04,.06,.35,.2);B.nz('brown',.04,.3,B.f('lowpass',260,.7,e))}},
  bhswing:{n:3,dur:.35,peak:.8,gain:.58,pj:.06,poly:3,fn:B=>{whoosh(B,700,3000,.18,.75);B.ring(.1,rr(2400,2700),[1,1.6],[.08,.05],[.06,.03])}},
  drswing:{n:3,dur:.35,peak:.75,gain:.5,pj:.06,poly:3,fn:B=>{whoosh(B,320,1300,.22,.65);const e=B.env(.03,.04,.3,.12);B.nz('pink',.03,.18,B.f('lowpass',700,.7,e))}},
  // the miner: the pick biting into the ground (a dull clank, earth giving way, gravel); the rumble under the floor (played on repeat while it
  // burrows); the burst out of the ground (a deep thump, a spray of earth and stones)
  mndig:{n:2,dur:1.1,ch:2,peak:.9,gain:.85,rev:.15,poly:3,fn:B=>{const out=B.comp(-10,4,.002,.15,B.g(.95));
    B.ring(0,rr(380,430),[1,2.3,3.9],[.18,.1,.06],[.5,.25,.12],out);B.grain(0,2600,1.2,.02,.6,out);zkThud(B,0,120,55,.25,.9,out);
    for(const s of [-1,1]){const e=B.env(.02,.03,.7,.45,B.pan(s*.4,out));B.nz('brown',.02,.55,B.f('lowpass',420,.7,e))}
    for(let i=0;i<22;i++){const t=.05+Math.pow(Math.random(),1.5)*.7;B.grain(t,rr(900,3200),rr(2,5),rr(.006,.016),rr(.08,.28)*(1-t),B.pan(rr(-.8,.8),out))}}},
  mnrumble:{n:3,dur:1.1,ch:2,peak:.75,gain:.6,rev:.1,poly:4,fn:B=>{const out=B.g(.9);
    for(const s of [-1,1]){const g=B.g(1,B.pan(s*.5,out));const e=B.env(0,.25,.8,.6,g,.15);B.nz('brown',0,1.05,B.f('lowpass',rr(140,190),.8,e));B.am(g,0,1,22,.5)}
    for(let i=0;i<10;i++){const t=rr(0,.9);B.grain(t,rr(500,1600),rr(2,5),rr(.008,.02),rr(.05,.14),B.pan(rr(-.8,.8),out),'brown')}}},
  mnburst:{n:2,dur:2,ch:2,peak:.95,gain:.95,rev:.22,poly:3,fn:B=>{const out=B.comp(-12,5,.002,.2,B.f('highpass',35,.7,B.g(.95)));const bus=B.sh(1.6,out);
    zkThud(B,0,82,32,.7,1.1,B.sh(2.4,out));for(const s of [-1,1]){const e=B.env(0,.004,1,.7,B.pan(s*.4,bus));const lp=B.f('lowpass',2400,.7,e);B.sweep(lp,2600,180,.003,.8);B.nz('brown',0,.9,lp)}
    {const e=B.env(0,.002,.6,.12,bus);B.nz('white',0,.15,B.f('bandpass',1800,.8,e))}
    for(let i=0;i<40;i++){const t=.08+Math.pow(Math.random(),1.4)*1.3;B.grain(t,rr(700,4200),rr(2,6),rr(.006,.02),rr(.06,.3)*(1-t/1.5),B.pan(rr(-.9,.9),out))}
    for(let i=0;i<5;i++){const t=rr(.25,1.1);const e=B.env(t,.002,rr(.2,.4),.05,B.pan(rr(-.7,.7),out));B.nz('brown',t,.07,B.f('lowpass',rr(250,420),.7,e))}}},
  // the butcher: the chain rattling as it is swung (many small links), the throw (a whoosh trailing links), the hook going in (a wet thunk,
  // a clank, the chain jingling), the chain snapping (a sharp ring, links scattering), the chain dragged in (a short rattle on repeat)
  bhrattle:{n:3,dur:.6,ch:2,peak:.8,gain:.55,poly:3,fn:B=>{const out=B.g(.9);let t=0;for(let i=0;i<18;i++){t+=rr(.012,.03);B.ring(t,rr(2600,4800),[1,1.45],[.03,.02],[.12*(1-t/.6),.06*(1-t/.6)],B.pan(rr(-.5,.5),out))}}},
  bhthrow:{n:2,dur:.8,ch:2,peak:.85,gain:.7,rev:.08,poly:3,fn:B=>{const out=B.g(.9);whoosh(B,400,2200,.3,.8,out);let t=.05;for(let i=0;i<26;i++){t+=rr(.008,.022);B.ring(t,rr(2400,5000),[1,1.5],[.025,.018],[.11*(1-t/.75),.05],B.pan(rr(-.6,.6),out))}}},
  bhhit:{n:3,dur:.8,ch:2,peak:.9,gain:.85,rev:.1,poly:3,fn:B=>{const out=B.comp(-10,4,.002,.12,B.g(.95));const e=B.env(0,.002,1,.1,out);B.nz('brown',0,.14,B.f('lowpass',380,.8,e));
    zkThud(B,0,150,70,.12,.7,out);B.ring(.008,rr(1500,1800),[1,2.1,3.3],[.2,.12,.07],[.35,.18,.08],out);let t=.03;for(let i=0;i<14;i++){t+=rr(.01,.03);B.ring(t,rr(2800,5000),[1,1.45],[.03,.02],[.1,.05],B.pan(rr(-.5,.5),out))}}},
  bhsnap:{n:2,dur:.9,ch:2,peak:.9,gain:.85,rev:.12,poly:2,fn:B=>{const out=B.g(.9);B.grain(0,5200,.8,.006,1,out);B.ring(0,rr(2100,2400),[1,1.37,2.2,3.1],[.25,.16,.1,.06],[.45,.3,.16,.08],out);
    let t=.02;for(let i=0;i<16;i++){t+=rr(.01,.04);B.ring(t,rr(2600,5200),[1,1.5],[.04,.02],[.12*(1-t/.8),.05],B.pan(rr(-.8,.8),out))}}},
  // the drummer: the bass drum (a deep boom, the beater's slap, the shell ringing); the snare-like rattle of its first beat
  drboom:{n:4,dur:1.2,ch:2,peak:.95,gain:.95,rev:.25,poly:6,pj:.02,fn:B=>{const out=B.comp(-10,4,.002,.2,B.f('highpass',30,.7,B.g(.95)));
    zkThud(B,0,rr(70,78),rr(44,48),.55,1.1,B.sh(1.8,out));zkThud(B,0,rr(140,150),rr(90,96),.18,.35,out);
    {const e=B.env(0,.0008,.5,.025,out);B.nz('white',0,.04,B.f('bandpass',rr(1800,2400),.9,e))}{const e=B.env(0,.002,.35,.09,out);B.nz('pink',0,.12,B.f('lowpass',900,.7,e))}
    for(const s of [-1,1]){const e=B.env(.01,.03,.22,.6,B.pan(s*.5,out));B.nz('brown',.01,.7,B.f('lowpass',220,.7,e))}}}});
SFX_ORDER.push('mnswing','bhswing','drswing','mndig','mnrumble','mnburst','bhrattle','bhthrow','bhhit','bhsnap','drboom');

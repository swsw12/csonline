'use strict';
// ============ v7.10: STORMCHAIN (스톰체인) — a capacitor rifle that throws lightning (supply crates only) ============
// Our own design. Every pull of the trigger throws a bolt along the aim; a zombie within a few degrees of it draws the bolt to itself
// (SCH.LOCK — the HUD marks the one it would take), and from the zombie it strikes the lightning jumps on to the nearest zombies within
// SCH.R m with a clear line between them, up to SCH.N more, each taking SCH.K of the one before. Every strike staggers.
// Right click: OVERCHARGE — SCH.OC.cost cells into the coil, SCH.OC.delay s of a rising whine, then one thick bolt (WPN ocDmg) forking
// through up to SCH.OC.n zombies within SCH.OC.R m with a thunderclap that throws them back (once every SCH.OC.cd s).
// 40 cells a capacitor: the glowing glass cell on top is lifted out of its clamps and a fresh one pressed in.
// Network: a bolt is an ordinary shot (fireGun → stmShot: a client's hit is its claim, others' shots are replayed for the look); an
// overcharge is the alt fire's 'x' (a heavy hit in the claim). The jumps are the host's: its damageActor finds and hurts them
// (SCH.chain); every page draws them for itself, choosing them the same way from where the bodies are on it.

// ---------- numbers ----------
// R / N / K: the jumps' reach, how many, what each takes of the last; LOCK / LR: the pull of the bolt (rad off the aim, m);
// OC: the overcharge (cells, the charge-up, the wait before the next, its jumps, what each takes, the lock's width)
const SCH={R:6.5,N:3,K:.65,LOCK:.07,LR:34,STAG:.3,
  OC:{cost:10,delay:.42,cd:1.6,n:6,R:8,K:.85,stag:.9,lock:.12}};

// ---------- atlas: copper coil windings, the glowing glass cell, the arc's self-lit blue-white ----------
const STM_MATS=['stmCopper','stmGlass','stmGlow'];
for(const m of STM_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintStmAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // copper: tight windings (bright tops, dark gaps between turns), heat-darkened here and there, green verdigris in the gaps
  patch('stmCopper',(xx,y,X,Y)=>{const w=(y%6);let c=w<2?'#e8a05a':w<4?'#c0703a':'#6a3818';const t=nz(X,Y,7401,14);if(t>.64)c=dk(c,.25);if(w>=4&&nz(X,Y,7402,8)>.7)c='#4a8a6a';
    if(hash2(X,Y,7403)<.01)c='#ffd8a0';return c},250);
  // the cell: pale blue glass lit from inside, a brighter core band and drifting streaks
  patch('stmGlass',(xx,y,X,Y)=>{const t=nz(X,Y,7411,12),b=Math.abs(xx-63.5)/64,s=Math.sin(y*.12+t*5);let c=b<.25?'#e8f6ff':b<.6?'#8ccaff':'#4a8ad8';if(s>.92)c='#ffffff';else if(t<.3&&b>.4)c='#3a6ab8';return c},232);
  // the arc: blue-white, nearly white at its heart
  patch('stmGlow',(xx,y,X,Y)=>{const t=nz(X,Y,7421,8);return t>.6?'#ffffff':t>.4?'#c8ecff':'#7ac0ff'},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintStmAtlas()}}

// ---------- the model ----------
// gun frame as every rifle (origin at the grip, the barrel along -Z): a dark steel receiver with brass terminals, the charge pips along its
// left (tags g1..g4) and the power switch (sw: the first draw flips it, vmdraw.js FDS.rail); on top the glass cell in two clamps (tag mag);
// the coil: a white insulator, eleven copper windings round a steel rod, a copper collar and three prongs at the muzzle with glowing
// tips and the arcs between them (tags arc1..arc3: they flicker in first person); the heat shield under the coil and its cable; a pistol
// grip; a skeleton stock of steel tubes over a battery pack
function stmSeg(p,q,w,m,tag){const dx=q[0]-p[0],dy=q[1]-p[1],dz=q[2]-p[2],L=Math.hypot(dx,dy,dz)||1e-4;
  return Pt((p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,w,w,L,m,{rx:Math.atan2(-dy/L,dz/L),ry:Math.asin(clamp(dx/L,-1,1)),tag})}
function stmParts(){const P=[],X=[1,-1],S='blk2',C='stmCopper',Gl='stmGlass',L='stmGlow',Y=.05;
  // the receiver
  P.push(Pt(0,.05,-.06,.058,.078,.26,S,{r:.008}),Pt(0,.093,-.06,.05,.01,.22,'blk',{r:.003}),Pt(0,.02,-.06,.05,.02,.24,'blk',{r:.004}),
    ...X.flatMap(s=>[Pt(s*.031,.07,-.14,.008,.016,.016,'brass',{cyl:'x',r:.002}),Pt(s*.031,.07,-.0,.008,.016,.016,'brass',{cyl:'x',r:.002}),Pt(s*.0296,.05,-.07,.002,.03,.1,'blk')]));
  for(let i=0;i<4;i++)P.push(...TAG('g'+(i+1),[Pt(-.0302,.034,-.115+i*.02,.002,.008,.012,L)]));
  P.push(...TAG('sw',[Pt(-.034,.078,.035,.006,.012,.024,'steel',{r:.002}),Pt(-.038,.078,.046,.006,.018,.006,'red')]));
  // the cell in its clamps
  P.push(Pt(0,.1,-.075,.026,.012,.13,'steel',{r:.003}),...[-.025,-.125].map(z=>Pt(0,.118,z,.054,.054,.014,S,{cyl:'z',r:.003})));
  P.push(...TAG('mag',[Pt(0,.118,-.075,.044,.044,.15,Gl,{cyl:'z',r:.01}),Pt(0,.118,-.002,.05,.05,.012,'brass',{cyl:'z',r:.003}),Pt(0,.118,-.148,.05,.05,.012,'brass',{cyl:'z',r:.003}),
    Pt(0,.118,.008,.016,.016,.01,'steel',{cyl:'z',r:.003})]));
  // the coil
  P.push(Pt(0,Y,-.2,.052,.052,.032,'white',{cyl:'z',r:.006}),Pt(0,Y,-.355,.016,.016,.3,'steel',{cyl:'z',r:.004}));
  for(let i=0;i<11;i++)P.push(Pt(0,Y,-.228-i*.021,.047,.047,.012,C,{cyl:'z',r:.004}));
  P.push(Pt(0,Y,-.465,.04,.04,.02,C,{cyl:'z',r:.004}),Pt(0,Y,-.478,.02,.02,.012,'steel',{cyl:'z',r:.003}));
  const tips=[];for(let k=0;k<3;k++){const an=Math.PI/2+k*TAU/3,px=Math.cos(an)*.018,py=Y+Math.sin(an)*.018;
    P.push(Pt(px,py,-.507,.007,.007,.062,C,{r:.002}),Pt(px,py,-.54,.011,.011,.011,L,{r:.005}));tips.push([px,py,-.54])}
  // the arcs between the prongs' tips: each a little zigzag of two strokes
  for(let k=0;k<3;k++){const a=tips[k],b=tips[(k+1)%3],m=[(a[0]+b[0])/2,(a[1]+b[1])/2,-.54];const o=[m[0]-(m[0])*.9,m[1]-(m[1]-Y)*.9,-.546];
    P.push(stmSeg(a,o,.0032,L,'arc'+(k+1)),stmSeg(o,b,.0032,L,'arc'+(k+1)))}
  // the heat shield and its cable
  P.push(Pt(0,.012,-.32,.05,.03,.2,'rub',{r:.01}),...[-.26,-.3,-.34,-.38].map(z=>Pt(0,-.0035,z,.052,.004,.01,'blk')),Pt(.023,.03,-.185,.012,.012,.11,'rub',{rx:.28,r:.005}));
  // the grip and guard, the stock tubes, the battery pack and its warning stripe, the butt pad
  P.push(...pGrip('rub',-.065,.05,.26),...tGuard(0),Pt(0,.05,.17,.014,.014,.2,'blk2',{cyl:'z',rx:.06,r:.003}),Pt(0,-.006,.19,.014,.014,.17,'blk2',{cyl:'z',rx:-.4,r:.003}),
    Pt(0,.035,.14,.034,.05,.08,'blk',{r:.006}),Pt(.0175,.035,.14,.002,.012,.07,'yellow'),Pt(0,.03,.272,.042,.11,.02,'rub',{r:.006}));
  return P}
GUNS.storm={parts:stmParts(),grip:[0,-.03,.03],sup:[0,.012,-.32],muzzle:[0,.05,-.548],mag:[0,.118,-.075],eject:[.03,.07,-.06]};

// ---------- stats ----------
WPN.storm={slot:1,kind:'special',crate:1,cat:'special',n:['스톰체인','Stormchain'],cost:6500,mag:40,res:120,dmg:40,rpm:400,storm:1,alt:'storm',ocDmg:140,ocKb:7,
  spread:[.004,.014,.045],rec:[.012,.006],kickX:[.25,.4,.25],kb:1.2,stag:.3,hs:1.6,reload:3.2,draw:1,speed:.93,snd:'stmzap',model:'storm',hold:'rifle',
  bd:['보급 전용 · 번개가 조준 근처 좀비에게 휘어 꽂힘 · 맞은 좀비에서 주변 3마리에게 연쇄 · 우클릭 과충전: 셀 10개로 6마리를 꿰뚫는 벼락','Crates only · the bolt bends to a zombie near the aim · jumps on to 3 more round it · RMB overcharge: 10 cells for a thunderbolt through 6']};
VM_POS.storm={p:[.15,-.172,-.4],r:[0,.08,.035]};
GUN_DESIGN.storm={mag:40,ch:0,act:'rail',x:.9};WPN.storm.fd=GUN_DESIGN.storm;WPN.storm.ch=0;
CRATE_GUNS.push('storm');{const c=BUY_MENU.find(q=>q.k==='special');if(c&&!c.items.includes('storm'))c.items.push('storm')}
if(!SHOP_NOTSOLD.includes('storm'))SHOP_NOTSOLD.push('storm');
// the cell comes out of the top (the top-magazine reload, vmrel.js)
{const rk=rlKind;rlKind=function(W,G){if(W.model==='storm')return 'top';return rk(W,G)}}

// ---------- who a bolt takes ----------
const stmOk=(a,t)=>!!t&&t.alive&&t!==a&&t.team===TZ&&foe(a,t)&&!(t.reviving>0)&&!t.mnB&&!t.epHide&&!(t.zc==='runner'&&t.skillT>0);
const stmChest=t=>t.c.y+(t.c.h||1.8)*.6;
// the zombie a bolt bends to: the nearest to the aim within the cone, in sight
SCH.lock=function(a,eye,dir,cone,range){let best=null,bc=Math.cos(cone);
  for(const t of G.actors){if(!stmOk(a,t))continue;const ty=stmChest(t),dx=t.c.x-eye.x,dy=ty-eye.y,dz=t.c.z-eye.z,d=Math.hypot(dx,dy,dz);if(d>range||d<.4)continue;
    const cs=(dx*dir.x+dy*dir.y+dz*dir.z)/d;if(cs<bc)continue;if(!losClear(eye.x,eye.y,eye.z,t.c.x,ty,t.c.z))continue;bc=cs;best={t,x:t.c.x,y:ty,z:t.c.z}}
  return best};
// the jumps from a zombie struck: each time the nearest one not yet struck, within reach and with a clear line from the last
SCH.chain=function(a,t0,oc){const R=oc?SCH.OC.R:SCH.R,N=oc?SCH.OC.n:SCH.N,out=[],used=[t0];let p=t0;
  for(let i=0;i<N;i++){let best=null,bd=R;const px=p.c.x,py=stmChest(p),pz=p.c.z;
    for(const t of G.actors){if(used.includes(t)||!stmOk(a,t))continue;const ty=stmChest(t),d=Math.hypot(t.c.x-px,ty-py,t.c.z-pz);if(d>=bd)continue;if(!losClear(px,py,pz,t.c.x,ty,t.c.z))continue;bd=d;best=t}
    if(!best)break;used.push(best);out.push({t:best,x:best.c.x,y:stmChest(best),z:best.c.z});p=best}
  return out};

// ---------- a bolt (fireGun's W.storm; the overcharge's thunderbolt) ----------
const _scD=new THREE.Vector3();
function stmShot(a,W,eye,base,sp,oc){const dir=_scD;spreadDir(base,sp,dir);const ox=eye.x,oy=eye.y,oz=eye.z;
  let hw=rayCast(ox,oy,oz,dir.x,dir.y,dir.z,110,SHOT_FILTER),tW=hw?hw.t:110,ha=rayActors(a,ox,oy,oz,dir.x,dir.y,dir.z,tW);
  // nothing on the line: the bolt bends to a zombie close to it
  if(!ha||ha.a.team!==TZ){const L=SCH.lock(a,eye,dir,oc?SCH.OC.lock:SCH.LOCK,SCH.LR);
    if(L){dir.set(L.x-ox,L.y-oy,L.z-oz).normalize();hw=rayCast(ox,oy,oz,dir.x,dir.y,dir.z,110,SHOT_FILTER);tW=hw?hw.t:110;ha=rayActors(a,ox,oy,oz,dir.x,dir.y,dir.z,tW)}}
  const tEnd=ha?ha.t:tW,ex=ox+dir.x*tEnd,ey=oy+dir.y*tEnd,ez=oz+dir.z*tEnd;
  const mz=muzzleWorld(a);SCH.bolt(mz.x,mz.y,mz.z,ex,ey,ez,oc?1.7:1,oc?.28:.085,oc?2:0);SCH.flash(mz.x,mz.y,mz.z,oc);
  let hit=false,hs=false,dmg=0;
  if(ha){const t=ha.a,ds=hsForce(a,ha);hs=ha.part==='head';dmg=(oc?W.ocDmg:W.dmg)*(hs?(W.hs||1.5):ha.part==='legs'?.8:1);hit=true;
    damageActor(t,dmg,a,{w:'storm',hs,ds,heavy:!!oc,oc:oc?1:0,dir:[dir.x,dir.y,dir.z],kb:oc?W.ocKb:W.kb,stag:oc?SCH.OC.stag:W.stag,x:ex,y:ey,z:ez});
    SCH.zap(ex,ey,ez,oc,true);if(hs&&a.isPlayer&&!t.isPlayer)AU.play('headshot',{vol:.6});
    // the jumps (drawn on every page from its own bodies; the host's damageActor hurts them: the hook below)
    if(t.team===TZ){let px=ex,py=ey,pz=ez;for(const c of SCH.chain(a,t,oc)){SCH.bolt(px,py,pz,c.x,c.y,c.z,oc?1.3:.7,oc?.24:.1,oc?1:0);SCH.zap(c.x,c.y,c.z,oc,false);px=c.x;py=c.y;pz=c.z}}}
  else if(hw){const m=hw.box.o.f&&hw.box.o.f[nf([hw.nx,hw.ny,hw.nz])]||hw.box.mat;FX.impact(ex,ey,ez,hw.nx,hw.ny,hw.nz,m);
    for(let k=0;k<(oc?14:5);k++)FX.spark(ex,ey,ez,hw.nx*rr(1,3)+rr(-1.5,1.5),rr(0,2.5),hw.nz*rr(1,3)+rr(-1.5,1.5),rr(.12,.3),[.6,.85,1]);
    FX.spawn({x:ex+hw.nx*.03,y:ey+hw.ny*.03,z:ez+hw.nz*.03,life:.12,s0:oc?.5:.22,s1:oc?1.2:.5,r:.6,g:.85,b:1,a:.8,f:1,add:1});if(!AU.throttle('stmw',90))AU.at('imp_metal',ex,ey,ez,{vol:.35,range:25,rate:1.4})}
  return {hit,hs,dmg}}

// ---------- the lightning: jagged ribbons facing the camera, all bolts in one mesh rebuilt every frame ----------
// a bolt: from p to q, w its width, life s, forks small side branches; its kinks are thrown again every frame (the crackle)
SCH.bolts=[];SCH.MAXQ=1800;
SCH.bolt=function(x0,y0,z0,x1,y1,z1,w,life,forks){if(SCH.bolts.length>40)SCH.bolts.shift();const L=Math.hypot(x1-x0,y1-y0,z1-z0);if(L<.05)return;
  SCH.bolts.push({p:[x0,y0,z0],q:[x1,y1,z1],L,w,t:0,life,n:clamp(Math.round(L/.45),4,26),seed:Math.random()*1e4,forks:forks||(L>4&&Math.random()<.5?1:0)})};
SCH.mesh=null;
SCH.ensure=function(){if(SCH.mesh)return;const N=SCH.MAXQ,g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*12),3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*12),3).setUsage(THREE.DynamicDrawUsage));
  const ix=new Uint16Array(N*6);for(let i=0;i<N;i++){const v=i*4,k=i*6;ix[k]=v;ix[k+1]=v+1;ix[k+2]=v+2;ix[k+3]=v+2;ix[k+4]=v+1;ix[k+5]=v+3}g.setIndex(new THREE.BufferAttribute(ix,1));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.frustumCulled=false;m.renderOrder=7;SCH.mesh=m};
const _scA=new THREE.Vector3(),_scB=new THREE.Vector3(),_scC=new THREE.Vector3(),_scS=new THREE.Vector3(),_scP=[];
SCH.draw=function(dt){const B=SCH.bolts;if(!B.length){if(SCH.mesh)SCH.mesh.visible=false;return}SCH.ensure();const m=SCH.mesh;if(m.parent!==R.scene)R.scene.add(m);m.visible=true;
  const pos=m.geometry.attributes.position.array,col=m.geometry.attributes.color.array,cam=R.cam.position;let q=0;
  // (a ribbon is never wider on screen than cap × its distance: the stretch nearest the eye stays a thread, not a smear)
  const quad=(ax,ay,az,bx,by,bz,hw,cap,r,g,b)=>{if(q>=SCH.MAXQ)return;_scA.set(bx-ax,by-ay,bz-az);_scC.set(cam.x-(ax+bx)/2,cam.y-(ay+by)/2,cam.z-(az+bz)/2);hw=Math.min(hw,_scC.length()*cap);
    _scS.crossVectors(_scA,_scC);const l=_scS.length();if(l<1e-6)return;_scS.multiplyScalar(hw/l);const o=q*12;
    pos[o]=ax+_scS.x;pos[o+1]=ay+_scS.y;pos[o+2]=az+_scS.z;pos[o+3]=ax-_scS.x;pos[o+4]=ay-_scS.y;pos[o+5]=az-_scS.z;
    pos[o+6]=bx+_scS.x;pos[o+7]=by+_scS.y;pos[o+8]=bz+_scS.z;pos[o+9]=bx-_scS.x;pos[o+10]=by-_scS.y;pos[o+11]=bz-_scS.z;
    for(let k=0;k<4;k++){col[o+k*3]=r;col[o+k*3+1]=g;col[o+k*3+2]=b}q++};
  // a jagged line from p to q: n kinks, thrown sideways off the straight line by up to amp (less near the ends)
  const path=(p,qq,n,amp,s)=>{_scP.length=0;const dx=qq[0]-p[0],dy=qq[1]-p[1],dz=qq[2]-p[2];_scB.set(dx,dy,dz).normalize();_scA.set(0,1,0);if(Math.abs(_scB.y)>.9)_scA.set(1,0,0);
    _scC.crossVectors(_scB,_scA).normalize();_scA.crossVectors(_scC,_scB).normalize();
    for(let i=0;i<=n;i++){const u=i/n,e=Math.sin(u*Math.PI),a1=(hash2(i,s,7431)-.5)*2*amp*e,a2=(hash2(i,s,7432)-.5)*2*amp*e;
      _scP.push(p[0]+dx*u+_scC.x*a1+_scA.x*a2,p[1]+dy*u+_scC.y*a1+_scA.y*a2,p[2]+dz*u+_scC.z*a1+_scA.z*a2)}return _scP};
  for(let i=B.length-1;i>=0;i--){const b=B[i];b.t+=dt;if(b.t>=b.life){B.splice(i,1);continue}const k=1-b.t/b.life,fl=.75+.25*Math.sin(b.t*90+b.seed),f=k*fl;
    const s=Math.floor(b.seed+G.t*40),amp=Math.min(.55,b.L*.07)*(.8+.4*b.w/2);
    const P=path(b.p,b.q,b.n,amp,s);
    for(let j=0;j+3<P.length;j+=3){const ax=P[j],ay=P[j+1],az=P[j+2],bx=P[j+3],by=P[j+4],bz=P[j+5];
      quad(ax,ay,az,bx,by,bz,.045*b.w,.016,.09*f,.24*f,.62*f);quad(ax,ay,az,bx,by,bz,.009*b.w,.0032,.85*f,.95*f,f)}
    // its forks: a short branch off a kink in the first half, thrown again with it (their roots taken before the path array is reused)
    const fo=[];for(let fk=0;fk<b.forks;fk++){const j=3*Math.max(1,Math.floor(b.n*(.2+.3*hash2(fk,s,7433))));if(P[j]!=null)fo.push(P[j],P[j+1],P[j+2])}
    for(let fk=0;fk*3<fo.length;fk++){const fx=fo[fk*3],fy=fo[fk*3+1],fz=fo[fk*3+2];
      const l=Math.min(1.6,b.L*.25),ex=fx+(hash2(fk,s,7434)-.5)*l+(b.q[0]-b.p[0])/b.L*l*.5,ey=fy+(hash2(fk,s,7435)-.5)*l,ez=fz+(hash2(fk,s,7436)-.5)*l+(b.q[2]-b.p[2])/b.L*l*.5;
      const F=path([fx,fy,fz],[ex,ey,ez],5,l*.12,s+fk*13);for(let jj=0;jj+3<F.length;jj+=3){const g=f*.7;quad(F[jj],F[jj+1],F[jj+2],F[jj+3],F[jj+4],F[jj+5],.024*b.w,.012,.07*g,.2*g,.5*g);
        quad(F[jj],F[jj+1],F[jj+2],F[jj+3],F[jj+4],F[jj+5],.005*b.w,.0025,.7*g,.85*g,g)}}}
  const G0=m.geometry;G0.setDrawRange(0,q*6);G0.attributes.position.needsUpdate=true;G0.attributes.color.needsUpdate=true;if(!q)m.visible=false};
// where a bolt strikes: a white-blue burst, sparks, a flash of light, a crackle
SCH.zap=function(x,y,z,oc,first){FX.spawn({x,y,z,life:oc?.2:.1,s0:oc?.7:.3,s1:oc?1.6:.6,r:.55,g:.82,b:1,a:.9,f:1,add:1});
  for(let k=0;k<(oc?12:4);k++)FX.spark(x,y,z,rr(-3,3),rr(-1,3),rr(-3,3),rr(.12,.3),[.65,.88,1]);
  if(oc)FX.spawn({x,y,z,life:.35,s0:.4,s1:3,r:.5,g:.8,b:1,a:.5,f:14,add:1});
  DL.add(x,y,z,'#8ac8ff',oc?7:4,oc?5:2.6,oc?.22:.08);if(!first&&!AU.throttle('stmh',60))AU.at('stmzap',x,y,z,{vol:oc?.55:.3,range:30,rate:1.35})};
SCH.flash=function(x,y,z,oc){FX.spawn({x,y,z,life:oc?.12:.05,s0:oc?.35:.15,s1:oc?.7:.3,r:.6,g:.85,b:1,a:.9,f:1,add:1});DL.add(x,y,z,'#9ad2ff',oc?6:3,oc?4:2,oc?.15:.05)};

// ---------- the overcharge (right click) ----------
// the shooter's page spends the cells and starts it; every other page sees it start (the alt fire's 'x') and draws the same
SCH.alt=function(a,W){const am=a.ammo.storm,g=NET.ghost>0;
  if(!g){if(!am||G.t<(a.stmCd||0)||a.reloadT>0||a.drawT>0||G.t<a.nextFire-.05)return;
    if(am.mag<SCH.OC.cost){if(a.isPlayer&&!AU.throttle('stmno',700)){AU.play('dry',{vol:.5});HUD.note(LI()?'Overcharge needs 10 cells':'과충전에 셀 10개가 필요해요',1.2)}return}
    a.stmCd=G.t+SCH.OC.cd;a.nextFire=Math.max(a.nextFire,G.t+SCH.OC.delay+.32);am.mag-=SCH.OC.cost;nyAltFx(a)}
  a.stmChg=G.t;
  if(a.isPlayer)AU.play('stmcharge',{vol:.6});else AU.at('stmcharge',a.c.x,a.c.y+1.4,a.c.z,{vol:.65,range:45});
  nyLater(SCH.OC.delay,()=>{if(!a.alive||a.cur!=='storm'||a.team!==TH)return;SCH.blast(a,W)})};
SCH.blast=function(a,W){const eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const base=_dv.clone();const r=stmShot(a,W,eye,base,0,true);
  if(a.isPlayer){AU.play('stmblast',{vol:1});FX.shake=Math.max(FX.shake,.32);a.punchP+=.05;VM.fire(W,0);if(r.hit)HUD.hitmark(r.hs)}
  else AU.at('stmblast',eye.x,eye.y,eye.z,{vol:1,range:120,occ:false});
  if(typeof SNDV!=='undefined')SNDV.ping(a,'shot',90);a.lastFire=G.t;alertBots(a,eye.x,eye.z)};

// ---------- first person: the pips show the charge, the arcs at the muzzle flicker, the flash is blue-white ----------
VMX.storm=function(V,a,dt,o,m){const T=m.tags,am=a.ammo&&a.ammo.storm;if(!T)return;const n=am?Math.ceil(am.mag/WPN.storm.mag*4-1e-6):0;
  for(let i=1;i<=4;i++){const g=T['g'+i];if(g)g.visible=i<=n}
  const chg=G.t-(a.stmChg||-9),ch=chg>=0&&chg<SCH.OC.delay,fire=G.t-(a.lastFire||-9)<.06;
  for(let i=1;i<=3;i++){const t=T['arc'+i];if(t)t.visible=!!am&&am.mag>0&&(ch||fire||Math.random()<.3)}
  {const mu=V.U&&V.U.uMuzzle&&V.U.uMuzzle.value;if(mu){const k=Math.max(mu.r,mu.g,mu.b)/1.2;if(k>.004)mu.setRGB(.5*k,.8*k,1.45*k)}}// (the muzzle's light on the gun: blue-white)
  // the charge-up: the gun shudders and rises a little as the coil fills
  if(ch){const k=chg/SCH.OC.delay;o[0]+=(Math.random()-.5)*.004*k;o[1]+=(Math.random()-.5)*.004*k+.01*k;o[3]+=.02*k}};

// (and the flash at the muzzle is tinted blue while it is in hand)
{const vs=VM.set;VM.set=function(id,sk){const r=vs.apply(this,arguments);const f=this.flash&&this.flash.material;
  if(f){if(id==='storm'){f.color.setRGB(.55,.8,1.35);this.stmTint=1}else if(this.stmTint){this.stmTint=0;if(!(typeof jnW==='function'&&jnW(id)))f.color.setRGB(1,1,1)}}return r}}

// ---------- the HUD: a mark on the zombie the bolt would bend to ----------
const SCHH={el:null,t:0,tg:null};const _scv=new THREE.Vector3();
function stmHud(dt){const P=G.player,on=!!(P&&P.alive&&P.team===TH&&P.cur==='storm'&&G.st!=='menu'&&!G.spec);
  if(!on){if(SCHH.el)SCHH.el.style.display='none';SCHH.tg=null;return}
  if(!SCHH.el){const e=SCHH.el=document.createElement('div');e.id='stmLock';$('hud').appendChild(e)}
  SCHH.t-=dt;if(SCHH.t<=0){SCHH.t=.08;const e=actorEye(P);aimDir(P.yaw,P.pitch,_dv);const ha=rayActors(P,e.x,e.y,e.z,_dv.x,_dv.y,_dv.z,SCH.LR);
    const L=ha&&ha.a.team===TZ?null:SCH.lock(P,e,_dv,SCH.LOCK,SCH.LR);SCHH.tg=L?L.t:null}
  const t=SCHH.tg;if(!t||!t.alive){SCHH.el.style.display='none';return}
  _scv.set(t.c.x,stmChest(t),t.c.z).project(R.cam);const vis=_scv.z<1&&Math.abs(_scv.x)<1&&Math.abs(_scv.y)<1;SCHH.el.style.display=vis?'block':'none';
  if(vis){SCHH.el.style.left=((_scv.x+1)*50)+'%';SCHH.el.style.top=((1-_scv.y)*50)+'%'}}

// ---------- hooks ----------
(function(){
  // the overcharge is the alt fire
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='storm')return SCH.alt(a,W);return na(a,W)};
  // the host's word on the jumps: whoever a bolt struck, the lightning goes on from there (a client's overcharge comes as a heavy hit)
  const da=damageActor;damageActor=function(t,dmg,src,o){const r=da.apply(this,arguments);
    if(o&&o.w==='storm'&&!o.sc&&!NET.ghost&&!NET.cli&&src&&t&&t.team===TZ&&G.st!=='end'&&G.st!=='over'){const W=WPN.storm,oc=!!(o.oc||o.heavy);let k=1,px=t.c.x,pz=t.c.z;
      for(const c of SCH.chain(src,t,oc)){k*=oc?SCH.OC.K:SCH.K;const dx=c.x-px,dz=c.z-pz,dd=Math.hypot(dx,dz)||1;
        da(c.t,(oc?W.ocDmg:W.dmg)*k,src,{w:'storm',sc:1,dir:[dx/dd,.1,dz/dd],kb:(oc?W.ocKb:W.kb)*.7,stag:oc?SCH.OC.stag:SCH.STAG,x:c.x,y:c.y,z:c.z});px=c.x;pz=c.z}}
    return r};
  const nu=nyUpdate;nyUpdate=function(dt){nu(dt);try{SCH.draw(dt)}catch(e){console.error(e)}};
  const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);try{stmHud(dt)}catch(e){console.error(e)}};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();SCH.bolts.length=0;for(const a of G.actors){a.stmCd=0;a.stmChg=-9}};
})();

// ---------- sounds (all synthesised) ----------
Object.assign(SFX,{
  // a bolt: the snap of the spark gap (a hard white crack), the coil's buzz under it, a bright falling zing
  stmzap:{n:4,dur:.45,ch:2,peak:.9,gain:.62,rev:.1,poly:8,pj:.04,fn:B=>{const o=B.comp(-12,4,.001,.1,B.g(.95));
    {const e=B.env(0,.0006,1,.035,B.f('highpass',1800,.7,o));B.nz('white',0,.05,e)}
    {const e=B.env(0,.001,.55,.12,B.f('bandpass',rr(3200,4200),1.2,o));B.nz('white',0,.15,e)}
    {const g=B.g(1,o);const e=B.env(0,.002,.35,.16,g);B.osc('sawtooth',rr(110,125),rr(95,105),0,.2,B.f('lowpass',1400,.8,e));B.am(g,0,.2,rr(55,65),.6)}
    {const e=B.env(.004,.002,.22,.1,o);B.osc('sine',rr(5200,6000),1600,.004,.12,e)}
    for(let i=0;i<5;i++)B.grain(rr(0,.09),rr(2500,6000),2,rr(.003,.008),rr(.15,.35),B.pan(rr(-.5,.5),o))}},
  // the overcharge filling: a whine climbing with the coil, crackling more as it goes, a hum under it
  stmcharge:{n:2,dur:.6,ch:2,peak:.85,gain:.6,rev:.12,poly:2,fn:B=>{const o=B.g(.9);
    {const e=B.env(0,.05,.45,.08,o,.33);B.osc('sine',380,2400,0,.48,e);const e2=B.env(0,.05,.18,.08,o,.33);B.osc('square',190,1200,0,.48,B.f('lowpass',2600,.7,e2))}
    {const g=B.g(1,o);const e=B.env(0,.1,.3,.1,g,.3);B.osc('sawtooth',80,120,0,.5,B.f('lowpass',600,.8,e));B.am(g,0,.5,60,.5)}
    for(let i=0;i<16;i++){const t=Math.pow(Math.random(),.6)*.42;B.grain(t,rr(2400,6500),2,rr(.003,.007),rr(.1,.3)*(t/.42+.3),B.pan(rr(-.6,.6),o))}}},
  // the thunderbolt: a cracking split, the clap, the roll of thunder going away, the coil's buzz dying
  stmblast:{n:2,dur:2.4,ch:2,peak:.95,gain:.95,rev:.3,poly:2,fn:B=>{const o=B.comp(-12,5,.001,.25,B.f('highpass',30,.7,B.g(.95)));const bus=B.sh(1.8,o);
    {const e=B.env(0,.0005,1,.05,B.f('highpass',1200,.7,bus));B.nz('white',0,.07,e)}
    for(let i=0;i<6;i++){const t=rr(0,.06);const e=B.env(t,.0008,rr(.4,.8),rr(.02,.05),B.pan(rr(-.6,.6),o));B.nz('white',t,.08,B.f('bandpass',rr(2000,5000),1.4,e))}
    {const e=B.env(.01,.002,1,.5,B.sh(2.4,o));B.osc('sine',rr(70,80),30,.01,.6,e)}
    for(const s of [-1,1]){const e=B.env(.04,.05,.7,1.4,B.pan(s*.5,o));B.nz('brown',.04,1.9,B.f('lowpass',rr(240,320),.7,e))}
    {const g=B.g(1,o);const e=B.env(0,.004,.3,.5,g);B.osc('sawtooth',115,70,0,.6,B.f('lowpass',1100,.8,e));B.am(g,0,.6,58,.6)}
    for(let i=0;i<20;i++){const t=.05+Math.pow(Math.random(),1.6)*.8;B.grain(t,rr(2200,6500),2,rr(.003,.008),rr(.08,.25)*(1-t),B.pan(rr(-.8,.8),o))}}}});
SFX_ORDER.push('stmzap','stmcharge','stmblast');

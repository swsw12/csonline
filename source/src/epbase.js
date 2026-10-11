'use strict';
// ============ Chapter base (v6.21): what every chapter of the zombie scenario shares ============
// CHAP[n]   a chapter's definition, registered by its own file (aleph.js, argus.js, ...): stages, radio, boss, map hooks (episode.js runs it)
// EPZ[zc]   what the chapter's own zombies do on top of the scenario's AI: tick, controls, damage in / out, claws, death, the rig's extras
// and the toys they share: red floor warnings (TELE), knockdowns and blinding for humans (epFx), laser sights (ELAS), enemy bullets
// (EBUL), thrown grenades / flashbangs / smoke canisters (EGREN), smoke clouds (ESMK), ammo boxes (EPK).
// Host-authoritative like the rest of the scenario: the host decides every hit and tells the clients what to draw.
const CHAP={},EPZ={};
const EPD=v=>v*SC_DIFF.dmg[G.diff||0]/.75;// a pattern's damage on normal, scaled to the difficulty
const EPTW=()=>[1.3,1,.9,.8][G.diff||0];// wind-up / warning time per difficulty

// ---------- floor warnings: a red outline and a fill that grows until the blow lands ----------
const TELE={list:[],geo:null,tc:null,tr:null,id:0,
  init(){if(this.geo)return;this.geo=new THREE.PlaneGeometry(1,1);this.geo.rotateX(-Math.PI/2);
    const mk=(w,h,f)=>{const [cv,x]=mkCanvas(w,h);const id=x.createImageData(w,h),D=id.data;
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=f((i+.5)/w*2-1,(j+.5)/h*2-1),k=(j*w+i)*4;D[k]=D[k+1]=D[k+2]=255;D[k+3]=clamp(a,0,1)*255}
      x.putImageData(id,0,0);const t=new THREE.CanvasTexture(cv);t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t};
    this.tc=mk(128,128,(u,v)=>{const r=Math.hypot(u,v);return r>1?0:r>.9?1-(r-.9)*3:.2+.14*r});
    this.tr=mk(32,128,(u,v)=>Math.max(Math.abs(u),Math.abs(v))>.88?1:.2)},
  mat(tex,col){return new THREE.MeshBasicMaterial({map:tex,color:col||0xff2a14,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})},
  // o: {k:'c', x,y,z, r, d} or {k:'r', x,y,z, yaw, w, l, d}: a strip from x,z running l metres along yaw; d = seconds until it lands
  add(o,remote){this.init();const T=Object.assign({},o,{t:0,id:++this.id});if(!(T.d>0))T.d=.6;
    T.m=[0,1].map(()=>{const m=new THREE.Mesh(this.geo,this.mat(T.k==='c'?this.tc:this.tr,T.col));m.renderOrder=3;m.frustumCulled=false;R.scene.add(m);return m});
    this.place(T,0);this.list.push(T);
    if(NET.host&&!remote)netEv('ept',{k:T.k,x:r2(T.x),y:r2(T.y),z:r2(T.z),r:r2(T.r||0),w:r2(T.w||0),l:r2(T.l||0),yaw:r3(T.yaw||0),d:r2(T.d),c:T.col||0});return T},
  place(T,f){const [o,fl]=T.m;
    if(T.k==='c'){o.position.set(T.x,T.y+.04,T.z);o.scale.set(T.r*2,1,T.r*2);const s=Math.max(.02,f)*T.r*2;fl.position.set(T.x,T.y+.05,T.z);fl.scale.set(s,1,s)}
    else{const fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw),L=Math.max(.02,f)*T.l;o.position.set(T.x+fx*T.l/2,T.y+.04,T.z+fz*T.l/2);o.rotation.y=T.yaw;o.scale.set(T.w,1,T.l);
      fl.position.set(T.x+fx*L/2,T.y+.05,T.z+fz*L/2);fl.rotation.y=T.yaw;fl.scale.set(T.w,1,L)}
    const out=T.t>T.d?Math.max(0,1-(T.t-T.d)/.25):1;o.material.opacity=(.55+.4*Math.max(0,Math.sin(G.t*(f>.7?28:12))))*out;fl.material.opacity=(.25+.3*f)*out},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const T=this.list[i];T.t+=dt;if(T.t>T.d+.25){this.drop(T);this.list.splice(i,1);continue}this.place(T,clamp(T.t/T.d,0,1))}},
  drop(T){for(const m of T.m){R.scene.remove(m);m.material.dispose()}},
  clear(){for(const T of this.list)this.drop(T);this.list=[]},
  // a live warning over this point and the way out of it (bots step out)
  at(x,z,pad){pad=pad||0;for(const T of this.list){if(T.t>T.d)continue;
      if(T.k==='c'){const dx=x-T.x,dz=z-T.z,d=Math.hypot(dx,dz);if(d<T.r+pad)return {ax:d>.05?dx/d:1,az:d>.05?dz/d:0}}
      else{const fx=-Math.sin(T.yaw),fz=-Math.cos(T.yaw),rx=Math.cos(T.yaw),rz=-Math.sin(T.yaw),dx=x-T.x,dz=z-T.z,al=dx*fx+dz*fz,sd=dx*rx+dz*rz;
        if(al>-pad&&al<T.l+pad&&Math.abs(sd)<T.w/2+pad){const s=sd>=0?1:-1;return {ax:rx*s,az:rz*s}}}}return null}};

// ---------- what a blow does to a human beyond the damage: knocked flat (kd), blinded by a flash (bl), dizzy (dz), dust in the eyes (du) ----------
// The host relays it to the remote player it hit; every page applies it to its own player and the host to its bots.
function epFx(h,k,t){if(!h||!h.alive||h.team!==TH)return;if(h.net&&NET.host&&!h.isPlayer){netEv('epst',{i:h.id,k,t:r2(t)});return}epFxApply(h,k,t)}
function epFxApply(h,k,t){
  if(k==='kd'){h.knockT=Math.max(h.knockT||0,t);h.dizzy=Math.max(h.dizzy||0,t*.9);if(h.isPlayer){FX.shake=Math.max(FX.shake,.65);AU.play('bodyfall',{vol:.6});if(HUD.daze)HUD.daze()}}
  else if(k==='bl'){h.blindT=Math.max(h.blindT||0,t);if(h.isPlayer)EPV.blind(t)}
  else if(k==='dz'){h.dizzy=Math.max(h.dizzy||0,t);if(h.isPlayer&&HUD.daze)HUD.daze()}
  else if(k==='du'){h.blindT=Math.max(h.blindT||0,t*.5);if(h.isPlayer)EPV.dust(t)}}
// the screen side of it: a white-out that fades, and the red glow of a laser sight on the player
const EPV={bl:0,blT:0,las:0,du:0,duT:0,
  el(id,css){let e=$(id);if(!e){e=document.createElement('div');e.id=id;e.style.cssText=css;($('app')||document.body).appendChild(e)}return e},
  blind(t){this.bl=Math.max(this.bl,1);this.blT=Math.max(this.blT,t);AU.play('hiss',{vol:.7,rate:2.4})},
  // dirt or iron dust thrown in the face: a brown haze that closes in from the edges, then clears
  dust(t){if(this.duT<=0)AU.play('hiss',{vol:.35,rate:.7});this.du=1;this.duT=Math.max(this.duT,t)},
  update(dt){const P=G.player;if(this.blT>0){this.blT=Math.max(0,this.blT-dt);if(this.blT<=0)this.bl=Math.max(0,this.bl-dt*.9)}else this.bl=Math.max(0,this.bl-dt*.9);
    const b=this.el('epBlind','position:absolute;inset:0;pointer-events:none;z-index:8;background:#fff;opacity:0');const o=this.bl>0?Math.min(1,this.blT>0?1:this.bl):0;if(+b.style.opacity!==o)b.style.opacity=o.toFixed(2);
    if(this.duT>0)this.duT=Math.max(0,this.duT-dt);else this.du=Math.max(0,this.du-dt*.8);
    const u=this.el('epDust','position:absolute;inset:0;pointer-events:none;z-index:8;opacity:0;background:radial-gradient(ellipse at center,rgba(96,74,52,.5) 0%,rgba(70,52,34,.88) 46%,rgba(44,32,20,.97) 100%)');
    const uo=P&&P.alive&&this.du>0?Math.min(.92,this.du*.92).toFixed(2):'0';if(u.style.opacity!==uo)u.style.opacity=uo;
    const l=this.el('epLas','position:absolute;inset:0;pointer-events:none;z-index:7;opacity:0;box-shadow:inset 0 0 90px 30px rgba(255,20,10,.85)');const lo=P&&P.alive?this.las:0;
    const s=lo>0?(.35+.45*Math.abs(Math.sin(G.t*(6+lo*14)))).toFixed(2):'0';if(l.style.opacity!==s)l.style.opacity=s;this.las=0},
  reset(){this.bl=this.blT=this.las=this.du=this.duT=0;for(const id of ['epBlind','epLas','epDust']){const e=$(id);if(e)e.style.opacity=0}}};

// ---------- laser sights: a red beam from the shooter's muzzle to its mark, shown on every page ----------
// S: {i, src, tg, t, d, m (mesh), dot}; the marked player's screen edge glows and a beep speeds up as the shot comes
const ELAS={list:[],geo:null,mt:null,_a:new THREE.Vector3(),_b:new THREE.Vector3(),
  init(){if(this.geo)return;this.geo=new THREE.BoxGeometry(1,1,1);this.geo.translate(0,0,.5);this.mt=new THREE.MeshBasicMaterial({color:0xff1a0a,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending})},
  add(src,tg,d,remote){if(!src||!tg)return null;this.init();this.stop(src,true);const m=new THREE.Mesh(this.geo,this.mt);m.frustumCulled=false;m.renderOrder=4;R.scene.add(m);
    const S={src,tg,t:0,d,m,beep:0};this.list.push(S);if(NET.host&&!remote)netEv('epls',{i:src.id,t:tg.id,d:r2(d)});return S},
  stop(src,quiet){for(let i=this.list.length-1;i>=0;i--){const S=this.list[i];if(S.src!==src)continue;R.scene.remove(S.m);this.list.splice(i,1)}if(NET.host&&!quiet)netEv('eplx',{i:src.id})},
  // where a shooter's beam starts (its rifle's muzzle if the rig has one)
  from(src,out){if(src.epMuz)return out.copy(src.epMuz);return out.set(src.c.x,src.head?src.head.y:src.c.y+1.6,src.c.z)},
  to(tg,out){return out.set(tg.c.x,tg.c.y+(tg.duck?.95:1.3),tg.c.z)},
  update(dt){const P=G.player;for(let i=this.list.length-1;i>=0;i--){const S=this.list[i];S.t+=dt;
      if(S.t>S.d+.15||!S.src.alive||!S.tg.alive){R.scene.remove(S.m);this.list.splice(i,1);continue}
      const a=this.from(S.src,this._a),b=this.to(S.tg,this._b),L=a.distanceTo(b);if(L<.1)continue;
      // the beam stops at the first thing in the way (the cover that will catch the shot)
      const dx=(b.x-a.x)/L,dy=(b.y-a.y)/L,dz=(b.z-a.z)/L,h=rayCast(a.x,a.y,a.z,dx,dy,dz,L,SHOT_FILTER),len=h?Math.min(L,h.t):L;
      S.m.position.copy(a);S.m.lookAt(b);const w=.022+.012*Math.sin(G.t*40);S.m.scale.set(w,w,len);
      if(Math.random()<dt*25)FX.spawn({x:a.x+dx*len,y:a.y+dy*len,z:a.z+dz*len,life:.06,s0:.12,s1:.06,r:1,g:.12,b:.06,a:1,f:1,add:1});
      if(S.tg===P&&P.alive){const k=clamp(S.t/S.d,0,1);EPV.las=Math.max(EPV.las,.3+k*.7);S.beep-=dt;if(S.beep<=0){S.beep=lerp(.42,.09,k);AU.play('beep2',{vol:.45,rate:1.6+k*.5})}}}},
  clear(){for(const S of this.list)R.scene.remove(S.m);this.list=[]}};

// ---------- enemy bullets: a hitscan shot from a muzzle, caught by cover, drawn as a tracer on every page ----------
const _eb=new THREE.Vector3();
// the first human a ray passes through within tmax: {h, t, head}
function rayHuman(ox,oy,oz,dx,dy,dz,tmax,skip){let best=null,bt=tmax;
  for(const h of SCEN.H){if(!h.alive||h===skip)continue;const c=h.c,top=(h.head?h.head.y:c.y+1.7)+.12,bot=c.y+.05,r=(c.hw||.3)+.08;
    // closest approach of the ray to the body's vertical axis, then the height there
    const px=c.x-ox,pz=c.z-oz,hl=dx*dx+dz*dz;if(hl<1e-6)continue;const t=(px*dx+pz*dz)/hl;if(t<0||t>bt)continue;const qx=ox+dx*t-c.x,qz=oz+dz*t-c.z;if(qx*qx+qz*qz>r*r)continue;
    const y=oy+dy*t;if(y<bot||y>top)continue;bt=t;best={h,t,head:y>top-.32}}return best}
const EBUL={
  // host: from (x,y,z) toward (tx,ty,tz) with a spread (radians); o: {dmg, kd (knockdown s), w ('s' sniper / 'm' smg / 'r' rifle), src}
  shot(x,y,z,tx,ty,tz,sp,o){const L0=Math.hypot(tx-x,ty-y,tz-z)||1;let dx=(tx-x)/L0,dy=(ty-y)/L0,dz=(tz-z)/L0;
    if(sp>0){dx+=rr(-sp,sp);dy+=rr(-sp,sp)*.7;dz+=rr(-sp,sp);const l=Math.hypot(dx,dy,dz);dx/=l;dy/=l;dz/=l}
    const R0=140,w=rayCast(x,y,z,dx,dy,dz,R0,SHOT_FILTER),wt=w?w.t:R0,wn=w?[w.nx,w.ny,w.nz,w.box&&w.box.mat||'conc']:null,hh=rayHuman(x,y,z,dx,dy,dz,wt,o.skip);let ex,ey,ez,hit=0;
    if(hh){ex=x+dx*hh.t;ey=y+dy*hh.t;ez=z+dz*hh.t;hit=1;let d=o.dmg*(hh.head&&o.hs?o.hs:1);hurtHuman(hh.h,EPD(d),o.src||null,{});if(o.kd&&hh.h.alive)epFx(hh.h,'kd',o.kd);
      if(o.push)SCEN.pushHuman(hh.h,dx*o.push,1.5,dz*o.push)}
    else{ex=x+dx*wt;ey=y+dy*wt;ez=z+dz*wt}
    const m={f:[r2(x),r2(y),r2(z)],e:[r2(ex),r2(ey),r2(ez)],h:hit,w:o.w||'r'};if(wn&&!hit){m.n=[r2(wn[0]),r2(wn[1]),r2(wn[2])];m.mt=wn[3]}if(o.src)m.s=o.src.id;this.draw(m);if(NET.host)netEv('epbt',m);return hit?hh.h:null},
  // every page: the muzzle flash, the tracer, the crack and the impact (and the shooter's recoil)
  draw(m){const f=m.f,e=m.e,x=f[0]/100,y=f[1]/100,z=f[2]/100,X=e[0]/100,Y=e[1]/100,Z=e[2]/100,big=m.w==='s';if(m.s!=null){const a=byIdAny(m.s);if(a)a.epKick=1}
    const L=Math.hypot(X-x,Y-y,Z-z)||1;FX.muzzle(x,y,z,(X-x)/L,(Y-y)/L,(Z-z)/L,big);FX.tracer(x,y,z,X,Y,Z,big?[1,.42,.25]:[1,.78,.45]);DL.add(x,y,z,big?'#ffb070':'#ffd090',big?9:5,big?2.2:1.2,.06);
    AU.at(big?'r700':m.w==='m'?'um45':'kv47',x,y,z,{vol:big?1:.75,range:big?170:95,rate:big?.92:1});
    if(m.h){FX.blood(X,Y,Z,(X-x)/L,0,(Z-z)/L,big?1.6:.7);AU.at('hurt',X,Y,Z,{vol:.4,range:20})}
    else if(m.n)FX.impact(X,Y,Z,m.n[0]/100,m.n[1]/100,m.n[2]/100,m.mt);
    // a near miss cracks past the local player
    const P=G.player;if(P&&P.alive&&!m.h){const px=P.c.x-x,py=P.c.y+1.4-y,pz=P.c.z-z,t=clamp((px*(X-x)+py*(Y-y)+pz*(Z-z))/(L*L),0,1),cx=x+(X-x)*t-P.c.x,cy=y+(Y-y)*t-(P.c.y+1.4),cz=z+(Z-z)*t-P.c.z;
      if(Math.hypot(cx,cy,cz)<2.2&&!AU.throttle('ebwz',90))AU.play('whiz',{vol:.6})}}};

// ---------- thrown grenades (a squad zombie's frag, ARGUS's flashbang and smoke): an arc, a red ring where it will burst ----------
// kind: 'he' 25 at the centre, falls off to 3.5 m · 'fb' a flash: whoever looks at it within 22 m is blinded 3 s · 'sm' a smoke cloud
const EGREN={list:[],id:0,
  throw(kind,x,y,z,tx,ty,tz,T,o,remote,id){const vx=(tx-x)/T,vz=(tz-z)/T,vy=(ty+.15-y)/T+.5*GRAV*.8*T;
    const m=new THREE.Mesh(gunGeo(kind==='fb'?'epFlash':kind==='sm'?'epSmoke':'he'),matGun());m.position.set(x,y,z);R.scene.add(m);
    const g={id:id||++this.id,kind,m,x0:x,y0:y,z0:z,vx,vy,vz,t:0,T,tx,ty,tz,o:o||{},spin:rr(-10,10)};this.list.push(g);
    if(kind==='he')TELE.add({k:'c',x:tx,y:ty,z:tz,r:3.5,d:T},true);
    if(NET.host&&!remote)netEv('epgn',{id:g.id,k:kind,a:[r2(x),r2(y),r2(z),r2(tx),r2(ty),r2(tz)],T:r2(T),s:o&&o.src?o.src.id:-1});return g},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const g=this.list[i];g.t+=dt;const t=Math.min(g.t,g.T);
      g.m.position.set(g.x0+g.vx*t,g.y0+g.vy*t-.5*GRAV*.8*t*t,g.z0+g.vz*t);g.m.rotation.x+=g.spin*dt;g.m.rotation.z+=g.spin*.6*dt;sampleProbe(g.m.position.x,g.m.position.y,g.m.position.z,g.m.material.uniforms.uProbe.value);
      if(g.kind==='sm'&&Math.random()<dt*20)FX.spawn({x:g.m.position.x,y:g.m.position.y,z:g.m.position.z,vy:.3,life:.8,s0:.15,s1:.5,r:.7,g:.72,b:.7,a:.4,f:2,drag:1.5});
      if(g.t>=g.T+(g.kind==='he'?.05:g.kind==='fb'?.35:.1)){this.burst(g);R.scene.remove(g.m);g.m.material.dispose();this.list.splice(i,1)}}},
  burst(g){const x=g.tx,y=g.ty+.15,z=g.tz,P=G.player;
    if(g.kind==='he'){FX.explode(x,y,z,'he');AU.at('explode',x,y,z,{vol:.95,range:90,occ:false});if(P){const d=Math.hypot(P.c.x-x,P.c.z-z);if(d<12){FX.shake=Math.max(FX.shake,.9-d/14);AU.shock(.8-d/16)}}
      if(!NET.cli){const src=g.o.src&&g.o.src.alive?g.o.src:null;for(const h of SCEN.H){if(!h.alive)continue;const dx=h.c.x-x,dz=h.c.z-z,d=Math.hypot(dx,dz);if(d>3.5||Math.abs(h.c.y-y)>2.5)continue;
        if(!losClear(x,y+.3,z,h.c.x,h.c.y+1,h.c.z))continue;const f=1-d/3.5;SCEN.pushHuman(h,dx/(d||1)*7*f,3+3*f,dz/(d||1)*7*f);hurtHuman(h,EPD((g.o.dmg||25)*(.35+.65*f)),src,{});if(f>.6)epFx(h,'dz',1.2)}}}
    else if(g.kind==='fb'){FX.spawn({x,y:y+.3,z,life:.25,s0:2.5,s1:6,r:1,g:1,b:1,a:1,f:1,add:1});DL.add(x,y+.5,z,'#ffffff',26,4,.35);AU.at('explode',x,y,z,{vol:.8,range:80,occ:false,rate:2.1});
      // every page blinds its own player (if it was looking that way); the host blinds its bots
      const look=(h,full)=>{const ex=h.c.x,ey=h.c.y+1.6,ez=h.c.z,dx=x-ex,dy=y-ey,dz=z-ez,d=Math.hypot(dx,dy,dz);if(d>22||!losClear(ex,ey,ez,x,y+.25,z))return 0;
        aimDir(h.yaw,h.pitch||0,_eb);const dot=(_eb.x*dx+_eb.y*dy+_eb.z*dz)/(d||1);return dot>.25?(full?3*(1-d/30):2.4):d<6?1.2:0};
      if(P&&P.alive&&P.team===TH){const t=look(P,true);if(t>0)epFxApply(P,'bl',t)}
      if(!NET.cli)for(const h of SCEN.H)if(h.bot&&h.alive){const t=look(h,false);if(t>0)h.blindT=Math.max(h.blindT||0,t)}}
    else if(g.kind==='sm')ESMK.add(x,y,z,g.o.r||8,g.o.life||10,true)},
  clear(){for(const g of this.list){R.scene.remove(g.m);g.m.material.dispose()}this.list=[]}};

// ---------- smoke: a thick cloud that hides whoever is inside it (bots and bosses cannot see through it) ----------
const ESMK={list:[],
  add(x,y,z,r,life,remote){const S={x,y,z,r,life,t:0};this.list.push(S);AU.at('salgust',x,y,z,{vol:.9,range:50,rate:.8});if(NET.host&&!remote)netEv('epsm',{x:r2(x),y:r2(y),z:r2(z),r:r2(r),l:r2(life)});return S},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const S=this.list[i];S.t+=dt;if(S.t>S.life+3){this.list.splice(i,1);continue}const k=S.t<1?S.t:S.t>S.life?Math.max(0,1-(S.t-S.life)/3):1;
      const n=S.t<1.2?8:2.4;for(let j=0;j<n;j++)if(Math.random()<dt*14*k){const a=Math.random()*TAU,d=Math.sqrt(Math.random())*S.r*(S.t<1?S.t:1);
        FX.spawn({x:S.x+Math.cos(a)*d,y:S.y+rr(.2,2.4),z:S.z+Math.sin(a)*d,vx:rr(-.2,.2),vy:rr(0,.25),vz:rr(-.2,.2),life:rr(3,4.5),s0:rr(1.4,2),s1:rr(3,4.2),r:.62,g:.64,b:.62,a:.55,f:2,drag:.6,lit:1})}}},
  // inside a cloud (or the line between two points crosses one)
  at(x,z,pad){for(const S of this.list){if(S.t<.6||S.t>S.life+1)continue;if(Math.hypot(x-S.x,z-S.z)<S.r*.85+(pad||0))return S}return null},
  blocks(ax,az,bx,bz){for(const S of this.list){if(S.t<.6||S.t>S.life+1)continue;const dx=bx-ax,dz=bz-az,l=dx*dx+dz*dz||1,t=clamp(((S.x-ax)*dx+(S.z-az)*dz)/l,0,1),cx=ax+dx*t-S.x,cz=az+dz*t-S.z;if(cx*cx+cz*cz<S.r*S.r*.6)return true}return false},
  clear(){this.list=[]}};

// ---------- ammo boxes: dropped by the infected RT-1 squad; walking over one tops the guns up ----------
const EPK={list:[],seq:1,
  spawn(x,y,z,id,remote){const m=new THREE.Mesh(gunGeo('epAmmo'),matGun());m.position.set(x,y+.02,z);m.rotation.y=Math.random()*TAU;R.scene.add(m);sampleProbe(x,y+.5,z,m.material.uniforms.uProbe.value);
    const k={id:id||this.seq++,x,y,z,m,t:0};this.list.push(k);if(NET.host&&!remote)netEv('epak',{id:k.id,x:r2(x),y:r2(y),z:r2(z)});return k},
  update(dt){for(let i=this.list.length-1;i>=0;i--){const k=this.list[i];k.t+=dt;k.m.position.y=k.y+.02+Math.max(0,Math.sin(k.t*3))*.04;
      if(Math.random()<dt*2)FX.spawn({x:k.x,y:k.y+.4,z:k.z,vy:.3,life:.6,s0:.06,s1:.02,r:1,g:.85,b:.4,a:.8,f:1,add:1});
      if(k.t>45){this.remove(k);continue}if(NET.cli)continue;
      for(const h of SCEN.H){if(!h.alive||Math.hypot(h.c.x-k.x,h.c.z-k.z)>.9||Math.abs(h.c.y-k.y)>1.4)continue;if(!this.give(h))continue;this.remove(k);if(NET.host)netEv('epap',{id:k.id,by:h.id});break}}},
  // half a reserve for every gun carried (not past the full reserve); false when nothing was missing
  give(h){let any=false;if(!h.pup)for(const id in h.ammo){const W=WPN[id];if(!W||!W.res)continue;const A=h.ammo[id];const add=Math.ceil(W.res*.5);if(A.res<W.res){A.res=Math.min(W.res,A.res+add);any=true}}
    if(h.isPlayer){AU.play('pickup',{vol:.7});HUD.note(LI()?'Ammo':'탄약 획득',1.5)}return any||h.pup},
  remove(k){const i=this.list.indexOf(k);if(i>=0)this.list.splice(i,1);R.scene.remove(k.m);k.m.material.dispose()},
  clear(){for(const k of this.list.slice())this.remove(k)}};

// a shot hit one of the chapter's shootable props (a box with o.eh = {k, i}: drums, gas valves, coolant tanks); the chapter decides
// (host), a client tells the host about its own shots
function epBoxShot(b,a,W){if(NET.ghost||!a||a.team!==TH||!EP.on||!EP.C||!EP.C.boxShot)return;EP.C.boxShot(b.o.eh,a,W)}
// a bot does not see a zombie flagged epHide (the sniper) through a smoke cloud, or inside one, unless it is within 4 m
function epHid(a,z,d){if(d<4)return false;return !!(ESMK.at(z.c.x,z.c.z,0)||ESMK.blocks(a.c.x,a.c.z,z.c.x,z.c.z))}

// ---------- scripted leaps (host): a body flown along an arc, through whatever is in the way (a sniper vaulting onto a watchtower) ----------
// a.kin = {x0,y0,z0, x1,y1,z1, T, t, h, done}: from where it stands to (x1,y1,z1) in T s, the arc h above the higher end at its
// middle; actorPhysics leaves the body alone meanwhile, done(a) runs on landing. The zombie snapshot carries it to the clients.
function epKin(a,x,y,z,T,h,done){const c=a.c;a.kin={x0:c.x,y0:c.y,z0:c.z,x1:x,y1:y,z1:z,T:Math.max(.2,T),t:0,h:h==null?1:h,done:done||null};a.leapV=null;c.onGround=false;
  a.mvx=a.mvz=a.kvx=a.kvz=0;if(Math.hypot(x-c.x,z-c.z)>.3)a.yaw=Math.atan2(-(x-c.x),-(z-c.z));return a.kin.T}
function epKinStep(a,dt){const K=a.kin,c=a.c;K.t+=dt;const u=Math.min(1,K.t/K.T),H=Math.max(K.y0,K.y1)+K.h-(K.y0+K.y1)/2,y0=c.y;
  c.x=lerp(K.x0,K.x1,u);c.z=lerp(K.z0,K.z1,u);c.y=lerp(K.y0,K.y1,u)+4*H*u*(1-u);c.vx=(K.x1-K.x0)/K.T;c.vz=(K.z1-K.z0)/K.T;c.vy=(c.y-y0)/Math.max(dt,1e-3);c.onGround=false;
  a.mvx=a.mvz=a.kvx=a.kvz=0;a.airT=(a.airT||0)+dt;
  if(u>=1){a.kin=null;c.x=K.x1;c.y=K.y1;c.z=K.z1;c.vx=c.vz=c.vy=0;c.onGround=true;a.airT=0;if(K.done)K.done(a)}}
{const ap=actorPhysics;actorPhysics=function(a,dt){if(a.kin){epKinStep(a,dt);return}return ap(a,dt)}}

// ---------- shockwaves (v6.22.1): a ring of dust racing out over the floor from a slam; whoever is on the ground where it passes is hit
// and thrown (jump over it); the host decides, every page draws it ----------
const EWAVE={list:[],geo:null,
  add(x,y,z,rad,sp,dmg,src,remote){if(!this.geo){this.geo=new THREE.RingGeometry(.82,1,72);this.geo.rotateX(-Math.PI/2)}
    const m=new THREE.Mesh(this.geo,new THREE.MeshBasicMaterial({color:0xffb070,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
    m.position.set(x,y+.14,z);m.scale.setScalar(.5);m.frustumCulled=false;m.renderOrder=5;R.scene.add(m);
    const W={x,y,z,R:rad,sp,dmg,src:src||null,r:.5,m,hit:new Set()};this.list.push(W);AU.at('explode',x,y,z,{vol:.6,range:60,occ:false,rate:.42});
    if(NET.host&&!remote)netEv('epwv',{x:r2(x),y:r2(y),z:r2(z),R:r2(rad),sp:r2(sp)});return W},
  update(dt){const P=G.player;for(let i=this.list.length-1;i>=0;i--){const W=this.list[i],r0=W.r;W.r=Math.min(W.R,W.r+W.sp*dt);const u=W.r/W.R;
      W.m.scale.setScalar(W.r);W.m.material.opacity=.8*(1-u*u);
      for(let k=0;k<4;k++)if(Math.random()<dt*30){const g=Math.random()*TAU;FX.spawn({x:W.x+Math.cos(g)*W.r,y:W.y+.15,z:W.z+Math.sin(g)*W.r,vx:Math.cos(g)*2.4,vy:rr(.6,1.8),vz:Math.sin(g)*2.4,life:rr(.35,.6),s0:.3,s1:.9,r:.52,g:.47,b:.4,a:.55,f:2,drag:2})}
      if(P&&P.alive&&Math.abs(Math.hypot(P.c.x-W.x,P.c.z-W.z)-W.r)<1.2)FX.shake=Math.max(FX.shake,.25);
      if(!NET.cli)for(const h of SCEN.H){if(!h.alive||W.hit.has(h))continue;const d=Math.hypot(h.c.x-W.x,h.c.z-W.z);
        // a bot sees it coming and (mostly) jumps it
        if(h.bot&&!h.isPlayer&&d>W.r&&d-W.r<4&&h.c.onGround&&!(h.rootT>0)&&!(h.grabT>0)){if(!W.bj)W.bj=new Map();let j=W.bj.get(h);if(j==null){j=Math.random()<.8?rr(1.6,3.4):-1;W.bj.set(h,j)}
          if(j>0&&d-W.r<j){h.c.vy=jumpV(h);h.c.onGround=false;h.c.jumped=true;W.bj.set(h,-1)}}
        if(d<r0-.6||d>W.r+.6)continue;
        // over it in a jump, or on another floor: it misses
        if(h.c.y-W.y>.5||W.y-h.c.y>1.2)continue;W.hit.add(h);const kx=(h.c.x-W.x)/(d||1),kz=(h.c.z-W.z)/(d||1);SCEN.pushHuman(h,kx*6,5,kz*6);hurtHuman(h,EPD(W.dmg),W.src&&W.src.alive?W.src:null,{})}
      if(W.r>=W.R){R.scene.remove(W.m);W.m.material.dispose();this.list.splice(i,1)}}},
  clear(){for(const W of this.list){R.scene.remove(W.m);W.m.material.dispose()}this.list=[]}};

// the shared toys every frame (every page) and between matches
function epToysUpdate(dt){TELE.update(dt);ELAS.update(dt);EGREN.update(dt);ESMK.update(dt);EPK.update(dt);EPV.update(dt);EWAVE.update(dt)}
function epToysClear(){TELE.clear();ELAS.clear();EGREN.clear();ESMK.clear();EPK.clear();EPV.reset();EWAVE.clear()}

// props for the toys (drawn with the weapon material): an ammo can
Object.assign(GUNS,{epAmmo:{parts:[Pt(0,.13,0,.42,.26,.2,'olive',{r:.02}),Pt(0,.27,0,.3,.03,.06,'blk2'),Pt(.12,.13,.101,.12,.08,.004,'yellow'),Pt(-.21,.13,0,.01,.18,.14,'steel'),Pt(.21,.13,0,.01,.18,.14,'steel')],grip:[0,0,0],muzzle:[0,0,0]},
  // a stun grenade (perforated steel can) and a smoke canister (olive, a white band)
  epFlash:{parts:[Pt(0,0,0,.05,.11,.05,'steel',{r:.012}),Pt(0,.06,0,.03,.016,.03,'blk'),Pt(.022,.03,0,.006,.07,.014,'steel'),Pt(0,-.01,.026,.03,.03,.002,'blk2')],grip:[0,0,0],muzzle:[0,0,0]},
  epSmoke:{parts:[Pt(0,0,0,.06,.13,.06,'olive',{r:.012}),Pt(0,.02,0,.062,.02,.062,'white'),Pt(0,.072,0,.034,.016,.034,'steel'),Pt(.025,.04,0,.006,.07,.014,'steel')],grip:[0,0,0],muzzle:[0,0,0]}});

(function(){
  Object.assign(CLIH,{
    ept(L,m){TELE.add({k:m.k,x:m.x/100,y:m.y/100,z:m.z/100,r:m.r/100,w:m.w/100,l:m.l/100,yaw:m.yaw/1000,d:m.d/100,col:m.c||0},true)},
    epst(L,m){const P=G.player;if(P&&P.id===m.i)epFxApply(P,m.k,m.t/100)},
    epls(L,m){const s=byIdAny(m.i),t=byIdAny(m.t);if(s&&t)ELAS.add(s,t,m.d/100,true)},
    eplx(L,m){const s=byIdAny(m.i);if(s)ELAS.stop(s,true)},
    epbt(L,m){EBUL.draw(m)},
    epgn(L,m){const A=m.a;EGREN.throw(m.k,A[0]/100,A[1]/100,A[2]/100,A[3]/100,A[4]/100,A[5]/100,m.T/100,{src:byIdAny(m.s)},true,m.id)},
    epsm(L,m){ESMK.add(m.x/100,m.y/100,m.z/100,m.r/100,m.l/100,true)},
    epwv(L,m){EWAVE.add(m.x/100,m.y/100,m.z/100,m.R/100,m.sp/100,0,null,true)},
    epak(L,m){EPK.spawn(m.x/100,m.y/100,m.z/100,m.id,true)},
    epap(L,m){const k=EPK.list.find(q=>q.id===m.id);if(k){const P=G.player;if(P&&P.id===m.by)EPK.give(P);EPK.remove(k)}}});
})();

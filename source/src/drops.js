'use strict';
// ============ Dropped weapons: G throws the gun in hand; walking over a gun picks it up when that slot is empty ============
// The host (or a solo game) owns the dropped guns: it spawns them, runs their fall, and decides who picks one up.
// Clients ask with 'wdrop' and see guns appear ('wd') and vanish into someone's hands ('wp').
// A human who dies or turns into a zombie drops his primary. Guns lie for 90 s; at most 30 at once.
const DROPS={list:[],seq:1,MAX:30,LIFE:90};
function dropOk(w){const W=WPN[w];return !!(W&&W.model&&(W.slot===1||W.slot===2)&&W.kind!=='melee'&&W.kind!=='nade')}
function dropSpawn(o){const W=WPN[o.w];if(!W)return null;
  const m=new THREE.Mesh(gunGeo(W.model),matGun());m.rotation.set(0,o.yaw||0,0);R.scene.add(m);
  const d={id:o.id||DROPS.seq++,w:o.w,mag:o.mag|0,res:o.res|0,x:o.x,y:o.y,z:o.z,vx:o.vx||0,vy:o.vy||0,vz:o.vz||0,yaw:o.yaw||0,spin:o.vx||o.vz?rr(-9,9):0,t:0,rest:false,by:o.by,mesh:m};
  m.position.set(d.x,d.y,d.z);DROPS.list.push(d);
  while(DROPS.list.length>DROPS.MAX)dropRemove(DROPS.list[0]);return d}
function dropRemove(d){const i=DROPS.list.indexOf(d);if(i>=0)DROPS.list.splice(i,1);if(d.mesh){R.scene.remove(d.mesh);d.mesh.material.dispose();d.mesh=null}}
function dropsClear(){for(const d of DROPS.list.slice())dropRemove(d)}
// take the gun out of a's hands and onto the ground (host / solo)
function dropFrom(a,w,toss){if(!dropOk(w)||a.inv[WPN[w].slot]!==w)return null;const W=WPN[w],am=a.ammo[w]||{mag:0,res:0};
  a.inv[W.slot]=null;delete a.ammo[w];if(a.cur===w)equip(a,bestWeapon(a));
  aimDir(a.yaw,0,_dv);const sp=toss?4.2:rr(.5,1.4),c=a.c;
  const o={w,mag:am.mag,res:am.res,x:c.x+_dv.x*.5,y:c.y+(toss?1.3:.9),z:c.z+_dv.z*.5,vx:_dv.x*sp+c.vx*.5,vy:toss?2.2:1,vz:_dv.z*sp+c.vz*.5,yaw:a.yaw+rr(-.4,.4),by:a.id};
  const d=dropSpawn(o);if(!d)return null;
  if(a.isPlayer)AU.play('throw',{vol:.5,rate:.8});else AU.at('throw',c.x,c.y+1,c.z,{vol:.4});
  if(NET.host)netEv('wd',{d:d.id,w,x:r2(o.x),y:r2(o.y),z:r2(o.z),vx:r2(o.vx),vy:r2(o.vy),vz:r2(o.vz),yw:r2(o.yaw),by:a.id});return d}
// the G key / a long press on the weapon in hand
function playerDrop(a){if(!a||!a.alive||a.team!==TH||G.st==='end'||G.st==='over')return;const w=a.cur;if(!dropOk(w)||a.inv[WPN[w].slot]!==w)return;
  if(NET.cli){a.inv[WPN[w].slot]=null;delete a.ammo[w];equip(a,bestWeapon(a));AU.play('throw',{vol:.5,rate:.8});netToHost({t:'wdrop',w});return}
  dropFrom(a,w,true)}
// a human going down (killed, or turned into a zombie) lets his primary fall
function dropDeath(a){if(NET.cli||a.team!==TH)return;const w=a.inv&&a.inv[1];if(w&&dropOk(w))dropFrom(a,w,false)}
// a gun goes into the hands of whoever walked over it
function dropGive(a,w,mag,res){const W=WPN[w];if(!W)return;a.inv[W.slot]=w;a.ammo[w]={mag,res};gunFresh(a,w);
  if(WPN[a.cur]&&WPN[a.cur].kind==='melee')equip(a,w);
  if(a.isPlayer){AU.play('draw',{vol:.6});HUD.note(W.n[LI()]+(LI()?' picked up':' 획득'),1.4)}}
function dropTake(a,d){dropRemove(d);dropGive(a,d.w,d.mag,d.res);if(NET.host)netEv('wp',{d:d.id,i:a.id,w:d.w,mg:d.mag,rs:d.res})}
function dropsUpdate(dt){const L=DROPS.list;if(!L.length)return;const own=!NET.cli;
  for(let k=L.length-1;k>=0;k--){const d=L[k];d.t+=dt;if(d.t>DROPS.LIFE&&own){dropRemove(d);continue}
    if(!d.rest){d.vy-=GRAV*dt;const nx=d.x+d.vx*dt,nz=d.z+d.vz*dt;
      if(charFits({hw:.1,h:.12},nx,d.y,nz)){d.x=nx;d.z=nz}else{d.vx*=-.25;d.vz*=-.25}
      const fl=floorBelow(d.x,d.y+.3,d.z,.1),ny=d.y+d.vy*dt;
      if(ny<=fl+.04){d.y=fl+.04;if(Math.abs(d.vy)>3){d.vy*=-.25;d.vx*=.6;d.vz*=.6}else{d.vy=0;d.vx*=.5;d.vz*=.5;if(Math.hypot(d.vx,d.vz)<.3){d.rest=true;if(d.mesh)d.mesh.rotation.z=Math.PI/2}}}else d.y=ny;
      if(d.mesh){d.mesh.rotation.y+=d.spin*dt;d.mesh.rotation.z=Math.min(Math.PI/2,d.mesh.rotation.z+dt*6)}}
    if(d.mesh){d.mesh.position.set(d.x,d.y+.05,d.z);sampleProbe(d.x,d.y+.5,d.z,d.mesh.material.uniforms.uProbe.value);if(d.t>DROPS.LIFE-5)d.mesh.visible=Math.sin(d.t*14)>-.3}
    // pick-up: host / solo only, a human with that slot empty, close by, not the one who just threw it
    if(own&&d.t>.4){const W=WPN[d.w];for(const a of G.actors){if(!a.alive||a.team!==TH||a.inv[W.slot])continue;if(a.id===d.by&&d.t<1.2)continue;
        const c=a.c;if(Math.abs(c.x-d.x)>1.1||Math.abs(c.z-d.z)>1.1||d.y<c.y-.6||d.y>c.y+1.6)continue;dropTake(a,d);break}}}}
// network: a client asks to drop; everyone sees guns appear and get picked up
Object.assign(HOSTH,{wdrop(L,m){const a=actorOfKey(L.key);if(a&&a.alive&&a.team===TH&&dropOk(m.w))dropFrom(a,m.w,true)}});
Object.assign(CLIH,{
  wd(L,m){if(DROPS.list.some(d=>d.id===m.d))return;const q=v=>(+v||0)/100;// r2() sends hundredths
    dropSpawn({id:m.d,w:m.w,x:q(m.x),y:q(m.y),z:q(m.z),vx:q(m.vx),vy:q(m.vy),vz:q(m.vz),yaw:q(m.yw),by:m.by})},
  wp(L,m){const d=DROPS.list.find(q=>q.id===m.d);if(d)dropRemove(d);const a=byId(m.i);if(!a)return;
    if(a===G.player)dropGive(a,m.w,m.mg,m.rs);else{const W=WPN[m.w];if(W)a.inv[W.slot]=m.w}}});

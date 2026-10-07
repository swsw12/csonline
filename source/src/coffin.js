'use strict';
// ============ 관짝 좀비 (Coffin Zombie): stands a tall coffin up in front of itself ============
// The coffin is a real obstacle: a dynamic box in the world grid, so it stops bullets, grenades and bodies. Humans can break it
// (bullets, blades, HE); when it breaks it bursts like a zombie bomb (humans thrown back and dazed, zombies around it launched).
// Host-authoritative in multiplayer: the host places, damages and breaks coffins; clients send their hits as claims.
const COFF={list:[],id:0,HP:550,LIFE:25,MAX:2,W:.9,D:.36,H:2.1,pend:new Map(),sendT:0};
// ---------- dynamic boxes in the world grid ----------
function worldAddDyn(b){const W=WORLD,cs=W.cell;if(!W.cells)return;b.cellsIn=[];b.mark=0;b.id=-1;
  const cx0=Math.max(0,Math.floor((b.x0-W.gx0)/cs)),cx1=Math.min(W.gw-1,Math.floor((b.x1-W.gx0)/cs)),cz0=Math.max(0,Math.floor((b.z0-W.gz0)/cs)),cz1=Math.min(W.gh-1,Math.floor((b.z1-W.gz0)/cs));
  for(let z=cz0;z<=cz1;z++)for(let x=cx0;x<=cx1;x++){const L=W.cells[z*W.gw+x];L.push(b);b.cellsIn.push(L)}}
function worldRemoveDyn(b){if(!b.cellsIn)return;for(const L of b.cellsIn){const i=L.indexOf(b);if(i>=0)L.splice(i,1)}b.cellsIn=null}
// ---------- the coffin model: a six-sided upright coffin, dark planks, iron bands, glowing cracks (it is primed to burst) ----------
GUNS.coffin={parts:(()=>{const L=[],D=.34;const sl=[[0,.4,.56],[.4,.8,.64],[.8,1.2,.74],[1.2,1.55,.86],[1.55,1.85,.78],[1.85,2.1,.62]];
  for(const [y0,y1,w] of sl){L.push(Pt(0,(y0+y1)/2,0,w,y1-y0+.002,D,'coffW',{r:.012}));L.push(Pt(0,(y0+y1)/2,-D/2-.012,w-.08,y1-y0+.004,.03,'coffL',{r:.006}))}
  for(const [y,w] of [[.55,.66],[1.42,.88]]){L.push(Pt(0,y,0,w+.03,.07,D+.03,'forged',{r:.008}));for(const x of [-.3,-.1,.1,.3])if(Math.abs(x)<w/2-.04)L.push(Pt(x,y,-D/2-.022,.03,.03,.012,'bright',{r:.006}))}
  // handles on the sides
  for(const s of [-1,1])for(const y of [.7,1.3])L.push(Pt(s*(y<1?.35:.44),y,0,.03,.05,.16,'gunmetal',{r:.008}));
  // cracks glowing from inside
  L.push(Pt(-.08,1.05,-D/2-.03,.025,.42,.008,'zbEye',{rz:.35}),Pt(.12,.78,-D/2-.03,.022,.3,.008,'zbEye',{rz:-.5}),Pt(.02,1.7,-D/2-.03,.02,.22,.008,'zbEye',{rz:.9}));
  return L})(),grip:[0,0,0],muzzle:[0,0,0]};
// ---------- placement ----------
// the box is axis-aligned, so the coffin turns to the nearest quarter of the zombie's heading
COFF.spot=function(a){const c=a.c;const q=Math.round(a.yaw/(Math.PI/2));const yaw=q*Math.PI/2;const fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  const ax=Math.abs(fx)>.5;const hx=ax?COFF.D/2:COFF.W/2,hz=ax?COFF.W/2:COFF.D/2;
  for(const dist of [1.15,.95,1.4]){const x=c.x+fx*dist,z=c.z+fz*dist;const fl=floorBelow(x,c.y+.6,z,.2);if(!(fl>c.y-.8))continue;const y=fl;
    if(overlapAny(x-hx,y+.05,z-hz,x+hx,y+COFF.H,z+hz))continue;
    let blocked=false;for(const t of G.actors){if(!t.alive)continue;const tc=t.c;if(tc.x+tc.hw>x-hx&&tc.x-tc.hw<x+hx&&tc.z+tc.hw>z-hz&&tc.z-tc.hw<z+hz&&tc.y<y+COFF.H&&tc.y+tc.h>y){blocked=true;break}}
    if(!blocked)return {x,y,z,q:((q%4)+4)%4}}
  return null};
COFF.add=function(a,x,y,z,q,id){const yaw=q*Math.PI/2,ax=q%2===1;const hx=ax?COFF.D/2:COFF.W/2,hz=ax?COFF.W/2:COFF.D/2;
  if(a){const mine=COFF.list.filter(C=>C.owner===a);if(mine.length>=COFF.MAX)COFF.remove(mine[0])}
  const m=new THREE.Mesh(gunGeo('coffin'),matGun());m.position.set(x,y,z);m.rotation.y=yaw;R.scene.add(m);sampleProbe(x,y+1,z,m.material.uniforms.uProbe.value);
  const C={id:id||++COFF.id,owner:a,x,y,z,q,hp:COFF.HP,t:COFF.LIFE,mesh:m,flash:0,rise:0};
  C.box={x0:x-hx,x1:x+hx,y0:y,y1:y+COFF.H,z0:z-hz,z1:z+hz,o:{},mat:'wood',coffin:C};worldAddDyn(C.box);COFF.list.push(C);
  // it slams down out of nowhere: dust ring, a thud
  for(let i=0;i<22;i++){const ang=i/22*TAU;FX.spawn({x:x+Math.cos(ang)*.5,y:y+.1,z:z+Math.sin(ang)*.5,vx:Math.cos(ang)*rr(1,2.4),vy:rr(.2,.8),vz:Math.sin(ang)*rr(1,2.4),life:rr(.5,1),s0:.15,s1:.6,r:.42,g:.38,b:.32,a:.5,f:2,drag:2.5})}
  AU.at('trapset',x,y+.5,z,{vol:1,range:35,rate:.55});AU.at('bounce',x,y+.3,z,{vol:.9,range:30,rate:.5});
  if(G.player&&dist3(G.player.c,C)<6)FX.shake=Math.max(FX.shake,.25);return C};
COFF.remove=function(C,quiet){const i=COFF.list.indexOf(C);if(i<0)return;COFF.list.splice(i,1);worldRemoveDyn(C.box);R.scene.remove(C.mesh);C.mesh.material.dispose();
  if(!quiet)for(let k=0;k<14;k++)FX.spawn({x:C.x+rr(-.35,.35),y:C.y+rr(.1,2),z:C.z+rr(-.3,.3),vx:rr(-.4,.4),vy:rr(-.2,.4),vz:rr(-.4,.4),life:rr(.6,1.2),s0:.2,s1:.7,r:.3,g:.28,b:.26,a:.45,f:2,drag:1.5})};
COFF.byId=id=>COFF.list.find(C=>C.id===id)||null;
COFF.clear=function(){for(const C of COFF.list.slice())COFF.remove(C,true);COFF.pend.clear()};
// ---------- damage ----------
COFF.hurt=function(C,d,src){if(!C||!(d>0)||COFF.list.indexOf(C)<0)return;C.flash=.12;
  if(src&&src.isPlayer){HUD.hitmark(false)}
  // clients: show the hit, let the host decide
  if(NET.cli&&!NET.ev){COFF.pend.set(C.id,(COFF.pend.get(C.id)||0)+d);return}
  C.hp-=d;if(C.hp<=0)COFF.burst(C,src)};
COFF.burst=function(C,src){if(COFF.list.indexOf(C)<0)return;COFF.remove(C,true);if(NET.host)netEv('cofx',{i:C.id});
  // splinters, then the same blast a zombie bomb makes
  for(let k=0;k<30;k++)FX.spawn({x:C.x+rr(-.4,.4),y:C.y+rr(.2,2),z:C.z+rr(-.3,.3),vx:rr(-5,5),vy:rr(1,6),vz:rr(-5,5),life:rr(.6,1.3),s0:.07,s1:.05,r:.32,g:.2,b:.12,f:4,grav:12,col:.3});
  detonate({kind:'zbomb',x:C.x,y:C.y+.9,z:C.z,owner:C.owner||src,t:0});
  AU.at('explode',C.x,C.y+1,C.z,{vol:.7,range:70,rate:1.3})};
// HE / grenade launcher blasts break coffins too
COFF.blast=function(n,r,dmg){for(const C of COFF.list.slice()){const d=Math.hypot(C.x-n.x,C.y+1-n.y,C.z-n.z);if(d<r)COFF.hurt(C,dmg*(1-d/r)+60,n.owner)}};
// ---------- per frame ----------
COFF.update=function(dt){
  for(const C of COFF.list.slice()){
    if(C.flash>0){C.flash=Math.max(0,C.flash-dt);C.mesh.material.uniforms.uFlash.value=C.flash>0?.55:0}
    // badly damaged coffins rattle
    if(C.hp<COFF.HP*.35){C.mesh.position.x=C.x+Math.sin(G.t*61)*.012;C.mesh.position.z=C.z+Math.cos(G.t*53)*.012;if(Math.random()<dt*6)FX.spawn({x:C.x+rr(-.2,.2),y:C.y+rr(.6,1.8),z:C.z+rr(-.2,.2),vy:rr(.3,.8),life:rr(.3,.6),s0:.05,s1:.02,r:1,g:.6,b:.2,f:0,add:1})}
    if(!NET.cli){C.t-=dt;if(C.t<=0){COFF.remove(C);if(NET.host)netEv('cofr',{i:C.id})}}}
  // clients send their accumulated coffin hits a few times a second
  if(NET.cli&&COFF.pend.size){COFF.sendT-=dt;if(COFF.sendT<=0){COFF.sendT=.1;for(const [i,d] of COFF.pend)netToHost({t:'cofh',i,d:Math.round(d)});COFF.pend.clear()}}};
// ---------- skill ----------
COFF.skill=function(a){if(!a.c.onGround)return false;const s=COFF.spot(a);if(!s){if(a.isPlayer)HUD.note(LI()?'No room for the coffin here':'관을 세울 자리가 없어',1.2);return false}
  const C=COFF.add(a,s.x,s.y,s.z,s.q);a.an.skill=.5;if(a.isPlayer)HUD.note(LI()?'Coffin wall raised':'관 방패 설치',1.2);
  if(NET.host)netEv('cof',{i:C.id,o:a.id,x:r2(s.x),y:r2(s.y),z:r2(s.z),q:s.q});return true};
// ---------- hooks ----------
(function(){
  const ns=nySkill;nySkill=function(a,Z){if(Z.skill==='coffin')return COFF.skill(a);return ns(a,Z)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();COFF.clear()};
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);if(G.st!=='menu')COFF.update(dt)};
  const det=detonate;detonate=function(n){det(n);if(n.kind==='he')COFF.blast(n,6,700);else if(n.kind==='gl')COFF.blast(n,4.5,WPN.gl40.dmg)};
  const sf=skillFx;skillFx=function(a,k){if(k==='coffin'){a.an.skill=.5;return}return sf(a,k)};
  Object.assign(CLIH,{cof(L,m){COFF.add(byId(m.o),m.x/100,m.y/100,m.z/100,m.q|0,m.i)},cofx(L,m){const C=COFF.byId(m.i);if(C)netWithEv(()=>COFF.burst(C,null))},cofr(L,m){const C=COFF.byId(m.i);if(C)COFF.remove(C)}});
  Object.assign(HOSTH,{cofh(L,m){const C=COFF.byId(m.i);if(C)COFF.hurt(C,clamp(+m.d||0,0,3000),actorOfKey(L.key))}});
})();

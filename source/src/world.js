'use strict';
// ============ World: static axis-aligned brushes, a 2D spatial grid, ray casts and character movement ============
const GRAV=20;
const WORLD={boxes:[],cell:2,gx0:-48,gz0:-48,gw:48,gh:48,cells:null,stamp:1};
function worldIndex(){
  const W=WORLD,cs=W.cell;W.cells=new Array(W.gw*W.gh);for(let i=0;i<W.cells.length;i++)W.cells[i]=[];
  W.boxes.forEach((b,i)=>{b.id=i;b.mark=0;const cx0=Math.max(0,Math.floor((b.x0-W.gx0)/cs)),cx1=Math.min(W.gw-1,Math.floor((b.x1-W.gx0)/cs)),cz0=Math.max(0,Math.floor((b.z0-W.gz0)/cs)),cz1=Math.min(W.gh-1,Math.floor((b.z1-W.gz0)/cs));
    for(let z=cz0;z<=cz1;z++)for(let x=cx0;x<=cx1;x++)W.cells[z*W.gw+x].push(b)})}
// all boxes whose footprint touches [x0,x1]x[z0,z1]
function boxesIn(x0,z0,x1,z1,out){const W=WORLD,cs=W.cell;out=out||[];const st=++W.stamp;
  const cx0=Math.max(0,Math.floor((x0-W.gx0)/cs)),cx1=Math.min(W.gw-1,Math.floor((x1-W.gx0)/cs)),cz0=Math.max(0,Math.floor((z0-W.gz0)/cs)),cz1=Math.min(W.gh-1,Math.floor((z1-W.gz0)/cs));
  for(let z=cz0;z<=cz1;z++)for(let x=cx0;x<=cx1;x++)for(const b of W.cells[z*W.gw+x])if(b.mark!==st){b.mark=st;out.push(b)}return out}
const _bq=[];
function overlapAny(x0,y0,z0,x1,y1,z1,skipNoclip){_bq.length=0;boxesIn(x0,z0,x1,z1,_bq);for(const b of _bq){if(skipNoclip&&b.noclip)continue;if(b.nosolid)continue;if(x1>b.x0&&x0<b.x1&&y1>b.y0&&y0<b.y1&&z1>b.z0&&z0<b.z1)return b}return null}
// ray vs world (slab test per box, DDA over the XZ grid). Returns {t,box,nx,ny,nz} or null.
const RAYHIT={t:0,box:null,nx:0,ny:0,nz:0};
function rayBox(ox,oy,oz,dx,dy,dz,b,tmax){let t0=0,t1=tmax,nx=0,ny=0,nz=0;
  if(Math.abs(dx)<1e-9){if(ox<b.x0||ox>b.x1)return -1}else{const ix=1/dx;let a=(b.x0-ox)*ix,c=(b.x1-ox)*ix,s=-1;if(a>c){const q=a;a=c;c=q;s=1}if(a>t0){t0=a;nx=s;ny=0;nz=0}if(c<t1)t1=c;if(t0>t1)return -1}
  if(Math.abs(dy)<1e-9){if(oy<b.y0||oy>b.y1)return -1}else{const iy=1/dy;let a=(b.y0-oy)*iy,c=(b.y1-oy)*iy,s=-1;if(a>c){const q=a;a=c;c=q;s=1}if(a>t0){t0=a;nx=0;ny=s;nz=0}if(c<t1)t1=c;if(t0>t1)return -1}
  if(Math.abs(dz)<1e-9){if(oz<b.z0||oz>b.z1)return -1}else{const iz=1/dz;let a=(b.z0-oz)*iz,c=(b.z1-oz)*iz,s=-1;if(a>c){const q=a;a=c;c=q;s=1}if(a>t0){t0=a;nx=0;ny=0;nz=s}if(c<t1)t1=c;if(t0>t1)return -1}
  RAYHIT.nx=nx;RAYHIT.ny=ny;RAYHIT.nz=nz;return t0}
function rayCast(ox,oy,oz,dx,dy,dz,tmax,filter){
  const W=WORLD,cs=W.cell,st=++W.stamp;let best=tmax,bb=null,bnx=0,bny=0,bnz=0;
  let cx=Math.floor((ox-W.gx0)/cs),cz=Math.floor((oz-W.gz0)/cs);const sx=dx>0?1:-1,sz=dz>0?1:-1;
  const tdx=Math.abs(dx)>1e-9?cs/Math.abs(dx):1e9,tdz=Math.abs(dz)>1e-9?cs/Math.abs(dz):1e9;
  let tx=Math.abs(dx)>1e-9?((dx>0?(cx+1)*cs+W.gx0-ox:ox-(cx*cs+W.gx0))/Math.abs(dx)):1e9,tz=Math.abs(dz)>1e-9?((dz>0?(cz+1)*cs+W.gz0-oz:oz-(cz*cs+W.gz0))/Math.abs(dz)):1e9;
  let tc=0;
  for(let guard=0;guard<200;guard++){
    if(cx>=0&&cz>=0&&cx<W.gw&&cz<W.gh){for(const b of W.cells[cz*W.gw+cx]){if(b.mark===st)continue;b.mark=st;if(b.nosolid&&!(filter&&filter.vis))continue;if(filter&&filter.skip&&filter.skip(b))continue;
        const t=rayBox(ox,oy,oz,dx,dy,dz,b,best);if(t>=0&&t<best){best=t;bb=b;bnx=RAYHIT.nx;bny=RAYHIT.ny;bnz=RAYHIT.nz}}}
    const tn=Math.min(tx,tz);if(best<=tn||tn>tmax)break;
    if(tx<tz){cx+=sx;tx+=tdx}else{cz+=sz;tz+=tdz}tc=tn;
    if((cx<-1||cz<-1||cx>W.gw||cz>W.gh))break}
  if(!bb)return null;RAYHIT.t=best;RAYHIT.box=bb;RAYHIT.nx=bnx;RAYHIT.ny=bny;RAYHIT.nz=bnz;return RAYHIT}
const LOS_F={skip:b=>b.o.pass};
function losClear(ax,ay,az,bx,by,bz){const dx=bx-ax,dy=by-ay,dz=bz-az,d=Math.hypot(dx,dy,dz);if(d<1e-4)return true;return !rayCast(ax,ay,az,dx/d,dy/d,dz/d,d-.02,LOS_F)}
// floor height below a point (top of the highest box under it), or -Infinity
function floorBelow(x,y,z,hw){hw=hw||.05;_bq.length=0;boxesIn(x-hw,z-hw,x+hw,z+hw,_bq);let h=-1e9;for(const b of _bq){if(b.nosolid)continue;if(x+hw>b.x0&&x-hw<b.x1&&z+hw>b.z0&&z-hw<b.z1&&b.y1<=y+1e-3&&b.y1>h)h=b.y1}return h}
// ---------- character controller: box hull, axis-separated sweeps, step-up, ground snap ----------
// c: {x,y,z (feet), vx,vy,vz, hw, h, onGround, stepH}
function charFits(c,x,y,z){return !overlapAny(x-c.hw,y+.001,z-c.hw,x+c.hw,y+c.h,z+c.hw)}
// swept move along one axis: stops at the first box face in the way. Boxes the hull already overlaps are ignored,
// so a character can never be teleported to the far side or the top of a wall it was pushed into.
const _sq=[];
function moveAxis(c,ax,d){if(!d)return false;
  const x0=c.x-c.hw,x1=c.x+c.hw,y0=c.y+.001,y1=c.y+c.h,z0=c.z-c.hw,z1=c.z+c.hw;
  let lx=x0,hx=x1,ly=y0,hy=y1,lz=z0,hz=z1;if(ax===0){if(d>0)hx+=d;else lx+=d}else if(ax===1){if(d>0)hy+=d;else ly+=d}else{if(d>0)hz+=d;else lz+=d}
  _sq.length=0;boxesIn(lx,lz,hx,hz,_sq);let allow=d,hit=null;
  for(const b of _sq){if(b.nosolid)continue;
    if(!(hx>b.x0&&lx<b.x1&&hy>b.y0&&ly<b.y1&&hz>b.z0&&lz<b.z1))continue;
    if(x1>b.x0&&x0<b.x1&&y1>b.y0&&y0<b.y1&&z1>b.z0&&z0<b.z1)continue;
    let lim;if(ax===0)lim=d>0?b.x0-x1-1e-4:b.x1-x0+1e-4;else if(ax===1)lim=d>0?b.y0-y1-1e-4:b.y1-c.y;else lim=d>0?b.z0-z1-1e-4:b.z1-z0+1e-4;
    if(d>0){if(lim<allow){allow=Math.max(0,lim);hit=b}}else{if(lim>allow){allow=Math.min(0,lim);hit=b}}}
  if(ax===0)c.x+=allow;else if(ax===1)c.y+=allow;else c.z+=allow;
  if(hit&&ax===1){if(d<0){c.vy=0;c.onGround=true}else c.vy=Math.min(0,c.vy)}
  return !!hit}
function stepMove(c,dx,dz){// horizontal move with stair step-up
  const x0=c.x,z0=c.z;const hx=moveAxis(c,0,dx),hz=moveAxis(c,2,dz);if(!(hx||hz)||!c.onGround)return;
  const sx=c.x,sy=c.y,sz=c.z;
  // retry from a raised position
  c.x=x0;c.z=z0;const up=c.stepH||.5;if(!charFits(c,c.x,c.y+up,c.z)){c.x=sx;c.y=sy;c.z=sz;return}c.y+=up;
  moveAxis(c,0,dx);moveAxis(c,2,dz);
  const moved=Math.hypot(c.x-x0,c.z-z0),before=Math.hypot(sx-x0,sz-z0);
  // drop back down onto the step
  const vy=c.vy;c.onGround=false;moveAxis(c,1,-up-.05);
  if(!c.onGround||moved<=before+1e-3){c.x=sx;c.y=sy;c.z=sz;c.onGround=true;c.vy=vy}else c.vy=0}
function moveChar(c,dt){
  if(!(isFinite(c.vx)&&isFinite(c.vy)&&isFinite(c.vz))){if(!moveChar.warned){moveChar.warned=1;console.error('non-finite velocity',c.vx,c.vy,c.vz)}c.vx=c.vy=c.vz=0}
  if(!(isFinite(c.x)&&isFinite(c.y)&&isFinite(c.z))){c.x=0;c.y=2;c.z=5}
  const wasGround=c.onGround;c.vy-=GRAV*dt;if(c.vy<-40)c.vy=-40;
  const n=Math.min(40,Math.max(1,Math.ceil(Math.max(Math.abs(c.vx),Math.abs(c.vz),Math.abs(c.vy))*dt/.2)));const st=dt/n;
  for(let i=0;i<n;i++){
    stepMove(c,c.vx*st,c.vz*st);
    const vy=c.vy;c.onGround=false;moveAxis(c,1,vy*st);
    // stay glued to stairs / slopes when walking down
    if(!c.onGround&&wasGround&&vy<=0&&!c.jumped){const y0=c.y;moveAxis(c,1,-(c.stepH||.5)*.9);if(!c.onGround)c.y=y0}
  }
  c.jumped=false}

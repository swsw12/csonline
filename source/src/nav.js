'use strict';
// ============ Navigation: multi-level walkable grid (1 m cells) derived from the brushes, A* with jump and drop links ============
const NAV={S:1,X0:-30,Z0:-30,NX:60,NZ:60,nodes:[],col:null,g:null,f:null,came:null,mark:null,stamp:0};
const _nq=[];
function navClearBox(x0,y0,z0,x1,y1,z1){return !overlapAny(x0,y0,z0,x1,y1,z1)}
function passClear(n,m){const y=Math.max(n.y,m.y)+.5;for(const k of [.25,.5,.75]){const x=lerp(n.x,m.x,k),z=lerp(n.z,m.z,k);if(!navClearBox(x-.25,y,z-.25,x+.25,y+1.2,z+.25))return false}
  // the floor in between must not dip (no holes)
  const fx=(n.x+m.x)/2,fz=(n.z+m.z)/2;const fl=floorBelow(fx,Math.max(n.y,m.y)+.6,fz,.2);return fl>Math.min(n.y,m.y)-.7}
function jumpClear(n,m){return navClearBox(n.x-.25,n.y+.05,n.z-.25,n.x+.25,m.y+1.75,n.z+.25)&&navClearBox((n.x+m.x)/2-.22,m.y+.05,(n.z+m.z)/2-.22,(n.x+m.x)/2+.22,m.y+1.7,(n.z+m.z)/2+.22)}
function dropClear(n,m){return navClearBox(m.x-.25,m.y+.05,m.z-.25,m.x+.25,n.y+1.75,m.z+.25)&&navClearBox((n.x+m.x)/2-.22,n.y+.05,(n.z+m.z)/2-.22,(n.x+m.x)/2+.22,n.y+1.7,(n.z+m.z)/2+.22)}
function buildNav(){const N=NAV;N.nodes=[];N.col=new Array(N.NX*N.NZ);
  for(let j=0;j<N.NZ;j++)for(let i=0;i<N.NX;i++){const x=N.X0+(i+.5)*N.S,z=N.Z0+(j+.5)*N.S;_nq.length=0;boxesIn(x-.01,z-.01,x+.01,z+.01,_nq);
    const tops=[];const stairY={};for(const b of _nq){if(b.nosolid)continue;if(x>=b.x0&&x<b.x1&&z>=b.z0&&z<b.z1&&b.y1>-5){if(tops.indexOf(b.y1)<0)tops.push(b.y1);if(b.o.stair)stairY[b.y1]=1}}
    tops.sort((a,b)=>a-b);const list=[];
    for(const y of tops){if(insideSolid(x,y+.05,z))continue;const st=!!stairY[y];if(overlapAny(x-.26,y+(st?.5:.3),z-.26,x+.26,y+1.7,z+.26))continue;if(!st&&overlapAny(x-.12,y+.05,z-.12,x+.12,y+1.7,z+.12))continue;
      const nd={id:N.nodes.length,i,j,x,z,y,e:[],stair:st};N.nodes.push(nd);list.push(nd)}
    N.col[j*N.NX+i]=list}
  for(const n of N.nodes){for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const i2=n.i+di,j2=n.j+dj;if(i2<0||j2<0||i2>=N.NX||j2>=N.NZ)continue;const diag=di&&dj;
      for(const m of N.col[j2*N.NX+i2]){const dy=m.y-n.y;const dh=diag?1.414:1;
        if(Math.abs(dy)<=((n.stair||m.stair)?.9:.6)){if(diag){const a=N.col[n.j*N.NX+i2].some(q=>Math.abs(q.y-n.y)<.6),b=N.col[j2*N.NX+n.i].some(q=>Math.abs(q.y-n.y)<.6);if(!a||!b)continue}if(passClear(n,m))n.e.push(m.id,dh,0)}
        else if(!diag&&dy>.6&&dy<=2.4){if(jumpClear(n,m))n.e.push(m.id,dh+1+dy*.8,dy)}
        else if(!diag&&dy<-.6&&dy>=-8.5){if(dropClear(n,m))n.e.push(m.id,dh+.3-dy*.2,dy)}}}}
  const L=N.nodes.length;N.g=new Float32Array(L);N.f=new Float32Array(L);N.came=new Int32Array(L);N.mark=new Int32Array(L);N.heap=new Int32Array(L*8+16);N.hf=new Float32Array(L*8+16);
  return L}
// node under/near a position
function navNode(x,y,z){const N=NAV;const i=Math.floor((x-N.X0)/N.S),j=Math.floor((z-N.Z0)/N.S);let best=null,bd=1e9;
  for(let r=0;r<=2&&!best;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i2=i+di,j2=j+dj;if(i2<0||j2<0||i2>=N.NX||j2>=N.NZ)continue;
    for(const n of N.col[j2*N.NX+i2]){if(n.y>y+.75)continue;const d=Math.hypot(n.x-x,n.z-z)+Math.abs(n.y-y)*(n.y<y-.3?1.5:3);if(d<bd){bd=d;best=n}}}
  return best}
// A*: returns array of node ids (start excluded) or null. maxJump limits jump links, maxDrop (if set) the height of drops.
function navPath(s,t,maxJump,maxIter,maxDrop){const N=NAV;if(!s||!t)return null;if(s===t)return [t.id];N.stamp++;const st=N.stamp,H=N.heap;let hn=0;
  const h=n=>Math.hypot(n.x-t.x,n.z-t.z)+Math.abs(n.y-t.y)*.5;
  // heap entries keep their own key (HF): a node re-pushed with a lower f leaves a stale entry behind, skipped when popped
  const HF=N.hf;let pf=0;
  const push=id=>{let i=hn++;H[i]=id;HF[i]=N.f[id];while(i>0){const p=(i-1)>>1;if(HF[p]<=HF[i])break;let q=H[p];H[p]=H[i];H[i]=q;q=HF[p];HF[p]=HF[i];HF[i]=q;i=p}};
  const pop=()=>{const r=H[0];pf=HF[0];hn--;H[0]=H[hn];HF[0]=HF[hn];let i=0;for(;;){const l=i*2+1,rr2=l+1;let m=i;if(l<hn&&HF[l]<HF[m])m=l;if(rr2<hn&&HF[rr2]<HF[m])m=rr2;if(m===i)break;let q=H[m];H[m]=H[i];H[i]=q;q=HF[m];HF[m]=HF[i];HF[i]=q;i=m}return r};
  N.mark[s.id]=st;N.g[s.id]=0;N.f[s.id]=h(s);N.came[s.id]=-1;push(s.id);let it=0;maxIter=maxIter||Math.max(6000,N.nodes.length*1.5|0);
  while(hn>0&&it++<maxIter){const cid=pop();if(cid===t.id)break;if(pf>N.f[cid]+1e-4)continue;const c=N.nodes[cid],e=c.e;const gc=N.g[cid];
    for(let k=0;k<e.length;k+=3){const nid=e[k],cost=e[k+1],typ=e[k+2];if(typ>0&&typ>maxJump)continue;if(typ<0&&maxDrop&&-typ>maxDrop)continue;const g=gc+cost;
      if(N.mark[nid]===st&&g>=N.g[nid])continue;N.mark[nid]=st;N.g[nid]=g;N.f[nid]=g+h(N.nodes[nid])*1.05;N.came[nid]=cid;if(hn<H.length-1)push(nid)}}
  if(N.mark[t.id]!==st)return null;const out=[];let c=t.id;while(c!==-1&&c!==s.id){out.push(c);c=N.came[c]}out.reverse();return out}
// edge type between two adjacent nodes (0 walk, >0 jump height, <0 drop height)
function navEdge(a,b){const e=a.e;for(let k=0;k<e.length;k+=3)if(e[k]===b.id)return e[k+2];return 0}
// straight-line walkability test at roughly one level (for path smoothing)
function navStraight(x0,y0,z0,x1,z1,hw){const d=Math.hypot(x1-x0,z1-z0);if(!(d<80))return false;const n=Math.ceil(d/.5);let fy=y0;
  for(let i=1;i<=n;i++){const k=i/n,x=lerp(x0,x1,k),z=lerp(z0,z1,k);if(overlapAny(x-hw,fy+.45,z-hw,x+hw,fy+1.6,z+hw))return false;const f=floorBelow(x,fy+.5,z,.15);if(f<fy-.45)return false;fy=Math.max(f,fy-.45)}return true}
// nearest node on (about) the given level within radius r
function navSnap(x,y,z,r){const N=NAV;let best=null,bd=1e9;const i0=Math.floor((x-r-N.X0)/N.S),i1=Math.floor((x+r-N.X0)/N.S),j0=Math.floor((z-r-N.Z0)/N.S),j1=Math.floor((z+r-N.Z0)/N.S);
  for(let j=Math.max(0,j0);j<=Math.min(N.NZ-1,j1);j++)for(let i=Math.max(0,i0);i<=Math.min(N.NX-1,i1);i++)for(const n of N.col[j*N.NX+i]){if(Math.abs(n.y-y)>.6)continue;if(n.e.length<6)continue;const d=Math.hypot(n.x-x,n.z-z);if(d<bd&&d<=r){bd=d;best=n}}
  return best}
// keep only what can be reached from the spawns (rooftops, ceiling tops and sealed pockets would otherwise get picked as wander targets)
function navPrune(seeds,maxJ){const N=NAV,L=N.nodes.length;const keep=new Uint8Array(L),st=[];
  for(const s of seeds){const n=navNode(s[0],s[1],s[2]);if(n&&!keep[n.id]){keep[n.id]=1;st.push(n.id)}}
  if(!st.length)return L;
  while(st.length){const e=N.nodes[st.pop()].e;for(let k=0;k<e.length;k+=3){const t=e[k+2];if(t>0&&t>maxJ)continue;const m=e[k];if(!keep[m]){keep[m]=1;st.push(m)}}}
  for(let i=0;i<N.col.length;i++)N.col[i]=N.col[i].filter(n=>keep[n.id]);
  const map=new Int32Array(L).fill(-1),nodes=[];for(const n of N.nodes)if(keep[n.id]){map[n.id]=nodes.length;nodes.push(n)}
  for(const n of nodes){const e=n.e,ne=[];for(let k=0;k<e.length;k+=3){const m=map[e[k]];if(m>=0)ne.push(m,e[k+1],e[k+2])}n.e=ne;n.id=map[n.id]}
  N.nodes=nodes;const K=nodes.length;N.g=new Float32Array(K);N.f=new Float32Array(K);N.came=new Int32Array(K);N.mark=new Int32Array(K);N.heap=new Int32Array(K*8+16);N.hf=new Float32Array(K*8+16);N.stamp=0;return K}

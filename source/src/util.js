'use strict';
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const dist=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let RNG=mulberry32(7);
const rnd=(a=1,b)=>b===undefined?RNG()*a:a+RNG()*(b-a);
const rint=(a,b)=>Math.floor(a+RNG()*(b-a+1));
const pick=a=>a[Math.floor(RNG()*a.length)];
const chance=p=>RNG()<p;
const BAYER4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const bayer=(x,y)=>BAYER4[(y&3)*4+(x&3)];
function hash2(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
// periodic value noise (period p cells) -> tileable. Lattice values for periodic noise come from cached tables.
const VN_T=new Map();let _vnK=-1,_vnT=null;
function vnTable(s,p){const k=s*1024+p;if(k===_vnK)return _vnT;let t=VN_T.get(k);if(!t){t=new Float32Array(p*p);for(let y=0;y<p;y++)for(let x=0;x<p;x++)t[y*p+x]=hash2(x,y,s);VN_T.set(k,t)}_vnK=k;_vnT=t;return t}
function vnoise(x,y,s,p){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;let a,b,c,d;
  if(p){const P=p<1.5?1:Math.round(p);if(P<=512){const T=vnTable(s,P);let x0=xi%P,y0=yi%P;if(x0<0)x0+=P;if(y0<0)y0+=P;const x1=x0+1===P?0:x0+1,y1=y0+1===P?0:y0+1,r0=y0*P,r1=y1*P;a=T[r0+x0];b=T[r0+x1];c=T[r1+x0];d=T[r1+x1]}
    else{const x0=((xi%P)+P)%P,y0=((yi%P)+P)%P,x1=(x0+1)%P,y1=(y0+1)%P;a=hash2(x0,y0,s);b=hash2(x1,y0,s);c=hash2(x0,y1,s);d=hash2(x1,y1,s)}}
  else{a=hash2(xi,yi,s);b=hash2(xi+1,yi,s);c=hash2(xi,yi+1,s);d=hash2(xi+1,yi+1,s)}
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
// periodic fbm keeps the lattice tables of its octaves in a small most-recently-used list (painters call it per pixel with a few fixed settings)
const _fbC=[];
function fbmTabs(s,oct,p){for(let i=0;i<_fbC.length;i++){const e=_fbC[i];if(e.s===s&&e.o===oct&&e.p===p)return e.t}
  // small lattices are tabulated; big ones (fine octaves over a single small face) are cheaper to hash on the fly than to build
  const t=[];for(let i=0;i<oct;i++){const P=Math.max(1,Math.round(p*(1<<i)));t.push(P,P<=64?vnTable(s+i*17,P):null)}_fbC.unshift({s,o:oct,p,t});if(_fbC.length>8)_fbC.pop();return t}
function fbm(x,y,s,oct,p){let v=0,amp=.5,f=1,n=0;
  if(!p){for(let i=0;i<oct;i++){v+=vnoise(x*f,y*f,s+i*17,0)*amp;n+=amp;amp*=.5;f*=2}return v/n}
  const T=fbmTabs(s,oct,p);
  for(let i=0;i<oct;i++){const P=T[i*2],tab=T[i*2+1];
    const X=x*f,Y=y*f,xi=Math.floor(X),yi=Math.floor(Y),xf=X-xi,yf=Y-yi;let x0=xi%P,y0=yi%P;if(x0<0)x0+=P;if(y0<0)y0+=P;const x1=x0+1===P?0:x0+1,y1=y0+1===P?0:y0+1;let a,b,c,d;
    if(tab===null){const si=s+i*17;a=hash2(x0,y0,si);b=hash2(x1,y0,si);c=hash2(x0,y1,si);d=hash2(x1,y1,si)}
    else{const r0=y0*P,r1=y1*P;a=tab[r0+x0];b=tab[r0+x1];c=tab[r1+x0];d=tab[r1+x1]}
    const u=xf*xf*(3-2*xf),w=yf*yf*(3-2*yf);v+=(a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w)*amp;
    n+=amp;amp*=.5;f*=2}
  return v/n}
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=false;return [c,x]}
function hexRGB(h){h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgbHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}
// colour mixes are memoised: the procedural painters ask for the same few thousand shades millions of times
// (nested by colour, then an array by t in 1/128 steps: no key strings are built per call)
const MIXC=new Map();function mix(a,b,t){const ti=Math.round(t*128);let m=MIXC.get(a);if(m===undefined){m=new Map();MIXC.set(a,m)}let r=m.get(b);if(r===undefined){r=[];m.set(b,r)}
  let v=r[ti];if(v===undefined){const A=rgbOf(a),B=rgbOf(b),tt=ti/128;v=r[ti]=rgbHex(lerp(A[0],B[0],tt),lerp(A[1],B[1],tt),lerp(A[2],B[2],tt))}return v}
const PACKC=new Map();function packRGB(c){let v=PACKC.get(c);if(v===undefined){const h=hexRGB(c);v=(255<<24|h[2]<<16|h[1]<<8|h[0])>>>0;PACKC.set(c,v)}return v}
const LS={get(k,d){try{const v=localStorage.getItem('qz_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('qz_'+k,JSON.stringify(v))}catch(e){}}};
const $=id=>document.getElementById(id);
const smooth=t=>t*t*(3-2*t);
const wrapA=a=>{a%=TAU;if(a>Math.PI)a-=TAU;if(a<-Math.PI)a+=TAU;return a};
const approach=(v,t,d)=>v<t?Math.min(t,v+d):Math.max(t,v-d);
const dist2=(ax,az,bx,bz)=>Math.hypot(bx-ax,bz-az);
const dist3=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
function shuffle(a,r){r=r||Math.random;for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const rr=(a,b)=>a+Math.random()*(b-a);
const rpick=a=>a[Math.floor(Math.random()*a.length)];
const _rgbCache={};function rgbOf(c){return _rgbCache[c]||(_rgbCache[c]=hexRGB(c))}
const dk=(c,a)=>mix(c,'#0c0a10',a==null?.3:a),lt=(c,a)=>mix(c,'#fff4dc',a==null?.25:a);

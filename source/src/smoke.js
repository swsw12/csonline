'use strict';
// ============ 연막탄 (v6.52): a smoke grenade in every mode ============
// Bought and thrown like the others (slot 4, once a round). It pops where it comes to rest (3 s at the most) and fills the space round it
// for SMK.LIFE s: a flood over a grid of C-metre columns from the canister, through openings only (walls, crates and shut doors stop it;
// fences and railings do not; it spills over drops and climbs low steps), out to R metres along the way it can spread, up to a dome TOP m
// high (under any ceiling). The cloud grows over GROW s and thins out over FADE s at the end.
// Nothing sees through it: a line of sight is cut once it runs through THR metres' worth of smoke (thin at the rim, thick inside) — bots
// in every mode, zombies running straight at someone, the bosses (ESMK.at, epbase.js), the radar, the name under the crosshair.
// Drawn with camera-facing puffs of its own (lit by the light probes, sorted, faded near the eye, kept small next to walls so none shows
// through one), and a grey veil over the picture while the eye is inside a cloud (the first-person gun stays clear).
// Network: every page grows a cloud from its own copy of the grenade; the host's says where it really popped (smk) and the others move
// theirs there (or make it, when the host's comes first).
// Bots (대인전): attackers in 폭파미션 smoke the defenders' side of the site on their way in, defenders smoke a planted bomb before going
// to defuse it, and a hurt bot in a gunfight smokes the gap and backs off.
Object.assign(GUNS,{smkg:{parts:[Pt(0,.004,-.03,.05,.1,.05,'gunmetal',{r:.012}),Pt(0,.028,-.03,.052,.022,.052,'white'),Pt(0,-.042,-.03,.046,.008,.046,'white'),
  Pt(0,.061,-.03,.03,.016,.03,'steel'),Pt(.021,.03,-.03,.007,.07,.014,'steel'),Pt(-.02,.064,-.03,.014,.014,.004,'bright')],grip:[0,0,0],muzzle:[0,0,-.03]}});
// the pop and the long hiss
Object.assign(SFX,{smoke:{n:2,dur:3.4,peak:.78,gain:.62,rev:.22,fn:B=>{
  B.osc('sine',150,52,0,.22,B.env(0,.004,.9,.2));B.nz('brown',0,.3,B.f('lowpass',420,.7,B.env(0,.003,.8,.16)));B.grain(0,1800,1.2,.05,.5);
  const o=B.g(1);B.am(o,.05,3.2,18,.3);B.nz('white',.04,3.2,B.f('bandpass',3300,.55,B.envT(.04,.3,.6,1.15,o)));B.nz('pink',.04,3.2,B.f('highpass',1100,.6,B.envT(.04,.35,.45,.95,o)))}}});
SFX_ORDER.push('smoke');
const _smC=new THREE.Color(),_smV=new THREE.Vector3();
// the smoke's colour where it is: light grey in daylight, darker indoors and at night, a hint of the light's own colour
function smkLit(x,y,z,k,out){sampleProbe(x,y,z,_smC);const s=_smC.r+_smC.g+_smC.b,l=clamp(.2+.4*s,.24,.86)*k,m=s/3||1;out[0]=l*(.8+.2*_smC.r/m);out[1]=l*(.8+.2*_smC.g/m);out[2]=l*(.8+.2*_smC.b/m)*1.02;return out}
const _smL=[0,0,0];
const SMK={R:5.2,C:.8,TOP:3.8,LIFE:18,GROW:2.4,FADE:3.2,EDGE:1.5,THR:1.6,RB:7.4,MAX:8,NP:104,MAXP:860,
  list:[],n:0,id:0,P:[],mesh:null,geo:null,veil:null,vk:0,aimT:0,
  // ---------- the cloud ----------
  // the space it fills (S.cells, N×N columns round the canister): each column's ground g, ceiling, top, how far the smoke travelled
  // to get there (d) and how far it is from a wall (wd). False when there is no room at all
  build(S){const C=this.C,R=this.R+this.EDGE*.5,M=Math.ceil(R/C)+1,N=2*M+1,X0=S.x-(M+.5)*C,Z0=S.z-(M+.5)*C,by=S.y,k0=M*N+M,info=new Array(N*N);
    S.N=N;S.x0=X0;S.z0=Z0;S.cells=new Array(N*N).fill(null);
    // a column: its ground (over a drop or nothing: hanging 1.7 m below the canister), its ceiling; null inside something solid or on top
    // of something tall
    const col=k=>{if(info[k]!==undefined)return info[k];const i=k%N,j=(k/N)|0,x=X0+(i+.5)*C,z=Z0+(j+.5)*C;let g=k===k0?by:floorBelow(x,by+1.7,z,.05),r=null;const drop=g<by-1.7;if(drop)g=by-1.7;
      if(g<=by+1.45&&(k===k0||(drop?!insideSolid(x,by+.4,z)&&!insideSolid(x,by+1.4,z):!insideSolid(x,g+.35,z)))){const h=rayCast(x,g+.3,z,0,1,0,this.TOP+1.5,LOS_F),ceil=h?g+.3+h.t:1e9;
        if(ceil-g>.75)r={i,j,x,z,g,ceil,top:0,d:1e9,wd:1e9,blk:0,done:0,inq:0,pa:null,ch:null}}
      info[k]=r;return r};
    // can it get from one column to the next: an open line at knee or head height (a step up of more than 1.2 m stops it)
    const pass=(a,b)=>{if(b.g-a.g>1.2)return false;const hi=Math.max(a.g,b.g),y0=hi+.45,y1=Math.min(hi+1.5,Math.min(a.ceil,b.ceil)-.1);
      return losClear(a.x,y0,a.z,b.x,y0,b.z)||y1>y0+.3&&losClear(a.x,y1,a.z,b.x,y1,b.z)};
    const c0=col(k0);if(!c0)return false;c0.d=0;c0.inq=1;const open=[c0],D2=C*Math.SQRT2,DIR=[[1,0,C],[-1,0,C],[0,1,C],[0,-1,C],[1,1,D2],[1,-1,D2],[-1,1,D2],[-1,-1,D2]],L=[];
    while(open.length){let bi=0;for(let q=1;q<open.length;q++)if(open[q].d<open[bi].d)bi=q;const a=open[bi];open[bi]=open[open.length-1];open.pop();a.done=1;L.push(a);
      for(let di=0;di<8;di++){const e=DIR[di],i=a.i+e[0],j=a.j+e[1];if(i<0||j<0||i>=N||j>=N)continue;const nd=a.d+e[2];if(nd>R)continue;const b=col(j*N+i);
        if(!b){if(di<4)a.blk|=1<<di;continue}if(b.done||nd>=b.d)continue;
        let ok=pass(a,b);if(ok&&di>=4){const p=col(a.j*N+i),q=col(j*N+a.i);ok=!!(p&&q)&&pass(a,p)&&pass(a,q)&&pass(p,b)&&pass(q,b)}
        if(!ok){if(di<4)a.blk|=1<<di;continue}b.d=nd;b.pa=a;if(!b.inq){b.inq=1;open.push(b)}}}
    // the distance to the nearest wall (a column with a blocked side is half a cell from one)
    const q=[];for(const c of L)if(c.blk){c.wd=C*.5;q.push(c)}
    for(let h=0;h<q.length;h++){const a=q[h];for(let di=0;di<4;di++){const e=DIR[di],i=a.i+e[0],j=a.j+e[1];if(i<0||j<0||i>=N||j>=N)continue;const b=info[j*N+i];if(b&&b.done&&b.wd>a.wd+C){b.wd=a.wd+C;q.push(b)}}}
    S.list=[];for(const c of L){c.top=Math.min(by+this.TOP*(1-.35*Math.pow(Math.min(1,c.d/R),2)),c.ceil-.05);if(c.top<c.g+.5)continue;S.cells[c.j*N+c.i]=c;S.list.push(c)}
    S.np=clamp(Math.round(S.list.length*.7),18,this.NP);return S.list.length>0},
  // a cloud: o the thrower's id, conf once the host has said where it is
  add(o,x,y,z,conf){const S={id:++this.id,o,x,y,z,t:0,t0:G.t,life:this.LIFE,conf:!!conf,mine:0,k:0,Re:0,pc:0,dead:0};if(!this.build(S))return null;
    this.list.push(S);while(this.list.length>this.MAX){const s=this.list.shift();s.dead=1}this.n=this.list.length;
    AU.at('smoke',x,y+.3,z,{vol:1,range:55});for(let i=0;i<10;i++){const a=Math.random()*TAU,s=rr(1.5,4);FX.spawn({x,y:y+.15,z,vx:Math.cos(a)*s,vy:rr(.3,1.4),vz:Math.sin(a)*s,life:rr(.5,.9),s0:.3,s1:1.1,r:.7,g:.71,b:.72,a:.5,f:2,drag:3,lit:1})}
    return S},
  // a grenade lies still: its cloud (null when it fell out of the world). The host's says where it is for everyone
  pop(n){const own=n.owner&&n.owner.id!=null?n.owner.id:-1,x=n.x,z=n.z,f=floorBelow(x,n.y+.25,z,.05),y=f>n.y-2.5?f:n.y-.3;if(y<-30)return null;
    // the host's came in first: this grenade is that cloud
    if(NET.cli)for(const S of this.list)if(S.o===own&&S.conf&&!S.mine&&G.t-S.t0<4&&Math.hypot(S.x-x,S.z-z)<8){S.mine=1;return S}
    const S=this.add(own,x,y,z,!NET.cli);if(!S)return null;S.mine=1;if(NET.host)netEv('smk',{o:own,p:[r2(x),r2(y),r2(z)]});return S},
  // the host's word on a cloud: move ours there, or make it
  fromHost(o,x,y,z){for(const S of this.list)if(S.o===o&&!S.conf&&G.t-S.t0<5&&Math.hypot(S.x-x,S.z-z)<8){S.conf=true;this.move(S,x,y,z);return S}return this.add(o,x,y,z,true)},
  move(S,x,y,z){const dx=x-S.x,dy=y-S.y,dz=z-S.z;if(Math.hypot(dx,dy,dz)<.2)return;S.x=x;S.y=y;S.z=z;if(!this.build(S)){S.dead=1;return}
    for(const p of this.P)if(p.S===S)p.S=null;S.pc=0},// (its puffs go: the columns are new)
  done(S){return !S||S.dead},
  clear(){for(const S of this.list)S.dead=1;this.list=[];this.n=0;this.P.length=0;this.vk=0;if(this.veil)this.veil.visible=false},
  // the clock: growing (Re, the reach so far), thick (k), thinning out
  tick(dt){if(!this.list.length)return;const RR=this.R+this.EDGE*.5;
    for(let i=this.list.length-1;i>=0;i--){const S=this.list[i];if(S.dead){this.list.splice(i,1);continue}S.t+=dt;const u=Math.min(1,S.t/this.GROW);S.Re=RR*(.12+.88*(1-Math.pow(1-u,2.2)));
      S.k=S.t<.5?smooth(S.t/.5):S.t<S.life?1:Math.max(0,1-(S.t-S.life)/this.FADE);if(S.t>S.life+this.FADE){S.dead=1;this.list.splice(i,1)}}
    this.n=this.list.length},
  // ---------- seeing through it ----------
  // how thick it is at a point (0..1)
  dens(S,x,y,z){const C=this.C,i=Math.floor((x-S.x0)/C),j=Math.floor((z-S.z0)/C);if(i<0||j<0||i>=S.N||j>=S.N)return 0;const c=S.cells[j*S.N+i];if(!c)return 0;
    const fh=(S.Re-c.d)/this.EDGE;if(fh<=0)return 0;const fv=Math.min(1,(c.top-y)/.9,(y-c.g+.3)/.35);if(fv<=0)return 0;return Math.min(1,fh)*fv*S.k},
  at(x,y,z){let v=0;for(const S of this.list)v+=this.dens(S,x,y,z);return Math.min(1,v)},
  // the smoke along a line, summed over the clouds it crosses (metres of thick smoke)
  line(S,ax,ay,az,ux,uy,uz,L,lim){const cx=S.x-ax,cy=S.y+.8-ay,cz=S.z-az,tc=cx*ux+cy*uy+cz*uz,e2=cx*cx+cy*cy+cz*cz-tc*tc,rb=this.RB;if(e2>rb*rb)return 0;
    const h=Math.sqrt(rb*rb-e2),t0=Math.max(0,tc-h),t1=Math.min(L,tc+h);let s=0;for(let t=t0+.17;t<t1;t+=.34){s+=this.dens(S,ax+ux*t,ay+uy*t,az+uz*t)*.34;if(s>=lim)break}return s},
  // is the line between two points cut by smoke? (thr: metres of thick smoke that hide, THR by default)
  blocks(ax,ay,az,bx,by,bz,thr){if(!this.n)return false;const dx=bx-ax,dy=by-ay,dz=bz-az,L=Math.hypot(dx,dy,dz);if(L<.1)return false;const T=thr||this.THR;let s=0;
    for(const S of this.list){if(S.k<.03)continue;s+=this.line(S,ax,ay,az,dx/L,dy/L,dz/L,L,T-s);if(s>=T)return true}return false},
  // the chapters' flat checks (ESMK, epbase.js): standing in a cloud, a line across one at its own middle height
  atXZ(x,z){for(const S of this.list)if(this.dens(S,x,S.y+1.2,z)>.45)return S;return null},
  blocks2(ax,az,bx,bz){if(!this.n)return false;const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<.1)return false;let s=0;
    for(const S of this.list){if(S.k<.03)continue;s+=this.line(S,ax,S.y+1.2,az,dx/L,0,dz/L,L,this.THR-s);if(s>=this.THR)return true}return false},
  // an actor's view of another (eye to chest, or eye to head): both cut by smoke? (and not right next to each other)
  hides(a,t){if(!this.n)return false;const e=actorEye(a),d=Math.hypot(t.c.x-e.x,t.c.z-e.z);if(d<1.4)return false;
    return this.blocks(e.x,e.y,e.z,t.c.x,t.c.y+1.2,t.c.z)&&this.blocks(e.x,e.y,e.z,t.c.x,t.head?t.head.y:t.c.y+1.6,t.c.z)},

  // ---------- the look ----------
  // four soft puff shapes, 64 px each
  texP(){return paint(128,128,P=>{const D=P.D;for(let i=0;i<D.length;i+=4){D[i]=D[i+1]=D[i+2]=255;D[i+3]=0}
    for(let f=0;f<4;f++){const ox=(f%2)*64,oy=(f>>1)*64;for(let y=0;y<64;y++)for(let x=0;x<64;x++){const u=(x-31.5)/30,v=(y-31.5)/30,r=Math.hypot(u,v);if(r>=1)continue;
      const n1=fbm(x/11+f*7.3,y/11+f*3.1,71+f,3,0),n2=vnoise(x/4,y/4,90+f,0),d=r+(n1-.5)*.6+(n2-.5)*.14;if(d>=.98)continue;
      const a=smooth(clamp((.98-d)/.6,0,1))*clamp((1-r)/.18,0,1)*(.82+.18*n2),l=228+26*(n1-.5)+14*(n2-.5),i=((oy+y)*128+ox+x)*4;D[i]=D[i+1]=D[i+2]=clamp(l,0,255)|0;D[i+3]=clamp(a*255,0,255)|0}}})},
  init(){if(this.mesh)return;const n=this.MAXP,g=new THREE.BufferGeometry(),pos=new Float32Array(n*12),q=new Float32Array(n*8),sz=new Float32Array(n*4),ro=new Float32Array(n*4),co=new Float32Array(n*16),fr=new Float32Array(n*4),idx=new Uint16Array(n*6);
    for(let i=0;i<n;i++){q.set([-1,-1,1,-1,1,1,-1,1],i*8);const b=i*4;idx.set([b,b+1,b+2,b,b+2,b+3],i*6)}
    const A=(k,arr,w,dyn)=>{const at=new THREE.BufferAttribute(arr,w);if(dyn)at.setUsage(THREE.DynamicDrawUsage);g.setAttribute(k,at);return at};
    A('position',pos,3,1);A('aQ',q,2);A('aS',sz,1,1);A('aR',ro,1,1);A('aC',co,4,1);A('aF',fr,1,1);g.setIndex(new THREE.BufferAttribute(idx,1));g.setDrawRange(0,0);
    const t=new THREE.CanvasTexture(this.texP());t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
    const m=new THREE.ShaderMaterial({uniforms:{map:{value:t},uFogC:LU.uFogC,uFogD:LU.uFogD},transparent:true,depthWrite:false,depthTest:true,
      vertexShader:'attribute vec2 aQ;attribute float aS;attribute float aR;attribute vec4 aC;attribute float aF;uniform float uFogD;varying vec2 vUv;varying vec4 vC;varying float vFog;'+
        'void main(){vec4 mv=modelViewMatrix*vec4(position,1.);float d=-mv.z,c=cos(aR),s=sin(aR);mv.xy+=vec2(c*aQ.x-s*aQ.y,s*aQ.x+c*aQ.y)*aS;'+
        'vUv=(aQ*.5+.5+vec2(mod(aF,2.),floor(aF/2.)))*.5;vC=aC;vC.a*=smoothstep(.2,1.4,d);vFog=1.-exp(-uFogD*uFogD*d*d);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'uniform sampler2D map;uniform vec3 uFogC;varying vec2 vUv;varying vec4 vC;varying float vFog;'+
        'void main(){vec4 t=texture2D(map,vUv);float a=t.a*vC.a;if(a<.004)discard;gl_FragColor=vec4(mix(vC.rgb*t.rgb,uFogC,vFog),a);}'});
    const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6.5;R.scene.add(mesh);this.mesh=mesh;this.geo=g;
    // the veil while the eye is inside: drawn last in the world (over muzzle flashes and tracers too), under the first-person gun
    const vm=new THREE.ShaderMaterial({uniforms:{uK:{value:0},uC:{value:new THREE.Color(.6,.61,.62)},uT:LU.uTime,uO:{value:new THREE.Vector2()}},transparent:true,depthWrite:false,depthTest:false,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:'uniform float uK;uniform vec3 uC;uniform float uT;uniform vec2 uO;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}'+
        'void main(){vec2 p=vUv*vec2(3.4,1.9)+uO;float v=n(p+vec2(uT*.06,uT*.025))*.62+n(p*2.4-vec2(uT*.045,uT*.02))*.38;gl_FragColor=vec4(uC*(.9+.2*v),clamp(uK*(.86+.2*v),0.,1.));}'});
    const vq=new THREE.Mesh(new THREE.PlaneGeometry(2,2),vm);vq.frustumCulled=false;vq.renderOrder=6.6;vq.visible=false;R.scene.add(vq);this.veil=vq},
  // a new puff for a cloud: while it grows each one rides out from the canister along the flood to a column of the whole cloud; later
  // they come up in place, fewer at the rim
  puff(S){const L=S.list,grow=S.t<this.GROW;let c=null;for(let k=0;k<7;k++){const q=L[(Math.random()*L.length)|0];if(!grow&&(q.d>S.Re-.2||q.d>S.Re-this.EDGE&&Math.random()<.45))continue;c=q;break}if(!c)return false;
    const C=this.C,jx=rr(-C*.5,C*.5),jz=rr(-C*.5,C*.5),y=c.g+(Math.random()<.25?rr(.3,.8):rr(.4,Math.max(.5,c.top-c.g-.2)));
    let r=rr(1.4,2.1);r=Math.max(.45,Math.min(r,c.wd+.3,y-c.g+.6,c.ceil<1e8?c.ceil-y+.2:9));
    if(!c.ch){const ch=[];for(let q=c;q;q=q.pa)ch.unshift(q);c.ch=ch}
    const sh=.88+.18*clamp((y-c.g)/Math.max(.5,c.top-c.g),0,1);smkLit(c.x,y,c.z,sh,_smL);
    this.P.push({S,c,jx,jz,ty:y,sy:S.y+.3,tr:grow,x:grow?S.x:c.x+jx,y:grow?S.y+.3:y,z:grow?S.z:c.z+jz,vx:rr(-.07,.07),vy:rr(.005,.05),vz:rr(-.07,.07),t:0,life:grow?rr(5.5,8.5):rr(4.5,7),r0:r*(grow?.5:.8),r1:r,
      rot:Math.random()*TAU,vr:rr(-.14,.14),a:rr(.7,.88),f:(Math.random()*4)|0,cr:_smL[0],cg:_smL[1],cb:_smL[2]});S.pc++;return true},
  // where a riding puff is: on its way out as far as the cloud's front (S.Re) has come
  ride(p,S){const c=p.c,F=S.Re-.35;if(F>=c.d){p.tr=false;p.x=c.x+p.jx;p.y=p.ty;p.z=c.z+p.jz;return}const s=Math.max(0,F),ch=c.ch;let k=0;while(k<ch.length-1&&ch[k+1].d<=s)k++;
    const a=ch[k],b=ch[Math.min(k+1,ch.length-1)],u=b===a?0:clamp((s-a.d)/(b.d-a.d),0,1),f=c.d>0?s/c.d:1;p.x=lerp(a.x,b.x,u)+p.jx*f;p.z=lerp(a.z,b.z,u)+p.jz*f;p.y=lerp(p.sy,p.ty,f)},
  // every drawn frame: new puffs, the old ones drifting and fading, the depth order, the veil
  draw(dt){const P=this.P;if(!this.list.length&&!P.length){if(this.mesh&&this.geo.drawRange.count)this.geo.setDrawRange(0,0);this.veilK(dt,0);return}this.init();
    for(const S of this.list){if(S.t>S.life-1.5)continue;let k=0;while(S.pc<S.np&&k<(S.t<.4?24:5)){if(!this.puff(S))break;k++}}
    const cam=R.cam.position;_smV.set(0,0,-1).applyQuaternion(R.cam.quaternion);let w=0;
    for(let i=0;i<P.length;i++){const p=P[i],S=p.S;p.t+=dt;if(!S||p.t>=p.life||S.dead){if(S)S.pc--;continue}
      if(p.tr)this.ride(p,S);else{p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt}
      p.rot+=p.vr*dt;p.dz=(p.x-cam.x)*_smV.x+(p.y-cam.y)*_smV.y+(p.z-cam.z)*_smV.z;P[w++]=p}
    P.length=w;P.sort((a,b)=>b.dz-a.dz);
    // (puffs right at the eye are faded out anyway; inside a cloud the veil hides the near ones: neither is drawn)
    const g=this.geo,n=Math.min(P.length,this.MAXP),pos=g.attributes.position.array,sz=g.attributes.aS.array,ro=g.attributes.aR.array,co=g.attributes.aC.array,fr=g.attributes.aF.array,near=this.vk>.5?2:.25;let m=0;
    for(let i=0;i<n;i++){const p=P[i];if(p.dz<near)continue;const S=p.S,e=p.tr?.8:clamp((S.Re-p.c.d)/this.EDGE,.35,1),a=p.a*e*S.k*smooth(clamp(p.t/(p.tr?.35:.9),0,1))*(1-smooth(clamp((p.t-p.life+1.6)/1.6,0,1))),r=lerp(p.r0,p.r1,Math.min(1,p.t/p.life*1.6));
      for(let v=0;v<4;v++){const j=m*4+v;pos[j*3]=p.x;pos[j*3+1]=p.y;pos[j*3+2]=p.z;sz[j]=r;ro[j]=p.rot;co[j*4]=p.cr;co[j*4+1]=p.cg;co[j*4+2]=p.cb;co[j*4+3]=a;fr[j]=p.f}m++}
    for(const k of ['position','aS','aR','aC','aF'])g.attributes[k].needsUpdate=true;g.setDrawRange(0,m*6);
    // the eye inside a cloud: a grey veil as thick as the smoke there, lit like it
    let d=0;for(const S of this.list)d+=this.dens(S,cam.x,cam.y,cam.z);this.veilK(dt,Math.min(1,d))},
  veilK(dt,t){this.vk=approach(this.vk,t*.88,dt*(t*.88>this.vk?2.6:1.8));const V=this.veil;if(!V)return;V.visible=this.vk>.004;if(!V.visible)return;const U=V.material.uniforms,cam=R.cam.position;
    U.uK.value=this.vk;smkLit(cam.x,cam.y,cam.z,.92,_smL);U.uC.value.setRGB(_smL[0],_smL[1],_smL[2]);
    const P=G.player,s=G.spec&&P&&!P.alive?G.spec:P;if(s)U.uO.value.set(s.yaw*1.1,(s.pitch||0)*1.1)},
  // the canister on the ground: a thin jet while the cloud is young
  hiss(n){const S=n.sm;if(!S||S.t>6||Math.random()>.35)return;FX.spawn({x:n.x,y:n.y+.12,z:n.z,vx:rr(-.5,.5),vy:rr(1,2.4),vz:rr(-.5,.5),life:rr(.5,1),s0:.12,s1:.7,r:.75,g:.76,b:.77,a:.4,f:2,drag:2,lit:1})},
  // the radar: a grey patch where each cloud is
  mini(x,tg,cs,sn,s,c,R0,d){if(!this.list.length)return;x.save();x.beginPath();x.arc(c,c,R0,0,TAU);x.clip();
    for(const S of this.list){if(S.k<.05)continue;const dx=S.x-tg.c.x,dz=S.z-tg.c.z,sx=c+(dx*cs-dz*sn)*s,sy=c+(dx*sn+dz*cs)*s,r=Math.max(2,(S.Re-.6)*s);if(Math.hypot(sx-c,sy-c)>R0+r)continue;
      x.fillStyle=`rgba(196,202,210,${(.34*S.k).toFixed(3)})`;x.beginPath();x.arc(sx,sy,r,0,TAU);x.fill()}x.restore()},

  // ---------- bots ----------
  // where a grenade let go here, this fast, comes to rest (updNade's flight and bounces in short steps), or null
  // (lim: given up once it is that far out from where it started and still flying — it will not come back)
  sim(x,y,z,vx,vy,vz,lim){const h=1/120,x0=x,z0=z,L2=lim?lim*lim:1e9;for(let t=0;t<3;t+=h){vy-=GRAV*.8*h;const sp=Math.hypot(vx,vy,vz),d=sp*h;if(d<1e-5)continue;const r=rayCast(x,y,z,vx/sp,vy/sp,vz/sp,d+.06);
      if(r&&r.t<d+.06){const vn=vx*r.nx+vy*r.ny+vz*r.nz,ny=r.ny;vx=(vx-1.6*vn*r.nx)*.6;vy=(vy-1.6*vn*r.ny)*.6;vz=(vz-1.6*vn*r.nz)*.6;if(ny>.7&&Math.hypot(vx,vy,vz)<1.2)return [x,y,z]}
      else{x+=vx*h;y+=vy*h;z+=vz*h;if((x-x0)*(x-x0)+(z-z0)*(z-z0)>L2)return [x,y,z]}if(y<-5)return null}return [x,y,z]},
  // the aim (yaw, pitch) that lands a smoke grenade from where this bot stands closest to a point, if one lands near enough
  // (a coarse sweep of the pitch, then a finer one round the best; a little to either side when straight at it does not do)
  aim(a,tx,ty,tz){const e=actorEye(a),dx=tx-e.x,dz=tz-e.z,D=Math.hypot(dx,dz);if(D<3||D>36)return null;const y0=Math.atan2(-dx,-dz);let best=null;
    const tr=(yaw,p)=>{aimDir(yaw,p+.12,_smV);const r=this.sim(e.x+_smV.x*.4,e.y+_smV.y*.4-.1,e.z+_smV.z*.4,_smV.x*14.5,_smV.y*14.5+2,_smV.z*14.5,D+9);if(!r)return;
      const err=Math.hypot(r[0]-tx,r[2]-tz)+Math.abs(r[1]-ty)*1.5;if(!best||err<best.err)best={yaw,pitch:p,err,x:r[0],y:r[1],z:r[2]}};
    for(const off of [0,-.07,.07,-.14,.14]){const yaw=y0+off,b0=best;for(let p=-.3;p<=1.15;p+=.12)tr(yaw,p);
      if(best&&best!==b0&&best.yaw===yaw){const pc=best.pitch;for(let p=pc-.09;p<=pc+.091;p+=.03)if(Math.abs(p-pc)>.01)tr(yaw,p)}
      if(best&&best.err<1.5)break}
    return best&&best.err<3.2?best:null},
  // is there smoke there already (or one on its way)?
  smoked(x,y,z){for(const S of this.list)if(S.t<S.life-4&&Math.hypot(S.x-x,S.z-z)<3.5&&Math.abs(S.y-y)<2.5)return true;
    for(const a of G.actors){const Q=a.bot&&a.bot.smk;if(Q&&Math.hypot(Q.x-x,Q.z-z)<3.5)return true}
    for(const n of NADES)if(n.kind==='smoke'&&!n.sm&&n.owner&&n.owner.bot&&n.tx!=null&&Math.hypot(n.tx-x,n.tz-z)<3.5)return true;return false},
  // a plan to smoke a point: the aim worked out now (one bot a frame at most); force: even with an enemy in sight; then(a): after the throw
  plan(a,x,y,z,force,then){if(G.t<this.aimT)return false;this.aimT=G.t+.12;const A=this.aim(a,x,y,z);if(!A){a.bot.smkF=G.t+1.5;return false}
    a.bot.smk={st:'eq',yaw:A.yaw,pitch:A.pitch,x,y,z,t0:G.t,force:!!force,then:then||null,n:0};return true},
  // carrying it out: the grenade in hand, the aim, the throw (standing still); true while busy
  botThrow(a,dt){const B=a.bot,Q=B&&B.smk;if(!Q)return false;const cmd=a.cmd,tg=B.tg&&B.tg.alive?B.tg:null;
    if(!a.alive||Q.st!=='go'&&(!(a.inv.smoke>0)||G.t>Q.t0+3||!Q.force&&tg&&dist3(tg.c,a.c)<32)){B.smk=null;if(a.alive&&a.cur==='smoke'&&a.throwT<=0)equip(a,bestWeapon(a));return false}
    cmd.f=cmd.s=0;cmd.jump=cmd.duck=cmd.fire=cmd.alt=false;B.path=null;
    if(Q.st==='eq'){if(a.cur!=='smoke')equip(a,'smoke');else if(a.drawT<=0)Q.st='aim';AI.turnTo(a,Q.yaw,Q.pitch,dt,10);return true}
    if(Q.st==='aim'){AI.turnTo(a,Q.yaw,Q.pitch,dt,10);if(Math.abs(wrapA(Q.yaw-a.yaw))<.03&&Math.abs(Q.pitch-a.pitch)<.03){a.yaw=Q.yaw;a.pitch=Q.pitch;cmd.fire=true;Q.st='go';Q.n=a.inv.smoke;Q.tg=G.t}return true}
    a.yaw=Q.yaw;a.pitch=Q.pitch;if(a.throwT>0||a.cur==='smoke'&&a.inv.smoke>=Q.n&&G.t<Q.tg+1)return true;
    // let go: the grenade remembers where it was meant to go (the others do not smoke the same spot meanwhile)
    for(let i=NADES.length-1;i>=0;i--){const n=NADES[i];if(n.owner===a&&n.kind==='smoke'&&n.tx==null){n.tx=Q.x;n.tz=Q.z;break}}
    B.smk=null;if(a.cur==='smoke'&&!(a.inv.smoke>0))equip(a,bestWeapon(a));if(Q.then)Q.then(a);return false},
  // the smoke spots of a bomb site: the map's own (bomb.smk), or the side of it the defenders come from
  spots(k){const D=BOMB.D(),S=D&&D[k];if(!S)return [];if(D.smk&&D.smk[k])return D.smk[k];const C=BOMB.ctCen(),dx=C.x-S.x,dz=C.z-S.z,l=Math.hypot(dx,dz)||1,n=navSnap(S.x+dx/l*(S.r+2.5),0,S.z+dz/l*(S.r+2.5),4);return n?[[n.x,n.z,n.y]]:[]},
  // a 대인전 bot thinking (pvp.js, a few times a second): a smoke now?
  botThink(a){const B=a.bot;if(!B||B.smk||!(a.inv.smoke>0)||a.bAct||G.st!=='fight'||a.throwT>0||a.reloadT>0||G.t<(B.smkF||0))return;const c=a.c;
    if(G.mode==='bomb'&&this.bombThink(a))return;
    // hurt in a gunfight: smoke the gap, then back off out of sight
    const t=B.tg;if(t&&t.alive&&a.hp<50&&!(B.smkR>G.t)){B.smkR=G.t+5;const d=dist3(t.c,c);if(d<12||d>30||Math.random()>.5)return;
      const f=Math.min(.45,5/d),n=navSnap(lerp(c.x,t.c.x,f),lerp(c.y,t.c.y,f),lerp(c.z,t.c.z,f),2.5);if(!n||this.smoked(n.x,n.y,n.z))return;
      this.plan(a,n.x,n.y,n.z,true,b=>{const B2=b.bot,tx=t.c.x,tz=t.c.z;let best=null,bs=-1e9;for(let i=0;i<10;i++){const m=navAround(b.c.x,b.c.z,7,16);if(!m||Math.abs(m.y-b.c.y)>2.5)continue;const s=Math.hypot(m.x-tx,m.z-tz)-Math.hypot(m.x-b.c.x,m.z-b.c.z)*.35;if(s>bs){bs=s;best=m}}
        if(best){B2.rg={x:best.x,y:best.y,z:best.z};B2.rgT=G.t+6;B2.retT=G.t+4;B2.lkp=null}})}},
  bombThink(a){const b=BOMB.b,D=BOMB.D(),B=a.bot,c=a.c;if(!D)return false;if(BOMB.smkR!==G.round){BOMB.smkR=G.round;BOMB.smkN={};BOMB.smkT=0}
    if(BOMB.isAtt(a)){// on the way in (past the waypoint, the site still ahead): the defenders' side of it, two at most a round
      if(b.st!=='carried'&&b.st!=='dropped'||!a.bmWayOk||B.tg)return false;const k=BOMB.site,S=D[k];if(!S)return false;const d=Math.hypot(S.x-c.x,S.z-c.z);if(d<S.r+2||d>32||(BOMB.smkN[k]|0)>=2)return false;
      for(const p of this.spots(k)){const y=p[2]||0;if(this.smoked(p[0],y,p[1]))continue;if(this.plan(a,p[0],y,p[1])){BOMB.smkN[k]=(BOMB.smkN[k]|0)+1;return true}}return false}
    // defenders: the bomb is down — smoke it first, then go and defuse inside the cloud
    if(b.st==='planted'){const d=Math.hypot(b.x-c.x,b.z-c.z);if(d<6||d>26||G.t<BOMB.smkT||this.smoked(b.x,b.y,b.z))return false;if(this.plan(a,b.x,b.y,b.z)){BOMB.smkT=G.t+10;return true}}
    return false},
};
Object.assign(CLIH,{smk(L,m){const p=m.p;if(!Array.isArray(p)||NET.host)return;SMK.fromHost(m.o,p[0]/100,p[1]/100,p[2]/100)}});

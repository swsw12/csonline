'use strict';
// ============ Procedural textures: every surface is painted here at boot (tileable, nearest-filtered) ============
const TEX={};
function hexA(c){const h=hexRGB(c);return h}
// painter over an RGBA buffer; all noise is periodic in the texture size so tiles repeat seamlessly
function paint(w,h,fn){const [c,x]=mkCanvas(w,h);const id=x.createImageData(w,h);const D=id.data;
  const P={w,h,D,
    set(px,py,col,a){px=((px%w)+w)%w;py=((py%h)+h)%h;const i=(py*w+px)*4;const [r,g,b]=typeof col==='string'?rgbOf(col):col;if(a==null||a>=1){D[i]=r;D[i+1]=g;D[i+2]=b;D[i+3]=P.ga}else{D[i]=lerp(D[i],r,a);D[i+1]=lerp(D[i+1],g,a);D[i+2]=lerp(D[i+2],b,a);if(a>.35||D[i+3]<200)D[i+3]=P.ga}},
    ga:255,// alpha written with colour: character atlases keep a gloss level here (240..254 = sheen, 255 = matte)
    get(px,py){px=((px%w)+w)%w;py=((py%h)+h)%h;const i=(py*w+px)*4;return [D[i],D[i+1],D[i+2]]},
    mul(px,py,f){px=((px%w)+w)%w;py=((py%h)+h)%h;const i=(py*w+px)*4;D[i]=clamp(D[i]*f,0,255);D[i+1]=clamp(D[i+1]*f,0,255);D[i+2]=clamp(D[i+2]*f,0,255)},
    alpha(px,py,a){px=((px%w)+w)%w;py=((py%h)+h)%h;D[(py*w+px)*4+3]=a},
    rect(x0,y0,ww,hh,col,a){for(let y=0;y<hh;y++)for(let x2=0;x2<ww;x2++)P.set(x0+x2,y0+y,col,a)},
    n(px,py,cell,seed,oct){return fbm(px/cell,py/cell,seed,oct||3,w/cell)},// periodic fbm
    ramp(cols,t){return cols[clamp(Math.floor(t*cols.length),0,cols.length-1)]},
    ctx:x,canvas:c};
  fn(P);x.putImageData(id,0,0);if(P.post)P.post(x);return c}
function mkTex(canvas,repeat){const t=new THREE.CanvasTexture(canvas);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.generateMipmaps=true;
  if(repeat!==false){t.wrapS=t.wrapT=THREE.RepeatWrapping}t.anisotropy=1;return t}
// dither a value field into a palette
function dith(P,x,y,t,cols,amt){return P.ramp(cols,t+(bayer(x,y)-.5)*(amt==null?.12:amt))}
const PAL={
  conc:['#3c3c38','#46463f','#504f48','#5b5a52','#66655c','#706f66','#7b7a70'],
  concf:['#3a3935','#44433e','#4f4e48','#5a5952','#65645c','#6f6e66'],
  asph:['#1c1d1f','#232426','#2a2b2c','#313231','#383936','#41423e'],
  dirt:['#2a241c','#332b21','#3d3427','#473d2e','#524636','#5d503e'],
  rust:['#3a1a0e','#5a2a14','#7a3a1a','#9a4e24','#b8652e'],
  plaster:['#5d6258','#686d62','#73786c','#7e8376','#898e80'],
};
// world surfaces are painted at 256 px per 2 m tile (128 px/m); K scales the old 128-px designs
const TN=256,TK=TN/128;
function rpickH(i,a){return a[Math.floor(hash2(i,77,3)*a.length)]}
// soft darkening blob with a ragged edge
function stain(P,cx,cy,rx,ry,f,seed){for(let y=-ry-2;y<=ry+2;y++)for(let x=-rx-2;x<=rx+2;x++){const d=Math.hypot(x/rx,y/ry)+(P.n(cx+x,cy+y,8,seed,2)-.5)*.6;if(d<1)P.mul(Math.round(cx+x),Math.round(cy+y),1-f*(1-d*d))}}
// hairline crack as a wandering walk, dark line with a light lip
function crack(P,x,y,len,seed,dark,lip){let dx=hash2(seed,1,9)<.5?1:-1;for(let k=0;k<len;k++){P.set(x,y,dark);if(lip)P.set(x+1,y,lip,.5);const r=hash2(k,seed,13);if(r<.55)y++;else if(r<.8)x+=dx;else x-=dx;if(hash2(k,seed,17)<.03)crack(P,x,y,Math.floor(len*.3),seed+k+1,dark,lip)}}
// vertical run-off streak that fades downwards
function streak(P,x,y0,len,f,w){w=w||1;for(let k=0;k<len;k++){const a=f*(1-k/len);for(let i=0;i<w;i++)P.mul(x+i+Math.round(Math.sin(k*.11+x)*.8),y0+k,1-a)}}
// small pits: dark dot with a light lower lip (reads as a hole under top light)
function pits(P,n,seed,dark,lip){const N=P.w;for(let i=0;i<n;i++){const x=Math.floor(hash2(i,1,seed)*N),y=Math.floor(hash2(i,2,seed)*P.h);P.set(x,y,dark);if(hash2(i,3,seed)<.4){P.set(x+1,y,dark);P.set(x,y+1,lip,.6);P.set(x+1,y+1,lip,.4)}else P.set(x,y+1,lip,.5)}}
function texConcrete(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40*K,11,4)*1.1-.05+(P.n(x,y,6*K,12,2)-.5)*.18+(P.n(x,y,4,13,1)-.5)*.07+(hash2(x,y,3)-.5)*.08;if(hash2(x,y,4)<.02)t-=.18;P.set(x,y,dith(P,x,y,t,PAL.conc,.1))}
  // form-work panels: two per tile, with bevelled joints
  for(let x=0;x<N;x++){P.set(x,N/2-2,'#262622');P.set(x,N/2-1,'#2e2e2a');P.set(x,N/2,'#84837a');P.set(x,0,'#86857b');P.set(x,N-1,'#30302c');P.set(x,N-2,'#3a3a35',.6)}
  for(let y=0;y<N;y++)for(const sx of [0,N/2]){P.set(sx,y,'#32322d');P.set(sx+1,y,'#2a2a26');P.set(sx+2,y,'#7c7b71')}
  // tie holes with rust tears
  for(const py of [N*.17,N*.42,N*.67,N*.92])for(const px of [N*.13,N*.37,N*.63,N*.87]){const x=Math.round(px),y=Math.round(py);
    for(let j=-5;j<=5;j++)for(let i=-5;i<=5;i++){const r=Math.hypot(i,j);if(r<2.6)P.set(x+i,y+j,r<1.6?'#0e0e0d':'#1a1a18');else if(r<4.2)P.set(x+i,y+j,j<0?'#2a2a26':'#8e8d82',r<3.4?1:.45)}
    if(hash2(x,y,6)<.55)streak(P,x-1,y+5,16+Math.floor(hash2(x,y,7)*50),.16,2)}
  // run-off from the joints, pits and chips
  for(let i=0;i<46;i++){const x=Math.floor(hash2(i,1,5)*N),y0=hash2(i,4,5)<.5?N/2+1:1+Math.floor(hash2(i,2,5)*N),l=20+Math.floor(hash2(i,3,5)*100);streak(P,x,y0,l,.1+hash2(i,6,5)*.12,1+(i%3===0?1:0))}
  pits(P,260,6,'#1e1e1b','#8a897e');
  for(let i=0;i<5;i++)stain(P,hash2(i,7,5)*N,hash2(i,8,5)*N,12+hash2(i,9,5)*20,8+hash2(i,10,5)*16,.16,31+i);
  for(let i=0;i<4;i++)crack(P,Math.floor(hash2(i,9,7)*N),Math.floor(hash2(i,8,7)*N),60+Math.floor(hash2(i,7,7)*60),i+40,'#262622','#8a897e')})}
function texConcFloor(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,48*K,13,4)*1.1-.05+(P.n(x,y,8*K,14,2)-.5)*.14+(P.n(x,y,4,15,1)-.5)*.06+(hash2(x,y,4)-.5)*.09;P.set(x,y,dith(P,x,y,t,PAL.concf,.1))}
  // saw-cut joints every metre
  for(let k=0;k<N;k++)for(const j of [0,N/2]){P.set(k,j,'#222220');P.set(k,j+1,'#2a2a26');P.set(k,j+2,'#6e6d65');P.set(j,k,'#222220');P.set(j+1,k,'#2a2a26');P.set(j+2,k,'#6e6d65')}
  // oil stains, tyre scuffs, chips, scratches
  for(let i=0;i<4;i++)stain(P,hash2(i,4,8)*N,hash2(i,5,8)*N,10+hash2(i,6,8)*24,8+hash2(i,7,8)*18,.32,51+i);
  for(let i=0;i<2;i++){const y0=hash2(i,8,8)*N,x0=hash2(i,9,8)*N;for(let k=0;k<140;k++){const x=x0+k,y=y0+Math.sin(k*.025+i)*12;for(let w=0;w<6;w++)P.mul(Math.round(x),Math.round(y)+w,w===0||w===5?.95:.9)}}
  pits(P,240,9,'#2a2a26','#7e7d73');
  for(let i=0;i<40;i++){const x0=hash2(i,1,10)*N,y0=hash2(i,2,10)*N,a=hash2(i,3,10)*TAU,l=6+hash2(i,4,10)*22;for(let k=0;k<l;k++)P.mul(Math.round(x0+Math.cos(a)*k),Math.round(y0+Math.sin(a)*k),1.1)}
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,1,19)*N),Math.floor(hash2(i,2,19)*N),80,i+60,'#22221f','#77766c')})}
function texAsphalt(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,32*K,21,3)*1.05-.03+(P.n(x,y,4,22,1)-.5)*.12+(hash2(x,y,5)-.5)*.3;P.set(x,y,dith(P,x,y,t,PAL.asph,.18))}
  // aggregate stones with a little shadow, two sizes
  for(let i=0;i<1500;i++){const x=Math.floor(hash2(i,1,11)*N),y=Math.floor(hash2(i,2,11)*N);const c=rpickH(i,['#55564f','#4a4b45','#61625a','#3e3f3a','#6a6b62']);P.set(x,y,c);const big=hash2(i,3,11);
    if(big<.3){P.set(x+1,y,c);P.set(x,y+1,dk(c,.2));P.set(x+1,y+1,'#121314');P.set(x-1,y,lt(c,.1),.5)}else if(big<.5)P.set(x,y+1,'#121314')}
  // sealed crack lines (tar) and a patch
  for(let i=0;i<3;i++){let x=Math.floor(hash2(i,1,13)*N),y=0;for(let k=0;k<N;k++){P.set(x,y,'#0a0b0c');P.set(x+1,y,'#0e0f10');P.set(x+2,y,'#141517',.6);if(hash2(k,i,3)<.25)P.set(x-1,y,'#16171a');y++;if(hash2(k,2+i,3)<.4)x+=hash2(k,3+i,3)<.5?1:-1}}
  {const x0=Math.floor(N*.55),y0=Math.floor(N*.2),w=Math.floor(N*.3),h=Math.floor(N*.22);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=x<2||y<2||x>=w-2||y>=h-2;P.set(x0+x,y0+y,e?'#101112':(hash2(x,y,21)<.5?'#1e1f21':'#242527'))}}
  for(let i=0;i<4;i++)stain(P,hash2(i,4,23)*N,hash2(i,5,23)*N,16+hash2(i,6,23)*20,12+hash2(i,7,23)*12,.25,71+i);
  // shallow puddles catching the sky
  for(let i=0;i<2;i++){const cx=hash2(i,8,23)*N,cy=hash2(i,9,23)*N,rx=14+hash2(i,10,23)*16,ry=8+hash2(i,11,23)*8;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=Math.hypot(x/rx,y/ry)+(P.n(cx+x,cy+y,8,91+i,2)-.5)*.5;if(d<1){const X=Math.round(cx+x),Y=Math.round(cy+y);P.set(X,Y,d>.85?'#16181c':(hash2(X,Y,5)<.05?'#3a4656':'#1c2028'))}}}})}
function texDirt(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,32*K,31,4)*1.2-.12+(P.n(x,y,5*K,32,2)-.5)*.25+(P.n(x,y,4,33,1)-.5)*.1+(hash2(x,y,6)-.5)*.2;P.set(x,y,dith(P,x,y,t,PAL.dirt,.16))}
  // wet ruts
  for(let i=0;i<2;i++){const x0=Math.floor(hash2(i,1,15)*N);for(let y=0;y<N;y++){const x=x0+Math.round(Math.sin(y*.025+i*2)*8);for(let w=0;w<18;w++){const f=Math.sin(w/17*Math.PI);P.mul(x+w,y,1-f*.22)}}}
  // puddles
  for(let i=0;i<3;i++){const cx=hash2(i,4,16)*N,cy=hash2(i,5,16)*N,rx=12+hash2(i,6,16)*20,ry=8+hash2(i,7,16)*12;
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=Math.hypot(x/rx,y/ry)+(P.n(cx+x,cy+y,10,81+i,2)-.5)*.5;if(d<1){const X=Math.round(cx+x),Y=Math.round(cy+y);P.set(X,Y,d<.75?(hash2(X,Y,3)<.06?'#3a4048':'#1c1a17'):d<.88?'#221d16':'#2a231a')}}}
  // pebbles with shadow, grass tufts
  for(let i=0;i<180;i++){const x=Math.floor(hash2(i,1,17)*N),y=Math.floor(hash2(i,2,17)*N);const c=rpickH(i,['#6e675a','#5f584c','#7a7262','#847b6a']);const s=hash2(i,3,17)<.35?2:1;
    for(let a=0;a<s;a++)for(let b=0;b<s;b++)P.set(x+a,y+b,b===0&&a===0&&s>1?lt(c,.12):c);P.set(x,y+s,'#17110b');P.set(x+s,y+s,'#1d150d')}
  for(let i=0;i<26;i++){const x=Math.floor(hash2(i,4,19)*N),y=Math.floor(hash2(i,5,19)*N);for(let b=0;b<9;b++){const bx=x+b-4,h=4+Math.floor(hash2(i,b,19)*9);for(let k=0;k<h;k++)P.set(bx+Math.round((b-4)*k*.12),y-k,['#202818','#27301c','#33402a','#465a34','#56693e','#647a48','#728a52'][Math.min(6,Math.floor(k*7/h))])}}})}
function texBrick(){const N=TN,K=TK;return paint(N,N,P=>{
  const BW=16*K,BH=7*K;// 25 cm x 11 cm courses incl. mortar
  const rows=Math.round(N/BH);const bh=N/rows;
  for(let y=0;y<N;y++){const row=Math.floor(y/bh),ly=y-row*bh;const off=row%2?BW/2:0;
    for(let x=0;x<N;x++){const lx=(x+off)%BW,bi=Math.floor((x+off)/BW)+row*13;const mortar=ly>=bh-2.4||lx>=BW-2;
      const bc=['#6e3424','#7a3d2a','#5e2c1f','#733a28','#663020','#80432e','#6a3224','#5a2a1c'][Math.floor(hash2(bi,row,3)*8)];
      let c;if(mortar){c=ly>=bh-1.2&&lx<BW-2?'#2c2824':hash2(x,y,4)<.3?'#4a4540':'#3a3530'}else{const t=P.n(x,y,8,bi,2);c=ly<1?lt(bc,.16):ly<2?lt(bc,.07):ly>bh-4.4?dk(bc,.24):bc;if(t>.62)c=dk(c,.12);else if(t<.32)c=lt(c,.06);
        if(lx<1)c=lt(c,.06);if(lx>=BW-3)c=dk(c,.15);
        if(hash2(x,y,bi)<.05)c=dk(c,.22);if(hash2(x,y,bi+7)<.015)c='#2a1a14';if((lx<2||lx>BW-5)&&ly<4&&hash2(bi,row,9)<.3)c='#3a3530'}// chipped corners
      P.set(x,y,c)}}
  // soot and efflorescence
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,80,41,3);if(n>.6)P.mul(x,y,1-(n-.6)*.7);const w=P.n(x,y,40,42,2);if(w>.7&&hash2(x,y,43)<.5)P.set(x,y,'#9a948a',.35)}
  for(let i=0;i<18;i++){const x=Math.floor(hash2(i,1,44)*N),y0=Math.floor(hash2(i,2,44)*N);streak(P,x,y0,16+Math.floor(hash2(i,3,44)*44),.18,1+(i%2))}})}
function texMetal(base){const N=TN,K=TK;return paint(N,N,P=>{
  const cols=[dk(base,.5),dk(base,.32),dk(base,.17),base,lt(base,.1),lt(base,.22)];
  // corrugated profile every 32 px (25 cm)
  const PR=16*K;const prof=r=>{const k=r/PR;return k<.12?.05:k<.25?.35:k<.5?.92:k<.62?.75:k<.75?.45:.22};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=prof(x%PR)*.82+P.n(x,y,48*K,51,3)*.24-.06+(P.n(x,y,4,52,1)-.5)*.05+(hash2(x,y,7)-.5)*.05;P.set(x,y,dith(P,x,y,t,cols,.12))}
  // screw rows with rust bleeding from each screw
  for(const ry of [12,140])for(let x=8;x<N;x+=PR){P.set(x,ry,'#d8d8cc');P.set(x+1,ry,'#b8b8ac');P.set(x,ry+1,'#9a9a90');P.set(x+1,ry+1,'#6a6a62');P.set(x,ry+2,'#2a2a26');P.set(x+1,ry+2,'#2a2a26');if(hash2(x,ry,3)<.6)streak(P,x,ry+3,16+Math.floor(hash2(x,ry,4)*60),.25,2)}
  for(let i=0;i<24;i++){const x=Math.floor(hash2(i,1,23)*N),y0=Math.floor(hash2(i,2,23)*N),l=20+Math.floor(hash2(i,3,23)*140);
    for(let k=0;k<l;k++){const c=k<l*.25?'#a85a2a':k<l*.6?'#7a3a1a':'#5a2a14';P.set(x+Math.round(Math.sin(k*.15+i)*.9),y0+k,c,.5-k/l*.42);if(i%3===0)P.set(x+1,y0+k,c,.3-k/l*.25)}}
  // dents and scratches
  for(let i=0;i<4;i++)stain(P,hash2(i,4,24)*N,hash2(i,5,24)*N,6+hash2(i,6,24)*8,4+hash2(i,7,24)*6,.2,91+i);
  for(let i=0;i<14;i++){const x0=hash2(i,1,25)*N,y0=hash2(i,2,25)*N;for(let k=0;k<26;k++)P.set(Math.round(x0+k),Math.round(y0+k*.3),'#9aa0a4',.3)}})}
function texPlate(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.45+P.n(x,y,48*K,61,3)*.32+(P.n(x,y,4,62,1)-.5)*.06+(hash2(x,y,8)-.5)*.1;P.set(x,y,dith(P,x,y,t,['#2c2f31','#363a3d','#41454a','#4d5257','#5a5f64','#666c70'],.12))}
  // raised diamond tread: alternating diagonal lugs
  const S=12*K;for(let cy=0;cy<N;cy+=S)for(let cx=0;cx<N;cx+=S){const o=(cy/S)%2?S/2:0;const x=cx+o,y=cy+6;const d=((cx/S+cy/S)%2)?1:-1;
    for(let k=0;k<11;k++){const px=x+k,py=y+Math.round((d>0?k:10-k)*.9);P.set(px,py,'#9aa0a4');P.set(px,py+1,'#7a8084');P.set(px+1,py+1,'#22262a');P.set(px,py+2,'#5e6468');P.set(px+1,py+2,'#2a2e32')}}
  for(let i=0;i<5;i++)stain(P,hash2(i,4,62)*N,hash2(i,5,62)*N,12+hash2(i,6,62)*20,10+hash2(i,7,62)*16,.25,101+i);
  for(let i=0;i<10;i++){const x0=hash2(i,1,63)*N,y0=hash2(i,2,63)*N;for(let k=0;k<40;k++)P.set(Math.round(x0+k*1.3),Math.round(y0+k*.4),'#8a9094',.35)}})}
function texTile(){const N=TN,K=TK;return paint(N,N,P=>{const TS=32*K;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=Math.floor(x/TS),ty=Math.floor(y/TS);const gx=x%TS,gy=y%TS;const grout=gx<2||gy<2;
    const base=(tx+ty)%2?'#6d6a5c':'#5c5a4e';let c=grout?(gx===0||gy===0?'#24231e':'#2e2d27'):base;
    if(!grout){const n=P.n(x,y,24,71+tx*3+ty,3),v=P.n(x,y,80,75,2);c=mix(c,n>.55?'#7e7b6a':'#4a483e',Math.abs(n-.5)*.7);if(v>.62)c=dk(c,.08);if(hash2(x,y,9)<.03)c=dk(c,.2);if(gx<4||gy<4)c=lt(c,.07);if(gx>TS-3||gy>TS-3)c=dk(c,.08)}
    P.set(x,y,c)}
  // worn walking path, scuffs and a cracked tile
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=Math.sin((x+y*.3)/N*TAU)*.5+.5;if(w>.75)P.mul(x,y,.95)}
  for(let i=0;i<16;i++){const x0=hash2(i,1,72)*N,y0=hash2(i,2,72)*N,l=8+hash2(i,3,72)*20;for(let k=0;k<l;k++)P.set(Math.round(x0+k),Math.round(y0+k*.2),'#2a2924',.45)}
  crack(P,Math.floor(TS*1.3),Math.floor(TS*2.1),70,141,'#22211c','#8a8776');
  for(let i=0;i<3;i++)stain(P,hash2(i,4,29)*N,hash2(i,5,29)*N,14+hash2(i,6,29)*16,10+hash2(i,7,29)*12,.18,111+i)})}
function texPlaster(){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,48*K,81,4)*1.05-.03+(P.n(x,y,4*K,82,2)-.5)*.08+(P.n(x,y,3,83,1)-.5)*.05+(hash2(x,y,10)-.5)*.05;P.set(x,y,dith(P,x,y,t,PAL.plaster,.08))}
  for(let i=0;i<8;i++){const x=Math.floor(hash2(i,1,31)*N),y0=Math.floor(hash2(i,2,31)*N*.6);streak(P,x,y0,40+Math.floor(hash2(i,3,31)*80),.1,3)}
  for(let i=0;i<3;i++)stain(P,hash2(i,4,33)*N,hash2(i,5,33)*N,10+hash2(i,6,33)*14,8+hash2(i,7,33)*12,.1,121+i);
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,9,34)*N),Math.floor(hash2(i,8,34)*N),48,i+130,'#4a4e46','#93988a');
  // scuffed skirting zone and a few flaked patches
  for(let i=0;i<20;i++){const x0=hash2(i,1,35)*N,y0=N*.7+hash2(i,2,35)*N*.28;for(let k=0;k<12;k++)P.set(Math.round(x0+k),Math.round(y0+k*.3),'#4a4e46',.4)}
  for(let i=0;i<4;i++){const cx=hash2(i,3,36)*N,cy=hash2(i,4,36)*N;for(let y=-5;y<=5;y++)for(let x=-8;x<=8;x++){const d=Math.hypot(x/8,y/5)+(P.n(cx+x,cy+y,6,161+i,2)-.5)*.6;if(d<1)P.set(Math.round(cx+x),Math.round(cy+y),d>.8?'#4e5248':'#62665a')}}})}
function texWood(){const N=TN,K=TK;return paint(N,N,P=>{const base='#7a5c37';const PL=N/4;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const plank=Math.floor(y/PL),ly=y%PL;const g=Math.sin((x*.55+plank*26)*.125+P.n(x,y,48,91+plank,3)*7)*.5+.5;
    let c=mix(dk(base,.12+plank%2*.07),lt(base,.1),g*.65);if(ly<2)c=lt(c,.22);else if(ly<3)c=lt(c,.08);if(ly>=PL-4)c=dk(c,ly>=PL-2?.5:.3);if(hash2(x,y,11)<.04)c=dk(c,.2);
    if(hash2(Math.floor(x/18),y,plank+5)<.012)c=dk(c,.35);P.set(x,y,c)}
  // knots
  for(let i=0;i<6;i++){const cx=hash2(i,1,93)*N,cy=hash2(i,2,93)*N;for(let y=-6;y<=6;y++)for(let x=-8;x<=8;x++){const d=Math.hypot(x/8,y/6);if(d<1)P.set(Math.round(cx+x),Math.round(cy+y),d<.35?'#2e1e10':d<.6?'#3a2614':'#5a3e22',d<.6?1:.5)}}
  // X brace and frame
  for(let k=0;k<N;k++){for(const [x,y] of [[k,k],[k,N-1-k]]){if(x>12&&x<N-13){for(let w=-5;w<=5;w++)P.set(x+w,y,w<=-4?'#a07a4a':w>=4?'#3a2814':(Math.abs(w)<1?'#74563a':'#6e5030'))}}}
  for(let y=0;y<N;y++)for(let x=0;x<8;x++){P.set(x,y,x<3?'#3a2a18':x===3?'#7a5a38':'#5d4429');P.set(N-1-x,y,x<3?'#2a1e10':'#5d4429')}
  for(let x=0;x<N;x++)for(let y=0;y<4;y++){P.set(x,y,y<2?'#3a2a18':'#5d4429');P.set(x,N-1-y,y<2?'#2a1e10':'#4d3822')}
  // nails
  for(const [x,y] of [[10,10],[N-12,10],[10,N-12],[N-12,N-12],[10,N/2],[N-12,N/2],[N/2,10],[N/2,N-12]]){P.set(x,y,'#d8dcde');P.set(x+1,y,'#a8acae');P.set(x,y+1,'#6a6e70');P.set(x+1,y+1,'#3a3e40');P.set(x+2,y+1,'#2a1e10',.5);streak(P,x,y+2,6+Math.floor(hash2(x,y,3)*14),.2)}
  // stencil mark
  P.post=ctx=>{ctx.fillStyle='rgba(30,22,14,.55)';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('Q-7',N/2,N/2-8);ctx.font='bold 13px sans-serif';ctx.fillText('THIS SIDE UP',N/2,N/2+12)}})}
// containers get one painted side per box face (512 px across 6 m), so the markings appear once
function texContainer(base,label){const W=512,N=256;return paint(W,N,P=>{
  const cols=[dk(base,.55),dk(base,.36),dk(base,.2),base,lt(base,.1),lt(base,.22)];
  // trapezoidal corrugation, 24 px period (28 cm)
  for(let y=0;y<N;y++)for(let x=0;x<W;x++){const r=(x%24)/2;const s=r<2?.1:r<3?.55:r<7?.92:r<8?.6:r<10?.38:.25;let t=s*.75+P.n(x,y,96,101,3)*.3-.05+(P.n(x,y,4,102,1)-.5)*.05+(hash2(x,y,13)-.5)*.05;P.set(x,y,dith(P,x,y,t,cols,.12))}
  // corner posts and top/bottom rails
  for(let y=0;y<N;y++)for(let x=0;x<10;x++){const c=x<2?dk(base,.7):x<4?lt(base,.2):dk(base,.3);P.set(x,y,c);P.set(W-1-x,y,x<2?dk(base,.7):dk(base,.25))}
  for(let x=0;x<W;x++){for(let y=0;y<10;y++)P.set(x,y,y<2?dk(base,.7):y<4?lt(base,.25):dk(base,.25));for(let y=N-12;y<N;y++)P.set(x,y,y<N-10?lt(base,.15):dk(base,.55+(y-N+12)*.02))}
  // rust: drips from the top rail, patches at the bottom, scrapes showing primer
  for(let i=0;i<50;i++){const x=Math.floor(hash2(i,1,37)*W),y0=10,l=16+Math.floor(hash2(i,3,37)*100);for(let k=0;k<l;k++){P.set(x,y0+k,k<l*.4?'#a85a2a':'#6a3218',.55-k/l*.45);if(i%2)P.set(x+1,y0+k,'#6a3218',.3-k/l*.25)}}
  for(let i=0;i<9;i++){const cx=hash2(i,4,38)*W,cy=N-16-hash2(i,5,38)*16;for(let y=-12;y<=12;y++)for(let x=-20;x<=20;x++){const d=Math.hypot(x/20,y/12)+(P.n(cx+x,cy+y,8,141+i,2)-.5)*.6;if(d<1)P.set(Math.round(cx+x),Math.round(cy+y),d<.5?'#5a2a14':'#8a4a22',.7)}}
  for(let i=0;i<12;i++){const x0=hash2(i,1,39)*W,y0=40+hash2(i,2,39)*160;for(let k=0;k<28;k++){P.set(Math.round(x0+k),Math.round(y0+k*.15),'#9a9488',.6);P.set(Math.round(x0+k),Math.round(y0+k*.15)+1,'#5a564e',.3)}}
  P.post=x=>{if(!label)return;x.fillStyle='rgba(225,222,205,.72)';x.font='bold 30px sans-serif';x.fillText(label,30,62);x.fillRect(30,72,96,4);x.font='bold 15px sans-serif';x.fillText('MAX GR 30480 KG',30,98);x.fillText('TARE   3750 KG',30,116);
    x.font='bold 22px sans-serif';x.fillText(label.split(/[ -]/)[0],W-110,62);
    const id=x.getImageData(0,0,W,N);for(let i=0;i<id.data.length;i+=4){const px=(i/4)%W,py=Math.floor(i/4/W);if(hash2(px,py,19)<.12){id.data[i]*=.7;id.data[i+1]*=.7;id.data[i+2]*=.7}}x.putImageData(id,0,0)}})}
function texHazard(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=Math.floor((x+y)/32)%2;let c=s?'#d8a41e':'#1c1c1a';const n=P.n(x,y,20,12,2);if(n>.62)c=s?'#9a7a2a':'#2e2c26';if(hash2(x,y,13)>.97)c='#6a6a60';if(hash2(x,y,12)<.08)c=dk(c,.25);if((x+y)%32===0)c=dk(c,.3);P.set(x,y,c)}
  for(let i=0;i<16;i++){const x0=hash2(i,1,14)*N,y0=hash2(i,2,14)*N;for(let k=0;k<14;k++)P.set(Math.round(x0+k),Math.round(y0+k*.2),'#8a8678',.7)}})}
function texRoof(){const N=TN,K=TK;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,32*K,111,3)+(P.n(x,y,4,112,1)-.5)*.1+(hash2(x,y,14)-.5)*.34;P.set(x,y,dith(P,x,y,t,['#1e1f1e','#262725','#2e2f2c','#373834','#40413c'],.25))}
  for(let k=0;k<N;k++)for(const j of [0,N/2]){P.set(k,j,'#151615');P.set(k,j+1,'#1a1b1a');P.set(k,j+2,'#454640')}
  for(let i=0;i<900;i++)P.set(Math.floor(hash2(i,1,15)*N),Math.floor(hash2(i,2,15)*N),rpickH(i,['#55564f','#4a4b45','#61625a']));
  for(let i=0;i<5;i++)stain(P,hash2(i,4,16)*N,hash2(i,5,16)*N,16+hash2(i,6,16)*28,12+hash2(i,7,16)*20,.25,151+i)})}
function texDoor(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c='#4a5258';if(x<5||x>122||y<5)c='#2a2e31';else if(x<7||y<7)c='#6a747a';else if(y>116&&y<124)c=y===117?'#22262a':'#2a2e31';
    const n=P.n(x,y,32,15,3);if(n>.65)c=dk(c,.12);if(hash2(x,y,15)<.05)c=dk(c,.2);if(y>200&&y<248&&x>12&&x<116)c=y<203?'#9aa4aa':((x+y)%6<2?'#4e565c':'#5a6268');P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,16)*128),8+Math.floor(hash2(i,2,16)*100),20+Math.floor(hash2(i,3,16)*60),.15,2);
  for(let y=118;y<136;y++){P.set(100,y,'#d8dcd8');P.set(101,y,'#c8ccc8');P.set(102,y,'#9a9e9a');P.set(103,y,'#5a5e5a')}for(let y=120;y<126;y++)for(let x=92;x<100;x++)P.set(x,y,'#b8bcb8');
  for(let i=0;i<10;i++){P.set(20+i*8,80,'#2a2e31');P.set(21+i*8,80,'#2a2e31')}
  for(const [x,y] of [[10,12],[116,12],[10,240],[116,240]]){P.set(x,y,'#9aa0a4');P.set(x+1,y+1,'#2a2e31')}})}
function texWindow(lit){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const fr=x<8||x>119||y<8||y>119||(x>=61&&x<=66);let c;
    if(fr)c=(x<3||y<3)?'#5a5d5a':(x<6||y<6)?'#4a4d4a':'#3a3d3a';
    else if(lit){c=y%12<4?'#8a6230':(y<52?'#d8b060':'#b88a42');if(hash2(x,y,16)<.05)c='#f0d088';if(x>80&&x<104&&y>60&&y<108&&y%12>=4)c='#5a3a20';if(y%12===4)c='#c89848'}
    else{const r=(x+y)%46<5||(x*2+y)%62<3;c=y<36?'#26323a':'#121820';if(r)c='#3a4c58';if(hash2(x,y,17)<.03)c='#4a5a64'}
    P.set(x,y,c)}
  for(let i=0;i<6;i++)streak(P,10+Math.floor(hash2(i,1,18)*108),10,20+Math.floor(hash2(i,2,18)*40),.12)})}
function texLight(col){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){const e=x<2||x>29||y<2||y>29;const r=Math.hypot((x-15.5)/14,(y-15.5)/14);P.set(x,y,e?dk(col,.6):mix(lt(col,.55),col,clamp(r,0,1)))}})}
function texSign(lines,bg,fg,w,h){w=(w||128)*2;h=(h||32)*2;return paint(w,h,P=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=bg;if(x<4||y<4||x>=w-4||y>=h-4)c=dk(bg,.5);if(hash2(x,y,17)<.05)c=dk(c,.2);const n=P.n(x,y,16,18,2);if(n>.66)c=dk(c,.1);P.set(x,y,c)}
  for(const [x,y] of [[8,8],[w-10,8],[8,h-10],[w-10,h-10]]){P.set(x,y,'#c8ccc8');P.set(x+1,y+1,'#3a3e3a')}
  P.post=ctx=>{ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';const n=lines.length;lines.forEach((l,i)=>{ctx.font=`bold ${(l.s?l.s*2:Math.floor(h/(n+.6)))}px sans-serif`;ctx.fillText(l.t||l,w/2,h*(i+.5+.15)/(n+.3))});
    // weathering over the paint
    const id=ctx.getImageData(0,0,w,h);for(let i=0;i<id.data.length;i+=4){const px=(i/4)%w,py=Math.floor(i/4/w);if(hash2(px,py,18)<.06){id.data[i]*=.6;id.data[i+1]*=.6;id.data[i+2]*=.6}}ctx.putImageData(id,0,0)}})}
function texSky(){return paint(1024,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/255;let c=mix('#05060c','#1c1f2e',Math.pow(t,1.5));const n=fbm(x/128,y/36,121,5,1024/128);if(n>.5)c=mix(c,'#262838',clamp((n-.5)*2.6,0,.85));
    if(t>.8)c=mix(c,'#2a2a34',(t-.8)*2.2);P.set(x,y,c)}})}
function texMoon(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const dx=(x-63.5)/60,dy=(y-63.5)/60,r=Math.hypot(dx,dy);
    if(r<1){const n=fbm(x/20,y/20,131,4,0);let c=mix('#c8ccd8','#8a8fa0',clamp((n-.35)*1.8,0,1));c=mix(c,'#5e6272',clamp((r-.75)*2.5,0,.6)*(dx>0?1:.4));P.set(x,y,c)}
    else{P.D[(y*128+x)*4+3]=0}}})}
// ---------- props ----------
function texSandbag(){const N=128;return paint(N,N,P=>{const BW=64,BH=32;
  for(let y=0;y<N;y++){const row=Math.floor(y/BH),ly=y-row*BH;const off=row%2?BW/2:0;
    for(let x=0;x<N;x++){const lx=(x+off)%BW,bi=Math.floor((x+off)/BW)+row*7;const u=(lx+.5)/BW*2-1,v=(ly+.5)/BH*2-1;
      const r=Math.pow(Math.abs(u),3)+Math.pow(Math.abs(v),2.2);if(r>1){P.set(x,y,r>1.15?'#0c0a07':'#17130d');continue}
      const tint=hash2(bi%4,row%4,251);const cols=tint<.33?['#2a2418','#3a3222','#4a402c','#5a4e36','#6a5c40','#78684a']:tint<.66?['#28241a','#38322a','#484032','#585040','#685e4a','#766c56']:['#2a2216','#3c3020','#4e402a','#605034','#70603e','#7e6e48'];
      let t=.64+v*.24-r*.34+(((x+y)&1)?.03:-.03)+(P.n(x,y,16,201+bi%4,2)-.5)*.2+(hash2(x,y,7)-.5)*.06;
      let c=dith(P,x,y,t,cols,.08);if(Math.abs(v-.5)<.05&&Math.abs(u)<.8&&lx%4<2)c='#221c12';P.set(x,y,c)}}
  for(let i=0;i<5;i++)stain(P,hash2(i,1,202)*N,hash2(i,2,202)*N,8+hash2(i,3,202)*10,6+hash2(i,4,202)*8,.25,203+i)})}
function texPallet(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sl=Math.floor(x/26),lx=x%26;const gap=lx>=21;
    let c;if(gap)c='#0e0c0a';else{const g=Math.sin(y*.18+P.n(x,y,20,211+sl,2)*6)*.5+.5;c=mix('#5a4428','#8a6a42',g*.7);if(lx<1)c=lt(c,.15);if(lx>18)c=dk(c,.3);if(hash2(x,y,212)<.04)c=dk(c,.2)}P.set(x,y,c)}
  for(let i=0;i<10;i++){const x=Math.floor(hash2(i,1,213)*5)*26+10,y=Math.floor(hash2(i,2,213)*N);P.set(x,y,'#3a3a36');P.set(x+1,y,'#2a2a26')}})}
function texDrum(base){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const rib=y%42;let t=.55+(P.n(x,y,24,221,3)-.5)*.3+(hash2(x,y,222)-.5)*.06;if(rib<3)t+=.25;else if(rib<5)t-=.25;
    let c=dith(P,x,y,t,[dk(base,.5),dk(base,.3),dk(base,.12),base,lt(base,.12),lt(base,.25)],.1);P.set(x,y,c)}
  for(let i=0;i<14;i++){const x=Math.floor(hash2(i,1,223)*128),y0=Math.floor(hash2(i,2,223)*40),l=20+Math.floor(hash2(i,3,223)*80);for(let k=0;k<l;k++)P.set(x,y0+k,k<l*.3?'#a85a2a':'#6a3218',.5-k/l*.4)}
  for(let i=0;i<4;i++)stain(P,hash2(i,4,224)*128,100+hash2(i,5,224)*20,10,6,.3,225+i);
  P.post=x=>{x.fillStyle='rgba(230,226,210,.7)';x.font='bold 16px sans-serif';x.fillText('☣ BIO',40,74)}})}
function texFence(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.alpha(x,y,0);
  // diamond chain link: two diagonal wire families, 16 px mesh
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const a=(x+y)%16,b=(x-y+64)%16;if(a===0||b===0){const hi=(a===0&&b===0);P.set(x,y,hi?'#b8bcc0':(a===0?'#8a9096':'#6a7076'));if(hash2(x,y,231)<.08)P.set(x,y,'#7a4a2a')}}})}
function texBarrier(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,241,3)+(hash2(x,y,242)-.5)*.12;let c=dith(P,x,y,t,['#6a6a62','#76766c','#828276','#8e8e82','#9a9a8c'],.1);
    if(y<26){const s=Math.floor((x+y)/18)%2;c=s?dith(P,x,y,t,['#8a1a14','#a22018','#b82a20'],.1):dith(P,x,y,t,['#b8b4a6','#cac6b6','#d8d4c4'],.1)}if(y===26||y===27)c='#3a3a34';P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,243)*N),28+Math.floor(hash2(i,2,243)*30),20+Math.floor(hash2(i,3,243)*50),.15,2);
  for(let i=0;i<3;i++)stain(P,hash2(i,4,244)*N,110+hash2(i,5,244)*14,14,8,.3,245+i)})}
function texPipe(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let t=.5+(P.n(x,y,16,251,2)-.5)*.3+(hash2(x,y,252)-.5)*.08;if(x%32<2)t-=.3;let c=dith(P,x,y,t,['#2a3a34','#34463e','#3e5248','#4a5e52'],.1);if(hash2(x,y,253)<.05)c='#7a3a1a';P.set(x,y,c)}})}
function texMark(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const n=P.n(x,y,12,261,3);let c='#c8a424';if(n<.4||hash2(x,y,262)<.18){P.alpha(x,y,0);continue}if(n<.46)c='#8a7426';P.set(x,y,c)}})}
function texPoster(kind){const W=128,H=176;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=kind?'#d8d0b4':'#c8c4b0';if(hash2(x,y,271)<.06)c=dk(c,.12);const n=P.n(x,y,24,272+kind,2);if(n>.62)c=mix(c,'#8a7a52',(n-.62)*1.5);P.set(x,y,c)}
  for(let i=0;i<5;i++)streak(P,Math.floor(hash2(i,1,273+kind)*W),Math.floor(hash2(i,2,273+kind)*40),40+Math.floor(hash2(i,3,273+kind)*100),.18,2);
  P.post=x=>{x.textAlign='center';if(kind===0){x.fillStyle='#a82018';x.fillRect(8,10,W-16,34);x.fillStyle='#f0e8d8';x.font='bold 22px sans-serif';x.fillText('경 고',W/2,36);x.fillStyle='#1a1814';x.font='bold 13px sans-serif';
      ['감염 의심자와','접촉하지 마십시오','','증상 발현 시','즉시 신고'].forEach((l,i)=>x.fillText(l,W/2,68+i*18));x.font='bold 10px sans-serif';x.fillText('QUARANTINE ZONE Q-7',W/2,H-14)}
    else{x.fillStyle='#1e3a5a';x.fillRect(8,10,W-16,30);x.fillStyle='#e8ecf0';x.font='bold 16px sans-serif';x.fillText('대피 경로',W/2,32);x.fillStyle='#1a1814';x.strokeStyle='#1e7a3a';x.lineWidth=6;
      x.beginPath();x.moveTo(24,120);x.lineTo(64,80);x.lineTo(104,120);x.stroke();x.beginPath();x.moveTo(64,80);x.lineTo(64,150);x.stroke();x.font='bold 11px sans-serif';x.fillText('EVAC ROUTE → GATE S',W/2,H-14)}
    // torn corner
    x.clearRect(W-22,H-22,22,22);x.fillStyle='rgba(0,0,0,0)'}})}
// ---------- v5.1 detail props: medical tents, wrecked cars, forklift, office screens, traffic cones ----------
function texCanvas(base,seed){const N=TN,K=TK;return paint(N,N,P=>{
  // woven canvas: fine cross-hatch over blotchy fading, seams every metre, mud splashed up from the ground
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=((x>>1)+(y>>1))&1;let t=.5+(P.n(x,y,40*K,seed,3)-.5)*.5+(w?.04:-.04)+(hash2(x,y,seed+1)-.5)*.06;
    let c=dith(P,x,y,t,[dk(base,.42),dk(base,.26),dk(base,.12),base,lt(base,.1)],.1);if(x%(N/2)<3)c=dk(c,x%(N/2)===1?.4:.2);P.set(x,y,c)}
  for(let i=0;i<14;i++)stain(P,hash2(i,1,seed+2)*N,hash2(i,2,seed+2)*N,6+hash2(i,3,seed+2)*14,5+hash2(i,4,seed+2)*10,.22,seed+30+i);
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,5,seed+3)*N),Math.floor(hash2(i,6,seed+3)*N*.5),30+Math.floor(hash2(i,7,seed+3)*60),.14,2)})}
function texCross(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c='#e4e2da';if(hash2(x,y,301)<.06)c='#cfcdc4';const n=P.n(x,y,24,302,2);if(n>.64)c=mix(c,'#a89a7a',(n-.64)*1.4);
    const cx=Math.abs(x-64),cy=Math.abs(y-56);if((cx<10&&cy<30)||(cx<30&&cy<10))c=hash2(x,y,303)<.08?'#8a1a14':'#c42420';if(x<4||y<4||x>123||y>123)c='#9a988e';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#2a2824';x.font='bold 15px sans-serif';x.textAlign='center';x.fillText('의료 MEDICAL',64,112)}})}
function texCarPaint(base,burnt){const N=TN,K=TK;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,60*K,311,3)-.5)*.3+(hash2(x,y,312)-.5)*.05;let c;
    if(burnt){const r=P.n(x,y,24*K,313,3);c=r>.58?dith(P,x,y,(r-.58)*2.4,['#3a1a0c','#5a2a12','#7a3a18','#9a5222'],.2):dith(P,x,y,t*.6,['#0c0c0c','#141312','#1c1a18','#26221e'],.15)}
    else{c=dith(P,x,y,t,[dk(base,.4),dk(base,.22),dk(base,.08),base,lt(base,.12),lt(base,.26)],.08);
      // clear-coat sheen bands and road dirt rising from the bottom of each panel
      if((y+x*.2)%96<6)c=lt(c,.1);const d=P.n(x,y,10,314,2);if(d>.66)c=mix(c,'#4a3e2e',(d-.66)*1.6)}
    P.set(x,y,c)}
  if(!burnt){for(let i=0;i<20;i++){const x0=hash2(i,1,315)*N,y0=hash2(i,2,315)*N,l=10+hash2(i,3,315)*40,a=hash2(i,4,315)*.6-.3;for(let k=0;k<l;k++)P.set(Math.round(x0+k),Math.round(y0+k*a),'#c8ccd0',.5)}
    for(let i=0;i<6;i++){const cx=hash2(i,5,316)*N,cy=hash2(i,6,316)*N;stain(P,cx,cy,6,4,.3,317+i);for(let k=0;k<12;k++)P.set(Math.round(cx+(hash2(k,i,318)-.5)*10),Math.round(cy+(hash2(k,i,319)-.5)*8),'#7a3a18',.7)}}
  else for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,320)*N),Math.floor(hash2(i,2,320)*N),20+Math.floor(hash2(i,3,320)*60),.25,2)})}
function texCarGlass(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=y<40?'#2a3440':'#141a22';if((x+y)%40<4)c='#3a4a58';if(hash2(x,y,331)<.02)c='#5a6a78';P.set(x,y,c)}
  // a shattered spot with radial cracks
  const cx=86,cy=52;for(let a=0;a<14;a++){const an=a/14*TAU+hash2(a,1,332)*.3;let x=cx,y=cy;for(let k=0;k<40+hash2(a,2,332)*40;k++){x+=Math.cos(an)*.9;y+=Math.sin(an)*.9;P.set(Math.round(x),Math.round(y),'#9aa8b4',.85)}}
  for(let r=6;r<30;r+=7)for(let a=0;a<60;a++){const an=a/60*TAU;P.set(Math.round(cx+Math.cos(an)*r),Math.round(cy+Math.sin(an)*r),'#7a8894',.5)}})}
function texTire(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const tr=(x+(y>>3)*4)%16<7;let c=tr?'#1a1a1a':'#0e0e0e';if(y%16<2)c='#060606';if(hash2(x,y,341)<.08)c='#2a2a28';P.set(x,y,c)}})}
function texScreen(){return paint(128,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<128;x++){let c='#0a140e';if(x<6||y<6||x>121||y>89)c='#1a1c1e';else{if(y%3===0)c='#08100a';if(hash2(x,y,351)<.03)c='#2a4a32'}P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#5aff8a';x.font='bold 9px monospace';['Q7-SEC MONITOR','CAM 03  NO SIGNAL','CAM 04  ▓▓▓▓░░','> QUARANTINE LOCK','> STATUS: BREACH'].forEach((l,i)=>x.fillText(l,10,20+i*14));
    x.fillStyle='#ff5a4a';x.fillRect(100,70,14,8)}})}
function texCone(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=(y>24&&y<38)?'#e8e8e0':'#e0581c';if(hash2(x,y,361)<.1)c=dk(c,.15);const n=P.n(x,y,12,362,2);if(n>.65)c=mix(c,'#4a3a2a',(n-.65)*1.5);P.set(x,y,c)}})}
function texBag(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.4+(P.n(x,y,20,371,3)-.5)*.5;if((x+y*2)%30<3)t+=.25;let c=dith(P,x,y,t,['#08090a','#101214','#181a1e','#22262a','#30343a'],.1);
    if(Math.abs(y-64)<2)c=x%4<2?'#3a3c40':'#1a1c1e';P.set(x,y,c)}})}
function texPaintY(){const N=TN,K=TK;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,48*K,381,3)-.5)*.35+(hash2(x,y,382)-.5)*.05;
    let c=dith(P,x,y,t,['#6a4a0a','#8a6410','#b08418','#c8981e','#dcac2a'],.1);P.set(x,y,c)}
  for(let i=0;i<18;i++){const cx=hash2(i,1,383)*N,cy=hash2(i,2,383)*N;for(let y=-6;y<=6;y++)for(let x=-9;x<=9;x++){const d=Math.hypot(x/9,y/6)+(P.n(cx+x,cy+y,5,384+i,2)-.5)*.7;if(d<1)P.set(Math.round(cx+x),Math.round(cy+y),d<.5?'#3a3a36':'#5a5650')}}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,3,385)*N),Math.floor(hash2(i,4,385)*N),20+Math.floor(hash2(i,5,385)*60),.2,2)})}
function bakeTexturesV51(){TEX.tent=mkTex(texCanvas('#5a5e3e',391));TEX.cot=mkTex(texCanvas('#6a7268',397));TEX.cross=mkTex(texCross(),false);TEX.car=mkTex(texCarPaint('#3a4a5a',0));TEX.carR=mkTex(texCarPaint('#6a2a22',0));
  TEX.carBurnt=mkTex(texCarPaint('#000',1));TEX.carGl=mkTex(texCarGlass());TEX.tire=mkTex(texTire());TEX.screen=mkTex(texScreen(),false);TEX.cone=mkTex(texCone());TEX.bag=mkTex(texBag());TEX.paintY=mkTex(texPaintY());
  TEX.signMed=mkTex(texSign([{t:'임시 진료소'},{t:'FIELD CLINIC',s:8}],'#e8e6dc','#b02018',96,32),false)}
function bakeTextures(){
  TEX.conc=mkTex(texConcrete());TEX.concf=mkTex(texConcFloor());TEX.asph=mkTex(texAsphalt());TEX.dirt=mkTex(texDirt());TEX.brick=mkTex(texBrick());
  TEX.metal=mkTex(texMetal('#5a6670'));TEX.metal2=mkTex(texMetal('#6e6a5e'));TEX.plate=mkTex(texPlate());TEX.tile=mkTex(texTile());TEX.plaster=mkTex(texPlaster());TEX.wood=mkTex(texWood());
  TEX.contR=mkTex(texContainer('#7a2e22','QZL-07'));TEX.contB=mkTex(texContainer('#2a4a6a','NXT 4471'));TEX.contG=mkTex(texContainer('#3e5a32','Q7 LOG'));
  TEX.hazard=mkTex(texHazard());TEX.roof=mkTex(texRoof());TEX.door=mkTex(texDoor());TEX.win=mkTex(texWindow(false));TEX.winLit=mkTex(texWindow(true));
  TEX.lampW=mkTex(texLight('#e8f0ff'));TEX.lampO=mkTex(texLight('#ffb050'));TEX.lampR=mkTex(texLight('#ff3030'));
  TEX.signQ=mkTex(texSign([{t:'격리구역 Q-7'},{t:'QUARANTINE ZONE',s:9}],'#c8b02a','#1a1a16',128,32),false);
  TEX.signN=mkTex(texSign([{t:'관계자 외 출입금지'}],'#e8e4d6','#a82020',128,24),false);
  TEX.signE=mkTex(texSign([{t:'비상구  EXIT'}],'#1e7a3a','#e8ffe8',64,20),false);
  TEX.signW=mkTex(texSign([{t:'창고 B'},{t:'WAREHOUSE B',s:8}],'#2a3a4a','#d8dcd8',96,32),false);
  TEX.sandbag=mkTex(texSandbag());TEX.pallet=mkTex(texPallet());TEX.drumB=mkTex(texDrum('#2a4a7a'));TEX.drumR=mkTex(texDrum('#7a2a22'));TEX.fence=mkTex(texFence());TEX.barrier=mkTex(texBarrier());TEX.pipe=mkTex(texPipe());
  TEX.mark=mkTex(texMark());TEX.poster0=mkTex(texPoster(0),false);TEX.poster1=mkTex(texPoster(1),false);
  TEX.sky=mkTex(texSky());TEX.sky.wrapT=THREE.ClampToEdgeWrapping;TEX.moon=mkTex(texMoon(),false);TEX.moon.minFilter=THREE.LinearFilter;TEX.moon.generateMipmaps=false;
  bakeTexturesV51();
}

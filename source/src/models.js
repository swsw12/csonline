'use strict';
// ============ Characters: box rigs with painted skin atlases, rigid skinning (one draw call each) and procedural animation ============
// Bones: 0 hip, 1 spine, 2 neck/head, 3 shoulder L, 4 elbow L, 5 shoulder R, 6 elbow R, 7 hip L, 8 knee L, 9 hip R, 10 knee R, 11 jaw (zombies hang their lower jaw on it), 12 ankle L, 13 ankle R,
// 14..18 stumps (neck, shoulders, hips): collapsed until the limb above them has been torn off
const NB=19,PARENT=[-1,0,1,1,3,1,5,0,7,0,9,2,8,10,1,1,1,0,0];
const STUMPS=(1<<14)|(1<<15)|(1<<16)|(1<<17)|(1<<18);
const SEVER={head:{bones:[2,11],stump:14,root:2},armL:{bones:[3,4],stump:15,root:3},armR:{bones:[5,6],stump:16,root:5},legL:{bones:[7,8,12],stump:17,root:7},legR:{bones:[9,10,13],stump:18,root:9}};
const FK=['front','back','right','left','top','bottom'];
// model faces -Z. For each face: outward normal, u axis (viewer's right), v axis (viewer's up)
const FACE={front:{n:[0,0,-1],u:[-1,0,0],v:[0,1,0]},back:{n:[0,0,1],u:[1,0,0],v:[0,1,0]},right:{n:[1,0,0],u:[0,0,-1],v:[0,1,0]},left:{n:[-1,0,0],u:[0,0,1],v:[0,1,0]},top:{n:[0,1,0],u:[1,0,0],v:[0,0,-1]},bottom:{n:[0,-1,0],u:[1,0,0],v:[0,0,1]}};
function faceDims(s,fk){return fk==='front'||fk==='back'?[s[0],s[1]]:fk==='right'||fk==='left'?[s[2],s[1]]:[s[0],s[2]]}
// ---------- humanoid proportions -> pivots + parts ----------
function humanoid(o){
  o=Object.assign({hipY:.93,legSep:.1,legW:.15,legD:.17,shinW:.13,thigh:.41,torsoW:.42,torsoH:.5,torsoD:.24,belly:0,shX:.25,armW:.12,upper:.28,fore:.27,hand:.1,
    headW:.24,headH:.26,headD:.26,neck:.06,footL:.25,headZ:-.01,arm2:1},o);
  const sY=o.hipY+.09,nY=sY+o.torsoH-.03,shY=sY+o.torsoH-.1,elY=shY-o.upper,hjY=o.hipY-.03,knY=hjY-o.thigh;
  const piv=[[0,o.hipY,0],[0,sY,0],[0,nY,0],[-o.shX,shY,0],[-o.shX,elY,0],[o.shX,shY,0],[o.shX,elY,0],[-o.legSep,hjY,0],[-o.legSep,knY,0],[o.legSep,hjY,0],[o.legSep,knY,0],[0,nY+o.neck+.012,o.headZ+o.headD*.2],[-o.legSep,.07,0],[o.legSep,.07,0],
    [0,nY,0],[-o.shX,shY,0],[o.shX,shY,0],[-o.legSep,hjY,0],[o.legSep,hjY,0]];
  const P=(n,b,c,s,m,x)=>Object.assign({n,b,c,s,m,f:{}},x||{});
  const shinL=knY-.09;
  const parts=[
    P('pelvis',0,[0,o.hipY-.03,o.belly*.3],[o.torsoW*.86,.22,o.torsoD*.9+o.belly*.4],'legs'),
    P('torso',1,[0,sY+o.torsoH/2,o.belly*.25],[o.torsoW,o.torsoH,o.torsoD+o.belly],'top'),
    P('neck',2,[0,nY+.03,0],[.1,o.neck+.04,.1],'skin'),
    P('head',2,[0,nY+o.neck+o.headH/2,o.headZ],[o.headW,o.headH,o.headD],'skin'),
  ];
  for(const sd of [-1,1]){const b0=sd<0?3:5,L=sd<0?'L':'R',aw=o.armW*(sd>0?o.arm2:1);
    parts.push(P('ua'+L,b0,[sd*o.shX,shY-o.upper/2+.04,0],[aw,o.upper+.07,aw],'sleeve'));
    parts.push(P('fa'+L,b0+1,[sd*o.shX,elY-o.fore/2,0],[aw*.92,o.fore,aw*.92],'fore'));
    // hand: a palm (facing the body) with four fingers along Z and a thumb in front; zombies get longer, hooked fingers with nails
    {const wy=elY-o.fore,hz=-.005,pw=aw*.5,ph=o.hand*.56,pd=aw*.92,fl=o.hand*(o.fingL||.5),fz=pd/4.2,fth=pw*.8,curl=o.curl==null?.85:o.curl,cl=o.claw||0,X=sd*o.shX;
      parts.push(P('hand'+L,b0+1,[X,wy-ph/2+.008,hz],[pw,ph,pd],'hand'));
      const fing=(n,root,rx,rz,len,w,th)=>{const d=new THREE.Vector3(0,-1,0).applyEuler(new THREE.Euler(rx,0,rz,'XYZ'));
        parts.push(P(n,b0+1,[root[0]+d.x*len/2,root[1]+d.y*len/2,root[2]+d.z*len/2],[th,len,w],'hand',{rx,rz,d:'hand'+L,fine:1}));
        if(cl>0)parts.push(P('claw',b0+1,[root[0]+d.x*(len+cl/2-.006),root[1]+d.y*(len+cl/2-.006),root[2]+d.z*(len+cl/2-.006)],[th*.62,cl,w*.62],'nail',{rx,rz,fine:1}))};
      for(let i=0;i<4;i++){const c=curl*(1+(i-1.5)*.08)+(o.curlJ?hash2(i,sd,o.curlJ)*.3:0);fing('fing'+L,[X,wy-ph+.01,hz-pd/2+pd*(i+.5)/4],(i-1.5)*.07,-sd*c,fl*(i===3?.82:i===0?.94:1),fz*.9,fth)}
      fing('thumb'+L,[X-sd*pw*.25,wy-ph*.3,hz-pd/2+.004],.62,-sd*.3*(1+curl*.4),fl*.74,fz*1.05,fth*1.05)}
    const lb=sd<0?7:9;
    parts.push(P('th'+L,lb,[sd*o.legSep,hjY-o.thigh/2,0],[o.legW,o.thigh+.05,o.legD],'legs'));
    parts.push(P('sh'+L,lb+1,[sd*o.legSep,knY-shinL/2,.01],[o.shinW,shinL,o.shinW*1.08],'shin'));
    parts.push(P('foot'+L,sd<0?12:13,[sd*o.legSep,.045,-.04],[o.shinW*1.04,.09,o.footL],'boot'));}
  // face relief: the head's front is sculpted (eye sockets, brow, nose, cheeks, mouth); ears and a visor are separate parts
  {const hc=nY+o.neck+o.headH/2,fz=o.headZ-o.headD/2,ey=hc+o.headH*((o.eyeY||.5)-.5);
    if(o.face!=='mask')parts[3].sculpt=faceSculpt(o);parts[3].ovoid=o.zombie?.42:.36;
    if(o.face==='visor')parts.push(P('visor',2,[0,ey+.004,fz+.034],[o.headW*1.0,o.headH*.3,.098],'visor'))}
  return {piv,parts,o,la:o.upper,lb:o.fore+o.hand/2,hand:[o.shX,elY-o.fore-o.hand/2,0],headC:[0,nY+o.neck+o.headH/2,o.headZ],headR:Math.max(o.headW,o.headH)*.62,foot:{hb:o.footL/2-.04,tf:o.footL/2+.04,ah:.07}}}
// face height field (metres outward) over the head's front, u/v in -1..1: sockets around the painted eyes, brow ridge, nose, cheekbones, mouth.
// Zombies get deep sockets, hollow cheeks and a heavier brow; a missing nose (o.nose===false) becomes a nasal cavity.
function faceSculpt(o){const z=!!o.zombie,es=(o.eyeSep||.2)*2,ev=((o.eyeY||.5)-.5)*2-.04,brow=o.browH?o.browH*.5:z?.012:.005,nose=o.nose===false?-.012:(z?.014:.018)*(o.face==='visor'?.6:1)*(o.noseW?o.noseW/.15:1);
  const g=(x,w)=>Math.exp(-x*x/w);
  return (u,v)=>{const au=Math.abs(u);const win=smooth(clamp((1-au)/.22,0,1))*smooth(clamp((1-Math.abs(v))/.18,0,1));if(win<=0)return 0;
    let h=-(z?.024:.007)*g(au-es,.05)*g(v-ev,.035);// eye sockets
    h+=brow*g(v-ev-.19,.008)*smooth(clamp((.95-au)/.3,0,1));// brow ridge
    const t=(ev-v)/.38;const np=t<0?.3*g(t,.04):t<=1?.3+.7*t:g(t-1,.05);h+=nose*np*g(u,(nose<0?.02:.009)+.012*clamp(t,0,1));// nose: bridge to tip
    h+=(z?.007:.004)*g(au-.56,.03)*g(v-ev+.3,.02);// cheekbones
    if(z)h-=.009*g(au-.5,.035)*g(v-ev+.62,.03);// hollow cheeks
    h+=.005*g(u,.2)*g(v-ev+.76,.03);// mouth
    return h*win}}
// ---------- tiny 3x5 pixel font for stencils ----------
const PF={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',H:'101101111101101',I:'111010010010111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','7':'111001010010010','-':'000000111000000'};
// ---------- skin atlas painter ----------
// CK: atlas pixels per design pixel. Skins are painted at 3x density: shapes keep their size, edges, grain and highlights get the extra pixels.
let CK=3;
// gloss: the atlas alpha carries the surface finish (FS_CHAR): 255 matte cloth, 240..254 increasingly wet/shiny, 232 glowing
const GLOSS={plate:248,rubber:245,boot:243,flesh:252,meat:253,tumor:250,skin:241,zskin:242,hair:243};
const WET={flesh:252,wounds:252,ribs:251,bonep:247,drip:253,bite:252,soak:250,gash:252,blood:251,rot:250,teethrow:247,tear:242,veins:243,stitch:246};
// materials: {base, style}; decor ops use face-normalised coords (u right, v up, 0..1)
function fillMat(P,x0,y0,w,h,M,seed,fk,partN){const st=M.style||'cloth',base=M.base;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=x0+x,Y=y0+y;const v=1-(y+.5)/h;let c=base,t;
    if(st==='cloth'){t=.5+(P.n(X,Y,6*CK,seed,2)-.5)*.6+(hash2(X,Y,seed)-.5)*.16+(((X+Y)&1)?.03:-.03);const fold=Math.sin((x/CK*.9+hash2(Math.floor(y/(4*CK)),1,seed)*3))*.5+.5;t+=(fold-.5)*.12;
      c=t<.33?dk(base,.22):t<.45?dk(base,.1):t>.72?lt(base,.12):t>.6?lt(base,.05):base;if(M.camo){const n=P.n(X,Y,9*CK,seed+5,2);if(n>.62)c=mix(c,M.camo[0],.75);else if(n<.36)c=mix(c,M.camo[1],.7)}}
    else if(st==='skin'){t=(P.n(X,Y,5*CK,seed,2)-.5)*.35+(P.n(X,Y,2,seed+2,1)-.5)*.1+(hash2(X,Y,seed+1)-.5)*.08;c=t>.1?lt(base,.08):t<-.1?dk(base,.1):base}
    else if(st==='zskin'){t=P.n(X,Y,4*CK,seed,3);const t2=P.n(X,Y,9*CK,seed+3,2);c=t>.62?dk(base,.28):t<.3?lt(base,.1):base;if(t2>.66)c=mix(c,M.blot||'#4a2a28',.55);if(t2>.6&&t2<.62)c=dk(c,.35);if(hash2(X,Y,seed+2)<.03)c=dk(c,.3);else if(hash2(X,Y,seed+4)<.015)c=lt(c,.18)}
    else if(st==='rubber'){t=(hash2(X,Y,seed)-.5)*.14;c=t>.04?lt(base,.06):base;if(y===0)c=lt(base,.18);else if(y===1)c=lt(base,.08)}
    else if(st==='boot'){c=v<.22?dk(base,.35):base;if(hash2(X,Y,seed)<.1)c=lt(c,.07);if(v<.22&&v>.16)c=dk(base,.5);if(v<.14&&(x%(2*CK))===0)c=dk(base,.55)}
    else if(st==='hair'){t=hash2(x,Math.floor(y/(3*CK)),seed);c=t<.3?dk(base,.3):t>.8?lt(base,.15):base;if(hash2(x,y,seed+1)<.08)c=lt(c,.1)}
    else if(st==='plate'){t=P.n(X,Y,7*CK,seed,2);c=t>.6?lt(base,.1):t<.35?dk(base,.15):base;if(hash2(X,Y,seed+3)<.02)c=lt(c,.2);if(x===0||y===0)c=lt(base,.2);else if(x===1||y===1)c=lt(base,.08);if(x===w-1||y===h-1)c=dk(base,.32);else if(x===w-2||y===h-2)c=dk(base,.15)}
    else if(st==='flesh'){const fib=Math.sin((x/CK)*1.5+P.n(X,Y,6*CK,seed,2)*5)*.5+.5;c=mix(dk(base,.4),lt(base,.14),fib);if(hash2(X,Y,seed+5)<.05)c=lt(base,.32);else if(hash2(X,Y,seed+6)<.025)c='#e8d8a0'}
    else if(st==='meat'){const seg=Math.sin(y/CK*1.3+P.n(X,Y,4*CK,seed,2)*3)*.5+.5;c=mix(dk(base,.35),lt(base,.18),seg);if(hash2(X,Y,seed+7)<.07)c=lt(base,.38);if(hash2(X,Y,seed+8)<.03)c='#4a0a10'}
    else if(st==='tumor'){t=P.n(X,Y,3*CK,seed,3);c=t>.62?lt(base,.18):t<.34?dk(base,.38):base;if(hash2(X,Y,seed+8)<.022)c='#e8d070';if(hash2(X,Y,seed+9)<.015)c='#2a0a10'}
    else if(st==='flat'){c=base}
    P.set(X,Y,c)}}
function decor(P,x0,y0,w,h,ops,seed,M){
  const X=u=>x0+Math.floor(clamp(u,0,.9999)*w),Y=v=>y0+Math.floor(clamp(1-v,0,.9999)*h);
  const R=(u0,v0,u1,v1,f)=>{const a=X(u0),b=X(u1-1e-4),cy0=Y(v1-1e-4),cy1=Y(v0);for(let y=cy0;y<=cy1;y++)for(let x=a;x<=b;x++)f(x,y,x-a,y-cy0,b-a,cy1-cy0)};
  for(const op of ops){const k=op[0];const ga0=P.ga;if(WET[k])P.ga=WET[k];else if(k==='face')P.ga=op[1]==='gasmask'?246:op[1]==='visor'?249:op[1]==='man'||op[1]==='woman'?241:243;
    decorOp(P,x0,y0,w,h,op,k,seed,M,X,Y,R);P.ga=ga0}}
function decorOp(P,x0,y0,w,h,op,k,seed,M,X,Y,R){{
    if(k==='rect')R(op[1],op[2],op[3],op[4],(x,y)=>{const t=hash2(x,y,seed+7);P.set(x,y,t<.15?dk(op[5],.15):t>.9?lt(op[5],.08):op[5])});
    else if(k==='pocket')R(op[1],op[2],op[3],op[4],(x,y,i,j,W,H)=>{let c=op[5];if(j===0||j===1&&H>4)c=lt(c,.1);if(i===W||j===H)c=dk(c,.35);if(j===Math.min(2,H))c=dk(c,.25);P.set(x,y,c)});
    else if(k==='out')R(op[1],op[2],op[3],op[4],(x,y,i,j,W,H)=>{if(i===0||j===0||i===W||j===H)P.set(x,y,op[5])});
    else if(k==='band')R(0,op[1],1,op[2],(x,y,i,j,W,H)=>{let c=op[3];if(j===0&&H>1)c=lt(c,.12);if(j===H&&H>1)c=dk(c,.2);if(hash2(x,y,seed+8)<.1)c=dk(c,.12);P.set(x,y,c)});
    else if(k==='vband')R(op[1],0,op[2],1,(x,y)=>P.set(x,y,hash2(x,y,seed+9)<.1?dk(op[3],.12):op[3]));
    else if(k==='glow')R(op[1],op[2],op[3],op[4],(x,y)=>{P.set(x,y,op[5]);P.D[(y*P.w+x)*4+3]=232});
    else if(k==='px'){const x=X(op[1]),y=Y(op[2]);for(let j=0;j<CK;j++)for(let i=0;i<CK;i++){P.set(x+i,y+j,op[3]);if(op[4])P.D[((y+j)*P.w+x+i)*4+3]=232}}
    else if(k==='grime'){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=P.n(x0+x,y0+y,5*CK,seed+11,2);if(n>.62)P.mul(x0+x,y0+y,1-op[1]*(n-.62)*2.5);if((1-(y+.5)/h)<.18)P.mul(x0+x,y0+y,1-op[1]*.3)}}
    else if(k==='blood'){const n=op[1],col=op[3]||'#5a0c0c';for(let i=0;i<n;i++){const cx=hash2(i,seed,op[2])*w,cy=hash2(i,seed+1,op[2])*h,r=1+hash2(i,seed+2,op[2])*Math.max(1.5,w*.14);
        for(let y=-r;y<=r+3*CK;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y*(y>0?.5:1))/r+(hash2(Math.floor(x/CK)+i,Math.floor(y/CK),op[2])-.5)*.5;if(d<1){const px=Math.floor(cx+x),py=Math.floor(cy+y);if(px>=0&&py>=0&&px<w&&py<h)P.set(x0+px,y0+py,d<.5?dk(col,.25):col)}}}}
    else if(k==='tear'){const n=op[1],col=op[3];for(let i=0;i<n;i++){const cx=hash2(i,seed+3,op[2])*w,cy=hash2(i,seed+4,op[2])*h,rx=1+hash2(i,seed+5,op[2])*w*.22,ry=1+hash2(i,seed+6,op[2])*h*.16;
        for(let y=-ry-1;y<=ry+1;y++)for(let x=-rx-1;x<=rx+1;x++){const d=Math.hypot(x/rx,y/ry)+(hash2(x+i*7,y,seed)-.5)*.45;const px=Math.floor(cx+x),py=Math.floor(cy+y);if(px<0||py<0||px>=w||py>=h)continue;
          if(d<1)P.set(x0+px,y0+py,col);else if(d<1.25)P.set(x0+px,y0+py,dk(P.get(x0+px,y0+py).length?rgbHex(...P.get(x0+px,y0+py)):col,.35))}}}
    else if(k==='veins'){const n=op[1],col=op[2],glow=op[3];for(let i=0;i<n;i++){let x=Math.floor(hash2(i,seed+12,5)*w),y=Math.floor(hash2(i,seed+13,5)*h);const L=4+Math.floor(hash2(i,seed+14,5)*h*.8);
        for(let s=0;s<L;s++){if(x>=0&&y>=0&&x<w&&y<h){P.set(x0+x,y0+y,col);if(glow)P.D[((y0+y)*P.w+x0+x)*4+3]=232}const r=hash2(i,s,seed+15);if(r<.45)y++;else if(r<.7)x++;else if(r<.95)x--;else y--}}}
    else if(k==='text'){const s=op[1];let cx=X(op[2]),cy=Y(op[3]);for(const ch of s){const g=PF[ch];if(g){for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(g[j*3+i]==='1')for(let b=0;b<CK;b++)for(let a=0;a<CK;a++)P.set(cx+i*CK+a,cy+j*CK+b,a+b===0?lt(op[4],.1):op[4])}cx+=4*CK}}
    else if(k==='zip'){const x=X(op[1]);for(let y=y0;y<y0+h;y++){P.set(x,y,(y&1)?'#8a8a82':'#3a3a36');P.set(x+1,y,(y&1)?'#3a3a36':'#6a6a64')}}
    else if(k==='belt'){R(0,op[1],1,op[2],(x,y,i,j,W,H)=>{let c=op[3];if(j===0)c=lt(c,.15);if(hash2(x,y,seed)<.1)c=dk(c,.2);P.set(x,y,c)});if(op[4])R(.42,op[1],.58,op[2],(x,y,i,j,W,H)=>P.set(x,y,(i===0||i===W||j===0||j===H)?op[4]:dk(op[4],.4)))}
    else if(k==='laces'){for(let y=Math.floor(h*.35);y<h*.85;y+=2*CK)for(let x=Math.floor(w*.3);x<w*.7;x++){P.set(x0+x,y0+y,(x&1)?'#7a746a':'#5a544a');P.set(x0+x,y0+y+1,'#3a362e')}}
    // ---- gore ----
    else if(k==='flesh'){const ang=op[5]||0,ca=Math.cos(ang),sa=Math.sin(ang);// exposed muscle: striated fibres, wet dark edge, a rim of yellow fat and torn skin
      R(op[1],op[2],op[3],op[4],(x,y,i,j,W,H)=>{const cx=(i+.5)/(W+1)*2-1,cy=(j+.5)/(H+1)*2-1;const d=Math.hypot(cx,cy)+(P.n(x,y,3*CK,seed+21,2)-.5)*.55;if(d>1)return;
        if(d>.84){P.set(x,y,d>.93?'#c8b47a':'#9a7a48');return}
        const fib=Math.sin((i*ca+j*sa)/CK*1.6+P.n(x,y,5*CK,seed+23,1)*2)*.5+.5;let c=mix('#4a0606','#a82a1e',fib*.85);if(hash2(x,y,seed+22)<.07)c='#d85040';else if(hash2(x,y,seed+24)<.02)c='#f0e0b0';if(d>.7)c=dk(c,.45);P.set(x,y,c)})}
    else if(k==='wounds'){const n=op[1];for(let i=0;i<n;i++){const u=.15+hash2(i,seed,op[2])*.7,v=.15+hash2(i,seed+1,op[2])*.7,r=.1+hash2(i,seed+2,op[2])*.14;decor(P,x0,y0,w,h,[['flesh',u-r,v-r*.8,u+r,v+r*.8,hash2(i,seed+3,op[2])*3]],seed+i*5,M)}}
    else if(k==='ribs'){const nr=op[5]||5;// torn open chest: a dark cavity crossed by curved ribs either side of the sternum
      R(op[1],op[2],op[3],op[4],(x,y,i,j,W,H)=>{const cx=(i+.5)/(W+1)*2-1,cy=(j+.5)/(H+1);const ax=Math.abs(cx);
        const edge=ax>.9+(hash2(x>>1,y>>1,seed)-.5)*.15||cy<.05||cy>.95;const rib=(((cy-ax*ax*.22)*nr)%1+1)%1;const onRib=rib<.42&&ax>.13,stern=ax<.11&&cy<.8;
        let c;if(edge)c=hash2(x,y,seed+3)<.5?'#9a7a48':'#5a0808';else if(stern||onRib){const sh=onRib?rib/.42:(cx+.11)/.22;c=sh<.22?'#f2e8cc':sh>.78?'#7a6a4a':'#d0c6a4';if(hash2(x,y,seed+5)<.05)c='#6a1a12'}
        else c=hash2(x,y,seed+6)<.45?'#1a0202':(hash2(x,y,seed+7)<.4?'#5a0a08':'#3a0606');P.set(x,y,c)})}
    else if(k==='bonep')R(op[1],op[2],op[3],op[4],(x,y,i,j,W,H)=>{const cx=(i+.5)/(W+1)*2-1,cy=(j+.5)/(H+1)*2-1;const d=Math.hypot(cx,cy)+(hash2(x>>1,y>>1,seed+30)-.5)*.35;if(d>1)return;
        let c=d>.8?(d>.9?'#a87a48':'#6a0c0a'):mix('#f0e6c8','#a89a74',P.n(x,y,3*CK,seed+31,2));if(hash2(x,y,seed+32)<.03)c='#5a4a34';P.set(x,y,c)});
    else if(k==='drip'){const n=op[3]||3,L=op[4]||.4;const sx=X(op[1]),sy=Y(op[2]);// blood running down from a point
      for(let i=0;i<n;i++){let x=sx+Math.round((hash2(i,seed,41)-.5)*w*.3);const len=Math.round(h*L*(.4+hash2(i,seed,42)*.6));const wd=hash2(i,seed,43)<.5?CK:Math.max(1,CK-1);let y=sy;
        for(let q=0;q<len;q++){y=sy+q;if(y>=y0+h)break;if(hash2(i,q,44)<.07)x+=hash2(i,q,45)<.5?1:-1;if(x<x0||x+wd>x0+w)break;for(let e=0;e<wd;e++)P.set(x+e,y,q<len*.7?'#6a0a08':'#4a0606')}
        if(y<y0+h-1)for(let e=-1;e<=wd;e++)if(x+e>=x0&&x+e<x0+w)P.set(x+e,y+1,'#5a0808')}}
    else if(k==='bite'){const cx=X(op[1]),cy=Y(op[2]),r=Math.max(3,Math.round(w*(op[3]||.15)));decor(P,x0,y0,w,h,[['flesh',op[1]-op[3]*.75,op[2]-op[3]*.55,op[1]+op[3]*.75,op[2]+op[3]*.55,1]],seed+50,M);
      for(let a=0;a<16;a++){const an=a/16*TAU;const rx=Math.round(cx+Math.cos(an)*r),ry=Math.round(cy+Math.sin(an)*r*.7);for(let q=0;q<CK;q++)for(let e=0;e<CK;e++)if(rx+e>=x0&&rx+e<x0+w&&ry+q>=y0&&ry+q<y0+h)P.set(rx+e,ry+q,'#1a0202')}}
    else if(k==='stitch'){const ax=X(op[1]),ay=Y(op[2]),bx=X(op[3]),by=Y(op[4]);const L=Math.max(1,Math.hypot(bx-ax,by-ay));const nx=-(by-ay)/L,ny=(bx-ax)/L;// surgical seam with crude cross stitches
      for(let q=0;q<=L;q++){const x=Math.round(ax+(bx-ax)*q/L),y=Math.round(ay+(by-ay)*q/L);P.set(x,y,'#3a0a0a');P.set(x+1,y,'#7a2a22');
        if(q%(3*CK)===0)for(let e=-2*CK;e<=2*CK;e++){const px=Math.round(x+nx*e),py=Math.round(y+ny*e);if(px>=x0&&px<x0+w&&py>=y0&&py<y0+h)P.set(px,py,'#1a1410')}}}
    else if(k==='rot'){const n=op[1];for(let i=0;i<n;i++){const cx=hash2(i,seed,61)*w,cy=hash2(i,seed+1,61)*h,rx=w*(.08+hash2(i,seed+2,61)*.14),ry=rx*(.6+hash2(i,seed+3,61)*.6);// necrotic patch with pustules
      for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=Math.hypot(x/rx,y/ry)+(hash2(Math.floor(x/CK)+i,Math.floor(y/CK),62)-.5)*.4;if(d>1)continue;const px=Math.floor(cx+x),py=Math.floor(cy+y);if(px<0||py<0||px>=w||py>=h)continue;
        P.set(x0+px,y0+py,d<.35?'#1a0a14':d<.6?'#3a1a2a':d<.82?'#4a5a24':'#6a7a34',d<.6?1:.7)}
      for(let q=0;q<3;q++){const px=Math.floor(cx+(hash2(i,q,63)-.5)*rx),py=Math.floor(cy+(hash2(i,q,64)-.5)*ry);if(px>=0&&py>=0&&px<w-CK&&py<h-CK){for(let a=0;a<CK;a++)for(let b=0;b<CK;b++)P.set(x0+px+b,y0+py+a,'#d8c860');P.set(x0+px,y0+py,'#f0e8a0')}}}}
    else if(k==='soak'){const col=op[3]||'#5a0808',al=op[4]||.85;// blood soaking down cloth from v1, fading towards v0
      R(0,op[1],1,op[2],(x,y,i,j,W,H)=>{const t=1-j/(H||1);const n=P.n(x,y,6*CK,seed+71,2);const a=al*clamp(t*1.25-(.5-n)*.9,0,1);if(a>.05)P.set(x,y,hash2(x,y,seed+72)<.1?dk(col,.3):col,a)})}
    else if(k==='gash'){const n=op[5]||3;for(let g=0;g<n;g++){const off=(g-(n-1)/2)*(op[6]||.09);const ax=X(op[1]+off),ay=Y(op[2]),bx=X(op[3]+off),by=Y(op[4]);const L=Math.max(1,Math.hypot(bx-ax,by-ay));// parallel claw slashes
      for(let q=0;q<=L;q++){const f=Math.sin(q/L*Math.PI);const x=Math.round(ax+(bx-ax)*q/L),y=Math.round(ay+(by-ay)*q/L);const wd=Math.max(1,Math.round(f*CK*1.5));
        for(let e=-wd;e<=wd;e++){const px=x+e;if(px<x0||px>=x0+w||y<y0||y>=y0+h)continue;P.set(px,y,Math.abs(e)===wd?'#9a2a20':(Math.abs(e)<wd*.5?'#1a0202':'#6a0a08'))}}}}
    else if(k==='teethrow'){const top=op[1]==='top';const d=Math.max(CK*2,Math.round(h*(op[2]||.22)));const tw=Math.max(2,Math.round(CK*2.2));// a row of teeth along one edge, gums and a wet dark mouth behind
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ed=top?y:h-1-y;let c;const ti=Math.floor(x/tw);
        if(ed<d){const gap=x%tw===tw-1,miss=hash2(ti,7,seed)<.18,len=d*(.55+hash2(ti,8,seed)*.45);if(gap||miss||ed>len)c=ed<d*.2?'#2a0606':'#5a1212';else{c=ed<len*.3?'#efe4c4':ed<len*.8?'#d0c4a0':'#8a7a54';if(hash2(ti,9,seed)<.25)c=dk(c,.3)}}
        else c=hash2(x,y,seed)<.5?'#2a0404':(ed<d+CK?'#7a1a1a':'#4a0a0a');P.set(x0+x,y0+y,c)}}
    else if(k==='face')paintFace(P,x0,y0,w,h,op[1],seed,op[2]||{});
  }}
function eyePair(P,x0,y0,w,h,ey,sep,fn){const K=CK;for(const s of [-1,1]){const lx=Math.round((w/2+s*sep*w)/K)*K-(s>0?K:0);fn(x0+lx,y0+Math.round(h*(1-ey)/K)*K,s)}}
// faces are designed on a coarse grid (one design pixel = CK atlas pixels); glints, lids and lip lines use the fine pixels
function paintFace(P,x0,y0,w,h,kind,seed,o){const K=CK;
  const skin=o.skin||'#c89a78',sd=dk(skin,.25),sl=lt(skin,.15);
  const sp=(x,y,c,g)=>{if(x<x0||y<y0||x>=x0+w||y>=y0+h)return;P.set(x,y,c);if(g)P.D[(y*P.w+x)*4+3]=232};
  const B=(x,y,c,g)=>{for(let j=0;j<K;j++)for(let i=0;i<K;i++)sp(x+i,y+j,c,g)};
  const ey=o.ey||.5;const row=y0+Math.round(h*(1-ey)/K)*K;const cx=x0+Math.round(w/2/K)*K;
  if(kind==='man'||kind==='woman'){const hair=o.hair||'#2a2018',iris=o.iris||'#2a2018';
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=Math.min(x,w-1-x)/w;if(e<.12)P.mul(x0+x,y0+y,.9+e*.8)}
    eyePair(P,x0,y0,w,h,ey,.2,(x,y,s)=>{const ix=x+(s<0?K:-K);B(x,y,'#e8e0d4');B(ix,y,iris);sp(ix+(s<0?0:K-1),y+K-1,'#0c0806');sp(ix+(s<0?K-1:0),y,lt(iris,.35));
      const x1=Math.min(x,ix);for(let i=0;i<2*K;i++){sp(x1+i,y-2*K+1,hair);sp(x1+i,y-2*K,dk(hair,.15));sp(x1+i,y-1,dk(skin,.38));sp(x1+i,y+K,sd)}});
    for(let j=0;j<3*K;j++)sp(cx-K,row+K+j,sd);sp(cx-1,row+K+1,sl);for(let i=-K;i<K;i++)sp(cx+i,row+4*K-1,sd);sp(cx-K-1,row+4*K-2,dk(skin,.4));sp(cx+K,row+4*K-2,dk(skin,.4));
    const my=y0+Math.round(h*.78/K)*K;for(let i=-2*K;i<2*K;i++){sp(cx+i,my,kind==='woman'?'#8a3e3c':dk(skin,.42));sp(cx+i,my+1,kind==='woman'?'#b86a62':lt(skin,.06))}
    if(kind==='woman')for(let i=-K;i<K;i++)sp(cx+i,my+2,'#a85a54');
    if(o.stubble)for(let y=Math.round(h*.7);y<h;y++)for(let x=2;x<w-2;x++)if(hash2(x,y,seed)<.33)sp(x0+x,y0+y,dk(skin,.2));
    for(let x=0;x<w;x++){sp(x0+x,y0+h-1,sd);sp(x0+x,y0+h-2,dk(skin,.12))}}
  else if(kind==='gasmask'){for(let y=Math.round(h*.25);y<h;y++)for(let x=K;x<w-K;x++)sp(x0+x,y0+y,(hash2(x,y,seed)<.1)?'#26282a':(y===Math.round(h*.25)?'#3a3c3e':'#1c1e20'));
    eyePair(P,x0,y0,w,h,.56,.21,(x,y)=>{for(let j=-2*K;j<K;j++)for(let i=-2*K;i<K;i++){const r=Math.hypot(i+.5,j+.5)/K;if(r<2.3)sp(x+i,y+j,r<1.35?'#5a7a8a':r<1.6?'#2a3438':'#3a4a52',r<.8)}sp(x-K,y-2*K+1,'#bcd8e8');sp(x-K+1,y-2*K+1,'#9ab8c8')});
    const cy=y0+Math.round(h*.8/K)*K;for(let j=-2*K;j<2*K+K;j++)for(let i=-2*K;i<2*K;i++)sp(cx+i,cy+j,((Math.floor(i/K)+Math.floor(j/K))&1)?'#3a3c3e':'#2a2c2e');for(let i=-2*K;i<2*K;i++)sp(cx+i,cy-2*K,'#4a4c4e')}
  else if(kind==='visor'){for(let y=Math.round(h*.3);y<h*.62;y++)for(let x=K;x<w-K;x++)sp(x0+x,y0+y,y<h*.36?'#3a4a5a':((x+y)%9===0?'#1e2630':'#141a22'));for(let i=0;i<2*K;i++)sp(x0+3*K+i,y0+Math.round(h*.38)+(i>>1),'#8aa8c0');
    const my=y0+Math.round(h*.8/K)*K;for(let i=-2*K;i<2*K;i++){sp(cx+i,my,dk(skin,.4));sp(cx+i,my+1,lt(skin,.05))}}
  else if(kind==='zombie'||kind==='runner'||kind==='brute'||kind==='scream'){
    const glow=o.eye||'#e8d040';
    // bruised, sunken face: dark rings around the sockets and down the cheeks
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=Math.min(x,w-1-x)/w;if(e<.14)P.mul(x0+x,y0+y,.82+e*1.2)}
    eyePair(P,x0,y0,w,h,ey,kind==='brute'?.16:.2,(x,y,s)=>{
      for(let j=-K-1;j<2*K+1;j++)for(let i=-K-1;i<2*K+1;i++){const inner=Math.abs(i-K/2)<K&&Math.abs(j-K/2)<K;sp(x+i,y+j,inner?dk(skin,.78):(j>K?mix(dk(skin,.45),'#3a1a2a',.4):dk(skin,.5)))}
      if(o.oneEye&&s>0){// gouged out: a wet black hole with a torn rim, still bleeding
        for(let j=-K;j<2*K;j++)for(let i=-K;i<2*K;i++){const r=Math.hypot(i-K/2+.5,j-K/2+.5)/K;sp(x+i,y+j,r<1?'#080101':r<1.45?'#5a0606':'#7a1410')}
        let tx=x;for(let j=0;j<h*.42;j++){if(hash2(j,3,seed)<.12)tx+=hash2(j,4,seed)<.5?1:-1;sp(tx,y+2*K+j,j<h*.3?'#7a0c0a':'#4a0606');sp(tx+1,y+2*K+j,'#5a0808')}return}
      B(x,y,glow,1);sp(x+(s<0?0:K-1),y,lt(glow,.55),1);if(kind!=='brute')B(x+(s<0?K:-K),y,glow,1);
      if(o.sewn){const xa=Math.min(x,x+(s<0?K:-K))-K;for(let i=0;i<4*K;i++)sp(xa+i,y+(K>>1),'#1a1210');for(let i=0;i<4*K;i+=K)for(let j=-K;j<2*K;j++)sp(xa+i,y+j,j===-K||j===2*K-1?'#4a2a20':'#2a1a14')}
      if(o.tears){const L=Math.round(h*(.26+hash2(x,s+2,seed)*.12));let tx=x+(s<0?0:K-1);for(let j=0;j<L;j++){if(hash2(j,s+5,seed+3)<.12)tx+=hash2(j,s+5,seed+4)<.5?1:-1;sp(tx,y+K+j,j<L*.7?'#7a0c0a':'#5a0808');sp(tx+1,y+K+j,'#4a0606')}}});
    const cx2=cx;
    if(kind==='scream'){const my=Math.round(h*.62/K)*K;for(let y=my;y<h;y++){const ww=Math.round(((y-my)/K+2)*.55+1)*K;for(let i=-ww;i<ww;i++){const edge=Math.abs(i)>=ww-K||y<my+K;sp(cx2+i,y0+y,edge?(hash2(Math.floor(i/K),Math.floor(y/K),seed)<.5?'#d8d0b0':'#5a1010'):(y>h-3*K?'#1a0404':'#2a0606'))}}}
    else{const my=y0+Math.round(h*.78/K)*K;
      if(o.lipless){// no lips left: both rows of teeth bared from ear to ear
        for(let i=-3*K;i<3*K;i++)for(let j=-K;j<2*K;j++){const tooth=Math.floor((i+3*K)/K)%2===0;const gum=j===-K||j===2*K-1;sp(cx2+i,my+j,gum?'#6a1a1a':(j<K/2?(tooth?'#d8d0b0':'#8a7a5a'):(tooth?'#c8c0a0':'#7a6a4a')))}
        for(let j=-K;j<2*K;j++){sp(cx2-3*K-1,my+j,'#5a0808');sp(cx2+3*K,my+j,'#5a0808')}}
      else{for(let i=-2;i<=2;i++){B(cx2+i*K,my,'#2a0a08');B(cx2+i*K,my-K,(i&1)?'#c8c0a0':'#2a0a08');if(kind!=='brute')B(cx2+i*K,my+K,(i&1)?'#2a0a08':'#b8b090')}
        if(kind==='brute')for(let i=-2;i<=2;i+=2){B(cx2+i*K,my-K,'#8a8a8a');B(cx2+i*K,my+K,'#8a8a8a')}}
      if(o.cheek){// a hole torn through the cheek shows the molars
        const qx=cx2-4*K-1,qy=my-2*K;for(let j=0;j<3*K;j++)for(let i=0;i<2*K+1;i++){const e=i===0||j===0||i===2*K||j===3*K-1;sp(qx+i,qy+j,e?'#7a1410':(j<1.5*K?((i>>1)&1?'#c8c0a0':'#2a0606'):'#3a0606'))}}
      // blood from the mouth down the chin
      for(let q=0;q<3;q++){let tx=cx2+(q-1)*K;for(let j=0;j<h-(my-y0)-K;j++){if(hash2(j,q,seed+9)<.15)tx+=hash2(j,q,seed+10)<.5?1:-1;sp(tx,my+K+j,'#5a0808')}}}
    for(let j=0;j<2;j++)B(cx-(j?0:K),row+2*K+j*K,dk(skin,.45))}
}
// pack faces of all parts into one atlas; returns uv rects
function paintSkin(def){
  for(let ppm=(def.ppm||100)*CK;ppm>30;ppm*=.9){
    const W=256*CK,H=256*CK,faces=[];
    def.parts.forEach((p,pi)=>{for(const fk of FK){const [fu,fv]=faceDims(p.s,fk);faces.push({pi,fk,w:Math.max(2,Math.round(fu*ppm)),h:Math.max(2,Math.round(fv*ppm))})}});
    const order=faces.slice().sort((a,b)=>b.h-a.h);let x=0,y=0,rowH=0,ok=true;
    for(const f of order){if(x+f.w+1>W){x=0;y+=rowH+1;rowH=0}if(y+f.h>H){ok=false;break}f.x=x;f.y=y;x+=f.w+1;rowH=Math.max(rowH,f.h)}
    if(!ok)continue;
    const cv=paint(W,H,P=>{
      for(let i=0;i<W*H*4;i+=4){P.D[i]=60;P.D[i+1]=60;P.D[i+2]=60;P.D[i+3]=255}
      faces.forEach((f,fi)=>{const p=def.parts[f.pi];const M=def.mats[p.m]||def.mats.top;const seed=17+f.pi*13+FK.indexOf(f.fk)*3;
        P.ga=M.gloss||GLOSS[M.style||'cloth']||255;fillMat(P,f.x,f.y,f.w,f.h,M,seed,f.fk,p.n);P.ga=255;
        const D=def.decor[p.d||p.n]||{};const ops=[].concat(D.all||[],D[f.fk]||[],(f.fk==='left'||f.fk==='right')?(D.side||[]):[],(f.fk==='front'||f.fk==='back')?(D.fb||[]):[]);
        if(ops.length)decor(P,f.x,f.y,f.w,f.h,ops,seed,M);
        // edge shading for small, hard-edged parts (big fillets get their shading from the geometry)
        if(f.fk!=='top'&&f.fk!=='bottom'&&f.h>3&&partShape(p).r<.02){for(let i=0;i<f.w;i++){P.mul(f.x+i,f.y+f.h-1,.86);P.mul(f.x+i,f.y+f.h-2,.94);P.mul(f.x+i,f.y,1.05)}}});
      if(def.post)def.post(P)});
    return {cv,faces,W,H}}
  throw new Error('skin atlas overflow')}
// ---------- geometry: rounded, tapered parts ----------
// Each box face becomes a grid whose outer rows are pushed onto a radius-r fillet (tan-spaced, so the arc is evenly divided). Neighbouring faces meet on the
// 45° line of every fillet, so each face keeps its own rectangle of the atlas. Limbs and torso then taper along Y (narrower wrists, knees, ankles, waist).
const _TANS=[[],[Math.tan(Math.PI/8)],[Math.tan(Math.PI/12),Math.tan(Math.PI/6)]];
function axisFr(L,r,q){const h=L/2,o=[-h];if(r>1e-5){const T=_TANS[q];for(let i=T.length-1;i>=0;i--)o.push(-h+r*(1-T[i]));o.push(-h+r);if(h-r>-h+r+1e-6)o.push(h-r);for(let i=0;i<T.length;i++)o.push(h-r*(1-T[i]))}o.push(h);return o.map(s=>s/L+.5)}
// S: {r fillet radius, tx/tz [scale at bottom, top] along Y, bx/bz bulge, bt bulge centre (0 bottom..1 top), bw bulge width, ny extra rows along Y}; lod 1 = chamfers only.
// face(fk,{na,nb,A,B,P,N}) receives each face grid (row-major, a fastest).
function profK(k,b,t,bt,bw){const u=(t-bt)/bw,w=Math.max(0,1-u*u);return (k?lerp(k[0],k[1],t):1)+(b?b*w*w:0)}
function rbox(s,S,lod,face){const hx=s[0]/2,hy=s[1]/2,hz=s[2]/2,r=Math.min(S.r,hx,hy,hz),ix=hx-r,iy=hy-r,iz=hz-r,q=lod?0:r>.02?2:r>.006?1:0;
  const tx=S.tx,tz=S.tz,bx=S.bx||0,bz=S.bz||0,bt=S.bt==null?.5:S.bt,bw=S.bw||.5,prof=tx||tz||bx||bz;
  // grid fractions per axis: fillet samples plus optional evenly spaced interior rows (bulging limbs, sculpted faces)
  const sub=(L,iv,n)=>{let F=axisFr(L,r,q);if(n&&!lod){const lo=-iv/L+.5,hi=iv/L+.5;for(let i=1;i<n;i++)F.push(lo+(hi-lo)*i/n);F.sort((a,b)=>a-b)}return F};
  const AX=sub(s[0],ix,S.nx),AY=sub(s[1],iy,S.ny),AZ=sub(s[2],iz,S.nz),sc=lod?null:S.sculpt;
  for(const fk of FK){const F=FACE[fk];const side=fk!=='top'&&fk!=='bottom';const hn=fk==='front'||fk==='back'?hz:fk==='right'||fk==='left'?hx:hy;const [fu,fv]=faceDims(s,fk);
    const A=fk==='right'||fk==='left'?AZ:AX,B=side?AY:AZ,P=[],N=[];
    for(const b of B)for(const a of A){const ua=(a-.5)*fu,vb=(b-.5)*fv;
      let x=F.n[0]*hn+F.u[0]*ua+F.v[0]*vb,y=F.n[1]*hn+F.u[1]*ua+F.v[1]*vb,z=F.n[2]*hn+F.u[2]*ua+F.v[2]*vb;
      const qx=clamp(x,-ix,ix),qy=clamp(y,-iy,iy),qz=clamp(z,-iz,iz);let dx=x-qx,dy=y-qy,dz=z-qz;const l=Math.hypot(dx,dy,dz);
      if(l>1e-9){dx/=l;dy/=l;dz/=l}else{dx=F.n[0];dy=F.n[1];dz=F.n[2]}
      x=qx+dx*r;y=qy+dy*r;z=qz+dz*r;
      // sculpted front (faces): a height field over the face's own texture coords (so it lines up with the painted eyes and mouth) pushes the
      // surface out along its normal; the normal tilts by the gradient taken along the face axes
      if(sc&&fk==='front'){const u=(a-.5)*2,v=(b-.5)*2,h=sc(u,v);if(h){const e=.02,hu=(sc(u+e,v)-sc(u-e,v))/(e*fu),hv=(sc(u,v+e)-sc(u,v-e))/(e*fv);
        x+=dx*h;y+=dy*h;z+=dz*h;const nx=dx-hu*F.u[0]-hv*F.v[0],ny=dy-hu*F.u[1]-hv*F.v[1],nz=dz-hu*F.u[2]-hv*F.v[2],nl=Math.hypot(nx,ny,nz);dx=nx/nl;dy=ny/nl;dz=nz/nl}}
      if(prof){const t=(y+hy)/s[1],e=.01;const kx=profK(tx,bx,t,bt,bw),kz=profK(tz,bz,t,bt,bw);
        const dkx=(profK(tx,bx,t+e,bt,bw)-profK(tx,bx,t-e,bt,bw))/(2*e*s[1]),dkz=(profK(tz,bz,t+e,bt,bw)-profK(tz,bz,t-e,bt,bw))/(2*e*s[1]);
        const nx=dx/kx,nz=dz/kz,ny=dy-x*dkx/kx*dx-z*dkz/kz*dz,nl=Math.hypot(nx,ny,nz);x*=kx;z*=kz;dx=nx/nl;dy=ny/nl;dz=nz/nl}
      P.push(x,y,z);N.push(dx,dy,dz)}
    face(fk,{na:A.length,nb:B.length,A,B,P,N})}}
// fillet radius, taper and muscle bulge per body part
function partShape(p){const n=p.n,[sx,sy,sz]=p.s,mn=Math.min(sx,sy,sz),mxz=Math.min(sx,sz);let S={r:Math.min(.03,mn*.28)};
  if(n==='head'){S.r=mn*(p.ovoid||.34);S.tx=[.88,1.02];S.tz=[.94,1];if(p.sculpt){S.sculpt=p.sculpt;S.nx=10;S.ny=12}}
  else if(n==='torso')S={r:mxz*.2,tx:[.9,1.04],bz:.02,bt:.8,bw:.45,ny:3};
  else if(n==='pelvis')S.r=mn*.24;
  else if(/^ua[LR]$/.test(n))S={r:mxz*.46,tx:[.9,1.02],tz:[.9,1.02],bx:.08,bz:.08,bt:.56,bw:.5,ny:3};
  else if(/^fa[LR]$/.test(n))S={r:mxz*.46,tx:[.84,1.02],tz:[.84,1.02],bx:.07,bz:.06,bt:.8,bw:.45,ny:3};
  else if(/^th[LR]$/.test(n))S={r:mxz*.46,tx:[.86,1.04],tz:[.88,1.04],bx:.05,bz:.08,bt:.62,bw:.5,ny:3};
  else if(/^sh[LR]$/.test(n))S={r:mxz*.46,tx:[.84,1.02],tz:[.82,1.04],bx:.06,bz:.12,bt:.74,bw:.4,ny:4};
  else if(/^hand/.test(n))S.r=mn*.36;
  else if(/^foot/.test(n))S.r=mn*.34;
  else if(n==='neck')S={r:mxz*.46,tx:[1.06,.96],tz:[1.06,.96]};
  else if(n==='jaw')S.r=mn*.34;
  else if(/^(hair|helm|tank|filt|gog|tail)/.test(n))S.r=mn*.38;
  else if(/^(tumor|sac|hump|stump)/.test(n))S.r=mn*.5;
  else if(/^guts/.test(n))S.r=mn*.4;
  else if(/^(bone)/.test(n))S.r=mn*.16;
  else if(/^(rib|vert|spike|claw)/.test(n))S.r=mn*.3;
  else if(/^(vest|pack|pouch|radio)/.test(n))S.r=Math.min(.024,mn*.22);
  S.r=Math.min(S.r,mn*.5);return S}
// ambient occlusion baked per vertex in the rest pose: every part is a chain of spheres; a vertex is darkened by the parts of its own bone and the
// bones next to it in the chain (fingers by the palm, chin by the neck, crotch by the thighs). Arms are left out of the torso's sum, they move too much.
function rigAO(def,pos,nrm,bone,pidx){const occ=[];
  def.parts.forEach((p,pi)=>{if(p.b>=14)return;const s=p.s,L=Math.max(s[0],s[1],s[2]),ax=s[0]===L?0:s[1]===L?1:2,r=(s[0]+s[1]+s[2]-L)/4,n=Math.max(1,Math.min(5,Math.round(L/(2*r))));
    for(let i=0;i<n;i++){const c=p.c.slice();if(n>1)c[ax]+=((i+.5)/n-.5)*(L-2*r);occ.push(c[0],c[1],c[2],r,p.b,pi)}});
  const rel=(a,b)=>{if(a===b)return true;if((a===1&&(b===3||b===5))||(b===1&&(a===3||a===5)))return false;return PARENT[a]===b||PARENT[b]===a};
  const out=new Float32Array(pos.length/3);
  for(let v=0;v<out.length;v++){const x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2],nx=nrm[v*3],ny=nrm[v*3+1],nz=nrm[v*3+2],b=bone[v],pi=pidx[v];let o=0;
    for(let k=0;k<occ.length;k+=6){if(occ[k+5]===pi||!rel(b,occ[k+4]))continue;const dx=occ[k]-x,dy=occ[k+1]-y,dz=occ[k+2]-z,d2=dx*dx+dy*dy+dz*dz,r=occ[k+3];if(d2>r*r*36)continue;
      const d=Math.sqrt(d2),c=(dx*nx+dy*ny+dz*nz)/d;if(c<=0)continue;o+=c*r*r/Math.max(d2,r*r)}
    out[v]=1-clamp(o*.9,0,.62)}
  return out}
function buildRigGeo(def,atlas,lod){const pos=[],nrm=[],uv=[],bone=[],idx=[],pidx=[];const W=atlas.W,H=atlas.H;
  const fmap={};for(const f of atlas.faces)fmap[f.pi+':'+f.fk]=f;
  const rm=new THREE.Matrix4(),e=new THREE.Euler(),v=new THREE.Vector3();
  def.parts.forEach((p,pi)=>{if(lod&&p.fine)return;const S=partShape(p),[cx,cy,cz]=p.c;const rot=p.rx||p.ry||p.rz;if(rot)rm.makeRotationFromEuler(e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ'));
    rbox(p.s,S,lod,(fk,g)=>{const f=fmap[pi+':'+fk],base=pos.length/3;
      if(rot)for(let k=0;k<g.P.length;k+=3){v.set(g.P[k],g.P[k+1],g.P[k+2]).applyMatrix4(rm);g.P[k]=v.x;g.P[k+1]=v.y;g.P[k+2]=v.z;v.set(g.N[k],g.N[k+1],g.N[k+2]).applyMatrix4(rm);g.N[k]=v.x;g.N[k+1]=v.y;g.N[k+2]=v.z}
      for(let j=0;j<g.nb;j++)for(let i=0;i<g.na;i++){const k=(j*g.na+i)*3;pos.push(g.P[k]+cx,g.P[k+1]+cy,g.P[k+2]+cz);nrm.push(g.N[k],g.N[k+1],g.N[k+2]);
        uv.push((f.x+g.A[i]*f.w)/W,1-(f.y+(1-g.B[j])*f.h)/H);bone.push(p.b);pidx.push(pi)}
      for(let j=0;j<g.nb-1;j++)for(let i=0;i<g.na-1;i++){const v0=base+j*g.na+i,v3=v0+g.na;idx.push(v0,v0+1,v3+1,v0,v3+1,v3)}})});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('aBone',new THREE.Float32BufferAttribute(bone,1));g.setIndex(idx);
  g.setAttribute('aAO',new THREE.Float32BufferAttribute(rigAO(def,pos,nrm,bone,pidx),1));
  for(const k in g.attributes)g.attributes[k].onUpload(freeArr);g.index.onUpload(freeArr);// the GPU copy is all that is needed once uploaded
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,.9,0),2.6);return g}
const VS_SKIN=`attribute float aBone;attribute float aAO;uniform mat4 uBones[19];varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
void main(){vUv=uv;vCol=vec3(aAO);mat4 B=uBones[int(aBone+.5)];vec4 wp=modelMatrix*(B*vec4(position,1.));vPos=wp.xyz;vN=normalize(mat3(modelMatrix)*(mat3(B)*normal));gl_Position=projectionMatrix*viewMatrix*wp;}`;
function depthMatS(uB){return new THREE.ShaderMaterial({uniforms:{uBones:{value:uB},uLP:SHU.uLP,uFar:SHU.uFar,map:{value:null},uAT:{value:0}},vertexShader:VS_SKIN,fragmentShader:FS_DEPTH})}
// ---------- character definitions (all original designs) ----------
const SKIN_C={a:'#c89a78',b:'#a8785a',c:'#e0b898',d:'#7a5038'};
function defHuman(k){
  const o={};let mats,decor,extra=[];
  if(k==='guard'){// 박재원 — quarantine security: navy uniform, black plate carrier, riot helmet
    o.face='visor';mats={top:{base:'#2b3346'},legs:{base:'#262d3e'},sleeve:{base:'#2b3346'},fore:{base:'#2b3346'},shin:{base:'#262d3e'},skin:{base:SKIN_C.a,style:'skin'},hand:{base:'#1c1d20',style:'rubber'},boot:{base:'#18171a',style:'boot'},
      vest:{base:'#1d1f24',style:'plate',gloss:243},helm:{base:'#22262e',style:'plate'},pouch:{base:'#24272c'},visor:{base:'#121820',style:'flat',gloss:254}};
    decor={torso:{front:[['band',.62,.68,'#c8b02a']],back:[['band',.62,.68,'#c8b02a'],['text','SEC',.3,.5,'#c8c8c0']]},
      vest:{front:[['pocket',.08,.08,.3,.42,'#2a2e34'],['pocket',.36,.08,.62,.42,'#2a2e34'],['pocket',.68,.08,.92,.42,'#2a2e34'],['band',.78,.86,'#c8b02a'],['out',0,0,1,1,'#101114']],back:[['out',0,0,1,1,'#101114'],['band',.7,.78,'#c8b02a']]},
      head:{front:[['face','visor',{skin:SKIN_C.a}]],side:[['rect',.35,.38,.55,.58,dk(SKIN_C.a,.15)]],back:[['rect',0,.25,1,.6,'#1a1614']]},
      helm:{front:[['band',.0,.18,'#121418']],side:[['rect',.0,.0,1,.2,'#121418']],all:[['out',0,0,1,1,'#14161a']]},
      pelvis:{fb:[['belt',.7,.95,'#141414','#6a6a62']]},footL:{front:[['laces']]},footR:{front:[['laces']]},shL:{front:[['rect',.15,.55,.85,.95,'#16181c']]},shR:{front:[['rect',.15,.55,.85,.95,'#16181c']]},
      uaL:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},uaR:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},
      visor:{front:[['rect',.04,.6,.16,.82,'#3a4c5c'],['rect',.16,.7,.24,.82,'#26323e'],['out',0,0,1,1,'#0a0c10']],all:[['out',0,0,1,1,'#0a0c10']]}};
    extra=[{n:'vest',b:1,c:[0,1.28,0],s:[.45,.36,.29],m:'vest'},{n:'helm',b:2,c:[0,1.72,0],s:[.27,.14,.29],m:'helm'},{n:'pouchL',b:0,c:[-.19,.93,-.06],s:[.06,.12,.1],m:'pouch'},{n:'radio',b:1,c:[.17,1.36,-.15],s:[.06,.1,.04],m:'pouch'}]}
  else if(k==='medic'){// 엘레나 — field medic: grey-teal coveralls, white helmet, medical pack
    mats={top:{base:'#5e706e'},legs:{base:'#56666a'},sleeve:{base:'#5e706e'},fore:{base:'#5e706e'},shin:{base:'#56666a'},skin:{base:SKIN_C.c,style:'skin'},hand:{base:'#d8dcd4',style:'rubber'},boot:{base:'#2a2622',style:'boot'},
      pack:{base:'#b8bcb0',style:'plate',gloss:244},helm:{base:'#c8ccc4',style:'plate'},hair:{base:'#3a2418',style:'hair'}};
    decor={torso:{front:[['zip',.5],['pocket',.12,.55,.38,.8,'#52625f'],['pocket',.62,.55,.88,.8,'#52625f'],['grime',.4]],back:[['grime',.3]]},
      uaL:{side:[['rect',.15,.45,.85,.8,'#e8e8e0'],['rect',.42,.5,.58,.75,'#2a8a4a'],['rect',.28,.58,.72,.67,'#2a8a4a']]},uaR:{side:[['rect',.15,.45,.85,.8,'#e8e8e0']]},
      head:{front:[['face','woman',{skin:SKIN_C.c,hair:'#3a2418'}],['band',.88,1,'#3a2418']],side:[['rect',0,.4,.35,1,'#3a2418'],['px',.6,.5,dk(SKIN_C.c,.2)]],back:[['rect',0,.15,1,1,'#3a2418']],top:[['rect',0,0,1,1,'#3a2418']]},
      helm:{all:[['out',0,0,1,1,'#8a8e86']],front:[['rect',.4,.25,.6,.75,'#2a8a4a']]},
      pack:{back:[['rect',.38,.35,.62,.7,'#2a8a4a'],['rect',.25,.45,.75,.6,'#2a8a4a'],['out',0,0,1,1,'#6a6e66']],all:[['grime',.3]]},
      pelvis:{fb:[['belt',.7,.92,'#2a2a26','#9a9a90']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'helm',b:2,c:[0,1.735,.005],s:[.26,.11,.28],m:'helm'},{n:'pack',b:1,c:[0,1.25,.19],s:[.32,.36,.14],m:'pack'},{n:'tail',b:2,c:[0,1.58,.15],s:[.06,.14,.06],m:'hair'}];o.headW=.23;o.noseW=.13;o.browH=.018}
  else if(k==='soldier'){// 메이슨 — mercenary: olive camo, tan plate carrier, goggles on helmet
    mats={top:{base:'#4c5436',camo:['#2e3424','#6a6a48']},legs:{base:'#4a5236',camo:['#2c3222','#686844']},sleeve:{base:'#4c5436',camo:['#2e3424','#6a6a48']},fore:{base:'#4c5436',camo:['#2e3424','#6a6a48']},shin:{base:'#4a5236',camo:['#2c3222','#686844']},
      skin:{base:SKIN_C.b,style:'skin'},hand:{base:'#5a4a32',style:'rubber'},boot:{base:'#4a3a28',style:'boot'},vest:{base:'#8a7a58',style:'plate',gloss:242},helm:{base:'#5a5e44',style:'plate'},gog:{base:'#2a2a26'}};
    decor={vest:{front:[['pocket',.06,.06,.3,.45,'#7a6a4a'],['pocket',.36,.06,.64,.45,'#7a6a4a'],['pocket',.7,.06,.94,.45,'#7a6a4a'],['rect',.3,.7,.7,.9,'#6a5a3e']],back:[['pocket',.2,.2,.8,.7,'#7a6a4a']],all:[['grime',.4]]},
      head:{front:[['face','man',{skin:SKIN_C.b,stubble:1,hair:'#1a1410'}]],back:[['rect',0,.3,1,.55,'#1a1410']]},
      helm:{all:[['out',0,0,1,1,'#3a3e2c']]},gog:{front:[['rect',.05,.2,.45,.8,'#5a7088'],['rect',.55,.2,.95,.8,'#5a7088']]},
      pelvis:{fb:[['belt',.7,.95,'#3a3424','#8a8a7a']]},thL:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},thR:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'vest',b:1,c:[0,1.27,0],s:[.46,.38,.3],m:'vest'},{n:'helm',b:2,c:[0,1.735,0],s:[.28,.13,.3],m:'helm'},{n:'gog',b:2,c:[0,1.775,-.12],s:[.2,.05,.05],m:'gog'},{n:'pouchR',b:0,c:[.2,.92,0],s:[.07,.14,.12],m:'vest'}]}
  else{// 서유나 — hazmat technician: yellow suit, gas mask with twin filters, black gloves
    mats={top:{base:'#c8a42a'},legs:{base:'#c09e28'},sleeve:{base:'#c8a42a'},fore:{base:'#c8a42a'},shin:{base:'#1c1c1c',style:'rubber'},skin:{base:'#c8a42a'},hand:{base:'#1a1a1a',style:'rubber'},boot:{base:'#141414',style:'boot'},
      filt:{base:'#2a2c2e',style:'rubber'},tank:{base:'#8a9098',style:'plate'}};
    decor={torso:{front:[['zip',.5],['rect',.12,.7,.42,.82,'#1a1a1a'],['text','HAZ',.14,.82,'#c8a42a'],['grime',.5]],back:[['band',.15,.22,'#1a1a1a'],['grime',.4]]},
      head:{front:[['face','gasmask',{}]],side:[['rect',.1,.1,.9,.75,'#1c1e20']]},
      pelvis:{fb:[['belt',.75,.95,'#1a1a1a','#5a5a5a']]},thL:{all:[['grime',.4]]},thR:{all:[['grime',.4]]},
      tank:{back:[['band',.8,.9,'#c84020']],all:[['out',0,0,1,1,'#5a6068']]}};
    extra=[{n:'filtL',b:2,c:[-.07,1.585,-.15],s:[.07,.07,.06],m:'filt'},{n:'filtR',b:2,c:[.07,1.585,-.15],s:[.07,.07,.06],m:'filt'},{n:'tank',b:1,c:[0,1.27,.18],s:[.2,.34,.12],m:'tank'}];o.headW=.25;o.headD=.27;o.face='mask'}
  const H=humanoid(o);H.parts.push(...extra.map(e=>({n:e.n,b:e.b,c:e.c,s:e.s,m:e.m,f:{}})));
  return Object.assign(H,{key:'h_'+k,mats,decor,ppm:100})}
function defZombie(k,host){const boss=k==='boss';if(boss)k='brute';// the giant: the heavy zombie's body in different colours (scaled up by the game)
  let o={},mats,decor,extra=()=>[];const vein=host||boss?'#ff3020':null,eyeH=host?'#ff3a1a':boss?'#ff5a20':null;
  // shared gore materials: exposed bone, intestine, tumour flesh, nails
  const goreM={bone:{base:'#d4ccae',style:'plate',gloss:243},guts:{base:'#a03a34',style:'meat'},tumor:{base:'#6a3a48',style:'tumor'},nail:{base:'#cfc4a0',style:'plate',gloss:246},flesh:{base:'#8a1c14',style:'flesh'}};
  if(k==='rager'){// 감염자 — a bitten office worker: shirt ripped open over broken ribs, soaked in blood, one eye gouged, jaw hanging loose
    o={hipY:.9,torsoW:.42,torsoD:.23,headZ:-.02,arm2:1,claw:.018,fingL:.56,curl:.45,curlJ:3,ears:[1,0]};const sk='#6e7e62';
    mats=Object.assign({top:{base:'#b4ae9c'},legs:{base:'#2e3444'},sleeve:{base:'#b4ae9c'},fore:{base:sk,style:'zskin',blot:'#4a2a38'},shin:{base:'#2e3444'},skin:{base:sk,style:'zskin',blot:'#4a2a38'},hand:{base:dk(sk,.12),style:'zskin',blot:'#5a1010'},boot:{base:'#221c18',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a2a38'}},goreM);
    decor={torso:{front:[['soak',.25,1,'#5a0808',.9],['ribs',.24,.38,.76,.86,5],['gash',.1,.32,.3,.06,3,.06],['tear',2,7,sk],['grime',.6]],back:[['soak',.45,1,'#4a0606',.75],['tear',2,9,sk],['wounds',2,71],['grime',.6]],side:[['soak',.4,1,'#5a0808',.7],['grime',.5]]},
      neck:{all:[['flesh',.05,.05,.95,.95,1.2],['drip',.5,.35,4,.8]]},
      uaL:{all:[['tear',1,2,sk],['soak',.3,1,'#5a0808',.6],['grime',.5]]},uaR:{all:[['blood',3,5],['grime',.5]]},
      faL:{all:[['flesh',.12,.28,.88,.88,0],['bonep',.35,.45,.65,.7]]},faR:{all:[['bite',.5,.6,.22],['drip',.5,.45,3,.5]]},
      handL:{all:[['soak',0,1,'#5a0808',.85]]},handR:{all:[['soak',0,1,'#4a0606',.9]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8d040',oneEye:1,tears:1,cheek:1}],['gash',.6,.98,.82,.62,2,.07]],top:[['wounds',1,8],['blood',2,8]],side:[['blood',1,9],['drip',.4,.55,2,.6]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.35],['drip',.5,.6,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]],side:[['flesh',.2,.15,.8,.9,0]]},
      thL:{all:[['tear',1,3,sk],['soak',.5,1,'#4a0606',.6],['grime',.6]]},thR:{all:[['grime',.6],['blood',2,11]]},pelvis:{fb:[['belt',.75,.95,'#1a1612','#5a5a50'],['soak',.55,1,'#4a0606',.7]]},
      rib:{all:[['grime',.3]]},spike:{all:[['blood',1,3]]}};
    // broken ribs bursting out of the chest, a bone shard through the left forearm
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2;const L=[];
      for(let r=0;r<3;r++)for(const s of [-1,1])L.push({n:'rib',b:1,c:[s*o.torsoW*.16,sY+o.torsoH*(.72-r*.13),zf-.012],s:[o.torsoW*.22,.02,.026],m:'bone'});
      L.push({n:'rib',b:1,c:[0,sY+o.torsoH*.6,zf-.008],s:[.03,o.torsoH*.34,.02],m:'bone'});
      const el=H.piv[4];L.push({n:'spike',b:4,c:[el[0]-o.armW*.55,el[1]-o.fore*.35,0],s:[.08,.024,.024],m:'bone'});return L}}
  else if(k==='runner'){// 질주체 — flayed and starved: the back skinned down to the spine, a lipless grin, long bone claws
    o={hipY:.97,thigh:.44,legW:.12,legD:.14,shinW:.11,torsoW:.36,torsoD:.2,torsoH:.48,shX:.22,armW:.095,upper:.31,fore:.31,hand:.12,headW:.21,headH:.25,headD:.24,claw:.07,fingL:.6,curl:.3,curlJ:5,nose:false,ears:[0,0]};
    const sk='#8e8c7c';
    mats=Object.assign({top:{base:'#5a1e1a'},legs:{base:'#3a3a38'},sleeve:{base:sk,style:'zskin',blot:'#4a2a48'},fore:{base:sk,style:'zskin',blot:'#4a2a48'},shin:{base:sk,style:'zskin',blot:'#4a2a48'},skin:{base:sk,style:'zskin',blot:'#4a2a48'},hand:{base:dk(sk,.2),style:'zskin',blot:'#5a1010'},boot:{base:dk(sk,.25),style:'zskin'},hair:{base:'#141210',style:'hair'},jaw:{base:sk,style:'zskin',blot:'#4a2a48'}},goreM);
    decor={torso:{front:[['tear',3,4,'#6a5a58'],['ribs',.2,.5,.8,.95,6],['soak',.3,.75,'#4a0606',.8],['veins',4,'#4a3a5a']],back:[['flesh',.04,.04,.96,.98,1.57],['drip',.5,.12,5,.9]],side:[['flesh',0,.3,.6,.9,0],['grime',.4]]},
      head:{front:[['face','runner',{skin:sk,eye:eyeH||'#d8e8ff',tears:1,lipless:1}]],back:[['rect',0,.5,1,1,'#141210'],['flesh',.1,0,.9,.5,0]],top:[['rect',0,0,1,1,'#141210'],['wounds',1,12]],side:[['rect',0,.4,.6,1,'#141210'],['gash',.25,.32,.8,.08,3,.08]],bottom:[['teethrow','bottom',.36]]},
      jaw:{top:[['teethrow','top',.4]],front:[['teethrow','top',.55]],side:[['flesh',0,.2,1,.9,0]],bottom:[['soak',0,1,'#4a0606',.7]]},
      uaL:{all:[['veins',2,'#4a3a5a'],['flesh',.2,.3,.8,.7,1.57]]},uaR:{all:[['veins',2,'#4a3a5a'],['gash',.2,.9,.5,.2,3,.12]]},faL:{all:[['blood',2,3],['bonep',.3,.2,.7,.5]]},faR:{all:[['flesh',.1,.4,.9,.9,1.57]]},
      handL:{all:[['soak',0,1,'#5a0808',.9]]},handR:{all:[['soak',0,1,'#5a0808',.9]]},
      thL:{all:[['tear',2,3,sk],['flesh',.2,.3,.8,.7,1.57]]},thR:{all:[['tear',1,4,sk],['blood',1,6],['gash',.1,.8,.6,.3,3,.1]]},shL:{all:[['bonep',.3,.3,.7,.7]]},vert:{all:[['blood',1,4]]},claw:{all:[['soak',0,.6,'#4a0606',.9]]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],zb=o.belly*.25+(o.torsoD+o.belly)/2;const L=[{n:'hair',b:2,c:[0,H.headC[1]+.035,.06],s:[.23,.16,.2],m:'hair'}];
      for(let i=0;i<6;i++)L.push({n:'vert',b:1,c:[0,sY+.04+i*.075,zb+.012],s:[.05,.045,.03],m:'bone'});
      for(const s of [-1,1])L.push({n:'vert',b:1,c:[s*.085,sY+o.torsoH*.74,zb+.006],s:[.1,.13,.016],m:'bone'});
      return L}}
  else if(k==='brute'){// 거구 — a bloated quarantine patient: belly stitched shut and burst open again, guts hanging to the knees, tumours, bone through the shoulders
    o={hipY:1.0,thigh:.45,legSep:.15,legW:.22,legD:.24,shinW:.2,torsoW:.66,torsoH:.62,torsoD:.4,belly:.08,shX:.4,armW:.19,upper:.34,fore:.34,hand:.14,headW:.22,headH:.24,headD:.25,headZ:-.06,neck:.03,arm2:1.25,footL:.3,claw:.024,curl:.6,curlJ:7,browH:.036,noseW:.2};
    const sk=boss?'#6e5a6a':'#7e6e60';
    mats=Object.assign({top:{base:boss?'#2e2a30':'#b8622a'},legs:{base:boss?'#2a262c':'#a85a28'},sleeve:{base:sk,style:'zskin',blot:'#6a3a42'},fore:{base:sk,style:'zskin',blot:'#6a3a42'},shin:{base:boss?'#2a262c':'#a85a28'},skin:{base:sk,style:'zskin',blot:'#6a3a42'},hand:{base:dk(sk,.2),style:'zskin',blot:'#5a1010'},boot:{base:'#1c1814',style:'boot'},band:{base:'#a8a088'},jaw:{base:sk,style:'zskin',blot:'#6a3a42'}},goreM,{bone:{base:'#c8c0a4',style:'plate',gloss:243}});
    decor={torso:{front:[['text',boss?'Q7-000':'Q7-031',.12,.88,boss?'#b8a8a0':'#2a1a10'],['flesh',.22,.06,.78,.46,0],['stitch',.18,.5,.82,.5],['stitch',.2,.05,.2,.5],['stitch',.8,.05,.8,.5],['soak',0,.55,'#4a0606',.7],['tear',2,2,sk],['grime',.6],['veins',3,'#4a2a2a']],back:[['text','Q7',.38,.72,'#2a1a10'],['rot',3],['tear',2,3,sk],['grime',.6]],side:[['rot',2],['grime',.5]]},
      head:{front:[['face','brute',{skin:sk,eye:eyeH||'#ffb030',tears:1}],['rect',.1,.85,.9,1,dk(sk,.3)],['stitch',.15,.96,.6,.7]],top:[['flesh',.04,.04,.96,.96,0],['bonep',.18,.22,.82,.82]],side:[['blood',1,4],['rot',1]],bottom:[['teethrow','bottom',.34]]},
      jaw:{top:[['teethrow','top',.36]],front:[['teethrow','top',.45],['drip',.5,.5,4,.7]],bottom:[['soak',0,1,'#4a0606',.8]]},
      bone:{all:[['grime',.4],['soak',0,.35,'#5a0808',.8]]},faR:{all:[['rect',0,.3,1,.5,'#a8a088'],['flesh',.1,.55,.9,.95,1.57],['blood',1,7]]},faL:{all:[['rot',2],['gash',.2,.9,.4,.2,3,.1]]},uaR:{all:[['rot',1],['stitch',.5,.1,.5,.9]]},
      thL:{all:[['grime',.6],['soak',.5,1,'#4a0606',.6]]},thR:{all:[['grime',.6],['tear',1,5,sk]]},tumor:{all:[['veins',3,'#2a0a14']]},guts:{all:[['soak',0,1,'#5a0a08',.35]]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2,hc=H.headC;
      const L=[{n:'bone',b:3,c:[-.4,1.67,0],s:[.26,.12,.28],m:'bone'},{n:'bone2',b:5,c:[.42,1.69,0],s:[.3,.14,.3],m:'bone'},{n:'hump',b:1,c:[0,1.62,.12],s:[.4,.2,.24],m:'skin'},
        {n:'tumor',b:1,c:[.17,sY+o.torsoH*.82,zb-.03],s:[.24,.2,.16],m:'tumor'},{n:'tumor',b:2,c:[-.1,hc[1]-.08,o.headZ+.06],s:[.13,.12,.12],m:'tumor'},{n:'tumor',b:5,c:[.5,1.45,.03],s:[.14,.16,.14],m:'tumor'}];
      const gy=sY+o.torsoH*.16;[[.04,0,.09,.1],[.07,-.1,.075,.12],[.05,-.22,.065,.12],[.08,-.33,.055,.1],[.06,-.42,.045,.08]].forEach(([x,dy,wd,hh],i)=>L.push({n:'guts',b:0,c:[x,gy+dy,zf-.035-i*.004],s:[wd,hh,wd*.85],m:'guts'}));
      return L}}
  else if(k==='coffin'){// 관짝 — a dead undertaker: black funeral suit, a coffin strapped to the back with iron bands, nails through the scalp
    o={hipY:.92,torsoW:.38,torsoD:.2,shX:.22,armW:.09,upper:.3,fore:.29,legW:.16,legD:.15,shinW:.12,headW:.22,headH:.28,headD:.24,neck:.1,claw:.03,fingL:.62,curl:.4,curlJ:9,eyeY:.66,noseW:.12};
     const sk='#2a1a15';
     mats=Object.assign({top:{base:'#8b264b'},legs:{base:'#d4cbb8'},sleeve:{base:sk,style:'zskin'},fore:{base:sk,style:'zskin'},shin:{base:sk,style:'zskin'},skin:{base:sk,style:'zskin'},hand:{base:sk,style:'zskin'},boot:{base:sk,style:'zskin'},jaw:{base:sk,style:'zskin'},hair:{base:'#1a1a1a',style:'hair'},cloth:{base:'#e0e0d8',style:'cloth'},doll:{base:'#8b6b45',style:'cloth'}},goreM);
    decor={torso:{front:[['rect',.35,.1,.65,.9,sk],['vband',.2,.3,'#3a1c10'],['vband',.7,.8,'#3a1c10'],['belt',0,.1,'#1a100c','#555'],['soak',0,1,'#111',.3],['blood',2,5]],back:[['grime',.8]]},
      head:{front:[['rect',0,0,1,1,'#111111'],['face','scream',{skin:'#111111',eye:eyeH||'#ffffff',ey:.66,lipless:1}]],top:[['rect',0,0,1,1,'#111111']],back:[['rect',0,0,1,1,'#111111']],bottom:[['rect',0,0,1,1,'#111111']]},
      jaw:{front:[['rect',0,0,1,1,'#111111']],side:[['rect',0,0,1,1,'#111111']],bottom:[['rect',0,0,1,1,'#111111']]},
      uaR:{all:[['band',.5,.8,'#2a1a15'],['rect',.3,.5,.7,.8,'#111'],['grime',.4]]},uaL:{all:[['grime',.4]]},faL:{all:[['band',.85,.95,'#5a1010']]},faR:{all:[['band',.85,.95,'#5a1010']]},legs:{all:[['grime',.6]]}};
    extra=H=>[
      {n:'cMain',b:1,c:[0,1.05,.22],s:[.5,1.1,.12],m:'coffin'},{n:'cArch',b:1,c:[0,1.7,.22],s:[.35,.25,.12],m:'coffin'},
      {n:'cFaceBg',b:1,c:[0,1.65,.28],s:[.2,.25,.04],m:'metal'},{n:'cFace',b:1,c:[0,1.65,.3],s:[.14,.18,.02],m:'cface'},
      {n:'cBlood',b:1,c:[0,1.0,.3],s:[.2,.3,.01],m:'cblood'},{n:'cBase',b:1,c:[0,.45,.22],s:[.55,.15,.14],m:'metal'},
      {n:'pL1',b:1,c:[-.22,1.75,.22],s:[.08,.08,.08],m:'metal'},{n:'pR1',b:1,c:[.22,1.75,.22],s:[.08,.08,.08],m:'metal'},
      {n:'pL2',b:1,c:[-.26,1.55,.22],s:[.08,.08,.08],m:'metal'},{n:'pR2',b:1,c:[.26,1.55,.22],s:[.08,.08,.08],m:'metal'},
      {n:'eArmL',b:1,c:[-.35,1.05,.15],s:[.3,.03,.03],m:'skin'},{n:'eArmR',b:1,c:[.35,1.05,.15],s:[.3,.03,.03],m:'skin'},
      {n:'eHndL',b:1,c:[-.48,.85,.15],s:[.04,.12,.04],m:'skin'},{n:'eHndR',b:1,c:[.48,.85,.15],s:[.04,.12,.04],m:'skin'},
      {n:'cEdgL',b:1,c:[-.25,1.05,.28],s:[.03,1.1,.02],m:'metal'},{n:'cEdgR',b:1,c:[.25,1.05,.28],s:[.03,1.1,.02],m:'metal'}
    ];
  }
  else if(k==='bomber'){// 자폭체 — a swollen chemical-plant worker: overalls split over a belly packed with glowing boils that hiss and leak
    o={hipY:.9,thigh:.42,legSep:.14,legW:.19,legD:.21,shinW:.16,torsoW:.56,torsoH:.56,torsoD:.34,belly:.16,shX:.35,armW:.14,upper:.3,fore:.28,hand:.12,headW:.25,headH:.25,headD:.26,headZ:-.04,neck:.02,claw:.018,curl:.5,curlJ:13,browH:.03,noseW:.17};
    const sk='#9a9e6a';
    mats=Object.assign({top:{base:'#4e5a62'},legs:{base:'#46525a'},sleeve:{base:sk,style:'zskin',blot:'#5a6a2a'},fore:{base:sk,style:'zskin',blot:'#5a6a2a'},shin:{base:'#46525a'},skin:{base:sk,style:'zskin',blot:'#5a6a2a'},hand:{base:dk(sk,.2),style:'zskin',blot:'#3a4a10'},boot:{base:'#2a2622',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#5a6a2a'},
      boil:{base:'#a8c848',style:'tumor'}},goreM);
    decor={torso:{front:[['band',.86,.94,'#c8a42a'],['flesh',.18,.04,.82,.5,0],['veins',6,'#c8ff50',1],['rot',2],['tear',2,13,sk],['soak',0,.45,'#4a5a10',.6],['grime',.6]],back:[['band',.86,.94,'#c8a42a'],['text','Q7-B',.3,.62,'#1a1e20'],['veins',3,'#c8ff50',1],['rot',3],['grime',.6]],side:[['rot',2],['veins',2,'#c8ff50',1],['grime',.5]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#d8ff50',tears:1}],['veins',2,'#c8ff50',1]],top:[['rot',2],['wounds',1,17]],side:[['rot',1],['veins',2,'#c8ff50',1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.4],['drip',.5,.6,3,.7]],bottom:[['soak',0,1,'#4a5a10',.8]]},
      uaL:{all:[['rot',1],['veins',2,'#c8ff50',1]]},uaR:{all:[['rot',1],['grime',.5]]},faL:{all:[['veins',2,'#c8ff50',1]]},faR:{all:[['rot',1]]},
      thL:{all:[['grime',.6],['soak',.6,1,'#4a5a10',.5]]},thR:{all:[['grime',.6],['tear',1,14,sk]]},pelvis:{fb:[['belt',.75,.95,'#1a1612','#8a8a70']]},
      boil:{all:[['veins',2,'#f0ff90',1],['glow',.3,.3,.7,.7,'#c8ff50']]}};
    // boils: a cluster on the belly, more on the chest and back, a shoulder and the scalp
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2,hc=H.headC;
      return [[1,.06,sY+o.torsoH*.22,zf-.05,.22,.2,.14],[1,-.15,sY+o.torsoH*.36,zf-.03,.13,.12,.09],[1,.16,sY+o.torsoH*.5,zf-.02,.1,.1,.07],[1,-.06,sY+o.torsoH*.74,zf-.02,.09,.08,.06],
        [1,-.1,sY+o.torsoH*.55,zb+.03,.17,.16,.1],[1,.14,sY+o.torsoH*.3,zb+.02,.1,.1,.07],[3,-o.shX-.03,H.piv[3][1]+.02,.02,.13,.12,.13],[2,.07,hc[1]+o.headH/2-.01,o.headZ+.03,.1,.07,.1],[2,-.11,hc[1]-.06,o.headZ-.05,.06,.06,.06]]
        .map(([b,x,y,z,w,h,d])=>({n:'boil',b,c:[x,y,z],s:[w,h,d],m:'boil'}))}}
  else if(k==='spitter'){// 산성체 — gaunt and stooped, the throat swollen into a glowing acid sac; the chest burnt through where it drools
    o={hipY:.96,thigh:.45,legW:.12,legD:.13,shinW:.11,torsoW:.34,torsoH:.5,torsoD:.19,shX:.21,armW:.085,upper:.32,fore:.31,hand:.12,headW:.2,headH:.25,headD:.23,headZ:-.06,neck:.13,claw:.04,fingL:.62,curl:.35,curlJ:17,nose:false,ears:[0,0]};
    const sk='#8c9682';
    mats=Object.assign({top:{base:'#8a9a9e'},legs:{base:'#3a3e44'},sleeve:{base:sk,style:'zskin',blot:'#4a5a3a'},fore:{base:sk,style:'zskin',blot:'#4a5a3a'},shin:{base:sk,style:'zskin',blot:'#4a5a3a'},skin:{base:sk,style:'zskin',blot:'#4a5a3a'},hand:{base:dk(sk,.2),style:'zskin',blot:'#3a4a10'},boot:{base:dk(sk,.3),style:'zskin'},jaw:{base:sk,style:'zskin',blot:'#4a5a3a'},
      sac:{base:'#7aa02a',style:'tumor'}},goreM);
    decor={torso:{front:[['soak',.2,1,'#5a8a10',.85],['rot',3],['ribs',.3,.45,.7,.85,5],['tear',3,17,sk],['grime',.5]],back:[['soak',.5,1,'#4a7a10',.6],['tear',2,18,sk],['grime',.5]],side:[['rot',1],['grime',.5]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#c8ff40',cheek:1,tears:1}],['soak',0,.35,'#5a8a10',.8]],top:[['wounds',1,19],['rot',1]],side:[['rot',1]],bottom:[['teethrow','bottom',.36]]},
      jaw:{top:[['teethrow','top',.36]],front:[['teethrow','top',.4],['soak',0,.8,'#5a8a10',.8],['drip',.5,.6,4,.9]],side:[['flesh',0,.2,1,.9,0]],bottom:[['soak',0,1,'#4a7a10',.8]]},
      neck:{all:[['veins',3,'#c8ff40',1],['rot',1]]},uaL:{all:[['rot',1]]},uaR:{all:[['veins',2,'#4a5a3a']]},faL:{all:[['flesh',.2,.3,.8,.8,1.57]]},faR:{all:[['rot',1],['soak',.3,1,'#5a8a10',.7]]},
      handL:{all:[['soak',0,1,'#4a7a10',.85]]},handR:{all:[['soak',0,1,'#4a7a10',.85]]},thL:{all:[['tear',2,19,sk]]},thR:{all:[['grime',.6]]},
      sac:{all:[['veins',4,'#e8ff80',1],['glow',.3,.25,.7,.65,'#c8ff40']]}};
    extra=H=>{const o=H.o,nY=H.piv[2][1];return [{n:'sac',b:2,c:[0,nY+.03,o.headZ-.1],s:[.2,.16,.15],m:'sac'},{n:'sac',b:2,c:[.05,nY-.05,o.headZ-.07],s:[.13,.1,.1],m:'sac'},{n:'sac',b:1,c:[-.06,nY-.12,-.12],s:[.1,.09,.07],m:'sac'}]}}
  else{// 비명체 — eyes stitched shut yet still glowing, a jaw that unhinges to the chest, ribs through a blood-soaked lab coat
    o={hipY:.92,torsoW:.38,torsoD:.2,shX:.22,armW:.09,upper:.3,fore:.29,legW:.16,legD:.15,shinW:.12,headW:.22,headH:.28,headD:.24,neck:.1,claw:.03,fingL:.62,curl:.4,curlJ:9,eyeY:.66,noseW:.12};
    const sk='#2a1a15';
    mats=Object.assign({top:{base:'#8b264b'},legs:{base:'#d4cbb8'},sleeve:{base:sk,style:'zskin'},fore:{base:sk,style:'zskin'},shin:{base:sk,style:'zskin'},skin:{base:sk,style:'zskin'},hand:{base:sk,style:'zskin'},boot:{base:sk,style:'zskin'},jaw:{base:sk,style:'zskin'},hair:{base:'#1a1a1a',style:'hair'},cloth:{base:'#e0e0d8',style:'cloth'},doll:{base:'#8b6b45',style:'cloth'}},goreM);
    decor={
       torso:{front:[['tear',2,4,sk],['band',0,.05,'#111'],['band',.05,.08,'#d4cbb8'],['soak',0,1,'#111',.3],['blood',2,8]],back:[['rect',.4,.2,.6,.8,sk],['tear',2,5,sk],['grime',.6]]},
       head:{front:[['face','scream',{skin:sk,eye:eyeH||'#ff0000',ey:.66,lipless:1}],['band',.55,.75,'#e0e0d8'],['soak',.1,.4,'#880000',.8]],back:[['band',.55,.75,'#e0e0d8']],top:[['rect',0,0,1,1,'#1a1a1a']]},
       jaw:{front:[['teethrow','top',.3],['soak',0,1,'#880000',.9]]},legs:{all:[['grime',.7],['tear',3,2,sk],['tear',2,5,sk]]},
       shin:{all:[['band',.1,.5,'#cdae66'],['band',.15,.2,'#222'],['band',.3,.35,'#222'],['grime',.4]]},uaL:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0']]},uaR:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0']]},
       faL:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0'],['band',0,.2,'#4a3020']]},faR:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0'],['band',0,.2,'#4a3020']]},handL:{all:[['soak',0,1,'#4a3020',.8]]},handR:{all:[['soak',0,1,'#4a3020',.8]]}
    };
     extra=H=>[
       {n:'bun',b:2,c:[0,1.72,-.02],s:[.12,.1,.12],m:'hair'},{n:'knot',b:2,c:[0,1.58,.12],s:[.16,.05,.05],m:'cloth'},
       {n:'earL',b:2,c:[-.12,1.5,0],s:[.02,.05,.02],m:'top'},{n:'earR',b:2,c:[.12,1.5,0],s:[.02,.05,.02],m:'top'},
       {n:'dollB',b:0,c:[-.16,.9,-.12],s:[.06,.1,.05],m:'doll'},{n:'dollH',b:0,c:[-.16,.98,-.12],s:[.05,.05,.05],m:'doll'}
     ];
  }
  if(host||boss){for(const p of Object.keys(decor))for(const fk of ['front','back','all'])if(decor[p][fk])decor[p][fk]=decor[p][fk].concat([['veins',2,vein,1]]);
    decor.torso.front=(decor.torso.front||[]).concat([['veins',4,vein,1]]);decor.torso.back=(decor.torso.back||[]).concat([['veins',3,vein,1]]);}
  o.zombie=1;if(k==='brute')o.eyeSep=.16;const H=humanoid(o);const ex=extra(H);
  // the lower jaw hangs from its own bone so it can gape, chatter and snap
  {const o2=H.o,nY=H.piv[2][1],big=k==='scream';ex.push({n:'jaw',b:11,c:[0,nY+o2.neck-(big?.04:.024),o2.headZ-o2.headD*.14],s:[o2.headW*(big?.78:.8),big?.1:.066,o2.headD*.62],m:'jaw'});
    // stumps for torn-off limbs: raw meat with the bone end showing, hidden on their own bones until needed
    ex.push({n:'stumpN',b:14,c:[0,nY+.012,0],s:[.12,.06,.12],m:'stump'});
    for(const sd of [-1,1]){const aw=o2.armW*(sd>0?o2.arm2:1);ex.push({n:'stumpA'+(sd<0?'L':'R'),b:sd<0?15:16,c:[sd*(o2.shX+aw*.08),H.piv[3][1]+.01,0],s:[aw*1.12,aw*1.12,aw*1.12],m:'stump'});
      ex.push({n:'stumpL'+(sd<0?'L':'R'),b:sd<0?17:18,c:[sd*o2.legSep,H.piv[7][1]-.03,0],s:[o2.legW*1.08,.08,o2.legD*1.08],m:'stump'})}
    mats.stump={base:'#7a1410',style:'flesh'};
    // voodoo zombie: a pinned rag doll gripped by its legs in the right fist (both hands on it), used as a club
    if(k==='scream'){for(let i=ex.length-1;i>=0;i--)if(/^doll/.test(ex[i].n))ex.splice(i,1);// a doll hanging from the belt moves into the hands
      const [hx,hy]=H.hand;const D=(n,x,y,z,w,h,d,m)=>ex.push({n,b:6,c:[hx+x,hy+y,z],s:[w,h,d],m});
      D('vdLegs',0,0,-.04,.05,.045,.08,'vdoll');D('vdBody',0,0,-.13,.08,.06,.11,'vdoll');D('vdHead',0,.004,-.225,.085,.075,.08,'vdoll');
      D('vdArm',-.058,0,-.15,.04,.03,.03,'vdoll');D('vdArm',.058,0,-.15,.04,.03,.03,'vdoll');
      for(const [x,z,h] of [[-.018,-.215,.07],[.02,-.235,.06],[.012,-.12,.065]]){D('vdPin',x,.03+h/2,z,.006,h,.006,'vpin');D('vdPinH',x,.032+h,z,.016,.016,.016,'vpinH')}
      mats.vdoll={base:'#9a7646'};mats.vpin={base:'#c8ccd0',style:'plate',gloss:248};mats.vpinH={base:'#b01414',style:'plate',gloss:246};
      Object.assign(decor,{vdBody:{all:[['stitch',.5,.05,.5,.95],['grime',.5]],top:[['rect',.3,.35,.7,.7,'#7a1010'],['stitch',.5,.05,.5,.95]]},
        vdHead:{all:[['grime',.4]],top:[['stitch',.15,.45,.42,.75],['stitch',.15,.75,.42,.45],['stitch',.58,.45,.85,.75],['stitch',.58,.75,.85,.45],['stitch',.3,.22,.7,.22]]},
        vdLegs:{all:[['stitch',.5,0,.5,1],['grime',.6]]},vdArm:{all:[['grime',.5]]}})}if(!decor.claw)decor.claw={all:[['soak',0,.7,'#3a0606',.8]]};
    decor.nose=decor.nose||{all:[['grime',.5]],bottom:[['rect',0,0,1,1,'#2a0606']]};decor.brow=decor.brow||{all:[['grime',.5]],bottom:[['rect',0,0,1,1,dk(mats.skin.base,.5)]]};
    Object.assign(decor,{stumpN:{top:[['flesh',0,0,1,1,.5],['bonep',.36,.36,.64,.64]],fb:[['flesh',0,.2,1,1,0],['drip',.5,.4,3,.9]],side:[['flesh',0,.2,1,1,0]]},
      stumpAL:{all:[['flesh',0,0,1,1,.8]],left:[['bonep',.32,.32,.68,.68]],bottom:[['drip',.5,.6,4,.9]]},stumpAR:{all:[['flesh',0,0,1,1,.8]],right:[['bonep',.32,.32,.68,.68]],bottom:[['drip',.5,.6,4,.9]]},
      stumpLL:{all:[['flesh',0,0,1,1,1.57]],bottom:[['bonep',.3,.3,.7,.7]]},stumpLR:{all:[['flesh',0,0,1,1,1.57]],bottom:[['bonep',.3,.3,.7,.7]]}})}
  H.parts.push(...ex.map(e=>({n:e.n,b:e.b,c:e.c,s:e.s,m:e.m,f:{}})));
  return Object.assign(H,{key:'z_'+(boss?'boss':k)+(host?'_h':''),mats,decor,ppm:k==='brute'?82:100})}
const CHAR_ASSETS={};
function charAsset(key){let A=CHAR_ASSETS[key];if(A)return A;
  const [t,k,h]=key.split('_');const def=t==='h'?defHuman(k):defZombie(k,h==='h');const atlas=paintSkin(def);
  const tex=new THREE.CanvasTexture(atlas.cv);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  A=CHAR_ASSETS[key]={def,geo:buildRigGeo(def,atlas,0),geoLo:buildRigGeo(def,atlas,1),tex,piv:def.piv,la:def.la,lb:def.lb,canvas:atlas.cv,faces:atlas.faces};return A}
// ---------- per-character instance ----------
function makeChar(key){const A=charAsset(key);const uB=[],R=[],M=[];for(let i=0;i<NB;i++){uB.push(new THREE.Matrix4());R.push(new THREE.Matrix4());M.push(new THREE.Matrix4())}
  const mat=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:A.tex},uBones:{value:uB},uProbe:{value:new THREE.Color(.4,.4,.45)},uFlash:{value:0},uTint:{value:new THREE.Vector4(0,0,0,0)},uEmisA:{value:1},
    uTexel:{value:new THREE.Vector2(1/A.canvas.width,1/A.canvas.height)},uBump:{value:2.2}},LU),vertexShader:VS_SKIN,fragmentShader:FS_CHAR,extensions:{derivatives:true}});
  const mesh=new THREE.Mesh(A.geo,mat);mesh.layers.enable(1);const grp=new THREE.Group();grp.add(mesh);
  return {key,A,grp,mesh,mat,uB,R,M,hide:STUMPS,root:new THREE.Vector3(),gun:null,gunM:new THREE.Matrix4(),gunM2:new THREE.Matrix4(),gunOn2:false,headW:new THREE.Vector3(),handW:new THREE.Vector3()}}
const _t4=new THREE.Matrix4(),_e3=new THREE.Euler(),_q4=new THREE.Matrix4(),_z3=new THREE.Vector3(0,0,0);
// hidden bones (torn-off limbs, unused stumps) collapse to their joint: zero-area triangles draw nothing
function rigCompute(ch){const P=ch.A.piv,hid=ch.hide;
  for(let i=0;i<NB;i++){const M=ch.M[i],p=PARENT[i];
    if(p<0){M.copy(ch.R[0]);M.setPosition(P[0][0]+ch.root.x,P[0][1]+ch.root.y,P[0][2]+ch.root.z)}
    else{_t4.copy(ch.R[i]);_t4.setPosition(P[i][0]-P[p][0],P[i][1]-P[p][1],P[i][2]-P[p][2]);M.multiplyMatrices(ch.M[p],_t4)}
    ch.uB[i].copy(M);if(hid>>i&1)ch.uB[i].scale(_z3);else{_t4.makeTranslation(-P[i][0],-P[i][1],-P[i][2]);ch.uB[i].multiply(_t4)}}}
// tear a limb off a rig: its bones collapse and the stump under it appears (rigCompute applies the mask)
function severLimb(ch,key){const S=SEVER[key];if(!S||(ch.hide>>S.root&1))return false;for(const b of S.bones)ch.hide|=1<<b;ch.hide&=~(1<<S.stump);return true}
function setE(m,x,y,z){_e3.set(x,y,z,'XYZ');m.makeRotationFromEuler(_e3);return m}
// two-bone IK. S shoulder, T target (parent space). Writes upper/fore local rotations.
const _ia=new THREE.Vector3(),_ib=new THREE.Vector3(),_id=new THREE.Vector3(),_ie=new THREE.Vector3(),_if=new THREE.Vector3(),_ip=new THREE.Vector3();
function ik2(S,T,la,lb,hint,RU,RF){
  _id.subVectors(T,S);const L=_id.length();const Lc=clamp(L,Math.abs(la-lb)+.02,la+lb-.004);_id.multiplyScalar(1/Math.max(L,1e-6));
  const cosA=clamp((la*la+Lc*Lc-lb*lb)/(2*la*Lc),-1,1),A=Math.acos(cosA),cosE=clamp((la*la+lb*lb-Lc*Lc)/(2*la*lb),-1,1),E=Math.acos(cosE);
  _ie.copy(hint).addScaledVector(_id,-hint.dot(_id));if(_ie.lengthSq()<1e-6)_ie.set(0,-1,0);_ie.normalize();
  _ia.copy(_id).multiplyScalar(cosA).addScaledVector(_ie,Math.sin(A));// upper arm direction
  _if.copy(_id).multiplyScalar(Lc).addScaledVector(_ia,-la).normalize();// forearm direction
  _ip.copy(_if).addScaledVector(_ia,-_if.dot(_ia));if(_ip.lengthSq()<1e-8)_ip.set(0,0,-1);_ip.normalize();
  _ib.crossVectors(_ia,_ip);// local X
  RU.makeBasis(_ib,_ia.clone().negate(),_ip.clone().negate());RF.makeRotationX(Math.PI-E)}
// ---------- animation curves ----------
// keyframe tracks [[t,[...channels]],...]: cubic Hermite through the keys (Catmull-Rom tangents), at rest at both ends.
// Keys placed close together make fast strokes, so a swing can wind up slowly, whip through and settle.
function kfv(K,t,out){const n=K.length,d=K[0][1].length;
  if(t<=K[0][0]){for(let c=0;c<d;c++)out[c]=K[0][1][c];return out}if(t>=K[n-1][0]){for(let c=0;c<d;c++)out[c]=K[n-1][1][c];return out}
  let i=1;while(t>K[i][0])i++;const t1=K[i-1][0],t2=K[i][0],dt=t2-t1,u=(t-t1)/dt,u2=u*u,u3=u2*u;const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
  for(let c=0;c<d;c++){const p1=K[i-1][1][c],p2=K[i][1][c];const m1=i>1?(p2-K[i-2][1][c])/(t2-K[i-2][0])*dt:0;const m2=i<n-1?(K[i+1][1][c]-p1)/(K[i+1][0]-t1)*dt:0;out[c]=h00*p1+h10*m1+h01*p2+h11*m2}return out}
function kf1(K,t){const n=K.length;if(t<=K[0][0])return K[0][1];if(t>=K[n-1][0])return K[n-1][1];let i=1;while(t>K[i][0])i++;
  const t1=K[i-1][0],t2=K[i][0],dt=t2-t1,u=(t-t1)/dt,u2=u*u,u3=u2*u;const p1=K[i-1][1],p2=K[i][1];const m1=i>1?(p2-K[i-2][1])/(t2-K[i-2][0])*dt:0,m2=i<n-1?(K[i+1][1]-p1)/(K[i+1][0]-t1)*dt:0;
  return (2*u3-3*u2+1)*p1+(u3-2*u2+u)*m1+(-2*u3+3*u2)*p2+(u3-u2)*m2}
// sudden twitch: a sharp snap then a slow ease back, at random moments; returns -1..1
function jerk(t,seed,period,chance){const x=t/period+seed*.37;const i=Math.floor(x),f=x-i;if(hash2(i,seed,7)>(chance==null?.5:chance))return 0;const a=f<.04?f/.04:Math.exp(-(f-.04)*7);return a*(hash2(i,seed,8)<.5?-1:1)}
const _kv=[0,0,0,0,0,0],_kv2=[0,0,0,0,0,0];
// ---------- poses ----------
// st: {spd, phase, mvF, mvS, crouch, air, land, accel, turnRate, pitch, hold, kick, reload, relKind, shellP, brk, sprint, dead, deadT, deadDir, reviving,
//      flinch, flinchX, t, seed, atk, atkSide, heavy, zclass, skill, stun, turn, frenzy}
const _gs=new THREE.Matrix4(),_gs2=new THREE.Matrix4(),_sh2=new THREE.Vector3(),_gt=new THREE.Vector3(),_gv=new THREE.Vector3(),_sh=new THREE.Vector3(),_hintR=new THREE.Vector3(.75,-1,.55),_hintL=new THREE.Vector3(-.9,-1,.35),_ga=new THREE.Vector3(),_gb=new THREE.Vector3();
// ---------- locomotion ----------
// One gait cycle covers strideLen(speed) metres and the stride clock (game.js) advances with distance travelled, so a planted foot
// slides back under the hip at exactly the body's speed: feet stay put on the ground. Each foot follows a stance / swing path
// (heel strike -> flat -> heel rise -> toe-off -> swing arc) and the legs reach it through analytic two-bone IK with ankle roll.
const STRIDE_K=[[0,.9],[1.6,1.3],[2.7,1.7],[5,2.2],[6.5,2.5],[8.5,2.8]];
function strideLen(sp){const K=STRIDE_K;for(let i=1;i<K.length;i++)if(sp<=K[i][0])return lerp(K[i-1][1],K[i][1],clamp((sp-K[i-1][0])/(K[i][0]-K[i-1][0]),0,1));return K[K.length-1][1]}
function legScale(A){const P=A.piv;return (P[7][1]-P[12][1])/.83}
// thigh = Rx(thX)·Rz(thZ), knee = Rx(kn); target relative to the hip joint, in the pelvis frame
const LEG={thX:0,thZ:0,kn:0};
function legIK(tx,ty,tz,a,b){const L=Math.hypot(tx,ty,tz),Lc=clamp(L,Math.abs(a-b)+.03,a+b-.0004);
  const ck=clamp((Lc*Lc-a*a-b*b)/(2*a*b),-1,1),kn=-Math.acos(ck),A=Math.max(.03,a+b*ck),B=b*Math.sin(kn);
  const thZ=Math.asin(clamp(tx/A,-.9,.9)),Ac=A*Math.cos(thZ);
  LEG.thX=wrapA(Math.atan2(tz,ty)-Math.atan2(-B,-Ac));LEG.thZ=thZ;LEG.kn=kn;return LEG}
// ankle offset when the foot pitches g (toe up > 0) about its heel (g > 0) or its toe (g < 0) instead of lying flat
const _pv=[0,0];
function pivot(g,hb,tf,ah){const c=Math.cos(g),s=Math.sin(g);if(g>=0){_pv[0]=-hb+hb*c-ah*s;_pv[1]=hb*s+ah*c-ah}else{_pv[0]=tf-tf*c-ah*s;_pv[1]=-tf*s+ah*c-ah}return _pv}
const GAIT={drop:0,sway:0,twist:0,roll:0,arm:0,run:0,amp:0};
const LEGS=[{h:7,k:8,f:12,off:0,sd:-1},{h:9,k:10,f:13,off:Math.PI,sd:1}];
const _ft=[{x:0,y:0,z:0,g:0,st:false,s:0},{x:0,y:0,z:0,g:0,st:false,s:0}],_lv=new THREE.Vector3(),_lm=new THREE.Matrix4();
function gait(ch,st,cfg,rootZ,steps){const R=ch.R,A=ch.A,P=A.piv,FT=A.def.foot,ph=st.phase,spd=st.stun>0?0:st.spd,sc=P[0][1]/.93;
  const run=clamp((spd-2.6)/2.6,0,1)*(cfg.runK==null?1:cfg.runK),amp=clamp(spd/2.4,0,1),mw=smooth(clamp((spd-.12)/.7,0,1));
  const crouch=st.crouch||0,air=st.air||0,land=st.land||0;
  const mvF=st.mvF==null?1:st.mvF,mvS=st.mvS||0;const ml=Math.hypot(mvF,mvS);const cA=ml>.2?mvF/ml:1,sA=ml>.2?mvS/ml:0;
  const C=st.stride||strideLen(spd)*legScale(A),beta=lerp(.6,.31,run),halfS=C*beta*.5;
  const a=P[7][1]-P[8][1],b=P[8][1]-P[12][1],hjY=P[7][1],ah=FT.ah,hb=FT.hb,tf=FT.tf,reach=a+b-.012;
  const roll=Math.max(0,cA)*(1-crouch*.6),gH=lerp(.3,.1,run)*roll,gT=lerp(.66,.95,run)*roll;
  const lift=(cfg.knee||1)*(1-crouch*.45),wide=((cfg.wide||1)-1)*.03+crouch*.05+Math.abs(sA)*.075*mw;
  const walk=1-run;
  GAIT.sway=walk*.024*amp*Math.cos(ph)*(cfg.sway||1);
  GAIT.twist=-(.1+.13*run)*amp*Math.sin(ph)*(cfg.twist||1)*cA;
  GAIT.roll=(.045*walk+.02)*amp*Math.sin(ph)*(cfg.roll||1)+(cfg.limp?.07*amp*Math.max(0,Math.sin(ph)):0);
  GAIT.arm=(.3+.6*run)*amp*Math.sin(ph);GAIT.run=run;GAIT.amp=amp;
  // 1) foot targets in model space
  let need=0,runBob=0;
  for(let i=0;i<2;i++){const L=LEGS[i],F=_ft[i],px=P[L.h][0];let u=((ph+L.off)/TAU-.25)%1;if(u<0)u+=1;
    const limp=cfg.limp&&L.sd<0;let d,ly=0,g,pf,py;
    if(u<beta){const s=u/beta;F.st=true;F.s=s;d=halfS*(1-2*s);
      const s1=lerp(.16,.08,run),s2=lerp(.5,.3,run);g=s<s1?gH*(1-smooth(s/s1)):s<s2?0:-gT*Math.pow((s-s2)/(1-s2),1.6)*(limp?.45:1);
      const pv=pivot(g,hb,tf,ah);pf=pv[0];py=pv[1];runBob=Math.max(runBob,.022+.042*Math.sin(Math.PI*s))}
    else{const w=(u-beta)/(1-beta),w1=1-w;F.st=false;F.s=w;
      const g0=-gT*(limp?.45:1),g3=gH;let pv=pivot(g0,hb,tf,ah);const p0f=pv[0],p0y=pv[1];pv=pivot(g3,hb,tf,ah);
      // heel kicks up behind (more when running), the knee drives through, the foot reaches past the strike point and pulls back onto the heel
      const k1=lift*(limp?.22:1),D1=-halfS-(.03+.13*run),D2=halfS+.09+.07*run,Y1=(.09+.44*run)*k1,Y2=(.05+.17*run)*k1;
      d=w1*w1*w1*-halfS+3*w1*w1*w*D1+3*w1*w*w*D2+w*w*w*halfS;ly=3*w1*w1*w*Y1+3*w1*w*w*Y2;
      pf=lerp(p0f,pv[0],w);py=lerp(p0y,pv[1],w);
      g=kf1([[0,g0],[.3,lerp(-.12,-1.2,run)*roll-(limp?.3:0)],[.78,g3*.6],[1,g3]],w)}
    // gait target, blended with the idle stance at low speed and a tuck in the air
    let fx=px+L.sd*wide+d*sA*.55*mw,ff=d*cA*mw+pf*mw,fy=ah+(ly+py)*mw;g*=mw;
    {// idle stance; while turning on the spot each foot keeps its own world yaw and is lifted as it shuffles round
      let ix=px+L.sd*(.025+wide),iz=-(L.sd<0?.035:-.03);const fyo=st.footYaw;let il=0;
      if(fyo){const t=fyo[i];if(t){const c=Math.cos(t),s2=Math.sin(t),x2=ix*c+iz*s2;iz=-ix*s2+iz*c;ix=x2}il=fyo[2+i]||0}
      fx=lerp(ix,fx,mw);ff+=(1-mw)*-iz;fy+=il*(1-mw);if(il>.01)F.st=false}
    if(air>0){const k=air;fx=lerp(fx,px+L.sd*.03,k);ff=lerp(ff,L.sd<0?.12:-.07,k);fy=lerp(fy,ah+(L.sd<0?.33:.19)*(1-crouch*.5),k);g=lerp(g,L.sd<0?-.35:-.6,k);F.st=false}
    if(steps){const sf=steps[i*2]||0,sy=steps[i*2+1]||0;ff+=sf*sc;fy+=sy*sc;if(sy>.012)F.st=false;g+=sy*1.5-Math.max(0,-sf)*.4}
    F.x=fx;F.y=fy;F.z=-ff;F.g=g;
    if(F.st){const dx=fx-px-GAIT.sway*sc,dz=ff+(rootZ||0)*sc,h=reach*reach-dx*dx-dz*dz;if(h>0)need=Math.max(need,hjY-(fy+Math.sqrt(h)))}}
  // 2) pelvis height: low enough for planted feet, plus the run's mid-stance sink, crouch and landing absorb
  const bob=(cfg.bob||1)*mw*(run*(runBob>0?runBob:.018)+walk*.006)+.01;
  let drop=sc*(crouch*.57+land*.17)+bob*sc+(cfg.limp?.03*amp*Math.max(0,Math.sin(ph))*sc:0);
  drop=Math.max(drop,need*(1-air)*.92);GAIT.drop=drop/sc;
  // 3) legs
  setE(R[0],0,GAIT.twist,GAIT.roll);const S=solveLegs(ch,GAIT.sway*sc,-drop,(rootZ||0)*sc,_ft,0);
  for(let i=0;i<2;i++){const L=LEGS[i],o=S[i];setE(R[L.h],o.x,cfg.limp&&L.sd<0?.12*amp:0,o.z);setE(R[L.k],o.k,0,0);setE(R[L.f],o.f,0,-o.z*.8)}
  return GAIT}
// IK both legs to foot targets F (model space) for the pelvis rotation already in R[0] and root offset (ox,oy,oz); pelvisX = pelvis pitch
const _la=[{x:0,z:0,k:0,f:0},{x:0,z:0,k:0,f:0}];
function solveLegs(ch,ox,oy,oz,F,pelvisX){for(let i=0;i<2;i++)solveLeg(ch,i,ox,oy,oz,F[i],pelvisX);return _la}
function solveLeg(ch,i,ox,oy,oz,f,pelvisX){const R=ch.R,P=ch.A.piv,a=P[7][1]-P[8][1],b=P[8][1]-P[12][1],L=LEGS[i],o=_la[i];_lm.copy(R[0]).transpose();
  _lv.set(f.x-ox,f.y-P[0][1]-oy,f.z-oz).applyMatrix4(_lm);_lv.x-=P[L.h][0]-P[0][0];_lv.y-=P[L.h][1]-P[0][1];_lv.z-=P[L.h][2]-P[0][2];
  const s=legIK(_lv.x,_lv.y,_lv.z,a,b);o.x=s.thX;o.z=s.thZ;o.k=s.kn;o.f=wrapA(f.g-pelvisX-s.thX-s.kn);return o}
// model-space ankle position of leg i from the rotations currently in R (forward kinematics), root offset (ox,oy,oz)
const _fv=new THREE.Vector3();
function ankleAt(ch,i,ox,oy,oz){const P=ch.A.piv,R=ch.R,L=LEGS[i];
  _fv.set(P[L.f][0]-P[L.k][0],P[L.f][1]-P[L.k][1],P[L.f][2]-P[L.k][2]).applyMatrix4(R[L.k]);
  _fv.x+=P[L.k][0]-P[L.h][0];_fv.y+=P[L.k][1]-P[L.h][1];_fv.z+=P[L.k][2]-P[L.h][2];_fv.applyMatrix4(R[L.h]);
  _fv.x+=P[L.h][0]-P[0][0];_fv.y+=P[L.h][1]-P[0][1];_fv.z+=P[L.h][2]-P[0][2];_fv.applyMatrix4(R[0]);
  return _fv.set(_fv.x+P[0][0]+ox,_fv.y+P[0][1]+oy,_fv.z+P[0][2]+oz)}
// footwork for attacks: forward offset of a foot along a keyframe track, lifted while it moves
const _stp=[0,0,0,0];
function stepTrack(K,a,i){const f=kf1(K,a),dv=(kf1(K,Math.min(1,a+.012))-kf1(K,Math.max(0,a-.012)))/.024;_stp[i*2]=f;_stp[i*2+1]=clamp(Math.abs(dv)*.035,0,.13);return _stp}
// ---- third-person action curves (offsets in the weapon's hold frame: x,y,z, rx,ry,rz) ----
const KF={
  // knife: forehand slash right-to-left, backhand rising slash, heavy stab; twist = shoulder rotation
  knifeA:[[0,[0,0,0,0,0,0]],[.2,[.12,.12,.12,.35,1.05,-.45]],[.3,[.08,.08,.02,.25,.6,-.2]],[.42,[-.2,-.03,-.3,-.18,-.55,.4]],[.56,[-.3,-.1,-.2,-.35,-1.05,.65]],[.78,[-.1,-.04,-.05,-.12,-.35,.2]],[1,[0,0,0,0,0,0]]],
  knifeB:[[0,[0,0,0,0,0,0]],[.2,[-.22,-.06,-.02,-.15,-.95,.45]],[.3,[-.18,-.02,-.12,-.08,-.6,.3]],[.42,[.08,.06,-.3,.18,.5,-.35]],[.56,[.18,.12,-.18,.32,.95,-.6]],[.78,[.06,.04,-.05,.1,.3,-.2]],[1,[0,0,0,0,0,0]]],
  knifeH:[[0,[0,0,0,0,0,0]],[.28,[0,.12,.2,.55,.2,0]],[.36,[0,.13,.21,.55,.2,0]],[.46,[-.03,.02,-.45,-.15,0,0]],[.6,[-.03,0,-.48,-.15,0,0]],[.8,[0,0,-.15,0,0,0]],[1,[0,0,0,0,0,0]]],
  twistA:[[0,0],[.2,.4],[.3,.3],[.42,-.3],[.56,-.5],[.78,-.15],[1,0]],twistB:[[0,0],[.2,-.45],[.3,-.3],[.42,.3],[.56,.45],[.78,.12],[1,0]],
  lungeH:[[0,0],[.28,.12],[.36,.12],[.46,-.3],[.6,-.3],[.8,-.08],[1,0]],
  // hip shift and foot steps (forward metres of the lead foot) for strikes and throws
  shiftK:[[0,0],[.22,.025],[.42,-.05],[.7,-.03],[1,0]],lungeAxe:[[0,0],[.3,.05],[.5,-.1],[.75,-.07],[1,0]],
  stepStab:[[0,0],[.26,-.03],[.4,.3],[.72,.3],[1,0]],stepAxe:[[0,0],[.25,-.04],[.42,.2],[.78,.18],[1,0]],stepAxeH:[[0,0],[.32,-.06],[.5,.34],[.82,.3],[1,0]],
  stepThrow:[[0,0],[.3,-.08],[.52,.26],[.85,.2],[1,0]],stepClaw:[[0,0],[.28,-.03],[.46,.24],[.8,.2],[1,0]],stepClawH:[[0,0],[.36,-.05],[.52,.38],[.84,.32],[1,0]],
  // axe: wind up behind the shoulder, chop down through, recover
  axeA:[[0,[0,0,0,0,0,0]],[.26,[.04,.14,.12,.95,.25,0]],[.34,[.04,.15,.12,1,.25,0]],[.46,[-.04,-.04,-.2,-1.1,-.15,0]],[.6,[-.05,-.1,-.12,-1.6,-.25,0]],[.8,[-.02,-.04,-.03,-.5,-.1,0]],[1,[0,0,0,0,0,0]]],
  axeH:[[0,[0,0,0,0,0,0]],[.34,[0,.22,.16,1.35,0,0]],[.44,[0,.23,.16,1.4,0,0]],[.56,[-.02,-.06,-.26,-1.5,0,0]],[.7,[-.02,-.14,-.16,-2,0,0]],[.86,[0,-.04,-.04,-.6,0,0]],[1,[0,0,0,0,0,0]]],
  axeSpine:[[0,0],[.3,.18],[.4,.2],[.56,-.42],[.7,-.36],[.88,-.1],[1,0]],
  // sledge (two hands): diagonal sweep from the right shoulder; heavy = lifted high overhead and brought straight down
  hamA:[[0,[0,0,0,0,0,0]],[.3,[.12,.22,.16,1.25,.7,0]],[.4,[.12,.23,.16,1.3,.72,0]],[.52,[-.06,-.02,-.3,-1.0,-.45,0]],[.66,[-.08,-.14,-.2,-1.8,-.6,0]],[.84,[-.03,-.05,-.05,-.6,-.2,0]],[1,[0,0,0,0,0,0]]],
  hamH:[[0,[0,0,0,0,0,0]],[.38,[0,.3,.22,1.8,0,0]],[.48,[0,.31,.22,1.85,0,0]],[.58,[-.02,-.08,-.34,-1.8,0,0]],[.72,[-.02,-.2,-.22,-2.4,0,0]],[.9,[0,-.05,-.05,-.7,0,0]],[1,[0,0,0,0,0,0]]],
  // grenade: wind up high behind the head, whip through, follow through low
  throw:[[0,[0,0,0,0,0,0]],[.32,[.05,.26,.32,1.5,.35,-.25]],[.48,[.06,.28,.34,1.65,.35,-.25]],[.6,[-.04,.06,-.38,-.6,-.2,.1]],[.78,[-.09,-.16,-.28,-1.1,-.35,.2]],[1,[0,0,0,0,0,0]]],
  throwTwist:[[0,0],[.32,.45],[.48,.5],[.6,-.4],[.78,-.5],[1,0]],throwLean:[[0,0],[.32,.16],[.48,.18],[.6,-.25],[.78,-.32],[1,0]],
  // magazine change: gun tilts in, support hand strips the mag, fetches a new one from the belt, seats it with a slap, works the action
  relGun:[[0,[0,0,0,0,0,0]],[.12,[.02,-.05,.04,-.1,.12,.5]],[.7,[.02,-.06,.05,-.12,.14,.55]],[.78,[.02,-.035,.04,-.04,.1,.42]],[.88,[0,-.02,.02,0,.05,.18]],[1,[0,0,0,0,0,0]]],
  relBrk:[[0,[0,0,0,0,0,0]],[.12,[0,-.03,.05,-.55,.1,.15]],[.72,[0,-.04,.05,-.6,.12,.18]],[.8,[0,.02,0,.25,0,0]],[.88,[0,0,0,-.05,0,0]],[1,[0,0,0,0,0,0]]],
  // zombie claw swipe (striking arm channels: shoulder X, shoulder Z out, elbow, spine twist, spine pitch, jaw)
  clawA:[[0,[0,0,0,0,0,0]],[.26,[1.5,.55,1.3,.38,.16,.45]],[.34,[1.62,.6,1.4,.4,.18,.55]],[.48,[-.35,-.3,-.9,-.42,-.38,1.05]],[.62,[-.85,-.4,-.75,-.3,-.3,.85]],[.82,[-.3,-.1,-.3,-.1,-.1,.3]],[1,[0,0,0,0,0,0]]],
  clawH:[[0,[0,0,0,0,0,0]],[.36,[1.8,.3,1.2,0,.28,.9]],[.46,[1.9,.32,1.3,0,.3,1.05]],[.58,[-.4,-.2,-.9,0,-.62,1.15]],[.74,[-.75,-.25,-.8,0,-.52,.9]],[.9,[-.2,-.05,-.2,0,-.15,.3]],[1,[0,0,0,0,0,0]]],
};
function poseHuman(ch,st){const R=ch.R,A=ch.A,P=A.piv;const sc=P[0][1]/.93;ch.gunOn2=false;setE(R[11],0,0,0);
  if(st.dead>0){poseDead(ch,st);return}
  const H=st.hold,a=st.atk||0,crouch=st.crouch||0;
  // footwork: the lead (left) foot steps into stabs, chops and throws while the hips drive forward
  let rootZ=0,steps=null;_stp.fill(0);
  if(H&&a>0){if(H.kind==='melee'&&!H.rx){if(st.heavy){rootZ=kf1(KF.lungeH,a)*.45;steps=stepTrack(KF.stepStab,a,0)}else rootZ=kf1(KF.shiftK,a)}
    else if(H.kind==='melee'){rootZ=kf1(KF.lungeAxe,a)*(st.heavy?1.4:1);steps=stepTrack(st.heavy?KF.stepAxeH:KF.stepAxe,a,0)}
    else if(H.kind==='nade'){rootZ=kf1(KF.lungeAxe,a)*.8;steps=stepTrack(KF.stepThrow,a,0)}}
  const g=gait(ch,st,{},rootZ,steps);
  // body: lean into the run and into acceleration, bank into turns, breathe, flinch away from hits
  const breathe=Math.sin(st.t*1.7)*.012;let lean=-(.05+.17*g.run)*g.amp-crouch*.12-(st.accel||0)*.06+breathe;let twistAct=0;
  if(H&&a>0){if(H.kind==='melee'&&!H.rx){if(st.heavy){lean+=kf1(KF.lungeH,a)}else twistAct=kf1(st.atkSide>0?KF.twistA:KF.twistB,a)}
    else if(H.kind==='melee'&&H.rx)lean+=kf1(KF.axeSpine,a);
    else if(H.kind==='nade'){twistAct=kf1(KF.throwTwist,a);lean+=kf1(KF.throwLean,a)}}
  ch.root.set(g.sway*sc,-g.drop*sc,rootZ*sc);
  const spP=clamp(st.pitch*.35,-.35,.4)+lean+(st.flinch||0)*.32;const bank=clamp(-(st.turnRate||0)*.035,-.12,.12)-(st.flinchX||0)*.18;
  // positive twistAct = right shoulder drawn back (wind-up), negative = driven through
  setE(R[0],0,g.twist,g.roll);setE(R[1],spP,-g.twist*1.3-twistAct,-g.roll*.8+bank);
  setE(R[2],clamp(st.pitch-spP,-.7,.7)*.7-(st.flinch||0)*.25,g.twist*.4+twistAct*.6,-bank*.5);
  if(!H){const fl=.15+1.05*g.run*g.amp;setE(R[3],-g.arm-.05,0,-.1-.06*g.amp);setE(R[4],fl+Math.max(0,-g.arm)*.35,0,0);setE(R[5],g.arm-.05,0,.1+.06*g.amp);setE(R[6],fl+Math.max(0,g.arm)*.35,0,0);ch.gunOn=false;return}
  // weapon frame in spine space: from the shoulder, pitched to the aim, then the hold offset and the current action
  const sR=_sh.set(P[5][0]-P[1][0],P[5][1]-P[1][1],P[5][2]-P[1][2]);const pr=st.pitch-spP;
  const sprint=st.sprint||0,rel=st.reload||0;
  const act=_kv;act.fill(0);
  if(a>0&&H.kind==='melee'){kfv(H.ham?(st.heavy?KF.hamH:KF.hamA):H.rx?(st.heavy?KF.axeH:KF.axeA):(st.heavy?KF.knifeH:(st.atkSide>0?KF.knifeA:KF.knifeB)),a,act)}
  else if(a>0&&H.kind==='nade'){kfv(KF.throw,a,act)}
  else if(rel>0&&st.relKind==='mag'){kfv(st.brk?KF.relBrk:KF.relGun,rel,act);const slap=Math.exp(-Math.pow((rel-.76)/.025,2));act[1]+=slap*.018;act[3]+=slap*.08}
  else if(st.relKind==='shell'||st.relKind==='start'){const k=st.relKind==='start'?smooth(clamp(st.shellP||0,0,1)):1;act[1]=-.04*k;act[3]=-.06*k;act[5]=.32*k;act[0]=.02*k;if(st.relKind==='shell'){const q=st.shellP||0;act[1]+=Math.sin(q*Math.PI)*.012}}
  // walking bob of the gun and a low-ready carry while sprinting
  const bob=Math.sin(st.phase*2)*.008*g.amp;act[1]+=bob;act[3]+=Math.sin(st.phase)*.03*g.amp;
  if(sprint>0&&!(a>0)){act[0]+=.06*sprint;act[1]-=.1*sprint;act[2]+=.06*sprint;act[3]-=.55*sprint;act[4]+=.55*sprint;act[5]+=.35*sprint}
  const gunXf=(out,sh,mirror,kick)=>{out.makeTranslation(sh.x,sh.y,sh.z);_t4.makeRotationX(pr+(kick||0)*.14);out.multiply(_t4);
    const k2=(kick||0)*(kick||0);_t4.makeTranslation(H.off[0]*mirror+act[0]*mirror,H.off[1]+act[1],H.off[2]+act[2]+k2*.06);out.multiply(_t4);
    _e3.set(act[3],act[4]*mirror,act[5]*mirror,'XYZ');_t4.makeRotationFromEuler(_e3);out.multiply(_t4);
    if(H.rx){_t4.makeRotationX(H.rx);out.multiply(_t4);if(H.rz){_t4.makeRotationZ(H.rz);out.multiply(_t4)}}};
  gunXf(_gs,sR,1,st.kick);ch.gunM.copy(_gs);ch.gunOn=true;
  _gt.set(H.grip[0],H.grip[1],H.grip[2]).applyMatrix4(_gs);_gv.set(sR.x,sR.y,sR.z);ik2(_gv,_gt,A.la,A.lb,_hintR,R[5],R[6]);
  const sL=_sh2.set(P[3][0]-P[1][0],P[3][1]-P[1][1],P[3][2]-P[1][2]);
  if(H.dual){gunXf(_gs2,sL,-1,st.kick2);ch.gunM2.copy(_gs2);ch.gunOn2=true;_gt.set(H.grip[0],H.grip[1],H.grip[2]).applyMatrix4(_gs2);_gv.copy(sL);ik2(_gv,_gt,A.la,A.lb,_hintL,R[3],R[4]);return}
  if(H.sup){// support hand: on the handguard, or following the reload path
    const toG=(x,y,z,out)=>out.set(x,y,z).applyMatrix4(_gs);const sup=H.sup,mg=H.mag||sup;
    if(rel>0&&st.relKind==='mag'){const pouch=_gb.set(-.15,-.14,-.04);const r=rel;
      const W=[[0,toG(sup[0],sup[1],sup[2],new THREE.Vector3())],[.12,toG(mg[0]-.02,mg[1]-.02,mg[2],new THREE.Vector3())],[.3,toG(mg[0]-.02,mg[1]-.18,mg[2]+.04,new THREE.Vector3())],[.46,pouch.clone()],[.6,toG(mg[0]-.02,mg[1]-.14,mg[2]+.02,new THREE.Vector3())],[.74,toG(mg[0]-.02,mg[1]-.02,mg[2],new THREE.Vector3())],
        [.86,st.brk?toG(sup[0],sup[1],sup[2],new THREE.Vector3()):toG(-.035,.075,.02,new THREE.Vector3())],[1,toG(sup[0],sup[1],sup[2],new THREE.Vector3())]];
      let i=1;while(i<W.length-1&&r>W[i][0])i++;const u=smooth(clamp((r-W[i-1][0])/(W[i][0]-W[i-1][0]),0,1));_gt.copy(W[i-1][1]).lerp(W[i][1],u)}
    else if(st.relKind==='shell'||st.relKind==='start'){const q=st.relKind==='start'?0:(st.shellP||0);const port=toG(mg[0],mg[1]+.02,mg[2]+.04,_ga),pouch=_gb.set(-.14,-.12,-.05);
      const u=q<.45?smooth(q/.45):q<.65?1:1-smooth((q-.65)/.35);_gt.copy(pouch).lerp(port,u)}
    else if(a>0&&H.kind==='nade'){_gt.set(-.1,.18,-.4)}
    else toG(sup[0],sup[1],sup[2],_gt);
    _gv.copy(sL);ik2(_gv,_gt,A.la,A.lb,_hintL,R[3],R[4])}
  else{// one-handed: the free arm counterbalances swings and throws
    let x=.15-g.arm*.6,fl=.35+.4*g.run;if(a>0&&H.kind==='melee'){x+=.5*Math.sin(a*Math.PI);fl+=.4*Math.sin(a*Math.PI)}if(a>0&&H.kind==='nade'){x=kf1([[0,.15],[.32,1.3],[.5,1.35],[.62,-.2],[.8,-.3],[1,.15]],a);fl=.5}
    setE(R[3],x,0,-.12);setE(R[4],fl,0,0)}}
// zombie class motion profiles
const ZGAIT={coffin:{stride:.92,knee:.8,runK:.65,bob:1.35,twist:1.3,roll:1.15},rager:{stride:.95,knee:.85,runK:.75,limp:1,bob:1.1,twist:1.2},runner:{stride:1.15,knee:1.4,runK:1.2,bob:1.2,twist:1.3},brute:{stride:1.05,knee:.7,runK:.6,bob:1.6,wide:3,twist:1.6,roll:1.4},scream:{stride:.9,knee:.9,runK:.7,sway:1.6,roll:1.5}};
// doll bash (third person): [shoulders forward, elbows, spine pitch, jaw, twist]
KF.vdA=[[0,[0,0,0,0,0]],[.25,[2.1,.9,.18,.25,.1]],[.34,[2.2,.95,.2,.3,.1]],[.45,[-.5,-.3,-.38,.65,-.05]],[.62,[-.55,-.25,-.3,.5,-.05]],[1,[0,0,0,0,0]]];
KF.vdH=[[0,[0,0,0,0,0]],[.32,[2.5,1,.25,.35,0]],[.44,[2.6,1.05,.28,.4,0]],[.55,[-.65,-.35,-.55,.9,0]],[.72,[-.7,-.3,-.45,.7,0]],[1,[0,0,0,0,0]]];
const JAW0={coffin:.14,rager:.12,runner:.3,brute:.08,scream:.34,bomber:.1,spitter:.3};
Object.assign(ZGAIT,{bomber:{stride:.85,knee:.7,runK:.6,bob:1.5,wide:2.5,twist:1.2,roll:1.6},spitter:{stride:1.05,knee:1.1,runK:.9,bob:1.2,twist:1.4,sway:1.2},boss:{stride:2.3,knee:.7,runK:.6,bob:1.6,wide:3,twist:1.6,roll:1.4}});
function poseZombie(ch,st){const R=ch.R,P=ch.A.piv;const sc=P[0][1]/.93;
  if(st.dead>0){poseDead(ch,st);return}
  const t=st.t,z=st.zclass==='boss'?'brute':st.zclass,sd=st.seed||0,cfg=ZGAIT[z]||ZGAIT.rager;const turn=st.turn>0?Math.min(1,st.turn):0;
  // the screamer lurches: its gait clock speeds up and slows down within each stride
  const st2=z==='scream'?Object.assign({},st,{phase:st.phase+.4*Math.sin(st.phase)}):st;
  const a=st.atk||0,heavy=st.heavy,side=st.atkSide>0?1:-1;
  let rootZ=0,steps=null;_stp.fill(0);
  if(a>0){rootZ=kf1([[0,0],[.3,.04],[.5,-.14],[.7,-.1],[1,0]],a)*(heavy?1.6:1);steps=stepTrack(heavy?KF.stepClawH:KF.stepClaw,a,side>0?0:1)}
  const g=gait(ch,st2,cfg,rootZ,steps);
  ch.root.set(g.sway*sc,-g.drop*sc,rootZ*sc);
  // twitches: the head snaps sideways, a shoulder jerks; frequency differs per class
  const jH=jerk(t,sd,z==='runner'?1.1:1.7,.55),jH2=jerk(t+.3,sd+3,2.3,.45),jS=jerk(t,sd+7,2.9,.4);
  const hunch={coffin:-.34,rager:-.24,runner:-.52*g.amp-.14,brute:-.22,scream:-.1,bomber:-.04,spitter:-.4}[z]||-.2;
  let spP=hunch-g.run*.12*(z==='runner'?1.6:1)+(st.flinch||0)*.45+(st.stun>0?.2:0),twist=0,spR=Math.sin(t*1.1+sd)*.05;
  let aL,aR,zL,zR,fL,fR;// shoulder X (forward), shoulder Z (out), elbow flex
  if(z==='runner'){aL=-.45-g.arm*1.3*(g.amp>.2?1:0)+(1-g.amp)*.45;aR=-.45+g.arm*1.3*(g.amp>.2?1:0)+(1-g.amp)*.45;zL=-.18;zR=.18;fL=fR=1.25+.2*g.run}
  else if(z==='brute'){aL=.22-g.arm*.75+Math.sin(t*1.6)*.05;aR=.28+g.arm*.75+Math.sin(t*1.8)*.05;zL=-.35;zR=.42;fL=fR=.45}
  else if(z==='scream'){aL=aR=.72+g.arm*.1;zL=.3;zR=-.3;fL=fR=.62;spR+=Math.sin(st.phase)*.08*g.amp}// both hands on the doll in front of the belly
  else if(z==='bomber'){aL=.42+Math.sin(t*1.4+sd)*.07-g.arm*.55;aR=.46+Math.sin(t*1.6+sd)*.07+g.arm*.55;zL=-.46;zR=.46;fL=fR=.5}// arms held out round the belly
  else if(z==='spitter'){aL=.3+Math.sin(t*1.3+sd)*.08-g.arm*.45;aR=.26+Math.sin(t*1.5+sd*2)*.08+g.arm*.45;zL=-.14;zR=.16;fL=.75;fR=.8}
  else{// rager: reaching, grasping hands that open and close
    aL=1.02+Math.sin(t*1.7+sd)*.1-g.arm*.25;aR=.95+Math.sin(t*1.9+sd*2)*.1+g.arm*.25;zL=-.1;zR=.12;fL=.3+Math.max(0,Math.sin(t*2.6+sd))*.25;fR=.25+Math.max(0,Math.sin(t*2.2+sd*3))*.3}
  if(st.frenzy){aL=-.3-g.arm;aR=-.3+g.arm;fL=fR=1.1;spP-=.25}
  if(st.air&&z==='runner'){aL=aR=2.2;zL=-.35;zR=.35;fL=fR=.4;spP-=.2}
  aR+=jS*.35*(jS>0?1:0);aL+=jS*.35*(jS<0?-1:0);
  let jaw=JAW0[z]||.12;jaw+=(z==='runner'?.12:.06)*Math.pow(Math.max(0,Math.sin(t*19+sd)),3);if(jH!==0)jaw+=Math.abs(jH)*.35;
  // claw swipe: wind up high and back, whip down across the body, follow through low; heavy: both arms smash down
  // voodoo zombie: both arms raise the doll overhead and club it down
  if(a>0&&z==='scream'){const c=kfv(heavy?KF.vdH:KF.vdA,a,_kv2);aL+=c[0];aR+=c[0];fL+=c[1];fR+=c[1];spP+=c[2];jaw+=c[3];twist+=c[4]}
  else if(a>0){const c=kfv(heavy?KF.clawH:KF.clawA,a,_kv2);
    if(heavy){aL+=c[0];aR+=c[0];zL-=c[1];zR+=c[1];fL+=c[2]*.8;fR+=c[2]*.8;spP+=c[4]}
    else if(side>0){aR+=c[0];zR+=c[1];fR+=c[2];twist-=c[3];spP+=c[4];aL+=-c[0]*.15}else{aL+=c[0];zL-=c[1];fL+=c[2];twist+=c[3];spP+=c[4];aR+=-c[0]*.15}
    jaw+=c[5]}
  if(st.skill>0&&z==='scream'){const k=Math.min(1,st.skill*2.5);const tr=Math.sin(t*60)*.05;aL=lerp(aL,.45,k);aR=lerp(aR,.45,k);zL=lerp(zL,-1.25+tr,k);zR=lerp(zR,1.25-tr,k);fL=fR=lerp(fL,-.1,k);spP=lerp(spP,.32,k);jaw=lerp(jaw,1.3+tr*2,k)}
  // coffin zombie: both arms drive the coffin down in front
  if(st.skill>0&&z==='coffin'){const k=Math.min(1,st.skill*2.2);aL=lerp(aL,2.3,k);aR=lerp(aR,2.3,k);zL=lerp(zL,.2,k);zR=lerp(zR,-.2,k);fL=fR=lerp(fL,.25,k);spP=lerp(spP,-.45,k);jaw=lerp(jaw,1,k)}
  // bomber about to burst: arms thrown wide, shaking, mouth open; spitter: rears back, then lunges the acid out
  if(st.skill>0&&z==='bomber'){const k=Math.min(1,st.skill*3),tr=Math.sin(t*50)*.08;aL=lerp(aL,1.2+tr,k);aR=lerp(aR,1.2-tr,k);zL=lerp(zL,-1.1,k);zR=lerp(zR,1.1,k);fL=fR=lerp(fL,.25,k);spP=lerp(spP,.3,k);jaw=lerp(jaw,1.35,k)}
  if(st.skill>0&&z==='spitter'){const p=1-Math.min(1,st.skill/.55);spP+=kf1([[0,0],[.3,.4],[.5,-.55],[.8,-.4],[1,0]],p);jaw=Math.max(jaw,kf1([[0,.3],[.3,.7],[.45,1.45],[.8,1.2],[1,.3]],p))}
  if(st.skill>0&&z==='brute'){const k=Math.min(1,st.skill*2);aL=lerp(aL,1.45,k);aR=lerp(aR,1.45,k);zL=lerp(zL,.45,k);zR=lerp(zR,-.45,k);fL=fR=lerp(fL,1.6,k);spP=lerp(spP,-.32,k);jaw=lerp(jaw,.7,k)}
  if(turn>0){const j=Math.sin(t*31)*.5+Math.sin(t*17)*.5;aL=.3+j*.8*turn;aR=.4-j*.7*turn;zL=-.9*turn;zR=.9*turn;fL=fR=1.2*turn;spP=-.55*turn+Math.sin(t*23)*.25*turn;twist=Math.sin(t*13)*.4*turn;jaw=.4+Math.abs(Math.sin(t*11))*.8*turn}
  setE(R[0],0,g.twist,g.roll);setE(R[1],spP,-g.twist*1.2+twist,-g.roll*.7+spR-(st.flinchX||0)*.25);
  const hp=clamp(st.pitch*.6-spP*.85,-.6,.9)+(st.skill>0&&z==='scream'?.6:0)+(turn?Math.sin(t*29)*.5:0)-(st.flinch||0)*.3;
  setE(R[2],hp+jH2*.2,Math.sin(t*1.3+sd)*.12+jH*.45+(turn?Math.sin(t*19)*.4:0),Math.sin(t*.9+sd)*.12+jH*.5+(z==='scream'?.25:0));
  setE(R[3],aL,0,zL);setE(R[4],Math.max(-.05,fL),0,0);setE(R[5],aR,0,zR);setE(R[6],Math.max(-.05,fR),0,0);
  setE(R[11],-clamp(jaw,0,1.45),0,0);ch.gunOn=false;ch.gunOn2=false}
// death: the knees buckle with the feet still planted, then the body topples with gravity, slams down, bounces once and settles
// flat on its back or face; arms, legs and head land in a pose that differs per body. Zombie corpses keep twitching.
const _ftD=[{x:0,y:.07,z:0,g:0},{x:0,y:.07,z:0,g:0}];
function poseDead(ch,st){const R=ch.R,P=ch.A.piv,o=ch.A.def.o;const sc=P[0][1]/.93;const dir=st.deadDir||1,sd=st.seed||0;
  const v1=hash2(sd,1,91)-.5,v2=hash2(sd,2,91)-.5,v3=hash2(sd,3,91)-.5,v4=hash2(sd,4,91)-.5,v5=hash2(sd,5,91),v6=hash2(sd,6,91);
  let e,buck,whip=0,bounce=0;const T=st.deadT||0;
  if(st.reviving){e=smooth(clamp(st.dead,0,1));buck=e}
  else{buck=smooth(clamp(T/.2,0,1));const f=clamp((T-.12)/.46,0,1);e=f*f;whip=Math.sin(f*Math.PI);if(T>.58){const u=T-.58;bounce=Math.exp(-u*9)*Math.sin(u*28)*.09}}
  const pre=buck*(1-e);// the sag before the fall
  const lieY=Math.max(.12,(o.torsoD+o.belly)/2+.012),pX=dir*(e*1.57+bounce);
  setE(R[0],pX,v1*.6*e,(v2*.4+dir*.1)*e);
  ch.root.set(v3*.15*e*sc,-e*(P[0][1]-lieY)-pre*.27*sc,(e*.35*dir+pre*.05)*sc);
  // torso folds over the buckling knees, then whips; flat on the ground at the end
  setE(R[1],-pre*.28+dir*whip*.3+dir*e*.05,v4*.35*e,v2*.2*e);
  setE(R[2],-pre*.35+dir*whip*.4-dir*e*.1,e*(v1>0?.75:-.75)+v3*.25*e,e*v4*.5);
  // arms fly up while falling, then flop onto the ground: wide, along the body or up beside the head
  const zL=-(.25+v5*2.1),zR=.25+v6*2.1,dn=-dir*(.04+Math.abs(v2)*.07);
  setE(R[3],whip*1.1*dir+e*dn+pre*.2,0,lerp(-.12,zL,e));setE(R[4],e*(.2+Math.abs(v3)*.9)+whip*.5+pre*.3,0,0);
  setE(R[5],whip*1.2*dir+e*dn+pre*.25,0,lerp(.12,zR,e));setE(R[6],e*(.15+Math.abs(v1)*.8)+whip*.4+pre*.3,0,0);
  // legs: on its back the heels rest on the ground with the knees up a little; face down the lower legs lift and the feet point
  const a=P[7][1]-P[8][1],b=P[8][1]-P[12][1],fk=[[0,0,0,0],[0,0,0,0]];
  for(let i=0;i<2;i++){const vv=i?v4:v1,ww=i?v1:v2;let th,kn,ft;
    if(dir>0){th=.06+(vv+.5)*.3;kn=Math.asin(clamp((-.06*sc-a*Math.sin(th))/b,-1,1))-th;ft=-.5-ww*.5}
    else{th=-.06-(vv+.5)*.12;kn=-(.12+(ww+.5)*.55);ft=-1.15-vv*.3}
    fk[i][0]=e*th;fk[i][1]=e*(i?1:-1)*(.12+Math.abs(i?v2:v3)*.28);fk[i][2]=e*kn;fk[i][3]=e*ft}
  const wP=1-smooth(clamp(e/(st.reviving?.5:.3),0,1));
  if(wP>0){const F=_ftD;F[0].x=P[7][0]-.015;F[0].z=-.03;F[1].x=P[9][0]+.015;F[1].z=.04;F[0].y=F[1].y=.07;F[0].g=F[1].g=0;
    const S=solveLegs(ch,ch.root.x,ch.root.y,ch.root.z,F,pX);
    for(let i=0;i<2;i++){const q=fk[i],r=S[i];q[0]=lerp(q[0],r.x,wP);q[1]=lerp(q[1],r.z,wP);q[2]=lerp(q[2],r.k,wP);q[3]=lerp(q[3],r.f,wP)}}
  setE(R[7],fk[0][0],0,fk[0][1]);setE(R[8],fk[0][2],0,0);setE(R[12],fk[0][3],0,0);
  setE(R[9],fk[1][0],0,fk[1][1]);setE(R[10],fk[1][2],0,0);setE(R[13],fk[1][3],0,0);
  // the ground stops the feet: a leg that would swing through the floor folds at the knee instead
  for(let i=0;i<2;i++){const p=ankleAt(ch,i,ch.root.x,ch.root.y,ch.root.z);if(p.y<.075){const L=LEGS[i],F=_ftD[i];F.x=p.x;F.y=.075;F.z=p.z;F.g=0;
    const r=solveLeg(ch,i,ch.root.x,ch.root.y,ch.root.z,F,pX);setE(R[L.h],r.x,0,r.z);setE(R[L.k],r.k,0,0)}}
  setE(R[11],-.55*e-.3*whip-pre*.2,0,0);
  if(st.zombie&&!st.reviving&&T>.9&&T<5){const k=Math.exp(-(T-.9)*.7);const jA=jerk(T,sd,.23,.6)*k,jB=jerk(T+.1,sd+5,.31,.5)*k,jC=jerk(T,sd+9,.41,.5)*k;
    _q4.makeRotationX(jA*.7);R[5].multiply(_q4);_q4.makeRotationX(-Math.abs(jB)*.9);R[10].multiply(_q4);_q4.makeRotationY(jC*.6);R[2].multiply(_q4);_q4.makeRotationX(jB*.5);R[3].multiply(_q4);_q4.makeRotationX(-jA*.3);R[11].multiply(_q4);
    _q4.makeRotationX(jC*.5);R[13].multiply(_q4)}
  ch.gunOn=false;ch.gunOn2=false}
// world-space head centre and approximate head radius for hit tests
const _hv=new THREE.Vector3();
function charHead(ch,out){const A=ch.A;const c=A.def.headC;_hv.set(c[0],c[1],c[2]).applyMatrix4(ch.uB[2]);out.copy(_hv).applyMatrix4(ch.grp.matrixWorld);return out}

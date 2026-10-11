'use strict';
// ============ Chapter 3 map "녹슨 제철소" (the rusted steel works): four zones played in order ============
// A  scrap yard (outdoors)                     x -75..-25  z -45..0   → the rail yard's gate (gate gA)
// B  rail yard                                 x -25..35   z -32..-3  → the stair cage up to the conveyor (gate gB)
// C  raw-material conveyor gallery, 8 m up     x -15..35   z -3..2    → the door into the blast-furnace hall (gate gC)
// D  blast-furnace hall + casting bay          x -40..32   z 2..42    ← 18 m roof: the slag yard (west), blast furnace No. 2 with
//    its 5 m and 10 m catwalks (middle), the casting bay with the ladle on its crane (east)
// Dusk going to night, ash drifting down like snow; the furnace's red aviation lamp and the chimney can be seen from every zone.
// Gates are boxes drawn as their own meshes and solid until opened (gW: the gallery wall KHEPRI bursts through).
Object.assign(MATS,{
  e3dirt:{t:'e3dirt',s:2.5,k:'soft'},e3grav:{t:'e3grav',s:2.5,k:'soft'},e3track:{t:'e3track',s:2.6,k:'soft'},e3floor:{t:'e3floor',s:2,k:'metal'},e3conc:{t:'e3conc',s:2.5,k:'stone'},
  e3wall:{t:'e3wall',s:3,k:'stone'},e3wallY:{t:'e3wallY',s:2.5,k:'stone'},e3corr:{t:'e3corr',s:2,k:'metal'},e3rust:{t:'e3rust',s:2,k:'metal'},e3scrap:{t:'e3scrap',s:3,k:'metal'},
  e3carA:{t:'e3carA',uv:'boxV',s:4,k:'metal'},e3carB:{t:'e3carB',uv:'boxV',s:4,k:'metal'},e3carC:{t:'e3carC',uv:'boxV',s:4,k:'metal'},e3carD:{t:'e3carD',uv:'boxV',s:4,k:'metal'},e3yel:{t:'e3yel',s:1,k:'metal'},
  e3wagon:{t:'e3wagon',uv:'boxV',s:4,k:'metal'},e3coil:{t:'e3coil',s:1,k:'metal'},e3coilE:{t:'e3coilE',uv:'box',k:'metal'},e3loco:{t:'e3loco',s:2,k:'metal'},e3ftank:{t:'e3ftank',uv:'boxV',s:12,k:'metal'},
  e3brick:{t:'e3brick',s:2,k:'stone'},e3shell:{t:'e3shell',s:3,k:'metal'},e3grate:{t:'e3grate',s:1,k:'metal'},e3belt:{t:'e3belt',s:2,k:'soft'},e3roof:{t:'e3roof',s:3,k:'metal'},
  e3tank:{t:'e3tank',uv:'boxV',s:9.6,k:'metal'},e3gpipe:{t:'e3gpipe',s:1,k:'metal'},e3cab:{t:'e3cab',uv:'box',emis:.35,k:'metal'},e3pour:{t:'e3pour',uv:'box',emis:.12,k:'stone'},
  e3moltS:{t:'e3moltS',s:1,emis:1.2,k:'stone'},e3slag:{t:'e3slag',s:2,emis:.4,k:'stone'},e3iron:{t:'e3iron',s:1,k:'metal'},e3mold:{t:'e3mold',s:1.5,k:'metal'},e3panel:{t:'e3panel',s:2,k:'metal'},
  e3trough:{t:'e3trough',s:1,k:'stone'},e3gate:{t:'e3gate',uv:'box',k:'metal'},e3col:{t:'e3col',s:1,k:'metal'},e3win:{t:'e3win',uv:'box',emis:.6,k:'glass'},e3mag:{t:'e3mag',s:1,k:'metal'},
  e3wood:{t:'e3wood',s:2,k:'wood'},e3wheel:{t:'e3wheel',uv:'box',emis:.15,k:'metal'},
  e3sMill:{t:'e3sMill',uv:'box',emis:.3,k:'metal'},e3sYard:{t:'e3sYard',uv:'box',emis:.25,k:'metal'},e3sWeigh:{t:'e3sWeigh',uv:'box',emis:.25,k:'metal'},e3sRail:{t:'e3sRail',uv:'box',emis:.25,k:'metal'},
  e3sFuel:{t:'e3sFuel',uv:'box',emis:.25,k:'metal'},e3sHot:{t:'e3sHot',uv:'box',emis:.3,k:'metal'},e3sBF:{t:'e3sBF',uv:'box',emis:.3,k:'metal'},e3sCast:{t:'e3sCast',uv:'box',emis:.3,k:'metal'},
  e3sConv:{t:'e3sConv',uv:'box',emis:.25,k:'metal'},e3sSig:{t:'e3sSig',uv:'box',emis:.25,k:'metal'},e3sCab:{t:'e3sCab',uv:'box',emis:.3,k:'metal'},
});
// ---------- textures (painted on first load) ----------
// scrap-yard ground: oily packed dirt, rust flakes, shiny bits of metal, tyre ruts
function texE3Dirt(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x>>1,y>>1,3011);let t=P.n(x,y,30,3012,4)*.9+h*.2-.05;let c=dith(P,x,y,t,['#1e1a16','#26201a','#2e271f','#372e24','#41362a','#4b3e30'],.14);
    const r=P.n(x,y,14,3013,3);if(r>.64)c=mix(c,'#5a2e16',clamp((r-.64)*2.4,0,.75));if(h>.985)c='#8a8a84';else if(h<.02)c='#121010';P.set(x,y,c)}
  for(let i=0;i<8;i++)stain(P,hash2(i,1,3014)*N,hash2(i,2,3014)*N,14+hash2(i,3,3014)*30,10+hash2(i,4,3014)*20,.32,3015+i);
  for(let k=0;k<2;k++)for(let y=0;y<N;y++){const x=Math.round(90+k*30+Math.sin(y*.018+k)*24);for(let w=0;w<10;w++)P.mul(x+w,y,.85)}})}
// rail-yard ballast: crushed grey stone, rust dust, weeds
function texE3Grav(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x>>2,y>>2,3021),hh=hash2(x,y,3022);let t=P.n(x,y,20,3023,3)*.55+h*.5+(hh-.5)*.12;
    let c=dith(P,x,y,t,['#2c2a28','#363432','#403e3a','#4a4844','#55524d','#605c56'],.12);if((x&3)===0||(y&3)===0)c=dk(c,.18);const r=P.n(x,y,24,3024,3);if(r>.62)c=mix(c,'#5e3a22',clamp((r-.62)*2,0,.6));P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,3025)*N,hash2(i,2,3025)*N,8+hash2(i,3,3025)*16,6+hash2(i,4,3025)*12,.28,3026+i)})}
// a track: ballast, four timber sleepers per 2.6 m, two rails along u (the tops at v = .25 and .75; 3D rails sit on them)
function texE3Track(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x>>2,y>>2,3031);let t=P.n(x,y,20,3032,3)*.5+h*.5;let c=dith(P,x,y,t,['#2a2826','#33312e','#3c3a36','#46433e','#504c46'],.12);if((x&3)===0||(y&3)===0)c=dk(c,.18);
    const sx=x%64;if(sx>8&&sx<30&&y>22&&y<234){const g=P.n(x*.3,y*2.5,30,3033+Math.floor(x/64),3);c=mix('#3a2a1c','#24180e',clamp(g*1.2-.1,0,1));if(y%40<2)c='#1a120a';if(hash2(x,y,3034)<.02)c='#5a5048'}
    if(Math.abs(y-64)<5||Math.abs(y-192)<5)c=Math.abs(y-64)<2||Math.abs(y-192)<2?'#8a8278':'#4a3a2e';P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,3035)*N,hash2(i,2,3035)*N,10+hash2(i,3,3035)*20,6+hash2(i,4,3035)*12,.35,3036+i)})}
// the hall's floor: cast-iron chequer plates in 1 m squares, soot, a lighter scuffed path, spatter of old iron
function texE3Floor(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const lx=x%128,ly=y%128;let t=P.n(x,y,48,3041,4)*.8+.1+(hash2(x,y,3042)-.5)*.08;
    const ch=((lx>>3)+(ly>>3))&1,d=((lx&7)===3&&(ly&7)===3)||((lx&7)===4&&(ly&7)===4);if(d)t+=ch?.22:-.12;
    let c=dith(P,x,y,t,['#1a1a1c','#222224','#2a2a2c','#333334','#3c3c3c','#454543'],.1);if(lx<2||ly<2)c='#0e0e10';const r=P.n(x,y,18,3043,3);if(r>.66)c=mix(c,'#5a3220',clamp((r-.66)*2.2,0,.6));P.set(x,y,c)}
  for(let i=0;i<14;i++)stain(P,hash2(i,1,3044)*N,hash2(i,2,3044)*N,6+hash2(i,3,3044)*20,5+hash2(i,4,3044)*14,.35,3045+i);
  for(let i=0;i<40;i++){const cx=hash2(i,5,3046)*N,cy=hash2(i,6,3046)*N;for(let k=0;k<6;k++)P.set(Math.round(cx+(hash2(k,i,3047)-.5)*8),Math.round(cy+(hash2(k,i,3048)-.5)*8),'#6a6a66',.7)}})}
function texE3Conc(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,3051,4)*1.05-.05+(hash2(x,y,3052)-.5)*.08;let c=dith(P,x,y,t,['#2e2d2a','#363532','#3f3d39','#484641','#514e48'],.1);if(x%128<2||y%128<2)c='#1c1b19';P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,3053)*N,hash2(i,2,3053)*N,10+hash2(i,3,3053)*30,8+hash2(i,4,3053)*22,.4,3054+i)})}
// the hall's walls: sooty concrete with a band of blackened brick at the foot, heat streaks
function texE3Wall(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,3061,4)*1.1-.1+(hash2(x,y,3062)-.5)*.06;let c=dith(P,x,y,t,['#201e1c','#282522','#302c28','#38332e','#403a34','#48413a'],.1);
    if(x%128<2)c=dk(c,.3);if(y%64<2)c=dk(c,.15);P.set(x,y,c)}
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,1,3063)*N),0,60+Math.floor(hash2(i,2,3063)*190),.2,2);
  for(let i=0;i<6;i++)stain(P,hash2(i,1,3064)*N,hash2(i,2,3064)*N,20+hash2(i,3,3064)*30,14+hash2(i,4,3064)*24,.35,3065+i)})}
// the yard's perimeter: stacked concrete blocks, rust running out of the joints, spray-painted numbers
function texE3WallY(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/64),bx=(x+(row%2?64:0))%128;let t=P.n(x,y,40,3071,4)*1.1-.05+(hash2(x,y,3072)-.5)*.06;
    let c=dith(P,x,y,t,['#3a3934','#44433d','#4e4c46','#58564f','#625f57'],.1);if(bx<3||y%64<3)c='#1e1d1a';P.set(x,y,c)}
  for(let i=0;i<30;i++){const x=Math.floor(hash2(i,1,3073)*N),y0=Math.floor(hash2(i,2,3073)*4)*64+3,l=10+Math.floor(hash2(i,3,3073)*50);for(let k=0;k<l;k++)P.set(x+Math.round(Math.sin(k*.2+i)*.6),y0+k,k<l*.4?'#8a4a22':'#5a2e16',.6-k/l*.5)}
  })}
// rusty corrugated sheet: vertical ribs, orange rust eating the galvanising, holes, a dark lower edge
function texE3Corr(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*16);let c=mix('#6a6a64','#44443e',clamp(.5+r*.35+(P.n(x,y,30,3081,3)-.5)*.6,0,1));
    const rs=P.n(x,y,18,3082,4);if(rs>.5)c=mix(c,rs>.66?'#6a3416':'#8a4a22',clamp((rs-.5)*2.6,0,.9));if(y%128<3)c=dk(c,.3);if(hash2(x>>2,y>>2,3083)<.004)c='#0a0a08';P.set(x,y,c)}
  for(let i=0;i<34;i++)streak(P,Math.floor(hash2(i,1,3084)*N),Math.floor(hash2(i,2,3084)*N),20+Math.floor(hash2(i,3,3084)*90),.16,1)})}
// rusted plate: dark steel under blooms of rust, weld seams every metre, rivets
function texE3Rust(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,36,3091,4)+(hash2(x,y,3092)-.5)*.08;let c=dith(P,x,y,t,['#2a2420','#342c26','#3e342c','#4a3c30','#5a4434'],.1);
    const rs=P.n(x,y,22,3093,4);if(rs>.48)c=mix(c,rs>.62?'#8a4820':'#6a3618',clamp((rs-.48)*2.4,0,.85));
    if(x%128<2||y%128<2)c='#1a1410';if((x%128===8||x%128===120)&&y%16===8)c='#7a6a5a';P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,3094)*N),Math.floor(hash2(i,2,3094)*N),20+Math.floor(hash2(i,3,3094)*70),.18,1)})}
// a scrap heap: a jumble of panels, pipes and car parts in faded colours over black gaps
function texE3Scrap(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const g=P.n(x,y,10,3101,2);P.set(x,y,g>.5?'#242220':'#181614')}
  const cols=['#5a5650','#6a4a34','#4a5a6a','#5a2e28','#8a8478','#3e4a3a','#7a6a50','#3a3e44','#6a6258','#74503a','#9a9890','#4a4440'];
  for(let i=0;i<120;i++){const w=8+Math.floor(hash2(i,1,3102)*40),h=4+Math.floor(hash2(i,2,3102)*22),x0=Math.floor(hash2(i,3,3102)*N),y0=Math.floor(hash2(i,4,3102)*N),c0=cols[Math.floor(hash2(i,5,3102)*cols.length)],sl=(hash2(i,6,3102)-.5)*.8;
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const px=x0+xx,py=y0+yy+Math.round(xx*sl);let c=c0;const n=P.n(px,py,12,3103+i%5,2);if(n>.62)c=mix(c,'#6a3a1c',(n-.62)*1.6);if(yy===0)c=lt(c,.3);if(yy===h-1)c=dk(c,.45);P.set(px,py,dk(c,hash2(px,py,3104)*.2))}}
  for(let i=0;i<30;i++){const x0=hash2(i,7,3105)*N,y0=hash2(i,8,3105)*N,l=20+hash2(i,9,3105)*50,a=hash2(i,10,3105)*2-1;for(let k=0;k<l;k++){P.set(Math.round(x0+k),Math.round(y0+k*a),'#3a3430');P.set(Math.round(x0+k),Math.round(y0+k*a)+1,'#7a7066')}}})}
// a crushed car: paint over creases, rust, broken glass glinting
function texE3Crush(base,seed){const W=512,H=128;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=.55+(P.n(x,y,40,seed,3)-.5)*.4+(hash2(x,y,seed+1)-.5)*.06;const cr=Math.sin((x*.9+y*2.2)/12+P.n(x,y,30,seed+2,2)*6);t+=cr>.9?.3:cr<-.92?-.35:0;
    let c=dith(P,x,y,t,[dk(base,.55),dk(base,.35),dk(base,.18),base,lt(base,.12)],.1);const wy=Math.round(26+Math.sin(x*.03+seed)*4);if(y>wy&&y<wy+14)c=hash2(x,y,seed+6)<.06?'#9aa8b4':mix('#141a20','#2a343e',P.n(x,y,8,seed+7,2));
    for(const ax of [90,410]){const d=Math.hypot(x-ax,y-H);if(d<40&&d>28)c='#0e0e0e';else if(d<=28)c=mix('#1a1a1a','#2a2a2a',P.n(x,y,6,seed+8,2))}
    const r=P.n(x,y,16,seed+3,3);if(r>.58)c=mix(c,'#6a3416',clamp((r-.58)*2.4,0,.85));if(y<3||y>H-3)c=dk(c,.4);P.set(x,y,c)}})}
// a gondola wagon's side: red-brown steel, ribs every 0.6 m, a stencilled number
function texE3Wagon(){const W=512,H=TN;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=P.n(x,y,40,3111,3)*.8+.15+(hash2(x,y,3112)-.5)*.06;const rb=x%77;if(rb<6)t+=rb<2?-.3:.18;let c=dith(P,x,y,t,['#2a160e','#3a1e12','#4a2616','#5a301c','#6a3a22'],.1);
    if(y<8||y>H-10)c='#1c100a';const r=P.n(x,y,16,3113,3);if(r>.62)c=mix(c,'#8a4a22',clamp((r-.62)*2,0,.6));P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,3114)*W),8,30+Math.floor(hash2(i,2,3114)*120),.16,2);
  P.post=ctx=>{ctx.fillStyle='rgba(220,210,180,.7)';ctx.font='bold 26px monospace';ctx.fillText('철강 03-7718',40,90);ctx.font='bold 16px monospace';ctx.fillText('적재 60t · TARE 22.4t',40,118)}})}
function texE3Coil(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#6a6c70','#4a4c50',P.n(x,y,24,3121,3));if(y%6<1)c=dk(c,.2);const r=P.n(x,y,12,3122,3);if(r>.68)c=mix(c,'#7a4a2a',(r-.68)*2);P.set(x,y,c)}})}
// a coil's end: the wound rings, bright where cut, a dark hole in the middle
function texE3CoilE(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-63.5,y-63.5)/63.5;let c;
    if(r>1){P.set(x,y,'#000');P.alpha(x,y,0);continue}else if(r<.32)c='#0c0c0e';else{const k=Math.sin(r*90+P.n(x,y,8,3123,2)*3);c=k>.6?'#a8acb0':k>-.2?'#7a7e84':'#4a4e54';if(r>.95)c='#2a2c30'}P.set(x,y,c)}})}
// a locomotive's and machines' paint: chrome yellow worn to the primer, black-and-yellow chevrons along the bottom
function texE3Loco(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.5+(P.n(x,y,40,3131,3)-.5)*.4+(hash2(x,y,3132)-.5)*.06;let c=dith(P,x,y,t,['#6a4a10','#8a6216','#a87a1c','#c08c22','#d09c2c'],.1);
    const r=P.n(x,y,14,3133,3);if(r>.6)c=mix(c,'#5a3416',clamp((r-.6)*2.4,0,.8));P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,3134)*N),Math.floor(hash2(i,2,3134)*N*.5),30+Math.floor(hash2(i,3,3134)*80),.2,2)})}
// the fuel tank: faded white over rust, a red band, the word for it
function texE3FTank(){const W=512,H=TN;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#a8a698','#86847a',P.n(x,y,40,3141,3));if(y>H*.44&&y<H*.56)c='#8a2a1e';const r=P.n(x,y,16,3142,3);if(r>.6)c=mix(c,'#7a4220',clamp((r-.6)*2.2,0,.75));P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,3143)*W),2,30+Math.floor(hash2(i,2,3143)*140),.14,2);
  P.post=ctx=>{ctx.fillStyle='#202020';ctx.font='bold 40px sans-serif';ctx.fillText('중유 · HEAVY OIL',60,96);ctx.font='bold 22px sans-serif';ctx.fillText('화기 엄금 · NO NAKED FLAMES',60,200)}})}
// refractory brick: yellow-orange fire bricks, darker headers, soot at the joints, a glaze where the heat licked
function texE3Brick(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/26),bx=(x+(row%2?32:0))%64,ly=y%26,b=Math.floor((x+(row%2?32:0))/64)+row*5;
    let t=.5+(hash2(b,1,3151)-.5)*.4+(P.n(x,y,20,3152,2)-.5)*.3;let c=dith(P,x,y,t,['#5a3a20','#7a5028','#94662e','#a87a3a','#b88a48'],.12);
    if(bx<3||ly<3)c='#241a12';const s=P.n(x,y,30,3153,3);if(s>.55)c=mix(c,'#1a1410',clamp((s-.55)*2,0,.7));P.set(x,y,c)}})}
// the furnace shell: riveted dark steel plates, heat tint (blue-violet to straw), soot running up
function texE3Shell(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,3161,4)*.9+.05+(hash2(x,y,3162)-.5)*.06;let c=dith(P,x,y,t,['#1c1a1c','#242226','#2c2a2e','#353236','#3e3a3e'],.1);
    const h=P.n(x,y,60,3163,3);if(h>.6)c=mix(c,'#4a3a5a',clamp((h-.6)*2,0,.4));else if(h<.3)c=mix(c,'#6a5a34',clamp((.3-h)*2,0,.35));
    if(x%128<3||y%96<3)c='#121012';if((x%128===10||x%128===118||y%96===10)&&(x+y)%14===0)c='#5a5658';P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,3164)*N),Math.floor(hash2(i,2,3164)*N),40+Math.floor(hash2(i,3,3164)*100),.25,2)})}
// catwalk grating: a steel grid over darkness, worn bright where boots go
function texE3Grate(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const g=x%16<3||y%8<2;let c=g?mix('#4a4a48','#6a6a64',P.n(x,y,24,3171,2)):'#0a0a0a';if(g&&hash2(x,y,3172)<.08)c='#8a8a82';if(x<2||y<2)c='#2a2a28';P.set(x,y,c)}})}
function texE3Belt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#141414','#1e1c1a',P.n(x,y,20,3181,3));if(y%32<2)c='#0a0a0a';const o=P.n(x,y,10,3182,3);if(o>.58)c=mix(c,'#5a3a22',clamp((o-.58)*2.5,0,.8));if(hash2(x,y,3183)<.01)c='#6a5a4a';P.set(x,y,c)}})}
function texE3Roof(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*12);let c=mix('#2a2826','#161514',clamp(.5+r*.4+(P.n(x,y,40,3191,3)-.5)*.5,0,1));const s=P.n(x,y,20,3192,3);if(s>.62)c=mix(c,'#4a2a16',clamp((s-.62)*2,0,.6));P.set(x,y,c)}})}
// a coolant tank: blue paint over rust, the label all the way round
function texE3Tank(){const W=512,H=TN;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2a4a6a','#1e3a56',P.n(x,y,40,3201,3));if(y<10||y>H-10)c='#141e28';const r=P.n(x,y,16,3202,3);if(r>.62)c=mix(c,'#6a4222',clamp((r-.62)*2.2,0,.7));P.set(x,y,c)}
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,1,3203)*W),10,30+Math.floor(hash2(i,2,3203)*120),.16,2);
  P.post=ctx=>{ctx.fillStyle='rgba(230,236,240,.85)';ctx.font='bold 34px sans-serif';ctx.fillText('냉각수 COOLANT',30,110);ctx.fillText('냉각수',300,110);ctx.font='bold 18px sans-serif';ctx.fillText('고압 · HIGH PRESSURE',30,150)}})}
function texE3GPipe(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#b8901e','#8a6a16',P.n(x,y,20,3211,3));if(y%64<6)c='#1a1a18';const r=P.n(x,y,10,3212,3);if(r>.64)c=mix(c,'#5a3416',(r-.64)*2.2);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a1a18';ctx.font='bold 16px sans-serif';ctx.fillText('GAS ▶',36,40)}})}
// the ladle's control desk: a grey panel, two big levers, gauges, a red mushroom button
function texE3Cab(){const W=192,H=128;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5258','#3a4248',P.n(x,y,20,3221,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#1a1e20';P.set(x,y,c)}
  P.post=ctx=>{for(const [cx,cy] of [[40,42],[96,42]]){ctx.fillStyle='#e8e4d0';ctx.beginPath();ctx.arc(cx,cy,18,0,TAU);ctx.fill();ctx.strokeStyle='#1a1a1a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+10,cy-10);ctx.stroke()}
    ctx.fillStyle='#141414';ctx.fillRect(140,20,14,70);ctx.fillStyle='#d83020';ctx.beginPath();ctx.arc(147,20,11,0,TAU);ctx.fill();
    ctx.fillStyle='#ff3020';ctx.beginPath();ctx.arc(40,96,9,0,TAU);ctx.fill();ctx.fillStyle='#30d040';ctx.beginPath();ctx.arc(66,96,7,0,TAU);ctx.fill();
    ctx.fillStyle='#e8e4c8';ctx.font='bold 14px sans-serif';ctx.fillText('래들 경동',88,100);ctx.font='bold 10px sans-serif';ctx.fillText('LADLE TILT',90,114)}})}
// the pour spot on the casting floor: a hazard ring round a scorched patch, POUR stencilled across
function texE3Pour(){const N=512;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-N/2+.5,y-N/2+.5)/(N/2);let c;
    if(r>1){P.set(x,y,'#000');P.alpha(x,y,0);continue}
    if(r>.86){const a=Math.atan2(y-N/2,x-N/2);c=Math.floor((a/TAU*24+r*3)%2+2)%2?'#d8a41e':'#1a1a18'}
    else{const n=P.n(x,y,30,3231,3);c=mix('#1a1412','#3a2618',clamp(n*1.2-.1,0,1));if(r<.5&&hash2(x>>2,y>>2,3232)<.05)c='#5a3a20'}P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(216,164,30,.75)';ctx.font='bold 54px sans-serif';ctx.textAlign='center';ctx.fillText('쇳물 낙하',N/2,N/2-10);ctx.font='bold 34px sans-serif';ctx.fillText('POUR ZONE',N/2,N/2+40)}})}
// molten iron (static: the taphole, the slag pit's crust): white-yellow cores, orange, crusting dark red
function texE3Molt(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,22,3241,4);P.set(x,y,t>.64?'#fff4b0':t>.5?'#ffc040':t>.38?'#ff7a18':t>.28?'#c83a0a':'#5a1606')}})}
// the flowing iron (the runners: the shader slides it along u), seamless in u
function texE3MoltA(){const W=256,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=fbm(x/32,y/16,3251,4,W/32)*.85+.2*Math.sin(x/W*TAU*3+y*.1);
    P.set(x,y,t>.72?'#fff8c8':t>.58?'#ffd050':t>.46?'#ff9a20':t>.34?'#e85a10':t>.24?'#a02a08':'#3a0e04')}})}
// slag: black glass with a few glowing cracks
function texE3Slag(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,24,3261,4);let c=dith(P,x,y,t,['#0e0c0c','#161212','#1e1816','#28201c','#32261e'],.12);P.set(x,y,c)}
  for(let i=0;i<10;i++)crack(P,Math.floor(hash2(i,1,3262)*N),Math.floor(hash2(i,2,3262)*N),80,3263+i,'#ff6a18','#a02a08')})}
function texE3Iron(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2a2826','#3a3632',P.n(x,y,16,3271,3));if(y%32<3)c='#121010';else if(y%32<5)c='#4a4440';const r=P.n(x,y,12,3272,3);if(r>.62)c=mix(c,'#6a3a1c',(r-.62)*2);P.set(x,y,c)}})}
function texE3Mold(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#1c1a18','#2a2622',P.n(x,y,24,3281,3));const lx=x%64,ly=y%128;if(lx<4||ly<4)c='#0c0a0a';else if(lx>10&&lx<54&&ly>12&&ly<116){c=mix('#3a2a20','#5a3820',P.n(x,y,10,3282,2));if(hash2(x,y,3283)<.03)c='#ff7a2a'}P.set(x,y,c)}})}
// painted steel panels (the booths, the signal box): faded green-grey, rust at the seams
function texE3Panel(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#4e5a52','#3e4a44',P.n(x,y,40,3291,3));if(x%128<3)c='#22281f';if(y>N-24)c=dk(c,.25);const r=P.n(x,y,14,3292,3);if(r>.62||x%128<6&&r>.45)c=mix(c,'#7a4220',clamp((r-.45)*2,0,.7));P.set(x,y,c)}
  for(let i=0;i<16;i++)streak(P,Math.floor(hash2(i,1,3293)*N),2,30+Math.floor(hash2(i,2,3293)*100),.14,2)})}
function texE3Trough(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#4a3a2a','#2a2018',P.n(x,y,12,3301,3));if(hash2(x,y,3302)<.04)c='#ff6a20';P.set(x,y,c)}})}
// a gate leaf: rusty steel with a black-and-yellow band along the bottom and a no-entry plate
function texE3Gate(){const W=256,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a4038','#36302a',P.n(x,y,24,3311,3));const r=P.n(x,y,14,3312,3);if(r>.56)c=mix(c,'#7a3a1a',clamp((r-.56)*2.4,0,.8));if(x<6||x>W-7||y<6)c='#1a1612';
    if(y>H-36)c=Math.floor((x+y)/18)%2?'#c89a1e':'#141412';if(x%64<3)c=dk(c,.3);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#b82018';ctx.fillRect(84,70,88,56);ctx.fillStyle='#ffffff';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('출입금지',128,104)}})}
function texE3Col(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#3a3a3a','#2a2a2a',P.n(x,y,20,3321,3));if(x%64<4)c='#1a1a1a';if(y>100)c=Math.floor((x+y)/16)%2?'#c89a1e':'#141412';P.set(x,y,c)}})}
// a high window full of dusk: smoky orange glass behind a steel frame
function texE3Win(){const W=128,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const fr=x%32<3||y%48<3||x>W-4||y>H-4;let c=fr?'#141210':mix('#a85a2a','#4a2a26',y/H);if(!fr&&P.n(x,y,16,3331,2)>.6)c=dk(c,.35);P.set(x,y,c)}})}
function texE3Mag(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2a2a2c','#3e3e40',P.n(x,y,18,3341,3));if((x+y)%32<3)c='#c89a1e';P.set(x,y,c)}})}
function texE3Wood(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(y/32);let c=mix('#3a2a1c','#24180e',clamp(P.n(x*.3,y*3,30,3351+pl,3)*1.2-.1,0,1));if(y%32<2)c='#120c06';P.set(x,y,c)}})}
// a valve's wheel face: red spokes on a dark hub
function texE3Yel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8a01e','#9a7a18',P.n(x,y,16,3371,3));const r=P.n(x,y,8,3372,3);if(r>.6)c=mix(c,'#4a3418',(r-.6)*2.2);P.set(x,y,c)}})}
function texE3Wheel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const dx=x-63.5,dy=y-63.5,r=Math.hypot(dx,dy)/63.5,a=Math.atan2(dy,dx);let c='#1a1614';
    if(r>.78&&r<.98)c='#b82418';else if(r<.98&&Math.abs(Math.sin(a*3))<.12)c='#a01c14';if(r<.2)c='#3a3430';P.set(x,y,c)}})}
// the dusk: deep blue-black overhead, the smoke of the works lit dull red at the horizon
function texE3Sky(){return paint(1024,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/255;let c=mix('#06060c','#2a1418',Math.pow(t,2.1));
    if(t>.62)c=mix(c,'#6a2a14',clamp((t-.62)*2.6,0,1)*(.75+.25*Math.sin(x/1024*TAU*2)));const n=fbm(x/128,y/32,3361,5,1024/128);if(n>.52)c=mix(c,'#100c0e',clamp((n-.52)*2.4,0,.8)*(t>.4?1:.5));P.set(x,y,c)}})}
function bakeEp3Tex(){if(TEX.e3dirt)return;
  TEX.e3dirt=mkTex(texE3Dirt());TEX.e3grav=mkTex(texE3Grav());TEX.e3track=mkTex(texE3Track());TEX.e3floor=mkTex(texE3Floor());TEX.e3conc=mkTex(texE3Conc());TEX.e3wall=mkTex(texE3Wall());
  TEX.e3wallY=mkTex(texE3WallY());TEX.e3corr=mkTex(texE3Corr());TEX.e3rust=mkTex(texE3Rust());TEX.e3scrap=mkTex(texE3Scrap());
  TEX.e3carA=mkTex(texE3Crush('#3a5a7a',3401));TEX.e3carB=mkTex(texE3Crush('#7a2a22',3411));TEX.e3carC=mkTex(texE3Crush('#8a8a80',3421));TEX.e3carD=mkTex(texE3Crush('#3a5a3a',3431));
  TEX.e3wagon=mkTex(texE3Wagon());TEX.e3coil=mkTex(texE3Coil());TEX.e3coilE=mkTex(texE3CoilE(),false);TEX.e3loco=mkTex(texE3Loco());TEX.e3ftank=mkTex(texE3FTank());
  TEX.e3brick=mkTex(texE3Brick());TEX.e3shell=mkTex(texE3Shell());TEX.e3grate=mkTex(texE3Grate());TEX.e3belt=mkTex(texE3Belt());TEX.e3roof=mkTex(texE3Roof());TEX.e3tank=mkTex(texE3Tank());
  TEX.e3gpipe=mkTex(texE3GPipe());TEX.e3cab=mkTex(texE3Cab(),false);TEX.e3pour=mkTex(texE3Pour(),false);TEX.e3moltS=mkTex(texE3Molt());TEX.e3moltA=mkTex(texE3MoltA());TEX.e3slag=mkTex(texE3Slag());
  TEX.e3iron=mkTex(texE3Iron());TEX.e3mold=mkTex(texE3Mold());TEX.e3panel=mkTex(texE3Panel());TEX.e3trough=mkTex(texE3Trough());TEX.e3gate=mkTex(texE3Gate(),false);TEX.e3col=mkTex(texE3Col());
  TEX.e3win=mkTex(texE3Win(),false);TEX.e3mag=mkTex(texE3Mag());TEX.e3wood=mkTex(texE3Wood());TEX.e3wheel=mkTex(texE3Wheel(),false);TEX.e3yel=mkTex(texE3Yel());
  TEX.e3sky=mkTex(texE3Sky());TEX.e3sky.wrapT=THREE.ClampToEdgeWrapping;
  const S=(k,lines,bg,fg,w,h)=>{TEX[k]=mkTex(texSign(lines,bg,fg,w,h),false)};
  S('e3sMill',[{t:'청운제철 제2공장'},{t:'CHEONGUN STEEL WORKS · PLANT 2',s:7}],'#2a2622','#e8d8b8',192,40);
  S('e3sYard',[{t:'고철 야적장'},{t:'SCRAP YARD',s:8}],'#2a2622','#e8d8b8',112,30);S('e3sWeigh',[{t:'계근대'},{t:'WEIGHBRIDGE',s:8}],'#1e3a5a','#e8ecf0',96,28);
  S('e3sRail',[{t:'철로 야적장 · 열차 주의'},{t:'RAIL YARD · WATCH FOR TRAINS',s:7}],'#c8a020','#141414',150,32);S('e3sFuel',[{t:'연료 밸브 · 화기 엄금'},{t:'FUEL VALVE · NO FLAMES',s:7}],'#b82018','#ffffff',128,30);
  S('e3sHot',[{t:'고온 주의 · 쇳물'},{t:'DANGER · MOLTEN METAL',s:7}],'#d8a41e','#141414',128,30);S('e3sBF',[{t:'제2고로'},{t:'BLAST FURNACE No.2',s:8}],'#2a2622','#ffb060',112,30);
  S('e3sCast',[{t:'주조장 · 크레인 작업 중'},{t:'CASTING BAY · CRANE OVERHEAD',s:7}],'#2a2622','#e8d8b8',150,32);S('e3sConv',[{t:'원료 컨베이어 → 고로'},{t:'RAW MATERIAL CONVEYOR',s:7}],'#2a2622','#e8d8b8',128,30);
  S('e3sSig',[{t:'신호소'},{t:'SIGNAL BOX',s:8}],'#1e3a5a','#e8ecf0',96,28);S('e3sCab',[{t:'래들 조종석'},{t:'LADLE CONTROL',s:8}],'#d8a41e','#141414',96,28)}
// ---------- geometry helpers ----------
const E3NZ={nosolid:true};
// a stepped heap: n tiers of height h, each inset by d
function e3pile(x0,z0,x1,z1,n,h,d,mat){for(let i=0;i<n;i++){const k=i*d;B(x0+k,i*h,z0+k,x1-k,(i+1)*h,z1-k,mat||'e3scrap')}}
// a stack of n crushed cars (3.9 × 1.75 × 0.55 m each), skewed a little; ax: the long axis
function e3cars(x,z,ax,n,seed){const M=['e3carA','e3carB','e3carC','e3carD'];for(let i=0;i<n;i++){const o=(hash2(seed,i,1)-.5)*.5,m=M[Math.floor(hash2(seed,i,2)*4)],y=i*.55;
  if(ax==='x')B(x-1.95+o,y,z-.88+o*.4,x+1.95+o,y+.55,z+.88+o*.4,m);else B(x-.88+o*.4,y,z-1.95+o,x+.88+o*.4,y+.55,z+1.95+o,m)}}
// bogies under a wagon (along x)
function e3bogie(x0,z0,z1,x1){for(const x of [x0+1,x1-2.6])B(x,0,z0+.3,x+1.6,.9,z1-.3,'metal2')}
// an open gondola wagon along x, scrap heaped inside
function e3gond(x0,z0,len){const x1=x0+len,z1=z0+3;e3bogie(x0,z0,z1,x1);B(x0,.9,z0,x1,1.2,z1,'e3wagon');
  B(x0,1.2,z0,x1,3.2,z0+.12,'e3wagon');B(x0,1.2,z1-.12,x1,3.2,z1,'e3wagon');B(x0,1.2,z0+.12,x0+.12,3.2,z1-.12,'e3wagon');B(x1-.12,1.2,z0+.12,x1,3.2,z1-.12,'e3wagon');B(x0+.3,1.2,z0+.3,x1-.3,3.05,z1-.3,'e3scrap')}
// a flatcar with n steel coils (their axes along x)
function e3flat(x0,z0,len,n){const x1=x0+len,z1=z0+2.8,cz=z0+1.4;e3bogie(x0,z0,z1,x1);B(x0,.9,z0,x1,1.25,z1,'e3rust');
  for(let i=0;i<n;i++){const cx=x0+1.8+i*(len-3.6)/Math.max(1,n-1);B(cx-.9,1.25,cz-1,cx+.9,1.45,cz+1,'e3wood');MAP.deco.push({k:'drum',x:cx,y:1.45,z:cz,r:.86,h:1.3,mat:'e3coil',rot:i});
    B(cx-.7,1.45,cz-.7,cx+.7,2.75,cz+.7,'metalx');B(cx-.86,2.76,cz-.86,cx+.86,2.77,cz+.86,'e3coilE',E3NZ)}}
// a shunting locomotive along x (cab at x0)
function e3loco(x0,z0){const z1=z0+2.9;e3bogie(x0,z0,z1,x0+9);B(x0,.9,z0,x0+9,1.3,z1,'e3rust');B(x0+2.4,1.3,z0+.4,x0+9,3,z1-.4,'e3loco');
  B(x0,1.3,z0+.1,x0+2.4,3.8,z1-.1,'e3loco',{f:{nx:'carGl'}});B(x0-.1,3.8,z0,x0+2.5,4,z1,'e3rust');B(x0+7.6,3,z0+1.2,x0+8,3.7,z0+1.7,'pipe');B(x0+.4,2.6,z0+.05,x0+2,3.4,z0+.1,'carGl',E3NZ)}
// a closed boxcar along x, its door slid half open on the -z side
function e3boxcar(x0,z0,len){const x1=x0+len,z1=z0+3;e3bogie(x0,z0,z1,x1);B(x0,.9,z0,x1,1.2,z1,'e3wagon');B(x0,1.2,z0,x1,3.9,z1,'e3wagon');B(x0+len*.42,1.25,z0-.12,x0+len*.62,3.6,z0,'e3rust')}
// a horizontal tank (axis x): two slabs make a rounded section
function e3htank(x0,z0,x1,z1,y0,h){const cz=(z0+z1)/2,w=(z1-z0)/2;B(x0,y0+h*.16,z0,x1,y0+h*.84,z1,'e3ftank');B(x0,y0,cz-w*.68,x1,y0+h,cz+w*.68,'e3ftank')}
// a stair flight with stepped side rails (both sides when r2)
function e3stairs(axis,c0,c1,a0,a1,y0,y1,n,r1,r2){stairs(axis,c0,c1,a0,a1,y0,y1,n,'e3grate');if(r1)e3srail(axis,c0-.06,c0,a0,a1,y0,y1,n);if(r2)e3srail(axis,c1,c1+.06,a0,a1,y0,y1,n)}
// a stair's railing: stepped invisible panels stop side jumps, a post every second step and short top rails show it
function e3srail(axis,c0,c1,a0,a1,y0,y1,n){q7rail(axis,c0,c1,a0,a1,y0,y1,n,'metalx');const da=(a1-a0)/n,dy=(y1-y0)/n,cc=(c0+c1)/2;
  for(let i=0;i<n;i+=2){const s=a0+da*(i+.5),top=y0+dy*(i+1),s2=a0+da*Math.min(n,i+2);
    if(axis==='z'){B(cc-.03,top,s-.03,cc+.03,top+1,s+.03,'e3yel',E3NZ);B(cc-.03,top+.96,Math.min(s,s2),cc+.03,top+1.02,Math.max(s,s2),'e3yel',E3NZ)}
    else{B(s-.03,top,cc-.03,s+.03,top+1,cc+.03,'e3yel',E3NZ);B(Math.min(s,s2),top+.96,cc-.03,Math.max(s,s2),top+1.02,cc+.03,'e3yel',E3NZ)}}}
// a railing (1.1 m) along a walkway edge: posts every 1.5 m, a top rail, a knee rail, a toe board
function e3railX(x0,x1,z,y){B(x0,y,z-.04,x1,y+1.1,z+.04,'metalx');B(x0,y+1.02,z-.03,x1,y+1.08,z+.03,'e3yel',E3NZ);B(x0,y+.5,z-.025,x1,y+.55,z+.025,'e3yel',E3NZ);B(x0,y,z-.02,x1,y+.12,z+.02,'e3yel',E3NZ);
  const n=Math.max(1,Math.round((x1-x0)/1.5));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;B(x-.03,y,z-.03,x+.03,y+1.08,z+.03,'e3yel',E3NZ)}}
function e3railZ(z0,z1,x,y){B(x-.04,y,z0,x+.04,y+1.1,z1,'metalx');B(x-.03,y+1.02,z0,x+.03,y+1.08,z1,'e3yel',E3NZ);B(x-.025,y+.5,z0,x+.025,y+.55,z1,'e3yel',E3NZ);B(x-.02,y,z0,x+.02,y+.12,z1,'e3yel',E3NZ);
  const n=Math.max(1,Math.round((z1-z0)/1.5));for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n;B(x-.03,y,z-.03,x+.03,y+1.08,z+.03,'e3yel',E3NZ)}}
// a gas valve on its pipe (the valve body is the shootable part: o.eh), the nozzle pointing at the pillar spot
function e3gas(i,px,py,pz,fx,fz,h){B(px-.16,py,pz-.16,px+.16,py+(h||6),pz+.16,'e3gpipe');const dx=Math.sign(fx-px)*.42,dz=Math.sign(fz-pz)*.42;
  B(px+dx-.26,py+1,pz+dz-.26,px+dx+.26,py+1.55,pz+dz+.26,'e3rust',{eh:{k:'gv',i},f:{px:'e3wheel',nx:'e3wheel',pz:'e3wheel',nz:'e3wheel'}});
  B(Math.min(px,fx)-.08,py+.32,Math.min(pz,fz)-.08,Math.max(px,fx)+.08,py+.48,Math.max(pz,fz)+.08,'e3gpipe',E3NZ)}
// a control booth (the ladle's levers): walls with windows toward the pour spot (+x), the door on the -x side
function e3booth(x0,z0,face){const x1=x0+4,z1=z0+4,h=2.8;wallX(x0,x1,z0,z0+.15,0,h,'e3panel',[[x0+1,x0+3,1.1,2.2]]);wallX(x0,x1,z1-.15,z1,0,h,'e3panel',[[x0+1,x0+3,1.1,2.2]]);
  wallZ(x1-.15,x1,z0+.15,z1-.15,0,h,'e3panel',[[z0+.8,z1-.8,1,2.3]]);wallZ(x0,x0+.15,z0+.15,z1-.15,0,h,'e3panel',[[z0+1.2,z0+2.8,0,2.2]]);
  B(x0-.2,h,z0-.2,x1+.2,h+.2,z1+.2,'e3corr',{f:{ny:'e3panel'}});B(x1-.85,0,z0+.6,x1-.2,1.1,z1-.6,'e3cab',{f:{px:'e3panel',py:'e3cab',nx:'e3cab'}});
  B(x0-.03,2.25,z0+1.2,x0,2.7,z0+2.8,'e3sCab',E3NZ);LIGHT(x0+2,2.5,z0+2,'#ffe0a0',5,.75);B(x0+1.7,2.74,z0+1.7,x0+2.3,2.8,z0+2.3,'lampW',E3NZ)}
function buildEp3(){
  const nz=E3NZ;
  // ================= zone A: the scrap yard =================
  B(-75.8,-1,-45.8,-24.6,0,0.4,'e3dirt',{ground:1});
  B(-75.8,0,-45.4,-75.2,5,0.4,'e3wallY');B(-75.8,0,-45.8,-24.6,5,-45.2,'e3wallY');B(-75.8,0,-0.2,-24.6,5,0.4,'e3wallY');
  B(-25.4,0,-45.8,-24.6,5,-20,'e3wallY');B(-25.4,0,-14,-24.6,5,0.4,'e3wallY');B(-25.4,4.2,-20,-24.6,5,-14,'e3wallY');
  // the rail yard's gate (gA): two steel leaves sliding apart
  B(-25.2,0,-20,-24.8,4.2,-17,'e3gate',{gate:'gA',gs:[0,0,-2.9]});B(-25.2,0,-17,-24.8,4.2,-14,'e3gate',{gate:'gA',gs:[0,0,2.9]});
  B(-25.46,4.25,-19.5,-25.4,5,-14.5,'e3sRail',nz);B(-24.6,4.25,-19.5,-24.54,5,-14.5,'e3sRail',nz);B(-75.16,2.6,-30,-75.1,3.6,-24,'e3sYard',nz);B(-68,3,-.26,-60,4.6,-.2,'e3sMill',nz);
  // the scrap mountain (south-west: KHEPRI shows itself on its top), two smaller heaps, crushed cars stacked for cover
  e3pile(-75.2,-45.2,-57,-33,4,1.6,1.5);
  B(-66,6.4,-39.8,-63.4,7.1,-38.6,'e3carB',nz);B(-71,4.8,-36.6,-68.6,5.6,-35.2,'e3carA',nz);B(-60.4,3.2,-43,-58.6,4.6,-41.6,'e3rust',nz);B(-73.4,1.6,-34.2,-70,2.2,-33.4,'e3carC',nz);
  B(-62,0,-34,-61.2,3.8,-33.2,'pipe',nz);B(-67.8,6.4,-37.3,-67.4,8.2,-36.9,'pipe',nz);
  e3pile(-52,-8,-38,-.2,3,1.3,1.4);e3pile(-50,-45.2,-40,-38,2,1.5,1.3);
  e3cars(-64,-26,'x',3,1);e3cars(-58,-13,'z',2,2);e3cars(-51,-27,'x',4,3);e3cars(-45,-19,'z',2,4);e3cars(-40,-12,'x',3,5);e3cars(-35,-25,'z',2,6);e3cars(-68,-7,'x',2,7);e3cars(-55,-36,'z',3,8);
  // the car press: a steel chamber on its base, the ram housing, the control box
  B(-38,0,-40,-30,1.1,-34,'e3rust');B(-37,1.1,-39,-31,2.6,-38.7,'e3rust');B(-37,1.1,-35.3,-31,2.6,-35,'e3rust');B(-37,1.1,-38.7,-36.7,2.6,-35.3,'e3rust');B(-31.3,1.1,-38.7,-31,2.6,-35.3,'e3rust');
  B(-36.4,1.1,-38.4,-33.6,1.9,-35.6,'e3carC');B(-30,0,-38.4,-28.6,2.4,-35.6,'e3loco');B(-29.6,0,-33.4,-28.8,1.6,-32.6,'e3panel');B(-34.5,2.6,-37.4,-32.5,3.4,-36.6,'pipe',nz);
  // the magnet crane: its tower, cab, boom, cable and the magnet hanging over the yard
  B(-47.8,0,-31.8,-46.2,11,-30.2,'e3rust');B(-48.6,11,-32.6,-45.4,13,-29.4,'e3loco',{f:{px:'carGl'}});B(-46,12.4,-31.4,-34,12.9,-30.6,'e3rust',nz);
  B(-35.05,7.2,-31.05,-34.95,12.4,-30.95,'metal2',nz);B(-36,6.6,-32,-34,7.2,-30,'e3mag',nz);B(-47.2,13,-31.2,-46.8,14.2,-30.8,'lampR',nz);LIGHT(-47,12.2,-28.6,'#ffd8a0',9,.8);
  // the weighbridge and its booth
  B(-35,0,-19.4,-27,.06,-14.6,'e3floor');B(-27.4,0,-20.2,-27,1.3,-19.8,'metal2');B(-27.3,1,-19.6,-27.1,1.2,-14.8,'hazard',nz);
  {const x0=-33,x1=-29,z0=-27,z1=-23;wallX(x0,x1,z0,z0+.15,0,2.7,'e3panel',[[-31.8,-30.2,1.1,2.1]]);wallX(x0,x1,z1-.15,z1,0,2.7,'e3panel',[[-31.6,-30.4,0,2.1]]);
    wallZ(x0,x0+.15,z0+.15,z1-.15,0,2.7,'e3panel',[[-25.8,-24.2,1.1,2.1]]);wallZ(x1-.15,x1,z0+.15,z1-.15,0,2.7,'e3panel',[[-25.8,-24.2,1.1,2.1]]);
    B(x0-.3,2.7,z0-.3,x1+.3,2.9,z1+.3,'e3corr',{f:{ny:'e3panel'}});B(-32.6,0,-26.6,-30.6,.8,-25.8,'e3wood',{f:{py:'metal2'}});monitor(-32.2,.8,-26.5,-31.6,1.2,-26.4,'pz');
    B(-31.8,2.9,-23.1,-30.2,3.4,-23,'e3sWeigh',nz);LIGHT(-31,2.4,-25,'#fff0c0',5,.7,{flick:.25})}
  // lamps, burning barrels, loose drums
  lamp(-66,-30,6);lamp(-58,-4,6);lamp(-42,-26,6);lamp(-30,-10,6);
  for(const [x,z] of [[-70,-14],[-36,-6]]){drum(x,z,0,'drumR');MAP.fires.push([x,.9,z])}
  for(const [x,z] of [[-60,-44],[-72,-24],[-38,-44],[-27,-40]])drum(x,z);
  // ================= zone B: the rail yard =================
  {const G=(z0,z1,m)=>B(-24.6,-1,z0,35.8,0,z1,m,{ground:1});G(-32.8,-23.4,'e3grav');G(-23.4,-20.8,'e3track');G(-20.8,-18.2,'e3grav');G(-18.2,-15.6,'e3track');G(-15.6,-13,'e3grav');G(-13,-10.4,'e3track');G(-10.4,-3,'e3grav');
    for(const z0 of [-23.4,-18.2,-13])for(const dz of [.62,1.9])B(-24.6,0,z0+dz,35.2,.14,z0+dz+.08,'metal2',nz)}
  B(-24.6,0,-32.8,35.8,4.5,-32.2,'e3wallY');B(35.2,0,-32.8,35.8,4.5,-6.6,'e3wallY');B(-24.6,0,-3.4,-15,4.5,-3,'e3wallY');B(-15,0,-3.4,35.2,7.6,-3,'e3wallY');
  // the tracks' cars: a loaded gondola and the shunting loco on track A, coils on track B, a gondola and a boxcar on track C
  e3gond(-8,-23.6,12);e3loco(8,-23.55);e3flat(-18,-18.3,12,3);e3gond(-2,-13.2,12);e3boxcar(16,-13.2,11);
  // the south strip: the signal box (two floors, an outside stair), the pump house, sleepers and rails in stacks, the flare stack
  {wallX(18,26,-31.6,-31.4,0,3.2,'e3panel',[[20,22,1.2,2.2],[23,25,1.2,2.2]]);wallX(18,26,-26,-25.8,0,3.2,'e3panel',[[21,22.6,0,2.2]]);wallZ(18,18.2,-31.4,-26,0,3.2,'e3panel');wallZ(25.8,26,-31.4,-26,0,3.2,'e3panel',[[-30,-28,1.2,2.2]]);
    B(17.8,3.2,-31.8,26.2,3.5,-25.6,'e3conc');
    wallX(17.8,26.2,-31.8,-31.6,3.5,6.4,'e3panel',[[19,25,4.6,5.9]]);wallX(17.8,26.2,-25.8,-25.6,3.5,6.4,'e3panel',[[19,21.4,4.6,5.9],[22.6,25,4.6,5.9]]);
    wallZ(17.8,18,-31.6,-25.8,3.5,6.4,'e3panel',[[-31.4,-29.9,3.5,5.7]]);wallZ(26,26.2,-31.6,-25.8,3.5,6.4,'e3panel',[[-30.6,-27,4.6,5.9]]);
    B(17.6,6.4,-32,26.4,6.7,-25.4,'e3corr',{f:{ny:'e3panel'}});B(20,6.7,-25.46,24,7.4,-25.4,'e3sSig',nz);
    e3stairs('z',16.2,17.8,-24.8,-29.8,0,3.5,9,true,false);B(16.2,3.2,-31.8,17.8,3.5,-29.8,'e3grate');e3railZ(-31.8,-29.8,16.16,3.5);e3railX(16.2,17.8,-31.84,3.5);
    B(22,3.5,-31.4,24.6,4.6,-30.6,'e3panel',{f:{py:'e3cab'}});B(18.6,3.5,-27,20,4.3,-26.2,'e3wood');LIGHT(22,6,-28.6,'#fff0c0',7,.8);LIGHT(22,2.8,-28.8,'#fff0c0',6,.7,{flick:.2});
    B(21.6,6.1,-28.8,22.4,6.2,-28.4,'lampW',nz)}
  {wallX(-8,-1,-31.6,-31.4,0,3,'e3corr');wallZ(-8,-7.8,-31.4,-27.2,0,3,'e3corr');wallZ(-1.2,-1,-31.4,-27.2,0,3,'e3corr');B(-8.2,3,-31.8,-.8,3.2,-27,'e3corr');
    B(-7,0,-31,-5.4,1.2,-29.6,'e3loco');B(-3.6,0,-31,-2,1.2,-29.6,'e3loco');B(-6.4,1.2,-30.6,-6,3,-30.2,'e3gpipe',nz);B(-3,1.2,-30.6,-2.6,3,-30.2,'e3gpipe',nz);B(-5.2,.5,-29.6,-3.8,1.6,-29.2,'e3gpipe');
    B(-6,1.7,-31.36,-3,2.5,-31.3,'e3sFuel',nz);LIGHT(-4.5,2.6,-29,'#ffe0b0',6,.75,{flick:.2})}
  B(-20,0,-30.6,-14,.9,-28.4,'e3wood');B(-19.6,.9,-30.2,-15,1.6,-28.8,'e3wood');B(4,0,-30.8,14,.5,-29.6,'metal2');B(5,.5,-30.6,12,.8,-29.8,'metal2');
  B(31,0,-30,33,1,-28,'e3rust');B(31.6,1,-29.4,32.4,16,-28.6,'pipe');B(31.2,15.6,-29.8,32.8,16,-28.2,'e3rust',nz);
  // the north strip: the heavy-oil tank on its saddles (fuel valve 1 below it), pipes along the wall to the furnace
  B(-20,0,-8.2,-19,.8,-5.4,'e3rust');B(-13,0,-8.2,-12,.8,-5.4,'e3rust');e3htank(-22,-8.6,-10,-5,.6,3.2);B(-17.6,.9,-8.66,-14.4,1.9,-8.6,'e3sFuel',nz);
  B(-16.4,0,-9.2,-15.6,1.5,-8.6,'e3gpipe');B(-16.6,1,-9.5,-15.4,1.5,-9.2,'e3rust',{f:{nz:'e3wheel'}});B(-24.6,3.4,-3.9,12,3.8,-3.5,'e3gpipe',nz);B(-16.2,1.5,-9.1,-15.8,3.8,-8.7,'e3gpipe',nz);
  // the gantry crane over the east end
  for(const x of [27.4,32.4])for(const z of [-31.4,-9.2]){B(x,0,z,x+.8,10,z+.8,'e3loco')}
  for(const z of [-31.4,-9.2])B(27.4,10,z,33.2,10.8,z+.8,'e3loco',nz);for(const x of [27.6,32.6])B(x,10.8,-31.4,x+.4,11.4,-8.4,'e3rust',nz);B(27.8,11.4,-21.6,32.8,12.2,-19.4,'e3loco',nz);
  B(30.2,6.2,-20.6,30.4,11.4,-20.4,'metal2',nz);MAP.deco.push({k:'drum',x:30.3,y:4.9,z:-20.5,r:.8,h:1.3,mat:'e3coil',rot:0});B(29.5,6.21,-21.3,31.1,6.22,-19.7,'e3coilE',nz);
  // lamps
  lamp(-12,-26,6.5);lamp(10,-26,6.5);lamp(-12,-14.3,6.5);lamp(14,-14.3,6.5);lamp(0,-6.4,6.5);LIGHT(28,9,-20,'#ffd8a0',14,.7);
  for(const [x,z] of [[2,-8],[3.2,-7.4],[28,-14.5],[-22,-30.5]])drum(x,z,0,hash2(Math.round(x),Math.round(z),9)<.5?'drumR':null);
  // ================= the stair cage up to the conveyor gallery (gate gB at its foot) =================
  wallX(12,35.2,-6.8,-6.6,0,11.8,'e3corr',[[15,17,4,5.2],[21,23,6,7.4],[27,29,9,10.4],[31,33,9,10.4]]);B(35.2,0,-6.6,35.8,11.8,2.4,'e3corr');
  wallZ(11.8,12,-6.6,-3.4,0,11.8,'e3corr',[[-6.6,-3.4,0,3]]);B(11.82,0,-6.6,11.98,3,-3.4,'e3gate',{gate:'gB',gs:[0,2.95,0]});B(11.74,3.2,-6.2,11.8,3.9,-3.8,'e3sConv',nz);
  e3stairs('x',-6.6,-3.4,12.2,28.2,0,8,20,false,false);B(28.2,7.6,-6.6,35.2,8,-3.4,'e3grate');B(12,11.6,-6.8,35.2,11.8,-3.4,'e3corr',{f:{ny:'e3rust'}});
  LIGHT(16,5,-5,'#ffd8a0',7,.7);LIGHT(24,8.4,-5,'#ffd8a0',7,.7);LIGHT(32,10.6,-5,'#ffd8a0',7,.75);B(23.6,11.5,-5.2,24.4,11.6,-4.8,'lampW',nz);B(31.6,11.5,-5.2,32.4,11.6,-4.8,'lampW',nz);
  // ================= zone C: the conveyor gallery (deck at 8 m) =================
  B(-15,7.6,-3.4,35.2,8,2,'e3grate');B(32.4,8,2,35.2,11.8,2.4,'e3corr');B(-15.4,8,-3.6,-15,11.8,2,'e3corr');
  wallX(-15,28.2,-3.6,-3.4,8,11.6,'e3corr',[[-10,-7,8,11.6],[-5,-3,9.2,10.6],[-1,3,8,11.6],[6,9,8,11.6],[11,13,9.2,10.6],[17,19,9.2,10.6],[23,25,9.2,10.6]]);
  // the stretch KHEPRI bursts through (gW)
  B(-1,8,-3.6,3,11.6,-3.4,'e3corr',{gate:'gW',gs:[0,0,0]});
  // two bays off the deck (somewhere to step out of the ball's way)
  for(const [x0,x1] of [[-10,-7],[6,9]]){B(x0,7.6,-5.4,x1,8,-3.4,'e3grate');B(x0-.2,8,-5.6,x1+.2,11.6,-5.4,'e3corr');B(x0-.2,8,-5.4,x0,11.6,-3.6,'e3corr');B(x1,8,-5.4,x1+.2,11.6,-3.6,'e3corr');
    B(x0-.2,11.6,-5.6,x1+.2,11.8,-3.4,'e3corr');B(x0+.4,6.2,-5.3,x0+.6,7.6,-5.1,'e3col',nz);B(x1-.6,6.2,-5.3,x1-.4,7.6,-5.1,'e3col',nz)}
  slab(-15.4,-3.6,35.2,2.4,11.6,11.8,'e3corr',[[-6,-2.6,-4,-.6],[9,-2.6,11,-.6],[20,-2.6,22,-.6]]);
  for(const x of [-6,9,20]){B(x-.1,11.8,-2.7,x+2.1,12,-2.5,'metal2',nz);B(x-.1,11.8,-.7,x+2.1,12,-.5,'metal2',nz);LIGHT(x+1,10.8,-1.6,'#6a5a6a',6,.35)}
  // the conveyor: its frame, the belt, rollers; the transfer chute at the east end
  B(-13,8,.2,30,8.5,1.9,'e3rust');B(-13,8.5,.3,30,8.75,1.8,'e3belt');for(let x=-12;x<30;x+=3)B(x-.08,8.4,.25,x+.08,8.6,1.85,'metal2',nz);B(30,8,0,32.2,11.6,2,'e3rust');
  B(-12,9.6,1.94,-6,10.4,2,'e3sConv',nz);
  for(const x of [-11,-3,5,13,21,29]){LIGHT(x,10.9,-1.6,'#ffd8a0',8,.75);B(x-.4,11.5,-1.8,x+.4,11.6,-1.4,'lampW',nz)}
  // ================= zone D: the blast-furnace hall =================
  B(-40.4,-1,2.4,32.4,0,42.4,'e3floor',{ground:1});
  wallX(-40.4,32.4,2,2.4,0,18.4,'e3wall',[[-14,-11,8,10.8]]);B(-14,8,2.05,-11,10.8,2.35,'e3gate',{gate:'gC',gs:[3,0,0]});
  B(-40.4,0,42,32.4,18.4,42.4,'e3wall');B(-40.4,0,2.4,-40,18.4,42,'e3wall');B(32,0,2.4,32.4,18.4,42,'e3wall');
  B(-40.6,18.4,1.8,32.6,18.8,42.6,'e3roof');
  for(let x=-32;x<=24;x+=8){B(x-.15,16.6,2.4,x+.15,17,42,'e3rust',nz);B(x-.15,17,2.4,x+.15,18.4,2.8,'e3rust',nz);B(x-.15,17,41.6,x+.15,18.4,42,'e3rust',nz)}
  for(const x of [-34,-18,-2,14]){B(x,14,41.94,x+6,16,42,'e3win',nz);B(x,14,2.4,x+6,16,2.46,'e3win',nz)}
  for(const x of [-38,-30,-22])B(x,13.4,1.94,x+5,15.4,2,'e3win',nz);for(const z of [6,16,26,36])B(-40.46,13.4,z,-40.4,15.4,z+5,'e3win',nz);
  B(-30,9,2.46,-24,10.6,2.52,'e3sBF',nz);B(-38,3,41.94,-32,4.6,42,'e3sHot',nz);B(18,9,41.94,24,10.6,42,'e3sCast',nz);B(-39.96,3,10,-39.9,4.6,16,'e3sHot',nz);
  // the landing inside the door (8 m) and the stair down along the south wall
  B(-16,7.6,2.4,-9,8,6.4,'e3grate');e3railX(-16,-9,6.36,8);e3railZ(2.4,6.36,-15.96,8);e3railZ(4.4,6.4,-9.04,8);B(-15.8,0,6,-15.4,7.6,6.4,'e3col');B(-9.6,0,6,-9.2,7.6,6.4,'e3col');
  e3stairs('x',2.4,4.4,7,-9,0,8,20,false,true);
  // ---- the slag yard (west): the two scrap heaps KHEPRI rolls its balls from, slag pots, I-beams, the slag pit ----
  e3pile(-35.5,7.5,-28.5,14.5,3,.9,1);e3pile(-35.5,29.5,-28.5,36.5,3,.9,1);
  B(-33.6,2.7,9.6,-31.8,3.4,10.6,'e3carA',nz);B(-32.4,2.7,32,-30.6,3.3,33.4,'e3carD',nz);B(-31,1.8,13,-30.6,3.6,13.4,'pipe',nz);B(-34,1.8,30.6,-33.6,3.2,31,'pipe',nz);
  for(const z of [10.5,30.5]){B(-24,0,z,-20,1,z+3,'e3rust');B(-23.6,1,z+.2,-20.4,2.7,z+2.8,'e3mold');B(-23.2,2.62,z+.6,-20.8,2.7,z+2.4,'e3slag',nz)}
  B(-28,0,20.6,-24,1.1,23.4,'e3iron');B(-27.6,1.1,21,-24.4,1.7,23,'e3iron');
  B(-20,-.02,19.5,-16,.04,24.5,'e3slag',nz);B(-20.2,0,19.3,-15.8,.2,19.5,'e3trough',nz);B(-20.2,0,24.5,-15.8,.2,24.7,'e3trough',nz);B(-20.2,0,19.5,-20,.2,24.5,'e3trough',nz);
  // ---- blast furnace No. 2 (middle): fire brick to 6 m, the steel shell to the roof and above it, the bustle pipe, the taphole ----
  for(const [x0,z0,x1,z1] of [[-9,19,1,25],[-8,18,0,26],[-7,17,-1,27]]){B(x0,0,z0,x1,6,z1,'e3brick');B(x0,6,z0,x1,18.4,z1,'e3shell')}
  B(-7,18.8,19,-1,30,25,'e3shell');B(-6,30,20,-2,34,24,'e3shell');B(-4.4,34,21.6,-3.6,34.5,22.4,'lampR',nz);LIGHT(-4,35,22,'#ff3a2a',10,.9,{flick:.2});
  for(const [x0,z0,x1,z1] of [[-10.4,15.6,2.4,16.3],[-10.4,27.7,2.4,28.4],[-10.4,16.3,-9.7,27.7],[1.7,16.3,2.4,27.7]])B(x0,6.4,z0,x1,7.2,z1,'pipe',nz);
  for(const [x,z] of [[-4,16],[-4,28],[-9.6,22],[1.6,22],[-7.6,17.6],[-.4,17.6],[-7.6,26.4],[-.4,26.4]])B(x-.15,5.3,z-.15,x+.15,6.6,z+.15,'pipe',nz);
  B(1,.3,21.5,1.3,1.1,22.5,'e3moltS',nz);B(1.4,0,24,3.4,1.6,26,'e3loco');B(1.4,1.6,24.4,2.6,2.2,25.6,'e3rust',nz);B(1.3,1.4,20.8,1.36,2.2,23.2,'e3sHot',nz);
  // the iron runner (east, to the casting bay; a plate bridges it) and the slag runner (west, to the pit): curbs; the iron itself flows (ep3Mesh)
  B(1.3,0,21.2,17.5,.18,21.4,'e3trough',nz);B(1.3,0,22.6,17.5,.18,22.8,'e3trough',nz);B(-16,0,21.2,-9,.18,21.4,'e3trough',nz);B(-16,0,22.6,-9,.18,22.8,'e3trough',nz);
  B(7.2,0,20.9,8.8,.12,23.1,'e3floor');
  // the 5 m and 10 m catwalks round the furnace, their columns, the stairs (floor → 5 m in the south-west, 5 m → 10 m in the east)
  for(const y of [5,10]){B(-12,y-.3,14,4,y,16,'e3grate');B(-12,y-.3,28,4,y,30,'e3grate');B(-12,y-.3,16,-10,y,28,'e3grate');B(2,y-.3,16,4,y,28,'e3grate');
    e3railX(-12,4,13.96,y);e3railX(-12,4,30.04,y);e3railZ(y>5?14:16,30,-12.04,y);e3railX(-10,2,16.04,y);e3railX(-10,2,27.96,y);e3railZ(16,28,-9.96,y);e3railZ(16,28,1.96,y)}
  e3railZ(16,30,4.04,5);e3railZ(16,26,4.04,10);
  for(const [x,z] of [[-12,14],[4,14],[-12,30],[4,30]])B(x-.2,0,z-.2,x+.2,10,z+.2,'e3col');
  e3stairs('x',14,16,-22,-12,0,5,12,true,true);
  B(4,4.7,14,5.6,5,16,'e3grate');e3railX(4,5.6,13.96,5);e3railZ(14,16,5.64,5);e3stairs('z',4,5.6,16,26,5,10,12,false,true);
  B(4,9.7,26,5.6,10,30,'e3grate');e3railZ(26,30,5.64,10);e3railX(4,5.6,30.04,10);
  LIGHT(-4,9.4,15,'#ffcf8a',7,.6);LIGHT(-4,9.4,29,'#ffcf8a',7,.6);B(-4.3,9.9,14.4,-3.7,10,14.6,'lampO',nz);B(-4.3,9.9,29.4,-3.7,10,29.6,'lampO',nz);
  // ---- the casting bay (east): the crane's runway beams, the bridge crane over the pour spot, the two lever booths, ingot moulds ----
  for(const x of [12,20,28]){B(x-.3,0,2.4,x+.3,13.4,3.2,'e3col');B(x-.3,0,41.2,x+.3,13.4,42,'e3col')}
  B(10,13.4,2.6,32,14,3.4,'e3rust',nz);B(10,13.4,41,32,14,41.8,'e3rust',nz);
  B(19.4,14,3,20.2,15.2,41,'e3loco',nz);B(22.6,14,3,23.4,15.2,41,'e3loco',nz);B(19,14,3,23.8,15.4,4.2,'e3rust',nz);B(19,14,39.8,23.8,15.4,41,'e3rust',nz);
  B(19.4,15.2,20.4,23.4,16.4,23.6,'e3rust',nz);B(20.6,11.8,6,22.6,13.8,8,'e3loco',{nosolid:true,f:{nx:'carGl'}});
  for(const [x,z] of [[20.4,21],[20.4,23],[22.4,21],[22.4,23]])B(x-.04,12.4,z-.04,x+.04,15.2,z+.04,'metal2',nz);
  B(17.8,0,17.8,26.2,.015,26.2,'e3pour',nz);
  e3booth(12,10);e3booth(12,30);
  B(27,0,13,30.6,.8,18,'e3mold');B(27,0,26,30.6,.8,31,'e3mold');
  for(const [x0,z0] of [[17,6],[17,35.6],[26,5],[26,36.6]]){B(x0,0,z0,x0+2.4,1.3,z0+2.4,'e3iron')}
  LIGHT(21.4,13,22,'#ffd8a0',16,.85);LIGHT(26,6,30,'#ffcf8a',12,.6);
  // ---- the hazards KHEPRI's fight uses: gas valves (shoot → a pillar of fire), coolant tanks (shoot → steam) ----
  const GV=[[-14.5,0,12,-13.2,13.2],[6.5,0,12,5.2,13.2],[-14.5,0,32,-13.2,30.8],[6.5,0,32,5.2,30.8],[-39.4,0,16,-38,16],[-39.4,0,28,-38,28],[14,8,-3.2,14,-2]];
  GV.forEach((g,i)=>e3gas(i,g[0],g[1],g[2],g[3],g[4],g[1]>0?3.4:6));
  const CT=[[-37.6,22],[8,39.6],[29.6,22]];CT.forEach(([x,z],i)=>{MAP.deco.push({k:'drum',x,y:0,z,r:1.25,h:4.6,mat:'e3tank',rot:i*1.3});B(x-1.05,0,z-1.05,x+1.05,4.6,z+1.05,'metalx',{eh:{k:'ct',i}});B(x-1.3,4.6,z-1.3,x+1.3,4.75,z+1.3,'e3rust');B(x-.2,4.75,z-.2,x+.2,6,z+.2,'pipe',nz)});
  // ---- the hall's light: sodium lamps high on the walls, the furnace and the runners glowing ----
  for(const [x,z] of [[-30,3],[-6,3],[18,3],[-30,41.4],[-6,41.4],[18,41.4]]){B(x-.5,12.8,z-.2,x+.5,13.2,z+.2,'lampO',nz);LIGHT(x,12.4,z<20?z+1.2:z-1.2,'#ffcf8a',26,.95)}
  for(const [x,z] of [[-28,12],[-28,32],[-16,8],[-16,36],[8,8],[8,36],[27,12],[27,32]]){B(x-.06,15.2,z-.06,x+.06,16.6,z+.06,'metal2',nz);B(x-.45,14.9,z-.45,x+.45,15.2,z+.45,'lampO',nz);LIGHT(x,14.4,z,'#ffcf8a',19,.72)}
  LIGHT(-30,12,22,'#ffcf8a',18,.6);LIGHT(2.6,1.4,22,'#ff7a2a',12,1.25,{flick:.3});LIGHT(-4,3,15.4,'#ff6a20',9,.6);LIGHT(-4,3,28.6,'#ff6a20',9,.6);
  for(const x of [5,11,16])LIGHT(x,.7,22,'#ff6a20',6,.85,{flick:.2});LIGHT(-12.5,.7,22,'#ff6a20',6,.85,{flick:.2});LIGHT(-18,.8,22,'#ff6a20',8,.9,{flick:.2});
  // the chimney north of the hall (its red lamps show from every zone)
  B(12,0,42.4,16,42,46.4,'e3brick');B(12.6,42,43,15.4,42.3,45.8,'e3rust');B(13.6,42.3,44,14.4,42.9,44.8,'lampR',nz);B(15.96,28,44,16.1,28.6,44.8,'lampR',nz);B(11.9,28,44,12.04,28.6,44.8,'lampR',nz);
  LIGHT(14,43,44.4,'#ff3a2a',12,.9,{flick:.2});LIGHT(16.6,28.2,44.4,'#ff3a2a',7,.6,{flick:.2});
  // ================= spawns, zones, gates, devices =================
  const A=[[-69,0,-21],[-69,0,-19.5],[-69,0,-18],[-70.5,0,-20.5],[-70.5,0,-19],[-70.5,0,-17.5],[-67.5,0,-20],[-67.5,0,-18.5]].map(p=>[p[0],p[1],p[2],-Math.PI/2]);
  const Bs=[[-23,0,-19.5],[-23,0,-18],[-23,0,-16.5],[-23,0,-15],[-21.6,0,-19],[-21.6,0,-17.2],[-21.6,0,-15.4],[-22.3,0,-14]].map(p=>[p[0],p[1],p[2],-Math.PI/2]);
  const Cs=[[30,8,-2.6],[30,8,-1.3],[31.4,8,-2.6],[31.4,8,-1.3],[32.8,8,-2.6],[32.8,8,-1.3],[29,8,-2],[33.6,8,-4.6]].map(p=>[p[0],p[1],p[2],Math.PI/2]);
  const Ds=[[8,0,5.6],[9.5,0,5.6],[11,0,5.6],[8,0,7.2],[9.5,0,7.2],[11,0,7.2],[12.5,0,6.4],[6.6,0,6.6]].map(p=>[p[0],p[1],p[2],2.05]);
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-72,-2],[-62,-2],[-30,-2],[-55,-43],[-36,-43],[-27.5,-30],[-27.5,-5],[-73,-28],[-73,-9]];
  const zB=[[-20,-30.5],[-4,-25],[12,-30.5],[30,-24],[33.5,-10],[4,-5],[-23,-4.5],[-8,-11.5],[22,-18]];
  const zC=[[-13,-1.6,8],[-12.4,-2.8,8],[13.4,-5,0],[13.4,-4,0],[-5,-1.6,9.4],[10,-1.6,9.4],[21,-1.6,9.4]];
  const zD=[[-38,4],[-38,40],[-20,40],[6,40],[30,40],[30,4],[-38,22],[22,40],[-24,4]];
  MAP.zspawns=[].concat(zA,zB,zC.map(p=>[p[0],p[1],p[2]]),zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-75,-45,-25,0],start:A,zsp:zA},B:{box:[-24.6,-32.2,35.2,-3.4],start:Bs,zsp:zB},C:{box:[-15,-3.4,35.2,2],start:Cs,zsp:zC},D:{box:[-40,2.4,32,42],start:Ds,zsp:zD}},
    door:{A:[-25,1.5,-17],B:[12,1.5,-5],C:[-12.5,9.6,2.2]},
    // stage 2: the three fuel valves, in order (12 s each): under the heavy-oil tank, in the pump house, upstairs in the signal box
    valve:[dv(-16,0,-9.9,['연료 밸브 1 · 중유 탱크','Fuel valve 1 · oil tank'],['연료 밸브 열기','open the fuel valve'],12,0,-.5),dv(-4.5,0,-28.8,['연료 밸브 2 · 펌프실','Fuel valve 2 · pump house'],['연료 밸브 열기','open the fuel valve'],12,0,.6),
      dv(23.3,3.5,-30,['연료 밸브 3 · 신호소 2층','Fuel valve 3 · signal box'],['연료 밸브 열기','open the fuel valve'],12,0,.6)],
    // KHEPRI's fight: explosive drums (z: the zone), gas valves (p the pipe, f the pillar of fire), coolant tanks, scrap heaps, loose scrap, the runners
    drums:[[-64,0,-31.5,'A'],[-49,0,-22,'A'],[-41,0,-31,'A'],[-31,0,-12,'A'],[-56,0,-8,'A'],[-6,0,-26,'B'],[6,0,-8.4,'B'],[-14,0,-14,'B'],[22,0,-24,'B'],[-12,8,-2.7,'C'],[19,8,-2.7,'C'],
      [-37,0,5.5,'D'],[-37,0,38.5,'D'],[-24,0,39.5,'D'],[-25,0,5,'D'],[-14,0,36.5,'D'],[7,0,16.6,'D'],[25.5,0,9.5,'D'],[24.5,0,34.5,'D']].map(d=>({x:d[0],y:d[1],z:d[2],zn:d[3]})),
    gas:GV.map(g=>({px:g[0],y:g[1],pz:g[2],x:g[3],z:g[4],zn:g[1]>0?'C':'D'})),
    cool:CT.map(([x,z])=>({x,y:0,z})),
    heaps:[{x:-32,z:11,fx:-27.4,fz:11},{x:-32,z:33,fx:-27.4,fz:33}],
    scrap:[[-36,17],[-29,6],[-29,38.4],[-37,27],[-20,27],[-20,16.5],[-12,38],[-8,9],[12,38],[27,9.4]].map(([x,z])=>({x,y:0,z})),
    // the molten runners (x0,z0,x1,z1): the iron runner in two stretches either side of its bridge, the slag runner, the slag pit
    rails:[[1.3,21.4,7.2,22.6],[8.8,21.4,17.5,22.6],[-16,21.4,-9,22.6],[-20,19.5,-16,24.5]],
    // the ladle over the pour spot, the two lever desks (S, N)
    ladle:{x:21.2,y:11.6,z:22,spot:[22,0,22],r:4,lev:[{x:15.2,z:12,bx:-.55,bz:0},{x:15.2,z:32,bx:-.55,bz:0}]},
    // phase 2's perches on the catwalks, where each phase's flight lands, the gallery's breach, the scrap mountain's top (stage 1's glimpse)
    perch:[{x:-4,y:5,z:15},{x:-4,y:5,z:29},{x:-11,y:5,z:22},{x:3,y:5,z:22},{x:-4,y:10,z:15},{x:-4,y:10,z:29}],
    pf:[[-25,0,22],[-4,0,11],[23,0,27]],
    gal:{x:1,y:8,z:-1.4,out:[1,12,-12]},
    cut:{p0:[-62.5,6.4,-39],p1:[-69.5,6.4,-39],out:[-80,-2,-39]},
    flare:[32,16.4,-29]};
  MAP.camps=[{k:'a',w:.2,p:[[-50,0,-18],[-52,0,-20]],look:[-66,1,-18]},{k:'b',w:.2,p:[[0,0,-19]],look:[-20,1,-17]},{k:'c',w:.2,p:[[10,8,-1.6]],look:[28,9,-1.6]},{k:'d',w:.2,p:[[8,0,10]],look:[-20,1,22]}];
  MAP.moon={d:new THREE.Vector3(-.78,.32,.28).normalize(),c:new THREE.Color('#9a6450'),i:.62};MAP.spawnYaw=-Math.PI/2;
  MAP.cam=(t,cam)=>{const a=t*.05;cam.position.set(-4+Math.sin(a)*21,8.5,22+Math.cos(a)*15);cam.lookAt(-4,4,22)}}
// the iron in the runners and the slag pit: its own meshes, the texture sliding along the runner (LU.uTime) and brightening once the
// furnace is lit (E3MOLT.uOn, set by the chapter)
const E3MOLT={uOn:{value:1}};
function ep3Mesh(scene){const R0=MAP.ez&&MAP.ez.rails;if(!R0)return;const pos=[],uv=[],idx=[];
  for(const [x0,z0,x1,z1] of R0){const b=pos.length/3,y=.035,L=Math.max(x1-x0,z1-z0)/2,W=Math.min(x1-x0,z1-z0)/2;pos.push(x0,y,z0,x1,y,z0,x1,y,z1,x0,y,z1);
    if(x1-x0>=z1-z0)uv.push(x0/2,0,x1/2,0,x1/2,W,x0/2,W);else uv.push(0,z0/2,W,z0/2,W,z1/2,0,z1/2);idx.push(b,b+2,b+1,b,b+3,b+2);void L}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:TEX.e3moltA},uOn:E3MOLT.uOn},LU),vertexShader:VS_WORLD,
    fragmentShader:GLSL_DYN+`uniform sampler2D map;uniform float uOn;uniform float uTime;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
      void main(){vec2 u=vUv+vec2(uTime*.11,sin(uTime*.6+vUv.x*2.)*.03);vec3 a=texture2D(map,u).rgb,b=texture2D(map,vUv*vec2(.7,1.3)+vec2(uTime*.05,.37)).rgb;
        vec3 c=(a*.7+b*.4)*mix(.18,1.55,uOn);gl_FragColor=vec4(applyFog(c,vPos),1.);}`});
  const mesh=new THREE.Mesh(g,m);mesh.matrixAutoUpdate=false;mesh.updateMatrix();scene.add(mesh);MAP.meshes.push(mesh)}
MAPDEFS.ep3={n:['녹슨 제철소','The Rusted Steel Works'],d:['해 질 녘 잿가루가 내리는 버려진 제철소. 고철 야적장 → 철로 야적장 → 원료 컨베이어 통로 → 고로 홀과 주조장.','An abandoned steel works at dusk, ash drifting down: the scrap yard, the rail yard, the conveyor gallery, then the blast-furnace hall and its casting bay.'],
  env:{sky:1,skyTex:'e3sky',ash:1,rain:0,storm:0,fog:'#1a1416',fogD:.02,halo:'#8a4a2a',ambOut:'#463a40',ambIn:'#2e2624',boAmb:.45},bounds:[-78,-48,38,47],probeY:[-.4,.9,2.4,4.4,6.4,8.9,10.9,13.5],
  build:buildEp3,tex:bakeEp3Tex,mesh:ep3Mesh,ep:3};

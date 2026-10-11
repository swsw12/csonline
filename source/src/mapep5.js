'use strict';
// ============ Chapter 5 map "새벽천 대심도 방수로" (the Saebyeok Stream deep storm-water tunnel): four zones played in order ============
// A  the management yard, on the surface (y 33)   x 30..78   z -52..-16.2 → the cage lift down to the tunnel (gates gLt / gLb)
// B  the inflow tunnel (walkways y 0, channel -1.6) leg 1 x -6..76 z -50..-38 (from the lift west), leg 2 x -6..6 z -38..-20 → the tank (gB)
// C  the surge tank (y 0, roof 18)                x -32..32  z -20..20: 24 pillars, two deep trenches, the pump dais, a walkway grid at
//    y 4 over the floor (pillar platforms, bridges, the four wall walkways); the inflow sluice in the west wall (gW), the shaft gate east (gS)
// D  shaft No. 3 (y 0..45, centre 53,0, r 15)     a ramp up its wall to the yard (landings at 11 and 22 m, the door gX at 33 m)
// Night, a downpour on the surface; underground wet concrete, sodium lamps, the sound of water, the nest's green glow at the bottom.
// The shaft is round: its walls, ramp, parapet and column are meshes (ep5Mesh), its collision invisible boxes laid on a 0.5 m grid
// (e5ShaftBoxes). The water is a few animated planes whose height the chapter moves (E5W, tiamat.js).
Object.assign(MATS,{
  e5conc:{t:'e5conc',s:3,k:'stone'},e5floor:{t:'e5floor',s:2.5,k:'stone'},e5pil:{t:'e5pil',s:4,k:'stone'},e5ring:{t:'e5ring',s:2.4,k:'stone'},e5walk:{t:'e5walk',s:2,k:'stone'},
  e5trench:{t:'e5trench',s:2,k:'stone'},e5grate:{t:'e5grate',s:1,k:'metal'},e5rail:{t:'e5rail',s:1,k:'metal'},e5rust:{t:'e5rust',s:2,k:'metal'},e5gate:{t:'e5gate',uv:'box',k:'metal'},
  e5pump:{t:'e5pump',s:1.5,k:'metal'},e5asph:{t:'e5asph',s:3,k:'soft'},e5bldg:{t:'e5bldg',s:3,k:'stone'},e5lift:{t:'e5lift',s:1.5,k:'metal'},e5roof:{t:'e5roof',s:3,k:'metal'},
  e5floorD:{t:'e5floorD',s:3,k:'stone'},e5nest:{t:'e5nest',s:2,emis:.4,k:'soft'},e5wheel:{t:'e5wheel',uv:'box',emis:.12,k:'metal'},e5grill:{t:'e5grill',s:1,k:'metal'},
  e5panel:{t:'e5panel',uv:'box',emis:.45,k:'metal'},e5fan:{t:'e5fan',uv:'box',k:'metal'},e5sand:{t:'e5sand',s:2,k:'soft'},e5pipe:{t:'e5pipe',s:1.5,k:'metal'},e5wall:{t:'e5wall',s:3,k:'stone'},
  e5sMain:{t:'e5sMain',uv:'box',emis:.3,k:'metal'},e5sLift:{t:'e5sLift',uv:'box',emis:.3,k:'metal'},e5sDepth:{t:'e5sDepth',uv:'box',emis:.25,k:'metal'},e5sTank:{t:'e5sTank',uv:'box',emis:.3,k:'metal'},
  e5sShaft:{t:'e5sShaft',uv:'box',emis:.3,k:'metal'},e5sExit:{t:'e5sExit',uv:'box',emis:.6,k:'metal'},e5sPump:{t:'e5sPump',uv:'box',emis:.25,k:'metal'},e5sGate:{t:'e5sGate',uv:'box',emis:.3,k:'metal'},
  e5sOffice:{t:'e5sOffice',uv:'box',emis:.3,k:'metal'},e5sWarn:{t:'e5sWarn',uv:'box',emis:.3,k:'metal'},e5sFan:{t:'e5sFan',uv:'box',emis:.3,k:'metal'},e5sTun:{t:'e5sTun',uv:'box',emis:.3,k:'metal'},
  e5sInflow:{t:'e5sInflow',uv:'box',emis:.3,k:'metal'},e5door:{t:'e5door',uv:'box',k:'metal'}});

// ---------- textures (painted on first load) ----------
// the tank and tunnel walls: dark wet concrete, board marks, a green-black bloom of algae creeping up from the foot, calcite tears
function texE5Conc(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,44,5011,4)*1.05-.05+(P.n(x,y,6,5012,2)-.5)*.14+(hash2(x,y,5013)-.5)*.07;let c=dith(P,x,y,t,['#22272a','#2a3033','#31383b','#394144','#414a4c','#4a5354'],.1);
    if(x%64<2)c=dk(c,.25);const a=P.n(x,y,26,5014,3);if(a>.58)c=mix(c,'#1e2a1c',clamp((a-.58)*2.4,0,.65));P.set(x,y,c)}
  for(let i=0;i<30;i++){const x=Math.floor(hash2(i,1,5015)*N);for(let k=0;k<40+hash2(i,2,5015)*120;k++)P.set(x+Math.round(Math.sin(k*.15+i)*.8),Math.floor(hash2(i,3,5015)*N)+k,'#8a948e',.22)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,5016)*N),Math.floor(hash2(i,2,5016)*N),30+Math.floor(hash2(i,3,5016)*100),.2,2);pits(P,160,5017,'#121616','#5a6460')})}
// wet floor concrete: silt, standing water that shines (lighter, bluer), saw cuts
function texE5Floor(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,48,5021,4)*1.05-.05+(hash2(x,y,5022)-.5)*.07;let c=dith(P,x,y,t,['#1c2022','#232829','#2a3031','#323839','#3a4141'],.1);
    const w=P.n(x,y,34,5023,3);if(w>.6)c=mix(c,'#3a4a52',clamp((w-.6)*3,0,.7));const s=P.n(x,y,18,5024,3);if(s<.3)c=mix(c,'#3a3426',clamp((.3-s)*2.4,0,.5));
    if(x%128<2||y%128<2)c='#121516';P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,5025)*N,hash2(i,2,5025)*N,10+hash2(i,3,5025)*28,8+hash2(i,4,5025)*20,.3,5026+i)})}
// a surge-tank pillar: smooth grey concrete, form lines every half metre, tie holes, black water marks running down
function texE5Pil(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,60,5031,4)*.9+.12+(P.n(x,y,8,5032,2)-.5)*.1+(hash2(x,y,5033)-.5)*.06;let c=dith(P,x,y,t,['#3c4142','#454b4b','#4e5454','#585e5d','#626866','#6c726f'],.1);
    if(y%32===0)c=dk(c,.35);else if(y%32===1)c=lt(c,.08);P.set(x,y,c)}
  for(const py of [16,80,144,208])for(const px of [32,96,160,224]){for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const r=Math.hypot(i,j);if(r<2.3)P.set(px+i,py+j,'#16191a');else if(r<3.4&&j>0)P.set(px+i,py+j,'#6e7472',.5)}}
  for(let i=0;i<34;i++)streak(P,Math.floor(hash2(i,1,5034)*N),Math.floor(hash2(i,2,5034)*N),40+Math.floor(hash2(i,3,5034)*150),.22,1+(i%3===0?1:0));pits(P,120,5035,'#202424','#7a807c')})}
// precast tunnel rings: a joint every 1.2 m, a grid of bolt pockets, seepage and algae
function texE5Ring(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,5041,4)*1.05-.05+(hash2(x,y,5042)-.5)*.07;let c=dith(P,x,y,t,['#272c2d','#2f3535','#373e3e','#404747','#495151'],.1);
    const lx=x%128;if(lx<3)c=lx===1?'#121515':'#1a1e1e';else if(lx===3)c=lt(c,.12);
    const bx=(x+32)%64,by=y%64;if(bx>26&&bx<38&&by>24&&by<40)c=bx===27||by===25?'#14181a':'#1e2324';if(bx>29&&bx<35&&by>29&&by<35)c='#5a4a3a';
    const a=P.n(x,y,24,5043,3);if(a>.6)c=mix(c,'#22301e',clamp((a-.6)*2.6,0,.6));P.set(x,y,c)}
  for(let i=0;i<26;i++){const x=Math.floor(hash2(i,1,5044)*N);for(let k=0;k<30+hash2(i,2,5044)*90;k++)P.set(x+Math.round(Math.sin(k*.2+i)),Math.floor(hash2(i,3,5044)*N)+k,'#9aa29c',.25)}})}
// the walkways: rough concrete, an anti-slip brush texture, drips from above
function texE5Walk(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,5051,3)*.9+.08+(hash2(x,y,5052)-.5)*.12;if(y%6<2)t-=.06;let c=dith(P,x,y,t,['#272b2b','#2e3333','#363b3b','#3e4343','#464b4a'],.12);
    if(x%128<2)c='#161919';const w=P.n(x,y,30,5053,3);if(w>.64)c=mix(c,'#3e4c54',clamp((w-.64)*3,0,.6));P.set(x,y,c)}})}
// the trenches: black-green slime, a bright tide line, weed
function texE5Trench(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,30,5061,4)+(hash2(x,y,5062)-.5)*.1;let c=dith(P,x,y,t,['#0e1410','#141c16','#1a241c','#202c22','#283428'],.12);
    const s=P.n(x,y,10,5063,3);if(s>.62)c=mix(c,'#3a4a24',clamp((s-.62)*2.5,0,.7));if(y%128<3)c='#56604e';P.set(x,y,c)}})}
// a sluice gate: blue-grey painted steel, vertical stiffeners, rust bleeding from the seams, stencils
function texE5Gate(){const W=256,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3e5462','#2e404c',P.n(x,y,30,5071,3));if(x%42<5)c=x%42<2?'#1c2830':lt(c,.15);if(y%64<3)c='#1a242a';
    const r=P.n(x,y,14,5072,3);if(r>.55)c=mix(c,'#7a4220',clamp((r-.55)*2.4,0,.8));if(y>H-26)c=Math.floor((x+y)/16)%2?'#c8a01e':'#141412';P.set(x,y,c)}
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,1,5073)*W),2+Math.floor(hash2(i,2,5073)*4)*64,20+Math.floor(hash2(i,3,5073)*60),.25,2);
  P.post=ctx=>{ctx.fillStyle='rgba(230,236,240,.75)';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText('수문',128,104);ctx.font='bold 18px sans-serif';ctx.fillText('SLUICE · 출입금지',128,136)}})}
// the emergency door at the top of the shaft: green-grey steel, a wired-glass window, a push bar, the exit stencil
function texE5Door(){const W=128,H=128;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3e5446','#2e4236',P.n(x,y,24,5075,3));if(x<4||x>=W-4||y<4)c='#18221c';else if(x<6||x>=W-6||y<6)c=lt(c,.12);
    if(x>40&&x<88&&y>18&&y<46)c=((x+y)%7===0||(x-y+200)%7===0)?'#4a5a5a':'#1a2628';if(y>66&&y<74&&x>14&&x<W-14)c=y===67?'#c8ccc4':'#8a8e86';
    const r=P.n(x,y,10,5076,3);if(r>.64)c=mix(c,'#6a3a1c',clamp((r-.64)*2.4,0,.7));if(y>H-14)c=Math.floor((x+y)/10)%2?'#c8a01e':'#141412';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(220,240,220,.8)';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('비상구 · EXIT',64,96)}})}
function texE5Pump(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#3e5a48','#2c4434',P.n(x,y,20,5081,3));if(x%64<2||y%64<2)c='#16221a';if((x%64===8||x%64===56)&&y%16===8)c='#8a9a8a';
  const r=P.n(x,y,10,5082,3);if(r>.6)c=mix(c,'#6a3a1c',(r-.6)*2.2);P.set(x,y,c)}})}
// the yard: wet asphalt, puddles holding the floodlights, a faded lane line
function texE5Asph(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,30,5091,3)*.8+.1+(hash2(x>>1,y>>1,5092)-.5)*.2;let c=dith(P,x,y,t,['#141516','#1a1c1d','#202223','#27292a','#2e3031'],.14);
    const w=P.n(x,y,40,5093,4);if(w>.6)c=mix(c,'#4a5862',clamp((w-.6)*3.4,0,.85));if(hash2(x,y,5094)<.012)c='#4a4c4c';P.set(x,y,c)}
  for(let y=0;y<N;y++)for(let x=120;x<132;x++)if(P.n(x,y,8,5095,2)>.4)P.set(x,y,'#b8a670',.5)})}
function texE5Bldg(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,5101,3)*.6+.35+(hash2(x,y,5102)-.5)*.06;let c=dith(P,x,y,t,['#6e6a5e','#78746a','#827e72','#8c887c','#969286'],.1);if(y%128>96&&y%128<112)c=mix('#2a5a5e','#24484c',P.n(x,y,20,5103,2));
    if(x%128<2)c=dk(c,.3);P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,5104)*N),Math.floor(hash2(i,2,5104)*N),30+Math.floor(hash2(i,3,5104)*120),.22,2)})}
// the cage lift: diamond plate, yellow and black chevrons along the foot
function texE5Lift(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#5a5e60','#46494b',P.n(x,y,20,5111,2));if(((x+(y>>3)*4)%16<3)&&(y%8<3))c=lt(c,.2);
  if(y>N-18)c=Math.floor((x+y)/12)%2?'#c8a01e':'#141412';P.set(x,y,c)}})}
// the shaft's floor: wet concrete grown over by the nest — flesh-dark patches with glowing green veins
function texE5FloorD(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,48,5121,4)+(hash2(x,y,5122)-.5)*.07;let c=dith(P,x,y,t,['#1a1e1e','#212626','#282e2e','#303636'],.1);
    const n=P.n(x,y,36,5123,4);if(n>.55){c=mix(c,'#1e1418',clamp((n-.55)*3,0,.9));const v=Math.abs(Math.sin((x*.07+P.n(x,y,20,5124,2)*6)));if(v<.06&&n>.6)c='#7aff9a'}P.set(x,y,c)}})}
// the nest: dark wet flesh, ropes of tissue, glowing veins and pods (the material glows a little)
function texE5Nest(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,22,5131,4);let c=t>.62?'#3a2a2e':t>.45?'#2a1c20':'#180f12';const v=Math.abs(Math.sin(x*.05+y*.03+P.n(x,y,30,5132,3)*7));
    if(v<.05)c='#9affb0';else if(v<.11)c=mix(c,'#3a8a4a',.6);const p=P.n(x,y,9,5133,2);if(p>.72)c=mix('#c8ff8a','#6aa848',(p-.72)*3);P.set(x,y,c)}})}
function texE5Grill(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=x%16<4;let c=b?mix('#4a4e4c','#2e3230',P.n(x,y,12,5141,2)):'#060807';if(b&&P.n(x,y,8,5142,2)>.62)c='#6a3a1c';if(y%64<4)c='#3a3e3c';P.set(x,y,c)}})}
function texE5Panel(){const W=192,H=128;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3e4a4e','#2e3a3e',P.n(x,y,20,5151,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#141a1c';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#0a1a0e';ctx.fillRect(16,16,90,44);ctx.fillStyle='#40ff70';ctx.font='bold 13px monospace';ctx.fillText('WL  -1.2m',22,34);ctx.fillText('PUMP  OFF',22,52);
    for(const [cx,cy,col] of [[128,30,'#ff3020'],[152,30,'#ffb020'],[176,30,'#30d040']]){ctx.fillStyle=col;ctx.beginPath();ctx.arc(cx,cy,8,0,TAU);ctx.fill()}
    ctx.fillStyle='#e8e4c8';ctx.font='bold 14px sans-serif';ctx.fillText('배수 제어 · DRAIN',20,96);ctx.fillStyle='#d83020';ctx.fillRect(140,70,34,34)}})}
function texE5Fan(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-63.5,y-63.5)/63.5;let c=r>.92?'#2a2e2e':(Math.floor(r*10)%2?'#3a3e3e':'#101212');
  if(Math.abs(x-63.5)<3||Math.abs(y-63.5)<3)c='#4a4e4e';if(r<.16)c='#5a5e5e';P.set(x,y,c)}})}
function texE5Sand(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,20,5161,3)+(hash2(x,y,5162)-.5)*.12;P.set(x,y,dith(P,x,y,t,['#2a2620','#322d25','#3a342a','#433c30'],.12))}})}
function texE5Pipe(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2a4a5a','#1e3a48',P.n(x,y,18,5171,3));if(y%64<5)c=y%64<2?'#121e24':'#3a5a6a';const r=P.n(x,y,10,5172,3);if(r>.62)c=mix(c,'#6a3a1c',(r-.62)*2);P.set(x,y,c)}})}
function texE5Wall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,5181,4)*.9+.1+(hash2(x,y,5182)-.5)*.07;let c=dith(P,x,y,t,['#4a4c48','#545650','#5e6058','#686a62','#727468'],.1);
  if(y%128<2||x%256<2)c=dk(c,.3);P.set(x,y,c)}for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,5183)*N),Math.floor(hash2(i,2,5183)*N),30+Math.floor(hash2(i,3,5183)*100),.22,2)})}
// the shaft's own meshes: the wall (curved precast panels, a joint every 3 m, rusty seeps), the ramp, its parapet, the column
function texE5Shaft(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,5191,4)*1.05-.05+(P.n(x,y,7,5192,2)-.5)*.12+(hash2(x,y,5193)-.5)*.06;let c=dith(P,x,y,t,['#272b2c','#2f3434','#373c3c','#3f4545','#484e4d','#515755'],.1);
    if(y%128<3)c=y%128===1?'#141717':'#1c2020';if(x%170<2)c=dk(c,.3);const a=P.n(x,y,22,5194,3);if(a>.62)c=mix(c,'#20301e',clamp((a-.62)*2.6,0,.6));P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,5195)*N),Math.floor(hash2(i,2,5195)*2)*128+3,40+Math.floor(hash2(i,3,5195)*80),.25,2);
  for(let i=0;i<10;i++){const x=Math.floor(hash2(i,1,5196)*N),y0=Math.floor(hash2(i,2,5196)*2)*128+4;for(let k=0;k<50;k++)P.set(x+Math.round(Math.sin(k*.2)),y0+k,k<20?'#7a4a22':'#5a3418',.5-k/120)}})}
function texE5Ramp(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,5201,3)*.8+.12+(hash2(x,y,5202)-.5)*.1;if(x%16<3)t-=.12;let c=dith(P,x,y,t,['#272b2b','#2f3434','#373c3c','#404545','#484d4c'],.12);
    const w=P.n(x,y,28,5203,3);if(w>.62)c=mix(c,'#3e4e56',clamp((w-.62)*3,0,.6));if(y>232)c=Math.floor((x+y)/14)%2?'#b8921c':'#18181a';P.set(x,y,c)}})}
function texE5Par(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,44,5211,3)*.85+.12+(hash2(x,y,5212)-.5)*.07;let c=dith(P,x,y,t,['#3a3f3f','#434848','#4c5151','#565b5a'],.1);if(x%128<2)c=dk(c,.35);
    if(y<20)c=Math.floor((x+y)/16)%2?'#c8a01e':'#141412';P.set(x,y,c)}for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,5213)*N),20,30+Math.floor(hash2(i,2,5213)*100),.22,1)})}
function texE5Colm(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,60,5221,4)*.9+.1+(hash2(x,y,5222)-.5)*.06;let c=dith(P,x,y,t,['#363b3c','#3f4545','#484e4e','#525858','#5c6262'],.1);if(y%64<2)c=dk(c,.3);P.set(x,y,c)}
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,1,5223)*N),Math.floor(hash2(i,2,5223)*N),40+Math.floor(hash2(i,3,5223)*140),.24,2);
  P.post=ctx=>{ctx.fillStyle='rgba(216,170,40,.7)';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText('▲ 지상',128,60);ctx.font='bold 22px sans-serif';ctx.fillText('SHAFT No.3',128,92)}})}
// the grating over the top of the shaft (alpha holes: the storm shows through)
function texE5Grid(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=x%32<5||y%32<5;if(!b){P.set(x,y,'#000');P.alpha(x,y,0);continue}P.set(x,y,mix('#2a2e2e','#3e4242',P.n(x,y,16,5231,2)))}})}
function texE5Drum(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,5241,4)*.8+.2+(hash2(x,y,5242)-.5)*.06;let c=dith(P,x,y,t,['#4a4e4c','#545856','#5e6260','#686c6a','#727674'],.1);if(y%128<2)c=dk(c,.3);P.set(x,y,c)}
  for(let i=0;i<40;i++)streak(P,Math.floor(hash2(i,1,5243)*N),Math.floor(hash2(i,2,5243)*N),40+Math.floor(hash2(i,3,5243)*140),.25,2)})}
// a storm overhead: low cloud lit from below by the city, rain curtains
function texE5Sky(){return paint(1024,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<1024;x++){const t=y/255;let c=mix('#07080c','#1e2228',Math.pow(t,1.6));const n=fbm(x/110,y/30,5251,5,1024/110);
  if(n>.45)c=mix(c,t>.5?'#3a3e44':'#14161a',clamp((n-.45)*2.4,0,.85));if(t>.7)c=mix(c,'#4a3a2a',clamp((t-.7)*1.4,0,.5)*(.6+.4*Math.sin(x/1024*TAU*3)));P.set(x,y,c)}})}
// the water's ripple pattern (a tileable noise the shader slides two ways)
function texE5Wn(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=fbm(x/16,y/16,5261,4,8);P.set(x,y,[Math.round(t*255),Math.round(fbm(x/22,y/22,5262,3,128/22)*255),128])}})}
function bakeEp5Tex(){if(TEX.e5conc)return;
  TEX.e5conc=mkTex(texE5Conc());TEX.e5floor=mkTex(texE5Floor());TEX.e5pil=mkTex(texE5Pil());TEX.e5ring=mkTex(texE5Ring());TEX.e5walk=mkTex(texE5Walk());TEX.e5trench=mkTex(texE5Trench());
  TEX.e5grate=mkTex(texE3Grate());TEX.e5rail=mkTex(texE3Yel());TEX.e5rust=mkTex(texE3Rust());TEX.e5gate=mkTex(texE5Gate(),false);TEX.e5door=mkTex(texE5Door(),false);TEX.e5pump=mkTex(texE5Pump());TEX.e5asph=mkTex(texE5Asph());
  TEX.e5bldg=mkTex(texE5Bldg());TEX.e5lift=mkTex(texE5Lift());TEX.e5roof=mkTex(texE3Roof());TEX.e5floorD=mkTex(texE5FloorD());TEX.e5nest=mkTex(texE5Nest());TEX.e5wheel=mkTex(texE3Wheel(),false);
  TEX.e5grill=mkTex(texE5Grill());TEX.e5panel=mkTex(texE5Panel(),false);TEX.e5fan=mkTex(texE5Fan(),false);TEX.e5sand=mkTex(texE5Sand());TEX.e5pipe=mkTex(texE5Pipe());TEX.e5wall=mkTex(texE5Wall());
  TEX.e5shaft=mkTex(texE5Shaft());TEX.e5ramp=mkTex(texE5Ramp());TEX.e5par=mkTex(texE5Par());TEX.e5colm=mkTex(texE5Colm());TEX.e5grid=mkTex(texE5Grid());TEX.e5drum=mkTex(texE5Drum());TEX.e5wn=mkTex(texE5Wn());
  TEX.e5wn.magFilter=THREE.LinearFilter;TEX.e5wn.minFilter=THREE.LinearMipmapLinearFilter;
  TEX.e5sky=mkTex(texE5Sky());TEX.e5sky.wrapT=THREE.ClampToEdgeWrapping;
  const S=(k,lines,bg,fg,w,h)=>{TEX[k]=mkTex(texSign(lines,bg,fg,w,h),false)};
  S('e5sMain',[{t:'새벽천 대심도 빗물 방수로'},{t:'제3수직구 · SAEBYEOK DEEP TUNNEL · SHAFT 3',s:7}],'#1e3a4a','#e8ecf0',200,40);
  S('e5sLift',[{t:'수직구 승강기 · -33 m'},{t:'SHAFT LIFT · CAGE 2',s:8}],'#c8a020','#141414',128,32);S('e5sDepth',[{t:'-33 m · 수위 경보'},{t:'DEPTH -33 m · FLOOD ALARM',s:7}],'#b82018','#ffffff',128,32);
  S('e5sTank',[{t:'조압수조'},{t:'SURGE TANK',s:8}],'#1e3a4a','#e8ecf0',112,30);S('e5sShaft',[{t:'제3수직구 → 지상'},{t:'SHAFT No.3 → SURFACE',s:7}],'#1e3a4a','#e8ecf0',128,30);
  S('e5sExit',[{t:'비상 탈출구 → 지상'},{t:'EMERGENCY EXIT',s:8}],'#1a7a3a','#ffffff',128,30);S('e5sPump',[{t:'수동 펌프'},{t:'MANUAL PUMP',s:8}],'#1e3a4a','#e8ecf0',96,28);
  S('e5sGate',[{t:'배수 수문'},{t:'DRAIN GATE',s:8}],'#c8a020','#141414',96,28);S('e5sOffice',[{t:'방수로 관리사무소'},{t:'TUNNEL CONTROL OFFICE',s:7}],'#1e3a4a','#e8ecf0',150,32);
  S('e5sWarn',[{t:'수위 급상승 주의 · 출입금지'},{t:'DANGER · RAPID FLOODING',s:7}],'#d8a41e','#141414',150,32);S('e5sFan',[{t:'환풍기'},{t:'VENT FAN',s:8}],'#1e3a4a','#e8ecf0',80,26);
  S('e5sTun',[{t:'제2유입수로 · 조압수조 →'},{t:'INFLOW TUNNEL 2 → SURGE TANK',s:7}],'#1e3a4a','#e8ecf0',150,32);S('e5sInflow',[{t:'유입 수문'},{t:'INFLOW SLUICE',s:8}],'#b82018','#ffffff',96,28)}

// ---------- the shaft: its shape, shared with the chapter (tiamat.js) ----------
// The ramp climbs the wall from the bottom at the west point (φ = π, where the tank's tunnel comes in) clockwise seen from above (φ falling),
// 33 m in 2.75 turns to the door at the north point (φ = −π/2). u = how far round it has come (radians from its foot). Landings: flat
// stretches at 11 and 22 m, and the top one, where the ramp widens inward (the inner edge from 12.05 m in to 9.8 m).
const E5D={cx:53,cz:0,R:15,Rw:16.2,Rc:3,Ri:12.05,RiL:9.8,top:45,yA:33,W:.45,WT:.6,EXT:.2};
{const U=5.5*Math.PI,k=33/(U-2*E5D.W-E5D.WT);E5D.U=U;E5D.k=k;E5D.u1=11/k;E5D.u2=E5D.u1+E5D.W+11/k;E5D.u3=E5D.u2+E5D.W+11/k}
// the ramp's height at u
function e5H(u){const D=E5D,k=D.k;if(u<=D.u1)return Math.max(0,k*u);if(u<=D.u1+D.W)return 11;if(u<=D.u2)return 11+k*(u-D.u1-D.W);if(u<=D.u2+D.W)return 22;if(u<=D.u3)return 22+k*(u-D.u2-D.W);return 33}
// its inner edge (the landings bulge inward), and whether u is on a landing
function e5Ri(u){const D=E5D,b=.16;let s=0;for(const [a0,a1] of [[D.u1,D.u1+D.W],[D.u2,D.u2+D.W],[D.u3,D.U+D.EXT]])s=Math.max(s,clamp(Math.min(u-(a0-b),(a1+b)-u)/b,0,1));return lerp(D.Ri,D.RiL,smooth(s))}
// world angle of u, the ramp point at u and radius r
const e5Phi=u=>Math.PI-u;
function e5At(u,r,out){const p=e5Phi(u);out=out||{};out.x=E5D.cx+Math.cos(p)*r;out.z=E5D.cz+Math.sin(p)*r;out.y=e5H(u);return out}
// every u at which the ramp passes over a world angle φ (one per turn)
function e5Us(phi){const D=E5D,u0=(((Math.PI-phi)%TAU)+TAU)%TAU,out=[];for(let u=u0;u<=D.U+D.EXT+1e-6;u+=TAU)out.push(u);return out}
// the ramp's u nearest a point (on the turn whose height is closest): {u, h, r}
function e5Near(x,y,z){const dx=x-E5D.cx,dz=z-E5D.cz,r=Math.hypot(dx,dz),L=e5Us(Math.atan2(dz,dx));let best=null,bd=1e9;for(const u of L){const h=e5H(u),d=Math.abs(h-y);if(d<bd){bd=d;best={u,h,r}}}return best}

// ---------- collision for the round shaft: invisible boxes on a 0.5 m grid, merged along rows (or columns where the ramp runs along x) ----------
function e5ShaftBoxes(){const D=E5D,S=.5,x0=D.cx-17.5,z0=D.cz-17.5,N=70,cells=new Map();
  const put=(key,i,j,top,bot,o)=>{let g=cells.get(key);if(!g){g={o,m:new Map()};cells.set(key,g)}g.m.set(i+','+j,{i,j,top,bot})};
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+(i+.5)*S,z=z0+(j+.5)*S,dx=x-D.cx,dz=z-D.cz,r=Math.hypot(dx,dz),phi=Math.atan2(dz,dx),ax=Math.abs(Math.cos(phi))>=Math.abs(Math.sin(phi))?'r':'c';
    // the floor (drawn), the column, the wall (with the tank tunnel's mouth at the west point and the yard door at the north point)
    if(r<15.4)put('fl',i,j,0,-1,{m:'e5floorD'});
    if(r<2.64)put('col',i,j,45,0,{m:'none'});
    if(r>=15.36&&r<16.7){const tun=dx<0&&Math.abs(dz)<3.7,door=dz<0&&Math.abs(dx)<2.3;
      if(tun)put('wt',i,j,45,3.6,{m:'none'});else if(door){put('wd0',i,j,33,0,{m:'none'});put('wd1',i,j,45,36,{m:'none'})}else put('w',i,j,45,0,{m:'none'})}
    // the ramp, every turn passing over this angle: the walkable slab and the parapet along its inner edge (the parapet lets shots through)
    if(r>=8.6&&r<15.36)for(const u of e5Us(phi)){const h=e5H(u),Ri=e5Ri(u),lap=Math.floor(u/TAU);
      if(u>D.U+D.EXT){if(u<D.U+D.EXT+.12&&r>=Ri-.9)put('pe'+lap,i,j,h+1.05,h-.42,{m:'none',pass:1});continue}
      if(r>=Ri&&h>=.12)put('w'+ax+lap,i,j,h-.083,h-.42,{m:'none',stair:1});// (stair: the nav graph treats the slope's 0.1 m steps as a stair)
      else if(r>=Ri-.95&&r<Ri-.3&&h>=.4)put('p'+ax+lap,i,j,h+1.05,h-.42,{m:'none',pass:1})}}
  // merge: rows (consecutive i) for keys of kind 'r' and the constant ones, columns for kind 'c'; heights within 0.09 m
  let n=0;for(const [key,g] of cells){const byCol=key[1]==='c',tol=.09,list=[...g.m.values()].sort((a,b)=>byCol?(a.i-b.i||a.j-b.j):(a.j-b.j||a.i-b.i));let run=null;
    const flush=()=>{if(!run)return;const xa=x0+run.i0*S,za=z0+run.j0*S,xb=x0+(run.i1+1)*S,zb=z0+(run.j1+1)*S,o=Object.assign({},g.o);const m=o.m;delete o.m;B(xa,run.bot,za,xb,run.top,zb,m,o);n++;run=null};
    for(const c of list){if(run&&(byCol?(c.i===run.i0&&c.j===run.j1+1):(c.j===run.j0&&c.i===run.i1+1))&&Math.abs(c.top-run.t0)<=tol&&Math.abs(c.bot-run.b0)<=tol){if(byCol)run.j1=c.j;else run.i1=c.i;run.top=Math.min(run.top,c.top);run.bot=Math.max(run.bot,c.bot);continue}
      flush();run={i0:c.i,i1:c.i,j0:c.j,j1:c.j,top:c.top,bot:c.bot,t0:c.top,b0:c.bot}}flush()}
  return n}

// ---------- geometry helpers ----------
const E5NZ={nosolid:true};
// a railing along x or z at height y (solid: posts, a top rail; the toe board), as ch3's
function e5railX(x0,x1,z,y,m){B(x0,y,z-.04,x1,y+1.05,z+.04,'metalx');B(x0,y+.98,z-.03,x1,y+1.04,z+.03,m||'e5rail',E5NZ);B(x0,y+.48,z-.025,x1,y+.53,z+.025,m||'e5rail',E5NZ);
  const n=Math.max(1,Math.round((x1-x0)/1.6));for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;B(x-.03,y,z-.03,x+.03,y+1.04,z+.03,m||'e5rail',E5NZ)}}
function e5railZ(z0,z1,x,y,m){B(x-.04,y,z0,x+.04,y+1.05,z1,'metalx');B(x-.03,y+.98,z0,x+.03,y+1.04,z1,m||'e5rail',E5NZ);B(x-.025,y+.48,z0,x+.025,y+.53,z1,m||'e5rail',E5NZ);
  const n=Math.max(1,Math.round((z1-z0)/1.6));for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n;B(x-.03,y,z-.03,x+.03,y+1.04,z+.03,m||'e5rail',E5NZ)}}
// a wall lamp (a sodium fitting on a bracket) facing the given way, and its light
function e5lamp(x,y,z,face,r,i,col){const o=E5NZ;if(face==='px'||face==='nx'){const s=face==='px'?1:-1;B(x,y,z-.2,x+s*.35,y+.12,z+.2,'metal2',o);B(x+s*.12,y-.08,z-.16,x+s*.42,y,z+.16,'lampO',o)}
  else{const s=face==='pz'?1:-1;B(x-.2,y,z,x+.2,y+.12,z+s*.35,'metal2',o);B(x-.16,y-.08,z+s*.12,x+.16,y,z+s*.42,'lampO',o)}
  LIGHT(x+(face==='px'?.6:face==='nx'?-.6:0),y-.3,z+(face==='pz'?.6:face==='nz'?-.6:0),col||'#ffb066',r||12,i||.85)}
// a floodlight mast on the yard (ground at y0)
function e5mast(x,z,y0,h,dx,dz){B(x-.14,y0,z-.14,x+.14,y0+h,z+.14,'metal2');B(x-.9,y0+h,z-.2,x+.9,y0+h+.12,z+.2,'metal2',E5NZ);for(const s of [-.55,.55])B(x+s-.3,y0+h-.42,z-.18+dz*.1,x+s+.3,y0+h,z+.18+dz*.1,'lampW',E5NZ);
  LIGHT(x+dx*3,y0+h-1.5,z+dz*3,'#e8eeff',26,1.05)}
// a stack of sandbags along x or z
function e5bags(x0,z0,x1,z1,y0,h){B(x0,y0,z0,x1,y0+(h||.9),z1,'sandbag')}
// a stair with a railing on its open side(s)
function e5stairs(axis,c0,c1,a0,a1,y0,y1,n,r1,r2){stairs(axis,c0,c1,a0,a1,y0,y1,n,'e5grate');if(r1)e3srail(axis,c0-.06,c0,a0,a1,y0,y1,n);if(r2)e3srail(axis,c1,c1+.06,a0,a1,y0,y1,n)}

function buildEp5(){const nz=E5NZ,Y=E5D.yA;
  // ================= zone A: the management yard (y 33) =================
  B(29.6,Y-1,-52.4,78.4,Y,-16.2,'e5asph',{ground:1});
  // the yard walls (the north one has the vehicle gate: a chain-link panel), barbed wire on top
  B(29.6,Y,-52.4,30,Y+3.4,-16.2,'e5wall');B(78,Y,-52.4,78.4,Y+3.4,-16.2,'e5wall');B(29.6,Y,-52.4,44,Y+3.4,-52,'e5wall');B(52,Y,-52.4,78.4,Y+3.4,-52,'e5wall');
  B(44,Y,-52.24,52,Y+3,-52.16,'fence',{pass:1});for(const x of [44,48,52])B(x-.08,Y,-52.3,x+.08,Y+3.2,-52.1,'metal2');
  wallX(30,78,-16.6,-16.2,Y,Y+3.4,'e5wall',[[51,55,Y,Y+3]]);
  for(const [x0,z0,x1,z1] of [[29.62,-52.4,29.98,-16.2],[77.98+.04,-52.4,78.38,-16.2]])B(x0,Y+3.4,z0,x1,Y+3.5,z1,'metal2',nz);B(29.6,Y+3.4,-52.36,78.4,Y+3.5,-52.3,'metal2',nz);
  B(51.4,Y+3.25,-16.66,54.6,Y+3.9,-16.6,'e5sExit',nz);B(40,Y+1.2,-16.66,48,Y+2.8,-16.6,'e5sWarn',nz);
  // the control office: two storeys, lit windows, the entrance canopy, its sign; a water tank on the roof
  B(32,Y,-51,47,Y+6.6,-41,'e5bldg');B(31.8,Y+6.6,-51.2,47.2,Y+7,-40.8,'e5roof');
  for(const x of [33,36.5,40,43.5])for(const y of [1,4.1]){const lit=hash2(x*3|0,y*7|0,51)<.6;B(x,Y+y,-40.98,x+2.2,Y+y+1.5,-40.94,lit?'winLit':'win',nz)}
  for(const z of [-49,-45.5])for(const y of [1,4.1])B(47.02,Y+y,z,47.06,Y+y+1.5,z+2.2,hash2(z*5|0,y*3|0,52)<.5?'winLit':'win',nz);
  B(36.5,Y,-40.96,38.5,Y+2.3,-40.92,'door',nz);B(35.6,Y+2.7,-41,39.4,Y+2.9,-38.8,'e5roof');B(35.8,Y,-38.9,36,Y+2.7,-38.7,'metal2');B(39,Y,-38.9,39.2,Y+2.7,-38.7,'metal2');
  B(33.4,Y+5.2,-40.94,39.4,Y+6.4,-40.9,'e5sOffice',nz);LIGHT(37.5,Y+2.4,-39.6,'#ffe0a0',7,.8);
  B(42,Y+7,-49,45,Y+9.4,-46,'contB');B(41.8,Y+7,-49.2,42.1,Y+8,-48.9,'metal2');
  // the shaft lift house: concrete walls round the cage, its door (gLt) facing the yard; the cage 6 × 6 m
  B(67,Y,-50,78,Y+5.6,-49.6,'e5wall');B(67,Y,-38.4,78,Y+5.6,-38,'e5wall');wallZ(67,67.4,-49.6,-38.4,Y,Y+5.6,'e5wall',[[-46,-42,Y,Y+3.4]]);B(66.8,Y+5.6,-50.2,78.2,Y+6,-37.8,'e5roof');
  B(66.94,Y+3.6,-45.6,67,Y+4.4,-42.4,'e5sLift',nz);B(70,Y,-49.6,78,Y+5.6,-47.2,'e5wall');B(70,Y,-40.8,78,Y+5.6,-38.4,'e5wall');B(76.2,Y,-47.2,78,Y+5.6,-40.8,'e5wall');
  e5cage(Y,'gLt');
  // containers, a dump truck, concrete barriers, pipe culvert sections, sandbags round the shaft door
  B(54,Y,-51.6,60.1,Y+2.6,-49.2,'contB');B(54,Y+2.6,-51.6,60.1,Y+5.2,-49.2,'contR');B(60.5,Y,-51.6,66.6,Y+2.6,-49.2,'contG');B(31,Y,-34,33.4,Y+2.6,-27.9,'contR');
  B(48,Y+.45,-34.6,56,Y+1.7,-32,'e5rust');B(48,Y+1.7,-34.6,53,Y+3.4,-32,'e5rust');B(53,Y+1.7,-34.4,56,Y+3.3,-32.2,'e5pump',{f:{px:'carGl'}});
  for(const x of [49,54.5])for(const z of [-34.9,-32.1])B(x,Y,z-.3,x+1.1,Y+1.1,z+.3,'tire');
  for(const [x,z] of [[38,-28],[41.2,-28],[62,-30],[65.2,-30],[70,-22],[73.2,-22]])B(x,Y,z-.3,x+3,Y+.9,z+.3,'barrier');
  for(const [x,z,ax] of [[60,-40,'x'],[63.4,-40,'x']]){void ax;B(x,Y,z-1.2,x+2.6,Y+2.4,z+1.2,'e5conc');B(x+.2,Y+.2,z-1,x+2.4,Y+2.2,z+1,'e5trench',nz)}
  e5bags(47,-23.4,51,-22.6,Y);e5bags(55,-23.4,59,-22.6,Y);e5bags(46.2,-23.4,47,-19,Y);e5bags(59,-23.4,59.8,-19,Y);
  for(const [x,z] of [[36,-46.5],[39,-36],[72,-28],[64,-46],[45,-20],[61,-19]])drum(x,z,Y,hash2(x|0,z|0,53)<.5?'drumR':null);
  e5mast(31.2,-50.8,Y,9,1,1);e5mast(76.8,-50.8,Y,9,-1,1);e5mast(31.2,-17.6,Y,9,1,-1);e5mast(76.8,-17.6,Y,9,-1,-1);
  LIGHT(53,Y+3.6,-18,'#ffd8a0',10,.85);B(52.6,Y+3.55,-16.75,53.4,Y+3.65,-16.6,'lampO',nz);LIGHT(72,Y+5,-44,'#ffe8c0',8,.8);
  for(const [x,z] of [[40,-24],[66,-33]]){MAP.fires.push([x,Y+.9,z]);drum(x,z,Y,'drumR')}
  // the drum of the shaft head (its walls are meshes) carries the tunnel's name
  B(46,Y+8.2,-16.3,60,Y+10.2,-16.24,'e5sMain',nz);
  // ================= zone B: the inflow tunnel =================
  // leg 1 (along x) and leg 2 (south to the tank): walls, the vaulted roof, the walkways, the channel (water at −0.7)
  wallX(-6.4,76.4,-50.4,-50,-1.6,8,'e5ring',[[18,22,0,3.2]]);wallX(6,76.4,-38,-37.6,-1.6,8,'e5ring',[[40,44,0,3.2]]);B(76,-1.6,-50,76.4,8,-38,'e5ring');
  wallZ(-6.4,-6,-50,-20.6,-1.6,8,'e5ring',[[-32,-28,0,3.2]]);B(6,-1.6,-38,6.4,8,-20.6,'e5ring');
  B(-6.4,7.4,-50.4,76.4,8,-37.6,'e5ring');B(-6.4,7.4,-37.6,6.4,8,-20.6,'e5ring');
  for(const [z0,z1] of [[-50,-49.2],[-38.8,-38]])B(-6,6.2,z0,76,7.4,z1,'e5ring',nz);B(-6,6.2,-37.6,-5.2,7.4,-20.6,'e5ring',nz);B(5.2,6.2,-37.6,6,7.4,-20.6,'e5ring',nz);
  B(-6,-1.6,-50,64,0,-47.5,'e5walk');B(3.5,-1.6,-40.5,64,0,-38,'e5walk');B(-6,-1.6,-47.5,-3.5,0,-20.6,'e5walk');B(3.5,-1.6,-38,6,0,-20.6,'e5walk');B(64,-1.6,-50,76,0,-38,'e5walk');
  B(-3.5,-2.6,-47.5,64,-1.6,-40.5,'e5trench');B(-3.5,-2.6,-40.5,3.5,-1.6,-20.6,'e5trench');
  B(-3.5,-1.6,-20.7,3.5,0,-20.6,'e5grill',nz);B(-6,-1.6,-20.6,6,0,-20,'e5walk');B(64,-1.6,-47.5,64.06,0,-40.5,'e5grill',nz);
  // the alcoves with the three hand pumps (north wall x 18–22, south wall x 40–44, leg 2's west wall z −32 – −28)
  e5alcove(18,22,-52,-50,'z');e5alcove(40,44,-37.6,-35.6,'z');e5alcove(-8.4,-6.4,-32,-28,'x');
  e5pump(20,-51.1,'pz');e5pump(42,-36.5,'nz');e5pump(-7.3,-30,'px');
  // railings along the channel (gaps at the bridges and the steps down), the footbridges, the steps into the channel
  const gapN=[[11,13],[33,35],[53,55],[23.8,27.2],[45.8,49.2]],gapS=[[11,13],[33,35],[53,55],[15.8,19.2],[57.8,61.2]];
  const railRun=(z,x0,x1,gaps)=>{let u=x0;for(const g of gaps.slice().sort((a,b)=>a[0]-b[0])){if(g[0]>u)e5railX(u,g[0],z,0);u=Math.max(u,g[1])}if(u<x1)e5railX(u,x1,z,0)};
  railRun(-47.46,-3.5,64,gapN);railRun(-40.54,3.5,64,gapS);e5railZ(-47.46,-20.8,-3.46,0);e5railZ(-40.5,-20.8,3.46,0);
  for(const x of [11,33,53]){B(x,.5,-47.5,x+2,.7,-40.5,'e5grate');B(x,0,-47.9,x+2,.35,-47.5,'e5grate');B(x,0,-40.5,x+2,.35,-40.1,'e5grate');e5railZ(-47.5,-40.5,x+.04,.7);e5railZ(-47.5,-40.5,x+1.96,.7)}
  stairs('x',-47.5,-46.4,24,27,-1.6,0,4,'e5grate');stairs('x',-47.5,-46.4,46,49,-1.6,0,4,'e5grate');stairs('x',-41.6,-40.5,16,19,-1.6,0,4,'e5grate');stairs('x',-41.6,-40.5,58,61,-1.6,0,4,'e5grate');
  // pipes along the roof corners, cable trays, lamps every 8 m, signs, depth marks
  B(-6,5.4,-49.9,76,6,-49.3,'e5pipe',nz);B(-6,5.4,-38.7,76,6,-38.1,'e5pipe',nz);B(-5.9,5.4,-37.6,-5.3,6,-20.6,'e5pipe',nz);B(-6,3.8,-49.96,76,3.9,-49.7,'metal2',nz);
  for(let x=0;x<=64;x+=8){e5lamp(x,5,-49.95,'pz',12,.8);e5lamp(x+4,5,-38.05,'nz',12,.8)}e5lamp(-5.95,5,-33,'px',11,.8);e5lamp(5.95,5,-26,'nx',11,.8);e5lamp(-5.95,5,-24,'px',11,.8);
  B(30,2.6,-49.96,36,3.4,-49.9,'e5sTun',nz);B(66,2.6,-49.96,70,3.4,-49.9,'e5sDepth',nz);B(-5.96,2.6,-36,-5.9,3.4,-31,'e5sTun',nz);B(18.6,3.3,-49.96,21.4,3.8,-49.9,'e5sPump',nz);B(40.6,3.3,-38.06,43.4,3.8,-38,'e5sPump',nz);
  B(-6.06,3.3,-31.4,-6,3.8,-28.6,'e5sPump',nz);
  // the lift landing at the east end: the bottom cage (gLb), a pump control kiosk, sandbags
  e5cage(0,'gLb');B(64.6,0,-49.6,66.6,1.3,-48.2,'e5panel',{f:{pz:'e5panel',py:'e5pump',px:'e5pump',nx:'e5pump',nz:'e5pump'}});e5bags(64.4,-41,66.6,-40.2,0);
  // the mouth into the tank (gate gB slides up into the wall)
  B(-6,0,-20.5,6,3.6,-20.1,'e5gate',{gate:'gB',gs:[0,3.4,0]});
  // ================= zone C: the surge tank =================
  {const X=[-27,-17,-7,7,17,27],Z=[-14,-5,5,14];
    // floor with the two trenches cut through it (their walls and beds), the walls with their openings, the roof
    slab(-32,-20,32,20,-4,0,'e5floor',[[-32,-11.5,32,-7.5],[-32,7.5,32,11.5]],{f:{pz:'e5trench',nz:'e5trench'}});B(-32,-5,-11.5,32,-4,-7.5,'e5trench');B(-32,-5,7.5,32,-4,11.5,'e5trench');
    wallX(-32.6,32.6,-20.6,-20,-4,18.6,'e5conc',[[-6,6,0,3.6]]);wallX(-32.6,32.6,20,20.6,-4,18.6,'e5conc');
    wallZ(-32.6,-32,-20,20,-4,18.6,'e5conc',[[-3,3,0,3.6]]);wallZ(32,32.6,-20,20,-4,18.6,'e5conc',[[-3.5,3.5,0,3.6]]);B(-32.6,18,-20.6,32.6,18.6,20.6,'e5conc');
    for(const x of X)for(const z of Z)B(x-2,0,z-2,x+2,18,z+2,'e5pil');
    // the trench ends: stairs up out of the water at both ends of each trench
    for(const [z0,z1] of [[-11.5,-7.5],[7.5,11.5]]){stairs('x',z0,z1,-28,-31.8,-4,0,8,'e5grate');stairs('x',z0,z1,28,31.8,-4,0,8,'e5grate')}
    // the walkway grid at y 4: the four wall walkways, a platform round every pillar, bridges between them; the two stairs up
    const g='e5grate',WY=4;B(-32,WY-.35,-20,32,WY,-17.6,g);B(-32,WY-.35,17.6,32,WY,20,g);B(-32,WY-.35,-17.6,-30.5,WY,17.6,g);B(30.5,WY-.35,-17.6,32,WY,17.6,g);
    for(const x of X)for(const z of Z){const zo=Math.abs(z)===14;B(x-3.5,WY-.35,zo?(z>0?10.4:-17.6):z-3.5,x+3.5,WY,zo?(z>0?17.6:-10.4):z+3.5,g)}
    for(const z of Z)for(const [a,b] of [[-23.5,-20.5],[-13.5,-10.5],[-3.5,3.5],[10.5,13.5],[20.5,23.5]])if(!(a===-3.5&&Math.abs(z)===14))B(a,WY-.25,z-.8,b,WY,z+.8,g);
    // the stairs from the floor up to the drain wheels, in the middle gap of the north and south rows (they replace those two bridges)
    for(const s of [-1,1]){stairs('z',-1.5,1.5,s*11.8,s*16.6,0,WY,10,'e5grate');e3srail('z',-1.56,-1.5,s*11.8,s*16.6,0,WY,10);e3srail('z',1.5,1.56,s*11.8,s*16.6,0,WY,10);B(-1.5,WY-.35,s*16.6,1.5,WY,s*17.6,g)}
    for(const x of X){B(x-.8,WY-.25,8.5,x+.8,WY,10.4,g);B(x-.8,WY-.25,-10.4,x+.8,WY,-8.5,g)}
    for(const s of [-1,1]){B(s>0?15.5:-18.5,WY-.35,-1.5,s>0?18.5:-15.5,WY,1.5,g);stairs('x',-1.2,1.2,s*11,s*15.5,0,WY,10,'e5grate');e3srail('x',-1.26,-1.2,s*11,s*15.5,0,WY,10);e3srail('x',1.2,1.26,s*11,s*15.5,0,WY,10)}
    // railings on the walkways' open edges (the wall walkways, the bridges' sides); the platforms' edges stay open to jump from
    for(const [a,b] of [[-23.5,-20.5],[-13.5,-10.5],[-3.5,-1.5],[1.5,3.5],[10.5,13.5],[20.5,23.5]]){e5railX(a,b,-17.56,WY);e5railX(a,b,17.56,WY)}for(const [a,b] of [[-10.4,-8.5],[-1.5,1.5],[8.5,10.4]]){e5railZ(a,b,-30.46,WY);e5railZ(a,b,30.46,WY)}
    // the pump dais in the middle: steps up east and west, pump housings, a control desk
    B(-4.5,0,-3,4.5,1.5,3,'e5conc',{f:{py:'e5walk'}});stairs('x',-2,2,-6.5,-4.5,0,1.5,3,'e5grate');stairs('x',-2,2,6.5,4.5,0,1.5,3,'e5grate');
    B(-3.6,1.5,-2.6,-1.2,3.4,-1,'e5pump');B(1.2,1.5,-2.6,3.6,3.4,-1,'e5pump');B(-3.2,3.4,-2.2,-1.6,4.2,-1.4,'e5rust',nz);B(1.6,3.4,-2.2,3.2,4.2,-1.4,'e5rust',nz);
    B(-1,1.5,1.6,1,2.6,2.6,'e5panel',{f:{nz:'e5panel',py:'e5pump',px:'e5pump',nx:'e5pump',pz:'e5pump'}});B(-4.4,1.5,1.2,-3.4,2.8,2.2,'e5pump');B(3.4,1.5,1.2,4.4,2.8,2.2,'e5pump');
    for(const [x0,x1] of [[-2.4,-1.2],[1.2,2.4]])B(x0,3.4,-1.9,x1,18,-1.7,'e5pipe',nz);
    // the drain gates' handwheels on the north and south walkways (stage 3 and the boss fight), their panels and signs
    for(const s of [-1,1]){const z=s*18.9;B(-.7,WY,z-.25*s-.25,.7,WY+1.1,z-.25*s+.25,'e5pump');B(-1,WY+1.1,z-.08,1,WY+2.2,z+.08,'e5sGate',nz);B(-1.4,WY-.35,s*20-.2,1.4,WY+3.4,s*20+.2,'e5gate',{f:{}});B(-.55,WY+.2,z-.25*s+.25*(-s)-.03*s,.55,WY+1,z-.25*s+.25*(-s)+.03*s,'e5wheel',nz)}
    // the vent fans' switches on the west and east walkways
    for(const s of [-1,1]){const x=s*31.4;B(x-.3,WY,6.6,x+.3,WY+1.5,7.6,'e5panel',{f:{px:'e5panel',nx:'e5panel',py:'e5pump',pz:'e5pump',nz:'e5pump'}});B(x-.05,WY+1.7,6.4,x+.05,WY+2.3,7.8,'e5sFan',nz)}
    for(const [x,z] of [[-20,-12],[20,-12],[-20,12],[20,12]])B(x-1.4,17.4,z-1.4,x+1.4,18,z+1.4,'e5fan',{f:{ny:'e5fan'}});
    // the inflow sluice in the west wall (gW: it bursts at 70 %) and the gate to the shaft in the east wall (gS)
    B(-32.5,0,-3,-32.1,3.6,3,'e5gate',{gate:'gW',gs:[0,-3.7,0]});B(-36,0,-3,-32.6,3.6,-2.6,'e5conc');B(-36,0,2.6,-32.6,3.6,3,'e5conc');B(-36,3.6,-3,-32.6,4,3,'e5conc');B(-36,-1,-3,-32.6,0,3,'e5trench');B(-36.4,0,-3,-36,3.6,3,'e5grill');
    B(32.1,0,-3.5,32.5,3.6,3.5,'e5gate',{gate:'gS',gs:[0,3.7,0]});
    B(-31.94,4.4,-2,-31.88,5.2,2,'e5sInflow',nz);B(31.88,4.4,-2.4,31.94,5.2,2.4,'e5sShaft',nz);B(-4,4.4,-19.94,4,5.6,-19.88,'e5sTank',nz);
    // light: sodium lamps high on the pillars, along the walkways, over the dais; the fans' grilles
    for(const x of X)for(const z of [-5,5]){const f=z<0?'pz':'nz';e5lamp(x,12,z+(z<0?2:-2),f,20,.85)}
    for(const x of [-27,-7,7,27])for(const z of [-14,14])e5lamp(x,10,z+(z<0?2:-2),z<0?'pz':'nz',16,.7);
    for(let x=-28;x<=28;x+=8){e5lamp(x,7,-19.95,'pz',9,.6);e5lamp(x,7,19.95,'nz',9,.6)}LIGHT(0,6,0,'#ffcf8a',12,.75);LIGHT(0,2.4,2.2,'#60ff90',4,.6)}
  // ================= the tunnel from the tank to the shaft =================
  B(32.6,-1,-3.5,38.6,0,3.5,'e5floor');B(32.6,0,-3.9,38.6,4.2,-3.5,'e5conc');B(32.6,0,3.5,38.6,4.2,3.9,'e5conc');B(32.6,3.6,-3.9,38.6,4.2,3.9,'e5conc');e5lamp(35.6,3.4,-3.45,'pz',9,.75);
  // ================= zone D: shaft No. 3 =================
  e5ShaftBoxes();
  // the passage through the wall up to the yard door (gX slides up), the beams across the top of the shaft
  B(51,Y-1,-16.6,55,Y,-14.6,'e5walk');B(50.6,Y,-16.6,51,Y+3.4,-14.4,'e5conc');B(55,Y,-16.6,55.4,Y+3.4,-14.4,'e5conc');B(50.6,Y+3,-16.6,55.4,Y+3.4,-14.4,'e5conc');
  B(51,Y,-16.5,55,Y+3,-16.3,'e5door',{gate:'gX',gs:[0,3,0]});B(51.4,Y+2.4,-14.62,54.6,Y+3,-14.56,'e5sExit',nz);
  B(E5D.cx-15.4,44.3,-.35,E5D.cx+15.4,45,.35,'e5rust');B(E5D.cx-.35,44.3,-15.4,E5D.cx+.35,45,15.4,'e5rust');
  // lamps along the ramp (on the wall, every 0.7 rad of the climb), the nest's glow at the bottom, red lamps up the column
  for(let u=.35;u<E5D.U;u+=.7){const p=e5At(u,14.55),h=p.y,ph=e5Phi(u);LIGHT(E5D.cx+Math.cos(ph)*13.6,h+3,E5D.cz+Math.sin(ph)*13.6,'#ffb066',13,.85);void h}
  for(let a=0;a<6;a++){const ph=a/6*TAU;LIGHT(E5D.cx+Math.cos(ph)*5,.6,E5D.cz+Math.sin(ph)*5,'#5aff8a',7,.6)}
  for(const y of [8,16,24,32,40])LIGHT(E5D.cx,y,E5D.cz,'#ff4a3a',6,.45);
  LIGHT(E5D.cx,42,E5D.cz,'#c8d4ff',16,.5);
  // ================= spawns, zones, gates, devices =================
  const A=[[50.5,Y,-20.2],[52,Y,-20.2],[53.5,Y,-20.2],[55,Y,-20.2],[51,Y,-21.6],[52.5,Y,-21.6],[54,Y,-21.6],[55.5,Y,-21.6]].map(p=>[p[0],p[1],p[2],0]);
  const Bs=[[71,0,-46],[72.5,0,-46],[74,0,-46],[71,0,-44],[72.5,0,-44],[74,0,-44],[71,0,-42],[72.5,0,-42]].map(p=>[p[0],p[1],p[2],Math.PI/2]);
  const Cs=[[-4.5,0,-18],[-3,0,-18],[-1.5,0,-18],[0,0,-18],[1.5,0,-18],[3,0,-18],[4.5,0,-18],[0,0,-16.6]].map(p=>[p[0],p[1],p[2],Math.PI]);
  const Es=[[-3.4,1.5,0],[-2,1.5,.6],[-.6,1.5,0],[.8,1.5,.6],[2.2,1.5,0],[3.4,1.5,.6],[-2.6,1.5,-.6],[2.6,1.5,-.6]].map(p=>[p[0],p[1],p[2],Math.PI]);
  const Ds=[[40,0,-1.5],[40,0,0],[40,0,1.5],[41.5,0,-.8],[41.5,0,.8],[43,0,-1.5],[43,0,0],[43,0,1.5]].map(p=>[p[0],p[1],p[2],-Math.PI/2]);
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[32,-50,Y],[40,-51,Y],[50,-50.6,Y],[66,-48,Y],[76,-48,Y],[76,-36,Y],[32,-38,Y],[64,-26,Y],[33,-21,Y],[75,-20,Y]];
  const zB=[[-4.8,-48.8,0],[-4.8,-24,0],[4.8,-24,0],[30,-48.8,0],[48,-39.2,0],[60,-48.8,0],[24,-44,-1.6],[44,-44,-1.6],[0,-30,-1.6],[60,-44,-1.6]];
  const zC=[[-30.5,-18.5,0],[30.5,-18.5,0],[-30.5,18.5,0],[30.5,18.5,0],[-12,-9.5,-4],[12,9.5,-4],[-22,0,0],[22,0,0],[-31,-14,4],[31,14,4],[-12,18.8,4],[12,-18.8,4]];
  const zD=[];for(const u of [1.2,3.6,6.4,8.2,9.6,12.6,14.4,16.4]){const p=e5At(u,13.8);zD.push([p.x,p.z,p.y])}zD.push([46,6,0],[60,-6,0],[58,8,0]);
  MAP.zspawns=[].concat(zA,zB,zC,zD).map(p=>[p[0],p[1],p[2]]);
  const dv=(x,y,z,n,act,t,bx,bz,r)=>({x,y,z,t,r:r||1.7,n,act,lh:2.4,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[30,-52,78,-16.2],start:A,zsp:zA},B:{box:[-6,-50,76,-20.6],start:Bs,zsp:zB},C:{box:[-32,-20,32,20],start:Cs,zsp:zC},
      E:{box:[-4.6,-3.1,4.6,3.1],start:Es,zsp:zC},D:{box:[38,-15,68,15],start:Ds,zsp:zD}},
    door:{A:[73,Y+1.5,-44],B:[0,1.5,-20.4],C:[0,2.2,0]},
    // stage 2: the three hand pumps (10 s each, any order)
    pumps:[dv(20,0,-49.4,['수동 펌프 1 · 북쪽 벽감','Hand pump 1 · north alcove'],['펌프 돌리기','work the pump'],10,0,.2),dv(42,0,-38.6,['수동 펌프 2 · 남쪽 벽감','Hand pump 2 · south alcove'],['펌프 돌리기','work the pump'],10,0,-.2),
      dv(-5.4,0,-30,['수동 펌프 3 · 수로 모퉁이','Hand pump 3 · round the corner'],['펌프 돌리기','work the pump'],10,.2,0)],
    // stage 3 and the boss fight: the drain gates' handwheels (north, south) on the walkways; the vent fans' switches (west, east)
    wheels:[dv(0,4,-18.3,['배수 수문 핸들 · 북쪽','Drain wheel · north'],['수문 핸들 돌리기','turn the drain wheel'],6,0,.3,1.8),dv(0,4,18.3,['배수 수문 핸들 · 남쪽','Drain wheel · south'],['수문 핸들 돌리기','turn the drain wheel'],6,0,-.3,1.8)],
    fans:[{x:-30.9,y:4,z:7.1,bx:-30.7,bz:7.1},{x:30.9,y:4,z:7.1,bx:30.7,bz:7.1}],
    // the pillars and their platforms, the trenches (TIAMAT swims in them), the dais, the sluices
    pillars:(()=>{const L=[];for(const x of [-27,-17,-7,7,17,27])for(const z of [-14,-5,5,14])L.push({x,z,box:Math.abs(z)===14?[x-3.5,z>0?10.4:-17.6,x+3.5,z>0?17.6:-10.4]:[x-3.5,z-3.5,x+3.5,z+3.5]});return L})(),
    trench:[{z:-9.5,x0:-31,x1:31},{z:9.5,x0:-31,x1:31}],dais:{box:[-4.5,-3,4.5,3],y:1.5},sluiceW:[-33,0],sluiceE:[33,0],
    // the water: the tunnel's channel (fixed), the tank, the shaft's sump (the chapter moves these)
    water:{B:{rects:[[-3.5,-47.5,64,-40.5],[-3.5,-40.5,3.5,-20.6]],y:-.7},C:{rects:[[-32,-20,32,20]],y:.3},D:{circ:[E5D.cx,E5D.cz,15],y:.3}},
    // the lift cages (top in the yard, bottom in the tunnel: the same footprint 33 m apart)
    cage:{x0:70,x1:76,z0:-47,z1:-41},
    // the shaft: the ammo boxes on the landings, the top landing by the door
    shaft:E5D,landAmmo:[[e5At(E5D.u1+E5D.W/2,11.2)],[e5At(E5D.u2+E5D.W/2,11.2)],[e5At(E5D.U-.3,11.2)]].map(a=>a[0]),
    // larva swarms need ch3's hazard lists (none of its props here)
    drums:[],gas:[],cool:[],heaps:[],scrap:[],rails:[]};
  MAP.ez.exit={x0:50,x1:56,z0:-21.5,z1:-16.7};MAP.ez.exitMk=[53,Y+2.2,-17.4];
  MAP.camps=[{k:'a',w:.2,p:[[53,Y,-24]],look:[53,Y+1,-40]},{k:'b',w:.2,p:[[40,0,-48.8]],look:[10,1,-48.8]},{k:'c',w:.2,p:[[0,1.5,0]],look:[0,1,-16]},{k:'d',w:.2,p:[[42,0,0]],look:[53,4,0]}];
  MAP.moon={d:new THREE.Vector3(-.4,.6,-.5).normalize(),c:new THREE.Color('#4a5468'),i:.4};MAP.spawnYaw=0;
  MAP.cam=(t,cam)=>{const a=t*.045;cam.position.set(Math.sin(a)*24,9,Math.cos(a)*14);cam.lookAt(0,3,0)}}
// a hand pump in its alcove: a cast-iron body, the big handwheel facing out, a gauge
function e5pump(x,z,face){const o=E5NZ;B(x-.6,0,z-.4,x+.6,1.3,z+.4,'e5pump');B(x-.2,1.3,z-.2,x+.2,1.9,z+.2,'e5rust');
  if(face==='pz'||face==='nz'){const s=face==='pz'?1:-1;B(x-.55,.5,z+s*.4,x+.55,1.6,z+s*.46,'e5wheel',o);B(x-.25,1.5,z-s*.1,x+.25,2.3,z+s*.3,'e5pipe',o)}
  else{const s=face==='px'?1:-1;B(x+s*.4,.5,z-.55,x+s*.46,1.6,z+.55,'e5wheel',o);B(x-.1*s,1.5,z-.25,x+s*.3,2.3,z+.25,'e5pipe',o)}}
// a recess in a tunnel wall (axis z: in the north / south wall, x: in leg 2's west wall)
function e5alcove(a0,a1,b0,b1,ax){if(ax==='z'){B(a0,-1.6,b0,a1,0,b1,'e5walk');const back=b0<-45?b0:b1;B(a0,0,back-(back<b0+.1?.4:0),a1,3.4,back+(back>b1-.1?.4:0),'e5ring');B(a0-.4,0,b0,a0,3.4,b1,'e5ring');B(a1,0,b0,a1+.4,3.4,b1,'e5ring');B(a0-.4,3.2,b0-.4,a1+.4,3.6,b1+.4,'e5ring');LIGHT((a0+a1)/2,2.8,(b0+b1)/2,'#ffd8a0',5,.8)}
  else{B(a0,-1.6,b0,a1,0,b1,'e5walk');B(a0-.4,0,b0,a0,3.4,b1,'e5ring');B(a0,0,b0-.4,a1,3.4,b0,'e5ring');B(a0,0,b1,a1,3.4,b1+.4,'e5ring');B(a0-.4,3.2,b0-.4,a1,3.6,b1+.4,'e5ring');LIGHT((a0+a1)/2,2.8,(b0+b1)/2,'#ffd8a0',5,.8)}}
// a lift cage (floor at y0; the same footprint in the yard and down in the tunnel): mesh walls, the door on its west side (gate key g)
function e5cage(y0,g){const C={x0:70,x1:76,z0:-47,z1:-41},o=E5NZ;
  B(C.x0,y0+3.2,C.z0,C.x1,y0+3.5,C.z1,'e5lift');B(C.x0,y0,C.z0-.2,C.x1,y0+3.2,C.z0,'e5lift');B(C.x0,y0,C.z1,C.x1,y0+3.2,C.z1+.2,'e5lift');B(C.x1,y0,C.z0,C.x1+.2,y0+3.2,C.z1,'e5lift');
  B(C.x0-.2,y0,C.z0,C.x0,y0+3.2,-45.5,'e5lift');B(C.x0-.2,y0,-42.5,C.x0,y0+3.2,C.z1,'e5lift');B(C.x0-.2,y0+2.7,-45.5,C.x0,y0+3.2,-42.5,'e5lift');
  B(C.x0-.16,y0,-45.5,C.x0-.06,y0+2.7,-44,'e5grill',{gate:g,gs:[0,0,-1.45]});B(C.x0-.16,y0,-44,C.x0-.06,y0+2.7,-42.5,'e5grill',{gate:g,gs:[0,0,1.45]});
  B(C.x0+.1,y0,C.z0+.05,C.x1-.1,y0+.04,C.z1-.05,'e5lift',o);B(C.x1-.02,y0+1,-44.6,C.x1,y0+1.8,-43.4,'e5panel',o);
  B(72.6,y0+3.14,-44.4,73.4,y0+3.2,-43.6,'lampW',o);LIGHT(73,y0+2.7,-44,'#ffe8c0',6,.85);
  // the lift shaft round the cage (solid fill between the cage and the walls)
  if(y0<1){B(70,0,-50,76,7.4,-47.2,'e5ring');B(70,0,-40.8,76,7.4,-38,'e5ring');B(68,0,-50,70,7.4,-47.2,'e5ring');B(68,0,-40.8,70,7.4,-38,'e5ring');B(68,3.5,-47.2,70,7.4,-40.8,'e5ring');B(70,3.5,-47,76,7.4,-41,'e5ring',{f:{ny:'e5lift'}})}}

// ---------- the meshes boxes cannot make: the shaft's round wall, the ramp, its parapet, the column, the top grating, the drum outside;
// the water planes; the nest at the bottom ----------
const E5W={B:null,C:null,D:null,mat:null};
function e5Mesh(pos,nrm,uv,idx,mat,light){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);const n=pos.length/3,col=new Float32Array(n*3);
  for(let i=0;i<n;i++){const c=light?lightAt(pos[i*3]+nrm[i*3]*.06,pos[i*3+1]+nrm[i*3+1]*.06,pos[i*3+2]+nrm[i*3+2]*.06,nrm[i*3],nrm[i*3+1],nrm[i*3+2]):[1,1,1];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.matrixAutoUpdate=false;m.updateMatrix();return m}
// a grid surface: f(i,j) → [x,y,z,nx,ny,nz,u,v] for i in 0..NI, j in 0..NJ; skip(i,j) drops a quad
function e5Grid(NI,NJ,f,skip){const pos=[],nrm=[],uv=[],idx=[];for(let j=0;j<=NJ;j++)for(let i=0;i<=NI;i++){const p=f(i,j);pos.push(p[0],p[1],p[2]);nrm.push(p[3],p[4],p[5]);uv.push(p[6],p[7])}
  for(let j=0;j<NJ;j++)for(let i=0;i<NI;i++){if(skip&&skip(i,j))continue;const a=j*(NI+1)+i,b=a+1,c=a+NI+1,d=c+1;idx.push(a,c,b,b,c,d)}return {pos,nrm,uv,idx}}
function e5Flip(G){for(let i=0;i<G.idx.length;i+=3){const t=G.idx[i+1];G.idx[i+1]=G.idx[i+2];G.idx[i+2]=t}return G}
function ep5Mesh(scene){const D=E5D,cx=D.cx,cz=D.cz,add=(G,tex,o)=>{const m=e5Mesh(G.pos,G.nrm,G.uv,G.idx,matWorld(TEX[tex],o||{}),true);scene.add(m);MAP.meshes.push(m);return m};
  const NA=112,Y=D.yA;
  // the wall, seen from inside (the openings: the tank tunnel at the west point, the yard door at the north point)
  {const NJ=30;const G=e5Grid(NA,NJ,(i,j)=>{const a=i/NA*TAU,y=j/NJ*D.top,c=Math.cos(a),s=Math.sin(a);return [cx+c*D.R,y,cz+s*D.R,-c,0,-s,i/NA*D.R*TAU/3,y/3]},
      (i,j)=>{const a=(i+.5)/NA*TAU,y=(j+.5)/NJ*D.top,x=Math.cos(a)*D.R,z=Math.sin(a)*D.R;return (x<0&&Math.abs(z)<3.5&&y<3.6)||(z<0&&Math.abs(x)<2&&y>Y&&y<Y+3.2)});add(e5Flip(G),'e5shaft')}
  // the drum outside, above the yard, and its rim
  {const NJ=8;add(e5Grid(NA,NJ,(i,j)=>{const a=i/NA*TAU,y=Y+j/NJ*(D.top+.6-Y),c=Math.cos(a),s=Math.sin(a);return [cx+c*D.Rw,y,cz+s*D.Rw,c,0,s,i/NA*D.Rw*TAU/3,y/3]},
      (i,j)=>{const a=(i+.5)/NA*TAU,y=Y+(j+.5)/NJ*(D.top+.6-Y),x=Math.cos(a)*D.Rw,z=Math.sin(a)*D.Rw;return z<0&&Math.abs(x)<2.2&&y<Y+3.6}),'e5drum');
    add(e5Flip(e5Grid(NA,1,(i,j)=>{const a=i/NA*TAU,r=j?D.Rw:D.R,c=Math.cos(a),s=Math.sin(a);return [cx+c*r,D.top+.6,cz+s*r,0,1,0,c*r/3,s*r/3]})),'e5drum')}
  // the ramp: its top, its underside, the outer edge along the wall is hidden in it; the parapet (inner face, top, outer face); the end wall
  {const du=.035,NU=Math.ceil((D.U+D.EXT)/du),T=[],Bt=[],P1=[],P2=[],P3=[];const pt=(u,r,y)=>{const p=e5Phi(u);return [cx+Math.cos(p)*r,y,cz+Math.sin(p)*r]};
    const top=e5Grid(NU,2,(i,j)=>{const u=Math.min(D.U+D.EXT,i*du),Ri=e5Ri(u),r=lerp(Ri,D.R,j/2),h=e5H(u),p=pt(u,r,h);return [p[0],p[1],p[2],0,1,0,u*13.5/2,1-(r-Ri)/(D.R-Ri)*.9]},(i)=>e5H(i*du)<.05);
    const bot=e5Grid(NU,2,(i,j)=>{const u=Math.min(D.U+D.EXT,i*du),Ri=e5Ri(u)-.4,r=lerp(Ri,D.R,j/2),h=e5H(u)-.45,p=pt(u,r,h);return [p[0],p[1],p[2],0,-1,0,u*13.5/2,r/2]},(i)=>e5H(i*du)<.5);
    add(top,'e5ramp');add(e5Flip(bot),'e5ramp');
    const pin=e5Grid(NU,1,(i,j)=>{const u=Math.min(D.U+D.EXT,i*du),r=e5Ri(u)-.4,ph=e5Phi(u),h=e5H(u),y=j?h+1.05:h-.45,p=pt(u,r,y);return [p[0],p[1],p[2],-Math.cos(ph),0,-Math.sin(ph),u*r/2,j?0:1.5/2]},(i)=>e5H(i*du)<.4);
    const ptop=e5Grid(NU,1,(i,j)=>{const u=Math.min(D.U+D.EXT,i*du),r=e5Ri(u)-(j?0:.4),h=e5H(u)+1.05,p=pt(u,r,h);return [p[0],p[1],p[2],0,1,0,u*r/2,j*.4/2]},(i)=>e5H(i*du)<.4);
    const pout=e5Grid(NU,1,(i,j)=>{const u=Math.min(D.U+D.EXT,i*du),r=e5Ri(u),ph=e5Phi(u),h=e5H(u),y=j?h+1.05:h,p=pt(u,r,y);return [p[0],p[1],p[2],Math.cos(ph),0,Math.sin(ph),u*r/2,j?0:1.05/2]},(i)=>e5H(i*du)<.4);
    add(pin,'e5par');add(ptop,'e5par');add(e5Flip(pout),'e5par');
    // the end wall across the top of the ramp, beyond the door
    {const u=D.U+D.EXT,h=e5H(u),Ri=e5Ri(u)-.4,sp=Math.sin(e5Phi(u)),cp=Math.cos(e5Phi(u));add(e5Flip(e5Grid(1,1,(i,j)=>{const p=pt(u,lerp(Ri,D.R,i),j?h+1.05:h-.45);return [p[0],p[1],p[2],-sp,0,cp,i*2,j*.7]})),'e5par');add(e5Grid(1,1,(i,j)=>{const p=pt(u+.12,lerp(Ri,D.R,i),j?h+1.05:h-.45);return [p[0],p[1],p[2],sp,0,-cp,i*2,j*.7]}),'e5par')}}
  // the column
  {const NC=40,NJ=30;add(e5Grid(NC,NJ,(i,j)=>{const a=i/NC*TAU,y=j/NJ*D.top,c=Math.cos(a),s=Math.sin(a);return [cx+c*D.Rc,y,cz+s*D.Rc,c,0,s,(NC-i)/NC*3,y/6]}),'e5colm')}
  // the nest round the foot of the column and in the bottom: lumps of tissue (stretched spheres), glowing
  {const pos=[],nrm=[],uv=[],idx=[];const lump=(x,y,z,sx,sy,sz,seed)=>{const g=new THREE.SphereGeometry(1,10,7);const P=g.attributes.position,Nn=g.attributes.normal,U=g.attributes.uv,b=pos.length/3;
      for(let i=0;i<P.count;i++){const n=1+.18*Math.sin(P.getX(i)*5+seed)*Math.cos(P.getZ(i)*4+seed);pos.push(x+P.getX(i)*sx*n,y+P.getY(i)*sy*n,z+P.getZ(i)*sz*n);nrm.push(Nn.getX(i),Nn.getY(i),Nn.getZ(i));uv.push(U.getX(i)*3,U.getY(i)*2)}
      const I=g.index.array;for(let i=0;i<I.length;i++)idx.push(b+I[i]);g.dispose()};
    for(let k=0;k<11;k++){const a=k/11*TAU+hash2(k,1,5301)*.4,r=3.2+hash2(k,2,5301)*1.6;lump(cx+Math.cos(a)*r,.1,cz+Math.sin(a)*r,.8+hash2(k,3,5301)*.9,.5+hash2(k,4,5301)*.8,.8+hash2(k,5,5301)*.7,k)}
    for(let k=0;k<7;k++){const a=k/7*TAU+.3,y=1.2+k*1.3;lump(cx+Math.cos(a)*3,y,cz+Math.sin(a)*3,.5,.9,.5,k+20)}
    for(let k=0;k<6;k++){const a=k/6*TAU+.7,r=8+hash2(k,6,5301)*5;lump(cx+Math.cos(a)*r,0,cz+Math.sin(a)*r,1.2,.35,1,k+40)}
    add({pos,nrm,uv,idx},'e5nest',{emis:.4})}
  // the grating over the top (both sides; the storm shows through it)
  {const G=e5Grid(48,1,(i,j)=>{const a=i/48*TAU,r=j?D.R:0,c=Math.cos(a),s=Math.sin(a);return [cx+c*r,D.top-.05,cz+s*r,0,-1,0,c*r/2,s*r/2]});const m=add(e5Flip(G),'e5grid');m.material.side=THREE.DoubleSide}
  // ---- the water (every region a plane, lit by the baked light at its rest height; the chapter moves C and D) ----
  E5W.mat=e5WaterMat();
  const plane=(x0,z0,x1,z1,y,circ)=>{const n=circ?40:Math.max(2,Math.ceil(Math.max(x1-x0,z1-z0)/2.5)),NI=circ?n:Math.max(1,Math.ceil((x1-x0)/2.5)),NJ=circ?2:Math.max(1,Math.ceil((z1-z0)/2.5));
    const G=circ?e5Grid(NI,NJ,(i,j)=>{const a=i/NI*TAU,r=j/NJ*circ[2];return [circ[0]+Math.cos(a)*r,0,circ[1]+Math.sin(a)*r,0,1,0,0,0]}):e5Grid(NI,NJ,(i,j)=>[lerp(x0,x1,i/NI),0,lerp(z0,z1,j/NJ),0,1,0,0,0]);
    if(circ)e5Flip(G);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.nrm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(G.uv,2));g.setIndex(G.idx);
    const col=new Float32Array(G.pos.length);for(let i=0;i<G.pos.length;i+=3){const c=lightAt(G.pos[i],y+.25,G.pos[i+2],0,1,0,true);col[i]=c[0];col[i+1]=c[1];col[i+2]=c[2]}g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.computeBoundingSphere();const m=new THREE.Mesh(g,E5W.mat);m.position.y=y;m.renderOrder=2;m.frustumCulled=false;scene.add(m);MAP.meshes.push(m);return m};
  const WZ=MAP.ez.water;E5W.B=[plane(-3.5,-47.5,64,-40.5,WZ.B.y),plane(-3.5,-40.5,3.5,-20.6,WZ.B.y)];E5W.C=plane(-32,-20,32,20,WZ.C.y);E5W.D=plane(0,0,0,0,WZ.D.y,WZ.D.circ)}
// murky green water: two drifting ripple layers bend the light from the lamps and the flashlight; the deeper it is, the less shows through
function e5WaterMat(){return new THREE.ShaderMaterial({uniforms:Object.assign({uN:{value:TEX.e5wn},uC:{value:new THREE.Color('#163a36')},uA:{value:.84},uChurn:{value:0}},LU),vertexShader:VS_WORLD,vertexColors:true,transparent:true,depthWrite:false,
  fragmentShader:GLSL_DYN+`uniform sampler2D uN;uniform vec3 uC;uniform float uA;uniform float uChurn;uniform float uTime;varying vec2 vUv;varying vec3 vCol;varying vec3 vPos;varying vec3 vN;
    void main(){vec2 p=vPos.xz;float k=1.+uChurn*2.5;vec2 a=texture2D(uN,p*.11+vec2(uTime*.021*k,uTime*.013*k)).rg-.5,b=texture2D(uN,p*.07-vec2(uTime*.017*k,-uTime*.026*k)).rg-.5;
      vec3 n=normalize(vec3((a.x+b.y)*(.55+uChurn*.6),1.,(a.y+b.x)*(.55+uChurn*.6)));vec3 v=normalize(cameraPosition-vPos);float fr=pow(1.-max(dot(n,v),0.),3.);
      vec3 lig=vCol*uAmb+dynLight(vPos,n)*.55;vec3 c=uC*lig*1.35+dynSpec(vPos,n,v,70.)*.9+vec3(.08,.11,.12)*fr*uAmb+vec3(.5,.55,.5)*smoothstep(.62,.9,a.x+b.y+.5)*uChurn*.25;
      gl_FragColor=vec4(applyFog(c,vPos),clamp(uA+fr*.12,0.,.97));}`})}
MAPDEFS.ep5={n:['새벽천 대심도 방수로','The Saebyeok Deep Tunnel'],d:['폭우 치는 밤, 지하 40 m의 빗물 방수로. 관리동 마당 → 승강기 → 유입 수로 → 조압수조 → 제3수직구.','A storm-water tunnel 40 m under the city on a night of downpour: the control yard, the cage lift, the inflow tunnel, the surge tank, then shaft No. 3.'],
  env:{sky:1,skyTex:'e5sky',rain:1,storm:1,fog:'#0a1012',fogD:.03,halo:'#6a7480',ambOut:'#2a3038',ambIn:'#1c2224',boAmb:.45},bounds:[-37,-55,80,22],
  probeY:[-3.2,-1,.9,2.4,4.7,6.8,9.5,12.5,15.5,18.5,21.5,24.5,27.5,30.5,33.9,35.4,37.4,41],mini:[2.6,9,19,30.5],
  build:buildEp5,tex:bakeEp5Tex,mesh:ep5Mesh,ep:5};

'use strict';
// ============ Chapter 10 map 「격리구역 Q-7 중앙 연구소」 (Quarantine Zone Q-7's central laboratory): the season 2 finale ============
// The first dawn of the season, back where it began. North is -z. The surface at y 30 (the yard, the atrium); B5 at y 0 (the antechamber,
// the ward, the service corridor, the vault), joined by the freight elevator (elpis.js runs the car).
// A  the decon checkpoint in the yard  x -34..34    z 101..158   the army's decon lane up to the lab's glass doors (gate gA, z 100.8)
// B  the main atrium                    x -24..24    z 57..100.6  two storeys under a skylight; the mezzanine (y 36) round three sides
//                                                                (two stairs); the freight elevator in the north wall (gate gB)
// —  the shaft                          x -3.6..3.6  z 45.6..56.4 the car (x ±3, z 46..56) from the atrium (y 30) down to B5 (y 0)
// C  B5's antechamber                   x -14..14    z 6..45.2    the decon showers, the nurses' station over the ward's window, the
//                                                                ward's doors (gate gW, west), the vault door (gate gV, north)
//    the ward                           x -30..-14.4 z 8..42      her patients' beds, 02's corner
//    the service corridor               x -30..-22.4 z -28..8     from the ward to the vault's service door (gate gS); the incinerator vents
// D  the stock vault                    x -22..22    z -44..2     the stock column, the catwalk (y 5) along the north and east walls, the
//                                                                cryo tanks, beds, RT-1's things on a table; the four UV banks
// ELPIS (elpis.js) meets the team in C and fights in D; the escape runs D → gS → the corridor → the ward → gW → C → the car.
Object.assign(MATS,{
  e10yard:{t:'e10yard',s:4,cs:1,k:'stone'},e10grass:{t:'e10grass',s:5,cs:2,k:'soft'},e10fac:{t:'e10fac',uv:'boxV',s:12,cs:2,k:'stone'},e10cw:{t:'e10cw',uv:'boxV',s:6,cs:1,k:'glass'},
  e10roofG:{t:'e10roofG',s:6,emis:.3,cs:2,k:'glass'},e10ban:{t:'e10ban',uv:'box',emis:.1,k:'soft'},e10desk:{t:'e10desk',uv:'box',k:'wood'},e10rail:{t:'e10rail',uv:'box',emis:.08,k:'glass'},
  e10shaft:{t:'e10shaft',s:4,k:'stone'},e10vault:{t:'e10vault',s:4,k:'metal'},e10vF:{t:'e10vF',s:4,k:'metal'},e10vdoor:{t:'e10vdoor',uv:'box',k:'metal'},
  e10cryo:{t:'e10cryo',emis:.6,k:'glass'},e10col:{t:'e10col',emis:.14,k:'metal'},e10bed:{t:'e10bed',uv:'box',k:'soft'},e10curt:{t:'e10curt',s:2,k:'soft'},
  e10notes:{t:'e10notes',uv:'box',emis:.06,k:'soft'},e10board:{t:'e10board',uv:'box',emis:.12,k:'soft'},e10uv:{t:'e10uv',uv:'box',emis:.4,k:'metal'},e10uvL:{t:'e10uvL',uv:'box',emis:.7,k:'glass'},
  e10tent:{t:'e10tent',s:3,k:'soft'},e10iv:{t:'e10iv',uv:'box',emis:.9,k:'glass'},e10gate:{t:'e10gate',uv:'box',k:'metal'},
  e10sFac:{t:'e10sFac',uv:'box',emis:.25,k:'metal'},e10sDecon:{t:'e10sDecon',uv:'box',emis:.2,k:'metal'},e10sLane:{t:'e10sLane',uv:'box',emis:.2,k:'metal'},e10sGate:{t:'e10sGate',uv:'box',emis:.15,k:'metal'},
  e10sElev:{t:'e10sElev',uv:'box',emis:.45,k:'metal'},e10sB5:{t:'e10sB5',uv:'box',emis:.35,k:'metal'},e10sVault:{t:'e10sVault',uv:'box',emis:.35,k:'metal'},e10sWard:{t:'e10sWard',uv:'box',emis:.3,k:'metal'},
  e10sNurse:{t:'e10sNurse',uv:'box',emis:.3,k:'metal'},e10sSter:{t:'e10sSter',uv:'box',emis:.8,k:'metal'},e10sCtrl:{t:'e10sCtrl',uv:'box',emis:.3,k:'metal'},e10sMach:{t:'e10sMach',uv:'box',emis:.3,k:'metal'},
  e10sRecp:{t:'e10sRecp',uv:'box',emis:.3,k:'metal'},e10sSvc:{t:'e10sSvc',uv:'box',emis:.3,k:'metal'},
  e10sB1:{t:'e10sB1',uv:'box',emis:.5,k:'metal'},e10sB2:{t:'e10sB2',uv:'box',emis:.5,k:'metal'},e10sB3:{t:'e10sB3',uv:'box',emis:.5,k:'metal'},e10sB4:{t:'e10sB4',uv:'box',emis:.5,k:'metal'},e10sBB5:{t:'e10sBB5',uv:'box',emis:.5,k:'metal'}
});
// the sun: low in the east-north-east, ten degrees up (the sky's painting puts its glow where the dome shows that direction)
const E10SUN=(()=>{const d=new THREE.Vector3(.86,.18,-.48).normalize();let u=Math.atan2(d.z,-d.x)/TAU;if(u<0)u+=1;return {d,u,v:Math.acos(d.y)/(Math.PI*.55)}})();
// ---------- textures (painted on first load; chapter 1's Q-7 walls, floors, doors and glass are reused) ----------
// the dawn: the last of the night blue overhead, mauve going to rose and gold down at the horizon, warm round the sun's bearing; cirrus
// lit from below
function texE10Sky(){const W=512,H=256,su=E10SUN.u,sv=E10SUN.v*H;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H,du=Math.abs(((x/W-su+1.5)%1)-.5)*2;
  const low=mix('#d89a92','#8a7aa0',du),hor=mix('#ffd29a','#b8a0b0',du);
  let c=v<.42?mix('#121a36','#34426e',v/.42):v<.74?mix('#34426e',low,(v-.42)/.32):mix(low,hor,clamp((v-.74)/.16,0,1));
  const g=Math.hypot((((x/W-su+1.5)%1)-.5)*W*.55,y-sv);if(g<110)c=mix(c,'#fff2d6',Math.pow(1-g/110,2.4)*.9);
  const cl=P.n(x*.3,y*3,48,10011,4);if(cl>.52&&v>.3&&v<.86)c=mix(c,du<.55?'#ffb08a':'#b898b0',clamp((cl-.52)*2.4,0,.75)*(1-du*.35));
  if(v<.5&&P.n(x,y*2,30,10012,3)>.64)c=mix(c,'#4a5482',.3);P.set(x,y,c)}})}
// the yard: 2 m concrete slabs gone dark where the decon spray ran off, chalky residue, cracks
function texE10Yard(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,40,10021,3)*.8+hash2(x,y,10022)*.12,['#5a5c5e','#646668','#6e7072','#787a7a'],.08);
  if(x%128<2||y%128<2)c='#3e4042';const w=P.n(x,y,64,10023,3);if(w>.57)c=mix(c,'#353c46',clamp((w-.57)*2.4,0,.55));
  const s=P.n(x*1.3,y,28,10024,2);if(s>.68)c=mix(c,'#bab69c',clamp((s-.68)*2,0,.35));P.set(x,y,c)}
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,10025)*N),Math.floor(hash2(i,2,10025)*N),24+Math.floor(hash2(i,3,10025)*40),10026+i,'#2a2c2e','#7a7c7e')})}
// winter grass beyond the fences, white with frost in the hollows
function texE10Grass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,30,10031,4)*.9+hash2(x,y,10032)*.15,['#3a3628','#4a4430','#5a523a','#665e46'],.12);
  if(hash2(x,y>>1,10033)<.08)c=lt(c,.15);const f=P.n(x,y,50,10034,3);if(f>.58)c=mix(c,'#a8adb6',clamp((f-.58)*1.6,0,.45));P.set(x,y,c)}})}
// the lab's front: pale composite panels, a teal band at every floor, the window strips catching the dawn (some broken), grime run down
function texE10Fac(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const fl=Math.floor((y-12)/81.3),fy=(y-12)-fl*81.3;
  let c=mix('#c4c8cc','#b0b4ba',P.n(x,y,30,10041,3));if(x%64<2)c=dk(c,.14);
  if(y<12)c=mix('#868c92','#969ca2',P.n(x,y,8,10042,2));
  else if(fy<7)c=mix('#2a6878','#347888',P.n(x,y,10,10043,2));
  else if(fy>26&&fy<62&&x%64>6&&x%64<58){const wi=Math.floor(x/64)+fl*8,br=hash2(wi,3,10044)<.16;c=br?'#0a0c10':mix('#26304a','#9a7488',clamp(1-(fy-26)/36,0,1)*.65);
    if(!br&&(x%64===32||x%64===33))c='#5a6066';if(!br&&hash2(x>>2,y>>2,10045)<.03)c=lt(c,.22)}
  P.set(x,y,c)}
  for(let i=0;i<26;i++)streak(P,Math.floor(hash2(i,1,10046)*W),Math.floor(12+hash2(i,2,10046)*H*.85),20+Math.floor(hash2(i,3,10046)*60),.2,2)})}
// the curtain wall over the doors: the dawn in the glass, mullions and transoms, a crack or two
function texE10Cw(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const v=y/N,cx=x%64,cy=y%85;let c=mix(mix('#b88a96','#3a4660',clamp(v*1.6,0,1)),'#10161e',clamp((v-.45)*1.8,0,1));
  c=mix(c,'#f0d4c4',clamp(P.n(x*.4,y,40,10051,2)-.58,0,1)*.9);if((x+y*.5)%90<5)c=lt(c,.12);
  if(v>.62&&cx>10&&cx<54&&cy>30&&cy<70&&hash2(Math.floor(x/64),Math.floor(y/85),10054)<.5)c=mix(c,'#e8c890',.35*(1-Math.abs(cy-50)/20));
  if(cx<4||cy<4)c=cx<2||cy<2?'#9aa2aa':'#5a626a';P.set(x,y,c)}
  for(let i=0;i<3;i++)crack(P,Math.floor(hash2(i,1,10052)*N),Math.floor(hash2(i,2,10052)*N),34,10053+i,'#dfe6ee',null)})}
// the skylight seen from below: frosted panes in a steel grid, bright with the morning
function texE10RoofG(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8ccd6','#e0e2ea',P.n(x,y,40,10061,3));c=mix(c,'#f0dcd0',clamp(P.n(x,y,90,10062,2)-.5,0,1)*.6);
  if(x%64<4||y%64<4)c='#4a5058';else if(hash2(x>>3,y>>3,10063)<.04)c=dk(c,.25);P.set(x,y,c)}})}
// the banner over the lobby: teal cloth, the lab's name and its motto, torn at a corner, spattered
function texE10Ban(){const W=512,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#1e5a68','#246a7a',P.n(x,y,20,10071,2));if(y<6||y>H-7)c='#e8eef0';
    if(x>W-60&&y>H-60&&x-(W-60)+(y-(H-60))>70){P.alpha(x,y,0);continue}if(P.n(x,y,9,10072,2)>.72&&x<W*.4)c=mix(c,'#4a0808',.7);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#f0f4f4';ctx.textAlign='center';ctx.font='bold 38px sans-serif';ctx.fillText('격리구역 Q-7 중앙 연구소',W/2,48);ctx.font='bold 22px sans-serif';ctx.fillText('우리는 내일을 연구합니다',W/2,84);ctx.font='bold 14px sans-serif';ctx.fillText('WE RESEARCH TOMORROW',W/2,108)}})}
// the reception's front: white laminate, the teal stripe, the lab's name in small letters, kicked and scuffed
function texE10Desk(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#d8dcdc','#c8ccce',P.n(x,y,24,10081,2));if(y>H*.68&&y<H*.78)c='#2a6878';if(y>H-6)c='#3a3e42';
    if(P.n(x,y,10,10082,2)>.7&&y>H*.6)c=dk(c,.25);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#2a3a44';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('Q-7 CENTRAL LABORATORY',W/2,H*.45)}})}
// the mezzanine's glass balustrade (its steel shoe along the bottom)
function texE10Rail(){const W=128,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#34404c','#44525e',P.n(x,y,24,10091,2));if((x+y*1.4)%46<3)c='#7a8a98';if(y>H-7)c='#2a2e32';if(x%64<2)c='#5a626a';P.set(x,y,c)}})}
// raw concrete (the shaft, the service corridor): form-board seams, damp
function texE10Shaft(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,28,10101,3)*.8+hash2(x,y,10102)*.1,['#4e5052','#58595a','#626364','#6c6c6c'],.08);
  if(y%64<2)c=dk(c,.25);if(x%128<1)c=dk(c,.15);const d=P.n(x,y*.6,40,10103,3);if(d>.6)c=mix(c,'#2e3236',clamp((d-.6)*2,0,.5));P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,10104)*N),Math.floor(hash2(i,2,10104)*N*.6),30+Math.floor(hash2(i,3,10104)*70),.16,2)})}
// the vault's walls: blue-grey steel panels, rivets, frost along the seams
function texE10Vault(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const px=Math.floor(x/128),py=Math.floor(y/64);let c=mix('#4a5866','#56646e',P.n(x,y,30,10111,3));if((px+py)%2)c=lt(c,.05);
  if(x%128<2||y%64<2)c='#2a323a';else if(x%128<4||y%64<4)c=mix(c,'#c8dce8',.3);if((x%128===10||x%128===118)&&y%16===8)c='#8a98a4';if(P.n(x,y,16,10112,2)>.7)c=mix(c,'#2a3038',.4);P.set(x,y,c)}})}
// the vault's floor: dark steel plates, yellow guide lines, scratches, a dragged smear
function texE10VF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2e3338','#383e44',P.n(x,y,24,10121,3));if(x%128<2||y%128<2)c='#1a1e22';
  if(x%128>58&&x%128<66&&y%32<20)c='#c8a020';if(hash2(x,y,10122)<.05)c=lt(c,.12);P.set(x,y,c)}
  for(let k=0;k<90;k++){const x=40+k*1.2,y=200+Math.sin(k*.08)*6;for(let w=-3;w<=3;w++)if(hash2(k,w,10123)<.6)P.set(Math.round(x),Math.round(y+w),'#3a0a08',.5*(1-k/90))}})}
// the vault door from either side: a round steel door in its square frame, the locking bolts, the wheel, the hazard band, the stencil
function texE10VDoor(){const W=256,H=168;return paint(W,H,P=>{const cx=W/2,cy=H*.48,R=H*.46;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const r=Math.hypot(x-cx,y-cy);let c=mix('#3a424a','#444c54',P.n(x,y,20,10131,2));
    if(r<R){c=mix('#7a8690','#8a96a0',P.n(x,y,16,10132,2));if(r>R-6)c='#2a3036';else if(Math.abs(r-R*.7)<2||Math.abs(r-R*.4)<2)c='#5a646c';
      const a=Math.atan2(y-cy,x-cx);if(r<R*.32&&r>R*.26)c='#c8a020';if(r<R*.3&&(Math.abs(Math.sin(a*2))<.08))c='#3a4248';if(r<5)c='#1a1e22';
      for(let k=0;k<12;k++){const b=k/12*TAU;if(Math.hypot(x-(cx+Math.cos(b)*R*.86),y-(cy+Math.sin(b)*R*.86))<4)c='#c0c8d0'}}
    if(y>H-14)c=((x+y)%24<12)?'#d8b020':'#1a1a1a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8ece8';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('B5 · 원액 보관실',cx,cy+R*.58)}})}
// a cryo tank (round the cylinder twice): steel caps, the blue liquid with its bubbles, frost on the glass
function texE10Cryo(){const W=128,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H;let c;
  if(v<.1||v>.9)c=mix('#5a646c','#6a747c',P.n(x,y,8,10141,2));else{c=mix('#2a6a9a','#4aa0d0',clamp(1-(v-.18)/.7,0,1));if(v<.2)c='#14202a';if(hash2(x>>1,y>>1,10142)<.015)c='#c8eaff';
    const f=P.n(x,y,14,10143,3);if(f>.62)c=mix(c,'#e0f0f8',clamp((f-.62)*2.2,0,.6));if(x%64<3)c='#3a4248'}
  if(v>.45&&v<.5)c='#e8e4d8';P.set(x,y,c)}})}
// the stock column: rows of drawers, most pulled open and empty, the label band — 0 / 12
function texE10Col(){const W=256,H=512;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x%32,dy=y%32,i=Math.floor(x/32)+Math.floor(y/32)*8;let c=mix('#8a96a2','#9aa6b0',P.n(x,y,20,10151,2));
    if(dx<2||dy<2)c='#3a444c';else if(hash2(i,1,10152)<.62&&dx>4&&dx<28&&dy>4&&dy<28)c=mix('#0e1216','#1a2026',dy/32);else if(dy>14&&dy<17&&dx>10&&dx<22)c='#3a444c';
    if(y>H*.46&&y<H*.54)c=y%2?'#14202a':'#16222c';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#7ae8ff';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('원액 보관 · Q7-STOCK',W/2,H*.5-2);ctx.fillStyle='#ff5a3a';ctx.fillText('0 / 12',W/2,H*.5+18)}})}
// a hospital bed's mattress from above: the sheet, the pillow end, the green stains, the black restraint straps
function texE10Bed(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#d8dcd8','#c8ccc8',P.n(x,y,16,10161,2));if(x<26)c=mix('#b8c8d4','#c8d4dc',P.n(x,y,8,10162,2));
  if(Math.abs(x-60)<4||Math.abs(x-100)<4)c='#1a1a1c';const s=P.n(x,y,22,10163,3);if(s>.62)c=mix(c,'#6a8a4a',clamp((s-.62)*2,0,.6));if(P.n(x,y,9,10164,2)>.76)c=mix(c,'#5a0e0a',.5);P.set(x,y,c)}})}
// a privacy curtain: pale green, hanging in folds, stained along the hem
function texE10Curt(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const f=.5+.5*Math.sin(x/N*TAU*6+P.n(x,y,40,10171,2)*2);let c=mix('#8aa89a','#b4ccc0',f);
  if(y>N*.82)c=mix(c,'#5a6a40',clamp((y/N-.82)*3,0,.6));if(P.n(x,y,12,10172,2)>.74)c=mix(c,'#6a2a20',.4);P.set(x,y,c)}})}
// 02's wall: notes taped up over weeks (her handwriting), tally marks, a photo of the seven of them
function texE10Notes(){const W=256,H=176;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)P.set(x,y,mix('#b8bcb6','#a8aca6',P.n(x,y,20,10181,2)));
  const notes=[[8,10,70,40,'#f0e070'],[86,6,78,46,'#f4f2ea'],[172,14,74,38,'#f0e070'],[12,60,92,52,'#f4f2ea'],[112,64,62,40,'#e8f0a0'],[182,60,66,56,'#f4f2ea'],[18,122,70,44,'#f0e070'],[98,116,84,52,'#f4f2ea'],[192,124,56,42,'#e8f0a0']];
  for(const [x0,y0,w,h,c] of notes){for(let y=0;y<h;y++)for(let x=0;x<w;x++)P.set(x0+x,y0+y,hash2(x0+x,y0+y,10182)<.04?dk(c,.1):c);for(let x=0;x<14;x++)P.set(x0+w/2-7+x,y0,'#d8d8c8')}
  for(let y=0;y<34;y++)for(let x=0;x<40;x++)P.set(116+x,72+y,y<10?'#5a6a7a':mix('#3a4a3a','#6a7a6a',hash2(x>>2,y>>2,10183)));
  P.post=ctx=>{ctx.fillStyle='#1a2a5a';ctx.textAlign='left';const L=[[12,30,'포기하지 마'],[90,24,'다 살릴 수'],[90,40,'있어 — 02'],[176,30,'D+41'],[16,80,'04 — 기다려'],[16,100,'원액 0/12'],[186,80,'환자 31명'],[186,98,'투약 4시간'],[22,142,'IIII IIII IIII'],[102,138,'01 03 05 06 07'],[102,156,'— 다시 만나'],[196,146,'?']];
    for(const [x,y,t] of L){ctx.font='italic bold 13px sans-serif';ctx.fillText(t,x,y)}ctx.strokeStyle='#1a2a5a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(100,142);ctx.lineTo(180,150);ctx.stroke()}})}
// the antechamber's whiteboard: RT-1's suppressant log, a row a member, the last line a question
function texE10Board(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#eceeea','#e0e2de',P.n(x,y,30,10191,2));if(x<3||y<3||x>W-4||y>H-4)c='#8a8e92';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a3a8a';ctx.textAlign='left';ctx.font='bold 13px sans-serif';ctx.fillText('1차 회수팀 · 억제제 투약 일지',10,18);ctx.font='11px sans-serif';
    const R=[['RT1-01','✕'],['RT1-03','✕'],['RT1-04','✕'],['RT1-05','✕'],['RT1-06','✕'],['RT1-07','✕'],['RT1-02','4h']];R.forEach((r,i)=>{const y=34+i*12;ctx.fillStyle='#1a3a8a';ctx.fillText(r[0],14,y);ctx.fillStyle=r[1]==='✕'?'#b81c14':'#1a6a3a';ctx.fillText(r[1],80,y)});
    ctx.fillStyle='#1a3a8a';ctx.fillText('RT-2 — ?',150,120);ctx.strokeStyle='#b81c14';ctx.beginPath();ctx.moveTo(130,40);ctx.lineTo(240,100);ctx.stroke()}})}
// a UV bank's switch box: violet, the lever, the warning
function texE10Uv(){const W=64,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a2a7a','#5a368a',hash2(x,y>>2,10201));if(x<2||y<2||x>W-3||y>H-3)c='#1a1424';if(y>96&&y<104)c=((x+y)%12<6)?'#d8b020':'#1a1a1a';
  if(x>24&&x<40&&y>40&&y<84)c='#141018';if(x>28&&x<36&&y>44&&y<60)c='#c0c8d0';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8dcff';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('UV 멸균',32,18);ctx.font='bold 7px sans-serif';ctx.fillText('STERILIZER',32,30);ctx.fillText('눈 보호',32,120)}})}
// a UV tube in its housing (it glows faintly even when off)
function texE10UvL(){const W=64,H=32;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y>10&&y<22?mix('#5a3a9a','#8a6ad0',1-Math.abs(y-16)/6):'#2a2a32';if(x<2||x>W-3)c='#1a1a1e';P.set(x,y,c)}})}
// the decon tent's white canvas, its grey-green skirt
function texE10Tent(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c4c8c0','#d4d8d0',P.n(x,y,30,10211,3));if(y>N*.8)c=mix('#5a6450','#6a7460',P.n(x,y,12,10212,2));
  if(x%64<2)c=dk(c,.1);const s=P.n(x,y,20,10213,2);if(s>.66)c=mix(c,'#8a8a6a',.3);P.set(x,y,c)}})}
// an IV bag: the green of the stock, its label
function texE10Iv(){const W=32,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y<10?'#c8ccc8':mix('#4aff8a','#2ac86a',y/H);if(y>24&&y<36&&x>6&&x<26)c='#eef2ee';if(x<2||x>W-3)c='#a8b8a8';P.set(x,y,c)}})}
// the perimeter's shut gate: steel slats, the hazard band, the stencil
function texE10Gate(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5258','#566068',P.n(x,y,20,10221,2));if(x%32<3)c='#2a3036';if(y>H-16)c=((x+y)%24<12)?'#d8b020':'#1a1a1a';
  if(P.n(x,y,12,10222,2)>.72)c=mix(c,'#6a4a2a',.5);P.set(x,y,c)}P.post=ctx=>{ctx.fillStyle='#e8e8e0';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('Q-7 봉쇄선',W/2,H*.42)}})}
function bakeEp10Tex(){if(TEX.e10yard)return;if(typeof bakeEp1Tex==='function')bakeEp1Tex();
  if(!TEX.sunDisc&&typeof texSunDisc==='function'){TEX.sunDisc=mkTex(texSunDisc(),false);TEX.sunDisc.minFilter=THREE.LinearFilter;TEX.sunDisc.generateMipmaps=false}
  TEX.e10sky=mkTex(texE10Sky(),false);TEX.e10sky.wrapS=THREE.RepeatWrapping;TEX.e10sky.magFilter=THREE.LinearFilter;
  TEX.e10yard=mkTex(texE10Yard());TEX.e10grass=mkTex(texE10Grass());TEX.e10fac=mkTex(texE10Fac());TEX.e10cw=mkTex(texE10Cw());TEX.e10roofG=mkTex(texE10RoofG());
  TEX.e10ban=mkTex(texE10Ban(),false);TEX.e10desk=mkTex(texE10Desk(),false);TEX.e10rail=mkTex(texE10Rail(),false);TEX.e10shaft=mkTex(texE10Shaft());TEX.e10vault=mkTex(texE10Vault());
  TEX.e10vF=mkTex(texE10VF());TEX.e10vdoor=mkTex(texE10VDoor(),false);TEX.e10cryo=mkTex(texE10Cryo());TEX.e10col=mkTex(texE10Col());TEX.e10bed=mkTex(texE10Bed(),false);
  TEX.e10curt=mkTex(texE10Curt());TEX.e10notes=mkTex(texE10Notes(),false);TEX.e10board=mkTex(texE10Board(),false);TEX.e10uv=mkTex(texE10Uv(),false);TEX.e10uvL=mkTex(texE10UvL(),false);
  TEX.e10tent=mkTex(texE10Tent());TEX.e10iv=mkTex(texE10Iv(),false);TEX.e10gate=mkTex(texE10Gate(),false);
  const S=(k,l,bg,fg,w,h)=>{TEX[k]=mkTex(texSign(l,bg,fg,w,h),false)};
  S('e10sFac',[{t:'격리구역 Q-7 중앙 연구소'},{t:'Q-7 CENTRAL LABORATORY',s:9}],'#16323e','#eef4f6',320,52);
  S('e10sDecon',[{t:'제독 검문소 — 모든 인원은 제독 후 출입'},{t:'DECON CHECKPOINT · ALL PERSONNEL',s:8}],'#d8b020','#141414',300,44);
  S('e10sLane',[{t:'제독 통로 →'},{t:'DECON LANE',s:9}],'#1a5a3a','#f0f4f0',160,36);
  S('e10sGate',[{t:'출입 통제 · 봉쇄 중'},{t:'CONTAINMENT — NO EXIT',s:8}],'#b81c14','#ffffff',200,36);
  S('e10sElev',[{t:'화물용 승강기 · B5 직통'},{t:'FREIGHT ELEVATOR · B5',s:9}],'#202428','#ffc848',220,40);
  S('e10sB5',[{t:'B5 · 격리 구역'},{t:'CONTAINMENT LEVEL',s:8}],'#4a1a14','#ffd8c8',160,36);
  S('e10sVault',[{t:'원액 보관실 · 인가자 외 출입 금지'},{t:'STOCK VAULT · AUTHORISED ONLY',s:8}],'#3a1a1a','#ffd8c8',260,40);
  S('e10sWard',[{t:'격리 병동'},{t:'ISOLATION WARD',s:9}],'#2a3a4a','#e8eef4',140,36);
  S('e10sNurse',[{t:'간호 스테이션'},{t:'NURSES\' STATION',s:9}],'#2a3a4a','#e8eef4',140,36);
  S('e10sSter',[{t:'⚠ 멸균 프로토콜 대기 중'},{t:'STERILIZATION PROTOCOL ARMED',s:8}],'#b81c14','#ffffff',220,40);
  S('e10sCtrl',[{t:'중앙 통제실'},{t:'CONTROL ROOM',s:9}],'#2a3a4a','#e8eef4',140,36);
  S('e10sMach',[{t:'승강기 기계실'},{t:'ELEVATOR MACHINERY',s:8}],'#202428','#ffc848',140,36);
  S('e10sRecp',[{t:'안내 · 보안'},{t:'RECEPTION · SECURITY',s:8}],'#16323e','#eef4f6',140,36);
  S('e10sSvc',[{t:'멸균 설비 통로'},{t:'STERILIZATION SERVICE',s:8}],'#3a2a1a','#ffd8b0',160,36);
  [['e10sB1','B1'],['e10sB2','B2'],['e10sB3','B3'],['e10sB4','B4'],['e10sBB5','B5']].forEach(([k,t])=>S(k,[{t}],'#141414','#ffc848',56,32))}
// ---------- geometry helpers ----------
const E10NZ={nosolid:true},E10SG={nosolid:true,f:{py:'metal2',ny:'metal2'}},E10Y=30;// (a sign: the picture on its faces, plain steel on top and bottom)
// a decon tent (white canvas, a stepped roof) with its door on the east side, standing at y
function e10tent(x0,z0,x1,z1,d0,d1,y){const h=2.6,t=.06;wallX(x0,x1,z0,z0+t,y,y+h,'e10tent');wallX(x0,x1,z1-t,z1,y,y+h,'e10tent');wallZ(x0,x0+t,z0+t,z1-t,y,y+h,'e10tent');wallZ(x1-t,x1,z0+t,z1-t,y,y+h,'e10tent',[[d0,d1,y,y+2.3]]);
  const cz=(z0+z1)/2,hw=(z1-z0)/2+.15;B(x0-.12,y+h,cz-hw,x1+.12,y+h+.26,cz+hw,'e10tent');B(x0-.12,y+h+.26,cz-hw*.64,x1+.12,y+h+.5,cz+hw*.64,'e10tent');B(x0-.12,y+h+.5,cz-hw*.3,x1+.12,y+h+.7,cz+hw*.3,'e10tent');
  B(x1+.12,y+2.5,d0-.3,x1+.15,y+2.95,d1+.3,'e10sLane',E10NZ)}
// a container without snow (6 × 2.44 × 2.6) from its low corner along the axis, at y
function e10cont(x0,z0,ax,mat,y){if(ax==='x')B(x0,y,z0,x0+6,y+2.6,z0+2.44,mat);else B(x0,y,z0,x0+2.44,y+2.6,z0+6,mat)}
// sandbags, a run of them along the axis at y
function e10sand(x0,z0,ax,len,h,y){if(ax==='x')B(x0,y,z0-.35,x0+len,y+h,z0+.35,'sandbag');else B(x0-.35,y,z0,x0+.35,y+h,z0+len,'sandbag')}
// an army truck from x0,z0 along the axis (cab at the high end), at y
function e10truck(x0,z0,ax,y){const L=7.2,W=2.4,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,y+y0,z0+c0,x0+a1,y+y1,z0+c1,m,oo):B(x0+c0,y+y0,z0+a0,x0+c1,y+y1,z0+a1,m,oo);
  LB(.2,L-.2,.15,W-.15,.6,1.15,'metal2');LB(L-2,L-.1,.1,W-.1,1.15,2.55,'car');LB(L-.12,L-.08,.3,W-.3,1.7,2.35,'carGl',E10NZ);LB(.2,L-2.2,.05,W-.05,1.15,1.6,'car');LB(.2,L-2.2,.05,W-.05,1.6,3.05,'tent');
  for(const a of [.6,1.9,L-1.4])for(const c of [-.04,W-.36])LB(a,a+.85,c,c+.4,0,.9,'tire')}
// a car (the long side picks the axis), at y — map.js's car() stands on the ground at 0
function e10car(x0,z0,x1,z1,mat,y,o){o=o||{};const ax=(x1-x0)>=(z1-z0);const L=ax?x1-x0:z1-z0,W=ax?z1-z0:x1-x0;
  const LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax?B(x0+a0,y+y0,z0+c0,x0+a1,y+y1,z0+c1,m,oo):B(x0+c0,y+y0,z0+a0,x0+c1,y+y1,z0+a1,m,oo);
  LB(.12,L-.12,0,W,.32,.95,mat);LB(1.15,L-1,.1,W-.1,.95,1.48,o.burnt?mat:'carGl',{f:{py:mat}});LB(0,.12,.08,W-.08,.3,.62,'metal2');LB(L-.12,L,.08,W-.08,.3,.62,'metal2');
  for(const a of [.55,L-1.25])for(const c of [-.04,W-.24])LB(a,a+.7,c,c+.28,0,.64,'tire')}
// a guard booth (windows all round, a lamp inside), at y
function e10booth(x,z,y){B(x-.8,y,z-.8,x+.8,y+2.5,z+.8,'plaster');B(x-.95,y+2.5,z-.95,x+.95,y+2.7,z+.95,'roof');
  for(const [fx,fz] of [[0,-1],[0,1],[-1,0],[1,0]])if(fx)B(x+fx*.81-.01,y+1.1,z-.5,x+fx*.81+.01,y+2,z+.5,'winLit',E10NZ);else B(x-.5,y+1.1,z+fz*.81-.01,x+.5,y+2,z+fz*.81+.01,'winLit',E10NZ);LIGHT(x,y+2.1,z,'#ffe2b0',5,.6)}
// a hospital bed (along x, its head at hx = the low or the high end), its mattress, the IV pole and its glowing bag by the head
function e10bed(x,z,hx,y,iv){y=y||0;const L=2.1,W=.96,x0=x-L/2,x1=x+L/2;for(const lx of [x0+.06,x1-.12])for(const lz of [z-W/2+.04,z+W/2-.1])B(lx,y,lz,lx+.06,y+.42,lz+.06,'metal2');
  B(x0,y+.42,z-W/2,x1,y+.55,z+W/2,'metal2');B(x0+.05,y+.55,z-W/2+.04,x1-.05,y+.7,z+W/2-.04,'e10bed');
  const hb=hx<0?x0:x1-.12;B(hb,y,z-W/2,hb+.12,y+1.1,z+W/2,'metal2');
  if(iv){const px=hx<0?x0+.3:x1-.3,pz=z+W/2+.22;B(px-.04,y,pz-.04,px+.04,y+2,pz+.04,'metal2');B(px-.11,y+1.55,pz-.05,px+.11,y+1.95,pz+.05,'e10iv',E10NZ)}}
// a ceiling light strip (emissive) and its baked light
function e10ceil(x,y,z,len,ax,col,int,range){const h=len/2;if(ax==='x')B(x-h,y-.06,z-.16,x+h,y,z+.16,'lampW',E10NZ);else B(x-.16,y-.06,z-h,x+.16,y,z+h,'lampW',E10NZ);LIGHT(x,y-.4,z,col||'#dfe8ff',range||10,int||.85)}
// a glass balustrade along z (or x) at y: the pane (see-through for the bots), the steel handrail on top
function e10glassZ(z0,z1,x,y){B(x-.03,y,z0,x+.03,y+1.02,z1,'e10rail',{pass:1});B(x-.05,y+1.02,z0,x+.05,y+1.09,z1,'metal2',E10NZ)}
function e10glassX(x0,x1,z,y){B(x0,y,z-.03,x1,y+1.02,z+.03,'e10rail',{pass:1});B(x0,y+1.02,z-.05,x1,y+1.09,z+.05,'metal2',E10NZ)}
function buildEp10(){
  const nz=E10NZ,sg=E10SG,Y=E10Y;
  // ================= the ground =================
  // the surface: grass out to the horizon round the yard and the lab's block; the yard paved; the atrium's floor
  slab(-110,30,110,250,Y-1,Y,'e10grass',[[-34,101.2,34,160],[-40,54,40,101.2]],{ground:1});
  B(-34,Y-1,101.2,34,Y,160,'e10yard',{ground:1});B(-24,Y-1,57,24,Y,100.6,'q7lobF',{ground:1});
  // B5: the antechamber, the shaft's pit, the ward, the corridor, the vault; the thresholds under the doors
  B(-14,-1,6,14,0,45.2,'q7labF',{ground:1});B(-3.6,-1,45.2,3.6,0,56.4,'q7labF',{ground:1});B(-30,-1,8,-14,0,42,'q7labF',{ground:1});
  B(-30,-1,-28,-22.4,0,8,'e10vF',{ground:1});B(-22.4,-1,-25,-22,0,-21,'e10vF',{ground:1});B(-22,-1,-44,22,0,2,'e10vF',{ground:1});B(-4,-1,2,4,0,6,'e10vF',{ground:1});
  // ================= zone A: the decon checkpoint =================
  // behind the team: the perimeter wall and its shut gate; the fences along the sides; the guard booth
  wallX(-34,34,158,159,Y,Y+4.6,'conc',[[-4,4,Y,Y+4.2]]);B(-34.1,Y+4.6,157.9,34.1,Y+4.8,159.1,'metal2');B(-4,Y,158.3,4,Y+4.2,158.7,'e10gate');B(-3.2,Y+4.3,157.82,3.2,Y+5.1,157.88,'e10sGate',sg);
  e9fenceZ(101.2,158,-34,Y,3);e9fenceZ(101.2,158,34,Y,3);e10booth(9,154.4,Y);
  // the decon lane: two rows of barriers from the gate up to the doors (a crossing halfway), the pan of decon fluid at the doors
  for(const z of [146.2,143.5,140.8,138.1,127.4,124.7,122,119.3,116.6,113.9])for(const x of [-5.2,5.2])e6jb(x,z,'z',Y);
  B(-3.2,Y,102.6,3.2,Y+.12,105.6,'metal2');B(-3,Y+.12,102.8,3,Y+.13,105.4,'q7tankG',nz);B(-2.5,Y+1.9,135.65,2.5,Y+2.7,135.85,'e10sDecon',{nosolid:true,f:{nz:'e10sDecon',pz:'e10sDecon',py:'metal2',ny:'metal2',px:'metal2',nx:'metal2'}});
  for(const x of [-2.7,2.5])B(x,Y,135.6,x+.2,Y+2.75,135.9,'metal2');
  // the decon tent (west) with its cots and its shower frame; the shower trailer (east): two containers with their hoses
  e10tent(-24,111,-12,124,115.4,120,Y);for(const z of [113,116.5,121.5])B(-23.4,Y,z-.38,-21.4,Y+.45,z+.38,'cot');B(-17.6,Y,118.5,-17.4,Y+2.3,118.7,'metal2');B(-17.6,Y+2.2,116.4,-17.4,Y+2.3,121,'metal2',nz);
  e10cont(12,114.6,'x','contG',Y);e10cont(18,114.6,'x','contG',Y);B(13,Y+2.6,114.8,23.8,Y+2.75,116.8,'metal2');B(14,Y+.9,117.06,22,Y+1.7,117.1,'e10sDecon',sg);
  for(const x of [13.4,22.6])B(x-.06,Y,117.1,x+.06,Y+1.2,117.4,'pipe',nz);
  // the body bags laid out by the tent, the sandbagged posts, the army's trucks, a car left at the line
  for(let i=0;i<6;i++){const z=128.6+i*1.1;B(-24.6,Y,z,-22.6,Y+.32,z+.7,'bag')}for(let i=0;i<3;i++){const z=128.6+i*1.1;B(-21.6,Y,z,-19.6,Y+.32,z+.7,'bag')}
  e10sand(-20,134,'x',6,1.1,Y);e10sand(14,134,'x',6,1.1,Y);e10sand(-20,107,'z',4,1.1,Y);e10sand(20,107,'z',4,1.1,Y);
  e10truck(-29.6,140,'z',Y);e10truck(24.6,146.2,'x',Y);e10car(14,126,18.4,127.9,'carR',Y);e10car(-12.6,148.6,-10.7,153,'car',Y,{burnt:1});
  B(-11.2,Y,108.6,-9.6,Y+1.2,110.2,'wood');B(9.6,Y,108.6,11.2,Y+1.2,110.2,'wood');B(9.7,Y+1.2,108.7,11.1,Y+2.4,110.1,'wood');
  // the floodlights (still on in the dawn), red beacons on the tent and the trailer
  e9flood(-31.6,104,Y,10,'#dce6ff',26);e9flood(31.6,104,Y,10,'#dce6ff',26);e9flood(-31.6,154,Y,10,'#dce6ff',24);e9flood(31.6,154,Y,10,'#dce6ff',24);
  B(-12.2,Y+3,117.4,-12,Y+3.3,117.8,'lampR',nz);B(17.8,Y+2.75,115.4,18.2,Y+3.05,115.8,'lampR',nz);LIGHT(-11.6,Y+3.2,117.6,'#ff3a24',7,.6);LIGHT(18,Y+3.2,116,'#ff3a24',7,.6);
  // ================= the lab's block: the wings either side of the atrium, the curtain wall over the doors (gate gA), the canopy =================
  B(-40,Y,54,-24.4,Y+16,101.2,'e10fac',{f:{py:'none',nz:'none'}});B(24.4,Y,54,40,Y+16,101.2,'e10fac',{f:{py:'none',nz:'none'}});
  wallX(-24.4,24.4,100.6,101.2,Y,Y+16,'e10cw',[[-3,3,Y,Y+3.6]]);B(-3,Y-1,100.6,3,Y,101.2,'q7lobF');
  B(-3,Y,100.75,0,Y+3.6,100.95,'q7glass',{gate:'gA',gs:[-3,0,0]});B(0,Y,100.75,3,Y+3.6,100.95,'q7glass',{gate:'gA',gs:[3,0,0]});
  B(-8,Y+4.4,101.2,8,Y+4.8,108,'metal2');for(const x of [-4,4]){B(x-.6,Y+4.34,104-.15,x+.6,Y+4.4,104+.15,'lampW',nz);LIGHT(x,Y+3.9,104,'#ffe6c4',9,.8)}for(const x of [-7.6,7.6])B(x-.2,Y,107.4,x+.2,Y+4.4,107.8,'metal2');B(-9,Y+5.4,101.2,9,Y+7.8,101.28,'e10sFac',sg);
  // ================= zone B: the atrium =================
  // its walls (the side walls, the north wall with the elevator's top landing), the skylight and its beams
  wallZ(-24.4,-24,57,100.6,Y,Y+14.4,'q7lab');wallZ(24,24.4,57,100.6,Y,Y+14.4,'q7lab');wallX(-24,24,56.4,57,Y,Y+14.4,'q7lab',[[-3,3,Y,Y+4.2]]);
  B(-24,Y+14,57,24,Y+14.4,100.6,'e10roofG',{pass:1,f:{py:'none'}});for(const x of [-18,-12,-6,0,6,12,18])B(x-.12,Y+13.5,57,x+.12,Y+14,100.6,'metal2',nz);
  for(const z of [64,71,78,85,92])B(-24,Y+13.6,z-.1,24,Y+14,z+.1,'metal2',nz);
  // the mezzanine (y 36): the west and east galleries, the north one over the elevator lobby; their balustrades (a gap at each stair's top)
  const mz={f:{ny:'plaster',px:'metal2',nx:'metal2',pz:'metal2',nz:'metal2'}};
  B(-24,Y+5.6,57,-17,Y+6,100.6,'q7lobF',mz);B(17,Y+5.6,57,24,Y+6,100.6,'q7lobF',mz);B(-17,Y+5.6,57,17,Y+6,64,'q7lobF',mz);
  e10glassZ(64,77.6,-17,Y+6);e10glassZ(80.2,100.6,-17,Y+6);e10glassZ(64,77.6,17,Y+6);e10glassZ(80.2,100.6,17,Y+6);e10glassX(-17,17,64,Y+6);
  // the stairs up along the galleries' edges (west and east): from z 92 on the floor to the top at z 79
  stairs('z',-17,-14.6,92,78.6,Y,Y+6,14,'q7lobF');stairs('z',14.6,17,92,78.6,Y,Y+6,14,'q7lobF');
  for(const x of [-14.66,14.6])for(let i=1;i<14;i++){const z0=92-(i+1)*(13.4/14),z1=92-i*(13.4/14),t=Y+(i+1)*6/14;B(x,t,z0,x+.06,t+.95,z1,'e10rail',{pass:1})}
  // the columns under the galleries
  for(const z of [64.4,72,86,96])for(const x of [-17.9,17.3])B(x,Y,z-.3,x+.6,Y+5.6,z+.3,'q7lab');for(const x of [-9,9])B(x-.3,Y,63.6,x+.3,Y+5.6,64.2,'q7lab');
  // the reception: a U of counters (the security console inside it), its monitors, its sign
  B(-5,Y,87.6,5,Y+1.1,88.2,'e10desk');B(-5,Y,84.2,-4.4,Y+1.1,87.6,'e10desk');B(4.4,Y,84.2,5,Y+1.1,87.6,'e10desk');B(-5.1,Y+1.1,84.1,5.1,Y+1.17,88.3,'metal2',nz);
  B(-1,Y,84.6,1,Y+.9,85.2,'metal2');monitor(-.8,Y+.9,84.7,-.1,Y+1.4,84.8,'nz');monitor(.1,Y+.9,84.7,.8,Y+1.4,84.8,'nz');B(-3,Y+3.2,88.24,3,Y+4,88.3,'e10sRecp',sg);
  // the security line: turnstile cabinets, a planter each end; the benches, the facility's model on its table, the banner hung over it all
  for(const x of [-7.8,-4.6,-1.4,1.8,5])B(x-.15,Y,79.7,x+.15,Y+1,80.3,'metal2');for(const x of [-10.6,7.8])B(x-1.2,Y,79.4,x+1.2,Y+.8,80.6,'conc');
  for(const [x,z] of [[-11,95],[11,95],[-11,70],[11,70]])B(x-1.3,Y,z-.3,x+1.3,Y+.45,z+.3,'wood');
  B(-13,Y,73.6,-9,Y+.9,76.4,'metal2');B(-12.6,Y+.9,74,-11,Y+1.5,75.4,'q7lab',nz);B(-10.8,Y+.9,74.2,-9.6,Y+1.2,76,'q7lab',nz);B(-12,Y+.9,75.6,-10,Y+1.1,76.2,'q7tankG',nz);
  B(-9,Y+8.2,82,9,Y+12.2,82.06,'e10ban',nz);for(const x of [-8.6,8.6])B(x-.02,Y+12.2,82.01,x+.02,Y+13.6,82.05,'metal2',nz);
  // the lab wings' doors (shut and chained), the elevator lobby's hazard floor, its sign, the sterilization beacons
  for(const z of [70,90])for(const [x0,x1] of [[-24,-23.92],[23.92,24]]){B(x0,Y,z-1,x1,Y+2.4,z+1,'q7door',nz);B(x0,Y+6,z-1,x1,Y+8.4,z+1,'q7door',nz)}
  B(-4,Y,57,4,Y+.02,60,'hazard',nz);B(-3.4,Y+4.4,57,3.4,Y+5.2,57.06,'e10sElev',sg);B(-3.4,Y+5.25,57,3.4,Y+5.55,57.08,'e10sSter',sg);
  for(const x of [-4.2,4.2])B(x-.15,Y+3.6,57,x+.15,Y+3.9,57.2,'lampR',nz);LIGHT(0,Y+4,58,'#ff3a24',8,.7);
  // the control room on the west gallery (its racks, the console), the elevator's machine room in the north-east corner (a cage, the panel)
  B(-24,Y+6,65.6,-23.2,Y+8.2,68.8,'q7rack');B(-24,Y+6,71.2,-23.2,Y+8.2,74.4,'q7rack');B(-24,Y+6,68.9,-23.4,Y+7.2,71.1,'q7panel');B(-23.98,Y+8.6,67.6,-23.92,Y+9.2,72.4,'e10sCtrl',sg);
  B(-24,Y+7.2,68.9,-23.5,Y+7.9,71.1,'q7term',nz);
  e9fenceZ(57,61.6,19,Y+6,2.6);B(19,Y+6,61.6,21,Y+8.6,61.63,'fence',{pass:1});B(23.3,Y+6,58.4,24,Y+8,60.6,'q7panel');B(23.4,Y+8.2,58.4,23.96,Y+8.8,60.6,'e10sMach',sg);
  B(20.4,Y+6,57.2,22.6,Y+7.4,58.6,'metal2');
  // the atrium's light: lamps under the galleries, two high over the floor, the skylight's glow is the sky's
  for(const z of [66,78,92]){e10ceil(-20.5,Y+5.6,z,2.4,'z','#e6ecf6',.8,11);e10ceil(20.5,Y+5.6,z,2.4,'z','#e6ecf6',.8,11)}e10ceil(0,Y+5.6,60.4,2.4,'x','#e6ecf6',.8,10);
  LIGHT(0,Y+11,70,'#f0e6dc',20,.8);LIGHT(0,Y+11,90,'#f0e6dc',20,.8);
  // ================= the freight elevator: the shaft from B5 up to the atrium, the landing doors (gB at the top, gL at B5) =================
  wallZ(-4,-3.6,45.2,57,0,Y+5.6,'e10shaft');wallZ(3.6,4,45.2,57,0,Y+5.6,'e10shaft');wallX(-4,4,45.2,45.6,0,Y+5.6,'e10shaft',[[-3,3,0,4.2]]);wallX(-4,4,56.4,57,0,Y,'e10shaft');
  B(-4,Y+5.6,45.2,4,Y+6,57,'e10shaft',{f:{py:'none'}});
  B(-3,Y,56.9,0,Y+4.2,57,'q7elev',{gate:'gB',gs:[-3,0,0]});B(0,Y,56.9,3,Y+4.2,57,'q7elev',{gate:'gB',gs:[3,0,0]});
  B(-3,0,45.2,0,4.2,45.3,'q7elev',{gate:'gL',gs:[-3,0,0]});B(0,0,45.2,3,4.2,45.3,'q7elev',{gate:'gL',gs:[3,0,0]});
  // the floors on the way down: shut landing doors on the south side, the floor's number on both
  [['e10sB4',6],['e10sB3',12],['e10sB2',18],['e10sB1',24]].forEach(([s,y])=>{B(-3,y,56.32,3,y+4,56.4,'q7elev',nz);B(-.7,y+4.3,56.3,.7,y+5.1,56.4,s,sg);B(-.7,y+2.6,45.6,.7,y+3.4,45.7,s,sg);B(-3.6,y-.2,56.2,3.6,y,56.4,'metal2',nz)});
  B(-.7,4.6,45.56,.7,5.4,45.62,'e10sBB5',sg);
  // the car's floor at the top landing (invisible: the car draws itself; elpis.js takes it away while the car is down)
  const top=B(-3,Y-.2,46,3,Y,56.4,'none');
  // ================= zone C: B5's antechamber =================
  B(-14.4,6,4,14.4,6.4,45.6,'q7lab',{f:{py:'none'}});wallZ(14,14.4,6,45.2,0,6,'q7lab',null,{f:{px:'none'}});
  wallZ(-14.4,-14,6,45.2,0,6,'q7lab',[[9,19,1.2,3],[22,28,0,3],[31,41,1.2,3]]);wallX(-14,-4,45.2,45.6,0,6,'q7lab');wallX(4,14,45.2,45.6,0,6,'q7lab');B(-4,4.2,45.2,4,6,45.6,'q7lab');
  wallX(-14.4,14.4,4,6,0,6,'q7lab',[[-4,4,0,5.2]]);
  // the observation windows into the ward (open frames, glass that the hands cannot get through), the ward's doors (gW)
  for(const [z0,z1] of [[9,19],[31,41]]){B(-14.3,1.2,z0,-14.1,3,z1,'none',{pass:1});B(-14.4,1.12,z0,-14,1.2,z1,'metal2',nz);B(-14.4,3,z0,-14,3.08,z1,'metal2',nz)}
  B(-14.34,0,22,-14.06,3,25,'q7door',{gate:'gW',gs:[0,0,-3]});B(-14.34,0,25,-14.06,3,28,'q7door',{gate:'gW',gs:[0,0,3]});B(-14.4,-1,22,-14,0,28,'q7labF',{ground:1});
  B(-13.98,3.3,22.4,-13.92,3.9,27.6,'e10sWard',sg);
  // the nurses' station on its platform over the ward's south window: the counters, its steps, its monitors, its sign
  B(-14,0,31,-8.6,1,43,'q7labF');B(-8.6,0,34,-7.8,.5,40,'q7labF');B(-9.2,1,31,-8.6,2.1,34,'e10desk');B(-9.2,1,40,-8.6,2.1,43,'e10desk');
  monitor(-9.15,2.1,31.6,-9.05,2.6,33,'px');monitor(-9.15,2.1,40.8,-9.05,2.6,42.2,'px');B(-13,1,42.4,-11,2.9,43,'q7rack');B(-8.66,2.3,35.4,-8.6,2.9,38.6,'e10sNurse',sg);
  // the decon showers along the east wall (three stalls, a grating floor, the bar of nozzles, a curtain half drawn)
  for(const [z0,z1] of [[10,15],[20,25],[30,35]]){B(11,0,z0-.05,14,2.4,z0+.05,'tile');B(11,0,z1-.05,14,2.4,z1+.05,'tile');B(11.1,0,z0+.05,14,.05,z1-.05,'plate',nz);
    B(11.2,2.55,z0+.3,14,2.65,z1-.3,'metal2',nz);B(10.96,.3,z0+.05,11.02,2.4,z0+2.1,'e10curt',{pass:1})}
  // gurneys (one with a bag), carts, the crash cart; the whiteboard with RT-1's suppressant log; the floor's lines
  B(4,0,29.6,6.2,.9,30.4,'metal2');B(4.1,.9,29.65,6.1,1.2,30.35,'bag');B(-6.6,0,15,-4.4,.9,15.8,'metal2');B(-3.6,0,36,-2.6,1.1,36.8,'metal2');B(-3.5,1.1,36.1,-2.7,1.3,36.7,'q7panel',nz);
  B(13.92,1,37.6,14,2.6,42,'e10board',sg);B(-.12,0,7,.12,.01,44,'paintY',nz);
  // the vault door's way (gV): the round door in its thick wall; the signs and the sterilization beacons over it
  B(-4,0,3.4,4,5.2,4.6,'e10vdoor',{gate:'gV',gs:[-8.6,0,0]});B(-4.4,5.3,6,4.4,6,6.06,'e10sVault',sg);B(-3.6,4.4,6,-2,4.9,6.08,'e10sSter',sg);B(2,4.4,6,3.6,4.9,6.08,'e10sSter',sg);
  for(const x of [-4.8,4.8])B(x-.15,4.6,6,x+.15,4.9,6.2,'lampR',nz);B(4.4,2.8,45.14,9.6,3.6,45.2,'e10sB5',sg);
  e10ceil(-6,6,13,3,'z','#dfe8ff',1,12);e10ceil(6,6,13,3,'z','#dfe8ff',1,12);e10ceil(-6,6,26,3,'z','#dfe8ff',1,12);e10ceil(6,6,26,3,'z','#dfe8ff',1,12);e10ceil(0,6,39,3,'x','#dfe8ff',1,12);LIGHT(0,4.8,7.4,'#ff3020',9,.55);
  // ================= the ward =================
  B(-30.4,6,7.6,-14.4,6.4,42.4,'q7lab',{f:{py:'none'}});wallZ(-30.4,-30,7.6,42.4,0,6,'q7lab',null,{f:{nx:'none'}});wallX(-30.4,-14.4,42,42.4,0,6,'q7lab',null,{f:{pz:'none'}});
  wallX(-30.4,-14.4,7.6,8,0,6,'q7lab',[[-30,-22.4,0,3.4]]);
  // her patients' beds: a row along the west wall, a few along the east under the windows; the curtains' rails over them
  for(const z of [11,15,19,23,27,31,35])e10bed(-28.8,z,-1,0,z%8===3);for(const z of [11,15,35,39])e10bed(-15.6,z,1,0,z===15||z===39);
  for(const z of [13,21,29])B(-30,3.2,z-.03,-26.8,3.26,z+.03,'metal2',nz);for(const z of [17,25,33])B(-30,0,z-.03,-27.6,2.2,z+.03,'e10curt',{pass:1});
  // 02's corner: her cot, a table, a desk lamp, the notes on the wall; the doctor's desk, the medicine cabinet
  B(-29.9,0,38.4,-27.9,.42,39.4,'cot');B(-27.6,0,40.2,-26.2,.78,41.6,'wood');B(-27.2,.78,40.6,-26.9,1.1,40.9,'lampO',nz);B(-29.6,1,41.94,-25.4,3.2,42,'e10notes',sg);LIGHT(-27,1.6,40.4,'#ffc890',6,.75);
  B(-24,0,34.6,-21.8,.78,36.2,'wood');B(-21,0,41.4,-18,2.2,42,'metal2',{f:{nz:'q7glass'}});
  LIGHT(-22,5.4,14,'#c8ecd4',11,.6);LIGHT(-22,5.4,27,'#c8ecd4',11,.55);B(-22.2,5.94,13,-21.8,6,15,'lampW',nz);B(-22.2,5.94,26,-21.8,6,28,'lampW',nz);
  // ================= the service corridor: the incinerator's vents in its floor, its pipes, its red lamps =================
  B(-30.4,4.5,-28.4,-22,4.9,7.6,'e10shaft',{f:{py:'none'}});wallZ(-30.4,-30,-28.4,7.6,0,4.5,'e10shaft',null,{f:{nx:'none'}});wallX(-30.4,-22,-28.4,-28,0,4.5,'e10shaft',null,{f:{nz:'none'}});
  wallZ(-22.4,-22,2,7.6,0,4.5,'e10shaft');
  B(-30,3.4,-28,-29.6,3.8,7.6,'pipe',nz);B(-30,2.6,-28,-29.7,2.9,7.6,'pipe',nz);
  for(const z of [-26,-16,-6,4])B(-30,0,z-.5,-29.4,2,z+.5,'metal2');B(-22.46,2.4,-20,-22.4,3,-16,'e10sSvc',sg);
  for(const z of [-21,-11,-1]){B(-26.2,4.3,z-.15,-25.8,4.5,z+.15,'lampR',nz);LIGHT(-26,4,z,'#ff6a48',11,.75)}LIGHT(-26,4,5,'#ffb070',9,.6);
  // ================= zone D: the stock vault =================
  B(-22.4,12,-44.4,22.4,12.4,4,'e10vault',{f:{py:'none'}});wallZ(22,22.4,-44.4,4,0,12,'e10vault',null,{f:{px:'none'}});wallZ(-22.4,-22,-44.4,2,0,12,'e10vault',[[-25,-21,0,3.2]]);
  wallX(-22.4,22.4,-44.4,-44,0,12,'e10vault',null,{f:{nz:'none'}});wallX(-22,22,2,4,0,12,'e10vault',[[-4,4,0,5.2]]);
  B(-22.34,0,-25,-22.06,3.2,-23,'q7door',{gate:'gS',gs:[0,0,-2]});B(-22.34,0,-23,-22.06,3.2,-21,'q7door',{gate:'gS',gs:[0,0,2]});
  // the catwalk (y 5) along the north and the east walls, its two stairs (west up to the north, east up to the east), the railings
  const cw={f:{ny:'metal2'}};B(-22,4.6,-44,22,5,-40,'plate',cw);B(18,4.6,-40,22,5,-4,'plate',cw);
  stairs('z',-21.8,-19.4,-27.6,-40,0,5,12,'plate');stairs('z',15.6,18,-2,-14,0,5,12,'plate');
  e9railX(-19.4,18,-40,5);e9railZ(-40,-14.2,18,5);e9railZ(-11,-4,18,5);e9railX(18,22,-4,5);
  // the stock column (floor to ceiling, its drawers empty), its dais; RT-1's table by it (elpis.js lays their things on it)
  MAP.deco.push({k:'drum',x:0,y:0,z:-21,r:3.2,h:12,mat:'e10col',rot:0});B(-2.6,0,-23.6,2.6,12,-18.4,'metalx');B(-6.5,0,-27.5,6.5,.3,-14.5,'metal2');
  B(-1.8,0,-14.2,1.8,.95,-13,'metal2');
  // the cryo tanks under the north catwalk (one broken), the oxygen cylinders under the east one
  // (flush with the wall: no gap behind them for the infected or the bots to get lost in, the corner by the west stairs sealed off)
  for(const x of [-18,-12,-6,6,12,18]){MAP.deco.push({k:'drum',x,y:0,z:-43,r:1.05,h:4.2,mat:x===6?'q7tankB':'e10cryo',rot:0});B(x-.86,0,-44,x+.86,4.2,-42.14,'metalx')}
  for(const z of [-36,-30,-24])for(const dx of [0,.6])MAP.deco.push({k:'drum',x:20.6+dx,y:0,z,r:.24,h:1.6,mat:'drumB',rot:0});for(const z of [-36,-30,-24])B(20.3,0,z-.4,21.5,1.6,z+.4,'metalx');
  // her beds in the south-west (curtains between), two in the north-west; carts, crates and gurneys for cover in the east
  for(const [x,z,iv] of [[-16,-4,1],[-16,-9.5,1],[-9.5,-4,0],[-9.5,-9.5,1],[-12,-34,1],[-6,-34,0]])e10bed(x,z,-1,0,iv);
  for(const z of [-6.75])B(-17.2,0,z-.03,-8.4,2.2,z+.03,'e10curt',{pass:1});B(-12.8,0,-11.2,-12.74,2.2,-2.6,'e10curt',{pass:1});
  for(const [x,z] of [[8,-33],[13,-28],[7,-8],[12,-12],[10,-37]])crate(x,z,1.2,0,'wood');crate(8,-33,1,1.2,'wood');crate(12,-12,.9,1.2,'wood');
  B(4.6,0,-30,6.8,.9,-29.2,'metal2');B(-6,0,-19,-5,1.1,-17.6,'metal2');B(14.2,0,-20.6,15.4,1.1,-19.4,'metal2');
  // the UV banks: a switch box per quadrant (north wall by the tanks, the side walls), their tubes on the ceiling
  for(const [x0,z0,x1,z1] of [[-15.6,-44,-14.4,-43.8],[14.4,-44,15.6,-43.8]])B(x0,.9,z0,x1,2.3,z1,'e10uv');B(-22,.9,-8.6,-21.8,2.3,-7.4,'e10uv');B(21.8,.9,-8.6,22,2.3,-7.4,'e10uv');
  for(const [cx,cz] of [[-11,-32.5],[11,-32.5],[-11,-9.5],[11,-9.5]])for(const sx of [-4.5,4.5])for(const sz of [-4,4])B(cx+sx-1.6,11.82,cz+sz-.15,cx+sx+1.6,12,cz+sz+.15,'e10uvL',nz);
  // light: the column lit from above, lamps on the walls, the tanks' blue, a red emergency lamp over the door; the catwalk's lamps
  LIGHT(0,11,-21,'#cfe0ff',20,1.25);for(const [x,z] of [[-11,-32.5],[11,-32.5],[-11,-9.5],[11,-9.5]])LIGHT(x,11.2,z,'#d6e2f4',15,.6);LIGHT(0,3.2,-13.6,'#f4ecdc',5,.9);
  for(const [x,z] of [[-21.6,-34],[-21.6,-12],[21.6,-30],[21.6,-14],[-12,1.6],[12,1.6]]){LIGHT(x,4,z,'#bcd0f0',13,.9);const s=x<-20?1:x>20?-1:0;
    if(s)B(x-.1,3.8,z-.5,x+.1,4.2,z+.5,'lampW',nz);else B(x-.5,3.8,z-.1,x+.5,4.2,z+.1,'lampW',nz)}
  LIGHT(-12,2.6,-40.6,'#4aa8ff',8,.7);LIGHT(12,2.6,-40.6,'#4aa8ff',8,.7);LIGHT(0,8.6,1.4,'#ff3020',12,.45);LIGHT(-6,8.4,-42,'#dfe8ff',10,.6);LIGHT(14,8.4,-42,'#dfe8ff',10,.6);LIGHT(20,8.4,-22,'#dfe8ff',10,.55);
  B(-6.4,8,-43.98,-5.6,8.4,-43.9,'lampW',nz);B(13.6,8,-43.98,14.4,8.4,-43.9,'lampW',nz);B(21.9,8,-22.4,21.98,8.4,-21.6,'lampW',nz);
  // ================= invisible walls round the yard (the fences' tops, the perimeter wall), the canopy kept out of reach =================
  {const W=(x0,z0,x1,z1,y0,h)=>B(x0,y0,z0,x1,y0+(h||9),z1,'none',{pass:1});
    W(-34.2,101.2,-34,159,Y);W(34,101.2,34.2,159,Y);W(-34.2,158,34.2,159,Y);W(-8.2,101.2,8.2,108.2,Y+4.8,4)}
  // ================= spawns, zones, gates, devices =================
  const A=[[-4.5,Y,150,0],[-1.5,Y,150,0],[1.5,Y,150,0],[4.5,Y,150,0],[-3,Y,152.4,0],[0,Y,152.4,0],[3,Y,152.4,0],[-6,Y,152.4,0]];
  const Bs=[[-4.5,Y,96,0],[-1.5,Y,96,0],[1.5,Y,96,0],[4.5,Y,96,0],[-3,Y,98.2,0],[0,Y,98.2,0],[3,Y,98.2,0],[-6,Y,98.2,0]];
  const Cs=[[-3,0,40,0],[-1,0,40,0],[1,0,40,0],[3,0,40,0],[-2,0,42.6,0],[0,0,42.6,0],[2,0,42.6,0],[-4,0,42.6,0]];
  const Ds=[[-4.5,0,-1,0],[-1.5,0,-1,0],[1.5,0,-1,0],[4.5,0,-1,0],[-3,0,.8,0],[0,0,.8,0],[3,0,.8,0],[-6,0,.8,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-31,108,Y],[31,110,Y],[-31,124,Y],[31,124,Y],[-31,140,Y],[31,138,Y],[-16,103.2,Y],[16,103.2,Y]];
  const zB=[[-21.4,98.4,Y],[21.4,98.4,Y],[-21.4,62,Y],[21.4,64,Y],[-21,98.4,Y+6],[21,98.4,Y+6],[-12,60,Y+6],[12,60,Y+6]];
  const zC=[[-12,8,0],[12,8,0],[12.6,17.5,0],[12.6,27.5,0]],zW=[[-22,12,0],[-25,24,0],[-20,31,0],[-24,38,0]];
  const zD=[[-15,-42.4,0],[15,-42.4,0],[0,-42.4,0],[-20.4,-14,0],[20.6,-18,0],[-20.4,0,0],[20.4,0,0]];
  MAP.zspawns=[].concat(zA,zB,zC,zW,zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-34,101.2,34,158],start:A,zsp:zA},B:{box:[-24,57,24,100.6],start:Bs,zsp:zB},C:{box:[-14,6,14,45.2],start:Cs,zsp:zC},D:{box:[-22,-44,22,2],start:Ds,zsp:zD}},
    door:{A:[0,Y+1.5,100.4],B:[0,Y+1.5,57.4],C:[0,1.5,6.2],D:[0,1.5,2.4]},
    // the freight car: where it stands at each landing (the floor's centre), its half sizes; the top landing's floor box (taken away while the
    // car is down); the ward's spawns (once its doors are open)
    car:{top:[0,Y,51],bot:[0,0,51],hw:3,hd:5,topBox:top},zW,
    // stage 2: the three overrides (any order, 10 s each)
    ovr:[dv(0,Y,85.4,['안내 데스크 보안 콘솔','The reception\'s security console'],['보안 해제','override it'],10,0,-.5),
      dv(-22.4,Y+6,70,['중앙 통제실 서버','The control room\'s server'],['보안 해제','override it'],10,.8,0),
      dv(22.4,Y+6,59.6,['승강기 기계실 전원','The elevator\'s machine room'],['전원 복구','restore the power'],10,-.9,.5)],
    // stage 3: she steps out of the ward onto the nurses' station; the hold's spot, the vault door's marker
    meet:{p:[-11,1,37],yaw:-Math.PI/2,ward:[-24,0,25]},hold:{hp:[0,0,24,2.6],mk:[0,4.4,5.4]},
    // the boss fight: the four UV banks (the quadrant each lights, the switch, where it is held), the column, cover, the ammo lockers,
    // where she waits (by RT-1's table)
    uv:[{i:0,k:'NW',sec:[-22,-44,0,-21],bx:-15,bz:-42.7,sy:0},{i:1,k:'NE',sec:[0,-44,22,-21],bx:15,bz:-42.7,sy:0},
      {i:2,k:'SW',sec:[-22,-21,0,2],bx:-20.9,bz:-8,sy:0},{i:3,k:'SE',sec:[0,-21,22,2],bx:20.9,bz:-8,sy:0}],
    col:{x:0,z:-21,r:3.2},
    cover:[[-18,0,-30],[-12,0,-30],[-6,0,-30],[-15,0,-38],[-9,0,-38],[-3,0,-38],[3,0,-38],[9,0,-36],[15,0,-36],[16,0,-28],[9,0,-28],[4,0,-24],
      [-8,0,-24],[-9,0,-17],[-18,0,-16],[-13,0,-1],[-5,0,-4],[3,0,-10],[9,0,-6],[15,0,-9],[17,0,-18],[10,0,-16],[-3,0,-10],[3,0,-32]],
    perch:[[20,5,-30],[20,5,-12],[-10,5,-42],[10,5,-42]],
    ammo:[[-19,0,-2],[19,0,-2],[0,0,-40.6],[20,5,-34]],eEnter:[0,0,-11.8],
    // the escape: through the vault's service door, the corridor, the ward, its doors, the antechamber, into the car (its marker); the
    // incinerator's vents along the way ([x, z, yaw, width, length]: a strip across the way)
    exit:{x0:-2.8,x1:2.8,z0:46.4,z1:55.6},exitMk:[0,3.2,51],
    // (the first one well out in the corridor: one just past the door had a bot's place snap to the vault's side of it, and it stood there)
    escP:[[-25.8,0,-23,.6],[-26.2,0,10.5,1.4],[-12,0,25,1],[0,0,44,1.4]],
    // (none quite across: the corridor's leave 2.2 m by its east wall, the ward's 3 m, the antechamber's 4 m; none on the vault's service door)
    vents:[[-30,-11,-Math.PI/2,2.2,5.4],[-30,-1,-Math.PI/2,2.2,5.4],[-27.4,13,-Math.PI/2,2.2,10],[-27.4,29,-Math.PI/2,2.2,10],
      [-14,14,-Math.PI/2,2.4,24],[-14,29.6,-Math.PI/2,2.4,24]]};
  // the vents' grates in the floor (the fire comes up through them)
  for(const v of MAP.ez.vents){const [x,z,,w,l]=v;B(x+.2,0,z-w/2,x+l,.02,z+w/2,'plate',nz)}
  MAP.camps=[{k:'a',w:.2,p:[[0,Y,140],[-2,Y,140]],look:[0,Y+1,110]},{k:'b',w:.2,p:[[0,Y,90]],look:[0,Y+1,70]},{k:'c',w:.2,p:[[0,0,26]],look:[0,1,8]},{k:'d',w:.2,p:[[0,0,-8]],look:[0,2,-30]}];
  MAP.moon={d:E10SUN.d.clone(),c:new THREE.Color('#ffb07a'),i:.95};MAP.spawnYaw=0;
  MAP.cam=(t,cam)=>{const a=t*.025;cam.position.set(Math.sin(a)*12,Y+4.5,128+Math.cos(a)*6);cam.lookAt(0,Y+6,102)}}
// ---------- the meshes boxes cannot make: RT-1's things on the vault's table (their own models, lit by the probes) ----------
const E10M={items:[]};
function ep10Mesh(scene){E10M.items=[];const put=(k,x,y,z,ry,rx,s)=>{if(!GUNS[k])return;const m=new THREE.Mesh(gunGeo(k),matGun());m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,0);if(s)m.scale.setScalar(s);
    m.frustumCulled=false;scene.add(m);MAP.meshes.push(m);E10M.items.push(m);sampleProbe(x,y+.3,z,m.material.uniforms.uProbe.value)};
  const Y=.95;
  // 01's radio, 03's loudhailer, 04's wrench, 05's radio pack, 06's flare gun, 07's rifle — and the dog tags of all seven
  put('lgRadioP',-1.35,Y+.02,-13.6,.4,0,1.1);put('lrMega',-.62,Y+.08,-13.5,1.4,Math.PI/2,1.1);put('daWrench',.05,Y+.02,-13.4,2.2,Math.PI/2,1.3);put('lyPack',.6,Y+.02,-13.65,-.3,0,.8);
  put('chFlareGun',1.25,Y+.04,-13.4,-.9,Math.PI/2,1.3);put('r700',0,Y+.04,-14,1.57,Math.PI/2,1.1);
  for(let i=0;i<7;i++)put('elTag',-.9+i*.3,Y+.006,-13.08,i*.6,0)}
MAPDEFS.ep10={n:['격리구역 Q-7 중앙 연구소','Q-7 Central Laboratory'],d:['시즌의 첫 새벽, 모든 것이 시작된 격리구역 Q-7의 중앙 연구소. 제독 검문소 → 본관 아트리움 → 화물 승강기 → B5 격리 전실 → 원액 보관실.','The season\'s first dawn at Quarantine Zone Q-7\'s central laboratory, where it all began: the decon checkpoint, the atrium, the freight elevator, B5\'s antechamber, then the stock vault.'],
  env:{sky:1,sun:1,skyTex:'e10sky',halo:'#ffb080',fog:'#8a8496',fogD:.013,skyFog:.3,bloomThr:.82,ambOut:'#686a84',ambIn:'#24262e',boAmb:.45},bounds:[-46,-48,46,162],
  probeY:[.9,2.4,4.4,6.4,9,11.5,30.9,32.4,34.4,36.9,38.4,40.4,43],mini:[20,34],miniName:['B5','1F','2F'],
  build:buildEp10,tex:bakeEp10Tex,mesh:ep10Mesh,ep:10};

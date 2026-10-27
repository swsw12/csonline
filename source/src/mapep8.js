'use strict';
// ============ Chapter 8 map 「설령 비행장」 (Seolryeong Airfield, north of Hanseol): four zones played in order ============
// RT-1's extraction point: a small military airfield in the hills, at dusk in a blizzard. North is -z; the ground is y 0.
// A  the car park outside the wire        x -30..30   z 57..98     → the perimeter fence's sliding gate (gate gA, z 55)
// B  the landside plaza                   x -40..40   z 13..54.6   the control tower (its cab at y 6, a concrete stair up its south side),
//                                                                  the operations building (a lobby), RT-1's truck → the airside gate (gB, z 12)
// C  the airside yard and the hangars     x 4..66     z -32..11.6  hangar 1 (a light plane, a helicopter under repair, the mezzanine office
//                                                                  with the AA fire control), hangar 2 (the armory), the generator shed
//                                                                  → hangar 1's big doors (gate gC, z -32)
// D  the apron and the runway             x -56..56   z -100..-34  the helipad, three AA guns in sandbag pits, containers, carts, a de-icing
//                                                                  truck, a parked light plane, floodlight towers; the runway along z -100..-84
// CHARON (charon.js) flies RT-1's helicopter over the apron; the AA guns are the boss fight's devices.
Object.assign(MATS,{
  blk:{t:'blk',s:1,k:'metal'},olive:{t:'olive',s:.8,k:'metal'},// (v7.6: the plane's propeller, two radio sets and the ammo cans were drawn with these, never defined)
  e8apron:{t:'e8apron',s:5,cs:1,k:'stone'},e8snowF:{t:'e6snow',s:4,cs:2,k:'soft'},e8rwy:{t:'e8rwy',s:6,cs:1,k:'stone'},e8lot:{t:'e8lot',s:4,cs:1,k:'stone'},e8plaza:{t:'e8plaza',s:3,cs:1,k:'stone'},
  e8pad:{t:'e8pad',uv:'box',cs:1,k:'stone'},e8paintW:{t:'e8paintW',s:1,k:'stone'},e8paintY:{t:'e8paintY',s:1,k:'stone'},
  e8hangW:{t:'e8hangW',uv:'boxV',s:4,k:'metal'},e8hangI:{t:'e8hangI',uv:'boxV',s:4,k:'metal'},e8hdoor:{t:'e8hdoor',uv:'boxV',s:16.6,k:'metal'},
  e8roofI:{t:'e8roofI',s:4,emis:.04,k:'metal'},e8hfloor:{t:'e8hfloor',s:4,k:'stone'},e8tower:{t:'e8tower',s:3,k:'stone'},e8cab:{t:'e8cab',s:2,k:'metal'},
  e8console:{t:'e8console',uv:'box',emis:.45,k:'metal'},e8radio:{t:'e8radio',uv:'box',emis:.5,k:'metal'},e8ops:{t:'e8ops',uv:'boxV',s:6,emis:.18,k:'stone'},
  e8floorI:{t:'e8floorI',s:3,k:'stone'},e8counter:{t:'e8counter',uv:'box',emis:.06,k:'wood'},e8board:{t:'e8board',uv:'box',emis:.9,k:'metal'},
  e8crate:{t:'e8crate',uv:'box',k:'wood'},e8gen:{t:'e8gen',uv:'box',emis:.12,k:'metal'},e8panel:{t:'e8panel',uv:'box',emis:.6,k:'metal'},e8aabox:{t:'e8aabox',uv:'box',emis:.25,k:'metal'},
  e8tank:{t:'e8tank',s:4,k:'metal'},e8plane:{t:'e8plane',uv:'box',k:'metal'},e8planeW:{t:'e8planeW',s:2,k:'metal'},e8heliG:{t:'e8heliG',uv:'box',k:'metal'},e8heliP:{t:'e8heliP',s:2,k:'metal'},
  e8cart:{t:'e8cart',uv:'box',k:'metal'},e8deice:{t:'e8deice',uv:'box',k:'metal'},e8bowser:{t:'e8bowser',uv:'box',k:'metal'},e8grate:{t:'e8grate',s:1,k:'metal'},
  e8lampB:{t:'e8lampB',uv:'box',emis:1.4,k:'metal'},e8lampG:{t:'e8lampG',uv:'box',emis:1.4,k:'metal'},e8seat:{t:'e8seat',s:.8,k:'soft'},e8wsock:{t:'e8wsock',s:1,k:'soft'},
  e8sAir:{t:'e8sAir',uv:'box',emis:.7,k:'metal'},e8sOps:{t:'e8sOps',uv:'box',emis:.5,k:'metal'},e8sTower:{t:'e8sTower',uv:'box',emis:.45,k:'metal'},
  e8sH1:{t:'e8sH1',uv:'box',emis:.3,k:'metal'},e8sH2:{t:'e8sH2',uv:'box',emis:.3,k:'metal'},e8sAirside:{t:'e8sAirside',uv:'box',emis:.3,k:'metal'},
  e8sGen:{t:'e8sGen',uv:'box',emis:.35,k:'metal'},e8sAA:{t:'e8sAA',uv:'box',emis:.45,k:'metal'},e8sAmmo:{t:'e8sAmmo',uv:'box',emis:.35,k:'metal'},e8sRT:{t:'e8sRT',uv:'box',emis:.2,k:'metal'}
});
// ---------- textures (painted on first load; the snow is chapter 6's) ----------
// the apron: 5 m concrete panels, the joints sealed dark, snow blown across them in long streaks, tyre marks, an oil stain
function texE8Apron(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,40,8001,4)*.8+hash2(x,y,8002)*.15,['#5e6266','#686c70','#72767a','#7c8084','#868a8e'],.08);
  if(x<3||y<3)c='#3a3c40';const w=P.n(x+y*.6,y*.25,30,8003,3);if(w>.56)c=mix(c,'#e4eaee',clamp((w-.56)*3.2,0,.92));if(Math.abs(((x*.4+y)%86)-43)<2&&P.n(x,y,20,8004,2)>.55)c=dk(c,.18);P.set(x,y,c)}
  stain(P,170,90,26,14,.35,8005);for(let i=0;i<5;i++)crack(P,Math.floor(hash2(i,1,8006)*N),Math.floor(hash2(i,2,8006)*N),30,8007+i,'#44484c','#9aa0a4')})}
// the runway: old asphalt, snow drifting over it in waves
function texE8Rwy(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,24,8011,3)*.9,['#26282c','#2c2e32','#323438','#383a3e'],.1);
  const w=P.n(x*.5,y+x*.15,36,8012,4);if(w>.52)c=mix(c,'#dfe6ea',clamp((w-.52)*2.6,0,.95));if(hash2(x,y,8013)<.01)c='#4a4c50';P.set(x,y,c)}
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,8014)*N),Math.floor(hash2(i,2,8014)*N),46,8015+i,'#141518','#d8e0e4')})}
// the car park: asphalt under a thin snow, ruts where cars drove out
function texE8Lot(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,20,8021,3),['#2c2e32','#34363a','#3c3e42'],.1);
  const s=P.n(x,y,48,8022,4),k=clamp(.42+(s-.5)*1.3,.12,.82);c=mix(c,'#c4ccd2',k);if(Math.abs((x%128)-64)<10)c=mix(c,'#3a3e44',.28*(P.n(x,y,8,8023,2)>.35?1:.4));if(hash2(x,y,8024)<.02)c=lt(c,.08);P.set(x,y,c)}})}
function texE8Plaza(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/43),by=Math.floor(y/43),j=x%43<2||y%43<2;
  let c=dith(P,x,y,P.n(x,y,24,8031,3)*.8+hash2(bx,by,8032)*.25,['#5a5c5e','#646668','#6e7072','#78797a'],.1);if(j)c='#3e4042';const s=P.n(x,y,40,8033,4);c=mix(c,'#d4dbe0',clamp(.5+(s-.5)*1.4,.2,.88));P.set(x,y,c)}})}
// the helipad: a white ring and the H on dark concrete, the pad's number, snow blown over one side
function texE8Pad(){const N=512;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x-N/2)/(N/2),v=(y-N/2)/(N/2),r=Math.hypot(u,v);
  let c=dith(P,x,y,P.n(x,y,30,8041,3)*.7,['#3e4246','#46494d','#4e5155'],.08);if(r>.78&&r<.88)c='#e8e8e0';if(r>.66&&r<.69)c='#d8b030';
  if(Math.abs(u)<.42&&Math.abs(v)<.5&&(Math.abs(u)>.27||Math.abs(v)<.07))c='#ecece4';if(Math.max(Math.abs(u),Math.abs(v))>.97)c='#d8d8d0';
  const s=P.n(x+y*.4,y,40,8042,4)+Math.max(0,r-.6)*.9;if(s>.7)c=mix(c,'#e4eaee',clamp((s-.7)*3,0,.85));P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(232,232,224,.9)';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText('06',N/2,N*.94)}})}
function texE8PaintW(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#dcdcd4','#f0f0e8',P.n(x,y,8,8051,2));if(hash2(x,y,8052)<.08)c='#a8acae';P.set(x,y,c)}})}
function texE8PaintY(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c89a18','#e0b428',P.n(x,y,8,8061,2));if(P.n(x,y,10,8062,2)>.62)c=mix(c,'#e4eaee',.7);P.set(x,y,c)}})}
// corrugated hangar cladding (pale blue-grey ribs), rust run down from the fixings, snow thrown up along the foot
function texE8HangW(){const W=TN,H=TN;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const r=x%16;let c=r<3?'#9aa4ae':r<8?'#7e8892':r<11?'#6a747e':'#848e98';
  if(P.n(x,y,30,8071,3)>.62)c=mix(c,'#5a4a3a',.25);if(y>H*.86)c=mix(c,'#e0e6ea',clamp((y-H*.86)/(H*.1),0,.9));if(y<8)c='#4a525a';P.set(x,y,c)}
  for(let i=0;i<12;i++)streak(P,Math.floor(hash2(i,1,8072)*W),8,40+Math.floor(hash2(i,2,8072)*90),.2,2)})}
// inside: quilted insulation panels between the columns
function texE8HangI(){const W=TN,H=TN;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#8a9096','#a0a6ac',P.n(x,y,14,8081,2));if((x%64<2)||(y%48<2))c='#6a7076';
  if(x<10||x>W-11)c=x<3||x>W-4?'#2a2e32':'#3e444a';if(y>H*.9)c=mix('#3a3e42','#4a4e52',hash2(x,y,8082));P.set(x,y,c)}})}
// a hangar door leaf: horizontal ribs, a stencilled number, scuffs where the tugs hit it
function texE8HDoor(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const r=y%12;let c=r<2?'#a0a8b0':r<6?'#808a94':'#727c86';
  if(P.n(x,y,40,8091,3)>.6)c=mix(c,'#5a4a3a',.22);if(y>H*.9)c=mix(c,'#e0e6ea',.6);if(x<4||x>W-5)c='#3a4048';if(y<6)c='#3a4048';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(232,200,40,.85)';ctx.font='bold 120px sans-serif';ctx.textAlign='center';ctx.fillText('1',W/2,H*.62);ctx.fillStyle='rgba(20,20,20,.7)';ctx.font='bold 22px sans-serif';ctx.fillText('격납고 HANGAR',W/2,H*.78)}})}
function texE8RoofI(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#3a3e44','#464a50',P.n(x,y,16,8101,2));if(x%16<2)c='#2e3236';
  const d1=Math.abs(((x+y)%128)-64),d2=Math.abs(((x-y+512)%128)-64);if(d1<3||d2<3||y%128<4)c='#24282c';if(x>96&&x<160&&y>96&&y<160)c=mix(c,'#8a96a4',.4);P.set(x,y,c)}})}
// the hangar floor: grey-green epoxy, yellow safety edge, oil spots
function texE8HFloor(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,30,8111,3)*.8,['#4a5450','#525c58','#5a6460','#626c68'],.06);if(x<4||y<4)c='#3a423e';P.set(x,y,c)}
  stain(P,60,180,20,12,.3,8112);stain(P,190,60,14,9,.28,8113)})}
// the tower: painted concrete, grime under the cab, a dark plinth
function texE8Tower(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,24,8121,3)*.8+.15,['#9a9e9e','#a6aaaa','#b2b6b6','#bec2c2'],.08);if(y%86<2)c='#7a7e7e';P.set(x,y,c)}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,8122)*N),Math.floor(hash2(i,2,8122)*3)*86+2,30+Math.floor(hash2(i,3,8122)*50),.16,2)})}
function texE8Cab(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2e3a46','#3a4652',P.n(x,y,20,8131,2));if(x%64<2||y%64<2)c='#1e262e';P.set(x,y,c)}})}
// the tower's radio console: screens, a radar scope, knobs, a handset
function texE8Console(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2a2e32','#34383c',P.n(x,y,10,8141,2));if(y<6||y>H-7)c='#1a1c1e';
  if(x>16&&x<88&&y>18&&y<70)c=((x+y)%7<1)?'#0a3a1a':'#06200e';if(Math.hypot(x-128,y-44)<26)c=Math.hypot(x-128,y-44)>23?'#1a5a2a':'#04180a';if(x>170&&x<240&&y>20&&y<60)c=y%8<2?'#1a6a3a':'#0a2a14';P.set(x,y,c)}
  for(let i=0;i<14;i++){const kx=20+i*16,ky=92;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx+dy*dy<10)P.set(kx+dx,ky+dy,i%4===0?'#c83a2a':'#8a8e92')}
  for(let a=0;a<1.2;a+=.02)P.set(128+Math.round(Math.cos(a)*22),44+Math.round(Math.sin(a)*22),'#4aff8a');P.post=ctx=>{ctx.fillStyle='#7aff9a';ctx.font='bold 9px monospace';ctx.fillText('RT-1 FERRY 06',20,30);ctx.fillText('NO CONTACT',20,46)}})}
function texE8Radio(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#1e2226','#262a2e',P.n(x,y,8,8151,2));if(y%40<3)c='#0e1012';if(x>10&&x<70&&(y%40)>10&&(y%40)<24)c='#0a2a14';P.set(x,y,c)}
  for(let i=0;i<8;i++)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)P.set(90+(i%2)*14+dx,16+Math.floor(i/2)*40+dy,i%3?'#3aff6a':'#ffb030')})}
// the operations building: blue-grey panels, a band of windows (warm light still on inside)
function texE8Ops(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5662','#56626e',P.n(x,y,24,8161,2));if(x%128<2)c='#2e363e';
  const wy=y>H*.34&&y<H*.66,wx=(x%128)>12&&(x%128)<116;if(wy&&wx){const pane=Math.floor((x%128)/26)+Math.floor(x/128)*5;c=mix('#1e242c','#2a2e36',P.n(x,y,16,8162,2));c=mix(c,'#a07a52',hash2(pane,3,8163)<.55?.42:.16);if((x%128)%26<2)c='#2e363e'}
  if(y>H*.9)c=mix(c,'#e0e6ea',.7);if(y<10)c='#2a3036';P.set(x,y,c)}})}
function texE8FloorI(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,8,8171,2)*.6+hash2(x,y,8172)*.4,['#8a8682','#96928e','#a29e9a','#aeaaa6'],.2);if(x%128<2||y%128<2)c='#6a6662';P.set(x,y,c)}})}
function texE8Counter(){const W=256,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#6a4a32','#7a5a3e',P.n(x,y,12,8181,2));if(y<10)c='#d8dcdc';if(y>H-6)c='#2a2a2a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8d8a8';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('출발 수속 CHECK-IN',W/2,H*.62)}})}
// the departures board, still lit: every flight cancelled
// (v7.6) any width: a wide board is cut into panels, departures and arrivals in turn (mapFitSigns paints it again for its face)
function texE8Board(W){W=W||256;const H=128,n=Math.max(1,Math.round(W/256)),PW=W/n;const cv=paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)P.set(x,y,(x+y)%3?'#0a0a08':(x%Math.round(PW)<2&&x>2?'#2a2a24':'#121210'));
  P.post=ctx=>{for(let k=0;k<n;k++){const X=k*PW,arr=k%2===1;ctx.fillStyle='#ffb030';ctx.font='bold 12px monospace';ctx.fillText(arr?'도착 ARRIVALS':'출발 DEPARTURES',X+8,16);ctx.font='10px monospace';
    const R=arr?[['RT-1  05','설령산 레이더','결항'],['HL1805','한설','결항'],['KA 210','서울','결항'],['KA 213','부산','결항'],['RT-1  01','—','도착']]:[['RT-1  06','설령산 레이더','LAST'],['HL1806','한설','결항'],['KA 211','서울','결항'],['KA 214','부산','결항'],['RT-1  02','—','결항']];
    R.forEach((r,i)=>{ctx.fillStyle=i===0&&!arr?'#ff6a3a':'#ffb030';ctx.fillText(r[0],X+8,36+i*18);ctx.fillText(r[1],X+PW*.3,36+i*18);ctx.fillText(r[2],X+PW*.77,36+i*18)});ctx.fillStyle='#ff4a2a';ctx.fillText('ALL FLIGHTS CANCELLED',X+8,H-6)}}});
  cv._rp=w=>texE8Board(w);return cv}
function texE8Crate(){const W=128,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3e4630','#4a5238',P.n(x,y,10,8191,2));if(x<5||x>W-6||y<5||y>H-6)c='#2a3020';if(Math.abs(x-y*1.33)<3)c='#2e3424';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e0d8a0';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('35MM HE',W/2,H*.45);ctx.font='bold 9px monospace';ctx.fillText('대공 · AA',W/2,H*.62)}})}
// the generator: yellow cabinet, louvres, gauges, the airfield's ground power
function texE8Gen(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#b89018','#c8a020',P.n(x,y,12,8201,2));if(x>140&&x<240&&y>20&&y<110&&y%8<4)c='#2a2a22';if(P.n(x,y,20,8202,2)>.66)c=mix(c,'#5a4a28',.4);if(y>H-8)c='#1a1a16';P.set(x,y,c)}
  for(const [gx,gy] of [[36,40],[80,40]])for(let dy=-12;dy<=12;dy++)for(let dx=-12;dx<=12;dx++){const r=Math.hypot(dx,dy);if(r<12)P.set(gx+dx,gy+dy,r>10?'#1a1a1a':'#e8e8e0')}
  P.post=ctx=>{ctx.fillStyle='#141414';ctx.font='bold 13px sans-serif';ctx.fillText('지상 전원 GPU',14,92);ctx.strokeStyle='#c81a14';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(36,40);ctx.lineTo(42,32);ctx.moveTo(80,40);ctx.lineTo(74,31);ctx.stroke()}})}
// the AA fire control: a radar scope, a target table, armed lamps
function texE8Panel(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a4236','#444c40',P.n(x,y,10,8211,2));if(y<8)c='#1e221c';P.set(x,y,c)}
  for(let dy=-40;dy<=40;dy++)for(let dx=-40;dx<=40;dx++){const r=Math.hypot(dx,dy);if(r<40)P.set(60+dx,64+dy,r>37?'#1a4a2a':(r%13<1||Math.abs(dx)<1||Math.abs(dy)<1)?'#0e3a1a':'#041a0a')}
  for(let a=0;a<.9;a+=.01)for(let k=0;k<38;k++)P.set(60+Math.round(Math.cos(a-2)*k),64+Math.round(Math.sin(a-2)*k),'#1a6a32',.5);
  for(let i=0;i<3;i++)for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++)if(dx*dx+dy*dy<36)P.set(150+i*34+dx,96+dy,'#c82a1a');
  P.post=ctx=>{ctx.fillStyle='#e8e0b0';ctx.font='bold 11px monospace';ctx.fillText('AA FIRE CONTROL',120,28);ctx.fillText('대공포 1 · 2 · 3',120,46);ctx.fillText('ARM',150,76)}})}
function texE8AABox(){const W=128,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a4230','#465038',P.n(x,y,10,8221,2));if(x<5||y<5||x>W-6||y>H-6)c='#242a1e';if(x>30&&x<98&&y>48&&y<90)c='#1a1e16';P.set(x,y,c)}
  for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++)if(dx*dx+dy*dy<36)P.set(64+dx,104+dy,'#ffb030');P.post=ctx=>{ctx.fillStyle='#e8c820';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('장전',W/2,30);ctx.font='bold 10px sans-serif';ctx.fillText('LOAD 35MM',W/2,44)}})}
function texE8Tank(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8ccca','#d8dcd8',P.n(x,y,20,8231,2));if(y>N*.44&&y<N*.52)c='#b8241a';if(P.n(x,y,30,8232,3)>.64)c=mix(c,'#7a6a5a',.25);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#2a2a2a';ctx.font='bold 34px sans-serif';ctx.fillText('JET A-1',30,N*.36)}})}
// the light plane: white, a blue cheat line, its registration
function texE8Plane(){const W=256,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#dcdedc','#eceeec',P.n(x,y,16,8241,2));if(y>H*.46&&y<H*.58)c='#1a3a8a';if(y>H*.6&&y<H*.64)c='#c81a14';if(P.n(x,y,24,8242,3)>.66)c=mix(c,'#8a8a86',.25);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a1a1a';ctx.font='bold 18px sans-serif';ctx.fillText('HL1806',W*.55,H*.4)}})}
function texE8PlaneW(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#d8dad8','#e8eae8',P.n(x,y,12,8251,2));if(y%64<2)c='#a8aaa8';if(P.n(x,y,20,8252,2)>.58)c=mix(c,'#f4f8fa',.6);P.set(x,y,c)}})}
// the helicopter under repair in hangar 1: olive panels, the access covers off, RT-1 on its flank
function texE8HeliG(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5436','#56603e',P.n(x,y,14,8261,2));if(x%48<2||y%40<2)c='#2e3422';if(x>140&&x<200&&y>30&&y<80)c='#1a1c16';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8e8e0';ctx.font='bold 22px sans-serif';ctx.fillText('RT-1',24,70);ctx.font='bold 12px sans-serif';ctx.fillText('FERRY 05',24,90)}})}
// (v7.6) the helicopter's plain olive panels for its roof, skids, boom and fin (they wore the whole side, window and lettering squeezed)
function texE8HeliP(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#4a5436','#56603e',P.n(x,y,16,8261,2));if(x%32<2||y%64<2)c='#2e3422';P.set(x,y,c)}})}
function texE8Cart(){const W=128,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a5a7a','#466888',P.n(x,y,10,8271,2));if(y<6)c='#e0e6ea';if(y>H-8)c='#1a1e22';if(x%32<2)c='#22303e';P.set(x,y,c)}})}
function texE8Deice(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y<H*.5?mix('#d86a1a','#e8782a',P.n(x,y,12,8281,2)):mix('#d8dcdc','#e8eaea',P.n(x,y,12,8282,2));if(y>H*.86)c='#1a1a1a';if(P.n(x,y,20,8283,2)>.7)c=mix(c,'#f0f4f6',.5);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a1a1a';ctx.font='bold 18px sans-serif';ctx.fillText('DE-ICING 제빙',20,H*.74)}})}
function texE8Bowser(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#d4d8d6','#e2e6e4',P.n(x,y,12,8291,2));if(y>H*.6&&y<H*.68)c='#c81a14';if(y>H*.88)c='#1a1a1a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#c81a14';ctx.font='bold 20px sans-serif';ctx.fillText('JET A-1 FUEL',20,H*.42);ctx.fillStyle='#1a1a1a';ctx.font='bold 11px sans-serif';ctx.fillText('위험물 · FLAMMABLE',20,H*.56)}})}
function texE8Grate(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=(x%8<2||y%8<2)?'#5a5e62':'#1a1c1e';if(hash2(x,y,8301)<.05)c='#3a3e42';P.set(x,y,c)}})}
function texE8Lamp(col,rim){const N=32;return ()=>paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-N/2,y-N/2)/(N/2);P.set(x,y,r<.5?'#ffffff':r<.85?col:rim)}})}
function texE8Seat(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#2a3a5a','#34466a',P.n(x,y,8,8311,2));if(y%32<3)c='#1a2236';P.set(x,y,c)}})}
function texE8WSock(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,Math.floor(x/12.8)%2?'#f0f0ea':'#e8601a')})}
// dusk in a blizzard: slate cloud overhead, a dull orange where the sun went down behind the hills, snow driving across
function texE8Sky(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H;let c=v<.5?mix('#141a24','#2a3442',v/.5):mix('#2a3442','#4a5260',(v-.5)/.5);
  const g=Math.max(0,Math.cos((x/W)*TAU+1.1));if(v>.55)c=mix(c,'#9a6a4e',clamp((v-.55)*2.4,0,1)*Math.pow(g,1.6)*.85);const cl=P.n(x,y*2.4,50,8321,4);if(cl>.48)c=mix(c,v>.6?'#5a5e66':'#323a46',clamp((cl-.48)*1.4,0,.75));
  if(P.n(x*.3,y*3,20,8322,2)>.7)c=mix(c,'#8a929c',.25);P.set(x,y,c)}})}
function bakeEp8Tex(){if(TEX.e8apron)return;if(typeof bakeEp6Tex==='function')bakeEp6Tex();
  TEX.blk=mkTex(texMetal('#26282a'));TEX.olive=mkTex(texMetal('#4e5634'));
  TEX.e8apron=mkTex(texE8Apron());TEX.e8rwy=mkTex(texE8Rwy());TEX.e8lot=mkTex(texE8Lot());TEX.e8plaza=mkTex(texE8Plaza());TEX.e8pad=mkTex(texE8Pad(),false);
  TEX.e8paintW=mkTex(texE8PaintW());TEX.e8paintY=mkTex(texE8PaintY());TEX.e8hangW=mkTex(texE8HangW());TEX.e8hangI=mkTex(texE8HangI());TEX.e8hdoor=mkTex(texE8HDoor());
  TEX.e8roofI=mkTex(texE8RoofI());TEX.e8hfloor=mkTex(texE8HFloor());TEX.e8tower=mkTex(texE8Tower());TEX.e8cab=mkTex(texE8Cab());TEX.e8console=mkTex(texE8Console(),false);
  TEX.e8radio=mkTex(texE8Radio(),false);TEX.e8ops=mkTex(texE8Ops());TEX.e8floorI=mkTex(texE8FloorI());TEX.e8counter=mkTex(texE8Counter(),false);TEX.e8board=mkTex(texE8Board(),false);
  TEX.e8crate=mkTex(texE8Crate(),false);TEX.e8gen=mkTex(texE8Gen(),false);TEX.e8panel=mkTex(texE8Panel(),false);TEX.e8aabox=mkTex(texE8AABox(),false);TEX.e8tank=mkTex(texE8Tank());
  TEX.e8plane=mkTex(texE8Plane(),false);TEX.e8planeW=mkTex(texE8PlaneW());TEX.e8heliG=mkTex(texE8HeliG(),false);TEX.e8heliP=mkTex(texE8HeliP());TEX.e8cart=mkTex(texE8Cart(),false);TEX.e8deice=mkTex(texE8Deice(),false);
  TEX.e8bowser=mkTex(texE8Bowser(),false);TEX.e8grate=mkTex(texE8Grate());TEX.e8lampB=mkTex(texE8Lamp('#4a8aff','#1a2a6a')(),false);TEX.e8lampG=mkTex(texE8Lamp('#4aff7a','#1a5a2a')(),false);
  TEX.e8seat=mkTex(texE8Seat());TEX.e8wsock=mkTex(texE8WSock());TEX.e8sky=mkTex(texE8Sky(),false);
  TEX.e8sAir=mkTex(texSign([{t:'설령 비행장'},{t:'SEOLRYEONG AIRFIELD',s:10}],'#1a2a4a','#f0f0e8',288,48),false);
  TEX.e8sOps=mkTex(texSign([{t:'운항동'},{t:'OPERATIONS',s:10}],'#1a2a4a','#f0f0e8',160,40),false);
  TEX.e8sTower=mkTex(texSign([{t:'관제탑'},{t:'CONTROL TOWER',s:9}],'#1a2a4a','#f0f0e8',160,40),false);
  TEX.e8sH1=mkTex(texSign([{t:'격납고 1'},{t:'HANGAR 1',s:10}],'#141414','#e8c820',160,40),false);
  TEX.e8sH2=mkTex(texSign([{t:'격납고 2 · 무기고'},{t:'HANGAR 2 · ARMORY',s:9}],'#141414','#e8c820',200,40),false);
  TEX.e8sAirside=mkTex(texSign([{t:'보안 구역 · 관계자 외 출입 금지'},{t:'AIRSIDE · AUTHORIZED PERSONNEL ONLY',s:8}],'#b81c14','#ffffff',260,40),false);
  TEX.e8sGen=mkTex(texSign([{t:'지상 전원'},{t:'GROUND POWER',s:9}],'#141414','#e8c820',160,36),false);
  TEX.e8sAA=mkTex(texSign([{t:'대공 관제반'},{t:'AA FIRE CONTROL',s:9}],'#2a3a24','#e8e0b0',180,36),false);
  TEX.e8sAmmo=mkTex(texSign([{t:'탄약고 · 화기 엄금'},{t:'AMMUNITION · NO NAKED FLAME',s:8}],'#b81c14','#ffffff',220,36),false);
  TEX.e8sRT=mkTex(texSign([{t:'RT-1 집결지'},{t:'RT-1 RALLY POINT',s:9}],'#3a4230','#e8e8e0',180,36),false)}
// ---------- geometry helpers ----------
const E8NZ={nosolid:true};
// a lamp post (sodium) with its baked light
function e8lamp(x,z,h){h=h||6.4;B(x-.1,0,z-.1,x+.1,h,z+.1,'metal2');B(x-.12,h-.1,z-.7,x+.12,h,z+.1,'metal2',E8NZ);B(x-.22,h-.32,z-.9,x+.22,h-.1,z-.5,'lampO',E8NZ);LIGHT(x,h-.6,z-.7,'#ffb070',14,.9,{lamp:1})}
// a floodlight tower over the apron
function e8flood(x,z){B(x-.25,0,z-.25,x+.25,14,z+.25,'metal2');B(x-1.4,13.4,z-.3,x+1.4,14,z+.3,'metal2',E8NZ);for(const k of [-1,-.33,.33,1])B(x+k*1.05-.3,13,z-.36,x+k*1.05+.3,13.5,z+.36,'lampW',E8NZ);LIGHT(x,13,z,'#e4ecff',34,1.05)}
// sandbag walls round an AA gun's pit (square, open on one side: 's' / 'n' / 'e' / 'w'), its concrete plinth and the loader box
function e8pit(cx,cz,open,bx,bz){const r=2.9,h=1.15;const side=(k,x0,z0,ax,len)=>{if(open===k){const m=len/2-1.1;if(m>.2){e6sand(x0,z0,ax,m,h);e6sand(ax==='x'?x0+len-m:x0,ax==='x'?z0:z0+len-m,ax,m,h)}}else e6sand(x0,z0,ax,len,h)};
  side('n',cx-r,cz-r,'x',2*r);side('s',cx-r,cz+r,'x',2*r);side('w',cx-r,cz-r+.35,'z',2*r-.7);side('e',cx+r,cz-r+.35,'z',2*r-.7);
  B(cx-.85,0,cz-.85,cx+.85,.5,cz+.85,'conc');B(bx-.3,0,bz-.3,bx+.3,1.1,bz+.3,'e8aabox')}
// a baggage cart (along x)
function e8cart(x,z){B(x-1.5,.4,z-.75,x+1.5,.6,z+.75,'e8cart');B(x-1.5,.6,z-.75,x-1.38,1.5,z+.75,'e8cart',E8NZ);B(x+1.38,.6,z-.75,x+1.5,1.5,z+.75,'e8cart',E8NZ);
  B(x-1.3,.6,z-.62,x+.9,1.15,z+.62,'bag');B(x-1.3,1.15,z-.6,x+.9,1.22,z+.6,'e6snowC',E8NZ);for(const [dx,dz] of [[-1.1,-.6],[1.1,-.6],[-1.1,.48],[1.1,.48]])B(x+dx-.18,0,z+dz-.06,x+dx+.18,.4,z+dz+.18,'tire')}
// a container (6 × 2.44 × 2.6) along the axis, its low corner at x0,z0, at y
function e8cont(x0,z0,ax,mat,y){y=y||0;if(ax==='x')B(x0,y,z0,x0+6,y+2.6,z0+2.44,mat);else B(x0,y,z0,x0+2.44,y+2.6,z0+6,mat);
  if(ax==='x')B(x0+.1,y+2.6,z0+.1,x0+5.9,y+2.7,z0+2.34,'e6snowC',E8NZ);else B(x0+.1,y+2.6,z0+.1,x0+2.34,y+2.7,z0+5.9,'e6snowC',E8NZ)}
// a light high-wing plane (along x, its nose at the low end), on its wheels
function e8plane(x0,z){B(x0,.9,z-.7,x0+7.4,2.2,z+.7,'e8plane');B(x0+7.4,1.3,z-.4,x0+9.2,2,z+.4,'e8plane');B(x0-.4,1.1,z-.5,x0,2,z+.5,'e8plane');
  B(x0-.6,1.3,z-.08,x0-.4,1.9,z+.08,'metal2',E8NZ);B(x0-.62,.7,z-.06,x0-.58,2.5,z+.06,'blk',E8NZ);
  B(x0+1.8,2.2,z-5.6,x0+3.4,2.36,z+5.6,'e8planeW');B(x0+1.9,2.36,z-5.4,x0+3.3,2.44,z+5.4,'e6snowC',E8NZ);
  B(x0+8.6,2,z-.06,x0+9.6,3.4,z+.06,'e8planeW');B(x0+8.4,1.9,z-1.8,x0+9.4,2.02,z+1.8,'e8planeW');
  for(const [dx,dz] of [[1,0],[3.2,-1.3],[3.2,1.3]])B(x0+dx-.2,0,z+dz-.12,x0+dx+.2,.5,z+dz+.12,'tire');B(x0+3.1,.5,z-1.3,x0+3.3,1,z+1.3,'metal2',E8NZ);
  B(x0+.6,1.6,z-.72,x0+1.8,2.1,z+.72,'carGl',E8NZ)}
// a snow berm (ploughed), h tall
function e8berm(x0,z0,x1,z1,h){B(x0,0,z0,x1,h,z1,'e6snowG')}
function buildEp8(){
  const nz=E8NZ,PI=Math.PI;
  // ================= the ground =================
  // the car park (A), the plaza (B), the yard (C) and the apron and runway (D); fresh snow everywhere else
  slab(-62,98,72,106,-1,0,'e8snowF',[[-6,98,6,106]],{ground:1});B(-6,-1,98,6,0,106,'e8lot',{ground:1});
  slab(-62,55,72,98,-1,0,'e8snowF',[[-30,57,30,98]],{ground:1});B(-30,-1,57,30,0,98,'e8lot',{ground:1});
  slab(-62,12,72,55,-1,0,'e8snowF',[[-40,13,40,54.6]],{ground:1});B(-40,-1,13,40,0,54.6,'e8plaza',{ground:1});
  slab(-62,-32,72,12,-1,0,'e8snowF',[[4,-6,66,11.6],[6,-32,40,-6],[44,-30,62,-10]],{ground:1});B(4,-1,-6,66,0,11.6,'e8lot',{ground:1});
  B(6,-1,-32,40,0,-6,'e8hfloor',{ground:1});B(44,-1,-30,62,0,-10,'e8hfloor',{ground:1});
  slab(-62,-84,72,-32,-1,0,'e8apron',[[-9,-71,9,-53]],{ground:1});B(-9,-1,-71,9,0,-53,'e8pad',{ground:1});
  B(-62,-1,-106,72,0,-84,'e8rwy',{ground:1});
  // ================= zone A: the car park outside the wire =================
  // snow berms round the lot (the road out to the south blocked by the army's barriers and a burnt car)
  e8berm(-34,57,-30,98,2);e8berm(30,57,34,98,2);e8berm(-34,98,-6,101,2);e8berm(6,98,34,101,2);
  for(const x of [-4.6,-1.6,1.4,4.4])e6jb(x,100.4,'x');e6car(0,103,'x','carBurnt',1);
  // three rows of cars, the shuttle bus, the plough truck that never got the lot cleared
  for(const [x,z,m,b] of [[-24,66,'car'],[-18,66,'carR'],[-12,66.4,'carBurnt',1],[12,66,'car'],[18,65.8,'car'],[24,66,'carR'],[-24,76.2,'carR'],[-12,76,'car'],[13,76,'carBurnt',1],[24,76.4,'car'],
    [-24,86,'car'],[-18,86.2,'carBurnt',1],[19,86,'car']])e6car(x,z,'z',m,b);
  e6bus(12,90,'x');e6truck(-29.6,58.6,'z');e6car(-6,71,'x','carR');
  // the guard post by the gate, the barrier arm raised, the airfield's sign over the gate, lamps
  e6gbooth(9.6,58.6);B(7.6,0,57.4,7.8,3.4,57.6,'hazard');B(-7,3.1,54.9,7,4.5,55.1,'e8sAir',nz);for(const x of [-7.2,7]){B(x,0,54.85,x+.2,4.6,55.15,'metal2')}
  for(const [x,z] of [[-14,71],[14,71],[-14,81],[14,81],[0,62],[0,92]])e8lamp(x,z);
  // ================= the perimeter fence (z 55) and its gate (gA: two chain-link leaves sliding apart) =================
  fenceX(-62,-6.2,55,2.8);fenceX(6.2,72,55,2.8);B(-62,2.8,54.98,-6.2,3.05,55.02,'metal2',nz);B(6.2,2.8,54.98,72,3.05,55.02,'metal2',nz);
  B(-6,0,54.94,0,2.8,55.06,'fence',{gate:'gA',gs:[-6,0,0],pass:1});B(0,0,54.94,6,2.8,55.06,'fence',{gate:'gA',gs:[6,0,0],pass:1});
  B(-6,2.7,54.9,0,2.85,55.1,'metal2',{gate:'gA',gs:[-6,0,0]});B(0,2.7,54.9,6,2.85,55.1,'metal2',{gate:'gA',gs:[6,0,0]});
  // ================= zone B: the landside plaza =================
  e8berm(-44,13,-40,54.6,2);e8berm(40,13,44,54.6,2);
  // the control tower: a concrete shaft to the cab (y 6), the cab's sill all round, glazing gone (an invisible rail keeps you in),
  // corner and mid posts, the header and roof, the beacon on top; a concrete stair up its south side from the plaza
  B(-26,0,16,-18,6,24,'e8tower');B(-17.98,2.4,18,-17.94,3.4,22,'e8sTower',nz);
  // (the sill 0.2 thick: a nav cell's centre 0.5 in from the wall keeps its node)
  wallX(-26,-18,16,16.2,6,7,'e8cab');wallX(-26,-18,23.8,24,6,7,'e8cab',[[-25.6,-23.8,6,8.6]]);wallZ(-26,-25.8,16.2,23.8,6,7,'e8cab');wallZ(-18.2,-18,16.2,23.8,6,7,'e8cab');
  for(const [x,z] of [[-26,16],[-18.2,16],[-26,23.8],[-18.2,23.8],[-22.1,16],[-22.1,23.8],[-26,19.9],[-18.2,19.9]])B(x,7,z,x+.2,8.6,z+.2,'e8cab');
  for(const [x0,z0,x1,z1] of [[-26,16,-18,16.2],[-26,23.8,-25.6,24],[-23.8,23.8,-18,24],[-26,16.2,-25.8,23.8],[-18.2,16.2,-18,23.8]])B(x0,7,z0,x1,8.6,z1,'none',{pass:1});
  B(-26,8.6,16,-18,9,24,'e8cab',{f:{ny:'e8roofI'}});B(-26.4,9,15.6,-17.6,9.3,24.4,'e8tower');B(-26.3,9.3,15.7,-17.7,9.4,24.3,'e6snowC',nz);
  B(-22.4,9.3,19.6,-21.6,9.8,20.4,'metal2');B(-22.25,9.8,19.75,-21.75,10.2,20.25,'e8lampG',nz);
  // the cab's furniture: the radio console along the north sill, the rack in the corner, two chairs, a map table
  B(-25.6,6,16.25,-19.6,6.95,17.1,'e8console');B(-19.4,6,16.3,-18.3,8.2,17.5,'e8radio');B(-23.4,6,18.4,-22.8,6.5,19,'blk');B(-21,6,18.4,-20.4,6.5,19,'blk');B(-21.4,6,20.4,-19.8,6.85,21.6,'e8cab',{f:{py:'e8grate'}});
  LIGHT(-22,8.4,20,'#cfe8d8',7,.7);
  // the stair: 17 steps from the plaza (x -8) to the landing (x -26..-22) at the cab door; parapets on both sides
  stairs('x',24.2,25.8,-8,-22,0,6,17,'e8tower');B(-26,0,24,-22,6,26.2,'e8tower');
  {const n=17,da=-14/n,dy=6/n;for(let i=0;i<n;i++){const s0=-8+da*i,s1=-8+da*(i+1),top=dy*(i+1);B(s1,0,25.8,s0,top+1,26,'e8tower');if(s0>-18.01)B(s1,0,24,s0,top+1,24.2,'e8tower')}}
  B(-26.2,6,24,-26,7,26.2,'e8tower');B(-26,6,26.2,-22,7,26.4,'e8tower');
  // RT-1's last stand at the foot of the stair: sandbags, their truck, ammo cans; the rally sign
  e6sand(-7,27.4,'x',4.6);e6sand(-2.4,27.4,'z',4);e6sand(-7,21.4,'x',3.6);e6truck(-14,30,'x');B(-6.6,.2,27.76,-3.6,1.1,27.8,'e8sRT',nz);
  for(const [x,z] of [[-5,29.2],[-4.4,29.6],[-3.6,24.2]])B(x-.25,0,z-.15,x+.25,.3,z+.15,'olive');
  // the operations building: a lobby behind glass, the check-in counter, rows of seats, the departures board, columns; its airside doors chained
  B(4,-.02,22,34,0,38,'e8floorI',{ground:1});wallX(4,34,37.6,38,0,5,'e8ops',[[16,22,0,3]],{f:{nz:'plaster'}});wallX(4,34,22,22.4,0,5,'e8ops',null,{f:{pz:'plaster'}});
  wallZ(4,4.4,22.4,37.6,0,5,'e8ops',[[27,30,0,2.8]],{f:{px:'plaster'}});wallZ(33.6,34,22.4,37.6,0,5,'e8ops',null,{f:{nx:'plaster'}});
  B(3.6,5,21.6,34.4,5.4,38.4,'roof',{f:{ny:'e8roofI'}});B(3.7,5.4,21.7,34.3,5.5,38.3,'e6snowC',nz);B(15,3.4,38,23,4.4,38.1,'e8sOps',nz);
  B(8,0,28,24,1.15,29.2,'e8counter');B(30,0,22.4,32.6,2.2,22.6,'e8hdoor');B(12,2.2,22.42,24,3.6,22.5,'e8board',nz);
  for(const z of [32.4,34.8])for(const [x0,x1] of [[6,14],[18,28]])B(x0,0,z,x1,.9,z+.7,'e8seat');for(const x of [14.4,25.6])B(x-.3,0,30.6,x+.3,5,31.2,'e8tower');
  for(const [x,z] of [[10,26],[22,26],[10,34],[26,34]])LIGHT(x,4.6,z,'#ffe6c8',10,.75);
  // the plaza: the flagpole, benches, a van, snow piles, lamps
  B(-2.1,0,44,-1.9,9,44.2,'metal2');B(-1.9,7.4,44.05,-.4,8.4,44.15,'e8planeW',nz);for(const [x,z,ax] of [[-14,46,'x'],[18,44,'x'],[30,30,'z']])e6jb(x,z,ax);
  e6car(26,46,'x','car');e6car(-30,40,'z','carR');for(const [x0,z0,x1,z1,h] of [[-38,13,-32,22,1.4],[30,13,40,18,1.2],[-38,46,-30,54.6,1.3]])e8berm(x0,z0,x1,z1,h);
  for(const [x,z] of [[-30,30],[-12,40],[2,30],[24,48],[-28,50],[36,24]])e8lamp(x,z);
  // ================= the inner (airside) fence (z 12) and its gate gB =================
  fenceX(-62,5.8,12,2.8);fenceX(14.2,72,12,2.8);B(-62,2.8,11.98,5.8,3.05,12.02,'metal2',nz);B(14.2,2.8,11.98,72,3.05,12.02,'metal2',nz);B(-16,1.4,12.03,-8,2.4,12.08,'e8sAirside',nz);
  B(6,0,11.94,10,2.8,12.06,'fence',{gate:'gB',gs:[-4,0,0],pass:1});B(10,0,11.94,14,2.8,12.06,'fence',{gate:'gB',gs:[4,0,0],pass:1});
  B(6,2.7,11.9,10,2.85,12.1,'metal2',{gate:'gB',gs:[-4,0,0]});B(10,2.7,11.9,14,2.85,12.1,'metal2',{gate:'gB',gs:[4,0,0]});
  // ================= zone C: the airside yard and the hangars =================
  // hangar 1 (x 6..40, z -32..-6, 11 m): corrugated cladding, doors in its south wall to the yard, the big doors north (gate gC)
  wallZ(6,6.4,-32,-6,0,11,'e8hangW',null,{f:{px:'e8hangI'}});wallZ(39.6,40,-32,-6,0,11,'e8hangW',[[-17,-14,0,3]],{f:{nx:'e8hangI'}});
  wallX(6,40,-6.4,-6,0,11,'e8hangW',[[10,12.6,0,3],[28,30.4,0,3]],{f:{nz:'e8hangI'}});B(6,9.6,-32.2,40,11,-31.6,'e8hangW',{f:{pz:'e8hangI'}});
  B(6.4,0,-32,23,9.6,-31.6,'e8hdoor',{gate:'gC',gs:[-16.4,0,0]});B(23,0,-32,39.6,9.6,-31.6,'e8hdoor',{gate:'gC',gs:[16.4,0,0]});
  B(5.6,11,-32.4,40.4,11.6,-5.6,'roof',{f:{ny:'e8roofI'}});B(5.6,11.6,-24,40.4,12.2,-14,'roof');B(5.7,11.6,-32.3,40.3,11.7,-24,'e6snowC',nz);B(5.7,12.2,-24,40.3,12.3,-14,'e6snowC',nz);B(5.7,11.6,-14,40.3,11.7,-5.7,'e6snowC',nz);
  B(14,8.4,-6,22,9.4,-5.9,'e8sH1',nz);for(const [x,z] of [[13,-26],[23,-26],[33,-26],[13,-14],[23,-14],[33,-14]])LIGHT(x,10.2,z,'#e0eaff',15,.85);
  // inside: the light plane, the helicopter under repair (no rotors), tool carts, drums, parts racks, the mezzanine office (y 4)
  e8plane(10,-21.4);
  B(27.6,1.2,-27,30.6,3.4,-18,'e8heliG',{f:{py:'e8heliP'}});B(27.8,.7,-25.6,30.4,1.2,-19.4,'e8heliP');B(28.7,2,-18,29.5,2.8,-12.6,'e8heliP');B(28.9,2.8,-13.4,29.3,4.2,-12.6,'e8heliP');
  B(27.6,1.3,-27.6,30.6,3,-27,'carGl',nz);for(const [x,z] of [[27.4,-26],[30.8,-26],[27.4,-19],[30.8,-19]])B(x-.25,0,z-.25,x+.25,1.2,z+.25,'hazard');B(28.6,3.4,-23,29.6,3.9,-21,'metal2');
  for(const [x,z] of [[34,-28],[34.6,-27.4],[36.8,-29.2],[18,-10.4],[18.6,-9.8]])drum(x,z);for(const z of [-28,-24,-20])B(38.2,0,z,39.6,2.6,z+3,'metal');for(const z of [-26.5,-22.5,-18.5])B(38.3,1.3,z,39.5,1.36,z+.6,'e8crate',nz);
  B(16,0,-12,18.4,.95,-10.8,'metal2',{f:{py:'e8grate'}});B(12,0,-28,13.6,1.1,-26.6,'metal2');
  B(24,3.7,-11,39.6,4,-6.4,'e8grate',{f:{ny:'e8roofI'}});for(const x of [24.2,31.8])B(x,0,-11,x+.25,3.7,-10.75,'metal2');
  stairs('z',24.2,25.8,-19,-11,0,4,10,'plate');B(25.8,4,-11.1,39.6,5,-11,'none',{pass:1});B(25.8,4.95,-11.12,39.6,5.02,-10.98,'metal2',nz);for(let x=26;x<=39.5;x+=1.9)B(x-.03,4,-11.08,x+.03,4.95,-11.02,'metal2',nz);
  B(24,4,-11,24.2,5,-6.4,'none',{pass:1});
  B(35.6,4,-7.4,38.8,5.25,-6.4,'e8panel');B(34.6,5.6,-6.42,38.8,6.6,-6.38,'e8sAA',nz);B(27,4,-8,29.4,4.85,-6.8,'wood');LIGHT(36,6.4,-8.6,'#d8f0d8',8,.75);
  // hangar 2, the armory (x 44..62, z -30..-10, 8 m): crates of AA shells, racks, the loader for the guns
  wallZ(44,44.4,-30,-10,0,8,'e8hangW',[[-18,-15,0,3]],{f:{px:'e8hangI'}});wallZ(61.6,62,-30,-10,0,8,'e8hangW',null,{f:{nx:'e8hangI'}});
  wallX(44,62,-10.4,-10,0,8,'e8hangW',[[51,54,0,3]],{f:{nz:'e8hangI'}});wallX(44,62,-30,-29.6,0,8,'e8hangW',null,{f:{pz:'e8hangI'}});
  B(43.6,8,-30.4,62.4,8.5,-9.6,'roof',{f:{ny:'e8roofI'}});B(43.7,8.5,-30.3,62.3,8.6,-9.7,'e6snowC',nz);B(49,5.4,-10,56,6.4,-9.9,'e8sH2',nz);B(46,2.2,-10.42,52,3,-10.38,'e8sAmmo',nz);
  // (stacked flush against the walls: a gap behind a stack too narrow for a nav node would let the bots' nearest node be the far side of the wall)
  for(const [x,z,n] of [[45.2,-29.05,3],[47,-29.05,2],[48.8,-29.05,3],[45.2,-25.6,2],[59.2,-14,2],[60.8,-14,3],[60.8,-16.2,1],[46.6,-13,2]])for(let k=0;k<n;k++)B(x-.8,k*.66,z-.55,x+.8,k*.66+.66,z+.55,'e8crate');
  for(const z of [-27,-23])B(60,0,z,61.6,2.6,z+3,'metal');B(55,0,-23.2,58,1.3,-21.2,'metal2');for(const [x,z] of [[55.6,-22.6],[56.6,-22.6],[57.6,-22.6]])B(x-.3,1.3,z-.3,x+.3,1.7,z+.3,'e8crate',nz);
  for(const [x,z] of [[48,-20],[56,-14],[56,-26]])LIGHT(x,7.4,z,'#e0eaff',12,.8);
  // the yard: the generator shed (open to the west), the fuel farm, a forklift, pallets, drums, snow piles, yard lights
  B(46,0,0,54,.2,6,'conc');B(46,3.4,0,54,3.7,6,'roof');B(46.1,3.7,.1,53.9,3.8,5.9,'e6snowC',nz);wallX(46,54,0,.2,0,3.4,'metal');wallX(46,54,5.8,6,0,3.4,'metal');wallZ(53.8,54,0,6,0,3.4,'metal');
  B(48,0,1.4,52,2.2,4.6,'e8gen');B(46.2,2.4,1,46.25,3.2,5,'e8sGen',nz);LIGHT(49,3,3,'#ffe0a8',8,.7);
  for(const [x,z] of [[60,4.6],[60,-2.4]]){MAP.deco.push({k:'drum',x,y:0,z,r:2.3,h:4.2,mat:'e8tank',rot:0});B(x-1.62,0,z-1.62,x+1.62,4.2,z+1.62,'metalx');B(x-1.5,4.2,z-1.5,x+1.5,4.3,z+1.5,'e6snowC',nz)}
  B(34,0,1,37,1.3,3,'paintY');B(34,1.3,1.2,35.2,2.6,2.8,'paintY');B(37,0,1.4,38.6,.15,2.6,'metal2');for(const [x,z] of [[30,4],[30,6],[41,-2]])e7pallet(x,z);
  for(const [x,z] of [[42,6],[42.6,6.6],[64,8]])drum(x,z);for(const [x0,z0,x1,z1,h] of [[4,8,8,11.6,1.2],[62,7,66,11.6,1.4],[4,-6,6,0,1.1]])e8berm(x0,z0,x1,z1,h);
  for(const [x,z] of [[16,4],[30,9],[44,2],[60,10]])e8lamp(x,z,5.6);
  // the gap between the hangars, fenced off from the apron; the yard's east end
  fenceX(40,44,-30,2.8);fenceZ(-30,11.6,66,2.8);
  // (and the yard's west side: the snow field west of hangar 1 is in no zone)
  fenceZ(-6,11.9,4,2.8);fenceX(4,6,-6,2.8);
  // ================= zone D: the apron and the runway =================
  // its fences (west of hangar 1, east of hangar 2), berms round the edge, the runway's far side
  fenceX(-62,6,-32.4,2.8);B(-62,2.8,-32.42,6,3.05,-32.38,'metal2',nz);fenceX(62,72,-30,2.8);e8berm(-62,-104,-56,-33,2);e8berm(56,-104,62,-30,2);e8berm(-62,-106,72,-102,2);e8berm(62,-34,72,-30,2);
  // the helipad's lights; taxi lines from the hangar to the pad; the runway's centre line, edge lights
  for(let k=0;k<12;k++){const a=k/12*TAU,x=Math.cos(a)*9.6,z=-62+Math.sin(a)*9.6;B(x-.12,0,z-.12,x+.12,.16,z+.12,'e8lampG',nz)}
  for(let z=-36;z>-52;z-=3)B(22.8,0,z-1.6,23.2,.012,z,'e8paintY',nz);for(let x=22.8;x>9;x-=3)B(x-1.6,0,-53.2,x,.012,-52.8,'e8paintY',nz);
  for(let x=-60;x<70;x+=8)B(x,0,-94.25,x+4,.012,-93.75,'e8paintW',nz);B(-62,0,-101.2,72,.012,-101,'e8paintW',nz);B(-62,0,-87,72,.012,-86.8,'e8paintW',nz);
  for(let x=-56;x<=56;x+=8){B(x-.12,0,-86.6,x+.12,.2,-86.36,'e8lampB',nz);B(x-.12,0,-101.7,x+.12,.2,-101.46,'e8lampB',nz)}
  // berms along the runway's edge (gaps to get through), the three AA guns' pits
  // (short of the big berms at the sides: a step up onto them would be a way out)
  for(const [x0,x1] of [[-53,-40],[-30,-12],[12,30],[40,53]])e8berm(x0,-84,x1,-83,1.2);
  e8pit(-36,-52,'s',-34.4,-50.4);e8pit(36,-52,'s',37.6,-50.4);e8pit(0,-88,'s',1.6,-86.4);
  // cover: containers, baggage carts, a de-icing truck, a fuel bowser, a tug, sandbag walls, the parked light plane
  e8cont(-29,-46,'x','contB');e8cont(-29,-46,'x','contR',2.7);e8cont(20,-80,'z','contG');e8cont(-48,-58,'z','contR');
  for(const x of [-15,-11.6,-8.2])e8cart(x,-76);for(const x of [11,14.4])e8cart(x,-44.6);
  B(26,0,-64.4,33,1.2,-61.8,'e8deice');B(30.4,1.2,-64.2,33,3,-62,'e8deice');B(26,1.2,-64.3,30.2,2.6,-61.9,'metal2');B(26.6,2.6,-63.6,28,4.8,-62.6,'metal2',nz);
  B(40,0,-74,42.6,1,-66,'metal2');B(40.1,1,-73.8,42.5,3,-68.4,'e8bowser');B(40.1,1,-68.2,42.5,2.8,-66.2,'e8bowser');B(40.2,3,-73.6,42.4,3.1,-68.6,'e6snowC',nz);
  B(-31.4,0,-73,-28.6,1.3,-71,'paintY');B(-31.2,1.3,-72.8,-30,2.1,-71.2,'carGl');
  e6sand(-8,-46,'x',4);e6sand(6,-80.4,'x',4);e6sand(-44,-80,'x',5);e6sand(44,-60,'z',4);e6sand(-20,-52,'z',3.4);e6sand(18,-56,'x',3.2);
  e8plane(-48,-66);
  for(const [x,z] of [[-52,-38],[52,-38],[-52,-96],[52,-96]])e8flood(x,z);
  // ================= the edges: invisible walls round the four zones (on the berms' and fences' far sides, see-through for shots),
  // so no step onto a berm, a pile or a fence top leads out into the snow fields or into a zone not open yet; the gates' openings stay
  {const W=(x0,z0,x1,z1)=>B(x0,0,z0,x1,9,z1,'none',{pass:1});
    W(-34.2,55,-34,101.2);W(34,55,34.2,101.2);W(-34.2,101,34.2,101.2);
    W(-44.2,54.8,-6.2,55);W(6.2,54.8,44.2,55);W(-44.2,12,-44,55);W(44,12,44.2,55);
    W(-44.2,11.8,5.8,12);W(14.2,11.8,66.2,12);W(3.8,-6,4,12);W(66,-30,66.2,12)}
  // ================= spawns, zones, gates, devices =================
  const A=[[-4.5,0,92,0],[-1.5,0,92,0],[1.5,0,92,0],[4.5,0,92,0],[-3,0,94,0],[0,0,94,0],[3,0,94,0],[-6,0,94,0]];
  const Bs=[[-4.5,0,51.6,0],[-1.5,0,51.6,0],[1.5,0,51.6,0],[4.5,0,51.6,0],[-3,0,53.2,0],[0,0,53.2,0],[3,0,53.2,0],[-6,0,53.2,0]];
  const Cs=[[8.2,0,9,0],[10,0,9,0],[11.8,0,9,0],[8.2,0,7.2,0],[10,0,7.2,0],[11.8,0,7.2,0],[9.1,0,5.4,0],[10.9,0,5.4,0]];
  const Ds=[[16,0,-36.2,0],[19,0,-36.2,0],[22,0,-36.2,0],[25,0,-36.2,0],[28,0,-36.2,0],[17.5,0,-37.8,0],[23.5,0,-37.8,0],[29.5,0,-37.8,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  // (the car park's: round its edges — none among the cars by the team's start, where a rager behind a car is on you before it is seen)
  const zA=[[-25.5,59],[27,60],[0,58.4],[-12,58],[12,58],[-28,76],[28,76],[-27,94],[27,94]];
  const zB=[[-37,16],[-37,52],[37,16],[37,52],[-10,14],[24,14],[36,40],[-34,36],[20,52],[28,30.6]];
  const zC=[[64,-4],[64,8],[42,10],[58,-20],[48,-26],[8,-28],[36,-20],[50,-6],[20,-8],[10,10]];
  const zD=[[-54,-40],[54,-40],[-54,-70],[54,-70],[-50,-98],[50,-98],[-20,-100],[20,-100],[0,-99],[-40,-90],[40,-90]];
  MAP.zspawns=[].concat(zA,zB,zC,zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-30,57,30,98],start:A,zsp:zA},B:{box:[-40,13,40,54.6],start:Bs,zsp:zB},C:{box:[4,-32,66,11.6],start:Cs,zsp:zC},D:{box:[-56,-100,56,-32.6],start:Ds,zsp:zD}},
    door:{A:[0,1.5,55.6],B:[10,1.5,12.6],C:[23,1.5,-32.6]},
    // stage 2: hold the tower's cab (the hold point, the cab's floor box, its window band) while the radio pulls RT-1's flight log
    tower:{x:-22,y:6,z:20,box:[-25.75,16.25,-18.25,23.75],win:[7,8.6],stair:[-8,25,-22,25]},
    // stage 3: the three things the AA guns need (9 s each, any order)
    aaDev:[dv(47.4,0,3,['지상 전원 · 발전기 창고','Ground power · the generator shed'],['발전기 돌리기','start the generator'],9,-.4,0),
      dv(56.6,0,-21.4,['대공 탄약 · 무기고','AA shells · the armory'],['탄약 싣기','load the shells'],9,0,.6),
      dv(37.2,4,-8.2,['대공 관제반 · 격납고 2층','AA fire control · the hangar office'],['관제반 켜기','switch it on'],9,0,-.4)],
    // the boss fight: the AA guns (each one's loader box: bx bz), the helipad, where the helicopter may come down in a crash, the box it
    // flies in, where it comes in from; cover on the apron
    aa:[{i:0,x:-36,z:-52,bx:-34.4,bz:-50.4},{i:1,x:36,z:-52,bx:37.6,bz:-50.4},{i:2,x:0,z:-88,bx:1.6,bz:-86.4}],
    pad:[0,0,-62],crash:[[-18,0,-62],[18,0,-64],[0,0,-74]],fly:{x0:-48,x1:48,z0:-98,z1:-40},orbit:[0,-64],enter:[0,24,-102],
    // the first meeting (stage 2): round the tower's cab at the height of its windows; in from the west, away north
    meet:{c:[-22,20],r:22,alt:7.4,from:[-60,14,-20],out:[-30,22,-60]},
    // where the Frozen lie buried in each zone (out in the snow, clear of the cars and the cover)
    drifts:{A:[[-26,0,71],[5,0,71.5],[26,0,71],[-18,0,81],[-4,0,81],[8,0,81.5],[26,0,81],[-24,0,91.5],[24,0,94.5],[-20,0,61],[10,0,61],[24,0,60.5]],
      B:[[-34,0,30],[-14,0,38],[-6,0,16],[2,0,18],[-36,0,44],[10,0,46],[36,0,42],[-22,0,32],[20,0,16],[-10,0,50]],
      C:[[16,0,0],[24,0,6],[34,0,-2],[44,0,-4],[56,0,9],[64,0,0],[20,0,9.5],[28,0,-3]],
      D:[[-44,0,-44],[-12,0,-60],[44,0,-48],[-40,0,-70],[30,0,-74],[-22,0,-90],[22,0,-92],[48,0,-80],[-52,0,-46],[12,0,-58]]},
    cover:[[-26,0,-43],[-24,0,-49],[-10,0,-47.4],[-6,0,-44.6],[13,0,-46.4],[16,0,-43],[-21.2,0,-50.3],[-20,0,-56],[18,0,-55],[20,0,-57.6],[28,0,-60.8],[30,0,-65.4],
      [39,0,-70],[-29,0,-70],[-12,0,-77.6],[-8,0,-74.4],[8,0,-79.2],[19,0,-76],[-44,0,-78.6],[-38,0,-82],[44.8,0,-58],[-46,0,-62],[-34,0,-48.2],[34,0,-48.2],[0,0,-85]]};
  MAP.camps=[{k:'a',w:.2,p:[[0,0,62],[-2,0,62]],look:[0,1,80]},{k:'b',w:.2,p:[[-22,6,20]],look:[-10,1,30]},{k:'c',w:.2,p:[[22,0,-14]],look:[22,1,-2]},{k:'d',w:.2,p:[[0,0,-62]],look:[0,4,-80]}];
  MAP.moon={d:new THREE.Vector3(-.8,.36,.3).normalize(),c:new THREE.Color('#b8a494'),i:.34};MAP.spawnYaw=0;
  MAP.cam=(t,cam)=>{const a=t*.035;cam.position.set(Math.sin(a)*34,12,-40+Math.cos(a)*18);cam.lookAt(0,4,-62)}}
// ---------- the meshes boxes cannot make: the windsock by the runway (it swings: E8SOCK) ----------
const E8SOCK={m:null};
function ep8Mesh(scene){const g=new THREE.ConeGeometry(.45,2.6,10,1,true);g.rotateZ(Math.PI/2);g.translate(1.3,0,0);const n=g.attributes.position.count;g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3).fill(.85),3));
  const m=new THREE.Mesh(g,matWorld(TEX.e8wsock,{emis:.1}));m.position.set(-50,6,-86);m.matrixAutoUpdate=true;scene.add(m);MAP.meshes.push(m);E8SOCK.m=m}
MAPDEFS.ep8={n:['설령 비행장','Seolryeong Airfield'],d:['해 질 녘 눈보라 속, 1차 회수팀의 탈출 지점이었던 산속 비행장. 주차장 → 관제탑 → 격납고 → 계류장.','A hill airfield at dusk in a blizzard — RT-1\'s way out: the car park, the control tower, the hangars, then the apron.'],
  env:{sky:1,skyTex:'e8sky',noStars:1,snow:1,fog:'#4a5260',fogD:.017,skyFog:.62,halo:'#b08a72',ambOut:'#3e4858',ambIn:'#262a32',boAmb:.5},bounds:[-62,-106,72,106],probeY:[-1,.9,2.4,4.4,6.4,9,12],
  build:buildEp8,tex:bakeEp8Tex,mesh:ep8Mesh,ep:8};

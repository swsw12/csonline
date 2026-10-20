'use strict';
// ============ Chapter 6 map 「제1 봉쇄선 북문대교」 (North Gate Bridge, Containment Line 1): four zones played in order ============
// The motorway bridge north out of the Q-7 zone, a snowy dawn. North is -z; the deck is y 0, the river 24 m below.
// A  the south toll plaza (on land)     x -26..26   z 40.6..77   → RT-1's road blockers onto the bridge (gate gA: they sink)
// B  the bridge approach                x -14..14   z 6.2..40    ← RT-1's barricade at its north end: a coach, a container, an army truck (gate gB: blown away)
// C  the main span                      x -14..14   z -60..5.4   ← the cable-stayed pylon at z -32; jammed lanes both sides, a lane cleared down the middle
// D  the north checkpoint               x -32..32   z -125..-61.8← a road round two islands and across between them (MAP.ez.road: the APC's)
// RT-1's leader LEGATUS holds the far end with the command APC TESTUDO (legatus.js). Gates are boxes drawn as their own meshes, solid until opened.
Object.assign(MATS,{
  e6snow:{t:'e6snow',s:4,k:'soft'},e6snowG:{t:'e6snowG',s:3,k:'soft'},e6snowC:{t:'e6snowC',s:1.6,k:'soft'},e6deck:{t:'e6deck',s:4,k:'stone'},e6curb:{t:'e6curb',s:1,k:'stone'},
  e6para:{t:'e6para',s:2,k:'stone'},e6pylon:{t:'e6pylon',s:4,k:'stone'},e6pad:{t:'e6pad',s:4,k:'stone'},e6wall:{t:'e6wall',s:3,k:'stone'},e6wallC:{t:'e6wallC',uv:'boxV',s:4,k:'stone'},
  e6tw:{t:'e6tw',uv:'boxV',s:1.2,k:'stone'},e6gate:{t:'e6gate',uv:'boxV',s:2,k:'metal'},e6noise:{t:'e6noise',s:2,k:'metal'},e6office:{t:'e6office',s:2,k:'stone'},e6prefab:{t:'e6prefab',s:2,k:'metal'},
  e6booth:{t:'e6booth',uv:'box',k:'metal'},e6canU:{t:'e6canU',s:2,emis:.3,k:'metal'},e6bus:{t:'e6bus',uv:'box',k:'metal'},e6busF:{t:'e6busF',uv:'box',k:'metal'},
  e6cont:{t:'e6cont',uv:'boxV',s:6,k:'metal'},e6contB:{t:'e6contB',uv:'boxV',s:6,k:'metal'},e6mil:{t:'e6mil',s:2,k:'metal'},e6milD:{t:'e6milD',s:2,k:'metal'},e6tarp:{t:'e6tarp',s:2,k:'soft'},
  e6tank:{t:'e6tank',uv:'boxV',s:7.6,k:'metal'},e6lineW:{t:'e6lineW',s:1,k:'stone'},e6lineY:{t:'e6lineY',s:1,k:'stone'},e6wire:{t:'e6wire',uv:'box',k:'metal'},e6cable:{t:'e6cable',s:1,k:'metal'},
  e6c4:{t:'e6c4',uv:'box',emis:.15,k:'metal'},e6spikeB:{t:'e6spikeB',uv:'box',emis:.12,k:'metal'},
  e6sToll:{t:'e6sToll',uv:'box',emis:.45,k:'metal'},e6sOff:{t:'e6sOff',uv:'box',emis:.3,k:'metal'},e6sBridge:{t:'e6sBridge',uv:'box',emis:.06,k:'stone'},e6sStop:{t:'e6sStop',uv:'box',emis:.25,k:'metal'},
  e6sLine:{t:'e6sLine',uv:'box',emis:.22,k:'metal'},e6sCk:{t:'e6sCk',uv:'box',emis:.4,k:'metal'},e6sRT:{t:'e6sRT',uv:'box',emis:.12,k:'metal'},
});
// ---------- textures (painted on first load) ----------
// trodden snow over the road: drifts, grey slush, the dark asphalt showing through where the wheels went, a glint here and there
function texE6Snow(){const N=TN*2;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=P.n(x,y,90,6001,4),w=P.n(x,y,26,6002,3),h=hash2(x,y,6003);
    let c=dith(P,x,y,s*.9+w*.25-.05,['#7c8590','#8e97a2','#a0a9b3','#b2bac3','#c4cbd2','#d4dadf','#e2e6ea'],.08);
    const r=P.n(x,y,40,6004,3);if(r<.34)c=mix(c,'#2a2d31',clamp((.34-r)*5,0,.9));else if(r<.42)c=mix(c,'#5e646b',clamp((.42-r)*6,0,.6));
    if(h<.004)c='#ffffff';else if(h>.996)c='#6a717a';P.set(x,y,c)}
  for(let i=0;i<14;i++)stain(P,hash2(i,1,6005)*N,hash2(i,2,6005)*N,10+hash2(i,3,6005)*30,8+hash2(i,4,6005)*20,.12,6006+i)})}
// deep snow (the banks, the snowbank, drifts): soft blue shadows, a line of footprints
function texE6SnowG(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=P.n(x,y,60,6011,4)+(hash2(x,y,6012)-.5)*.05;P.set(x,y,dith(P,x,y,s,['#9aa4b0','#adb6c1','#c0c8d0','#d0d7dd','#dde2e7','#e8ecef'],.07))}
  for(let k=0;k<3;k++){let fx=hash2(k,1,6013)*N,fy=0;const a=hash2(k,2,6013)*.6-.3;for(let i=0;i<10;i++){fy+=N/10;fx+=Math.sin(a+i*.3)*6;for(const s of [-1,1])stain(P,fx+s*5,fy+s*6,3,5,.12,6014+i)}}
  pits(P,40,6015,'#8a94a0','#eef2f4')})}
// snow lying on things: roofs, bonnets, wall tops
function texE6SnowC(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)P.set(x,y,dith(P,x,y,P.n(x,y,40,6171,3)+(hash2(x,y,6172)-.5)*.06,['#b8c2cc','#c8d0d8','#d6dde3','#e2e7eb','#eceff2'],.08))})}
// the bridge deck: wet dark asphalt, snow blown into patches, salt stains, cracks
function texE6Deck(){const N=TN*2;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,50,6021,4)*.9+(hash2(x,y,6022)-.5)*.12;let c=dith(P,x,y,t,PAL.asph.concat(['#4a4b48']),.1);
    const s=P.n(x,y,70,6023,4);if(s>.5)c=mix(c,'#b8c0c8',clamp((s-.5)*3.2,0,.92));if(hash2(x,y,6024)<.003)c='#f0f4f8';P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,6025)*N,hash2(i,2,6025)*N,8+hash2(i,3,6025)*20,6+hash2(i,4,6025)*14,.2,6026+i);
  for(let i=0;i<6;i++)crack(P,Math.floor(hash2(i,1,6027)*N),Math.floor(hash2(i,2,6027)*N),60,6028+i,'#141516','#3a3b3a')})}
function texE6Curb(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,30,6031,3)+(hash2(x,y,6032)-.5)*.1,['#6a6c6a','#7a7c79','#8a8c88','#9a9b97'],.1);
  if(x%128<3)c='#4a4c4a';if(P.n(x,y,20,6033,2)>.68)c=mix(c,'#dfe4e8',.7);P.set(x,y,c)}})}
// the precast parapet: smooth grey with its joints, the run-off under the drains
function texE6Para(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,40,6041,4)*1.05+(hash2(x,y,6042)-.5)*.07,PAL.concf.concat(['#7a7a72']),.1);
    if(x<3)c=dk(c,.35);P.set(x,y,c)}
  for(let i=0;i<8;i++)streak(P,Math.floor(hash2(i,1,6043)*N),2,40+Math.floor(hash2(i,2,6043)*120),.16,2)})}
// the pylon's concrete: formwork panels, tie holes in rows, long streaks down from the cable anchors
function texE6Pylon(){const N=TN*2;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,60,6051,4)*1.1-.04+(hash2(x,y,6052)-.5)*.06,['#5a5c5a','#666865','#727470','#7e807b','#8a8c86','#969892'],.09);
    if(y%128<2||x%256<2)c=dk(c,.3);P.set(x,y,c)}
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const cx=i*128+64,cy=j*128+32;for(const [dx,dy] of [[-40,0],[40,0],[-40,64],[40,64]]){P.set(cx+dx,cy+dy,'#3a3c3a');P.set(cx+dx+1,cy+dy,'#3a3c3a')}}
  for(let i=0;i<16;i++)streak(P,Math.floor(hash2(i,1,6053)*N),Math.floor(hash2(i,2,6053)*N),40+Math.floor(hash2(i,3,6053)*200),.14,2)})}
// the checkpoint's concrete: poured bays with snow drifted into the joints, footprints
function texE6Pad(){const N=TN*2;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,60,6151,4)*1.1-.05+(hash2(x,y,6152)-.5)*.07,['#545652','#5e605b','#686a65','#72746e','#7c7e78'],.1);
    const s=P.n(x,y,50,6153,4);if(s>.42)c=mix(c,'#c8d0d6',clamp((s-.42)*3,0,.95));if(x%256<3||y%256<3)c=s>.5?'#d8dee2':'#34363a';P.set(x,y,c)}
  pits(P,60,6154,'#6a727a','#eef2f4')})}
// a blast wall's precast panels, rain and thaw streaks
function texE6Wall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,36,6111,4)+(hash2(x,y,6112)-.5)*.08,PAL.conc,.1);if(x%128<3)c=dk(c,.35);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,6113)*N),0,50+Math.floor(hash2(i,2,6113)*150),.16,2)})}
// the cordon wall: snow on its top, a yellow band, LINE 1 stencilled on every panel
function texE6WallC(){const W=256,H=TN;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,P.n(x,y,36,6121,4)+(hash2(x,y,6122)-.5)*.08,PAL.conc,.1);if(x<3)c=dk(c,.35);
    if(y<10)c=mix('#e8ecef','#c8d0d6',hash2(x,y,6123));if(y>H*.62&&y<H*.68)c='#c8a020';if(y>H-24)c=mix(c,'#dce2e6',.6);P.set(x,y,c)}
  for(let i=0;i<6;i++)streak(P,Math.floor(hash2(i,1,6124)*W),10,60+Math.floor(hash2(i,2,6124)*120),.16,2);
  P.post=ctx=>{ctx.fillStyle='rgba(28,28,26,.8)';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('LINE 1',W/2,H*.5)}})}
// a T-wall leaf with a snow cap and its number
function texE6TW(){const W=128,H=TN;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,P.n(x,y,40,6101,4)*1.05+(hash2(x,y,6102)-.5)*.08,['#56564e','#616158','#6c6c62','#77776c','#828276'],.1);
    if(x<2||x>W-3)c=dk(c,.25);if(y<10)c=mix('#e8ecef','#c8d0d6',hash2(x,y,6103));else if(y<14)c=mix(c,'#d8dee2',.5);if(y>H-22)c=((Math.floor((x+(H-y))/12))%2)?'#c8a020':'#1c1c1a';P.set(x,y,c)}
  for(let i=0;i<8;i++)streak(P,Math.floor(hash2(i,1,6104)*W),14,40+Math.floor(hash2(i,2,6104)*140),.14,1);
  P.post=ctx=>{ctx.fillStyle='rgba(30,30,28,.75)';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('L1',W/2,H*.36)}})}
// a steel sliding gate (and the road blockers): olive ribs, a yellow-black foot band, rust where the paint chipped
function texE6Gate(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#4e5638','#3e462c',P.n(x,y,30,6131,3));if(x%32<4)c=dk(c,.25);else if(x%32<6)c=lt(c,.12);
    if(y<8)c=mix('#e2e6ea','#c4ccd2',hash2(x,y,6133));else if(y>N-40)c=((Math.floor((x+y)/18))%2)?'#c8a020':'#181816';if(P.n(x,y,14,6132,2)>.68)c=mix(c,'#7a4a24',.5);P.set(x,y,c)}})}
// the motorway's noise barrier: grey-green ribbed panels
function texE6Noise(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#5e6a62','#4e5a52',P.n(x,y,30,6181,3));if(y%32<3)c=dk(c,.3);else if(y%32<5)c=lt(c,.1);if(x%256<4)c='#3a423c';P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,6182)*N),0,60+Math.floor(hash2(i,2,6182)*160),.12,2)})}
// the toll office's beige tiles
function texE6Office(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#b8a888','#a89878',P.n(x,y,24,6191,3));if(x%32<2||y%16<2)c=dk(c,.2);if(hash2(x,y,6192)<.03)c=dk(c,.08);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,6193)*N),0,40+Math.floor(hash2(i,2,6193)*100),.12,1)})}
// the inspection office and the guard booths: white sandwich panels, seams every metre, grime low down
function texE6Prefab(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8ccc8','#b4b8b4',P.n(x,y,40,6161,3));if(x%128<3)c='#8a8e8a';else if(x%128<5)c='#e0e4e0';if(y%16===0)c=dk(c,.05);if(P.n(x,y,12,6162,2)>.7)c=mix(c,'#7a6a52',.3);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,6163)*N),Math.floor(hash2(i,2,6163)*N*.3),40+Math.floor(hash2(i,3,6163)*80),.12,2)})}
// a toll booth: white panels under a blue band, the window, its number
function texE6Booth(){const W=256,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#d8dcdc','#c4c8c8',P.n(x,y,24,6061,3));if(y<26)c='#1c4a8a';if(y>H-20)c='#5a5e60';
    if(x>40&&x<216&&y>44&&y<118){c=mix('#1a2a38','#2e4a5a',P.n(x,y,20,6062,2));if((x+y*.6)%70<8)c=lt(c,.25)}if(hash2(x,y,6063)<.03)c=dk(c,.1);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ffffff';ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText('통행료 · TOLL',W/2,19);ctx.fillStyle='#2a2e30';ctx.font='bold 13px monospace';ctx.fillText('LANE · 북문',W/2,150)}})}
// the toll canopy's underside: ceiling panels with strip lights
function texE6CanU(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#8a8e90','#9a9ea0',P.n(x,y,30,6071,2));if(x%64<2||y%128<2)c='#5a5e60';if(y%128>56&&y%128<72&&x%64>8&&x%64<56)c='#f4f6f0';P.set(x,y,c)}})}
// an intercity coach: green and white, the windows' band, the route number
function texE6Bus(){const W=512,H=160;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2e8a4a','#26743e',P.n(x,y,40,6081,3));
    if(y<10)c=mix('#e8eef2','#c8d0d6',P.n(x,y,8,6082,2));else if(y<22)c='#d8dcd8';else if(y>34&&y<84&&x%86>6){c=mix('#141c22','#22323c',P.n(x,y,16,6083,2));if((x*.4+y)%60<6)c=lt(c,.2)}
    else if(y>84&&y<96)c='#e8e8e0';else if(y>H-18)c='#1c1c1c';if(x>380&&x<430&&y>34&&y<H-18)c=mix('#1a2228','#2a3a44',P.n(x,y,10,6084,2));
    if(hash2(x,y,6085)<.02)c=dk(c,.15);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ffffff';ctx.font='bold 22px sans-serif';ctx.fillText('1201',30,124);ctx.font='bold 14px sans-serif';ctx.fillText('북문대교 · 시외',90,124)}})}
function texE6BusF(){const W=256,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2e8a4a','#26743e',P.n(x,y,30,6091,2));
    if(y<10)c='#dfe5e9';else if(y<34)c='#141414';else if(y<110&&x>14&&x<242){c=mix('#121a20','#24343e',P.n(x,y,14,6092,2));if((x+y)%80<8)c=lt(c,.2)}else if(y>150)c='#202020';
    if(y>124&&y<140&&(x<46&&x>16||x>210&&x<240))c='#f0e8c8';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ff9a1a';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('1201 북문대교',W/2,27)}})}
// razor wire: coils over nothing (the cut-out shader drops the rest)
function texE6Wire(){const W=256,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++)P.alpha(x,y,0);
  P.post=ctx=>{ctx.strokeStyle='#4a5058';ctx.lineWidth=2;for(let i=0;i<15;i++){ctx.beginPath();ctx.ellipse(i*18+9,32,14,27,.35,0,TAU);ctx.stroke()}ctx.strokeStyle='#8a929a';ctx.lineWidth=1;for(let i=0;i<15;i++){ctx.beginPath();ctx.ellipse(i*18+7,30,13,26,.35,0,Math.PI);ctx.stroke()}}})}
// a charge's spot (painted on the barricade): a hazard frame, where to put it
function texE6C4(){const W=128,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c='#202020';if(x<10||x>W-11||y<10||y>H-11)c=((Math.floor((x+y)/10))%2)?'#e8b820':'#141414';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8b820';ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText('폭약 설치',W/2,46);ctx.font='bold 14px sans-serif';ctx.fillText('CHARGE HERE',W/2,68)}})}
// the spike strip's case on the kerb
function texE6SpikeB(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#d8a818','#c09010',P.n(x,y,16,6141,2));if(y>N-30&&((Math.floor(x/12))%2))c='#141414';if(x<4||y<4||x>N-5)c='#6a5208';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#141414';ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText('차량 차단',N/2,40);ctx.font='bold 13px sans-serif';ctx.fillText('SPIKE STRIP',N/2,62)}})}
function texE6Line(col,seed){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix(col,dk(col,.25),P.n(x,y,12,seed,2));if(P.n(x,y,20,seed+1,3)>.6)c=mix(c,'#dfe4e8',.6);P.set(x,y,c)}})}
function texE6Cable(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8ccd0','#a8acb0',P.n(x,y,8,6241,2));if(y%16<2)c=dk(c,.12);P.set(x,y,c)}})}
// the dawn: night still overhead, a cold grey low down, a band of copper where the sun is coming up (east-south-east)
function texE6Sky(){const W=512,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H,e=Math.max(0,Math.cos((x/W)*TAU-.35));let c=v<.4?mix('#070c18','#16223a',v/.4):mix('#16223a','#4a5466',(v-.4)/.6);
    if(v>.72)c=mix(c,'#b8785a',clamp((v-.72)*3.4,0,1)*Math.pow(e,1.6)*.85);const cl=P.n(x,y*2.4,56,6251,4);if(cl>.56)c=mix(c,v>.6?mix('#6a5a66','#3a4252',1-e):'#2a3446',clamp((cl-.56)*1.8,0,.6));P.set(x,y,c)}})}
// the river far below: black water, ice floes drifting
function texE6Water(){const N=TN*2;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=P.n(x,y,30,6211,3),i=P.n(x,y,80,6212,4);let c=mix('#141c26','#26303c',r);
  if(i>.6)c=mix(c,'#c8d2dc',clamp((i-.6)*5,0,.9));else if(i>.56)c=mix(c,'#5a6a7a',.6);if(hash2(x,y,6213)<.002)c='#8aa0b4';P.set(x,y,c)}})}
// the banks under snow, rocks and dead scrub showing through
function texE6Bank(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const s=P.n(x,y,50,6221,4);let c=dith(P,x,y,s,['#5a6470','#7a8590','#9aa5b0','#b8c2cc','#d0d8de'],.1);if(P.n(x,y,14,6222,3)>.7)c=mix(c,'#2a3028',.7);P.set(x,y,c)}})}
function bakeEp6Tex(){if(TEX.e6snow)return;
  TEX.e6snow=mkTex(texE6Snow());TEX.e6snowG=mkTex(texE6SnowG());TEX.e6snowC=mkTex(texE6SnowC());TEX.e6deck=mkTex(texE6Deck());TEX.e6curb=mkTex(texE6Curb());TEX.e6para=mkTex(texE6Para());
  TEX.e6pylon=mkTex(texE6Pylon());TEX.e6pad=mkTex(texE6Pad());TEX.e6wall=mkTex(texE6Wall());TEX.e6wallC=mkTex(texE6WallC());TEX.e6tw=mkTex(texE6TW());TEX.e6gate=mkTex(texE6Gate());
  TEX.e6noise=mkTex(texE6Noise());TEX.e6office=mkTex(texE6Office());TEX.e6prefab=mkTex(texE6Prefab());TEX.e6booth=mkTex(texE6Booth(),false);TEX.e6canU=mkTex(texE6CanU());
  TEX.e6bus=mkTex(texE6Bus(),false);TEX.e6busF=mkTex(texE6BusF(),false);TEX.e6cont=mkTex(texContainer('#4a5236','RT-1'));TEX.e6contB=mkTex(texContainer('#3a4e66','QZ-7'));
  TEX.e6mil=mkTex(texCarPaint('#4a5236',0));TEX.e6milD=mkTex(texCarPaint('#363c2a',0));TEX.e6tarp=mkTex(texCanvas('#46503a',901));TEX.e6tank=mkTex(texE2Tank());
  TEX.e6lineW=mkTex(texE6Line('#d8d8d0',6201));TEX.e6lineY=mkTex(texE6Line('#c8a020',6203));TEX.e6wire=mkTex(texE6Wire(),false);TEX.e6cable=mkTex(texE6Cable());
  TEX.e6c4=mkTex(texE6C4(),false);TEX.e6spikeB=mkTex(texE6SpikeB(),false);TEX.e6sky=mkTex(texE6Sky(),false);TEX.e6water=mkTex(texE6Water());TEX.e6bank=mkTex(texE6Bank());
  TEX.e6sToll=mkTex(texSign([{t:'북문 요금소'},{t:'BUKMUN TOLLGATE',s:9}],'#173a6e','#ffffff',256,40),false);
  TEX.e6sOff=mkTex(texSign([{t:'북문 영업소'},{t:'TOLL OFFICE',s:9}],'#173a6e','#ffffff',160,32),false);
  TEX.e6sBridge=mkTex(texSign([{t:'북문대교'},{t:'BUKMUN BRIDGE',s:10}],'#262624','#d8c088',160,48),false);
  TEX.e6sStop=mkTex(texSign([{t:'정지 · 불응 시 발포'},{t:'STOP OR WE SHOOT',s:9}],'#b81c14','#ffffff',200,40),false);
  TEX.e6sLine=mkTex(texSign([{t:'제1 봉쇄선 · 민간인 통행 금지'},{t:'CONTAINMENT LINE 1 · NO CIVILIANS',s:8}],'#c8a020','#141414',240,40),false);
  TEX.e6sCk=mkTex(texSign([{t:'검문소 · 정차'},{t:'CHECKPOINT · STOP',s:9}],'#c8a020','#141414',224,40),false);
  TEX.e6sRT=mkTex(texSign([{t:'1차 회수팀 · 통제 구역'},{t:'RT-1 · AUTHORISED ONLY',s:8}],'#2a3220','#e8e4c8',176,36),false)}
// ---------- geometry helpers ----------
const E6NZ={nosolid:true};
// the deck's edge on side sd (-1 west, 1 east): the precast parapet with snow on it, a tall safety fence on top (shots pass it, nobody climbs it)
function e6edge(sd,z0,z1){const x0=sd<0?-14.5:14,x1=sd<0?-14:14.5;B(x0,0,z0,x1,1.1,z1,'e6para');B(x0-.02,1.1,z0,x1+.02,1.17,z1,'e6snowC',E6NZ);
  const fx=sd*14.25;B(fx-.015,1.1,z0,fx+.015,3.6,z1,'fence',{pass:1});for(let z=z0;z<=z1+.01;z+=4)B(fx-.05,1.1,z-.05,fx+.05,3.7,z+.05,'metal2')}
// a bridge lamp: the pole by the parapet, the arm over the outer lane, a sodium head and its light
function e6lamp(sd,z){const x=sd*13.75,hx=x-sd*2.1;B(x-.1,0,z-.1,x+.1,9,z+.1,'metal2');B(Math.min(x,hx),8.9,z-.08,Math.max(x,hx),9.05,z+.08,'metal2',E6NZ);
  B(hx-.32,8.7,z-.16,hx+.32,8.9,z+.16,'lampO',E6NZ);LIGHT(hx,8.3,z,'#ffae58',17,1,{lamp:1})}
// a car along 'x' or 'z' centred on x,z (the low end is its front), snow on the roof and the bonnet
function e6car(x,z,ax,mat,burnt){const L=4.4,W=1.9;if(ax==='z')car(x-W/2,z-L/2,x+W/2,z+L/2,mat||'car',{burnt});else car(x-L/2,z-W/2,x+L/2,z+W/2,mat||'car',{burnt});
  if(ax==='z'){B(x-W/2+.1,1.48,z-L/2+1.15,x+W/2-.1,1.55,z+L/2-1,'e6snowC',E6NZ);B(x-W/2+.05,.95,z-L/2+.12,x+W/2-.05,1,z-L/2+1.1,'e6snowC',E6NZ)}
  else{B(x-L/2+1.15,1.48,z-W/2+.1,x+L/2-1,1.55,z+W/2-.1,'e6snowC',E6NZ);B(x-L/2+.12,.95,z-W/2+.05,x-L/2+1.1,1,z+W/2-.05,'e6snowC',E6NZ)}}
// an intercity coach from x0,z0 along the axis (11 × 2.5 m); o: the boxes' options (the barricade's coach is part of gate gB)
function e6bus(x0,z0,ax,o){o=o||{};const L=11,W=2.5,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,y0,z0+c0,x0+a1,y1,z0+c1,m,Object.assign({},o,oo)):B(x0+c0,y0,z0+a0,x0+c1,y1,z0+a1,m,Object.assign({},o,oo));
  const ends=ax==='x'?{px:'e6busF',nx:'e6busF'}:{pz:'e6busF',nz:'e6busF'};
  LB(.1,L-.1,0,W,.45,3.1,'e6bus',{f:ends});LB(.2,L-.2,.05,W-.05,3.1,3.2,'e6snowC',{nosolid:true});
  for(const a of [1.2,2.3,L-1.8])for(const c of [-.05,W-.3])LB(a,a+.9,c,c+.35,0,.95,'tire')}
// an army truck under snow from x0,z0 along the axis (cab at the high end); o.g: the boxes' options, o.y: standing on a kerb
function e6truck(x0,z0,ax,o){o=o||{};const L=7.2,W=2.4,Y=o.y||0,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,Y+y0,z0+c0,x0+a1,Y+y1,z0+c1,m,Object.assign({},o.g||{},oo)):B(x0+c0,Y+y0,z0+a0,x0+c1,Y+y1,z0+a1,m,Object.assign({},o.g||{},oo));
  LB(.2,L-.2,.15,W-.15,.6,1.15,'e6milD');LB(L-2,L-.1,.1,W-.1,1.15,2.55,'e6mil');LB(L-.12,L-.08,.3,W-.3,1.7,2.35,'carGl',{nosolid:true});
  LB(.2,L-2.2,.05,W-.05,1.15,1.6,'e6mil');LB(.2,L-2.2,.05,W-.05,1.6,3.05,'e6tarp');LB(.25,L-2.25,.1,W-.1,3.05,3.13,'e6snowC',{nosolid:true});LB(L-1.95,L-.15,.15,W-.15,2.55,2.61,'e6snowC',{nosolid:true});
  for(const a of [.6,1.9,L-1.4])for(const c of [-.04,W-.36])LB(a,a+.85,c,c+.4,0,.9,'tire')}
// a run of n T-wall leaves (1.2 m each) from x0,z0 along the axis, h tall, standing at y
function e6tw(x0,z0,ax,n,h,y){h=h||3.6;y=y||0;for(let i=0;i<n;i++){const a=i*1.2;
  if(ax==='x'){B(x0+a,y,z0-.42,x0+a+1.18,y+.5,z0+.42,'e6tw');B(x0+a,y+.5,z0-.16,x0+a+1.18,y+h,z0+.16,'e6tw')}
  else{B(x0-.42,y,z0+a,x0+.42,y+.5,z0+a+1.18,'e6tw');B(x0-.16,y+.5,z0+a,x0+.16,y+h,z0+a+1.18,'e6tw')}}}
function e6sand(x0,z0,ax,len,h,y){h=h||1.05;y=y||0;if(ax==='x'){B(x0,y,z0-.35,x0+len,y+h,z0+.35,'sandbag');B(x0,y+h,z0-.3,x0+len,y+h+.06,z0+.3,'e6snowC',E6NZ)}
  else{B(x0-.35,y,z0,x0+.35,y+h,z0+len,'sandbag');B(x0-.3,y+h,z0,x0+.3,y+h+.06,z0+len,'e6snowC',E6NZ)}}
function e6jb(x,z,ax,y){y=y||0;if(ax==='x')B(x-1.3,y,z-.3,x+1.3,y+.85,z+.3,'barrier');else B(x-.3,y,z-1.3,x+.3,y+.85,z+1.3,'barrier')}
// a toll booth on its island, a barrier arm across the lane to its east
function e6booth(x,z,y,arm){B(x-.7,y,z-1.6,x+.7,y+2.6,z+1.6,'e6booth');B(x-.82,y+2.6,z-1.72,x+.82,y+2.78,z+1.72,'metal2');B(x-.84,y+2.78,z-1.74,x+.84,y+2.85,z+1.74,'e6snowC',E6NZ);
  if(arm)B(x+.7,y+.95,z-1.62,x+4.6,y+1.05,z-1.52,'hazard',E6NZ)}
// a guard booth (windows all round, a lamp inside)
function e6gbooth(x,z,y){y=y||0;B(x-.8,y,z-.8,x+.8,y+2.5,z+.8,'e6prefab');B(x-.95,y+2.5,z-.95,x+.95,y+2.7,z+.95,'roof');B(x-.96,y+2.7,z-.96,x+.96,y+2.77,z+.96,'e6snowC',E6NZ);
  for(const [fx,fz] of [[0,-1],[0,1],[-1,0],[1,0]])if(fx)B(x+fx*.81-.01,y+1.1,z-.5,x+fx*.81+.01,y+2,z+.5,'winLit',E6NZ);else B(x-.5,y+1.1,z+fz*.81-.01,x+.5,y+2,z+fz*.81+.01,'winLit',E6NZ);
  LIGHT(x,y+2.1,z,'#ffe2b0',5,.6)}
// a floodlight pole on a kerb (the light is baked)
function e6flood(x,z,y){y=y||0;B(x-.15,y,z-.15,x+.15,y+8,z+.15,'metal2');B(x-.8,y+8,z-.2,x+.8,y+8.6,z+.2,'metal2',E6NZ);B(x-.7,y+8.1,z-.24,x+.7,y+8.5,z-.2,'lampW',E6NZ);B(x-.7,y+8.1,z+.2,x+.7,y+8.5,z+.24,'lampW',E6NZ);LIGHT(x,y+7.6,z,'#e8eeff',22,1)}
function buildEp6(){
  const nz=E6NZ;
  // ================= zone A: the south toll plaza =================
  B(-28,-1,40.6,28,0,78,'e6snow',{ground:1});
  // the toll office west, the motorway's noise barrier east, a pile-up against a bank of ploughed snow south
  B(-27,0,40.6,-26.4,4,78,'e6wall');B(26.4,0,40.6,27,5.2,78,'e6noise');B(-27,0,76.6,27,4.2,78,'e6snowG');
  B(-26.4,0,60,-19.6,3.4,72,'e6office');B(-26.6,3.4,59.8,-19.4,3.65,72.2,'roof');B(-26.6,3.65,59.8,-19.4,3.73,72.2,'e6snowC',nz);
  for(const z of [61.6,64.2,69,71])B(-19.62,1.1,z-.8,-19.58,2.4,z+.8,'winLit',nz);B(-19.62,0,66.2,-19.58,2.3,67.4,'door',nz);B(-19.62,2.55,62.8,-19.58,3.25,70.4,'e6sOff',nz);
  LIGHT(-18.6,2.6,66.8,'#ffe2b0',7,.7);
  // the toll canopy over seven islands and six lanes; a booth on every island but the middle one
  B(-21.5,6,51.5,21.5,6.7,60.5,'metal2',{f:{ny:'e6canU'}});B(-21.5,6.7,51.5,21.5,6.78,60.5,'e6snowC',nz);B(-12,6.05,51.42,12,6.65,51.5,'e6sToll',nz);B(-12,6.05,60.5,12,6.65,60.58,'e6sToll',nz);
  for(const x of [-18,-12,-6,0,6,12,18]){B(x-.8,0,49.6,x+.8,.2,62.4,'e6curb');for(const z of [52.6,59.4])B(x-.25,.2,z-.25,x+.25,6,z+.25,'conc');
    if(x)e6booth(x,56,.2,x===-12||x===6);else B(-.5,.2,55.2,.5,1.6,56.8,'metal',{f:{pz:'screen',nz:'screen'}})}
  for(const x of [-15,-9,-3,3,9,15])LIGHT(x,5.7,56,'#eef2ff',9,.7);
  // the lanes: cars left where they stopped, a coach, a burnt-out car; the pile-up at the south end
  e6car(-15,65.4,'z','car');e6car(-9,51.6,'z','carBurnt',1);e6car(3,66.6,'z','carR');e6car(9,47.2,'z','car');e6car(-3,70.8,'z','car');e6bus(13.75,62.6,'z');
  e6car(-17.4,74.2,'x','carBurnt',1);e6car(-5.6,74.6,'x','carR');e6car(6.8,74,'x','car');e6car(18.6,74.4,'x','carBurnt',1);e6truck(-13.4,71.8,'x');
  // RT-1's post north of the canopy: an army truck, sandbags, jersey barriers, a fire in a drum
  e6truck(-13,43.2,'x');e6sand(16.6,43.2,'x',4);e6sand(16.6,43.2,'z',2.6);
  for(const [x,z,ax] of [[-20.4,47.4,'x'],[9.6,42.6,'x'],[-1.6,43,'x'],[21,49,'z']])e6jb(x,z,ax);
  drum(6.4,44.6,0,'drumR');MAP.fires.push([6.4,.9,44.6]);LIGHT(6.4,1.4,44.6,'#ff8a3a',8,.9);for(const [x,z] of [[7.2,44.2],[-23.8,52.6],[-24.4,53.2]])drum(x,z);
  for(const [x,z] of [[-24,46],[24,46],[-24,63],[24,72]])lamp(x,z,7.2);
  B(-27,0,40.6,27,.35,41.2,'e6snowG',nz);B(-27,0,76,27,.4,76.6,'e6snowG',nz);
  // the way onto the bridge: walls either side, RT-1's road blockers across it (gate gA: they sink into the road)
  B(-27,0,40,-14.5,3.4,40.6,'e6wall');B(14.5,0,40,27,3.4,40.6,'e6wall');
  B(-14.5,0,40.05,0,1.4,40.55,'e6gate',{gate:'gA',gs:[0,-1.45,0]});B(0,0,40.05,14.5,1.4,40.55,'e6gate',{gate:'gA',gs:[0,-1.45,0]});
  B(-14.5,1.4,40.28,14.5,3.2,40.32,'fence',{pass:1,gate:'gA',gs:[0,-3.3,0]});B(-8,3.45,40.6,8,4.25,40.64,'e6sRT',nz);B(-8.4,3.4,40,8.4,3.45,40.6,'metal2',nz);
  // ================= the bridge: zones B and C =================
  B(-14.5,-2.6,-62,14.5,0,40.6,'e6deck',{ground:1});e6edge(-1,-62,40);e6edge(1,-62,40);
  // under the deck: four box girders, the piers (seen over the fence; nobody gets down there)
  for(const x of [-11.5,-4,4,11.5])B(x-.9,-4.4,-62,x+.9,-2.6,40.6,'e6pylon',nz);for(const z of [36,8])B(-12,-26,z-1.6,12,-4.4,z+1.6,'e6pylon',nz);
  // lane markings, the expansion joint at the south end, the lamps (staggered either side)
  for(const x of [-9,-4.5,4.5,9])for(let z=-60;z<38;z+=6)B(x-.07,0,z,x+.07,.012,z+3,'e6lineW',nz);for(const x of [-.25,.25])B(x-.06,0,-60,x+.06,.012,38,'e6lineY',nz);
  B(-14,0,38.4,14,.014,38.7,'metal2',nz);
  for(const z of [34,18,2,-14,-46])for(const sd of [-1,1])e6lamp(sd,z+(sd>0?8:0));
  // the bridge's name on its plinths at the south end
  for(const sd of [-1,1]){const x=sd*13.4;B(x-.5,0,36.6,x+.5,1.5,38.2,'conc');B(x-sd*.5,.4,36.9,x-sd*.52,1.3,37.9,'e6sBridge',nz)}
  // ================= zone B: the approach =================
  // RT-1's machine-gun nest, cars left in the lanes, a truck jack-knifed across two of them, a fire in a drum
  e6sand(-7.6,14,'x',4.2);e6sand(-7.6,14,'z',2.6);e6sand(-3.4,14,'z',2.6);
  e6car(-11.25,30.2,'z','car');e6car(-6.75,22.2,'z','carBurnt',1);e6car(2.25,33.2,'z','carR');e6car(6.75,13.8,'z','car');e6car(11.25,24.4,'z','car');e6car(-2.25,10.6,'z','car');e6car(11.25,10.4,'z','carR');
  e6truck(2.8,18.4,'x');
  drum(-10.2,9.4,0,'drumR');MAP.fires.push([-10.2,.9,9.4]);LIGHT(-10.2,1.4,9.4,'#ff8a3a',8,.9);for(const [x,z] of [[-10.8,8.8],[8.6,27.2],[9.1,27.7]])drum(x,z);
  // RT-1's barricade across the north end (gate gB: the charges blow it away): a coach, a container, an army truck, sandbags in the gaps
  const gB={gate:'gB',gs:[0,-16,0]};
  B(-14,0,2.9,-13.5,2.4,4.9,'sandbag',gB);e6bus(-13.6,2.6,'x',gB);B(-2.7,0,3,-2.1,2.4,5,'sandbag',gB);B(-2.1,0,2.8,4.1,2.6,5.2,'e6cont',gB);B(4.1,0,2.9,7,2.4,5.1,'sandbag',gB);e6truck(6.8,2.6,'x',{g:gB});
  B(-14,2.6,3.6,14,3.25,4.2,'e6wire',Object.assign({nosolid:true},gB));
  for(const [x,z] of [[-8,5.11],[1,5.21],[9.4,4.96]])B(x-.55,.75,z,x+.55,1.65,z+.05,'e6c4',Object.assign({nosolid:true},gB));
  B(-14,0,6,14,.3,6.4,'e6snowG',nz);
  // ================= zone C: the main span =================
  // the pylon: two legs outside the deck, a beam under it and one at the top (the stay cables and the red lamps: ep6Mesh)
  B(-18.8,-26,-34,-15,60,-30,'e6pylon');B(15,-26,-34,18.8,60,-30,'e6pylon');B(-18.8,52,-33.4,18.8,55.6,-30.6,'e6pylon');B(-18.8,-7,-33.4,18.8,-2.6,-30.6,'e6pylon',nz);
  for(const x of [-16.9,16.9])B(x-.25,60,-32.25,x+.25,60.4,-31.75,'lampR',nz);B(-12,-26,-62.6,12,-4.4,-59.4,'e6pylon',nz);
  // the jam both sides of a lane down the middle that RT-1's plough cleared (the APC's lane): cars, a coach, a tanker on its side
  for(const [x,z,m,b] of [[-11.25,-8.4,'car'],[-11.25,-18.4,'carR'],[-11.25,-28,'car'],[-11.25,-53.6,'carBurnt',1],[-6.75,-6.6,'car'],[-6.75,-21.8,'carBurnt',1],[-6.75,-35.2,'car'],[-6.75,-48.4,'carR'],
    [6.75,-11.8,'car'],[6.75,-27.6,'carBurnt',1],[6.75,-42.6,'carR'],[6.75,-55.4,'car'],[11.25,-5.6,'car'],[11.25,-31.8,'car'],[11.25,-45,'carR'],[11.25,-53.8,'car']])e6car(x,z,'z',m,b);
  e6bus(-12.5,-47,'z');
  B(9.8,0,-25,12.8,2.7,-14.8,'e6tank');B(9.9,0,-14.8,12.7,2.3,-12.6,'e6mil');B(10.1,1.4,-12.62,12.5,2.1,-12.58,'carGl',nz);for(const z of [-24,-16.6])B(12.8,0,z-.45,13.2,.9,z+.45,'tire');B(9.9,2.7,-24.6,12.7,2.78,-15.2,'e6snowC',nz);
  // RT-1's last sandbags in front of the checkpoint gate, its warning sign
  e6sand(-12.4,-52,'x',3.6);e6sand(8.8,-51.4,'x',3.6);e6sand(-4.2,-57.6,'x',2.4);
  B(9,0,-58.05,9.12,2.4,-57.93,'metal2');B(8.1,2.4,-58.06,10,3.2,-58,'e6sStop',nz);B(-10,0,-58.05,-9.88,2.4,-57.93,'metal2');B(-10.9,2.4,-58.06,-9,3.2,-58,'e6sStop',nz);
  // ================= zone D: the north checkpoint (LEGATUS and TESTUDO) =================
  B(-33,-1,-126,33,0,-62,'e6snow',{ground:1});
  // blast walls round it, the cordon wall north (taller, razor wire along the tops), the south wall with the gate from the bridge (gate gC)
  B(-33,0,-126,-32,4.2,-62.6,'e6wall');B(32,0,-126,33,4.2,-62.6,'e6wall');B(-33,0,-126.2,33,6.2,-125,'e6wallC');
  B(-33,0,-62.6,-8,4.2,-62,'e6wall');B(8,0,-62.6,33,4.2,-62,'e6wall');B(-8,3.8,-62.6,8,4.8,-62,'e6wall');
  B(-8,0,-62.5,0,3.8,-62.1,'e6gate',{gate:'gC',gs:[-7.9,0,0]});B(0,0,-62.5,8,3.8,-62.1,'e6gate',{gate:'gC',gs:[7.9,0,0]});B(-7,3.9,-61.98,7,4.7,-61.94,'e6sCk',nz);
  B(-6,0,-124.98,6,5.6,-124.9,'e6gate',nz);B(-7.2,5.6,-124.98,7.2,6.15,-124.9,'e6sLine',nz);
  B(-33,6.2,-125.9,33,6.8,-125.3,'e6wire',nz);for(const x of [-32.5,32.5])B(x-.3,4.2,-125,x+.3,4.7,-62.6,'e6wire',nz);B(-33,4.2,-62.6,-8,4.7,-62,'e6wire',nz);B(8,4.2,-62.6,33,4.7,-62,'e6wire',nz);
  // the kerbs: sidewalks along the walls, the south and the north island (the road runs round both and across between them); a sill
  // under the gate at the kerb's height (without it the kerb's edge 10 cm from the gate's row of nav cells left no way through)
  const kb={f:{px:'e6curb',nx:'e6curb',pz:'e6curb',nz:'e6curb'}};
  B(-32,0,-65.5,32,.18,-62.6,'e6pad',kb);B(-7.99,0,-62.6,7.99,.18,-62.02,'e6pad',kb);B(-32,0,-125,32,.18,-121.5,'e6pad',kb);B(-32,0,-121.5,-28.5,.18,-65.5,'e6pad',kb);B(28.5,0,-121.5,32,.18,-65.5,'e6pad',kb);
  B(-20.5,0,-89,20.5,.18,-73.5,'e6pad',kb);B(-20.5,0,-114,20.5,.18,-98,'e6pad',kb);
  for(const [x0,z0,x1,z1] of [[-32,-125,32,-124.4],[-32,-121.5,-31.4,-65.5],[31.4,-121.5,32,-65.5]])B(x0,.18,z0,x1,.5,z1,'e6snowG',nz);
  // ---- the south island: the inspection office (its roof a high spot: stairs on its west side), T-walls facing the south road,
  // a machine-gun nest, a parked truck, a floodlight, the gantries' booths
  B(9,.18,-87.6,19,3.18,-80.4,'e6prefab');B(8.8,3.18,-87.8,19.2,3.4,-80.2,'roof');B(8.8,3.4,-87.8,19.2,3.47,-80.2,'e6snowC',nz);
  for(const x of [11,14,17])B(x-.7,1.2,-80.42,x+.7,2.4,-80.38,'winLit',nz);B(19.18,.18,-85,19.22,2.3,-83.8,'door',nz);LIGHT(14,2.4,-79.6,'#ffe2b0',6,.6);
  stairs('z',7.4,8.9,-80.8,-87.4,.18,3.4,12,'plate');B(7.3,.18,-87.4,7.4,4.4,-80.8,'metal2',{rail:1});
  B(9,3.4,-87.8,19.2,4.4,-87.7,'metal2',{rail:1});B(19.1,3.4,-87.8,19.2,4.4,-80.2,'metal2',{rail:1});B(8.8,3.4,-80.3,19.2,4.4,-80.2,'metal2',{rail:1});
  e6tw(-19.4,-74.4,'x',6,3.2,.18);e6tw(-10.2,-74.4,'x',4,3.2,.18);e6tw(3.4,-74.4,'x',5,3.2,.18);e6tw(-16.2,-86.6,'z',4,3.2,.18);
  e6sand(-3.6,-84,'x',4.6,1.05,.18);e6sand(-3.6,-84,'z',3,1.05,.18);e6sand(1,-84,'z',3,1.05,.18);
  e6truck(-12.4,-88.6,'x',{y:.18});e6jb(-5.4,-77.6,'x',.18);e6jb(13.8,-77,'x',.18);e6flood(0,-77.6,.18);
  for(const x of [-8,8]){e6gbooth(x,-87.4,.18);e6gbooth(x+(x<0?3:-3),-99.6,.18)}
  // the gantries over the crossing road (x -8 and 8): the checkpoint signs, lamps underneath
  for(const x of [-8,8]){for(const z of [-88.7,-98.3])B(x-.25,.18,z-.25,x+.25,6.4,z+.25,'metal2');B(x-.45,6.4,-98.6,x+.45,7.2,-88.4,'metal2',{f:{px:'e6sCk',nx:'e6sCk'}});
    B(x-.46,7.2,-98.6,x+.46,7.27,-88.4,'e6snowC',nz);B(x-.3,6.25,-94.5,x+.3,6.4,-92.5,'lampW',nz);LIGHT(x,5.9,-93.5,'#eef2ff',12,.95)}
  // ---- the north island: two containers stacked (stairs to the lower one's top; LEGATUS leaps onto the upper), RT-1's command tent,
  // a fuel bowser (shoot it and it goes up — next to TESTUDO or LEGATUS it hurts them too), T-walls, sandbags, a generator
  B(-19.4,.18,-112.6,-13.4,2.78,-110.2,'e6cont');B(-19.4,2.78,-112.6,-16.4,5.38,-110.2,'e6contB');B(-19.5,5.38,-112.7,-16.3,5.45,-110.1,'e6snowC',nz);B(-16.4,2.78,-112.7,-13.3,2.85,-110.1,'e6snowC',nz);
  stairs('x',-112.6,-111.2,-8.8,-13.4,.18,2.78,9,'plate');B(-13.4,.18,-111.2,-8.8,1.3,-111.1,'metal2',{rail:1});
  {const x0=2,x1=10,z0=-112.4,z1=-106.4,y=.18,h=2.8,t=.07;wallX(x0,x1,z1-t,z1,y,y+h,'e6tarp',[[5,7,y,y+2.2]]);wallX(x0,x1,z0,z0+t,y,y+h,'e6tarp');wallZ(x0,x0+t,z0+t,z1-t,y,y+h,'e6tarp');wallZ(x1-t,x1,z0+t,z1-t,y,y+h,'e6tarp');
    const cz=(z0+z1)/2,hw=(z1-z0)/2+.2;B(x0-.15,y+h,cz-hw,x1+.15,y+h+.3,cz+hw,'e6tarp');B(x0-.15,y+h+.3,cz-hw*.6,x1+.15,y+h+.55,cz+hw*.6,'e6tarp');B(x0-.2,y+h+.55,cz-hw*.62,x1+.2,y+h+.61,cz+hw*.62,'e6snowC',nz);
    B(3,y,-111.8,6,y+.8,-110.6,'wood',{f:{py:'metal2'}});B(7.2,y,-111.9,9.4,y+1.4,-111.2,'metal',{f:{pz:'screen'}});LIGHT(6,y+2.4,-109.4,'#ffe2b0',7,.75)}
  B(-7.4,.78,-104.3,0,3.1,-102.1,'e6tank',{eh:{k:'fuel',i:0}});B(0,.78,-104.3,2.2,2.8,-102.1,'e6mil');B(2.18,1.7,-104,2.22,2.5,-102.4,'carGl',nz);B(-7.4,.58,-104.4,2.2,.78,-102,'metal2');
  for(const x of [-6.6,-4.2,-1,1.2])for(const z of [-104.5,-102.3])B(x,.18,z,x+.9,1.08,z+.4,'tire');B(-7.3,3.1,-104.2,-.1,3.17,-102.2,'e6snowC',nz);
  e6tw(-11,-98.6,'x',5,3.2,.18);e6tw(11.6,-98.6,'x',6,3.2,.18);e6tw(-2,-113.6,'x',7,3.2,.18);e6tw(19.6,-112,'z',5,3.2,.18);
  e6sand(12,-104,'x',4,1.05,.18);e6sand(12,-104,'z',2.4,1.05,.18);
  B(-4.6,.18,-109.6,-2.4,1.7,-108.2,'e6mil');B(-4.2,1.7,-109.2,-3.9,2.5,-108.9,'pipe');e6flood(14,-110.4,.18);
  // ---- the sidewalks: lamp posts, jersey barriers (cover from the road), the spike-strip cases (MAP.ez.spikes), a guard booth, two fires
  for(const [x,z] of [[-30.4,-72],[-30.4,-88],[-30.4,-104],[-30.4,-119],[30.4,-72],[30.4,-88],[30.4,-104],[30.4,-119],[-18,-63.6],[18,-63.6],[-14,-123.4],[14,-123.4]])lamp(x,z,7.4);
  for(const [x,z,ax] of [[-29.4,-76,'z'],[-29.4,-112,'z'],[29.4,-84,'z'],[29.4,-98,'z'],[-24,-122.4,'x'],[8,-122.4,'x'],[-22,-64.4,'x'],[23,-64.4,'x']])e6jb(x,z,ax,.18);
  for(const [x,z] of [[-29.6,-81],[29.6,-106],[-14,-88.4]])B(x-.32,.18,z-.32,x+.32,.8,z+.32,'e6spikeB');
  e6gbooth(30.2,-123.2,.18);for(const [x,y,z] of [[-30.4,.18,-92],[29.8,.18,-115.4]]){drum(x,z,y,'drumR');MAP.fires.push([x,y+.9,z]);LIGHT(x,y+1.4,z,'#ff8a3a',8,.9)}
  for(const [x,z] of [[-30.6,-64.2],[30.6,-64.2],[-30.6,-123.4],[30.6,-123.4]])e6flood(x,z,.18);
  // ================= spawns, zones, gates, devices =================
  const PI=Math.PI;
  const A=[[-4.5,0,48.2,PI],[-1.5,0,48.2,PI],[1.5,0,48.2,PI],[4.5,0,48.2,PI],[-3,0,46.4,PI],[0,0,46.4,PI],[3,0,46.4,PI],[-6,0,46.4,PI]];
  const Bs=[[-4.5,0,37.4,0],[-1.5,0,37.4,0],[1.5,0,37.4,0],[4.5,0,37.4,0],[-3,0,35.8,0],[0,0,35.8,0],[3,0,35.8,0],[-6,0,35.8,0]];
  const Cs=[[-4.5,0,.2,0],[-1.5,0,.2,0],[1.5,0,.2,0],[4.5,0,.2,0],[-3,0,-1.4,0],[0,0,-1.4,0],[3,0,-1.4,0],[-6,0,-1.4,0]];
  const Ds=[[-4.5,.2,-65.1,0],[-1.5,.2,-65.1,0],[1.5,.2,-65.1,0],[4.5,.2,-65.1,0],[-3,.2,-64.2,0],[0,.2,-64.2,0],[3,.2,-64.2,0],[-6,.2,-64.2,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-22.4,75.2],[-11.4,75.4],[.6,75.4],[12.6,75.2],[23.6,75],[-24.6,57.6],[24.6,57.6],[-24.6,44.4],[24.6,45.4]];
  const zB=[[-13.1,33],[13.1,29],[-13.1,20.6],[13.1,16.4],[-13.1,12.6],[13.1,8.4],[-13.1,7.4]];
  const zC=[[-13.1,-4],[13.1,-9],[-13.1,-23.6],[13.1,-37],[-13.1,-33.4],[13.1,-47.6],[-13.1,-57],[13.1,-58.4]];
  const zD=[[-30.4,-123.6,.2],[30.4,-120.8,.2],[-30.6,-64,.2],[30.6,-66.6,.2],[0,-123.2,.2],[-30.6,-97,.2],[30.6,-93,.2],[-20,-123.2,.2]];
  MAP.zspawns=[].concat(zA,zB,zC,zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-26.4,40.6,26.4,77],start:A,zsp:zA},B:{box:[-14,6.2,14,40],start:Bs,zsp:zB},C:{box:[-14,-60,14,5.4],start:Cs,zsp:zC},D:{box:[-32,-125,32,-61.8],start:Ds,zsp:zD}},
    door:{A:[0,1.5,40.3],B:[0,1.5,4],C:[0,1.5,-62.3]},
    // stage 2: a charge on each part of the barricade (10 s each, any order)
    c4:[dv(-8,0,5.9,['폭약 1 · 버스','Charge 1 · the coach'],['폭약 설치','plant the charge'],10,0,.6),dv(1,0,6,['폭약 2 · 컨테이너','Charge 2 · the container'],['폭약 설치','plant the charge'],10,0,.6),
      dv(9.4,0,5.8,['폭약 3 · 군용 트럭','Charge 3 · the army truck'],['폭약 설치','plant the charge'],10,0,.6)],
    // stage 3: everybody to the checkpoint gate; TESTUDO's lane down the middle meanwhile
    goal:{c:{box:[-14,-60,14,-53],p:[0,0,-56.5],n:['북단 검문소 정문','The checkpoint gate']}},
    laneC:{x:0,z0:-50,z1:-12},
    // the boss fight: TESTUDO's road (nodes [x, z], edges), the spike-strip cases (bx, bz) and where each strip lies across the road,
    // its start, where its wreck lies on a replay of phase 2 or 3 if it burnt out nowhere, the fuel bowser, LEGATUS's perches and cover
    road:{n:[[-25,-69],[25,-69],[25,-93.5],[25,-118],[-25,-118],[-25,-93.5]],e:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,2]]},
    spikes:[{bx:-29.6,bz:-81,x0:-28.4,x1:-21.6,z0:-81.4,z1:-80.6},{bx:29.6,bz:-106,x0:21.6,x1:28.4,z0:-106.4,z1:-105.6},{bx:-14,bz:-88.4,x0:-14.4,x1:-13.6,z0:-96.9,z1:-90.1}],
    apc:{x:0,z:-118,yaw:PI/2},apcC:{x:0,z:-52,yaw:PI},wreck:{x:-25,z:-101,yaw:0},fuel:{x:-3.7,y:1.9,z:-103.2},
    perch:[{x:-17.9,y:5.38,z:-111.4},{x:14,y:3.4,z:-84},{x:-14.9,y:2.78,z:-111.4}],
    cover:[[-12,.18,-77.2],[-3,.18,-86.4],[2.4,.18,-77.2],[6.6,.18,-84],[-17,.18,-83],[17,.18,-77.4],[-9,.18,-80.6],[0,.18,-88.2],
      [-8,.18,-100.4],[-12,.18,-106],[6,.18,-104.8],[14,.18,-100.2],[16,.18,-109],[-4,.18,-111.6],[0,.18,-106.2],[-19.4,.18,-100.6],
      [-30.2,.18,-80],[30.2,.18,-100],[-30.2,.18,-110],[30.2,.18,-76]],
    pad:[0,0,-93.5]};
  MAP.camps=[{k:'a',w:.2,p:[[0,0,47],[-2,0,47]],look:[0,1,66]},{k:'b',w:.2,p:[[0,0,20]],look:[0,1,6]},{k:'c',w:.2,p:[[0,0,-30]],look:[0,1,-55]},{k:'d',w:.2,p:[[0,.2,-80]],look:[0,1,-100]}];
  MAP.moon={d:new THREE.Vector3(.62,.3,.72).normalize(),c:new THREE.Color('#c89a86'),i:.5};MAP.spawnYaw=PI;
  MAP.cam=(t,cam)=>{const a=t*.035;cam.position.set(Math.sin(a)*34,13,-32+Math.cos(a)*34);cam.lookAt(0,10,-32)}}
// ---------- the meshes boxes cannot make: the river and its banks, the stay cables, the pylon's red lamps (glows over the fog) ----------
const E6GLOW={L:[]};
function ep6Mesh(scene){
  const put=(g,tex,emis,col)=>{const n=g.attributes.position.count;g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3).fill(col==null?1:col),3));const m=new THREE.Mesh(g,matWorld(TEX[tex],{emis:emis||0}));m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);MAP.meshes.push(m);return m};
  const plane=(w,d,x,y,z,ru,rv)=>{const g=new THREE.PlaneGeometry(w,d,1,1);g.rotateX(-Math.PI/2);g.translate(x,y,z);const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*ru,U.getY(i)*rv);return g};
  put(plane(1200,560,0,-24,-10,40,19),'e6water',.3);
  put(plane(1200,340,0,-.3,208,40,11),'e6bank',.1,.85);put(plane(1200,340,0,-.3,-232,40,11),'e6bank',.1,.85);
  // the banks' faces down to the water (the south one faces north, the north one south)
  for(const [z,ry] of [[38.2,Math.PI],[-62.2,0]]){const g=new THREE.PlaneGeometry(1200,23.7,1,1);g.rotateY(ry);g.translate(0,-12.15,z);const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*60,U.getY(i)*2);put(g,'e6bank',.06,.55)}
  // the stay cables: eight a side each way, from the pylon's legs down to the deck's edges
  {const pos=[],nrm=[],uv=[],v=new THREE.Vector3(),q=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0),dir=new THREE.Vector3(),one=new THREE.Vector3(1,1,1),m4=new THREE.Matrix4();
    const cable=(ax,ay,az,bx,by,bz)=>{dir.set(bx-ax,by-ay,bz-az);const L=dir.length();dir.normalize();q.setFromUnitVectors(up,dir);m4.compose(v.set((ax+bx)/2,(ay+by)/2,(az+bz)/2),q,one);
      const g=new THREE.CylinderGeometry(.075,.075,L,5,1,true).toNonIndexed();g.applyMatrix4(m4);const P=g.attributes.position.array,N=g.attributes.normal.array,U=g.attributes.uv.array;
      for(let i=0;i<P.length;i++){pos.push(P[i]);nrm.push(N[i])}for(let i=0;i<U.length;i+=2)uv.push(U[i]*.5,U[i+1]*L);g.dispose()};
    for(const sd of [-1,1])for(let k=0;k<8;k++){const y=35+k*2.3,off=6.5+k*3.1;for(const dz of [-1,1])cable(sd*15.6,y,-32+dz*.9,sd*14.45,1.15,-32+dz*off)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));put(g,'e6cable',.05,.85)}
  E6GLOW.L=[];const tex=E6GLOW.tex||(E6GLOW.tex=(()=>{const [cv,x]=mkCanvas(64,64);const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,90,60,1)');gr.addColorStop(.25,'rgba(255,40,20,.6)');gr.addColorStop(1,'rgba(255,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)})());
  for(const [x,y,z,s,ph] of [[-16.9,60.7,-32,6,0],[16.9,60.7,-32,6,.6],[-16.9,31,-29.8,3.4,1.2],[16.9,31,-29.8,3.4,1.8]]){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xffffff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(x,y,z);sp.scale.set(s,s,1);sp.renderOrder=5;scene.add(sp);MAP.meshes.push(sp);E6GLOW.L.push({sp,ph,s})}}
MAPDEFS.ep6={n:['제1 봉쇄선 북문대교','North Gate Bridge, Line 1'],d:['눈 내리는 새벽, Q-7 북쪽 강을 건너는 고속도로 대교. 남단 요금소 → 대교 진입로 → 대교 본선 → 북단 검문소.','A snowy dawn on the motorway bridge north out of Q-7: the south toll plaza, the approach, the main span, then the north checkpoint.'],
  env:{sky:1,skyTex:'e6sky',noStars:1,snow:1,fog:'#28323f',fogD:.022,skyFog:.5,halo:'#c88a6a',ambOut:'#3a4656',ambIn:'#262c36',boAmb:.5},bounds:[-34,-127,34,79],probeY:[-.4,.9,2.4,4.2,6.4,9],
  build:buildEp6,tex:bakeEp6Tex,mesh:ep6Mesh,ep:6};

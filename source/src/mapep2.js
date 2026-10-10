'use strict';
// ============ Chapter 2 map "봉쇄선 전방기지" (Containment-Line Forward Base 7): four zones played in order ============
// A  highway checkpoint (outdoors)        x -72..-32  z -15..15  → the base's main gate (gate gA)
// B  motor pool + container barracks       x -32..18   z -15..20  → the inner gate (gate gB)
// C  command tents + comms                 x 18..58    z -15..15  → the plaza gate in its north wall (gate gC)
// D  watchtower plaza + helipad            x -10..50   z -75..-15 ← four 8 m watchtowers at the corners, four floodlight poles at the sides
// A rainy night with lightning; the base has no power until the generators in B run again (episode.js EP.pow). RT-1 dug in here before
// it went into Q-7: its sniper ARGUS still holds the towers. Gates are boxes drawn as their own meshes and solid until opened.
Object.assign(MATS,{
  e2tw:{t:'e2tw',uv:'boxV',s:1.2,k:'stone'},e2grav:{t:'e2grav',s:2.5,k:'soft'},e2pad:{t:'e2pad',s:4,k:'stone'},e2heliM:{t:'e2heliM',uv:'box',k:'stone'},
  e2mil:{t:'e2mil',s:2,k:'metal'},e2milD:{t:'e2milD',s:2,k:'metal'},e2tarp:{t:'e2tarp',s:2,k:'soft'},e2can:{t:'e2can',s:2,k:'soft'},e2canD:{t:'e2canD',s:2,k:'soft'},
  e2shed:{t:'e2shed',s:2,k:'metal'},e2gen:{t:'e2gen',uv:'box',emis:.35,k:'metal'},e2tank:{t:'e2tank',uv:'boxV',s:7.6,k:'metal'},e2heli:{t:'e2heli',s:3,k:'metal'},
  e2board:{t:'e2board',uv:'box',emis:.08,k:'wood'},e2lap:{t:'e2lap',uv:'box',emis:.85,k:'glass'},e2crate:{t:'e2crate',uv:'box',k:'wood'},e2flood:{t:'e2flood',uv:'box',emis:.25,k:'metal'},
  e2wood:{t:'e2wood',s:2,k:'wood'},e2net:{t:'e2net',s:2,k:'soft'},e2wall:{t:'e2wall',s:3,k:'stone'},e2road:{t:'e2road',s:4,k:'stone'},e2spike:{t:'e2spike',s:1,k:'metal'},
  e2sBase:{t:'e2sBase',uv:'box',emis:.3,k:'metal'},e2sNo:{t:'e2sNo',uv:'box',emis:.25,k:'metal'},e2sPool:{t:'e2sPool',uv:'box',emis:.25,k:'metal'},
  e2sCmd:{t:'e2sCmd',uv:'box',emis:.25,k:'metal'},e2sPad:{t:'e2sPad',uv:'box',emis:.25,k:'metal'},e2sFuel:{t:'e2sFuel',uv:'box',emis:.2,k:'metal'},e2cont:{t:'e2cont',uv:'boxV',s:6,k:'metal'},
});
// ---------- textures (painted on first load) ----------
function texE2TW(){const W=128,H=TN;return paint(W,H,P=>{
  // a precast T-wall leaf: cast concrete with form lines, a yellow-black foot band, rain streaks and a stencilled number
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let t=P.n(x,y,40,2011,4)*1.05+(hash2(x,y,2012)-.5)*.08;let c=dith(P,x,y,t,['#56564e','#616158','#6c6c62','#77776c','#828276'],.1);
    if(x<2||x>W-3)c=dk(c,.25);if(y%64===0)c=dk(c,.1);if(y>H-22)c=((Math.floor((x+(H-y))/12))%2)?'#c8a020':'#1c1c1a';if(hash2(x,y,2013)<.02)c=dk(c,.2);P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,2014)*W),2,40+Math.floor(hash2(i,2,2014)*140),.14,1);
  P.post=ctx=>{ctx.fillStyle='rgba(30,30,28,.75)';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText('B7',W/2,H*.32)}})}
function texE2Grav(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const h=hash2(x>>1,y>>1,2021),t=P.n(x,y,24,2022,3)*.8+h*.35;let c=dith(P,x,y,t,['#2a2a26','#34342e','#3e3d36','#48463e','#525046','#5c594e'],.15);
    if(h>.93)c=lt(c,.2);else if(h<.06)c=dk(c,.25);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,2023)*N,hash2(i,2,2023)*N,14+hash2(i,3,2023)*26,10+hash2(i,4,2023)*18,.25,2024+i)})}
function texE2Pad(){const N=TN*2;return paint(N,N,P=>{
  // poured concrete in 4 m bays, dark expansion joints, oil spots, tyre marks
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,60,2031,4)*1.1-.05+(hash2(x,y,2032)-.5)*.07;let c=dith(P,x,y,t,['#3e3f3c','#474844','#51524d','#5a5b56','#64655f'],.1);
    if(x%256<3||y%256<3)c='#262724';P.set(x,y,c)}
  for(let i=0;i<10;i++)stain(P,hash2(i,1,2033)*N,hash2(i,2,2033)*N,8+hash2(i,3,2033)*26,6+hash2(i,4,2033)*18,.35,2034+i);
  for(let k=0;k<2;k++)for(let y=0;y<N;y++){const x=Math.round(120+k*24+Math.sin(y*.012+k)*30);for(let w=0;w<8;w++)P.mul(x+w,y,.86)}})}
function texE2HeliM(){const N=512;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,2041,3)+(hash2(x,y,2042)-.5)*.08;P.set(x,y,dith(P,x,y,t,['#33352f','#3b3d37','#44463f','#4c4e47'],.1))}
  P.post=ctx=>{ctx.strokeStyle='rgba(220,210,170,.85)';ctx.lineWidth=22;ctx.beginPath();ctx.arc(N/2,N/2,N*.38,0,TAU);ctx.stroke();ctx.fillStyle='rgba(220,210,170,.88)';
    ctx.fillRect(N*.33,N*.26,N*.08,N*.48);ctx.fillRect(N*.59,N*.26,N*.08,N*.48);ctx.fillRect(N*.33,N*.46,N*.34,N*.08);
    ctx.fillStyle='rgba(20,20,18,.35)';for(let i=0;i<40;i++){const a=hash2(i,1,2043)*TAU,r=hash2(i,2,2043)*N*.45;ctx.fillRect(N/2+Math.cos(a)*r,N/2+Math.sin(a)*r,8+hash2(i,3,2043)*24,6)}}})}
function texE2Shed(){const N=TN;return paint(N,N,P=>{
  // corrugated galvanised sheet: vertical ribs, rust bleeding from the rivet lines, a darker lower edge where the rain splashes
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.sin(x/N*TAU*16);let c=mix('#7a7e7c','#5a5e5c',clamp(.5+r*.35+(P.n(x,y,30,2051,3)-.5)*.6,0,1));
    const rs=P.n(x,y,16,2052,3);if(rs>.62)c=mix(c,'#7a4a24',clamp((rs-.62)*3,0,.8));if(y%128<3)c=dk(c,.25);P.set(x,y,c)}
  for(let i=0;i<30;i++)streak(P,Math.floor(hash2(i,1,2053)*N),Math.floor(hash2(i,2,2053)*N),20+Math.floor(hash2(i,3,2053)*80),.12,1)})}
function texE2Gen(){const W=256,H=192;return paint(W,H,P=>{
  // a towed diesel generator's control side: olive panel, louvres, two gauges, a breaker row, a red / green lamp, a stencil
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4e5638','#3e462c',P.n(x,y,24,2061,3));if(x<6||y<6||x>=W-6||y>=H-6)c='#2a2e20';
    if(x>150&&x<238&&y>24&&y<170&&((y-24)%12)<6)c='#1e2218';if(hash2(x,y,2062)<.04)c=dk(c,.15);P.set(x,y,c)}
  P.rect(18,24,112,80,'#1c1e18');
  P.post=ctx=>{for(const [cx,cy] of [[44,56],[100,56]]){ctx.fillStyle='#d8d8c8';ctx.beginPath();ctx.arc(cx,cy,20,0,TAU);ctx.fill();ctx.strokeStyle='#1a1a1a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+12,cy-10);ctx.stroke()}
    ctx.fillStyle='#ff3020';ctx.beginPath();ctx.arc(34,124,7,0,TAU);ctx.fill();ctx.fillStyle='#30d040';ctx.beginPath();ctx.arc(58,124,7,0,TAU);ctx.fill();
    for(let i=0;i<5;i++){ctx.fillStyle='#141410';ctx.fillRect(80+i*12,116,8,18);ctx.fillStyle='#c8c8b8';ctx.fillRect(81+i*12,118,6,6)}
    ctx.fillStyle='rgba(220,210,160,.85)';ctx.font='bold 20px monospace';ctx.fillText('GEN · 60kW',22,166);ctx.font='bold 12px sans-serif';ctx.fillText('발전기',22,182)}})}
function texE2Tank(){const W=TN*2,H=TN;return paint(W,H,P=>{
  // a fuel bowser's tank: dirty white with an olive band, a flammable diamond and the word for it
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#b8b8a8','#9a9a8c',P.n(x,y,40,2071,3));if(y>H*.42&&y<H*.58)c='#4e5638';if(hash2(x,y,2072)<.05)c=dk(c,.1);P.set(x,y,c)}
  for(let i=0;i<24;i++)streak(P,Math.floor(hash2(i,1,2073)*W),2,30+Math.floor(hash2(i,2,2073)*120),.12,2);
  P.post=ctx=>{ctx.save();ctx.translate(W*.25,H*.24);ctx.rotate(Math.PI/4);ctx.fillStyle='#d83020';ctx.fillRect(-26,-26,52,52);ctx.restore();ctx.fillStyle='#141414';ctx.font='bold 18px sans-serif';ctx.fillText('3',W*.25-5,H*.24+7);
    ctx.fillStyle='#202020';ctx.font='bold 34px sans-serif';ctx.fillText('인화성 · FLAMMABLE',W*.36,H*.3);ctx.font='bold 22px sans-serif';ctx.fillText('JP-8',W*.75,H*.82)}})}
function texE2Heli(){const N=TN;return paint(N,N,P=>{
  // a utility helicopter's skin: matte olive, riveted panel lines, scorched where it burned
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#46503a','#38402c',P.n(x,y,32,2081,3));if(x%96<2||y%72<2)c=dk(c,.3);if((x%96)%12===6&&y%72===4)c='#7a8068';
    const s=P.n(x,y,20,2082,3);if(s>.64)c=mix(c,'#141210',clamp((s-.64)*3,0,.85));P.set(x,y,c)}})}
function texE2Board(){const W=256,H=192;return paint(W,H,P=>{
  // RT-1's briefing board: a map of the Q-7 sector, red string between pins, photos, a handwritten note
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#c8bc98','#b0a480',P.n(x,y,20,2091,2));if(x<6||y<6||x>=W-6||y>=H-6)c='#3a2e20';P.set(x,y,c)}
  P.rect(14,14,140,110,'#8aa078');
  P.post=ctx=>{ctx.strokeStyle='rgba(40,60,40,.7)';ctx.lineWidth=2;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(14,20+i*18);ctx.bezierCurveTo(60,30+i*16,90,10+i*18,154,24+i*17);ctx.stroke()}
    ctx.fillStyle='#d83020';ctx.fillRect(40,40,8,8);ctx.fillRect(110,80,8,8);ctx.fillRect(78,104,8,8);ctx.strokeStyle='#c02010';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(44,44);ctx.lineTo(114,84);ctx.lineTo(82,108);ctx.stroke();
    for(const [x,y] of [[170,18],[206,18],[170,72],[206,72]]){ctx.fillStyle='#e8e4d8';ctx.fillRect(x,y,32,44);ctx.fillStyle='#4a4840';ctx.fillRect(x+3,y+3,26,30)}
    ctx.fillStyle='#1a1a1a';ctx.font='bold 13px sans-serif';ctx.fillText('RT-1 작전 · Q-7 진입',14,146);ctx.font='11px sans-serif';ctx.fillText('ARGUS → 감시탑 엄호',14,162);ctx.fillText('LYREBIRD → 통신 / LEGATUS 지휘',14,177)}})}
function texE2Lap(){const W=128,H=96;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=y%3?'#081a10':'#06140c';if(x<4||y<4||x>=W-4||y>=H-4)c='#16181a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#5aff8a';ctx.font='bold 10px monospace';ctx.fillText('RT-1 MISSION LOG',8,16);ctx.fillText('> 04:12 ENTER Q-7',8,30);ctx.fillText('> 04:40 RT1-07 LOST',8,44);
    ctx.fillStyle='#ff6a4a';ctx.fillText('> SUPPRESSANT FAIL',8,58);ctx.fillStyle='#5aff8a';ctx.strokeStyle='#5aff8a';ctx.strokeRect(8,68,112,10);ctx.fillRect(10,70,30,6)}})}
function texE2Crate(){const W=128,H=128;return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5232','#3a4226',P.n(x,y,16,2101,2));if(y%32<2)c=dk(c,.3);if(x<5||x>=W-5||y<5||y>=H-5)c='#2a2e1c';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='rgba(220,210,170,.8)';ctx.font='bold 16px monospace';ctx.fillText('RT-1',38,52);ctx.font='bold 11px monospace';ctx.fillText('5.56 · 1680',30,74)}})}
function texE2Flood(){const W=128,H=160;return paint(W,H,P=>{
  // the floodlight's control box: yellow and black, a big swing lever, a warning
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#c89a1a','#a07a14',P.n(x,y,24,2111,2));if(x<5||y<5||x>=W-5||y>=H-5)c='#2a2a2a';if(y>H-24)c=((Math.floor((x+y)/10))%2)?'#d0a818':'#1a1a1a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1a1a1a';ctx.fillRect(54,30,20,70);ctx.fillStyle='#d83020';ctx.beginPath();ctx.arc(64,30,12,0,TAU);ctx.fill();
    ctx.fillStyle='#141414';ctx.font='bold 13px sans-serif';ctx.fillText('투광등 회전',22,118);ctx.font='bold 10px sans-serif';ctx.fillText('FLOODLIGHT',30,130)}})}
function texE2Wood(){const N=TN;return paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(y/32);let c=mix('#5a4a34','#4a3c28',clamp(P.n(x*.3,y*3,30,2121+pl,3)*1.2-.1,0,1));if(y%32<2)c='#2a2016';if(hash2(x,pl,2122)<.01)c='#1a140c';P.set(x,y,c)}})}
function texE2Net(){const N=TN;return paint(N,N,P=>{
  // camouflage netting: leafy scrim in three greens and a brown, gaps of dark showing through
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=P.n(x,y,18,2131,3),g=P.n(x,y,6,2132,2);let c=t>.62?'#5a5e36':t>.48?'#3e4a2a':t>.36?'#4e3e26':'#2a3220';if(g<.3)c='#121410';P.set(x,y,c)}})}
function texE2Wall(){const N=TN;return paint(N,N,P=>{
  // the base's perimeter: sprayed concrete with rebar ties, moss at the foot, rain streaks
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,50,2141,4)*1.1-.05+(hash2(x,y,2142)-.5)*.06;let c=dith(P,x,y,t,['#4a4b46','#53544e','#5c5d56','#65665e','#6e6f66'],.1);
    if(y>N-30){const m=P.n(x,y,10,2143,2);if(m>.5)c=mix(c,'#3a4626',clamp((m-.5)*2,0,.7))}if(x%128<2)c=dk(c,.2);P.set(x,y,c)}
  for(let i=0;i<20;i++)streak(P,Math.floor(hash2(i,1,2144)*N),2,40+Math.floor(hash2(i,2,2144)*160),.12,1)})}
function texE2Road(){const N=TN*2;return paint(N,N,P=>{
  // a wet highway: dark asphalt, a dashed centre line every 4 m, puddle sheen, patched cracks
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=P.n(x,y,40,2151,3)*.9+(hash2(x,y,2152)-.5)*.12;let c=dith(P,x,y,t,['#18191b','#1e1f21','#242527','#2a2b2c','#303131'],.12);
    if(Math.abs(y-N/2)<5&&(x%256)<150)c=mix('#c8c0a0','#9a9278',P.n(x,y,8,2153,2));const w=P.n(x,y,30,2154,3);if(w>.68)c=mix(c,'#4a5060',clamp((w-.68)*2.5,0,.5));P.set(x,y,c)}
  for(let i=0;i<8;i++)crack(P,Math.floor(hash2(i,1,2155)*N),Math.floor(hash2(i,2,2155)*N),60,2156+i,'#0e0e10',null)})}
function texE2Spike(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=(x%16<8)?'#2a2a2a':'#5a5a5a';if((x%16===3||x%16===11)&&y%32<12)c='#c8c8c8';P.set(x,y,c)}})}
function bakeEp2Tex(){if(TEX.e2tw)return;
  TEX.e2tw=mkTex(texE2TW());TEX.e2grav=mkTex(texE2Grav());TEX.e2pad=mkTex(texE2Pad());TEX.e2heliM=mkTex(texE2HeliM(),false);TEX.e2mil=mkTex(texCarPaint('#4a5236',0));TEX.e2milD=mkTex(texCarPaint('#363c2a',0));
  TEX.e2tarp=mkTex(texCanvas('#3e4a30',701));TEX.e2can=mkTex(texCanvas('#525a3a',702));TEX.e2canD=mkTex(texCanvas('#2e3424',703));TEX.e2shed=mkTex(texE2Shed());TEX.e2gen=mkTex(texE2Gen(),false);
  TEX.e2tank=mkTex(texE2Tank());TEX.e2heli=mkTex(texE2Heli());TEX.e2board=mkTex(texE2Board(),false);TEX.e2lap=mkTex(texE2Lap(),false);TEX.e2crate=mkTex(texE2Crate(),false);TEX.e2flood=mkTex(texE2Flood(),false);
  TEX.e2wood=mkTex(texE2Wood());TEX.e2net=mkTex(texE2Net());TEX.e2wall=mkTex(texE2Wall());TEX.e2road=mkTex(texE2Road());TEX.e2spike=mkTex(texE2Spike());TEX.e2cont=mkTex(texContainer('#3e4a30','RT-1'));
  TEX.e2sBase=mkTex(texSign([{t:'제7 봉쇄선 전방기지'},{t:'CONTAINMENT LINE · FORWARD BASE 7',s:7}],'#2a3220','#e8e4c8',192,40),false);
  TEX.e2sNo=mkTex(texSign([{t:'봉쇄 구역 · 출입 금지'},{t:'RESTRICTED ZONE · DEADLY FORCE',s:7}],'#b82018','#ffffff',160,36),false);
  TEX.e2sPool=mkTex(texSign([{t:'차량 정비장'},{t:'MOTOR POOL',s:8}],'#2a3220','#e8e4c8',112,30),false);
  TEX.e2sCmd=mkTex(texSign([{t:'지휘소 · 통신'},{t:'COMMAND POST',s:8}],'#2a3220','#e8e4c8',112,30),false);
  TEX.e2sPad=mkTex(texSign([{t:'감시탑 광장 · 헬기장'},{t:'HELIPAD · TOWERS',s:7}],'#2a3220','#e8e4c8',128,30),false);
  TEX.e2sFuel=mkTex(texSign([{t:'유류 저장 · 화기 엄금'},{t:'FUEL · NO NAKED FLAMES',s:7}],'#c8a020','#141414',128,30),false)}
// ---------- geometry helpers ----------
// a run of n precast T-wall leaves (1.2 m each) from x0,z0 along the axis; h tall
function e2tw(x0,z0,ax,n,h){h=h||3.6;for(let i=0;i<n;i++){const a=i*1.2;
  if(ax==='x'){B(x0+a,0,z0-.42,x0+a+1.18,.5,z0+.42,'e2tw');B(x0+a,.5,z0-.16,x0+a+1.18,h,z0+.16,'e2tw')}
  else{B(x0-.42,0,z0+a,x0+.42,.5,z0+a+1.18,'e2tw');B(x0-.16,.5,z0+a,x0+.16,h,z0+a+1.18,'e2tw')}}}
// an 8 m watchtower: four legs, a planked platform, a sandbag parapet, a tin roof, a red lamp (ARGUS's perch; no way up for the team)
function e2tower(x,z,red){const h=8,nz={nosolid:true};for(const [dx,dz] of [[-1.5,-1.5],[1.5,-1.5],[-1.5,1.5],[1.5,1.5]])B(x+dx-.13,0,z+dz-.13,x+dx+.13,h,z+dz+.13,'metal2');
  for(const y of [2.7,5.4]){B(x-1.5,y,z-1.52,x+1.5,y+.1,z-1.48,'metal2',nz);B(x-1.5,y,z+1.48,x+1.5,y+.1,z+1.52,'metal2',nz);B(x-1.52,y,z-1.5,x-1.48,y+.1,z+1.5,'metal2',nz);B(x+1.48,y,z-1.5,x+1.52,y+.1,z+1.5,'metal2',nz)}
  B(x-1.9,h-.25,z-1.9,x+1.9,h,z+1.9,'e2wood');
  B(x-1.9,h,z-1.9,x+1.9,h+.95,z-1.55,'sandbag');B(x-1.9,h,z+1.55,x+1.9,h+.95,z+1.9,'sandbag');B(x-1.9,h,z-1.55,x-1.55,h+.95,z+1.55,'sandbag');B(x+1.55,h,z-1.55,x+1.9,h+.95,z+1.55,'sandbag');
  for(const [dx,dz] of [[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])B(x+dx-.06,h+.95,z+dz-.06,x+dx+.06,h+2.9,z+dz+.06,'metal2',nz);
  B(x-2.1,h+2.9,z-2.1,x+2.1,h+3.1,z+2.1,'e2shed',{f:{ny:'e2wood'}});B(x-.15,h+3.1,z-.15,x+.15,h+3.35,z+.15,red?'lampR':'lampO',nz);LIGHT(x,h+3.6,z,red?'#ff3a2a':'#ffb060',6,.55);
  B(x+1.5,0,z-.3,x+1.56,h,z+.3,'metal2',nz)}// (a ladder rail, for looks)
// a floodlight pole: the head on top is a separate mesh that swings (argus.js FLOOD); the control box faces the plaza
function e2pole(x,z,fx,fz){B(x-.18,0,z-.18,x+.18,6.2,z+.18,'metal2');B(x-.7,6.2,z-.12,x+.7,6.35,z+.12,'metal2',{nosolid:true});
  const bx=x+fx*.55,bz=z+fz*.55,f={};f[fx>0?'px':fx<0?'nx':fz>0?'pz':'nz']='e2flood';B(bx-.38,0,bz-.38,bx+.38,1.25,bz+.38,'metal',{f});}
// a military cargo truck (axis 'x' or 'z', cab at the high end): cab, bed with a canvas cover over hoops, wheels
function e2truck(x0,z0,ax,o){o=o||{};const L=7.2,W=2.4,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,y0,z0+c0,x0+a1,y1,z0+c1,m,oo):B(x0+c0,y0,z0+a0,x0+c1,y1,z0+a1,m,oo);
  LB(.2,L-.2,.15,W-.15,.6,1.15,'e2milD');LB(L-2,L-.1,.1,W-.1,1.15,2.55,'e2mil');LB(L-.12,L-.08,.3,W-.3,1.7,2.35,'carGl',{nosolid:true});
  LB(.2,L-2.2,.05,W-.05,1.15,1.6,'e2mil');if(!o.open)LB(.2,L-2.2,.05,W-.05,1.6,3.05,'e2tarp');else LB(.2,.32,.05,W-.05,1.6,3.05,'e2tarp');
  for(const a of [.6,1.9,L-1.4])for(const c of [-.04,W-.36])LB(a,a+.85,c,c+.4,0,.9,'tire')}
// a towed generator: skid, olive box, control panel on one face, exhaust stack
function e2gen(x,z,face){const f={};f[face]='e2gen';B(x-1.15,0,z-.75,x+1.15,.18,z+.75,'metal2');B(x-1.1,.18,z-.7,x+1.1,1.7,z+.7,'e2mil',{f});
  B(x-.75,1.7,z-.12,x-.55,2.4,z+.12,'pipe');B(x+.3,1.7,z-.5,x+.9,1.85,z+.5,'metal2')}
// a stack of sandbags along the axis
function e2sand(x0,z0,ax,len,h){h=h||1.05;if(ax==='x')B(x0,0,z0-.35,x0+len,h,z0+.35,'sandbag');else B(x0-.35,0,z0,x0+.35,h,z0+len,'sandbag')}
function e2crate(x,z,s,y){s=s||1.1;y=y||0;return B(x-s/2,y,z-s/2,x+s/2,y+s,z+s/2,'e2crate')}
function buildEp2(){
  const nz={nosolid:true};
  // ================= zone A: the highway checkpoint =================
  B(-74,-1,-5,-32,0,5,'e2road',{ground:1});B(-74,-1,-15,-32,0,-5,'e2grav',{ground:1});B(-74,-1,5,-32,0,15,'e2grav',{ground:1});
  // T-walls north and south with a breach each side (the infected come through), the highway blocked to the west by a pile-up
  e2tw(-72,-15.4,'x',8);e2tw(-61.2,-15.4,'x',12);e2tw(-44.4,-15.4,'x',10);
  e2tw(-72,15.4,'x',6);e2tw(-63.6,15.4,'x',12);e2tw(-46.8,15.4,'x',12);
  for(const [x0,z0,z1] of [[-62.4,-19,-15.8],[-46.8,-19,-15.8]]){B(x0,-1,z0,x0+2.4,0,z1+.4,'e2grav',{ground:1});B(x0-.3,0,z0-.3,x0+2.7,3.6,z0,'e2wall');B(x0-.3,0,z0,x0,3.6,z1,'e2wall');B(x0+2.4,0,z0,x0+2.7,3.6,z1,'e2wall')}
  for(const [x0,z0,z1] of [[-65,15.8,19],[-49.2,15.8,19]]){B(x0,-1,z0-.4,x0+2.4,0,z1,'e2grav',{ground:1});B(x0-.3,0,z1,x0+2.7,3.6,z1+.3,'e2wall');B(x0-.3,0,z0,x0,3.6,z1,'e2wall');B(x0+2.4,0,z0,x0+2.7,3.6,z1,'e2wall')}
  B(-74.5,0,-15.8,-74,6,15.8,'e2wall');
  car(-73.6,-4.6,-69.4,-2.8,'carBurnt',{burnt:1});car(-73.4,-1.4,-69,.4,'car');car(-73.8,1.6,-69.6,3.4,'carR');B(-72.6,0,3.6,-70.2,1.3,4.8,'barrier');B(-72.6,0,-6,-70.2,1.3,-4.8,'barrier');
  // abandoned cars along the road, a stalled army truck, the checkpoint arm and booth, a spike strip, a jersey-barrier chicane
  car(-64.5,-4,-60.3,-2.2,'car');car(-57.8,2.2,-53.6,4,'carR');car(-49.5,-3.8,-45.3,-2,'carBurnt',{burnt:1});car(-40.6,1.4,-36.4,3.2,'car');
  e2truck(-47.5,.8,'x');
  B(-52.25,0,-5.6,-51.75,1.3,-5.1,'conc');B(-52.25,0,5.1,-51.75,1.3,5.6,'conc');B(-52.1,.95,-5.1,-51.9,1.15,1.2,'hazard');B(-52.3,1.3,-5.5,-51.7,1.5,-5.2,'lampR',nz);LIGHT(-52,1.8,-5.35,'#ff3a2a',4,.5,{flick:.4});
  wallX(-57.6,-53.6,6.2,6.45,0,2.8,'conc',[[-56.6,-54.6,1.1,2.2]]);wallX(-57.6,-53.6,10.2,10.45,0,2.8,'conc');wallZ(-57.6,-57.35,6.45,10.2,0,2.8,'conc',[[7.4,9.2,1.1,2.2]]);
  wallZ(-53.85,-53.6,6.45,10.2,0,2.8,'conc',[[7.4,8.8,0,2.2]]);B(-57.9,2.8,5.9,-53.3,3.05,10.75,'roof',{f:{ny:'conc'}});B(-57.2,0,9.4,-55.4,.9,10.1,'wood');monitor(-56.8,.9,9.8,-56.2,1.3,9.9,'nz');
  LIGHT(-55.6,2.4,8.3,'#fff0c0',5,.7,{flick:.3});B(-56,2.72,8.1,-55.2,2.8,8.5,'lampW',nz);
  B(-58.4,0,-4.6,-58.2,.04,4.6,'e2spike',nz);
  for(const [x0,z0] of [[-62,-4.2],[-62,2.6],[-44,-4.4],[-38,-5.2],[-38,3.6]])B(x0,0,z0,x0+2.6,.85,z0+.6,'barrier');
  e2sand(-66,-9,'x',3.4);e2sand(-66,-9,'z',2.6);e2sand(-42,8.6,'x',3.6);e2sand(-38.4,8.6,'z',3);
  for(const [x,z] of [[-60,-11],[-59,-10.2],[-36,-11],[-68,11]])drum(x,z,0,hash2(Math.round(x),Math.round(z),3)<.5?'drumR':null);e2crate(-34.6,-9.6);e2crate(-34.6,-8.4,1);e2crate(-35.6,-9,1,1.1);
  for(const [x,z] of [[-60,-3],[-60,3],[-54,-3],[-54,3]])cone(x,z);
  // floodlight poles over the road (powered by the base: dim until the generators run)
  for(const [x,z] of [[-66,-6],[-56,6],[-46,-6],[-36,6]])lamp(x,z,6.2);
  LIGHT(-62,6,0,'#ffd8a0',16,.9);LIGHT(-44,6,0,'#ffd8a0',16,.9);LIGHT(-36,5,-10,'#c8d0e0',10,.6);
  // the base's west wall and its main gate (gA): two steel leaves sliding apart, the base sign above
  B(-32.5,0,-15.8,-31.5,5,-4,'e2wall');B(-32.5,0,4,-31.5,5,15.8,'e2wall');B(-32.5,4.2,-4,-31.5,5,4,'e2wall');
  B(-32.3,0,-4,-31.7,4.2,0,'e2milD',{gate:'gA',gs:[0,0,-3.9]});B(-32.3,0,0,-31.7,4.2,4,'e2milD',{gate:'gA',gs:[0,0,3.9]});B(-32.5,-1,-4,-31.5,0,4,'e2road',{ground:1});
  B(-32.56,4.3,-3.6,-32.5,5.2,3.6,'e2sBase',nz);B(-32.56,2.2,-7.4,-32.5,3.2,-4.6,'e2sNo',nz);LIGHT(-34,4.6,0,'#ffe0b0',9,.8);
  // ================= zone B: the motor pool and the container barracks =================
  B(-31.5,-1,-15,18,0,20,'e2pad',{ground:1});
  B(-31.5,0,19.6,18,4,20.4,'e2wall');B(17.6,0,-15,18.4,4.2,0,'e2wall');B(17.6,0,6,18.4,4.2,20,'e2wall');B(17.6,3.6,0,18.4,4.2,6,'e2wall');
  B(-31.5,0,-15.4,-10.6,4,-14.6,'e2wall');B(-10.6,0,-15.4,18,4.2,-14.6,'e2wall');
  // the maintenance shed (north-west): back and side walls, a tin roof on posts, open to the south; generator 1 against the back
  B(-28,0,-14.6,-16,4.6,-14.3,'e2shed');B(-28.3,0,-14.6,-28,4.6,-5,'e2shed');B(-16,0,-14.6,-15.7,4.6,-9,'e2shed');
  for(const x of [-28.15,-22,-15.85])B(x-.12,0,-5.2,x+.12,4.6,-4.96,'metal2');B(-28.4,4.6,-14.6,-15.6,4.85,-4.8,'e2shed',{f:{ny:'e2shed'}});
  e2gen(-22,-12.8,'pz');B(-20.2,0,-13.8,-18.4,.9,-12.4,'e2crate');e2truck(-27.3,-11.6,'z',{open:1});
  for(const [x,z] of [[-17,-6.5],[-17.6,-6],[-26.5,-6]])drum(x,z,0,'drumR');B(-24,0,-8,-21,1,-7.2,'wood',{f:{py:'metal2'}});
  LIGHT(-25,4.2,-10,'#ffe8c0',8,.8,{flick:.2});LIGHT(-19,4.2,-10,'#ffe8c0',8,.8);B(-25.4,4.5,-10.2,-24.6,4.6,-9.8,'lampW',nz);B(-19.4,4.5,-10.2,-18.6,4.6,-9.8,'lampW',nz);
  B(-28.3,3.4,-5,-27.7,4.2,-4.8,'e2sPool',nz);
  // the container barracks (south): a front row with a balcony on its roof, a back row two high, a steel stair up
  B(-9,0,12.6,-3,2.6,15,'e2cont');B(-2.4,0,12.6,3.6,2.6,15,'e2cont');B(-9,0,15.4,-3,2.6,17.8,'e2cont');B(-9,2.6,15.4,-3,5.2,17.8,'e2cont');B(-2.4,0,15.4,3.6,2.6,17.8,'e2cont');
  stairs('z',-10.6,-9.2,6.4,12.6,0,2.6,10,'plate');q7rail('z',-10.8,-10.6,6.4,12.6,0,2.6,10);B(-9,2.6,12.6,3.6,2.66,15,'plate',nz);
  B(-9,2.66,12.6,3.6,3.66,12.75,'metal2',{rail:1});B(3.45,2.66,12.75,3.6,3.66,15.4,'metal2',{rail:1});
  e2gen(8,15.2,'nz');e2sand(5.6,12.6,'x',5);e2sand(10.6,12.6,'z',4);
  LIGHT(-6,4.4,12,'#ffe0b0',7,.7);LIGHT(0.6,3.2,12.4,'#ffe0b0',6,.6);B(-6.4,4.6,12.5,-5.6,4.7,12.6,'lampW',nz);
  // the fuel point (north-east): a bowser, a bladder, generator 3 behind sandbags, the fuel sign
  B(3.2,.6,-12.6,11.2,3.1,-10.2,'e2tank');B(11.2,.6,-12.6,13.6,2.7,-10.2,'e2mil');B(13.48,1.6,-12.3,13.52,2.4,-10.5,'carGl',nz);for(const x of [4,6.2,10,12.4])for(const z of [-12.75,-10.45])B(x,0,z,x+.9,.9,z+.4,'tire');
  B(3.2,.4,-12.6,13.6,.6,-10.2,'metal2');B(-4,0,-12.8,1.6,.6,-9.4,'e2tarp');B(-8.6,0,-12.6,-7.4,1.2,-11.4,'e2crate');
  e2gen(9,-6.6,'nz');e2sand(6.4,-4.8,'x',5.6);e2sand(6.4,-8.6,'z',3.8);B(13.7,2.4,-12.2,13.75,3,-10.6,'e2sFuel',nz);
  LIGHT(8,4.2,-8,'#ffd8a0',9,.8);
  // trucks, crates and a camo net in the yard
  e2truck(-12.5,-5.2,'x');e2truck(-6,2.6,'x',{open:1});
  for(const [x,z,s] of [[-26,2,1.2],[-24.8,2,1.1],[-25.4,2,1,1.2],[5,4,1.2],[6.2,4,1.1],[-14,10,1.2],[14.6,1.4,1.1],[14.6,2.6,1.1]])e2crate(x,z,s,s===1?1.1:0);
  for(const [x,z] of [[-20,14],[-19.4,14.5],[13,16],[15,-2.5]])drum(x,z);
  B(-13,3,-1,-6,3.06,6,'e2net',nz);for(const [x,z] of [[-13,-1],[-6,-1],[-13,6],[-6,6]])B(x-.06,0,z-.06,x+.06,3,z+.06,'metal2',nz);
  for(const [x,z] of [[-22,8],[2,-2],[12,8]])lamp(x,z,5.6);LIGHT(-22,5.4,8,'#ffd8a0',12,.85);LIGHT(2,5.4,-2,'#ffd8a0',12,.85);LIGHT(12,5.4,8,'#ffd8a0',12,.8);
  // the inner gate (gB) into the command post
  B(17.7,0,0,18.3,3.6,3,'e2milD',{gate:'gB',gs:[0,0,-2.9]});B(17.7,0,3,18.3,3.6,6,'e2milD',{gate:'gB',gs:[0,0,2.9]});B(17.6,-1,0,18.4,0,6,'e2pad',{ground:1});B(17.5,3.7,1.2,17.56,4.15,4.8,'e2sCmd',nz);
  // ================= zone C: the command tents and the comms =================
  B(18.4,-1,-15,58,0,15,'e2grav',{ground:1});
  B(18.4,0,14.6,58.4,4,15.4,'e2wall');B(57.6,0,-15,58.4,4,15,'e2wall');B(50,0,-15.4,58.4,4.2,-14.6,'e2wall');
  // the command tent: canvas walls, a stepped ridge roof, the doorway facing the plaza (north); RT-1's records inside
  {const x0=24,x1=36,z0=3,z1=12,h=3.1,t=.07;wallX(x0,x1,z0,z0+t,0,h,'e2can',[[28.4,31.6,0,2.4]]);wallX(x0,x1,z1-t,z1,0,h,'e2can');wallZ(x0,x0+t,z0+t,z1-t,0,h,'e2can');wallZ(x1-t,x1,z0+t,z1-t,0,h,'e2can');
    const cz=(z0+z1)/2,hw=(z1-z0)/2+.2;B(x0-.15,h,cz-hw,x1+.15,h+.3,cz+hw,'e2can');B(x0-.15,h+.3,cz-hw*.64,x1+.15,h+.6,cz+hw*.64,'e2can');B(x0-.15,h+.6,cz-hw*.3,x1+.15,h+.82,cz+hw*.3,'e2can');
    B(25,0,9.6,29,.8,10.8,'wood',{f:{py:'metal2'}});B(31,0,5.4,35,.8,6.6,'wood',{f:{py:'metal2'}});B(29.2,0,11.3,30.8,2.2,11.8,'e2board');B(26.6,.8,10,27.4,1.3,10.2,'e2lap',nz);
    B(25.4,0,4,26.4,1.6,5,'e2crate');B(34,0,9.8,35.4,1.2,11.6,'metal',{f:{px:'q7rack'}});
    LIGHT(30,2.8,7.5,'#ffe2b0',8,.9,{flick:.15});B(29.7,3.05,7.3,30.3,3.1,7.7,'lampW',nz);B(29.4,2.45,2.95,30.6,2.85,2.98,'e2sCmd',nz)}
  // two smaller tents
  for(const x0 of [40,48]){const x1=x0+6,z0=6.4,z1=12,h=2.6,t=.06;wallX(x0,x1,z0,z0+t,0,h,'e2canD',[[x0+2,x0+4,0,2.1]]);wallX(x0,x1,z1-t,z1,0,h,'e2canD');wallZ(x0,x0+t,z0+t,z1-t,0,h,'e2canD');wallZ(x1-t,x1,z0+t,z1-t,0,h,'e2canD');
    const cz=(z0+z1)/2,hw=(z1-z0)/2+.15;B(x0-.1,h,cz-hw,x1+.1,h+.25,cz+hw,'e2canD');B(x0-.1,h+.25,cz-hw*.5,x1+.1,h+.45,cz+hw*.5,'e2canD');B(x0+.6,0,9,x0+5.4,.45,10.6,'cot',{f:{nx:'metal2',px:'metal2'}})}
  // the comms truck with its mast, the C watchtower in the north-east corner (ARGUS's first perch)
  e2truck(42.4,-11.2,'x');B(42.6,3.05,-10.9,47.4,3.15,-9.1,'metal2',nz);B(48.9,0,-9.3,49.3,12,-8.9,'metal2');for(const y of [4,8,11.6])B(48.2,y,-9.8,50,y+.1,-8.4,'metal2',nz);
  B(48.95,11.9,-9.25,49.25,12.2,-8.95,'lampR',nz);LIGHT(49.1,12.4,-9.1,'#ff3a2a',5,.6,{flick:.5});
  e2tower(54,-11,true);
  // RT-1's field radio on a crate at the comms truck's tailgate (the stage's second record)
  B(40.4,0,-10.3,41.2,.75,-9.1,'e2crate');B(40.5,.75,-10.1,41.1,1.12,-9.35,'metal2',{f:{px:'e2lap'}});B(40.7,1.12,-9.95,40.74,1.9,-9.91,'metal2',nz);
  // supply crates for cover on the way to the tent, sandbags, floodlight poles
  for(const [x,z,s,y] of [[22,-8,1.2],[23.2,-8,1.1],[22.6,-8,1,1.2],[26,-2.4,1.2],[38,-4,1.2],[39.2,-4,1.1],[34,-10,1.2],[35.2,-10.4,1.1],[46,1,1.2],[52,-2,1.2],[52,-.8,1.1],[52,-1.4,1,1.2],[40,12.8,1.1]])e2crate(x,z,s,y);
  e2sand(30.6,-6,'x',4);e2sand(44,4.4,'x',3.6);e2sand(55,2,'z',3.4);
  for(const [x,z] of [[22,12],[46,-2],[56,10]])lamp(x,z,5.8);LIGHT(22,5.6,12,'#ffd8a0',12,.85);LIGHT(46,5.6,-2,'#ffd8a0',12,.85);LIGHT(56,5.6,10,'#ffd8a0',10,.7);
  // ================= zone D: the watchtower plaza and the helipad =================
  B(-10,-1,-75,50,0,-15,'e2pad',{ground:1});
  B(-10.4,0,-75.4,50.4,4.2,-74.6,'e2wall');B(-10.4,0,-75,-9.6,4.2,-15,'e2wall');B(49.6,0,-75,50.4,4.2,-15,'e2wall');B(-10.4,0,-15.4,30,4.2,-14.6,'e2wall');B(38,0,-15.4,50.4,4.2,-14.6,'e2wall');B(30,3.8,-15.4,38,4.2,-14.6,'e2wall');
  // the plaza gate (gC) in the south wall
  B(30,0,-15.3,34,3.8,-14.7,'e2milD',{gate:'gC',gs:[-3.9,0,0]});B(34,0,-15.3,38,3.8,-14.7,'e2milD',{gate:'gC',gs:[3.9,0,0]});B(30,-1,-15.4,38,0,-14.6,'e2pad',{ground:1});
  B(31,4.25,-14.56,37,4.95,-14.5,'e2sPad',nz);B(30.4,2.2,-15.46,33.6,3,-15.4,'e2sNo',nz);
  // the four watchtowers, the four floodlight poles
  e2tower(-6,-71,true);e2tower(46,-71,true);e2tower(-6,-19,true);e2tower(46,-19,true);
  e2pole(20,-73.4,0,1);e2pole(48.4,-45,-1,0);e2pole(20,-16.6,0,-1);e2pole(-8.4,-45,1,0);
  // the helipad (raised, marked), edge lamps
  B(11,0,-54,29,.22,-36,'e2pad');B(11.2,.22,-53.8,28.8,.24,-36.2,'e2heliM',nz);
  for(let i=0;i<12;i++){const a=i/12*TAU,x=20+Math.cos(a)*9.6,z=-45+Math.sin(a)*9.6;B(x-.12,.22,z-.12,x+.12,.4,z+.12,i%3?'lampW':'lampO',nz)}
  // the crashed helicopter (north-east of the pad): fuselage, cockpit glass, tail boom and fin, skids, a broken blade on the ground
  B(26,0,-60,34.4,2.5,-56.2,'e2heli');B(23.6,.3,-59.6,26,2.3,-56.6,'e2heli',{f:{nx:'carGl',py:'carGl'}});B(34.4,1.5,-58.6,42,2.1,-57.6,'e2heli');B(41.4,2.1,-58.5,42,3.6,-57.7,'e2heli');
  B(25,0,-60.6,35,.15,-60.3,'metal2');B(25,0,-55.9,35,.15,-55.6,'metal2');B(29.6,2.5,-58.6,30.8,3,-57.4,'metal2');B(14,0,-63,26,.12,-62.4,'metal2',nz);
  B(26.4,2.5,-59.8,34,2.56,-56.4,'e2heli',nz);
  // T-wall lanes (cover), sandbag posts, a container (a high spot), crates by the gate
  e2tw(2,-62,'x',6);e2tw(31.6,-64,'x',6);e2tw(2,-28,'x',6);e2tw(31.6,-28,'x',6);e2tw(4,-55,'z',5);e2tw(36,-42,'z',5);e2tw(16,-66,'x',4);e2tw(19,-24.4,'x',3);
  B(-3,0,-48.2,3,2.6,-45.8,'e2cont');B(41,0,-36,47,2.6,-33.6,'e2cont');B(41,0,-56,47,2.6,-53.6,'e2cont');
  for(const [x0,z0] of [[8,-46],[30,-46]]){e2sand(x0,z0-1.6,'x',2.4);e2sand(x0,z0-1.6,'z',3.2)}
  e2sand(16,-33,'x',3);e2sand(22,-58,'x',3);
  for(const [x,z,s,y] of [[26,-19,1.2],[27.2,-19,1.1],[26.6,-19,1,1.2],[40,-20,1.2],[41.2,-20.4,1.1],[-1,-30,1.2],[-1,-60,1.2],[44,-62,1.2]])e2crate(x,z,s,y);
  B(-10,4,-75,50,4.06,-74.6,'hazard',nz);
  // light: the plaza is dark by design (the towers' red lamps, a few wall lamps, the pad's edge lamps); the floodlights are dynamic
  for(const [x,z] of [[-9.6,-30],[-9.6,-60],[49.6,-30],[49.6,-60],[10,-74.6],[30,-74.6]]){const fx=x<0?1:x>40?-1:0,fz=z<-70?1:0;B(x-.2+fx*.1,3.4,z-.2+fz*.1,x+.2+fx*.1,3.7,z+.2+fz*.1,'lampO',nz);LIGHT(x+fx*1,3.3,z+fz*1,'#ffb060',9,.55)}
  LIGHT(20,1.2,-45,'#c8ffd0',10,.35);LIGHT(34,3.5,-17.5,'#ffe0b0',8,.6);
  // ================= spawns, zones, gates, devices =================
  const A=[[-66,0,-2,Math.PI/2*-1+Math.PI],[-66,0,0,Math.PI/2*-1+Math.PI],[-66,0,2,Math.PI/2*-1+Math.PI],[-67.6,0,-1,-Math.PI/2],[-67.6,0,1,-Math.PI/2],[-64.6,0,-1,-Math.PI/2],[-64.6,0,1,-Math.PI/2],[-68.8,0,0,-Math.PI/2]];
  for(const s of A)s[3]=-Math.PI/2;
  const Bs=[[-29,0,-1.5,-Math.PI/2],[-29,0,0,-Math.PI/2],[-29,0,1.5,-Math.PI/2],[-27.6,0,-1,-Math.PI/2],[-27.6,0,1,-Math.PI/2],[-30,0,-.8,-Math.PI/2],[-30,0,.8,-Math.PI/2],[-27.6,0,0,-Math.PI/2]];
  const Cs=[[20.6,0,1.6,-Math.PI/2],[20.6,0,3,-Math.PI/2],[20.6,0,4.4,-Math.PI/2],[22,0,2,-Math.PI/2],[22,0,3.8,-Math.PI/2],[22,0,2.9,-Math.PI/2],[23.4,0,2.4,-Math.PI/2],[23.4,0,3.6,-Math.PI/2]];
  const Ds=[[32,0,-18,0],[34,0,-18,0],[36,0,-18,0],[31,0,-19.6,0],[33,0,-19.6,0],[35,0,-19.6,0],[37,0,-19.6,0],[34,0,-21,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-61.2,-17.6],[-45.6,-17.6],[-63.8,17.6],[-48,17.6],[-71,-12],[-71,12],[-35,-12.6],[-35,12.6]];
  const zB=[[-30,-13],[15.6,-12.6],[-30,18],[15.4,18],[-12,18.4],[-17,-13],[10,18]];
  const zC=[[56,-13],[56,13],[40,13.4],[26,13.4],[56.4,0],[44,-13.4]];
  const zD=[[-8,-73],[48,-73],[-8,-35],[48,-52],[20,-73.6],[-8,-58],[48,-28]];
  MAP.zspawns=[].concat(zA,zB,zC,zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-72,-15,-32,15],start:A,zsp:zA},B:{box:[-31.5,-14.6,17.6,19.6],start:Bs,zsp:zB},C:{box:[18.4,-14.6,57.6,14.6],start:Cs,zsp:zC},D:{box:[-9.6,-74.6,49.6,-15.4],start:Ds,zsp:zD}},
    door:{A:[-32,1.5,0],B:[18,1.5,3],C:[34,1.5,-15]},
    // stage 2: three generators (12 s each, any order); stage 3: RT-1's records in the command tent and its radio log in the comms
    // truck under ARGUS's tower (10 s each)
    gen:[dv(-22,0,-11.6,['발전기 1 · 정비고','Generator 1 · shed'],['발전기 재가동','restart the generator'],12,0,.4),dv(8,0,14,['발전기 2 · 막사','Generator 2 · barracks'],['발전기 재가동','restart the generator'],12,0,-.4),
      dv(9,0,-5.4,['발전기 3 · 유류고','Generator 3 · fuel point'],['발전기 재가동','restart the generator'],12,0,.4)],
    rec:[dv(30,0,10.6,['1차 팀 작전 기록 · 지휘 텐트','RT-1 mission records · tent'],['작전 기록 회수','recover the records'],10,0,-.4),
      dv(41.4,0,-9.6,['1차 팀 무전 기록 · 통신 트럭','RT-1 radio log · comms truck'],['무전 기록 회수','pull the radio log'],10,-.4,0)],
    // ARGUS: the C tower (the first meeting), the plaza's four towers (0 NW, 1 NE, 2 SW, 3 SE), the floodlights (0 N, 1 E, 2 S, 3 W)
    towerC:{x:54,y:8,z:-11},
    towers:[{x:-6,y:8,z:-71},{x:46,y:8,z:-71},{x:-6,y:8,z:-19},{x:46,y:8,z:-19}],
    floods:[{x:20,y:6.45,z:-73.4,bx:20,bz:-72.6,reach:[0,1]},{x:48.4,y:6.45,z:-45,bx:47.6,bz:-45,reach:[1,3]},{x:20,y:6.45,z:-16.6,bx:20,bz:-17.4,reach:[2,3]},{x:-8.4,y:6.45,z:-45,bx:-7.6,bz:-45,reach:[0,2]}],
    pad:[20,.22,-45],
    // phase 3 perches (towers, the helicopter's back, the containers' roofs) and phase 2 cover spots (behind the T-walls and the wreck)
    perch:[{x:-6,y:8,z:-71},{x:46,y:8,z:-71},{x:-6,y:8,z:-19},{x:46,y:8,z:-19},{x:30,y:2.56,z:-58.2},{x:0,y:2.6,z:-47},{x:44,y:2.6,z:-34.8},{x:44,y:2.6,z:-54.8}],
    cover:[[5.6,0,-64],[35.2,0,-66],[5.6,0,-26],[35.2,0,-26],[2.4,0,-51.6],[37.6,0,-40],[23,0,-61.6],[19,0,-56],[0,0,-50],[44,0,-38],[44,0,-58],[12,0,-47.4],[28,0,-47.4]]};
  MAP.camps=[{k:'a',w:.2,p:[[-48,0,0],[-50,0,-1]],look:[-66,1,0]},{k:'b',w:.2,p:[[-6,0,0]],look:[-22,1,-8]},{k:'c',w:.2,p:[[30,0,-2]],look:[30,1,8]},{k:'d',w:.2,p:[[20,0,-40]],look:[20,1,-60]}];
  MAP.moon={d:MOON_D.clone(),c:new THREE.Color('#465672'),i:.55};MAP.spawnYaw=-Math.PI/2;
  MAP.cam=(t,cam)=>{const a=t*.04;cam.position.set(20+Math.sin(a)*24,9,-45+Math.cos(a)*24);cam.lookAt(20,2,-45)}}
MAPDEFS.ep2={n:['봉쇄선 전방기지','Containment-Line Forward Base'],d:['비 오는 밤의 제7 봉쇄선 전방기지. 고속도로 검문소 → 차량 정비장 → 지휘 구역 → 감시탑 광장.','Forward Base 7 on the containment line, a rainy night: the highway checkpoint, the motor pool, the command post, then the watchtower plaza.'],
  env:{sky:1,rain:1,storm:1,fog:'#0b0e14',fogD:.026,boAmb:.45},bounds:[-76,-78,60,22],probeY:[-.4,.9,2.4,3.9,5.6,7.4,9],build:buildEp2,tex:bakeEp2Tex,ep:2};

'use strict';
// ============ Chapter 7 map 「한설 아트센터 대피소」 (Hanseol Arts Center, beyond Containment Line 1): four zones played in order ============
// A city north of the bridge, outside the line, on a snowy night. The arts center was the district's evacuation shelter; its loudspeakers
// still play the broadcast that called the survivors in ("come north, we are waiting"). North is -z; the plaza and the floors are y 0.
// A  the snowed-in square           x -30..30   z 40..86     → the sliding glass doors, chained (gate gA: they slide open)
// B  the shelter foyer              x -26..26   z 6..39.4    the box office, the grand stair to the mezzanine (y 4.8), the café; cots everywhere
//                                                            → the steel fire door in its east wall (gate gB)
// C  backstage (no power)           x 27..48    z -66..10.4  the service corridor, the rehearsal room, the scene dock (a catwalk at y 6.5),
//                                                            the dressing rooms → the house's side doors (gate gC)
// D  the main hall                  x -24..24   z -70..2     the stalls (cleared for the shelter), a rear platform with seats, balconies at
//                                                            y 4.4, the pit, the stage (y 1.4) behind the main curtain (gate gD), fly galleries
// LORELEI (lorelei.js) sings from the stage. The four speaker stacks, the chandelier's chain and its winch are the boss fight's props.
Object.assign(MATS,{
  e7pave:{t:'e7pave',s:3,k:'stone'},e7stone:{t:'e7stone',s:2,k:'stone'},e7bronze:{t:'e7bronze',s:1,k:'metal'},e7fac:{t:'e7fac',s:4,k:'stone'},e7glass:{t:'e7glass',s:4,emis:.32,k:'glass'},
  e7door:{t:'e7door',uv:'box',emis:.22,k:'glass'},e7canU:{t:'e7canU',s:2,emis:.25,k:'metal'},e7shop:{t:'e7shop',uv:'boxV',s:8,k:'metal'},e7bus:{t:'e7bus',uv:'box',k:'metal'},e7busF:{t:'e7busF',uv:'box',k:'metal'},
  e7amb:{t:'e7amb',uv:'box',k:'metal'},e7ambF:{t:'e7ambF',uv:'box',k:'metal'},e7ambC:{t:'e7ambC',uv:'box',k:'metal'},e7ambR:{t:'e7ambR',s:2,k:'metal'},e7tent:{t:'e7tent',s:2,k:'soft'},e7horn:{t:'e7horn',uv:'box',k:'metal'},e7banner:{t:'e7banner',uv:'box',emis:.12,k:'soft'},
  e7marble:{t:'e7marble',s:4,k:'stone'},e7wood:{t:'e7wood',s:2,k:'wood'},e7ceil:{t:'e7ceil',s:4,emis:.06,k:'stone'},e7ceil2:{t:'e7ceil2',s:4,k:'stone'},e7stair:{t:'e7stair',uv:'box',k:'soft'},e7rail:{t:'e7rail',s:1,k:'metal'},
  e7gRail:{t:'e7gRail',uv:'box',k:'glass'},e7box:{t:'e7box',uv:'box',emis:.2,k:'wood'},e7cafe:{t:'e7cafe',uv:'box',emis:.12,k:'wood'},e7relief:{t:'e7relief',uv:'box',k:'soft'},e7wrap:{t:'e7wrap',uv:'box',k:'soft'},
  e7blank:{t:'e7blank',s:1.2,k:'soft'},e7poster:{t:'e7poster',uv:'box',emis:.12,k:'soft'},e7hdoor:{t:'e7hdoor',uv:'box',k:'wood'},e7fdoor:{t:'e7fdoor',uv:'box',k:'metal'},
  e7bwall:{t:'e7bwall',s:3,k:'stone'},e7bfloor:{t:'e7bfloor',s:3,k:'wood'},e7flat:{t:'e7flat',uv:'box',k:'wood'},e7case:{t:'e7case',uv:'box',k:'metal'},e7rack:{t:'e7rack',uv:'box',emis:.35,k:'metal'},
  e7mirror:{t:'e7mirror',uv:'box',emis:.55,k:'glass',edge:'metal2'},e7cost:{t:'e7cost',s:1,k:'soft'},e7hwall:{t:'e7hwall',s:3,k:'soft'},e7hfloor:{t:'e7hfloor',s:4,k:'wood'},e7carpet:{t:'e7carpet',s:2,k:'soft'},
  e7seat:{t:'e7seat',s:.6,sv:.85,vo:1.2,k:'soft'},e7gold:{t:'e7gold',s:1,emis:.06,k:'metal'},e7balc:{t:'e7balc',uv:'boxV',s:3,k:'wood'},e7pros:{t:'e7pros',s:3,k:'stone'},e7hceil:{t:'e7hceil',s:6,emis:.04,k:'stone'},
  e7stage:{t:'e7stage',s:4,k:'wood'},e7apron:{t:'e7apron',uv:'boxV',s:4,k:'wood'},e7curt:{t:'e7curt',uv:'boxV',s:3,k:'soft'},e7curtV:{t:'e7curtV',uv:'boxV',s:3,k:'soft'},e7legs:{t:'e7legs',s:2,k:'soft'},
  e7spk:{t:'e7spk',uv:'box',emis:.06,k:'metal'},e7pbox:{t:'e7pbox',uv:'box',emis:.3,k:'metal'},e7winch:{t:'e7winch',uv:'box',emis:.22,k:'metal'},e7cyc:{t:'e7cyc',uv:'box',emis:.45,k:'soft'},
  e7piano:{t:'e7piano',s:1,k:'wood'},e7exit:{t:'e7exit',uv:'box',emis:1.1,k:'metal'},e7gift:{t:'e7gift',uv:'box',emis:.08,k:'soft'},
  e7sCenter:{t:'e7sCenter',uv:'box',emis:.9,k:'metal'},e7sBig:{t:'e7sBig',uv:'box',emis:.7,k:'metal'},e7sShelter:{t:'e7sShelter',uv:'box',emis:.35,k:'metal'},e7sBox:{t:'e7sBox',uv:'box',emis:.45,k:'metal'},
  e7sCafe:{t:'e7sCafe',uv:'box',emis:.4,k:'metal'},e7sHall:{t:'e7sHall',uv:'box',emis:.35,k:'metal'},e7sBack:{t:'e7sBack',uv:'box',emis:.18,k:'metal'},e7sQuiet:{t:'e7sQuiet',uv:'box',emis:.25,k:'metal'},
  e7sDock:{t:'e7sDock',uv:'box',emis:.15,k:'metal'},e7sDress:{t:'e7sDress',uv:'box',emis:.15,k:'metal'},e7sCheck:{t:'e7sCheck',uv:'box',emis:.3,k:'metal'},
});
// ---------- textures (painted on first load; the snow is chapter 6's) ----------
// granite pavers under the canopy: swept, wet, snow packed into the joints
function texE7Pave(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const bx=Math.floor(x/64),by=Math.floor(y/32),j=x%64<3||(y%32<3);
  let c=dith(P,x,y,P.n(x,y,30,7001,3)*.9+hash2(bx,by,7002)*.25,['#3c3e42','#46484c','#505256','#5a5c60','#646668'],.1);if(hash2(x,y,7003)<.05)c=dk(c,.15);
  if(j)c=P.n(x,y,8,7004,2)>.4?'#d8dee4':'#2a2c30';if(P.n(x,y,50,7005,3)>.7)c=mix(c,'#a8b4c0',.3);P.set(x,y,c)}})}
function texE7Stone(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,20,7011,3)+(hash2(x,y,7012)-.5)*.2,['#7a7c7a','#878985','#949690','#a1a39c','#aeb0a8'],.12);
  if(hash2(x,y,7013)<.03)c='#5a5c5a';if(x%128<2||y%128<2)c=dk(c,.25);P.set(x,y,c)}})}
function texE7Bronze(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#4a3a22','#7a5a30',P.n(x,y,14,7021,3));if(P.n(x,y,10,7022,2)>.62)c=mix(c,'#3a7a68',.55);if(y<12)c=mix(c,'#e8ecef',.7);P.set(x,y,c)}})}
function texE7Ice(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#6a8aa0','#a8c4d4',P.n(x,y,40,7031,3));const r=P.n(x,y,12,7032,2);if(r>.68)c='#e8f2f8';else if(r<.3)c=dk(c,.2);
  if(hash2(x,y,7033)<.004)c='#ffffff';P.set(x,y,c)}for(let i=0;i<8;i++)crack(P,Math.floor(hash2(i,1,7034)*N),Math.floor(hash2(i,2,7034)*N),40,7035+i,'#dfeaf2','#4a6a80')})}
// the facade's limestone panels, stained by snow-melt under every joint
function texE7Fac(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,40,7041,4)*.9+.1,['#8a8478','#958f82','#a09a8c','#aba596','#b6b0a0'],.08);
  if(x%128<2||y%64<2)c='#6a665c';P.set(x,y,c)}for(let i=0;i<12;i++)streak(P,Math.floor(hash2(i,1,7042)*N),Math.floor(hash2(i,2,7042)*4)*64+2,30+Math.floor(hash2(i,3,7042)*50),.18,2)})}
// the curtain wall: dark glass in a brass grid, warm light from the shelter inside, a cracked pane here and there
function texE7Glass(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%128,gy=y%128;let c=mix('#1a2a3a','#3a3a40',P.n(x,y,30,7051,2));
  const warm=P.n(x,y,60,7052,3);if(warm>.5)c=mix(c,'#c89050',clamp((warm-.5)*1.6,0,.65));if((gx+gy*.4)%90<5)c=lt(c,.18);
  if(gx<5||gy<5)c=gx<2||gy<2?'#2a2620':'#8a7448';P.set(x,y,c)}for(let i=0;i<3;i++){const cx=hash2(i,1,7053)*N,cy=hash2(i,2,7053)*N;for(let k=0;k<6;k++)crack(P,Math.round(cx),Math.round(cy),26,7054+i*7+k,'#a8b8c8','#3a4a5a')}})}
// a sliding glass door, chained shut: the brass frame, a push bar, the chain and its padlock, the shelter's notice taped on
function texE7Door(){const W=192,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#18242e','#2e3c48',P.n(x,y,24,7061,2));if(P.n(x,y,40,7062,2)>.55)c=mix(c,'#c08848',.35);
  if(x<10||x>W-11||y<10||y>H-11)c='#8a7448';if(y>H*.46&&y<H*.5&&x>18&&x<W-18)c='#b89a5a';P.set(x,y,c)}
  P.post=ctx=>{ctx.strokeStyle='#5a5e62';ctx.lineWidth=5;for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(28+i*17,H*.52+(i%2)*3,9,6,(i%2?.6:-.6),0,TAU);ctx.stroke()}
    ctx.fillStyle='#7a6a3a';ctx.fillRect(W/2-12,H*.55,24,26);ctx.fillStyle='#e8e4d8';ctx.fillRect(W/2-46,H*.18,92,58);ctx.fillStyle='#202020';ctx.font='bold 15px sans-serif';ctx.textAlign='center';
    ctx.fillText('임시 대피소',W/2,H*.18+22);ctx.font='bold 11px sans-serif';ctx.fillText('EVACUATION SHELTER',W/2,H*.18+40);ctx.fillStyle='#b81c14';ctx.fillText('출입 통제',W/2,H*.18+54)}})}
function texE7CanU(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8c4bc','#b4b0a8',P.n(x,y,30,7071,2));if(x%128<2||y%128<2)c='#8a8680';
  const dx=x%128-64,dy=y%128-64;if(dx*dx+dy*dy<120)c=dx*dx+dy*dy<60?'#fffbe8':'#e8dcc0';P.set(x,y,c)}})}
// the shops along the square: a rolled-down shutter, a sign band over it, snow on the sill (one shop every 8 m)
function texE7Shop(){const W=512,H=256;const names=[['편의점','24h'],['꽃집','FLOWER'],['약국','PHARMACY'],['베이커리','BAKERY']];return paint(W,H,P=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c;if(y<70)c=mix('#5a5650','#4a4640',P.n(x,y,20,7081,2));else if(y<102)c='#262a30';else{c=y%10<2?'#6a6e72':'#8a8e92';if(P.n(x,y,16,7082,2)>.6)c=mix(c,'#5a4a3a',.4)}
    if(y>H-14)c=mix('#dfe5e9','#b8c2cc',hash2(x,y,7083));if(x<6||x>W-7)c='#3a3a3a';P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,7084)*W),102,60+Math.floor(hash2(i,2,7084)*80),.14,2);
  P.post=ctx=>{const n=names[0];ctx.fillStyle='#e8e0c8';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(n[0],W/2,94);ctx.font='bold 11px sans-serif';ctx.fillText(n[1],W/2,40);
    ctx.fillStyle='#e8e4d8';ctx.fillRect(W/2-40,140,80,46);ctx.fillStyle='#2a2a2a';ctx.font='bold 12px sans-serif';ctx.fillText('대피소로',W/2,158);ctx.fillText('→ 아트센터',W/2,176)}})}
function texE7Bus(){const W=512,H=160;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#e8ecef','#d0d6da',P.n(x,y,40,7091,3));
  if(y<10)c=mix('#eef2f4','#c8d0d6',P.n(x,y,8,7092,2));else if(y>34&&y<84&&x%86>6){c=mix('#141c22','#22323c',P.n(x,y,16,7093,2));if((x*.4+y)%60<6)c=lt(c,.2)}
  else if(y>88&&y<104)c='#1c5aa8';else if(y>H-18)c='#1c1c1c';if(x>380&&x<430&&y>34&&y<H-18)c=mix('#1a2228','#2a3a44',P.n(x,y,10,7094,2));if(hash2(x,y,7095)<.02)c=dk(c,.15);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#1c5aa8';ctx.font='bold 22px sans-serif';ctx.fillText('703',30,130);ctx.font='bold 14px sans-serif';ctx.fillText('한설역 · 아트센터',90,130)}})}
function texE7BusF(){const W=256,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#e8ecef','#d0d6da',P.n(x,y,30,7101,2));
  if(y<10)c='#dfe5e9';else if(y<34)c='#141414';else if(y<110&&x>14&&x<242){c=mix('#121a20','#24343e',P.n(x,y,14,7102,2));if((x+y)%80<8)c=lt(c,.2)}else if(y>150)c='#202020';else if(y>118&&y<128)c='#1c5aa8';
  if(y>124&&y<140&&(x<46&&x>16||x>210&&x<240))c='#f0e8c8';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ff9a1a';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('703 대피 차량',W/2,27)}})}
// an ambulance: white, an orange band and its word
function texE7Amb(){const W=512,H=280;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#eef0ee','#d8dcda',P.n(x,y,40,7111,3));
  if(y>122&&y<161)c='#e86a1a';else if(y>161&&y<171)c='#2a5aa8';else if(y>H-28)c='#1c1c1c';if(y>40&&y<106&&x>40&&x<124)c=mix('#141c22','#24323c',P.n(x,y,12,7112,2));
  if((x===300||x===420)&&y>30&&y<H-28)c=dk(c,.3);if(hash2(x,y,7113)<.02)c=dk(c,.1);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#2a5aa8';ctx.font='bold 40px sans-serif';ctx.textAlign='center';ctx.fillText('구 급',W*.62,98);ctx.font='bold 18px sans-serif';ctx.fillText('EMERGENCY',W*.62,226)}})}
function texE7AmbF(){const W=256,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#eef0ee','#d8dcda',P.n(x,y,30,7121,2));
  if(y>20&&y<84&&x>16&&x<240)c=mix('#121a20','#24343e',P.n(x,y,14,7122,2));else if(y>104&&y<118)c='#e86a1a';else if(y>H-20)c='#202020';if(y>124&&y<140&&(x<50&&x>18||x>206&&x<238))c='#f0e8c8';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e82a1a';ctx.fillRect(W/2-40,4,80,12);ctx.fillStyle='#2a5aa8';ctx.fillRect(W/2-40,4,26,12);ctx.fillRect(W/2+14,4,26,12)}})}
// (v7.6) the cab's sides (a door with its window, the stripes, the sill) and the plain white roof: the side picture squeezed onto the
// 1.6 m cab, and the livery on the roof, read as noise
function texE7AmbC(){const W=192,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#eef0ee','#d8dcda',P.n(x,y,48,7141,3));
  if(y>104&&y<128)c='#e86a1a';else if(y>128&&y<135)c='#2a5aa8';else if(y>H-20)c='#1c1c1c';if(y>22&&y<84&&x>26&&x<W-26)c=mix('#141c22','#24323c',P.n(x,y,12,7142,2));
  if((x===16||x===W-17)&&y>12&&y<H-20)c=dk(c,.35);if(y>92&&y<97&&x>W-58&&x<W-30)c='#3a3e40';if(hash2(x,y,7143)<.02)c=dk(c,.1);P.set(x,y,c)}})}
function texE7AmbR(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#e4e6e4','#d0d4d2',P.n(x,y,16,7151,2));if(hash2(x,y,7152)<.03)c=dk(c,.08);P.set(x,y,c)}})}
// a relief tent's canvas: white, a blue roof band
function texE7Tent(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const w=((x>>1)+(y>>1))&1;let c=dith(P,x,y,.5+(P.n(x,y,40,7131,3)-.5)*.4+(w?.03:-.03),['#a8aca8','#b8bcb8','#c8ccc8','#d6dad6'],.08);
  if(y%128<18)c=mix(c,'#2a5a9a',.85);if(x%128<3)c=dk(c,.25);P.set(x,y,c)}for(let i=0;i<8;i++)stain(P,hash2(i,1,7132)*N,hash2(i,2,7132)*N,8,6,.18,7133+i)})}
// a loudspeaker's horn on a pole (the evacuation broadcast)
function texE7Horn(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=(x/N-.5)*2,v=(y/N-.5)*2,r=Math.hypot(u,v);let c=r<.3?'#141414':r<.9?mix('#9a9ea2','#6a6e72',r):'#4a4e52';
  if(r>.3&&r<.9&&Math.round(r*14)%3===0)c=dk(c,.2);if(y<10)c='#e8ecef';P.set(x,y,c)}})}
// the concert banners down the facade
function texE7Banner(){const W=96,H=384;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#2a1440','#4a1e5a',y/H);const n=P.n(x,y,30,7141,2);if(n>.6)c=lt(c,.08);if(x<3||x>W-4)c='#c8a050';P.set(x,y,c)}
  // a soprano's silhouette, arms open, in a ring of light
  for(let y=150;y<300;y++)for(let x=0;x<W;x++){const dx=(x-W/2)/30,dy=(y-200)/60;if(dx*dx+dy*dy<1&&dx*dx+dy*dy>.82)P.set(x,y,'#e8c870')}
  for(let y=170;y<290;y++){const w=y<186?6:y<240?6+(y-186)*.26:20;for(let x=Math.round(W/2-w);x<W/2+w;x++)P.set(x,y,'#0c0610')}for(let x=W/2-26;x<W/2+26;x++)for(let y=196;y<202;y++)P.set(x,y-Math.abs(x-W/2)*.2,'#0c0610');
  P.post=ctx=>{ctx.fillStyle='#f0dca0';ctx.textAlign='center';ctx.font='bold 17px sans-serif';ctx.fillText('겨울',W/2,44);ctx.fillText('음악회',W/2,66);ctx.font='bold 9px sans-serif';ctx.fillText('WINTER CONCERT',W/2,88);
    ctx.font='bold 11px sans-serif';ctx.fillText('12.24',W/2,330);ctx.font='9px sans-serif';ctx.fillText('대공연장 · MAIN HALL',W/2,350)}})}
// the foyer's floor: cream marble in big squares, a dark band, scuffs from boots and cot legs
function texE7Marble(){const N=TN*2;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const tx=Math.floor(x/128),ty=Math.floor(y/128),dk2=(tx+ty)%2===0;
  let c=dith(P,x,y,P.n(x,y,30,7151,4)+(hash2(x,y,7152)-.5)*.1,dk2?['#c8bca4','#d2c6ae','#dcd0b8','#e4d8c2']:['#3a4a40','#445448','#4e5e52','#58685a'],.08);
  const v=P.n(x,y,18,7153+tx,2);if(Math.abs(v-.5)<.015)c=dk(c,.2);if(x%128<2||y%128<2)c='#2a2a26';P.set(x,y,c)}
  for(let i=0;i<14;i++)stain(P,hash2(i,1,7154)*N,hash2(i,2,7154)*N,12+hash2(i,3,7154)*26,8+hash2(i,4,7154)*16,.12,7155+i)})}
function texE7Wood(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sl=Math.floor(x/16);let c=dith(P,x,y,P.n(x*.3,y*2,40,7161+sl,3)*.8+hash2(sl,0,7162)*.3,['#4a2e1a','#583820','#664226','#744c2c','#825632'],.08);
  if(x%16<1)c='#24160c';if(y%128<2)c='#2a1a0e';P.set(x,y,c)}})}
// a coffered ceiling: sunken panels with a downlight in each
function texE7Ceil(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%128,gy=y%128;let c=mix('#d0c8b8','#bcb4a4',P.n(x,y,30,7171,2));if(gx<10||gy<10)c='#e0d8c8';else if(gx<14||gy<14)c='#8a8476';
  const dx=gx-69,dy=gy-69;if(dx*dx+dy*dy<90)c='#fff4d8';P.set(x,y,c)}})}
function texE7Ceil2(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8c0b0','#b4ac9c',P.n(x,y,30,7175,2));if(x%128<3||y%64<3)c='#8a8476';P.set(x,y,c)}})}
// a step: marble at the ends, a red carpet runner held by brass rods (fitted to each step: u across the stair)
function texE7Stair(){const W=256,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=x/W;let c;if(u<.22||u>.78)c=dith(P,x,y,P.n(x,y,20,7181,2),['#c8bca4','#d4c8b0','#e0d4bc'],.08);
  else{c=mix('#7a1418','#9a2024',P.n(x,y,8,7182,2));if(hash2(x,y,7183)<.05)c=dk(c,.2);if(u<.24||u>.76)c='#c8a050'}if(y<4)c='#b89a5a';P.set(x,y,c)}})}
function texE7Rail(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#8a6a2a','#d8b060',(Math.sin(y*.3)+1)/2*.6+P.n(x,y,8,7191,2)*.4);P.set(x,y,c)}})}
// a glass balustrade: clear panes (cut out) in a brass frame
function texE7GRail(){const W=128,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x<4||x>W-5||y<5||y>H-4)P.set(x,y,'#b89a5a');else if((x+y)%40<3)P.set(x,y,'#c8d8e0');else P.alpha(x,y,0)}})}
function texE7Box(){const W=256,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a2a18','#5a3420',P.n(x,y,20,7201,2));if(y<8)c='#c8a050';if(x%64<4)c='#2a160c';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8d8b0';ctx.font='bold 14px sans-serif';ctx.textAlign='center';for(let i=0;i<4;i++)ctx.fillText(String(i+1),32+i*64,56)}})}
function texE7Cafe(){const W=256,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#a8845a','#b8946a',P.n(x*.4,y*2,20,7211,2));if(y<6)c='#3a2a1a';if(x%32<2)c=dk(c,.2);P.set(x,y,c)}})}
// a relief carton: brown card, tape, the shelter's stamp
function texE7Relief(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#a8844e','#b8945e',P.n(x,y,14,7221,2));if(Math.abs(x-64)<8)c='#c8b48a';if(x<2||y<2||x>N-3||y>N-3)c='#7a5a30';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#2a3a6a';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText('구호품',N/2,46);ctx.font='bold 10px sans-serif';ctx.fillText('RELIEF',N/2,62);ctx.fillStyle='#b81c14';ctx.fillText('한설시',N/2,98)}})}
// shrink-wrapped water: blue caps in rows under the film
function texE7Wrap(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#8ab0c8','#a8c8dc',P.n(x,y,10,7231,2));if(x%16<10&&y%32<6)c='#2a5aa8';if(y%32>26)c='#c8dce8';if((x+y)%50<3)c='#eef6fa';P.set(x,y,c)}})}
function texE7Blank(){const N=128;return paint(N,N,P=>{const cols=['#6a2a3a','#2a4a6a','#4a5a3a','#7a6a3a','#5a5a5a'];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=Math.floor(x/64)+Math.floor(y/64)*2;
  let c=mix(cols[b%cols.length],dk(cols[b%cols.length],.3),P.n(x,y,8,7241,2));if((x+y)%16<2)c=lt(c,.08);P.set(x,y,c)}})}
// the winter concert's poster (in a gold frame on the foyer walls)
function texE7Poster(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#141a2e','#2a1a3a',y/H);if(hash2(x,y,7251)<.012)c='#e8e8ff';if(x<6||x>W-7||y<6||y>H-7)c='#c8a050';P.set(x,y,c)}
  for(let y=60;y<170;y++){const w=y<74?5:y<130?5+(y-74)*.2:16;for(let x=Math.round(W/2-w);x<W/2+w;x++)P.set(x,y,'#e8dcc8')}
  P.post=ctx=>{ctx.fillStyle='#f0dca0';ctx.textAlign='center';ctx.font='bold 16px sans-serif';ctx.fillText('겨울 음악회',W/2,30);ctx.font='bold 9px sans-serif';ctx.fillText('대피민과 함께하는 · 12.24',W/2,46);ctx.fillText('한설 아트센터 대공연장',W/2,182)}})}
// the hall's padded doors, chained from the far side, a sign: closed
function texE7HDoor(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#5a1418','#6a1c20',P.n(x,y,12,7261,2));if((x%32<2)||(y%32<2))c='#3a0c0e';if(x>60&&x<68)c='#1a0a0a';if(x<4||x>W-5||y<4)c='#c8a050';P.set(x,y,c)}
  for(let y=86;y<104;y++)for(let x=36;x<92;x++)P.set(x,y,'#b89a5a');P.post=ctx=>{ctx.fillStyle='#e8e4d8';ctx.fillRect(W/2-36,40,72,30);ctx.fillStyle='#b81c14';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('출입 금지',W/2,61)}})}
// a steel fire door: grey, a push bar, the 방화문 plate
function texE7FDoor(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#6a6e72','#5a5e62',P.n(x,y,20,7271,2));if(x<5||x>W-6||y<5)c='#3a3e42';if(y>98&&y<108&&x>14&&x<W-14)c='#c8c8c0';if(hash2(x,y,7272)<.02)c=dk(c,.2);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#c81c14';ctx.fillRect(W/2-34,30,68,28);ctx.fillStyle='#ffffff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.fillText('방화문',W/2,50)}})}
// backstage: black-painted blockwork, white stencils here and there
function texE7BWall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const row=Math.floor(y/32),bx=(x+(row%2)*32)%64;let c=mix('#141416','#1e1e22',P.n(x,y,20,7281,3));if(bx<2||y%32<2)c='#0a0a0c';if(P.n(x,y,40,7282,2)>.7)c=lt(c,.06);P.set(x,y,c)}})}
function texE7BFloor(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(x/32);let c=mix('#18181a','#242426',P.n(x*.4,y,30,7291+pl,2));if(x%32<1)c='#0a0a0a';if(P.n(x,y,24,7292,3)>.7)c=mix(c,'#5a5a5a',.3);P.set(x,y,c)}
  // glow tape crosses where things stood, gaffer tape
  for(let i=0;i<5;i++){const cx=Math.floor(hash2(i,1,7293)*N),cy=Math.floor(hash2(i,2,7293)*N);for(let k=-6;k<=6;k++){P.set(cx+k,cy,'#8aff9a');P.set(cx,cy+k,'#8aff9a')}}
  for(let i=0;i<6;i++){const y0=Math.floor(hash2(i,3,7294)*N),x0=Math.floor(hash2(i,4,7294)*N);for(let k=0;k<40;k++)for(let w=0;w<4;w++)P.set(x0+k,y0+w,i%2?'#3a3a3a':'#c8c8c0')}})}
// a scenery flat's face: a painted winter forest (the concert's set)
function texE7Flat(){const W=256,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#1a2a4a','#4a5a7a',y/H);if(y>H*.7)c=mix('#c8d4e0','#e8eef4',P.n(x,y,20,7301,2));P.set(x,y,c)}
  for(let i=0;i<9;i++){const cx=hash2(i,1,7302)*W,base=H*.75,h=60+hash2(i,2,7302)*80;for(let y=0;y<h;y++){const w=(y/h)*22;for(let x=Math.round(cx-w);x<cx+w;x++)P.set(x,Math.round(base-h+y),y%14<3?'#e8eef4':'#1a3a2a')}}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(x<6||x>W-7||y<6||y>H-7)P.set(x,y,'#6a5a4a')})}
// a road case: black, aluminium edges, the hall's stencil
function texE7Case(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#1a1a1c','#242426',P.n(x,y,10,7311,2));if(x<8||y<8||x>N-9||y>N-9)c=mix('#a8acb0','#8a8e92',hash2(x,y,7312));
  if((x<14||x>N-15)&&(y<14||y>N-15))c='#c8ccd0';P.set(x,y,c)}P.post=ctx=>{ctx.fillStyle='#e8e8e0';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('HANSEOL',N/2,58);ctx.fillText('HALL · 03',N/2,76)}})}
// a dimmer rack: grey cabinet, rows of breakers, status lamps
function texE7Rack(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a3e42','#4a4e52',P.n(x,y,14,7321,2));if(x<5||x>W-6)c='#2a2e32';
  if(y>20&&y<150&&(y%26)>4&&x>14&&x<W-14){c=(x%12)<7?'#1a1c1e':'#5a5e62';if(x%12<7&&y%26===14)c=hash2(x,y,7322)<.5?'#ff4a2a':'#4aff6a'}P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8c820';ctx.fillRect(14,160,W-28,22);ctx.fillStyle='#141414';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('조광기 DIMMER',W/2,176)}})}
// a dressing-room mirror ringed with bulbs
function texE7Mirror(){const W=192,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a4650','#5a6670',P.n(x,y,20,7331,2));if((x+y*.5)%80<6)c=lt(c,.25);if(x<14||x>W-15||y<14||y>H-15)c='#e8dcc0';P.set(x,y,c)}
  for(let i=0;i<9;i++){for(const [bx,by] of [[14+i*20,7],[14+i*20,H-8]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(dx*dx+dy*dy<16)P.set(bx+dx,by+dy,'#fff6d0')}})}
function texE7Cost(){const N=128;return paint(N,N,P=>{const cols=['#7a1a2a','#1a3a7a','#e8d8a8','#2a2a2a','#5a2a6a','#c8a050'];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=Math.floor(x/12);let c=mix(cols[k%cols.length],dk(cols[k%cols.length],.35),P.n(x,y*.3,10,7341,2));
  if(x%12<1)c='#0a0a0a';P.set(x,y,c)}})}
// the hall: dark red fabric panels between gilt strips, a little faded
function texE7HWall(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const gx=x%192;let c=mix('#4a0c12','#5a1218',P.n(x,y,24,7351,3));if(((x>>1)+(y>>1))%2)c=dk(c,.05);
  if(gx<6)c=mix('#8a6a2a','#c8a050',P.n(x,y,6,7352,2));else if(gx<8)c='#2a0608';P.set(x,y,c)}})}
// the stalls' floor where the seats came out: dark parquet, rows of bolt holes, scuffed by a month of cots
function texE7HFloor(){const N=TN*2;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(x/24)+Math.floor(y/96)*7;let c=dith(P,x,y,P.n(x*.3,y,30,7361,2)*.7+hash2(pl,1,7362)*.35,['#2a1a10','#341f14','#3e2618','#482c1c'],.08);
  if(x%24<1||y%96<1)c='#140c08';if(y%115<3&&(x%60)<4)c='#0a0a0a';P.set(x,y,c)}for(let i=0;i<20;i++)stain(P,hash2(i,1,7363)*N,hash2(i,2,7363)*N,10+hash2(i,3,7363)*30,6+hash2(i,4,7363)*14,.15,7364+i)})}
function texE7Carpet(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#5a1014','#6e161a',P.n(x,y,8,7371,2));const p=(Math.floor(x/32)+Math.floor(y/32))%2;if(p&&(x%32===16||y%32===16))c='#8a6a2a';P.set(x,y,c)}})}
// a row of theatre seats (world-tiled: one seat each .6 m across, the row's height top to bottom)
function texE7Seat(){const W=128,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#7a1418','#901a1e',P.n(x,y,8,7381,2));if(x<8||x>W-9)c='#1a0a0a';
  if(y<14)c=mix('#8a1a1e','#a8242a',P.n(x,y,6,7382,2));if(y>H-18)c='#2a1a14';if(y>H*.42&&y<H*.46)c=dk(c,.3);P.set(x,y,c)}})}
function texE7Gold(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#7a5a1a','#d8b050',P.n(x,y,6,7391,2));if((x+y)%16<2)c=lt(c,.3);if(y%16<1)c=dk(c,.3);P.set(x,y,c)}})}
// a balcony front: red velvet between gilt rails, a gilt cartouche every 3 m
function texE7Balc(){const W=256,H=96;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#5a0c12','#6a141a',P.n(x,y,10,7401,2));if(y<10||y>H-11)c=mix('#8a6a2a','#d8b050',P.n(x,y,4,7402,2));
  const dx=(x-W/2)/40,dy=(y-H/2)/22;const r=dx*dx+dy*dy;if(r<1&&r>.62)c='#c8a050';else if(r<.62&&r>.5)c='#3a0608';P.set(x,y,c)}})}
// the proscenium: cream plaster with gilt mouldings
function texE7Pros(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8bca0','#d8ccb0',P.n(x,y,30,7411,3));const gx=x%192,gy=y%192;if(gx<6||gy<6)c=mix('#8a6a2a','#d8b050',P.n(x,y,4,7412,2));
  else if(gx<10||gy<10)c='#7a6a4a';P.set(x,y,c)}})}
// the hall's ceiling: dark blue-grey with a gilt ring of plaster leaves every 12 m (the chandelier hangs from the middle one)
function texE7HCeil(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#1a2030','#24283a',P.n(x,y,30,7421,3));const dx=x-128,dy=y-128,r=Math.hypot(dx,dy);
  if(r>90&&r<104)c=mix('#8a6a2a','#c8a050',(Math.sin(Math.atan2(dy,dx)*24)+1)/2);if(hash2(x,y,7422)<.003)c='#5a5a6a';P.set(x,y,c)}})}
function texE7Stage(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pl=Math.floor(x/24);let c=mix('#1e1a18','#2a2420',P.n(x*.3,y,30,7431+pl,2));if(x%24<1)c='#0e0c0a';if(P.n(x,y,30,7432,3)>.72)c=mix(c,'#6a6a6a',.25);P.set(x,y,c)}
  for(let i=0;i<4;i++){const cx=Math.floor(hash2(i,1,7433)*N),cy=Math.floor(hash2(i,2,7433)*N);for(let k=-5;k<=5;k++){P.set(cx+k,cy,'#8aff9a');P.set(cx,cy+k,'#8aff9a')}}})}
function texE7Apron(){const W=256,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#141210','#1e1a16',P.n(x,y,10,7441,2));if(y>H-6)c=mix('#8a6a2a','#c8a050',P.n(x,y,4,7442,2));P.set(x,y,c)}})}
// the main curtain: deep red velvet in folds (shaded across), a gold fringe at its foot
function texE7Curt(){const W=256,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const f=(Math.sin(x/W*TAU*6)+1)/2,f2=(Math.sin(x/W*TAU*17+1)+1)/2;let c=mix('#3a0408','#a8141c',.15+.7*f*.85+.15*f2);
  if(hash2(x,y,7451)<.02)c=dk(c,.12);if(y<14){c=(x%6<3)?'#c8a040':'#8a6a1a';if(y<4)c='#e8c860'}P.set(x,y,c)}})}
function texE7CurtV(){const W=256,H=64;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const f=(Math.sin(x/W*TAU*8)+1)/2;let c=mix('#4a060a','#a8141c',.25+.6*f);const sw=Math.abs(Math.sin(x/W*TAU*4))*20;
  if(y<sw)c='#2a0204';if(y<6)c=(x%6<3)?'#c8a040':'#8a6a1a';if(y>H-6)c='#c8a050';P.set(x,y,c)}})}
function texE7Legs(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const f=(Math.sin(x/N*TAU*3)+1)/2;P.set(x,y,mix('#060608','#16161a',f*.8+P.n(x,y,8,7461,2)*.2))}})}
// a speaker cabinet's face: black grille, two woofers and a horn; a red power lamp
function texE7Spk(){const W=128,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=((x+y)%4<2)?'#141416':'#1c1c1e';if(x<5||x>W-6||y<5||y>H-6)c='#2a2a2c';
  for(const cy of [70,170]){const r=Math.hypot(x-W/2,y-cy);if(r<48)c=r<14?'#2a2a2a':r<42?mix('#0a0a0a','#202022',r/42):'#3a3a3c'}if(Math.abs(x-W/2)<30&&y>110&&y<130)c='#0a0a0a';P.set(x,y,c)}
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx+dy*dy<10)P.set(W-14+dx,H-14+dy,'#ff2a1a');P.post=ctx=>{ctx.fillStyle='#8a8a8a';ctx.font='bold 9px monospace';ctx.fillText('HANSEOL PA',8,H-10)}})}
function texE7PBox(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#5a5e62','#6a6e72',P.n(x,y,10,7471,2));if(x<4||y<4||x>N-5||y>N-5)c='#2a2e32';if(x>40&&x<88&&y>30&&y<90)c='#1a1a1a';if(x>56&&x<72&&y>36&&y<64)c='#c8c8c0';P.set(x,y,c)}
  for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(dx*dx+dy*dy<16)P.set(64+dx,106+dy,'#ff3a1a');P.post=ctx=>{ctx.fillStyle='#e8c820';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('전원',N/2,22)}})}
function texE7Winch(){const W=128,H=192;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a3e42','#4a4e52',P.n(x,y,10,7481,2));if(x<5||x>W-6)c='#1a1e22';if(y>60&&y<130&&x>40&&x<88)c=((y+x)%10<5)?'#8a8e92':'#5a5e62';if(y>134&&y<146)c='#c8a020';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#e8c820';ctx.fillRect(10,10,W-20,40);ctx.fillStyle='#141414';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('샹들리에',W/2,28);ctx.font='bold 10px sans-serif';ctx.fillText('윈치 WINCH',W/2,44)}})}
// the backdrop: a winter night over a frozen lake, painted for the concert (lit from below)
function texE7Cyc(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H;let c=v<.6?mix('#0a1430','#2a4a8a',v/.6):mix('#2a4a8a','#c8d8f0',(v-.6)/.4);if(v>.78)c=mix('#a8c0e0','#e8f0f8',P.n(x,y,30,7491,2));
  if(v<.6&&hash2(x,y,7492)<.006)c='#ffffff';P.set(x,y,c)}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-W*.7)/30,dy=(y-H*.22)/30;if(dx*dx+dy*dy<1)P.set(x,y,'#f0f0e0')}
  for(let i=0;i<14;i++){const cx=hash2(i,1,7493)*W,h=30+hash2(i,2,7493)*50;for(let y=0;y<h;y++){const w=(y/h)*14;for(let x=Math.round(cx-w);x<cx+w;x++)P.set(x,Math.round(H*.78-h+y),'#0a1a2a')}}})}
function texE7Piano(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#060606','#141416',P.n(x,y,10,7501,2));if((x+y*.4)%30<2)c='#3a3a3e';P.set(x,y,c)}})}
// the green emergency exit sign (a running figure and 비상구)
function texE7Exit(){const W=128,H=48;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c='#1aa84a';if(x<3||y<3||x>W-4||y>H-4)c='#e8f0e8';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(22,12,4,0,TAU);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(20,17);ctx.lineTo(17,28);ctx.lineTo(10,36);ctx.moveTo(17,28);ctx.lineTo(25,34);ctx.lineTo(27,42);
    ctx.moveTo(19,20);ctx.lineTo(28,24);ctx.moveTo(19,20);ctx.lineTo(12,22);ctx.stroke();ctx.font='bold 17px sans-serif';ctx.textAlign='center';ctx.fillText('비상구',78,24);ctx.font='bold 10px sans-serif';ctx.fillText('EXIT',78,38)}})}
function texE7Gift(){const N=64;return paint(N,N,P=>{const cols=['#b81c24','#1a6a3a','#2a4a9a','#c8a020'];for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=cols[Math.floor(hash2(Math.floor(x/64),Math.floor(y/64),7511)*4)];if(Math.abs(x-32)<4||Math.abs(y-32)<4)c='#e8d070';P.set(x,y,c)}})}
// the night: low snow cloud lit orange by a city with no one in it
function texE7Sky(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H;let c=v<.45?mix('#05070e','#141a28',v/.45):mix('#141a28','#3a3236',(v-.45)/.55);
  const g=Math.max(0,Math.cos((x/W)*TAU+2.2));if(v>.6)c=mix(c,'#6a4a36',clamp((v-.6)*2.2,0,1)*(.4+.6*g));const cl=P.n(x,y*2.2,60,7521,4);if(cl>.5)c=mix(c,v>.55?'#4a3c3c':'#1e2432',clamp((cl-.5)*1.6,0,.7));P.set(x,y,c)}})}
// pines in the park east of the square: dark needles, snow on every tier
function texE7Pine(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#0e2016','#1a3424',P.n(x,y,8,7531,3));if(y%32<9&&P.n(x,y,6,7532,2)>.35)c=mix('#dfe6ec','#f4f8fa',hash2(x,y,7533));P.set(x,y,c)}})}
function texE7Fir(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#0e2a18','#1e4428',P.n(x,y,6,7541,3));P.set(x,y,c)}})}
function bakeEp7Tex(){if(TEX.e7pave)return;if(typeof bakeEp6Tex==='function')bakeEp6Tex();
  TEX.e7pave=mkTex(texE7Pave());TEX.e7stone=mkTex(texE7Stone());TEX.e7bronze=mkTex(texE7Bronze());TEX.e7ice=mkTex(texE7Ice());TEX.e7fac=mkTex(texE7Fac());TEX.e7glass=mkTex(texE7Glass());
  TEX.e7door=mkTex(texE7Door(),false);TEX.e7canU=mkTex(texE7CanU());TEX.e7shop=mkTex(texE7Shop());TEX.e7bus=mkTex(texE7Bus(),false);TEX.e7busF=mkTex(texE7BusF(),false);
  TEX.e7amb=mkTex(texE7Amb(),false);TEX.e7ambF=mkTex(texE7AmbF(),false);TEX.e7ambC=mkTex(texE7AmbC(),false);TEX.e7ambR=mkTex(texE7AmbR());TEX.e7tent=mkTex(texE7Tent());TEX.e7horn=mkTex(texE7Horn(),false);TEX.e7banner=mkTex(texE7Banner(),false);
  TEX.e7marble=mkTex(texE7Marble());TEX.e7wood=mkTex(texE7Wood());TEX.e7ceil=mkTex(texE7Ceil());TEX.e7ceil2=mkTex(texE7Ceil2());TEX.e7stair=mkTex(texE7Stair(),false);TEX.e7rail=mkTex(texE7Rail());
  TEX.e7gRail=mkTex(texE7GRail(),false);TEX.e7box=mkTex(texE7Box(),false);TEX.e7cafe=mkTex(texE7Cafe(),false);TEX.e7relief=mkTex(texE7Relief(),false);TEX.e7wrap=mkTex(texE7Wrap(),false);
  TEX.e7blank=mkTex(texE7Blank());TEX.e7poster=mkTex(texE7Poster(),false);TEX.e7hdoor=mkTex(texE7HDoor(),false);TEX.e7fdoor=mkTex(texE7FDoor(),false);TEX.e7bwall=mkTex(texE7BWall());
  TEX.e7bfloor=mkTex(texE7BFloor());TEX.e7flat=mkTex(texE7Flat(),false);TEX.e7case=mkTex(texE7Case(),false);TEX.e7rack=mkTex(texE7Rack(),false);TEX.e7mirror=mkTex(texE7Mirror(),false);
  TEX.e7cost=mkTex(texE7Cost());TEX.e7hwall=mkTex(texE7HWall());TEX.e7hfloor=mkTex(texE7HFloor());TEX.e7carpet=mkTex(texE7Carpet());TEX.e7seat=mkTex(texE7Seat());TEX.e7gold=mkTex(texE7Gold());
  TEX.e7balc=mkTex(texE7Balc());TEX.e7pros=mkTex(texE7Pros());TEX.e7hceil=mkTex(texE7HCeil());TEX.e7stage=mkTex(texE7Stage());TEX.e7apron=mkTex(texE7Apron());TEX.e7curt=mkTex(texE7Curt());
  TEX.e7curtV=mkTex(texE7CurtV());TEX.e7legs=mkTex(texE7Legs());TEX.e7spk=mkTex(texE7Spk(),false);TEX.e7pbox=mkTex(texE7PBox(),false);TEX.e7winch=mkTex(texE7Winch(),false);
  TEX.e7cyc=mkTex(texE7Cyc(),false);TEX.e7piano=mkTex(texE7Piano());TEX.e7exit=mkTex(texE7Exit(),false);TEX.e7gift=mkTex(texE7Gift());TEX.e7sky=mkTex(texE7Sky(),false);
  TEX.e7pine=mkTex(texE7Pine());TEX.e7fir=mkTex(texE7Fir());
  TEX.e7sCenter=mkTex(texSign([{t:'한설 아트센터'},{t:'HANSEOL ARTS CENTER',s:9}],'#1a1a22','#f0dca0',288,40),false);
  TEX.e7sBig=mkTex(texSign([{t:'한설 아트센터'},{t:'HANSEOL ARTS CENTER',s:11}],'#0e0e14','#ffe8b0',320,56),false);
  TEX.e7sShelter=mkTex(texSign([{t:'임시 대피소 · 접수'},{t:'SHELTER · CHECK-IN',s:9}],'#1a6a3a','#ffffff',200,40),false);
  TEX.e7sBox=mkTex(texSign([{t:'매표소'},{t:'BOX OFFICE',s:10}],'#2a160c','#e8c870',160,40),false);
  TEX.e7sCafe=mkTex(texSign([{t:'카페 · 급식'},{t:'CAFÉ · MEALS',s:10}],'#3a2a1a','#f0e0c0',160,40),false);
  TEX.e7sHall=mkTex(texSign([{t:'대공연장'},{t:'MAIN HALL',s:10}],'#2a0a0e','#e8c870',160,40),false);
  TEX.e7sBack=mkTex(texSign([{t:'무대 뒤 · 관계자 외 출입 금지'},{t:'BACKSTAGE · STAFF ONLY',s:8}],'#141414','#e8e8e0',240,36),false);
  TEX.e7sQuiet=mkTex(texSign([{t:'정숙 · 공연 중'},{t:'QUIET · PERFORMANCE',s:8}],'#7a1414','#ffffff',200,36),false);
  TEX.e7sDock=mkTex(texSign([{t:'장치 창고'},{t:'SCENE DOCK',s:9}],'#141414','#e8c820',160,36),false);
  TEX.e7sDress=mkTex(texSign([{t:'분장실'},{t:'DRESSING ROOMS',s:9}],'#141414','#e8e8e0',160,36),false);
  TEX.e7sCheck=mkTex(texSign([{t:'대피소 수용 인원 412명'},{t:'SHELTER · 412 REGISTERED',s:8}],'#e8e4d8','#1a1a1a',240,36),false)}
// ---------- geometry helpers ----------
const E7NZ={nosolid:true};
// a camp bed with a blanket thrown over it (along x or z)
function e7cot(x,z,ax,y){y=y||0;const L=1.95,W=.72;if(ax==='x'){B(x-L/2,y,z-W/2,x+L/2,y+.42,z+W/2,'cot');B(x-L/2+.25,y+.42,z-W/2+.03,x+L/2-.1,y+.5,z+W/2-.03,'e7blank',E7NZ)}
  else{B(x-W/2,y,z-L/2,x+W/2,y+.42,z+L/2,'cot');B(x-W/2+.03,y+.42,z-L/2+.25,x+W/2-.03,y+.5,z+L/2-.1,'e7blank',E7NZ)}}
// relief cartons stacked (n high)
function e7cartons(x,z,n,y){y=y||0;for(let i=0;i<n;i++){const o=(i%2)*.06;B(x-.4+o,y+i*.5,z-.32-o,x+.4+o,y+i*.5+.5,z+.32-o,'e7relief')}}
function e7pallet(x,z,y){y=y||0;B(x-.6,y,z-.5,x+.6,y+.14,z+.5,'pallet');B(x-.56,y+.14,z-.46,x+.56,y+1.16,z+.46,'e7wrap')}
// a city bus from x0,z0 along the axis (11 × 2.5 m), the front at the high end
function e7bus(x0,z0,ax){const L=11,W=2.5,LB=(a0,a1,c0,c1,y0,y1,m,oo)=>ax==='x'?B(x0+a0,y0,z0+c0,x0+a1,y1,z0+c1,m,oo):B(x0+c0,y0,z0+a0,x0+c1,y1,z0+a1,m,oo);
  const ends=ax==='x'?{px:'e7busF',nx:'e7busF'}:{pz:'e7busF',nz:'e7busF'};LB(.1,L-.1,0,W,.45,3.1,'e7bus',{f:ends});LB(.2,L-.2,.05,W-.05,3.1,3.22,'e6snowC',E7NZ);
  for(const a of [1.2,2.3,L-1.8])for(const c of [-.05,W-.3])LB(a,a+.9,c,c+.35,0,.95,'tire')}
// an ambulance (a box van, 6 × 2.2 m) along z, its cab at the low end
function e7amb(x,z0){const W=2.2,L=6.2;B(x-W/2,.4,z0+1.6,x+W/2,2.9,z0+L,'e7amb',{f:{pz:'e7ambF',nz:'e7ambR',py:'e7ambR'}});B(x-W/2,.4,z0,x+W/2,2.1,z0+1.6,'e7amb',{f:{nz:'e7ambF',px:'e7ambC',nx:'e7ambC',py:'e7ambR'}});
  B(x-W/2+.1,2.1,z0+.2,x+W/2-.1,2.16,z0+1.5,'e6snowC',E7NZ);B(x-W/2+.1,2.9,z0+1.7,x+W/2-.1,3,z0+L-.1,'e6snowC',E7NZ);B(x-.5,2.9,z0+1.7,x+.5,3.05,z0+2.1,'lampR',E7NZ);
  for(const z of [z0+.7,z0+L-1.2])for(const sd of [-1,1])B(sd<0?x-W/2-.02:x+W/2-.3,0,z,sd<0?x-W/2+.3:x+W/2+.02,.8,z+.75,'tire')}
// a pole with two loudspeaker horns (the shelter's broadcast) and a work lamp
function e7pole(x,z,face){B(x-.11,0,z-.11,x+.11,7.4,z+.11,'metal2');B(x-.5,6.6,z-.12,x+.5,6.8,z+.12,'metal2',E7NZ);
  for(const sd of [-1,1]){const hx=x+sd*.38;B(hx-.24,6.9,z-.24,hx+.24,7.4,z+.24,'e7horn',E7NZ)}B(x-.2,6.2,z-.2,x+.2,6.5,z+.2,'lampO',E7NZ);LIGHT(x,5.9,z,'#ffd8a0',9,.7,{lamp:1})}
// a lamp post with two glass globes
function e7lampP(x,z){B(x-.1,0,z-.1,x+.1,4.6,z+.1,'metal2');B(x-.7,4.4,z-.06,x+.7,4.5,z+.06,'metal2',E7NZ);for(const sd of [-1,1])B(x+sd*.6-.18,4.5,z-.18,x+sd*.6+.18,4.92,z+.18,'lampW',E7NZ);LIGHT(x,4.4,z,'#ffe8c8',13,1,{lamp:1})}
function e7bench(x,z,ax){if(ax==='x'){B(x-1,0,z-.25,x+1,.45,z+.25,'wood');B(x-1,.45,z+.2,x+1,.9,z+.28,'wood');B(x-1,.45,z-.25,x+1,.5,z+.2,'e6snowC',E7NZ)}else{B(x-.25,0,z-1,x+.25,.45,z+1,'wood');B(x+.2,.45,z-1,x+.28,.9,z+1,'wood');B(x-.25,.45,z-1,x+.2,.5,z+1,'e6snowC',E7NZ)}}
// a round column: a lit cylinder (marble) for looks, a square box inside it for collision
function e7col(x,z,y0,h,r,tex){MAP.deco.push({k:'drum',x,y:y0,z,r,h,mat:tex||'e7stone',rot:0});const s=r*.86;B(x-s,y0,z-s,x+s,y0+h,z+s,'metalx')}
// a relief tent: white canvas, a blue band, its sign over the door on the +x side (d0..d1 along z)
function e7tent(x0,z0,x1,z1,d0,d1){const h=2.5,t=.06;wallX(x0,x1,z0,z0+t,0,h,'e7tent');wallX(x0,x1,z1-t,z1,0,h,'e7tent');wallZ(x0,x0+t,z0+t,z1-t,0,h,'e7tent');wallZ(x1-t,x1,z0+t,z1-t,0,h,'e7tent',[[d0,d1,0,2.25]]);
  const cz=(z0+z1)/2,hw=(z1-z0)/2+.15;B(x0-.12,h,cz-hw,x1+.12,h+.26,cz+hw,'e7tent');B(x0-.12,h+.26,cz-hw*.62,x1+.12,h+.52,cz+hw*.62,'e7tent');B(x0-.14,h+.52,cz-hw*.62,x1+.14,h+.6,cz+hw*.62,'e6snowC',E7NZ);
  B(x1+.12,2.4,d0-.4,x1+.15,2.95,d1+.4,'e7sShelter',E7NZ)}
// a row of theatre seats (x0..x1 at z0..z1) standing on a floor at y
function e7seats(x0,x1,z0,z1,y){B(x0,y,z0,x1,y+.85,z1,'e7seat')}
// a speaker stack (o.eh: the boss fight's shootable prop) with a power box at its foot
function e7spk(x0,z0,x1,z1,h,i,px,pz){B(x0,0,z0,x1,h,z1,'e7spk',{eh:{k:'spk',i}});B(x0-.05,h,z0-.05,x1+.05,h+.12,z1+.05,'metal2',E7NZ);B(px-.3,0,pz-.3,px+.3,1.1,pz+.3,'e7pbox')}
function buildEp7(){
  const nz=E7NZ,PI=Math.PI;
  // ================= zone A: the square =================
  slab(-33,40,33,90,-1,0,'e6snow',[[-14,40,14,47.6]],{ground:1});B(-14,-1,40,14,0,47.6,'e7pave',{ground:1});
  // the shops west, the park's wall and railings east, a bank of ploughed snow south with the cars it buried
  B(-33,0,40,-30,7,88,'e7shop');B(-33.2,7,40,-29.6,7.5,88,'e6snowC',nz);B(-30,0,40,-28.2,.15,88,'e7pave');
  for(const z of [46,54,62,70,78,86])B(-30.02,4.6,z-1.6,-29.98,5.2,z+1.6,'e7poster',nz);
  B(30,0,40,31,1,88,'e7stone');B(30.45,1,40,30.55,2.6,88,'fence',{pass:1});for(let z=40;z<=88;z+=3)B(30.4,1,z-.05,30.6,2.7,z+.05,'metal2');B(30,1,40,31,1.08,88,'e6snowC',nz);
  B(-33,0,86,33,4.2,88.6,'e6snowG');e6car(-20,84.2,'x','carBurnt',1);e6car(-8,83.8,'x','car');e6car(9,84.4,'x','carR');e6truck(15,82.2,'x');
  for(const [x0,x1,z0,z1,h] of [[-30,-24,76,86,1.1],[24,30,70,86,1.4],[-30,-26,40,46,.9],[26,30,40,48,1.2]])B(x0,0,z0,x1,h,z1,'e6snowG');
  // the facade: limestone wings, the curtain wall in the middle, the doors (gate gA: chained sliding doors, opening into the wall)
  B(-33,0,39.4,-16,13,40,'e7fac');B(16,0,39.4,33,13,40,'e7fac');wallX(-16,16,39.4,40,0,13,'e7glass',[[-6,6,0,3.4]]);B(-33,12.2,39.3,33,13,40.1,'e7fac');
  B(-6.4,-.3,39.3,6.4,0,40.1,'e7pave',{ground:1});B(-6,0,39.55,0,3.4,39.85,'e7door',{gate:'gA',gs:[-6,0,0]});B(0,0,39.55,6,3.4,39.85,'e7door',{gate:'gA',gs:[6,0,0]});
  for(const x of [-6.1,5.9])B(x,0,39.4,x+.2,3.5,40.05,'e7rail',nz);B(-6.2,3.4,39.4,6.2,3.6,40.05,'e7rail',nz);
  B(-10,8.6,40,10,10.6,40.1,'e7sBig',nz);for(const x of [-21,19])B(x,3.4,40.02,x+2,11,40.08,'e7banner',nz);
  B(-33,13,4,33,13.6,40.2,'roof');B(-33,13.6,4,33,13.7,40.2,'e6snowC',nz);
  // the canopy over the doors
  B(-14,5.6,40,14,6.2,47.6,'metal2',{f:{ny:'e7canU'}});B(-14,6.2,40,14,6.3,47.6,'e6snowC',nz);for(const x of [-13.6,13.2])B(x,0,47,x+.4,5.6,47.4,'e7stone');
  B(-9,5.65,47.6,9,6.15,47.66,'e7sCenter',nz);for(const x of [-8,0,8])LIGHT(x,5.2,44,'#ffe8c8',10,.85);
  // the frozen fountain, its bronze singer (a round basin for looks; boxes inside it for collision)
  MAP.deco.push({k:'drum',x:0,y:0,z:64,r:5,h:.72,mat:'e7stone',rot:0},{k:'drum',x:0,y:0,z:64,r:4.55,h:.76,mat:'e7ice',rot:0});
  for(const [hx,hz] of [[4.5,1.5],[3.8,2.8],[2.8,3.8],[1.5,4.5]])B(-hx,0,64-hz,hx,.72,64+hz,'metalx');
  B(-1.1,.76,62.9,1.1,2.6,65.1,'e7stone');B(-.42,2.6,63.62,.42,4.3,64.38,'e7bronze');B(-.24,4.3,63.76,.24,4.84,64.24,'e7bronze');
  B(-1.25,3.9,63.82,-.42,4.08,64.18,'e7bronze',nz);B(.42,3.9,63.82,1.25,4.08,64.18,'e7bronze',nz);B(-1.42,4.08,63.86,-1.25,4.8,64.14,'e7bronze',nz);B(1.25,4.08,63.86,1.42,4.8,64.14,'e7bronze',nz);
  B(-1.12,2.6,62.88,1.12,2.66,65.12,'e6snowC',nz);
  // the relief tents west (cots inside), a field generator, fires in drums
  e7tent(-28,49,-22,55,51,53);e7tent(-28,58,-22,64,60,62);e7tent(-28,67,-22,73,69,71);
  for(const z of [50.6,53.4,59.6,62.4,68.6,71.4])e7cot(-26,z,'x');
  B(-20.6,0,75,-18,1.4,77,'metal',{f:{pz:'screen'}});B(-20.4,1.4,75.2,-18.2,1.5,76.8,'e6snowC',nz);for(const [x,z] of [[-19,57],[-19.4,66]]){drum(x,z,0,'drumR');MAP.fires.push([x,.9,z]);LIGHT(x,1.4,z,'#ff8a3a',8,.9)}
  for(const [x,z] of [[-21,46],[-21.4,47.2],[-18.6,79]])drum(x,z);e7pallet(-16.4,76.8);e7pallet(-15,78.2);e7cartons(-17.8,79.2,2);
  // the vehicles that brought them: two buses, an ambulance, cars left where they stopped
  e7bus(19.5,51,'z');e7bus(-6,78.2,'x');e7amb(10.5,49.2);e6car(-12,58,'z','car');e6car(14.5,70,'x','carR');e6car(-3,51,'x','carBurnt',1);
  // loudspeaker poles (the broadcast plays from them), lamp posts, benches, jersey barriers left by the evacuation
  for(const [x,z] of [[-22,46],[22,46],[-14,80],[14,80]])e7pole(x,z);for(const [x,z] of [[-8,52],[8,56],[-8,74],[8,76],[-19.5,63.5],[25,62]])e7lampP(x,z);
  for(const [x,z,ax] of [[-5,56,'x'],[5,72,'x'],[-14,64,'z'],[14,64,'z']])e7bench(x,z,ax);for(const [x,z,ax] of [[-12,46.4,'x'],[11.4,46.4,'x'],[24,56,'z'],[-2,70,'x']])e6jb(x,z,ax);
  // ================= zone B: the shelter foyer =================
  B(-27,-1,4,27,0,39.4,'e7marble',{ground:1});
  B(-27,0,4,-26,13,39.4,'e7wood');wallZ(26,27,4,39.4,0,13,'e7wood',[[7,10.4,0,3]],{f:{px:'e7bwall'}});B(-27,0,2,27,13,6,'e7wood',{f:{nz:'e7hwall'}});
  B(-27,11,4,27,11.4,39.4,'e7ceil');
  // the mezzanine (y 4.8) with its glass balustrade, the grand stair up to it (a carpet runner), the columns under its edge
  B(-26,4.4,6,26,4.8,14,'e7marble',{f:{ny:'e7ceil2'}});for(const [x0,x1] of [[-26,-5],[5,26]]){B(x0,4.8,13.9,x1,5.85,14,'e7gRail',{pass:1});B(x0,5.85,13.86,x1,5.92,14.04,'e7rail',nz)}
  stairs('z',-5,5,27,14,0,4.8,16,'e7stair');{const n=16,da=(14-27)/n,dy=4.8/n;for(let i=0;i<n;i++){const s0=27+da*(i+1),s1=27+da*i,top=dy*(i+1);B(-5.3,0,s0,-5,top+.95,s1,'e7marble');B(5,0,s0,5.3,top+.95,s1,'e7marble')}}
  for(const x of [-20,-11,11,20])e7col(x,14.4,0,4.4,.42,'e7stone');
  // under the mezzanine: the cloakroom, the hall's doors (chained), the PA desk where the broadcast was recorded
  B(-24,0,7,-14,1.1,8,'e7wood');B(-24,1.1,6,-14,1.14,8,'e7rail',nz);for(const x of [-11,9])B(x,0,6,x+2.6,2.6,6.06,'e7hdoor',nz);for(const x of [-7,4.4])B(x,4.8,6,x+2.6,7.4,6.06,'e7hdoor',nz);
  B(-3,2.6,6,3,3.3,6.06,'e7sHall',nz);B(-1.2,0,7.4,1.2,.78,8.6,'wood');B(-.9,.78,7.6,-.5,.9,8,'metal2',nz);B(.05,.78,7.8,.08,1.3,7.83,'metal2',nz);B(-.03,1.3,7.74,.14,1.42,7.9,'metal',nz);
  B(-6,2.4,6,-3.5,2.9,6.06,'e7sCheck',nz);
  // the box office (west), the café turned into a soup kitchen (east)
  B(-26,0,22,-22.6,1.15,32,'e7wood',{f:{px:'e7box'}});B(-23.4,1.15,22,-23.2,2.6,32,'win',{pass:1});B(-26,2.6,21.8,-22.4,3.4,32.2,'e7wood');B(-22.42,2.7,24,-22.38,3.3,30,'e7sBox',nz);
  B(21.6,0,21,23,1.1,31,'e7wood',{f:{nx:'e7cafe'}});B(25.4,0,21,26,2.4,31,'wood');B(25.38,2.5,23,25.42,3.4,29,'e7sCafe',nz);for(const z of [22,24.5,27,29.5])B(22,1.1,z,22.6,1.32,z+.6,'metal2',nz);
  for(const [x,z] of [[16.6,33.4],[17.4,30.2],[16.6,36.6]])B(x-.45,0,z-.45,x+.45,.76,z+.45,'wood');
  // the shelter: cots in rows, blankets, the relief stores along the east wall, a field kitchen, a decorated tree by the doors
  for(const xs of [[-14.6,-12.8,-11,-9.2,-7.4],[7.4,9.2,11,12.8,14.6]])for(const z of [17.6,20.6,31.8,34.8])for(const x of xs)e7cot(x,z,'z');
  for(const [x,z] of [[20,35],[21.4,36.6],[23,35.2],[24.6,37]])e7pallet(x,z);e7cartons(19,37.6,3);e7cartons(25,33,2);
  B(7.6,0,36.8,11.6,.86,37.8,'metal');for(const x of [8.4,10.6])B(x-.3,.86,37,x+.3,1.2,37.6,'metal2',nz);
  B(-19.8,0,34.2,-18.2,1.2,35.8,'wood');for(const [x,z] of [[-20.6,36.4],[-17.4,36.2],[-20.8,33.6],[-17.6,33.4]])B(x-.3,0,z-.3,x+.3,.5,z+.3,'e7gift');
  for(const z of [12,24])B(-25.98,1.6,z,-25.94,3.4,z+1.6,'e7poster',nz);for(const z of [15,34])B(25.94,1.6,z,25.98,3.4,z+1.6,'e7poster',nz);
  for(const [x,y,z] of [[-14,9.6,20],[14,9.6,20],[-14,9.6,32],[14,9.6,32],[0,9.6,26],[-18,4.1,10],[0,4.1,10],[18,4.1,10],[-22,3.2,27],[22,3.2,26]])LIGHT(x,y,z,'#ffd8a8',17,.95);LIGHT(-19,4.5,35,'#ffcc88',7,.7);
  B(25.98,3.3,7.6,26,3.9,9.8,'e7exit',nz);
  // the fire door east (gate gB: it slides into the wall)
  B(26.1,0,7,26.9,3,10.4,'e7fdoor',{gate:'gB',gs:[0,0,-3.2]});
  // ================= zone C: backstage (no power) =================
  B(27,-1,-66,48,0,10.4,'e7bfloor',{ground:1});
  B(48,0,-67,49,12.6,11.4,'e7bwall');B(27,0,-67,49,12.6,-66,'e7bwall');B(27,0,10.4,49,6,11.4,'e7bwall');
  // the wall between the hall and backstage (the house's side doors through it: gate gC)
  wallZ(24,27,-46.4,2,0,16,'e7bwall',[[-31,-27,0,3.4]],{f:{nx:'e7hwall',px:'e7bwall'}});B(24,0,-70,27,16,-46.4,'e7bwall');B(24,16,-72,26,22,-46.4,'e7bwall');
  B(23.9,-.3,-31.2,27.1,0,-26.8,'e7hfloor',{ground:1});B(24.2,0,-31,25.4,3.4,-29,'e7hdoor',{gate:'gC',gs:[0,0,-2.4]});B(24.2,0,-29,25.4,3.4,-27,'e7hdoor',{gate:'gC',gs:[0,0,2.4]});B(27.02,3.5,-30,27.06,4.1,-28,'e7exit',nz);
  // the south block: the service corridor, the rehearsal room (a piano, mirrors), ceilings at 4.2
  B(27,4.2,-14,48,4.6,10.4,'e7bwall');wallZ(33,33.4,-14,10.4,0,4.2,'e7bwall',[[3.6,6,0,2.6],[-10,-7.6,0,2.6]]);
  B(47.6,.6,-12,48,2.6,8,'e7mirror',nz);B(36,0,-12,39,1,-10.4,'e7piano');B(36.2,1,-12,38.8,1.06,-10.6,'e7piano',nz);for(const [x,z] of [[42,2],[40,-3],[44,-6],[38,6]])B(x-.25,0,z-.25,x+.25,.48,z+.25,'metal2');
  B(33.42,2.7,-1,33.46,3.3,3,'e7sBack',nz);
  // the scene dock (ceiling 12): scenery flats, road cases, a scissor lift, the loading door with snow under it; a catwalk at 6.5 along its west wall
  wallX(27,48,-14.4,-14,0,4.2,'e7bwall',[[27,33,0,4.2],[40,42.4,0,2.6]]);B(27,4.2,-14.4,48,12,-14,'e7bwall');B(27,12,-42,48,12.6,-14,'e7bwall');
  wallX(27,48,-42,-41.6,0,12,'e7bwall',[[27,32,0,4.2]]);
  B(27,6.2,-41.6,30.6,6.5,-16,'plate');B(30.6,6.5,-40.2,30.7,7.5,-16,'metal2',{pass:1});B(27,6.5,-16.1,30.7,7.5,-16,'metal2',{pass:1});
  stairs('x',-41.6,-40.2,44,30.6,0,6.5,22,'plate');
  for(const [x0,z0,x1,z1,h] of [[35,-24,35.3,-17,5.2],[38,-37,44,-36.7,4.4],[42,-24,42.3,-16.6,4.8],[33,-34,33.3,-28,4]])B(x0,0,z0,x1,h,z1,'e7flat');
  for(const [x,z,n] of [[38,-18,2],[45,-38,1],[34.6,-38.6,2],[44.6,-16,1],[37,-31,1]])for(let k=0;k<n;k++)B(x-.6,k*.9,z-.45,x+.6,k*.9+.9,z+.45,'e7case');
  B(39.4,0,-30.6,41.8,1.2,-26.6,'metal2');B(39.4,3.6,-30.6,41.8,3.8,-26.6,'plate');for(const [x,z] of [[39.5,-30.5],[41.7,-26.7]])B(x-.06,1.2,z-.06,x+.06,3.6,z+.06,'metal2',nz);
  B(47.7,0,-34,48,6,-26,'e6gate');B(45.4,0,-33.4,47.7,.36,-26.6,'e6snowG');B(47.6,6.2,-31,47.64,6.8,-29,'e7sDock',nz);
  B(46.6,0,-22,48,2.4,-18.5,'e7rack');B(27,6.5,-38.4,27.5,8.3,-36.2,'e7rack');
  // the dressing block: a corridor along the west, three rooms with lit mirrors and costume racks, the stage manager's desk at the end
  B(27,4.2,-66,48,4.6,-41.6,'e7bwall');wallZ(32,32.4,-66,-41.6,0,4.2,'e7bwall',[[-48,-46,0,2.6],[-56,-54,0,2.6],[-64,-62,0,2.6]]);
  for(const z of [-50,-58])B(32.4,0,z-.2,48,4.2,z+.2,'e7bwall');
  for(const [z0,z1] of [[-49.6,-42],[-57.6,-50.4],[-65.6,-58.4]]){B(47.4,.9,z0+.8,48,2.1,z1-.8,'e7mirror',nz);B(46.6,0,z0+.6,48,.85,z1-.6,'wood');B(38,0,(z0+z1)/2-1.6,38.6,1.8,(z0+z1)/2+1.6,'e7cost')}
  B(32.44,2.8,-47.6,32.48,3.4,-45,'e7sDress',nz);B(27.2,0,-65.6,30.2,1.1,-63.6,'e7rack');B(27.4,4.5,-41.6,30.4,5.1,-41.56,'e7sQuiet',nz);
  // the work lights (on again once the dimmers are) and the green exit signs
  for(const [x,y,z] of [[30,3.8,4],[30,3.8,-8],[40,3.8,3],[40,3.8,-8],[37,10.5,-20],[37,10.5,-34],[29,8.6,-28],[30,3.8,-50],[30,3.8,-60],[40,3.6,-46],[40,3.6,-54],[40,3.6,-62]])LIGHT(x,y,z,'#d8e4ff',12,.95);
  for(const [x0,y0,z0,x1,y1,z1] of [[26.98,3.2,1,27.02,3.6,3],[47.6,6.5,-30.6,47.64,6.9,-28.6],[33.42,3,-9.6,33.46,3.4,-8],[32.44,3,-63.6,32.48,3.4,-62.4]])B(x0,y0,z0,x1,y1,z1,'e7exit',nz);
  // ================= zone D: the main hall =================
  slab(-24,-46,24,2,-1,0,'e7hfloor',[[-10,-46,10,-42]],{ground:1});B(-10,-2.6,-46,10,-1.6,-42,'e7stage',{ground:1});
  B(-10,-2.6,-42,10,-1,-41,'e7wood');B(10,-2.6,-46,11,-1,-42,'e7wood');B(-11,-2.6,-46,-10,-1,-42,'e7wood');
  B(-24,0,-70,24,1.4,-46,'e7stage',{f:{pz:'e7apron'}});B(-10,-2.6,-47,10,0,-46,'e7apron');
  // the pit: its rail, a short stair at each end; the steps up onto the stage either side of it
  B(-8.5,0,-42.12,8.5,.95,-41.98,'none',{pass:1});B(-8.5,.9,-42.12,8.5,.97,-41.98,'e7rail',nz);for(let x=-8.4;x<=8.45;x+=1.2)B(x-.03,0,-42.08,x+.03,.9,-42.02,'e7rail',nz);stairs('x',-45.6,-42,6.8,10,-1.6,0,6,'e7stage');stairs('x',-45.6,-42,-6.8,-10,-1.6,0,6,'e7stage');
  stairs('z',10.6,13,-42.2,-46,0,1.4,4,'e7stage');stairs('z',-13,-10.6,-42.2,-46,0,1.4,4,'e7stage');
  // the proscenium (gilt frame), the main curtain behind it (gate gD: it rises), the valance in front
  const pf={f:{nz:'e7bwall'}};B(-24,0,-46.4,-13,16,-45.6,'e7pros',pf);B(13,0,-46.4,24,16,-45.6,'e7pros',pf);B(-13,10.5,-46.4,13,16,-45.6,'e7pros',pf);
  B(-13.6,1.4,-45.6,-13,10.5,-45.3,'e7gold',nz);B(13,1.4,-45.6,13.6,10.5,-45.3,'e7gold',nz);B(-13.6,10.5,-45.6,13.6,11.1,-45.3,'e7gold',nz);
  B(-13,1.4,-47.3,13,10.6,-46.9,'e7curt',{gate:'gD',gs:[0,9.4,0]});B(-13,9.4,-46.85,13,10.5,-46.45,'e7curtV',nz);
  // the stage house (to 22 m): its walls, the cyclorama, black legs masking the wings, the fly galleries at 9 (stairs up from the wings), battens
  B(-26,0,-72,-24,22,-46.4,'e7bwall');B(-26,0,-72,26,22,-70,'e7bwall');B(-26,22,-72,26,22.6,-46.4,'e7bwall');B(-24,16,-46.4,24,22,-45.6,'e7bwall');
  B(-15,1.4,-69.95,15,14,-69.9,'e7cyc',nz);
  for(const z of [-50,-55,-60])for(const sd of [-1,1])B(sd>0?13.4:-15.4,1.4,z-.05,sd>0?15.4:-13.4,10.4,z+.05,'e7legs',nz);
  for(const sd of [-1,1]){const xi=sd*19.4,xo=sd*21.4,sx0=sd>0?21.6:-23.6,sx1=sd>0?23.6:-21.6;B(Math.min(xi,xo),8.7,-64,Math.max(xi,xo),9,-48,'plate');B(sd>0?19.4:-24,8.7,-66,sd>0?24:-19.4,9,-64,'plate');
    B(sd>0?19.4:-19.5,9,-64,sd>0?19.5:-19.4,10,-48,'metal2',{pass:1});stairs('z',sx0,sx1,-49,-64,1.4,9,19,'plate')}
  for(const z of [-50,-53.5,-57,-60.5,-64]){B(-14,9.8,z-.06,14,9.92,z+.06,'metal2',nz);if(z>-58)for(let x=-12;x<=12;x+=3)B(x-.18,9.4,z-.16,x+.18,9.8,z+.16,'lampW',nz)}
  // the stage: a grand piano, a microphone stand, road cases in the wings, choir chairs upstage
  B(-9.6,2.1,-56,-6.4,2.5,-53,'e7piano');for(const [x,z] of [[-9.2,-55.6],[-6.8,-55.6],[-8,-53.4]])B(x-.06,1.4,z-.06,x+.06,2.1,z+.06,'e7piano',nz);B(-6.6,2.5,-55.8,-6.5,3.4,-53.2,'e7piano',nz);
  B(-.02,1.4,-48.6,.02,2.9,-48.56,'metal2',nz);B(-.06,2.9,-48.64,.06,3.02,-48.52,'metal',nz);
  for(const [x,z,n] of [[-19,-58,2],[19.4,-56,1],[18.6,-62,2],[-18.4,-52,1],[7.6,-61.6,1],[10,-60,1]])for(let k=0;k<n;k++)B(x-.6,1.4+k*.9,z-.45,x+.6,1.4+k*.9+.9,z+.45,'e7case');
  for(let x=-8;x<=8;x+=1.6)B(x-.25,1.4,-66.2,x+.25,1.86,-65.7,'metal2');
  // the house: red fabric walls, the dark ceiling with its gilt rings, the rear platform (seats on it), the balconies at 4.4, boxes above them
  B(-26,0,-46,-24,16,2,'e7hwall');B(-24,13,2,24,16,4,'e7hwall');B(-26,16,-46.4,26,16.6,4,'e7hceil');
  B(-24,0,-10,24,1.2,2,'e7carpet',{f:{nz:'e7balc'}});for(const [x0,x1] of [[-24,-13],[-10,-1.5],[1.5,10],[13,24]])B(x0,1.2,-10.25,x1,2.05,-10,'e7balc');
  for(const [x0,x1] of [[-13,-10],[-1.5,1.5],[10,13]])stairs('z',x0,x1,-14,-10,0,1.2,4,'e7carpet');
  for(const z of [-8.6,-6.6,-4.6,-2.6,-.6])for(const [x0,x1] of [[-21.4,-13.4],[-10,-2],[2,10],[13.4,21.4]])e7seats(x0,x1,z,z+.5,1.2);
  for(const sd of [-1,1]){const xw=sd>0?20.4:-24,xe=sd>0?24:-20.4,px0=sd>0?20.4:-20.7,px1=sd>0?20.7:-20.4;
    B(xw,4,-44,xe,4.4,-8,'e7carpet',{f:{ny:'e7hceil',px:'e7balc',nx:'e7balc'}});B(px0,4.4,-44,px1,5.35,-8,'e7balc');stairs('z',sd>0?21.8:-24,sd>0?24:-21.8,-1,-8,1.2,4.4,11,'e7carpet');
    B(sd>0?21.4:-24,7.4,-44,sd>0?24:-21.4,7.8,-37,'e7carpet',{f:{ny:'e7hceil',px:'e7balc',nx:'e7balc'}});B(sd>0?21.4:-21.7,7.8,-44,sd>0?21.7:-21.4,8.7,-37,'e7balc')}
  // the four speaker stacks (two at the stage's corners, two delay towers in the stalls), the chandelier's chain, its winch on the west wall
  e7spk(-16.4,-45.4,-14.6,-43.8,4.8,0,-17.2,-44.6);e7spk(14.6,-45.4,16.4,-43.8,4.8,1,17.2,-44.6);e7spk(-17.6,-18.6,-16,-17,5.4,2,-18.4,-17.8);e7spk(16,-18.6,17.6,-17,5.4,3,18.4,-17.8);
  B(-.1,12.6,-26.1,.1,16,-25.9,'metal2',{eh:{k:'chain',i:0}});B(-24,0,-25,-23.5,1.7,-23,'e7winch');B(-23.95,1.7,-24.2,-23.9,12.6,-24.1,'metal2',nz);B(-23.95,12.5,-26.1,-.1,12.6,-25.9,'metal2',nz);
  // the stalls as the shelter left them: the sound desk, cots, cartons, water, stacked seats along the walls
  B(-3,0,-18.4,3,1.15,-16,'e7case');B(-3,1.15,-16.2,3,1.5,-16,'metal2',nz);
  for(const [x,z] of [[-12,-22],[-13.8,-22],[12,-21],[13.8,-21],[-8,-34],[-6.2,-34],[8.4,-36],[6.6,-36]])e7cot(x,z,'z');
  for(const [x,z,n] of [[-14,-32,3],[13,-30,2],[-6,-27,1],[7,-24,2],[-20,-12,3],[20.6,-13,2],[-9,-40,2],[10.4,-40,1]])e7cartons(x,z,n);
  for(const [x,z] of [[-19,-36],[-19,-34.4],[19.6,-33],[-2.6,-20.6]])e7pallet(x,z);
  for(const [x0,z0,x1,z1] of [[-23.6,-41,-21,-40.5],[21,-38,23.6,-37.5],[-23.6,-30,-21.4,-29.5]])B(x0,0,z0,x1,.85,z1,'e7seat');
  // lights: the stage wash, the cyclorama's blue, sconces on the walls and the balcony fronts, the exit signs
  for(const [x,y,z,c,r,i] of [[0,8.5,-51,'#ffe2b8',20,1.15],[-9,8.5,-58,'#ffd8b0',14,.9],[9,8.5,-58,'#ffd8b0',14,.9],[0,4,-66,'#5a7aff',14,.85],[0,-.6,-44,'#4a6aff',7,.6]])LIGHT(x,y,z,c,r,i);
  for(const z of [-38,-28,-18,-6])for(const sd of [-1,1])LIGHT(sd*23.4,3.4,z,'#ffc888',8,.65);for(const [x,z] of [[-12,-36],[12,-36],[-12,-20],[12,-20],[0,-30],[0,-8]])LIGHT(x,14.6,z,'#ffd8a8',21,.8);for(const z of [-36,-20])for(const sd of [-1,1])LIGHT(sd*20.2,5.6,z,'#ffd098',6,.5);
  for(const [x0,y0,z0,x1,y1,z1] of [[-24,3.6,1.94,-21,4.2,2],[21,3.6,1.94,24,4.2,2],[-23.98,3.6,-31,-23.94,4.2,-28.6]])B(x0,y0,z0,x1,y1,z1,'e7exit',nz);
  // ================= spawns, zones, gates, devices =================
  const A=[[-4.5,0,46.4,PI],[-1.5,0,46.4,PI],[1.5,0,46.4,PI],[4.5,0,46.4,PI],[-3,0,44.8,PI],[0,0,44.8,PI],[3,0,44.8,PI],[-6,0,44.8,PI]];
  const Bs=[[-4.5,0,37.2,0],[-1.5,0,37.2,0],[1.5,0,37.2,0],[4.5,0,37.2,0],[-3,0,35.6,0],[0,0,35.6,0],[3,0,35.6,0],[-6,0,35.6,0]];
  const Cs=[[28.6,0,6,0],[30.4,0,6,0],[32.2,0,6,0],[28.6,0,4,0],[30.4,0,4,0],[32.2,0,4,0],[29.5,0,2,0],[31.3,0,2,0]];
  const Ds=[[19,0,-26,PI/2],[19,0,-28.5,PI/2],[19,0,-31,PI/2],[21,0,-26.6,PI/2],[21,0,-29,PI/2],[21,0,-31.4,PI/2],[17,0,-27.4,PI/2],[17,0,-30.2,PI/2]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  const zA=[[-26,84.4],[-12,84.6],[2,84.8],[16,84.6],[24,82],[-28,60],[28,52],[-27,44],[27,44]];
  const zB=[[-25,16],[-24.6,30],[25,34],[-25,9,4.8],[25,9,4.8],[-20,8],[0,38.6],[22,8]];
  const zC=[[45,0,-29.6],[45,0,8],[44,0,-62],[44,0,-46],[30,0,-40],[29,6.5,-38],[37,0,-6],[44,0,-54]];
  const zD=[[-22.6,1.2,.6],[22.6,1.2,.6],[0,1.2,1],[-20,1.4,-60],[20,1.4,-60],[0,-1.6,-44],[-22,1.4,-48],[22,1.4,-48]];
  MAP.zspawns=[].concat(zA,zB,zC.map(p=>[p[0],p[2],p[1]]),zD.map(p=>[p[0],p[2],p[1]]));
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-30,40,30,86],start:A,zsp:zA},B:{box:[-26,6,26,39.4],start:Bs,zsp:zB},C:{box:[27,-66,48,10.4],start:Cs,zsp:zC.map(p=>[p[0],p[2],p[1]])},D:{box:[-24,-70,24,2],start:Ds,zsp:zD.map(p=>[p[0],p[2],p[1]])}},
    door:{A:[0,1.5,39.7],B:[26.5,1.5,8.7],C:[24.8,1.5,-29]},
    // stage 2: trace the broadcast from three points in the foyer, in turn (20 s each, nobody infected inside)
    dfind:[{x:-19.4,y:0,z:27,r:3,n:['역탐지 1 · 매표소','Trace 1 · the box office']},{x:0,y:4.8,z:9.6,r:3.2,n:['역탐지 2 · 2층 로비','Trace 2 · the mezzanine']},{x:18.8,y:0,z:25.4,r:3,n:['역탐지 3 · 카페','Trace 3 · the café']}],
    // stage 3: the three dimmer racks backstage (9 s each, any order)
    dim:[dv(45.4,0,-20.2,['조광기 1 · 장치 창고','Dimmers 1 · the scene dock'],['전원 올리기','switch them on'],9,-.4,0),dv(28.4,6.5,-37.3,['조광기 2 · 작업 통로','Dimmers 2 · the catwalk'],['전원 올리기','switch them on'],9,.4,0),
      dv(30.9,0,-62.6,['조광기 3 · 무대 감독석','Dimmers 3 · the stage manager\'s desk'],['전원 올리기','switch them on'],9,.4,0)],
    // stage 3's first meeting: where LORELEI sings on the catwalk (its north half: the dimmers are by the stair at its south end), the other
    // end of her walk, the hatch she leaves by (the north end)
    meet:{a:[29,6.5,-21.5],b:[29,6.5,-29],hatch:[28.6,6.5,-17]},
    // the boss fight: her places on the stage, her perches (fly galleries, the upper boxes, the balconies), the floor she hunts on,
    // the speakers (box i, its power box bx bz), the chandelier (its drop circle, the winch), cover in the house
    stageP:[[-9,1.4,-49.6],[0,1.4,-48.8],[9,1.4,-49.6],[-5,1.4,-54.6],[5,1.4,-54.6],[0,1.4,-58]],
    perch:[{x:-20.4,y:9,z:-55},{x:20.4,y:9,z:-55},{x:-22.7,y:7.8,z:-40.5},{x:22.7,y:7.8,z:-40.5},{x:-22.2,y:4.4,z:-28},{x:22.2,y:4.4,z:-20},{x:0,y:1.4,z:-49}],
    floorP:[[-10,0,-30],[10,0,-30],[0,0,-22],[-14,0,-18],[14,0,-18],[0,0,-36],[-6,0,-26],[6,0,-26]],
    spk:[{i:0,x:-15.5,z:-44.6,h:4.8,w:1.8,bx:-17.2,bz:-44.6},{i:1,x:15.5,z:-44.6,h:4.8,w:1.8,bx:17.2,bz:-44.6},{i:2,x:-16.8,z:-17.8,h:5.4,w:1.6,bx:-18.4,bz:-17.8},{i:3,x:16.8,z:-17.8,h:5.4,w:1.6,bx:18.4,bz:-17.8}],
    chand:{x:0,y:11.2,z:-26,r:5.5,lever:{x:-22.9,z:-24}},
    cover:[[-12,0,-24],[12,0,-23],[-8,0,-36],[8,0,-38],[-14,0,-30],[13,0,-28],[-5,0,-28],[7,0,-26],[0,0,-16],[-19,0,-38],[19.6,0,-35],[0,0,-21],[-16,0,-12],[16,0,-12],[-10,1.2,-8],[10,1.2,-8],[-21.6,4.4,-24],[21.6,4.4,-30]],
    pad:[0,0,-26]};
  MAP.camps=[{k:'a',w:.2,p:[[0,0,47],[-2,0,47]],look:[0,1,66]},{k:'b',w:.2,p:[[0,0,30]],look:[0,1,14]},{k:'c',w:.2,p:[[30,0,-20]],look:[38,1,-30]},{k:'d',w:.2,p:[[0,0,-20]],look:[0,2,-48]}];
  MAP.moon={d:new THREE.Vector3(-.4,.5,.76).normalize(),c:new THREE.Color('#8a94b4'),i:.32};MAP.spawnYaw=PI;
  MAP.dyn.push([-19,4.6,35,'#ffb070',8,.8,.35]);
  MAP.cam=(t,cam)=>{const a=t*.04;cam.position.set(Math.sin(a)*28,8,72+Math.cos(a)*10);cam.lookAt(0,7,40)}}
// ---------- the meshes boxes cannot make: pines in the park, the foyer's decorated tree (its lights blink: E7GLOW) ----------
const E7GLOW={L:[]};
function ep7Mesh(scene){
  const put=(g,tex,emis,col)=>{const n=g.attributes.position.count;g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3).fill(col==null?1:col),3));const m=new THREE.Mesh(g,matWorld(TEX[tex],{emis:emis||0}));m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);MAP.meshes.push(m);return m};
  const cone=(x,y,z,r,h,tex,col,emis)=>{const g=new THREE.ConeGeometry(r,h,10,1,true);g.translate(x,y+h/2,z);const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*3,U.getY(i)*2);return put(g,tex,emis,col)};
  // the park east of the square: snowed pines over the railings
  for(const [x,z,s] of [[34,46,1],[36.4,55,1.2],[34.6,63,.9],[37,71,1.1],[34.4,79,1],[38,86,1.3],[40,50,1.1],[41,66,1.2]]){cone(x,0,z,.25*s,2*s,'e7fir',.3);for(let k=0;k<3;k++)cone(x,1.4*s+k*1.6*s,z,(2.2-k*.55)*s,2.6*s,'e7pine',.42)}
  // the foyer's tree: three tiers, a star on top
  for(let k=0;k<4;k++)cone(-19,1.2+k*1.25,35,1.9-k*.42,1.9,'e7fir',.7);
  E7GLOW.L=[];const tex=E7GLOW.tex||(E7GLOW.tex=(()=>{const [cv,x]=mkCanvas(32,32);const gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(cv)})());
  const cols=[0xff4a3a,0xffd040,0x4aa8ff,0x5aff7a,0xff7ad8];
  for(let i=0;i<34;i++){const k=i%4,tier=Math.floor(i/4)%4,a=i*2.39,h=1.4+tier*1.25+hash2(i,1,7601)*1.1,r=Math.max(.25,(1.9-tier*.42)*(1-(h-1.2-tier*1.25)/1.9)*.92);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:cols[i%cols.length],transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(-19+Math.cos(a)*r,h,35+Math.sin(a)*r);
    sp.scale.set(.32,.32,1);sp.renderOrder=5;scene.add(sp);MAP.meshes.push(sp);E7GLOW.L.push({sp,ph:hash2(i,2,7601)*TAU,s:.32,k})}
  {const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:0xffe890,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.position.set(-19,7,35);sp.scale.set(1.1,1.1,1);sp.renderOrder=5;scene.add(sp);MAP.meshes.push(sp);E7GLOW.L.push({sp,ph:0,s:1.1,k:-1})}}
MAPDEFS.ep7={n:['한설 아트센터 대피소','Hanseol Arts Center Shelter'],d:['눈 내리는 밤, 봉쇄선 밖 한설시의 아트센터. 대피소였던 곳에서 아직 방송이 흘러나온다. 광장 → 대피소 로비 → 무대 뒤 → 대공연장.','A snowy night at the arts center of Hanseol, beyond the line. It was the shelter, and its broadcast is still playing: the square, the shelter foyer, backstage, then the main hall.'],
  env:{sky:1,skyTex:'e7sky',noStars:1,snow:1,fog:'#1c2230',fogD:.015,skyFog:.55,halo:'#8a7a8a',ambOut:'#2c3446',ambIn:'#1e2028',boAmb:.45},bounds:[-36,-74,50,92],probeY:[-1,.9,2.4,4.2,6.4,9.4],
  build:buildEp7,tex:bakeEp7Tex,mesh:ep7Mesh,ep:7};

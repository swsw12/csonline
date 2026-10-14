'use strict';
// ============ Map "새벽 종합병원 Saebyeok General Hospital" (v6.54): materials and textures (the map itself: mapho.js) ============
// Every texture is painted on first load. Wall textures tile with the floor height (4.2 m: sv 4.2, vo 0) so the window bands, the handrails
// and the skirting line up on every floor; cs keeps the big faces coarse (vertex light in 1–2 m cells) so the map stays light.
Object.assign(MATS,{
  // ground and outdoors
  hoAsph:{t:'asph',s:3,cs:2,k:'soft'},hoPave:{t:'hoPave',s:2,cs:1.5,k:'stone'},hoGrass:{t:'hoGrass',s:3,cs:2,k:'soft'},hoSoil:{t:'dirt',s:2.5,cs:1.5,k:'soft'},
  hoCurb:{t:'hoCurb',s:1,cs:1,k:'stone'},hoBrick:{t:'brick',s:2,cs:1.5,k:'stone'},hoConc:{t:'conc',s:2,cs:1.5,k:'stone'},hoConcF:{t:'concf',s:2,cs:2,k:'stone'},
  hoLineW:{t:'hoLineW',s:1,cs:2,k:'soft'},hoLineY:{t:'hoLineY',s:1,cs:2,k:'soft'},hoLineG:{t:'hoLineG',s:1,cs:2,k:'stone'},hoLineB:{t:'hoLineB',s:1,cs:2,k:'stone'},hoLineO:{t:'hoLineO',s:1,cs:2,k:'stone'},
  hoLeafG:{t:'hoLeafG',s:2,cs:1.5,k:'soft'},hoLeafY:{t:'hoLeafY',s:2,cs:1.5,k:'soft'},hoHedge:{t:'hoHedge',s:1.5,cs:1,k:'soft'},hoWater:{t:'hoWater',s:2,cs:1.5,emis:.05,k:'glass'},
  hoWood:{t:'hoWood',s:1.5,cs:1,k:'wood'},hoMil:{t:'hoMil',s:2,cs:1,k:'metal'},hoTape:{t:'hoTape',uv:'boxV',s:1.6,k:'soft'},
  // the buildings
  hoFacade:{t:'hoFacade',s:8.4,sv:4.2,cs:1.5,k:'stone'},hoPanel:{t:'hoPanel',s:2,cs:1.5,k:'metal'},hoGlassW:{t:'hoGlassW',s:1.5,sv:4.2,cs:2,k:'glass'},
  hoWallWin:{t:'hoWallWin',s:8.4,sv:4.2,cs:1,k:'stone'},hoWall:{t:'hoWall',s:4,sv:4.2,cs:1,k:'stone'},hoWallB:{t:'hoWallB',s:4,sv:4.2,cs:1,k:'stone'},hoWallC:{t:'hoWallC',s:4,sv:4.2,cs:1,k:'stone'},
  hoTile:{t:'hoTile',s:1.2,cs:1,k:'stone'},hoFloor:{t:'hoFloor',s:2,cs:1,k:'stone'},hoFloorL:{t:'hoFloorL',s:2,cs:1,k:'stone'},hoFloorG:{t:'hoFloorG',s:2,cs:1,k:'stone'},hoFloorW:{t:'hoFloorW',s:2.4,cs:1,k:'wood'},
  hoCeil:{t:'hoCeil',s:1.2,cs:1.5,k:'stone'},hoParkF:{t:'hoParkF',s:3,cs:1.5,k:'stone'},hoStair:{t:'hoStair',s:1,k:'stone'},hoEsc:{t:'hoEsc',s:1,k:'metal'},
  hoLamp:{t:'hoLamp',uv:'box',emis:1.25,k:'glass'},hoLampW:{t:'lampW',uv:'box',emis:1.3,k:'glass'},hoLampR:{t:'lampR',uv:'box',emis:1.2,k:'glass'},hoLed:{t:'hoLed',uv:'box',emis:1.4,k:'glass'},
  hoBeacon:{t:'hoBeacon',uv:'box',emis:1.3,k:'glass'},hoSpot:{t:'hoSpot',uv:'box',emis:1.2,k:'glass'},hoWinLit:{t:'hoWinLit',uv:'box',emis:.7,k:'glass'},
  hoRail:{t:'hoRail',uv:'boxV',s:2,cs:1.5,k:'glass'},hoSkyG:{t:'hoSkyG',s:2,cs:2,k:'glass'},hoGlassP:{t:'hoGlassP',uv:'boxV',s:1.2,cs:1,k:'glass'},
  hoDoor:{t:'hoDoor',uv:'box',k:'wood'},hoDoorB:{t:'hoDoorB',uv:'box',k:'wood'},hoDoorF:{t:'hoDoorF',uv:'box',k:'metal'},hoDoorS:{t:'hoDoorS',uv:'box',k:'metal'},hoElev:{t:'hoElev',uv:'box',k:'metal'},
  // furniture and equipment
  hoSheetZ:{t:'hoSheetZ',uv:'box',k:'soft'},hoSheetX:{t:'hoSheetX',uv:'box',k:'soft'},hoBedP:{t:'hoBedP',uv:'box',cs:1,k:'metal'},hoCurtain:{t:'hoCurtain',uv:'box',cs:1.2,k:'soft'},
  hoSeat:{t:'hoSeat',s:.6,cs:1,k:'soft'},hoDesk:{t:'hoDesk',uv:'boxV',s:2.4,cs:1,k:'wood'},hoTop:{t:'hoTop',s:1,k:'wood'},
  hoShelfP:{t:'hoShelfP',uv:'boxV',s:1.2,k:'wood'},hoShelfS:{t:'hoShelfS',uv:'boxV',s:1.2,k:'wood'},hoShelfL:{t:'hoShelfL',uv:'boxV',s:1.2,k:'wood'},
  hoFridge:{t:'hoFridge',uv:'boxV',s:1,emis:.45,k:'glass'},hoVend:{t:'hoVend',uv:'box',emis:.4,k:'metal'},hoMach:{t:'hoMach',s:1,cs:1,k:'metal'},hoMachD:{t:'hoMachD',s:1,cs:1,k:'metal'},
  hoAmb:{t:'hoAmb',uv:'box',k:'metal'},hoAmbW:{t:'hoAmbW',s:2,cs:1,k:'metal'},hoHVAC:{t:'hoHVAC',s:1.2,k:'metal'},hoFan:{t:'hoFan',uv:'box',k:'metal'},hoBin:{t:'hoBin',s:1.2,k:'soft'},hoBinR:{t:'hoBinR',uv:'box',k:'soft'},
  hoHeli:{t:'hoHeli',uv:'box',cs:1.5,k:'stone'},hoHeliB:{t:'hoHeliB',s:2,k:'metal'},hoPoster:{t:'hoPoster',uv:'box',k:'soft'},hoPoster2:{t:'hoPoster2',uv:'box',k:'soft'},
  hoApt:{t:'hoApt',s:12,sv:11.2,cs:6,emis:.45,k:'stone'},hoAptB:{t:'hoAptB',s:12,sv:11.2,cs:6,emis:.45,k:'stone'},hoSolar:{t:'hoSolar',s:2,cs:2,k:'glass'},
  // signs (emissive ones glow and bloom)
  hoSignH:{t:'hoSignH',uv:'box',emis:1.1,k:'metal'},hoSignER:{t:'hoSignER',uv:'box',emis:.9,k:'metal'},hoSignP:{t:'hoSignP',uv:'box',emis:.8,k:'metal'},hoSignDir:{t:'hoSignDir',uv:'box',emis:.25,k:'metal'},
  hoSnRec:{t:'hoSnRec',uv:'box',emis:.3,k:'metal'},hoSnPh:{t:'hoSnPh',uv:'box',emis:.3,k:'metal'},hoSnCS:{t:'hoSnCS',uv:'box',emis:.4,k:'metal'},hoSnRad:{t:'hoSnRad',uv:'box',emis:.3,k:'metal'},
  hoSnOPD:{t:'hoSnOPD',uv:'box',emis:.3,k:'metal'},hoSnICU:{t:'hoSnICU',uv:'box',emis:.3,k:'metal'},hoSnOR:{t:'hoSnOR',uv:'box',emis:.4,k:'metal'},hoSnWard:{t:'hoSnWard',uv:'box',emis:.3,k:'metal'},
  hoSnEmg:{t:'hoSnEmg',uv:'box',emis:.5,k:'metal'},hoSnIso:{t:'hoSnIso',uv:'box',emis:.4,k:'metal'},hoSnBus:{t:'hoSnBus',uv:'box',emis:.2,k:'metal'},
  hoF1:{t:'hoF1',uv:'box',k:'stone'},hoF2:{t:'hoF2',uv:'box',k:'stone'},hoF3:{t:'hoF3',uv:'box',k:'stone'},hoFR:{t:'hoFR',uv:'box',k:'stone'},
  hoP1:{t:'hoP1',uv:'box',k:'stone'},hoP2:{t:'hoP2',uv:'box',k:'stone'},hoP3:{t:'hoP3',uv:'box',k:'stone'},
});

// ---------- textures ----------
const HO_FONT='bold %px "Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
const hoFont=px=>HO_FONT.replace('%',Math.round(px));
// height in metres above the floor → canvas row (row 0 = the top of a 4.2 m texture)
const hoRow=(h,H)=>Math.round(H-1-h/4.2*H);
// sidewalk blocks: a running bond of 20 × 10 cm bricks in greys, a few faded red ones, moss in the joints
function texHoPave(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++){const r=Math.floor(y/13),ry=y%13,off=(r%2)*13;
    for(let x=0;x<N;x++){const rx=(x+off)%26,id=r*11+Math.floor((x+off)/26);const red=hash2(id,4,6101)<.12;
      let t=.55+(hash2(id,1,6102)-.5)*.3+(P.n(x,y,32,6103,3)-.5)*.25+(hash2(x,y,6104)-.5)*.08;if(ry<1||rx<1)t=.06;
      let c=dith(P,x,y,clamp(t,0,1),red?['#3a2420','#5a3430','#6e4038','#7e4a40','#8a5448']:['#3a3c3e','#56585a','#6a6c6c','#7c7e7c','#8c8e8a','#9a9c96'],.08);
      if((ry<1||rx<1)&&P.n(x,y,16,6105,2)>.6)c='#2e3a26';P.set(x,y,c)}}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,6106)*N,hash2(i,2,6106)*N,12+hash2(i,3,6106)*16,10+hash2(i,4,6106)*10,.18,6107+i)})}
function texHoCurb(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let t=.55+(P.n(x,y,16,6111,3)-.5)*.3+(hash2(x,y,6112)-.5)*.2;if(x%64<1)t=.15;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#4e5052','#686a6a','#7e807e','#929490','#a4a6a0'],.1))}})}
// lawn at dawn: dewy, blue-green, a few dry patches and fallen ginkgo leaves
function texHoGrass(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,6121,4),b=P.n(x,y,64,6122,3);
    let c=dith(P,x,y,.45+(n-.5)*.7+(hash2(x,y,6123)-.5)*.2,['#14261a','#1c3220','#243e26','#2e4a2c','#385632','#44623a'],.14);
    if(b>.64)c=mix(c,dith(P,x,y,.5+(n-.5)*.4,['#3a3624','#4a442c','#5a5234'],.1),clamp((b-.64)*6,0,.8));
    if(hash2(x,y,6124)<.006)c='#a8b8b0';if(hash2(x>>1,y>>1,6125)<.004)c=rpickH(x*7+y,['#d8b830','#e0c040','#c8a028']);P.set(x,y,c)}})}
// road paint and floor guide lines: one colour, a little worn
function texHoLine(col,seed){return paint(32,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let c=dith(P,x,y,.55+(P.n(x,y,8,seed,2)-.5)*.4,[dk(col,.25),dk(col,.1),col,lt(col,.1)],.1);
    if(hash2(x,y,seed+1)<.05)c=dk(col,.4);P.set(x,y,c)}})}
// the outer wall of the hospital: white aluminium panels, and per floor a band of four windows (2.1 m each) that mirror the dawn sky;
// some have their blinds down, some show a lit room behind
function texHoFacade(){const W=512,H=256;return paint(W,H,P=>{
  for(let y=0;y<H;y++){const hm=(H-1-y)/H*4.2;for(let x=0;x<W;x++){const wi=Math.floor(x/128),wx=x%128;let c;
    if(hm>=1&&hm<3.2){if(wx<4||wx>=124)c=wx<2||wx>=126?'#2a2e34':'#4a5058';else if(hm<1.06||hm>3.13)c='#4e545c';
      else{const t=(hm-1)/2.2,bl=[.25,.85,.5,.05][wi],sh=[0,1,0,1][wi];
        c=mix(mix('#1a2438','#5a6c94',Math.pow(t,1.3)),'#c89aa8',clamp((t-.75)*2.4,0,.55));
        if(((wx*.8+y)|0)%91<5||((wx*.8+y)|0)%137<2)c=mix(c,'#d8e2f0',.45);
        if(t>1-bl){const sy=(y%5);c=sy<1?'#5a5e66':mix('#b8bcc0','#9aa0a8',hash2(wi,y,6131)*.5)}
        else if(sh&&wx>20&&wx<60&&t<.6)c=mix(c,'#3a2a20',.4)}}
    else{let t=.55+(P.n(x,y,48,6132,3)-.5)*.2+(hash2(x,y,6133)-.5)*.06;if(Math.abs(hm-.45)<.025||Math.abs(hm-3.75)<.025)t=.12;if(x%128<1)t=.2;
      c=dith(P,x,y,clamp(t,0,1),['#7c8084','#9a9e9e','#b0b4b0','#c2c6c0','#ced2cc','#d8dad4'],.06);
      if(hm>=.9&&hm<1)c=hm>.97?'#9aa0a4':'#6a7076';if(hm>=3.2&&hm<3.3)c='#6e747a'}
    P.set(x,y,c)}}
  for(let i=0;i<14;i++){const x=Math.floor(hash2(i,1,6134)*W);streak(P,x,hoRow(.9,H),20+Math.floor(hash2(i,2,6134)*30),.12,2);streak(P,x+40,hoRow(4.2,H)+1,14,.1,2)}})}
// plain cladding (parapets, the roof's huts, the canopy fascia)
function texHoPanel(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let t=.55+(P.n(x,y,32,6141,3)-.5)*.2+(hash2(x,y,6142)-.5)*.06;if(x%64<1||y%64<1)t=.15;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#7c8084','#9a9e9e','#b0b4b0','#c2c6c0','#ced2cc'],.06))}
  for(let i=0;i<5;i++)streak(P,Math.floor(hash2(i,1,6143)*128),0,40,.12,2)})}
// the entrance glass: mullions every 1.5 m, a transom at the door head (2.9 m) and at the floor line; the panes cut out but for a few glints
function texHoGlassW(){const W=128,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++){const hm=(H-1-y)/H*4.2;for(let x=0;x<W;x++){
    if(x<3||x>=125||hm<.08||Math.abs(hm-2.95)<.05||hm>4.1)P.set(x,y,x===1||x===126?'#565c64':'#2c3036');
    else if((((x*.7+y)|0)%150)<2||(((x*.7+y+40)|0)%150)<1)P.set(x,y,'#c8d6ea')}}})}
// interior wall: a painted upper wall, a wooden handrail at 0.9 m, a vinyl wainscot below it, a dark skirting
function texHoWall(up,low,seed){const W=256,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++){const hm=(H-1-y)/H*4.2;for(let x=0;x<W;x++){let c;
    if(hm<.1)c=dith(P,x,y,.5+(hash2(x,y,seed)-.5)*.3,['#26282a','#2e3032','#36383a'],.1);
    else if(hm<.84)c=dith(P,x,y,clamp(.55+(P.n(x,y,24,seed+1,2)-.5)*.25+(hash2(x,y,seed+2)-.5)*.06,0,1),[dk(low,.2),dk(low,.08),low,lt(low,.08)],.08);
    else if(hm<.86)c=dk(low,.45);
    else if(hm<.96){const t=(hm-.86)/.1;c=mix(mix('#5a3a20','#a07048',t),'#c89060',t>.8?.6:0);if(((x+P.n(x,y,8,seed+3,2)*20)|0)%9<1)c=dk(c,.12)}
    else{c=dith(P,x,y,clamp(.55+(P.n(x,y,48,seed+4,3)-.5)*.16+(hash2(x,y,seed+5)-.5)*.05,0,1),[dk(up,.12),dk(up,.05),up,lt(up,.06)],.06);
      if(x%154<1)c=dk(up,.1);if(hm<1.3&&P.n(x,y,8,seed+6,2)>.7)c=dk(c,.08)}
    P.set(x,y,c)}}})}
// the inside of an outer wall: the same wainscot, a white sill, four windows with the dawn outside (a city skyline in the lower panes)
function texHoWallWin(up,low){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++){const hm=(H-1-y)/H*4.2;for(let x=0;x<W;x++){const wi=Math.floor(x/128),wx=x%128;let c;
    if(hm>=1.02&&hm<3.05&&wx>=10&&wx<118){if(wx<14||wx>=114||hm<1.08||hm>2.99||Math.abs(wx-64)<2)c='#e2e4e0';
      else{const t=(hm-1.08)/1.91;c=mix(mix('#e0a890','#8a9ac0',clamp(t*1.6,0,1)),'#3a4a78',clamp((t-.55)*1.8,0,1));
        const sk=1.3+hash2(Math.floor((x+wi*37)/9),wi,6151)*.5+(hash2(Math.floor((x+wi*37)/23),wi,6152)<.2?.35:0);if(hm<sk){c=mix('#1c2234','#2a3248',hash2(x>>2,0,6153));if(hash2(x>>1,y>>1,6154)<.07)c='#ffd890'}
        if(wi===2&&wx>14&&wx<46)c=mix('#c8bca0','#a89c84',(wx%6)/6);if(wi===0&&wx>84)c=mix('#a8b4c0','#8a96a4',(wx%6)/6)}}
    else if(hm>=.94&&hm<1.02)c=hm>.99?'#f0f0ea':'#c8cac4';
    else if(hm<.1)c=dith(P,x,y,.5+(hash2(x,y,6155)-.5)*.3,['#26282a','#2e3032','#36383a'],.1);
    else if(hm<.84)c=dith(P,x,y,clamp(.55+(P.n(x,y,24,6156,2)-.5)*.25,0,1),[dk(low,.2),dk(low,.08),low,lt(low,.08)],.08);
    else if(hm<.94)c=dk(low,.3);
    else c=dith(P,x,y,clamp(.55+(P.n(x,y,48,6157,3)-.5)*.16,0,1),[dk(up,.12),dk(up,.05),up,lt(up,.06)],.06);
    P.set(x,y,c)}}})}
// white wall tiles (operating rooms, the emergency room, the stairwells' wainscot)
function texHoTile(){return paint(256,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<256;x++){const id=(y>>6)*4+(x>>6);let c;
    if(x%64<2||y%64<2)c='#9a9e9a';else{c=dith(P,x,y,clamp(.6+(hash2(id,1,6161)-.5)*.12+(P.n(x,y,32,6162,2)-.5)*.08,0,1),['#b8beba','#c8cecb','#d6dcd8','#e2e6e2'],.05);
      const sx=(x%64)-20,sy=(y%64)-18;if(sx*sx+sy*sy<30)c=lt(c,.3)}P.set(x,y,c)}})}
// vinyl floor tiles, 50 cm, marbled, alternating tones; scuffs
function texHoFloor(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const id=(y>>6)*4+(x>>6),alt=((x>>6)+(y>>6))%2;
    const m=P.n(x+y*.3,y,40,6171,4);let t=.55+(m-.5)*.4+(hash2(id,1,6172)-.5)*.12+(hash2(x,y,6173)-.5)*.1;if(x%64<1||y%64<1)t-=.25;
    let c=dith(P,x,y,clamp(t,0,1),alt?['#76746a','#8c8a80','#9e9c92','#acaa9e','#b8b6aa','#c4c2b6']:['#6e7068','#84867c','#96988e','#a6a89c','#b2b4a8','#bec0b4'],.08);
    if(hash2(x>>1,y>>1,6174)<.01)c=dk(c,.3);P.set(x,y,c)}
  for(let i=0;i<10;i++){const cx=hash2(i,1,6175)*N,cy=hash2(i,2,6175)*N,r=8+hash2(i,3,6175)*14;for(let a=0;a<40;a++){const q=a/40*Math.PI;P.mul(Math.round(cx+Math.cos(q)*r),Math.round(cy+Math.sin(q)*r*.4),.82)}}})}
// the lobby: polished granite, 1 m slabs, speckled
function texHoFloorL(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const id=(y>>7)*2+(x>>7);
    let t=.55+(hash2(id,1,6181)-.5)*.1+(P.n(x,y,64,6182,3)-.5)*.2;if(x%128<1||y%128<1)t=.1;let c=dith(P,x,y,clamp(t,0,1),['#4a4846','#6a6664','#7e7a76','#8e8a86','#9c9894','#aaa6a0'],.08);
    const h=hash2(x,y,6183);if(h<.08)c='#2a2826';else if(h<.13)c='#d8d4ce';else if(h<.16)c='#9a7a6e';
    const g=P.n(x,y,64,6184,2);if(g>.62)c=lt(c,.1);P.set(x,y,c)}})}
// the operating suite and the emergency room: seamless pale green vinyl, welded seams every 2 m
function texHoFloorG(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let t=.55+(P.n(x,y,32,6191,3)-.5)*.25+(hash2(x,y,6192)-.5)*.1;
    let c=dith(P,x,y,clamp(t,0,1),['#5e7e78','#6e8e86','#7c9c94','#8aaaa0','#96b6ac'],.08);if(hash2(x,y,6193)<.05)c=lt(c,.25);if(x<2||y<2)c='#4a6660';P.set(x,y,c)}})}
// the wards: wood-look vinyl planks
function texHoFloorW(){const W=256,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++){const r=y>>5,off=Math.floor(hash2(r,1,6201)*W);for(let x=0;x<W;x++){const id=r*7+Math.floor((x+off)/128);
    let t=.5+(hash2(id,2,6202)-.5)*.3+(P.n(x*.25,y*2,16,6203,3)-.5)*.35+(hash2(x,y,6204)-.5)*.06;if((y&31)<1||(x+off)%128<1)t=.08;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#4a3a2a','#6a5238','#806446','#927452','#a28460','#b0926c'],.08))}}})}
// acoustic ceiling tiles on a T-bar grid
function texHoCeil(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c;
    if(x%64<2||y%64<2)c=(x%64===0||y%64===0)?'#8a8c88':'#c8cac4';else{c=dith(P,x,y,clamp(.6+(P.n(x,y,16,6211,2)-.5)*.15+(hash2(x,y,6212)-.5)*.1,0,1),['#a8aaa4','#b8bab4','#c6c8c2','#d0d2cc'],.06);
      if(hash2(x,y,6213)<.03)c='#8a8c86'}P.set(x,y,c)}
  stain(P,40,90,14,10,.15,6214)})}
// a fluorescent troffer: frame, diffuser, louvers
function texHoLamp(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){let c;if(x<3||x>60||y<3||y>124)c='#8a8c88';
    else if(x%15<2||y%20<2)c='#c4ccd8';else{const d=Math.abs(x-32)/30;c=mix('#ffffff','#dce6f4',d)}P.set(x,y,c)}})}
function texHoLed(){return paint(8,8,P=>{for(let y=0;y<8;y++)for(let x=0;x<8;x++)P.set(x,y,x>1&&x<6&&y>1&&y<6?'#c0ffd0':'#40d070')})}
function texHoBeacon(){return paint(64,16,P=>{for(let y=0;y<16;y++)for(let x=0;x<64;x++){let c=x<30?'#ff3030':x>33?'#3060ff':'#eeeeee';if(y<2||y>13)c=dk(c,.3);if(x%10<1)c=dk(c,.2);P.set(x,y,c)}})}
function texHoSpot(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot(x-31.5,y-31.5)/32;let c=r>.92?'#9aa0a6':r>.82?'#d8dce0':mix('#ffffff','#e6f0ff',r);
    if(r<.82&&(Math.hypot(x-20,y-24)<6||Math.hypot(x-43,y-24)<6||Math.hypot(x-31.5,y-44)<6))c='#ffffff';P.set(x,y,c)}})}
function texHoWinLit(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=mix('#ffe2a8','#d8b070',y/64);if(x<2||x>61||y<2||y>61)c='#3a3428';if(y>40&&x>8&&x<30)c='#6a5030';P.set(x,y,c)}})}
// glass balustrade (boxV: 2 m along): a steel handrail, a base shoe, glass that is cut out but for its glints
function texHoRail(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){
    if(y<6)P.set(x,y,y<2?'#d8dce0':'#9ea4aa');else if(y>57)P.set(x,y,'#3a3e44');else if(x<2)P.set(x,y,'#6a7076');
    else if(((x+y*1.4)|0)%60<2||((x+y*1.4+25)|0)%60<1)P.set(x,y,'#cfdcec')}})}
// the atrium's skylight from above or below: a grid of glazing bars, panes cut out
function texHoSkyG(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){if(x%64<3||y%64<3)P.set(x,y,(x%64===1||y%64===1)?'#7a8088':'#3e444c');
    else if(((x+y)|0)%90<2)P.set(x,y,'#d0dcea')}})}
// interior glass partition (boxV 1.2 m): frame, a rail at 0.9 m, panes cut out
function texHoGlassP(){return paint(64,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<64;x++){if(x<3||y<3||y>124||Math.abs(y-80)<2)P.set(x,y,'#b8bcc0');else if(((x+y)|0)%70<2)P.set(x,y,'#d6e2ee')}})}
// door leaves: laminate, a narrow vision panel, a kick plate, a lever (mode 's': stainless with a porthole; 'f': a fire door with an exit sticker)
function texHoDoorT(col,mode,seed){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c;
    if(mode==='s')c=dith(P,x,y,clamp(.55+(hash2(x,y>>3,seed)-.5)*.3+(P.n(x,y,32,seed+1,2)-.5)*.15,0,1),['#7a7e84','#8e9298','#a2a6ac','#b4b8bc'],.06);
    else{const g=P.n(x*.2,y*3,16,seed+2,3);c=dith(P,x,y,clamp(.55+(g-.5)*.35+(hash2(x,y,seed+3)-.5)*.06,0,1),[dk(col,.25),dk(col,.12),col,lt(col,.08)],.08)}
    if(x<3||x>124||y<3)c=dk(col,.45);
    if(mode==='s'){const d=Math.hypot(x-64,y-80);if(d<20)c=d>17?'#d8dce0':mix('#22304a','#5a6a8a',(y-60)/40);if(y>150&&y<210&&x>40&&x<88)c='#c8ccd0'}
    else if(x>18&&x<40&&y>24&&y<120)c=(x<21||x>36||y<27||y>116)?'#9a9ea4':mix('#1e2a3e','#4a5a7a',(y-24)/96);
    if(y>226&&y<252&&x>6&&x<122)c=dith(P,x,y,.5,['#8a8e92','#a0a4a8','#b4b8bc'],.2);
    if(mode!=='s'&&y>130&&y<136&&x>92&&x<118)c='#c8ccd0';if(mode!=='s'&&x>110&&x<118&&y>126&&y<142)c='#a8acb0';
    if(mode==='f'&&x>50&&x<100&&y>44&&y<76){c=(x>54&&x<96&&y>48&&y<72)?'#1e9a50':'#e8f0e8';const fx=x-62,fy=y-60;if(Math.hypot(fx,fy+7)<2.5||Math.abs(fx-fy*.4)<1.5&&Math.abs(fy)<7)c='#ffffff'}
    P.set(x,y,c)}})}
// elevator: a steel frame, two brushed doors, a floor display above
function texHoElev(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c;
    if(x<10||x>117||y<26)c=dith(P,x,y,.5+(hash2(x,y,6221)-.5)*.3,['#4a4e54','#5e6268','#70747a'],.1);
    else c=dith(P,x,y,clamp(.55+(hash2(x,y>>4,6222)-.5)*.35,0,1),['#7c8086','#92969c','#a6aab0','#b8bcc2'],.05);
    if(Math.abs(x-64)<1&&y>=26)c='#2a2c30';if(y>6&&y<20&&x>48&&x<80)c=(y>8&&y<18&&x>52&&x<76)?((x>56&&x<64&&y>9&&y<17)?'#ff4030':'#1a0806'):'#2a2c30';
    P.set(x,y,c)}})}
// a made bed seen from above (pillow at the head end, a blanket turned down): Z = long axis along z (head at z0), X = along x (head at x0)
function texHoSheet(alongX){const W=alongX?256:128,H=alongX?128:256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const a=alongX?x/W:1-y/H,b=alongX?y/H:x/W;let c;
    if(a<.18){c=Math.abs(b-.5)<.36&&a>.03&&a<.16?mix('#f4f6f8','#cfd6dc',Math.abs(b-.5)*2):'#e4e8ec'}
    else if(a<.26)c=mix('#f2f4f6','#d8dee4',Math.sin(b*20)*.5+.5);
    else{const f=Math.sin(b*14+a*3+P.n(x,y,32,6231,2)*4)*.5+.5;c=mix('#7aa6c8','#4e7aa0',f*.6);if(b<.05||b>.95)c=dk(c,.2)}
    P.set(x,y,c)}})}
// bed ends and side rails: grey-blue moulded plastic with a white trim
function texHoBedP(){return paint(128,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,6241,2)-.5)*.2,0,1),['#4a5e78','#5a7090','#6a80a0'],.06);
    if(y<6||x<4||x>123)c='#e2e6ea';if(y>20&&y<26&&x>20&&x<108)c='#3a4c64';P.set(x,y,c)}})}
// privacy curtain: a mesh band at the top (cut out), teal fabric with folds below
function texHoCurtain(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){
    if(y<40){if((x%6<2||y%6<2))P.set(x,y,'#dce2e0');continue}
    const f=Math.sin(x*TAU/21)*.5+.5;let c=mix('#5e9a98','#8ec4c0',f);if(((x+y)%24<2)&&((x-y+512)%24<2))c=lt(c,.2);if(y<44||y>248)c='#cfd8d6';P.set(x,y,c)}})}
function texHoSeat(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,6251,2)-.5)*.3,0,1),['#1e3a5c','#28486e','#30547e','#3a6088'],.08);
    if(x%32<1||y%64<1)c='#14283e';P.set(x,y,c)}})}
// counter front (boxV 2.4 m): white laminate panels, a wooden top band, a dark kick base
function texHoDesk(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c;
    if(y<14)c=dith(P,x,y,clamp(.55+(P.n(x*.2,y*3,16,6261,2)-.5)*.4,0,1),['#7a5a38','#94704a','#a8825a','#b89068'],.08);else if(y>112)c='#2a2c2e';
    else{c=dith(P,x,y,clamp(.6+(P.n(x,y,32,6262,2)-.5)*.1,0,1),['#c8c6be','#d6d4cc','#e2e0d8','#eae8e2'],.05);if(x%64<2)c='#9a9890'}P.set(x,y,c)}})}
function texHoTop(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++)P.set(x,y,dith(P,x,y,clamp(.55+(P.n(x*.2,y*2,16,6271,3)-.5)*.4,0,1),['#7a5a38','#94704a','#a8825a','#b89068','#c69c74'],.08))})}
// shelving (boxV 1.2 m): kind 'p' pharmacy boxes and bottles, 's' snacks and drinks, 'l' linen and cartons
function texHoShelf(k){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){const sh=Math.floor(y/64),ly=y%64;let c;
    if(x<3||x>124||ly>58)c=ly>58&&ly<62?'#9aa0a6':'#6a7076';
    else{const iw=k==='l'?32:k==='s'?14:18,ix=Math.floor((x-3)/iw),id=sh*31+ix,lx=(x-3)%iw,h=k==='l'?40+hash2(id,1,6281)*16:24+hash2(id,1,6282)*28;
      if(58-ly<h&&lx>0&&lx<iw-1){const r=hash2(id,2,6283);
        if(k==='p')c=r<.6?((58-ly)>h-6?['#c83a3a','#2a6ac8','#2a9a5a','#d8a020'][Math.floor(r*6.6)%4]:'#eceae4'):(r<.8?'#8a4a14':'#e8eef0');
        else if(k==='s')c=['#d8302a','#e8b020','#2a5ac8','#2a9a48','#e86a20','#8a2ab0','#e8e4dc'][Math.floor(r*7)];
        else c=r<.5?(ly%6<1?'#b8bcc0':(r<.25?'#e8ecee':'#8ab0d8')):(lx%12<1?'#6a4a2a':'#a87c4a');
        if(lx===1)c=lt(c,.15)}else c='#1e2024'}
    P.set(x,y,c)}})}
// a drinks fridge: glass doors, lit shelves of bottles and cans
function texHoFridge(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c;const ly=y%52;
    if(x<4||x>123||y<8||y>244||Math.abs(x-64)<2)c='#e4e6e8';else if(ly<3)c='#c0c8d0';
    else{const ix=Math.floor(x/9),id=Math.floor(y/52)*17+ix;c=ly>14?['#d82a2a','#2a7ad8','#e8c020','#2ab060','#e8e8e8','#f07a20'][Math.floor(hash2(id,1,6291)*6)]:'#dfe8f4';if(x%9<1)c='#c8d4e2';if(ly>14&&x%9===4)c=lt(c,.3)}
    P.set(x,y,c)}})}
function texHoVend(){return paint(128,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,.5+(hash2(x,y,6301)-.5)*.2,['#a01e1e','#b82828','#c83232'],.08);
    if(x>10&&x<92&&y>20&&y<170){const ly=(y-20)%30;c=ly<4?'#c8d0d8':['#e8e8e8','#2a8ae8','#e8c020','#2ab060','#e86a20'][Math.floor(hash2(Math.floor(x/12),Math.floor(y/30),6302)*5)];if(x%12<1)c='#dfe8f4'}
    if(x>98&&x<120&&y>40&&y<150&&(y-40)%14<8)c='#e8e8e8';if(y>190&&y<230&&x>20&&x<108)c='#2a1a1a';P.set(x,y,c)}})}
// medical equipment plastic: off-white panels with seams and vents (D: dark grey)
function texHoMach(dark){return paint(128,128,P=>{const pal=dark?['#2e3236','#3a3e42','#464a4e','#52565a']:['#b8bcb8','#cacecb','#d8dcd8','#e4e6e2'];
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.6+(P.n(x,y,32,dark?6311:6312,2)-.5)*.15,0,1),pal,.05);if(x%64<1||y%64<1)c=dk(pal[1],.3);
    if(x>80&&x<120&&y>90&&y<120&&(y%6)<2)c=dk(pal[0],.3);P.set(x,y,c)}})}
// the ambulance's side: white, a red and orange band, 구급차 / AMBULANCE, the hospital's name
function texHoAmb(){return paint(256,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<256;x++){let c=dith(P,x,y,clamp(.6+(P.n(x,y,32,6321,2)-.5)*.1,0,1),['#c8cccc','#d8dcdc','#e6e8e8','#f0f2f2'],.05);
    if(y>74&&y<84)c='#d82a1e';else if(y>=84&&y<90)c='#f08a1e';if(x<3||x>252)c='#9aa0a4';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#d82a1e';x.textAlign='center';x.textBaseline='middle';x.font=hoFont(30);x.fillText('구급차  AMBULANCE',128,46);x.fillStyle='#2a4a8a';x.font=hoFont(14);x.fillText('새벽 종합병원  SAEBYEOK GENERAL HOSPITAL',128,106)}})}
function texHoAmbW(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++)P.set(x,y,dith(P,x,y,clamp(.6+(P.n(x,y,16,6331,2)-.5)*.1,0,1),['#c8cccc','#d8dcdc','#e6e8e8','#f0f2f2'],.05))})}
// rooftop air handlers: louvred grey sheet metal; the fan seen from above
function texHoHVAC(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,32,6341,2)-.5)*.2,0,1),['#5a6064','#6a7074','#7a8084','#888e92'],.06);
    if(y%8<2)c=y%8<1?'#3a3e42':'#a0a6aa';if(x%64<2)c='#4a5054';P.set(x,y,c)}
  for(let i=0;i<4;i++)streak(P,Math.floor(hash2(i,1,6342)*128),0,60,.15,3)})}
function texHoFan(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.hypot(x-63.5,y-63.5);let c='#6a7074';
    if(r<58){c=(r%8<2)?'#9aa0a4':'#1a1c1e';const a=Math.atan2(y-63.5,x-63.5);if(r<44&&Math.sin(a*5+r*.05)>.6)c='#4a5054';if(r<8)c='#7a8084'}if(x<3||y<3||x>124||y>124)c='#4a5054';P.set(x,y,c)}})}
// a green wheelie bin / a red medical-waste bin with its label
function texHoBin(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,6351,2)-.5)*.25,0,1),['#1a3a22','#22482a','#2a5632','#32623a'],.08);
    if(x%21<2)c='#163020';P.set(x,y,c)}})}
function texHoBinR(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,6361,2)-.5)*.2,0,1),['#9a2a1a','#b03420','#c43e26'],.08);
    if(y>40&&y<88&&x>14&&x<114)c='#f0e8d8';P.set(x,y,c)}
  P.post=x=>{x.fillStyle='#b03420';x.textAlign='center';x.textBaseline='middle';x.font=hoFont(17);x.fillText('의료폐기물',64,56);x.font=hoFont(11);x.fillText('MEDICAL WASTE',64,76)}})}
// the helipad: a yellow circle, a white H, the pad's white edge
function texHoHeli(){const N=512;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const r=Math.hypot(x-255.5,y-255.5);
    let c=dith(P,x,y,clamp(.55+(P.n(x,y,64,6371,3)-.5)*.25+(hash2(x,y,6372)-.5)*.08,0,1),['#3e4244','#4a4e50','#565a5a','#626664'],.08);
    if(x<14||y<14||x>497||y>497)c=((x+y)>>5)%2?'#e8e6e0':'#c8362a';
    if(Math.abs(r-190)<14)c=hash2(x>>2,y>>2,6373)<.06?'#8a7a3a':'#e8c020';
    const hx=Math.abs(x-255.5),hy=Math.abs(y-255.5);if((hx>48&&hx<82&&hy<104)||(hx<=48&&hy<16))c=hash2(x>>2,y>>2,6374)<.05?'#9a9a94':'#eceae4';
    P.set(x,y,c)}})}
function texHoHeliB(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,clamp(.6+(P.n(x,y,16,6381,2)-.5)*.15,0,1),['#c8cccc','#dadede','#e8eaea','#f2f4f4'],.05);
    if(y>40&&y<50)c='#c8362a';P.set(x,y,c)}})}
// posters on the walls: hand washing / masks (0), the infection notice (1)
function texHoPosterT(k){return paint(128,176,P=>{for(let y=0;y<176;y++)for(let x=0;x<128;x++){let c='#f0eee6';if(y<34)c=k?'#c8362a':'#2a6ac8';if(x<3||x>124||y<3||y>172)c='#c8c4b8';
    if(!k&&y>48&&y<120){const cx=(x<64?36:92),d=Math.hypot(x-cx,y-80);if(d<22)c=d>19?'#2a6ac8':'#cfe0f4'}
    if(k&&y>50&&y<110&&Math.abs(x-64)<30){const d=Math.abs(x-64)+Math.abs(y-82)*.9;if(d<30)c=d>25?'#1a1a1a':'#f0c020'}P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#ffffff';x.font=hoFont(17);x.fillText(k?'감염 주의':'손 씻기',64,18);
    x.fillStyle='#2a2a2a';x.font=hoFont(11);const L=k?['격리구역 출입 시','방호복을 착용하세요','INFECTION CONTROL']:['30초 이상 비누로','마스크 착용 필수','WASH YOUR HANDS'];L.forEach((s,i)=>x.fillText(s,64,132+i*14))}})}
// the scenery's apartment blocks (12 m × 4 floors a tile): white walls going blue in the dawn, balcony glass, some rooms already lit
function texHoApt(seed){const W=256,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++){const fl=Math.floor(y/64),ly=y%64;for(let x=0;x<W;x++){const u=Math.floor(x/32),id=fl*13+u;let c;
    if(ly<10)c=dith(P,x,y,.5+(hash2(x,y,seed)-.5)*.2,['#2e3446','#363c50','#3e4458'],.08);
    else{const lit=hash2(id,1,seed+1)<.16;c=lit?mix('#ffd890','#e8a860',hash2(id,2,seed+2)*.6):mix('#0e1424','#1a2236',(ly-10)/54);if(x%32<2)c='#262c3e';if(ly>52&&ly<56)c='#3a4054'}
    P.set(x,y,c)}}})}
// the military's olive paint
function texHoMil(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.5+(P.n(x,y,32,6391,3)-.5)*.35+(hash2(x,y,6392)-.5)*.1,0,1),['#2a3018','#343c1e','#3e4624','#48502a','#525a30'],.1);P.set(x,y,c)}
  for(let i=0;i<6;i++)streak(P,Math.floor(hash2(i,1,6393)*128),Math.floor(hash2(i,2,6393)*64),50,.2,2)})}
// barrier tape: yellow, 출입금지 KEEP OUT in black
function texHoTape(){return paint(256,32,P=>{for(let y=0;y<32;y++)for(let x=0;x<256;x++)P.set(x,y,y<3||y>28?'#1a1a1a':'#e8c020');
  P.post=x=>{x.fillStyle='#1a1a1a';x.textAlign='center';x.textBaseline='middle';x.font=hoFont(17);x.fillText('출입금지  KEEP OUT',128,17)}})}
// ginkgo (Y) and zelkova (G) foliage clumps, cut out between the leaves
function texHoLeaf(pal,seed){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1,,id]=cellN(P,x,y,8,seed);
    if(f1>4.6&&hash2(id,3,seed+1)<.72){P.alpha(x,y,0);continue}let c=mix(rpickH(id,pal),'#0a1206',clamp(f1/7,0,1)*.6);if(P.n(x,y,24,seed+2,3)>.62)c=lt(c,.12);P.set(x,y,c)}})}
function texHoBark(){return paint(64,256,P=>{for(let y=0;y<256;y++)for(let x=0;x<64;x++){const w=Math.sin(x*.5+P.n(x,y,16,6401,3)*6)*.5+.5;
    P.set(x,y,dith(P,x,y,clamp(.3+w*.5+(hash2(x,y,6402)-.5)*.12,0,1),['#1e1812','#2a2218','#382e22','#463a2c','#544636'],.1))}})}
function texHoHedge(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const [f1]=cellN(P,x,y,4,6411);
    P.set(x,y,mix(dith(P,x,y,clamp(.5+(P.n(x,y,16,6412,3)-.5)*.6,0,1),['#142a14','#1c3a1c','#244a22','#2e5a2a','#3a6a32'],.12),'#081008',clamp(f1/4,0,1)*.5))}})}
function texHoWater(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=P.n(x,y,32,6421,3),w=Math.sin((y+n*30)*.3)*.5+.5;
    let c=dith(P,x,y,clamp(.35+w*.3+(n-.5)*.3,0,1),['#0e1626','#16203a','#202c4a','#2e3c5c','#4a5276'],.1);if(w>.92&&hash2(x>>2,y,6422)<.3)c='#c89aa8';P.set(x,y,c)}})}
function texHoWood(){return paint(128,128,P=>{for(let y=0;y<128;y++){const pl=y>>4;for(let x=0;x<128;x++){let t=.5+(hash2(pl,1,6431)-.5)*.3+(P.n(x*.3,y*2,16,6432,3)-.5)*.35;if((y&15)<1)t=.1;
    P.set(x,y,dith(P,x,y,clamp(t,0,1),['#3a2618','#523822','#6a4a2e','#7e5a38','#906a44'],.08))}}})}
// parking deck: green epoxy worn grey along the driving lines, tyre marks, patches
function texHoParkF(){const N=256;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const wear=P.n(x,y*.25,32,6441,3);
    let c=dith(P,x,y,clamp(.55+(P.n(x,y,48,6442,3)-.5)*.3+(hash2(x,y,6443)-.5)*.08,0,1),['#24402e','#2c4c36','#34583e','#3c6446','#46704e'],.08);
    if(wear>.6)c=mix(c,dith(P,x,y,.5,['#4a4e4c','#5a5e5a','#6a6e68'],.1),clamp((wear-.6)*4,0,.8));if(Math.abs(((x+P.n(x,y,32,6444,2)*20)|0)%128-40)<3)c=dk(c,.25);P.set(x,y,c)}
  for(let i=0;i<6;i++)stain(P,hash2(i,1,6445)*N,hash2(i,2,6445)*N,10+hash2(i,3,6445)*12,8+hash2(i,4,6445)*8,.3,6446+i)})}
// stair treads (anti-slip nosing) and the escalator's grooved steps
function texHoStair(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=dith(P,x,y,clamp(.55+(P.n(x,y,16,6451,2)-.5)*.25+(hash2(x,y,6452)-.5)*.1,0,1),['#5a5c5a','#6c6e6a','#7e807a','#8e908a'],.08);
    if(y<6)c=(x%4<2)?'#c8a020':'#2a2a26';P.set(x,y,c)}})}
function texHoEsc(){return paint(64,64,P=>{for(let y=0;y<64;y++)for(let x=0;x<64;x++){let c=x%4<2?'#8a9096':'#3a3e44';if(y<5)c='#e8c020';P.set(x,y,c)}})}
// a sign (canvas text over a plain panel); bg null: cut out, only the letters stay (the rooftop letters)
function texHoSign(w,h,lines,bg,fg,brd){return paint(w,h,P=>{if(bg)for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=bg;if(brd&&(x<brd||x>=w-brd||y<brd||y>=h-brd))c=fg;else if(hash2(x,y,6461)<.04)c=dk(bg,.1);P.set(x,y,c)}
  P.post=x=>{x.textAlign='center';x.textBaseline='middle';for(const L of lines){x.fillStyle=L.c||fg;x.font=hoFont(L.s);x.fillText(L.t,L.x!=null?L.x:w/2,L.y)}
    if(!bg){const id=x.getImageData(0,0,w,h),D=id.data;for(let i=3;i<D.length;i+=4)D[i]=D[i]>110?255:0;x.putImageData(id,0,0)}}})}
// the dawn sky: navy overhead, the east glowing pink and gold low down, a few stratus streaks lit from below, a ridge of mountains
// and the city's apartment blocks along the horizon with their first lit windows (u: 0 west, .25 south, .5 east, .75 north; horizon row 232)
function texHoSky(){return paint(1024,256,P=>{const HZ=232;
  const ridge=(x,s)=>{let v=0,a=0;for(let o=0;o<5;o++){const f=3<<o;v+=fbm(x/1024*f,.5,s+o,1,f)/(1<<o);a+=1/(1<<o)}return v/a};
  for(let x=0;x<1024;x++){const u=x/1024,g=Math.pow(Math.max(0,Math.cos((u-.5)*TAU)),1.6),m1=HZ-(14+ridge(x,6471)*30),m2=HZ-(6+ridge((x+333)%1024,6481)*16);
    const bw=6+Math.floor(hash2(x>>3,1,6491)*3);const bid=Math.floor(x/bw/3);const bh=hash2(bid,2,6492)<.7?8+hash2(bid,3,6493)*20:0;const city=HZ-2-bh;
    for(let y=0;y<256;y++){const t=y/HZ;let c=mix('#0a1028','#1e2c58',clamp(t*1.4,0,1));c=mix(c,'#3e5084',clamp((t-.45)*1.6,0,1));
      c=mix(c,'#7a6a98',clamp((t-.7)*2.4,0,1)*(.35+.65*g));c=mix(c,'#f0a07a',clamp((t-.8)*4,0,1)*g);c=mix(c,'#ffd6a0',clamp((t-.92)*10,0,1)*g);
      const band=clamp(1-Math.abs(y-150)/40,0,1);if(band>0){const cv=fbm(x/128,y/9,6501,4,8),k=clamp((cv-.55)*3,0,1)*band;if(k>0)c=mix(c,mix('#2a3050','#e89a8a',g*.85+.05),k*.7)}
      if(y>=m1&&y<HZ)c=mix(mix('#1e2644','#3a3a5a',g*.6),'#141a30',clamp((y-m1)/30,0,1));
      if(y>=m2&&y<HZ)c=mix('#161c32','#10162a',clamp((y-m2)/12,0,1));
      if(bh&&y>=city&&y<HZ){c='#0c111e';if(x%3===1&&(y-city)%3===1&&hash2(x,y,6511)<.18)c=hash2(x,y,6512)<.7?'#ffd27a':'#a8c8ff'}
      if(y>=HZ)c=mix('#0c111e','#141a28',clamp((y-HZ)/24,0,1));
      P.set(x,y,c)}}})}
// solar panels: dark blue cells in a silver frame
function texHoSolar(){return paint(128,128,P=>{for(let y=0;y<128;y++)for(let x=0;x<128;x++){let c=dith(P,x,y,clamp(.5+(P.n(x,y,32,6641,2)-.5)*.3,0,1),['#0e1a34','#14223e','#1a2a4a','#22345a'],.08);
    if(x%32<2||y%21<2)c='#8a9098';if(x%64<3||y%64<3)c='#b8bcc0';if(((x+y)|0)%70<2)c='#4a5a7a';P.set(x,y,c)}})}
function bakeHoTex(){if(TEX.hoFacade)return;
  TEX.hoPave=mkTex(texHoPave());TEX.hoCurb=mkTex(texHoCurb());TEX.hoGrass=mkTex(texHoGrass());
  TEX.hoLineW=mkTex(texHoLine('#d8d8d0',6521));TEX.hoLineY=mkTex(texHoLine('#d8a820',6522));TEX.hoLineG=mkTex(texHoLine('#2a9a5a',6523));TEX.hoLineB=mkTex(texHoLine('#2a6ac8',6524));TEX.hoLineO=mkTex(texHoLine('#e07a20',6525));
  TEX.hoFacade=mkTex(texHoFacade());TEX.hoPanel=mkTex(texHoPanel());TEX.hoGlassW=mkTex(texHoGlassW());
  TEX.hoWall=mkTex(texHoWall('#c4dccf','#7fa696',6531));TEX.hoWallB=mkTex(texHoWall('#e2d8c2','#a89474',6541));TEX.hoWallC=mkTex(texHoWall('#ccd6e0','#7a8ca2',6551));
  TEX.hoWallWin=mkTex(texHoWallWin('#c4dccf','#7fa696'));TEX.hoTile=mkTex(texHoTile());
  TEX.hoFloor=mkTex(texHoFloor());TEX.hoFloorL=mkTex(texHoFloorL());TEX.hoFloorG=mkTex(texHoFloorG());TEX.hoFloorW=mkTex(texHoFloorW());TEX.hoCeil=mkTex(texHoCeil());TEX.hoParkF=mkTex(texHoParkF());
  TEX.hoStair=mkTex(texHoStair());TEX.hoEsc=mkTex(texHoEsc());
  TEX.hoLamp=mkTex(texHoLamp(),false);TEX.hoLed=mkTex(texHoLed(),false);TEX.hoBeacon=mkTex(texHoBeacon(),false);TEX.hoSpot=mkTex(texHoSpot(),false);TEX.hoWinLit=mkTex(texHoWinLit(),false);
  TEX.hoRail=mkTex(texHoRail());TEX.hoSkyG=mkTex(texHoSkyG());TEX.hoGlassP=mkTex(texHoGlassP());
  TEX.hoDoor=mkTex(texHoDoorT('#c4a47a','w',6561),false);TEX.hoDoorB=mkTex(texHoDoorT('#7e9ebe','w',6571),false);TEX.hoDoorF=mkTex(texHoDoorT('#6a3a2c','f',6581),false);TEX.hoDoorS=mkTex(texHoDoorT('#8a8e94','s',6591),false);
  TEX.hoElev=mkTex(texHoElev(),false);TEX.hoSheetZ=mkTex(texHoSheet(false),false);TEX.hoSheetX=mkTex(texHoSheet(true),false);TEX.hoBedP=mkTex(texHoBedP(),false);TEX.hoCurtain=mkTex(texHoCurtain(),false);
  TEX.hoSeat=mkTex(texHoSeat());TEX.hoDesk=mkTex(texHoDesk());TEX.hoTop=mkTex(texHoTop());TEX.hoShelfP=mkTex(texHoShelf('p'));TEX.hoShelfS=mkTex(texHoShelf('s'));TEX.hoShelfL=mkTex(texHoShelf('l'));
  TEX.hoFridge=mkTex(texHoFridge());TEX.hoVend=mkTex(texHoVend(),false);TEX.hoMach=mkTex(texHoMach(false));TEX.hoMachD=mkTex(texHoMach(true));
  TEX.hoAmb=mkTex(texHoAmb(),false);TEX.hoAmbW=mkTex(texHoAmbW());TEX.hoHVAC=mkTex(texHoHVAC());TEX.hoFan=mkTex(texHoFan(),false);TEX.hoBin=mkTex(texHoBin());TEX.hoBinR=mkTex(texHoBinR(),false);
  TEX.hoHeli=mkTex(texHoHeli(),false);TEX.hoHeliB=mkTex(texHoHeliB());TEX.hoPoster=mkTex(texHoPosterT(0),false);TEX.hoPoster2=mkTex(texHoPosterT(1),false);
  TEX.hoApt=mkTex(texHoApt(6601));TEX.hoAptB=mkTex(texHoApt(6611));TEX.hoMil=mkTex(texHoMil());TEX.hoTape=mkTex(texHoTape());
  TEX.hoLeafG=mkTex(texHoLeaf(['#1e3a1c','#264624','#2e522a','#365e30','#3e6a36'],6621));TEX.hoLeafY=mkTex(texHoLeaf(['#6e5212','#82641a','#967422','#a68228','#8a6c1c'],6631));
  TEX.hoBark=mkTex(texHoBark());TEX.hoSolar=mkTex(texHoSolar());TEX.hoHedge=mkTex(texHoHedge());TEX.hoWater=mkTex(texHoWater());TEX.hoWood=mkTex(texHoWood());
  // signs
  TEX.hoSignH=mkTex(texHoSign(1024,256,[{t:'새벽 종합병원',s:150,y:100,c:'#ff4a3a'},{t:'SAEBYEOK GENERAL HOSPITAL',s:46,y:214,c:'#f4f6ff'}],null,null),false);
  TEX.hoSignER=mkTex(texHoSign(1024,160,[{t:'응급의료센터',s:84,y:62},{t:'EMERGENCY',s:46,y:128}],'#c81e1e','#ffffff',8),false);
  TEX.hoSignP=mkTex(texHoSign(512,192,[{t:'P',s:150,x:96,y:100},{t:'주차타워',s:64,x:320,y:74},{t:'PARKING',s:44,x:320,y:142}],'#1e4aa8','#ffffff',8),false);
  TEX.hoSignDir=mkTex(texHoSign(512,384,[{t:'층별 안내  FLOOR GUIDE',s:30,y:34,c:'#e8c020'},{t:'RF   헬기장 HELIPAD',s:30,y:100},{t:'3F   수술실 · 병동',s:30,y:160},{t:'2F   영상의학과 · 외래 · 중환자실',s:28,y:220},
    {t:'1F   원무과 · 약국 · 편의점',s:28,y:280},{t:'      응급의료센터 → 동관',s:28,y:340,c:'#ff8a7a'}],'#1e2a3a','#e8e8e0',6),false);
  const dept=(a,b,bg)=>mkTex(texHoSign(512,96,[{t:a,s:40,y:38},{t:b,s:20,y:78}],bg||'#1e5a4a','#ffffff',4),false);
  TEX.hoSnRec=dept('원무과 · 수납','RECEPTION · PAYMENT');TEX.hoSnPh=dept('약국','PHARMACY');TEX.hoSnCS=dept('편의점','CONVENIENCE STORE','#2a6ac8');TEX.hoSnRad=dept('영상의학과','RADIOLOGY · CT · MRI');
  TEX.hoSnOPD=dept('외래 진료','OUTPATIENT CLINICS');TEX.hoSnICU=dept('중환자실','INTENSIVE CARE UNIT','#7a2a2a');TEX.hoSnOR=dept('수술실','OPERATING ROOMS  ·  관계자 외 출입금지','#2a3a6a');
  TEX.hoSnWard=dept('병동 301–306','WARD');TEX.hoSnEmg=dept('응급실 →','EMERGENCY ROOM','#c81e1e');TEX.hoSnIso=dept('음압격리병실','ISOLATION ROOM','#c8361e');TEX.hoSnBus=dept('새벽 종합병원 정류장','BUS STOP  ·  101  305  N16','#1e5aa8');
  const fl=(t,bg)=>mkTex(texHoSign(128,128,[{t,s:64,y:66}],bg,'#ffffff',6),false);
  TEX.hoF1=fl('1F','#2a6a5a');TEX.hoF2=fl('2F','#2a5a8a');TEX.hoF3=fl('3F','#6a4a8a');TEX.hoFR=fl('RF','#8a3a2a');TEX.hoP1=fl('P1','#c8a020');TEX.hoP2=fl('P2','#c8a020');TEX.hoP3=fl('P3','#c8a020');
  TEX.hoSky=mkTex(texHoSky());TEX.hoSky.wrapT=THREE.ClampToEdgeWrapping;TEX.hoSky.magFilter=THREE.LinearFilter;
  const an=R.renderer?Math.min(4,R.renderer.capabilities.getMaxAnisotropy()||1):1;for(const k of ['hoPave','hoGrass','hoFloor','hoFloorL','hoFloorG','hoFloorW','hoParkF'])TEX[k].anisotropy=an}

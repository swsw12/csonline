'use strict';
// ============ Chapter 9 map 「설령산 기상 레이더 기지」 (the Seolryeong weather radar station): five stages on two levels ============
// A night of thundersnow. North is -z. The valley (y 0) and the summit plateau (y 40), joined by the cable car (daedalus.js runs the car).
// A  the valley station's plaza            x -28..28   z 166..214   → the station hall's doors (gate gA, z 164): the car waits inside at z 150
// —  the cable                            from the valley dock (0, 0, 150) level to z 140, up the slope to z 68, level into the summit dock (0, 40, 56)
// B  the summit station and the maze       x -30..30   z 13.5..64   the hall (the car's dock), its doors (gate gB, z 48), then RT1-04's maze of
//                                                                  containers down to the compound's gate (gate gC, z 13); the goal box in front of it
// C  the station compound                  x -36..36   z -20..12    the operations building (the radar console), the generator house (the
//                                                                  transformer), the fuel tank → the blast gate (gate gD, z -21.5)
// D  the radome plaza                      x -44..44   z -90..-23   the radome on its tower (a catwalk at 48, two stairs), the helipad (06),
//                                                                  the antenna mast, two sheds, the observation deck over the cliff, three lightning rods
// DAEDALUS (daedalus.js) fights on the plaza, then from the radome's catwalk, then on wings; the escape runs back to the car.
Object.assign(MATS,{
  e9rock:{t:'e9rock',s:4,cs:2,k:'stone'},e9tower:{t:'e9tower',uv:'boxV',s:4,k:'stone'},e9hall:{t:'e9hall',uv:'boxV',s:8,emis:.06,k:'stone'},e9hallF:{t:'e9hallF',s:4,k:'stone'},
  e9deck:{t:'e9deck',s:2,k:'wood'},e9cat:{t:'e9cat',uv:'box',k:'metal'},e9screen:{t:'e9screen',uv:'box',k:'wood'},e9ops:{t:'e9ops',uv:'boxV',s:10,emis:.2,k:'stone'},
  e9turn:{t:'e9turn',uv:'box',emis:.2,k:'metal'},e9wheel:{t:'e9wheel',uv:'box',k:'metal'},e9booth:{t:'e9booth',uv:'box',emis:.45,k:'glass'},
  e9sValley:{t:'e9sValley',uv:'box',emis:.85,k:'metal'},e9sSummit:{t:'e9sSummit',uv:'box',emis:.8,k:'metal'},e9sRadar:{t:'e9sRadar',uv:'box',emis:.6,k:'metal'},
  e9sDanger:{t:'e9sDanger',uv:'box',emis:.3,k:'metal'},e9sGen:{t:'e9sGen',uv:'box',emis:.3,k:'metal'},e9sFuel:{t:'e9sFuel',uv:'box',emis:.3,k:'metal'},
  e9sObs:{t:'e9sObs',uv:'box',emis:.3,k:'metal'},e9sMap:{t:'e9sMap',uv:'box',emis:.45,k:'metal'},e9sBack:{t:'e9sBack',uv:'box',k:'metal'},e9s06:{t:'e9s06',uv:'box',k:'metal'},
  e9sWall:{t:'e9sWall',uv:'box',k:'metal'},e9sTicket:{t:'e9sTicket',uv:'box',emis:.7,k:'metal'},
  e9panel:{t:'e9panel',uv:'box',emis:.45,k:'metal'},e9trans:{t:'e9trans',uv:'box',emis:.08,k:'metal'},e9sw:{t:'e9sw',uv:'box',emis:.22,k:'metal'}
});
// ---------- textures (painted on first load; snow, the apron, the pad, the crates, the generators are chapters 6's and 8's) ----------
// granite under the snow: grey with dark seams, snow caught on every ledge
function texE9Rock(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=dith(P,x,y,P.n(x,y,34,9001,4)*.9+hash2(x,y,9002)*.12,['#3a3c40','#45474b','#505256','#5c5e62','#686a6e'],.1);
  const s=P.n(x,y*1.7,22,9003,3);if(s>.55)c=mix(c,'#e2e8ee',clamp((s-.55)*3,0,.9));if(Math.abs(((x+y*.3)%61)-30)<1.4&&P.n(x,y,12,9004,2)>.45)c=dk(c,.35);P.set(x,y,c)}})}
// the night of thundersnow: torn cloud in slate blues, a pale glow low down where the lightning lives in the cloud
function texE9Sky(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const v=y/H;let c=v<.5?mix('#06080e','#121826',v/.5):mix('#121826','#28303e',(v-.5)/.5);
  const cl=P.n(x,y*2.2,46,9011,5);if(cl>.44)c=mix(c,v>.55?'#3a4252':'#1c2230',clamp((cl-.44)*1.6,0,.85));const g=P.n(x*.6,y,70,9012,3);if(v>.5&&g>.6)c=mix(c,'#5a6a8e',clamp((g-.6)*2,0,.4)*(v-.5)*2);
  if(P.n(x*.25,y*3,18,9013,2)>.72)c=mix(c,'#6a7488',.2);P.set(x,y,c)}})}
// the station halls: grey precast panels, a dark band at the eaves, the joints sealed
function texE9Hall(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,P.n(x,y,30,9021,3)*.8+.1,['#5a5e62','#64686c','#6e7276','#787c80'],.08);
  if(x%128<2||y%86<2)c='#3a3e42';if(y<14)c=mix('#2a3a4e','#34465c',P.n(x,y,8,9022,2));if(y>H-22)c=mix(c,'#e2e8ee',clamp((y-(H-22))/16,0,.85));P.set(x,y,c)}
  for(let i=0;i<10;i++)streak(P,Math.floor(hash2(i,1,9023)*W),16,40+Math.floor(hash2(i,2,9023)*80),.18,2)})}
function texE9HallF(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const j=x%64<2||y%64<2;let c=dith(P,x,y,P.n(x,y,20,9031,3)*.7+.15,['#2e3034','#363a3e','#3e4246','#46494d'],.08);
  if(j)c='#1e2024';if(hash2(Math.floor(x/64),Math.floor(y/64),9032)<.1)c=lt(c,.08);if(P.n(x,y,40,9033,3)>.66)c=mix(c,'#5a5e62',.3);P.set(x,y,c)}})}
// the radome's tower: white-painted concrete, vertical ribs, rust run down from the bolts, grime at the foot
function texE9Tower(){const W=TN,H=TN;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=dith(P,x,y,P.n(x,y,26,9041,3)*.6+.3,['#8a8e92','#94989c','#9ea2a6','#a8acb0'],.06);
  const r=x%64;if(r<3)c=dk(c,.25);else if(r<6)c=lt(c,.06);if(y>H*.85)c=mix(c,'#5a5e60',clamp((y-H*.85)/(H*.12),0,.6));P.set(x,y,c)}
  for(let i=0;i<14;i++)streak(P,Math.floor(hash2(i,1,9042)*W),Math.floor(hash2(i,3,9042)*H*.5),30+Math.floor(hash2(i,2,9042)*70),.14,1)})}
// the radome itself: pale panels in a staggered net, darker seams, snow caught on the top (used by the dome's mesh)
function texE9Dome(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const row=Math.floor(y/32),off=row%2?32:0,u=(x+off)%64,v=y%32;
  let c=mix('#c8ccd0','#dcdfe2',P.n(x,y,24,9051,2));if(u<2||v<2)c='#7a8086';if(hash2(Math.floor((x+off)/64),row,9052)<.18)c=dk(c,.06);if(y<H*.18)c=mix(c,'#f2f6f8',.55);P.set(x,y,c)}})}
// the observation deck's boards, snow between them
function texE9Deck(){const N=TN;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){const b=Math.floor(y/32),j=y%32<2;let c=mix('#4a3a2a','#5e4a34',P.n(x+b*50,y,18,9061,2));
  if(j)c='#1e1a14';const s=P.n(x,y,30,9062,3);if(s>.58)c=mix(c,'#e2e8ee',clamp((s-.58)*3,0,.8));P.set(x,y,c)}})}
// the snowcat: orange paint, black trim, a white stencil
function texE9Cat(){const W=256,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#c8581a','#d8682a',P.n(x,y,16,9071,2));if(y>H*.8)c='#1a1a1a';if(y<6)c='#2a2a2a';
  if(P.n(x,y,20,9072,2)>.66)c=mix(c,'#6a3a1a',.3);P.set(x,y,c)}P.post=ctx=>{ctx.fillStyle='rgba(240,240,232,.9)';ctx.font='bold 20px sans-serif';ctx.fillText('SR-03',W*.1,H*.4)}})}
// a Stevenson screen: white louvres
function texE9Screen(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=y%8<3?'#c8ccc8':'#eceee8';if(x<2||x>N-3)c='#b8bcb8';P.set(x,y,c)}})}
// the operations building: dark blue-grey cladding, a ribbon of lit windows, the eaves
function texE9Ops(){const W=512,H=256;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#3a4652','#44505c',P.n(x,y,28,9081,3));if(x%64<2)c='#2a323a';
  const win=y>H*.36&&y<H*.62&&x%128>14&&x%128<114;if(win)c=hash2(Math.floor(x/128),1,9082)<.4?mix('#e8c890','#f0d8a8',P.n(x,y,6,9083,2)):mix('#1a222a','#26303a',P.n(x,y,8,9084,2));
  if(win&&(x%128===64||x%128===65))c='#2a323a';if(y>H*.9)c=mix(c,'#e2e8ee',.7);P.set(x,y,c)}})}
// a turnstile's cabinet: brushed steel, a green arrow
function texE9Turn(){const N=64;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#8a9096','#a2a8ae',hash2(x,y>>2,9091));if(y<10&&x>20&&x<44&&Math.abs(x-32)<(10-y)+4)c='#3aff7a';P.set(x,y,c)}})}
// the bull wheel's housing: yellow steel, black and yellow chevrons on its rim
function texE9Wheel(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#c8a020','#d8b030',P.n(x,y,12,9101,2));if(y>N*.82)c=((x+y)%32<16)?'#1a1a1a':'#e8c020';if(P.n(x,y,20,9102,2)>.68)c=mix(c,'#5a4a2a',.3);P.set(x,y,c)}})}
// the operator's booth: glass with the lit room behind it
function texE9Booth(){const N=128;return paint(N,N,P=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++){let c=mix('#3a5a6a','#5a8090',P.n(x,y,20,9111,2));if(y>N*.7)c=mix('#c8b080','#d8c090',P.n(x,y,8,9112,2));if(x<3||y<3||x>N-4)c='#1a1e22';P.set(x,y,c)}})}
// a word sprayed on a container: red letters dripping on rusty steel (RT1-04's)
function texE9Spray(ln,col){return ()=>paint(256,96,P=>{for(let y=0;y<96;y++)for(let x=0;x<256;x++){let c=mix('#3a2a22','#4a3428',P.n(x,y,16,9121,3));if(P.n(x,y,30,9122,2)>.6)c=mix(c,'#6a4a2a',.4);P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle=col;ctx.font='bold 46px sans-serif';ctx.textAlign='center';ctx.fillText(ln,128,60);ctx.fillRect(64,62,3,22);ctx.fillRect(150,62,3,14);ctx.fillRect(190,62,2,26)}})}
// the radar room's consoles: a grey-green cabinet, the scope (rings, the green sweep, echoes of the storm), the station's name over it
function texE9Panel(){const W=128,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#4a5248','#545c52',hash2(x,y>>2,9131));if(x<3||y<3||x>W-4||y>H-4)c='#2a2e2a';
    const dx=x-46,dy=y-66,r=Math.hypot(dx,dy);if(r<30){c=r>28?'#1a1e1a':'#081a0e';const a=Math.atan2(dy,dx);if(Math.abs(r-10)<.7||Math.abs(r-20)<.7)c='#1a4a2a';const sw=(a+Math.PI*2-1.2)%(Math.PI*2);if(sw<.7&&r<28)c=mix('#081a0e','#3aff7a',1-sw/.7);
      if(hash2(Math.floor(x/3),Math.floor(y/3),9132)<.06&&r<26&&r>6)c='#7aff9a'}
    if(x>84&&x<120&&y>40&&y<100&&(y%10<6))c=(x+y)%20<10?'#3aff7a':'#1a3a24';if(y>108&&y<120&&x>10&&x<118&&x%6<3)c='#2a2e2a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#d8e8d0';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText('기상 레이더 · RADAR',64,24);ctx.fillStyle='#ff3a2a';for(const x of [92,104,116])ctx.fillRect(x,108,6,6)}})}
// the transformer in the generator house: grey steel, its cooling fins, a high-voltage label
function texE9Trans(){const W=128,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#7a7e80','#8a8e90',hash2(x>>1,y,9141));if(x%10<3)c=dk(c,.25);if(y<6||y>H-7)c='#4a4e50';
    if(x>30&&x<98&&y>18&&y<62)c='#e8c020';if(x>30&&x<98&&(y===18||y===61))c='#141414';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#141414';ctx.beginPath();ctx.moveTo(64,22);ctx.lineTo(54,42);ctx.lineTo(64,42);ctx.lineTo(58,58);ctx.lineTo(76,36);ctx.lineTo(66,36);ctx.lineTo(72,22);ctx.fill();
    ctx.fillStyle='#e8e8e0';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('변압기 22.9 kV',64,86);ctx.font='bold 9px sans-serif';ctx.fillText('TRANSFORMER',64,100)}})}
// a lightning rod's switch box: safety yellow, a black bolt, the lever
function texE9Sw(){const W=64,H=128;return paint(W,H,P=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=mix('#d8b020','#e8c030',hash2(x,y>>2,9151));if(x<2||y<2||x>W-3||y>H-3)c='#3a3a2a';if(y>84&&y<92)c='#1a1a1a';P.set(x,y,c)}
  P.post=ctx=>{ctx.fillStyle='#141414';ctx.beginPath();ctx.moveTo(34,10);ctx.lineTo(20,40);ctx.lineTo(32,40);ctx.lineTo(24,66);ctx.lineTo(46,32);ctx.lineTo(34,32);ctx.lineTo(42,10);ctx.fill();
    ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText('피뢰침',32,80);ctx.fillStyle='#c82018';ctx.fillRect(40,94,8,24);ctx.fillRect(36,112,16,6)}})}
function bakeEp9Tex(){if(TEX.e9rock)return;if(typeof bakeEp8Tex==='function')bakeEp8Tex();
  TEX.e9rock=mkTex(texE9Rock());TEX.e9sky=mkTex(texE9Sky(),false);TEX.e9hall=mkTex(texE9Hall());TEX.e9hallF=mkTex(texE9HallF());TEX.e9tower=mkTex(texE9Tower());TEX.e9dome=mkTex(texE9Dome());
  TEX.e9deck=mkTex(texE9Deck());TEX.e9cat=mkTex(texE9Cat(),false);TEX.e9screen=mkTex(texE9Screen(),false);TEX.e9ops=mkTex(texE9Ops());TEX.e9turn=mkTex(texE9Turn(),false);
  TEX.e9wheel=mkTex(texE9Wheel(),false);TEX.e9booth=mkTex(texE9Booth(),false);TEX.e9panel=mkTex(texE9Panel(),false);TEX.e9trans=mkTex(texE9Trans(),false);TEX.e9sw=mkTex(texE9Sw(),false);
  TEX.e9sValley=mkTex(texSign([{t:'설령산 케이블카 · 하부 정류장'},{t:'SEOLRYEONG CABLE CAR · VALLEY STATION',s:9}],'#14304a','#f0f0e8',300,48),false);
  TEX.e9sSummit=mkTex(texSign([{t:'상부 정류장 · 해발 1,412 m'},{t:'SUMMIT STATION · 1,412 M',s:9}],'#14304a','#f0f0e8',260,48),false);
  TEX.e9sRadar=mkTex(texSign([{t:'설령산 기상 레이더 관측소'},{t:'SEOLRYEONG WEATHER RADAR STATION',s:8}],'#1a2a4a','#f0f0e8',300,48),false);
  TEX.e9sDanger=mkTex(texSign([{t:'고압 위험 · 접근 금지'},{t:'DANGER · HIGH VOLTAGE',s:9}],'#e8c020','#141414',220,40),false);
  TEX.e9sGen=mkTex(texSign([{t:'발전실'},{t:'GENERATOR HOUSE',s:9}],'#141414','#e8c820',160,36),false);
  TEX.e9sFuel=mkTex(texSign([{t:'유류 탱크 · 화기 엄금'},{t:'FUEL · NO NAKED FLAME',s:9}],'#b81c14','#ffffff',220,36),false);
  TEX.e9sObs=mkTex(texSign([{t:'전망대'},{t:'OBSERVATION DECK',s:9}],'#3a2a1a','#f0e8d8',160,36),false);
  TEX.e9sMap=mkTex(texSign([{t:'설령산 등산 안내도'},{t:'케이블카 → 정상 · 기상 관측소',s:10}],'#2a4a2a','#f0f0e8',220,60),false);
  TEX.e9sTicket=mkTex(texSign([{t:'매표소 · 운행 중지'},{t:'TICKETS · SERVICE SUSPENDED',s:9}],'#3a1a1a','#ffd8b0',220,40),false);
  TEX.e9sBack=mkTex(texE9Spray('돌아가라','#d82018')(),false);TEX.e9s06=mkTex(texE9Spray('06 기다려','#e8e8e0')(),false);TEX.e9sWall=mkTex(texE9Spray('RT-1 04','#e8c020')(),false)}
// ---------- geometry helpers (the summit stands at y 40: everything takes its floor's height) ----------
const E9NZ={nosolid:true},E9SG={nosolid:true,f:{py:'metal2',ny:'metal2'}},E9Y=40;// (a sign: the picture on its faces, plain steel on its top and bottom)
function e9fenceX(x0,x1,z,y,h){B(x0,y,z-.015,x1,y+h,z+.015,'fence',{pass:1});for(let x=x0;x<=x1+.01;x+=Math.max(1.2,(x1-x0)/Math.ceil((x1-x0)/2.6)))B(x-.05,y,z-.05,x+.05,y+h+.08,z+.05,'metal2')}
function e9fenceZ(z0,z1,x,y,h){B(x-.015,y,z0,x+.015,y+h,z1,'fence',{pass:1});for(let z=z0;z<=z1+.01;z+=Math.max(1.2,(z1-z0)/Math.ceil((z1-z0)/2.6)))B(x-.05,y,z-.05,x+.05,y+h+.08,z+.05,'metal2')}
// a railing (a handrail on posts, 1.1 m): nobody steps over it, shots and sight go through
function e9railX(x0,x1,z,y){B(x0,y+1.02,z-.04,x1,y+1.1,z+.04,'metal2',E9NZ);B(x0,y+.5,z-.03,x1,y+.56,z+.03,'metal2',E9NZ);for(let x=x0;x<=x1+.01;x+=Math.max(1,(x1-x0)/Math.max(1,Math.round((x1-x0)/1.6))))B(x-.04,y,z-.04,x+.04,y+1.02,z+.04,'metal2',E9NZ);
  B(x0,y,z-.03,x1,y+1.15,z+.03,'none',{pass:1})}
function e9railZ(z0,z1,x,y){B(x-.04,y+1.02,z0,x+.04,y+1.1,z1,'metal2',E9NZ);B(x-.03,y+.5,z0,x+.03,y+.56,z1,'metal2',E9NZ);for(let z=z0;z<=z1+.01;z+=Math.max(1,(z1-z0)/Math.max(1,Math.round((z1-z0)/1.6))))B(x-.04,y,z-.04,x+.04,y+1.02,z+.04,'metal2',E9NZ);
  B(x-.03,y,z0,x+.03,y+1.15,z1,'none',{pass:1})}
// a lamp post (sodium), a floodlight pole (cold white), a work lamp on a container's corner
function e9lamp(x,z,y,h){h=h||6;B(x-.1,y,z-.1,x+.1,y+h,z+.1,'metal2');B(x-.12,y+h-.1,z-.7,x+.12,y+h,z+.1,'metal2',E9NZ);B(x-.22,y+h-.32,z-.9,x+.22,y+h-.1,z-.5,'lampO',E9NZ);LIGHT(x,y+h-.6,z-.7,'#ffb070',14,.95,{lamp:1})}
function e9flood(x,z,y,h,col,r){h=h||10;B(x-.18,y,z-.18,x+.18,y+h,z+.18,'metal2');B(x-1,y+h-.5,z-.25,x+1,y+h,z+.25,'metal2',E9NZ);for(const k of [-.55,.55])B(x+k-.3,y+h-.9,z-.3,x+k+.3,y+h-.45,z+.3,'lampW',E9NZ);LIGHT(x,y+h-1,z,col||'#dce6ff',r||26,1)}
function e9work(x,z,y,col){B(x-.2,y,z-.2,x+.2,y+.32,z+.2,'lampW',E9NZ);LIGHT(x,y+.6,z,col||'#e8f0ff',9,.85)}
// a hut (corrugated walls, a flat roof under snow) with a door on one side ('n' 's' 'e' 'w')
function e9shed(x0,z0,x1,z1,y,h,door){const t=.2,dw=1.2,cx=(x0+x1)/2,cz=(z0+z1)/2;
  wallX(x0,x1,z0,z0+t,y,y+h,'e8hangW',door==='n'?[[cx-dw/2,cx+dw/2,y,y+2.2]]:null);wallX(x0,x1,z1-t,z1,y,y+h,'e8hangW',door==='s'?[[cx-dw/2,cx+dw/2,y,y+2.2]]:null);
  wallZ(x0,x0+t,z0+t,z1-t,y,y+h,'e8hangW',door==='w'?[[cz-dw/2,cz+dw/2,y,y+2.2]]:null);wallZ(x1-t,x1,z0+t,z1-t,y,y+h,'e8hangW',door==='e'?[[cz-dw/2,cz+dw/2,y,y+2.2]]:null);
  B(x0-.15,y+h,z0-.15,x1+.15,y+h+.2,z1+.15,'roof');B(x0-.1,y+h+.2,z0-.1,x1+.1,y+h+.3,z1+.1,'e6snowC',E9NZ)}
// a snowcat (tracks, an orange cab, a blade), along x or z, centred
function e9snowcat(x,z,ax,y){const L=5.6,W=2.6,LB=(a0,a1,c0,c1,y0,y1,m,o)=>ax==='x'?B(x+a0,y+y0,z+c0,x+a1,y+y1,z+c1,m,o):B(x+c0,y+y0,z+a0,x+c1,y+y1,z+a1,m,o);
  LB(-L/2,L/2,-W/2,-W/2+.7,0,.9,'tire');LB(-L/2,L/2,W/2-.7,W/2,0,.9,'tire');LB(-L/2+.3,L/2-.4,-W/2+.6,W/2-.6,.4,1.4,'e9cat');LB(-1.2,1.4,-W/2+.15,W/2-.15,1.4,2.8,'e9cat');
  LB(-1.1,1.3,-W/2+.12,W/2-.12,2,2.6,'carGl',E9NZ);LB(-1.25,1.45,-W/2+.1,W/2-.1,2.8,2.9,'e6snowC',E9NZ);LB(L/2,L/2+.25,-W/2-.3,W/2+.3,.1,1.3,'metal2')}
// a pine (a trunk to bump into where it can be reached; the needles are ep9Mesh's)
const E9PINES=[];
function e9pine(x,z,y,s,solid){E9PINES.push([x,y,z,s||1]);if(solid)B(x-.22,y,z-.22,x+.22,y+2.4*(s||1),z+.22,'tirex')}
// a cable drum (a wooden reel) for the workshop: a lit cylinder, a box to hit
function e9reel(x,z,y,r){MAP.deco.push({k:'drum',x,y,z,r:r||.8,h:1.1,mat:'wood',rot:hash2(Math.round(x*10),Math.round(z*10),9)*TAU});B(x-(r||.8)*.75,y,z-(r||.8)*.75,x+(r||.8)*.75,y+1.1,z+(r||.8)*.75,'metalx')}
// the gondola's dock: the platform edges either side of the car (yellow lines), the guide rail its hanger runs on from the portal to the
// bull wheel at the back of the hall (the rope turns round it; it hangs from the roof on its shaft)
function e9dock(cz,y,back,front){B(-3.2,y,cz-2.3,-2.05,y+.25,cz+2.3,'e9hallF');B(2.05,y,cz-2.3,3.2,y+.25,cz+2.3,'e9hallF');
  for(const sx of [-2.1,2.1])B(sx-.06,y+.25,cz-2.3,sx+.06,y+.33,cz+2.3,'hazard',E9NZ);
  B(-.12,y+4.55,Math.min(back,front),.12,y+4.75,Math.max(back,front),'metal2',E9NZ);B(-2.4,y+4.2,back-2.4,2.4,y+4.5,back+2.4,'e9wheel',E9NZ);B(-.3,y+4.5,back-.3,.3,y+7.5,back+.3,'metal2',E9NZ)}
// the gondola car's own boxes where it stands at a dock (daedalus.js draws the car and moves a copy of these up the cable): the floor, the
// roof, the end walls and the sides with a door each (the window band lets shots and sight through) — invisible here. ft: the floor's top
function e9carBoxes(cz,ft,add){const P={pass:1},bx=(x0,y0,z0,x1,y1,z1,o)=>add(x0,ft+y0,cz+z0,x1,ft+y1,cz+z1,o||{});
  bx(-1.7,-.2,-1.2,1.7,0,1.2);bx(-1.7,2.5,-1.2,1.7,2.65,1.2);
  for(const s of [-1,1]){const z0=s<0?-1.2:1.12,z1=s<0?-1.12:1.2;bx(-1.7,0,z0,1.7,1,z1);bx(-1.7,1,z0,1.7,2.1,z1,P);bx(-1.7,2.1,z0,1.7,2.5,z1);
    const x0=s<0?-1.7:1.62,x1=s<0?-1.62:1.7;for(const [a,b] of [[-1.12,-.9],[.9,1.12]]){bx(x0,0,a,x1,1,b);bx(x0,1,a,x1,2.1,b,P);bx(x0,2.1,a,x1,2.5,b)}bx(x0,2.1,-.9,x1,2.5,.9)}}
function buildEp9(){
  const nz=E9NZ,sg=E9SG,Y=E9Y;E9PINES.length=0;
  // ================= the ground =================
  // the valley: snow everywhere, the plaza paved, the hall's floor
  slab(-50,120,50,220,-1,0,'e8snowF',[[-28,166,28,214],[-10,142,10,164]],{ground:1});B(-28,-1,166,28,0,214,'e8plaza',{ground:1});B(-10,-1,142,10,0,164,'e9hallF',{ground:1});
  // the summit: snow round the edges; the maze on old asphalt, the compound paved, the plaza on apron panels with the helipad, the hall
  slab(-46,-92,46,64,Y-1,Y,'e8snowF',[[-30,13.5,30,47.6],[-36,-21,36,13.5],[-44,-92,44,-21],[-10,47.6,10,64]],{ground:1});
  B(-30,Y-1,13.5,30,Y,47.6,'e8lot',{ground:1});B(-36,Y-1,-21,36,Y,13.5,'e8plaza',{ground:1});slab(-44,-92,44,-21,Y-1,Y,'e8apron',[[-36,-48,-20,-32]],{ground:1});
  B(-36,Y-1,-48,-20,Y,-32,'e8pad',{ground:1});B(-10,Y-1,47.6,10,Y,64,'e9hallF',{ground:1});
  // ================= zone A: the valley station's plaza =================
  // ploughed banks round the lot, the road out south blocked by a plough and the army's barriers, pines beyond
  B(-32,0,166,-28,2.2,214,'e6snowG');B(28,0,166,32,2.2,214,'e6snowG');B(-32,0,214,-5,2.2,218,'e6snowG');B(5,0,214,32,2.2,218,'e6snowG');
  for(const x of [-4.2,-1.4,1.4,4.2])e6jb(x,215.4,'x');e6truck(-3.6,216.2,'x');
  for(const [x,z,s] of [[-38,170,1.2],[-41,182,1],[-37,194,1.3],[-42,206,1.1],[-36,216,1],[38,172,1.1],[42,184,1.3],[37,196,1],[41,208,1.2],[36,218,1.1],[-20,224,1.2],[-8,226,1],[8,225,1.3],[22,223,1],
    [-46,160,1.3],[46,160,1.2],[-30,150,1.1],[30,152,1],[-24,136,1.2],[24,134,1.3],[-36,128,1],[36,126,1.1]])e9pine(x,z,0,s);
  // parked cars and the shuttle bus, the bus shelter, the souvenir shop, the map board, lamps
  for(const [x,z,m,b] of [[-20,184,'car'],[-20,190,'carR'],[-14,184.2,'car'],[18,186,'carBurnt',1],[24,186,'car'],[14,196,'carR'],[-22,200,'car']])e6car(x,z,'z',m,b);
  e6bus(8,174,'x');
  B(16,0,204,22,.15,206.6,'conc');B(16,2.6,204,22,2.8,206.6,'roof');B(16,2.8,204.1,22,2.86,206.5,'e6snowC',nz);for(const x of [16.1,21.8])B(x,0,206.4,x+.12,2.6,206.55,'metal2');B(16.1,.15,206.4,21.9,2.4,206.5,'carGl',nz);
  B(17,0,205.4,21,.45,205.9,'wood');
  B(-27.6,0,168,-19.6,4.2,176,'e9hall');B(-27.8,4.2,167.8,-19.4,4.5,176.2,'roof');B(-27.7,4.5,167.9,-19.5,4.6,176.1,'e6snowC',nz);B(-19.58,.1,170,-19.54,2.6,174,'e8hangW',nz);B(-19.56,2.8,169,-19.5,3.6,175,'e9sTicket',sg);
  B(4.6,0,184.6,7.4,.15,185,'metal2');for(const x of [4.7,7.2])B(x,0,184.7,x+.1,1.8,184.9,'metal2');B(4.6,1.8,184.68,7.4,3.4,184.84,'e9sMap',sg);
  for(const [x,z] of [[-12,172],[12,172],[-12,198],[12,198],[0,210],[-24,208],[24,208]])e9lamp(x,z,0,6);
  // ================= the valley station's hall: the car waits in it =================
  // walls (the doors south, gate gA; the portal north the car leaves by), the roof, windows; inside the dock, the turnstiles, the booth
  wallX(-10.4,10.4,164,164.4,0,7.5,'e9hall',[[-3,3,0,3.2],[-9,-4.6,1.4,4.6],[4.6,9,1.4,4.6]]);B(-9,1.4,164.1,-4.6,4.6,164.3,'winLit',nz);B(4.6,1.4,164.1,9,4.6,164.3,'winLit',nz);
  B(-3,0,163.98,0,3.2,164.08,'metal2',{gate:'gA',gs:[-3,0,0]});B(0,0,163.98,3,3.2,164.08,'metal2',{gate:'gA',gs:[3,0,0]});B(-3,.6,163.96,0,3,163.98,'carGl',{gate:'gA',gs:[-3,0,0],nosolid:true});B(0,.6,163.96,3,3,163.98,'carGl',{gate:'gA',gs:[3,0,0],nosolid:true});
  B(-7,4.9,164.42,7,6.1,164.5,'e9sValley',sg);
  wallX(-10.4,10.4,141.6,142,0,7.5,'e9hall',[[-4,4,0,7.5]]);B(-4,0,141.6,4,7.5,141.8,'none',{pass:1});
  wallZ(-10.4,-10,142,164,0,7.5,'e9hall',[[145,161,3.6,6.4]]);wallZ(10,10.4,142,164,0,7.5,'e9hall',[[145,161,3.6,6.4]]);B(-10.3,3.6,145,-10.1,6.4,161,'winLit',nz);B(10.1,3.6,145,10.3,6.4,161,'winLit',nz);
  B(-10.6,7.5,141.4,10.6,8.1,164.6,'roof');B(-10.5,8.1,141.5,10.5,8.22,164.5,'e6snowC',nz);
  e9dock(150,0,158,142);e9carBoxes(150,.25,(x0,y0,z0,x1,y1,z1,o)=>B(x0,y0,z0,x1,y1,z1,'none',o));
  for(const x of [-6,-4.2,4.2,6])B(x-.15,0,158-.3,x+.15,1,158+.3,'e9turn');B(-8.6,0,157.9,-6.4,1,158.1,'metal2');B(6.4,0,157.9,8.6,1,158.1,'metal2');
  B(6.4,0,143.4,9.8,2.8,147.6,'e9booth');B(6.3,2.8,143.3,9.9,3,147.7,'metal2');B(-9.8,0,155,-8.6,.45,161,'wood');
  for(const z of [146,152,158])LIGHT(0,6.8,z,'#e8eef8',12,.85);LIGHT(-6,6.4,150,'#e8eef8',9,.6);LIGHT(6,6.4,150,'#e8eef8',9,.6);
  // a fence from the hall to the banks either side
  e9fenceX(-28,-10.4,164.2,0,2.6);e9fenceX(10.4,28,164.2,0,2.6);
  // ================= the cable: the pylon on the slope (the ropes and the car are daedalus.js's) =================
  // (a lattice tower beside the line, its arm out over it with the sheaves the rope runs on: the car passes under the arm)
  {const g=e9Ground(4,104);for(const sx of [3.3,4.7])for(const sz of [103.3,104.7])B(sx-.15,g+.6,sz-.15,sx+.15,25,sz+.15,'metal2');
    for(const y of [g+6,g+12,g+18])B(3.3,y,103.3,4.7,y+.15,104.7,'metal2',nz);
    B(-.8,25,103.7,4.9,25.4,104.3,'metal2');for(const dz of [-.6,.6])B(-.35,24.2,104+dz-.25,.35,24.55,104+dz+.25,'e9wheel',nz);B(-.1,24.55,103.4,.1,25,104.6,'metal2',nz);
    B(2.6,g-1.4,102.6,5.4,g+.6,105.4,'conc');LIGHT(0,25.8,104,'#ff3a1a',6,.6)}
  // ================= zone B: the summit station's hall (the car's dock) =================
  wallX(-10.4,10.4,47.6,48,Y,Y+8,'e9hall',[[-3,3,Y,Y+3.2],[-9,-4.6,Y+1.4,Y+4.6],[4.6,9,Y+1.4,Y+4.6]]);B(-9,Y+1.4,47.7,-4.6,Y+4.6,47.9,'winLit',nz);B(4.6,Y+1.4,47.7,9,Y+4.6,47.9,'winLit',nz);
  B(-3,Y,47.92,0,Y+3.2,48.02,'metal2',{gate:'gB',gs:[-3,0,0]});B(0,Y,47.92,3,Y+3.2,48.02,'metal2',{gate:'gB',gs:[3,0,0]});
  B(-7,Y+5,47.5,7,Y+6.2,47.58,'e9sSummit',sg);
  wallX(-10.4,10.4,64,64.4,Y,Y+8,'e9hall',[[-4,4,Y,Y+8]]);B(-4,Y,64.2,4,Y+8,64.4,'none',{pass:1});
  wallZ(-10.4,-10,48,64,Y,Y+8,'e9hall',[[51,61,Y+3.6,Y+6.4]]);wallZ(10,10.4,48,64,Y,Y+8,'e9hall',[[51,61,Y+3.6,Y+6.4]]);B(-10.3,Y+3.6,51,-10.1,Y+6.4,61,'winLit',nz);B(10.1,Y+3.6,51,10.3,Y+6.4,61,'winLit',nz);
  B(-10.6,Y+8,47.4,10.6,Y+8.6,64.6,'roof');B(-10.5,Y+8.6,47.5,10.5,Y+8.72,64.5,'e6snowC',nz);
  e9dock(56,Y,51,64);e9carBoxes(56,Y+.25,(x0,y0,z0,x1,y1,z1,o)=>B(x0,y0,z0,x1,y1,z1,'none',o));
  // the hall stands out over the slope: the rock face under it
  B(-14,Y-12,60,14,Y-1,64.4,'e9rock');
  for(const x of [-6,-4.2,4.2,6])B(x-.15,Y,52-.3,x+.15,Y+1,52+.3,'e9turn');B(-8.6,Y,51.9,-6.4,Y+1,52.1,'metal2');B(6.4,Y,51.9,8.6,Y+1,52.1,'metal2');
  B(-9.8,Y,59.4,-6.4,Y+2.8,63.6,'e9booth');B(-9.9,Y+2.8,59.3,-6.3,Y+3,63.7,'metal2');B(8.6,Y,55,9.8,Y+.45,61,'wood');
  for(const z of [52,56,60])LIGHT(0,Y+6.8,z,'#e8eef8',12,.75);
  // ================= zone B: RT1-04's maze — containers in four bands, the way through snaking west, east, west, east =================
  // band 1 z 41..47.6 (in from gB, out at its west end) · band 2 z 30..38.6 (out east) · band 3 z 21..27.6 (out west) · band 4 z 13.5..18.6 (the goal)
  const M=['contR','contB','contG'],cm=i=>M[i%3];
  {let i=0;for(const x0 of [-22,-16,-10,-4,2,8,14,20,24])e8cont(x0,38.56,'x',cm(i++),Y);e8cont(-10,38.56,'x','contB',Y+2.6);e8cont(14,38.56,'x','contG',Y+2.6);
    for(const x0 of [-30,-24,-18,-12,-6,0,6,12,16])e8cont(x0,27.56,'x',cm(i++),Y);e8cont(-24,27.56,'x','contG',Y+2.6);e8cont(6,27.56,'x','contR',Y+2.6);
    for(const x0 of [-22,-16,-10,-4,2,8,14,20,24])e8cont(x0,18.56,'x',cm(i++),Y);e8cont(2,18.56,'x','contB',Y+2.6);e8cont(-16,18.56,'x','contR',Y+2.6)}
  // the island in band 2: two containers stacked (the meeting's perch, 5.2 up)
  e8cont(-9,33.1,'x','contR',Y);e8cont(-9,33.1,'x','contB',Y+2.6);
  // RT1-04's words on the steel; low cover in the bands; a fence across band 3 leaving a gap at its north side
  B(-3.8,Y+.6,41.02,1.8,Y+2.2,41.1,'e9sBack',sg);B(-28,Y+.6,30.02,-23,Y+2.2,30.1,'e9s06',sg);B(16,Y+.6,21.02,21,Y+2.2,21.1,'e9sWall',sg);B(-3.6,Y+3.3,33.04,1.6,Y+4.9,33.1,'e9sBack',sg);
  e6jb(-14,44.4,'z',Y);e6jb(10,43.6,'x',Y);e6jb(-18,31.8,'x',Y);e6jb(14,36.6,'x',Y);e6jb(20,24.2,'z',Y);e6jb(-6,23.4,'x',Y);e6jb(-20,15.6,'x',Y);
  e6sand(-28,40.2,'x',3.6,1.1,Y);e6sand(24,31.4,'z',3,1.1,Y);e6sand(-28,20.4,'z',3,1.1,Y);
  e9fenceZ(21,24.8,0,Y,2.6);
  for(const [x,z,s] of [[26.4,45.2,1.2],[27.6,43.6,1],[-28.4,36.2,1.2],[27.8,23,1.1],[-28,15,1.2],[12,16,1],[28,16,1.2]])crate(x,z,s,Y,'e8crate');crate(27.6,43.6,.9,Y+1,'e8crate');
  // the maze's work lamps on the container tops
  for(const [x,z] of [[-19,39.8],[11,39.8],[-27,28.8],[19,28.8],[-13,19.8],[17,19.8],[-6,34.3]])e9work(x,z,Y+(x===-6?5.3:2.7));
  // the maze's sides: rock walls up to the hall, the compound's fence to the north
  // (down to the compound's fence: a 0.7 m slot between the fence and the rocks' ends let a bot out round the side of the maze)
  B(-31,Y,12.6,-30,Y+3.4,47.6,'e9rock');B(30,Y,12.6,31,Y+3.4,47.6,'e9rock');B(-30,Y,47.6,-10.4,Y+3.4,48.4,'e9rock');B(10.4,Y,47.6,30,Y+3.4,48.4,'e9rock');
  // ================= zone C: the station compound =================
  // its south fence and gate (gC); the blast wall north and its gate (gD); rock and fence round the sides
  e9fenceX(-36,-3,12.75,Y,2.8);e9fenceX(3,36,12.75,Y,2.8);B(-3,Y,12.7,0,Y+2.8,12.8,'fence',{gate:'gC',gs:[-2.95,0,0],pass:1});B(0,Y,12.7,3,Y+2.8,12.8,'fence',{gate:'gC',gs:[2.95,0,0],pass:1});
  B(-3,Y+2.7,12.66,0,Y+2.85,12.84,'metal2',{gate:'gC',gs:[-2.95,0,0]});B(0,Y+2.7,12.66,3,Y+2.85,12.84,'metal2',{gate:'gC',gs:[2.95,0,0]});
  B(-6,Y+3.2,12.65,6,Y+4.5,12.85,'e9sRadar',sg);for(const x of [-6.2,6])B(x,Y,12.6,x+.2,Y+4.6,12.9,'metal2');
  wallX(-44,44,-21.8,-21.2,Y,Y+4,'conc',[[-4,4,Y,Y+4]]);B(-44,Y+4,-21.9,44,Y+4.12,-21.1,'e6snowC',nz);
  B(-4,Y,-21.7,0,Y+3.9,-21.3,'e8hdoor',{gate:'gD',gs:[-4,0,0]});B(0,Y,-21.7,4,Y+3.9,-21.3,'e8hdoor',{gate:'gD',gs:[4,0,0]});B(-3,Y+4.2,-21.15,3,Y+5.2,-21.1,'e9sDanger',sg);
  B(-37,Y,-21.2,-36,Y+3.4,12.7,'e9rock');B(36,Y,-21.2,37,Y+3.4,12.7,'e9rock');
  // the operations building (west): the radar console inside; a door east
  wallX(-34,-14,-18.2,-17.8,Y,Y+6,'e9ops');wallX(-34,-14,-2.2,-1.8,Y,Y+6,'e9ops');wallZ(-34.2,-33.8,-18.2,-1.8,Y,Y+6,'e9ops');wallZ(-14.2,-13.8,-18.2,-1.8,Y,Y+6,'e9ops',[[-11.2,-8.8,Y,Y+2.6]]);
  B(-34.4,Y+6,-18.6,-13.6,Y+6.4,-1.4,'roof');B(-34.3,Y+6.4,-18.5,-13.7,Y+6.5,-1.5,'e6snowC',nz);B(-34,Y-.02,-18,-14,Y+.02,-2,'e9hallF',nz);
  B(-26,Y,-17.8,-22,Y+1.3,-16.6,'e8console');B(-26.2,Y+1.3,-17.8,-21.8,Y+2.4,-17.4,'e9panel',nz);B(-31,Y,-17.8,-29,Y+2.2,-16.8,'e8radio');B(-19,Y,-17.8,-16,Y+2.2,-16.8,'e9panel');
  for(const [x,z] of [[-30,-10],[-24,-8],[-30,-5]]){B(x-1.2,Y,z-.6,x+1.2,Y+.76,z+.6,'wood');B(x-.35,Y+.76,z-.3,x+.35,Y+1.2,z-.2,'e9panel',nz)}for(const z of [-14,-8])B(-33.8,Y,z-1.4,-32.6,Y+2.2,z+1.4,'e9panel');
  B(-13.8,Y+3,-14,-13.7,Y+3.8,-6,'e9sRadar',sg);LIGHT(-24,Y+5.4,-12,'#e8eef8',14,.9);LIGHT(-24,Y+5.4,-5,'#e8eef8',10,.6);
  // the generator house (east): the transformer inside; a door west
  wallX(14,30,-18.2,-17.8,Y,Y+5.5,'e8hangW');wallX(14,30,-6.2,-5.8,Y,Y+5.5,'e8hangW');wallZ(29.8,30.2,-18.2,-5.8,Y,Y+5.5,'e8hangW');wallZ(13.8,14.2,-18.2,-5.8,Y,Y+5.5,'e8hangW',[[-13.2,-10.8,Y,Y+2.6]]);
  B(13.6,Y+5.5,-18.6,30.4,Y+5.9,-5.4,'roof');B(13.7,Y+5.9,-18.5,30.3,Y+6,-5.5,'e6snowC',nz);B(15.4,Y+2.9,-5.75,20.6,Y+3.9,-5.7,'e9sGen',sg);
  for(const x of [17,22])B(x-1.6,Y,-17.6,x+1.6,Y+2,-14.4,'e8gen');B(25.2,Y,-14,28.6,Y+2.6,-10,'e9trans');B(27,Y+2.6,-13.4,28.4,Y+4.6,-10.6,'metal2',nz);
  B(14.2,Y+4.2,-17.6,29.8,Y+4.4,-17.2,'metal2',nz);LIGHT(22,Y+4.8,-12,'#e8eef8',12,.85);
  // the fuel tank (north-east) and its valve; the courtyard: the snowcat, the weather instruments, pallets, a pickup
  MAP.deco.push({k:'drum',x:26,y:Y,z:4,r:3,h:4.4,mat:'e8tank',rot:0});B(23.4,Y,1.4,28.6,Y+4.4,6.6,'metalx');B(23.3,Y+4.4,1.3,28.7,Y+4.5,6.7,'e6snowC',nz);
  B(22.2,Y,3.4,23.2,Y+1.4,4.6,'metal2');B(22.4,Y+3.2,6.66,29.6,Y+4,6.7,'e9sFuel',sg);
  e9snowcat(-4,-6,'x',Y);e6truck(-26,4,'x',{y:Y});
  for(const [x,z] of [[6,6],[10,6]]){for(const dx of [-.4,.4])for(const dz of [-.4,.4])B(x+dx-.04,Y,z+dz-.04,x+dx+.04,Y+1.2,z+dz+.04,'metal2',nz);B(x-.5,Y+1.2,z-.5,x+.5,Y+2,z+.5,'e9screen')}
  B(7.9,Y,-.1,8.1,Y+8,.1,'metal2');B(7.4,Y+7.9,-.1,8.6,Y+8,.1,'metal2',nz);B(-14,Y,8,-11,Y+.9,10,'pallet');B(12,Y,-2,14.4,Y+1.2,0,'pallet');crate(-10,-14,1.2,Y,'e8crate');crate(-9.6,-14,1,Y+1.2,'e8crate');
  e6sand(3,-14,'x',4,1.1,Y);
  for(const [x,z] of [[-8,8],[8,-18],[-2,-18],[32,-2],[-32,8]])e9lamp(x,z,Y,6);
  // ================= zone D: the radome plaza =================
  // the radome's tower (its catwalk at 48: a railing round it, gaps where the two stairs come up), the dome (ep9Mesh) and the boxes inside it
  B(-7,Y,-63,7,Y+7.6,-49,'e9tower');B(-9,Y+7.6,-65,9,Y+8,-47,'e8grate');
  e9railX(-9,9,-65,Y+8);e9railX(-9,9,-47,Y+8);e9railZ(-65,-58.6,-9,Y+8);e9railZ(-55.8,-47,-9,Y+8);e9railZ(-65,-58.6,9,Y+8);e9railZ(-55.8,-47,9,Y+8);
  B(-6,Y+8.03,-62,6,Y+16,-50,'none');B(-4.4,Y+16,-60.4,4.4,Y+18.2,-51.6,'none');
  stairs('z',-11.2,-9.2,-42,-55.8,Y,Y+8,16,'conc');stairs('z',9.2,11.2,-42,-55.8,Y,Y+8,16,'conc');B(-11.2,Y+7.6,-58.6,-9,Y+8,-55.8,'e8grate');B(9,Y+7.6,-58.6,11.2,Y+8,-55.8,'e8grate');
  for(const [x,z] of [[-6,-44.6],[6,-44.6],[-6,-67.4],[6,-67.4]])LIGHT(x,Y+.7,z,'#dfe6f4',13,.55);LIGHT(0,Y+9,-56,'#c8d4f0',12,.5);
  B(-.4,Y,-48.8,.4,Y+1.4,-48.4,'e9sw');B(-1.8,Y+2.2,-48.98,1.8,Y+3,-48.94,'e9sDanger',sg);
  // the helipad (west: FERRY 06's own), the antenna mast (east: a platform at 46), the sheds, RT1-04's workshop by the west one
  for(const [x,z] of [[-36,-48],[-20,-48],[-36,-32],[-20,-32]])B(x-.15,Y,z-.15,x+.15,Y+.4,z+.15,'lampR',nz);
  for(const [x,z] of [[28.8,-69.2],[31.2,-69.2],[28.8,-66.8],[31.2,-66.8]])B(x-.12,Y,z-.12,x+.12,Y+18,z+.12,'metal2');
  for(const y of [Y+3,Y+9,Y+12,Y+15])for(const s of [-1,1]){B(28.8,y-.05,-68+s*1.2-.05,31.2,y+.05,-68+s*1.2+.05,'metal2',nz);B(30+s*1.2-.05,y-.05,-69.2,30+s*1.2+.05,y+.05,-66.8,'metal2',nz)}
  B(28.2,Y+5.8,-69.8,31.8,Y+6,-66.2,'e8grate');e9railX(28.2,31.8,-69.8,Y+6);e9railX(28.2,31.8,-66.2,Y+6);e9railZ(-69.8,-66.2,28.2,Y+6);e9railZ(-69.8,-66.2,31.8,Y+6);
  B(29.6,Y+18,-68.4,30.4,Y+18.4,-67.6,'lampR',nz);
  e9shed(-38,-60,-32,-54,Y,3,'e');e9shed(32,-36,38,-30,Y,3,'w');B(-31.98,Y+1.6,-56,-31.92,Y+2.4,-54.6,'e9sWall',sg);
  for(const [x,z] of [[-29.4,-61.4],[-28.8,-52.4]])B(x-1.2,Y,z-.5,x+1.2,Y+.9,z+.5,'wood');e9reel(-30.6,-49.6,Y,.85);e9reel(-26.2,-63.6,Y,.7);crate(-24.6,-58,1.1,Y,'e8crate');crate(-24.6,-58,.9,Y+1.1,'e8crate');
  B(-28.6,Y+.9,-61.7,-27.6,Y+1.1,-61.1,'metal2',nz);B(-29.8,Y+.9,-52.7,-28.6,Y+1.3,-52.1,'e8gen',nz);
  // the observation deck over the north cliff (stairs at both ends)
  B(-8,Y,-88.4,8,Y+2,-84.4,'e9deck');stairs('x',-88.4,-84.4,-12,-8,Y,Y+2,4,'e9deck');stairs('x',-88.4,-84.4,12,8,Y,Y+2,4,'e9deck');
  e9railX(-8,8,-88.4,Y+2);B(-1.8,Y+2,-84.6,1.8,Y+2.9,-84.4,'e9sObs',sg);
  // the lightning rods (daedalus.js arms them): a mast by the workshop's shed and one in front of the observation deck; the antenna mast and
  // the radome's own rod are the other two. A switch box at the foot of each (the radome's on the tower's south face); cover, floods
  for(const [x,z] of [[-29.5,-56.5],[0,-82]]){B(x-.6,Y,z-.6,x+.6,Y+.5,z+.6,'conc');B(x-.07,Y+.5,z-.07,x+.07,Y+9.5,z+.07,'metal2')}
  B(-28.5,Y,-56.9,-27.9,Y+1.4,-56.1,'e9sw');B(-.4,Y,-80.4,.4,Y+1.4,-79.8,'e9sw');B(27.1,Y,-71,27.9,Y+1.4,-70.4,'e9sw');
  e8cont(-24,-56,'z','contR',Y);e8cont(14,-80,'x','contG',Y);e8cont(-8,-80,'x','contB',Y);e8cont(18,-60,'z','contB',Y);e8cont(-42,-80,'z','contG',Y);
  e9snowcat(-14,-66,'z',Y);e6sand(12,-36,'x',4,1.1,Y);e6sand(-6,-34,'x',4,1.1,Y);e6sand(34,-56,'z',4,1.1,Y);e6sand(-40,-40,'z',4,1.1,Y);e6sand(26,-86,'x',5,1.1,Y);
  for(const [x,z] of [[10,-46],[-12,-50],[14,-70]]){crate(x,z,1.2,Y,'e8crate');crate(x+1.2,z,1.2,Y,'e8crate')}B(32,Y,-80,36,Y+2,-77,'e8gen');B(-38,Y,-30,-34.6,Y+2,-27,'e8gen');
  for(const [x,z] of [[-42,-26],[42,-26],[-42,-88],[42,-88]])e9flood(x,z,Y,11);
  // ================= the edges: railings over the cliffs; invisible walls round every zone (the gates' openings left) =================
  e9railX(-46,46,-92,Y);e9railZ(-92,-21.8,-46,Y);e9railZ(-92,-21.8,46,Y);
  {const W=(x0,z0,x1,z1,y0)=>B(x0,y0,z0,x1,y0+9,z1,'none',{pass:1});
    // the valley's lot (and along its fences to the hall: the banks' ends could be climbed and the fence stepped over from them)
    W(-32.2,164,-32,218.2,0);W(32,164,32.2,218.2,0);W(-32.2,218,32.2,218.2,0);W(-32.2,164.3,-10.4,164.5,0);W(10.4,164.3,32.2,164.5,0);
    // the summit: round the plateau, then between the zones
    W(-46.2,-92.2,46.2,-92,Y);W(-46.2,-92.2,-46,64.4,Y);W(46,-92.2,46.2,64.4,Y);W(-46.2,64.4,-10.4,64.6,Y);W(10.4,64.4,46.2,64.6,Y);
    W(-31,13.3,31,13.5,Y+3.4);W(-36,12.55,-3,12.6,Y);W(3,12.55,36,12.6,Y);W(-46.2,-21.9,-4,-21.85,Y);W(4,-21.9,46.2,-21.85,Y)}
  // ================= spawns, zones, gates, devices =================
  const A=[[-4.5,0,206,0],[-1.5,0,206,0],[1.5,0,206,0],[4.5,0,206,0],[-3,0,208,0],[0,0,208,0],[3,0,208,0],[-6,0,208,0]];
  const Bs=[[-4.5,Y,51,0],[-1.5,Y,51,0],[1.5,Y,51,0],[4.5,Y,51,0],[-6,Y,49.6,0],[-3,Y,49.6,0],[3,Y,49.6,0],[6,Y,49.6,0]];
  const Cs=[[-4.5,Y,9.6,0],[-1.5,Y,9.6,0],[1.5,Y,9.6,0],[4.5,Y,9.6,0],[-3,Y,8,0],[0,Y,8,0],[3,Y,8,0],[-6,Y,8,0]];
  const Ds=[[-4.5,Y,-25,0],[-1.5,Y,-25,0],[1.5,Y,-25,0],[4.5,Y,-25,0],[-3,Y,-26.6,0],[0,Y,-26.6,0],[3,Y,-26.6,0],[-6,Y,-26.6,0]];
  MAP.spawns=A.map(p=>[p[0],p[2],p[1],p[3]]);
  // (none at the lot's south end, where the team starts: two there had come out of the corners 13 m from it and cornered it against the plough)
  const zA=[[-26,170],[26,170],[-26,182],[26,182],[-26,196],[26,196],[-26,204],[26,204],[-14,168],[14,168]];
  const zB=[[27,44.6,Y],[20,44.6,Y],[-27,34,Y],[8,31.4,Y],[27,23.4,Y],[-14,24.6,Y],[-27,16,Y],[26,16,Y],[16,16,Y]];
  const zC=[[-34,10,Y],[34,10,Y],[-10,-19,Y],[8,-19,Y],[34,-2,Y],[-33,0,Y],[12,-19.4,Y]];
  const zD=[[-42,-24.6,Y],[42,-24.6,Y],[-42,-56,Y],[42,-56,Y],[-42,-86,Y],[42,-86,Y],[-18,-88,Y],[18,-88,Y]];
  MAP.zspawns=[].concat(zA,zB,zC,zD);
  const dv=(x,y,z,n,act,t,bx,bz)=>({x,y,z,t,r:1.8,n,act,lh:2.3,mh:2.2,bx:bx||0,bz:bz||0});
  MAP.ez={
    zones:{A:{box:[-28,166,28,214],start:A,zsp:zA},B:{box:[-30,13.5,30,64],start:Bs,zsp:zB},C:{box:[-36,-20,36,12.4],start:Cs,zsp:zC},D:{box:[-44,-90,44,-23],start:Ds,zsp:zD}},
    door:{A:[0,1.5,164.6],B:[0,Y+1.5,47.4],C:[0,Y+1.5,12.2],D:[0,Y+1.5,-22.4]},
    // the cable car: its docks (the car's floor centre), the cable's path (z, the floor's height) and where the hanger grips the rope
    car:{valley:[0,.25,150],summit:[0,Y+.25,56],path:[[150,.25],[140,.25],[68,Y+.25],[56,Y+.25]],grip:4.1,hw:1.7,hd:1.2},
    // stage 2: the maze's goal (in front of gC), its sentries (yaw: where they face first — one to a stretch: band 2 from its east end,
    // band 3's west half from its west end, its east half from the stacked containers over it; that one had faced across band 3, and
    // with the west end's gun it had caught the whole band in a crossfire: most of the maze's deaths on hard) and tripwires (y: the wire's height)
    goal:{maze:{box:[-6,13.5,6,18.5],p:[0,Y,16],n:['관측소 철문','STATION GATE']}},
    // his first appearance: on the stacked containers mid-maze (facing the hall); where he leaps away to (over into the compound)
    dMeet:{p:[-6,Y+5.2,34.32],yaw:Math.PI,out:[-6,Y,4]},
    sentry:[{x:28.4,y:Y,z:36.6,yaw:Math.PI/2},{x:-28.4,y:Y,z:26.2,yaw:-Math.PI/2},{x:4,y:Y+5.2,z:19.8,yaw:-Math.PI/2}],
    trip:[[-16,41.1,-16,47.4],[8,30.1,8,32.9],[8,35.7,8,38.4],[14,21.1,14,27.4],[-12,21.1,-12,27.4],[-16,13.6,-16,18.4]],
    // stage 3: the three charges RT1-04 wired up (9 s each, any order)
    chg:[dv(26,Y,-12,['변압기 · 발전실','The transformer · generator house'],['폭약 해체','defuse the charge'],9,-1.4,0),
      dv(22.7,Y,4,['유류 탱크 밸브','The fuel tank\'s valve'],['폭약 해체','defuse the charge'],9,-.9,0),
      dv(-24,Y,-16.4,['레이더 콘솔 · 관측동','The radar console · operations'],['폭약 해체','defuse the charge'],9,0,1.3)],
    // the boss fight: the lightning rods (their tops; the switch boxes: bx bz), the radome (its centre, the catwalk's height and corners),
    // perches for the wings, the stairs' feet, cover
    // (r: how close to the rod a strike reaches him — the radome's runs down its frame into the whole catwalk)
    rods:[{i:0,x:30,y:Y,z:-68,top:Y+18.4,bx:26.6,bz:-70.6,r:8,mast:1},{i:1,x:-29.5,y:Y,z:-56.5,top:Y+9.5,bx:-27.1,bz:-56.5,r:7},{i:2,x:0,y:Y,z:-82,top:Y+9.5,bx:0,bz:-79,r:7},
      {i:3,x:0,y:Y+8,z:-56,top:Y+23,bx:0,bz:-47.6,r:13,dome:1}],
    dome:{x:0,y:Y+12,z:-56,r:6.5,cat:Y+8,ring:[-9,-65,9,-47],box:[-6,-62,6,-50]},
    cat:[[-8,Y+8,-64],[8,Y+8,-64],[-8,Y+8,-48],[8,Y+8,-48],[0,Y+8,-64],[0,Y+8,-48],[-8,Y+8,-56],[8,Y+8,-56]],
    perch:[[-8,Y+8,-64],[8,Y+8,-64],[-8,Y+8,-48],[8,Y+8,-48],[30,Y+6,-68],[0,Y+2,-86.4],[-35,Y+3.3,-57],[35,Y+3.3,-33]],
    stairs:[[-10.2,Y,-41.4],[10.2,Y,-41.4]],
    // where he waits for the team (his workshop by the west shed); ammo boxes (the sheds' doors, the deck's stairs)
    dEnter:[-26,Y,-52],ammo:[[-31.2,Y,-57],[31.2,Y,-33],[-12.8,Y,-86.4],[12.8,Y,-86.4]],
    cover:[[-26,Y,-50],[-22,Y,-46],[-12,Y,-48],[10,Y,-44],[14,Y,-48],[16,Y,-58],[20,Y,-62],[14,Y,-72],[-14,Y,-62],[-14,Y,-70],[-8,Y,-77],[-2,Y,-77],[16,Y,-78],[22,Y,-78],
      [-40,Y,-76],[-38,Y,-42],[-4,Y,-36],[10,Y,-38],[32,Y,-54],[34,Y,-82],[-30,Y,-66],[26,Y,-30],[-36,Y,-26]],
    // the escape: the car at the summit dock (the hall's inside), its marker
    exit:{x0:-1.6,x1:1.6,z0:54.9,z1:57.1},exitMk:[0,Y+3.4,56]};
  MAP.camps=[{k:'a',w:.2,p:[[0,0,196],[-2,0,196]],look:[0,1,180]},{k:'b',w:.2,p:[[0,Y,44]],look:[-10,Y+1,44]},{k:'c',w:.2,p:[[0,Y,0]],look:[0,Y+1,-12]},{k:'d',w:.2,p:[[0,Y,-36]],look:[0,Y+4,-56]}];
  MAP.moon={d:new THREE.Vector3(.3,.5,-.8).normalize(),c:new THREE.Color('#6a7a9a'),i:.22};MAP.spawnYaw=0;
  MAP.cam=(t,cam)=>{const a=t*.03;cam.position.set(Math.sin(a)*30,Y+16,-56+Math.cos(a)*30);cam.lookAt(0,Y+8,-56)}}
// ---------- the meshes boxes cannot make: the mountain round the map, the pines, the radome's dome, the cable car's ropes ----------
// (all for looks: nothing here is solid. The mountain stays under the cable, under both stations and under the plateau.)
const E9M={dome:null,rope:[]};
function e9Ground(x,z){const Y=E9Y;
  // (the valley floor is boxes: the mesh stays under it)
  if(Math.abs(x)<=50&&z>=118&&z<=222)return -1.6;
  // down from the plateau's edge: gently south toward the valley (it meets the valley floor by z 120), steeply everywhere else
  const px=Math.max(0,Math.abs(x)-46),pzN=Math.max(0,-92-z),pzS=Math.max(0,z-64),d=Math.hypot(px,Math.max(pzN,pzS));
  let h=Y-1.4-d*(pzS>0&&Math.abs(x)<70?.72:1.15);h+=(fbm(x/26,z/26,9201,3,0)-.5)*6*clamp(d/20,0,1);
  const far=Math.hypot(x,z-40);if(far>150)h=Math.max(h,(fbm(x/60,z/60,9202,3,0)-.25)*70);
  // kept 7.5 m under the car all along the cable (its floor's height along z)
  if(z>60&&z<150&&Math.abs(x)<16){const cz=z>=140?.25:z<=68?Y+.25:.25+(140-z)/72*Y;h=Math.min(h,cz-7.5)}
  h=Math.max(h,-3);if(Math.abs(x)<=46.5&&z>=-92.5&&z<=64.5)h=Math.min(h,Y-1.6);return h}
function ep9Mesh(scene){const Y=E9Y;
  // the mountain: a heightfield 400 × 600 m every 5 m, snow on the gentle slopes and grey rock on the steep ones, lit dimly
  {const X0=-200,Z0=-280,S=5,NX=81,NZ=121,pos=new Float32Array(NX*NZ*3),col=new Float32Array(NX*NZ*3),uv=new Float32Array(NX*NZ*2),H=new Float32Array(NX*NZ);
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,x=X0+i*S,z=Z0+j*S;H[k]=e9Ground(x,z);pos[k*3]=x;pos[k*3+1]=H[k];pos[k*3+2]=z;uv[k*2]=x/8;uv[k*2+1]=z/8}
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,hx=H[j*NX+Math.min(NX-1,i+1)]-H[j*NX+Math.max(0,i-1)],hz=H[Math.min(NZ-1,j+1)*NX+i]-H[Math.max(0,j-1)*NX+i];
      const steep=clamp(Math.hypot(hx,hz)/(4*S)*1.6,0,1),n=fbm(i/7,j/7,9203,2,0),l=.34+.16*n-steep*.18;const rock=steep>.55?clamp((steep-.55)*3,0,1):0;
      col[k*3]=l*(1-rock*.45);col[k*3+1]=l*(1-rock*.42);col[k*3+2]=(l+.05)*(1-rock*.35)}
    const idx=[];for(let j=0;j<NZ-1;j++)for(let i=0;i<NX-1;i++){const a=j*NX+i,b=a+1,c=a+NX,d=c+1;idx.push(a,c,b,b,c,d)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,matWorld(TEX.e6snow));m.frustumCulled=false;scene.add(m);MAP.meshes.push(m)}
  // the pines: three cones and a trunk each, snow on the tiers (one mesh)
  {const P=[],C=[],add=(geo,mx,c)=>{geo.applyMatrix4(mx);const p=geo.attributes.position,n=geo.index?geo.toNonIndexed():geo,q=n.attributes.position;for(let i=0;i<q.count;i++){P.push(q.getX(i),q.getY(i),q.getZ(i));C.push(c[0],c[1],c[2])}};
    const pts=E9PINES.slice();for(let k=0;k<70;k++){const a=hash2(k,1,9211)*TAU,r=60+hash2(k,2,9211)*80,x=Math.cos(a)*r,z=110+Math.sin(a)*r*1.3;const h=e9Ground(x,z);if(h<Y-8&&!(Math.abs(x)<16&&z>60&&z<150))pts.push([x,h,z,.9+hash2(k,3,9211)*.7])}
    for(const [x,y,z,s] of pts){const mx=new THREE.Matrix4();
      add(new THREE.CylinderGeometry(.14*s,.2*s,2.2*s,5),mx.clone().makeTranslation(x,y+1.1*s,z),[.12,.09,.07]);
      for(let t=0;t<3;t++){const r=(1.9-t*.5)*s,h=2.2*s,yy=y+1.3*s+t*1.35*s;add(new THREE.ConeGeometry(r,h,7),new THREE.Matrix4().makeTranslation(x,yy+h/2,z),t===2?[.42,.46,.5]:[.06,.12,.1]);
        add(new THREE.ConeGeometry(r*.75,h*.42,7),new THREE.Matrix4().makeTranslation(x,yy+h*.62,z),[.5,.54,.58])}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    const uv=new Float32Array(P.length/3*2).fill(.5);g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.computeVertexNormals();
    const m=new THREE.Mesh(g,matWorld(TEX.e9screen));m.frustumCulled=false;scene.add(m);MAP.meshes.push(m)}
  // the radome: three quarters of a sphere on the tower's catwalk, lit from below by the floods
  {const D={x:0,y:Y+12,z:-56,r:6.5};const g=new THREE.SphereGeometry(D.r,36,18,0,TAU,0,Math.PI*.712);const p=g.attributes.position,col=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){const yy=p.getY(i)/D.r;const l=.42+.28*clamp(-yy+.4,0,1)+.12*clamp(yy,0,1);col[i*3]=l;col[i*3+1]=l*1.02;col[i*3+2]=l*1.08}
    g.setAttribute('color',new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(g,matWorld(TEX.e9dome,{emis:.04}));m.position.set(D.x,D.y,D.z);m.frustumCulled=false;scene.add(m);MAP.meshes.push(m);E9M.dome=m;
    // its own lightning rod on top
    const r=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,4.6,6),matWorld(TEX.e8grate||TEX.e6snow));r.position.set(D.x,D.y+D.r+2.2,D.z);scene.add(r);MAP.meshes.push(r)}
  // the cable car's ropes: the track and the haul rope side by side, level out of each station, up the slope between, over the pylon
  {const C=MAP.ez&&MAP.ez.car;if(C){const g0=C.grip+.12,pts=[[158,.25+g0],[140,.25+g0],[68,Y+.25+g0],[51,Y+.25+g0]];E9M.rope=[];
    for(const sx of [-.22,.22]){for(let k=0;k<pts.length-1;k++){const [z0,y0]=pts[k],[z1,y1]=pts[k+1],L=Math.hypot(z1-z0,y1-y0);const g=new THREE.CylinderGeometry(.035,.035,L,5);g.rotateX(Math.PI/2);
        const m=new THREE.Mesh(g,matWorld(TEX.e8grate||TEX.e6snow,{emis:.02}));m.position.set(sx,(y0+y1)/2,(z0+z1)/2);m.rotation.x=Math.atan2(y1-y0,-(z1-z0));scene.add(m);MAP.meshes.push(m);E9M.rope.push(m)}}}}}
MAPDEFS.ep9={n:['설령산 기상 레이더 기지','Seolryeong Radar Station'],d:['뇌설이 내리는 밤, 산꼭대기의 기상 레이더 기지. 케이블카 → 미로 → 관측동 → 레이더 돔.','A night of thundersnow on the mountaintop radar station: the cable car, the maze, the compound, then the radome.'],
  env:{sky:1,skyTex:'e9sky',noStars:1,snow:1,storm:1,fog:'#121826',fogD:.018,skyFog:.5,halo:'#4a5a7a',ambOut:'#2c3446',ambIn:'#202430',boAmb:.48},bounds:[-50,-94,50,222],
  probeY:[.9,2.4,4.4,6.4,40.9,42.4,44.4,46.4,48.9,51,54],mini:[20,46.5],
  build:buildEp9,tex:bakeEp9Tex,mesh:ep9Mesh,ep:9};

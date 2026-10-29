'use strict';
// ============ v7.11: GLACIER (글레이셔) — a cryo projector that freezes zombies solid and raises walls of ice (supply crates only) ============
// Our own design. Hold the trigger: a jet of liquid-nitrogen mist (GLC.R m, a cone narrowing as an angle) chills every zombie in it with a
// clear line ten times a second — it slows as the cold builds (up to GLC.SLOW), and at full cold it freezes solid for GLC.FRZ s, locked
// in a crust of ice. A zombie frozen this way is BRITTLE: everything hits it GLC.BRIT times as hard, and if it dies frozen it SHATTERS
// — the body bursts into ice, and the shards hurt and chill every zombie within GLC.SH.R m (enough cold, and they freeze too). After a
// thaw it cannot freeze again for GLC.IMM s. A boss is never frozen (the bosses' own frost rules: a slow and a little stagger).
// Right click: ICE WALL — ICW.COST coolant for a wall of ice (ICW.W × ICW.H m) raised across the aim, ICW.MIND..ICW.MAXD m ahead (in
// front of the first zombie on the line, or where the aim meets the ground), squared to the nearest axis. It stops every body (zombies
// pushed out to its far side as it rises) but not bullets, and nothing reaches through it — no claw, no blade. It stands ICW.LIFE s;
// zombies clawing at it bring it down sooner (ICW.HP blows, a heavy one counts two). One wall at a time; ICW.CD s between walls.
// 150 coolant a tank (15 s of jet): the tank on the left of the body is pulled out sideways and a fresh one pushed in.
// Network: the jet is an ordinary shot ('f', replayed everywhere for the look; the cold is the shooter page's — on someone it does not
// own it goes to the owner as an effect: gc = the cold, gf = frozen by this gun); the host deals the damage, the brittle bonus and the
// shatter (CLIH gcs, its burst seen on every page). A wall is the owner page's ('iw' with its place); every page keeps it its full life,
// the host decides one clawed down (a client zombie's blow on it: icwh; the host's word: icwx).

// ---------- numbers ----------
// R / W0 / WK / FULL / MIN: the jet's reach, its half width at the nozzle and growth a metre, full strength this close, what is left at
// the end; CH: cold a tick at full strength (10 = frozen); DECAY: cold lost a second once GLC.HOLD s have passed without a tick; SLOW:
// the most speed it takes; FRZ / IMM: the freeze and the time after a thaw before another; BRIT: what everything does to a frozen one;
// SH: the shatter (reach, damage at the centre, cold); BOSS: what of the cold reaches a big zombie
const GLC={R:8.5,W0:.25,WK:.1,FULL:3,MIN:.4,CH:1.4,DECAY:3.2,HOLD:.5,SLOW:.55,FRZ:1.8,IMM:1.4,BRIT:1.6,SH:{R:3.4,dmg:60,ch:4.6},BOSS:.3,
  tex:null,mist:null,crGeo:null,pool:[],acc:{}};
const ICW={list:[],seq:0,W:3.6,H:2.5,D:.55,LIFE:7,HP:14,COST:25,CD:9,RISE:.24,MIND:2.2,MAXD:9,lastHit:null};
MATK.icewall='glass';

// ---------- atlas: white composite, frosted steel, blue-anodised fins, the glowing coolant ----------
const GC_MATS=['gcBody','gcFrost','gcFin','gcCore'];
for(const m of GC_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintGcAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS,id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4,r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the body: a cool white composite, a faint moulded grain, scuffs gone grey, a thin teal pin-line now and then
  patch('gcBody',(xx,y,X,Y)=>{const t=nz(X,Y,7601,22)*.5+hash2(X,Y,7602)*.5;let c=t>.64?'#d0d7dc':t<.36?'#bfc7cd':'#c8cfd4';if(nz(X,Y,7603,9)>.8)c='#b2bac0';
    if(y%64===31)c='#3aa8b8';if(hash2(X,Y,7604)<.006)c='#e8eef2';return c},248);
  // frosted steel: brushed grey under a crust of white rime, crystals glinting, thicker toward one edge
  patch('gcFrost',(xx,y,X,Y)=>{const b=Math.sin(xx*.5+nz(X,Y,7611,10)*3)*.5+.5;let c=mix('#6a737c','#9aa4ae',b);const r=nz(X,Y,7612,12)+y/128*.35;
    if(r>.62)c=r>.78?'#f2f8fc':'#cfe0ea';if(hash2(X,Y,7613)<.02)c='#ffffff';return c},250);
  // the fins: blue anodised aluminium, rimed white at the edges
  patch('gcFin',(xx,y,X,Y)=>{const t=nz(X,Y,7621,14);let c=t>.6?'#3a78b0':t<.4?'#244e7c':'#2e6496';const e=Math.min(xx,127-xx,y,127-y);if(e<10&&nz(X,Y,7622,6)>.42)c=e<5?'#eef6fc':'#a8cce4';
    if(hash2(X,Y,7623)<.01)c='#d8ecfa';return c},250);
  // the coolant behind its glass: pale cyan light, brighter swirls and bubbles (self-lit)
  patch('gcCore',(xx,y,X,Y)=>{const t=nz(X,Y,7631,10),s=Math.sin(y*.16+t*6+xx*.05);let c=t>.6?'#d8fbff':t>.4?'#7ae4f4':'#3ab8d8';if(s>.9)c='#ffffff';
    const bx=(xx+Math.floor(y/12)*7)%16,by=y%12;if(Math.hypot(bx-8,by-6)<2.2&&hash2(Math.floor(xx/16),Math.floor(y/12),7632)<.3)c='#f0ffff';return c},232);
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintGcAtlas()}}

// ---------- the model ----------
// gun frame as every rifle (origin at the grip, the barrel along -Z): a white composite receiver with a rail on top; the coolant tank on
// its left (tag mag: glowing glass between frosted end caps, its bands and valve) in two clamps; the four level pips over it (tags g1..g4);
// the gauge facing the eye (its needle: tag ndl) and the priming wheel on top (tag aux: the first draw turns it); a vertical fore-grip;
// the emitter: a collar, the frosted tube under eight blue fins, two coolant lines from the tank, the nozzle collar and its flared bell
// with the glowing ring inside and three frosted prongs; the pistol grip, a short padded stock
const GCM={mz:[0,.052,-.585],wheel:[0,.106,-.17],gauge:[-.02,.11,.0095],tank:[-.052,.05,-.09]};
function gcParts(){const P=[],B='gcBody',F='gcFrost',N='gcFin',C='gcCore',Y=.052,[tx,ty,tz]=GCM.tank;
  // the receiver, its rail, the pin-lines, the ejection-less vents on the right
  P.push(Pt(0,.05,-.07,.06,.08,.28,B,{r:.012}),Pt(0,.0935,-.07,.024,.008,.22,'blk2',{r:.002}),Pt(.0305,.072,-.07,.002,.006,.24,N),Pt(-.0305,.088,-.07,.002,.004,.24,N),
    ...[-.02,-.05,-.08,-.11].map(z=>Pt(.031,.045,z,.002,.026,.012,'blk')));
  // the tank in its clamps
  P.push(Pt(-.034,ty,-.03,.012,.024,.02,'blk2',{r:.003}),Pt(-.034,ty,-.15,.012,.024,.02,'blk2',{r:.003}));
  P.push(...TAG('mag',[Pt(tx,ty,tz,.064,.064,.17,C,{cyl:'z',r:.01}),Pt(tx,ty,tz+.087,.07,.07,.022,F,{cyl:'z',r:.006}),Pt(tx,ty,tz-.087,.07,.07,.022,F,{cyl:'z',r:.006}),
    Pt(tx,ty,tz+.03,.068,.068,.006,N,{cyl:'z'}),Pt(tx,ty,tz-.03,.068,.068,.006,N,{cyl:'z'}),Pt(tx,ty,tz-.104,.03,.03,.012,'steel',{cyl:'z',r:.003}),Pt(tx,ty+.036,tz+.06,.018,.008,.03,'blk2',{r:.002})]));
  for(let i=0;i<4;i++)P.push(...TAG('g'+(i+1),[Pt(-.0305,.08,-.018-i*.024,.002,.008,.016,C)]));
  // the gauge (facing the eye), its needle; the priming wheel on top (four spokes and a rim)
  const [gx,gy,gz]=GCM.gauge,[wx,wy,wz]=GCM.wheel;
  P.push(Pt(gx,.097,.0,.01,.016,.01,'steel'),Pt(gx,gy,.0,.036,.036,.016,'blk',{cyl:'z',r:.004}),Pt(gx,gy,.0085,.028,.028,.002,'white',{cyl:'z'}),
    Pt(gx+.008,gy-.008,.0092,.006,.003,.001,'red'),Pt(gx-.008,gy-.008,.0092,.006,.003,.001,N));
  P.push(...TAG('ndl',[Pt(gx,gy+.005,.0098,.0025,.012,.001,'blk')]));
  P.push(Pt(wx,.097,wz,.012,.014,.012,'steel',{cyl:'y'}));
  P.push(...TAG('aux',[Pt(wx,wy,wz,.042,.006,.006,'steel',{r:.002}),Pt(wx,wy,wz,.006,.006,.042,'steel',{r:.002}),Pt(wx,wy+.002,wz,.014,.008,.014,N,{cyl:'y',r:.003}),
    ...[0,1,2,3].map(k=>{const a=k*Math.PI/2+Math.PI/4;return Pt(wx+Math.cos(a)*.019,wy,wz+Math.sin(a)*.019,.012,.008,.012,N,{ry:-a,r:.003})})]));
  // the emitter: the collar, the tube, the fins, the coolant lines, the nozzle
  P.push(Pt(0,Y,-.235,.05,.05,.05,B,{cyl:'z',r:.006}),Pt(0,Y,-.39,.032,.032,.28,F,{cyl:'z',r:.004}));
  for(let i=0;i<8;i++)P.push(Pt(0,Y,-.272-i*.027,.074,.074,.007,N,{cyl:'z',r:.003}));
  const H=[[tx+.004,ty-.012,tz-.098],[-.048,.03,-.26],[-.044,.026,-.4],[-.03,.034,-.52]];
  for(let i=0;i<H.length-1;i++){P.push(rg4Seg(H[i],H[i+1],.011,'rub'),rg4Seg([H[i][0]+.012,H[i][1]-.006,H[i][2]],[H[i+1][0]+.012,H[i+1][1]-.006,H[i+1][2]],.008,'salHose'))}
  P.push(Pt(0,Y,-.535,.064,.064,.03,B,{cyl:'z',r:.006}),Pt(0,Y,-.558,.056,.056,.016,F,{cyl:'z'}),Pt(0,Y,-.571,.066,.066,.012,F,{cyl:'z',r:.004}),Pt(0,Y,-.58,.07,.07,.006,N,{cyl:'z'}),
    Pt(0,Y,-.5835,.046,.046,.002,C,{cyl:'z'}),Pt(0,Y,-.5845,.016,.016,.002,'muzzle',{cyl:'z'}));
  for(let k=0;k<3;k++){const a=Math.PI/2+k*TAU/3,px=Math.cos(a)*.03,py=Y+Math.sin(a)*.03;P.push(Pt(px,py,-.6,.008,.008,.042,F,{r:.003}),Pt(px,py,-.622,.008,.008,.006,C,{r:.003}))}
  // the fore-grip and its clamp, the pistol grip and guard, the stock, its pad and cheek rest
  P.push(Pt(0,.022,-.24,.03,.02,.04,'blk2',{r:.004}),Pt(0,-.022,-.24,.032,.075,.042,'rub',{r:.013}),
    ...pGrip('rub',-.062,.045,.26),...tGuard(.0),Pt(0,.04,.15,.05,.07,.14,B,{r:.012}),Pt(0,.035,.232,.052,.11,.026,'rub',{r:.01}),Pt(0,.082,.14,.04,.014,.1,'blk2',{r:.005}));
  return P}
GUNS.glacier={parts:gcParts(),grip:[0,-.03,.045],sup:[0,-.012,-.24],muzzle:GCM.mz.slice(),mag:GCM.tank.slice(),eject:[.03,.07,-.06],
  piv:{aux:GCM.wheel.slice(),ndl:GCM.gauge.slice()}};

// ---------- stats ----------
WPN.glacier={slot:1,kind:'special',crate:1,cat:'special',n:['글레이셔','Glacier'],cost:6500,mag:150,res:150,dmg:19,rpm:600,quiet:1,cryo:1,alt:'icewall',shDmg:GLC.SH.dmg,
  spread:[0,0,0],rec:[.003,.0035],kb:.7,stag:.18,hs:1,reload:3.4,draw:1,speed:.87,snd:'gcgust',model:'glacier',hold:'rifle',
  bd:['보급 전용 · 냉각 분사: 맞은 좀비가 점점 느려지다 얼어붙음 (1.8초) · 얼어붙은 좀비는 모든 공격에 60% 더 받고, 얼어붙은 채 죽으면 산산조각 나며 주변 좀비까지 얼림 · 우클릭: 얼음벽 (냉각제 25)',
    'Crates only · a cryo jet: zombies slow down, then freeze solid (1.8 s) · a frozen one takes 60% more from everything and shatters if it dies frozen, chilling those round it · RMB: ice wall (25 coolant)']};
VM_POS.glacier={p:[.16,-.185,-.4],r:[0,.08,.035]};
GUN_DESIGN.glacier={mag:150,ch:0,act:'gcprime',x:.8};WPN.glacier.fd=GUN_DESIGN.glacier;WPN.glacier.ch=0;
CRATE_GUNS.push('glacier');{const c=BUY_MENU.find(q=>q.k==='special');if(c&&!c.items.includes('glacier'))c.items.push('glacier')}
if(!SHOP_NOTSOLD.includes('glacier'))SHOP_NOTSOLD.push('glacier');
// the tank comes out sideways to the left (the side-magazine reload, vmrel.js); its sounds are the tank's own (VM.reload below)
{const rk=rlKind;rlKind=function(W,G){if(W.model==='glacier')return 'side';return rk(W,G)}}
{const rl=VM.reload;VM.reload=function(W,d,k,e){rl.apply(this,arguments);const A=this.act;if(this.id!=='glacier'||!A||!A.ev)return;
  for(const v of A.ev){if(v[1]==='magout')v[1]='gcout';else if(v[1]==='magin')v[1]='gcin'}}}
// the first draw: the left hand turns the priming wheel a quarter turn, the coolant vents with a hiss and the gauge's pips light in turn
FDS.gcprime=function(P,G,m,L){const E=fdExt(G,'aux'),gp=[E.c[0],E.mx[1],E.c[2]];const a=.22,b=.42,c=.58,on=[0,.022,.004],bk=[0,1,0];
  return {G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.02),K6(.18,-.03,.02,-.01,.1,.14,-.16),K6(c,-.03,.022,-.01,.1,.15,-.18),K6(c+.08,-.008,.004,0,.04,.06,-.06),K6(.88,.003,-.004,0,-.01,-.01,.01),K6(1)],
    H:{A:[{sup:1},{tag:'aux',at:gp}],k:[HK(0,0),HK(.05,0),HK(.14,1,[-.03,.04,.04],.7,bk,.3),HK(a,1,on,1,bk,.85),HK(b,1,on,1,[.7,.7,0],.9),HK(b+.06,1,[-.03,.05,.04],.9,bk,.2),HK(.78,0),HK(1,0)]},
    parts:[{tag:'aux',ch:'ry',k:[[0,0],[a,0],[b,-Math.PI/2],[1,-Math.PI/2]]}],
    E:[[a,'dry',.45,.8],[b-.04,'gcvent',.6,1],[c,'',0,0,[.03,.15,0],[.004,0,0],'gcprime']],
    vib:[[0,0],[b,0],[b+.03,.003],[.8,.001],[1,0]],
    C:[[0,0,0,0],[.18,.008,.006,-.01],[c+.03,.01,0,0],[.88,0,0,0],[1,0,0,0]]}};
{const fh=VM.fdHit;VM.fdHit=function(h){fh.call(this,h);if(h[5]==='gcprime'){this.gcPrimeA=this.act;this.gcPopT=.5}}}

// ---------- the cold ----------
const glcOk=t=>!!t&&t.alive&&t.team===TZ&&!(t.reviving>0)&&!t.mnB&&!t.epHide;
const glcBig=t=>!!(ZBIG[t.zc]||t.epBoss||t.bossT||(ZCLASS[t.zc]&&ZCLASS[t.zc].boss));
// k of cold on t (the shooter's page, never a ghost): it may freeze it (not a boss, not within the time after a thaw)
GLC.chill=function(t,k,src){if(!glcOk(t)||NET.ghost)return;if(glcBig(t))k*=GLC.BOSS;t.gcChill=Math.min(10,(t.gcChill||0)+k);t.gcHitT=G.t;t.gcVis=Math.max(t.gcVis||0,t.gcChill);t.gcVisT=G.t;
  if(t.gcChill>=10&&!(t.frozen>0)&&!(G.t<(t.gcImm||0))&&!glcBig(t)){const d=t.zc==='brute'&&t.skillT>0?1.2:GLC.FRZ;t.frozen=Math.max(t.frozen,d);t.gcFz=d;t.gcChill=6;
    t.c.vx=t.c.vz=0;t.mvx=t.mvz=t.kvx=t.kvz=0;if(t.isPlayer)HUD.flashFrost()}};
// the look of the cold only (every page, ghosts too): what tints a zombie and grows its crust when it freezes
GLC.see=function(t,k){if(!t||!t.alive||t.team!==TZ)return;t.gcVis=Math.min(10,(t.gcVis||0)+k);t.gcVisT=G.t};

// ---------- the jet (fireGun hands every tick of the Glacier here) ----------
const _gcD=new THREE.Vector3(),_gcA=new THREE.Vector3(),_gcB=new THREE.Vector3(),_gcS=new THREE.Vector3(),_gcO=new THREE.Vector3(),_gcP=new THREE.Vector3();
function gcFire(a,W){const am=a.ammo[a.cur],eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_gcD);const dir=_gcD.clone();
  NET.on&&netFxPush(['f',a.id,WI[a.cur],r3(a.yaw+a.punchY),r3(a.pitch+a.punchP),0]);
  am.mag--;a.shots++;a.gcT=G.t;a.lastFire=G.t;
  a.punchP+=W.rec[0]*rr(.2,1);a.punchY+=(Math.random()*2-1)*W.rec[1];a.recoilSpread=0;a.kick=.2;
  const n=gcHits(a,W,eye,dir);
  if(a.isPlayer){VM.fire(W,0);if(n)HUD.hitmark(false)}
  alertBots(a,eye.x,eye.z)}
// every zombie in the jet: the ray's closest approach to the body (feet to head) inside the cone's width there, a clear line from the eye,
// within reach; the cold and the damage fall off past FULL to MIN at the end of the reach
function gcHits(a,W,eye,dir){const R0=GLC.R;let n=0;
  for(const t of G.actors){if(!t.alive||t.team===a.team)continue;const c=t.c,top=t.head?t.head.y:c.y+c.h;
    const mx=c.x-eye.x,mz=c.z-eye.z,my=(c.y+top)/2-eye.y,s=mx*dir.x+my*dir.y+mz*dir.z;if(s<-.3||s-c.hw>R0)continue;
    const px=eye.x+dir.x*s,py=eye.y+dir.y*s,pz=eye.z+dir.z*s,hy=clamp(py,c.y+.15,top),lat=Math.hypot(px-c.x,pz-c.z,py-hy),sp=Math.max(0,s);
    if(lat>GLC.W0+sp*GLC.WK+c.hw)continue;if(Math.hypot(mx,hy-eye.y,mz)-c.hw>R0)continue;if(!losClear(eye.x,eye.y,eye.z,c.x,hy,c.z))continue;
    if(ICW.list.length&&ICW.ray(eye.x,eye.y,eye.z,mx/(Math.hypot(mx,hy-eye.y,mz)||1),(hy-eye.y)/(Math.hypot(mx,hy-eye.y,mz)||1),mz/(Math.hypot(mx,hy-eye.y,mz)||1),Math.hypot(mx,hy-eye.y,mz)))continue;// (the jet stops at its own ice)
    const f=sp<GLC.FULL?1:lerp(1,GLC.MIN,clamp((sp-GLC.FULL)/(R0-GLC.FULL),0,1)),hd=Math.hypot(mx,mz)||1;
    damageActor(t,W.dmg*f,a,{w:a.cur,dir:[mx/hd,0,mz/hd],kb:W.kb*f,stag:W.stag,x:c.x,y:hy,z:c.z});
    GLC.see(t,GLC.CH*f);if(!NET.ghost)GLC.chill(t,GLC.CH*f,a);n++;
    if(Math.random()<.5)FX.spawn({x:c.x-mx/hd*c.hw,y:hy+rr(-.3,.3),z:c.z-mz/hd*c.hw,vx:rr(-.3,.3),vy:rr(-.2,.4),vz:rr(-.3,.3),life:rr(.35,.6),s0:rr(.25,.4),s1:rr(.6,.9),r:.86,g:.94,b:1,a:.45,f:5,drag:1.5,grav:.6})}
  return n}

// ---------- the jet's look (every frame, for everyone holding one) ----------
// one puff of mist: flies out with drag, cut short where its line meets a wall — there the cold spreads on the wall (a rime mark now
// and then, a breath of fog sliding along it)
function gcDrop(a,ox,oy,oz,dir,ang,v,drag,life,o){spreadDir(dir,ang,_gcB);const dx=_gcB.x,dy=_gcB.y,dz=_gcB.z,reach=v/drag*(1-Math.exp(-drag*life));
  const h=rayCast(ox,oy,oz,dx,dy,dz,reach+.1,SHOT_FILTER);let L=life,hit=null;
  if(h){const k=Math.min(.999,h.t*drag/v);L=Math.max(.02,-Math.log(1-k)/drag);hit={t:h.t,nx:h.nx,ny:h.ny,nz:h.nz}}
  FX.spawn(Object.assign({x:ox,y:oy,z:oz,vx:dx*v,vy:dy*v,vz:dz*v,life:L,drag},o));
  if(hit&&o.add&&Math.random()<.4){const x=ox+dx*hit.t+hit.nx*.06,y=oy+dy*hit.t+hit.ny*.06,z=oz+dz*hit.t+hit.nz*.06,dn=dx*hit.nx+dy*hit.ny+dz*hit.nz,s=rr(1.2,2.8);
    const tx=dx-hit.nx*dn,ty=dy-hit.ny*dn,tz=dz-hit.nz*dn;
    FX.spawn({x,y,z,vx:tx*s+rr(-.6,.6)+hit.nx*.4,vy:ty*s+rr(-.5,.2)+hit.ny*.4,vz:tz*s+rr(-.6,.6)+hit.nz*.4,life:rr(.5,.9),s0:rr(.3,.5),s1:rr(1,1.5),r:.88,g:.95,b:1,a:.35,f:5,drag:2.2,grav:.8,fadeIn:Math.min(.3,L*.9)});
    if(!AU.throttle('gcdc'+a.id,260))FX.decal(x-hit.nx*.06,y-hit.ny*.06,z-hit.nz*.06,hit.nx,hit.ny,hit.nz,rr(.3,.55),9,[.82,.92,1],.6)}}
// k = density (the player's own jet is the thickest)
function gcEmit(a,ox,oy,oz,dir,dt,k,fp){const A=a.gcAcc||(a.gcAcc={}),ka=fp?.55:1;const add=(key,rate)=>{A[key]=(A[key]||0)+rate*dt*k;const n=Math.floor(A[key]);A[key]-=n;return n};
  const cvx=a.c.vx*.4,cvz=a.c.vz*.4;
  // the core: dense and pale, tight at the nozzle and swelling as it slows
  for(let i=add('core',170);i>0;i--)gcDrop(a,ox,oy,oz,dir,.04,rr(15,19),2.1,rr(.42,.55),{s0:rr(.07,.12),s1:rr(.5,.75),r:.46,g:.74,b:1,a:.22*ka,f:5,grav:.5,add:1});
  // the fog rolling off it (plain blending, so it reads against a bright sky; it sinks — it is colder than the air)
  for(let i=add('fog',46);i>0;i--)gcDrop(a,ox,oy,oz,dir,.09,rr(9,14),2.2,rr(.7,1),{s0:.18,s1:rr(1.2,1.9),r:.88,g:.94,b:1,a:.3,f:Math.random()<.5?2:3,grav:1.1,fadeIn:.04,lit:1});
  // glittering frost and tiny stars of ice
  for(let i=add('glit',36);i>0;i--){spreadDir(dir,.1,_gcS);const s=rr(9,16);FX.spark(ox,oy,oz,_gcS.x*s+cvx,_gcS.y*s,_gcS.z*s+cvz,rr(.25,.55),[.8,.95,1])}
  for(let i=add('star',16);i>0;i--)gcDrop(a,ox,oy,oz,dir,.08,rr(8,14),2,rr(.3,.5),{s0:rr(.05,.09),s1:.02,r:.9,g:.97,b:1,a:.9,f:Math.random()<.5?8:9,add:1});
  // the rope: the first metres drawn afresh every frame (the mist leaves the nozzle too fast to fill them), short of a wall
  {const L=Math.min(a.gcW||4,3.5),d0=fp?.45:.1;for(let i=add('rope',360);i>0;i--){const d=d0+Math.random()*Math.max(.1,L-d0),w=.02+d*.045;
    FX.spawn({x:ox+dir.x*d+rr(-w,w),y:oy+dir.y*d+rr(-w,w)-d*d*.006,z:oz+dir.z*d+rr(-w,w),vx:dir.x*5+cvx,vy:dir.y*5,vz:dir.z*5+cvz,life:rr(.04,.075),s0:.06+d*.12,s1:.09+d*.17,r:.66,g:.86,b:1,a:.26*ka,f:Math.random()<.6?5:1,add:1})}}
  if(!fp&&Math.random()<dt*24)FX.spawn({x:ox+dir.x*.2,y:oy+dir.y*.2,z:oz+dir.z*.2,vx:dir.x*4,vy:dir.y*4,vz:dir.z*4,life:.06,s0:.08,s1:.18,r:.6,g:.85,b:1,a:.35,f:1,add:1})}
// where the local player's jet starts: the view model's nozzle on screen, a metre out along that line (as the Firewyrm's)
function gcOrigin(a,out){const m=VM.cur,c=R.cam.position;if(!m||VM.id!=='glacier'||!VM.vis||!R.vmCam||Math.hypot(c.x-a.c.x,c.z-a.c.z)>.6)return out.copy(muzzleWorld(a));
  m.gun.updateMatrixWorld(true);_gcA.set(GCM.mz[0],GCM.mz[1],GCM.mz[2]-.05).applyMatrix4(m.gun.matrixWorld).project(R.vmCam);
  if(!(Math.abs(_gcA.x)<1.2&&Math.abs(_gcA.y)<1.2))return out.copy(muzzleWorld(a));
  _gcA.z=.5;_gcA.unproject(R.cam);_gcA.sub(c).normalize();return out.copy(c).addScaledVector(_gcA,1.05)}
function gcStream(dt){if(!R.cam)return;const cam=R.cam.position;
  for(const a of G.actors){const held=a.alive&&a.team===TH&&a.cur==='glacier',on=held&&G.t-(a.gcT==null?-9:a.gcT)<(a.isPlayer||a.bot?.16:.24);
    if(on!==!!a.gcOn){a.gcOn=on;const e=a.isPlayer?null:actorEye(a);
      if(on){if(a.isPlayer)AU.play('gcon',{vol:.7});else AU.at('gcon',e.x,e.y,e.z,{vol:.75,range:40})}
      else if(held||a.alive){if(a.isPlayer)AU.play('gcoff',{vol:.6});else AU.at('gcoff',e.x,e.y,e.z,{vol:.6,range:28})}}
    if(!held){if(a.gcL){a.gcL.dead=true;a.gcL=null}continue}
    const fp=a.isPlayer&&!G.spec;if(!fp&&(!a.ch||!a.ch.grp.visible||Math.hypot(a.c.x-cam.x,a.c.z-cam.z)>60)){if(a.gcL){a.gcL.dead=true;a.gcL=null}continue}
    if(on){const o=fp?gcOrigin(a,_gcO):_gcO.copy(muzzleWorld(a));aimDir(a.yaw+(a.punchY||0),a.pitch+(a.punchP||0),_gcP);
      const h=rayCast(o.x,o.y,o.z,_gcP.x,_gcP.y,_gcP.z,9,SHOT_FILTER),hw=h?h.t:9,ld=Math.min(2,Math.max(.3,hw-.3));a.gcW=Math.max(.1,hw-.05);
      if(!a.gcL)a.gcL=DL.add(o.x,o.y,o.z,'#8adcff',8,1.6,0,{flick:.2});a.gcL.x=o.x+_gcP.x*ld;a.gcL.y=o.y+_gcP.y*ld;a.gcL.z=o.z+_gcP.z*ld;gcEmit(a,o.x,o.y,o.z,_gcP,dt,fp?1:.55,fp);
      if(!a.isPlayer&&!AU.throttle('gcg'+a.id,430))AU.at('gcgust',o.x,o.y,o.z,{vol:.8,range:42})}
    else{if(a.gcL){a.gcL.dead=true;a.gcL=null}
      // the cold breath curling down off the nozzle (the player's own is drawn on the view model)
      if(!fp&&a.gun&&Math.random()<dt*7){const p=GCM.mz;a.gun.updateMatrixWorld();_gcO.set(p[0],p[1],p[2]-.01).applyMatrix4(a.gun.matrixWorld);
        FX.spawn({x:_gcO.x,y:_gcO.y,z:_gcO.z,vx:rr(-.05,.05),vy:rr(-.25,-.08),vz:rr(-.05,.05),life:rr(.8,1.3),s0:.05,s1:rr(.2,.3),r:.9,g:.96,b:1,a:.3,f:5,drag:1.2,grav:.15})}}}}

// ---------- first person: the jet out of the nozzle, the cold breath, the pips, the gauge, the shudder ----------
function gcMistTex(){if(GLC.mist)return GLC.mist;const N=64;const [cv,x]=mkCanvas(N,N);const id=x.createImageData(N,N),D=id.data;
  for(let y=0;y<N;y++)for(let i=0;i<N;i++){const u=(i-31.5)/31.5,v=(y-31.5)/31.5,r=Math.hypot(u,v),n=vnoise(i/7,y/7,7641,0)-.5,k=clamp(1-r+n*.5,0,1),q=(y*N+i)*4;
    D[q]=255;D[q+1]=255;D[q+2]=255;D[q+3]=Math.round(255*Math.pow(k,1.6))}
  x.putImageData(id,0,0);const t=new THREE.CanvasTexture(cv);t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return GLC.mist=t}
function gcSpr(col,op,add){const m=new THREE.SpriteMaterial({map:gcMistTex(),color:new THREE.Color(col),transparent:true,opacity:op,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,depthWrite:false,fog:false});
  const s=new THREE.Sprite(m);s.renderOrder=11;s.frustumCulled=false;return s}
function gcJet(m){const g=new THREE.Group(),J={g,jet:[],fog:[],br:[],mz:GCM.mz};
  for(let i=0;i<9;i++){const s=gcSpr(i<2?'#cdeeff':i<5?'#8fd6ff':'#68bff0',i<2?.3:i<5?.24:.18,true);J.jet.push(s);g.add(s)}
  for(let i=0;i<4;i++){const s=gcSpr('#e4f2fa',.2,false);J.fog.push(s);g.add(s)}
  for(let i=0;i<3;i++){const s=gcSpr('#eef8ff',.22,false);s.userData.t=i/3;J.br.push(s);g.add(s)}
  J.glow=gcSpr('#7ad8ff',.5,true);g.add(J.glow);m.gun.add(g);return J}
VMX.glacier=function(V,a,dt,o,m){const T=m.tags,am=a.ammo&&a.ammo.glacier;const J=m.gcJ||(m.gcJ=gcJet(m));const on=!!(a.gcOn&&a.alive),fd=V.act&&V.act.tag==='draw',lit=!fd||V.gcPrimeA===V.act;
  V.gcPopT=Math.max(0,(V.gcPopT||0)-dt);const pop=V.gcPopT/.5;
  // the pips: the coolant left in quarters (lighting in turn on the first draw); the needle over the dial
  const n=am&&lit?Math.ceil(am.mag/WPN.glacier.mag*4-1e-6):0;for(let i=1;i<=4;i++){const g=T&&T['g'+i];if(g)g.visible=i<=n&&!(pop>0&&(1-pop)*4<i-1)}
  if(T&&T.ndl&&am)T.ndl.rotation.z+=lerp(1.25,-1.25,clamp(am.mag/WPN.glacier.mag,0,1))+(on?Math.sin(G.t*40)*.04:0);
  for(const s of J.jet)s.visible=on;for(const s of J.fog)s.visible=on;J.glow.visible=on||pop>0;
  const mz=J.mz;
  if(on){for(let i=0;i<J.jet.length;i++){const s=J.jet[i],u=i/(J.jet.length-1),f=rr(.8,1.2);
      s.position.set(mz[0]+rr(-1,1)*.008*u,mz[1]+rr(-1,1)*.008*u-u*u*.02,mz[2]-.04-u*.66);s.scale.set((.025+u*.26)*f,(.025+u*.26)*f*rr(.85,1.1),1);s.material.rotation=rr(-Math.PI,Math.PI)}
    for(let i=0;i<J.fog.length;i++){const s=J.fog[i],u=(i+1)/J.fog.length,f=rr(.85,1.15);s.position.set(mz[0]+rr(-.02,.02),mz[1]-.02-u*.05,mz[2]-.1-u*.5);s.scale.set((.12+u*.36)*f,(.1+u*.3)*f,1);s.material.rotation=rr(-.4,.4)}
    J.glow.position.set(mz[0],mz[1],mz[2]-.05);J.glow.scale.setScalar(rr(.11,.15));J.glow.material.opacity=.35;
    const fl=rr(.85,1.1);V.U.uMuzzle.value.setRGB(.16*fl,.34*fl,.5*fl);
    // the gun trembling on its jet
    const j=.0011;o[0]+=rr(-j,j);o[1]+=rr(-j,j);o[2]+=.004;o[3]+=rr(-j,j)*2+.002;o[5]+=rr(-j,j)*1.5}
  else if(pop>0){J.glow.position.set(mz[0],mz[1],mz[2]-.02);J.glow.scale.setScalar(.22*pop+.04);J.glow.material.opacity=.55*pop;V.U.uMuzzle.value.setRGB(.5*pop,1*pop,1.5*pop)}
  else if(lit){const mu=V.U.uMuzzle.value,fl=rr(.9,1.1);mu.r=Math.max(mu.r,.12*fl);mu.g=Math.max(mu.g,.28*fl);mu.b=Math.max(mu.b,.36*fl)}
  // the cold breath: wisps curling down off the bell while it is not firing
  for(const s of J.br){s.visible=lit&&!on;if(!s.visible)continue;s.userData.t=(s.userData.t+dt*.55)%1;const u=s.userData.t;
    s.position.set(mz[0]+Math.sin(u*5+s.id)*.01,mz[1]-.01-u*.09,mz[2]-.02-u*.03);s.scale.set(.02+u*.07,.02+u*.08,1);s.material.opacity=.24*Math.sin(u*Math.PI)}};

// ---------- ice: its texture and material (the crusts and the walls) ----------
// r = how white the ice is (veins of rime, a frosted skin), g = where the cracks run (their threshold rises as it weakens), b = glints
function gcIceTex(){if(GLC.tex)return GLC.tex;const N=128;const cv=paint(N,N,P=>{
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const n=P.n(x,y,32,7651,4),v=P.n(x,y,12,7652,3),[f1,f2]=cellN(P,x,y,16,7653);
    const vein=Math.abs(v-.5)<.035?.5:0,rime=clamp((n-.45)*1.6,0,1)*.6+vein;
    const ck=clamp(1-(f2-f1)*3.2,0,1)*(.4+.6*hash2(Math.floor(x/16),Math.floor(y/16),7654));
    const gl=hash2(x,y,7655)<.012?1:0;const i=(y*N+x)*4;P.D[i]=Math.round(clamp(rime,0,1)*255);P.D[i+1]=Math.round(ck*255);P.D[i+2]=gl*255;P.D[i+3]=255}});
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;return GLC.tex=t}
const VS_ICE=`varying vec3 vP;varying vec3 vN;varying vec2 vUv;varying float vY;
void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);vUv=uv;vY=position.y;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS_ICE=GLSL_DYN+`uniform sampler2D map;uniform vec3 uProbe;uniform float uA;uniform float uCrack;uniform float uFlash;uniform float uH;varying vec3 vP;varying vec3 vN;varying vec2 vUv;varying float vY;
void main(){vec3 n=normalize(vN);vec3 v=normalize(cameraPosition-vP);float fr=1.-abs(dot(n,v));fr*=fr;vec4 t=texture2D(map,vUv);
  float form=.72+.28*clamp(n.y*.5+.5,0.,1.);vec3 lig=uProbe*form*uAmb*1.2+dynLight(vP,n)*.7+vec3(.06,.09,.12);
  vec3 c=mix(vec3(.4,.64,.84),vec3(.86,.95,1.),t.r)*lig;
  c+=fr*vec3(.5,.78,1.)*(.3+.45*uAmb)+vec3(.7,.9,1.)*t.b*.4;
  float ck=step(1.-uCrack,t.g);c=mix(c,vec3(.92,.97,1.)*max(lig,vec3(.5)),ck*.75);
  float fz=1.-smoothstep(0.,.55,vY/uH);c=mix(c,vec3(.9,.95,1.)*lig*1.15,fz*.5);
  c=mix(c,vec3(1.),uFlash);c=applyFog(c,vP);
  float a=clamp(.3+.4*fr+.28*t.r+ck*.35+fz*.3,0.,.95)*uA;gl_FragColor=vec4(c,a);}`;
function matIce(h){return new THREE.ShaderMaterial({uniforms:Object.assign({map:{value:gcIceTex()},uProbe:{value:new THREE.Color(.6,.62,.66)},uA:{value:1},uCrack:{value:0},uFlash:{value:0},uH:{value:h||2.5}},LU),
  vertexShader:VS_ICE,fragmentShader:FS_ICE,transparent:true,depthWrite:false,side:THREE.DoubleSide})}
// a crystal column: a w × d foot turned ry, up h with its top leaning by lx / lz and a little narrower, capped by a point tip high;
// flat faces (their normals turned out from the column's middle), UVs in metres / 1.4
function gcPrism(pos,nrm,uv,cx,y0,cz,w,d,h,ry,lx,lz,tip,uo){const c=Math.cos(ry),s=Math.sin(ry),hw=w/2,hd=d/2,k=.84,S=1/1.4,mid=[cx+lx*.5,y0+h*.5,cz+lz*.5];
  const at=(x,z,y,sx,sz)=>[cx+sx+x*c+z*s,y,cz+sz-x*s+z*c];
  const Bt=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([x,z])=>at(x,z,y0,0,0)),Tp=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([x,z])=>at(x*k,z*k,y0+h,lx,lz)),A=[cx+lx*1.15,y0+h+tip,cz+lz*1.15];
  const tri=(p,q,r,a,b,e)=>{const ux=q[0]-p[0],uy=q[1]-p[1],uz=q[2]-p[2],vx=r[0]-p[0],vy=r[1]-p[1],vz=r[2]-p[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;
    const fx=(p[0]+q[0]+r[0])/3-mid[0],fy=(p[1]+q[1]+r[1])/3-mid[1],fz=(p[2]+q[2]+r[2])/3-mid[2];if(nx*fx+ny*fy+nz*fz<0){nx=-nx;ny=-ny;nz=-nz}
    for(const [P,U] of [[p,a],[q,b],[r,e]]){pos.push(P[0],P[1],P[2]);nrm.push(nx,ny,nz);uv.push(U[0],U[1])}};
  let u0=uo;for(let i=0;i<4;i++){const j=(i+1)%4,b0=Bt[i],b1=Bt[j],t0=Tp[i],t1=Tp[j],ew=Math.hypot(b1[0]-b0[0],b1[2]-b0[2])*S,v0=y0*S,v1=(y0+h)*S;
    tri(b0,b1,t1,[u0,v0],[u0+ew,v0],[u0+ew,v1]);tri(b0,t1,t0,[u0,v0],[u0+ew,v1],[u0,v1]);tri(t0,t1,A,[u0,v1],[u0+ew,v1],[u0+ew*.5,(y0+h+tip)*S]);u0+=ew}}
function gcGeo(pos,nrm,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeBoundingSphere();return g}
// a seeded stream of numbers (the same wall on every page from its id)
const gcRnd=seed=>{let s=(Math.abs(seed|0)%2147483646)+1;return ()=>{s=s*16807%2147483647;return (s-1)/2147483646}};

// ---------- the crust round a zombie frozen by the Glacier ----------
// eight shards in a ring round the body to the chest, leaning out, two over the shoulders (for a zombie of the standard size: scaled)
function gcCrustGeo(){if(GLC.crGeo)return GLC.crGeo;const pos=[],nrm=[],uv=[],R=gcRnd(7661);
  for(let i=0;i<9;i++){const a=i/9*TAU+R()*.3,r=.27+R()*.06,cx=Math.cos(a)*r,cz=Math.sin(a)*r;gcPrism(pos,nrm,uv,cx,-.02,cz,.2+R()*.12,.13+R()*.08,.75+R()*.7,a+R(),Math.cos(a)*.05,Math.sin(a)*.05,.1+R()*.14,R()*3)}
  for(const sd of [-1,1])gcPrism(pos,nrm,uv,sd*.18,1.05,(R()-.5)*.08,.2,.18,.32+R()*.18,R(),sd*.06,0,.1,R()*3);
  return GLC.crGeo=gcGeo(pos,nrm,uv)}
GLC.crust=function(t){const pool=GLC.pool;let m=pool.pop();if(!m){m=new THREE.Mesh(gcCrustGeo(),matIce(1.8));m.frustumCulled=false;m.renderOrder=6}
  R.scene.add(m);t.gcCr={m,t:0};GLC.crustPose(t,0)};
GLC.crustPose=function(t,dt){const C=t.gcCr;if(!C)return;C.t+=dt;const k=Math.min(1,C.t/.16),c=t.c,s=(c.hw||.3)/.3,h=(c.h||1.8)/1.8;
  C.m.position.set(c.x,c.y,c.z);C.m.rotation.y=t.yaw||0;C.m.scale.set(s*(.6+.4*k),h*k*(1+.06*Math.sin(Math.min(1,C.t/.3)*Math.PI)),s*(.6+.4*k));
  const U=C.m.material.uniforms;sampleProbe(c.x,c.y+1,c.z,U.uProbe.value);U.uA.value=1;U.uCrack.value=clamp((t.frozen<.5?(.5-t.frozen)*1.6:0),0,.8);U.uFlash.value=Math.max(0,.6-C.t*4)};
GLC.crustOff=function(t,burst){const C=t.gcCr;if(!C)return;t.gcCr=null;R.scene.remove(C.m);GLC.pool.push(C.m);
  if(burst){const c=t.c;for(let i=0;i<16;i++){const a=Math.random()*TAU,r=rr(.15,.35);FX.spawn({x:c.x+Math.cos(a)*r,y:c.y+rr(.1,1.3),z:c.z+Math.sin(a)*r,vx:Math.cos(a)*rr(.6,2),vy:rr(.5,2.2),vz:Math.sin(a)*rr(.6,2),
      life:rr(.5,.9),s0:rr(.05,.11),s1:.04,r:.8,g:.92,b:1,a:.9,f:Math.random()<.6?10:7,grav:12,col:.25})}
    for(let i=0;i<6;i++)FX.spawn({x:c.x+rr(-.3,.3),y:c.y+rr(.2,1.4),z:c.z+rr(-.3,.3),vx:rr(-.3,.3),vy:rr(-.1,.3),vz:rr(-.3,.3),life:rr(.6,1),s0:.25,s1:.7,r:.9,g:.96,b:1,a:.35,f:5,drag:1.6});
    AU.at('gcthaw',c.x,c.y+1,c.z,{vol:.7,range:30})}};

// ---------- the shatter: a frozen zombie dies in a burst of ice (the host decides; every page sees it) ----------
GLC.shatterFx=function(t){if(!t||t.gcShat)return;const c=t.c,x=c.x,y=c.y,z=c.z,hh=c.h||1.8;t.gcShat=true;GLC.crustOff(t,false);
  for(let i=0;i<56;i++){const a=Math.random()*TAU,u=Math.random(),sp=rr(1.5,6.5);FX.spawn({x:x+Math.cos(a)*.2,y:y+u*hh,z:z+Math.sin(a)*.2,vx:Math.cos(a)*sp,vy:rr(1,6),vz:Math.sin(a)*sp,
    life:rr(.8,1.5),s0:rr(.12,.3),s1:.08,r:.8,g:.92,b:1,a:1,f:Math.random()<.6?10:7,grav:13,col:.3})}
  for(let i=0;i<10;i++){const a=Math.random()*TAU;FX.spawn({x,y:y+rr(.3,hh),z,vx:Math.cos(a)*rr(3,7),vy:rr(2,5),vz:Math.sin(a)*rr(3,7),life:rr(.25,.45),s0:rr(.2,.35),s1:.1,r:.85,g:.96,b:1,a:.9,f:10,grav:10,add:1})}
  FX.spawn({x,y:y+hh*.55,z,life:.12,s0:.8,s1:1.8,r:.9,g:.97,b:1,a:.85,f:1,add:1});
  for(let i=0;i<14;i++)FX.spawn({x:x+rr(-.4,.4),y:y+rr(.2,hh),z:z+rr(-.4,.4),vx:rr(-1.4,1.4),vy:rr(.2,1.4),vz:rr(-1.4,1.4),life:rr(.9,1.6),s0:.3,s1:rr(1.2,1.8),r:.9,g:.96,b:1,a:.42,f:Math.random()<.5?5:2,drag:1.8,grav:.4});
  for(let i=0;i<18;i++)FX.spark(x,y+rr(.3,hh),z,rr(-5,5),rr(0,5),rr(-5,5),rr(.25,.6),[.85,.96,1]);
  FX.spawn({x,y:y+hh*.55,z,life:.25,s0:.6,s1:2.6,r:.6,g:.86,b:1,a:.55,f:14,add:1});DL.add(x,y+1,z,'#9ae4ff',7,3,.28);
  {const h=rayCast(x,y+.3,z,0,-1,0,3);if(h)FX.decal(x,y+.3-h.t,z,0,1,0,1.6,9,[.82,.92,1],.8)}
  AU.at('gcshatter',x,y+1,z,{vol:1,range:60});const P=G.player;if(P&&dist3(P.c,c)<7)FX.shake=Math.max(FX.shake,.22)};
GLC.shatter=function(t,src){GLC.shatterFx(t);if(NET.host)netEv('gcs',{i:t.id});
  const x=t.c.x,y=t.c.y+1,z=t.c.z,S=GLC.SH;
  for(const u of G.actors){if(u===t||!glcOk(u))continue;const dx=u.c.x-x,dy=u.c.y+1-y,dz=u.c.z-z,d=Math.hypot(dx,dy,dz);if(d>S.R||!losClear(x,y,z,u.c.x,u.c.y+1,u.c.z))continue;
    const f=1-d/S.R*.5,h=Math.hypot(dx,dz)||1;damageActor(u,S.dmg*f,src&&G.actors.includes(src)?src:null,{w:'glacier',gcSh:1,dir:[dx/h,.1,dz/h],kb:3*f,stag:.5,x:u.c.x,y:u.c.y+1,z:u.c.z});GLC.chill(u,S.ch*f,src);GLC.see(u,S.ch*f)}};

// ---------- every frame, every page: the cold wearing off, freezes and thaws, the crusts, a frosty breath off a chilled body ----------
GLC.update=function(dt){
  for(const a of G.actors){
    if(!a.alive||a.team!==TZ){a.gcChill=a.gcVis=a.gcFz=0;if(a.gcCr)GLC.crustOff(a,false);a.gcWas=false;continue}
    if(a.gcChill>0&&G.t-(a.gcHitT||-9)>GLC.HOLD)a.gcChill=Math.max(0,a.gcChill-GLC.DECAY*dt);
    if(a.gcVis>0&&G.t-(a.gcVisT||-9)>GLC.HOLD)a.gcVis=Math.max(0,a.gcVis-GLC.DECAY*dt);
    if(a.gcFz>0)a.gcFz=a.frozen>0?Math.max(0,a.gcFz-dt):0;
    const fz=a.frozen>0;
    if(fz&&!a.gcWas&&(a.gcVis>=6||a.gcFz>0)&&!glcBig(a)){GLC.crust(a);const c=a.c;
      for(let i=0;i<12;i++)FX.spawn({x:c.x+rr(-.35,.35),y:c.y+rr(.1,1.5),z:c.z+rr(-.35,.35),vx:rr(-.6,.6),vy:rr(0,.8),vz:rr(-.6,.6),life:rr(.4,.8),s0:.2,s1:.6,r:.9,g:.96,b:1,a:.45,f:5,drag:2});
      for(let i=0;i<8;i++)FX.spark(c.x,c.y+rr(.3,1.4),c.z,rr(-2,2),rr(0,2),rr(-2,2),rr(.2,.4),[.85,.96,1]);AU.at('gcfreeze',c.x,c.y+1,c.z,{vol:.8,range:36})}
    if(!fz&&a.gcWas){a.gcImm=G.t+GLC.IMM;if(a.gcCr)GLC.crustOff(a,true)}
    a.gcWas=fz;if(a.gcCr)GLC.crustPose(a,dt);
    const v=Math.max(a.gcVis||0,a.gcChill||0);if(v>.5&&!fz&&a.ch&&a.ch.grp.visible&&Math.random()<dt*v*1.4){const c=a.c;
      FX.spawn({x:c.x+rr(-.25,.25),y:c.y+rr(.3,c.h||1.7),z:c.z+rr(-.25,.25),vx:rr(-.1,.1),vy:rr(-.15,.05),vz:rr(-.1,.1),life:rr(.5,.9),s0:.08,s1:.28,r:.88,g:.95,b:1,a:.32,f:5,drag:1,grav:.2})}}};

// ---------- the ice wall (right click) ----------
// where it would go: across the aim (squared to the nearest axis), short of the first zombie on the line or of where the aim meets the
// world; on a floor near the shooter's level with room to stand; never on a human (a zombie in its way is pushed out to the far side)
ICW.box=(x,y,z,q)=>{const a=ICW.W/2,b=ICW.D/2;return q===1?{x0:x-b,x1:x+b,z0:z-a,z1:z+a,y0:y,y1:y+ICW.H}:{x0:x-a,x1:x+a,z0:z-b,z1:z+b,y0:y,y1:y+ICW.H}};
ICW.spot=function(a,want){const e=actorEye(a);aimDir(a.yaw,a.pitch,_gcD);const hl=Math.hypot(_gcD.x,_gcD.z);if(hl<.25)return null;const fx=_gcD.x/hl,fz=_gcD.z/hl,q=Math.abs(fx)>Math.abs(fz)?1:0;
  let dmax=ICW.MAXD;if(want!=null)dmax=want;else{const h=rayCast(e.x,e.y,e.z,_gcD.x,_gcD.y,_gcD.z,ICW.MAXD/hl+1,SHOT_FILTER),tW=h?h.t:ICW.MAXD/hl+1;if(h)dmax=h.t*hl-.4;
    const ha=rayActors(a,e.x,e.y,e.z,_gcD.x,_gcD.y,_gcD.z,tW);if(ha&&ha.a.team===TZ)dmax=Math.min(dmax,ha.t*hl-1.1)}
  dmax=clamp(dmax,ICW.MIND,ICW.MAXD);
  for(let d=dmax;d>=ICW.MIND-.01;d-=.5){const x=a.c.x+fx*d,z=a.c.z+fz*d,fl=floorBelow(x,a.c.y+1.4,z,.25);if(!(fl>a.c.y-2.2&&fl<a.c.y+1.4))continue;
    if(overlapAny(x-.2,fl+.1,z-.2,x+.2,fl+1.8,z+.2))continue;
    const ax=q===1?0:1,az=q===1?1:0,ends=[-1,1].map(s=>floorBelow(x+ax*s*(ICW.W/2-.35),fl+1,z+az*s*(ICW.W/2-.35),.15));if(!ends.some(f=>Math.abs(f-fl)<.8))continue;
    const B=ICW.box(x,fl,z,q);let bad=false;for(const t of G.actors){if(!t.alive||t.team===TZ)continue;const c=t.c;if(c.x+c.hw>B.x0-.05&&c.x-c.hw<B.x1+.05&&c.z+c.hw>B.z0-.05&&c.z-c.hw<B.z1+.05&&c.y<B.y1&&c.y+c.h>B.y0){bad=true;break}}
    if(!bad)return {x,y:fl,z,q}}
  return null};
// the wall's look: crystal columns side by side across it, shards leaning out at the foot on both faces, rime round the foot
function icwGeo(seed){const pos=[],nrm=[],uv=[],R=gcRnd(seed),W=ICW.W,D=ICW.D,H=ICW.H;let x=-W/2;
  while(x<W/2-.05){const w=Math.min(W/2-x,.4+R()*.26),cx=x+w/2;gcPrism(pos,nrm,uv,cx,-.02,(R()-.5)*.08,w*1.1,D*(.88+R()*.22),H*(.8+R()*.18),(R()-.5)*.25,(R()-.5)*.1,(R()-.5)*.08,.16+R()*.32,R()*3);x+=w*.9}
  for(const sd of [-1,1])for(let i=0;i<4;i++)gcPrism(pos,nrm,uv,(R()-.5)*W*.9,-.02,sd*(D*.5+.05),.2+R()*.16,.18+R()*.12,.35+R()*.55,R()*3,(R()-.5)*.1,sd*(.12+R()*.12),.12+R()*.18,R()*3);
  gcPrism(pos,nrm,uv,0,-.02,0,W*1.04,D*1.55,.16,0,0,0,.03,0);
  return gcGeo(pos,nrm,uv)}
ICW.byId=id=>ICW.list.find(C=>C.id===id)||null;
ICW.add=function(owner,x,y,z,q,id){if(id!=null&&ICW.byId(id))return ICW.byId(id);
  if(owner)for(const C of ICW.list.slice())if(C.owner===owner)ICW.remove(C,'melt');
  const B=ICW.box(x,y,z,q),mesh=new THREE.Mesh(icwGeo(id||++ICW.seq),matIce(ICW.H));mesh.position.set(x,y,z);mesh.rotation.y=q===1?Math.PI/2:0;mesh.renderOrder=6;mesh.scale.y=.05;R.scene.add(mesh);
  sampleProbe(x,y+1.2,z,mesh.material.uniforms.uProbe.value);
  const C={id:id||(owner?owner.id*1000+(++ICW.seq%1000):++ICW.seq),owner,x,y,z,q,life:ICW.LIFE,t:0,hp:ICW.HP,mesh,flash:0,creak:false};
  C.box=Object.assign(B,{o:{pass:1},mat:'icewall',icw:C});worldAddDyn(C.box);ICW.list.push(C);
  // anyone caught where it rises is pushed out of it: a zombie to the side away from the wall's owner, a human toward it
  for(const t of G.actors){if(!t.alive)continue;const c=t.c;if(!(c.x+c.hw>B.x0&&c.x-c.hw<B.x1&&c.z+c.hw>B.z0&&c.z-c.hw<B.z1&&c.y<B.y1&&c.y+c.h>B.y0))continue;
    const ox=owner?owner.c.x:x,oz=owner?owner.c.z:z,far=t.team===TZ;
    for(const sd of [1,-1]){let nx=c.x,nz=c.z;if(q===1){const s=(Math.sign(x-ox)||1)*(far?1:-1)*sd;nx=s>0?B.x1+c.hw+.05:B.x0-c.hw-.05}else{const s=(Math.sign(z-oz)||1)*(far?1:-1)*sd;nz=s>0?B.z1+c.hw+.05:B.z0-c.hw-.05}
      if(charFits(c,nx,c.y,nz)){c.x=nx;c.z=nz;if(t.team===TZ){const k=q===1?Math.sign(nx-x):Math.sign(nz-z);if(q===1)t.kvx+=k*4;else t.kvz+=k*4;t.staggerT=Math.max(t.staggerT||0,.4)}break}}}
  // it bursts up out of the ground: a ring of frost, chips flying, the crack and groan of ice forming
  const ax=q===1?0:1,az=q===1?1:0;
  for(let i=0;i<30;i++){const u=rr(-1,1)*ICW.W/2;FX.spawn({x:x+ax*u+rr(-.3,.3),y:y+.1,z:z+az*u+rr(-.3,.3),vx:rr(-1.4,1.4),vy:rr(.2,1),vz:rr(-1.4,1.4),life:rr(.7,1.3),s0:.3,s1:rr(1.1,1.7),r:.9,g:.96,b:1,a:.42,f:Math.random()<.5?5:2,drag:2,grav:.3})}
  for(let i=0;i<22;i++){const u=rr(-1,1)*ICW.W/2;FX.spawn({x:x+ax*u,y:y+rr(.2,2),z:z+az*u,vx:rr(-2.5,2.5),vy:rr(1.5,5),vz:rr(-2.5,2.5),life:rr(.6,1.1),s0:rr(.05,.12),s1:.04,r:.8,g:.92,b:1,a:.95,f:Math.random()<.6?10:7,grav:13,col:.3})}
  DL.add(x,y+1.2,z,'#9ae0ff',8,2.6,.35);
  {const h=rayCast(x,y+.3,z,0,-1,0,2);if(h)FX.decal(x,y+.3-h.t,z,0,1,0,2.4,9,[.82,.92,1],.75)}
  AU.at('icwrise',x,y+1,z,{vol:1,range:60});const P=G.player;if(P&&Math.hypot(P.c.x-x,P.c.z-z)<7)FX.shake=Math.max(FX.shake,.3);return C};
ICW.remove=function(C,how){const i=ICW.list.indexOf(C);if(i<0)return;ICW.list.splice(i,1);worldRemoveDyn(C.box);R.scene.remove(C.mesh);C.mesh.geometry.dispose();C.mesh.material.dispose();if(how==='quiet')return;
  const big=how==='break',x=C.x,y=C.y,z=C.z,ax=C.q===1?0:1,az=C.q===1?1:0;
  for(let k=0;k<(big?44:30);k++){const u=rr(-1,1)*ICW.W/2,h=rr(.1,ICW.H);FX.spawn({x:x+ax*u,y:y+h,z:z+az*u,vx:rr(-1,1)*(big?3.5:1.2),vy:big?rr(.5,4):rr(-.5,1.5),vz:rr(-1,1)*(big?3.5:1.2),
    life:rr(.7,1.4),s0:rr(.06,.16),s1:.05,r:.8,g:.92,b:1,a:.95,f:Math.random()<.5?10:7,grav:13,col:.3})}
  for(let k=0;k<18;k++){const u=rr(-1,1)*ICW.W/2;FX.spawn({x:x+ax*u,y:y+rr(.2,ICW.H*.8),z:z+az*u,vx:rr(-.6,.6),vy:rr(-.2,.5),vz:rr(-.6,.6),life:rr(1,1.8),s0:.35,s1:rr(1.4,2),r:.9,g:.96,b:1,a:.38,f:Math.random()<.5?5:2,drag:1.6,grav:.35})}
  AU.at('icwbreak',x,y+1,z,{vol:big?1:.7,range:55,rate:big?1:1.1})};
ICW.clear=function(){for(const C of ICW.list.slice())ICW.remove(C,'quiet')};
// the first wall on a line, if any, before tmax: {C, t, nx, ny, nz}
ICW.ray=function(ox,oy,oz,dx,dy,dz,tmax){let best=null,bt=tmax;for(const C of ICW.list){const t=rayBox(ox,oy,oz,dx,dy,dz,C.box,bt);if(t>=0&&t<bt){bt=t;best={C,t,nx:RAYHIT.nx,ny:RAYHIT.ny,nz:RAYHIT.nz}}}return best};
// a blow on a wall: the host (or a lone page) counts it; a client tells the host
ICW.hurt=function(C,k,src,at){if(!C||ICW.list.indexOf(C)<0)return;C.flash=.12;if(at)for(let i=0;i<6;i++)FX.spawn({x:at.x,y:at.y,z:at.z,vx:rr(-1.5,1.5),vy:rr(.5,2.5),vz:rr(-1.5,1.5),life:rr(.4,.7),s0:rr(.04,.08),s1:.03,r:.82,g:.93,b:1,f:10,grav:12,col:.3});
  AU.at('icwhit',at?at.x:C.x,at?at.y:C.y+1,at?at.z:C.z,{vol:.7,range:30});
  if(NET.cli&&!NET.ev){netToHost({t:'icwh',i:C.id,k});return}
  C.hp-=k;if(C.hp<=0){ICW.remove(C,'break');if(NET.host)netEv('icwx',{i:C.id})}};
ICW.update=function(dt){
  for(const C of ICW.list.slice()){C.t+=dt;C.life-=dt;const r=clamp(C.t/ICW.RISE,0,1),m=C.mesh;m.scale.y=r<1?.05+.99*smooth(r):1+.035*Math.max(0,1-(C.t-ICW.RISE)/.2);
    C.flash=Math.max(0,C.flash-dt);const U=m.material.uniforms;U.uFlash.value=C.flash>0?.35:0;U.uCrack.value=clamp(Math.max(1-C.hp/ICW.HP,C.life<2.5?(2.5-C.life)/2.5:0)*.85,0,.85);
    if(C.life<1.1&&!C.creak){C.creak=true;AU.at('icwcreak',C.x,C.y+1,C.z,{vol:.7,range:35})}
    if(C.life<1.1&&Math.random()<dt*10){const ax=C.q===1?0:1,az=C.q===1?1:0,u=rr(-1,1)*ICW.W/2;FX.spawn({x:C.x+ax*u,y:C.y+rr(.5,ICW.H),z:C.z+az*u,vx:rr(-.3,.3),vy:rr(-.5,0),vz:rr(-.3,.3),life:rr(.4,.8),s0:.05,s1:.03,r:.82,g:.93,b:1,f:10,grav:10,col:.3})}
    // cold air rolling off its foot
    if(Math.random()<dt*5){const ax=C.q===1?0:1,az=C.q===1?1:0,u=rr(-1,1)*ICW.W/2,sd=Math.random()<.5?-1:1;FX.spawn({x:C.x+ax*u+az*sd*.35,y:C.y+.15,z:C.z+az*u+ax*sd*.35,vx:az*sd*rr(.2,.5),vy:0,vz:ax*sd*rr(.2,.5),life:rr(1.2,2),s0:.3,s1:rr(1,1.4),r:.9,g:.96,b:1,a:.18,f:5,drag:.8})}
    if(C.life<=0)ICW.remove(C,'melt')}};
// right click with the gun in hand (the owner's page): spend the coolant, raise it, tell the others where
ICW.alt=function(a,W){if(NET.ghost||a.pup)return;const am=a.ammo.glacier;if(!am||a.reloadT>0||a.drawT>0)return;
  if(G.t<(a.icwCd||0)){if(a.isPlayer&&!AU.throttle('icwcd',600)){AU.play('dry',{vol:.45});HUD.note(LI()?`Ice wall in ${Math.ceil(a.icwCd-G.t)} s`:`얼음벽 ${Math.ceil(a.icwCd-G.t)}초 뒤`,1)}return}
  if(am.mag<ICW.COST){if(a.isPlayer&&!AU.throttle('icwno',700)){AU.play('dry',{vol:.5});HUD.note(LI()?`An ice wall needs ${ICW.COST} coolant`:`얼음벽에 냉각제 ${ICW.COST}이 필요해요`,1.2)}return}
  const s=ICW.spot(a,a.bot&&a.bot.icwD!=null?a.bot.icwD:null);if(!s){if(a.isPlayer&&!AU.throttle('icwsp',700)){AU.play('dry',{vol:.45});HUD.note(LI()?'No room for an ice wall there':'거기엔 얼음벽을 세울 자리가 없어요',1.2)}return}
  am.mag-=ICW.COST;a.icwCd=G.t+ICW.CD;a.nextFire=Math.max(a.nextFire,G.t+.4);a.lastFire=G.t;
  const C=ICW.add(a,s.x,s.y,s.z,s.q,null);NET.on&&netFxPush(['iw',a.id,C.id,Math.round(s.x*100),Math.round(s.y*100),Math.round(s.z*100),s.q]);
  if(a.isPlayer){AU.play('gcblast',{vol:.85});FX.shake=Math.max(FX.shake,.18);a.punchP+=.035;VM.fire(W,0);VM.gcBlastT=G.t}else{const e=actorEye(a);AU.at('gcblast',e.x,e.y,e.z,{vol:.85,range:50})}
  // the blast of mist that carries out to it
  {const e=a.isPlayer?gcOrigin(a,_gcO):_gcO.copy(muzzleWorld(a)),dx=s.x-e.x,dy=s.y+1-e.y,dz=s.z-e.z,d=Math.hypot(dx,dy,dz)||1;
    for(let i=0;i<26;i++){const u=Math.random();FX.spawn({x:e.x+dx*u*.3,y:e.y+dy*u*.3,z:e.z+dz*u*.3,vx:dx/d*rr(10,16),vy:dy/d*rr(10,16),vz:dz/d*rr(10,16),life:rr(.35,.55),s0:.12,s1:rr(.9,1.3),r:.74,g:.9,b:1,a:.4,f:5,drag:2.6,add:1})}}
  alertBots(a,a.c.x,a.c.z)};

// ---------- the bots ----------
// a zombie pushing into a wall claws at it; a human with the Glacier holds the jet till the zombie is in reach, and raises a wall in
// front of a pack closing in
ICW.botClaw=function(a){const cmd=a.cmd;if(!(cmd.f||cmd.s)||a.frozen>0)return;const e=actorEye(a);aimDir(a.yaw,0,_gcD);const w=ICW.ray(e.x,a.c.y+1.1,e.z,_gcD.x,0,_gcD.z,a.c.hw+.9);
  if(w){cmd.fire=true;cmd.alt=false;a.pitch=0}};
function gcBot(a,dt){const B=a.bot;if(!B)return;const t=B.seen&&B.seen.a&&B.seen.a.alive?B.seen.a:null;
  if(a.cmd.fire&&t&&t.alive){const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z)-(t.c.hw||.3);if(d>GLC.R-.5)a.cmd.fire=false}
  const am=a.ammo.glacier;if(NET.cli||!t||!t.alive||!am||am.mag<ICW.COST||G.t<(a.icwCd||0)||G.st!=='fight')return;
  const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z);if(d<3.2||d>8||Math.random()>dt*2.5)return;
  let n=0;for(const z of G.actors)if(z.alive&&z.team===TZ&&Math.hypot(z.c.x-a.c.x,z.c.z-a.c.z)<11)n++;
  if(n>=2||d<5){B.icwD=clamp(d-1.4,ICW.MIND,ICW.MAXD);a.cmd.alt=true;a.cmd.fire=false}}

// ---------- the HUD: the wall's readiness; frost round the edges of a chilled player zombie's view ----------
const GCHU={el:null,fv:null,s:''};
function gcHud(){const P=G.player,live=!!(P&&P.alive&&G.st!=='menu'&&!G.spec);
  const on=live&&P.team===TH&&P.cur==='glacier';if(!GCHU.el&&on){const e=GCHU.el=document.createElement('div');e.id='gcWall';$('hud').appendChild(e)}
  if(GCHU.el){GCHU.el.style.display=on?'block':'none';if(on){const L=LI(),cd=Math.max(0,(P.icwCd||0)-G.t),am=P.ammo.glacier,ok=cd<=0&&am&&am.mag>=ICW.COST;
      const s=ok?(L?'❄ ICE WALL · RMB':'❄ 얼음벽 · 우클릭'):cd>0?(L?`❄ ICE WALL ${Math.ceil(cd)} s`:`❄ 얼음벽 ${Math.ceil(cd)}초`):(L?`❄ ICE WALL · ${ICW.COST} coolant`:`❄ 얼음벽 · 냉각제 ${ICW.COST}`);
      if(s!==GCHU.s){GCHU.s=s;GCHU.el.textContent=s}GCHU.el.classList.toggle('ok',!!ok)}}
  const z=live&&P.team===TZ?Math.max(P.gcChill||0,P.gcVis||0)/10:0,fr=live&&P.team===TZ&&P.frozen>0&&(P.gcFz>0||P.gcVis>=6);
  if(!GCHU.fv&&(z>0||fr)){const e=GCHU.fv=document.createElement('div');e.id='gcFrostV';$('hud').appendChild(e)}
  if(GCHU.fv){const o=fr?.85:z*.6;GCHU.fv.style.opacity=o.toFixed(2);GCHU.fv.style.display=o>.01?'block':'none'}}

// ---------- the loop under the player's own jet ----------
AU.cryo=function(v){const c=this.ctx;if(!c||!this.sfx||c.state!=='running')return;const b=this.bank.gcjet;if(!b||!b.length)return;
  if(!this.crS){if(!(v>.01))return;const s=c.createBufferSource();s.buffer=b[0];s.loop=true;const g=c.createGain();g.gain.value=0;s.connect(g);g.connect(this.sfx);s.start();this.crS=s;this.crG=g}
  const t=c.currentTime,sd=soundDesign('gcjet');this.crS.playbackRate.setTargetAtTime((.95+.08*v)*(sd.rate||1),t,.08);this.crG.gain.setTargetAtTime(this.muted||!(v>.01)?0:.3*v*sd.vol,t,v>.01?.04:.09)};

// ---------- hooks ----------
(function(){
  // the jet is the fire; the wall the alt fire
  const fg=fireGun;fireGun=function(a,W){if(W&&W.cryo){gcFire(a,W);if(KC.rec&&a.gcT===G.t)KC.shot(a,W,actorEye(a),true);return}return fg.apply(this,arguments)};
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='icewall')return ICW.alt(a,W);return na(a,W)};
  // a frozen zombie is brittle (the host's word: it deals the damage); dying frozen, it shatters
  const da=damageActor;damageActor=function(t,dmg,src,o){if(!NET.cli&&!NET.ghost&&t&&t.alive&&t.team===TZ&&t.frozen>0&&t.gcFz>0&&!(o&&o.gcSh))dmg*=GLC.BRIT;return da.call(this,t,dmg,src,o)};
  const kz=killZombie;killZombie=function(t,src,o){const sh=!NET.cli&&t&&t.alive&&t.team===TZ&&t.frozen>0&&t.gcFz>0&&!glcBig(t);const r=kz.apply(this,arguments);if(sh&&!t.alive)GLC.shatter(t,src);return r};
  // the cold slows (on the page that moves the zombie)
  const ms=maxSpeed;maxSpeed=function(a){const s=ms(a);if(a.team===TZ&&a.gcChill>0)return s*(1-GLC.SLOW*Math.min(1,a.gcChill/10));return s};
  // nothing reaches through a wall: a blow at someone behind one lands on the ice
  const mh=meleeHit;meleeHit=function(a,range,cone){const r=mh.apply(this,arguments);if(!ICW.list.length||!r)return r;
    if(r.t){const e=actorEye(a),c=r.t.c,tx=c.x,ty=clamp(e.y,c.y+.2,r.t.head.y),tz=c.z,dx=tx-e.x,dy=ty-e.y,dz=tz-e.z,d=Math.hypot(dx,dy,dz)||1,w=ICW.ray(e.x,e.y,e.z,dx/d,dy/d,dz/d,d);
      if(!w)return r;const x=e.x+dx/d*w.t,y=e.y+dy/d*w.t,z=e.z+dz/d*w.t;ICW.lastHit={C:w.C,x,y,z};return {wall:{box:w.C.box,t:w.t,nx:w.nx,ny:w.ny,nz:w.nz},x,y,z,n:[w.nx,w.ny,w.nz]}}
    if(r.wall&&r.wall.box&&r.wall.box.icw)ICW.lastHit={C:r.wall.box.icw,x:r.x,y:r.y,z:r.z};return r};
  const cs=clawStrike;clawStrike=function(a,heavy){ICW.lastHit=null;const r=cs.apply(this,arguments);const h=ICW.lastHit;ICW.lastHit=null;if(h&&a.team===TZ&&!NET.ghost)ICW.hurt(h.C,heavy?2:1,a,h);return r};
  // the cold tints a zombie pale blue; a shattered body is gone
  const uv=updateVisual;updateVisual=function(a,dt){uv(a,dt);if(!a.ch)return;if(a.alive)a.gcShat=false;else if(a.gcShat){a.ch.grp.visible=false;if(a.gun)a.gun.visible=false;return}
    if(a.alive&&a.team===TZ&&!(a.frozen>0)){const v=Math.max(a.gcVis||0,a.gcChill||0);if(v>.2){const T=a.ch.mat.uniforms.uTint.value;if(T.w===0)T.set(.62,.85,1,Math.min(.42,v/10*.42))}}};
  // the cold and the freeze go to the owner like any effect (net.js EFF_T); the host takes them from a client
  EFF_T.push(['gcChill','gc'],['gcFz','gf']);
  const ne=netApplyEff;netApplyEff=function(a,e,src){ne(a,e,src);if(!a||!a.alive||a.team!==TZ)return;if(e.gc){a.gcChill=Math.max(a.gcChill||0,Math.min(10,e.gc/10));a.gcHitT=G.t}if(e.gf)a.gcFz=Math.max(a.gcFz||0,Math.min(3,e.gf/10))};
  const nd=netDoFx;netDoFx=function(a,f){if(f&&f[0]==='iw'){if(a&&!a.isPlayer&&G.actors.includes(a)&&!ICW.byId(f[2]))ICW.add(a,f[3]/100,f[4]/100,f[5]/100,f[6]===1?1:0,f[2]);return}return nd(a,f)};
  Object.assign(CLIH,{icwx(L,m){const C=ICW.byId(m.i);if(C)ICW.remove(C,'break')},gcs(L,m){const t=G.actors.find(x=>x.id===m.i);if(t)GLC.shatterFx(t)}});
  Object.assign(HOSTH,{icwh(L,m){const C=ICW.byId(m.i),src=actorOfKey(L.key);if(C&&src&&src.alive&&src.team===TZ&&Math.hypot(src.c.x-C.x,src.c.z-C.z)<ICW.W/2+3)ICW.hurt(C,clamp(m.k|0,1,2),src,null)}});
  // the bots
  const au=AI.update;AI.update=function(a,dt){const r=au.apply(this,arguments);try{if(a.alive&&a.bot){if(a.team===TZ){if(ICW.list.length)ICW.botClaw(a)}else if(a.cur==='glacier')gcBot(a,dt)}}catch(e){console.error(e)}return r};
  // the Deadshot (hskill.js) has nothing to aim with a jet
  if(typeof HSK!=='undefined'&&HSK.dsGun){const dg=HSK.dsGun;HSK.dsGun=function(W){return !(W&&W.cryo)&&dg.call(this,W)}}
  // every frame
  const nu=nyUpdate;nyUpdate=function(dt){nu(dt);try{GLC.update(dt);ICW.update(dt);gcStream(dt)}catch(e){console.error(e)}
    if(AU.cryo)AU.cryo(G.player&&G.player.alive&&G.player.gcOn&&!(typeof Main!=='undefined'&&Main.paused)&&G.st!=='menu'?1:0)};
  const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);try{gcHud()}catch(e){console.error(e)}};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();ICW.clear();for(const a of G.actors){a.gcChill=a.gcVis=a.gcFz=0;a.gcImm=0;a.icwCd=0;if(a.gcCr)GLC.crustOff(a,false);a.gcShat=false;a.gcWas=false}};
  // (the flash at the muzzle, if any, is cold blue while it is in hand)
  const vs=VM.set;VM.set=function(id,sk){const r=vs.apply(this,arguments);const f=this.flash&&this.flash.material;
    if(f){if(id==='glacier'){f.color.setRGB(.55,.85,1.3);this.gcTint=1}else if(this.gcTint){this.gcTint=0;if(id!=='storm'&&!(typeof jnW==='function'&&jnW(id)))f.color.setRGB(1,1,1)}}return r};
})();

// ---------- sounds (all synthesised) ----------
// the jet: gas under pressure hissing through the nozzle, a whistle riding on it, the crackle of frost forming, a low rush of air
function gcJetFn(B,len,env){const out=B.comp(-14,3,.01,.2,B.g(.9,env));
  for(const s of [-1,1]){const g=B.g(.55,B.pan(s*.35,out));B.nz('white',0,len,B.f('bandpass',rr(3400,4200),.8,g));B.am(g,0,len,rr(11,15),.3)}
  {const g=B.g(.6,out);B.nz('brown',0,len,B.f('lowpass',rr(520,640),.6,g));B.am(g,0,len,rr(5,7),.35)}
  {const g=B.g(.12,out);B.osc('sine',rr(2100,2300),rr(2150,2350),0,len,g);B.am(g,0,len,rr(3,5),.6)}
  {const g=B.g(.16,out);B.nz('white',0,len,B.f('highpass',7000,.7,g))}
  for(let i=0;i<len*30;i++){const t=rr(0,len-.03);B.grain(t,rr(3500,8500),rr(3,6),rr(.003,.008),rr(.05,.14),out)}}
// ice: a burst of short glassy clicks rising (forming) or falling (breaking), a ring of thin plates
const gcTinkle=(B,t0,n,span,lo,hi,l,o)=>{for(let i=0;i<n;i++){const t=t0+Math.pow(Math.random(),1.4)*span,f=rr(lo,hi);B.ring(t,f,[1,2.76,5.4],[.05,.03,.02],[.5*l,.22*l,.1*l],B.pan(rr(-.7,.7),o));B.grain(t,f*1.4,3,.004,.25*l,o)}};
Object.assign(SFX,{
  // the loop under the player's own jet (AU.cryo); a stretch of it for someone else's
  gcjet:{n:1,dur:1.6,ch:2,peak:.75,gain:.6,loop:.3,fn:B=>gcJetFn(B,1.6)},
  gcgust:{n:2,dur:.75,ch:2,peak:.78,gain:.58,rev:.12,poly:4,pj:.05,fn:B=>gcJetFn(B,.75,B.env(0,.08,1,.6,null,.04))},
  // the valve opening into the jet: a click, a pop of gas, the hiss swelling
  gcon:{n:2,dur:.7,ch:2,peak:.8,gain:.6,rev:.12,poly:3,fn:B=>{const o=B.comp(-10,4,.003,.2,B.g(.95));B.grain(0,3600,2,.006,.55,o);
    {const e=B.env(.01,.04,1,.4,o);const f=B.f('bandpass',1800,.8,e);f.frequency.setValueAtTime(1500,.01);f.frequency.exponentialRampToValueAtTime(4200,.2);B.nz('white',.01,.55,f)}
    {const e=B.env(.01,.004,.6,.12,B.sh(1.6,o));B.osc('sine',140,70,.01,.15,e)}}},
  // shut: the hiss dies away, the valve clacks, a last spit of frost
  gcoff:{n:2,dur:.8,ch:1,peak:.7,gain:.5,rev:.12,poly:3,fn:B=>{const o=B.g(.9);{const e=B.envT(0,.01,.6,.2,o);B.nz('white',0,.7,B.sweep(B.f('bandpass',4200,1.2,e),4200,1800,0,.7))}
    B.grain(.08,2400,3,.012,.45,o);gcTinkle(B,.12,6,.4,4000,7000,.35,o)}},
  // the right click: a heavy chuff of gas, a thump
  gcblast:{n:2,dur:.9,ch:2,peak:.9,gain:.8,rev:.18,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.2,B.g(.95));
    {const e=B.env(0,.004,1,.35,o);const f=B.f('bandpass',2400,.7,e);f.frequency.setValueAtTime(3600,0);f.frequency.exponentialRampToValueAtTime(900,.4);B.nz('white',0,.5,f)}
    {const e=B.env(0,.003,.9,.25,B.sh(2,o));B.osc('sine',110,48,0,.3,e)}{const e=B.env(0,.01,.6,.5,o);B.nz('brown',0,.6,B.f('lowpass',700,.7,e))}}},
  // a zombie freezing: frost crackling over it fast, rising, a thin glassy ring
  gcfreeze:{n:2,dur:.8,ch:2,peak:.8,gain:.6,rev:.2,poly:4,fn:B=>{const o=B.g(.9);for(let i=0;i<26;i++){const t=Math.pow(i/26,1.3)*.35;B.grain(t,rr(2500,5000)*(1+t*1.4),rr(3,6),rr(.003,.007),rr(.15,.35),B.pan(rr(-.6,.6),o))}
    {const e=B.env(0,.05,.35,.3,o);B.nz('white',0,.4,B.sweep(B.f('bandpass',2200,1.5,e),2200,5200,0,.35))}gcTinkle(B,.25,5,.25,3200,5600,.5,o)}},
  // the crust breaking off a thawing zombie
  gcthaw:{n:2,dur:.9,ch:2,peak:.75,gain:.5,rev:.18,poly:4,fn:B=>{const o=B.g(.9);for(let i=0;i<8;i++)B.grain(rr(0,.12),rr(900,2600),rr(2,4),rr(.008,.02),rr(.25,.5),B.pan(rr(-.5,.5),o));gcTinkle(B,.06,12,.6,2600,6500,.45,o)}},
  // a frozen zombie shattering: the crack, a heavy crash of ice, a long cascade of tinkling shards, a thump under it
  gcshatter:{n:3,dur:1.8,ch:2,peak:.92,gain:.9,rev:.3,poly:3,fn:B=>{const o=B.comp(-12,4,.002,.3,B.g(.95));
    {const e=B.env(0,.0008,1,.05,B.f('highpass',1500,.7,o));B.nz('white',0,.07,e)}
    for(let i=0;i<10;i++)B.grain(rr(0,.06),rr(800,2400),rr(1.5,3),rr(.01,.03),rr(.4,.8),B.pan(rr(-.6,.6),o));
    {const e=B.env(0,.004,.8,.35,o);B.nz('pink',0,.45,B.f('bandpass',1400,.6,e))}{const e=B.env(0,.003,.8,.3,B.sh(1.8,o));B.osc('sine',90,42,0,.35,e)}
    gcTinkle(B,.05,34,1.3,2400,7600,.6,o)}},
  // the wall rising: a deep groan of ice forming fast, crunching, a sharp crack at the top, frost settling
  icwrise:{n:2,dur:1.6,ch:2,peak:.92,gain:.9,rev:.3,poly:2,fn:B=>{const o=B.comp(-12,4,.003,.3,B.g(.95));
    {const e=B.env(0,.03,.9,.6,o);const f=B.f('lowpass',300,.8,e);f.frequency.setValueAtTime(300,0);f.frequency.exponentialRampToValueAtTime(1800,.22);B.nz('brown',0,.8,f)}
    {const e=B.env(0,.02,.6,.5,B.sh(1.6,o));B.osc('sawtooth',70,140,0,.3,B.f('lowpass',500,.8,e))}
    for(let i=0;i<30;i++){const t=Math.pow(Math.random(),1.2)*.3;B.grain(t,rr(900,3200),rr(2,4),rr(.006,.016),rr(.25,.5),B.pan(rr(-.7,.7),o))}
    {const e=B.env(.24,.0008,.9,.05,B.f('highpass',1600,.7,o));B.nz('white',.24,.08,e)}gcTinkle(B,.3,14,1,3000,7000,.4,o)}},
  // a claw on the ice
  icwhit:{n:3,dur:.5,ch:2,peak:.8,gain:.6,rev:.12,poly:6,fn:B=>{const o=B.g(.9);{const e=B.env(0,.001,.8,.06,B.f('bandpass',1800,.9,o));B.nz('white',0,.1,e)}
    {const e=B.env(0,.002,.5,.08,o);B.osc('sine',260,160,0,.1,e)}gcTinkle(B,.02,6,.25,3000,6500,.35,o)}},
  // groaning and creaking as it gives
  icwcreak:{n:2,dur:1,ch:2,peak:.75,gain:.5,rev:.25,poly:2,fn:B=>{const o=B.g(.9);for(let i=0;i<5;i++){const t=rr(0,.7),e=B.env(t,.02,.4,.12,o);B.osc('sawtooth',rr(180,320),rr(120,220),t,.16,B.f('bandpass',rr(500,900),2,e))}
    for(let i=0;i<10;i++)B.grain(rr(0,.85),rr(1500,4000),3,.006,rr(.15,.3),B.pan(rr(-.6,.6),o))}},
  // the wall coming down: a crash, slabs thudding, shards tinkling away
  icwbreak:{n:2,dur:2,ch:2,peak:.92,gain:.9,rev:.32,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.3,B.g(.95));{const e=B.env(0,.0008,.9,.06,B.f('highpass',1200,.7,o));B.nz('white',0,.08,e)}
    {const e=B.env(0,.006,.9,.5,o);B.nz('pink',0,.6,B.f('bandpass',900,.6,e))}for(let i=0;i<5;i++){const t=rr(.05,.5),e=B.env(t,.003,.6,.15,B.sh(1.6,o));B.osc('sine',rr(70,100),40,t,.18,e)}
    gcTinkle(B,.04,40,1.5,2200,7200,.55,o)}},
  // the first draw's vent; the tank pulled (a latch, the hiss of the seal) and seated (a clunk, the clamp snapping)
  gcvent:{n:2,dur:.8,ch:2,peak:.8,gain:.55,rev:.12,poly:2,fn:B=>{const o=B.g(.9);{const e=B.envT(0,.02,.6,.25,o);B.nz('white',0,.7,B.sweep(B.f('bandpass',2600,1,e),2600,5600,0,.4))}gcTinkle(B,.15,6,.4,4000,7000,.3,o)}},
  gcout:{n:2,dur:.5,peak:.85,gain:.7,rev:.08,fn:B=>{B.grain(0,3200,3,.008,.5);const e=B.envT(.02,.01,.4,.12);B.nz('white',.02,.25,B.f('bandpass',3800,1.2,e));B.ring(.03,rr(420,480),[1,2.2,3.4],[.1,.07,.04],[.22,.1,.05])}},
  gcin:{n:2,dur:.5,peak:.9,gain:.75,rev:.08,fn:B=>{const e=B.env(0,.002,1,.09);B.nz('brown',0,.12,B.f('lowpass',380,.8,e));{const k=B.env(0,.002,.8,.08);B.osc('sine',120,70,0,.1,k)}
    B.ring(.004,rr(320,380),[1,2.3,3.6],[.12,.08,.05],[.28,.13,.06]);B.grain(.08,4400,2,.006,.45)}}});
SFX_ORDER.push('gcjet','gcgust','gcon','gcoff','gcblast','gcfreeze','gcthaw','gcshatter','icwrise','icwhit','icwcreak','icwbreak','gcvent','gcout','gcin');

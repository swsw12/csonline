'use strict';
// ============ Minimap: a rotating radar in the top-left corner ============
// Each map gets a pre-drawn plan per floor band (ground, upper floors), traced from the brushes and kept only where bots can walk,
// so walls read as gaps with bright outlines. Team-mates always show; enemies show when the player can see them
// (and, for zombies, when a human has just fired).
const MINI_S=4;// plan pixels per metre
// floor bands split at these heights (a map can set its own: a hill town is one band, its terraces are outdoors)
const miniBand=y=>{const c=MAP.miniCut||[2.6,7.8];return y<c[0]?0:y<c[1]?1:2};
function miniBuild(){const bb=MAP.bounds||[-30,-30,30,30],S=MINI_S,W=Math.round((bb[2]-bb[0])*S),H=Math.round((bb[3]-bb[1])*S),N=NAV;
  let nb=0;for(const n of N.nodes)nb=Math.max(nb,miniBand(n.y));
  const layers=[];
  const C=MAP.miniCut||[2.6,7.8],tops=[];
  for(let b=0;b<=nb;b++){const lo=b===0?-4:C[b-1],hi=C[b]==null?40:C[b];
    const walk=new Uint8Array(W*H),hgt=new Float32Array(W*H);
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){const wx=bb[0]+(i+.5)/S,wz=bb[1]+(j+.5)/S;
      _bq.length=0;boxesIn(wx,wz,wx,wz,_bq);tops.length=0;
      for(const q of _bq){if(q.nosolid||wx<q.x0||wx>=q.x1||wz<q.z0||wz>=q.z1)continue;if(q.y1>=lo&&q.y1<hi&&tops.indexOf(q.y1)<0&&!insideSolid(wx,q.y1+.3,wz))tops.push(q.y1)}
      if(!tops.length)continue;tops.sort((a,b)=>b-a);
      // the highest floor in the band that a reachable nav node stands on (a roof over a cellar is skipped)
      const ci=Math.floor(wx-N.X0),cj=Math.floor(wz-N.Z0);
      for(const top of tops){let ok=false;
        for(let dj=-1;dj<=1&&!ok;dj++)for(let di=-1;di<=1&&!ok;di++){const a=ci+di,c=cj+dj;if(a<0||c<0||a>=N.NX||c>=N.NZ)continue;for(const n of N.col[c*N.NX+a])if(Math.abs(n.y-top)<.7){ok=true;break}}
        if(ok){walk[j*W+i]=1;hgt[j*W+i]=top;break}}}
    const cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),id=x.createImageData(W,H),D=id.data;
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){const k=j*W+i,p=k*4;if(!walk[k])continue;let edge=false;
      for(const [a,c] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+a,jj=j+c;if(ii<0||jj<0||ii>=W||jj>=H||!walk[jj*W+ii]||Math.abs(hgt[jj*W+ii]-hgt[k])>.9){edge=true;break}}
      if(edge){D[p]=214;D[p+1]=226;D[p+2]=238;D[p+3]=235}
      else{const t=clamp((hgt[k]-(b===0?-1.2:lo))/4,0,1),v=92+t*80;D[p]=v*.92;D[p+1]=v;D[p+2]=v*1.08;D[p+3]=150}}
    x.putImageData(id,0,0);layers.push(cv)}
  return {layers,x0:bb[0],z0:bb[1]}}
const RADAR={cv:null,ctx:null,px:170,t:0,band:0,seen:new Map(),rr:0,
  init(){const cv=$('hMap');if(!cv)return;this.cv=cv;this.ctx=cv.getContext('2d');this.resize()},
  resize(){if(!this.cv)return;const d=Math.min(2,window.devicePixelRatio||1);this.cv.width=this.cv.height=Math.round(this.px*d);this.dpr=d},
  // enemies the player is aware of: in sight (checked a few at a time), very close, or (for zombies) a human who just fired
  aware(P,a,dt){const d=Math.hypot(a.c.x-P.c.x,a.c.z-P.c.z);if(d<5)return true;
    if(P.team===TZ&&a.team===TH&&G.t-(a.lastFire||-9)<2)return true;
    const s=this.seen.get(a);return !!(s&&G.t-s<.6)},
  look(P){const L=G.actors;if(!L.length)return;const e=actorEye(P);
    for(let k=0;k<4;k++){this.rr=(this.rr+1)%L.length;const a=L[this.rr];if(!a||!a.alive||a.team===P.team)continue;
      if(a.zc==='runner'&&a.skillT>0&&a.team===TZ)continue;// an invisible light zombie stays off the radar
      if(Math.hypot(a.c.x-P.c.x,a.c.z-P.c.z)<45&&losClear(e.x,e.y,e.z,a.c.x,a.c.y+1.2,a.c.z))this.seen.set(a,G.t)}},
  update(dt){const cv=this.cv,P=G.player;if(!cv)return;const on=CFG.minimap!==false&&!!P&&!!MAP.mini&&G.st!=='menu';cv.style.display=on?'block':'none';if(!on)return;
    this.look(P);this.t+=dt;if(this.t<1/30)return;this.t=0;
    const tg=(!P.alive&&G.spec&&G.spec.alive)?G.spec:P,x=this.ctx,d=this.dpr,W=cv.width,c=W/2,R0=c-2*d,s=3.4*d,L=MAP.mini;
    const yaw=tg.yaw;let b=this.band;const y=tg.c.y;if(miniBand(y-.3)!==b&&miniBand(y+.3)!==b)b=miniBand(y);b=Math.min(b,L.layers.length-1);this.band=b;
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,W);x.save();x.beginPath();x.arc(c,c,R0,0,TAU);x.clip();x.fillStyle='rgba(8,10,14,.62)';x.fillRect(0,0,W,W);
    x.translate(c,c);x.rotate(yaw);x.scale(s/MINI_S,s/MINI_S);x.translate(-(tg.c.x-L.x0)*MINI_S,-(tg.c.z-L.z0)*MINI_S);x.imageSmoothingEnabled=false;
    for(let i=0;i<L.layers.length;i++)if(i!==b){x.globalAlpha=.2;x.drawImage(L.layers[i],0,0)}x.globalAlpha=1;x.drawImage(L.layers[b],0,0);x.restore();
    // other people
    const cs=Math.cos(yaw),sn=Math.sin(yaw);
    // supply crates: a yellow box, pinned to the rim when far away
    if(typeof SUP!=='undefined')for(const q of SUP.list){const dx=q.x-tg.c.x,dz=q.z-tg.c.z;let sx=(dx*cs-dz*sn)*s,sy=(dx*sn+dz*cs)*s;const l=Math.hypot(sx,sy),lim=R0-5*d;if(l>lim){sx*=lim/l;sy*=lim/l}
      sx+=c;sy+=c;x.fillStyle=Math.sin(G.t*6)>-.3?'#ffd04a':'#a07a20';x.fillRect(sx-3*d,sy-3*d,6*d,6*d);x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=d;x.strokeRect(sx-3*d,sy-3*d,6*d,6*d);x.fillStyle='#b01810';x.fillRect(sx-.7*d,sy-2*d,1.4*d,4*d);x.fillRect(sx-2*d,sy-.7*d,4*d,1.4*d)}
    for(const a of G.actors){if(a===tg||!a.alive||a.reviving>0)continue;const mate=a.team===tg.team;if(!mate&&!this.aware(tg,a,dt))continue;
      const dx=a.c.x-tg.c.x,dz=a.c.z-tg.c.z,sx=c+(dx*cs-dz*sn)*s,sy=c+(dx*sn+dz*cs)*s;if(Math.hypot(sx-c,sy-c)>R0-3*d)continue;
      const col=a.team===TZ?'#ff4a3a':'#5ab4ff',off=Math.abs(a.c.y-tg.c.y)>2.4,r=(a.host?3.4:2.8)*d;
      x.beginPath();x.arc(sx,sy,r,0,TAU);if(off){x.lineWidth=1.4*d;x.strokeStyle=col;x.stroke()}else{x.fillStyle=col;x.fill();x.lineWidth=d;x.strokeStyle='rgba(0,0,0,.6)';x.stroke()}
      if(a.isPlayer||a.net){x.fillStyle='rgba(255,255,255,.85)';x.fillRect(sx-.8*d,sy-.8*d,1.6*d,1.6*d)}}
    // me: an arrow pointing the way I look; the rim, north and the view cone
    x.fillStyle='rgba(255,236,170,.12)';x.beginPath();x.moveTo(c,c);x.arc(c,c,R0,-Math.PI/2-.55,-Math.PI/2+.55);x.closePath();x.fill();
    x.fillStyle=tg.team===TZ?'#ff9a8a':'#ffe08a';x.strokeStyle='rgba(0,0,0,.7)';x.lineWidth=d;x.beginPath();x.moveTo(c,c-6*d);x.lineTo(c+4.4*d,c+5*d);x.lineTo(c,c+2.6*d);x.lineTo(c-4.4*d,c+5*d);x.closePath();x.fill();x.stroke();
    x.lineWidth=1.5*d;x.strokeStyle='rgba(220,230,240,.35)';x.beginPath();x.arc(c,c,R0,0,TAU);x.stroke();
    // north = world -z, turned with the view
    const ax=c+(0*cs-(-1)*sn)*(R0-8*d),ay=c+(0*sn+(-1)*cs)*(R0-8*d);x.font=`bold ${Math.round(10*d)}px sans-serif`;x.textAlign='center';x.textBaseline='middle';
    x.fillStyle='rgba(8,10,14,.75)';x.beginPath();x.arc(ax,ay,6.5*d,0,TAU);x.fill();x.fillStyle='#ffd04a';x.fillText('N',ax,ay+.5*d);
    if(L.layers.length>1){x.fillStyle='rgba(200,210,220,.7)';x.font=`bold ${Math.round(9*d)}px sans-serif`;x.fillText(b?'2F':'1F',c,W-12*d)}}};

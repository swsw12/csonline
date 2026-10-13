'use strict';
// ============ Pings (v6.23): a mark on a spot for the team — Z or the middle mouse button (phones: the 📍 button) ============
// The mark stays 6 s: a diamond on the screen with the name and the distance, and on the minimap. Alone it just shows; in a
// multiplayer room a client asks the host, and the host shows it and sends it to the players on the pinger's side.
// A chapter can put its own up under any name (PING.relay): 4챕터's LYREBIRD fakes teammates' pings — the minimap's dot for that
// teammate being somewhere else is the only way to tell.
const PING={list:[],seq:0,lastT:-1e9,lay:null,pool:[],LIFE:6,
  // the local player's own: wherever the crosshair is (a wall, the floor, anything within 90 m)
  mine(){const P=G.player;if(!P||!P.alive||G.st==='menu'||G.st==='over'||Main.paused||(typeof CHAT!=='undefined'&&CHAT.on))return;const now=performance.now();if(now-this.lastT<900)return;this.lastT=now;
    const e=actorEye(P),d=aimDir(P.yaw,P.pitch,new THREE.Vector3()),h=rayCast(e.x,e.y,e.z,d.x,d.y,d.z,90,SHOT_FILTER),t=h?Math.max(.4,h.t-.12):40;
    const x=e.x+d.x*t,y=e.y+d.y*t,z=e.z+d.z*t;
    if(NET.on&&NET.cli){netToHost({t:'png',x:r2(x),y:r2(y),z:r2(z)});return}
    this.relay({n:P.name,tc:pingTc(P),x,y,z,by:P.id})},
  // the host (or alone): here, and to everyone on that side
  relay(o){if(NET.on&&NET.host)for(const [k,Lk] of NET.links){if(Lk.dead)continue;if(NET.ui==='game'){const a=actorOfKey(k);if(a&&pingTc(a)!==o.tc)continue}
      netSend(k,{t:'pngs',n:String(o.n||'?').slice(0,16),tc:o.tc,x:r2(o.x),y:r2(o.y),z:r2(o.z),by:o.by==null?-1:o.by})}
    const P=G.player;if(!P||pingTc(P)===o.tc)this.add(o)},
  add(o){const p={id:++this.seq,n:String(o.n||'?').slice(0,16),tc:o.tc,x:o.x,y:o.y,z:o.z,by:o.by==null?-1:o.by,t:0};
    for(let i=this.list.length-1;i>=0;i--)if(this.list[i].by===p.by&&p.by>=0)this.list.splice(i,1);// one live ping per player
    this.list.push(p);if(this.list.length>8)this.list.shift();AU.play('ui',{vol:.5,rate:2.6});return p},
  clear(){this.list=[];for(const d of this.pool)d.style.display='none'},
  // every frame: age them, draw the diamonds (kept on the screen's edge when the spot is off to the side)
  update(dt){for(let i=this.list.length-1;i>=0;i--){const p=this.list[i];p.t+=dt;if(p.t>this.LIFE)this.list.splice(i,1)}
    const P=G.player,on=!!P&&G.st!=='menu'&&this.list.length>0;
    if(!this.lay){if(!on)return;const h=$('hud');if(!h)return;this.lay=document.createElement('div');this.lay.id='pingL';h.appendChild(this.lay)}
    while(this.pool.length<this.list.length){const d=document.createElement('div');d.className='ping';d.innerHTML='<i></i><b></b><span></span>';this.lay.appendChild(d);this.pool.push(d)}
    const W=innerWidth,H=innerHeight,L=LI(),cam=R.cam;
    for(let i=0;i<this.pool.length;i++){const d=this.pool[i],p=on?this.list[i]:null;if(!p){if(d.style.display!=='none')d.style.display='none';continue}
      _pgv.set(p.x,p.y+.35,p.z).project(cam);let sx=(_pgv.x*.5+.5)*W,sy=(-_pgv.y*.5+.5)*H;const behind=_pgv.z>1,edge=behind||sx<24||sx>W-24||sy<60||sy>H-24;
      if(behind){sx=W-sx;sy=H-24}sx=clamp(sx,24,W-24);sy=clamp(sy,60,H-24);
      const dist=Math.round(Math.hypot(p.x-P.c.x,p.z-P.c.z)),tx=`${dist}m`;const b=d.children[1],s=d.children[2];if(b.textContent!==p.n)b.textContent=p.n;if(s.textContent!==tx)s.textContent=tx;
      const cl='ping'+(p.tc===TZ?' z':'')+(edge?' e':'')+(p.t<.6?' new':'');if(d.className!==cl)d.className=cl;d.style.display='block';d.style.left=sx.toFixed(1)+'px';d.style.top=sy.toFixed(1)+'px';
      d.style.opacity=p.t>this.LIFE-1?(this.LIFE-p.t).toFixed(2):'1'}},
  // the minimap (minimap.js): a diamond, pinned to the rim when far away
  mini(x,tg,cs,sn,s,c,R0,d){for(const p of this.list){if(p.tc!==pingTc(tg))continue;const dx=p.x-tg.c.x,dz=p.z-tg.c.z;let sx=(dx*cs-dz*sn)*s,sy=(dx*sn+dz*cs)*s;const l=Math.hypot(sx,sy),lim=R0-5*d;if(l>lim){sx*=lim/l;sy*=lim/l}
      sx+=c;sy+=c;const k=(Math.sin(p.t*9)>-.2?1:.6),r=4*d;x.fillStyle=`rgba(255,${Math.round(214*k)},74,1)`;x.strokeStyle='rgba(0,0,0,.75)';x.lineWidth=d;
      x.beginPath();x.moveTo(sx,sy-r);x.lineTo(sx+r,sy);x.lineTo(sx,sy+r);x.lineTo(sx-r,sy);x.closePath();x.fill();x.stroke()}}};
const _pgv=new THREE.Vector3();
// whose pings someone sees: his team; in 대인전 his side (in 개인전 only his own)
function pingTc(a){return G.pvp?'s'+a.side:a.team}
HOSTH.png=function(L,m){const a=actorOfKey(L.key);if(!a||!a.alive)return;const now=performance.now();if(now-(L.pingT||0)<800)return;L.pingT=now;
  PING.relay({n:a.name,tc:pingTc(a),x:+m.x/100,y:+m.y/100,z:+m.z/100,by:a.id})};
CLIH.pngs=function(L,m){PING.add({n:m.n,tc:m.tc,x:m.x/100,y:m.y/100,z:m.z/100,by:m.by})};
(function(){
  // Z / the middle button
  addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;if(e.code==='KeyZ'&&!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey)PING.mine()});
  addEventListener('mousedown',e=>{if(e.button===1&&Main.locked){e.preventDefault();PING.mine()}});
  // every frame; a new match starts clean
  const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);try{PING.update(dt)}catch(err){}};
  const tt=Main.toTitle.bind(Main);Main.toTitle=function(){PING.clear();return tt()};
  // the phone's top bar: a ping button next to the chat one
  if(typeof TOUCH!=='undefined'){const b0=TOUCH.build.bind(TOUCH);TOUCH.build=function(){const r=b0();try{const t=this.el&&this.el.querySelector('.ttop');if(t&&!t.querySelector('.tPing'))t.insertAdjacentHTML('afterbegin',this.B('ping','📍','tPing'))}catch(e){}return r};
    const p0=TOUCH.press.bind(TOUCH);TOUCH.press=function(id,on,v){if(id==='ping'){if(on)PING.mine();return}return p0(id,on,v)}}
  if(typeof STR.ko.prepHint==='string')STR.ko.prepHint+='  ·  Z: 핑';if(typeof STR.en.prepHint==='string')STR.en.prepHint+='  ·  Z: ping'})();

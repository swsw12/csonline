'use strict';
// ============ v6.95: 소리 방향 표시 — an enemy's footsteps, shots and reloads shown round the crosshair ============
// Options → 오디오 (off by default), for whoever cannot hear them: a short arc on the side the sound came from (up = in front, down =
// behind), white a step, orange a shot, blue a reload or a weapon drawn; brighter the closer, gone in .7 s. Only foes (foe(): the other
// team, or in 대인전 the other side), only within the sound's own range; one arc a body and kind, at its newest place.
// Fed by game.js stepSnd / othSnd, weapons.js fireGun, net.js netPuppet and startrack.js (SNDV.ping); drawn from HUD.update.
const SNDV={L:[],cv:null,cx:null,drawn:false,S:280,R:104,LIFE:.7,COL:{step:'255,255,255',shot:'255,122,72',rl:'110,180,255'},W:{step:5,shot:7,rl:4},
  ping(a,k,range,x,z){if(!CFG.sndViz||G.st==='menu')return;const P=G.player;if(!P||!P.alive||!a||a===P||!a.alive||!foe(P,a))return;
    const px=x==null?a.c.x:x,pz=z==null?a.c.z:z,R0=range||40,d=Math.hypot(px-AU.L.x,pz-AU.L.z);if(d>R0)return;
    const s=clamp(1-d/R0,.25,1);let e=null;for(const q of this.L)if(q.a===a&&q.k===k){e=q;break}
    if(!e){if(this.L.length>=24)this.L.shift();e={a,k,s:0};this.L.push(e)}e.x=px;e.z=pz;e.t=0;e.s=s},
  // the canvas over the HUD, centred on the crosshair (made again when the HUD has been rebuilt)
  canvas(){if(this.cv&&this.cv.isConnected)return this.cv;const h=$('hud');if(!h)return null;const c=document.createElement('canvas'),dpr=Math.min(2,window.devicePixelRatio||1),S=this.S;
    c.id='sndv';c.width=S*dpr;c.height=S*dpr;c.style.cssText=`position:absolute;left:50%;top:50%;width:${S}px;height:${S}px;margin:-${S/2}px 0 0 -${S/2}px;pointer-events:none;z-index:3`;
    h.appendChild(c);this.cv=c;this.cx=c.getContext('2d');this.cx.setTransform(dpr,0,0,dpr,0,0);return c},
  tick(dt){if(!this.L.length&&!this.drawn)return;const c=this.canvas();if(!c)return;const x=this.cx,S=this.S,C=S/2,L=AU.L;x.clearRect(0,0,S,S);this.drawn=false;
    const P=G.player;if(!CFG.sndViz||!P||!P.alive||G.st==='menu'){this.L.length=0;return}
    for(let i=this.L.length-1;i>=0;i--){const e=this.L[i];e.t+=dt;if(e.t>=this.LIFE||!e.a.alive){this.L.splice(i,1);continue}
      // the side it came from: clockwise from straight ahead (AU.at's own angle, turned to the screen)
      const th=-wrapA(Math.atan2(e.x-L.x,e.z-L.z)-(L.yaw+Math.PI)),al=e.s*(1-e.t/this.LIFE),hw=.2+.1*(1-e.s);
      x.beginPath();x.arc(C,C,this.R,th-Math.PI/2-hw,th-Math.PI/2+hw);x.strokeStyle=`rgba(${this.COL[e.k]},${al.toFixed(3)})`;x.lineWidth=this.W[e.k];x.lineCap='round';x.stroke();this.drawn=true}}};
{const hu=HUD.update.bind(HUD);HUD.update=function(dt){hu(dt);try{SNDV.tick(dt)}catch(e){console.error(e)}}}

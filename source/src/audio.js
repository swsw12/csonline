'use strict';
// ============ Audio engine ============
// Every sound is synthesised: layered SFX are rendered once into a bank of variations with OfflineAudioContext,
// then played through distance filtering, stereo placement and a procedural convolution space.
// The score is generated live: pulses, drones and drums that follow the round state.
// Bank/noise sample rate. prepare() switches it to the output device's own rate (48 kHz on most PCs,
// 44.1 kHz on many Macs) before anything is rendered, so playback never has to resample.
let ASR=44100;
const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
function abuf(ch,len){try{return new AudioBuffer({numberOfChannels:ch,length:len,sampleRate:ASR})}catch(e){return new OAC(1,1,ASR).createBuffer(ch,len,ASR)}}
const NZ={};
function makeNoise(){
  const L=ASR*4,X=ASR*.2;const mk=gen=>{const raw=new Float32Array(L+X);gen(raw);const b=abuf(1,L);const d=b.getChannelData(0);
    for(let i=0;i<L;i++)d[i]=raw[i];for(let i=0;i<X;i++){const k=i/X;d[i]=raw[i]*Math.sqrt(k)+raw[L+i]*Math.sqrt(1-k)}return b};
  NZ.white=mk(a=>{for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1});
  NZ.pink=mk(a=>{let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<a.length;i++){const x=Math.random()*2-1;b0=.99886*b0+x*.0555179;b1=.99332*b1+x*.0750759;b2=.969*b2+x*.153852;b3=.8665*b3+x*.3104856;b4=.55*b4+x*.5329522;b5=-.7616*b5-x*.016898;a[i]=(b0+b1+b2+b3+b4+b5+b6+x*.5362)*.11;b6=x*.115926}});
  NZ.brown=mk(a=>{let l=0;for(let i=0;i<a.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;a[i]=l*3.5}});
}
function tanhCurve(k){const n=2048,c=new Float32Array(n),t=Math.tanh(k);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(k*x)/t}return c}
const CURVES={};const curve=k=>CURVES[k]||(CURVES[k]=tanhCurve(k));
// ---- offline graph builder ----
function OB(oc){const D=oc.destination,HP=!!oc.createStereoPanner;
  const B={oc,D,
    g(v,dst){const n=oc.createGain();n.gain.value=v;n.connect(dst||D);return n},
    f(type,fr,q,dst){const n=oc.createBiquadFilter();n.type=type;n.frequency.value=fr;if(q!=null)n.Q.value=q;n.connect(dst||D);return n},
    sweep(n,f0,f1,t0,t1){n.frequency.setValueAtTime(f0,t0);n.frequency.exponentialRampToValueAtTime(Math.max(10,f1),t1);return n},
    pan(p,dst){if(!HP)return dst||D;const n=oc.createStereoPanner();n.pan.value=clamp(p,-1,1);n.connect(dst||D);return n},
    sh(k,dst){const n=oc.createWaveShaper();n.curve=curve(k);n.oversample='2x';n.connect(dst||D);return n},
    comp(th,ra,at,re,dst){const n=oc.createDynamicsCompressor();n.threshold.value=th;n.ratio.value=ra;n.attack.value=at;n.release.value=re;n.knee.value=4;n.connect(dst||D);return n},
    env(t0,a,p,d,dst,hold){const n=oc.createGain(),g=n.gain;a=Math.max(.0006,a);p=Math.max(1e-4,p);g.setValueAtTime(1e-4,t0);g.exponentialRampToValueAtTime(p,t0+a);let t=t0+a;if(hold){g.setValueAtTime(p,t+hold);t+=hold}g.exponentialRampToValueAtTime(1e-4,t+Math.max(.002,d));n.connect(dst||D);return n},
    nz(type,t0,dur,dst,rate){const s=oc.createBufferSource();s.buffer=NZ[type];if(rate)s.playbackRate.value=rate;s.connect(dst);s.start(t0,Math.random()*Math.max(0,NZ[type].duration-dur*(rate||1)-.1),dur+.02);return s},
    osc(type,f0,f1,t0,dur,dst,lin){const o=oc.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1!=null&&f1!==f0){if(lin)o.frequency.linearRampToValueAtTime(f1,t0+dur);else o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t0+dur)}o.connect(dst);o.start(t0);o.stop(t0+dur+.03);return o},
    ring(t0,f,ratios,decays,levels,dst){ratios.forEach((r,i)=>{const e=B.env(t0,.0008,levels[i],decays[i],dst||D);B.osc('sine',f*r,f*r*.996,t0,decays[i]+.02,e)})},
    grain(t0,f,q,dur,lvl,dst,type){const e=B.env(t0,.0005,lvl,dur,dst||D);B.nz(type||'white',t0,dur+.012,B.f('bandpass',f,q,e))},
    envT(t0,a,p,tau,dst){const n=oc.createGain(),g=n.gain;g.setValueAtTime(1e-4,t0);g.linearRampToValueAtTime(p,t0+Math.max(.001,a));g.setTargetAtTime(0,t0+a,tau);n.connect(dst||D);return n},
    am(node,t0,dur,rate,depth){const n=Math.max(4,Math.floor(dur*rate));const c=new Float32Array(n);for(let i=0;i<n;i++)c[i]=1-depth*Math.random();node.gain.setValueCurveAtTime(c,t0,dur)},
  };return B}
function renderSfx(dur,ch,fn){const oc=new OAC(ch,Math.ceil(dur*ASR),ASR);fn(OB(oc));const p=oc.startRendering();return (p&&p.then)?p:new Promise(r=>{oc.oncomplete=e=>r(e.renderedBuffer)})}
function finishBuf(buf,peak){let m=0;for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>m)m=v}}
  const k=(m>1e-6&&isFinite(m))?peak/m:0;const fl=Math.min(buf.length,Math.floor(ASR*.012));
  for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=isFinite(d[i])?d[i]*k:0;for(let i=0;i<fl;i++)d[d.length-1-i]*=i/fl}
  return buf}
// keep only the first `sec` seconds of a recorded sound (design.js len), with a short fade so the cut does not click
function trimBuf(buf,sec){const L=Math.min(buf.length,Math.max(1,Math.round(sec*buf.sampleRate)));if(L>=buf.length)return buf;
  const out=abuf(buf.numberOfChannels,L);const F=Math.min(L,Math.round(.06*buf.sampleRate));
  for(let c=0;c<buf.numberOfChannels;c++){const s=buf.getChannelData(c),d=out.getChannelData(c);for(let i=0;i<L;i++)d[i]=s[i];for(let i=0;i<F;i++)d[L-1-i]*=i/F}return out}
function makeLoop(buf,xf){const X=Math.floor(xf*ASR),L=buf.length-X;const out=abuf(buf.numberOfChannels,L);
  for(let c=0;c<buf.numberOfChannels;c++){const s=buf.getChannelData(c),d=out.getChannelData(c);for(let i=0;i<L;i++)d[i]=s[i];for(let i=0;i<X;i++){const k=i/X;d[i]=s[i]*Math.sqrt(k)+s[L+i]*Math.sqrt(1-k)}}return out}
// The impulse response MUST be built at the live context's exact rate: ConvolverNode throws if the
// buffer rate differs (e.g. a 44.1 kHz IR on a 48 kHz Windows device), which used to abort AU.init().
function makeIR(c){const R=c.sampleRate,dur=2.8,L=Math.floor(R*dur);const b=c.createBuffer(2,L,R);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let y=0;
    for(let i=0;i<L;i++){const t=i/R;const a=Math.min(1,Math.max(.035,.8-t*.3)*44100/R);y+=a*((Math.random()*2-1)-y);d[i]=y*Math.exp(-t*2.5)*(t<.01?t/.01:1)*.8}
    for(const [t,a] of [[.009,.55],[.017,-.42],[.023,.38],[.038,-.32],[.052,.28],[.071,-.22],[.093,.18]]){const i=Math.floor((t+(ch?.0033:0))*R);if(i<L)d[i]+=a}
    const c0=.27+(ch?.035:0);for(let i=Math.floor((c0-.06)*R);i<Math.floor((c0+.07)*R)&&i<L;i++){const t=i/R;d[i]+=(Math.random()*2-1)*Math.exp(-(((t-c0)/.02)**2))*.16}}
  return b}
// ---- sound designs ----
function gunshot(B,p){
  const out=B.comp(-8,3.5,.001,.1,B.f('highpass',45,.7,B.g(.95)));const bus=B.sh(p.drive,out);
  for(const s of [-1,1]){const e=B.env(0,.0006,p.crack,.028,B.pan(s*.2,bus));B.nz('white',0,.05,B.f('highpass',p.crackF,.7,e))}
  {const e=B.env(0,.0008,p.crack*.75,.07,bus);B.nz('white',0,.1,B.f('bandpass',rr(5000,6500),.7,e))}
  {const e=B.env(.002,.004,p.crack*.35,.16,out);B.nz('white',0,.2,B.f('highpass',3500,.6,e))}
  for(const b of p.body){const e=B.env(0,.0012,b.l,b.d,bus);B.nz(b.n||'white',0,b.d+.04,B.f('bandpass',b.f,b.q,e))}
  const pe=B.env(0,.0012,p.punch.l,p.punch.d,B.sh(3,bus));B.osc('sine',p.punch.f0,p.punch.f1,0,p.punch.d+.03,pe);
  if(p.mech){B.grain(p.mech.t,p.mech.f,3,.012,p.mech.l,bus);B.grain(p.mech.t+.012,p.mech.f*.7,3,.01,p.mech.l*.6,bus)}
  for(const s of [-1,1]){const te=B.envT(.006,.03,p.tail.l,p.tail.tau||.2,B.pan(s*.65,out));const lp=B.f('lowpass',p.tail.f0,.6,B.f('highpass',120,.6,te));B.sweep(lp,p.tail.f0,p.tail.f1,.006,p.tail.d);B.nz('pink',0,p.tail.d+.05,lp)}
  for(const e of p.echo){const del=B.oc.createDelay(1.2);del.delayTime.value=e.t;del.connect(B.g(e.l,B.f('lowpass',e.f,.5,B.pan(e.pan,out))));
    const ce=B.env(0,.009,1,.14,del);B.nz('pink',0,.17,B.f('bandpass',p.body[0].f*.8,.5,ce))}
}
function explosionFn(B){
  const out=B.comp(-12,5,.002,.25,B.f('highpass',38,.7,B.g(.95)));const bus=B.sh(1.8,out);
  for(const s of [-1,1]){const e=B.env(0,.0005,1,.05,B.pan(s*.3,bus));B.nz('white',0,.07,B.f('highpass',rr(800,1100),.7,e))}
  {const e=B.env(.003,.006,.5,.22,bus);B.nz('white',0,.25,B.f('bandpass',rr(3000,4200),.6,e))}
  for(const s of [-1,1]){const e=B.env(0,.004,1,rr(1.2,1.6),B.pan(s*.45,bus));const lp=B.f('lowpass',5000,.7,e);B.sweep(lp,rr(4500,6000),160,.002,1);B.nz('brown',0,1.7,lp)}
  {const e=B.env(0,.002,.6,.45,bus);B.nz('pink',0,.5,B.f('bandpass',rr(600,800),.6,e))}
  {const e=B.env(0,.003,1.1,1.1,B.sh(2,out));B.osc('sine',rr(66,78),36,0,1.1,e)}
  {const e=B.env(.01,.01,.4,1.4,out);B.osc('sine',52,38,.01,1.4,e)}
  for(let i=0;i<55;i++){const t=.12+2.1*Math.pow(Math.random(),1.6);const e=B.env(t,.0005,rr(.05,.24)*(1-t/2.5),rr(.004,.02),B.pan(rr(-.9,.9),out));B.nz('white',t,.03,B.f('bandpass',rr(900,5200),rr(2,6),e))}
  for(let i=0;i<6;i++){const t=rr(.3,1.4);const e=B.env(t,.002,rr(.2,.4),.03,B.pan(rr(-.7,.7),out));B.nz('brown',t,.05,B.f('lowpass',rr(200,400),.7,e))}
  for(const s of [-1,1]){const e=B.env(.15,.25,.42,2.6,B.pan(s*.6,out));B.nz('brown',.1,3.1,B.f('lowpass',260,.6,e))}
}
function artilleryFn(B){const out=B.g(.9);
  for(const s of [-1,1]){const e=B.env(0,.03,1,rr(2,2.8),B.pan(s*.5,out));const lp=B.f('lowpass',400,.6,e);B.sweep(lp,500,90,0,2.4);B.nz('brown',0,3.2,lp)}
  {const e=B.env(0,.02,.9,1.6,out);B.osc('sine',rr(42,52),26,0,1.6,e)}
  for(let i=0;i<3;i++){const t=rr(.3,1.2);const e=B.env(t,.05,rr(.2,.4),rr(.8,1.4),B.pan(rr(-.8,.8),out));B.nz('brown',t,1.5,B.f('lowpass',220,.6,e))}}
function grunt(B,f0,len,F,drive){
  const out=B.f('lowpass',3400,.7,B.sh(drive||1.2,B.g(1)));const fb=B.g(1,out);
  const fs=F.map((f,i)=>B.f('bandpass',f,[6,8,10][i],B.g([1,.5,.25][i],fb)));
  const e=B.env(0,.016,1,len*.75,fs[0],len*.25);e.connect(fs[1]);e.connect(fs[2]);
  for(const det of [1,1.012]){const o=B.oc.createOscillator();o.type='sawtooth';const fr=o.frequency;fr.setValueAtTime(f0*1.18*det,0);fr.exponentialRampToValueAtTime(f0*det,.05);fr.exponentialRampToValueAtTime(f0*.78*det,len*1.05);
    const v=B.oc.createOscillator();v.frequency.value=rr(6,9);const vg=B.oc.createGain();vg.gain.value=f0*.03;v.connect(vg);vg.connect(fr);v.start(0);v.stop(len*1.1+.05);
    const og=B.g(det===1?1:.45,e);o.connect(og);o.start(0);o.stop(len*1.1+.05)}
  const br=B.env(0,.012,.22,len,out);B.nz('pink',0,len+.05,B.f('bandpass',1600,.5,br))}
// ---- weapon sound recipes ----
const echoes=()=>[{t:rr(.17,.24),l:.06,f:1100,pan:rr(-.8,.8)},{t:rr(.36,.5),l:.03,f:650,pan:rr(-.8,.8)}];
const GUNDEF={
  p9:()=>({drive:1.5,crack:1,crackF:3000,body:[{f:rr(1600,1850),q:.9,l:.8,d:.06},{f:rr(3200,3700),q:1.1,l:.7,d:.045},{f:rr(560,640),q:.9,l:.4,d:.07,n:'pink'}],punch:{f0:rr(180,200),f1:80,d:.08,l:.7},mech:{t:rr(.018,.024),f:rr(4800,5600),l:.28},tail:{l:.2,tau:.16,d:.7,f0:3600,f1:320},echo:echoes()}),
  d50:()=>({drive:1.9,crack:1,crackF:2400,body:[{f:rr(900,1100),q:.8,l:.9,d:.09},{f:rr(2200,2600),q:1,l:.7,d:.06},{f:rr(300,360),q:.9,l:.65,d:.12,n:'pink'}],punch:{f0:rr(120,140),f1:55,d:.14,l:1.1},mech:{t:rr(.02,.026),f:rr(3800,4400),l:.3},tail:{l:.3,tau:.25,d:1,f0:3000,f1:220},echo:echoes()}),
  k5:()=>({drive:1.5,crack:.7,crackF:2800,body:[{f:rr(1400,1650),q:.9,l:.7,d:.05},{f:rr(2800,3200),q:1.1,l:.6,d:.04},{f:rr(480,560),q:.9,l:.35,d:.06,n:'pink'}],punch:{f0:rr(160,180),f1:74,d:.07,l:.55},mech:null,tail:{l:.18,tau:.15,d:.65,f0:3200,f1:280},echo:echoes()}),
  ar7:()=>({drive:1.7,crack:.9,crackF:2400,body:[{f:rr(1000,1250),q:.8,l:.9,d:.09},{f:rr(2400,2900),q:1,l:.75,d:.06},{f:rr(380,460),q:.9,l:.55,d:.12,n:'pink'}],punch:{f0:rr(140,160),f1:62,d:.12,l:1},mech:{t:rr(.026,.032),f:rr(3800,4600),l:.22},tail:{l:.28,tau:.22,d:rr(.9,1),f0:3200,f1:260},echo:echoes()}),
  kv47:()=>({drive:1.8,crack:.85,crackF:2200,body:[{f:rr(800,920),q:.8,l:.85,d:.1},{f:rr(1950,2300),q:1,l:.7,d:.06},{f:rr(320,380),q:.9,l:.55,d:.13,n:'pink'}],punch:{f0:rr(128,142),f1:58,d:.13,l:.95},mech:null,tail:{l:.27,tau:.22,d:rr(.9,1),f0:2900,f1:220},echo:echoes()}),
  hmg:()=>({drive:2,crack:.8,crackF:2000,body:[{f:rr(650,760),q:.8,l:.9,d:.11},{f:rr(1750,2050),q:1,l:.7,d:.065},{f:rr(280,330),q:.9,l:.65,d:.15,n:'pink'}],punch:{f0:rr(112,126),f1:54,d:.15,l:1.1},mech:{t:rr(.032,.038),f:rr(3300,3900),l:.3},tail:{l:.3,tau:.25,d:1.05,f0:2700,f1:200},echo:echoes()}),
  sg8:()=>({drive:2.2,crack:.8,crackF:1800,body:[{f:rr(420,520),q:.7,l:1,d:.16},{f:rr(1200,1500),q:.8,l:.8,d:.09},{f:rr(180,230),q:.8,l:.9,d:.22,n:'brown'}],punch:{f0:rr(95,110),f1:42,d:.22,l:1.3},mech:null,tail:{l:.4,tau:.32,d:1.3,f0:2200,f1:160},echo:echoes()}),
  as12:()=>({drive:2.1,crack:.8,crackF:2000,body:[{f:rr(520,620),q:.7,l:.95,d:.13},{f:rr(1400,1700),q:.8,l:.75,d:.08},{f:rr(200,250),q:.8,l:.8,d:.18,n:'brown'}],punch:{f0:rr(100,115),f1:46,d:.18,l:1.2},mech:{t:.04,f:3600,l:.25},tail:{l:.35,tau:.28,d:1.15,f0:2400,f1:180},echo:echoes()}),
  r700:()=>({drive:2.3,crack:1.2,crackF:2600,body:[{f:rr(700,820),q:.8,l:1,d:.12},{f:rr(2000,2400),q:1,l:.85,d:.08},{f:rr(260,320),q:.8,l:.8,d:.2,n:'pink'}],punch:{f0:rr(105,120),f1:44,d:.2,l:1.3},mech:null,tail:{l:.45,tau:.45,d:1.7,f0:2600,f1:150},echo:[{t:rr(.25,.32),l:.12,f:900,pan:rr(-.8,.8)},{t:rr(.55,.7),l:.07,f:600,pan:rr(-.8,.8)},{t:rr(.9,1.1),l:.04,f:450,pan:rr(-.8,.8)}]}),
  f7:()=>({drive:1.4,crack:.95,crackF:3400,body:[{f:rr(1900,2200),q:1,l:.75,d:.045},{f:rr(3800,4300),q:1.2,l:.6,d:.035},{f:rr(620,700),q:.9,l:.3,d:.06,n:'pink'}],punch:{f0:rr(200,220),f1:90,d:.06,l:.55},mech:{t:rr(.016,.02),f:rr(5200,6000),l:.25},tail:{l:.16,tau:.13,d:.6,f0:3800,f1:360},echo:echoes()}),
  tw9:()=>({drive:1.55,crack:1,crackF:2900,body:[{f:rr(1500,1750),q:.9,l:.8,d:.065},{f:rr(3000,3500),q:1.1,l:.7,d:.05},{f:rr(520,600),q:.9,l:.42,d:.075,n:'pink'}],punch:{f0:rr(170,190),f1:78,d:.085,l:.72},mech:{t:rr(.018,.024),f:rr(4600,5400),l:.28},tail:{l:.2,tau:.17,d:.75,f0:3400,f1:300},echo:echoes()}),
  r6:()=>({drive:2,crack:1.1,crackF:2200,body:[{f:rr(780,900),q:.8,l:.95,d:.11},{f:rr(1900,2300),q:1,l:.75,d:.07},{f:rr(260,320),q:.9,l:.75,d:.15,n:'pink'}],punch:{f0:rr(110,125),f1:48,d:.16,l:1.2},mech:null,tail:{l:.36,tau:.32,d:1.2,f0:2800,f1:200},echo:echoes()}),
  k9:()=>({drive:1.4,crack:.7,crackF:3100,body:[{f:rr(1700,1950),q:.9,l:.7,d:.045},{f:rr(3300,3700),q:1.1,l:.55,d:.035},{f:rr(560,640),q:.9,l:.3,d:.05,n:'pink'}],punch:{f0:rr(175,195),f1:82,d:.06,l:.5},mech:null,tail:{l:.15,tau:.13,d:.6,f0:3500,f1:300},echo:echoes()}),
  um45:()=>({drive:1.6,crack:.65,crackF:2400,body:[{f:rr(1050,1250),q:.8,l:.8,d:.06},{f:rr(2300,2700),q:1,l:.6,d:.045},{f:rr(380,450),q:.9,l:.45,d:.08,n:'pink'}],punch:{f0:rr(140,155),f1:64,d:.09,l:.7},mech:null,tail:{l:.2,tau:.17,d:.7,f0:3000,f1:260},echo:echoes()}),
  pd50:()=>({drive:1.45,crack:.75,crackF:3300,body:[{f:rr(1800,2100),q:1,l:.7,d:.045},{f:rr(3600,4100),q:1.2,l:.6,d:.035},{f:rr(600,700),q:.9,l:.3,d:.05,n:'pink'}],punch:{f0:rr(185,205),f1:88,d:.055,l:.5},mech:{t:.02,f:6000,l:.15},tail:{l:.15,tau:.13,d:.6,f0:3700,f1:320},echo:echoes()}),
  db2:()=>({drive:2.4,crack:.9,crackF:1600,body:[{f:rr(380,460),q:.7,l:1,d:.2},{f:rr(1100,1350),q:.8,l:.85,d:.11},{f:rr(150,190),q:.8,l:1,d:.28,n:'brown'}],punch:{f0:rr(85,98),f1:38,d:.26,l:1.4},mech:null,tail:{l:.48,tau:.4,d:1.5,f0:2000,f1:140},echo:echoes()}),
  m14:()=>({drive:2.1,crack:.85,crackF:1900,body:[{f:rr(480,580),q:.7,l:.95,d:.14},{f:rr(1300,1600),q:.8,l:.75,d:.085},{f:rr(190,240),q:.8,l:.85,d:.2,n:'brown'}],punch:{f0:rr(98,112),f1:44,d:.2,l:1.25},mech:{t:.035,f:3400,l:.25},tail:{l:.36,tau:.3,d:1.2,f0:2300,f1:170},echo:echoes()}),
  g35:()=>({drive:1.65,crack:.88,crackF:2500,body:[{f:rr(1050,1300),q:.8,l:.85,d:.085},{f:rr(2500,3000),q:1,l:.72,d:.055},{f:rr(400,470),q:.9,l:.5,d:.11,n:'pink'}],punch:{f0:rr(145,162),f1:64,d:.11,l:.95},mech:{t:rr(.024,.03),f:rr(4000,4700),l:.2},tail:{l:.26,tau:.21,d:.9,f0:3300,f1:270},echo:echoes()}),
  br3:()=>({drive:1.6,crack:.9,crackF:2700,body:[{f:rr(1150,1400),q:.85,l:.85,d:.075},{f:rr(2700,3200),q:1,l:.72,d:.05},{f:rr(420,500),q:.9,l:.48,d:.1,n:'pink'}],punch:{f0:rr(150,168),f1:66,d:.1,l:.9},mech:null,tail:{l:.25,tau:.2,d:.85,f0:3400,f1:280},echo:echoes()}),
  ar5c:()=>({drive:1.7,crack:.92,crackF:2300,body:[{f:rr(950,1150),q:.8,l:.9,d:.09},{f:rr(2300,2800),q:1,l:.75,d:.06},{f:rr(360,440),q:.9,l:.55,d:.12,n:'pink'}],punch:{f0:rr(138,155),f1:60,d:.12,l:1},mech:{t:rr(.026,.032),f:rr(3600,4300),l:.2},tail:{l:.28,tau:.23,d:.95,f0:3100,f1:250},echo:echoes()}),
  hr17:()=>({drive:1.9,crack:.9,crackF:2100,body:[{f:rr(720,850),q:.8,l:.9,d:.11},{f:rr(1800,2150),q:1,l:.72,d:.065},{f:rr(290,350),q:.9,l:.65,d:.14,n:'pink'}],punch:{f0:rr(118,132),f1:52,d:.15,l:1.15},mech:{t:.03,f:3500,l:.25},tail:{l:.32,tau:.27,d:1.1,f0:2800,f1:210},echo:echoes()}),
  sr8:()=>({drive:2.1,crack:1.15,crackF:2800,body:[{f:rr(850,1000),q:.8,l:.95,d:.1},{f:rr(2200,2600),q:1,l:.8,d:.07},{f:rr(300,360),q:.8,l:.7,d:.16,n:'pink'}],punch:{f0:rr(115,130),f1:50,d:.17,l:1.15},mech:null,tail:{l:.4,tau:.38,d:1.5,f0:2800,f1:170},echo:[{t:rr(.25,.32),l:.1,f:900,pan:rr(-.8,.8)},{t:rr(.55,.7),l:.06,f:600,pan:rr(-.8,.8)}]}),
  dm14:()=>({drive:2,crack:1.05,crackF:2500,body:[{f:rr(760,900),q:.8,l:.95,d:.11},{f:rr(2000,2400),q:1,l:.8,d:.075},{f:rr(280,340),q:.8,l:.72,d:.17,n:'pink'}],punch:{f0:rr(112,126),f1:48,d:.17,l:1.2},mech:{t:.03,f:3600,l:.25},tail:{l:.38,tau:.34,d:1.4,f0:2700,f1:180},echo:echoes()}),
  mg6:()=>({drive:2.05,crack:.8,crackF:1900,body:[{f:rr(600,700),q:.8,l:.92,d:.12},{f:rr(1600,1900),q:1,l:.7,d:.07},{f:rr(250,300),q:.9,l:.7,d:.16,n:'pink'}],punch:{f0:rr(105,118),f1:50,d:.16,l:1.15},mech:{t:.035,f:3200,l:.28},tail:{l:.32,tau:.27,d:1.1,f0:2600,f1:190},echo:echoes()}),
  gx6:()=>({drive:1.8,crack:.75,crackF:2600,body:[{f:rr(900,1100),q:.8,l:.85,d:.05},{f:rr(2200,2600),q:1,l:.7,d:.04},{f:rr(320,380),q:.9,l:.55,d:.07,n:'pink'}],punch:{f0:rr(130,145),f1:60,d:.07,l:.9},mech:null,tail:{l:.24,tau:.18,d:.8,f0:3000,f1:230},echo:echoes()}),
};
// zombie / human voices: sawtooth through formants + rasp noise, saturated
function voice(B,o){const out=B.f('lowpass',o.lp||3200,.7,B.sh(o.drive||2.5,B.g(1)));const fb=B.g(1,out);
  const fs=o.F.map((f,i)=>B.f('bandpass',f,[5,7,9][i],B.g([1,.55,.3][i],fb)));
  const e=B.env(0,o.att||.03,1,o.len*.7,fs[0],o.len*.3);e.connect(fs[1]);e.connect(fs[2]);
  for(const det of [1,1.013,.987]){const os=B.oc.createOscillator();os.type='sawtooth';const fr=os.frequency;fr.setValueAtTime(o.f0*det,0);
    if(o.fm)fr.exponentialRampToValueAtTime(o.fm*det,o.len*.35);fr.exponentialRampToValueAtTime(Math.max(20,o.f1*det),o.len*1.05);
    const v=B.oc.createOscillator();v.frequency.value=o.vib||rr(9,14);const vg=B.oc.createGain();vg.gain.value=o.f0*(o.vibD||.06);v.connect(vg);vg.connect(fr);v.start(0);v.stop(o.len*1.1+.05);
    const og=B.g(det===1?1:.4,e);os.connect(og);os.start(0);os.stop(o.len*1.1+.05)}
  const rasp=B.g(1,out);const re=B.env(0,o.att||.03,o.rasp||.4,o.len*.7,rasp,o.len*.3);B.nz(o.rn||'pink',0,o.len+.05,B.f('bandpass',o.rf||900,.8,re));if(o.gurgle)B.am(rasp,0,o.len,o.gurgle,.8)}
function whoosh(B,f0,f1,len,lvl,dst){const e=B.env(0,len*.35,lvl,len*.65,dst);B.nz('white',0,len+.03,B.sweep(B.f('bandpass',f0,1.4,e),f0,f1,0,len))}
function tone(B,t,f,len,lvl,type,dst){const e=B.env(t,.004,lvl,len,dst);B.osc(type||'triangle',f,f,t,len+.02,e)}
function frostFn(B){const out=B.comp(-10,4,.002,.2,B.g(.95));
  for(const s of [-1,1]){const e=B.env(0,.001,.9,.12,B.pan(s*.3,out));B.nz('white',0,.15,B.f('highpass',2500,.7,e))}
  for(let i=0;i<28;i++){const t=Math.pow(Math.random(),1.5)*1.2;B.ring(t,rr(2500,7000),[1,1.5,2.3],[.15,.1,.06],[rr(.05,.15),.06,.03],B.pan(rr(-.9,.9),out))}
  {const e=B.env(0,.004,.8,.5,out);B.osc('sine',90,40,0,.5,e)}{const e=B.env(.02,.3,.3,1.2,out);B.nz('pink',0,1.6,B.f('highpass',3000,.5,e))}}
function glFn(B){const out=B.comp(-10,4,.002,.15,B.g(.95));
  {const e=B.env(0,.002,1,.14,B.sh(2.5,out));B.osc('sine',rr(130,150),55,0,.16,e)}
  {const e=B.env(0,.001,.7,.06,out);B.nz('brown',0,.08,B.f('lowpass',900,.7,e))}
  {const e=B.env(.003,.004,.55,.12,out);B.nz('pink',0,.15,B.f('bandpass',rr(500,620),2.5,e))}
  B.grain(0,3200,2,.01,.35,out);B.grain(.05,2400,3,.012,.3,out);
  for(const s of [-1,1]){const te=B.envT(.01,.03,.2,.25,B.pan(s*.6,out));B.nz('pink',0,.9,B.f('lowpass',1500,.6,te))}}
function zbombFn(B){const out=B.comp(-10,4,.002,.2,B.sh(1.6,B.g(.95)));{const e=B.env(0,.002,1,.35,out);B.nz('brown',0,.45,B.f('lowpass',500,.7,e))}
  {const e=B.env(0,.003,.9,.4,out);B.osc('sine',80,35,0,.45,e)}for(let i=0;i<10;i++){const t=rr(.02,.5);const e=B.env(t,.002,rr(.2,.4),.06,B.pan(rr(-.8,.8),out));B.nz('pink',t,.08,B.sweep(B.f('bandpass',rr(500,900),3,e),900,300,t,t+.07))}}
const SFX={
  p9:{n:4,dur:.8,ch:2,peak:.92,gain:.75,rev:.12,poly:5,pj:.03,fn:B=>gunshot(B,GUNDEF.p9())},
  d50:{n:3,dur:1.1,ch:2,peak:.92,gain:.85,rev:.14,poly:4,pj:.03,fn:B=>gunshot(B,GUNDEF.d50())},
  k5:{n:4,dur:.75,ch:2,peak:.9,gain:.68,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.k5())},
  ar7:{n:4,dur:1.1,ch:2,peak:.92,gain:.8,rev:.12,poly:7,pj:.025,fn:B=>gunshot(B,GUNDEF.ar7())},
  kv47:{n:4,dur:1.1,ch:2,peak:.92,gain:.82,rev:.12,poly:7,pj:.03,fn:B=>gunshot(B,GUNDEF.kv47())},
  hmg:{n:4,dur:1.2,ch:2,peak:.92,gain:.8,rev:.12,poly:8,pj:.025,fn:B=>gunshot(B,GUNDEF.hmg())},
  sg8:{n:3,dur:1.5,ch:2,peak:.95,gain:.95,rev:.16,poly:4,pj:.03,fn:B=>gunshot(B,GUNDEF.sg8())},
  as12:{n:3,dur:1.3,ch:2,peak:.95,gain:.9,rev:.15,poly:5,pj:.03,fn:B=>gunshot(B,GUNDEF.as12())},
  r700:{n:3,dur:2,ch:2,peak:.95,gain:1,rev:.2,poly:3,pj:.02,fn:B=>gunshot(B,GUNDEF.r700())},
  f7:{n:3,dur:.75,ch:2,peak:.9,gain:.7,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.f7())},
  tw9:{n:3,dur:.85,ch:2,peak:.92,gain:.75,rev:.12,poly:6,pj:.03,fn:B=>gunshot(B,GUNDEF.tw9())},
  r6:{n:3,dur:1.3,ch:2,peak:.94,gain:.9,rev:.16,poly:4,pj:.03,fn:B=>gunshot(B,GUNDEF.r6())},
  k9:{n:3,dur:.7,ch:2,peak:.9,gain:.66,rev:.12,poly:9,pj:.03,fn:B=>gunshot(B,GUNDEF.k9())},
  um45:{n:3,dur:.8,ch:2,peak:.9,gain:.7,rev:.12,poly:8,pj:.03,fn:B=>gunshot(B,GUNDEF.um45())},
  pd50:{n:3,dur:.7,ch:2,peak:.9,gain:.66,rev:.12,poly:9,pj:.03,fn:B=>gunshot(B,GUNDEF.pd50())},
  db2:{n:3,dur:1.7,ch:2,peak:.96,gain:1,rev:.18,poly:3,pj:.03,fn:B=>gunshot(B,GUNDEF.db2())},
  m14:{n:3,dur:1.3,ch:2,peak:.95,gain:.92,rev:.15,poly:5,pj:.03,fn:B=>gunshot(B,GUNDEF.m14())},
  g35:{n:3,dur:1,ch:2,peak:.92,gain:.8,rev:.12,poly:7,pj:.025,fn:B=>gunshot(B,GUNDEF.g35())},
  br3:{n:3,dur:1,ch:2,peak:.92,gain:.78,rev:.12,poly:7,pj:.025,fn:B=>gunshot(B,GUNDEF.br3())},
  ar5c:{n:3,dur:1.05,ch:2,peak:.92,gain:.8,rev:.12,poly:7,pj:.025,fn:B=>gunshot(B,GUNDEF.ar5c())},
  hr17:{n:3,dur:1.2,ch:2,peak:.93,gain:.86,rev:.13,poly:6,pj:.025,fn:B=>gunshot(B,GUNDEF.hr17())},
  sr8:{n:3,dur:1.7,ch:2,peak:.95,gain:.95,rev:.18,poly:3,pj:.02,fn:B=>gunshot(B,GUNDEF.sr8())},
  dm14:{n:3,dur:1.6,ch:2,peak:.95,gain:.95,rev:.17,poly:4,pj:.02,fn:B=>gunshot(B,GUNDEF.dm14())},
  mg6:{n:3,dur:1.2,ch:2,peak:.93,gain:.84,rev:.12,poly:8,pj:.025,fn:B=>gunshot(B,GUNDEF.mg6())},
  gx6:{n:4,dur:.9,ch:2,peak:.9,gain:.72,rev:.1,poly:10,pj:.03,fn:B=>gunshot(B,GUNDEF.gx6())},
  gl40:{n:2,dur:1.1,ch:2,peak:.9,gain:.8,rev:.12,poly:3,pj:.04,fn:glFn},
  spinloop:{n:1,dur:1.4,peak:.7,gain:.5,loop:.25,fn:B=>{const out=B.g(.9);
    for(const [f,l] of [[180,.5],[360,.3],[540,.16],[1260,.07]]){const g=B.g(l,out);B.osc('sawtooth',f,f,0,1.4,B.f('lowpass',2400,.7,g))}
    const r=B.g(.45,out);B.nz('white',0,1.4,B.f('bandpass',2800,3,r));B.am(r,0,1.4,90,.6)}},
  gib:{n:3,dur:.6,peak:.9,gain:.75,rev:.08,poly:3,fn:B=>{const e=B.env(0,.001,1,.09);B.nz('brown',0,.12,B.f('lowpass',420,.8,e));
    for(let i=0;i<5;i++){const t=rr(0,.06);B.grain(t,rr(1800,3600),2.5,.01,rr(.4,.7))}
    for(let i=0;i<6;i++){const t=rr(.02,.3);const s=B.env(t,.003,rr(.25,.5),rr(.04,.09));B.nz('pink',t,.12,B.sweep(B.f('bandpass',rr(500,900),2.5,s),rr(900,1300),300,t,t+.1))}}},
  brk:{n:2,dur:.4,peak:.85,gain:.6,fn:B=>{B.grain(0,2600,2,.012,.8);const k=B.env(0,.001,.5,.05);B.osc('sine',220,140,0,.06,k);B.ring(.005,rr(1700,1900),[1,1.5,2.2],[.06,.04,.03],[.2,.12,.06]);const se=B.env(.02,.01,.25,.06);B.nz('white',.02,.08,B.f('bandpass',3000,2,se))}},
  casing:{n:6,dur:.4,peak:.7,gain:.28,rev:.04,poly:6,pj:.06,low:1,fn:B=>{const f=rr(4800,7200);for(const [t,l] of [[0,1],[rr(.07,.12),.55],[rr(.17,.24),.25]]){B.ring(t,f*rr(.97,1.03),[1,1.47,2.09,2.84],[.07,.05,.035,.02],[.35*l,.22*l,.12*l,.06*l]);B.grain(t,rr(6000,9000),1,.004,.25*l)}}},
  shellcase:{n:3,dur:.4,peak:.7,gain:.3,rev:.04,poly:4,pj:.06,low:1,fn:B=>{for(const [t,l] of [[0,1],[rr(.08,.14),.5]]){const e=B.env(t,.001,.4*l,.05);B.nz('brown',t,.06,B.f('lowpass',600,.7,e));B.ring(t,rr(900,1300),[1,1.6],[.05,.03],[.15*l,.08*l])}}},
  dry:{n:2,dur:.2,peak:.7,gain:.45,fn:B=>{B.grain(0,3200,2,.006,.8);B.grain(.002,5600,3,.004,.5);const e=B.env(0,.0005,.3,.015);B.osc('sine',1900,1700,0,.02,e);B.grain(.016,2600,4,.008,.4)}},
  magout:{n:3,dur:.7,peak:.75,gain:.5,fn:B=>{B.grain(0,3800,3,.006,.7);const e=B.env(0,.0005,.3,.01);B.osc('sine',2400,2200,0,.012,e);
    const se=B.env(.02,.01,.35,.08);B.nz('white',.02,.11,B.sweep(B.f('bandpass',1200,2,se),1200,2700,.02,.11))}},
  magin:{n:3,dur:.4,peak:.8,gain:.55,fn:B=>{const se=B.env(0,.01,.32,.07);B.nz('white',0,.09,B.sweep(B.f('bandpass',2200,1.6,se),2200,900,0,.08));
    const t=rr(.07,.085);B.grain(t,7000,.7,.005,.8);B.grain(t,1600,2,.012,.55);const e=B.env(t,.0008,.38,.03);B.osc('sine',900,700,t,.04,e);B.grain(t+.016,2400,3,.006,.35);const k=B.env(t,.001,.35,.05);B.osc('sine',180,120,t,.06,k)}},
  rack:{n:2,dur:.5,peak:.85,gain:.6,fn:B=>{const se=B.env(0,.015,.35,.08);B.nz('white',0,.11,B.sweep(B.f('bandpass',1800,3,se),1800,3600,0,.1));const sp=B.env(.01,.01,.06,.12);B.osc('triangle',640,700,.01,.13,sp);
    const t=rr(.13,.15);B.grain(t,8000,.7,.004,.9);B.grain(t,2200,2,.015,.6);const e=B.env(t,.001,.55,.06);B.osc('sine',230,140,t,.07,e);B.ring(t,3100,[1,1.41],[.08,.05],[.08,.04])}},
  pump:{n:2,dur:.6,peak:.85,gain:.7,fn:B=>{for(const [t,f0,f1] of [[0,900,2200],[.2,2000,900]]){const se=B.env(t,.01,.45,.07);B.nz('white',t,.09,B.sweep(B.f('bandpass',f0,2.5,se),f0,f1,t,t+.08));B.grain(t+.075,2600,2,.012,.7);const k=B.env(t+.075,.001,.5,.05);B.osc('sine',200,120,t+.075,.06,k)}}},
  shellin:{n:3,dur:.3,peak:.8,gain:.5,fn:B=>{const se=B.env(0,.01,.3,.05);B.nz('white',0,.07,B.sweep(B.f('bandpass',1500,2,se),1500,3000,0,.06));B.grain(.06,3500,2,.01,.6);const k=B.env(.06,.001,.35,.04);B.osc('sine',300,180,.06,.05,k)}},
  bolt:{n:2,dur:.7,peak:.8,gain:.55,fn:B=>{for(const [t,f] of [[0,3000],[.12,2200],[.3,2600],[.45,3400]]){B.grain(t,f,2.5,.012,.7);const se=B.env(t,.006,.25,.05);B.nz('white',t,.07,B.f('bandpass',f*.6,2,se))}}},
  slide:{n:2,dur:.3,peak:.8,gain:.5,fn:B=>{const se=B.env(0,.01,.3,.05);B.nz('white',0,.07,B.sweep(B.f('bandpass',2500,2,se),2500,4500,0,.06));B.grain(.07,6000,1,.005,.8);B.grain(.07,2000,2,.012,.5)}},
  draw:{n:2,dur:.35,peak:.6,gain:.4,fn:B=>{const fl=B.g(1);const e=B.env(0,.02,.35,.12,fl);B.nz('pink',0,.16,B.f('bandpass',1500,.7,e));B.am(fl,0,.15,60,.7);B.ring(.1,rr(2600,2900),[1,1.52],[.04,.03],[.12,.06])}},
  kdraw:{n:1,dur:.6,peak:.7,gain:.5,rev:.2,fn:B=>{const e=B.env(0,.05,.4,.25);B.nz('white',0,.32,B.sweep(B.f('bandpass',3000,6,e),3000,7000,0,.3));B.ring(.05,rr(3800,4200),[1,1.33,2.1],[.4,.3,.2],[.12,.07,.04])}},
  kswing:{n:3,dur:.3,peak:.7,gain:.45,pj:.08,fn:B=>whoosh(B,600,2400,.16,.6)},
  khit:{n:3,dur:.3,peak:.85,gain:.65,rev:.05,poly:3,fn:B=>{const e=B.env(0,.001,.9,.08);B.nz('brown',0,.1,B.f('lowpass',350,.8,e));const s=B.env(.003,.005,.6,.12);B.nz('pink',.003,.14,B.sweep(B.f('bandpass',1400,3,s),1400,400,.003,.12));B.grain(0,3000,.8,.01,.35)}},
  // sledge on flesh: a sub thump, a crunch, the steel head ringing faintly
  hamhit:{n:3,dur:.6,peak:.95,gain:.9,rev:.14,poly:3,fn:B=>{const e=B.env(0,.002,1,.16);B.nz('brown',0,.24,B.f('lowpass',190,.7,e));const k=B.env(0,.002,.9,.14);B.osc('sine',72,38,0,.18,k);
    for(let i=0;i<3;i++){const t=rr(0,.04);const s=B.env(t,.002,.45,.05);B.nz('pink',t,.07,B.sweep(B.f('bandpass',rr(700,1300),2.5,s),1300,380,t,t+.06))}B.ring(.005,rr(900,1100),[1,2.7,4.1],[.25,.14,.08],[.06,.035,.02])}},
  kwall:{n:2,dur:.5,peak:.8,gain:.5,rev:.1,fn:B=>{B.grain(0,5000,.7,.004,.7);B.ring(0,rr(1800,2400),[1,1.7,2.6],[.2,.12,.08],[.25,.15,.08]);const s=B.env(.01,.01,.2,.15);B.nz('white',.01,.18,B.f('bandpass',4000,2,s))}},
  pin:{n:2,dur:.5,peak:.65,gain:.5,fn:B=>{const se=B.env(0,.004,.25,.04);B.nz('white',0,.05,B.f('bandpass',3000,4,se));B.ring(.03,rr(2300,2450),[1,1.58,2.2],[.25,.18,.12],[.25,.15,.08])}},
  throw:{n:2,dur:.5,peak:.7,gain:.5,fn:B=>{const e=B.env(0,.08,.4,.18);B.nz('white',0,.28,B.sweep(B.f('bandpass',400,.8,e),400,1500,0,.12));const c=B.env(0,.02,.2,.08);B.nz('pink',0,.1,B.f('bandpass',1200,.7,c))}},
  bounce:{n:4,dur:.3,peak:.7,gain:.55,pj:.08,fn:B=>{const th=B.env(0,.0015,.45,.03);B.nz('brown',0,.05,B.f('lowpass',320,.7,th));B.ring(0,rr(1500,2200),[1,1.53,2.37],[.07,.05,.03],[.3,.18,.1]);B.grain(0,2500,1,.015,.15)}},
  explode:{n:3,dur:3.4,ch:2,peak:.95,gain:1,rev:.25,poly:4,pj:.05,fn:explosionFn},
  frostx:{n:2,dur:2,ch:2,peak:.9,gain:.85,rev:.3,poly:3,fn:frostFn},
  zbombx:{n:2,dur:1,ch:2,peak:.9,gain:.85,rev:.2,poly:3,fn:zbombFn},
  flare:{n:1,dur:1.2,peak:.7,gain:.45,rev:.1,fn:B=>{B.grain(0,3000,1,.02,.7);const e=B.env(0,.05,.5,.9,null,.2);B.nz('white',0,1.2,B.f('highpass',2500,.6,e));const c=B.g(1);const e2=B.env(.02,.03,.3,1,c);B.nz('pink',0,1.1,B.f('bandpass',900,.6,e2));B.am(c,0,1.1,30,.6)}},
  thunder:{n:2,dur:4.5,ch:2,peak:.8,gain:.7,rev:.5,poly:1,fn:B=>{const out=B.g(.9);for(let i=0;i<8;i++){const t=rr(0,.5)*i*.4;const e=B.env(t,.004,rr(.3,1),rr(.08,.3),B.pan(rr(-.8,.8),out));B.nz('white',t,.4,B.f('bandpass',rr(800,3000),1,e))}
    for(const s of [-1,1]){const e=B.env(.05,.4,1,rr(2.8,3.6),B.pan(s*.5,out));const lp=B.f('lowpass',600,.6,e);B.sweep(lp,700,90,.05,3.5);B.nz('brown',0,4.2,lp)}}},
  // impacts
  imp_conc:{n:4,dur:.35,peak:.8,gain:.6,rev:.1,poly:6,pj:.08,low:1,fn:B=>{B.grain(0,3600,.7,.005,.7);B.grain(0,1800,1.2,.025,.45);for(let i=0;i<3;i++)B.grain(rr(.008,.06),rr(4000,6500),3,.003,rr(.12,.28));const k=B.env(0,.001,.2,.025);B.osc('sine',300,180,0,.03,k)}},
  imp_metal:{n:4,dur:.6,peak:.8,gain:.42,rev:.12,poly:6,pj:.06,low:1,fn:B=>{B.grain(0,4500,.7,.003,.6);B.ring(0,rr(700,1100),[1,2.31,3.87,5.13],[.35,.25,.15,.1],[.35,.25,.15,.08])}},
  imp_wood:{n:3,dur:.3,peak:.8,gain:.45,rev:.08,poly:6,pj:.08,low:1,fn:B=>{B.grain(0,750,2.5,.05,.6,null,'pink');B.ring(0,rr(220,270),[1,1.7],[.08,.05],[.35,.2]);for(let i=0;i<6;i++)B.grain(rr(0,.04),rr(3000,6000),1.5,.002,rr(.1,.25))}},
  imp_dirt:{n:4,dur:.35,peak:.8,gain:.45,rev:.06,poly:6,pj:.08,low:1,fn:B=>{const e=B.env(0,.0012,.85,.06);B.nz('brown',0,.08,B.f('lowpass',380,.7,e));const p=B.env(.002,.003,.35,.12);B.nz('pink',.002,.14,B.f('bandpass',900,.8,p));for(let i=0;i<5;i++)B.grain(rr(.03,.25),rr(2000,4000),2,.006,rr(.03,.08))}},
  imp_flesh:{n:4,dur:.2,peak:.85,gain:.55,rev:.04,poly:6,pj:.08,fn:B=>{const e=B.env(0,.0012,.9,.07);B.nz('brown',0,.09,B.f('lowpass',280,.8,e));const s=B.env(.002,.004,.5,.09);B.nz('pink',.002,.11,B.sweep(B.f('bandpass',1100,2.5,s),1100,380,.002,.09));B.grain(0,3800,.8,.006,.22)}},
  headshot:{n:2,dur:.5,peak:.85,gain:.6,rev:.08,poly:3,fn:B=>{B.grain(0,5200,.7,.004,.8);B.ring(0,rr(2600,2900),[1,1.5,2.1],[.12,.08,.05],[.3,.15,.08]);const e=B.env(0,.001,.7,.09);B.nz('brown',0,.11,B.f('lowpass',420,.8,e))}},
  whiz:{n:4,dur:.35,peak:.75,gain:.45,rev:.05,poly:4,pj:.06,fn:B=>{const f0=rr(4200,5600),f1=rr(1000,1500);const e=B.env(0,.02,.5,.17);B.nz('white',0,.22,B.sweep(B.f('bandpass',f0,2.5,e),f0,f1,0,.19))}},
  // zombies
  zgrowl:{n:6,dur:1.6,peak:.8,gain:.55,rev:.15,poly:4,pj:.06,fn:B=>voice(B,{f0:rr(62,82),f1:rr(48,58),len:rr(.8,1.3),F:[rr(350,450),rr(850,1000),2300],drive:3.2,rasp:.8,rf:rr(600,900),gurgle:rr(14,22),vibD:.1})},
  zpain:{n:4,dur:.6,peak:.8,gain:.55,rev:.08,poly:3,pj:.05,fn:B=>voice(B,{f0:rr(150,190),f1:rr(90,110),len:rr(.22,.35),F:[650,1250,2600],drive:3,rasp:.6,rf:1200})},
  zdie:{n:3,dur:1.6,peak:.85,gain:.7,rev:.2,poly:3,fn:B=>voice(B,{f0:rr(200,240),fm:rr(160,190),f1:45,len:rr(1,1.3),F:[700,1150,2500],drive:3.5,rasp:.8,rf:900,gurgle:18})},
  zatk:{n:3,dur:.6,peak:.8,gain:.6,rev:.08,poly:4,fn:B=>{voice(B,{f0:rr(110,140),f1:rr(70,90),len:.4,F:[550,1050,2400],drive:3.5,rasp:.7,rf:1000});whoosh(B,400,1800,.2,.5)}},
  zinfect:{n:2,dur:1.8,peak:.9,gain:.85,rev:.25,poly:2,fn:B=>{voice(B,{f0:rr(300,340),fm:rr(220,250),f1:85,len:1.4,F:[820,1250,2700],drive:3,rasp:.9,rf:1300,vib:7,vibD:.08});const e=B.env(.3,.1,.5,.8);B.nz('brown',.3,1,B.f('lowpass',300,.7,e))}},
  zscream:{n:2,dur:2,ch:2,peak:.9,gain:.85,rev:.3,poly:2,fn:B=>{voice(B,{f0:rr(520,600),fm:rr(780,880),f1:420,len:1.6,F:[1300,2600,3800],drive:2.2,rasp:.7,rf:3000,rn:'white',vib:8,vibD:.05,lp:6000})}},
  zroar:{n:2,dur:1.6,peak:.9,gain:.8,rev:.25,poly:2,fn:B=>voice(B,{f0:rr(95,115),fm:rr(130,150),f1:60,len:1.2,F:[480,900,2300],drive:4,rasp:1,rf:700,gurgle:12})},
  zleap:{n:2,dur:.6,peak:.8,gain:.6,rev:.1,fn:B=>{whoosh(B,300,1400,.35,.8);voice(B,{f0:150,f1:110,len:.3,F:[600,1100,2400],drive:3,rasp:.5})}},
  zharden:{n:1,dur:1,peak:.85,gain:.7,rev:.15,fn:B=>{for(let i=0;i<10;i++){const t=rr(0,.4);B.grain(t,rr(800,2400),3,.02,rr(.3,.6));const k=B.env(t,.002,.4,.05);B.nz('brown',t,.07,B.f('lowpass',400,.7,k))}voice(B,{f0:80,f1:60,len:.7,F:[380,800,2200],drive:4,rasp:.9,rf:500})}},
  zrevive:{n:2,dur:1.4,peak:.85,gain:.65,rev:.2,fn:B=>{for(let i=0;i<6;i++){const t=rr(0,.3);B.grain(t,rr(1000,3000),3,.012,.5)}const s=B.env(0,.01,.6,.3);B.nz('pink',0,.35,B.sweep(B.f('bandpass',600,3,s),600,200,0,.3));voice(B,{f0:90,fm:140,f1:70,len:.9,F:[450,900,2300],drive:3.5,rasp:.9})}},
  claw:{n:4,dur:.3,peak:.8,gain:.6,pj:.06,poly:4,fn:B=>whoosh(B,350,1600,.18,.7)},
  clawhit:{n:4,dur:.4,peak:.85,gain:.75,rev:.06,poly:4,fn:B=>{const e=B.env(0,.001,.9,.07);B.nz('brown',0,.09,B.f('lowpass',300,.8,e));for(let i=0;i<4;i++){const t=rr(0,.08);const s=B.env(t,.003,.5,.06);B.nz('pink',t,.08,B.sweep(B.f('bandpass',rr(900,1600),3,s),1600,500,t,t+.06))}}},
  clawarmor:{n:3,dur:.5,peak:.85,gain:.7,rev:.08,poly:4,fn:B=>{const e=B.env(0,.0012,.7,.05);B.nz('brown',0,.07,B.f('lowpass',420,.7,e));B.ring(0,rr(900,1150),[1,1.68,2.53],[.18,.12,.08],[.3,.18,.1]);B.grain(0,5000,.7,.003,.4);whoosh(B,500,2000,.12,.3)}},
  zstep:{n:4,dur:.25,peak:.7,gain:.32,rev:.04,poly:4,pj:.1,low:1,fn:B=>{const e=B.env(0,.002,.6,.06);B.nz('brown',0,.08,B.f('lowpass',260,.7,e));const s=B.env(.01,.005,.25,.05);B.nz('pink',.01,.07,B.f('bandpass',700,2,s));const k=B.env(0,.001,.35,.05);B.osc('sine',90,60,0,.06,k)}},
  // humans
  hurt:{n:4,dur:.45,peak:.8,gain:.5,rev:.05,poly:2,pj:.02,fn:B=>grunt(B,rr(100,128),rr(.17,.24),Math.random()<.5?[620,1120,2350]:[540,1650,2450])},
  hdie:{n:2,dur:1,peak:.8,gain:.55,rev:.15,poly:2,fn:B=>grunt(B,rr(110,125),.6,[520,920,2300],1.4)},
  hscream:{n:2,dur:1.6,peak:.85,gain:.7,rev:.2,poly:2,fn:B=>{voice(B,{f0:rr(240,280),fm:rr(320,360),f1:110,len:1.2,F:[800,1200,2600],drive:2,rasp:.5,rf:1500,vib:6,vibD:.04});}},
  step_conc:{n:4,dur:.13,peak:.7,gain:.25,rev:.05,poly:4,pj:.08,low:1,fn:B=>{B.grain(0,1800,1.5,.02,.35);B.grain(0,5200,1,.002,.15);const k=B.env(0,.001,.25,.03);B.osc('sine',140,100,0,.035,k)}},
  step_metal:{n:4,dur:.4,peak:.7,gain:.28,rev:.08,poly:4,pj:.08,low:1,fn:B=>{B.grain(0,2200,1.5,.015,.4);B.ring(0,rr(380,520),[1,2.4,3.9],[.15,.1,.06],[.25,.12,.06]);const k=B.env(0,.001,.3,.04);B.osc('sine',120,80,0,.05,k)}},
  step_dirt:{n:5,dur:.16,peak:.7,gain:.26,rev:.03,poly:4,pj:.08,low:1,fn:B=>{const e=B.env(0,.002,.45,.04);B.nz('brown',0,.06,B.f('lowpass',220,.7,e));for(let i=0;i<9;i++)B.grain(rr(0,.06),rr(1200,3400),rr(1.5,4),rr(.003,.007),rr(.04,.11))}},
  step_wood:{n:3,dur:.2,peak:.7,gain:.28,rev:.05,poly:4,pj:.08,low:1,fn:B=>{B.grain(0,700,2,.03,.5,null,'pink');B.ring(0,rr(180,240),[1,1.6],[.06,.04],[.25,.12])}},
  land:{n:2,dur:.4,peak:.8,gain:.45,rev:.06,fn:B=>{const e=B.env(0,.003,.9,.1);B.nz('brown',0,.13,B.f('lowpass',200,.7,e));const k=B.env(0,.002,.6,.08);B.osc('sine',85,50,0,.09,k);for(let i=0;i<3;i++)B.ring(rr(.02,.12),rr(2600,4800),[1,1.4],[.03,.02],[rr(.06,.12),.04])}},
  armor:{n:2,dur:.5,peak:.8,gain:.5,rev:.05,fn:B=>{const s=B.env(0,.02,.3,.15);B.nz('pink',0,.2,B.f('bandpass',1100,.8,s));B.ring(.1,1800,[1,1.5],[.1,.06],[.2,.1]);B.grain(.12,3000,2,.01,.5)}},
  pickup:{n:2,dur:.35,peak:.7,gain:.45,fn:B=>{const s=B.env(0,.01,.2,.07);B.nz('pink',0,.09,B.f('bandpass',1500,.8,s));B.ring(.04,rr(1700,2100),[1,1.61,2.3],[.08,.05,.03],[.25,.14,.07])}},
  heart:{n:1,dur:.6,peak:.8,gain:.6,rev:0,poly:1,pj:0,fn:B=>{const beat=(t,l)=>{const e=B.env(t,.006,l,.13);B.osc('sine',62,44,t,.15,e);const n=B.env(t,.004,l*.35,.06);B.nz('brown',t,.08,B.f('lowpass',140,.7,n))};beat(0,1);beat(.2,.7)}},
  // ui & announcer-ish cues
  ui:{n:2,dur:.15,peak:.6,gain:.35,rev:.04,fn:B=>{const e=B.env(0,.001,.6,.03);B.osc('sine',rr(1050,1150),700,0,.04,B.f('lowpass',4000,.7,e));B.grain(0,2200,1.5,.003,.25)}},
  uiok:{n:1,dur:.8,peak:.6,gain:.35,rev:.15,fn:B=>{tone(B,0,880,.45,.4);tone(B,.08,1318.5,.45,.35)}},
  buy:{n:1,dur:.6,peak:.7,gain:.45,rev:.05,fn:B=>{B.grain(0,3000,2,.01,.6);tone(B,.03,1568,.25,.3,'square');tone(B,.09,2093,.3,.25,'square')}},
  countdown:{n:1,dur:.3,peak:.6,gain:.9,rev:0,pj:0,poly:1,fn:B=>tone(B,0,988,.18,.5,'square')},
  beep:{n:1,dur:.3,peak:.6,gain:.4,rev:.1,pj:0,fn:B=>tone(B,0,988,.18,.5,'square')},
  beep2:{n:1,dur:.5,peak:.6,gain:.45,rev:.1,pj:0,fn:B=>{tone(B,0,1318.5,.35,.5,'square');tone(B,0,659,.35,.3,'square')}},
  hit:{n:2,dur:.1,peak:.6,gain:.3,rev:0,pj:.05,fn:B=>{B.grain(0,3200,3,.01,.7);tone(B,0,1900,.03,.3,'square')}},
  hsding:{n:1,dur:.4,peak:.6,gain:.4,rev:.05,pj:0,fn:B=>{B.ring(0,2400,[1,2.7,4.1],[.25,.15,.08],[.4,.2,.1])}},
  lvlup:{n:1,dur:1,peak:.7,gain:.5,rev:.2,pj:0,fn:B=>{[523,659,784,1047].forEach((f,i)=>tone(B,i*.07,f,.4,.35,'square'))}},
  morale:{n:1,dur:1,peak:.7,gain:.45,rev:.2,pj:0,fn:B=>{[392,523,659].forEach((f,i)=>tone(B,i*.09,f,.5,.35,'triangle'));tone(B,.27,784,.6,.3,'triangle')}},
  siren:{n:1,dur:4.8,ch:2,peak:.8,gain:.42,rev:.7,poly:1,fn:B=>{const out=B.f('lowpass',1500,.6,B.g(1));
    for(const [det,p] of [[1,-.5],[1.006,.5]]){const bp=B.f('bandpass',900,.7,B.pan(p,out));const e=B.env(0,.9,.5,2.6,bp,1.1);const o=B.oc.createOscillator();o.type='sawtooth';const f=o.frequency;
      f.setValueAtTime(260*det,0);f.exponentialRampToValueAtTime(600*det,1.8);f.setValueAtTime(600*det,2.4);f.exponentialRampToValueAtTime(330*det,4.6);o.connect(e);o.start(0);o.stop(4.7);
      const v=B.oc.createOscillator();v.frequency.value=5.5;const vg=B.oc.createGain();vg.gain.value=4;v.connect(vg);vg.connect(f);v.start(0);v.stop(4.7)}}},
  stingZ:{n:1,dur:3,ch:2,peak:.9,gain:.7,rev:.4,fn:B=>{const out=B.sh(1.6,B.g(.9));for(const [m,d] of [[38,-6],[44,6],[49,0],[50,-4]]){const e=B.env(0,.01,.25,2.2,B.pan(d/8,out));const o=B.osc('sawtooth',mtof(m),mtof(m)*.97,0,2.3,B.f('lowpass',1400,.7,e));o.detune.value=d}
    {const e=B.env(0,.002,1,.8,out);B.osc('sine',70,30,0,.8,e)}{const e=B.env(0,.001,.8,.5,out);B.nz('brown',0,.6,B.f('lowpass',400,.7,e))}}},
  stingH:{n:1,dur:3,ch:2,peak:.85,gain:.6,rev:.4,fn:B=>{for(const [m,t] of [[62,0],[66,.12],[69,.24],[74,.36]]){const e=B.env(t,.01,.3,1.8,B.pan(rr(-.4,.4)));B.osc('sawtooth',mtof(m),mtof(m),t,1.9,B.f('lowpass',2400,.7,e))}}},
  stingL:{n:1,dur:3.5,ch:2,peak:.85,gain:.6,rev:.45,fn:B=>{for(const [m,t] of [[50,0],[49,.25],[46,.5],[41,.75]]){const e=B.env(t,.02,.32,1.8,B.pan(rr(-.4,.4)));B.osc('sawtooth',mtof(m),mtof(m)*.98,t,1.9,B.f('lowpass',1200,.7,e))}}},
};
const SFX_ORDER=['ui','uiok','buy','beep','beep2','countdown','hit','hsding','p9','ar7','claw','clawhit','clawarmor','zgrowl','zpain','zdie','zatk','step_conc','step_dirt','step_metal','step_wood','zstep','land','magout','magin','rack','dry','draw','kdraw','kswing','khit','hamhit','kwall',
  'imp_conc','imp_metal','imp_wood','imp_dirt','imp_flesh','headshot','casing','shellcase','k5','kv47','hmg','sg8','as12','r700','d50','pump','shellin','bolt','slide','zinfect','zscream','zroar','zleap','zharden','zrevive','hurt','hdie','hscream',
  'pin','throw','bounce','explode','frostx','zbombx','flare','whiz','armor','pickup','heart','lvlup','morale','siren','stingZ','stingH','stingL','thunder','f7','tw9','r6','k9','um45','pd50','db2','m14','g35','br3','ar5c','hr17','sr8','dm14','mg6','gx6','gl40','spinloop','brk','gib'];
const mtof=m=>440*Math.pow(2,(m-69)/12);
// ---- live score: minor-key pulse that tightens with the round ----
const CHORDS=[{n:[48,51,55,58],b:36},{n:[44,48,51,55],b:32},{n:[46,50,53,58],b:34},{n:[43,47,50,55],b:31}];
const MUS_LV={calm:{pad:.8,bell:.5,bass:0,drum:0,arp:0,perc:0},prep:{pad:.65,bell:.2,bass:.55,drum:0,arp:.45,perc:0},fight:{pad:.55,bell:.1,bass:.8,drum:.85,arp:.5,perc:.2},intense:{pad:.5,bell:0,bass:1,drum:1,arp:.85,perc:.85},dead:{pad:.35,bell:0,bass:0,drum:0,arp:0,perc:0},win:{pad:.8,bell:.8,bass:0,drum:0,arp:0,perc:0}};
const MU={started:false,bpm:104,step:0,next:0,state:'calm',T:MUS_LV.calm,L:{},pad:[],padF:null,timer:0};
const AU={ctx:null,bank:{},fromFile:{},ready:false,preparing:false,vol:.7,muted:false,musicOn:true,voices:{},nvo:0,last:{},mufBase:20000,nextBeat:0,ambOn:false,graph:false,L:{x:0,y:0,z:0,yaw:0},
  ensureCtx(){if(this.ctx)return this.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{this.ctx=new AC({latencyHint:'interactive'})}catch(e){try{this.ctx=new AC()}catch(e2){this.ctx=null}}return this.ctx},
  async prepare(onProg){if(this.preparing||!OAC)return;this.preparing=true;
    const c=this.ensureCtx();if(c&&c.sampleRate>0)ASR=clamp(Math.round(c.sampleRate),44100,48000);
    try{makeNoise()}catch(e){console.warn('noise',e);return}
    let k=0;for(const name of SFX_ORDER){const d=SFX[name];const arr=[];
      // design.js can swap a synthesised sound for a recorded file
      let fb=soundDesign(name).file?await this.loadFile(soundDesign(name).file):null;if(fb&&soundDesign(name).len>0)fb=trimBuf(fb,soundDesign(name).len);if(fb){this.bank[name]=[fb];this.fromFile[name]=true;k++;if(onProg)onProg(k/SFX_ORDER.length);continue}
      for(let v=0;v<d.n;v++){try{let b=await renderSfx(d.dur,d.ch||1,B=>d.fn(B,v));b=finishBuf(b,d.peak||.9);if(d.loop)b=makeLoop(b,d.loop);arr.push(b)}catch(e){console.warn('sfx',name,e)}}this.bank[name]=arr;k++;if(onProg)onProg(k/SFX_ORDER.length)}
    this.ready=true},
  // a recorded replacement (design.js SOUND_DESIGN[name].file): decoded at the bank rate; null when missing or unreadable
  async loadFile(url){if(Array.isArray(url)){for(const u of url){const b=await this.loadFile(u);if(b)return b}return null}
    try{const r=await fetch(url);if(!r.ok)throw new Error(r.status);const ab=await r.arrayBuffer();const oc=new OAC(2,1,ASR);
      return await new Promise((ok,no)=>{const p=oc.decodeAudioData(ab,ok,no);if(p&&p.then)p.then(ok,no)})}catch(e){console.warn('sound file',url,e);return null}},
  init(){const c=this.ensureCtx();if(!c)return;
    if(c.state!=='running'){try{const p=c.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
    if(this.graph)return;this.graph=true;if(!NZ.white)try{makeNoise()}catch(e){}
    try{this.build(c)}catch(e){console.warn('audio graph',e)}},
  build(c){
    this.master=c.createGain();this.master.connect(c.destination);
    const lim=c.createDynamicsCompressor();lim.threshold.value=-2.5;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=.002;lim.release.value=.08;lim.connect(this.master);
    const glue=c.createDynamicsCompressor();glue.threshold.value=-16;glue.knee.value=8;glue.ratio.value=2.5;glue.attack.value=.006;glue.release.value=.2;glue.connect(lim);
    this.muf=c.createBiquadFilter();this.muf.type='lowpass';this.muf.frequency.value=20000;this.muf.Q.value=.6;this.muf.connect(glue);
    const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;hp.Q.value=.7;hp.connect(this.muf);
    this.mix=c.createGain();this.mix.connect(hp);
    const pres=c.createBiquadFilter();pres.type='peaking';pres.frequency.value=2600;pres.Q.value=.8;pres.gain.value=2;pres.connect(this.mix);
    this.sfx=c.createGain();this.sfx.connect(pres);this.revIn=c.createGain();
    try{const conv=c.createConvolver();conv.buffer=makeIR(c);const revOut=c.createGain();revOut.gain.value=.4;this.revIn.connect(conv);conv.connect(revOut);revOut.connect(this.mix)}catch(e){console.warn('reverb',e)}
    this.duck=c.createGain();this.duck.connect(this.mix);
    const ahp=c.createBiquadFilter();ahp.type='highpass';ahp.frequency.value=40;ahp.Q.value=.7;ahp.connect(this.duck);
    this.amb=c.createGain();this.amb.gain.value=0;this.amb.connect(ahp);
    const mhp=c.createBiquadFilter();mhp.type='highpass';mhp.frequency.value=55;mhp.Q.value=.7;mhp.connect(this.duck);
    this.mus=c.createGain();this.mus.gain.value=0;this.mus.connect(mhp);
    this.apply();
    try{this.startAmb()}catch(e){console.warn('ambience',e)}
    try{this.startMusic()}catch(e){console.warn('music',e)}},
  apply(){if(!this.master)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.muted?0:this.vol,t,.05);if(this.mus)this.mus.gain.setTargetAtTime(this.musicOn&&!this.muted?SOUND_MIX.music:0,t,.3)},
  throttle(k,ms){const n=performance.now();if(this.last[k]&&n-this.last[k]<ms)return true;this.last[k]=n;return false},
  play(name,o){o=o||{};const d=SFX[name],bank=this.bank[name];if(!this.sfx||!d||!bank||!bank.length||this.muted||this.vol<=0)return null;
    const sd=soundDesign(name);const vol=(o.vol==null?1:o.vol)*(d.gain||1)*(sd.vol==null?1:sd.vol);if(!(vol>=.006))return null;
    const c=this.ctx,now=c.currentTime;if(c.state!=='running')return null;
    const L=this.voices[name]||(this.voices[name]=[]);while(L.length&&L[0].end<now)L.shift();
    if(L.length>=(d.poly||6)){const v=L.shift();try{v.g.gain.setTargetAtTime(0,now,.01);v.s.stop(now+.06)}catch(e){}}
    if(this.nvo>64&&d.low)return null;
    const s=c.createBufferSource();s.buffer=bank[(Math.random()*bank.length)|0];const pj=d.pj==null?.035:d.pj;s.playbackRate.value=(o.rate||1)*(sd.rate||1)*(1+(Math.random()*2-1)*pj);
    const far=clamp(o.far||0,0,1);let n=s;
    if(far>.03||o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=Math.min(o.lp||20000,lerp(17000,1500,Math.pow(far,.8)));f.Q.value=.5;n.connect(f);n=f}
    const g=c.createGain();g.gain.value=vol;n.connect(g);n=g;
    if(c.createStereoPanner&&o.pan){const p=c.createStereoPanner();p.pan.value=clamp(o.pan,-1,1);n.connect(p);n=p}
    n.connect(o.bus||this.sfx);
    const rs=(o.rev!=null?o.rev:(d.rev==null?.12:d.rev))+(o.bus?0:far*.45);if(rs>.01){const sg=c.createGain();sg.gain.value=rs*vol;n.connect(sg);sg.connect(this.revIn)}
    const t=(o.at||now)+(o.delay||0);s.start(t);this.nvo++;s.onended=()=>{this.nvo--;try{g.disconnect()}catch(e){}};
    const v={s,g,end:t+s.buffer.duration/s.playbackRate.value};L.push(v);return v},
  // positional: distance attenuation, stereo from the listener's yaw, occlusion muffling
  at(name,x,y,z,o){o=o||{};const L=this.L;const dx=x-L.x,dy=y-L.y,dz=z-L.z;const d=Math.hypot(dx,dy,dz);const R0=o.range||45;if(d>R0)return null;
    const att=Math.pow(1-d/R0,1.6)*(1/(1+d*.06));const ang=Math.atan2(dx,dz);const rel=wrapA(ang-(L.yaw+Math.PI));
    const pan=d<1?0:clamp(Math.sin(rel)*-1,-1,1)*Math.min(1,d/4)*.85;
    let lp=null;if(o.occ!==false&&d>2&&!losClear(L.x,L.y,L.z,x,y+.5,z)){lp=900;o.vol=(o.vol==null?1:o.vol)*.65}
    return this.play(name,Object.assign({},o,{vol:(o.vol==null?1:o.vol)*att,pan,far:clamp(d/R0,0,1),lp:lp||o.lp,delay:o.delay!=null?o.delay:d/340}))},
  // rotary-barrel motor: one looping voice whose pitch and level follow the spin
  spin(v,firing){const c=this.ctx;if(!c||!this.sfx||c.state!=='running')return;const b=this.bank.spinloop;if(!b||!b.length)return;
    if(!this.spinS){if(!(v>.01))return;const s=c.createBufferSource();s.buffer=b[0];s.loop=true;const g=c.createGain();g.gain.value=0;s.connect(g);g.connect(this.sfx);s.start();this.spinS=s;this.spinG=g}
    const t=c.currentTime;const sd=soundDesign('spinloop');this.spinS.playbackRate.setTargetAtTime((.5+.7*v)*(sd.rate||1),t,.06);this.spinG.gain.setTargetAtTime(this.muted||!(v>.01)?0:(.1+.2*v)*(firing?.75:1)*sd.vol,t,.06)},
  // stop every voice of one sound (e.g. the round-start countdown when the round is cut short)
  stopAll(name){const L=this.voices[name];if(!L||!this.ctx)return;const now=this.ctx.currentTime;for(const v of L){try{v.g.gain.setTargetAtTime(0,now,.03);v.s.stop(now+.15)}catch(e){}}L.length=0},
  setAmb(v){if(this.amb)this.amb.gain.setTargetAtTime(v*SOUND_MIX.ambience,this.ctx.currentTime,.8)},
  muffle(on){this.mufBase=on?800:20000;if(this.muf)this.muf.frequency.setTargetAtTime(this.mufBase,this.ctx.currentTime,.15)},
  shock(k){if(!this.muf||!(k>.02))return;k=Math.min(1,k);const c=this.ctx,t=c.currentTime;
    const f=this.muf.frequency;f.cancelScheduledValues(t);f.setValueAtTime(Math.max(40,f.value),t);f.exponentialRampToValueAtTime(lerp(11000,900,k),t+.04);f.setTargetAtTime(this.mufBase,t+.22,.3+k*.55);
    if(this.duck){const dg=this.duck.gain;dg.cancelScheduledValues(t);dg.setValueAtTime(dg.value,t);dg.linearRampToValueAtTime(1-k*.5,t+.03);dg.setTargetAtTime(1,t+.25,.6)}},
  // ---------- ambience: rain bed, wind, far sirens and growls ----------
  startAmb(){const c=this.ctx;if(!NZ.pink)return;
    const mk=(buf,type,f,q,pan,lev,lfoF,lfoD)=>{const s=c.createBufferSource();s.buffer=NZ[buf];s.loop=true;const bp=c.createBiquadFilter();bp.type=type;bp.frequency.value=f;bp.Q.value=q;const g=c.createGain();g.gain.value=lev;
      s.connect(bp);bp.connect(g);if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(this.amb)}else g.connect(this.amb);
      if(lfoF){const l=c.createOscillator();l.frequency.value=lfoF;const lg=c.createGain();lg.gain.value=f*lfoD;l.connect(lg);lg.connect(bp.frequency);l.start()}s.start(0,Math.random()*3);return {g,lev}};
    this.rainL=[mk('white','bandpass',5200,.6,-.5,.12),mk('white','bandpass',4600,.6,.5,.12),mk('pink','bandpass',1400,.5,0,.14),mk('pink','lowpass',380,.7,0,.16)];
    this.wind=[mk('pink','bandpass',420,.6,-.4,.3,.06,.3),mk('pink','bandpass',900,1.4,.4,.12,.09,.3)];
    const hum=c.createOscillator();hum.frequency.value=50;const hg=c.createGain();hg.gain.value=.012;hum.connect(hg);hg.connect(this.amb);hum.start();
    // underground: a low drone of air handling and distant traffic in the tunnels
    this.drone=[mk('brown','lowpass',95,.7,0,0,.05,.25),mk('pink','bandpass',180,1.2,.3,0,.03,.2)];this.drone[0].lev=.5;this.drone[1].lev=.09;
    const t=c.currentTime;this.nGust=t+3;this.nSiren=t+rr(15,30);this.nGrowl=t+rr(4,8);this.nThunder=t+rr(20,40);this.ambOn=true;this.setEnv(this.env)},
  // map ambience: rain and thunder outdoors, a drone and far rumbles underground
  setEnv(E){this.env=E||null;this.under=!!(E&&E.under);this.storm=!!(E&&E.storm);if(!this.ctx||!this.rainL)return;const t=this.ctx.currentTime;
    for(const d of this.drone)d.g.gain.setTargetAtTime(this.under?d.lev:0,t,.6);this.rainIndoor(this.lastIn||0)},
  rainIndoor(k){if(!this.rainL)return;this.lastIn=k;const t=this.ctx.currentTime,u=this.under,rain=!(this.env&&!this.env.rain);
    this.rainL.forEach((r,i)=>r.g.gain.setTargetAtTime(!rain?0:u?r.lev*(i===3?.18:0):r.lev*(i<2?lerp(1,.25,k):lerp(1,.7,k)),t,.4))},
  // ---------- music ----------
  startMusic(){const c=this.ctx;const mk=n=>{const g=c.createGain();g.gain.value=0;g.connect(this.mus);MU.L[n]=g;return g};
    for(const n of ['pad','bell','bass','drum','arp','perc','sting'])mk(n);MU.L.sting.gain.value=1;
    const send=(n,v)=>{const s=c.createGain();s.gain.value=v;MU.L[n].connect(s);s.connect(this.revIn)};send('pad',.5);send('bell',.8);send('arp',.35);send('drum',.12);send('perc',.1);send('sting',.6);
    const dl=c.createDelay(2);dl.delayTime.value=60/MU.bpm*.75;const fb=c.createGain();fb.gain.value=.3;const dlf=c.createBiquadFilter();dlf.type='lowpass';dlf.frequency.value=2000;MU.L.arp.connect(dl);dl.connect(dlf);dlf.connect(fb);fb.connect(dl);dlf.connect(this.mus);
    MU.padF=c.createBiquadFilter();MU.padF.type='lowpass';MU.padF.frequency.value=800;MU.padF.Q.value=.7;MU.padF.connect(MU.L.pad);const lfo=c.createOscillator();lfo.frequency.value=.06;const lg=c.createGain();lg.gain.value=300;lfo.connect(lg);lg.connect(MU.padF.frequency);lfo.start();
    MU.next=c.currentTime+.2;MU.step=0;MU.started=true;MU.timer=setInterval(()=>this.muTick(),30);this.muSet('calm',true)},
  muTick(){const c=this.ctx;if(!c||c.state!=='running'||!MU.started)return;const sd=60/MU.bpm/4;if(MU.next<c.currentTime-.25)MU.next=c.currentTime+.05;
    while(MU.next<c.currentTime+.16){try{this.muStep(MU.step,MU.next)}catch(e){}MU.step=(MU.step+1)%128;MU.next+=sd}},
  muSet(s,now){if(!MU.started||(MU.state===s&&!now))return;MU.state=s;MU.T=MUS_LV[s];const t=this.ctx.currentTime;
    for(const k in MU.T)MU.L[k].gain.setTargetAtTime(MU.T[k],t,now?.05:(s==='intense'||s==='fight'?.5:1.4))},
  muStep(s,t){const bar=s>>4,st=s&15,C=CHORDS[(bar>>1)&3],T=MU.T;
    if(st===0&&(bar&1)===0)this.padChord(C,t);
    if(T.bell>0&&st===0&&Math.random()<.6)this.bell(C.n[(Math.random()*4)|0]+24,t,rr(.5,1));
    if(T.bass>0&&(st&1)===0){const acc=(st===0||st===6||st===10)?1:(st===12?.85:.5);this.bass(C.b+(T.perc>0&&st===14?12:0),t,acc)}
    if(T.drum>0){if(st===0||st===8)this.hit('zstep',t,1.6,'drum');if(st===10&&T.perc>0)this.hit('zstep',t,1.2,'drum');if(st%4===2)this.hit('hit',t,rr(.25,.4),'drum')}
    if(T.perc>0){if(st===4||st===12)this.hit('imp_conc',t,.9,'perc');if(st%2===1&&Math.random()<.5)this.hit('casing',t,rr(.3,.5),'perc')}
    if(T.arp>0&&(T.perc>0||st%2===0)){const pat=[0,2,1,3,2,1,3,0];this.pluck(C.n[pat[(T.perc>0?st:st>>1)%8]]+12,t,T.perc>0?.8:.6)}},
  hit(name,t,v,layer){this.play(name,{vol:v,at:t,bus:MU.L[layer],rev:0,delay:0})},
  padChord(C,t){const c=this.ctx;for(const v of MU.pad){v.g.gain.cancelScheduledValues(t);v.g.gain.setValueAtTime(v.top,t);v.g.gain.setTargetAtTime(0,t,.9);for(const o of v.o)o.stop(t+5)}MU.pad=[];
    C.n.forEach((m,i)=>{const f=mtof(m);const g=c.createGain();const top=i===3?.03:.05;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(top,t+1.8);g.connect(MU.padF);const os=[];
      for(const d of [-8,8]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=d+rr(-2,2);o.connect(g);o.start(t);os.push(o)}
      if(i===0){const o=c.createOscillator();o.type='triangle';o.frequency.value=f/2;o.connect(g);o.start(t);os.push(o)}MU.pad.push({g,o:os,top})})},
  bell(m,t,v,bus){const c=this.ctx,f=mtof(m);for(const [r,l,d] of [[1,.08,2.6],[2.76,.03,1.2],[5.4,.012,.5]]){const o=c.createOscillator();o.frequency.value=f*r;const g=c.createGain();g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(l*v,t+.004);g.gain.exponentialRampToValueAtTime(1e-4,t+d);o.connect(g);g.connect(bus||MU.L.bell);o.start(t);o.stop(t+d+.05)}},
  bass(m,t,acc){const c=this.ctx,f=mtof(m);const lp=c.createBiquadFilter();lp.type='lowpass';lp.Q.value=5;lp.frequency.setValueAtTime(220+700*acc,t);lp.frequency.exponentialRampToValueAtTime(130,t+.15);
    const g=c.createGain();g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(.2*acc,t+.006);g.gain.exponentialRampToValueAtTime(1e-4,t+.22);lp.connect(g);g.connect(MU.L.bass);
    const o=c.createOscillator();o.type='sawtooth';o.frequency.value=f;o.connect(lp);const o2=c.createOscillator();o2.type='square';o2.frequency.value=f/2;const g2=c.createGain();g2.gain.value=.28;o2.connect(g2);g2.connect(lp);o.start(t);o2.start(t);o.stop(t+.28);o2.stop(t+.28)},
  pluck(m,t,v){const c=this.ctx,f=mtof(m);const o=c.createOscillator();o.type='triangle';o.frequency.value=f;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(3000,t);lp.frequency.exponentialRampToValueAtTime(600,t+.2);
    const g=c.createGain();g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(.065*v,t+.004);g.gain.exponentialRampToValueAtTime(1e-4,t+.26);o.connect(lp);lp.connect(g);g.connect(MU.L.arp);o.start(t);o.stop(t+.3)},
  // ---------- per-frame ----------
  update(dt,info){const c=this.ctx;if(!c||!this.master||c.state!=='running')return;const t=c.currentTime;
    if(this.ambOn&&this.wind){if(t>this.nGust){const k=rr(.5,1.5)*(this.under?.22:1);for(const w of this.wind)w.g.gain.setTargetAtTime(w.lev*k,t,rr(.6,1.6));this.nGust=t+rr(2.5,7)}
      if(t>this.nSiren){if(this.under)this.play('thunder',{vol:rr(.25,.45),pan:rr(-1,1),far:1,rev:.9,lp:260});else this.play('siren',{vol:rr(.12,.25),pan:rr(-1,1),far:1,rev:.9,lp:1100});this.nSiren=t+rr(40,80)}
      if(info.play&&t>this.nGrowl){this.play('zgrowl',{vol:rr(.08,.18),pan:rr(-1,1),far:1,rev:.8,lp:900});this.nGrowl=t+rr(6,14)}
      if(t>this.nThunder){if(this.storm&&!this.under){this.play('thunder',{vol:rr(.4,.8),pan:rr(-.7,.7),far:.6,rev:.7});if(info.flash)info.flash()}this.nThunder=t+rr(35,70)}}
    const sev=info.low||0;if(sev>.02){if(t>this.nextBeat){this.play('heart',{vol:.25+.6*sev});this.nextBeat=t+lerp(1.05,.6,sev)}}
    if(info.music)this.muSet(info.music)},
};

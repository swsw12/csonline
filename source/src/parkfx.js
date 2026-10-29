'use strict';
// ============ (v7.11) 별빛랜드's sounds (the map is mappark.js; the sound bank is audio.js, built after the maps, so they live here) ============
// the carousel's music box: a little waltz in A minor on its comb's tines, winding down a shade as it goes (played from the carousel by slTick)
Object.assign(SFX,{
  slmbox:{n:1,dur:8.2,ch:2,peak:.7,gain:.5,rev:.35,poly:1,fn:B=>{const o=B.g(.9),bt=.56;
    const M=[[0,659.3,1],[1,523.3,1],[2,440,1],[3,493.9,1],[4,415.3,1],[5,329.6,1],[6,698.5,1],[7,659.3,1],[8,587.3,.5],[8.5,523.3,.5],[9,493.9,1],[10,523.3,1],[11,440,1.6]];
    for(const [b,f,len] of M){const t=b*bt,w=1-t/9*.012;B.ring(t,f*w,[1,2.98,5.43],[.9*len,.28,.09],[.32,.07,.025],B.pan(rr(-.25,.25),o))}
    for(const [b,f] of [[0,220],[3,164.8],[6,146.8],[9,164.8],[11,110]])B.ring(b*bt,f,[1,2.01,3.02],[1.2,.4,.15],[.22,.05,.02],o);
    for(const [b,f] of [[1,329.6],[2,329.6],[4,329.6],[5,246.9],[7,349.2],[8,349.2],[10,329.6]])B.ring(b*bt,f,[1,2.98],[.5,.15],[.1,.02],B.pan(rr(-.4,.4),o))}}});
SFX_ORDER.push('slmbox');

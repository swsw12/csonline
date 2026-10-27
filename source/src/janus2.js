'use strict';
// ============ 「이태훈 딕건」 (TWINFACE-2: v6.55, the name v6.55.1) — v6.68: rebuilt to the owner's second design sheet ============
// Everything is the sheet's, as written: its 304 parts (the numbers unchanged), its 14 materials, the points, the hinge, the stats, the
// motions and the B form's timing. None of the v6.55 build's own changes is left (the figures moved back, the bridge under the sight, the
// longer barrel with a bore, our own Mary). Where the sheet leaves something open it is filled in the plainest way:
//  · res 0 with an immediate reload: it loads itself. Right after every shot the barrel breaks 45° on its hinge, the case flies out, a
//    fresh grenade goes in and it shuts (1 s, the sheet's reload); there are no spare rounds to carry (the HUD shows ∞)
//  · the split: the sheet's three ways (the upper half with the rails, the sight and the figures +y 5 mm; the lower halves 4 mm out and
//    5 mm down); a thorn goes with the half its root sits on, the ones near the barrel's centre line (y .030) in between: t = the root's
//    height off the line over 9.5 mm (the distance to either half's middle)
//  · thorn_s grow ×1 → ×2 along their length, thornB from nothing to ×1 (whole), the root fixed (the sheet's ax, the distance from the
//    root to where the part starts, scales with the length)
//  · the closing (not in the sheet) is the opening played backwards: the figures turn back first (0.55 s), then the thorns sink and
//    the halves shut (0.85 s in all, no firing)
//  · the world models (third person, other players) leave out the parts' fillets: plain boxes, as every distant model
// One-handed (the sheet's sup / leftHand null): the free hand only comes up to put a grenade in on a reload.
// The TWINFACE machinery is janus.js's: every blast that catches a zombie counts once (targetHits 5, multiHitCount 1), five give the signal
// (Christ's eyes glow gold — glow_jesus, steady, with a halo round them in the first-person view only), a right click within 35 s opens
// the B form: thorns and halves over 0.5 s; from 0.3 s the figures turn over upward on the sight's back for 0.55 s (ease-in-out), a
// revolving door about y .07325, z −.025: Christ 0 → −180°, Mary +180° → 0; Mary shows from 90°, where Christ's eyes go out, and Christ
// goes at 180°. No firing until it is done (0.85 s), then 5 s of grenades without limit at 214 a minute: the same shot, kick and flame
// as one at a time. The barrel only breaks on a reload and the first draw. No gold flash, no shaking.
// Damage (the sheet's damageLogic): 120 a blast, 60 % of it still at the edge (×2.5 in the chapters, as TWINFACE-1); its 35 against people
// has nothing to hit (no friendly fire, the TWINFACE guns are not in PvP).

// ---------- atlas: the sheet's materials_new — three tones (dark, mid, light), the pattern, gloss, scratch ----------
const J2_MDEF={
  janus_blue:[['#1A2421','#2A3638','#4A5D59'],'brushed',.3,.2],janus_gold:[['#B8860B','#DAA520','#FFD700'],'brushed',.8,.1],
  janus_engraved:[['#8B6508','#B8860B','#DAA520'],'engraved',.5,.1],glow_jesus:[['#FFD700','#FFD700','#FFD700'],'glow',1,0],
  glow_white:[['#FFFFFF','#FFFFFF','#FFFFFF'],'glow',1,0],janus_green:[['#111613','#1A201C','#242E28'],'grain',.15,.2],
  skin_pale:[['#C8B390','#E6D6B4','#FBF1DA'],'noise',.2,.02],gold_hair:[['#7A5410','#C08A24','#F0C850'],'brushed',.6,.05],
  lip_pale:[['#9C6A58','#B9806A','#D09A84'],'noise',.15,0],mary_skin:[['#B4B6B9','#D4D6D8','#F0F1F2'],'noise',.15,.05],
  hair_black:[['#0A0A0C','#16161A','#24242A'],'brushed',.3,0],lip_red:[['#6E2A2E','#9A3D42','#C05A5E'],'noise',.2,0],
  hood_black:[['#020203','#0C0C10','#1C1C24'],'stripes',.05,0],mary_hood:[['#33363A','#4B4F53','#62676C'],'stripes',.1,0]};
const J2_MATS=Object.keys(J2_MDEF);
for(const m of J2_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintJ2Atlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const patch=(name,fn,alpha)=>{const i=GA.idx[name];if(i==null||i>=GA_SLOTS)return;const x0=(i%8)*PS,y0=Math.floor(i/8)*PS;const id=x.getImageData(x0,y0,PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const c=fn(xx,y,x0+xx,y0+y);if(!c)continue;const k=(y*PS+xx)*4;const r=rgbOf(c);D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=alpha||255}
    x.putImageData(id,x0,y0)};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // scratches: short light strokes at a slant, as many as the sheet's scratch asks
  const scr=(xx,y,s,k)=>k>0&&hash2(Math.floor((xx+y*.4)/3),Math.floor(y/7),s)<k*.06;
  const tone=(c,t)=>t<.5?mix(c[0],c[1],clamp(t*2,0,1)):mix(c[1],c[2],clamp(t*2-1,0,1));
  const PAT={
    // fine streaks over a slow cloud, a soft band of sheen
    brushed:(c,s,k)=>(xx,y,X,Y)=>{const t=.5+(hash2(Math.floor(xx/24)+s,y,s)-.5)*.32+(nz(X,Y,s+1,22)-.5)*.75,b=Math.max(0,1-Math.abs(((y+xx*.3)%64)-32)/10);
      let o=mix(tone(c,t),c[2],b*.3);if(scr(xx,y,s+2,k))o=lt(c[2],.15);return o},
    // scrollwork cut into the metal: dark grooves with a lit edge along them
    engraved:(c,s,k)=>(xx,y,X,Y)=>{const sc=Math.sin(xx*.18+Math.sin(y*.21)*2.2)*Math.cos(y*.16+Math.cos(xx*.12)*1.8);
      let o=sc>.62?c[0]:sc>.5?c[2]:tone(c,.5+(nz(X,Y,s,14)-.5)*.6);if(y<3||y>124)o=c[0];if(scr(xx,y,s+2,k))o=lt(c[2],.12);return o},
    // a light: one colour all over (alpha 232, it keeps it in the dark)
    glow:c=>()=>c[1],
    // the grip: a grain running along it
    grain:(c,s,k)=>(xx,y,X,Y)=>{const g=Math.sin(xx*.35+nz(X,Y,s,20)*7)*.5+.5;let o=g>.72?c[2]:g<.3?c[0]:c[1];if(nz(X,Y,s+1,10)>.66)o=lt(o,.05);if(scr(xx,y,s+2,k))o=lt(c[2],.1);return o},
    // carved and smooth: a soft mottle in the three tones
    noise:(c,s,k)=>(xx,y,X,Y)=>{const t=nz(X,Y,s,12)+(hash2(X,Y,s+1)-.5)*.1;let o=t>.6?c[2]:t<.4?c[0]:c[1];if(scr(xx,y,s+2,k))o=lt(c[2],.08);return o},
    // cloth: soft stripes of the folds and a fine weave
    stripes:(c,s,k)=>(xx,y,X,Y)=>{const b=Math.sin(xx*.42+nz(X,Y,s,24)*2.6);let o=b>.45?c[2]:b<-.45?c[0]:c[1];if(hash2(xx>>1,y>>1,s+1)<.12)o=dk(o,.12);if(scr(xx,y,s+2,k))o=lt(c[2],.08);return o}};
  // alpha: 232 a light; gloss .3 and up a sheen on the world model, 248..254 (lower would light itself in the view model); under it matte
  J2_MATS.forEach((m,i)=>{const [c,p,gl,k]=J2_MDEF[m];patch(m,PAT[p](c,1701+i*10,k),p==='glow'?232:gl>=.3?Math.min(254,Math.max(248,Math.round(239+15*gl))):255)});
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintJ2Atlas()}}

// ---------- the sheet's parts, unchanged: [x, y, z, w, h, d, material, rx, ry, rz, fillet, tag, ax] (ax on the thorns only) ----------
const J2_TAGS=['body','break_inner','break_outer_up_r','break_outer_dn_r','break_outer_bot_r','break_outer_top_r','break_outer_up_l','break_outer_dn_l','break_outer_bot_l','break_outer_top_l','scope_part','statue_jesus_eyes','statue_mary_eyes','trigger','shell','thorn_base','statue_jesus','statue_mary','thorn_s','thornB'];
const J2_P=[
[0,.015,.013,.03,.045,.032,'janus_green',0,0,0,.0015,0],[0,-.036,.012,.006,.003,.03,'blk',0,0,0,.0015,0],[0,-.001,.013,.032,.0115,.051,'janus_green',-.924,0,0,.0015,0],[0,-.003,.016,.032,.0115,.049,'janus_green',-.889,0,0,.0015,0],
[0,-.006,.019,.032,.0115,.047,'janus_green',-.854,0,0,.0015,0],[0,-.009,.023,.031,.0115,.045,'janus_green',-.819,0,0,.0015,0],[0,-.011,.026,.032,.0115,.045,'janus_green',-.785,0,0,.0015,0],[0,-.015,.029,.032,.0115,.044,'janus_green',-.751,0,0,.0015,0],
[0,-.018,.031,.032,.0115,.044,'janus_green',-.718,0,0,.0015,0],[0,-.021,.034,.032,.0115,.044,'janus_green',-.685,0,0,.0015,0],[0,-.024,.037,.032,.0115,.044,'janus_green',-.653,0,0,.0015,0],[0,-.028,.04,.033,.0115,.044,'janus_green',-.622,0,0,.0015,0],
[0,-.032,.042,.033,.0115,.044,'janus_green',-.591,0,0,.0015,0],[0,-.035,.045,.033,.0115,.045,'janus_green',-.562,0,0,.0015,0],[0,-.039,.047,.033,.0115,.045,'janus_green',-.533,0,0,.0015,0],[0,-.043,.049,.033,.0115,.045,'janus_green',-.505,0,0,.0015,0],
[0,-.048,.052,.033,.0115,.046,'janus_green',-.478,0,0,.0015,0],[0,-.052,.054,.033,.0115,.046,'janus_green',-.452,0,0,.0015,0],[0,-.056,.056,.033,.0115,.046,'janus_green',-.426,0,0,.0015,0],[0,-.061,.058,.033,.0115,.046,'janus_green',-.401,0,0,.0015,0],
[0,-.066,.06,.032,.0115,.046,'janus_green',-.378,0,0,.0015,0],[0,-.07,.062,.032,.0115,.046,'janus_green',-.355,0,0,.0015,0],[0,-.075,.063,.032,.0115,.046,'janus_green',-.332,0,0,.0015,0],[0,-.08,.065,.031,.0115,.046,'janus_green',-.311,0,0,.0015,0],
[0,-.086,.067,.031,.0115,.046,'janus_green',-.29,0,0,.0015,0],[0,-.091,.068,.03,.0115,.046,'janus_green',-.27,0,0,.0015,0],[0,-.096,.07,.034,.006,.052,'janus_gold',-.26,0,0,.0015,0],[0,.03,-.0425,.022,.045,.012,'janus_gold',0,0,0,.002,1],
[0,.015,-.02,.032,.05,.04,'janus_gold',0,0,0,.002,0],[0,.015,-.02,.034,.04,.03,'janus_blue',0,0,0,.002,0],[0,.042,-.01,.01,.01,.03,'janus_gold',.2,0,0,.001,0],[0,.015,-.02,.036,.01,.01,'blk',0,0,0,.001,0],
[0,.03,-.12,.014,.035,.15,'janus_gold',0,0,0,.002,1],[.0075,.0395,-.12,.015,.021,.15,'janus_blue',0,0,0,.002,2],[.0075,.0205,-.12,.015,.021,.15,'janus_blue',0,0,0,.002,3],[.008,.005,-.11,.016,.015,.12,'janus_engraved',0,0,0,.002,4],
[.005,.052,-.12,.01,.006,.15,'rail',0,0,0,.001,5],[.008,.0405,-.19,.017,.023,.01,'janus_blue',0,0,0,.001,2],[.008,.0195,-.19,.017,.023,.01,'janus_blue',0,0,0,.001,3],[-.0075,.0395,-.12,.015,.021,.15,'janus_blue',0,0,0,.002,6],
[-.0075,.0205,-.12,.015,.021,.15,'janus_blue',0,0,0,.002,7],[-.008,.005,-.11,.016,.015,.12,'janus_engraved',0,0,0,.002,8],[-.005,.052,-.12,.01,.006,.15,'rail',0,0,0,.001,9],[-.008,.0405,-.19,.017,.023,.01,'janus_blue',0,0,0,.001,6],
[-.008,.0195,-.19,.017,.023,.01,'janus_blue',0,0,0,.001,7],[0,.0645,-.0575,.026,.021,.065,'blk',0,0,0,.002,10],[0,.08,-.04,.026,.025,.03,'blk',0,0,0,.002,10],[.00473,.07834,-.023,.00355,.00278,.004,'glow_white',0,0,0,0,11],
[-.00473,.07834,-.023,.00355,.00278,.004,'glow_white',0,0,0,0,11],[.0045,.07595,-.023,.0045,.0024,.004,'glow_white',0,0,0,0,12],[-.0045,.07595,-.023,.0045,.0024,.004,'glow_white',0,0,0,0,12],[0,-.015,-.01,.004,.015,.01,'blk',.2,0,0,.001,13],
[0,-.035,-.02,.006,.002,.04,'blk',.15,0,0,.001,0],[0,-.01,-.04,.006,.05,.002,'blk',0,0,0,.001,0],[0,.03,-.05,.02,.02,.04,'brass',0,0,0,.005,14],[.016,.03,-.081,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],
[.016,.03,-.103,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[.016,.03,-.125,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],[.016,.03,-.147,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[.016,.03,-.169,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],
[.016,.03,-.191,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[-.015,.03,-.081,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],[-.015,.03,-.103,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[-.015,.03,-.125,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],
[-.015,.03,-.147,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[-.015,.03,-.169,.002,.002,.033,'janus_gold',-.785,0,0,.001,15],[-.015,.03,-.191,.002,.002,.033,'janus_gold',.785,0,0,.001,15],[0,.07556,-.024,.01891,.02227,.004,'skin_pale',0,0,0,.001,16],
[0,.08321,-.0215,.01418,.00557,.003,'skin_pale',0,0,0,.001,16],[.00473,.08182,-.0205,.00709,.00278,.002,'gold_hair',0,0,0,.001,16],[-.00473,.08182,-.0205,.00709,.00278,.002,'gold_hair',0,0,0,.001,16],[.0065,.07208,-.0215,.00473,.00417,.003,'skin_pale',0,0,0,.001,16],
[-.0065,.07208,-.0215,.00473,.00417,.003,'skin_pale',0,0,0,.001,16],[0,.07625,-.0205,.00355,.00835,.004,'skin_pale',0,0,0,.001,16],[0,.07208,-.0195,.00473,.00417,.003,'skin_pale',0,0,0,.001,16],[.00355,.0693,-.0205,.00709,.00278,.003,'gold_hair',0,0,-.2,.001,16],
[-.00355,.0693,-.0205,.00709,.00278,.003,'gold_hair',0,0,.2,.001,16],[0,.06651,-.021,.00709,.00278,.002,'lip_pale',0,0,0,.001,16],[0,.06373,-.021,.00591,.00278,.002,'lip_pale',0,0,0,.001,16],[0,.06094,-.0215,.01182,.00696,.003,'gold_hair',0,0,0,.001,16],
[.00768,.0679,-.0225,.00473,.00835,.003,'gold_hair',0,0,0,.001,16],[-.00768,.0679,-.0225,.00473,.00835,.003,'gold_hair',0,0,0,.001,16],[0,.08626,-.0235,.02127,.00557,.005,'gold_hair',0,0,0,.001,16],[.00591,.08461,-.0215,.00709,.00417,.003,'gold_hair',0,0,-.35,.001,16],
[-.00591,.08461,-.0215,.00709,.00417,.003,'gold_hair',0,0,.35,.001,16],[0,.07355,-.024,.021,.0192,.004,'mary_skin',0,0,0,.001,17],[.0045,.07855,-.0205,.006,.0024,.002,'hair_black',0,0,0,.001,17],[-.0045,.07855,-.0205,.006,.0024,.002,'hair_black',0,0,0,.001,17],
[0,.07415,-.0205,.003,.006,.003,'mary_skin',0,0,0,.001,17],[0,.07055,-.0198,.0045,.0024,.003,'mary_skin',0,0,0,.001,17],[0,.06695,-.0208,.0075,.0024,.002,'lip_red',0,0,0,.001,17],[0,.06455,-.0208,.006,.0024,.002,'lip_red',0,0,0,.001,17],
[.01123,.08419,-.0235,.00355,.00835,.005,'gold_hair',0,0,0,.001,16],[-.01123,.08419,-.0235,.00355,.00835,.005,'gold_hair',0,0,0,.001,16],[.00414,.08694,-.0195,.00473,.00417,.003,'gold_hair',0,0,.4,.001,16],[-.00414,.08694,-.0195,.00473,.00417,.003,'gold_hair',0,0,-.4,.001,16],
[0,.08694,-.0225,.01891,.00417,.004,'gold_hair',0,0,0,.001,16],[.006,.08285,-.0212,.009,.0036,.003,'hair_black',0,0,-.3,.001,17],[-.006,.08285,-.0212,.009,.0036,.003,'hair_black',0,0,.3,.001,17],[.01095,.07415,-.0213,.003,.0168,.003,'hair_black',0,0,0,.001,17],
[-.01095,.07415,-.0213,.003,.0168,.003,'hair_black',0,0,0,.001,17],[-.00709,.08694,-.0198,.00355,.00417,.003,'gold_hair',0,0,-.5,.001,16],[-.00355,.08694,-.0198,.00355,.00417,.003,'gold_hair',0,0,.5,.001,16],[0,.08694,-.0198,.00355,.00417,.003,'gold_hair',0,0,-.5,.001,16],
[.00355,.08694,-.0198,.00355,.00417,.003,'gold_hair',0,0,.5,.001,16],[.00709,.08694,-.0198,.00355,.00417,.003,'gold_hair',0,0,-.5,.001,16],[0,.07325,-.0262,.026,.0385,.002,'mary_hood',0,0,0,.001,17],[.0118,.07325,-.0225,.0024,.0385,.007,'mary_hood',0,0,0,.001,17],
[-.0118,.07325,-.0225,.0024,.0385,.007,'mary_hood',0,0,0,.001,17],[0,.0905,-.0225,.026,.004,.007,'mary_hood',0,0,0,.001,17],[0,.0575,-.0225,.026,.007,.007,'mary_hood',0,0,0,.001,17],[0,.08015,-.0215,.015,.0036,.003,'mary_skin',0,0,0,.001,17],
[.00675,.07055,-.0215,.0045,.0036,.002,'mary_skin',0,0,0,.001,17],[-.00675,.07055,-.0215,.0045,.0036,.002,'mary_skin',0,0,0,.001,17],[0,.06335,-.0215,.0105,.0048,.003,'mary_skin',0,0,0,.001,17],[0,.08583,-.0212,.021,.00595,.003,'hair_black',0,0,0,.001,17],
[.01869,.0441,-.07,.0045,.0109,.0035,'janus_gold',0,0,-.8,.0005,18,-.001],[.02461,.04985,-.07,.0032,.0076,.0026,'janus_gold',0,0,-.8,.0005,18,.0089],[.02895,.05406,-.07,.002,.0065,.002,'janus_gold',0,0,-.8,.0005,18,.0155],[.01934,.01527,-.092,.0045,.0127,.0035,'janus_gold',0,0,3.94159,.0005,18,-.001],
[.02633,.00848,-.092,.0032,.0088,.0026,'janus_gold',0,0,3.94159,.0005,18,.0107],[.03146,.0035,-.092,.002,.0075,.002,'janus_gold',0,0,3.94159,.0005,18,.0185],[.01998,.04535,-.114,.0045,.0145,.0035,'janus_gold',0,0,-.8,.0005,18,-.001],[.02805,.05319,-.114,.0032,.01,.0026,'janus_gold',0,0,-.8,.0005,18,.0125],
[.03397,.05894,-.114,.002,.0085,.002,'janus_gold',0,0,-.8,.0005,18,.0215],[.01869,.0159,-.136,.0045,.0109,.0035,'janus_gold',0,0,3.94159,.0005,18,-.001],[.02461,.01015,-.136,.0032,.0076,.0026,'janus_gold',0,0,3.94159,.0005,18,.0089],[.02895,.00594,-.136,.002,.0065,.002,'janus_gold',0,0,3.94159,.0005,18,.0155],
[.01934,.04473,-.158,.0045,.0127,.0035,'janus_gold',0,0,-.8,.0005,18,-.001],[.02633,.05152,-.158,.0032,.0088,.0026,'janus_gold',0,0,-.8,.0005,18,.0107],[.03146,.0565,-.158,.002,.0075,.002,'janus_gold',0,0,-.8,.0005,18,.0185],[.01998,.01465,-.18,.0045,.0145,.0035,'janus_gold',0,0,3.94159,.0005,18,-.001],
[.02805,.00681,-.18,.0032,.01,.0026,'janus_gold',0,0,3.94159,.0005,18,.0125],[.03397,.00106,-.18,.002,.0085,.002,'janus_gold',0,0,3.94159,.0005,18,.0215],[.01869,.0441,-.202,.0045,.0109,.0035,'janus_gold',0,0,-.8,.0005,18,-.001],[.02461,.04985,-.202,.0032,.0076,.0026,'janus_gold',0,0,-.8,.0005,18,.0089],
[.02895,.05406,-.202,.002,.0065,.002,'janus_gold',0,0,-.8,.0005,18,.0155],[.01805,.03071,-.10300000000000001,.0045,.0073,.0035,'janus_gold',0,0,-1.3,.0005,18,-.001],[.02311,.03211,-.10300000000000001,.0032,.0052,.0026,'janus_gold',0,0,-1.3,.0005,18,.0053],[.02682,.03314,-.10300000000000001,.002,.0045,.002,'janus_gold',0,0,-1.3,.0005,18,.0095],
[.01805,.02929,-.125,.0045,.0073,.0035,'janus_gold',0,0,4.44159,.0005,18,-.001],[.02311,.02789,-.125,.0032,.0052,.0026,'janus_gold',0,0,4.44159,.0005,18,.0053],[.02682,.02686,-.125,.002,.0045,.002,'janus_gold',0,0,4.44159,.0005,18,.0095],[.01805,.03071,-.14700000000000002,.0045,.0073,.0035,'janus_gold',0,0,-1.3,.0005,18,-.001],
[.02311,.03211,-.14700000000000002,.0032,.0052,.0026,'janus_gold',0,0,-1.3,.0005,18,.0053],[.02682,.03314,-.14700000000000002,.002,.0045,.002,'janus_gold',0,0,-1.3,.0005,18,.0095],[.01805,.02929,-.16899999999999998,.0045,.0073,.0035,'janus_gold',0,0,4.44159,.0005,18,-.001],[.02311,.02789,-.16899999999999998,.0032,.0052,.0026,'janus_gold',0,0,4.44159,.0005,18,.0053],
[.02682,.02686,-.16899999999999998,.002,.0045,.002,'janus_gold',0,0,4.44159,.0005,18,.0095],[.01805,.03071,-.191,.0045,.0073,.0035,'janus_gold',0,0,-1.3,.0005,18,-.001],[.02311,.03211,-.191,.0032,.0052,.0026,'janus_gold',0,0,-1.3,.0005,18,.0053],[.02682,.03314,-.191,.002,.0045,.002,'janus_gold',0,0,-1.3,.0005,18,.0095],
[.01958,.04846,-.114,.0045,.019,.0035,'janus_gold',0,0,-.5,.0005,19,-.001],[.02677,.06162,-.114,.0032,.013,.0026,'janus_gold',0,0,-.5,.0005,19,.017],[.03204,.07128,-.114,.002,.011,.002,'janus_gold',0,0,-.5,.0005,19,.029],[.01958,.04846,-.158,.0045,.019,.0035,'janus_gold',0,0,-.5,.0005,19,-.001],
[.02677,.06162,-.158,.0032,.013,.0026,'janus_gold',0,0,-.5,.0005,19,.017],[.03204,.07128,-.158,.002,.011,.002,'janus_gold',0,0,-.5,.0005,19,.029],[.01958,.04846,-.202,.0045,.019,.0035,'janus_gold',0,0,-.5,.0005,19,-.001],[.02677,.06162,-.202,.0032,.013,.0026,'janus_gold',0,0,-.5,.0005,19,.017],
[.03204,.07128,-.202,.002,.011,.002,'janus_gold',0,0,-.5,.0005,19,.029],[.01686,.03619,-.07550000000000001,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.07550000000000001,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],[.02207,.03885,-.07550000000000001,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],
[.01686,.02381,-.0865,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],[.01987,.02228,-.0865,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.0865,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.02381,-.0975,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],
[.01987,.02228,-.0975,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.0975,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.03619,-.1085,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.1085,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],
[.02207,.03885,-.1085,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],[.01686,.03619,-.11950000000000001,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.11950000000000001,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],[.02207,.03885,-.11950000000000001,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],
[.01686,.02381,-.1305,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],[.01987,.02228,-.1305,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.1305,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.02381,-.14150000000000001,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],
[.01987,.02228,-.14150000000000001,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.14150000000000001,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.03619,-.1525,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.1525,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],
[.02207,.03885,-.1525,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],[.01686,.03619,-.1635,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.1635,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],[.02207,.03885,-.1635,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],
[.01686,.02381,-.1745,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],[.01987,.02228,-.1745,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.1745,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.02381,-.1855,.0045,.00505,.0035,'janus_gold',0,0,4.24159,.0005,18,-.001],
[.01987,.02228,-.1855,.0032,.0037,.0026,'janus_gold',0,0,4.24159,.0005,18,.00305],[.02207,.02115,-.1855,.002,.00325,.002,'janus_gold',0,0,4.24159,.0005,18,.00575],[.01686,.03619,-.1965,.0045,.00505,.0035,'janus_gold',0,0,-1.1,.0005,18,-.001],[.01987,.03772,-.1965,.0032,.0037,.0026,'janus_gold',0,0,-1.1,.0005,18,.00305],
[.02207,.03885,-.1965,.002,.00325,.002,'janus_gold',0,0,-1.1,.0005,18,.00575],[-.01869,.0441,-.07,.0045,.0109,.0035,'janus_gold',0,0,.8,.0005,18,-.001],[-.02461,.04985,-.07,.0032,.0076,.0026,'janus_gold',0,0,.8,.0005,18,.0089],[-.02895,.05406,-.07,.002,.0065,.002,'janus_gold',0,0,.8,.0005,18,.0155],
[-.01934,.01527,-.092,.0045,.0127,.0035,'janus_gold',0,0,2.34159,.0005,18,-.001],[-.02633,.00848,-.092,.0032,.0088,.0026,'janus_gold',0,0,2.34159,.0005,18,.0107],[-.03146,.0035,-.092,.002,.0075,.002,'janus_gold',0,0,2.34159,.0005,18,.0185],[-.01998,.04535,-.114,.0045,.0145,.0035,'janus_gold',0,0,.8,.0005,18,-.001],
[-.02805,.05319,-.114,.0032,.01,.0026,'janus_gold',0,0,.8,.0005,18,.0125],[-.03397,.05894,-.114,.002,.0085,.002,'janus_gold',0,0,.8,.0005,18,.0215],[-.01869,.0159,-.136,.0045,.0109,.0035,'janus_gold',0,0,2.34159,.0005,18,-.001],[-.02461,.01015,-.136,.0032,.0076,.0026,'janus_gold',0,0,2.34159,.0005,18,.0089],
[-.02895,.00594,-.136,.002,.0065,.002,'janus_gold',0,0,2.34159,.0005,18,.0155],[-.01934,.04473,-.158,.0045,.0127,.0035,'janus_gold',0,0,.8,.0005,18,-.001],[-.02633,.05152,-.158,.0032,.0088,.0026,'janus_gold',0,0,.8,.0005,18,.0107],[-.03146,.0565,-.158,.002,.0075,.002,'janus_gold',0,0,.8,.0005,18,.0185],
[-.01998,.01465,-.18,.0045,.0145,.0035,'janus_gold',0,0,2.34159,.0005,18,-.001],[-.02805,.00681,-.18,.0032,.01,.0026,'janus_gold',0,0,2.34159,.0005,18,.0125],[-.03397,.00106,-.18,.002,.0085,.002,'janus_gold',0,0,2.34159,.0005,18,.0215],[-.01869,.0441,-.202,.0045,.0109,.0035,'janus_gold',0,0,.8,.0005,18,-.001],
[-.02461,.04985,-.202,.0032,.0076,.0026,'janus_gold',0,0,.8,.0005,18,.0089],[-.02895,.05406,-.202,.002,.0065,.002,'janus_gold',0,0,.8,.0005,18,.0155],[-.01805,.03071,-.10300000000000001,.0045,.0073,.0035,'janus_gold',0,0,1.3,.0005,18,-.001],[-.02311,.03211,-.10300000000000001,.0032,.0052,.0026,'janus_gold',0,0,1.3,.0005,18,.0053],
[-.02682,.03314,-.10300000000000001,.002,.0045,.002,'janus_gold',0,0,1.3,.0005,18,.0095],[-.01805,.02929,-.125,.0045,.0073,.0035,'janus_gold',0,0,1.84159,.0005,18,-.001],[-.02311,.02789,-.125,.0032,.0052,.0026,'janus_gold',0,0,1.84159,.0005,18,.0053],[-.02682,.02686,-.125,.002,.0045,.002,'janus_gold',0,0,1.84159,.0005,18,.0095],
[-.01805,.03071,-.14700000000000002,.0045,.0073,.0035,'janus_gold',0,0,1.3,.0005,18,-.001],[-.02311,.03211,-.14700000000000002,.0032,.0052,.0026,'janus_gold',0,0,1.3,.0005,18,.0053],[-.02682,.03314,-.14700000000000002,.002,.0045,.002,'janus_gold',0,0,1.3,.0005,18,.0095],[-.01805,.02929,-.16899999999999998,.0045,.0073,.0035,'janus_gold',0,0,1.84159,.0005,18,-.001],
[-.02311,.02789,-.16899999999999998,.0032,.0052,.0026,'janus_gold',0,0,1.84159,.0005,18,.0053],[-.02682,.02686,-.16899999999999998,.002,.0045,.002,'janus_gold',0,0,1.84159,.0005,18,.0095],[-.01805,.03071,-.191,.0045,.0073,.0035,'janus_gold',0,0,1.3,.0005,18,-.001],[-.02311,.03211,-.191,.0032,.0052,.0026,'janus_gold',0,0,1.3,.0005,18,.0053],
[-.02682,.03314,-.191,.002,.0045,.002,'janus_gold',0,0,1.3,.0005,18,.0095],[-.01958,.04846,-.114,.0045,.019,.0035,'janus_gold',0,0,.5,.0005,19,-.001],[-.02677,.06162,-.114,.0032,.013,.0026,'janus_gold',0,0,.5,.0005,19,.017],[-.03204,.07128,-.114,.002,.011,.002,'janus_gold',0,0,.5,.0005,19,.029],
[-.01958,.04846,-.158,.0045,.019,.0035,'janus_gold',0,0,.5,.0005,19,-.001],[-.02677,.06162,-.158,.0032,.013,.0026,'janus_gold',0,0,.5,.0005,19,.017],[-.03204,.07128,-.158,.002,.011,.002,'janus_gold',0,0,.5,.0005,19,.029],[-.01958,.04846,-.202,.0045,.019,.0035,'janus_gold',0,0,.5,.0005,19,-.001],
[-.02677,.06162,-.202,.0032,.013,.0026,'janus_gold',0,0,.5,.0005,19,.017],[-.03204,.07128,-.202,.002,.011,.002,'janus_gold',0,0,.5,.0005,19,.029],[-.01686,.03619,-.07550000000000001,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],[-.01987,.03772,-.07550000000000001,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],
[-.02207,.03885,-.07550000000000001,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[-.01686,.02381,-.0865,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.0865,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.0865,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],
[-.01686,.02381,-.0975,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.0975,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.0975,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],[-.01686,.03619,-.1085,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],
[-.01987,.03772,-.1085,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],[-.02207,.03885,-.1085,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[-.01686,.03619,-.11950000000000001,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],[-.01987,.03772,-.11950000000000001,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],
[-.02207,.03885,-.11950000000000001,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[-.01686,.02381,-.1305,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.1305,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.1305,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],
[-.01686,.02381,-.14150000000000001,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.14150000000000001,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.14150000000000001,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],[-.01686,.03619,-.1525,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],
[-.01987,.03772,-.1525,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],[-.02207,.03885,-.1525,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[-.01686,.03619,-.1635,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],[-.01987,.03772,-.1635,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],
[-.02207,.03885,-.1635,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[-.01686,.02381,-.1745,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.1745,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.1745,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],
[-.01686,.02381,-.1855,.0045,.00505,.0035,'janus_gold',0,0,2.04159,.0005,18,-.001],[-.01987,.02228,-.1855,.0032,.0037,.0026,'janus_gold',0,0,2.04159,.0005,18,.00305],[-.02207,.02115,-.1855,.002,.00325,.002,'janus_gold',0,0,2.04159,.0005,18,.00575],[-.01686,.03619,-.1965,.0045,.00505,.0035,'janus_gold',0,0,1.1,.0005,18,-.001],
[-.01987,.03772,-.1965,.0032,.0037,.0026,'janus_gold',0,0,1.1,.0005,18,.00305],[-.02207,.03885,-.1965,.002,.00325,.002,'janus_gold',0,0,1.1,.0005,18,.00575],[.0135,.08275,-.03725,.002,.002,.0098,'janus_gold',.7854,0,0,.0005,10],[.0135,.08275,-.04275,.002,.002,.0098,'janus_gold',-.7854,0,0,.0005,10],
[.0135,.07725,-.03725,.002,.002,.0098,'janus_gold',-.7854,0,0,.0005,10],[.0135,.07725,-.04275,.002,.002,.0098,'janus_gold',.7854,0,0,.0005,10],[.0135,.08,-.04,.002,.003,.003,'janus_gold',0,0,0,.0005,10],[.0135,.08,-.0315,.002,.002,.006,'janus_gold',0,0,0,.0005,10],
[.0135,.08,-.0485,.002,.002,.006,'janus_gold',0,0,0,.0005,10],[.0135,.0885,-.04,.002,.006,.002,'janus_gold',0,0,0,.0005,10],[.0135,.0715,-.04,.002,.006,.002,'janus_gold',0,0,0,.0005,10],[.0135,.0915,-.04,.002,.002,.026,'janus_gold',0,0,0,.0005,10],
[.0135,.0685,-.04,.002,.002,.026,'janus_gold',0,0,0,.0005,10],[.0135,.08,-.053,.002,.021,.002,'janus_gold',0,0,0,.0005,10],[.0135,.08,-.027,.002,.021,.002,'janus_gold',0,0,0,.0005,10],[-.0135,.08275,-.03725,.002,.002,.0098,'janus_gold',.7854,0,0,.0005,10],
[-.0135,.08275,-.04275,.002,.002,.0098,'janus_gold',-.7854,0,0,.0005,10],[-.0135,.07725,-.03725,.002,.002,.0098,'janus_gold',-.7854,0,0,.0005,10],[-.0135,.07725,-.04275,.002,.002,.0098,'janus_gold',.7854,0,0,.0005,10],[-.0135,.08,-.04,.002,.003,.003,'janus_gold',0,0,0,.0005,10],
[-.0135,.08,-.0315,.002,.002,.006,'janus_gold',0,0,0,.0005,10],[-.0135,.08,-.0485,.002,.002,.006,'janus_gold',0,0,0,.0005,10],[-.0135,.0885,-.04,.002,.006,.002,'janus_gold',0,0,0,.0005,10],[-.0135,.0715,-.04,.002,.006,.002,'janus_gold',0,0,0,.0005,10],
[-.0135,.0915,-.04,.002,.002,.026,'janus_gold',0,0,0,.0005,10],[-.0135,.0685,-.04,.002,.002,.026,'janus_gold',0,0,0,.0005,10],[-.0135,.08,-.053,.002,.021,.002,'janus_gold',0,0,0,.0005,10],[-.0135,.08,-.027,.002,.021,.002,'janus_gold',0,0,0,.0005,10]
].map(r=>{const p=Pt(r[0],r[1],r[2],r[3],r[4],r[5],r[6],{rx:r[7],ry:r[8],rz:r[9],r:r[10]});p.tag=J2_TAGS[r[11]];if(r.length>12)p.ax=r[12];return p});
// the sheet's points and hinge (pivots.break); the revolving door the figures turn on; the B form and its timing (seconds)
const J2_G={grip:[0,-.02,.01],muzzle:[0,.03,-.21],mag:[0,.03,-.05],eject:[0,.05,-.05],scope:[0,.08,-.024]};
const J2={HINGE:[0,.015,-.02],DOOR:[0,.07325,-.025],OPEN:.785,UP:.005,OUT:.004,DN:.005,MID:.03,BAND:.0095,GROW:2,
  T_GROW:.5,T_FLIP0:.3,T_FLIP:.55,OT:.85,CT:.85};
// what goes up with the upper half; the thorns (0 the vine: it only moves, 1 thorn_s: ×1 → ×2, 2 thornB: nothing → ×1)
const J2_UPT={break_outer_up_r:1,break_outer_up_l:1,break_outer_top_r:1,break_outer_top_l:1,scope_part:1,statue_jesus:1,statue_jesus_eyes:1,statue_mary:1,statue_mary_eyes:1};
const J2_TK={thorn_base:0,thorn_s:1,thornB:2};
const _j2e=new THREE.Euler(),_j2v=new THREE.Vector3(),_j2w=new THREE.Vector3(),_j2m=new THREE.Matrix4();
// a thorn part's root (gun space) and its long axis (its own y, turned by its angles): the part starts ax along it from the root
function j2Root(p){_j2v.set(0,1,0).applyEuler(_j2e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ'));const h=p.s[1]/2+(p.ax||0);
  return [p.c[0]-_j2v.x*h,p.c[1]-_j2v.y*h,p.c[2]-_j2v.z*h,_j2v.x,_j2v.y,_j2v.z]}
// how far a point on the barrel's side goes when the halves are fully apart: the upper half up, the lower halves out and down, in between
// near the centre line
function j2Split(y,sx){const t=clamp((y-J2.MID)/J2.BAND,-1,1);return t>=0?[0,J2.UP*t]:[sx*J2.OUT*-t,-J2.DN*-t]}
// a thorn part at growth g (0 shut .. 1 the B form): grown about its root, carried by the split (by its root, so a thorn stays whole)
function j2Thorn(p,g,q){const K=J2_TK[p.tag];
  if(K===0){const d=j2Split(p.c[1],Math.sign(p.c[0]));q.c=[p.c[0]+d[0]*g,p.c[1]+d[1]*g,p.c[2]];q.s=p.s.slice();return q}
  const R=j2Root(p),k=K===1?1+(J2.GROW-1)*g:g,h=(p.s[1]/2+p.ax)*k,d=j2Split(R[1],Math.sign(R[0]));
  q.c=[R[0]+R[3]*h+d[0]*g,R[1]+R[4]*h+d[1]*g,R[2]+R[5]*h];q.s=K===1?[p.s[0],p.s[1]*k,p.s[2]]:[p.s[0]*k,p.s[1]*k,p.s[2]*k];return q}
// any part in the B form at g
function j2Form(p,q,g){const t=p.tag;if(J2_TK[t]!=null)return j2Thorn(p,g,q);
  if(J2_UPT[t])q.c[1]=p.c[1]+J2.UP*g;
  else if(t==='break_outer_dn_l'||t==='break_outer_bot_l'){q.c[0]=p.c[0]-J2.OUT*g;q.c[1]=p.c[1]-J2.DN*g}
  else if(t==='break_outer_dn_r'||t==='break_outer_bot_r'){q.c[0]=p.c[0]+J2.OUT*g;q.c[1]=p.c[1]-J2.DN*g}
  return q}
const j2Cp=(p,o)=>Object.assign({c:p.c.slice(),s:p.s.slice(),m:p.m,rx:p.rx,ry:p.ry,rz:p.rz,r:p.r},o||{});

// ---------- the models ----------
// world models: 'n' as it is (Christ, white eyes; thornB not out), 's' the signal (his eyes gold), 'b' the B form (Mary, the thorns grown,
// the halves apart)
function j2World(v){const B=v==='b',L=[];
  for(const p of J2_P){const t=p.tag;if(t==='thornB'&&!B)continue;if(B?t==='statue_jesus'||t==='statue_jesus_eyes':t==='statue_mary'||t==='statue_mary_eyes')continue;
    const q=j2Cp(p,{r:0});if(v==='s'&&t==='statue_jesus_eyes')q.m='glow_jesus';if(B)j2Form(p,q,1);L.push(q)}
  return L}
// the first-person model: the frame stays (body), 'mag' breaks on the hinge (break_inner), the upper half (j2U), the lower halves (j2DL /
// j2DR), the thorns (j2T: one mesh whose parts are placed again as they grow), Christ (j2J), his eyes white (j2E) and gold (j2EY: the
// same eyes in glow_jesus), Mary with her eyes (j2M), the trigger, the case
const J2_VMT={break_inner:'mag',break_outer_up_r:'j2U',break_outer_up_l:'j2U',break_outer_top_r:'j2U',break_outer_top_l:'j2U',scope_part:'j2U',
  break_outer_dn_l:'j2DL',break_outer_bot_l:'j2DL',break_outer_dn_r:'j2DR',break_outer_bot_r:'j2DR',thorn_base:'j2T',thorn_s:'j2T',thornB:'j2T',
  statue_jesus:'j2J',statue_jesus_eyes:'j2E',statue_mary:'j2M',statue_mary_eyes:'j2M',trigger:'trg',shell:'shell'};
function j2VmParts(){const L=[];for(const p of J2_P){const t=J2_VMT[p.tag];L.push(j2Cp(p,t?{tag:t}:null));if(p.tag==='statue_jesus_eyes')L.push(j2Cp(p,{tag:'j2EY',m:'glow_jesus'}))}return L}
{const H=J2.HINGE,D=J2.DOOR;
  GUNS.janus2=Object.assign({parts:j2VmParts(),hinge:H.slice(),piv:{trg:[0,-.0077,-.0085],j2U:H,j2DL:H,j2DR:H,j2T:H,shell:H,j2J:D,j2E:D,j2EY:D,j2M:D},wid:'janus2n'},J2_G)}
GUNS.janus2n=Object.assign({parts:j2World('n')},J2_G);GUNS.janus2s=Object.assign({parts:j2World('s')},J2_G);GUNS.janus2b=Object.assign({parts:j2World('b')},J2_G);
// the kill feed's and buy menu's picture: the world model as it is (not the first-person one with both figures and the B thorns)
{const gi=gunIcon;gunIcon=function(id,h){return gi(id==='janus2'?'janus2n':id,h)}}
// the grenade (the projectile, either form): a brass case, a blue-steel head, a gold nose; a fresh one in the hand on a reload
GUNS.j2nade={parts:[Pt(0,0,.012,.034,.034,.04,'brass',{r:.012}),Pt(0,0,-.022,.036,.036,.03,'janus_blue',{r:.014}),Pt(0,0,-.04,.016,.016,.01,'janus_gold',{r:.006})],grip:[0,0,0],muzzle:[0,0,0]};
FD_PROPS.j2nade=()=>[Pt(0,0,.01,.018,.018,.034,'brass',{r:.005}),Pt(0,0,-.017,.019,.019,.022,'janus_blue',{r:.007}),Pt(0,0,-.031,.009,.009,.007,'janus_gold',{r:.003})];
// the thorns' mesh: every part's own box made once about its centre; placed again (grown, carried) whenever the growth changes
function j2ThornMesh(mesh){const L=J2_P.filter(p=>J2_TK[p.tag]!=null);
  const geo=partGeo(L.map(p=>({c:[0,0,0],s:p.s,m:p.m,r:p.r}))),pa=geo.attributes.position,N=geo.attributes.normal.array,loc=Float32Array.from(pa.array),Q=[];let v0=0;
  for(const p of L){const one=partGeo([{c:[0,0,0],s:p.s,m:p.m,r:p.r}]),n=one.attributes.position.count;one.dispose();
    const e=_j2m.makeRotationFromEuler(_j2e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ')).elements.slice();
    for(let i=v0;i<v0+n;i++){const k=i*3,x=N[k],y=N[k+1],z=N[k+2];N[k]=e[0]*x+e[4]*y+e[8]*z;N[k+1]=e[1]*x+e[5]*y+e[9]*z;N[k+2]=e[2]*x+e[6]*y+e[10]*z}
    Q.push({p,v0,n,e});v0+=n}
  pa.setUsage(THREE.DynamicDrawUsage);geo.attributes.normal.needsUpdate=true;if(mesh.geometry)mesh.geometry.dispose();mesh.geometry=geo;
  const T={geo,loc,Q,g:-1};j2ThornSet(T,0);return T}
function j2ThornSet(T,g){const P=T.geo.attributes.position.array,L=T.loc,H=J2.HINGE,q={c:null,s:null};
  for(const Z of T.Q){const p=Z.p,e=Z.e;j2Thorn(p,g,q);const fx=q.s[0]/p.s[0],fy=q.s[1]/p.s[1],fz=q.s[2]/p.s[2],cx=q.c[0]-H[0],cy=q.c[1]-H[1],cz=q.c[2]-H[2];
    for(let i=Z.v0;i<Z.v0+Z.n;i++){const k=i*3,x=L[k]*fx,y=L[k+1]*fy,z=L[k+2]*fz;P[k]=e[0]*x+e[4]*y+e[8]*z+cx;P[k+1]=e[1]*x+e[5]*y+e[9]*z+cy;P[k+2]=e[2]*x+e[6]*y+e[10]*z+cz}}
  T.geo.attributes.position.needsUpdate=true;T.g=g}
// the gold eyes' halo (the sheet: additive, the viewer only)
let J2_HALO=null;
function j2HaloTex(){if(J2_HALO)return J2_HALO;const [cv,x]=mkCanvas(64,64);const g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,244,190,1)');g.addColorStop(.22,'rgba(255,215,0,.6)');g.addColorStop(.55,'rgba(255,190,30,.18)');g.addColorStop(1,'rgba(255,170,0,0)');
  x.fillStyle=g;x.fillRect(0,0,64,64);return J2_HALO=new THREE.CanvasTexture(cv)}
// the rig: the halves, the thorns and the case ride the breaking barrel (hung under 'mag'), the figures turn on the door in the upper half;
// the free hand waits out of sight below
function j2Rig(m){const T=m.tags,mg=T.mag,up=T.j2U;if(!mg)return;
  for(const t of ['j2J','j2E','j2EY','j2M']){const g=T[t];if(g&&up){up.add(g);g.position.sub(up.position)}}
  for(const t of ['j2U','j2DL','j2DR','j2T','shell']){const g=T[t];if(g){mg.add(g);g.position.sub(mg.position)}}
  if(T.j2T&&T.j2T.children[0])m.j2T=j2ThornMesh(T.j2T.children[0]);
  if(T.j2M)T.j2M.visible=false;if(T.j2EY)T.j2EY.visible=false;
  if(T.j2EY){const D=J2.DOOR;for(const sx of [1,-1]){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:j2HaloTex(),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,fog:false}));
    s.scale.set(.011,.011,1);s.position.set(sx*.00473,.07834-D[1],-.019-D[2]);s.renderOrder=5;s.frustumCulled=false;T.j2EY.add(s)}}
  if(m.armL){lookArm(m.armL,[-.09,-.36,.06],[-.35,-.7,.6]);m.armL.visible=false}}
{const bv=buildVM;buildVM=function(id,skinKey,U,dual){const m=bv(id,skinKey,U,dual);if(id==='janus2')try{j2Rig(m)}catch(e){console.error(e)}return m}}

// ---------- stats (the sheet's) ----------
const J2N={DMG:120,R:4.4,SCEN:2.5,KB:.8,STAG:.5,UP:.8,SP:.6,SPD:40};
WPN.janus2={slot:2,kind:'pistol',n:['이태훈 딕건','Lee Tae-hoon Dick Gun'],cost:6000,mag:1,res:0,supOnly:1,jn:'janus2',dmg:J2N.DMG,rpm:60,semi:1,proj:'j2',alt:'janus',
  spread:[.01,.04,.08],rec:[.3,.08],kb:J2N.KB,stag:J2N.STAG,hs:1.5,reload:1,brk:1,draw:.9,speed:.94,snd:'j2fire',drawS:'j2draw',model:'janus2',hold:'pistol',
  kickX:[1.05,2.9,.6],bd:['적중 시 게이지 충전 · 단발 장전 유탄 · 1발','Single shot & reload · Charge on hit · 1 Ammo']};
// the B form fires the same grenade, without a magazine (the sheet: unlimited at 214 a minute, the same kick and flame)
const J2WB=Object.assign({},WPN.janus2,{proj:'j2b',noMag:1});
VM_POS.janus2={p:[.12,-.15,-.38],r:[0,.07,.02]};
BUY_MENU.find(c=>c.k==='pistol').items.push('janus2');
// first draw (the sheet's): broken open with the thumb, rolled over for a look into the chamber, flicked shut — heavy
GUN_DESIGN.janus2={mag:1,ch:0,act:'break',x:.3,d:.15,side:'t',heavy:.7,roll:.4,open:J2.OPEN,opS:'j2open',shut:'j2shut'};WPN.janus2.fd=GUN_DESIGN.janus2;WPN.janus2.ch=0;
// the buy menu's line under the name (the sheet's buyDesc)
{const wt=UI.wTags;UI.wTags=function(W,id){if(W&&W.bd)return W.bd[LI()];return wt.call(this,W,id)}}

// ---------- it loads itself ----------
// a grenade is always there for the reload (the sheet's res 0: no spares to carry); right after a shot the barrel breaks and takes it
// (the immediate reload), never in the B form. A right click with the signal up while it reloads (or a bot that wants to) waits for it
// to shut, then opens the form
{const aw=actorWeapons;actorWeapons=function(a,dt){if(a.cur!=='janus2'||a.team!==TH||!a.alive){a.j2Q=0;return aw(a,dt)}
  const am=a.ammo&&a.ammo.janus2,W=WPN.janus2;if(!am)return aw(a,dt);
  if((am.res|0)<1)am.res=1;
  const form=jnForm(a)||a.jnC>0;
  if(a.reloadT>0&&a.jnS>0&&!form&&(a.isPlayer?a.cmd.alt&&!a.pc.alt:a.bot&&jnBotSees(a)))a.j2Q=1;
  if(a.j2Q&&a.reloadT<=0){a.j2Q=0;if(a.jnS>0&&!form)jnAlt(a)}
  const r=aw(a,dt);
  if(am.mag<=0&&a.reloadT<=0&&a.drawT<=0&&!(a.frozen>0)&&!(a.grabT>0)&&!jnForm(a)&&!(a.jnC>0)){a.zoom=0;a.burstN=0;a.reloadT=W.reload;a.relKind='mag';a.relCh=false;
    if(a.isPlayer)VM.reload(W,W.reload,'mag',true);else AU.at('magout',a.c.x,a.c.y+1.2,a.c.z,{vol:.4,range:15})}
  return r}}
// the HUD: no spares to count
{const hu=HUD.update;HUD.update=function(dt){hu.call(this,dt);const P=G.player,e=this.el;if(P&&P.alive&&P.cur==='janus2'&&e&&e.hRes&&e.hRes.textContent!=='/ ∞')e.hRes.textContent='/ ∞'}}

// ---------- the TWINFACE machinery's own bits (janus.js) ----------
// the B form's state now: g the thorns and the halves (0..1), f how far the figures have turned (0 Christ .. 1 Mary)
function j2State(a,o){let g=0,f=0;
  if(a.jnO>0){const u=J2.OT-a.jnO;g=smooth(clamp(u/J2.T_GROW,0,1));f=smooth(clamp((u-J2.T_FLIP0)/J2.T_FLIP,0,1))}
  else if(a.jnB>0){g=1;f=1}
  else if(a.jnC>0){const u=J2.CT-a.jnC;f=1-smooth(clamp(u/J2.T_FLIP,0,1));g=1-smooth(clamp((u-(J2.CT-J2.T_GROW))/J2.T_GROW,0,1))}
  o.g=g;o.f=f;return o}
const _j2s={g:0,f:0},_j2k={g:0,f:0};
JNW.janus2={wb:J2WB,sOpen:'j2awake',sOn:'',sClose:'j2end',open:()=>null,close:()=>null,oT:J2.OT,cT:J2.CT,calm:1,lit:null,openK:a=>j2State(a,_j2k).f,
  burst:(x,y,z,s)=>j2Burst(x,y,z,s),spark:[1,.85,.45],mz:[0,0,0],cx:'j2',bfx:a=>j2Flame(a),sfx:a=>j2Flame(a),cfx(){}};
JNP.j2={w:'janus2',sp:J2N.SPD,mdl:'j2nade'};JNP.j2b={w:'janus2',sp:J2N.SPD,mdl:'j2nade',B:1};
// the shot (either form): a strong grenade flame at the muzzle (the sheet's fx), smoke after it
function j2Flame(a){const mz=muzzleWorld(a),me=a.isPlayer&&!G.spec;aimDir(a.yaw+(a.punchY||0),a.pitch+(a.punchP||0),_j2w);FX.muzzle(mz.x,mz.y,mz.z,_j2w.x,_j2w.y,_j2w.z,true);
  FX.spawn({x:mz.x+_j2w.x*.08,y:mz.y+_j2w.y*.08,z:mz.z+_j2w.z*.08,vx:_j2w.x*2.5,vy:_j2w.y*2.5+.3,vz:_j2w.z*2.5,life:.12,s0:me?.16:.3,s1:me?.4:.7,r:1,g:.6,b:.2,a:.9,f:14,add:1});
  for(let i=0;i<4;i++)FX.spawn({x:mz.x,y:mz.y,z:mz.z,vx:rr(-.4,.4),vy:rr(.2,.9),vz:rr(-.4,.4),life:rr(.6,1.1),s0:.06,s1:rr(.25,.4),r:.6,g:.58,b:.55,a:.35,f:2,drag:2});
  if(a.isPlayer){VM.flash.scale.setScalar(1.7*rr(.9,1.1));VM.flashT=Math.max(VM.flashT||0,.06);VM.U.uMuzzle.value.setRGB(1.9,.9,.35)}}
// a blast's burst of gold light
function j2Burst(x,y,z,s){FX.spawn({x,y,z,life:.2,s0:.3*s,s1:1.7*s,r:1,g:.78,b:.32,a:.8,f:14,add:1});FX.spawn({x,y,z,life:.1,s0:.25*s,s1:.6*s,r:1,g:.95,b:.8,f:1,add:1});
  for(let i=0;i<10;i++){const g=Math.random()*TAU,e=rr(-.5,1),sp=rr(1.5,4)*s;FX.spawn({x,y,z,vx:Math.cos(g)*Math.cos(e)*sp,vy:Math.sin(e)*sp,vz:Math.sin(g)*Math.cos(e)*sp,life:rr(.2,.4),s0:.06,s1:.01,r:1,g:.85,b:.45,f:11,add:1,grav:2})}
  DL.add(x,y,z,'#ffc860',5*s,2,.18)}

// ---------- the grenades ----------
function j2Upd(n,dt){const r=projStep(n,dt,GRAV*.35,(n)=>{j2Boom(n);return 'kill'},(n)=>{j2Boom(n);return 'kill'});if(r==='kill')return true;
  if(n.mesh){n.mesh.position.set(n.x,n.y,n.z);n.mesh.lookAt(n.x+n.vx,n.y+n.vy,n.z+n.vz);sampleProbe(n.x,n.y,n.z,n.mesh.material.uniforms.uProbe.value)}
  if(Math.random()<.6)FX.spawn({x:n.x,y:n.y,z:n.z,vx:rr(-.2,.2),vy:rr(-.1,.3),vz:rr(-.2,.2),life:rr(.4,.8),s0:.08,s1:.35,r:.62,g:.6,b:.56,a:.35,f:2,drag:2});
  if(Math.random()<.4)FX.spawn({x:n.x,y:n.y,z:n.z,life:.06,s0:.08,s1:.02,r:1,g:.82,b:.4,f:11,add:1});
  if(n.t>6||n.y<-10){j2Boom(n);return true}return false}
// the blast: the grenade launcher's (weapons.js detonate 'gl') with the sheet's numbers, 60 % of the damage left at its edge; one count
// toward the signal if it caught anyone (the shooter's page, not in the B form)
function j2Boom(n){const B=n.kind==='j2b',sc=G.mode==='scen'?J2N.SCEN:1;
  const g={kind:'gl',owner:n.owner,w:'janus2',x:n.x,y:n.y,z:n.z,ghost:!!n.ghost,jw:'janus2',R:J2N.R,dmg:J2N.DMG*sc,kb:J2N.KB,stag:J2N.STAG,up:J2N.UP,sp:J2N.SP,he:1,
    vol:B?.65:.85,rate:B?1.18:1.08,shk:B?.5:.85};
  detonate(g);j2Burst(n.x,n.y,n.z,.6);
  if(!n.ghost&&!NET.ghost&&!B&&g.hitN>0)jnScore(n.owner)}
PROJ_UPD.j2=j2Upd;PROJ_UPD.j2b=j2Upd;

// ---------- first person ----------
// every frame: the free hand, the trigger, the halves, the thorns, the figures and their eyes
VMX.janus2=function(V,a,dt,o,m){const T=m.tags,S=j2State(a,_j2s);
  // one-handed: the free hand shows only while a clip brings it up (the reload)
  if(m.armL)m.armL.visible=!!(V.act&&V.act.S&&V.act.S.H);
  // the trigger after each shot
  if(V.j2SN!==(a.jnShots|0)){if(V.j2SN!=null&&(a.jnShots|0)>V.j2SN)V.j2Tr=1;V.j2SN=a.jnShots|0}
  V.j2Tr=Math.max(0,(V.j2Tr||0)-dt*8);if(T.trg)T.trg.rotation.x-=.4*V.j2Tr;
  // the halves part (the inner golden barrel stays), the thorns rise and go with them
  const g=S.g;if(T.j2U)T.j2U.position.y+=J2.UP*g;
  if(T.j2DL){T.j2DL.position.x-=J2.OUT*g;T.j2DL.position.y-=J2.DN*g}if(T.j2DR){T.j2DR.position.x+=J2.OUT*g;T.j2DR.position.y-=J2.DN*g}
  if(m.j2T&&Math.abs(m.j2T.g-g)>1e-5)j2ThornSet(m.j2T,g);
  // the figures: Christ 0 → −180°, Mary +180° → 0 on the door; Mary from 90°, Christ until 180°; his eyes gold with the signal until 90°
  const ph=-Math.PI*S.f,on=S.f<1,lit=on&&S.f<.5&&(a.jnS>0||a.jnO>0);
  if(T.j2J){T.j2J.rotation.x=ph;T.j2J.visible=on}
  if(T.j2E){T.j2E.rotation.x=ph;T.j2E.visible=on&&!lit}
  if(T.j2EY){T.j2EY.rotation.x=ph;T.j2EY.visible=lit}
  if(T.j2M){T.j2M.rotation.x=ph+Math.PI;T.j2M.visible=S.f>=.5}};
// one-handed break action (a gun with no supporting hand): the thumb trips the latch and the barrel drops open under its own weight, the
// gun rolls over for a look into the chamber (roll), then a flick of the wrist swings it shut with a heavy clack (heavy: slower, lower,
// harder)
function fdBreak1(P,G,m,L){const op=P.open||.62,h=P.heavy||0,rl=P.roll||0,lf=P.lift||0,o0=.1,o1=.2,fl=.6;
  return {
    G:[K6(0),K6(.06,.003,-.006,0,-.02,-.02,-.03),K6(o0,-.008,.008,-.006,-.1,.04,.3*rl),K6(o1+.06,-.026,.024+lf,-.008,.16,.12,.75*rl),K6(fl-.08,-.028,.028+lf,-.008,.2,.13,.8*rl),
       K6(fl,-.022,.044+lf,-.014,.5+.1*h,.1,.5*rl),K6(fl+.1,-.014,.016,-.01,-.05,.06,.3*rl),K6(.88,.003,-.004,.002,-.012,-.02,.02),K6(1)],
    parts:[{tag:'mag',ch:'rx',k:[[0,0],[o0,0],[o1,-op*1.08,1],[o1+.04,-op*.93],[o1+.08,-op]],rel:fl-.06,A:260+h*60,e:.14,home:[P.shut||'brk',1,.95-h*.1,[.26+h*.08,1.2+h*.4,0],[-.018,0,0]]}],
    E:[[o0,P.opS||'brk',.75,1-h*.06]],
    C:[[0,0,0,0],[o1,.01,0,-.012],[fl-.06,.012,0,-.014],[fl+.06,-.006,0,0],[.88,0,0,0],[1,0,0,0]]}}
{const fb=FDS.break;FDS.break=function(P,G,m,L){return G&&!G.sup?fdBreak1(P,G,m,L):fb(P,G,m,L)}}
// the reload (after every shot): tripped open as above, the extractor lifts the spent case out of the chamber and it flies back over the
// shoulder, the free hand comes up from the belt with a fresh grenade and pushes it into the chamber riding the barrel, the flick of the wrist
function rlBrk1(W,G,m,L){const P=W.fd||{},op=P.open||.62,h=P.heavy||0,rl=P.roll||0;
  const o0=.07,o1=.15,ej=.19,ld0=.4,ld1=.5,fl=.6,ch=[0,.03,-.045],bk=[-1,.4,0];// ch: the chamber's mouth (the bore's back end, it rides the barrel); bk: the back of the hand to the left
  return {
    G:[K6(0),K6(.04,.003,-.006,0,-.02,-.02,-.03),K6(o0,-.008,.008,-.006,-.1,.03,.25*rl),K6(o1+.04,-.03,.026,0,.22,.1,.6*rl),K6(ej+.04,-.032,.03,0,.26,.1,.65*rl),
       K6(ld0,-.036,.03,.004,.28,.12,.7*rl),K6(ld1+.04,-.034,.028,.004,.26,.12,.68*rl),K6(fl,-.024,.046,-.01,.5+.1*h,.1,.45*rl),K6(fl+.1,-.014,.016,-.01,-.04,.06,.3*rl),
       K6(.86,.003,-.004,.002,-.012,-.02,.02),K6(1)],
    H:{A:[{sup:1},{tag:'mag',at:ch},{p:[-.12,-.3,.12]}],k:[HK(0,0),HK(.16,0),HK(.24,2,[0,0,0],.6,[-1,-.3,0],.6),
       HK(ld0-.06,1,[-.06,.035,.012],1,bk,.7),HK(ld0,1,[-.04,.022,.008],1,bk,.7),HK(ld1-.02,1,[-.028,.012,.004],1,bk,.5),HK(ld1+.02,1,[-.036,.02,.008],1,bk,.25),
       HK(ld1+.12,2,[0,0,0],.6,[-1,-.3,0],.5),HK(.82,0),HK(1,0)]},
    parts:[{tag:'mag',ch:'rx',k:[[0,0],[o0,0],[o1,-op*1.08,1],[o1+.03,-op*.94],[o1+.06,-op]],rel:fl-.02,A:260+h*60,e:.14,home:[P.shut||'brk',1,.95-h*.1,[.26+h*.08,1.2+h*.4,0],[-.018,0,0]]},
      // the spent case (in the barrel's frame: y up the barrel, z back along the bore): lifted clear of the frame's face, flung back over
      // the shoulder and gone; it is in the chamber again once the hand has pushed the fresh grenade home
      {tag:'shell',ch:'pz',k:[[0,0],[ej-.01,0],[ej+.03,.006,1],[ej+.1,.3],[ej+.11,0]]},
      {tag:'shell',ch:'py',k:[[0,0],[ej-.01,0],[ej+.03,.022,1],[ej+.1,.12],[ej+.11,0]]},
      {tag:'shell',ch:'rx',k:[[0,0],[ej+.02,0],[ej+.1,1.8],[ej+.11,0]]},
      {tag:'shell',ch:'s',k:[[0,0],[ej+.09,0],[ej+.1,-1],[ld1,-1],[ld1+.01,0]]}],
    props:[{arm:'L',kind:'j2nade',on:[[.22,ld1]],pos:[0,-.03,-.075],rot:[0,0,0]}],
    E:[[o0,P.opS||'brk',.75,1-h*.06],[ej+.01,'shellcase',.55,.85],[ej+.1,'shellcase',.3,.95],[ld1-.02,'shellin',.6,.8]],
    C:[[0,0,0,0],[o1,.01,0,-.01],[ld0,.012,0,-.012],[fl,-.006,0,0],[.88,0,0,0],[1,0,0,0]]}}
{const rb=rlBrk;rlBrk=function(W,G,m,L){return G&&!G.sup?rlBrk1(W,G,m,L):rb(W,G,m,L)}}

// ---------- bots: now and then one carries it as its sidearm ----------
{const rl=AI.rollLd.bind(AI);AI.rollLd=function(){const L=rl();if(Math.random()<.05)L[2]='janus2';return L}}

// ---------- sounds (all synthesised, the sheet's words) ----------
Object.assign(SFX,{
  // the shot: an intense, heavy grenade blast — a deep thump with a sub drop under a hard crack — rolling away for a second
  j2fire:{n:3,dur:1.6,ch:2,peak:.95,gain:.9,rev:.2,poly:4,pj:.03,fn:B=>{const o=B.comp(-10,4,.002,.18,B.g(.95));
    {const e=B.env(0,.002,1,.3,B.sh(2.8,o));B.osc('sine',rr(98,112),38,0,.32,e)}{const e=B.env(0,.003,.7,.55,o);B.osc('sine',58,33,0,.6,e)}
    {const e=B.env(0,.001,.85,.12,o);B.nz('brown',0,.16,B.f('lowpass',900,.7,e))}{const e=B.env(.001,.003,.6,.2,o);B.nz('pink',0,.24,B.f('bandpass',rr(380,480),1.6,e))}
    for(const s of [-1,1]){const e=B.env(0,.0006,1,.02,B.pan(s*.25,o));B.nz('white',0,.04,B.f('highpass',3600,.7,e))}B.grain(.001,2400,2.2,.016,.5,o);
    for(const s of [-1,1]){const te=B.envT(.02,.05,.3,.34,B.pan(s*.65,o));const lp=B.f('lowpass',1500,.6,te);B.sweep(lp,1500,260,.02,1.1);B.nz('pink',.02,1.25,lp)}
    {const te=B.envT(.03,.08,.22,.4,o);B.nz('brown',.03,1.3,B.f('lowpass',340,.7,te))}}},
  // breaking it open: the metal parts letting go and meeting — 철컥
  j2open:{n:2,dur:.5,ch:2,peak:.85,gain:.6,rev:.08,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    B.grain(0,3600,3,.014,.55,o);B.ring(0,rr(2300,2500),[1,1.9],[.04,.03],[.06,.03],o);
    const t=.06;B.grain(t,2400,2.4,.016,.85,o);B.grain(t+.008,1700,2,.012,.5,o);B.ring(t,rr(980,1060),[1,2.31,3.6],[.12,.07,.04],[.14,.08,.04],o);
    {const e=B.env(t,.001,.55,.05,o);B.nz('brown',t,.07,B.f('lowpass',800,.7,e))}}},
  // shutting it on the fresh grenade: a quick, dull 텅
  j2shut:{n:2,dur:.6,ch:2,peak:.88,gain:.65,rev:.1,poly:2,fn:B=>{const o=B.comp(-12,4,.002,.15,B.g(.95));
    {const e=B.env(0,.001,1,.13,B.sh(2,o));B.osc('sine',rr(150,165),85,0,.16,e)}{const e=B.env(0,.001,.8,.06,o);B.nz('brown',0,.08,B.f('lowpass',600,.7,e))}
    B.grain(0,1500,1.2,.02,.6,o);B.ring(.002,rr(420,460),[1,2.7,4.1],[.2,.1,.05],[.14,.06,.03],o)}},
  // drawing it: the relic resonating faintly, then the click of it being ready
  j2draw:{n:2,dur:1.1,ch:2,peak:.75,gain:.5,rev:.2,poly:2,fn:B=>{const o=B.comp(-14,3,.003,.2,B.g(.9));
    for(const [f,p] of [[196,-.4],[197.6,.4]]){const e=B.env(0,.18,.32,.55,B.pan(p,o),.1);B.osc('sine',f,f,0,.9,e)}{const e=B.env(.05,.2,.08,.5,o,.05);B.osc('sine',784,790,.05,.8,e)}
    const t=.42;B.grain(t,3200,3,.015,.55,o);B.grain(t+.045,2300,2,.012,.7,o);B.ring(t+.045,1250,[1,2.2,3.4],[.06,.04,.025],[.12,.06,.03],o)}},
  // the B form: it wakes (a low swell, the halves unlocking, the thorns grinding out over half a second, the figures turning from 0.3 s)
  // and the holy power breaks loose as the turn ends (0.85 s): a bright choir and a rush of air
  j2awake:{n:1,dur:2.2,ch:2,peak:.9,gain:.8,rev:.26,fn:B=>{const o=B.comp(-12,4,.003,.25,B.g(.95));
    {const e=B.env(0,.3,.85,.9,o,.4);B.osc('sine',46,78,0,1.6,e)}{const e=B.env(0,.35,.3,.7,B.f('lowpass',800,.9,o),.3);B.osc('sawtooth',92,150,0,1.4,e)}
    B.grain(.02,2100,1.5,.02,.7,o);B.ring(.02,rr(700,760),[1,2.4,3.8],[.16,.1,.05],[.16,.09,.05],o);{const e=B.env(.02,.002,.5,.1,o);B.nz('brown',.02,.12,B.f('lowpass',500,.7,e))}
    for(const s of [-1,1]){const e=B.env(.03,.25,.16,.25,B.pan(s*.5,o),.1);const bp=B.f('bandpass',2600,3,e);B.sweep(bp,1800,5200,.03,.5);B.nz('white',.03,.6,bp)}
    for(let i=0;i<7;i++){const t=.3+i*.075;B.grain(t,rr(1600,2000),2.5,.01,.28,B.pan(rr(-.4,.4),o))}
    for(const [f,p] of [[523,-.5],[659,.5],[784,0],[1046,-.2]]){const e=B.env(.4,.45,.07,1,B.pan(p,o),.15);B.osc('sine',f,f*1.003,.4,1.6,e)}
    {const e=B.env(.85,.01,.35,.7,B.f('highpass',1800,.6,o));B.nz('white',.85,.8,e)}{const e=B.env(.85,.004,.6,.5,o);B.osc('sine',220,110,.85,.55,e)}}},
  // the B form closing: the figures turning back, the halves clamping shut twice, the hum dying away
  j2end:{n:1,dur:1.6,ch:2,peak:.85,gain:.7,rev:.18,fn:B=>{const o=B.comp(-12,4,.002,.2,B.g(.95));
    for(let i=0;i<6;i++){const t=.05+i*.08;B.grain(t,rr(1500,1900),2.5,.01,.22,B.pan(rr(-.4,.4),o))}
    for(const t of [.62,.8]){const e=B.env(t,.001,.9,.12,B.sh(1.8,o));B.osc('sine',rr(150,170),80,t,.15,e);B.grain(t,1600,1.4,.02,.55,o);B.ring(t,rr(560,620),[1,2.5,3.9],[.18,.1,.05],[.12,.06,.03],o)}
    {const e=B.env(0,.05,.5,1.1,o);B.osc('sine',90,40,0,1.2,e)}{const e=B.env(.1,.1,.06,.7,o);B.osc('sine',1046,880,.1,.8,e)}}}
});
SFX_ORDER.push('j2fire','j2open','j2shut','j2draw','j2awake','j2end');

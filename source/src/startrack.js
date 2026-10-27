'use strict';
// ============ v6.93: 스타트랙 (StarTrack) — a crate shotgun built to the owner's design sheet (startrack_final.json) ============
// The sheet applied as written (jsonPriority): its 446 parts (the numbers unchanged), its materials, points, pivots and stats, the first
// draw, the two modes, the motions, the reload, the draw, the glow and its sounds. A quad shotgun: four hexagonal barrels set diagonally
// round a big central one; special, slot 1, from the supply crates only (the sheet's suggestion).
// A (left click, held): 150 a minute, one round from one barrel at a time (UL, UR, LL, LR, three rounds each, the order back to UL on a
//   reload). The sheet's hit rule: one line from the eye, no random spread — who it reaches takes the twelve pellets at that part
//   (body 240 · head 372 · arms and legs 144) times the share of them that lands at that distance (1 to 3 m, .7 at 5, .35 at 10, .2 at 15,
//   .1 at 20 and on); the barrel that fired kicks back 3.5 cm, an orange flash at its end and nine orange lines (only to be seen).
// Right click: B (.55 s: the four barrels move out and tilt in to one point in front of the central one; the left hand a little lower).
//   A pull charges (.4 / .7 / 1 s by the rounds left: 1–5 white, 6–11 orange, 12 red; four thin lasers from the barrels to that point,
//   growing, moving allowed) and at the end every round left goes in one beam: one hit, no falloff, through nothing — head 250 · body 180 ·
//   arms and legs 110, times the rounds; the first wall or zombie stops it. Then it goes back to A by itself (silent).
// Reload 2.41 s: the drum is pulled, thrown away (with whatever was in it) and a new one put in from the reserve, two taps; B is left
//   first (silent). The draw: up from below in .7 s, the red parts flaring with a low hum (1.2 s). Every sound is the sheet's own
//   synthesis (soundData: its tone / noise / hum with the layers' values), rendered once into the bank and played at its own level.
// What the sheet leaves open, filled in the plainest way: the beam follows the gun for its .45–.9 s on screen (the hit is made once, at
//   the end of the charge); the gun's light falls off over about 30 cm (1 / (1 + (d / .3)²)); the colours of the beam's material are
//   worked out the way a current three.js shows them (sRGB ↔ linear); third person: the world model in A or in B (baked), its glow, the
//   flashes, lasers and beam at its own points; the price on the buy menu (6,000, for an owner); the HUD's weapon name says · B.
// Network: B goes out as ['stb', id, on, by hand], the charge as ['stc', id, tier], the beam as ['stf', id, x, y, z, tier] (where it
// stopped); an A shot is the usual 'f' (its last number the barrel).

// ---------- the sheet (its numbers as written: stats, points, pivots, materials, first draw, modes, motions, reload, glow, sounds) ----------
const STK={"stats":{"dmg":20,"rpm":150,"fire":"auto","mag":12,"res":240,"ch":0,"pellets":12,"spread":[.018,.05,.12],"rec":[.03,.014],"kb":3.2,"stag":.3,"hs":1.55,"reload":2.41,"reloadType":"mag","draw":1.2,"speed":.9,
  "zoom":null},"firstDraw":{"act":"spin","x":.4,"d":0,"side":"r","heavy":.6,"roll":0},"points":{"grip":[0,-.19,0],"sup":[-.005,-.27,-.54],"muzzle":[0,-.11,-.99],"mag":[0,-.29,-.26]},"pivots":{"armUR":[.075,
  -.035,-.74],"armLR":[.075,-.185,-.74],"armLL":[-.075,-.185,-.74],"armUL":[-.075,-.035,-.74]},"mats":{"redglow":[["#330000","#C0161C","#FF2A1A"],"glow",.3,.1],"orangeglow":[["#331100","#C04A10","#FF7A1A"],
  "glow",.3,.1],"laserbeam":[["#7A1A14","#FF3B30","#FFB0A0"],"glow",1,0],"laserorange":[["#803D0C","#FF8A1A","#FFC890"],"glow",1,0],"laserwhite":[["#999999","#FFFFFF","#FFFFFF"],"glow",1,0]},"trigger":{"toggleMode":"altFire",
  "fire":"primary","holdToFireA":true,"intervalSec":.4},"ammo":{"tubes":4,"roundsPerTube":3,"roundsPerShot":1,"pelletsPerShot":12,"tubeOrder":["UL","UR","LL","LR"],"orderResetOnReload":true},"aMode":{"pelletDamage":{"body":20,
  "head":31,"limb":12},"fullHitDamage":{"body":240,"head":372,"limb":144},"falloffMode":"smooth","falloff":[[3,1],[5,.7],[10,.35],[15,.2],[20,.1]],"falloffAfter":.1},"bMode":{"perRound":{"head":250,"body":180,
  "limb":110},"switchSec":.55,"judge":{"type":"hitscan","when":"chargeEnd","ticks":1,"penetrate":false,"wallbang":false,"maxTargets":1,"range":"unlimited","stopsAtFirstHit":["structure","enemy"]},"tiers":[{"rounds":[1,
  5],"mat":"laserwhite","chargeSec":.4,"beamWidth":.03,"beamSec":.45,"lightColor":"#FFFFFF"},{"rounds":[6,11],"mat":"laserorange","chargeSec":.7,"beamWidth":.06,"beamSec":.6,"lightColor":"#FF9030"},{"rounds":[12,
  12],"mat":"laserbeam","chargeSec":1,"beamWidth":.09,"beamSec":.9,"lightColor":"#FF3320"}],"beam":{"startPos":[0,-.11,-.91],"baseSize":[.046,.046],"noHitVisualLen":60,"shrinkDuringBeam":.3,"viewerMaterial":{"red":{"color":"#330000",
  "metalness":0,"roughness":.3,"emissive":"#FF3B30","emissiveIntensity":1.6},"orange":{"color":"#331100","metalness":0,"roughness":.3,"emissive":"#FF8A1A","emissiveIntensity":2.2},"white":{"color":"#222222",
  "metalness":0,"roughness":.3,"emissive":"#FFFFFF","emissiveIntensity":2.2}}},"lasers":{"count":4,"fromArmTagLocal":[0,0,-.25],"toPoint":[0,-.11,-1.12],"baseWidth":.01,"levelDuringBeam":.5},"timeline":{"chargeStart":{"lasersOn":true,
  "lightColorByTier":true,"heat":{"from":1,"to":2,"over":"charge"},"sound":"charge"},"beamStart":{"beamOn":true,"allTubeFlashesOn":true,"muzzleFlashOn":true,"ammoToZero":true,"sound":"laserFire","lasersLevel":.5},
  "beamDuring":{"heat":{"from":2,"to":1}},"beamEnd":{"beamOff":true,"flashesOff":true,"lasersOff":true,"lightColorReset":"#FF3320","returnToA":{"sec":.55},"heatAfterReturn":0}}},"motions":{"modeB":{"sec":.55,
  "ease":"smoothstep","simultaneous":true,"reverseOnExit":true,"tags":{"tubeUR":{"translate":[.05,.05,0]},"armUR":{"translate":[.05,.05,0],"rotate":{"pivot":"armUR","axis":[-.707,.707,0],"rad":.45,"pivotFollowsTranslate":true}},
  "tubeLR":{"translate":[.05,-.05,0]},"armLR":{"translate":[.05,-.05,0],"rotate":{"pivot":"armLR","axis":[.707,.707,0],"rad":.45,"pivotFollowsTranslate":true}},"tubeLL":{"translate":[-.05,-.05,0]},"armLL":{"translate":[-.05,
  -.05,0],"rotate":{"pivot":"armLL","axis":[.707,-.707,0],"rad":.45,"pivotFollowsTranslate":true}},"tubeUL":{"translate":[-.05,.05,0]},"armUL":{"translate":[-.05,.05,0],"rotate":{"pivot":"armUL","axis":[-.707,
  -.707,0],"rad":.45,"pivotFollowsTranslate":true}}}},"leftHandModeB":{"target":"sup","shift":[0,-.05,0],"followsModeBProgress":true},"fireKick":{"perTube":{"UL":["tubeUL","armUL"],"UR":["tubeUR","armUR"],
  "LL":["tubeLL","armLL"],"LR":["tubeLR","armLR"]},"translate":[0,0,.035],"instantBack":true,"returnSec":.13,"ease":"smoothstep","firedTubeOnly":true}},"reloadRule":{"canReloadWhen":"rounds<12 && reserve>0",
  "exitModeBFirst":true,"fillTo":12,"reserveCost":"filledRounds","keepRemainingRounds":false,"magDiscardedAlways":true,"fillOrder":["UL","UR","LL","LR"],"perTubeMax":3,"resetTubeOrder":true,"throwFrame":"world"},
  "fx":{"tubeFlash":{"size":[.11,.11,.03],"color":"#FFA050","aheadOfTubeTip":.035,"sec":.13,"renderAboveWeapon":false},"tracer":{"count":9,"spread":.05,"speedRange":[40,60],"lifeSec":.45,"len":.3,"thickness":.008,
  "startAheadOfTip":.3,"color":"#FFA050","visualOnly":true},"bMuzzleFlash":{"boxes":3,"boxSize":[.2,.03,.04],"rotateStepRad":1.047,"pos":[0,-.11,-1.04],"scaleFormula":"0.4+0.6*(beamWidth/0.046)","showDuringBeam":true}},
  "reloadAnim":[{"id":"lift","sec":.38,"gun":{"pitch":.45,"roll":-.3,"lift":.05},"leftHandFromSup":[0,-.19,.28]},{"id":"pull","sec":.33,"mag":{"translate":[0,-.28,0]},"leftHandFromSup":[0,-.47,.28]},{"id":"throw",
  "sec":.25,"mag":{"detach":true,"velocity":[-2.6,1.5,.9],"gravity":9.8,"spin":[5,0,7],"lifeSec":1.3},"leftHandFromSup":[-.12,-.47,.38]},{"id":"fetch","sec":.25,"newMag":{"spawnFromMagOffset":[0,-.28,0]},
  "leftHandFromSup":[0,-.47,.28]},{"id":"insert","sec":.4,"newMag":{"translate":[0,.28,0]},"leftHandFromSup":[0,-.19,.28],"refillAmmo":true,"resetTubeOrder":true},{"id":"tap1","sec":.21,"leftHandFromSup":[0,
  -.24,.28],"leftHandReturn":[0,-.19,.28],"magBounce":false},{"id":"tap2","sec":.21,"leftHandFromSup":[0,-.24,.28],"leftHandReturn":[0,-.19,.28],"magBounce":false},{"id":"lower","sec":.38,"gun":{"pitch":0,
  "roll":0,"lift":0},"leftHandFromSup":[0,0,0]}],"reloadSounds":[{"at":.38,"id":"clack"},{"at":.71,"id":"whoosh"},{"at":1.61,"id":"clack"},{"at":1.82,"id":"tap"},{"at":2.03,"id":"tap"}],"glow":{"materials":{"redglow":{"idle":.55,
  "modeB":2.05,"drawPeak":3.05},"orangeglow":{"idle":.55,"modeB":2.05,"drawPeak":3.05}},"redMaterial":{"mat":"red","emissiveColor":"#FF2010","drawPeak":1.6},"light":{"pos":[0,-.11,-1.04],"color":"#FF3320",
  "idle":.4,"modeB":3.4,"drawPeak":5.4}},"drawFx":{"sec":1.2,"glowRiseSec":.43,"glowFallSec":.77,"glowPeakRef":"glow","lift":{"fromOffset":[0,-.35,0],"fromPitchRad":-.25,"toOffset":[0,0,0],"toPitchRad":0,
  "sec":.7,"ease":"smoothstep","target":"weaponAndHands","startsAt":"drawStart"},"soundEvent":"draw"},"glowHeat":{"idle":0,"modeB":1,"chargeFrom":1,"chargeTo":2,"beamFrom":2,"beamTo":1},"snd":{"shotA":{"trigger":"A모드 총열 1발 발사 시작",
  "layers":[{"k":"noise","dur":.02,"gain":.8,"filterHz":[9000,3000],"delay":0,"filter":"highpass","q":.7},{"k":"noise","dur":.08,"gain":.9,"filterHz":[5000,1200],"delay":0,"filter":"bandpass","q":.5},{"k":"noise",
  "dur":.3,"gain":.9,"filterHz":[4500,250],"delay":0,"filter":"lowpass","q":.8},{"k":"noise","dur":.12,"gain":1,"filterHz":[600,90],"delay":0,"filter":"lowpass","q":1.2},{"k":"tone","wave":"sine","f0":80,
  "f1":45,"dur":.08,"gain":.3,"delay":0,"lowpassHz":0,"riseSec":0,"distortion":0},{"k":"noise","dur":.6,"gain":.2,"filterHz":[1400,120],"delay":.05,"filter":"lowpass","q":1}]},"draw":{"trigger":"무기 꺼내기 시작",
  "layers":[{"k":"toneKeys","wave":"sawtooth","freqKeys":[[0,70],[.43,190],[1.2,70]],"gainKeys":[[0,.001],[.43,.16],[1.2,.001]],"lowpassHz":500,"durSec":1.2}]},"reloadClack":{"trigger":"재장전 중 탄창을 뽑은 시점과 끼운 시점",
  "atSec":[.38,1.61],"layers":[{"k":"noise","dur":.04,"gain":.9,"filterHz":[5000,1500],"delay":0,"filter":"bandpass","q":1.2},{"k":"noise","dur":.07,"gain":1,"filterHz":[3200,350],"delay":.065,"filter":"lowpass",
  "q":1},{"k":"tone","wave":"sine","f0":160,"f1":55,"dur":.09,"gain":.55,"delay":.065,"lowpassHz":0,"riseSec":0,"distortion":0}]},"reloadWhoosh":{"trigger":"빈 탄창을 던지는 시점","atSec":[.71],"layers":[{"k":"noise",
  "dur":.28,"gain":.25,"filterHz":[2800,500],"delay":0,"filter":"bandpass","q":.8}]},"reloadTap":{"trigger":"탄창 밑둥을 치는 시점(2번)","atSec":[1.82,2.03],"layers":[{"k":"noise","dur":.07,"gain":.8,"filterHz":[2200,
  300],"delay":0,"filter":"lowpass","q":1}]},"modeBOn":{"trigger":"플레이어가 B모드로 전환할 때(전환 시작)","layers":[{"k":"tone","wave":"sawtooth","f0":55,"f1":170,"dur":.65,"gain":.22,"delay":0,"lowpassHz":700,"riseSec":.2,
  "distortion":0},{"k":"tone","wave":"square","f0":27.5,"f1":85,"dur":.65,"gain":.18,"delay":0,"lowpassHz":500,"riseSec":.2,"distortion":0},{"k":"tone","wave":"sine","f0":110,"f1":340,"dur":.65,"gain":.08,
  "delay":0,"lowpassHz":0,"riseSec":.2,"distortion":0}]},"modeBOff":{"trigger":"플레이어가 직접 B모드를 해제할 때(해제 시작)","layers":[{"k":"tone","wave":"sawtooth","f0":170,"f1":55,"dur":.65,"gain":.22,"delay":0,"lowpassHz":700,
  "riseSec":.2,"distortion":0},{"k":"tone","wave":"square","f0":85,"f1":27.5,"dur":.65,"gain":.18,"delay":0,"lowpassHz":500,"riseSec":.2,"distortion":0},{"k":"tone","wave":"sine","f0":340,"f1":110,"dur":.65,
  "gain":.08,"delay":0,"lowpassHz":0,"riseSec":.2,"distortion":0}]},"charge":{"trigger":"B모드 충전 시작, 길이는 단계별 충전 시간","tiers":[{"rounds":[1,5],"layers":[{"k":"tone","wave":"sawtooth","f0":70,"f1":300,"dur":.4,
  "gain":.2,"delay":0,"lowpassHz":900,"riseSec":.36,"distortion":0},{"k":"tone","wave":"sine","f0":140,"f1":620,"dur":.4,"gain":.09,"delay":0,"lowpassHz":0,"riseSec":.36,"distortion":0},{"k":"tone","wave":"square",
  "f0":35,"f1":150,"dur":.4,"gain":.12,"delay":0,"lowpassHz":300,"riseSec":.36,"distortion":0}]},{"rounds":[6,11],"layers":[{"k":"tone","wave":"sawtooth","f0":70,"f1":300,"dur":.7,"gain":.2,"delay":0,"lowpassHz":900,
  "riseSec":.63,"distortion":0},{"k":"tone","wave":"sine","f0":140,"f1":620,"dur":.7,"gain":.09,"delay":0,"lowpassHz":0,"riseSec":.63,"distortion":0},{"k":"tone","wave":"square","f0":35,"f1":150,"dur":.7,
  "gain":.12,"delay":0,"lowpassHz":300,"riseSec":.63,"distortion":0}]},{"rounds":[12,12],"layers":[{"k":"tone","wave":"sawtooth","f0":70,"f1":300,"dur":1,"gain":.2,"delay":0,"lowpassHz":900,"riseSec":.9,
  "distortion":0},{"k":"tone","wave":"sine","f0":140,"f1":620,"dur":1,"gain":.09,"delay":0,"lowpassHz":0,"riseSec":.9,"distortion":0},{"k":"tone","wave":"square","f0":35,"f1":150,"dur":1,"gain":.12,"delay":0,
  "lowpassHz":300,"riseSec":.9,"distortion":0}]}]},"laserFire":{"trigger":"B모드 빔 발사 시작","tiers":[{"rounds":[1,5],"name":"피웅","layers":[{"k":"tone","wave":"sine","f0":2000,"f1":300,"dur":.45,"gain":.3,"delay":0,
  "lowpassHz":0,"riseSec":0,"distortion":0},{"k":"tone","wave":"sawtooth","f0":900,"f1":160,"dur":.4,"gain":.22,"delay":0,"lowpassHz":2500,"riseSec":.02,"distortion":3},{"k":"tone","wave":"sine","f0":140,
  "f1":50,"dur":.35,"gain":.7,"delay":0,"lowpassHz":0,"riseSec":0,"distortion":0},{"k":"tone","wave":"sawtooth","f0":260,"f1":90,"dur":.5,"gain":.25,"delay":.02,"lowpassHz":900,"riseSec":.03,"distortion":0},
  {"k":"noise","dur":.12,"gain":.5,"filterHz":[5000,800],"delay":0,"filter":"bandpass","q":.8},{"k":"noise","dur":.5,"gain":.3,"filterHz":[1500,150],"delay":.03,"filter":"lowpass","q":1}]},{"rounds":[6,11],
  "name":"빠우웅","layers":[{"k":"noise","dur":.09,"gain":1,"filterHz":[6000,800],"delay":0,"filter":"bandpass","q":.5},{"k":"tone","wave":"sine","f0":90,"f1":30,"dur":.4,"gain":1,"delay":0,"lowpassHz":0,"riseSec":0,
  "distortion":0},{"k":"tone","wave":"square","f0":1600,"f1":120,"dur":.14,"gain":.3,"delay":0,"lowpassHz":0,"riseSec":0,"distortion":0},{"k":"noise","dur":1.4,"gain":.6,"filterHz":[1800,60],"delay":.02,
  "filter":"lowpass","q":1},{"k":"tone","wave":"sine","f0":48,"f1":26,"dur":1.5,"gain":.95,"delay":0,"lowpassHz":0,"riseSec":.03,"distortion":0},{"k":"tone","wave":"square","f0":110,"f1":55,"dur":1.3,"gain":.35,
  "delay":0,"lowpassHz":700,"riseSec":.04,"distortion":0},{"k":"tone","wave":"sawtooth","f0":130,"f1":48,"dur":1.3,"gain":.45,"delay":0,"lowpassHz":520,"riseSec":.04,"distortion":0},{"k":"tone","wave":"sawtooth",
  "f0":65,"f1":32,"dur":1.4,"gain":.45,"delay":.02,"lowpassHz":260,"riseSec":.05,"distortion":0},{"k":"tone","wave":"sawtooth","f0":420,"f1":90,"dur":.6,"gain":.12,"delay":.03,"lowpassHz":1500,"riseSec":.03,
  "distortion":0}]},{"rounds":[12,12],"name":"과아앙","layers":[{"k":"noise","dur":.12,"gain":1,"filterHz":[8000,400],"delay":0,"filter":"bandpass","q":.5},{"k":"tone","wave":"sine","f0":150,"f1":22,"dur":.7,
  "gain":1,"delay":0,"lowpassHz":0,"riseSec":0,"distortion":4},{"k":"tone","wave":"sine","f0":60,"f1":20,"dur":3,"gain":1,"delay":0,"lowpassHz":0,"riseSec":.05,"distortion":0},{"k":"tone","wave":"sine","f0":34,
  "f1":18,"dur":3.2,"gain":1,"delay":.02,"lowpassHz":0,"riseSec":.08,"distortion":0},{"k":"tone","wave":"sawtooth","f0":100,"f1":28,"dur":2.8,"gain":.7,"delay":0,"lowpassHz":500,"riseSec":.05,"distortion":5},
  {"k":"tone","wave":"square","f0":50,"f1":25,"dur":2.8,"gain":.6,"delay":0,"lowpassHz":250,"riseSec":.05,"distortion":6},{"k":"tone","wave":"sawtooth","f0":46,"f1":22,"dur":3,"gain":.6,"delay":.05,"lowpassHz":200,
  "riseSec":.1,"distortion":4},{"k":"noise","dur":3,"gain":1,"filterHz":[1600,35],"delay":.02,"filter":"lowpass","q":1},{"k":"noise","dur":2.2,"gain":.7,"filterHz":[700,40],"delay":.3,"filter":"lowpass",
  "q":1},{"k":"noise","dur":1.4,"gain":.6,"filterHz":[3000,200],"delay":.9,"filter":"lowpass","q":1},{"k":"tone","wave":"square","f0":2000,"f1":80,"dur":.2,"gain":.35,"delay":0,"lowpassHz":0,"riseSec":0,
  "distortion":0},{"k":"tone","wave":"sawtooth","f0":600,"f1":50,"dur":1,"gain":.25,"delay":.03,"lowpassHz":1800,"riseSec":.03,"distortion":3}]}]}},"fp":{"eye":[-.15,.16,.36],"yawRad":.1},"buyDesc":{"ko":"탄창 12 · 총열 순차 산탄 · 우클릭 레이저",
  "en":"12 rounds · rotating-barrel shotgun · RMB laser"}};

// ---------- atlas: the sheet's materials_new (three tones, the glow pattern) and 'stRed' ----------
// 'stRed' is the engine's 'red' (the same pixels) under its own alpha, ST_RED_A: the view model's shader gives those texels the draw's
// red flare (the sheet's redMaterial); the world model keeps 'red'
const ST_MATS=Object.keys(STK.mats).concat(['stRed']),ST_RED_A=236;
for(const m of ST_MATS){if(GA.idx[m]==null){GA_MATS.push(m);GA.idx[m]=GA_MATS.length-1}}
function paintStAtlas(){const PS=GA.P,cv=GA.canvas;if(!cv)return;const x=cv.getContext('2d');
  const at=n=>{const i=GA.idx[n];return i==null||i>=GA_SLOTS?null:[(i%8)*PS,Math.floor(i/8)*PS]};
  const nz=(X,Y,s,c)=>fbm(X/(c||16),Y/(c||16),s,2,0);
  // the glow pattern (as the Onyx-2's sheet): the three tones in a slow swirl, alpha 232 (a light)
  ST_MATS.forEach((m,mi)=>{const D0=STK.mats[m],o=at(m);if(!D0||!o)return;const c=D0[0],s=2101+mi*10,id=x.getImageData(o[0],o[1],PS,PS),D=id.data;
    for(let y=0;y<PS;y++)for(let xx=0;xx<PS;xx++){const t=nz(o[0]+xx,o[1]+y,s,10),col=t>.62?c[2]:t<.38?c[0]:c[1],r=rgbOf(col),k=(y*PS+xx)*4;D[k]=r[0];D[k+1]=r[1];D[k+2]=r[2];D[k+3]=D0[1]==='glow'?232:255}
    x.putImageData(id,o[0],o[1])});
  const r0=at('red'),r1=at('stRed');if(r0&&r1){const id=x.getImageData(r0[0],r0[1],PS,PS);for(let k=3;k<id.data.length;k+=4)id.data[k]=ST_RED_A;x.putImageData(id,r1[0],r1[1])}
  GA.tex.needsUpdate=true;GA.texVM.needsUpdate=true;for(const k in ICONS)delete ICONS[k]}
{const pc=paintCgAtlas;paintCgAtlas=function(){pc();paintStAtlas()}}

// ---------- the sheet's parts, unchanged: [x, y, z, w, h, d, material, rx, rz, tag] ----------
const ST_TAGS=['','mag','tubeUR','armUR','tubeLR','armLR','tubeLL','armLL','tubeUL','armUL'];
const ST_ROWS=[
[0,-.11,-.18,.07,.13,.42,'gunmetal',0,0,0],[0,-.04,-.205,.06,.02,.37,'steel',0,0,0],[0,-.015,-.6,.09,.05,.4,'blk',0,0,0],[0,.012,-.6,.05,.004,.32,'orangeglow',0,0,0],[-.047,-.04,-.44,.005,.02,.12,'orangeglow',0,0,0],
[-.047,-.09,-.24,.005,.06,.005,'orangeglow',0,0,0],[.047,-.04,-.44,.005,.02,.12,'orangeglow',0,0,0],[.047,-.09,-.24,.005,.06,.005,'orangeglow',0,0,0],[-.037,-.1,-.06,.004,.04,.07,'redglow',0,0,0],
[-.037,-.06,-.1,.004,.015,.05,'redglow',0,0,0],[.037,-.1,-.06,.004,.04,.07,'redglow',0,0,0],[.037,-.06,-.1,.004,.015,.05,'redglow',0,0,0],[0,-.11,-.69,.028,.104,.36,'steel',0,0,0],[0,-.11,-.69,.028,.104,.36,'steel',0,.524,0],
[0,-.11,-.69,.028,.104,.36,'steel',0,1.047,0],[0,-.11,-.69,.028,.104,.36,'steel',0,1.571,0],[0,-.11,-.69,.028,.104,.36,'steel',0,2.094,0],[0,-.11,-.69,.028,.104,.36,'steel',0,2.618,0],[0,-.11,-.88,.042,.156,.03,'blk',0,0,0],
[0,-.11,-.88,.042,.156,.03,'blk',0,.524,0],[0,-.11,-.88,.042,.156,.03,'blk',0,1.047,0],[0,-.11,-.88,.042,.156,.03,'blk',0,1.571,0],[0,-.11,-.88,.042,.156,.03,'blk',0,2.094,0],[0,-.11,-.88,.042,.156,.03,'blk',0,2.618,0],
[0,-.11,-.896,.034,.125,.012,'redglow',0,0,0],[0,-.11,-.896,.034,.125,.012,'redglow',0,.524,0],[0,-.11,-.896,.034,.125,.012,'redglow',0,1.047,0],[0,-.11,-.896,.034,.125,.012,'redglow',0,1.571,0],
[0,-.11,-.896,.034,.125,.012,'redglow',0,2.094,0],[0,-.11,-.896,.034,.125,.012,'redglow',0,2.618,0],[0,-.11,-.902,.025,.094,.012,'blk',0,0,0],[0,-.11,-.902,.025,.094,.012,'blk',0,.524,0],[0,-.11,-.902,.025,.094,.012,'blk',0,1.047,0],
[0,-.11,-.902,.025,.094,.012,'blk',0,1.571,0],[0,-.11,-.902,.025,.094,.012,'blk',0,2.094,0],[0,-.11,-.902,.025,.094,.012,'blk',0,2.618,0],[0,-.11,-.908,.017,.063,.012,'orangeglow',0,0,0],
[0,-.11,-.908,.017,.063,.012,'orangeglow',0,.524,0],[0,-.11,-.908,.017,.063,.012,'orangeglow',0,1.047,0],[0,-.11,-.908,.017,.063,.012,'orangeglow',0,1.571,0],[0,-.11,-.908,.017,.063,.012,'orangeglow',0,2.094,0],
[0,-.11,-.908,.017,.063,.012,'orangeglow',0,2.618,0],[0,-.11,-.52,.14,.07,.03,'blk',0,0,0],[0,-.21,0,.034,.11,.044,'rub',-.2,0,0],[0,-.2,-.08,.01,.052,.012,'gunmetal',0,0,0],[0,-.223,-.05,.012,.01,.064,'gunmetal',0,0,0],
[0,-.191,-.045,.008,.034,.01,'bright',.15,0,0],[0,-.075,.01,.05,.09,.027,'gunmetal',0,0,0],[0,-.08,.034,.05,.1,.027,'gunmetal',0,0,0],[0,-.085,.058,.05,.11,.027,'gunmetal',0,0,0],[0,-.09,.082,.05,.12,.027,'gunmetal',0,0,0],
[0,-.095,.106,.05,.13,.027,'gunmetal',0,0,0],[0,-.1,.13,.05,.14,.027,'gunmetal',0,0,0],[0,-.105,.154,.05,.15,.027,'gunmetal',0,0,0],[0,-.11,.178,.05,.16,.027,'gunmetal',0,0,0],[0,-.115,.202,.05,.17,.027,'gunmetal',0,0,0],
[0,-.12,.226,.05,.18,.027,'gunmetal',0,0,0],[0,-.12,.242,.056,.19,.014,'rub',0,0,0],[0,-.025,.13,.04,.01,.22,'blk',0,0,0],[0,-.29,-.26,.09,.231,.046,'gunmetal',0,0,1],[0,-.29,-.26,.09,.231,.046,'gunmetal',.393,0,1],
[0,-.29,-.26,.09,.231,.046,'gunmetal',.785,0,1],[0,-.29,-.26,.09,.231,.046,'gunmetal',1.178,0,1],[0,-.29,-.26,.09,.231,.046,'gunmetal',1.571,0,1],[0,-.29,-.26,.09,.231,.046,'gunmetal',1.963,0,1],
[0,-.29,-.26,.09,.231,.046,'gunmetal',2.356,0,1],[0,-.29,-.26,.09,.231,.046,'gunmetal',2.749,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',0,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',.393,0,1],
[-.049,-.29,-.26,.014,.245,.049,'blk',.785,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',1.178,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',1.571,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',1.963,0,1],
[-.049,-.29,-.26,.014,.245,.049,'blk',2.356,0,1],[-.049,-.29,-.26,.014,.245,.049,'blk',2.749,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',0,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',.393,0,1],
[-.058,-.29,-.26,.006,.157,.031,'red',.785,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',1.178,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',1.571,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',1.963,0,1],
[-.058,-.29,-.26,.006,.157,.031,'red',2.356,0,1],[-.058,-.29,-.26,.006,.157,.031,'red',2.749,0,1],[-.062,-.29,-.26,.006,.106,.028,'blk',0,0,1],[-.062,-.29,-.26,.006,.106,.028,'blk',.524,0,1],
[-.062,-.29,-.26,.006,.106,.028,'blk',1.047,0,1],[-.062,-.29,-.26,.006,.106,.028,'blk',1.571,0,1],[-.062,-.29,-.26,.006,.106,.028,'blk',2.094,0,1],[-.062,-.29,-.26,.006,.106,.028,'blk',2.618,0,1],
[-.065,-.29,-.26,.006,.058,.016,'redglow',0,0,1],[-.065,-.29,-.26,.006,.058,.016,'redglow',.524,0,1],[-.065,-.29,-.26,.006,.058,.016,'redglow',1.047,0,1],[-.065,-.29,-.26,.006,.058,.016,'redglow',1.571,0,1],
[-.065,-.29,-.26,.006,.058,.016,'redglow',2.094,0,1],[-.065,-.29,-.26,.006,.058,.016,'redglow',2.618,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',0,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',.393,0,1],
[.049,-.29,-.26,.014,.245,.049,'blk',.785,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',1.178,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',1.571,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',1.963,0,1],
[.049,-.29,-.26,.014,.245,.049,'blk',2.356,0,1],[.049,-.29,-.26,.014,.245,.049,'blk',2.749,0,1],[.058,-.29,-.26,.006,.157,.031,'red',0,0,1],[.058,-.29,-.26,.006,.157,.031,'red',.393,0,1],[.058,-.29,-.26,.006,.157,.031,'red',.785,0,1],
[.058,-.29,-.26,.006,.157,.031,'red',1.178,0,1],[.058,-.29,-.26,.006,.157,.031,'red',1.571,0,1],[.058,-.29,-.26,.006,.157,.031,'red',1.963,0,1],[.058,-.29,-.26,.006,.157,.031,'red',2.356,0,1],
[.058,-.29,-.26,.006,.157,.031,'red',2.749,0,1],[.062,-.29,-.26,.006,.106,.028,'blk',0,0,1],[.062,-.29,-.26,.006,.106,.028,'blk',.524,0,1],[.062,-.29,-.26,.006,.106,.028,'blk',1.047,0,1],[.062,-.29,-.26,.006,.106,.028,'blk',1.571,0,1],
[.062,-.29,-.26,.006,.106,.028,'blk',2.094,0,1],[.062,-.29,-.26,.006,.106,.028,'blk',2.618,0,1],[.065,-.29,-.26,.006,.058,.016,'redglow',0,0,1],[.065,-.29,-.26,.006,.058,.016,'redglow',.524,0,1],
[.065,-.29,-.26,.006,.058,.016,'redglow',1.047,0,1],[.065,-.29,-.26,.006,.058,.016,'redglow',1.571,0,1],[.065,-.29,-.26,.006,.058,.016,'redglow',2.094,0,1],[.065,-.29,-.26,.006,.058,.016,'redglow',2.618,0,1],
[0,-.29,-.382,.1,.022,.016,'blk',0,0,1],[0,-.243,-.373,.1,.022,.016,'red',.393,0,1],[0,-.204,-.346,.1,.022,.016,'blk',.785,0,1],[0,-.177,-.307,.1,.022,.016,'red',1.178,0,1],[0,-.168,-.26,.1,.022,.016,'blk',1.571,0,1],
[0,-.177,-.213,.1,.022,.016,'red',1.963,0,1],[0,-.204,-.174,.1,.022,.016,'blk',2.356,0,1],[0,-.243,-.147,.1,.022,.016,'red',2.749,0,1],[0,-.29,-.138,.1,.022,.016,'blk',3.142,0,1],[0,-.337,-.147,.1,.022,.016,'red',-2.749,0,1],
[0,-.376,-.174,.1,.022,.016,'blk',-2.356,0,1],[0,-.403,-.213,.1,.022,.016,'red',-1.963,0,1],[0,-.412,-.26,.1,.022,.016,'blk',-1.571,0,1],[0,-.403,-.307,.1,.022,.016,'red',-1.178,0,1],[0,-.376,-.346,.1,.022,.016,'blk',-.785,0,1],
[0,-.337,-.373,.1,.022,.016,'red',-.393,0,1],[.075,-.035,-.59,.034,.059,.3,'gunmetal',0,0,2],[.075,-.035,-.59,.034,.059,.3,'gunmetal',0,1.047,2],[.075,-.035,-.59,.034,.059,.3,'gunmetal',0,2.094,2],
[.075,.003,-.59,.008,.02,.3,'redglow',0,0,2],[.075,.003,-.59,.008,.02,.3,'redglow',0,.785,2],[.075,.003,-.59,.008,.02,.3,'redglow',0,1.571,2],[.075,.003,-.59,.008,.02,.3,'redglow',0,2.356,2],
[.045,.003,-.44,.14,.014,.014,'redglow',0,0,2],[.075,.003,-.44,.024,.024,.024,'blk',0,0,2],[.075,.001,-.52,.026,.026,.014,'blk',0,0,2],[.075,.001,-.66,.026,.026,.014,'blk',0,0,2],[.075,-.035,-.54,.04,.069,.022,'blk',0,0,2],
[.075,-.035,-.54,.04,.069,.022,'blk',0,1.047,2],[.075,-.035,-.54,.04,.069,.022,'blk',0,2.094,2],[.075,-.035,-.46,.04,.069,.022,'blk',0,0,2],[.075,-.035,-.46,.04,.069,.022,'blk',0,1.047,2],
[.075,-.035,-.46,.04,.069,.022,'blk',0,2.094,2],[.057,-.057,-.415,.115,.105,.06,'blk',0,0,2],[.057,-.057,-.446,.07,.006,.003,'orangeglow',0,0,2],[.029,-.081,-.415,.13,.018,.018,'steel',0,.785,2],
[.029,-.081,-.415,.13,.006,.022,'orangeglow',0,.785,2],[.075,-.035,-.84,.034,.059,.2,'steel',0,0,3],[.075,-.035,-.84,.034,.059,.2,'steel',0,1.047,3],[.075,-.035,-.84,.034,.059,.2,'steel',0,2.094,3],
[.075,.003,-.86,.008,.02,.24,'redglow',0,0,3],[.075,.003,-.86,.008,.02,.24,'redglow',0,.785,3],[.075,.003,-.86,.008,.02,.24,'redglow',0,1.571,3],[.075,.003,-.86,.008,.02,.24,'redglow',0,2.356,3],
[.075,-.035,-.94,.044,.076,.08,'blk',0,0,3],[.075,-.035,-.94,.044,.076,.08,'blk',0,1.047,3],[.075,-.035,-.94,.044,.076,.08,'blk',0,2.094,3],[.075,-.035,-.981,.028,.048,.004,'muzzle',0,0,3],
[.075,-.035,-.981,.028,.048,.004,'muzzle',0,1.047,3],[.075,-.035,-.981,.028,.048,.004,'muzzle',0,2.094,3],[.075,-.002,-.84,.012,.005,.16,'orangeglow',0,0,3],[.108,-.035,-.84,.005,.012,.16,'orangeglow',0,0,3],
[.075,-.185,-.59,.034,.059,.3,'gunmetal',0,0,4],[.075,-.185,-.59,.034,.059,.3,'gunmetal',0,1.047,4],[.075,-.185,-.59,.034,.059,.3,'gunmetal',0,2.094,4],[.075,-.223,-.59,.008,.02,.3,'redglow',0,0,4],
[.075,-.223,-.59,.008,.02,.3,'redglow',0,.785,4],[.075,-.223,-.59,.008,.02,.3,'redglow',0,1.571,4],[.075,-.223,-.59,.008,.02,.3,'redglow',0,2.356,4],[.045,-.223,-.44,.14,.014,.014,'redglow',0,0,4],
[.075,-.223,-.44,.024,.024,.024,'blk',0,0,4],[.075,-.221,-.52,.026,.026,.014,'blk',0,0,4],[.075,-.221,-.66,.026,.026,.014,'blk',0,0,4],[.075,-.185,-.54,.04,.069,.022,'blk',0,0,4],[.075,-.185,-.54,.04,.069,.022,'blk',0,1.047,4],
[.075,-.185,-.54,.04,.069,.022,'blk',0,2.094,4],[.075,-.185,-.46,.04,.069,.022,'blk',0,0,4],[.075,-.185,-.46,.04,.069,.022,'blk',0,1.047,4],[.075,-.185,-.46,.04,.069,.022,'blk',0,2.094,4],[.057,-.162,-.415,.115,.105,.06,'blk',0,0,4],
[.057,-.162,-.446,.07,.006,.003,'orangeglow',0,0,4],[.029,-.139,-.415,.13,.018,.018,'steel',0,-.785,4],[.029,-.139,-.415,.13,.006,.022,'orangeglow',0,-.785,4],[.075,-.185,-.84,.034,.059,.2,'steel',0,0,5],
[.075,-.185,-.84,.034,.059,.2,'steel',0,1.047,5],[.075,-.185,-.84,.034,.059,.2,'steel',0,2.094,5],[.075,-.223,-.86,.008,.02,.24,'redglow',0,0,5],[.075,-.223,-.86,.008,.02,.24,'redglow',0,.785,5],
[.075,-.223,-.86,.008,.02,.24,'redglow',0,1.571,5],[.075,-.223,-.86,.008,.02,.24,'redglow',0,2.356,5],[.075,-.185,-.94,.044,.076,.08,'blk',0,0,5],[.075,-.185,-.94,.044,.076,.08,'blk',0,1.047,5],
[.075,-.185,-.94,.044,.076,.08,'blk',0,2.094,5],[.075,-.185,-.981,.028,.048,.004,'muzzle',0,0,5],[.075,-.185,-.981,.028,.048,.004,'muzzle',0,1.047,5],[.075,-.185,-.981,.028,.048,.004,'muzzle',0,2.094,5],
[.075,-.218,-.84,.012,.005,.16,'orangeglow',0,0,5],[.108,-.185,-.84,.005,.012,.16,'orangeglow',0,0,5],[-.075,-.185,-.59,.034,.059,.3,'gunmetal',0,0,6],[-.075,-.185,-.59,.034,.059,.3,'gunmetal',0,1.047,6],
[-.075,-.185,-.59,.034,.059,.3,'gunmetal',0,2.094,6],[-.075,-.223,-.59,.008,.02,.3,'redglow',0,0,6],[-.075,-.223,-.59,.008,.02,.3,'redglow',0,.785,6],[-.075,-.223,-.59,.008,.02,.3,'redglow',0,1.571,6],
[-.075,-.223,-.59,.008,.02,.3,'redglow',0,2.356,6],[-.045,-.223,-.44,.14,.014,.014,'redglow',0,0,6],[-.075,-.223,-.44,.024,.024,.024,'blk',0,0,6],[-.075,-.221,-.52,.026,.026,.014,'blk',0,0,6],
[-.075,-.221,-.66,.026,.026,.014,'blk',0,0,6],[-.075,-.185,-.54,.04,.069,.022,'blk',0,0,6],[-.075,-.185,-.54,.04,.069,.022,'blk',0,1.047,6],[-.075,-.185,-.54,.04,.069,.022,'blk',0,2.094,6],[-.075,-.185,-.46,.04,.069,.022,'blk',0,0,6],
[-.075,-.185,-.46,.04,.069,.022,'blk',0,1.047,6],[-.075,-.185,-.46,.04,.069,.022,'blk',0,2.094,6],[-.057,-.162,-.415,.115,.105,.06,'blk',0,0,6],[-.057,-.162,-.446,.07,.006,.003,'orangeglow',0,0,6],
[-.029,-.139,-.415,.13,.018,.018,'steel',0,-2.356,6],[-.029,-.139,-.415,.13,.006,.022,'orangeglow',0,-2.356,6],[-.075,-.185,-.84,.034,.059,.2,'steel',0,0,7],[-.075,-.185,-.84,.034,.059,.2,'steel',0,1.047,7],
[-.075,-.185,-.84,.034,.059,.2,'steel',0,2.094,7],[-.075,-.223,-.86,.008,.02,.24,'redglow',0,0,7],[-.075,-.223,-.86,.008,.02,.24,'redglow',0,.785,7],[-.075,-.223,-.86,.008,.02,.24,'redglow',0,1.571,7],
[-.075,-.223,-.86,.008,.02,.24,'redglow',0,2.356,7],[-.075,-.185,-.94,.044,.076,.08,'blk',0,0,7],[-.075,-.185,-.94,.044,.076,.08,'blk',0,1.047,7],[-.075,-.185,-.94,.044,.076,.08,'blk',0,2.094,7],
[-.075,-.185,-.981,.028,.048,.004,'muzzle',0,0,7],[-.075,-.185,-.981,.028,.048,.004,'muzzle',0,1.047,7],[-.075,-.185,-.981,.028,.048,.004,'muzzle',0,2.094,7],[-.075,-.218,-.84,.012,.005,.16,'orangeglow',0,0,7],
[-.108,-.185,-.84,.005,.012,.16,'orangeglow',0,0,7],[-.075,-.035,-.59,.034,.059,.3,'gunmetal',0,0,8],[-.075,-.035,-.59,.034,.059,.3,'gunmetal',0,1.047,8],[-.075,-.035,-.59,.034,.059,.3,'gunmetal',0,2.094,8],
[-.075,.003,-.59,.008,.02,.3,'redglow',0,0,8],[-.075,.003,-.59,.008,.02,.3,'redglow',0,.785,8],[-.075,.003,-.59,.008,.02,.3,'redglow',0,1.571,8],[-.075,.003,-.59,.008,.02,.3,'redglow',0,2.356,8],
[-.045,.003,-.44,.14,.014,.014,'redglow',0,0,8],[-.075,.003,-.44,.024,.024,.024,'blk',0,0,8],[-.075,.001,-.52,.026,.026,.014,'blk',0,0,8],[-.075,.001,-.66,.026,.026,.014,'blk',0,0,8],[-.075,-.035,-.54,.04,.069,.022,'blk',0,0,8],
[-.075,-.035,-.54,.04,.069,.022,'blk',0,1.047,8],[-.075,-.035,-.54,.04,.069,.022,'blk',0,2.094,8],[-.075,-.035,-.46,.04,.069,.022,'blk',0,0,8],[-.075,-.035,-.46,.04,.069,.022,'blk',0,1.047,8],
[-.075,-.035,-.46,.04,.069,.022,'blk',0,2.094,8],[-.057,-.057,-.415,.115,.105,.06,'blk',0,0,8],[-.057,-.057,-.446,.07,.006,.003,'orangeglow',0,0,8],[-.029,-.081,-.415,.13,.018,.018,'steel',0,2.356,8],
[-.029,-.081,-.415,.13,.006,.022,'orangeglow',0,2.356,8],[-.075,-.035,-.84,.034,.059,.2,'steel',0,0,9],[-.075,-.035,-.84,.034,.059,.2,'steel',0,1.047,9],[-.075,-.035,-.84,.034,.059,.2,'steel',0,2.094,9],
[-.075,.003,-.86,.008,.02,.24,'redglow',0,0,9],[-.075,.003,-.86,.008,.02,.24,'redglow',0,.785,9],[-.075,.003,-.86,.008,.02,.24,'redglow',0,1.571,9],[-.075,.003,-.86,.008,.02,.24,'redglow',0,2.356,9],
[-.075,-.035,-.94,.044,.076,.08,'blk',0,0,9],[-.075,-.035,-.94,.044,.076,.08,'blk',0,1.047,9],[-.075,-.035,-.94,.044,.076,.08,'blk',0,2.094,9],[-.075,-.035,-.981,.028,.048,.004,'muzzle',0,0,9],
[-.075,-.035,-.981,.028,.048,.004,'muzzle',0,1.047,9],[-.075,-.035,-.981,.028,.048,.004,'muzzle',0,2.094,9],[-.075,-.002,-.84,.012,.005,.16,'orangeglow',0,0,9],[-.108,-.035,-.84,.005,.012,.16,'orangeglow',0,0,9],
[0,-.205,-.56,.1,.05,.36,'blk',0,0,0],[0,-.11,-.415,.07,.07,.06,'blk',0,0,0],[0,-.11,-.445,.04,.04,.004,'orangeglow',0,0,0],[0,-.025,-.06,.032,.025,.09,'blk',0,0,0],[0,-.025,-.02,.02,.014,.02,'redglow',0,0,0],
[-.04,-.11,-.225,.012,.1,.33,'steel',0,0,0],[-.046,-.09,-.16,.006,.05,.15,'blk',0,0,0],[-.049,-.125,-.1,.004,.009,.05,'redglow',0,0,0],[-.049,-.109,-.1,.004,.009,.05,'redglow',0,0,0],[-.049,-.093,-.1,.004,.009,.05,'redglow',0,0,0],
[-.047,-.14,-.24,.008,.008,.008,'brass',0,0,0],[-.047,-.07,-.24,.008,.008,.008,'brass',0,0,0],[-.047,-.14,-.18,.008,.008,.008,'brass',0,0,0],[-.047,-.07,-.18,.008,.008,.008,'brass',0,0,0],[-.047,-.14,-.12,.008,.008,.008,'brass',0,0,0],
[-.047,-.07,-.12,.008,.008,.008,'brass',0,0,0],[-.047,-.07,-.06,.008,.008,.008,'brass',0,0,0],[-.046,-.015,-.44,.004,.03,.022,'muzzle',0,0,0],[-.046,-.015,-.49,.004,.03,.022,'muzzle',0,0,0],
[-.046,-.015,-.54,.004,.03,.022,'muzzle',0,0,0],[-.046,-.015,-.59,.004,.03,.022,'muzzle',0,0,0],[-.046,-.015,-.64,.004,.03,.022,'muzzle',0,0,0],[-.046,-.015,-.69,.004,.03,.022,'muzzle',0,0,0],
[-.046,.002,-.61,.004,.006,.36,'orangeglow',0,0,0],[-.048,-.14,-.035,.016,.07,.09,'gunmetal',0,0,0],[-.057,-.13,-.035,.003,.02,.05,'redglow',0,0,0],[-.075,-.11,-.65,.06,.092,.42,'gunmetal',0,0,0],
[-.112,-.11,-.58,.014,.014,.4,'redglow',0,0,0],[-.08,-.11,-.38,.07,.014,.014,'redglow',0,0,0],[-.112,-.11,-.44,.024,.024,.014,'blk',0,0,0],[-.112,-.11,-.53,.024,.024,.014,'blk',0,0,0],[-.112,-.11,-.62,.024,.024,.014,'blk',0,0,0],
[-.112,-.11,-.71,.024,.024,.014,'blk',0,0,0],[-.02,-.21,0,.004,.09,.03,'steel',-.2,0,0],[-.026,-.09,.12,.004,.05,.14,'orangeglow',0,0,0],[-.028,-.06,.18,.004,.015,.04,'redglow',0,0,0],[.04,-.11,-.225,.012,.1,.33,'steel',0,0,0],
[.046,-.09,-.16,.006,.05,.15,'blk',0,0,0],[.049,-.125,-.1,.004,.009,.05,'redglow',0,0,0],[.049,-.109,-.1,.004,.009,.05,'redglow',0,0,0],[.049,-.093,-.1,.004,.009,.05,'redglow',0,0,0],[.047,-.14,-.24,.008,.008,.008,'brass',0,0,0],
[.047,-.07,-.24,.008,.008,.008,'brass',0,0,0],[.047,-.14,-.18,.008,.008,.008,'brass',0,0,0],[.047,-.07,-.18,.008,.008,.008,'brass',0,0,0],[.047,-.14,-.12,.008,.008,.008,'brass',0,0,0],[.047,-.07,-.12,.008,.008,.008,'brass',0,0,0],
[.047,-.07,-.06,.008,.008,.008,'brass',0,0,0],[.046,-.015,-.44,.004,.03,.022,'muzzle',0,0,0],[.046,-.015,-.49,.004,.03,.022,'muzzle',0,0,0],[.046,-.015,-.54,.004,.03,.022,'muzzle',0,0,0],[.046,-.015,-.59,.004,.03,.022,'muzzle',0,0,0],
[.046,-.015,-.64,.004,.03,.022,'muzzle',0,0,0],[.046,-.015,-.69,.004,.03,.022,'muzzle',0,0,0],[.047,.002,-.61,.004,.006,.36,'orangeglow',0,0,0],[.048,-.14,-.035,.016,.07,.09,'gunmetal',0,0,0],
[.057,-.13,-.035,.003,.02,.05,'redglow',0,0,0],[.075,-.11,-.65,.06,.092,.42,'gunmetal',0,0,0],[.112,-.11,-.58,.014,.014,.4,'redglow',0,0,0],[.08,-.11,-.38,.07,.014,.014,'redglow',0,0,0],[.112,-.11,-.44,.024,.024,.014,'blk',0,0,0],
[.112,-.11,-.53,.024,.024,.014,'blk',0,0,0],[.112,-.11,-.62,.024,.024,.014,'blk',0,0,0],[.112,-.11,-.71,.024,.024,.014,'blk',0,0,0],[.02,-.21,0,.004,.09,.03,'steel',-.2,0,0],[.026,-.09,.12,.004,.05,.14,'orangeglow',0,0,0],
[.028,-.06,.18,.004,.015,.04,'redglow',0,0,0],[-.046,-.11,-.325,.006,.06,.09,'blk',0,0,0],[.046,-.11,-.325,.006,.06,.09,'blk',0,0,0],[-.045,-.065,-.14,.008,.03,.14,'blk',0,0,0],[-.049,-.065,-.14,.002,.006,.12,'orangeglow',0,0,0],
[-.045,-.155,-.18,.008,.014,.24,'steel',0,0,0],[-.05,-.165,-.325,.014,.02,.12,'blk',0,0,0],[-.049,-.11,-.37,.003,.08,.01,'muzzle',0,0,0],[-.049,-.11,-.348,.003,.08,.01,'muzzle',0,0,0],[-.049,-.11,-.326,.003,.08,.01,'muzzle',0,0,0],
[-.049,-.11,-.304,.003,.08,.01,'muzzle',0,0,0],[-.049,-.11,-.282,.003,.08,.01,'muzzle',0,0,0],[-.056,-.068,-.325,.008,.02,.1,'redglow',0,0,0],[-.056,-.068,-.325,.008,.02,.1,'redglow',0,.785,0],
[-.056,-.068,-.325,.008,.02,.1,'redglow',0,1.571,0],[-.056,-.068,-.325,.008,.02,.1,'redglow',0,2.356,0],[-.05,-.068,-.36,.012,.016,.012,'blk',0,0,0],[-.05,-.068,-.29,.012,.016,.012,'blk',0,0,0],
[-.046,-.01,-.43,.008,.008,.008,'bright',0,0,0],[-.05,-.205,-.44,.004,.03,.025,'muzzle',0,0,0],[-.046,-.01,-.5,.008,.008,.008,'bright',0,0,0],[-.05,-.205,-.5,.004,.03,.025,'muzzle',0,0,0],
[-.046,-.01,-.57,.008,.008,.008,'bright',0,0,0],[-.05,-.205,-.56,.004,.03,.025,'muzzle',0,0,0],[-.046,-.01,-.64,.008,.008,.008,'bright',0,0,0],[-.05,-.205,-.62,.004,.03,.025,'muzzle',0,0,0],
[-.046,-.01,-.71,.008,.008,.008,'bright',0,0,0],[-.05,-.205,-.68,.004,.03,.025,'muzzle',0,0,0],[-.106,-.13,-.64,.004,.022,.34,'muzzle',0,0,0],[-.106,-.09,-.64,.004,.022,.34,'muzzle',0,0,0],
[-.107,-.11,-.485,.006,.085,.014,'steel',0,0,0],[-.107,-.11,-.575,.006,.085,.014,'steel',0,0,0],[-.107,-.11,-.665,.006,.085,.014,'steel',0,0,0],[-.107,-.11,-.755,.006,.085,.014,'steel',0,0,0],
[-.026,-.06,.09,.005,.012,.02,'redglow',0,0,0],[-.026,-.06,.125,.005,.012,.02,'redglow',0,0,0],[-.026,-.06,.16,.005,.012,.02,'redglow',0,0,0],[-.05,-.04,-.07,.014,.02,.1,'steel',0,0,0],
[-.058,-.04,-.07,.003,.008,.08,'orangeglow',0,0,0],[.045,-.065,-.14,.008,.03,.14,'blk',0,0,0],[.05,-.065,-.14,.002,.006,.12,'orangeglow',0,0,0],[.045,-.155,-.18,.008,.014,.24,'steel',0,0,0],[.05,-.165,-.325,.014,.02,.12,'blk',0,0,0],
[.05,-.11,-.37,.003,.08,.01,'muzzle',0,0,0],[.05,-.11,-.348,.003,.08,.01,'muzzle',0,0,0],[.05,-.11,-.326,.003,.08,.01,'muzzle',0,0,0],[.05,-.11,-.304,.003,.08,.01,'muzzle',0,0,0],[.05,-.11,-.282,.003,.08,.01,'muzzle',0,0,0],
[.056,-.068,-.325,.008,.02,.1,'redglow',0,0,0],[.056,-.068,-.325,.008,.02,.1,'redglow',0,.785,0],[.056,-.068,-.325,.008,.02,.1,'redglow',0,1.571,0],[.056,-.068,-.325,.008,.02,.1,'redglow',0,2.356,0],
[.05,-.068,-.36,.012,.016,.012,'blk',0,0,0],[.05,-.068,-.29,.012,.016,.012,'blk',0,0,0],[.047,-.01,-.43,.008,.008,.008,'bright',0,0,0],[.051,-.205,-.44,.004,.03,.025,'muzzle',0,0,0],[.047,-.01,-.5,.008,.008,.008,'bright',0,0,0],
[.051,-.205,-.5,.004,.03,.025,'muzzle',0,0,0],[.047,-.01,-.57,.008,.008,.008,'bright',0,0,0],[.051,-.205,-.56,.004,.03,.025,'muzzle',0,0,0],[.047,-.01,-.64,.008,.008,.008,'bright',0,0,0],[.051,-.205,-.62,.004,.03,.025,'muzzle',0,0,0],
[.047,-.01,-.71,.008,.008,.008,'bright',0,0,0],[.051,-.205,-.68,.004,.03,.025,'muzzle',0,0,0],[.106,-.13,-.64,.004,.022,.34,'muzzle',0,0,0],[.106,-.09,-.64,.004,.022,.34,'muzzle',0,0,0],[.107,-.11,-.485,.006,.085,.014,'steel',0,0,0],
[.107,-.11,-.575,.006,.085,.014,'steel',0,0,0],[.107,-.11,-.665,.006,.085,.014,'steel',0,0,0],[.107,-.11,-.755,.006,.085,.014,'steel',0,0,0],[.026,-.06,.09,.005,.012,.02,'redglow',0,0,0],[.026,-.06,.125,.005,.012,.02,'redglow',0,0,0],
[.026,-.06,.16,.005,.012,.02,'redglow',0,0,0],[.05,-.04,-.07,.014,.02,.1,'steel',0,0,0],[.059,-.04,-.07,.003,.008,.08,'orangeglow',0,0,0],[0,.016,-.74,.03,.014,.036,'blk',0,0,0],[0,.029,-.725,.012,.041,.004,'bright',0,0,0],
[0,.027,-.728,.012,.037,.004,'bright',0,0,0],[0,.025,-.731,.012,.033,.004,'bright',0,0,0],[0,.023,-.735,.012,.029,.004,'bright',0,0,0],[0,.021,-.738,.012,.025,.004,'bright',0,0,0],[0,.019,-.742,.012,.021,.004,'bright',0,0,0],
[0,.017,-.745,.012,.017,.004,'bright',0,0,0],[0,.015,-.748,.012,.013,.004,'bright',0,0,0],[0,.013,-.752,.012,.009,.004,'bright',0,0,0],[0,.011,-.755,.012,.005,.004,'bright',0,0,0],[0,.048,-.726,.008,.008,.008,'redglow',0,0,0],
[0,.016,-.44,.04,.014,.046,'blk',0,0,0],[0,.027,-.422,.03,.036,.005,'bright',0,0,0],[0,.025,-.426,.03,.033,.005,'bright',0,0,0],[0,.023,-.43,.03,.029,.005,'bright',0,0,0],[0,.021,-.434,.03,.026,.005,'bright',0,0,0],
[0,.02,-.438,.03,.022,.005,'bright',0,0,0],[0,.018,-.442,.03,.019,.005,'bright',0,0,0],[0,.016,-.446,.03,.015,.005,'bright',0,0,0],[0,.014,-.45,.03,.012,.005,'bright',0,0,0],[0,.011,-.458,.03,.005,.005,'bright',0,0,0]];

// the view model's parts ('red' drawn as 'stRed'), the world model's (plain boxes, 'red'), and the world model in B (the motions baked)
const ST_P=ST_ROWS.map(r=>{const o={};if(r[7])o.rx=r[7];if(r[8])o.rz=r[8];const p=Pt(r[0],r[1],r[2],r[3],r[4],r[5],r[6]==='red'?'stRed':r[6],o);if(r[9])p.tag=ST_TAGS[r[9]];return p});
const ST_TUBES=STK.ammo.tubeOrder;// UL, UR, LL, LR: the firing order (and the tubes' slots below)
const ST_W=p=>{const q=Object.assign({},p,{r:0});delete q.tag;if(q.m==='stRed')q.m='red';return q};
// a barrel's tip in its arm's frame (the arm turns about its pivot): the front of its parts
const ST_TIP=Object.fromEntries(ST_TUBES.map(n=>{const P0=STK.pivots['arm'+n];let z=0;for(const p of ST_P)if(p.tag==='arm'+n)z=Math.min(z,p.c[2]-p.s[2]/2-P0[2]);return [n,z]}));
function stBakeB(){const q=new THREE.Quaternion(),qp=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),ax=new THREE.Vector3(),MB=STK.motions.modeB.tags;
  return ST_P.map(p=>{const w=ST_W(p),M=p.tag&&MB[p.tag];if(!M)return w;const tr=M.translate||[0,0,0];
    if(!M.rotate){w.c=[p.c[0]+tr[0],p.c[1]+tr[1],p.c[2]+tr[2]];return w}
    const P0=STK.pivots[M.rotate.pivot];ax.set(M.rotate.axis[0],M.rotate.axis[1],M.rotate.axis[2]).normalize();q.setFromAxisAngle(ax,M.rotate.rad);
    v.set(p.c[0]-P0[0],p.c[1]-P0[1],p.c[2]-P0[2]).applyQuaternion(q);w.c=[P0[0]+tr[0]+v.x,P0[1]+tr[1]+v.y,P0[2]+tr[2]+v.z];
    e.set(p.rx||0,p.ry||0,p.rz||0,'XYZ');qp.setFromEuler(e).premultiply(q);e.setFromQuaternion(qp,'XYZ');w.rx=e.x;w.ry=e.y;w.rz=e.z;return w})}
const ST_G={grip:STK.points.grip,sup:STK.points.sup,muzzle:STK.points.muzzle,mag:STK.points.mag};
GUNS.startrack=Object.assign({parts:ST_P,wid:'startrackw',piv:Object.fromEntries(ST_TUBES.map(n=>['arm'+n,STK.pivots['arm'+n]]))},ST_G);
GUNS.startrackw=Object.assign({parts:ST_P.map(ST_W)},ST_G);
GUNS.startrackwb=Object.assign({parts:stBakeB()},ST_G);

// ---------- the weapon (the sheet's stats) ----------
const STS=STK.stats,STA=STK.aMode,STB=STK.bMode;
WPN.startrack={slot:1,kind:'shotgun',crate:1,cat:'shotgun',n:['스타트랙','StarTrack'],cost:6000,mag:STS.mag,res:STS.res,dmg:STS.dmg,pellets:STS.pellets,
  hs:STS.hs,limbK:STA.pelletDamage.limb/STA.pelletDamage.body,rpm:STS.rpm,spread:STS.spread.slice(),rec:STS.rec.slice(),kb:STS.kb,stag:STS.stag,reload:STS.reload,
  draw:STS.draw,speed:STS.speed,snd:'stShotA',drawS:'stDraw',model:'startrack',hold:'rifle',shell:0,ch:STS.ch,alt:'startrack',rail:1,stA:1,
  // (rail: the round goes through tbShot, here the sheet's hit rule; no kick of the whole gun — the barrel that fired kicks, the sheet's
  // fireKick; range: B's beam reaches as far as the map goes; dmgB: the most one beam can do, for the host's check of a claimed hit)
  kickX:[0,0,0],drKey:'drST',range:300,dmgB:STB.perRound.head*STS.mag,bd:[STK.buyDesc.ko,STK.buyDesc.en]};
VMK.drST=[[0,[0,0,0,0,0,0]],[1,[0,0,0,0,0,0]]];// (the draw's own lift is the sheet's: VMX.startrack)
VM_POS.startrack={p:[-STK.fp.eye[0],-STK.fp.eye[1],-STK.fp.eye[2]],r:[0,STK.fp.yawRad,0]};
{const c=BUY_MENU.find(q=>q.k==='shotgun');if(c&&!c.items.includes('startrack'))c.items.push('startrack')}// v7.3.1: with the shotguns (was 특수 · 근접)
CRATE_GUNS.push('startrack');
// first draw (the sheet's): spin, the extra .4 s, heavy .6 — its motor sound left out (the sheet allows its own sounds only)
GUN_DESIGN.startrack=Object.assign({mag:STS.mag,ch:STS.ch},STK.firstDraw,{snd:['',0,1]});WPN.startrack.fd=GUN_DESIGN.startrack;

// ---------- the state of one gun in a hand (every page keeps it for what it shows; the page that owns the body decides) ----------
// B / k (0 A .. 1 B, linear over the switch; shown eased), ph '' / 'chg' / 'beam', t the time in it, tier, n the rounds at the pull,
// heat (the glow), ret (back to A after a beam), tubes (rounds in UL, UR, LL, LR), ti the next barrel, kick / fl the last shot's kick and
// flash per barrel, dp the time since the draw, rq a reload waiting for the barrels to come back, rel the reload's timeline
function stS(a){return a.stk||(a.stk={B:false,k:0,ph:'',t:0,tier:0,n:0,heat:0,ret:false,tubes:[0,0,0,0],ti:0,kick:[9,9,9,9],fl:[0,0,0,0],dp:9,rq:false,rel:null,end:null,botT:0,tubeNet:-1,w:null})}
// the tubes: filled in the sheet's order, three each, from the magazine's count; the next one that still has a round
function stFill(S,n){const R=STK.ammo.roundsPerTube;for(let i=0;i<4;i++)S.tubes[i]=Math.max(0,Math.min(R,n-i*R));S.ti=0}
function stSync(S,am){if(am&&S.tubes[0]+S.tubes[1]+S.tubes[2]+S.tubes[3]!==am.mag)stFill(S,am.mag)}
function stNext(S){for(let j=0;j<4;j++){const i=(S.ti+j)%4;if(S.tubes[i]>0)return i}return S.ti%4}
function stTierOf(n){const T=STB.tiers;for(let i=0;i<T.length;i++)if(n>=T[i].rounds[0]&&n<=T[i].rounds[1])return i;return n>T[T.length-1].rounds[1]?T.length-1:0}
function stReset(a,own){const S=a.stk;if(!S)return;const was=S.B||S.k>0||!!S.ph;S.B=false;S.k=0;S.ph='';S.t=0;S.heat=0;S.ret=false;S.rq=false;S.rel=null;S.end=null;
  stWorldHide(S);if(was&&own&&!a.pup&&NET.on)netFxPush(['stb',a.id,0,0])}
const stPart=p=>p==='head'?'head':p==='legs'||p==='arm'?'limb':'body';
// the share of the pellets that lands at a distance (the sheet's falloff, smooth: straight lines between its points; past the last, falloffAfter)
function stFall(d){const F=STA.falloff;if(d<=F[0][0])return F[0][1];for(let i=1;i<F.length;i++)if(d<=F[i][0]){const [d0,k0]=F[i-1],[d1,k1]=F[i];return k0+(k1-k0)*(d-d0)/(d1-d0)}return STA.falloffAfter}
// a sound of the gun: the player's own, or from where the body is
function stSnd(a,n){if(a.isPlayer&&!G.spec)AU.play(n,{vol:1});else AU.at(n,a.c.x,a.c.y+1.3,a.c.z,{vol:1,range:n.startsWith('stLas')?140:60})}

// ---------- hits ----------
// what a round or the beam does where it stops on the world: coffins, a chapter's props and devices, the impact
function stWall(a,hw,ox,oy,oz,dx,dy,dz,dmg){const ex=ox+dx*hw.t,ey=oy+dy*hw.t,ez=oz+dz*hw.t,wb=hw.box,wn=[hw.nx,hw.ny,hw.nz];
  if(!NET.ghost&&wb.coffin&&a.team===TH&&typeof COFF!=='undefined')COFF.hurt(wb.coffin,dmg,a);
  if((wb.o.epanel!=null||wb.o.esteam!=null)&&typeof ALEPH!=='undefined')ALEPH.devShot(wb,a);
  if(wb.o.eh&&typeof epBoxShot==='function')epBoxShot(wb,a,{dmg});
  const m=wb.o.f&&wb.o.f[nf(wn)]||wb.mat,mk=matKind(m);FX.impact(ex,ey,ez,wn[0],wn[1],wn[2],m);
  AU.at(mk==='metal'?'imp_metal':mk==='wood'?'imp_wood':mk==='soft'?'imp_dirt':'imp_conc',ex,ey,ez,{vol:.55,range:30})}
// a zombie hit: the damage, blood (or sparks off armour), the headshot's ding for the player
function stHurt(a,ha,dmg,W,ox,oy,oz,dx,dy,dz){const t=ha.a,hs=ha.part==='head',x=ox+dx*ha.t,y=oy+dy*ha.t,z=oz+dz*ha.t;
  damageActor(t,dmg,a,{w:'startrack',hs,ds:ha.ds,dir:[dx,dy,dz],kb:W.kb,stag:W.stag,x,y,z,tank:ha.part==='tank'?1:0});
  if(ha.part==='ball'||ha.part==='tank')FX.impact(x,y,z,-dx,-dy,-dz,'metal');else FX.blood(x,y,z,dx,dy,dz,hs?1.6:1.1,false);
  if(hs&&!t.isPlayer&&a.isPlayer)AU.play('headshot',{vol:.7})}
// an A round (fireGun → tbShot): the sheet's hit rule — the eye's line, no spread; the part's twelve pellets × the share at that distance
function stShot(a,W,eye,base){const L=110,ox=eye.x,oy=eye.y,oz=eye.z,dx=base.x,dy=base.y,dz=base.z;
  const hw=rayCast(ox,oy,oz,dx,dy,dz,L,SHOT_FILTER),tW=hw?hw.t:L,ha=rayActors(a,ox,oy,oz,dx,dy,dz,tW);
  if(ha){ha.ds=hsForce(a,ha);const part=stPart(ha.part),dmg=STA.fullHitDamage[part]*stFall(ha.t);stHurt(a,ha,dmg,W,ox,oy,oz,dx,dy,dz);return {hit:true,hs:part==='head',dmg}}
  if(hw)stWall(a,hw,ox,oy,oz,dx,dy,dz,STA.fullHitDamage.body*stFall(tW));
  return {hit:false,hs:false,dmg:0}}

// ---------- B ----------
// on / off: the right click (the page that owns the body), a bot's choice; the switch's sound only when switched by hand (back to A after
// a beam, or for a reload: silent)
function stSetB(a,on,hand,own){const S=stS(a);on=!!on;if(S.B===on)return;S.B=on;if(own&&!a.pup&&NET.on)netFxPush(['stb',a.id,on?1:0,hand?1:0]);
  if(hand)stSnd(a,on?'stBOn':'stBOff');
  if(a.isPlayer&&on&&hand&&!AU.throttle('stnote',8000))HUD.note(LI()?'B — the barrels meet: pull to charge, every round left in one beam (keep it on target)':'B모드 — 총열이 모여요: 당기면 충전, 남은 탄 전부를 레이저 한 줄기로 (충전 중 조준 유지)',2.2)}
// a pull in B: the charge for the rounds left (its tier), the lasers on
function stCharge(a,am){const S=stS(a);S.n=am.mag;S.tier=stTierOf(S.n);S.ph='chg';S.t=0;S.heat=STB.timeline.chargeStart.heat.from;stSnd(a,'stChg'+S.tier);
  if(NET.on&&!a.pup)netFxPush(['stc',a.id,S.tier])}
// the end of the charge (the page that owns the body): one hit along the eye's line, the first wall or zombie stops it; every round goes
function stFire(a,W){const S=stS(a),am=a.ammo&&a.ammo.startrack,n=S.n,J=STB.judge;const eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);
  const ox=eye.x,oy=eye.y,oz=eye.z,dx=_dv.x,dy=_dv.y,dz=_dv.z,L=W.range,hw=rayCast(ox,oy,oz,dx,dy,dz,L,SHOT_FILTER),tW=hw?hw.t:L,ha=J.maxTargets>0?rayActors(a,ox,oy,oz,dx,dy,dz,tW):null;
  let tE=hw?tW:STB.beam.noHitVisualLen,hs=false;
  if(ha){ha.ds=hsForce(a,ha);const part=stPart(ha.part);hs=part==='head';stHurt(a,ha,STB.perRound[part]*n,W,ox,oy,oz,dx,dy,dz);tE=ha.t;if(a.isPlayer)HUD.hitmark(hs)}
  else if(hw)stWall(a,hw,ox,oy,oz,dx,dy,dz,STB.perRound.body*n);
  if(am)am.mag=0;S.tubes.fill(0);S.ph='beam';S.t=0;S.heat=2;S.end=[ox+dx*tE,oy+dy*tE,oz+dz*tE];stSnd(a,'stLas'+S.tier);
  if(NET.on&&!a.pup)netFxPush(['stf',a.id,Math.round(S.end[0]*100),Math.round(S.end[1]*100),Math.round(S.end[2]*100),S.tier]);
  a.lastFire=G.t;alertBots(a,ox,oz)}
// every page, every frame: the switch, the charge and the beam's clocks, the heat, the kicks and flashes
function stTick(a,dt){const S=a.stk;if(!S)return;
  if(a.cur!=='startrack'||a.team!==TH||!a.alive){if(S.B||S.k>0||S.ph)stReset(a,false);return}
  S.k=approach(S.k,S.B?1:0,dt/STB.switchSec);if(S.ret&&S.k<=0){S.ret=false;S.heat=STB.timeline.beamEnd.heatAfterReturn}
  S.dp+=dt;for(let i=0;i<4;i++){S.kick[i]+=dt;S.fl[i]=Math.max(0,S.fl[i]-dt)}
  const T=STB.tiers[S.tier];
  if(S.ph==='chg'){S.t+=dt;const H=STB.timeline.chargeStart.heat;S.heat=H.from+(H.to-H.from)*Math.min(1,S.t/T.chargeSec);
    if(S.t>=T.chargeSec){if(!a.pup&&!NET.ghost)stFire(a,WPN.startrack);else if(S.t>T.chargeSec+1.5){S.ph='';S.heat=0}}}
  else if(S.ph==='beam'){S.t+=dt;const H=STB.timeline.beamDuring.heat;S.heat=H.from+(H.to-H.from)*Math.min(1,S.t/T.beamSec);
    if(S.t>=T.beamSec){S.ph='';S.heat=H.to;S.ret=true;if(S.B){S.B=false;if(!a.pup&&NET.on)netFxPush(['stb',a.id,0,0])}}}}
// what the other pages send
function stRemote(a,f){const S=stS(a),k=f[0];if(a.cur!=='startrack')equip(a,'startrack',true);
  if(k==='stb'){const on=!!f[2];if(S.B!==on){S.B=on;if(f[3])stSnd(a,on?'stBOn':'stBOff')}return}
  if(k==='stc'){S.B=true;S.ph='chg';S.t=0;S.tier=clamp(f[2]|0,0,STB.tiers.length-1);S.heat=1;stSnd(a,'stChg'+S.tier);return}
  if(k==='stf'){S.ph='beam';S.t=0;S.tier=clamp(f[5]|0,0,STB.tiers.length-1);S.heat=2;S.end=[f[2]/100,f[3]/100,f[4]/100];S.tubes.fill(0);stSnd(a,'stLas'+S.tier)}}

// ---------- the reload (the sheet's reloadRule and reloadAnim timeline) ----------
// times in the sheet's 2.41 s: the drum goes at the throw (with what was in it), the new one is full at the end of insert
const ST_RL=(()=>{let t=0;const at={};for(const p of STK.reloadAnim){at[p.id]=[t,t+p.sec];t+=p.sec}return {T:t,at}})();
function stReload(a,W,am){a.zoom=0;a.burstN=0;a.reloadT=W.reload;a.relKind='mag';a.relCh=am.mag>0;if(a.isPlayer)VM.reload(W,W.reload,'mag',am.mag===0);else if(typeof SNDV!=='undefined')SNDV.ping(a,'rl',25)}
function stRelTick(a,W,am){const S=stS(a);if(!(a.reloadT>0&&a.relKind==='mag')){S.rel=null;return}
  if(!S.rel)S.rel={D:a.reloadT,thrown:false,filled:false,si:0};const R0=S.rel,k=R0.D/ST_RL.T,t=(R0.D-a.reloadT)/k;
  if(!R0.thrown&&t>=ST_RL.at.throw[0]){R0.thrown=true;am.mag=0;S.tubes.fill(0)}
  if(!R0.filled&&t>=ST_RL.at.insert[1]){R0.filled=true;const take=Math.min(STK.reloadRule.fillTo,am.res);am.mag=take;am.res-=take;stFill(S,take)}
  // a bot's reload is heard where it is (the player's from the view model, in step with the hands)
  if(!a.isPlayer)while(R0.si<STK.reloadSounds.length&&t>=STK.reloadSounds[R0.si].at){const e=STK.reloadSounds[R0.si++];AU.at(ST_RSND[e.id],a.c.x,a.c.y+1.2,a.c.z,{vol:1,range:25})}}
const ST_RSND={clack:'stClack',whoosh:'stWhoosh',tap:'stTap'};
// another page's body reloading it (v6.95): the sheet's reload sounds where it is, in step (net.js netPuppet; not the engine's magazine)
function stPupRel(a,W){const k=(W.reload||STS.reload)/ST_RL.T;
  for(const e of STK.reloadSounds)nyLater(e.at*k,()=>{if(a.alive&&a.cur==='startrack')AU.at(ST_RSND[e.id],a.c.x,a.c.y+1.2,a.c.z,{vol:1,range:25})});
  if(typeof SNDV!=='undefined')SNDV.ping(a,'rl',25)}

// ---------- what it shows: colours, the glow, the boxes of the flashes, lasers and the beam ----------
// a colour of the sheet's beam material as a current three.js shows it: base + emissive × intensity, in linear light, back to sRGB
const stLin=v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4),stSrgb=v=>v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055;
function stMatCol(M){const a=new THREE.Color(M.color),e=new THREE.Color(M.emissive),k=M.emissiveIntensity;
  return new THREE.Color(stSrgb(Math.min(1,stLin(a.r)+stLin(e.r)*k)),stSrgb(Math.min(1,stLin(a.g)+stLin(e.g)*k)),stSrgb(Math.min(1,stLin(a.b)+stLin(e.b)*k)))}
const ST_TIERMAT={laserwhite:'white',laserorange:'orange',laserbeam:'red'};
const STM={geo:null,tier:[],flash:null,tracer:null,tr:[],mute:false,bus:null};
function stMats(){if(STM.geo)return;STM.geo=new THREE.BoxGeometry(1,1,1);
  STM.tier=STB.tiers.map(T=>new THREE.MeshBasicMaterial({color:stMatCol(STB.beam.viewerMaterial[ST_TIERMAT[T.mat]]),fog:false}));
  STM.flash=new THREE.MeshBasicMaterial({color:new THREE.Color(STK.fx.tubeFlash.color),fog:false});STM.tracer=new THREE.MeshBasicMaterial({color:new THREE.Color(STK.fx.tracer.color),fog:false})}
const stBox=(mat,parent)=>{stMats();const m=new THREE.Mesh(STM.geo,mat);m.frustumCulled=false;m.visible=false;if(parent)parent.add(m);return m};
// a box from A to B (w wide) in its parent's frame
const _stA=new THREE.Vector3(),_stB=new THREE.Vector3(),_stC=new THREE.Vector3(),_stD=new THREE.Vector3(),_stQ=new THREE.Quaternion(),_stAx=new THREE.Vector3(),_stM=new THREE.Matrix4();
function stSpan(m,A,B,w){const L=A.distanceTo(B);if(!(L>1e-4)||!(w>1e-5)){m.visible=false;return}m.position.copy(A).add(B).multiplyScalar(.5);m.lookAt(B);m.scale.set(w,w,L);m.visible=true}
// (lookAt orients a child by its parent's frame only when the parent has no rotation of its own: stSpanL does it in the parent's frame)
function stSpanL(m,A,B,w){const L=A.distanceTo(B);if(!(L>1e-4)||!(w>1e-5)){m.visible=false;return}m.position.copy(A).add(B).multiplyScalar(.5);
  _stD.copy(B).sub(A).normalize();_stQ.setFromUnitVectors(_stAx.set(0,0,1),_stD);m.quaternion.copy(_stQ);m.scale.set(w,w,L);m.visible=true}
// the draw's glow pulse (0 .. 1 .. 0 over the sheet's rise and fall)
function stPulse(t){const D=STK.drawFx;return t<0?0:t<D.glowRiseSec?t/D.glowRiseSec:Math.max(0,1-(t-D.glowRiseSec)/D.glowFallSec)}
// the sheet's glow: h = heat, or B's progress; material .55 + 1.5h + 2.5 pulse, light .4 + 3h + 5 pulse, the red parts 1.6 × pulse
// (the coefficients from its glow block: idle, B − idle, the draw's peak − idle)
const ST_GL=(()=>{const g=STK.glow,m=g.materials.redglow,L=g.light;return {m:[m.idle,m.modeB-m.idle,m.drawPeak-m.idle],l:[L.idle,L.modeB-L.idle,L.drawPeak-L.idle],r:g.redMaterial.drawPeak}})();
const stH=(S,e)=>S.heat>0?S.heat:e;

// ---------- first person ----------
// the view model's material: its glowing texels × uGlow; 'stRed' texels + uRedE (the draw's flare); the gun's own light (uStL at uStP:
// N·L, falling off over about 30 cm)
const FS_VM_ST=FS_VM.replace('uniform sampler2D map;','uniform sampler2D map;uniform float uGlow;uniform vec3 uRedE;uniform vec3 uStL;uniform vec3 uStP;')
  .replace('+rim*uProbe;','+rim*uProbe;{vec3 ld=uStP-vPos;float dd=dot(ld,ld);lig+=uStL*max(dot(n,ld*inversesqrt(max(dd,1e-6))),0.)/(1.+dd*11.1);}')
  .replace('if(t.a<.97)c=max(c,t.rgb);','if(abs(t.a-'+ST_RED_A+'./255.)<.0025)c+=uRedE;else if(t.a<.97)c=max(c,t.rgb*uGlow);');
{const bv=buildVM;buildVM=function(id,skinKey,U,dual){const m=bv(id,skinKey,U,dual);
  if(id==='startrack'&&m.mat&&FS_VM_ST.includes('uStL')&&FS_VM_ST.includes('uRedE;else')){m.mat.fragmentShader=FS_VM_ST;
    Object.assign(m.mat.uniforms,{uGlow:{value:ST_GL.m[0]},uRedE:{value:new THREE.Color(0,0,0)},uStL:{value:new THREE.Color(0,0,0)},uStP:{value:new THREE.Vector3()}});m.mat.needsUpdate=true}
  return m}}
// the view model's reload (the sheet's clip, not vmrel.js's) and its draw clock
{const vr=VM.reload;VM.reload=function(W,dur,kind,empty){if(W&&W.model==='startrack'&&this.id==='startrack'){this.rel=null;this.act=null;this.stR={t:0,d:dur,si:0,thrown:false};return}return vr.call(this,W,dur,kind,empty)}}
{const vd=VM.draw;VM.draw=function(d){vd.call(this,d);this.stR=null}}
// the extras on the view model: a flash at each barrel's end, a laser from each, the beam's cross flash
function stVmX(m){if(m.stX)return m.stX;stMats();const X={fl:[],las:[],star:new THREE.Group(),thr:null};const TF=STK.fx.tubeFlash,BF=STK.fx.bMuzzleFlash;
  ST_TUBES.forEach((n,i)=>{const g=m.tags['arm'+n],f=stBox(STM.flash,g||m.gun);f.scale.set(TF.size[0],TF.size[1],TF.size[2]);f.position.set(0,0,ST_TIP[n]-TF.aheadOfTubeTip);X.fl[i]=f;
    X.las[i]=stBox(STM.tier[0],m.gun)});
  for(let i=0;i<BF.boxes;i++){const b=stBox(STM.tier[0],X.star);b.scale.set(BF.boxSize[0],BF.boxSize[1],BF.boxSize[2]);b.rotation.z=i*BF.rotateStepRad;b.visible=true}
  X.star.position.set(BF.pos[0],BF.pos[1],BF.pos[2]);X.star.visible=false;m.gun.add(X.star);return m.stX=X}
// the reload's keys (from the sheet's reloadAnim): the gun's pitch / roll / lift, the left hand from its support point, the drum's offset
const ST_RK=(()=>{const A=STK.reloadAnim;let t=0,g=[0,0,0],h=[0,0,0],mg=[0,0,0];const K={g:[[0,g]],h:[[0,h]],mg:[[0,mg]],throw:0,fetch:[0,0],spawn:[0,0,0],hAtSpawn:[0,0,0]};
  for(const p of A){const t1=t+p.sec;
    if(p.gun){g=[p.gun.pitch,p.gun.roll,p.gun.lift];K.g.push([t1,g])}else K.g.push([t1,g]);
    if(p.leftHandReturn){K.h.push([t+p.sec/2,p.leftHandFromSup]);h=p.leftHandReturn;K.h.push([t1,h])}else if(p.leftHandFromSup){h=p.leftHandFromSup;K.h.push([t1,h])}
    if(p.mag&&p.mag.translate){K.mg.push([t,mg]);mg=mg.map((v,i)=>v+p.mag.translate[i]);K.mg.push([t1,mg])}
    if(p.mag&&p.mag.detach){K.throw=t;K.thr=p.mag}
    if(p.newMag&&p.newMag.spawnFromMagOffset){K.fetch=[t,t1];K.spawn=p.newMag.spawnFromMagOffset;K.hAtSpawn=p.leftHandFromSup.slice()}
    if(p.newMag&&p.newMag.translate){K.ins=[t,t1,K.spawn,K.spawn.map((v,i)=>v+p.newMag.translate[i])]}
    t=t1}
  return K})();
function stKey(L,t,out){if(t<=L[0][0]){for(let i=0;i<3;i++)out[i]=L[0][1][i];return out}for(let j=1;j<L.length;j++)if(t<L[j][0]){const [t0,a]=L[j-1],[t1,b]=L[j],u=smooth((t-t0)/Math.max(1e-6,t1-t0));for(let i=0;i<3;i++)out[i]=a[i]+(b[i]-a[i])*u;return out}
  const z=L[L.length-1][1];for(let i=0;i<3;i++)out[i]=z[i];return out}
const _stK=[0,0,0],_stH=[0,0,0],_stG=[0,0,0],_stE=new THREE.Euler();
function stVmReload(V,a,dt,o,m,X){const R0=V.stR;R0.t+=dt;const k=R0.d/ST_RL.T,t=R0.t/k,K=ST_RK;
  stKey(K.g,t,_stG);o[3]+=_stG[0];o[5]+=_stG[1];o[1]+=_stG[2];
  stKey(K.h,t,_stH);if(m.armL){m.armL.position.x+=_stH[0];m.armL.position.y+=_stH[1];m.armL.position.z+=_stH[2]}
  const T=m.tags.mag;if(T){
    if(t<K.throw){stKey(K.mg,t,_stK);T.position.x+=_stK[0];T.position.y+=_stK[1];T.position.z+=_stK[2];T.visible=true}
    else if(t<K.fetch[0])T.visible=false;
    else if(t<K.fetch[1]){T.visible=true;for(let i=0;i<3;i++)T.position.setComponent(i,T.position.getComponent(i)+K.spawn[i]+_stH[i]-K.hAtSpawn[i])}
    else if(K.ins&&t<K.ins[1]){T.visible=true;const u=smooth((t-K.ins[0])/(K.ins[1]-K.ins[0]));for(let i=0;i<3;i++)T.position.setComponent(i,T.position.getComponent(i)+K.ins[2][i]+(K.ins[3][i]-K.ins[2][i])*u)}
    else T.visible=true}
  // the drum thrown away: in the world's frame from where it was pulled to (the sheet's velocity, gravity, spin and life)
  if(!R0.thrown&&t>=K.throw&&T){R0.thrown=true;stKey(K.mg,K.throw,_stK);T.position.x+=_stK[0];T.position.y+=_stK[1];T.position.z+=_stK[2];stThrow(V,a,T)}
  while(R0.si<STK.reloadSounds.length&&t>=STK.reloadSounds[R0.si].at){AU.play(ST_RSND[STK.reloadSounds[R0.si++].id],{vol:1})}
  if(R0.t>=R0.d){V.stR=null;if(T)T.visible=true}}
// the thrown drum: a copy of it under the view model's scene, its world position and turn worked out each frame (VMX)
function stThrow(V,a,T){const msh=T.children[0];if(!msh)return;const C=STK.reloadAnim.find(p=>p.mag&&p.mag.detach).mag;
  T.updateMatrixWorld(true);_stM.copy(T.matrixWorld);const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();_stM.decompose(p,q,s);
  R.cam.updateMatrixWorld();const sc=Math.tan(R.cam.fov*Math.PI/360)/Math.tan(R.vmCam.fov*Math.PI/360);const pw=new THREE.Vector3(p.x*sc,p.y*sc,p.z).applyMatrix4(R.cam.matrixWorld);
  const qc=new THREE.Quaternion();R.cam.getWorldQuaternion(qc);const qw=qc.clone().multiply(q);
  const yw=a.yaw,rx=Math.cos(yw),rz=-Math.sin(yw),fx=-Math.sin(yw),fz=-Math.cos(yw),v=C.velocity;
  const m2=new THREE.Mesh(msh.geometry,msh.material);m2.frustumCulled=false;R.vmScene.add(m2);
  (V.stThr||(V.stThr=[])).push({m:m2,p:pw,q:qw,v:new THREE.Vector3(rx*v[0]-fx*v[2],v[1],rz*v[0]-fz*v[2]),w:C.spin,g:C.gravity,life:C.lifeSec,t:0})}
function stThrTick(V,dt){const L=V.stThr;if(!L||!L.length)return;R.cam.updateMatrixWorld();const sc=Math.tan(R.vmCam.fov*Math.PI/360)/Math.tan(R.cam.fov*Math.PI/360),qi=new THREE.Quaternion();R.cam.getWorldQuaternion(qi).invert();
  _stM.copy(R.cam.matrixWorld).invert();
  for(let i=L.length-1;i>=0;i--){const d=L[i];d.t+=dt;if(d.t>=d.life){R.vmScene.remove(d.m);L.splice(i,1);continue}
    d.v.y-=d.g*dt;d.p.addScaledVector(d.v,dt);_stQ.setFromEuler(_stE.set(d.w[0]*dt,d.w[1]*dt,d.w[2]*dt));d.q.multiply(_stQ);
    const pv=_stA.copy(d.p).applyMatrix4(_stM);d.m.position.set(pv.x*sc,pv.y*sc,pv.z);d.m.quaternion.copy(qi).multiply(d.q);d.m.visible=V.vis}}
function stThrClear(V){if(V.stThr){for(const d of V.stThr)R.vmScene.remove(d.m);V.stThr.length=0}}
// a point of the view model's scene (its camera's space) to the world: the same spot on the screen at the same depth
function stVm2W(p,out){R.cam.updateMatrixWorld();const s=Math.tan(R.cam.fov*Math.PI/360)/Math.tan(R.vmCam.fov*Math.PI/360);return out.set(p.x*s,p.y*s,p.z).applyMatrix4(R.cam.matrixWorld)}
VMX.startrack=function(V,a,dt,o,m){const S=stS(a),X=stVmX(m),T=m.tags,e=smooth(clamp(S.k,0,1));
  // B: the tubes and arms (the sheet's motions.modeB, about the arms' pivots), the left hand with them
  const MB=STK.motions.modeB.tags;for(const t in MB){const g=T[t];if(!g)continue;const M=MB[t],tr=M.translate||[0,0,0];g.position.x+=tr[0]*e;g.position.y+=tr[1]*e;g.position.z+=tr[2]*e;
    if(M.rotate){_stAx.set(M.rotate.axis[0],M.rotate.axis[1],M.rotate.axis[2]).normalize();g.quaternion.setFromAxisAngle(_stAx,M.rotate.rad*e)}}
  const LH=STK.motions.leftHandModeB;if(m.armL&&LH.followsModeBProgress){m.armL.position.x+=LH.shift[0]*e;m.armL.position.y+=LH.shift[1]*e;m.armL.position.z+=LH.shift[2]*e}
  // the barrel that fired kicks straight back and comes home (the sheet's fireKick)
  const FK=STK.motions.fireKick;for(let i=0;i<4;i++){const kt=S.kick[i];if(!(kt<FK.returnSec))continue;const u=1-smooth(kt/FK.returnSec);
    for(const tg of FK.perTube[ST_TUBES[i]]){const g=T[tg];if(g){g.position.x+=FK.translate[0]*u;g.position.y+=FK.translate[1]*u;g.position.z+=FK.translate[2]*u}}}
  // flashes: the barrel that fired (A), all four through the beam
  const beam=S.ph==='beam';for(let i=0;i<4;i++)X.fl[i].visible=(S.fl[i]>0||beam)&&V.vis;
  // the charge's lasers (from each barrel to the point in front), the beam's cross flash
  const Tr=STB.tiers[S.tier],LS=STB.lasers,live=S.ph==='chg'||beam,lv=S.ph==='chg'?clamp(S.t/Tr.chargeSec,0,1):LS.levelDuringBeam,mat=STM.tier[S.tier];
  for(let i=0;i<4;i++){const g=T['arm'+ST_TUBES[i]],L=X.las[i];if(!live||!g){L.visible=false;continue}L.material=mat;
    _stA.set(LS.fromArmTagLocal[0],LS.fromArmTagLocal[1],LS.fromArmTagLocal[2]).applyQuaternion(g.quaternion).add(g.position);_stB.set(LS.toPoint[0],LS.toPoint[1],LS.toPoint[2]);
    stSpanL(L,_stA,_stB,LS.baseWidth*1.2*lv);L.visible=L.visible&&V.vis}
  const bw=beam?Tr.beamWidth*(1-STB.beam.shrinkDuringBeam*clamp(S.t/Tr.beamSec,0,1)):0;X.star.visible=beam&&V.vis;
  if(beam){const s=.4+.6*(bw/STB.beam.baseSize[0]);X.star.scale.setScalar(s);for(const b of X.star.children)b.material=mat}
  // the reload, the thrown drum
  if(V.stR)stVmReload(V,a,dt,o,m,X);else if(T.mag)T.mag.visible=true;stThrTick(V,dt);
  // the draw: up from below and level in .7 s (the sheet's drawFx.lift, the hands with it; a quick draw's shorter time in step)
  const tD=V.drawT>0?V.drawD-V.drawT:9,DL=STK.drawFx.lift,dS=DL.sec*Math.min(1,V.drawD/STS.draw);if(tD<dS){const u=smooth(clamp(tD/dS,0,1));for(let i=0;i<3;i++)o[i]+=DL.fromOffset[i]+(DL.toOffset[i]-DL.fromOffset[i])*u;o[3]+=DL.fromPitchRad+(DL.toPitchRad-DL.fromPitchRad)*u}
  // the glow, the red flare, the gun's light (the tier's colour while it charges and fires)
  const dp=stPulse(V.drawT>0?tD:S.dp),h=stH(S,e),U=m.mat&&m.mat.uniforms;
  if(U&&U.uGlow){U.uGlow.value=ST_GL.m[0]+ST_GL.m[1]*h+ST_GL.m[2]*dp;U.uRedE.value.set(STK.glow.redMaterial.emissiveColor).multiplyScalar(ST_GL.r*dp);
    const lc=live?Tr.lightColor:STK.glow.light.color,li=ST_GL.l[0]+ST_GL.l[1]*h+ST_GL.l[2]*dp;U.uStL.value.set(lc).multiplyScalar(li);
    m.gun.updateMatrixWorld(true);U.uStP.value.set(STK.glow.light.pos[0],STK.glow.light.pos[1],STK.glow.light.pos[2]).applyMatrix4(m.gun.matrixWorld)}
  // the beam on the world (it starts at the view model's end of the central barrel and goes where the gun points, to what it meets)
  if(beam&&V.vis){m.gun.updateMatrixWorld(true);_stC.set(STB.beam.startPos[0],STB.beam.startPos[1],STB.beam.startPos[2]).applyMatrix4(m.gun.matrixWorld);stVm2W(_stC,_stA);stBeamTo(S,a,_stA,bw,true)}
  else if(S.w&&S.w.beam&&a===G.player)S.w.beam.visible=false};

// ---------- the world: the beam, lasers, flashes of another's gun, the orange lines ----------
// one set of boxes a body (made when first needed)
function stWorld(S){if(S.w)return S.w;stMats();const w=S.w={beam:stBox(STM.tier[0],R.scene),las:[0,1,2,3].map(()=>stBox(STM.tier[0],R.scene)),fl:[0,1,2,3].map(()=>stBox(STM.flash,R.scene)),star:new THREE.Group()};
  const BF=STK.fx.bMuzzleFlash;for(let i=0;i<BF.boxes;i++){const b=stBox(STM.tier[0],w.star);b.scale.set(BF.boxSize[0],BF.boxSize[1],BF.boxSize[2]);b.rotation.z=i*BF.rotateStepRad;b.visible=true}
  w.star.visible=false;R.scene.add(w.star);return w}
function stWorldHide(S){const w=S&&S.w;if(!w)return;w.beam.visible=false;w.star.visible=false;for(const m of w.las)m.visible=false;for(const m of w.fl)m.visible=false}
function stWorldDrop(S){const w=S&&S.w;if(!w)return;R.scene.remove(w.beam,w.star,...w.las,...w.fl);S.w=null}
// the beam from a world point: the player's follows the aim to what it meets (the sheet: until the first hit, 60 m if nothing), another's
// goes to where its page said it stopped
function stBeamTo(S,a,A,w,mine){const W0=stWorld(S);W0.beam.material=STM.tier[S.tier];
  if(mine){const eye=actorEye(a);aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const L=WPN.startrack.range,hw=rayCast(eye.x,eye.y,eye.z,_dv.x,_dv.y,_dv.z,L,SHOT_FILTER),tW=hw?hw.t:L,ha=rayActors(a,eye.x,eye.y,eye.z,_dv.x,_dv.y,_dv.z,tW);
    const t=ha?ha.t:hw?tW:STB.beam.noHitVisualLen;_stB.set(eye.x+_dv.x*t,eye.y+_dv.y*t,eye.z+_dv.z*t)}
  else if(S.end)_stB.set(S.end[0],S.end[1],S.end[2]);else{W0.beam.visible=false;return}
  stSpan(W0.beam,A,_stB,w)}
// a point of the gun in the world (another's: its world model; the player's: through the view model)
function stGunW(a,x,y,z,out){if(!a.gun)return null;a.gun.updateMatrixWorld();return out.set(x,y,z).applyMatrix4(a.gun.matrixWorld)}
// every frame, every body with the gun that is not the player seen through its own view model
function stWorldTick(a){const S=a.stk;if(!S)return;const me=a===G.player&&!G.spec&&a.alive;if(me||a.cur!=='startrack'||!a.gun||a.team!==TH||!a.alive){if(S.w&&!me)stWorldHide(S);if(me&&S.w){S.w.star.visible=false;for(const m of S.w.las)m.visible=false;for(const m of S.w.fl)m.visible=false}return}
  const w=stWorld(S),T=STB.tiers[S.tier],beam=S.ph==='beam',live=S.ph==='chg'||beam,LS=STB.lasers,MB=STK.motions.modeB.tags,mat=STM.tier[S.tier];
  a.gun.updateMatrixWorld();const M=a.gun.matrixWorld,B=S.k>.5;
  // the lasers from the barrels' ends (the world model in B) to the point in front
  for(let i=0;i<4;i++){const L=w.las[i];if(!live){L.visible=false;continue}const n=ST_TUBES[i],P0=STK.pivots['arm'+n],m=MB['arm'+n];L.material=mat;
    _stA.set(LS.fromArmTagLocal[0],LS.fromArmTagLocal[1],LS.fromArmTagLocal[2]);if(B&&m.rotate){_stAx.set(m.rotate.axis[0],m.rotate.axis[1],m.rotate.axis[2]).normalize();_stQ.setFromAxisAngle(_stAx,m.rotate.rad);_stA.applyQuaternion(_stQ)}
    _stA.x+=P0[0]+(B?m.translate[0]:0);_stA.y+=P0[1]+(B?m.translate[1]:0);_stA.z+=P0[2]+(B?m.translate[2]:0);_stA.applyMatrix4(M);
    _stB.set(LS.toPoint[0],LS.toPoint[1],LS.toPoint[2]).applyMatrix4(M);const lv=S.ph==='chg'?clamp(S.t/T.chargeSec,0,1):LS.levelDuringBeam;stSpan(L,_stA,_stB,LS.baseWidth*1.2*lv)}
  // the flashes at the barrels' ends
  const TF=STK.fx.tubeFlash;for(let i=0;i<4;i++){const f=w.fl[i];if(!(S.fl[i]>0||beam)){f.visible=false;continue}const n=ST_TUBES[i],P0=STK.pivots['arm'+n];
    _stA.set(P0[0],P0[1],P0[2]+ST_TIP[n]-TF.aheadOfTubeTip);if(B){const m=MB['arm'+n];_stC.set(0,0,ST_TIP[n]-TF.aheadOfTubeTip);_stAx.set(m.rotate.axis[0],m.rotate.axis[1],m.rotate.axis[2]).normalize();_stQ.setFromAxisAngle(_stAx,m.rotate.rad);_stC.applyQuaternion(_stQ);_stA.set(P0[0]+m.translate[0]+_stC.x,P0[1]+m.translate[1]+_stC.y,P0[2]+m.translate[2]+_stC.z)}
    _stA.applyMatrix4(M);f.position.copy(_stA);f.quaternion.setFromRotationMatrix(_stM.extractRotation(M));f.scale.set(TF.size[0],TF.size[1],TF.size[2]);f.visible=true}
  // the beam's cross flash and the beam
  const bw=beam?T.beamWidth*(1-STB.beam.shrinkDuringBeam*clamp(S.t/T.beamSec,0,1)):0;w.star.visible=beam;
  if(beam){const BF=STK.fx.bMuzzleFlash;_stA.set(BF.pos[0],BF.pos[1],BF.pos[2]).applyMatrix4(M);w.star.position.copy(_stA);w.star.quaternion.setFromRotationMatrix(_stM.extractRotation(M));
    w.star.scale.setScalar(.4+.6*(bw/STB.beam.baseSize[0]));for(const b of w.star.children)b.material=mat;
    _stA.set(STB.beam.startPos[0],STB.beam.startPos[1],STB.beam.startPos[2]).applyMatrix4(M);stBeamTo(S,a,_stA,bw,false)}
  else w.beam.visible=false}
// the orange lines of an A shot (only to be seen): nine from the end of the barrel that fired, out along the aim with the sheet's spread
function stTracers(a,i,base){const TR=STK.fx.tracer,n=ST_TUBES[i],P0=STK.pivots['arm'+n];stMats();
  if(a===G.player&&!G.spec&&VM.cur&&VM.id==='startrack'){const g=VM.cur.tags['arm'+n];if(!g)return;g.updateMatrixWorld(true);_stC.set(0,0,ST_TIP[n]-TR.startAheadOfTip).applyMatrix4(g.matrixWorld);stVm2W(_stC,_stA)}
  else if(!stGunW(a,P0[0],P0[1],P0[2]+ST_TIP[n]-TR.startAheadOfTip,_stA))return;
  for(let k=0;k<TR.count;k++){spreadDir(base,TR.spread,_stD);const sp=rr(TR.speedRange[0],TR.speedRange[1]);let o=STM.tr.find(q=>!q.on);
    if(!o){o={m:stBox(STM.tracer,R.scene),p:new THREE.Vector3(),v:new THREE.Vector3(),t:0,on:false};STM.tr.push(o)}
    o.on=true;o.t=0;o.life=TR.lifeSec;o.p.copy(_stA);o.v.copy(_stD).multiplyScalar(sp);o.m.scale.set(TR.thickness,TR.thickness,TR.len)}}
function stTracerTick(dt){for(const o of STM.tr){if(!o.on)continue;o.t+=dt;if(o.t>=o.life){o.on=false;o.m.visible=false;continue}o.p.addScaledVector(o.v,dt);
  o.m.position.copy(o.p);_stB.copy(o.p).add(o.v);o.m.lookAt(_stB);o.m.visible=true}
  const b=STM.bus;if(b&&AU.muf&&b.context===AU.ctx){const v=AU.muf.frequency.value;if(Math.abs(b.frequency.value-v)>1)b.frequency.value=v}}

// ---------- hooks ----------
(function(){
  // right click: B on / off (the page that owns the body; not while it charges, fires, or comes back from a beam)
  const na=nyAlt;nyAlt=function(a,W){if(W&&W.alt==='startrack'){if(!NET.ghost&&!a.pup){const S=stS(a);if(!S.ph&&!S.ret)stSetB(a,!S.B,true,true)}return}return na(a,W)};
  // A rounds: the sheet's hit rule
  const tb=tbShot;tbShot=function(a,W,eye,base,sp){if(W&&W.stA)return stShot(a,W,eye,base);return tb(a,W,eye,base,sp)};
  // an A shot: one round from the next barrel (the 'f' event carries which: its last number, read only for a pair of guns otherwise);
  // the flash at that barrel's end and its kick, the orange lines; not the engine's muzzle flash, light or barrel smoke
  const fg=fireGun;fireGun=function(a,W){if(W!==WPN.startrack)return fg(a,W);const S=stS(a),am=a.ammo&&a.ammo.startrack;let i;
    if(a.pup&&S.tubeNet>=0){i=S.tubeNet%4;S.tubeNet=-1}else{if(am)stSync(S,am);i=stNext(S)}
    aimDir(a.yaw+a.punchY,a.pitch+a.punchP,_dv);const base=_dv.clone();a.dualSide=i+1;
    const fm=FX.muzzle,h0=a.heat||0,me=a.isPlayer&&!G.spec,mu=me&&VM.U?VM.U.uMuzzle.value.clone():null;FX.muzzle=function(){};
    try{fg(a,W)}finally{FX.muzzle=fm}
    a.heat=h0;if(!a.pup&&am){if(S.tubes[i]>0)S.tubes[i]--;S.ti=(i+1)%4}S.kick[i]=0;S.fl[i]=STK.fx.tubeFlash.sec;
    if(me){VM.flashT=0;if(mu)VM.U.uMuzzle.value.copy(mu)}stTracers(a,i,base)};
  // the owner's side: B's pull, the reload's rules (B first; the drum and what was in it thrown away; full from the reserve), no dry click
  const aw=actorWeapons;actorWeapons=function(a,dt){if(a.cur!=='startrack'||a.team!==TH||!a.alive)return aw(a,dt);
    const W=WPN.startrack,S=stS(a),am=a.ammo&&a.ammo.startrack,cmd=a.cmd,pc=a.pc;if(!am)return aw(a,dt);
    if(!(a.reloadT>0))stSync(S,am);const bot=!a.isPlayer;STM.mute=bot;
    try{
      if(S.B||S.k>0||S.ph||S.ret){
        const want=cmd.reload&&!pc.reload||am.mag===0&&(cmd.fire||bot);// (an empty pull asks for it, as in A)
        if(want&&am.mag<W.mag&&am.res>0&&!S.ph){S.rq=true;if(S.B&&STK.reloadRule.exitModeBFirst)stSetB(a,false,false,true)}
        if(S.B&&S.k>=1&&!S.ph&&cmd.fire&&am.mag>0&&a.drawT<=0&&a.reloadT<=0)stCharge(a,am);
        cmd.fire=false;cmd.reload=false;const r0=am.res;am.res=0;try{aw(a,dt)}finally{am.res=r0}}
      else{
        if(S.rq){S.rq=false;if(am.mag<W.mag&&am.res>0&&a.reloadT<=0&&a.drawT<=0)stReload(a,W,am)}
        if(am.mag<=0&&am.res<=0)cmd.fire=false;
        aw(a,dt)}}
    finally{STM.mute=false}
    stRelTick(a,W,am)};
  // (a bot's reload start makes no 'magout': the sheet's reload sounds play in step instead)
  {const at=AU.at.bind(AU);AU.at=function(n,x,y,z,o){if(STM.mute&&n==='magout')return null;return at(n,x,y,z,o)}}
  // put away, turned, dead, a new round: back to A; drawn: the glow's clock from now
  const eq=equip;equip=function(a,id,instant){const was=a&&a.cur,r=eq(a,id,instant);
    if(a&&a.stk&&was==='startrack'&&a.cur!=='startrack')stReset(a,true);if(a&&a.cur==='startrack'&&was!=='startrack')stS(a).dp=0;return r};
  const bz=becomeZombie;becomeZombie=function(a,host){stReset(a,false);return bz(a,host)};
  const cl=NY.clear.bind(NY);NY.clear=function(){cl();for(const a of G.actors){if(a.stk){stWorldDrop(a.stk);a.stk=null}}for(const o of STM.tr){o.on=false;if(o.m)o.m.visible=false}if(VM.stThr)stThrClear(VM)};
  // the other pages: B, the charge, the beam; an A shot's barrel
  const nd=netDoFx;netDoFx=function(a,f){const k=f&&f[0];
    if(k==='stb'||k==='stc'||k==='stf'){if(a&&!a.isPlayer&&G.actors.includes(a)&&a.alive&&a.team===TH)stRemote(a,f);return}
    if(k==='f'&&a&&WL[f[2]]==='startrack')stS(a).tubeNet=(f[5]|0)-1;return nd(a,f)};
  // every page: the clocks; another's gun as the world sees it; the orange lines
  const gu=gameUpdate;gameUpdate=function(dt){gu(dt);for(const a of G.actors){if(!a.stk)continue;try{stTick(a,dt);stWorldTick(a)}catch(e){console.error(e)}}stTracerTick(dt)};
  // the world model in the hand: A, or B (the motions baked) once it is past half way; its glow (the sheet's, as the view model's; another
  // gun's goes back to 1 in the chain below: m4dk2.js sets uEmisA for whatever is held)
  const eg=ensureGun;ensureGun=function(a){if(a.cur!=='startrack'||a.team!==TH||!a.ch)return eg(a);const S=stS(a),want=S.k>.5?'startrackwb':'startrack';
    if(a.gunId!==want){if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!a.gunMat)a.gunMat=matGun();
      const m=new THREE.Mesh(gunGeo(want),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}}
    const M=a.gunMat;if(M&&M.uniforms&&M.uniforms.uEmisA){const v=ST_GL.m[0]+ST_GL.m[1]*stH(S,smooth(clamp(S.k,0,1)))+ST_GL.m[2]*stPulse(S.dp);if(M.uniforms.uEmisA.value!==v)M.uniforms.uEmisA.value=v}};
  // the weapon's name: the mode
  const ct=cmbTag;cmbTag=function(P,W){return ct(P,W)+(W===WPN.startrack&&P&&P.team===TH&&P.stk&&P.stk.B?(LI()?' · B laser':' · B 레이저'):'')};
  // bots: B for a zombie well off with six rounds or more (orange or red), A when one is close
  const au=AI.update.bind(AI);AI.update=function(a,dt){au(a,dt);if(a.team!==TH||a.cur!=='startrack'||!a.bot||!a.alive||a.pup)return;const S=stS(a),am=a.ammo&&a.ammo.startrack;
    a.cmd.alt=false;if(!am||S.ph||S.ret||G.t<(S.botT||0)||a.reloadT>0||a.drawT>0)return;const t=jnBotSees(a);if(!t)return;
    const d=Math.hypot(t.c.x-a.c.x,t.c.z-a.c.z),want=am.mag>=6&&(S.B?d>7:d>14);if(want!==S.B){stSetB(a,want,true,true);S.botT=G.t+1.5}};
})();

// ---------- sounds: the sheet's own synthesis (soundData.referenceImplementation's tone, noise and hum, the events' layers as written) ----------
// Rendered once into the bank (OfflineAudioContext, mono) and played at their own level: not brought to a common peak (peak 'stRaw':
// kept as rendered, clipped at ±1 as an output would), no reverb send, no pitch jitter. Noise is new for every variant.
function stTone(oc,L){const t=L.delay||0,o=oc.createOscillator(),g=oc.createGain();o.type=L.wave;o.frequency.setValueAtTime(L.f0,t);o.frequency.exponentialRampToValueAtTime(L.f1,t+L.dur);
  if(L.riseSec){g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(L.gain,t+L.riseSec);g.gain.linearRampToValueAtTime(.001,t+L.dur)}
  else{g.gain.setValueAtTime(L.gain,t);g.gain.exponentialRampToValueAtTime(.001,t+L.dur)}
  o.connect(g);let out=g;
  if(L.distortion){const w=oc.createWaveShaper(),c=new Float32Array(256);for(let i=0;i<256;i++)c[i]=Math.tanh((i/128-1)*L.distortion)*.8;w.curve=c;out.connect(w);out=w}
  if(L.lowpassHz){const f=oc.createBiquadFilter();f.type='lowpass';f.frequency.value=L.lowpassHz;out.connect(f);out=f}
  out.connect(oc.destination);o.start(t);o.stop(t+L.dur+.05)}
function stNoise(oc,L){const t=L.delay||0,n=Math.ceil(oc.sampleRate*L.dur),b=oc.createBuffer(1,n,oc.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;
  const sr=oc.createBufferSource(),f=oc.createBiquadFilter(),g=oc.createGain();sr.buffer=b;f.type=L.filter||'lowpass';f.Q.value=L.q||1;
  f.frequency.setValueAtTime(L.filterHz[0],t);f.frequency.exponentialRampToValueAtTime(L.filterHz[1],t+L.dur);g.gain.setValueAtTime(L.gain,t);g.gain.exponentialRampToValueAtTime(.001,t+L.dur);
  sr.connect(f);f.connect(g);g.connect(oc.destination);sr.start(t)}
// (toneKeys: the reference's hum — frequency keys exponential, gain keys straight, a lowpass, then the gain)
function stKeysT(oc,L){const o=oc.createOscillator(),f=oc.createBiquadFilter(),g=oc.createGain();o.type=L.wave;f.type='lowpass';f.frequency.value=L.lowpassHz;
  L.freqKeys.forEach(([k,v],i)=>i?o.frequency.exponentialRampToValueAtTime(v,k):o.frequency.setValueAtTime(v,k));L.gainKeys.forEach(([k,v],i)=>i?g.gain.linearRampToValueAtTime(v,k):g.gain.setValueAtTime(v,k));
  o.connect(f);f.connect(g);g.connect(oc.destination);o.start(0);o.stop(L.durSec+.1)}
function stLayers(oc,Ls){for(const L of Ls){if(L.k==='tone')stTone(oc,L);else if(L.k==='noise')stNoise(oc,L);else if(L.k==='toneKeys')stKeysT(oc,L)}}
const stLen=Ls=>Math.max(...Ls.map(L=>L.k==='toneKeys'?L.durSec+.1:(L.delay||0)+L.dur+.05))+.06;
{const fb=finishBuf;finishBuf=function(buf,peak){if(peak!=='stRaw')return fb(buf,peak);const fl=Math.min(buf.length,Math.floor(ASR*.012));
  for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<d.length;i++){const v=d[i];d[i]=isFinite(v)?(v>1?1:v<-1?-1:v):0}for(let i=0;i<fl;i++)d[d.length-1-i]*=i/fl}return buf}}
{const E=STK.snd,mk=(Ls,n,gain,poly)=>({n,dur:stLen(Ls),ch:1,peak:'stRaw',gain:gain||1,rev:0,pj:0,poly:poly||4,fn:B=>stLayers(B.oc,Ls)});
  const hasN=Ls=>Ls.some(L=>L.k==='noise')?3:1;
  // (the engine plays a shot at .95 and a draw at .5: the gain puts both back at the sheet's level)
  Object.assign(SFX,{stShotA:mk(E.shotA.layers,3,1/.95,6),stDraw:mk(E.draw.layers,1,2,2),stClack:mk(E.reloadClack.layers,3),stWhoosh:mk(E.reloadWhoosh.layers,3),stTap:mk(E.reloadTap.layers,3),
    stBOn:mk(E.modeBOn.layers,1),stBOff:mk(E.modeBOff.layers,1)});
  E.charge.tiers.forEach((T,i)=>{SFX['stChg'+i]=mk(T.layers,hasN(T.layers),1,3)});E.laserFire.tiers.forEach((T,i)=>{SFX['stLas'+i]=mk(T.layers,Math.min(2,hasN(T.layers)),1,3)});
  SFX_ORDER.push('stShotA','stDraw','stClack','stWhoosh','stTap','stBOn','stBOff',...E.charge.tiers.map((_,i)=>'stChg'+i),...E.laserFire.tiers.map((_,i)=>'stLas'+i))}
// played as the viewer plays them: straight to the volume (none of the game's EQ, compressor, limiter or reverb) and at their own pitch
// (not a quick draw's faster one); a blast's muffle (AU.shock) still dulls them as everything else (followed each frame: stTracerTick)
const ST_SFX=new Set(Object.keys(SFX).filter(n=>SFX[n].peak==='stRaw'));
function stBus(){const c=AU.ctx;if(STM.bus&&STM.bus.context===c)return STM.bus;if(!c||!AU.master)return null;
  const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=20000;f.Q.value=.6;f.connect(AU.master);return STM.bus=f}
{const ap=AU.play;AU.play=function(n,o){if(ST_SFX.has(n)){const b=stBus();o=Object.assign({},o,{rate:1});if(b)o.bus=b}return ap.call(this,n,o)}}

'use strict';
// ============ Game: actors, movement, weapons in hand, infection rules, round flow ============
const TH=0,TZ=1;
// v6.48: who may hurt whom. Infection and the scenario: the other team. 대인전 (G.pvp: 팀 데스매치 · 개인전, pvp.js): everyone is a
// human, so the other side decides — two sides in 팀 데스매치, a side each in 개인전.
function foe(a,b){return G.pvp?a.side!==b.side:a.team!==b.team}
const HSKINS=['guard','medic','soldier','hazmat'];
// v6.45: the survivors go by the special unit each came from (RT-2 is a recovery team drawn from special units around the world)
const HSKIN_N={guard:['KNP SOU','KNP SOU'],medic:['PJ','PJ'],soldier:['LEGION','LEGION'],hazmat:['CBIRF','CBIRF']};
const HSKIN_R={guard:['경찰특공대 · 봉쇄선 경비','Police SWAT · cordon guard'],medic:['항공구조대 · 의무병','Pararescue · medic'],soldier:['외인부대 출신 용병','Ex-Legion mercenary'],hazmat:['화생방 대응군 · 방호복','CBRN response · hazmat']};
const HSKIN_T={guard:['한국 경찰특공대 출신 · 격리구역 봉쇄선 경비','Ex-Korean National Police SOU · quarantine cordon guard'],medic:['미 공군 항공구조대(Pararescue) 출신 · 야전 의무병','Ex-USAF Pararescue · field medic'],
  soldier:['프랑스 외인부대 출신 · 용병','Ex-French Foreign Legion · mercenary'],hazmat:['미 해병대 화생방 대응군(CBIRF) 출신 · 방호복 기술자','Ex-USMC CBIRF · hazmat technician']};
const ZCLASS={
  rager:{n:['일반 좀비','Regular Zombie'],sk:['광폭화','Berserk'],d:['기본형 · 스킬 G: 광폭화 (5초간 이동속도 +45%, 대신 받는 피해 +30% / 체력 소모)','Standard · Skill G: Berserk (5s +45% speed, but takes +30% damage / costs HP)'],hp:2900,armor:120,speed:5.6,jump:7.3,kb:1,dmg:55,skill:'frenzy',cd:14,dur:5,hw:.3,h:1.8,eye:1.62},
  runner:{n:['그림자 좀비','Shade Zombie'],sk:['투명화','Invisibility'],d:['고속·고점프 · 스킬 G: 투명화 (8초간 거의 보이지 않음, 봇은 가까이서만 발견) · 체력 낮음','Fast, jumps high · Skill G: Invisibility (8s, nearly invisible; bots only spot you up close) · low HP'],hp:2050,armor:60,speed:6.4,jump:8.6,kb:1.3,dmg:40,skill:'invis',cd:16,dur:8,hw:.28,h:1.82,eye:1.66},
  brute:{n:['덫잡이 좀비','Trapper Zombie'],sk:['덫','Trap'],d:['탱커형 · 스킬 G: 덫 설치 (밟은 인간을 4초간 묶음, 최대 3개) · 느림','Tank · Skill G: Trap (roots a human who steps in it for 4s, up to 3) · slow'],hp:3400,armor:220,speed:5.0,jump:6.8,kb:.5,dmg:80,skill:'trap',cd:8,dur:0,hw:.38,h:2.05,eye:1.86},
  coffin:{n:['관짝 좀비','Coffin Zombie'],sk:['관 방패','Coffin Wall'],d:['방어형 · 스킬 G: 앞에 기다란 관을 세로로 세움 (총알·이동을 막음, 부서지면 좀비 폭탄처럼 폭발, 최대 2개)','Defender · Skill G: stands a tall coffin up in front (stops bullets and bodies; bursts like a zombie bomb when broken; up to 2)'],hp:3300,armor:200,speed:5.3,jump:7,kb:.8,dmg:58,skill:'coffin',cd:14,dur:0,hw:.32,h:1.92,eye:1.72},
  scream:{n:['주술사 좀비','Shaman Zombie'],sk:['치유','Heal'],d:['지원형 · 스킬 G: 치유 (자신 25%, 주변 좀비 20% 회복)','Support · Skill G: Heal (25% to itself, 20% to nearby zombies)'],hp:2400,armor:100,speed:5.5,jump:7.3,kb:1.1,dmg:48,skill:'heal',cd:12,dur:1.2,hw:.29,h:1.85,eye:1.68},
  // v6.39 (fireman.js): the turnout coat halves fire and blast damage; G = a charge behind the back tank held in front (knocks humans
  // flat and throws them back); shooting the tank during the charge breaks it: the charge stops and a smoke cloud billows out
  fireman:{n:['소방관 좀비','Firefighter Zombie'],sk:['산소통 돌진','Tank Charge'],d:['돌격형 · 방화복: 불·폭발 피해 ½ · 스킬 G: 산소통 돌진 (넘어뜨리며 밀어냄 · 돌진 중 산소통을 쏘면 멈추고 연막)','Assault · Turnout coat: fire and blasts ½ · Skill G: Tank Charge (knocks humans flat and back; shoot the tank mid-charge to stop it, smoke bursts out)'],hp:3000,armor:170,speed:5.4,jump:7.1,kb:.75,dmg:60,skill:'charge',cd:15,dur:1.4,hw:.32,h:1.9,eye:1.72},
};
const ZLIST=['rager','runner','brute','scream','coffin','fireman','strait'];// v6.91: the straitjacket zombie can be picked (strait.js)
// every gun carries twice the spare ammo it used to
for(const W of Object.values(WPN))if(W.res&&W.kind!=='nade'&&!W.resX2){W.res=Math.round(W.res*2);W.resX2=1}
// scenario-only zombies (never picked by players). ZALL lists every class; its order is also the network index.
Object.assign(ZCLASS,{
  bomber:{n:['자폭 좀비','Bomber'],sk:['자폭','Self-destruct'],d:['시나리오 전용 · 가까이 오면 부풀어 터진다 (범위 피해)','Scenario only · swells up and bursts next to you (area damage)'],hp:1300,armor:0,speed:5.9,jump:7,kb:1.4,dmg:30,skill:'none',cd:99,dur:0,hw:.36,h:1.8,eye:1.62},
  spitter:{n:['산성 좀비','Spitter'],sk:['산성 침','Acid spit'],d:['시나리오 전용 · 거리를 두고 산성 침을 뱉는다','Scenario only · keeps its distance and spits acid'],hp:1500,armor:40,speed:5.3,jump:7.4,kb:1.2,dmg:26,skill:'none',cd:99,dur:0,hw:.28,h:1.9,eye:1.74},
  boss:{n:['거대 좀비','The Giant'],sk:['강타','Slam'],d:['시나리오 보스','Scenario boss'],hp:30000,armor:0,speed:4.7,jump:8,kb:.06,dmg:70,skill:'none',cd:99,dur:0,hw:.4,h:2.05,eye:2}});
// episode 1 (episode.js / aleph.js): ALEPH, the boss (the giant's body in restraints), and the straitjacket zombie that pounces and pins
// (v6.91: the straitjacket zombie is also the seventh class to pick, strait.js; these are its stats there — in chapter 1 scenario.js keeps
// the health, speed and armour it had, and aleph.js its own pounce)
Object.assign(ZCLASS,{
  aleph:{n:['알레프','ALEPH'],sk:['분노','Rage'],d:['1챕터 보스 · Q7-000','Chapter 1 boss · Q7-000'],hp:30000,armor:0,speed:4.7,jump:8,kb:.05,dmg:70,skill:'none',cd:99,dur:0,hw:.4,h:2.05,eye:2},
  strait:{n:['구속복 좀비','Straitjacket Zombie'],sk:['덮치기','Pounce'],d:['속박형 · 할퀴는 대신 박치기 · 스킬 G: 덮치기 (덮친 인간을 1.6초 붙잡음: 못 쏘고 못 움직임 · 동료가 쏘면 떨어짐)','Grappler · butts instead of clawing · Skill G: Pounce (pins a human for 1.6 s: no shooting, no moving · teammates can shoot it off)'],hp:2600,armor:110,speed:5.9,jump:7.4,kb:1.2,dmg:50,skill:'pounce',cd:15,dur:1.6,hw:.29,h:1.82,eye:1.66}});
// chapter 2 (argus.js): ARGUS, RT-1's sniper (a tall soldier's body; its hits are worked out by the chapter), and the RT-1 squad zombie
Object.assign(ZCLASS,{
  argus:{n:['아르고스','ARGUS'],sk:['저격','Snipe'],d:['2챕터 보스 · RT1-07','Chapter 2 boss · RT1-07'],hp:14000,armor:0,speed:5.5,jump:8.5,kb:.25,dmg:28,skill:'none',cd:99,dur:0,hw:.32,h:1.9,eye:1.76},
  squad:{n:['1차 팀 분대원 좀비','RT-1 Squad Zombie'],sk:['수류탄','Grenade'],d:['2·4챕터 · 방탄조끼(정면 총알 −30%), 가끔 수류탄, 쓰러지면 탄약','Chapters 2 and 4 · body armour (−30 % from the front), a grenade now and then, drops ammo'],hp:1700,armor:60,speed:5.5,jump:7.2,kb:.9,dmg:22,skill:'none',cd:99,dur:0,hw:.3,h:1.84,eye:1.7}});
// chapter 3 (khepri.js): KHEPRI, the giant dung beetle (its own body and hit volumes; the rig here is a hidden placeholder), the larva
// zombie (bursts into a swarm when it dies) and the scrap-armour zombie (bullets −50 %, fire and blasts ×2, slow)
Object.assign(ZCLASS,{
  khepri:{n:['케프리','KHEPRI'],sk:['고철 공','Scrap ball'],d:['3챕터 보스 · Q7-303','Chapter 3 boss · Q7-303'],hp:18000,armor:0,speed:5.4,jump:7,kb:.05,dmg:30,skill:'none',cd:99,dur:0,hw:.78,h:1.7,eye:1.2},
  larva:{n:['유충 좀비','Larva Zombie'],sk:['유충 떼','Swarm'],d:['3·5챕터 · 죽으면 유충 떼가 터져 나온다 (불로 태우면 사라짐)','Chapters 3 and 5 · bursts into a swarm when it dies (fire burns it away)'],hp:1700,armor:60,speed:5.6,jump:7.2,kb:1.1,dmg:40,skill:'none',cd:99,dur:0,hw:.3,h:1.84,eye:1.68},
  scrap:{n:['장갑 고철 좀비','Scrap-Armour Zombie'],sk:['고철 갑옷','Scrap armour'],d:['3챕터 · 총알 −50%, 불·폭발 ×2, 느림','Chapter 3 · bullets −50 %, fire and blasts ×2, slow'],hp:2300,armor:180,speed:5,jump:6.8,kb:.45,dmg:60,skill:'none',cd:99,dur:0,hw:.36,h:1.96,eye:1.78}});
// chapter 4 (lyrebird.js): LYREBIRD, RT-1's signaller (its own brain; 1.4× a man, on all fours), the radio-operator zombie (kill it
// and its radio traces LYREBIRD for 5 s), the spore zombie (bursts into a patch of thick fog) and the mirage — a hallucination in a
// teammate's shape (drawn with that teammate's rig; no flashlight)
Object.assign(ZCLASS,{
  lyrebird:{n:['라이어버드','LYREBIRD'],sk:['흉내','Mimicry'],d:['4챕터 보스 · RT1-05','Chapter 4 boss · RT1-05'],hp:19000,armor:0,speed:7.5,jump:9,kb:.2,dmg:24,skill:'none',cd:99,dur:0,hw:.42,h:1.9,eye:1.6},
  radioman:{n:['통신병 좀비','Radio-Operator Zombie'],sk:['역탐지','Trace'],d:['4챕터 · 무전기가 지직거린다 — 죽이면 5초 동안 라이어버드 위치가 보인다','Chapter 4 · its radio crackles — kill it and LYREBIRD shows for 5 s'],hp:1500,armor:40,speed:5.6,jump:7.2,kb:1,dmg:22,skill:'none',cd:99,dur:0,hw:.3,h:1.84,eye:1.7},
  spore:{n:['포자 좀비','Spore Zombie'],sk:['포자 안개','Spore fog'],d:['4챕터 · 터지면 그 자리 안개가 짙어진다','Chapter 4 · bursts into a patch of thick fog'],hp:1400,armor:30,speed:5,jump:6.8,kb:1.2,dmg:26,skill:'none',cd:99,dur:0,hw:.32,h:1.86,eye:1.7},
  mirage:{n:['환각','Mirage'],sk:['붙잡기','Grab'],d:['4챕터 · 안개 속의 아군 모습 — 손전등이 없다','Chapter 4 · a teammate in the fog — with no flashlight'],hp:300,armor:0,speed:4.6,jump:6,kb:1.5,dmg:0,skill:'none',cd:99,dur:0,hw:.3,h:1.8,eye:1.65}});
// chapter 5 (tiamat.js): TIAMAT, the giant centipede (the actor is its head; the body follows its trail and has its own hit volumes),
// the drowned zombie (climbs out of the water, holds an ankle), the hazmat researcher (its tank bursts into spores) and the little
// centipede (a severed piece of TIAMAT)
Object.assign(ZCLASS,{
  tiamat:{n:['티아마트','TIAMAT'],sk:['원종','Origin strain'],d:['5챕터 보스 · Q7-Ω','Chapter 5 boss · Q7-Ω'],hp:23500,armor:0,speed:6,jump:8,kb:.02,dmg:40,skill:'none',cd:99,dur:0,hw:.9,h:1.6,eye:1.2},
  drowned:{n:['익사체 좀비','Drowned Zombie'],sk:['발목 잡기','Ankle grab'],d:['5챕터 · 물속에서 기어 나와 발목을 잡는다 (이동 −50%, 쏴서 떼어내기)','Chapter 5 · climbs out of the water and grabs an ankle (−50 % speed until you shoot it off)'],hp:1600,armor:20,speed:5,jump:6.8,kb:1.1,dmg:22,skill:'none',cd:99,dur:0,hw:.3,h:1.82,eye:1.68},
  hazmat:{n:['방호복 연구원 좀비','Hazmat Researcher Zombie'],sk:['포자 가스통','Spore tank'],d:['5챕터 · 방호복이라 단단하다 — 쓰러지면 등의 가스통이 터져 포자가 퍼진다','Chapter 5 · tough in its suit — its back tank bursts into spores when it falls'],hp:2200,armor:80,speed:4.8,jump:6.6,kb:.8,dmg:26,skill:'none',cd:99,dur:0,hw:.32,h:1.86,eye:1.7},
  centi:{n:['새끼 지네','Little Centipede'],sk:['독니','Venom bite'],d:['5챕터 · 끊어진 티아마트의 마디 — 낮고 빠르다','Chapter 5 · a severed piece of TIAMAT — low and fast'],hp:900,armor:0,speed:7.2,jump:6,kb:.6,dmg:24,skill:'none',cd:99,dur:0,hw:.42,h:.9,eye:.6}});
// chapter 6 (legatus.js, season 2): LEGATUS, RT-1's leader (a big soldier's body; riding his APC TESTUDO in phase 1, his hits are worked out
// by the chapter), and the RT-1 shield trooper (its ballistic shield stops every bullet from the front)
Object.assign(ZCLASS,{
  legatus:{n:['레가투스','LEGATUS'],sk:['지휘','Command'],d:['6챕터 보스 · RT1-01','Chapter 6 boss · RT1-01'],hp:24000,armor:0,speed:5.6,jump:8.5,kb:.15,dmg:30,skill:'none',cd:99,dur:0,hw:.34,h:1.95,eye:1.8},
  shield:{n:['방패병 좀비','Shield Trooper Zombie'],sk:['방탄 방패','Ballistic shield'],d:['6챕터 · 정면 총알은 방패가 다 막는다 — 옆이나 뒤, 폭발로','Chapter 6 · its shield stops every bullet from the front — go round it, or use a blast'],hp:2000,armor:70,speed:4.9,jump:6.8,kb:.35,dmg:26,skill:'none',cd:99,dur:0,hw:.32,h:1.86,eye:1.7}});
// chapter 7 (lorelei.js, season 2): LORELEI, RT-1's negotiator (her song pulls humans in; her hits and the hall's props are the chapter's),
// and the Listener (a citizen from the shelter, eyes bandaged: it hunts by sound, not by sight)
Object.assign(ZCLASS,{
  lorelei:{n:['로렐라이','LORELEI'],sk:['노래','Song'],d:['7챕터 보스 · RT1-03','Chapter 7 boss · RT1-03'],hp:22000,armor:0,speed:5.8,jump:9,kb:.2,dmg:30,skill:'none',cd:99,dur:0,hw:.3,h:1.95,eye:1.82},
  listener:{n:['청중 좀비','Listener Zombie'],sk:['소리 추적','Hunts by sound'],d:['7챕터 · 눈이 없다 — 총소리와 뛰는 발소리로 쫓아온다 (앉아서 걸으면 못 찾는다)','Chapter 7 · no eyes — it hunts by gunfire and running feet (crouch-walk and it cannot find you)'],hp:1700,armor:20,speed:5.4,jump:6.6,kb:1,dmg:30,skill:'none',cd:99,dur:0,hw:.31,h:1.84,eye:1.7}});
// chapter 8 (charon.js, season 2): CHARON, RT-1's pilot (in the air his helicopter FERRY 06 takes the hits: the chapter works them out),
// and the Frozen (the airfield's ground crew, buried in the drifts until something comes near)
Object.assign(ZCLASS,{
  charon:{n:['카론','CHARON'],sk:['비행','Flight'],d:['8챕터 보스 · RT1-06','Chapter 8 boss · RT1-06'],hp:22000,armor:0,speed:5.6,jump:9,kb:.2,dmg:30,skill:'none',cd:99,dur:0,hw:.3,h:1.9,eye:1.78},
  frozen:{n:['동사자 좀비','Frozen Zombie'],sk:['눈 속 매복','Buried in the snow'],d:['8챕터 · 눈더미 속에 묻혀 있다가 가까이 오거나 총소리가 나면 튀어나온다 — 불과 폭발에 약하다','Chapter 8 · buried in the drifts until you come near or fire close by — weak to fire and blasts'],hp:1500,armor:30,speed:5,jump:6.6,kb:.9,dmg:30,skill:'none',cd:99,dur:0,hw:.31,h:1.86,eye:1.7}});
// chapter 9 (daedalus.js, season 2): DAEDALUS, RT-1's engineer (his patterns, the sentries he sets up and the lightning on his rods are the
// chapter's), the Static zombie (the station's crew, struck in the storm: its claws daze, it discharges as it dies) and the sentry gun
// (an actor of its own: it does not move; DAEDALUS sets them up, three stand in the summit's maze)
Object.assign(ZCLASS,{
  daedalus:{n:['다이달로스','DAEDALUS'],sk:['공병','Engineer'],d:['9챕터 보스 · RT1-04','Chapter 9 boss · RT1-04'],hp:22000,armor:0,speed:5.6,jump:9,kb:.2,dmg:30,skill:'none',cd:99,dur:0,hw:.3,h:1.9,eye:1.78},
  static:{n:['감전 좀비','Static Zombie'],sk:['방전','Discharge'],d:['9챕터 · 번개 맞은 정비원 — 할퀴면 어지럽고, 죽을 때 방전된다 (파란 원). 근처에 번개가 치면 한동안 더 빨라진다','Chapter 9 · a crewman struck in the storm — its claws daze, it discharges when it dies (the blue ring); lightning close by makes it faster for a while'],hp:1300,armor:20,speed:5.1,jump:6.8,kb:1,dmg:24,skill:'none',cd:99,dur:0,hw:.3,h:1.82,eye:1.68},
  sentry:{n:['자동 포탑','Sentry Gun'],sk:['조준 사격','Lock and fire'],d:['9챕터 · 다이달로스의 포탑 — 빨간 레이저가 잡으면 1초 뒤 연사. 폭발에 약하다','Chapter 9 · DAEDALUS\'s gun — once its red laser holds you, it fires a second later. Weak to blasts'],hp:700,armor:0,speed:0,jump:0,kb:0,dmg:0,skill:'none',cd:99,dur:0,hw:.42,h:1.25,eye:1.05}});
// chapter 10 (elpis.js, season 2's finale): ELPIS, RT-1's medic (her darts, the AEDs she throws onto the bodies, the gas and the memories of
// RT-1 she calls on are the chapter's), the Patient (Q-7's patients from the ward below: it gets back up once unless it is finished
// cleanly) and the AED (an actor of its own that never moves: by a body, it shocks it back up unless it is shot apart first)
Object.assign(ZCLASS,{
  elpis:{n:['엘피스','ELPIS'],sk:['의무병','Medic'],d:['10챕터 보스 · RT1-02','Chapter 10 boss · RT1-02'],hp:22000,armor:0,speed:5.6,jump:9,kb:.2,dmg:30,skill:'none',cd:99,dur:0,hw:.3,h:1.9,eye:1.78},
  patient:{n:['환자 좀비','Patient Zombie'],sk:['재기','Gets back up'],d:['10챕터 · Q-7 지하 병동의 환자 — 쓰러뜨려도 한 번 다시 일어난다 (머리 · 폭발 · 불로 끝내면 못 일어난다)','Chapter 10 · a patient from Q-7\'s ward below — put it down and it gets back up once (finish it with a headshot, a blast or fire and it stays down)'],hp:1250,armor:10,speed:5.3,jump:6.6,kb:1,dmg:24,skill:'none',cd:99,dur:0,hw:.3,h:1.8,eye:1.66},
  aed:{n:['제세동기','AED'],sk:['소생','Resuscitate'],d:['10챕터 · 엘피스의 제세동기 — 시체 옆에 떨어지면 3초 뒤 시체를 다시 일으킨다. 쏴서 부숴라','Chapter 10 · ELPIS\'s AED — dropped by a body, it shocks the body back up 3 s later. Shoot it apart'],hp:260,armor:0,speed:0,jump:0,kb:0,dmg:0,skill:'none',cd:99,dur:0,hw:.3,h:.45,eye:.3}});
const ZALL=['rager','runner','brute','scream','coffin','bomber','spitter','boss','aleph','strait','argus','squad','khepri','larva','scrap','lyrebird','radioman','spore','mirage','tiamat','drowned','hazmat','centi','fireman','legatus','shield','lorelei','listener','charon','frozen','daedalus','static','sentry','elpis','patient','aed'],BOSS_S=2.2,ZBIG={boss:1,aleph:1};
const BOT_NAMES=['칼바람','도토리','Nox','라임','Vex','곰돌이','Kite','먹구름','Pilot','쥐불','Ash','소금빵','Rook','반딧불','Echo','짱돌','Mako','새벽','Juno','고등어','Wren','탄산수','Oslo','호떡'];
const G={pvp:false,st:'menu',mode:'mut',round:0,rounds:7,roundTime:180,prepTime:20,time:0,t:0,actors:[],player:null,score:[0,0],moralePts:0,moraleLvl:0,endT:0,winner:-1,lastHuman:null,cfg:null,spec:null,specIdx:0,deathCam:0,
  hostN:0,beepAt:0,lastAnn:'',paused:false,stats:null};
let ACTOR_ID=0;
function mkActor(name,isPlayer,skin){const a={id:ACTOR_ID++,name,isPlayer,skin,zpick:rpick(ZLIST),team:TH,alive:false,
  c:{x:0,y:0,z:0,vx:0,vy:0,vz:0,hw:.3,h:1.8,onGround:false,stepH:.5,jumped:false},yaw:0,pitch:0,duck:false,
  hp:100,maxHp:100,armor:0,money:0,kills:0,hsKills:0,infects:0,deaths:0,score:0,dmgDealt:0,
  inv:{1:null,2:'p9',3:'knife',he:0,frost:0,flare:0,smoke:0},ammo:{},cur:'p9',prev:'knife',nextFire:0,reloadT:0,relKind:null,shellT:0,drawT:0,shots:0,recoilSpread:0,punchP:0,punchY:0,kick:0,zoom:0,zoomWas:0,boltT:0,pumpT:0,throwT:0,throwKind:null,
  zc:'rager',lvl:1,infR:0,host:false,skillCD:0,skillT:0,bombs:0,frozen:0,staggerT:0,dizzy:0,shriekT:0,lastHurt:-99,
  deadT:0,permaDead:false,reviveT:0,respawnT:0,deadDir:1,reviving:0,mvx:0,mvz:0,kvx:0,kvz:0,
  cmd:{f:0,s:0,jump:false,duck:false,walk:false,fire:false,alt:false,reload:false,skill:false,slot:0,nv:false},pc:{},
  rigs:{},ch:null,gun:null,gunId:null,head:new THREE.Vector3(),headR:.14,stepPh:0,stepAcc:0,an:{atk:0,atkSide:1,flinch:0,dead:0,skill:0},flash:false,nv:false,
  bot:null,survived:false,airT:0,fallV:0,beam:null};
  return a}
// ---------- inventory ----------
function fillAmmo(a,id){const W=WPN[id];if(!W||!W.mag)return;a.ammo[id]={mag:W.mag,res:W.res}}
function giveDefault(a){a.inv={1:null,2:'p9',3:'knife',he:0,frost:0,flare:0,smoke:0};a.ammo={};fillAmmo(a,'p9');a.cur='p9';a.prev='knife';gunFresh(a,'p9')}
// a gun that just came into someone's hands: its first draw plays the gun's own ready action (GUN_DESIGN, vmdraw.js)
function gunFresh(a,id){const W=WPN[id];if(W&&W.fd&&W.fd.act)(a.fresh||(a.fresh={}))[id]=1}
function hasWeapon(a,id){const W=WPN[id];if(!W)return false;if(W.kind==='nade')return id==='zbomb'?a.bombs>0:a.inv[id]>0;return a.inv[W.slot]===id}
// 챈샷 (quick switch): flicking back to the gun you put away a moment ago (Q twice) brings it up in under half its draw time.
// Switching already drops the bolt/pump cycle and the shot delay, so a sniper or pump gun fires again sooner than by waiting.
const QUICK_BACK=1.2,QUICK_DRAW=.45;
function equip(a,id,instant){if(!id||a.cur===id&&!instant)return;const W=WPN[id];if(!W)return;
  const fd=!instant&&a.fresh&&a.fresh[id]&&W.fd&&W.fd.act?W.fd:null;if(fd)delete a.fresh[id];
  const quick=!fd&&!instant&&id===a.awayId&&G.t-(a.awayT==null?-9:a.awayT)<QUICK_BACK;
  if(a.cur&&a.cur!==id){a.prev=a.cur;a.awayId=a.cur;a.awayT=G.t;if(!instant)a.swapT=G.t}
  a.cur=id;a.reloadT=0;a.relKind=null;a.drawT=instant?0:(W.draw||.5)*(quick?QUICK_DRAW:1)+(fd?fd.x||.5:0);a.zoom=0;a.boltT=0;a.pumpT=0;a.shots=0;a.throwT=0;a.nHold=0;a.bSt=0;a.bT=0;a.hamB=false;a.dualB=false;a.burstN=0;a.nextFire=Math.min(a.nextFire,G.t);// a swing already under way still lands (pendingMelee keeps its weapon)
  if(a.isPlayer){VM.set(id==='claw'?'claw':id,a.team===TZ?'z_'+a.zc:a.skin);if(fd)VM.firstDraw(W.draw||.5,fd.x||.5,fd);else if(quick)VM.draw(a.drawT);if(!instant)AU.play(W.drawS||(W.kind==='melee'?'kdraw':'draw'),{vol:.5,rate:(W.drawS?1:id==='axe'?.72:id==='hammer'?.58:1)*(quick?1.3:1)})}
  else if(!instant&&a.alive&&a.team===TH&&W.kind!=='claw')othSnd(a,W.drawS||(W.kind==='melee'?'kdraw':'draw'),.45,20);
  // 칼 챈샷 (draw cut): a blade drawn within a second of a gunshot, with an enemy in reach in front, comes out as an instant heavy cut —
  // full heavy damage and knockback on top of the shot that was just fired
  if(!instant&&W.kind==='melee'&&!W.noDC&&a.team===TH&&a.alive&&G.t-(a.lastFire==null?-9:a.lastFire)<DRAW_CUT_WIN){const r=meleeHit(a,W.range[1],.8);
    if(r&&r.t){a.drawT=0;a.nextFire=G.t+W.rate[1]*.8;a.an.atk=1;a.an.heavy=true;a.an.atkD=meleeAtkD(W,true)*.85;if(a.isPlayer)VM.draw(.12);meleeSwing(a,true);meleePend(a,.06,true,true);a.drawCuts=(a.drawCuts||0)+1}}}
const DRAW_CUT_WIN=1;
// a melee swing lands hitT after it starts with the weapon that swung it, even if the player switches weapons in between
// (swap-cancel: the blade/hammer damage still goes in while the next gun comes up)
// dc = a draw cut (chain shot): it lands with the weapon's biggest blow (the hammer's pound, not its short knock-away stance)
function meleePend(a,t,heavy,dc){if(a.pendingMelee)meleeStrike(a,a.pendingMelee.heavy,a.pendingMelee.w,a.pendingMelee.dc);a.pendingMelee={t,heavy,w:a.cur,dc:!!dc}}
function meleePendTick(a,dt){const p=a.pendingMelee;if(!p)return false;if(!a.alive||a.team!==TH){a.pendingMelee=null;return false}
  p.t-=dt;if(p.t<=0){a.pendingMelee=null;meleeStrike(a,p.heavy,p.w,p.dc)}return true}
// third-person swing length (seconds) for a melee weapon
function meleeAtkD(W,heavy){return W&&W.anD?W.anD[heavy?1:0]:heavy?.68:.44}
function slotPick(a,slot){if(a.team===TZ){if(slot===4&&a.bombs>0)equip(a,'zbomb');else if(slot!==4)equip(a,'claw');return}
  if(slot===4){const order=H_NADES.filter(k=>a.inv[k]>0);if(!order.length)return;const i=order.indexOf(a.cur);equip(a,order[(i+1)%order.length]);return}
  const id=slot===3?(a.inv[3]||'knife'):a.inv[slot];if(id)equip(a,id)}
function bestWeapon(a){return a.inv[1]||a.inv[2]||a.inv[3]||'knife'}
// buying (free: buy / buyCheck), the loadout carried between rounds and the saved sets: loadout.js
// ---------- geometry helpers ----------
const _eye=new THREE.Vector3(),_mz=new THREE.Vector3();
function eyeH(a){if(a.team===TZ){const Z=ZCLASS[a.zc];return a.duck?Z.eye*.68:Z.eye}return a.duck?1.1:1.64}
// a fresh vector every call: callers keep it across other calls (fireGun's pellets once started from the player's head when it was shared)
function actorEye(a){return new THREE.Vector3(a.c.x,a.c.y+eyeH(a),a.c.z)}
function muzzleWorld(a){const W=WPN[a.cur];if(a.isPlayer&&!G.spec){aimDir(a.yaw,a.pitch,_dv);const e=actorEye(a);const rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);const sd=W&&W.dual?(a.dualSide>0?.12:-.12):.1;
    return _mz.set(e.x+_dv.x*.75+rx*sd,e.y+_dv.y*.75-.09,e.z+_dv.z*.75+rz*sd)}
  const g=W&&W.dual&&a.dualSide<0&&a.gun2?a.gun2:a.gun;
  if(g&&W&&W.model){const m=GUNS[W.model].muzzle;_mz.set(m[0],m[1],m[2]);g.updateMatrixWorld();_mz.applyMatrix4(g.matrixWorld);return _mz}
  return actorEye(a)}
function surfaceAt(x,y,z){_bq.length=0;boxesIn(x-.05,z-.05,x+.05,z+.05,_bq);let best=null,h=-1e9;for(const b of _bq){if(b.nosolid)continue;if(x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&b.y1<=y+.05&&b.y1>h){h=b.y1;best=b}}
  if(!best)return 'conc';const k=matKind((best.o.f&&best.o.f.py)||best.mat);return k==='metal'?'metal':k==='soft'?'dirt':k==='wood'?'wood':'conc'}
// ---------- spawning ----------
function setHull(a){const c=a.c;if(a.team===TZ){const Z=ZCLASS[a.zc];c.hw=Z.hw;c.h=a.duck?Z.h*.7:Z.h}else{c.hw=.3;c.h=a.duck?1.25:1.8}}
function placeAt(a,x,y,z,yaw){const c=a.c;c.x=x;c.y=y;c.z=z;c.vx=c.vy=c.vz=0;c.onGround=false;a.mvx=a.mvz=a.kvx=a.kvz=0;a.yaw=yaw||0;a.pitch=0;a.duck=false;setHull(a);
  // nudge out of anything we overlap
  if(!charFits(c,c.x,c.y,c.z)){for(let r=.4;r<4;r+=.4){let ok=false;for(let k=0;k<12;k++){const an=k/12*TAU;if(charFits(c,x+Math.cos(an)*r,y,z+Math.sin(an)*r)){c.x=x+Math.cos(an)*r;c.z=z+Math.sin(an)*r;ok=true;break}}if(ok)break}}}
// a dead zombie comes back somewhere random on the map: any open walkable spot well away from every human
// (12 m, then 8 m when the map is crowded), else the zombie spawn farthest from them
function zRandomSpawn(){const H=G.actors.filter(t=>t.alive&&t.team===TH),N=NAV.nodes;
  if(N.length)for(const lim of [12,8])for(let k=0;k<60;k++){const n=N[(Math.random()*N.length)|0];if(n.e.length<15)continue;let ok=true;
    for(const h of H)if(dist2(n.x,n.z,h.c.x,h.c.z)+Math.abs(n.y-h.c.y)*2<lim){ok=false;break}if(ok)return [n.x,n.y+.02,n.z]}
  const p=zSpawnPoint();return [p[0],p[2]||0,p[1]]}
// zombie-side round balance (tuned with a bot-only round simulator, 16 players):
//   hostHp: host hp per human it faces (shared between the hosts); regen: share of max hp healed per second once nobody has hurt the zombie
//   for regenWait s; kbCap: most knockback (m/s) sustained gunfire can pile on a zombie / a host; moraleMax: morale levels (+10 % each),
//   moraleDrop: levels lost per infection;
//   cbRevive / cbKb: in a comeback, how much faster the dead rise and how much of the shove still lands; cbStuck: see zComeback
const ZBAL={hostHp:240,regen:.04,regenWait:4,kbCap:[5,3.5],moraleMax:5,moraleDrop:1,cbRevive:1.6,cbKb:.6,cbStuck:60,
  origHp:1.6,origArmor:1.3,origHostHp:420,origHostDiv:4};// Classic Infection: one life each, so every zombie is tougher and there are more hosts
// hosts: about a fifth of the room, 2–4 (one in a room of five or fewer)
function hostsFor(N){const o=G.mode==='orig';return N<6?1:clamp(Math.round(N/(o?ZBAL.origHostDiv:5)),2,o?5:4)}
// comeback (Evolved Infection): two zombies or fewer on their feet against six humans or more, or the zombies still stuck at one infection or none
// ZBAL.cbStuck s into the round against ten humans or more — the dead rise sooner (5 s instead of 8), whole and armoured, near the rest
// of the pack and out of sight, and bullets shove them less (ZBAL.cbRevive / cbKb)
function zComeback(){if(G.mode!=='mut'||G.st!=='fight')return false;if(G.cbT===G.t)return G.cb;let z=0,h=0,n=0;for(const a of G.actors){if(a.team===TZ)n++;if(!a.alive)continue;if(a.team===TZ)z++;else h++}
  G.cbT=G.t;G.cb=z<=2&&h>=6||ZBAL.cbStuck>0&&G.roundTime-G.time>ZBAL.cbStuck&&n<=(G.hostN||2)+1&&h>=10;return G.cb}
// where a zombie rises in a comeback: 6–18 m from another zombie on its feet (else anywhere), 12 m or more from every human and out of their sight
function zPackSpawn(a){const H=G.actors.filter(t=>t.alive&&t.team===TH),Z=G.actors.filter(t=>t!==a&&t.alive&&t.team===TZ),N=NAV.nodes;if(!N.length)return zRandomSpawn();
  for(let k=0;k<80;k++){const b=Z.length&&k<50?rpick(Z):null;const n=b?navAround(b.c.x,b.c.z,6,18):N[(Math.random()*N.length)|0];if(!n||n.e.length<15)continue;let ok=true;
    for(const h of H)if(dist2(n.x,n.z,h.c.x,h.c.z)+Math.abs(n.y-h.c.y)*2<12){ok=false;break}if(ok&&!hSees(H,n,40))return [n.x,n.y+.02,n.z]}
  return zRandomSpawn()}
function zSpawnPoint(){const H=G.actors.filter(t=>t.alive&&t.team===TH);let best=null,bd=-1;
  const pts=MAP.zspawns.length?MAP.zspawns:MAP.spawns;
  for(const p of pts){let md=1e9;for(const h of H)md=Math.min(md,dist2(p[0],p[1],h.c.x,h.c.z)+Math.abs((p[2]||0)-h.c.y)*2);if(md>bd){bd=md;best=p}}return best||MAP.spawns[0]}
// ---------- rigs / visuals ----------
function rigKey(a){return a.team===TZ?'z_'+a.zc+(a.host?'_h':''):'h_'+a.skin}
function ensureRig(a){const k=rigKey(a);if(a.ch&&a.ch.key===k)return;if(a.ch)R.scene.remove(a.ch.grp);
  let ch=a.rigs[k];if(!ch){ch=a.rigs[k]=makeChar(k)}a.ch=ch;R.scene.add(ch.grp);a.gunId=null;if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}
  if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}}
function ensureGun(a){const W=WPN[a.cur];const want=a.team===TH&&W&&W.model?W.model+(W.dual?'+2':''):null;if(a.gunId===want)return;
  if(a.gun){a.gun.parent&&a.gun.parent.remove(a.gun);a.gun=null}if(a.gun2){a.gun2.parent&&a.gun2.parent.remove(a.gun2);a.gun2=null}a.gunId=want;if(!want)return;
  if(!a.gunMat)a.gunMat=matGun();
  const m=new THREE.Mesh(gunGeo(W.model),a.gunMat);m.matrixAutoUpdate=false;a.ch.grp.add(m);a.gun=m;
  if(a.beam){a.beam.parent&&a.beam.parent.remove(a.beam);a.beam=null}
  if(W.dual){const m2=new THREE.Mesh(gunGeo(GUNS[W.model].alt||W.model),a.gunMat);m2.matrixAutoUpdate=false;a.ch.grp.add(m2);a.gun2=m2}}
const _pr=new THREE.Color(),_fyo=[0,0,0,0];
function updateVisual(a,dt){if(!a.ch)return;const ch=a.ch,c=a.c;const show=!(a.isPlayer&&!G.spec&&a.alive)&&(a.alive||a.deadT<60||!a.permaDead||G.st!=='menu');
  ch.grp.visible=show&&(a.alive||a.an.dead>0);if(!ch.grp.visible){if(a.gun)a.gun.visible=false;
    // the local player's body is not drawn, but its head (the hit sphere, and where claws and bot bullets aim) must still follow it
    if(a.alive){a.head.set(c.x,c.y+eyeH(a)+.05,c.z);a.headR=a.team===TZ?(a.zc==='brute'?.16:ZBIG[a.zc]?.16*BOSS_S:.14):.14;if(KC.rec&&a.isPlayer){KC.ghost(a,dt);visUni(a,dt);ensureGun(a)}}return}
  const st=visState(a,dt);if(KC.rec)a._st=st;
  if(a.team===TZ)poseZombie(ch,st);else poseHuman(ch,st);
  visTail(a,dt)}
// (v7.7) what a drawn character's pose is made from: its locomotion state for the animation (body-space velocity, the stride clock,
// turning, crouch, air), then what it holds and does. The kill cam (killcam.js) records it and poses a copy of the rig from it
function visState(a,dt){const ch=a.ch,c=a.c;
  const an=a.an;an.atk=Math.max(0,an.atk-dt/(an.atkD||.42));an.flinch=Math.max(0,an.flinch-dt*4);an.flx=(an.flx||0)*Math.exp(-dt*5);an.skill=Math.max(0,an.skill-dt);
  if(!a.alive)an.dead=Math.min(1,an.dead+dt*2.2);else if(a.reviving>0){an.dead=a.reviving/1.2}else an.dead=a.kdP>0?Math.min(.999,a.kdP):0;// kdP: knocked flat by a charge (fireman.js), drawn with the get-up pose
  // locomotion state for animation: body-space velocity, a stride clock tied to distance, turn rate, acceleration, smoothed crouch / air / sprint
  const sp=Math.hypot(c.vx,c.vz);const k10=1-Math.exp(-dt*10),k6=1-Math.exp(-dt*6);
  const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw);const vF=c.vx*fx+c.vz*fz,vS=-c.vx*fz+c.vz*fx;an.mvF=lerp(an.mvF||0,vF,k10);an.mvS=lerp(an.mvS||0,vS,k10);
  const acc=(vF-(an.pvF||0))/Math.max(dt,1e-3);an.pvF=vF;an.acc=lerp(an.acc||0,clamp(acc/14,-1,1),k6);
  const yr=an.pyaw==null?0:wrapA(a.yaw-an.pyaw)/Math.max(dt,1e-3);an.pyaw=a.yaw;an.trn=lerp(an.trn||0,clamp(yr,-8,8),k6);
  an.cr=approach(an.cr||0,a.duck?1:0,dt*7);an.airS=approach(an.airS||0,(!c.onGround&&a.airT>.1)?1:0,dt*(c.onGround?9:5));an.land=Math.max(0,(an.land||0)-dt*3.2);
  // turning on the spot: the feet stay planted in the world until the body has twisted too far, then they shuffle round (left, then right)
  if(an.fy==null)an.fy=a.yaw;
  if(sp>.35||!c.onGround||!a.alive){an.fy=a.yaw;an.ft=0}
  else if(an.ft>0){an.ft=Math.max(0,an.ft-dt/.34);if(an.ft===0)an.fy=an.fyT}
  else if(Math.abs(wrapA(a.yaw-an.fy))>.5){an.fy0=an.fy;an.fyT=a.yaw;an.ft=1}
  if(an.ft>0){const q=1-an.ft,d=wrapA(an.fyT-an.fy0);const qa=smooth(clamp(q/.6,0,1)),qb=smooth(clamp((q-.4)/.6,0,1));
    _fyo[0]=wrapA(an.fy0+d*qa-a.yaw);_fyo[1]=wrapA(an.fy0+d*qb-a.yaw);_fyo[2]=Math.sin(Math.PI*clamp(q/.6,0,1))*.07;_fyo[3]=Math.sin(Math.PI*clamp((q-.4)/.6,0,1))*.07}
  else{_fyo[0]=_fyo[1]=wrapA(an.fy-a.yaw);_fyo[2]=_fyo[3]=0}
  const stride=strideLen(sp)*legScale(ch.A)*(a.team===TZ?((ZGAIT[a.zc]||{}).stride||1):1);a.stepPh+=dt*(sp>.12?sp/stride*TAU:0);
  const Wv=WPN[a.cur]||{};const sprintW=a.team===TH&&a.alive&&sp>4.3&&G.t-(a.lastFire||-9)>.6&&a.reloadT<=0&&!(an.atk>0)&&a.zoom<=0;an.spr=approach(an.spr||0,sprintW?1:0,dt*4);
  const st={spd:a.alive&&a.frozen<=0?sp:0,phase:a.stepPh,stride,footYaw:_fyo,mvF:an.mvF,mvS:an.mvS,crouch:Math.max(an.cr,a.epDown||0),air:an.airS,land:an.land,accel:an.acc,turnRate:an.trn,pitch:a.pitch,t:G.t+a.id*1.7,seed:a.id,zclass:a.zc,
    dead:an.dead,deadT:a.deadT,deadDir:a.deadDir,reviving:a.alive&&(a.reviving>0||a.kdP>0),zombie:a.team===TZ,chg:a.fmP||0,
    hold:a.team===TH?holdFor(a.cur):null,kick:Wv.dual&&a.dualSide<0?0:a.kick,kick2:Wv.dual&&a.dualSide<0?a.kick:0,
    reload:a.reloadT>0&&a.relKind==='mag'?1-a.reloadT/(Wv.reload||2):0,relKind:a.reloadT>0?a.relKind:null,shellP:a.relKind==='shell'?1-a.reloadT/(Wv.shellRel||.5):a.relKind==='start'?1-a.reloadT/(Wv.relStart||.4):0,brk:!!Wv.brk,sprint:an.spr,
    atk:an.atk>0?1-an.atk:0,atkSide:an.atkSide,heavy:!!an.heavy,flinch:an.flinch,flinchX:an.flx,skill:an.skill,stun:a.frozen,turn:a.turning>0?Math.min(1,a.turning*1.5):0,frenzy:a.team===TZ&&a.zc==='rager'&&a.skillT>0,shield:!!a.epShield,down:a.epDown||0};
  if(KC.rec){const fy=a._fy||(a._fy=[0,0,0,0]);for(let i=0;i<4;i++)fy[i]=_fyo[i];st.footYaw=fy}
  return st}
function visTail(a,dt){const ch=a.ch,c=a.c;
  if(a.alive&&ch.hide!==STUMPS){ch.hide=STUMPS;a.spurts=null}// anything revived is whole again
  rigCompute(ch);ch.grp.position.set(c.x,c.y,c.z);ch.grp.rotation.y=a.yaw;ch.grp.updateMatrixWorld(true);
  // arterial spurts from fresh stumps, pulsing with the last heartbeats
  if(a.spurts&&!a.alive&&GORE.lv>=2){for(const S of a.spurts){if(S.t<=0)continue;S.t-=dt;const beat=Math.max(0,Math.sin(G.t*8.5+S.ph));if(Math.random()>dt*55*beat*Math.min(1,S.t/1.4))continue;
      const D=SPURT_D[S.b-14];_sv.setFromMatrixPosition(ch.M[S.b]).applyMatrix4(ch.grp.matrixWorld);_sd.set(D[0],D[1],D[2]).transformDirection(ch.M[S.b]).transformDirection(ch.grp.matrixWorld);
      const sp=rr(1.6,3.2)*Math.min(1,S.t/1.2+.3);FX.spawn({x:_sv.x+_sd.x*.05,y:_sv.y+_sd.y*.05,z:_sv.z+_sd.z*.05,vx:_sd.x*sp+rr(-.25,.25),vy:_sd.y*sp+rr(0,.5),vz:_sd.z*sp+rr(-.25,.25),life:rr(.5,.9),s0:.05,s1:.03,r:.5,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:Math.random()<.25?rr(.05,.1):0})}}
  // level of detail: rounded fillets up close, chamfered parts further out
  {const cp=R.cam.position,dc=Math.hypot(c.x-cp.x,c.y+1-cp.y,c.z-cp.z),g=dc<14?ch.A.geo:ch.A.geoLo;if(ch.mesh.geometry!==g)ch.mesh.geometry=g}
  const U=visUni(a,dt);
  ensureGun(a);if(a.gun){a.gun.visible=!!ch.gunOn;if(ch.gunOn){a.gun.matrix.multiplyMatrices(ch.M[1],ch.gunM);a.gun.material.uniforms.uProbe.value.copy(U.uProbe.value)}}
  if(a.gun2){a.gun2.visible=!!ch.gunOn2;if(ch.gunOn2)a.gun2.matrix.multiplyMatrices(ch.M[1],ch.gunM2)}
  charHead(ch,a.head);a.headR=a.team===TZ?(a.zc==='brute'?.16:ZBIG[a.zc]?.16*BOSS_S:.14):.14;
  // a zombie's arms are hit volumes too (the Trapper's reach well outside its body box)
  if(a.team===TZ&&a.alive){if(!a.arms)a.arms=[0,1,2,3,4,5].map(()=>new THREE.Vector3());a.armR=charArms(ch,a.arms);a.armT=G.t}else a.armT=-1e9;
  // flashlight beam for human bots
  if(a.team===TH&&a.alive&&!a.isPlayer&&a.flash&&a.gun&&a.gun.visible){if(!a.beam){a.beam=mkBeam();a.gun.add(a.beam)}a.beam.visible=true}else if(a.beam)a.beam.visible=false}
// (v7.8.2) a body's light and colour: the probe at it, a hit's white flash fading, status tints, the level glow. Also kept up for the
// local player while its body is not drawn and a kill cam records (updateVisual): the kill cam draws it as it was
function visUni(a,dt){const ch=a.ch,c=a.c;
  sampleProbe(c.x,c.y+1.1,c.z,_pr);ch.mat.uniforms.uProbe.value.copy(_pr).multiplyScalar(1.25);
  const U=ch.mat.uniforms;U.uFlash.value=Math.max(0,U.uFlash.value-dt*8);
  // status tints: frozen (ice blue), frenzy (red), harden (stone), level glow
  const T=U.uTint.value;if(a.team===TZ&&a.zc==='runner'&&a.skillT>0&&a.alive)T.set(.5,.75,1,-(a.skillT<.6?a.skillT/.6*.7:.7));else if(a.frozen>0)T.set(.55,.8,1,.55);else if(a.skillT>0&&a.zc==='rager')T.set(.9,.1,.05,.3+.1*Math.sin(G.t*20));else if(a.skillT>0&&a.zc==='brute')T.set(.45,.42,.38,.45);else T.set(0,0,0,0);
  U.uEmisA.value=a.team===TZ?(a.lvl>=3?1.6:a.lvl>=2?1.25:1):1;
  return U}
let BEAM_GEO=null,BEAM_MAT=null;
function mkBeam(){if(!BEAM_GEO){BEAM_GEO=new THREE.ConeGeometry(1.5,9,10,1,true);BEAM_GEO.translate(0,-4.5,0);BEAM_GEO.rotateX(Math.PI/2);
    BEAM_MAT=new THREE.ShaderMaterial({vertexShader:'varying float vZ;varying vec3 vP;void main(){vZ=-position.z/9.;vec4 wp=modelMatrix*vec4(position,1.);vP=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}',
      fragmentShader:'varying float vZ;varying vec3 vP;uniform float uFogD;void main(){float z=clamp(vZ,0.,1.);float a=(1.-z)*(1.-z)*.045;float d=length(vP-cameraPosition);a*=smoothstep(.8,3.,d)*exp(-uFogD*uFogD*d*d);gl_FragColor=vec4(vec3(1.,.95,.8)*a,1.);}',
      uniforms:{uFogD:LU.uFogD},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})}
  const m=new THREE.Mesh(BEAM_GEO,BEAM_MAT);m.position.set(0,.06,-.3);m.renderOrder=7;return m}
// ---------- movement ----------
const BHOP_WIN=.3,BHOP_GAIN=.05,BHOP_MAX=6;// a jump within BHOP_WIN s of landing adds 5 % speed (up to 6 jumps = +30 %); holding jump rejumps on landing
const STAG_K=1.6;// gunfire stagger lasts 60 % longer (v6.26), and a staggered zombie runs at 40 % speed
const ZSPD=.95;// every zombie class runs 5 % below its table speed
function maxSpeed(a){if(a.frozen>0)return 0;let s;
  if(a.team===TZ){const Z=ZCLASS[a.zc];s=Z.speed*ZSPD*(a.lvl>=3?1.06:a.lvl>=2?1.03:1)*(a.bot?DIFF_Z.spd[G.diff||0]:1)*(a.spdMul||1);if(a.skillT>0&&a.zc==='rager')s*=1.45;if(a.skillT>0&&a.zc==='brute')s*=.82;if(a.staggerT>0)s*=.4;if(a.holdT>0)s*=a.host?.3:.12;if(a.burnT>0&&a.burnW==='salamander')s*=.88;if(a.duck)s*=.45}
  else{const W=WPN[a.cur];s=5.15*(a.hsk?hskSpeed(a,W):W?W.speed:1);if(W&&W.stance&&a.hamB)s*=W.stanceSpd;if(W&&W.atkSpd&&G.t<a.nextFire)s*=W.atkSpd[a.an.heavy?1:0];if(a.zoom>0)s*=.6;if(a.duck)s*=.36;else if(a.cmd.walk)s*=.52;if(a.shriekT>0)s*=.6;
    if(a.bhop>0&&(!a.c.onGround||G.t-(a.landT||-9)<BHOP_WIN+.1))s*=1+BHOP_GAIN*a.bhop}// chained jumps build speed (v6.26)
  return s}
function jumpV(a){if(a.team===TZ)return ZCLASS[a.zc].jump;return 6.3}
function actorPhysics(a,dt){const c=a.c,cmd=a.cmd;const wasG=c.onGround,vy0=c.vy;
  // crouch (in the air the legs tuck up, which is what makes crouch-jumps reach higher ledges)
  const H0=a.team===TZ?ZCLASS[a.zc].h:1.8,H1=a.team===TZ?ZCLASS[a.zc].h*.7:1.25,dh=H0-H1;
  if(cmd.duck&&!a.duck){a.duck=true;c.h=H1;if(!c.onGround&&charFits(c,c.x,c.y+dh,c.z))c.y+=dh}
  else if(!cmd.duck&&a.duck){const t={hw:c.hw,h:H0};if(c.onGround){if(charFits(t,c.x,c.y,c.z)){a.duck=false;c.h=H0}}else{if(charFits(t,c.x,c.y-dh,c.z)&&c.y-dh>floorBelow(c.x,c.y+.1,c.z,c.hw)-.01){c.y-=dh;a.duck=false;c.h=H0}else if(charFits(t,c.x,c.y,c.z)){a.duck=false;c.h=H0}}}
  if(a.team===TZ){const Z=ZCLASS[a.zc];if(c.hw!==Z.hw&&charFits({hw:Z.hw,h:c.h},c.x,c.y,c.z))c.hw=Z.hw}
  // wish velocity
  const sp=a.rootT>0?0:maxSpeed(a);let f=cmd.f,s=cmd.s;const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}
  const fx=-Math.sin(a.yaw),fz=-Math.cos(a.yaw),rx=Math.cos(a.yaw),rz=-Math.sin(a.yaw);
  let wx=(fx*f+rx*s)*sp,wz=(fz*f+rz*s)*sp;if(a.dizzy>0){const w=Math.sin(G.t*3+a.id)*a.dizzy*.3;const cx=wx*Math.cos(w)-wz*Math.sin(w);wz=wx*Math.sin(w)+wz*Math.cos(w);wx=cx}
  const acc=c.onGround?(a.team===TZ?40:48):(a.team===TZ?12:9);const k=Math.min(1,acc*dt/Math.max(.001,Math.hypot(wx-a.mvx,wz-a.mvz)));
  a.mvx+=(wx-a.mvx)*k;a.mvz+=(wz-a.mvz)*k;
  // knockback decays faster on the ground
  const kd=Math.exp(-dt*(c.onGround?4:1.1));a.kvx*=kd;a.kvz*=kd;
  if(a.frozen>0){a.mvx=a.mvz=0;a.kvx*=.5;a.kvz*=.5}
  // jump
  if(cmd.jump&&(!a.pc.jump||G.t-(a.landT||-9)<.09)&&c.onGround&&a.frozen<=0&&!(a.rootT>0)&&!(a.holdT>0)){if(a.team===TH)a.bhop=G.t-(a.landT||-9)<BHOP_WIN?Math.min(BHOP_MAX,(a.bhop|0)+1):0;c.vy=jumpV(a);c.onGround=false;c.jumped=true;if(a.isPlayer){VM.jumped();if(a.team===TH)AU.play('step_conc',{vol:.35*(CFG.stepVol==null?1:CFG.stepVol)})}else stepSnd(a,.6,1.1)}
  c.vx=a.mvx+a.kvx;c.vz=a.mvz+a.kvz;const ox=c.x,oz=c.z;
  moveChar(c,dt);headStand(a);
  // blocked axes lose their velocity
  const ddx=c.x-ox,ddz=c.z-oz;if(Math.abs(ddx)<Math.abs(c.vx*dt)*.4){a.kvx*=.2;a.mvx*=.6}if(Math.abs(ddz)<Math.abs(c.vz*dt)*.4){a.kvz*=.2;a.mvz*=.6}
  c.vx=ddx/Math.max(dt,1e-4);c.vz=ddz/Math.max(dt,1e-4);
  if(c.onGround)a.airT=0;else a.airT+=dt;
  if(c.onGround&&a.bhop>0&&G.t-(a.landT||-9)>BHOP_WIN+.1)a.bhop=0;
  if(!wasG&&c.onGround){a.landT=G.t;const v=-vy0;if(v>2.5){a.an.land=Math.max(a.an.land||0,clamp((v-2)/9,.2,1));if(a.isPlayer)VM.landed(clamp((v-2)/10,.15,1))}if(v>3){if(a.isPlayer){if(v>6.5)AU.play('land',{vol:clamp(v/14,.3,.9)});else stepSnd(a,1.1,.9)}else stepSnd(a,clamp(v/5,1,2),.85)}
    // (no fall damage for humans since v6.26)
  }
  if(c.y<-20){c.y=2;c.x=0;c.z=5}
  // footsteps
  const hs=Math.hypot(c.vx,c.vz);if(c.onGround&&hs>1.5){a.stepAcc+=hs*dt;const stride=a.team===TZ?1.7:1.9;if(a.stepAcc>stride){a.stepAcc=0;footstep(a)}}}
// standing on a teammate's head (zombies climbing on each other to reach a roof, humans boosting each other):
// a body is ground for whoever comes down on top of it from the same team
function headStand(a){const c=a.c;a.onHead=null;if(c.vy>.5||window.__noStack)return;let top=-1e9,sb=null;
  for(const b of G.actors){if(b===a||!b.alive||b.team!==a.team||b.onHead===a)continue;const r=(c.hw+b.c.hw)*.8;if(Math.abs(b.c.x-c.x)>r||Math.abs(b.c.z-c.z)>r)continue;
    const t=b.c.y+b.c.h;if(c.y<t-.45||c.y>t+.02||t<=top)continue;top=t;sb=b}
  if(!sb||!charFits(c,c.x,top,c.z))return;c.y=top;c.vy=0;c.onGround=true;c.jumped=false;a.onHead=sb}
// footsteps (v6.94, 사플): a human's by the surface under it, a zombie's by its build (heavier: lower and louder); someone else's are heard
// where they are (AU.stepAt: up to 40 m a human, 45 a zombie), the player's own quietly. A walking (Shift) or crouching human is silent;
// a jump's push-off and its landing are heard too. k: how hard (1 a step), rate: its pitch, dl: a delay (a puppet's motion is drawn late)
const stepName=s=>s==='metal'?'step_metal':s==='dirt'?'step_dirt':s==='wood'?'step_wood':'step_conc';
function zStepK(a){const Z=ZCLASS[a.zc]||ZCLASS.rager,w=clamp((Z.hw||.3)*(Z.h||1.8)/.54,.75,2.2);return [clamp(1-.3*(w-1),.7,1.15),clamp(.7+.3*w,.85,1.4)]}
function stepSnd(a,k,rate,dl){const c=a.c,v=k*(CFG.stepVol==null?1:CFG.stepVol);
  if(a.team===TZ){const z=zStepK(a);if(a.isPlayer)AU.play('zstep',{vol:.35*v,rate:z[0]*rate});else{AU.stepAt('zstep',c.x,c.y,c.z,{vol:1.8*z[1]*k,rate:z[0]*rate,range:45,dl});if(typeof SNDV!=='undefined')SNDV.ping(a,'step',45)}return}
  const nm=stepName(surfaceAt(c.x,c.y,c.z));if(a.isPlayer)AU.play(nm,{vol:.4*v,rate});else{AU.stepAt(nm,c.x,c.y,c.z,{vol:1.7*k,rate,dl});if(typeof SNDV!=='undefined')SNDV.ping(a,'step',40)}}
function footstep(a){if(a.team===TH&&a.cmd.walk||a.duck)return;stepSnd(a,1,1)}
// another's gear (v6.95): a reload's magazine out / in, a shell, a weapon drawn — heard where it is (25 m), shown by the sound direction
// display (sndviz.js) to whoever has it on
function othSnd(a,name,vol,range){AU.at(name,a.c.x,a.c.y+1.2,a.c.z,{vol,range});if(typeof SNDV!=='undefined')SNDV.ping(a,'rl',range)}
// soft player-vs-player collision (zombies can be body-blocked)
function separate(dt){const A=G.actors;for(let i=0;i<A.length;i++){const a=A[i];if(!a.alive)continue;for(let j=i+1;j<A.length;j++){const b=A[j];if(!b.alive)continue;
  const dx=b.c.x-a.c.x,dz=b.c.z-a.c.z;const r=a.c.hw+b.c.hw;if(Math.abs(dx)>r||Math.abs(dz)>r)continue;if(a.c.y+a.c.h<b.c.y+.1||b.c.y+b.c.h<a.c.y+.1)continue;
  const d=Math.hypot(dx,dz)||.01;if(d>=r)continue;const push=(r-d)*.5;const ux=dx/d,uz=dz/d;
  const wa=a.team===b.team?.5:(a.team===TZ?.35:.65);
  for(const [t,sg,w] of [[a,-1,wa],[b,1,1-wa]]){const nx=t.c.x+ux*push*2*w*sg,nz=t.c.z+uz*push*2*w*sg;if(charFits(t.c,nx,t.c.y,nz)){t.c.x=nx;t.c.z=nz}}}}}
// ---------- weapons in hand ----------
// fanning the hammer (Crimson Peacemaker, right button): the rest of the cylinder goes off at W.fanRpm, each shot weaker and much looser
function fanShot(W){return W.fanW||(W.fanW=Object.assign({},W,{dmg:W.dmg*W.fanDm,spread:W.spread.map(x=>x*2.4),kb:W.kb*.55}))}
// a gun with a second firing mode on the right button: W.gBurst = a burst mode (v6.59, the Glocks: {n rounds a pull, rpm inside the burst, cd
// after it, spr spread ×, dm damage ×, rk recoil ×}), or W.gMode = any other (v6.60, the SPAS-12's pump: {o what changes, n / n0 [ko, en] the
// two modes' names, s / s0 their short names for the touch button}); the mode is kept per gun (a.gbm); gbOn tells whether the gun in hand is
// in it, gbShot is the gun as it fires then, gbName / gbShort name a mode (on = the second one)
function gbShot(W){if(W.gbW)return W.gbW;const g=W.gBurst;
  return W.gbW=g?Object.assign({},W,{burst:g.n,rpm:g.rpm,burstCd:g.cd,semi:1,dmg:W.dmg*(g.dm||1),spread:W.spread.map(x=>x*(g.spr||1)),rec:W.rec.map(x=>x*(g.rk||1))}):Object.assign({},W,W.gMode.o)}
const gbOn=(a,W)=>!!(W&&(W.gBurst||W.gMode)&&a.gbm&&a.gbm[a.cur]);
function gbName(W,on,L){const M=W.gMode;if(on)return M?M.n[L?1:0]:L?`${W.gBurst.n}-round burst`:`${W.gBurst.n}점사`;return M&&M.n0?M.n0[L?1:0]:W.semi?(L?'Semi-auto':'반자동'):(L?'Full auto':'연사')}
function gbShort(W,on,L){const M=W.gMode;if(on)return M?M.s[L?1:0]:L?'BURST':'점사';return M&&M.s0?M.s0[L?1:0]:W.semi?(L?'SEMI':'반자동'):(L?'AUTO':'연사')}
function actorWeapons(a,dt){const cmd=a.cmd,pc=a.pc;
  if(cmd.drop&&!pc.drop&&a.team===TH)playerDrop(a);// G: throw the gun in hand (drops.js)
  if(a.holdT>0&&a.team===TZ&&!a.host){cmd.fire=cmd.alt=cmd.skill=false}// pinned by the Grinder: no claws, no skill
  a.punchP*=Math.exp(-dt*7);a.punchY*=Math.exp(-dt*7);a.recoilSpread*=Math.exp(-dt*4.5);a.kick=Math.max(0,a.kick-dt*6);
  if(!cmd.fire)a.shots=Math.max(0,a.shots-dt*12);
  if(a.drawT>0)a.drawT-=dt;const W0=WPN[a.cur];
  if(a.boltT>0){a.boltT-=dt;if(a.boltT<=0&&a.zoomWas&&a.isPlayer&&cmd.alt===false&&W0&&W0.bolt)a.zoom=a.zoomWas}if(a.pumpT>0)a.pumpT-=dt;
  // rotary barrels spin up while either button is held, and wind down slowly
  if(W0&&W0.spin){const want=(cmd.fire||cmd.alt)&&a.drawT<=0&&a.reloadT<=0&&a.frozen<=0;a.spinV=clamp((a.spinV||0)+(want?dt/W0.spin:-dt/(W0.spin*1.8)),0,1)}else a.spinV=0;
  if(a.frozen>0)return;
  const pend=meleePendTick(a,dt);
  if(cmd.slot){slotPick(a,cmd.slot);cmd.slot=0}
  if(cmd.lastInv){equip(a,hasWeapon(a,a.prev)?a.prev:(a.team===TZ?'claw':bestWeapon(a)));cmd.lastInv=false}
  const W=WPN[a.cur];if(!W)return;
  if(a.team===TZ){zombieAttack(a,dt);return}
  if(a.grabT>0&&!(a.lyPin>0&&W.kind==='melee')){cmd.fire=cmd.alt=cmd.reload=false}// pinned by a straitjacket zombie: no shooting until a teammate frees you (pinned by 4챕터's LYREBIRD: a knife still works)
  // grenades
  if(W.kind==='nade'){if(a.throwT>0){a.throwT-=dt;if(a.throwT<=0){const k=a.cur;throwNade(a,k);a.inv[k]=Math.max(0,a.inv[k]-1);const nx=k==='smoke'&&!a.isPlayer?null:H_NADES.find(q=>a.inv[q]>0);equip(a,nx||bestWeapon(a))}return}// (a bot puts its gun back up after a smoke)
    // the player's grenade: press pulls the pin and holds it back; it flies when the button is let go (v6.26). Bots throw at once
    if(a.nHold){a.nT+=dt;if(!cmd.fire&&a.nT>=.2){a.nHold=0;a.throwT=.08;a.an.atk=1;a.an.atkD=.55;a.an.heavy=false;VM.hold=false}return}
    if(cmd.fire&&(!pc.fire||!a.isPlayer)&&a.drawT<=0){if(a.isPlayer){a.nHold=1;a.nT=0;VM.throwNade();VM.hold=true;AU.play('pin',{vol:.5})}else{a.throwT=.28;a.an.atk=1;a.an.atkD=.55;a.an.heavy=false}}return}
  // melee: the swing starts now, the blade lands a moment later (heavier weapons wind up longer)
  if(W.kind==='melee'){if(pend)return;
    // stance weapons (the hammer): right click switches between the overhead pound (A) and the braced knock-away stance (B); left click attacks in the current stance
    if(W.stance&&a.isPlayer){if(cmd.alt&&!pc.alt&&a.drawT<=0&&G.t>=a.nextFire-.25){a.hamB=!a.hamB;AU.play('kdraw',{vol:.45,rate:a.hamB?.6:.75});VM.stance&&VM.stance(a.hamB)}
      if(G.t>=a.nextFire&&a.drawT<=0&&cmd.fire){const heavy=!!a.hamB;meleeSwing(a,heavy);a.nextFire=G.t+W.rate[heavy?1:0];a.an.atk=1;a.an.heavy=heavy;a.an.atkD=meleeAtkD(W,heavy);
        const d=W.hitT[heavy?1:0];if(d>.05)meleePend(a,d,heavy);else meleeStrike(a,heavy)}return}
    if(G.t>=a.nextFire&&a.drawT<=0&&(cmd.fire||cmd.alt)){const heavy=!!cmd.alt;if(!heavy)a.an.atkSide=-(a.an.atkSide||1);meleeSwing(a,heavy);a.nextFire=G.t+W.rate[heavy?1:0];a.an.atk=1;a.an.heavy=heavy;a.an.atkD=meleeAtkD(W,heavy);
      const d=W.hitT?W.hitT[heavy?1:0]:0;if(d>0)meleePend(a,d,heavy);else meleeStrike(a,heavy)}return}
  const am=a.ammo[a.cur];if(!am)return;
  if(W.alt&&W.kind!=='saw'&&cmd.alt&&!pc.alt&&a.drawT<=0&&(a.reloadT<=0||W.alt==='detonate'))nyAlt(a,W);
  // zoom levels cycle with the right button
  // Dual Berettas: the aim key flips the stance (looks only)
  if((W.gBurst||W.gMode)&&cmd.alt&&!pc.alt&&a.drawT<=0){const m=a.gbm||(a.gbm={});m[a.cur]=!m[a.cur];a.burstN=0;if(a.isPlayer){AU.play('slide',{vol:.28,rate:1.7});HUD.note(gbName(W,m[a.cur],LI()),1.2)}}
  if(W.dual&&!W.gBurst&&!W.gMode&&cmd.alt&&!pc.alt&&a.drawT<=0){a.dualB=!a.dualB;if(a.isPlayer)AU.play('slide',{vol:.3,rate:1.35})}
  if(W.zoom&&cmd.alt&&!pc.alt&&a.drawT<=0&&a.reloadT<=0){a.zoom=(a.zoom+1)%(W.zoom.length+1);a.zoomWas=0;if(a.isPlayer)AU.play('ui',{vol:.3,rate:.7})}
  // Blaze-8: right click fires a special shell from its own slot (cuts a shell reload short).
  if(W.spEvery&&a.drawT<=0&&a.boltT<=0&&G.t>=a.nextFire&&(a.isPlayer?cmd.alt&&!pc.alt:(a.spAm&&a.spAm[a.cur]>0&&cmd.fire&&Math.random()<.04))&&a.spAm&&a.spAm[a.cur]>0){
    if(a.reloadT>0&&a.relKind==='shell'){a.reloadT=0;a.relKind=null;if(a.isPlayer)VM.stopReload()}if(a.reloadT<=0){spFire(a,W);return}}
  // reloading
  if(a.reloadT>0){a.reloadT-=dt;
    if(W.shellRel){if(cmd.fire&&!pc.fire&&am.mag>0&&a.relKind==='shell'){a.reloadT=0;a.relKind=null;if(a.isPlayer)VM.stopReload();if(W.relFire){a.drawT=0;a.nextFire=Math.min(a.nextFire,G.t)}}
      else if(a.reloadT<=0){// one shell in; the view model's clip plays the push and its click, and racks the gun after the last one if it was loaded from empty
        if(am.mag<W.mag&&am.res>0){am.mag++;am.res--;if(a.isPlayer)VM.shellIn(!(am.mag<W.mag&&am.res>0),W.shellRel);else othSnd(a,'shellin',.45,22)}
        if(am.mag<W.mag&&am.res>0){a.reloadT=W.shellRel;a.relKind='shell'}else a.relKind=null}}
    else if(a.reloadT<=0){const cap=W.mag+(W.ch&&a.relCh?(W.dual?2:1):0),need=cap-am.mag,take=Math.min(Math.max(0,need),am.res);am.mag+=take;am.res-=take;a.relKind=null;if(!a.isPlayer&&take>0)othSnd(a,'magin',.5,25)}
    if(!(W.relFire&&a.reloadT<=0&&a.relKind===null&&cmd.fire&&!pc.fire))return}
  const wantReload=(cmd.reload&&!pc.reload)||(am.mag===0&&(cmd.fire||!a.isPlayer));
  if(wantReload&&am.mag<W.mag&&am.res>0&&a.drawT<=0&&a.boltT<=0){a.zoom=0;a.burstN=0;
    // the player's reload sounds come from the view model's clip (vmrel.js), in step with the hands
    if(W.shellRel){a.reloadT=W.relStart;a.relKind='shell';if(a.isPlayer)VM.reload(W,W.relStart,'start',am.mag===0)}
    else{a.reloadT=W.reload;a.relKind='mag';a.relCh=am.mag>0;if(a.isPlayer)VM.reload(W,W.reload,'mag',am.mag===0);
      else othSnd(a,'magout',.55,25)}return}
  if(W.kind==='saw'){sawUpdate(a,W,dt);return}
  const ready=a.drawT<=0&&a.boltT<=0&&G.t>=a.nextFire;const BW=gbOn(a,W)?gbShot(W):W;
  // a burst keeps going after the trigger is released
  if(a.burstN>0){if(ready){if(am.mag<=0){a.burstN=0;a.fanB=0}else{const fb=a.fanB&&W.fanRpm;fireGun(a,fb?fanShot(W):BW);a.burstN--;a.nextFire=G.t+(a.burstN>0?60/(fb?W.fanRpm:BW.rpm):BW.burstCd);if(a.burstN<=0)a.fanB=0}}return}
  // Dual Berettas in the sideways stance fire full-auto while held (a pair with bRpm, the Dual MP7A1, fires faster in it)
  if(cmd.fire&&ready&&(!((BW.semi&&!(W.dual&&a.dualB))||BW.burst)||!pc.fire||!a.isPlayer)){
    if(am.mag<=0){if(!pc.fire&&a.isPlayer)AU.play('dry',{vol:.6});a.nextFire=G.t+.25;return}
    if(W.spin&&a.spinV<1)return;
    fireGun(a,BW);a.an.atk=0;
    if(BW.burst){a.burstN=BW.burst-1;a.nextFire=G.t+(a.burstN>0?60/BW.rpm:BW.burstCd)}
    else{let rpm=BW.rpm*(W.bRpm&&a.dualB?W.bRpm:1);// (BW: a second mode may change the rate, the SPAS-12's pump)
      // (v6.60) the AN-94's hyperburst: the first W.hyper rounds of every pull go off at W.hyperRpm (a fresh pull: the trigger let go, or a pause)
      if(W.hyper){const fresh=!pc.fire||G.t-(a.hypT||-9)>.25;a.hypN=fresh?1:(a.hypN|0)+1;a.hypT=G.t;if(a.hypN<W.hyper)rpm=W.hyperRpm}
      a.nextFire=G.t+60/rpm}}}
// zombies: claws, spore bomb and class skill
function zombieAttack(a,dt){const cmd=a.cmd,pc=a.pc,Z=ZCLASS[a.zc];
  if(a.cur==='zbomb'){zbombUpdate(a,dt);return}
  if(cmd.skill&&!pc.skill)useSkill(a);
  if(a.pendingClaw){a.pendingClaw.t-=dt;if(a.pendingClaw.t<=0){clawStrike(a,a.pendingClaw.heavy);a.pendingClaw=null}}
  if(a.drawT>0||G.t<a.nextFire||a.pendingClaw)return;
  if(G.t<(a.clawLock||0)){if(a.isPlayer&&(cmd.fire||cmd.alt)&&!pc.fire&&!pc.alt)HUD.note(LI()?'Still turning — claws in a moment':'아직 변이 중 — 잠시 후 공격 가능',1);return}
  if(cmd.fire||cmd.alt){const heavy=!cmd.fire&&cmd.alt;a.nextFire=G.t+(heavy?1.1:.62);a.an.atk=1;a.an.atkD=heavy?.78:.48;a.an.heavy=heavy;a.an.atkSide=-a.an.atkSide;
    if(a.isPlayer){VM.claw(heavy,a.an.atkSide);if(a.zc==='strait')AU.play('zatk',{vol:.5,rate:1.15});else AU.play('claw',{vol:.6})}else AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:.7,range:30});
    a.pendingClaw={t:heavy?.4:.19,heavy};NET.on&&netFxPush(['c',a.id,heavy?1:0,a.an.atkSide])}}
// zombie grenade: press → a hand reaches into the bomb's mouth and yanks the bone pin out (BOMB_PULL s); keep holding to carry it armed,
// release to throw. Left click = hard throw, right click = underhand lob (drop it at your feet for a bomb jump).
const BOMB_PULL=.62;
function zbombUpdate(a,dt){const cmd=a.cmd,pc=a.pc;
  if(a.throwT>0){a.throwT-=dt;if(a.throwT<=0){throwNade(a,'zbomb');a.bombs--;a.bSoft=false;if(a.bombs>0&&a.isPlayer){a.bSt=0;equip(a,'zbomb',true);VM.draw(.35)}else equip(a,'claw')}return}
  const want=cmd.fire||cmd.alt;
  if(a.bSt===1){a.bT-=dt;if(a.bT<=0){a.bSt=2;if(a.isPlayer)AU.play('pin',{vol:.6,rate:.7})}return}
  if(a.bSt===2){if(!a.isPlayer||!want){a.bSt=3;a.throwT=a.bSoft?.16:.26;a.an.atk=1;a.an.atkD=.55;a.an.heavy=false;a.an.atkSide=1;if(a.isPlayer)VM.throwNade(a.bSoft)}return}
  if(a.bSt===3)return;
  if(want&&(!(pc.fire||pc.alt)||!a.isPlayer)&&a.drawT<=0&&a.bombs>0){a.bSt=1;a.bT=BOMB_PULL;a.bSoft=!cmd.fire&&!!cmd.alt;
    if(a.isPlayer){VM.bombPull(BOMB_PULL);AU.play('zatk',{vol:.35,rate:1.5})}else AU.at('zatk',a.c.x,a.c.y+1.5,a.c.z,{vol:.4,range:20,rate:1.5})}}
const CLAW_LOCK=2;// seconds a newly infected zombie (not a host) waits before its first claw
const CLAW_R=[1.75,2.0];// claw reach (light, heavy): eye to the target's body; the bots swing from 1.35 m + the target's half width (ai.js)
function clawStrike(a,heavy){const r=meleeHit(a,heavy?CLAW_R[1]:CLAW_R[0],heavy?.6:.5);
  if(r&&r.t){if(!NET.ghost){if(NET.cli)netToHost({t:'claw',i:r.t.id,h:heavy?1:0});else clawApply(a,r.t,heavy)}
    if(a.isPlayer)HUD.hitmark(false)}
  else if(r&&r.wall){FX.impact(r.x,r.y,r.z,r.n[0],r.n[1],r.n[2],r.wall.box.mat);if(a.isPlayer)AU.play('kwall',{vol:.4,rate:.7})}}
// one claw hit is enough: armour does not stop the infection, and the last human standing turns as well (the zombies win)
function clawApply(a,t,heavy){aimDir(a.yaw,0,_dv);t.kvx+=_dv.x*(heavy?4:2);t.kvz+=_dv.z*(heavy?4:2);infect(t,a)}
function useSkill(a){if(NET.cli&&!NET.ev){if(a===G.player&&a.skillCD<=0&&(G.st==='fight'||G.st==='prep'))netToHost({t:'sk'});return}
  if(a.skillCD>0||G.st!=='fight'&&G.st!=='prep')return;const Z=ZCLASS[a.zc];const c=a.c;
  if(Z.skill==='invis'||Z.skill==='trap'||Z.skill==='heal'||Z.skill==='coffin'||Z.skill==='charge'||Z.skill==='pounce'){if(nySkill(a,Z)){a.skillCD=Z.cd;if(NET.host)netEv('sk',{i:a.id,k:Z.skill})}return}
  if(Z.skill==='frenzy'){if(a.hp<a.maxHp*.15)return;a.hp-=a.maxHp*.08;a.skillT=Z.dur;AU.at('zroar',c.x,c.y+1.5,c.z,{vol:1,range:50})}
  else if(Z.skill==='leap'){if(!c.onGround)return;aimDir(a.yaw,0,_dv);a.kvx+=_dv.x*11;a.kvz+=_dv.z*11;c.vy=6.5;c.onGround=false;c.jumped=true;a.skillT=.8;AU.at('zleap',c.x,c.y+1.5,c.z,{vol:1})}
  else if(Z.skill==='harden'){a.skillT=Z.dur;AU.at('zharden',c.x,c.y+1.5,c.z,{vol:1,range:40})}
  else if(Z.skill==='shriek'){a.skillT=Z.dur;a.an.skill=1.2;AU.at('zscream',c.x,c.y+1.6,c.z,{vol:1,range:70,occ:false});FX.spawn({x:c.x,y:c.y+1.5,z:c.z,life:.5,s0:1,s1:14,r:.6,g:1,b:.4,a:.6,f:14,add:1});
    for(const t of G.actors){if(!t.alive)continue;const d=dist3(t.c,c);if(d>10)continue;
      if(t.team===TH){if(!losClear(c.x,c.y+1.5,c.z,t.c.x,t.c.y+1.5,t.c.z))continue;t.shriekT=3.5;t.dizzy=Math.max(t.dizzy,2.5);if(t.isPlayer){FX.shake=Math.max(FX.shake,.5);HUD.daze()}}
      else{t.hp=Math.min(t.maxHp,t.hp+t.maxHp*.18);if(t.isPlayer&&t!==a)HUD.note(T('healed'))}}}
  if(Z.skill==='frenzy'||Z.skill==='harden'||Z.skill==='leap')a.an.skill=Z.skill==='leap'?0:.8;
  a.skillCD=Z.cd;if(NET.host)netEv('sk',{i:a.id,k:Z.skill})}
// ---------- damage & infection ----------
function humansAlive(){let n=0;for(const a of G.actors)if(a.alive&&a.team===TH)n++;return n}
function zombiesAlive(){let n=0;for(const a of G.actors)if(a.team===TZ&&(a.alive||!a.permaDead))n++;return n}
// gunfire cannot pile the shove up without end: past a cap (ZBAL.kbCap — a bit more for each extra gun on the zombie in the last 0.6 s, so a few
// humans together still hold one back) the push stops growing; a single big hit (sniper, launcher) still lands in full
function kbCap(t,src,kb){const sh=t.kbSh||(t.kbSh={});sh[src?src.id:-1]=G.t;let n=0;for(const k in sh)if(G.t-sh[k]<.6)n++;
  const cp=Math.max(kb,ZBAL.kbCap[t.host?1:0]*(1+.35*(n-1))),v=Math.hypot(t.kvx,t.kvz);if(v>cp){t.kvx*=cp/v;t.kvz*=cp/v}}
// the zombie's pain cry, 0.35 s apart per zombie; a hit by this page's own player is louder and carries further (v6.86: you hear what you hit)
function zPain(t,own){if(!AU.throttle('zp'+t.id,350))AU.at('zpain',t.c.x,t.c.y+1.5,t.c.z,own?{vol:.95,range:80}:{vol:.7})}
function damageActor(t,dmg,src,o){if(NET.ghost)return 0;if(NET.cli)return G.st==='end'||G.st==='over'?0:netClaimHit(t,dmg,src,o);if(!t.alive||G.st==='end'||G.st==='over')return;
  if(t.team===TH){return G.pvp?PVP.hurt(t,dmg,src,o):undefined}// (대인전: one human shooting another, pvp.js)
  if(t.reviving>0)return;
  if(src&&src.team===TH&&!o.flat)dmg*=1+.1*G.moraleLvl;if(src&&src.wup&&o.w&&src.wup[o.w])dmg*=1+.1*src.wup[o.w];// flat: the Plasma Gun's orbs (specguns.js) ignore morale
  if(t.skillT>0&&t.zc==='brute')dmg*=.4;if(t.skillT>0&&t.zc==='rager')dmg*=1.3;// berserk: faster, but it takes 30 % more
  const hp0=t.hp,ar0=t.armor;
  if(t.armor>0){const ab=Math.min(t.armor,dmg*.5);t.armor-=ab;dmg-=ab}
  t.hp-=dmg;t.lastHurt=G.t;
  const dealt=(ar0-t.armor)+(hp0-Math.max(0,t.hp));// what actually came off (armour + health), overkill excluded
  let kb=(o.kb||0)*ZCLASS[t.zc].kb*(t.host?.75:1)*(t.lvl>=3?.8:t.lvl>=2?.9:1);if(t.skillT>0&&(t.zc==='brute'))kb=0;if(t.frozen>0)kb*=.2;if(zComeback())kb*=ZBAL.cbKb;
  if(!t.c.onGround)kb*=1.5;t.kvx+=o.dir[0]*kb;t.kvz+=o.dir[2]*kb;{const W=WPN[o.w];if(W&&W.air){const v=Math.hypot(t.kvx,t.kvz),cp=W.air.cap;if(v>cp){t.kvx*=cp/v;t.kvz*=cp/v}}else if(W&&W.mag&&!o.knife&&!o.he&&!o.nocap)kbCap(t,src,kb)}// the air gun shoves hard but never launches anyone across the map
  if(o.up){t.c.vy=Math.max(t.c.vy,o.up);t.c.onGround=false;t.c.jumped=true}
  if(t.skillT<=0||t.zc!=='brute')t.staggerT=Math.max(t.staggerT,((o.stag||.2)+Math.min(.1,dealt/500))*STAG_K);
  {const W=WPN[o.w];if(W&&W.kind==='saw'&&!(t.skillT>0&&t.zc==='brute')){t.holdT=Math.max(t.holdT||0,(o.kb||0)>0?.7:.32);t.mvx*=.3;t.mvz*=.3}}// the Grinder pins whoever it bites (a swing pins longer); a hardened Trapper shrugs it off
  t.an.flinch=Math.min(1,t.an.flinch+.35);if(o.dir)t.an.flx=clamp((t.an.flx||0)+(o.dir[0]*Math.cos(t.yaw)-o.dir[2]*Math.sin(t.yaw))*.6,-1,1);if(t.ch)t.ch.mat.uniforms.uFlash.value=Math.min(.35,t.ch.mat.uniforms.uFlash.value+.12);
  if(src){src.dmgDealt+=dealt;src.dmgRound=(src.dmgRound||0)+dealt;src.score+=dealt/100;scEarn(src,Math.round(dealt/8));if(src.isPlayer)HUD.dmgNum(t,dealt,!!o.hs,t.hp<=0)}
  if(t.isPlayer){HUD.hurt(clamp(dmg/600,.15,.8));FX.shake=Math.max(FX.shake,.15)}
  zPain(t,!!(src&&src.isPlayer));
  if(t.bot)AI.onHurt(t,src);
  if(t.hp<=0)killZombie(t,src,o);return dealt}
function hurtHuman(t,dmg,src,o){if(NET.ghost)return;if(NET.cli&&!NET.ev){if(t===G.player&&o.fall)netToHost({t:'fall',d:Math.round(dmg)});return}if(!t.alive||t.team!==TH)return;const hp0=t.hp,ar0=t.armor;if(t.armor>0&&!o.fall){const ab=Math.min(t.armor,dmg*.5);t.armor-=ab;dmg-=ab}
  t.hp-=dmg;t.lastHurt=G.t;
  if(src){const dealt=(ar0-t.armor)+(hp0-Math.max(0,t.hp));src.dmgDealt+=dealt;src.dmgRound=(src.dmgRound||0)+dealt;if(src.isPlayer)HUD.dmgNum(t,dealt,false,t.hp<=0)}if(t.isPlayer){HUD.hurt(clamp(dmg/40,.25,1));FX.shake=Math.max(FX.shake,.3)}AU.at('hurt',t.c.x,t.c.y+1.5,t.c.z,{vol:.8});if(o.claw)AU.at('clawhit',t.c.x,t.c.y+1.2,t.c.z,{vol:.9});
  FX.blood(t.c.x,t.c.y+1.2,t.c.z,rr(-1,1),0,rr(-1,1),1,false);
  if(t.hp<=0){ldSnap(t);dropDeath(t);t.hp=0;t.alive=false;t.permaDead=true;t.deadT=0;t.deaths++;t.an.dead=Math.max(t.an.dead,.001);t.deadDir=Math.random()<.5?1:-1;AU.at('hdie',t.c.x,t.c.y+1.4,t.c.z,{vol:1});
    if(src){src.kills++;src.score+=3}HUD.feed(src,src?'claw':'fall',t,{});if(t.isPlayer)onPlayerDeath(src);if(NET.host)netEv('hdie',{i:t.id,s:src?src.id:-1})}}
function killZombie(t,src,o){if(NET.cli&&!NET.ev)return;t.alive=false;t.hp=0;t.deadT=0;t.deaths++;t.frozen=0;t.skillT=0;t.reviving=0;t.an.dead=Math.max(t.an.dead,.001);// keeps the body drawn while it falls
  aimDir(t.yaw,0,_dv);t.deadDir=(o.dir&&(o.dir[0]*_dv.x+o.dir[2]*_dv.z)>0)?-1:1;
  // Classic Infection: every dead zombie stays down this round. Evolved Infection: knife kills, and headshot/HE kills on non-hosts, stay down; the rest rise after 8 s
  // the Jungle Machete's (killknife) last blow keeps any zombie down in every mode (hosts too)
  const perma=G.mode==='orig'||o.w==='killknife'&&G.mode!=='scen'||G.mode==='mut'&&(o.knife||o.hs);
  if(perma)t.permaDead=true;else if(G.mode==='mut')t.reviveT=8;else t.respawnT=5
  if(src){src.kills++;if(o.hs)src.hsKills=(src.hsKills|0)+1;src.score+=perma?3:2;scEarn(src,o.hs?500:300)}// hsKills: the daily missions' headshot kills
  HUD.feed(src,o.w,t,{hs:o.hs,perma});nyOnKill(t,src);
  AU.at('zdie',t.c.x,t.c.y+1.4,t.c.z,{vol:1,range:55});
  // gore (원본 only, GORE.lv 2): headshot kills burst the head, explosions tear the body; every body leaves a pool
  if(GORE.lv>=2){if(o.hs&&!o.knife&&o.dir){FX.gib(t.head.x,t.head.y,t.head.z,o.dir[0],o.dir[1],o.dir[2],false);AU.at('gib',t.head.x,t.head.y,t.head.z,{vol:1,range:40})}
    else if((o.he||o.w==='gl40')&&o.dir){FX.gib(t.c.x,t.c.y+1,t.c.z,o.dir[0],.4,o.dir[2],true);AU.at('gib',t.c.x,t.c.y+1,t.c.z,{vol:1,range:45})}}
  dismember(t,o,perma);
  t.poolT=GORE.lv>=2?.75:0;t.poolN=0;
  if(src&&src.isPlayer){HUD.killConfirm(o.hs);if(o.hs)AU.play('hsding',{vol:.5})}
  if(G.mode==='mut'&&src&&src.team===TH&&!NET.cli){G.moralePts+=perma?2:1;const nl=Math.min(ZBAL.moraleMax,Math.floor(G.moralePts/3));if(nl>G.moraleLvl){G.moraleLvl=nl;HUD.announce(T('moraleUp',nl*10),'h',2.2);if(G.player&&G.player.team===TH)AU.play('morale',{vol:.55})}}
  if(t.isPlayer)onPlayerDeath(src,o);
  if(NET.host)netEv('kill',{i:t.id,s:src?src.id:-1,w:o.w||'',hs:o.hs?1:0,d:o.dir?[r2(o.dir[0]),r2(o.dir[1]),r2(o.dir[2])]:0,k:o.knife?1:0,h:o.heavy?1:0,he:o.he?1:0})}
// dismemberment: only on bodies that stay down (perma kills, or the classic mode where the dead respawn elsewhere).
// Headshots take the head off (heavy guns may burst it instead), explosions tear off one or two limbs, heavy blades lop off a head or an arm,
// a close shotgun blast can take an arm.
function dismember(t,o,perma){if(GORE.lv<2||!t.ch||!o.dir||!(G.mode!=='mut'||perma||o.he))return;const W=WPN[o.w]||{},big=W.kind==='sniper'||W.kind==='shotgun'||(W.dmg||0)>=60;
  const cut=(k,d,sp)=>{if(SEVER[k]&&!(t.ch.hide>>SEVER[k].root&1)){FX.limb(t,k,d,sp);severLimb(t.ch,k);(t.spurts=t.spurts||[]).push({b:SEVER[k].stump,t:2.6,ph:Math.random()*6})}};
  if(o.hs&&!o.knife){if(big&&Math.random()<.55){severLimb(t.ch,'head');(t.spurts=t.spurts||[]).push({b:14,t:2.6,ph:0})}else cut('head',o.dir,rr(3,5.5))}
  else if(o.he||o.w==='gl40'){const ks=shuffle(['armL','armR','legL','legR','head','armL','armR']);const n=Math.random()<.45?2:1;for(let i=0,c=0;i<ks.length&&c<n;i++)if(!(t.ch.hide>>SEVER[ks[i]].root&1)){cut(ks[i],[o.dir[0],.7,o.dir[2]],rr(4.5,7.5));c++}}
  else if(o.knife&&!o.blunt&&(o.heavy?o.w==='axe'||o.w==='skull9'||o.w==='katana'||Math.random()<.4:(o.w==='skull9'||o.w==='katana')&&Math.random()<.5))cut(o.hs||Math.random()<.35?'head':Math.random()<.5?'armL':'armR',[o.dir[0],.2,o.dir[2]],rr(2.5,4));
  else if(W.kind==='shotgun'&&Math.random()<.3&&G.player&&Math.hypot(t.c.x-G.player.c.x,t.c.z-G.player.c.z)<6)cut(Math.random()<.5?'armL':'armR',o.dir,rr(3,5))}
const SPURT_D=[[0,1,-.2],[-1,.35,0],[1,.35,0],[-.2,-1,0],[.2,-1,0]],_sv=new THREE.Vector3(),_sd=new THREE.Vector3();
function infect(t,src){if(NET.ghost||(NET.cli&&!NET.ev))return;if(t.team!==TH||!t.alive)return;if(G.st!=='fight'&&!NET.ev)return;// not on the result card between rounds
  HUD.feed(src,'claw',t,{infect:1});
  if(src){src.infects++;src.infR++;src.score+=2;src.hp=Math.min(src.maxHp,src.hp+src.maxHp*.1);
    if(G.mode==='mut'){const nl=src.infR>=5?3:src.infR>=2?2:1;if(nl>src.lvl){src.lvl=nl;const mh=Math.round(zBaseHp(src)*(nl===3?1.5:1.25));src.maxHp=Math.max(src.maxHp,mh);src.hp=src.maxHp;src.armor+=100;
        if(src.isPlayer){HUD.announce(T('lvlUp',nl),'z',2);AU.play('lvlup',{vol:.6})}AU.at('zroar',src.c.x,src.c.y+1.5,src.c.z,{vol:.8})}}}
  AU.at('clawhit',t.c.x,t.c.y+1.2,t.c.z,{vol:1});AU.at('hscream',t.c.x,t.c.y+1.5,t.c.z,{vol:1,range:60});
  FX.blood(t.c.x,t.c.y+1.4,t.c.z,0,0,0,2,false);
  t.deaths++;becomeZombie(t,false);infectFx(t);if(NET.host)netEv('infect',{i:t.id,s:src?src.id:-1,z:t.zc});
  if(!NET.cli){AI.onInfect(t);if(G.mode==='mut'&&G.moraleLvl>0){G.moraleLvl=Math.max(0,G.moraleLvl-ZBAL.moraleDrop);G.moralePts=G.moraleLvl*3}}// bots next to it scatter; an infection costs the humans morale
  if(t.isPlayer){HUD.infected(src);R.PU.uInfect.value=1;FX.shake=Math.max(FX.shake,.8);AU.play('heart',{vol:.9});AU.play('heart',{vol:.7,delay:.75})}
  const n=humansAlive();if(n===1&&G.st==='fight'){const last=G.actors.find(a=>a.alive&&a.team===TH);G.lastHuman=last;HUD.announce(T('lastHuman',last.name),'h',3);AU.play('stingL',{vol:.6})}}
// someone turns: a burst of blood mist and rising green spores, a red ring on the ground and a red glow; the new zombie roars as it straightens up
function infectFx(t,big){const c=t.c,x=c.x,y=c.y,z=c.z,s=big?1.4:1,mc=GORE.lv>=2?[.32,.02,.02,.6]:GORE.lv>=1?[.2,.08,.08,.45]:[.16,.15,.15,.45];// the mist: blood red · 15세 dark rust · 피 끄기 grey
  for(let i=0;i<14*s;i++){const an=rr(0,TAU),sp=rr(1,3)*s;FX.spawn({x,y:y+rr(.9,1.6),z,vx:Math.cos(an)*sp,vy:rr(.2,1.4),vz:Math.sin(an)*sp,life:rr(.6,1.1),s0:rr(.2,.35),s1:rr(.8,1.5)*s,r:mc[0],g:mc[1],b:mc[2],a:mc[3],f:2,drag:2.2,lit:1})}
  for(let i=0;i<16*s;i++){const an=rr(0,TAU),sp=rr(.3,1.2);FX.spawn({x:x+Math.cos(an)*rr(0,.5),y:y+rr(.3,1.8),z:z+Math.sin(an)*rr(0,.5),vx:Math.cos(an)*sp,vy:rr(.4,1.6),vz:Math.sin(an)*sp,life:rr(.9,1.8),s0:rr(.05,.1),s1:rr(.12,.22),r:.45,g:1,b:.3,a:.85,f:13,drag:1.2,grav:-.3,add:1})}
  FX.spawn({x,y:y+.08,z,life:.7,s0:.4,s1:3.2*s,r:.9,g:.08,b:.05,a:.7,f:14,add:1});
  DL.add(x,y+1.2,z,'#ff2a18',7*s,2.2,.8);
  nyLater(t.turning?Math.max(.4,t.turning-.3):1,()=>{if(t.alive&&t.team===TZ)AU.at('zroar',t.c.x,t.c.y+1.6,t.c.z,{vol:.9,range:55})})}
function zBaseHp(a){return ZCLASS[a.zc].hp}
function becomeZombie(a,host){if(a.team===TH){ldSnap(a);dropDeath(a)}const nh=G.actors.filter(x=>x.team===TH&&x!==a).length;
  a.team=TZ;a.host=host;a.zc=a.zpick||'rager';const Z=ZCLASS[a.zc];a.lvl=host?2:1;a.infR=0;
  const om=G.mode==='orig';a.maxHp=host?Math.round(Z.hp*1.05+160*Math.max(1,nh)/Math.max(1,G.hostN)):Math.round(Z.hp*(om?ZBAL.origHp:1));if(a.bot)a.maxHp=Math.round(a.maxHp*DIFF_Z.hp[G.diff||0]);a.hp=a.maxHp;a.armor=host?300:Math.round(Z.armor*(om?ZBAL.origArmor:1));
  a.inv={1:null,2:null,3:null,he:0,frost:0,flare:0,smoke:0};a.ammo={};a.bombs=G.mode==='scen'?0:1;a.skillCD=host?3:4;// every zombie of the infection modes carries a spore bomb
  a.skillT=0;a.frozen=0;a.zoom=0;a.reloadT=0;a.relKind=null;a.flash=false;a.shriekT=0;a.dizzy=0;
  a.cur=null;setHull(a);ensureRig(a);equip(a,'claw',true);a.an.skill=1;a.permaDead=false;a.alive=true;a.turning=host?2:1.4;
  a.clawLock=host?0:G.t+CLAW_LOCK;// a freshly infected zombie can't claw at once: no chain infections through a crowd
  if(a.isPlayer){a.nv=false;VM.set('claw','z_'+a.zc);VM.draw(.9)}
  if(a.bot)AI.onTeam(a)}
function reviveZombie(a,at,rise){if(NET.cli&&!NET.ev)return;
  // a class picked in the menu takes effect on revival (hosts keep theirs)
  if(!a.host&&a.zpick&&a.zpick!==a.zc){a.zc=a.zpick;const Z=ZCLASS[a.zc];const mult=a.lvl>=3?1.5:a.lvl>=2?1.25:1;a.maxHp=Math.round(Z.hp*mult);setHull(a);ensureRig(a);if(a.isPlayer)VM.set('claw','z_'+a.zc)}
  a.alive=true;a.reviving=1.2;a.hp=Math.round(a.maxHp*.6);a.armor=0;a.frozen=0;a.staggerT=0;a.kvx=a.kvz=0;a.mvx=a.mvz=0;
  if(at){placeAt(a,at[0],at[1],at[2],Math.random()*TAU);if(!rise){a.reviving=0;a.hp=a.maxHp;a.armor=Math.round(ZCLASS[a.zc].armor*.5)}}else{a.c.vx=a.c.vz=0;setHull(a)}
  equip(a,'claw',true);if(G.mode!=='scen'&&a.bombs<1)a.bombs=1;// a fresh spore bomb with every life
  AU.at('zrevive',a.c.x,a.c.y+1,a.c.z,{vol:1});if(a.isPlayer){G.spec=null;VM.set('claw','z_'+a.zc);VM.draw(1);HUD.note(T('revived'))}if(a.bot)AI.onTeam(a);
  if(NET.host)netEv('rv',{i:a.id,at:at?[r2(a.c.x),r2(a.c.y),r2(a.c.z)]:0,rs:rise?1:0,z:a.zc})}
function onPlayerDeath(src,o){G.deathCam=3;G.killer=src||null;if(G.player)G.player.zoom=0;KC.death(src,o)}
// ---------- round flow ----------
function startMatch(cfg){G.cfg=cfg;G.mode=cfg.mode;G.rounds=cfg.rounds;G.roundTime=cfg.time;G.prepTime=20;G.diff=cfg.diff;G.round=0;G.score=[0,0];G.t=0;
  for(const a of G.actors){if(a.ch)R.scene.remove(a.ch.grp)}G.actors=[];ACTOR_ID=0;
  if(cfg.ro){G.player=null;for(const r of cfg.ro){const me=!!r[4]&&r[4]===NET.me;const a=mkActor(r[1],me,r[2]);a.id=r[0];a.zpick=me?(CFG.zclass||r[3]):r[3];a.net=r[4]||null;
      a.pup=NET.host?(!!r[4]&&!me):!me;if(r[5])a.scen=true;if(!a.pup&&!r[4])a.bot=AI.mk(a);if(me)G.player=a;G.actors.push(a)}ACTOR_ID=cfg.ro.length}
  else{const P=mkActor(cfg.name||T('you'),true,cfg.skin||'guard');P.zpick=cfg.zclass||'rager';G.player=P;G.actors.push(P);
    const names=shuffle(BOT_NAMES.slice()),nb=cfg.mode==='scen'?Math.min(7,cfg.bots|0):cfg.bots;for(let i=0;i<nb;i++){const b=mkActor(names[i%names.length],false,rpick(HSKINS));b.zpick=rpick(ZLIST);b.bot=AI.mk(b);G.actors.push(b)}
    if(cfg.mode==='scen')for(let i=0;i<=SCEN.POOL;i++){const z=mkActor('Z',false,'guard');z.scen=true;z.bot=AI.mk(z);G.actors.push(z)}}
  // weapons are free: money is only the scenario's upgrade budget (a little to start with)
  for(const a of G.actors){a.money=cfg.mode==='scen'&&!a.scen?1000:0;a.survived=false;a.ldo=null;a.ehBuy=0;a.bq=[];ldKitReset(a)}
  if(cfg.mode==='scen'){const pl=G.actors.filter(a=>a.scen);if(pl.length)pl[pl.length-1].boss=true;SCEN.initPool()}else SCEN.on=false;
  if(NET.cli){G.st='prep';G.time=G.prepTime;return}
  if(cfg.mode==='scen')SCEN.begin();else startRound()}
function startRound(plan){if(NET.cli&&!plan)return;AU.stopAll('countdown');dropsClear();G.round=plan?plan.n:G.round+1;G.st='prep';FX.clearLimbs();G.time=G.prepTime;G.moralePts=0;G.moraleLvl=0;G.lastHuman=null;G.spec=null;G.deathCam=0;G.winner=-1;G.beepAt=11;G.hostN=0;
  clearNades();NY.clear();for(const l of DL.list)if(l.flare)l.dead=true;
  // v6.26: every round everyone (bots too) starts somewhere else, drawn from the human spawns and the zombie spawn points together
  const rnd=!plan&&(G.mode==='mut'||G.mode==='orig')&&MAP.zspawns&&MAP.zspawns.length>0,sp=shuffle(rnd?MAP.spawns.concat(MAP.zspawns.filter(z=>!MAP.spawns.includes(z))):MAP.spawns.slice());let k=0;const pm={},out=[];if(plan)for(const q of plan.P)pm[q[0]]=q;
  for(const a of G.actors){const q=pm[a.id];const keep=plan?!!(q&&q[5]):a.survived&&a.team===TH;if(keep)ldSnap(a);a.nb=null;a.r0={k:a.kills,i:a.infects,dm:a.dmgDealt,sc:a.score||0,hs:a.hsKills|0};a.team=TH;a.host=false;a.alive=true;a.dmgRound=0;a.burstN=0;a.spinV=0;a.pendingMelee=null;a.permaDead=false;a.hp=100;a.maxHp=100;a.lvl=1;a.infR=0;a.reviveT=0;a.respawnT=0;a.reviving=0;a.frozen=0;a.staggerT=0;a.skillT=0;a.skillCD=0;a.shriekT=0;a.dizzy=0;a.bombs=0;a.rootT=0;a.burnT=0;a.sawRev=0;a.dragonG=0;
    a.an.dead=0;a.an.atk=0;a.pendingClaw=null;a.zoom=0;a.flash=false;a.nv=false;a.turning=0;a.holdT=0;a.bSt=0;a.throwT=0;a.nHold=0;a.cmb=null;
    // everyone gets the loadout he had (survivors: what they hold now; the rest: what was noted as they went down or turned)
    ldRestore(a);
    if(q)placeAt(a,q[1]/100,q[2]/100,q[3]/100,q[4]/1000);else{const p=sp[k++%sp.length];placeAt(a,p[0],p[2]||0,p[1],p[3]!=null?p[3]+rr(-.4,.4):rnd?rr(0,TAU):Math.PI+rr(-.6,.6))}ensureRig(a);equip(a,bestWeapon(a),true);a.drawT=0;
    if(NET.host)out.push([a.id,r2(a.c.x),r2(a.c.y),r2(a.c.z),r3(a.yaw),keep?1:0]);
    if(a.isPlayer){VM.set(a.cur,a.skin);R.PU.uInfect.value=0}if(a.bot)AI.onRound(a)}
  if(G.player&&MAP.spawnYaw!=null&&!plan&&!rnd){G.player.yaw=MAP.spawnYaw}
  BO.reset();SUP.reset();FX.clearDecals();HUD.roundStart();AU.play('siren',{vol:.5});AU.muSet&&AU.muSet('prep');if(NET.host)netEv('round',{n:G.round,P:out})}
function selectHosts(ids){if(NET.cli&&!NET.ev)return;let H=G.actors.filter(a=>a.alive&&a.team===TH);const n=ids?Math.max(1,ids.length):hostsFor(G.actors.length);G.hostN=n;const nh=Math.max(1,H.length-n);
  // prefer players who were not host recently, then ones standing apart (few humans within 6 m, not next to another new host)
  if(ids)H=ids.map(byId).filter(a=>a&&a.alive&&a.team===TH);else{shuffle(H);const L=[],sc=a=>{let k=(a.hostCount||0)*100;for(const b of G.actors)if(b!==a&&b.alive&&b.team===TH&&dist3(a.c,b.c)<6)k++;for(const p of L)if(dist3(a.c,p.c)<12)k+=4;return k};
    while(L.length<n&&H.length){let bi=0,bs=1e9;for(let j=0;j<H.length;j++){const v=sc(H[j]);if(v<bs){bs=v;bi=j}}L.push(H.splice(bi,1)[0])}H=L}const picked=[];
  for(let i=0;i<n&&i<H.length;i++){const a=H[i];picked.push(a);a.hostCount=(a.hostCount||0)+1;a.zc=a.zpick||'rager';becomeZombie(a,true);
    a.maxHp=Math.round((ZCLASS[a.zc].hp*1.05+(G.mode==='orig'?ZBAL.origHostHp:ZBAL.hostHp)*nh/n)*(a.bot?DIFF_Z.hp[G.diff||0]:1));a.hp=a.maxHp;if(!NET.cli)AI.onInfect(a);// bots next to a new host scatter too
    AU.at('zinfect',a.c.x,a.c.y+1.5,a.c.z,{vol:1,range:80,occ:false});FX.blood(a.c.x,a.c.y+1.4,a.c.z,0,0,0,2,false);infectFx(a,true);if(a.isPlayer){HUD.infected(null);R.PU.uInfect.value=1}}
  HUD.announce(T('hostAppear'),'z',3.5);AU.play('stingZ',{vol:.8});AU.muSet&&AU.muSet('fight');if(NET.host)netEv('hosts',{i:picked.map(a=>a.id),z:picked.map(a=>a.zc)})}
function endRound(win){if(NET.cli&&!NET.ev)return;if(G.st!=='fight'&&G.st!=='prep')return;G.st='end';G.endT=6;G.winner=win;G.score[win]++;BO.stop(true,true);
  for(const a of G.actors){a.pendingClaw=null;a.survived=a.team===TH&&a.alive;if(a.survived)ldSnap(a)}
  HUD.announce(win===TH?T('winH'):T('winZ'),win===TH?'h':'z',5);AU.play(win===TH?'stingH':'stingZ',{vol:.7});AU.muSet&&AU.muSet(win===TH?'win':'dead');if(G.mode!=='scen')HUD.roundResult(win);if(NET.host)netEv('end',{w:win,sc:G.score.slice()})}
// ---------- blackout: now and then the power fails mid-round ----------
// The baked lamp light, glowing windows/signs and the map's own lamps drop to a dim emergency level for 12-18 s (fires, flares, muzzle
// flashes and flashlights still work); the lights stutter on the way out and back. The host rolls it once per round (20 %; never when the
// room has blackouts off) and tells everyone. A map keeps a share of its light (MAP.env.boAmb): the night maps are dark to begin with.
// Humans get their flashlight switched on, and it reaches further while the power is out (main.js).
const BO={on:false,t:0,dur:0,amb:1,lamp:1,next:1e9,out:0,CHANCE:.2,EMERG:.18,
  floor(){return (MAP.env&&MAP.env.boAmb)||.3},
  reset(){const off=!!G.cfg&&(G.cfg.blackout===0||G.cfg.blackout===false);this.on=false;this.t=0;this.out=0;this.amb=this.lamp=1;
    this.next=G.mode!=='scen'&&!off&&Math.random()<this.CHANCE?rr(25,Math.max(30,G.roundTime-45)):1e9},
  start(d,remote){if(this.on)return;this.on=true;this.t=0;this.dur=d;this.out=0;AU.play('blackout',{vol:.9});const P=G.player,L=LI();
    if(P&&P.team===TH){HUD.announce(L?'BLACKOUT!':'정전!','z',3);if(!P.alive)HUD.note(L?'The power is out':'전력 차단',3);
      else{if(!P.flash){P.flash=true;AU.play('ui',{vol:.35,rate:.6})}HUD.note(L?'The power is out — your flashlight is on (F)':'전력 차단 — 손전등을 켰어요 (F)',4)}}
    else if(P)HUD.note(L?'The power is out — night vision (N)':'전력 차단 — 야간투시(N)를 켜세요',4);
    if(NET.host&&!remote)netEv('bo',{on:1,d:Math.round(d)})},
  stop(remote,quiet){if(!this.on)return;this.on=false;this.t=0;this.out=1;if(!quiet){AU.play('powerup',{vol:.8});HUD.note(LI()?'Power restored':'전력 복구',2.5)}
    if(NET.host&&!remote)netEv('bo',{on:0})},
  update(dt){this.t+=dt;
    if(!NET.cli&&G.st==='fight'&&!this.on&&this.out===0&&G.roundTime-G.time>=this.next)this.start(rr(12,18));
    if(this.on&&!NET.cli&&this.t>=this.dur)this.stop();
    const fl=this.floor(),E=this.EMERG;let a=1,l=1;
    if(this.on){const t=this.t;if(t<1.3){const on=Math.sin(t*37)+Math.sin(t*23.7)>.4*(1+t);a=on?1:fl+.12;l=on?1:E}else{const k=Math.min(1,(t-1.3)/.4);a=lerp(fl+.12,fl,k);l=E}}
    else if(this.out===1){const t=this.t;if(t<1){const on=Math.sin(t*41)+Math.sin(t*19.3)>1-t*1.4;a=on?.8:fl;l=on?.8:E}else{a=l=1;this.out=2}}
    this.amb=a;this.lamp=l}};
function gameUpdate(dt){if(G.st==='menu'||G.st==='over'){for(const a of G.actors)updateVisual(a,dt);return}
  G.t+=dt;
  if(G.mode==='scen')SCEN.update(dt);// the scenario runs its own stage / wave flow
  else if(G.mode==='range'){if(typeof RANGE!=='undefined')RANGE.update(dt)}// the shooting range: no rounds at all (range.js)
  else if(G.pvp)PVP.update(dt);// 대인전: one long fight with respawns (pvp.js)
  else if(G.st==='prep'){G.time-=dt;const s=Math.ceil(G.time);if(s<G.beepAt&&s>=1){G.beepAt=s;if(s<=10){const rec=AU.fromFile.countdown;if(s===10&&rec)AU.play('countdown',{vol:1,rev:0});if(!rec)AU.play(s<=3?'beep2':'beep',{vol:.5});HUD.countdown(s)}}
    if(G.time<=0){if(NET.cli)G.time=0;else{selectHosts();G.st='fight';G.time=G.roundTime}}}
  else if(G.st==='fight'){G.time-=dt;const h=humansAlive();BO.update(dt);SUP.update(dt);
    if(!NET.cli){if(h===0)endRound(TZ);else if(G.time<=0)endRound(TH);else if((G.mode==='mut'||G.mode==='orig')&&zombiesAlive()===0)endRound(TH)}
    if(G.st==='fight'&&(G.time<30||h===1))AU.muSet&&AU.muSet('intense')}
  else if(G.st==='end'){if(BO.on||BO.out===1)BO.update(dt);if(SUP.list.length)SUP.update(dt);G.endT-=dt;if(G.endT<=0&&!NET.cli){if(G.round>=G.rounds||Math.max(G.score[0],G.score[1])>G.rounds/2){G.st='over';UI.showResults();if(NET.host)netEv('over')}else startRound()}}
  for(const a of G.actors){
    if(a.alive){
      if(a.bot&&!a.pup)AI.update(a,dt);
      a.frozen=Math.max(0,a.frozen-dt);if(a.holdT>0)a.holdT=Math.max(0,a.holdT-dt);if(a.rootT>0)a.rootT=Math.max(0,a.rootT-dt);a.staggerT=Math.max(0,a.staggerT-dt);a.dizzy=Math.max(0,a.dizzy-dt);a.shriekT=Math.max(0,a.shriekT-dt);a.skillCD=Math.max(0,a.skillCD-dt);a.skillT=Math.max(0,a.skillT-dt);
      if(a.team===TZ&&!NET.cli&&!a.scen&&G.t-a.lastHurt>ZBAL.regenWait&&a.hp<a.maxHp)a.hp=Math.min(a.maxHp,a.hp+a.maxHp*ZBAL.regen*dt);// zombies left alone heal
      // badly hurt zombies leave a trail of blood (원본 only)
      if(GORE.lv>=2&&a.team===TZ&&a.hp<a.maxHp*.45&&Math.random()<dt*2.2)FX.spawn({x:a.c.x+rr(-.15,.15),y:a.c.y+rr(.7,1.2),z:a.c.z+rr(-.15,.15),vx:rr(-.2,.2),vy:-.5,vz:rr(-.2,.2),life:1.2,s0:.04,s1:.03,r:.42,g:.03,b:.02,f:4,grav:9.8,col:.05,splat:rr(.05,.11)});
      if(a.turning>0){a.turning-=dt;a.cmd.f=a.cmd.s=0;a.cmd.fire=a.cmd.alt=a.cmd.jump=a.cmd.skill=false;a.mvx*=.8;a.mvz*=.8}
      // the get-up timer runs here, not in updateVisual: the local player's own body is never drawn, so it would never count down there
      if(a.reviving>0)a.reviving=Math.max(0,a.reviving-dt);
      if(a.pup)netPuppet(a,dt);else if(a.reviving<=0){actorPhysics(a,dt);if(!(a.turning>0))actorWeapons(a,dt)}
      if(a.team===TZ&&a.frozen>0&&Math.random()<dt*6)FX.spawn({x:a.c.x+rr(-.3,.3),y:a.c.y+rr(.2,1.8),z:a.c.z+rr(-.3,.3),vy:-.3,life:.6,s0:.08,s1:.04,r:.8,g:.95,b:1,f:10,add:1});
      Object.assign(a.pc,a.cmd)}
    else{a.deadT+=dt;
      if(a.poolT>0){a.poolT-=dt;if(a.poolT<=0&&a.poolN<2){aimDir(a.yaw,0,_dv);const k=(a.deadDir>0?-.6:.6);FX.pool(a.c.x+_dv.x*k,a.c.y,a.c.z+_dv.z*k,a.poolN?rr(1.05,1.35):rr(.6,.85));a.poolN++;a.poolT=a.poolN<2?1.6:0}}
      if(a.team===TZ&&!a.permaDead&&G.st==='fight'&&!NET.cli){if(G.mode==='mut'){const cb=zComeback();a.reviveT-=dt*(cb?ZBAL.cbRevive:1);if(a.reviveT<=0){reviveZombie(a,cb?zPackSpawn(a):zRandomSpawn(),true);if(cb){a.hp=a.maxHp;a.armor=Math.max(a.armor,Math.round(ZCLASS[a.zc].armor*.75))}}}else{a.respawnT-=dt;if(a.respawnT<=0)reviveZombie(a,zRandomSpawn())}}}
    // dead bodies still settle under gravity
    if(!a.alive&&a.deadT<3){a.c.vy-=GRAV*dt;a.c.vx*=.9;a.c.vz*=.9;a.c.vx+=a.kvx*.3;a.c.vz+=a.kvz*.3;a.kvx*=.8;a.kvz*=.8;moveChar(a.c,dt)}}
  separate(dt);updateNades(dt);SMK.tick(dt);nyUpdate(dt);salUpdate(dt);dropsUpdate(dt);
  for(const a of G.actors)updateVisual(a,dt)}

// zombie grenade: the free hand comes up, hooks two fingers into the mouth, yanks the bone pin out and drops away; armed, the bomb trembles in the fist
const _zbH=new THREE.Vector3();
VMX.zbomb=function(vm,a,dt,o,m){const T=m.tags,pin=T.mag,L=m.armL,G=GUNS.zbomb,sp=G.sup;
  if(vm.drawT>0&&!vm.pull)vm.pinOut=false;
  let show=false;
  if(vm.pull){const P=vm.pull;P.t+=dt;const p=clamp(P.t/P.d,0,1);show=p<.97;
    // hand path in the bomb's frame (mouth faces -z): up from below, in through the fangs to the throat, grip, rip it out, drop away
    const reach=smooth(clamp(p/.22,0,1)),inn=smooth(clamp((p-.2)/.18,0,1)),yank=smooth(clamp((p-.5)/.2,0,1)),away=smooth(clamp((p-.74)/.26,0,1));
    _zbH.set(.03*(1-reach)+.04*away,-.22*(1-reach)-.2*away,-.3*(1-reach)-.09*(1-inn)-.14*yank-.12*away);
    if(p>.38&&p<.5)_zbH.z+=Math.sin((p-.38)/.12*Math.PI*3)*.006;
    if(L){L.position.set(sp[0]+_zbH.x,sp[1]+_zbH.y,sp[2]+_zbH.z)}
    if(pin){const g=p>.46?1:0;pin.position.x+=g*_zbH.x;pin.position.y+=g*_zbH.y;pin.position.z+=g*_zbH.z;pin.rotation.x=away*1.4;pin.visible=p<.97}
    // the bomb is held up to meet the hand, jerks as the pin comes free, gags
    const grab=Math.sin(clamp((p-.3)/.2,0,1)*Math.PI),jerk=p>.5&&p<.64?Math.sin((p-.5)/.14*Math.PI):0,hold=reach*(1-away);
    o[0]-=.02*hold;o[1]+=.02*hold+jerk*.015;o[4]-=.12*hold;o[3]+=grab*.05-jerk*.1;o[5]+=jerk*.12;
    if(p>.5&&!vm.pinOut){vm.pinOut=true;vm.sp.rx.v+=1.4;vm.sp.pz.v+=.25}
    if(P.t>=P.d+.15)vm.pull=null}
  else if(pin)pin.visible=!vm.pinOut;
  if(L)L.visible=show;
  // armed and held: raised a little, trembling, eyes on you
  if(a.bSt===2&&!vm.pull){const tr=Math.sin(vm.t*47)*.004+Math.sin(vm.t*31)*.003;o[1]+=.025+tr;o[0]+=tr*.6;o[3]-=.12;o[5]+=Math.sin(vm.t*39)*.03}};

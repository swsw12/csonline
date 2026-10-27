'use strict';
// ╔══════════════════════════════════════════════════════════════════════════════════════════════╗
// ║  QUARANTINE Z — 디자인 · 사운드 관리 파일 (design.js)                                          ║
// ║  게임 안의 소리와 캐릭터 외형은 이 파일 하나에서 고친다.                                       ║
// ╚══════════════════════════════════════════════════════════════════════════════════════════════╝
//
//  목차
//    1부  사운드 ............ SOUND_MIX (음악·배경 볼륨), SOUND_DESIGN (효과음 하나하나)
//    2부  1인칭 팔 색 ....... ARM_DESIGN (내 화면에 보이는 소매·좀비 팔 색)
//    3부  캐릭터 외형 ....... defHuman (인간 4명), defZombie (좀비 8종)
//    4부  총기 아이덴티티 ... GUN_DESIGN (실제 총 · 탄창 수 · 약실 · 처음 꺼낼 때의 장전 모션)
//
//  고친 다음에는
//    source/ 폴더에서  python3 build.py  →  dist/standalone/index.html 이 새로 생긴다.
//    그걸 저장소 맨 위 index.html 로 복사해서 푸시하면 Vercel 에 반영된다.
//    (Claude 에게 "design.js 고쳤어" 라고만 해도 빌드·배포까지 해준다.)
//
//  색 표기: '#rrggbb' (16진수). 예) '#ff0000' 빨강, '#000000' 검정, '#ffffff' 흰색.
//  숫자 표기: .5 = 0.5. 길이는 전부 미터 단위(캐릭터 키 ≈ 1.8).
//
// ================================================================================================
//  1부  사운드
// ================================================================================================
//  이 게임의 효과음은 녹음 파일이 아니라 코드로 합성한다 (audio.js / nyw.js 의 SFX 레시피).
//  여기서는 각 소리의
//    vol  : 볼륨 배율.   1 = 기본, 0.5 = 절반, 2 = 두 배, 0 = 끄기
//    rate : 음 높이·빠르기 배율.  1 = 기본, 1.2 = 높고 빠르게, 0.8 = 낮고 느리게
//    file : 녹음 파일로 바꾸고 싶을 때 파일 경로.  '' 이면 원래 합성음을 쓴다.
//           예) file:'sound/ak47.mp3'  → source/sound 폴더에 mp3/ogg/wav 를 넣는다 (빌드 때 게임 옆 sound 폴더로 복사됨).
//           ['sound/a.ogg','sound/a.mp3'] 처럼 여러 개 적으면 먼저 읽히는 걸 쓴다 (아이폰은 ogg 를 못 읽을 수 있음).
//           [['sound/a1.ogg','sound/a1.mp3'],['sound/a2.ogg','sound/a2.mp3']] 처럼 묶음을 여러 개 적으면 변형 여러 개 —
//           나올 때마다 그중 하나를 무작위로 고른다 (같은 소리가 연달아 똑같이 들리지 않게).
//           파일을 못 읽으면 자동으로 원래 합성음으로 돌아간다.  data:audio/... 형식도 된다.
//    len  : (선택) 녹음 파일의 앞 몇 초만 쓸지. 예) len:10 → 0~10초만 재생하고 끊음 (끝은 살짝 페이드)
//  를 정한다.  게임 코드가 소리를 낼 때 붙이는 원래 볼륨·피치에 이 배율이 곱해진다.
//  ※ 3D 소리(남의 총, 좀비 등)는 거리·벽에 따라 자동으로 작아지고 먹먹해진다.
//  ※ 줄 끝 주석 = 무슨 소리인지 / 어디서 나는지.

// 전체 믹스: 음악과 배경음 (효과음 전체 볼륨은 게임 옵션의 '볼륨' 슬라이더)
const SOUND_MIX={
  music:.42,     // 배경 음악 (라운드 상황에 따라 바뀌는 신스 음악) 볼륨. 0 = 음악 끄기
  ambience:1,    // 배경 환경음 배율 (빗소리, 바람, 멀리서 들리는 사이렌·좀비 울음)
};

const SOUND_DESIGN={
  // ── 총소리 · 권총 (보조무기 2번 슬롯) ───────────────────────────────────────────────────────
  // 내가 쏘면 귀 옆에서, 남이 쏘면 그 사람 위치에서 거리감 있게 들린다.
  p9:      {vol:1, rate:1, file:''},  // USP (시작할 때 주는 기본 권총) 발사음
  d50:     {vol:1, rate:1, file:''},  // 데저트 이글 발사음 — 묵직한 대구경
  f7:      {vol:1, rate:1, file:''},  // 파이브세븐 발사음 — 가볍고 날카로움
  tw9:     {vol:1, rate:1, file:''},  // 듀얼 베레타 발사음 (빨강·노랑 쌍권총, 양손 번갈아 쏨)
  r6:      {vol:1, rate:1, file:''},  // 아나콘다 리볼버 발사음
  duck:    {vol:1, rate:1, file:''},  // 덕풋 권총 발사음 (여러 총구가 한 번에 터지는 소리)
  // ── 총소리 · 샷건 ────────────────────────────────────────────────────────────────────────────
  sg8:     {vol:1, rate:1, file:''},  // M3 펌프 샷건 발사음
  db2:     {vol:1, rate:1, file:''},  // 더블 배럴 샷건 발사음
  m14:     {vol:1, rate:1, file:''},  // XM1014 자동 샷건 발사음
  as12:    {vol:1, rate:1, file:''},  // USAS-12 자동 샷건 발사음
  ddefire: {vol:1, rate:1, file:''},  // 듀얼 데저트 이글 발사음 (묵직한 .50AE, 양손 번갈아 쏨)
  jhfire:  {vol:1, rate:1, file:''},  // 팬코 잭해머 발사음 (묵직한 12게이지 + 카세트 돌아가는 '철컥')
  // ── 총소리 · 기관단총 ────────────────────────────────────────────────────────────────────────
  k5:      {vol:1, rate:1, file:''},  // MP5 발사음
  k9:      {vol:1, rate:1, file:''},  // MAC-10 발사음
  um45:    {vol:1, rate:1, file:''},  // UMP45 발사음
  pd50:    {vol:1, rate:1, file:''},  // P90 발사음
  sterling:{vol:1, rate:1, file:''},  // 스털링 L2A3 발사음
  balrog5: {vol:1, rate:1, file:''},  // 이그니스-5 발사음 — M4A1보다 낮고 묵직한 5.56mm
  bx11:    {vol:1, rate:1, file:''},  // 이그니스-XI 발사음 — XM1014보다 거친 12게이지
  bxfire:  {vol:1, rate:1, file:''},  // 이그니스-XI 우클릭 — 화염구 5발이 '화르륵' 터져 나가는 소리
  bxchg:   {vol:1, rate:1, file:''},  // 이그니스-XI 특수탄 충전 '띠링'
  plfire:  {vol:1, rate:1, file:''},  // 플라즈마 건 발사음 — '퓨웅' 하는 에너지탄
  plhit:   {vol:1, rate:1, file:''},  // 플라즈마 구체가 터지는 '팍'
  plchg:   {vol:1, rate:1, file:''},  // 플라즈마 셀을 끼운 뒤 차오르는 '위잉'
  tbfire:  {vol:1, rate:1, file:''},  // 아크라인 발사음 — 광선이 '쥬웅' 뻗어 나가는 소리
  tbchg:   {vol:1, rate:1, file:''},  // 아크라인 재충전 완료 '위이잉'
  tbsw:    {vol:1, rate:1, file:''},  // 아크라인 전원 스위치 '딸깍'
  dmp7:    {vol:1, rate:1, file:''},  // 듀얼 MP7A1 (보급상자 전용) 발사음 — 날카롭고 높은 4.6mm, 양손 번갈아 쏨
  glock:   {vol:1, rate:1, file:''},  // 글록 발사음 — 가볍고 경쾌한 9mm (우클릭 3점사)
  dglock:  {vol:1, rate:1, file:''},  // 더블 글록 (보급상자 전용) 발사음 — 빠른 연사용으로 짧고 날카로운 9mm, 양손 번갈아 쏨
  vecfire: {vol:1, rate:1, file:''},  // 크리스 벡터 발사음 — 짧고 건조한 .45, 빠른 연사
  an94fire:{vol:1, rate:1, file:''},  // AN-94 발사음 — 날카로운 5.45mm (하이퍼버스트 첫 2발은 아주 빠르게)
  m82fire: {vol:1, rate:1, file:''},  // 바렛 M82A1 발사음 — 깊고 긴 .50 BMG 굉음
  spasfire:{vol:1, rate:1, file:''},  // SPAS-12 드래곤브레스 (보급상자 전용) 발사음 — 묵직한 12게이지 (불길 소리는 따로)
  m32fire: {vol:1, rate:1, file:''},  // M32 클러스터 (보급상자 전용) 발사음 — 40mm '퉁' + 실린더 '철컥'
  // ── 총소리 · 소총 / 저격총 / 기관총 ──────────────────────────────────────────────────────────
  ar7:     {vol:1, rate:1, file:''},  // M4A1 발사음
  kv47:    {vol:1, rate:1, file:''},  // AK-47 발사음
  g35:     {vol:1, rate:1, file:''},  // 갈릴 발사음
  br3:     {vol:1, rate:1, file:''},  // 파마스 발사음
  ar5c:    {vol:1, rate:1, file:''},  // SG552 발사음
  hr17:    {vol:1, rate:1, file:''},  // SCAR-H 발사음
  ak60r:   {vol:1, rate:1, file:''},  // AK-47 드럼 (보급상자 전용) 발사음 — AK보다 낮고 묵직한 7.62mm + 노리쇠 철컥
  sr8:     {vol:1, rate:1, file:''},  // 스카웃 저격총 발사음
  r700:    {vol:1, rate:1, file:''},  // AWP 저격총 발사음 — 길게 울리는 메아리
  dm14:    {vol:1, rate:1, file:''},  // G3SG1 자동 저격총 발사음
  hmg:     {vol:1, rate:1, file:''},  // M249 기관총 발사음
  mg6:     {vol:1, rate:1, file:''},  // MG3 기관총 발사음
  gx6:     {vol:1, rate:1, file:''},  // M134 미니건 발사음
  spinloop:{vol:1, rate:1, file:''},  // M134 미니건 총열 도는 모터음 (조준·사격 중 계속 도는 반복음)
  // ── 총소리 · 특수무기 ────────────────────────────────────────────────────────────────────────
  gl40:    {vol:1, rate:1, file:''},  // M79 유탄발사기 '퐁' 발사음
  airb:    {vol:1, rate:1, file:''},  // 압축 공기포(넉백총) 압축공기 '피슉' 소리 — 초당 10번 나는 짧은 소리
  salign:  {vol:1, rate:1, file:''},  // 파이어웜(화염방사기) 점화 '화륵' — 방아쇠를 당기는 순간 (첫 장전 때 파일럿 불꽃도)
  salroar: {vol:1, rate:1, file:''},  // 파이어웜 불길 '쿠와아' 반복음 — 내가 쏘는 동안 계속 도는 소리 (파일로 바꿀 땐 끊김 없이 이어지는 소리로)
  salgust: {vol:1, rate:1, file:''},  // 파이어웜 불길 소리 한 토막 — 다른 사람·봇이 쏠 때 위치에 맞춰 이어서 재생
  saloff:  {vol:1, rate:1, file:''},  // 파이어웜 사격을 멈출 때 밸브 '탁' + 가스 '치이익'
  salout:  {vol:1, rate:1, file:''},  // 파이어웜 재장전: 연료통 걸쇠 풀고 빼는 '덜컥'
  salin:   {vol:1, rate:1, file:''},  // 파이어웜 재장전: 새 연료통 끼우는 묵직한 '철컥' + 가스 새는 소리
  blackout:{vol:1, rate:1, file:''},  // 정전 이벤트 — 전기 끊기는 '쿵' + 형광등 꺼지는 웅 소리
  powerup: {vol:1, rate:1, file:''},
  bhole:   {vol:1, rate:1, file:''},  // 이벤트 호라이즌(보급상자 전용) 발사음 — 낮은 '쿵' + 올라가는 전자음
  vortex:  {vol:1, rate:1, file:''},  // 블랙홀이 열려 있는 3초 동안의 웅웅거리는 소리 (끝나면 폭발음은 explode 재사용)
  supply:  {vol:1, rate:1, file:''},
  chg:     {vol:1, rate:1, file:''},  // 첫 장전: 소총·기관단총 장전손잡이를 뒤로 당기는 '스르륵-턱' (AK·M4·갈릴 등)
  hkslap:  {vol:1, rate:1, file:''},  // 첫 장전: HK식 장전 — 손바닥으로 레버를 내리쳐 노리쇠가 닫히는 '착!' (MP5·UMP·G3)
  cylspin: {vol:1, rate:1, file:''},  // 첫 장전: 리볼버 실린더를 손으로 돌리는 '촤르륵' (아나콘다), 헥사 로터 드럼·슬러그 런처 총열
  sawpull: {vol:1, rate:1, file:''},  // 첫 장전: 그라인더 시동줄 당기는 소리 + 엔진 털털
  spinup:  {vol:1, rate:1, file:''},  // 첫 장전: M134 미니건 모터 시동 '위이잉'
  xbowcock:{vol:1, rate:1, file:''},  // 첫 장전: 크로스보우 시위를 당겨 거는 '끼익-탁'
  fdslam:  {vol:1, rate:1, file:''},  // 첫 장전: 권총 슬라이드가 스프링에 튕겨 닫히는 '착' (닫히는 순간에 맞춰 재생 — 파일로 바꿀 땐 소리가 0초에 바로 시작해야 함)
  fdhome:  {vol:1, rate:1, file:''},  // 첫 장전: 소총 노리쇠가 앞으로 닫히는 '철컹' (AK·M4·갈릴 등, 0초에 바로 시작)
  pumpb:   {vol:1, rate:1, file:''},  // 첫 장전: 펌프를 뒤로 당기는 '척' (0.055초에 뒤 끝에 닿는 소리)
  pumpf:   {vol:1, rate:1, file:''},  // 첫 장전: 펌프를 앞으로 밀어 닫는 '철컥' (0초에 바로 시작)
  fdgrab:  {vol:1, rate:1, file:''},  // 첫 장전: 장갑 낀 손이 쇠를 움켜쥐는 작은 소리
  hiss:    {vol:1, rate:1, file:''},  // 첫 장전: 압축 공기포 공기탱크 밸브 '치익', 이벤트 호라이즌 충전  // 보급상자 투하 — 수송기 프로펠러가 머리 위로 지나가는 소리  // 전력 복구 — 발전기 돌아가며 조명이 차례로 켜지는 소리
  volc:    {vol:1, rate:1, file:''},  // 헥사 로터 (연사 샷건) 발사음
  mdrill:  {vol:1, rate:1, file:''},  // 보어 드릴 발사음
  drill:   {vol:1, rate:1, file:''},  // 보어 드릴 우클릭 — 드릴 돌리며 찌르기
  mlaunch: {vol:1, rate:1, file:''},  // 슬러그 런처 3연발 발사음
  xbow:    {vol:1, rate:1, file:''},  // 크로스보우 시위 소리
  xbowa:   {vol:1, rate:1, file:''},  // 관통 크로스보우 시위 소리
  hstick:  {vol:1, rate:1, file:''},  // 크로스보우 볼트·나르왈 작살이 벽이나 몸에 꽂히는 소리
  harpoon: {vol:1, rate:1, file:''},  // 나르왈 작살 발사음
  disc:    {vol:1, rate:1, file:''},  // 차크람 원반 던지는 '윙' 소리
  dischit: {vol:1, rate:1, file:''},  // 차크람 원반이 좀비·벽에 맞는 금속성 '챙'
  pickup:  {vol:1, rate:1, file:''},  // 차크람 원반이 돌아와 손에 잡힐 때
  bdc:     {vol:1, rate:1, file:''},  // 흑염포 화염 발사음
  rdc:     {vol:1, rate:1, file:''},  // 홍염포 화염 발사음 (흑염포보다 더 큼)
  dragon:  {vol:1, rate:1, file:''},  // 용포 우클릭(게이지 가득) — 용 소환 포효
  sawrev:  {vol:1, rate:1, file:''},  // 그라인더(전기톱) 엔진 부웅 — 내가 들 때 / 남이 갈아버릴 때
  sawloop: {vol:1, rate:1, file:''},  // 그라인더 엔진 반복음 (누르고 있는 동안 계속, 세게 갈수록 높아짐)
  sawhit:  {vol:1, rate:1, file:''},  // 그라인더 톱날이 몸을 가는 소리

  // ── 장전 · 무기 다루기 ───────────────────────────────────────────────────────────────────────
  casing:  {vol:1, rate:1, file:''},  // 탄피가 바닥에 떨어지는 '팅' (권총·소총 쏜 뒤, 배경 음악 타악기로도 씀)
  shellcase:{vol:1,rate:1, file:''},  // 샷건 탄피가 떨어지는 소리
  dry:     {vol:1, rate:1, file:''},  // 빈 총 '틱' (탄창 비었을 때) / 돈이 모자라 구매 실패
  magout:  {vol:1, rate:1, file:''},  // 탄창 빼기 — 재장전 시작 (남이 장전할 때도 가까이서 들림)
  magin:   {vol:1, rate:1, file:''},  // 탄창 끼우기 (듀얼 베레타는 두 번)
  slide:   {vol:1, rate:1, file:''},  // 권총 슬라이드 당기기 — 권총 장전 끝
  rack:    {vol:1, rate:1, file:''},  // 소총 장전 손잡이 당기기 — 소총 장전 끝
  pump:    {vol:1, rate:1, file:''},  // 펌프 샷건 철컥 (쏜 다음)
  shellin: {vol:1, rate:1, file:''},  // 샷건 탄을 하나씩 밀어넣는 소리 (더블 배럴 장전 포함)
  brk:     {vol:1, rate:1, file:''},  // 더블 배럴 총신 꺾기 / 닫기
  bolt:    {vol:1, rate:1, file:''},  // 볼트 당기는 소리 (지금은 쓰는 곳 없음, 예비)
  draw:    {vol:1, rate:1, file:''},  // 총 꺼내기 (무기 바꿀 때, 바닥 총 주울 때)
  throw:   {vol:1, rate:1, file:''},  // 휙 던지는 소리 (수류탄 투척, G 키로 총 버리기)
  pin:     {vol:1, rate:1, file:''},  // 수류탄 안전핀 뽑기
  bounce:  {vol:1, rate:1, file:''},  // 수류탄이 바닥에 통통 튀는 소리 (관짝 좀비가 관 세울 때도 낮게)

  // ── 근접 무기 ────────────────────────────────────────────────────────────────────────────────
  kdraw:   {vol:1, rate:1, file:''},  // 칼·도끼·망치 꺼내는 '스릉' (망치 모드 바꿀 때도)
  kswing:  {vol:1, rate:1, file:''},  // 근접 무기 휘두르는 바람 소리 (칼·도끼, 그라인더 휘두르기)
  khit:    {vol:1, rate:1, file:''},  // 칼날이 몸에 박히는 소리
  hamhit:  {vol:1, rate:1, file:''},  // 망치 같은 둔기가 몸을 때리는 '퍽'
  kwall:   {vol:1, rate:1, file:''},  // 근접 무기·좀비 손톱이 벽에 부딪히는 '깡'
  skswing: {vol:1, rate:1, file:''},  // 그레이브-9 휘두르는 묵직한 바람 소리 (좌클릭 가로베기·우클릭 내려찍기)
  skhit:   {vol:1, rate:1, file:''},  // 그레이브-9 도끼날이 몸을 찍는 '콱'
  skslam:  {vol:1, rate:1, file:''},  // 그레이브-9 우클릭 내려찍기가 땅을 때리는 '쿵' (흙먼지와 함께)
  skdraw:  {vol:1, rate:1, file:''},  // 그레이브-9 꺼낼 때 쇠 긁히는 소리와 철사 찰랑임
  kaswing: {vol:1, rate:1, file:''},  // 카타나 휘두르는 날카로운 바람 소리 (좌클릭 사선베기·우클릭 가로베기)
  kahit:   {vol:1, rate:1, file:''},  // 카타나 날이 몸을 베는 소리 (서걱 + 짧은 쇳소리)
  kadraw:  {vol:1, rate:1, file:''},  // 카타나 뽑는 소리 (칼집에서 '스르릉' 하고 울림)

  // ── 폭발 · 투척물 ────────────────────────────────────────────────────────────────────────────
  explode: {vol:1, rate:1, file:''},  // 폭발 (고폭 수류탄, M79 유탄, 나르왈 기폭, 관짝 터짐, 자폭 좀비)
  frostx:  {vol:1, rate:1, file:''},  // 냉동 수류탄 터지는 소리 (얼음 깨지는 반짝임)
  zbombx:  {vol:1, rate:1, file:''},  // 좀비 폭탄 터지는 소리 (인간을 날려버림)
  flare:   {vol:1, rate:1, file:''},  // 조명탄 점화 '치익'

  // ── 명중 · 총알 ──────────────────────────────────────────────────────────────────────────────
  imp_conc:{vol:1, rate:1, file:''},  // 총알이 콘크리트·돌 벽에 맞는 소리 (배경 음악 타악기로도 씀)
  imp_metal:{vol:1,rate:1, file:''},  // 총알이 철판·컨테이너에 맞는 '깡'
  imp_wood:{vol:1, rate:1, file:''},  // 총알이 나무에 박히는 소리
  imp_dirt:{vol:1, rate:1, file:''},  // 총알이 흙·모래주머니에 맞는 소리
  imp_flesh:{vol:1,rate:1, file:''},  // 총알이 몸에 맞는 '퍽'
  headshot:{vol:1, rate:1, file:''},  // 내가 헤드샷을 맞혔을 때 '딱'
  whiz:    {vol:1, rate:1, file:''},  // 총알이 귀 옆을 스쳐 지나가는 '휙'
  hit:     {vol:1, rate:1, file:''},  // 히트마커 '틱' (내 총알이 몸에 맞을 때, 배경 음악 하이햇으로도 씀)
  hsding:  {vol:1, rate:1, file:''},  // 헤드샷으로 죽였을 때 '딩'
  gib:     {vol:1, rate:1, file:''},  // 머리·몸이 터지는 소리 (헤드샷 킬, 폭발 킬)

  // ── 좀비 ─────────────────────────────────────────────────────────────────────────────────────
  zgrowl:  {vol:1, rate:1, file:''},  // 좀비 그르렁 (좀비가 가끔, 메뉴 배경, 멀리서 들리는 울음, 보스 도약 전)
  zpain:   {vol:1, rate:1, file:[['sound/zombie_pain_1.ogg','sound/zombie_pain_1.mp3'],['sound/zombie_pain_2.ogg','sound/zombie_pain_2.mp3'],['sound/zombie_pain_3.ogg','sound/zombie_pain_3.mp3'],['sound/zombie_pain_4.ogg','sound/zombie_pain_4.mp3']]},  // 좀비가 총·칼에 맞을 때 (한 좀비당 0.35초에 한 번까지). 변형 4개 중 하나 무작위, 아이폰은 mp3. v6.87: 원본에 더 가깝게 — 끝에서 내려가는 음높이, 원본 음색에 맞춘 EQ (tools/zombie_pain.py)
  zdie:    {vol:1, rate:1, file:''},  // 좀비가 죽을 때 길게 우는 소리
  zatk:    {vol:1, rate:1, file:''},  // 좀비 공격 기합 (남의 좀비가 할퀼 때 / 좀비 폭탄 당길 때)
  claw:    {vol:1, rate:1, file:''},  // 좀비 손톱 휘두르는 바람 소리 (내가 좀비일 때)
  clawhit: {vol:1, rate:1, file:''},  // 좀비 손톱이 인간 몸을 긁는 소리
  clawarmor:{vol:1,rate:1, file:''},  // 좀비 손톱이 방탄복에 막히는 소리
  zstep:   {vol:1, rate:1, file:''},  // 좀비 발소리 '쿵' (배경 음악 킥드럼으로도 씀)
  zinfect: {vol:1, rate:1, file:''},  // 감염 — 숙주 좀비 등장 / 내가 좀비가 됐을 때
  zroar:   {vol:1, rate:1, file:''},  // 일반 좀비 스킬 광폭화 포효 / 좀비 레벨업 포효
  zleap:   {vol:1, rate:1, file:''},  // 도약 (좀비 폭탄에 날아갈 때, 시나리오 보스가 뛰어들 때)
  invis:   {vol:1, rate:1, file:''},  // 그림자 좀비 스킬 투명화
  heal:    {vol:1, rate:1, file:''},  // 주술사 좀비 스킬 치유
  trapset: {vol:1, rate:1, file:''},  // 덫잡이 좀비 스킬 덫 설치 (관짝 좀비가 관 세울 때도 낮게)
  trapsnap:{vol:1, rate:1, file:''},  // 덫이 닫히며 인간 다리를 무는 소리
  zrevive: {vol:1, rate:1, file:''},  // 좀비 부활
  zscream: {vol:1, rate:1, file:''},  // 비명 스킬 (지금 이 스킬을 쓰는 좀비 없음, 예비)
  zharden: {vol:1, rate:1, file:''},  // 경화 스킬 (지금 이 스킬을 쓰는 좀비 없음, 예비)

  // ── 인간 ─────────────────────────────────────────────────────────────────────────────────────
  hurt:    {vol:1, rate:1, file:''},  // 인간이 맞았을 때 '윽'
  hdie:    {vol:1, rate:1, file:''},  // 인간이 죽을 때
  hscream: {vol:1, rate:1, file:''},  // 인간이 감염당하며 지르는 비명
  step_conc:{vol:1,rate:1, file:''},  // 인간 발소리 — 콘크리트·아스팔트 바닥 (점프할 때도)
  step_metal:{vol:1,rate:1,file:''},  // 인간 발소리 — 철판·컨테이너 위
  step_dirt:{vol:1,rate:1, file:''},  // 인간 발소리 — 흙·풀 위
  step_wood:{vol:1,rate:1, file:''},  // 인간 발소리 — 나무 바닥
  land:    {vol:1, rate:1, file:''},  // 높은 데서 떨어져 착지하는 '쿵'
  armor:   {vol:1, rate:1, file:''},  // 방탄복 사기 / 방탄복이 깎일 때
  heart:   {vol:1, rate:1, file:''},  // 체력이 낮을 때 들리는 심장 박동
  hsprint: {vol:1, rate:1, file:''},  // 인간 스킬 전력질주(5키) 발동 — 숨 들이켜고 '훕' + 심장 쿵쿵 + 바람 (남이 쓰면 그 위치에서)
  hpant:   {vol:1, rate:1, file:''},  // 전력질주가 끝나고 숨이 찰 때 헐떡이는 소리 (내 것은 5초 동안 두 번 이어서)
  hdshot:  {vol:1, rate:1, file:''},  // 인간 스킬 확인사살(6키) 발동 — 노리쇠 '철컥' + 조준경 '팅' + 낮은 울림
  hskoff:  {vol:1, rate:1, file:''},  // 확인사살 효과가 끝날 때 짧게 내려가는 소리

  // ── UI · 알림 · 분위기 ───────────────────────────────────────────────────────────────────────
  ui:      {vol:1, rate:1, file:''},  // 버튼 딸깍 (메뉴 버튼, 손전등 F, 야간투시 N, 저격 줌)
  uiok:    {vol:1, rate:1, file:''},  // 확인 '띵동' (좀비 종류 고르기, 멀티 방 입장)
  buy:     {vol:1, rate:1, file:''},  // 구매 성공 '찰칵'
  countdown:{vol:1,rate:1, file:'sound/round_start.mp3', len:9},  // 좀비모드 라운드 시작 후 숙주 등장 전 10초 카운트다운이 시작되는 순간 한 번 재생.
                                    // 원본은 12초 — len:9 로 앞 9초만 쓰고 끊는다 (숙주 등장 1초 전에 끝남)
                                    // 이 파일이 있으면 아래 beep/beep2 대신 이것만 나온다 (시나리오 모드는 그대로 삑)
  beep:    {vol:1, rate:1, file:''},  // 남은 시간 카운트다운 '삑' (10~4초) — countdown 파일이 없을 때, 시나리오 웨이브 사이
  beep2:   {vol:1, rate:1, file:''},  // 마지막 3초 카운트다운 '삑삑' / 시나리오 자폭 좀비 점화
  lvlup:   {vol:1, rate:1, file:''},  // 좀비 레벨업 팡파레
  morale:  {vol:1, rate:1, file:''},  // 인간 사기 상승 / 시나리오 웨이브 클리어
  siren:   {vol:1, rate:1, file:''},  // 라운드 시작 사이렌 (배경에서 멀리 울리기도 함)
  stingZ:  {vol:1, rate:1, file:''},  // 숙주 좀비 등장 · 좀비 승리 · 보스 웨이브 시작 효과음
  stingH:  {vol:1, rate:1, file:''},  // 인간 승리 · 스테이지 클리어 · 새해 이벤트 완성 효과음
  stingL:  {vol:1, rate:1, file:''},  // 마지막 인간 한 명 남았을 때 효과음
  thunder: {vol:1, rate:1, file:''},  // 천둥 (비 오는 맵 배경, 실내에선 먹먹하게)
  nyletter:{vol:1, rate:1, file:''},  // 새해 이벤트 글자 하나 모을 때
};
// SOUND_DESIGN 에 없는 소리 이름은 기본값 (vol 1, rate 1, 합성음).
function soundDesign(n){return SOUND_DESIGN[n]||SD_DEFAULT}
const SD_DEFAULT={vol:1,rate:1,file:''};

// ================================================================================================
//  2부  1인칭 팔 색 (내 화면 아래쪽에 보이는 팔)
// ================================================================================================
//  3인칭 몸(3부)과 따로 그려지기 때문에, 3부에서 옷·피부 색을 바꿨다면 여기도 맞춰 주면 좋다.
//  sl_ = 인간 소매 [옷 색, (위장무늬 어두운 색, 밝은 색)]
//  zs_ = 좀비 팔 [피부 색, 얼룩 색]  — 피부 위에 찢긴 살·핏자국·멍은 자동으로 얹힌다.
//  장갑 색은 고정 (KNP SOU·LEGION·CBIRF = 검은 장갑, PJ = 흰 의료 장갑).
const ARM_DESIGN={
  sl_guard:  ['#2b3346'],                       // KNP SOU (경비대) — 남색 제복 소매
  sl_medic:  ['#5e706e'],                       // PJ (의무병) — 회청록 작업복 소매
  sl_soldier:['#4c5436','#2e3424','#6a6a48'],   // LEGION (용병) — 올리브 위장무늬 소매
  sl_hazmat: ['#c8a42a'],                       // CBIRF (방호복) — 노란 방호복 소매
  zs_rager:  ['#7a8a6a','#4a2a28'],             // 일반 좀비 팔 — 회녹색 피부, 검붉은 얼룩
  zs_runner: ['#9a9a86','#5a3a40'],             // 그림자 좀비 팔 — 창백한 회색 피부, 보랏빛 얼룩
  zs_brute:  ['#8a7a6a','#6a3a32'],             // 덫잡이 좀비 팔 — 누런 살색, 적갈색 얼룩
  zs_scream: ['#2a1a15','#4a3020'],             // 주술사 좀비 팔 — 짙은 갈색 피부
  zs_coffin: ['#282321','#3a1c10'],             // 관짝 좀비 팔 — 거의 검은 피부
  zs_fireman:['#5e4c42','#2a1410'],             // 소방관 좀비 팔 — 그을린 잿빛 피부 (손등)
  sl_fmcoat: ['#8a6c3e'],                       // 소방관 좀비 소매 — 그을린 황갈색 방화복 (손목에 형광 띠: fmRefl, fireman.js)
  sl_strait: ['#cfc8b4'],                       // 구속복 좀비 소매 (1인칭) — 때 묻은 흰 캔버스, 끝이 막힌 소매 (손목의 가죽 끈 · 버클: strait.js)
};

// ================================================================================================
//  3부  캐릭터 외형 (3인칭 몸 — 다른 사람 눈에 보이는 내 캐릭터, 봇, 좀비)
// ================================================================================================
//  모든 캐릭터는 상자(박스) 부품을 이어 붙인 몸 + 그 위에 칠한 그림으로 만든다.
//  캐릭터 하나는 네 가지로 정해진다.
//
//  ① o  — 체형 (미터). 안 적은 값은 아래 기본값을 쓴다.
//     hipY .93 골반 높이(다리 길이)     legSep .1 다리 간격       legW .15 / legD .17 허벅지 너비 / 두께
//     shinW .13 정강이 굵기            thigh .41 허벅지 길이      footL .25 발 길이
//     torsoW .42 / torsoH .5 / torsoD .24  몸통 너비 / 높이 / 두께      belly 0 배 나온 정도
//     shX .25 어깨 너비(중심에서)      armW .12 팔 굵기           upper .28 위팔 길이   fore .27 아래팔 길이
//     hand .1 손 크기                  arm2 1 오른팔 굵기 배율    neck .06 목 길이
//     headW .24 / headH .26 / headD .26  머리 너비 / 높이 / 깊이     headZ -.01 머리 앞뒤 위치(-면 앞으로 내밈)
//     좀비 전용: claw 손톱 길이, fingL 손가락 길이, curl 손가락 굽힘, curlJ 손가락마다 다르게 굽는 씨앗값,
//                nose:false 코 없음(구멍), ears:[왼,오] 귀 있음 1/없음 0, browH 눈썹뼈 돌출, noseW 코 너비,
//                eyeY 눈 높이(0 아래~1 위), eyeSep 눈 간격
//     인간 전용: face:'visor' 헬멧 바이저 / face:'mask' 얼굴 앞면을 평평하게(방독면·스카프) / 그 밖의 값은 코·눈두덩 입체를 남긴다
//
//  ② mats — 부위별 재질 {base: 기본 색, style: 질감, blot: 얼룩 색, camo:[위장 어두운색, 밝은색], gloss: 광택 240~254}
//     기본 부위: top 몸통  legs 골반·허벅지  sleeve 위팔  fore 아래팔  shin 정강이  skin 목·머리  hand 손  boot 발
//     (좀비) jaw 아래턱.   그 밖의 이름(vest, helm, coffin …)은 ④ extra 부품이 쓰는 재질.
//     style: 'cloth' 천(기본)  'skin' 사람 피부  'zskin' 좀비 피부(멍·혈관)  'plate' 단단한 판(헬멧·방탄판)
//            'rubber' 고무  'boot' 군화  'flat' 무늬 없는 단색  'hair' 머리카락  'flesh' 생살  'meat' 내장  'tumor' 종양
//     goreM (좀비 공통): bone 뼈, guts 내장, tumor 종양, nail 손톱, flesh 생살
//     (피 표현이 15세·피 끄기면: rib·vert·guts·stump 부품은 빠지고, 생살·뼈·핏자국 그림은 멍·때·긁힌 자국으로 바뀐다 — models.js goreOp)
//
//  ③ decor — 부위 표면에 칠하는 그림.  부위이름:{면:[ 그림, 그림 … ]}
//     면: front 앞  back 뒤  side 양옆  left / right  top 위  bottom 아래  fb 앞+뒤  all 전부
//     부위이름: torso 몸통  pelvis 골반  head 머리  neck 목  jaw 턱  uaL/uaR 위팔  faL/faR 아래팔  handL/handR 손
//               thL/thR 허벅지  shL/shR 정강이  footL/footR 발  + extra 부품 이름
//     좌표 u(왼→오), v(아래→위) 는 0~1.  그림 종류:
//       ['rect',u0,v0,u1,v1,색]  네모        ['band',v0,v1,색] 가로 띠      ['vband',u0,u1,색] 세로 띠
//       ['out',0,0,1,1,색]  테두리선         ['pocket',u0,v0,u1,v1,색] 주머니  ['zip',u] 지퍼
//       ['belt',v0,v1,색,버클색] 벨트        ['laces'] 신발끈                  ['text','글자',u,v,색] 글씨(영문 대문자·숫자)
//       ['px',u,v,색,빛남] 점 하나           ['glow',u0,v0,u1,v1,색] 스스로 빛나는 네모
//       ['grime',세기] 때·얼룩               ['blood',개수,씨앗,색] 핏방울     ['soak',v0,v1,색,진하기] 아래로 번지는 피
//       ['drip',u,v,줄수,길이] 흘러내리는 피 ['tear',개수,씨앗,색] 찢어진 구멍  ['gash',u0,v0,u1,v1,줄수,간격] 손톱 자국
//       ['flesh',u0,v0,u1,v1,결방향] 드러난 근육   ['bonep',u0,v0,u1,v1] 드러난 뼈   ['ribs',u0,v0,u1,v1,갈비수] 갈비뼈
//       ['wounds',개수,씨앗] 상처 여러 개    ['bite',u,v,크기] 물린 자국      ['stitch',u0,v0,u1,v1] 꿰맨 자국
//       ['rot',개수] 썩은 부분               ['veins',개수,색,빛남] 혈관(빛남 1 = 어둠에서 빛남)
//       ['teethrow','top'|'bottom',깊이] 이빨 줄
//       ['line',u0,v0,u1,v1,굵기,색] 직선(반사광 등)   ['disc',u,v,반지름,색,테두리색,구멍색] 동그라미(필터·음성판)
//       ['check',색,칸크기,점색] 체크 무늬(시마그)     ['solid',u0,v0,u1,v1,색] 얼룩 없는 단색   ['grad',u0,v0,u1,v1,위색,아래색] 위→아래 그라데이션
//       ['face',종류,{옵션}] 얼굴 — 종류: 'man' 남자  'woman' 여자  'visor' 바이저  'gasmask' 방독면
//                                       'balaclava' 발라클라바  'gaiter' 넥게이터(옵션 c 천 색, hair 앞머리 색, hem 끝단 높이)
//                                       'm50' 후드 속 통렌즈 방독면(옵션 hood 후드 색)
//                                       'zombie' 'runner' 'brute' 'scream' 좀비 얼굴들
//            옵션: skin 피부색, eye 눈 색, hair 머리색, stubble 수염, oneEye 한쪽 눈 없음, tears 피눈물,
//                  cheek 뺨 찢김, lipless 입술 없음, sewn 눈 꿰맴, ey 눈 높이
//
//  ④ extra — 몸에 덧붙이는 부품 {n:이름, b:뼈 번호, c:[x,y,z] 중심, s:[너비,높이,깊이], m:재질}
//     뼈 번호: 0 골반  1 몸통  2 머리  3 왼위팔  4 왼아래팔  5 오른위팔  6 오른아래팔
//              7 왼허벅지  8 왼정강이  9 오른허벅지  10 오른정강이  11 턱  12 왼발  13 오른발
//     좌표: x 오른쪽(+), y 위(+), z 뒤(+) / 앞(-).  발바닥 y=0, 캐릭터는 -z 쪽을 본다.
//     함수형 extra=H=>[…] 은 H.piv(관절 위치), H.o(체형), H.headC(머리 중심)를 써서 체형에 맞춰 붙인다.
//     (인간) 덧붙임: rx/ry/rz 기울기(라디안), fr 둥근 정도(0~.5, 클수록 동글), d:'이름' 다른 부품의 decor 그림을 같이 쓴다.
//
//  ※ 크기(키)·히트박스·스탯은 game.js 의 ZCLASS(좀비)에 있다. 여기는 보이는 모습만.
//  ※ 숙주 좀비(host)는 같은 몸에 붉게 빛나는 혈관이 더해지고 눈이 빨개진다 (맨 아래 공통 처리).

const SKIN_C={a:'#c89a78',b:'#a8785a',c:'#e0b898',d:'#7a5038'};  // 사람 피부색 4가지: a 보통, b 그을린, c 밝은, d 어두운
// ── 인간 캐릭터 (로비에서 고르는 스킨) ─────────────────────────────────────────────────────────
//    k = 'guard' KNP SOU | 'medic' PJ | 'soldier' LEGION | 'hazmat' CBIRF
//    v6.44: 네 명 모두 맨얼굴 대신 컨셉에 맞는 마스크를 쓴다 (실제 특수부대 · 화생방 장비를 참고해 새로 그린 디자인).
//    마스크 부품 좌표 기준: 머리 가운데 높이 1.68, 얼굴 앞면 z = -.14 (CBIRF -.145), 눈 높이 1.68.
function defHuman(k){
  const o={};let mats,decor,extra=[];
  // ▶ KNP SOU (guard) — 한국 경찰특공대 출신 격리구역 경비대 · 경찰 대테러 특공대 장비 (독일 GSG 9 · 한국 경찰특공대 참고)
  //    남색 제복·바지, 검은 방탄조끼(앞주머니 3개, 노란 띠), 검은 방염 발라클라바 + 진압 헬멧 + 이마~턱을 덮는 스모크 방탄 바이저.
  //    등에 'SEC' 글씨, 양 위팔에 노란 완장, 왼쪽 허리 파우치, 가슴 오른쪽 무전기, 검은 고무장갑.
  if(k==='guard'){// KNP SOU — quarantine security: navy uniform, black plate carrier, black balaclava, riot helmet with a full-face ballistic visor
    o.face='balaclava';mats={top:{base:'#2b3346'},legs:{base:'#262d3e'},sleeve:{base:'#2b3346'},fore:{base:'#2b3346'},shin:{base:'#262d3e'},skin:{base:'#1b1c1f'},hand:{base:'#1c1d20',style:'rubber'},boot:{base:'#18171a',style:'boot'},
      vest:{base:'#1d1f24',style:'plate',gloss:243},helm:{base:'#22262e',style:'plate'},pouch:{base:'#24272c'},visor:{base:'#111922',style:'flat',gloss:254},hinge:{base:'#2c3038',style:'plate'}};
    decor={torso:{front:[['band',.62,.68,'#c8b02a']],back:[['band',.62,.68,'#c8b02a'],['text','SEC',.3,.5,'#c8c8c0']]},
      vest:{front:[['pocket',.08,.08,.3,.42,'#2a2e34'],['pocket',.36,.08,.62,.42,'#2a2e34'],['pocket',.68,.08,.92,.42,'#2a2e34'],['band',.78,.86,'#c8b02a'],['out',0,0,1,1,'#101114']],back:[['out',0,0,1,1,'#101114'],['band',.7,.78,'#c8b02a']]},
      head:{front:[['face','balaclava',{skin:'#1b1c1f'}]]},neck:{all:[['band',.6,.7,'#141517']]},
      helm:{front:[['band',.0,.16,'#121418']],side:[['rect',.0,.0,1,.18,'#121418']],all:[['out',0,0,1,1,'#14161a']]},
      pelvis:{fb:[['belt',.7,.95,'#141414','#6a6a62']]},footL:{front:[['laces']]},footR:{front:[['laces']]},shL:{front:[['rect',.15,.55,.85,.95,'#16181c']]},shR:{front:[['rect',.15,.55,.85,.95,'#16181c']]},
      uaL:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},uaR:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},
      visor:{all:[['solid',0,0,1,1,'#0b1016']],front:[['grad',0,0,1,1,'#0e161e','#1e2a36'],['band',.9,1,'#06080b'],['band',0,.05,'#2e3c4a'],['line',.12,.82,.36,.18,2.2,'#283a4e'],['line',.3,.86,.44,.46,1,'#48667e']]},
      visorW:{all:[['solid',0,0,1,1,'#0b1016']],front:[['grad',0,0,1,1,'#0e161e','#1a2430'],['band',.9,1,'#06080b'],['band',0,.05,'#2e3c4a']]}};
    extra=[{n:'vest',b:1,c:[0,1.28,0],s:[.45,.36,.29],m:'vest'},{n:'helm',b:2,c:[0,1.745,.01],s:[.28,.16,.3],m:'helm',rx:.1},{n:'visor',b:2,c:[0,1.638,-.177],s:[.162,.15,.012],m:'visor'},{n:'visorL',b:2,c:[-.108,1.638,-.153],s:[.08,.15,.012],m:'visor',d:'visorW',ry:.6},{n:'visorR',b:2,c:[.108,1.638,-.153],s:[.08,.15,.012],m:'visor',d:'visorW',ry:-.6},
      {n:'hingeL',b:2,c:[-.146,1.7,-.105],s:[.024,.046,.05],m:'hinge',d:'hinge'},{n:'hingeR',b:2,c:[.146,1.7,-.105],s:[.024,.046,.05],m:'hinge',d:'hinge'},
      {n:'varmL',b:2,c:[-.134,1.684,-.146],s:[.012,.034,.06],m:'hinge',d:'hinge'},{n:'varmR',b:2,c:[.134,1.684,-.146],s:[.012,.034,.06],m:'hinge',d:'hinge'},
      {n:'pouchL',b:0,c:[-.19,.93,-.06],s:[.06,.12,.1],m:'pouch'},{n:'radio',b:1,c:[.17,1.36,-.15],s:[.06,.1,.04],m:'pouch'}]}
  // ▶ PJ (medic) — 미 공군 항공구조대(Pararescue) 출신 야전 의무병 · 화생방 의무요원 장비 (실제 반면형 방독 마스크 + 고글 조합)
  //    회청록 작업복(가운데 지퍼, 가슴 주머니 2개), 흰 헬멧 앞에 초록 십자, 등에 흰 의료 가방(초록 십자),
  //    왼 위팔에 흰 완장 + 초록 십자, 흰 의료 장갑. 얼굴: 청록 렌즈 고글 + 흰 반면 마스크(양 볼 필터, 가운데 초록 십자 밸브)
  //    + 눈 밑까지 끌어올린 회청록 넥게이터. 뒤로 묶은 갈색 머리(포니테일)는 그대로 보인다.
  else if(k==='medic'){// PJ — field medic: grey-teal coveralls, white helmet, medical pack, goggles + half-mask respirator over a neck gaiter
    mats={top:{base:'#5e706e'},legs:{base:'#56666a'},sleeve:{base:'#5e706e'},fore:{base:'#5e706e'},shin:{base:'#56666a'},skin:{base:'#4a5c5a'},hand:{base:'#d8dcd4',style:'rubber'},boot:{base:'#2a2622',style:'boot'},
      pack:{base:'#b8bcb0',style:'plate',gloss:244},helm:{base:'#c8ccc4',style:'plate'},hair:{base:'#3a2418',style:'hair'},
      gog:{base:'#2c3236',style:'rubber'},rsp:{base:'#d2d6ce',style:'rubber'},filt:{base:'#e4e4dc',style:'plate',gloss:244},valve:{base:'#e8e8e0',style:'plate',gloss:244}};
    decor={torso:{front:[['zip',.5],['pocket',.12,.55,.38,.8,'#52625f'],['pocket',.62,.55,.88,.8,'#52625f'],['grime',.4]],back:[['grime',.3]]},
      uaL:{side:[['rect',.15,.45,.85,.8,'#e8e8e0'],['rect',.42,.5,.58,.75,'#2a8a4a'],['rect',.28,.58,.72,.67,'#2a8a4a']]},uaR:{side:[['rect',.15,.45,.85,.8,'#e8e8e0']]},
      head:{front:[['face','gaiter',{c:'#4a5c5a',hair:'#3a2418',hem:.43}]],side:[['rect',0,.45,1,1,'#3a2418'],['band',.47,.53,'#22282b']],back:[['rect',0,.4,1,1,'#3a2418'],['band',.47,.53,'#22282b']],top:[['rect',0,0,1,1,'#3a2418']]},
      neck:{all:[['grime',.3]]},
      helm:{all:[['out',0,0,1,1,'#8a8e86']],front:[['rect',.4,.25,.6,.75,'#2a8a4a'],['rect',.3,.4,.7,.6,'#2a8a4a']]},
      gog:{front:[['grad',.06,.16,.94,.86,'#8cc4c0','#3e7c78'],['line',.14,.78,.3,.4,1.2,'#d4f0ec'],['solid',.44,.16,.56,.38,'#2c3236'],['out',.06,.16,.94,.86,'#1a1e20']]},
      rsp:{front:[['rect',.1,.15,.9,.25,'#b8bcb4']],all:[['out',0,0,1,1,'#a4a89f']]},rspN:{front:[['out',0,0,1,1,'#a4a89f']]},
      filt:{front:[['disc',.5,.5,.48,'#e8e8e0','#a8aca4','#c0c4bc']]},valve:{front:[['rect',.38,.18,.62,.82,'#2a8a4a'],['rect',.18,.38,.82,.62,'#2a8a4a']]},
      pack:{back:[['rect',.38,.35,.62,.7,'#2a8a4a'],['rect',.25,.45,.75,.6,'#2a8a4a'],['out',0,0,1,1,'#6a6e66']],all:[['grime',.3]]},
      pelvis:{fb:[['belt',.7,.92,'#2a2a26','#9a9a90']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'helm',b:2,c:[0,1.735,-.004],s:[.255,.16,.3],m:'helm',rx:.04},{n:'pack',b:1,c:[0,1.25,.19],s:[.32,.36,.14],m:'pack'},{n:'tail',b:2,c:[0,1.6,.15],s:[.06,.15,.06],m:'hair'},
      {n:'gog',b:2,c:[0,1.672,-.148],s:[.205,.052,.04],m:'gog'},{n:'rspN',b:2,c:[0,1.632,-.148],s:[.058,.028,.034],m:'rsp',fr:.45},{n:'rsp',b:2,c:[0,1.594,-.152],s:[.1,.064,.044],m:'rsp',rx:-.15,fr:.4},
      {n:'filtL',b:2,c:[-.066,1.588,-.166],s:[.044,.044,.03],m:'filt',d:'filt',ry:.45,fr:.5},{n:'filtR',b:2,c:[.066,1.588,-.166],s:[.044,.044,.03],m:'filt',d:'filt',ry:-.45,fr:.5},
      {n:'valve',b:2,c:[0,1.582,-.176],s:[.03,.028,.012],m:'valve'}];o.headW=.23;o.noseW=.13;o.browH=.018;o.face='gaiter'}
  // ▶ LEGION (soldier) — 프랑스 외인부대 출신 용병 · 사막 작전 특수부대 장비 (SAS · 미군 특수부대의 시마그 + 고글 조합 참고)
  //    올리브 위장무늬 전투복, 황갈색 방탄조끼(앞주머니 3개), 올리브 헬멧, 허벅지 주머니, 오른쪽 허리 파우치, 갈색 장갑.
  //    얼굴: 코요테색 시마그(체크 무늬 스카프)로 코·입·목을 감싸고, 헬멧 위에 있던 고글을 눈 위로 내려 쓴다.
  else if(k==='soldier'){// LEGION — mercenary: olive camo, tan plate carrier, a shemagh over the face and goggles pulled down
    mats={top:{base:'#4c5436',camo:['#2e3424','#6a6a48']},legs:{base:'#4a5236',camo:['#2c3222','#686844']},sleeve:{base:'#4c5436',camo:['#2e3424','#6a6a48']},fore:{base:'#4c5436',camo:['#2e3424','#6a6a48']},shin:{base:'#4a5236',camo:['#2c3222','#686844']},
      skin:{base:'#a8916c'},hand:{base:'#5a4a32',style:'rubber'},boot:{base:'#4a3a28',style:'boot'},vest:{base:'#8a7a58',style:'plate',gloss:242},helm:{base:'#5a5e44',style:'plate'},gog:{base:'#1f201c',style:'rubber'},wrap:{base:'#a8916c'}};
    decor={vest:{front:[['pocket',.06,.06,.3,.45,'#7a6a4a'],['pocket',.36,.06,.64,.45,'#7a6a4a'],['pocket',.7,.06,.94,.45,'#7a6a4a'],['rect',.3,.7,.7,.9,'#6a5a3e']],back:[['pocket',.2,.2,.8,.7,'#7a6a4a']],all:[['grime',.4]]},
      head:{all:[['check','#8c7654',4]],side:[['band',.44,.52,'#3a3a2a']],back:[['band',.44,.52,'#3a3a2a']]},neck:{all:[['check','#8c7654',4]]},
      wrap:{all:[['check','#8c7654',4],['grime',.35]],front:[['line',.06,.86,.5,.1,1.4,'#7e6a4c'],['line',.42,.92,.96,.24,1.4,'#7e6a4c'],['band',.88,1,'#c2ac86']],side:[['line',.1,.8,.9,.3,1.4,'#7e6a4c']]},
      helm:{all:[['out',0,0,1,1,'#3a3e2c']]},gog:{front:[['grad',.05,.14,.95,.88,'#545a5e','#1c1e20'],['line',.12,.8,.3,.4,1.2,'#a8987a'],['solid',.44,.14,.56,.36,'#1f201c'],['out',.05,.14,.95,.88,'#121310']]},
      pelvis:{fb:[['belt',.7,.95,'#3a3424','#8a8a7a']]},thL:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},thR:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'vest',b:1,c:[0,1.27,0],s:[.46,.38,.3],m:'vest'},{n:'helm',b:2,c:[0,1.75,.005],s:[.285,.15,.305],m:'helm',rx:.1},{n:'gog',b:2,c:[0,1.672,-.152],s:[.225,.06,.046],m:'gog'},
      {n:'wrap',b:2,c:[0,1.598,-.004],s:[.252,.098,.276],m:'wrap',fr:.42},{n:'wtail',b:2,c:[.07,1.535,.135],s:[.05,.1,.026],m:'wrap',d:'wrap',rz:-.25,fr:.4},{n:'pouchR',b:0,c:[.2,.92,0],s:[.07,.14,.12],m:'vest'}];o.face='mask'}
  // ▶ CBIRF (hazmat) — 미 해병대 화생방 대응군(CBIRF) 출신 방호복 기술자 · 화생방 부대 방독면 (미군 M50 참고)   (위의 셋이 아니면 전부 이 모습)
  //    노란 방호복(가운데 지퍼, 가슴에 'HAZ' 검은 패치), 검은 고무 장화·장갑, 등에 회색 산소통(빨간 띠).
  //    얼굴: 방호복 후드 안에 검은 방독면 — 넓은 통렌즈 하나, 양 볼에 필터 두 개, 입 앞 음성 전달판.
  else{// CBIRF — hazmat technician: yellow suit, an M50-style mask (one wide lens, twin cheek filters, a voicemitter) in the hood, black gloves
    mats={top:{base:'#c8a42a'},legs:{base:'#c09e28'},sleeve:{base:'#c8a42a'},fore:{base:'#c8a42a'},shin:{base:'#1c1c1c',style:'rubber'},skin:{base:'#c8a42a'},hand:{base:'#1a1a1a',style:'rubber'},boot:{base:'#141414',style:'boot'},
      filt:{base:'#2a2c2e',style:'rubber'},vm:{base:'#2e3134',style:'rubber'},tank:{base:'#8a9098',style:'plate'}};
    decor={torso:{front:[['zip',.5],['rect',.12,.7,.42,.82,'#1a1a1a'],['text','HAZ',.14,.82,'#c8a42a'],['grime',.5]],back:[['band',.15,.22,'#1a1a1a'],['grime',.4]]},
      head:{front:[['face','m50',{hood:'#c8a42a'}]],side:[['grime',.3]],back:[['vband',.48,.52,'#a8881e'],['grime',.3]]},
      filt:{front:[['disc',.5,.5,.47,'#3a3d40','#1a1b1c','#22252a']],all:[['out',0,0,1,1,'#18191a']]},vm:{front:[['disc',.5,.5,.48,'#4a4d50','#26282a','#2a2c2e']]},
      pelvis:{fb:[['belt',.75,.95,'#1a1a1a','#5a5a5a']]},thL:{all:[['grime',.4]]},thR:{all:[['grime',.4]]},
      tank:{back:[['band',.8,.9,'#c84020']],all:[['out',0,0,1,1,'#5a6068']]}};
    extra=[{n:'filtL',b:2,c:[-.088,1.598,-.12],s:[.068,.068,.056],m:'filt',d:'filt',ry:.55,fr:.5},{n:'filtR',b:2,c:[.088,1.598,-.12],s:[.068,.068,.056],m:'filt',d:'filt',ry:-.55,fr:.5},
      {n:'vm',b:2,c:[0,1.585,-.148],s:[.05,.046,.016],m:'vm'},{n:'tank',b:1,c:[0,1.27,.18],s:[.2,.34,.12],m:'tank'}];o.headW=.25;o.headD=.27;o.face='mask'}
  const H=humanoid(o);H.parts.push(...extra.map(e=>Object.assign({f:{}},e)));// (extra parts keep d / rx / ry / rz)
  return Object.assign(H,{key:'h_'+k,mats,decor,ppm:100})}

// ── 좀비 캐릭터 ──────────────────────────────────────────────────────────────────────────────────
//    k = 'rager' 일반 | 'runner' 라이트 | 'brute' 헤비 | 'coffin' 관짝 | 'scream' 부두
//        | 'bomber' 자폭(시나리오) | 'spitter' 산성(시나리오) | 'boss' 거대 좀비(시나리오: 헤비 몸에 어두운 색)
//        | 'strait' 구속복 좀비(1챕터, v6.91부터 플레이 가능) | 'aleph' 알레프(1챕터 보스: 거대 좀비 몸 + 구속구)
//        | 'argus' 아르고스(2챕터 보스: 1차 회수팀 저격수) | 'squad' 1차 팀 분대원 좀비(2·4챕터)
//        | 'larva' 유충 좀비(3·5챕터) | 'scrap' 장갑 고철 좀비(3챕터)
//        | 'khepri' 케프리(3챕터 보스: 거대 쇠똥구리 — 몸은 khepri.js 가 따로 만들고, 여기 몸은 숨겨 둔 자리표시)
//        | 'lyrebird' 라이어버드(4챕터 보스: 1차 회수팀 통신병) | 'radioman' 통신병 좀비(4챕터) | 'spore' 포자 좀비(4챕터)
//        | 'mirage' 환각(4챕터: 아군의 사람 모델을 그대로 빌려 그리므로 여기 몸은 쓰이지 않는다)
//        | 'tiamat' 티아마트(5챕터 보스: 거대 지네 — 몸은 tiamat.js 가 따로 만들고, 여기 몸은 숨겨 둔 자리표시) | 'centi' 새끼 지네(5챕터: 마찬가지)
//        | 'drowned' 익사체 좀비(5챕터) | 'hazmat' 방호복 연구원 좀비(5챕터)
//        | 'fireman' 소방관 좀비 (등의 산소통은 몸이 아니라 fireman.js 가 따로 붙인다: 돌진할 때 앞으로 들기 때문)
//        | 'legatus' 레가투스(6챕터 보스: 1차 회수팀 대장) | 'shield' 방패병 좀비(6챕터: 방패는 legatus.js 가 따로 붙인다)
//        | 'lorelei' 로렐라이(7챕터 보스: 1차 회수팀 협상 요원 — 확성기는 lorelei.js 가 붙인다) | 'listener' 청중 좀비(7챕터: 눈을 붕대로 감은 시민)
//        | 'charon' 카론(8챕터 보스: 1차 회수팀 조종사 — 헬기와 조명탄 권총은 charon.js 가 만든다) | 'frozen' 동사자 좀비(8챕터: 얼어붙은 지상 근무자)
//        | 'daedalus' 다이달로스(9챕터 보스: 1차 회수팀 공병 — 못총 · 렌치 · 토치 · 날개는 daedalus.js 가 붙인다) | 'static' 감전 좀비(9챕터: 번개 맞은 관측소 정비원)
//        | 'sentry' 자동 포탑(9챕터: 포탑은 daedalus.js 가 따로 만들고, 여기 몸은 숨겨 둔 자리표시)
//        | 'elpis' 엘피스(10챕터 보스: 1차 회수팀 의무병 — 다트 권총 · 패들 · 링거 팩 · 군번줄은 elpis.js 가 붙인다) | 'patient' 환자 좀비(10챕터: 지하 병동의 환자)
//        | 'aed' 제세동기(10챕터: 기계는 elpis.js 가 따로 그리고, 여기 몸은 숨겨 둔 자리표시)
//    host = 숙주 좀비(라운드 처음 감염된 좀비)면 true → 붉게 빛나는 혈관 + 빨간 눈.
//    vein = 숙주·보스 혈관 색,  eyeH = 숙주·보스 눈 색.  아래 eye:eyeH||'#…' 는 '숙주면 빨간 눈, 아니면 이 색'.
function defZombie(k,host){const aleph=k==='aleph',khepri=k==='khepri',tiamat=k==='tiamat'||k==='centi'||k==='sentry'||k==='aed'?k:'',boss=k==='boss'||aleph||khepri||!!tiamat;if(boss)k='brute';// the giant (and ALEPH): the heavy zombie's body in different colours (scaled up by the game)
  let o={},mats,decor,extra=()=>[];const vein=host||boss?'#ff3020':null,eyeH=host?'#ff3a1a':boss?'#ff5a20':null;
  // shared gore materials: exposed bone, intestine, tumour flesh, nails
  const goreM={bone:{base:'#d4ccae',style:'plate',gloss:243},guts:{base:'#a03a34',style:'meat'},tumor:{base:'#6a3a48',style:'tumor'},nail:{base:'#cfc4a0',style:'plate',gloss:246},flesh:{base:'#8a1c14',style:'flesh'}};
  // ▶ 일반 좀비 (rager) — 물린 회사원
  //    찢어진 흰 셔츠 사이로 부러진 갈비뼈가 튀어나옴, 피에 흠뻑 젖음, 남색 바지, 회녹색 피부,
  //    한쪽 눈 파임 + 노란 눈, 늘어진 아래턱, 왼팔을 뚫고 나온 뼈 조각, 오른팔 물린 자국.
  if(k==='rager'){// 감염자 — a bitten office worker: shirt ripped open over broken ribs, soaked in blood, one eye gouged, jaw hanging loose
    o={hipY:.9,torsoW:.42,torsoD:.23,headZ:-.02,arm2:1,claw:.018,fingL:.56,curl:.45,curlJ:3,ears:[1,0]};const sk='#6e7e62';
    mats=Object.assign({top:{base:'#b4ae9c'},legs:{base:'#2e3444'},sleeve:{base:'#b4ae9c'},fore:{base:sk,style:'zskin',blot:'#4a2a38'},shin:{base:'#2e3444'},skin:{base:sk,style:'zskin',blot:'#4a2a38'},hand:{base:dk(sk,.12),style:'zskin',blot:'#5a1010'},boot:{base:'#221c18',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a2a38'}},goreM);
    decor={torso:{front:[['soak',.25,1,'#5a0808',.9],['ribs',.24,.38,.76,.86,5],['gash',.1,.32,.3,.06,3,.06],['tear',2,7,sk],['grime',.6]],back:[['soak',.45,1,'#4a0606',.75],['tear',2,9,sk],['wounds',2,71],['grime',.6]],side:[['soak',.4,1,'#5a0808',.7],['grime',.5]]},
      neck:{all:[['flesh',.05,.05,.95,.95,1.2],['drip',.5,.35,4,.8]]},
      uaL:{all:[['tear',1,2,sk],['soak',.3,1,'#5a0808',.6],['grime',.5]]},uaR:{all:[['blood',3,5],['grime',.5]]},
      faL:{all:[['flesh',.12,.28,.88,.88,0],['bonep',.35,.45,.65,.7]]},faR:{all:[['bite',.5,.6,.22],['drip',.5,.45,3,.5]]},
      handL:{all:[['soak',0,1,'#5a0808',.85]]},handR:{all:[['soak',0,1,'#4a0606',.9]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8d040',oneEye:1,tears:1,cheek:1}],['gash',.6,.98,.82,.62,2,.07]],top:[['wounds',1,8],['blood',2,8]],side:[['blood',1,9],['drip',.4,.55,2,.6]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.35],['drip',.5,.6,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]],side:[['flesh',.2,.15,.8,.9,0]]},
      thL:{all:[['tear',1,3,sk],['soak',.5,1,'#4a0606',.6],['grime',.6]]},thR:{all:[['grime',.6],['blood',2,11]]},pelvis:{fb:[['belt',.75,.95,'#1a1612','#5a5a50'],['soak',.55,1,'#4a0606',.7]]},
      rib:{all:[['grime',.3]]},spike:{all:[['blood',1,3]]}};
    // broken ribs bursting out of the chest, a bone shard through the left forearm
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2;const L=[];
      for(let r=0;r<3;r++)for(const s of [-1,1])L.push({n:'rib',b:1,c:[s*o.torsoW*.16,sY+o.torsoH*(.72-r*.13),zf-.012],s:[o.torsoW*.22,.02,.026],m:'bone'});
      L.push({n:'rib',b:1,c:[0,sY+o.torsoH*.6,zf-.008],s:[.03,o.torsoH*.34,.02],m:'bone'});
      const el=H.piv[4];L.push({n:'spike',b:4,c:[el[0]-o.armW*.55,el[1]-o.fore*.35,0],s:[.08,.024,.024],m:'bone'});return L}}
  // ▶ 그림자 좀비 (runner) — 가죽이 벗겨진 굶주린 몸
  //    마른 체형·긴 다리, 등 가죽이 벗겨져 척추뼈·견갑골이 드러남, 입술 없는 이빨, 코 없음(구멍),
  //    길게 굽은 뼈 손톱, 창백한 회색 피부에 보랏빛 혈관, 하늘색 눈, 검은 머리.
  else if(k==='runner'){// 질주체 — flayed and starved: the back skinned down to the spine, a lipless grin, long bone claws
    o={hipY:.97,thigh:.44,legW:.12,legD:.14,shinW:.11,torsoW:.36,torsoD:.2,torsoH:.48,shX:.22,armW:.095,upper:.31,fore:.31,hand:.12,headW:.21,headH:.25,headD:.24,claw:.07,fingL:.6,curl:.3,curlJ:5,nose:false,ears:[0,0]};
    const sk='#8e8c7c';
    mats=Object.assign({top:{base:GORE.lv>=2?'#5a1e1a':'#463a34'},legs:{base:'#3a3a38'},sleeve:{base:sk,style:'zskin',blot:'#4a2a48'},fore:{base:sk,style:'zskin',blot:'#4a2a48'},shin:{base:sk,style:'zskin',blot:'#4a2a48'},skin:{base:sk,style:'zskin',blot:'#4a2a48'},hand:{base:dk(sk,.2),style:'zskin',blot:'#5a1010'},boot:{base:dk(sk,.25),style:'zskin'},hair:{base:'#141210',style:'hair'},jaw:{base:sk,style:'zskin',blot:'#4a2a48'}},goreM);
    decor={torso:{front:[['tear',3,4,'#6a5a58'],['ribs',.2,.5,.8,.95,6],['soak',.3,.75,'#4a0606',.8],['veins',4,'#4a3a5a']],back:[['flesh',.04,.04,.96,.98,1.57],['drip',.5,.12,5,.9]],side:[['flesh',0,.3,.6,.9,0],['grime',.4]]},
      head:{front:[['face','runner',{skin:sk,eye:eyeH||'#d8e8ff',tears:1,lipless:1}]],back:[['rect',0,.5,1,1,'#141210'],['flesh',.1,0,.9,.5,0]],top:[['rect',0,0,1,1,'#141210'],['wounds',1,12]],side:[['rect',0,.4,.6,1,'#141210'],['gash',.25,.32,.8,.08,3,.08]],bottom:[['teethrow','bottom',.36]]},
      jaw:{top:[['teethrow','top',.4]],front:[['teethrow','top',.55]],side:[['flesh',0,.2,1,.9,0]],bottom:[['soak',0,1,'#4a0606',.7]]},
      uaL:{all:[['veins',2,'#4a3a5a'],['flesh',.2,.3,.8,.7,1.57]]},uaR:{all:[['veins',2,'#4a3a5a'],['gash',.2,.9,.5,.2,3,.12]]},faL:{all:[['blood',2,3],['bonep',.3,.2,.7,.5]]},faR:{all:[['flesh',.1,.4,.9,.9,1.57]]},
      handL:{all:[['soak',0,1,'#5a0808',.9]]},handR:{all:[['soak',0,1,'#5a0808',.9]]},
      thL:{all:[['tear',2,3,sk],['flesh',.2,.3,.8,.7,1.57]]},thR:{all:[['tear',1,4,sk],['blood',1,6],['gash',.1,.8,.6,.3,3,.1]]},shL:{all:[['bonep',.3,.3,.7,.7]]},vert:{all:[['blood',1,4]]},claw:{all:[['soak',0,.6,'#4a0606',.9]]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],zb=o.belly*.25+(o.torsoD+o.belly)/2;const L=[{n:'hair',b:2,c:[0,H.headC[1]+.035,.06],s:[.23,.16,.2],m:'hair'}];
      for(let i=0;i<6;i++)L.push({n:'vert',b:1,c:[0,sY+.04+i*.075,zb+.012],s:[.05,.045,.03],m:'bone'});
      for(const s of [-1,1])L.push({n:'vert',b:1,c:[s*.085,sY+o.torsoH*.74,zb+.006],s:[.1,.13,.016],m:'bone'});
      return L}}
  // ▶ 덫잡이 좀비 (brute) — 부풀어 오른 격리 환자   (boss 일 때는 같은 몸에 어두운 색 = 시나리오 거대 좀비)
  //    거대한 몸통, 주황 환자복(앞에 'Q7-031', 보스는 'Q7-000'), 꿰맸다 다시 터진 배에서 내장이 늘어짐,
  //    양 어깨를 뚫고 나온 뼈, 등 혹, 종양 여러 개, 살이 벗겨진 정수리, 주황 눈.
  else if(k==='brute'){// 거구 — a bloated quarantine patient: belly stitched shut and burst open again, guts hanging to the knees, tumours, bone through the shoulders
    o={hipY:1.0,thigh:.45,legSep:.15,legW:.22,legD:.24,shinW:.2,torsoW:.66,torsoH:.62,torsoD:.4,belly:.08,shX:.4,armW:.19,upper:.34,fore:.34,hand:.14,headW:.22,headH:.24,headD:.25,headZ:-.06,neck:.03,arm2:1.25,footL:.3,claw:.024,curl:.6,curlJ:7,browH:.036,noseW:.2};
    const sk=boss?'#6e5a6a':'#7e6e60';
    mats=Object.assign({top:{base:boss?'#2e2a30':'#b8622a'},legs:{base:boss?'#2a262c':'#a85a28'},sleeve:{base:sk,style:'zskin',blot:'#6a3a42'},fore:{base:sk,style:'zskin',blot:'#6a3a42'},shin:{base:boss?'#2a262c':'#a85a28'},skin:{base:sk,style:'zskin',blot:'#6a3a42'},hand:{base:dk(sk,.2),style:'zskin',blot:'#5a1010'},boot:{base:'#1c1814',style:'boot'},band:{base:'#a8a088'},jaw:{base:sk,style:'zskin',blot:'#6a3a42'}},goreM,{bone:{base:'#c8c0a4',style:'plate',gloss:243}});
    decor={torso:{front:[['text',boss?'Q7-000':'Q7-031',.12,.88,boss?'#b8a8a0':'#2a1a10'],['flesh',.22,.06,.78,.46,0],['stitch',.18,.5,.82,.5],['stitch',.2,.05,.2,.5],['stitch',.8,.05,.8,.5],['soak',0,.55,'#4a0606',.7],['tear',2,2,sk],['grime',.6],['veins',3,'#4a2a2a']],back:[['text','Q7',.38,.72,'#2a1a10'],['rot',3],['tear',2,3,sk],['grime',.6]],side:[['rot',2],['grime',.5]]},
      head:{front:[['face','brute',{skin:sk,eye:eyeH||'#ffb030',tears:1}],['rect',.1,.85,.9,1,dk(sk,.3)],['stitch',.15,.96,.6,.7]],top:[['flesh',.04,.04,.96,.96,0],['bonep',.18,.22,.82,.82]],side:[['blood',1,4],['rot',1]],bottom:[['teethrow','bottom',.34]]},
      jaw:{top:[['teethrow','top',.36]],front:[['teethrow','top',.45],['drip',.5,.5,4,.7]],bottom:[['soak',0,1,'#4a0606',.8]]},
      bone:{all:[['grime',.4],['soak',0,.35,'#5a0808',.8]]},faR:{all:[['rect',0,.3,1,.5,'#a8a088'],['flesh',.1,.55,.9,.95,1.57],['blood',1,7]]},faL:{all:[['rot',2],['gash',.2,.9,.4,.2,3,.1]]},uaR:{all:[['rot',1],['stitch',.5,.1,.5,.9]]},
      thL:{all:[['grime',.6],['soak',.5,1,'#4a0606',.6]]},thR:{all:[['grime',.6],['tear',1,5,sk]]},tumor:{all:[['veins',3,'#2a0a14']]},guts:{all:[['soak',0,1,'#5a0a08',.35]]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2,hc=H.headC;
      const L=[{n:'bone',b:3,c:[-.4,1.67,0],s:[.26,.12,.28],m:'bone'},{n:'bone2',b:5,c:[.42,1.69,0],s:[.3,.14,.3],m:'bone'},{n:'hump',b:1,c:[0,1.62,.12],s:[.4,.2,.24],m:'skin'},
        {n:'tumor',b:1,c:[.17,sY+o.torsoH*.82,zb-.03],s:[.24,.2,.16],m:'tumor'},{n:'tumor',b:2,c:[-.1,hc[1]-.08,o.headZ+.06],s:[.13,.12,.12],m:'tumor'},{n:'tumor',b:5,c:[.5,1.45,.03],s:[.14,.16,.14],m:'tumor'}];
      const gy=sY+o.torsoH*.16;[[.04,0,.09,.1],[.07,-.1,.075,.12],[.05,-.22,.065,.12],[.08,-.33,.055,.1],[.06,-.42,.045,.08]].forEach(([x,dy,wd,hh],i)=>L.push({n:'guts',b:0,c:[x,gy+dy,zf-.035-i*.004],s:[wd,hh,wd*.85],m:'guts'}));
      return L}}
  // ▶ 관짝 좀비 (coffin) — 저장소 주인이 직접 만든 디자인
  //    흰 셔츠 + 검은 바지, 몸통 가운데 검은 세로판과 갈색 멜빵 두 줄·벨트, 거의 검은 피부,
  //    새까만 얼굴에 흰 눈(입술 없음), 오른팔에 검은 완장, 아래팔 끝 붉은 띠.
  //    등에 검은 관: 본체(cMain) + 위쪽 아치(cArch), 앞면 금속판(cFaceBg) 위 흰 얼굴(cFace), 붉은 핏자국(cBlood),
  //    아래 금속 받침(cBase), 금속 징 4개(pL1·pR1·pL2·pR2), 양쪽 금속 테두리(cEdgL·cEdgR),
  //    관 양옆으로 뻗은 가는 팔(eArmL·eArmR)과 늘어진 손(eHndL·eHndR).
  else if(k==='coffin'){
    o={hipY:.92,torsoW:.38,torsoD:.2,shX:.22,armW:.09,upper:.3,fore:.29,legW:.16,legD:.15,shinW:.12,headW:.22,headH:.28,headD:.24,neck:.1,claw:.03,fingL:.62,curl:.4,curlJ:9,eyeY:.66,noseW:.12};
     const sk='#2a2222';
     mats=Object.assign({top:{base:'#c4c2bc'},legs:{base:'#232122'},sleeve:{base:'#c4c2bc'},fore:{base:'#282321'},shin:{base:'#2b221d'},skin:{base:sk,style:'zskin'},hand:{base:'#282321'},boot:{base:'#2b221d'},jaw:{base:'#111111'},coffin:{base:'#1f2024',style:'flat'},metal:{base:'#18181a',style:'flat'},cface:{base:'#d4d6d0',style:'zskin'},cblood:{base:'#6a0404',style:'flat'}},goreM);
     decor={torso:{front:[['rect',.35,.1,.65,.9,sk],['vband',.2,.3,'#3a1c10'],['vband',.7,.8,'#3a1c10'],['belt',0,.1,'#1a100c','#555'],['soak',0,1,'#111',.3],['blood',2,5]],back:[['grime',.8]]},
       head:{front:[['rect',0,0,1,1,'#111111'],['face','scream',{skin:'#111111',eye:eyeH||'#ffffff',ey:.66,lipless:1}]],top:[['rect',0,0,1,1,'#111111']],back:[['rect',0,0,1,1,'#111111']],bottom:[['rect',0,0,1,1,'#111111']]},
       jaw:{front:[['rect',0,0,1,1,'#111111']],side:[['rect',0,0,1,1,'#111111']],bottom:[['rect',0,0,1,1,'#111111']]},
       uaR:{all:[['band',.5,.8,'#2a1a15'],['rect',.3,.5,.7,.8,'#111'],['grime',.4]]},uaL:{all:[['grime',.4]]},faL:{all:[['band',.85,.95,'#5a1010']]},faR:{all:[['band',.85,.95,'#5a1010']]},legs:{all:[['grime',.6]]}};
    extra=H=>[
      {n:'cMain',b:1,c:[0,1.05,.22],s:[.5,1.1,.12],m:'coffin'},{n:'cArch',b:1,c:[0,1.7,.22],s:[.35,.25,.12],m:'coffin'},
      {n:'cFaceBg',b:1,c:[0,1.65,.28],s:[.2,.25,.04],m:'metal'},{n:'cFace',b:1,c:[0,1.65,.3],s:[.14,.18,.02],m:'cface'},
      {n:'cBlood',b:1,c:[0,1.0,.3],s:[.2,.3,.01],m:'cblood'},{n:'cBase',b:1,c:[0,.45,.22],s:[.55,.15,.14],m:'metal'},
      {n:'pL1',b:1,c:[-.22,1.75,.22],s:[.08,.08,.08],m:'metal'},{n:'pR1',b:1,c:[.22,1.75,.22],s:[.08,.08,.08],m:'metal'},
      {n:'pL2',b:1,c:[-.26,1.55,.22],s:[.08,.08,.08],m:'metal'},{n:'pR2',b:1,c:[.26,1.55,.22],s:[.08,.08,.08],m:'metal'},
      {n:'eArmL',b:1,c:[-.35,1.05,.15],s:[.3,.03,.03],m:'skin'},{n:'eArmR',b:1,c:[.35,1.05,.15],s:[.3,.03,.03],m:'skin'},
      {n:'eHndL',b:1,c:[-.48,.85,.15],s:[.04,.12,.04],m:'skin'},{n:'eHndR',b:1,c:[.48,.85,.15],s:[.04,.12,.04],m:'skin'},
      {n:'cEdgL',b:1,c:[-.25,1.05,.28],s:[.03,1.1,.02],m:'metal'},{n:'cEdgR',b:1,c:[.25,1.05,.28],s:[.03,1.1,.02],m:'metal'}
    ];
  }
  // ▶ 자폭 좀비 (bomber, 시나리오 전용) — 부풀어 오른 화학공장 작업자
  //    회청색 작업복(노란 띠, 등에 'Q7-B'), 연두색으로 빛나는 종기가 배·가슴·등·어깨·머리에 잔뜩,
  //    빛나는 연두 혈관, 썩은 부분, 연두 눈.
  else if(k==='bomber'){// 자폭체 — a swollen chemical-plant worker: overalls split over a belly packed with glowing boils that hiss and leak
    o={hipY:.9,thigh:.42,legSep:.14,legW:.19,legD:.21,shinW:.16,torsoW:.56,torsoH:.56,torsoD:.34,belly:.16,shX:.35,armW:.14,upper:.3,fore:.28,hand:.12,headW:.25,headH:.25,headD:.26,headZ:-.04,neck:.02,claw:.018,curl:.5,curlJ:13,browH:.03,noseW:.17};
    const sk='#9a9e6a';
    mats=Object.assign({top:{base:'#4e5a62'},legs:{base:'#46525a'},sleeve:{base:sk,style:'zskin',blot:'#5a6a2a'},fore:{base:sk,style:'zskin',blot:'#5a6a2a'},shin:{base:'#46525a'},skin:{base:sk,style:'zskin',blot:'#5a6a2a'},hand:{base:dk(sk,.2),style:'zskin',blot:'#3a4a10'},boot:{base:'#2a2622',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#5a6a2a'},
      boil:{base:'#7e9a34',style:'tumor'}},goreM);
    decor={torso:{front:[['band',.86,.94,'#c8a42a'],['flesh',.18,.04,.82,.5,0],['veins',6,'#c8ff50',1],['rot',2],['tear',2,13,sk],['soak',0,.45,'#4a5a10',.6],['grime',.6]],back:[['band',.86,.94,'#c8a42a'],['text','Q7-B',.3,.62,'#1a1e20'],['veins',3,'#c8ff50',1],['rot',3],['grime',.6]],side:[['rot',2],['veins',2,'#c8ff50',1],['grime',.5]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#d8ff50',tears:1}],['veins',2,'#c8ff50',1]],top:[['rot',2],['wounds',1,17]],side:[['rot',1],['veins',2,'#c8ff50',1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.4],['drip',.5,.6,3,.7]],bottom:[['soak',0,1,'#4a5a10',.8]]},
      uaL:{all:[['rot',1],['veins',2,'#c8ff50',1]]},uaR:{all:[['rot',1],['grime',.5]]},faL:{all:[['veins',2,'#c8ff50',1]]},faR:{all:[['rot',1]]},
      thL:{all:[['grime',.6],['soak',.6,1,'#4a5a10',.5]]},thR:{all:[['grime',.6],['tear',1,14,sk]]},pelvis:{fb:[['belt',.75,.95,'#1a1612','#8a8a70']]},
      boil:{all:[['veins',2,'#d8f070',1],['glow',.4,.38,.6,.62,'#b8f048']]}};
    // boils: a cluster on the belly, more on the chest and back, a shoulder and the scalp
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2,hc=H.headC;
      return [[1,.06,sY+o.torsoH*.22,zf-.05,.22,.2,.14],[1,-.15,sY+o.torsoH*.36,zf-.03,.13,.12,.09],[1,.16,sY+o.torsoH*.5,zf-.02,.1,.1,.07],[1,-.06,sY+o.torsoH*.74,zf-.02,.09,.08,.06],
        [1,-.1,sY+o.torsoH*.55,zb+.03,.17,.16,.1],[1,.14,sY+o.torsoH*.3,zb+.02,.1,.1,.07],[3,-o.shX-.03,H.piv[3][1]+.02,.02,.13,.12,.13],[2,.07,hc[1]+o.headH/2-.01,o.headZ+.03,.1,.07,.1],[2,-.11,hc[1]-.06,o.headZ-.05,.06,.06,.06]]
        .map(([b,x,y,z,w,h,d])=>({n:'boil',b,c:[x,y,z],s:[w,h,d],m:'boil'}))}}
  // ▶ 산성 좀비 (spitter, 시나리오 전용) — 구부정하고 깡마른 몸
  //    목이 부풀어 연두색으로 빛나는 산성 주머니(sac), 산에 타서 갈비뼈가 보이는 가슴, 턱에서 흐르는 연두 침,
  //    회색 셔츠, 코 없음, 긴 목, 연두 눈.
  else if(k==='spitter'){// 산성체 — gaunt and stooped, the throat swollen into a glowing acid sac; the chest burnt through where it drools
    o={hipY:.96,thigh:.45,legW:.12,legD:.13,shinW:.11,torsoW:.34,torsoH:.5,torsoD:.19,shX:.21,armW:.085,upper:.32,fore:.31,hand:.12,headW:.2,headH:.25,headD:.23,headZ:-.06,neck:.13,claw:.04,fingL:.62,curl:.35,curlJ:17,nose:false,ears:[0,0]};
    const sk='#8c9682';
    mats=Object.assign({top:{base:'#8a9a9e'},legs:{base:'#3a3e44'},sleeve:{base:sk,style:'zskin',blot:'#4a5a3a'},fore:{base:sk,style:'zskin',blot:'#4a5a3a'},shin:{base:sk,style:'zskin',blot:'#4a5a3a'},skin:{base:sk,style:'zskin',blot:'#4a5a3a'},hand:{base:dk(sk,.2),style:'zskin',blot:'#3a4a10'},boot:{base:dk(sk,.3),style:'zskin'},jaw:{base:sk,style:'zskin',blot:'#4a5a3a'},
      sac:{base:'#7aa02a',style:'tumor'}},goreM);
    decor={torso:{front:[['soak',.2,1,'#5a8a10',.85],['rot',3],['ribs',.3,.45,.7,.85,5],['tear',3,17,sk],['grime',.5]],back:[['soak',.5,1,'#4a7a10',.6],['tear',2,18,sk],['grime',.5]],side:[['rot',1],['grime',.5]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#c8ff40',cheek:1,tears:1}],['soak',0,.35,'#5a8a10',.8]],top:[['wounds',1,19],['rot',1]],side:[['rot',1]],bottom:[['teethrow','bottom',.36]]},
      jaw:{top:[['teethrow','top',.36]],front:[['teethrow','top',.4],['soak',0,.8,'#5a8a10',.8],['drip',.5,.6,4,.9]],side:[['flesh',0,.2,1,.9,0]],bottom:[['soak',0,1,'#4a7a10',.8]]},
      neck:{all:[['veins',3,'#c8ff40',1],['rot',1]]},uaL:{all:[['rot',1]]},uaR:{all:[['veins',2,'#4a5a3a']]},faL:{all:[['flesh',.2,.3,.8,.8,1.57]]},faR:{all:[['rot',1],['soak',.3,1,'#5a8a10',.7]]},
      handL:{all:[['soak',0,1,'#4a7a10',.85]]},handR:{all:[['soak',0,1,'#4a7a10',.85]]},thL:{all:[['tear',2,19,sk]]},thR:{all:[['grime',.6]]},
      sac:{all:[['veins',4,'#d8f070',1],['glow',.36,.3,.64,.6,'#b8f040']]}};
    extra=H=>{const o=H.o,nY=H.piv[2][1];return [{n:'sac',b:2,c:[0,nY+.03,o.headZ-.1],s:[.2,.16,.15],m:'sac'},{n:'sac',b:2,c:[.05,nY-.05,o.headZ-.07],s:[.13,.1,.1],m:'sac'},{n:'sac',b:1,c:[-.06,nY-.12,-.12],s:[.1,.09,.07],m:'sac'}]}}
  // ▶ 구속복 좀비 (strait, 1챕터 「알레프」 · v6.91부터 플레이 가능: strait.js) — Q-7 격리병동 환자
  //    누런 구속복(가죽 띠 3줄, 등에 버클과 'Q7-W'), 가슴 앞에서 X자로 묶인 소매(움직임은 models.js poseZombie), 회청색 환자 바지, 맨발,
  //    꿰맨 자국이 있는 민머리, 입을 막은 가죽 마스크, 희뿌연 눈.
  else if(k==='strait'){// 구속체 — a Q-7 ward patient still in its straitjacket: sleeves strapped across the chest, a leather muzzle, shaved scalp
    o={hipY:.93,thigh:.44,legW:.13,legD:.14,shinW:.11,torsoW:.4,torsoH:.52,torsoD:.24,shX:.23,armW:.11,upper:.3,fore:.29,hand:.1,headW:.21,headH:.25,headD:.24,headZ:-.02,neck:.07,claw:.005,fingL:.4,curl:.9,curlJ:23,ears:[1,1]};
    const sk='#9aa08e',cv='#cfc6ac',st='#3a2c20';
    mats=Object.assign({top:{base:cv},legs:{base:'#5a6270'},sleeve:{base:cv},fore:{base:cv},shin:{base:'#5a6270'},skin:{base:sk,style:'zskin',blot:'#5a4a5a'},hand:{base:dk(cv,.12)},boot:{base:dk(sk,.15),style:'zskin'},
      jaw:{base:st},strap:{base:st,style:'plate',gloss:244},buckle:{base:'#a8a490',style:'plate',gloss:248}},goreM);
    decor={torso:{front:[['band',.22,.3,st],['band',.52,.6,st],['band',.8,.86,st],['soak',.3,1,'#5a0808',.55],['tear',2,23,cv],['grime',.7]],back:[['band',.22,.3,st],['band',.52,.6,st],['text','Q7-W',.32,.72,'#3a2c20'],['soak',.5,1,'#4a0606',.4],['grime',.7]],side:[['band',.22,.3,st],['band',.52,.6,st],['grime',.6]]},
      uaL:{all:[['band',.4,.5,st],['grime',.6]]},uaR:{all:[['band',.4,.5,st],['grime',.6]]},faL:{all:[['band',.55,.65,st],['soak',0,.5,'#4a0606',.5],['grime',.6]]},faR:{all:[['band',.55,.65,st],['grime',.6]]},
      handL:{all:[['grime',.8]]},handR:{all:[['grime',.8],['soak',0,1,'#4a0606',.4]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8ecd8',tears:1}],['rect',.12,.1,.88,.36,st],['rect',.45,.16,.55,.3,'#a8a490']],top:[['rect',0,0,1,1,dk(sk,.08)],['stitch',.2,.3,.8,.7],['wounds',1,23]],side:[['rect',0,.2,1,.32,st],['blood',1,23]],back:[['rect',0,.2,1,.32,st],['rect',.4,.18,.6,.34,'#a8a490']],bottom:[['teethrow','bottom',.3]]},
      jaw:{all:[['grime',.5]]},thL:{all:[['grime',.6],['soak',.5,1,'#4a0606',.4]]},thR:{all:[['grime',.6]]},pelvis:{fb:[['belt',.72,.92,st,'#a8a490']]},strap:{all:[['grime',.4]]}};
    // the strap that holds the sleeves crossed in front, three buckles down the back
    extra=H=>{const o=H.o,sY=H.piv[1][1],zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      const L=[{n:'strap',b:1,c:[0,sY+o.torsoH*.42,zf-.08],s:[o.torsoW*.95,.06,.035],m:'strap'}];
      for(let i=0;i<3;i++)L.push({n:'buckle',b:1,c:[0,sY+o.torsoH*(.26+i*.29),zb+.015],s:[.07,.05,.02],m:'buckle'});return L}}
  // ▶ 아르고스 (argus, 2챕터 보스 RT1-07) — 1차 회수팀 저격수가 감염된 모습 (게임이 1.3배로 키운다)
  //    길쭉하게 늘어난 팔다리, 찢어진 올리브 위장복 위에 길리 슈트 조각이 너덜너덜, 짙은 방탄조끼(탄창 주머니, 등에 'RT1-07'),
  //    얼굴에 박혀 버린 4안 야간투시경(검은 마운트 + 렌즈 통 4개 — 초록 렌즈 불빛은 게임이 따로 붙여서 하나씩 깨진다),
  //    회녹색 피부, 피에 젖은 턱, 장갑 낀 손에 갈고리처럼 자란 손톱. 등의 저격총도 게임이 붙인다.
  else if(k==='argus'){// 저격수 — RT-1's sniper: limbs drawn out long, rags of a ghillie suit, a four-tube night-vision rig grown into the face
    o={hipY:1.02,thigh:.49,legSep:.1,legW:.13,legD:.15,shinW:.115,torsoW:.4,torsoH:.55,torsoD:.22,shX:.235,armW:.1,upper:.35,fore:.35,hand:.115,headW:.22,headH:.25,headD:.25,headZ:-.05,neck:.1,
      claw:.045,fingL:.68,curl:.55,curlJ:13,ears:[1,1],eyeY:.42};
    const sk='#6c7462',cm=['#26301e','#5e6444'];
    mats=Object.assign({top:{base:'#465036',camo:cm},legs:{base:'#424a32',camo:cm},sleeve:{base:'#465036',camo:cm},fore:{base:sk,style:'zskin',blot:'#3a2a30'},shin:{base:'#424a32',camo:cm},
      skin:{base:sk,style:'zskin',blot:'#3a2a30'},hand:{base:'#2a2a24',style:'rubber'},boot:{base:'#2a241c',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a2a30'},
      vest:{base:'#2e3426',style:'plate',gloss:242},pouch:{base:'#363c2c'},nvg:{base:'#141618',style:'plate',gloss:246},tube:{base:'#1c1e20',style:'plate',gloss:247},
      ghil:{base:'#3a4228',camo:['#222a16','#5a5e36']},ghil2:{base:'#4a4a2c',camo:['#2a2c18','#6a6440']}},goreM);
    decor={torso:{front:[['tear',2,31,sk],['soak',.2,.7,'#4a0606',.6],['grime',.7]],back:[['tear',2,32,sk],['grime',.7]],side:[['grime',.6]]},
      vest:{front:[['pocket',.06,.08,.28,.48,'#262c1e'],['pocket',.36,.08,.64,.48,'#262c1e'],['pocket',.72,.08,.94,.48,'#262c1e'],['rect',.3,.66,.7,.86,'#22281c'],['blood',3,33],['grime',.5]],
        back:[['text','RT1-07',.18,.62,'#8a8e74'],['pocket',.22,.12,.78,.46,'#262c1e'],['grime',.5]],all:[['grime',.4]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#c8e870',tears:1,cheek:1}]],top:[['rect',0,0,1,1,'#1c1e18'],['wounds',1,34]],side:[['rect',0,.45,.55,1,'#1c1e18'],['blood',1,35]],back:[['rect',0,.4,1,1,'#1c1e18']],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.4],['drip',.5,.5,4,.8]],bottom:[['soak',0,1,'#4a0606',.85]]},
      uaL:{all:[['text','RT-1',.18,.7,'#8a8e74'],['tear',1,36,sk],['grime',.6]]},uaR:{all:[['tear',2,37,sk],['blood',2,38],['grime',.6]]},
      faL:{all:[['veins',2,'#3a2a3a'],['gash',.2,.8,.6,.3,3,.1]]},faR:{all:[['veins',2,'#3a2a3a'],['soak',0,.5,'#4a0606',.6]]},
      thL:{all:[['tear',1,39,'#2a2a22'],['grime',.6]],side:[['pocket',.15,.35,.85,.7,'#363c2c']]},thR:{all:[['grime',.6],['soak',.4,1,'#4a0606',.5]]},
      pelvis:{fb:[['belt',.72,.94,'#1e2018','#6a6a5a']]},nvg:{all:[['out',0,0,1,1,'#2a2c2e']]},tube:{all:[['band',.82,.92,'#3a3c3e']]},ghil:{all:[['grime',.6]]},ghil2:{all:[['grime',.5]]}};
    // the plate carrier, the night-vision mount and its four tubes, and the ghillie rags hanging off the shoulders and the back
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      const L=[{n:'vest',b:1,c:[0,sY+o.torsoH*.56,0],s:[o.torsoW*1.1,o.torsoH*.72,o.torsoD*1.28],m:'vest'},
        {n:'pouch',b:1,c:[-.16,sY+o.torsoH*.3,zf-.05],s:[.08,.11,.05],m:'pouch'},{n:'pouch',b:1,c:[.16,sY+o.torsoH*.3,zf-.05],s:[.08,.11,.05],m:'pouch'},
        {n:'nvg',b:2,c:[0,hc[1]+.02,o.headZ-o.headD/2-.02],s:[.2,.07,.05],m:'nvg'}];
      // four tubes: two inner straight ahead, two outer splayed (the lens ends face forward, -z)
      for(const [x,y] of [[-.075,.0],[-.028,.012],[.028,.012],[.075,.0]])L.push({n:'tube',b:2,c:[x,hc[1]+y,o.headZ-o.headD/2-.085],s:[.038,.038,.1],m:'tube'});
      for(let i=0;i<9;i++){const a=i/9*Math.PI*2,r=o.torsoW*.55;L.push({n:i%2?'ghil':'ghil2',b:1,c:[Math.cos(a)*r*.9,sY+o.torsoH*(.82-hash2(i,1,41)*.25),zb*.6+Math.sin(a)*.04+.03],s:[.05,.16+hash2(i,2,41)*.12,.02],m:i%2?'ghil':'ghil2'})}
      for(const sd of [-1,1])for(let i=0;i<3;i++)L.push({n:i%2?'ghil':'ghil2',b:sd<0?3:5,c:[sd*(o.shX+.03),H.piv[3][1]-.06-i*.07,(i-1)*.03],s:[.03,.13,.04],m:i%2?'ghil':'ghil2'});
      return L}}
  // ▶ 1차 팀 분대원 좀비 (squad, 2·4챕터) — 감염된 1차 회수팀 대원
  //    올리브 위장 전투복(한쪽 소매가 찢겨 회녹색 팔이 드러남), 앞주머니 달린 방탄조끼, 무전기, 야간투시경 마운트만 남은 헬멧,
  //    깨진 고글, 피 묻은 입. 방탄조끼가 정면 총알을 30% 막는다(게임 쪽 규칙).
  else if(k==='squad'){// 분대원 — an infected RT-1 trooper: camo fatigues, a plate carrier, a helmet with an empty NVG mount, a radio
    o={hipY:.93,torsoW:.43,torsoD:.24,shX:.25,armW:.115,upper:.3,fore:.28,headW:.23,headH:.25,headD:.25,headZ:-.03,claw:.02,fingL:.52,curl:.5,curlJ:17,ears:[1,1]};
    const sk='#727a66',cm=['#2c3424','#646a48'];
    mats=Object.assign({top:{base:'#4a5438',camo:cm},legs:{base:'#465036',camo:cm},sleeve:{base:'#4a5438',camo:cm},fore:{base:'#4a5438',camo:cm},shin:{base:'#465036',camo:cm},
      skin:{base:sk,style:'zskin',blot:'#3a2a30'},hand:{base:'#2a2a24',style:'rubber'},boot:{base:'#2a241c',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a2a30'},
      vest:{base:'#5a5a3e',style:'plate',gloss:242},helm:{base:'#4a5038',style:'plate'},mount:{base:'#1a1c1e',style:'plate',gloss:246},radio:{base:'#262824',style:'plate'},gog:{base:'#202224'}},goreM);
    decor={torso:{front:[['tear',2,51,sk],['soak',.3,.9,'#4a0606',.7],['grime',.7]],back:[['tear',1,52,sk],['grime',.7]],side:[['grime',.6]]},
      vest:{front:[['pocket',.06,.06,.3,.45,'#4a4a32'],['pocket',.36,.06,.64,.45,'#4a4a32'],['pocket',.7,.06,.94,.45,'#4a4a32'],['blood',3,53],['grime',.5]],back:[['text','RT-1',.3,.62,'#2a2c20'],['pocket',.2,.2,.8,.6,'#4a4a32']],all:[['grime',.4]]},
      helm:{all:[['out',0,0,1,1,'#2e3424'],['grime',.5]]},gog:{front:[['rect',.05,.2,.45,.8,'#3a4048'],['rect',.55,.2,.95,.8,'#3a4048'],['px',.3,.5,'#c8d8e8']]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8d860',tears:1}]],side:[['blood',1,54]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]]},
      uaL:{all:[['text','RT-1',.18,.7,'#2a2c20'],['grime',.5]]},uaR:{all:[['tear',3,55,sk],['blood',2,56]]},faR:{all:[['rect',0,0,1,1,sk],['veins',2,'#3a2a3a'],['bite',.5,.5,.25]]},
      thL:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['grime',.6]]},thR:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['soak',.4,1,'#4a0606',.5]]},pelvis:{fb:[['belt',.72,.94,'#24261c','#7a7a6a']]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2;
      return [{n:'vest',b:1,c:[0,sY+o.torsoH*.56,0],s:[o.torsoW*1.1,o.torsoH*.72,o.torsoD*1.26],m:'vest'},{n:'helm',b:2,c:[0,hc[1]+o.headH*.42,o.headZ],s:[o.headW*1.18,o.headH*.46,o.headD*1.16],m:'helm'},
        {n:'mount',b:2,c:[0,hc[1]+o.headH*.5,o.headZ-o.headD*.62],s:[.07,.06,.05],m:'mount'},{n:'gog',b:2,c:[0,hc[1]+o.headH*.72,o.headZ-o.headD*.5],s:[.2,.05,.05],m:'gog'},
        {n:'radio',b:1,c:[.17,sY+o.torsoH*.86,zf+.02],s:[.06,.11,.045],m:'radio'},{n:'radio',b:1,c:[.19,sY+o.torsoH*.98,zf+.02],s:[.012,.14,.012],m:'mount'}]}}
  // ▶ 유충 좀비 (larva, 3·5챕터) — 몸속에 유충이 든 제철소 작업자
//    회청색 작업복(가슴에 '청운제철' 대신 'CW-2' 명찰, 반사띠), 노란 안전모, 부풀어 오른 등과 목덜미에 꿈틀대는 혹(희미하게 빛남),
//    피부를 뚫고 나온 흰 유충 몇 마리(목·팔·등), 짓무른 얼굴, 탁한 연두 눈. 죽으면 유충 떼가 터져 나온다(게임 쪽 규칙).
  else if(k==='larva'){// 숙주 작업자 — a steel-works hand carrying a brood: the back swollen into writhing lumps, grubs boring out through the skin
    o={hipY:.92,torsoW:.42,torsoD:.25,torsoH:.52,belly:.05,shX:.24,armW:.11,upper:.29,fore:.28,headW:.23,headH:.25,headD:.25,headZ:-.04,neck:.05,claw:.02,fingL:.55,curl:.5,curlJ:61,ears:[1,0]};
    const sk='#8a8a6a';
    mats=Object.assign({top:{base:'#3e4c5a'},legs:{base:'#3a4652'},sleeve:{base:'#3e4c5a'},fore:{base:sk,style:'zskin',blot:'#6a5a3a'},shin:{base:'#3a4652'},skin:{base:sk,style:'zskin',blot:'#6a5a3a'},
      hand:{base:dk(sk,.2),style:'zskin',blot:'#5a3a10'},boot:{base:'#2a2420',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#6a5a3a'},
      hat:{base:'#c8a01e',style:'plate',gloss:246},lump:{base:'#9a8a5a',style:'tumor'},grub:{base:'#e8e0c0',style:'plate',gloss:245},refl:{base:'#d8d8c8',style:'plate',gloss:250}},goreM);
    decor={torso:{front:[['band',.3,.36,'#d8d8c8'],['rect',.6,.62,.86,.74,'#d8d0b8'],['text','CW-2',.62,.72,'#2a2a2a'],['soak',.2,.7,'#4a3a10',.6],['tear',2,61,sk],['grime',.7]],
        back:[['band',.3,.36,'#d8d8c8'],['flesh',.12,.3,.88,.98,0],['veins',5,'#d8e070',1],['rot',3],['grime',.6]],side:[['band',.3,.36,'#d8d8c8'],['grime',.6]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#c8d870',tears:1,cheek:1}],['rot',2]],side:[['rot',1],['veins',2,'#d8e070',1]],back:[['veins',3,'#d8e070',1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a3a10',.8]]},
      neck:{all:[['veins',3,'#d8e070',1],['rot',1]]},uaL:{all:[['band',.5,.58,'#d8d8c8'],['grime',.6]]},uaR:{all:[['band',.5,.58,'#d8d8c8'],['tear',2,62,sk]]},
      faL:{all:[['rot',2],['veins',2,'#d8e070',1]]},faR:{all:[['gash',.2,.8,.6,.3,3,.1],['rot',1]]},thL:{all:[['grime',.7]]},thR:{all:[['grime',.7],['soak',.5,1,'#4a3a10',.5]]},
      pelvis:{fb:[['belt',.72,.92,'#1e1c18','#7a7a6a']]},hat:{all:[['grime',.5]],front:[['text','CW',.32,.4,'#2a2a2a']]},lump:{all:[['veins',3,'#e8f080',1],['glow',.4,.4,.6,.6,'#c8d860']]},grub:{all:[['band',.3,.36,'#b8b090'],['band',.6,.66,'#b8b090']]}};
    // the swollen back, a lump at the nape, the hard hat, grubs half out of the skin
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      return [{n:'lump',b:1,c:[.05,sY+o.torsoH*.62,zb+.07],s:[.34,.3,.18],m:'lump'},{n:'lump',b:1,c:[-.12,sY+o.torsoH*.32,zb+.05],s:[.2,.18,.12],m:'lump'},{n:'lump',b:2,c:[.04,H.piv[2][1]+.04,o.headZ+.13],s:[.16,.12,.1],m:'lump'},
        {n:'hat',b:2,c:[0,hc[1]+o.headH*.44,o.headZ-.01],s:[o.headW*1.2,o.headH*.4,o.headD*1.22],m:'hat'},{n:'hat',b:2,c:[0,hc[1]+o.headH*.26,o.headZ-o.headD*.62],s:[o.headW*1.1,.02,.08],m:'hat'},
        {n:'grub',b:1,c:[.16,sY+o.torsoH*.86,zb+.05],s:[.05,.05,.13],m:'grub'},{n:'grub',b:2,c:[-.08,H.piv[2][1]-.02,o.headZ+.14],s:[.04,.04,.11],m:'grub'},{n:'grub',b:4,c:[H.piv[4][0]-o.armW*.4,H.piv[4][1]-o.fore*.4,.05],s:[.04,.11,.04],m:'grub'},
        {n:'grub',b:1,c:[-.2,sY+o.torsoH*.5,zb+.03],s:[.11,.04,.04],m:'grub'}]}}
  // ▶ 장갑 고철 좀비 (scrap, 3챕터) — 고철을 몸에 두른 덩치 큰 작업자
//    가슴에 철사로 묶은 찌그러진 차 문짝(녹·파란 페인트), 등에 드럼통 뚜껑, 양팔에 쇠파이프 토시, 양동이를 엎어 쓴 투구(눈구멍),
//    무릎에 철판, 기름때 낀 갈색 작업복, 회색 피부, 주황 눈. 총알은 반만 들어가고 불·폭발은 두 배(게임 쪽 규칙).
  else if(k==='scrap'){// 고철 갑옷 — a big steel-works hand wearing what it found: a car door wired across the chest, a drum lid on the back, a bucket for a helmet
    o={hipY:.95,thigh:.44,legSep:.13,legW:.17,legD:.18,shinW:.15,torsoW:.52,torsoH:.56,torsoD:.3,belly:.04,shX:.31,armW:.14,upper:.31,fore:.3,hand:.13,headW:.23,headH:.25,headD:.25,headZ:-.03,neck:.03,claw:.02,curl:.55,curlJ:71,browH:.03};
    const sk='#7a7670';
    mats=Object.assign({top:{base:'#5a4a36'},legs:{base:'#4e4232'},sleeve:{base:'#5a4a36'},fore:{base:sk,style:'zskin',blot:'#4a3a32'},shin:{base:'#4e4232'},skin:{base:sk,style:'zskin',blot:'#4a3a32'},
      hand:{base:dk(sk,.25),style:'zskin',blot:'#3a1a10'},boot:{base:'#221c16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a3a32'},
      door:{base:'#3a5a7a',style:'plate',gloss:242},rust:{base:'#7a4422',style:'plate',gloss:241},lid:{base:'#5a5e60',style:'plate',gloss:244},pipe:{base:'#4a4a48',style:'plate',gloss:246},wire:{base:'#2a2a28',style:'plate',gloss:247}},goreM);
    decor={torso:{front:[['soak',.3,.9,'#2a1a10',.6],['grime',.8]],back:[['grime',.8]],side:[['grime',.8]]},
      door:{front:[['rect',.08,.55,.92,.92,'#1a2a3a'],['rect',.1,.58,.9,.9,'#3a4a5a'],['rot',3],['grime',.7],['rect',.7,.3,.86,.36,'#2a2a2a']],all:[['grime',.6]]},
      lid:{back:[['out',.1,.1,.9,.9,'#3a3e40'],['rot',2]],all:[['grime',.5]]},rust:{all:[['rot',3],['grime',.6]]},pipe:{all:[['band',.1,.16,'#2a2a28'],['band',.84,.9,'#2a2a28'],['grime',.5]]},
      head:{front:[['face','brute',{skin:sk,eye:eyeH||'#ffa030',tears:1}]],side:[['blood',1,72]],bottom:[['teethrow','bottom',.32]]},
      jaw:{top:[['teethrow','top',.34]],front:[['teethrow','top',.4],['drip',.5,.5,3,.6]],bottom:[['soak',0,1,'#4a0606',.7]]},
      uaL:{all:[['grime',.7]]},uaR:{all:[['grime',.7],['tear',2,73,sk]]},thL:{all:[['grime',.7]]},thR:{all:[['grime',.7]]},pelvis:{fb:[['belt',.72,.94,'#1a1612','#6a6a5a']]}};
    // the door across the chest (wired on), the drum lid on the back, pipe bracers, a bucket helmet with an eye slot, knee plates
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      const L=[{n:'door',b:1,c:[0,sY+o.torsoH*.52,zf-.035],s:[o.torsoW*1.12,o.torsoH*.86,.045],m:'door'},{n:'wire',b:1,c:[0,sY+o.torsoH*.78,0],s:[o.torsoW*1.16,.02,o.torsoD*1.3],m:'wire'},
        {n:'wire',b:1,c:[0,sY+o.torsoH*.26,0],s:[o.torsoW*1.16,.02,o.torsoD*1.3],m:'wire'},{n:'lid',b:1,c:[0,sY+o.torsoH*.56,zb+.035],s:[o.torsoW*.9,o.torsoH*.8,.04],m:'lid'},
        {n:'rust',b:2,c:[0,hc[1]+o.headH*.2,o.headZ],s:[o.headW*1.24,o.headH*.9,o.headD*1.2],m:'rust'},{n:'wire',b:2,c:[0,hc[1]+o.headH*.08,o.headZ-o.headD*.61],s:[o.headW*.9,.035,.012],m:'wire'}];
      for(const [b,sd] of [[4,-1],[6,1]])L.push({n:'pipe',b,c:[H.piv[b][0]+sd*o.armW*.62,H.piv[b][1]-o.fore*.5,0],s:[.05,o.fore*.8,.05],m:'pipe'},{n:'pipe',b,c:[H.piv[b][0]-sd*o.armW*.62,H.piv[b][1]-o.fore*.5,.02],s:[.05,o.fore*.75,.05],m:'pipe'});
      for(const b of [8,10])L.push({n:'rust',b,c:[H.piv[b][0],H.piv[b][1]-.06,-o.legD*.62],s:[o.shinW*1.2,.18,.03],m:'rust'});
      return L}}
  // ▶ 라이어버드 (lyrebird, 4챕터 보스 RT1-05) — 1차 회수팀 통신병이 감염된 모습 (게임이 1.4배로 키우고 네발로 뛰게 한다)
  //    길고 마른 몸, 길게 늘어난 목, 창백한 청회색 피부에 검푸른 혈관, 찢어진 올리브 통신병 복장(가슴 끈 두 줄, 왼팔 'RT1-05'),
  //    머리에 파고든 헤드셋(밴드 + 귀덮개 + 송화 마이크), 어깨의 포자 구멍(곰팡이 혹, 희미하게 빛남), 하얗게 탁한 눈, 입술 없는 입.
  //    (목의 울음주머니와 등의 무전기 배낭은 게임이 따로 붙인다: lyrebird.js)
  else if(k==='lyrebird'){// 통신병 — RT-1's signaller: drawn out thin, the neck stretched long, a headset grown into the skull, spore vents on the shoulders
    o={hipY:1,thigh:.48,legSep:.1,legW:.12,legD:.14,shinW:.105,torsoW:.36,torsoH:.56,torsoD:.2,shX:.22,armW:.09,upper:.37,fore:.37,hand:.13,headW:.2,headH:.24,headD:.25,headZ:-.06,neck:.24,
      claw:.06,fingL:.72,curl:.45,curlJ:81,ears:[1,1],nose:false};
    const sk='#7e8a96',cm=['#2a3222','#5e6448'];
    mats=Object.assign({top:{base:'#4a5438',camo:cm},legs:{base:'#465036',camo:cm},sleeve:{base:'#4a5438',camo:cm},fore:{base:sk,style:'zskin',blot:'#2a3a5a'},shin:{base:'#465036',camo:cm},
      skin:{base:sk,style:'zskin',blot:'#2a3a5a'},hand:{base:dk(sk,.18),style:'zskin',blot:'#1a2a4a'},boot:{base:'#2a241c',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#2a3a5a'},
      strap:{base:'#262a20'},band:{base:'#18191a',style:'plate',gloss:246},cup:{base:'#202224',style:'rubber'},spore:{base:'#7a6e52',style:'tumor'}},goreM);
    decor={torso:{front:[['tear',2,81,sk],['veins',4,'#2a3a6a'],['soak',.4,.9,'#3a0a10',.5],['grime',.7]],back:[['tear',2,82,sk],['grime',.7]],side:[['veins',2,'#2a3a6a'],['grime',.6]]},
      neck:{all:[['veins',5,'#2a3a6a'],['flesh',.2,.1,.8,.4,0]]},
      head:{front:[['face','runner',{skin:sk,eye:eyeH||'#e8f4ff',tears:1,lipless:1}]],top:[['rect',0,0,1,1,'#1a1c20'],['wounds',1,83]],side:[['rect',0,.45,.5,1,'#1a1c20'],['veins',2,'#2a3a6a']],back:[['rect',0,.4,1,1,'#1a1c20']],bottom:[['teethrow','bottom',.38]]},
      jaw:{top:[['teethrow','top',.42]],front:[['teethrow','top',.5],['drip',.5,.5,3,.7]],bottom:[['soak',0,1,'#3a0a10',.7]],side:[['flesh',0,.2,1,.9,0]]},
      uaL:{all:[['text','RT1-05',.1,.7,'#2a2c20'],['grime',.5]]},uaR:{all:[['tear',3,84,sk],['veins',2,'#2a3a6a']]},faL:{all:[['veins',2,'#2a3a6a']]},faR:{all:[['gash',.2,.8,.6,.3,3,.1],['veins',2,'#2a3a6a']]},
      thL:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['grime',.6]]},thR:{all:[['tear',2,85,'#2a2a22'],['grime',.6]]},pelvis:{fb:[['belt',.72,.94,'#24261c','#7a7a6a']]},
      strap:{all:[['grime',.5]]},spore:{all:[['veins',3,'#c8d878',1],['glow',.35,.35,.65,.65,'#a8c868'],['rot',2]]}};
    // the radio harness's two chest straps, the headset (band, ear cups, the boom mic), the fungal vents on the shoulders
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2;const L=[];
      for(const sd of [-1,1])L.push({n:'strap',b:1,c:[sd*.1,sY+o.torsoH*.55,zf-.012],s:[.05,o.torsoH*.95,.02],m:'strap'});
      L.push({n:'band',b:2,c:[0,hc[1]+o.headH*.5,o.headZ+.01],s:[o.headW*1.12,.035,.05],m:'band'});
      for(const sd of [-1,1])L.push({n:'cup',b:2,c:[sd*(o.headW*.56),hc[1]+o.headH*.05,o.headZ+.01],s:[.05,.1,.09],m:'cup'});
      L.push({n:'band',b:2,c:[-o.headW*.45,hc[1]-o.headH*.2,o.headZ-o.headD*.42],s:[.02,.02,.16],m:'band'});
      for(const sd of [-1,1]){const b=sd<0?3:5;L.push({n:'spore',b,c:[H.piv[b][0]+sd*.02,H.piv[b][1]+.07,.02],s:[.14,.1,.15],m:'spore'},{n:'spore',b,c:[H.piv[b][0]+sd*.05,H.piv[b][1]+.02,-.05],s:[.08,.07,.08],m:'spore'})}
      return L}}
  // ▶ 통신병 좀비 (radioman, 4챕터) — 무전기를 멘 1차 회수팀 통신 지원 대원
  //    올리브 위장복, 등에 큰 무전기 배낭(안테나 두 개, 다이얼), 한쪽 귀에 헤드셋, 챙 넓은 정글모, 회녹색 피부, 노란 눈.
  //    살아 있으면 무전기가 지직거리고, 죽이면 역탐지로 라이어버드 위치가 보인다(게임 쪽 규칙).
  else if(k==='radioman'){// 통신 지원병 — an infected RT-1 radio operator: a big radio pack with two whips, a headset, a boonie hat
    o={hipY:.93,torsoW:.42,torsoD:.24,shX:.25,armW:.11,upper:.3,fore:.28,headW:.23,headH:.25,headD:.25,headZ:-.03,claw:.02,fingL:.52,curl:.5,curlJ:91,ears:[1,1]};
    const sk='#6e7a6a',cm=['#2c3424','#646a48'];
    mats=Object.assign({top:{base:'#4a5438',camo:cm},legs:{base:'#465036',camo:cm},sleeve:{base:'#4a5438',camo:cm},fore:{base:sk,style:'zskin',blot:'#3a2a30'},shin:{base:'#465036',camo:cm},
      skin:{base:sk,style:'zskin',blot:'#3a2a30'},hand:{base:'#2a2a24',style:'rubber'},boot:{base:'#2a241c',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a2a30'},
      pack:{base:'#3e4430',style:'plate',gloss:242},dial:{base:'#1a1c1a',style:'plate',gloss:246},hat:{base:'#4e5638',camo:cm},ant:{base:'#141414',style:'plate',gloss:247},cup:{base:'#202224',style:'rubber'}},goreM);
    decor={torso:{front:[['tear',2,91,sk],['soak',.3,.9,'#4a0606',.7],['grime',.7]],back:[['grime',.7]],side:[['grime',.6]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8d860',tears:1}]],side:[['blood',1,92]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]]},
      uaL:{all:[['text','RT-1',.18,.7,'#2a2c20'],['grime',.5]]},uaR:{all:[['tear',2,93,sk],['blood',2,94]]},thL:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['grime',.6]]},thR:{all:[['soak',.4,1,'#4a0606',.5]]},
      pelvis:{fb:[['belt',.72,.94,'#24261c','#7a7a6a']]},pack:{back:[['rect',.12,.18,.88,.5,'#2a2e22'],['text','PRC-77',.16,.74,'#9a9a80'],['grime',.5]],all:[['grime',.5]]},
      dial:{all:[['px',.3,.4,'#ffb040'],['px',.7,.4,'#40ff70']]},hat:{all:[['grime',.5]]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      return [{n:'pack',b:1,c:[0,sY+o.torsoH*.5,zb+.11],s:[o.torsoW*.9,o.torsoH*.72,.2],m:'pack'},{n:'dial',b:1,c:[.1,sY+o.torsoH*.9,zb+.12],s:[.14,.05,.12],m:'dial'},
        {n:'ant',b:1,c:[-.12,sY+o.torsoH*1.32,zb+.14],s:[.012,.6,.012],m:'ant'},{n:'ant',b:1,c:[.13,sY+o.torsoH*1.18,zb+.16],s:[.01,.4,.01],m:'ant'},
        {n:'hat',b:2,c:[0,hc[1]+o.headH*.42,o.headZ],s:[o.headW*1.12,o.headH*.34,o.headD*1.12],m:'hat'},{n:'hat',b:2,c:[0,hc[1]+o.headH*.3,o.headZ],s:[o.headW*1.7,.02,o.headD*1.7],m:'hat'},
        {n:'cup',b:2,c:[o.headW*.56,hc[1]+o.headH*.04,o.headZ+.01],s:[.05,.1,.09],m:'cup'}]}}
  // ▶ 포자 좀비 (spore, 4챕터) — 곰팡이 포자에 뒤덮인 기지 근무자
  //    부풀어 오른 몸, 등·어깨·머리에 돋은 버섯갓과 포자 주머니(희미한 연둣빛), 회색 근무복(가슴에 'UMB-04' 명찰), 곰팡이 핀 회백색 피부,
  //    뿌옇게 흐린 눈. 터지면 그 자리 안개가 짙어진다(게임 쪽 규칙).
  else if(k==='spore'){// 포자 숙주 — a station hand gone to mould: bloated, mushroom caps on the back and the head, glowing spore pods
    o={hipY:.9,torsoW:.46,torsoD:.28,torsoH:.52,belly:.08,shX:.27,armW:.12,upper:.29,fore:.27,headW:.24,headH:.25,headD:.25,headZ:-.02,neck:.04,claw:.02,fingL:.5,curl:.55,curlJ:95,ears:[1,0]};
    const sk='#a8a89a';
    mats=Object.assign({top:{base:'#6a6e6a'},legs:{base:'#4a4e4c'},sleeve:{base:'#6a6e6a'},fore:{base:sk,style:'zskin',blot:'#6a7a4a'},shin:{base:'#4a4e4c'},skin:{base:sk,style:'zskin',blot:'#6a7a4a'},
      hand:{base:dk(sk,.2),style:'zskin',blot:'#4a5a2a'},boot:{base:'#262422',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#6a7a4a'},
      cap:{base:'#c8b88a',style:'plate',gloss:243},stem:{base:'#d8d0b8'},pod:{base:'#9aa86a',style:'tumor'}},goreM);
    decor={torso:{front:[['rect',.58,.6,.88,.72,'#d8d4c8'],['text','UMB-04',.6,.7,'#2a2a2a'],['rot',3],['veins',3,'#c8e070',1],['grime',.7]],back:[['rot',4],['veins',4,'#c8e070',1],['grime',.6]],side:[['rot',2],['grime',.6]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#d8dcc8',tears:1,cheek:1}],['rot',2]],side:[['rot',2]],top:[['rot',2]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.36],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#3a4a1a',.7]]},
      uaL:{all:[['rot',2],['grime',.6]]},uaR:{all:[['rot',2],['grime',.6]]},faL:{all:[['rot',2]]},faR:{all:[['rot',1],['gash',.2,.8,.6,.3,3,.1]]},thL:{all:[['grime',.7]]},thR:{all:[['grime',.7]]},
      pelvis:{fb:[['belt',.72,.92,'#1e1c18','#7a7a6a']]},cap:{all:[['grime',.4]],bottom:[['rect',0,0,1,1,'#8a7a5a']]},pod:{all:[['veins',3,'#e0f080',1],['glow',.35,.35,.65,.65,'#c8e070']]}};
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zb=o.belly*.25+(o.torsoD+o.belly)/2;const L=[];
      for(const [x,y,w] of [[-.1,.78,.22],[.12,.5,.18],[-.04,.3,.14]])L.push({n:'stem',b:1,c:[x,sY+o.torsoH*y,zb+.04],s:[.04,.05,.06],m:'stem'},{n:'cap',b:1,c:[x,sY+o.torsoH*y+.03,zb+.08],s:[w,.04,w*.8],m:'cap'});
      L.push({n:'cap',b:2,c:[.05,hc[1]+o.headH*.56,o.headZ+.02],s:[.18,.04,.16],m:'cap'},{n:'stem',b:2,c:[.05,hc[1]+o.headH*.5,o.headZ+.02],s:[.04,.04,.04],m:'stem'});
      for(const sd of [-1,1]){const b=sd<0?3:5;L.push({n:'pod',b,c:[H.piv[b][0]+sd*.03,H.piv[b][1]+.06,.03],s:[.15,.12,.15],m:'pod'})}
      L.push({n:'pod',b:1,c:[.16,sY+o.torsoH*.66,zb+.06],s:[.14,.14,.12],m:'pod'});return L}}
  // ▶ 익사체 좀비 (drowned, 5챕터) — 방수로에 빠져 죽은 시설 관리 작업자
  //    물에 불어 퉁퉁 부은 몸, 쭈글쭈글한 청회색 피부(손끝·입가가 퍼렇게 죽음), 찢어진 주황 우비(반사띠 두 줄, 등에 '새벽천 관리' 대신 'SB-3'),
  //    가슴까지 오는 짙은 초록 고무 작업복(멜빵 두 줄), 등에 늘어진 우비 모자, 어깨·팔·머리에 엉겨 늘어진 물풀, 이마에 들러붙은 검은 머리,
  //    가슴에 매달린 꺼진 손전등, 우윳빛으로 흐린 눈. 물속에서 기어 나와 발목을 잡는다(게임 쪽 규칙).
  else if(k==='drowned'){// 익사체 — a tunnel maintenance hand pulled out of the water: bloated, wrinkled blue-grey skin, a torn orange raincoat over chest waders, weed hanging off it
    o={hipY:.9,torsoW:.46,torsoD:.27,torsoH:.52,belly:.08,shX:.26,armW:.125,upper:.29,fore:.28,hand:.13,headW:.245,headH:.26,headD:.26,headZ:-.02,neck:.05,claw:.02,fingL:.55,curl:.35,curlJ:101,ears:[1,1]};
    const sk='#8a9c98';
    mats=Object.assign({top:{base:'#d0661c'},legs:{base:'#24382c',style:'rubber'},sleeve:{base:'#d0661c'},fore:{base:sk,style:'zskin',blot:'#4a5a7a'},shin:{base:'#24382c',style:'rubber'},
      skin:{base:sk,style:'zskin',blot:'#4a5a7a'},hand:{base:dk(sk,.12),style:'zskin',blot:'#3a4a7a'},boot:{base:'#1a2620',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a5a7a'},
      coat:{base:'#c05e1a'},strap:{base:'#1e3024',style:'rubber'},weed:{base:'#3a5a2c',style:'hair'},hair:{base:'#141814',style:'hair'},lamp:{base:'#2a2c2a',style:'plate',gloss:246}},goreM);
    decor={torso:{front:[['rect',.18,0,.82,.5,'#24382c'],['band',.56,.62,'#e4e4cc'],['band',.76,.82,'#e4e4cc'],['tear',3,101,sk],['soak',0,1,'#1e2e2a',.45],['grime',.8]],
        back:[['band',.56,.62,'#e4e4cc'],['band',.76,.82,'#e4e4cc'],['text','SB-3',.3,.5,'#1a1a1a'],['tear',2,102,sk],['soak',0,1,'#1e2e2a',.4],['grime',.8]],side:[['band',.56,.62,'#e4e4cc'],['grime',.7]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#dfe8e6',cheek:1}],['rect',.15,.86,.55,1,'#141814'],['rot',1]],top:[['rect',0,0,1,1,'#141814']],side:[['rect',0,.55,1,1,'#141814'],['veins',2,'#3a4a7a']],back:[['rect',0,.3,1,1,'#141814']],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.36],['rect',0,.55,1,.75,'#3a4a6a']],bottom:[['soak',0,1,'#2a3a3a',.7]]},
      neck:{all:[['veins',3,'#3a4a7a'],['rot',1]]},uaL:{all:[['band',.4,.48,'#e4e4cc'],['tear',2,103,sk],['grime',.6]]},uaR:{all:[['band',.4,.48,'#e4e4cc'],['grime',.6]]},
      faL:{all:[['veins',3,'#3a4a7a'],['rot',1]]},faR:{all:[['gash',.2,.8,.6,.3,3,.1],['veins',2,'#3a4a7a']]},handL:{all:[['rect',0,0,1,.3,'#3a4a6a']]},handR:{all:[['rect',0,0,1,.3,'#3a4a6a']]},
      thL:{all:[['grime',.8]]},thR:{all:[['grime',.8],['tear',1,104,'#141c16']]},pelvis:{fb:[['rect',0,0,1,1,'#24382c'],['grime',.7]]},
      coat:{all:[['grime',.6],['band',.2,.26,'#e4e4cc']]},strap:{all:[['grime',.4]]},weed:{all:[['grime',.3]]},lamp:{front:[['out',.2,.2,.8,.8,'#6a6c66'],['rect',.3,.3,.7,.7,'#4a5052']]}};
    // the raincoat hood hanging down the back, the waders' two straps, weed tangled on the shoulders, arms and head, a dead torch on the chest
    extra=H=>{const o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2;const L=[];
      L.push({n:'coat',b:1,c:[0,nY-.07,zb+.07],s:[.26,.15,.1],m:'coat'});
      for(const sd of [-1,1])L.push({n:'strap',b:1,c:[sd*.12,sY+o.torsoH*.72,zf-.012],s:[.045,o.torsoH*.56,.02],m:'strap'});
      for(const sd of [-1,1]){const b=sd<0?3:5;L.push({n:'weed',b,c:[H.piv[b][0]+sd*.05,H.piv[b][1]-.08,.06],s:[.03,.26,.03],m:'weed'},{n:'weed',b,c:[H.piv[b][0]+sd*.02,H.piv[b][1]-.03,-.05],s:[.025,.16,.025],m:'weed'})}
      L.push({n:'weed',b:4,c:[H.piv[4][0]-o.armW*.5,H.piv[4][1]-o.fore*.45,.04],s:[.025,.22,.025],m:'weed'},{n:'weed',b:2,c:[o.headW*.42,hc[1]-.02,o.headZ+.06],s:[.03,.2,.03],m:'weed'},
        {n:'weed',b:2,c:[-o.headW*.2,hc[1]+o.headH*.36,o.headZ+o.headD*.4],s:[.03,.22,.03],m:'weed'},{n:'lamp',b:1,c:[-.13,sY+o.torsoH*.66,zf-.04],s:[.06,.09,.06],m:'lamp'});
      return L}}
  // ▶ 방호복 연구원 좀비 (hazmat, 5챕터) — 원종 실험실의 Q7 연구원
  //    오염 얼룩이 번진 회백색 방호복(가슴 'Q7-LAB' 명찰, 팔에 노란 띠), 파란 고무장갑, 흰 장화, 깨져 테두리만 남은 안면창과 머리를 감싼 후드,
  //    등에 멘 포자 가스통(연두색으로 희미하게 빛나는 게이지 창, 후드로 이어진 호스), 창백한 잿빛 얼굴, 연두빛 눈.
  //    쓰러지면 등의 가스통이 터져 포자 구름이 퍼진다(게임 쪽 규칙).
  else if(k==='hazmat'){// 방호복 연구원 — a Q7 researcher in a stained hazmat suit: the visor smashed out of its frame, a glowing spore tank on the back
    o={hipY:.93,torsoW:.44,torsoD:.26,torsoH:.52,belly:.04,shX:.25,armW:.12,upper:.3,fore:.28,hand:.12,legW:.16,legD:.17,shinW:.14,headW:.23,headH:.25,headD:.25,headZ:-.03,neck:.05,claw:.015,fingL:.5,curl:.55,curlJ:111,ears:[0,0]};
    const sk='#9a9a8e',su='#d4d8ce';
    mats=Object.assign({top:{base:su},legs:{base:su},sleeve:{base:su},fore:{base:su},shin:{base:'#d8dcd0',style:'rubber'},skin:{base:sk,style:'zskin',blot:'#5a6a3a'},
      hand:{base:'#2c4a6a',style:'rubber'},boot:{base:'#c8ccc0',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#5a6a3a'},
      hood:{base:su},frame:{base:'#2a2c2c',style:'rubber'},tank:{base:'#5a6a5e',style:'plate',gloss:245},hose:{base:'#1e2020',style:'rubber'},gauge:{base:'#a8e070'}},goreM);
    decor={torso:{front:[['zip',.5],['rect',.58,.66,.9,.78,'#e8e8e0'],['text','Q7',.62,.76,'#2a2a2a'],['rot',3],['veins',3,'#a8d060',1],['soak',.2,.7,'#4a5a2a',.5],['grime',.7]],
        back:[['rot',2],['grime',.6]],side:[['rot',2],['grime',.6]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#b8f070',tears:1}],['rot',1]],side:[['rot',1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#3a4a1a',.7]]},
      uaL:{all:[['band',.55,.68,'#d8b020'],['rot',1],['grime',.5]]},uaR:{all:[['band',.55,.68,'#d8b020'],['tear',2,112,sk],['grime',.5]]},
      faL:{all:[['rot',2],['grime',.6]]},faR:{all:[['soak',0,.6,'#4a0606',.6],['grime',.6]]},thL:{all:[['rot',1],['grime',.7]]},thR:{all:[['soak',.3,1,'#4a5a2a',.5],['grime',.7]]},
      pelvis:{fb:[['belt',.72,.9,'#3a3c3a','#8a8c88']]},hood:{all:[['rot',2],['grime',.5]]},frame:{all:[['grime',.3]]},
      tank:{back:[['band',.82,.9,'#d8b020'],['text','BIO',.2,.7,'#1a1a1a']],all:[['grime',.5],['rot',1]]},gauge:{all:[['glow',0,0,1,1,'#a8e070'],['veins',2,'#e8ff9a',1]]}};
    // the hood round the head (open at the face), the broken visor's frame, the spore tank with its glowing window, the hose to the hood
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,zb=o.belly*.25+(o.torsoD+o.belly)/2,fz=o.headZ-o.headD*.56,W=o.headW,Hh=o.headH;
      const L=[{n:'hood',b:2,c:[0,hc[1]+Hh*.56,o.headZ+.01],s:[W*1.34,.06,o.headD*1.3],m:'hood'},{n:'hood',b:2,c:[0,hc[1]+.01,o.headZ+o.headD*.6],s:[W*1.34,Hh*1.16,.06],m:'hood'}];
      for(const sd of [-1,1])L.push({n:'hood',b:2,c:[sd*W*.64,hc[1]+.01,o.headZ+.02],s:[.06,Hh*1.16,o.headD*1.2],m:'hood'},{n:'frame',b:2,c:[sd*W*.5,hc[1]+.01,fz],s:[.035,Hh*1.02,.04],m:'frame'});
      L.push({n:'frame',b:2,c:[0,hc[1]+Hh*.5,fz],s:[W*1.04,.035,.04],m:'frame'},{n:'frame',b:2,c:[0,hc[1]-Hh*.47,fz],s:[W*1.04,.04,.04],m:'frame'},
        {n:'tank',b:1,c:[0,sY+o.torsoH*.5,zb+.09],s:[.2,o.torsoH*.8,.16],m:'tank'},{n:'gauge',b:1,c:[0,sY+o.torsoH*.48,zb+.172],s:[.07,o.torsoH*.4,.012],m:'gauge'},
        {n:'hose',b:1,c:[.12,sY+o.torsoH*.98,zb+.06],s:[.03,.03,.14],m:'hose'});
      return L}}
  // ▶ 소방관 좀비 (fireman, 플레이 가능) — 불길 속에서 감염된 진압대원
  //    그을리고 찢어진 황갈색 방화복(몸통·소매·장화 위에 형광 연두+은색 반사띠, 등에 'FD07'), 검은 고무 장화, 허리에 호흡기 벨트,
  //    등에 공기호흡기 등판과 어깨끈, 가슴에 늘어진 면체(마스크)와 호스, 짙은 붉은 헬멧(뒤로 긴 챙, 앞에 금테 두른 가죽 휘장 '07'),
  //    불에 그을린 잿빛 피부에 숯불처럼 빛나는 금(주황 혈관), 주황 눈.  등의 산소통은 fireman.js 가 따로 붙인다(돌진할 때 앞으로 든다).
  else if(k==='fireman'){// 진압대원 — a firefighter infected in the blaze: scorched turnout coat with reflective bands, red helmet, charred skin cracked like embers
    o={hipY:.95,thigh:.43,legW:.17,legD:.19,shinW:.155,torsoW:.48,torsoH:.52,torsoD:.3,belly:.03,shX:.27,armW:.135,upper:.3,fore:.28,hand:.12,headW:.23,headH:.25,headD:.25,headZ:-.02,neck:.05,claw:.022,fingL:.52,curl:.5,curlJ:121,ears:[0,0],browH:.03};
    const sk='#5e4c42',co='#8a6c3e',rf='#c8dc3a',sv='#c4c8c8',em='#ff7a28';
    mats=Object.assign({top:{base:co},legs:{base:dk(co,.06)},sleeve:{base:co},fore:{base:co},shin:{base:'#1a1816',style:'rubber'},skin:{base:sk,style:'zskin',blot:'#2a1410'},
      hand:{base:dk(sk,.15),style:'zskin',blot:'#2a1410'},boot:{base:'#141210',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#2a1410'},
      helm:{base:'#7a1c14',style:'plate',gloss:244},badge:{base:'#2a1612',style:'plate',gloss:240},strap:{base:'#1c1c1c',style:'rubber'},mask:{base:'#22262a',style:'rubber'},
      plate:{base:'#2c2e30',style:'plate',gloss:242},collar:{base:dk(co,.1)}},goreM);
    const RB=(v0,v1)=>[['band',v0,v1,rf],['band',v0+(v1-v0)*.36,v1-(v1-v0)*.36,sv]];// a reflective band: lime with a silver stripe through it
    decor={torso:{front:[['vband',.45,.55,dk(co,.18)],...RB(.06,.15),...RB(.56,.65),['tear',3,121,sk],['rot',2],['veins',3,em,1],['soak',.1,.55,'#3a0606',.5],['grime',.95]],
        back:[...RB(.06,.15),...RB(.56,.65),['text','FD07',.3,.84,rf],['tear',2,122,sk],['grime',.95]],side:[...RB(.06,.15),...RB(.56,.65),['grime',.9]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#ff9a30',cheek:1}],['veins',3,em,1],['rot',1]],side:[['veins',2,em,1],['rot',1]],back:[['rot',1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.36],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#2a0606',.7]]},
      neck:{all:[['veins',2,em,1],['rot',1]]},
      uaL:{all:[...RB(.55,.68),['tear',1,123,sk],['grime',.8]]},uaR:{all:[...RB(.55,.68),['grime',.8]]},
      faL:{all:[...RB(.08,.2),['grime',.85],['rot',1]]},faR:{all:[...RB(.08,.2),['tear',1,124,sk],['grime',.85]]},
      handL:{all:[['veins',2,em,1],['soak',0,.4,'#3a0606',.6]]},handR:{all:[['veins',2,em,1],['soak',0,.4,'#3a0606',.6]]},
      thL:{all:[['grime',.9],['tear',1,125,sk]]},thR:{all:[['grime',.9],['rot',1]]},shL:{all:[...RB(.82,.94),['grime',.5]]},shR:{all:[...RB(.82,.94),['grime',.5]]},
      pelvis:{fb:[['belt',.72,.92,'#1c1c1c','#8a8a88'],['grime',.8]]},
      helm:{all:[['grime',.75],['rot',1]],side:[['band',.3,.5,rf]]},badge:{front:[['out',0,0,1,1,'#c8a648'],['out',.08,.06,.92,.94,'#c8a648'],['text','07',.22,.64,'#d8b858']],all:[['grime',.4]]},
      strap:{all:[['grime',.5]]},mask:{front:[['rect',.18,.42,.82,.88,'#3a4a52'],['out',.18,.42,.82,.88,'#101214']],all:[['grime',.4]]},plate:{all:[['grime',.6]]},collar:{all:[['grime',.9]]}};
    // the helmet (dome, comb, a brim longer at the back, the shield on the front), the turned-up collar, the breathing set's back plate and
    // harness (two straps down the front and over the shoulders), the face mask hanging on the chest with its hose
    extra=H=>{const o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],hc=H.headC,W=o.headW,Hh=o.headH,zf=o.belly*.25-(o.torsoD+o.belly)/2,zb=o.belly*.25+(o.torsoD+o.belly)/2;
      const L=[{n:'helm',b:2,c:[0,hc[1]+Hh*.5,o.headZ+.012],s:[W*1.2,.13,o.headD*1.18],m:'helm'},{n:'helm',b:2,c:[0,hc[1]+Hh*.6,o.headZ+.012],s:[.045,.075,o.headD*1.12],m:'helm'},
        {n:'helm',b:2,c:[0,hc[1]+Hh*.33,o.headZ+o.headD*.22],s:[W*1.5,.026,o.headD*1.62],m:'helm'},
        {n:'badge',b:2,c:[0,hc[1]+Hh*.64,o.headZ-o.headD*.62],s:[.09,.125,.02],m:'badge'},
        {n:'collar',b:1,c:[0,nY-.02,o.headZ+.03],s:[.32,.09,.3],m:'collar'},
        {n:'plate',b:1,c:[0,sY+o.torsoH*.52,zb+.018],s:[.26,o.torsoH*.86,.03],m:'plate'},
        {n:'mask',b:1,c:[0,sY+o.torsoH*.8,zf-.055],s:[.17,.14,.08],m:'mask'},{n:'strap',b:1,c:[-.1,sY+o.torsoH*.96,zf-.035],s:[.03,.03,.12],m:'strap'}];
      for(const sd of [-1,1])L.push({n:'strap',b:1,c:[sd*.12,sY+o.torsoH*.56,zf-.016],s:[.055,o.torsoH*.8,.022],m:'strap'},{n:'strap',b:1,c:[sd*.12,sY+o.torsoH*1.0,0],s:[.055,.022,o.torsoD+.04],m:'strap'});
      return L}}
  // ▶ 레가투스 (legatus, 6챕터 보스 RT1-01) — 감염된 1차 회수팀 대장 (게임이 1.25배로 키운다)
  //    어깨가 넓은 큰 몸, 올리브 전투복 위에 눈 묻은 흰 겨울 위장 덧옷, 지휘관용 방탄조끼(가슴에 대장 명패 '01', 등에 'RT1-01'),
  //    목에 걸린 부하들의 군번줄 다발 — 아직 아무도 잃지 않았다고 믿는다, 오른팔에 검은 완장, 고글을 얹은 흰 위장 헬멧(앞에 대장 표식 흰 띠 두 줄),
  //    목에 감은 검은 방한 목도리, 서리 앉은 청회색 피부, 흐린 은빛 눈. 등의 무전기와 소총·유탄발사기·기관총은 게임이 따로 붙인다(legatus.js).
  else if(k==='legatus'){// 대장 — RT-1's leader: a big frame in a snow smock over a commander's plate carrier, his squad's dog tags round his neck
    o={hipY:.97,thigh:.46,legSep:.12,legW:.15,legD:.17,shinW:.13,torsoW:.48,torsoH:.56,torsoD:.27,belly:.02,shX:.28,armW:.125,upper:.32,fore:.3,hand:.125,headW:.23,headH:.26,headD:.25,headZ:-.03,neck:.07,
      claw:.02,fingL:.52,curl:.45,curlJ:131,ears:[1,1],browH:.032};
    const sk='#7a868e',sm='#d4d8d4',cm=['#a8aeaa','#eef0ee'],od=['#2c3424','#5a6044'];
    mats=Object.assign({top:{base:sm,camo:cm},legs:{base:'#465036',camo:od},sleeve:{base:sm,camo:cm},fore:{base:'#4a5438',camo:od},shin:{base:'#465036',camo:od},
      skin:{base:sk,style:'zskin',blot:'#3a3a4a'},hand:{base:'#26261f',style:'rubber'},boot:{base:'#221e18',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a3a4a'},
      vest:{base:'#3e4430',style:'plate',gloss:242},pouch:{base:'#363c2c'},helm:{base:'#c8ccc8',style:'plate',gloss:243},gog:{base:'#202428',style:'plate',gloss:247},
      scarf:{base:'#1e2022'},tag:{base:'#c8ccc8',style:'plate',gloss:250},plate:{base:'#c8c4b0',style:'plate',gloss:244}},goreM);
    decor={torso:{front:[['tear',2,131,sk],['soak',.3,.85,'#4a0606',.5],['grime',.45]],back:[['tear',1,132,sk],['grime',.45]],side:[['grime',.4]]},
      vest:{front:[['pocket',.06,.06,.3,.42,'#2e3424'],['pocket',.36,.06,.64,.42,'#2e3424'],['pocket',.7,.06,.94,.42,'#2e3424'],['blood',2,133],['grime',.45]],
        back:[['text','RT1-01',.18,.62,'#c8ccc0'],['grime',.45]],all:[['grime',.35]]},
      helm:{all:[['grime',.4]],front:[['band',.55,.62,'#f4f4ec'],['band',.7,.77,'#f4f4ec']]},gog:{front:[['rect',.05,.2,.45,.8,'#4a5a66'],['rect',.55,.2,.95,.8,'#4a5a66']]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#d8e2ec',tears:1,cheek:1}]],side:[['blood',1,134]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]]},
      uaL:{all:[['text','RT-1',.18,.7,'#3a3e34'],['grime',.4]]},uaR:{all:[['band',.3,.44,'#141414'],['grime',.4]]},faL:{all:[['veins',2,'#3a3a5a'],['grime',.5]]},faR:{all:[['tear',2,135,sk],['blood',2,136]]},
      thL:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['grime',.55]]},thR:{side:[['pocket',.15,.35,.85,.7,'#3c4430']],all:[['soak',.4,1,'#4a0606',.45]]},
      pelvis:{fb:[['belt',.72,.94,'#24261c','#8a8a7a']]},scarf:{all:[['grime',.4]]},tag:{all:[['grime',.2]]},plate:{front:[['text','01',.2,.7,'#2a2a22']]}};
    // the plate carrier, the rank plate on it, the helmet with its goggles pushed up, the scarf round the neck, a fistful of dog tags on the chest
    extra=H=>{const o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],hc=H.headC,zf=o.belly*.25-(o.torsoD+o.belly)/2;
      const L=[{n:'vest',b:1,c:[0,sY+o.torsoH*.56,0],s:[o.torsoW*1.1,o.torsoH*.72,o.torsoD*1.26],m:'vest'},
        {n:'pouch',b:1,c:[-.17,sY+o.torsoH*.3,zf-.05],s:[.08,.11,.05],m:'pouch'},{n:'pouch',b:1,c:[.17,sY+o.torsoH*.3,zf-.05],s:[.08,.11,.05],m:'pouch'},
        {n:'plate',b:1,c:[-.12,sY+o.torsoH*.8,zf-.042],s:[.09,.04,.012],m:'plate'},
        {n:'helm',b:2,c:[0,hc[1]+o.headH*.42,o.headZ],s:[o.headW*1.2,o.headH*.48,o.headD*1.18],m:'helm'},
        {n:'gog',b:2,c:[0,hc[1]+o.headH*.62,o.headZ-o.headD*.42],s:[.21,.055,.06],m:'gog'},
        {n:'scarf',b:1,c:[0,nY-.02,o.headZ+.02],s:[.3,.1,.29],m:'scarf'}];
      for(let i=0;i<7;i++)L.push({n:'tag',b:1,c:[.02+i*.017,sY+o.torsoH*(.9-(i%3)*.05),zf-.04-(i%2)*.004],s:[.014,.024,.004],m:'tag'});
      return L}}
  // ▶ 방패병 좀비 (shield, 6챕터) — 감염된 1차 회수팀 돌파조 방패병
  //    짙은 회색 전투복, 어깨 보호대까지 덮는 무거운 방탄복(가슴 'RT-1', 등 'BREACH'), 바이저를 위로 젖힌 둥근 방탄모, 무릎 보호대,
  //    회녹색 피부, 노란 눈. 몸 앞의 방탄 방패는 게임이 따로 붙인다(legatus.js) — 정면 총알은 다 막는다(게임 쪽 규칙).
  else if(k==='shield'){// 방패병 — an infected RT-1 breacher: heavy armour with shoulder guards, a ballistic helmet with its visor pushed up
    o={hipY:.93,thigh:.44,legW:.15,legD:.17,shinW:.13,torsoW:.46,torsoH:.53,torsoD:.27,shX:.26,armW:.12,upper:.3,fore:.28,headW:.23,headH:.25,headD:.25,headZ:-.03,claw:.02,fingL:.5,curl:.55,curlJ:141,ears:[1,1]};
    const sk='#6e7868';
    mats=Object.assign({top:{base:'#3a3e40'},legs:{base:'#363a3c'},sleeve:{base:'#3a3e40'},fore:{base:'#3a3e40'},shin:{base:'#363a3c'},
      skin:{base:sk,style:'zskin',blot:'#3a2a30'},hand:{base:'#222220',style:'rubber'},boot:{base:'#1e1c18',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a2a30'},
      armor:{base:'#2c3032',style:'plate',gloss:242},helm:{base:'#2a2e30',style:'plate',gloss:244},visor:{base:'#1a2228',style:'plate',gloss:250},pad:{base:'#1e2022',style:'rubber'}},goreM);
    decor={torso:{front:[['tear',2,141,sk],['soak',.3,.9,'#4a0606',.6],['grime',.6]],back:[['grime',.6]],side:[['grime',.5]]},
      armor:{front:[['text','RT-1',.28,.7,'#8a8e86'],['pocket',.1,.06,.42,.36,'#24282a'],['pocket',.58,.06,.9,.36,'#24282a'],['blood',2,142],['grime',.45]],back:[['text','BREACH',.12,.62,'#8a8e86'],['grime',.45]],all:[['grime',.4]]},
      helm:{all:[['grime',.45]]},visor:{front:[['rect',.06,.1,.94,.9,'#2a3a46'],['px',.3,.35,'#8aa0b0']]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e8d860',tears:1}]],side:[['blood',1,143]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]]},
      uaL:{all:[['grime',.5]]},uaR:{all:[['tear',2,144,sk],['blood',2,145]]},thL:{all:[['grime',.6]]},thR:{all:[['soak',.4,1,'#4a0606',.5]]},pelvis:{fb:[['belt',.72,.94,'#1c1e1c','#6a6a6a']]},pad:{all:[['grime',.4]]}};
    // the armour (and its shoulder guards), the helmet, its visor pushed up, knee pads
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC;
      const L=[{n:'armor',b:1,c:[0,sY+o.torsoH*.56,0],s:[o.torsoW*1.12,o.torsoH*.76,o.torsoD*1.3],m:'armor'},
        {n:'helm',b:2,c:[0,hc[1]+o.headH*.4,o.headZ],s:[o.headW*1.22,o.headH*.52,o.headD*1.2],m:'helm'},
        {n:'visor',b:2,c:[0,hc[1]+o.headH*.64,o.headZ-o.headD*.56],s:[o.headW*1.12,o.headH*.24,.03],m:'visor'}];
      for(const sd of [-1,1]){const b=sd<0?3:5,kb=sd<0?8:10;L.push({n:'armor',b,c:[H.piv[b][0]+sd*.02,H.piv[b][1]-.02,0],s:[.17,.08,.19],m:'armor'},{n:'pad',b:kb,c:[sd*o.legSep,H.piv[kb][1]-.03,-.08],s:[.12,.12,.04],m:'pad'})}
      return L}}
  // ▶ 로렐라이 (lorelei, 7챕터 보스 RT1-03) — 감염된 1차 회수팀 협상 · 대피 유도 요원 (게임이 1.2배로 키운다)
  //    가늘고 긴 몸, 흰 겨울 위장 덧옷 위에 반사띠 두 줄을 두른 주황 형광 대피 유도 조끼(앞 'EVAC', 등 'RT1-03'),
  //    목 앞에 부풀어 오른 울음주머니(분홍빛 혈관이 어둠에서 빛난다 — 노래할 때는 게임이 더 밝힌다), 허리까지 늘어진 검은 머리,
  //    입술이 없어 드러난 이빨, 하얗게 흐린 눈과 피눈물, 왼팔 'RT-1' 패치, 오른팔 흰 완장. 허리의 확성기는 게임이 따로 붙인다(lorelei.js).
  else if(k==='lorelei'){// 협상 요원 — RT-1's negotiator: drawn long and thin, an orange evacuation vest over a snow smock, a swollen singing sac at the throat
    o={hipY:1,thigh:.47,legSep:.09,legW:.13,legD:.15,shinW:.11,torsoW:.37,torsoH:.52,torsoD:.21,shX:.22,armW:.095,upper:.33,fore:.33,hand:.12,headW:.21,headH:.25,headD:.23,headZ:-.03,neck:.15,
      claw:.045,fingL:.64,curl:.35,curlJ:151,ears:[0,0],nose:false};
    const sk='#a6b0b8',cm=['#b8bcb8','#eef0ee'];
    mats=Object.assign({top:{base:'#d8dcd8',camo:cm},legs:{base:'#c8ccc8',camo:cm},sleeve:{base:'#d8dcd8',camo:cm},fore:{base:sk,style:'zskin',blot:'#5a3a5a'},shin:{base:'#c8ccc8',camo:cm},
      skin:{base:sk,style:'zskin',blot:'#5a3a5a'},hand:{base:dk(sk,.15),style:'zskin',blot:'#4a1a2a'},boot:{base:'#26221e',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#5a3a5a'},
      vest:{base:'#e8681a',style:'plate',gloss:244},hair:{base:'#121216',style:'hair'},sac:{base:'#c8a0b4',style:'tumor'},band:{base:'#e8e8e0'}},goreM);
    decor={torso:{front:[['tear',2,151,sk],['soak',.35,.9,'#4a0612',.5],['grime',.4]],back:[['grime',.4]],side:[['grime',.35]]},
      vest:{front:[['band',.18,.26,'#d8dcdc'],['band',.48,.56,'#d8dcdc'],['text','EVAC',.24,.74,'#1a1a1a'],['blood',2,152],['grime',.35]],
        back:[['band',.18,.26,'#d8dcdc'],['band',.48,.56,'#d8dcdc'],['text','RT1-03',.14,.76,'#1a1a1a'],['grime',.35]],side:[['band',.18,.26,'#d8dcdc'],['band',.48,.56,'#d8dcdc']]},
      neck:{all:[['veins',5,'#e07ab0',1],['flesh',.25,.2,.75,.5,0]]},sac:{all:[['veins',4,'#ff8ac8',1],['glow',.32,.3,.68,.7,'#ff9ad2'],['rot',1]]},
      head:{front:[['face','runner',{skin:sk,eye:eyeH||'#f0f6ff',tears:1,lipless:1}],['rect',0,.86,1,1,'#121216']],top:[['rect',0,0,1,1,'#121216']],side:[['rect',0,.25,.7,1,'#121216']],back:[['rect',0,0,1,1,'#121216']],bottom:[['teethrow','bottom',.4]]},
      jaw:{top:[['teethrow','top',.44]],front:[['teethrow','top',.55],['drip',.5,.5,3,.7]],bottom:[['soak',0,1,'#4a0612',.7]],side:[['flesh',0,.2,1,.9,0]]},
      uaL:{all:[['text','RT-1',.16,.7,'#3a3e34'],['grime',.35]]},uaR:{all:[['band',.3,.46,'#e8e8e0'],['grime',.35]]},faL:{all:[['veins',2,'#7a4a7a']]},faR:{all:[['veins',2,'#7a4a7a'],['blood',2,153]]},
      thL:{side:[['pocket',.15,.35,.85,.7,'#a8aca8']],all:[['grime',.45]]},thR:{all:[['soak',.4,1,'#4a0612',.4]]},pelvis:{fb:[['belt',.72,.94,'#24261c','#8a8a7a']]},hair:{all:[['grime',.2]]}};
    // the vest, the singing sac under the jaw, the hair: a cap of it on the skull, a long fall down the back, two strands in front of the shoulders
    extra=H=>{const o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],hc=H.headC;
      return [{n:'vest',b:1,c:[0,sY+o.torsoH*.56,0],s:[o.torsoW*1.12,o.torsoH*.74,o.torsoD*1.3],m:'vest'},
        {n:'sac',b:2,c:[0,nY+o.neck*.45,o.headZ-o.headD*.32],s:[.13,.1,.1],m:'sac'},
        {n:'hair',b:2,c:[0,hc[1]+o.headH*.46,o.headZ+.012],s:[o.headW*1.1,.06,o.headD*1.08],m:'hair'},
        {n:'hair',b:2,c:[0,hc[1]-o.headH*.55,o.headZ+o.headD*.52],s:[o.headW*1.06,o.headH*1.9,.07],m:'hair'},
        {n:'hair',b:2,c:[-o.headW*.52,hc[1]-o.headH*.32,o.headZ-.01],s:[.045,o.headH*1.25,.09],m:'hair'},{n:'hair',b:2,c:[o.headW*.52,hc[1]-o.headH*.32,o.headZ-.01],s:[.045,o.headH*1.25,.09],m:'hair'},
        {n:'band',b:5,c:[H.piv[5][0]+.002,H.piv[5][1]-o.upper*.5,0],s:[o.armW*1.06,.05,o.armW*1.06],m:'band'}]}}
  // ▶ 청중 좀비 (listener, 7챕터) — 대피소에 있던 시민. 로렐라이의 방송을 듣고 모여들었다가 눈을 잃었다
  //    무릎까지 오는 남색 롱패딩(누빔 줄, 반쯤 열린 지퍼), 빨간 목도리, 손목의 노란 대피소 밴드, 두 눈을 감은 붕대(피가 배어 나옴),
  //    잿빛 피부, 헝클어진 머리. 눈이 없어 소리로만 쫓는다 — 고개를 기울이고 듣는 포즈는 게임이 준다(lorelei.js).
  else if(k==='listener'){// 청중 — a citizen from the shelter: a long padded coat, a scarf, the shelter's wristband, bandages over both eyes
    o={hipY:.92,thigh:.42,legW:.16,legD:.18,shinW:.14,torsoW:.46,torsoH:.52,torsoD:.3,belly:.02,shX:.27,armW:.14,upper:.29,fore:.28,headW:.23,headH:.26,headD:.25,headZ:-.02,claw:.022,fingL:.52,curl:.55,curlJ:161,ears:[1,1]};
    const sk='#7c807a',pc='#1e2a44';
    mats=Object.assign({top:{base:pc},legs:{base:'#2a2a30'},sleeve:{base:pc},fore:{base:pc},shin:{base:'#2a2a30'},skin:{base:sk,style:'zskin',blot:'#4a3a40'},hand:{base:dk(sk,.15),style:'zskin',blot:'#5a1a14'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a3a40'},scarf:{base:'#8a2228'},coat:{base:pc},wrist:{base:'#e8c820',style:'plate',gloss:246}},goreM);
    const quilt=[['band',.18,.21,'#141c30'],['band',.38,.41,'#141c30'],['band',.58,.61,'#141c30'],['band',.78,.81,'#141c30']];
    decor={torso:{front:quilt.concat([['zip',.5],['soak',.45,.95,'#4a0606',.45],['tear',1,161,'#d8d8d0'],['grime',.4]]),back:quilt.concat([['grime',.45]]),side:quilt.concat([['grime',.4]])},
      coat:{front:quilt.concat([['zip',.5],['grime',.5],['soak',0,.5,'#3a2a20',.4]]),back:quilt.concat([['grime',.5]]),side:quilt.concat([['grime',.45]])},
      uaL:{all:quilt.concat([['grime',.4]])},uaR:{all:quilt.concat([['tear',2,162,'#d8d8d0']])},faL:{all:[['grime',.5]]},faR:{all:[['blood',2,163],['grime',.4]]},
      head:{front:[['face','zombie',{skin:sk,eye:'#d8d8d0',tears:1}],['band',.42,.64,'#e4e0d4'],['blood',3,164,'#7a0c0a'],['rect',0,.88,1,1,'#2a2420']],
        back:[['band',.42,.64,'#e4e0d4'],['rect',0,.6,1,1,'#2a2420']],top:[['rect',0,0,1,1,'#2a2420'],['wounds',1,165]],side:[['band',.42,.64,'#e4e0d4'],['rect',0,.68,1,1,'#2a2420']],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.55,3,.6]],bottom:[['soak',0,1,'#4a0606',.8]]},
      thL:{all:[['grime',.6]]},thR:{all:[['soak',.4,1,'#4a0606',.4]]},scarf:{all:[['grime',.3]]}};
    // the coat's skirt down to the knees, the scarf, the wristband
    extra=H=>{const o=H.o,nY=H.piv[2][1];return [{n:'coat',b:0,c:[0,o.hipY-.2,o.belly*.2],s:[o.torsoW*.98,.4,o.torsoD*1.02],m:'coat'},
      {n:'scarf',b:1,c:[0,nY-.02,o.headZ+.02],s:[.31,.09,.3],m:'scarf'},{n:'scarf',b:1,c:[-.07,nY-.16,o.headZ-o.headD*.5-.02],s:[.08,.2,.03],m:'scarf'},
      {n:'wrist',b:6,c:[H.piv[6][0],H.piv[6][1]-o.fore+.04,0],s:[o.armW*1.02,.035,o.armW*1.02],m:'wrist'}]}}
  // ▶ 카론 (charon, 8챕터 보스 RT1-06) — 감염된 1차 회수팀 조종사 (땅 위에서는 게임이 1.15배로 키운다)
  //    세이지색 비행복(가슴 지퍼, 주머니), 검은 올리브 생존 조끼(주머니, 등 'RT1-06'), 올리브 비행 헬멧과 위로 올린 검은 바이저,
  //    헬멧 왼쪽에 늘어진 산소마스크와 호스, 입가의 붐 마이크, 왼쪽 허벅지의 무릎 판(비행 메모), 왼팔 'RT-1' 패치,
  //    얼어서 푸르스름한 피부, 겁에 질려 크게 뜬 흰 눈과 피눈물. 조명탄 권총은 게임이 따로 붙인다(charon.js).
  else if(k==='charon'){// 조종사 — RT-1's pilot: a sage flight suit, a dark survival vest, the flight helmet (its visor up), a kneeboard on the thigh
    o={hipY:.95,thigh:.43,legSep:.1,legW:.15,legD:.17,shinW:.13,torsoW:.42,torsoH:.5,torsoD:.25,shX:.25,armW:.12,upper:.29,fore:.28,hand:.11,headW:.23,headH:.26,headD:.25,headZ:-.02,neck:.08,
      claw:.03,fingL:.56,curl:.45,curlJ:171,ears:[0,0]};
    const sk='#9aa6b0',fs='#6a7258';
    mats=Object.assign({top:{base:fs},legs:{base:fs},sleeve:{base:fs},fore:{base:fs},shin:{base:fs},skin:{base:sk,style:'zskin',blot:'#4a5a72'},hand:{base:'#3a3226',style:'rubber'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a5a72'},vest:{base:'#3e4430'},helm:{base:'#59603e',style:'plate',gloss:244},visor:{base:'#141a1e',style:'plate',gloss:252},
      mask:{base:'#2a2c2a',style:'rubber'},hose:{base:'#2a2c2a',style:'rubber'},board:{base:'#e8e4d8',style:'flat'},mic:{base:'#1a1a1a',style:'plate'}},goreM);
    decor={torso:{front:[['zip',.5],['pocket',.12,.5,.38,.78,'#5e664c'],['pocket',.62,.5,.88,.78,'#5e664c'],['grime',.45],['blood',2,172]],back:[['grime',.45]],side:[['grime',.4]]},
      vest:{front:[['pocket',.08,.1,.32,.42,'#343a28'],['pocket',.68,.1,.92,.42,'#343a28'],['pocket',.12,.52,.36,.8,'#343a28'],['vband',.47,.53,'#2a2e20'],['px',.75,.7,'#e8b020',1],['grime',.4],['soak',0,.4,'#3a0a0a',.4]],
        back:[['text','RT1-06',.14,.62,'#c8ccb8'],['grime',.4]],side:[['grime',.35]]},
      head:{front:[['face','runner',{skin:sk,eye:eyeH||'#eef4fa',tears:1}],['wounds',1,173]],side:[['rect',0,.55,1,1,'#3a3a30']],back:[['rect',0,.4,1,1,'#3a3a30']],top:[['rect',0,0,1,1,'#3a3a30']],bottom:[['teethrow','bottom',.36]]},
      jaw:{top:[['teethrow','top',.38]],front:[['teethrow','top',.46],['drip',.5,.5,2,.6]],bottom:[['soak',0,1,'#4a0612',.6]]},
      helm:{all:[['grime',.3]],front:[['band',.1,.2,'#2a2e20']],back:[['text','06',.32,.6,'#d8d8c8']]},visor:{all:[['line',.05,.7,.95,.7,1,'#6a7a84']]},
      board:{all:[['rect',.08,.08,.92,.92,'#f4f0e4'],['text','06',.3,.82,'#1a1a1a'],['line',.15,.62,.85,.62,1,'#7a7a7a'],['line',.15,.46,.85,.46,1,'#7a7a7a'],['line',.15,.3,.7,.3,1,'#7a7a7a'],['blood',1,174]]},
      uaL:{all:[['text','RT-1',.16,.7,'#3a3e34'],['grime',.35]]},uaR:{all:[['grime',.35]]},faL:{all:[['grime',.4]]},faR:{all:[['blood',2,175],['grime',.35]]},
      thL:{all:[['pocket',.15,.3,.85,.6,'#5e664c'],['grime',.45]]},thR:{all:[['pocket',.15,.3,.85,.6,'#5e664c'],['soak',.4,1,'#4a0612',.35]]},shL:{all:[['grime',.5]]},shR:{all:[['grime',.5]]},pelvis:{fb:[['belt',.72,.94,'#24261c','#8a8a7a']]}};
    // the survival vest, the helmet and its raised visor, the oxygen mask hanging off the helmet and its hose, the boom mic, the kneeboard
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC;
      return [{n:'vest',b:1,c:[0,sY+o.torsoH*.55,0],s:[o.torsoW*1.1,o.torsoH*.7,o.torsoD*1.28],m:'vest'},
        {n:'helm',b:2,c:[0,hc[1]+o.headH*.3,o.headZ+.012],s:[o.headW*1.24,o.headH*.74,o.headD*1.22],m:'helm'},
        {n:'visor',b:2,c:[0,hc[1]+o.headH*.7,o.headZ-o.headD*.55],s:[o.headW*1.12,o.headH*.22,.04],m:'visor'},
        {n:'mask',b:2,c:[-o.headW*.56,hc[1]-o.headH*.4,o.headZ-o.headD*.3],s:[.08,.11,.1],m:'mask'},
        {n:'hose',b:1,c:[-.1,sY+o.torsoH*.86,-o.torsoD*.64],s:[.04,.22,.04],m:'hose'},
        {n:'mic',b:2,c:[o.headW*.3,hc[1]-o.headH*.3,o.headZ-o.headD*.52],s:[.12,.025,.025],m:'mic'},
        {n:'board',b:7,c:[H.piv[7][0],H.piv[7][1]-o.thigh*.55,-o.legD*.62],s:[.13,.17,.02],m:'board'}]}}
  // ▶ 동사자 좀비 (frozen, 8챕터) — 비행장 지상 근무자. 눈보라 속에 쓰러져 눈더미에 묻혀 있다가 일어난다
  //    반사띠 두 줄의 주황 형광 방한 파카(어깨와 머리에 쌓인 눈), 목 뒤로 넘어간 털 후드, 노란 귀마개, 검은 작업 바지(정강이 반사띠),
  //    서리 낀 하얀 피부, 얼어붙은 하얀 눈, 하얗게 센 머리. 눈더미와 튀어나온 손은 게임이 따로 붙인다(charon.js).
  else if(k==='frozen'){// 동사자 — the airfield's ground crew, frozen in the drifts: an orange hi-vis parka, ear defenders, frost on everything
    o={hipY:.92,thigh:.42,legW:.16,legD:.18,shinW:.14,torsoW:.46,torsoH:.5,torsoD:.3,belly:.02,shX:.27,armW:.14,upper:.29,fore:.28,headW:.23,headH:.26,headD:.25,headZ:-.02,claw:.024,fingL:.5,curl:.6,curlJ:181,ears:[0,0]};
    const sk='#b8c8d4',pk='#e86a1a',sn='#eef4f8';
    mats=Object.assign({top:{base:pk},legs:{base:'#22242a'},sleeve:{base:pk},fore:{base:pk},shin:{base:'#22242a'},skin:{base:sk,style:'zskin',blot:'#6a8aa8'},hand:{base:'#2a2e34',style:'rubber'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#6a8aa8'},hood:{base:'#7a6a58',style:'hair'},muff:{base:'#e8b020',style:'plate',gloss:246},band2:{base:'#2a2a2a',style:'plate'},
      snow:{base:sn,style:'flat'},ice:{base:'#d8eef8',style:'plate',gloss:252}},goreM);
    const refl=[['band',.3,.36,'#d8dcdc'],['band',.56,.62,'#d8dcdc']],frost=c=>[['rect',0,.86,1,1,sn],['px',.2,.7,sn,0],['px',.7,.4,sn,0],['grime',.25]];
    decor={torso:{front:refl.concat([['zip',.5],['text','RAMP',.3,.8,'#1a1a1a']],frost()),back:refl.concat([['text','SAF',.3,.78,'#1a1a1a']],frost()),side:refl.concat(frost()),top:[['rect',0,0,1,1,sn]]},
      head:{front:[['face','zombie',{skin:sk,eye:'#f2f8ff'}],['rect',0,.86,1,1,'#e8eef2']],top:[['rect',0,0,1,1,'#e8eef2']],side:[['rect',0,.7,1,1,'#e8eef2']],back:[['rect',0,.55,1,1,'#e8eef2']],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['px',.3,.2,'#d8eef8',0],['px',.7,.25,'#d8eef8',0]]},
      uaL:{all:[['band',.4,.5,'#d8dcdc'],['rect',0,.8,1,1,sn]]},uaR:{all:[['band',.4,.5,'#d8dcdc'],['rect',0,.8,1,1,sn]]},faL:{all:[['grime',.35]]},faR:{all:[['grime',.35]]},
      shL:{all:[['band',.55,.65,'#d8dcdc'],['grime',.4]]},shR:{all:[['band',.55,.65,'#d8dcdc'],['grime',.4]]},thL:{all:[['grime',.5]]},thR:{all:[['grime',.5]]},hood:{all:[['grime',.2]]},snow:{all:[['grime',.08]]}};
    // the ear defenders and their band, the fur hood behind the neck, the snow on the shoulders, icicles off the parka's hem
    extra=H=>{const o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],hc=H.headC;
      return [{n:'muff',b:2,c:[-o.headW*.56,hc[1]-o.headH*.05,o.headZ],s:[.06,.12,.12],m:'muff'},{n:'muff',b:2,c:[o.headW*.56,hc[1]-o.headH*.05,o.headZ],s:[.06,.12,.12],m:'muff'},
        {n:'band2',b:2,c:[0,hc[1]+o.headH*.53,o.headZ],s:[o.headW*1.16,.03,.04],m:'band2'},
        {n:'hood',b:1,c:[0,nY-.03,o.headZ+o.headD*.44],s:[o.headW*1.2,.16,.14],m:'hood'},
        {n:'snow',b:1,c:[-o.shX*.55,sY+o.torsoH+.01,0],s:[.18,.05,o.torsoD*.9],m:'snow'},{n:'snow',b:1,c:[o.shX*.5,sY+o.torsoH+.01,.02],s:[.2,.05,o.torsoD*.8],m:'snow'},
        {n:'ice',b:0,c:[-.12,o.hipY-.26,-o.torsoD*.46],s:[.025,.1,.025],m:'ice'},{n:'ice',b:0,c:[.07,o.hipY-.28,-o.torsoD*.46],s:[.02,.13,.02],m:'ice'},{n:'ice',b:0,c:[.16,o.hipY-.25,-o.torsoD*.44],s:[.02,.08,.02],m:'ice'}]}}
  // ▶ 다이달로스 (daedalus, 9챕터 보스 RT1-04) — 감염된 1차 회수팀 공병 (게임이 1.15배로 키운다)
  //    회녹색 RT-1 작업복(무릎 보호대), 머리 위로 젖혀 올린 용접 마스크와 머리띠, 귀마개, 공구 벨트(주머니 · 망치 자루),
  //    등에 멘 프레임 배낭(케이블 드럼과 노란 배터리), 왼팔에 감은 페리 06의 빨간 띠('06'), 등에 'RT1-04',
  //    잿빛 피부에 그을음, 지친 노란 눈과 눈물 자국. 못총 · 렌치 · 용접 토치 · 날개는 게임이 따로 붙인다(daedalus.js).
  else if(k==='daedalus'){// 공병 — RT-1's engineer: work fatigues, the welding mask flipped up, ear defenders, a tool belt, a frame pack
    o={hipY:.95,thigh:.43,legSep:.1,legW:.16,legD:.18,shinW:.14,torsoW:.46,torsoH:.52,torsoD:.27,shX:.27,armW:.13,upper:.3,fore:.29,hand:.11,headW:.23,headH:.26,headD:.25,headZ:-.02,neck:.08,
      claw:.03,fingL:.56,curl:.45,curlJ:191,ears:[0,0]};
    const sk='#8a857c',fs='#5a6250';
    mats=Object.assign({top:{base:fs},legs:{base:fs},sleeve:{base:fs},fore:{base:fs},shin:{base:fs},skin:{base:sk,style:'zskin',blot:'#4a3a32'},hand:{base:'#2a2622',style:'rubber'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#4a3a32'},mask:{base:'#2a2c2e',style:'plate',gloss:244},muff:{base:'#3a3e34',style:'plate',gloss:244},
      pouch:{base:'#4a4632'},frame:{base:'#3a3e40',style:'plate',gloss:246},drum:{base:'#7a5a32'},cable:{base:'#1a1a1a',style:'rubber'},batt:{base:'#c8a020',style:'plate',gloss:244},
      pad:{base:'#2a2c28',style:'rubber'},band06:{base:'#a81e16'}},goreM);
    decor={torso:{front:[['zip',.5],['pocket',.12,.46,.4,.76,'#4e5644'],['pocket',.6,.46,.88,.76,'#4e5644'],['grime',.6],['blood',2,192],['soak',0,.3,'#2a2620',.5]],
        back:[['text','RT1-04',.12,.66,'#c8ccb8'],['grime',.6]],side:[['grime',.5]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#e0d070',tears:1}],['wounds',1,193],['rect',0,.9,1,1,'#3a3630']],side:[['rect',0,.62,1,1,'#3a3630']],back:[['rect',0,.45,1,1,'#3a3630']],top:[['rect',0,0,1,1,'#3a3630']],bottom:[['teethrow','bottom',.34]]},
      jaw:{top:[['teethrow','top',.36]],front:[['teethrow','top',.44],['drip',.5,.5,2,.6]],bottom:[['soak',0,1,'#4a0612',.5]]},
      mask:{all:[['grime',.4]],front:[['rect',.25,.2,.75,.55,'#1a3a2a'],['line',.25,.55,.75,.55,1,'#5a6a5a']]},
      band06:{all:[['text','06',.28,.78,'#f0f0e8'],['grime',.25]]},batt:{all:[['band',.42,.58,'#1a1a1a'],['grime',.3]]},drum:{all:[['band',.1,.2,'#4a3420'],['band',.8,.9,'#4a3420']]},
      uaL:{all:[['grime',.4]]},uaR:{all:[['grime',.4]]},faL:{all:[['grime',.45]]},faR:{all:[['blood',2,194],['grime',.4]]},
      thL:{all:[['pocket',.15,.3,.85,.6,'#4e5644'],['grime',.5]]},thR:{all:[['pocket',.15,.3,.85,.6,'#4e5644'],['grime',.5]]},shL:{all:[['grime',.55]]},shR:{all:[['grime',.55]]},
      pelvis:{fb:[['belt',.7,.94,'#2a2418','#8a8a7a']]}};
    // the mask flipped up on its headband, the ear defenders, the 06 armband, the tool belt's pouches and a hammer, knee pads, the frame
    // pack (two uprights, a cross bar, the cable drum on top, the battery under it)
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,shY=H.piv[3][1],hjY=o.hipY-.03,knY=hjY-o.thigh,bz=o.torsoD*.5;
      return [{n:'mask',b:2,c:[0,hc[1]+o.headH*.6,o.headZ+.03],s:[o.headW*1.1,.05,o.headD*1.02],m:'mask',rx:-.3},
        {n:'hband',b:2,c:[0,hc[1]+o.headH*.24,o.headZ],s:[o.headW*1.08,.035,o.headD*1.08],m:'mask'},
        {n:'muff',b:2,c:[-o.headW*.56,hc[1]-o.headH*.04,o.headZ],s:[.06,.12,.12],m:'muff'},{n:'muff',b:2,c:[o.headW*.56,hc[1]-o.headH*.04,o.headZ],s:[.06,.12,.12],m:'muff'},
        {n:'band06',b:3,c:[-o.shX,shY-o.upper*.42,0],s:[o.armW*1.1,.075,o.armW*1.1],m:'band06'},
        {n:'pouch',b:0,c:[-.2,o.hipY+.01,-o.torsoD*.44],s:[.1,.12,.07],m:'pouch'},{n:'pouch',b:0,c:[.2,o.hipY+.01,-o.torsoD*.44],s:[.1,.12,.07],m:'pouch'},{n:'pouch',b:0,c:[-.26,o.hipY,0],s:[.06,.13,.12],m:'pouch'},
        {n:'hamm',b:0,c:[.27,o.hipY-.08,.03],s:[.03,.24,.03],m:'drum'},
        {n:'pad',b:8,c:[-o.legSep,knY-.03,-o.legD*.56],s:[.14,.13,.04],m:'pad'},{n:'pad',b:10,c:[o.legSep,knY-.03,-o.legD*.56],s:[.14,.13,.04],m:'pad'},
        {n:'frame',b:1,c:[-.16,sY+o.torsoH*.52,bz+.06],s:[.03,o.torsoH*1.12,.03],m:'frame'},{n:'frame',b:1,c:[.16,sY+o.torsoH*.52,bz+.06],s:[.03,o.torsoH*1.12,.03],m:'frame'},
        {n:'frame',b:1,c:[0,sY+o.torsoH*.5,bz+.06],s:[.34,.03,.03],m:'frame'},
        {n:'drum',b:1,c:[0,sY+o.torsoH*.86,bz+.16],s:[.36,.2,.2],m:'drum'},{n:'cable',b:1,c:[0,sY+o.torsoH*.86,bz+.16],s:[.3,.15,.22],m:'cable'},
        {n:'batt',b:1,c:[0,sY+o.torsoH*.3,bz+.13],s:[.26,.17,.14],m:'batt'}]}}
  // ▶ 감전 좀비 (static, 9챕터) — 뇌설 속에서 번개를 맞은 기상 관측소 정비원
  //    남색 정비 작업복(반사띠 두 줄, 가슴과 등에 'KMA'), 노란 안전모와 켜진 헤드램프, 허리에 감은 전선 뭉치, 그을린 자국,
  //    걷어 올린 소매 아래 피부에 퍼진 번개 무늬(푸르게 빛나는 리히텐베르크 흉터), 하얗게 빛나는 눈. 몸에서 튀는 불꽃은 게임이 그린다(daedalus.js).
  else if(k==='static'){// 정비원 — the station's maintenance crew, struck in the storm: a navy coverall, a hard hat with its lamp still on, scorch marks
    o={hipY:.92,thigh:.42,legW:.15,legD:.17,shinW:.13,torsoW:.42,torsoH:.5,torsoD:.24,shX:.25,armW:.12,upper:.29,fore:.28,headW:.22,headH:.26,headD:.24,headZ:-.02,claw:.026,fingL:.58,curl:.55,curlJ:195,ears:[1,1]};
    const sk='#7a8088',su='#26324a',bl='#7ad0ff';
    mats=Object.assign({top:{base:su},legs:{base:su},sleeve:{base:su},fore:{base:sk,style:'zskin',blot:'#3a4a6a'},shin:{base:su},skin:{base:sk,style:'zskin',blot:'#3a4a6a'},hand:{base:dk(sk,.1),style:'zskin',blot:'#3a4a6a'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a4a6a'},hat:{base:'#d8a818',style:'plate',gloss:246},lampG:{base:'#e8f4ff',style:'flat'},cable:{base:'#1a1a1a',style:'rubber'}},goreM);
    const refl=[['band',.3,.36,'#c8ccc8'],['band',.56,.62,'#c8ccc8']],burn=[['soak',0,.5,'#14161a',.55],['grime',.6]];
    decor={torso:{front:refl.concat([['zip',.5],['text','KMA',.34,.84,'#d8d8d0'],['veins',3,bl,1]],burn),back:refl.concat([['text','KMA',.34,.84,'#d8d8d0']],burn),side:refl.concat(burn)},
      head:{front:[['face','zombie',{skin:sk,eye:'#e8f8ff'}],['veins',2,bl,1],['wounds',1,196]],side:[['rect',0,.75,1,1,'#2a2420'],['veins',1,bl,1]],back:[['rect',0,.6,1,1,'#2a2420']],top:[['rect',0,0,1,1,'#2a2420']],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.45,2,.5]]},
      faL:{all:[['veins',4,bl,1],['grime',.3]]},faR:{all:[['veins',4,bl,1],['soak',.5,1,'#14161a',.6]]},handL:{all:[['veins',2,bl,1],['soak',0,1,'#1a1a1a',.6]]},handR:{all:[['veins',2,bl,1]]},
      uaL:{all:[['band',.4,.5,'#c8ccc8'],['grime',.4]]},uaR:{all:[['band',.4,.5,'#c8ccc8'],['soak',0,.6,'#14161a',.5]]},
      shL:{all:[['band',.55,.65,'#c8ccc8'],['grime',.45]]},shR:{all:[['band',.55,.65,'#c8ccc8'],['grime',.45]]},thL:{all:burn},thR:{all:[['grime',.5]]},hat:{all:[['grime',.35],['soak',.6,1,'#1a1a1a',.5]]},lampG:{all:[['glow',0,0,1,1,'#eaf6ff']]}};
    // the hard hat and its brim, the lamp on its front (still lit), a coil of cable on the belt
    extra=H=>{const o=H.o,hc=H.headC;
      return [{n:'hat',b:2,c:[0,hc[1]+o.headH*.4,o.headZ],s:[o.headW*1.2,o.headH*.38,o.headD*1.2],m:'hat'},{n:'hat',b:2,c:[0,hc[1]+o.headH*.24,o.headZ-o.headD*.08],s:[o.headW*1.32,.025,o.headD*1.36],m:'hat'},
        {n:'lampG',b:2,c:[0,hc[1]+o.headH*.42,o.headZ-o.headD*.63],s:[.065,.05,.035],m:'lampG'},
        {n:'cable',b:0,c:[.21,o.hipY-.03,.05],s:[.06,.15,.15],m:'cable'}]}}
  // ▶ 엘피스 (elpis, 10챕터 보스 RT1-02) — 감염된 1차 회수팀 의무병 (게임이 1.1배로 키운다)
  //    회녹색 RT-1 전투복 위에 의무병 조끼(주머니 셋, 가슴과 등의 흰 바탕 초록 십자, 등 'RT1-02'), 왼팔에 흰 완장(초록 십자),
  //    목에 건 청진기, 턱 밑으로 내린 하늘색 수술용 마스크, 뒤로 틀어 올린 검은 머리(쪽), 피에 젖은 하늘색 니트릴 장갑,
  //    어깨끈에 꽂은 지혈대, 오른 허벅지의 의무 파우치, 무릎 보호대. 창백한 피부 아래 원액의 초록 혈관(어둠에서 빛난다),
  //    초록빛 눈과 눈물 자국. 다트 권총 · 제세동 패들 · 링거 팩 · 군번줄 · 마지막 주사기는 게임이 따로 붙인다(elpis.js).
  else if(k==='elpis'){// 의무병 — RT-1's medic: fatigues under a medic's vest (a green cross), a stethoscope, the surgical mask pulled down, her hair in a bun
    o={hipY:.95,thigh:.44,legSep:.095,legW:.14,legD:.16,shinW:.12,torsoW:.39,torsoH:.5,torsoD:.23,shX:.235,armW:.105,upper:.3,fore:.29,hand:.11,headW:.215,headH:.255,headD:.235,headZ:-.02,neck:.1,
      claw:.03,fingL:.56,curl:.4,curlJ:201,ears:[0,0]};
    const sk='#a8b2a6',fs='#5a6252',gn='#4aff86',wh='#e6e6de',gc='#2a9a4a';
    // (a cross: two clean bars)
    const cross=(u,v,s,c)=>[['solid',u-s,v-s*.34,u+s,v+s*.34,c],['solid',u-s*.34,v-s,u+s*.34,v+s,c]];
    mats=Object.assign({top:{base:fs},legs:{base:fs},sleeve:{base:fs},fore:{base:fs},shin:{base:fs},skin:{base:sk,style:'zskin',blot:'#3a5a44'},hand:{base:'#78aed6',style:'rubber'},
      boot:{base:'#1e1a16',style:'boot'},jaw:{base:sk,style:'zskin',blot:'#3a5a44'},vest:{base:'#3e4636'},hair:{base:'#16120e',style:'hair'},mask:{base:'#8cbccc'},
      steth:{base:'#1a1a1a',style:'rubber'},chest:{base:'#c8ccd0',style:'plate',gloss:248},band:{base:wh},tq:{base:'#1c1c1c',style:'rubber'},tqT:{base:'#c83a2a',style:'plate',gloss:246},
      pad:{base:'#2a2c28',style:'rubber'},pouch:{base:'#4a5240'},pack:{base:'#424a3a'}},goreM);
    decor={torso:{front:[['zip',.5],['grime',.45],['blood',2,202],['veins',3,gn,1]],back:[['grime',.45]],side:[['grime',.4]]},
      vest:{front:[['pocket',.06,.08,.3,.4,'#343c2c'],['pocket',.36,.08,.64,.36,'#343c2c'],['pocket',.7,.08,.94,.4,'#343c2c'],['rect',.6,.56,.9,.88,wh],...cross(.75,.72,.11,gc),
          ['grime',.35],['soak',0,.35,'#3a0a0a',.45],['blood',1,204]],
        back:[['grime',.4]],side:[['grime',.35]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#a6ffc4',tears:1}],['veins',2,gn,1],['rect',0,.9,1,1,'#16120e']],side:[['rect',0,.6,1,1,'#16120e'],['veins',1,gn,1]],
        back:[['rect',0,.25,1,1,'#16120e']],top:[['rect',0,0,1,1,'#16120e']],bottom:[['teethrow','bottom',.32]]},
      jaw:{top:[['teethrow','top',.34]],front:[['teethrow','top',.4],['drip',.5,.5,2,.5]],bottom:[['soak',0,1,'#4a0612',.4]]},
      uaL:{all:[['grime',.35]]},uaR:{all:[['grime',.35]]},faL:{all:[['grime',.4]]},faR:{all:[['grime',.35],['blood',1,203]]},
      handL:{all:[['soak',0,.7,'#5a0808',.55]]},handR:{all:[['soak',0,.85,'#5a0808',.6]]},
      band:{all:cross(.5,.5,.3,gc)},mask:{all:[['band',.28,.34,'#78a6b6'],['band',.62,.68,'#78a6b6'],['grime',.15]]},
      pouch:{all:[['rect',.3,.55,.7,.85,wh],...cross(.5,.7,.12,gc),['grime',.4]]},
      pack:{back:[['pocket',.1,.04,.9,.34,'#363e2e'],['rect',.3,.42,.7,.76,wh],...cross(.5,.59,.13,gc),['text','RT1-02',.13,.96,'#c8ccb8'],['grime',.45]],front:[['grime',.3]],side:[['pocket',.15,.1,.85,.6,'#363e2e'],['grime',.4]],top:[['grime',.3]]},
      thL:{all:[['grime',.5]]},thR:{all:[['grime',.5]]},shL:{all:[['grime',.5]]},shR:{all:[['grime',.5]]},pelvis:{fb:[['belt',.7,.94,'#2a2418','#8a8a7a']]}};
    // the vest, the medic's pack on her back (the IV bag hangs off it: elpis.js), the hair (a cap of it, the bun), the mask under her chin,
    // the stethoscope round her neck (its tubes, the chest piece), the armband, the tourniquet on the vest's strap, the thigh pouch, the knee pads
    extra=H=>{const o=H.o,sY=H.piv[1][1],hc=H.headC,nY=H.piv[2][1],shY=H.piv[3][1],hjY=o.hipY-.03,knY=hjY-o.thigh,zf=-o.torsoD*.66;
      return [{n:'vest',b:1,c:[0,sY+o.torsoH*.55,0],s:[o.torsoW*1.1,o.torsoH*.72,o.torsoD*1.28],m:'vest'},
        {n:'pack',b:1,c:[0,sY+o.torsoH*.5,o.torsoD*.5+.1],s:[o.torsoW*.84,o.torsoH*.74,.16],m:'pack'},
        {n:'hair',b:2,c:[0,hc[1]+o.headH*.45,o.headZ+.012],s:[o.headW*1.08,.06,o.headD*1.07],m:'hair'},
        {n:'hair',b:2,c:[0,hc[1]+o.headH*.05,o.headZ+o.headD*.52],s:[o.headW*1.04,o.headH*.82,.05],m:'hair'},
        {n:'hair',b:2,c:[0,hc[1]+o.headH*.2,o.headZ+o.headD*.66],s:[.11,.1,.09],m:'hair'},
        {n:'mask',b:2,c:[0,nY+o.neck-.085,o.headZ-o.headD*.08],s:[o.headW*.96,.06,o.headD*.78],m:'mask'},
        {n:'steth',b:1,c:[0,sY+o.torsoH+.015,.01],s:[.2,.022,o.torsoD*.92],m:'steth'},
        {n:'steth',b:1,c:[-.075,sY+o.torsoH*.84,zf],s:[.022,.16,.02],m:'steth'},{n:'steth',b:1,c:[.075,sY+o.torsoH*.8,zf],s:[.022,.2,.02],m:'steth'},
        {n:'chest',b:1,c:[.075,sY+o.torsoH*.6,zf-.004],s:[.05,.05,.018],m:'chest'},
        {n:'band',b:3,c:[-o.shX,shY-o.upper*.4,0],s:[o.armW*1.12,.1,o.armW*1.12],m:'band'},
        {n:'tq',b:1,c:[.15,sY+o.torsoH*.82,zf+.004],s:[.05,.12,.035],m:'tq'},{n:'tqT',b:1,c:[.15,sY+o.torsoH*.9,zf-.01],s:[.055,.025,.02],m:'tqT'},
        {n:'pouch',b:9,c:[o.legSep+o.legW*.62,hjY-o.thigh*.42,-.01],s:[.06,.15,.13],m:'pouch'},
        {n:'pad',b:8,c:[-o.legSep,knY-.03,-o.legD*.56],s:[.13,.12,.04],m:'pad'},{n:'pad',b:10,c:[o.legSep,knY-.03,-o.legD*.56],s:[.13,.12,.04],m:'pad'}]}}
  // ▶ 환자 좀비 (patient, 10챕터) — Q-7 중앙 연구소 지하 병동의 환자. 엘피스가 링거를 꽂아 '살려' 두었다
  //    옅은 하늘색 잔무늬 환자복(가슴 'Q7-B5', 등 뒤가 벌어져 끈 두 줄만 묶임, 무릎 위까지 내려오는 자락), 맨다리와 맨발,
  //    손목의 흰 환자 팔찌, 팔오금에 테이프로 붙인 정맥 주삿바늘과 끊어진 수액 줄, 빡빡 민 머리의 봉합 자국,
  //    창백한 피부 아래 원액의 초록 혈관(어둠에서 빛난다), 초록빛 눈.
  else if(k==='patient'){// 환자 — a patient from the ward below: a pale blue gown open at the back, bare legs and feet, a wristband, a cannula taped into the arm
    o={hipY:.92,thigh:.42,legW:.13,legD:.15,shinW:.11,torsoW:.4,torsoH:.5,torsoD:.22,shX:.235,armW:.1,upper:.3,fore:.29,headW:.215,headH:.255,headD:.235,headZ:-.02,claw:.024,fingL:.56,curl:.5,curlJ:205,ears:[1,1]};
    const sk='#a2aaa0',gw='#aac6ce',gn='#4aff86',zs={base:sk,style:'zskin',blot:'#3a5a44'};
    mats=Object.assign({top:{base:gw},legs:zs,sleeve:{base:gw},fore:zs,shin:zs,skin:zs,hand:{base:dk(sk,.12),style:'zskin',blot:'#3a5a44'},boot:{base:dk(sk,.2),style:'zskin',blot:'#4a3a32'},jaw:zs,
      gown:{base:gw},wrist:{base:'#eeeee6',style:'plate',gloss:246},tape:{base:'#e6e2d6'},tube:{base:'#d6eede',style:'plate',gloss:250}},goreM);
    const dots=['check','#94b2bc',2.2,'#6e8e9a'];
    decor={torso:{front:[dots,['text','Q7-B5',.16,.84,'#4a6a78'],['soak',.35,.9,'#4a0606',.4],['veins',3,gn,1],['grime',.3]],
        back:[dots,['rect',.3,0,.7,1,sk],['veins',4,gn,1],['band',.42,.45,'#e8e8e0'],['band',.72,.75,'#e8e8e0'],['grime',.3]],side:[dots,['grime',.3]]},
      gown:{front:[dots,['soak',.5,1,'#4a0606',.35],['grime',.35]],back:[dots,['rect',.36,0,.64,1,dk(sk,.1)],['grime',.35]],side:[dots,['grime',.3]]},
      head:{front:[['face','zombie',{skin:sk,eye:eyeH||'#a6ffc4'}],['veins',2,gn,1]],top:[['stitch',.2,.25,.8,.7],['wounds',1,206]],side:[['veins',1,gn,1],['stitch',.2,.6,.8,.75]],back:[['veins',2,gn,1]],bottom:[['teethrow','bottom',.3]]},
      jaw:{top:[['teethrow','top',.32]],front:[['teethrow','top',.38],['drip',.5,.45,2,.5]]},
      uaL:{all:[dots]},uaR:{all:[dots]},faL:{all:[['veins',4,gn,1],['grime',.3]]},faR:{all:[['veins',3,gn,1],['bite',.5,.6,.2],['grime',.3]]},
      thL:{all:[['veins',2,gn,1],['grime',.4]]},thR:{all:[['veins',2,gn,1],['grime',.4],['blood',1,207]]},shL:{all:[['grime',.55]]},shR:{all:[['grime',.55]]},
      handL:{all:[['grime',.4]]},handR:{all:[['soak',0,.6,'#4a0606',.5]]},wrist:{all:[['text','B5',.3,.75,'#4a5a6a']]}};
    // the gown's skirt to above the knee, the wristband, the cannula (its tape, the cut drip line hanging off it)
    extra=H=>{const o=H.o,el=H.piv[4];return [{n:'gown',b:0,c:[0,o.hipY-.15,o.belly*.2],s:[o.torsoW*1.0,.34,o.torsoD*1.06],m:'gown'},
      {n:'wrist',b:6,c:[H.piv[6][0],H.piv[6][1]-o.fore+.045,0],s:[o.armW*1.04,.035,o.armW*1.04],m:'wrist'},
      {n:'tape',b:4,c:[el[0],el[1]-.05,-o.armW*.5],s:[.07,.06,.012],m:'tape'},
      {n:'tube',b:4,c:[el[0]-.01,el[1]-.2,-o.armW*.56],s:[.012,.3,.012],m:'tube'}]}}
  // ▶ 주술사 좀비 (scream) — 저장소 주인이 직접 만든 디자인   (위의 어느 것도 아니면 이 모습)
  //    자주색 상의, 베이지 바지, 짙은 갈색 피부, 빨간 눈(입술 없음), 눈가에 흰 천 띠 + 흐르는 피,
  //    머리 뒤 상투(bun)와 흰 천 매듭(knot), 작은 귀, 정강이에 금색 각반(검은 줄 2개),
  //    팔에 흰 핏줄 무늬와 찢김, 손목 갈색 띠.  오른손 인형은 아래 공통 처리의 '부두 인형' 부분에서 만든다.
  else{
    o={hipY:.92,torsoW:.38,torsoD:.2,shX:.22,armW:.09,upper:.3,fore:.29,legW:.16,legD:.15,shinW:.12,headW:.22,headH:.28,headD:.24,neck:.1,claw:.03,fingL:.62,curl:.4,curlJ:9,eyeY:.66,noseW:.12};
    const sk='#2a1a15';
    mats=Object.assign({top:{base:'#8b264b'},legs:{base:'#d4cbb8'},sleeve:{base:sk,style:'zskin'},fore:{base:sk,style:'zskin'},shin:{base:sk,style:'zskin'},skin:{base:sk,style:'zskin'},hand:{base:sk,style:'zskin'},boot:{base:sk,style:'zskin'},jaw:{base:sk,style:'zskin'},hair:{base:'#1a1a1a',style:'hair'},cloth:{base:'#e0e0d8',style:'cloth'},doll:{base:'#8b6b45',style:'cloth'}},goreM);
    decor={
       torso:{front:[['tear',2,4,sk],['band',0,.05,'#111'],['band',.05,.08,'#d4cbb8'],['soak',0,1,'#111',.3],['blood',2,8]],back:[['rect',.4,.2,.6,.8,sk],['tear',2,5,sk],['grime',.6]]},
       head:{front:[['face','scream',{skin:sk,eye:eyeH||'#ff0000',ey:.66,lipless:1}],['band',.55,.75,'#e0e0d8'],['soak',.1,.4,'#880000',.8]],back:[['band',.55,.75,'#e0e0d8']],top:[['rect',0,0,1,1,'#1a1a1a']]},
       jaw:{front:[['teethrow','top',.3],['soak',0,1,'#880000',.9]]},legs:{all:[['grime',.7],['tear',3,2,sk],['tear',2,5,sk]]},
       shin:{all:[['band',.1,.5,'#cdae66'],['band',.15,.2,'#222'],['band',.3,.35,'#222'],['grime',.4]]},uaL:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0']]},uaR:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0']]},
       faL:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0'],['band',0,.2,'#4a3020']]},faR:{all:[['veins',2,'#e0d8c0',0],['tear',2,7,'#e0d8c0'],['band',0,.2,'#4a3020']]},handL:{all:[['soak',0,1,'#4a3020',.8]]},handR:{all:[['soak',0,1,'#4a3020',.8]]}
    };
     extra=H=>[
       {n:'bun',b:2,c:[0,1.72,-.02],s:[.12,.1,.12],m:'hair'},{n:'knot',b:2,c:[0,1.58,.12],s:[.16,.05,.05],m:'cloth'},
       {n:'earL',b:2,c:[-.12,1.5,0],s:[.02,.05,.02],m:'top'},{n:'earR',b:2,c:[.12,1.5,0],s:[.02,.05,.02],m:'top'},
       {n:'dollB',b:0,c:[-.16,.9,-.12],s:[.06,.1,.05],m:'doll'},{n:'dollH',b:0,c:[-.16,.98,-.12],s:[.05,.05,.05],m:'doll'}
     ];
  }
  // ▶ 알레프 (aleph, 1챕터 보스 Q7-000) — 거대 좀비 몸(위 덫잡이 좀비, 어두운 색) + 끊어진 구속 목줄과 늘어진 사슬 두 줄,
  //    어깨와 가슴에 볼트로 박은 철판, 등에 탱크를 묶은 띠 두 줄. (등의 주황 혈청 탱크와 2페이즈의 격벽 방패는 게임이 따로 붙인다: aleph.js)
  if(aleph){const ex0=extra;mats.iron={base:'#4a4e52',style:'plate',gloss:244};mats.chain={base:'#6a6e70',style:'plate',gloss:246};mats.bolt={base:'#9a9890',style:'plate',gloss:248};
    decor.iron={all:[['grime',.5],['soak',0,.4,'#4a0606',.5]]};decor.torso.back=(decor.torso.back||[]).concat([['band',.42,.5,'#1a1814'],['band',.7,.78,'#1a1814']]);
    extra=H=>{const L=ex0(H),o=H.o,sY=H.piv[1][1],nY=H.piv[2][1],zf=o.belly*.25-(o.torsoD+o.belly)/2;
      L.push({n:'collar',b:1,c:[0,nY+.01,o.headZ+.01],s:[.36,.075,.34],m:'iron'});
      for(const s of [-1,1])for(let i=0;i<5;i++)L.push({n:'chain',b:1,c:[s*(.09+i*.012),nY-.08-i*.11,zf-.05+i*.004],s:[.035,.1,.035],m:'chain'});
      L.push({n:'plate',b:3,c:[-.44,1.76,0],s:[.32,.06,.32],m:'iron'},{n:'plate',b:5,c:[.46,1.78,0],s:[.34,.06,.34],m:'iron'},{n:'plate',b:1,c:[-.17,sY+o.torsoH*.72,zf-.02],s:[.22,.17,.03],m:'iron'},{n:'plate',b:1,c:[.19,sY+o.torsoH*.66,zf-.02],s:[.18,.14,.03],m:'iron'});
      for(const [x,y] of [[-.25,.8],[-.09,.8],[-.25,.64],[-.09,.64],[.12,.72],[.26,.72],[.12,.6],[.26,.6]])L.push({n:'bolt',b:1,c:[x,sY+o.torsoH*y,zf-.04],s:[.025,.025,.02],m:'bolt'});
      return L}}
  // ── 여기부터 모든 좀비 공통 처리 ──
  //    숙주·보스 혈관 추가 → 아래턱 → 팔다리가 잘렸을 때 보이는 단면(stump) → 주술사 좀비 인형
  if(host||boss){for(const p of Object.keys(decor))for(const fk of ['front','back','all'])if(decor[p][fk])decor[p][fk]=decor[p][fk].concat([['veins',2,vein,1]]);
    decor.torso.front=(decor.torso.front||[]).concat([['veins',4,vein,1]]);decor.torso.back=(decor.torso.back||[]).concat([['veins',3,vein,1]]);}
  o.zombie=1;if(k==='brute')o.eyeSep=.16;const H=humanoid(o);const ex=extra(H);
  // the lower jaw hangs from its own bone so it can gape, chatter and snap
  {const o2=H.o,nY=H.piv[2][1],big=k==='scream';ex.push({n:'jaw',b:11,c:[0,nY+o2.neck-(big?.04:.024),o2.headZ-o2.headD*.14],s:[o2.headW*(big?.78:.8),big?.1:.066,o2.headD*.62],m:'jaw'});
    // stumps for torn-off limbs: raw meat with the bone end showing, hidden on their own bones until needed
    ex.push({n:'stumpN',b:14,c:[0,nY+.012,0],s:[.12,.06,.12],m:'stump'});
    for(const sd of [-1,1]){const aw=o2.armW*(sd>0?o2.arm2:1);ex.push({n:'stumpA'+(sd<0?'L':'R'),b:sd<0?15:16,c:[sd*(o2.shX+aw*.08),H.piv[3][1]+.01,0],s:[aw*1.12,aw*1.12,aw*1.12],m:'stump'});
      ex.push({n:'stumpL'+(sd<0?'L':'R'),b:sd<0?17:18,c:[sd*o2.legSep,H.piv[7][1]-.03,0],s:[o2.legW*1.08,.08,o2.legD*1.08],m:'stump'})}
    mats.stump={base:'#7a1410',style:'flesh'};
    // voodoo zombie: a pinned rag doll gripped by its legs in the right fist (both hands on it), used as a club
    // 부두 인형: vdoll 헝겊 색, vpin 핀 몸 색, vpinH 핀 머리(빨강). 크기·위치는 D('이름',x,y,z,너비,높이,깊이,재질)
    if(k==='scream'){for(let i=ex.length-1;i>=0;i--)if(/^doll/.test(ex[i].n))ex.splice(i,1);// a doll hanging from the belt moves into the hands
      const [hx,hy]=H.hand;const D=(n,x,y,z,w,h,d,m)=>ex.push({n,b:6,c:[hx+x,hy+y,z],s:[w,h,d],m});
      D('vdLegs',0,0,-.04,.05,.045,.08,'vdoll');D('vdBody',0,0,-.13,.08,.06,.11,'vdoll');D('vdHead',0,.004,-.225,.085,.075,.08,'vdoll');
      D('vdArm',-.058,0,-.15,.04,.03,.03,'vdoll');D('vdArm',.058,0,-.15,.04,.03,.03,'vdoll');
      for(const [x,z,h] of [[-.018,-.215,.07],[.02,-.235,.06],[.012,-.12,.065]]){D('vdPin',x,.03+h/2,z,.006,h,.006,'vpin');D('vdPinH',x,.032+h,z,.016,.016,.016,'vpinH')}
      mats.vdoll={base:'#9a7646'};mats.vpin={base:'#c8ccd0',style:'plate',gloss:248};mats.vpinH={base:'#b01414',style:'plate',gloss:246};
      Object.assign(decor,{vdBody:{all:[['stitch',.5,.05,.5,.95],['grime',.5]],top:[['rect',.3,.35,.7,.7,'#7a1010'],['stitch',.5,.05,.5,.95]]},
        vdHead:{all:[['grime',.4]],top:[['stitch',.15,.45,.42,.75],['stitch',.15,.75,.42,.45],['stitch',.58,.45,.85,.75],['stitch',.58,.75,.85,.45],['stitch',.3,.22,.7,.22]]},
        vdLegs:{all:[['stitch',.5,0,.5,1],['grime',.6]]},vdArm:{all:[['grime',.5]]}})}if(!decor.claw)decor.claw={all:[['soak',0,.7,'#3a0606',.8]]};
    decor.nose=decor.nose||{all:[['grime',.5]],bottom:[['rect',0,0,1,1,'#2a0606']]};decor.brow=decor.brow||{all:[['grime',.5]],bottom:[['rect',0,0,1,1,dk(mats.skin.base,.5)]]};
    Object.assign(decor,{stumpN:{top:[['flesh',0,0,1,1,.5],['bonep',.36,.36,.64,.64]],fb:[['flesh',0,.2,1,1,0],['drip',.5,.4,3,.9]],side:[['flesh',0,.2,1,1,0]]},
      stumpAL:{all:[['flesh',0,0,1,1,.8]],left:[['bonep',.32,.32,.68,.68]],bottom:[['drip',.5,.6,4,.9]]},stumpAR:{all:[['flesh',0,0,1,1,.8]],right:[['bonep',.32,.32,.68,.68]],bottom:[['drip',.5,.6,4,.9]]},
      stumpLL:{all:[['flesh',0,0,1,1,1.57]],bottom:[['bonep',.3,.3,.7,.7]]},stumpLR:{all:[['flesh',0,0,1,1,1.57]],bottom:[['bonep',.3,.3,.7,.7]]}})}
  // 15세 / 피 끄기 (GORE.lv < 2): no ribs bursting out, no bare spine, no hanging guts, no stumps (nothing is ever torn off)
  H.parts.push(...ex.filter(e=>GORE.lv>=2||!/^(rib|vert|guts|stump)/.test(e.n)).map(e=>({n:e.n,b:e.b,c:e.c,s:e.s,m:e.m,f:{}})));
  return Object.assign(H,{key:'z_'+(aleph?'aleph':khepri?'khepri':tiamat?tiamat:boss?'boss':k)+(host?'_h':''),mats,decor,ppm:k==='brute'?82:100})}

// ================================================================================================
//  4부  총기 아이덴티티 — 실제 총 · 탄창 수 · 약실 · 처음 꺼낼 때의 장전 모션
// ================================================================================================
//  총을 사거나 / 줍거나 / 보급상자에서 얻은 뒤 "처음 꺼낼 때" 그 총만의 장전 동작이 나온다.
//  (그다음부터 무기를 바꿀 때는 원래처럼 빠르게 꺼낸다.)
//
//  mag  : 한 탄창(튜브 · 벨트 · 드럼)에 들어가는 탄 수.  적지 않으면 무기 기본값(weapons.js)을 쓴다.
//  res  : 예비 탄 수 (적지 않으면 기본값).
//  ch   : 1 = 약실 +1.  노리쇠가 닫힌 채 쏘는 총(폐쇄형)은 탄이 남은 상태에서 재장전하면 약실에 1발이 남아
//         탄창+1발이 된다 (AK 30발 → 31발, 듀얼은 +2).  빈 탄창에서 재장전하면 그냥 탄창 수.
//         0 = 없음 (오픈볼트 기관단총·기관총, 리볼버, 튜브식 샷건, 중절식, 가상 무기)
//  act  : 첫 장전 동작 종류 (아래 표)
//  x    : 첫 장전에 더 걸리는 시간(초). 이 동안은 쏠 수 없다.  보통 꺼내기 시간은 weapons.js 의 draw.
//  d    : 장전손잡이 · 슬라이드를 당기는 거리 (미터, 0.05 = 5cm)
//  roll : 장전할 때 총을 옆으로 눕히는 정도 (라디안. + = 오른쪽 면이 보이게, - = 왼쪽 면이 보이게)
//  side : 장전손잡이 위치 — 'r' 오른쪽, 'l' 왼쪽, 't' 위, 'u' 아래
//  heavy: 0~1. 클수록 묵직하게 (천천히 당기고, 소리가 낮고, 크게 튄다)
//  ob   : 1 = 오픈볼트 (손잡이를 놓아도 '철컥' 대신 '딸깍', 천천히 앞으로)
//  rps  : (spin) 1초에 도는 바퀴 수.   axis: (spin) 도는 축 'z' 총열 방향, 'x' 옆으로 선 원판
//  snd  : (spin) 도는 소리 이름 [이름, 볼륨, 빠르기]
//  open : (break) 꺾이는 각도 (라디안, 기본 0.62).   lift: (break) 그동안 총을 들어 올리는 높이 (기본 0.08)
//
//  동작 종류 (act)
//    slide    권총 슬라이드를 왼손으로 잡아 당겼다 놓기          revolver 실린더 열기 → 돌리기 → 손목으로 닫기 → 해머 젖히기
//    charge   옆·위·아래 장전손잡이 당겼다 놓기                 hk       HK식: 레버를 당겨 걸어두고 손바닥으로 내리쳐 놓기
//    ar       M4식: 뒤쪽 T자 손잡이 당겼다 놓고 전진기 누르기     pump     펌프를 한 번 왕복
//    bolt     볼트 들고 · 당기고 · 밀고 · 내리기                 break    중절식으로 꺾어 열어 약실 확인 → 손목으로 닫기
//    belt     덮개 열기 → 벨트 얹기 → 덮개 닫기 → 장전손잡이     spin     회전 총열 · 드럼 · 드릴 · 칼날 돌리기
//    saw      시동줄 두 번 (첫 번째는 꺼지고 두 번째에 시동)      xbow     장전 슬라이드로 시위를 당겨 걸기
//    harpoon  작살을 포신에 밀어 넣기                            tank     공기탱크 밸브를 비틀어 압력 충전
//    orb      우리 안 구체가 돌며 빛이 차오름                    dragon   탄을 밀어 넣고 포구에 불씨
//    cock     엄지로 해머 젖히기                                barrel   다연장 총열을 손으로 돌려 맞추기
//    rail     전원 스위치를 올리면 레일 코일이 차례로 켜짐 (아크라인, specguns.js)
const GUN_DESIGN={
  // ── 권총 ─────────────────────────────────────────────────────────────────────────────────────
  p9:      {mag:12, ch:1, act:'slide', x:.45, d:.045, roll:.35},             // USP .45 ACP — 실제 12발. 슬라이드 뒤를 잡아 당겼다 놓음 '철컥'
  f7:      {mag:20, ch:1, act:'slide', x:.4,  d:.035, roll:.3},              // FN 파이브세븐 5.7mm — 실제 20발. 가벼운 슬라이드를 짧고 빠르게
  tw9:     {mag:30, ch:1, act:'slide', x:.45, d:.04},                        // 베레타 M92FS ×2 — 한 자루 15발씩. X자 교차 뒤 두 슬라이드를 동시에 (약실 +2)
  d50:     {mag:7,  ch:1, act:'slide', x:.6,  d:.06,  roll:.45, heavy:1},    // IMI 데저트 이글 .50AE — 실제 7발. 무거운 슬라이드를 끝까지 천천히
  dde:     {mag:14, ch:1, act:'slide', x:.65, d:.06, heavy:1},               // 데저트 이글 Mark XIX .50AE ×2 — 한 자루 7발씩 (약실 +2). X자 교차 뒤 무거운 두 슬라이드를 끝까지
  r6:      {mag:6,  ch:0, act:'revolver', x:1.1},
  crimson: {mag:6,  ch:0, act:'revolver', x:1.1},                            // 크림슨 피스메이커 (오리지널) — 6연발 싱글액션 리볼버, 빨강·검정                            // 콜트 아나콘다 .44 매그넘 — 6연발 리볼버. 실린더 열고 촤르륵 돌리고 닫고 해머 딸깍
  duckfoot:{         ch:0, act:'cock', x:.45},                               // 덕풋 권총 — 4연장 일제사격 권총. 엄지로 해머 젖히기
  // ── 샷건 ─────────────────────────────────────────────────────────────────────────────────────
  sg8:     {mag:8,  ch:0, act:'pump', x:.45},                                // 베넬리 M3 슈퍼90 — 군용 튜브 7+약실 1 = 8발. 펌프 척-척
  m14:     {mag:7,  ch:0, act:'charge', x:.55, side:'r', d:.05, roll:.3},    // 베넬리 M4 (XM1014) — 튜브 6+약실 1 = 7발. 오른쪽 장전손잡이
  as12:    {mag:20, ch:0, act:'charge', x:.6,  side:'r', d:.055, roll:.32, heavy:.6, rl:'mag', reload:3.2}, // 대우 USAS-12 — 10발 박스 / 20발 드럼 → 드럼. 묵직한 오른쪽 손잡이. 재장전은 드럼 통째로 교체(3.2초)
  jhammer: {mag:10, ch:0, act:'pump', x:.55, rl:'mag', reload:3.2},       // 팬코 잭해머 — 10발 회전 카세트(리볼버 실린더처럼 한 발마다 돌아감), 재장전은 카세트째 교체. 첫 장전은 앞손잡이를 한 번 당겼다 밂
  db2:     {mag:2,  ch:0, act:'break', x:.85},                               // 더블 배럴 — 2발. 꺾어 열어 약실 확인, 손목으로 탁 닫기
  volc:    {         ch:0, act:'spin', x:.7, rps:2.2, axis:'z', snd:['cylspin',.85,.7], shake:.002}, // 헥사 로터 — 6연장 회전 드럼을 드르륵 한 바퀴
  mdrill:  {         ch:0, act:'spin', x:.6, rps:16, axis:'z', snd:['drill',.45,1.2], shake:.004},   // 보어 드릴 — 드릴 비트를 위잉
  // ── 기관단총 ──────────────────────────────────────────────────────────────────────────────────
  k5:      {mag:30, ch:1, act:'hk', x:.7, d:.045},                           // H&K MP5 — 30발. HK 슬랩: 왼쪽 앞 레버를 당겨 걸고 손바닥으로 착!
  k9:      {mag:30, ch:0, act:'charge', x:.5, side:'t', d:.045, ob:1},       // 잉그램 MAC-10 .45 — 30발, 오픈볼트. 위쪽 장전노브를 뒤로
  um45:    {mag:25, ch:1, act:'hk', x:.75, d:.05, heavy:.4},                 // H&K UMP45 — 25발. HK 슬랩 (조금 더 묵직)
  pd50:    {mag:50, ch:1, act:'charge', x:.5, side:'u', d:.03, roll:.3},    // FN P90 — 50발. 총 아래 양쪽 장전손잡이
  sterling:{mag:34, ch:0, act:'charge', x:.5, side:'r', d:.05, roll:.25, ob:1}, // 스털링 L2A3 — 34발, 오픈볼트. 오른쪽 장전손잡이 (탄창은 왼쪽)
  dmp7:    {mag:80, ch:1, act:'slide', x:.5, d:.035, nolock:1},             // H&K MP7A1 ×2 (보급상자 전용) — 한 자루 40발씩. 두 총을 모아 뒤쪽 T자 장전손잡이를 동시에 (약실 +2). nolock: 손잡이는 뒤에 걸리지 않음
  // ── 소총 ─────────────────────────────────────────────────────────────────────────────────────
  g35:     {mag:35, ch:1, act:'charge', x:.6,  side:'r', d:.06,  roll:.32},  // IMI 갈릴 ARM — 35발. 위로 휜 오른쪽 장전손잡이
  kv47:    {mag:30, ch:1, act:'charge', x:.65, side:'r', d:.075, roll:.42, heavy:.5}, // AK-47 — 30발. 총을 기울이고 오른쪽 손잡이를 크게 당겼다 철컥
  br3:     {mag:25, ch:1, act:'charge', x:.55, side:'t', d:.05},             // FAMAS F1 — 25발. 운반손잡이 아래 장전손잡이
  ar7:     {mag:30, ch:1, act:'ar', x:.75, d:.06},                           // 콜트 M4A1 — 30발. 뒤쪽 T자 손잡이 당겼다 놓고 전진기 탁
  ar5c:    {mag:30, ch:1, act:'charge', x:.5,  side:'r', d:.045, roll:.28},  // SIG SG552 — 30발. 오른쪽 손잡이, 짧고 경쾌하게
  hr17:    {mag:20, ch:1, act:'charge', x:.5,  side:'l', d:.06,  roll:.25},  // FN SCAR-H 7.62 — 20발. 왼쪽 앞 장전손잡이를 지지손으로 바로
  ak60r:   {mag:60, ch:1, act:'charge', x:.7,  side:'r', d:.075, roll:.42, heavy:.6}, // AK-47 드럼 (보급상자 전용) — 반달형 60발 라운드 탄창. 총을 기울이고 오른쪽 손잡이를 크게 당겼다 철컥
  xbow:    {         ch:0, act:'xbow', x:.8},                                // 크로스보우 (연발식) — 장전 슬라이드로 시위를 당겨 걸기
  xbowa:   {         ch:0, act:'xbow', x:.75},                               // 관통 크로스보우
  // ── 저격총 ────────────────────────────────────────────────────────────────────────────────────
  sr8:     {mag:10, ch:1, act:'bolt', x:.65},                                // 슈타이어 스카웃 — 5발 / 10발 탄창 중 10발. 볼트 한 사이클
  r700:    {mag:10, ch:1, act:'bolt', x:.8, heavy:1},                        // AI 악틱 워페어 (AWP) .308 — 10발. 무거운 볼트를 크게
  dm14:    {mag:20, ch:1, act:'hk', x:.75, d:.05, heavy:.5},                 // H&K G3SG/1 — 20발. HK 슬랩 (왼쪽 앞 레버)
  // ── 기관총 ────────────────────────────────────────────────────────────────────────────────────
  hmg:     {mag:100, ch:0, act:'belt', x:1.3},                               // FN M249 — 100발 벨트 (200발 박스도 있음), 오픈볼트. 덮개 열고 벨트 얹고 닫고 장전
  mg6:     {mag:100, ch:0, act:'belt', x:1.35, heavy:1},                     // MG3 — 50발 벨트 두 개 연결, 오픈볼트. 더 묵직하게
  gx6:     {mag:500, res:500, ch:0, act:'spin', x:.8, rps:14, axis:'z', snd:['spinup',.9,1], shake:.006}, // M134 미니건 — 실제는 수천 발 급탄 → 500발. 모터 시동 위이잉
  // ── 특수 (가상 무기라 탄 수는 게임 설정값) ─────────────────────────────────────────────────────────────
  gl40:    {mag:1,  ch:0, act:'break', x:.7, open:.4, lift:.02},                                // M79 유탄발사기 — 1발 중절식. 꺾어 열어 확인하고 탁
  airb:    {         ch:0, act:'tank', x:.7},                                // 압축 공기포 — 공기탱크 밸브를 비틀어 치익
  salamander:{       ch:0, act:'salig', x:.75},
  blaze8:  {mag:8,  ch:0, act:'charge', x:.55, side:'r', d:.05, roll:.3},    // 블레이즈-8 — 튜브 8발. 오른쪽 장전손잡이를 당겼다 놓음
  balrog11:{mag:7,  ch:0, act:'charge', x:.55, side:'r', d:.05, roll:.3},    // 이그니스-XI — 튜브 7발 자동 샷건. 오른쪽 장전손잡이 (재장전은 한 발씩, 아주 빠르게)
  plasma:  {mag:45, ch:0, act:'charge', x:.6,  side:'r', d:.04, roll:.3},    // 플라즈마 건 — 셀 45발. 오른쪽 레버를 당겨 셀을 깨움 (재장전은 셀을 뒤로 뽑아 갈아 끼움)
  thunder: {mag:30, ch:0, act:'rail', x:.9},                                 // 아크라인 — 전용탄 30발, 재장전 없음. 전원 스위치를 올리면 코일이 차례로 켜짐
  balrog5: {mag:35, ch:1, act:'ar', x:.75, d:.06},                           // 이그니스-5 — 35발. 뒤쪽 T자 손잡이 당겼다 놓고 전진기 탁 (M4A1과 같은 동작)
  winchester:{mag:6, ch:0, act:'pump', x:.5},                               // 윈체스터 M1887 — 레버 액션 6발. 레버를 내렸다 올림                              // 파이어웜 화염방사기 — 가스통 밸브를 돌리고 점화, 파일럿 불꽃이 화륵
  bdc:     {         ch:0, act:'dragon', x:.85},                             // 흑염포 — 탄을 밀어 넣고 포구에 불씨 화륵
  rdc:     {         ch:0, act:'dragon', x:.9},                              // 홍염포
  ripper:  {         ch:0, act:'saw', x:1.4},                                // 그라인더 — 시동줄 두 번: 털털 꺼지고, 두 번째에 부릉
  gaebolg: {         ch:0, act:'harpoon', x:.8},                             // 나르왈 — 작살을 포신에 밀어 넣고 철컥
  xdz:     {         ch:0, act:'spin', x:.6, rps:6, axis:'x', snd:['sawrev',.4,1.6], shake:.003}, // 차크람 — 회전 칼날을 위잉 한 번
  mlaunch: {         ch:0, act:'barrel', x:.6},                              // 슬러그 런처 — 3연장 총열을 돌려 맞추고 딸깍
  bhole:   {         ch:0, act:'orb', x:.8},                                 // 이벤트 호라이즌 (보급상자 전용) — 구체가 돌며 빛이 차오름
};
// (게임이 읽는 부분) 무기 표에 위 값을 덮어쓴다 — 모든 무기 파일이 읽힌 뒤 supply.js 끝에서 한 번 부른다
// rl:'mag' = 탄창(드럼)째 갈아 끼우는 재장전으로 바꿈 (한 발씩 넣기 없앰), reload = 재장전 시간(초)
function applyGunDesign(){for(const id in GUN_DESIGN){const W=WPN[id],g=GUN_DESIGN[id];if(!W)continue;if(g.mag)W.mag=g.mag;if(g.res)W.res=g.res;W.ch=g.ch?1:0;W.fd=g;
  if(g.rl==='mag'){delete W.shellRel;delete W.relStart}if(g.reload)W.reload=g.reload}}

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
  duck:    {vol:1, rate:1, file:''},  // 스페셜 덕 풋 건 발사음 (여러 총구가 한 번에 터지는 소리)
  // ── 총소리 · 샷건 ────────────────────────────────────────────────────────────────────────────
  sg8:     {vol:1, rate:1, file:''},  // M3 펌프 샷건 발사음
  db2:     {vol:1, rate:1, file:''},  // 더블 배럴 샷건 발사음
  m14:     {vol:1, rate:1, file:''},  // XM1014 자동 샷건 발사음
  as12:    {vol:1, rate:1, file:''},  // USAS-12 자동 샷건 발사음
  // ── 총소리 · 기관단총 ────────────────────────────────────────────────────────────────────────
  k5:      {vol:1, rate:1, file:''},  // MP5 발사음
  k9:      {vol:1, rate:1, file:''},  // MAC-10 발사음
  um45:    {vol:1, rate:1, file:''},  // UMP45 발사음
  pd50:    {vol:1, rate:1, file:''},  // P90 발사음
  sterling:{vol:1, rate:1, file:''},  // 스털링 바요넷 발사음
  // ── 총소리 · 소총 / 저격총 / 기관총 ──────────────────────────────────────────────────────────
  ar7:     {vol:1, rate:1, file:''},  // M4A1 발사음
  kv47:    {vol:1, rate:1, file:''},  // AK-47 발사음
  g35:     {vol:1, rate:1, file:''},  // 갈릴 발사음
  br3:     {vol:1, rate:1, file:''},  // 파마스 발사음
  ar5c:    {vol:1, rate:1, file:''},  // SG552 발사음
  hr17:    {vol:1, rate:1, file:''},  // SCAR-H 발사음
  sr8:     {vol:1, rate:1, file:''},  // 스카웃 저격총 발사음
  r700:    {vol:1, rate:1, file:''},  // AWP 저격총 발사음 — 길게 울리는 메아리
  dm14:    {vol:1, rate:1, file:''},  // G3SG1 자동 저격총 발사음
  hmg:     {vol:1, rate:1, file:''},  // M249 기관총 발사음
  mg6:     {vol:1, rate:1, file:''},  // MG3 기관총 발사음
  gx6:     {vol:1, rate:1, file:''},  // M134 미니건 발사음
  spinloop:{vol:1, rate:1, file:''},  // M134 미니건 총열 도는 모터음 (조준·사격 중 계속 도는 반복음)
  // ── 총소리 · 특수무기 ────────────────────────────────────────────────────────────────────────
  gl40:    {vol:1, rate:1, file:''},  // M79 유탄발사기 '퐁' 발사음
  volc:    {vol:1, rate:1, file:''},  // 볼케이노 (연사 샷건) 발사음
  mdrill:  {vol:1, rate:1, file:''},  // 매그넘 드릴 발사음
  drill:   {vol:1, rate:1, file:''},  // 매그넘 드릴 우클릭 — 드릴 돌리며 찌르기
  mlaunch: {vol:1, rate:1, file:''},  // 매그넘 런처 3연발 발사음
  xbow:    {vol:1, rate:1, file:''},  // 크로스보우 시위 소리
  xbowa:   {vol:1, rate:1, file:''},  // 크로스보우 어드밴스 시위 소리
  hstick:  {vol:1, rate:1, file:''},  // 크로스보우 볼트·게이볼그 작살이 벽이나 몸에 꽂히는 소리
  harpoon: {vol:1, rate:1, file:''},  // 게이볼그 작살 발사음
  disc:    {vol:1, rate:1, file:''},  // 혈적자 원반 던지는 '윙' 소리
  dischit: {vol:1, rate:1, file:''},  // 혈적자 원반이 좀비·벽에 맞는 금속성 '챙'
  pickup:  {vol:1, rate:1, file:''},  // 혈적자 원반이 돌아와 손에 잡힐 때
  bdc:     {vol:1, rate:1, file:''},  // 흑룡포 화염 발사음
  rdc:     {vol:1, rate:1, file:''},  // 적룡포 화염 발사음 (흑룡포보다 더 큼)
  dragon:  {vol:1, rate:1, file:''},  // 용포 우클릭(게이지 가득) — 용 소환 포효
  sawrev:  {vol:1, rate:1, file:''},  // 리퍼(전기톱) 엔진 부웅 — 내가 들 때 / 남이 갈아버릴 때
  sawloop: {vol:1, rate:1, file:''},  // 리퍼 엔진 반복음 (누르고 있는 동안 계속, 세게 갈수록 높아짐)
  sawhit:  {vol:1, rate:1, file:''},  // 리퍼 톱날이 몸을 가는 소리

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
  kswing:  {vol:1, rate:1, file:''},  // 근접 무기 휘두르는 바람 소리 (칼·도끼, 리퍼 휘두르기)
  khit:    {vol:1, rate:1, file:''},  // 칼날이 몸에 박히는 소리
  hamhit:  {vol:1, rate:1, file:''},  // 망치 같은 둔기가 몸을 때리는 '퍽'
  kwall:   {vol:1, rate:1, file:''},  // 근접 무기·좀비 손톱이 벽에 부딪히는 '깡'

  // ── 폭발 · 투척물 ────────────────────────────────────────────────────────────────────────────
  explode: {vol:1, rate:1, file:''},  // 폭발 (고폭 수류탄, M79 유탄, 게이볼그 기폭, 관짝 터짐, 자폭 좀비)
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
  zpain:   {vol:1, rate:1, file:['sound/Zombi_hurt_01.ogg','sound/Zombi_hurt_01.mp3']},  // 좀비가 총·칼에 맞을 때 (한 좀비당 0.35초에 한 번까지). ogg 를 못 읽는 아이폰은 mp3
  zdie:    {vol:1, rate:1, file:''},  // 좀비가 죽을 때 길게 우는 소리
  zatk:    {vol:1, rate:1, file:''},  // 좀비 공격 기합 (남의 좀비가 할퀼 때 / 좀비 폭탄 당길 때)
  claw:    {vol:1, rate:1, file:''},  // 좀비 손톱 휘두르는 바람 소리 (내가 좀비일 때)
  clawhit: {vol:1, rate:1, file:''},  // 좀비 손톱이 인간 몸을 긁는 소리
  clawarmor:{vol:1,rate:1, file:''},  // 좀비 손톱이 방탄복에 막히는 소리
  zstep:   {vol:1, rate:1, file:''},  // 좀비 발소리 '쿵' (배경 음악 킥드럼으로도 씀)
  zinfect: {vol:1, rate:1, file:''},  // 감염 — 숙주 좀비 등장 / 내가 좀비가 됐을 때
  zroar:   {vol:1, rate:1, file:''},  // 일반 좀비 스킬 광폭화 포효 / 좀비 레벨업 포효
  zleap:   {vol:1, rate:1, file:''},  // 도약 (좀비 폭탄에 날아갈 때, 시나리오 보스가 뛰어들 때)
  invis:   {vol:1, rate:1, file:''},  // 라이트 좀비 스킬 투명화
  heal:    {vol:1, rate:1, file:''},  // 부두 좀비 스킬 치유
  trapset: {vol:1, rate:1, file:''},  // 헤비 좀비 스킬 덫 설치 (관짝 좀비가 관 세울 때도 낮게)
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

  // ── UI · 알림 · 분위기 ───────────────────────────────────────────────────────────────────────
  ui:      {vol:1, rate:1, file:''},  // 버튼 딸깍 (메뉴 버튼, 손전등 F, 야간투시 N, 저격 줌)
  uiok:    {vol:1, rate:1, file:''},  // 확인 '띵동' (좀비 종류 고르기, 멀티 방 입장)
  buy:     {vol:1, rate:1, file:''},  // 구매 성공 '찰칵'
  countdown:{vol:1,rate:1, file:'sound/round_start.mp3', len:10},  // 좀비모드 라운드 시작 후 숙주 등장 전 10초 카운트다운이 시작되는 순간 한 번 재생.
                                    // 원본은 12초 — len:10 으로 앞 10초만 쓰고 끊는다 (숙주 등장과 함께 끝남)
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
//  장갑 색은 고정 (박재원·메이슨·서유나 = 검은 장갑, 엘레나 = 흰 의료 장갑).
const ARM_DESIGN={
  sl_guard:  ['#2b3346'],                       // 박재원 (경비대) — 남색 제복 소매
  sl_medic:  ['#5e706e'],                       // 엘레나 (의무병) — 회청록 작업복 소매
  sl_soldier:['#4c5436','#2e3424','#6a6a48'],   // 메이슨 (용병) — 올리브 위장무늬 소매
  sl_hazmat: ['#c8a42a'],                       // 서유나 (방호복) — 노란 방호복 소매
  zs_rager:  ['#7a8a6a','#4a2a28'],             // 일반 좀비 팔 — 회녹색 피부, 검붉은 얼룩
  zs_runner: ['#9a9a86','#5a3a40'],             // 라이트 좀비 팔 — 창백한 회색 피부, 보랏빛 얼룩
  zs_brute:  ['#8a7a6a','#6a3a32'],             // 헤비 좀비 팔 — 누런 살색, 적갈색 얼룩
  zs_scream: ['#2a1a15','#4a3020'],             // 부두 좀비 팔 — 짙은 갈색 피부
  zs_coffin: ['#282321','#3a1c10'],             // 관짝 좀비 팔 — 거의 검은 피부
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
//     인간 전용: face:'visor' 헬멧 바이저 / face:'mask' 방독면 머리
//
//  ② mats — 부위별 재질 {base: 기본 색, style: 질감, blot: 얼룩 색, camo:[위장 어두운색, 밝은색], gloss: 광택 240~254}
//     기본 부위: top 몸통  legs 골반·허벅지  sleeve 위팔  fore 아래팔  shin 정강이  skin 목·머리  hand 손  boot 발
//     (좀비) jaw 아래턱.   그 밖의 이름(vest, helm, coffin …)은 ④ extra 부품이 쓰는 재질.
//     style: 'cloth' 천(기본)  'skin' 사람 피부  'zskin' 좀비 피부(멍·혈관)  'plate' 단단한 판(헬멧·방탄판)
//            'rubber' 고무  'boot' 군화  'flat' 무늬 없는 단색  'hair' 머리카락  'flesh' 생살  'meat' 내장  'tumor' 종양
//     goreM (좀비 공통): bone 뼈, guts 내장, tumor 종양, nail 손톱, flesh 생살
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
//       ['face',종류,{옵션}] 얼굴 — 종류: 'man' 남자  'woman' 여자  'visor' 바이저  'gasmask' 방독면
//                                       'zombie' 'runner' 'brute' 'scream' 좀비 얼굴들
//            옵션: skin 피부색, eye 눈 색, hair 머리색, stubble 수염, oneEye 한쪽 눈 없음, tears 피눈물,
//                  cheek 뺨 찢김, lipless 입술 없음, sewn 눈 꿰맴, ey 눈 높이
//
//  ④ extra — 몸에 덧붙이는 부품 {n:이름, b:뼈 번호, c:[x,y,z] 중심, s:[너비,높이,깊이], m:재질}
//     뼈 번호: 0 골반  1 몸통  2 머리  3 왼위팔  4 왼아래팔  5 오른위팔  6 오른아래팔
//              7 왼허벅지  8 왼정강이  9 오른허벅지  10 오른정강이  11 턱  12 왼발  13 오른발
//     좌표: x 오른쪽(+), y 위(+), z 뒤(+) / 앞(-).  발바닥 y=0, 캐릭터는 -z 쪽을 본다.
//     함수형 extra=H=>[…] 은 H.piv(관절 위치), H.o(체형), H.headC(머리 중심)를 써서 체형에 맞춰 붙인다.
//
//  ※ 크기(키)·히트박스·스탯은 game.js 의 ZCLASS(좀비)에 있다. 여기는 보이는 모습만.
//  ※ 숙주 좀비(host)는 같은 몸에 붉게 빛나는 혈관이 더해지고 눈이 빨개진다 (맨 아래 공통 처리).

const SKIN_C={a:'#c89a78',b:'#a8785a',c:'#e0b898',d:'#7a5038'};  // 사람 피부색 4가지: a 보통, b 그을린, c 밝은, d 어두운
// ── 인간 캐릭터 (로비에서 고르는 스킨) ─────────────────────────────────────────────────────────
//    k = 'guard' 박재원 | 'medic' 엘레나 | 'soldier' 메이슨 | 'hazmat' 서유나
function defHuman(k){
  const o={};let mats,decor,extra=[];
  // ▶ 박재원 (guard) — 격리구역 경비대
  //    남색 제복·바지, 검은 방탄조끼(앞주머니 3개, 노란 띠), 진압 헬멧 + 검은 바이저로 얼굴을 가림.
  //    등에 'SEC' 글씨, 양 위팔에 노란 완장, 왼쪽 허리 파우치, 가슴 오른쪽 무전기, 검은 고무장갑.
  if(k==='guard'){// 박재원 — quarantine security: navy uniform, black plate carrier, riot helmet
    o.face='visor';mats={top:{base:'#2b3346'},legs:{base:'#262d3e'},sleeve:{base:'#2b3346'},fore:{base:'#2b3346'},shin:{base:'#262d3e'},skin:{base:SKIN_C.a,style:'skin'},hand:{base:'#1c1d20',style:'rubber'},boot:{base:'#18171a',style:'boot'},
      vest:{base:'#1d1f24',style:'plate',gloss:243},helm:{base:'#22262e',style:'plate'},pouch:{base:'#24272c'},visor:{base:'#121820',style:'flat',gloss:254}};
    decor={torso:{front:[['band',.62,.68,'#c8b02a']],back:[['band',.62,.68,'#c8b02a'],['text','SEC',.3,.5,'#c8c8c0']]},
      vest:{front:[['pocket',.08,.08,.3,.42,'#2a2e34'],['pocket',.36,.08,.62,.42,'#2a2e34'],['pocket',.68,.08,.92,.42,'#2a2e34'],['band',.78,.86,'#c8b02a'],['out',0,0,1,1,'#101114']],back:[['out',0,0,1,1,'#101114'],['band',.7,.78,'#c8b02a']]},
      head:{front:[['face','visor',{skin:SKIN_C.a}]],side:[['rect',.35,.38,.55,.58,dk(SKIN_C.a,.15)]],back:[['rect',0,.25,1,.6,'#1a1614']]},
      helm:{front:[['band',.0,.18,'#121418']],side:[['rect',.0,.0,1,.2,'#121418']],all:[['out',0,0,1,1,'#14161a']]},
      pelvis:{fb:[['belt',.7,.95,'#141414','#6a6a62']]},footL:{front:[['laces']]},footR:{front:[['laces']]},shL:{front:[['rect',.15,.55,.85,.95,'#16181c']]},shR:{front:[['rect',.15,.55,.85,.95,'#16181c']]},
      uaL:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},uaR:{side:[['rect',.2,.6,.8,.85,'#c8b02a']]},
      visor:{front:[['rect',.04,.6,.16,.82,'#3a4c5c'],['rect',.16,.7,.24,.82,'#26323e'],['out',0,0,1,1,'#0a0c10']],all:[['out',0,0,1,1,'#0a0c10']]}};
    extra=[{n:'vest',b:1,c:[0,1.28,0],s:[.45,.36,.29],m:'vest'},{n:'helm',b:2,c:[0,1.72,0],s:[.27,.14,.29],m:'helm'},{n:'pouchL',b:0,c:[-.19,.93,-.06],s:[.06,.12,.1],m:'pouch'},{n:'radio',b:1,c:[.17,1.36,-.15],s:[.06,.1,.04],m:'pouch'}]}
  // ▶ 엘레나 (medic) — 야전 의무병
  //    회청록 작업복(가운데 지퍼, 가슴 주머니 2개), 흰 헬멧 앞에 초록 십자, 등에 흰 의료 가방(초록 십자),
  //    왼 위팔에 흰 완장 + 초록 십자, 뒤로 묶은 갈색 머리, 흰 의료 장갑, 여자 얼굴.
  else if(k==='medic'){// 엘레나 — field medic: grey-teal coveralls, white helmet, medical pack
    mats={top:{base:'#5e706e'},legs:{base:'#56666a'},sleeve:{base:'#5e706e'},fore:{base:'#5e706e'},shin:{base:'#56666a'},skin:{base:SKIN_C.c,style:'skin'},hand:{base:'#d8dcd4',style:'rubber'},boot:{base:'#2a2622',style:'boot'},
      pack:{base:'#b8bcb0',style:'plate',gloss:244},helm:{base:'#c8ccc4',style:'plate'},hair:{base:'#3a2418',style:'hair'}};
    decor={torso:{front:[['zip',.5],['pocket',.12,.55,.38,.8,'#52625f'],['pocket',.62,.55,.88,.8,'#52625f'],['grime',.4]],back:[['grime',.3]]},
      uaL:{side:[['rect',.15,.45,.85,.8,'#e8e8e0'],['rect',.42,.5,.58,.75,'#2a8a4a'],['rect',.28,.58,.72,.67,'#2a8a4a']]},uaR:{side:[['rect',.15,.45,.85,.8,'#e8e8e0']]},
      head:{front:[['face','woman',{skin:SKIN_C.c,hair:'#3a2418'}],['band',.88,1,'#3a2418']],side:[['rect',0,.4,.35,1,'#3a2418'],['px',.6,.5,dk(SKIN_C.c,.2)]],back:[['rect',0,.15,1,1,'#3a2418']],top:[['rect',0,0,1,1,'#3a2418']]},
      helm:{all:[['out',0,0,1,1,'#8a8e86']],front:[['rect',.4,.25,.6,.75,'#2a8a4a']]},
      pack:{back:[['rect',.38,.35,.62,.7,'#2a8a4a'],['rect',.25,.45,.75,.6,'#2a8a4a'],['out',0,0,1,1,'#6a6e66']],all:[['grime',.3]]},
      pelvis:{fb:[['belt',.7,.92,'#2a2a26','#9a9a90']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'helm',b:2,c:[0,1.735,.005],s:[.26,.11,.28],m:'helm'},{n:'pack',b:1,c:[0,1.25,.19],s:[.32,.36,.14],m:'pack'},{n:'tail',b:2,c:[0,1.58,.15],s:[.06,.14,.06],m:'hair'}];o.headW=.23;o.noseW=.13;o.browH=.018}
  // ▶ 메이슨 (soldier) — 용병
  //    올리브 위장무늬 전투복, 황갈색 방탄조끼(앞주머니 3개), 올리브 헬멧 위에 고글,
  //    허벅지 주머니, 오른쪽 허리 파우치, 수염 난 남자 얼굴, 갈색 장갑.
  else if(k==='soldier'){// 메이슨 — mercenary: olive camo, tan plate carrier, goggles on helmet
    mats={top:{base:'#4c5436',camo:['#2e3424','#6a6a48']},legs:{base:'#4a5236',camo:['#2c3222','#686844']},sleeve:{base:'#4c5436',camo:['#2e3424','#6a6a48']},fore:{base:'#4c5436',camo:['#2e3424','#6a6a48']},shin:{base:'#4a5236',camo:['#2c3222','#686844']},
      skin:{base:SKIN_C.b,style:'skin'},hand:{base:'#5a4a32',style:'rubber'},boot:{base:'#4a3a28',style:'boot'},vest:{base:'#8a7a58',style:'plate',gloss:242},helm:{base:'#5a5e44',style:'plate'},gog:{base:'#2a2a26'}};
    decor={vest:{front:[['pocket',.06,.06,.3,.45,'#7a6a4a'],['pocket',.36,.06,.64,.45,'#7a6a4a'],['pocket',.7,.06,.94,.45,'#7a6a4a'],['rect',.3,.7,.7,.9,'#6a5a3e']],back:[['pocket',.2,.2,.8,.7,'#7a6a4a']],all:[['grime',.4]]},
      head:{front:[['face','man',{skin:SKIN_C.b,stubble:1,hair:'#1a1410'}]],back:[['rect',0,.3,1,.55,'#1a1410']]},
      helm:{all:[['out',0,0,1,1,'#3a3e2c']]},gog:{front:[['rect',.05,.2,.45,.8,'#5a7088'],['rect',.55,.2,.95,.8,'#5a7088']]},
      pelvis:{fb:[['belt',.7,.95,'#3a3424','#8a8a7a']]},thL:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},thR:{side:[['pocket',.15,.35,.85,.7,'#424a30']]},footL:{front:[['laces']]},footR:{front:[['laces']]}};
    extra=[{n:'vest',b:1,c:[0,1.27,0],s:[.46,.38,.3],m:'vest'},{n:'helm',b:2,c:[0,1.735,0],s:[.28,.13,.3],m:'helm'},{n:'gog',b:2,c:[0,1.775,-.12],s:[.2,.05,.05],m:'gog'},{n:'pouchR',b:0,c:[.2,.92,0],s:[.07,.14,.12],m:'vest'}]}
  // ▶ 서유나 (hazmat) — 방호복 기술자   (위의 셋이 아니면 전부 이 모습)
  //    노란 방호복(가운데 지퍼, 가슴에 'HAZ' 검은 패치), 검은 고무 장화·장갑,
  //    방독면 머리 + 양쪽 필터 두 개, 등에 회색 산소통(빨간 띠).
  else{// 서유나 — hazmat technician: yellow suit, gas mask with twin filters, black gloves
    mats={top:{base:'#c8a42a'},legs:{base:'#c09e28'},sleeve:{base:'#c8a42a'},fore:{base:'#c8a42a'},shin:{base:'#1c1c1c',style:'rubber'},skin:{base:'#c8a42a'},hand:{base:'#1a1a1a',style:'rubber'},boot:{base:'#141414',style:'boot'},
      filt:{base:'#2a2c2e',style:'rubber'},tank:{base:'#8a9098',style:'plate'}};
    decor={torso:{front:[['zip',.5],['rect',.12,.7,.42,.82,'#1a1a1a'],['text','HAZ',.14,.82,'#c8a42a'],['grime',.5]],back:[['band',.15,.22,'#1a1a1a'],['grime',.4]]},
      head:{front:[['face','gasmask',{}]],side:[['rect',.1,.1,.9,.75,'#1c1e20']]},
      pelvis:{fb:[['belt',.75,.95,'#1a1a1a','#5a5a5a']]},thL:{all:[['grime',.4]]},thR:{all:[['grime',.4]]},
      tank:{back:[['band',.8,.9,'#c84020']],all:[['out',0,0,1,1,'#5a6068']]}};
    extra=[{n:'filtL',b:2,c:[-.07,1.585,-.15],s:[.07,.07,.06],m:'filt'},{n:'filtR',b:2,c:[.07,1.585,-.15],s:[.07,.07,.06],m:'filt'},{n:'tank',b:1,c:[0,1.27,.18],s:[.2,.34,.12],m:'tank'}];o.headW=.25;o.headD=.27;o.face='mask'}
  const H=humanoid(o);H.parts.push(...extra.map(e=>({n:e.n,b:e.b,c:e.c,s:e.s,m:e.m,f:{}})));
  return Object.assign(H,{key:'h_'+k,mats,decor,ppm:100})}

// ── 좀비 캐릭터 ──────────────────────────────────────────────────────────────────────────────────
//    k = 'rager' 일반 | 'runner' 라이트 | 'brute' 헤비 | 'coffin' 관짝 | 'scream' 부두
//        | 'bomber' 자폭(시나리오) | 'spitter' 산성(시나리오) | 'boss' 거대 좀비(시나리오: 헤비 몸에 어두운 색)
//    host = 숙주 좀비(라운드 처음 감염된 좀비)면 true → 붉게 빛나는 혈관 + 빨간 눈.
//    vein = 숙주·보스 혈관 색,  eyeH = 숙주·보스 눈 색.  아래 eye:eyeH||'#…' 는 '숙주면 빨간 눈, 아니면 이 색'.
function defZombie(k,host){const boss=k==='boss';if(boss)k='brute';// the giant: the heavy zombie's body in different colours (scaled up by the game)
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
  // ▶ 라이트 좀비 (runner) — 가죽이 벗겨진 굶주린 몸
  //    마른 체형·긴 다리, 등 가죽이 벗겨져 척추뼈·견갑골이 드러남, 입술 없는 이빨, 코 없음(구멍),
  //    길게 굽은 뼈 손톱, 창백한 회색 피부에 보랏빛 혈관, 하늘색 눈, 검은 머리.
  else if(k==='runner'){// 질주체 — flayed and starved: the back skinned down to the spine, a lipless grin, long bone claws
    o={hipY:.97,thigh:.44,legW:.12,legD:.14,shinW:.11,torsoW:.36,torsoD:.2,torsoH:.48,shX:.22,armW:.095,upper:.31,fore:.31,hand:.12,headW:.21,headH:.25,headD:.24,claw:.07,fingL:.6,curl:.3,curlJ:5,nose:false,ears:[0,0]};
    const sk='#8e8c7c';
    mats=Object.assign({top:{base:'#5a1e1a'},legs:{base:'#3a3a38'},sleeve:{base:sk,style:'zskin',blot:'#4a2a48'},fore:{base:sk,style:'zskin',blot:'#4a2a48'},shin:{base:sk,style:'zskin',blot:'#4a2a48'},skin:{base:sk,style:'zskin',blot:'#4a2a48'},hand:{base:dk(sk,.2),style:'zskin',blot:'#5a1010'},boot:{base:dk(sk,.25),style:'zskin'},hair:{base:'#141210',style:'hair'},jaw:{base:sk,style:'zskin',blot:'#4a2a48'}},goreM);
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
  // ▶ 헤비 좀비 (brute) — 부풀어 오른 격리 환자   (boss 일 때는 같은 몸에 어두운 색 = 시나리오 거대 좀비)
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
  // ▶ 부두 좀비 (scream) — 저장소 주인이 직접 만든 디자인   (위의 어느 것도 아니면 이 모습)
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
  // ── 여기부터 모든 좀비 공통 처리 ──
  //    숙주·보스 혈관 추가 → 아래턱 → 팔다리가 잘렸을 때 보이는 단면(stump) → 부두 좀비 인형
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
  H.parts.push(...ex.map(e=>({n:e.n,b:e.b,c:e.c,s:e.s,m:e.m,f:{}})));
  return Object.assign(H,{key:'z_'+(boss?'boss':k)+(host?'_h':''),mats,decor,ppm:k==='brute'?82:100})}

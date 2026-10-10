'use strict';
// ============ Lobby: a game-client style front end ============
// Main menu = top bar (profile, level, icon buttons) + four tall mode cards + news / record / map-list panels.
// "Create room" = a framed room-settings window (title, mode and map dropdowns, live map preview, bots, difficulty, rounds),
// and the multiplayer waiting room uses the same window with eight player slots.
// Everything is drawn here (portraits, gun icons, CSS); map previews are snapshots of the menu scene.
const THUMB={};
// ---------- patch notes (공지사항 ＋ button) ----------
// newest first: [version, date, [[tag, ko, en], ...]]  tag NEW / UP / FIX
const PATCH=[
['v6.13','2026-10-10',[
 ['NEW','샐러맨더 — 화염방사기 (특수). 누르고 있으면 불줄기를 뿜어 8m 안 좀비를 한꺼번에 태움 (가까울수록 셈, 벽 너머는 안 닿음), 맞은 좀비는 2.5초 화상 + 살짝 느려짐. 연료 100, 헤드샷 없음','SALAMANDER: a flamethrower (special). Hold fire for a jet of flame that burns every zombie within 8 m at once (stronger up close, stopped by walls); they keep burning for 2.5 s and slow down a little. 100 fuel, no headshots.'],
 ['UP','시즌 해독기 — 샐러맨더 줄 추가 (12줄 중 무기 3줄: 이벤트 호라이즌 · 스컬-9 · 샐러맨더, 코인 1,000 줄 하나가 빠짐). 지금 깔린 판도 아직 안 채운 코인 1,000 줄이 샐러맨더 줄로 바뀜','Season decoder: a Salamander line (3 gun lines of 12 now: Event Horizon, SKULL-9, Salamander, in the place of a 1,000-coin line). Cards already dealt get it too, on a 1,000-coin line not finished yet.']]],
['v6.12.1','2026-10-10',[
 ['UP','일일 미션 「3승 하기」 보상 — 500 코인 + 근하신년 해독기 1개 → 3개 (오늘 받은 미션에도 바로 적용)','Daily mission "win 3 matches": 500 coins + 3 근하신년 decoders (was 1), today\'s missions included.']]],
['v6.12','2026-10-10',[
 ['NEW','공개 방 목록 — 멀티플레이 메뉴에 지금 열린 방이 떠요 (방장 · 맵 · 모드 · 인원 · 대기중/게임중, 5초마다 갱신). 누르면 바로 참가. 방 코드는 이제 방마다 랜덤 4자리, 방 만들 때 공개/비공개 선택 (공개 방은 로그인한 방장만)','Public room list: the multiplayer menu lists the open rooms (host, map, mode, players, waiting / playing, refreshed every 5 s); click one to join. Every room gets its own random 4-character code; pick public or private when you create one (public rooms need a signed-in host).'],
 ['NEW','일일 미션 — 매일(한국 시간) 쉬움 · 보통 · 어려움 미션 3개. 판 수 · 승리 · 킬 · 헤드샷 킬 · 감염 · 피해량 · 라운드. 보상 150~600 코인, 어려움은 근하신년 해독기 1개도. 진행도는 판이 끝날 때 서버에서 계산, 결과창에 표시','Daily missions: three a day (Korean time), easy / normal / hard: matches, wins, kills, headshot kills, infections, damage, rounds. 150-600 coins each, the hard one a 근하신년 decoder too. Progress is counted on the server when a match ends and shown on the result card.'],
 ['NEW','랭킹 — 레벨 · 킬 · 감염 · 최고 점수 TOP 50, 내 순위는 맨 아래 고정. 로비의 미션 · 랭킹 버튼','Ranking: top 50 by level, kills, infections and best score, your own place pinned at the bottom. Mission and ranking buttons in the lobby.'],
 ['UP','막 감염된 좀비는 2초 동안 할퀼 수 없음 (숙주 제외) — 사람들 사이에서 연쇄 감염이 줄줄이 터지던 것 완화','A freshly infected zombie can\'t claw for 2 s (hosts excepted), so one infection in a crowd no longer chains straight through it.']]],
['v6.11.2','2026-10-10',[
 ['UP','스컬-9 우클릭 내려찍기 — 오른쪽 위에서 왼쪽 아래로 비스듬히 긋던 궤적을 위에서 아래로 일자로 바꿈 (화면 가운데 살짝 오른쪽). 내려오는 동안 날 면이 보이고, 땅에 박힐 때는 날이 똑바로 섬. 찍는 순간 화면이 조금 더 크게 숙여짐','SKULL-9 right click: the slam now comes straight down (one vertical line just right of the crosshair) instead of across from the upper right to the lower left. The blade shows its face on the way down and lands square; the view dips a little more on impact.']]],
['v6.11.1','2026-10-10',[
 ['UP','스컬-9 — 상점 판매 대신 시즌 해독기 줄 보상으로 이동 (이벤트 호라이즌처럼 빙고 줄을 채워야 영구 보유). 12줄 중 1줄, 코인 1,000 줄 하나가 빠짐. 이미 산 사람은 그대로 보유, 이미 가진 상태로 줄을 채우면 10,000 코인. 지금 깔린 시즌 판도 아직 안 채운 코인 1,000 줄 하나가 스컬-9 줄로 바뀜','SKULL-9 leaves the shop for a line on the season decoder card (like Event Horizon, a finished line makes it yours): one of the 12 lines, in the place of a 1,000-coin line. Bought already: yours to keep; owned when its line is done: 10,000 coins. Season cards already dealt get it too, on a 1,000-coin line not finished yet.']]],
['v6.11','2026-10-10',[
 ['FIX','월샷 수정 — 봇이 산탄총을 쏘면 첫 알 말고 나머지 알이 내 머리 위치에서 날아가던 버그(그래서 벽 너머 먼 봇 총에 내 앞 좀비가 맞았음). 봇 총소리가 전부 내 귀 옆에서 크게 들리던 것도 같이 고침. 봇은 벽 뒤로 사라진 상대에게 쏘지 않음','No more wallbangs: a bot\'s shotgun pellets after the first started from the player\'s head, so zombies near you were hit from across the map; every bot gunshot also played right at your ear. Bots no longer fire at targets that went behind walls.'],
 ['FIX','내 캐릭터 판정 위치가 바닥에 멈춰 있던 버그 — 좀비가 긁어도 가끔 감염 안 되던 것(특히 계단·위층), 내가 좀비일 때 봇 총알이 거의 안 맞아서 넉백·경직을 무시하던 것 둘 다 이 버그였음. 헤비 좀비 등 좀비 팔에도 피격 판정 추가','Your own hit position was stuck at the floor: that is why claws sometimes failed to infect you (stairs, upper floors) and why bot bullets barely touched you as a zombie (no knockback or stagger). Zombie arms (the Heavy\'s especially) now take hits.'],
 ['FIX','라운드 끝 결과창(6초) 동안 좀비가 계속 감염시키던 것 — 다음 라운드에 전 라운드 좀비가 덮치던 문제. 오리지널: 죽은 좀비는 그 라운드에 다시 안 나오고 좀비 전멸 시 인간 승리(대신 좀비 체력 1.6배 · 숙주 수 증가)','On the result card between rounds zombies kept infecting (and the last round\'s zombies seemed to jump you next round). Original: a dead zombie stays down for the round; wiping the zombies out wins (so zombies get ×1.6 health and there are more hosts).'],
 ['UP','무기 무료 — 매치 안 판돈($) 시스템 삭제. 총·탄약은 무료로 언제든 교체(계정에서 가진 총만), 수류탄·방탄복은 라운드마다 채워짐. 전 라운드 장비는 감염됐어도 다음 라운드에 그대로. 구매 메뉴(B) 위에 장비 세트 3개(장착 · 현재 장비 저장, Shift+1~3). 시나리오는 무기 강화에만 돈 사용','Free weapons: the round money ($) is gone. Guns and ammo are free to swap any time (guns you own), grenades and armour refill every round, and your last loadout carries into the next round even after being infected. Three loadout sets on top of the buy menu (equip / save current, Shift+1-3). The scenario keeps money for upgrades only.'],
 ['NEW','인간 스킬 — 5번 전력질주(10초 이속 1.45배, 끝나면 5초 숨참), 6번 확인사살(5초 동안 모든 총알 헤드샷 판정). 라운드당 1번씩, 봇도 사용','Human skills: 5 Sprint (10 s at ×1.45, then 5 s out of breath) and 6 Deadshot (5 s of every bullet counting as a headshot). Once per round each; bots use them too.'],
 ['NEW','스컬-9 — 양손 해골 전투도끼 (근접, 상점 9,000 코인). 좌클릭 크게 가로 베기(최대 3마리), 우클릭 들어 올렸다 내려찍기(최대 2마리, 강한 넉백·띄우기·긴 경직, 바닥 충격)','SKULL-9: a two-handed skull battle axe (melee, 9,000 coins in the shop). Left click a wide sweep (up to 3), right click an overhead slam (up to 2, big knockback, pop-up, long stagger, ground impact).'],
 ['NEW','시즌 해독기 — 상점 새 탭. 0~99 빙고(근하신년 0~49보다 칸 맞을 확률 절반), 1개 1,000 · 10개 9,000 코인. 12줄 중 1줄만 이벤트 호라이즌, 나머지는 코인 · 해독 조각 · 근하신년 해독기 3개. 이벤트 호라이즌은 가진 사람만 매치에서 라운드당 1번(3발) 꺼낼 수 있음, 보급상자 드랍은 그대로','Season decoder: a new shop tab. A 0-99 bingo (half the 근하신년 card\'s hit chance), 1,000 coins or 10 for 9,000. One of the 12 lines holds Event Horizon, the others coins, fragments and three 근하신년 decoders. Owners can take Event Horizon once per round in a match (3 shots); crates still drop it.'],
 ['UP','봇 시즈 모드 개편 — 인간 봇이 여러 곳으로 흩어지고 주기적으로 자리 이동, 좀비 9m부터 뒷걸음, 옆에서 감염되면 흩어짐, 원거리 레이저 조준 완화. 좀비 봇은 시야 밖에 모였다가 같이 돌격하고 경로를 나눠 측면으로 들어오며 다치면 물러나 회복. 숙주 16명 기준 3명, 좀비 2명 이하일 때 역전 보정, 사기 버프 최대 +50%','Bots rework: human bots spread over several spots and move now and then, back off from 9 m, scatter when someone near turns, and no longer laser-aim at range. Zombie bots gather out of sight and rush together on split routes, and fall back to heal. 3 hosts for 16 players, a comeback boost when 2 or fewer zombies are up, morale capped at +50 %.'],
 ['UP','좀비 — 손톱 사거리 약간 감소(2.0→1.75, 강공 2.3→2.0), 기본 이속 -5%, 총 맞을 때 움찔 시간 +25%(큰 한 방은 더 길게). 정전은 20%로 줄이고 12~18초, 어두운 맵도 완전히 까맣게는 안 됨, 정전 때 손전등 자동 켜짐, 방 설정에서 끌 수 있음','Zombies: claw reach a little shorter (2.0→1.75, heavy 2.3→2.0), 5 % slower, staggered a quarter longer by bullets (big hits longer). Blackouts: 20 %, 12-18 s, never pitch-black on dark maps, the flashlight comes on, and a room setting turns them off.'],
 ['FIX','실제 서버에서 근하신년 무기가 상점에 「보급 전용」으로 보이던 것, 시나리오 좀비 부활 모션이 생략되던 것, 모바일 빠른 구매로 잠긴 총이 사지던 것','Fixed: 근하신년 guns showing as crate-only with the real server, scenario zombies skipping their get-up, and the phone quick-buy getting locked guns.']]],
['v6.10','2026-10-10',[
 ['NEW','근하신년 해독기 빙고 — 복주머니 대신 해독기. 0~49 중 25개 숫자가 깔린 5×5 빙고판이 계정마다 하나씩 있고, 가로 5 · 세로 5 · 대각 2 = 12줄마다 근하신년 무기(S 6 · A 6)가 하나씩 걸려 있음. 해독기를 열면 아직 안 나온 숫자 하나가 나오고, 판에 있으면 도장 쾅. 한 줄을 채우면 그 줄 끝의 무기 획득(이미 있으면 S줄 3,000 코인 · A줄 조각 30개). 숫자가 겹치지 않아서 최대 50개면 판 전체 완성(평균: 첫 줄 약 29개, 전체 약 49개), 다 채우면 새 판','근하신년 decoder bingo replaces the lucky pouch: every account has a 5×5 card of 25 numbers from 0-49, and each of its 12 lines (5 rows, 5 columns, 2 diagonals) holds a 근하신년 gun (6 S, 6 A). A decoder shows a number not drawn yet; on the card it is stamped. Finish a line and its gun is yours (owned already: 3,000 coins for an S line, 30 fragments for an A line). Numbers never repeat, so 50 decoders always finish the card (about 29 for the first line, 49 for all of it on average); a full card is replaced.'],
 ['NEW','해독기 1개 600 코인 · 10개 5,400 코인 · 하루 1개 무료, 해독기마다 해독 조각 1~3개(조각 교환: S 200 · A 80). 초기화(새 판, 무료) · 뒤섞기(안 찍힌 숫자 자리 섞기, 하루 3번). 숫자는 전부 서버에서 뽑음','A decoder costs 600 coins, ten 5,400, one a day is free; each gives 1-3 fragments (exchange: S 200, A 80). Reset (a new card, free) and shuffle (the open numbers change places, 3 a day). Every number is drawn on the server.'],
 ['UP','연출 — 해독기가 떨리며 숫자가 돌다가 멈추고, 맞은 칸에 빨간 도장이 쾅, 줄이 완성되면 다섯 칸이 금빛으로 번쩍이고 보상 아이콘이 튐. 끝나면 BINGO! 카드로 받은 무기를 한 장씩 뒤집어 보여줌. 보상 아이콘에 마우스를 올리면 그 줄이 표시됨','The draw: the decoder shakes while the number spins and lands, a hit is stamped in red, a finished line flashes gold and its reward jumps; at the end the BINGO! cards turn over one by one. Point at a reward to see its line.']]],
['v6.9','2026-10-10',[
 ['NEW','레벨 · 경험치 · 전적이 계정에 저장 — 로그인하면 로비의 레벨과 내 전적(플레이 · 킬 · 감염 · 최고 점수)이 계정 것으로 바뀌고, 다른 PC나 폰에서 로그인해도 그대로. 경험치는 판이 끝날 때 코인과 같이 서버가 계산(판당 최대 3,000). 처음 로그인할 때 이 브라우저에 쌓여 있던 레벨 · 전적을 그 계정으로 한 번 옮겨 줌. 로그아웃하면 게스트용 브라우저 기록이 보임','Level, XP and record saved to your account: signed in, the lobby level and record (games, kills, infections, best score) are the account\'s, on any PC or phone. XP is worked out on the server with the coins when a match ends (3,000 at most per match). The first sign-in on a browser brings the level and record it kept into that account, once. Signed out, the browser\'s guest record shows.']]],
['v6.8.1','2026-10-09',[
 ['FIX','Supabase SQL Editor에서 schema.sql 실행 시 "unterminated dollar-quoted string" 오류 수정 (에디터의 RLS 자동 켜기가 함수 안 조회문을 테이블 만들기로 착각하던 문제). 공개 키는 새 publishable key(sb_publishable_…)도 지원','Fixed "unterminated dollar-quoted string" when running schema.sql in the Supabase SQL Editor (its auto-RLS helper mistook lookups inside functions for table creation). The new publishable keys (sb_publishable_…) work as the public key.']]],
['v6.8','2026-10-09',[
 ['NEW','근하신년 복주머니 — 근하신년 무기 12종은 이제 상점에서 못 사고 복주머니로만 얻음. S등급 6종(적룡포 · 매그넘 드릴 · 매그넘 런처 · 볼케이노 · 흑룡포 · 게이볼그), A등급 6종(혈적자 · 리퍼 · 크로스보우 어드밴스 · 크로스보우 · 스털링 바요넷 · 스페셜 덕 풋 건). 1회 500 코인, 10회 4,500 코인(A 이상 1개 보장), 하루 1번 무료. 확률: S 2% · A 8% · 코인 30%(100~1,000) · 복 조각 60%(2~5개). S가 안 나오면 60번째에 S 확정(천장, 남은 횟수는 복주머니 아래 표시). 이미 가진 무기는 안 나오고 그 확률은 같은 등급의 남은 무기로 나뉨, 한 등급을 다 모으면 S 자리는 3,000 코인, A 자리는 조각 30개','근하신년 lucky pouch: the twelve 근하신년 guns are no longer sold; they only come out of the pouch. Six S (Red Dragon Cannon, Magnum Drill, Magnum Launcher, Volcano, Black Dragon Cannon, Gae Bolg) and six A (Blood Dripper, Ripper, Crossbow Advance, Crossbow, Sterling Bayonet, Special Duck Foot Gun). One pull 500 coins, ten 4,500 (at least one A or better), one free pull a day. Odds: S 2 %, A 8 %, coins 30 % (100-1,000), fragments 60 % (2-5). No S in 59 pulls makes the 60th an S (the count shows under the pouch). Guns you own never come up and their share goes to the rest of the grade; with a whole grade owned an S pays 3,000 coins and an A 30 fragments.'],
 ['NEW','조각 교환 — 복 조각 200개로 원하는 S등급, 80개로 원하는 A등급 무기를 골라서 받음. 상점의 세 번째 탭','Fragment exchange: 200 fragments for the S gun of your choice, 80 for an A. The shop\'s third tab.'],
 ['NEW','뽑기 연출 — 복주머니가 흔들리다 터지며 나온 등급 색으로 번쩍, 카드가 한 장씩 뒤집히고(10회는 차례로) 새 무기엔 NEW, 천장으로 나온 S엔 천장 표시, S 카드는 금빛으로 빛남. 건너뛰기 · 한 번 더 버튼, 확률 정보 표(무기별 실제 확률), 최근 50개 뽑기 기록','The pull: the pouch shakes and bursts in the colour of the best grade inside, the cards turn one by one (in turn for ten), new guns are marked NEW and a pity S is marked, S cards glow gold. Skip and pull-again buttons, an odds table with each gun\'s real share, and the last 50 pulls.'],
 ['UP','매치 구매 메뉴 — 근하신년 무기는 가지고 있으면 판돈($)으로 사고, 없으면 자물쇠와 「복주머니」 표시. 보급상자 · 바닥 줍기 · 근하신년 무료 교환 · 사격장은 그대로. 확률 · 천장 · 조각은 전부 서버에서 계산','Buy menu: a 근하신년 gun you own is bought with round money; one you don\'t shows a lock and "pouch". Crates, floor pick-ups, the 근하신년 free pick and the range are unchanged. Odds, pity and fragments are all worked out on the server.'],
 ['FIX','스페셜 덕 풋 건 아이콘에 총열이 안 보이던 것 수정 (옆으로 벌어진 부품이 아이콘 그림에서 빠지던 문제)','Fixed the Special Duck Foot Gun icon missing its barrels (parts splayed sideways were left out of icons).']]],
['v6.7','2026-10-09',[
 ['NEW','계정 · 코인 — 로그인(이메일, 구글·카카오 선택)하면 매치가 끝날 때마다 성적(라운드·킬·감염·피해량·승리·MVP)에 따라 코인이 쌓임. 가입하면 3,000 코인, 그날 첫 판 +200. 코인 계산과 구매는 전부 서버에서 하고 판당·시간당·하루 상한이 있어서 조작으로 못 늘림','Accounts and coins: sign in (e-mail, Google or Kakao) and every finished match pays coins for rounds, kills, infections, damage, wins and MVP. 3,000 coins to start with, +200 for the first match of the day. Coins are counted and spent on the server, with caps per match, per minute and per day.'],
 ['NEW','상점 — 로비의 상점 버튼. 총을 코인으로 영구 구매: 카테고리별 카드, 위력·연사·넉백·기동 그래프, 판돈 가격, 구매 확인까지. 기본 지급은 씰 나이프 · USP · M3 · MP5 · 갈릴, 나머지는 1,200 ~ 16,000 코인 (근하신년 무기가 가장 비쌈). 이벤트 호라이즌은 보급상자 전용','Shop: the shop button in the lobby. Guns are bought for good with coins: cards by category, power / fire rate / knockback / mobility bars, the round price, a confirm step. Free for everyone: Seal Knife, USP, M3, MP5, Galil; the rest cost 1,200 to 16,000 coins (the 근하신년 guns most). Event Horizon stays crate-only.'],
 ['UP','매치 안 구매 — 판돈($)으로는 내가 가진 총만 살 수 있고, 안 가진 총은 구매 메뉴에서 자물쇠 + 코인 가격으로 표시. 바닥에 떨어진 총 줍기 · 보급상자 · 근하신년 무료 교환은 그대로, 사격장에서는 모든 총을 빌려 쏴 볼 수 있음. 로그인 안 하면 게스트로 기본 총만','In a match, round money only buys guns you own; the others show a lock and their coin price in the buy menu. Floor pick-ups, supply crates and the 근하신년 free pick still give any gun, and the shooting range lends every gun. Guests get the free guns.']]],
['v6.6','2026-10-09',[
 ['NEW','사격장 — 로비 네 번째 카드. 지붕 덮인 사선 6칸과 60 m 사거리, 10·15·20·25·30·50 m에 선 좀비 더미와 좌우로 걸어 다니는 이동 표적 2개. 무기는 전부 무료(B), 탄약은 무한. 왼쪽 기록판에 DPS · 명중률 · 헤드샷 비율 · 최근 피해(데미지 · 부위 · 거리) · 처치 수와 TTK가 실시간으로 뜸. K 기록 초기화, J 이동 표적 켜기/끄기. 더미는 안 맞으면 2.5초 뒤 체력이 다시 차고, 쓰러지면 2초 뒤 제자리에서 일어남','Shooting range: the fourth lobby card. Six covered stalls and a 60 m range, zombie dummies at 10, 15, 20, 25, 30 and 50 m and two that walk across it. Every weapon is free (B) and ammunition never runs out. A record on the left shows DPS, accuracy, headshot rate, the last hit (damage, where, how far), kills and time to kill. K clears the record, J stops or starts the walkers. Dummies heal 2.5 s after the last hit and get up 2 s after they go down.'],
 ['UP','재장전 모션 v2 — 모든 총의 재장전을 첫 장전과 같은 엔진으로 새로 만듦. 총을 들어 옆으로 돌려 탄창 구멍이 보이게 하고, 빈 탄창은 빙글 돌며 떨어지고, 왼손이 화면 아래 벨트에서 새 탄창을 가져와 꽂은 뒤 손바닥으로 쳐서 고정. 빈 총이면 마무리가 총마다 다름: 권총은 뒤로 물린 슬라이드를 놓아 철컥, M4는 노리쇠 멈치를 탁, AK·MP5·스카웃 등은 각자 장전 동작. 샷건은 손에 쥔 탄을 한 발씩 밀어 넣고(빈 총이었으면 마지막에 펌프), 리볼버는 실린더를 열어 탄피를 털고 스피드로더, 중절식은 두 발을 엄지로 밀어 넣고 손목으로 닫기, 벨트 급탄은 탄통을 갈고 덮개·벨트, 석궁은 볼트를 레일에 얹어 밀기. 사격으로 끊으면 자연스럽게 풀리고, 효과음은 손 동작에 맞춰 나옴','Reloads v2: every reload rebuilt on the first-draw engine. The gun comes up and turns so the magazine well is in view, the empty mag tumbles out, the free hand brings a fresh one up from the belt, seats it and slaps it home. From empty each gun finishes its own way: a pistol drops its locked slide, the M4 gets its bolt catch tapped, the AK, MP5, Scout and others are charged. Shotguns are fed one shell at a time from the hand (and racked after the last one when empty), revolvers swing the cylinder out, dump the brass and take a speed loader, break actions take two shells, belt-fed guns get a new box and belt, crossbows have a bolt laid on the rail. Firing cuts a reload off smoothly, and the sounds follow the hands.'],
 ['UP','칼 휘두르기 v2 — 칼을 쥔 주먹은 그대로 두고 팔이 어깨에서 휘둘러짐(팔꿈치가 동작을 따라 움직임). 약공격은 오른쪽→왼쪽 베기와 왼쪽→오른쪽 백핸드가 번갈아 나오고, 강공격은 높이 들어 올렸다가 꽂아 넣는 찌르기. 예비동작에서 한 박자 멈췄다가 칼날이 목표에 닿는 순간 가장 빠름. 맞히면 아주 잠깐 멈추는 타격감(히트스톱)과 화면 반동, 잔상은 칼날이 가장 빠를 때만','Knife swings v2: the fist stays round the grip and the arm swings from the shoulder, the elbow travelling with the stroke. Light attacks alternate a right-to-left slash and a left-to-right backhand; the heavy attack is a raised stab driven straight in. Each wind-up holds for a beat and the blade is fastest where it meets the target. A blow that lands stops the swing for an instant (hit-stop) with a kick of the view, and the trail only shows while the blade is fastest.'],
 ['FIX','재장전·첫 장전 중 손이 한 프레임 튀던 것 수정 — 샷건에 한 발씩 넣을 때 다음 탄으로 넘어가는 순간 손이 기본 자세로 순간이동하던 것, 팔이 수직을 지날 때 손등이 반 바퀴 뒤집히던 것. XM1014 가늠자가 허공에 떠 있던 것, P90 조준경이 받침 없이 떠 있던 것도 수정','Fixed one-frame snaps in reloads and first draws: the hand jumping back to its rest pose between two shells of a shotgun reload, and the hand flipping half a turn when the forearm swung through vertical. The XM1014 rear sight and the P90 sight no longer float in the air.']]],
['v6.5.1','2026-10-09',[
 ['UP','첫 장전 모션 전면 재제작 — 손이 이제 진짜 손처럼 움직임: 손가락 관절이 있어서 부품을 움켜쥐고, 놓는 순간 손가락이 펴지며 튕겨 나감. 팔은 화면 밖 팔꿈치를 향해 꺾여서 손만 둥둥 떠다니지 않고, 손등 방향도 손목이 실제로 도는 방향으로 돌아감','First-draw motions rebuilt — the hands now move like hands: jointed fingers close round the part and spring open the moment they let go, the forearm turns toward an elbow off screen so the hand never floats, and the wrist rolls the way a real wrist turns.'],
 ['UP','움직임 곡선·물리 — 키프레임은 넘침 없는 부드러운 곡선, 동작 전 살짝 예비동작과 끝의 여운까지. 슬라이드·노리쇠·덮개·크레인은 손을 떠나는 순간 스프링 힘으로 날아가 부딪히고 튕기며, 부딪히는 바로 그 순간에 소리·총 반동·카메라 흔들림이 맞춰 터짐. 꺼내는 동작이 끝나기 전에 장전이 겹쳐 시작돼 끊김 없이 이어짐','Curves and physics — smooth keyframes without overshoot, a little wind-up before and a settle after every move. Slides, bolts, covers and cranes fly home on their springs the instant the hand lets go, hit and bounce, and the sound, the gun\'s kick and the camera jolt land on that exact impact. The action starts while the raise is still finishing, so it flows as one move.'],
 ['UP','총마다 보여주는 각도 재설계 — 권총은 총구를 위로 들어 슬라이드 뒤를 잡아 당김(당기면 총열이 드러남), AK·갈릴·SG552·XM1014·USAS·스털링은 총을 크게 눕히고 손이 아래로 돌아 들어와 손잡이를 잡아챔, MP5는 레버 걸고 손바닥을 펴 내리침, M4는 손가락으로 T자 손잡이 끝을 걸어 당긴 뒤 손바닥으로 전진기 탁, AWP·스카웃은 오른손이 그립을 놓고 볼트를 돌려 당겼다 밀고, 더블배럴·M79는 옆으로 돌려 총열이 꺾이는 게 보이게, 펌프 샷건은 펌프가 화면을 가로질러 척-척, 리퍼는 톱을 들어 올려 시동줄이 보이게, 게이볼그는 총구를 손 닿는 데까지 끌어와 작살을 밀어 넣음, 흑룡포·적룡포는 손바닥으로 용의 목을 쳐서 깨움','Each gun shown from its own angle — pistols tip up so the hand can rack the back of the slide (the barrel shows as it opens), AK/Galil/SG552/XM1014/USAS/Sterling roll over while the hand sweeps up underneath to snatch the handle, the MP5 lever is locked and slapped down with an open palm, the M4\'s T-handle is hooked and the forward assist knocked, AWP/Scout bolts are run by the gun hand, the double barrel and M79 turn side-on so the break is seen, the pump runs across the screen, the Ripper is lifted so its starter cord shows, the Gae Bolg is drawn in until the spear is in reach, and the dragon cannons are woken with a slap on the neck.'],
 ['NEW','새 효과음 — 권총 슬라이드 닫힘, 소총 노리쇠 닫힘, 펌프 뒤로·앞으로를 따로, 장갑 손이 쇠를 잡는 소리 (design.js 1부에서 파일로 교체 가능)','New sounds — pistol slide home, rifle bolt home, pump back and pump forward as separate strokes, a gloved hand gripping metal (each can be swapped for a file in part 1 of design.js).'],
 ['FIX','AWP·스카웃 볼트가 총열 축이 아니라 손잡이 아래를 축으로 돌던 것 수정 (사격 후 볼트 동작도 바로잡힘), 왼손 엄지가 반대편에 붙어 있던 것 수정','Fixed the AWP/Scout bolt turning about the grip instead of the bore (the after-shot bolt cycle too), and the left hand\'s thumb sitting on the wrong side.']]],
['v6.5','2026-10-09',[
 ['NEW','총기 아이덴티티 — 총을 사거나 줍거나 보급상자로 얻고 처음 꺼낼 때, 그 총만의 장전 동작이 나옴: 권총은 슬라이드 철컥, 아나콘다는 실린더 열고 돌리고 닫고 해머, 듀얼 베레타는 X자 뒤 두 슬라이드 동시에, AK·갈릴·SG552는 오른쪽 손잡이, M4는 T자 손잡이+전진기, MP5·UMP·G3는 HK 슬랩, 샷건은 펌프·장전손잡이·중절, 저격총은 볼트, 기관총은 덮개 열고 벨트 얹고 장전, 미니건은 모터 시동, 리퍼는 시동줄 두 번 등 (첫 꺼내기만 0.4~1.4초 더 걸림)','Gun identity — the first time a gun comes out after you buy, pick up or crate it, it is made ready its own way: slides racked, the Anaconda\'s cylinder opened, spun and shut, AK/Galil/SG552 side handles, the M4\'s T-handle and forward assist, the HK slap on MP5/UMP/G3, pumps, bolts and break actions, belt-fed guns opened and loaded, the minigun spun up, the Ripper pull-started twice (first draw only, 0.4-1.4 s longer).'],
 ['NEW','약실 +1 — 폐쇄형 노리쇠 총은 탄이 남은 채 재장전하면 약실에 1발이 남아 탄창+1 (AK 31발, 듀얼 베레타 32발). 오픈볼트(MAC-10·스털링·M249·MG3)·리볼버·튜브식 샷건·중절식은 해당 없음','A round in the chamber — closed-bolt guns reloaded before they run dry hold one more (AK 31, Dual Berettas 32). Not for open-bolt guns (MAC-10, Sterling, M249, MG3), revolvers, tube shotguns or break actions.'],
 ['UP','탄창 수를 실제 총과 대조 — 대부분 이미 실제와 같았고, M134 미니건은 200→500발(예비 500). USAS-12는 20발 드럼 모양으로 교체. 총마다 실제 모델·탄창·장전 동작은 design.js 「총기 아이덴티티」 표에서 관리','Magazines checked against the real guns — most already matched; the M134 goes from 200 to 500 rounds (500 spare) and the USAS-12 now carries its 20-round drum. Each gun\'s real model, magazine and ready action live in the gun identity table in design.js.']]],
['v6.4','2026-10-08',[
 ['NEW','보급상자 — 라운드 중 20~30초 뒤 첫 투하, 이후 35~50초마다 낙하산을 단 보급상자가 사람 근처 트인 곳에 떨어짐(최대 2개). 붉은 연기와 화면·미니맵 표시로 위치를 알려주고, 인간이 밟으면 열림: 45% 보급상자 전용 무기, 30% 중화기, 나머지는 보급품(탄약 가득·방탄복·수류탄·$1000)','Supply crates — the first one 20-30 s into the round, then every 35-50 s a crate parachutes into an open spot near the humans (two at most). Red smoke and markers on screen and minimap show where; a human walking into it opens it: 45 % the crate-only weapon, 30 % a heavy weapon, otherwise supplies (full ammo, armour, grenades, $1000).'],
 ['NEW','보급상자 전용 무기 「이벤트 호라이즌」 — 느린 구체를 쏘면 맞은 곳에 블랙홀이 3초간 열려 9m 안의 좀비를 끌어당겨 공중에 띄우고 갈아버린 뒤 폭발. 상점에서 안 팔고 탄약도 보급상자로만 채워짐 (3발)','Crate-only weapon "Event Horizon" — a slow orb opens a black hole where it lands: for 3 s it drags every zombie within 9 m in, lifts and grinds them, then collapses in a blast. Not sold, and its 3 shots only come back from crates.'],
 ['UP','리퍼 경직 강화 — 톱날에 물린 좀비는 거의 못 움직이고(속도 12%) 점프·할퀴기·스킬을 못 씀. 휘두르기에 맞으면 더 오래 묶임. 숙주 좀비는 덜 묶이고 공격은 가능, 경직화 중인 헤비 좀비는 무시','Ripper stagger buffed — a zombie caught in the chain can barely move (12 % speed) and cannot jump, claw or use its skill; a swing pins it longer. Host zombies are slowed less and can still attack; a hardened Heavy ignores it.']]],
['v6.3','2026-10-08',[
 ['NEW','넉백 무기 「에어 버스터」 (특수 · $3300) — 압축공기를 부채꼴로 초당 10번 뿜어 좀비를 뒤로 날려버림. 피해는 약하지만 사거리 8m 안의 여러 마리를 한꺼번에 밀어내고, 4발마다 살짝 띄워 올림. 재장전은 등에 멘 공기탱크 교체','Knockback gun "Air Burster" (Special · $3300) — blasts a cone of compressed air 10 times a second: weak damage, but shoves every zombie within 8 m back and lifts them every fourth blast. Reload swaps the air tank.'],
 ['NEW','정전 이벤트 — 라운드 중 가끔(약 45%) 전기가 나가 20초쯤 맵 조명·간판·창문 불빛이 꺼짐. 불·조명탄·총구 섬광·손전등만 빛남. 인간 봇은 손전등을 켬','Blackout — now and then (about 45 % of rounds) the power fails for ~20 s: lamps, signs and windows go dark; only fires, flares, muzzle flashes and flashlights light the map. Human bots switch their flashlights on.'],
 ['NEW','감염 연출 — 감염되는 순간 붉은 섬광, 화면이 찢어지듯 갈라지고 핏줄이 가장자리부터 번지며 심장박동에 맞춰 맥동. 주변에서 누가 감염되면 피 안개·초록 포자·붉은 고리가 터지고 변이가 끝나면 포효','Infection effects — a red flash, the picture tearing apart and dark veins creeping in from the edges with the heartbeat. Anyone who turns bursts into blood mist, green spores and a red ring, and roars once the change is done.'],
 ['UP','라운드 결과 화면 — 라운드가 끝나면 승리 팀, 인간 MVP·좀비 MVP, 이번 라운드의 킬·감염·피해량과 각자 결과(생존·감염·숙주·사망), 내 라운드 보상을 카드로 보여줌','Round result card — the winner, the round\'s human and zombie MVPs, everyone\'s kills, infections and damage this round with what became of them, and your round bonus.']]],
['v6.2.1','2026-10-08',[
 ['NEW','좀비 탑쌓기 — 발코니·담 위·지붕 끝처럼 길로는 못 가는 높은 곳에 사람이 있으면, 좀비 하나가 그 아래(하늘이 트인 가장자리 밑)에 웅크리고 다른 좀비가 머리를 밟고 올라감. 2단이면 약 4m까지. 같은 팀끼리는 머리 위에 설 수 있음','Zombie stacking — when someone stands where no path leads (a balcony, a wall top, a roof edge), one zombie crouches under the edge and the next climbs on its head; two high reaches about 4 m. Teammates can stand on each other\'s heads.'],
 ['FIX','발코니 위 사람을 좀비가 바로 밑 길바닥으로 착각해 그 밑에 몰려만 있던 문제','Zombies no longer mistake someone on a balcony for the street right under it and crowd beneath.'],
 ['UP','죽은 좀비가 맵의 무작위 장소(사람에게서 떨어진 곳)에서 부활 — 뮤테이션도 쓰러진 자리 대신 랜덤 위치','Dead zombies come back at a random spot on the map away from humans — in Mutation too, instead of where they fell.'],
 ['UP','모바일 조이스틱 고정형 — 손가락을 따라다니지 않고 제자리(조금 더 오른쪽)에 고정','Mobile joystick is fixed in place (a little further right) instead of following the thumb.'],
 ['NEW','폰 세로 고정 사용자용 「가로모드로 전환 · 고정」 버튼 — 세로로 들고 있으면 뜨는 안내 화면과 로비 상단(폰에서만)에 있음. 누르면 전체화면 + 가로 고정(안드로이드). 아이폰은 브라우저가 막고 있어서 제어센터의 세로 방향 잠금을 끄는 방법을 안내해 줌','Phone landscape button for players who keep portrait lock on — on the rotate-your-phone screen and in the lobby top bar (phones only). Goes fullscreen and locks landscape (Android); on iPhone, where the browser forbids it, it explains how to turn off the rotation lock.']]],
['v6.2','2026-10-08',[
 ['NEW','모든 좀비가 포자탄을 가짐 — 오리지널·뮤테이션 둘 다 감염되거나 부활할 때마다 포자탄 1개 (시나리오 제외). 좀비 봇도 무리 지은 인간, 높은 곳·닿지 않는 곳의 인간, 자기를 쏘는 인간에게 던짐','Every zombie carries a spore bomb: in Original and Mutation, one with every infection and revival (not in the scenario). Zombie bots throw it at groups, at humans up high or out of reach, and at whoever is shooting them'],
 ['UP','인간 봇이 한자리에 박혀 있지 않고 맵을 돌아다님 — 대부분은 잠깐 머물렀다가 다른 캠프나 좀비가 없는 빈 공간으로 이동, 좀비가 보이면 멈춰서 사격하고 조용해지면 다시 이동 (일부는 캠프를 지킴)','Human bots no longer sit in one spot all round: most hold briefly, then move on to another camp or open ground away from the zombies, stop to shoot when a zombie shows up and move again once it is quiet (a few still hold their camp)'],
 ['FIX','좀비 봇이 사람이 보인다고 무조건 직진하지 않음 — 사이에 벽·상자·난간·구멍·단차가 있으면 길을 찾아 돌아가고, 지붕처럼 닿을 수 없는 곳의 사람은 가장 가까운 곳까지 가서 그 아래를 맴돌며 점프를 시도 (벽에 몸을 비비는 시간이 크게 줄어듦)','Zombie bots no longer run straight at anyone they can see: with a wall, crate, railing, gap or ledge in between they take the way round, and under someone out of reach (on a roof) they go to the nearest point, pace below and try to jump up (far less time spent pushing into walls)']]],
['v6.1.4','2026-10-08',[
 ['NEW','듀얼 베레타 — 꺼낼 때 두 총을 X자로 교차했다가 원래 자세로, 조준 키(우클릭 / 모바일 조준 버튼)로 총을 옆으로 눕혀 양쪽으로 벌리는 자세로 전환 — 이 자세에선 꾹 누르면 연사 (다시 누르면 원래 자세·단발)','Dual Berettas: crossed in an X while being drawn, and the aim key (RMB / the phone aim button) switches to a wide stance with both guns turned on their sides that fires full-auto while held (press again for the normal stance, semi-auto)']]],
['v6.1.3','2026-10-08',[
 ['NEW','좀비모드 카운트다운 음악 — 숙주 등장 전 10초 카운트다운이 시작되면 라운드 시작 사운드의 앞 9초가 나옴 (삑 소리 대신)','Infection modes: the first 9 seconds of the round-start track play over the countdown before the host appears (instead of the beeps)'],
 ['UP','좀비가 맞을 때 새 피격음, 맞을 때마다 나옴 (한 좀비당 0.35초 간격)','New zombie hurt sound, now on every hit (at most every 0.35 s per zombie)']]],
['v6.1.2','2026-10-08',[
 ['UP','듀얼 베레타 새 색 — 오른손은 검정이 섞인 딥레드, 왼손은 딥옐로우 (1인칭·3인칭·바닥에 떨어진 총 모두)','Dual Berettas recoloured: the right gun deep red clouded with black, the left one deep yellow (first person, third person and on the floor)'],
 ['NEW','design.js — 효과음 121개(볼륨·음높이·녹음 파일 교체)와 캐릭터 외형(인간 4명·좀비 8종·1인칭 팔 색)을 한 파일에서 관리, 항목마다 무슨 디자인·어디서 나는 소리인지 주석','design.js: all 121 sound effects (volume, pitch, swap in a recorded file) and every character look (4 humans, 8 zombies, first-person arm colours) in one file, each entry commented with what it is and where it plays']]],
['v6.1.1','2026-10-08',[
 ['UP','멀티 방 코드가 항상 1234 — 방 만들기만 누르면 1234 방이 열리고, 참가 칸에도 1234가 미리 들어가 있음 (이미 열려 있으면 그 방으로 자동 참가)','The room code is always 1234: create opens room 1234, join is pre-filled (if it is already open you join it)']]],
['v6.1','2026-10-08',[
 ['NEW','무기 버리기·줍기 — G(모바일: 들고 있는 무기 슬롯 길게 누르기)로 버리고, 그 슬롯이 비어 있으면 바닥의 무기를 밟기만 해도 주움. 죽거나 감염되면 주무기를 떨어뜨림','Drop and pick up guns: G (phone: hold the weapon in hand) drops it, walk over a gun to take it into an empty slot; the fallen drop their primary'],
 ['NEW','그래픽 프리셋 — 옵션 › 비디오에 고화질·균형·저사양 원터치 버튼, 렌더 해상도 150%·200% (폰·고해상도 화면에서 실제 화소로 선명하게)','Graphics presets (high / balanced / low) and 150% / 200% render resolution for sharp phone and retina screens'],
 ['UP','이탈리아 로딩 약 40% 단축','Italy loads about 40% faster'],
 ['FIX','헤비·거대 좀비가 좁은 문·계단에 끼면 웅크려서 비집고 지나감','Heavy and giant zombies crouch and squeeze through tight doors and stairs'],
 ['FIX','빅트리 성탑 계단 옆면·옥상 계단 구멍에 난간','Big Tree keep stair: side rail and a rail round the roof stairwell']]],
['v6.0.2','2026-10-08',[
 ['UP','이탈리아 — 원본 텍스처 테스트 버전을 되돌리고, 원본의 벽·바닥·지붕 색을 읽어 우리 텍스처로 다시 칠함 (연어색·주황·황토·노랑·회색 외벽, 맨벽돌, 돌벽, 붉은 바닥, 판석, 평지붕)','Italy: back to our own textures, now picked and tinted from the reference colours (salmon, orange, tan, ochre, grey plaster, brick, stone, red and flag floors, flat roofs)'],
 ['UP','게임 파일 다시 가벼워짐 (5.6 MB → 1.9 MB)','Game file light again (5.6 MB → 1.9 MB)']]],
['v6.0.1','2026-10-08',[
 ['UP','이탈리아 — 원본 레퍼런스 텍스처(구워진 조명 포함)로 표시, 충돌은 기존 박스 그대로 (테스트 버전)','Italy shows the reference textures (baked light); collision stays on the boxes (test build)'],
 ['FIX','이탈리아 바닥 높이를 원본 표면에 맞춤 (1/16 m)','Italy floors match the reference surfaces (1/16 m)']]],
['v6.0','2026-10-08',[
 ['NEW','이탈리아 맵 전면 재제작 — 3D 레퍼런스의 지형·높낮이·골목을 그대로 따라 새로 지음 (남쪽 낮은 거리 → 시장 → 북쪽 윗마을, 계단·아치·실내)','Italy rebuilt from a 3D reference: the real street plan, levels, stairs, arches and rooms'],
 ['NEW','신규 맵 「빅트리」 — 거대한 고목이 자라난 폐허 성채. 나무 데크·성탑 옥상·성벽 회랑·마른 연못까지 3단 높낮이','New map: Big Tree — a ruined castle round a giant tree, three height levels'],
 ['UP','이탈리아 지형 출처: "Cs_Italy with real light" by Neo_minigan (CC BY 4.0)','Italy geometry reference: "Cs_Italy with real light" by Neo_minigan (CC BY 4.0)']]],
['v5.9.1','2026-10-08',[
 ['NEW','전체화면 버튼 — 로비·일시정지·옵션, 게임 중 Alt+Enter (아이폰은 홈 화면 추가 안내)','Fullscreen button in the lobby, pause menu and options, Alt+Enter in game (iPhone: add-to-home-screen help)'],
 ['FIX','무기를 바꿔 이어 친 데미지가 숫자 하나로 합쳐져 표시','Damage dealt right after a weapon swap now shows as one merged number']]],
['v5.9','2026-10-07',[
 ['NEW','신규 맵 「영동 휴게소」 — 눈 내리는 고속도로 휴게소. 주유소 지붕·세차장 옥상·전망대·육교, 화물차 주차장, 화장실, 놀이터','New map: Yeongdong Rest Stop — snowy highway services with a climbable canopy, car-wash roof, lookout, footbridge, truck park, restrooms, playground'],
 ['NEW','눈 내리는 날씨 효과','Falling snow weather'],
 ['UP','흑룡포 · 적룡포 · 게이볼그가 한 발씩 장전하는 단발 장전 무기로 변경','Black/Red Dragon Cannon and Gae Bolg now reload one round at a time'],
 ['UP','모든 총의 예비 탄약 2배','Every gun carries twice the spare ammo'],
 ['UP','헤비 좀비 체력 너프 (HP 2700, 방어 220)','Heavy zombie nerfed (HP 2700, armour 220)'],
 ['FIX','근접무기를 휘두르는 중에 다른 무기로 바꿔도 근접 데미지가 그대로 들어감','A melee swing still lands if you switch weapons mid-swing'],
 ['FIX','맵이 커져도 좀비 길찾기·충돌이 정상 동작하도록 엔진 수정','Engine fixes so zombie pathfinding and collision work on large maps']]],
['v5.8','2026-10-07',[
 ['NEW','좀비 시나리오 — 협동 PvE, 5스테이지 × 3웨이브, 거대 좀비 보스, 보급 상자와 무기 강화','Zombie Scenario — co-op PvE, 5 stages × 3 waves, a giant boss, supply drops and weapon upgrades'],
 ['NEW','관짝 좀비 — 관 방패를 세우고, 부서지면 폭발','Coffin Zombie — raises a coffin wall that bursts when broken'],
 ['NEW','부두 좀비 — 인형을 양손에 쥐고 후려침','Voodoo zombie — clubs with a rag doll'],
 ['UP','좀비에게 한 대만 맞아도 즉시 감염 (방어구로도 못 막음)','One claw hit infects, armour no longer absorbs it'],
 ['FIX','모바일 방 만들기·대기실·옵션 창이 화면에 꽉 차 터치가 안 되던 문제','Phones: room, waiting-room and options windows no longer clip or block taps']]],
['v5.7','2026-10-07',[
 ['NEW','모바일 UI 전면 개편 — 엄지 배치, 무기 슬롯 바, 조준 보정 + 자동 사격, 터치 구매 메뉴','Mobile overhaul — thumb layout, weapon bar, aim assist + auto-fire, touch buy menu'],
 ['FIX','부활한 좀비가 멀티플레이에서 멈추던 문제','Revived zombies no longer freeze in multiplayer']]],
['v5.6','2026-10-07',[
 ['UP','멀티플레이 연결 개선 — 릴레이 v2, P2P 전용 옵션, 핑 표시','Multiplayer links — relay v2, P2P-only option, ping readout']]],
['v5.5','2026-10-07',[
 ['UP','해머 개편 — 우클릭으로 떡찧기 / 날리기 자세 전환','Hammer reworked — right click switches between pound and knock-away stance']]],
['v5.4','2026-10-07',[
 ['NEW','좀비 폭탄 — 머리를 뜯어 던지는 투척 무기','Zombie bomb — rip the gland out and throw it']]],
['v5.3','2026-10-07',[
 ['NEW','돈 추가 버튼 · 난이도 「전문가」 · 메인 화면 개편','Add-money button, Expert difficulty, new main menu'],
 ['NEW','챈샷 — 쏘고 바로 무기를 바꿔 딜레이 단축 / 칼 챈샷 — 사격 직후 칼로 근접 타격','Quick switch (swap right after a shot) and blade draw-cut']]],
['v5.2','2026-10-07',[
 ['NEW','새 맵 — 새벽역, 밀리샤, 이탈리아(2층 구조 · 저택 · 와인 저장고로 개편)','New maps — Dawn Station, Militia, Italy (rebuilt with two levels, a house and a wine cellar)']]],
];
function patchOpen(){const L=LI();let o=$('patchWin');if(o)o.remove();o=document.createElement('div');o.id='patchWin';
  o.innerHTML=`<div class="pwin"><div class="pwh"><b>${L?'Patch notes':'패치노트'}</b><button data-pc="x" aria-label="close">×</button></div><div class="pwb">${PATCH.map(([v,d,items])=>
    `<section><h3><span>${v}</span><time>${d}</time></h3><ul>${items.map(([k,ko,en])=>`<li><em class="${k==='NEW'?'n':k==='UP'?'u':'f'}">${k}</em>${L?en:ko}</li>`).join('')}</ul></section>`).join('')}</div></div>`;
  o.addEventListener('click',e=>{if(e.target===o||e.target.dataset.pc==='x')o.remove()});document.body.appendChild(o)}
addEventListener('keydown',e=>{if(e.code==='Escape'&&$('patchWin')){$('patchWin').remove();e.stopPropagation()}},true);
UI.gfxPre=()=>{const s=CFG.scale;if(s==='auto')return 'mid';if(+s>=1&&CFG.shadow!==false&&CFG.bloom!==false)return 'hi';if(+s<=.5&&CFG.shadow===false&&CFG.bloom===false)return 'lo';return ''};
const ICO={
  full:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 1h5v2H3v3H1zm9 0h5v5h-2V3h-3zM1 10h2v3h3v2H1zm12 0h2v5h-5v-2h3z"/></svg>',
  gear:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M7 1h2l.4 1.9 1.3.6 1.7-1 1.4 1.4-1 1.7.5 1.3L15 7v2l-1.9.4-.6 1.3 1 1.7-1.4 1.4-1.7-1-1.3.5L9 15H7l-.4-1.9-1.3-.5-1.7 1-1.4-1.4 1-1.7-.5-1.3L1 9V7l1.9-.4.5-1.3-1-1.7 1.4-1.4 1.7 1 1.3-.6zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"/></svg>',
  keys:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M1 4h14v9H1zm1.5 1.5v1.5h1.5V5.5zm2.5 0v1.5h1.5V5.5zm2.5 0v1.5H9V5.5zm2.5 0v1.5h1.5V5.5zM2.5 8v1.5h1.5V8zm2.5 0v1.5h1.5V8zm2.5 0v1.5H9V8zm2.5 0v1.5h1.5V8zM4 10.5V12h8v-1.5z"/></svg>',
  globe:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5c.7 0 1.6 1.4 1.9 3.5H6.1C6.4 3.9 7.3 2.5 8 2.5zM5.9 3a7 7 0 00-1.3 3H2.9A5.5 5.5 0 015.9 3zm4.2 0a5.5 5.5 0 013 3h-1.7a7 7 0 00-1.3-3zM2.6 7.5h1.9a13 13 0 000 1H2.6zm3.4 0h4a10 10 0 010 1H6zm5.5 0h1.9v1h-1.9a13 13 0 000-1zM2.9 10h1.7a7 7 0 001.3 3 5.5 5.5 0 01-3-3zm3.2 0h3.8c-.3 2.1-1.2 3.5-1.9 3.5S6.4 12.1 6.1 10zm5.3 0h1.7a5.5 5.5 0 01-3 3 7 7 0 001.3-3z"/></svg>',
  play:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M4 2l10 6-10 6z"/></svg>',
  door:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M3 1h9v14H3zm6.5 7a.9.9 0 100 1.8.9.9 0 000-1.8z"/></svg>',
  net:'<svg viewBox="0 0 16 16"><path fill="currentColor" d="M5 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM1 11c0-2.2 1.8-4 4-4s4 1.8 4 4v1H1zm8.7-3.6A4 4 0 0115 11v1h-4.6v-1a5 5 0 00-.7-3.6z"/></svg>'};
// player record: kept across visits, fed by finished matches
// signed in: the account's record (counted on the server from each match); a guest keeps this browser's own
function recSrv(){return typeof ACC!=='undefined'&&ACC.on&&ACC.ses&&ACC.me&&ACC.me.rec}
function recGet(){const m=recSrv();return Object.assign({g:0,k:0,inf:0,best:0,xp:0},m||LS.get('rec',{}))}
function recLevel(xp){let l=1,need=300,acc=0;while(xp>=acc+need&&l<99){acc+=need;l++;need=Math.round(need*1.18)}return {l,cur:xp-acc,need}}
function recMatch(){const P=G.player;if(!P||G.recDone)return;G.recDone=true;if(recSrv())return;const r=recGet();r.g++;r.k+=P.kills||0;r.inf+=P.infects||0;r.best=Math.max(r.best,Math.round(P.score||0));r.xp+=Math.max(20,Math.round((P.score||0)*.6+(P.kills||0)*8+(P.infects||0)*12));LS.set('rec',r)}
function myName(){return CFG.mpName||(LI()?'Survivor':'생존자')}
const relayWhyT=w=>({nat:LI()?'router blocked a direct link':'공유기가 직접 연결을 막음',timeout:LI()?'direct link timed out':'직접 연결 시간 초과',nortc:LI()?'no WebRTC here':'이 화면은 P2P 미지원',err:LI()?'P2P error':'P2P 오류',sdp:LI()?'P2P handshake failed':'P2P 협상 실패',peer:LI()?'peer asked for relay':'상대가 중계 요청',forced:LI()?'forced':'강제'})[w]||w;
const mapName=id=>(MAPDEFS[id]||MAPDEFS.q7).n[LI()];
// ---------- map preview: one frame of the menu scene, centre-cropped ----------
UI.snap=function(){if(!MAP.id||MAP.loading||MAP.gen||G.st!=='menu'||!R.renderer)return;
  try{R.render();const c=R.renderer.domElement,[cv,x]=mkCanvas(384,216);x.imageSmoothingEnabled=true;const r=384/216;let w=c.width,h=w/r;if(h>c.height){h=c.height;w=h*r}
    x.drawImage(c,(c.width-w)/2,(c.height-h)/2,w,h,0,0,384,216);THUMB[MAP.id]=cv.toDataURL('image/jpeg',.82)}catch(e){}
  for(const im of document.querySelectorAll('img.mth[data-m="'+MAP.id+'"]'))if(THUMB[MAP.id]){im.src=THUMB[MAP.id];im.classList.add('ok')}};
UI.wantSnap=function(){if(MAP.id&&!THUMB[MAP.id]){clearTimeout(UI.snT);UI.snT=setTimeout(()=>UI.snap(),450)}};
UI.mapLoaded=function(){UI.wantSnap()};
const thumb=(id,cls)=>`<div class="mthw ${cls||''}"><div class="mtph">${esc(mapName(id))}</div>${THUMB[id]?`<img class="mth ok" data-m="${id}" src="${THUMB[id]}">`:`<img class="mth" data-m="${id}" alt="">`}</div>`;
// ---------- main lobby ----------
UI.lobTab=UI.lobTab||0;
UI.buildTitle=function(){const L=LI(),r=recGet(),lv=recLevel(r.xp),skin=HSKINS.includes(CFG.skin)?CFG.skin:'guard';
  const cards=[
    {act:'go',cls:'c0',t:L?'QUICK START':'빠른 시작',s:L?'Last room settings, straight in':'지난 방 설정 그대로 바로 출격',tag:`${T(CFG.mode==='scen'?'scen':CFG.mode==='mut'?'mut':'orig')} · ${mapName(CFG.map)} · ${T('d'+CFG.diff)}`,
      art:`<img class="a1" src="${portrait('h_'+skin,150)}"><img class="a2" src="${portrait('z_'+CFG.zclass,CFG.zclass==='brute'?120:140)}">`},
    {act:'start',cls:'c1',t:L?'CREATE ROOM':'방 만들기',s:L?'Pick the map, bots and difficulty':'맵 · 봇 · 난이도를 직접 설정',tag:L?'Bot match':'봇전',
      art:`<img class="a1" src="${portrait('z_brute',128)}"><img class="a3" src="${portrait('z_runner',96)}">`},
    {act:'mp',cls:'c2',t:L?'MULTIPLAYER':'멀티플레이',s:L?'Open rooms list · or join by code':'공개 방 목록 · 방 코드로 참가',tag:L?`Up to ${NET_MAXP}`:`최대 ${NET_MAXP}명`,
      art:`<img class="a1" src="${portrait('h_'+(HSKINS[1]||skin),140)}"><img class="a3" src="${portrait('h_'+(HSKINS[2]||skin),110)}">`},
    {act:'range',cls:'c3',t:L?'SHOOTING RANGE':'사격장',s:L?'Dummies at 10–50 m, moving targets, free weapons':'10–50 m 더미 · 이동 표적 · 무기 무료',tag:L?'Practice':'연습',
      art:`<img class="gun g1" src="${gunIcon('sr8',40)}"><img class="gun g2" src="${gunIcon('kv47',48)}"><img class="gun g3" src="${gunIcon('d50',34)}">`}];
  const news=L?[['NEW','Salamander flamethrower — season decoder'],['NEW','Public room list, daily missions, ranking'],['UP','Skull-9 is now a season decoder prize, next to Event Horizon'],['NEW','Skull-9, human skills (5 Sprint · 6 Deadshot), season decoder'],['UP','Free weapons, loadouts carry over, 3 loadout sets'],['NEW','근하신년 decoder bingo: 5×5 card, a gun on every line'],['NEW','Accounts, coins and a gun shop: earn coins, buy guns for good'],['NEW','Shooting range: dummies at 10–50 m, moving targets, live DPS'],['UP','Reloads and knife swings rebuilt: real hands, hit-stop'],['NEW','Zombie Scenario: co-op PvE, 5 stages, a giant boss'],['NEW','Coffin Zombie: raises a coffin wall that bursts'],['NEW','Sledgehammer: two-handed, huge knockback'],['NEW','Quick switch: fire, then swap to cut the delay'],['NEW','Draw cut: swap to a blade right after a shot'],['UP','Expert difficulty, add-money button'],['UP','Italy rebuilt: two levels, a house and a wine cellar']]
    :[['NEW','샐러맨더 화염방사기 — 시즌 해독기'],['NEW','공개 방 목록 · 일일 미션 · 랭킹'],['UP','스컬-9 — 시즌 해독기 줄 보상으로 (이벤트 호라이즌과 함께)'],['NEW','스컬-9 · 인간 스킬(5 전력질주 · 6 확인사살) · 시즌 해독기'],['UP','무기 무료 · 장비 이어가기 · 장비 세트 3개'],['NEW','근하신년 해독기 빙고 — 줄마다 근하신년 무기, 최대 50개면 판 완성'],['NEW','계정 · 코인 · 상점 — 매치로 코인 모아 총 영구 구매'],['NEW','사격장 — 거리별 더미 · 이동 표적 · 실시간 DPS'],['UP','재장전 · 칼 휘두르기 모션 재제작 — 진짜 손 동작 · 타격감'],['NEW','좀비 시나리오 — 협동 PvE, 5스테이지 + 거대 좀비'],['NEW','관짝 좀비 — 관 방패를 세우고, 부서지면 폭발'],['NEW','해머 추가 — 양손 롱해머, 넉백 최강'],['NEW','챈샷 — 쏘고 바로 무기 교체로 딜레이 단축'],['NEW','칼 챈샷 — 사격 직후 칼로 바꾸면 근접 타격'],['UP','난이도 전문가 추가 · 돈 추가 버튼'],['UP','이탈리아 맵 개편 — 2층 구조, 저택, 와인 저장고']];
  $('menu').innerHTML=`<div class="lob">
    <div class="lobTop"><div class="lobLogo">QUARANTINE<b>Z</b></div>
      <div class="prof"><img src="${portrait('h_'+skin,40)}"><div><b>${esc(myName())}</b><span class="lv">Lv.${lv.l}</span><i class="xp"><u style="width:${Math.round(lv.cur/lv.need*100)}%"></u></i></div></div>
      <div class="tbtns"><button data-act="opts">${ICO.gear}<span>${T('settings')}</span></button><button data-act="help">${ICO.keys}<span>${T('controls')}</span></button><button data-act="patch" class="tpatch"><b class="pb">+</b><span>${L?'Patches':'패치노트'}</span></button>${true?`<button data-act="full">${ICO.full}<span>${FS.label()}</span></button>`:''}<button data-act="rot" class="rotbtn">${ICO.full}<span>${L?'Landscape':'가로 고정'}</span></button><button data-act="lang">${ICO.globe}<span>${L?'한국어':'English'}</span></button></div></div>
    <div class="mcards">${cards.map(c=>`<div class="mc ${c.cls}" data-act="${c.act}"><div class="art">${c.art}</div><div class="mtag">${esc(c.tag)}</div><div class="mbar"><b>${c.t}</b><span>${c.s}</span></div></div>`).join('')}</div>
    <div class="lobBot">
      <div class="lp"><div class="lpt"><b class="on">${L?'NOTICE':'공지사항'}</b><button class="pplus" data-act="patch" title="${L?'Patch notes':'패치노트'}">+</button></div><ul class="news">${news.slice(0,5).map(([k,t])=>`<li><em class="${k==='NEW'?'n':'u'}">${k}</em>${t}</li>`).join('')}</ul></div>
      <div class="lp"><div class="lpt"><b class="on">${L?'MY RECORD':'내 전적'}</b></div>
        <div class="recs"><div><span>${L?'Matches':'플레이'}</span><b>${r.g}</b></div><div><span>${T('kills')}</span><b>${r.k}</b></div><div><span>${T('infects')}</span><b>${r.inf}</b></div><div><span>${L?'Best score':'최고 점수'}</span><b>${r.best}</b></div></div>
        <div class="lvrow"><span>Lv.${lv.l}</span><i class="xp"><u style="width:${Math.round(lv.cur/lv.need*100)}%"></u></i><small>${lv.cur} / ${lv.need} XP</small></div></div>
      <div class="lp"><div class="lpt"><b class="on">${L?'MAPS':'맵 목록'}</b><small>${L?'click to load':'클릭하면 배경 변경'}</small></div><div class="mlist">${MAPLIST().map(id=>`<div class="mli${CFG.map===id?' on':''}" data-act="lobmap" data-v="${id}">${thumb(id,'sm')}<b>${esc(mapName(id))}</b></div>`).join('')}</div></div>
    </div>
    <div class="foot">v6.13 · ${L?MAPLIST().length+' maps · '+Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+' weapons':'맵 '+MAPLIST().length+'개 · 무기 '+Object.values(WPN).filter(w=>w.model&&w.kind!=='nade').length+'종'}${typeof TOUCH!=='undefined'&&TOUCH.on?(L?' · touch controls on':' · 터치 조작 켜짐'):''}</div></div>`;
  UI.wantSnap()};
// ---------- room settings window (bots) ----------
const dd=(chg,k,cur,opts,dis)=>`<select class="dd" data-chg="${chg}" data-k="${k}"${dis?' disabled':''}>${opts.map(([v,l])=>`<option value="${v}"${String(cur)===String(v)?' selected':''}>${esc(String(l))}</option>`).join('')}</select>`;
const OPT={mode:()=>[['mut',T('mut')],['orig',T('orig')],['scen',T('scen')]],map:()=>MAPLIST().map(id=>[id,mapName(id)]),rounds:()=>[[5,5],[7,7],[9,9]],time:()=>[[120,'2'+T('min')],[180,'3'+T('min')],[240,'4'+T('min')]],diff:()=>[0,1,2,3].map(i=>[i,T('d'+i)]),blackout:()=>[[1,T('on')],[0,T('off')]]};
function roomPreview(c){const L=LI();return `<div class="rprev">${thumb(c.map,'big')}<div class="rpi"><b>${esc(mapName(c.map))}</b><span>${T(c.mode==='scen'?'scen':c.mode==='mut'?'mut':'orig')}</span></div></div>
  <p class="rdesc">${(MAPDEFS[c.map]||MAPDEFS.q7).d[L]}</p><div class="rrule"><b>${L?'Rules':'규칙'}</b>${T(c.mode==='scen'?'scenD':c.mode==='mut'?'mutD':'origD')}</div>`}
function charPick(act){const L=LI();return `<div class="rsec"><div class="rst">${T('char')}</div><div class="cards">${HSKINS.map(k=>`<div class="card${CFG.skin===k?' on':''}" data-act="${act}" data-v="skin:${k}"><img src="${portrait('h_'+k,62)}"><span>${HSKIN_N[k][L]}</span></div>`).join('')}</div></div>
  ${(act==='set'?CFG.mode:NET.lob&&NET.lob.cfg.mode)==='scen'?'':`<div class="rsec"><div class="rst">${T('zcls')}<small>${ZCLASS[CFG.zclass].d[L]}</small></div><div class="cards">${ZLIST.map(k=>`<div class="card z${CFG.zclass===k?' on':''}" data-act="${act}" data-v="zclass:${k}"><img src="${portrait('z_'+k,k==='brute'?52:62)}"><span>${ZCLASS[k].n[L]}</span></div>`).join('')}</div></div>`}`}
UI.buildSetup=function(){const L=LI();const row=(l,ctl)=>`<div class="fr"><label>${l}</label>${ctl}</div>`;
  $('setup').innerHTML=`<div class="win room"><div class="dpHead"><b>${L?'Create Room':'방 만들기'}</b><span>${L?'Bot match':'봇전'} · ${esc(myName())}</span><button class="x" data-act="back">✕</button></div>
    <div class="wbody"><div class="rform">
      ${row(L?'Room title':'방 제목',`<input id="roomT" class="tin" maxlength="24" value="${esc(CFG.room||(L?myName()+"'s room":myName()+'의 방'))}" autocomplete="off" spellcheck="false">`)}
      ${row(T('mode'),dd('set','mode',CFG.mode,OPT.mode()))}
      ${row(T('map'),dd('set','map',CFG.map,OPT.map()))}
      ${CFG.mode==='scen'?row(T('allies'),dd('set','scBots',CFG.scBots??3,[0,1,3,5,7].map(v=>[v,v+(L?' allies':'명')]))):row(T('bots'),dd('set','bots',CFG.bots,[[7,7],[11,11],[15,15],[19,19]].map(([v])=>[v,v+(L?' bots':'명')])))}
      ${row(T('diff'),`<button class="diffBtn d${CFG.diff}" data-act="diffopen"><span class="sk">${skulls(CFG.diff+1)}</span><b>${T('d'+CFG.diff)}</b><i>▸</i></button>`)}
      ${CFG.mode==='scen'?row(L?'Stages':'스테이지',`<span class="fixv">${L?'5 stages × 3 waves · 3 lives':'5스테이지 × 3웨이브 · 목숨 3개'}</span>`):row(T('rounds'),dd('set','rounds',CFG.rounds,OPT.rounds().map(([v])=>[v,v+(L?' rounds':'라운드')])))+row(T('rtime'),dd('set','time',CFG.time,OPT.time()))+row(T('boSet'),dd('set','blackout',CFG.blackout??1,OPT.blackout()))}
    </div><div class="rside">${roomPreview(CFG)}</div></div>
    <div class="wchars">${charPick('set')}</div>
    <div class="dpFoot"><button data-act="back">${T('cancel')}</button><button class="ok" data-act="go">${ICO.play} ${L?'Start game':'게임 시작'}</button></div></div>`;
  const ti=$('roomT');ti.addEventListener('input',()=>{CFG.room=ti.value.slice(0,24);saveCfg()});UI.wantSnap()};
// ---------- multiplayer waiting room ----------
UI.mpLobby=function(){const L=LI(),lb=NET.lob,H=NET.host,c=lb.cfg;UI.mpKey=JSON.stringify([lb.cfg,lb.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);
  const row=(l,k,opts)=>`<div class="fr"><label>${l}</label>${dd('mpset',k,c[k],opts,!H)}</div>`;
  const conn=[...NET.links.values()].find(l=>l.ok);const slots=[];for(let i=0;i<NET_MAXP;i++)slots.push(lb.pl[i]||null);
  $('lobby').innerHTML=`<div class="win room"><div class="dpHead"><b>${L?'Waiting Room':'게임 대기실'}</b><span>${L?'Room code':'방 코드'} <span class="mpcode">${esc(NET.code)}</span> <button class="mini" data-act="mpcopy">${T('mpCopy')}</button> · ${T('mpShare')}</span><button class="x" data-act="mpleave">✕</button></div>
    <div class="wbody"><div class="slots">${slots.map((p,i)=>p?`<div class="slot pl${p.k===NET.me?' me':''}"><span class="no">${i+1}</span><img src="${portrait('h_'+(HSKINS.includes(p.s)?p.s:'guard'),40)}"><div><b>${esc(p.n||'?')}</b>${p.k===NET.me?`<small>(${T('mpMe')})</small>`:''}<em>${i===0?'':(p.r?T('mpRelay')+' · ':'')+(p.p||0)+'ms'}</em></div>${i===0?`<span class="ht">${T('mpHost')}</span>`:'<span class="rd">READY</span>'}</div>`
        :`<div class="slot empty"><span class="no">${i+1}</span><div>${L?'Open':'빈 자리'}</div></div>`).join('')}<div class="sprev">${roomPreview(c)}</div></div>
      <div class="rside"><div class="rform">${row(T('mode'),'mode',OPT.mode())}${row(T('map'),'map',OPT.map())}${row(c.mode==='scen'?T('allies'):T('mpBots'),'bots',c.mode==='scen'?[[0,0],[1,1],[3,3],[5,5],[7,7]]:[[0,0],[4,4],[8,8],[12,12]])}${row(T('diff'),'diff',OPT.diff())}${c.mode==='scen'?'':row(T('rounds'),'rounds',OPT.rounds())+row(T('rtime'),'time',OPT.time())+row(T('boSet'),'blackout',OPT.blackout())}</div>
        ${H?'':`<p class="hint">${T('mpOnlyHost')}</p>`}</div></div>
    <div class="wchars">${charPick('mpme')}</div>
    <div class="dpFoot"><span class="conn">${NET.kind==='room'?(conn&&conn.kind==='relay'?T('mpRelay')+(NET.relayWhy?' ('+relayWhyT(NET.relayWhy)+')':''):T('mpDirect'))+' · claude.ai':'PeerJS · '+T('mpDirect')} · ${lb.pl.length}/${NET_MAXP}${H&&NET.kind==='peerjs'?' · '+ROOMS.label():''}</span><button data-act="mpleave">${T('mpLeave')}</button>${H?`<button class="ok" data-act="mpstart">${ICO.play} ${T('mpStart')}</button>`:`<span class="mpwait">${T('mpWait')}</span>`}</div></div>`;
  UI.show('lobby');UI.wantSnap()};
// slot pings are patched in place (a rebuild would eat clicks)
UI.mpRender=function(){if(UI.open==='mp'){const m=$('mpMsg');if(m)m.textContent=NET.msg||'';return}if(UI.open!=='lobby')return;
  const key=JSON.stringify([NET.lob.cfg,NET.lob.pl.map(p=>[p.k,p.n,p.s,p.z,p.r]),CFG.skin,CFG.zclass]);if(key!==UI.mpKey){UI.mpLobby();return}
  const ems=document.querySelectorAll('#lobby .slot.pl em');NET.lob.pl.forEach((p,i)=>{const e=ems[i];if(e&&i>0)e.textContent=(p.r?T('mpRelay')+' · ':'')+(p.p||0)+'ms'})};
// ---------- actions ----------
(function(){const act0=UI.act.bind(UI),show0=UI.show.bind(UI),res0=UI.showResults.bind(UI);
  UI.act=function(a,v,el){
    if(a==='mpset'&&v==='mode:scen'&&NET.host&&NET.lob)NET.lob.cfg.bots=3;
    if(a==='lobmap'){CFG.map=v;saveCfg();loadMapUI(v).then(()=>{if(UI.open==='menu')UI.buildTitle()});UI.buildTitle();return}
    if(a==='set'&&v&&v.startsWith('map:')){const id=v.slice(4);CFG.map=id;saveCfg();UI.buildSetup();loadMapUI(id).then(()=>{if(UI.open==='setup')UI.buildSetup()});return}
    return act0(a,v,el)};
  UI.show=function(id){show0(id);if(id==='menu'||id==='setup'||id==='lobby')UI.wantSnap()};
  UI.showResults=function(){recMatch();return res0()};
  const rs0=HUD.roundStart.bind(HUD);HUD.roundStart=function(){if(G.round<=1)G.recDone=false;return rs0()};
  document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.chg)return;AU.init();AU.play('ui',{vol:.5});UI.act(t.dataset.chg,t.dataset.k+':'+t.value)});})();
// ---------- options window: tabs (gameplay / keyboard / mouse / audio / video), live preview, OK · Cancel · Apply ----------
const XC={green:'#7dff6a',yellow:'#ffe14a',cyan:'#5ae8ff',white:'#ffffff',pink:'#ff6ad8'};
function applyXhair(){const c=$('cross');if(!c)return;c.style.setProperty('--xc',XC[CFG.xc]||XC.green);c.style.setProperty('--g',(CFG.xg||6)+'px')}
UI.optTab=UI.optTab||'game';if(CFG.xg==null)CFG.xg=6;if(CFG.tsens==null)CFG.tsens=1;if(CFG.tsz==null)CFG.tsz=1;for(const k of ['autoFire','aimAssist','leftFire','haptic'])if(CFG[k]==null)CFG[k]=true;if(CFG.tal==null)CFG.tal=.7;if(!CFG.touch)CFG.touch='auto';if(!CFG.xc)CFG.xc='green';
UI.buildOpts=function(){const L=LI(),t=UI.optTab;
  const tch=typeof TOUCH!=='undefined'&&TOUCH.on;const tabs=[['game',L?'Gameplay':'게임플레이'],['keys',tch?(L?'Controls':'조작법'):(L?'Keyboard':'키보드')],...(tch?[]:[['mouse',L?'Mouse':'마우스']]),['audio',L?'Audio':'오디오'],['video',L?'Video':'비디오']];
  const ck=(k,l,inv)=>{const on=inv?!CFG[k]:CFG[k]!==false&&!!CFG[k];return `<label class="ck${on?' on':''}" data-act="optck" data-v="${k}${inv?':inv':''}"><i></i>${l}</label>`};
  const sl=(k,l,min,max,step,fmt,lo,hi)=>`<div class="osl"><div class="oslh"><span>${l}</span><b id="ov_${k}">${fmt(CFG[k])}</b></div><input type="range" class="rng" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${CFG[k]}"><div class="ticks">${'<i></i>'.repeat(11)}</div><div class="oslf"><small>${lo}</small><small>${hi}</small></div></div>`;
  const sel=(k,l,opts)=>`<div class="osel"><span>${l}</span>${dd('opt',k,CFG[k],opts)}</div>`;
  let body='';
  if(t==='game')body=`<div class="og2"><div>${sel('lang',L?'Language':'언어',[['ko','한국어'],['en','English']])}
      <div class="osel"><span>${L?'Nickname':'닉네임'}</span><input id="optName" class="tin" maxlength="14" value="${esc(CFG.mpName||'')}" placeholder="${esc(myName())}" autocomplete="off" spellcheck="false"></div>
      ${sel('touch',L?'Touch controls':'터치 조작 (모바일)',[['auto',L?'Auto':'자동'],['on',L?'On':'켜기'],['off',L?'Off':'끄기']])}
      ${sel('xc',L?'Crosshair colour':'조준점 색상',[['green',L?'Green':'초록'],['yellow',L?'Yellow':'노랑'],['cyan',L?'Cyan':'하늘'],['white',L?'White':'흰색'],['pink',L?'Pink':'분홍']])}</div>
    <div>${ck('minimap',L?'Show radar':'레이더(미니맵) 표시')}${ck('autoFire',L?'Auto-fire on target (touch)':'자동 사격 (조준점에 적이 오면 발사)')}${ck('aimAssist',L?'Aim assist (touch)':'조준 보정 (적 쪽으로 살짝 끌림)')}${ck('leftFire',L?'Left fire button':'왼쪽 사격 버튼')}${ck('invert',L?'Invert look (Y)':'시점 상하 반전')}${ck('haptic',L?'Vibration':'진동')}${sl('tsens',L?'Touch look speed':'터치 시점 감도',.4,2.5,.1,v=>(+v).toFixed(1),L?'slow':'느리게',L?'fast':'빠르게')}${sl('tal',L?'Button opacity':'버튼 투명도',.25,1,.05,v=>Math.round(v*100)+'%','25%','100%')}${sl('tsz',L?'Button size':'버튼 크기',.75,1.35,.05,v=>Math.round(v*100)+'%','75%','135%')}${sl('xg',L?'Crosshair gap':'조준점 간격',2,14,1,v=>v+'px',L?'tight':'좁게',L?'wide':'넓게')}
      <div class="xprev" style="--xc:${XC[CFG.xc]||XC.green};--g:${CFG.xg||6}px"><i class="t"></i><i class="b"></i><i class="l"></i><i class="r"></i><i class="d"></i></div></div></div>`;
  else if(t==='keys'&&typeof TOUCH!=='undefined'&&TOUCH.on){const g=L?[['Left thumb','Move — the stick starts wherever you touch; push past half for full speed'],['Right drag','Look around — slow drags are precise, flicks turn far'],['◎ big button','Fire. Hold it and drag to aim while shooting'],['Auto','Aim near an enemy: the sight is pulled in and it fires for you (Options)'],['Aim','Scope / alt attack / hammer stance / soft bomb lob'],['↑ ↓','Jump · crouch (toggle)'],['↻','Reload'],['Bottom bar','Tap a weapon to equip · tap the one in hand to swap back (quick switch) · hold it to drop it; walk over a gun to pick it up into an empty slot'],['Buy','Shop · Quick buy = best rifle + armour + grenade in one tap'],['⚡','Zombie skill · CLASS picks the zombie class · NV night vision'],['≡ / Ⅱ','Hold for the scoreboard · pause'],['Dead','Tap fire to watch the next player']]
      :[['왼손','이동 — 왼쪽 아무 데나 대면 그 자리에 스틱, 반 이상 밀면 달리기'],['오른손 드래그','시점 — 천천히 끌면 정밀, 휙 그으면 크게 회전'],['◎ 큰 버튼','사격. 누른 채로 끌면 쏘면서 조준'],['자동','적 근처로 조준하면 끌려가면서 자동 사격 (옵션에서 끄기)'],['조준','저격 줌 · 보조 공격 · 해머 자세 · 폭탄 살짝 던지기'],['↑ ↓','점프 · 앉기(토글)'],['↻','재장전'],['아래 슬롯','무기 탭해서 교체 · 들고 있는 무기 다시 탭 = 챈샷 · 길게 누르면 버리기, 빈 슬롯이면 바닥 무기를 밟아서 줍기'],['구매','상점 · 추천 구매 한 번에 소총+방탄+수류탄'],['⚡','좀비 스킬 · 클래스 = 좀비 종류 · NV 야간투시'],['≡ / Ⅱ','누르는 동안 점수판 · 일시정지'],['사망 시','사격 버튼으로 다른 사람 관전']];
    body=`<div class="tguide">${g.map(([k,d])=>`<div><b>${k}</b><span>${d}</span></div>`).join('')}</div><div class="rrule" style="margin-top:10px"><b>${T('rulesT')}</b><ul>${T('rules').map(r=>`<li>${r}</li>`).join('')}</ul></div>`}
  else if(t==='keys')body=`<table class="ktbl"><tr><th>${L?'Action':'설명'}</th><th>${L?'Key / button':'키/버튼'}</th></tr>${T('keys').map(([k,d])=>`<tr><td>${d}</td><td><kbd>${k}</kbd></td></tr>`).join('')}</table>
    <div class="rrule"><b>${T('rulesT')}</b><ul>${T('rules').map(r=>`<li>${r}</li>`).join('')}</ul></div>`;
  else if(t==='mouse')body=`<div class="og2"><div>${sl('sens',L?'Mouse sensitivity':'마우스 감도',.4,4,.1,v=>(+v).toFixed(1),L?'slow':'느리게',L?'fast':'빠르게')}</div><div>${ck('invert',L?'Invert mouse (Y)':'마우스 반전 (상하)')}</div></div>`;
  else if(t==='audio')body=`<div class="og2"><div>${sl('vol',L?'Master volume':'전체 볼륨',0,1,.05,v=>Math.round(v*100),'0','100')}</div><div>${ck('music',L?'Background music':'배경 음악')}</div></div>`;
  else body=`<div class="og2"><div>${sel('scale',L?'Render resolution':'렌더 해상도',[['auto',T('auto')],[.4,'40%'],[.5,'50%'],[.65,'65%'],[.8,'80%'],[1,'100%'],[1.5,'150%'],[2,'200%']])}
      ${sl('fov',L?'Field of view':'시야각 (FOV)',60,95,1,v=>v+'°','60','95')}</div>
    <div>${ck('bloom',L?'Bloom (glow)':'블룸 (빛 번짐)')}${ck('shadow',L?'Dynamic shadows':'실시간 그림자')}
      ${sl('gamma',L?'Brightness':'밝기',.6,1.2,.02,v=>Math.round((1.2-v)/.6*100),L?'dark':'어둡게',L?'bright':'밝게')}</div></div>
    ${true?`<div class="fsrow"><button data-act="full" class="fslbl">${FS.label()}</button><span>${L?'Alt+Enter toggles it in game':'게임 중에는 Alt+Enter로 전환'}</span></div>`:''}<div class="gpre"><span>${L?'Presets':'한 번에 설정'}</span>${[['hi',L?'High quality':'고화질'],['mid',L?'Balanced':'균형'],['lo',L?'Low spec':'저사양']].map(([k,n])=>`<button data-act="gfxpre" data-v="${k}" class="${UI.gfxPre()===k?'on':''}">${n}</button>`).join('')}</div>
    <p class="onote">${L?'High quality draws at the screen\'s real resolution (up to 200%) with shadows and bloom; lower it if the game stutters.':'고화질은 화면 실제 해상도(최대 200%)로 그리고 그림자·블룸을 켭니다. 게임이 끊기면 낮춰 보세요.'}</p>`;
  $('opts').innerHTML=`<div class="win opt"><div class="dpHead"><b>${L?'Options':'옵션'}</b><span></span><button class="x" data-act="optcancel">✕</button></div>
    <div class="otabs">${tabs.map(([k,l])=>`<button class="${t===k?'on':''}" data-act="opttab" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="obody">${body}</div>
    <div class="dpFoot"><button class="ok" data-act="optok">${T('ok')}</button><button data-act="optcancel">${T('cancel')}</button><button data-act="optapply">${L?'Apply':'적용'}</button></div></div>`;
  for(const r of document.querySelectorAll('#opts .rng'))r.addEventListener('input',()=>{const k=r.dataset.k;CFG[k]=+r.value;UI.optLive();UI.optLbl(r)});
  const nm=$('optName');if(nm)nm.addEventListener('input',()=>{CFG.mpName=nm.value.trim().slice(0,14);});
  applyXhair()};
UI.optLbl=function(r){const L=LI(),k=r.dataset.k,v=+r.value,b=$('ov_'+k);if(!b)return;b.textContent=k==='tsz'?Math.round(v*100)+'%':k==='tal'?Math.round(v*100)+'%':k==='tsens'?v.toFixed(1):k==='sens'?v.toFixed(1):k==='vol'?Math.round(v*100):k==='fov'?v+'°':k==='xg'?v+'px':k==='gamma'?Math.round((1.2-v)/.6*100):v;
  if(k==='xg'){const p=document.querySelector('#opts .xprev');if(p)p.style.setProperty('--g',v+'px')}};
UI.optLive=function(){applyCfg();applyXhair();if(typeof TOUCH!=='undefined'){document.documentElement.style.setProperty('--tal',CFG.tal==null?.7:CFG.tal);TOUCH.apply()}};
(function(){const act1=UI.act;
  UI.act=function(a,v,el){
    if(a==='patch'){patchOpen();return}
    if(a==='opts'||a==='help'){if(UI.open!=='opts'){UI.ret=UI.open;UI.optBak=JSON.stringify(CFG)}UI.optTab=a==='help'?'keys':(UI.optTab==='keys'?'game':UI.optTab);UI.buildOpts();UI.show('opts');return}
    if(a==='back'&&UI.open==='opts')a='optcancel';
    if(a==='opttab'){UI.optTab=v;UI.buildOpts();return}
    // graphics presets: high = native pixels (device pixel ratio, max 2) + shadows + bloom; balanced = auto resolution; low = half resolution, no shadows or bloom
    if(a==='gfxpre'){const dpr=Math.min(2,Math.max(1,Math.round((window.devicePixelRatio||1)*2)/2));
      if(v==='hi')Object.assign(CFG,{scale:dpr,shadow:true,bloom:true});else if(v==='mid')Object.assign(CFG,{scale:'auto',shadow:!(typeof TOUCH!=='undefined'&&TOUCH.on),bloom:true});else Object.assign(CFG,{scale:.5,shadow:false,bloom:false});
      UI.optLive();UI.buildOpts();return}
    if(a==='optck'){const [k,inv]=v.split(':');CFG[k]=inv?!CFG[k]:!(CFG[k]!==false&&!!CFG[k]);UI.optLive();UI.buildOpts();return}
    if(a==='opt'&&v&&v.startsWith('lang:')){const l=v.slice(5);if(l!==LANG){LANG=l;LS.set('lang',LANG)}UI.buildOpts();return}
    if(a==='opt'){const i=v.indexOf(':'),k=v.slice(0,i),val=v.slice(i+1);CFG[k]=val==='true'?true:val==='false'?false:isNaN(+val)?val:+val;UI.optLive();UI.buildOpts();return}
    if(a==='optapply'||a==='optok'){saveCfg();UI.optBak=JSON.stringify(CFG);if(a==='optok')UI.optClose();return}
    if(a==='optcancel'){if(UI.optBak){const b=JSON.parse(UI.optBak);for(const k in b)CFG[k]=b[k];UI.optLive()}UI.optClose();return}
    return act1(a,v,el)};
  UI.optClose=function(){UI.show(UI.ret||'menu');UI.ret=null;if(UI.open==='menu')UI.buildTitle();else if(UI.open==='pause')UI.buildPause();else if(UI.open==='setup')UI.buildSetup()};
  const ac0=applyCfg;applyCfg=function(){ac0();applyXhair()};})();

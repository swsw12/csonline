# 계정 · 코인 · 상점 (Supabase) 설정

게임 코드에는 다 들어가 있고, Supabase 프로젝트만 연결하면 켜집니다. 연결 전에는 로그인이 숨겨지고 모든 총이 예전처럼 열려 있어요.

## 1. 프로젝트 만들기
1. https://supabase.com 에서 새 프로젝트 생성 (무료 플랜으로 충분)
2. 왼쪽 **SQL Editor → New query** → `supabase/schema.sql` 내용 전체 붙여넣기 → **Run**
   - 테이블(`profiles`, `owned_guns`, `gun_prices`, `coin_log`, `gacha_config`, `gacha_log`, `bingo_boards`, `season_boards`), 보안 규칙, 함수, 가입 트리거, 가격표가 한 번에 만들어집니다.
   - 여러 번 실행해도 안전합니다(가격표는 파일 값으로 다시 맞춰짐, 이미 산 총 · 코인 · 조각 · 빙고판은 그대로).
   - **v6.7에서 이미 실행했다면 v6.8 `schema.sql`을 한 번 더 실행**하세요. 복주머니 테이블과 함수가 추가되고, 근하신년 무기가 판매 목록에서 빠집니다(이미 산 사람은 계속 보유).
   - **v6.11(시즌 해독기)도 `schema.sql`을 한 번 더 실행해야 합니다.** `season_boards` 테이블, `gacha_config`의 `season_*` 칸, `profiles`의 `dec_tickets`(보유 근하신년 해독기) · `season_shuffle_day` · `season_shuffles`,
     함수 `qz_season*`가 추가되고, `qz_decode`가 인자 3개(`p_count`, `p_free`, `p_ticket`)로 바뀝니다(옛 2개짜리는 지워짐). 기존 코인 · 총 · 조각 · 근하신년 빙고판은 그대로예요.
     실행 전에는 게임의 시즌 해독기 탭에 "서버 업데이트가 필요해요"가 뜨고, 근하신년 해독기는 예전처럼 코인으로 열 수 있어요.

## 2. 게임에 키 넣기
필요한 건 두 개: **Project URL**과 **Publishable key**(공개 키).
- 프로젝트 화면 맨 위 **Connect** 버튼 → 나오는 창에 `Project URL`(`https://xxxx.supabase.co`)과 publishable key가 같이 보입니다.
- 또는 왼쪽 아래 톱니바퀴 **Project Settings → API Keys**
  - **Publishable key**: `sb_publishable_...` 로 시작 → 이걸 쓰면 됨
  - 옛날 키를 쓰려면 같은 페이지의 **Legacy** 탭(anon / service_role) → `anon` `public` (`eyJ...` 로 시작)도 됩니다. 단 Supabase가 2026년 말까지 이 옛 키를 없앨 예정이라 publishable key 권장
  - Project URL은 `https://<Project ID>.supabase.co` (Project ID는 **Project Settings → General**)

`source/src/account.js` 맨 위 줄을 이렇게 바꾸고 빌드(`python3 build.py`)합니다.

```js
const SB={url:'https://xxxx.supabase.co',key:'sb_publishable_...',oauth:[]};
```

- publishable(anon) 키는 원래 공개용입니다. 테이블은 RLS로 막혀 있어서 자기 데이터 읽기만 되고, 코인·구매·해독기는 서버 함수에서만 바뀝니다.
- **Secret key(`sb_secret_...`) / `service_role` 키는 절대 넣지 마세요.** 이건 DB를 통째로 쓸 수 있는 관리자 키입니다.

### SQL Editor에서 `unterminated dollar-quoted string` 오류가 나면
옛 `schema.sql`(v6.8 첫 버전까지)은 함수 안에 `select … into 변수` 꼴이 있어서, SQL Editor의 "새 테이블에 RLS 자동 켜기" 기능이
그걸 테이블 만들기로 착각하고 함수 중간에 `ALTER TABLE … ENABLE ROW LEVEL SECURITY`를 끼워 넣다가 깨집니다.
지금 파일은 그 꼴을 전부 `변수 := (select …)`로 바꿔서 그대로 붙여넣고 Run 하면 됩니다. 오류가 났던 실행은 통째로 취소되니(아무것도 안 만들어짐) 새 파일로 다시 실행하세요.

## 3. 로그인 설정 (Authentication)
- **URL Configuration → Site URL**: 배포 주소 (예: `https://내프로젝트.vercel.app`)
- **Redirect URLs**: 같은 주소 추가 (로컬 테스트는 `http://localhost:*` 도 추가)
- **Providers → Email → Confirm email**
  - 끄면: 가입 즉시 로그인
  - 켜면: 인증 메일 링크를 눌러야 로그인 (링크 누르면 게임으로 돌아오면서 로그인됨)
- 구글 / 카카오 로그인(선택): Providers에서 켜고 클라이언트 ID·Secret 입력 → `account.js`의 `oauth:['google','kakao']`

## 4. 경제 규칙
| 항목 | 값 |
|---|---|
| 가입 보너스 | 3,000 코인 |
| 판 보상 | 기본 80 + 라운드당 12 + 킬당 6 + 감염당 10 + 피해 1,000당 4 + 승리 100 + MVP 60 (시나리오: 80 + 스테이지당 40 + 클리어 150 + 킬당 4) |
| 상한 | 판당 900 · 지난 보상 뒤 1분당 80 · 하루(한국 시간) 8,000 |
| 그날 첫 판 | +200 |
| 같은 판 연속 정산 | 1분 30초 안에는 불가 |

- 보상은 판이 끝나고 결과 화면이 뜰 때 받습니다(사격장 제외). 중간에 나가면 없음.
- 기본 지급(무료): 씰 나이프, USP, M3, MP5, 갈릴. 수류탄·방탄복·탄약은 언제나 판돈으로 구매 가능.
- 이벤트 호라이즌은 시즌 해독기 빙고로만 영구 보유(상점 판매 · 조각 교환 없음, 아래 8번).
- 근하신년 무기 12종은 해독기 빙고 전용(아래 7번).

## 4-1. 레벨 · 전적 (v6.9)
- `profiles`의 `xp`, `rec_games`, `rec_kills`, `rec_infects`, `rec_best`. 판이 끝날 때 `qz_claim`이 코인과 같이 올림.
- 경험치 = 점수×0.6 + 킬×8 + 감염×12 (최소 20, 판당 최대 3,000). 레벨은 게임이 경험치로 계산(1→2에 300, 다음부터 1.18배씩).
- 처음 로그인한 브라우저에 있던 옛 기록은 `qz_import_rec`로 계정당 한 번만 들어옴(판 수 최대 5,000, 판당 킬 80 · 감염 30 · 경험치 3,000, 경험치 총 300,000까지).
- 코인처럼 1분 30초 안에 연속 정산하면(`too_soon`) 그 판은 기록도 안 올라감.

## 5. 가격 바꾸기
**Table Editor → gun_prices**에서 `price`를 고치면 바로 적용됩니다 (게임 상점도 이 값을 읽음).
`free=true`면 기본 지급, `sold=false`면 상점에서 안 팜, `tier`가 `S`/`A`면 해독기 빙고 전용(코인으로 못 삼).
이벤트 호라이즌(`bhole`)은 `sold=false`, `tier` 비움 그대로 두세요(근하신년 판에 안 나오고 교환도 안 됨) — 시즌 해독기의 줄 보상(`season_lines`)으로만 나옵니다.
게임 코드의 `shop.js` 가격표는 서버가 응답하기 전 잠깐 보여주는 예비용입니다.

## 6. 운영 팁
- 코인 지급/사용 기록: `coin_log` 테이블
- 특정 유저에게 코인 주기 (SQL Editor):
  ```sql
  update public.profiles set coins = coins + 5000 where nickname = '닉네임';
  ```
- 빙고 · 교환 기록: `gacha_log` 테이블 (줄 보상 하나당 한 줄, `src` = decode / free / ticket(보유 해독기로 연 근하신년) / season / exchange; 옛 복주머니 기록은 pull,
  `kind` = gun / coins / frags / tickets)
- 각자의 빙고판: `bingo_boards`(근하신년), `season_boards`(시즌) 테이블
- 특정 유저에게 조각 주기:
  ```sql
  update public.profiles set fragments = fragments + 100 where nickname = '닉네임';
  ```
- 특정 유저에게 근하신년 해독기 주기 (근하신년 해독기 탭에서 코인 대신 열림):
  ```sql
  update public.profiles set dec_tickets = dec_tickets + 10 where nickname = '닉네임';
  ```

## 7. 근하신년 해독기 빙고
상점의 **근하신년 해독기** 탭. 근하신년 무기는 여기(와 조각 교환)서만 나옵니다. (v6.10에서 복주머니를 대체 — 가진 총 · 조각은 그대로)

| 항목 | 기본값 |
|---|---|
| 빙고판 | 0~49 중 25개 숫자, 5×5 (계정마다 하나, `bingo_boards` 테이블) |
| 줄 보상 | 12줄(가로 5 · 세로 5 · 대각 2)마다 근하신년 무기 1개 (S 6 · A 6, 자리는 무작위) |
| 해독기 | 1개 600 / 10개 5,400 코인, 하루 1개 무료 (한국 시간 자정 초기화) |
| 보유 해독기 | 시즌 해독기 빙고에서 받은 근하신년 해독기 — 코인 대신 1개 / 10개씩 열기 (`profiles.dec_tickets`) |
| 숫자 | 0~49 중 이 판에서 안 나온 숫자 하나 (중복 없음 → 50개면 판 전체 완성) |
| 이미 가진 무기의 줄 | S줄 3,000 코인, A줄 조각 30개 |
| 해독 조각 | 해독기마다 1~3개 |
| 판 완성 | 25칸이 다 차면 바로 새 판 (10개 열기의 나머지는 새 판에) |
| 초기화 / 뒤섞기 | 새 판(무료) / 안 찍힌 숫자 자리 섞기(하루 3번) |
| 조각 교환 | S 200개, A 80개 (원하는 무기 선택) |

- 평균(시뮬레이션 2만 판): 첫 줄 약 29개(약 17,400 코인), 6줄 약 43개, 판 전체 약 49개(약 29,400 코인).
- 숫자 · 줄 판정 · 보상은 전부 서버 함수(`qz_decode`, `qz_bingo`, `qz_bingo_reset`, `qz_bingo_shuffle`)가 하고 기록합니다.

**값 바꾸기**: **Table Editor → gacha_config** — `dec_cost1` / `dec_cost10`(가격), `bingo_hi`(숫자 범위 0~이 값, 24 이상),
`dec_frag_min` / `dec_frag_max`(조각), `shuffle_free`(하루 뒤섞기), `full_s_coins` / `full_a_frags`(가진 무기 줄 대체 보상), `ex_s` / `ex_a`(교환), `daily_free`.
`cost1` · `rate_s` · `pity` 같은 칸은 옛 복주머니용이라 이제 안 씁니다.

**무기 목록 바꾸기**: `gun_prices`의 `tier`를 `S` / `A`로 하면 다음 판부터 줄 보상에 들어가요(한 판에 12개까지). 게임 코드 `shop.js`의 `SHOP_GACHA`도 같이 고치세요.

## 8. 시즌 해독기 빙고 (이벤트 호라이즌 · 스컬-9, v6.11)
상점의 **시즌 해독기** 탭. 이벤트 호라이즌과 스컬-9를 영구 보유하는 유일한 방법이에요 (둘 다 상점에서 안 팔아요, v6.11.1부터 스컬-9도). 근하신년 판과 같은 방식인데 숫자가 0~99라 훨씬 덜 맞습니다
(첫 해독기가 판에 맞을 확률 25% — 근하신년은 50%).

| 항목 | 기본값 |
|---|---|
| 빙고판 | 0~99 중 25개 숫자, 5×5 (계정마다 하나, `season_boards` 테이블 — 근하신년 판과 따로) |
| 줄 보상 | 12줄: 이벤트 호라이즌 1줄 · 스컬-9 1줄 · 코인 1,000 2줄 · 2,000 2줄 · 5,000 1줄 · 조각 30개 2줄 · 근하신년 해독기 3개 3줄 (판마다 자리 무작위) |
| 해독기 | 1개 1,000 / 10개 9,000 코인, 무료 없음 |
| 숫자 | 0~99 중 이 판에서 안 나온 숫자 하나 (100개면 판 전체 완성) |
| 이미 가진 무기(이벤트 호라이즌 · 스컬-9)의 줄 | 10,000 코인 |
| 근하신년 해독기 줄 | 보유 해독기(`profiles.dec_tickets`) +3 → 근하신년 해독기 탭에서 코인 대신 1개 / 10개씩 열기 |
| 해독 조각 | 해독기마다 1~3개 |
| 판 완성 | 25칸이 다 차면 바로 새 판 (10개 열기의 나머지는 새 판에) |
| 초기화 / 뒤섞기 | 새 판(무료) / 안 찍힌 숫자 자리 섞기 (하루 3번, 근하신년 판과 따로 셈) |

- 평균(시뮬레이션 4만 판): 첫 줄 약 58개, **이벤트 호라이즌 줄 · 스컬-9 줄 각각 약 84개**(정확히 5×101/6 ≈ 84.2 — 10개씩 열면 약 75,600 코인, 아무리 늦어도 100개 = 90,000 코인이면 완성),
  6줄 약 86개, 판 전체 약 97개(최대 100개). 중앙값은 88개라 대부분 평균보다 조금 더 걸려요(50개 안에 완성할 확률 약 2.8%, 84개 안에 약 41%).
- 판 하나를 다 채우면(평균 97개, 10개씩 약 87,300 코인) 이벤트 호라이즌 + 스컬-9 + 코인 11,000 + 근하신년 해독기 9개 + 조각 60개(+ 해독기마다 1~3개, 평균 약 194개)가 같이 나옵니다.
- 숫자 · 줄 판정 · 보상은 서버 함수(`qz_season`, `qz_season_decode`, `qz_season_reset`, `qz_season_shuffle`)가 하고 `gacha_log`(`src` = season) · `coin_log`(season_decoder / season_win)에
  기록합니다. 보유 해독기로 근하신년 판을 여는 건 `qz_decode(p_count, p_free, p_ticket)`의 `p_ticket = true` (`src` = ticket).

**값 바꾸기**: **Table Editor → gacha_config** — `season_cost1` / `season_cost10`(가격), `season_hi`(숫자 범위 0~이 값, 24 이상), `season_frag_min` / `season_frag_max`(조각),
`season_owned_coins`(이미 가진 총의 줄 대신 주는 코인), `season_lines`(줄 보상 목록, 아래). 뒤섞기 횟수는 근하신년과 같은 `shuffle_free`(세는 건 따로).

**줄 보상 바꾸기 (`season_lines`)**: 글자 배열, 항목 하나가 줄 하나 — `gun:<총 id>`(그 총, 이미 가졌으면 `season_owned_coins` 코인), `coins:<n>`, `frags:<n>`, `tickets:<n>`(근하신년 해독기 n개).
12개보다 적으면 `coins:1000`으로 채우고, 많으면 판마다 무작위 12개. 바꾼 값은 **다음 판부터** 적용돼요(지금 판은 그대로). 기본값:
```
{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}
```
v6.11 목록(`gun:skull9` 없이 `coins:1000`이 3개)을 그대로 쓰던 DB는 schema.sql을 다시 실행하면 이 목록으로 바뀌고, 이미 깔린 판도 아직 안 채운
코인 1,000 줄 하나가 스컬-9 줄이 돼요. 손으로 고친 목록은 그대로 둡니다.
게임 코드 `shop.js`의 `GACHA_DEF.season_*`는 서버 값이 오기 전에 잠깐 보이는 예비값이에요.

## 9. 랭킹 (v6.12)
로비의 **랭킹** 버튼(폰에서는 **미션** 창의 두 번째 탭). 레벨(경험치) · 킬 · 감염 · 최고 점수 4가지, 각각 상위 50명 + 내 순위(맨 아래 고정).

- 서버 함수 `qz_ranking(p_kind)` — `p_kind` = `level` / `kills` / `infects` / `best` (그 밖의 값은 level). `profiles`의 `xp` / `rec_kills` / `rec_infects` / `rec_best`로 줄 세움.
- 매치를 한 판도 안 끝낸 계정(`rec_games = 0`)은 빠집니다. 같은 기록은 같은 순위(1, 2, 2, 4), 목록 안에서는 경험치 많은 쪽 → 먼저 가입한 쪽이 위.
- 닉네임과 기록만 내보내고(아이디 · 이메일 없음) 게스트(`anon`)도 볼 수 있어요. 로그인하면 `me`에 내 순위가 같이 옵니다.
- 레벨은 게임이 경험치로 계산(4-1번과 같은 식). 게임 화면은 같은 종류를 1분 동안 다시 묻지 않고, **새로고침** 버튼으로 바로 다시 받아요.

## 10. 일일 미션 (v6.12)
로비의 **미션** 버튼 (받을 보상이 있으면 빨간 점). 계정마다 하루(한국 시간) 3개: **쉬움 1 · 보통 1 · 어려움 1**, 서로 다른 종류로 `mission_pool`에서 뽑아요.
그날 처음 `qz_missions`(미션 창 열기 · 로그인) 또는 `qz_claim`(매치 정산)이 올 때 만들어지고, 자정에 새 3개로 바뀝니다(안 받은 보상은 사라짐).

| 종류 (`kind`) | 매치 하나가 올리는 값 (`qz_claim`과 같은 상한) |
|---|---|
| `play` | 끝까지 한 매치 1 |
| `win` | 인간 팀 승리(`p_won`) 또는 시나리오 클리어 1 |
| `kills` | 킬 (최대 80) |
| `infects` | 좀비로 감염시킨 수 (최대 30) |
| `damage` | 피해량 (최대 60,000) |
| `rounds` | 진행한 라운드 (최대 10, 시나리오는 스테이지 최대 5) |
| `hs` | 헤드샷 킬 (`qz_claim`의 새 인자 `p_hs`, 그 판 킬 수까지) |

- 진행도는 서버가 `qz_claim` 안에서 올려요 (그래서 `too_soon` — 1분 30초 안 연속 정산 — 이면 미션도 안 올라감). 게임은 결과 화면의 코인 상자 아래에 이번 판으로 오른 미션을 보여줘요.
- 보상은 `qz_mission_claim(p_slot)` — 다 채운 미션 하나당 한 번. 미션 코인은 **하루 매치 보상 한도 8,000과 따로** 세고(`day_earned`에 안 들어감), `coin_log`에 `reason = mission`으로 남아요.
- 근하신년 해독기(`profiles.dec_tickets`)는 그날의 **어려움 칸에서만, 최대 1개** 나와요 (풀에 `tickets = 1`이어도 다른 칸이면 0).

기본 풀 (`mission_pool`):

| 난이도 | 미션 (id: 목표 → 코인) |
|---|---|
| 쉬움 (tier 1) | `play1` 1판 → 150 · `kills20` 20킬 → 150 · `dmg20k` 피해 20,000 → 150 · `rounds5` 5라운드 → 150 · `hs3` 헤드샷 3킬 → 200 |
| 보통 (tier 2) | `play3` 3판 → 300 · `win1` 1승 → 300 · `kills60` 60킬 → 350 · `inf3` 3감염 → 350 · `hs12` 헤드샷 12킬 → 400 · `dmg60k` 피해 60,000 → 350 |
| 어려움 (tier 3) | `win3` 3승 → 500 + 해독기 1 · `inf10` 10감염 → 500 + 해독기 1 · `hs30` 헤드샷 30킬 → 500 + 해독기 1 · `kills150` 150킬 → 550 · `dmg150k` 피해 150,000 → 550 · `play5` 5판 → 600 |

하루 최대 대략 쉬움 200 + 보통 400 + 어려움 600 = 1,200 코인 (+ 해독기 1개).

**풀 바꾸기**: **Table Editor → mission_pool** — `goal`(목표), `coins`(0~5,000), `tickets`(0/1, 어려움 칸에서만), `tier`(1 쉬움 / 2 보통 / 3 어려움), `weight`(뽑힐 비율, 0이면 안 뽑힘),
`active`(끄기), `ko` / `en`(직접 쓴 문구 — 비우면 게임이 종류 + 목표로 써 줌). 새 줄을 넣어도 돼요 (`kind`는 위 7가지 중 하나). 바꾼 값은 **다음 날 미션부터** 적용돼요
(오늘 미션은 `daily_missions`에 복사돼 있음). schema.sql을 다시 실행해도 이미 있는 풀 줄은 덮어쓰지 않아요.

- 각자의 미션: `daily_missions` 테이블 (`user_id`, `day`, `slot` 0~2, `progress`, `claimed_at`). 일주일 지난 줄은 새 날 미션을 만들 때 지워져요.
- 특정 유저의 오늘 미션 다시 뽑기 (SQL Editor):
  ```sql
  delete from public.daily_missions where day = (now() at time zone 'Asia/Seoul')::date
    and user_id = (select id from public.profiles where nickname = '닉네임');
  ```
- v6.12부터 `qz_claim`에 `p_hs`(헤드샷 킬)가 붙어서 예전 10개 인자 함수는 지워집니다(같은 이름 함수가 두 개면 PostgREST가 헷갈림). 게임은 새 함수가 없는 DB면 `p_hs` 없이 다시 보내요.

# 계정 · 코인 · 상점 (Supabase) 설정

게임 코드에는 다 들어가 있고, Supabase 프로젝트만 연결하면 켜집니다. 연결 전에는 로그인이 숨겨지고 모든 총이 예전처럼 열려 있어요.

## 1. 프로젝트 만들기
1. https://supabase.com 에서 새 프로젝트 생성 (무료 플랜으로 충분)
2. 왼쪽 **SQL Editor → New query** → `supabase/schema.sql` 내용 전체 붙여넣기 → **Run**
   - 테이블(`profiles`, `owned_guns`, `gun_prices`, `coin_log`, `gacha_config`, `gacha_log`), 보안 규칙, 함수, 가입 트리거, 가격표가 한 번에 만들어집니다.
   - 여러 번 실행해도 안전합니다(가격표는 파일 값으로 다시 맞춰짐, 이미 산 총 · 코인 · 조각은 그대로).
   - **v6.7에서 이미 실행했다면 v6.8 `schema.sql`을 한 번 더 실행**하세요. 복주머니 테이블과 함수가 추가되고, 근하신년 무기가 판매 목록에서 빠집니다(이미 산 사람은 계속 보유).

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

- publishable(anon) 키는 원래 공개용입니다. 테이블은 RLS로 막혀 있어서 자기 데이터 읽기만 되고, 코인·구매·뽑기는 서버 함수에서만 바뀝니다.
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
- 이벤트 호라이즌은 보급상자 전용(상점 판매 안 함).
- 근하신년 무기 12종은 복주머니 전용(아래 7번).

## 4-1. 레벨 · 전적 (v6.9)
- `profiles`의 `xp`, `rec_games`, `rec_kills`, `rec_infects`, `rec_best`. 판이 끝날 때 `qz_claim`이 코인과 같이 올림.
- 경험치 = 점수×0.6 + 킬×8 + 감염×12 (최소 20, 판당 최대 3,000). 레벨은 게임이 경험치로 계산(1→2에 300, 다음부터 1.18배씩).
- 처음 로그인한 브라우저에 있던 옛 기록은 `qz_import_rec`로 계정당 한 번만 들어옴(판 수 최대 5,000, 판당 킬 80 · 감염 30 · 경험치 3,000, 경험치 총 300,000까지).
- 코인처럼 1분 30초 안에 연속 정산하면(`too_soon`) 그 판은 기록도 안 올라감.

## 5. 가격 바꾸기
**Table Editor → gun_prices**에서 `price`를 고치면 바로 적용됩니다 (게임 상점도 이 값을 읽음).
`free=true`면 기본 지급, `sold=false`면 상점에서 안 팜, `tier`가 `S`/`A`면 복주머니 전용(코인으로 못 삼).
게임 코드의 `shop.js` 가격표는 서버가 응답하기 전 잠깐 보여주는 예비용입니다.

## 6. 운영 팁
- 코인 지급/사용 기록: `coin_log` 테이블
- 특정 유저에게 코인 주기 (SQL Editor):
  ```sql
  update public.profiles set coins = coins + 5000 where nickname = '닉네임';
  ```
- 복주머니 기록: `gacha_log` 테이블 (나온 것 하나당 한 줄, `src` = pull / free / exchange, `pity_hit` = 천장으로 나온 S)
- 특정 유저에게 조각 주기:
  ```sql
  update public.profiles set fragments = fragments + 100 where nickname = '닉네임';
  ```

## 7. 근하신년 복주머니 (뽑기)
상점의 **근하신년 복주머니** 탭. 근하신년 무기는 여기서만 나옵니다.

| 항목 | 기본값 |
|---|---|
| 1회 / 10회 | 500 / 4,500 코인 (10회는 A 이상 1개 보장) |
| 무료 | 하루 1번 1회 (한국 시간 자정에 초기화) |
| S등급 2% | 적룡포 · 매그넘 드릴 · 매그넘 런처 · 볼케이노 · 흑룡포 · 게이볼그 |
| A등급 8% | 혈적자 · 리퍼 · 크로스보우 어드밴스 · 크로스보우 · 스털링 바요넷 · 스페셜 덕 풋 건 |
| 코인 30% | 100(30) · 200(30) · 300(20) · 500(15) · 1,000(5) — 괄호는 가중치 |
| 복 조각 60% | 2~5개 균등 |
| 천장 | S 없이 59번 뽑으면 60번째는 S 확정 (S가 나오면 0부터 다시) |
| 중복 | 가진 무기는 안 나오고 그 등급의 남은 무기끼리 확률을 나눔. 한 등급을 다 모으면 S 자리 → 3,000 코인, A 자리 → 조각 30개 |
| 조각 교환 | S 200개, A 80개 (원하는 무기 선택) |

- 기대값: S 하나에 평균 약 35번(천장 포함, 10회로 뽑으면 약 15,800 코인 — 뽑기에서 돌려받는 코인 빼면 약 12,900). 가진 S는 다시 안 나와서 S 6종 전부는 약 210번. 조각은 1회당 평균 2.1개라 조각만으로 S는 약 95번, A는 약 38번.
- 확률 · 천장 · 조각 · 무료 횟수는 전부 서버 함수(`qz_pull`, `qz_exchange`)가 계산하고 기록합니다. 게임 화면은 결과만 보여 줘요.

**값 바꾸기**: **Table Editor → gacha_config** (한 줄짜리)에서 고치면 바로 적용됩니다. 게임의 확률 정보 표도 이 값을 읽어요.
- `rate_s`, `rate_a`, `rate_coin`: 0~1 비율 (나머지가 조각). 합이 1을 넘지 않게.
- `coin_table`: `[[코인, 가중치], ...]` JSON
- `pity`: 천장 횟수, `cost1` / `cost10`: 가격, `ex_s` / `ex_a`: 교환에 드는 조각 수
- `daily_free`: `false`면 무료 뽑기 끔

**무기 목록 바꾸기**: `gun_prices`에서 그 총의 `tier`를 `S` / `A`로 (복주머니에 넣기) 또는 비우고 `price` · `sold=true`로 (상점 판매로 돌리기). 게임 코드 `shop.js`의 `SHOP_GACHA` 표도 같이 고치면 서버 응답 전 화면이 맞습니다.

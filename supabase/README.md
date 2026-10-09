# 계정 · 코인 · 상점 (Supabase) 설정

게임 코드에는 다 들어가 있고, Supabase 프로젝트만 연결하면 켜집니다. 연결 전에는 로그인이 숨겨지고 모든 총이 예전처럼 열려 있어요.

## 1. 프로젝트 만들기
1. https://supabase.com 에서 새 프로젝트 생성 (무료 플랜으로 충분)
2. 왼쪽 **SQL Editor → New query** → `supabase/schema.sql` 내용 전체 붙여넣기 → **Run**
   - 테이블(`profiles`, `owned_guns`, `gun_prices`, `coin_log`), 보안 규칙, 함수, 가입 트리거, 가격표가 한 번에 만들어집니다.
   - 여러 번 실행해도 안전합니다(가격표는 파일 값으로 다시 맞춰짐).

## 2. 게임에 키 넣기
**Project Settings → API**에서 두 값을 복사해 `source/src/account.js` 맨 위에 넣습니다.

```js
const SB={url:'https://xxxx.supabase.co',key:'eyJhbGciOi...(anon public key)',oauth:[]};
```

- anon key는 원래 공개용입니다. 테이블은 RLS로 막혀 있어서 자기 데이터 읽기만 되고, 코인·구매는 서버 함수에서만 바뀝니다.
- `service_role` 키는 절대 넣지 마세요.

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

## 5. 가격 바꾸기
**Table Editor → gun_prices**에서 `price`를 고치면 바로 적용됩니다 (게임 상점도 이 값을 읽음).
`free=true`면 기본 지급, `sold=false`면 상점에서 안 팜.
게임 코드의 `shop.js` 가격표는 서버가 응답하기 전 잠깐 보여주는 예비용입니다.

## 6. 운영 팁
- 코인 지급/사용 기록: `coin_log` 테이블
- 특정 유저에게 코인 주기 (SQL Editor):
  ```sql
  update public.profiles set coins = coins + 5000 where nickname = '닉네임';
  ```

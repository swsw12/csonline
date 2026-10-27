# QUARANTINE Z

브라우저에서 바로 하는 좀비 감염전 FPS (three.js).

- `index.html` — 게임 전체가 들어 있는 단일 파일 (three.js·폰트·PeerJS 내장). Vercel은 이 파일을 그대로 정적 페이지로 배포함.
- `source/` — 소스 코드. `src/*.js`, `style.css`, `body.html`을 `build.py`로 묶어서 `index.html`을 만듦.
  - 빌드: `cd source && python3 build.py` → `source/dist/standalone/index.html`, `admin.html`을 루트로 복사
  - 필요: Python 3, `pip install fonttools brotli` (폰트 서브셋)
  - 구조·변경 기록은 `source/NOTES.md`

## Vercel 배포
Framework Preset: **Other**, Build Command: 비움, Output Directory: 비움(루트). 그대로 Deploy.
`api/turn.mjs`는 Vercel이 함수로 같이 배포함 (`/api/turn`, 멀티플레이 중계 서버 로그인).

## 멀티플레이
방 만들기 → 4자리 코드를 친구에게. PeerJS 무료 서버로 연결을 중개하고 P2P로 직접 연결.
직접 연결이 막히면(기기끼리 막힌 와이파이 · 방화벽 · 공유기) Cloudflare 중계 서버(TURN)로 이어짐. 한 번만 설정:
1. Cloudflare 대시보드 → Realtime → TURN Server → 키 만들기 → Key ID와 API Token 복사
2. Vercel 프로젝트 → Settings → Environment Variables에 `TURN_KEY_ID`, `TURN_KEY_API_TOKEN` 추가 → Redeploy
3. 확인: 게임 멀티플레이 화면 「연결 점검」 → 「중계 서버 됨」 (설정 전이면 「중계 서버 아직 설정 안 됨」)

토큰은 서버(Vercel)에만 있고, 게임은 몇 시간짜리 로그인만 받음. 무료 1,000GB 넘으면 GB당 $0.05 (Cloudflare 대시보드에서 사용량 확인).

## 관리자 페이지 (`admin.html`, 배포 주소 `/admin`)
대시보드 · 플레이어 찾기 · 재화와 무기 지급/회수 · 닉네임 변경 · 이용 정지 · 무기 가격 · 해독기 설정 · 일일 미션 · 서버 공지 · 우편 보상 · 쿠폰 · 의심 유저 · 공개 방 내리기 · 운영진 · 관리 기록.
`admins` 테이블에 있는 계정만 들어갈 수 있고, 권한 확인은 전부 DB 함수(`qz_admin_*`)가 함. 주인 계정 지정은 SQL Editor에서 한 번:
```sql
insert into public.admins (user_id) select id from auth.users where email = '관리자 계정 이메일' on conflict do nothing;
```
부운영자는 주인이 관리 페이지 「운영진」에서 추가. 부운영자는 현황 · 플레이어 조회(이메일 안 보임) · 닉네임 변경 · 이용 정지/해제 · 의심 유저 · 공개 방 내리기 · 기록만 쓸 수 있고,
지급 · 무기 · 게임 설정 · 공지 · 우편 · 쿠폰 · 운영진 관리는 주인만 됨. 우편과 쿠폰은 게임 로비의 우편함(코인 옆 편지 버튼)에서 받음.
플레이어 정보 창에서 바로 지급한 무기는 우편함을 거치지 않고 보유 무기에 들어가고, 게임 화면에 「새 무기 지급」 창으로 한 번 알려 줌 (우편 · 쿠폰으로 받은 무기도 같은 창).

## 운영자 메모 (Supabase)
SQL Editor에서 실행. 총 id는 `source/src/*.js`의 `WPN` 이름 (듀얼 MP7A1 = `dmp7`, AK-47 드럼 = `ak60r`).
```sql
-- 이메일로 찾은 계정에 듀얼 MP7A1 넣기 (이미 있으면 아무 일 없음)
insert into public.owned_guns (user_id, gun_id, price_paid)
select id, 'dmp7', 0 from auth.users where email = '상대방@example.com'
on conflict do nothing;
-- 닉네임 / 친구 코드로 찾기: from auth.users where email = ... 대신
--   select id, 'dmp7', 0 from public.profiles where nickname = '닉네임'      (같은 닉네임이 여럿이면 전부 들어감)
--   select id, 'dmp7', 0 from public.profiles where fcode = 'ABC123'        (친구 코드, # 빼고)
-- 빼기
delete from public.owned_guns where gun_id = 'dmp7' and user_id = (select id from auth.users where email = '상대방@example.com');
```
넣은 뒤 그 플레이어가 게임을 새로고침하면 바로 보유로 보임.

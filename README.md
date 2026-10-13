# QUARANTINE Z

브라우저에서 바로 하는 좀비 감염전 FPS (three.js).

- `index.html` — 게임 전체가 들어 있는 단일 파일 (three.js·폰트·PeerJS 내장). Vercel은 이 파일을 그대로 정적 페이지로 배포함.
- `source/` — 소스 코드. `src/*.js`, `style.css`, `body.html`을 `build.py`로 묶어서 `index.html`을 만듦.
  - 빌드: `cd source && python3 build.py` → `source/dist/standalone/index.html`, `admin.html`을 루트로 복사
  - 필요: Python 3, `pip install fonttools brotli` (폰트 서브셋)
  - 구조·변경 기록은 `source/NOTES.md`

## Vercel 배포
Framework Preset: **Other**, Build Command: 비움, Output Directory: 비움(루트). 그대로 Deploy.

## 멀티플레이
방 만들기 → 4자리 코드를 친구에게. PeerJS 무료 서버로 P2P 연결(공유기에 따라 직접 연결이 막힐 수 있음).

## 관리자 페이지 (`admin.html`, 배포 주소 `/admin`)
대시보드 · 플레이어 찾기 · 재화와 무기 지급/회수 · 닉네임 변경 · 이용 정지 · 무기 가격 · 해독기 설정 · 일일 미션 · 서버 공지 · 우편 보상 · 쿠폰 · 의심 유저 · 공개 방 내리기 · 운영진 · 관리 기록.
`admins` 테이블에 있는 계정만 들어갈 수 있고, 권한 확인은 전부 DB 함수(`qz_admin_*`)가 함. 주인 계정 지정은 SQL Editor에서 한 번:
```sql
insert into public.admins (user_id) select id from auth.users where email = '관리자 계정 이메일' on conflict do nothing;
```
부운영자는 주인이 관리 페이지 「운영진」에서 추가. 부운영자는 현황 · 플레이어 조회(이메일 안 보임) · 닉네임 변경 · 이용 정지/해제 · 의심 유저 · 공개 방 내리기 · 기록만 쓸 수 있고,
지급 · 무기 · 게임 설정 · 공지 · 우편 · 쿠폰 · 운영진 관리는 주인만 됨. 우편과 쿠폰은 게임 로비의 우편함(코인 옆 편지 버튼)에서 받음.

## 운영자 메모 (Supabase)
SQL Editor에서 실행. 총 id는 `source/src/*.js`의 `WPN` 이름 (듀얼 MP7A1 = `dmp7`, AK-47 60R = `ak60r`).
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

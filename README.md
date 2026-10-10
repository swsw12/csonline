# QUARANTINE Z

브라우저에서 바로 하는 좀비 감염전 FPS (three.js).

- `index.html` — 게임 전체가 들어 있는 단일 파일 (three.js·폰트·PeerJS 내장). Vercel은 이 파일을 그대로 정적 페이지로 배포함.
- `source/` — 소스 코드. `src/*.js`, `style.css`, `body.html`을 `build.py`로 묶어서 `index.html`을 만듦.
  - 빌드: `cd source && python3 build.py` → `source/dist/standalone/index.html`을 루트 `index.html`로 복사
  - 필요: Python 3, `pip install fonttools brotli` (폰트 서브셋)
  - 구조·변경 기록은 `source/NOTES.md`

## Vercel 배포
Framework Preset: **Other**, Build Command: 비움, Output Directory: 비움(루트). 그대로 Deploy.

## 멀티플레이
방 만들기 → 4자리 코드를 친구에게. PeerJS 무료 서버로 P2P 연결(공유기에 따라 직접 연결이 막힐 수 있음).

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

-- ============================================================================================================
-- QUARANTINE Z — accounts, coins, the gun shop and the decoder bingos: 근하신년 + season + sidearm, the public room list (Supabase)
-- Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전합니다.
--
-- 규칙
--   * 코인 · 조각 · 보유 총 · 보유 해독기는 테이블에 직접 쓸 수 없고(RLS: 자기 것 읽기만), 아래 함수로만 바뀝니다.
--   * 총 가격은 gun_prices 테이블이 기준입니다 (게임 화면도 그 값을 씀). tier = 'S' / 'A' 는 근하신년 무기:
--     상점에서 팔지 않고 해독기 빙고와 조각 교환으로만 얻습니다. 이벤트 호라이즌(bhole) · 스컬-9(skull9) · 샐러맨더(salamander)는 시즌 해독기 빙고에서만,
--     이벤트 호라이즌 미니(bholemini) · 크림슨 피스메이커(crimson) · JANUS-2(janus2, v6.55)는 보조무기 해독기 빙고(v6.36, 숫자 1~80)에서만.
--   * 보상은 서버가 계산합니다. 라운드 보상(v6.17): 라운드가 끝날 때마다 최대 600 (지난 라운드 보상 뒤 1초당 4까지,
--     25초 안에 두 번은 안 됨) + 경험치. 판 보상: 판당 최대 1,200, 지난 판 보상 뒤 1분당 100까지, 그날 첫 판 +250.
--     라운드 + 판 보상을 합쳐 하루(한국 시간) 20,000까지. 가입하면 3,000 코인.
--   * 친구 · 선물(v6.18): 친구 코드(또는 한 명만 쓰는 닉네임)로 친구를 맺고, 상점에서 파는 총을 친구에게 선물합니다(보낸 사람 코인).
--   * 초대(v6.37): 방 초대 — 대기실에서 친구를 초대하면 친구 게임에 3분 동안 알림(room_invites). 추천인 — 내 초대 링크(?ref=친구코드)로
--     가입한 새 계정(가입 7일 안)은 바로 2,000코인을 받고, 3판을 끝내면 새 계정은 근하신년 해독기 2개, 초대한 계정은 3,000코인 + 해독기 2개
--     (초대한 계정은 10명까지). 숫자는 gacha_config의 ref_* 칸.
--   * 좀비 시나리오 챕터(v6.20): 클리어 기록은 ep_records(챕터 × 난이도)에. 판 보상은 (100 + 구역 150 + 클리어 400 + 탈출 300
--     + 킬 5) × 난이도(쉬움 .7 · 보통 1 · 어려움 1.4 · 전문가 2), 판당 3,000 · 1분당 150까지. 난이도마다 첫 클리어 1번:
--     1,000 / 3,000 / 5,000 / 8,000 코인(하루 상한과 별개) + 보통 이상은 근하신년 해독기 1개. 클리어는 4분 이상 걸린 판이어야 하고(v6.21: 5분 → 4분),
--     n챕터는 n-1챕터를 깬 계정만 기록됩니다.
--   * 명예의 전당(v6.24): 챕터 × 난이도마다 서버에서 처음 클리어한 팀(ep_firsts · ep_first_members). 그 판의 계정들이 칭호를
--     달아요(로비 · 대기실 · 이름표 · 채팅 · 랭킹 · 친구). 기록은 qz_claim이 남기고, 누구나 qz_ep_firsts로 읽습니다.
--     이 파일을 처음 돌릴 때 v6.24 전의 첫 클리어(ep_records.first_at)도 그대로 옮겨집니다.
--   * 해독기 숫자(가격 · 숫자 범위 · 조각 · 교환 가격 · 뒤섞기 횟수)는 gacha_config 테이블 한 줄(dec_*, bingo_hi …)에,
--     시즌 해독기 숫자는 같은 줄의 season_* 칸에, 보조무기 해독기 숫자는 side_* 칸에 있습니다.
--   * 관리자(v6.42): 관리자 페이지(/admin)는 admins 테이블에 있는 계정만 씁니다. 지정은 이 파일 맨 끝 「admin」 부분의 SQL 한 줄로(SQL Editor).
--     관리자가 한 일은 admin_log에 남고, 정지된 계정(profiles.banned_until)은 보상 · 상점 · 해독기 · 방 올리기 · 친구 · 메시지가 막힙니다(혼자 하기는 됨).
--     이용 시간: 게임이 켜져 있고 화면에 보이는 동안 1분마다 qz_ping → profiles.online_secs(켜 둔 시간) / play_secs(그중 판 안), 날짜별은 daily_activity.
--   * 관리자 2차(v6.43): 부운영자(admins.role 'staff': 조회 · 닉네임 · 정지 · 의심 유저 · 방 내리기 · 기록), 우편(mails: 전체 또는 고른 플레이어, 로비 우편함에서 받기),
--     쿠폰(coupons: 계정마다 한 번, 총 횟수 · 기간), 공개 방 내리기(room_blocks: 그 방장은 정한 시간 동안 다시 못 올림).
--   * 무기 알림(v6.46): 관리자가 계정에 바로 넣은 무기는 gun_notices에 남고, 게임 로비에서 무기 그림과 함께 창으로 한 번 뜹니다.
--   * 업적 · 칭호(v6.57): 업적 목록은 ach_defs(이 파일이 원본 — 다시 실행하면 숫자가 돌아옴), 받은 단계는 ach_claims. 진행도는 기록(킬 · 감염 ·
--     판 수 · 레벨 · 플레이 시간 · 보유 무기 · 챕터)과 profiles.ach 카운터(헤드샷 · 피해량 · 승리 · MVP · 생존 라운드 · 대인전 · 근접 처치 · 치료 …;
--     qz_claim / qz_round_claim이 올림, 이전 기록은 처음 한 번 coin_log에서 채움)에서 읽고, 보상은 qz_ach_claim이 한 번만 줍니다.
--     칭호는 받은 업적 단계와 명예의 전당에서 생기고, 착용은 profiles.title(qz_title_wear; 비우면 자동).
--   * 랭킹 상한(v6.65): 판 · 라운드 결과의 숫자는 지난 보상 뒤 흐른 시간만큼만 인정합니다. 판은 1분에 처치 8(시나리오 16) · 감염 4 ·
--     점수 150(시나리오 250) + 300까지(45분 · 시나리오 60분까지 셈), 라운드는 1분에 처치 12 + 3 · 감염 4 + 1 · 점수 300 + 100까지(10분까지 셈).
--     하루(한국 시간)에 처치 2,000 · 감염 800 · 경험치 150,000까지(profiles.cap_*). 넘게 보낸 판 · 라운드는 잘리고 coin_log의 detail.cut에
--     [보낸 값, 남긴 값]이 남아 관리자 페이지 「의심 유저 → 잘린 기록」에 뜹니다. 계정 만들기 전 기록 가져오기(qz_import_rec)는 닫았습니다.
--   * 오류 기록(v6.65): 플레이어 화면의 오류가 err_log에 모입니다(같은 오류는 횟수만, 최대 2,000가지, 1분에 600개까지). 누구나 보내고
--     (qz_err_report, 플레이어 정보 없음) 관리자만 봅니다(qz_admin_errors · qz_admin_err_clear, 관리자 페이지 「오류 기록」).
--   * 구글 로그인(v6.66): Google · Kakao로 가입한 계정은 「생존자 + 숫자 4자리」 닉네임으로 시작합니다(공급자가 준 이름 · 이메일은 닉네임으로
--     쓰지 않음, 게임이 처음 한 번 닉네임을 정하라고 물어봄). 켜는 곳: Supabase 대시보드 → Authentication → Sign In / Providers → Google.
--   * 문의(v6.66): 로비의 「문의하기」로 누구나(게스트도) 운영진에게 글을 남깁니다(inquiries: 계정은 1시간에 5개 · 하루 20개, 게스트는 다 합쳐
--     1시간에 60개). 답변은 관리자 페이지 「문의」에서 쓰고, 플레이어는 게임의 「내 문의」에서 봅니다(게스트는 쓴 브라우저에서만). 닫힌 문의는 180일 뒤 지워집니다.
--   * 회원 탈퇴(v6.67): 게임의 내 계정 → 회원 탈퇴(qz_account_delete)가 auth.users 줄을 지우고, 계정에 딸린 모든 테이블이 같이 지워집니다(on delete cascade).
--     관리 기록 · 보낸 선물 · 오류 기록은 계정과의 연결 없이 남습니다. 관리자 계정은 탈퇴할 수 없습니다(운영진에서 먼저 빼야 함).
--   * 기초 훈련(v6.70): 사격장에서 하는 튜토리얼을 로그인한 채 끝내면 qz_tut_claim이 계정마다 한 번 1,000코인을 줍니다(profiles.tut_done).
--     게스트로 끝낸 사람은 나중에 로그인할 때 게임이 받아 줍니다.
--   * 보안 1차(v6.71): 근·하·신·년 글자는 판마다의 한도에 더해 하루(한국 시간) gacha_config.ny_day_cap개(기본 60)까지만 쌓입니다(qz_ny_add,
--     관리자 페이지 게임 설정에서 바꿈). 판 보상 기록(coin_log)의 모드와 방 초대의 맵 · 모드는 영문 · 숫자만 남겨 짧게 잘라 저장합니다.
--   * 보안 2차(v6.72): 회원 탈퇴는 10분 안에 새로 로그인한 세션만 할 수 있습니다(qz_account_delete, auth.sessions). 초대 보상은 초대한 계정의
--     profiles.ref_paid로도 세서, 초대받은 계정이 탈퇴해도 ref_cap 자리가 다시 생기지 않고, 정지된 계정에는 초대 보상이 가지 않습니다.
--   * 보안 3차(v6.74): 판을 시작하면 서버가 판 표(match_tokens, qz_match_start)를 내주고, 판 · 라운드 보상(qz_claim · qz_round_claim)은 그 표로
--     잰 판 안의 시간만큼만 랭킹 숫자 · 업적 카운터를 인정합니다. 시나리오 클리어는 그 판의 표가 있어야 하고, 걸린 시간이 판 시간보다 길거나
--     챕터 × 난이도마다 정한 최소 시간(qz_ep_min)보다 짧으면 인정하지 않습니다. 하루 랭킹 상한은 gacha_config.rank_day_*(관리자 페이지 게임 설정),
--     업적 카운터는 판 시간에 비례한 한도와 하루 한도(profiles.cap_ach). 닉네임은 대소문자 구분 없이 한 명만 씁니다. 초대 링크는 친구 요청만 보내고
--     (받은 쪽이 수락), 차단(blocks: qz_block · qz_unblock · qz_blocks)한 사이에는 친구 요청 · 메시지 · 초대 · 선물이 막힙니다. 탈퇴한 계정의 이메일과
--     구글 · 카카오 계정 번호는 되돌릴 수 없는 해시로 30일(정지 중에 탈퇴했으면 정지가 끝날 때까지) deleted_ids에 남아, 같은 사람이 다시 가입하면
--     정지가 이어지고 가입 보상(코인 · 기초 훈련 · 초대 · 새 계정 우편)이 없습니다. 명예의 전당 기록은 관리자 페이지 「의심 유저 → 명예의 전당」에서
--     주인이 지울 수 있습니다(qz_admin_hof_del).
--   * 함수 안에서 값을 읽을 때는 전부 `변수 := (...)` 대입으로 씁니다. 다른 꼴은 SQL Editor의 "새 테이블 RLS 자동 켜기"가
--     테이블 만들기로 착각해서 함수 중간에 문장을 끼워 넣고 "unterminated dollar-quoted string" 오류가 납니다.
-- ============================================================================================================

-- ---------- tables ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nickname     text not null default '생존자',
  coins        integer not null default 0 check (coins >= 0),
  earned_total integer not null default 0,
  matches      integer not null default 0,
  last_claim   timestamptz,
  day          date,
  day_earned   integer not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.profiles add column if not exists fragments integer not null default 0 check (fragments >= 0);
alter table public.profiles add column if not exists pity integer not null default 0;   -- pouch pulls since the last S
alter table public.profiles add column if not exists free_day date;                     -- the day the free pull was used
-- the player record shown in the lobby (level = xp): games, kills, infections, best score — counted here from each match
alter table public.profiles add column if not exists rec_games    integer not null default 0;
alter table public.profiles add column if not exists rec_kills    integer not null default 0;
alter table public.profiles add column if not exists rec_infects  integer not null default 0;
alter table public.profiles add column if not exists rec_best     integer not null default 0;
alter table public.profiles add column if not exists xp           integer not null default 0;
alter table public.profiles add column if not exists rec_imported boolean not null default false;  -- the browser's old record was brought in
-- v6.65: the day the ranking numbers were last counted on (Korean time) and how much xp, kills and infections went in on it (qz_claim / qz_round_claim cap them)
alter table public.profiles add column if not exists cap_day   date;
alter table public.profiles add column if not exists cap_xp    integer not null default 0;
alter table public.profiles add column if not exists cap_kills integer not null default 0;
alter table public.profiles add column if not exists cap_inf   integer not null default 0;
create table if not exists public.gun_prices (
  gun_id text primary key,
  price  integer not null check (price >= 0),
  free   boolean not null default false,  -- everyone has it from the start
  sold   boolean not null default true    -- false: not in the shop (bhole, skull9, salamander: the season decoder; bholemini, crimson, janus2: the sidearm decoder; tier S / A: the 근하신년 decoder)
);
alter table public.gun_prices add column if not exists tier text check (tier in ('S', 'A'));  -- 근하신년: pouch only
create table if not exists public.owned_guns (
  user_id    uuid not null references auth.users(id) on delete cascade,
  gun_id     text not null references public.gun_prices(gun_id),
  price_paid integer not null default 0,
  bought_at  timestamptz not null default now(),
  primary key (user_id, gun_id)
);
create table if not exists public.coin_log (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta   integer not null,
  reason  text not null,
  detail  jsonb,
  at      timestamptz not null default now()
);
create index if not exists coin_log_user on public.coin_log(user_id, at desc);
-- v6.57: achievements (업적) and titles (칭호). ach = the counters the record does not keep, added up by qz_claim / qz_round_claim:
-- hs headshot kills, dmg damage, wins Mutation · Original matches won, mvp match MVPs, surv rounds lived through as a human, zw rounds
-- won as a zombie, pk / pw PvP kills / wins, rw arms races won, kn melee kills, cu Q7 cures, mk Bloodhound marks, cr supply crates,
-- bm bombs planted or defused. ach_fill: the counters were filled once from coin_log (every match and round paid before v6.57).
-- title = the title worn: null = automatic (the hall of fame's best, else the rarest one earned), 'none', 'hof:<ep*10+diff>' or the
-- id of an achievement title
alter table public.profiles add column if not exists ach      jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists ach_fill boolean not null default false;
alter table public.profiles add column if not exists title    text;
create index if not exists profiles_nickname on public.profiles(nickname);
-- every tier of every achievement: grp = its ladder, stat = the number it reads (qz_ach_stats), goal, the reward (coins and 근하신년
-- decoders) and the title it gives (title_g = that title's grade 1..5; the automatic title picks the highest). The game names them.
create table if not exists public.ach_defs (
  id      text primary key,
  grp     text not null,
  tier    smallint not null check (tier between 1 and 9),
  stat    text not null,
  goal    bigint not null check (goal > 0),
  coins   integer not null default 0 check (coins between 0 and 20000),
  tickets integer not null default 0 check (tickets between 0 and 10),
  title   text,
  title_g smallint not null default 0 check (title_g between 0 and 5),
  ord     integer not null default 0,
  active  boolean not null default true
);
-- the tiers each account has taken the reward of (and so the titles it has)
create table if not exists public.ach_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  ach_id  text not null,
  at      timestamptz not null default now(),
  primary key (user_id, ach_id)
);
alter table public.ach_defs   enable row level security;
alter table public.ach_claims enable row level security;
drop policy if exists "read achievements" on public.ach_defs;
create policy "read achievements" on public.ach_defs for select to anon, authenticated using (true);
drop policy if exists "read own achievements" on public.ach_claims;
create policy "read own achievements" on public.ach_claims for select to authenticated using ((select auth.uid()) = user_id);
-- the list (this file is its source: running it again puts these numbers back)
insert into public.ach_defs (id, grp, tier, stat, goal, coins, tickets, title, title_g, ord) values
  ('kill1', 'kill', 1, 'kills', 100, 300, 0, null, 0, 10),
  ('kill2', 'kill', 2, 'kills', 1000, 1000, 0, 'hunter', 2, 10),
  ('kill3', 'kill', 3, 'kills', 5000, 2000, 1, null, 0, 10),
  ('kill4', 'kill', 4, 'kills', 15000, 3000, 2, 'slayer', 4, 10),
  ('kill5', 'kill', 5, 'kills', 40000, 5000, 3, 'reaper', 5, 10),
  ('hs1', 'hs', 1, 'hs', 50, 300, 0, null, 0, 20),
  ('hs2', 'hs', 2, 'hs', 500, 1000, 0, 'marksman', 2, 20),
  ('hs3', 'hs', 3, 'hs', 2500, 2000, 1, null, 0, 20),
  ('hs4', 'hs', 4, 'hs', 8000, 4000, 2, 'oneshot', 4, 20),
  ('dmg1', 'dmg', 1, 'dmg', 200000, 300, 0, null, 0, 30),
  ('dmg2', 'dmg', 2, 'dmg', 2000000, 1000, 0, null, 0, 30),
  ('dmg3', 'dmg', 3, 'dmg', 10000000, 2000, 1, 'firepower', 3, 30),
  ('dmg4', 'dmg', 4, 'dmg', 40000000, 4000, 2, 'artillery', 4, 30),
  ('knife1', 'knife', 1, 'kn', 10, 300, 0, null, 0, 40),
  ('knife2', 'knife', 2, 'kn', 100, 1000, 0, 'blade', 2, 40),
  ('knife3', 'knife', 3, 'kn', 500, 2500, 1, 'bladedance', 4, 40),
  ('mvp1', 'mvp', 1, 'mvp', 5, 300, 0, null, 0, 50),
  ('mvp2', 'mvp', 2, 'mvp', 30, 1000, 0, 'ace', 3, 50),
  ('mvp3', 'mvp', 3, 'mvp', 100, 3000, 2, 'dominator', 4, 50),
  ('inf1', 'inf', 1, 'inf', 30, 300, 0, null, 0, 60),
  ('inf2', 'inf', 2, 'inf', 300, 1000, 0, 'plague', 2, 60),
  ('inf3', 'inf', 3, 'inf', 1500, 2500, 1, 'pandemic', 3, 60),
  ('inf4', 'inf', 4, 'inf', 5000, 5000, 3, 'patientzero', 5, 60),
  ('zw1', 'zw', 1, 'zw', 10, 300, 0, null, 0, 70),
  ('zw2', 'zw', 2, 'zw', 100, 1000, 0, 'horde', 2, 70),
  ('zw3', 'zw', 3, 'zw', 500, 3000, 2, 'legion', 4, 70),
  ('surv1', 'surv', 1, 'surv', 10, 300, 0, null, 0, 80),
  ('surv2', 'surv', 2, 'surv', 100, 1000, 0, 'survivor', 2, 80),
  ('surv3', 'surv', 3, 'surv', 500, 2500, 1, 'immortal', 4, 80),
  ('surv4', 'surv', 4, 'surv', 2000, 5000, 3, 'lasthuman', 5, 80),
  ('win1', 'win', 1, 'wins', 5, 300, 0, null, 0, 90),
  ('win2', 'win', 2, 'wins', 50, 1500, 0, 'resistance', 3, 90),
  ('win3', 'win', 3, 'wins', 200, 4000, 2, 'hero', 4, 90),
  ('ep1', 'ep', 1, 'ep', 1, 500, 0, null, 0, 100),
  ('ep2', 'ep', 2, 'ep', 3, 1500, 1, null, 0, 100),
  ('ep3', 'ep', 3, 'ep', 5, 3000, 2, 'liberator', 4, 100),
  ('eph1', 'eph', 1, 'eph', 1, 1000, 0, null, 0, 110),
  ('eph2', 'eph', 2, 'eph', 3, 2500, 1, null, 0, 110),
  ('eph3', 'eph', 3, 'eph', 5, 5000, 3, 'hellwalker', 4, 110),
  ('epx1', 'epx', 1, 'epx', 1, 2000, 1, 'expert', 4, 120),
  ('epx2', 'epx', 2, 'epx', 5, 8000, 5, 'nightmare', 5, 120),
  ('medal1', 'medal', 1, 'medal', 1, 1000, 0, 'flawless', 3, 130),
  ('medal2', 'medal', 2, 'medal', 5, 3000, 2, null, 0, 130),
  ('medal3', 'medal', 3, 'medal', 15, 6000, 4, 'perfect', 5, 130),
  ('hof1', 'hof', 1, 'hof', 1, 3000, 2, null, 0, 140),
  ('pk1', 'pk', 1, 'pk', 50, 300, 0, null, 0, 150),
  ('pk2', 'pk', 2, 'pk', 500, 1500, 0, 'gunslinger', 2, 150),
  ('pk3', 'pk', 3, 'pk', 3000, 4000, 2, 'duelist', 4, 150),
  ('pw1', 'pw', 1, 'pw', 5, 300, 0, null, 0, 160),
  ('pw2', 'pw', 2, 'pw', 50, 1500, 0, 'merc', 3, 160),
  ('pw3', 'pw', 3, 'pw', 200, 4000, 2, 'warhound', 4, 160),
  ('rw1', 'rw', 1, 'rw', 1, 500, 0, null, 0, 170),
  ('rw2', 'rw', 2, 'rw', 10, 2000, 1, 'armsmaster', 4, 170),
  ('bomb1', 'bomb', 1, 'bm', 5, 300, 0, null, 0, 180),
  ('bomb2', 'bomb', 2, 'bm', 50, 2000, 1, 'demolition', 3, 180),
  ('lv1', 'lv', 1, 'lv', 10, 500, 0, 'recruit', 1, 190),
  ('lv2', 'lv', 2, 'lv', 20, 1000, 0, 'veteran', 2, 190),
  ('lv3', 'lv', 3, 'lv', 30, 2500, 1, 'elite', 3, 190),
  ('lv4', 'lv', 4, 'lv', 40, 5000, 3, 'oldguard', 4, 190),
  ('games1', 'games', 1, 'games', 10, 300, 0, null, 0, 200),
  ('games2', 'games', 2, 'games', 100, 1000, 0, 'regular', 2, 200),
  ('games3', 'games', 3, 'games', 500, 3000, 2, 'resident', 3, 200),
  ('games4', 'games', 4, 'games', 2000, 6000, 4, 'legend', 5, 200),
  ('hours1', 'hours', 1, 'hours', 10, 500, 0, null, 0, 210),
  ('hours2', 'hours', 2, 'hours', 50, 1500, 0, 'nightshift', 2, 210),
  ('hours3', 'hours', 3, 'hours', 200, 4000, 2, 'oldtimer', 4, 210),
  ('guns1', 'guns', 1, 'guns', 10, 500, 0, null, 0, 220),
  ('guns2', 'guns', 2, 'guns', 25, 1500, 0, 'collector', 2, 220),
  ('guns3', 'guns', 3, 'guns', 45, 4000, 2, 'arsenal', 4, 220),
  ('cure1', 'cure', 1, 'cu', 1, 300, 0, null, 0, 230),
  ('cure2', 'cure', 2, 'cu', 20, 1500, 0, 'medic', 3, 230),
  ('cure3', 'cure', 3, 'cu', 100, 4000, 2, 'savior', 4, 230),
  ('mark1', 'mark', 1, 'mk', 20, 300, 0, null, 0, 240),
  ('mark2', 'mark', 2, 'mk', 300, 1500, 0, 'tracker', 3, 240),
  ('crate1', 'crate', 1, 'cr', 5, 300, 0, null, 0, 250),
  ('crate2', 'crate', 2, 'cr', 50, 1500, 0, 'supply', 2, 250)
on conflict (id) do update set grp = excluded.grp, tier = excluded.tier, stat = excluded.stat, goal = excluded.goal, coins = excluded.coins,
  tickets = excluded.tickets, title = excluded.title, title_g = excluded.title_g, ord = excluded.ord, active = true;
-- whole numbers out of text (0 when it is not one): integer, bigint
create or replace function public.qz_int(t text) returns integer
language sql immutable set search_path = '' as $$
  select case when t ~ '^-?[0-9]{1,9}$' then t::integer else 0 end
$$;
create or replace function public.qz_big(t text) returns bigint
language sql immutable set search_path = '' as $$
  select case when t ~ '^-?[0-9]{1,18}$' then t::bigint else 0 end
$$;
-- the counters of every match and round paid before v6.57, from coin_log, once per account (matches clamped as qz_claim clamps them)
update public.profiles p set ach = p.ach || jsonb_strip_nulls(s.v), ach_fill = true
from (select l.user_id, jsonb_build_object(
    'hs', sum(least(greatest(public.qz_int(l.detail ->> 'hs'), 0), least(greatest(public.qz_int(l.detail ->> 'kills'), 0), 80))) filter (where l.reason = 'match'),
    'dmg', sum(least(greatest(public.qz_int(l.detail ->> 'damage'), 0), 60000)) filter (where l.reason = 'match'),
    'wins', count(*) filter (where l.reason = 'match' and l.detail ->> 'mode' in ('orig', 'mut') and l.detail ->> 'won' = 'true'),
    'mvp', count(*) filter (where l.reason = 'match' and l.detail ->> 'mvp' = 'true'),
    'pk', sum(least(greatest(public.qz_int(l.detail ->> 'kills'), 0), 80)) filter (where l.reason = 'match' and l.detail ->> 'mode' in ('tdm', 'ffa', 'bomb', 'race')),
    'pw', count(*) filter (where l.reason = 'match' and l.detail ->> 'mode' in ('tdm', 'ffa', 'bomb', 'race') and l.detail ->> 'won' = 'true'),
    'rw', count(*) filter (where l.reason = 'match' and l.detail ->> 'mode' = 'race' and l.detail ->> 'won' = 'true'),
    'surv', count(*) filter (where l.reason = 'round' and l.detail ->> 'mode' in ('orig', 'mut') and l.detail ->> 'survived' = 'true'),
    'zw', count(*) filter (where l.reason = 'round' and l.detail ->> 'mode' in ('orig', 'mut') and l.detail ->> 'won' = 'true'
      and coalesce(l.detail ->> 'survived', 'false') <> 'true')) as v
  from public.coin_log l where l.reason in ('match', 'round') group by l.user_id) s
where p.id = s.user_id and not p.ach_fill;
update public.profiles set ach_fill = true where not ach_fill;
alter table public.profiles alter column ach_fill set default true;
-- the lucky pouch: one row of numbers, and every result ever drawn
create table if not exists public.gacha_config (
  id           integer primary key default 1 check (id = 1),
  cost1        integer not null default 500,
  cost10       integer not null default 4500,
  rate_s       numeric not null default 0.02,
  rate_a       numeric not null default 0.08,
  rate_coin    numeric not null default 0.30,   -- the rest are fragments
  pity         integer not null default 60,     -- an S on this pull at the latest
  coin_table   jsonb   not null default '[[100,30],[200,30],[300,20],[500,15],[1000,5]]',  -- [coins, weight]
  frag_min     integer not null default 2,
  frag_max     integer not null default 5,
  full_s_coins integer not null default 3000,   -- an S when every S is owned
  full_a_frags integer not null default 30,     -- an A when every A is owned
  ex_s         integer not null default 200,    -- fragments for an S of your choice
  ex_a         integer not null default 80,
  daily_free   boolean not null default true
);
-- the decoder bingo (v6.10): what the pouch columns above became
alter table public.gacha_config add column if not exists dec_cost1    integer not null default 600;   -- one decoder
alter table public.gacha_config add column if not exists dec_cost10   integer not null default 5400;  -- ten
alter table public.gacha_config add column if not exists bingo_hi     integer not null default 49;    -- numbers 0 .. this (24 at least)
alter table public.gacha_config add column if not exists dec_frag_min integer not null default 1;     -- fragments every decoder gives
alter table public.gacha_config add column if not exists dec_frag_max integer not null default 3;
alter table public.gacha_config add column if not exists shuffle_free integer not null default 3;     -- shuffles a day
alter table public.profiles add column if not exists shuffle_day date;
alter table public.profiles add column if not exists shuffles integer not null default 0;
-- one bingo card per player: 25 numbers (cells 0..24, row by row), the numbers drawn so far, a 근하신년 gun on each of the 12 lines
-- (rows 1-5, columns 6-10, the diagonal from the top left 11, from the top right 12)
create table if not exists public.bingo_boards (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nums       integer[] not null,
  marked     boolean[] not null,
  drawn      integer[] not null default '{}',
  rewards    text[]    not null,
  done       boolean[] not null,
  boards     integer   not null default 1,   -- how many cards this player has had
  updated_at timestamptz not null default now()
);
-- the season decoder (v6.11): a second card per player, numbers 0..season_hi (fewer hits than the 근하신년 card). Its 12 lines
-- carry the items in season_lines, shuffled onto the lines: gun:<id> (that gun; owned already: season_owned_coins coins),
-- coins:<n>, frags:<n>, tickets:<n> (n free 근하신년 decoders, kept in profiles.dec_tickets). More than 12: 12 of them at random.
alter table public.gacha_config add column if not exists season_cost1       integer not null default 1000;   -- one season decoder
alter table public.gacha_config add column if not exists season_cost10      integer not null default 9000;   -- ten
alter table public.gacha_config add column if not exists season_hi          integer not null default 99;     -- numbers 0 .. this (24 at least)
alter table public.gacha_config add column if not exists season_frag_min    integer not null default 1;      -- fragments every season decoder gives
alter table public.gacha_config add column if not exists season_frag_max    integer not null default 3;
alter table public.gacha_config add column if not exists season_owned_coins integer not null default 10000;  -- a gun line whose gun is owned
alter table public.gacha_config add column if not exists season_lines text[] not null
  default '{gun:bhole,gun:skull9,gun:salamander,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}';
alter table public.profiles add column if not exists dec_tickets integer not null default 0 check (dec_tickets >= 0);  -- 근하신년 decoders to open
-- v6.15: the 근·하·신·년 letters picked up in matches, kept on the account (a full set trades for 2 근하신년 decoders or 1 season decoder);
-- ny_quota = letters the last finished match may still add (set by qz_claim, used by qz_ny_add); season_tickets = season decoders kept
alter table public.profiles add column if not exists ny_g integer not null default 0 check (ny_g >= 0);
alter table public.profiles add column if not exists ny_h integer not null default 0 check (ny_h >= 0);
alter table public.profiles add column if not exists ny_s integer not null default 0 check (ny_s >= 0);
alter table public.profiles add column if not exists ny_n integer not null default 0 check (ny_n >= 0);
alter table public.profiles add column if not exists ny_quota integer not null default 0;
alter table public.profiles add column if not exists season_tickets integer not null default 0 check (season_tickets >= 0);
alter table public.profiles add column if not exists season_shuffle_day date;                          -- the season card's own shuffles
alter table public.profiles add column if not exists season_shuffles    integer not null default 0;
-- v6.17: coins and xp for every finished round (qz_round_claim). last_round = when the last round was paid; bonus_day = the day the
-- first-match bonus was given (it used to be read off profiles.day, which the round rewards now move on too)
alter table public.profiles add column if not exists last_round timestamptz;
alter table public.profiles add column if not exists bonus_day date;
update public.profiles set bonus_day = day where bonus_day is null and day is not null;
-- v6.25: last_seen = the last time the game was open (qz_ping, and every look at the friend list); the friend list shows it
alter table public.profiles add column if not exists last_seen timestamptz;
-- v6.37: invites. ref_by = the account whose invite link brought this one in (set once, within ref_days of signing up); ref_done = its
-- reward was settled (after ref_matches finished matches). The numbers live in gacha_config (ref_*).
alter table public.profiles add column if not exists ref_by uuid references auth.users(id) on delete set null;
alter table public.profiles add column if not exists ref_done boolean not null default false;
alter table public.gacha_config add column if not exists ref_new_coins   integer not null default 2000;  -- the new player, when the link is applied
alter table public.gacha_config add column if not exists ref_new_tickets integer not null default 2;     -- the new player, after ref_matches matches
alter table public.gacha_config add column if not exists ref_coins       integer not null default 3000;  -- the inviter, after ref_matches matches
alter table public.gacha_config add column if not exists ref_tickets     integer not null default 2;
alter table public.gacha_config add column if not exists ref_matches     integer not null default 3;     -- finished matches the new player needs
alter table public.gacha_config add column if not exists ref_cap         integer not null default 10;    -- invited players an inviter is paid for
alter table public.gacha_config add column if not exists ref_days        integer not null default 7;     -- how new an account must be to take a link
-- v6.71: the 근·하·신·년 letters one account may keep in a Korean day, however many matches (qz_ny_add)
alter table public.gacha_config add column if not exists ny_day_cap      integer not null default 60;
-- v6.74: what one account's matches may put on the ranking in a Korean day: kills, infections, xp (qz_claim; xp from the rounds too)
alter table public.gacha_config add column if not exists rank_day_kills  integer not null default 2000 check (rank_day_kills between 0 and 100000);
alter table public.gacha_config add column if not exists rank_day_inf    integer not null default 400 check (rank_day_inf between 0 and 100000);
alter table public.gacha_config add column if not exists rank_day_xp     integer not null default 100000 check (rank_day_xp between 0 and 10000000);
-- who brought whom (one row per new player); rewarded = the inviter was paid (false once over ref_cap); seen = the inviter saw the reward
create table if not exists public.referrals (
  referee  uuid primary key references auth.users(id) on delete cascade,
  referrer uuid not null references auth.users(id) on delete cascade,
  at       timestamptz not null default now(),
  paid_at  timestamptz,
  rewarded boolean not null default false,
  seen     boolean not null default true
);
create index if not exists referrals_referrer on public.referrals(referrer);
-- v6.72: the invite rewards an account has been paid, for good: an invited account deleted later no longer frees a place under ref_cap
alter table public.profiles add column if not exists ref_paid integer not null default 0;
update public.profiles p set ref_paid = q.n
  from (select r.referrer, count(*)::integer as n from public.referrals r where r.rewarded group by r.referrer) q
  where p.id = q.referrer and p.ref_paid < q.n;
-- a friend invited into a PeerJS room (its 4-letter code): one row per inviter and friend, a new invite replaces the old; 3 minutes to answer
create table if not exists public.room_invites (
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id   uuid not null references auth.users(id) on delete cascade,
  code    text not null,
  map     text not null default '',
  mode    text not null default '',
  at      timestamptz not null default now(),
  primary key (from_id, to_id)
);
create index if not exists room_invites_to on public.room_invites(to_id, at);
create table if not exists public.season_boards (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nums       integer[] not null,
  marked     boolean[] not null,
  drawn      integer[] not null default '{}',
  rewards    text[]    not null,   -- the 12 line items (rows 1-5, columns 6-10, diagonals 11-12), e.g. gun:bhole, coins:1000
  done       boolean[] not null,
  boards     integer   not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.gacha_config (id) values (1) on conflict (id) do nothing;
-- v6.11.1: Skull-9 leaves the shop for a season line, in the place of one coins:1000 line. A card dealt before that gets it too, on a
-- coins:1000 line not finished yet. Both run only while gacha_config still holds the v6.11 list (a list edited by hand is left alone).
with t as (
  select b.user_id, (select min(i) from generate_subscripts(b.rewards, 1) i where b.rewards[i] = 'coins:1000' and not b.done[i]) as k
  from public.season_boards b
  where not ('gun:skull9' = any(b.rewards))
    and exists (select 1 from public.gacha_config c where c.id = 1 and c.season_lines = '{gun:bhole,coins:1000,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[])
)
update public.season_boards b set rewards = b.rewards[1:t.k - 1] || array['gun:skull9'] || b.rewards[t.k + 1:]
from t where b.user_id = t.user_id and t.k is not null;
update public.gacha_config set season_lines = '{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[]
where id = 1 and season_lines = '{gun:bhole,coins:1000,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[];
alter table public.gacha_config alter column season_lines set default '{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}';
-- v6.13: the Salamander flamethrower joins the season card the same way (another coins:1000 line), while the v6.11.1 list stands
with t as (
  select b.user_id, (select min(i) from generate_subscripts(b.rewards, 1) i where b.rewards[i] = 'coins:1000' and not b.done[i]) as k
  from public.season_boards b
  where not ('gun:salamander' = any(b.rewards))
    and exists (select 1 from public.gacha_config c where c.id = 1 and c.season_lines = '{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[])
)
update public.season_boards b set rewards = b.rewards[1:t.k - 1] || array['gun:salamander'] || b.rewards[t.k + 1:]
from t where b.user_id = t.user_id and t.k is not null;
update public.gacha_config set season_lines = '{gun:bhole,gun:skull9,gun:salamander,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[]
where id = 1 and season_lines = '{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}'::text[];
alter table public.gacha_config alter column season_lines set default '{gun:bhole,gun:skull9,gun:salamander,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}';
-- v6.36: the sidearm decoder (보조무기 해독기): a third card per player, numbers 1..side_hi (1~80). Its 12 lines carry the items in
-- side_lines the way the season card's do: gun:<id> (the Event Horizon Mini and the Crimson Peacemaker come from here only; owned
-- already: side_owned_coins coins), coins:<n>, frags:<n>, tickets:<n> (n 근하신년 decoders). Coins only: no free one, none kept.
alter table public.gacha_config add column if not exists side_cost1       integer not null default 500;    -- one sidearm decoder
alter table public.gacha_config add column if not exists side_cost10      integer not null default 4500;   -- ten
alter table public.gacha_config add column if not exists side_hi          integer not null default 80;     -- numbers 1 .. this (25 at least)
alter table public.gacha_config add column if not exists side_frag_min    integer not null default 1;      -- fragments every sidearm decoder gives
alter table public.gacha_config add column if not exists side_frag_max    integer not null default 2;
alter table public.gacha_config add column if not exists side_owned_coins integer not null default 5000;   -- a gun line whose gun is owned
alter table public.gacha_config add column if not exists side_lines text[] not null
  default '{gun:bholemini,gun:crimson,coins:500,coins:1000,coins:1000,coins:2000,coins:3000,frags:20,frags:20,frags:30,tickets:1,tickets:1}';
-- v6.41: transcendence (초월) fragments. Every decoder (근하신년, season, sidearm) gives trans_frag_min..trans_frag_max of them on top of
-- the decoder fragments; trans_cost of them trade for one transcendence gun of trans_guns (the M4A1 Dark Knight first: qz_trans_exchange).
-- Those guns never come from a decoder line, the shop or a gift.
alter table public.profiles add column if not exists trans_frags integer not null default 0 check (trans_frags >= 0);
alter table public.gacha_config add column if not exists trans_frag_min integer not null default 2;
alter table public.gacha_config add column if not exists trans_frag_max integer not null default 4;
alter table public.gacha_config add column if not exists trans_cost     integer not null default 888;
alter table public.gacha_config add column if not exists trans_guns     text[]  not null default '{m4dk}';
alter table public.profiles add column if not exists side_shuffle_day date;                          -- the sidearm card's own shuffles
alter table public.profiles add column if not exists side_shuffles    integer not null default 0;
create table if not exists public.side_boards (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  nums       integer[] not null,
  marked     boolean[] not null,
  drawn      integer[] not null default '{}',
  rewards    text[]    not null,   -- the 12 line items (rows 1-5, columns 6-10, diagonals 11-12), e.g. gun:crimson, coins:1000
  done       boolean[] not null,
  boards     integer   not null default 1,
  updated_at timestamptz not null default now()
);
-- v6.55: JANUS-2 joins the sidearm card the same way (one of the two coins:1000 lines); a card already open takes it on its first
-- coins:1000 line not done yet, while the list is still the v6.36 one
with t as (
  select b.user_id, (select min(i) from generate_subscripts(b.rewards, 1) i where b.rewards[i] = 'coins:1000' and not b.done[i]) as k
  from public.side_boards b
  where not ('gun:janus2' = any(b.rewards))
    and exists (select 1 from public.gacha_config c where c.id = 1 and c.side_lines = '{gun:bholemini,gun:crimson,coins:500,coins:1000,coins:1000,coins:2000,coins:3000,frags:20,frags:20,frags:30,tickets:1,tickets:1}'::text[])
)
update public.side_boards b set rewards = b.rewards[1:t.k - 1] || array['gun:janus2'] || b.rewards[t.k + 1:]
from t where b.user_id = t.user_id and t.k is not null;
update public.gacha_config set side_lines = '{gun:bholemini,gun:crimson,gun:janus2,coins:500,coins:1000,coins:2000,coins:3000,frags:20,frags:20,frags:30,tickets:1,tickets:1}'::text[]
where id = 1 and side_lines = '{gun:bholemini,gun:crimson,coins:500,coins:1000,coins:1000,coins:2000,coins:3000,frags:20,frags:20,frags:30,tickets:1,tickets:1}'::text[];
alter table public.gacha_config alter column side_lines set default '{gun:bholemini,gun:crimson,gun:janus2,coins:500,coins:1000,coins:2000,coins:3000,frags:20,frags:20,frags:30,tickets:1,tickets:1}';
create table if not exists public.gacha_log (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  at       timestamptz not null default now(),
  src      text not null,               -- decode | free | ticket | season | side | exchange | trans (pull: the old pouch)
  kind     text not null,               -- gun | coins | frags | tickets
  tier     text,
  gun_id   text,
  amount   integer not null default 0,
  pity_hit boolean not null default false
);
create index if not exists gacha_log_user on public.gacha_log(user_id, id desc);
-- v6.20: the zombie-scenario episodes, one row per player × episode × difficulty (0 easy .. 3 expert): plays, clears, the best clear
-- (time in seconds, medal S / A / B, lives lost) and when it was first cleared (the first-clear reward is paid once per row)
create table if not exists public.ep_records (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ep         integer not null check (ep between 1 and 5),
  diff       integer not null check (diff between 0 and 3),
  plays      integer not null default 0,
  clears     integer not null default 0,
  best_time  integer,
  best_medal text check (best_medal in ('S', 'A', 'B')),
  best_lives integer,
  first_at   timestamptz,
  last_at    timestamptz not null default now(),
  primary key (user_id, ep, diff)
);
-- v6.24: the hall of fame. One row per episode × difficulty, made by the first clear qz_claim accepts (match_id = the id that match
-- gave every page, so its players' separate claims find each other), and the accounts of that match that claimed it within
-- 15 minutes (at most 8). Read through qz_ep_firsts only.
create table if not exists public.ep_firsts (
  ep         integer not null check (ep between 1 and 5),
  diff       integer not null check (diff between 0 and 3),
  match_id   text not null,
  at         timestamptz not null default now(),
  clear_time integer,
  primary key (ep, diff)
);
create table if not exists public.ep_first_members (
  ep      integer not null,
  diff    integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now(),
  primary key (ep, diff, user_id),
  foreign key (ep, diff) references public.ep_firsts (ep, diff) on delete cascade
);
create index if not exists ep_first_members_user on public.ep_first_members (user_id);
-- v6.74: the ticket the server hands a page as a match starts there (qz_match_start); the match's claim (qz_claim, once) and its rounds'
-- (qz_round_claim) bring it back. started_at = when the server saw the match start: the claim counts the minutes from it (not from the
-- last claim), and a scenario clear can take no longer than that. mode / ep / diff are fixed at the start; mt = the match's own id.
-- A new ticket ends the account's older ones not used yet; used ones go after a day.
create table if not exists public.match_tokens (
  token      text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text not null,
  ep         integer not null default 0,
  diff       integer not null default 1,
  mt         text not null default '',
  started_at timestamptz not null default now(),
  used_at    timestamptz
);
create index if not exists match_tokens_user on public.match_tokens (user_id, started_at desc);
-- the clears from before v6.24: the earliest first clear of each episode × difficulty, and everyone whose own first clear of it came
-- within 3 minutes of that one (one match: every page claims as its results show). Only rows not there yet, so re-running is safe.
insert into public.ep_firsts (ep, diff, match_id, at)
select r.ep, r.diff, 'past:', min(r.first_at) from public.ep_records r where r.first_at is not null group by r.ep, r.diff
on conflict (ep, diff) do nothing;
insert into public.ep_first_members (ep, diff, user_id, at)
select r.ep, r.diff, r.user_id, r.first_at from public.ep_records r join public.ep_firsts f on f.ep = r.ep and f.diff = r.diff
where f.match_id = 'past:' and r.first_at is not null and r.first_at <= f.at + interval '3 minutes'
on conflict do nothing;

-- v6.42: the admin side. admins = the accounts that may use the admin page (/admin); only the SQL Editor puts one there (see the admin
-- section at the end: nothing the game or the admin page can call changes it). admin_log = everything they did. A ban
-- (profiles.banned_until, ban_reason; 'infinity' = for good) shuts the account's server side until then: rewards, the shop, decoders,
-- posting a room, friends, messages and invites (qz_guard); playing alone still works. notices = the server notices the lobby shows.
-- Play time (the heartbeat, qz_ping): online_secs = time the game was open and in view, play_secs = the part of it spent in a match;
-- daily_activity = the same per day (Korean time) per player, so the daily player counts come from it.
alter table public.profiles add column if not exists banned_until timestamptz;
alter table public.profiles add column if not exists ban_reason   text;
alter table public.profiles add column if not exists online_secs  bigint not null default 0;
alter table public.profiles add column if not exists play_secs    bigint not null default 0;
alter table public.profiles add column if not exists last_beat    timestamptz;
-- v6.70: when the account finished 기초 훈련 (the tutorial on the shooting range) and took its one-time reward (qz_tut_claim)
alter table public.profiles add column if not exists tut_done     timestamptz;
-- v6.71: the letters kept today (ny_day = that Korean day, ny_day_n = how many), against gacha_config.ny_day_cap
alter table public.profiles add column if not exists ny_day       date;
alter table public.profiles add column if not exists ny_day_n     integer not null default 0;
-- v6.74: cap_ach = the achievement counters taken on cap_day (Korean time), against the day's limits (qz_claim / qz_round_claim);
-- reborn = made by someone whose deleted account (its e-mail, or its Google / Kakao account) is still remembered (deleted_ids): no sign-up rewards
alter table public.profiles add column if not exists cap_ach      jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists reborn       boolean not null default false;
create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  role     text not null default 'owner' check (role in ('owner', 'staff')),
  added_at timestamptz not null default now()
);
create table if not exists public.admin_log (
  id       bigint generated always as identity primary key,
  admin_id uuid references auth.users(id) on delete set null,
  at       timestamptz not null default now(),
  action   text not null,
  target   uuid references auth.users(id) on delete set null,
  detail   jsonb,
  reason   text
);
create index if not exists admin_log_target on public.admin_log(target, id desc);
create table if not exists public.notices (
  id         bigint generated always as identity primary key,
  title      text not null check (char_length(title) between 1 and 80),
  body       text not null default '' check (char_length(body) <= 1000),
  level      text not null default 'info' check (level in ('info', 'warn', 'event')),
  popup      boolean not null default false,   -- also a window in the lobby, once per browser
  starts_at  timestamptz not null default now(),
  ends_at    timestamptz,
  active     boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.daily_activity (
  day         date not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  online_secs integer not null default 0,
  play_secs   integer not null default 0,
  first_at    timestamptz not null default now(),
  last_at     timestamptz not null default now(),
  primary key (day, user_id)
);
create index if not exists daily_activity_user on public.daily_activity(user_id, day desc);
-- v6.66: 문의 — what players (guests too) write from the lobby's 문의하기 button, and the operators' answers. Read and written only
-- through the functions in the 「문의」 part near the end (qz_inquiry_send, qz_my_inquiries, qz_admin_inquir*)
create table if not exists public.inquiries (
  id       bigint generated always as identity primary key,
  user_id  uuid references auth.users(id) on delete cascade,      -- null: a guest
  ticket   text not null,                                          -- the inquiry's own key: a guest's browser keeps it to read the answer
  nickname text,                                                   -- the nickname when it was written
  kind     text not null default 'etc' check (kind in ('bug', 'account', 'report', 'idea', 'etc')),
  body     text not null check (char_length(body) between 1 and 1000),
  contact  text check (char_length(contact) <= 100),               -- a way to reach them, if they gave one (the owner sees it, staff do not)
  ctx      jsonb,                                                  -- what the game added: version, language, browser, screen
  status   text not null default 'new' check (status in ('new', 'done')),
  reply    text check (char_length(reply) <= 1000),
  reply_at timestamptz,
  reply_by uuid references auth.users(id) on delete set null,
  seen     boolean not null default true,                          -- false: an answer the player has not opened yet
  at       timestamptz not null default now(),
  done_at  timestamptz,
  done_by  uuid references auth.users(id) on delete set null
);
create unique index if not exists inquiries_ticket on public.inquiries(ticket);
create index if not exists inquiries_status on public.inquiries(status, id desc);
create index if not exists inquiries_user on public.inquiries(user_id, id desc);
create index if not exists inquiries_at on public.inquiries(at desc);
alter table public.inquiries enable row level security;
revoke all on table public.inquiries from public, anon, authenticated;

-- ---------- row level security: read your own rows (prices and pouch numbers are public); no direct writes ----------
alter table public.profiles     enable row level security;
alter table public.gun_prices   enable row level security;
alter table public.owned_guns   enable row level security;
alter table public.coin_log     enable row level security;
alter table public.gacha_config enable row level security;
alter table public.gacha_log    enable row level security;
alter table public.bingo_boards enable row level security;
alter table public.season_boards enable row level security;
alter table public.side_boards  enable row level security;
alter table public.ep_records   enable row level security;
alter table public.ep_firsts        enable row level security;   -- (no policies: the hall of fame comes out of qz_ep_firsts only)
alter table public.ep_first_members enable row level security;
alter table public.referrals    enable row level security;   -- (no policies: read through qz_me / qz_ref_info only)
alter table public.room_invites enable row level security;   -- (no policies: qz_invite / qz_invites only)
alter table public.match_tokens enable row level security;   -- (no policies: qz_match_start / qz_claim / qz_round_claim only, v6.74)
revoke all on table public.match_tokens from public, anon, authenticated;
revoke all on table public.ep_firsts from anon, authenticated;
revoke all on table public.ep_first_members from anon, authenticated;
revoke all on table public.referrals from anon, authenticated;
revoke all on table public.room_invites from anon, authenticated;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "read prices" on public.gun_prices;
create policy "read prices" on public.gun_prices for select to anon, authenticated using (true);
drop policy if exists "read own guns" on public.owned_guns;
create policy "read own guns" on public.owned_guns for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own log" on public.coin_log;
create policy "read own log" on public.coin_log for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read pouch numbers" on public.gacha_config;
create policy "read pouch numbers" on public.gacha_config for select to anon, authenticated using (true);
drop policy if exists "read own pulls" on public.gacha_log;
create policy "read own pulls" on public.gacha_log for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own card" on public.bingo_boards;
create policy "read own card" on public.bingo_boards for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own season card" on public.season_boards;
create policy "read own season card" on public.season_boards for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own sidearm card" on public.side_boards;
create policy "read own sidearm card" on public.side_boards for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own episodes" on public.ep_records;
create policy "read own episodes" on public.ep_records for select to authenticated using ((select auth.uid()) = user_id);

-- ---------- price list (re-running updates it; tier S / A = pouch only) ----------
-- v6.42: a price or a shop flag set on the admin page (admin_set) is kept when this file runs again; file_price / file_sold keep what
-- the file says (the admin page's reset puts those back)
-- v6.56: sentinel · q7vac · bhound are crate guns like ak60r / dmp7 (not sold; an account that owns one picks it from the buy menu)
-- v6.59: glock — a plain pistol sold for 1,000 coins; dglock (Double Glock) — a crate gun like the others (a sidearm)
-- v6.60: vector (3,500) · an94 (5,000) · m82 (8,500) sold; spas12d (SPAS-12 Dragon's Breath) · m32c (M32 Cluster) crate guns
-- v6.69: m4dk2 (M4A1 다크나이트-2) a crate gun like the others
alter table public.gun_prices add column if not exists admin_set  boolean not null default false;
alter table public.gun_prices add column if not exists file_price integer;
alter table public.gun_prices add column if not exists file_sold  boolean;
insert into public.gun_prices (gun_id, price, free, sold, tier) values
  ('knife',0,true,true,null),
  ('p9',0,true,true,null),
  ('sg8',0,true,true,null),
  ('k5',0,true,true,null),
  ('g35',0,true,true,null),
  ('f7',1200,false,true,null),
  ('d50',1500,false,true,null),
  ('tw9',1800,false,true,null),
  ('r6',2000,false,true,null),
  ('glock',1000,false,true,null),
  ('vector',3500,false,true,null),
  ('an94',5000,false,true,null),
  ('m82',8500,false,true,null),
  ('db2',1500,false,true,null),
  ('m14',3500,false,true,null),
  ('as12',4500,false,true,null),
  ('k9',1200,false,true,null),
  ('um45',1800,false,true,null),
  ('pd50',3000,false,true,null),
  ('br3',2500,false,true,null),
  ('kv47',3500,false,true,null),
  ('ar7',4000,false,true,null),
  ('ar5c',4500,false,true,null),
  ('hr17',5500,false,true,null),
  ('sr8',2500,false,true,null),
  ('r700',6500,false,true,null),
  ('dm14',7000,false,true,null),
  ('mg6',6000,false,true,null),
  ('hmg',6500,false,true,null),
  ('gx6',10000,false,true,null),
  ('airb',4500,false,true,null),
  ('gl40',5500,false,true,null),
  ('axe',1500,false,true,null),
  ('hammer',4000,false,true,null),
  ('killknife',12000,false,true,null),
  ('blaze8',6000,false,true,null),
  ('winchester',4500,false,true,null),
  ('balrog5',6500,false,true,null),
  ('balrog11',7000,false,true,null),
  ('plasma',7500,false,true,null),
  ('thunder',9500,false,true,null),
  ('bholemini',0,false,false,null),
  ('crimson',0,false,false,null),
  ('janus2',0,false,false,null),
  ('katana',9000,false,true,null),
  ('jhammer',7500,false,true,null),
  ('dde',8500,false,true,null),
  ('janus1',8500,false,true,null),
  ('cbmav',9000,false,true,null),
  ('thanatos9',15000,false,true,null),
  ('m4dk',0,false,false,null),
  ('bhole',0,false,false,null),
  ('skull9',0,false,false,null),
  ('salamander',0,false,false,null),
  ('ak60r',0,false,false,null),
  ('dmp7',0,false,false,null),
  ('sentinel',0,false,false,null),
  ('q7vac',0,false,false,null),
  ('bhound',0,false,false,null),
  ('dglock',0,false,false,null),
  ('spas12d',0,false,false,null),
  ('m32c',0,false,false,null),
  ('m4dk2',0,false,false,null),
  ('rdc',0,false,false,'S'),
  ('mdrill',0,false,false,'S'),
  ('mlaunch',0,false,false,'S'),
  ('volc',0,false,false,'S'),
  ('bdc',0,false,false,'S'),
  ('gaebolg',0,false,false,'S'),
  ('xdz',0,false,false,'A'),
  ('ripper',0,false,false,'A'),
  ('xbowa',0,false,false,'A'),
  ('xbow',0,false,false,'A'),
  ('sterling',0,false,false,'A'),
  ('duckfoot',0,false,false,'A')
on conflict (gun_id) do update set free = excluded.free, tier = excluded.tier, file_price = excluded.price, file_sold = excluded.sold,
  price = case when public.gun_prices.admin_set then public.gun_prices.price else excluded.price end,
  sold = case when public.gun_prices.admin_set then public.gun_prices.sold else excluded.sold end;
update public.gun_prices set file_price = price, file_sold = sold where file_price is null;

-- ---------- helpers ----------
-- v6.42: a banned account (profiles.banned_until still ahead) is refused here: every call that pays, sells, opens decoders, posts a room
-- or reaches another player starts with it
create or replace function public.qz_guard(uid uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
declare b timestamptz;
begin
  b := (select t.banned_until from public.profiles t where t.id = uid);
  if b is not null and b > now() then raise exception 'banned'; end if;
end $$;
-- a nickname: no control characters, single spaces, 2..16 characters (anything shorter becomes 생존자)
create or replace function public.qz_clean_nick(t text) returns text
language sql immutable set search_path = '' as $$
  select case when char_length(n) >= 2 then n else '생존자' end
  from (select left(btrim(regexp_replace(regexp_replace(coalesce(t, ''), '[[:cntrl:]]', '', 'g'), '\s+', ' ', 'g')), 16) as n) s
$$;
-- a new player: profile + the welcome coins (once). v6.74: p_welcome false = no welcome coins (someone back after deleting an account);
-- a nickname another player has (any case) becomes 생존자 + digits — the game asks for one then
drop function if exists public.qz_new_profile(uuid, text);
create or replace function public.qz_new_profile(uid uuid, nick text, p_welcome boolean default true) returns void
language plpgsql security definer set search_path = '' as $$
declare
  n text := public.qz_clean_nick(nick);
  i integer := 0;
  v_new boolean := false;
begin
  if exists (select 1 from public.profiles t where t.id = uid) then return; end if;
  if n = '생존자' or exists (select 1 from public.profiles t where lower(t.nickname) = lower(n)) then n := public.qz_auto_nick(); end if;
  loop
    begin
      insert into public.profiles (id, nickname, coins, fcode) values (uid, n, case when p_welcome then 3000 else 0 end, public.qz_fcode_new()) on conflict (id) do nothing;
      v_new := found;
      exit;
    exception when unique_violation then   -- (the same nickname or friend code taken at that very moment: another try)
      i := i + 1;
      if i >= 4 then raise; end if;
      n := public.qz_auto_nick();
    end;
  end loop;
  if v_new and p_welcome then
    insert into public.coin_log (user_id, delta, reason) values (uid, 3000, 'welcome');
  end if;
end $$;
-- v6.66: a nickname for an account that did not choose one: 생존자 + 4 digits, one nobody has (any case). v6.74: after 8 tries 6 digits,
-- then 8 — nicknames are one player's each now, so it always finds one
create or replace function public.qz_auto_nick() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  n text;
  i integer := 0;
  d integer;
begin
  loop
    d := case when i < 8 then 4 when i < 16 then 6 else 8 end;
    n := '생존자' || lpad(floor(random() * power(10, d))::bigint::text, d, '0');
    i := i + 1;
    exit when i >= 30 or not exists (select 1 from public.profiles t where lower(t.nickname) = lower(n));
  end loop;
  return n;
end $$;
-- v6.74: what a deleted account leaves behind (qz_account_delete): its e-mail and its Google / Kakao accounts, each only as a hash that cannot
-- be turned back (sha-256 with a secret of this database, qz_secret), kept 30 days or, when it was suspended, until the suspension ends.
-- A sign-up that matches one (qz_on_signup) gets no sign-up rewards (welcome coins, 기초 훈련, invite link, mail for new accounts) and the
-- suspension goes on. Nobody reads either table; the functions below only.
create table if not exists public.qz_secret (
  id     integer primary key default 1 check (id = 1),
  pepper text not null
);
alter table public.qz_secret enable row level security;
revoke all on table public.qz_secret from public, anon, authenticated;
insert into public.qz_secret (id, pepper) values (1, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')) on conflict (id) do nothing;
create table if not exists public.deleted_ids (
  h            text primary key,
  keep_until   timestamptz not null,
  banned_until timestamptz,
  ban_reason   text,
  at           timestamptz not null default now()
);
alter table public.deleted_ids enable row level security;
revoke all on table public.deleted_ids from public, anon, authenticated;
-- the hashes of one sign-in: its e-mail ('e:' + lower case) and, for Google / Kakao, the provider's own account number ('p:' provider ':' id)
create or replace function public.qz_idhs(p_email text, p_prov text, p_pid text) returns text[]
language sql stable security definer set search_path = '' as $$
  select coalesce(array_agg(distinct encode(sha256(convert_to(s.pepper || ':' || x.v, 'UTF8')), 'hex')), '{}'::text[])
  from public.qz_secret s cross join (values
      (case when coalesce(btrim(p_email), '') <> '' then 'e:' || lower(btrim(p_email)) end),
      (case when coalesce(p_prov, 'email') <> 'email' and coalesce(btrim(p_pid), '') <> '' then 'p:' || p_prov || ':' || btrim(p_pid) end)) as x(v)
  where s.id = 1 and x.v is not null
$$;
-- every sign-up (email or Google / Kakao) gets a profile. v6.66: the nickname is the one the game's own sign-up form sent (an e-mail
-- account) and nothing else: a Google / Kakao account starts as 생존자 + 4 digits (the game asks for a nickname once), never with the
-- name or the e-mail address the provider gave (those would show to every player)
-- v6.74: someone back with the e-mail or the Google / Kakao account of a deleted account still remembered (deleted_ids) starts with no
-- sign-up rewards (reborn), and a suspension that account left under goes on (noted in the admin log). This part never stops a sign-up.
create or replace function public.qz_on_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_nick text;
  v_prov text := coalesce(new.raw_app_meta_data ->> 'provider', 'email');
  v_hs text[];
  v_re boolean := false;
  v_ban timestamptz;
  v_rsn text;
begin
  if v_prov = 'email' then v_nick := new.raw_user_meta_data ->> 'nickname'; end if;
  v_nick := public.qz_clean_nick(v_nick);
  if v_nick = '생존자' then v_nick := public.qz_auto_nick(); end if;
  begin
    v_hs := public.qz_idhs(new.email, v_prov, coalesce(nullif(new.raw_user_meta_data ->> 'provider_id', ''), new.raw_user_meta_data ->> 'sub'));
    v_re := exists (select 1 from public.deleted_ids d where d.h = any(v_hs) and d.keep_until > now());
    v_ban := (select max(d.banned_until) from public.deleted_ids d where d.h = any(v_hs) and d.keep_until > now() and d.banned_until > now());
    v_rsn := (select d.ban_reason from public.deleted_ids d where d.h = any(v_hs) and d.banned_until = v_ban limit 1);
  exception when others then
    v_re := false;
    v_ban := null;
  end;
  perform public.qz_new_profile(new.id, v_nick, not v_re);
  if v_re then
    update public.profiles set reborn = true, tut_done = coalesce(tut_done, now()) where id = new.id;
  end if;
  if v_ban is not null then
    update public.profiles set banned_until = v_ban, ban_reason = v_rsn where id = new.id;
    insert into public.admin_log (admin_id, action, target, detail, reason) values (null, 'ban_carry', new.id, jsonb_build_object('until', v_ban), v_rsn);
  end if;
  return new;
end $$;
drop trigger if exists qz_on_signup on auth.users;
create trigger qz_on_signup after insert on auth.users for each row execute function public.qz_on_signup();

-- the record as the game reads it
create or replace function public.qz_rec(p public.profiles) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('g', p.rec_games, 'k', p.rec_kills, 'inf', p.rec_infects, 'best', p.rec_best, 'xp', p.xp, 'imported', p.rec_imported)
$$;

-- the episode records as the game reads them (v6.20)
create or replace function public.qz_eps(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('ep', r.ep, 'diff', r.diff, 'plays', r.plays, 'clears', r.clears, 'best_time', r.best_time,
    'best_medal', r.best_medal, 'best_lives', r.best_lives, 'first_at', r.first_at) order by r.ep, r.diff), '[]'::jsonb)
  from public.ep_records r where r.user_id = uid
$$;
-- the hall-of-fame titles of one account (v6.24): ep * 10 + diff of every first-clear team it is in (12 = chapter 1, hard)
create or replace function public.qz_firsts_of(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(m.ep * 10 + m.diff order by m.ep, m.diff), '[]'::jsonb) from public.ep_first_members m where m.user_id = uid
$$;
-- the one shown next to the name: the latest chapter, then the hardest difficulty (null: none)
create or replace function public.qz_first_best(uid uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select max(m.ep * 10 + m.diff) from public.ep_first_members m where m.user_id = uid
$$;
-- the hall of fame as the game shows it (v6.24): every episode × difficulty cleared so far, when, in what time, and the team's
-- nicknames (no ids). Anyone may read it, signed in or not.
create or replace function public.qz_ep_firsts() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('ep', f.ep, 'diff', f.diff, 'at', f.at, 'time', f.clear_time,
      'team', coalesce((select jsonb_agg(t.nickname order by m.at, t.nickname) from public.ep_first_members m
        join public.profiles t on t.id = m.user_id where m.ep = f.ep and m.diff = f.diff), '[]'::jsonb)) order by f.ep, f.diff), '[]'::jsonb)
  from public.ep_firsts f
$$;

-- ---------- achievements and titles (v6.57) ----------
-- the level a number of xp is: the game's recLevel (lobby.js: 300 xp to level 2, each level 18 % more, 99 at most), as a table of
-- the xp each level starts at (worked out by the game's own code, so the two always agree)
create or replace function public.qz_level(p_xp bigint) returns integer
language sql immutable set search_path = '' as $$
  select count(*)::integer from unnest(array[0,300,654,1072,1565,2147,2834,3645,4602,5731,7063,8635,10490,12679,15262,18310,21907,26151,31159,37068,44041,52269,61978,73435,86954,102906,121729,143940,170149,201076,237570,280633,331447,391408,462162,545652,644170,760421,897597,1059465,1250469,1475854,1741808,2055634,2425949,2862921,3378548,3986988,4704947,5552139,6551826,7731457,9123422,10765941,12704113,14991156,17689867,20874346,24632031,29066099,34298299,40472295,47757610,56354282,66498355,78468361,92592968,109260004,128927106,152134286,179518758,211832435,249962574,294956138,348048544,410697583,484623449,571855971,674790347,796252911,939578737,1108703212,1308270093,1543759013,1821635939,2149530712,2536446544,2993007226,3531748831,4167463925,4917607736,5802777433,6847277675,8079787961,9534150098,11250297420,13275351260,15664914791,18484599758]::bigint[]) t where t <= greatest(coalesce(p_xp, 0), 0)
$$;
-- counters added up key by key (b's whole numbers onto a's)
create or replace function public.qz_ach_add(a jsonb, b jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(a, '{}'::jsonb) || coalesce((select jsonb_object_agg(e.k, public.qz_big(coalesce(a, '{}'::jsonb) ->> e.k) + public.qz_big(e.v))
    from jsonb_each_text(coalesce(b, '{}'::jsonb)) as e(k, v) where public.qz_big(e.v) <> 0), '{}'::jsonb)
$$;
-- every number an achievement reads, for one account: the record (kills, inf, games, lv from xp, hours played in matches, guns owned),
-- the chapters (ep: chapters cleared, eph: on hard or expert, epx: on expert, medal: S medals, hof: first-clear teams) and the counters
create or replace function public.qz_ach_stats(uid uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  p public.profiles;
  e jsonb;
begin
  p := (select t from public.profiles t where t.id = uid);
  if p.id is null then return '{}'::jsonb; end if;
  e := (select jsonb_build_object('ep', count(distinct r.ep) filter (where r.clears > 0),
      'eph', count(distinct r.ep) filter (where r.clears > 0 and r.diff >= 2),
      'epx', count(distinct r.ep) filter (where r.clears > 0 and r.diff = 3),
      'medal', count(*) filter (where r.best_medal = 'S'))
    from public.ep_records r where r.user_id = uid);
  return coalesce(p.ach, '{}'::jsonb) || coalesce(e, '{}'::jsonb) || jsonb_build_object('kills', p.rec_kills, 'inf', p.rec_infects,
    'games', p.rec_games, 'lv', public.qz_level(p.xp), 'hours', floor(p.play_secs / 3600.0)::bigint,
    'guns', (select count(*) from public.owned_guns o where o.user_id = uid),
    'hof', (select count(*) from public.ep_first_members m where m.user_id = uid));
end $$;
-- the tiers reached and not claimed yet
create or replace function public.qz_ach_ready(uid uuid) returns integer
language plpgsql stable security definer set search_path = '' as $$
declare s jsonb;
begin
  s := public.qz_ach_stats(uid);
  return (select count(*) from public.ach_defs d where d.active and public.qz_big(s ->> d.stat) >= d.goal
    and not exists (select 1 from public.ach_claims c where c.user_id = uid and c.ach_id = d.id));
end $$;
-- the tiers a match just reached (s0: the numbers before it)
create or replace function public.qz_ach_hits(uid uuid, s0 jsonb) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare s1 jsonb;
begin
  s1 := public.qz_ach_stats(uid);
  return coalesce((select jsonb_agg(d.id order by d.ord, d.tier) from public.ach_defs d where d.active
    and public.qz_big(s1 ->> d.stat) >= d.goal and public.qz_big(s0 ->> d.stat) < d.goal
    and not exists (select 1 from public.ach_claims c where c.user_id = uid and c.ach_id = d.id)), '[]'::jsonb);
end $$;
-- the title one account wears, as everyone sees it: the one it set while it still has it ('none': nothing), else automatic — the hall
-- of fame's best ('hof:<code>'), else the highest grade of its achievement titles (the latest of those)
create or replace function public.qz_title_worn(uid uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  w text;
  b integer;
begin
  w := (select p.title from public.profiles p where p.id = uid);
  if w = 'none' then return null; end if;
  if w like 'hof:%' then
    if exists (select 1 from public.ep_first_members m where m.user_id = uid and 'hof:' || (m.ep * 10 + m.diff) = w) then return w; end if;
  elsif w is not null then
    if exists (select 1 from public.ach_claims c join public.ach_defs d on d.id = c.ach_id where c.user_id = uid and d.title = w) then return w; end if;
  end if;
  b := public.qz_first_best(uid);
  if b is not null then return 'hof:' || b; end if;
  return (select d.title from public.ach_claims c join public.ach_defs d on d.id = c.ach_id where c.user_id = uid and d.title is not null
    order by d.title_g desc, c.at desc, d.ord desc limit 1);
end $$;
-- everything the achievements window shows: the tiers (defs), the numbers (stats), the tiers claimed, how many wait (ready), the title
-- worn (worn) and as set (title: null = automatic)
create or replace function public.qz_ach_json(uid uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare s jsonb;
begin
  s := public.qz_ach_stats(uid);
  return jsonb_build_object('stats', s,
    'claimed', coalesce((select jsonb_agg(c.ach_id order by c.at) from public.ach_claims c where c.user_id = uid), '[]'::jsonb),
    'ready', (select count(*) from public.ach_defs d where d.active and public.qz_big(s ->> d.stat) >= d.goal
      and not exists (select 1 from public.ach_claims c where c.user_id = uid and c.ach_id = d.id)),
    'title', (select p.title from public.profiles p where p.id = uid), 'worn', public.qz_title_worn(uid),
    'defs', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'grp', d.grp, 'tier', d.tier, 'stat', d.stat, 'goal', d.goal,
      'coins', d.coins, 'tickets', d.tickets, 'title', d.title, 'g', d.title_g) order by d.ord, d.tier) from public.ach_defs d where d.active), '[]'::jsonb));
end $$;
-- the titles worn by the accounts with these nicknames (16 at most; anyone may ask): in a match another player's title shows only when
-- the server says that nickname wears it
create or replace function public.qz_titles_of(p_names text[]) returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(s.nickname, s.ts), '{}'::jsonb)
  from (select t.nickname, coalesce(jsonb_agg(distinct w.v) filter (where w.v is not null), '[]'::jsonb) as ts
        from public.profiles t cross join lateral (select public.qz_title_worn(t.id) as v) w
        where t.nickname = any((coalesce(p_names, '{}'::text[]))[1:16]) group by t.nickname) s
$$;
revoke all on function public.qz_level(bigint) from public, anon, authenticated;
revoke all on function public.qz_int(text) from public, anon, authenticated;
revoke all on function public.qz_big(text) from public, anon, authenticated;
revoke all on function public.qz_ach_add(jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.qz_ach_stats(uuid) from public, anon, authenticated;
revoke all on function public.qz_ach_ready(uuid) from public, anon, authenticated;
revoke all on function public.qz_ach_hits(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.qz_title_worn(uuid) from public, anon, authenticated;
revoke all on function public.qz_ach_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_titles_of(text[]) from public;
grant execute on function public.qz_titles_of(text[]) to anon, authenticated;

-- ---------- what the game calls (POST /rest/v1/rpc/<name>) ----------
-- me: nickname, coins, fragments, pouch pity, the free decoder, 근하신년 decoders kept (tickets), owned guns, admin / ban (v6.42),
-- the friend code, gifts not shown yet and friend requests waiting (v6.18), the episode records (v6.20), hall-of-fame titles (v6.24),
-- the title worn and the achievement rewards waiting (v6.57), answers to my inquiries not read yet (v6.66)
-- (creates the profile if the account is older than this file)
create or replace function public.qz_me() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.id is null then
    -- (v6.66: the nickname the way qz_on_signup picks it: the sign-up form's for an e-mail account, else 생존자 + 4 digits)
    perform public.qz_new_profile(uid, (select case when coalesce(u.raw_app_meta_data ->> 'provider', 'email') = 'email'
        and public.qz_clean_nick(u.raw_user_meta_data ->> 'nickname') <> '생존자' then u.raw_user_meta_data ->> 'nickname' else public.qz_auto_nick() end
      from auth.users u where u.id = uid));
    p := (select t from public.profiles t where t.id = uid);
  end if;
  if p.fcode is null then
    update public.profiles set fcode = public.qz_fcode_new() where id = uid;
    p := (select t from public.profiles t where t.id = uid);
  end if;
  return jsonb_build_object('nickname', p.nickname, 'coins', p.coins, 'earned', p.earned_total, 'matches', p.matches,
    'fcode', p.fcode, 'gifts_new', (select count(*) from public.gifts g where g.to_id = uid and not g.seen),
    'friend_req', (select count(*) from public.friends f where f.b = uid and not f.accepted),
    'day_left', 20000 - case when p.day = today then p.day_earned else 0 end,
    'fragments', p.fragments, 'tfrags', p.trans_frags, 'pity', p.pity, 'tickets', p.dec_tickets,
    'ny', jsonb_build_array(p.ny_g, p.ny_h, p.ny_s, p.ny_n), 'season_tickets', p.season_tickets,
    -- (v6.37: by = who invited me, done = that reward settled, left = matches still to play for it; n / paid = players I brought in /
    -- was paid for; new = rewards for them not shown yet)
    'ref', jsonb_build_object('by', (select x.nickname from public.profiles x where x.id = p.ref_by), 'done', p.ref_done,
      'left', greatest(0, coalesce((select c.ref_matches from public.gacha_config c where c.id = 1), 3) - p.matches),
      'n', (select count(*) from public.referrals f where f.referrer = uid), 'paid', greatest(p.ref_paid, (select count(*) from public.referrals f where f.referrer = uid and f.rewarded)::integer),
      'new', (select count(*) from public.referrals f where f.referrer = uid and not f.seen)),
    'free_today', coalesce((select c.daily_free from public.gacha_config c where c.id = 1), false) and p.free_day is distinct from today,
    'rec', public.qz_rec(p), 'eps', public.qz_eps(uid), 'firsts', public.qz_firsts_of(uid),
    -- (v6.57: title = the title worn as others see it, title_set = as set (null: automatic), ach_ready = achievement rewards waiting)
    'title', public.qz_title_worn(uid), 'title_set', p.title, 'ach_ready', public.qz_ach_ready(uid),
    -- (v6.42: admin = may open the admin page; ban = {until, forever, reason} while banned)
    'admin', exists (select 1 from public.admins a where a.user_id = uid),
    'mail_new', (select count(*) from public.qz_mail_open(uid)),   -- (v6.43: letters waiting in the mailbox)
    'gun_new', (select count(*) from public.gun_notices g where g.user_id = uid and not g.seen),   -- (v6.46: weapons an admin put on the account, not shown yet)
    'inq_new', (select count(*) from public.inquiries q where q.user_id = uid and q.reply is not null and not q.seen),   -- (v6.66: answers to my inquiries not read yet)
    'tut', p.tut_done is not null,   -- (v6.70: 기초 훈련 finished and its reward taken)
    'ban', case when p.banned_until > now() then jsonb_build_object('until', p.banned_until, 'forever', p.banned_until = 'infinity'::timestamptz, 'reason', p.ban_reason) end,
    'owned', coalesce((select jsonb_agg(o.gun_id order by o.bought_at) from public.owned_guns o where o.user_id = uid), '[]'::jsonb));
end $$;

-- v6.74: a nickname is one player's (any case): another's is refused (nick_taken), and so is one under 2 characters (nick_short)
create or replace function public.qz_set_nickname(p_nick text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  n text := public.qz_clean_nick(left(coalesce(p_nick, ''), 64));
  r text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if not exists (select 1 from public.profiles t where t.id = uid) then raise exception 'no_profile'; end if;
  if char_length(btrim(regexp_replace(left(coalesce(p_nick, ''), 64), '[[:cntrl:]]', '', 'g'))) < 2 then raise exception 'nick_short'; end if;
  if exists (select 1 from public.profiles t where lower(t.nickname) = lower(n) and t.id <> uid) then raise exception 'nick_taken'; end if;
  begin
    update public.profiles set nickname = n where id = uid;
  exception when unique_violation then
    raise exception 'nick_taken';
  end;
  r := (select t.nickname from public.profiles t where t.id = uid);
  return r;
end $$;
-- v6.74: is this nickname free (as it would be cleaned: nick)? The sign-up form asks first; anyone may (ok false: why nick_short, else taken)
create or replace function public.qz_nick_free(p_nick text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare n text := public.qz_clean_nick(left(coalesce(p_nick, ''), 64));
begin
  if char_length(btrim(regexp_replace(left(coalesce(p_nick, ''), 64), '[[:cntrl:]]', '', 'g'))) < 2 then
    return jsonb_build_object('ok', false, 'why', 'nick_short', 'nick', n);
  end if;
  return jsonb_build_object('ok', not exists (select 1 from public.profiles t where lower(t.nickname) = lower(n) and t.id is distinct from auth.uid()), 'nick', n);
end $$;

-- buy a gun with coins (checked and charged here, never in the browser)
create or replace function public.qz_buy(p_gun text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  pr public.gun_prices;
  c integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  pr := (select g from public.gun_prices g where g.gun_id = p_gun);
  if pr.tier is not null then raise exception 'gacha_only'; end if;
  if pr.gun_id is null or not pr.sold then raise exception 'not_for_sale'; end if;
  if pr.free then raise exception 'already_owned'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  c := (select t.coins from public.profiles t where t.id = uid);
  if exists (select 1 from public.owned_guns where user_id = uid and gun_id = p_gun) then raise exception 'already_owned'; end if;
  if c < pr.price then raise exception 'not_enough_coins'; end if;
  update public.profiles set coins = coins - pr.price where id = uid;
  c := (select t.coins from public.profiles t where t.id = uid);
  insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, p_gun, pr.price);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, -pr.price, 'buy', jsonb_build_object('gun', p_gun));
  return jsonb_build_object('coins', c, 'gun', p_gun);
end $$;

-- ---------- v6.74: the match ticket ----------
-- a match starts on this page: its ticket (match_tokens). p_mode = one of the modes that pay; p_ep / p_diff = the chapter and the
-- difficulty (the scenario); p_match = the match's own id (the same on every page of it). Older tickets not used yet end here; one every 2 s
create or replace function public.qz_match_start(p_mode text, p_ep integer default 0, p_diff integer default 1, p_match text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_mode text := left(regexp_replace(left(coalesce(p_mode, ''), 64), '[^a-z]', '', 'g'), 12);
  v_tok text := replace(gen_random_uuid()::text, '-', '');
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if v_mode not in ('orig', 'mut', 'tdm', 'ffa', 'bomb', 'race', 'scen') then raise exception 'bad_mode'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  if exists (select 1 from public.match_tokens t where t.user_id = uid and t.started_at > now() - interval '2 seconds') then raise exception 'too_soon'; end if;
  delete from public.match_tokens t where t.user_id = uid and (t.used_at is null or t.used_at < now() - interval '1 day');
  insert into public.match_tokens (token, user_id, mode, ep, diff, mt) values (v_tok, uid, v_mode,
    case when v_mode = 'scen' then least(greatest(coalesce(p_ep, 0), 0), 5) else 0 end, least(greatest(coalesce(p_diff, 1), 0), 3),
    left(regexp_replace(left(coalesce(p_match, ''), 64), '[^A-Za-z0-9]', '', 'g'), 24));
  return jsonb_build_object('token', v_tok);
end $$;
-- the shortest clear of each chapter × difficulty (easy, normal, hard, expert) the server counts, in seconds: about 0.7 of the fastest a
-- team of four bots cleared it that could not be hurt and hit three times as hard (v6.74: 3:16 – 6:00 a chapter, 3:53 – 8:29 on expert),
-- so no real team is faster (bots that could be hurt took twice as long and more)
create or replace function public.qz_ep_min(p_ep integer, p_diff integer) returns integer
language sql immutable set search_path = '' as $$
  select coalesce((array[[200, 200, 200, 270], [150, 150, 150, 160], [200, 200, 200, 210], [170, 170, 170, 270], [260, 260, 260, 350]]::integer[])[p_ep][p_diff + 1], 240)
$$;
-- v6.74: the most each achievement counter may take in a Korean day (qz_claim, qz_round_claim); the rest of a match's numbers is dropped
create or replace function public.qz_ach_day() returns jsonb
language sql immutable set search_path = '' as $$
  select '{"hs": 1000, "dmg": 2000000, "wins": 40, "mvp": 40, "pk": 1500, "pw": 40, "rw": 15, "kn": 300, "cu": 100, "mk": 1000, "cr": 40, "bm": 80, "surv": 200, "zw": 200}'::jsonb
$$;
-- what a match or a round may add: each of add's numbers cut to what is left of its day's limit (lim) after today's so far (used)
create or replace function public.qz_ach_left(used jsonb, add jsonb, lim jsonb) returns jsonb
language sql immutable set search_path = '' as $$
  select coalesce(jsonb_object_agg(e.k, case when coalesce(lim, '{}'::jsonb) ? e.k
      then least(public.qz_big(e.v), greatest(public.qz_big(lim ->> e.k) - public.qz_big(coalesce(used, '{}'::jsonb) ->> e.k), 0)) else public.qz_big(e.v) end), '{}'::jsonb)
  from jsonb_each_text(coalesce(add, '{}'::jsonb)) as e(k, v) where public.qz_big(e.v) > 0
$$;

-- the coins for a finished match: worked out here from the match's numbers, every one of them capped. The same numbers
-- (clamped the same way) move today's daily missions on (v6.12: p_hs = the player's headshot kills, at most p_kills).
-- v6.17: about a quarter more than before, on top of the round rewards (qz_round_claim); the day's limit (20,000) is shared with them.
-- v6.20: an episode of the zombie scenario (p_ep 1..5) pays by zones reached, the clear and the escape, times the difficulty (p_diff),
-- and goes on ep_records (p_time = the clear time in seconds, p_lives = lives lost, p_bonus = escaped in time); the first clear of
-- each difficulty adds coins (outside the day's limit) and, from normal up, a 근하신년 decoder.
-- v6.24: p_match = the match's id (the same on every page of it): the first clear of an episode × difficulty starts its hall-of-fame
-- row, and the other accounts of that match join it (ep_hof in the answer = this account just did)
-- v6.57: the achievements' counters (profiles.ach) take this match's numbers, clamped like the rest; p_ach = what only the game counts
-- ({kn melee kills, cu Q7 cures, mk Bloodhound marks, cr supply crates, pl / df bombs planted / defused}); ach_hit in the answer =
-- the tiers this match reached, ach_ready = every tier waiting to be claimed
-- v6.74: p_token = the match's ticket (qz_match_start). The numbers count for the minutes the match took by it (never more than since the
-- last paid match); a claim without one stands for 10 minutes at most. A chapter's clear needs it — no longer than the match took, no
-- shorter than qz_ep_min —, the hall of fame takes the ticket's match id, and a win or an MVP counts for a match of 3 minutes or more. The
-- day's ranking limits are gacha_config.rank_day_*; the achievement counters are cut to the match's minutes and the day's limits (cap_ach)
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean);
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer);   -- v6.11, before p_hs
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer);   -- v6.12, before the episodes
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer, integer, integer, integer, integer, boolean);   -- v6.20, before p_match
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer, integer, integer, integer, integer, boolean, text);   -- v6.24, before p_ach
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer, integer, integer, integer, integer, boolean, text, jsonb);   -- v6.57, before p_token
create or replace function public.qz_claim(p_mode text, p_rounds integer, p_kills integer, p_infects integer, p_damage integer,
  p_won boolean, p_mvp boolean, p_stage integer, p_cleared boolean, p_score integer default 0, p_hs integer default 0,
  p_ep integer default 0, p_diff integer default 1, p_time integer default 0, p_lives integer default 0, p_bonus boolean default false,
  p_match text default '', p_ach jsonb default null, p_token text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  cfg public.gacha_config;
  today date := (now() at time zone 'Asia/Seoul')::date;
  v_mode text := left(regexp_replace(left(coalesce(p_mode, ''), 64), '[^a-z]', '', 'g'), 12);
  v_s0 jsonb;
  v_hit jsonb;
  v_pvp boolean;
  v_zm boolean;
  mins numeric;
  raw integer;
  bonus integer := 0;
  day0 integer;
  got integer;
  k integer := least(greatest(coalesce(p_kills, 0), 0), case when coalesce(p_mode, '') = 'scen' then 400 else 80 end);   -- (v6.74: 400 in the scenario, a horde)
  inf integer := least(greatest(coalesce(p_infects, 0), 0), 30);
  sc integer := least(greatest(coalesce(p_score, 0), 0), 30000);
  gx integer;
  v_gain jsonb;
  v_mis jsonb;
  v_ep integer := 0;
  v_diff integer := least(greatest(coalesce(p_diff, 1), 0), 3);
  v_time integer := least(greatest(coalesce(p_time, 0), 0), 36000);
  v_lives integer := least(greatest(coalesce(p_lives, 0), 0), 3);
  v_clear boolean := false;
  v_had boolean := false;
  v_medal text;
  v_first integer := 0;
  v_tix integer := 0;
  v_secs numeric;
  v_match text;
  v_fr public.ep_firsts;
  v_hof boolean := false;
  v_scn boolean;
  v_w numeric;                     -- (v6.65) the minutes of play this match can stand for
  v_cap integer;
  c0x integer;
  c0k integer;
  c0i integer;
  v_cut jsonb := '{}'::jsonb;      -- what had to be cut: {what: [sent, kept]}
  v_tk public.match_tokens;        -- (v6.74) this match's ticket, ok when it is good for this claim; v_el = seconds since it started
  v_tok boolean := false;
  v_el numeric := 0;
  v_ach jsonb := case when jsonb_typeof(p_ach) = 'object' and char_length(p_ach::text) <= 400 then p_ach end;
  v_dmg integer;
  v_long boolean;
  v_ca jsonb;                      -- today's achievement counters so far
  v_add jsonb;
  v_dk integer;
  v_di integer;
  v_dx integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  cfg := (select g from public.gacha_config g where g.id = 1);
  v_pvp := v_mode in ('tdm', 'ffa', 'bomb', 'race');
  v_zm := v_mode in ('orig', 'mut');
  v_scn := v_mode = 'scen';
  if v_scn then v_ep := least(greatest(coalesce(p_ep, 0), 0), 5); end if;
  mins := extract(epoch from (now() - coalesce(p.last_claim, now() - interval '15 minutes'))) / 60.0;
  if mins < 1.5 then raise exception 'too_soon'; end if;
  -- v6.74: the ticket: this account's, used once, at most 3 hours old, for this mode (the scenario: this chapter and difficulty)
  v_tk := (select t from public.match_tokens t where t.token = left(coalesce(p_token, ''), 64) and t.user_id = uid);
  if v_tk.token is not null then
    update public.match_tokens set used_at = coalesce(used_at, now()) where token = v_tk.token;
    v_tok := v_tk.used_at is null and v_tk.started_at > now() - interval '3 hours' and v_tk.mode = v_mode
      and (not v_scn or (v_tk.ep = v_ep and v_tk.diff = v_diff));
    if v_tok then v_el := greatest(extract(epoch from (now() - v_tk.started_at)), 0); end if;
  end if;
  -- v6.65: what goes on the ranking grows no faster than play can. Per minute at most 8 kills (16 in the scenario), 4 infections and
  -- 150 score (250 in the scenario) + 300; per day (Korean time) at most gacha_config.rank_day_kills / _inf / _xp (v6.74; 2,000, 800 and
  -- 150,000 before). Numbers sent past that are cut, and the match is marked in coin_log (detail.cut) for the admin page's suspects.
  -- v6.74: the minutes are the match's own, from its ticket (never more than since the last paid match — since the account was made, the
  -- first time —, 45 at most, 60 for the scenario); without a ticket 10 at most
  v_w := least(greatest(extract(epoch from (now() - coalesce(p.last_claim, p.created_at, now() - interval '15 minutes'))) / 60.0, 0), case when v_scn then 60 else 45 end);
  v_w := least(v_w, case when v_tok then v_el / 60.0 else 10 end);
  v_long := v_w >= 3;
  -- (each one checked as sent, so a number past the claim's own limit above shows too: [sent, kept])
  v_cap := least(case when v_scn then 400 else 80 end, floor(v_w * case when v_scn then 16 else 8 end)::integer);
  if coalesce(p_kills, 0) > v_cap then v_cut := v_cut || jsonb_build_object('kills', jsonb_build_array(p_kills, v_cap)); k := least(k, v_cap); end if;
  v_cap := least(30, floor(v_w * 4)::integer);
  if coalesce(p_infects, 0) > v_cap then v_cut := v_cut || jsonb_build_object('infects', jsonb_build_array(p_infects, v_cap)); inf := least(inf, v_cap); end if;
  v_cap := least(30000, floor(v_w * case when v_scn then 250 else 150 end)::integer + 300);
  if coalesce(p_score, 0) > v_cap then v_cut := v_cut || jsonb_build_object('score', jsonb_build_array(p_score, v_cap)); sc := least(sc, v_cap); end if;
  v_dmg := least(greatest(coalesce(p_damage, 0), 0), 60000, floor(v_w * 20000)::integer);
  c0x := case when p.cap_day = today then p.cap_xp else 0 end;
  c0k := case when p.cap_day = today then p.cap_kills else 0 end;
  c0i := case when p.cap_day = today then p.cap_inf else 0 end;
  v_ca := case when p.cap_day = today then coalesce(p.cap_ach, '{}'::jsonb) else '{}'::jsonb end;
  v_dk := greatest(coalesce(cfg.rank_day_kills, 2000), 0);
  v_di := greatest(coalesce(cfg.rank_day_inf, 800), 0);
  v_dx := greatest(coalesce(cfg.rank_day_xp, 150000), 0);
  if c0k + k > v_dk then v_cut := v_cut || jsonb_build_object('day_kills', jsonb_build_array(k, greatest(v_dk - c0k, 0))); k := greatest(v_dk - c0k, 0); end if;
  if c0i + inf > v_di then v_cut := v_cut || jsonb_build_object('day_infects', jsonb_build_array(inf, greatest(v_di - c0i, 0))); inf := greatest(v_di - c0i, 0); end if;
  v_s0 := public.qz_ach_stats(uid);   -- (v6.57: the numbers before this match, to tell the tiers it reaches)
  v_secs := extract(epoch from (now() - coalesce(p.last_claim, p.created_at, now() - interval '1 day')));   -- (an episode's clear time fits in it)
  -- an episode's clear counts when (v6.74) the match had its ticket, took no longer than the ticket's time (30 s to spare) and no shorter
  -- than the chapter's least (qz_ep_min; 4 minutes for all of them before), fits in the time since the last paid match, and (from episode 2
  -- on) the episode before it was cleared; only such a clear pays the clear and the escape
  if v_ep > 0 then
    v_clear := coalesce(p_cleared, false) and v_tok and v_time >= public.qz_ep_min(v_ep, v_diff) and v_time <= v_el + 30 and v_secs >= v_time * 0.9
      and (v_ep = 1 or exists (select 1 from public.ep_records r where r.user_id = uid and r.ep = v_ep - 1 and r.clears > 0));
    raw := round((100 + 150 * least(greatest(coalesce(p_stage, 0), 0), 4) + case when v_clear then 400 else 0 end
         + case when v_clear and p_bonus then 300 else 0 end + 5 * k) * (array[0.7, 1.0, 1.4, 2.0])[v_diff + 1])::integer;
    raw := least(raw, 3000, floor(mins * 150)::integer);
  elsif v_scn then
    raw := 100 + 50 * least(greatest(coalesce(p_stage, 0), 0), 5) + case when p_cleared then 200 else 0 end + 5 * k;
    raw := least(raw, 1200, floor(mins * 100)::integer);
  else
    raw := 100 + 15 * least(greatest(coalesce(p_rounds, 0), 0), 10) + 7 * least(k, 60)
         + 12 * least(greatest(coalesce(p_infects, 0), 0), 30)
         + 5 * (least(greatest(coalesce(p_damage, 0), 0), 60000) / 1000)
         + case when p_won then 130 else 0 end + case when p_mvp then 80 else 0 end;
    raw := least(raw, 1200, floor(mins * 100)::integer);
  end if;
  day0 := case when p.day = today then p.day_earned else 0 end;
  if p.bonus_day is distinct from today then bonus := 250; end if;
  got := greatest(0, least(raw + bonus, 20000 - day0));
  gx := least(4000, greatest(25, round(sc * 0.75 + k * 10 + inf * 15)::integer));  -- a quarter more than the xp the game showed before accounts
  if c0x + gx > v_dx then v_cut := v_cut || jsonb_build_object('day_xp', jsonb_build_array(gx, greatest(v_dx - c0x, 0))); gx := greatest(v_dx - c0x, 0); end if;
  update public.profiles set coins = coins + got, earned_total = earned_total + got, matches = matches + 1,
    last_claim = now(), day = today, day_earned = day0 + got, bonus_day = today,
    rec_games = rec_games + 1, rec_kills = rec_kills + k, rec_infects = rec_infects + inf, rec_best = greatest(rec_best, sc), xp = xp + gx,
    cap_day = today, cap_xp = c0x + gx, cap_kills = c0k + k, cap_inf = c0i + inf, cap_ach = v_ca,
    ny_quota = least(8, 2 + k / 6)   -- letters this match may add (qz_ny_add): a few, more with more kills
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  -- (v6.74: tok = the match came with its good ticket, w = the minutes it was counted for)
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, got, 'match', jsonb_build_object('mode', v_mode,
    'rounds', p_rounds, 'kills', p_kills, 'infects', p_infects, 'damage', p_damage, 'won', p_won, 'mvp', p_mvp,
    'stage', p_stage, 'cleared', p_cleared, 'score', p_score, 'hs', p_hs, 'raw', raw, 'bonus', bonus, 'xp', gx,
    'ep', v_ep, 'diff', v_diff, 'time', v_time, 'lives', v_lives, 'escaped', p_bonus, 'mins', round(mins, 1), 'tok', v_tok, 'w', round(v_w, 1))
    || case when v_cut = '{}'::jsonb then '{}'::jsonb else jsonb_build_object('cut', v_cut) end);
  -- an episode (v6.20): the play and the clear (v_clear, above) go on the record; medal S = no life lost within 16 minutes,
  -- A = at most one within 22, B = the rest (and every clear without the escape)
  if v_ep > 0 then
    v_medal := case when not v_clear then null when not coalesce(p_bonus, false) then 'B' when v_lives = 0 and v_time <= 960 then 'S'
      when v_lives <= 1 and v_time <= 1320 then 'A' else 'B' end;
    v_had := exists (select 1 from public.ep_records r where r.user_id = uid and r.ep = v_ep and r.diff = v_diff and r.clears > 0);
    insert into public.ep_records as r (user_id, ep, diff, plays, clears, best_time, best_medal, best_lives, first_at, last_at)
    values (uid, v_ep, v_diff, 1, case when v_clear then 1 else 0 end, case when v_clear then v_time end, v_medal,
      case when v_clear then v_lives end, case when v_clear then now() end, now())
    on conflict (user_id, ep, diff) do update set plays = r.plays + 1, last_at = now(),
      clears = r.clears + case when v_clear then 1 else 0 end,
      best_time = case when v_clear and (r.best_time is null or v_time < r.best_time) then v_time else r.best_time end,
      best_lives = case when v_clear and (r.best_lives is null or v_lives < r.best_lives) then v_lives else r.best_lives end,
      best_medal = case when v_clear and (case v_medal when 'S' then 3 when 'A' then 2 else 1 end)
        > (case r.best_medal when 'S' then 3 when 'A' then 2 when 'B' then 1 else 0 end) then v_medal else r.best_medal end,
      first_at = coalesce(r.first_at, case when v_clear then now() end);
    if v_clear and not v_had then
      v_first := (array[1000, 3000, 5000, 8000])[v_diff + 1];
      v_tix := case when v_diff >= 1 then 1 else 0 end;
      update public.profiles set coins = coins + v_first, earned_total = earned_total + v_first, dec_tickets = dec_tickets + v_tix where id = uid;
      insert into public.coin_log (user_id, delta, reason, detail) values (uid, v_first, 'ep_first',
        jsonb_build_object('ep', v_ep, 'diff', v_diff, 'time', v_time, 'lives', v_lives, 'tickets', v_tix));
      p := (select t from public.profiles t where t.id = uid);
    end if;
    -- the hall of fame (v6.24): the first accepted clear makes the row with its match id; the same match's accounts join within
    -- 15 minutes, 8 at most. v6.74: the match id is the one the ticket was given at the start (none: one of the account's own, so it
    -- joins nobody), a member's match started before the row was made, and the row is held while its team is counted
    if v_clear then
      v_match := coalesce(nullif(v_tk.mt, ''), 'u:' || uid::text);
      insert into public.ep_firsts (ep, diff, match_id, at, clear_time) values (v_ep, v_diff, v_match, now(), v_time)
      on conflict (ep, diff) do nothing;
      perform 1 from public.ep_firsts f where f.ep = v_ep and f.diff = v_diff for update;
      v_fr := (select f from public.ep_firsts f where f.ep = v_ep and f.diff = v_diff);
      if v_fr.match_id = v_match and v_fr.at > now() - interval '15 minutes' and v_tk.started_at <= v_fr.at + interval '1 minute'
         and (select count(*) from public.ep_first_members m where m.ep = v_ep and m.diff = v_diff) < 8 then
        insert into public.ep_first_members (ep, diff, user_id) values (v_ep, v_diff, uid) on conflict do nothing;
        v_hof := found;
      end if;
    end if;
  end if;
  -- daily missions (v6.12): what this match adds to each kind, clamped like the coins above
  perform public.qz_missions_make(uid, today);
  v_gain := jsonb_build_object('play', 1,
    'win', case when coalesce(p_won, false) or (v_scn and coalesce(p_cleared, false)) then 1 else 0 end,
    'kills', k, 'infects', inf, 'damage', v_dmg,
    'rounds', case when v_scn then least(greatest(coalesce(p_stage, 0), 0), 5) else least(greatest(coalesce(p_rounds, 0), 0), 10) end,
    'hs', least(greatest(coalesce(p_hs, 0), 0), k));
  v_mis := (select coalesce(jsonb_agg(jsonb_build_object('slot', m.slot, 'kind', m.kind, 'goal', m.goal, 'from', m.progress,
      'progress', least(m.goal, m.progress + coalesce((v_gain ->> m.kind)::integer, 0)), 'claimed', m.claimed_at is not null,
      'ko', m.ko, 'en', m.en) order by m.slot), '[]'::jsonb)
    from public.daily_missions m where m.user_id = uid and m.day = today);
  update public.daily_missions m set progress = least(m.goal, m.progress + coalesce((v_gain ->> m.kind)::integer, 0))
  where m.user_id = uid and m.day = today and m.progress < m.goal;
  -- achievements (v6.57): this match's counters (melee kills at most the kills), then the tiers it reached. v6.74: each also no more than the
  -- match's minutes allow (damage 20,000, cures 2, marks 15, crates 1 + ½, bombs 1 + 1 a minute), wins and MVPs from matches of 3 minutes
  -- or more, and all within the day's limits (qz_ach_day)
  v_add := public.qz_ach_left(v_ca, jsonb_build_object(
      'hs', least(greatest(coalesce(p_hs, 0), 0), k),
      'dmg', v_dmg,
      'wins', case when v_zm and coalesce(p_won, false) and v_long then 1 else 0 end,
      'mvp', case when coalesce(p_mvp, false) and v_long then 1 else 0 end,
      'pk', case when v_pvp then k else 0 end,
      'pw', case when v_pvp and coalesce(p_won, false) and v_long then 1 else 0 end,
      'rw', case when v_mode = 'race' and coalesce(p_won, false) and v_long then 1 else 0 end,
      'kn', least(greatest(public.qz_int(v_ach ->> 'kn'), 0), 40, k),
      'cu', least(greatest(public.qz_int(v_ach ->> 'cu'), 0), 20, floor(v_w * 2)::integer),
      'mk', least(greatest(public.qz_int(v_ach ->> 'mk'), 0), 200, floor(v_w * 15)::integer),
      'cr', least(greatest(public.qz_int(v_ach ->> 'cr'), 0), 10, 1 + floor(v_w / 2)::integer),
      'bm', least(least(greatest(public.qz_int(v_ach ->> 'pl'), 0), 12) + least(greatest(public.qz_int(v_ach ->> 'df'), 0), 12), 1 + floor(v_w)::integer)),
    public.qz_ach_day());
  update public.profiles set ach = public.qz_ach_add(ach, v_add), cap_ach = public.qz_ach_add(v_ca, v_add) where id = uid;
  v_hit := public.qz_ach_hits(uid, v_s0);
  return jsonb_build_object('got', got, 'coins', p.coins, 'bonus', bonus, 'raw', raw, 'day_left', 20000 - p.day_earned,
    'xp_got', gx, 'rec', public.qz_rec(p), 'missions', v_mis, 'tickets', p.dec_tickets,
    'ep_first', v_first, 'ep_tickets', v_tix, 'ep_clear', v_clear, 'ep_medal', v_medal, 'eps', case when v_ep > 0 then public.qz_eps(uid) end,
    'ep_hof', v_hof, 'firsts', case when v_ep > 0 then public.qz_firsts_of(uid) end,
    'ach_hit', v_hit, 'ach_ready', public.qz_ach_ready(uid), 'tok', v_tok);
end $$;

-- the coins and xp for one finished round (v6.17): a round of the infection modes pays about what a whole match paid before.
-- Worked out here from that round's own numbers (kills, infections and damage in it; won = the side the player ended the round on
-- won it; survived; mvp = the round's human or zombie MVP), each capped: at most 600 a round and 4 a second since the last round was
-- paid (never twice within 25 s); the day's limit is the one the match rewards use. The scenario and the range have no rounds.
-- v6.74: p_token = the match's ticket: the round counts no more minutes than the match has run (without one, 3 at most); a round lived
-- through or won as a zombie goes on the achievements within the day's limits (qz_ach_day)
drop function if exists public.qz_round_claim(text, integer, integer, integer, integer, boolean, boolean, boolean, integer, integer);   -- v6.17, before p_token
create or replace function public.qz_round_claim(p_mode text, p_round integer, p_kills integer, p_infects integer, p_damage integer,
  p_won boolean, p_survived boolean, p_mvp boolean, p_score integer default 0, p_hs integer default 0, p_token text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  cfg public.gacha_config;
  today date := (now() at time zone 'Asia/Seoul')::date;
  v_mode text := left(regexp_replace(left(coalesce(p_mode, ''), 64), '[^a-z]', '', 'g'), 12);
  secs numeric;
  raw integer;
  day0 integer;
  got integer;
  k integer := least(greatest(coalesce(p_kills, 0), 0), 30);
  inf integer := least(greatest(coalesce(p_infects, 0), 0), 12);
  dmg integer := least(greatest(coalesce(p_damage, 0), 0), 40000);
  sc integer := least(greatest(coalesce(p_score, 0), 0), 8000);
  gx integer;
  v_w numeric;
  v_cap integer;
  c0x integer;
  v_dx integer;
  v_cut jsonb := '{}'::jsonb;
  v_tk public.match_tokens;
  v_tok boolean := false;
  v_ca jsonb;
  v_add jsonb;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if v_mode in ('scen', 'range', '') then raise exception 'no_rounds'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  cfg := (select g from public.gacha_config g where g.id = 1);
  secs := extract(epoch from (now() - coalesce(p.last_round, now() - interval '10 minutes')));
  if secs < 25 then raise exception 'too_soon'; end if;
  -- (v6.74: the match's ticket — not used yet, or by the match's own claim just now; this mode)
  v_tk := (select t from public.match_tokens t where t.token = left(coalesce(p_token, ''), 64) and t.user_id = uid);
  v_tok := v_tk.token is not null and v_tk.mode = v_mode and v_tk.started_at > now() - interval '3 hours'
    and (v_tk.used_at is null or v_tk.used_at > now() - interval '2 minutes');
  -- v6.65: a round's numbers grow no faster than play either: per minute since the last paid round (counted up to 10) at most 12 kills + 3,
  -- 4 infections + 1 and 300 score + 100; the xp shares the day's limit with the matches (cut numbers are marked like the match's)
  v_w := least(secs, 600) / 60.0;
  v_w := least(v_w, case when v_tok then greatest(extract(epoch from (now() - v_tk.started_at)), 0) / 60.0 else 3 end);
  v_cap := least(30, floor(v_w * 12)::integer + 3);
  if coalesce(p_kills, 0) > v_cap then v_cut := v_cut || jsonb_build_object('kills', jsonb_build_array(p_kills, v_cap)); k := least(k, v_cap); end if;
  v_cap := least(12, floor(v_w * 4)::integer + 1);
  if coalesce(p_infects, 0) > v_cap then v_cut := v_cut || jsonb_build_object('infects', jsonb_build_array(p_infects, v_cap)); inf := least(inf, v_cap); end if;
  v_cap := least(8000, floor(v_w * 300)::integer + 100);
  if coalesce(p_score, 0) > v_cap then v_cut := v_cut || jsonb_build_object('score', jsonb_build_array(p_score, v_cap)); sc := least(sc, v_cap); end if;
  c0x := case when p.cap_day = today then p.cap_xp else 0 end;
  v_ca := case when p.cap_day = today then coalesce(p.cap_ach, '{}'::jsonb) else '{}'::jsonb end;
  v_dx := greatest(coalesce(cfg.rank_day_xp, 150000), 0);
  raw := 150 + 8 * k + 12 * inf + 5 * (dmg / 1000)
       + case when p_won then 120 else 0 end + case when p_survived then 60 else 0 end + case when p_mvp then 80 else 0 end;
  raw := least(raw, 600, floor(secs * 4)::integer);
  day0 := case when p.day = today then p.day_earned else 0 end;
  got := greatest(0, least(raw, 20000 - day0));
  gx := least(1500, greatest(10, round(sc * 0.6 + k * 8 + inf * 12)::integer));
  if c0x + gx > v_dx then v_cut := v_cut || jsonb_build_object('day_xp', jsonb_build_array(gx, greatest(v_dx - c0x, 0))); gx := greatest(v_dx - c0x, 0); end if;
  update public.profiles set coins = coins + got, earned_total = earned_total + got, last_round = now(), day = today,
    day_earned = day0 + got, xp = xp + gx,
    cap_xp = c0x + gx, cap_kills = case when cap_day = today then cap_kills else 0 end, cap_inf = case when cap_day = today then cap_inf else 0 end,
    cap_ach = v_ca, cap_day = today
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, got, 'round', jsonb_build_object('mode', v_mode,
    'round', p_round, 'kills', p_kills, 'infects', p_infects, 'damage', p_damage, 'won', p_won, 'survived', p_survived,
    'mvp', p_mvp, 'score', p_score, 'hs', p_hs, 'raw', raw, 'xp', gx, 'secs', round(secs), 'tok', v_tok)
    || case when v_cut = '{}'::jsonb then '{}'::jsonb else jsonb_build_object('cut', v_cut) end);
  -- achievements (v6.57): a round lived through as a human, or won as a zombie (Mutation, Original) — v6.74: within the day's limits
  if v_mode in ('orig', 'mut') then
    v_add := public.qz_ach_left(v_ca, jsonb_build_object('surv', case when coalesce(p_survived, false) then 1 else 0 end,
      'zw', case when coalesce(p_won, false) and not coalesce(p_survived, false) then 1 else 0 end), public.qz_ach_day());
    update public.profiles set ach = public.qz_ach_add(ach, v_add), cap_ach = public.qz_ach_add(v_ca, v_add) where id = uid;
  end if;
  return jsonb_build_object('got', got, 'coins', p.coins, 'raw', raw, 'xp_got', gx, 'day_left', 20000 - p.day_earned, 'rec', public.qz_rec(p));
end $$;

-- once per account: the record this browser kept before accounts (games, kills, ...) used to be added in here (v6.12).
-- v6.65: closed — any numbers could be sent, straight onto the ranking; the call now only marks the account as imported and adds nothing
create or replace function public.qz_import_rec(p_games integer, p_kills integer, p_infects integer, p_best integer, p_xp integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  update public.profiles set rec_imported = true where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  return jsonb_build_object('rec', public.qz_rec(p));
end $$;

-- ---------- ranking (v6.12) ----------
-- the top 50 of one record (level = xp, kills, infects, best = best score) and where the caller stands. Only nicknames and records
-- come out (never an id or an e-mail), so guests (anon) may ask too. Accounts that have not finished a match yet are left out.
create or replace function public.qz_rank_value(p public.profiles, k text) returns integer
language sql immutable set search_path = '' as $$
  select case k when 'kills' then p.rec_kills when 'infects' then p.rec_infects when 'best' then p.rec_best else p.xp end
$$;
create or replace function public.qz_ranking(p_kind text default 'level') returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  k text := case when p_kind in ('level', 'kills', 'infects', 'best') then p_kind else 'level' end;
  p public.profiles;
  v_top jsonb;
  v_me jsonb := null;
  v_val integer;
begin
  -- equal values share a rank (1, 2, 2, 4); within a tie the higher xp, then the older account, is listed first (v6.42: banned accounts are left out)
  -- (ft: the hall-of-fame title shown next to the name, v6.24; tt: the title worn, v6.57)
  v_top := (select coalesce(jsonb_agg(jsonb_build_object('rank', r.rk, 'nickname', r.nickname, 'value', r.v, 'xp', r.xp, 'games', r.rec_games,
      'me', coalesce(r.id = uid, false), 'ft', public.qz_first_best(r.id), 'tt', public.qz_title_worn(r.id)) order by r.n), '[]'::jsonb)
    from (select t.id, t.nickname, t.xp, t.rec_games, s.v, rank() over (order by s.v desc) as rk,
            row_number() over (order by s.v desc, t.xp desc, t.created_at, t.id) as n
          from public.profiles t cross join lateral (select public.qz_rank_value(t, k) as v) s
          where t.rec_games > 0 and (t.banned_until is null or t.banned_until <= now()) order by n limit 50) r);
  if uid is not null then
    p := (select t from public.profiles t where t.id = uid);
    if p.id is not null then
      v_val := public.qz_rank_value(p, k);
      v_me := jsonb_build_object('nickname', p.nickname, 'value', v_val, 'xp', p.xp, 'games', p.rec_games, 'ft', public.qz_first_best(p.id), 'tt', public.qz_title_worn(p.id),
        'rank', case when p.rec_games > 0 then 1 + (select count(*) from public.profiles t where t.rec_games > 0 and (t.banned_until is null or t.banned_until <= now()) and public.qz_rank_value(t, k) > v_val) end);
    end if;
  end if;
  return jsonb_build_object('kind', k, 'top', v_top, 'me', v_me, 'total', (select count(*) from public.profiles t where t.rec_games > 0 and (t.banned_until is null or t.banned_until <= now())));
end $$;

-- ---------- 근·하·신·년 letters (v6.15) ----------
-- the letters a player picked up in the match just finished (after qz_claim): at most ny_quota of them, then the quota is spent.
-- v6.71: and at most gacha_config.ny_day_cap of them a Korean day (Asia/Seoul) — short matches one after another no longer pile them up;
-- day_left / day_cap tell the game what is left of today's
create or replace function public.qz_ny_add(p_g integer, p_h integer, p_s integer, p_n integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  q integer;
  today date := (now() at time zone 'Asia/Seoul')::date;
  v_cap integer := greatest(coalesce((select c.ny_day_cap from public.gacha_config c where c.id = 1), 60), 0);
  v_used integer;
  g integer := least(greatest(coalesce(p_g, 0), 0), 8);
  h integer := least(greatest(coalesce(p_h, 0), 0), 8);
  s integer := least(greatest(coalesce(p_s, 0), 0), 8);
  n integer := least(greatest(coalesce(p_n, 0), 0), 8);
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  v_used := case when p.ny_day = today then greatest(p.ny_day_n, 0) else 0 end;
  q := least(greatest(p.ny_quota, 0), greatest(v_cap - v_used, 0));
  -- over the quota: keep the letters in the order 근 하 신 년 until it runs out
  g := least(g, q); q := q - g;
  h := least(h, q); q := q - h;
  s := least(s, q); q := q - s;
  n := least(n, q); q := q - n;
  update public.profiles set ny_g = ny_g + g, ny_h = ny_h + h, ny_s = ny_s + s, ny_n = ny_n + n, ny_quota = 0,
    ny_day = today, ny_day_n = v_used + g + h + s + n
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  return jsonb_build_object('added', jsonb_build_array(g, h, s, n), 'ny', jsonb_build_array(p.ny_g, p.ny_h, p.ny_s, p.ny_n),
    'day_left', greatest(v_cap - p.ny_day_n, 0), 'day_cap', v_cap);
end $$;
-- one full set (one of each letter) for p_choice: 'ny' = 2 근하신년 decoders, 'season' = 1 season decoder (kept, opened on the season tab)
create or replace function public.qz_ny_exchange(p_choice text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if p_choice is null or p_choice not in ('ny', 'season') then raise exception 'bad_choice'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.ny_g < 1 or p.ny_h < 1 or p.ny_s < 1 or p.ny_n < 1 then raise exception 'no_set'; end if;
  update public.profiles set ny_g = ny_g - 1, ny_h = ny_h - 1, ny_s = ny_s - 1, ny_n = ny_n - 1,
    dec_tickets = dec_tickets + case when p_choice = 'ny' then 2 else 0 end,
    season_tickets = season_tickets + case when p_choice = 'season' then 1 else 0 end
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, 'letters', case when p_choice = 'ny' then 'tickets' else 'season_ticket' end, null, null,
    case when p_choice = 'ny' then 2 else 1 end);
  return jsonb_build_object('ny', jsonb_build_array(p.ny_g, p.ny_h, p.ny_s, p.ny_n), 'tickets', p.dec_tickets, 'season_tickets', p.season_tickets);
end $$;

revoke all on function public.qz_rank_value(public.profiles, text) from public, anon, authenticated;
revoke all on function public.qz_ranking(text) from public;
grant execute on function public.qz_ranking(text) to anon, authenticated;
revoke all on function public.qz_firsts_of(uuid) from public, anon, authenticated;
revoke all on function public.qz_first_best(uuid) from public, anon, authenticated;
revoke all on function public.qz_ep_firsts() from public;
grant execute on function public.qz_ep_firsts() to anon, authenticated;

-- ---------- daily missions (v6.12) ----------
-- 3 missions per account per Korean day (Asia/Seoul): one easy (tier 1), one normal (2), one hard (3), each of a different kind, picked
-- from mission_pool by weight when the day's first qz_missions / qz_claim comes in. qz_claim moves them on with the match's numbers
-- (clamped exactly like its coins: kills 80, infects 30, damage 60,000, rounds 10 / stages 5, headshot kills at most the kills);
-- qz_mission_claim pays a finished one once. Mission coins are not counted in the 8,000 a day from matches.
-- kinds: play (finished matches), win (the humans won / the scenario cleared), kills, infects (as a zombie), damage, rounds, hs (headshot kills)
create table if not exists public.mission_pool (
  id      text primary key,
  tier    smallint not null check (tier between 1 and 3),
  kind    text not null check (kind in ('play', 'win', 'kills', 'infects', 'damage', 'rounds', 'hs')),
  goal    integer not null check (goal > 0),
  coins   integer not null default 0 check (coins between 0 and 5000),
  tickets integer not null default 0 check (tickets between 0 and 5),   -- 근하신년 decoders; paid only on the day's hard slot
  weight  integer not null default 1 check (weight >= 0),            -- how often it is picked (0: never)
  active  boolean not null default true,
  ko      text,   -- own wording; empty: the game writes it from kind + goal
  en      text
);
alter table public.mission_pool add column if not exists edited boolean not null default false;   -- v6.42: saved on the admin page (later runs leave it alone)
-- each player's missions of the day: a copy of the pool row (editing the pool changes the next day's, not today's)
create table if not exists public.daily_missions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  slot       smallint not null check (slot between 0 and 2),
  mission_id text not null,
  tier       smallint,
  kind       text not null,
  goal       integer not null,
  coins      integer not null default 0,
  tickets    integer not null default 0,
  ko         text,
  en         text,
  progress   integer not null default 0,
  claimed_at timestamptz,
  primary key (user_id, day, slot)
);
alter table public.mission_pool   enable row level security;
alter table public.daily_missions enable row level security;
drop policy if exists "read mission pool" on public.mission_pool;
create policy "read mission pool" on public.mission_pool for select to anon, authenticated using (true);
drop policy if exists "read own missions" on public.daily_missions;
create policy "read own missions" on public.daily_missions for select to authenticated using ((select auth.uid()) = user_id);
-- v6.12.1: up to 5 decoders a mission (an older table still checks 0..1)
alter table public.mission_pool drop constraint if exists mission_pool_tickets_check;
alter table public.mission_pool add constraint mission_pool_tickets_check check (tickets between 0 and 5);
-- the pool (a row already there is left as it is: edit it in the Table Editor)
insert into public.mission_pool (id, tier, kind, goal, coins, tickets) values
  ('play1',    1, 'play',    1,      150, 0),
  ('kills20',  1, 'kills',   20,     150, 0),
  ('dmg20k',   1, 'damage',  20000,  150, 0),
  ('rounds5',  1, 'rounds',  5,      150, 0),
  ('hs3',      1, 'hs',      3,      200, 0),
  ('play3',    2, 'play',    3,      300, 0),
  ('win1',     2, 'win',     1,      300, 0),
  ('kills60',  2, 'kills',   60,     350, 0),
  ('inf3',     2, 'infects', 3,      350, 0),
  ('hs12',     2, 'hs',      12,     400, 0),
  ('dmg60k',   2, 'damage',  60000,  350, 0),
  ('win3',     3, 'win',     3,      500, 3),
  ('inf10',    3, 'infects', 10,     500, 1),
  ('hs30',     3, 'hs',      30,     500, 1),
  ('kills150', 3, 'kills',   150,    550, 0),
  ('dmg150k',  3, 'damage',  150000, 550, 0),
  ('play5',    3, 'play',    5,      600, 0)
on conflict (id) do nothing;
-- v6.12.1: 3 wins pays 3 decoders (also today's unclaimed copies), only while win3 still holds the shipped 1
update public.daily_missions set tickets = 3 where mission_id = 'win3' and tickets = 1 and claimed_at is null
  and exists (select 1 from public.mission_pool q where q.id = 'win3' and q.tickets = 1 and not q.edited);
update public.mission_pool set tickets = 3 where id = 'win3' and tickets = 1 and not edited;
-- today's 3 for one player, made once (rows older than a week are cleared then)
create or replace function public.qz_missions_make(uid uuid, d date) returns void
language plpgsql security definer set search_path = '' as $$
declare
  m public.mission_pool;
  v_kinds text[] := '{}';
  v_ids text[] := '{}';
begin
  if exists (select 1 from public.daily_missions x where x.user_id = uid and x.day = d) then return; end if;
  delete from public.daily_missions x where x.user_id = uid and x.day < d - 7;
  for s in 0..2 loop
    m := (select q from public.mission_pool q where q.active and q.weight > 0 and q.tier = s + 1 and not (q.kind = any(v_kinds))
          order by -ln(1.0 - random()) / q.weight limit 1);
    if m.id is null then
      m := (select q from public.mission_pool q where q.active and q.weight > 0 and not (q.id = any(v_ids)) and not (q.kind = any(v_kinds))
            order by -ln(1.0 - random()) / q.weight limit 1);
    end if;
    if m.id is null then
      m := (select q from public.mission_pool q where q.active and q.weight > 0 and not (q.id = any(v_ids)) order by random() limit 1);
    end if;
    if m.id is not null then
      v_kinds := v_kinds || m.kind;
      v_ids := v_ids || m.id;
      insert into public.daily_missions (user_id, day, slot, mission_id, tier, kind, goal, coins, tickets, ko, en)
      values (uid, d, s, m.id, m.tier, m.kind, m.goal, least(greatest(m.coins, 0), 5000),
        case when s = 2 then least(greatest(m.tickets, 0), 5) else 0 end, nullif(btrim(m.ko), ''), nullif(btrim(m.en), ''))
      on conflict do nothing;
    end if;
  end loop;
end $$;
-- the day's missions as the game reads them; resets_in = seconds to the next midnight in Korea
create or replace function public.qz_missions_json(uid uuid, d date) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('day', d,
    'resets_in', greatest(0, floor(extract(epoch from (((d + 1)::timestamp at time zone 'Asia/Seoul') - now())))::integer),
    'missions', coalesce((select jsonb_agg(jsonb_build_object('slot', m.slot, 'id', m.mission_id, 'tier', m.tier, 'kind', m.kind, 'goal', m.goal,
      'progress', m.progress, 'coins', m.coins, 'tickets', m.tickets, 'ko', m.ko, 'en', m.en, 'claimed', m.claimed_at is not null) order by m.slot)
      from public.daily_missions m where m.user_id = uid and m.day = d), '[]'::jsonb))
$$;
-- my missions today (made on the spot the first time each day)
create or replace function public.qz_missions() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  perform public.qz_missions_make(uid, today);
  return public.qz_missions_json(uid, today);
end $$;
-- the reward of a finished mission of today (slot 0..2), once
create or replace function public.qz_mission_claim(p_slot integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'Asia/Seoul')::date;
  m public.daily_missions;
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  m := (select x from public.daily_missions x where x.user_id = uid and x.day = today and x.slot = p_slot);
  if m.user_id is null then raise exception 'no_mission'; end if;
  if m.claimed_at is not null then raise exception 'already_claimed'; end if;
  if m.progress < m.goal then raise exception 'not_done'; end if;
  update public.daily_missions set claimed_at = now() where user_id = uid and day = today and slot = p_slot;
  update public.profiles set coins = coins + m.coins, earned_total = earned_total + m.coins, dec_tickets = dec_tickets + m.tickets where id = uid;
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, m.coins, 'mission',
    jsonb_build_object('mission', m.mission_id, 'kind', m.kind, 'goal', m.goal, 'tickets', m.tickets));
  p := (select t from public.profiles t where t.id = uid);
  return jsonb_build_object('got', m.coins, 'got_tickets', m.tickets, 'coins', p.coins, 'tickets', p.dec_tickets,
    'missions', public.qz_missions_json(uid, today));
end $$;
revoke all on function public.qz_missions_make(uuid, date) from public, anon, authenticated;
revoke all on function public.qz_missions_json(uuid, date) from public, anon, authenticated;
revoke all on function public.qz_missions() from public, anon;
revoke all on function public.qz_mission_claim(integer) from public, anon;
grant execute on function public.qz_missions() to authenticated;
grant execute on function public.qz_mission_claim(integer) to authenticated;

-- ---------- achievements and titles (v6.57) ----------
-- the player's achievements: every tier (defs, with the reward and the title), the numbers (stats), the tiers claimed, how many wait
-- (ready), the title worn (worn: as others see it; title: as set, null = automatic). The numbers move when a match or round is paid
-- (qz_claim, qz_round_claim); the record's own (kills, infections, matches, level, hours, guns, chapters) are read as they are.
create or replace function public.qz_achievements() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  return public.qz_ach_json(uid);
end $$;
-- the reward of one tier reached (p_id), or of every tier reached and not claimed yet (p_id null or ''), once each: coins (outside the
-- day's limit) and 근하신년 decoders; titles = the titles it gave
create or replace function public.qz_ach_claim(p_id text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  s jsonb;
  v_ids jsonb;
  v_coins integer;
  v_tix integer;
  v_titles jsonb;
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  s := public.qz_ach_stats(uid);
  v_ids := (select coalesce(jsonb_agg(d.id order by d.ord, d.tier), '[]'::jsonb) from public.ach_defs d where d.active
    and (coalesce(p_id, '') = '' or d.id = p_id) and public.qz_big(s ->> d.stat) >= d.goal
    and not exists (select 1 from public.ach_claims c where c.user_id = uid and c.ach_id = d.id));
  if jsonb_array_length(v_ids) = 0 then
    if coalesce(p_id, '') <> '' and exists (select 1 from public.ach_claims c where c.user_id = uid and c.ach_id = p_id) then raise exception 'already_claimed'; end if;
    raise exception 'not_done';
  end if;
  insert into public.ach_claims (user_id, ach_id) select uid, x.v from jsonb_array_elements_text(v_ids) as x(v) on conflict do nothing;
  v_coins := (select coalesce(sum(d.coins), 0) from public.ach_defs d where d.id in (select x.v from jsonb_array_elements_text(v_ids) as x(v)));
  v_tix := (select coalesce(sum(d.tickets), 0) from public.ach_defs d where d.id in (select x.v from jsonb_array_elements_text(v_ids) as x(v)));
  v_titles := (select coalesce(jsonb_agg(d.title order by d.ord, d.tier), '[]'::jsonb) from public.ach_defs d
    where d.title is not null and d.id in (select x.v from jsonb_array_elements_text(v_ids) as x(v)));
  update public.profiles set coins = coins + v_coins, earned_total = earned_total + v_coins, dec_tickets = dec_tickets + v_tix where id = uid;
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, v_coins, 'ach', jsonb_build_object('ids', v_ids, 'tickets', v_tix));
  p := (select t from public.profiles t where t.id = uid);
  return jsonb_build_object('got', v_coins, 'got_tickets', v_tix, 'ids', v_ids, 'titles', v_titles, 'coins', p.coins, 'tickets', p.dec_tickets,
    'ach', public.qz_ach_json(uid));
end $$;
-- the title to wear: an achievement title this account has, 'hof:<code>' of a first-clear team it is in, 'none' (nothing), or null /
-- '' (automatic) → {title (as set), worn (as everyone sees it)}
create or replace function public.qz_title_wear(p_title text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  w text := nullif(btrim(coalesce(p_title, '')), '');
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if w is not null and w <> 'none' then
    if w like 'hof:%' then
      if not exists (select 1 from public.ep_first_members m where m.user_id = uid and 'hof:' || (m.ep * 10 + m.diff) = w) then raise exception 'no_title'; end if;
    elsif not exists (select 1 from public.ach_claims c join public.ach_defs d on d.id = c.ach_id where c.user_id = uid and d.title = w) then
      raise exception 'no_title';
    end if;
  end if;
  update public.profiles set title = w where id = uid;
  if not found then raise exception 'no_profile'; end if;
  return jsonb_build_object('title', w, 'worn', public.qz_title_worn(uid));
end $$;
revoke all on function public.qz_achievements() from public, anon;
revoke all on function public.qz_ach_claim(text) from public, anon;
revoke all on function public.qz_title_wear(text) from public, anon;
grant execute on function public.qz_achievements() to authenticated;
grant execute on function public.qz_ach_claim(text) to authenticated;
grant execute on function public.qz_title_wear(text) to authenticated;

-- ---------- the 근하신년 decoder bingo ----------
drop function if exists public.qz_pull(integer, boolean);   -- the old lucky pouch
-- a new card: 25 different numbers from 0..bingo_hi, the 근하신년 guns shuffled onto the 12 lines
create or replace function public.qz_bingo_new(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  hi integer := greatest(coalesce((select c.bingo_hi from public.gacha_config c where c.id = 1), 49), 24);
  v_nums integer[];
  v_rw text[];
begin
  v_nums := (select array_agg(s.x) from (select x from generate_series(0, hi) x order by random() limit 25) s);
  v_rw := coalesce((select array_agg(g.gun_id order by random()) from public.gun_prices g where g.tier is not null), '{}');
  insert into public.bingo_boards (user_id, nums, marked, drawn, rewards, done, boards, updated_at)
  values (uid, v_nums, array_fill(false, array[25]), '{}', v_rw[1:12], array_fill(false, array[12]), 1, now())
  on conflict (user_id) do update set nums = excluded.nums, marked = excluded.marked, drawn = excluded.drawn, rewards = excluded.rewards,
    done = excluded.done, boards = public.bingo_boards.boards + 1, updated_at = now();
end $$;
-- the card as the game reads it
create or replace function public.qz_bingo_json(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('nums', b.nums, 'marked', b.marked, 'drawn', b.drawn, 'rewards', b.rewards, 'done', b.done, 'boards', b.boards,
    'shuffles_left', greatest(0, coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3)
      - (select case when p.shuffle_day = (now() at time zone 'Asia/Seoul')::date then p.shuffles else 0 end from public.profiles p where p.id = uid)))
  from public.bingo_boards b where b.user_id = uid
$$;
-- my card (a first one is made on the spot)
create or replace function public.qz_bingo() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.bingo_boards where user_id = uid;
  if not found then perform public.qz_bingo_new(uid); end if;
  return public.qz_bingo_json(uid);
end $$;
-- open one or ten decoders (or today's free one, or p_ticket: ones kept from the season card instead of coins). Each shows a number
-- nobody has drawn on this card yet; a number on the card is stamped, and every line it completes pays its gun (owned already: an S
-- line pays full_s_coins, an A line full_a_frags fragments). Every decoder also gives dec_frag_min..dec_frag_max fragments.
-- A full card (all 25 stamped) is replaced by a new one at once.
drop function if exists public.qz_decode(integer, boolean);   -- v6.10, before the tickets
create or replace function public.qz_decode(p_count integer, p_free boolean default false, p_ticket boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  n integer := coalesce(p_count, 1);
  v_src text := case when p_free then 'free' when p_ticket then 'ticket' else 'decode' end;
  v_cost integer := 0;
  hi integer;
  lines integer[] := array[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
                           [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
                           [0,6,12,18,24],[4,8,12,16,20]];
  v_nums integer[]; v_marked boolean[]; v_drawn integer[]; v_rw text[]; v_done boolean[];
  v_owned text[];
  v_res jsonb := '[]'::jsonb; v_new jsonb;
  v_num integer; v_pos integer; v_full boolean; v_gun text; v_tier text; v_kind text; v_amt integer; f integer;
  v_card integer := 0;
  coins_won integer := 0; frags_won integer := 0; tf integer; tfr_won integer := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if n not in (1, 10) then raise exception 'bad_count'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  if cfg.id is null then raise exception 'no_config'; end if;
  hi := greatest(cfg.bingo_hi, 24);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p_free and p_ticket then raise exception 'bad_count'; end if;
  if p_free then
    if n <> 1 or not cfg.daily_free then raise exception 'bad_count'; end if;
    if p.free_day = today then raise exception 'free_used'; end if;
  elsif p_ticket then
    if p.dec_tickets < n then raise exception 'not_enough_tickets'; end if;
  else
    v_cost := case when n = 10 then cfg.dec_cost10 else cfg.dec_cost1 end;
    if p.coins < v_cost then raise exception 'not_enough_coins'; end if;
  end if;
  perform 1 from public.bingo_boards where user_id = uid for update;
  if not found then perform public.qz_bingo_new(uid); end if;
  v_nums := (select b.nums from public.bingo_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.bingo_boards b where b.user_id = uid);
  v_drawn := (select b.drawn from public.bingo_boards b where b.user_id = uid);
  v_rw := (select b.rewards from public.bingo_boards b where b.user_id = uid);
  v_done := (select b.done from public.bingo_boards b where b.user_id = uid);
  v_owned := (select coalesce(array_agg(o.gun_id), '{}') from public.owned_guns o where o.user_id = uid);
  for i in 1..n loop
    v_num := (select x from generate_series(0, hi) x where not (x = any(v_drawn)) order by random() limit 1);
    v_drawn := v_drawn || v_num;
    v_pos := array_position(v_nums, v_num);
    v_new := '[]'::jsonb;
    if v_pos is not null then
      v_marked[v_pos] := true;
      for k in 1..12 loop
        if not v_done[k] then
          v_full := true;
          for j in 1..5 loop
            if not v_marked[lines[k][j] + 1] then v_full := false; exit; end if;
          end loop;
          if v_full then
            v_done[k] := true; v_gun := v_rw[k];
            v_tier := (select g.tier from public.gun_prices g where g.gun_id = v_gun);
            v_amt := 0;
            if v_gun is not null and not (v_gun = any(v_owned)) then
              v_kind := 'gun'; v_owned := v_owned || v_gun;
              insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, v_gun, 0);
            elsif v_tier = 'S' or v_gun is null then
              v_kind := 'coins'; v_amt := cfg.full_s_coins; coins_won := coins_won + v_amt;
            else
              v_kind := 'frags'; v_amt := cfg.full_a_frags; frags_won := frags_won + v_amt;
            end if;
            insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, v_src, v_kind, v_tier, v_gun, v_amt);
            v_new := v_new || jsonb_build_array(jsonb_build_object('line', k - 1, 'kind', v_kind, 'gun', v_gun, 'tier', v_tier, 'amount', v_amt));
          end if;
        end if;
      end loop;
    end if;
    f := cfg.dec_frag_min + floor(random() * (cfg.dec_frag_max - cfg.dec_frag_min + 1))::integer;
    frags_won := frags_won + f;
    tf := cfg.trans_frag_min + floor(random() * (greatest(cfg.trans_frag_max - cfg.trans_frag_min, 0) + 1))::integer;
    tfr_won := tfr_won + tf;
    v_res := v_res || jsonb_build_array(jsonb_build_object('n', v_num, 'cell', v_pos - 1, 'lines', v_new, 'frags', f, 'tfrags', tf, 'card', v_card));
    -- a full card makes way for a new one (the rest of a ten goes on the new card)
    if not (false = any(v_marked)) or array_length(v_drawn, 1) > hi then
      update public.bingo_boards set marked = v_marked, drawn = v_drawn, done = v_done where user_id = uid;
      perform public.qz_bingo_new(uid);
      v_card := v_card + 1;
      v_nums := (select b.nums from public.bingo_boards b where b.user_id = uid);
      v_marked := (select b.marked from public.bingo_boards b where b.user_id = uid);
      v_drawn := '{}'; v_rw := (select b.rewards from public.bingo_boards b where b.user_id = uid);
      v_done := (select b.done from public.bingo_boards b where b.user_id = uid);
    end if;
  end loop;
  update public.bingo_boards set marked = v_marked, drawn = v_drawn, done = v_done, updated_at = now() where user_id = uid;
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won, trans_frags = trans_frags + tfr_won,
    dec_tickets = dec_tickets - case when p_ticket then n else 0 end,
    free_day = case when p_free then today else free_day end where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  if v_cost > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'decoder', jsonb_build_object('count', n)); end if;
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'bingo_win'); end if;
  return jsonb_build_object('draws', v_res, 'card', public.qz_bingo_json(uid), 'coins', p.coins, 'fragments', p.fragments, 'tfrags', p.trans_frags, 'cost', v_cost,
    'tickets', p.dec_tickets, 'free_today', cfg.daily_free and p.free_day is distinct from today);
end $$;
-- a fresh card (what was stamped on this one is gone)
create or replace function public.qz_bingo_reset() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  perform public.qz_bingo_new(uid);
  return public.qz_bingo_json(uid);
end $$;
-- move the numbers not stamped yet to other unstamped cells (shuffle_free times a day)
create or replace function public.qz_bingo_shuffle() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  used integer;
  v_nums integer[]; v_marked boolean[]; v_idx integer[]; v_vals integer[];
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  used := case when p.shuffle_day = today then p.shuffles else 0 end;
  if used >= coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3) then raise exception 'no_shuffles'; end if;
  perform 1 from public.bingo_boards where user_id = uid for update;
  if not found then perform public.qz_bingo_new(uid); end if;
  v_nums := (select b.nums from public.bingo_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.bingo_boards b where b.user_id = uid);
  v_idx := (select array_agg(i) from generate_subscripts(v_marked, 1) i where not v_marked[i]);
  if v_idx is not null then
    v_vals := (select array_agg(v_nums[i] order by random()) from unnest(v_idx) i);
    for j in 1..array_length(v_idx, 1) loop v_nums[v_idx[j]] := v_vals[j]; end loop;
  end if;
  update public.bingo_boards set nums = v_nums, updated_at = now() where user_id = uid;
  update public.profiles set shuffle_day = today, shuffles = used + 1 where id = uid;
  return public.qz_bingo_json(uid);
end $$;

-- ---------- the season decoder bingo (Event Horizon, Skull-9) ----------
-- a new season card: 25 different numbers from 0..season_hi, the season_lines items shuffled onto the 12 lines
create or replace function public.qz_season_new(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  hi integer := greatest(coalesce((select c.season_hi from public.gacha_config c where c.id = 1), 99), 24);
  v_nums integer[];
  v_rw text[];
begin
  v_nums := (select array_agg(s.x) from (select x from generate_series(0, hi) x order by random() limit 25) s);
  v_rw := coalesce((select array_agg(l.it order by random()) from public.gacha_config c, unnest(c.season_lines) l(it) where c.id = 1), '{}');
  while coalesce(array_length(v_rw, 1), 0) < 12 loop
    v_rw := v_rw || 'coins:1000'::text;
  end loop;
  insert into public.season_boards (user_id, nums, marked, drawn, rewards, done, boards, updated_at)
  values (uid, v_nums, array_fill(false, array[25]), '{}', v_rw[1:12], array_fill(false, array[12]), 1, now())
  on conflict (user_id) do update set nums = excluded.nums, marked = excluded.marked, drawn = excluded.drawn, rewards = excluded.rewards,
    done = excluded.done, boards = public.season_boards.boards + 1, updated_at = now();
end $$;
-- the season card as the game reads it (its shuffles are counted apart from the 근하신년 card's)
create or replace function public.qz_season_json(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('nums', b.nums, 'marked', b.marked, 'drawn', b.drawn, 'rewards', b.rewards, 'done', b.done, 'boards', b.boards,
    'shuffles_left', greatest(0, coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3)
      - (select case when p.season_shuffle_day = (now() at time zone 'Asia/Seoul')::date then p.season_shuffles else 0 end from public.profiles p where p.id = uid)))
  from public.season_boards b where b.user_id = uid
$$;
-- my season card (a first one is made on the spot)
create or replace function public.qz_season() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.season_boards where user_id = uid;
  if not found then perform public.qz_season_new(uid); end if;
  return public.qz_season_json(uid);
end $$;
-- open one or ten season decoders (coins only, no free one): the same draw as qz_decode, on the season card. A finished line pays its
-- item: gun:<id> the gun (owned already: season_owned_coins coins), coins:<n>, frags:<n>, tickets:<n> (근하신년 decoders to open later).
-- Every season decoder also gives season_frag_min..season_frag_max fragments. A full card is replaced by a new one at once.
drop function if exists public.qz_season_decode(integer);   -- v6.11-6.14, before p_ticket
create or replace function public.qz_season_decode(p_count integer, p_ticket boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  n integer := coalesce(p_count, 1);
  v_cost integer;
  hi integer;
  lines integer[] := array[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
                           [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
                           [0,6,12,18,24],[4,8,12,16,20]];
  v_nums integer[]; v_marked boolean[]; v_drawn integer[]; v_rw text[]; v_done boolean[];
  v_owned text[];
  v_res jsonb := '[]'::jsonb; v_new jsonb;
  v_num integer; v_pos integer; v_full boolean; v_code text; v_kind text; v_arg text; v_gun text; v_amt integer; f integer;
  v_card integer := 0;
  coins_won integer := 0; frags_won integer := 0; tickets_won integer := 0; tf integer; tfr_won integer := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if n not in (1, 10) then raise exception 'bad_count'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  if cfg.id is null then raise exception 'no_config'; end if;
  hi := greatest(cfg.season_hi, 24);
  v_cost := case when coalesce(p_ticket, false) then 0 when n = 10 then cfg.season_cost10 else cfg.season_cost1 end;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.coins < v_cost then raise exception 'not_enough_coins'; end if;
  if coalesce(p_ticket, false) and p.season_tickets < n then raise exception 'no_tickets'; end if;
  perform 1 from public.season_boards where user_id = uid for update;
  if not found then perform public.qz_season_new(uid); end if;
  v_nums := (select b.nums from public.season_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.season_boards b where b.user_id = uid);
  v_drawn := (select b.drawn from public.season_boards b where b.user_id = uid);
  v_rw := (select b.rewards from public.season_boards b where b.user_id = uid);
  v_done := (select b.done from public.season_boards b where b.user_id = uid);
  v_owned := (select coalesce(array_agg(o.gun_id), '{}') from public.owned_guns o where o.user_id = uid);
  for i in 1..n loop
    v_num := (select x from generate_series(0, hi) x where not (x = any(v_drawn)) order by random() limit 1);
    v_drawn := v_drawn || v_num;
    v_pos := array_position(v_nums, v_num);
    v_new := '[]'::jsonb;
    if v_pos is not null then
      v_marked[v_pos] := true;
      for k in 1..12 loop
        if not v_done[k] then
          v_full := true;
          for j in 1..5 loop
            if not v_marked[lines[k][j] + 1] then v_full := false; exit; end if;
          end loop;
          if v_full then
            v_done[k] := true;
            v_code := coalesce(v_rw[k], '');
            v_kind := split_part(v_code, ':', 1);
            v_arg := split_part(v_code, ':', 2);
            v_amt := case when length(v_arg) between 1 and 7 and v_arg !~ '[^0-9]' then v_arg::integer else 0 end;
            v_gun := null;
            if v_kind = 'gun' then
              v_amt := 0;
              v_gun := (select g.gun_id from public.gun_prices g where g.gun_id = v_arg);
              if v_gun is not null and not (v_gun = any(v_owned)) then
                v_owned := v_owned || v_gun;
                insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, v_gun, 0);
              else
                v_kind := 'coins'; v_amt := cfg.season_owned_coins; coins_won := coins_won + v_amt;
              end if;
            elsif v_kind = 'frags' then
              frags_won := frags_won + v_amt;
            elsif v_kind = 'tickets' then
              tickets_won := tickets_won + v_amt;
            else
              v_kind := 'coins'; coins_won := coins_won + v_amt;
            end if;
            insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, 'season', v_kind, null, v_gun, v_amt);
            v_new := v_new || jsonb_build_array(jsonb_build_object('line', k - 1, 'kind', v_kind, 'gun', v_gun, 'amount', v_amt, 'item', v_code));
          end if;
        end if;
      end loop;
    end if;
    f := cfg.season_frag_min + floor(random() * (greatest(cfg.season_frag_max - cfg.season_frag_min, 0) + 1))::integer;
    frags_won := frags_won + f;
    tf := cfg.trans_frag_min + floor(random() * (greatest(cfg.trans_frag_max - cfg.trans_frag_min, 0) + 1))::integer;
    tfr_won := tfr_won + tf;
    v_res := v_res || jsonb_build_array(jsonb_build_object('n', v_num, 'cell', v_pos - 1, 'lines', v_new, 'frags', f, 'tfrags', tf, 'card', v_card));
    -- a full card makes way for a new one (the rest of a ten goes on the new card)
    if not (false = any(v_marked)) or array_length(v_drawn, 1) > hi then
      update public.season_boards set marked = v_marked, drawn = v_drawn, done = v_done where user_id = uid;
      perform public.qz_season_new(uid);
      v_card := v_card + 1;
      v_nums := (select b.nums from public.season_boards b where b.user_id = uid);
      v_marked := (select b.marked from public.season_boards b where b.user_id = uid);
      v_drawn := '{}'; v_rw := (select b.rewards from public.season_boards b where b.user_id = uid);
      v_done := (select b.done from public.season_boards b where b.user_id = uid);
    end if;
  end loop;
  update public.season_boards set marked = v_marked, drawn = v_drawn, done = v_done, updated_at = now() where user_id = uid;
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won, trans_frags = trans_frags + tfr_won, dec_tickets = dec_tickets + tickets_won,
    season_tickets = season_tickets - case when coalesce(p_ticket, false) then n else 0 end
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  if v_cost > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'season_decoder', jsonb_build_object('count', n)); end if;
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'season_win'); end if;
  return jsonb_build_object('draws', v_res, 'card', public.qz_season_json(uid), 'coins', p.coins, 'fragments', p.fragments, 'tfrags', p.trans_frags,
    'tickets', p.dec_tickets, 'season_tickets', p.season_tickets, 'cost', v_cost);
end $$;
-- a fresh season card (what was stamped on this one is gone)
create or replace function public.qz_season_reset() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  perform public.qz_season_new(uid);
  return public.qz_season_json(uid);
end $$;
-- move the season card's numbers not stamped yet to other unstamped cells (shuffle_free times a day, apart from the 근하신년 card's)
create or replace function public.qz_season_shuffle() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  used integer;
  v_nums integer[]; v_marked boolean[]; v_idx integer[]; v_vals integer[];
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  used := case when p.season_shuffle_day = today then p.season_shuffles else 0 end;
  if used >= coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3) then raise exception 'no_shuffles'; end if;
  perform 1 from public.season_boards where user_id = uid for update;
  if not found then perform public.qz_season_new(uid); end if;
  v_nums := (select b.nums from public.season_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.season_boards b where b.user_id = uid);
  v_idx := (select array_agg(i) from generate_subscripts(v_marked, 1) i where not v_marked[i]);
  if v_idx is not null then
    v_vals := (select array_agg(v_nums[i] order by random()) from unnest(v_idx) i);
    for j in 1..array_length(v_idx, 1) loop v_nums[v_idx[j]] := v_vals[j]; end loop;
  end if;
  update public.season_boards set nums = v_nums, updated_at = now() where user_id = uid;
  update public.profiles set season_shuffle_day = today, season_shuffles = used + 1 where id = uid;
  return public.qz_season_json(uid);
end $$;

-- ---------- the sidearm decoder bingo (v6.36: Event Horizon Mini, Crimson Peacemaker) ----------
-- a new sidearm card: 25 different numbers from 1..side_hi, the side_lines items shuffled onto the 12 lines
create or replace function public.qz_side_new(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  hi integer := greatest(coalesce((select c.side_hi from public.gacha_config c where c.id = 1), 80), 25);
  v_nums integer[];
  v_rw text[];
begin
  v_nums := (select array_agg(s.x) from (select x from generate_series(1, hi) x order by random() limit 25) s);
  v_rw := coalesce((select array_agg(l.it order by random()) from public.gacha_config c, unnest(c.side_lines) l(it) where c.id = 1), '{}');
  while coalesce(array_length(v_rw, 1), 0) < 12 loop
    v_rw := v_rw || 'coins:500'::text;
  end loop;
  insert into public.side_boards (user_id, nums, marked, drawn, rewards, done, boards, updated_at)
  values (uid, v_nums, array_fill(false, array[25]), '{}', v_rw[1:12], array_fill(false, array[12]), 1, now())
  on conflict (user_id) do update set nums = excluded.nums, marked = excluded.marked, drawn = excluded.drawn, rewards = excluded.rewards,
    done = excluded.done, boards = public.side_boards.boards + 1, updated_at = now();
end $$;
-- the sidearm card as the game reads it (its shuffles are counted apart from the other two cards')
create or replace function public.qz_side_json(uid uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('nums', b.nums, 'marked', b.marked, 'drawn', b.drawn, 'rewards', b.rewards, 'done', b.done, 'boards', b.boards,
    'shuffles_left', greatest(0, coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3)
      - (select case when p.side_shuffle_day = (now() at time zone 'Asia/Seoul')::date then p.side_shuffles else 0 end from public.profiles p where p.id = uid)))
  from public.side_boards b where b.user_id = uid
$$;
-- my sidearm card (a first one is made on the spot)
create or replace function public.qz_side() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.side_boards where user_id = uid;
  if not found then perform public.qz_side_new(uid); end if;
  return public.qz_side_json(uid);
end $$;
-- open one or ten sidearm decoders (coins only): the season card's draw on the sidearm card, numbers 1..side_hi. A finished line pays
-- its item: gun:<id> the gun (owned already: side_owned_coins coins), coins:<n>, frags:<n>, tickets:<n> (근하신년 decoders to open later).
-- Every sidearm decoder also gives side_frag_min..side_frag_max fragments. A full card is replaced by a new one at once.
create or replace function public.qz_side_decode(p_count integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  n integer := coalesce(p_count, 1);
  v_cost integer;
  hi integer;
  lines integer[] := array[[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
                           [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
                           [0,6,12,18,24],[4,8,12,16,20]];
  v_nums integer[]; v_marked boolean[]; v_drawn integer[]; v_rw text[]; v_done boolean[];
  v_owned text[];
  v_res jsonb := '[]'::jsonb; v_new jsonb;
  v_num integer; v_pos integer; v_full boolean; v_code text; v_kind text; v_arg text; v_gun text; v_amt integer; f integer;
  v_card integer := 0;
  coins_won integer := 0; frags_won integer := 0; tickets_won integer := 0; tf integer; tfr_won integer := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if n not in (1, 10) then raise exception 'bad_count'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  if cfg.id is null then raise exception 'no_config'; end if;
  hi := greatest(cfg.side_hi, 25);
  v_cost := case when n = 10 then cfg.side_cost10 else cfg.side_cost1 end;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.coins < v_cost then raise exception 'not_enough_coins'; end if;
  perform 1 from public.side_boards where user_id = uid for update;
  if not found then perform public.qz_side_new(uid); end if;
  v_nums := (select b.nums from public.side_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.side_boards b where b.user_id = uid);
  v_drawn := (select b.drawn from public.side_boards b where b.user_id = uid);
  v_rw := (select b.rewards from public.side_boards b where b.user_id = uid);
  v_done := (select b.done from public.side_boards b where b.user_id = uid);
  v_owned := (select coalesce(array_agg(o.gun_id), '{}') from public.owned_guns o where o.user_id = uid);
  for i in 1..n loop
    v_num := (select x from generate_series(1, hi) x where not (x = any(v_drawn)) order by random() limit 1);
    v_drawn := v_drawn || v_num;
    v_pos := array_position(v_nums, v_num);
    v_new := '[]'::jsonb;
    if v_pos is not null then
      v_marked[v_pos] := true;
      for k in 1..12 loop
        if not v_done[k] then
          v_full := true;
          for j in 1..5 loop
            if not v_marked[lines[k][j] + 1] then v_full := false; exit; end if;
          end loop;
          if v_full then
            v_done[k] := true;
            v_code := coalesce(v_rw[k], '');
            v_kind := split_part(v_code, ':', 1);
            v_arg := split_part(v_code, ':', 2);
            v_amt := case when length(v_arg) between 1 and 7 and v_arg !~ '[^0-9]' then v_arg::integer else 0 end;
            v_gun := null;
            if v_kind = 'gun' then
              v_amt := 0;
              v_gun := (select g.gun_id from public.gun_prices g where g.gun_id = v_arg);
              if v_gun is not null and not (v_gun = any(v_owned)) then
                v_owned := v_owned || v_gun;
                insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, v_gun, 0);
              else
                v_kind := 'coins'; v_amt := cfg.side_owned_coins; coins_won := coins_won + v_amt;
              end if;
            elsif v_kind = 'frags' then
              frags_won := frags_won + v_amt;
            elsif v_kind = 'tickets' then
              tickets_won := tickets_won + v_amt;
            else
              v_kind := 'coins'; coins_won := coins_won + v_amt;
            end if;
            insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, 'side', v_kind, null, v_gun, v_amt);
            v_new := v_new || jsonb_build_array(jsonb_build_object('line', k - 1, 'kind', v_kind, 'gun', v_gun, 'amount', v_amt, 'item', v_code));
          end if;
        end if;
      end loop;
    end if;
    f := cfg.side_frag_min + floor(random() * (greatest(cfg.side_frag_max - cfg.side_frag_min, 0) + 1))::integer;
    frags_won := frags_won + f;
    tf := cfg.trans_frag_min + floor(random() * (greatest(cfg.trans_frag_max - cfg.trans_frag_min, 0) + 1))::integer;
    tfr_won := tfr_won + tf;
    v_res := v_res || jsonb_build_array(jsonb_build_object('n', v_num, 'cell', v_pos - 1, 'lines', v_new, 'frags', f, 'tfrags', tf, 'card', v_card));
    -- a full card makes way for a new one (the rest of a ten goes on the new card)
    if not (false = any(v_marked)) or array_length(v_drawn, 1) >= hi then
      update public.side_boards set marked = v_marked, drawn = v_drawn, done = v_done where user_id = uid;
      perform public.qz_side_new(uid);
      v_card := v_card + 1;
      v_nums := (select b.nums from public.side_boards b where b.user_id = uid);
      v_marked := (select b.marked from public.side_boards b where b.user_id = uid);
      v_drawn := '{}'; v_rw := (select b.rewards from public.side_boards b where b.user_id = uid);
      v_done := (select b.done from public.side_boards b where b.user_id = uid);
    end if;
  end loop;
  update public.side_boards set marked = v_marked, drawn = v_drawn, done = v_done, updated_at = now() where user_id = uid;
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won, trans_frags = trans_frags + tfr_won, dec_tickets = dec_tickets + tickets_won
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  if v_cost > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'side_decoder', jsonb_build_object('count', n)); end if;
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'side_win'); end if;
  return jsonb_build_object('draws', v_res, 'card', public.qz_side_json(uid), 'coins', p.coins, 'fragments', p.fragments, 'tfrags', p.trans_frags,
    'tickets', p.dec_tickets, 'cost', v_cost);
end $$;
-- a fresh sidearm card (what was stamped on this one is gone)
create or replace function public.qz_side_reset() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  perform public.qz_side_new(uid);
  return public.qz_side_json(uid);
end $$;
-- move the sidearm card's numbers not stamped yet to other unstamped cells (shuffle_free times a day, apart from the other cards')
create or replace function public.qz_side_shuffle() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  used integer;
  v_nums integer[]; v_marked boolean[]; v_idx integer[]; v_vals integer[];
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  used := case when p.side_shuffle_day = today then p.side_shuffles else 0 end;
  if used >= coalesce((select c.shuffle_free from public.gacha_config c where c.id = 1), 3) then raise exception 'no_shuffles'; end if;
  perform 1 from public.side_boards where user_id = uid for update;
  if not found then perform public.qz_side_new(uid); end if;
  v_nums := (select b.nums from public.side_boards b where b.user_id = uid);
  v_marked := (select b.marked from public.side_boards b where b.user_id = uid);
  v_idx := (select array_agg(i) from generate_subscripts(v_marked, 1) i where not v_marked[i]);
  if v_idx is not null then
    v_vals := (select array_agg(v_nums[i] order by random()) from unnest(v_idx) i);
    for j in 1..array_length(v_idx, 1) loop v_nums[v_idx[j]] := v_vals[j]; end loop;
  end if;
  update public.side_boards set nums = v_nums, updated_at = now() where user_id = uid;
  update public.profiles set side_shuffle_day = today, side_shuffles = used + 1 where id = uid;
  return public.qz_side_json(uid);
end $$;

-- a pouch gun of your choice for fragments
create or replace function public.qz_exchange(p_gun text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  v_tier text;
  v_price integer;
  f integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  v_tier := (select gp.tier from public.gun_prices gp where gp.gun_id = p_gun);
  if v_tier is null then raise exception 'not_for_exchange'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  v_price := case when v_tier = 'S' then cfg.ex_s else cfg.ex_a end;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  f := (select t.fragments from public.profiles t where t.id = uid);
  if exists (select 1 from public.owned_guns where user_id = uid and gun_id = p_gun) then raise exception 'already_owned'; end if;
  if f < v_price then raise exception 'not_enough_frags'; end if;
  update public.profiles set fragments = fragments - v_price where id = uid;
  f := (select t.fragments from public.profiles t where t.id = uid);
  insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, p_gun, 0);
  insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, 'exchange', 'gun', v_tier, p_gun, -v_price);
  return jsonb_build_object('gun', p_gun, 'fragments', f);
end $$;

-- v6.41: a transcendence gun of your choice (one of trans_guns) for trans_cost transcendence fragments
create or replace function public.qz_trans_exchange(p_gun text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  f integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  cfg := (select g from public.gacha_config g where g.id = 1);
  if cfg.id is null then raise exception 'no_config'; end if;
  if p_gun is null or not (p_gun = any(cfg.trans_guns)) then raise exception 'not_for_exchange'; end if;
  if not exists (select 1 from public.gun_prices gp where gp.gun_id = p_gun) then raise exception 'not_for_exchange'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  if exists (select 1 from public.owned_guns where user_id = uid and gun_id = p_gun) then raise exception 'already_owned'; end if;
  f := (select t.trans_frags from public.profiles t where t.id = uid);
  if f < cfg.trans_cost then raise exception 'not_enough_tfrags'; end if;
  update public.profiles set trans_frags = trans_frags - cfg.trans_cost where id = uid;
  f := (select t.trans_frags from public.profiles t where t.id = uid);
  insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, p_gun, 0);
  insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount) values (uid, 'trans', 'gun', null, p_gun, -cfg.trans_cost);
  return jsonb_build_object('gun', p_gun, 'tfrags', f);
end $$;

-- ---------- who may call what ----------
revoke all on function public.qz_new_profile(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.qz_idhs(text, text, text) from public, anon, authenticated;
revoke all on function public.qz_on_signup() from public, anon, authenticated;
revoke all on function public.qz_auto_nick() from public, anon, authenticated;
revoke all on function public.qz_me() from public, anon;
revoke all on function public.qz_set_nickname(text) from public, anon;
revoke all on function public.qz_nick_free(text) from public;
revoke all on function public.qz_buy(text) from public, anon;
revoke all on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer, integer, integer, integer, integer, boolean, text, jsonb, text) from public, anon;
revoke all on function public.qz_round_claim(text, integer, integer, integer, integer, boolean, boolean, boolean, integer, integer, text) from public, anon;
revoke all on function public.qz_match_start(text, integer, integer, text) from public, anon;
revoke all on function public.qz_ep_min(integer, integer) from public, anon, authenticated;
revoke all on function public.qz_ach_day() from public, anon, authenticated;
revoke all on function public.qz_ach_left(jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function public.qz_bingo_new(uuid) from public, anon, authenticated;
revoke all on function public.qz_bingo_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_bingo() from public, anon;
revoke all on function public.qz_decode(integer, boolean, boolean) from public, anon;
revoke all on function public.qz_bingo_reset() from public, anon;
revoke all on function public.qz_bingo_shuffle() from public, anon;
revoke all on function public.qz_season_new(uuid) from public, anon, authenticated;
revoke all on function public.qz_season_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_season() from public, anon;
revoke all on function public.qz_season_decode(integer, boolean) from public, anon;
revoke all on function public.qz_ny_add(integer, integer, integer, integer) from public, anon;
revoke all on function public.qz_ny_exchange(text) from public, anon;
revoke all on function public.qz_season_reset() from public, anon;
revoke all on function public.qz_season_shuffle() from public, anon;
revoke all on function public.qz_side_new(uuid) from public, anon, authenticated;
revoke all on function public.qz_side_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_side() from public, anon;
revoke all on function public.qz_side_decode(integer) from public, anon;
revoke all on function public.qz_side_reset() from public, anon;
revoke all on function public.qz_side_shuffle() from public, anon;
revoke all on function public.qz_exchange(text) from public, anon;
revoke all on function public.qz_trans_exchange(text) from public, anon;
revoke all on function public.qz_import_rec(integer, integer, integer, integer, integer) from public, anon;
revoke all on function public.qz_rec(public.profiles) from public, anon, authenticated;
revoke all on function public.qz_eps(uuid) from public, anon, authenticated;
grant execute on function public.qz_me() to authenticated;
grant execute on function public.qz_set_nickname(text) to authenticated;
grant execute on function public.qz_nick_free(text) to anon, authenticated;
grant execute on function public.qz_buy(text) to authenticated;
grant execute on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer, integer, integer, integer, integer, integer, boolean, text, jsonb, text) to authenticated;
grant execute on function public.qz_round_claim(text, integer, integer, integer, integer, boolean, boolean, boolean, integer, integer, text) to authenticated;
grant execute on function public.qz_match_start(text, integer, integer, text) to authenticated;
grant execute on function public.qz_bingo() to authenticated;
grant execute on function public.qz_decode(integer, boolean, boolean) to authenticated;
grant execute on function public.qz_bingo_reset() to authenticated;
grant execute on function public.qz_bingo_shuffle() to authenticated;
grant execute on function public.qz_season() to authenticated;
grant execute on function public.qz_season_decode(integer, boolean) to authenticated;
grant execute on function public.qz_ny_add(integer, integer, integer, integer) to authenticated;
grant execute on function public.qz_ny_exchange(text) to authenticated;
grant execute on function public.qz_season_reset() to authenticated;
grant execute on function public.qz_season_shuffle() to authenticated;
grant execute on function public.qz_side() to authenticated;
grant execute on function public.qz_side_decode(integer) to authenticated;
grant execute on function public.qz_side_reset() to authenticated;
grant execute on function public.qz_side_shuffle() to authenticated;
grant execute on function public.qz_exchange(text) to authenticated;
grant execute on function public.qz_trans_exchange(text) to authenticated;
grant execute on function public.qz_import_rec(integer, integer, integer, integer, integer) to authenticated;

-- ---------- friends and gifts (v6.18) ----------
-- 친구: 플레이어마다 친구 코드(6자, 0 · O · 1 · I · L 없음)가 있고, 코드나 (한 명만 쓰는) 닉네임으로 친구 요청을 보냅니다.
-- friends 한 줄 = 한 쌍 (a = 요청한 쪽, b = 받은 쪽, 받은 쪽이 수락하면 accepted). 선물: 상점에서 파는 총을 친구에게 사 줍니다
-- (보낸 사람 코인으로, 받는 사람은 바로 보유). gifts 는 받은 쪽에 알림을 띄우려고 남깁니다. 테이블은 아래 함수로만.
alter table public.profiles add column if not exists fcode text;
create unique index if not exists profiles_fcode on public.profiles(fcode);
create table if not exists public.friends (
  a           uuid not null references auth.users(id) on delete cascade,
  b           uuid not null references auth.users(id) on delete cascade,
  accepted    boolean not null default false,
  at          timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (a, b),
  check (a <> b)
);
create unique index if not exists friends_pair on public.friends (least(a, b), greatest(a, b));
create index if not exists friends_b on public.friends (b);
create table if not exists public.gifts (
  id      bigint generated always as identity primary key,
  from_id uuid references auth.users(id) on delete set null,
  to_id   uuid not null references auth.users(id) on delete cascade,
  gun_id  text not null references public.gun_prices(gun_id),
  price   integer not null default 0,
  at      timestamptz not null default now(),
  seen    boolean not null default false
);
create index if not exists gifts_to on public.gifts(to_id, seen);
alter table public.friends enable row level security;
alter table public.gifts   enable row level security;

-- a friend code nobody has yet
create or replace function public.qz_fcode_new() returns text
language plpgsql volatile set search_path = '' as $$
declare
  abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  c text;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(abc, 1 + floor(random() * 31)::integer, 1); end loop;
    exit when not exists (select 1 from public.profiles t where t.fcode = c);
  end loop;
  return c;
end $$;
-- every player who has none gets one (re-running the file leaves the ones there alone)
do $$
declare r record;
begin
  for r in (select t.id from public.profiles t where t.fcode is null) loop
    update public.profiles set fcode = public.qz_fcode_new() where id = r.id;
  end loop;
end $$;
-- v6.74: one player per nickname, whatever the case (profiles_nick_lower). A name several accounts shared before keeps to the oldest of them;
-- the others become their first 9 characters + _ + their friend code (16 at most; they can pick another in 내 계정)
update public.profiles p set nickname = left(p.nickname, 9) || '_' || coalesce(p.fcode, left(replace(p.id::text, '-', ''), 6))
from (select t.id, row_number() over (partition by lower(t.nickname) order by t.created_at, t.id) as n from public.profiles t) q
where q.id = p.id and q.n > 1;
-- (one that meets yet another name that way: its own id's letters instead)
update public.profiles p set nickname = left(p.nickname, 6) || '_' || left(replace(p.id::text, '-', ''), 9)
from (select t.id, row_number() over (partition by lower(t.nickname) order by t.created_at, t.id) as n from public.profiles t) q
where q.id = p.id and q.n > 1;
create unique index if not exists profiles_nick_lower on public.profiles (lower(nickname));
-- v6.74: blocks: a = who blocked, b = whom. Between the two no friend requests, messages, room invites or gifts either way, and the friendship
-- and its requests and invites go when it is made. Read and written through qz_block / qz_unblock / qz_blocks only.
create table if not exists public.blocks (
  a  uuid not null references auth.users(id) on delete cascade,
  b  uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  primary key (a, b),
  check (a <> b)
);
create index if not exists blocks_b on public.blocks (b);
alter table public.blocks enable row level security;
revoke all on table public.blocks from public, anon, authenticated;
-- either of the two has blocked the other
create or replace function public.qz_blocked(x uuid, y uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks k where (k.a = x and k.b = y) or (k.a = y and k.b = x))
$$;
-- whom a request or a gift is for: a friend code (with or without #, any case), else a nickname only one player has
create or replace function public.qz_find_player(p_who text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare
  w text := btrim(coalesce(p_who, ''));
  c text := upper(regexp_replace(btrim(coalesce(p_who, '')), '[^A-Za-z0-9]', '', 'g'));
  r uuid;
  n integer;
begin
  if w = '' then raise exception 'not_found'; end if;
  if char_length(c) = 6 then
    r := (select t.id from public.profiles t where t.fcode = c);
    if r is not null then return r; end if;
  end if;
  n := (select count(*) from public.profiles t where lower(t.nickname) = lower(w));
  if n = 0 then raise exception 'not_found'; end if;
  if n > 1 then raise exception 'nick_many'; end if;
  r := (select t.id from public.profiles t where lower(t.nickname) = lower(w));
  return r;
end $$;

-- v6.25: messages between friends (the friend window's chat). Nobody reads or writes the table directly; qz_dm_send / qz_dm_list do.
create table if not exists public.friend_msgs (
  id      bigint generated always as identity primary key,
  from_id uuid not null references auth.users(id) on delete cascade,
  to_id   uuid not null references auth.users(id) on delete cascade,
  body    text not null check (char_length(body) between 1 and 200),
  at      timestamptz not null default now(),
  seen    boolean not null default false
);
create index if not exists friend_msgs_pair on public.friend_msgs (to_id, from_id, id);
create index if not exists friend_msgs_from on public.friend_msgs (from_id, at);
alter table public.friend_msgs enable row level security;
revoke all on public.friend_msgs from public, anon, authenticated;

-- the friend list as the game shows it: my code; friends (code, nickname, xp, the last time they played, since when); the requests
-- sent to me and by me; gifts not shown yet. Ids and e-mails never leave the database.
create or replace function public.qz_friends() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  me text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  me := (select t.fcode from public.profiles t where t.id = uid);
  if me is null then
    update public.profiles set fcode = public.qz_fcode_new() where id = uid;
    me := (select t.fcode from public.profiles t where t.id = uid);
  end if;
  -- (ft: the hall-of-fame title shown next to the name, v6.24; seen / dm: v6.25; tt: the title worn, v6.57)
  update public.profiles set last_seen = now() where id = uid and (last_seen is null or last_seen < now() - interval '20 seconds');
  return jsonb_build_object('code', me,
    'friends', coalesce((select jsonb_agg(jsonb_build_object('code', t.fcode, 'nickname', t.nickname, 'xp', t.xp,
        'last', greatest(t.last_seen, t.last_claim, t.last_round), 'seen', t.last_seen, 'since', f.accepted_at, 'ft', public.qz_first_best(t.id), 'tt', public.qz_title_worn(t.id),
        'dm', (select count(*) from public.friend_msgs m where m.to_id = uid and m.from_id = t.id and not m.seen))
        order by greatest(t.last_seen, t.last_claim, t.last_round) desc nulls last, t.nickname)
      from public.friends f join public.profiles t on t.id = case when f.a = uid then f.b else f.a end
      where (f.a = uid or f.b = uid) and f.accepted), '[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('code', t.fcode, 'nickname', t.nickname, 'xp', t.xp, 'at', f.at, 'ft', public.qz_first_best(t.id), 'tt', public.qz_title_worn(t.id)) order by f.at desc)
      from public.friends f join public.profiles t on t.id = f.a where f.b = uid and not f.accepted), '[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('code', t.fcode, 'nickname', t.nickname, 'xp', t.xp, 'at', f.at, 'ft', public.qz_first_best(t.id), 'tt', public.qz_title_worn(t.id)) order by f.at desc)
      from public.friends f join public.profiles t on t.id = f.b where f.a = uid and not f.accepted), '[]'::jsonb),
    'gifts_new', (select count(*) from public.gifts g where g.to_id = uid and not g.seen),
    'dm_new', (select count(*) from public.friend_msgs m where m.to_id = uid and not m.seen),
    'inv', (select count(*) from public.room_invites i where i.to_id = uid and i.at > now() - interval '3 minutes'),
    'blocked', (select count(*) from public.blocks k where k.a = uid));   -- (v6.74: how many I blocked)
end $$;

-- ask someone to be friends. If they had asked me already, this is a yes. At most 100 friends and requests, 30 requests waiting.
-- v6.74: not someone I blocked (you_blocked) or who blocked me (friend_blocked, the same answer as for anyone it cannot reach)
create or replace function public.qz_friend_add(p_who text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
  f public.friends;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  t := public.qz_find_player(p_who);
  if t = uid then raise exception 'friend_self'; end if;
  if exists (select 1 from public.blocks k where k.a = uid and k.b = t) then raise exception 'you_blocked'; end if;
  if exists (select 1 from public.blocks k where k.a = t and k.b = uid) then raise exception 'friend_blocked'; end if;
  f := (select x from public.friends x where (x.a = uid and x.b = t) or (x.a = t and x.b = uid));
  if f.a is not null then
    if f.accepted then raise exception 'friend_already'; end if;
    if f.a = uid then raise exception 'friend_pending'; end if;
    update public.friends set accepted = true, accepted_at = now() where a = t and b = uid;
    return public.qz_friends() || jsonb_build_object('done', 'accepted');
  end if;
  if (select count(*) from public.friends x where x.a = uid or x.b = uid) >= 100 then raise exception 'friend_full'; end if;
  if (select count(*) from public.friends x where x.a = uid and not x.accepted) >= 30 then raise exception 'friend_full'; end if;
  insert into public.friends (a, b) values (uid, t);
  return public.qz_friends() || jsonb_build_object('done', 'sent');
end $$;

-- yes or no to a request someone sent me (p_who = their code)
create or replace function public.qz_friend_answer(p_who text, p_yes boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  t := public.qz_find_player(p_who);
  if not exists (select 1 from public.friends x where x.a = t and x.b = uid and not x.accepted) then raise exception 'no_request'; end if;
  if coalesce(p_yes, false) then
    if (select count(*) from public.friends x where (x.a = uid or x.b = uid) and x.accepted) >= 100 then raise exception 'friend_full'; end if;
    update public.friends set accepted = true, accepted_at = now() where a = t and b = uid;
  else
    delete from public.friends where a = t and b = uid;
  end if;
  return public.qz_friends();
end $$;

-- no longer friends, or a request taken back (whichever side)
create or replace function public.qz_friend_remove(p_who text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  t := public.qz_find_player(p_who);
  delete from public.friends where (a = uid and b = t) or (a = t and b = uid);
  return public.qz_friends();
end $$;

-- v6.74: block someone (their friend code, or a nickname): the friendship, the requests either way and the room invites between the two
-- go, and from then on nothing reaches across (requests, messages, invites, gifts) — 500 blocks at most. Returns the friend list.
create or replace function public.qz_block(p_who text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  t := public.qz_find_player(p_who);
  if t = uid then raise exception 'friend_self'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not exists (select 1 from public.blocks k where k.a = uid and k.b = t) then
    if (select count(*) from public.blocks k where k.a = uid) >= 500 then raise exception 'block_full'; end if;
    insert into public.blocks (a, b) values (uid, t) on conflict do nothing;
  end if;
  delete from public.friends where (a = uid and b = t) or (a = t and b = uid);
  delete from public.room_invites where (from_id = uid and to_id = t) or (from_id = t and to_id = uid);
  return public.qz_friends();
end $$;
-- the players I blocked (newest first): their friend code and nickname, since when
create or replace function public.qz_blocks() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  return jsonb_build_object('blocked', coalesce((select jsonb_agg(jsonb_build_object('code', t.fcode, 'nickname', t.nickname, 'at', k.at) order by k.at desc)
    from public.blocks k join public.profiles t on t.id = k.b where k.a = uid), '[]'::jsonb));
end $$;
-- a block taken back (p_who = their code): the list that is left
create or replace function public.qz_unblock(p_who text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  t := public.qz_find_player(p_who);
  delete from public.blocks where a = uid and b = t;
  return public.qz_blocks();
end $$;

-- a gun from the shop bought for a friend: the giver pays the shop price, the friend owns it at once (and sees a note next time).
-- Only guns the shop sells; never to someone who has it already (nothing is charged then).
create or replace function public.qz_gift(p_who text, p_gun text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
  pr public.gun_prices;
  c integer;
  nick text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  t := public.qz_find_player(p_who);
  if t = uid then raise exception 'friend_self'; end if;
  if not exists (select 1 from public.friends x where ((x.a = uid and x.b = t) or (x.a = t and x.b = uid)) and x.accepted)
     or public.qz_blocked(uid, t) then raise exception 'not_friends'; end if;
  pr := (select g from public.gun_prices g where g.gun_id = p_gun);
  if pr.tier is not null then raise exception 'gacha_only'; end if;
  if pr.gun_id is null or not pr.sold then raise exception 'not_for_sale'; end if;
  if pr.free then raise exception 'friend_has_it'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  c := (select x.coins from public.profiles x where x.id = uid);
  if c < pr.price then raise exception 'not_enough_coins'; end if;
  insert into public.owned_guns (user_id, gun_id, price_paid) values (t, p_gun, pr.price) on conflict do nothing;
  if not found then raise exception 'friend_has_it'; end if;
  update public.profiles set coins = coins - pr.price where id = uid;
  c := (select x.coins from public.profiles x where x.id = uid);
  nick := (select x.nickname from public.profiles x where x.id = t);
  insert into public.gifts (from_id, to_id, gun_id, price) values (uid, t, p_gun, pr.price);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, -pr.price, 'gift', jsonb_build_object('gun', p_gun, 'to', nick));
  return jsonb_build_object('coins', c, 'gun', p_gun, 'to', nick);
end $$;

-- the gifts not shown yet (who sent which gun); they count as shown after this
create or replace function public.qz_gift_inbox() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  r jsonb;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  r := (select coalesce(jsonb_agg(jsonb_build_object('gun', g.gun_id, 'from', coalesce(t.nickname, '?'), 'at', g.at) order by g.at), '[]'::jsonb)
    from public.gifts g left join public.profiles t on t.id = g.from_id where g.to_id = uid and not g.seen);
  update public.gifts set seen = true where to_id = uid and not seen;
  return jsonb_build_object('gifts', r);
end $$;

-- v6.25 / v6.42: "I am here" - the game calls it when it opens and about once a minute while it is open and in view, and once more as
-- it goes out of view. p_play = the seconds of that spent in a match (the game counts them); p_fresh = the game just came into view
-- (or signed in): a new stretch starts, nothing is added. Otherwise the time since the last call from any tab of this player is play
-- time when it is at most 150 s (a longer gap: the game was closed, asleep or offline). Returns how many messages and invites wait.
drop function if exists public.qz_ping();
create or replace function public.qz_ping(p_play integer default 0, p_fresh boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  lb timestamptz;
  dt integer := 0;
  pl integer := 0;
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then return jsonb_build_object('dm_new', 0, 'inv', 0); end if;
  lb := (select t.last_beat from public.profiles t where t.id = uid);
  if lb is not null and not coalesce(p_fresh, false) then
    dt := floor(extract(epoch from (now() - lb)))::integer;
    if dt < 0 or dt > 150 then dt := 0; end if;
  end if;
  pl := least(greatest(coalesce(p_play, 0), 0), dt);
  update public.profiles set last_beat = now(), online_secs = online_secs + dt, play_secs = play_secs + pl,
    last_seen = case when last_seen is null or last_seen < now() - interval '20 seconds' then now() else last_seen end
  where id = uid;
  insert into public.daily_activity (day, user_id, online_secs, play_secs) values (today, uid, dt, pl)
  on conflict (day, user_id) do update set online_secs = public.daily_activity.online_secs + excluded.online_secs,
    play_secs = public.daily_activity.play_secs + excluded.play_secs, last_at = now();
  return jsonb_build_object('dm_new', (select count(*) from public.friend_msgs m where m.to_id = uid and not m.seen),
    'inv', (select count(*) from public.room_invites i where i.to_id = uid and i.at > now() - interval '3 minutes'),
    'mail', (select count(*) from public.qz_mail_open(uid)),
    'gun', (select count(*) from public.gun_notices g where g.user_id = uid and not g.seen),
    'inq', (select count(*) from public.inquiries q where q.user_id = uid and q.reply is not null and not q.seen));   -- (v6.66: answers not read yet)
end $$;

-- a message to a friend (p_who = their code). Friends only; 1..200 characters; at most 20 a minute and 300 an hour; each pair keeps its newest 100.
create or replace function public.qz_dm_send(p_who text, p_text text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
  b text := btrim(regexp_replace(left(coalesce(p_text, ''), 800), '[[:cntrl:]]', ' ', 'g'));   -- (v6.71: cut before the work; over 200 is refused anyway)
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if char_length(b) < 1 or char_length(b) > 200 then raise exception 'dm_text'; end if;
  t := public.qz_find_player(p_who);
  if not exists (select 1 from public.friends x where x.accepted and ((x.a = uid and x.b = t) or (x.a = t and x.b = uid)))
     or public.qz_blocked(uid, t) then raise exception 'dm_not_friend'; end if;
  if (select count(*) from public.friend_msgs m where m.from_id = uid and m.at > now() - interval '1 minute') >= 20 then raise exception 'dm_slow'; end if;
  if (select count(*) from public.friend_msgs m where m.from_id = uid and m.at > now() - interval '1 hour') >= 300 then raise exception 'dm_slow'; end if;
  insert into public.friend_msgs (from_id, to_id, body) values (uid, t, b);
  delete from public.friend_msgs m where m.id in (select z.id from public.friend_msgs z
    where (z.from_id = uid and z.to_id = t) or (z.from_id = t and z.to_id = uid) order by z.id desc offset 100);
  update public.profiles set last_seen = now() where id = uid and (last_seen is null or last_seen < now() - interval '20 seconds');
  return jsonb_build_object('ok', true);
end $$;

-- the talk with a friend: the newest 60 messages (oldest first), mine = I wrote it. What they wrote to me is marked read. p_after = only newer ids.
create or replace function public.qz_dm_list(p_who text, p_after bigint default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
  r jsonb;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  t := public.qz_find_player(p_who);
  if not exists (select 1 from public.friends x where x.accepted and ((x.a = uid and x.b = t) or (x.a = t and x.b = uid))) then raise exception 'dm_not_friend'; end if;
  update public.friend_msgs set seen = true where to_id = uid and from_id = t and not seen;
  update public.profiles set last_seen = now() where id = uid and (last_seen is null or last_seen < now() - interval '20 seconds');
  r := (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'mine', q.from_id = uid, 'text', q.body, 'at', q.at) order by q.id), '[]'::jsonb)
    from (select m.* from public.friend_msgs m
      where ((m.from_id = uid and m.to_id = t) or (m.from_id = t and m.to_id = uid)) and m.id > coalesce(p_after, 0)
      order by m.id desc limit 60) q);
  return jsonb_build_object('msgs', r,
    'seen', (select u.last_seen from public.profiles u where u.id = t),
    'dm_new', (select count(*) from public.friend_msgs m where m.to_id = uid and not m.seen));
end $$;

revoke all on function public.qz_fcode_new() from public, anon, authenticated;
revoke all on function public.qz_find_player(text) from public, anon, authenticated;
revoke all on function public.qz_friends() from public, anon;
revoke all on function public.qz_friend_add(text) from public, anon;
revoke all on function public.qz_friend_answer(text, boolean) from public, anon;
revoke all on function public.qz_friend_remove(text) from public, anon;
revoke all on function public.qz_gift(text, text) from public, anon;
revoke all on function public.qz_gift_inbox() from public, anon;
revoke all on function public.qz_ping(integer, boolean) from public, anon;
revoke all on function public.qz_dm_send(text, text) from public, anon;
revoke all on function public.qz_dm_list(text, bigint) from public, anon;
revoke all on function public.qz_blocked(uuid, uuid) from public, anon, authenticated;
revoke all on function public.qz_block(text) from public, anon;
revoke all on function public.qz_blocks() from public, anon;
revoke all on function public.qz_unblock(text) from public, anon;
grant execute on function public.qz_block(text) to authenticated;
grant execute on function public.qz_blocks() to authenticated;
grant execute on function public.qz_unblock(text) to authenticated;
grant execute on function public.qz_friends() to authenticated;
grant execute on function public.qz_friend_add(text) to authenticated;
grant execute on function public.qz_friend_answer(text, boolean) to authenticated;
grant execute on function public.qz_friend_remove(text) to authenticated;
grant execute on function public.qz_gift(text, text) to authenticated;
grant execute on function public.qz_gift_inbox() to authenticated;
grant execute on function public.qz_ping(integer, boolean) to authenticated;
grant execute on function public.qz_dm_send(text, text) to authenticated;
grant execute on function public.qz_dm_list(text, bigint) to authenticated;

-- ---------- public rooms (v6.12) ----------
-- 공개 방 목록: 로그인한 방장이 자기 방(PeerJS 방 코드)을 올리고 ~10초마다 갱신합니다. 30초 동안 갱신이 없으면 목록에서 빠지고,
-- 45초가 지나면 지워져서 그 코드를 다른 방장이 쓸 수 있습니다. 방장 한 명당 방 하나. 테이블은 직접 읽고 쓸 수 없고 아래 함수로만.
create table if not exists public.rooms (
  code        text primary key check (code ~ '^[A-Z0-9]{4}$'),
  host        uuid not null references auth.users(id) on delete cascade,
  host_name   text not null default '생존자',
  map         text not null default '',
  mode        text not null default 'mut',
  players     integer not null default 1 check (players between 0 and 20),
  max_players integer not null default 8 check (max_players between 1 and 20),
  status      text not null default 'lobby' check (status in ('lobby', 'playing')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists rooms_host on public.rooms(host);
create index if not exists rooms_updated on public.rooms(updated_at);
alter table public.rooms enable row level security;
revoke all on table public.rooms from anon, authenticated;
-- publish / refresh the room this player hosts. A code held by another host (refreshed in the last 45 s) is refused (room_taken).
-- Refreshes count at most once a second, and once every 5 s when nothing changed (those return skipped = true).
create or replace function public.qz_room_up(p_code text, p_name text, p_map text, p_mode text, p_players integer, p_max integer, p_status text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_code text := upper(left(coalesce(p_code, ''), 8));
  v_name text := public.qz_clean_nick(left(coalesce(p_name, ''), 64));
  v_map text := left(regexp_replace(left(coalesce(p_map, ''), 64), '[^A-Za-z0-9_-]', '', 'g'), 16);
  v_mode text := left(regexp_replace(left(coalesce(p_mode, ''), 64), '[^a-z]', '', 'g'), 8);
  v_max integer := least(greatest(coalesce(p_max, 8), 1), 20);
  v_players integer := least(greatest(coalesce(p_players, 1), 0), 20);
  v_status text := case when p_status = 'playing' then 'playing' else 'lobby' end;
  r public.rooms;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if exists (select 1 from public.room_blocks b where b.host = uid and b.until > now()) then raise exception 'room_closed'; end if;   -- (v6.43)
  if v_code !~ '^[A-Z0-9]{4}$' then raise exception 'bad_code'; end if;
  if v_mode = '' then v_mode := 'mut'; end if;
  v_players := least(v_players, v_max);
  delete from public.rooms where updated_at < now() - interval '45 seconds';
  r := (select t from public.rooms t where t.code = v_code);
  if r.code is not null and r.host <> uid then raise exception 'room_taken'; end if;
  if r.code is not null and (r.updated_at > now() - interval '1 second' or (r.updated_at > now() - interval '5 seconds'
      and r.host_name = v_name and r.map = v_map and r.mode = v_mode and r.players = v_players and r.max_players = v_max and r.status = v_status)) then
    return jsonb_build_object('ok', true, 'code', v_code, 'skipped', true);
  end if;
  if r.code is null then
    -- a new code: not more often than every 3 s per host (the old room goes), and at most 500 rooms open at once
    if exists (select 1 from public.rooms t where t.host = uid and t.updated_at > now() - interval '3 seconds') then raise exception 'too_soon'; end if;
    delete from public.rooms where host = uid;
    if (select count(*) from public.rooms) >= 500 then raise exception 'too_many_rooms'; end if;
  end if;
  insert into public.rooms (code, host, host_name, map, mode, players, max_players, status, created_at, updated_at)
  values (v_code, uid, v_name, v_map, v_mode, v_players, v_max, v_status, now(), now())
  on conflict (code) do update set host_name = excluded.host_name, map = excluded.map, mode = excluded.mode, players = excluded.players,
    max_players = excluded.max_players, status = excluded.status, updated_at = now()
  where public.rooms.host = excluded.host;
  if not found then raise exception 'room_taken'; end if;
  return jsonb_build_object('ok', true, 'code', v_code);
end $$;
-- take my room off the list (the host left or closed it)
create or replace function public.qz_room_down(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from public.rooms where host = uid and code = upper(left(coalesce(p_code, ''), 8));
  return jsonb_build_object('ok', true, 'gone', found);
end $$;
-- the list: rooms refreshed in the last 30 s, newest room first, 50 at most (no host ids). Anyone may read it, signed in or not.
create or replace function public.qz_rooms() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  begin
    delete from public.rooms where updated_at < now() - interval '45 seconds';
  exception when read_only_sql_transaction then null;
  end;
  return coalesce((select jsonb_agg(jsonb_build_object('code', s.code, 'host_name', s.host_name, 'map', s.map, 'mode', s.mode,
      'players', s.players, 'max_players', s.max_players, 'status', s.status) order by s.created_at desc)
    from (select t.* from public.rooms t where t.updated_at > now() - interval '30 seconds' order by t.created_at desc limit 50) s), '[]'::jsonb);
end $$;
revoke all on function public.qz_room_up(text, text, text, text, integer, integer, text) from public, anon;
revoke all on function public.qz_room_down(text) from public, anon;
revoke all on function public.qz_rooms() from public;
grant execute on function public.qz_room_up(text, text, text, text, integer, integer, text) to authenticated;
grant execute on function public.qz_room_down(text) to authenticated;
grant execute on function public.qz_rooms() to anon, authenticated;

-- ---------- invites (v6.37) ----------
-- Room invites: someone in a PeerJS room invites a friend (by friend code); the friend's game shows it while it is in the lobby (it asks
-- qz_invites every few seconds only while a friend of theirs is online, and qz_ping / qz_friends carry the count) and joins with the
-- code. 15 invites a minute at most, the same friend again after 10 seconds.
create or replace function public.qz_invite(p_who text, p_code text, p_map text default '', p_mode text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  t uuid;
  v_code text := upper(left(coalesce(p_code, ''), 8));
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  if v_code !~ '^[A-Z0-9]{4}$' then raise exception 'bad_code'; end if;
  t := public.qz_find_player(p_who);
  if t = uid then raise exception 'friend_self'; end if;
  if not exists (select 1 from public.friends x where ((x.a = uid and x.b = t) or (x.a = t and x.b = uid)) and x.accepted)
     or public.qz_blocked(uid, t) then raise exception 'inv_friends'; end if;
  delete from public.room_invites where from_id = uid and at < now() - interval '10 minutes';
  if exists (select 1 from public.room_invites i where i.from_id = uid and i.to_id = t and i.code = v_code and i.at > now() - interval '10 seconds') then raise exception 'inv_wait'; end if;
  if (select count(*) from public.room_invites i where i.from_id = uid and i.at > now() - interval '1 minute') >= 15 then raise exception 'inv_many'; end if;
  insert into public.room_invites (from_id, to_id, code, map, mode, at) values (uid, t, v_code,
    left(regexp_replace(left(coalesce(p_map, ''), 64), '[^A-Za-z0-9_-]', '', 'g'), 24), left(regexp_replace(left(coalesce(p_mode, ''), 64), '[^a-z]', '', 'g'), 12), now())
  on conflict (from_id, to_id) do update set code = excluded.code, map = excluded.map, mode = excluded.mode, at = now();
  return jsonb_build_object('ok', true, 'to', (select x.nickname from public.profiles x where x.id = t));
end $$;
-- the room invites waiting for me (the last 3 minutes, newest first): who (nickname, friend code, title), the room code, its map and mode
create or replace function public.qz_invites() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('code', i.code, 'map', i.map, 'mode', i.mode, 'at', i.at,
      'from', t.nickname, 'fc', t.fcode, 'ft', public.qz_first_best(t.id), 'tt', public.qz_title_worn(t.id)) order by i.at desc)
    from public.room_invites i join public.profiles t on t.id = i.from_id
    where i.to_id = uid and i.at > now() - interval '3 minutes'), '[]'::jsonb);
end $$;
-- an invite answered (joined or declined): it is gone; the ones still waiting come back
create or replace function public.qz_invite_answer(p_fc text, p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from public.room_invites i using public.profiles t
  where i.to_id = uid and t.id = i.from_id and t.fcode = upper(regexp_replace(coalesce(p_fc, ''), '[^A-Za-z0-9]', '', 'g'))
    and i.code = upper(left(coalesce(p_code, ''), 8));
  return public.qz_invites();
end $$;

-- Invite links: a new account (made within ref_days) applies the friend code of the link that brought it, once: it gets ref_new_coins at
-- once and the two become friends. After its ref_matches-th finished match (qz_ref_check, asked by the game after each match), it gets
-- ref_new_tickets 근하신년 decoders and the inviter ref_coins coins + ref_tickets decoders — for the first ref_cap players they bring in.
-- v6.74: the two no longer become friends by themselves — the new account sends the inviter a friend request, which the inviter answers
-- (none when either has blocked the other, or a request or a friendship is there already); an account made again by someone whose
-- deleted account is remembered (profiles.reborn) cannot take an invite link (ref_reborn)
create or replace function public.qz_ref_set(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  c text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  t uuid;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  cfg := (select g from public.gacha_config g where g.id = 1);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select x from public.profiles x where x.id = uid);
  if p.ref_by is not null then raise exception 'ref_already'; end if;
  if p.reborn then raise exception 'ref_reborn'; end if;
  if p.created_at < now() - make_interval(days => greatest(cfg.ref_days, 0)) then raise exception 'ref_old'; end if;
  if char_length(c) <> 6 then raise exception 'not_found'; end if;
  t := (select x.id from public.profiles x where x.fcode = c);
  if t is null then raise exception 'not_found'; end if;
  if t = uid then raise exception 'friend_self'; end if;
  if (select x.ref_by from public.profiles x where x.id = t) is not distinct from uid then raise exception 'ref_loop'; end if;
  update public.profiles set ref_by = t, coins = coins + greatest(cfg.ref_new_coins, 0) where id = uid;
  insert into public.referrals (referee, referrer) values (uid, t) on conflict (referee) do nothing;
  if cfg.ref_new_coins > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, cfg.ref_new_coins, 'ref_welcome', jsonb_build_object('code', c)); end if;
  -- (v6.74) a friend request to the inviter, who answers it — unless one is there either way already, or a block, or a full list
  if not exists (select 1 from public.friends x where (x.a = t and x.b = uid) or (x.a = uid and x.b = t)) and not public.qz_blocked(uid, t)
     and (select count(*) from public.friends x where x.a = t or x.b = t) < 100 then
    insert into public.friends (a, b) values (uid, t) on conflict do nothing;
  end if;
  return jsonb_build_object('by', (select x.nickname from public.profiles x where x.id = t), 'bonus', greatest(cfg.ref_new_coins, 0),
    'coins', (select x.coins from public.profiles x where x.id = uid), 'left', greatest(0, cfg.ref_matches - p.matches),
    'tickets', cfg.ref_new_tickets);
end $$;
-- settle the invite reward once the new player has played ref_matches matches (the inviter's row is locked while it is counted,
-- so two of their players finishing at once cannot both pass the cap)
create or replace function public.qz_ref_check() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  n integer;
  v_ok boolean;
  v_paid boolean := false;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  cfg := (select g from public.gacha_config g where g.id = 1);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select x from public.profiles x where x.id = uid);
  if p.ref_by is null then return jsonb_build_object('state', 'none'); end if;
  if p.ref_done then return jsonb_build_object('state', 'done'); end if;
  if p.matches < cfg.ref_matches then return jsonb_build_object('state', 'wait', 'left', cfg.ref_matches - p.matches); end if;
  update public.profiles set ref_done = true, dec_tickets = dec_tickets + greatest(cfg.ref_new_tickets, 0) where id = uid;
  perform 1 from public.profiles where id = p.ref_by for update;
  v_ok := found;
  -- (v6.72: counted on the inviter's own counter as well, which deleting an invited account does not lower; a suspended inviter is not paid)
  v_ok := v_ok and not exists (select 1 from public.profiles x where x.id = p.ref_by and x.banned_until is not null and x.banned_until > now());
  n := greatest(coalesce((select x.ref_paid from public.profiles x where x.id = p.ref_by), 0),
    (select count(*) from public.referrals r where r.referrer = p.ref_by and r.rewarded)::integer);
  if v_ok and n < cfg.ref_cap then
    update public.profiles set coins = coins + greatest(cfg.ref_coins, 0), dec_tickets = dec_tickets + greatest(cfg.ref_tickets, 0),
      ref_paid = greatest(ref_paid, n) + 1 where id = p.ref_by;
    if cfg.ref_coins > 0 then
      insert into public.coin_log (user_id, delta, reason, detail) values (p.ref_by, cfg.ref_coins, 'ref_reward', jsonb_build_object('from', p.nickname));
    end if;
    update public.referrals set paid_at = now(), rewarded = true, seen = false where referee = uid;
    v_paid := true;
  else
    update public.referrals set paid_at = now() where referee = uid;
  end if;
  return jsonb_build_object('state', 'paid', 'got_tickets', greatest(cfg.ref_new_tickets, 0), 'inviter_paid', v_paid,
    'tickets', (select x.dec_tickets from public.profiles x where x.id = uid),
    'by', (select x.nickname from public.profiles x where x.id = p.ref_by));
end $$;
-- my invite link's record: the players it brought in (last 30), how far each is, what was paid; the rewards not shown yet count as shown after this
create or replace function public.qz_ref_info() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  r jsonb;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  r := jsonb_build_object('code', (select x.fcode from public.profiles x where x.id = uid),
    'n', (select count(*) from public.referrals f where f.referrer = uid),
    'paid', greatest((select x.ref_paid from public.profiles x where x.id = uid), (select count(*) from public.referrals f where f.referrer = uid and f.rewarded)::integer),
    'cap', cfg.ref_cap, 'matches', cfg.ref_matches, 'coins', cfg.ref_coins, 'tickets', cfg.ref_tickets,
    'new_coins', cfg.ref_new_coins, 'new_tickets', cfg.ref_new_tickets,
    'list', coalesce((select jsonb_agg(jsonb_build_object('nick', t.nickname, 'at', q.at, 'm', least(t.matches, cfg.ref_matches),
        'paid', q.paid_at is not null, 'rewarded', q.rewarded, 'new', not q.seen) order by q.at desc)
      from (select f.* from public.referrals f where f.referrer = uid order by f.at desc limit 30) q join public.profiles t on t.id = q.referee), '[]'::jsonb));
  update public.referrals set seen = true where referrer = uid and not seen;
  return r;
end $$;
revoke all on function public.qz_invite(text, text, text, text) from public, anon;
revoke all on function public.qz_invites() from public, anon;
revoke all on function public.qz_invite_answer(text, text) from public, anon;
revoke all on function public.qz_ref_set(text) from public, anon;
revoke all on function public.qz_ref_check() from public, anon;
revoke all on function public.qz_ref_info() from public, anon;
grant execute on function public.qz_invite(text, text, text, text) to authenticated;
grant execute on function public.qz_invites() to authenticated;
grant execute on function public.qz_invite_answer(text, text) to authenticated;
grant execute on function public.qz_ref_set(text) to authenticated;
grant execute on function public.qz_ref_check() to authenticated;
grant execute on function public.qz_ref_info() to authenticated;

-- ---------- admin (v6.42) ----------
-- 관리자 페이지(/admin)가 부르는 함수들. admins 테이블에 있는 계정만 쓸 수 있고(qz_admin_uid가 확인), 한 일은 전부 admin_log에 남습니다.
-- 관리자 지정 / 해제는 SQL Editor에서만 합니다 (게임이나 관리자 페이지로는 못 바꿔요):
--   insert into public.admins (user_id) select id from auth.users where email = '관리자 계정 이메일' on conflict do nothing;
--   delete from public.admins where user_id = (select id from auth.users where email = '그 이메일');
alter table public.admins         enable row level security;   -- (no policies: these four are read and written through the functions only)
alter table public.admin_log      enable row level security;
alter table public.notices        enable row level security;
alter table public.daily_activity enable row level security;
revoke all on table public.admins from public, anon, authenticated;
revoke all on table public.admin_log from public, anon, authenticated;
revoke all on table public.notices from public, anon, authenticated;
revoke all on table public.daily_activity from public, anon, authenticated;

-- the caller, when it is an admin (else not_admin)
create or replace function public.qz_admin_uid() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if not exists (select 1 from public.admins a where a.user_id = uid) then raise exception 'not_admin'; end if;
  return uid;
end $$;
-- one line of the admin log
create or replace function public.qz_admin_note(p_admin uuid, p_action text, p_target uuid, p_detail jsonb, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admin_log (admin_id, action, target, detail, reason)
  values (p_admin, p_action, p_target, p_detail, nullif(left(btrim(regexp_replace(coalesce(p_reason, ''), '[[:cntrl:]]', ' ', 'g')), 200), ''));
end $$;
-- the reason anything done to a player needs (1..200 characters)
create or replace function public.qz_admin_reason(p_reason text) returns text
language plpgsql immutable set search_path = '' as $$
declare r text := left(btrim(regexp_replace(coalesce(p_reason, ''), '[[:cntrl:]]', ' ', 'g')), 200);
begin
  if char_length(r) < 1 then raise exception 'reason_required'; end if;
  return r;
end $$;

-- who I am on the admin page (not_admin for anyone else)
create or replace function public.qz_admin_whoami() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_uid();
begin
  return jsonb_build_object('id', uid, 'role', (select a.role from public.admins a where a.user_id = uid),
    'nickname', (select t.nickname from public.profiles t where t.id = uid), 'email', (select u.email from auth.users u where u.id = uid),
    'inq_new', (select count(*) from public.inquiries q where q.status = 'new'));   -- (v6.66: inquiries waiting, the menu's number)
end $$;

-- the dashboard: players (all, new today, online now = a heartbeat in the last 150 s, played today), bans, coins today (paid out / spent),
-- decoders opened for coins today, S lines and transcendence trades today, play time (today, all time), the public rooms up now, and
-- the last 14 days (sign-ups, players, time). "Today" is the Korean day.
create or replace function public.qz_admin_dash() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  today date := (now() at time zone 'Asia/Seoul')::date;
  t0 timestamptz := ((now() at time zone 'Asia/Seoul')::date)::timestamp at time zone 'Asia/Seoul';
begin
  return jsonb_build_object(
    'users', (select count(*) from public.profiles),
    'new_today', (select count(*) from public.profiles t where t.created_at >= t0),
    'online_now', (select count(*) from public.profiles t where t.last_seen > now() - interval '150 seconds'),
    'active_today', (select count(*) from public.daily_activity d where d.day = today),
    'banned', (select count(*) from public.profiles t where t.banned_until > now()),
    'coins_in', coalesce((select sum(c.delta) from public.coin_log c where c.at >= t0 and c.delta > 0), 0),
    'coins_out', coalesce((select -sum(c.delta) from public.coin_log c where c.at >= t0 and c.delta < 0), 0),
    'coins_all', coalesce((select sum(t.coins) from public.profiles t), 0),
    'dec', jsonb_build_object(
      'ny', coalesce((select sum(coalesce((c.detail ->> 'count')::integer, 0)) from public.coin_log c where c.at >= t0 and c.reason = 'decoder'), 0),
      'season', coalesce((select sum(coalesce((c.detail ->> 'count')::integer, 0)) from public.coin_log c where c.at >= t0 and c.reason = 'season_decoder'), 0),
      'side', coalesce((select sum(coalesce((c.detail ->> 'count')::integer, 0)) from public.coin_log c where c.at >= t0 and c.reason = 'side_decoder'), 0)),
    's_today', (select count(*) from public.gacha_log g where g.at >= t0 and g.tier = 'S' and g.src <> 'exchange'),
    'trans_today', (select count(*) from public.gacha_log g where g.at >= t0 and g.src = 'trans'),
    'online_today', coalesce((select sum(d.online_secs) from public.daily_activity d where d.day = today), 0),
    'play_today', coalesce((select sum(d.play_secs) from public.daily_activity d where d.day = today), 0),
    'online_all', coalesce((select sum(t.online_secs) from public.profiles t), 0),
    'play_all', coalesce((select sum(t.play_secs) from public.profiles t), 0),
    'rooms', coalesce((select jsonb_agg(jsonb_build_object('code', r.code, 'host', r.host, 'host_name', r.host_name, 'map', r.map, 'mode', r.mode,
        'players', r.players, 'max_players', r.max_players, 'status', r.status, 'since', r.created_at) order by r.created_at desc)
      from public.rooms r where r.updated_at > now() - interval '30 seconds'), '[]'::jsonb),
    'days', (select jsonb_agg(jsonb_build_object('day', s.d,
        'signups', (select count(*) from public.profiles t where (t.created_at at time zone 'Asia/Seoul')::date = s.d),
        'active', (select count(*) from public.daily_activity a where a.day = s.d),
        'online', coalesce((select sum(a.online_secs) from public.daily_activity a where a.day = s.d), 0),
        'play', coalesce((select sum(a.play_secs) from public.daily_activity a where a.day = s.d), 0)) order by s.d)
      from (select today - k as d from generate_series(0, 13) k) s));
end $$;

-- the player list: p_q = a nickname (part of it), a friend code, an e-mail (part of it) or an account id; empty = everyone.
-- p_sort: new (sign-up) | seen (last seen) | coins | xp | play | online | banned (banned only) | admins (admins only). 50 a page.
create or replace function public.qz_admin_users(p_q text default '', p_sort text default 'new', p_limit integer default 50, p_offset integer default 0) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  own boolean := (select a.role from public.admins a where a.user_id = auth.uid()) = 'owner';   -- (staff see no e-mails)
  q text := btrim(coalesce(p_q, ''));
  lk text := '%' || replace(replace(replace(btrim(coalesce(p_q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  fc text := upper(regexp_replace(btrim(coalesce(p_q, '')), '[^A-Za-z0-9]', '', 'g'));
  qid uuid := null;
  srt text := coalesce(nullif(p_sort, ''), 'new');
  lim integer := least(greatest(coalesce(p_limit, 50), 1), 200);
  off integer := greatest(coalesce(p_offset, 0), 0);
  n integer;
  r jsonb;
begin
  if q ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then qid := q::uuid; end if;
  n := (select count(*) from public.profiles t join auth.users u on u.id = t.id
    where (q = '' or t.id = qid or t.fcode = fc or t.nickname ilike lk or own and u.email ilike lk)
      and (srt <> 'banned' or t.banned_until > now()) and (srt <> 'admins' or exists (select 1 from public.admins a where a.user_id = t.id)));
  r := (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'nickname', s.nickname, 'fcode', s.fcode, 'email', case when own then s.email end, 'coins', s.coins,
      'frags', s.fragments, 'tfrags', s.trans_frags, 'xp', s.xp, 'games', s.rec_games, 'created_at', s.created_at, 'last_seen', s.last_seen,
      'online_secs', s.online_secs, 'play_secs', s.play_secs, 'banned_until', s.banned_until, 'admin', s.adm) order by s.n), '[]'::jsonb)
    from (select t.*, u.email, exists (select 1 from public.admins a where a.user_id = t.id) as adm,
            row_number() over (order by
              case when srt = 'coins' then t.coins end desc nulls last,
              case when srt = 'xp' then t.xp end desc nulls last,
              case when srt = 'play' then t.play_secs end desc nulls last,
              case when srt = 'online' then t.online_secs end desc nulls last,
              case when srt = 'seen' then t.last_seen end desc nulls last,
              case when srt = 'banned' then t.banned_until end desc nulls last,
              t.created_at desc, t.id) as n
          from public.profiles t join auth.users u on u.id = t.id
          where (q = '' or t.id = qid or t.fcode = fc or t.nickname ilike lk or own and u.email ilike lk)
            and (srt <> 'banned' or t.banned_until > now()) and (srt <> 'admins' or exists (select 1 from public.admins a where a.user_id = t.id))
          order by n limit lim offset off) s);
  return jsonb_build_object('total', n, 'rows', r);
end $$;

-- one player in full: the account (e-mail, how they sign in), what they have, the record, the guns, the chapters, friends and invites,
-- the last 50 coin and decoder lines, the last 14 days of play time, and what admins did to them
create or replace function public.qz_admin_user(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  p public.profiles;
  own boolean := (select a.role from public.admins a where a.user_id = auth.uid()) = 'owner';
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  p := (select t from public.profiles t where t.id = p_id);
  if p.id is null then raise exception 'no_profile'; end if;
  return jsonb_build_object('id', p.id, 'nickname', p.nickname, 'fcode', p.fcode, 'coins', p.coins, 'frags', p.fragments, 'tfrags', p.trans_frags,
    'tickets', p.dec_tickets, 'season_tickets', p.season_tickets, 'ny', jsonb_build_array(p.ny_g, p.ny_h, p.ny_s, p.ny_n),
    'earned', p.earned_total, 'matches', p.matches, 'rec', public.qz_rec(p), 'created_at', p.created_at, 'last_seen', p.last_seen,
    'day_earned', case when p.day = today then p.day_earned else 0 end, 'online_secs', p.online_secs, 'play_secs', p.play_secs,
    'banned_until', p.banned_until, 'ban_reason', p.ban_reason,
    'email', case when own then (select x.email from auth.users x where x.id = p_id) end,
    'provider', (select coalesce(x.raw_app_meta_data ->> 'provider', 'email') from auth.users x where x.id = p_id),
    'signed_in_at', (select x.last_sign_in_at from auth.users x where x.id = p_id),
    'admin', exists (select 1 from public.admins a where a.user_id = p_id),
    'ref_by', (select x.nickname from public.profiles x where x.id = p.ref_by),
    'referred', (select count(*) from public.referrals f where f.referrer = p_id),
    'friends', (select count(*) from public.friends f where f.accepted and (f.a = p_id or f.b = p_id)),
    'owned', coalesce((select jsonb_agg(jsonb_build_object('gun', o.gun_id, 'at', o.bought_at, 'paid', o.price_paid) order by o.bought_at desc)
      from public.owned_guns o where o.user_id = p_id), '[]'::jsonb),
    'eps', public.qz_eps(p_id), 'firsts', public.qz_firsts_of(p_id),
    'coin_log', coalesce((select jsonb_agg(jsonb_build_object('at', c.at, 'delta', c.delta, 'reason', c.reason, 'detail', c.detail) order by c.id desc)
      from (select * from public.coin_log c0 where c0.user_id = p_id order by c0.id desc limit 50) c), '[]'::jsonb),
    'gacha_log', coalesce((select jsonb_agg(jsonb_build_object('at', g.at, 'src', g.src, 'kind', g.kind, 'tier', g.tier, 'gun', g.gun_id, 'amount', g.amount) order by g.id desc)
      from (select * from public.gacha_log g0 where g0.user_id = p_id order by g0.id desc limit 50) g), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(jsonb_build_object('day', d.day, 'online', d.online_secs, 'play', d.play_secs) order by d.day desc)
      from public.daily_activity d where d.user_id = p_id and d.day > today - 14), '[]'::jsonb),
    'log', coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'at', l.at, 'action', l.action, 'by', (select x.nickname from public.profiles x where x.id = l.admin_id),
        'detail', l.detail, 'reason', l.reason) order by l.id desc)
      from (select * from public.admin_log l0 where l0.target = p_id order by l0.id desc limit 30) l), '[]'::jsonb));
end $$;

-- give (or take back, p_amount < 0) coins, decoder fragments, transcendence fragments, 근하신년 decoders kept or season decoders kept;
-- never below 0. Coins go on the coin log too ('admin').
create or replace function public.qz_admin_grant(p_id uuid, p_kind text, p_amount integer, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  rsn text := public.qz_admin_reason(p_reason);
  a bigint := coalesce(p_amount, 0);
  o bigint;
  nv bigint;
begin
  if p_kind is null or p_kind not in ('coins', 'frags', 'tfrags', 'tickets', 'season_tickets') then raise exception 'bad_kind'; end if;
  if a = 0 or a < -100000000 or a > 100000000 then raise exception 'bad_amount'; end if;
  perform 1 from public.profiles where id = p_id for update;
  if not found then raise exception 'no_profile'; end if;
  o := (select case p_kind when 'coins' then t.coins when 'frags' then t.fragments when 'tfrags' then t.trans_frags
          when 'tickets' then t.dec_tickets else t.season_tickets end from public.profiles t where t.id = p_id);
  nv := greatest(0, o + a);
  if nv > 2000000000 then raise exception 'bad_amount'; end if;
  if p_kind = 'coins' then update public.profiles set coins = nv where id = p_id;
  elsif p_kind = 'frags' then update public.profiles set fragments = nv where id = p_id;
  elsif p_kind = 'tfrags' then update public.profiles set trans_frags = nv where id = p_id;
  elsif p_kind = 'tickets' then update public.profiles set dec_tickets = nv where id = p_id;
  else update public.profiles set season_tickets = nv where id = p_id;
  end if;
  if p_kind = 'coins' and nv <> o then
    insert into public.coin_log (user_id, delta, reason, detail) values (p_id, (nv - o)::integer, 'admin', jsonb_build_object('note', rsn));
  end if;
  perform public.qz_admin_note(uid, 'grant', p_id, jsonb_build_object('kind', p_kind, 'amount', nv - o, 'old', o, 'new', nv), rsn);
  return jsonb_build_object('kind', p_kind, 'old', o, 'new', nv);
end $$;

-- give a gun (owned for good, nothing paid) or take one back; the free guns everyone has are not on the list
create or replace function public.qz_admin_gun(p_id uuid, p_gun text, p_give boolean, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  rsn text := public.qz_admin_reason(p_reason);
  pr public.gun_prices;
  give boolean := coalesce(p_give, true);
begin
  if not exists (select 1 from public.profiles t where t.id = p_id) then raise exception 'no_profile'; end if;
  pr := (select g from public.gun_prices g where g.gun_id = p_gun);
  if pr.gun_id is null then raise exception 'no_gun'; end if;
  if pr.free then raise exception 'free_gun'; end if;
  if give then
    insert into public.owned_guns (user_id, gun_id, price_paid) values (p_id, p_gun, 0) on conflict do nothing;
    if not found then raise exception 'already_owned'; end if;
    insert into public.gun_notices (user_id, gun_id, src) values (p_id, p_gun, 'admin');   -- (v6.46: the player is told in the game)
  else
    delete from public.owned_guns where user_id = p_id and gun_id = p_gun;
    if not found then raise exception 'not_owned'; end if;
    delete from public.gun_notices where user_id = p_id and gun_id = p_gun and not seen;
  end if;
  perform public.qz_admin_note(uid, case when give then 'gun_give' else 'gun_take' end, p_id, jsonb_build_object('gun', p_gun), rsn);
  return jsonb_build_object('gun', p_gun, 'owned', give);
end $$;

-- a new nickname for a player (cleaned the way the game cleans one)
create or replace function public.qz_admin_rename(p_id uuid, p_nick text, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  rsn text := public.qz_admin_reason(p_reason);
  o text;
  nn text := public.qz_clean_nick(p_nick);
begin
  o := (select t.nickname from public.profiles t where t.id = p_id);
  if o is null then raise exception 'no_profile'; end if;
  -- (v6.74: a nickname is one player's, any case)
  if exists (select 1 from public.profiles t where lower(t.nickname) = lower(nn) and t.id <> p_id) then raise exception 'nick_taken'; end if;
  begin
    update public.profiles set nickname = nn where id = p_id;
  exception when unique_violation then
    raise exception 'nick_taken';
  end;
  update public.rooms set host_name = nn where host = p_id;
  perform public.qz_admin_note(uid, 'rename', p_id, jsonb_build_object('old', o, 'new', nn), rsn);
  return jsonb_build_object('old', o, 'new', nn);
end $$;

-- a ban for p_days days (0 or null: for good); their public room comes off the list and their invites go. Admins cannot be banned.
create or replace function public.qz_admin_ban(p_id uuid, p_days integer, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  rsn text := public.qz_admin_reason(p_reason);
  u timestamptz;
begin
  if not exists (select 1 from public.profiles t where t.id = p_id) then raise exception 'no_profile'; end if;
  if p_id = uid or exists (select 1 from public.admins a where a.user_id = p_id) then raise exception 'ban_admin'; end if;
  if p_days is not null and (p_days < 0 or p_days > 3650) then raise exception 'bad_days'; end if;
  u := case when coalesce(p_days, 0) = 0 then 'infinity'::timestamptz else now() + make_interval(days => p_days) end;
  update public.profiles set banned_until = u, ban_reason = rsn where id = p_id;
  delete from public.rooms where host = p_id;
  delete from public.room_invites where from_id = p_id;
  perform public.qz_admin_note(uid, 'ban', p_id, jsonb_build_object('days', coalesce(p_days, 0), 'until', u), rsn);
  return jsonb_build_object('until', u);
end $$;
create or replace function public.qz_admin_unban(p_id uuid, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  rsn text := public.qz_admin_reason(p_reason);
  o timestamptz;
begin
  if not exists (select 1 from public.profiles t where t.id = p_id) then raise exception 'no_profile'; end if;
  o := (select t.banned_until from public.profiles t where t.id = p_id);
  if o is null then raise exception 'not_banned'; end if;
  update public.profiles set banned_until = null, ban_reason = null where id = p_id;
  perform public.qz_admin_note(uid, 'unban', p_id, jsonb_build_object('was', o), rsn);
  return jsonb_build_object('ok', true);
end $$;

-- the price list as the admin page shows it: what the file says (file_price / file_sold), whether an admin changed it, how many own it
create or replace function public.qz_admin_prices() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('gun', g.gun_id, 'price', g.price, 'sold', g.sold, 'free', g.free, 'tier', g.tier,
      'admin_set', g.admin_set, 'file_price', g.file_price, 'file_sold', g.file_sold,
      'owners', (select count(*) from public.owned_guns o where o.gun_id = g.gun_id)) order by g.gun_id)
    from public.gun_prices g), '[]'::jsonb);
end $$;
-- a gun's price and whether the shop sells it (kept when schema.sql runs again; qz_admin_price_reset goes back to the file's).
-- 근하신년 (tier) guns and transcendence guns are never sold.
create or replace function public.qz_admin_price(p_gun text, p_price integer, p_sold boolean, p_reason text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  pr public.gun_prices;
  s boolean;
begin
  pr := (select g from public.gun_prices g where g.gun_id = p_gun);
  if pr.gun_id is null then raise exception 'no_gun'; end if;
  if pr.free then raise exception 'free_gun'; end if;
  if p_price is null or p_price < 0 or p_price > 10000000 then raise exception 'bad_price'; end if;
  s := coalesce(p_sold, pr.sold);
  if s and pr.tier is not null then raise exception 'gacha_only'; end if;
  if s and p_gun = any(coalesce((select c.trans_guns from public.gacha_config c where c.id = 1), '{}'::text[])) then raise exception 'trans_only'; end if;
  update public.gun_prices set price = p_price, sold = s, admin_set = true where gun_id = p_gun;
  perform public.qz_admin_note(uid, 'price', null, jsonb_build_object('gun', p_gun, 'old', jsonb_build_object('price', pr.price, 'sold', pr.sold),
    'new', jsonb_build_object('price', p_price, 'sold', s)), p_reason);
  return jsonb_build_object('gun', p_gun, 'price', p_price, 'sold', s);
end $$;
create or replace function public.qz_admin_price_reset(p_gun text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  pr public.gun_prices;
begin
  pr := (select g from public.gun_prices g where g.gun_id = p_gun);
  if pr.gun_id is null then raise exception 'no_gun'; end if;
  update public.gun_prices set price = coalesce(file_price, price), sold = coalesce(file_sold, sold), admin_set = false where gun_id = p_gun;
  perform public.qz_admin_note(uid, 'price_reset', null, jsonb_build_object('gun', p_gun, 'old', jsonb_build_object('price', pr.price, 'sold', pr.sold),
    'new', jsonb_build_object('price', coalesce(pr.file_price, pr.price), 'sold', coalesce(pr.file_sold, pr.sold))), null);
  return jsonb_build_object('gun', p_gun, 'price', coalesce(pr.file_price, pr.price), 'sold', coalesce(pr.file_sold, pr.sold));
end $$;

-- the decoder / invite numbers (the one gacha_config row)
create or replace function public.qz_admin_config_get() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return (select to_jsonb(g) from public.gacha_config g where g.id = 1);
end $$;
-- change some of them: p_values = {column: value, ...}. Every value is checked against its column's type, nothing may go below 0,
-- and the whole row must still make sense afterwards (ranges, card sizes, the guns on lines and trades exist) or nothing changes.
-- Kept when schema.sql runs again (the file only adds new columns).
create or replace function public.qz_admin_config(p_values jsonb, p_reason text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  k text;
  v jsonb;
  o jsonb;
  cur jsonb;
  ch jsonb := '{}'::jsonb;
  c public.gacha_config;
begin
  if p_values is null or jsonb_typeof(p_values) <> 'object' then raise exception 'bad_value'; end if;
  perform 1 from public.gacha_config where id = 1 for update;
  if not found then raise exception 'no_config'; end if;
  o := (select to_jsonb(g) from public.gacha_config g where g.id = 1);
  for k, v in select e.key, e.value from jsonb_each(p_values) e loop
    if k = 'id' or not (o ? k) then raise exception 'bad_key'; end if;
    if jsonb_typeof(v) = 'null' then raise exception 'bad_value'; end if;
    if jsonb_typeof(v) = 'number' and (v #>> '{}')::numeric < 0 then raise exception 'bad_value'; end if;
    execute format('update public.gacha_config set %I = (jsonb_populate_record(null::public.gacha_config, $1)).%I where id = 1', k, k)
      using jsonb_build_object(k, v);
  end loop;
  c := (select g from public.gacha_config g where g.id = 1);
  if c.rate_s > 1 or c.rate_a > 1 or c.rate_coin > 1 or c.rate_s + c.rate_a + c.rate_coin > 1 then raise exception 'bad_value'; end if;
  if c.frag_min > c.frag_max or c.dec_frag_min > c.dec_frag_max or c.season_frag_min > c.season_frag_max or c.side_frag_min > c.side_frag_max
     or c.trans_frag_min > c.trans_frag_max then raise exception 'bad_range'; end if;
  if c.bingo_hi < 24 or c.season_hi < 24 or c.side_hi < 25 or c.trans_cost < 1 or c.pity < 1 then raise exception 'bad_value'; end if;
  if exists (select 1 from unnest(c.trans_guns) x where not exists (select 1 from public.gun_prices p where p.gun_id = x)) then raise exception 'no_gun'; end if;
  if exists (select 1 from unnest(c.season_lines || c.side_lines) x where x !~ '^(gun:[a-z0-9_]+|coins:[0-9]+|frags:[0-9]+|tickets:[0-9]+)$') then raise exception 'bad_line'; end if;
  if exists (select 1 from unnest(c.season_lines || c.side_lines) x where x like 'gun:%' and not exists (select 1 from public.gun_prices p where p.gun_id = substr(x, 5))) then raise exception 'no_gun'; end if;
  cur := (select to_jsonb(g) from public.gacha_config g where g.id = 1);
  for k in select e.key from jsonb_each(p_values) e loop
    if (o -> k) is distinct from (cur -> k) then ch := ch || jsonb_build_object(k, jsonb_build_object('old', o -> k, 'new', cur -> k)); end if;
  end loop;
  if ch <> '{}'::jsonb then perform public.qz_admin_note(uid, 'config', null, ch, p_reason); end if;
  return cur;
end $$;

-- the daily mission pool, and one mission saved (a new id adds one; a row saved here is left alone by later runs of schema.sql)
create or replace function public.qz_admin_missions() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(to_jsonb(q) order by q.tier, q.id) from public.mission_pool q), '[]'::jsonb);
end $$;
create or replace function public.qz_admin_mission_save(p_row jsonb, p_reason text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  mid text := btrim(coalesce(p_row ->> 'id', ''));
  o public.mission_pool;
  m public.mission_pool;
begin
  if mid !~ '^[a-z0-9_]{1,24}$' then raise exception 'bad_id'; end if;
  o := (select q from public.mission_pool q where q.id = mid);
  m := jsonb_populate_record(o, p_row - 'edited');
  if m.tier is null or m.kind is null or m.goal is null or m.tier not between 1 and 3 or m.goal < 1
     or m.kind not in ('play', 'win', 'kills', 'infects', 'damage', 'rounds', 'hs') or coalesce(m.coins, 0) not between 0 and 5000
     or coalesce(m.tickets, 0) not between 0 and 5 or coalesce(m.weight, 1) < 0 then raise exception 'bad_value'; end if;
  insert into public.mission_pool (id, tier, kind, goal, coins, tickets, weight, active, ko, en, edited)
  values (mid, m.tier, m.kind, m.goal, coalesce(m.coins, 0), coalesce(m.tickets, 0), coalesce(m.weight, 1), coalesce(m.active, true),
    nullif(left(btrim(coalesce(m.ko, '')), 80), ''), nullif(left(btrim(coalesce(m.en, '')), 80), ''), true)
  on conflict (id) do update set tier = excluded.tier, kind = excluded.kind, goal = excluded.goal, coins = excluded.coins, tickets = excluded.tickets,
    weight = excluded.weight, active = excluded.active, ko = excluded.ko, en = excluded.en, edited = true;
  perform public.qz_admin_note(uid, 'mission', null, jsonb_build_object('id', mid, 'old', case when o.id is null then null else to_jsonb(o) end,
    'new', (select to_jsonb(q) from public.mission_pool q where q.id = mid)), p_reason);
  return public.qz_admin_missions();
end $$;

-- server notices: the ones showing now (anyone may read them: the lobby), all of them (admins), one saved (p_row.id: that one, else a
-- new one), one deleted
create or replace function public.qz_notices() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', n.id, 'title', n.title, 'body', n.body, 'level', n.level, 'popup', n.popup,
      'starts_at', n.starts_at, 'ends_at', n.ends_at) order by case n.level when 'warn' then 0 when 'event' then 1 else 2 end, n.starts_at desc), '[]'::jsonb)
  from (select x.* from public.notices x where x.active and x.starts_at <= now() and (x.ends_at is null or x.ends_at > now())
        order by x.starts_at desc limit 5) n
$$;
create or replace function public.qz_admin_notices() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', n.id, 'title', n.title, 'body', n.body, 'level', n.level, 'popup', n.popup,
      'starts_at', n.starts_at, 'ends_at', n.ends_at, 'active', n.active, 'created_at', n.created_at, 'updated_at', n.updated_at,
      'by', (select x.nickname from public.profiles x where x.id = n.created_by),
      'live', n.active and n.starts_at <= now() and (n.ends_at is null or n.ends_at > now())) order by n.id desc)
    from (select x.* from public.notices x order by x.id desc limit 100) n), '[]'::jsonb);
end $$;
create or replace function public.qz_admin_notice_save(p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  nid bigint := nullif(p_row ->> 'id', '')::bigint;
  ti text := left(btrim(regexp_replace(coalesce(p_row ->> 'title', ''), '[[:cntrl:]]', ' ', 'g')), 80);
  bo text := left(coalesce(p_row ->> 'body', ''), 1000);
  lv text := coalesce(nullif(p_row ->> 'level', ''), 'info');
  pu boolean := coalesce((p_row ->> 'popup')::boolean, false);
  ac boolean := coalesce((p_row ->> 'active')::boolean, true);
  st timestamptz := coalesce(nullif(p_row ->> 'starts_at', '')::timestamptz, now());
  en timestamptz := nullif(p_row ->> 'ends_at', '')::timestamptz;
begin
  if char_length(ti) < 1 then raise exception 'bad_title'; end if;
  if lv not in ('info', 'warn', 'event') then raise exception 'bad_value'; end if;
  if en is not null and en <= st then raise exception 'bad_range'; end if;
  if nid is null then
    insert into public.notices (title, body, level, popup, starts_at, ends_at, active, created_by) values (ti, bo, lv, pu, st, en, ac, uid);
  else
    update public.notices set title = ti, body = bo, level = lv, popup = pu, starts_at = st, ends_at = en, active = ac, updated_at = now() where id = nid;
    if not found then raise exception 'no_notice'; end if;
  end if;
  perform public.qz_admin_note(uid, case when nid is null then 'notice_add' else 'notice_edit' end, null,
    jsonb_build_object('id', nid, 'title', ti, 'level', lv, 'active', ac), null);
  return public.qz_admin_notices();
end $$;
create or replace function public.qz_admin_notice_delete(p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  ti text;
begin
  ti := (select n.title from public.notices n where n.id = p_id);
  if ti is null then raise exception 'no_notice'; end if;
  delete from public.notices where id = p_id;
  perform public.qz_admin_note(uid, 'notice_delete', null, jsonb_build_object('id', p_id, 'title', ti), null);
  return public.qz_admin_notices();
end $$;

-- the admin log, newest first (p_target: what was done to one player; p_before: older than that id, for the next page)
create or replace function public.qz_admin_logs(p_target uuid default null, p_before bigint default 0, p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_uid();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', l.id, 'at', l.at, 'action', l.action, 'admin_id', l.admin_id,
      'by', (select x.nickname from public.profiles x where x.id = l.admin_id), 'target', l.target,
      'target_name', (select x.nickname from public.profiles x where x.id = l.target), 'detail', l.detail, 'reason', l.reason) order by l.id desc)
    from (select x.* from public.admin_log x where (p_target is null or x.target = p_target) and (coalesce(p_before, 0) = 0 or x.id < p_before)
          order by x.id desc limit least(greatest(coalesce(p_limit, 100), 1), 300)) l), '[]'::jsonb);
end $$;

revoke all on function public.qz_guard(uuid) from public, anon, authenticated;
revoke all on function public.qz_admin_uid() from public, anon, authenticated;
revoke all on function public.qz_admin_note(uuid, text, uuid, jsonb, text) from public, anon, authenticated;
revoke all on function public.qz_admin_reason(text) from public, anon, authenticated;
revoke all on function public.qz_notices() from public;
grant execute on function public.qz_notices() to anon, authenticated;
revoke all on function public.qz_admin_whoami() from public, anon;
revoke all on function public.qz_admin_dash() from public, anon;
revoke all on function public.qz_admin_users(text, text, integer, integer) from public, anon;
revoke all on function public.qz_admin_user(uuid) from public, anon;
revoke all on function public.qz_admin_grant(uuid, text, integer, text) from public, anon;
revoke all on function public.qz_admin_gun(uuid, text, boolean, text) from public, anon;
revoke all on function public.qz_admin_rename(uuid, text, text) from public, anon;
revoke all on function public.qz_admin_ban(uuid, integer, text) from public, anon;
revoke all on function public.qz_admin_unban(uuid, text) from public, anon;
revoke all on function public.qz_admin_prices() from public, anon;
revoke all on function public.qz_admin_price(text, integer, boolean, text) from public, anon;
revoke all on function public.qz_admin_price_reset(text) from public, anon;
revoke all on function public.qz_admin_config_get() from public, anon;
revoke all on function public.qz_admin_config(jsonb, text) from public, anon;
revoke all on function public.qz_admin_missions() from public, anon;
revoke all on function public.qz_admin_mission_save(jsonb, text) from public, anon;
revoke all on function public.qz_admin_notices() from public, anon;
revoke all on function public.qz_admin_notice_save(jsonb) from public, anon;
revoke all on function public.qz_admin_notice_delete(bigint) from public, anon;
revoke all on function public.qz_admin_logs(uuid, bigint, integer) from public, anon;
grant execute on function public.qz_admin_whoami() to authenticated;
grant execute on function public.qz_admin_dash() to authenticated;
grant execute on function public.qz_admin_users(text, text, integer, integer) to authenticated;
grant execute on function public.qz_admin_user(uuid) to authenticated;
grant execute on function public.qz_admin_grant(uuid, text, integer, text) to authenticated;
grant execute on function public.qz_admin_gun(uuid, text, boolean, text) to authenticated;
grant execute on function public.qz_admin_rename(uuid, text, text) to authenticated;
grant execute on function public.qz_admin_ban(uuid, integer, text) to authenticated;
grant execute on function public.qz_admin_unban(uuid, text) to authenticated;
grant execute on function public.qz_admin_prices() to authenticated;
grant execute on function public.qz_admin_price(text, integer, boolean, text) to authenticated;
grant execute on function public.qz_admin_price_reset(text) to authenticated;
grant execute on function public.qz_admin_config_get() to authenticated;
grant execute on function public.qz_admin_config(jsonb, text) to authenticated;
grant execute on function public.qz_admin_missions() to authenticated;
grant execute on function public.qz_admin_mission_save(jsonb, text) to authenticated;
grant execute on function public.qz_admin_notices() to authenticated;
grant execute on function public.qz_admin_notice_save(jsonb) to authenticated;
grant execute on function public.qz_admin_notice_delete(bigint) to authenticated;
grant execute on function public.qz_admin_logs(uuid, bigint, integer) to authenticated;

-- ---------- admin, part two (v6.43): mail, coupons, staff, suspicious players, closing a public room ----------
-- 부운영자(staff): admins.role = 'staff'. 현황 · 플레이어 조회(이메일은 안 보임) · 닉네임 변경 · 이용 정지/해제 · 의심 유저 · 방 내리기 · 기록만.
-- 지급 · 무기 · 게임 설정 · 공지 · 우편 · 쿠폰 · 부운영자 관리는 주인(owner)만. 주인은 SQL Editor에서만 만들어요 (부운영자는 관리자 페이지에서도).
-- 우편: 전체(보낸 뒤 가입한 계정은 for_new일 때만) 또는 고른 플레이어에게 보상 묶음 {coins, frags, tfrags, tickets, season_tickets, guns};
-- 플레이어는 게임 로비의 우편함에서 받아요(qz_mails / qz_mail_claim). 쿠폰: 코드 하나에 보상 묶음, 계정마다 한 번, 총 횟수 · 기간 제한(qz_coupon_redeem).
create index if not exists coin_log_reason_at on public.coin_log(reason, at desc);
create table if not exists public.mails (
  id         bigint generated always as identity primary key,
  title      text not null check (char_length(title) between 1 and 60),
  body       text not null default '' check (char_length(body) <= 500),
  rewards    jsonb not null,
  to_all     boolean not null default true,    -- false: the players in mail_targets
  for_new    boolean not null default false,   -- to_all: accounts made after it was sent get it too
  expires_at timestamptz,
  active     boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.mail_targets (
  mail_id bigint not null references public.mails(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (mail_id, user_id)
);
create index if not exists mail_targets_user on public.mail_targets(user_id);
create table if not exists public.mail_claims (
  mail_id bigint not null references public.mails(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now(),
  primary key (mail_id, user_id)
);
create index if not exists mail_claims_user on public.mail_claims(user_id);
create table if not exists public.coupons (
  code       text primary key check (code ~ '^[A-Z0-9]{4,20}$'),
  rewards    jsonb not null,
  max_uses   integer check (max_uses is null or max_uses > 0),   -- null: no limit
  uses       integer not null default 0,
  starts_at  timestamptz not null default now(),
  expires_at timestamptz,
  active     boolean not null default true,
  note       text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.coupon_uses (
  code    text not null references public.coupons(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now(),
  primary key (code, user_id)
);
create index if not exists coupon_uses_user on public.coupon_uses(user_id);
create table if not exists public.coupon_fails (   -- wrong codes: 10 in 10 minutes and the next try waits
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists coupon_fails_user on public.coupon_fails(user_id, at);
create table if not exists public.room_blocks (    -- a host whose public room an admin closed: no listing until then
  host   uuid primary key references auth.users(id) on delete cascade,
  until  timestamptz not null,
  reason text,
  by_id  uuid references auth.users(id) on delete set null,
  at     timestamptz not null default now()
);
alter table public.mails        enable row level security;   -- (no policies: through the functions only)
alter table public.mail_targets enable row level security;
alter table public.mail_claims  enable row level security;
alter table public.coupons      enable row level security;
alter table public.coupon_uses  enable row level security;
alter table public.coupon_fails enable row level security;
alter table public.room_blocks  enable row level security;
revoke all on table public.mails from public, anon, authenticated;
revoke all on table public.mail_targets from public, anon, authenticated;
revoke all on table public.mail_claims from public, anon, authenticated;
revoke all on table public.coupons from public, anon, authenticated;
revoke all on table public.coupon_uses from public, anon, authenticated;
revoke all on table public.coupon_fails from public, anon, authenticated;
revoke all on table public.room_blocks from public, anon, authenticated;

-- the caller when an owner (staff: owner_only)
create or replace function public.qz_admin_owner() returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_uid();
begin
  if (select a.role from public.admins a where a.user_id = uid) is distinct from 'owner' then raise exception 'owner_only'; end if;
  return uid;
end $$;
-- a player named the way an admin would: an account id, an e-mail, a friend code or a nickname only one player has (else null)
create or replace function public.qz_admin_find(p_who text) returns uuid
language plpgsql stable security definer set search_path = '' as $$
declare
  w text := btrim(coalesce(p_who, ''));
  c text := upper(regexp_replace(btrim(coalesce(p_who, '')), '[^A-Za-z0-9]', '', 'g'));
  r uuid;
begin
  if w = '' then return null; end if;
  if w ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    r := (select t.id from public.profiles t where t.id = w::uuid);
    if r is not null then return r; end if;
  end if;
  if position('@' in w) > 0 then
    r := (select u.id from auth.users u where lower(u.email) = lower(w));
    if r is not null then return r; end if;
  end if;
  if char_length(c) = 6 then
    r := (select t.id from public.profiles t where t.fcode = c);
    if r is not null then return r; end if;
  end if;
  if (select count(*) from public.profiles t where lower(t.nickname) = lower(w)) = 1 then
    r := (select t.id from public.profiles t where lower(t.nickname) = lower(w));
  end if;
  return r;
end $$;

-- a reward bundle as mail and coupons carry it, cleaned: whole amounts in range, the guns ones that exist and that not everyone has
-- already (at most 10); nothing in it: bad_rewards
create or replace function public.qz_rewards_clean(rw jsonb) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  r jsonb := '{}'::jsonb;
  k text;
  cap bigint;
  v numeric;
  g jsonb;
begin
  if rw is null or jsonb_typeof(rw) <> 'object' then raise exception 'bad_rewards'; end if;
  for k, cap in select x.k, x.c from (values ('coins', 10000000::bigint), ('frags', 100000::bigint), ('tfrags', 10000::bigint), ('tickets', 1000::bigint), ('season_tickets', 1000::bigint)) x(k, c) loop
    if rw ? k and jsonb_typeof(rw -> k) <> 'null' then
      if jsonb_typeof(rw -> k) <> 'number' then raise exception 'bad_rewards'; end if;
      v := (rw ->> k)::numeric;
      if v < 0 or v > cap or v <> floor(v) then raise exception 'bad_rewards'; end if;
      if v > 0 then r := r || jsonb_build_object(k, v::bigint); end if;
    end if;
  end loop;
  if rw ? 'guns' and jsonb_typeof(rw -> 'guns') not in ('array', 'null') then raise exception 'bad_rewards'; end if;
  g := coalesce((select jsonb_agg(distinct x.g) from jsonb_array_elements_text(case when jsonb_typeof(rw -> 'guns') = 'array' then rw -> 'guns' else '[]'::jsonb end) x(g)), '[]'::jsonb);
  if jsonb_array_length(g) > 10 then raise exception 'bad_rewards'; end if;
  if exists (select 1 from jsonb_array_elements_text(g) x(g) where not exists (select 1 from public.gun_prices p where p.gun_id = x.g and not p.free)) then raise exception 'no_gun'; end if;
  if jsonb_array_length(g) > 0 then r := r || jsonb_build_object('guns', g); end if;
  if r = '{}'::jsonb then raise exception 'bad_rewards'; end if;
  return r;
end $$;
-- a cleaned bundle given to a player (the caller holds their profile row): amounts added (capped), guns put on the account — one they
-- own already is listed in had — and the coins on the coin log
create or replace function public.qz_give(uid uuid, rw jsonb, why text, det jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  c bigint := coalesce((rw ->> 'coins')::bigint, 0);
  f bigint := coalesce((rw ->> 'frags')::bigint, 0);
  tf bigint := coalesce((rw ->> 'tfrags')::bigint, 0);
  tk bigint := coalesce((rw ->> 'tickets')::bigint, 0);
  st bigint := coalesce((rw ->> 'season_tickets')::bigint, 0);
  g text;
  got jsonb := '[]'::jsonb;
  had jsonb := '[]'::jsonb;
begin
  update public.profiles set coins = least(coins::bigint + c, 2000000000), fragments = least(fragments::bigint + f, 2000000000),
    trans_frags = least(trans_frags::bigint + tf, 2000000000), dec_tickets = least(dec_tickets::bigint + tk, 2000000000),
    season_tickets = least(season_tickets::bigint + st, 2000000000) where id = uid;
  if c > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, least(c, 2000000000)::integer, why, det); end if;
  for g in select x.g from jsonb_array_elements_text(coalesce(rw -> 'guns', '[]'::jsonb)) x(g) loop
    insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, g, 0) on conflict do nothing;
    if found then got := got || to_jsonb(g); else had := had || to_jsonb(g); end if;
  end loop;
  return jsonb_build_object('coins', c, 'frags', f, 'tfrags', tf, 'tickets', tk, 'season_tickets', st, 'guns', got, 'had', had);
end $$;

-- the mail waiting for a player: active, not expired, not taken yet, sent to everyone (an account made after it only when for_new) or to them
create or replace function public.qz_mail_open(uid uuid) returns setof public.mails
language sql stable security definer set search_path = '' as $$
  select m.* from public.mails m
  where m.active and (m.expires_at is null or m.expires_at > now())
    -- (v6.74: an account made again by someone whose deleted account is remembered gets no mail meant for new accounts)
    and case when m.to_all then (m.for_new and not coalesce((select p.reborn from public.profiles p where p.id = uid), false))
          or (select p.created_at from public.profiles p where p.id = uid) <= m.created_at
        else exists (select 1 from public.mail_targets t where t.mail_id = m.id and t.user_id = uid) end
    and not exists (select 1 from public.mail_claims c where c.mail_id = m.id and c.user_id = uid)
$$;
-- my mailbox (newest first)
create or replace function public.qz_mails() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'body', m.body, 'rewards', m.rewards, 'at', m.created_at,
      'expires_at', m.expires_at) order by m.id desc) from public.qz_mail_open(uid) m), '[]'::jsonb);
end $$;
-- take one letter (p_id) or all of them: their rewards on the account, each letter once
create or replace function public.qz_mail_claim(p_id bigint default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  m public.mails;
  r jsonb;
  t jsonb := jsonb_build_object('coins', 0, 'frags', 0, 'tfrags', 0, 'tickets', 0, 'season_tickets', 0, 'guns', '[]'::jsonb, 'had', '[]'::jsonb);
  ids jsonb := '[]'::jsonb;
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  for m in select x.* from public.qz_mail_open(uid) x where p_id is null or x.id = p_id order by x.id loop
    insert into public.mail_claims (mail_id, user_id) values (m.id, uid) on conflict do nothing;
    if not found then continue; end if;
    r := public.qz_give(uid, m.rewards, 'mail', jsonb_build_object('mail', m.id, 'title', m.title));
    t := jsonb_build_object('coins', (t ->> 'coins')::bigint + (r ->> 'coins')::bigint, 'frags', (t ->> 'frags')::bigint + (r ->> 'frags')::bigint,
      'tfrags', (t ->> 'tfrags')::bigint + (r ->> 'tfrags')::bigint, 'tickets', (t ->> 'tickets')::bigint + (r ->> 'tickets')::bigint,
      'season_tickets', (t ->> 'season_tickets')::bigint + (r ->> 'season_tickets')::bigint, 'guns', (t -> 'guns') || (r -> 'guns'), 'had', (t -> 'had') || (r -> 'had'));
    ids := ids || to_jsonb(m.id);
  end loop;
  if p_id is not null and jsonb_array_length(ids) = 0 then raise exception 'no_mail'; end if;
  p := (select x from public.profiles x where x.id = uid);
  return jsonb_build_object('claimed', ids, 'got', t, 'coins', p.coins, 'fragments', p.fragments, 'tfrags', p.trans_frags, 'tickets', p.dec_tickets,
    'season_tickets', p.season_tickets, 'owned', coalesce((select jsonb_agg(o.gun_id) from public.owned_guns o where o.user_id = uid), '[]'::jsonb),
    'left', (select count(*) from public.qz_mail_open(uid)));
end $$;
-- a coupon code (case, spaces and dashes do not matter). A wrong code counts against the account (10 in 10 minutes: coupon_slow);
-- the refusals come back as {error} so that count is kept.
create or replace function public.qz_coupon_redeem(p_code text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  c text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  k public.coupons;
  r jsonb;
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  if (select count(*) from public.coupon_fails f where f.user_id = uid and f.at > now() - interval '10 minutes') >= 10 then
    return jsonb_build_object('error', 'coupon_slow');
  end if;
  perform 1 from public.coupons where code = c for update;
  k := (select x from public.coupons x where x.code = c);
  if k.code is null then
    insert into public.coupon_fails (user_id) values (uid);
    delete from public.coupon_fails where user_id = uid and at < now() - interval '1 day';
    return jsonb_build_object('error', 'coupon_not_found');
  end if;
  if not k.active then return jsonb_build_object('error', 'coupon_off'); end if;
  if k.starts_at > now() then return jsonb_build_object('error', 'coupon_not_started'); end if;
  if k.expires_at is not null and k.expires_at <= now() then return jsonb_build_object('error', 'coupon_expired'); end if;
  if exists (select 1 from public.coupon_uses u where u.code = c and u.user_id = uid) then return jsonb_build_object('error', 'coupon_used'); end if;
  if k.max_uses is not null and k.uses >= k.max_uses then return jsonb_build_object('error', 'coupon_soldout'); end if;
  insert into public.coupon_uses (code, user_id) values (c, uid);
  update public.coupons set uses = uses + 1 where code = c;
  r := public.qz_give(uid, k.rewards, 'coupon', jsonb_build_object('code', c));
  p := (select x from public.profiles x where x.id = uid);
  return jsonb_build_object('code', c, 'got', r, 'coins', p.coins, 'fragments', p.fragments, 'tfrags', p.trans_frags, 'tickets', p.dec_tickets,
    'season_tickets', p.season_tickets, 'owned', coalesce((select jsonb_agg(o.gun_id) from public.owned_guns o where o.user_id = uid), '[]'::jsonb));
end $$;

-- mail (owner): send one (p_row: title, body, rewards, to_all, for_new, expires_at, who = [the players, named as qz_admin_find takes them]),
-- the ones sent (how many it went to, how many took it), one switched off or on again
create or replace function public.qz_admin_mail_send(p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  ti text := left(btrim(regexp_replace(coalesce(p_row ->> 'title', ''), '[[:cntrl:]]', ' ', 'g')), 60);
  bo text := left(coalesce(p_row ->> 'body', ''), 500);
  rw jsonb := public.qz_rewards_clean(p_row -> 'rewards');
  al boolean := coalesce((p_row ->> 'to_all')::boolean, false);
  fn boolean := coalesce((p_row ->> 'for_new')::boolean, false);
  ex timestamptz := nullif(p_row ->> 'expires_at', '')::timestamptz;
  w text;
  t uuid;
  ids uuid[] := '{}';
  bad text[] := '{}';
  mid bigint;
begin
  if char_length(ti) < 1 then raise exception 'bad_title'; end if;
  if ex is not null and ex <= now() then raise exception 'bad_range'; end if;
  if not al then
    if jsonb_typeof(p_row -> 'who') <> 'array' then raise exception 'no_target'; end if;
    for w in select x.w from jsonb_array_elements_text(p_row -> 'who') x(w) where btrim(x.w) <> '' loop
      t := public.qz_admin_find(w);
      if t is null then bad := bad || btrim(w); elsif not (t = any(ids)) then ids := ids || t; end if;
    end loop;
    if cardinality(bad) > 0 then raise exception 'who_not_found' using detail = array_to_string(bad, ', '); end if;
    if cardinality(ids) = 0 then raise exception 'no_target'; end if;
    if cardinality(ids) > 1000 then raise exception 'too_many_targets'; end if;
  end if;
  mid := nextval(pg_get_serial_sequence('public.mails', 'id'));
  insert into public.mails (id, title, body, rewards, to_all, for_new, expires_at, created_by) overriding system value
  values (mid, ti, bo, rw, al, al and fn, ex, uid);
  if not al then insert into public.mail_targets (mail_id, user_id) select mid, x from unnest(ids) x on conflict do nothing; end if;
  perform public.qz_admin_note(uid, 'mail_send', case when cardinality(ids) = 1 then ids[1] end,
    jsonb_build_object('id', mid, 'title', ti, 'to_all', al, 'n', case when al then null else cardinality(ids) end, 'rewards', rw), null);
  return jsonb_build_object('id', mid, 'to_all', al, 'n', cardinality(ids));
end $$;
create or replace function public.qz_admin_mails() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'body', m.body, 'rewards', m.rewards, 'to_all', m.to_all, 'for_new', m.for_new,
      'expires_at', m.expires_at, 'active', m.active, 'at', m.created_at, 'by', (select x.nickname from public.profiles x where x.id = m.created_by),
      'sent', case when m.to_all then (select count(*) from public.profiles p where m.for_new or p.created_at <= m.created_at)
              else (select count(*) from public.mail_targets t where t.mail_id = m.id) end,
      'claimed', (select count(*) from public.mail_claims c where c.mail_id = m.id),
      'names', case when m.to_all then null else (select jsonb_agg(x.nickname) from (select p.nickname from public.mail_targets t join public.profiles p on p.id = t.user_id
        where t.mail_id = m.id order by p.nickname limit 5) x) end) order by m.id desc)
    from (select y.* from public.mails y order by y.id desc limit 100) m), '[]'::jsonb);
end $$;
create or replace function public.qz_admin_mail_active(p_id bigint, p_on boolean) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  ti text;
begin
  ti := (select m.title from public.mails m where m.id = p_id);
  if ti is null then raise exception 'no_mail'; end if;
  update public.mails set active = coalesce(p_on, false) where id = p_id;
  perform public.qz_admin_note(uid, case when coalesce(p_on, false) then 'mail_on' else 'mail_off' end, null, jsonb_build_object('id', p_id, 'title', ti), null);
  return public.qz_admin_mails();
end $$;

-- coupons (owner): the list, one made (p_row.code empty: a random 10-character one) or changed (its rewards only while nobody has used it),
-- who used one
create or replace function public.qz_admin_coupons() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('code', k.code, 'rewards', k.rewards, 'max_uses', k.max_uses, 'uses', k.uses, 'starts_at', k.starts_at,
      'expires_at', k.expires_at, 'active', k.active, 'note', k.note, 'at', k.created_at, 'by', (select x.nickname from public.profiles x where x.id = k.created_by),
      'live', k.active and k.starts_at <= now() and (k.expires_at is null or k.expires_at > now()) and (k.max_uses is null or k.uses < k.max_uses)) order by k.created_at desc)
    from (select y.* from public.coupons y order by y.created_at desc limit 200) k), '[]'::jsonb);
end $$;
create or replace function public.qz_admin_coupon_save(p_row jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  isnew boolean := coalesce((p_row ->> 'new')::boolean, false);
  c text := upper(regexp_replace(coalesce(p_row ->> 'code', ''), '[^A-Za-z0-9]', '', 'g'));
  o public.coupons;
  rw jsonb;
  mx integer := nullif(p_row ->> 'max_uses', '')::integer;
  st timestamptz := coalesce(nullif(p_row ->> 'starts_at', '')::timestamptz, now());
  en timestamptz := nullif(p_row ->> 'expires_at', '')::timestamptz;
  ac boolean := coalesce((p_row ->> 'active')::boolean, true);
  nt text := nullif(left(btrim(coalesce(p_row ->> 'note', '')), 100), '');
  abc text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  if mx is not null and mx < 1 then raise exception 'bad_value'; end if;
  if en is not null and en <= st then raise exception 'bad_range'; end if;
  if isnew then
    if c = '' then
      loop
        c := '';
        for i in 1..10 loop c := c || substr(abc, 1 + floor(random() * 31)::integer, 1); end loop;
        exit when not exists (select 1 from public.coupons k where k.code = c);
      end loop;
    end if;
    if c !~ '^[A-Z0-9]{4,20}$' then raise exception 'bad_code'; end if;
    if exists (select 1 from public.coupons k where k.code = c) then raise exception 'coupon_exists'; end if;
    rw := public.qz_rewards_clean(p_row -> 'rewards');
    insert into public.coupons (code, rewards, max_uses, starts_at, expires_at, active, note, created_by) values (c, rw, mx, st, en, ac, nt, uid);
    perform public.qz_admin_note(uid, 'coupon_add', null, jsonb_build_object('code', c, 'rewards', rw, 'max_uses', mx), null);
  else
    o := (select k from public.coupons k where k.code = c);
    if o.code is null then raise exception 'coupon_not_found'; end if;
    rw := o.rewards;
    if p_row ? 'rewards' and o.uses = 0 then rw := public.qz_rewards_clean(p_row -> 'rewards'); end if;
    update public.coupons set rewards = rw, max_uses = mx, starts_at = st, expires_at = en, active = ac, note = nt where code = c;
    perform public.qz_admin_note(uid, 'coupon_edit', null, jsonb_build_object('code', c, 'active', ac, 'max_uses', mx), null);
  end if;
  return public.qz_admin_coupons();
end $$;
create or replace function public.qz_admin_coupon_uses(p_code text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', u.user_id, 'nickname', p.nickname, 'at', u.at) order by u.at desc)
    from (select y.* from public.coupon_uses y where y.code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')) order by y.at desc limit 300) u
    join public.profiles p on p.id = u.user_id), '[]'::jsonb);
end $$;

-- staff (owner): everyone in admins; a player made staff (an owner only in the SQL Editor); staff taken off (an owner stays)
create or replace function public.qz_admin_staff() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := public.qz_admin_owner();
begin
  return coalesce((select jsonb_agg(jsonb_build_object('id', a.user_id, 'role', a.role, 'added_at', a.added_at, 'nickname', p.nickname, 'fcode', p.fcode,
      'email', (select u.email from auth.users u where u.id = a.user_id), 'last_seen', p.last_seen, 'me', a.user_id = uid,
      'acts', (select count(*) from public.admin_log l where l.admin_id = a.user_id)) order by a.role desc, a.added_at)
    from public.admins a left join public.profiles p on p.id = a.user_id), '[]'::jsonb);
end $$;
create or replace function public.qz_admin_staff_add(p_who text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  t uuid := public.qz_admin_find(p_who);
begin
  if t is null then raise exception 'not_found'; end if;
  if exists (select 1 from public.admins a where a.user_id = t) then raise exception 'already_admin'; end if;
  if (select p.banned_until from public.profiles p where p.id = t) > now() then raise exception 'staff_banned'; end if;
  insert into public.admins (user_id, role) values (t, 'staff');
  perform public.qz_admin_note(uid, 'staff_add', t, null, null);
  return public.qz_admin_staff();
end $$;
create or replace function public.qz_admin_staff_remove(p_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  r text := (select a.role from public.admins a where a.user_id = p_id);
begin
  if r is null then raise exception 'not_staff'; end if;
  if r = 'owner' then raise exception 'owner_fixed'; end if;
  delete from public.admins where user_id = p_id and role = 'staff';
  perform public.qz_admin_note(uid, 'staff_remove', p_id, null, null);
  return public.qz_admin_staff();
end $$;

-- a public room off the list (staff too): its host cannot list one again for p_minutes (10 .. 7 days; the game keeps the room going
-- privately and tells the host)
create or replace function public.qz_admin_room_close(p_code text, p_minutes integer, p_reason text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  rsn text := public.qz_admin_reason(p_reason);
  r public.rooms;
  mins integer := least(greatest(coalesce(p_minutes, 30), 10), 10080);
begin
  r := (select x from public.rooms x where x.code = upper(left(coalesce(p_code, ''), 8)));
  if r.code is null then raise exception 'no_room'; end if;
  insert into public.room_blocks (host, until, reason, by_id) values (r.host, now() + make_interval(mins => mins), rsn, uid)
  on conflict (host) do update set until = excluded.until, reason = excluded.reason, by_id = excluded.by_id, at = now();
  delete from public.rooms where code = r.code;
  perform public.qz_admin_note(uid, 'room_close', r.host, jsonb_build_object('code', r.code, 'host_name', r.host_name, 'minutes', mins), rsn);
  return jsonb_build_object('ok', true, 'until', now() + make_interval(mins => mins));
end $$;

-- players worth a look (staff too), by p_kind: cap (days the reward limit was reached, last 14 days), kills (the most kills in one
-- match), damage (the most damage in one round), rate (coins per hour of play, at least an hour played, last 14 days), refs (players
-- who brought in many accounts in the last 30 days, and how many of those barely played). 30 at most.
-- v6.65: cut (the accounts whose matches or rounds sent more than play allows — qz_claim / qz_round_claim cut them; how often in the
-- last 14 days and the last cut), score (the highest score sent for one match; the numbers as sent, before any cut)
create or replace function public.qz_admin_suspects(p_kind text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  t14 timestamptz := now() - interval '14 days';
  rm integer := coalesce((select c.ref_matches from public.gacha_config c where c.id = 1), 3);
begin
  if p_kind = 'cut' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.user_id, 'nickname', p.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
        'n', q.n, 'at', q.at, 'cut', q.cut) order by q.n desc, q.at desc)
      from (select c.user_id, count(*) as n, max(c.at) as at,
              (select c2.detail -> 'cut' from public.coin_log c2 where c2.user_id = c.user_id and c2.at >= t14 and c2.detail ? 'cut' order by c2.at desc limit 1) as cut
            from public.coin_log c where c.at >= t14 and c.reason in ('match', 'round') and c.detail ? 'cut'
            group by c.user_id order by 2 desc, 3 desc limit 30) q
      join public.profiles p on p.id = q.user_id), '[]'::jsonb));
  elsif p_kind = 'score' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.user_id, 'nickname', p.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
        'at', q.at, 'mode', q.mode, 'score', q.score, 'kills', q.kills, 'damage', q.damage, 'mins', q.mins, 'cut', q.cut) order by q.score desc)
      from (select c.user_id, c.at, c.detail ->> 'mode' as mode, (c.detail ->> 'score')::integer as score, (c.detail ->> 'kills')::integer as kills,
              (c.detail ->> 'damage')::integer as damage, (c.detail ->> 'mins')::numeric as mins, c.detail ? 'cut' as cut
            from public.coin_log c where c.at >= t14 and c.reason = 'match' and c.detail ? 'score'
            order by 4 desc nulls last limit 30) q
      join public.profiles p on p.id = q.user_id), '[]'::jsonb),
      'avg', (select round(avg((c.detail ->> 'score')::numeric), 1) from public.coin_log c where c.at >= t14 and c.reason = 'match' and c.detail ? 'score'),
      'n', (select count(*) from public.coin_log c where c.at >= t14 and c.reason = 'match'));
  elsif p_kind = 'cap' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.user_id, 'nickname', p.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
        'days', q.days, 'earned', q.earned, 'best', q.best) order by q.days desc, q.earned desc)
      from (select d.user_id, count(*) filter (where d.e >= 19500) as days, sum(d.e) as earned, max(d.e) as best
            from (select c.user_id, (c.at at time zone 'Asia/Seoul')::date as day, sum(c.delta) as e from public.coin_log c
                  where c.at >= t14 and c.reason in ('match', 'round') group by 1, 2) d
            group by d.user_id having count(*) filter (where d.e >= 19500) > 0 order by 2 desc, 3 desc limit 30) q
      join public.profiles p on p.id = q.user_id), '[]'::jsonb));
  elsif p_kind = 'kills' or p_kind = 'damage' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.user_id, 'nickname', p.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
        'at', q.at, 'mode', q.mode, 'kills', q.kills, 'damage', q.damage, 'rounds', q.rounds, 'coins', q.delta) order by q.v desc)
      from (select c.user_id, c.at, c.detail ->> 'mode' as mode, (c.detail ->> 'kills')::integer as kills, (c.detail ->> 'damage')::integer as damage,
              coalesce((c.detail ->> 'rounds')::integer, (c.detail ->> 'round')::integer) as rounds, c.delta,
              case when p_kind = 'kills' then (c.detail ->> 'kills')::integer else (c.detail ->> 'damage')::integer end as v
            from public.coin_log c where c.at >= t14 and c.reason = case when p_kind = 'kills' then 'match' else 'round' end and c.detail ? 'kills'
            order by v desc nulls last limit 30) q
      join public.profiles p on p.id = q.user_id), '[]'::jsonb),
      'avg', (select round(avg(case when p_kind = 'kills' then (c.detail ->> 'kills')::numeric else (c.detail ->> 'damage')::numeric end), 1) from public.coin_log c
        where c.at >= t14 and c.reason = case when p_kind = 'kills' then 'match' else 'round' end and c.detail ? 'kills'),
      'n', (select count(*) from public.coin_log c where c.at >= t14 and c.reason = case when p_kind = 'kills' then 'match' else 'round' end));
  elsif p_kind = 'rate' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', z.user_id, 'nickname', z.nickname, 'fcode', z.fcode, 'banned', z.banned,
        'earned', z.earned, 'play', z.play, 'rate', z.rate) order by z.rate desc)
      from (select q.user_id, p.nickname, p.fcode, coalesce(p.banned_until > now(), false) as banned, q.earned, q.play, round(q.earned / (q.play / 3600.0)) as rate
            from (select a.user_id, a.play, coalesce((select sum(c.delta) from public.coin_log c where c.user_id = a.user_id and c.at >= t14
                      and c.reason in ('match', 'round', 'mission')), 0) as earned
                  from (select d.user_id, sum(d.play_secs) as play from public.daily_activity d where d.day >= ((now() at time zone 'Asia/Seoul')::date - 13)
                        group by d.user_id having sum(d.play_secs) >= 3600) a) q
            join public.profiles p on p.id = q.user_id where q.earned > 0 order by 7 desc limit 30) z), '[]'::jsonb));
  elsif p_kind = 'refs' then
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.referrer, 'nickname', p.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
        'n', q.n, 'thin', q.thin, 'paid', q.paid) order by q.n desc)
      from (select r.referrer, count(*) as n, count(*) filter (where p2.matches <= rm) as thin, count(*) filter (where r.rewarded) as paid
            from public.referrals r join public.profiles p2 on p2.id = r.referee where r.at >= now() - interval '30 days'
            group by r.referrer order by 2 desc limit 30) q
      join public.profiles p on p.id = q.referrer), '[]'::jsonb), 'ref_matches', rm);
  elsif p_kind = 'hof' then
    -- (v6.74) the hall of fame: each chapter × difficulty's first-clear team, its clear time and the shortest the server takes now (min);
    -- src: match (made by a claim), past (moved over from before v6.24), refill (put back by qz_admin_hof_del)
    return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('ep', f.ep, 'diff', f.diff, 'at', f.at, 'time', f.clear_time,
        'min', public.qz_ep_min(f.ep, f.diff), 'src', case when f.match_id like 'past:%' then 'past' when f.match_id like 'refill:%' then 'refill' else 'match' end,
        'team', coalesce((select jsonb_agg(jsonb_build_object('id', m.user_id, 'nickname', t.nickname, 'fcode', t.fcode,
            'banned', coalesce(t.banned_until > now(), false)) order by m.at, t.nickname)
          from public.ep_first_members m join public.profiles t on t.id = m.user_id where m.ep = f.ep and m.diff = f.diff), '[]'::jsonb))
        order by f.ep, f.diff) from public.ep_firsts f), '[]'::jsonb));
  end if;
  raise exception 'bad_kind';
end $$;
-- v6.74: take a hall-of-fame record down (the owner only — a clear that was made up, say). p_refill: the earliest clear left of that
-- chapter × difficulty on the players' own records (ep_records.first_at; accounts not suspended, none of the team taken down) takes its
-- place, with the accounts whose own first clear came within 3 minutes of it (one match), 8 at most; no time shown for it. The admin log
-- keeps the old record (its team as account ids).
create or replace function public.qz_admin_hof_del(p_ep integer, p_diff integer, p_refill boolean default false, p_reason text default '') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  rsn text := public.qz_admin_reason(p_reason);
  f public.ep_firsts;
  v_team uuid[];
  v_at timestamptz;
  v_n integer := 0;
begin
  f := (select x from public.ep_firsts x where x.ep = p_ep and x.diff = p_diff);
  if f.ep is null then raise exception 'no_record'; end if;
  v_team := coalesce((select array_agg(m.user_id) from public.ep_first_members m where m.ep = p_ep and m.diff = p_diff), '{}'::uuid[]);
  delete from public.ep_firsts where ep = p_ep and diff = p_diff;
  if coalesce(p_refill, false) then
    v_at := (select min(r.first_at) from public.ep_records r join public.profiles t on t.id = r.user_id
      where r.ep = p_ep and r.diff = p_diff and r.first_at is not null and not (r.user_id = any(v_team))
        and (t.banned_until is null or t.banned_until <= now()));
    if v_at is not null then
      insert into public.ep_firsts (ep, diff, match_id, at, clear_time) values (p_ep, p_diff, 'refill:', v_at, null);
      insert into public.ep_first_members (ep, diff, user_id, at)
      select r.ep, r.diff, r.user_id, r.first_at from public.ep_records r join public.profiles t on t.id = r.user_id
      where r.ep = p_ep and r.diff = p_diff and r.first_at >= v_at and r.first_at <= v_at + interval '3 minutes' and not (r.user_id = any(v_team))
        and (t.banned_until is null or t.banned_until <= now())
      order by r.first_at limit 8
      on conflict do nothing;
      v_n := (select count(*) from public.ep_first_members m where m.ep = p_ep and m.diff = p_diff);
    end if;
  end if;
  perform public.qz_admin_note(uid, 'hof_del', null, jsonb_build_object('ep', p_ep, 'diff', p_diff, 'at', f.at, 'time', f.clear_time,
    'team', to_jsonb(v_team), 'refill', v_n), rsn);
  return jsonb_build_object('ok', true, 'refill', v_n);
end $$;

revoke all on function public.qz_admin_owner() from public, anon, authenticated;
revoke all on function public.qz_admin_find(text) from public, anon, authenticated;
revoke all on function public.qz_rewards_clean(jsonb) from public, anon, authenticated;
revoke all on function public.qz_give(uuid, jsonb, text, jsonb) from public, anon, authenticated;
revoke all on function public.qz_mail_open(uuid) from public, anon, authenticated;
revoke all on function public.qz_mails() from public, anon;
revoke all on function public.qz_mail_claim(bigint) from public, anon;
revoke all on function public.qz_coupon_redeem(text) from public, anon;
revoke all on function public.qz_admin_mail_send(jsonb) from public, anon;
revoke all on function public.qz_admin_mails() from public, anon;
revoke all on function public.qz_admin_mail_active(bigint, boolean) from public, anon;
revoke all on function public.qz_admin_coupons() from public, anon;
revoke all on function public.qz_admin_coupon_save(jsonb) from public, anon;
revoke all on function public.qz_admin_coupon_uses(text) from public, anon;
revoke all on function public.qz_admin_staff() from public, anon;
revoke all on function public.qz_admin_staff_add(text) from public, anon;
revoke all on function public.qz_admin_staff_remove(uuid) from public, anon;
revoke all on function public.qz_admin_room_close(text, integer, text) from public, anon;
revoke all on function public.qz_admin_suspects(text) from public, anon;
revoke all on function public.qz_admin_hof_del(integer, integer, boolean, text) from public, anon;
grant execute on function public.qz_admin_hof_del(integer, integer, boolean, text) to authenticated;
grant execute on function public.qz_mails() to authenticated;
grant execute on function public.qz_mail_claim(bigint) to authenticated;
grant execute on function public.qz_coupon_redeem(text) to authenticated;
grant execute on function public.qz_admin_mail_send(jsonb) to authenticated;
grant execute on function public.qz_admin_mails() to authenticated;
grant execute on function public.qz_admin_mail_active(bigint, boolean) to authenticated;
grant execute on function public.qz_admin_coupons() to authenticated;
grant execute on function public.qz_admin_coupon_save(jsonb) to authenticated;
grant execute on function public.qz_admin_coupon_uses(text) to authenticated;
grant execute on function public.qz_admin_staff() to authenticated;
grant execute on function public.qz_admin_staff_add(text) to authenticated;
grant execute on function public.qz_admin_staff_remove(uuid) to authenticated;
grant execute on function public.qz_admin_room_close(text, integer, text) to authenticated;
grant execute on function public.qz_admin_suspects(text) to authenticated;

-- ---------- v6.46: a weapon an admin put straight on an account is announced in the game ----------
-- (a letter or a coupon with a gun shows its window right when it is taken; this is for the admin page's 「무기 → 지급」, which skips the mailbox)
create table if not exists public.gun_notices (
  id      bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  gun_id  text not null,
  src     text not null default 'admin',
  at      timestamptz not null default now(),
  seen    boolean not null default false
);
create index if not exists gun_notices_open on public.gun_notices (user_id) where not seen;
alter table public.gun_notices enable row level security;
revoke all on public.gun_notices from anon, authenticated;

-- my weapon notices not shown yet, newest first
create or replace function public.qz_gun_notices() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'gun', q.gun_id, 'src', q.src, 'at', q.at) order by q.id desc)
    from (select n.id, n.gun_id, n.src, n.at from public.gun_notices n where n.user_id = uid and not n.seen order by n.id desc limit 20) q), '[]'::jsonb);
end $$;
-- shown (p_ids null: every one of mine)
create or replace function public.qz_gun_seen(p_ids bigint[] default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
  n integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  update public.gun_notices set seen = true where user_id = uid and not seen and (p_ids is null or id = any(p_ids));
  get diagnostics n = row_count;
  delete from public.gun_notices where user_id = uid and seen and at < now() - interval '30 days';
  return jsonb_build_object('seen', n);
end $$;
revoke all on function public.qz_gun_notices() from public, anon;
revoke all on function public.qz_gun_seen(bigint[]) from public, anon;
grant execute on function public.qz_gun_notices() to authenticated;
grant execute on function public.qz_gun_seen(bigint[]) to authenticated;

-- ---------- v6.65: the game's error log (관리자 페이지 「오류 기록」) ----------
-- An error on a player's page (one nobody caught, a promise left failing, a frame or the boot that failed, one the game caught and only
-- logged) is sent here once per page and kind (errlog.js in the game), without anything about the player: the message, the first lines
-- of the stack, where it came from, the game's version, a little context (mode, map, the match's state, host or guest) and the browser.
-- The same error (fp: version + where + message + the top of the stack) is counted, not stored again. At most 2,000 kinds (the ones
-- seen longest ago go first) and 600 reports a minute from all pages together. Anyone may send (anon too); only admins read and clear.
create table if not exists public.err_log (
  fp       text primary key,
  msg      text not null,
  stack    text,
  src      text,
  ver      text,
  ctx      jsonb,
  ua       text,
  n        integer not null default 1,
  first_at timestamptz not null default now(),
  last_at  timestamptz not null default now()
);
create index if not exists err_log_last on public.err_log (last_at desc);
alter table public.err_log enable row level security;
revoke all on public.err_log from anon, authenticated;
-- reports per minute, all pages together (rows older than an hour are cleared as they go)
create table if not exists public.err_rate (
  at timestamptz primary key,
  n  integer not null default 0
);
alter table public.err_rate enable row level security;
revoke all on public.err_rate from anon, authenticated;

-- one report from a page: {ok} (false when the message is empty or the minute's reports are used up)
create or replace function public.qz_err_report(p_msg text, p_stack text default null, p_src text default null, p_ver text default null,
  p_ctx jsonb default null, p_ua text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  m timestamptz := date_trunc('minute', now());
  v_n integer;
  -- (v6.71: every text cut to a few times its kept length before any work on it — anyone may call this)
  v_msg text := left(btrim(regexp_replace(left(coalesce(p_msg, ''), 1200), '[[:cntrl:]]', ' ', 'g')), 300);
  v_stack text := left(regexp_replace(left(coalesce(p_stack, ''), 8000), '[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g'), 2000);
  v_src text := left(regexp_replace(lower(left(coalesce(p_src, ''), 64)), '[^a-z]', '', 'g'), 12);
  v_ver text := left(regexp_replace(left(coalesce(p_ver, ''), 64), '[^A-Za-z0-9.]', '', 'g'), 16);
  v_ua text := left(regexp_replace(left(coalesce(p_ua, ''), 800), '[[:cntrl:]]', ' ', 'g'), 200);
  v_ctx jsonb := case when p_ctx is not null and jsonb_typeof(p_ctx) = 'object' and length(p_ctx::text) <= 600 then p_ctx end;
  v_fp text;
begin
  if char_length(v_msg) < 1 then return jsonb_build_object('ok', false); end if;
  insert into public.err_rate as r (at, n) values (m, 1) on conflict (at) do update set n = r.n + 1;
  v_n := (select r.n from public.err_rate r where r.at = m);
  if v_n = 1 then delete from public.err_rate where at < now() - interval '1 hour'; end if;
  if v_n > 600 then return jsonb_build_object('ok', false); end if;
  v_fp := md5(v_ver || '|' || v_src || '|' || v_msg || '|' || left(v_stack, 400));
  insert into public.err_log as e (fp, msg, stack, src, ver, ctx, ua)
  values (v_fp, v_msg, nullif(v_stack, ''), nullif(v_src, ''), nullif(v_ver, ''), v_ctx, nullif(v_ua, ''))
  on conflict (fp) do update set n = e.n + 1, last_at = now(), ctx = coalesce(excluded.ctx, e.ctx), ua = coalesce(excluded.ua, e.ua);
  v_n := (select count(*) from public.err_log);
  if v_n > 2000 then
    delete from public.err_log where fp in (select x.fp from public.err_log x order by x.last_at limit v_n - 1800);
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- the log for the admin page (staff too): the kinds seen last first (p_limit, 300 at most), how many kinds and reports in all, and how
-- many kinds came in today (Korean time)
create or replace function public.qz_admin_errors(p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  t0 timestamptz := ((now() at time zone 'Asia/Seoul')::date)::timestamp at time zone 'Asia/Seoul';
begin
  return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('fp', q.fp, 'msg', q.msg, 'stack', q.stack, 'src', q.src, 'ver', q.ver,
      'ctx', q.ctx, 'ua', q.ua, 'n', q.n, 'first_at', q.first_at, 'last_at', q.last_at) order by q.last_at desc)
    from (select e.fp, e.msg, e.stack, e.src, e.ver, e.ctx, e.ua, e.n, e.first_at, e.last_at from public.err_log e
          order by e.last_at desc limit least(greatest(coalesce(p_limit, 100), 1), 300)) q), '[]'::jsonb),
    'kinds', (select count(*) from public.err_log),
    'reports', (select coalesce(sum(e.n), 0) from public.err_log e),
    'today', (select count(*) from public.err_log e where e.last_at >= t0));
end $$;
-- clear one kind (p_fp) or the whole log (p_fp null); it goes in the admin log
create or replace function public.qz_admin_err_clear(p_fp text default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  v_n integer;
begin
  if p_fp is null then delete from public.err_log where fp is not null; else delete from public.err_log where fp = p_fp; end if;
  get diagnostics v_n = row_count;
  perform public.qz_admin_note(uid, 'err_clear', null, jsonb_build_object('fp', p_fp, 'n', v_n), null);
  return jsonb_build_object('ok', true, 'n', v_n);
end $$;
revoke all on function public.qz_err_report(text, text, text, text, jsonb, text) from public;
revoke all on function public.qz_admin_errors(integer) from public, anon;
revoke all on function public.qz_admin_err_clear(text) from public, anon;
grant execute on function public.qz_err_report(text, text, text, text, jsonb, text) to anon, authenticated;
grant execute on function public.qz_admin_errors(integer) to authenticated;
grant execute on function public.qz_admin_err_clear(text) to authenticated;

-- ============================================================================================================
-- 문의 (v6.66): the lobby's 문의하기 button writes to the operators (inquiries); the admin page's 「문의」 answers
-- ============================================================================================================
-- Anyone may write (a guest too): a kind (bug 버그 · account 계정 · report 신고 · idea 건의 · etc 기타), 5..1,000 characters, a way to
-- reach them if they like (100 characters) and what the game adds (version, language, browser, screen). A signed-in account: 5 an hour
-- and 20 a day; guests: 60 an hour from all guests together and at most 300 waiting. A banned account may still write (to ask about the
-- ban). The answer comes back in the game under 「내 문의」: a signed-in player's by the account (a dot on the button: qz_me inq_new,
-- qz_ping inq), a guest's by the tickets that browser kept. A closed inquiry goes 180 days after it was closed.
create or replace function public.qz_inquiry_send(p_kind text, p_body text, p_contact text default null, p_ctx jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_kind text := case when p_kind in ('bug', 'account', 'report', 'idea', 'etc') then p_kind else 'etc' end;
  -- (v6.71: the body cut to 4,000 before the work — over 1,000 is refused anyway — and the contact to 400)
  v_body text := btrim(regexp_replace(regexp_replace(replace(left(coalesce(p_body, ''), 4000), E'\r', ''), '[\x01-\x09\x0b-\x1f\x7f]', ' ', 'g'), E'\n{3,}', E'\n\n', 'g'));
  v_contact text := nullif(left(btrim(regexp_replace(left(coalesce(p_contact, ''), 400), '[[:cntrl:]]', ' ', 'g')), 100), '');
  v_ctx jsonb := case when p_ctx is not null and jsonb_typeof(p_ctx) = 'object' and length(p_ctx::text) <= 800 then p_ctx end;
  v_ticket text := replace(gen_random_uuid()::text, '-', '');
  v_id bigint;
begin
  if char_length(v_body) < 5 then raise exception 'inq_short'; end if;
  if char_length(v_body) > 1000 then raise exception 'inq_long'; end if;
  if uid is not null then
    if (select count(*) from public.inquiries q where q.user_id = uid and q.at > now() - interval '1 hour') >= 5
      or (select count(*) from public.inquiries q where q.user_id = uid and q.at > now() - interval '1 day') >= 20 then raise exception 'inq_slow'; end if;
  elsif (select count(*) from public.inquiries q where q.user_id is null and q.at > now() - interval '1 hour') >= 60
    or (select count(*) from public.inquiries q where q.user_id is null and q.status = 'new') >= 300 then raise exception 'inq_busy';
  end if;
  delete from public.inquiries where status = 'done' and done_at < now() - interval '180 days';
  insert into public.inquiries (user_id, ticket, nickname, kind, body, contact, ctx)
  values (uid, v_ticket, (select t.nickname from public.profiles t where t.id = uid), v_kind, v_body, v_contact, v_ctx);
  v_id := (select q.id from public.inquiries q where q.ticket = v_ticket);
  return jsonb_build_object('ok', true, 'id', v_id, 'ticket', v_ticket);
end $$;

-- my inquiries and their answers, newest first (30): a signed-in account's own and the ones whose tickets this browser kept (p_tickets,
-- 30 at most). new = answers not read yet (before this call); p_mark (opening 「내 문의」): from now on they count as read
create or replace function public.qz_my_inquiries(p_tickets text[] default null, p_mark boolean default true) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_t text[] := (select coalesce(array_agg(s.t), '{}'::text[]) from (select distinct x as t from unnest(coalesce(p_tickets, '{}'::text[])) x
    where x ~ '^[0-9a-f]{32}$' limit 30) s);
  v_new integer;
  r jsonb;
begin
  v_new := (select count(*) from public.inquiries q where (q.user_id = uid or q.ticket = any(v_t)) and q.reply is not null and not q.seen);
  r := (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'kind', q.kind, 'body', q.body, 'at', q.at, 'status', q.status,
      'reply', q.reply, 'reply_at', q.reply_at, 'new', q.reply is not null and not q.seen, 'mine', coalesce(q.user_id = uid, false))
      order by q.id desc), '[]'::jsonb)
    from (select x.* from public.inquiries x where x.user_id = uid or x.ticket = any(v_t) order by x.id desc limit 30) q);
  if coalesce(p_mark, true) and v_new > 0 then
    update public.inquiries set seen = true where (user_id = uid or ticket = any(v_t)) and reply is not null and not seen;
  end if;
  return jsonb_build_object('rows', r, 'new', v_new);
end $$;

-- the inquiries for the admin page (staff too; a guest's way to reach them only for the owner): p_status new | done | all, newest first,
-- 100 at a time (p_before: the last id already shown); how many wait, how many are closed, how many came in today (Korean time)
create or replace function public.qz_admin_inquiries(p_status text default 'new', p_before bigint default 0, p_limit integer default 100) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  own boolean := coalesce((select a.role from public.admins a where a.user_id = uid) = 'owner', false);
  st text := case when p_status in ('new', 'done', 'all') then p_status else 'new' end;
  t0 timestamptz := ((now() at time zone 'Asia/Seoul')::date)::timestamp at time zone 'Asia/Seoul';
begin
  return jsonb_build_object('rows', coalesce((select jsonb_agg(jsonb_build_object('id', q.id, 'user_id', q.user_id,
      'nickname', coalesce(p.nickname, q.nickname), 'nick_then', q.nickname, 'fcode', p.fcode, 'banned', coalesce(p.banned_until > now(), false),
      'kind', q.kind, 'body', q.body, 'has_contact', q.contact is not null, 'contact', case when own then q.contact end, 'ctx', q.ctx,
      'status', q.status, 'reply', q.reply, 'reply_at', q.reply_at, 'reply_by', (select b.nickname from public.profiles b where b.id = q.reply_by),
      'seen', q.seen, 'at', q.at, 'done_at', q.done_at, 'done_by', (select b.nickname from public.profiles b where b.id = q.done_by))
      order by q.id desc)
    from (select x.* from public.inquiries x where (st = 'all' or x.status = st) and (coalesce(p_before, 0) <= 0 or x.id < p_before)
          order by x.id desc limit least(greatest(coalesce(p_limit, 100), 1), 200)) q
    left join public.profiles p on p.id = q.user_id), '[]'::jsonb),
    'new', (select count(*) from public.inquiries x where x.status = 'new'),
    'done', (select count(*) from public.inquiries x where x.status = 'done'),
    'today', (select count(*) from public.inquiries x where x.at >= t0),
    'owner', own);
end $$;
-- answer one (1..1,000 characters): the player finds it under 「내 문의」, with a dot on the button. p_done (the default) closes it too.
-- Writing again replaces the answer (it counts as new again). In the admin log.
create or replace function public.qz_admin_inquiry_reply(p_id bigint, p_reply text, p_done boolean default true) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  v_r text := btrim(regexp_replace(replace(coalesce(p_reply, ''), E'\r', ''), '[\x01-\x09\x0b-\x1f\x7f]', ' ', 'g'));
  v_d boolean := coalesce(p_done, true);
  v_u uuid;
begin
  if char_length(v_r) < 1 or char_length(v_r) > 1000 then raise exception 'bad_reply'; end if;
  if not exists (select 1 from public.inquiries q where q.id = p_id) then raise exception 'no_inquiry'; end if;
  v_u := (select q.user_id from public.inquiries q where q.id = p_id);
  update public.inquiries set reply = v_r, reply_at = now(), reply_by = uid, seen = false,
    status = case when v_d then 'done' else status end, done_at = case when v_d then now() else done_at end,
    done_by = case when v_d then uid else done_by end
  where id = p_id;
  perform public.qz_admin_note(uid, 'inq_reply', v_u, jsonb_build_object('id', p_id, 'done', v_d), null);
  return jsonb_build_object('ok', true, 'id', p_id);
end $$;
-- close one without an answer (p_done true) or open it again (false). In the admin log.
create or replace function public.qz_admin_inquiry_done(p_id bigint, p_done boolean default true) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_uid();
  v_d boolean := coalesce(p_done, true);
  v_u uuid;
begin
  if not exists (select 1 from public.inquiries q where q.id = p_id) then raise exception 'no_inquiry'; end if;
  v_u := (select q.user_id from public.inquiries q where q.id = p_id);
  update public.inquiries set status = case when v_d then 'done' else 'new' end, done_at = case when v_d then now() end,
    done_by = case when v_d then uid end
  where id = p_id;
  perform public.qz_admin_note(uid, case when v_d then 'inq_done' else 'inq_open' end, v_u, jsonb_build_object('id', p_id), null);
  return jsonb_build_object('ok', true, 'id', p_id, 'status', case when v_d then 'done' else 'new' end);
end $$;
-- delete one (spam; the owner only). The admin log keeps its kind, not what it said.
create or replace function public.qz_admin_inquiry_del(p_id bigint) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := public.qz_admin_owner();
  v_u uuid;
  v_k text;
begin
  if not exists (select 1 from public.inquiries q where q.id = p_id) then raise exception 'no_inquiry'; end if;
  v_u := (select q.user_id from public.inquiries q where q.id = p_id);
  v_k := (select q.kind from public.inquiries q where q.id = p_id);
  delete from public.inquiries where id = p_id;
  perform public.qz_admin_note(uid, 'inq_del', v_u, jsonb_build_object('id', p_id, 'kind', v_k), null);
  return jsonb_build_object('ok', true, 'id', p_id);
end $$;
revoke all on function public.qz_inquiry_send(text, text, text, jsonb) from public;
revoke all on function public.qz_my_inquiries(text[], boolean) from public;
revoke all on function public.qz_admin_inquiries(text, bigint, integer) from public, anon;
revoke all on function public.qz_admin_inquiry_reply(bigint, text, boolean) from public, anon;
revoke all on function public.qz_admin_inquiry_done(bigint, boolean) from public, anon;
revoke all on function public.qz_admin_inquiry_del(bigint) from public, anon;
grant execute on function public.qz_inquiry_send(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.qz_my_inquiries(text[], boolean) to anon, authenticated;
grant execute on function public.qz_admin_inquiries(text, bigint, integer) to authenticated;
grant execute on function public.qz_admin_inquiry_reply(bigint, text, boolean) to authenticated;
grant execute on function public.qz_admin_inquiry_done(bigint, boolean) to authenticated;
grant execute on function public.qz_admin_inquiry_del(bigint) to authenticated;

-- ============================================================================================================
-- 회원 탈퇴 (v6.67): 내 계정 → 회원 탈퇴 removes the account and everything on it
-- ============================================================================================================
-- Deleting the auth.users row cascades to every table that holds the player (profile, coins and their log, guns, cards, records,
-- achievements, missions, play time, friends and messages, gifts received, invites, referrals, mail and coupon claims, rooms, inquiries …).
-- What stays, no longer tied to anyone: the admin log's lines about the account (with the nickname a rename or a closed room recorded
-- taken out), the gifts it sent (the friend keeps the gun), error reports (never tied to an account). Its nickname is also taken out of
-- the gift and invite-reward lines in other players' coin logs. An admin account cannot (take it off the staff first; an owner through
-- the SQL Editor). p_confirm must be 'delete': the game asks the player to type 탈퇴 (an e-mail account its password too) before it calls.
-- v6.74: before it goes, its e-mail and its Google / Kakao accounts are kept as hashes (deleted_ids, see qz_idhs): 30 days, or until a
-- suspension it is under ends when that is later. Someone signing up again with one of them gets no sign-up rewards and the suspension goes on.
create or replace function public.qz_account_delete(p_confirm text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_nick text;
  v_sid text;
  v_fresh boolean := false;
  v_hs text[];
  v_ban timestamptz;
  v_rsn text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if coalesce(p_confirm, '') <> 'delete' then raise exception 'confirm_needed'; end if;
  if not exists (select 1 from auth.users u where u.id = uid) then raise exception 'not_signed_in'; end if;
  if exists (select 1 from public.admins a where a.user_id = uid) then raise exception 'admin_account'; end if;
  -- v6.72: only a sign-in made in the last 10 minutes may delete (the game asks for the password again, or Google / Kakao again), so a
  -- session carried off from another computer cannot. The session's own start (auth.sessions); where that cannot be read, the
  -- account's last sign-in.
  begin
    v_sid := nullif(auth.jwt() ->> 'session_id', '');
    v_fresh := exists (select 1 from auth.sessions s where s.id = v_sid::uuid and s.user_id = uid and s.created_at > now() - interval '10 minutes');
  exception when others then
    v_fresh := coalesce((select u.last_sign_in_at from auth.users u where u.id = uid) > now() - interval '10 minutes', false);
  end;
  if not v_fresh then raise exception 'reauth'; end if;
  -- (v6.74) what is remembered of it: the e-mail of the account and of each of its sign-ins, and each Google / Kakao account number
  v_hs := public.qz_idhs((select u.email from auth.users u where u.id = uid), 'email', null);
  begin
    v_hs := v_hs || coalesce((select array_agg(q.h) from (select unnest(public.qz_idhs(i.identity_data ->> 'email', i.provider, i.provider_id)) as h
      from auth.identities i where i.user_id = uid) q), '{}'::text[]);
  exception when others then null;
  end;
  v_ban := (select t.banned_until from public.profiles t where t.id = uid);
  v_rsn := (select t.ban_reason from public.profiles t where t.id = uid);
  if v_ban is not null and v_ban <= now() then v_ban := null; v_rsn := null; end if;
  delete from public.deleted_ids where keep_until < now();
  insert into public.deleted_ids (h, keep_until, banned_until, ban_reason)
  select distinct x, greatest(now() + interval '30 days', v_ban), v_ban, v_rsn from unnest(v_hs) x
  on conflict (h) do update set keep_until = greatest(public.deleted_ids.keep_until, excluded.keep_until),
    banned_until = case when excluded.banned_until is not null and (public.deleted_ids.banned_until is null or excluded.banned_until > public.deleted_ids.banned_until)
      then excluded.banned_until else public.deleted_ids.banned_until end,
    ban_reason = case when excluded.banned_until is not null and (public.deleted_ids.banned_until is null or excluded.banned_until > public.deleted_ids.banned_until)
      then excluded.ban_reason else public.deleted_ids.ban_reason end,
    at = now();
  v_nick := (select t.nickname from public.profiles t where t.id = uid);
  update public.admin_log set detail = detail - 'old' - 'new' where target = uid and action = 'rename';
  update public.admin_log set detail = detail - 'host_name' where target = uid and action = 'room_close';
  if v_nick is not null then
    update public.coin_log c set detail = c.detail - 'to'
      where c.reason = 'gift' and c.detail ->> 'to' = v_nick and c.user_id in (select g.from_id from public.gifts g where g.to_id = uid);
    update public.coin_log c set detail = c.detail - 'from'
      where c.reason = 'ref_reward' and c.detail ->> 'from' = v_nick and c.user_id in (select f.referrer from public.referrals f where f.referee = uid);
  end if;
  delete from auth.users where id = uid;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.qz_account_delete(text) from public, anon;
grant execute on function public.qz_account_delete(text) to authenticated;

-- ============================================================================================================
-- 기초 훈련 (v6.70): the tutorial's one-time reward
-- ============================================================================================================
-- The game's tutorial runs on the shooting range by itself (nothing is checked here); finishing it signed in calls this once.
-- It pays 1,000 coins the first time (profiles.tut_done is set and a 'tutorial' line goes into the coin log); after that it pays
-- nothing and says so (got 0). A guest who finished it gets it on signing in (the game calls it then). qz_me's tut tells the lobby.
create or replace function public.qz_tut_claim() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  v_amt constant integer := 1000;
  v_done timestamptz;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform public.qz_guard(uid);
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  v_done := (select t.tut_done from public.profiles t where t.id = uid);
  if v_done is not null then
    return jsonb_build_object('got', 0, 'coins', (select t.coins from public.profiles t where t.id = uid));
  end if;
  update public.profiles set tut_done = now(), coins = coins + v_amt, earned_total = earned_total + v_amt where id = uid;
  insert into public.coin_log (user_id, delta, reason) values (uid, v_amt, 'tutorial');
  return jsonb_build_object('got', v_amt, 'coins', (select t.coins from public.profiles t where t.id = uid));
end $$;
revoke all on function public.qz_tut_claim() from public, anon;
grant execute on function public.qz_tut_claim() to authenticated;

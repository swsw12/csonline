-- ============================================================================================================
-- QUARANTINE Z — accounts, coins, the gun shop and the decoder bingos: 근하신년 + season (Supabase)
-- Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전합니다.
--
-- 규칙
--   * 코인 · 조각 · 보유 총 · 보유 해독기는 테이블에 직접 쓸 수 없고(RLS: 자기 것 읽기만), 아래 함수로만 바뀝니다.
--   * 총 가격은 gun_prices 테이블이 기준입니다 (게임 화면도 그 값을 씀). tier = 'S' / 'A' 는 근하신년 무기:
--     상점에서 팔지 않고 해독기 빙고와 조각 교환으로만 얻습니다. 이벤트 호라이즌(bhole) · 스컬-9(skull9)는 시즌 해독기 빙고에서만.
--   * 판 보상은 서버가 계산합니다: 판당 최대 900, 지난 보상 뒤 1분당 80까지, 하루(한국 시간) 8,000까지,
--     그날 첫 판 +200. 가입하면 3,000 코인.
--   * 해독기 숫자(가격 · 숫자 범위 · 조각 · 교환 가격 · 뒤섞기 횟수)는 gacha_config 테이블 한 줄(dec_*, bingo_hi …)에,
--     시즌 해독기 숫자는 같은 줄의 season_* 칸에 있습니다.
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
create table if not exists public.gun_prices (
  gun_id text primary key,
  price  integer not null check (price >= 0),
  free   boolean not null default false,  -- everyone has it from the start
  sold   boolean not null default true    -- false: not in the shop (bhole, skull9: the season decoder; tier S / A: the 근하신년 decoder)
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
  default '{gun:bhole,gun:skull9,coins:1000,coins:1000,coins:2000,coins:2000,coins:5000,frags:30,frags:30,tickets:3,tickets:3,tickets:3}';
alter table public.profiles add column if not exists dec_tickets integer not null default 0 check (dec_tickets >= 0);  -- 근하신년 decoders to open
alter table public.profiles add column if not exists season_shuffle_day date;                          -- the season card's own shuffles
alter table public.profiles add column if not exists season_shuffles    integer not null default 0;
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
create table if not exists public.gacha_log (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  at       timestamptz not null default now(),
  src      text not null,               -- decode | free | ticket | season | exchange (pull: the old pouch)
  kind     text not null,               -- gun | coins | frags | tickets
  tier     text,
  gun_id   text,
  amount   integer not null default 0,
  pity_hit boolean not null default false
);
create index if not exists gacha_log_user on public.gacha_log(user_id, id desc);

-- ---------- row level security: read your own rows (prices and pouch numbers are public); no direct writes ----------
alter table public.profiles     enable row level security;
alter table public.gun_prices   enable row level security;
alter table public.owned_guns   enable row level security;
alter table public.coin_log     enable row level security;
alter table public.gacha_config enable row level security;
alter table public.gacha_log    enable row level security;
alter table public.bingo_boards enable row level security;
alter table public.season_boards enable row level security;
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

-- ---------- price list (re-running updates it; tier S / A = pouch only) ----------
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
  ('bhole',0,false,false,null),
  ('skull9',0,false,false,null),
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
on conflict (gun_id) do update set price = excluded.price, free = excluded.free, sold = excluded.sold, tier = excluded.tier;

-- ---------- helpers ----------
-- a nickname: no control characters, single spaces, 2..16 characters (anything shorter becomes 생존자)
create or replace function public.qz_clean_nick(t text) returns text
language sql immutable set search_path = '' as $$
  select case when char_length(n) >= 2 then n else '생존자' end
  from (select left(btrim(regexp_replace(regexp_replace(coalesce(t, ''), '[[:cntrl:]]', '', 'g'), '\s+', ' ', 'g')), 16) as n) s
$$;
-- a new player: profile + the welcome coins (once)
create or replace function public.qz_new_profile(uid uuid, nick text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nickname, coins) values (uid, public.qz_clean_nick(nick), 3000) on conflict (id) do nothing;
  if found then
    insert into public.coin_log (user_id, delta, reason) values (uid, 3000, 'welcome');
  end if;
end $$;
-- every sign-up (email or Google / Kakao) gets a profile
create or replace function public.qz_on_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.qz_new_profile(new.id, coalesce(new.raw_user_meta_data ->> 'nickname', new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)));
  return new;
end $$;
drop trigger if exists qz_on_signup on auth.users;
create trigger qz_on_signup after insert on auth.users for each row execute function public.qz_on_signup();

-- the record as the game reads it
create or replace function public.qz_rec(p public.profiles) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object('g', p.rec_games, 'k', p.rec_kills, 'inf', p.rec_infects, 'best', p.rec_best, 'xp', p.xp, 'imported', p.rec_imported)
$$;

-- ---------- what the game calls (POST /rest/v1/rpc/<name>) ----------
-- me: nickname, coins, fragments, pouch pity, the free decoder, 근하신년 decoders kept (tickets), owned guns
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
    perform public.qz_new_profile(uid, (select coalesce(u.raw_user_meta_data ->> 'nickname', u.raw_user_meta_data ->> 'name',
      split_part(coalesce(u.email, ''), '@', 1)) from auth.users u where u.id = uid));
    p := (select t from public.profiles t where t.id = uid);
  end if;
  return jsonb_build_object('nickname', p.nickname, 'coins', p.coins, 'earned', p.earned_total, 'matches', p.matches,
    'day_left', 8000 - case when p.day = today then p.day_earned else 0 end,
    'fragments', p.fragments, 'pity', p.pity, 'tickets', p.dec_tickets,
    'free_today', coalesce((select c.daily_free from public.gacha_config c where c.id = 1), false) and p.free_day is distinct from today,
    'rec', public.qz_rec(p),
    'owned', coalesce((select jsonb_agg(o.gun_id order by o.bought_at) from public.owned_guns o where o.user_id = uid), '[]'::jsonb));
end $$;

create or replace function public.qz_set_nickname(p_nick text) returns text
language plpgsql security definer set search_path = '' as $$
declare r text;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  update public.profiles set nickname = public.qz_clean_nick(p_nick) where id = auth.uid();
  if not found then raise exception 'no_profile'; end if;
  r := (select t.nickname from public.profiles t where t.id = auth.uid());
  return r;
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

-- the coins for a finished match: worked out here from the match's numbers, every one of them capped
drop function if exists public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean);
create or replace function public.qz_claim(p_mode text, p_rounds integer, p_kills integer, p_infects integer, p_damage integer,
  p_won boolean, p_mvp boolean, p_stage integer, p_cleared boolean, p_score integer default 0) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  mins numeric;
  raw integer;
  bonus integer := 0;
  day0 integer;
  got integer;
  k integer := least(greatest(coalesce(p_kills, 0), 0), 80);
  inf integer := least(greatest(coalesce(p_infects, 0), 0), 30);
  sc integer := least(greatest(coalesce(p_score, 0), 0), 30000);
  gx integer;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  mins := extract(epoch from (now() - coalesce(p.last_claim, now() - interval '15 minutes'))) / 60.0;
  if mins < 1.5 then raise exception 'too_soon'; end if;
  if p_mode = 'scen' then
    raw := 80 + 40 * least(greatest(coalesce(p_stage, 0), 0), 5) + case when p_cleared then 150 else 0 end + 4 * k;
  else
    raw := 80 + 12 * least(greatest(coalesce(p_rounds, 0), 0), 10) + 6 * least(k, 60)
         + 10 * least(greatest(coalesce(p_infects, 0), 0), 30)
         + 4 * (least(greatest(coalesce(p_damage, 0), 0), 60000) / 1000)
         + case when p_won then 100 else 0 end + case when p_mvp then 60 else 0 end;
  end if;
  raw := least(raw, 900, floor(mins * 80)::integer);
  day0 := case when p.day = today then p.day_earned else 0 end;
  if p.day is distinct from today then bonus := 200; end if;
  got := greatest(0, least(raw + bonus, 8000 - day0));
  gx := least(3000, greatest(20, round(sc * 0.6 + k * 8 + inf * 12)::integer));  -- the same xp the game showed before accounts
  update public.profiles set coins = coins + got, earned_total = earned_total + got, matches = matches + 1,
    last_claim = now(), day = today, day_earned = day0 + got,
    rec_games = rec_games + 1, rec_kills = rec_kills + k, rec_infects = rec_infects + inf, rec_best = greatest(rec_best, sc), xp = xp + gx
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, got, 'match', jsonb_build_object('mode', p_mode,
    'rounds', p_rounds, 'kills', p_kills, 'infects', p_infects, 'damage', p_damage, 'won', p_won, 'mvp', p_mvp,
    'stage', p_stage, 'cleared', p_cleared, 'score', p_score, 'raw', raw, 'bonus', bonus, 'xp', gx));
  return jsonb_build_object('got', got, 'coins', p.coins, 'bonus', bonus, 'raw', raw, 'day_left', 8000 - p.day_earned,
    'xp_got', gx, 'rec', public.qz_rec(p));
end $$;

-- once per account: the record this browser kept before accounts (games, kills, ...) is added in, within sane limits
create or replace function public.qz_import_rec(p_games integer, p_kills integer, p_infects integer, p_best integer, p_xp integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  g integer := least(greatest(coalesce(p_games, 0), 0), 5000);
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.rec_imported then raise exception 'already_imported'; end if;
  update public.profiles set rec_imported = true,
    rec_games   = rec_games + g,
    rec_kills   = rec_kills + least(greatest(coalesce(p_kills, 0), 0), g * 80),
    rec_infects = rec_infects + least(greatest(coalesce(p_infects, 0), 0), g * 30),
    rec_best    = greatest(rec_best, least(greatest(coalesce(p_best, 0), 0), 30000)),
    xp          = xp + least(greatest(coalesce(p_xp, 0), 0), g * 3000, 300000)
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  return jsonb_build_object('rec', public.qz_rec(p));
end $$;

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
  coins_won integer := 0; frags_won integer := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
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
    v_res := v_res || jsonb_build_array(jsonb_build_object('n', v_num, 'cell', v_pos - 1, 'lines', v_new, 'frags', f, 'card', v_card));
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
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won,
    dec_tickets = dec_tickets - case when p_ticket then n else 0 end,
    free_day = case when p_free then today else free_day end where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  if v_cost > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'decoder', jsonb_build_object('count', n)); end if;
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'bingo_win'); end if;
  return jsonb_build_object('draws', v_res, 'card', public.qz_bingo_json(uid), 'coins', p.coins, 'fragments', p.fragments, 'cost', v_cost,
    'tickets', p.dec_tickets, 'free_today', cfg.daily_free and p.free_day is distinct from today);
end $$;
-- a fresh card (what was stamped on this one is gone)
create or replace function public.qz_bingo_reset() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
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
create or replace function public.qz_season_decode(p_count integer) returns jsonb
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
  coins_won integer := 0; frags_won integer := 0; tickets_won integer := 0;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if n not in (1, 10) then raise exception 'bad_count'; end if;
  cfg := (select g from public.gacha_config g where g.id = 1);
  if cfg.id is null then raise exception 'no_config'; end if;
  hi := greatest(cfg.season_hi, 24);
  v_cost := case when n = 10 then cfg.season_cost10 else cfg.season_cost1 end;
  perform 1 from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  p := (select t from public.profiles t where t.id = uid);
  if p.coins < v_cost then raise exception 'not_enough_coins'; end if;
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
    v_res := v_res || jsonb_build_array(jsonb_build_object('n', v_num, 'cell', v_pos - 1, 'lines', v_new, 'frags', f, 'card', v_card));
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
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won, dec_tickets = dec_tickets + tickets_won
  where id = uid;
  p := (select t from public.profiles t where t.id = uid);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'season_decoder', jsonb_build_object('count', n));
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'season_win'); end if;
  return jsonb_build_object('draws', v_res, 'card', public.qz_season_json(uid), 'coins', p.coins, 'fragments', p.fragments,
    'tickets', p.dec_tickets, 'cost', v_cost);
end $$;
-- a fresh season card (what was stamped on this one is gone)
create or replace function public.qz_season_reset() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
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

-- ---------- who may call what ----------
revoke all on function public.qz_new_profile(uuid, text) from public, anon, authenticated;
revoke all on function public.qz_on_signup() from public, anon, authenticated;
revoke all on function public.qz_me() from public, anon;
revoke all on function public.qz_set_nickname(text) from public, anon;
revoke all on function public.qz_buy(text) from public, anon;
revoke all on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer) from public, anon;
revoke all on function public.qz_bingo_new(uuid) from public, anon, authenticated;
revoke all on function public.qz_bingo_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_bingo() from public, anon;
revoke all on function public.qz_decode(integer, boolean, boolean) from public, anon;
revoke all on function public.qz_bingo_reset() from public, anon;
revoke all on function public.qz_bingo_shuffle() from public, anon;
revoke all on function public.qz_season_new(uuid) from public, anon, authenticated;
revoke all on function public.qz_season_json(uuid) from public, anon, authenticated;
revoke all on function public.qz_season() from public, anon;
revoke all on function public.qz_season_decode(integer) from public, anon;
revoke all on function public.qz_season_reset() from public, anon;
revoke all on function public.qz_season_shuffle() from public, anon;
revoke all on function public.qz_exchange(text) from public, anon;
revoke all on function public.qz_import_rec(integer, integer, integer, integer, integer) from public, anon;
revoke all on function public.qz_rec(public.profiles) from public, anon, authenticated;
grant execute on function public.qz_me() to authenticated;
grant execute on function public.qz_set_nickname(text) to authenticated;
grant execute on function public.qz_buy(text) to authenticated;
grant execute on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean, integer) to authenticated;
grant execute on function public.qz_bingo() to authenticated;
grant execute on function public.qz_decode(integer, boolean, boolean) to authenticated;
grant execute on function public.qz_bingo_reset() to authenticated;
grant execute on function public.qz_bingo_shuffle() to authenticated;
grant execute on function public.qz_season() to authenticated;
grant execute on function public.qz_season_decode(integer) to authenticated;
grant execute on function public.qz_season_reset() to authenticated;
grant execute on function public.qz_season_shuffle() to authenticated;
grant execute on function public.qz_exchange(text) to authenticated;
grant execute on function public.qz_import_rec(integer, integer, integer, integer, integer) to authenticated;

-- ============================================================================================================
-- QUARANTINE Z — accounts, coins and the gun shop (Supabase)
-- Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전합니다.
--
-- 규칙
--   * 코인·보유 총은 테이블에 직접 쓸 수 없고(RLS: 자기 것 읽기만), 아래 함수로만 바뀝니다.
--   * 총 가격은 gun_prices 테이블이 기준입니다. 가격을 바꾸려면 이 테이블 값을 고치면 됩니다 (게임 화면도 그 값을 씀).
--   * 판 보상은 서버가 계산합니다: 판당 최대 900, 지난 보상 뒤 1분당 80까지, 하루(한국 시간) 8,000까지,
--     그날 첫 판 +200. 가입하면 3,000 코인.
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
create table if not exists public.gun_prices (
  gun_id text primary key,
  price  integer not null check (price >= 0),
  free   boolean not null default false,  -- everyone has it from the start
  sold   boolean not null default true    -- false: never in the shop (supply-crate only)
);
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

-- ---------- row level security: read your own rows (prices are public); no direct writes ----------
alter table public.profiles   enable row level security;
alter table public.gun_prices enable row level security;
alter table public.owned_guns enable row level security;
alter table public.coin_log   enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "read prices" on public.gun_prices;
create policy "read prices" on public.gun_prices for select to anon, authenticated using (true);
drop policy if exists "read own guns" on public.owned_guns;
create policy "read own guns" on public.owned_guns for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "read own log" on public.coin_log;
create policy "read own log" on public.coin_log for select to authenticated using ((select auth.uid()) = user_id);

-- ---------- price list (re-running updates the prices) ----------
insert into public.gun_prices (gun_id, price, free, sold) values
  ('knife',0,true,true),
  ('p9',0,true,true),
  ('sg8',0,true,true),
  ('k5',0,true,true),
  ('g35',0,true,true),
  ('f7',1200,false,true),
  ('d50',1500,false,true),
  ('tw9',1800,false,true),
  ('r6',2000,false,true),
  ('duckfoot',6000,false,true),
  ('db2',1500,false,true),
  ('m14',3500,false,true),
  ('as12',4500,false,true),
  ('volc',12000,false,true),
  ('mdrill',14000,false,true),
  ('k9',1200,false,true),
  ('um45',1800,false,true),
  ('pd50',3000,false,true),
  ('sterling',6500,false,true),
  ('br3',2500,false,true),
  ('kv47',3500,false,true),
  ('ar7',4000,false,true),
  ('ar5c',4500,false,true),
  ('hr17',5500,false,true),
  ('xbow',7000,false,true),
  ('xbowa',9000,false,true),
  ('sr8',2500,false,true),
  ('r700',6500,false,true),
  ('dm14',7000,false,true),
  ('mg6',6000,false,true),
  ('hmg',6500,false,true),
  ('gx6',10000,false,true),
  ('airb',4500,false,true),
  ('gl40',5500,false,true),
  ('axe',1500,false,true),
  ('hammer',4000,false,true),
  ('bdc',11000,false,true),
  ('rdc',16000,false,true),
  ('ripper',9000,false,true),
  ('gaebolg',10000,false,true),
  ('xdz',9500,false,true),
  ('mlaunch',13000,false,true),
  ('bhole',0,false,false)
on conflict (gun_id) do update set price = excluded.price, free = excluded.free, sold = excluded.sold;

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

-- ---------- what the game calls (POST /rest/v1/rpc/<name>) ----------
-- me: nickname, coins, owned guns (creates the profile if the account is older than this file)
create or replace function public.qz_me() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into p from public.profiles where id = uid;
  if not found then
    perform public.qz_new_profile(uid, (select coalesce(u.raw_user_meta_data ->> 'nickname', u.raw_user_meta_data ->> 'name',
      split_part(coalesce(u.email, ''), '@', 1)) from auth.users u where u.id = uid));
    select * into p from public.profiles where id = uid;
  end if;
  return jsonb_build_object('nickname', p.nickname, 'coins', p.coins, 'earned', p.earned_total, 'matches', p.matches,
    'day_left', 8000 - case when p.day = (now() at time zone 'Asia/Seoul')::date then p.day_earned else 0 end,
    'owned', coalesce((select jsonb_agg(o.gun_id order by o.bought_at) from public.owned_guns o where o.user_id = uid), '[]'::jsonb));
end $$;

create or replace function public.qz_set_nickname(p_nick text) returns text
language plpgsql security definer set search_path = '' as $$
declare r text;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  update public.profiles set nickname = public.qz_clean_nick(p_nick) where id = auth.uid() returning nickname into r;
  if r is null then raise exception 'no_profile'; end if;
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
  select * into pr from public.gun_prices where gun_id = p_gun;
  if not found or not pr.sold then raise exception 'not_for_sale'; end if;
  if pr.free then raise exception 'already_owned'; end if;
  select coins into c from public.profiles where id = uid for update;
  if c is null then raise exception 'no_profile'; end if;
  if exists (select 1 from public.owned_guns where user_id = uid and gun_id = p_gun) then raise exception 'already_owned'; end if;
  if c < pr.price then raise exception 'not_enough_coins'; end if;
  update public.profiles set coins = coins - pr.price where id = uid returning coins into c;
  insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, p_gun, pr.price);
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, -pr.price, 'buy', jsonb_build_object('gun', p_gun));
  return jsonb_build_object('coins', c, 'gun', p_gun);
end $$;

-- the coins for a finished match: worked out here from the match's numbers, every one of them capped
create or replace function public.qz_claim(p_mode text, p_rounds integer, p_kills integer, p_infects integer, p_damage integer,
  p_won boolean, p_mvp boolean, p_stage integer, p_cleared boolean) returns jsonb
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
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into p from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
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
  update public.profiles set coins = coins + got, earned_total = earned_total + got, matches = matches + 1,
    last_claim = now(), day = today, day_earned = day0 + got where id = uid returning * into p;
  insert into public.coin_log (user_id, delta, reason, detail) values (uid, got, 'match', jsonb_build_object('mode', p_mode,
    'rounds', p_rounds, 'kills', p_kills, 'infects', p_infects, 'damage', p_damage, 'won', p_won, 'mvp', p_mvp,
    'stage', p_stage, 'cleared', p_cleared, 'raw', raw, 'bonus', bonus));
  return jsonb_build_object('got', got, 'coins', p.coins, 'bonus', bonus, 'raw', raw, 'day_left', 8000 - p.day_earned);
end $$;

-- ---------- who may call what ----------
revoke all on function public.qz_new_profile(uuid, text) from public, anon, authenticated;
revoke all on function public.qz_on_signup() from public, anon, authenticated;
revoke all on function public.qz_me() from public, anon;
revoke all on function public.qz_set_nickname(text) from public, anon;
revoke all on function public.qz_buy(text) from public, anon;
revoke all on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean) from public, anon;
grant execute on function public.qz_me() to authenticated;
grant execute on function public.qz_set_nickname(text) to authenticated;
grant execute on function public.qz_buy(text) to authenticated;
grant execute on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean) to authenticated;

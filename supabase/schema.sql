-- ============================================================================================================
-- QUARANTINE Z — accounts, coins, the gun shop and the 근하신년 lucky pouch (Supabase)
-- Supabase 대시보드 → SQL Editor → New query → 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전합니다.
--
-- 규칙
--   * 코인 · 조각 · 보유 총은 테이블에 직접 쓸 수 없고(RLS: 자기 것 읽기만), 아래 함수로만 바뀝니다.
--   * 총 가격은 gun_prices 테이블이 기준입니다 (게임 화면도 그 값을 씀). tier = 'S' / 'A' 는 근하신년 무기:
--     상점에서 팔지 않고 복주머니(뽑기)와 조각 교환으로만 얻습니다.
--   * 판 보상은 서버가 계산합니다: 판당 최대 900, 지난 보상 뒤 1분당 80까지, 하루(한국 시간) 8,000까지,
--     그날 첫 판 +200. 가입하면 3,000 코인.
--   * 복주머니 숫자(가격 · 확률 · 천장 · 교환 가격)는 gacha_config 테이블 한 줄에 있습니다. 거기서 바꾸면 바로 적용.
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
create table if not exists public.gun_prices (
  gun_id text primary key,
  price  integer not null check (price >= 0),
  free   boolean not null default false,  -- everyone has it from the start
  sold   boolean not null default true    -- false: not in the shop (supply crate, or the lucky pouch)
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
insert into public.gacha_config (id) values (1) on conflict (id) do nothing;
create table if not exists public.gacha_log (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  at       timestamptz not null default now(),
  src      text not null,               -- pull | free | exchange
  kind     text not null,               -- gun | coins | frags
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

-- ---------- what the game calls (POST /rest/v1/rpc/<name>) ----------
-- me: nickname, coins, fragments, pouch pity, the free pull, owned guns (creates the profile if the account is older than this file)
create or replace function public.qz_me() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into p from public.profiles where id = uid;
  if not found then
    perform public.qz_new_profile(uid, (select coalesce(u.raw_user_meta_data ->> 'nickname', u.raw_user_meta_data ->> 'name',
      split_part(coalesce(u.email, ''), '@', 1)) from auth.users u where u.id = uid));
    select * into p from public.profiles where id = uid;
  end if;
  return jsonb_build_object('nickname', p.nickname, 'coins', p.coins, 'earned', p.earned_total, 'matches', p.matches,
    'day_left', 8000 - case when p.day = today then p.day_earned else 0 end,
    'fragments', p.fragments, 'pity', p.pity,
    'free_today', coalesce((select c.daily_free from public.gacha_config c where c.id = 1), false) and p.free_day is distinct from today,
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
  if found and pr.tier is not null then raise exception 'gacha_only'; end if;
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

-- ---------- the 근하신년 lucky pouch ----------
-- one or ten pulls (or today's free one). Everything is drawn here: S / A / coins / fragments by gacha_config's rates,
-- an S on the pity-th pull at the latest, guns you own never come up again (a full tier pays coins or fragments instead),
-- and ten pulls hold at least one S or A.
create or replace function public.qz_pull(p_count integer, p_free boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  cfg public.gacha_config;
  p public.profiles;
  today date := (now() at time zone 'Asia/Seoul')::date;
  n integer := coalesce(p_count, 1);
  v_src text := case when p_free then 'free' else 'pull' end;
  v_cost integer := 0;
  v_owned text[];
  v_pity integer;
  v_res jsonb := '[]'::jsonb;
  v_tier text; v_gun text; v_kind text; v_amt integer; v_hit boolean;
  r double precision; w integer; acc integer; tot integer; e jsonb;
  coins_won integer := 0; frags_won integer := 0; got_sa boolean := false;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  if n not in (1, 10) then raise exception 'bad_count'; end if;
  select * into cfg from public.gacha_config where id = 1;
  if not found then raise exception 'no_config'; end if;
  select * into p from public.profiles where id = uid for update;
  if not found then raise exception 'no_profile'; end if;
  if p_free then
    if n <> 1 or not cfg.daily_free then raise exception 'bad_count'; end if;
    if p.free_day = today then raise exception 'free_used'; end if;
  else
    v_cost := case when n = 10 then cfg.cost10 else cfg.cost1 end;
    if p.coins < v_cost then raise exception 'not_enough_coins'; end if;
  end if;
  select coalesce(array_agg(o.gun_id), '{}') into v_owned from public.owned_guns o where o.user_id = uid;
  select coalesce(sum((x.value ->> 1)::integer), 0) into tot from jsonb_array_elements(cfg.coin_table) as x(value);
  v_pity := p.pity;
  for i in 1..n loop
    v_pity := v_pity + 1; r := random(); v_tier := null; v_gun := null; v_amt := 0; v_hit := false;
    if r < cfg.rate_s or v_pity >= cfg.pity then
      v_tier := 'S'; v_hit := r >= cfg.rate_s; v_pity := 0;
    elsif r < cfg.rate_s + cfg.rate_a then
      v_tier := 'A';
    elsif n = 10 and i = 10 and not got_sa then
      v_tier := 'A';  -- ten pulls hold at least one S or A
    end if;
    if v_tier is not null then
      got_sa := true;
      select gp.gun_id into v_gun from public.gun_prices gp where gp.tier = v_tier and not (gp.gun_id = any(v_owned)) order by random() limit 1;
      if v_gun is not null then
        v_kind := 'gun'; v_owned := v_owned || v_gun;
        insert into public.owned_guns (user_id, gun_id, price_paid) values (uid, v_gun, 0);
      elsif v_tier = 'S' then
        v_kind := 'coins'; v_amt := cfg.full_s_coins;
      else
        v_kind := 'frags'; v_amt := cfg.full_a_frags;
      end if;
    elsif r < cfg.rate_s + cfg.rate_a + cfg.rate_coin then
      v_kind := 'coins'; w := floor(random() * greatest(tot, 1))::integer; acc := 0; v_amt := 100;
      for e in select x.value from jsonb_array_elements(cfg.coin_table) as x(value) loop
        acc := acc + (e ->> 1)::integer;
        if w < acc then v_amt := (e ->> 0)::integer; exit; end if;
      end loop;
    else
      v_kind := 'frags'; v_amt := cfg.frag_min + floor(random() * (cfg.frag_max - cfg.frag_min + 1))::integer;
    end if;
    if v_kind = 'coins' then coins_won := coins_won + v_amt; elsif v_kind = 'frags' then frags_won := frags_won + v_amt; end if;
    insert into public.gacha_log (user_id, src, kind, tier, gun_id, amount, pity_hit) values (uid, v_src, v_kind, v_tier, v_gun, v_amt, v_hit);
    v_res := v_res || jsonb_build_array(jsonb_build_object('kind', v_kind, 'tier', v_tier, 'gun', v_gun, 'amount', v_amt, 'pity', v_hit));
  end loop;
  update public.profiles set coins = coins - v_cost + coins_won, fragments = fragments + frags_won, pity = v_pity,
    free_day = case when p_free then today else free_day end where id = uid returning * into p;
  if v_cost > 0 then insert into public.coin_log (user_id, delta, reason, detail) values (uid, -v_cost, 'pouch', jsonb_build_object('pulls', n)); end if;
  if coins_won > 0 then insert into public.coin_log (user_id, delta, reason) values (uid, coins_won, 'pouch_win'); end if;
  return jsonb_build_object('results', v_res, 'coins', p.coins, 'fragments', p.fragments, 'pity', p.pity, 'cost', v_cost,
    'free_today', cfg.daily_free and p.free_day is distinct from today);
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
  select gp.tier into v_tier from public.gun_prices gp where gp.gun_id = p_gun;
  if v_tier is null then raise exception 'not_for_exchange'; end if;
  select * into cfg from public.gacha_config where id = 1;
  v_price := case when v_tier = 'S' then cfg.ex_s else cfg.ex_a end;
  select fragments into f from public.profiles where id = uid for update;
  if f is null then raise exception 'no_profile'; end if;
  if exists (select 1 from public.owned_guns where user_id = uid and gun_id = p_gun) then raise exception 'already_owned'; end if;
  if f < v_price then raise exception 'not_enough_frags'; end if;
  update public.profiles set fragments = fragments - v_price where id = uid returning fragments into f;
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
revoke all on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean) from public, anon;
revoke all on function public.qz_pull(integer, boolean) from public, anon;
revoke all on function public.qz_exchange(text) from public, anon;
grant execute on function public.qz_me() to authenticated;
grant execute on function public.qz_set_nickname(text) to authenticated;
grant execute on function public.qz_buy(text) to authenticated;
grant execute on function public.qz_claim(text, integer, integer, integer, integer, boolean, boolean, integer, boolean) to authenticated;
grant execute on function public.qz_pull(integer, boolean) to authenticated;
grant execute on function public.qz_exchange(text) to authenticated;

-- R Quest: anonymous usage counts, error reports and the admin dashboard.
-- Run this once in Supabase > SQL Editor, after 001_family_accounts.sql.
--
-- Privacy: these tables never hold names or emails. Each device gets a random id,
-- and events only say what happened (for example "lesson_done L7"). The app can add rows,
-- but only people listed in public.admins can read them, through the dashboard (admin.html).

-- 1. Anonymous events --------------------------------------------------------------
create table if not exists public.app_events (
  id           bigint generated always as identity primary key,
  device       text not null check (char_length(device) between 8 and 64),
  kind         text not null check (kind in (
                 'open', 'lesson_done', 'exercise_done', 'challenge_done',
                 'game_play', 'game_win', 'run_error', 'not_yet', 'signup')),
  item         text check (char_length(item) <= 32),
  lang         text check (lang in ('en', 'yo')),
  app_version  text check (char_length(app_version) <= 20),
  created_at   timestamptz not null default now()
);
create index if not exists app_events_created_idx on public.app_events (created_at);
create index if not exists app_events_kind_item_idx on public.app_events (kind, item);

-- 2. Error reports ------------------------------------------------------------------
create table if not exists public.app_errors (
  id           bigint generated always as identity primary key,
  device       text check (char_length(device) <= 64),
  message      text not null check (char_length(message) <= 500),
  source       text check (char_length(source) <= 300),
  stack        text check (char_length(stack) <= 2000),
  user_agent   text check (char_length(user_agent) <= 300),
  app_version  text check (char_length(app_version) <= 20),
  created_at   timestamptz not null default now()
);
create index if not exists app_errors_created_idx on public.app_errors (created_at);

-- 3. Who may see the dashboard ------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- 4. Row-level security -------------------------------------------------------------
alter table public.app_events enable row level security;
alter table public.app_errors enable row level security;
alter table public.admins enable row level security;   -- no policies: not reachable from the app

drop policy if exists "Anyone can add usage events" on public.app_events;
create policy "Anyone can add usage events" on public.app_events
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins can read usage events" on public.app_events;
create policy "Admins can read usage events" on public.app_events
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Anyone can report errors" on public.app_errors;
create policy "Anyone can report errors" on public.app_errors
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins can read errors" on public.app_errors;
create policy "Admins can read errors" on public.app_errors
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can clear errors" on public.app_errors;
create policy "Admins can clear errors" on public.app_errors
  for delete to authenticated using ((select public.is_admin()));

grant insert on public.app_events, public.app_errors to anon, authenticated;
grant select on public.app_events to authenticated;
grant select, delete on public.app_errors to authenticated;
revoke all on public.admins from anon, authenticated;

-- 5. Dashboard numbers (admins only) ------------------------------------------------
create or replace function public.admin_stats(p_days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
begin
  if not public.is_admin() then
    raise exception 'Only R Quest admins can see these numbers';
  end if;
  return json_build_object(
    'since', since,
    'totals', json_build_object(
      'learners_all_time', (select count(distinct device) from public.app_events),
      'learners_period',   (select count(distinct device) from public.app_events where created_at >= since),
      'learners_7d',       (select count(distinct device) from public.app_events where created_at >= now() - interval '7 days'),
      'learners_today',    (select count(distinct device) from public.app_events where created_at >= date_trunc('day', now())),
      'completions_period',(select count(*) from public.app_events where created_at >= since and kind in ('lesson_done', 'exercise_done', 'challenge_done')),
      'yoruba_learners',   (select count(distinct device) from public.app_events where created_at >= since and lang = 'yo'),
      'families',          (select count(*) from auth.users),
      'children',          (select count(*) from public.children),
      'errors_period',     (select count(*) from public.app_errors where created_at >= since)
    ),
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select (date_trunc('day', created_at))::date as day,
               count(distinct device) as learners,
               count(*) filter (where kind in ('lesson_done', 'exercise_done', 'challenge_done')) as completions
        from public.app_events where created_at >= since group by 1
      ) d
    ),
    'items', (
      select coalesce(json_agg(i order by i.item), '[]'::json) from (
        select item,
               count(*) filter (where kind in ('lesson_done', 'exercise_done', 'challenge_done')) as completed,
               count(*) filter (where kind = 'game_play') as played,
               count(*) filter (where kind = 'game_win') as wins,
               count(*) filter (where kind = 'run_error') as run_errors,
               count(*) filter (where kind = 'not_yet') as not_yet
        from public.app_events where created_at >= since and item is not null group by item
      ) i
    ),
    'errors', (
      select coalesce(json_agg(e order by e.n desc), '[]'::json) from (
        select message, count(*) as n, max(created_at) as last_seen, max(app_version) as version, max(user_agent) as example_browser
        from public.app_errors where created_at >= since group by message order by count(*) desc limit 25
      ) e
    )
  );
end;
$$;

revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 6. Make yourself an admin ----------------------------------------------------------
-- Sign up in the app first, then replace the email below with yours and run this line:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';

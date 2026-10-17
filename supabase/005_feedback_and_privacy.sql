-- R Quest: feedback, "delete our family account", and dashboard numbers for the new activities.
-- Run this once in Supabase > SQL Editor, after 004_all_time_totals.sql. Safe to run again.
--
-- 1. feedback: the 💬 button sends a face (fun, too hard, too easy, confusing, broken) and an
--    optional short message. No names: the app removes email addresses and phone numbers from
--    messages before sending. Limited to 10 per device per hour and 300 per hour in total.
--    Feedback older than one year is deleted automatically.
-- 2. delete_my_account(): a signed-in parent can delete their own account. Their children and
--    all their progress are deleted with it (children.parent_id has "on delete cascade").
-- 3. admin_stats() also counts projects, bug fixes, daily puzzles, speed quizzes and feedback.

-- ---------- 1. feedback ----------
create table if not exists public.feedback (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  device       text check (char_length(device) <= 64),
  item         text check (char_length(item) <= 32),
  mood         text not null check (mood in ('fun', 'hard', 'easy', 'confusing', 'broken')),
  message      text check (char_length(message) <= 400),
  lang         text check (lang in ('en', 'yo')),
  app_version  text check (char_length(app_version) <= 20)
);
create index if not exists feedback_time_idx on public.feedback (created_at);
create index if not exists feedback_device_time_idx on public.feedback (device, created_at);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can send feedback" on public.feedback;
create policy "Anyone can send feedback" on public.feedback
  for insert to anon, authenticated with check (true);

drop policy if exists "Admins can read feedback" on public.feedback;
create policy "Admins can read feedback" on public.feedback
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can clear feedback" on public.feedback;
create policy "Admins can clear feedback" on public.feedback
  for delete to authenticated using ((select public.is_admin()));

grant insert on public.feedback to anon, authenticated;
grant select, delete on public.feedback to authenticated;

create or replace function public.limit_feedback()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.feedback
      where device is not distinct from new.device and created_at > now() - interval '1 hour') >= 10 then
    return null;
  end if;
  if (select count(*) from public.feedback where created_at > now() - interval '1 hour') >= 300 then
    return null;
  end if;
  new.created_at := now();
  return new;
end;
$$;
drop trigger if exists feedback_limit on public.feedback;
create trigger feedback_limit
  before insert on public.feedback
  for each row execute function public.limit_feedback();
revoke all on function public.limit_feedback() from public, anon, authenticated;

-- ---------- 2. a parent can delete their own family account ----------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Please sign in first';
  end if;
  delete from public.children where parent_id = me;
  delete from public.admins where user_id = me;
  delete from auth.users where id = me;
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- 3. clean-up and dashboard numbers ----------
create or replace function public.admin_prune()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only R Quest admins can do this';
  end if;
  delete from public.app_errors where created_at < now() - interval '90 days';
  delete from public.feedback where created_at < now() - interval '365 days';
end;
$$;
revoke all on function public.admin_prune() from public, anon;
grant execute on function public.admin_prune() to authenticated;

create or replace function public.admin_stats(p_days int default 30)
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  all_time boolean := p_days is null or p_days <= 0;
  first_event timestamptz := (select min(created_at) from public.app_events);
  since timestamptz := case
    when p_days is null or p_days <= 0 then coalesce((select min(created_at) from public.app_events), now())
    else now() - make_interval(days => least(p_days, 3650))
  end;
begin
  if not public.is_admin() then
    raise exception 'Only R Quest admins can see these numbers';
  end if;
  return json_build_object(
    'since', since,
    'is_all_time', all_time,
    'first_event', first_event,
    'all_time', json_build_object(
      'learners',    (select count(distinct device) from public.app_events),
      'completions', (select count(*) from public.app_events where kind in ('lesson_done', 'exercise_done', 'challenge_done')),
      'lessons',     (select count(*) from public.app_events where kind = 'lesson_done'),
      'exercises',   (select count(*) from public.app_events where kind = 'exercise_done' and item not like 'B%'),
      'bug_fixes',   (select count(*) from public.app_events where kind = 'exercise_done' and item like 'B%'),
      'challenges',  (select count(*) from public.app_events where kind = 'challenge_done' and item like 'C%'),
      'projects',    (select count(*) from public.app_events where kind = 'challenge_done' and item like 'P%'),
      'daily_puzzles', (select count(*) from public.app_events where kind = 'challenge_done' and item like 'D%'),
      'game_plays',  (select count(*) from public.app_events where kind = 'game_play' and item is distinct from 'SQ'),
      'game_wins',   (select count(*) from public.app_events where kind = 'game_win'),
      'speed_quizzes', (select count(*) from public.app_events where kind = 'game_play' and item = 'SQ'),
      'visits',      (select count(*) from public.app_events where kind = 'open'),
      'yoruba_learners', (select count(distinct device) from public.app_events where lang = 'yo'),
      'families',    (select count(*) from auth.users),
      'children',    (select count(*) from public.children),
      'feedback',    (select count(*) from public.feedback)
    ),
    'totals', json_build_object(
      'learners_all_time', (select count(distinct device) from public.app_events),
      'learners_period',   (select count(distinct device) from public.app_events where created_at >= since),
      'learners_7d',       (select count(distinct device) from public.app_events where created_at >= now() - interval '7 days'),
      'learners_today',    (select count(distinct device) from public.app_events where created_at >= date_trunc('day', now())),
      'completions_period',(select count(*) from public.app_events where created_at >= since and kind in ('lesson_done', 'exercise_done', 'challenge_done')),
      'yoruba_learners',   (select count(distinct device) from public.app_events where created_at >= since and lang = 'yo'),
      'families',          (select count(*) from auth.users),
      'children',          (select count(*) from public.children),
      'errors_period',     (select count(*) from public.app_errors where created_at >= since),
      'feedback_period',   (select count(*) from public.feedback where created_at >= since)
    ),
    'daily', (
      select coalesce(json_agg(d order by d.day), '[]'::json) from (
        select (date_trunc('day', created_at))::date as day,
               count(distinct device) as learners,
               count(*) filter (where kind in ('lesson_done', 'exercise_done', 'challenge_done')) as completions
        from public.app_events where created_at >= since group by 1
      ) d
    ),
    'weekly', (
      select coalesce(json_agg(w order by w.week), '[]'::json) from (
        select (date_trunc('week', created_at))::date as week,
               count(distinct device) as learners,
               count(*) filter (where kind in ('lesson_done', 'exercise_done', 'challenge_done')) as completions
        from public.app_events where created_at >= since group by 1
      ) w
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
    ),
    'moods', (
      select coalesce(json_object_agg(m.mood, m.n), '{}'::json) from (
        select mood, count(*) as n from public.feedback where created_at >= since group by mood
      ) m
    ),
    'feedback', (
      select coalesce(json_agg(f order by f.created_at desc), '[]'::json) from (
        select created_at, item, mood, message, lang
        from public.feedback where created_at >= since order by created_at desc limit 50
      ) f
    )
  );
end;
$$;
revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

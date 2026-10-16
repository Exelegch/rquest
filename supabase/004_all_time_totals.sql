-- R Quest: all-time totals on the dashboard.
-- Run this once in Supabase > SQL Editor, after 003_rate_limits.sql. Safe to run again.
--
-- 1. Usage events are now kept forever, so all-time totals never shrink.
--    (Each event is about 100 bytes; even millions of them fit easily in the free plan.)
--    Error reports are still deleted after 90 days.
-- 2. admin_stats(0) now means "all time", and every call also returns an 'all_time' block.

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
      'exercises',   (select count(*) from public.app_events where kind = 'exercise_done'),
      'challenges',  (select count(*) from public.app_events where kind = 'challenge_done'),
      'game_plays',  (select count(*) from public.app_events where kind = 'game_play'),
      'game_wins',   (select count(*) from public.app_events where kind = 'game_win'),
      'visits',      (select count(*) from public.app_events where kind = 'open'),
      'yoruba_learners', (select count(distinct device) from public.app_events where lang = 'yo'),
      'families',    (select count(*) from auth.users),
      'children',    (select count(*) from public.children)
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
    )
  );
end;
$$;

revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

-- R Quest: limits that stop anyone flooding the database.
-- Run this once in Supabase > SQL Editor, after 002_usage_monitoring.sql. Safe to run again.
--
-- The app must be allowed to add usage events and error reports without signing in, so anyone
-- with the public key could try to send millions of rows and fill the free plan. These triggers
-- quietly drop rows above sensible limits. Normal use is nowhere near them: a child finishing
-- lessons all afternoon sends well under 100 events an hour.
--
--   Usage events:  300 per device per hour, and 20,000 per hour in total
--   Error reports:  20 per device per hour, and  1,000 per hour in total
--   Children:       10 per family (already enforced by 001_family_accounts.sql)
--
-- Dropped rows are not errors: the app is told "saved" and moves on, so nothing retries.

create index if not exists app_events_device_time_idx on public.app_events (device, created_at);
create index if not exists app_errors_device_time_idx on public.app_errors (device, created_at);

create or replace function public.limit_app_events()
returns trigger
language plpgsql
security definer          -- needs to count rows the inserting role is not allowed to read
set search_path = ''
as $$
begin
  if (select count(*) from public.app_events
      where device = new.device and created_at > now() - interval '1 hour') >= 300 then
    return null;
  end if;
  if (select count(*) from public.app_events
      where created_at > now() - interval '1 hour') >= 20000 then
    return null;
  end if;
  new.created_at := now();   -- the server sets the time; clients cannot back-date rows
  return new;
end;
$$;

drop trigger if exists app_events_limit on public.app_events;
create trigger app_events_limit
  before insert on public.app_events
  for each row execute function public.limit_app_events();

create or replace function public.limit_app_errors()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.app_errors
      where device is not distinct from new.device and created_at > now() - interval '1 hour') >= 20 then
    return null;
  end if;
  if (select count(*) from public.app_errors
      where created_at > now() - interval '1 hour') >= 1000 then
    return null;
  end if;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists app_errors_limit on public.app_errors;
create trigger app_errors_limit
  before insert on public.app_errors
  for each row execute function public.limit_app_errors();

revoke all on function public.limit_app_events() from public, anon, authenticated;
revoke all on function public.limit_app_errors() from public, anon, authenticated;

-- Keep the tables small: delete usage events older than 400 days and errors older than 90 days.
-- The admin dashboard calls this each time it opens, so no scheduled job is needed.
-- NOTE: 004_all_time_totals.sql replaces this so usage events are kept for good (for all-time totals).
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
  delete from public.app_events where created_at < now() - interval '400 days';
  delete from public.app_errors where created_at < now() - interval '90 days';
end;
$$;
revoke all on function public.admin_prune() from public, anon;
grant execute on function public.admin_prune() to authenticated;

-- R Quest: family accounts and children's progress
-- Paste this whole file into Supabase > SQL Editor > New query, then press Run. Run it once.
--
-- How the data is shaped:
--   * A grown-up signs in with email and password (Supabase Auth handles this).
--   * Each grown-up can have several children. A child is only a first name, an animal picture,
--     and their progress (stars, finished lessons, badges) stored as JSON.
--   * Row-level security means a signed-in grown-up can only ever see and change their own children.

create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 20),
  avatar      text not null default '🕊️' check (char_length(avatar) <= 8),
  state       jsonb not null default '{}'::jsonb check (pg_column_size(state) < 200000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists children_parent_idx on public.children (parent_id);

alter table public.children enable row level security;

drop policy if exists "Parents read their own children" on public.children;
create policy "Parents read their own children"
  on public.children for select to authenticated
  using (parent_id = (select auth.uid()));

drop policy if exists "Parents add their own children" on public.children;
create policy "Parents add their own children"
  on public.children for insert to authenticated
  with check (parent_id = (select auth.uid()));

drop policy if exists "Parents update their own children" on public.children;
create policy "Parents update their own children"
  on public.children for update to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()));

drop policy if exists "Parents remove their own children" on public.children;
create policy "Parents remove their own children"
  on public.children for delete to authenticated
  using (parent_id = (select auth.uid()));

grant select, insert, update, delete on public.children to authenticated;

-- A family can have at most 10 children, so one account cannot fill the free database.
create or replace function public.limit_children_per_family()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.children where parent_id = new.parent_id) >= 10 then
    raise exception 'A family account can have at most 10 children';
  end if;
  return new;
end;
$$;

drop trigger if exists children_limit on public.children;
create trigger children_limit
  before insert on public.children
  for each row execute function public.limit_children_per_family();

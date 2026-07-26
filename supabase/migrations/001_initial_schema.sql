-- ============================================================
-- Hyperspace XR — Initial Schema Migration
-- Run in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- ============================================================
-- 2.1 Extensions and Enums
-- ============================================================
create extension if not exists "pgcrypto";

create type public.member_role as enum ('super_admin', 'core', 'volunteer');

-- ============================================================
-- 2.2 Core Members Table
-- ============================================================
create table public.core_members (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references auth.users(id) on delete cascade,
  name          text not null,
  role          public.member_role not null default 'volunteer',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- 2.3 Events Table
-- ============================================================
create table public.events (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text not null unique,
  title                   text not null,
  description             text,
  venue                   text,
  event_date              timestamptz not null,
  registration_deadline   timestamptz,
  capacity                integer,
  is_published            boolean not null default false,
  custom_fields           jsonb not null default '[]',
  created_by              uuid references public.core_members(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- ============================================================
-- 2.4 Students Table
-- ============================================================
create table public.students (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  phone         text,
  college       text,
  branch        text,
  year          integer,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2.5 Registrations Table
-- ============================================================
create table public.registrations (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references public.students(id),
  event_id            uuid not null references public.events(id),
  registration_no     text not null unique,
  qr_token            uuid not null unique default gen_random_uuid(),
  custom_field_data   jsonb not null default '{}',
  registered_by       uuid references public.core_members(id),
  is_waitlisted       boolean not null default false,
  registered_at       timestamptz not null default now(),
  unique(student_id, event_id)
);

-- ============================================================
-- 2.6 Attendance Table
-- ============================================================
create table public.attendance (
  id                uuid primary key default gen_random_uuid(),
  registration_id   uuid not null unique references public.registrations(id),
  scanned_by        uuid not null references public.core_members(id),
  scanned_at        timestamptz not null default now(),
  notes             text
);

-- ============================================================
-- 2.7 Admin Audit Log Table
-- ============================================================
create table public.admin_logs (
  id            bigint generated always as identity primary key,
  actor_id      uuid references public.core_members(id),
  action        text not null,
  table_name    text,
  record_id     text,
  old_value     jsonb,
  new_value     jsonb,
  ip_address    text,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2.8 Waitlist Table
-- ============================================================
create table public.waitlist (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.students(id),
  event_id      uuid not null references public.events(id),
  joined_at     timestamptz not null default now(),
  notified_at   timestamptz,
  unique(student_id, event_id)
);

-- ============================================================
-- 2.9 Indexes
-- ============================================================
create index on public.registrations(event_id);
create index on public.registrations(student_id);
create index on public.registrations(qr_token);
create index on public.attendance(registration_id);
create index on public.admin_logs(actor_id);
create index on public.admin_logs(created_at desc);

-- ============================================================
-- 2.10 Auto-updated updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_events_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

create trigger trg_core_members_updated_at
  before update on public.core_members
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 2.11 Registration Number Generator
-- ============================================================
create or replace function public.generate_registration_no(p_event_id uuid)
returns text language plpgsql as $$
declare
  v_slug text;
  v_count integer;
  v_prefix text;
begin
  select upper(left(replace(slug, '-', ''), 8)) into v_slug
  from public.events where id = p_event_id;

  select count(*) + 1 into v_count
  from public.registrations where event_id = p_event_id;

  v_prefix := 'HXR-' || v_slug;
  return v_prefix || '-' || lpad(v_count::text, 4, '0');
end;
$$;

-- ============================================================
-- 2.12 Admin Audit Log DB Trigger
-- ============================================================
create or replace function public.log_admin_action()
returns trigger language plpgsql security definer as $$
declare
  v_actor_id uuid;
begin
  begin
    v_actor_id := (current_setting('app.current_member_id', true))::uuid;
  exception when others then
    v_actor_id := null;
  end;

  insert into public.admin_logs(actor_id, action, table_name, record_id, old_value, new_value)
  values (
    v_actor_id,
    tg_op,
    tg_table_name,
    case tg_op when 'DELETE' then (row_to_json(old))::jsonb->>'id' else (row_to_json(new))::jsonb->>'id' end,
    case tg_op when 'INSERT' then null else row_to_json(old)::jsonb end,
    case tg_op when 'DELETE' then null else row_to_json(new)::jsonb end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_log_events after insert or update or delete on public.events
  for each row execute procedure public.log_admin_action();

create trigger trg_log_registrations after insert or update or delete on public.registrations
  for each row execute procedure public.log_admin_action();

create trigger trg_log_attendance after insert or update or delete on public.attendance
  for each row execute procedure public.log_admin_action();

create trigger trg_log_core_members after insert or update or delete on public.core_members
  for each row execute procedure public.log_admin_action();

-- ============================================================
-- PHASE 3 — Row Level Security (RLS)
-- ============================================================
alter table public.core_members    enable row level security;
alter table public.events          enable row level security;
alter table public.students        enable row level security;
alter table public.registrations   enable row level security;
alter table public.attendance      enable row level security;
alter table public.admin_logs      enable row level security;
alter table public.waitlist        enable row level security;

-- Helper: returns the core_member row for the currently authenticated user
create or replace function public.current_member()
returns public.core_members language sql security definer stable as $$
  select * from public.core_members
  where user_id = auth.uid() and is_active = true
  limit 1;
$$;

-- Events policies
create policy "public can view published events"
  on public.events for select
  using (is_published = true);

create policy "core members can view all events"
  on public.events for select
  using ((select id from public.current_member()) is not null);

create policy "core+ can manage events"
  on public.events for all
  using ((select role from public.current_member()) in ('super_admin', 'core'))
  with check ((select role from public.current_member()) in ('super_admin', 'core'));

-- Registrations policies
create policy "core members can view registrations"
  on public.registrations for select
  using ((select id from public.current_member()) is not null);

create policy "anyone can register"
  on public.registrations for insert
  with check (true);

create policy "core+ can update registrations"
  on public.registrations for update
  using ((select role from public.current_member()) in ('super_admin', 'core'));

-- Students policies
create policy "core members can view students"
  on public.students for select
  using ((select id from public.current_member()) is not null);

create policy "anyone can insert students"
  on public.students for insert
  with check (true);

create policy "core+ can update students"
  on public.students for update
  using ((select role from public.current_member()) in ('super_admin', 'core'));

-- Attendance policies
create policy "core members can mark attendance"
  on public.attendance for insert
  with check ((select id from public.current_member()) is not null);

create policy "core members can view attendance"
  on public.attendance for select
  using ((select id from public.current_member()) is not null);

-- Admin logs policies
create policy "super_admin can view logs"
  on public.admin_logs for select
  using ((select role from public.current_member()) = 'super_admin');

create policy "no direct log insert"
  on public.admin_logs for insert
  with check (false);

-- Core members policies
create policy "core members can view member list"
  on public.core_members for select
  using ((select id from public.current_member()) is not null);

create policy "only super_admin can manage members"
  on public.core_members for all
  using ((select role from public.current_member()) = 'super_admin')
  with check ((select role from public.current_member()) = 'super_admin');

-- Waitlist policies
create policy "core members can view waitlist"
  on public.waitlist for select
  using ((select id from public.current_member()) is not null);

create policy "anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- ============================================================
-- PHASE 6 — Database Views
-- ============================================================
create or replace view public.registration_details as
select
  r.id,
  r.registration_no,
  r.registered_at,
  r.is_waitlisted,
  r.custom_field_data,
  s.id          as student_id,
  s.name        as student_name,
  s.email       as student_email,
  s.phone       as student_phone,
  s.college     as student_college,
  s.branch      as student_branch,
  s.year        as student_year,
  e.id          as event_id,
  e.title       as event_title,
  e.event_date,
  e.venue,
  cm.name       as registered_by_name
from public.registrations r
join public.students s on s.id = r.student_id
join public.events e on e.id = r.event_id
left join public.core_members cm on cm.id = r.registered_by;

create or replace view public.attendance_details as
select
  a.id,
  a.scanned_at,
  a.notes,
  r.registration_no,
  s.name        as student_name,
  s.email       as student_email,
  s.college     as student_college,
  s.branch      as student_branch,
  s.year        as student_year,
  e.id          as event_id,
  e.title       as event_title,
  cm.name       as scanned_by_name
from public.attendance a
join public.registrations r on r.id = a.registration_id
join public.students s on s.id = r.student_id
join public.events e on e.id = r.event_id
join public.core_members cm on cm.id = a.scanned_by;

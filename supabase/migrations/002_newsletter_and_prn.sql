-- ============================================================
-- Hyperspace XR — Migration 002: Newsletter & PRN
-- ============================================================

-- Add PRN and newsletter opt-in to students table
alter table public.students
  add column if not exists prn text,
  add column if not exists newsletter_opt_in boolean not null default false;

-- ============================================================
-- Newsletter Subscribers Table
-- Stores standalone newsletter sign-ups (not tied to a registration)
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text,
  subscribed_at timestamptz not null default now(),
  is_active     boolean not null default true
);

-- Index for fast lookups by email
create index if not exists idx_newsletter_subscribers_email
  on public.newsletter_subscribers(email);

-- Enable RLS
alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe
create policy "anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only core members can view subscribers
create policy "core members can view newsletter subscribers"
  on public.newsletter_subscribers for select
  using ((select id from public.current_member()) is not null);

-- Core+ can manage subscribers
create policy "core+ can manage newsletter subscribers"
  on public.newsletter_subscribers for update
  using ((select role from public.current_member()) in ('super_admin', 'core'));

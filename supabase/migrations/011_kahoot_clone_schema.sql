-- Migration to create tables for Kahoot Clone real-time quiz system

create table if not exists public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_at  timestamptz not null default now(),
  created_by  uuid references auth.users(id) on delete set null
);

create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null references public.quizzes(id) on delete cascade,
  question_text  text not null,
  options        text[] not null, -- Array of 4 answer options
  correct_option integer not null, -- Index from 0 to 3
  time_limit     integer not null default 20, -- Seconds
  sort_order     integer not null default 0
);

-- Enable RLS
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;

-- Policies for public quizzes
create policy "anyone can view quizzes"
  on public.quizzes for select
  using (true);

create policy "anyone can view questions"
  on public.quiz_questions for select
  using (true);

-- authenticated users can create quizzes
create policy "authenticated users can manage quizzes"
  on public.quizzes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "authenticated users can manage questions"
  on public.quiz_questions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

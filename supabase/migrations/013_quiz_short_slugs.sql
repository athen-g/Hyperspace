-- Migration to add a short, unique code slug to public.quizzes
alter table public.quizzes
  add column if not exists code_slug text unique;

-- Generate unique random 6-character alphabetic/numeric slugs for existing quizzes
update public.quizzes
set code_slug = lower(substring(md5(random()::text) from 1 for 6))
where code_slug is null;

-- Make code_slug mandatory for future quizzes
alter table public.quizzes
  alter column code_slug set not null;

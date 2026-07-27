-- 1. Add division column to students table
alter table public.students
  add column if not exists division text;

-- 2. Drop existing views to avoid column shift errors
drop view if exists public.registration_details;
drop view if exists public.attendance_details;

-- 3. Re-create registration_details view
create view public.registration_details as
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
  s.prn         as student_prn,
  s.division    as student_division,
  s.newsletter_opt_in,
  e.id          as event_id,
  e.title       as event_title,
  e.event_date,
  e.venue,
  cm.name       as registered_by_name
from public.registrations r
join public.students s on s.id = r.student_id
join public.events e on e.id = r.event_id
left join public.core_members cm on cm.id = r.registered_by;

-- 4. Re-create attendance_details view
create view public.attendance_details as
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
  s.prn         as student_prn,
  s.division    as student_division,
  e.id          as event_id,
  e.title       as event_title,
  e.event_date,
  cm.name       as scanned_by_name
from public.attendance a
join public.registrations r on r.id = a.registration_id
join public.students s on s.id = r.student_id
join public.events e on e.id = r.event_id
join public.core_members cm on cm.id = a.scanned_by;

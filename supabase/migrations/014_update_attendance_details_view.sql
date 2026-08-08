-- Update attendance_details view to include registered_by to distinguish walk-in from online
drop view if exists public.attendance_details;

create view public.attendance_details as
select
  a.id,
  a.scanned_at,
  a.notes,
  r.registration_no,
  r.registered_by,
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

-- Migration: Include certificate_id in public.registration_details view

drop view if exists public.registration_details cascade;

create view public.registration_details as
select
  r.id,
  r.registration_no,
  r.certificate_id,
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

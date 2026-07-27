-- Drop the security-flagged view to ensure no auth.users data is exposed in the public schema
drop view if exists public.core_member_details;

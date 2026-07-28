-- Remove the auto-activation trigger that fired on any password change.
-- Activation is now handled explicitly in the RegisterPage UI after the
-- member completes their account setup form, not by a database trigger.

drop trigger if exists on_auth_user_updated on auth.users;
drop function if exists public.handle_member_activation();

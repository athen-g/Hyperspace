-- Create a secure view to expose core member details alongside invitation metadata
create or replace view public.core_member_details as
select 
  cm.id,
  cm.user_id,
  cm.name,
  cm.role,
  cm.is_active,
  cm.created_at,
  au.invited_at,
  au.last_sign_in_at,
  au.confirmation_sent_at,
  au.email
from public.core_members cm
left join auth.users au on cm.user_id = au.id
where (select id from public.current_member()) is not null;

-- Allow core members to always view their own profile even if is_active is false (needed for login/setup phase)
create policy "users can view their own member profile"
  on public.core_members for select
  using (auth.uid() = user_id);

-- Create a database trigger to automatically activate the core member profile once they set their password
create or replace function public.handle_member_activation()
returns trigger as $$
begin
  if new.encrypted_password is not null and (old.encrypted_password is null or old.encrypted_password <> new.encrypted_password) then
    update public.core_members
    set is_active = true
    where user_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_member_activation();

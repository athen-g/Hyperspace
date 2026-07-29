-- Create RLS policy to allow users to activate their own core_members profile during account registration/setup phase.
-- They only need update access to set `is_active = true` where `user_id = auth.uid()`.
create policy "users can activate their own member profile"
  on public.core_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

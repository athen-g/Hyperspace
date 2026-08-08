-- Migration to secure quiz RLS policies so only active super_admin and core members can manage quizzes/questions

drop policy if exists "authenticated users can manage quizzes" on public.quizzes;
drop policy if exists "authenticated users can manage questions" on public.quiz_questions;

create policy "active core members can manage quizzes"
  on public.quizzes for all
  to authenticated
  using (
    exists (
      select 1 from public.core_members
      where user_id = auth.uid()
        and is_active = true
        and role in ('super_admin', 'core')
    )
  )
  with check (
    exists (
      select 1 from public.core_members
      where user_id = auth.uid()
        and is_active = true
        and role in ('super_admin', 'core')
    )
  );

create policy "active core members can manage questions"
  on public.quiz_questions for all
  to authenticated
  using (
    exists (
      select 1 from public.core_members
      where user_id = auth.uid()
        and is_active = true
        and role in ('super_admin', 'core')
    )
  )
  with check (
    exists (
      select 1 from public.core_members
      where user_id = auth.uid()
        and is_active = true
        and role in ('super_admin', 'core')
    )
  );

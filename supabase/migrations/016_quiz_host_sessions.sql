-- Migration to create quiz_host_sessions table and claim_quiz_session RPC function

create table if not exists public.quiz_host_sessions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  pin             text not null,
  host_user_id    uuid not null references auth.users(id),
  host_display    text not null,
  claimed_at      timestamptz not null default now(),
  last_heartbeat  timestamptz not null default now(),
  is_active       boolean not null default true
);

-- Enforces only one active session per quiz at the database level
create unique index if not exists one_active_host_per_quiz
  on public.quiz_host_sessions (quiz_id)
  where is_active = true;

-- Enable RLS
alter table public.quiz_host_sessions enable row level security;

-- Admins can read all sessions (to display who is hosting)
create policy "Admins can read host sessions"
  on public.quiz_host_sessions for select
  to authenticated
  using (true);

-- Atomic claim function
create or replace function claim_quiz_session(
  p_quiz_id     uuid,
  p_pin         text,
  p_user_id     uuid,
  p_display     text,
  p_stale_after interval default '60 seconds'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing  quiz_host_sessions%rowtype;
  v_new_id    uuid;
begin
  -- Lock the table for this quiz_id to serialize concurrent claims
  perform pg_advisory_xact_lock(hashtext(p_quiz_id::text));

  -- Check for an existing active session
  select * into v_existing
  from quiz_host_sessions
  where quiz_id = p_quiz_id
    and is_active = true
  for update;

  if found then
    -- Active session exists — is it stale?
    if v_existing.last_heartbeat > now() - p_stale_after then
      -- Fresh session — is it ours?
      if v_existing.host_user_id = p_user_id then
        -- Same user recovering — refresh heartbeat and return success
        update quiz_host_sessions
          set last_heartbeat = now()
          where id = v_existing.id;
        return jsonb_build_object(
          'status', 'recovered',
          'session_id', v_existing.id
        );
      else
        -- Different user — return locked status
        return jsonb_build_object(
          'status', 'locked',
          'host_display', v_existing.host_display,
          'claimed_at', extract(epoch from v_existing.claimed_at) * 1000
        );
      end if;
    else
      -- Stale session — deactivate it and fall through to claim
      update quiz_host_sessions
        set is_active = false
        where id = v_existing.id;
    end if;
  end if;

  -- No active session (or stale one was just cleared) — claim it
  insert into quiz_host_sessions
    (quiz_id, pin, host_user_id, host_display, claimed_at, last_heartbeat, is_active)
  values
    (p_quiz_id, p_pin, p_user_id, p_display, now(), now(), true)
  returning id into v_new_id;

  return jsonb_build_object(
    'status', 'claimed',
    'session_id', v_new_id
  );
end;
$$;

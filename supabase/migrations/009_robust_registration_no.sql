-- Migration to improve public.generate_registration_no to guarantee uniqueness under concurrency
create or replace function public.generate_registration_no(p_event_id uuid)
returns text language plpgsql as $$
declare
  v_slug text;
  v_count integer;
  v_prefix text;
  v_reg_no text;
  v_exists boolean;
begin
  select upper(left(replace(slug, '-', ''), 8)) into v_slug
  from public.events where id = p_event_id

  v_prefix := 'HXR-' || v_slug;

  -- Read count first as base
  select count(*) into v_count
  from public.registrations where event_id = p_event_id;

  loop
    v_count := v_count + 1;
    v_reg_no := v_prefix || '-' || lpad(v_count::text, 4, '0');
    
    -- Check if it already exists
    select exists (
      select 1 from public.registrations 
      where registration_no = v_reg_no
    ) into v_exists;

    -- Exit loop if unique
    exit when not v_exists;
  end loop;

  return v_reg_no;
end;
$$;

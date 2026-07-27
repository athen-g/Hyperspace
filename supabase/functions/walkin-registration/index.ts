import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Verify the caller is an authenticated core member (core or super_admin)
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', code: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: member } = await supabase
      .from('core_members')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member || !['core', 'super_admin'].includes(member.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions', code: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parse body
    const body = await req.json()
    const { name, email, phone, college, branch, year, prn, division, event_id, custom_field_data } = body

    if (!name || !email || !event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', code: 'MISSING_FIELDS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Upsert student (bypass deadline/capacity for walk-ins)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .upsert({ name, email, phone, college, branch, year, prn, division }, { onConflict: 'email' })
      .select('id')
      .single()

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Failed to upsert student', code: 'STUDENT_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, registration_no')
      .eq('student_id', student.id)
      .eq('event_id', event_id)
      .single()

    if (existing) {
      // Auto-mark attendance even if they were already registered but not scanned in yet
      const { data: attCheck } = await supabase
        .from('attendance')
        .select('id')
        .eq('registration_id', existing.id)
        .single()

      if (!attCheck) {
        await supabase.from('attendance').insert({
          registration_id: existing.id,
          scanned_by: member.id,
          scanned_at: new Date().toISOString()
        })
      }

      return new Response(
        JSON.stringify({ alreadyRegistered: true, registrationNo: existing.registration_no }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Generate registration number
    const { data: regNo } = await supabase.rpc('generate_registration_no', { p_event_id: event_id })

    // 5. Insert registration with registered_by set
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        student_id: student.id,
        event_id,
        registration_no: regNo,
        custom_field_data: custom_field_data ?? {},
        registered_by: member.id,
      })
      .select('id')
      .single()

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: 'Failed to create registration', code: 'REGISTRATION_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Auto-mark attendance for the new registration
    const { error: attendanceError } = await supabase
      .from('attendance')
      .insert({
        registration_id: registration.id,
        scanned_by: member.id,
        scanned_at: new Date().toISOString()
      })

    if (attendanceError) {
      console.error('Failed to auto-mark attendance for walk-in:', attendanceError)
    }

    // 6. Log the walk-in action explicitly
    await supabase.from('admin_logs').insert({
      actor_id: member.id,
      action: 'WALKIN',
      table_name: 'registrations',
      record_id: registration.id,
      new_value: { student_id: student.id, event_id, registration_no: regNo },
    } as never)

    // 7. Send email (best-effort)
    try {
      await supabase.functions.invoke('send-registration-email', {
        body: { registrationId: registration.id },
      })
    } catch (_e) {
      console.error('Walk-in email send failed (non-fatal):', _e)
    }

    return new Response(
      JSON.stringify({ success: true, registrationNo: regNo }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

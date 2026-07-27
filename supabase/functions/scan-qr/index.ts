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

    // 1. Verify the caller is an authenticated core member
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: member } = await supabase
      .from('core_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'Not a core member' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Get qr_token from body
    const { qr_token } = await req.json()

    if (!qr_token) {
      return new Response(
        JSON.stringify({ error: 'Missing qr_token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Look up registration by qr_token
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('id, registration_no, student_id, event_id')
      .eq('qr_token', qr_token)
      .single()

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: 'invalid_token', code: 'INVALID_TOKEN' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Check if already scanned
    const { data: existing } = await supabase
      .from('attendance')
      .select('scanned_at')
      .eq('registration_id', registration.id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'already_scanned', scannedAt: existing.scanned_at }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Insert attendance record
    const { error: attendanceError } = await supabase.from('attendance').insert({
      registration_id: registration.id,
      scanned_by: member.id,
    })

    if (attendanceError) {
      return new Response(
        JSON.stringify({ error: 'Failed to record attendance', code: 'ATTENDANCE_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Fetch student + event info for the response
    const { data: detail } = await supabase
      .from('registration_details')
      .select('student_name, event_title, registration_no')
      .eq('id', registration.id)
      .single()

    return new Response(
      JSON.stringify({
        success: true,
        studentName: detail?.student_name,
        eventTitle: detail?.event_title,
        registrationNo: detail?.registration_no,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

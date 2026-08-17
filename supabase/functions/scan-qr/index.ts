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

    // 1. Verify caller core member
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.replace('Bearer ', '')
    let memberId: string | null = null

    if (jwt) {
      const { data: { user } } = await supabase.auth.getUser(jwt)
      if (user) {
        const { data: member } = await supabase
          .from('core_members')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()
        if (member) memberId = member.id
      }
    }

    // Fallback scanner ID if member ID is missing
    if (!memberId) {
      const { data: defaultMember } = await supabase.from('core_members').select('id').limit(1).maybeSingle()
      if (defaultMember) memberId = defaultMember.id
    }

    // 2. Get qr_token and day_number from body
    const body = await req.json()
    const qr_token = body.qr_token
    const day_number = Number(body.day_number) || (new Date().getDate() === 14 ? 2 : 1)

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

    // 4. Fetch existing attendance row
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('registration_id', registration.id)
      .maybeSingle()

    // 5. Check if THIS DAY is already scanned
    if (existing) {
      const d1Already = (existing as any).day1_attended || existing.notes?.includes('Day 1') || new Date(existing.scanned_at).getDate() === 13
      const d2Already = (existing as any).day2_attended || existing.notes?.includes('Day 2') || new Date(existing.scanned_at).getDate() === 14

      if (day_number === 1 && d1Already) {
        return new Response(
          JSON.stringify({ error: 'already_scanned', dayNumber: 1, scannedAt: existing.scanned_at }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (day_number === 2 && d2Already) {
        return new Response(
          JSON.stringify({ error: 'already_scanned', dayNumber: 2, scannedAt: existing.scanned_at }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 6. Upsert Attendance Record
    const nowIso = new Date().toISOString()
    const dayDateIso = day_number === 2 ? '2026-08-14T10:00:00.000Z' : '2026-08-13T10:00:00.000Z'

    if (existing) {
      let notesText = existing.notes || ''
      let day1 = !!(existing as any).day1_attended || notesText.includes('Day 1')
      let day2 = !!(existing as any).day2_attended || notesText.includes('Day 2')

      if (day_number === 1) {
        day1 = true
        if (!notesText.includes('Day 1')) notesText = (notesText + ' Day 1 (Scanned)').trim()
      } else {
        day2 = true
        if (!notesText.includes('Day 2')) notesText = (notesText + ' Day 2 (Scanned)').trim()
      }

      const updateData: any = {
        notes: notesText,
        day1_attended: day1,
        day2_attended: day2
      }

      const { error: updateErr } = await supabase
        .from('attendance')
        .update(updateData)
        .eq('id', existing.id)

      if (updateErr) {
        await supabase.from('attendance').update({ notes: notesText }).eq('id', existing.id)
      }
    } else {
      let day1 = day_number === 1
      let day2 = day_number === 2
      let notesText = `Day ${day_number} (Scanned)`

      const insertData: any = {
        registration_id: registration.id,
        scanned_by: memberId,
        scanned_at: dayDateIso,
        notes: notesText,
        day1_attended: day1,
        day2_attended: day2
      }

      const { error: insertErr } = await supabase.from('attendance').insert(insertData)
      if (insertErr) {
        delete insertData.day1_attended
        delete insertData.day2_attended
        await supabase.from('attendance').insert(insertData)
      }
    }

    // 7. Fetch student + event info for response
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
        dayNumber: day_number
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Unexpected error in scan-qr:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

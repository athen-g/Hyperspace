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

    const body = await req.json()
    const { name, email, phone, college, branch, year, prn, division, newsletter_opt_in, event_id, custom_field_data } = body

    // 1. Validate required fields
    if (!name || !email || !event_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, event_id', code: 'MISSING_FIELDS' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check event exists, is published, and deadline not passed
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, slug, title, capacity, registration_deadline, is_published')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found', code: 'EVENT_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!event.is_published) {
      return new Response(
        JSON.stringify({ error: 'Event is not open for registration', code: 'EVENT_NOT_PUBLISHED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Registration deadline has passed', code: 'DEADLINE_PASSED' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Determine if we should waitlist
    let shouldWaitlist = event.slug === 'texture-distortion'
    let waitlistReason: 'manual' | 'capacity' | null = shouldWaitlist ? 'manual' : null

    if (!shouldWaitlist && event.capacity !== null) {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('is_waitlisted', false)

      if ((count ?? 0) >= event.capacity) {
        shouldWaitlist = true
        waitlistReason = 'capacity'
      }
    }

    // 4. Upsert student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .upsert({ name, email, phone, college, branch, year, prn, division, newsletter_opt_in: newsletter_opt_in ?? false }, { onConflict: 'email' })
      .select('id')
      .single()

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Failed to upsert student', code: 'STUDENT_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Check for duplicate registration
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, is_waitlisted')
      .eq('student_id', student.id)
      .eq('event_id', event_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ alreadyRegistered: true, isWaitlisted: existing.is_waitlisted, waitlistReason: existing.is_waitlisted ? (event.slug === 'texture-distortion' ? 'manual' : 'capacity') : null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Generate registration number (derived dynamically from event slug)
    let { data: regNo } = await supabase.rpc('generate_registration_no', { p_event_id: event_id })
    if (!regNo) {
      const slugClean = (event.slug || 'EVENT').replace(/-/g, '').toUpperCase().slice(0, 8)
      const randomHex = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase()
      regNo = `HXR-${slugClean}-${randomHex}`
    }

    // 7. Insert registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        student_id: student.id,
        event_id,
        registration_no: regNo,
        custom_field_data: custom_field_data ?? {},
        is_waitlisted: shouldWaitlist,
      })
      .select('id')
      .single()

    if (regError || !registration) {
      console.error('Registration insertion failed:', regError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create registration', 
          code: 'REGISTRATION_ERROR', 
          details: regError?.message || 'Database insert failed' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7b. If waitlisted, sync to waitlist table
    if (shouldWaitlist) {
      await supabase.from('waitlist').upsert(
        { student_id: student.id, event_id },
        { onConflict: 'student_id,event_id' }
      )
    }

    // 8. Handle newsletter opt-in (best-effort)
    if (newsletter_opt_in) {
      try {
        await supabase
          .from('newsletter_subscribers')
          .upsert({ email, name }, { onConflict: 'email' })
      } catch (_e) {
        console.error('Newsletter upsert failed (non-fatal):', _e)
      }
    }

    // 9. Send confirmation email in the background (don't block response to client)
    supabase.functions.invoke('send-registration-email', {
      body: { registrationId: registration.id },
    }).catch((_e) => {
      console.error('Background email send invocation failed:', _e)
    })

    return new Response(
      JSON.stringify({ success: true, registrationNo: regNo, studentId: student.id, waitlisted: shouldWaitlist, waitlistReason }),
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

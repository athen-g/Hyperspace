import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { name, email, phone, college, branch, year, prn, newsletter_opt_in, event_id, custom_field_data } = body

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

    // 3. Check capacity
    if (event.capacity !== null) {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('is_waitlisted', false)

      if ((count ?? 0) >= event.capacity) {
        // Upsert student first before adding to waitlist
        const { data: student } = await supabase
          .from('students')
          .upsert({ name, email, phone, college, branch, year, prn, newsletter_opt_in: newsletter_opt_in ?? false }, { onConflict: 'email' })
          .select('id')
          .single()

        if (student) {
          await supabase.from('waitlist').upsert(
            { student_id: student.id, event_id },
            { onConflict: 'student_id,event_id' }
          )
        }
        return new Response(
          JSON.stringify({ waitlisted: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 4. Upsert student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .upsert({ name, email, phone, college, branch, year, prn, newsletter_opt_in: newsletter_opt_in ?? false }, { onConflict: 'email' })
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
      .select('id')
      .eq('student_id', student.id)
      .eq('event_id', event_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ alreadyRegistered: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Generate registration number
    const { data: regNo } = await supabase.rpc('generate_registration_no', { p_event_id: event_id })

    // 7. Insert registration
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        student_id: student.id,
        event_id,
        registration_no: regNo,
        custom_field_data: custom_field_data ?? {},
      })
      .select('id')
      .single()

    if (regError || !registration) {
      return new Response(
        JSON.stringify({ error: 'Failed to create registration', code: 'REGISTRATION_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      JSON.stringify({ success: true, registrationNo: regNo, studentId: student.id }),
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

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

    // 2. Resilient Event Lookup: try by ID, then by slug, then fallback to first published event
    let event: any = null

    // Try by ID
    const { data: eventById } = await supabase
      .from('events')
      .select('id, slug, title, capacity, registration_deadline, is_published')
      .eq('id', event_id)
      .maybeSingle()

    if (eventById) {
      event = eventById
    } else {
      // Try by slug 'texture-distortion'
      const { data: eventBySlug } = await supabase
        .from('events')
        .select('id, slug, title, capacity, registration_deadline, is_published')
        .eq('slug', 'texture-distortion')
        .maybeSingle()

      if (eventBySlug) {
        event = eventBySlug
      } else {
        // Fallback: select any published event
        const { data: firstEvent } = await supabase
          .from('events')
          .select('id, slug, title, capacity, registration_deadline, is_published')
          .eq('is_published', true)
          .limit(1)
          .maybeSingle()

        if (firstEvent) {
          event = firstEvent
        } else {
          // If events table is completely empty, insert Texture Distortion event
          const { data: newEvent } = await supabase
            .from('events')
            .insert({
              slug: 'texture-distortion',
              title: 'TEXTURE DISTORTION',
              name: 'TEXTURE DISTORTION',
              tagline: '3D Blender Workshop',
              is_published: true,
              capacity: 100
            } as any)
            .select('id, slug, title, capacity, registration_deadline, is_published')
            .single()

          event = newEvent
        }
      }
    }

    if (!event) {
      return new Response(
        JSON.stringify({ error: 'Event not found', code: 'EVENT_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Determine if we should waitlist
    let shouldWaitlist = event.slug === 'texture-distortion'
    let waitlistReason: 'manual' | 'capacity' | null = shouldWaitlist ? 'manual' : null

    if (!shouldWaitlist && event.capacity !== null) {
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', event.id)
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
        JSON.stringify({ error: studentError?.message || 'Failed to upsert student', code: 'STUDENT_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Check for duplicate registration
    const { data: existing } = await supabase
      .from('registrations')
      .select('id, is_waitlisted, registration_no')
      .eq('student_id', student.id)
      .eq('event_id', event.id)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({
          alreadyRegistered: true,
          registrationNo: existing.registration_no,
          isWaitlisted: existing.is_waitlisted,
          waitlistReason: existing.is_waitlisted ? (event.slug === 'texture-distortion' ? 'manual' : 'capacity') : null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6. Generate registration number: HYPER-YYYY-EVT-XXXX
    const yearStr = new Date().getFullYear()
    const slugAbbr = (event.slug || 'EVT').split('-').map((s: string) => s[0]).join('').toUpperCase().slice(0, 4)
    const randomHex = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase()
    const registrationNo = `HYPER-${yearStr}-${slugAbbr}-${randomHex}`

    // 7. Create registration
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .insert({
        student_id: student.id,
        event_id: event.id,
        registration_no: registrationNo,
        is_waitlisted: shouldWaitlist,
        custom_field_data: custom_field_data || {}
      })
      .select('id, registration_no')
      .single()

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: regError?.message || 'Failed to create registration', code: 'REGISTRATION_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        registrationNo: reg.registration_no,
        waitlisted: shouldWaitlist,
        waitlistReason
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error', code: 'SERVER_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

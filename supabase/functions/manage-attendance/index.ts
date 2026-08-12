import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { action, registrationId, studentId, dayNumber, adminId, certificateId } = await req.json()

    // 1. Save unique Certificate ID to registrations table
    if (action === 'save_certificate_id') {
      if (!studentId || !certificateId) {
        return new Response(JSON.stringify({ error: 'studentId and certificateId are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Find registration for student
      const { data: regList } = await supabase
        .from('registrations')
        .select('id')
        .eq('student_id', studentId)

      if (regList && regList.length > 0) {
        for (const reg of regList) {
          await supabase
            .from('registrations')
            .update({ certificate_id: certificateId } as any)
            .eq('id', reg.id)
        }
      }

      return new Response(JSON.stringify({ success: true, certificateId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Lookup public certificate by Certificate ID for recruiters & visitors
    if (action === 'lookup_certificate') {
      if (!certificateId) {
        return new Response(JSON.stringify({ found: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: reg } = await supabase
        .from('registrations')
        .select('id, registration_no, certificate_id, students(name, email, college)')
        .eq('certificate_id', certificateId)
        .maybeSingle()

      if (reg) {
        const student = Array.isArray(reg.students) ? reg.students[0] : reg.students
        return new Response(JSON.stringify({
          found: true,
          studentName: student?.name,
          studentEmail: student?.email,
          studentCollege: student?.college,
          certificateId: reg.certificate_id || certificateId
        }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ found: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Get attendance status across all registrations for this student
    if (action === 'get_attendance') {
      let regIds: string[] = registrationId ? [registrationId] : []
      let existingCertId: string | null = null

      if (studentId) {
        const { data: regList } = await supabase
          .from('registrations')
          .select('id, certificate_id')
          .eq('student_id', studentId)

        if (regList && regList.length > 0) {
          regIds = regList.map(r => r.id)
          existingCertId = regList.find(r => (r as any).certificate_id)?.certificate_id || null
        }
      } else if (registrationId) {
        const { data: reg } = await supabase
          .from('registrations')
          .select('certificate_id')
          .eq('id', registrationId)
          .maybeSingle()
        if (reg && (reg as any).certificate_id) existingCertId = (reg as any).certificate_id
      }

      if (regIds.length > 0) {
        const { data: attList } = await supabase
          .from('attendance')
          .select('*')
          .in('registration_id', regIds)

        if (attList && attList.length > 0) {
          const hasDay1 = attList.some(a => (a as any).day1_attended || a.notes?.includes('Day 1') || new Date(a.scanned_at).getDate() === 13)
          const hasDay2 = attList.some(a => (a as any).day2_attended || a.notes?.includes('Day 2') || new Date(a.scanned_at).getDate() === 14)

          return new Response(JSON.stringify({
            day1_attended: hasDay1 || attList.length >= 2,
            day2_attended: hasDay2 || attList.length >= 2,
            existingCertificateId: existingCertId,
            registrationId: regIds[0]
          }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      }

      return new Response(JSON.stringify({ day1_attended: false, day2_attended: false, existingCertificateId: existingCertId }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Mark / Upsert attendance
    if (action === 'mark_attendance') {
      if (!registrationId) {
        return new Response(JSON.stringify({ error: 'registrationId is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Query a valid scanner ID from core_members table
      let scannerId = adminId
      const { data: validMember } = await supabase
        .from('core_members')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (!scannerId || scannerId === 'admin' || scannerId === 'super_admin') {
        scannerId = validMember?.id
      }

      const nowIso = new Date().toISOString()

      // Check if an attendance record already exists for this registration_id
      const { data: existingAtt } = await supabase
        .from('attendance')
        .select('*')
        .eq('registration_id', registrationId)
        .maybeSingle()

      if (existingAtt) {
        // UPDATE existing record
        let notesText = existingAtt.notes || ''
        let day1 = !!(existingAtt as any).day1_attended || notesText.includes('Day 1')
        let day2 = !!(existingAtt as any).day2_attended || notesText.includes('Day 2')

        if (dayNumber === 1) {
          day1 = true
          if (!notesText.includes('Day 1')) notesText = (notesText + ' Day 1 (Super Admin Override)').trim()
        } else if (dayNumber === 2) {
          day2 = true
          if (!notesText.includes('Day 2')) notesText = (notesText + ' Day 2 (Super Admin Override)').trim()
        } else if (dayNumber === 'both' || dayNumber === 3) {
          day1 = true
          day2 = true
          notesText = 'Day 1 & Day 2 (Super Admin Override)'
        }

        const updatePayload: any = {
          notes: notesText,
          day1_attended: day1,
          day2_attended: day2
        }

        const { error: updateErr } = await supabase
          .from('attendance')
          .update(updatePayload)
          .eq('id', existingAtt.id)

        if (updateErr) {
          await supabase
            .from('attendance')
            .update({ notes: notesText })
            .eq('id', existingAtt.id)
        }
      } else {
        // INSERT new record
        let day1 = false
        let day2 = false
        let noteText = ''

        if (dayNumber === 1) {
          day1 = true
          noteText = 'Day 1 (Super Admin Override)'
        } else if (dayNumber === 2) {
          day2 = true
          noteText = 'Day 2 (Super Admin Override)'
        } else if (dayNumber === 'both' || dayNumber === 3) {
          day1 = true
          day2 = true
          noteText = 'Day 1 & Day 2 (Super Admin Override)'
        }

        const insertPayload: any = {
          registration_id: registrationId,
          scanned_by: scannerId,
          scanned_at: nowIso,
          notes: noteText,
          day1_attended: day1,
          day2_attended: day2
        }

        const { error: insertErr } = await supabase
          .from('attendance')
          .insert(insertPayload)

        if (insertErr) {
          delete insertPayload.day1_attended
          delete insertPayload.day2_attended
          await supabase.from('attendance').insert(insertPayload)
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

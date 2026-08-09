import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'Hyperspace XR <events@hyperspacesig.tech>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate admin token
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing auth header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify calling user is an active core member or super admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: member } = await supabase
      .from('core_members')
      .select('role, is_active')
      .eq('user_id', user.id)
      .single()

    if (!member || !member.is_active || !['super_admin', 'core'].includes(member.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient privileges' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { subject, htmlContent, testEmail, targetEventId } = body

    if (!subject || !htmlContent) {
      return new Response(JSON.stringify({ error: 'Missing subject or htmlContent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch Target Event details if provided
    let eventDetails: { title: string; event_date: string; venue: string | null; slug: string } | null = null
    if (targetEventId) {
      const { data: evData } = await supabase
        .from('events')
        .select('title, event_date, venue, slug')
        .eq('id', targetEventId)
        .single()

      if (evData) {
        eventDetails = evData
      }
    }

    // Fetch active subscribers or override with test email
    let subscribersList: { email: string; name: string | null }[] = []
    if (testEmail) {
      subscribersList = [{ email: testEmail, name: 'Test User' }]
    } else {
      const { data: subs, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email, name')
        .eq('is_active', true)

      if (subError || !subs || subs.length === 0) {
        return new Response(JSON.stringify({ success: true, count: 0, message: 'No active subscribers found.' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      subscribersList = subs
    }

    const formattedEventDate = eventDetails?.event_date
      ? new Date(eventDetails.event_date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'TBA'

    const targetEventName = eventDetails?.title || 'Upcoming Event'
    const venueName = eventDetails?.venue || 'Room 518'
    const eventSlug = eventDetails?.slug || 'events'

    // Batch send using Resend API (100 per chunk)
    const batchSize = 100
    let sentCount = 0

    for (let i = 0; i < subscribersList.length; i += batchSize) {
      const chunk = subscribersList.slice(i, i + batchSize)

      const payload = chunk.map(sub => {
        const subName = sub.name || 'Subscriber'
        const unsubscribeUrl = `https://hyperspacesig.tech/unsubscribe?email=${encodeURIComponent(sub.email)}`

        const personalizedSubject = subject
          .replaceAll('{subscriber_name}', subName)
          .replaceAll('{subscriber_email}', sub.email)
          .replaceAll('{target_event_name}', targetEventName)
          .replaceAll('{event_name}', targetEventName)

        // Substitute placeholders in HTML body
        const personalizedHtml = htmlContent
          .replaceAll('{subscriber_name}', subName)
          .replaceAll('{subscriber_email}', sub.email)
          .replaceAll('{target_event_name}', targetEventName)
          .replaceAll('{event_name}', targetEventName)
          .replaceAll('{event_date}', formattedEventDate)
          .replaceAll('{venue}', venueName)
          .replaceAll('{event_slug}', eventSlug)

        return {
          from: FROM_EMAIL,
          to: sub.email,
          subject: personalizedSubject,
          html: personalizedHtml,
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }
      })

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        sentCount += chunk.length
      } else {
        const errorText = await res.text()
        console.error(`Resend batch sending failed for chunk at index ${i}:`, errorText)
      }
    }

    return new Response(JSON.stringify({ success: true, count: sentCount }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Newsletter sending failed:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

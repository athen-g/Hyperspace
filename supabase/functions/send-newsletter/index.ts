import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'Hyperspace XR <newsletter@hyperspacesig.tech>'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate admin token (Service role validation or JWT confirmation)
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
    const { subject, htmlContent } = body

    if (!subject || !htmlContent) {
      return new Response(JSON.stringify({ error: 'Missing subject or htmlContent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 1. Fetch active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)

    if (subError || !subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0, message: 'No active subscribers found.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Batch send using Resend API
    // Resend batch limit is 100 emails per request
    const emails = subscribers.map(sub => sub.email)
    const batchSize = 100
    let sentCount = 0

    for (let i = 0; i < emails.length; i += batchSize) {
      const chunk = emails.slice(i, i + batchSize)
      
      // We map the chunk to Resend batch payloads
      const payload = chunk.map(email => ({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: htmlContent,
      }))

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
        console.error(`Resend batch sending failed for chunk starting at index ${i}:`, errorText)
      }
    }

    return new Response(JSON.stringify({ success: true, count: sentCount }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Newsletter sending failed:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

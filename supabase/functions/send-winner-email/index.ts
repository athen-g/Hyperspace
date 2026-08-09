import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'Hyperspace XR <events@hyperspacesig.tech>'
const SITE_DOMAIN = 'https://hyperspacesig.tech'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Verify caller is core member / admin
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
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!member || !['core', 'super_admin'].includes(member.role)) {
      return new Response(
        JSON.stringify({ error: 'forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { registrationId, title, message } = await req.json()

    if (!registrationId || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters (registrationId, title, message)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch registration details
    const { data: reg, error: regError } = await supabase
      .from('registration_details')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: 'Registration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: rawReg } = await supabase
      .from('registrations')
      .select('qr_token')
      .eq('id', registrationId)
      .single()

    const qrPayload = `${SITE_DOMAIN}/scan?token=${rawReg?.qr_token}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=200`

    const eventDate = new Date(reg.event_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Convert message newlines to HTML paragraphs
    const formattedMessage = message
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => `<p style="margin:0 0 12px;font-size:15px;color:#d4d4d4;line-height:1.6;">${line}</p>`)
      .join('')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:40px 40px 32px;border-bottom:1px solid #222;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#E91E63;text-transform:uppercase;font-weight:bold;">Hyperspace XR Winners</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <!-- Custom Winner Message -->
              <div style="background:#141414;border:1px solid #2a2a2a;border-left:4px solid #E91E63;border-radius:8px;padding:24px;margin-bottom:32px;">
                ${formattedMessage}
              </div>

              <!-- Ticket Info Header -->
              <p style="margin:0 0 16px;font-size:12px;letter-spacing:3px;color:#888;text-transform:uppercase;font-weight:bold;">Your Event Pass & Ticket</p>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="6">
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Event</td>
                        <td style="font-size:15px;color:#fff;font-weight:600;">${reg.event_title}</td>
                      </tr>
                      <tr><td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid #2a2a2a;" /></td></tr>
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Date</td>
                        <td style="font-size:15px;color:#e5e5e5;">${eventDate}</td>
                      </tr>
                      ${reg.venue ? `
                      <tr><td colspan="2" style="padding:6px 0;"><hr style="border:none;border-top:1px solid #2a2a2a;" /></td></tr>
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Venue</td>
                        <td style="font-size:15px;color:#e5e5e5;">${reg.venue}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Registration Number -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #333;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td align="center" style="padding:20px;">
                    <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#555;text-transform:uppercase;">Winner Ticket Number</p>
                    <p style="margin:0;font-size:26px;font-weight:700;color:#E91E63;letter-spacing:2px;font-family:'Courier New',monospace;">${reg.registration_no}</p>
                  </td>
                </tr>
              </table>

              ${!reg.is_waitlisted ? `
              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 14px;font-size:12px;color:#666;letter-spacing:1px;text-transform:uppercase;">Entry QR Pass</p>
                    <div style="display:inline-block;background:#ffffff;padding:14px;border-radius:12px;">
                      <img src="${qrImageUrl}" width="180" height="180" alt="QR Code" style="display:block;" />
                    </div>
                    <p style="margin:14px 0 0;font-size:12px;color:#555;">
                      Show this QR pass at the entrance for direct check-in.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin:0;font-size:14px;color:#555;line-height:1.8;border-top:1px solid #222;padding-top:20px;">
                Congratulations once again!<br/>
                <strong style="color:#888;">— Hyperspace XR Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#444;text-align:center;">
                Hyperspace XR · Official Winners Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [reg.student_email],
        subject: `${title} — Ticket #${reg.registration_no}`,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text()
      console.error('Resend error:', resendError)
      return new Response(
        JSON.stringify({ error: 'Email send failed', details: resendError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, registrationNo: reg.registration_no }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

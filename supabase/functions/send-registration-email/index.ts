import { createClient } from 'npm:@supabase/supabase-js@2'
import QRCode from 'npm:qrcode'

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

    const { registrationId } = await req.json()

    if (!registrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing registrationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch full registration details
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

    if (reg.is_waitlisted) {
      const waitlistHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Waitlisted — ${reg.event_title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:40px 40px 32px;border-bottom:1px solid #222;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#666;text-transform:uppercase;">Hyperspace XR</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Added to Waitlist</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#aaa;line-height:1.6;">
                Hi <strong style="color:#fff;">${reg.student_name}</strong>, you have been added to the waitlist for <strong style="color:#fff;">${reg.event_title}</strong>.
              </p>

              <!-- Message -->
              <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
                ${reg.event_slug === 'texture-distortion' 
                  ? 'You have been added to the waitlist. Our team will check seat and system availability for the event and will get back to you by email. Confirmation of your registration should take only a few hours. Thank you very much for your interest and patience.'
                  : 'This event is currently waitlist-only. Your registration is registered under waitlisted status. We will notify you via email as soon as your slot is confirmed by the organizers.'}
              </p>

              <!-- Registration Number -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #333;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#555;text-transform:uppercase;">Waitlist Reference Number</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:2px;font-family:'Courier New',monospace;">${reg.registration_no}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#555;line-height:1.8;border-top:1px solid #222;padding-top:24px;">
                Thank you for your interest!<br/>
                <strong style="color:#888;">— Hyperspace XR Team</strong>
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
          subject: `Added to Waitlist for ${reg.event_title} — ${reg.registration_no}`,
          html: waitlistHtml,
        }),
      })

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text()
        console.error('Resend error:', resendError)
      }

      return new Response(
        JSON.stringify({ sent: true, waitlisted: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Also fetch qr_token from raw registrations table
    const { data: rawReg } = await supabase
      .from('registrations')
      .select('qr_token')
      .eq('id', registrationId)
      .single()

    const qrPayload = `${SITE_DOMAIN}/scan?token=${rawReg?.qr_token}`

    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=200`
    console.log('Generated QR URL:', qrImageUrl)

    const eventDate = new Date(reg.event_date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed — ${reg.event_title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:40px 40px 32px;border-bottom:1px solid #222;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#666;text-transform:uppercase;">Hyperspace XR</p>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">You're Registered!</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#aaa;line-height:1.6;">
                Hi <strong style="color:#fff;">${reg.student_name}</strong>, your registration for <strong style="color:#fff;">${reg.event_title}</strong> is confirmed.
              </p>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="8">
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Event</td>
                        <td style="font-size:15px;color:#fff;font-weight:600;">${reg.event_title}</td>
                      </tr>
                      <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #2a2a2a;" /></td></tr>
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Date</td>
                        <td style="font-size:15px;color:#e5e5e5;">${eventDate}</td>
                      </tr>
                      ${reg.venue ? `
                      <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:1px solid #2a2a2a;" /></td></tr>
                      <tr>
                        <td style="font-size:11px;letter-spacing:3px;color:#555;text-transform:uppercase;padding-bottom:4px;">Venue</td>
                        <td style="font-size:15px;color:#e5e5e5;">${reg.venue}</td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Registration Number -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #333;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#555;text-transform:uppercase;">Registration Number</p>
                    <p style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:2px;font-family:'Courier New',monospace;">${reg.registration_no}</p>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 16px;font-size:13px;color:#666;letter-spacing:1px;text-transform:uppercase;">Your Entry QR Code</p>
                    <div style="display:inline-block;background:#ffffff;padding:16px;border-radius:12px;">
                      <img src="${qrImageUrl}" width="200" height="200" alt="QR Code" style="display:block;" />
                    </div>
                    <p style="margin:16px 0 0;font-size:13px;color:#555;line-height:1.6;">
                      Show this QR code at the event entrance for check-in.<br/>
                      <strong style="color:#888;">Do not share this email.</strong>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#555;line-height:1.8;border-top:1px solid #222;padding-top:24px;">
                See you at the event!<br/>
                <strong style="color:#888;">— Hyperspace XR Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#444;text-align:center;">
                Hyperspace XR · This is an automated message, please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // Send via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [reg.student_email],
        subject: `You're registered for ${reg.event_title} — ${reg.registration_no}`,
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
      JSON.stringify({ sent: true }),
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

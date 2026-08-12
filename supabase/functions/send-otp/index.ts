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

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { email, studentName } = await req.json()

    if (!email || typeof email !== 'string' || !email.trim()) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const name = studentName || 'Participant'

    // Generate 6-Digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes

    // Store OTP in database
    const { error: dbErr } = await supabase
      .from('otps')
      .insert({
        email: cleanEmail,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false
      })

    if (dbErr) {
      console.error('DB OTP insert error:', dbErr)
    }

    // Ticket-Style Dark Plain Email Template
    const otpHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code — Hyperspace XR SIG</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:36px 36px 28px;border-bottom:1px solid #222;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;color:#D84B7E;text-transform:uppercase;font-weight:700;">HYPERSPACE XR SIG</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Verification Code</h1>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 20px;font-size:15px;color:#aaa;line-height:1.6;">
                Hi <strong style="color:#fff;">${name}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#aaa;line-height:1.6;">
                Please use the following 6-digit One-Time Password (OTP) to verify your identity and access your official Texture Distortion certificate:
              </p>

              <!-- Ticket-Style OTP Code Display Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border:1px solid #333;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;color:#666;text-transform:uppercase;font-weight:700;">YOUR 6-DIGIT OTP CODE</p>
                    <p style="margin:0;font-size:36px;font-weight:900;color:#D84B7E;letter-spacing:10px;font-family:'Courier New',monospace;">${otpCode}</p>
                    <p style="margin:8px 0 0;font-size:11px;color:#666;">Valid for 15 minutes • Do not share this code</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#666;line-height:1.6;border-top:1px solid #222;padding-top:20px;">
                If you did not request this code, you can safely ignore this email.<br/>
                <strong style="color:#888;">— Hyperspace XR SIG Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    if (RESEND_API_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [cleanEmail],
          subject: `Your Certificate Verification Code: ${otpCode}`,
          html: otpHtml
        })
      })

      if (!resendRes.ok) {
        const errText = await resendRes.text()
        console.warn('Resend API error:', errText)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'OTP sent successfully.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to send OTP email.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

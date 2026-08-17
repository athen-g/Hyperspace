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

    const { email, otpCode } = await req.json()

    if (!email || !otpCode) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP code are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otpCode.toString().trim()

    // 1. Query latest unused OTP for this email
    const { data: record, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', cleanEmail)
      .eq('is_used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !record) {
      return new Response(
        JSON.stringify({ error: 'No active OTP found for this email. Please click Resend Code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check if OTP matches
    if (record.otp_code.trim() !== cleanOtp) {
      return new Response(
        JSON.stringify({ error: 'Incorrect OTP code entered. Please check your email.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Check if expired
    const isExpired = new Date(record.expires_at).getTime() < Date.now()
    if (isExpired) {
      return new Response(
        JSON.stringify({ error: 'OTP code has expired. Please click Resend Code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Mark OTP as used
    await supabase
      .from('otps')
      .update({ is_used: true })
      .eq('id', record.id)

    return new Response(
      JSON.stringify({ success: true, message: 'OTP verified successfully.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'OTP verification failed.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigins = [
  'https://hyperspacesig.tech',
  'http://localhost:5173',
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')
  const allowOrigin = isAllowed ? origin : allowedOrigins[0]
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Read body content
    const contentType = req.headers.get('content-type') || ''
    let sessionId = ''
    let bodyToken = ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      sessionId = body.session_id
      bodyToken = body.access_token
    } else {
      const text = await req.text()
      try {
        const parsed = JSON.parse(text)
        sessionId = parsed.session_id
        bodyToken = parsed.access_token
      } catch {
        const params = new URLSearchParams(text)
        sessionId = params.get('session_id') || ''
        bodyToken = params.get('access_token') || ''
      }
    }

    // 1. Verify user JWT (Header or Body token fallback)
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.replace('Bearer ', '') || bodyToken

    if (!jwt) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Invalid JWT token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'bad_request', message: 'Missing session_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Deactivate session
    const { error } = await supabase
      .from('quiz_host_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('host_user_id', user.id)

    if (error) {
      return new Response(
        JSON.stringify({ error: 'deactivate_failed', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'internal_error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

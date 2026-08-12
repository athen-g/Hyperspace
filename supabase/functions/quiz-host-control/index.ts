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

    // 1. Verify user JWT
    const authHeader = req.headers.get('Authorization')
    const jwt = authHeader?.replace('Bearer ', '')
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

    // 2. Verify active super_admin or core role
    const { data: member, error: memberError } = await supabase
      .from('core_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (memberError || !member || !['super_admin', 'core'].includes(member.role)) {
      return new Response(
        JSON.stringify({ error: 'forbidden', message: 'Unauthorized role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Get session_id, action, payload from body
    const { session_id, action, payload } = await req.json()
    if (!session_id || !action) {
      return new Response(
        JSON.stringify({ error: 'bad_request', message: 'Missing session_id or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Validate active host session and heartbeat within last 60 seconds
    const { data: session, error: sessionError } = await supabase
      .from('quiz_host_sessions')
      .select('host_user_id, pin, is_active, last_heartbeat')
      .eq('id', session_id)
      .single()

    if (sessionError || !session || !session.is_active || session.host_user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'not_authorized_host', message: 'Invalid or inactive session ownership' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const lastHeartbeatTime = new Date(session.last_heartbeat).getTime()
    if (Date.now() - lastHeartbeatTime > 60000) {
      return new Response(
        JSON.stringify({ error: 'stale_session', message: 'Session heartbeat has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Broadcast signed event to player channel
    const playerChannel = supabase.channel(`quiz-${session.pin}`, {
      config: { broadcast: { self: true, ack: true } }
    })

    playerChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await playerChannel.send({
          type: 'broadcast',
          event: action,
          payload: { 
            ...payload, 
            origin: 'server', 
            signed_at: Date.now() 
          }
        })
        playerChannel.unsubscribe()
      }
    })

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'internal_error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

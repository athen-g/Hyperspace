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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verify authenticated user via JWT
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

    // 2. Verify admin role (super_admin or core)
    const { data: member, error: memberError } = await supabase
      .from('core_members')
      .select('id, name, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (memberError || !member || !['super_admin', 'core'].includes(member.role)) {
      return new Response(
        JSON.stringify({ error: 'forbidden', message: 'Unauthorized role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Get action, pin, payload from request body
    const { action, pin, payload } = await req.json()
    if (!action || !pin) {
      return new Response(
        JSON.stringify({ error: 'bad_request', message: 'Missing action or pin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Connect to Realtime presence channel and verify active host status
    const presenceChannel = supabase.channel(`quiz-host-${pin}`, {
      config: { presence: { key: 'host' } }
    })

    const presencePromise = new Promise<any[]>((resolve) => {
      presenceChannel.on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        resolve(state.host || [])
      })
    })

    presenceChannel.subscribe()
    const hostList = await presencePromise
    presenceChannel.unsubscribe()

    // Apply tiebreaker: sort by claimed_at (earliest wins)
    const sortedHosts = [...hostList].sort((a, b) => a.claimed_at - b.claimed_at)
    const activeHost = sortedHosts[0]

    if (!activeHost || activeHost.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'not_active_host', message: 'You are not the active host for this session' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Broadcast signed host event to player channel
    const playerChannel = supabase.channel(`quiz-${pin}`, {
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

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'internal_error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

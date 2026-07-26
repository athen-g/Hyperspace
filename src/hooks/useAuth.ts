import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getCurrentMember } from '../lib/auth'
import type { Database } from '../lib/database.types'

type CoreMember = Database['public']['Tables']['core_members']['Row']

export function useAuth() {
  const [member, setMember] = useState<CoreMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<boolean>(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(!!session)
      if (session) {
        const m = await getCurrentMember()
        setMember(m)
      }
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(!!session)
      if (session) {
        const m = await getCurrentMember()
        setMember(m)
      } else {
        setMember(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { member, loading, isAuthenticated: session }
}

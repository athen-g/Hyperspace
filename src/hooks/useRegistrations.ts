import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type RegistrationDetail = Database['public']['Views']['registration_details']['Row']

export function useRegistrations(eventId: string) {
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return

    const fetchRegistrations = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('registration_details')
        .select('*')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false })

      if (error) setError(error.message)
      else setRegistrations(data ?? [])
      setLoading(false)
    }

    fetchRegistrations()

    // Subscribe to new registrations in realtime
    const channel = supabase
      .channel(`registrations:${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'registrations',
        filter: `event_id=eq.${eventId}`,
      }, () => {
        fetchRegistrations()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return { registrations, loading, error }
}

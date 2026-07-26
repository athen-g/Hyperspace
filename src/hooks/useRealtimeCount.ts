import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeCount(eventId: string, table: 'registrations' | 'attendance') {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!eventId) return

    // Fetch initial count
    const viewName = table === 'attendance' ? 'attendance_details' : 'registration_details'
    supabase
      .from(viewName)
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .then(({ count }) => setCount(count ?? 0))

    // Subscribe to new inserts
    const channel = supabase
      .channel(`realtime_count:${table}:${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table,
      }, () => setCount(c => c + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, table])

  return count
}

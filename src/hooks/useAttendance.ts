import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type AttendanceDetail = Database['public']['Views']['attendance_details']['Row']

export function useAttendance(eventId: string) {
  const [attendance, setAttendance] = useState<AttendanceDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return

    const fetchAttendance = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('attendance_details')
        .select('*')
        .eq('event_id', eventId)
        .order('scanned_at', { ascending: false })

      if (error) setError(error.message)
      else setAttendance(data ?? [])
      setLoading(false)
    }

    fetchAttendance()

    // Subscribe to new attendance scans in realtime
    const channel = supabase
      .channel(`attendance:${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'attendance',
      }, () => {
        fetchAttendance()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  return { attendance, loading, error }
}

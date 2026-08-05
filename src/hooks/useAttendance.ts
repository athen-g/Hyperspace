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
        .from('attendance')
        .select(`
          id,
          scanned_at,
          notes,
          core_members (
            name
          ),
          registrations!inner (
            registration_no,
            registered_by,
            event_id,
            students (
              name,
              email,
              college,
              branch,
              year,
              prn,
              division
            )
          )
        `)
        .eq('registrations.event_id', eventId)
        .order('scanned_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        const formatted: AttendanceDetail[] = (data ?? []).map((row: any) => {
          const reg = Array.isArray(row.registrations) ? row.registrations[0] : row.registrations
          const student = reg ? (Array.isArray(reg.students) ? reg.students[0] : reg.students) : null
          const scanner = Array.isArray(row.core_members) ? row.core_members[0] : row.core_members

          return {
            id: row.id,
            scanned_at: row.scanned_at,
            notes: row.notes,
            registration_no: reg?.registration_no ?? '',
            registered_by: reg?.registered_by ?? null,
            student_name: student?.name ?? '',
            student_email: student?.email ?? '',
            student_college: student?.college ?? null,
            student_branch: student?.branch ?? null,
            student_year: student?.year ?? null,
            student_prn: student?.prn ?? null,
            student_division: student?.division ?? null,
            event_id: reg?.event_id ?? '',
            event_title: '',
            scanned_by_name: scanner?.name ?? ''
          }
        })
        setAttendance(formatted)
      }
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

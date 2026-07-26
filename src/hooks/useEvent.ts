import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']

export function useEvents(publishedOnly = false) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      let query = supabase.from('events').select('*').order('event_date', { ascending: true })
      if (publishedOnly) {
        query = query.eq('is_published', true).gte('event_date', new Date().toISOString())
      }
      const { data, error } = await query
      if (error) setError(error.message)
      else setEvents(data ?? [])
      setLoading(false)
    }
    fetchEvents()
  }, [publishedOnly])

  return { events, loading, error }
}

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (error) setError(error.message)
      else setEvent(data)
      setLoading(false)
    }
    fetchEvent()
  }, [eventId])

  return { event, loading, error }
}

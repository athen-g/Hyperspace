import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useRealtimeCount } from '../../hooks/useRealtimeCount'
import type { Database } from '../../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const regCount = useRealtimeCount(eventId ?? '', 'registrations')
  const attCount = useRealtimeCount(eventId ?? '', 'attendance')

  useEffect(() => {
    if (!eventId) return
    supabase.from('events').select('*').eq('id', eventId).single()
      .then(({ data }) => { setEvent(data); setLoading(false) })
  }, [eventId])

  const togglePublish = async () => {
    if (!event) return
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('events') as any).update({ is_published: !event.is_published }).eq('id', event.id)
    if (error) { toast.error(error.message) } else {
      setEvent(e => e ? { ...e, is_published: !e.is_published } : e)
      toast.success(event.is_published ? 'Event unpublished' : 'Event published!')
    }
    setSaving(false)
  }

  if (loading) return <div style={{ color: '#555', padding: '40px' }}>Loading...</div>
  if (!event) return <div style={{ color: '#f87171', padding: '40px' }}>Event not found.</div>

  const fieldStyle: React.CSSProperties = { marginBottom: '20px' }
  const labelStyle: React.CSSProperties = { fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '4px' }
  const valueStyle: React.CSSProperties = { fontSize: '15px', color: '#e5e5e5' }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link to="/admin/events" style={{ fontSize: '12px', color: '#555', textDecoration: 'none', letterSpacing: '1px' }}>← Events</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>{event.title}</h1>
          <button
            onClick={togglePublish}
            disabled={saving}
            style={{ padding: '10px 20px', background: event.is_published ? '#1a0a0a' : '#0a1a0a', border: `1px solid ${event.is_published ? '#7f1d1d' : '#14532d'}`, borderRadius: '8px', color: event.is_published ? '#f87171' : '#4ade80', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
          >
            {saving ? '...' : event.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { label: 'Registrations', value: regCount, link: `/admin/events/${eventId}/registrations` },
          { label: 'Attendance', value: attCount, link: `/admin/events/${eventId}/attendance` },
          { label: 'Capacity Remaining', value: event.capacity ? Math.max(0, event.capacity - regCount) : '∞' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px', flex: 1, minWidth: '140px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{stat.value}</p>
            {stat.link && <Link to={stat.link} style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#555', textDecoration: 'none' }}>View →</Link>}
          </div>
        ))}
      </div>

      {/* Event details */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
        <div style={fieldStyle}><p style={labelStyle}>Slug</p><p style={{ ...valueStyle, fontFamily: 'monospace' }}>{event.slug}</p></div>
        <div style={fieldStyle}><p style={labelStyle}>Date</p><p style={valueStyle}>{format(new Date(event.event_date), 'dd MMMM yyyy, HH:mm')}</p></div>
        <div style={fieldStyle}><p style={labelStyle}>Venue</p><p style={valueStyle}>{event.venue ?? '—'}</p></div>
        <div style={fieldStyle}><p style={labelStyle}>Capacity</p><p style={valueStyle}>{event.capacity ?? 'Unlimited'}</p></div>
        <div style={fieldStyle}><p style={labelStyle}>Registration Deadline</p><p style={valueStyle}>{event.registration_deadline ? format(new Date(event.registration_deadline), 'dd MMM yyyy, HH:mm') : '—'}</p></div>
        <div style={fieldStyle}><p style={labelStyle}>Status</p><p style={valueStyle}>{event.is_published ? '✅ Published' : '⏳ Draft'}</p></div>
        {event.description && <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}><p style={labelStyle}>Description</p><p style={{ ...valueStyle, color: '#aaa', lineHeight: 1.6 }}>{event.description}</p></div>}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
        <Link to={`/admin/events/${eventId}/registrations`} style={{ padding: '10px 20px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', textDecoration: 'none' }}>View Registrations</Link>
        <Link to={`/admin/events/${eventId}/attendance`} style={{ padding: '10px 20px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', textDecoration: 'none' }}>View Attendance</Link>
        <Link to={`/admin/events/${eventId}/walkin`} style={{ padding: '10px 20px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', textDecoration: 'none' }}>Walk-in Registration</Link>
      </div>
    </div>
  )
}

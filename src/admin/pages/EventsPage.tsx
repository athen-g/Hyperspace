import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useEvents } from '../../hooks/useEvent'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type EventInsert = Database['public']['Tables']['events']['Insert']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<Partial<EventInsert>>({ is_published: false, custom_fields: [] })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.slug || !form.title || !form.event_date) return
    setLoading(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('events') as any).insert(form as EventInsert)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Event created!')
    onCreated()
    onClose()
    setLoading(false)
  }

  const f = (k: keyof EventInsert) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#fff' }}>New Event</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div><label style={labelStyle}>Title *</label><input style={inputStyle} required value={form.title ?? ''} onChange={f('title')} /></div>
          <div><label style={labelStyle}>Slug * (URL-safe)</label><input style={inputStyle} required value={form.slug ?? ''} onChange={f('slug')} placeholder="my-event-2026" /></div>
          <div><label style={labelStyle}>Event Date *</label><input type="datetime-local" style={inputStyle} required value={form.event_date?.toString().slice(0, 16) ?? ''} onChange={f('event_date')} /></div>
          <div><label style={labelStyle}>Registration Deadline</label><input type="datetime-local" style={inputStyle} value={form.registration_deadline?.toString().slice(0, 16) ?? ''} onChange={f('registration_deadline')} /></div>
          <div><label style={labelStyle}>Venue</label><input style={inputStyle} value={form.venue ?? ''} onChange={f('venue')} /></div>
          <div><label style={labelStyle}>Capacity (blank = unlimited)</label><input type="number" style={inputStyle} value={form.capacity?.toString() ?? ''} onChange={e => setForm(p => ({ ...p, capacity: e.target.value ? parseInt(e.target.value) : undefined }))} /></div>
          <div><label style={labelStyle}>Description</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={form.description ?? ''} onChange={f('description')} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="is_published" checked={!!form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
            <label htmlFor="is_published" style={{ fontSize: '13px', color: '#aaa', cursor: 'pointer' }}>Publish immediately</label>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{loading ? 'Creating...' : 'Create Event'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { events, loading } = useEvents()
  const [showModal, setShowModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>Admin</p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>Events</h1>
        </div>
        <button
          id="new-event-btn"
          onClick={() => setShowModal(true)}
          style={{ padding: '12px 24px', background: '#fff', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
        >
          + New Event
        </button>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && events.length === 0 && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No events yet</td></tr>}
            {events.map(ev => (
              <tr key={ev.id}>
                <td style={{ ...tdStyle, color: '#e5e5e5', fontWeight: 500 }}>{ev.title}</td>
                <td style={tdStyle}>{format(new Date(ev.event_date), 'dd MMM yyyy, HH:mm')}</td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: ev.is_published ? '#0a2a0a' : '#1a1a0a', color: ev.is_published ? '#4ade80' : '#facc15', border: `1px solid ${ev.is_published ? '#166534' : '#713f12'}` }}>
                    {ev.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ ...tdStyle, display: 'flex', gap: '16px' }}>
                  <Link to={`/admin/events/${ev.id}`} style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>Detail</Link>
                  <Link to={`/admin/events/${ev.id}/registrations`} style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>Registrations</Link>
                  <Link to={`/admin/events/${ev.id}/attendance`} style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>Attendance</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <CreateEventModal onClose={() => setShowModal(false)} onCreated={() => setRefreshKey(k => k + 1)} />}
    </div>
  )
}

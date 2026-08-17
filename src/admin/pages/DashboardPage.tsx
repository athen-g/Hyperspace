import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useRealtimeCount } from '../../hooks/useRealtimeCount'
import { format } from 'date-fns'
import type { Database } from '../../lib/database.types'

type Event = Database['public']['Tables']['events']['Row']
type RegistrationDetail = Database['public']['Views']['registration_details']['Row']

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#111',
      border: '1px solid #1e1e1e',
      borderRadius: '12px',
      padding: '24px',
      flex: 1,
      minWidth: '160px',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '36px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#555' }}>{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { member } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentRegs, setRecentRegs] = useState<RegistrationDetail[]>([])
  const [totalRegs, setTotalRegs] = useState(0)
  const [todayEvent, setTodayEvent] = useState<Event | null>(null)
  const liveAttendance = useRealtimeCount(todayEvent?.id ?? '', 'attendance')

  useEffect(() => {
    const nowIso = new Date().toISOString()

    // Active/Upcoming events (an event completes ONLY after event_end has passed)
    supabase
      .from('events')
      .select('*')
      .or(`event_end.gte.${nowIso},and(event_end.is.null,event_date.gte.${nowIso})`)
      .order('event_start', { ascending: true })
      .then(async ({ data }) => {
        const events = data ?? []
        setUpcomingEvents(events.slice(0, 5))

        if (events.length > 0) {
          const eventIds = events.map(e => e.id)
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .in('event_id', eventIds)
          setTotalRegs(count ?? 0)
        } else {
          setTotalRegs(0)
        }
      })

    // Recent registrations
    supabase.from('registration_details').select('*').order('registered_at', { ascending: false })
      .limit(10).then(({ data }) => setRecentRegs(data ?? []))

    // Today's event (overlaps today)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
    supabase.from('events').select('*')
      .or(`event_end.gte.${startOfDay},and(event_end.is.null,event_date.gte.${startOfDay})`)
      .lte('event_start', endOfDay)
      .limit(1).maybeSingle().then(({ data }) => setTodayEvent(data))
  }, [])

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111' }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '12px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>Welcome back</p>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>{member?.name ?? 'Admin'}</h1>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <StatCard label="Total Events" value={upcomingEvents.length} sub="upcoming" />
        <StatCard label="Total Registrations" value={totalRegs} sub="upcoming events" />
        {todayEvent && <StatCard label="Live Attendance" value={liveAttendance} sub={todayEvent.title} />}
      </div>

      {/* Upcoming events */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e5e5', margin: '0 0 16px' }}>Upcoming Events</h2>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.length === 0 && (
                <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No upcoming events</td></tr>
              )}
              {upcomingEvents.map(ev => (
                <tr key={ev.id}>
                  <td style={{ ...tdStyle, color: '#e5e5e5', fontWeight: 500 }}>{ev.title}</td>
                  <td style={tdStyle}>{format(new Date(ev.event_date), 'dd MMM yyyy')}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: ev.is_published ? '#0a2a0a' : '#1a1a0a', color: ev.is_published ? '#4ade80' : '#facc15', border: `1px solid ${ev.is_published ? '#166534' : '#713f12'}` }}>
                      {ev.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <Link to={`/admin/events/${ev.id}`} style={{ color: '#888', fontSize: '12px', textDecoration: 'none' }}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent registrations */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#e5e5e5', margin: '0 0 16px' }}>Recent Registrations</h2>
        <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Reg No.</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Event</th>
                <th style={thStyle}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {recentRegs.length === 0 && (
                <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No registrations yet</td></tr>
              )}
              {recentRegs.map(r => (
                <tr key={r.id}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.registration_no}</td>
                  <td style={{ ...tdStyle, color: '#e5e5e5' }}>{r.student_name}</td>
                  <td style={tdStyle}>{r.event_title}</td>
                  <td style={tdStyle}>{format(new Date(r.registered_at), 'dd MMM, HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

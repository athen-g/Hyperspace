import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  is_active: boolean
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          setSubscribers(data)
        }
        setLoading(false)
      })
  }, [])

  const filtered = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase()) || 
    (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  )

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111' }

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '12px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>Overview</p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>Newsletter Subscribers</h1>
        </div>
        <input
          type="text"
          placeholder="Search subscribers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: '#0d0d0d',
            border: '1px solid #2a2a2a',
            borderRadius: '6px',
            color: '#fff',
            padding: '8px 16px',
            fontSize: '14px',
            width: '260px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Subscribed At</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#555' }}>Loading subscribers...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No subscribers found</td></tr>
            ) : (
              filtered.map(sub => (
                <tr key={sub.id}>
                  <td style={{ ...tdStyle, color: '#e5e5e5', fontWeight: 500 }}>{sub.name || '—'}</td>
                  <td style={tdStyle}>{sub.email}</td>
                  <td style={tdStyle}>{format(new Date(sub.subscribed_at), 'dd MMM yyyy, HH:mm')}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '3px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      background: sub.is_active ? '#0a2a0a' : '#2a0a0a', 
                      color: sub.is_active ? '#4ade80' : '#f87171', 
                      border: `1px solid ${sub.is_active ? '#166534' : '#991b1b'}` 
                    }}>
                      {sub.is_active ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

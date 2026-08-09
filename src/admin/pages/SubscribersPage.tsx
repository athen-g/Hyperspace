import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

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
  
  // Compose modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [sending, setSending] = useState(false)

  const [testEmail, setTestEmail] = useState('')

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

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !htmlContent) {
      toast.error('Please specify both subject and HTML body.')
      return
    }

    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired. Please log in again.')
        setSending(false)
        return
      }

      const res = await supabase.functions.invoke('send-newsletter', {
        body: { subject, htmlContent, testEmail: testEmail || undefined },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (res.error) {
        let errMsg = res.error.message || String(res.error)
        if (res.error.context && typeof res.error.context.json === 'function') {
          try {
            const body = await res.error.context.clone().json()
            errMsg = body.error || body.message || errMsg
          } catch (e) {}
        }
        throw new Error(errMsg)
      }

      if (res.data?.success) {
        toast.success(testEmail 
          ? `Test email sent successfully to ${testEmail}!` 
          : `Newsletter dispatched successfully to ${res.data.count} active subscribers!`
        )
        setIsModalOpen(false)
        setSubject('')
        setHtmlContent('')
        setTestEmail('')
      } else {
        toast.error(res.data?.error || 'Dispatched failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch newsletter.')
    } finally {
      setSending(false)
    }
  }

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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#E91E63',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✉️ Compose Newsletter
          </button>
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

      {/* Compose Newsletter Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            padding: '24px',
            boxSizing: 'border-box',
          }}>
            <h2 style={{ margin: '0 0 16px', color: '#fff', fontSize: '20px' }}>Compose Newsletter</h2>
            <form onSubmit={handleSendNewsletter}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyperspace August Update!"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d0d0d',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Test Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. admin@test.com (Leave blank to send to all active subscribers)"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d0d0d',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>HTML Content</label>
                <textarea
                  required
                  rows={12}
                  placeholder="<h1>Hello World</h1><p>Check out our latest immersive events...</p>"
                  value={htmlContent}
                  onChange={e => setHtmlContent(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0d0d0d',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={sending}
                  style={{
                    background: 'transparent',
                    border: '1px solid #2a2a2a',
                    borderRadius: '6px',
                    color: '#888',
                    padding: '8px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    background: '#E91E63',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px 24px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {sending ? 'Sending...' : 'Send Newsletter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

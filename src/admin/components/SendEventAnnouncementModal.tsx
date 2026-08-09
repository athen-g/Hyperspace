import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface EventItem {
  id: string
  title: string
  slug: string
  event_date: string
  venue: string | null
}

interface SendEventAnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_TITLE = 'Exciting Announcement: {target_event_name} is coming soon!'

const DEFAULT_MESSAGE = `Hi {subscriber_name},

We are excited to announce our upcoming event: {target_event_name}!

📅 Date: {event_date}
📍 Venue: {venue}

Join us for an immersive hands-on experience in 3D creation and Extended Reality. Seats are limited, so reserve your spot early!

Click here to register: https://hyperspacesig.tech/events/{event_slug}

See you there!
— Hyperspace XR Team`

export default function SendEventAnnouncementModal({ isOpen, onClose, onSuccess }: SendEventAnnouncementModalProps) {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [testEmail, setTestEmail] = useState('')

  const [eventsList, setEventsList] = useState<EventItem[]>([])
  const [targetEventId, setTargetEventId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch events list
  useEffect(() => {
    if (isOpen) {
      supabase
        .from('events')
        .select('id, title, slug, event_date, venue')
        .order('event_date', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setEventsList(data as EventItem[])
            setTargetEventId(data[0].id)
          }
        })
    }
  }, [isOpen])

  const handleClose = () => {
    setTitle(DEFAULT_TITLE)
    setMessage(DEFAULT_MESSAGE)
    setTestEmail('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!targetEventId) {
      toast.error('Please select a target event.')
      return
    }

    if (!title.trim() || !message.trim()) {
      toast.error('Please provide both title and announcement message.')
      return
    }

    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Session expired. Please log in again.')
        setSubmitting(false)
        return
      }

      // Format raw message text into beautiful dark-mode HTML template
      const formattedParagraphs = message
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p style="margin:0 0 16px;font-size:15px;color:#d4d4d4;line-height:1.6;">${line}</p>`)
        .join('')

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #222;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a1a 100%);padding:40px 40px 32px;border-bottom:1px solid #222;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:4px;color:#E91E63;text-transform:uppercase;font-weight:bold;">Hyperspace XR Announcement</p>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <div style="background:#141414;border:1px solid #2a2a2a;border-left:4px solid #E91E63;border-radius:8px;padding:24px;margin-bottom:32px;">
                ${formattedParagraphs}
              </div>

              <!-- Button CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="https://hyperspacesig.tech/events/{event_slug}" target="_blank" style="display:inline-block;padding:14px 32px;background:#E91E63;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;border-radius:8px;letter-spacing:1px;text-transform:uppercase;">
                      Register Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#555;line-height:1.8;border-top:1px solid #222;padding-top:20px;">
                Hyperspace XR SIG<br/>
                <strong style="color:#888;">Immersive Technology Community</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="margin:0 0 8px;font-size:11px;color:#444;text-align:center;">
                Hyperspace XR · Official Event Announcement
              </p>
              <p style="margin:0;font-size:11px;color:#555;text-align:center;">
                If you prefer not to receive future event updates, you can <a href="https://hyperspacesig.tech/unsubscribe?email={subscriber_email}" target="_blank" style="color:#777;text-decoration:underline;">unsubscribe here</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

      const res = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: title,
          htmlContent,
          targetEventId,
          testEmail: testEmail.trim() || undefined
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (res.error) {
        throw new Error(res.error.message || 'Failed to dispatch event announcement.')
      }

      if (testEmail.trim()) {
        toast.success(`Test announcement email sent to ${testEmail}!`)
      } else {
        toast.success(`Event announcement dispatched to ${res.data?.count || 'active'} subscriber(s)!`)
      }

      if (onSuccess) onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send event announcement.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#0e0e0e',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
        color: '#e5e5e5',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              📢 Event Announcement Newsletter
            </h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
              Share details about a new event with all newsletter subscribers
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Event Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Target Event
            </label>
            <select
              value={targetEventId}
              onChange={e => setTargetEventId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              {eventsList.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email Title / Subject
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={DEFAULT_TITLE}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Message Body Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                Announcement Message
              </label>
              <span style={{ fontSize: '11px', color: '#666' }}>
                Variables: &#123;subscriber_name&#125;, &#123;target_event_name&#125;, &#123;event_date&#125;, &#123;venue&#125;, &#123;event_slug&#125;
              </span>
            </div>
            <textarea
              rows={9}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={DEFAULT_MESSAGE}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                lineHeight: 1.5,
                outline: 'none',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Test Email Optional Field */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Send Test Email To (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. admin@example.com (leave blank to send to all subscribers)"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#141414',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px',
                background: '#E91E63',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {submitting ? 'Dispatching Announcement...' : testEmail ? '✉️ Send Test Email' : '📢 Broadcast Event Announcement'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              style={{
                padding: '14px 24px',
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

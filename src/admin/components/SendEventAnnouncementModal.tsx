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

const DEFAULT_TITLE = 'Texture Distortion — Hyperspace XR SIG'

const DEFAULT_MESSAGE = `Hi {subscriber_name},

Hyperspace XR SIG is bringing you its most hands-on event yet — a two-day Blender workshop where you will go from a completely blank viewport to a fully modelled, textured, lit, and rendered 3D scene, built entirely by you.

"From a blank cube to a fully rendered 3D scene — in six hours."

What You'll Build:
Following a structured donut tutorial, you'll model a donut, icing, mug, and plate — then apply physically-based materials, UV-unwrap every surface, scatter sprinkles using Blender's scatter system, and produce a final cinematic render under a three-light setup. The same render you see above is your target. No prior 3D experience required.

What You'll Receive:
Coordinators will distribute all required files on pendrives or external drives — no downloads needed on the day. You'll also receive two workshop documents: a step-by-step workflow guide and a companion reference document, both yours to keep and use after the event.

Event Details:
📅 Dates: 13 – 14 August 2026
⏰ Time: 1:00 PM – 4:00 PM each day
📍 Venue: Room 518, Wadia College of Engineering
🎓 Eligibility: Open to All (Laptop requirements apply — see Rulebook)

⚠️ Pre-registration is mandatory. Walk-in participation is not permitted under any circumstances. Seats are limited — register before they fill up.

The 3D world isn't going to render itself.
— Hyperspace XR SIG`

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

      const renderImageUrl = 'https://raw.githubusercontent.com/athen-g/Hyperspace/feat/texture-distortion-registrations/public/final-render.jpeg'

      // Format raw message text into clean paragraphs
      const formattedParagraphs = message
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          if (line.startsWith('"') && line.endsWith('"')) {
            return `<div style="background:#F4EFE6;border-left:3px solid #A62B56;border-radius:4px;padding:14px 18px;margin:16px 0;font-style:italic;color:#3D3336;font-size:14px;line-height:1.6;">${line}</div>`
          }
          if (line.startsWith('⚠️')) {
            return `<div style="background:#FFF5F5;border:1px solid #FED7D7;border-radius:6px;padding:14px 18px;margin:18px 0;color:#9B2C2C;font-size:13px;line-height:1.6;">${line}</div>`
          }
          if (line.startsWith('What You\'ll') || line.startsWith('Event Details:')) {
            return `<h3 style="margin:20px 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#A62B56;font-weight:700;">${line}</h3>`
          }
          return `<p style="margin:0 0 14px;font-size:15px;color:#2B2527;line-height:1.7;">${line}</p>`
        })
        .join('')

      // Elegant, light beige color scheme (no neon/pink glow)
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#2B2527;">
  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#F7F4EF;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    A hands-on Blender workshop — model, texture, light, and render a complete 3D scene. 13–14 August, Room 518.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EF;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E6DFD5;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height:4px;background:#A62B56;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header Wordmark -->
          <tr>
            <td style="padding:28px 36px 20px;border-bottom:1px solid #F0EADF;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#A62B56;">HYPERSPACE XR SIG</p>
                    <p style="margin:2px 0 0;font-size:10px;color:#7A7073;">Wadia College of Engineering · Dept. of Computer Engineering</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 12px;background:#F6E8EE;border:1px solid #E3B4C5;border-radius:20px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#A62B56;font-weight:700;">New Workshop</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Final Render Image -->
          <tr>
            <td style="padding:0;background:#111;">
              <a href="https://hyperspacesig.tech/events/{event_slug}" target="_blank" style="display:block;text-decoration:none;">
                <img src="${renderImageUrl}" alt="Texture Distortion 3D Scene Render" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Title Block -->
          <tr>
            <td style="padding:28px 36px 8px;background:#FAFAF7;border-bottom:1px solid #F0EADF;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A7073;font-weight:600;">Hyperspace XR SIG Presents</p>
              <h1 style="margin:0;font-size:28px;font-weight:800;color:#1A1416;letter-spacing:-0.5px;line-height:1.1;">
                TEXTURE <span style="color:#A62B56;">Distortion</span>
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#6E6367;font-style:italic;">A two-day hands-on Blender workshop</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:32px 36px;">
              ${formattedParagraphs}

              <!-- Register CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="https://hyperspacesig.tech/events/{event_slug}" target="_blank" style="display:inline-block;padding:14px 32px;background:#A62B56;color:#ffffff;text-decoration:none;font-weight:700;font-size:13px;border-radius:6px;letter-spacing:1px;text-transform:uppercase;">
                      Register for Texture Distortion →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F2EDE4;padding:24px 36px;border-top:1px solid #E6DFD5;">
              <p style="margin:0 0 6px;font-size:10px;color:#7A7073;text-align:center;line-height:1.4;">
                Hyperspace XR SIG · Wadia College of Engineering · Dept. of Computer Engineering, Pune
              </p>
              <p style="margin:0;font-size:10px;color:#7A7073;text-align:center;">
                You are receiving this because you subscribed at hyperspacesig.tech · 
                <a href="https://hyperspacesig.tech/unsubscribe?email={subscriber_email}" target="_blank" style="color:#5C5255;text-decoration:underline;">Unsubscribe</a>
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
              rows={11}
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

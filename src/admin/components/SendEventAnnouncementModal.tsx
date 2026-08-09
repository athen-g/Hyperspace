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

const DEFAULT_TITLE = 'Texture Distortion - Hyperspace XR SIG'

const DEFAULT_MESSAGE = `Hi {subscriber_name},

Hyperspace XR SIG is bringing you its most hands-on event yet - a two-day Blender workshop where you will go from a completely blank viewport to a fully modelled, textured, lit, and rendered 3D scene, built entirely by you.

"From a blank cube to a fully rendered 3D scene - in six hours."

What You'll Build:
Following a structured donut tutorial, you'll model a donut, icing, mug, and plate - then apply physically-based materials, UV-unwrap every surface, scatter sprinkles using Blender's scatter system, and produce a final cinematic render under a three-light setup. The same render you see above is your target. No prior 3D experience required.

What You'll Receive:
Coordinators will distribute all required files on pendrives or external drives - no downloads needed on the day. You'll also receive two workshop documents: a step-by-step workflow guide and a companion reference document, both yours to keep and use after the event.

Event Details:
📅 Dates: 13 - 14 August 2026
⏰ Time: 1:00 PM - 4:00 PM each day
📍 Venue: Room 518, Wadia College of Engineering
🎓 Eligibility: Open to All (Laptop requirements apply - see Rulebook)

⚠️ Pre-registration is mandatory. Walk-in participation is not permitted under any circumstances. Seats are limited - register before they fill up.

The 3D world isn't going to render itself.
- Hyperspace XR SIG`

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

      // Format raw message text without em dashes and clean layout
      const formattedParagraphs = message
        .replace(/—/g, '-')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          if (line.startsWith('"') && line.endsWith('"')) {
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td style="background:rgba(216,75,126,0.08);border:1px solid rgba(216,75,126,0.22);border-left:3px solid #D84B7E;border-radius:4px;padding:16px 20px;"><p style="margin:0;font-size:13.5px;color:rgba(240,230,236,0.95);line-height:1.7;font-style:italic;">${line}</p></td></tr></table>`
          }
          if (line.startsWith('⚠️')) {
            return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td style="background:rgba(216,75,126,0.08);border:1px solid rgba(216,75,126,0.3);border-radius:4px;padding:14px 18px;"><p style="margin:0;font-size:13px;color:rgba(245,210,225,0.95);line-height:1.6;"><strong style="color:#D84B7E;">⚠️ Pre-registration is mandatory.</strong> Walk-in participation is not permitted under any circumstances. Seats are limited - register before they fill up.</p></td></tr></table>`
          }
          if (line.startsWith('What You\'ll') || line.startsWith('Event Details:')) {
            return `<p style="margin:20px 0 8px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#D84B7E;font-weight:700;">${line}</p>`
          }
          return `<p style="margin:0 0 16px;font-size:14px;color:rgba(235,215,225,0.9);line-height:1.75;">${line}</p>`
        })
        .join('')

      // Dark warm espresso / beige tone template matching the render image (zero neon glow, zero em dashes)
      const htmlContent = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#140F11;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#F0E6EA;">

  <!-- Preheader -->
  <div style="display:none;font-size:1px;color:#140F11;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    A hands-on Blender workshop - model, texture, light, and render a complete 3D scene. 13-14 August, Room 518.
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#140F11;padding:32px 12px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#1E1719;border:1px solid #382A2E;border-radius:8px;overflow:hidden;">

          <!-- Top Accent Bar -->
          <tr>
            <td style="height:3px;background:#D84B7E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2D2125;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Wordmark -->
                  <td valign="middle">
                    <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D84B7E;">HYPERSPACE XR SIG</p>
                    <p style="margin:3px 0 0;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(200,175,185,0.6);">Wadia College of Engineering · Dept. of Computer Engineering</p>
                  </td>
                  <!-- Event label -->
                  <td valign="middle" align="right">
                    <span style="display:inline-block;padding:4px 12px;background:rgba(216,75,126,0.12);border:1px solid rgba(216,75,126,0.35);border-radius:20px;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#D84B7E;font-weight:600;">New Event</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Image (Final Donut Render) -->
          <tr>
            <td style="padding:0;background:#0d0a0b;">
              <a href="https://hyperspacesig.tech/events/{event_slug}" target="_blank" style="display:block;text-decoration:none;">
                <img src="${renderImageUrl}"
                     alt="Texture Distortion - a fully modelled, textured, and rendered 3D donut scene built in Blender"
                     width="600"
                     style="display:block;width:100%;max-width:600px;height:auto;border:0;opacity:0.95;" />
              </a>
            </td>
          </tr>

          <!-- Event Name Block -->
          <tr>
            <td style="padding:32px 40px 0;border-top:1px solid #2D2125;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(216,75,126,0.85);font-weight:600;">Hyperspace XR SIG Presents</p>
              <h1 style="margin:0;font-size:30px;font-weight:800;color:#F8EFF3;letter-spacing:-0.5px;line-height:1.05;">
                TEXTURE<br/>
                <span style="color:#D84B7E;font-size:22px;font-weight:700;letter-spacing:0.06em;">Distortion</span>
              </h1>
              <p style="margin:10px 0 0;font-size:13px;color:rgba(210,180,195,0.7);letter-spacing:0.04em;font-style:italic;">A two-day hands-on Blender workshop</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">

              ${formattedParagraphs}

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 32px;">
                <tr>
                  <td style="background:#D84B7E;border-radius:5px;">
                    <a href="https://hyperspacesig.tech/events/{event_slug}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
                      Register for Texture Distortion &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="height:1px;background:#2D2125;font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Sign-off -->
              <p style="margin:0;font-size:13px;color:rgba(200,175,185,0.6);line-height:1.8;">
                The 3D world isn't going to render itself.<br/>
                <strong style="color:rgba(245,225,235,0.85);">- Hyperspace XR SIG</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2D2125;background:#140F11;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:10px;color:rgba(200,175,185,0.45);letter-spacing:0.08em;">
                      Hyperspace XR SIG · Wadia College of Engineering · Dept. of Computer Engineering, Pune
                    </p>
                    <p style="margin:0;font-size:10px;color:rgba(200,175,185,0.35);">
                      You are receiving this because you subscribed at
                      <a href="https://hyperspacesig.tech" target="_blank" style="color:rgba(216,75,126,0.6);text-decoration:none;">hyperspacesig.tech</a>. 
                      <a href="https://hyperspacesig.tech/unsubscribe?email={subscriber_email}" target="_blank" style="color:rgba(200,175,185,0.4);text-decoration:underline;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

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

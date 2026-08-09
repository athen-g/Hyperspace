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

The Briefing
WHAT IS TEXTURE DISTORTION?
Following a structured donut tutorial, you'll model a donut, icing, mug, and plate - then apply physically-based materials, UV-unwrap every surface, scatter sprinkles using Blender's scatter system, and produce a final cinematic render under a three-light setup. The same render you see above is your target. No prior 3D experience required.

What You'll Receive:
Coordinators will distribute all required files on pendrives or external drives - no downloads needed on the day. You'll also receive two workshop documents: a step-by-step workflow guide and a companion reference document, both yours to keep and use after the event.

Event Details:
Dates: 13 - 14 August 2026
Time: 1:00 PM - 4:00 PM each day
Venue: Room 518, Wadia College of Engineering
Eligibility: Open to All (Laptop requirements apply - see Rulebook)

Pre-registration is mandatory. Walk-in participation is not permitted under any circumstances. Seats are limited - register before they fill up.

The 3D world isn't going to render itself.
- Hyperspace XR SIG`

export default function SendEventAnnouncementModal({ isOpen, onClose, onSuccess }: SendEventAnnouncementModalProps) {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [testEmail, setTestEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

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
    setActiveTab('edit')
    onClose()
  }

  // Generate full HTML string matching Brochure Fonts
  const generateFullHtml = () => {
    const renderImageUrl = 'https://raw.githubusercontent.com/athen-g/Hyperspace/feat/texture-distortion-registrations/public/final-render.jpeg'

    // Clean inline SVG icons
    const calendarIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D84B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`
    const clockIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D84B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    const pinIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D84B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
    const badgeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D84B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`
    const alertIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D84B7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:8px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`

    const formattedParagraphs = message
      .replace(/—/g, '-')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        if (line.startsWith('"') && line.endsWith('"')) {
          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;"><tr><td style="background:rgba(216,75,126,0.08);border:1px solid rgba(216,75,126,0.22);border-left:3px solid #D84B7E;border-radius:4px;padding:16px 20px;"><p style="margin:0;font-size:14px;color:rgba(240,230,236,0.95);line-height:1.7;font-style:italic;font-family:'Playfair Display','Italiana',serif;">${line}</p></td></tr></table>`
        }
        if (line.toLowerCase().startsWith('the briefing') || line.toLowerCase().startsWith('the collective')) {
          return `<p style="margin:20px 0 2px;font-family:'Petit Formal Script','Playfair Display',serif;font-style:italic;font-size:16px;color:#D84B7E;">${line}</p>`
        }
        if (line.startsWith('WHAT IS') || line.startsWith('ABOUT HYPERSPACE') || line.startsWith('What You\'ll') || line.startsWith('Event Details:')) {
          return `<h2 style="margin:4px 0 12px;font-family:'Orbitron','Space Grotesk',sans-serif;font-weight:800;font-size:14px;letter-spacing:0.15em;text-transform:uppercase;color:#D84B7E;">${line}</h2>`
        }
        if (line.toLowerCase().startsWith('pre-registration is mandatory')) {
          return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td style="background:rgba(216,75,126,0.08);border:1px solid rgba(216,75,126,0.3);border-radius:4px;padding:14px 18px;"><p style="margin:0;font-size:13px;color:rgba(245,210,225,0.95);line-height:1.6;font-family:'Inter',sans-serif;">${alertIcon}<strong style="color:#D84B7E;">Pre-registration is mandatory.</strong> Walk-in participation is not permitted under any circumstances. Seats are limited - register before they fill up.</p></td></tr></table>`
        }

        // Icon line replacements
        let formattedLine = line
        if (line.startsWith('Dates:')) formattedLine = `${calendarIcon}<strong style="color:#ffffff;">Dates:</strong> ${line.replace('Dates:', '').trim()}`
        else if (line.startsWith('Time:')) formattedLine = `${clockIcon}<strong style="color:#ffffff;">Time:</strong> ${line.replace('Time:', '').trim()}`
        else if (line.startsWith('Venue:')) formattedLine = `${pinIcon}<strong style="color:#ffffff;">Venue:</strong> ${line.replace('Venue:', '').trim()}`
        else if (line.startsWith('Eligibility:')) formattedLine = `${badgeIcon}<strong style="color:#ffffff;">Eligibility:</strong> ${line.replace('Eligibility:', '').trim()}`

        return `<p style="margin:0 0 16px;font-family:'Inter',system-ui,sans-serif;font-size:14px;color:rgba(235,215,225,0.92);line-height:1.75;">${formattedLine}</p>`
      })
      .join('')

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>

  <!-- Brochure Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Orbitron:wght@700;800;900&family=Petit+Formal+Script&family=Playfair+Display:ital,wght@1,600;1,700&family=Space+Grotesk:wght@700&family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#140F11;font-family:'Inter',system-ui,sans-serif;color:#F0E6EA;">

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
                  <!-- Wordmark (Orbitron/Syne) -->
                  <td valign="middle">
                    <p style="margin:0;font-family:'Orbitron','Syne',sans-serif;font-size:13px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#D84B7E;">HYPERSPACE XR SIG</p>
                    <p style="margin:3px 0 0;font-family:'Inter',sans-serif;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(200,175,185,0.6);">Wadia College of Engineering · Dept. of Computer Engineering</p>
                  </td>
                  <!-- Event label -->
                  <td valign="middle" align="right">
                    <span style="display:inline-block;padding:4px 12px;background:rgba(216,75,126,0.12);border:1px solid rgba(216,75,126,0.35);border-radius:20px;font-family:'Inter',sans-serif;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#D84B7E;font-weight:600;">New Event</span>
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

          <!-- Event Name Block (Greenth/Orbitron for TEXTURE, The Seasons/Playfair for Distortion) -->
          <tr>
            <td style="padding:32px 40px 0;border-top:1px solid #2D2125;">
              <p style="margin:0 0 6px;font-family:'Orbitron',sans-serif;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(216,75,126,0.85);font-weight:700;">Hyperspace XR SIG Presents</p>
              <h1 style="margin:0;font-family:'Orbitron','Syne',sans-serif;font-size:32px;font-weight:900;color:#F8EFF3;letter-spacing:0.1em;line-height:1.05;">
                TEXTURE<br/>
                <span style="font-family:'Playfair Display','Italiana',serif;font-style:italic;color:#D84B7E;font-size:26px;font-weight:700;letter-spacing:0.04em;">Distortion</span>
              </h1>
              <p style="margin:10px 0 0;font-family:'Playfair Display','Italiana',serif;font-size:13px;color:rgba(210,180,195,0.7);letter-spacing:0.04em;font-style:italic;">A two-day hands-on Blender workshop</p>
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
                       style="display:inline-block;padding:14px 32px;font-family:'Orbitron','Space Grotesk',sans-serif;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#ffffff;text-decoration:none;">
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
              <p style="margin:0;font-family:'Inter',sans-serif;font-size:13px;color:rgba(200,175,185,0.6);line-height:1.8;">
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
                    <p style="margin:0 0 6px;font-family:'Inter',sans-serif;font-size:10px;color:rgba(200,175,185,0.45);letter-spacing:0.08em;">
                      Hyperspace XR SIG · Wadia College of Engineering · Dept. of Computer Engineering, Pune
                    </p>
                    <p style="margin:0;font-family:'Inter',sans-serif;font-size:10px;color:rgba(200,175,185,0.35);">
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

      const htmlContent = generateFullHtml()

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
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(6px)',
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
        maxWidth: activeTab === 'preview' ? '720px' : '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
        color: '#e5e5e5',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s ease'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
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

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#141414', padding: '4px', borderRadius: '8px', border: '1px solid #222' }}>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'edit' ? '#222' : 'transparent',
              color: activeTab === 'edit' ? '#fff' : '#888',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✏️ Edit Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'preview' ? '#E91E63' : 'transparent',
              color: activeTab === 'preview' ? '#fff' : '#888',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            👁️ Live Email Preview
          </button>
        </div>

        {activeTab === 'preview' ? (
          /* Live Email Preview Frame */
          <div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #333', background: '#140F11', maxHeight: '560px', overflowY: 'auto' }}>
              <iframe
                title="Email Preview"
                srcDoc={generateFullHtml().replaceAll('{subscriber_name}', 'Subscriber').replaceAll('{event_slug}', 'texture-distortion').replaceAll('{subscriber_email}', 'subscriber@example.com')}
                style={{ width: '100%', height: '560px', border: 'none', background: '#140F11' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                style={{ padding: '10px 16px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '8px', color: '#ccc', fontSize: '13px', cursor: 'pointer' }}
              >
                ← Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '10px 24px', background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {submitting ? 'Dispatching...' : testEmail ? '✉️ Send Test Email' : '📢 Broadcast Announcement'}
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
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
        )}
      </div>
    </div>
  )
}

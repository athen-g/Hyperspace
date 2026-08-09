import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { parseEdgeFunctionError } from '../../lib/functions'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  email: string
  phone?: string | null
  college?: string | null
}

interface EventItem {
  id: string
  title: string
  slug: string
  event_date: string
}

interface SendWinnersModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_TITLE = 'Congratulations! You won free entry to {target_event_name}!'

const DEFAULT_MESSAGE = `Hi {name},

Congratulations! Since you came {position} in our last event {event_name}, you get free entry for {target_event_name}!

Your registration pass details are attached below:
Ticket #: {ticket_no}

We look forward to seeing you at the event!

Best regards,
Hyperspace XR Team`

const POSITION_LABELS = [
  '1st Place (Position 1)',
  '2nd Place (Position 2)',
  '3rd Place (Position 3)',
  '4th Place (Position 4)',
  '5th Place (Position 5)',
]

const POSITION_SHORT = ['1st Place', '2nd Place', '3rd Place', '4th Place', '5th Place']

export default function SendWinnersModal({ isOpen, onClose, onSuccess }: SendWinnersModalProps) {
  const { member } = useAuth()
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  const [eventsList, setEventsList] = useState<EventItem[]>([])
  const [sourceEventId, setSourceEventId] = useState<string>('')
  const [targetEventId, setTargetEventId] = useState<string>('')

  const [isWaitlisted, setIsWaitlisted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 5 Winner slots
  const [winnerSlots, setWinnerSlots] = useState<(Student | null)[]>([null, null, null, null, null])

  // Search input per slot
  const [searchTerms, setSearchTerms] = useState<string[]>(['', '', '', '', ''])
  const [searchResults, setSearchResults] = useState<Student[][]>([[], [], [], [], []])
  const [searchingIdx, setSearchingIdx] = useState<number | null>(null)

  // Fetch events list
  useEffect(() => {
    if (isOpen) {
      supabase
        .from('events')
        .select('id, title, slug, event_date')
        .order('event_date', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setEventsList(data as EventItem[])
            setTargetEventId(data[0].id)
            if (data.length > 1) {
              setSourceEventId(data[1].id)
            } else {
              setSourceEventId(data[0].id)
            }
          }
        })
    }
  }, [isOpen])

  // Search students for a specific slot
  const handleSearchChange = (idx: number, value: string) => {
    const newTerms = [...searchTerms]
    newTerms[idx] = value
    setSearchTerms(newTerms)

    if (!value.trim()) {
      const newRes = [...searchResults]
      newRes[idx] = []
      setSearchResults(newRes)
      return
    }

    setSearchingIdx(idx)
    const term = value.trim()
    supabase
      .from('students')
      .select('id, name, email, phone, college')
      .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
      .limit(6)
      .then(({ data }) => {
        const newRes = [...searchResults]
        newRes[idx] = (data as Student[]) || []
        setSearchResults(newRes)
        setSearchingIdx(null)
      })
  }

  const handlePickStudent = (idx: number, student: Student) => {
    const newSlots = [...winnerSlots]
    newSlots[idx] = student
    setWinnerSlots(newSlots)

    // Clear search term & results for this slot
    const newTerms = [...searchTerms]
    newTerms[idx] = ''
    setSearchTerms(newTerms)

    const newRes = [...searchResults]
    newRes[idx] = []
    setSearchResults(newRes)
  }

  const handleClearSlot = (idx: number) => {
    const newSlots = [...winnerSlots]
    newSlots[idx] = null
    setWinnerSlots(newSlots)
  }

  const handleClose = () => {
    setTitle(DEFAULT_TITLE)
    setMessage(DEFAULT_MESSAGE)
    setWinnerSlots([null, null, null, null, null])
    setSearchTerms(['', '', '', '', ''])
    setSearchResults([[], [], [], [], []])
    setIsWaitlisted(false)
    onClose()
  }

  // Calculate next incremental Winner Reg Number prefix (HRA, HRB, HRC...)
  const getNextWinnerPrefix = async (): Promise<string> => {
    const { data } = await supabase
      .from('registrations')
      .select('registration_no')
      .ilike('registration_no', 'HR%-WINNERS-%')

    let maxCharCode = 64 // 'A' - 1

    if (data && data.length > 0) {
      data.forEach(r => {
        // match HR<X>-WINNERS-
        const match = r.registration_no.match(/^HR([A-Z])-WINNERS-/i)
        if (match && match[1]) {
          const code = match[1].toUpperCase().charCodeAt(0)
          if (code > maxCharCode) {
            maxCharCode = code
          }
        }
      })
    }

    const nextChar = String.fromCharCode(maxCharCode + 1)
    return `HR${nextChar}-WINNERS`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const activeWinners = winnerSlots.map((st, i) => ({ student: st, posIdx: i })).filter(item => item.student !== null)

    if (activeWinners.length === 0) {
      toast.error('Please select at least one winner in the top 5 slots.')
      return
    }

    if (!sourceEventId || !targetEventId) {
      toast.error('Please select both Source and Target events.')
      return
    }

    const sourceEvent = eventsList.find(e => e.id === sourceEventId)
    const targetEvent = eventsList.find(e => e.id === targetEventId)

    if (!sourceEvent || !targetEvent) {
      toast.error('Invalid event selection.')
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

      // 1. Get winner prefix for this batch run (e.g. HRA-WINNERS or HRB-WINNERS)
      const winnerPrefix = await getNextWinnerPrefix()

      let successCount = 0

      // 2. Loop through active winners
      for (let seq = 0; seq < activeWinners.length; seq++) {
        const { student, posIdx } = activeWinners[seq]
        if (!student) continue

        const numStr = String(seq + 1).padStart(4, '0')
        const regNo = `${winnerPrefix}-${numStr}`

        // Create or update registration for target event
        const { data: reg, error: regError } = await supabase
          .from('registrations')
          .upsert({
            student_id: student.id,
            event_id: targetEventId,
            registration_no: regNo,
            is_waitlisted: isWaitlisted,
            registered_by: member?.id || null,
            custom_field_data: { winner_source_event: sourceEvent.title, position: POSITION_SHORT[posIdx] }
          }, { onConflict: 'student_id,event_id' })
          .select('id, registration_no')
          .single()

        if (regError || !reg) {
          console.error('Failed to register winner:', student.name, regError)
          continue
        }

        // Sync to waitlist table if waitlisted
        if (isWaitlisted) {
          await supabase.from('waitlist').upsert(
            { student_id: student.id, event_id: targetEventId },
            { onConflict: 'student_id,event_id' }
          )
        }

        // Personalize title & message body
        const posText = POSITION_SHORT[posIdx]
        const personalizedTitle = title
          .replaceAll('{name}', student.name)
          .replaceAll('{position}', posText)
          .replaceAll('{event_name}', sourceEvent.title)
          .replaceAll('{target_event_name}', targetEvent.title)
          .replaceAll('{ticket_no}', reg.registration_no)

        const personalizedMsg = message
          .replaceAll('{name}', student.name)
          .replaceAll('{position}', posText)
          .replaceAll('{event_name}', sourceEvent.title)
          .replaceAll('{target_event_name}', targetEvent.title)
          .replaceAll('{ticket_no}', reg.registration_no)

        // Invoke send-winner-email Edge Function
        const res = await supabase.functions.invoke('send-winner-email', {
          body: {
            registrationId: reg.id,
            title: personalizedTitle,
            message: personalizedMsg,
            positionIdx: posIdx
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        })

        if (res.error) {
          const detail = await parseEdgeFunctionError(res.error)
          console.error('Winner email send failed for:', student.name, detail)
          toast.error(`Failed to send email to ${student.name}: ${detail}`)
        } else {
          successCount++
        }
      }

      toast.success(`Registered and sent winner emails to ${successCount} student(s) (${winnerPrefix})!`)
      if (onSuccess) onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send winner emails.')
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
        maxWidth: '680px',
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
              🏆 Winners Registration & Email
            </h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
              Auto-register winners and send custom entry passes
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

          {/* Event Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
                Source Event (Selected From)
              </label>
              <select
                value={sourceEventId}
                onChange={e => setSourceEventId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#141414',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {eventsList.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
                Target Event (Free Entry Pass)
              </label>
              <select
                value={targetEventId}
                onChange={e => setTargetEventId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: '#141414',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {eventsList.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Top 5 Winners Selection Slots */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#E91E63', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700 }}>
              Top 5 Winners (Select Students from Database — Optional Slots Can Be Left Blank)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {POSITION_LABELS.map((label, idx) => {
                const picked = winnerSlots[idx]
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      background: '#141414',
                      border: '1px solid #222',
                      borderRadius: '10px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                      {label}
                    </div>

                    {picked ? (
                      /* Picked Student Card */
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1c1519', border: '1px solid #E91E63/40', borderRadius: '8px', padding: '8px 12px' }}>
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{picked.name}</span>
                          <span style={{ fontSize: '12px', color: '#888', marginLeft: '10px' }}>({picked.email})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClearSlot(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Clear ✕
                        </button>
                      </div>
                    ) : (
                      /* Search Input for Slot */
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder={`Search student for ${POSITION_SHORT[idx]}...`}
                          value={searchTerms[idx]}
                          onChange={e => handleSearchChange(idx, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: '#0e0e0e',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />

                        {/* Instant Dropdown Search Results */}
                        {searchResults[idx].length > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: '#181818',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                            zIndex: 10,
                            maxHeight: '180px',
                            overflowY: 'auto'
                          }}>
                            {searchResults[idx].map(st => (
                              <div
                                key={st.id}
                                onClick={() => handlePickStudent(idx, st)}
                                style={{
                                  padding: '8px 12px',
                                  borderBottom: '1px solid #222',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: '#ddd',
                                  display: 'flex',
                                  justify: 'space-between',
                                  alignItems: 'center'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#2a1a22'; e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ddd' }}
                              >
                                <div>
                                  <strong style={{ color: '#fff' }}>{st.name}</strong> ({st.email})
                                </div>
                                <span style={{ color: '#E91E63', fontWeight: 600, fontSize: '11px' }}>Select</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Registration Type Option */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
              Winner Registration Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsWaitlisted(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: !isWaitlisted ? '#E91E63/20' : '#141414',
                  border: `1px solid ${!isWaitlisted ? '#E91E63' : '#333'}`,
                  borderRadius: '8px',
                  color: !isWaitlisted ? '#E91E63' : '#888',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ✓ Direct Confirmed Registration
              </button>
              <button
                type="button"
                onClick={() => setIsWaitlisted(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: isWaitlisted ? '#d97706/20' : '#141414',
                  border: `1px solid ${isWaitlisted ? '#d97706' : '#333'}`,
                  borderRadius: '8px',
                  color: isWaitlisted ? '#f59e0b' : '#888',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ⏳ Add to Waitlist
              </button>
            </div>
          </div>

          {/* Message Body Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase' }}>
                Message Body
              </label>
              <span style={{ fontSize: '11px', color: '#666' }}>
                Variables: &#123;name&#125;, &#123;position&#125;, &#123;event_name&#125;, &#123;target_event_name&#125;, &#123;ticket_no&#125;
              </span>
            </div>
            <textarea
              rows={8}
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
              {submitting ? 'Processing Registrations & Sending Emails...' : '🏆 Register Winners & Send Emails'}
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

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface Student {
  id: string
  name: string
  email: string
  phone: string | null
  college: string | null
  branch: string | null
  year: number | null
  division: string | null
}

interface EventItem {
  id: string
  title: string
  slug: string
}

interface ExistingReg {
  id: string
  registration_no: string
  is_waitlisted: boolean
}

interface AddStudentRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  eventId?: string
  onSuccess?: () => void
}

export default function AddStudentRegistrationModal({
  isOpen,
  onClose,
  eventId: initialEventId,
  onSuccess
}: AddStudentRegistrationModalProps) {
  const { member } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [searching, setSearching] = useState(false)

  const [eventsList, setEventsList] = useState<EventItem[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || '')

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [existingReg, setExistingReg] = useState<ExistingReg | null>(null)
  const [checkingReg, setCheckingReg] = useState(false)

  const [isWaitlistedOption, setIsWaitlistedOption] = useState(false)
  const [sendEmailOption, setSendEmailOption] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch events list if eventId not fixed
  useEffect(() => {
    if (isOpen) {
      supabase
        .from('events')
        .select('id, title, slug')
        .order('event_date', { ascending: false })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setEventsList(data)
            if (!initialEventId) {
              setSelectedEventId(data[0].id)
            }
          }
        })
    }
  }, [isOpen, initialEventId])

  useEffect(() => {
    if (initialEventId) {
      setSelectedEventId(initialEventId)
    }
  }, [initialEventId])

  // Search students by name or email
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      const term = searchTerm.trim()
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10)

      if (!error && data) {
        setSearchResults(data as Student[])
      }
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Check if selected student is registered for selected event
  const handleSelectStudent = async (student: Student) => {
    if (!selectedEventId) {
      toast.error('Please select an event first.')
      return
    }

    setSelectedStudent(student)
    setCheckingReg(true)
    setExistingReg(null)

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, registration_no, is_waitlisted')
        .eq('student_id', student.id)
        .eq('event_id', selectedEventId)
        .maybeSingle()

      if (!error && data) {
        setExistingReg(data as ExistingReg)
      }
    } catch (e) {
      console.error('Error checking registration:', e)
    } finally {
      setCheckingReg(false)
    }
  }

  const handleResetSelection = () => {
    setSelectedStudent(null)
    setExistingReg(null)
  }

  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    setSelectedStudent(null)
    setExistingReg(null)
    setIsWaitlistedOption(false)
    setSendEmailOption(true)
    onClose()
  }

  // Handle Promoting Waitlisted Student to Confirmed
  const handleConfirmWaitlisted = async () => {
    if (!existingReg || !selectedStudent || !selectedEventId) return

    setSubmitting(true)
    try {
      // 1. Update registration to is_waitlisted: false
      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ is_waitlisted: false })
        .eq('id', existingReg.id)

      if (updateErr) throw updateErr

      // 2. Remove from waitlist table
      await supabase
        .from('waitlist')
        .delete()
        .eq('student_id', selectedStudent.id)
        .eq('event_id', selectedEventId)

      // 3. Send confirmation email if opted
      if (sendEmailOption) {
        const { error: mailErr } = await supabase.functions.invoke('send-registration-email', {
          body: { registrationId: existingReg.id }
        })
        if (mailErr) console.warn('Email trigger warning:', mailErr)
      }

      toast.success(`Registration confirmed for ${selectedStudent.name}!`)
      if (onSuccess) onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update registration.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Registering Student New
  const handleCreateRegistration = async () => {
    if (!selectedStudent || !selectedEventId) return

    setSubmitting(true)
    try {
      // 1. Generate registration number
      const { data: regNo, error: regNoErr } = await supabase.rpc('generate_registration_no', {
        p_event_id: selectedEventId
      })

      if (regNoErr || !regNo) {
        throw new Error(regNoErr?.message || 'Failed to generate registration number.')
      }

      // 2. Insert registration row
      const { data: newReg, error: insertErr } = await supabase
        .from('registrations')
        .insert({
          student_id: selectedStudent.id,
          event_id: selectedEventId,
          registration_no: regNo,
          is_waitlisted: isWaitlistedOption,
          registered_by: member?.id || null,
          custom_field_data: {}
        })
        .select('id')
        .single()

      if (insertErr || !newReg) throw insertErr

      // 3. Sync to waitlist table if waitlisted
      if (isWaitlistedOption) {
        await supabase
          .from('waitlist')
          .upsert({ student_id: selectedStudent.id, event_id: selectedEventId }, { onConflict: 'student_id,event_id' })
      }

      // 4. Send email if requested
      if (sendEmailOption) {
        const { error: mailErr } = await supabase.functions.invoke('send-registration-email', {
          body: { registrationId: newReg.id }
        })
        if (mailErr) console.warn('Email trigger warning:', mailErr)
      }

      toast.success(
        isWaitlistedOption
          ? `${selectedStudent.name} added to waitlist!`
          : `Successfully registered ${selectedStudent.name} (${regNo})!`
      )

      if (onSuccess) onSuccess()
      handleClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create registration.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const targetEventName = eventsList.find(e => e.id === selectedEventId)?.title || 'Event'

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
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        color: '#e5e5e5',
        fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Add Registration from Students Database
            </h2>
            <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
              Register an existing student directly without student involvement
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {/* Event Selection if not fixed */}
        {!initialEventId && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Target Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value)
                if (selectedStudent) {
                  handleSelectStudent(selectedStudent)
                }
              }}
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
        )}

        {/* Step 1: Student Search */}
        {!selectedStudent ? (
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Search Student (Name or Email)
            </label>
            <input
              type="text"
              placeholder="Type student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
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

            {searching && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
                Searching database...
              </div>
            )}

            {/* Results List */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {searchResults.length === 0 && searchTerm.trim() && !searching && (
                <div style={{ fontSize: '13px', color: '#666', padding: '16px', textAlign: 'center', border: '1px dashed #222', borderRadius: '8px' }}>
                  No students found matching "{searchTerm}"
                </div>
              )}

              {searchResults.map(st => (
                <div
                  key={st.id}
                  onClick={() => handleSelectStudent(st)}
                  style={{
                    padding: '12px 16px',
                    background: '#141414',
                    border: '1px solid #222',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E63'; e.currentTarget.style.background = '#1a1014' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.background = '#141414' }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{st.name}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                      {st.email} {st.phone ? `• ${st.phone}` : ''}
                    </div>
                    {st.college && (
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                        {st.college} {st.branch ? `(${st.branch})` : ''}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#E91E63', padding: '6px 12px', border: '1px solid #E91E63', borderRadius: '6px' }}>
                    Select →
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Step 2: Confirmation & Actions for Selected Student */
          <div>
            {/* Selected Student Card */}
            <div style={{ padding: '14px', background: '#141414', border: '1px solid #333', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '10px', letterSpacing: '2px', color: '#E91E63', textTransform: 'uppercase', fontWeight: 700 }}>Selected Student</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '4px 0 2px' }}>{selectedStudent.name}</h3>
                  <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>{selectedStudent.email}</p>
                </div>
                <button
                  onClick={handleResetSelection}
                  style={{ background: 'transparent', border: '1px solid #333', color: '#888', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  Change
                </button>
              </div>
            </div>

            {checkingReg ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                Checking existing registration status...
              </div>
            ) : existingReg ? (
              existingReg.is_waitlisted ? (
                /* Case: Already Waitlisted -> Ask confirmation to confirm */
                <div style={{ background: '#1c150c', border: '1px solid #d97706', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d97706/20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 700, fontSize: '16px' }}>
                      ⏳
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>Student is Currently Waitlisted</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#d1d5db' }}>Registration #: {existingReg.registration_no}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: 1.5, margin: '12px 0' }}>
                    Do you want to confirm their registration for <strong>{targetEventName}</strong> and move them off the waitlist?
                  </p>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(217, 119, 6, 0.3)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                      <input
                        type="checkbox"
                        checked={sendEmailOption}
                        onChange={(e) => setSendEmailOption(e.target.checked)}
                        style={{ accentColor: '#E91E63' }}
                      />
                      Send confirmation ticket email to student
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button
                      onClick={handleConfirmWaitlisted}
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#E91E63',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {submitting ? 'Confirming...' : 'Confirm Registration & Move Off Waitlist'}
                    </button>
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      style={{
                        padding: '12px 16px',
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
                </div>
              ) : (
                /* Case: Already Confirmed Registered */
                <div style={{ background: '#171113', border: '1px solid #991b1b', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#991b1b/30', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontWeight: 700, fontSize: '16px' }}>
                      ⚠️
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f87171' }}>Student Already Registered</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>Registration #: {existingReg.registration_no}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: 1.5, margin: '10px 0 16px' }}>
                    This student is already confirmed and registered for <strong>{targetEventName}</strong>. No further action is required.
                  </p>

                  <button
                    onClick={handleClose}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#222',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              )
            ) : (
              /* Case: Not Registered -> Options to add new registration */
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Registration Status
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsWaitlistedOption(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: !isWaitlistedOption ? '#E91E63/20' : '#141414',
                        border: `1px solid ${!isWaitlistedOption ? '#E91E63' : '#333'}`,
                        borderRadius: '8px',
                        color: !isWaitlistedOption ? '#E91E63' : '#888',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Direct Confirmed
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsWaitlistedOption(true)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: isWaitlistedOption ? '#d97706/20' : '#141414',
                        border: `1px solid ${isWaitlistedOption ? '#d97706' : '#333'}`,
                        borderRadius: '8px',
                        color: isWaitlistedOption ? '#f59e0b' : '#888',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      ⏳ Add to Waitlist
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px', padding: '12px 14px', background: '#141414', border: '1px solid #222', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                    <input
                      type="checkbox"
                      checked={sendEmailOption}
                      onChange={(e) => setSendEmailOption(e.target.checked)}
                      style={{ accentColor: '#E91E63', width: '16px', height: '16px' }}
                    />
                    Send registration ticket email to student
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleCreateRegistration}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#E91E63',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {submitting ? 'Registering...' : 'Add Registration'}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={submitting}
                    style={{
                      padding: '12px 20px',
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

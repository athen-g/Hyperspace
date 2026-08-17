import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useRegistrations } from '../../hooks/useRegistrations'
import { exportToXLSX, exportToPDF } from '../../lib/export'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { parseEdgeFunctionError } from '../../lib/functions'
import toast from 'react-hot-toast'
import type { Database } from '../../lib/database.types'
import AddStudentRegistrationModal from '../components/AddStudentRegistrationModal'
import SendWinnersModal from '../components/SendWinnersModal'

type RegDetail = Database['public']['Views']['registration_details']['Row']

const PAGE_SIZE = 50

export default function RegistrationsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { registrations, loading, refetch } = useRegistrations(eventId ?? '')
  const { member } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false)

  // College inline editing state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editCollegeValue, setEditCollegeValue] = useState('')
  const [savingCollege, setSavingCollege] = useState(false)

  // Registration details modal state
  const [selectedReg, setSelectedReg] = useState<RegDetail | null>(null)
  const [confirmingRegId, setConfirmingRegId] = useState<string | null>(null)

  // Resend Tix state
  const [sendingTixId, setSendingTixId] = useState<string | null>(null)

  // Single Confirm modal state
  const [singleConfirmTarget, setSingleConfirmTarget] = useState<RegDetail | null>(null)
  const [singleSendMail, setSingleSendMail] = useState(true)
  const [confirmingSingle, setConfirmingSingle] = useState(false)

  // Batch Confirm modal state
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false)
  const [batchSendMail, setBatchSendMail] = useState(true)
  const [confirmingBatch, setConfirmingBatch] = useState(false)

  // Attendance modal state
  const [attendanceTarget, setAttendanceTarget] = useState<RegDetail | null>(null)
  const [markingAttendance, setMarkingAttendance] = useState(false)
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false)
  const [attendanceSearch, setAttendanceSearch] = useState('')

  const isAuthorizedToEdit = member?.role === 'super_admin' || member?.role === 'core'

  const handleMarkAttendance = async (reg: RegDetail, dayNumber: number) => {
    setMarkingAttendance(true)
    try {
      const fnRes = await supabase.functions.invoke('manage-attendance', {
        body: {
          action: 'mark_attendance',
          registrationId: reg.id,
          dayNumber,
          adminId: member?.id
        }
      })

      if (fnRes.error) {
        const msg = await parseEdgeFunctionError(fnRes.error)
        throw new Error(msg)
      }

      toast.success(`Marked Day ${dayNumber} Attendance for ${reg.student_name}!`)
      refetch()
    } catch (err: any) {
      console.error('Mark attendance error:', err)
      toast.error(err.message || 'Failed to mark attendance')
    } finally {
      setMarkingAttendance(false)
    }
  }

  const handleMarkBothDays = async (reg: RegDetail) => {
    setMarkingAttendance(true)
    try {
      // Call 1: Mark Day 1
      const res1 = await supabase.functions.invoke('manage-attendance', {
        body: {
          action: 'mark_attendance',
          registrationId: reg.id,
          dayNumber: 1,
          adminId: member?.id
        }
      })
      if (res1.error) {
        const msg = await parseEdgeFunctionError(res1.error)
        throw new Error(msg)
      }

      // Call 2: Mark Day 2
      const res2 = await supabase.functions.invoke('manage-attendance', {
        body: {
          action: 'mark_attendance',
          registrationId: reg.id,
          dayNumber: 2,
          adminId: member?.id
        }
      })
      if (res2.error) {
        const msg = await parseEdgeFunctionError(res2.error)
        throw new Error(msg)
      }

      toast.success(`Marked BOTH Days (2/2) Attendance for ${reg.student_name}!`)
      refetch()
    } catch (err: any) {
      console.error('Mark attendance error:', err)
      toast.error(err.message || 'Failed to mark attendance')
    } finally {
      setMarkingAttendance(false)
    }
  }

  const waitlistedCount = useMemo(() => registrations.filter(r => r.is_waitlisted).length, [registrations])

  const filtered = useMemo(() =>
    registrations.filter(r =>
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.student_email.toLowerCase().includes(search.toLowerCase()) ||
      (r.student_college && r.student_college.toLowerCase().includes(search.toLowerCase())) ||
      r.registration_no.toLowerCase().includes(search.toLowerCase())
    ), [registrations, search])

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const handleExportXLSX = () => {
    exportToXLSX(filtered.map(r => ({
      'Reg No.': r.registration_no,
      'Name': r.student_name,
      'Email': r.student_email,
      'Phone': r.student_phone ?? '',
      'College': r.student_college ?? '',
      'Branch': r.student_branch ?? '',
      'Year': r.student_year ?? '',
      'Registered At': format(new Date(r.registered_at), 'dd MMM yyyy HH:mm'),
      'Waitlisted': r.is_waitlisted ? 'Yes' : 'No',
      'Walk-in By': r.registered_by_name ?? '',
    })), `registrations-${eventId}`)
  }

  const handleExportPDF = () => {
    exportToPDF(
      ['Reg No.', 'Name', 'Email', 'College', 'Branch', 'Year', 'Registered At'],
      filtered.map(r => [r.registration_no, r.student_name, r.student_email, r.student_college ?? '', r.student_branch ?? '', r.student_year ?? 0, format(new Date(r.registered_at), 'dd MMM HH:mm')]) as (string | number | null)[][],
      `Registrations — ${filtered[0]?.event_title ?? ''}`,
      `registrations-${eventId}`
    )
  }

  const handleStartEditCollege = (r: RegDetail) => {
    if (!isAuthorizedToEdit || !r.student_id) return
    setEditingStudentId(r.student_id)
    setEditCollegeValue(r.student_college ?? '')
  }

  const handleSaveCollege = async (studentId: string) => {
    if (!editCollegeValue.trim()) {
      toast.error('College name cannot be empty')
      return
    }
    setSavingCollege(true)
    try {
      const { error } = await supabase
        .from('students')
        .update({ college: editCollegeValue.trim() })
        .eq('id', studentId)

      if (error) throw error
      toast.success('College updated successfully!')
      setEditingStudentId(null)
      refetch() // Reload registrations with updated details
    } catch (err: any) {
      toast.error(err.message || 'Failed to update college')
    } finally {
      setSavingCollege(false)
    }
  }

  const handleSendTix = async (r: RegDetail) => {
    setSendingTixId(r.id)
    try {
      const { error } = await supabase.functions.invoke('send-registration-email', {
        body: { registrationId: r.id }
      })
      if (error) {
        const detail = await parseEdgeFunctionError(error)
        throw new Error(detail)
      }
      toast.success(`Ticket email sent to ${r.student_name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send ticket email.')
    } finally {
      setSendingTixId(null)
    }
  }

  const handleExecuteSingleConfirm = async () => {
    if (!singleConfirmTarget) return
    setConfirmingSingle(true)
    try {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ is_waitlisted: false })
        .eq('id', singleConfirmTarget.id)

      if (updateError) throw updateError

      if (singleConfirmTarget.student_id && eventId) {
        await supabase
          .from('waitlist')
          .delete()
          .eq('student_id', singleConfirmTarget.student_id)
          .eq('event_id', eventId)
      }

      if (singleSendMail) {
        await supabase.functions.invoke('send-registration-email', {
          body: { registrationId: singleConfirmTarget.id }
        }).catch((_e) => {
          console.error('Failed to trigger confirmation email send:', _e)
        })
      }

      toast.success(`Confirmed registration for ${singleConfirmTarget.student_name}!`)
      setSingleConfirmTarget(null)
      if (selectedReg?.id === singleConfirmTarget.id) {
        setSelectedReg(null)
      }
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm registration')
    } finally {
      setConfirmingSingle(false)
    }
  }

  const handleExecuteBatchConfirm = async () => {
    const waitlisted = registrations.filter(r => r.is_waitlisted)
    if (!eventId || waitlisted.length === 0) return

    setConfirmingBatch(true)
    try {
      const waitlistedIds = waitlisted.map(r => r.id)

      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ is_waitlisted: false })
        .in('id', waitlistedIds)

      if (updateErr) throw updateErr

      const studentIds = waitlisted.map(r => r.student_id).filter(Boolean) as string[]
      if (studentIds.length > 0) {
        await supabase
          .from('waitlist')
          .delete()
          .eq('event_id', eventId)
          .in('student_id', studentIds)
      }

      if (batchSendMail) {
        for (const r of waitlisted) {
          await supabase.functions.invoke('send-registration-email', {
            body: { registrationId: r.id }
          }).catch((_e) => {
            console.error('Batch email send error:', _e)
          })
        }
      }

      toast.success(`Successfully confirmed ${waitlisted.length} waitlisted student(s)!`)
      setIsBatchConfirmOpen(false)
      refetch()
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm waitlisted students.')
    } finally {
      setConfirmingBatch(false)
    }
  }

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111', whiteSpace: 'nowrap' }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/admin/events/${eventId}`} style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Event Detail</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>Registrations <span style={{ fontSize: '16px', color: '#555', fontWeight: 400 }}>({filtered.length})</span></h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsMarkAttendanceModalOpen(true)}
              style={{ padding: '10px 16px', background: '#166534', border: '1px solid #22c55e', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              ⚡ Mark Attendance
            </button>
            <button
              onClick={() => setIsWinnersModalOpen(true)}
              style={{ padding: '10px 16px', background: '#111', border: '1px solid #E91E63', borderRadius: '8px', color: '#E91E63', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              🏆 Winners
            </button>
            {waitlistedCount > 0 && (
              <button
                onClick={() => setIsBatchConfirmOpen(true)}
                style={{ padding: '10px 16px', background: '#d97706', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm All Waitlist ({waitlistedCount})
              </button>
            )}
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              style={{ padding: '10px 16px', background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Register Existing Student
            </button>
            <Link to={`/admin/events/${eventId}/walkin`} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', textDecoration: 'none' }}>+ Walk-in</Link>
            <button onClick={handleExportXLSX} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export XLSX</button>
            <button onClick={handleExportPDF} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export PDF</button>
          </div>
        </div>
      </div>

      <AddStudentRegistrationModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        eventId={eventId}
        onSuccess={refetch}
      />

      <SendWinnersModal
        isOpen={isWinnersModalOpen}
        onClose={() => setIsWinnersModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Search */}
      <input
        placeholder="Search by name, email, college or reg no..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0) }}
        style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
      />

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Reg No.</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>College</th>
              <th style={thStyle}>Registered</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && paginated.length === 0 && <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No registrations found</td></tr>}
            {paginated.map(r => (
              <tr key={r.id}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{r.registration_no}</td>
                <td style={{ ...tdStyle, color: '#e5e5e5' }}>{r.student_name}</td>
                <td style={tdStyle}>{r.student_email}</td>
                <td style={tdStyle}>
                  {editingStudentId === r.student_id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        value={editCollegeValue}
                        onChange={e => setEditCollegeValue(e.target.value)}
                        disabled={savingCollege}
                        style={{
                          background: '#111',
                          border: '1px solid #333',
                          color: '#fff',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleSaveCollege(r.student_id!)}
                        disabled={savingCollege}
                        style={{ background: 'transparent', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => setEditingStudentId(null)}
                        disabled={savingCollege}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}
                      >
                        ✖
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => handleStartEditCollege(r)}
                      style={{
                        cursor: isAuthorizedToEdit ? 'pointer' : 'default',
                        borderBottom: isAuthorizedToEdit ? '1px dotted #555' : 'none'
                      }}
                      title={isAuthorizedToEdit ? 'Click to edit college name' : ''}
                    >
                      {r.student_college ?? '—'}
                    </span>
                  )}
                </td>
                <td style={tdStyle}>{format(new Date(r.registered_at), 'dd MMM, HH:mm')}</td>
                <td style={tdStyle}>
                  {(() => {
                    const isWinner = r.registration_no?.includes('WINNERS')
                    const isWalkIn = r.registered_by_name && !isWinner && r.registration_no?.includes('WALKIN')
                    const isAdminAdded = r.registered_by_name && !isWinner && !isWalkIn

                    if (isWinner) {
                      return (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#3b0764', color: '#e9d5ff', border: '1px solid #7e22ce', fontWeight: 600 }}>
                          🏆 Winner
                        </span>
                      )
                    }
                    if (isWalkIn) {
                      return (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#1a1a0a', color: '#facc15', border: '1px solid #713f12' }}>
                          Walk-in
                        </span>
                      )
                    }
                    if (isAdminAdded) {
                      return (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#032b1d', color: '#6ee7b7', border: '1px solid #047857' }}>
                          Admin
                        </span>
                      )
                    }
                    return (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#0a0a1a', color: '#818cf8', border: '1px solid #3730a3' }}>
                        Online
                      </span>
                    )
                  })()}
                </td>
                {/* Status Column Indicator */}
                <td style={tdStyle}>
                  {r.is_waitlisted ? (
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#78350f/40', color: '#fbbf24', border: '1px solid #b45309', fontWeight: 600 }}>
                      ⏳ Waitlisted
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#166534/40', color: '#4ade80', border: '1px solid #15803d', fontWeight: 600 }}>
                      ✓ Registered
                    </span>
                  )}
                </td>
                {/* Actions Column */}
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>

                    {/* Confirm Button if Waitlisted */}
                    {r.is_waitlisted && (
                      <button
                        onClick={() => setSingleConfirmTarget(r)}
                        style={{
                          background: '#d97706',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Confirm
                      </button>
                    )}

                    {/* Send Tix Button */}
                    <button
                      onClick={() => handleSendTix(r)}
                      disabled={sendingTixId === r.id}
                      style={{
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        color: sendingTixId === r.id ? '#666' : '#E91E63',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: sendingTixId === r.id ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {sendingTixId === r.id ? 'Sending...' : 'Send Tix ✉️'}
                    </button>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedReg(r)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #2a2a2a',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        color: '#888',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>←</button>
          <span style={{ padding: '8px 14px', fontSize: '12px', color: '#555' }}>{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '8px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>→</button>
        </div>
      )}

      {/* Premium Full Details Overlay Modal */}
      {selectedReg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '16px'
        }} onClick={() => setSelectedReg(null)}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1a1a1a', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', color: '#fff', fontWeight: 600, margin: 0, letterSpacing: '1px' }}>REGISTRATION DETAILS</h2>
              <button onClick={() => setSelectedReg(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}>✖</button>
            </div>

            {/* Grid of details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Registration Number</label>
                <div style={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace', marginTop: '4px' }}>{selectedReg.registration_no}</div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Certificate ID</label>
                <div style={{ color: selectedReg.certificate_id ? '#38bdf8' : '#888', fontSize: '14px', fontFamily: 'monospace', marginTop: '4px' }}>{selectedReg.certificate_id ?? '—'}</div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Registered At</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{format(new Date(selectedReg.registered_at), 'dd MMM yyyy, HH:mm')}</div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Full Name</label>
                <div style={{ color: '#e5e5e5', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>{selectedReg.student_name}</div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_email}</div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Phone Number</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_phone ?? '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>College PRN</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_prn ?? '—'}</div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>College</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_college ?? '—'}</div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Branch</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_branch ?? '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Year of Study</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_year ?? '—'}</div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Division</label>
                <div style={{ color: '#aaa', fontSize: '14px', marginTop: '4px' }}>{selectedReg.student_division ?? '—'}</div>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Status</label>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: selectedReg.is_waitlisted ? '#1a0a0a' : '#0a1a0a', color: selectedReg.is_waitlisted ? '#f87171' : '#4ade80', border: `1px solid ${selectedReg.is_waitlisted ? '#7f1d1d' : '#064e3b'}` }}>
                    {selectedReg.is_waitlisted ? 'Waitlisted' : 'Confirmed'}
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '10px', color: '#555', letterSpacing: '1px', textTransform: 'uppercase' }}>Newsletter Subscribers</label>
                <div style={{ color: selectedReg.newsletter_opt_in ? '#4ade80' : '#888', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>
                  {selectedReg.newsletter_opt_in ? 'Subscribed' : 'No'}
                </div>
              </div>
            </div>

            {/* Custom Questions Section */}
            {selectedReg.custom_field_data && Object.keys(selectedReg.custom_field_data as object).length > 0 && (
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px', marginTop: '16px' }}>
                <h3 style={{ fontSize: '11px', color: '#888', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>CUSTOM FORM RESPONSES</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(selectedReg.custom_field_data as object).map(([key, val]) => (
                    <div key={key}>
                      <label style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</label>
                      <div style={{ color: '#e5e5e5', fontSize: '13px', marginTop: '4px', lineHeight: 1.4 }}>{val || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
              {isAuthorizedToEdit && selectedReg.is_waitlisted ? (
                <button
                  onClick={() => setSingleConfirmTarget(selectedReg)}
                  style={{
                    padding: '10px 20px',
                    background: '#E91E63',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(233,30,99,0.3)'
                  }}
                >
                  CONFIRM REGISTRATION
                </button>
              ) : <div />}
              <button onClick={() => setSelectedReg(null)} style={{ padding: '10px 20px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', cursor: 'pointer', fontSize: '13px' }}>Close</button>
            </div>

          </div>
        </div>
      )}

      {/* Single Confirm Confirmation Dialog */}
      {singleConfirmTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#0e0e0e', border: '1px solid #333', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>Confirm Waitlisted Registration</h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
              Confirm registration for <strong>{singleConfirmTarget.student_name}</strong> ({singleConfirmTarget.student_email})?
            </p>
            <div style={{ padding: '12px 14px', background: '#141414', border: '1px solid #222', borderRadius: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                <input
                  type="checkbox"
                  checked={singleSendMail}
                  onChange={e => setSingleSendMail(e.target.checked)}
                  style={{ accentColor: '#E91E63', width: '16px', height: '16px' }}
                />
                Send registration ticket email to student
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExecuteSingleConfirm}
                disabled={confirmingSingle}
                style={{ flex: 1, padding: '12px', background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {confirmingSingle ? 'Confirming...' : 'Confirm Registration'}
              </button>
              <button
                onClick={() => setSingleConfirmTarget(null)}
                disabled={confirmingSingle}
                style={{ padding: '12px 16px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Confirm All Waitlisted Dialog */}
      {isBatchConfirmOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#0e0e0e', border: '1px solid #333', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>Confirm All Waitlisted Registrations</h3>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to confirm all <strong>{waitlistedCount}</strong> waitlisted student(s) for this event?
            </p>
            <div style={{ padding: '12px 14px', background: '#141414', border: '1px solid #222', borderRadius: '8px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                <input
                  type="checkbox"
                  checked={batchSendMail}
                  onChange={e => setBatchSendMail(e.target.checked)}
                  style={{ accentColor: '#E91E63', width: '16px', height: '16px' }}
                />
                Send registration ticket email to each student
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleExecuteBatchConfirm}
                disabled={confirmingBatch}
                style={{ flex: 1, padding: '12px', background: '#d97706', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {confirmingBatch ? 'Processing...' : `Confirm All (${waitlistedCount})`}
              </button>
              <button
                onClick={() => setIsBatchConfirmOpen(false)}
                disabled={confirmingBatch}
                style={{ padding: '12px 16px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Mark Attendance Modal Dialog */}
      {attendanceTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#0e0e0e', border: '1px solid #166534', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '24px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>Mark Attendance</h3>
            </div>
            <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>
              Mark workshop attendance directly for <strong style={{ color: '#fff' }}>{attendanceTarget.student_name}</strong> ({attendanceTarget.student_email}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={() => handleMarkAttendance(attendanceTarget, 1)}
                disabled={markingAttendance}
                style={{ padding: '12px', background: '#166534', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Day 1 (13 Aug)</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>Mark Day 1 →</span>
              </button>

              <button
                onClick={() => handleMarkAttendance(attendanceTarget, 2)}
                disabled={markingAttendance}
                style={{ padding: '12px', background: '#15803d', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Day 2 (14 Aug)</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>Mark Day 2 →</span>
              </button>

              <button
                onClick={() => handleMarkBothDays(attendanceTarget)}
                disabled={markingAttendance}
                style={{ padding: '12px', background: '#E91E63', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>Both Days (2/2)</span>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>⚡ Mark Both Days →</span>
              </button>
            </div>

            <button
              onClick={() => setAttendanceTarget(null)}
              disabled={markingAttendance}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Super Admin Top Header Mark Attendance Modal Dialog */}
      {isMarkAttendanceModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#0e0e0e', border: '1px solid #166534', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>
                Super Admin Mark Attendance
              </h3>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#888' }}>
              Search for any student to mark attendance directly (bypassing security checks).
            </p>

            <input
              placeholder="Type student name, email, or reg no..."
              value={attendanceSearch}
              onChange={e => setAttendanceSearch(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '10px 14px', background: '#141414', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
              {registrations
                .filter(r => attendanceSearch.trim() && (r.student_name.toLowerCase().includes(attendanceSearch.toLowerCase()) || r.student_email.toLowerCase().includes(attendanceSearch.toLowerCase()) || r.registration_no.toLowerCase().includes(attendanceSearch.toLowerCase())))
                .map(st => (
                  <div key={st.id} style={{ padding: '10px 14px', background: '#161616', border: '1px solid #262626', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{st.student_name}</div>
                      <div style={{ fontSize: '11px', color: '#aaa' }}>{st.student_email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {registrations[0]?.event_title?.toLowerCase().includes('texture distortion') ? (
                        <>
                          <button
                            onClick={() => { handleMarkAttendance(st, 1); setIsMarkAttendanceModalOpen(false); }}
                            style={{ padding: '4px 8px', background: '#166534', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Day 1
                          </button>
                          <button
                            onClick={() => { handleMarkAttendance(st, 2); setIsMarkAttendanceModalOpen(false); }}
                            style={{ padding: '4px 8px', background: '#15803d', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Day 2
                          </button>
                          <button
                            onClick={() => { handleMarkBothDays(st); setIsMarkAttendanceModalOpen(false); }}
                            style={{ padding: '4px 8px', background: '#E91E63', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            2/2 Both
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { handleMarkAttendance(st, 1); setIsMarkAttendanceModalOpen(false); }}
                          style={{ padding: '4px 10px', background: '#166534', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setIsMarkAttendanceModalOpen(false)}
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

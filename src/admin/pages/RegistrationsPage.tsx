import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useRegistrations } from '../../hooks/useRegistrations'
import { exportToXLSX, exportToPDF } from '../../lib/export'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import type { Database } from '../../lib/database.types'

type RegDetail = Database['public']['Views']['registration_details']['Row']

const PAGE_SIZE = 50

export default function RegistrationsPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { registrations, loading, refetch } = useRegistrations(eventId ?? '')
  const { member } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  // College inline editing state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editCollegeValue, setEditCollegeValue] = useState('')
  const [savingCollege, setSavingCollege] = useState(false)

  // Registration details modal state
  const [selectedReg, setSelectedReg] = useState<RegDetail | null>(null)

  const isAuthorizedToEdit = member?.role === 'super_admin' || member?.role === 'core'

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

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111', whiteSpace: 'nowrap' }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/admin/events/${eventId}`} style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Event Detail</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>Registrations <span style={{ fontSize: '16px', color: '#555', fontWeight: 400 }}>({filtered.length})</span></h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/admin/events/${eventId}/walkin`} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', textDecoration: 'none' }}>+ Walk-in</Link>
            <button onClick={handleExportXLSX} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export XLSX</button>
            <button onClick={handleExportPDF} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export PDF</button>
          </div>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Search by name, email, college or reg no..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(0) }}
        style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
      />

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Reg No.</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>College</th>
              <th style={thStyle}>Registered</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && paginated.length === 0 && <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No registrations found</td></tr>}
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
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: r.registered_by_name ? '#1a1a0a' : '#0a0a1a', color: r.registered_by_name ? '#facc15' : '#818cf8', border: `1px solid ${r.registered_by_name ? '#713f12' : '#3730a3'}` }}>
                    {r.registered_by_name ? `Walk-in` : 'Online'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setSelectedReg(r)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2a2a2a',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#e5e5e5',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.background = '#111' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.background = 'transparent' }}
                  >
                    View
                  </button>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
              <button onClick={() => setSelectedReg(null)} style={{ padding: '10px 20px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', cursor: 'pointer', fontSize: '13px' }}>Close</button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

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
              <th style={thStyle}>Year</th>
              <th style={thStyle}>Registered</th>
              <th style={thStyle}>Type</th>
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
                <td style={tdStyle}>{r.student_year ?? '—'}</td>
                <td style={tdStyle}>{format(new Date(r.registered_at), 'dd MMM, HH:mm')}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: r.registered_by_name ? '#1a1a0a' : '#0a0a1a', color: r.registered_by_name ? '#facc15' : '#818cf8', border: `1px solid ${r.registered_by_name ? '#713f12' : '#3730a3'}` }}>
                    {r.registered_by_name ? `Walk-in` : 'Online'}
                  </span>
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
    </div>
  )
}

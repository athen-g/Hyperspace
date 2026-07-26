import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAttendance } from '../../hooks/useAttendance'
import { exportToXLSX, exportToPDF } from '../../lib/export'

export default function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { attendance, loading } = useAttendance(eventId ?? '')

  const handleExportXLSX = () => {
    exportToXLSX(attendance.map(a => ({
      'Reg No.': a.registration_no,
      'Name': a.student_name,
      'Email': a.student_email,
      'College': a.student_college ?? '',
      'Branch': a.student_branch ?? '',
      'Year': a.student_year ?? '',
      'Scanned At': format(new Date(a.scanned_at), 'dd MMM yyyy HH:mm'),
      'Scanned By': a.scanned_by_name,
    })), `attendance-${eventId}`)
  }

  const handleExportPDF = () => {
    exportToPDF(
      ['Reg No.', 'Name', 'Email', 'College', 'Scanned At', 'Scanned By'],
      attendance.map(a => [a.registration_no, a.student_name, a.student_email, a.student_college ?? '', format(new Date(a.scanned_at), 'dd MMM HH:mm'), a.scanned_by_name]) as (string | number | null)[][],
      `Attendance \u2014 ${attendance[0]?.event_title ?? ''}`,
      `attendance-${eventId}`
    )
  }

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111', whiteSpace: 'nowrap' }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/admin/events/${eventId}`} style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>← Event Detail</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#fff' }}>
            Attendance <span style={{ fontSize: '16px', color: '#555', fontWeight: 400 }}>({attendance.length})</span>
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleExportXLSX} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export XLSX</button>
            <button onClick={handleExportPDF} style={{ padding: '10px 16px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>Export PDF</button>
          </div>
        </div>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Reg No.</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>College</th>
              <th style={thStyle}>Scanned At</th>
              <th style={thStyle}>Scanned By</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && attendance.length === 0 && <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No attendance recorded yet</td></tr>}
            {attendance.map(a => (
              <tr key={a.id}>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{a.registration_no}</td>
                <td style={{ ...tdStyle, color: '#e5e5e5' }}>{a.student_name}</td>
                <td style={tdStyle}>{a.student_email}</td>
                <td style={tdStyle}>{a.student_college ?? '—'}</td>
                <td style={tdStyle}>{format(new Date(a.scanned_at), 'dd MMM yyyy, HH:mm:ss')}</td>
                <td style={tdStyle}>{a.scanned_by_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

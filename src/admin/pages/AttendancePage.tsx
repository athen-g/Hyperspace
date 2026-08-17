import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useAttendance } from '../../hooks/useAttendance'
import { exportToXLSX, exportToPDF } from '../../lib/export'
import logoUrl from '../../assets/icons/logo.png'
import clogoUrl from '../../assets/icons/clogo.png'

export default function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { attendance, loading } = useAttendance(eventId ?? '')

  const handleExportXLSX = () => {
    exportToXLSX(attendance.map((a, index) => ({
      'Sr. No.': index + 1,
      'Reg No.': a.registration_no,
      'Name': a.student_name,
      'College': a.student_college ?? '',
      'PRN': a.student_prn ?? '',
      'Year': a.student_year ?? '',
      'Branch': a.student_branch ?? '',
      'Division': a.student_division ?? '',
      'Type': a.registered_by ? 'Walk-in' : 'Online',
    })), `attendance-${eventId}`)
  }

  const handleExportPDF = () => {
    exportToPDF(
      ['Sr. No.', 'Reg No.', 'Name', 'College', 'PRN', 'Year', 'Branch', 'Division', 'Type'],
      attendance.map((a, index) => [
        index + 1,
        a.registration_no,
        a.student_name,
        a.student_college ?? '',
        a.student_prn ?? '',
        a.student_year ?? '',
        a.student_branch ?? '',
        a.student_division ?? '',
        a.registered_by ? 'Walk-in' : 'Online'
      ]) as (string | number | null)[][],
      attendance[0]?.event_title ?? 'Event',
      `attendance-${eventId}`,
      logoUrl,
      clogoUrl
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
              <th style={thStyle}>Day 1</th>
              <th style={thStyle}>Day 2</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Scanned At</th>
              <th style={thStyle}>Scanned By</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && attendance.length === 0 && <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No attendance recorded yet</td></tr>}
            {attendance.map(a => {
              const d1 = (a as any).day1_attended || (a as any).notes?.includes('Day 1') || new Date(a.scanned_at).getDate() === 13
              const d2 = (a as any).day2_attended || (a as any).notes?.includes('Day 2') || new Date(a.scanned_at).getDate() === 14

              return (
                <tr key={a.id}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: '#888' }}>{a.registration_no}</td>
                  <td style={{ ...tdStyle, color: '#e5e5e5' }}>{a.student_name}</td>
                  <td style={tdStyle}>{a.student_email}</td>

                  {/* Day 1 Status */}
                  <td style={tdStyle}>
                    {d1 ? (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid #166534', fontWeight: 600 }}>
                        ✓ Present
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #991b1b' }}>
                        ❌ Absent
                      </span>
                    )}
                  </td>

                  {/* Day 2 Status */}
                  <td style={tdStyle}>
                    {d2 ? (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid #166534', fontWeight: 600 }}>
                        ✓ Present
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #991b1b' }}>
                        ❌ Absent
                      </span>
                    )}
                  </td>

                  <td style={tdStyle}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: a.registered_by ? '#1a1a0a' : '#0a0a1a', color: a.registered_by ? '#facc15' : '#818cf8', border: `1px solid ${a.registered_by ? '#713f12' : '#3730a3'}` }}>
                      {a.registered_by ? `Walk-in` : 'Online'}
                    </span>
                  </td>
                  <td style={tdStyle}>{format(new Date(a.scanned_at), 'dd MMM yyyy, HH:mm:ss')}</td>
                  <td style={tdStyle}>{a.scanned_by_name}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

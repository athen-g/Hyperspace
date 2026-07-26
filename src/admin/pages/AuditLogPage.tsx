import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import type { Database } from '../../lib/database.types'

type Log = Database['public']['Tables']['admin_logs']['Row']

export default function AuditLogPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setLogs(data ?? []); setLoading(false) })
  }, [])

  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111' }

  const actionColor = (action: string) => {
    const map: Record<string, string> = { LOGIN: '#818cf8', INSERT: '#4ade80', UPDATE: '#facc15', DELETE: '#f87171', WALKIN: '#fb923c', EXPORT: '#38bdf8' }
    return map[action] ?? '#888'
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>Super Admin</p>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>Audit Log</h1>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Table</th>
              <th style={thStyle}>Record ID</th>
              <th style={thStyle}>Changes</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {!loading && logs.length === 0 && <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>No logs yet</td></tr>}
            {logs.map(log => (
              <>
                <tr key={log.id}>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: actionColor(log.action), background: `${actionColor(log.action)}18` }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>{log.table_name ?? '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{log.record_id?.slice(0, 8) ?? '—'}...</td>
                  <td style={tdStyle}>
                    {(log.old_value || log.new_value) && (
                      <button onClick={() => setExpanded(expanded === log.id ? null : log.id)} style={{ padding: '3px 10px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#555', cursor: 'pointer', fontSize: '11px' }}>
                        {expanded === log.id ? 'Hide' : 'View'}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === log.id && (
                  <tr key={`${log.id}-detail`}>
                    <td colSpan={5} style={{ padding: '0 16px 16px', background: '#080808' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px' }}>
                        {log.old_value && <div><p style={{ margin: '0 0 4px', fontSize: '10px', color: '#555', letterSpacing: '2px' }}>BEFORE</p><pre style={{ margin: 0, fontSize: '11px', color: '#f87171', background: '#1a0a0a', padding: '12px', borderRadius: '6px', overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(log.old_value, null, 2)}</pre></div>}
                        {log.new_value && <div><p style={{ margin: '0 0 4px', fontSize: '10px', color: '#555', letterSpacing: '2px' }}>AFTER</p><pre style={{ margin: 0, fontSize: '11px', color: '#4ade80', background: '#0a1a0a', padding: '12px', borderRadius: '6px', overflow: 'auto', maxHeight: '200px' }}>{JSON.stringify(log.new_value, null, 2)}</pre></div>}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

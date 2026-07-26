import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import type { Database } from '../../lib/database.types'

type CoreMember = Database['public']['Tables']['core_members']['Row']

export default function MembersPage() {
  const [members, setMembers] = useState<CoreMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'volunteer' })
  const [inviting, setInviting] = useState(false)

  const fetchMembers = async () => {
    const { data } = await supabase.from('core_members').select('*').order('created_at')
    setMembers(data ?? [])
    setLoading(false)
  }

  useState(() => { fetchMembers() })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    try {
      const { data, error } = await supabase.functions.invoke('invite-member', { body: inviteForm })
      if (error) throw error
      if (data.success) {
        toast.success(`Invitation sent to ${inviteForm.email}!`)
        setShowInvite(false)
        setInviteForm({ email: '', name: '', role: 'volunteer' })
        fetchMembers()
      } else {
        toast.error(data.error ?? 'Invite failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invite failed')
    } finally {
      setInviting(false)
    }
  }

  const toggleActive = async (member: CoreMember) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('core_members') as any).update({ is_active: !member.is_active }).eq('id', member.id)
    if (error) { toast.error(error.message); return }
    toast.success(`${member.name} ${member.is_active ? 'deactivated' : 'activated'}`)
    fetchMembers()
  }

  const updateRole = async (member: CoreMember, role: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('core_members') as any).update({ role: role as CoreMember['role'] }).eq('id', member.id)
    if (error) { toast.error(error.message); return }
    toast.success(`Role updated`)
    fetchMembers()
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#e5e5e5', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
  const thStyle: React.CSSProperties = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid #1a1a1a' }
  const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: '#aaa', borderBottom: '1px solid #111' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase' }}>Super Admin</p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff' }}>Core Members</h1>
        </div>
        <button onClick={() => setShowInvite(true)} style={{ padding: '12px 24px', background: '#fff', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
          + Invite Member
        </button>
      </div>

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', padding: '32px', color: '#444' }}>Loading...</td></tr>}
            {members.map(m => (
              <tr key={m.id}>
                <td style={{ ...tdStyle, color: '#e5e5e5', fontWeight: 500 }}>{m.name}</td>
                <td style={tdStyle}>
                  <select value={m.role} onChange={e => updateRole(m, e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '4px 10px' }}>
                    <option value="volunteer">Volunteer</option>
                    <option value="core">Core</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', background: m.is_active ? '#0a2a0a' : '#1a1a1a', color: m.is_active ? '#4ade80' : '#555', border: `1px solid ${m.is_active ? '#166534' : '#2a2a2a'}` }}>
                    {m.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button onClick={() => toggleActive(m)} style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '12px' }}>
                    {m.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#fff' }}>Invite Member</h2>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }}>Name *</label><input style={inputStyle} required value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }}>Email *</label><input type="email" style={inputStyle} required value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '6px' }}>Role</label>
                <select style={inputStyle} value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="volunteer">Volunteer</option>
                  <option value="core">Core</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowInvite(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" disabled={inviting} style={{ padding: '10px 20px', background: '#fff', border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>{inviting ? 'Sending...' : 'Send Invite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

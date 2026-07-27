import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import type { Database } from '../../lib/database.types'

type CoreMemberDetail = {
  id: string
  user_id: string
  name: string
  role: string
  is_active: boolean
  created_at: string
  invited_at: string | null
  last_sign_in_at: string | null
  confirmation_sent_at: string | null
  email: string | null
}

export default function MembersPage() {
  const [members, setMembers] = useState<CoreMemberDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'volunteer' })
  const [inviting, setInviting] = useState(false)

  const fetchMembers = async () => {
    try {
      const { data: dbMembers, error: dbError } = await supabase.from('core_members').select('*').order('created_at')
      if (dbError) throw dbError

      let authUsersMap: Record<string, any> = {}
      try {
        const { data: funcData, error: funcError } = await supabase.functions.invoke('invite-member', {
          body: { action: 'list' }
        })
        if (!funcError && funcData?.success && funcData.users) {
          funcData.users.forEach((u: any) => {
            authUsersMap[u.id] = u
          })
        }
      } catch (e) {
        console.error('Failed to load invitation metadata:', e)
      }

      const combined = (dbMembers ?? []).map((m: any) => {
        const authInfo = authUsersMap[m.user_id] || {}
        return {
          ...m,
          email: authInfo.email || null,
          invited_at: authInfo.invited_at || null,
          last_sign_in_at: authInfo.last_sign_in_at || null,
          confirmation_sent_at: authInfo.confirmation_sent_at || null
        }
      })

      setMembers(combined)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
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

  const toggleActive = async (member: CoreMemberDetail) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('core_members') as any).update({ is_active: !member.is_active }).eq('id', member.id)
    if (error) { toast.error(error.message); return }
    toast.success(`${member.name} ${member.is_active ? 'deactivated' : 'activated'}`)
    fetchMembers()
  }

  const handleResendInvite = async (member: CoreMemberDetail) => {
    try {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { action: 'resend', email: member.email }
      })
      if (error) throw error
      if (data.success) {
        toast.success(`Invitation resent to ${member.email}!`)
        fetchMembers()
      } else {
        toast.error(data.error ?? 'Resend failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Resend failed')
    }
  }

  const handleDeleteInvite = async (member: CoreMemberDetail) => {
    if (!confirm(`Are you sure you want to delete the invitation for ${member.name}?`)) return
    try {
      const { data, error } = await supabase.functions.invoke('invite-member', {
        body: { action: 'delete', userId: member.user_id }
      })
      if (error) throw error
      if (data.success) {
        toast.success(`Invitation deleted.`)
        fetchMembers()
      } else {
        toast.error(data.error ?? 'Delete failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const getStatus = (m: CoreMemberDetail) => {
    if (m.last_sign_in_at) {
      return m.is_active ? 'Active' : 'Inactive'
    }
    // If invitation metadata is missing (e.g. Edge Function has not been redeployed yet or user was added manually)
    if (!m.invited_at) {
      return m.is_active ? 'Active' : 'Inactive'
    }
    const inviteDate = new Date(m.invited_at)
    const diffHours = (new Date().getTime() - inviteDate.getTime()) / (1000 * 60 * 60)
    return diffHours > 24 ? 'Expired' : 'Pending'
  }

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const base = { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', display: 'inline-block' }
    switch (status) {
      case 'Active':
        return { ...base, background: '#0a2a0a', color: '#4ade80', border: '1px solid #166534' }
      case 'Inactive':
        return { ...base, background: '#1a1a1a', color: '#555', border: '1px solid #2a2a2a' }
      case 'Pending':
        return { ...base, background: '#2a220a', color: '#facc15', border: '1px solid #713f12' }
      case 'Expired':
        return { ...base, background: '#2a0a0a', color: '#f87171', border: '1px solid #991b1b' }
      default:
        return base
    }
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

      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
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
            {members.map(m => {
              const status = getStatus(m)
              return (
                <tr key={m.id}>
                  <td style={{ ...tdStyle, color: '#e5e5e5', fontWeight: 500 }}>{m.name}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{m.role.replace('_', ' ')}</td>
                  <td style={tdStyle}>
                    <span style={statusBadgeStyle(status)}>
                      {status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {(status === 'Active' || status === 'Inactive') && (
                      <button onClick={() => toggleActive(m)} style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', cursor: 'pointer', fontSize: '12px' }}>
                        {m.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {(status === 'Pending' || status === 'Expired') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {status === 'Expired' && (
                          <button onClick={() => handleResendInvite(m)} style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #166534', borderRadius: '6px', color: '#4ade80', cursor: 'pointer', fontSize: '12px' }}>
                            Resend
                          </button>
                        )}
                        <button onClick={() => handleDeleteInvite(m)} style={{ padding: '4px 12px', background: 'transparent', border: '1px solid #991b1b', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signIn, getCurrentMember } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { Database } from '../../lib/database.types'

type CoreMember = Database['public']['Tables']['core_members']['Row']

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signIn(email, password)

      // Verify this is a core member
      const member = await getCurrentMember() as CoreMember | null
      if (!member) {
        await supabase.auth.signOut()
        toast.error('Not authorised. You are not a registered core member.')
        setLoading(false)
        return
      }

      // Log the login action
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('admin_logs') as any).insert({
          actor_id: member.id,
          action: 'LOGIN',
        })
      } catch (_) { /* non-fatal */ }

      toast.success(`Welcome back, ${member.name}!`)
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '0 24px',
      }}>
        {/* Brand */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '4px', color: '#555', textTransform: 'uppercase' }}>Hyperspace XR</p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Admin Portal</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? '#1a1a1a' : '#ffffff',
              color: loading ? '#555' : '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'all 0.15s ease',
              letterSpacing: '0.5px',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  )
}

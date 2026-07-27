import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function RegisterPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Get the current user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('No active invitation session found. Please request a new invite.')
        navigate('/admin/login')
      } else {
        setEmail(session.user.email ?? '')
      }
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active invitation session found')

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      const { error: activeError } = await supabase
        .from('core_members')
        .update({ is_active: true } as any)
        .eq('user_id', session.user.id)
      if (activeError) throw activeError

      toast.success('Account setup complete! Welcome to the Admin Portal.')
      navigate('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to set password')
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
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '10px', letterSpacing: '4px', color: '#555', textTransform: 'uppercase' }}>Hyperspace XR</p>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>Setup Account</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#666',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Set Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
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
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', marginBottom: '8px' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm password"
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
            />
          </div>

          <button
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
            {loading ? 'Completing setup...' : 'Complete Setup →'}
          </button>
        </form>
      </div>
    </div>
  )
}

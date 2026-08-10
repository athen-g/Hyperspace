import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') || ''

  const [email, setEmail] = useState(emailParam)
  const [status, setStatus] = useState('idle') // 'idle' | 'processing' | 'unsubscribed' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [emailParam])

  const handleUnsubscribe = async (e) => {
    if (e) e.preventDefault()
    if (!email || !email.trim()) {
      toast.error('Please enter a valid email address.')
      return
    }

    setStatus('processing')

    try {
      const targetEmail = email.trim().toLowerCase()

      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', targetEmail)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      setStatus('unsubscribed')
      toast.success('Successfully unsubscribed.')
    } catch (err) {
      console.error('Unsubscribe error:', err)
      setErrorMessage(err.message || 'Failed to unsubscribe. Please try again.')
      setStatus('error')
    }
  }

  const handleResubscribe = async () => {
    if (!email) return
    setStatus('processing')
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: true,
          unsubscribed_at: null,
        })
        .eq('email', email.trim().toLowerCase())

      if (error) throw error

      setStatus('idle')
      toast.success('Resubscribed to Hyperspace XR newsletter!')
    } catch (err) {
      toast.error(err.message || 'Failed to resubscribe.')
      setStatus('unsubscribed')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070707',
      color: '#e5e5e5',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        textAlign: 'center',
      }}>
        {/* Header Logo Badge */}
        <div style={{ marginBottom: '24px' }}>
          <span style={{
            fontSize: '11px',
            letterSpacing: '4px',
            color: '#E91E63',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            HYPERSPACE XR
          </span>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            margin: '8px 0 0',
            letterSpacing: '-0.5px',
          }}>
            Newsletter Subscription
          </h1>
        </div>

        {status === 'unsubscribed' ? (
          <div>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(233, 30, 99, 0.1)',
              border: '1px solid #E91E63',
              color: '#E91E63',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              margin: '0 auto 20px',
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              You've Been Unsubscribed
            </h2>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
              <strong style={{ color: '#fff' }}>{email}</strong> has been removed from our newsletter broadcast list. You will no longer receive event announcements.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleResubscribe}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#888',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Changed your mind? Click to Resubscribe
              </button>
              <Link
                to="/"
                style={{
                  padding: '12px 20px',
                  background: '#E91E63',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Return to Website
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe}>
            <p style={{ color: '#aaa', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
              We're sorry to see you go. Confirm your email address below to unsubscribe from Hyperspace XR updates.
            </p>

            <div style={{ marginBottom: '24px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '2px',
                color: '#666',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="enter your email address"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#181818',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 16px' }}>
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'processing'}
              style={{
                width: '100%',
                padding: '14px',
                background: '#E91E63',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(233, 30, 99, 0.3)',
              }}
            >
              {status === 'processing' ? 'Unsubscribing...' : 'Unsubscribe Me'}
            </button>

            <div style={{ marginTop: '20px' }}>
              <Link to="/" style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}>
                ← Cancel & Return to Hyperspace
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

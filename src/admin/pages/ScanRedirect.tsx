import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/**
 * /scan?token=<uuid>
 * Redirects to /admin/scanner with token pre-filled.
 * If the user is not logged in, they'll be redirected to login first (handled by ProtectedRoute on /admin/scanner).
 */
export default function ScanRedirect() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      navigate(`/admin/scanner?token=${token}`, { replace: true })
    } else {
      navigate('/admin/scanner', { replace: true })
    }
  }, [params, navigate])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '14px', letterSpacing: '2px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      REDIRECTING...
    </div>
  )
}

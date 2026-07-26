import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: ('super_admin' | 'core' | 'volunteer')[]
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { member, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a', color: '#555', fontSize: '14px', letterSpacing: '2px' }}>
        LOADING...
      </div>
    )
  }

  if (!isAuthenticated || !member) {
    return <Navigate to="/admin/login" replace />
  }

  if (roles && !roles.includes(member.role)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <h2 style={{ color: '#e5e5e5', fontSize: '24px', margin: 0 }}>Access Denied</h2>
        <p style={{ color: '#888', margin: 0 }}>You don't have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

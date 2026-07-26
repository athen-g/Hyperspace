import { Outlet, useLocation } from 'react-router-dom'
import AdminNav from './components/AdminNav'

const SCANNER_PATH = '/admin/scanner'

export default function AdminApp() {
  const location = useLocation()
  const isScanner = location.pathname === SCANNER_PATH
  const isLogin = location.pathname === '/admin/login'

  if (isLogin || isScanner) {
    return <Outlet />
  }

  return (
    <div className="admin-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <AdminNav />
      <main style={{
        flex: 1,
        marginLeft: '240px',
        padding: '32px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  )
}

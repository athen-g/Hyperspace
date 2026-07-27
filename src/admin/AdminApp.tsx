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
    <div className="admin-layout">
      <AdminNav />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

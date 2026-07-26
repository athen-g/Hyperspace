import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from '../../lib/auth'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '⬛' },
  { label: 'Events', path: '/admin/events', icon: '📅' },
  { label: 'Scanner', path: '/admin/scanner', icon: '📷' },
]

const superAdminItems = [
  { label: 'Members', path: '/admin/members', icon: '👥' },
  { label: 'Audit Log', path: '/admin/logs', icon: '📋' },
]

export default function AdminNav() {
  const { member } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const linkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '8px',
    color: isActive ? '#ffffff' : '#888',
    background: isActive ? '#1a1a1a' : 'transparent',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.15s ease',
    border: isActive ? '1px solid #2a2a2a' : '1px solid transparent',
  })

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '240px',
      height: '100vh',
      background: '#0d0d0d',
      borderRight: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <p style={{ margin: 0, fontSize: '10px', letterSpacing: '3px', color: '#555', textTransform: 'uppercase' }}>Hyperspace XR</p>
        <h2 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>Admin Portal</h2>
      </div>

      {/* Nav items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => linkStyle(isActive)}>
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {member?.role === 'super_admin' && (
          <>
            <div style={{ margin: '12px 0 8px', fontSize: '10px', letterSpacing: '2px', color: '#444', paddingLeft: '8px', textTransform: 'uppercase' }}>Super Admin</div>
            {superAdminItems.map(item => (
              <NavLink key={item.path} to={item.path} style={({ isActive }) => linkStyle(isActive)}>
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </div>

      {/* User info + sign out */}
      <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
        {member && (
          <div style={{ marginBottom: '12px', paddingLeft: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#e5e5e5' }}>{member.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>{member.role}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#888',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#e5e5e5'; (e.target as HTMLButtonElement).style.borderColor = '#444' }}
          onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#888'; (e.target as HTMLButtonElement).style.borderColor = '#2a2a2a' }}
        >
          Sign Out →
        </button>
      </div>
    </nav>
  )
}

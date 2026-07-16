import { useMediaQuery } from 'react-responsive'
import logo from '../assets/icons/logo.svg'

export default function Header() {

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const handleNavClick = (e, href) => {
    e.preventDefault()
    window.history.pushState(null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <header className="site-header" style={{
      boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
    }}>
      <div className="site-header__inner">
        <div className="site-header__title">
          <a href="/" onClick={(e) => handleNavClick(e, '/')} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="Logo" className='logo-header' />
            <span className="site-header__brand">HYPERSPACE</span>
          </a>
        </div>
        <nav className="site-header__nav">
          <a href="/team" onClick={(e) => handleNavClick(e, '/team')} className="site-header__link">TEAM</a>
          <a href="/news" onClick={(e) => handleNavClick(e, '/news')} className="site-header__link">NEWS</a>
          <a href="/blogs" onClick={(e) => handleNavClick(e, '/blogs')} className="site-header__link">BLOG</a>
        </nav>
      </div>
    </header>
  )
}

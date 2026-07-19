import { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import logo from '../assets/icons/logo.svg'
import { BLOGS } from '../../constants/index'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate();
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname)

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const handleNavClick = (e, href) => {
    e.preventDefault()
    navigate(href);
  }

  const isBlogDetailRoute = BLOGS.some(({ route }) => route === pathname)
  const isActive = (href) => {
    if (href === '/blog') {
      return pathname === '/blog' || isBlogDetailRoute
    }

    return pathname === href
  }

  return (

    <header className="site-header" style={{
      boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
    }}>
      <div className="site-header__inner">
        <div className="site-header__title">
          <a href="/" onClick={(e) => handleNavClick(e, '/')} className="site-header__brand-link">
            <img src={logo} alt="Logo" className="logo-header pb-[10px]" />
            <span className="site-header__brand">HYPERSPACE</span>
          </a>
        </div>
        <nav className="site-header__nav">
          <a
            href="/team"
            onClick={(e) => handleNavClick(e, '/team')}
            className={`site-header__link header-roll-link ${isActive('/team') ? 'nav-link--active' : ''}`}
            aria-current={isActive('/team') ? 'page' : undefined}
          >
            <span className="header-roll-link__stack">
              <span className="header-roll-link__face header-roll-link__face--current">TEAM</span>
              <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">TEAM</span>
            </span>
          </a>
          <a
            href="/news"
            onClick={(e) => handleNavClick(e, '/news')}
            className={`site-header__link header-roll-link ${isActive('/news') ? 'nav-link--active' : ''}`}
            aria-current={isActive('/news') ? 'page' : undefined}
          >
            <span className="header-roll-link__stack">
              <span className="header-roll-link__face header-roll-link__face--current">NEWS</span>
              <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">NEWS</span>
            </span>
          </a>
          <a
            href="/blog"
            onClick={(e) => handleNavClick(e, '/blogs')}
            className={`site-header__link header-roll-link ${isActive('/blog') ? 'nav-link--active' : ''}`}
            aria-current={isActive('/blogs') ? 'page' : undefined}
          >
            <span className="header-roll-link__stack">
              <span className="header-roll-link__face header-roll-link__face--current">BLOG</span>
              <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">BLOG</span>
            </span>
          </a>
        </nav>
      </div>
    </header>
  )
}

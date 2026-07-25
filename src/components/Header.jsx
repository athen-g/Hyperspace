import { useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import logo from '../assets/icons/logo.svg'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const isTablet = useMediaQuery({ query: '(max-width: 1024px)' })
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const handleNavClick = (e, href) => {
    e.preventDefault()
    setIsOpen(false)
    navigate(href)
  }

  const isActive = (href) => {
    switch (href) {
      case '/blogs':
        return pathname.startsWith('/blogs') || pathname.startsWith('/blog')
      case '/news':
        return pathname.startsWith('/news')
      case '/events':
        return pathname.startsWith('/events')
      case '/team':
        return pathname.startsWith('/team')
      case '/about':
        return pathname.startsWith('/about')
      default:
        return pathname === href
    }
  }

  const toggleMenu = () => setIsOpen((prev) => !prev)

  return (
    <>
      <header
        className="site-header"
        style={{
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div className={`site-header__inner relative ${isMobile ? 'px-4' : ''}`}>
          <div className={`site-header__title ${isMobile ? '!ml-0 !gap-2' : ''}`}>
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="site-header__brand-link">
              <img src={logo} alt="Logo" className={`logo-header pb-[10px] ${isMobile ? '!w-[36px] !h-[36px]' : ''}`} />
              <span className={`site-header__brand ${isMobile ? '!text-[26px] !tracking-[3px]' : ''}`}>HYPERSPACE</span>
            </a>
          </div>

          {!isTablet ? (
            <nav className="site-header__nav mr-8">
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
                className={`site-header__link header-roll-link ${isActive('/blogs') ? 'nav-link--active' : ''}`}
                aria-current={isActive('/blogs') ? 'page' : undefined}
              >
                <span className="header-roll-link__stack">
                  <span className="header-roll-link__face header-roll-link__face--current">BLOG</span>
                  <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">BLOG</span>
                </span>
              </a>
            </nav>
          ) : (
            <button
              onClick={toggleMenu}
              className="mr-[3.472%] w-16 h-11 flex items-center justify-center bg-[#1a1a1a] hover:bg-[#252525] text-white border border-white/10 transition-all duration-200 cursor-pointer overflow-hidden relative"
              aria-label="Toggle Navigation Menu"
            >
              {/* Custom Animated 2-Line Icon morphing to Cross (White, 1.5px thin) */}
              <div className="w-6 h-5 relative flex flex-col justify-center items-center">
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 0 : -3.5,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute w-5 h-[1.5px] bg-white rounded-full origin-center"
                />
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? 0 : 3.5,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute w-5 h-[1.5px] bg-white rounded-full origin-center"
                />
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Tablet/Mobile Dropdown Navigation Overlay with Header Absorption Animation */}
      <AnimatePresence>
        {isTablet && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0.2, scaleY: 0.85 }}
            animate={{ height: "auto", opacity: 1, scaleY: 1 }}
            exit={{ height: 0, opacity: 0, scaleY: 0.85 }}
            style={{ transformOrigin: "top center" }}
            transition={{
              height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.25, ease: "easeInOut" },
              scaleY: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            }}
            className="fixed top-[90px] inset-x-0 bg-[#0d0d0d] z-[999] border-b border-light-grey shadow-2xl overflow-hidden"
          >
            {/* Inner Content with inverse y-parallax for smooth expansion/absorption */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Guide lines aligned exactly with 3.472% and 96.528% */}
              <div className="absolute inset-y-0 left-[3.472%] w-[0.5px] bg-light-grey pointer-events-none z-[10]" />
              <div className="absolute inset-y-0 left-[96.528%] w-[0.5px] bg-light-grey pointer-events-none z-[10]" />

              <div className="w-full flex flex-col justify-between max-w-[1550px] mx-auto px-[3.472%] pt-8 pb-8 relative z-[5]">
                <nav className="flex flex-col gap-0 pl-4 md:pl-8">
                  {[
                    { name: 'TEAM', href: '/team' },
                    { name: 'NEWS', href: '/news' },
                    { name: 'BLOG', href: '/blogs' },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      style={{ fontFamily: "'Host Grotesk', sans-serif" }}
                      className={`text-[30px] font-bold tracking-wider hover:text-white transition-colors py-0 cursor-pointer ${isActive(item.href) ? 'text-white' : 'text-[#ABABAB]'
                        }`}
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>

                {/* Bottom Action Bar */}
                <div className="pt-6 border-t border-light-grey mt-8 px-4 md:px-8 flex items-center justify-between">
                  <button
                    onClick={(e) => handleNavClick(e, '/events')}
                    style={{ fontFamily: "'Host Grotesk', sans-serif" }}
                    className="w-full flex items-center justify-between text-white text-[16px] font-bold tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer py-1"
                  >
                    <span>VIEW ALL EVENTS</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

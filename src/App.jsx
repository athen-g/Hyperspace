import { useEffect, useRef, useState } from 'react'
import LandingPage from './components/LandingPage'

function App() {
  const progressRef = useRef(null)
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      if (progressRef.current) {
        progressRef.current.style.width = progress + '%'
      }
    }

    const handlePopState = () => setPath(window.location.pathname)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  // Route handling
  const renderPage = () => {
    switch (path) {
      case '/':
      case '/home':
        return <LandingPage />
      case '/team':
        return <div className="blog-hero"><div className="hero-bg"></div><div className="hero-name"><span className="hero-title">TEAM</span></div></div>
      case '/news':
        return <div className="blog-hero"><div className="hero-bg"></div><div className="hero-name"><span className="hero-title">NEWS</span></div></div>
      case '/blog':
        return <div className="blog-hero"><div className="hero-bg"></div><div className="hero-name"><span className="hero-title">BLOG</span></div></div>
      default:
        return <LandingPage />
    }
  }

  return (
    <>
      <div className="reading-progress" ref={progressRef}></div>
      {renderPage()}
    </>
  )
}

export default App
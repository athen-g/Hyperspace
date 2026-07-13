import { useEffect, useRef, useState } from 'react'
import Hero from './components/Hero'

const routes = {
  '/': <Hero />,
  '/about': <section className="blog-hero"><div className="hero-name"><span className="hero-title">ABOUT</span></div></section>,
  '/events': <section className="blog-hero"><div className="hero-name"><span className="hero-title">EVENTS</span></div></section>,
}

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

  const currentView = routes[path] ?? routes['/']

  return (
    <>
      <div className="reading-progress" ref={progressRef}></div>
      {currentView}
    </>
  )
}

export default App

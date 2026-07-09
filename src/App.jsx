import { useEffect, useRef } from 'react'
import BackgroundLines from './BackgroundLines'
import './App.css'

function App() {
  const progressRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      if (progressRef.current) {
        progressRef.current.style.width = progress + '%'
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <BackgroundLines />
      <div className="reading-progress" ref={progressRef}></div>
      <section className="blog-hero">
        <div className="hero-bg"></div>
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
        <div className="hero-name">
          <span className="hero-title">HYPERSPACE</span>
          <span className="hero-subtitle">XR SIG</span>
        </div>
      </section>
    </>
  )
}

export default App

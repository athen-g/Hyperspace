import { useEffect, useRef, useState } from 'react'
import LandingPage from './components/LandingPage'
import gsap from 'gsap'
import { ScrollTrigger, SplitText } from 'gsap/all';
import Blog from './components/Blog';
import BlogPage from './components/BlogPage'
import { BLOGS, EVENTS_CONDUCTED } from '../constants/index'
import EventsPage from './components/EventsPage';

gsap.registerPlugin(ScrollTrigger, SplitText);

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

  const renderPage = () => {
    const isBlogPostRoute = BLOGS.some(({ route }) => route === path)
    const isEventPostRoute = EVENTS_CONDUCTED.some(({ route }) => route === path)

    switch (path) {
      case '/':
      case '/home':
        return <LandingPage />
      case '/events':
        return <EventsPage />
      case '/team':
        return <div className="blog-hero"><div className="hero-bg"></div><div className="hero-name"><span className="hero-title">TEAM</span></div></div>
      case '/news':
        return <div className="blog-hero"><div className="hero-bg"></div><div className="hero-name"><span className="hero-title">NEWS</span></div></div>
      case '/blog':
        return <Blog />
      default:
        if (isBlogPostRoute) {
          return <BlogPage />
        } else if(isEventPostRoute) {
          return <EventsPage />
        }
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
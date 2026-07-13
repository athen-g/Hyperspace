import React, { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { NAV_ITEMS } from '../../constants'

const Navbar = () => {
  const isIconOnly = useMediaQuery({
    query: '(max-width: 414px)',
  })

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)',
  })

  const [activeItem, setActiveItem] = useState('home')
  const [pillPosition, setPillPosition] = useState(0)
  const navRef = useRef(null)

  useEffect(() => {
    const observers = NAV_ITEMS.map((item) => {
      const section = document.querySelector(item.sectionId)
      if (!section) return null

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveItem(item.id)
            }
          })
        },
        {
          threshold: 0.5,
        }
      )

      observer.observe(section)
      return observer
    })

    return () => {
      observers.forEach((observer) => {
        if (observer) observer.disconnect()
      })
    }
  }, [])

  useEffect(() => {
    const itemIndex = NAV_ITEMS.findIndex((item) => item.id === activeItem)
    if (itemIndex !== -1) {
      const itemWidth = 100 / NAV_ITEMS.length
      setPillPosition(itemIndex * itemWidth)
    }
  }, [activeItem])

  const handleNavClick = (e, item) => {
    e.preventDefault()
    const section = document.querySelector(item.sectionId)
    if (section) {
      setActiveItem(item.id)
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__pill" style={{ left: `${pillPosition}%` }}></div>

      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          id={`navbar-${item.id}`}
          href={item.sectionId}
          className={`navbar__item ${activeItem === item.id ? 'navbar__item--active' : ''}`}
          onClick={(e) => handleNavClick(e, item)}
          aria-current={activeItem === item.id ? 'page' : undefined}
        >
          <img src={item.icon} alt={item.label} className="navbar__icon" />
          {!isIconOnly && <span className="navbar__label">{item.label}</span>}
        </a>
      ))}
    </nav>
  )
}

export default Navbar

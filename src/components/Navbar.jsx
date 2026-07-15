import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
    let rafId = 0

    const updateActiveItem = () => {
      if (window.scrollY <= 24) {
        setActiveItem('home')
        return
      }

      const triggerLine = window.innerHeight * 0.42

      const nextActiveItem = NAV_ITEMS.reduce((currentActive, item) => {
        const section = document.querySelector(item.sectionId)
        if (!section) return currentActive

        const rect = section.getBoundingClientRect()
        const sectionTop = rect.top
        const sectionBottom = rect.bottom
        const currentSection = currentActive
          ? document.querySelector(currentActive.sectionId)
          : null

        if (sectionTop <= triggerLine && sectionBottom > triggerLine) {
          return item
        }

        if (!currentSection) {
          return item
        }

        const currentRect = currentSection.getBoundingClientRect()
        const currentDistance = Math.abs(currentRect.top - triggerLine)
        const nextDistance = Math.abs(sectionTop - triggerLine)

        return nextDistance < currentDistance ? item : currentActive
      }, NAV_ITEMS[0])

      if (nextActiveItem) {
        setActiveItem(nextActiveItem.id)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateActiveItem)
    }

    updateActiveItem()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useLayoutEffect(() => {
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
    <nav className="navbar backdrop-blur-xl rounded-full"
      style={{
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.04)",
      }} ref={navRef}>
      <div
        className="navbar__pill"
        style={{ left: `${pillPosition}%` }}
      />

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

import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from './Hero'
import Events from './Events'
import About from './About'
import Contact from './Contact'
import Navbar from './Navbar'
import Footer from './Footer'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Brands from './Brands'
import Blog_Home from './Blog_Home'
import Testimonials from './Testimonials'
import Team_Home from './Team_Home'
import FAQ from './FAQ'

const LandingPage = () => {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const elem = document.querySelector(hash)
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [hash])

  return (
    <>

      <Header />
      <BackgroundLines />
      <Hero />
      <About />
      <Brands />
      <Events />
      <Blog_Home />
      <Testimonials />
      <Team_Home />
      <FAQ />
      <Contact />
      <Footer />
      <Navbar />
    </>
  )
}

export default LandingPage
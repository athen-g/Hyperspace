import React from 'react'
import Hero from './Hero'
import Events from './Events'
import About from './About'
import Contact from './Contact'
import Navbar from './Navbar'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Brands from './Brands'

const LandingPage = () => {
  return (
    <>

      <Header />
      <BackgroundLines />
      <Hero />
      <About />
      <Brands />
      <Events />
      <Contact />
      <Navbar />
    </>
  )
}

export default LandingPage
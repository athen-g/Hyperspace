import React from 'react'
import Hero from './Hero'
import Events from './Events'
import About from './About'
import Contact from './Contact'
import Navbar from './Navbar'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Brands from './Brands'
import Blog_Home from './Blog_Home'

const LandingPage = () => {
  return (
    <>

      <Header />
      <BackgroundLines />
      <Hero />
      <About />
      <Brands />
      <Events />
      <Blog_Home />
      <Contact />
      <Navbar />
    </>
  )
}

export default LandingPage
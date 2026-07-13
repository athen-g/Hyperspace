import { BackgroundPathsDemo } from './ui/BackgroundPaths'
import BackgroundLines from './ui/BackgroundLines'
import Header from './Header'

export default function Hero() {
  return (
    <>
      <Header />
        <BackgroundLines />
      <section className="blog-hero">
        <div className="hero-bg"></div>
        <BackgroundPathsDemo />
        <div className="hero-name">
          <span className="hero-title">HYPERSPACE</span>
          <span className="hero-subtitle">XR SIG</span>
        </div>
      </section>
    </>
  )
}

import logo from '../assets/photos/Logo.svg'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__title">
        <img src={logo} alt="Logo" className='logo-header' />
        <span className="site-header__brand">HYPERSPACE</span>
        </div>
        <nav className="site-header__nav">
          <a href="/" className="site-header__link">TEAM</a>
          <a href="/about" className="site-header__link">NEWS</a>
          <a href="/events" className="site-header__link">BLOG</a>
        </nav>
      </div>
    </header>
  )
}

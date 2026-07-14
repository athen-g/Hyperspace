import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Figma background vertical grid lines */}
      <div className="footer-background-lines">
        <div className="line l1"></div>
        <div className="line l2"></div>
        <div className="line l3"></div>
        <div className="line l4"></div>
        <div className="line l5"></div>
      </div>

      <div className="footer-grid">
        {/* Col 1: Logo & Brand Info */}
        <div className="footer-brand-col">
          <a className="footer-logo" href="#home">
            <img src="/favicon.svg" alt="Hyperspace Logo" className="footer-logo-img" style={{ width: "38px", height: "38px", objectFit: "contain" }} />
            <span className="footer-logo-text">Hyperspace</span>
          </a>
          <p className="footer-brand-subtitle">
            <span className="pink-highlight">HVVVVV</span> CLARITY, PURPOSE, AND PRECISION.
          </p>
        </div>

        {/* Col 2: Navigate List */}
        <div className="footer-nav-col">
          <ul className="footer-links-list">
            <li><a href="#home">HOME <span className="arrow">→</span></a></li>
            <li><a href="#about">ABOUT <span className="arrow">→</span></a></li>
            <li><a href="#events">WORKS <span className="arrow">→</span></a></li>
            <li><a href="/blog">BLOGS <span className="arrow">→</span></a></li>
            <li><a href="#contact">CONTACT <span className="arrow">→</span></a></li>
          </ul>
        </div>

        {/* Col 3: Follow On List */}
        <div className="footer-follow-col">
          <div className="footer-title-pink">FOLLOW ON</div>
          <ul className="footer-social-links">
            <li><a href="#" target="_blank" rel="noopener noreferrer">YOUTUBE</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">INSTAGRAM</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">WHATSAPP</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LINKEDIN</a></li>
          </ul>
        </div>

        {/* Col 4: Tagline & Credits */}
        <div className="footer-tagline-col">
          <p className="footer-statement">
            <span className="pink-text">CREATING EXPERIENCES THAT BALANCE</span> AESTHETICS, USABILITY, AND INTENT.
          </p>
          <div className="footer-created-by">
            <span>CREATED BY</span>
            <span className="logo-spark">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="spark-svg" style={{ width: "14px", height: "14px" }}>
                <polygon points="12,2 20,7.5 21.5,15 16.5,21.5 7.5,21.5 2.5,15 4,7.5" fill="#E91E63" />
              </svg>
            </span>
            <span className="created-brand">HYPERSPACE</span>
          </div>
        </div>
      </div>

      {/* Dotted separator line */}
      <div className="footer-divider-container">
        <div className="footer-divider-dot left-dot"></div>
        <hr className="footer-divider-line" />
        <div className="footer-divider-dot right-dot"></div>
      </div>

      {/* Giant Wordmark Section */}
      <div className="footer-wordmark-container">
        <h2 className="footer-wordmark-main">HYPERSPACE</h2>
        <div className="footer-wordmark-sub-container">
          <span className="footer-wordmark-sub-text">XR SIG</span>
        </div>
      </div>
    </footer>
  );
}

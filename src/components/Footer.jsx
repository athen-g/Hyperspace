import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Absolute positioned background lines stretching from top to bottom */}
      <div className="footer-background-lines">
        <span className="line l1"></span>
        <span className="line l2"></span>
        <span className="line l3"></span>
        <span className="line l4"></span>
        <span className="line l5"></span>
      </div>

      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Col 0: Left Spacer */}
          <div className="footer-spacer-col"></div>

          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <a className="footer-logo" href="#home">
              <img src="/favicon.svg" alt="Hyperspace Logo" className="footer-logo-img" />
              <span className="footer-logo-text">
                <span>HYPER</span>
                <span>SPACE</span>
              </span>
            </a>
            <p className="footer-brand-subtitle">
              <span className="pink-text">HVVVVV</span> <span className="white-text">CLARITY, PURPOSE, AND PRECISION.</span>
            </p>
          </div>

          {/* Col 2: Sitemap */}
          <div className="footer-sitemap-col">
            <div className="footer-col-header">Sitemap</div>
            <ul className="footer-links-list">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#events">Works</a></li>
              <li><a href="/blog">Blogs</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Col 3: Socials */}
          <div className="footer-socials-col">
            <div className="footer-col-header">Follow on</div>
            <ul className="footer-links-list">
              <li><a href="#" target="_blank" rel="noopener noreferrer">YOUTUBE</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">INSTAGRAM</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">WHATSAPP</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">LINKEDIN</a></li>
            </ul>
          </div>

          {/* Col 4: Tagline & Credits */}
          <div className="footer-tagline-col">
            <p className="footer-statement">
              <span className="pink-text">CREATING EXPERIENCES THAT MATTER</span> <span className="white-text">AESTHETICS, USABILITY, AND INTENT.</span>
            </p>
            <div className="footer-created-by">
              <span className="created-text">Created by</span>
              <div className="avatar-wrapper">
                <img src="/favicon.svg" alt="Hyperspace Avatar" className="avatar-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span className="created-brand">HYPERSPACE</span>
            </div>
          </div>

          {/* Col 5: Right Spacer */}
          <div className="footer-spacer-col"></div>
        </div>
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

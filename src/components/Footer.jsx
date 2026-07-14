import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      {/* Background border pattern (5 columns grid) */}
      <div className="footer-bg-grid">
        <div className="bg-col"></div>
        <div className="bg-col"></div>
        <div className="bg-col"></div>
        <div className="bg-col"></div>
        <div className="bg-col"></div>
      </div>

      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <a className="footer-logo" href="#home">
              <img src="/favicon.svg" alt="Hyperspace Logo" className="footer-logo-img" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
              <span className="footer-logo-text">Hyperspace</span>
            </a>
            <p className="footer-brand-tagline">
              Crafting thoughtful digital experiences built on clarity, purpose, and precision.
            </p>
            <a className="footer-cta-btn" href="#contact">
              <span>Book a Call</span>
              <span className="arrow">→</span>
            </a>
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
              Creating experiences that balance aesthetics, usability, and intent.
            </p>
            <div className="footer-created-by">
              <span className="created-text">Created by</span>
              <div className="avatar-wrapper">
                <img src="/favicon.svg" alt="Hyperspace Avatar" className="avatar-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span className="created-brand">HYPERSPACE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Giant Bottom Heading */}
      <div className="footer-bottom-heading">
        <h2>HYPERSPACE</h2>
      </div>
    </footer>
  );
}

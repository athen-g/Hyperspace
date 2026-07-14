import React from "react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <a className="footer-logo" href="#">
            <div className="footer-logo-mark">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none">
                <polygon points="12,2 20,7.5 21.5,15 16.5,21.5 7.5,21.5 2.5,15 4,7.5" stroke="white" stroke-width="1.5" fill="none" />
                <polygon points="12,7 16,10.5 17,14.5 14,18 10,18 7,14.5 8,10.5" fill="white" opacity="0.85" />
              </svg>
            </div>
            <span className="footer-logo-text">Hyperspace</span>
          </a>
          <p className="footer-tagline">Crafting thoughtful digital experiences built on clarity, purpose, and precision.</p>
        </div>

        <div>
          <div className="footer-col-title">Navigate</div>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#events">Events</a></li>
            <li><a href="/blog">Blogs</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <div className="footer-col-title">Follow On</div>
          <ul className="footer-social-list">
            <li><a href="#" target="_blank" rel="noopener noreferrer">YouTube</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>

        <div style={{ maxWidth: "200px" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Creating experiences that balance aesthetics, usability, and intent.
          </p>
          <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            Created by &nbsp;
            <span style={{ color: "var(--accent-pink)", fontFamily: "var(--font-display)", fontWeight: "700" }}>
              ✦ Hyperspace
            </span>
          </div>
        </div>
      </div>

      <div className="footer-wordmark">
        <div className="footer-wordmark-text">Hyperspace</div>
        <div className="footer-wordmark-sub">XR SIG</div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Hyperspace XR SIG · Wadia College of Engineering</span>
        <span>Department of Computer Engineering</span>
      </div>
    </footer>
  );
}

import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/icons/logo.svg';
import BackgroundLines from './ui/BackgroundLines';

export default function Footer() {
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
  };

  if (isMobile768) {
    return (
      <footer className="bg-[#1a1a1a] text-white w-full px-4 pt-10 pb-0 px-0 flex flex-col relative z-10 box-border border-t border-[#666666]">
        <BackgroundLines />
        {/* Brand / Header Box */}
        <div className="px-[3.472%] pb-8 border-b border-[#666666]">
          <div className="flex items-center gap-3 mb-6">
            <img src={logo} alt="Hyperspace Logo" className="w-10 h-10 object-contain" />
            <div className="font-mokoto text-[22px] leading-[1.0] uppercase tracking-wider text-white flex flex-col">
              <span>HYPER</span>
              <span>SPACE</span>
            </div>
          </div>
          <p className="font-mono text-[13px] text-white/70 uppercase leading-[1.6] tracking-[0.02em]">
            CRAFTING THOUGHTFUL DIGITAL EXPERIENCES BUILT ON{' '}
            <span className="text-white font-bold">CLARITY, PURPOSE, AND PRECISION.</span>
          </p>
        </div>

        {/* Action / Nav List with Arrows */}
        <div className="flex flex-col w-full border-b border-[#666666]">
          {[
            { label: 'HOME', path: '/' },
            { label: 'ABOUT', path: '/#about' },
            { label: 'WORKS', path: '/events' },
            { label: 'BLOGS', path: '/blogs' },
            { label: 'CONTACT', path: '/contact' },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() => handleNav(item.path)}
              className="flex items-center justify-between px-[3.472%] py-5 border-b border-[#666666] last:border-b-0 cursor-pointer transition-colors duration-200 hover:bg-white/5"
            >
              <span className="font-mono text-[16px] font-bold tracking-[0.05em] uppercase text-white">
                {item.label}
              </span>
              <span className="font-mono text-[18px] text-white/70">→</span>
            </div>
          ))}
        </div>

        {/* Socials & Info */}
        <div className="px-[3.472%] py-8 flex flex-col gap-8 border-b border-[#666666]">
          <div>
            <div className="font-mono text-[12px] text-white/40 tracking-[0.1em] uppercase mb-4">
              FOLLOW ON
            </div>
            <ul className="flex flex-col gap-3 font-mono text-[15px] font-bold tracking-[0.05em] uppercase text-white">
              <li><a href="https://www.instagram.com/mescoe_hyperspace" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors">INSTAGRAM</a></li>
              <li><a href="https://chat.whatsapp.com/Ir4Uo7R88zS3ZkIPpZC5A4?mode=ems_copy_t" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors">WHATSAPP</a></li>
              <li><a href="https://www.linkedin.com/company/112033075" target="_blank" rel="noopener noreferrer" className="hover:text-accent-pink transition-colors">LINKEDIN</a></li>
            </ul>
          </div>

          <p className="font-mono text-[13px] text-white/70 uppercase leading-[1.6] tracking-[0.02em] max-w-[320px]">
            CREATING EXPERIENCES THAT BALANCE AESTHETICS, USABILITY, AND INTENT.
          </p>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] text-white/40 uppercase tracking-[0.05em]">CREATED BY</span>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
              <img src={logo} alt="Hyperspace" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-[14px] font-bold text-white tracking-[0.05em] uppercase">HYPERSPACE</span>
          </div>
        </div>

        {/* Giant Centered Title Block on 3 lines: 84px */}
        <div className="w-full px-[3.472%] py-10 flex flex-col items-center justify-center text-center select-none bg-[#1a1a1a]">
          <h2 className="font-mokoto text-[100px] leading-[0.85] uppercase text-accent-pink tracking-[0.02em] w-full text-center">
            HYPER
          </h2>
          <h2 className="font-mokoto text-[100px] leading-[0.85] uppercase text-accent-pink tracking-[0.02em] w-full text-center mt-1">
            SPACE
          </h2>
          <h2 className="font-mokoto text-[100px] leading-[0.85] uppercase text-white tracking-[0.02em] w-full text-center mt-2">
            XR SIG
          </h2>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-main-container">
        {/* Top rule line with endpoint circles */}
        <div className="rule-line">
          <span className="rule-dot"></span>
          <span className="rule-dot"></span>
        </div>

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
              <span className="white-text"><span className="text-accent-pink">CLARITY,</span> PURPOSE, AND PRECISION.</span>
            </p>
          </div>

          {/* Col 2: Sitemap */}
          <div className="footer-sitemap-col">
            <ul className="footer-links-list">
              <li><a href="#home" className="footer-nav-link"><span>Home</span><span className="arrow">→</span></a></li>
              <li><a href="#about" className="footer-nav-link"><span>About</span><span className="arrow">→</span></a></li>
              <li><a href="#events" className="footer-nav-link"><span>Events</span><span className="arrow">→</span></a></li>
              <li><a href="/blog" className="footer-nav-link"><span>Blogs</span><span className="arrow">→</span></a></li>
              <li><a href="#contact" className="footer-nav-link"><span>Contact</span><span className="arrow">→</span></a></li>
            </ul>
          </div>

          {/* Col 3: Socials */}
          <div className="footer-socials-col">
            <div className="footer-col-header footer-col-header--pink">Follow on</div>
            <ul className="footer-social-list">
              <li><a href="https://www.instagram.com/mescoe_hyperspace" target="_blank" rel="noopener noreferrer">INSTAGRAM</a></li>
              <li><a href="https://chat.whatsapp.com/Ir4Uo7R88zS3ZkIPpZC5A4?mode=ems_copy_t" target="_blank" rel="noopener noreferrer">WHATSAPP</a></li>
              <li><a href="https://www.linkedin.com/company/112033075" target="_blank" rel="noopener noreferrer">LINKEDIN</a></li>
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

        {/* Bottom rule line with endpoint circles */}
        <div className="rule-line">
          <span className="rule-dot"></span>
          <span className="rule-dot"></span>
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

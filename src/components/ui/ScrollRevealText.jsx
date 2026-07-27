import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const ScrollRevealText = ({ text, className }) => {
  const containerRef = useRef(null);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  // Split text by words
  const words = text.trim().split(/\s+/);

  useGSAP(() => {
    const targets = containerRef.current.querySelectorAll(isMobile ? '.reveal-word' : '.reveal-letter');

    // Set initial color
    gsap.set(targets, { color: 'rgba(255, 255, 255, 0.6)' });

    // Animate to full white on scroll
    gsap.to(targets, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: isMobile ? true : 1, // Simpler scrub on mobile to save frames
      },
      color: '#ffffff',
      stagger: isMobile ? 0.05 : 0.1,
      ease: 'none',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          {isMobile ? (
            <span className="reveal-word" style={{ display: 'inline-block' }}>
              {word}
            </span>
          ) : (
            <span style={{ display: 'inline-block' }}>
              {word.split('').map((char, charIndex) => (
                <span key={charIndex} className="reveal-letter">
                  {char}
                </span>
              ))}
            </span>
          )}
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
};

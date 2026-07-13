import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const ScrollRevealText = ({ text, className }) => {
  const containerRef = useRef(null);

  // Split text by words
  const words = text.trim().split(/\s+/);

  useGSAP(() => {
    const letters = containerRef.current.querySelectorAll('.reveal-letter');
    
    // Set initial color
    gsap.set(letters, { color: 'rgba(255, 255, 255, 0.6)' });
    
    // Animate to full white on scroll
    gsap.to(letters, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: 1, // Add slight smoothing to the scrub
      },
      color: '#ffffff',
      stagger: 0.1,
      ease: 'none',
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className}>
      {words.map((word, wordIndex) => (
        <React.Fragment key={wordIndex}>
          <span style={{ display: 'inline-block' }}>
            {word.split('').map((char, charIndex) => (
              <span key={charIndex} className="reveal-letter">
                {char}
              </span>
            ))}
          </span>
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </div>
  );
};

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { BackgroundPathsDemo } from './ui/BackgroundPaths';
import { SplitText } from 'gsap/all';
import gsap from 'gsap';
import { useMediaQuery } from 'react-responsive';
import { mm, BREAKPOINTS } from '../lib/gsapConfig';

export default function Hero() {
  const containerRef = useRef(null);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useGSAP(() => {
    const titleSplit = new SplitText('.hero-title', { type: 'chars, words' });
    const subtitleSplit = new SplitText('.hero-subtitle', { type: 'chars, words' });

    mm.add(BREAKPOINTS.desktop, () => {
      gsap.from(titleSplit.chars, {
        yPercent: 100,
        duration: 2,
        ease: 'expo.out',
        stagger: 0.08
      });
      gsap.from(subtitleSplit.chars, {
        yPercent: 100,
        duration: 1.8,
        ease: 'expo.in',
        opacity: 0,
        stagger: 0.1
      });
    });

    mm.add(BREAKPOINTS.mobile, () => {
      gsap.from(titleSplit.chars, {
        yPercent: 40,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.03
      });
      gsap.from(subtitleSplit.chars, {
        yPercent: 30,
        duration: 0.6,
        ease: 'power2.out',
        opacity: 0,
        stagger: 0.03
      });
    });

    mm.add(BREAKPOINTS.reducedMotion, () => {
      gsap.from('.hero-title, .hero-subtitle', {
        opacity: 0,
        duration: 0.3
      });
    });
  }, { scope: containerRef });

  return (
    <>
      <section ref={containerRef} id="home" className="blog-hero">
        <div className="hero-bg"></div>
        <BackgroundPathsDemo />
        <div className="hero-fade-bottom"></div>
        <div className="hero-name">
          <span className="hero-title">HYPERSPACE</span>
          <span
            className="hero-subtitle"
            style={isMobile ? { top: '44%' } : undefined}
          >
            XR SIG
          </span>
        </div>
      </section>
    </>
  );
}

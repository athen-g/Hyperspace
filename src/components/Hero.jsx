import { useGSAP } from '@gsap/react';
import { BackgroundPathsDemo } from './ui/BackgroundPaths';
import { SplitText } from 'gsap/all';
import gsap from 'gsap';
import { useMediaQuery } from 'react-responsive';

export default function Hero() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  useGSAP(() => {
    const titleSplit = new SplitText('.hero-title', { type: 'chars, words' });
    const subtitleSplit = new SplitText('.hero-subtitle', { type: 'chars, words' });
    gsap.from(titleSplit.chars, {
      yPercent: 100,
      duration: isMobile ? 1.2 : 2,
      ease: 'expo.out',
      stagger: isMobile ? 0.04 : 0.08
    });
    gsap.from(subtitleSplit.chars, {
      yPercent: 100,
      duration: isMobile ? 1.0 : 1.8,
      ease: 'expo.out',
      opacity: 0,
      stagger: isMobile ? 0.05 : 0.1
    });
  });

  return (
    <>
      <section id="home" className="blog-hero">
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

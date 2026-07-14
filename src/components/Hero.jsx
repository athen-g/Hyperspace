import { useGSAP } from '@gsap/react';
import { BackgroundPathsDemo } from './ui/BackgroundPaths';
import { SplitText } from 'gsap/all';
import gsap from 'gsap';

export default function Hero() {
  useGSAP(() => {
    const titleSplit = new SplitText('.hero-title', { type: 'chars, words' });
    const subtitleSplit = new SplitText('.hero-subtitle', { type: 'chars, words' });
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
  }

  )
  return (
    <>
      <section id="home" className="blog-hero">
        <div className="hero-bg"></div>
        <BackgroundPathsDemo />
        <div className="hero-name">
          <span className="hero-title">HYPERSPACE</span>
          <span className="hero-subtitle">XR SIG</span>
        </div>
      </section>
    </>
  )
}

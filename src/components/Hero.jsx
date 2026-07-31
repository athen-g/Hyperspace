import { useGSAP } from '@gsap/react';
import { BackgroundPathsDemo } from './ui/BackgroundPaths';
import { SplitText } from 'gsap/all';
import gsap from 'gsap';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { eventsOngoing } from '../../constants/events';

export default function Hero() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const navigate = useNavigate();

  const hasOngoing = eventsOngoing && eventsOngoing.length > 0;
  const currentEvent = hasOngoing ? eventsOngoing[0] : null;

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

    if (hasOngoing) {
      gsap.from('.hero-live-banner', {
        opacity: 0,
        y: 20,
        duration: 1.5,
        delay: 1.2,
        ease: 'power3.out'
      });
    }
  });

  return (
    <>
      <section id="home" className="blog-hero">
        <div className="hero-bg"></div>
        <BackgroundPathsDemo />
        <div className="hero-fade-bottom"></div>
        <div className="hero-name flex flex-col items-center">
          <div className="relative text-center">
            <span className="hero-title block">HYPERSPACE</span>
            <span
              className="hero-subtitle block"
              style={isMobile ? { top: 'auto', marginTop: '10px' } : undefined}
            >
              XR SIG
            </span>
          </div>

          {hasOngoing && currentEvent && (
            <div 
              onClick={() => navigate(`/events/${currentEvent.slug}`)}
              className="hero-live-banner mt-16 px-6 py-3 bg-[#0e0e0e]/72 backdrop-blur-md border border-[#22c55e]/30 hover:border-[#22c55e]/60 rounded-full flex items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(34,197,94,0.15)] z-20"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]"></span>
              </span>
              <span className="font-mono text-white text-[12px] sm:text-[13px] font-bold tracking-[0.1em] uppercase">
                LIVE REGISTRATION: {currentEvent.name} IS NOW OPEN!
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

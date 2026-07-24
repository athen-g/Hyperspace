import React from 'react'
import { EVENTS_COMING_SOON, EVENTS_CONDUCTED } from '../../constants/index'
import { eventsOngoing } from '../../constants/events'
import { SplitText } from 'gsap/all'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Button from './Button'
import { useNavigate } from 'react-router-dom';

const EventImage = ({ thumbnail, bthumbnail, alt }) => {
  const containerRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const mousePos = React.useRef({ x: 0, y: 0 });
  const blobPos = React.useRef({ x: 0, y: 0 });
  const blobScale = React.useRef(0);
  const targetScale = React.useRef(0);
  const timeoutRef = React.useRef(null);
  const [scale, setScale] = React.useState(0);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const requestRef = React.useRef(null);
  const clipPathId = React.useId().replace(/:/g, '-');

  React.useEffect(() => {
    const animate = () => {
      const ease = 0.15;
      const dx = mousePos.current.x - blobPos.current.x;
      const dy = mousePos.current.y - blobPos.current.y;

      blobPos.current.x += dx * ease;
      blobPos.current.y += dy * ease;

      const scaleEase = 0.06;
      blobScale.current += (targetScale.current - blobScale.current) * scaleEase;

      setCoords({ x: blobPos.current.x, y: blobPos.current.y });
      setScale(blobScale.current);

      requestRef.current = requestAnimationFrame(animate);
    };

    if (isHovered) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseEnter = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePos.current = { x, y };
    blobPos.current = { x, y };
    setCoords({ x, y });

    blobScale.current = 0;
    targetScale.current = 0;
    setScale(0);
    setIsHovered(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      targetScale.current = 1;
    }, 350);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    targetScale.current = 0;
    blobScale.current = 0;
    setScale(0);
    setIsHovered(false);
  };

  if (!bthumbnail) {
    return <img src={thumbnail} alt={alt} className="event-card__thumb-img" />;
  }

  return (
    <div
      ref={containerRef}
      className="event-card__thumb-img relative overflow-hidden select-none block w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img src={thumbnail} alt={alt} className="w-full h-full object-cover" />

      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          clipPath: `url(#${clipPathId})`,
          WebkitClipPath: `url(#${clipPathId})`
        }}
      >
        <img src={bthumbnail} alt={alt} className="w-full h-full object-cover" />
      </div>

      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <clipPath id={clipPathId} clipPathUnits="userSpaceOnUse">
            <path
              className={`animate-blob-morph-${clipPathId}`}
              transform={`translate(${coords.x}, ${coords.y}) scale(${scale})`}
              d="M -50 -75 C 0 -100, 70 -50, 95 -15 C 120 35, 70 85, 15 110 C -40 135, -100 70, -110 15 C -120 -35, -85 -65, -50 -75 Z"
            />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        @keyframes blobMorph-${clipPathId} {
          0%, 100% {
            d: path('M -50 -75 C 0 -100, 70 -50, 95 -15 C 120 35, 70 85, 15 110 C -40 135, -100 70, -110 15 C -120 -35, -85 -65, -50 -75 Z');
          }
          25% {
            d: path('M -70 -65 C 15 -115, 100 -40, 110 10 C 130 60, 40 100, -25 125 C -100 150, -140 40, -125 -25 C -110 -100, -40 -65, -70 -65 Z');
          }
          50% {
            d: path('M -40 -95 C 35 -100, 75 -70, 95 -25 C 115 25, 60 110, -10 120 C -75 135, -120 85, -130 40 C -140 0, -95 -45, -40 -95 Z');
          }
          75% {
            d: path('M -60 -75 C 10 -110, 85 -50, 100 -10 C 35 25, 50 70, -15 110 C -60 130, -110 85, -120 35 C -130 -10, -95 -50, -60 -75 Z');
          }
        }
        .animate-blob-morph-${clipPathId} {
          animation: blobMorph-${clipPathId} 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const Events = () => {

  const navigate = useNavigate();

  useGSAP(() => {
    const titleSplit = new SplitText('.events-conducted-label', { type: 'lines' });
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#events',
        start: '10% center',
      }
    });
    const scrolltimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#events',
        start: '10% center',
        scrub: true,
      }
    });

    timeline
      .from(titleSplit.lines, {
        opacity: 0,
        duration: 1.8,
        yPercent: 100,
        stagger: 0.05,
        ease: 'expo.out'
      });

    scrolltimeline
      .to('.event-card', { y: -100 }, 0)
  })

  return (
    <section id="events" className="events-section">

      {/* --- ONGOING EVENTS SECTION (only rendered when data exists) --- */}
      {eventsOngoing && eventsOngoing.length > 0 && (
        <div className="relative pt-40">
          <div className="events-conducted-title">
            <div className="events-conducted-label flex flex-col items-center">
              <span className="text-accent-pink">ONGOING</span>
              <span>EVENTS</span>
            </div>
          </div>

          <div className="events-card-list">
            {eventsOngoing.map((event, index) => (
              <div
                key={event.id}
                className={`event-card-wrap cursor-pointer ${index % 2 === 0 ? 'event-card-wrap--odd' : 'event-card-wrap--even'}`}
                onClick={() => { navigate(`/events/${event.slug}`); }}
              >
                <div className="event-card event-card--ongoing">
                  {/* Registration Open Badge */}
                  <div className="flex items-center gap-2 pt-5 px-6">
                    <div className="ongoing-reg-badge">
                      <span className="ongoing-reg-badge__dot" />
                      <span className="ongoing-reg-badge__text">Registrations Open</span>
                    </div>
                  </div>

                  <div className="event-card__thumb">
                    {event.thumbnail
                      ? <EventImage thumbnail={event.thumbnail} alt={event.name} />
                      : <div className="event-card__thumb-placeholder" />
                    }
                  </div>

                  <div className="event-card__info">
                    <div className="event-card__name">{event.name}</div>
                    <ul className="event-card__tags">
                      {event.tags.map((tag, i) => (
                        <li key={i} className="event-card__tag">{tag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] my-[80px]" />
        </div>
      )}

      <div className="relative pt-40">
        <div className="events-conducted-title">
          <div className="events-conducted-label flex flex-col items-center">
            <span className="text-accent-pink">EVENTS</span>
            <span>CONDUCTED</span>
          </div>
        </div>

        <div className="events-card-list">
          {EVENTS_CONDUCTED.map((event, index) => (
            <div
              key={event.id}
              className={`event-card-wrap cursor-pointer ${index % 2 === 0 ? 'event-card-wrap--odd' : 'event-card-wrap--even'}`}
              onClick={() => {
                navigate(`/events/${event.slug}`);
              }}
            >
              <div className="event-card">
                <div className="event-card__thumb">
                  {event.thumbnail
                    ? <EventImage thumbnail={event.thumbnail} bthumbnail={event.bthumbnail} alt={event.name} />
                    : <div className="event-card__thumb-placeholder" />
                  }
                </div>

                <div className="event-card__info">
                  <div className="event-card__name">{event.name}</div>
                  <ul className="event-card__tags">
                    {event.tags.map((tag, i) => (
                      <li key={i} className="event-card__tag">{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          className="bottom-10"
          label="VIEW ALL EVENTS"
          onClick={() => {
            navigate(`/events`);
          }}
        />
      </div>

      <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] my-[80px]" />

      <div className="relative pt-60">
        <div className="events-conducted-title">
          <div className="events-conducted-label flex flex-col items-center">
            <span className="text-accent-pink">PLANNED</span>
            <span>EVENTS</span>
          </div>
        </div>

        <div className="events-card-list">
          {EVENTS_COMING_SOON.map((event, index) => (
            <div
              key={event.id}
              className={`event-card-wrap cursor-pointer ${index % 2 === 0 ? 'event-card-wrap--odd' : 'event-card-wrap--even'}`}
              onClick={() => {
                navigate(`/events/${event.slug}`);
              }}
            >
              <div className="event-card">
                <div className="event-card__thumb">
                  {event.thumbnail
                    ? <EventImage thumbnail={event.thumbnail} bthumbnail={event.bthumbnail} alt={event.name} />
                    : <div className="event-card__thumb-placeholder" />
                  }
                </div>

                <div className="event-card__info">
                  <div className="event-card__name">{event.name}</div>
                  <ul className="event-card__tags">
                    {event.tags.map((tag, i) => (
                      <li key={i} className="event-card__tag">{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="bottom-10"
        label="VIEW ALL EVENTS"
        onClick={() => {
          navigate(`/events`);
        }}
      />

      <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[140px]" />

    </section>
  )
}

export default Events
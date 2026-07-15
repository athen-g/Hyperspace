import React from 'react'
import { EVENTS_COMING_SOON, EVENTS_CONDUCTED } from '../../constants/index'
import { SplitText } from 'gsap/all'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Button from './Button'

const Events = () => {

  useGSAP(() => {
    const titleSplit = new SplitText('.events-conducted-label', { type: 'lines' });
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '#events',
        start: 'top center'
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
  })

  return (
    <section id="events" className="events-section">

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
              className={`event-card-wrap ${index % 2 === 0 ? 'event-card-wrap--odd' : 'event-card-wrap--even'}`}
            >
              <div className="event-card">
                <div className="event-card__thumb">
                  {event.thumbnail
                    ? <img src={event.thumbnail} alt={event.name} className="event-card__thumb-img" />
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
              className={`event-card-wrap ${index % 2 === 0 ? 'event-card-wrap--odd' : 'event-card-wrap--even'}`}
            >
              <div className="event-card">
                <div className="event-card__thumb">
                  {event.thumbnail
                    ? <img src={event.thumbnail} alt={event.name} className="event-card__thumb-img" />
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
          window.history.pushState({}, '', '/events');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }}
      />

      <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[140px]" />

    </section>
  )
}

export default Events
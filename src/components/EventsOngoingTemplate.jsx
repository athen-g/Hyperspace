import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Contact from './Contact';
import Footer from './Footer';
import Button from './Button';
import { eventsOngoing } from '../../constants/events';
import { useMediaQuery } from 'react-responsive';

export default function EventOngoingTemplate() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

  const event = eventsOngoing.find(e => e.slug === slug);

  if (!event) return <h1 className="text-white text-center py-20 font-host text-3xl">404 - Event Not Found</h1>;

  const schedule = Array.isArray(event.schedule)
    ? event.schedule
    : (event.schedule ? Object.values(event.schedule) : []);

  const hasSchedule = schedule && schedule.length > 0;

  return (
    <>
      <section className="relative min-h-screen overflow-hidden">
        <Header />
        <BackgroundLines />

        {/* Hero & Meta Section */}
        <div className={`relative z-10 border border-r-0 border-[#666666] bg-[#0e0e0e] ${isMobile768 ? 'w-[93.056%] mx-auto mt-[120px] mb-8' : 'w-[93.056%] mx-auto mt-[90px] mb-[120px]'
          }`}>

          <div className={`flex ${isMobile768 ? 'flex-col items-start gap-4 p-5' : 'justify-between items-center px-[60px] pt-[55px] pb-[45px]'} border-b border-[#2D2D2D]`}>

            <h1
              className="
                font-host
                text-white
                font-extrabold
                uppercase
                leading-[0.88]
                tracking-[-0.03em]
                text-[clamp(32px,8vw,128px)]
                max-w-[760px]
                text-left
                "
            >
              {event.name}
            </h1>

            <div
              className={`
                font-mono
                text-[13px]
                font-medium
                uppercase
                tracking-[0.11em]
                leading-[1.3]
                text-white
                ${isMobile768 ? 'text-left max-w-full text-white/80' : 'max-w-[450px] text-right'}
                `}
            >
              {event.tagline}
            </div>

          </div>

          <div className={isMobile768 ? 'p-3' : 'p-[20px]'}>

            <img
              src={event.thumbnail}
              alt={event.name}
              className="
                    w-full
                    rounded-md
                    object-cover
                    border
                    border-[#1E1E1E]
                "
            />

          </div>

        </div>

        {/* Overview Section */}
        <div className={
          isMobile768
            ? 'relative z-10 w-[93.056%] mx-auto my-8 flex flex-col items-start gap-4 px-2 bg-[#0e0e0e]'
            : 'flex max-w-[1050px] ml-[525px] mt-[46px] mb-[46px] mr-auto items-start justify-between'
        }>
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-pink"></div>
            <span className='font-mono text-[13px] text-[#ABABAB] tracking-[0.05em] uppercase'>OVERVIEW</span>
          </div>
          <span className={`font-host tracking-[0.05em] font-medium text-white text-left ${isMobile768 ? 'text-[15px] leading-[1.5] max-w-full' : 'text-[22px] max-w-[600px] leading-[1.2]'
            }`}>{event.overview}</span>
        </div>

        <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666]" />

        {/* Metadata Table */}
        <div className={`relative z-10 ${isMobile768
            ? 'w-[93.056%] mx-auto my-8 bg-[#0e0e0e]'
            : 'w-[93.056%] ml-[435px] max-w-[1406px] mb-[75px]'
          }`}>

          <div className={isMobile768 ? 'w-full border-t border-b border-light-grey' : 'ml-[520px] border-b border-light-grey'}>

            {[
              ["DATE:", event.date],
              ["AUDIENCE:", event.total_seats],
              ["TYPE:", event.type],
              [
                "TAGS:",
                <div className={`flex flex-col ${isMobile768 ? 'items-start text-left' : 'items-end text-right'} gap-1`}>
                  {event.tags?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ],
              [
                "POWERED BY:",
                <div className={`flex flex-col ${isMobile768 ? 'items-start text-left' : 'items-end text-right'} gap-1`}>
                  {event.sponsors?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ],
            ].map(([title, value]) => (
              <div
                key={title}
                className={`border-b last:border-b-0 border-light-grey items-center ${isMobile768 ? 'flex flex-col justify-start items-start p-3 gap-1' : 'grid grid-cols-[300px_1fr] justify-center'
                  }`}
              >

                <div className={isMobile768 ? 'py-1' : 'px-4 py-5'}>
                  <span className="font-mono text-[14px] uppercase tracking-[0.05em] text-[#ABABAB]">
                    {title ? title : ''}
                  </span>
                </div>

                <div className={isMobile768 ? 'py-1 flex justify-start text-left' : 'px-5 py-5 flex justify-end text-right'}>
                  {<span className="font-host text-[14px] uppercase tracking-[0.05em] leading-[1.2] text-white">
                    {value ? value || "—" : ''}
                  </span>}
                </div>

              </div>
            ))}

          </div>

        </div>

        {/* Section: Schedule OR The Plan */}
        {hasSchedule ? (
          <div className="relative z-10 my-10 md:my-[80px]">
            {/* Section Heading */}
            <div className={isMobile768 ? "w-[93.056%] mx-auto mb-10 p-4" : "w-[93.056%] mx-auto mb-24 p-20"}>
              <h2 className={`font-host font-extrabold uppercase leading-[0.95] text-[#E91E63] ${isMobile768 ? 'text-[44px] max-w-full text-left' : 'text-[clamp(44px,6vw,90px)] max-w-[700px]'
                }`}>
                SCHEDULE FOR THE WORKSHOP
              </h2>
            </div>

            {/* Schedule Items */}
            <div className={`flex flex-col ${isMobile768 ? 'gap-16' : 'gap-32'}`}>
              {schedule.map((item, index) => {
                const stepNum = index + 1;
                const isEven = stepNum % 2 === 0;
                const dotLeftPercentage = isEven ? 74.306 : 25.694;

                return (
                  <div key={index} className="relative w-full min-h-[180px] flex items-center">
                    {/* Centered Dot on Background Line */}
                    <div
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block"
                      style={{ left: `${dotLeftPercentage}%` }}
                    >
                      <span className="w-[26px] h-[26px] rounded-full bg-white block shadow-[0_0_12px_rgba(255,255,255,0.8)]"></span>
                    </div>

                    {!isEven ? (
                      /* Step 1 & Odd Steps */
                      <div className="w-[93.056%] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                        {/* Number */}
                        <div className={`flex items-center ${isMobile768 ? 'justify-start' : 'md:col-span-3 justify-end pr-6 md:pr-10'}`}>
                          <span className={`font-clash font-bold leading-none text-white tracking-tight ${isMobile768 ? 'text-[90px]' : 'text-[clamp(90px,11vw,170px)]'
                            }`}>
                            {stepNum}
                          </span>
                        </div>

                        {/* Gap for Line 2 Dot */}
                        <div className="hidden md:block md:col-span-1"></div>

                        {/* Image + Text */}
                        <div className="md:col-span-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                          <div className="w-full md:w-[380px] lg:w-[420px] aspect-[16/10] bg-[#1a1a1a] border border-light-grey p-2 overflow-hidden shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title || `Step ${stepNum}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1e1e24] flex items-center justify-center border border-white/10">
                                <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7l-3 4-2-3-3 4h14l-4-5z" />
                                </svg>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 max-w-[450px]">
                            <h3 className="font-host font-extrabold text-[20px] sm:text-[26px] uppercase tracking-wide text-white mb-3 leading-snug">
                              {item.title}
                            </h3>
                            <p className="font-mono text-[13px] sm:text-[14px] uppercase leading-relaxed text-[#B0B0B0] tracking-wide">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Step 2 & Even Steps */
                      <div className="w-[93.056%] mx-auto flex flex-col-reverse md:grid md:grid-cols-12 items-center gap-6">
                        {/* Text */}
                        <div className="w-full md:col-span-4 flex justify-end">
                          <div className="w-full max-w-[450px]">
                            <h3 className="font-host font-extrabold text-[20px] sm:text-[26px] uppercase tracking-wide text-white mb-3 leading-snug">
                              {item.title}
                            </h3>
                            <p className="font-mono text-[13px] sm:text-[14px] uppercase leading-relaxed text-[#B0B0B0] tracking-wide">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Image */}
                        <div className="w-full md:col-span-4 flex justify-start">
                          <div className="w-full md:w-[380px] lg:w-[420px] aspect-[16/10] bg-[#1a1a1a] border border-light-grey p-2 overflow-hidden shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title || `Step ${stepNum}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1e1e24] flex items-center justify-center border border-white/10">
                                <svg className="w-12 h-12 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zm-10-7l-3 4-2-3-3 4h14l-4-5z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Spacer */}
                        <div className="hidden md:block md:col-span-1"></div>

                        {/* Number */}
                        <div className={`w-full flex items-center ${isMobile768 ? 'justify-start' : 'md:col-span-3 justify-start pl-6 md:pl-10'}`}>
                          <span className={`font-clash font-bold leading-none text-white tracking-tight ${isMobile768 ? 'text-[90px]' : 'text-[clamp(90px,11vw,170px)]'
                            }`}>
                            {stepNum}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Fallback: THE PLAN section matching EventPageTemplate */
          <div className={
            isMobile768
              ? 'w-[93.056%] mx-auto p-10 relative z-10 mb-12 flex flex-col gap-6 bg-[#0e0e0e] border border-light-grey'
              : 'relative z-10 w-[93.056%] mx-auto py-[100px]'
          }>
            {isMobile768 ? (
              <>
                <div className="flex flex-col leading-[0.85]">
                  <span className="font-host font-extrabold uppercase text-[#8A8A8A] text-[50px]">
                    THE
                  </span>
                  <span className="font-host font-extrabold uppercase text-accent-pink text-[50px]">
                    PLAN
                  </span>
                </div>
                <div className="pt-2 mt-2 w-full">
                  <p className="font-host text-white text-[14px] leading-[1.4] tracking-[-0.01em] whitespace-pre-line">
                    {event.plan}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex gap-100 items-end m-50">
                <div className="lg:col-span-5 flex flex-col leading-[0.85]">
                  <span className="font-host font-extrabold uppercase text-[#8A8A8A] text-[clamp(64px,8vw,140px)]">
                    THE
                  </span>
                  <span className="font-host font-extrabold uppercase text-white text-[clamp(64px,8vw,140px)]">
                    PLAN
                  </span>
                </div>
                <div className="lg:col-span-7 pt-4 lg:pt-12">
                  <p className="font-host text-white text-[clamp(16px,1.4vw,24px)] leading-[1.4] tracking-tight whitespace-pre-line text-left">
                    {event.plan}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Brochure & Rulebook text */}
        <div className={`relative z-10 w-[93.056%] mx-auto text-center border-t border-light-grey ${isMobile768 ? 'my-8 pt-6 px-2' : 'my-16 pt-12'
          }`}>
          <p className={`font-host font-bold uppercase leading-[1.1] tracking-[0.02em] text-white mx-auto ${isMobile768 ? 'text-[18px] max-w-full' : 'text-[36px] max-w-[900px]'
            }`}>
            EVERY <span className="text-[#E91E63]">SUCCESSFUL</span> ENDEAVOR NEEDS SOME <span className="text-[#E91E63]">RULES</span> TO BE SUCCESSFUL...SO DO WE. TAKE A LOOK AT THE <span className="text-[#E91E63]">RULEBOOK</span> AND THE <span className="text-[#E91E63]">BROCHURE</span> TO GET THE FULL IDEA ABOUT THIS WORKSHOP.
          </p>

          <div className={`flex flex-col md:flex-row justify-center items-center font-bold font-mono gap-3 mt-6 text-[#E91E63] uppercase tracking-[0.02em] ${isMobile768 ? 'text-[16px]' : 'text-[32px]'
            }`}>
            {event.rulebook_url ? (
              <a href={event.rulebook_url} target="_blank" rel="noopener noreferrer" className="header-roll-link underline underline-offset-8 decoration-[#E91E63]">
                <span className="header-roll-link__stack">
                  <span className="header-roll-link__face header-roll-link__face--current">DOWNLOAD THE RULEBOOK</span>
                  <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">DOWNLOAD THE RULEBOOK</span>
                </span>
              </a>
            ) : (
              <a href="#" className="header-roll-link decoration-[#E91E63]">
                <span className="header-roll-link__stack">
                  <span className="header-roll-link__face header-roll-link__face--current">DOWNLOAD THE RULEBOOK</span>
                  <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">DOWNLOAD THE RULEBOOK</span>
                </span>
              </a>
            )}

            {!isMobile768 && <span>|</span>}

            {event.brochure_url ? (
              <a href={event.brochure_url} target="_blank" rel="noopener noreferrer" className="header-roll-link underline underline-offset-8 decoration-[#E91E63]">
                <span className="header-roll-link__stack">
                  <span className="header-roll-link__face header-roll-link__face--current">DOWNLOAD THE INFORMATION BROCHURE</span>
                  <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">DOWNLOAD THE INFORMATION BROCHURE</span>
                </span>
              </a>
            ) : (
              <a href="#" className="header-roll-link decoration-[#E91E63]">
                <span className="header-roll-link__stack">
                  <span className="header-roll-link__face header-roll-link__face--current">DOWNLOAD THE INFORMATION BROCHURE</span>
                  <span className="header-roll-link__face header-roll-link__face--next" aria-hidden="true">DOWNLOAD THE INFORMATION BROCHURE</span>
                </span>
              </a>
            )}
          </div>
        </div>

        <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666]" />

        {/* Dynamic CTA Header */}
        <div className={`relative z-10 w-[93.056%] text-left ${isMobile768 ? 'm-6 py-6 px-2' : 'm-16 p-20'
          }`}>
          <h2 className={`font-host font-extrabold uppercase leading-tight text-white ${isMobile768 ? 'text-[32px]' : 'text-[64px]'
            }`}>
            LIKE WHAT YOU SEE?<br />
            THEN WHAT ARE YOU <span className="text-[#E91E63]">WAITING</span> FOR?<br />
            <span className="text-[#E91E63]">REGISTER NOW.</span>
          </h2>
        </div>

        {/* CLICK HERE TO REGISTER Big Banner CTA */}
        <div
          className={`relative z-10 w-[93.056%] font-poppins mx-auto border-t border-light-grey text-center cursor-pointer register-hover-container ${isMobile768 ? 'mb-12 py-10' : 'mb-28 py-24'
            }`}
          onClick={() => navigate(`/register/${event.slug}`)}
        >
          <span className={`font-medium uppercase tracking-[0.02em] leading-[1] text-accent-pink block mb-2 ${isMobile768 ? 'text-[36px]' : 'text-[96px]'
            }`}>
            CLICK HERE TO
          </span>
          <div className="relative inline-block">
            <span className={`register-hover-text font-bold uppercase leading-none ${isMobile768 ? 'text-[54px]' : 'text-[180px]'
              }`}>
              REGISTER
            </span>
            <span className="register-hover-line"></span>
          </div>
        </div>

      </section>

      {/* Imported Contact and Footer components */}
      <Contact />
      <Footer />
    </>
  );
}
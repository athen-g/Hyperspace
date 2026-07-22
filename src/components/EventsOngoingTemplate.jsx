import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import BackgroundLines from './ui/BackgroundLines';
import Contact from './Contact';
import Footer from './Footer';
import Button from './Button';
import { eventsOngoing } from '../../constants/events';

export default function EventOngoingTemplate() {
  const navigate = useNavigate();
  const { slug } = useParams();

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
        <div className="relative z-10 w-[93.056%] mx-auto mt-[90px] mb-[120px] border border-r-0 border-[#666666] bg-[#0e0e0e]">

          <div className="flex justify-between items-center px-[60px] pt-[55px] pb-[45px] border-b border-[#2D2D2D]">

            <h1
              className="
                max-w-[760px]
                font-host
                text-white
                text-[clamp(56px,7vw,128px)]
                font-extrabold
                uppercase
                leading-[0.88]
                tracking-[-0.03em]
                "
            >
              {event.name}
            </h1>

            <div
              className="
                max-w-[450px]
                text-right
                font-mono
                text-[13px]
                font-medium
                uppercase
                tracking-[0.11em]
                leading-[1.1]
                text-white
                "
            >
              {event.tagline}
            </div>

          </div>

          <div className="p-[20px]">

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

        <div className="flex max-w-[1050px] ml-[525px] mt-[46px] mb-[46px] mr-auto items-start justify-between">
          <div className="flex flex-row items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-4xl bg-white"></div>
            <span className='font-mono text-[13px] text-[#ABABAB] tracking-[0.05em] uppercase'>OVERVIEW</span>
          </div>
          <span className="font-host text-[22px] max-w-[600px] tracking-[0.05em] font-medium text-white leading-[1.2] text-left">{event.overview}</span>
        </div>

        <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666]" />

        <div className="relative z-10 w-[93.056%] ml-[435px] max-w-[1406px] mb-[75px]">

          <div className="ml-[520px]   border-b border-light-grey">

            {[
              ["DATE:", event.date],
              ["AUDIENCE:", event.total_seats],
              ["TYPE:", event.type],
              [
                "TAGS:",
                <div className="flex flex-col items-end gap-1">
                  {event.tags?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ],
              [
                "POWERED BY:",
                <div className="flex flex-col items-end gap-1">
                  {event.sponsors?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ], ,
            ].map(([title, value]) => (
              <div
                key={title}
                className="grid grid-cols-[300px_1fr] border-b last:border-b-0 border-light-grey items-center justify-center"
              >

                <div className="px-4 py-5">
                  <span className="font-mono text-[15px] uppercase tracking-[0.05em] text-[#ABABAB]">
                    {title ? title : ''}
                  </span>
                </div>

                <div className="px-5 py-5 flex justify-end text-right">
                  {<span className="font-host text-[15px] uppercase tracking-[0.05em] leading-[1.15] text-white">
                    {value ? value || "—" : ''}
                  </span>}
                </div>

              </div>
            ))}

          </div>


        </div>
        {/* Section: Schedule OR The Plan */}
        {hasSchedule ? (
          <div className="relative z-10 my-[80px]">
            {/* Section Heading */}
            <div className="w-[93.056%] mx-auto mb-24 p-20">
              <h2 className="font-host font-extrabold text-[clamp(44px,6vw,90px)] uppercase leading-[0.95] text-[#E91E63] max-w-[700px]">
                SCHEDULE FOR THE WORKSHOP
              </h2>
            </div>

            {/* Schedule Items */}
            <div className="flex flex-col gap-32">
              {schedule.map((item, index) => {
                const stepNum = index + 1;
                const isEven = stepNum % 2 === 0;

                // Odd step dot on Line 2 (25.694%), Even step dot on Line 4 (74.306%)
                const dotLeftPercentage = isEven ? 74.306 : 25.694;

                return (
                  <div key={index} className="relative w-full min-h-[220px] flex items-center">
                    {/* Centered Dot on Background Line */}
                    <div
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block"
                      style={{ left: `${dotLeftPercentage}%` }}
                    >
                      <span className="w-[26px] h-[26px] rounded-full bg-white block shadow-[0_0_12px_rgba(255,255,255,0.8)]"></span>
                    </div>

                    {!isEven ? (
                      /* Step 1 & Odd Steps (Left: Number in cols 1-3; Dot on Line 2; Right: Image in cols 5-8, Text in cols 9-12) */
                      <div className="w-[93.056%] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                        {/* Number (Cols 1-3, right-aligned to Line 2 dot) */}
                        <div className="md:col-span-3 flex justify-end items-center pr-6 md:pr-10">
                          <span className="font-clash font-bold text-[clamp(90px,11vw,170px)] leading-none text-white tracking-tight">
                            {stepNum}
                          </span>
                        </div>

                        {/* Gap for Line 2 Dot (Col 4 spacer) */}
                        <div className="hidden md:block md:col-span-1"></div>

                        {/* Image + Text (Cols 5-12) */}
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
                            <h3 className="font-host font-extrabold text-[22px] sm:text-[26px] uppercase tracking-wide text-white mb-3 leading-snug">
                              {item.title}
                            </h3>
                            <p className="font-mono text-[13px] sm:text-[14px] uppercase leading-relaxed text-[#B0B0B0] tracking-wide">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Step 2 & Even Steps (Left: Text in cols 1-4, Image in cols 5-8 under odd images; Dot on Line 4; Right: Number in cols 10-12) */
                      <div className="w-[93.056%] mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                        {/* Text (Cols 1-4) */}
                        <div className="md:col-span-4 flex justify-end">
                          <div className="w-full max-w-[450px]">
                            <h3 className="font-host font-extrabold text-[22px] sm:text-[26px] uppercase tracking-wide text-white mb-3 leading-snug">
                              {item.title}
                            </h3>
                            <p className="font-mono text-[13px] sm:text-[14px] uppercase leading-relaxed text-[#B0B0B0] tracking-wide">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Image (Cols 5-8, directly under odd step images) */}
                        <div className="md:col-span-4 flex justify-start">
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

                        {/* Spacer for Line 4 Dot (Col 9) */}
                        <div className="hidden md:block md:col-span-1"></div>

                        {/* Number (Cols 10-12, left-aligned to Line 4 dot) */}
                        <div className="md:col-span-3 flex justify-start items-center pl-6 md:pl-10">
                          <span className="font-clash font-bold text-[clamp(90px,11vw,170px)] leading-none text-white tracking-tight">
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
          /* Fallback: THE PLAN section (Image 2 styling) */
          <div className="relative z-10 w-[93.056%] mx-auto py-[100px]">
            <div className="flex gap-100 items-end m-50">
              {/* Left Title: THE PLAN */}
              <div className="lg:col-span-5 flex flex-col leading-[0.85]">
                <span className="font-host font-extrabold uppercase text-[#8A8A8A] text-[clamp(64px,8vw,140px)]">
                  THE
                </span>
                <span className="font-host font-extrabold uppercase text-white text-[clamp(64px,8vw,140px)]">
                  PLAN
                </span>
              </div>

              {/* Right Content: plan text */}
              <div className="lg:col-span-7 pt-4 lg:pt-12">
                <p className="font-host text-white text-[clamp(16px,1.4vw,24px)] leading-[1.4] tracking-tight whitespace-pre-line text-left">
                  {event.plan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Brochure & Rulebook text */}
        <div className="relative z-10 w-[93.056%] mx-auto my-16 pt-12 border-t border-light-grey text-center">
          <p className="font-host font-bold text-[36px] uppercase leading-[1] tracking-[0.02em] text-white max-w-[900px] mx-auto">
            EVERY <span className="text-[#E91E63]">SUCCESSFUL</span> ENDEAVOR NEEDS SOME <span className="text-[#E91E63]">RULES</span> TO BE SUCCESSFUL...SO DO WE. TAKE A LOOK AT THE <span className="text-[#E91E63]">RULEBOOK</span> AND THE <span className="text-[#E91E63]">BROCHURE</span> TO GET THE FULL IDEA ABOUT THIS WORKSHOP.
          </p>

          <div className="flex flex-wrap justify-center items-center font-bold font-mono gap-4 mt-6 text-[32px] uppercase tracking-[0.02em] text-[#E91E63]">
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

            <span>|</span>

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
        <div className="relative z-10 w-[93.056%] m-16 p-20 text-left">
          <h2 className="font-host font-extrabold text-[64px] uppercase leading-tight text-white">
            LIKE WHAT YOU SEE?<br />
            THEN WHAT ARE YOU <span className="text-[#E91E63]">WAITING</span> FOR?<br />
            <span className="text-[#E91E63]">REGISTER NOW.</span>
          </h2>
        </div>

        {/* CLICK HERE TO REGISTER Big Banner CTA */}
        <div className="relative z-10 w-[93.056%] font-poppins mx-auto mb-28 border-t border-light-grey py-24 text-center cursor-pointer register-hover-container"
          onClick={() => navigate(`/register/${event.slug}`)}>
          <span className="font-medium text-[96px] uppercase tracking-[0.02em] leading-[1] text-accent-pink block mb-2">
            CLICK HERE TO
          </span>
          <div className="relative inline-block">
            <span className="register-hover-text font-bold text-[180px] uppercase leading-none">
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
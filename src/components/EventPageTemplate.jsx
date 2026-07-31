import React from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Contact from './Contact'
import Footer from './Footer'
import { EVENTS } from "../../constants/index";
import { useNavigate, useParams } from 'react-router-dom'
import Button from './Button'
import { useMediaQuery } from 'react-responsive'

const EventPageTemplate = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    return <h1>404 - Event Not Found</h1>;
  }

  return (
    <>
      <section id="eventpagetemplate" className="relative z-10 min-h-screen overflow-hidden">

        <Header />
        <BackgroundLines />

        {/* Hero Card Container */}
        <div className={`relative z-10 border border-r-0 border-[#666666] bg-[#0e0e0e] ${isMobile768 ? 'w-[93.056%] mx-auto mt-[120px] mb-8 z-25' : 'w-[93.056%] mx-auto mt-[90px] mb-[120px]'
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
              {event.pagesubtitle}
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
          : 'ml-[50%] w-[46.528%] mb-[75px]'
          }`}>

          <div className={isMobile768 ? 'w-full border-t border-b border-light-grey' : 'w-full border-b border-light-grey'}>

            {[
              ["DATE:", event.date],
              ["AUDIENCE:", event.audience],
              ["TYPE:", event.type],
              [
                "TAGS:",
                <div className={`flex flex-col ${isMobile768 ? 'items-start text-left' : 'items-end text-right'} gap-1`}>
                  {event.tags?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ],
              ["POWERED BY:", event.sponsors],
            ].map(([title, value]) => (
              <div
                key={title}
                className={`border-b last:border-b-0 border-light-grey items-center ${isMobile768 ? 'flex flex-col justify-start items-start p-3 gap-1' : 'grid grid-cols-[1fr_1.8fr] justify-center'
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

        {/* Photo Gallery Grid */}
        <div className={
          isMobile768
            ? 'w-[93.056%] mx-auto relative z-10 border border-light-grey p-2 bg-[#0e0e0e]'
            : 'ml-[490px] mr-[65px] relative z-10 border border-light-grey p-[14px] bg-[#0e0e0e]'
        }>

          <div className={isMobile768 ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-[6px]'}>

            {event.images?.map((image, index) => (

              <div
                key={index}
                className="
         overflow-hidden
        border
        border-light-grey
        bg-[#0E0E0E]
        aspect-[16/10]
        w-full
      "
              >

                <img
                  src={image}
                  alt={`${event.name} ${index + 1}`}
                  className="
          w-full
          h-full
          object-cover
          transition-transform
          duration-500
          hover:scale-[1.03]
        "
                />

              </div>

            ))}

          </div>

        </div>

        {/* View Album Button */}
        <Button
          label="View the album"
          onClick={() => window.open(
            `${event.albumLink}`,
            "_blank",
            "noopener,noreferrer"
          )}
          className={
            isMobile768
              ? '!relative !z-10 !left-[3.472%] !w-[93.056%] mt-8 mb-12'
              : '!relative !left-[74.35%] !w-[22.25%] mt-12 mb-20'
          }
        />

        {/* The Plan Section */}
        <div className={
          isMobile768
            ? 'w-[93.056%] mx-auto p-10 relative z-10 mb-12 flex flex-col gap-6 bg-[#0e0e0e] border border-light-grey'
            : 'w-[93.056%] mx-auto py-[140px] relative z-10 mb-50'
        }>

          <div className={isMobile768 ? 'flex flex-col leading-[0.85]' : 'flex flex-col leading-[0.85] ml-40'}>
            <span className={`font-host font-extrabold uppercase text-[#8A8A8A] ${isMobile768 ? 'text-[50px]' : 'text-[clamp(64px,6vw,120px)]'}`}>
              THE
            </span>

            <span className={`font-host font-extrabold uppercase text-accent-pink ${isMobile768 ? 'text-[50px]' : 'text-white text-[clamp(64px,6vw,120px)]'}`}>
              PLAN
            </span>
          </div>

          <div className={isMobile768 ? 'pt-2 mt-2 w-full' : 'max-w-[1200px] pt-[20px] mt-20 ml-120'}>
            <p className="font-host text-white text-[14px] md:text-[clamp(18px,1.2vw,22px)] leading-[1.4] tracking-[-0.01em] whitespace-pre-line">
              {event.plan}
            </p>
          </div>

        </div>

        {/* Explore All Events Button */}
        <Button
          label="Explore All Events"
          onClick={() => { navigate(`/events`); }}
          className={
            isMobile768
              ? '!relative !z-10 !left-[3.472%] !w-[93.056%] mt-4 mb-20'
              : '!relative !left-[74.306%] !w-[22.222%] mt-6 mb-60'
          }
        />

      </section>
      <Contact />
      <Footer />
    </>
  )
}

export default EventPageTemplate
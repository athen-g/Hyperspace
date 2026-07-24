import React from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import Contact from './Contact'
import Footer from './Footer'
import { EVENTS } from "../../constants/index";
import { useNavigate, useParams } from 'react-router-dom'
import Button from './Button'

const EventPageTemplate = () => {

  const navigate = useNavigate();

  const { slug } = useParams();

  const event = EVENTS.find((e) => e.slug === slug);

  if (!event) {
    return <h1>404 - Event Not Found</h1>;
  }

  return (
    <>
      <section id="eventpagetemplate" className="relative min-h-screen overflow-hidden">

        <Header />
        <BackgroundLines />

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
              {event.pagesubtitle}
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
              ["AUDIENCE:", event.audience],
              ["TYPE:", event.type],
              [
                "TAGS:",
                <div className="flex flex-col items-end gap-1">
                  {event.tags?.map((tag, index) => (
                    <span key={index}>{tag}</span>
                  ))}
                </div>,
              ],
              ["POWERED BY:", event.sponsors],
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


        <div className="ml-[490px] mr-[65px] relative z-10 border border-light-grey p-[14px] bg-[#0e0e0e]">

          <div className="grid grid-cols-2 gap-[6px]">

            {event.images?.map((image, index) => (

              <div
                key={index}
                className="
         overflow-hidden
        border
        border-light-grey
        bg-[#0E0E0E]
        aspect-[16/10]
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

        <Button
          label="View the album"
          onClick={() => window.open(
            `${event.albumLink}`,
            "_blank",
            "noopener,noreferrer"
          )}
          className='!relative !left-[74.35%] !w-[22.25%] mt-12 mb-20'
        />

        <div className="w-[93.056%] mx-auto py-[140px] relative z-10 mb-50">

          <div className="flex flex-col leading-[0.85] ml-40">
            <span className="font-host font-extrabold uppercase text-[#8A8A8A] text-[clamp(64px,6vw,120px)]">
              THE
            </span>

            <span className="font-host font-extrabold uppercase text-white text-[clamp(64px,6vw,120px)]">
              PLAN
            </span>
          </div>

          <div className="max-w-[1200px] pt-[20px] mt-20 ml-120">
            <p className="font-host text-white text-[clamp(18px,1.2vw,22px)] leading-[1.15] tracking-[-0.01em] whitespace-pre-line">
              {event.plan}
            </p>
          </div>


        </div>

        <Button
          label="Explore All Events"
          onClick={() => { navigate(`/events`); }}
          className='!relative !left-[50%] !w-[46.6%] mt-6 mb-60'
        />

      </section>
      <Contact />
      <Footer />
    </>
  )
}

export default EventPageTemplate
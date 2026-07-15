import React, { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import { testimonials } from '../../constants/index'

gsap.registerPlugin(useGSAP, SplitText)

const RollButton = ({ label, onClick, withDivider }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex-1 border-t border-t-light-grey py-5 transition-colors duration-300 hover:border-t-white hover:border-t-[2px] hover:cursor-pointer ${
      withDivider ? 'border-r border-r-light-grey' : ''
    }`}
  >
    <span className="relative mx-auto block h-[16px] w-fit overflow-hidden">
      <span className="block font-mono text-[13px] tracking-[0.25em] text-white/50 transition-transform duration-500 ease-out group-hover:-translate-y-full ">
        {label}
      </span>
      <span className="absolute left-1/2 top-full block -translate-x-1/2 font-mono text-[13px] tracking-[0.25em] text-white transition-transform duration-500 ease-out group-hover:-translate-y-full">
        {label}
      </span>
    </span>
  </button>
)

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const quoteRef = useRef(null)
  const splitRef = useRef(null)

  const total = testimonials.length
  const current = testimonials[currentIndex]

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % total)
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + total) % total)

  useGSAP(
    () => {
      if (!quoteRef.current) return

      if (splitRef.current) {
        splitRef.current.revert()
        splitRef.current = null
      }

      const split = new SplitText(quoteRef.current, {
        type: 'words,lines',
        linesClass: 'overflow-hidden',
      })

      splitRef.current = split

      gsap.fromTo(
        split.words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.02,
          ease: 'power3.out',
        }
      )

      return () => {
        split.revert()
        splitRef.current = null
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  )

  return (
    <section id="testimonials" className="mt-13 mb-0">
      <div className="ml-[25.694%] w-[48.612%] max-lg:ml-4 max-lg:w-[calc(100%-2rem)]">
        <header className="mb-14 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="h-[7px] w-[7px] rounded-full border border-white bg-white" />
            <span className="relative z-10 font-mono text-[20px] font-bold text-accent-pink">
              TESTIMONIALS
            </span>
          </div>
          <div className="mt-20 flex flex-col items-center justify-center text-center font-host text-[80px] font-extrabold leading-[0.9] tracking-[0.05em] text-white max-lg:text-[56px] relative z-10">
            <p className="text-accent-pink">WORDS THAT</p>
            <p>CARRY WEIGHT</p>
          </div>
        </header>

        <div className="overflow-hidden border border-light-grey bg-[#0e0e0e] relative z-10">
          <div className="p-8 pb-12 pt-10 text-center max-lg:px-6">
            <p
              ref={quoteRef}
              className="quote-testimonials"
            >
              &quot;{current.quote}&quot;
            </p>

            <img
              src={current.image}
              alt={current.name}
              className="mx-auto mt-20 mb-4 h-[64px] w-[64px] rounded-full object-cover relative z-10"
            />

            <p className="font-mono text-[13px] font-bold tracking-[0.2em] text-white">
              {current.name}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-white/40">
              {current.position}
            </p>

            <div className="mt-4 flex items-center justify-center gap-2">
              {testimonials.map((t, index) => (
                <span
                  key={t.id}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'h-[6px] w-[6px] bg-white'
                      : 'h-[5px] w-[5px] bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 border border-light-grey">
            <RollButton label="PREV" onClick={goPrev} withDivider />
            <RollButton label="NEXT" onClick={goNext} />
          </div>
        </div>
      </div>
      <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-light-grey" />
    </section>
  )
}

export default Testimonials

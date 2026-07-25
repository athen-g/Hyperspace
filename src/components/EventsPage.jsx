import React, { useRef } from 'react'
import BackgroundLines from './ui/BackgroundLines'
import Header from './Header'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import showcaseVideo from '../assets/videos/events-motion-video.mp4'
import { EVENTS_CONDUCTED, EVENTS_COMING_SOON } from '../../constants/index'
import { eventsOngoing } from '../../constants/events'
import Contact from './Contact'
import Footer from './Footer'
import { useNavigate } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

// --- REUSABLE LOCAL COMPONENTS ---

const SectionHeading = ({ title, headingRef, pillRef }) => {
    return (
        <div className="flex justify-center items-center py-8">
            <div
                ref={headingRef}
                className="relative px-10 py-4 rounded-full flex items-center justify-center text-center font-bold text-xl md:text-2xl uppercase tracking-widest text-white border border-white/10 overflow-hidden bg-transparent z-10"
            >
                {/* White pill fill that scrubs in behind the text as the section scrolls into view */}
                <div
                    ref={pillRef}
                    className="absolute inset-0 bg-white rounded-full opacity-0 pointer-events-none z-0"
                    style={{ transform: 'scale(0.9)' }}
                />
                <span className="relative z-10 pointer-events-none">{title}</span>
            </div>
        </div>
    )
}

// A small pill badge used for each card's "01 — Name" label. It starts as a
// transparent outline with white text, then scrubs into a solid white pill
// with black text — the same visual language as SectionHeading, but driven
// per-card instead of per-section.
const PillTitle = ({ displayNum, name, pillBgRef, pillTextRef }) => {
    return (
        <div className="relative inline-flex items-center px-5 py-2 rounded-full border border-white/15 overflow-hidden">
            <div
                ref={pillBgRef}
                className="absolute inset-0 bg-white rounded-full opacity-0 pointer-events-none z-0"
                style={{ transform: 'scale(0.9)' }}
            />
            <span
                ref={pillTextRef}
                className="relative z-10 font-extrabold text-xs md:text-sm font-mono tracking-widest uppercase pointer-events-none text-white"
            >
                {displayNum} — {name}
            </span>
        </div>
    )
}

const EventCard = ({ event, displayNum, isComingSoon = false, isOngoing = false, pillBgRef, pillTextRef, imageRef }) => {

    const navigate = useNavigate();

    if (!event) return null

    const name = event.name || ''
    const tagline = event.tagline || ''
    const thumbnail = event.thumbnail || ''

    const handleCardClick = () => {
        navigate(`/events/${event.slug}`);
    }
    return (
        <div
            onClick={handleCardClick}
            className={`w-full mx-auto rounded-3xl p-6 md:p-8 backdrop-blur-3xl border shadow-[0_35px_120px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.15)] text-white flex flex-col justify-between transition-all duration-300 ${isOngoing
                    ? 'bg-neutral-950/60 border-green-500/20 hover:border-green-500/35 max-w-3xl min-h-[420px] md:min-h-[480px]'
                    : isComingSoon
                        ? 'bg-neutral-950/60 border-white/10 hover:border-white/20 max-w-2xl min-h-[220px] md:min-h-[260px]'
                        : 'bg-neutral-950/60 border-white/10 hover:border-white/20 max-w-[1320px] min-h-[480px] md:h-full'
                } ${event.route ? 'cursor-pointer' : ''}`}
        >
            {/* Registrations Open Badge — only for ongoing cards, pinned at the very top */}
            {isOngoing && (
                <div className="flex items-center gap-2.5 flex-shrink-0 mb-3">
                    <div className="ongoing-reg-badge">
                        <span className="ongoing-reg-badge__dot" />
                        <span className="ongoing-reg-badge__text">Registrations Open</span>
                    </div>
                </div>
            )}

            {/* Top Row: Animated Pill Title & Action Icon */}
            <div className="flex items-center justify-between w-full flex-shrink-0">
                <PillTitle displayNum={displayNum} name={name} pillBgRef={pillBgRef} pillTextRef={pillTextRef} />
                <div className="text-white/90 font-light text-2xl select-none hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer" onClick={handleCardClick}>
                    ↗
                </div>
            </div>

            {/* Middle Row: Tagline Announcement Text */}
            <div
                className={`w-full text-center py-4 flex items-center justify-center ${isComingSoon && !isOngoing ? 'flex-grow' : 'flex-shrink-0'
                    }`}
            >
                <h3 className="text-white font-extrabold uppercase tracking-wide text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                    {tagline}
                </h3>
            </div>

            {/* Bottom Row Area: Status Indicators & Dynamic Media Assets. */}
            <div className={`w-full flex flex-col gap-4 ${isComingSoon && !isOngoing ? 'flex-shrink-0' : 'flex-1 min-h-0'}`}>
                {/* Status chip — hidden for ongoing (badge is already at top) */}
                {!isOngoing && (
                    <div className="flex items-center justify-start gap-2.5 text-[11px] font-black tracking-widest uppercase font-mono flex-shrink-0">
                        {isComingSoon ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-orange-500">Coming Soon</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-green-500">Latest</span>
                            </>
                        )}
                    </div>
                )}

                {/* Media block — shown for conducted and ongoing cards */}
                {(!isComingSoon || isOngoing) && thumbnail && (
                    <div
                        ref={imageRef}
                        className="w-full flex-1 min-h-0 rounded-2xl overflow-hidden relative bg-neutral-900/60 border border-white/5 shadow-2xl mt-1"
                    >
                        <img
                            src={thumbnail}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                        />
                        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 h-8 w-8 rounded-full flex items-center justify-center pointer-events-none">
                            <div className={`w-2.5 h-2.5 rounded-full opacity-90 ${isOngoing ? 'bg-green-500' : 'bg-accent-pink'}`} />
                        </div>
                        <div className="absolute top-4 right-4 text-white/40 text-sm font-light pointer-events-none font-mono">
                            →
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- MAIN EVENTS PAGE COMPONENT ---

const EventsPage = () => {
    const scrollRef = useRef(null)
    const stageRef = useRef(null)
    const videoWrapRef = useRef(null)
    const showRef = useRef(null)
    const caseRef = useRef(null)
    const scrollHintRef = useRef(null)

    // Events Conducted refs
    const conductedSectionRef = useRef(null)
    const conductedCardsWrapperRef = useRef(null)
    const conductedHeadingRef = useRef(null)
    const conductedPillRef = useRef(null)
    const conductedCardsRef = useRef([])
    const conductedCardPillBgRef = useRef([])
    const conductedCardPillTextRef = useRef([])
    const conductedCardImageRef = useRef([])

    // Ongoing Events refs
    const ongoingSectionRef = useRef(null)
    const ongoingHeadingRef = useRef(null)
    const ongoingPillRef = useRef(null)
    const ongoingCardsRef = useRef([])
    const ongoingCardPillBgRef = useRef([])
    const ongoingCardPillTextRef = useRef([])

    // Coming Soon refs
    const comingSoonSectionRef = useRef(null)
    const comingSoonHeadingRef = useRef(null)
    const comingSoonPillRef = useRef(null)
    const comingSoonCardsRef = useRef([])
    const comingSoonCardPillBgRef = useRef([])
    const comingSoonCardPillTextRef = useRef([])

    // Original Showcase Video & Word Spread Scroll Animation Timeline (Completely Untouched)
    useGSAP(() => {
        const showEl = showRef.current
        const caseEl = caseRef.current
        const videoWrap = videoWrapRef.current
        const scrollEl = scrollRef.current
        const scrollHint = scrollHintRef.current

        if (!showEl || !caseEl || !videoWrap || !scrollEl) return

        const getShowStart = () => -(window.innerWidth * 0.5 + showEl.offsetWidth * 0.6)
        const getCaseStart = () => window.innerWidth * 0.5 + caseEl.offsetWidth * 0.6

        gsap.set(videoWrap, { scale: 0.18 })
        gsap.set(showEl, { x: getShowStart() })
        gsap.set(caseEl, { x: getCaseStart() })

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollEl,
                start: 'top top',
                end: '+=280%',
                scrub: 0.65,
                pin: stageRef.current,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        })

        tl.to(videoWrap, { scale: 1, ease: 'none' }, 0)
            .to(showEl, { x: 0, ease: 'none' }, 0)
            .to(caseEl, { x: 0, ease: 'none' }, 0)

        if (scrollHint) {
            tl.to(scrollHint, { opacity: 0, ease: 'none' }, 0)
        }

        ScrollTrigger.refresh()

        return () => {
            tl.scrollTrigger?.kill()
            tl.kill()
        }
    }, { scope: scrollRef })

    // Events Conducted: one unified pinned timeline drives the heading pill,
    // each card's own pill title, the stacking, and the delayed image reveal —
    // all in a single scrub range so nothing gets out of sync.
    useGSAP(() => {
        const conductedSection = conductedSectionRef.current
        const conductedCardsWrapper = conductedCardsWrapperRef.current
        const conductedCards = conductedCardsRef.current.filter(Boolean)
        const pillBgs = conductedCardPillBgRef.current.filter(Boolean)
        const pillTexts = conductedCardPillTextRef.current.filter(Boolean)
        const cardImages = conductedCardImageRef.current.filter(Boolean)

        if (!conductedSection || !conductedCardsWrapper || conductedCards.length === 0) return

        const mm = gsap.matchMedia()

        mm.add('(min-width: 768px)', () => {
            // --- Initial states ---
            conductedCards.forEach((card, idx) => {
                if (idx === 0) {
                    gsap.set(card, { yPercent: 0, scale: 1, opacity: 1, pointerEvents: 'auto' })
                } else {
                    gsap.set(card, {
                        yPercent: 130,
                        scale: 0.9 + idx * 0.02,
                        opacity: 0,
                        pointerEvents: 'none',
                    })
                }
            })

            gsap.set(pillBgs, { opacity: 0, scale: 0.9 })
            gsap.set(pillTexts, { color: '#ffffff' })
            gsap.set(cardImages, { opacity: 0 })

            if (conductedPillRef.current) gsap.set(conductedPillRef.current, { opacity: 0, scale: 0.9 })
            if (conductedHeadingRef.current) {
                gsap.set(conductedHeadingRef.current, { color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' })
            }

            // 1 timeline "unit" per card transition, plus a small intro unit for
            // the heading + first card's pill to morph in before stacking begins.
            const introUnits = 0.6
            const stackUnits = Math.max(conductedCards.length - 1, 0)
            const totalUnits = introUnits + stackUnits

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: conductedSection,
                    start: 'top top',
                    end: `+=${totalUnits * 100}%`,
                    scrub: 0.8,
                    pin: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            })

            // --- Intro: section heading pill + first card's pill morph together ---
            if (conductedPillRef.current && conductedHeadingRef.current) {
                tl.to(conductedPillRef.current, { opacity: 1, scale: 1, ease: 'none' }, 0)
                tl.to(conductedHeadingRef.current, { color: '#000000', borderColor: 'rgba(255, 255, 255, 0)', ease: 'none' }, 0)
            }
            if (pillBgs[0] && pillTexts[0]) {
                tl.to(pillBgs[0], { opacity: 1, scale: 1, ease: 'none' }, 0)
                tl.to(pillTexts[0], { color: '#000000', ease: 'none' }, 0)
            }
            if (cardImages[0]) {
                tl.to(cardImages[0], { opacity: 1, ease: 'none' }, introUnits * 0.5)
            }

            // --- Stacking: each subsequent card enters, its pill morphs, its
            //     background image is revealed only once it has settled ---
            conductedCards.forEach((card, idx) => {
                if (idx === 0) return
                const label = introUnits + (idx - 1)

                // Push earlier cards back slightly — never fully invisible, so the
                // first card's background always stays visible underneath.
                for (let j = 0; j < idx; j++) {
                    tl.to(
                        conductedCards[j],
                        {
                            scale: Math.max(0.82, 1 - (idx - j) * 0.04),
                            yPercent: -(idx - j) * 5,
                            opacity: Math.max(0.45, 1 - (idx - j) * 0.22),
                            pointerEvents: 'none',
                            duration: 1,
                            ease: 'power2.inOut',
                        },
                        label
                    )
                }

                // Bring the current card into focus
                tl.to(
                    card,
                    {
                        yPercent: 0,
                        scale: 1,
                        opacity: 1,
                        pointerEvents: 'auto',
                        duration: 1,
                        ease: 'power2.inOut',
                    },
                    label
                )

                // Morph its pill title in as it settles into place
                if (pillBgs[idx] && pillTexts[idx]) {
                    tl.to(pillBgs[idx], { opacity: 1, scale: 1, ease: 'power2.inOut', duration: 0.6 }, label + 0.3)
                    tl.to(pillTexts[idx], { color: '#000000', ease: 'power2.inOut', duration: 0.6 }, label + 0.3)
                }

                // Reveal the background image only after the card has reached its
                // resting position, instead of popping in mid-motion.
                if (cardImages[idx]) {
                    tl.to(cardImages[idx], { opacity: 1, ease: 'power1.out', duration: 0.35 }, label + 0.65)
                }

                tl.to({}, { duration: 0.2 })
            })
        })

        mm.add('(max-width: 767px)', () => {
            conductedCards.forEach((card) => {
                gsap.set(card, { yPercent: 0, scale: 1, opacity: 1, pointerEvents: 'auto' })
            })
            gsap.set(pillBgs, { opacity: 1, scale: 1 })
            gsap.set(pillTexts, { color: '#000000' })
            gsap.set(cardImages, { opacity: 1 })
            if (conductedPillRef.current) gsap.set(conductedPillRef.current, { opacity: 1, scale: 1 })
            if (conductedHeadingRef.current) {
                gsap.set(conductedHeadingRef.current, { color: '#000000', borderColor: 'rgba(255, 255, 255, 0)' })
            }
        })

        ScrollTrigger.refresh()

        return () => mm.revert()
    }, [])

    // Coming Soon: same white-pill heading treatment, plus each card gets its
    // own pill-title reveal as it scrolls into view (no stacking/pinning).
    useGSAP(() => {
        const comingSoonSection = comingSoonSectionRef.current
        if (!comingSoonSection) return

        if (comingSoonPillRef.current && comingSoonHeadingRef.current) {
            gsap.set(comingSoonPillRef.current, { opacity: 0, scale: 0.9 })
            gsap.set(comingSoonHeadingRef.current, { color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' })

            gsap.timeline({
                scrollTrigger: {
                    trigger: comingSoonSection,
                    start: 'top bottom',
                    end: 'top center',
                    scrub: 0.6,
                },
            })
                .to(comingSoonPillRef.current, { opacity: 1, scale: 1, ease: 'none' }, 0)
                .to(comingSoonHeadingRef.current, { color: '#000000', borderColor: 'rgba(255, 255, 255, 0)', ease: 'none' }, 0)
        }

        const csCards = comingSoonCardsRef.current.filter(Boolean)
        const csPillBgs = comingSoonCardPillBgRef.current.filter(Boolean)
        const csPillTexts = comingSoonCardPillTextRef.current.filter(Boolean)

        csCards.forEach((card, idx) => {
            const bg = csPillBgs[idx]
            const text = csPillTexts[idx]
            if (!bg || !text) return

            gsap.set(bg, { opacity: 0, scale: 0.9 })
            gsap.set(text, { color: '#ffffff' })

            gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 55%',
                    scrub: 0.6,
                },
            })
                .to(bg, { opacity: 1, scale: 1, ease: 'none' }, 0)
                .to(text, { color: '#000000', ease: 'none' }, 0)
        })

        ScrollTrigger.refresh()
    }, [])

    // Ongoing Events: same scroll-driven white-pill reveal as Coming Soon.
    useGSAP(() => {
        const ongoingSection = ongoingSectionRef.current
        if (!ongoingSection) return

        if (ongoingPillRef.current && ongoingHeadingRef.current) {
            gsap.set(ongoingPillRef.current, { opacity: 0, scale: 0.9 })
            gsap.set(ongoingHeadingRef.current, { color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' })

            gsap.timeline({
                scrollTrigger: {
                    trigger: ongoingSection,
                    start: 'top bottom',
                    end: 'top center',
                    scrub: 0.6,
                },
            })
                .to(ongoingPillRef.current, { opacity: 1, scale: 1, ease: 'none' }, 0)
                .to(ongoingHeadingRef.current, { color: '#000000', borderColor: 'rgba(255, 255, 255, 0)', ease: 'none' }, 0)
        }

        const ogCards = ongoingCardsRef.current.filter(Boolean)
        const ogPillBgs = ongoingCardPillBgRef.current.filter(Boolean)
        const ogPillTexts = ongoingCardPillTextRef.current.filter(Boolean)

        ogCards.forEach((card, idx) => {
            const bg = ogPillBgs[idx]
            const text = ogPillTexts[idx]
            if (!bg || !text) return

            gsap.set(bg, { opacity: 0, scale: 0.9 })
            gsap.set(text, { color: '#ffffff' })

            gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 55%',
                    scrub: 0.6,
                },
            })
                .to(bg, { opacity: 1, scale: 1, ease: 'none' }, 0)
                .to(text, { color: '#000000', ease: 'none' }, 0)
        })

        ScrollTrigger.refresh()
    }, [])

    return (
        <>
            <Header />
            <section id="eventsPage" className="events-page">
                <BackgroundLines />

                <div className="events-showcase-scroll" ref={scrollRef}>
                    <div className="events-showcase-stage" ref={stageRef}>
                        <div className="events-showcase-video-wrap" ref={videoWrapRef}>
                            <video
                                className="events-showcase-video"
                                src={showcaseVideo}
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        </div>

                        <div className="events-showcase-words" aria-hidden="true">
                            <span ref={showRef} className="events-showcase-word events-showcase-word--show">
                                SHOW
                            </span>
                            <span ref={caseRef} className="events-showcase-word events-showcase-word--case">
                                CASE
                            </span>
                        </div>
                    </div>
                </div>

                <div className="events-page-content">
                    {/* event-page-header */}
                    <div className="events-page-header">
                        <div className="events-page-title">
                            <span className="events-page-title__line text-accent-pink">A COLLECTION</span>
                            <span className="events-page-title__line">
                                <span className="text-accent-pink">OF</span>
                                {' '}
                                REFINED
                            </span>
                            <span className="events-page-title__line">EXPERIENCES</span>
                        </div>
                        <p className="events-page-header__desc">
                            EVERY EVENT HERE WAS SHAPED WITH INTENTION — FROM LAYOUT AND TYPOGRAPHY TO INTERACTION AND TONE.
                        </p>
                    </div>

                    {/* --- ONGOING EVENTS SECTION (only when data exists) --- */}
                    {eventsOngoing && eventsOngoing.length > 0 && (
                        <div
                            ref={ongoingSectionRef}
                            className="relative w-full min-h-fit flex flex-col items-center justify-start py-12 md:py-16 px-4 md:px-0"
                        >
                            {/* Ongoing Section Heading */}
                            <div className="w-full flex-shrink-0 z-20">
                                <SectionHeading
                                    title="Ongoing Events"
                                    headingRef={ongoingHeadingRef}
                                    pillRef={ongoingPillRef}
                                />
                            </div>

                            {/* Ongoing Cards Flow */}
                            <div className="w-full max-w-4xl flex flex-col gap-6 md:gap-8 mt-12 md:mt-16 z-10">
                                {eventsOngoing.map((event, idx) => {
                                    const displayNum = String(idx + 1).padStart(2, '0')
                                    return (
                                        <div
                                            key={event.id || idx}
                                            className="w-full"
                                            ref={(el) => { ongoingCardsRef.current[idx] = el }}
                                        >
                                            <EventCard
                                                event={event}
                                                displayNum={displayNum}
                                                isOngoing={true}
                                                pillBgRef={(el) => { ongoingCardPillBgRef.current[idx] = el }}
                                                pillTextRef={(el) => { ongoingCardPillTextRef.current[idx] = el }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* --- EVENTS CONDUCTED SECTION --- */}
                    <div
                        ref={conductedSectionRef}
                        className="relative w-full md:h-screen flex flex-col justify-start items-center py-6 md:py-8 mt-8 md:mt-10"
                    >
                        {/* Title Heading Frame */}
                        <div className="w-full flex-shrink-0 z-20">
                            <SectionHeading
                                title="Events Conducted"
                                headingRef={conductedHeadingRef}
                                pillRef={conductedPillRef}
                            />
                        </div>

                        {/* Box Frame Layout Wrapper Container — fills exactly the
                            space left below the heading, so the stage never sits
                            smaller than its box (which caused the big gap) and
                            never taller than it (which caused the last card to
                            clip at the bottom of the pinned viewport). */}
                        <div className="relative w-full max-w-[1400px] flex-grow flex items-center justify-center min-h-0 px-4 z-10 mt-4 md:mt-6">
                            <div ref={conductedCardsWrapperRef} className="relative w-full h-auto md:h-full flex items-center justify-center">
                                <div className="w-full h-auto md:h-full flex flex-col md:block md:relative gap-8">
                                    {EVENTS_CONDUCTED && EVENTS_CONDUCTED.map((event, idx) => {
                                        const displayNum = String(idx + 1).padStart(2, '0')
                                        return (
                                            <div
                                                key={event.id || idx}
                                                ref={(el) => { conductedCardsRef.current[idx] = el }}
                                                className="w-full md:absolute md:inset-0 px-0"
                                                style={{ zIndex: idx + 1 }}
                                            >
                                                <EventCard
                                                    event={event}
                                                    displayNum={displayNum}
                                                    isComingSoon={false}
                                                    pillBgRef={(el) => { conductedCardPillBgRef.current[idx] = el }}
                                                    pillTextRef={(el) => { conductedCardPillTextRef.current[idx] = el }}
                                                    imageRef={(el) => { conductedCardImageRef.current[idx] = el }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spacing Break Separation */}
                    <div className="h-28 md:h-48" />

                    {/* --- COMING SOON SECTION --- */}
                    <div
                        ref={comingSoonSectionRef}
                        className="relative w-full min-h-screen flex flex-col items-center justify-start py-12 md:py-16 px-4 md:px-0"
                    >
                        {/* Coming Soon Section Heading */}
                        <div className="w-full flex-shrink-0 z-20">
                            <SectionHeading
                                title="Coming Soon"
                                headingRef={comingSoonHeadingRef}
                                pillRef={comingSoonPillRef}
                            />
                        </div>

                        {/* Standard Natural Block Element Flow Container */}
                        <div className="w-full max-w-4xl flex flex-col gap-6 md:gap-8 mt-12 md:mt-16 z-10">
                            {EVENTS_COMING_SOON && EVENTS_COMING_SOON.map((event, idx) => {
                                const displayNum = String(EVENTS_CONDUCTED.length + idx + 1).padStart(2, '0')
                                return (
                                    <div
                                        key={event.id || idx}
                                        className="w-full"
                                        ref={(el) => { comingSoonCardsRef.current[idx] = el }}
                                    >
                                        <EventCard
                                            event={event}
                                            displayNum={displayNum}
                                            isComingSoon={true}
                                            pillBgRef={(el) => { comingSoonCardPillBgRef.current[idx] = el }}
                                            pillTextRef={(el) => { comingSoonCardPillTextRef.current[idx] = el }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="font-host text-[80px] font-extrabold tracking-[0.05em] leading-[1.1em] text-[#ABABAB] relative py-[200px]">
                        <span className='ml-[950px] mr-0'>AND <span className='text-white'>MANY MORE...</span></span>
                    </div>
                </div>
            </section>
            <Contact />
            <Footer />
        </>
    )
}

export default EventsPage

import React from 'react'
import { BackgroundPathsDemo } from './ui/BackgroundPaths'
import face from '../assets/images/about-left1.png';
import butterfly from '../assets/images/about-right1.png';
import { ScrollRevealText } from './ui/ScrollRevealText';
import { useMediaQuery } from 'react-responsive';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/all';
import gsap from 'gsap';

const About = () => {

    const isMobile = useMediaQuery({ query: ('max-width: 414px') });
    const isDesktop = useMediaQuery({ query: ('(min-width: 1025px)') });
    const isMobile600 = useMediaQuery({ query: ('(max-width: 600px)') });

    useGSAP(() => {
        const lineSplit = new SplitText('.impact-title', { type: 'lines' });

        const aboutTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#about',
                start: '10% center'
            }
        })

        aboutTimeline
            .from(lineSplit.lines, {
                opacity: 0,
                yPercent: 100,
                duration: 1.8,
                ease: 'expo.out',
                delay: 1,
                stagger: 0.05
            });

        if (isDesktop) {
            const scrollTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#about',
                    start: 'top center',
                    end: 'bottom top',
                    scrub: true
                }
            })

            scrollTimeline
                .to('.butterfly', { y: -100 }, 0)
                .to('.face', { y: -200 }, 0);
        }

        document.querySelectorAll('.card-number').forEach((el) => {
            const raw = (el.dataset.value || '').trim();
            const match = raw.match(/^(\d+)(.*)$/);
            if (!match) return;

            const target = parseInt(match[1], 10);
            const suffix = match[2];
            const obj = { val: 1 };

            el.textContent = raw;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.impact-grid',
                    start: 'top 80%',
                    once: true,
                }
            });

            tl.to(obj, {
                val: 99,
                duration: 1.5,
                ease: 'none',
                onUpdate() {
                    el.textContent = String(Math.floor(obj.val)).padStart(2, '0') + suffix;
                }
            })
                .to(obj, {
                    val: target,
                    duration: 0.6,
                    ease: 'power4.out',
                    onUpdate() {
                        el.textContent = String(Math.floor(obj.val)).padStart(2, '0') + suffix;
                    },
                    onComplete() {
                        el.textContent = raw;
                    }
                });
        });

    })

    return (
        <section id="about" className='about'>
            <div className="about-main-background">
                <div className="about-main-content">
                    <div className="about-main-head">LOCATION</div>
                    <div className="about-main-sub">PUNE, INDIA</div>
                </div>
                <div className="about-main-content">
                    <div className="about-main-head">FIELD</div>
                    <div className="about-main-sub">EXTENDED REALITY (XR)</div>
                </div>
                <div className="about-main-content">
                    <div className="about-main-head">ROLE</div>
                    <div className="about-main-sub">DEVELOP XR SKILLS</div>
                </div>
                <div className="about-main-content">
                    <div className="about-main-head">TEAM</div>
                    <div className="about-main-sub">OF 18 ENTHUSIASTS</div>
                </div>
            </div>
            <div className={`about-section flex flex-col gap-8 md:gap-12 !ml-[3.472%] !pr-0 ${isMobile ? '!w-[calc(100%-3.472%)] !p-4 !pr-0' : ''}`}>
                <div className="flex gap-4 items-baseline">
                    <span className={`about-title ${isMobile600 ? '!text-[40px]' : ''}`}>ABOUT </span>
                    <span className={`about-title-us text-white tracking-[1px] font-extrabold ${isMobile600 ? '!text-[40px]' : 'text-[96px]'}`}>US</span>
                </div>

                {/* Section 1: WHAT IS AN SIG? */}
                <div className="flex items-center justify-between gap-8">
                    <div className="w-full">
                        <span className={`text-accent-pink font-host font-bold relative z-10 block mb-4 ${isMobile600 ? '!text-[32px]' : 'text-[40px]'}`}>
                            WHAT IS AN SIG?
                        </span>
                        <ScrollRevealText
                            className={`about-text-content z-10 relative ${isMobile600 ? '!text-[24px] !leading-8' : ''}`}
                            text="An sig is a special interest group consisting of talents who are eager to learn about specific topics. these groups are responsible for conducting events, spreading knowledge and awareness about those topics."
                        />
                    </div>
                    {isDesktop && (
                        <img src={face} alt="Face" className='w-120 z-10 mr-10 mb-16 face shrink-0' />
                    )}
                </div>

                {/* Section 2: WHAT IS HYPERSPACE? */}
                <div className="flex flex-row-reverse mr-[53px] gap-8 items-center justify-between">
                    <div className="w-full">
                        <span className={`text-accent-pink font-host text-right font-bold relative z-10 block mb-4 ${isMobile600 ? '!text-[32px]' : 'text-[40px]'}`}>
                            WHAT IS HYPERSPACE?
                        </span>
                        <ScrollRevealText
                            className={`about-text-content text-right z-10 relative ${isMobile600 ? '!text-[24px] !leading-8' : ''}`}
                            text="Hyperspace SIG is an XR Special Interest Group(SIG) based in MESWCOE in Pune, India. It consists of talents who are enthusiastic and passionate about Artificial Reality (AR), Virtual Reality (VR), Mixed Reality (MR) and Extended Reality (XR)."
                        />
                    </div>
                    {isDesktop && (
                        <img src={butterfly} alt="Butterfly" className='w-120 z-10 ml-16 mb-20 butterfly shrink-0' />
                    )}
                </div>

            </div>

            <div className="impact">
                <div className={`impact-title ${isMobile ? '!text-[24px] !leading-snug !ml-4 !w-[92%]' : ''}`}>OUR GROUP DOESN’T JUST LOOK GOOD - IT <span className='text-accent-pink'>PERFORMS.</span> HERE’S THE <span className='text-accent-pink'>IMPACT</span> BEHIND EVERY <span className="text-accent-pink">EVENT.</span></div>
                <div className="impact-grid">
                    <div className="impact-card">
                        <span className="impact-dot"></span>
                        <span className="card-number" data-value="3+">3+</span>
                        <span className="card-subtitle">EVENTS</span>
                        <span className="card-content">lectures, workshops conducted to fulfill our mission.</span>
                    </div>
                    <div className="impact-card">
                        <span className="impact-dot"></span>
                        <span className="card-number" data-value="94%">94%</span>
                        <span className="card-subtitle">PARTICIPANT SATISFACTION</span>
                        <span className="card-content">our event participants say that they are now confident in xr's future.</span>
                    </div>
                    <div className="impact-card">
                        <span className="impact-dot"></span>
                        <span className="card-number" data-value="1+">1+</span>
                        <span className="card-subtitle">YEARS EXPERIENCE</span>
                        <span className="card-content">defining various experiences and building various technologies.</span>
                    </div>
                    <div className="impact-card">
                        <span className="impact-dot"></span>
                        <span className="card-number" data-value="5+">5+</span>
                        <span className="card-subtitle">AVG RATING</span>
                        <span className="card-content">EVENT PARTICIPANTS RATE SATISFACTORY ALMOST EVERY TIME.</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
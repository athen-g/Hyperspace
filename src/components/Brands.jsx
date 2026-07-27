import { BRANDS } from '../../constants/index'
import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { SplitText, ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';
import Button from './Button';
import { useMediaQuery } from 'react-responsive';

gsap.registerPlugin(SplitText, ScrollTrigger);

import { mm, BREAKPOINTS } from '../lib/gsapConfig';

const Brands = () => {
    const containerRef = useRef(null);
    const [hoveredId, setHoveredId] = useState(null);
    const photoRef = useRef(null);

    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    useGSAP(() => {
        const titleSplit = new SplitText('.title', { type: 'lines' });
        const subtitleSplit = new SplitText('.subtitle', { type: 'lines' });

        const scrollTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#brands',
                start: '5% center',
            }
        });

        mm.add(BREAKPOINTS.desktop, () => {
            scrollTimeline
                .from(titleSplit.lines, {
                    opacity: 0,
                    yPercent: 100,
                    duration: 1,
                    stagger: 0.05,
                    ease: 'expo.out',
                })
                .from(subtitleSplit.lines, {
                    opacity: 0,
                    yPercent: 100,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: 'expo.out',
                });
        });

        mm.add(BREAKPOINTS.mobile, () => {
            scrollTimeline
                .from(titleSplit.lines, {
                    opacity: 0,
                    yPercent: 50,
                    duration: 0.5,
                    stagger: 0.03,
                    ease: 'power2.out',
                })
                .from(subtitleSplit.lines, {
                    opacity: 0,
                    yPercent: 30,
                    duration: 0.3,
                    stagger: 0.02,
                    ease: 'power2.out',
                });
        });
    }, { scope: containerRef });

    const hoveredBrand = BRANDS.find(b => b.id === hoveredId)

    const handleMouseEnter = (id) => {
        setHoveredId(id)
        if (photoRef.current) {
            gsap.killTweensOf(photoRef.current)
            gsap.fromTo(photoRef.current,
                { opacity: 0, scale: 0.96 },
                { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
            )
        }
    }

    const handleMouseLeave = () => {
        setHoveredId(null)
        if (photoRef.current) {
            gsap.killTweensOf(photoRef.current)
            gsap.to(photoRef.current, { opacity: 0, scale: 0.96, duration: 0.2, ease: 'power3.in' })
        }
    }

    return (
        <section ref={containerRef} id="brands" className={isMobile768 ? '!px-6 py-6' : ''}>
            <div className={`brand-title ${isMobile768 ? '!ml-[3.472%] !mr-[3.472%]' : ''}`}>
                <div className="title flex flex-col">
                    <span className="top">
                        <span className="text-accent-pink">BRANDS</span> WE'VE
                    </span>
                    <span>
                        <span className="text-accent-pink">WORKED</span> WITH
                    </span>
                </div>
                <div className="subtitle">
                    WE COLLABORATE WITH COMPANIES AND BRANDS WHO CARE ABOUT THOUGHTFUL DIGITAL PRESENCE AND THE GROWTH OF XR DEVELOPMENT IN INDIA. EACH EVENT IS SHAPED AND BUILD WITH THE SUPPORT OF SUCH BRANDS.
                </div>
            </div>

            <div className="brand-content border-b pb-40 border-[#666666]">
                {/* Desktop layout order vs Mobile layout order */}
                {!isMobile768 && (
                    <div className="brand-content-head-col flex flex-col items-start gap-6">
                        <div className="brand-content-head">
                            The goal is always the same: <span className="text-white">
                                events that communicate clearly with the audience and leaves a lasting impression.
                            </span>
                        </div>
                        <Button
                            className="!relative !left-0 !w-full mt-6"
                            label='CONTACT US'
                            onClick={() => {
                                const el = document.getElementById('contact');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                        />
                    </div>
                )}

                <div className={`brand-list-area${hoveredId ? ' has-hover' : ''} ${isMobile768 ? '!ml-[3.472%] !mr-[3.472%]' : ''}`}>
                    <div className="brand-list-photo" ref={photoRef}>
                        {hoveredBrand?.photo
                            ? <img src={hoveredBrand.photo} alt={hoveredBrand.name} className="w-full h-full object-cover" />
                            : null
                        }
                    </div>

                    <div className="brand-rows">
                        {BRANDS.map(({ id, name, date, link }) => (
                            <div
                                key={id}
                                className={`brand-list-content${hoveredId === id ? ' is-hovered' : ''}`}
                                onClick={() => link && window.open(link, '_blank', 'noopener,noreferrer')}
                            >
                                <span
                                    className="brand-list-title"
                                    onMouseEnter={() => handleMouseEnter(id)}
                                    onMouseLeave={handleMouseLeave}
                                >{name}</span>
                                <span className="brand-list-date">{date}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {isMobile768 && (
                    <div className="brand-content-head-col flex flex-col items-start gap-6 mt-8 !ml-[3.472%] !mr-[3.472%]">
                        <div className="brand-content-head !px-0">
                            The goal is always the same: <span className="text-white">
                                events that communicate clearly with the audience and leaves a lasting impression.
                            </span>
                        </div>
                        <div className="w-full relative -ml-[3.472%] w-[calc(100%+6.944%)]">
                            <Button
                                className="!relative !left-0 !w-full mt-4"
                                label='CONTACT US'
                                onClick={() => {
                                    const el = document.getElementById('contact');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Brands
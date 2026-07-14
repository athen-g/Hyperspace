import { BRANDS } from '../../constants/index'
import React, { useRef, useState } from 'react'
import gsap from 'gsap'

const Brands = () => {
    const [hoveredId, setHoveredId] = useState(null)
    const photoRef = useRef(null)

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
        <section id="brands">
            <div className="brand-title">
                <span className="title"><span className="text-accent-pink">BRANDS</span> WE'VE <span className="text-accent-pink">WORKED</span> WITH</span>
                <span className="subtitle">WE COLLABORATE WITH COMPANIES AND BRANDS WHO CARE ABOUT THOUGHTFUL DIGITAL PRESENCE AND THE GROWTH OF XR DEVELOPMENT IN INDIA. EACH EVENT IS SHAPED AND BUILD WITH THE SUPPORT OF SUCH BRANDS.</span>
            </div>
            <div className="brand-content border-b pb-40 border-[#666666]">
                <div className="brand-content-head-col">
                    <span className="brand-content-head">The goal is always the same: <span className="text-white">
                        events that communicate clearly with the audience and leaves a lasting impression.</span></span>
                </div>

                <div className={`brand-list-area${hoveredId ? ' has-hover' : ''}`}>

                    <div className="brand-list-photo" ref={photoRef}>
                        {hoveredBrand?.photo
                            ? <img src={hoveredBrand.photo} alt={hoveredBrand.name} className="w-full h-full object-cover" />
                            : null
                        }
                    </div>

                    <div className="brand-rows">
                        {BRANDS.map(({ id, name, date }) => (
                            <div
                                key={id}
                                className={`brand-list-content${hoveredId === id ? ' is-hovered' : ''}`}
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
            </div>
        </section>
    )
}

export default Brands
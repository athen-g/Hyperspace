import React from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import { motion } from 'framer-motion'
import arrow from '../assets/icons/north_east.svg'
import { BLOGS } from '../../constants/index'
import Contact from './Contact'
import Footer from './Footer'

const hoverArrowVariants = {
    initial: { x: 0, y: 0 },
    hover: {
        x: [0, 8, 18, -8, 0],
        y: [0, -8, -18, 8, 0],
        opacity: [1, 1, 0, 0, 1],
        transition: {
            duration: 0.25,
            ease: 'easeInOut',
            times: [0, 0.22, 0.45, 0.72, 1]
        }
    }
}

const Blog = () => {
    return (
        <>
            <Header />
            <section id="#blog" className='mt-[67.5px]'>
                <BackgroundLines />
                <div className="ml-[3.472%] w-[93.056%] max-lg:ml-4 max-lg:w-[calc(100%-2rem)] relative z-10">
                    <div className="flex items-end justify-between p-30 pb-0">
                        <div className="title">
                            <p className="text-accent-pink">FROM</p>
                            OUR TEAM
                        </div>
                        <span className="uppercase font-mono text-[13px] font-normal tracking-[0.02em] leading-[1] max-w-[250px] text-left text-white">OUR EXPERIENCE. EVERY DECISION. EVERY THOUGHT. NOW EXPLAINED.</span>
                    </div>
                    <div className="blog-home-grid mt-8 border-light-grey border border-b-0">
                        {BLOGS.map(({ id, tag, date, title, route }) => (
                            <motion.div
                                key={id}
                                className="blog-card"
                                initial="initial"
                                whileHover="hover"
                                onClick={() => {
                                    window.history.pushState({}, '', route)
                                    window.dispatchEvent(new PopStateEvent('popstate'))
                                }}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex flex-col gap-1">
                                        <span className="blog-title">{tag}</span>
                                        <span className="blog-date">{date}</span>
                                    </div>
                                    <div className="icon-circle overflow-hidden shrink-0">
                                        <motion.img
                                            src={arrow}
                                            alt="arrow"
                                            variants={hoverArrowVariants}
                                            className="w-3 h-3"
                                        />
                                    </div>
                                </div>
                                <span className="blog-desc">{title}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
            <Contact />
            <Footer />
        </>
    )
}

export default Blog
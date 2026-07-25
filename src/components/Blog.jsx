import React from 'react'
import Header from './Header'
import BackgroundLines from './ui/BackgroundLines'
import { motion } from 'framer-motion'
import arrow from '../assets/icons/north_east.svg'
import { BLOGS } from '../../constants/index'
import Contact from './Contact'
import Footer from './Footer'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

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
    const navigate = useNavigate();
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <>
            <Header />
            <section id="#blog" className={`relative z-10 ${isMobile768 ? 'mt-[110px]' : 'mt-[67.5px]'}`}>
                <BackgroundLines />
                <div className={`relative z-10 ${isMobile768 ? 'w-[93.056%] mx-auto' : 'ml-[3.472%] w-[93.056%]'}`}>
                    <div className={`flex ${isMobile768 ? 'flex-col items-start gap-4 p-4 pb-0' : 'items-end justify-between p-30 pb-0'}`}>
                        <div className="title">
                            <p className="text-accent-pink">FROM</p>
                            OUR TEAM
                        </div>
                        <span className={`uppercase font-mono text-[13px] font-normal tracking-[0.02em] leading-[1.3] text-left text-white ${
                            isMobile768 ? 'max-w-full text-white/80' : 'max-w-[250px]'
                        }`}>
                            OUR EXPERIENCE. EVERY DECISION. EVERY THOUGHT. NOW EXPLAINED.
                        </span>
                    </div>

                    <div className={`mt-8 border-light-grey border border-b-0 ${
                        isMobile768 ? 'flex flex-col w-full' : 'blog-home-grid'
                    }`}>
                        {BLOGS.map(({ id, tag, date, title, route, slug }) => (
                            <motion.div
                                key={id}
                                className={`blog-card ${isMobile768 ? '!h-auto min-h-[220px] !px-5 !py-6 border-b border-light-grey' : ''}`}
                                initial="initial"
                                whileHover="hover"
                                onClick={() => {
                                    navigate(`/blogs/${slug}`);
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
                                <span className={`blog-desc ${isMobile768 ? '!text-[20px] !mt-6' : ''}`}>{title}</span>
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
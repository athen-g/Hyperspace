import React from 'react'
import Button from './Button'
import logo from '../assets/icons/logo.svg'
import arrow from '../assets/icons/north_east.svg'
import { motion, useAnimationControls } from 'framer-motion'
import { BLOGS_HOME } from '../../constants/index'
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

const BlogHomeCard = ({ id, title, date, desc, route, slug }) => {
    const arrowControls = useAnimationControls()
    const navigate = useNavigate();
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <div
            className={`blog-home-card cursor-pointer`}
            onMouseEnter={() => arrowControls.start('hover')}
            onMouseLeave={() => arrowControls.set('initial')}
            onClick={() => {
                navigate(`/blogs/${slug}`);
            }}
        >
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="blog-title">{title}</span>
                    <span className="blog-date">{date}</span>
                </div>
                <div className="icon-circle overflow-hidden">
                    <motion.img
                        src={arrow}
                        alt="arrow"
                        variants={hoverArrowVariants}
                        initial="initial"
                        animate={arrowControls}
                        className="w-4 h-4"
                    />
                </div>
            </div>
            <span className={`blog-desc ${id === 2 ? 'leading-[1]' : ''}`}>{desc}</span>
        </div>
    )
}

const Blog_Home = () => {
    const navigate = useNavigate();
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <section id="#blog_home" className={isMobile768 ? 'mt-[120px] mb-0' : 'mt-13 mb-0'}>
            <div className={isMobile768 ? 'w-full' : 'ml-[3.472%] w-[93.056%] max-lg:ml-4 max-lg:w-[calc(100%-2rem)]'}>
                <div className={`title mb-12 ${isMobile768 ? '!ml-[3.472%] !mr-[3.472%] !text-[42px] text-center flex flex-col items-center justify-center' : ''}`}>
                    <p><span className="text-accent-pink">STORIES</span> BEHIND</p>
                    <span>THE WORK</span>
                </div>

                <Button
                    className={isMobile768 ? '!relative !left-[3.472%] !w-[93.056%] mt-6' : '!relative !left-[76.11%] !w-[23.9%] mt-6'}
                    label="READ MORE BLOGS"
                    onClick={() => {
                        navigate(`/blogs`);
                    }}
                />

                <div className={`blog-home-container relative mt-20 pb-50 border-b border-[#666666] ${isMobile768 ? '!mt-10 !ml-[3.472%] !w-[93.056%]' : ''}`}>
                    <div className="blog-home-grid">
                        <div className={`blog-home-card`}>
                            <div className="blog-home-content-head">
                                <img src={logo} alt="Logo" className="w-10 h-10" />
                                <span className="blog-home-content-title">
                                    <span className="text-accent-pink">TEAM</span>
                                    <span>HYPERSPACE</span>
                                </span>
                            </div>
                            <div className="text-white/60 font-mono text-[13px] font-medium tracking-[0px] leading-[1.3em]">
                                WE WRITE TO UNPACK THE THINKING BEHIND OUR EVENTS - <span className="text-white">THE CHOICES, THE REASONING, THE DISCUSSIONS AND THE QUIET DISCUSSIONS THAT SHAPE HOW A EVENT FEELS AND PERFORMS.</span>
                            </div>
                        </div>

                        {BLOGS_HOME.map((blog) => (
                            <BlogHomeCard key={blog.id} {...blog} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Blog_Home
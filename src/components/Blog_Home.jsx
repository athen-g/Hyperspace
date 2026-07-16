import React from 'react'
import Button from './Button'
import logo from '../assets/icons/logo.svg'
import arrow from '../assets/icons/north_east.svg'
import { motion, useAnimationControls } from 'framer-motion'
import { BLOGS_HOME } from '../../constants/index'

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

const BlogHomeCard = ({ id, title, date, desc, route }) => {
    const arrowControls = useAnimationControls()

    return (
        <div
            className="blog-home-card cursor-pointer"
            onMouseEnter={() => arrowControls.start('hover')}
            onMouseLeave={() => arrowControls.set('initial')}
            onClick={() => {
                window.history.pushState({}, '', route)
                window.dispatchEvent(new PopStateEvent('popstate'))
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
                        className="w-3 h-3"
                    />
                </div>
            </div>
            <span className={`blog-desc ${id === 2 ? 'leading-[1]' : ''}`}>{desc}</span>
        </div>
    )
}

const Blog_Home = () => {
    return (
        <section id="#blog_home" className='mt-13 mb-0'>
            <div className="ml-[3.472%] w-[93.056%] max-lg:ml-4 max-lg:w-[calc(100%-2rem)]">
                <div className="title mb-12">
                    <p><span className="text-accent-pink">STORIES</span> BEHIND</p>
                    <span>THE WORK</span>
                </div>
                <Button
                    className="!relative !left-[76.11%] !w-[23.9%] mt-6"
                    label="READ MORE BLOGS"
                    onClick={() => {
                        window.history.pushState({}, '', '/blog');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                />
                <div className="blog-home-container relative mt-20 pb-50 border-b border-[#666666]">
                    <div className="blog-home-grid">
                        <div className="blog-home-card">
                        <div className="blog-home-content-head">
                            <img src={logo} alt="Logo" className='w-10 h-10' />
                            <span className="blog-home-content-title"><span className='text-accent-pink'>TEAM</span><span>HYPERSPACE</span></span>
                        </div>
                        <div className="text-white/60 font-mono text-[13px] font-medium tracking-[0px] leading-[1.3em] ">
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
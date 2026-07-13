import React from 'react'
import { BackgroundPathsDemo } from './ui/BackgroundPaths'
import face from '../assets/photos/about-lest1.png';
import butterfly from '../assets/photos/about-right1.png';
import { ScrollRevealText } from './ui/ScrollRevealText';

const About = () => {
    return (
        <section id="about">
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
            <div className="about-section">
                <span className="about-title">ABOUT </span><span className='text-white text-[96px] tracking-[1px] font-extrabold'>US</span>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-accent-pink font-host font-bold text-[40px] ">WHAT IS AN SIG?</span>
                        <ScrollRevealText
                            className="about-text-content"
                            text="An sig is a special interest group consisting of talents who are eager to learn about specific topics. these groups are responsible for conducting events, spreading knowledge and awareness about those topics."
                        />
                    </div>
                    <img src={face} alt="Face" className='w-120 z-10 mr-10 mb-16 ' />
                </div>
                <div className="flex flex-row-reverse gap-45">
                    <div>
                        <span className="text-accent-pink font-host font-bold text-[40px] ">WHAT IS HYPERSPACE?</span>
                        <ScrollRevealText
                            className="about-text-content"
                            text="Hyperspace SIG is an XR Special Interest Group(SIG) based in MESWCOE in Pune, India. It consists of talents who are enthusiastic and passionate about Artificial Reality (AR), Virtual Reality (VR), Mixed Reality (MR) and Extended Reality (XR)."
                        />
                    </div>
                    <img src={butterfly} alt="Butterfly" className='w-120 z-10 ml-16 mb-20' />
                </div>

            </div>

        </section>
    )
}

export default About
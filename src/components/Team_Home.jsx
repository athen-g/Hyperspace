import React from 'react'
import Button from './Button'
import combined from '../assets/images/team-images/combined.jpeg'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

const Team_Home = () => {
    const navigate = useNavigate();
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    return (
        <section id="team_hero" className={isMobile768 ? 'mt-[120px] mb-0 px-0' : 'm-26 mb-0 pt-0 p-27'}>
            <div>
                <div className={`title ${isMobile768 ? '!ml-0 !mr-0 !w-full !text-[55px] text-center flex flex-col items-center justify-center leading-[0.9]' : ''}`}>
                    <div className="text-accent-pink">MEET</div>
                    OUR TEAM
                </div>
                <Button
                    className={isMobile768 ? '!relative !left-[3.472%] !w-[93.056%] mt-6' : ''}
                    label="KNOW MORE"
                    onClick={() => {
                        navigate(`/team`);
                    }}
                />
            </div>
            <div className={`flex items-center justify-center ${isMobile768 ? 'mt-12 w-[93.056%] mx-auto px-4' : 'mt-50'}`}>
                <img
                    src={combined}
                    alt='Team Photo'
                    className={`relative z-10 ${
                        isMobile768
                            ? 'w-full h-auto max-h-[400px] object-contain rounded-2xl mx-auto block'
                            : 'h-200 object-contain rounded-4xl m-8 mt-0'
                    }`}
                />
            </div>
            <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[105px]" />
        </section>
    )
}

export default Team_Home
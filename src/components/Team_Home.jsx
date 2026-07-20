import React from 'react'
import Button from './Button'
import combined from '../assets/images/team-images/combined.jpeg'
import { useNavigate } from 'react-router-dom'

const Team_Home = () => {

    const navigate = useNavigate();

    return (
        <section id="team_hero" className='m-26 mb-0 pt-0 p-27'>
            <div>
                <div className="title">
                    <div className="text-accent-pink">MEET</div>
                    OUR TEAM
                </div>
                <Button
                    label="KNOW MORE"
                    onClick={() => {
                        navigate(`/team`);
                    }}
                />
            </div>
            <div className='w-[1500px] h-250 mt-50 flex items-center justify-center'>
                <img src={combined} alt='Team Photo' className='w-full h-full relative z-10 m-8 mt-0' />
            </div>
            <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[105px]" />
        </section>
    )
}

export default Team_Home
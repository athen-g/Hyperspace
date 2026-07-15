import React from 'react'
import Button from './Button'
import demo from '../assets/photos/activate-immersion.png'

const Team_Home = () => {
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
                        window.history.pushState({}, '', '/team');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                />
            </div>
            <div className='w-[100vh] h-auto mt-50 flex items-center justify-center'>
                <img src={demo} alt='Team Photo' className='w-full h-auto relative z-10 m-auto' />
            </div>
            <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[105px]" />
        </section>
    )
}

export default Team_Home
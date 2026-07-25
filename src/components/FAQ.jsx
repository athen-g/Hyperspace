import { FAQ_C } from '../../constants/index'
import plusIcon from '../assets/icons/plus.svg'
import crossIcon from '../assets/icons/cross.svg'
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion'
import { useMediaQuery } from 'react-responsive'

const FAQ = () => {
    const [openId, setOpenId] = useState(null);
    const isMobile768 = useMediaQuery({ query: '(max-width: 768px)' });

    const handleToggle = (id) => {
        setOpenId((currentOpenId) => (currentOpenId === id ? null : id));
    };


    return (
        <section id="FAQ" className={isMobile768 ? 'mt-13 mb-13 ml-[3.472%] w-[93.056%]' : 'mt-13 mb-13 ml-[25.694%] w-[48.612%]'} >
            <div className={isMobile768 ? 'flex items-center justify-center mt-20 mb-12' : 'flex items-center justify-center mt-40 mb-20'}>
                <div className={`title text-center ${isMobile768 ? '!ml-0 !mr-0 !w-full !text-[50px] leading-[0.9] flex flex-col items-center justify-center' : 'text-[80px]'}`}>
                    <p className="text-accent-pink">FREQUENTLY</p>
                    <p>ASKED QUESTIONS</p>
                </div>
            </div>
            <div className="flex flex-col gap-0 border border-[#666] relative z-10 w-full">
                {FAQ_C.map(({ id, question, answer }) => {
                    const isOpened = openId === id;

                    return (
                        <motion.button
                            type="button"
                            key={id}
                            layout
                            animate={{ height: isOpened ? 'auto' : (isMobile768 ? 'auto' : 80) }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            onClick={() => handleToggle(id)}
                            aria-expanded={isOpened}
                            className={`faq-card !flex !flex-col !items-stretch overflow-hidden w-full text-left px-6 py-5 cursor-pointer relative z-10 bg-[#0e0e0e] ${
                                isOpened ? '!justify-start' : '!justify-center min-h-[80px]'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-6 relative z-10 w-full my-auto">
                                <span
                                    className={`faq-question transition-colors duration-300 ${isOpened ? 'text-[#ababab]' : 'text-white'}`}
                                >
                                    {question}
                                </span>
                                <img
                                    src={isOpened ? crossIcon : plusIcon}
                                    alt={isOpened ? 'Cross' : 'Plus'}
                                    className='w-[18px] h-[18px] shrink-0'
                                />
                            </div>

                            <AnimatePresence initial={false} mode="wait">
                                {isOpened && (
                                    <motion.div
                                        key="answer"
                                        initial={{ opacity: 0, height: 0, y: -6 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -6 }}
                                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden relative z-10"
                                    >
                                        <span className="faq-answer block mt-4 text-white uppercase relative z-10">
                                            {answer}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    )
                })}
            </div>
            <div className="absolute left-[3.472%] w-[93.056%] h-[0.5px] bg-[#666666] mt-[50px]" />
        </section>
    )
}

export default FAQ
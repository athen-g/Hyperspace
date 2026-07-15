import React from 'react'
import { motion } from 'framer-motion'
import rightArrowIcon from '../assets/photos/rightArrow.svg'

interface ButtonProps {
  label: string
  onClick: () => void
  className?: string
}

const Button: React.FC<ButtonProps> = ({ label, onClick, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      initial="initial"
      whileHover="hover"
      className={`button !border-l-[2px] !border-l-white cursor-pointer relative overflow-hidden ${className}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="relative overflow-hidden h-[24px] flex items-center pointer-events-none">
        <div className="relative flex flex-col">
          <motion.span
            variants={{
              initial: { y: 0 },
              hover: { y: -24 }
            }}
            transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-mono text-[16px] font-bold tracking-[0.05em] uppercase text-white block leading-[24px]"
          >
            {label}
          </motion.span>
          <motion.span
            variants={{
              initial: { y: 0 },
              hover: { y: -24 }
            }}
            transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            className="font-mono text-[16px] font-bold tracking-[0.05em] uppercase text-white absolute top-[24px] left-0 block leading-[24px]"
          >
            {label}
          </motion.span>
        </div>
      </div>

      <div className="relative overflow-hidden w-10 h-6 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full flex">
          <motion.img
            src={rightArrowIcon}
            alt="arrow"
            variants={{
              initial: { x: 0 },
              hover: { x: 40 }
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-10 h-6 absolute left-0"
          />
          <motion.img
            src={rightArrowIcon}
            alt="arrow duplicate"
            variants={{
              initial: { x: -40 },
              hover: { x: 0 }
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-10 h-6 absolute left-0"
          />
        </div>
      </div>
    </motion.button>
  )
}

export default Button

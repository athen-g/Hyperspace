import React from 'react'
import { motion } from 'framer-motion'
import { useDevicePerformance } from '../hooks/useDevicePerformance'
import { fadeUp, fadeUpMobile } from '../lib/motionVariants'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
  const { shouldSimplify } = useDevicePerformance()

  const variant = shouldSimplify ? fadeUpMobile : fadeUp

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      variants={variant}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useDevicePerformance } from '../../hooks/useDevicePerformance'

const TEXT_LETTERS = ["H", "Y", "P", "E", "R", "S", "P", "A", "C", "E"];

export default function PageTransition({ children }) {
  const location = useLocation()
  const { shouldSimplify } = useDevicePerformance()
  const isHomePage = location.pathname === "/" || location.pathname === "/home"

  // Lightweight letter animations using simple translate/opacity
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: shouldSimplify ? 0.02 : 0.035,
        delayChildren: 0.05,
      }
    }
  }

  const letterVariants = {
    initial: { y: 15, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: shouldSimplify ? 0.25 : 0.35,
        ease: 'easeOut',
      }
    }
  }

  return (
    <div className="relative w-full min-h-screen">
      <AnimatePresence mode="wait" initial={false}>
        {/* Splash Loader on Home Page load */}
        {isHomePage && (
          <motion.div
            key="home-splash"
            initial={{ opacity: 1 }}
            animate={{
              opacity: 0,
              transition: {
                duration: shouldSimplify ? 0.3 : 0.45,
                delay: shouldSimplify ? 0.6 : 0.85,
                ease: 'easeInOut',
              }
            }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center bg-[#0a0a0e]"
            aria-hidden="true"
          >
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="flex items-center justify-center gap-[0.08em] overflow-hidden py-2"
            >
              {TEXT_LETTERS.map((letter, i) => (
                <motion.span
                  key={i}
                  variants={letterVariants}
                  className="inline-block font-mono font-bold text-white text-xl sm:text-3xl md:text-5xl tracking-wide select-none"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldSimplify ? 0.15 : 0.2 }}
          style={{ width: '100%', minHeight: '100vh' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

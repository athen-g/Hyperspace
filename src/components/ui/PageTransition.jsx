import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useDevicePerformance } from '../../hooks/useDevicePerformance'

export default function PageTransition({ children }) {
  const location = useLocation()
  const { shouldSimplify } = useDevicePerformance()

  return (
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
  )
}

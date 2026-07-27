import type { Variants } from 'framer-motion'

// Full desktop variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// Mobile / low-tier variants — same motion, smaller distance and shorter duration,
// kept intentionally cheap (opacity + one transform only)
export const fadeUpMobile: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export const fadeInMobile: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const staggerContainerMobile: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

export const slideInLeftMobile: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// Helper: pick the lightweight variant on mobile/low-tier devices, full variant otherwise.
// Both variants always animate — this only changes how much, never whether.
export function selectVariant(
  base: Variants,
  mobile: Variants,
  shouldSimplify: boolean
): Variants {
  return shouldSimplify ? mobile : base
}

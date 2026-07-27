import { useEffect, useState } from 'react'

type PerformanceTier = 'high' | 'medium' | 'low'

interface DevicePerformance {
  tier: PerformanceTier
  isMobile: boolean
  prefersReducedMotion: boolean
  shouldSimplify: boolean   // true = use the lightweight variant, but still animate
}

function detectTier(): PerformanceTier {
  if (typeof navigator === 'undefined') return 'high'
  const cores = navigator.hardwareConcurrency ?? 2
  const memory = (navigator as any).deviceMemory ?? 4

  if (cores <= 2 || memory <= 2) return 'low'
  if (cores <= 4 || memory <= 4) return 'medium'
  return 'high'
}

export function useDevicePerformance(): DevicePerformance {
  const [perf, setPerf] = useState<DevicePerformance>(() => {
    if (typeof window === 'undefined') {
      return {
        tier: 'high',
        isMobile: false,
        prefersReducedMotion: false,
        shouldSimplify: false,
      }
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const tier = detectTier()

    return {
      tier,
      isMobile,
      prefersReducedMotion,
      // Note: reduced motion still gets a (near-instant, opacity-only) animation,
      // not nothing — see motionVariants.ts. isMobile/low-tier get the lightweight variant.
      shouldSimplify: isMobile || tier !== 'high',
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setPerf(p => ({ ...p, prefersReducedMotion: mq.matches }))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return perf
}

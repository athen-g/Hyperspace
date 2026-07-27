import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Prevent GSAP from trying to "catch up" after tab switch
// This causes a burst of animation on mobile when switching tabs
gsap.ticker.lagSmoothing(0)

// Prevent address bar show/hide on mobile from triggering ScrollTrigger refresh
ScrollTrigger.config({
  ignoreMobileResize: true,
  limitCallbacks: true,
})

// Global matchMedia instance — import and use this everywhere
export const mm = gsap.matchMedia()

// Breakpoint constants matching Tailwind config
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
}

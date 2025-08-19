import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

const useSmoothScroll = (options = {}) => {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Default Lenis options optimized for Tenebris OS
    const defaultOptions = {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
      wrapper: window,
      content: document.documentElement,
      wheelEventsTarget: window,
      eventsTarget: window,
      normalizeWheel: true,
      ...options
    }

    // Initialize Lenis
    lenisRef.current = new Lenis(defaultOptions)

    // Animation frame loop
    function raf(time) {
      lenisRef.current?.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  // Scroll to specific element or position
  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options
      })
    }
  }

  // Scroll to top
  const scrollToTop = (options = {}) => {
    scrollTo(0, options)
  }

  // Start/stop smooth scrolling
  const start = () => lenisRef.current?.start()
  const stop = () => lenisRef.current?.stop()

  // Get current scroll position
  const getScroll = () => lenisRef.current?.scroll || 0

  // Check if scrolling is in progress
  const isScrolling = () => lenisRef.current?.isScrolling || false

  return {
    lenis: lenisRef.current,
    scrollTo,
    scrollToTop,
    start,
    stop,
    getScroll,
    isScrolling
  }
}

export default useSmoothScroll

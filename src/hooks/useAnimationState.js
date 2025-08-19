import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Global animation state management hook
 * Prevents double animations during component mounting and route transitions
 */

// Global animation registry to track all animated components
const globalAnimationRegistry = new Map();
let globalAnimationId = 0;

/**
 * Hook to manage animation state and prevent double animations
 * @param {Object} options - Configuration options
 * @param {boolean} options.disabled - Disable all animations
 * @param {number} options.delay - Base delay for animations
 * @param {string} options.key - Unique key for this animation instance
 * @returns {Object} Animation state and helper functions
 */
export const useAnimationState = (options = {}) => {
  const {
    disabled = false,
    delay = 0,
    key = null,
  } = options;

  const componentId = useRef(key || `anim_${++globalAnimationId}`);
  const mountedRef = useRef(false);
  const animationStateRef = useRef({
    hasAnimated: false,
    isAnimating: false,
    shouldAnimate: true,
  });
  const [isReady, setIsReady] = useState(false);

  // Component lifecycle management
  useEffect(() => {
    mountedRef.current = true;
    globalAnimationRegistry.set(componentId.current, animationStateRef.current);

    // Small delay to prevent flash during initial render
    const readyTimer = setTimeout(() => {
      if (mountedRef.current && !disabled) {
        setIsReady(true);
      }
    }, 16); // One frame delay

    return () => {
      mountedRef.current = false;
      globalAnimationRegistry.delete(componentId.current);
      clearTimeout(readyTimer);

      // Reset animation state on unmount
      animationStateRef.current = {
        hasAnimated: false,
        isAnimating: false,
        shouldAnimate: true,
      };
    };
  }, [disabled]);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handler = (e) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  /**
   * Get animation props that respect the current state
   * @param {Object} animationProps - Base animation properties
   * @param {Object} options - Additional options
   * @returns {Object} Optimized animation props
   */
  const getAnimationProps = useCallback((animationProps = {}, animationOptions = {}) => {
    const {
      skipInitial = false,
      forceAnimation = false,
      duration = 0.2,
    } = animationOptions;

    const state = animationStateRef.current;

    // If disabled or user prefers reduced motion, return static props
    if (disabled || prefersReducedMotion.current) {
      return {
        initial: animationProps.animate || { opacity: 1 },
        animate: animationProps.animate || { opacity: 1 },
        transition: { duration: 0 },
      };
    }

    // If component is not ready, don't animate
    if (!isReady && !forceAnimation) {
      return {
        initial: animationProps.animate || { opacity: 1 },
        animate: animationProps.animate || { opacity: 1 },
        transition: { duration: 0 },
      };
    }

    // If already animating, return end state immediately
    if (state.isAnimating && !forceAnimation) {
      return {
        initial: animationProps.animate || { opacity: 1 },
        animate: animationProps.animate || { opacity: 1 },
        transition: { duration: 0 },
      };
    }

    // If this is a repeat animation and we don't want initial, skip it
    if (state.hasAnimated && skipInitial) {
      return {
        initial: animationProps.animate || { opacity: 1 },
        animate: animationProps.animate || { opacity: 1 },
        transition: { duration: 0.1 },
      };
    }

    // Mark as animating
    if (!state.hasAnimated || forceAnimation) {
      state.hasAnimated = true;
      state.isAnimating = true;

      // Reset animating state after animation completes
      setTimeout(() => {
        if (mountedRef.current) {
          state.isAnimating = false;
        }
      }, (duration * 1000) + 50); // Add small buffer
    }

    // Return full animation props with optimized settings
    return {
      ...animationProps,
      transition: {
        duration,
        ease: 'easeOut',
        delay: delay / 1000,
        ...animationProps.transition,
      },
    };
  }, [disabled, isReady, delay]);

  /**
   * Reset animation state (useful for re-triggering animations)
   */
  const resetAnimationState = useCallback(() => {
    animationStateRef.current = {
      hasAnimated: false,
      isAnimating: false,
      shouldAnimate: true,
    };
  }, []);

  /**
   * Check if animations should be disabled globally
   */
  const shouldDisableAnimations = useCallback(() => {
    return disabled || prefersReducedMotion.current || !isReady;
  }, [disabled, isReady]);

  /**
   * Get optimized motion variants for common patterns
   */
  const getMotionVariants = useCallback((type = 'fadeInUp') => {
    const variants = {
      fadeInUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      },
      fadeInDown: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
      },
      fadeInLeft: {
        initial: { opacity: 0, x: -10 },
        animate: { opacity: 1, x: 0 },
      },
      fadeInRight: {
        initial: { opacity: 0, x: 10 },
        animate: { opacity: 1, x: 0 },
      },
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
      },
      slideInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      },
    };

    return getAnimationProps(variants[type] || variants.fadeIn);
  }, [getAnimationProps]);

  /**
   * Get stagger container props for animating lists
   */
  const getStaggerProps = useCallback((staggerDelay = 0.05) => {
    return getAnimationProps({
      animate: { transition: { staggerChildren: staggerDelay } }
    });
  }, [getAnimationProps]);

  return {
    // State
    isReady,
    isAnimating: animationStateRef.current.isAnimating,
    hasAnimated: animationStateRef.current.hasAnimated,
    shouldDisableAnimations: shouldDisableAnimations(),

    // Functions
    getAnimationProps,
    getMotionVariants,
    getStaggerProps,
    resetAnimationState,

    // Shortcuts for common patterns
    fadeInUp: getMotionVariants('fadeInUp'),
    fadeInDown: getMotionVariants('fadeInDown'),
    fadeInLeft: getMotionVariants('fadeInLeft'),
    fadeInRight: getMotionVariants('fadeInRight'),
    fadeIn: getMotionVariants('fadeIn'),
    scaleIn: getMotionVariants('scaleIn'),
    slideInUp: getMotionVariants('slideInUp'),
  };
};

/**
 * Global animation state management
 */
export const useGlobalAnimationState = () => {
  const [globalState, setGlobalState] = useState({
    isAnimating: false,
    animationCount: 0,
  });

  const setGlobalAnimating = useCallback((isAnimating) => {
    setGlobalState(prev => ({
      ...prev,
      isAnimating,
      animationCount: isAnimating ? prev.animationCount + 1 : Math.max(0, prev.animationCount - 1),
    }));
  }, []);

  const resetGlobalAnimations = useCallback(() => {
    // Reset all registered animations
    globalAnimationRegistry.forEach(state => {
      state.hasAnimated = false;
      state.isAnimating = false;
      state.shouldAnimate = true;
    });

    setGlobalState({
      isAnimating: false,
      animationCount: 0,
    });
  }, []);

  return {
    globalState,
    setGlobalAnimating,
    resetGlobalAnimations,
    activeAnimations: globalAnimationRegistry.size,
  };
};

/**
 * Hook for page transitions with animation management
 */
export const usePageTransition = (locationKey) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => {
    setIsTransitioning(true);

    // Clear existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Reset transition state after a short delay
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 200);

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [locationKey]);

  return {
    isTransitioning,
    transitionProps: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15, ease: 'easeOut' },
    },
  };
};

export default useAnimationState;

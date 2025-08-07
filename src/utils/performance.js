// Performance Optimization Utilities for TenebrisOS
// Provides various performance enhancement tools and helpers

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ==================== DEBOUNCING & THROTTLING ====================

/**
 * Debounce function that delays execution until after wait milliseconds
 * have elapsed since the last time it was invoked
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function that limits execution to once per specified time period
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * React hook for debounced values
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * React hook for throttled callbacks
 */
export const useThrottle = (callback, delay) => {
  const throttledCallback = useRef(throttle(callback, delay));

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay);
  }, [callback, delay]);

  return useCallback((...args) => {
    return throttledCallback.current(...args);
  }, []);
};

// ==================== MEMOIZATION UTILITIES ====================

/**
 * Deep memoization for complex objects
 */
export const useMemoDeep = (factory, deps) => {
  const prevDepsRef = useRef();
  const memoizedValueRef = useRef();

  const depsChanged =
    !prevDepsRef.current ||
    deps.some((dep, index) => !Object.is(dep, prevDepsRef.current[index]));

  if (depsChanged) {
    memoizedValueRef.current = factory();
    prevDepsRef.current = deps;
  }

  return memoizedValueRef.current;
};

/**
 * Memoize expensive calculations with cache limit
 */
export const createMemoizedFunction = (fn, maxCacheSize = 100) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);

    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
};

// ==================== ANIMATION PERFORMANCE ====================

/**
 * Request animation frame wrapper for smooth animations
 */
export const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback(
    (time) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    },
    [callback],
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
};

/**
 * Optimized animation configurations for Framer Motion
 */
export const optimizedMotionConfig = {
  // Reduced motion for better performance
  reduced: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15, ease: "easeOut" },
  },

  // Standard motion with performance optimizations
  standard: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: {
      duration: 0.2,
      ease: "easeOut",
      // Use transform instead of layout changes
      layout: false,
    },
  },

  // GPU-accelerated animations only
  gpu: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: {
      duration: 0.2,
      ease: "easeOut",
      // Force GPU acceleration
      willChange: "transform, opacity",
    },
  },
};

/**
 * Check if user prefers reduced motion
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
};

// ==================== DOM PERFORMANCE ====================

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [hasIntersected, options]);

  return [targetRef, isIntersecting, hasIntersected];
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
    ...item,
    index: startIndex + index,
    offsetY: (startIndex + index) * itemHeight,
  }));

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    scrollTop,
  };
};

// ==================== MEMORY MANAGEMENT ====================

/**
 * Cleanup manager for preventing memory leaks
 */
export class CleanupManager {
  constructor() {
    this.cleanupTasks = new Set();
  }

  add(cleanupFn) {
    this.cleanupTasks.add(cleanupFn);
    return () => this.cleanupTasks.delete(cleanupFn);
  }

  cleanup() {
    this.cleanupTasks.forEach((task) => {
      try {
        task();
      } catch (error) {
        console.warn("Cleanup task failed:", error);
      }
    });
    this.cleanupTasks.clear();
  }
}

/**
 * Hook for automatic cleanup management
 */
export const useCleanup = () => {
  const managerRef = useRef(new CleanupManager());

  useEffect(() => {
    return () => {
      managerRef.current.cleanup();
    };
  }, []);

  return managerRef.current;
};

// ==================== STORAGE OPTIMIZATION ====================

/**
 * Optimized localStorage with compression and caching
 */
export class OptimizedStorage {
  constructor(prefix = "tenebris_") {
    this.prefix = prefix;
    this.cache = new Map();
    this.compressionThreshold = 1000; // Compress strings longer than 1000 chars
  }

  set(key, value, options = {}) {
    const fullKey = this.prefix + key;
    let serialized = JSON.stringify(value);

    try {
      // Simple compression for large strings
      if (
        serialized.length > this.compressionThreshold &&
        options.compress !== false
      ) {
        serialized = this.compress(serialized);
      }

      localStorage.setItem(fullKey, serialized);

      // Cache the value for faster access
      if (options.cache !== false) {
        this.cache.set(key, value);
      }

      return true;
    } catch (error) {
      console.warn(`Failed to store ${key}:`, error);
      return false;
    }
  }

  get(key, defaultValue = null) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const fullKey = this.prefix + key;

    try {
      const stored = localStorage.getItem(fullKey);
      if (stored === null) return defaultValue;

      let parsed = stored;

      // Check if it's compressed
      if (stored.startsWith("COMPRESSED:")) {
        parsed = this.decompress(stored);
      }

      const value = JSON.parse(parsed);
      this.cache.set(key, value);
      return value;
    } catch (error) {
      console.warn(`Failed to retrieve ${key}:`, error);
      return defaultValue;
    }
  }

  remove(key) {
    const fullKey = this.prefix + key;
    localStorage.removeItem(fullKey);
    this.cache.delete(key);
  }

  clear() {
    // Clear only items with our prefix
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
    this.cache.clear();
  }

  compress(str) {
    // Simple compression using repeated character replacement
    return (
      "COMPRESSED:" +
      str.replace(/(.)\1{2,}/g, (match, char) => {
        return `${char}${match.length}`;
      })
    );
  }

  decompress(str) {
    return str.replace("COMPRESSED:", "").replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }
}

// Global optimized storage instance
export const optimizedStorage = new OptimizedStorage();

// ==================== BUNDLE OPTIMIZATION ====================

/**
 * Dynamic import wrapper with error handling
 */
export const safeImport = async (importFn, fallback = null) => {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.warn("Dynamic import failed:", error);
    return fallback;
  }
};

/**
 * Lazy component wrapper with loading state
 */
export const createLazyComponent = (importFn, LoadingComponent = null) => {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return { default: module.default || module };
    } catch (error) {
      console.error("Failed to load component:", error);
      // Return a fallback component
      return {
        default: () =>
          LoadingComponent ||
          React.createElement("div", {}, "Failed to load component"),
      };
    }
  });
};

// ==================== PERFORMANCE MONITORING ====================

/**
 * Performance metrics collector
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
  }

  startMeasure(name) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name) {
    performance.mark(`${name}-end`);
    try {
      performance.measure(name, `${name}-start`, `${name}-end`);
      const measure = performance.getEntriesByName(name, "measure")[0];
      this.metrics.set(name, measure.duration);
      return measure.duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return 0;
    }
  }

  getMetric(name) {
    return this.metrics.get(name) || 0;
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  observeLCP() {
    if (!this.observers.has("lcp")) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set("lcp", lastEntry.startTime);
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.set("lcp", observer);
    }
  }

  observeFID() {
    if (!this.observers.has("fid")) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.set("fid", entry.processingStart - entry.startTime);
        });
      });
      observer.observe({ entryTypes: ["first-input"] });
      this.observers.set("fid", observer);
    }
  }

  observeCLS() {
    if (!this.observers.has("cls")) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.set("cls", clsValue);
          }
        });
      });
      observer.observe({ entryTypes: ["layout-shift"] });
      this.observers.set("cls", observer);
    }
  }

  startCoreWebVitalsObservation() {
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }

  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();

// ==================== REACT PERFORMANCE HOOKS ====================

/**
 * Hook for component render tracking
 */
export const useRenderTracker = (componentName) => {
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `${componentName} rendered ${renderCountRef.current} times. Time since last render: ${timeSinceLastRender.toFixed(2)}ms`,
      );
    }

    lastRenderTime.current = now;
  });

  return renderCountRef.current;
};

/**
 * Hook for detecting unnecessary re-renders
 */
export const useWhyDidYouUpdate = (name, props) => {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (
        Object.keys(changedProps).length &&
        process.env.NODE_ENV === "development"
      ) {
        console.log("[Why-Did-You-Update]", name, changedProps);
      }
    }

    previousProps.current = props;
  });
};

// ==================== INITIALIZATION ====================

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = () => {
  // Start core web vitals observation
  performanceMonitor.startCoreWebVitalsObservation();

  // Add performance observer for long tasks
  if ("PerformanceObserver" in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 75) {
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
    } catch (error) {
      console.warn("Could not observe long tasks:", error);
    }
  }

  // Setup passive event listeners for better scroll performance
  if ("passive" in document.createElement("div")) {
    document.addEventListener("touchstart", () => {}, { passive: true });
    document.addEventListener("touchmove", () => {}, { passive: true });
    document.addEventListener("wheel", () => {}, { passive: true });
  }

  console.log("🚀 Performance optimizations initialized");
};

// ==================== EXPORT ALL ====================

export default {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  useMemoDeep,
  createMemoizedFunction,
  useAnimationFrame,
  optimizedMotionConfig,
  useReducedMotion,
  useIntersectionObserver,
  useVirtualScroll,
  CleanupManager,
  useCleanup,
  OptimizedStorage,
  optimizedStorage,
  safeImport,
  createLazyComponent,
  PerformanceMonitor,
  performanceMonitor,
  useRenderTracker,
  useWhyDidYouUpdate,
  initializePerformanceOptimizations,
};

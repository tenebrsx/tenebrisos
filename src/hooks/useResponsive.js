import { useState, useEffect } from 'react';

// Breakpoint definitions
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [breakpoint, setBreakpoint] = useState('mobile');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Determine current breakpoint
      if (width < BREAKPOINTS.mobile) {
        setBreakpoint('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
      } else if (width < BREAKPOINTS.desktop) {
        setBreakpoint('desktop');
      } else {
        setBreakpoint('large');
      }
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Utility functions
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop' || breakpoint === 'large';
  const isSmallScreen = breakpoint === 'mobile' || breakpoint === 'tablet';
  const isLargeScreen = breakpoint === 'desktop' || breakpoint === 'large';

  // Media query style utilities
  const getResponsiveValue = (values) => {
    if (typeof values === 'object') {
      return values[breakpoint] || values.mobile || values.default;
    }
    return values;
  };

  // Grid column utilities
  const getGridCols = (mobileCols = 1, tabletCols = 2, desktopCols = 3) => {
    if (isMobile) return mobileCols;
    if (isTablet) return tabletCols;
    return desktopCols;
  };

  // Spacing utilities
  const getSpacing = (mobileSpacing = 4, tabletSpacing = 6, desktopSpacing = 8) => {
    if (isMobile) return mobileSpacing;
    if (isTablet) return tabletSpacing;
    return desktopSpacing;
  };

  // Font size utilities
  const getFontSize = (mobileFontSize = 'sm', tabletFontSize = 'base', desktopFontSize = 'lg') => {
    if (isMobile) return mobileFontSize;
    if (isTablet) return tabletFontSize;
    return desktopFontSize;
  };

  return {
    // Raw values
    windowSize,
    breakpoint,

    // Boolean checks
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    isLargeScreen,

    // Utilities
    getResponsiveValue,
    getGridCols,
    getSpacing,
    getFontSize,

    // Breakpoint values for custom logic
    breakpoints: BREAKPOINTS,
  };
};

// Hook for detecting touch devices
export const useTouch = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return { isTouch };
};

// Combined hook for comprehensive responsive behavior
export const useDevice = () => {
  const responsive = useResponsive();
  const { isTouch } = useTouch();

  return {
    ...responsive,
    isTouch,
    isMobileDevice: responsive.isMobile && isTouch,
    isTabletDevice: responsive.isTablet && isTouch,
    isDesktopDevice: responsive.isDesktop && !isTouch,
  };
};

export default useResponsive;

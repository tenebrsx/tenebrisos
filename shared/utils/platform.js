/**
 * Platform Detection and Cross-Platform Utilities
 * Provides platform-specific implementations for web and mobile
 */

// Platform detection
export const isWeb = typeof window !== 'undefined' && window.document;
export const isMobile = !isWeb;
export const isIOS = isMobile && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = isMobile && typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent);

// Platform-specific constants
export const Platform = {
  OS: isWeb ? 'web' : (isIOS ? 'ios' : 'android'),
  isWeb,
  isMobile,
  isIOS,
  isAndroid,
  select: (platformMap) => {
    if (isWeb && platformMap.web) return platformMap.web;
    if (isIOS && platformMap.ios) return platformMap.ios;
    if (isAndroid && platformMap.android) return platformMap.android;
    if (isMobile && platformMap.mobile) return platformMap.mobile;
    return platformMap.default;
  }
};

// Cross-platform component mapping
export const PlatformComponents = {
  // Text components
  Text: Platform.select({
    web: 'div',
    mobile: 'Text',
    default: 'div'
  }),

  // Touchable components
  Touchable: Platform.select({
    web: 'button',
    mobile: 'TouchableOpacity',
    default: 'button'
  }),

  // View components
  View: Platform.select({
    web: 'div',
    mobile: 'View',
    default: 'div'
  }),

  // ScrollView
  ScrollView: Platform.select({
    web: 'div',
    mobile: 'ScrollView',
    default: 'div'
  }),

  // Image
  Image: Platform.select({
    web: 'img',
    mobile: 'Image',
    default: 'img'
  })
};

// Cross-platform styling
export const createPlatformStyles = (webStyles, mobileStyles = {}) => {
  return Platform.select({
    web: webStyles,
    mobile: mobileStyles,
    default: webStyles
  });
};

// Navigation utilities
export const NavigationUtils = {
  // Different navigation libraries
  getNavigationLibrary: () => Platform.select({
    web: () => import('react-router-dom'),
    mobile: () => import('@react-navigation/native'),
    default: () => import('react-router-dom')
  }),

  // Platform-specific navigation props
  getNavigationProps: (props) => Platform.select({
    web: {
      to: props.path,
      className: props.className
    },
    mobile: {
      onPress: () => props.navigation?.navigate(props.screen),
      style: props.style
    },
    default: {
      to: props.path,
      className: props.className
    }
  })
};

// Storage utilities
export const StorageUtils = {
  async getItem(key) {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.getItem(key);
    }
  },

  async setItem(key, value) {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.setItem(key, value);
    }
  },

  async removeItem(key) {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      return AsyncStorage.default.removeItem(key);
    }
  }
};

// Animation utilities
export const AnimationUtils = {
  // Cross-platform animation library
  getAnimationLibrary: () => Platform.select({
    web: () => import('framer-motion'),
    mobile: () => import('react-native-reanimated'),
    default: () => import('framer-motion')
  }),

  // Common animation presets
  fadeIn: Platform.select({
    web: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    },
    mobile: {
      entering: 'FadeIn',
      duration: 300
    },
    default: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    }
  }),

  slideUp: Platform.select({
    web: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.4, ease: "easeOut" }
    },
    mobile: {
      entering: 'SlideInUp',
      duration: 400
    },
    default: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      transition: { duration: 0.4, ease: "easeOut" }
    }
  })
};

// Input utilities
export const InputUtils = {
  // Cross-platform input handling
  getInputProps: (props) => Platform.select({
    web: {
      type: props.type || 'text',
      value: props.value,
      onChange: (e) => props.onChangeText?.(e.target.value),
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      placeholder: props.placeholder,
      className: props.className
    },
    mobile: {
      value: props.value,
      onChangeText: props.onChangeText,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      placeholder: props.placeholder,
      style: props.style
    },
    default: {
      type: props.type || 'text',
      value: props.value,
      onChange: (e) => props.onChangeText?.(e.target.value),
      onFocus: props.onFocus,
      onBlur: props.onBlur,
      placeholder: props.placeholder,
      className: props.className
    }
  })
};

// Dimensions utilities
export const DimensionsUtils = {
  async getScreenDimensions() {
    if (isWeb) {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    } else {
      const { Dimensions } = await import('react-native');
      return Dimensions.get('window');
    }
  },

  // Responsive breakpoints
  getBreakpoint: (width) => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
};

// Safe area utilities
export const SafeAreaUtils = {
  // Cross-platform safe area handling
  getSafeAreaInsets: () => Platform.select({
    web: { top: 0, bottom: 0, left: 0, right: 0 },
    mobile: async () => {
      try {
        const { useSafeAreaInsets } = await import('react-native-safe-area-context');
        return useSafeAreaInsets();
      } catch {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
    },
    default: { top: 0, bottom: 0, left: 0, right: 0 }
  })
};

// Haptic feedback utilities
export const HapticUtils = {
  async impact(style = 'medium') {
    if (isMobile) {
      try {
        const Haptics = await import('expo-haptics');
        await Haptics.impactAsync(
          style === 'light' ? Haptics.ImpactFeedbackStyle.Light :
          style === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy :
          Haptics.ImpactFeedbackStyle.Medium
        );
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  },

  async selection() {
    if (isMobile) {
      try {
        const Haptics = await import('expo-haptics');
        await Haptics.selectionAsync();
      } catch (error) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  }
};

// Theme utilities for cross-platform styling
export const ThemeUtils = {
  // Convert web CSS to React Native styles
  convertWebToMobileStyles: (webStyles) => {
    if (isWeb) return webStyles;

    // Basic conversion mapping
    const converted = {};
    Object.keys(webStyles).forEach(key => {
      // Convert kebab-case to camelCase
      const mobileKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      converted[mobileKey] = webStyles[key];
    });

    return converted;
  },

  // Platform-specific color handling
  getColor: (color, platform = Platform.OS) => {
    if (typeof color === 'string') return color;
    if (typeof color === 'object') {
      return color[platform] || color.default || color.web;
    }
    return color;
  }
};

// Export utilities
export const ExportUtils = {
  // Conditional exports based on platform
  requirePlatformModule: (webModule, mobileModule) => {
    return Platform.select({
      web: webModule,
      mobile: mobileModule,
      default: webModule
    });
  }
};

// Development utilities
export const DevUtils = {
  log: (...args) => {
    if (__DEV__ || process.env.NODE_ENV === 'development') {
      console.log(`[${Platform.OS}]`, ...args);
    }
  },

  warn: (...args) => {
    if (__DEV__ || process.env.NODE_ENV === 'development') {
      console.warn(`[${Platform.OS}]`, ...args);
    }
  },

  // Platform-specific debugging
  debugInfo: () => ({
    platform: Platform.OS,
    isWeb,
    isMobile,
    isIOS,
    isAndroid,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
  })
};

// Main platform utilities export
export default {
  Platform,
  PlatformComponents,
  createPlatformStyles,
  NavigationUtils,
  StorageUtils,
  AnimationUtils,
  InputUtils,
  DimensionsUtils,
  SafeAreaUtils,
  HapticUtils,
  ThemeUtils,
  ExportUtils,
  DevUtils
};

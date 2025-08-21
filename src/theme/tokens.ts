export const COLORS = {
  black: "#0B0B0C",
  offWhite: "#F5F6F7",
  neonYellow: "#FFE44D",
  neonPink: "#FF4D9A",
  neonGreen: "#28E16D",
  neonMint: "#4EF2C4",
  cobalt: "#3A7BFF",
  gray: {
    400: "#A1A1AA",
    700: "#2A2A2E",
    800: "#1A1A1D",
  },
} as const;

export const RADIUS = {
  xl: 28,
  lg: 22,
  md: 16,
  sm: 12,
} as const;

export const SPACING = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  "4xl": 32,
} as const;

export const FONTS = {
  display: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 700,
    fontSize: 28,
    lineHeight: 1.2,
  },
  title: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 600,
    fontSize: 20,
    lineHeight: 1.3,
  },
  body: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.4,
  },
  mono: {
    fontFamily:
      'SF Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontWeight: 400,
    fontSize: 13,
    lineHeight: 1.4,
  },
} as const;

export const MOTION = {
  durations: {
    fast: 150,
    normal: 220,
  },
  easing: {
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
  },
  springs: {
    gentle: {
      damping: 20,
      stiffness: 300,
    },
    bouncy: {
      damping: 15,
      stiffness: 400,
    },
  },
} as const;

export const SHADOWS = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
} as const;

// Typography scale for consistent text sizes
export const TEXT_SIZES = {
  xs: 12,
  sm: 14,
  base: 15,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
} as const;

// Z-index scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Animation presets
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: MOTION.durations.normal / 1000 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: MOTION.durations.normal / 1000,
      ease: MOTION.easing.easeOut,
    },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: MOTION.durations.fast / 1000,
      ease: MOTION.easing.spring,
    },
  },
  press: {
    scale: 0.98,
    transition: { duration: MOTION.durations.fast / 1000 },
  },
} as const;

export type ColorToken = keyof typeof COLORS | `${keyof typeof COLORS.gray}`;
export type RadiusToken = keyof typeof RADIUS;
export type SpacingToken = keyof typeof SPACING;
export type FontToken = keyof typeof FONTS;

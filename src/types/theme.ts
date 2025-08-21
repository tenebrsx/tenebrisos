import {
  COLORS,
  RADIUS,
  SPACING,
  FONTS,
  MOTION,
  TEXT_SIZES,
  Z_INDEX,
} from "../theme/tokens";

// Extract token types from the actual token objects
export type ColorKey = keyof typeof COLORS;
export type GrayColorKey = keyof typeof COLORS.gray;
export type AllColorKeys = ColorKey | `gray.${GrayColorKey}`;

export type RadiusKey = keyof typeof RADIUS;
export type SpacingKey = keyof typeof SPACING;
export type FontKey = keyof typeof FONTS;
export type TextSizeKey = keyof typeof TEXT_SIZES;
export type ZIndexKey = keyof typeof Z_INDEX;

// Theme mode
export type ColorMode = "light" | "dark";

// Neon colors specifically
export type NeonColor =
  | "neonYellow"
  | "neonPink"
  | "neonGreen"
  | "neonMint"
  | "cobalt";

// Component size variants
export type ComponentSize = "sm" | "md" | "lg";
export type ExtendedComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

// Animation and motion types
export interface SpringConfig {
  damping: number;
  stiffness: number;
}

export interface MotionTransition {
  duration?: number;
  delay?: number;
  ease?: string;
  spring?: SpringConfig;
}

export interface MotionVariant {
  opacity?: number;
  scale?: number;
  x?: number;
  y?: number;
  rotate?: number;
  transition?: MotionTransition;
}

export interface MotionVariants {
  initial?: MotionVariant;
  animate?: MotionVariant;
  exit?: MotionVariant;
  hover?: MotionVariant;
  tap?: MotionVariant;
  focus?: MotionVariant;
}

// Responsive value types
export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

// Theme context interface
export interface ThemeContextType {
  // Design tokens
  colors: typeof COLORS;
  radius: typeof RADIUS;
  spacing: typeof SPACING;
  fonts: typeof FONTS;
  motion: typeof MOTION;
  textSizes: typeof TEXT_SIZES;
  zIndex: typeof Z_INDEX;

  // Theme state
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;

  // Utilities
  isDark: boolean;
  isLight: boolean;
}

// Component base props that accept theme tokens
export interface ThemedStyleProps {
  color?: NeonColor;
  bg?: AllColorKeys;
  p?: SpacingKey;
  px?: SpacingKey;
  py?: SpacingKey;
  pt?: SpacingKey;
  pr?: SpacingKey;
  pb?: SpacingKey;
  pl?: SpacingKey;
  m?: SpacingKey;
  mx?: SpacingKey;
  my?: SpacingKey;
  mt?: SpacingKey;
  mr?: SpacingKey;
  mb?: SpacingKey;
  ml?: SpacingKey;
  borderRadius?: RadiusKey;
  fontSize?: TextSizeKey;
}

// Brutalist component specific types
export interface BrutalistCardProps {
  color?: NeonColor;
  header?: string;
  meta?: string;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
}

export interface BrutalistButtonProps {
  variant?: "primary" | "secondary" | "neutral";
  color?: NeonColor;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
  "aria-label"?: string;
}

export interface StatTileProps {
  label: string;
  value: string | number;
  sparklineData?: number[];
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: NeonColor;
  size?: ComponentSize;
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
  "aria-label"?: string;
}

export interface PillTabOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
}

export interface PillTabProps {
  options: PillTabOption[];
  value: string;
  onChange: (value: string) => void;
  color?: NeonColor;
  size?: ComponentSize;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

export interface NavBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  badge?: number;
}

export interface NavBarProps {
  items: NavBarItem[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface NoticeBarProps {
  children?: React.ReactNode;
  notificationCount?: number;
  message?: string;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

// Chart component types
export interface SparklineProps {
  data: number[];
  color?: NeonColor;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: NeonColor;
  size?: ComponentSize;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

// Motion component types
export interface BaseMotionProps {
  children?: React.ReactNode;
  style?: React.CSSProperties | any;
  className?: string;
  animate?: MotionVariant;
  initial?: MotionVariant;
  exit?: MotionVariant;
  transition?: MotionTransition;
  variants?: MotionVariants;
  whileHover?: MotionVariant;
  whileTap?: MotionVariant;
  whileFocus?: MotionVariant;
  layout?: boolean;
  layoutId?: string;
}

export interface MViewProps extends BaseMotionProps {
  as?: keyof JSX.IntrinsicElements;
}

export interface MPressableProps extends BaseMotionProps {
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// Utility types for theme functions
export interface ThemeUtilsType {
  withOpacity: (color: string, opacity: number) => string;
  darken: (color: string, amount: number) => string;
  lighten: (color: string, amount: number) => string;
}

// Platform detection types
export type Platform = "web" | "ios" | "android" | "native";

// Accessibility types
export interface AccessibilityProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-hidden"?: boolean;
  role?: string;
  tabIndex?: number;
}

// Breakpoint types for responsive design
export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export interface BreakpointConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

// Style system types
export interface StyleSystemProps extends ThemedStyleProps, AccessibilityProps {
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: ZIndexKey | number;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  opacity?: number;
  cursor?: "pointer" | "default" | "text" | "grab" | "not-allowed";
}

// Export all types as a namespace for easier imports
export * from "./theme";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { COLORS, RADIUS, SPACING, FONTS, MOTION, ANIMATIONS, TEXT_SIZES, Z_INDEX } from './tokens';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  // Design tokens
  colors: typeof COLORS;
  radius: typeof RADIUS;
  spacing: typeof SPACING;
  fonts: typeof FONTS;
  motion: typeof MOTION;
  animations: typeof ANIMATIONS;
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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialColorMode?: ColorMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  initialColorMode = 'dark',
  storageKey = 'tenebris-color-mode'
}: ThemeProviderProps) {
  const [colorMode, setColorModeState] = useState<ColorMode>(initialColorMode);

  // Load saved color mode on mount
  useEffect(() => {
    try {
      // Try to load from localStorage (web) or AsyncStorage (React Native)
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(storageKey);
        if (saved === 'light' || saved === 'dark') {
          setColorModeState(saved);
        }
      }
    } catch (error) {
      // Fallback to initial mode if storage access fails
      console.warn('Failed to load color mode from storage:', error);
    }
  }, [storageKey]);

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);

    try {
      // Save to localStorage (web) or AsyncStorage (React Native)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(storageKey, mode);
      }
    } catch (error) {
      console.warn('Failed to save color mode to storage:', error);
    }
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  const contextValue: ThemeContextType = {
    // Design tokens
    colors: COLORS,
    radius: RADIUS,
    spacing: SPACING,
    fonts: FONTS,
    motion: MOTION,
    animations: ANIMATIONS,
    textSizes: TEXT_SIZES,
    zIndex: Z_INDEX,

    // Theme state
    colorMode,
    toggleColorMode,
    setColorMode,

    // Utilities
    isDark: colorMode === 'dark',
    isLight: colorMode === 'light',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Utility hook for getting responsive values
export function useResponsiveValue<T>(values: {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T {
  // This would need to be implemented with proper responsive logic
  // For now, return base value
  return values.base as T;
}

// Utility functions for working with theme tokens
export const themeUtils = {
  // Get color with opacity
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  // Darken color by percentage
  darken: (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },

  // Lighten color by percentage
  lighten: (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
};

// Export types for TypeScript support
export type { ColorMode, ThemeContextType };

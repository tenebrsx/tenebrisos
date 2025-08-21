import React, { useEffect, useState } from 'react';
import { useTheme } from '../theme';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  color?: 'neonYellow' | 'neonPink' | 'neonGreen' | 'cobalt';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = 'neonGreen',
  size = 'md',
  showValue = false,
  animated = true,
  className = '',
  style,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const { colors, radius, spacing, fonts, motion } = useTheme();
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value);

  // Animate fill on mount
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, animated]);

  const sizeStyles = {
    sm: {
      height: 6,
      fontSize: 11,
    },
    md: {
      height: 8,
      fontSize: 12,
    },
    lg: {
      height: 12,
      fontSize: 14,
    },
  };

  const percentage = Math.min(Math.max((animatedValue / max) * 100, 0), 100);

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style,
  };

  const trackStyles: React.CSSProperties = {
    width: '100%',
    height: sizeStyles[size].height,
    backgroundColor: colors.gray[800],
    borderRadius: radius.xl,
    border: `1px solid ${colors.gray[700]}`,
    overflow: 'hidden',
    position: 'relative',
  };

  const fillStyles: React.CSSProperties = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: colors[color],
    borderRadius: radius.xl,
    transition: animated
      ? `width ${motion.durations.normal * 2}ms ${motion.easing.easeOut}`
      : 'none',
    position: 'relative',
  };

  const valueStyles: React.CSSProperties = {
    ...fonts.mono,
    fontSize: sizeStyles[size].fontSize,
    color: colors.offWhite,
    marginTop: spacing.xs,
    textAlign: 'right' as const,
    fontVariantNumeric: 'tabular-nums',
  };

  // Add a subtle glow effect for the fill
  const glowStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.xl,
    background: `linear-gradient(90deg, transparent 0%, ${colors[color]}40 50%, ${colors[color]}60 100%)`,
    opacity: percentage > 0 ? 1 : 0,
    transition: animated
      ? `opacity ${motion.durations.fast}ms ${motion.easing.easeOut}`
      : 'none',
  };

  return (
    <div
      style={containerStyles}
      className={`progress-bar progress-bar--${size} ${className}`}
    >
      <div
        style={trackStyles}
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={animatedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel || `Progress: ${Math.round(percentage)}%`}
      >
        <div style={fillStyles} className="progress-bar__fill">
          <div style={glowStyles} className="progress-bar__glow" />
        </div>
      </div>

      {showValue && (
        <div style={valueStyles} className="progress-bar__value">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

export default ProgressBar;

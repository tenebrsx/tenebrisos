import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface StatTileProps {
  label: string;
  value: string | number;
  sparklineData?: number[];
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'neonYellow' | 'neonPink' | 'neonGreen' | 'cobalt';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
  'aria-label'?: string;
}

export function StatTile({
  label,
  value,
  sparklineData,
  icon,
  trend,
  color = 'neonYellow',
  size = 'md',
  className = '',
  style,
  onPress,
  'aria-label': ariaLabel,
}: StatTileProps) {
  const { colors, radius, spacing, fonts, motion } = useTheme();

  const sizeStyles = {
    sm: {
      padding: spacing.lg,
      minHeight: 80,
      minWidth: 100,
    },
    md: {
      padding: spacing.xl,
      minHeight: 96,
      minWidth: 120,
    },
    lg: {
      padding: spacing['2xl'],
      minHeight: 112,
      minWidth: 140,
    },
  };

  const containerStyles: React.CSSProperties = {
    ...sizeStyles[size],
    backgroundColor: colors.gray[800],
    borderRadius: radius.lg,
    border: `2px solid ${colors.gray[700]}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
    cursor: onPress ? 'pointer' : 'default',
    transition: `all ${motion.durations.fast}ms ${motion.easing.easeOut}`,
    ...style,
  };

  const labelStyles: React.CSSProperties = {
    ...fonts.mono,
    color: colors.gray[400],
    fontSize: 11,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
    lineHeight: 1.2,
  };

  const valueStyles: React.CSSProperties = {
    ...fonts.title,
    color: colors.offWhite,
    fontSize: size === 'lg' ? 24 : size === 'md' ? 20 : 18,
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.1,
  };

  const iconContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    color: colors[color],
    opacity: 0.8,
  };

  const trendStyles: React.CSSProperties = {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor:
      trend === 'up' ? colors.neonGreen :
      trend === 'down' ? colors.neonPink :
      colors.gray[400],
  };

  const sparklineContainerStyles: React.CSSProperties = {
    marginTop: spacing.sm,
    height: 20,
    width: '100%',
    opacity: 0.7,
  };

  const generateSparklinePath = (data: number[]): string => {
    if (!data || data.length < 2) return '';

    const width = 60;
    const height = 20;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(0.98)';
      target.style.borderColor = colors[color];
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';
      target.style.borderColor = colors.gray[700];
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';
      target.style.borderColor = colors.gray[700];
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onPress && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onPress();
    }
  };

  return (
    <div
      style={containerStyles}
      className={`stat-tile stat-tile--${size} ${className}`}
      onClick={handlePress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      aria-label={ariaLabel || `${label}: ${value}`}
    >
      {/* Icon */}
      {icon && (
        <div style={iconContainerStyles} className="stat-tile__icon">
          {icon}
        </div>
      )}

      {/* Trend indicator */}
      {trend && !icon && (
        <div style={trendStyles} className="stat-tile__trend" />
      )}

      {/* Content */}
      <div className="stat-tile__content">
        <p style={labelStyles} className="stat-tile__label">
          {label}
        </p>
        <p style={valueStyles} className="stat-tile__value">
          {value}
        </p>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div style={sparklineContainerStyles} className="stat-tile__sparkline">
          <svg width="60" height="20" viewBox="0 0 60 20">
            <path
              d={generateSparklinePath(sparklineData)}
              fill="none"
              stroke={colors[color]}
              strokeWidth="1"
              opacity="0.8"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default StatTile;

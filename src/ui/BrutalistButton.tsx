import React, { ReactNode } from 'react';
import { useTheme, themeUtils } from '../theme';

export interface BrutalistButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  color?: 'neonYellow' | 'neonPink' | 'neonGreen' | 'cobalt';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
  'aria-label'?: string;
}

export function BrutalistButton({
  children,
  variant = 'primary',
  color = 'neonYellow',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  style,
  onPress,
  'aria-label': ariaLabel,
  ...props
}: BrutalistButtonProps) {
  const { colors, radius, spacing, fonts, motion } = useTheme();

  const sizeStyles = {
    sm: {
      padding: `${spacing.md}px ${spacing.xl}px`,
      fontSize: 14,
      minHeight: 44,
    },
    md: {
      padding: `${spacing.lg}px ${spacing['2xl']}px`,
      fontSize: 15,
      minHeight: 48,
    },
    lg: {
      padding: `${spacing.xl}px ${spacing['3xl']}px`,
      fontSize: 16,
      minHeight: 52,
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors[color],
          color: colors.black,
          border: 'none',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: colors[color],
          border: `2px solid ${colors[color]}`,
        };
      case 'neutral':
        return {
          backgroundColor: colors.gray[700],
          color: colors.offWhite,
          border: 'none',
        };
      default:
        return {
          backgroundColor: colors[color],
          color: colors.black,
          border: 'none',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    ...sizeStyles[size],
    ...getVariantStyles(),
    borderRadius: radius.md,
    fontFamily: fonts.body.fontFamily,
    fontWeight: fonts.body.fontWeight,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    outline: 'none',
    transition: `all ${motion.durations.fast}ms ${motion.easing.easeOut}`,
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!disabled && !loading) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(0.98)';

      // Add 6% darken overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.backgroundColor = themeUtils.withOpacity(colors.black, 0.06);
      overlay.style.pointerEvents = 'none';
      overlay.className = 'button-press-overlay';
      target.appendChild(overlay);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!disabled && !loading) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';

      // Remove overlay
      const overlay = target.querySelector('.button-press-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!disabled && !loading) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';

      // Remove overlay
      const overlay = target.querySelector('.button-press-overlay');
      if (overlay) {
        overlay.remove();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.boxShadow = `0 0 0 2px ${themeUtils.withOpacity(colors[color], 0.3)}`;
  };

  const handleBlur = (e: React.FocusEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.boxShadow = 'none';
  };

  return (
    <button
      style={baseStyles}
      className={`brutalist-button brutalist-button--${variant} brutalist-button--${size} ${className}`}
      onClick={handlePress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: 16,
            height: 16,
            border: `2px solid ${variant === 'primary' ? colors.black : colors[color]}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}

      {!loading && leftIcon && (
        <span className="brutalist-button__left-icon">
          {leftIcon}
        </span>
      )}

      {!loading && (
        <span className="brutalist-button__content">
          {children}
        </span>
      )}

      {!loading && rightIcon && (
        <span className="brutalist-button__right-icon">
          {rightIcon}
        </span>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

export default BrutalistButton;

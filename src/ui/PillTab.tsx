import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme';

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
  color?: 'neonYellow' | 'neonPink' | 'neonGreen' | 'cobalt';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function PillTab({
  options,
  value,
  onChange,
  color = 'neonYellow',
  size = 'md',
  fullWidth = false,
  className = '',
  style,
  'aria-label': ariaLabel,
}: PillTabProps) {
  const { colors, radius, spacing, fonts, motion } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  const sizeStyles = {
    sm: {
      padding: `${spacing.sm}px ${spacing.md}px`,
      fontSize: 13,
      minHeight: 36,
    },
    md: {
      padding: `${spacing.md}px ${spacing.lg}px`,
      fontSize: 14,
      minHeight: 40,
    },
    lg: {
      padding: `${spacing.lg}px ${spacing.xl}px`,
      fontSize: 15,
      minHeight: 44,
    },
  };

  // Update indicator position when active value changes
  useEffect(() => {
    const activeIndex = options.findIndex(option => option.value === value);
    if (activeIndex !== -1 && containerRef.current) {
      const container = containerRef.current;
      const activeButton = container.children[activeIndex] as HTMLElement;

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
          height: buttonRect.height,
          transform: 'translateX(0)',
          transition: `all ${motion.durations.normal}ms ${motion.easing.easeOut}`,
        });
      }
    }
  }, [value, options, motion]);

  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.gray[800],
    borderRadius: radius.xl,
    padding: spacing.xs,
    display: 'inline-flex',
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const buttonStyles: React.CSSProperties = {
    ...sizeStyles[size],
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.lg,
    fontFamily: fonts.body.fontFamily,
    fontWeight: fonts.title.fontWeight,
    color: colors.offWhite,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    transition: `color ${motion.durations.fast}ms ${motion.easing.easeOut}`,
    flex: fullWidth ? 1 : 'none',
    outline: 'none',
  };

  const activeButtonStyles: React.CSSProperties = {
    ...buttonStyles,
    color: colors.black,
  };

  const indicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: spacing.xs,
    backgroundColor: colors[color],
    borderRadius: radius.lg,
    border: `2px solid ${colors[color]}`,
    zIndex: 1,
    pointerEvents: 'none',
    ...indicatorStyle,
  };

  const handleOptionClick = (option: PillTabOption) => {
    if (!option.disabled && option.value !== value) {
      onChange(option.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, option: PillTabOption) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOptionClick(option);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = options.findIndex(opt => opt.value === value);
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      let nextIndex = currentIndex + direction;

      // Wrap around
      if (nextIndex < 0) nextIndex = options.length - 1;
      if (nextIndex >= options.length) nextIndex = 0;

      // Skip disabled options
      while (options[nextIndex]?.disabled && nextIndex !== currentIndex) {
        nextIndex += direction;
        if (nextIndex < 0) nextIndex = options.length - 1;
        if (nextIndex >= options.length) nextIndex = 0;
      }

      if (!options[nextIndex]?.disabled) {
        onChange(options[nextIndex].value);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      style={containerStyles}
      className={`pill-tab ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {/* Active indicator */}
      <div
        style={indicatorStyles}
        className="pill-tab__indicator"
        aria-hidden="true"
      />

      {/* Tab buttons */}
      {options.map((option, index) => {
        const isActive = option.value === value;
        const isDisabled = option.disabled;

        return (
          <button
            key={option.id}
            style={isActive ? activeButtonStyles : buttonStyles}
            className={`pill-tab__option ${isActive ? 'pill-tab__option--active' : ''} ${isDisabled ? 'pill-tab__option--disabled' : ''}`}
            onClick={() => handleOptionClick(option)}
            onKeyDown={(e) => handleKeyDown(e, option)}
            disabled={isDisabled}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            tabIndex={isActive ? 0 : -1}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default PillTab;

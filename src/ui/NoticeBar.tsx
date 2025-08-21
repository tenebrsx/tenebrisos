import React, { ReactNode } from 'react';
import { useTheme } from '../theme';

export interface NoticeBarProps {
  children?: ReactNode;
  notificationCount?: number;
  message?: string;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

export function NoticeBar({
  children,
  notificationCount,
  message = 'Notifications',
  onPress,
  showChevron = true,
  className = '',
  style,
  'aria-label': ariaLabel,
}: NoticeBarProps) {
  const { colors, radius, spacing, fonts, motion } = useTheme();

  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.offWhite,
    borderRadius: radius.xl,
    padding: `${spacing.lg}px ${spacing['2xl']}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: onPress ? 'pointer' : 'default',
    transition: `all ${motion.durations.fast}ms ${motion.easing.easeOut}`,
    border: `1px solid ${colors.gray[400]}`,
    minHeight: 52,
    width: '100%',
    ...style,
  };

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  };

  const textStyles: React.CSSProperties = {
    ...fonts.body,
    color: colors.black,
    margin: 0,
    fontWeight: 500,
  };

  const countStyles: React.CSSProperties = {
    backgroundColor: colors.neonPink,
    color: colors.black,
    borderRadius: radius.sm,
    padding: `${spacing.xs}px ${spacing.md}px`,
    ...fonts.mono,
    fontSize: 12,
    fontWeight: 700,
    minWidth: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const chevronStyles: React.CSSProperties = {
    color: colors.gray[400],
    transition: `transform ${motion.durations.fast}ms ${motion.easing.easeOut}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
      target.style.backgroundColor = colors.gray[400];
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';
      target.style.backgroundColor = colors.offWhite;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (onPress) {
      const target = e.currentTarget as HTMLElement;
      target.style.transform = 'scale(1)';
      target.style.backgroundColor = colors.offWhite;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onPress && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onPress();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (onPress && showChevron) {
      const chevron = e.currentTarget.querySelector('.notice-bar__chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transform = 'translateX(2px)';
      }
    }
  };

  const handleMouseLeaveChevron = (e: React.MouseEvent) => {
    if (onPress && showChevron) {
      const chevron = e.currentTarget.querySelector('.notice-bar__chevron') as HTMLElement;
      if (chevron) {
        chevron.style.transform = 'translateX(0)';
      }
    }
  };

  // ChevronRight SVG icon
  const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"></polyline>
    </svg>
  );

  return (
    <div
      style={containerStyles}
      className={`notice-bar ${className}`}
      onClick={handlePress}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeaveChevron}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      role={onPress ? 'button' : 'status'}
      tabIndex={onPress ? 0 : undefined}
      aria-label={ariaLabel || (notificationCount ? `${notificationCount} ${message}` : message)}
    >
      <div style={contentStyles} className="notice-bar__content">
        {children || (
          <>
            <span style={textStyles}>
              {message}
            </span>
            {notificationCount !== undefined && notificationCount > 0 && (
              <div style={countStyles} className="notice-bar__count">
                {notificationCount > 99 ? '99+' : notificationCount}
              </div>
            )}
          </>
        )}
      </div>

      {showChevron && (
        <div
          style={chevronStyles}
          className="notice-bar__chevron"
          aria-hidden="true"
        >
          <ChevronRight />
        </div>
      )}
    </div>
  );
}

export default NoticeBar;

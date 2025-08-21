import React from 'react';
import { useTheme } from '../theme';

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

export function NavBar({
  items,
  activeValue,
  onChange,
  className = '',
  style,
}: NavBarProps) {
  const { colors, radius, spacing, fonts } = useTheme();

  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.gray[800],
    borderRadius: radius.xl,
    padding: spacing.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'fixed',
    bottom: spacing['2xl'],
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 280,
    maxWidth: 320,
    border: `1px solid ${colors.gray[700]}`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    ...style,
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    padding: spacing.md,
    borderRadius: radius.md,
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 150ms cubic-bezier(0.0, 0.0, 0.2, 1)',
    outline: 'none',
    backgroundColor: 'transparent',
    border: 'none',
  };

  const activeItemStyles: React.CSSProperties = {
    ...itemStyles,
    backgroundColor: colors.gray[700],
  };

  const iconStyles: React.CSSProperties = {
    color: colors.gray[400],
    transition: 'color 150ms ease-out',
  };

  const activeIconStyles: React.CSSProperties = {
    ...iconStyles,
    color: colors.offWhite,
  };

  const labelStyles: React.CSSProperties = {
    ...fonts.mono,
    fontSize: 10,
    color: colors.gray[400],
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'color 150ms ease-out',
  };

  const activeLabelStyles: React.CSSProperties = {
    ...labelStyles,
    color: colors.offWhite,
  };

  const dotStyles: React.CSSProperties = {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: colors.neonGreen,
    opacity: 0,
    transform: 'scale(0)',
    transition: 'all 220ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  };

  const activeDotStyles: React.CSSProperties = {
    ...dotStyles,
    opacity: 1,
    transform: 'scale(1)',
  };

  const badgeStyles: React.CSSProperties = {
    position: 'absolute',
    top: spacing.xs - 2,
    right: spacing.xs - 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.neonPink,
    color: colors.black,
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  };

  const handleItemClick = (item: NavBarItem) => {
    if (item.value !== activeValue) {
      onChange(item.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavBarItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = items.findIndex(i => i.value === activeValue);
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      let nextIndex = currentIndex + direction;

      // Wrap around
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;

      onChange(items[nextIndex].value);
    }
  };

  return (
    <nav
      style={containerStyles}
      className={`nav-bar ${className}`}
      role="tablist"
      aria-label="Main navigation"
    >
      {items.map((item, index) => {
        const isActive = item.value === activeValue;

        return (
          <button
            key={item.id}
            style={isActive ? activeItemStyles : itemStyles}
            className={`nav-bar__item ${isActive ? 'nav-bar__item--active' : ''}`}
            onClick={() => handleItemClick(item)}
            onKeyDown={(e) => handleKeyDown(e, item)}
            role="tab"
            aria-selected={isActive}
            aria-label={item.label}
            tabIndex={isActive ? 0 : -1}
          >
            {/* Icon */}
            <div style={isActive ? activeIconStyles : iconStyles}>
              {item.icon}
            </div>

            {/* Label */}
            <span style={isActive ? activeLabelStyles : labelStyles}>
              {item.label}
            </span>

            {/* Active dot indicator */}
            <div
              style={isActive ? activeDotStyles : dotStyles}
              className="nav-bar__dot"
              aria-hidden="true"
            />

            {/* Badge */}
            {item.badge && item.badge > 0 && (
              <div
                style={badgeStyles}
                className="nav-bar__badge"
                aria-label={`${item.badge} notifications`}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export default NavBar;

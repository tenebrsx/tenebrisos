import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const RetroButton = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  // Retro button variants
  const variants = {
    default: {
      background: 'linear-gradient(180deg, #ffffff 0%, #ece9d8 45%, #d4d0c8 50%, #d4d0c8 100%)',
      border: '2px outset #aca899',
      color: '#000000',
      textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)',
    },
    primary: {
      background: 'linear-gradient(180deg, #4d90fe 0%, #4285f4 45%, #1565c0 50%, #1565c0 100%)',
      border: '2px outset #1976d2',
      color: '#ffffff',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.3)',
    },
    success: {
      background: 'linear-gradient(180deg, #66bb6a 0%, #4caf50 45%, #2e7d32 50%, #2e7d32 100%)',
      border: '2px outset #388e3c',
      color: '#ffffff',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.3)',
    },
    warning: {
      background: 'linear-gradient(180deg, #ffb74d 0%, #ff9800 45%, #e65100 50%, #e65100 100%)',
      border: '2px outset #f57c00',
      color: '#ffffff',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.3)',
    },
    danger: {
      background: 'linear-gradient(180deg, #ef5350 0%, #f44336 45%, #c62828 50%, #c62828 100%)',
      border: '2px outset #d32f2f',
      color: '#ffffff',
      textShadow: '1px 1px 0 rgba(0, 0, 0, 0.3)',
    },
    start: {
      background: 'linear-gradient(90deg, #4caf50 0%, #8bc34a 50%, #cddc39 100%)',
      border: '2px outset #689f38',
      color: '#000000',
      textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)',
      fontWeight: 'bold',
      boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    }
  };

  // Button sizes
  const sizes = {
    sm: {
      padding: '2px 8px',
      fontSize: '11px',
      minHeight: '20px',
    },
    md: {
      padding: '4px 12px',
      fontSize: '12px',
      minHeight: '24px',
    },
    lg: {
      padding: '6px 16px',
      fontSize: '13px',
      minHeight: '28px',
    },
    xl: {
      padding: '8px 20px',
      fontSize: '14px',
      minHeight: '32px',
    }
  };

  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  const baseStyles = {
    fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    borderRadius: '3px',
    boxShadow: '1px 1px 0 #ffffff, 2px 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.1s ease-in-out',
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    opacity: disabled ? 0.6 : 1,
    ...variantStyles,
    ...sizeStyles,
  };

  const hoverStyles = {
    background: variant === 'default'
      ? 'linear-gradient(180deg, #fff2cc 0%, #ffe066 45%, #ffdb4d 50%, #ffdb4d 100%)'
      : variantStyles.background,
    filter: variant !== 'default' ? 'brightness(1.1)' : 'none',
  };

  const activeStyles = {
    borderStyle: 'inset',
    boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.3), inset -1px -1px 0 rgba(255, 255, 255, 0.5)',
    transform: 'translate(1px, 1px)',
  };

  return (
    <motion.button
      style={baseStyles}
      whileHover={!disabled ? hoverStyles : {}}
      whileTap={!disabled ? activeStyles : {}}
      onClick={disabled ? undefined : onClick}
      className={clsx(
        'retro-button',
        `retro-button-${variant}`,
        `retro-button-${size}`,
        {
          'retro-button-disabled': disabled,
        },
        className
      )}
      {...props}
    >
      {Icon && (
        <Icon
          size={size === 'sm' ? 12 : size === 'md' ? 14 : size === 'lg' ? 16 : 18}
          style={{ flexShrink: 0 }}
        />
      )}
      {children}
    </motion.button>
  );
};

// Special Windows XP Start Button
export const RetroStartButton = ({ onClick, children, ...props }) => (
  <RetroButton
    variant="start"
    size="lg"
    onClick={onClick}
    className="retro-start-button"
    {...props}
  >
    <div
      className="start-orb"
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 50%, #990000 100%)',
        border: '1px solid #ffffff',
        boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.3)',
        marginRight: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 'bold',
      }}
    >
      T
    </div>
    {children || 'start'}
  </RetroButton>
);

// Classic Windows XP OK/Cancel buttons
export const RetroOKButton = (props) => (
  <RetroButton variant="primary" {...props}>
    OK
  </RetroButton>
);

export const RetroCancelButton = (props) => (
  <RetroButton variant="default" {...props}>
    Cancel
  </RetroButton>
);

// Mac OS 9 style aqua button
export const RetroAquaButton = ({ children, ...props }) => (
  <RetroButton
    {...props}
    style={{
      background: 'linear-gradient(180deg, #a8d4ff 0%, #7ac3ff 45%, #4aa3df 50%, #2d8ecf 100%)',
      border: '1px solid #1976d2',
      borderRadius: '16px',
      color: '#ffffff',
      textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)',
      fontFamily: 'Lucida Grande, Geneva, Verdana, sans-serif',
      fontSize: '13px',
      padding: '6px 20px',
      minHeight: '32px',
    }}
  >
    {children}
  </RetroButton>
);

export default RetroButton;

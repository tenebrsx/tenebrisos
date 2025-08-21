import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

const MagneticButton = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  magneticStrength,
  onClick,
  disabled = false,
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    outline:
      "border-2 border-dark-border hover:border-accent-blue text-dark-text hover:text-accent-blue",
    minimal: "text-dark-text-secondary hover:text-dark-text hover:bg-white/5",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };

  const baseStyles = clsx(
    "relative inline-flex items-center justify-center",
    "font-medium rounded-lg",
    "transition-all duration-200 ease-out-expo",
    "focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-2 focus:ring-offset-dark-bg",
    "select-none cursor-pointer",
    "transform-gpu", // Optimize for GPU acceleration
    {
      "opacity-50 cursor-not-allowed": disabled,
      "active:scale-95": !disabled,
    },
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  return (
    <motion.button
      className={baseStyles}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.05,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={
        disabled
          ? {}
          : {
              scale: 0.95,
              transition: { duration: 0.1, ease: "easeOut" },
            }
      }
      {...props}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300"
        style={{
          background:
            variant === "primary"
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
        }}
        whileHover={{ opacity: disabled ? 0 : 1 }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        initial={false}
      >
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full scale-0"
          whileTap={{
            scale: disabled ? 0 : [0, 2],
            opacity: [0.5, 0],
            transition: { duration: 0.4, ease: "easeOut" },
          }}
        />
      </motion.div>
    </motion.button>
  );
};

// Additional preset variations for common use cases
export const MagneticIconButton = ({ icon: Icon, tooltip, ...props }) => {
  return (
    <MagneticButton
      variant="ghost"
      size="sm"
      className="p-2 rounded-full"
      title={tooltip}
      {...props}
    >
      {Icon && <Icon size={20} />}
    </MagneticButton>
  );
};

export const MagneticActionButton = ({ icon: Icon, label, ...props }) => {
  return (
    <MagneticButton variant="primary" {...props}>
      {Icon && <Icon size={20} />}
      {label && <span>{label}</span>}
    </MagneticButton>
  );
};

export const MagneticFloatingButton = ({
  icon: Icon,
  position = "bottom-right",
  ...props
}) => {
  const positionStyles = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6",
  };

  return (
    <div className={clsx("z-50", positionStyles[position])}>
      <MagneticButton
        variant="primary"
        size="lg"
        className="rounded-full p-4 shadow-2xl glow-blue"
        {...props}
      >
        {Icon && <Icon size={24} />}
      </MagneticButton>
    </div>
  );
};

export default MagneticButton;

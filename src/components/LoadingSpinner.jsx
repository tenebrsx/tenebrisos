import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const LoadingSpinner = ({
  size = 'md',
  variant = 'default',
  className = '',
  text = '',
  showText = false
}) => {
  // Size configurations
  const sizeConfig = {
    xs: { spinner: 16, text: 'text-xs' },
    sm: { spinner: 24, text: 'text-sm' },
    md: { spinner: 32, text: 'text-base' },
    lg: { spinner: 48, text: 'text-lg' },
    xl: { spinner: 64, text: 'text-xl' }
  }

  const { spinner: spinnerSize, text: textSize } = sizeConfig[size]

  // Animation variants
  const spinnerVariants = {
    default: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }
    },
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    dots: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity
      }
    }
  }

  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <motion.div
            className="flex space-x-1"
            variants={spinnerVariants.dots}
            initial="initial"
            animate="animate"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-accent-blue rounded-full"
                variants={dotVariants}
                animate="animate"
              />
            ))}
          </motion.div>
        )

      case 'pulse':
        return (
          <motion.div
            className="rounded-full bg-gradient-to-r from-accent-blue to-accent-purple"
            style={{ width: spinnerSize, height: spinnerSize }}
            variants={spinnerVariants.pulse}
            animate="pulse"
          />
        )

      case 'orbital':
        return (
          <div className="relative" style={{ width: spinnerSize, height: spinnerSize }}>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-accent-blue/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-2 border-accent-purple/50 border-t-accent-purple"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border border-accent-green/40 border-r-accent-green"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )

      case 'minimal':
        return (
          <motion.div
            className="w-1 h-6 bg-accent-blue rounded-full"
            animate={{
              scaleY: [1, 2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )

      default:
        return (
          <motion.div
            className="rounded-full border-2 border-dark-border border-t-accent-blue"
            style={{ width: spinnerSize, height: spinnerSize }}
            variants={spinnerVariants.default}
            animate="default"
          />
        )
    }
  }

  return (
    <div className={clsx(
      'flex flex-col items-center justify-center space-y-3',
      className
    )}>
      {renderSpinner()}

      {showText && text && (
        <motion.div
          className={clsx(
            'font-medium text-dark-text-secondary',
            textSize
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {text}
        </motion.div>
      )}
    </div>
  )
}

// Preset loading components for common use cases
export const PageLoader = ({ text = "Loading Tenebris OS..." }) => (
  <div className="fixed inset-0 bg-dark-bg flex items-center justify-center z-50">
    <div className="glass rounded-2xl p-8 text-center">
      <LoadingSpinner size="lg" variant="orbital" />
      <motion.div
        className="mt-6 text-lg font-display text-dark-text"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {text}
      </motion.div>
      <motion.div
        className="mt-2 text-sm text-dark-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Initializing systems...
      </motion.div>
    </div>
  </div>
)

export const InlineLoader = ({ text, size = 'sm' }) => (
  <div className="flex items-center space-x-3">
    <LoadingSpinner size={size} variant="dots" />
    {text && (
      <span className="text-dark-text-secondary text-sm">
        {text}
      </span>
    )}
  </div>
)

export const ButtonLoader = ({ size = 'xs' }) => (
  <LoadingSpinner size={size} variant="minimal" />
)

export const CardLoader = ({ text = "Loading..." }) => (
  <div className="card text-center py-8">
    <LoadingSpinner size="md" variant="pulse" />
    <div className="mt-4 text-dark-text-secondary">
      {text}
    </div>
  </div>
)

// Skeleton loading components
export const SkeletonCard = () => (
  <div className="card space-y-4">
    <div className="skeleton h-6 w-3/4 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-5/6 rounded" />
    <div className="skeleton h-8 w-1/3 rounded-lg" />
  </div>
)

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 bg-dark-surface/30 rounded-lg">
        <div className="skeleton-circle w-8 h-8" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    ))}
  </div>
)

export const SkeletonStats = () => (
  <div className="card space-y-4">
    <div className="skeleton h-6 w-1/2 rounded" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
      </div>
    ))}
  </div>
)

export default LoadingSpinner

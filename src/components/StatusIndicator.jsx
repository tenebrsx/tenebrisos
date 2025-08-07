import React from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  Zap,
  Moon
} from 'lucide-react'
import clsx from 'clsx'

const StatusIndicator = ({
  status = 'idle',
  size = 'md',
  showIcon = false,
  showLabel = false,
  label = '',
  pulse = true,
  className = '',
  tooltip = '',
  onClick
}) => {
  // Status configurations
  const statusConfig = {
    active: {
      color: 'bg-accent-green',
      textColor: 'text-accent-green',
      pulseColor: 'bg-accent-green/75',
      icon: Play,
      defaultLabel: 'Active',
      description: 'Currently running'
    },
    paused: {
      color: 'bg-accent-orange',
      textColor: 'text-accent-orange',
      pulseColor: 'bg-accent-orange/75',
      icon: Pause,
      defaultLabel: 'Paused',
      description: 'Temporarily stopped'
    },
    completed: {
      color: 'bg-accent-blue',
      textColor: 'text-accent-blue',
      pulseColor: 'bg-accent-blue/75',
      icon: CheckCircle,
      defaultLabel: 'Completed',
      description: 'Successfully finished'
    },
    cancelled: {
      color: 'bg-accent-red',
      textColor: 'text-accent-red',
      pulseColor: 'bg-accent-red/75',
      icon: XCircle,
      defaultLabel: 'Cancelled',
      description: 'Stopped before completion'
    },
    pending: {
      color: 'bg-dark-text-muted',
      textColor: 'text-dark-text-muted',
      pulseColor: 'bg-dark-text-muted/75',
      icon: Clock,
      defaultLabel: 'Pending',
      description: 'Waiting to start'
    },
    break: {
      color: 'bg-accent-orange',
      textColor: 'text-accent-orange',
      pulseColor: 'bg-accent-orange/75',
      icon: Coffee,
      defaultLabel: 'Break',
      description: 'Taking a break'
    },
    focus: {
      color: 'bg-accent-purple',
      textColor: 'text-accent-purple',
      pulseColor: 'bg-accent-purple/75',
      icon: Zap,
      defaultLabel: 'Focus',
      description: 'Deep work mode'
    },
    idle: {
      color: 'bg-dark-text-muted',
      textColor: 'text-dark-text-muted',
      pulseColor: 'bg-dark-text-muted/75',
      icon: Moon,
      defaultLabel: 'Idle',
      description: 'No active session'
    }
  }

  // Size configurations
  const sizeConfig = {
    xs: {
      dot: 'w-2 h-2',
      icon: 12,
      text: 'text-xs',
      container: 'gap-1'
    },
    sm: {
      dot: 'w-3 h-3',
      icon: 14,
      text: 'text-sm',
      container: 'gap-2'
    },
    md: {
      dot: 'w-4 h-4',
      icon: 16,
      text: 'text-base',
      container: 'gap-2'
    },
    lg: {
      dot: 'w-5 h-5',
      icon: 18,
      text: 'text-lg',
      container: 'gap-3'
    },
    xl: {
      dot: 'w-6 h-6',
      icon: 20,
      text: 'text-xl',
      container: 'gap-3'
    }
  }

  const config = statusConfig[status] || statusConfig.idle
  const sizes = sizeConfig[size]
  const StatusIcon = config.icon
  const displayLabel = label || config.defaultLabel
  const displayTooltip = tooltip || config.description

  // Animation variants
  const pulseVariants = {
    animate: {
      scale: [1, 1.4, 1],
      opacity: [0.75, 0, 0.75],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const dotVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  }

  const containerVariants = {
    initial: { opacity: 0, y: 5 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      className={clsx(
        'flex items-center',
        sizes.container,
        {
          'cursor-pointer hover:opacity-80 transition-opacity': onClick
        },
        className
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      onClick={onClick}
      title={displayTooltip}
    >
      {/* Status Indicator Dot */}
      <div className="relative flex items-center justify-center">
        {/* Pulse Animation */}
        {pulse && (status === 'active' || status === 'focus') && (
          <motion.div
            className={clsx(
              'absolute rounded-full',
              sizes.dot,
              config.pulseColor
            )}
            variants={pulseVariants}
            animate="animate"
          />
        )}

        {/* Main Dot */}
        <motion.div
          className={clsx(
            'relative rounded-full',
            sizes.dot,
            config.color,
            'shadow-sm'
          )}
          variants={dotVariants}
          initial="initial"
          animate="animate"
        />

        {/* Icon Overlay */}
        {showIcon && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <StatusIcon
              size={sizes.icon}
              className="text-white drop-shadow-sm"
            />
          </motion.div>
        )}
      </div>

      {/* Status Label */}
      {showLabel && displayLabel && (
        <motion.span
          className={clsx(
            'font-medium',
            sizes.text,
            config.textColor
          )}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {displayLabel}
        </motion.span>
      )}
    </motion.div>
  )
}

// Preset status indicators for common use cases
export const ActivityStatus = ({ activity, isActive, className }) => (
  <StatusIndicator
    status={isActive ? 'active' : 'idle'}
    size="sm"
    showLabel
    label={isActive ? activity : 'Idle'}
    className={className}
  />
)

export const SessionStatus = ({ session, showTime = false }) => {
  const getStatusFromSession = (session) => {
    if (!session) return 'idle'
    if (session.isActive) return 'active'
    if (session.isPaused) return 'paused'
    if (session.isCompleted) return 'completed'
    return 'pending'
  }

  const status = getStatusFromSession(session)
  const label = showTime && session?.startTime
    ? `${session.activity} - ${session.startTime}`
    : session?.activity || 'No Session'

  return (
    <StatusIndicator
      status={status}
      size="md"
      showLabel
      showIcon
      label={label}
      pulse={status === 'active'}
    />
  )
}

export const ProgressStatus = ({ progress, total, activity }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0
  const status = percentage >= 100 ? 'completed' : percentage > 0 ? 'active' : 'pending'

  return (
    <div className="flex items-center gap-3">
      <StatusIndicator
        status={status}
        size="sm"
        showIcon={percentage >= 100}
        pulse={status === 'active'}
      />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-dark-text">
            {activity}
          </span>
          <span className="text-xs text-dark-text-muted">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="progress-bar h-1">
          <motion.div
            className="progress-fill h-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  )
}

export const StatusBadge = ({ status, size = 'sm', className }) => (
  <div className={clsx(
    'inline-flex items-center gap-2 px-3 py-1 rounded-full',
    'glass border border-white/10',
    className
  )}>
    <StatusIndicator
      status={status}
      size={size}
      pulse={status === 'active' || status === 'focus'}
    />
    <span className="text-sm font-medium capitalize">
      {status}
    </span>
  </div>
)

// Status list for showing multiple statuses
export const StatusList = ({ items, className }) => (
  <div className={clsx('space-y-2', className)}>
    {items.map((item, index) => (
      <motion.div
        key={item.id || index}
        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <StatusIndicator
          status={item.status}
          size="sm"
          showLabel
          label={item.label}
          onClick={item.onClick}
        />
        {item.timestamp && (
          <span className="text-xs text-dark-text-muted">
            {item.timestamp}
          </span>
        )}
      </motion.div>
    ))}
  </div>
)

export default StatusIndicator

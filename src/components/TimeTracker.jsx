import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Clock,
  Timer,
  Target,
  TrendingUp
} from 'lucide-react'
import clsx from 'clsx'
import MagneticButton from './MagneticButton'
import StatusIndicator from './StatusIndicator'
import { formatDuration, formatTime } from '../utils/helpers.js'

const TimeTracker = ({
  activity = 'Focus Session',
  targetDuration = 1500, // 25 minutes in seconds
  onStart,
  onPause,
  onStop,
  onComplete,
  className = '',
  variant = 'default',
  showControls = true,
  autoStart = false,
  persistKey = null
}) => {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [pauseTime, setPauseTime] = useState(0)
  const intervalRef = useRef(null)
  const notificationRef = useRef(null)

  // Load persisted state
  useEffect(() => {
    if (persistKey) {
      const saved = localStorage.getItem(`timeTracker_${persistKey}`)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setTimeElapsed(data.timeElapsed || 0)
          setIsPaused(data.isPaused || false)
          if (data.isRunning && data.startTime) {
            const now = Date.now()
            const elapsed = Math.floor((now - data.startTime + data.pauseTime) / 1000)
            setTimeElapsed(elapsed)
            setIsRunning(true)
            setStartTime(data.startTime)
            setPauseTime(data.pauseTime || 0)
          }
        } catch (error) {
          console.error('Failed to load timer state:', error)
        }
      }
    }
  }, [persistKey])

  // Save state to localStorage
  const saveState = useCallback((state) => {
    if (persistKey) {
      localStorage.setItem(`timeTracker_${persistKey}`, JSON.stringify(state))
    }
  }, [persistKey])

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime + pauseTime) / 1000)
        setTimeElapsed(elapsed)

        // Save state periodically
        saveState({
          isRunning: true,
          isPaused: false,
          timeElapsed: elapsed,
          startTime,
          pauseTime,
          activity
        })

        // Check if target reached
        if (targetDuration && elapsed >= targetDuration) {
          handleComplete()
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, startTime, pauseTime, targetDuration, activity, saveState])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isRunning && timeElapsed === 0) {
      handleStart()
    }
  }, [autoStart])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (notificationRef.current) {
        clearTimeout(notificationRef.current)
      }
    }
  }, [])

  const handleStart = () => {
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    onStart?.(activity, now)

    saveState({
      isRunning: true,
      isPaused: false,
      timeElapsed,
      startTime: now,
      pauseTime,
      activity
    })
  }

  const handlePause = () => {
    if (isRunning) {
      const now = Date.now()
      setPauseTime(prev => prev + (now - startTime))
      setIsPaused(true)
      setIsRunning(false)
      onPause?.(activity, timeElapsed)

      saveState({
        isRunning: false,
        isPaused: true,
        timeElapsed,
        startTime,
        pauseTime: pauseTime + (now - startTime),
        activity
      })
    }
  }

  const handleResume = () => {
    const now = Date.now()
    setStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    onStart?.(activity, now)

    saveState({
      isRunning: true,
      isPaused: false,
      timeElapsed,
      startTime: now,
      pauseTime,
      activity
    })
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    onStop?.(activity, timeElapsed)

    // Clear persisted state
    if (persistKey) {
      localStorage.removeItem(`timeTracker_${persistKey}`)
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeElapsed(0)
    setStartTime(null)
    setPauseTime(0)

    // Clear persisted state
    if (persistKey) {
      localStorage.removeItem(`timeTracker_${persistKey}`)
    }
  }

  const handleComplete = () => {
    setIsRunning(false)
    setIsPaused(false)
    onComplete?.(activity, timeElapsed)

    // Show completion notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${activity} Complete!`, {
        body: `Session completed in ${formatDuration(Math.floor(timeElapsed / 60))}`,
        icon: '/vite.svg'
      })
    }

    // Clear persisted state
    if (persistKey) {
      localStorage.removeItem(`timeTracker_${persistKey}`)
    }
  }

  // Calculate progress
  const progress = targetDuration ? Math.min((timeElapsed / targetDuration) * 100, 100) : 0
  const remainingTime = targetDuration ? Math.max(targetDuration - timeElapsed, 0) : 0
  const isCompleted = targetDuration && timeElapsed >= targetDuration

  // Format display time
  const displayTime = targetDuration && variant === 'countdown' ? remainingTime : timeElapsed
  const minutes = Math.floor(displayTime / 60)
  const seconds = displayTime % 60

  // Get current status
  const getStatus = () => {
    if (isCompleted) return 'completed'
    if (isRunning) return 'active'
    if (isPaused) return 'paused'
    return 'pending'
  }

  const renderTimer = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="flex items-center space-x-2">
            <StatusIndicator
              status={getStatus()}
              size="sm"
              pulse={isRunning}
            />
            <span className="font-mono text-lg text-dark-text">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        )

      case 'compact':
        return (
          <div className="flex items-center justify-between p-3 bg-dark-surface/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <StatusIndicator
                status={getStatus()}
                size="sm"
                pulse={isRunning}
              />
              <div>
                <div className="font-medium text-dark-text">{activity}</div>
                <div className="text-sm text-dark-text-muted">
                  {formatTime(new Date())}
                </div>
              </div>
            </div>
            <div className="font-mono text-xl text-dark-text">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-display text-dark-text">{activity}</h3>
              <StatusIndicator
                status={getStatus()}
                size="md"
                showLabel
                label={getStatus().charAt(0).toUpperCase() + getStatus().slice(1)}
                pulse={isRunning}
                className="justify-center"
              />
            </div>

            <motion.div
              className="text-6xl font-mono font-bold text-gradient-blue"
              key={`${minutes}-${seconds}`}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>

            {targetDuration && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-dark-text-muted">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    className="progress-fill h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                {variant === 'countdown' && (
                  <div className="text-sm text-dark-text-secondary">
                    {formatDuration(Math.floor(remainingTime / 60))} remaining
                  </div>
                )}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <motion.div
      className={clsx('relative', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderTimer()}

      {/* Controls */}
      {showControls && variant !== 'minimal' && (
        <motion.div
          className="flex justify-center items-center space-x-3 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!isRunning && !isPaused && (
            <MagneticButton
              variant="primary"
              size="lg"
              onClick={handleStart}
              magneticStrength={0.8}
            >
              <Play size={20} />
              <span>Start</span>
            </MagneticButton>
          )}

          {isRunning && (
            <MagneticButton
              variant="outline"
              size="lg"
              onClick={handlePause}
              magneticStrength={0.6}
            >
              <Pause size={20} />
              <span>Pause</span>
            </MagneticButton>
          )}

          {isPaused && (
            <MagneticButton
              variant="primary"
              size="lg"
              onClick={handleResume}
              magneticStrength={0.8}
            >
              <Play size={20} />
              <span>Resume</span>
            </MagneticButton>
          )}

          {(isRunning || isPaused || timeElapsed > 0) && (
            <>
              <MagneticButton
                variant="ghost"
                size="lg"
                onClick={handleStop}
                magneticStrength={0.4}
              >
                <Square size={20} />
                <span>Stop</span>
              </MagneticButton>

              <MagneticButton
                variant="ghost"
                size="lg"
                onClick={handleReset}
                magneticStrength={0.4}
              >
                <RotateCcw size={20} />
                <span>Reset</span>
              </MagneticButton>
            </>
          )}
        </motion.div>
      )}

      {/* Completion Animation */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-dark-bg/90 rounded-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-4">
              <motion.div
                className="text-6xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              >
                🎉
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-accent-green mb-2">
                  Session Complete!
                </h3>
                <p className="text-dark-text-secondary">
                  {activity} finished in {formatDuration(Math.floor(timeElapsed / 60))}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Preset timer components
export const PomodoroTimer = ({ onComplete, ...props }) => (
  <TimeTracker
    activity="Focus Session"
    targetDuration={1500} // 25 minutes
    variant="default"
    persistKey="pomodoro"
    onComplete={onComplete}
    {...props}
  />
)

export const WorkoutTimer = ({ activity = "Workout", ...props }) => (
  <TimeTracker
    activity={activity}
    variant="compact"
    showControls={true}
    persistKey="workout"
    {...props}
  />
)

export const RunningTimer = ({ ...props }) => (
  <TimeTracker
    activity="Running Session"
    variant="minimal"
    showControls={false}
    persistKey="running"
    {...props}
  />
)

export const StudyTimer = ({ subject = "Study Session", duration = 3600, ...props }) => (
  <TimeTracker
    activity={subject}
    targetDuration={duration}
    variant="default"
    persistKey="study"
    {...props}
  />
)

export default TimeTracker

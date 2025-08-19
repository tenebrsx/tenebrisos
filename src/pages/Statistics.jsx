import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Zap,
  Eye,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { loadFromStorage, formatDuration } from '../utils/helpers.js'

const Statistics = () => {
  const [activities, setActivities] = useState(loadFromStorage('activities', []))
  const [timePeriod, setTimePeriod] = useState('week') // week, month, year, all
  const [selectedCategory, setSelectedCategory] = useState('all')

  const timePeriods = [
    { key: 'week', label: 'Week', days: 7 },
    { key: 'month', label: 'Month', days: 30 },
    { key: 'year', label: 'Year', days: 365 },
    { key: 'all', label: 'All Time', days: Infinity }
  ]

  const categories = [
    { key: 'all', label: 'All', color: 'accent-blue' },
    { key: 'fitness', label: 'Fitness', color: 'accent-green' },
    { key: 'education', label: 'Learning', color: 'accent-blue' },
    { key: 'work', label: 'Work', color: 'accent-purple' },
    { key: 'rest', label: 'Rest', color: 'accent-orange' },
    { key: 'personal', label: 'Personal', color: 'accent-red' }
  ]

  const getFilteredActivities = () => {
    const now = new Date()
    const periodDays = timePeriods.find(p => p.key === timePeriod)?.days || 7

    let filtered = activities.filter(activity => {
      if (periodDays === Infinity) return true
      const activityDate = new Date(activity.startTime)
      const cutoffDate = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000))
      return activityDate >= cutoffDate
    })

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory)
    }

    return filtered
  }

  const calculateStats = () => {
    const filtered = getFilteredActivities()

    const totalMinutes = filtered.reduce((acc, activity) => {
      if (activity.isActive) {
        const now = new Date()
        const start = new Date(activity.startTime)
        const elapsed = Math.floor((now - start) / 1000 / 60)
        return acc + elapsed
      }
      return acc + (activity.duration || 0)
    }, 0)

    const completedActivities = filtered.filter(a => !a.isActive && a.duration).length
    const activeActivities = filtered.filter(a => a.isActive).length
    const averageSession = completedActivities > 0 ?
      Math.round(totalMinutes / completedActivities) : 0

    // Category breakdown
    const categoryBreakdown = categories.slice(1).map(category => {
      const categoryActivities = filtered.filter(a => a.category === category.key)
      const categoryTime = categoryActivities.reduce((acc, activity) => {
        if (activity.isActive) {
          const now = new Date()
          const start = new Date(activity.startTime)
          const elapsed = Math.floor((now - start) / 1000 / 60)
          return acc + elapsed
        }
        return acc + (activity.duration || 0)
      }, 0)

      return {
        ...category,
        time: categoryTime,
        count: categoryActivities.length,
        percentage: totalMinutes > 0 ? Math.round((categoryTime / totalMinutes) * 100) : 0
      }
    }).sort((a, b) => b.time - a.time)

    // Most productive day
    const dailyStats = {}
    filtered.forEach(activity => {
      const day = new Date(activity.startTime).toDateString()
      if (!dailyStats[day]) dailyStats[day] = 0

      if (activity.isActive) {
        const now = new Date()
        const start = new Date(activity.startTime)
        const elapsed = Math.floor((now - start) / 1000 / 60)
        dailyStats[day] += elapsed
      } else {
        dailyStats[day] += activity.duration || 0
      }
    })

    const bestDay = Object.entries(dailyStats).reduce((best, [day, minutes]) => {
      return minutes > best.minutes ? { day, minutes } : best
    }, { day: null, minutes: 0 })

    // Weekly comparison (if not viewing all time)
    let weeklyTrend = 0
    if (timePeriod !== 'all') {
      const currentPeriodDays = timePeriods.find(p => p.key === timePeriod)?.days || 7
      const previousPeriodStart = new Date(Date.now() - (currentPeriodDays * 2 * 24 * 60 * 60 * 1000))
      const currentPeriodStart = new Date(Date.now() - (currentPeriodDays * 24 * 60 * 60 * 1000))

      const previousPeriodActivities = activities.filter(a => {
        const date = new Date(a.startTime)
        return date >= previousPeriodStart && date < currentPeriodStart
      })

      const previousPeriodTime = previousPeriodActivities.reduce((acc, activity) => {
        return acc + (activity.duration || 0)
      }, 0)

      if (previousPeriodTime > 0) {
        weeklyTrend = Math.round(((totalMinutes - previousPeriodTime) / previousPeriodTime) * 100)
      }
    }

    return {
      totalMinutes,
      completedActivities,
      activeActivities,
      averageSession,
      categoryBreakdown,
      bestDay,
      weeklyTrend
    }
  }

  const stats = calculateStats()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'accent-blue' }) => (
    <motion.div
      className="card-minimal space-y-3"
      variants={fadeInUp}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-${color}/20`}>
          <Icon size={20} className={`text-${color}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 text-xs ${
            trend > 0 ? 'text-accent-green' :
            trend < 0 ? 'text-accent-red' : 'text-dark-text-muted'
          }`}>
            {trend > 0 ? <ArrowUp size={12} /> :
             trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-dark-text">{value}</div>
        <div className="text-sm text-dark-text-muted">{title}</div>
        {subtitle && (
          <div className="text-xs text-dark-text-muted mt-1">{subtitle}</div>
        )}
      </div>
    </motion.div>
  )

  const CategoryBar = ({ category, index }) => (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${category.color}`} />
          <span className="text-sm font-medium text-dark-text">{category.label}</span>
        </div>
        <div className="text-xs text-dark-text-muted">
          {formatDuration(Math.floor(category.time / 60))} ({category.percentage}%)
        </div>
      </div>

      <div className="progress-bar h-2">
        <motion.div
          className={`h-full bg-${category.color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${category.percentage}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 }}
        />
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-dark-bg pb-24 pt-8">
      <motion.div
        className="container-dashboard space-y-6"
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold flex items-center justify-center space-x-3">
            <BarChart3 className="text-accent-blue" size={32} />
            <span className="text-accent-blue">Statistics</span>
          </h1>
          <p className="text-dark-text-secondary">
            Track your productivity and insights
          </p>
        </motion.div>

        {/* Time Period Selector */}
        <motion.div variants={fadeInUp} className="flex space-x-1 p-1 bg-dark-surface rounded-lg">
          {timePeriods.map((period) => (
            <button
              key={period.key}
              onClick={() => setTimePeriod(period.key)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                timePeriod === period.key
                  ? 'bg-accent-blue text-white'
                  : 'text-dark-text-muted hover:text-dark-text'
              }`}
            >
              {period.label}
            </button>
          ))}
        </motion.div>

        {/* Overview Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Time"
            value={formatDuration(Math.floor(stats.totalMinutes / 60))}
            subtitle={`${stats.completedActivities} completed sessions`}
            icon={Clock}
            trend={timePeriod !== 'all' ? stats.weeklyTrend : undefined}
            color="accent-blue"
          />

          <StatCard
            title="Average Session"
            value={`${stats.averageSession}min`}
            subtitle={stats.activeActivities > 0 ? `${stats.activeActivities} active now` : 'No active sessions'}
            icon={Target}
            color="accent-green"
          />
        </motion.div>

        {/* Best Day */}
        {stats.bestDay.day && (
          <motion.div variants={fadeInUp} className="card">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-lg bg-accent-purple/20">
                <Award size={20} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-text">Most Productive Day</h3>
                <p className="text-sm text-dark-text-muted">Your best performance this period</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <div className="text-lg font-bold text-accent-purple">
                  {new Date(stats.bestDay.day).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-dark-text-muted">
                  {formatDuration(Math.floor(stats.bestDay.minutes / 60))} total
                </div>
              </div>
              <Zap size={24} className="text-accent-purple" />
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div variants={fadeInUp} className="space-y-3">
          <h3 className="text-lg font-display">Category Breakdown</h3>

          <div className="flex space-x-1 p-1 bg-dark-surface rounded-lg overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`flex-shrink-0 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.key
                    ? `bg-${category.color} text-white`
                    : 'text-dark-text-muted hover:text-dark-text'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Breakdown Chart */}
        <motion.div variants={fadeInUp} className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display">Time Distribution</h3>
            <div className="text-sm text-dark-text-muted">
              {formatDuration(Math.floor(stats.totalMinutes / 60))} total
            </div>
          </div>

          {stats.categoryBreakdown.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-dark-text-muted">No data for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.categoryBreakdown.map((category, index) => (
                <CategoryBar key={category.key} category={category} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Insights */}
        <motion.div variants={fadeInUp} className="card space-y-4">
          <h3 className="text-lg font-display flex items-center space-x-2">
            <Eye size={20} className="text-accent-orange" />
            <span>Insights</span>
          </h3>

          <div className="space-y-3">
            {stats.totalMinutes === 0 ? (
              <div className="text-center py-4">
                <p className="text-dark-text-muted">Start tracking activities to see insights</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 bg-dark-surface/30 rounded-lg">
                  <span className="text-sm text-dark-text">Most active category</span>
                  <span className="text-sm font-medium text-accent-blue">
                    {stats.categoryBreakdown[0]?.label || 'None'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-surface/30 rounded-lg">
                  <span className="text-sm text-dark-text">Daily average</span>
                  <span className="text-sm font-medium text-accent-green">
                    {timePeriod === 'all' ? 'N/A' :
                     formatDuration(Math.floor(stats.totalMinutes / 60 / (timePeriods.find(p => p.key === timePeriod)?.days || 1)))}
                  </span>
                </div>

                {timePeriod !== 'all' && stats.weeklyTrend !== 0 && (
                  <div className="flex items-center justify-between p-3 bg-dark-surface/30 rounded-lg">
                    <span className="text-sm text-dark-text">Trend vs previous period</span>
                    <span className={`text-sm font-medium flex items-center space-x-1 ${
                      stats.weeklyTrend > 0 ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      {stats.weeklyTrend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{Math.abs(stats.weeklyTrend)}%</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-dark-surface/30 rounded-lg">
                  <span className="text-sm text-dark-text">Completion rate</span>
                  <span className="text-sm font-medium text-accent-purple">
                    {stats.completedActivities + stats.activeActivities > 0 ?
                     Math.round((stats.completedActivities / (stats.completedActivities + stats.activeActivities)) * 100) : 0}%
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Statistics

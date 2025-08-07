import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Clock,
  Zap,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadFromStorage, formatDuration } from "../../utils/helpers.js";

const StatsWidget = ({ widgetId, size = "medium", isCustomizing }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTime: 0,
    totalActivities: 0,
    completedActivities: 0,
    streak: 0,
    todayTime: 0,
    weekTime: 0,
    averageDaily: 0,
    mostProductiveHour: null,
    favoriteActivity: null,
  });

  useEffect(() => {
    const calculateStats = () => {
      try {
        const activities = loadFromStorage("activities", []) || [];
        const notes = loadFromStorage("notes", []) || [];
        const todos = loadFromStorage("todos", []) || [];

        // Calculate basic stats
        const completedActivities = activities.filter(a => !a.isActive && a.duration);
        const totalTime = completedActivities.reduce((acc, activity) => {
          return acc + (activity.duration || 0);
        }, 0);

        // Calculate today's time
        const today = new Date().toDateString();
        const todayActivities = completedActivities.filter(activity =>
          new Date(activity.startTime).toDateString() === today
        );
        const todayTime = todayActivities.reduce((acc, activity) => {
          return acc + (activity.duration || 0);
        }, 0);

        // Calculate this week's time
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekActivities = completedActivities.filter(activity =>
          new Date(activity.startTime) >= weekAgo
        );
        const weekTime = weekActivities.reduce((acc, activity) => {
          return acc + (activity.duration || 0);
        }, 0);

        // Calculate streak (consecutive days with activities)
        const today_date = new Date();
        let streak = 0;
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today_date);
          checkDate.setDate(today_date.getDate() - i);
          const dateStr = checkDate.toDateString();

          const hasActivity = activities.some(activity =>
            new Date(activity.startTime).toDateString() === dateStr && !activity.isActive
          );

          if (hasActivity) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }

        // Calculate average daily time
        const averageDaily = streak > 0 ? totalTime / streak : 0;

        // Find most productive hour
        const hourlyData = {};
        completedActivities.forEach(activity => {
          const hour = new Date(activity.startTime).getHours();
          hourlyData[hour] = (hourlyData[hour] || 0) + (activity.duration || 0);
        });
        const mostProductiveHour = Object.keys(hourlyData).reduce((a, b) =>
          hourlyData[a] > hourlyData[b] ? a : b, null
        );

        // Find favorite activity type
        const activityTypes = {};
        completedActivities.forEach(activity => {
          const type = activity.category || activity.type || 'general';
          activityTypes[type] = (activityTypes[type] || 0) + 1;
        });
        const favoriteActivity = Object.keys(activityTypes).reduce((a, b) =>
          activityTypes[a] > activityTypes[b] ? a : b, null
        );

        setStats({
          totalTime,
          totalActivities: activities.length,
          completedActivities: completedActivities.length,
          streak,
          todayTime,
          weekTime,
          averageDaily,
          mostProductiveHour: mostProductiveHour ? `${mostProductiveHour}:00` : null,
          favoriteActivity,
          totalNotes: notes.length,
          totalTodos: todos.length,
          completedTodos: todos.filter(t => t.completed).length,
        });
      } catch (error) {
        console.error("Error calculating stats:", error);
      }
    };

    calculateStats();

    // Refresh stats every minute
    const interval = setInterval(calculateStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-4";
      case "medium":
        return "p-6";
      case "large":
        return "p-6";
      default:
        return "p-6";
    }
  };

  const getStatsToShow = () => {
    switch (size) {
      case "small":
        return [
          { label: "Total Time", value: formatDuration(stats.totalTime), icon: Clock, color: "accent-blue" },
          { label: "Streak", value: `${stats.streak} days`, icon: Zap, color: "accent-orange" },
        ];
      case "medium":
        return [
          { label: "Total Time", value: formatDuration(stats.totalTime), icon: Clock, color: "accent-blue" },
          { label: "Activities", value: stats.completedActivities, icon: Activity, color: "accent-green" },
          { label: "Streak", value: `${stats.streak} days`, icon: Zap, color: "accent-orange" },
          { label: "Today", value: formatDuration(stats.todayTime), icon: Target, color: "accent-purple" },
        ];
      case "large":
        return [
          { label: "Total Time", value: formatDuration(stats.totalTime), icon: Clock, color: "accent-blue" },
          { label: "Activities", value: stats.completedActivities, icon: Activity, color: "accent-green" },
          { label: "Streak", value: `${stats.streak} days`, icon: Zap, color: "accent-orange" },
          { label: "Today", value: formatDuration(stats.todayTime), icon: Target, color: "accent-purple" },
          { label: "This Week", value: formatDuration(stats.weekTime), icon: Calendar, color: "accent-red" },
          { label: "Daily Avg", value: formatDuration(Math.round(stats.averageDaily)), icon: TrendingUp, color: "accent-blue" },
        ];
      default:
        return [
          { label: "Total Time", value: formatDuration(stats.totalTime), icon: Clock, color: "accent-blue" },
          { label: "Activities", value: stats.completedActivities, icon: Activity, color: "accent-green" },
          { label: "Streak", value: `${stats.streak} days`, icon: Zap, color: "accent-orange" },
          { label: "Today", value: formatDuration(stats.todayTime), icon: Target, color: "accent-purple" },
        ];
    }
  };

  const handleStatsClick = () => {
    if (!isCustomizing) {
      navigate("/statistics");
    }
  };

  const StatItem = ({ stat, index }) => {
    const IconComponent = stat.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="flex items-center justify-between p-3 bg-dark-surface rounded-lg border border-dark-border hover:border-white/20 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
            <IconComponent size={16} className={`text-${stat.color}`} />
          </div>
          <div>
            <div className="text-sm font-medium text-dark-text">{stat.value}</div>
            <div className="text-xs text-dark-text-muted">{stat.label}</div>
          </div>
        </div>

        {!isCustomizing && (
          <ChevronRight
            size={14}
            className="text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </motion.div>
    );
  };

  const statsToShow = getStatsToShow();

  return (
    <motion.div
      className={`glass rounded-xl border border-white/10 hover:border-white/20 transition-all ${getSizeClasses()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center">
            <BarChart3 size={16} className="text-accent-blue" />
          </div>
          <div>
            <h3 className="font-medium text-dark-text">Activity Stats</h3>
            <p className="text-xs text-dark-text-muted">Your progress</p>
          </div>
        </div>

        {!isCustomizing && (
          <motion.button
            onClick={handleStatsClick}
            className="p-2 text-dark-text-muted hover:text-accent-blue transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View detailed statistics"
          >
            <ChevronRight size={16} />
          </motion.button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <AnimatePresence>
          {statsToShow.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <BarChart3 className="w-12 h-12 text-dark-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm text-dark-text-muted mb-3">No activity data yet</p>
              {!isCustomizing && (
                <button
                  onClick={() => navigate("/activities")}
                  className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                >
                  Start your first activity
                </button>
              )}
            </motion.div>
          ) : (
            statsToShow.map((stat, index) => (
              <StatItem key={stat.label} stat={stat} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Additional insights for larger widgets */}
      {size === "large" && stats.favoriteActivity && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between text-xs text-dark-text-muted">
            <span>Most frequent: {stats.favoriteActivity}</span>
            {stats.mostProductiveHour && (
              <span>Peak time: {stats.mostProductiveHour}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      {statsToShow.length > 0 && !isCustomizing && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleStatsClick}
            className="w-full text-center text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            View detailed stats →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatsWidget;

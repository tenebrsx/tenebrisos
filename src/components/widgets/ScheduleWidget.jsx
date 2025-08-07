import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, ChevronRight, Plus, Target, Zap, Coffee, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadFromStorage, formatTime } from "../../utils/helpers.js";

const ScheduleWidget = ({ widgetId, size = "medium", isCustomizing }) => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadSchedule = () => {
      try {
        const savedSchedule = loadFromStorage("schedule", {}) || {};
        const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

        const todaySchedule = savedSchedule[today] || [];
        const currentTimeStr = new Date().toTimeString().slice(0, 5); // HH:MM format

        // Filter for upcoming activities (within next 4 hours)
        const upcomingActivities = todaySchedule.filter(activity => {
          const activityTime = activity.startTime;
          const activityDateTime = new Date(`1970/01/01 ${activityTime}`);
          const currentDateTime = new Date(`1970/01/01 ${currentTimeStr}`);
          const timeDiff = activityDateTime - currentDateTime;

          // Show activities that are happening now or within the next 4 hours
          return timeDiff >= -30 * 60 * 1000 && timeDiff <= 4 * 60 * 60 * 1000; // -30 min to +4 hours
        });

        // Sort by time and limit based on widget size
        const sortedActivities = upcomingActivities.sort((a, b) => {
          return new Date(`1970/01/01 ${a.startTime}`) - new Date(`1970/01/01 ${b.startTime}`);
        });

        const limit = size === "small" ? 2 : size === "medium" ? 4 : 6;
        setSchedule(sortedActivities.slice(0, limit));
      } catch (error) {
        console.error("Error loading schedule for widget:", error);
        setSchedule([]);
      }
    };

    loadSchedule();

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Refresh schedule every 5 minutes
    const scheduleInterval = setInterval(loadSchedule, 5 * 60 * 1000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(scheduleInterval);
    };
  }, [size]);

  const getTimeUntil = (activityTime) => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const activityDateTime = new Date(`1970/01/01 ${activityTime}`);
    const currentDateTime = new Date(`1970/01/01 ${currentTimeStr}`);
    const timeDiff = activityDateTime - currentDateTime;

    if (timeDiff < 0) {
      return "Now";
    }

    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      work: Zap,
      fitness: Target,
      learning: BookOpen,
      rest: Coffee,
      personal: Clock,
    };
    return icons[category] || Clock;
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: "accent-purple",
      fitness: "accent-green",
      learning: "accent-blue",
      rest: "accent-orange",
      personal: "accent-red",
    };
    return colors[category] || "accent-blue";
  };

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

  const getContentLimits = () => {
    switch (size) {
      case "small":
        return { titleLength: 20 };
      case "medium":
        return { titleLength: 30 };
      case "large":
        return { titleLength: 40 };
      default:
        return { titleLength: 30 };
    }
  };

  const limits = getContentLimits();

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const handleScheduleClick = () => {
    if (!isCustomizing) {
      navigate("/schedule");
    }
  };

  const handleActivityClick = (activityId) => {
    if (!isCustomizing) {
      navigate("/schedule");
    }
  };

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
          <div className="w-8 h-8 rounded-lg bg-accent-red/20 flex items-center justify-center">
            <Calendar size={16} className="text-accent-red" />
          </div>
          <div>
            <h3 className="font-medium text-dark-text">Upcoming</h3>
            <p className="text-xs text-dark-text-muted">Next activities</p>
          </div>
        </div>

        {!isCustomizing && (
          <motion.button
            onClick={handleScheduleClick}
            className="p-2 text-dark-text-muted hover:text-accent-red transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View full schedule"
          >
            <Plus size={16} />
          </motion.button>
        )}
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        <AnimatePresence>
          {schedule.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <Calendar className="w-12 h-12 text-dark-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-sm text-dark-text-muted mb-3">No upcoming activities</p>
              {!isCustomizing && (
                <button
                  onClick={handleScheduleClick}
                  className="text-xs text-accent-red hover:text-accent-red/80 transition-colors"
                >
                  Add to schedule
                </button>
              )}
            </motion.div>
          ) : (
            schedule.map((activity, index) => {
              const CategoryIcon = getCategoryIcon(activity.category);
              const categoryColor = getCategoryColor(activity.category);
              const timeUntil = getTimeUntil(activity.startTime);
              const isHappeningNow = timeUntil === "Now";

              return (
                <motion.div
                  key={`${activity.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleActivityClick(activity.id)}
                  className={`p-3 bg-dark-surface rounded-lg border transition-all group ${
                    isHappeningNow
                      ? "border-accent-green/50 bg-accent-green/5"
                      : "border-dark-border hover:border-white/20"
                  } ${!isCustomizing ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-${categoryColor}/20 flex items-center justify-center flex-shrink-0`}>
                        <CategoryIcon size={14} className={`text-${categoryColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-dark-text text-sm truncate">
                            {truncateText(activity.activity, limits.titleLength)}
                          </h4>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${
                              isHappeningNow
                                ? "bg-accent-green/20 text-accent-green"
                                : "bg-dark-border text-dark-text-muted"
                            }`}
                          >
                            {timeUntil}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-dark-text-muted">
                            <Clock size={10} />
                            <span>{activity.startTime}</span>
                            {activity.endTime && (
                              <>
                                <span>•</span>
                                <span>{activity.duration || "30"}min</span>
                              </>
                            )}
                          </div>

                          {activity.priority === "high" && (
                            <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                          )}
                        </div>

                        {activity.description && size !== "small" && (
                          <p className="text-xs text-dark-text-secondary mt-1 truncate">
                            {truncateText(activity.description, 40)}
                          </p>
                        )}
                      </div>

                      {!isCustomizing && (
                        <ChevronRight
                          size={14}
                          className="text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Current Time Display */}
      {size !== "small" && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between text-xs text-dark-text-muted">
            <div className="flex items-center space-x-1">
              <Clock size={10} />
              <span>Current time: {formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 rounded-full bg-accent-green animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      {schedule.length > 0 && !isCustomizing && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleScheduleClick}
            className="w-full text-center text-sm text-accent-red hover:text-accent-red/80 transition-colors"
          >
            View full schedule →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScheduleWidget;

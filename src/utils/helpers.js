// Performance optimized storage
import { optimizedStorage } from "./performance.js";

// Time formatting utilities
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  };
  return date.toLocaleTimeString([], defaultOptions);
};

export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`;
};

export const getTimeDifference = (startTime, endTime = new Date()) => {
  const diff = endTime - startTime;
  return Math.floor(diff / 1000 / 60); // Return difference in minutes
};

export const formatTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return `${start} - ${end}`;
};

// Activity management utilities
export const generateActivityId = () => {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getActivityColor = (type) => {
  const colors = {
    fitness: "accent-green",
    learning: "accent-blue",
    work: "accent-purple",
    break: "accent-orange",
    personal: "accent-red",
    default: "dark-text-secondary",
  };
  return colors[type] || colors.default;
};

export const getActivityIcon = (type) => {
  const icons = {
    fitness: "Dumbbell",
    learning: "BookOpen",
    work: "Briefcase",
    break: "Coffee",
    personal: "User",
    default: "Activity",
  };
  return icons[type] || icons.default;
};

export const calculateTotalTime = (activities) => {
  const totalMinutes = activities.reduce((acc, activity) => {
    if (activity.duration && activity.duration !== "In Progress") {
      const minutes = parseDuration(activity.duration);
      return acc + minutes;
    }
    return acc;
  }, 0);
  return formatDuration(totalMinutes);
};

export const parseDuration = (durationString) => {
  if (!durationString || durationString === "In Progress") return 0;

  const hourMatch = durationString.match(/(\d+)h/);
  const minuteMatch = durationString.match(/(\d+)min/);

  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
};

// Stats calculation utilities
export const calculateWeeklyStats = (activities) => {
  const thisWeek = activities.filter((activity) => {
    const activityDate = new Date(activity.timestamp || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityDate >= weekAgo;
  });

  const totalMinutes = thisWeek.reduce((acc, activity) => {
    return acc + parseDuration(activity.duration);
  }, 0);

  const completedTasks = thisWeek.filter(
    (activity) =>
      activity.status === "completed" || activity.duration !== "In Progress",
  ).length;

  const focusSessions = thisWeek.filter(
    (activity) => activity.type === "work" || activity.type === "learning",
  ).length;

  const productivity =
    totalMinutes > 0
      ? Math.min(100, Math.round((completedTasks / thisWeek.length) * 100))
      : 0;

  return {
    totalTime: formatDuration(totalMinutes),
    focusSessions,
    completedTasks,
    productivity,
  };
};

export const getProductivityTrend = (activities, days = 7) => {
  const dailyStats = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp || Date.now());
      return activityDate >= date && activityDate < nextDate;
    });

    const totalMinutes = dayActivities.reduce((acc, activity) => {
      return acc + parseDuration(activity.duration);
    }, 0);

    dailyStats.push({
      date: date.toISOString().split("T")[0],
      totalMinutes,
      activitiesCount: dayActivities.length,
      productivity:
        dayActivities.length > 0
          ? Math.round((totalMinutes / (dayActivities.length * 60)) * 100)
          : 0,
    });
  }

  return dailyStats;
};

// Local storage utilities (performance optimized)
export const saveToStorage = (key, data, options = {}) => {
  try {
    // Use optimized storage with compression for large data
    const shouldCompress = JSON.stringify(data).length > 1000;
    return optimizedStorage.set(key, data, {
      compress: shouldCompress,
      cache: true,
      ...options,
    });
  } catch (error) {
    console.error("Failed to save to storage:", error);
    // Fallback to regular localStorage
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (fallbackError) {
      console.error("Fallback storage failed:", fallbackError);
      return false;
    }
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    return optimizedStorage.get(key, defaultValue);
  } catch (error) {
    console.error("Failed to load from storage:", error);
    // Fallback to regular localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (fallbackError) {
      console.error("Fallback storage load failed:", fallbackError);
      return defaultValue;
    }
  }
};

export const removeFromStorage = (key) => {
  try {
    optimizedStorage.remove(key);
    return true;
  } catch (error) {
    console.error("Failed to remove from storage:", error);
    // Fallback to regular localStorage
    try {
      localStorage.removeItem(key);
      return true;
    } catch (fallbackError) {
      console.error("Fallback storage removal failed:", fallbackError);
      return false;
    }
  }
};

// Animation utilities (performance optimized)
export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
};

// String utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const capitalizeFirst = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Theme utilities
export const getStatusColor = (status) => {
  const colors = {
    active: "accent-green",
    paused: "accent-orange",
    completed: "accent-blue",
    cancelled: "accent-red",
    pending: "dark-text-muted",
  };
  return colors[status] || colors.pending;
};

export const getProgressColor = (percentage) => {
  if (percentage >= 80) return "accent-green";
  if (percentage >= 60) return "accent-blue";
  if (percentage >= 40) return "accent-orange";
  return "accent-red";
};

// Validation utilities
export const isValidTimeFormat = (timeString) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
};

export const isValidDuration = (duration) => {
  if (!duration || duration === "In Progress") return true;
  const durationRegex = /^(\d+h\s?)?(\d+min)?$/;
  return durationRegex.test(duration.trim());
};

// Date utilities
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isThisWeek = (date) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return new Date(date) >= weekAgo;
};

export const getWeekDates = () => {
  const today = new Date();
  const week = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    week.push(date);
  }

  return week;
};

// Focus mode utilities
export const generateFocusSession = (activity, duration = 25) => {
  return {
    id: generateActivityId(),
    activity,
    type: "focus",
    startTime: new Date(),
    plannedDuration: duration,
    status: "active",
  };
};

export const calculateFocusProgress = (session) => {
  if (!session.startTime) return 0;

  const elapsed = getTimeDifference(new Date(session.startTime));
  const progress = (elapsed / session.plannedDuration) * 100;
  return Math.min(100, Math.max(0, progress));
};

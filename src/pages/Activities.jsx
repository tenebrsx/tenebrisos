import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Plus,
  Filter,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  MoreVertical,
  Target,
  TrendingUp,
  BookOpen,
  Dumbbell,
  Coffee,
  Zap,
  User,
  ChevronDown,
  SortDesc,
  ListFilter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../components/MagneticButton";
import StatusIndicator from "../components/StatusIndicator";
import {
  formatTime,
  formatDuration,
  saveToStorage,
  loadFromStorage,
} from "../utils/helpers.js";

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState(() => {
    try {
      return loadFromStorage("activities", []) || [];
    } catch (error) {
      console.error("Error loading activities:", error);
      return [];
    }
  });
  const [currentActivity, setCurrentActivity] = useState(() => {
    try {
      const loadedActivities = loadFromStorage("activities", []) || [];
      return loadedActivities.find((a) => a.isActive) || null;
    } catch (error) {
      console.error("Error finding current activity:", error);
      return null;
    }
  });
  const [filter, setFilter] = useState("all"); // all, active, completed, today
  const [sortBy, setSortBy] = useState("recent"); // recent, duration, type, name
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");

  // Activity templates
  const activityTemplates = [
    {
      id: "running",
      name: "Running",
      icon: "🏃‍♂️",
      color: "accent-green",
      category: "fitness",
    },
    {
      id: "learning",
      name: "Learning",
      icon: BookOpen,
      color: "accent-blue",
      category: "education",
    },
    {
      id: "workout",
      name: "Workout",
      icon: Dumbbell,
      color: "accent-orange",
      category: "fitness",
    },
    {
      id: "focus",
      name: "Focus Session",
      icon: Zap,
      color: "accent-purple",
      category: "work",
    },
    {
      id: "break",
      name: "Break",
      icon: Coffee,
      color: "accent-orange",
      category: "rest",
    },
    {
      id: "personal",
      name: "Personal",
      icon: User,
      color: "accent-red",
      category: "personal",
    },
  ];

  // Save activities to localStorage
  useEffect(() => {
    saveToStorage("activities", activities);
  }, [activities]);

  // Update current activity reference
  useEffect(() => {
    try {
      const active = activities.find((a) => a.isActive);
      setCurrentActivity(active || null);
    } catch (error) {
      console.error("Error updating current activity:", error);
      setCurrentActivity(null);
    }
  }, [activities]);

  const handleStartActivity = (template) => {
    console.log("🎯 Activities: Starting activity from template", { template });

    // Stop any current activity first
    if (currentActivity) {
      console.log("⏹️ Activities: Stopping current activity first", {
        currentActivity: currentActivity.id,
      });
      handleStopActivity(currentActivity.id);
    }

    const newActivity = {
      id: Date.now(),
      name: template.name,
      type: template.id,
      category: template.category,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      isActive: true,
      isPaused: false,
      icon: template.icon,
      color: template.color,
    };

    console.log("▶️ Activities: Created new activity", {
      activity: newActivity,
    });

    // Load current activities from localStorage to avoid stale state
    const currentActivities = loadFromStorage("activities", []) || [];
    const updatedActivities = [newActivity, ...currentActivities];
    setActivities(updatedActivities);

    // Save to localStorage immediately
    console.log("💾 Activities: Saving to localStorage");
    saveToStorage("activities", updatedActivities);

    // Dispatch custom event to notify other components
    console.log("📡 Activities: Dispatching activityUpdated event");
    window.dispatchEvent(new CustomEvent("activityUpdated"));

    // Navigate to home to show the started activity
    console.log("🏠 Activities: Navigating to home with refresh parameter");
    navigate("/?refresh=activities");
  };

  const handleStopActivity = (activityId) => {
    const endTime = new Date();

    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId && activity.isActive) {
          const startTime = new Date(activity.startTime);
          const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutes

          return {
            ...activity,
            endTime: endTime.toISOString(),
            duration,
            isActive: false,
            isPaused: false,
          };
        }
        return activity;
      }),
    );
  };

  const handlePauseActivity = (activityId) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id === activityId) {
          return {
            ...activity,
            isPaused: !activity.isPaused,
          };
        }
        return activity;
      }),
    );
  };

  const handleDeleteActivity = (activityId) => {
    setActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId),
    );
  };

  const handleAddCustomActivity = () => {
    if (!newActivityName.trim()) return;

    const newActivity = {
      id: Date.now(),
      name: newActivityName.trim(),
      type: "custom",
      category: "personal",
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      isActive: true,
      isPaused: false,
      icon: "📝",
      color: "accent-blue",
    };

    setActivities((prev) => [newActivity, ...prev]);
    setNewActivityName("");
    setShowAddForm(false);
  };

  const getTimeElapsed = (activity) => {
    if (!activity.isActive) return activity.duration || 0;
    const now = new Date();
    const start = new Date(activity.startTime);
    return Math.floor((now - start) / 1000 / 60); // minutes
  };

  // Consolidate duplicate activities
  const consolidateActivities = (activities) => {
    const consolidated = {};

    activities.forEach((activity) => {
      const today = new Date().toDateString();
      const activityDate = new Date(activity.startTime).toDateString();
      const key = `${activity.name}_${activityDate}`;

      if (consolidated[key]) {
        consolidated[key].count += 1;
        consolidated[key].totalDuration += activity.duration || 0;
        consolidated[key].activities.push(activity);
        // Keep the most recent start time
        if (
          new Date(activity.startTime) > new Date(consolidated[key].startTime)
        ) {
          consolidated[key].startTime = activity.startTime;
        }
      } else {
        consolidated[key] = {
          ...activity,
          count: 1,
          totalDuration: activity.duration || 0,
          activities: [activity],
          originalId: activity.id,
        };
      }
    });

    return Object.values(consolidated);
  };

  // Sort activities
  const sortActivities = (activities, sortType) => {
    const sorted = [...activities];

    switch (sortType) {
      case "duration":
        return sorted.sort(
          (a, b) =>
            (b.totalDuration || b.duration || 0) -
            (a.totalDuration || a.duration || 0),
        );
      case "recent":
        return sorted.sort(
          (a, b) => new Date(b.startTime) - new Date(a.startTime),
        );
      case "type":
        return sorted.sort((a, b) =>
          (a.category || a.type || "").localeCompare(
            b.category || b.type || "",
          ),
        );
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  // Filter activities
  const filterActivities = (activities, filterType) => {
    const today = new Date().toDateString();

    switch (filterType) {
      case "active":
        return activities.filter((a) => a.isActive);
      case "completed":
        return activities.filter((a) => !a.isActive);
      case "today":
        return activities.filter(
          (a) => new Date(a.startTime).toDateString() === today,
        );
      default:
        return activities;
    }
  };

  // Get processed activities
  const getProcessedActivities = () => {
    let processed = filterActivities(activities, filter);
    processed = consolidateActivities(processed);
    processed = sortActivities(processed, sortBy);
    return processed;
  };

  const filteredActivities = getProcessedActivities();

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayActivities = activities.filter(
      (a) => new Date(a.startTime).toDateString() === today,
    );

    const totalTime = todayActivities.reduce((acc, activity) => {
      return acc + (activity.duration || getTimeElapsed(activity));
    }, 0);

    const completed = todayActivities.filter((a) => !a.isActive).length;
    const active = todayActivities.filter((a) => a.isActive).length;

    return { totalTime, completed, active, total: todayActivities.length };
  };

  const stats = getTodayStats();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const ActivityCard = ({ activity, index }) => {
    const elapsed = getTimeElapsed(activity);
    const isActive = activity.isActive;

    return (
      <motion.div
        className="card-minimal space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        layout
      >
        {/* Activity Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {activity.icon ? (
                typeof activity.icon === "string" ? (
                  <span>{activity.icon}</span>
                ) : React.isValidElement(activity.icon) ? (
                  activity.icon
                ) : typeof activity.icon === "function" ? (
                  React.createElement(activity.icon, {
                    size: 24,
                    className: `text-${activity.color}`,
                  })
                ) : (
                  <Target size={24} className={`text-${activity.color}`} />
                )
              ) : (
                <Target size={24} className={`text-${activity.color}`} />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-dark-text">{activity.name}</h3>
                {activity.count > 1 && (
                  <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue text-xs rounded-full font-medium">
                    ×{activity.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-dark-text-muted">
                {formatTime(new Date(activity.startTime))}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <StatusIndicator
              status={
                isActive
                  ? activity.isPaused
                    ? "paused"
                    : "active"
                  : "completed"
              }
              size="sm"
              pulse={isActive && !activity.isPaused}
            />
            <button className="p-1 text-dark-text-muted hover:text-dark-text">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-mono font-bold text-accent-blue">
            {activity.count > 1
              ? `${Math.floor((activity.totalDuration || elapsed) / 60)}h ${(activity.totalDuration || elapsed) % 60}m`
              : `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`}
          </div>

          {isActive && (
            <div className="flex items-center space-x-2">
              <MagneticButton
                variant="ghost"
                size="sm"
                onClick={() => handlePauseActivity(activity.id)}
                magneticStrength={0.4}
              >
                {activity.isPaused ? <Play size={16} /> : <Pause size={16} />}
              </MagneticButton>

              <MagneticButton
                variant="outline"
                size="sm"
                onClick={() => handleStopActivity(activity.id)}
                magneticStrength={0.4}
              >
                <Square size={16} />
                <span>Stop</span>
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Progress Bar for Active Activities */}
        {isActive && (
          <div className="space-y-2">
            <div className="progress-bar h-1">
              <motion.div
                className="h-full bg-accent-blue"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((elapsed / 60) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-xs text-dark-text-muted text-center">
              {activity.isPaused ? "Paused" : "In Progress"}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const sortOptions = [
    { value: "recent", label: "Most Recent", icon: Clock },
    { value: "duration", label: "Time Spent", icon: TrendingUp },
    { value: "type", label: "Activity Type", icon: Filter },
    { value: "name", label: "Name", icon: User },
  ];

  const filterOptions = [
    { value: "all", label: "All Activities" },
    { value: "today", label: "Today Only" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-dark-bg pb-24 pt-8">
      <motion.div
        className="container-dashboard space-y-6"
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between"
        >
          <div className="text-left space-y-2">
            <h1 className="text-3xl font-display font-bold flex items-center space-x-3">
              <span className="text-3xl">🔥</span>
              <span className="text-accent-blue">Activities</span>
            </h1>
            <p className="text-dark-text-secondary">
              Track your progress and stay motivated
            </p>
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text hover:border-white/20 transition-all"
              >
                <SortDesc size={16} />
                <span className="text-sm">Sort</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-dark-border transition-all ${
                          sortBy === option.value
                            ? "bg-accent-blue/20 text-accent-blue"
                            : "text-dark-text"
                        }`}
                      >
                        <option.icon size={16} />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Menu */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text hover:border-white/20 transition-all"
              >
                <ListFilter size={16} />
                <span className="text-sm">Filter</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showFilterMenu ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {showFilterMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-dark-border rounded-lg shadow-lg z-10"
                  >
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilter(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-dark-border transition-all ${
                          filter === option.value
                            ? "bg-accent-blue/20 text-accent-blue"
                            : "text-dark-text"
                        }`}
                      >
                        <span className="text-sm">{option.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Today's Stats */}
        <motion.div variants={fadeInUp} className="card">
          <h3 className="text-lg font-display mb-4 flex items-center space-x-2">
            <TrendingUp size={20} className="text-accent-green" />
            <span>Today's Summary</span>
          </h3>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-blue">
                {Math.floor(stats.totalTime / 60)}h
              </div>
              <div className="text-xs text-dark-text-muted">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-green">
                {stats.completed}
              </div>
              <div className="text-xs text-dark-text-muted">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-orange">
                {stats.active}
              </div>
              <div className="text-xs text-dark-text-muted">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-purple">
                {stats.total}
              </div>
              <div className="text-xs text-dark-text-muted">Total</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start Templates */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display">Quick Start</h3>
            <MagneticButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              magneticStrength={0.5}
            >
              <Plus size={16} />
              <span>Custom</span>
            </MagneticButton>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                className="card-minimal space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Activity name..."
                  value={newActivityName}
                  onChange={(e) => setNewActivityName(e.target.value)}
                  className="input-primary"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <MagneticButton
                    variant="primary"
                    size="sm"
                    onClick={handleAddCustomActivity}
                    disabled={!newActivityName.trim()}
                  >
                    Start Activity
                  </MagneticButton>
                  <MagneticButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewActivityName("");
                    }}
                  >
                    Cancel
                  </MagneticButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-3">
            {activityTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <MagneticButton
                  variant="ghost"
                  onClick={() => handleStartActivity(template)}
                  className="w-full h-20 card-minimal flex-col space-y-1"
                  magneticStrength={0.6}
                  disabled={currentActivity?.type === template.id}
                >
                  <div className="text-xl">
                    {typeof template.icon === "string" ? (
                      <span>{template.icon}</span>
                    ) : template.icon ? (
                      React.createElement(template.icon, {
                        size: 20,
                        className: `text-${template.color}`,
                      })
                    ) : null}
                  </div>
                  <div className="text-sm font-medium">{template.name}</div>
                  {currentActivity?.type === template.id && (
                    <div className="text-xs text-accent-blue">Active</div>
                  )}
                </MagneticButton>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          variants={fadeInUp}
          className="flex space-x-1 p-1 bg-dark-surface rounded-lg"
        >
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "today", label: "Today" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? "bg-accent-blue text-white"
                  : "text-dark-text-muted hover:text-dark-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Activities List */}
        <motion.div variants={fadeInUp} className="space-y-3">
          {filteredActivities.length === 0 ? (
            <motion.div className="card text-center py-12">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-blue/20 flex items-center justify-center"
              >
                <Target size={32} className="text-accent-blue" />
              </motion.div>
              <h3 className="text-xl font-display text-dark-text mb-3">
                {filter === "today"
                  ? "No activities today"
                  : filter === "active"
                    ? "No active activities"
                    : filter === "completed"
                      ? "No completed activities"
                      : "Ready to Begin"}
              </h3>
              <p className="text-dark-text-muted mb-6 max-w-sm mx-auto">
                {filter === "today"
                  ? "Start strong—your journey begins with the first step"
                  : filter === "active"
                    ? "All activities are completed or paused"
                    : filter === "completed"
                      ? "Complete some activities to see them here"
                      : "Track your activities and watch your productivity soar"}
              </p>
              {filter === "all" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center space-x-3"
                >
                  <MagneticButton
                    variant="primary"
                    onClick={() => setShowAddForm(true)}
                    magneticStrength={0.4}
                  >
                    <Plus size={16} />
                    <span>Start Your First Activity</span>
                  </MagneticButton>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredActivities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Activities;

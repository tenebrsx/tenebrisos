import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Zap,
  Save,
  RotateCcw,
  Settings,
  Brain,
  ChevronDown,
  ChevronRight,
  Move,
  Copy,
  X,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MagneticButton from "../components/MagneticButton";
import StatusIndicator from "../components/StatusIndicator";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSettings } from "../contexts/SettingsContext";
import {
  saveToStorage,
  loadFromStorage,
  formatTime,
} from "../utils/helpers.js";

const Schedule = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(loadFromStorage("schedule", {}));
  const [activities, setActivities] = useState(
    loadFromStorage("activities", []),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [editingActivity, setEditingActivity] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [keyboardNavigationEnabled, setKeyboardNavigationEnabled] =
    useState(false);
  const animationStateRef = useRef({ hasAnimated: false, isAnimating: false });
  const mountedRef = useRef(false);

  const daysOfWeek = [
    { key: "monday", label: "Mon", full: "Monday" },
    { key: "tuesday", label: "Tue", full: "Tuesday" },
    { key: "wednesday", label: "Wed", full: "Wednesday" },
    { key: "thursday", label: "Thu", full: "Thursday" },
    { key: "friday", label: "Fri", full: "Friday" },
    { key: "saturday", label: "Sat", full: "Saturday" },
    { key: "sunday", label: "Sun", full: "Sunday" },
  ];

  const categoryColors = {
    fitness: "accent-green",
    work: "accent-purple",
    learning: "accent-blue",
    rest: "accent-orange",
    personal: "accent-red",
  };

  // Component mount management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      animationStateRef.current = { hasAnimated: false, isAnimating: false };
    };
  }, []);

  // Save data to localStorage (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage("schedule", schedule);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [schedule]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!keyboardNavigationEnabled) return;

      const currentIndex = daysOfWeek.findIndex(
        (day) => day.key === selectedDay,
      );

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedDay(daysOfWeek[currentIndex - 1].key);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentIndex < daysOfWeek.length - 1) {
            setSelectedDay(daysOfWeek[currentIndex + 1].key);
          }
          break;
        case "Home":
          e.preventDefault();
          setSelectedDay(daysOfWeek[0].key);
          break;
        case "End":
          e.preventDefault();
          setSelectedDay(daysOfWeek[daysOfWeek.length - 1].key);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          addActivity(selectedDay);
          break;
        case "Escape":
          e.preventDefault();
          setKeyboardNavigationEnabled(false);
          break;
      }
    };

    if (keyboardNavigationEnabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [keyboardNavigationEnabled, selectedDay, daysOfWeek]);

  const addActivity = (day, time = "09:00") => {
    const newActivity = {
      id: `${day}_${Date.now()}`,
      activity: "New Activity",
      startTime: time,
      endTime: "10:00",
      duration: 60,
      category: "personal",
      priority: "medium",
      description: "",
      flexible: true,
    };

    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newActivity].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    }));

    setEditingActivity(newActivity.id);
  };

  const updateActivity = (day, activityId, updates) => {
    setSchedule((prev) => ({
      ...prev,
      [day]:
        prev[day]?.map((activity) =>
          activity.id === activityId ? { ...activity, ...updates } : activity,
        ) || [],
    }));
  };

  const deleteActivity = (day, activityId) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day]?.filter((activity) => activity.id !== activityId) || [],
    }));
  };

  const duplicateActivity = (day, activityId) => {
    const activity = schedule[day]?.find((a) => a.id === activityId);
    if (activity) {
      const newActivity = {
        ...activity,
        id: `${day}_${Date.now()}`,
        activity: `${activity.activity} (Copy)`,
      };

      setSchedule((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), newActivity].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ),
      }));
    }
  };

  const handleDragStart = (e, day, activityId) => {
    const activity = schedule[day]?.find((a) => a.id === activityId);
    setDraggedItem({ day, activity });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetDay, targetIndex = null) => {
    e.preventDefault();

    if (!draggedItem) return;

    const { day: sourceDay, activity } = draggedItem;

    // Remove from source
    setSchedule((prev) => ({
      ...prev,
      [sourceDay]: prev[sourceDay]?.filter((a) => a.id !== activity.id) || [],
    }));

    // Add to target
    const newActivity = {
      ...activity,
      id: `${targetDay}_${Date.now()}`,
    };

    setSchedule((prev) => {
      const targetActivities = [...(prev[targetDay] || [])];
      if (targetIndex !== null) {
        targetActivities.splice(targetIndex, 0, newActivity);
      } else {
        targetActivities.push(newActivity);
      }

      return {
        ...prev,
        [targetDay]: targetActivities.sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        ),
      };
    });

    setDraggedItem(null);
    setDropTarget(null);
  };

  const ActivityEditor = ({ day, activity, onSave, onCancel }) => {
    // Local state to prevent re-rendering issues
    const [localActivity, setLocalActivity] = useState({
      activity: activity?.activity || "",
      startTime: activity?.startTime || "",
      endTime: activity?.endTime || "",
      category: activity?.category || "work",
      description: activity?.description || "",
    });

    const handleSave = () => {
      if (activity?.id) {
        updateActivity(day, activity.id, localActivity);
      }
      onSave();
    };

    return (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="glass rounded-2xl p-6 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h3 className="text-lg font-display mb-4">Edit Activity</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-text-secondary mb-1">
                Activity Name
              </label>
              <input
                type="text"
                value={localActivity.activity}
                onChange={(e) =>
                  setLocalActivity((prev) => ({
                    ...prev,
                    activity: e.target.value,
                  }))
                }
                className="input-primary"
                placeholder="Activity name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-dark-text-secondary mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={localActivity.startTime}
                  onChange={(e) =>
                    setLocalActivity((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-text-secondary mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={localActivity.endTime}
                  onChange={(e) =>
                    setLocalActivity((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                  className="input-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-text-secondary mb-1">
                Category
              </label>
              <select
                value={localActivity.category}
                onChange={(e) =>
                  setLocalActivity((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="input-primary"
              >
                <option value="work">Work</option>
                <option value="fitness">Fitness</option>
                <option value="learning">Learning</option>
                <option value="rest">Rest</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-dark-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={localActivity.description}
                onChange={(e) =>
                  setLocalActivity((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-primary resize-none"
                rows="2"
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <MagneticButton
              variant="primary"
              onClick={handleSave}
              className="flex-1"
            >
              <Save size={16} />
              <span>Save</span>
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              onClick={onCancel}
              className="flex-1"
            >
              <X size={16} />
              <span>Cancel</span>
            </MagneticButton>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const ActivityBlock = ({ day, activity, index }) => (
    <motion.div
      className={`card-minimal space-y-3 border-l-4 border-${categoryColors[activity.category]}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      draggable
      onDragStart={(e) => handleDragStart(e, day, activity.id)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, day, index)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-dark-text">{activity.activity}</h4>
            <div
              className={`w-2 h-2 rounded-full bg-${categoryColors[activity.category]}`}
            />
          </div>
          <div className="text-sm text-dark-text-muted">
            {activity.startTime} - {activity.endTime}
          </div>
          {activity.description && (
            <div className="text-xs text-dark-text-muted mt-1">
              {activity.description}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setEditingActivity(activity.id)}
            className="p-1 text-dark-text-muted hover:text-accent-blue transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => duplicateActivity(day, activity.id)}
            className="p-1 text-dark-text-muted hover:text-accent-green transition-colors"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => deleteActivity(day, activity.id)}
            className="p-1 text-dark-text-muted hover:text-accent-red transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <div className="cursor-move p-1 text-dark-text-muted">
            <Move size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const fadeInUp = useMemo(
    () => ({
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: {
        duration: 0.2,
        ease: "easeOut",
        delay: animationStateRef.current.hasAnimated ? 0 : 0.1,
      },
    }),
    [],
  );

  // Animation state manager
  const getAnimationProps = useCallback((baseProps) => {
    if (animationStateRef.current.isAnimating || !mountedRef.current) {
      return {
        initial: baseProps.animate,
        animate: baseProps.animate,
        transition: { duration: 0 },
      };
    }

    if (!animationStateRef.current.hasAnimated) {
      animationStateRef.current.hasAnimated = true;
      animationStateRef.current.isAnimating = true;
      setTimeout(() => {
        if (mountedRef.current) {
          animationStateRef.current.isAnimating = false;
        }
      }, 200);
    }

    return baseProps;
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg pb-24 pt-8">
      <motion.div
        className="container-dashboard space-y-6"
        {...getAnimationProps({ initial: "initial", animate: "animate" })}
      >
        {/* Header */}
        <motion.div
          {...getAnimationProps(fadeInUp)}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-display font-bold flex items-center justify-center space-x-3">
            <Calendar className="text-accent-purple" size={32} />
            <span className="text-accent-blue">AI Schedule</span>
          </h1>
          <p className="text-dark-text-secondary">
            Let AI generate your perfect weekly schedule
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div {...getAnimationProps(fadeInUp)} className="flex space-x-3">
          <MagneticButton
            variant="primary"
            onClick={() => navigate("/schedule/generate")}
            className="flex-1"
          >
            <Brain size={16} />
            <span>Generate Schedule</span>
          </MagneticButton>

          <MagneticButton variant="ghost" onClick={() => setShowSettings(true)}>
            <Settings size={16} />
          </MagneticButton>
        </motion.div>

        {/* Day Selector */}
        <motion.div
          {...getAnimationProps(fadeInUp)}
          className="flex space-x-1 p-1 bg-dark-surface rounded-lg overflow-x-auto"
        >
          {daysOfWeek.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex-shrink-0 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedDay === day.key
                  ? "bg-accent-blue text-white"
                  : "text-dark-text-muted hover:text-dark-text"
              }`}
            >
              {day.label}
            </button>
          ))}
        </motion.div>

        {/* Schedule Display */}
        <motion.div {...getAnimationProps(fadeInUp)} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display capitalize">
              {daysOfWeek.find((d) => d.key === selectedDay)?.full}
            </h3>
            <MagneticButton
              variant="ghost"
              size="sm"
              onClick={() => addActivity(selectedDay)}
            >
              <Plus size={16} />
              <span>Add Activity</span>
            </MagneticButton>
          </div>

          <div
            className="space-y-3 min-h-[200px] p-4 border-2 border-dashed border-dark-border rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, selectedDay)}
          >
            {schedule[selectedDay]?.length > 0 ? (
              schedule[selectedDay].map((activity, index) => (
                <ActivityBlock
                  key={activity.id}
                  day={selectedDay}
                  activity={activity}
                  index={index}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-dark-text-muted mb-3" />
                <p className="text-dark-text-muted">
                  No activities scheduled for this day
                </p>
                <p className="text-sm text-dark-text-muted mt-1">
                  Generate a schedule or add activities manually
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Week Overview */}
        {Object.keys(schedule).length > 0 && (
          <motion.div
            {...getAnimationProps(fadeInUp)}
            className="card space-y-6"
            onFocus={() => setKeyboardNavigationEnabled(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setKeyboardNavigationEnabled(false);
              }
            }}
            tabIndex={0}
            role="region"
            aria-label="Weekly schedule overview with keyboard navigation"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display">Week Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-dark-text-muted">
                <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                <span>Focus flow</span>
                {keyboardNavigationEnabled && (
                  <motion.div
                    className="px-2 py-1 rounded-md bg-accent-blue/20 border border-accent-blue/30 text-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    ← → Navigate • Enter Add • Esc Exit
                  </motion.div>
                )}
              </div>
            </div>

            {/* Interactive Day Cards */}
            <div className="grid grid-cols-7 gap-3">
              {daysOfWeek.map((day) => {
                const dayActivities = schedule[day.key] || [];
                const totalHours = useMemo(
                  () =>
                    dayActivities.reduce(
                      (sum, activity) => sum + (activity.duration || 60),
                      0,
                    ) / 60,
                  [dayActivities],
                );

                const categoryBreakdown = useMemo(
                  () =>
                    dayActivities.reduce((acc, activity) => {
                      const category = activity.category || "personal";
                      const hours = (activity.duration || 60) / 60;
                      acc[category] = (acc[category] || 0) + hours;
                      return acc;
                    }, {}),
                  [dayActivities],
                );

                const maxHours = useMemo(
                  () =>
                    Math.max(
                      ...daysOfWeek.map((d) => {
                        const activities = schedule[d.key] || [];
                        return (
                          activities.reduce(
                            (sum, activity) => sum + (activity.duration || 60),
                            0,
                          ) / 60
                        );
                      }),
                      1,
                    ),
                  [schedule],
                );

                const intensity = totalHours / maxHours;
                const isSelected = selectedDay === day.key;

                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className={`group relative p-3 rounded-xl border-2 transition-all duration-200 text-left overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent-blue/50 ${
                      isSelected
                        ? "border-accent-blue bg-accent-blue/10"
                        : "border-dark-border hover:border-dark-border-light bg-dark-surface/50 hover:bg-dark-surface"
                    }`}
                    aria-label={`View ${day.full} schedule. ${dayActivities.length} activities, ${totalHours.toFixed(1)} hours total`}
                    title={`${day.full} - ${dayActivities.length} activities (${totalHours.toFixed(1)}h)`}
                  >
                    {/* Background intensity indicator */}
                    {totalHours > 0 && (
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          intensity > 0.7
                            ? "bg-accent-red/20 opacity-70"
                            : intensity > 0.4
                              ? "bg-accent-blue/15 opacity-50"
                              : "bg-accent-green/15 opacity-30"
                        }`}
                      />
                    )}

                    {/* Day label */}
                    <div
                      className={`relative text-xs font-medium mb-2 transition-colors duration-200 ${
                        isSelected
                          ? "text-accent-blue"
                          : "text-dark-text-muted group-hover:text-dark-text"
                      }`}
                    >
                      {day.label}
                      {dayActivities.length === 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-dark-text-muted/30 rounded-full" />
                      )}
                    </div>

                    {/* Activity count and hours */}
                    <div className="relative mb-3">
                      <div
                        className={`text-sm font-semibold transition-colors duration-200 ${
                          isSelected ? "text-white" : "text-dark-text"
                        }`}
                      >
                        {dayActivities.length}
                        <span className="text-xs ml-1 opacity-60">
                          {dayActivities.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                      <div
                        className={`text-xs transition-colors duration-200 ${
                          isSelected
                            ? "text-accent-blue/80"
                            : "text-dark-text-muted"
                        }`}
                      >
                        {totalHours > 0
                          ? `${totalHours.toFixed(1)}h scheduled`
                          : "Available"}
                      </div>
                    </div>

                    {/* Mini progress bar */}
                    {totalHours > 0 && (
                      <div className="relative mb-3">
                        <div className="w-full h-1.5 bg-dark-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              intensity > 0.7
                                ? "bg-accent-orange"
                                : intensity > 0.4
                                  ? "bg-accent-blue"
                                  : "bg-accent-green"
                            }`}
                            style={{ width: `${intensity * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Category badges */}
                    {Object.keys(categoryBreakdown).length > 0 && (
                      <div className="relative flex flex-wrap gap-1">
                        {Object.entries(categoryBreakdown)
                          .slice(0, 2)
                          .map(([category, hours]) => (
                            <div
                              key={category}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs bg-${categoryColors[category]}/20 border border-${categoryColors[category]}/30 transition-colors duration-200`}
                              title={`${category}: ${hours.toFixed(1)} hours`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full bg-${categoryColors[category]}`}
                              />
                              <span
                                className={`text-${categoryColors[category]} font-medium`}
                              >
                                {hours.toFixed(1)}h
                              </span>
                            </div>
                          ))}
                        {Object.keys(categoryBreakdown).length > 2 && (
                          <div
                            className="flex items-center justify-center w-5 h-5 rounded-full bg-dark-surface text-xs text-dark-text-muted font-medium border border-dark-border transition-colors duration-200 cursor-help"
                            title={`${Object.keys(categoryBreakdown).length - 2} more categories`}
                          >
                            +{Object.keys(categoryBreakdown).length - 2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty state indicator */}
                    {dayActivities.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-xs text-dark-text-muted bg-dark-bg/80 backdrop-blur-sm px-2 py-1 rounded-md">
                          Click to add activities
                        </div>
                      </div>
                    )}

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-blue rounded-full shadow-lg" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Weekly Balance Insights */}
            <div className="space-y-4 pt-4 border-t border-dark-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-dark-text">
                    Weekly Balance
                  </h4>
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-accent-blue"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <motion.div
                  className="text-xs text-dark-text-muted px-2 py-1 rounded-md bg-dark-surface/50"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  title="Total scheduled activities across all days"
                >
                  {Object.values(schedule).flat().length} activities
                </motion.div>
              </div>

              {/* Category distribution */}
              <div className="space-y-2">
                {Object.entries(
                  ["work", "learning", "fitness", "rest", "personal"].reduce(
                    (acc, category) => {
                      const totalHours =
                        Object.values(schedule)
                          .flat()
                          .filter((activity) => activity.category === category)
                          .reduce(
                            (sum, activity) => sum + (activity.duration || 60),
                            0,
                          ) / 60;
                      if (totalHours > 0) acc[category] = totalHours;
                      return acc;
                    },
                    {},
                  ),
                ).map(([category, hours]) => {
                  const maxCategoryHours = Math.max(
                    ...Object.values(
                      [
                        "work",
                        "learning",
                        "fitness",
                        "rest",
                        "personal",
                      ].reduce((acc, cat) => {
                        const totalHours =
                          Object.values(schedule)
                            .flat()
                            .filter((activity) => activity.category === cat)
                            .reduce(
                              (sum, activity) =>
                                sum + (activity.duration || 60),
                              0,
                            ) / 60;
                        if (totalHours > 0) acc[cat] = totalHours;
                        return acc;
                      }, {}),
                    ),
                    1,
                  );

                  return (
                    <div key={category} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 min-w-[80px]">
                        <div
                          className={`w-2 h-2 rounded-full bg-${categoryColors[category]}`}
                        />
                        <span className="text-xs text-dark-text-muted capitalize">
                          {category}
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-dark-surface rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-${categoryColors[category]} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(hours / maxCategoryHours) * 100}%`,
                          }}
                          transition={{
                            delay: 0.4,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                      <span className="text-xs text-dark-text font-medium min-w-[40px] text-right">
                        {hours.toFixed(1)}h
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Energy flow indicator */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="flex space-x-1 p-2 rounded-lg bg-dark-surface/30"
                    title="Weekly intensity visualization"
                  >
                    {[...Array(7)].map((_, i) => {
                      const dayKey = daysOfWeek[i].key;
                      const dayActivities = schedule[dayKey] || [];
                      const intensity =
                        dayActivities.length > 0
                          ? Math.min(
                              dayActivities.reduce(
                                (sum, activity) =>
                                  sum + (activity.duration || 60),
                                0,
                              ) /
                                60 /
                                8,
                              1,
                            )
                          : 0;

                      return (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full cursor-pointer transition-all duration-200 hover:w-2 ${
                            intensity > 0.7
                              ? "bg-accent-red"
                              : intensity > 0.4
                                ? "bg-accent-blue"
                                : intensity > 0.1
                                  ? "bg-accent-green"
                                  : "bg-dark-border"
                          }`}
                          style={{ height: `${Math.max(intensity * 20, 4)}px` }}
                          onClick={() => setSelectedDay(daysOfWeek[i].key)}
                          title={`${daysOfWeek[i].full}: ${(intensity * 8).toFixed(1)}h intensity`}
                        />
                      );
                    })}
                  </div>
                  <motion.span
                    className="text-xs text-dark-text-muted ml-3"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Energy flow
                  </motion.span>
                </div>
                <motion.div
                  className="text-xs text-dark-text-muted px-2 py-1 rounded-md border border-dark-border/30 bg-dark-surface/20"
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.2)",
                  }}
                  title="Use arrow keys to navigate between days when focused"
                >
                  ⌨️ Keyboard navigation
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-display mb-4">AI Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-text-secondary mb-1">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="input-primary"
                    placeholder="sk-..."
                  />
                  <div className="text-xs text-dark-text-muted mt-1">
                    Your API key is stored locally and never shared
                  </div>
                </div>

                {!apiKey && (
                  <div className="flex items-center space-x-2 p-3 bg-accent-orange/20 rounded-lg">
                    <AlertCircle className="text-accent-orange" size={16} />
                    <div className="text-sm text-accent-orange">
                      API key required for AI features
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <MagneticButton
                  variant="primary"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                >
                  <Check size={16} />
                  <span>Save</span>
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Editor */}
      <AnimatePresence>
        {editingActivity && (
          <ActivityEditor
            day={selectedDay}
            activity={schedule[selectedDay]?.find(
              (a) => a.id === editingActivity,
            )}
            onSave={() => setEditingActivity(null)}
            onCancel={() => setEditingActivity(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;

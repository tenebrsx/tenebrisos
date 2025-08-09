import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Zap,
  Coffee,
  BookOpen,
  Dumbbell,
  Settings,
  User,
  Bell,
  Brain,
  Lightbulb,
  Activity,
  TrendingUp,
  Star,
  Command,
  Wifi,
  Battery,
  Volume2,
  Sun,
  Cloud,
  Moon,
} from "lucide-react";
import MagneticButton from "../components/MagneticButton";
import StatusIndicator from "../components/StatusIndicator";
import TimeTracker from "../components/TimeTracker";
import WidgetSystem from "../components/widgets/WidgetSystem";
import RetroButton, { RetroStartButton } from "../components/RetroButton";
import RetroWindow from "../components/RetroWindow";
import {
  createOpenAIService,
  createIntelligentOpenAIService,
} from "../services/openai.js";
import { createAILearningEngine } from "../services/aiLearningEngine.js";
import {
  formatTime,
  saveToStorage,
  loadFromStorage,
} from "../utils/helpers.js";

const Home = () => {
  const navigate = useNavigate();
  const {
    settings,
    showNotification,
    playSound,
    scheduleActivityReminder,
    scheduleBreakReminder,
    trackEvent,
    getActiveTheme,
  } = useSettings();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentActivity, setCurrentActivity] = useState(null);
  const [nextActivity, setNextActivity] = useState(null);
  const [scheduledActivity, setScheduledActivity] = useState(null);
  const [showActivityPrompt, setShowActivityPrompt] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternativeActivities, setAlternativeActivities] = useState([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [activities, setActivities] = useState(() => {
    return loadFromStorage("activities", []);
  });
  const [schedule, setSchedule] = useState(() => {
    return loadFromStorage("schedule", {});
  });

  // AI & Intelligence
  const [aiEngine] = useState(() => createAILearningEngine());
  const [intelligentService] = useState(() => createIntelligentOpenAIService());
  const [userInsights, setUserInsights] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Dashboard state
  const [systemStats, setSystemStats] = useState({
    battery: 85,
    wifi: true,
    volume: 70,
    weather: { temp: 72, condition: "sunny" },
  });
  const [dashboardLayout, setDashboardLayout] = useState("grid");
  const [expandedPanels, setExpandedPanels] = useState({
    focus: true,
    metrics: true,
    intelligence: true,
    stream: true,
  });
  const [showWidgetDashboard, setShowWidgetDashboard] = useState(true);

  // AI Suggested Actions state
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [lastSuggestionUpdate, setLastSuggestionUpdate] = useState(null);

  // Widget system integration
  const [widgets] = useState(() => {
    try {
      return (
        loadFromStorage("homepage-widgets", [
          {
            id: "quote",
            type: "quote",
            position: 0,
            visible: true,
            size: "small",
          },
          {
            id: "todos-today",
            type: "todos-today",
            position: 1,
            visible: true,
            size: "medium",
          },
          {
            id: "notes",
            type: "notes",
            position: 2,
            visible: true,
            size: "medium",
          },
          {
            id: "stats",
            type: "stats",
            position: 3,
            visible: true,
            size: "small",
          },
        ]) || []
      );
    } catch (error) {
      return [];
    }
  });

  const visibleWidgetCount = widgets.filter((w) => w.visible).length;

  // Activity patterns and suggestions
  const getActivityPatterns = () => {
    const today = new Date();
    const pastWeek = activities.filter((activity) => {
      const activityDate = new Date(activity.startTime);
      const daysDiff = (today - activityDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7 && !activity.isActive;
    });

    return {
      frequent: pastWeek.reduce((acc, activity) => {
        acc[activity.name] = (acc[activity.name] || 0) + 1;
        return acc;
      }, {}),
      recent: pastWeek.slice(-5),
      totalTime: pastWeek.reduce(
        (acc, activity) => acc + (activity.duration || 0),
        0,
      ),
      averageSession:
        pastWeek.length > 0
          ? pastWeek.reduce(
              (acc, activity) => acc + (activity.duration || 0),
              0,
            ) / pastWeek.length
          : 0,
    };
  };

  const getSmartSuggestions = () => {
    const patterns = getActivityPatterns();
    const now = new Date();
    const currentHour = now.getHours();

    const baseActivities = [
      {
        id: "focus",
        label: "Deep Focus",
        icon: Zap,
        color: "accent-purple",
        duration: 90,
        description: "Enter deep work mode",
        pattern: "hexagon",
      },
      {
        id: "learn",
        label: "Learning",
        icon: BookOpen,
        color: "accent-blue",
        duration: 60,
        description: "Expand your knowledge",
        pattern: "network",
      },
      {
        id: "move",
        label: "Movement",
        icon: "🏃‍♂️",
        color: "accent-green",
        duration: 30,
        description: "Physical activity",
        pattern: "arrows",
      },
      {
        id: "create",
        label: "Create",
        icon: "✨",
        color: "accent-orange",
        duration: 45,
        description: "Build something new",
        pattern: "stars",
      },
    ];

    return baseActivities.map((activity) => ({
      ...activity,
      score: Math.random() * 10,
      suggested: currentHour >= 9 && currentHour <= 17,
    }));
  };

  const quickActions = useMemo(
    () => getSmartSuggestions(),
    [activities, currentTime],
  );

  // Event handlers
  const handleStartActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      name: activity.label,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      type: activity.id,
      isActive: true,
      isPaused: false,
      category: activity.id,
      plannedDuration: activity.duration,
    };

    setCurrentActivity(newActivity);
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      saveToStorage("activities", updated);
      window.dispatchEvent(new CustomEvent("activityUpdated"));
      return updated;
    });

    showNotification("Focus Session Started", `Beginning ${activity.label}`, {
      tag: "activity-start",
    });
  };

  const handleStopActivity = () => {
    if (currentActivity) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime - new Date(currentActivity.startTime)) / 1000 / 60,
      );

      const updatedActivity = {
        ...currentActivity,
        endTime,
        duration,
        isActive: false,
      };

      setActivities((prev) => {
        const updated = prev.map((activity) =>
          activity.id === currentActivity.id ? updatedActivity : activity,
        );
        saveToStorage("activities", updated);
        window.dispatchEvent(new CustomEvent("activityUpdated"));
        return updated;
      });
      setCurrentActivity(null);

      playSound("completion");
      showNotification(
        "Session Complete",
        `Completed ${currentActivity.name} • ${Math.floor(duration / 60)}h ${duration % 60}m`,
        { tag: "activity-complete" },
      );
    }
  };

  const handlePauseActivity = () => {
    if (currentActivity) {
      const updatedActivity = {
        ...currentActivity,
        isPaused: !currentActivity.isPaused,
      };

      setCurrentActivity(updatedActivity);
      setActivities((prev) => {
        const updated = prev.map((activity) =>
          activity.id === currentActivity.id ? updatedActivity : activity,
        );
        saveToStorage("activities", updated);
        return updated;
      });
    }
  };

  const getTimeElapsed = () => {
    if (!currentActivity) return 0;
    const now = new Date();
    return Math.floor((now - new Date(currentActivity.startTime)) / 1000 / 60);
  };

  const getTodayActivities = () => {
    const today = new Date().toDateString();
    return activities.filter(
      (activity) =>
        new Date(activity.startTime).toDateString() === today &&
        !activity.isActive,
    );
  };

  const getTodayStats = () => {
    const todayActivities = getTodayActivities();
    const totalMinutes = todayActivities.reduce(
      (acc, activity) => acc + (activity.duration || 0),
      0,
    );

    return {
      sessions: todayActivities.length,
      totalTime: totalMinutes,
      avgSession:
        todayActivities.length > 0 ? totalMinutes / todayActivities.length : 0,
      focusTime: todayActivities
        .filter(
          (a) =>
            a.name.toLowerCase().includes("focus") ||
            a.name.toLowerCase().includes("work"),
        )
        .reduce((acc, activity) => acc + (activity.duration || 0), 0),
    };
  };

  // Generate AI-powered suggested actions based on user patterns and context
  const generateSuggestedActions = async () => {
    if (loadingSuggestions) return;

    setLoadingSuggestions(true);
    setLastSuggestionUpdate(new Date());

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();
      const patterns = getActivityPatterns();

      // Get user context from AI learning engine
      const userState = aiEngine.getCurrentUserState();
      const insights = aiEngine.getUserInsights();

      // Determine time of day context
      let timeContext = "morning";
      if (currentHour >= 12 && currentHour < 17) timeContext = "afternoon";
      else if (currentHour >= 17) timeContext = "evening";

      // Determine energy/focus level based on time and patterns
      let energyLevel = "medium";
      if (currentHour >= 9 && currentHour <= 11) energyLevel = "high";
      else if (currentHour >= 14 && currentHour <= 16) energyLevel = "high";
      else if (currentHour >= 20) energyLevel = "low";

      // Get recent activity trends
      const recentActivities = activities.slice(0, 10);
      const lastActivity = recentActivities[0];

      // Base suggestions pool with context-aware weighting
      const baseSuggestions = [
        {
          id: "focus-deep",
          label: "Deep Focus Session",
          description: "90-minute focused work block",
          duration: 90,
          icon: Brain,
          color: "accent-purple",
          category: "productivity",
          timePreference: [9, 10, 11, 14, 15, 16],
          energyLevel: ["high"],
          reasoning: "Perfect for complex tasks requiring sustained attention",
        },
        {
          id: "quick-movement",
          label: "Quick Movement",
          description: "Short energizing exercise",
          duration: 15,
          icon: "🚶‍♂️",
          color: "accent-green",
          category: "fitness",
          timePreference: [8, 12, 16, 18],
          energyLevel: ["medium", "low"],
          reasoning: "Boost energy and improve focus",
        },
        {
          id: "creative-break",
          label: "Creative Break",
          description: "Spark inspiration and new ideas",
          duration: 20,
          icon: "🎨",
          color: "accent-orange",
          category: "creative",
          timePreference: [10, 14, 19],
          energyLevel: ["medium", "high"],
          reasoning: "Change mental context and stimulate creativity",
        },
        {
          id: "mindful-moment",
          label: "Mindful Moment",
          description: "Brief meditation or breathing",
          duration: 10,
          icon: "🧘‍♂️",
          color: "accent-blue",
          category: "wellness",
          timePreference: [7, 12, 17, 21],
          energyLevel: ["low", "medium"],
          reasoning: "Reset mental state and reduce stress",
        },
        {
          id: "skill-building",
          label: "Skill Building",
          description: "Learn something new",
          duration: 45,
          icon: BookOpen,
          color: "accent-blue",
          category: "learning",
          timePreference: [9, 10, 14, 15, 19, 20],
          energyLevel: ["medium", "high"],
          reasoning: "Continuous improvement and growth",
        },
        {
          id: "organize-space",
          label: "Organize Space",
          description: "Tidy up your environment",
          duration: 25,
          icon: "🗂️",
          color: "accent-green",
          category: "organization",
          timePreference: [8, 13, 17],
          energyLevel: ["medium"],
          reasoning: "Clear space leads to clear mind",
        },
        {
          id: "social-connect",
          label: "Social Connection",
          description: "Reach out to someone you care about",
          duration: 30,
          icon: "💬",
          color: "accent-purple",
          category: "social",
          timePreference: [11, 13, 16, 19],
          energyLevel: ["medium", "high"],
          reasoning: "Strengthen relationships and boost mood",
        },
        {
          id: "reflection-time",
          label: "Reflection Time",
          description: "Journal or review your progress",
          duration: 20,
          icon: "📝",
          color: "accent-orange",
          category: "reflection",
          timePreference: [8, 18, 20, 21],
          energyLevel: ["low", "medium"],
          reasoning: "Process thoughts and plan ahead",
        },
      ];

      // Score suggestions based on context
      const scoredSuggestions = baseSuggestions.map((suggestion) => {
        let score = 0;

        // Time-based scoring
        if (suggestion.timePreference.includes(currentHour)) score += 3;

        // Energy level match
        if (suggestion.energyLevel.includes(energyLevel)) score += 2;

        // Avoid recent duplicates
        const hasRecentSimilar = recentActivities.some((activity) =>
          activity.name
            .toLowerCase()
            .includes(suggestion.label.toLowerCase().split(" ")[0]),
        );
        if (hasRecentSimilar) score -= 2;

        // User pattern analysis
        const userFrequency = patterns.frequent[suggestion.label] || 0;
        score += Math.min(userFrequency * 0.5, 2);

        // Balance different categories
        const categoryCount = recentActivities.filter(
          (activity) => activity.category === suggestion.category,
        ).length;
        if (categoryCount > 3) score -= 1;

        // Boost complementary activities
        if (lastActivity) {
          if (
            lastActivity.category === "productivity" &&
            suggestion.category === "wellness"
          )
            score += 1;
          if (
            lastActivity.category === "fitness" &&
            suggestion.category === "learning"
          )
            score += 1;
          if (lastActivity.duration > 60 && suggestion.duration <= 20)
            score += 1;
        }

        // Add some randomness for variety
        score += Math.random() * 0.5;

        return { ...suggestion, score, timeContext, energyLevel };
      });

      // Select top 4-6 suggestions
      const selectedSuggestions = scoredSuggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.random() > 0.5 ? 5 : 4)
        .map((suggestion) => ({
          ...suggestion,
          confidence: Math.min(0.9, Math.max(0.3, suggestion.score / 5)),
          timestamp: now.toISOString(),
        }));

      setSuggestedActions(selectedSuggestions);

      console.log("🎯 AI: Generated suggested actions", {
        count: selectedSuggestions.length,
        timeContext,
        energyLevel,
        avgConfidence:
          selectedSuggestions.reduce((acc, s) => acc + s.confidence, 0) /
          selectedSuggestions.length,
      });
    } catch (error) {
      console.error("Error generating suggested actions:", error);

      // Fallback suggestions
      setSuggestedActions([
        {
          id: "fallback-1",
          label: "Take a Break",
          description: "Step away and recharge",
          duration: 15,
          icon: Coffee,
          color: "accent-green",
          reasoning: "Sometimes the best thing is to pause",
          confidence: 0.8,
        },
        {
          id: "fallback-2",
          label: "Quick Focus",
          description: "25-minute focused session",
          duration: 25,
          icon: Target,
          color: "accent-blue",
          reasoning: "Short, achievable productivity boost",
          confidence: 0.7,
        },
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshActivities = () => {
      const latestActivities = loadFromStorage("activities", []);
      setActivities(latestActivities);

      const activeActivity = latestActivities.find((a) => a.isActive);
      setCurrentActivity(activeActivity || null);
    };

    window.addEventListener("activityUpdated", refreshActivities);
    refreshActivities();

    return () =>
      window.removeEventListener("activityUpdated", refreshActivities);
  }, []);

  useEffect(() => {
    setUserInsights(aiEngine.getUserInsights());

    // Generate suggestions when activities change or every 30 minutes
    const now = new Date();
    const shouldUpdate =
      !lastSuggestionUpdate || now - lastSuggestionUpdate > 30 * 60 * 1000; // 30 minutes

    if (shouldUpdate && activities.length > 0) {
      generateSuggestedActions();
    }
  }, [activities]);

  // Generate initial suggestions on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestedActions();
    }, 2000); // Wait 2 seconds after mount

    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const stats = getTodayStats();
  const isRetroTheme = getActiveTheme() === "retro";

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Dashboard Header - Command Center Style */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* System Identity */}
          <div className="flex items-center space-x-6">
            {isRetroTheme ? (
              /* Retro Start Button Style */
              <RetroStartButton onClick={() => navigate("/")}>
                TENEBRIS
              </RetroStartButton>
            ) : (
              <motion.div
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold">T</span>
                </div>
                <div>
                  <h1 className="font-display font-bold text-lg leading-none">
                    TENEBRIS
                  </h1>
                  <p className="text-xs text-dark-text-muted leading-none">
                    Personal OS
                  </p>
                </div>
              </motion.div>
            )}

            {/* Current Time & Date */}
            <div className="hidden md:block text-sm">
              <div className="font-mono font-medium">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-dark-text-muted">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center space-x-4">
            {/* AI Status */}
            {userInsights && userInsights.confidence > 0.3 && (
              <motion.button
                onClick={() => setShowAIInsights(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/20 hover:bg-accent-purple/20 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Brain size={14} />
                <span className="text-xs font-medium">
                  {(userInsights.confidence * 100).toFixed(0)}%
                </span>
              </motion.button>
            )}

            {/* System Stats */}
            <div className="hidden lg:flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1">
                <Wifi
                  size={14}
                  className={
                    systemStats.wifi ? "text-accent-green" : "text-accent-red"
                  }
                />
                <span className="text-dark-text-muted">Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <Battery size={14} className="text-accent-blue" />
                <span className="text-dark-text-muted">
                  {systemStats.battery}%
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {systemStats.weather.condition === "sunny" ? (
                  <Sun size={14} className="text-accent-orange" />
                ) : (
                  <Cloud size={14} className="text-dark-text-muted" />
                )}
                <span className="text-dark-text-muted">
                  {systemStats.weather.temp}°
                </span>
              </div>
            </div>

            {/* User Controls */}
            <div className="flex items-center space-x-2">
              {isRetroTheme ? (
                <>
                  <RetroButton
                    size="sm"
                    onClick={() => navigate("/profile")}
                    icon={User}
                  >
                    Profile
                  </RetroButton>
                  <RetroButton
                    size="sm"
                    onClick={() => navigate("/settings")}
                    icon={Settings}
                  >
                    Settings
                  </RetroButton>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate("/profile")}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <User size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => navigate("/settings")}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Settings size={16} />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard Layout */}
      <motion.main
        className="pt-20 p-6 grid grid-cols-12 gap-6 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Panel - Quick Actions & Controls */}
        <motion.aside
          className="col-span-12 lg:col-span-3 space-y-6"
          variants={panelVariants}
        >
          {/* Quick Command Panel */}
          {isRetroTheme ? (
            <RetroWindow
              title="Quick Actions"
              width="100%"
              height="auto"
              x={0}
              y={0}
              resizable={false}
              minimizable={false}
              maximizable={false}
              closeable={false}
              icon="⚡"
              className="relative"
            >
              <div className="space-y-2">
                {quickActions.slice(0, 4).map((action, index) => (
                  <RetroButton
                    key={action.id}
                    onClick={() => handleStartActivity(action)}
                    variant="default"
                    size="md"
                    icon={typeof action.icon === "string" ? null : action.icon}
                    className="w-full justify-start"
                  >
                    {typeof action.icon === "string" && (
                      <span className="text-sm mr-2">{action.icon}</span>
                    )}
                    {action.label} ({action.duration}m)
                  </RetroButton>
                ))}
              </div>
            </RetroWindow>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-display font-semibold mb-4 flex items-center space-x-2">
                <Command size={16} />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                {quickActions.slice(0, 4).map((action, index) => (
                  <motion.button
                    key={action.id}
                    onClick={() => handleStartActivity(action)}
                    className="w-full p-3 rounded-xl bg-dark-surface/30 border border-white/10 hover:border-white/20 hover:bg-dark-surface/50 transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-${action.color}/20 flex items-center justify-center`}
                      >
                        {typeof action.icon === "string" ? (
                          <span className="text-sm">{action.icon}</span>
                        ) : (
                          <action.icon
                            size={16}
                            className={`text-${action.color}`}
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {action.label}
                        </div>
                        <div className="text-xs text-dark-text-muted">
                          {action.duration}m
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Live Metrics */}
          {isRetroTheme ? (
            <RetroWindow
              title="Today's Metrics"
              width="100%"
              height="auto"
              x={0}
              y={0}
              resizable={false}
              minimizable={false}
              maximizable={false}
              closeable={false}
              icon="📊"
              className="relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-100 border border-gray-300">
                  <span className="text-sm text-black">Sessions</span>
                  <span className="font-bold text-blue-600">
                    {stats.sessions}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-100 border border-gray-300">
                  <span className="text-sm text-black">Focus Time</span>
                  <span className="font-bold text-blue-600">
                    {Math.floor(stats.focusTime / 60)}h {stats.focusTime % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-100 border border-gray-300">
                  <span className="text-sm text-black">Total Time</span>
                  <span className="font-bold text-blue-600">
                    {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-100 border border-gray-300">
                  <span className="text-sm text-black">Avg Session</span>
                  <span className="font-bold text-blue-600">
                    {Math.floor(stats.avgSession)}m
                  </span>
                </div>
              </div>
            </RetroWindow>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-display font-semibold mb-4 flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Today's Metrics</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-text-muted">Sessions</span>
                  <span className="font-bold text-accent-green">
                    {stats.sessions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-text-muted">
                    Focus Time
                  </span>
                  <span className="font-bold text-accent-blue">
                    {Math.floor(stats.focusTime / 60)}h {stats.focusTime % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-text-muted">
                    Total Time
                  </span>
                  <span className="font-bold text-accent-purple">
                    {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-text-muted">
                    Avg Session
                  </span>
                  <span className="font-bold text-accent-orange">
                    {Math.floor(stats.avgSession)}m
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggested Actions */}
          {!currentActivity && suggestedActions.length > 0 && (
            <motion.div
              className="space-y-4"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
            >
              {isRetroTheme ? (
                <RetroWindow
                  title="Suggested Actions"
                  width="100%"
                  height="auto"
                  x={0}
                  y={0}
                  resizable={false}
                  minimizable={false}
                  maximizable={false}
                  closeable={false}
                  icon="💡"
                  className="relative"
                >
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-3">
                      AI recommendations based on your patterns and current
                      context
                    </div>
                    {loadingSuggestions ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-xs">
                          Analyzing your patterns...
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {suggestedActions
                          .slice(0, 3)
                          .map((suggestion, index) => (
                            <RetroButton
                              key={suggestion.id}
                              onClick={() =>
                                handleStartActivity({
                                  label: suggestion.label,
                                  id: suggestion.category,
                                  duration: suggestion.duration,
                                })
                              }
                              variant="default"
                              size="sm"
                              className="w-full justify-start text-left"
                            >
                              <div className="flex items-center space-x-2">
                                {typeof suggestion.icon === "string" ? (
                                  <span className="text-xs">
                                    {suggestion.icon}
                                  </span>
                                ) : (
                                  <suggestion.icon size={12} />
                                )}
                                <div>
                                  <div className="font-medium text-xs">
                                    {suggestion.label}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {suggestion.duration}m
                                  </div>
                                </div>
                              </div>
                            </RetroButton>
                          ))}
                        <RetroButton
                          variant="default"
                          size="sm"
                          onClick={generateSuggestedActions}
                          className="w-full"
                        >
                          🔄 Refresh Suggestions
                        </RetroButton>
                      </div>
                    )}
                  </div>
                </RetroWindow>
              ) : (
                <div className="glass rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold flex items-center space-x-2">
                      <Lightbulb size={16} className="text-accent-orange" />
                      <span>Suggested Actions</span>
                    </h3>
                    <motion.button
                      onClick={generateSuggestedActions}
                      disabled={loadingSuggestions}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors text-dark-text-muted hover:text-dark-text disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      title="Refresh suggestions"
                    >
                      <motion.div
                        animate={loadingSuggestions ? { rotate: 360 } : {}}
                        transition={{
                          duration: 1,
                          repeat: loadingSuggestions ? Infinity : 0,
                        }}
                      >
                        🔄
                      </motion.div>
                    </motion.button>
                  </div>

                  {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <motion.div
                          className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full mx-auto mb-3"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <p className="text-sm text-dark-text-muted">
                          Analyzing your patterns and generating personalized
                          suggestions...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-dark-text-muted mb-4">
                        AI recommendations based on your activity patterns,
                        current time, and energy levels
                      </p>

                      {suggestedActions.slice(0, 4).map((suggestion, index) => (
                        <motion.button
                          key={suggestion.id}
                          onClick={() =>
                            handleStartActivity({
                              label: suggestion.label,
                              id: suggestion.category,
                              duration: suggestion.duration,
                            })
                          }
                          className="w-full p-3 rounded-xl bg-dark-surface/20 border border-white/10 hover:border-white/20 hover:bg-dark-surface/30 transition-all text-left group"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-8 h-8 rounded-lg bg-${suggestion.color}/20 flex items-center justify-center flex-shrink-0`}
                            >
                              {typeof suggestion.icon === "string" ? (
                                <span className="text-sm">
                                  {suggestion.icon}
                                </span>
                              ) : (
                                <suggestion.icon
                                  size={16}
                                  className={`text-${suggestion.color}`}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-white truncate">
                                  {suggestion.label}
                                </h4>
                                <span className="text-xs text-dark-text-muted ml-2 flex-shrink-0">
                                  {suggestion.duration}m
                                </span>
                              </div>
                              <p className="text-xs text-dark-text-muted mt-1 leading-relaxed">
                                {suggestion.description}
                              </p>
                              {suggestion.reasoning && (
                                <p className="text-xs text-accent-blue/80 mt-1 italic">
                                  💡 {suggestion.reasoning}
                                </p>
                              )}
                              {suggestion.confidence && (
                                <div className="flex items-center mt-2">
                                  <div className="w-full bg-dark-border rounded-full h-1">
                                    <div
                                      className={`h-1 rounded-full bg-${suggestion.color}`}
                                      style={{
                                        width: `${suggestion.confidence * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-dark-text-muted ml-2">
                                    {Math.round(suggestion.confidence * 100)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {suggestedActions.length > 4 && (
                        <div className="text-center pt-2">
                          <button className="text-xs text-accent-blue hover:text-accent-blue/80 font-medium">
                            View {suggestedActions.length - 4} more suggestions
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </motion.aside>

        {/* Center Panel - Focus Command Center */}
        <motion.section
          className="col-span-12 lg:col-span-6 space-y-6"
          variants={panelVariants}
        >
          {/* Main Focus Panel */}
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentActivity ? (
                <motion.div
                  key="active"
                  className="p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Session Header */}
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <StatusIndicator
                      status={currentActivity.isPaused ? "paused" : "active"}
                      size="lg"
                      pulse={!currentActivity.isPaused}
                    />
                    <div>
                      <p className="text-sm font-medium text-accent-blue uppercase tracking-wider">
                        {currentActivity.isPaused ? "PAUSED" : "ACTIVE SESSION"}
                      </p>
                      <h2 className="text-2xl font-display font-bold">
                        {currentActivity.name}
                      </h2>
                    </div>
                  </div>

                  {/* Live Timer */}
                  <motion.div
                    className="mb-8"
                    key={getTimeElapsed()}
                    initial={{ scale: 1.02 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="text-6xl font-mono font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                      {Math.floor(getTimeElapsed() / 60)}h{" "}
                      {getTimeElapsed() % 60}m
                    </div>
                    <p className="text-dark-text-muted mt-2">
                      Started at{" "}
                      {formatTime(new Date(currentActivity.startTime))}
                    </p>
                  </motion.div>

                  {/* Session Controls */}
                  <div className="flex justify-center space-x-4">
                    {isRetroTheme ? (
                      <>
                        <RetroButton
                          variant="default"
                          size="lg"
                          onClick={handlePauseActivity}
                          icon={currentActivity.isPaused ? Play : Pause}
                        >
                          {currentActivity.isPaused ? "Resume" : "Pause"}
                        </RetroButton>
                        <RetroButton
                          variant="success"
                          size="lg"
                          onClick={handleStopActivity}
                          icon={Square}
                        >
                          Complete
                        </RetroButton>
                      </>
                    ) : (
                      <>
                        <MagneticButton
                          variant="outline"
                          size="lg"
                          onClick={handlePauseActivity}
                          className="flex items-center space-x-2"
                        >
                          {currentActivity.isPaused ? (
                            <Play size={20} />
                          ) : (
                            <Pause size={20} />
                          )}
                          <span>
                            {currentActivity.isPaused ? "Resume" : "Pause"}
                          </span>
                        </MagneticButton>
                        <MagneticButton
                          variant="primary"
                          size="lg"
                          onClick={handleStopActivity}
                          className="flex items-center space-x-2 bg-gradient-to-r from-accent-green to-accent-blue"
                        >
                          <Square size={20} />
                          <span>Complete</span>
                        </MagneticButton>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready"
                  className="p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-white/20 flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-2">
                      Ready for Focus
                    </h2>
                    <p className="text-dark-text-muted">
                      Your mind is clear. What would you like to accomplish?
                    </p>
                  </div>

                  <div className="flex justify-center">
                    {isRetroTheme ? (
                      <RetroButton
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/schedule")}
                        icon={Zap}
                      >
                        Start Session
                      </RetroButton>
                    ) : (
                      <MagneticButton
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/schedule")}
                        className="flex items-center space-x-2 bg-gradient-to-r from-accent-blue to-accent-purple"
                      >
                        <Zap size={20} />
                        <span>Start Session</span>
                      </MagneticButton>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Activity Stream */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="font-display font-semibold mb-4 flex items-center space-x-2">
              <Activity size={16} />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {getTodayActivities()
                .slice(0, 4)
                .map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-dark-surface/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-accent-blue" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.name}</span>
                        <span className="text-sm text-dark-text-muted">
                          {activity.duration}m
                        </span>
                      </div>
                      <p className="text-xs text-dark-text-muted">
                        {formatTime(new Date(activity.startTime))}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.section>

        {/* Right Panel - Intelligence & Widgets */}
        <motion.aside
          className="col-span-12 lg:col-span-3 space-y-6"
          variants={panelVariants}
        >
          {/* AI Intelligence Hub */}
          {userInsights && userInsights.confidence > 0.3 && (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h3 className="font-display font-semibold mb-4 flex items-center space-x-2">
                <Brain size={16} />
                <span>Tenebris Intelligence</span>
                <div className="ml-auto text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full">
                  {(userInsights.confidence * 100).toFixed(0)}%
                </div>
              </h3>
              <div className="space-y-3">
                {userInsights.insights.slice(0, 2).map((insight, index) => (
                  <div
                    key={index}
                    className="p-3 bg-dark-surface/20 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Lightbulb size={14} className="text-accent-blue" />
                      <span className="font-medium text-sm">
                        {insight.title}
                      </span>
                    </div>
                    <p className="text-xs text-dark-text-muted">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Widgets */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold flex items-center space-x-2">
                <Star size={16} />
                <span>Quick Info</span>
              </h3>
              <motion.button
                onClick={() => setShowWidgetDashboard(!showWidgetDashboard)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-dark-text-muted hover:text-accent-blue"
                whileHover={{ scale: 1.05 }}
                title={showWidgetDashboard ? "Hide widgets" : "Show widgets"}
              >
                {showWidgetDashboard ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </motion.button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-dark-surface/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Week Progress</span>
                  <span className="text-xs text-accent-green">67%</span>
                </div>
                <div className="w-full bg-dark-border rounded-full h-2">
                  <div className="w-2/3 h-2 bg-accent-green rounded-full" />
                </div>
              </div>

              <div className="p-3 bg-dark-surface/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Focus Streak</span>
                  <span className="text-accent-orange font-bold">5 days</span>
                </div>
              </div>

              <div className="p-3 bg-dark-surface/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Session</span>
                  <span className="text-accent-blue text-sm">Learning</span>
                </div>
              </div>

              <motion.button
                onClick={() => setShowWidgetDashboard(!showWidgetDashboard)}
                className={`w-full mt-3 p-3 rounded-lg transition-all text-left border ${
                  showWidgetDashboard
                    ? "bg-accent-purple/10 border-accent-purple/30 hover:bg-accent-purple/20"
                    : "bg-dark-surface/20 border-transparent hover:bg-dark-surface/30"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">
                      Widget Dashboard
                    </span>
                    <div className="text-xs text-dark-text-muted mt-1">
                      {visibleWidgetCount} active widgets
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium ${
                        showWidgetDashboard
                          ? "text-accent-purple"
                          : "text-dark-text-muted"
                      }`}
                    >
                      {showWidgetDashboard ? "Hide" : "Show"}
                    </span>
                    {showWidgetDashboard ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </motion.aside>
      </motion.main>

      {/* Personal Dashboard Widgets */}
      <AnimatePresence>
        {showWidgetDashboard && (
          <motion.section
            className="px-6 pb-6"
            variants={panelVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-display font-semibold text-white mb-2">
                      Personal Workspace
                    </h2>
                    <p className="text-dark-text-muted">
                      {visibleWidgetCount} active widgets • Customize your
                      productivity tools
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowWidgetDashboard(false)}
                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-dark-text-muted hover:text-dark-text"
                    whileHover={{ scale: 1.05 }}
                    title="Hide widget dashboard"
                  >
                    <ChevronUp size={20} />
                  </motion.button>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10">
                <WidgetSystem />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Custom Styles for Dashboard */}
      <style jsx>{`
        body {
          cursor:
            url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMyIgZmlsbD0iIzNiODJmNiIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iNSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+"),
            auto;
        }

        .glass {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
};

export default Home;

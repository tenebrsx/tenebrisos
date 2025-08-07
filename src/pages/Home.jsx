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
} from "lucide-react";
import MagneticButton from "../components/MagneticButton";
import StatusIndicator from "../components/StatusIndicator";
import TimeTracker from "../components/TimeTracker";
import WidgetSystem from "../components/widgets/WidgetSystem";
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
  } = useSettings();
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

  // AI Learning Engine - Tenebris knows you better than you know yourself
  const [aiEngine] = useState(() => createAILearningEngine());
  const [intelligentService] = useState(() => createIntelligentOpenAIService());
  const [userInsights, setUserInsights] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Today's Progress state
  const [collapsedSections, setCollapsedSections] = useState({
    morning: false,
    afternoon: false,
    evening: false,
  });

  // Manual entry state
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    duration: "",
    category: "personal",
  });

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
      category: getActivityCategory(activity.label),
      plannedDuration: activity.duration,
    };

    console.log("▶️ Home: Starting new activity", { activity: newActivity });

    // Learn from this activity start
    aiEngine.learnFromActivity(newActivity, {
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      context: aiEngine.inferCurrentContext(),
      source: "manual_start",
    });

    setCurrentActivity(newActivity);
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      saveToStorage("activities", updated);
      // Dispatch custom event to notify other components
      console.log("📡 Home: Dispatching activityUpdated event");
      window.dispatchEvent(new CustomEvent("activityUpdated"));
      return updated;
    });

    // Track event for analytics if enabled
    trackEvent("activity_started", {
      activityType: activity.id,
      duration: activity.duration,
    });

    // Schedule activity reminder if enabled
    if (settings?.notifications?.activityReminders) {
      scheduleActivityReminder(activity.label, activity.duration * 60000); // Convert minutes to ms
    }

    // Show notification
    showNotification("Activity Started", `Started ${activity.label} session`, {
      tag: "activity-start",
    });
  };

  const handleStopActivity = () => {
    if (currentActivity) {
      const endTime = new Date();
      const duration = Math.floor(
        (endTime - new Date(currentActivity.startTime)) / 1000 / 60,
      ); // minutes

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

      // Play completion sound and show notification
      playSound("completion");
      showNotification(
        "Activity Completed",
        `Completed ${currentActivity.name} in ${Math.floor(duration / 60)}h ${duration % 60}m`,
        { tag: "activity-complete" },
      );

      // Track completion event
      trackEvent("activity_completed", {
        activityType: currentActivity.type,
        duration: duration,
      });

      // Schedule break reminder if auto-breaks are enabled
      if (settings?.activity?.autoStartBreaks) {
        scheduleBreakReminder(5 * 60000); // 5 minute break reminder
      }
    }
  };

  // Update current time every minute and check for scheduled activities
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkScheduledActivity(now);
    }, 60000);

    // Check immediately on mount
    checkScheduledActivity(new Date());

    return () => clearInterval(timer);
  }, [schedule]);

  // Refresh activities from localStorage to sync with other components
  useEffect(() => {
    const refreshActivities = () => {
      const latestActivities = loadFromStorage("activities", []);

      // Check if there are actual changes to prevent unnecessary updates
      setActivities((prevActivities) => {
        const prevIds = prevActivities.map((a) => a.id).sort();
        const newIds = latestActivities.map((a) => a.id).sort();
        const idsChanged = JSON.stringify(prevIds) !== JSON.stringify(newIds);

        // Also check if any activity status changed
        const statusChanged = prevActivities.some((prev) => {
          const current = latestActivities.find((a) => a.id === prev.id);
          return (
            current &&
            (current.isActive !== prev.isActive ||
              current.isPaused !== prev.isPaused ||
              current.endTime !== prev.endTime)
          );
        });

        if (
          !idsChanged &&
          !statusChanged &&
          prevActivities.length === latestActivities.length
        ) {
          return prevActivities;
        }

        // Update current activity - prefer non-paused, but show paused if that's all we have
        let activeActivity = latestActivities.find(
          (a) => a.isActive && !a.isPaused,
        );

        // If no non-paused active activity, look for any active activity (including paused)
        if (!activeActivity) {
          activeActivity = latestActivities.find((a) => a.isActive);
        }

        console.log("🔍 Home: Searching for active activity", {
          totalActivities: latestActivities.length,
          activeActivities: latestActivities.filter((a) => a.isActive),
          nonPausedActive: latestActivities.filter(
            (a) => a.isActive && !a.isPaused,
          ),
          foundActive: activeActivity,
          currentActivity: currentActivity?.id,
          isPaused: activeActivity?.isPaused || false,
        });
        setCurrentActivity(activeActivity || null);

        return latestActivities;
      });
    };

    // Listen for storage events and custom events
    const handleStorageChange = (e) => {
      if (e.key === "activities") {
        refreshActivities();
      }
    };

    const handleActivityUpdate = () => {
      console.log("🔄 Home: Activity update event received, refreshing...");
      refreshActivities();
    };

    // Listen for focus events to refresh when returning to tab
    const handleFocus = () => {
      refreshActivities();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("activityUpdated", handleActivityUpdate);
    window.addEventListener("focus", handleFocus);

    // Initial refresh on mount and when page becomes visible
    console.log(
      "🏠 Home: Component mounting, setting up listeners and refreshing activities",
    );
    refreshActivities();

    // Initialize AI insights
    setUserInsights(aiEngine.getUserInsights());
    console.log("🧠 AI: User insights loaded", {
      confidence: aiEngine.userProfile.confidenceLevel,
      activities: activities.length,
    });

    // Also refresh immediately if coming from ThingsToDo or command palette
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("refresh") === "activities") {
      console.log(
        "🔄 Home: URL refresh parameter detected, scheduling refresh",
      );
      setTimeout(() => {
        console.log("🔄 Home: Executing scheduled refresh from URL parameter");
        refreshActivities();
      }, 200);

      // Clean up URL parameter
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("activityUpdated", handleActivityUpdate);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const checkScheduledActivity = (now) => {
    const currentDay = now
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();
    const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM format

    const todaySchedule = schedule[currentDay] || [];
    const upcomingActivity = todaySchedule.find((activity) => {
      const activityTime = activity.startTime;
      const timeDiff =
        new Date(`1970/01/01 ${activityTime}`) -
        new Date(`1970/01/01 ${currentTimeStr}`);
      return timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // Within 5 minutes
    });

    // Set next activity (for Next Up section)
    const nextUp = todaySchedule.find((activity) => {
      const activityTime = activity.startTime;
      return (
        new Date(`1970/01/01 ${activityTime}`) >
        new Date(`1970/01/01 ${currentTimeStr}`)
      );
    });
    setNextActivity(nextUp);

    // Handle scheduled activities
    if (!currentActivity) {
      if (upcomingActivity) {
        // Activity within 5 minutes - show modal prompt
        setScheduledActivity(upcomingActivity);
        setShowActivityPrompt(true);
      } else if (nextUp) {
        // Next scheduled activity - show in Ready to Focus component
        setScheduledActivity(nextUp);
        setShowActivityPrompt(false);
      } else {
        // No scheduled activities
        setScheduledActivity(null);
        setShowActivityPrompt(false);
      }
    }
  };

  // Activities are now saved directly in handlers to prevent unnecessary re-renders

  // Smart activity suggestions based on user patterns
  const getActivityPatterns = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Analyze user's historical activities
    const userActivities = activities.filter((activity) => !activity.isActive);
    const recentActivities = userActivities.slice(0, 20); // Last 20 activities

    // Get activities for this time of day (±2 hours)
    const timeBasedActivities = userActivities.filter((activity) => {
      const activityHour = new Date(activity.startTime).getHours();
      return Math.abs(activityHour - currentHour) <= 2;
    });

    // Get activities for this day of week
    const dayBasedActivities = userActivities.filter((activity) => {
      const activityDay = new Date(activity.startTime).getDay();
      return activityDay === currentDay;
    });

    return {
      recent: recentActivities,
      timeBasedFrequency: getActivityFrequency(timeBasedActivities),
      dayBasedFrequency: getActivityFrequency(dayBasedActivities),
      overall: getActivityFrequency(userActivities),
    };
  };

  const getActivityFrequency = (activitiesList) => {
    const frequency = {};
    activitiesList.forEach((activity) => {
      const key = activity.name.toLowerCase();
      frequency[key] = (frequency[key] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  const getSmartSuggestions = () => {
    const patterns = getActivityPatterns();
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Default activities with smart timing
    const baseActivities = [
      {
        id: "run",
        label: "Start Running",
        icon: "🏃‍♂️",
        color: "accent-green",
        duration: settings?.activity?.defaultDuration || 30,
        timePreference: [6, 7, 8, 17, 18, 19], // Morning and evening
        dayPreference: [1, 2, 3, 4, 5, 6], // Weekdays and Saturday
      },
      {
        id: "learn",
        label: "Begin Learning",
        icon: BookOpen,
        color: "accent-blue",
        duration: settings?.activity?.defaultDuration || 60,
        timePreference: [9, 10, 11, 14, 15, 16, 19, 20], // Morning and afternoon
        dayPreference: [0, 1, 2, 3, 4, 5, 6], // Any day
      },
      {
        id: "focus",
        label: "Stay Focused",
        icon: Zap,
        color: "accent-purple",
        duration: 25,
        timePreference: [9, 10, 11, 13, 14, 15, 16], // Work hours
        dayPreference: [1, 2, 3, 4, 5], // Weekdays
      },
      {
        id: "workout",
        label: "Workout Session",
        icon: Dumbbell,
        color: "accent-orange",
        duration: 45,
        timePreference: [6, 7, 8, 17, 18, 19], // Morning and evening
        dayPreference: [1, 2, 3, 4, 5, 6], // Weekdays and Saturday
      },
      {
        id: "reading",
        label: "Reading Time",
        icon: BookOpen,
        color: "accent-blue",
        duration: 30,
        timePreference: [19, 20, 21, 22], // Evening
        dayPreference: [0, 6], // Weekends
      },
      {
        id: "meditation",
        label: "Meditation",
        icon: "🧘‍♂️",
        color: "accent-green",
        duration: 15,
        timePreference: [6, 7, 8, 21, 22], // Morning and night
        dayPreference: [0, 1, 2, 3, 4, 5, 6], // Any day
      },
    ];

    // Score activities based on patterns and preferences
    const scoredActivities = baseActivities.map((activity) => {
      let score = 0;

      // Time preference score
      if (activity.timePreference.includes(currentHour)) {
        score += 3;
      }

      // Day preference score
      if (activity.dayPreference.includes(currentDay)) {
        score += 2;
      }

      // User frequency score
      const userFreq = patterns.timeBasedFrequency.find(
        (f) =>
          f.name.toLowerCase().includes(activity.id) ||
          activity.label.toLowerCase().includes(f.name),
      );
      if (userFreq) {
        score += userFreq.count;
      }

      // Recent activity bonus
      const hasRecent = patterns.recent.some(
        (recent) =>
          recent.name.toLowerCase().includes(activity.id) ||
          activity.label.toLowerCase().includes(recent.name.toLowerCase()),
      );
      if (hasRecent) {
        score += 1;
      }

      return { ...activity, score };
    });

    // Get top 3 suggestions
    const suggestions = scoredActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    // If user has no history, return time-based defaults
    if (activities.length === 0) {
      if (currentHour >= 6 && currentHour <= 11) {
        return [
          baseActivities.find((a) => a.id === "run"),
          baseActivities.find((a) => a.id === "learn"),
          baseActivities.find((a) => a.id === "meditation"),
        ];
      } else if (currentHour >= 12 && currentHour <= 17) {
        return [
          baseActivities.find((a) => a.id === "focus"),
          baseActivities.find((a) => a.id === "learn"),
          baseActivities.find((a) => a.id === "workout"),
        ];
      } else {
        return [
          baseActivities.find((a) => a.id === "reading"),
          baseActivities.find((a) => a.id === "meditation"),
          baseActivities.find((a) => a.id === "learn"),
        ];
      }
    }

    return suggestions;
  };

  const quickActions = useMemo(
    () => getSmartSuggestions(),
    [activities, currentTime, settings, schedule],
  );

  const handleStartScheduledActivity = () => {
    if (scheduledActivity) {
      console.log("🎯 Home: Starting scheduled activity", {
        scheduledActivity,
      });

      // Record that user accepted the scheduled activity - positive reinforcement for AI
      intelligentService.recordUserChoice(
        scheduledActivity,
        "accepted_scheduled",
        {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          context: aiEngine.inferCurrentContext(),
          onTime: true,
        },
      );

      handleStartActivity({
        label: scheduledActivity.activity,
        id: scheduledActivity.category || "scheduled",
        duration: scheduledActivity.duration || 60,
      });
    }
    setShowActivityPrompt(false);
    setScheduledActivity(null);
  };

  const handleSkipActivity = () => {
    if (scheduledActivity) {
      // Record that user skipped - important learning signal
      intelligentService.recordUserChoice(
        scheduledActivity,
        "rejected_scheduled",
        {
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          context: aiEngine.inferCurrentContext(),
          reason: "skipped",
        },
      );

      console.log(
        "🧠 AI Learning: User skipped scheduled activity, updating preferences...",
      );
    }

    setShowActivityPrompt(false);
    setScheduledActivity(null);
  };

  const handleDoingSomethingElse = async () => {
    setIsLoadingAlternatives(true);
    console.log(
      "🧠 AI: User wants something else, generating intelligent suggestions...",
    );

    try {
      // Get current user state and context
      const userState = aiEngine.getCurrentUserState();
      const availableTime = scheduledActivity?.duration || 60;

      // Generate highly intelligent suggestions using AI learning
      const intelligentSuggestions =
        await intelligentService.generateActivitySuggestions(
          scheduledActivity?.activity || "current activity",
          availableTime,
          {
            currentTime: new Date().toTimeString().slice(0, 5),
            dayOfWeek: new Date()
              .toLocaleDateString("en-US", { weekday: "long" })
              .toLowerCase(),
            recentActivities: activities
              .slice(0, 10)
              .map((a) => a.name)
              .join(", "),
            scheduledActivity: scheduledActivity?.activity,
            userState: userState,
            context: userState.context,
          },
        );

      console.log("🎯 AI: Generated intelligent suggestions", {
        count: intelligentSuggestions.suggestions?.length || 0,
        confidence: intelligentSuggestions.confidence || 0,
        hasAIInsight: !!intelligentSuggestions.aiInsight,
      });

      // Use AI-generated suggestions if available, otherwise use learning engine fallback
      let suggestions = intelligentSuggestions.suggestions || [];

      if (suggestions.length === 0) {
        // Fallback to learning engine suggestions
        const fallbackSuggestions = aiEngine.getIntelligentSuggestions({
          availableTime,
          currentActivity: scheduledActivity?.activity,
          context: userState.context,
        });

        suggestions = fallbackSuggestions.slice(0, 6);
        console.log("🔄 AI: Using learning engine fallback", {
          count: suggestions.length,
        });
      }

      // Ensure we have at least some suggestions
      if (suggestions.length === 0) {
        suggestions = [
          {
            activity: "Quick meditation",
            duration: 10,
            category: "personal",
            reason: "Reset and refocus your mind",
            personalFit: 0.8,
          },
          {
            activity: "Gentle movement",
            duration: 15,
            category: "fitness",
            reason: "Boost energy and clarity",
            personalFit: 0.7,
          },
          {
            activity: "Creative break",
            duration: 20,
            category: "personal",
            reason: "Stimulate different thinking",
            personalFit: 0.6,
          },
        ];
      }

      // Store AI insight if provided
      if (intelligentSuggestions.aiInsight) {
        console.log("💡 AI Insight:", intelligentSuggestions.aiInsight);
      }

      setAlternativeActivities(suggestions);
    } catch (error) {
      console.error("Error getting intelligent alternatives:", error);

      // Ultimate fallback
      setAlternativeActivities([
        {
          activity: "Mindful breathing",
          duration: 5,
          category: "personal",
          reason: "Quick reset and refocus",
          personalFit: 0.9,
        },
        {
          activity: "Free time",
          duration: 30,
          category: "personal",
          reason: "Do what feels right in the moment",
          personalFit: 0.5,
        },
      ]);
    } finally {
      setIsLoadingAlternatives(false);
      setShowAlternatives(true);
    }
  };

  const handleSelectAlternative = (alternative) => {
    console.log("🎯 Home: Starting alternative activity", { alternative });

    // Record this choice for AI learning - this is critical intelligence!
    intelligentService.recordUserChoice(alternative, "accepted", {
      originalActivity: scheduledActivity?.activity,
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      context: aiEngine.inferCurrentContext(),
      personalFit: alternative.personalFit || 0.5,
    });

    console.log(
      "🧠 AI Learning: User chose alternative, learning preferences...",
    );

    handleStartActivity({
      label: alternative.activity,
      id: alternative.category || "alternative",
      duration: alternative.duration || 30,
    });
    setShowAlternatives(false);
    setShowActivityPrompt(false);
    setScheduledActivity(null);
  };

  const handlePauseActivity = () => {
    if (currentActivity) {
      const updatedActivity = {
        ...currentActivity,
        isPaused: !currentActivity.isPaused,
      };

      setCurrentActivity(updatedActivity);

      // Update activities array and save to storage
      setActivities((prev) => {
        const updated = prev.map((activity) =>
          activity.id === currentActivity.id ? updatedActivity : activity,
        );
        saveToStorage("activities", updated);
        window.dispatchEvent(new CustomEvent("activityUpdated"));
        return updated;
      });

      // Show notification for pause/resume
      showNotification(
        updatedActivity.isPaused ? "Activity Paused" : "Activity Resumed",
        `${updatedActivity.isPaused ? "Paused" : "Resumed"} ${currentActivity.name}`,
        { tag: "activity-pause-resume" },
      );
    }
  };

  const getTimeElapsed = () => {
    if (!currentActivity) return 0;
    const now = new Date();
    return Math.floor((now - new Date(currentActivity.startTime)) / 1000 / 60); // minutes
  };

  // Helper functions for Today's Progress
  const getTimeOfDay = (date) => {
    const hour = new Date(date).getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const getActivityColor = (activityName) => {
    const name = activityName.toLowerCase();
    if (name.includes("run")) return "bg-accent-orange";
    if (name.includes("stretch") || name.includes("yoga"))
      return "bg-accent-blue";
    if (name.includes("learn") || name.includes("study"))
      return "bg-accent-blue";
    if (name.includes("focus") || name.includes("work"))
      return "bg-accent-purple";
    if (name.includes("break") || name.includes("rest"))
      return "bg-accent-green";
    return "bg-accent-blue";
  };

  const consolidateActivities = (activities) => {
    const consolidated = {};

    activities.forEach((activity) => {
      const key = `${activity.name}_${getTimeOfDay(activity.startTime)}`;

      if (consolidated[key]) {
        consolidated[key].count += 1;
        consolidated[key].totalDuration += activity.duration || 0;
        consolidated[key].activities.push(activity);
      } else {
        consolidated[key] = {
          name: activity.name,
          duration: activity.duration || 0,
          totalDuration: activity.duration || 0,
          startTime: activity.startTime,
          timeOfDay: getTimeOfDay(activity.startTime),
          color: getActivityColor(activity.name),
          count: 1,
          activities: [activity],
        };
      }
    });

    return Object.values(consolidated);
  };

  const getTodayActivities = () => {
    const today = new Date().toDateString();
    return activities.filter(
      (activity) =>
        new Date(activity.startTime).toDateString() === today &&
        !activity.isActive,
    );
  };

  const groupActivitiesByTime = () => {
    const todayActivities = getTodayActivities();
    const consolidated = consolidateActivities(todayActivities);

    const grouped = {
      morning: [],
      afternoon: [],
      evening: [],
    };

    consolidated.forEach((activity) => {
      grouped[activity.timeOfDay].push(activity);
    });

    // Sort each group by start time
    Object.keys(grouped).forEach((timeOfDay) => {
      grouped[timeOfDay].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime),
      );
    });

    return grouped;
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDurationDisplay = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleManualEntry = () => {
    if (!manualEntry.name || !manualEntry.duration) return;

    const now = new Date();
    const durationMinutes = parseInt(manualEntry.duration);
    const startTime = new Date(now.getTime() - durationMinutes * 60000);

    const newActivity = {
      id: Date.now(),
      name: manualEntry.name,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      duration: durationMinutes,
      type: manualEntry.category,
      isActive: false,
      isPaused: false,
      category: manualEntry.category,
      isManual: true,
    };

    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      saveToStorage("activities", updated);
      window.dispatchEvent(new CustomEvent("activityUpdated"));
      return updated;
    });

    // Reset form and close modal
    setManualEntry({ name: "", duration: "", category: "personal" });
    setShowManualEntry(false);

    // Show notification
    showNotification("Activity Logged", `Manually logged ${manualEntry.name}`, {
      tag: "manual-entry",
    });

    // Track event
    trackEvent("manual_activity_logged", {
      activityType: manualEntry.category,
      duration: durationMinutes,
    });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24">
      {/* Top Navigation */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 backdrop-blur-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-dashboard py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Time */}
            <div className="flex items-center space-x-6">
              <motion.h1
                className="text-xl font-display font-bold text-gradient-blue"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                TENEBRIS OS
              </motion.h1>
              <div className="hidden md:block text-sm text-dark-text-muted">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                • {formatTime(currentTime)}
              </div>
            </div>

            {/* Top Navigation Items */}
            <div className="flex items-center space-x-4">
              {/* AI Insights Button - Only show when AI knows enough about user */}
              {userInsights && userInsights.confidence > 0.3 && (
                <motion.button
                  onClick={() => setShowAIInsights(true)}
                  className="p-2 text-dark-text-muted hover:text-accent-purple transition-colors rounded-lg hover:bg-white/5 relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={`Tenebris knows you ${(userInsights.confidence * 100).toFixed(0)}% - View insights`}
                >
                  <Brain size={20} />
                  {userInsights.confidence > 0.7 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-purple rounded-full animate-pulse"></div>
                  )}
                </motion.button>
              )}
              <motion.button
                onClick={() => navigate("/profile")}
                className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Profile"
              >
                <User size={20} />
              </motion.button>
              <motion.button
                onClick={() => navigate("/settings")}
                className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Settings"
              >
                <Settings size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="container-dashboard space-y-8 pt-24"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Current Activity Section */}
        <motion.section variants={fadeInUp}>
          <AnimatePresence mode="wait">
            {currentActivity ? (
              <motion.div
                key="active"
                className="card text-center space-y-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <StatusIndicator
                    status={currentActivity.isPaused ? "paused" : "active"}
                    size="lg"
                    pulse={!currentActivity.isPaused}
                  />
                  <h2 className="text-2xl font-display font-semibold">
                    {currentActivity.name}
                  </h2>
                </div>

                {/* Live Timer */}
                <motion.div
                  className="text-5xl font-mono font-bold text-accent-blue"
                  key={getTimeElapsed()}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.1 }}
                >
                  {Math.floor(getTimeElapsed() / 60)}h {getTimeElapsed() % 60}m
                </motion.div>

                <div className="text-sm text-dark-text-muted">
                  Started at {formatTime(new Date(currentActivity.startTime))}
                </div>

                {/* Activity Controls */}
                <div className="flex justify-center items-center space-x-4">
                  <MagneticButton
                    variant="outline"
                    size="lg"
                    onClick={handlePauseActivity}
                    magneticStrength={0.6}
                  >
                    {currentActivity.isPaused ? (
                      <Play size={20} />
                    ) : (
                      <Pause size={20} />
                    )}
                    <span>{currentActivity.isPaused ? "Resume" : "Pause"}</span>
                  </MagneticButton>

                  <MagneticButton
                    variant="primary"
                    size="lg"
                    onClick={() => handleStopActivity()}
                    magneticStrength={0.8}
                  >
                    <Square size={20} />
                    <span>Complete</span>
                  </MagneticButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="card text-center space-y-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-dark-surface border border-dark-border flex items-center justify-center">
                    <Clock size={24} className="text-dark-text-muted" />
                  </div>
                  <h2 className="text-4xl font-display font-bold text-white tracking-wider">
                    READY TO FOCUS
                  </h2>
                  {scheduledActivity ? (
                    <div className="space-y-3">
                      <p className="text-dark-text-muted">
                        Activity found in schedule,{" "}
                        <button
                          onClick={handleStartScheduledActivity}
                          className="text-accent-green hover:text-accent-green/80 font-medium underline underline-offset-2 transition-colors duration-200"
                        >
                          get started
                        </button>
                        {" or "}
                        <button
                          onClick={handleSkipActivity}
                          className="text-accent-red hover:text-accent-red/80 font-medium underline underline-offset-2 transition-colors duration-200"
                        >
                          skip
                        </button>
                      </p>
                      <div className="text-center">
                        <p className="text-lg font-medium text-white">
                          {scheduledActivity.activity}
                        </p>
                        <p className="text-sm text-dark-text-muted">
                          Scheduled for {scheduledActivity.startTime} -{" "}
                          {scheduledActivity.endTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-dark-text-muted">
                      Choose an activity or{" "}
                      <button
                        onClick={() => navigate("/schedule")}
                        className="text-accent-blue hover:text-accent-blue/80 font-medium underline underline-offset-2 transition-colors duration-200"
                      >
                        generate a schedule
                      </button>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Next Up */}
        {!currentActivity && nextActivity && (
          <motion.section variants={fadeInUp} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display flex items-center space-x-2">
                <Calendar size={20} className="text-accent-blue" />
                <span>Next Up</span>
              </h3>
            </div>
            <div className="text-xl font-semibold text-dark-text mb-2">
              {nextActivity.activity}
            </div>
            <div className="text-sm text-dark-text-muted">
              Scheduled for {nextActivity.startTime}
            </div>
          </motion.section>
        )}

        {/* Quick Actions */}
        {!currentActivity && (
          <motion.section variants={fadeInUp} className="space-y-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-blue to-transparent opacity-50"></div>
              </div>
              <div className="relative bg-dark-bg px-8">
                <span className="text-xl font-display text-white tracking-wider">
                  Quick Start
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full"
                >
                  <MagneticButton
                    variant="ghost"
                    onClick={() => handleStartActivity(action)}
                    className="w-full h-40 p-8 bg-dark-surface/30 border border-white/10 rounded-2xl hover:border-accent-blue/30 transition-all duration-300 flex flex-col justify-between items-start text-left"
                    magneticStrength={0.3}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">
                        {typeof action.icon === "string" ? (
                          <span>{action.icon}</span>
                        ) : (
                          <action.icon
                            size={32}
                            className={`text-${action.color}`}
                          />
                        )}
                      </div>
                      <div className="text-xl font-medium text-white">
                        {action.label}
                      </div>
                    </div>
                    <div className="text-lg text-dark-text-muted font-medium">
                      {action.id === "run" || action.id === "learn"
                        ? `${settings?.activity?.defaultDuration || action.duration} min`
                        : `${action.duration} min`}
                    </div>
                  </MagneticButton>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Today's Progress */}
        {getTodayActivities().length > 0 ? (
          <motion.section variants={fadeInUp} className="card relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                  <Target size={12} className="text-white" />
                </div>
                <span>Today's Progress</span>
              </h3>
              <motion.button
                onClick={() => setShowManualEntry(true)}
                className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Log Activity Manually"
              >
                <Plus
                  size={16}
                  className="text-white group-hover:rotate-90 transition-transform duration-300"
                />
              </motion.button>
            </div>

            <div className="space-y-4">
              {Object.entries(groupActivitiesByTime()).map(
                ([timeOfDay, timeActivities]) => {
                  if (timeActivities.length === 0) return null;

                  const isCollapsed = collapsedSections[timeOfDay];
                  const timeLabels = {
                    morning: "Morning",
                    afternoon: "Afternoon",
                    evening: "Evening",
                  };

                  return (
                    <div key={timeOfDay} className="space-y-3">
                      <button
                        onClick={() => toggleSection(timeOfDay)}
                        className="flex items-center justify-between w-full text-left group"
                      >
                        <h4 className="text-sm font-medium text-dark-text-muted uppercase tracking-wide">
                          {timeLabels[timeOfDay]}
                        </h4>
                        <motion.div
                          animate={{ rotate: isCollapsed ? 0 : 180 }}
                          transition={{ duration: 0.2 }}
                          className="text-dark-text-muted group-hover:text-dark-text"
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-2"
                          >
                            {timeActivities.map((activity, index) => (
                              <motion.div
                                key={`${activity.name}-${activity.startTime}`}
                                className="flex items-center justify-between p-3 bg-dark-surface/20 rounded-lg hover:bg-dark-surface/30 transition-all"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div
                                    className={`w-2 h-2 rounded-full ${activity.color}`}
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-dark-text">
                                        {activity.name}
                                      </span>
                                      {activity.count > 1 && (
                                        <span className="px-1.5 py-0.5 bg-dark-text-muted/20 text-dark-text-muted text-xs rounded-full">
                                          ×{activity.count}
                                        </span>
                                      )}
                                    </div>
                                    <div className="w-full bg-dark-border rounded-full h-1 mt-2">
                                      <div
                                        className={`h-1 rounded-full ${activity.color} opacity-60`}
                                        style={{
                                          width: `${Math.min((activity.totalDuration / 60) * 100, 100)}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-dark-text-muted font-mono">
                                  {formatDurationDisplay(
                                    activity.totalDuration,
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                },
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section
            variants={fadeInUp}
            className="card text-center py-8 relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-accent-green flex items-center justify-center">
                  <Target size={12} className="text-white" />
                </div>
                <span>Today's Progress</span>
              </h3>
              <motion.button
                onClick={() => setShowManualEntry(true)}
                className="w-8 h-8 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Log Activity Manually"
              >
                <Plus
                  size={16}
                  className="text-white group-hover:rotate-90 transition-transform duration-300"
                />
              </motion.button>
            </div>
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-blue/10 flex items-center justify-center"
            >
              <Target size={24} className="text-accent-blue" />
            </motion.div>
            <h3 className="text-lg font-display text-dark-text mb-2">
              Ready to Begin
            </h3>
            <p className="text-dark-text-muted">
              Start strong—your journey begins with the first step
            </p>
          </motion.section>
        )}
      </motion.div>

      {/* Activity Prompt Modal */}
      <AnimatePresence>
        {showActivityPrompt && scheduledActivity && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-display mb-2">
                Time for your activity!
              </h3>
              <p className="text-dark-text-secondary mb-2">
                {scheduledActivity.activity}
              </p>
              <p className="text-sm text-dark-text-muted mb-6">
                Scheduled for {scheduledActivity.startTime} -{" "}
                {scheduledActivity.endTime}
              </p>

              <div className="space-y-3">
                <MagneticButton
                  variant="primary"
                  onClick={handleStartScheduledActivity}
                  className="w-full"
                >
                  <Play size={16} />
                  <span>Start Activity</span>
                </MagneticButton>

                <div className="grid grid-cols-2 gap-3">
                  <MagneticButton
                    variant="ghost"
                    onClick={handleSkipActivity}
                    className="w-full"
                  >
                    Skip
                  </MagneticButton>

                  <MagneticButton
                    variant="outline"
                    onClick={handleDoingSomethingElse}
                    disabled={isLoadingAlternatives}
                    className="w-full"
                  >
                    {isLoadingAlternatives ? "Loading..." : "Something Else"}
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alternative Activities Modal */}
      <AnimatePresence>
        {showAlternatives && (
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
              <h3 className="text-xl font-display mb-4">
                What would you like to do instead?
              </h3>

              <div className="space-y-3 mb-6">
                {alternativeActivities.map((alternative, index) => (
                  <motion.button
                    key={`${alternative.activity}-${index}`}
                    onClick={() => handleSelectAlternative(alternative)}
                    className="w-full p-4 bg-dark-surface/50 rounded-lg text-left hover:bg-dark-surface transition-colors hover:border-accent-blue/30 border border-transparent"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-dark-text">
                          {alternative.activity}
                        </div>
                        <div className="text-sm text-dark-text-muted mt-1">
                          {alternative.duration}min • {alternative.reason}
                        </div>
                      </div>
                      <div className="ml-3">
                        <Play size={16} className="text-accent-blue" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <MagneticButton
                variant="ghost"
                onClick={() => {
                  // Record that user cancelled - learning signal
                  if (scheduledActivity) {
                    intelligentService.recordUserChoice(
                      scheduledActivity,
                      "cancelled_alternatives",
                      {
                        timeOfDay: new Date().getHours(),
                        context: aiEngine.inferCurrentContext(),
                      },
                    );
                  }
                  setShowAlternatives(false);
                }}
                className="w-full"
              >
                Cancel
              </MagneticButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Panel - Shows when Tenebris has learned enough about you */}
      <AnimatePresence>
        {userInsights && userInsights.confidence > 0.3 && showAIInsights && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="text-accent-purple" size={24} />
                <h3 className="text-xl font-display">Tenebris Knows You</h3>
                <div className="ml-auto text-sm text-dark-text-muted">
                  {(userInsights.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>

              <div className="space-y-4">
                {userInsights.insights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className="p-3 bg-dark-surface/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Lightbulb size={16} className="text-accent-blue" />
                      <span className="font-medium text-sm">
                        {insight.title}
                      </span>
                    </div>
                    <p className="text-sm text-dark-text-muted">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <MagneticButton
                  variant="primary"
                  onClick={() => setShowAIInsights(false)}
                  className="flex-1"
                >
                  <span>Got it</span>
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget System */}
      <motion.div variants={fadeInUp} className="mt-12">
        <WidgetSystem />
      </motion.div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntry && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManualEntry(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-display mb-6 text-white">
                Log Activity Manually
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text-muted mb-2">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Running, Reading, Coding..."
                    value={manualEntry.name}
                    onChange={(e) =>
                      setManualEntry((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-muted mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={manualEntry.duration}
                    onChange={(e) =>
                      setManualEntry((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
                    min="1"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-text-muted mb-2">
                    Category
                  </label>
                  <select
                    value={manualEntry.category}
                    onChange={(e) =>
                      setManualEntry((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50"
                  >
                    <option value="fitness">Fitness</option>
                    <option value="learning">Learning</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="rest">Rest</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text hover:bg-dark-border transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualEntry}
                  disabled={!manualEntry.name || !manualEntry.duration}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-lg text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log Activity
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

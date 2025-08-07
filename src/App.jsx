import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Command } from "lucide-react";

// Components
import BottomNavigation from "./components/BottomNavigation";
import TopHeader from "./components/TopHeader";
import CommandPalette from "./components/CommandPalette";
import LoadingSpinner from "./components/LoadingSpinner";
import PerformanceMonitor from "./components/PerformanceMonitor";

// Contexts
import { SettingsProvider } from "./contexts/SettingsContext";

// Pages
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Statistics from "./pages/Statistics";
import Schedule from "./pages/Schedule";
import ScheduleGeneration from "./pages/ScheduleGeneration";
import ThingsToDo from "./pages/ThingsToDo";
import Notes from "./pages/Notes";
import Todos from "./pages/Todos";
import MindmapDashboard from "./pages/MindmapDashboard";
import MindmapEditor from "./pages/MindmapEditor";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

// Hooks and utilities
import useSmoothScroll from "./hooks/useSmoothScroll.js";
import { saveToStorage, loadFromStorage } from "./utils/helpers.js";
import {
  useDebounce,
  useCleanup,
  optimizedStorage,
  initializePerformanceOptimizations,
} from "./utils/performance.js";

// Page transition component that prevents double animations
const PageTransition = ({ children, locationKey }) => {
  const mountedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Prevent double mounting animations
    if (mountedRef.current) {
      setIsReady(true);
      return;
    }

    mountedRef.current = true;

    // Small delay to prevent flash during route changes
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 10);

    return () => clearTimeout(timer);
  }, [locationKey]);

  return (
    <div
      className="w-full min-h-screen"
      style={{
        opacity: isReady ? 1 : 0,
        transition: isReady ? "opacity 0.15s ease-out" : "none",
      }}
    >
      {children}
    </div>
  );
};

// Main App Layout Component
const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [theme, setTheme] = useState(loadFromStorage("theme", "dark"));
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState(
    loadFromStorage("activities", []),
  );
  const [routeTransitioning, setRouteTransitioning] = useState(false);
  const routeTimeoutRef = useRef(null);

  // Performance optimizations
  const cleanup = useCleanup();
  const debouncedActivities = useDebounce(activities, 300);

  // Initialize smooth scroll
  const { scrollToTop } = useSmoothScroll();

  // Save theme preference (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      optimizedStorage.set("theme", theme, { compress: false });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [theme]);

  // Save activities (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      optimizedStorage.set("activities", debouncedActivities, {
        compress: true,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedActivities]);

  // Initialize app and performance monitoring
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();

    // Simulate initial loading with animation state management
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    cleanup.add(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [cleanup]);

  // Handle route changes to prevent double animations
  useEffect(() => {
    setRouteTransitioning(true);
    const routeTimer = setTimeout(() => {
      setRouteTransitioning(false);
    }, 150);

    cleanup.add(() => clearTimeout(routeTimer));
    return () => clearTimeout(routeTimer);
  }, [location.pathname, cleanup]);

  // Handle keyboard shortcuts (optimized)
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsCommandOpen(true);
    }
    if (e.key === "Escape") {
      setIsCommandOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, { passive: false });
    cleanup.add(() => document.removeEventListener("keydown", handleKeyDown));

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, cleanup]);

  // Route-specific actions (memoized)
  const handleStartActivity = useCallback(
    (activity) => {
      // Handle both string and object formats
      const activityName =
        typeof activity === "string" ? activity : activity.label;
      const activityType =
        typeof activity === "string"
          ? activity.toLowerCase().replace(/\s+/g, "-")
          : activity.id;

      const newActivity = {
        id: Date.now(),
        name: activityName,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        isActive: true,
        isPaused: false,
        type: activityType,
        category: getActivityCategory(activityName),
      };

      // Use functional update to avoid stale state
      setActivities((currentActivities) => {
        const updatedActivities = [newActivity, ...currentActivities];

        // Save to optimized storage
        optimizedStorage.set("activities", updatedActivities, {
          compress: true,
        });

        // Dispatch custom event to notify other components
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("activityUpdated"));
        }, 0);

        return updatedActivities;
      });

      // Navigate to home to show the started activity
      navigate("/?refresh=activities");
    },
    [navigate],
  );

  const getActivityCategory = useMemo(() => {
    const categoryMap = {
      fitness: ["run", "workout", "lift", "exercise", "gym"],
      education: ["learn", "study", "read", "course", "book"],
      work: ["focus", "work", "code", "meeting", "project"],
      rest: ["break", "rest", "sleep", "relax"],
    };

    return (activityName) => {
      const name = activityName.toLowerCase();
      for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some((keyword) => name.includes(keyword))) {
          return category;
        }
      }
      return "personal";
    };
  }, []);

  const handleNavigate = useCallback(
    (path) => {
      // Prevent rapid navigation during transitions
      if (routeTransitioning) return;

      // Navigate and close command palette
      navigate(path);
      scrollToTop({ duration: 0.2 });
      setIsCommandOpen(false);
    },
    [navigate, scrollToTop, routeTransitioning],
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Memoize loading screen
  const loadingScreen = useMemo(
    () => (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-4xl font-display font-bold text-dark-text">
          TENEBRIS OS
        </div>
      </div>
    ),
    [],
  );

  // Show loading screen on initial load
  if (isLoading) {
    return loadingScreen;
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* Ambient background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

      {/* Top Header */}
      <TopHeader />

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen pt-20">
        <PageTransition locationKey={location.pathname}>
          <Routes key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/generate" element={<ScheduleGeneration />} />
            <Route path="/things-to-do" element={<ThingsToDo />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/mindmap" element={<MindmapDashboard />} />
            <Route path="/mindmap/:mindmapId" element={<MindmapEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </PageTransition>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Command Palette Overlay */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onStartActivity={handleStartActivity}
        onNavigate={handleNavigate}
        onToggleTheme={handleToggleTheme}
        currentTheme={theme}
      />

      {/* Floating Command Button (optional, for discoverability) */}
      <motion.button
        className="fixed top-6 right-6 z-40 p-3 glass rounded-full border border-white/10 text-dark-text-muted hover:text-dark-text transition-colors"
        onClick={() => setIsCommandOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        title="Command Palette (⌘K)"
      >
        <Command size={20} />
      </motion.button>

      {/* Performance Monitor (Development) */}
      <PerformanceMonitor />
    </div>
  );
};

// Main App Component with Router
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SettingsProvider>
        <AppLayout />
      </SettingsProvider>
    </Router>
  );
}

export default App;

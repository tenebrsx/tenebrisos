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

// Components
import BottomNavigation from "./components/BottomNavigation";
import TopHeader from "./components/TopHeader";
import CommandPalette from "./components/CommandPalette";
import LoadingSpinner from "./components/LoadingSpinner";
import PerformanceMonitor from "./components/PerformanceMonitor";

// Contexts
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";

// Theme System
import { initializeTheme } from "./utils/themes.js";

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
import Login from "./pages/Login";
import Onboarding from "./pages/onboarding";

// Hooks and utilities
import useSmoothScroll from "./hooks/useSmoothScroll.js";
import { saveToStorage, loadFromStorage } from "./utils/helpers.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { dataService } from "./firebase/dataService.js";
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
  const {
    currentUser,
    isAuthenticated,
    dataService: authDataService,
  } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [theme, setTheme] = useState(loadFromStorage("theme", "dark"));
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [routeTransitioning, setRouteTransitioning] = useState(false);
  const routeTimeoutRef = useRef(null);

  // Check if user should see onboarding
  const hasCompletedOnboarding = loadFromStorage(
    "hasCompletedOnboarding",
    false,
  );
  const shouldShowOnboarding =
    !hasCompletedOnboarding && location.pathname !== "/onboarding";

  // Redirect to onboarding for new users
  useEffect(() => {
    if (shouldShowOnboarding) {
      navigate("/onboarding");
    }
  }, [shouldShowOnboarding, navigate]);
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

  // Initialize activities from cloud or local storage
  useEffect(() => {
    const initializeActivities = async () => {
      try {
        const savedActivities = await dataService.loadActivities();
        const activitiesArray = Array.isArray(savedActivities)
          ? savedActivities
          : [];
        setActivities(activitiesArray);
      } catch (error) {
        console.error("Error loading activities:", error);
        // Fallback to localStorage
        const fallbackActivities = loadFromStorage("activities", []);
        setActivities(
          Array.isArray(fallbackActivities) ? fallbackActivities : [],
        );
      }
    };

    initializeActivities();
  }, [currentUser]);

  // Save activities (debounced) to both cloud and local storage
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        await dataService.saveActivities(debouncedActivities);
      } catch (error) {
        console.error("Error saving activities:", error);
        // Fallback to localStorage
        optimizedStorage.set("activities", debouncedActivities, {
          compress: true,
        });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedActivities]);

  // Initialize app and performance monitoring
  useEffect(() => {
    // Initialize performance optimizations
    initializePerformanceOptimizations();

    // Initialize theme system
    initializeTheme();

    // Simulate initial loading with animation state management
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    cleanup.add(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [cleanup]);

  // Track current route on body element for theme overrides
  useEffect(() => {
    document.body.setAttribute("data-current-route", location.pathname);
    return () => {
      document.body.removeAttribute("data-current-route");
    };
  }, [location.pathname]);

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
        const currentArray = Array.isArray(currentActivities)
          ? currentActivities
          : [];
        const updatedActivities = [newActivity, ...currentArray];

        // Save to cloud storage (with localStorage fallback)
        dataService.saveActivities(updatedActivities).catch((error) => {
          console.error("Failed to save activity:", error);
          // Fallback to optimized storage
          optimizedStorage.set("activities", updatedActivities, {
            compress: true,
          });
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
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/"
              element={shouldShowOnboarding ? <Onboarding /> : <Home />}
            />
            <Route
              path="/activities"
              element={shouldShowOnboarding ? <Onboarding /> : <Activities />}
            />
            <Route
              path="/schedule"
              element={shouldShowOnboarding ? <Onboarding /> : <Schedule />}
            />
            <Route
              path="/schedule/generate"
              element={
                shouldShowOnboarding ? <Onboarding /> : <ScheduleGeneration />
              }
            />
            <Route
              path="/things-to-do"
              element={shouldShowOnboarding ? <Onboarding /> : <ThingsToDo />}
            />
            <Route
              path="/notes"
              element={shouldShowOnboarding ? <Onboarding /> : <Notes />}
            />
            <Route
              path="/todos"
              element={shouldShowOnboarding ? <Onboarding /> : <Todos />}
            />
            <Route
              path="/mindmap"
              element={
                shouldShowOnboarding ? <Onboarding /> : <MindmapDashboard />
              }
            />
            <Route
              path="/mindmap/:id"
              element={
                shouldShowOnboarding ? <Onboarding /> : <MindmapEditor />
              }
            />
            <Route
              path="/settings"
              element={shouldShowOnboarding ? <Onboarding /> : <Settings />}
            />
            <Route
              path="/profile"
              element={shouldShowOnboarding ? <Onboarding /> : <Profile />}
            />
            <Route path="/login" element={<Login />} />
            <Route
              path="/statistics"
              element={shouldShowOnboarding ? <Onboarding /> : <Statistics />}
            />
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

      {/* Performance Monitor (Development) */}
      <PerformanceMonitor />
    </div>
  );
};

// Main App Component with Router
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <AppLayout />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

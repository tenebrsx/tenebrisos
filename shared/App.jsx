/**
 * Unified App Component for Web and Mobile
 * Provides consistent functionality across all platforms
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Platform, StorageUtils, HapticUtils } from "./utils/platform.js";

// Platform-specific navigation imports
let Navigation = {};
if (Platform.isWeb) {
  const RouterModule = await import("react-router-dom");
  Navigation = {
    Router: RouterModule.BrowserRouter,
    Routes: RouterModule.Routes,
    Route: RouterModule.Route,
    useLocation: RouterModule.useLocation,
    useNavigate: RouterModule.useNavigate,
    Link: RouterModule.Link,
  };
} else {
  const NavModule = await import("@react-navigation/native");
  const StackModule = await import("@react-navigation/stack");
  const TabModule = await import("@react-navigation/bottom-tabs");
  Navigation = {
    NavigationContainer: NavModule.NavigationContainer,
    createStackNavigator: StackModule.createStackNavigator,
    createBottomTabNavigator: TabModule.createBottomTabNavigator,
    useNavigation: NavModule.useNavigation,
    useRoute: NavModule.useRoute,
  };
}

// Universal components
import {
  UniversalView as View,
  UniversalText as Text,
  UniversalButton as Button,
  UniversalSafeAreaView as SafeAreaView,
  UniversalStatusBar as StatusBar,
} from "./components/Universal.jsx";

// Shared contexts
import { SettingsProvider } from "./contexts/SettingsContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

// Shared components (these will be created in the migration)
import BottomNavigation from "./components/BottomNavigation.jsx";
import TopHeader from "./components/TopHeader.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import PerformanceMonitor from "./components/PerformanceMonitor.jsx";

// Shared pages (these will be created in the migration)
import Home from "./pages/Home.jsx";
import Activities from "./pages/Activities.jsx";
import Statistics from "./pages/Statistics.jsx";
import Schedule from "./pages/Schedule.jsx";
import ScheduleGeneration from "./pages/ScheduleGeneration.jsx";
import ThingsToDo from "./pages/ThingsToDo.jsx";
import Notes from "./pages/Notes.jsx";
import Todos from "./pages/Todos.jsx";
import MindmapDashboard from "./pages/MindmapDashboard.jsx";
import MindmapEditor from "./pages/MindmapEditor.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Onboarding from "./pages/Onboarding.jsx";

// Shared utilities
import { initializeTheme } from "./utils/themes.js";
import { saveToStorage, loadFromStorage } from "./utils/helpers.js";
import { useAuth } from "./contexts/AuthContext.jsx";
import { dataService } from "./firebase/dataService.js";
import {
  useDebounce,
  useCleanup,
  optimizedStorage,
  initializePerformanceOptimizations,
} from "./utils/performance.js";

// Platform-specific smooth scroll hook
const useSmoothScroll = () => {
  const scrollToTop = useCallback((options = {}) => {
    if (Platform.isWeb) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
        ...options,
      });
    }
    // Mobile scrolling handled by navigation
  }, []);

  return { scrollToTop };
};

// Web-specific Page Transition Component
const PageTransition = ({ children, locationKey }) => {
  if (Platform.isMobile) {
    return children; // Mobile uses native navigation transitions
  }

  const mountedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (mountedRef.current) {
      setIsReady(true);
      return;
    }

    mountedRef.current = true;
    const timer = setTimeout(() => setIsReady(true), 10);
    return () => clearTimeout(timer);
  }, [locationKey]);

  return (
    <View
      style={{
        width: "100%",
        minHeight: Platform.isWeb ? "100vh" : "100%",
        opacity: isReady ? 1 : 0,
        transition: isReady ? "opacity 0.15s ease-out" : "none",
      }}
    >
      {children}
    </View>
  );
};

// Mobile Stack Navigator
const Stack = Platform.isMobile ? Navigation.createStackNavigator() : null;
const Tab = Platform.isMobile ? Navigation.createBottomTabNavigator() : null;

const MobileTabNavigator = () => {
  if (!Platform.isMobile) return null;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1C1C1E",
          borderTopColor: "#38383A",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Activities" component={Activities} />
      <Tab.Screen name="Schedule" component={Schedule} />
      <Tab.Screen name="Statistics" component={Statistics} />
      <Tab.Screen name="ThingsToDo" component={ThingsToDo} />
    </Tab.Navigator>
  );
};

const MobileStackNavigator = () => {
  if (!Platform.isMobile) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#000000" },
      }}
    >
      <Stack.Screen name="Main" component={MobileTabNavigator} />
      <Stack.Screen name="Notes" component={Notes} />
      <Stack.Screen name="Todos" component={Todos} />
      <Stack.Screen name="MindmapDashboard" component={MindmapDashboard} />
      <Stack.Screen name="MindmapEditor" component={MindmapEditor} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Onboarding" component={Onboarding} />
      <Stack.Screen name="ScheduleGeneration" component={ScheduleGeneration} />
    </Stack.Navigator>
  );
};

// Main App Layout Component
const AppLayout = () => {
  const location = Platform.isWeb ? Navigation.useLocation() : null;
  const navigate = Platform.isWeb ? Navigation.useNavigate() : null;
  const navigation = Platform.isMobile ? Navigation.useNavigation() : null;

  const {
    currentUser,
    isAuthenticated,
    dataService: authDataService,
  } = useAuth();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [routeTransitioning, setRouteTransitioning] = useState(false);

  // Initialize theme from storage
  useEffect(() => {
    const initTheme = async () => {
      const savedTheme = await StorageUtils.getItem("theme");
      if (savedTheme) {
        setTheme(savedTheme);
      }
    };
    initTheme();
  }, []);

  // Check if user should see onboarding
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await StorageUtils.getItem("hasCompletedOnboarding");
      setHasCompletedOnboarding(completed === "true");
    };
    checkOnboarding();
  }, []);

  const shouldShowOnboarding =
    !hasCompletedOnboarding &&
    (Platform.isWeb ? location?.pathname !== "/onboarding" : true);

  // Redirect to onboarding for new users (web only)
  useEffect(() => {
    if (Platform.isWeb && shouldShowOnboarding && navigate) {
      navigate("/onboarding");
    }
  }, [shouldShowOnboarding, navigate]);

  // Performance optimizations
  const cleanup = useCleanup();
  const debouncedActivities = useDebounce(activities, 300);
  const { scrollToTop } = useSmoothScroll();

  // Save theme preference
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await StorageUtils.setItem("theme", theme);
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
        const fallbackActivities = await StorageUtils.getItem("activities");
        const parsed = fallbackActivities ? JSON.parse(fallbackActivities) : [];
        setActivities(Array.isArray(parsed) ? parsed : []);
      }
    };

    initializeActivities();
  }, [currentUser]);

  // Save activities (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        await dataService.saveActivities(debouncedActivities);
      } catch (error) {
        console.error("Error saving activities:", error);
        await StorageUtils.setItem("activities", JSON.stringify(debouncedActivities));
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [debouncedActivities]);

  // Initialize app
  useEffect(() => {
    initializePerformanceOptimizations();
    initializeTheme();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    cleanup.add(() => clearTimeout(timer));
    return () => clearTimeout(timer);
  }, [cleanup]);

  // Handle keyboard shortcuts (web only)
  const handleKeyDown = useCallback((e) => {
    if (Platform.isMobile) return;

    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsCommandOpen(true);
    }
    if (e.key === "Escape") {
      setIsCommandOpen(false);
    }
  }, []);

  useEffect(() => {
    if (Platform.isWeb) {
      document.addEventListener("keydown", handleKeyDown, { passive: false });
      cleanup.add(() => document.removeEventListener("keydown", handleKeyDown));
    }
  }, [handleKeyDown, cleanup]);

  // Activity management
  const handleStartActivity = useCallback(
    (activity) => {
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

      setActivities((currentActivities) => {
        const currentArray = Array.isArray(currentActivities)
          ? currentActivities
          : [];
        return [newActivity, ...currentArray];
      });

      // Navigate to home
      if (Platform.isWeb && navigate) {
        navigate("/?refresh=activities");
      } else if (Platform.isMobile && navigation) {
        navigation.navigate("Home");
      }

      // Haptic feedback on mobile
      HapticUtils.impact("medium");
    },
    [navigate, navigation],
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
      if (routeTransitioning) return;

      if (Platform.isWeb && navigate) {
        navigate(path);
        scrollToTop({ duration: 0.2 });
      } else if (Platform.isMobile && navigation) {
        // Convert web paths to mobile screen names
        const pathToScreen = {
          "/": "Home",
          "/activities": "Activities",
          "/schedule": "Schedule",
          "/statistics": "Statistics",
          "/things-to-do": "ThingsToDo",
          "/notes": "Notes",
          "/todos": "Todos",
          "/mindmap": "MindmapDashboard",
          "/settings": "Settings",
          "/profile": "Profile",
          "/login": "Login",
          "/onboarding": "Onboarding",
          "/schedule/generate": "ScheduleGeneration",
        };

        const screenName = pathToScreen[path] || "Home";
        navigation.navigate(screenName);
      }

      setIsCommandOpen(false);
    },
    [navigate, navigation, scrollToTop, routeTransitioning],
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <StatusBar style="light" />
        <Text style={{
          fontSize: Platform.isWeb ? 32 : 24,
          fontWeight: "bold",
          color: "#ffffff"
        }}>
          TENEBRIS OS
        </Text>
      </SafeAreaView>
    );
  }

  // Mobile app structure
  if (Platform.isMobile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
        <StatusBar style="light" />

        {shouldShowOnboarding ? (
          <Onboarding />
        ) : (
          <>
            <MobileStackNavigator />
            <CommandPalette
              isOpen={isCommandOpen}
              onClose={() => setIsCommandOpen(false)}
              onStartActivity={handleStartActivity}
              onNavigate={handleNavigate}
              onToggleTheme={handleToggleTheme}
              currentTheme={theme}
            />
          </>
        )}
      </SafeAreaView>
    );
  }

  // Web app structure
  return (
    <View className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Noise texture overlay */}
      <View className="absolute inset-0 noise pointer-events-none" />

      {/* Ambient background gradient */}
      <View className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

      {/* Top Header */}
      <TopHeader />

      {/* Main Content Area */}
      <View className="relative z-10 min-h-screen pt-20">
        <PageTransition locationKey={location?.pathname}>
          <Navigation.Routes key={location?.pathname}>
            <Navigation.Route path="/onboarding" element={<Onboarding />} />
            <Navigation.Route
              path="/"
              element={shouldShowOnboarding ? <Onboarding /> : <Home />}
            />
            <Navigation.Route
              path="/activities"
              element={shouldShowOnboarding ? <Onboarding /> : <Activities />}
            />
            <Navigation.Route
              path="/schedule"
              element={shouldShowOnboarding ? <Onboarding /> : <Schedule />}
            />
            <Navigation.Route
              path="/schedule/generate"
              element={
                shouldShowOnboarding ? <Onboarding /> : <ScheduleGeneration />
              }
            />
            <Navigation.Route
              path="/things-to-do"
              element={shouldShowOnboarding ? <Onboarding /> : <ThingsToDo />}
            />
            <Navigation.Route
              path="/notes"
              element={shouldShowOnboarding ? <Onboarding /> : <Notes />}
            />
            <Navigation.Route
              path="/todos"
              element={shouldShowOnboarding ? <Onboarding /> : <Todos />}
            />
            <Navigation.Route
              path="/mindmap"
              element={
                shouldShowOnboarding ? <Onboarding /> : <MindmapDashboard />
              }
            />
            <Navigation.Route
              path="/mindmap/:id"
              element={
                shouldShowOnboarding ? <Onboarding /> : <MindmapEditor />
              }
            />
            <Navigation.Route
              path="/settings"
              element={shouldShowOnboarding ? <Onboarding /> : <Settings />}
            />
            <Navigation.Route
              path="/profile"
              element={shouldShowOnboarding ? <Onboarding /> : <Profile />}
            />
            <Navigation.Route path="/login" element={<Login />} />
            <Navigation.Route
              path="/statistics"
              element={shouldShowOnboarding ? <Onboarding /> : <Statistics />}
            />
          </Navigation.Routes>
        </PageTransition>
      </View>

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
    </View>
  );
};

// Main App Component with Navigation
function App() {
  if (Platform.isMobile) {
    return (
      <Navigation.NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: "#007AFF",
            background: "#000000",
            card: "#1C1C1E",
            text: "#FFFFFF",
            border: "#38383A",
            notification: "#FF453A",
          },
        }}
      >
        <AuthProvider>
          <SettingsProvider>
            <AppLayout />
          </SettingsProvider>
        </AuthProvider>
      </Navigation.NavigationContainer>
    );
  }

  return (
    <Navigation.Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <AppLayout />
        </SettingsProvider>
      </AuthProvider>
    </Navigation.Router>
  );
}

export default App;

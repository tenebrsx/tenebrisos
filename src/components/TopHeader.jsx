import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Settings,
  User,
  ChevronDown,
  BarChart3,
  LogOut,
  UserCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";
import SyncStatus from "./SyncStatus";

const TopHeader = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    logout,
    getUserDisplayInfo,
    isAuthenticated,
    isFirebaseAvailable,
  } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Handle scroll for dynamic header opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Get user display info
  const userInfo = getUserDisplayInfo();

  // Profile dropdown items based on auth state
  const profileDropdownItems = isAuthenticated
    ? [
        {
          id: "profile",
          label: "My Profile",
          path: "/profile",
          icon: UserCircle,
        },
        {
          id: "statistics",
          label: "Statistics",
          path: "/statistics",
          icon: BarChart3,
        },
        {
          id: "logout",
          label: "Sign Out",
          action: "logout",
          icon: LogOut,
        },
      ]
    : [
        {
          id: "login",
          label: "Sign In",
          path: "/login",
          icon: LogIn,
        },
        {
          id: "signup",
          label: "Sign Up",
          path: "/login?mode=signup",
          icon: UserPlus,
        },
      ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleItemClick = (item) => {
    if (item.action === "logout") {
      handleLogout();
    } else if (item.path) {
      handleNavigation(item.path);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Calculate header opacity and blur based on scroll
  const scrollThreshold = 50;
  const headerOpacity = Math.min(scrollY / scrollThreshold, 1);
  const headerBlur = Math.min(scrollY / scrollThreshold, 1);

  const ProfileDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className={clsx(
          "relative flex items-center justify-center space-x-2",
          "px-3 h-10 rounded-xl",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
          "backdrop-blur-sm",
          isAuthenticated
            ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
            : "bg-white/5 text-dark-text-muted hover:text-dark-text hover:bg-white/10 border border-white/10",
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={
          isAuthenticated ? `Signed in as ${userInfo?.displayName}` : "Account"
        }
      >
        {isAuthenticated && userInfo?.photoURL ? (
          <img
            src={userInfo.photoURL}
            alt="Profile"
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <User size={18} />
        )}
        {isAuthenticated && (
          <span className="text-sm font-medium max-w-20 truncate">
            {userInfo?.displayName}
          </span>
        )}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {showProfileDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full right-0 mt-2 w-48 bg-dark-surface border border-dark-border rounded-xl shadow-lg z-50 overflow-hidden"
          >
            {/* User Info Header (when authenticated) */}
            {isAuthenticated && userInfo && (
              <>
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    {userInfo.photoURL ? (
                      <img
                        src={userInfo.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
                        <User className="text-accent-blue" size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-text truncate">
                        {userInfo.displayName}
                      </p>
                      <p className="text-xs text-dark-text-muted truncate">
                        {userInfo.email}
                      </p>
                      {!userInfo.emailVerified && (
                        <p className="text-xs text-accent-orange">
                          Email not verified
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Menu Items */}
            {profileDropdownItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={clsx(
                  "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-dark-border transition-all",
                  item.path && isActive(item.path)
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-dark-text",
                  item.action === "logout" &&
                    "text-accent-red hover:bg-accent-red/10",
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <item.icon size={16} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}

            {/* Firebase Status (development only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="px-4 py-2 border-t border-white/10 bg-dark-bg/50">
                <p className="text-xs text-dark-text-muted">
                  Firebase:{" "}
                  {isFirebaseAvailable ? "✅ Connected" : "❌ Offline"}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const SettingsButton = () => (
    <motion.button
      onClick={() => handleNavigation("/settings")}
      className={clsx(
        "relative flex items-center justify-center",
        "w-12 h-12 rounded-xl",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
        "backdrop-blur-sm",
        {
          "bg-accent-blue/20 text-accent-blue border border-accent-blue/30":
            isActive("/settings"),
          "bg-white/5 text-dark-text hover:text-white hover:bg-white/10 border border-white/10":
            !isActive("/settings"),
        },
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Settings"
    >
      <Settings size={20} />
    </motion.button>
  );

  return (
    <motion.header
      className={clsx(
        "fixed top-0 left-0 right-0 z-40",
        "border-b transition-all duration-300 ease-out",
        "safe-area-pt",
        className,
      )}
      style={{
        backdropFilter: `blur(${12 + headerBlur * 8}px)`,
        backgroundColor: `rgba(13, 13, 15, ${0.2 + headerOpacity * 0.6})`,
        borderBottomColor: `rgba(255, 255, 255, ${0.05 + headerOpacity * 0.05})`,
      }}
    >
      {/* Gradient overlay for depth - only visible when scrolled */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-dark-bg/30 to-transparent pointer-events-none"
        animate={{
          opacity: headerOpacity,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Header container */}
      <motion.div
        className="relative flex items-center justify-between px-6 py-4"
        layout
      >
        {/* Logo/Brand area (left side) */}
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-dark-text tracking-tight">
            TENEBRIS OS
          </h1>
        </div>

        {/* Navigation buttons (right side) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <div>
              <SyncStatus />
            </div>
            <div>
              <SettingsButton />
            </div>
            <div>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default TopHeader;

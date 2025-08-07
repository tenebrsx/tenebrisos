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
} from "lucide-react";
import clsx from "clsx";

const TopHeader = ({ className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const profileDropdownItems = [
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
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
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
          "bg-white/5 text-dark-text-muted hover:text-dark-text hover:bg-white/10 border border-white/10",
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <User size={18} />
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
            {profileDropdownItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-dark-border transition-all ${
                  isActive(item.path)
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-dark-text"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <item.icon size={16} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
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
        "w-10 h-10 rounded-xl",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
        "backdrop-blur-sm",
        {
          "bg-accent-blue/20 text-accent-blue border border-accent-blue/30":
            isActive("/settings"),
          "bg-white/5 text-dark-text-muted hover:text-dark-text hover:bg-white/10 border border-white/10":
            !isActive("/settings"),
        },
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Settings"
    >
      <Settings size={18} />
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

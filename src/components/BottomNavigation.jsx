import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  User,
  Settings,
  Activity,
  Calendar,
  CheckSquare,
  FileText,
  ListTodo,
  Brain,
} from "lucide-react";
import clsx from "clsx";

const BottomNavigation = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: "activities",
      label: "Activities",
      path: "/activities",
      icon: Activity,
    },
    {
      id: "things-to-do",
      label: "Things to Do",
      path: "/things-to-do",
      icon: CheckSquare,
    },
    {
      id: "mindmap",
      label: "Mindmap",
      path: "/mindmap",
      icon: Brain,
    },
    {
      id: "home",
      label: "Home",
      path: "/",
      icon: Home,
      isCenter: true,
    },
    {
      id: "schedule",
      label: "Schedule",
      path: "/schedule",
      icon: Calendar,
    },
    {
      id: "notes",
      label: "Notes",
      path: "/notes",
      icon: FileText,
    },
    {
      id: "todos",
      label: "Todos",
      path: "/todos",
      icon: ListTodo,
    },
  ];

  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item, index }) => {
    const active = isActive(item.path);

    return (
      <motion.button
        onClick={() => handleNavigation(item.path)}
        className={clsx(
          "relative flex flex-col items-center justify-center",
          item.isCenter ? "min-h-[64px] px-10 py-2" : "min-h-[64px] px-4 py-2",
          "transition-all duration-300 ease-out-expo",
          "focus:outline-none",
          {
            "text-accent-blue": active,
            "text-dark-text-muted hover:text-dark-text-secondary": !active,
          },
        )}
        transition={{
          duration: 0.2,
          ease: "easeOut",
        }}
      >
        {/* Background glow for active state */}
        {active && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-accent-blue/10 border border-accent-blue/20"
            layoutId="activeBackground"
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          />
        )}

        {/* Center item special styling */}
        {item.isCenter && (
          <motion.div
            className={clsx(
              "absolute inset-0 rounded-3xl",
              "bg-accent-blue/40",
              "border-2 border-white/20",
              "shadow-2xl shadow-accent-blue/20",
            )}
            initial={false}
            animate={{
              opacity: active ? 1 : 0.8,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        )}

        {/* Icon */}
        <motion.div
          className={clsx(
            "relative z-10 flex items-center justify-center",
            "w-6 h-6 mb-1",
          )}
          animate={{
            y: active ? -2 : 0,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <item.icon
            size={18}
            className="transition-all duration-200"
            strokeWidth={active ? 3 : 1.5}
          />
        </motion.div>

        {/* Label */}
        <motion.span
          className={clsx(
            "relative z-10 font-medium leading-none",
            "transition-all duration-200",
            "text-xs",
          )}
          animate={{
            opacity: active ? 1 : 0.7,
            y: active ? 0 : 1,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          {item.label}
        </motion.span>

        {/* Active indicator dot */}
        {active && !item.isCenter && (
          <motion.div
            className="absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-accent-blue"
            initial={{ scale: 0, x: "-50%" }}
            animate={{ scale: 1, x: "-50%" }}
            exit={{ scale: 0, x: "-50%" }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50",
        "backdrop-blur-xl bg-dark-bg/80",
        "border-t border-white/10",
        "safe-area-pb",
        className,
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
        delay: 0.1,
      }}
    >
      {/* Solid overlay for depth */}
      <div className="absolute inset-0 bg-dark-bg/30 pointer-events-none" />

      {/* Navigation container */}
      <motion.div
        className="relative flex items-center justify-center px-6 py-2"
        layout
      >
        {/* Background blur enhancement */}
        <div className="absolute inset-0 backdrop-blur-md" />

        {/* Navigation items */}
        <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
          <div className="flex items-center justify-between w-full">
            {navItems.map((item, index) => (
              <NavItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Home indicator line (iOS style) */}
      <motion.div
        className="absolute bottom-1 left-1/2 w-32 h-1 bg-white/20 rounded-full"
        style={{ x: "-50%" }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </motion.nav>
  );
};

export default React.memo(BottomNavigation);

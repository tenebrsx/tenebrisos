import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Bell,
  Brain,
  Users,
  Video,
  AlertTriangle,
  MoreHorizontal,
  Home,
  BarChart3,
  User,
} from "lucide-react";

import { useSettings } from "../contexts/SettingsContext";
import { loadFromStorage, saveToStorage, formatTime } from "../utils/helpers";

const MobileDashboardWeb = () => {
  const { settings } = useSettings();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [urgentTaskCount, setUrgentTaskCount] = useState(5);
  const [completionPercentage, setCompletionPercentage] = useState(30);
  const [completedTasks, setCompletedTasks] = useState(22);
  const [totalTasks, setTotalTasks] = useState(72);
  const [inProgressTasks, setInProgressTasks] = useState(6);

  // Priority tasks data
  const [priorityTasks, setPriorityTasks] = useState([
    { id: 1, text: "Design Assets Export", completed: true, priority: "high" },
    { id: 2, text: "HR Catch-Up Call", completed: false, priority: "medium" },
    { id: 3, text: "Marketing Huddle", completed: false, priority: "medium" },
    { id: 4, text: "Onboarding Call", completed: false, priority: "low" },
    { id: 5, text: "Wp Setup & Deliver", completed: false, priority: "high" },
  ]);

  // All tasks data
  const allTasks = [
    {
      id: 1,
      title: "Design team planning",
      time: "9:30 - 10:30 AM",
      dueDate: "December 20",
      priority: "High",
      type: "meeting",
      platform: "Zoom Meet",
      attendees: 3,
    },
    {
      id: 2,
      title: "Client presentation prep",
      time: "2:00 - 3:30 PM",
      dueDate: "December 21",
      priority: "Medium",
      type: "task",
      platform: "Google Meet",
      attendees: 2,
    },
  ];

  // Initialize component
  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      const savedTasks = loadFromStorage("tasks", []);
      const savedActivities = loadFromStorage("activities", []);
      setTasks(savedTasks);
      setActivities(savedActivities);

      // Calculate real stats if data exists
      if (savedTasks.length > 0) {
        const completedToday = savedTasks.filter(
          (task) => task.completed && isToday(task.completedDate),
        ).length;
        const totalToday = savedTasks.filter((task) =>
          isToday(task.dueDate),
        ).length;

        if (totalToday > 0) {
          setCompletionPercentage(
            Math.round((completedToday / totalToday) * 100),
          );
          setCompletedTasks(completedToday);
          setTotalTasks(totalToday);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const toggleTask = (taskId) => {
    setPriorityTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );

    // Update completion stats
    const updatedTasks = priorityTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task,
    );
    const completed = updatedTasks.filter((task) => task.completed).length;
    setCompletionPercentage(
      Math.round((completed / updatedTasks.length) * 100),
    );
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const name = "Kevin Merico"; // Replace with actual user name from settings

    if (hour < 12) return `Hello 👋\n${name}!`;
    if (hour < 17) return `Good Afternoon 👋\n${name}!`;
    return `Good Evening 👋\n${name}!`;
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  // Progress chart data (simplified bars)
  const progressData = [0.3, 0.6, 0.4, 0.8, 0.5, 0.9, 0.7];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-dark-background text-dark-text overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header
        className="flex justify-between items-start p-5 pb-6"
        variants={itemVariants}
      >
        <div className="flex-1">
          <h1 className="text-2xl font-semibold leading-tight whitespace-pre-line">
            {getGreeting()}
          </h1>
        </div>
        <div className="flex gap-2.5">
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Search size={20} className="text-dark-text-muted" />
          </button>
          <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Bell size={20} className="text-dark-text-muted" />
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="px-5 pb-20">
        {/* AI Analysis Card */}
        <motion.div
          className="mb-6 rounded-2xl overflow-hidden"
          variants={itemVariants}
        >
          <div
            className="p-5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #FF9A8B 0%, #A8E6CF 100%)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                <Calendar size={14} className="text-white" />
                <span className="text-xs font-semibold text-white">
                  {formatDate()}
                </span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-white">
                  AI-Report
                </span>
              </div>
            </div>

            <p className="text-sm text-white/80 mb-2">Today's AI Analysis</p>
            <div className="flex flex-wrap items-center">
              <span className="text-xl font-normal text-white">You Have </span>
              <span className="text-xl font-bold text-white">
                {urgentTaskCount}
              </span>
              <span className="text-xl font-normal text-white"> Tasks </span>
              <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-0.5 rounded mx-1">
                <AlertTriangle size={12} className="text-orange-500" />
                <span className="text-xs text-orange-500 font-semibold">
                  Urgent
                </span>
              </div>
              <span className="text-xl font-normal text-white"> for Today.</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Row */}
        <div className="flex gap-4 mb-8">
          {/* Left Column - Priority Tasks */}
          <motion.div className="flex-2" variants={itemVariants}>
            <div className="bg-dark-surface rounded-2xl p-5 border border-dark-border">
              <h3 className="text-base font-semibold text-dark-text mb-4">
                Priority Task
              </h3>
              <div className="space-y-3">
                {priorityTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 w-full text-left hover:opacity-70 transition-opacity"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={18} className="text-accent-green" />
                      ) : (
                        <Circle size={18} className="text-dark-text-muted" />
                      )}
                      <span
                        className={`text-sm flex-1 ${
                          task.completed
                            ? "line-through opacity-60"
                            : "text-dark-text"
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Stats */}
          <motion.div className="flex-1 space-y-3" variants={itemVariants}>
            {/* Completion Percentage */}
            <div className="bg-dark-surface rounded-xl p-3 border border-dark-border text-center">
              <p className="text-xs text-dark-text-muted mb-1">Completed</p>
              <p className="text-lg font-bold text-dark-text mb-0.5">
                {completionPercentage}%
              </p>
              <p className="text-xs text-dark-text-muted">
                {completedTasks}/{totalTasks} task
              </p>
            </div>

            {/* Progress Chart */}
            <div className="bg-dark-surface rounded-xl p-3 border border-dark-border h-16 flex items-center justify-center">
              <div className="flex items-end gap-1 h-8">
                {progressData.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: value * 32 + 4 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="w-1 bg-accent-blue rounded-sm"
                  />
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-dark-surface rounded-xl p-3 border border-dark-border flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <Clock size={14} className="text-dark-text" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-dark-text mb-0.5">
                  In Progress
                </p>
                <p className="text-xs text-dark-text-muted">
                  {inProgressTasks} task
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* All Tasks Section */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-dark-text">All Tasks</h3>
            <button className="text-lg text-dark-text hover:text-accent-blue transition-colors">
              <span className="transform rotate-45 inline-block">↗</span>
            </button>
          </div>

          <div className="space-y-3">
            {allTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 + 0.6 }}
                className="bg-dark-surface rounded-2xl p-4 border border-dark-border"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.priority === "High" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-dark-text">
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                    <span className="text-xs text-accent-blue">
                      {task.platform}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-dark-text mb-1.5">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 mb-1">
                  <Clock size={12} className="text-dark-text-muted" />
                  <span className="text-xs text-dark-text-muted">
                    {task.time}
                  </span>
                </div>
                <p className="text-xs text-dark-text-muted mb-3">
                  Due Date: {task.dueDate}
                </p>

                {/* Attendees Row */}
                <div className="flex justify-between items-center">
                  <div className="flex">
                    {Array.from({ length: task.attendees }, (_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full bg-accent-blue border-2 border-dark-surface -ml-1.5 first:ml-0"
                        style={{ zIndex: task.attendees - i }}
                      />
                    ))}
                  </div>
                  <button className="p-1 hover:bg-white/5 rounded transition-colors">
                    <MoreHorizontal size={14} className="text-dark-text-muted" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        variants={itemVariants}
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-dark-surface border-t border-dark-border"
        variants={itemVariants}
      >
        <div className="flex">
          <button className="flex-1 flex flex-col items-center py-3 text-accent-blue">
            <Home size={20} />
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-dark-text-muted hover:text-dark-text transition-colors">
            <Calendar size={20} />
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-dark-text-muted hover:text-dark-text transition-colors">
            <BarChart3 size={20} />
          </button>
          <button className="flex-1 flex flex-col items-center py-3 text-dark-text-muted hover:text-dark-text transition-colors">
            <User size={20} />
          </button>
        </div>
      </motion.nav>
    </motion.div>
  );
};

export default MobileDashboardWeb;

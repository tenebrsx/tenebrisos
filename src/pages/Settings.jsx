import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import {
  ArrowLeft,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  Clock,
  Palette,
  Database,
  Shield,
  Info,
  Key,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Zap,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";

const Settings = () => {
  const navigate = useNavigate();
  const {
    settings,
    updateSetting,
    showNotification,
    requestNotificationPermission,
    playSound,
    changeTheme,
    getAvailableThemes,
    getActiveTheme,
    toggleRetroTheme,
  } = useSettings();
  const [activeTab, setActiveTab] = useState("general");

  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [exportData, setExportData] = useState(null);

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: SettingsIcon,
      color: "accent-blue",
    },
    {
      id: "activity",
      label: "Activity",
      icon: Activity,
      color: "accent-green",
    },
    {
      id: "ai",
      label: "AI & API",
      icon: Zap,
      color: "accent-purple",
    },
    {
      id: "interface",
      label: "Interface",
      icon: Palette,
      color: "accent-orange",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: Shield,
      color: "accent-red",
    },
    {
      id: "data",
      label: "Data",
      icon: Database,
      color: "accent-blue",
    },
  ];

  // Save settings to localStorage
  // Handle save status for user feedback
  const handleUpdateSetting = (path, value) => {
    updateSetting(path, value);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(null), 2000);

    // Dispatch custom event to notify other components of settings changes
    window.dispatchEvent(
      new CustomEvent("settingsUpdated", {
        detail: { path, value },
      }),
    );
  };

  // Test notification functionality
  const testNotification = async () => {
    try {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        showNotification(
          "Test Notification",
          "Your notifications are working correctly!",
          { tag: "test-notification" },
        );
        playSound("completion");
        setSaveStatus("tested");
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch (error) {
      console.error("Notification test failed:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const exportSettings = () => {
    try {
      const allData = {
        settings,
        activities: loadFromStorage("activities", []),
        notes: loadFromStorage("notes", []),
        todos: loadFromStorage("todos", []),
        widgets: loadFromStorage("homepage-widgets", []),
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tenebris-os-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSaveStatus("exported");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        if (importedData.settings) {
          setSettings(importedData.settings);
        }
        if (importedData.activities) {
          saveToStorage("activities", importedData.activities);
        }
        if (importedData.notes) {
          saveToStorage("notes", importedData.notes);
        }
        if (importedData.todos) {
          saveToStorage("todos", importedData.todos);
        }
        if (importedData.widgets) {
          saveToStorage("homepage-widgets", importedData.widgets);
        }

        setSaveStatus("imported");
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        console.error("Error importing data:", error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone.",
      )
    ) {
      localStorage.clear();
      setSaveStatus("cleared");
      setTimeout(() => {
        setSaveStatus(null);
        window.location.reload();
      }, 2000);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const SettingItem = ({ label, description, children, warning = false }) => (
    <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg border border-dark-border hover:border-white/20 transition-all">
      <div className="flex-1">
        <div
          className={`font-medium ${warning ? "text-accent-red" : "text-dark-text"}`}
        >
          {label}
        </div>
        {description && (
          <div className="text-sm text-dark-text-muted mt-1">{description}</div>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            {/* Theme Selector */}
            <SettingItem
              label="Visual Theme"
              description="Choose your preferred visual style - Modern or Classic retro themes"
            >
              <div className="space-y-4">
                {/* Modern Themes */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">
                    Modern Themes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => changeTheme("default")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "default"
                          ? "border-accent-blue bg-accent-blue/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-blue/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dark-bg to-dark-surface border border-dark-border flex items-center justify-center">
                          <Moon size={16} className="text-accent-blue" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Tenebris Dark
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Modern dark interface
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => changeTheme("light")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "light"
                          ? "border-accent-blue bg-accent-blue/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-blue/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center">
                          <Sun size={16} className="text-accent-blue" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Tenebris Light
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Modern light interface
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Classic Retro Themes */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-3">
                    Classic Retro Themes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => changeTheme("retro-light")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "retro-light"
                          ? "border-accent-orange bg-accent-orange/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-orange/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-blue-600 border border-gray-400 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            XP
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Windows Classic
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Windows XP Luna style
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => changeTheme("retro-dark")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "retro-dark"
                          ? "border-accent-purple bg-accent-purple/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-purple/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-900 border border-blue-500 flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-xs">
                            7
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Windows Classic Dark
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Vista/7 Aero dark style
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => changeTheme("macos9-light")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "macos9-light"
                          ? "border-accent-green bg-accent-green/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-green/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 border border-gray-500 flex items-center justify-center">
                          <span className="text-gray-700 font-bold text-xs">
                            9
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Mac OS 9 Platinum
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Classic Mac interface
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => changeTheme("macos9-dark")}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        getActiveTheme() === "macos9-dark"
                          ? "border-accent-blue bg-accent-blue/10"
                          : "border-dark-border bg-dark-surface hover:border-accent-blue/50"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 border border-gray-500 flex items-center justify-center">
                          <span className="text-gray-300 font-bold text-xs">
                            9
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">
                            Mac OS 9 Dark
                          </h5>
                          <p className="text-xs text-dark-text-muted">
                            Dark Mac platinum
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Quick Toggle */}
                <div className="flex items-center justify-between p-3 bg-dark-surface rounded-lg border border-dark-border">
                  <div>
                    <span className="text-sm font-medium text-white">
                      Quick Theme Toggle
                    </span>
                    <p className="text-xs text-dark-text-muted">
                      Switch between modern and classic instantly
                    </p>
                  </div>
                  <motion.button
                    onClick={toggleRetroTheme}
                    className="px-4 py-2 bg-accent-purple rounded-lg text-white font-medium hover:bg-accent-purple/80 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {getActiveTheme().includes("retro") ||
                    getActiveTheme().includes("macos9")
                      ? "Go Modern"
                      : "Go Retro"}
                  </motion.button>
                </div>

                {/* Active Theme Preview */}
                {(getActiveTheme().includes("retro") ||
                  getActiveTheme().includes("macos9")) && (
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg border-2 border-blue-400">
                    <div className="text-black text-sm">
                      <div className="font-bold mb-2">
                        🎉 Classic Theme Active!
                      </div>
                      <p>
                        You're now using a nostalgic computing interface. The
                        entire site has been transformed with authentic retro
                        styling, typography, and interactions!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SettingItem>

            <SettingItem
              label="Notifications"
              description="Enable system notifications"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "notifications.enabled",
                    !settings.notifications?.enabled,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.notifications?.enabled
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications?.enabled
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Test Notifications"
              description="Send a test notification to verify everything is working"
            >
              <button
                onClick={testNotification}
                className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-all text-sm font-medium"
              >
                Send Test
              </button>
            </SettingItem>

            <SettingItem
              label="Activity Reminders"
              description="Get reminded about scheduled activities"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "notifications.activityReminders",
                    !settings.notifications?.activityReminders,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.notifications?.activityReminders
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications?.activityReminders
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Break Reminders"
              description="Get reminded to take breaks"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "notifications.breakReminders",
                    !settings.notifications?.breakReminders,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.notifications?.breakReminders
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.notifications?.breakReminders
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Default Activity Duration"
              description="Default time for new activities (minutes)"
            >
              <select
                value={settings.activity?.defaultDuration || 30}
                onChange={(e) =>
                  handleUpdateSetting(
                    "activity.defaultDuration",
                    parseInt(e.target.value),
                  )
                }
                className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
              >
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </SettingItem>

            <SettingItem
              label="Auto-start Breaks"
              description="Automatically start break activities after work sessions"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "activity.autoStartBreaks",
                    !settings.activity?.autoStartBreaks,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.activity?.autoStartBreaks
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.activity?.autoStartBreaks
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Track Idle Time"
              description="Automatically pause activities when inactive"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "activity.trackIdleTime",
                    !settings.activity?.trackIdleTime,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.activity?.trackIdleTime
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.activity?.trackIdleTime
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle size={16} className="text-accent-green mt-0.5" />
                <div className="text-sm text-dark-text">
                  <p className="font-medium mb-1">AI Features Enabled</p>
                  <p className="text-dark-text-secondary">
                    All AI-powered features are ready to use in production mode.
                    Generate schedules and get intelligent activity suggestions.
                  </p>
                </div>
              </div>
            </div>

            <SettingItem
              label="AI Suggestions"
              description="Enable AI-powered activity suggestions"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "ai.enableSuggestions",
                    !settings.ai?.enableSuggestions,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.ai?.enableSuggestions
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.ai?.enableSuggestions
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="AI Scheduling"
              description="Use AI to generate and optimize schedules"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "ai.enableScheduling",
                    !settings.ai?.enableScheduling,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.ai?.enableScheduling
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.ai?.enableScheduling
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info size={16} className="text-accent-blue mt-0.5" />
                <div className="text-sm text-dark-text">
                  <p className="font-medium mb-1">About OpenAI Integration</p>
                  <p className="text-dark-text-secondary">
                    Your API key is stored locally and never sent to our
                    servers. It's only used to communicate directly with
                    OpenAI's services for AI features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "interface":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Animations"
              description="Enable smooth animations and transitions"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "interface.animationsEnabled",
                    !settings.interface?.animationsEnabled,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.interface?.animationsEnabled
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.interface?.animationsEnabled
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Compact Mode"
              description="Use a more compact interface layout"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "interface.compactMode",
                    !settings.interface?.compactMode,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.interface?.compactMode
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.interface?.compactMode
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Show Seconds"
              description="Display seconds in time displays"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "interface.showSeconds",
                    !settings.interface?.showSeconds,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.interface?.showSeconds
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.interface?.showSeconds
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Data Collection"
              description="Allow collection of usage data to improve the app"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "privacy.dataCollection",
                    !settings.privacy?.dataCollection,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.privacy?.dataCollection
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.privacy?.dataCollection
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Analytics"
              description="Send anonymous analytics data"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "privacy.analytics",
                    !settings.privacy?.analytics,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.privacy?.analytics
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.privacy?.analytics
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <SettingItem
              label="Crash Reporting"
              description="Automatically send crash reports to help fix bugs"
            >
              <button
                onClick={() =>
                  handleUpdateSetting(
                    "privacy.crashReporting",
                    !settings.privacy?.crashReporting,
                  )
                }
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.privacy?.crashReporting
                    ? "bg-accent-green"
                    : "bg-dark-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.privacy?.crashReporting
                      ? "translate-x-6"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </SettingItem>

            <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield size={16} className="text-accent-green mt-0.5" />
                <div className="text-sm text-dark-text">
                  <p className="font-medium mb-1">Privacy First</p>
                  <p className="text-dark-text-secondary">
                    All your data is stored locally on your device. We never
                    collect or store your personal information on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <SettingItem
              label="Export Data"
              description="Download all your data as a backup file"
            >
              <button
                onClick={exportSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 transition-colors"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </SettingItem>

            <SettingItem
              label="Import Data"
              description="Restore data from a backup file"
            >
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button className="flex items-center space-x-2 px-4 py-2 bg-accent-green text-white rounded-lg font-medium hover:bg-accent-green/90 transition-colors">
                  <Upload size={16} />
                  <span>Import</span>
                </button>
              </div>
            </SettingItem>

            <SettingItem
              label="Clear All Data"
              description="Remove all data and reset the app"
              warning={true}
            >
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 px-4 py-2 bg-accent-red text-white rounded-lg font-medium hover:bg-accent-red/90 transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            </SettingItem>

            <div className="p-4 bg-accent-orange/10 border border-accent-orange/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  size={16}
                  className="text-accent-orange mt-0.5"
                />
                <div className="text-sm text-dark-text">
                  <p className="font-medium mb-1">Data Management</p>
                  <p className="text-dark-text-secondary">
                    Export your data regularly to prevent loss. Clearing data
                    cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24 pt-8">
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-dark-text mb-2">
                Settings
              </h1>
              <p className="text-dark-text-secondary">
                Configure your Tenebris OS experience
              </p>
            </div>
          </div>

          {/* Save Status */}
          <AnimatePresence>
            {saveStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  saveStatus === "saved"
                    ? "bg-accent-green/20 text-accent-green"
                    : saveStatus === "error"
                      ? "bg-accent-red/20 text-accent-red"
                      : "bg-accent-blue/20 text-accent-blue"
                }`}
              >
                {saveStatus === "saved" && <CheckCircle size={16} />}
                {saveStatus === "error" && <X size={16} />}
                {(saveStatus === "exported" ||
                  saveStatus === "imported" ||
                  saveStatus === "cleared") && <CheckCircle size={16} />}
                <span className="text-sm font-medium">
                  {saveStatus === "saved" && "Settings saved"}
                  {saveStatus === "exported" && "Data exported"}
                  {saveStatus === "imported" && "Data imported"}
                  {saveStatus === "cleared" && "Data cleared"}
                  {saveStatus === "tested" && "Notification sent"}
                  {saveStatus === "error" && "Error occurred"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-${tab.color}/20 text-${tab.color} border border-${tab.color}/30`
                    : "text-dark-text-muted hover:text-dark-text hover:bg-white/5"
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          variants={fadeInUp}
          className="glass rounded-xl p-6 border border-white/10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* About Section */}
        <motion.div
          variants={fadeInUp}
          className="mt-8 glass rounded-xl p-6 border border-white/10"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-dark-text mb-2">
              Tenebris OS
            </h3>
            <p className="text-dark-text-secondary mb-4">
              A sophisticated personal productivity operating system
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-dark-text-muted">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Built with React</span>
              <span>•</span>
              <span>© 2024</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Settings;

import React, { createContext, useContext, useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../utils/helpers.js";

// Use environment variable for API key
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

const defaultSettings = {
  theme: "dark",
  notifications: {
    enabled: true,
    activityReminders: true,
    breakReminders: true,
    completionSounds: true,
  },
  activity: {
    defaultDuration: 30,
    autoStartBreaks: false,
    trackIdleTime: true,
    autoCompleteActivities: false,
  },
  ai: {
    apiKey: DEFAULT_API_KEY,
    enableSuggestions: true,
    enableScheduling: true,
  },
  privacy: {
    dataCollection: true,
    analytics: false,
    crashReporting: true,
  },
  interface: {
    animationsEnabled: true,
    compactMode: false,
    showSeconds: false,
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = loadFromStorage("app-settings", defaultSettings);
      return { ...defaultSettings, ...saved };
    } catch (error) {
      console.error("Error loading settings:", error);
      return defaultSettings;
    }
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      saveToStorage("app-settings", settings);
      // Also save API key separately for backward compatibility
      saveToStorage("openai_api_key", settings.ai?.apiKey || "");
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [settings]);

  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
    if (settings.theme === "light") {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark-theme");
    } else {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.classList.remove("light-theme");
    }
  }, [settings.theme]);

  // Apply interface settings
  useEffect(() => {
    // Disable animations if setting is off
    if (!settings.interface.animationsEnabled) {
      document.documentElement.style.setProperty("--animation-duration", "0ms");
      document.documentElement.style.setProperty(
        "--transition-duration",
        "0ms",
      );
    } else {
      document.documentElement.style.removeProperty("--animation-duration");
      document.documentElement.style.removeProperty("--transition-duration");
    }

    // Apply compact mode
    if (settings.interface.compactMode) {
      document.documentElement.classList.add("compact-mode");
    } else {
      document.documentElement.classList.remove("compact-mode");
    }
  }, [settings.interface.animationsEnabled, settings.interface.compactMode]);

  const updateSetting = (path, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev };
      const keys = path.split(".");
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  // Notification functions
  const showNotification = (title, body, options = {}) => {
    if (!settings.notifications.enabled) return false;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
      return true;
    }
    return false;
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  };

  // Sound functions
  const playSound = (type = "completion") => {
    if (!settings.notifications.completionSounds) return;

    try {
      // Create audio context for web audio API
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Different tones for different types
      const frequencies = {
        completion: [523.25, 659.25, 783.99], // C5, E5, G5
        reminder: [440, 554.37], // A4, C#5
        break: [349.23, 415.3], // F4, G#4
      };

      const freq = frequencies[type] || frequencies.completion;

      freq.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime,
        );
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.1,
          audioContext.currentTime + 0.01,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          audioContext.currentTime + 0.3,
        );

        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 0.3 + index * 0.1);
      });
    } catch (error) {
      console.warn("Could not play sound:", error);
    }
  };

  // Activity reminder functions
  const scheduleActivityReminder = (activityName, delay = 60000) => {
    if (!settings.notifications.activityReminders) return null;

    return setTimeout(() => {
      showNotification(
        "Activity Reminder",
        `Don't forget about your ${activityName} activity!`,
        { tag: "activity-reminder" },
      );
    }, delay);
  };

  const scheduleBreakReminder = (duration = 30000) => {
    if (!settings.notifications.breakReminders) return null;

    return setTimeout(() => {
      showNotification(
        "Break Time",
        "It's time for a break! You've been working hard.",
        { tag: "break-reminder" },
      );
      playSound("break");
    }, duration);
  };

  // Analytics function (respects privacy settings)
  const trackEvent = (eventName, eventData = {}) => {
    if (!settings.privacy.analytics) return;

    // Only track if user has enabled analytics
    console.log(`Analytics Event: ${eventName}`, eventData);

    // Here you would integrate with your analytics service
    // For now, we'll just log to console
  };

  // Error reporting function (respects privacy settings)
  const reportError = (error, context = {}) => {
    if (!settings.privacy.crashReporting) return;

    console.error("Error reported:", error, context);

    // Here you would integrate with your error reporting service
    // For now, we'll just log to console
  };

  // Get setting helper function
  const getSetting = (path, defaultValue = null) => {
    const keys = path.split(".");
    let current = settings;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }

    return current;
  };

  const contextValue = {
    settings,
    updateSetting,
    getSetting,
    showNotification,
    requestNotificationPermission,
    playSound,
    scheduleActivityReminder,
    scheduleBreakReminder,
    trackEvent,
    reportError,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;

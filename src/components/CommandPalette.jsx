import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  BookOpen,
  Lightbulb,
  Dumbbell,
  Settings,
  User,
  BarChart3,
  Clock,
  Calendar,
  Activity,
  Command,
  ArrowRight,
  Hash,
  Coffee,
  Moon,
  Sun,
  Home,
  FileText,
  Trash2,
  Archive,
  Star,
  History,
} from "lucide-react";
import clsx from "clsx";

const CommandPalette = ({
  isOpen,
  onClose,
  onStartActivity,
  onNavigate,
  onToggleTheme,
  currentTheme = "dark",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Command categories and definitions
  const commands = [
    // Activity commands
    {
      id: "start-run",
      label: "Start Running Session",
      description: "Begin a new running activity",
      icon: Play,
      category: "Activity",
      keywords: ["run", "exercise", "fitness", "cardio"],
      action: () => onStartActivity({ label: "Running", id: "running" }),
      shortcut: "R",
    },
    {
      id: "start-learning",
      label: "Begin Learning Session",
      description: "Start focused learning time",
      icon: BookOpen,
      category: "Activity",
      keywords: ["learn", "study", "education", "skill"],
      action: () => onStartActivity({ label: "Learning", id: "learning" }),
      shortcut: "L",
    },
    {
      id: "start-lifting",
      label: "Weight Lifting Session",
      description: "Begin strength training",
      icon: Dumbbell,
      category: "Activity",
      keywords: ["lift", "weights", "strength", "gym", "workout"],
      action: () => onStartActivity({ label: "Weight Lifting", id: "lifting" }),
      shortcut: "W",
    },
    {
      id: "start-focus",
      label: "Focus Mode",
      description: "Enter deep work session",
      icon: Clock,
      category: "Activity",
      keywords: ["focus", "work", "deep", "concentrate", "pomodoro"],
      action: () => onStartActivity({ label: "Focus Session", id: "focus" }),
      shortcut: "F",
    },
    {
      id: "take-break",
      label: "Take Break",
      description: "Start a rest period",
      icon: Coffee,
      category: "Activity",
      keywords: ["break", "rest", "pause", "relax"],
      action: () => onStartActivity({ label: "Break", id: "break" }),
      shortcut: "B",
    },

    // Navigation commands
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      description: "Navigate to main dashboard",
      icon: Home,
      category: "Navigation",
      keywords: ["dashboard", "home", "main"],
      action: () => onNavigate("/"),
      shortcut: "H",
    },
    {
      id: "nav-stats",
      label: "View Statistics",
      description: "Open analytics and stats",
      icon: BarChart3,
      category: "Navigation",
      keywords: ["stats", "analytics", "metrics", "data"],
      action: () => onNavigate("/statistics"),
      shortcut: "S",
    },
    {
      id: "nav-calendar",
      label: "Open Calendar",
      description: "View schedule and events",
      icon: Calendar,
      category: "Navigation",
      keywords: ["calendar", "schedule", "events", "time"],
      action: () => onNavigate("/schedule"),
      shortcut: "C",
    },
    {
      id: "nav-activities",
      label: "Activity History",
      description: "View past activities",
      icon: History,
      category: "Navigation",
      keywords: ["history", "activities", "log", "past"],
      action: () => onNavigate("/activities"),
      shortcut: "A",
    },

    // System commands
    {
      id: "toggle-theme",
      label:
        currentTheme === "dark"
          ? "Switch to Light Mode"
          : "Switch to Dark Mode",
      description: "Toggle between dark and light themes",
      icon: currentTheme === "dark" ? Sun : Moon,
      category: "System",
      keywords: ["theme", "dark", "light", "mode", "appearance"],
      action: onToggleTheme,
      shortcut: "T",
    },
    {
      id: "open-settings",
      label: "Open Settings",
      description: "Configure system preferences",
      icon: Settings,
      category: "System",
      keywords: ["settings", "preferences", "config", "options"],
      action: () => onNavigate("/settings"),
      shortcut: ",",
    },
    {
      id: "user-profile",
      label: "User Profile",
      description: "View and edit profile",
      icon: User,
      category: "System",
      keywords: ["profile", "user", "account", "personal"],
      action: () => onNavigate("/profile"),
      shortcut: "U",
    },

    // Quick actions
    {
      id: "new-idea",
      label: "Capture New Idea",
      description: "Quick note for scratchpad",
      icon: Lightbulb,
      category: "Quick Actions",
      keywords: ["idea", "note", "thought", "capture", "scratchpad"],
      action: () => {
        onClose();
        setTimeout(() => document.getElementById("scratchpad")?.focus(), 100);
      },
      shortcut: "I",
    },
    {
      id: "clear-scratchpad",
      label: "Clear Scratchpad",
      description: "Remove all notes",
      icon: Trash2,
      category: "Quick Actions",
      keywords: ["clear", "delete", "remove", "scratchpad"],
      action: () => {
        // This would be handled by parent component
        console.log("Clear scratchpad");
      },
      shortcut: "X",
    },
  ];

  // Filter commands based on search query
  const filteredCommands = commands.filter((command) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      command.label.toLowerCase().includes(query) ||
      command.description.toLowerCase().includes(query) ||
      command.category.toLowerCase().includes(query) ||
      command.keywords.some((keyword) => keyword.includes(query))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {});

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0,
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1,
          );
          break;

        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose();
          break;

        default:
          // Handle shortcut keys only when search is empty and not typing in input
          if (e.metaKey || e.ctrlKey) return;

          // Don't trigger shortcuts when typing in the search input
          if (e.target && e.target.type === "text") return;

          // Only allow shortcuts when search query is completely empty
          if (searchQuery && searchQuery.trim() !== "") return;

          const shortcutCommand = commands.find(
            (cmd) =>
              cmd.shortcut &&
              cmd.shortcut.toLowerCase() === e.key.toLowerCase(),
          );
          if (shortcutCommand) {
            e.preventDefault();
            executeCommand(shortcutCommand);
          }
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex, searchQuery, onClose],
  );

  // Execute command
  const executeCommand = (command) => {
    try {
      command.action();

      // Add to recent commands
      setRecentCommands((prev) => {
        const filtered = prev.filter((cmd) => cmd.id !== command.id);
        return [command, ...filtered].slice(0, 5);
      });

      // Close palette and reset state
      onClose();
      setSearchQuery("");
      setSelectedIndex(0);

      // Navigate to home page if starting an activity with refresh parameter for immediate display
      if (command.category === "Activity") {
        setTimeout(() => onNavigate("/?refresh=activities"), 100);
      }
    } catch (error) {
      console.error("Error executing command:", error);
    }
  };

  // Reset state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchQuery("");
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const CommandItem = ({ command, index, isSelected }) => (
    <motion.div
      className={clsx(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150",
        "border border-transparent",
        {
          "bg-accent-blue/20 border-accent-blue/50": isSelected,
          "hover:bg-white/5": !isSelected,
        },
      )}
      onClick={() => executeCommand(command)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center space-x-3">
        <div
          className={clsx(
            "flex items-center justify-center w-8 h-8 rounded-lg",
            "bg-dark-surface border border-dark-border",
            {
              "bg-accent-blue/20 border-accent-blue/50": isSelected,
            },
          )}
        >
          <command.icon
            size={16}
            className={clsx("text-dark-text-secondary", {
              "text-accent-blue": isSelected,
            })}
          />
        </div>

        <div>
          <div
            className={clsx("font-medium", {
              "text-accent-blue": isSelected,
              "text-dark-text": !isSelected,
            })}
          >
            {command.label}
          </div>
          <div className="text-sm text-dark-text-muted">
            {command.description}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {command.shortcut && !searchQuery && (
          <kbd className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded">
            {command.shortcut}
          </kbd>
        )}
        <ArrowRight size={14} className="text-dark-text-muted" />
      </div>
    </motion.div>
  );

  const CategorySection = ({ category, commands }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3 px-1">
        <Hash size={14} className="text-dark-text-muted" />
        <h3 className="text-sm font-medium text-dark-text-secondary uppercase tracking-wide">
          {category}
        </h3>
      </div>
      <div className="space-y-1">
        {commands.map((command) => {
          const globalIndex = filteredCommands.findIndex(
            (cmd) => cmd.id === command.id,
          );
          return (
            <CommandItem
              key={command.id}
              command={command}
              index={globalIndex}
              isSelected={globalIndex === selectedIndex}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm"
          style={{ paddingTop: "10vh" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl glass rounded-2xl border border-white/20 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Search size={20} className="text-dark-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-lg placeholder:text-dark-text-muted focus:outline-none"
                />
                <div className="flex items-center space-x-2">
                  <kbd className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded">
                    ⌘K
                  </kbd>
                  <kbd className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>

            {/* Command List */}
            <div
              className="max-h-80 overflow-y-auto scrollbar-hide p-6"
              ref={listRef}
            >
              {filteredCommands.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-dark-text-muted mb-2">
                    No commands found
                  </div>
                  <div className="text-sm text-dark-text-muted">
                    Try searching for activities, navigation, or system commands
                  </div>
                </div>
              ) : !searchQuery && recentCommands.length > 0 ? (
                <>
                  <CategorySection
                    category="Recent"
                    commands={recentCommands}
                  />
                  {Object.entries(groupedCommands).map(
                    ([category, commands]) => (
                      <CategorySection
                        key={category}
                        category={category}
                        commands={commands}
                      />
                    ),
                  )}
                </>
              ) : (
                Object.entries(groupedCommands).map(([category, commands]) => (
                  <CategorySection
                    key={category}
                    category={category}
                    commands={commands}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-dark-text-muted">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1 py-0.5 bg-dark-surface border border-dark-border rounded text-xs">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1 py-0.5 bg-dark-surface border border-dark-border rounded text-xs">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1 py-0.5 bg-dark-surface border border-dark-border rounded text-xs">
                      ESC
                    </kbd>
                    <span>Close</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Command size={12} />
                  <span>Tenebris OS</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;

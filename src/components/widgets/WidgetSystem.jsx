import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Settings,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Edit3,
  Quote,
  CheckSquare,
  FileText,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { saveToStorage, loadFromStorage } from "../../utils/helpers.js";

// Individual Widget Components
import NotesWidget from "./NotesWidget";
import TodosWidget from "./TodosWidget";
import QuoteWidget from "./QuoteWidget";
import StatsWidget from "./StatsWidget";
import ScheduleWidget from "./ScheduleWidget";

const WidgetSystem = () => {
  const [widgets, setWidgets] = useState(() => {
    try {
      return (
        loadFromStorage("homepage-widgets", [
          {
            id: "quote",
            type: "quote",
            position: 0,
            visible: true,
            size: "small",
          },
          {
            id: "todos-today",
            type: "todos-today",
            position: 1,
            visible: true,
            size: "medium",
          },
          {
            id: "notes",
            type: "notes",
            position: 2,
            visible: true,
            size: "medium",
          },
          {
            id: "stats",
            type: "stats",
            position: 3,
            visible: true,
            size: "small",
          },
        ]) || []
      );
    } catch (error) {
      console.error("Error loading widgets:", error);
      return [
        {
          id: "quote",
          type: "quote",
          position: 0,
          visible: true,
          size: "small",
        },
        {
          id: "todos-today",
          type: "todos-today",
          position: 1,
          visible: true,
          size: "medium",
        },
        {
          id: "notes",
          type: "notes",
          position: 2,
          visible: true,
          size: "medium",
        },
        {
          id: "stats",
          type: "stats",
          position: 3,
          visible: true,
          size: "small",
        },
      ];
    }
  });

  const [isCustomizing, setIsCustomizing] = useState(false);
  const [availableWidgets] = useState([
    {
      id: "quote",
      type: "quote",
      name: "Daily Quote",
      description: "Inspirational quote or verse of the day",
      icon: Quote,
      color: "accent-purple",
      sizes: ["small", "medium"],
    },
    {
      id: "todos-today",
      type: "todos-today",
      name: "Today's Tasks",
      description: "Tasks due today",
      icon: CheckSquare,
      color: "accent-blue",
      sizes: ["small", "medium", "large"],
    },
    {
      id: "todos-tomorrow",
      type: "todos-tomorrow",
      name: "Tomorrow's Tasks",
      description: "Tasks due tomorrow",
      icon: Calendar,
      color: "accent-green",
      sizes: ["small", "medium", "large"],
    },
    {
      id: "notes",
      type: "notes",
      name: "Recent Notes",
      description: "Your latest notes and thoughts",
      icon: FileText,
      color: "accent-orange",
      sizes: ["small", "medium", "large"],
    },
    {
      id: "schedule",
      type: "schedule",
      name: "Upcoming Schedule",
      description: "Your next scheduled activities",
      icon: Clock,
      color: "accent-red",
      sizes: ["medium", "large"],
    },
    {
      id: "stats",
      type: "stats",
      name: "Activity Stats",
      description: "Quick overview of your productivity",
      icon: TrendingUp,
      color: "accent-blue",
      sizes: ["small", "medium"],
    },
  ]);

  // Save widgets configuration
  useEffect(() => {
    saveToStorage("homepage-widgets", widgets);
  }, [widgets]);

  const addWidget = (widgetType) => {
    const widgetTemplate = availableWidgets.find((w) => w.type === widgetType);
    if (!widgetTemplate) return;

    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      position: widgets.length,
      visible: true,
      size: widgetTemplate.sizes[0],
    };

    setWidgets((prev) => [...prev, newWidget]);
  };

  const removeWidget = (widgetId) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
  };

  const toggleWidgetVisibility = (widgetId) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget,
      ),
    );
  };

  const changeWidgetSize = (widgetId, newSize) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === widgetId ? { ...widget, size: newSize } : widget,
      ),
    );
  };

  const moveWidget = (widgetId, direction) => {
    setWidgets((prev) => {
      const currentIndex = prev.findIndex((w) => w.id === widgetId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newWidgets = [...prev];
      [newWidgets[currentIndex], newWidgets[newIndex]] = [
        newWidgets[newIndex],
        newWidgets[currentIndex],
      ];

      return newWidgets.map((widget, index) => ({
        ...widget,
        position: index,
      }));
    });
  };

  const renderWidget = (widget) => {
    const commonProps = {
      widgetId: widget.id,
      size: widget.size,
      isCustomizing,
    };

    switch (widget.type) {
      case "quote":
        return <QuoteWidget {...commonProps} />;
      case "todos-today":
        return (
          <TodosWidget {...commonProps} filter="today" title="Today's Tasks" />
        );
      case "todos-tomorrow":
        return (
          <TodosWidget
            {...commonProps}
            filter="tomorrow"
            title="Tomorrow's Tasks"
          />
        );
      case "notes":
        return <NotesWidget {...commonProps} />;
      case "schedule":
        return <ScheduleWidget {...commonProps} />;
      case "stats":
        return <StatsWidget {...commonProps} />;
      default:
        return null;
    }
  };

  const getGridClass = (size) => {
    switch (size) {
      case "small":
        return "md:col-span-1";
      case "medium":
        return "md:col-span-2";
      case "large":
        return "md:col-span-3";
      default:
        return "md:col-span-2";
    }
  };

  const getAvailableWidgetsToAdd = () => {
    const existingTypes = widgets.map((w) => w.type);
    return availableWidgets.filter((w) => !existingTypes.includes(w.type));
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-dark-text">
          Dashboard
        </h2>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isCustomizing
              ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
              : "text-dark-text-muted hover:text-dark-text hover:bg-white/5"
          }`}
        >
          <Settings size={16} />
          <span>{isCustomizing ? "Done" : "Customize"}</span>
        </button>
      </div>

      {/* Add Widget Interface */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-dark-text mb-4">
              Add Widgets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailableWidgetsToAdd().map((widget) => {
                const IconComponent = widget.icon;
                return (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-dark-surface rounded-lg border border-dark-border hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => addWidget(widget.type)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-${widget.color}/20 flex items-center justify-center`}
                      >
                        <IconComponent
                          size={20}
                          className={`text-${widget.color}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-dark-text">
                          {widget.name}
                        </h4>
                        <p className="text-sm text-dark-text-muted">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widgets Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {widgets
            .filter((widget) => widget.visible)
            .sort((a, b) => a.position - b.position)
            .map((widget, index) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`relative group ${getGridClass(widget.size)}`}
              >
                {/* Widget Controls (shown during customization) */}
                <AnimatePresence>
                  {isCustomizing && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute -top-3 -right-3 z-10 flex items-center space-x-2"
                    >
                      {/* Move controls */}
                      <div className="flex flex-col bg-dark-surface rounded-lg border border-dark-border overflow-hidden">
                        <button
                          onClick={() => moveWidget(widget.id, "up")}
                          disabled={index === 0}
                          className="p-1 text-dark-text-muted hover:text-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <GripVertical size={12} />
                        </button>
                        <button
                          onClick={() => moveWidget(widget.id, "down")}
                          disabled={
                            index ===
                            widgets.filter((w) => w.visible).length - 1
                          }
                          className="p-1 text-dark-text-muted hover:text-dark-text disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <GripVertical size={12} className="rotate-180" />
                        </button>
                      </div>

                      {/* Size controls */}
                      <select
                        value={widget.size}
                        onChange={(e) =>
                          changeWidgetSize(widget.id, e.target.value)
                        }
                        className="px-2 py-1 text-xs bg-dark-surface border border-dark-border rounded text-dark-text focus:outline-none"
                      >
                        {availableWidgets
                          .find((w) => w.type === widget.type)
                          ?.sizes.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                      </select>

                      {/* Toggle visibility */}
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className="p-2 bg-dark-surface rounded-lg border border-dark-border text-dark-text-muted hover:text-dark-text"
                      >
                        {widget.visible ? (
                          <Eye size={14} />
                        ) : (
                          <EyeOff size={14} />
                        )}
                      </button>

                      {/* Remove widget */}
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-2 bg-dark-surface rounded-lg border border-dark-border text-dark-text-muted hover:text-accent-red"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Widget Content */}
                {renderWidget(widget)}
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {widgets.filter((w) => w.visible).length === 0 && (
        <motion.div variants={fadeInUp} className="text-center py-16">
          <Zap className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-dark-text mb-2">
            No widgets active
          </h3>
          <p className="text-dark-text-secondary mb-6">
            Add some widgets to customize your dashboard
          </p>
          <button
            onClick={() => setIsCustomizing(true)}
            className="btn-primary"
          >
            <Plus size={16} className="mr-2" />
            Add Widgets
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default WidgetSystem;

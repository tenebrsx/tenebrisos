import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Circle,
  CheckCircle,
  Plus,
  Flag,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadFromStorage } from "../../utils/helpers.js";

const TodosWidget = ({
  widgetId,
  size = "medium",
  isCustomizing,
  filter = "today",
  title = "Tasks",
}) => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: "",
    priority: "medium",
    dueDate: "",
  });

  useEffect(() => {
    const loadTodos = () => {
      try {
        const savedTodos = loadFromStorage("todos", []) || [];
        let filteredTodos = savedTodos;

        // Apply filter
        const today = new Date().toDateString();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toDateString();

        switch (filter) {
          case "today":
            filteredTodos = savedTodos.filter(
              (todo) =>
                todo.dueDate && new Date(todo.dueDate).toDateString() === today,
            );
            break;
          case "tomorrow":
            filteredTodos = savedTodos.filter(
              (todo) =>
                todo.dueDate &&
                new Date(todo.dueDate).toDateString() === tomorrowStr,
            );
            break;
          case "active":
            filteredTodos = savedTodos.filter((todo) => !todo.completed);
            break;
          case "completed":
            filteredTodos = savedTodos.filter((todo) => todo.completed);
            break;
          default:
            filteredTodos = savedTodos.filter((todo) => !todo.completed);
        }

        // Sort by priority and due date
        filteredTodos = filteredTodos.sort((a, b) => {
          // Completed tasks go to bottom
          if (a.completed && !b.completed) return 1;
          if (!a.completed && b.completed) return -1;

          // Then by priority
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff =
            priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;

          // Finally by due date
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
          }
          return 0;
        });

        // Limit based on widget size
        const limit = size === "small" ? 3 : size === "medium" ? 5 : 8;
        setTodos(filteredTodos.slice(0, limit));
      } catch (error) {
        console.error("Error loading todos for widget:", error);
        setTodos([]);
      }
    };

    loadTodos();

    // Refresh todos every 30 seconds
    const interval = setInterval(loadTodos, 30000);
    return () => clearInterval(interval);
  }, [size, filter]);

  const handleCreateTodo = () => {
    if (!newTodo.title.trim()) return;

    const todoToSave = {
      id: Date.now(),
      title: newTodo.title.trim(),
      completed: false,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || null,
      createdAt: new Date().toISOString(),
      category: "personal",
    };

    try {
      const existingTodos = loadFromStorage("todos", []) || [];
      const updatedTodos = [todoToSave, ...existingTodos];
      localStorage.setItem("todos", JSON.stringify(updatedTodos));

      // Update local state
      const limit = size === "small" ? 3 : size === "medium" ? 5 : 8;
      setTodos([todoToSave, ...todos].slice(0, limit));

      // Reset form
      setNewTodo({ title: "", priority: "medium", dueDate: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  };

  const handleHeaderAction = () => {
    if (!isCustomizing) {
      if (todos.length === 0) {
        setShowCreateForm(true);
      } else {
        navigate("/todos");
      }
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "accent-red",
      medium: "accent-orange",
      low: "accent-green",
    };
    return colors[priority] || "accent-blue";
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: "accent-green",
      work: "accent-purple",
      health: "accent-red",
      learning: "accent-blue",
      shopping: "accent-orange",
    };
    return colors[category] || "accent-blue";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-4";
      case "medium":
        return "p-6";
      case "large":
        return "p-6";
      default:
        return "p-6";
    }
  };

  const getContentLimits = () => {
    switch (size) {
      case "small":
        return { titleLength: 25, descLength: 40 };
      case "medium":
        return { titleLength: 35, descLength: 60 };
      case "large":
        return { titleLength: 50, descLength: 80 };
      default:
        return { titleLength: 35, descLength: 60 };
    }
  };

  const limits = getContentLimits();

  const handleTodoClick = (todoId) => {
    if (!isCustomizing) {
      navigate("/todos");
    }
  };

  const toggleTodo = (todoId, event) => {
    event.stopPropagation();
    if (isCustomizing) return;

    try {
      const savedTodos = loadFromStorage("todos", []);
      const updatedTodos = savedTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              completed: !todo.completed,
              completedAt: !todo.completed ? new Date().toISOString() : null,
            }
          : todo,
      );

      // Save back to storage
      localStorage.setItem("todos", JSON.stringify(updatedTodos));

      // Update local state
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                completed: !todo.completed,
                completedAt: !todo.completed ? new Date().toISOString() : null,
              }
            : todo,
        ),
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const getWidgetIcon = () => {
    switch (filter) {
      case "today":
        return CheckSquare;
      case "tomorrow":
        return Calendar;
      default:
        return CheckSquare;
    }
  };

  const getWidgetColor = () => {
    switch (filter) {
      case "today":
        return "accent-blue";
      case "tomorrow":
        return "accent-green";
      default:
        return "accent-blue";
    }
  };

  const WidgetIcon = getWidgetIcon();
  const widgetColor = getWidgetColor();

  return (
    <motion.div
      className={`glass rounded-xl border border-white/10 hover:border-white/20 transition-all ${getSizeClasses()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-lg bg-${widgetColor}/20 flex items-center justify-center`}
          >
            <WidgetIcon size={16} className={`text-${widgetColor}`} />
          </div>
          <div>
            <h3 className="font-medium text-dark-text">{title}</h3>
            <p className="text-xs text-dark-text-muted">
              {filter === "today"
                ? "Due today"
                : filter === "tomorrow"
                  ? "Due tomorrow"
                  : "Your tasks"}
            </p>
          </div>
        </div>

        {!isCustomizing && (
          <motion.button
            onClick={handleHeaderAction}
            className="p-2 text-dark-text-muted hover:text-accent-blue transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Create new task"
          >
            <Plus size={16} />
          </motion.button>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {todos.length === 0 ? (
            !showCreateForm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <CheckSquare className="w-12 h-12 text-dark-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-dark-text-muted mb-3">
                  {filter === "today"
                    ? "No tasks due today"
                    : filter === "tomorrow"
                      ? "No tasks due tomorrow"
                      : "No tasks yet"}
                </p>
                {!isCustomizing && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Create your first task
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTodo.title}
                  onChange={(e) =>
                    setNewTodo((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 text-sm"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <select
                    value={newTodo.priority}
                    onChange={(e) =>
                      setNewTodo((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) =>
                      setNewTodo((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateTodo}
                    disabled={!newTodo.title.trim()}
                    className="flex-1 px-3 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Task
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTodo({
                        title: "",
                        priority: "medium",
                        dueDate: "",
                      });
                    }}
                    className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text-muted hover:text-dark-text transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )
          ) : (
            todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleTodoClick(todo.id)}
                className={`p-3 bg-dark-surface rounded-lg border border-dark-border transition-all group ${
                  !isCustomizing ? "hover:border-white/20 cursor-pointer" : ""
                } ${todo.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={(e) => toggleTodo(todo.id, e)}
                    className={`mt-0.5 transition-colors ${
                      todo.completed
                        ? "text-accent-green"
                        : "text-dark-text-muted hover:text-accent-green"
                    } ${isCustomizing ? "pointer-events-none" : ""}`}
                  >
                    {todo.completed ? (
                      <CheckCircle size={16} fill="currentColor" />
                    ) : (
                      <Circle size={16} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={`font-medium text-sm mb-1 ${
                            todo.completed
                              ? "line-through text-dark-text-muted"
                              : "text-dark-text"
                          }`}
                        >
                          {truncateText(todo.title, limits.titleLength)}
                        </h4>

                        {todo.description && (
                          <p className="text-xs text-dark-text-secondary mb-2">
                            {truncateText(todo.description, limits.descLength)}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <div
                                className={`w-2 h-2 rounded-full bg-${getCategoryColor(todo.category)}`}
                              />
                              <span className="text-xs text-dark-text-muted capitalize">
                                {todo.category}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Flag
                                size={10}
                                className={`text-${getPriorityColor(todo.priority)}`}
                              />
                              <span
                                className={`text-xs text-${getPriorityColor(todo.priority)} font-medium`}
                              >
                                {todo.priority}
                              </span>
                            </div>
                          </div>

                          {todo.dueDate && (
                            <span
                              className={`text-xs ${
                                new Date(todo.dueDate) < new Date() &&
                                !todo.completed
                                  ? "text-accent-red"
                                  : "text-dark-text-muted"
                              }`}
                            >
                              {formatDueDate(todo.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCustomizing && (
                        <ChevronRight
                          size={14}
                          className="text-dark-text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {todos.length > 0 && !isCustomizing && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate("/todos")}
            className={`w-full text-center text-sm text-${widgetColor} hover:text-${widgetColor}/80 transition-colors`}
          >
            View all tasks →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TodosWidget;

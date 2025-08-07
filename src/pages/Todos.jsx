import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Check,
  Trash2,
  Calendar,
  Clock,
  Flag,
  Filter,
  CheckCircle,
  Circle,
  Star,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  X,
} from "lucide-react";
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";

const Todos = () => {
  const [todos, setTodos] = useState(() => {
    try {
      return loadFromStorage("todos", []) || [];
    } catch (error) {
      console.error("Error loading todos:", error);
      return [];
    }
  });
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "personal",
    priority: "medium",
    dueDate: "",
  });

  const categories = [
    { id: "personal", label: "Personal", color: "accent-green", icon: Target },
    { id: "work", label: "Work", color: "accent-purple", icon: Zap },
    { id: "health", label: "Health", color: "accent-red", icon: AlertTriangle },
    {
      id: "learning",
      label: "Learning",
      color: "accent-blue",
      icon: TrendingUp,
    },
    { id: "shopping", label: "Shopping", color: "accent-orange", icon: Star },
  ];

  const priorities = [
    { id: "low", label: "Low", color: "accent-green" },
    { id: "medium", label: "Medium", color: "accent-orange" },
    { id: "high", label: "High", color: "accent-red" },
  ];

  const filters = [
    { id: "all", label: "All Tasks" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "overdue", label: "Overdue" },
  ];

  // Save todos to localStorage
  useEffect(() => {
    saveToStorage("todos", todos);
  }, [todos]);

  const handleCreateTodo = () => {
    if (!newTodo.title.trim()) return;

    const todo = {
      id: Date.now(),
      title: newTodo.title.trim(),
      description: newTodo.description.trim(),
      category: newTodo.category,
      priority: newTodo.priority,
      dueDate: newTodo.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTodos((prev) => [todo, ...prev]);
    setNewTodo({
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      dueDate: "",
    });
    setIsCreating(false);
  };

  const toggleTodo = (todoId) => {
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
  };

  const deleteTodo = (todoId) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  const isToday = (date) => {
    const today = new Date().toDateString();
    return new Date(date).toDateString() === today;
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(date).toDateString() === tomorrow.toDateString();
  };

  const isOverdue = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getFilteredTodos = () => {
    let filtered = todos;

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case "active":
        filtered = filtered.filter((todo) => !todo.completed);
        break;
      case "completed":
        filtered = filtered.filter((todo) => todo.completed);
        break;
      case "today":
        filtered = filtered.filter(
          (todo) => todo.dueDate && isToday(todo.dueDate),
        );
        break;
      case "tomorrow":
        filtered = filtered.filter(
          (todo) => todo.dueDate && isTomorrow(todo.dueDate),
        );
        break;
      case "overdue":
        filtered = filtered.filter(
          (todo) => todo.dueDate && isOverdue(todo.dueDate) && !todo.completed,
        );
        break;
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter((todo) => todo.priority === selectedPriority);
    }

    return filtered.sort((a, b) => {
      // Completed todos go to bottom
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      // Then by priority (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Finally by creation date
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const active = total - completed;
    const todayTodos = todos.filter(
      (todo) => todo.dueDate && isToday(todo.dueDate),
    ).length;
    const overdue = todos.filter(
      (todo) => todo.dueDate && isOverdue(todo.dueDate) && !todo.completed,
    ).length;

    return { total, completed, active, todayTodos, overdue };
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "accent-blue";
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find((p) => p.id === priority);
    return priorityObj?.color || "accent-orange";
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
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const filteredTodos = getFilteredTodos();
  const stats = getStats();

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
          <div>
            <h1 className="text-3xl font-display font-bold text-dark-text mb-2">
              To-Do List
            </h1>
            <p className="text-dark-text-secondary">
              Stay organized and get things done
            </p>
          </div>

          <motion.button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-accent-blue text-white rounded-xl font-medium hover:bg-accent-blue/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            <span>Add Task</span>
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-dark-text">
              {stats.total}
            </div>
            <div className="text-sm text-dark-text-muted">Total Tasks</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-accent-blue">
              {stats.active}
            </div>
            <div className="text-sm text-dark-text-muted">Active</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-accent-green">
              {stats.completed}
            </div>
            <div className="text-sm text-dark-text-muted">Completed</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-accent-orange">
              {stats.todayTodos}
            </div>
            <div className="text-sm text-dark-text-muted">Due Today</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-accent-red">
              {stats.overdue}
            </div>
            <div className="text-sm text-dark-text-muted">Overdue</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div variants={fadeInUp} className="space-y-4 mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                    : "text-dark-text-muted hover:text-dark-text hover:bg-white/5"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-dark-text-muted">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Todo List */}
        <motion.div variants={fadeInUp}>
          {filteredTodos.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-text mb-2">
                {searchQuery ||
                selectedFilter !== "all" ||
                selectedPriority !== "all"
                  ? "No tasks found"
                  : "No tasks yet"}
              </h3>
              <p className="text-dark-text-secondary mb-6">
                {searchQuery ||
                selectedFilter !== "all" ||
                selectedPriority !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first task to get started"}
              </p>
              {!searchQuery &&
                selectedFilter === "all" &&
                selectedPriority === "all" && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary"
                  >
                    Add First Task
                  </button>
                )}
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className={`glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all ${
                      todo.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`mt-1 transition-colors ${
                          todo.completed
                            ? "text-accent-green"
                            : "text-dark-text-muted hover:text-accent-green"
                        }`}
                      >
                        {todo.completed ? (
                          <CheckCircle size={20} fill="currentColor" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                todo.completed
                                  ? "line-through text-dark-text-muted"
                                  : "text-dark-text"
                              }`}
                            >
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p className="text-sm text-dark-text-secondary mt-1">
                                {todo.description}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="ml-4 p-1 text-dark-text-muted hover:text-accent-red transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full bg-${getCategoryColor(
                                  todo.category,
                                )}`}
                              />
                              <span className="text-xs text-dark-text-muted">
                                {
                                  categories.find(
                                    (cat) => cat.id === todo.category,
                                  )?.label
                                }
                              </span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <Flag
                                size={12}
                                className={`text-${getPriorityColor(todo.priority)}`}
                              />
                              <span
                                className={`text-xs text-${getPriorityColor(
                                  todo.priority,
                                )} font-medium`}
                              >
                                {
                                  priorities.find((p) => p.id === todo.priority)
                                    ?.label
                                }
                              </span>
                            </div>
                          </div>

                          {todo.dueDate && (
                            <div
                              className={`flex items-center space-x-1 text-xs ${
                                isOverdue(todo.dueDate) && !todo.completed
                                  ? "text-accent-red"
                                  : "text-dark-text-muted"
                              }`}
                            >
                              <Calendar size={12} />
                              <span>{formatDueDate(todo.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Create Todo Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg glass rounded-2xl border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-dark-text">
                  Add New Task
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewTodo({
                      title: "",
                      description: "",
                      category: "personal",
                      priority: "medium",
                      dueDate: "",
                    });
                  }}
                  className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTodo.title}
                    onChange={(e) =>
                      setNewTodo((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Description (optional)..."
                    value={newTodo.description}
                    onChange={(e) =>
                      setNewTodo((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-dark-text-muted mb-2">
                      Category
                    </label>
                    <select
                      value={newTodo.category}
                      onChange={(e) =>
                        setNewTodo((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-dark-text-muted mb-2">
                      Priority
                    </label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) =>
                        setNewTodo((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-dark-text-muted mb-2">
                    Due Date (optional)
                  </label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) =>
                      setNewTodo((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewTodo({
                        title: "",
                        description: "",
                        category: "personal",
                        priority: "medium",
                        dueDate: "",
                      });
                    }}
                    className="px-4 py-2 text-dark-text-muted hover:text-dark-text transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTodo}
                    disabled={!newTodo.title.trim()}
                    className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add Task</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Todos;

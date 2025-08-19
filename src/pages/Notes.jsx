import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  Filter,
  Calendar,
  Clock,
  Tag,
  FileText,
  Star,
  StarOff,
  Grid3X3,
  List,
  BookOpen,
  Eye,
  MoreHorizontal,
  Heart,
  Lightbulb,
  Briefcase,
  Coffee,
  Brain,
  Zap,
  SortDesc,
  SortAsc,
  Archive,
  Pin,
  PinOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  saveToStorage,
  loadFromStorage,
  formatTime,
} from "../utils/helpers.js";

const Notes = () => {
  const [notes, setNotes] = useState(() => {
    try {
      return loadFromStorage("notes", []) || [];
    } catch (error) {
      console.error("Error loading notes:", error);
      return [];
    }
  });

  // UI State
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [readingNote, setReadingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("masonry"); // masonry, grid, list
  const [sortBy, setSortBy] = useState("updated"); // updated, created, title, category
  const [sortOrder, setSortOrder] = useState("desc");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "personal",
    isFavorite: false,
    isPinned: false,
    tags: [],
  });

  const categories = [
    { id: "all", label: "All Notes", color: "accent-blue", icon: FileText },
    { id: "personal", label: "Personal", color: "accent-green", icon: Heart },
    { id: "work", label: "Work", color: "accent-purple", icon: Briefcase },
    { id: "ideas", label: "Ideas", color: "accent-orange", icon: Lightbulb },
    { id: "learning", label: "Learning", color: "accent-blue", icon: Brain },
    { id: "journal", label: "Journal", color: "accent-red", icon: Coffee },
  ];

  // Save notes to localStorage
  useEffect(() => {
    saveToStorage("notes", notes);
  }, [notes]);

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note = {
      id: Date.now(),
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      category: newNote.category,
      isFavorite: newNote.isFavorite,
      isPinned: newNote.isPinned,
      tags: newNote.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote({
      title: "",
      content: "",
      category: "personal",
      isFavorite: false,
      isPinned: false,
      tags: [],
    });
    setIsCreating(false);
  };

  const handleUpdateNote = () => {
    if (!editingNote.title.trim() || !editingNote.content.trim()) return;

    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNote.id
          ? {
              ...editingNote,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const toggleFavorite = (noteId) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              isFavorite: !note.isFavorite,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );
  };

  const togglePin = (noteId) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              isPinned: !note.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    );
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Sort notes
    filtered.sort((a, b) => {
      // Pinned notes always at top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then favorites
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // Then by selected sort
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "created":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default: // updated
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "accent-blue";
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.icon || FileText;
  };

  const truncateContent = (content, maxLength = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const getWordCount = (content) => {
    return content.trim().split(/\s+/).length;
  };

  const getReadingTime = (content) => {
    const words = getWordCount(content);
    const minutes = Math.ceil(words / 200); // Average reading speed
    return minutes;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const filteredNotes = getFilteredNotes();
  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const regularNotes = filteredNotes.filter((note) => !note.isPinned);

  // Note Card Component
  const NoteCard = ({ note, index }) => {
    const [showActions, setShowActions] = useState(false);
    const CategoryIcon = getCategoryIcon(note.category);

    return (
      <motion.div
        key={note.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Notebook Page Effect */}
        <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all cursor-pointer overflow-hidden">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-white/5" />
            <div className="absolute top-0 left-6 right-6 h-px bg-white/10" />
            <div className="absolute top-8 left-6 right-6 h-px bg-white/5" />
            <div className="absolute top-16 left-6 right-6 h-px bg-white/5" />
          </div>

          {/* Pin Indicator */}
          {note.isPinned && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center shadow-lg">
              <Pin size={12} className="text-white" fill="currentColor" />
            </div>
          )}

          {/* Quick Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 flex items-center space-x-1 bg-black/80 backdrop-blur-sm rounded-lg p-1"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(note.id);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    note.isPinned
                      ? "text-accent-orange bg-accent-orange/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {note.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(note.id);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    note.isFavorite
                      ? "text-accent-orange bg-accent-orange/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {note.isFavorite ? (
                    <Star size={14} fill="currentColor" />
                  ) : (
                    <StarOff size={14} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReadingNote(note);
                  }}
                  className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNote(note);
                  }}
                  className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="p-1.5 rounded text-white/60 hover:text-accent-red hover:bg-accent-red/20 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div className={`p-2 rounded-lg bg-${getCategoryColor(note.category)}/20`}>
              <CategoryIcon size={16} className={`text-${getCategoryColor(note.category)}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-medium text-${getCategoryColor(note.category)}`}>
                {categories.find((cat) => cat.id === note.category)?.label}
              </span>
              <span className="text-xs text-white/40">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Note Content */}
          <div onClick={() => setReadingNote(note)}>
            <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
              {note.title}
            </h3>

            <div className="prose prose-invert prose-sm max-w-none">
              <p className="text-white/70 text-sm leading-relaxed line-clamp-4 mb-4">
                {truncateContent(note.content)}
              </p>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {note.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 text-white/60 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 3 && (
                  <span className="text-xs text-white/40">
                    +{note.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Note Stats */}
            <div className="flex items-center justify-between text-xs text-white/40 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock size={10} />
                  <span>{getReadingTime(note.content)} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText size={10} />
                  <span>{getWordCount(note.content)} words</span>
                </div>
              </div>
              {(note.isFavorite || note.isPinned) && (
                <div className="flex items-center space-x-1">
                  {note.isPinned && (
                    <Pin size={10} className="text-accent-orange" fill="currentColor" />
                  )}
                  {note.isFavorite && (
                    <Star size={10} className="text-accent-orange" fill="currentColor" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Note Editor Component
  const NoteEditor = ({ note, onSave, onCancel, isEditing = false }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [category, setCategory] = useState(note.category);
    const [isFavorite, setIsFavorite] = useState(note.isFavorite);
    const [isPinned, setIsPinned] = useState(note.isPinned || false);
    const [tags, setTags] = useState(note.tags || []);
    const [newTag, setNewTag] = useState("");
    const contentRef = useRef(null);

    const handleSave = () => {
      if (isEditing) {
        setEditingNote({
          ...editingNote,
          title,
          content,
          category,
          isFavorite,
          isPinned,
          tags,
        });
        handleUpdateNote();
      } else {
        setNewNote({ title, content, category, isFavorite, isPinned, tags });
        handleCreateNote();
      }
    };

    const addTag = () => {
      if (newTag.trim() && !tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    };

    const removeTag = (tagToRemove) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-4xl h-[90vh] bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${getCategoryColor(category)}/20`}>
                <FileText size={20} className={`text-${getCategoryColor(category)}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? "Edit Note" : "Create New Note"}
                </h2>
                <p className="text-sm text-white/60">
                  {isEditing ? "Make your changes below" : "Capture your thoughts"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`p-2 rounded-lg transition-colors ${
                  isPinned
                    ? "bg-accent-orange/20 text-accent-orange"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite
                    ? "bg-accent-orange/20 text-accent-orange"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {isFavorite ? (
                  <Star size={18} fill="currentColor" />
                ) : (
                  <StarOff size={18} />
                )}
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-semibold bg-transparent border-none text-white placeholder:text-white/40 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Category and Tags */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue/50"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-black">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tags
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-blue/50"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-white/10 text-white/80 text-xs rounded-full"
                      >
                        <span>#{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-white/40 hover:text-white/80"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Content
              </label>
              <textarea
                ref={contentRef}
                placeholder="Start writing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-80 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-accent-blue/50 resize-none font-mono text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-white/40">
                <span>{getWordCount(content)} words • {getReadingTime(content)} min read</span>
                <span>{content.length} characters</span>
              </div>
            </div>
          </div>

          {/* Editor Footer */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-white/60">
              <Clock size={12} />
              <span>
                {isEditing
                  ? `Last edited ${formatTime(note.updatedAt)}`
                  : "New note"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="px-6 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Reading Mode Component
  const ReadingMode = ({ note, onClose }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      >
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Reading Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${getCategoryColor(note.category)}/20`}>
                {React.createElement(getCategoryIcon(note.category), {
                  size: 20,
                  className: `text-${getCategoryColor(note.category)}`,
                })}
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white">{note.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-white/60">
                  <span>{getWordCount(note.content)} words</span>
                  <span>{getReadingTime(note.content)} min read</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setReadingNote(null);
                  setEditingNote(note);
                }}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Reading Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="prose prose-invert prose-lg max-w-none">
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap font-mono">
                {note.content}
              </div>
            </div>

            {/* Tags in Reading Mode */}
            {note.tags && note.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/80 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-8">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 noise pointer-events-none opacity-5" />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6"
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
        {/* Premium Header */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 rounded-xl bg-accent-blue/20">
                <FileText size={24} className="text-accent-blue" />
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-white">
                  Notes
                </h1>
                <p className="text-white/60">
                  {notes.length} notes • {notes.filter((n) => n.isFavorite).length} favorites
                </p>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "masonry"
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-accent-blue/20 text-accent-blue"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                {sortOrder === "desc" ? <SortDesc size={16} /> : <SortAsc size={16} />}
              </button>
            </div>

            {/* Create Button */}
            <motion.button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-accent-blue text-white rounded-xl font-medium shadow-lg shadow-accent-blue/25"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              <span>New Note</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Search and Filter */}
        <motion.div
          variants={fadeInUp}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
              size={20}
            />
            <input
              type="text"
              placeholder="Search notes, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-accent-blue/50 focus:ring-2 focus:ring-accent-blue/20 transition-all backdrop-blur-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? `bg-${category.color}/20 text-${category.color} border border-${category.color}/30 shadow-lg shadow-${category.color}/10`
                      : "text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <CategoryIcon size={14} />
                  <span>{category.label}</span>
                  {category.id !== "all" && (
                    <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {notes.filter((n) => n.category === category.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Notes Display */}
        <motion.div variants={fadeInUp}>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-accent-blue/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-10 h-10 text-white/40" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {searchQuery || selectedCategory !== "all"
                  ? "No notes found"
                  : "Start Your Journey"}
              </h3>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter to find what you're looking for"
                  : "Create your first note and begin capturing your thoughts, ideas, and inspiration"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <motion.button
                  onClick={() => setIsCreating(true)}
                  className="bg-accent-blue text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-accent-blue/25"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create First Note
                </motion.button>
              )}
            </div>
          ) : (
            <>
              {/* Pinned Notes Section */}
              {pinnedNotes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Pin size={16} className="text-accent-orange" />
                    <h2 className="text-lg font-semibold text-white">Pinned Notes</h2>
                    <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">
                      {pinnedNotes.length}
                    </span>
                  </div>
                  <div className={`grid gap-6 ${
                    viewMode === "masonry"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                    <AnimatePresence>
                      {pinnedNotes.map((note, index) => (
                        <NoteCard key={note.id} note={note} index={index} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Regular Notes Section */}
              {regularNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText size={16} className="text-white/60" />
                      <h2 className="text-lg font-semibold text-white">All Notes</h2>
                      <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">
                        {regularNotes.length}
                      </span>
                    </div>
                  )}
                  <div className={`grid gap-6 ${
                    viewMode === "masonry"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}>
                    <AnimatePresence>
                      {regularNotes.map((note, index) => (
                        <NoteCard key={note.id} note={note} index={index + pinnedNotes.length} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Floating Quick Actions */}
      <motion.div
        className="fixed bottom-24 right-6 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4 space-y-2"
            >
              {categories.slice(1, 4).map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => {
                      setNewNote({ ...newNote, category: category.id });
                      setIsCreating(true);
                      setShowQuickActions(false);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 bg-${category.color}/20 text-${category.color} rounded-full text-sm font-medium backdrop-blur-sm border border-${category.color}/30 shadow-lg`}
                    whileHover={{ scale: 1.05, x: -10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CategoryIcon size={14} />
                    <span>{category.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-14 h-14 bg-accent-blue rounded-full shadow-lg shadow-accent-blue/25 flex items-center justify-center text-white"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: showQuickActions ? 45 : 0 }}
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <NoteEditor
            note={newNote}
            onSave={handleCreateNote}
            onCancel={() => {
              setIsCreating(false);
              setNewNote({
                title: "",
                content: "",
                category: "personal",
                isFavorite: false,
                isPinned: false,
                tags: [],
              });
            }}
          />
        )}
        {editingNote && (
          <NoteEditor
            note={editingNote}
            onSave={handleUpdateNote}
            onCancel={() => setEditingNote(null)}
            isEditing={true}
          />
        )}
        {readingNote && (
          <ReadingMode
            note={readingNote}
            onClose={() => setReadingNote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notes;

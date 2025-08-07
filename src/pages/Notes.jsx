import React, { useState, useEffect } from "react";
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "personal",
    isFavorite: false,
  });

  const categories = [
    { id: "all", label: "All Notes", color: "accent-blue" },
    { id: "personal", label: "Personal", color: "accent-green" },
    { id: "work", label: "Work", color: "accent-purple" },
    { id: "ideas", label: "Ideas", color: "accent-orange" },
    { id: "learning", label: "Learning", color: "accent-blue" },
    { id: "journal", label: "Journal", color: "accent-red" },
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [note, ...prev]);
    setNewNote({
      title: "",
      content: "",
      category: "personal",
      isFavorite: false,
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
          note.content.toLowerCase().includes(query),
      );
    }

    return filtered.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.color || "accent-blue";
  };

  const truncateContent = (content, maxLength = 120) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const filteredNotes = getFilteredNotes();

  // Note Editor Component
  const NoteEditor = ({ note, onSave, onCancel, isEditing = false }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [category, setCategory] = useState(note.category);
    const [isFavorite, setIsFavorite] = useState(note.isFavorite);

    const handleSave = () => {
      if (isEditing) {
        setEditingNote({
          ...editingNote,
          title,
          content,
          category,
          isFavorite,
        });
        handleUpdateNote();
      } else {
        setNewNote({ title, content, category, isFavorite });
        handleCreateNote();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div className="w-full max-w-2xl glass rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-semibold text-dark-text">
              {isEditing ? "Edit Note" : "Create New Note"}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
                autoFocus
              />
            </div>

            <div>
              <textarea
                placeholder="Start writing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text focus:outline-none focus:border-accent-blue/50 text-sm"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-lg transition-colors ${
                    isFavorite
                      ? "text-accent-orange"
                      : "text-dark-text-muted hover:text-dark-text"
                  }`}
                >
                  {isFavorite ? (
                    <Star size={20} fill="currentColor" />
                  ) : (
                    <StarOff size={20} />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-dark-text-muted hover:text-dark-text transition-colors"
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
          </div>
        </div>
      </motion.div>
    );
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
          <div>
            <h1 className="text-3xl font-display font-bold text-dark-text mb-2">
              Notes
            </h1>
            <p className="text-dark-text-secondary">
              Capture your thoughts, ideas, and insights
            </p>
          </div>

          <motion.button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-accent-blue text-white rounded-xl font-medium hover:bg-accent-blue/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            <span>New Note</span>
          </motion.button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/30 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? `bg-${category.color}/20 text-${category.color} border border-${category.color}/30`
                    : "text-dark-text-muted hover:text-dark-text hover:bg-white/5"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notes Grid */}
        <motion.div variants={fadeInUp}>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-dark-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-dark-text mb-2">
                {searchQuery || selectedCategory !== "all"
                  ? "No notes found"
                  : "No notes yet"}
              </h3>
              <p className="text-dark-text-secondary mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter"
                  : "Create your first note to get started"}
              </p>
              {!searchQuery && selectedCategory === "all" && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="btn-primary"
                >
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="card hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => setEditingNote(note)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-${getCategoryColor(
                            note.category,
                          )}`}
                        />
                        <span className="text-xs text-dark-text-muted uppercase tracking-wide">
                          {
                            categories.find((cat) => cat.id === note.category)
                              ?.label
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(note.id);
                          }}
                          className={`p-1 rounded transition-colors ${
                            note.isFavorite
                              ? "text-accent-orange"
                              : "text-dark-text-muted hover:text-dark-text"
                          }`}
                        >
                          {note.isFavorite ? (
                            <Star size={16} fill="currentColor" />
                          ) : (
                            <StarOff size={16} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(note);
                          }}
                          className="p-1 text-dark-text-muted hover:text-dark-text transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1 text-dark-text-muted hover:text-accent-red transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-dark-text mb-2 line-clamp-2">
                      {note.title}
                    </h3>

                    <p className="text-dark-text-secondary text-sm mb-4 line-clamp-3">
                      {truncateContent(note.content)}
                    </p>

                    <div className="flex items-center justify-between text-xs text-dark-text-muted">
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>
                          {new Date(note.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{note.content.length} chars</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Note Editor Modal */}
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
      </AnimatePresence>
    </div>
  );
};

export default Notes;

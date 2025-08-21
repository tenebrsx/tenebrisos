import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadFromStorage, saveToStorage } from "../../utils/helpers.js";

const NotesWidget = ({ widgetId, size = "medium", isCustomizing }) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    category: "personal",
  });

  useEffect(() => {
    const loadNotes = () => {
      try {
        const savedNotes = loadFromStorage("notes", []) || [];
        // Sort by most recent and limit based on widget size
        const limit = size === "small" ? 3 : size === "medium" ? 5 : 8;
        const recentNotes = savedNotes
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, limit);
        setNotes(recentNotes);
      } catch (error) {
        console.error("Error loading notes for widget:", error);
        setNotes([]);
      }
    };

    loadNotes();

    // Refresh notes every 30 seconds
    const interval = setInterval(loadNotes, 30000);
    return () => clearInterval(interval);
  }, [size]);

  const handleCreateNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    const noteToSave = {
      id: Date.now(),
      title: newNote.title.trim() || "Untitled Note",
      content: newNote.content.trim(),
      category: newNote.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
    };

    try {
      const existingNotes = loadFromStorage("notes", []) || [];
      const updatedNotes = [noteToSave, ...existingNotes];
      saveToStorage("notes", updatedNotes);

      // Update local state
      const limit = size === "small" ? 3 : size === "medium" ? 5 : 8;
      setNotes(updatedNotes.slice(0, limit));

      // Reset form
      setNewNote({ title: "", content: "", category: "personal" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleHeaderAction = () => {
    if (!isCustomizing) {
      if (notes.length === 0) {
        setShowCreateForm(true);
      } else {
        navigate("/notes");
      }
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: "accent-green",
      work: "accent-purple",
      ideas: "accent-orange",
      learning: "accent-blue",
      journal: "accent-red",
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
        return { titleLength: 25, contentLength: 40 };
      case "medium":
        return { titleLength: 35, contentLength: 60 };
      case "large":
        return { titleLength: 50, contentLength: 80 };
      default:
        return { titleLength: 35, contentLength: 60 };
    }
  };

  const limits = getContentLimits();

  const handleNoteClick = (noteId) => {
    if (!isCustomizing) {
      navigate("/notes");
    }
  };

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
          <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center">
            <FileText size={16} className="text-accent-orange" />
          </div>
          <div>
            <h3 className="font-medium text-dark-text">Recent Notes</h3>
            <p className="text-xs text-dark-text-muted">Latest thoughts</p>
          </div>
        </div>

        {!isCustomizing && (
          <motion.button
            onClick={handleHeaderAction}
            className="p-2 text-dark-text-muted hover:text-accent-orange transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Create new note"
          >
            <Plus size={16} />
          </motion.button>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notes.length === 0 ? (
            !showCreateForm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6"
              >
                <FileText className="w-12 h-12 text-dark-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-sm text-dark-text-muted mb-3">
                  No notes yet
                </p>
                {!isCustomizing && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-xs text-accent-orange hover:text-accent-orange/80 transition-colors"
                  >
                    Create your first note
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
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-orange/50 text-sm"
                  autoFocus
                />
                <textarea
                  placeholder="Write your note..."
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, content: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-orange/50 text-sm resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreateNote();
                    }}
                    disabled={!newNote.title.trim() && !newNote.content.trim()}
                    className="flex-1 px-3 py-2 bg-accent-orange/20 text-accent-orange rounded-lg hover:bg-accent-orange/30 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Note
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCreateForm(false);
                      setNewNote({
                        title: "",
                        content: "",
                        category: "personal",
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
            notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleNoteClick(note.id)}
                className={`p-3 bg-dark-surface rounded-lg border border-dark-border transition-all group ${
                  !isCustomizing ? "hover:border-white/20 cursor-pointer" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full bg-${getCategoryColor(note.category)}`}
                      />
                      <h4 className="font-medium text-dark-text text-sm truncate">
                        {truncateText(note.title, limits.titleLength)}
                      </h4>
                    </div>

                    <p className="text-xs text-dark-text-secondary line-clamp-2 mb-2">
                      {truncateText(note.content, limits.contentLength)}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-text-muted">
                        {formatDate(note.updatedAt)}
                      </span>
                      {note.isFavorite && (
                        <div className="text-accent-orange">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
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
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notes.length > 0 && !isCustomizing && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate("/notes")}
            className="w-full text-center text-sm text-accent-orange hover:text-accent-orange/80 transition-colors"
          >
            View all notes →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotesWidget;

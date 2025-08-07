import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Copy,
  Download,
  Upload,
  Trash2,
  Clock,
  Box,
  ArrowRight,
  Brain,
  FolderPlus,
  Star,
  StarOff,
} from "lucide-react";
import clsx from "clsx";
import { saveToStorage, loadFromStorage } from "../utils/helpers";

const MindmapDashboard = () => {
  const navigate = useNavigate();
  const [mindmaps, setMindmaps] = useState(() => {
    return loadFromStorage("user-mindmaps", []);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("lastModified");
  const [filterBy, setFilterBy] = useState("all");
  const [renamingMindmap, setRenamingMindmap] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Save mindmaps to storage whenever they change
  useEffect(() => {
    saveToStorage("user-mindmaps", mindmaps);
  }, [mindmaps]);

  // Filter and sort mindmaps
  const filteredMindmaps = mindmaps
    .filter((mindmap) => {
      const matchesSearch = mindmap.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (filterBy === "favorites") {
        return matchesSearch && mindmap.isFavorite;
      }
      if (filterBy === "recent") {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return matchesSearch && mindmap.lastModified > oneWeekAgo;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return b.created - a.created;
        case "lastModified":
        default:
          return b.lastModified - a.lastModified;
      }
    });

  // Create new mindmap
  const createNewMindmap = () => {
    const newMindmap = {
      id: Date.now().toString(),
      name: "Untitled Mindmap",
      created: Date.now(),
      lastModified: Date.now(),
      blockCount: 0,
      preview: null,
      isFavorite: false,
      description: "",
      tags: [],
    };

    setMindmaps((prev) => [newMindmap, ...prev]);
    navigate(`/mindmap/${newMindmap.id}`);
  };

  // Open mindmap
  const openMindmap = (mindmapId) => {
    navigate(`/mindmap/${mindmapId}`);
  };

  // Toggle favorite
  const toggleFavorite = (mindmapId) => {
    setMindmaps((prev) =>
      prev.map((mindmap) =>
        mindmap.id === mindmapId
          ? { ...mindmap, isFavorite: !mindmap.isFavorite }
          : mindmap,
      ),
    );
  };

  // Start renaming
  const startRename = (mindmap) => {
    setRenameValue(mindmap.name);
    setRenamingMindmap(mindmap.id);
  };

  // Save rename
  const saveRename = (mindmapId) => {
    if (renameValue.trim()) {
      setMindmaps((prev) =>
        prev.map((mindmap) =>
          mindmap.id === mindmapId
            ? { ...mindmap, name: renameValue.trim(), lastModified: Date.now() }
            : mindmap,
        ),
      );
    }
    setRenamingMindmap(null);
    setRenameValue("");
  };

  // Cancel rename
  const cancelRename = () => {
    setRenamingMindmap(null);
    setRenameValue("");
  };

  // Duplicate mindmap
  const duplicateMindmap = (mindmap) => {
    const duplicated = {
      ...mindmap,
      id: Date.now().toString(),
      name: `${mindmap.name} (Copy)`,
      created: Date.now(),
      lastModified: Date.now(),
      isFavorite: false,
    };

    setMindmaps((prev) => [duplicated, ...prev]);
  };

  // Delete mindmap
  const deleteMindmap = (mindmapId) => {
    setMindmaps((prev) => prev.filter((mindmap) => mindmap.id !== mindmapId));
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  // Mindmap card component
  const MindmapCard = ({ mindmap }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <motion.div
        className="group relative"
        layout={renamingMindmap !== mindmap.id}
        transition={
          renamingMindmap === mindmap.id ? { duration: 0 } : { duration: 0.3 }
        }
      >
        <div
          className={clsx(
            "relative rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden",
            "bg-dark-surface/40 border-white/10 hover:border-white/20",
            "backdrop-blur-sm group-hover:bg-dark-surface/60",
          )}
          onClick={() =>
            renamingMindmap !== mindmap.id && openMindmap(mindmap.id)
          }
        >
          {/* Preview area */}
          <div className="aspect-video bg-gradient-to-br from-accent-blue/5 to-accent-purple/5 relative overflow-hidden">
            {mindmap.preview ? (
              <img
                src={mindmap.preview}
                alt={`${mindmap.name} preview`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center space-x-2 text-dark-text-muted">
                  <Brain size={24} />
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-accent-blue/30 rounded-full"
                        animate={{
                          opacity: [0.3, 0.8, 0.3],
                          scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Favorite indicator */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(mindmap.id);
              }}
              className={clsx(
                "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200",
                mindmap.isFavorite
                  ? "bg-accent-orange/20 text-accent-orange"
                  : "bg-black/20 text-white/60 opacity-0 group-hover:opacity-100",
              )}
            >
              {mindmap.isFavorite ? <Star size={14} /> : <StarOff size={14} />}
            </button>

            {/* Block count badge */}
            <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white/80">
              <div className="flex items-center space-x-1">
                <Box size={10} />
                <span>{mindmap.blockCount}</span>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              {renamingMindmap === mindmap.id ? (
                <div
                  className="flex-1 mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    value={renameValue}
                    onChange={(e) => {
                      e.stopPropagation();
                      setRenameValue(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveRename(mindmap.id);
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        cancelRename();
                      }
                    }}
                    onBlur={(e) => {
                      e.stopPropagation();
                      saveRename(mindmap.id);
                    }}
                    className="w-full bg-dark-surface border border-accent-blue/50 rounded px-2 py-1 text-sm text-dark-text focus:outline-none focus:border-accent-blue"
                    autoFocus
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <h3 className="font-medium text-dark-text truncate mr-2">
                  {mindmap.name}
                </h3>
              )}
              {renamingMindmap !== mindmap.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                >
                  <MoreHorizontal size={16} className="text-dark-text-muted" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-dark-text-muted">
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatDate(mindmap.lastModified)}</span>
              </div>
              <ArrowRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Actions dropdown */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                className="absolute top-2 right-2 bg-dark-surface border border-white/20 rounded-lg shadow-lg z-10 overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowActions(false);
                    setTimeout(() => {
                      setRenameValue(mindmap.name);
                      setRenamingMindmap(mindmap.id);
                    }, 0);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-dark-text hover:bg-white/10 flex items-center space-x-2"
                >
                  <Edit3 size={14} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                    duplicateMindmap(mindmap);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-dark-text hover:bg-white/10 flex items-center space-x-2"
                >
                  <Copy size={14} />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={() => {
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-dark-text hover:bg-white/10 flex items-center space-x-2"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
                <div className="border-t border-white/10" />
                <button
                  onClick={() => {
                    setShowActions(false);
                    deleteMindmap(mindmap.id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      {/* Background effects */}
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/[0.02] via-transparent to-accent-purple/[0.02] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-dark-text mb-2">
                Mind Maps
              </h1>
              <p className="text-dark-text-secondary">
                Organize your thoughts and ideas in visual spaces
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  /* Add import functionality */
                }}
                className="glass rounded-lg px-4 py-2 text-sm text-dark-text border border-white/10 hover:border-white/20 transition-all flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Import</span>
              </button>

              <motion.button
                onClick={createNewMindmap}
                className="bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                <span>New Mindmap</span>
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-dark-text-muted">
            <span>{mindmaps.length} total</span>
            <span>{mindmaps.filter((m) => m.isFavorite).length} favorites</span>
            <span>
              {
                mindmaps.filter(
                  (m) => Date.now() - m.lastModified < 7 * 24 * 60 * 60 * 1000,
                ).length
              }{" "}
              recent
            </span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-between mb-6"
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Search and filters */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted"
              />
              <input
                type="text"
                placeholder="Search mindmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass rounded-lg pl-10 pr-4 py-2 text-sm text-dark-text placeholder-dark-text-muted border border-white/10 focus:border-accent-blue/50 focus:outline-none w-64"
              />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="glass rounded-lg px-3 py-2 text-sm text-dark-text border border-white/10 focus:border-accent-blue/50 focus:outline-none"
            >
              <option value="all">All mindmaps</option>
              <option value="favorites">Favorites</option>
              <option value="recent">Recent</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass rounded-lg px-3 py-2 text-sm text-dark-text border border-white/10 focus:border-accent-blue/50 focus:outline-none"
            >
              <option value="lastModified">Last modified</option>
              <option value="name">Name</option>
              <option value="created">Date created</option>
            </select>
          </div>

          {/* View controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-dark-text-muted hover:text-dark-text hover:bg-white/10",
              )}
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-dark-text-muted hover:text-dark-text hover:bg-white/10",
              )}
            >
              <List size={18} />
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence>
          {filteredMindmaps.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-16"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🧠
              </motion.div>
              <h3 className="text-xl font-medium text-dark-text mb-2">
                {searchQuery ? "No mindmaps found" : "No mindmaps yet"}
              </h3>
              <p className="text-dark-text-muted mb-6 text-center max-w-md">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Create your first mindmap to start organizing your thoughts visually"}
              </p>
              {!searchQuery && (
                <motion.button
                  onClick={createNewMindmap}
                  className="bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg px-6 py-3 font-medium transition-all flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FolderPlus size={20} />
                  <span>Create Your First Mindmap</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className={clsx(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4",
              )}
              layout
            >
              {filteredMindmaps.map((mindmap) => (
                <MindmapCard key={mindmap.id} mindmap={mindmap} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MindmapDashboard;

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Grid3X3,
  Palette,
  Settings,
  Download,
  Upload,
  Trash2,
  X,
  ArrowLeft,
  Save,
  AlertTriangle,
} from "lucide-react";
import { MindmapProvider, useMindmap } from "../contexts/MindmapContext";
import MindmapCanvas from "../components/mindmap/MindmapCanvas";
import MindmapToolbar from "../components/mindmap/MindmapToolbar";
import MindmapContextMenu from "../components/mindmap/MindmapContextMenu";
import GroupingSuggestion from "../components/mindmap/GroupingSuggestion";
import OrganizeModeControls from "../components/mindmap/OrganizeModeControls";
import { storageCleanup } from "../utils/performance";

const MindmapContent = ({ mindmapId }) => {
  const navigate = useNavigate();
  const [showStorageRecovery, setShowStorageRecovery] = useState(false);
  const {
    canvas,
    blocks,
    isCreatingBlock,
    isAutoZooming,
    notification,
    contextMenu,
    editingBlock,
    isDragging: isAnyBlockDragging,

    isPinModeActive,
    pinnedBlocks,
    createBlock,
    panCanvas,
    centerCanvas,
    closeContextMenu,
    getStatistics,
    gentleRecenter,
    autoZoomOutAndCenter,
    autoAdjustZoom,
    saveMindmap,
    undoDeleteBlock,
  } = useMindmap();

  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Handle canvas mouse events
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      // Left click

      // Don't start canvas dragging if:
      // 1. Any block is currently being edited
      // 2. Any block is currently being dragged
      // 3. We're clicking on a block element
      // 4. We're clicking on any interactive element
      const isClickingOnBlock = e.target.closest("[data-mind-block]");
      const isClickingOnInteractive = e.target.closest(
        "button, input, textarea, [data-no-create]",
      );

      if (
        editingBlock ||
        isAnyBlockDragging ||
        isClickingOnBlock ||
        isClickingOnInteractive
      ) {
        return;
      }

      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      closeContextMenu();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && !editingBlock && !isAnyBlockDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      panCanvas(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (!editingBlock && !isAnyBlockDragging) {
      setIsDragging(false);
    }
  };

  // Handle double-click to create new block
  const handleDoubleClick = (e) => {
    // Don't create blocks if clicking on existing blocks or interactive elements
    if (
      e.target.closest("[data-mind-block]") ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("textarea") ||
      e.target.closest("[data-no-create]")
    ) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createBlock(x, y);
  };

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    // Context menu will be handled by individual blocks or canvas
  };

  // Prevent default wheel behavior (no manual zoom)
  const handleWheel = (e) => {
    e.preventDefault();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Enhanced check for text editing to prevent conflicts with cmd+z and other shortcuts
      const activeElement = document.activeElement;
      const isEditingText =
        activeElement &&
        (activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "INPUT" ||
          activeElement.contentEditable === "true" ||
          activeElement.isContentEditable ||
          activeElement.hasAttribute("contenteditable"));

      // Always allow text editing shortcuts (including cmd+z for undo in text)
      if (isEditingText) {
        return; // Don't interfere with text editing at all
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "t":
            e.preventDefault();
            // Create new block at center of viewport
            const rect = canvasRef.current.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            createBlock(centerX, centerY);
            break;
          case "z":
            // Handle undo for deleted blocks
            e.preventDefault();
            undoDeleteBlock();
            break;
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          closeContextMenu();
          break;
        case " ":
          if (!e.repeat && !editingBlock && !isAnyBlockDragging) {
            e.preventDefault();
            setIsDragging(true);
            canvasRef.current.style.cursor = "grabbing";
          }
          break;

        case "f":
          centerCanvas();
          break;
        case "g":
          setShowGrid(!showGrid);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === " " && !editingBlock && !isAnyBlockDragging) {
        setIsDragging(false);
        canvasRef.current.style.cursor = "default";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canvas, showGrid, centerCanvas, closeContextMenu]);

  // Show tip after first block is created
  useEffect(() => {
    if (blocks.length === 1 && !showTip) {
      setShowTip(true);
    }
  }, [blocks.length, showTip]);

  // State for initialization tracking
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [viewportReady, setViewportReady] = useState(false);

  // Periodic auto-adjustment to ensure all blocks remain visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        blocks.length > 1 &&
        !isDragging &&
        !isCreatingBlock &&
        hasInitiallyLoaded
      ) {
        // Use autoAdjustZoom to guarantee all blocks stay visible
        autoAdjustZoom();
      }
    }, 8000); // Every 8 seconds, less frequent but more effective

    return () => clearInterval(interval);
  }, [
    blocks.length,
    isDragging,
    isCreatingBlock,
    hasInitiallyLoaded,
    autoAdjustZoom,
  ]);

  // Storage recovery functions
  const handleCleanCorruptedData = async () => {
    try {
      const cleaned = storageCleanup.cleanCorruptedMindmapData();
      if (cleaned > 0) {
        window.location.reload(); // Reload to apply changes
      } else {
        alert("No corrupted data found.");
      }
    } catch (error) {
      console.error("Failed to clean storage:", error);
      alert("Failed to clean storage. Check console for details.");
    }
    setShowStorageRecovery(false);
  };

  const handleResetAllData = async () => {
    if (confirm("This will delete ALL mindmap data. Are you sure?")) {
      try {
        storageCleanup.resetAllMindmapData();
        window.location.reload(); // Reload to apply changes
      } catch (error) {
        console.error("Failed to reset storage:", error);
        alert("Failed to reset storage. Check console for details.");
      }
    }
    setShowStorageRecovery(false);
  };

  const checkStorageHealth = () => {
    try {
      const health = storageCleanup.checkStorageHealth();
      if (health) {
        const message = `Storage Health Report:
- Total entries: ${health.total}
- Corrupted: ${health.corrupted}
- Large entries: ${health.large}
- Compressed: ${health.compressed}
- Total size: ${Math.round(health.totalSize / 1024)}KB`;
        alert(message);
      } else {
        alert("Failed to check storage health.");
      }
    } catch (error) {
      console.error("Failed to check storage health:", error);
      alert("Failed to check storage health. Check console for details.");
    }
  };

  // Check for storage issues on mount
  useEffect(() => {
    try {
      const health = storageCleanup.checkStorageHealth();
      if (health && health.corrupted > 0) {
        setTimeout(() => {
          setShowStorageRecovery(true);
        }, 2000); // Show after 2 seconds to avoid interfering with loading
      }
    } catch (error) {
      console.warn("Could not check storage health:", error);
    }
  }, []);

  // Wait for viewport to be properly initialized
  useEffect(() => {
    const checkViewport = () => {
      if (canvas.viewportWidth > 0 && canvas.viewportHeight > 0) {
        setViewportReady(true);
      }
    };

    checkViewport();

    // Also check after a short delay in case canvas is still initializing
    const timer = setTimeout(checkViewport, 100);
    return () => clearTimeout(timer);
  }, [canvas.viewportWidth, canvas.viewportHeight]);

  // Initial centering when both blocks and viewport are ready
  useEffect(() => {
    if (blocks.length > 0 && viewportReady && !hasInitiallyLoaded) {
      // Ensure all blocks are visible from the start
      const timer = setTimeout(() => {
        autoAdjustZoom(); // Use auto-adjust for guaranteed visibility
        setHasInitiallyLoaded(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [blocks.length, viewportReady, hasInitiallyLoaded, autoAdjustZoom]);

  // Backup centering for edge cases
  useEffect(() => {
    if (blocks.length > 0 && viewportReady && !hasInitiallyLoaded) {
      const backupTimer = setTimeout(() => {
        if (!hasInitiallyLoaded) {
          autoAdjustZoom();
          setHasInitiallyLoaded(true);
        }
      }, 600);
      return () => clearTimeout(backupTimer);
    }
  }, [blocks.length, viewportReady, hasInitiallyLoaded, autoAdjustZoom]);

  // Auto-center when blocks are added/removed (after initial load)
  useEffect(() => {
    if (blocks.length > 0 && hasInitiallyLoaded) {
      const timer = setTimeout(() => {
        autoAdjustZoom(); // Use autoAdjustZoom instead of gentleRecenter for better visibility
      }, 500); // Shorter delay for responsiveness
      return () => clearTimeout(timer);
    }
  }, [blocks.length, autoAdjustZoom, hasInitiallyLoaded]);

  // Force re-center when viewport size changes significantly
  useEffect(() => {
    if (hasInitiallyLoaded && blocks.length > 0) {
      const timer = setTimeout(() => {
        autoAdjustZoom();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    canvas.viewportWidth,
    canvas.viewportHeight,
    hasInitiallyLoaded,
    blocks.length,
    autoAdjustZoom,
  ]);

  const stats = getStatistics();

  return (
    <div className="relative w-full h-screen bg-dark-bg overflow-hidden mindmap-editor">
      {/* Background noise and gradient */}
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/[0.02] via-transparent to-accent-purple/[0.02] pointer-events-none" />

      {/* Grid overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * canvas.zoom}px ${20 * canvas.zoom}px`,
            backgroundPosition: `${canvas.panX}px ${canvas.panY}px`,
          }}
        />
      )}

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <MindmapCanvas />
      </div>

      {/* Back button and title */}
      <div className="fixed top-24 left-6 z-40 flex items-center space-x-4">
        <motion.button
          onClick={() => navigate("/mindmap")}
          className="glass rounded-lg p-2 border border-white/10 hover:border-white/20 transition-all text-dark-text-muted hover:text-dark-text"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </motion.button>

        <div className="glass rounded-lg px-4 py-2 border border-white/10">
          <span className="text-sm text-dark-text-muted">Mindmap:</span>
          <span className="text-sm text-dark-text font-medium ml-2">
            {mindmapId}
          </span>
        </div>

        <motion.button
          onClick={() => saveMindmap && saveMindmap()}
          className="glass rounded-lg p-2 border border-white/10 hover:border-white/20 transition-all text-dark-text-muted hover:text-dark-text"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Save Mindmap"
        >
          <Save size={18} />
        </motion.button>
      </div>

      {/* Top Toolbar */}
      <MindmapToolbar
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showStats={showStats}
        onToggleStats={() => setShowStats(!showStats)}
      />

      {/* Tip - only show after first block creation */}
      <AnimatePresence>
        {showTip && blocks.length > 0 && (
          <motion.div
            className="fixed top-36 left-1/2 transform -translate-x-1/2 z-30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass rounded-lg px-4 py-2 text-sm text-dark-text-secondary border border-white/10 relative">
              <button
                onClick={() => setShowTip(false)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-dark-surface border border-white/20 rounded-full flex items-center justify-center text-xs text-dark-text-muted hover:text-dark-text hover:bg-white/10 transition-colors"
              >
                <X size={12} />
              </button>
              <span className="text-accent-blue font-medium">Tip:</span> Press{" "}
              <kbd className="px-1.5 py-0.5 bg-dark-surface border border-white/20 rounded text-xs font-mono">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1.5 py-0.5 bg-dark-surface border border-white/20 rounded text-xs font-mono">
                T
              </kbd>{" "}
              to create a new box
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            className="fixed top-32 right-6 glass rounded-xl p-4 border border-white/10 min-w-64"
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <h3 className="text-lg font-display font-semibold text-dark-text mb-3">
              Mindmap Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-text-secondary">Total Blocks:</span>
                <span className="text-dark-text font-medium">
                  {stats.totalBlocks}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text-secondary">Created Today:</span>
                <span className="text-dark-text font-medium">
                  {stats.createdToday}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-text-secondary">Avg Focus:</span>
                <span className="text-dark-text font-medium">
                  {stats.averageFocusWeight.toFixed(1)}/5
                </span>
              </div>
              <div className="pt-2 border-t border-white/10">
                <div className="text-dark-text-secondary text-xs mb-1">
                  Mood Distribution:
                </div>
                {Object.entries(stats.moodTagCounts).map(
                  ([mood, count]) =>
                    count > 0 && (
                      <div key={mood} className="flex justify-between text-xs">
                        <span className="capitalize text-dark-text-muted">
                          {mood}:
                        </span>
                        <span className="text-dark-text">{count}</span>
                      </div>
                    ),
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <MindmapContextMenu />

      {/* Grouping Suggestion */}
      <GroupingSuggestion />

      {/* Organize Mode Controls */}
      <OrganizeModeControls />

      {/* Auto-zoom overlay */}
      <AnimatePresence>
        {isAutoZooming && (
          <motion.div
            className="fixed inset-0 bg-accent-blue/5 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="glass rounded-xl p-6 border border-accent-blue/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-2xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  🌌
                </motion.div>
                <div>
                  <div className="text-dark-text font-medium">
                    Creating Space
                  </div>
                  <div className="text-dark-text-secondary text-sm">
                    Zooming out for better flow...
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification display */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed top-32 right-6 z-50"
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              className={clsx("glass rounded-xl p-4 border max-w-64", {
                "border-accent-blue/30": notification.type === "info",
                "border-accent-green/30": notification.type === "success",
                "border-accent-orange/30": notification.type === "warning",
                "border-accent-red/30": notification.type === "error",
              })}
            >
              <div className="text-sm text-dark-text">
                {notification.message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storage Recovery Dialog */}
      <AnimatePresence>
        {showStorageRecovery && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStorageRecovery(false)}
          >
            <motion.div
              className="glass rounded-xl p-6 max-w-md mx-4 border border-red-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-dark-text">
                  Storage Issues Detected
                </h3>
              </div>

              <p className="text-dark-text-secondary mb-6">
                Some mindmap data appears to be corrupted. You can try to clean
                it automatically or reset all data.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCleanCorruptedData}
                  className="px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-lg font-medium transition-colors"
                >
                  Clean Corrupted Data
                </button>
                <button
                  onClick={handleResetAllData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Reset All Data
                </button>
                <button
                  onClick={() => setShowStorageRecovery(false)}
                  className="px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-dark-text rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-border">
                <button
                  onClick={checkStorageHealth}
                  className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
                >
                  Check Storage Health
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Overlay (for first-time users) */}
      {blocks.length === 0 && !isCreatingBlock && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="text-center max-w-md">
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
            <h2 className="text-2xl font-display font-bold text-dark-text mb-2">
              Your Cognitive Sandbox
            </h2>
            <p className="text-dark-text-secondary mb-4">
              Double-click anywhere to create your first mind block
            </p>
            <div className="text-sm text-dark-text-muted space-y-1">
              <p>• Drag ideas around your vision space</p>
              <p>• Pin important blocks to focus on them</p>
              <p>• Press Enter to finish editing, Backspace to delete</p>
              <p>• Right-click for options</p>
              <p>• View auto-adjusts as your vision grows</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Zoom indicator with auto-center hint */}
      <motion.div
        className="fixed bottom-6 left-6 glass rounded-lg px-3 py-2 text-sm text-dark-text-secondary"
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <span>{Math.round(canvas.zoom * 100)}%</span>
          {canvas.zoom <= 0.5 && blocks.length > 10 && (
            <motion.div
              className="flex items-center gap-1 text-xs text-accent-blue"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-1 h-1 bg-accent-blue rounded-full" />
              <span>Overview mode</span>
            </motion.div>
          )}
          {blocks.length > 3 && canvas.zoom > 0.4 && (
            <motion.div
              className="w-1 h-1 bg-accent-blue rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              title="Auto-centering active"
            />
          )}
        </div>
      </motion.div>

      {/* Pin mode indicator */}
      <AnimatePresence>
        {isPinModeActive && (
          <motion.div
            className="fixed bottom-6 right-6 glass rounded-lg px-3 py-2 text-sm border border-accent-blue/30"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-accent-blue rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-accent-blue font-medium">
                Pin Mode • {pinnedBlocks.size} pinned
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MindmapEditor = () => {
  const { mindmapId } = useParams();

  if (!mindmapId) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-dark-text mb-2">
            Invalid Mindmap
          </h2>
          <p className="text-dark-text-muted">
            No mindmap ID provided in the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MindmapProvider mindmapId={mindmapId}>
      <MindmapContent mindmapId={mindmapId} />
    </MindmapProvider>
  );
};

export default MindmapEditor;

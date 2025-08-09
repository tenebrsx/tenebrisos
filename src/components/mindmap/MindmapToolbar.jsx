import React from "react";
import { motion } from "framer-motion";
import {
  Maximize2,
  RotateCcw,
  Grid3X3,
  BarChart3,
  Download,
  Upload,
  Plus,
  Settings,
  Home,
  Focus,
  Pin,
  LayoutGrid,
  Expand,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useMindmap } from "../../contexts/MindmapContext";
import clsx from "clsx";

const MindmapToolbar = ({
  showGrid,
  onToggleGrid,
  showStats,
  onToggleStats,
}) => {
  const {
    canvas,
    blocks,
    centerCanvas,

    createBlock,
    getStatistics,
    autoAdjustZoom,
    togglePinMode,
    isPinModeActive,
    pinnedBlocks,
    toggleOrganizeMode,
    isOrganizeModeActive,
    repositioningBlocks,
  } = useMindmap();

  const stats = getStatistics();

  const handleAutoAdjust = () => {
    autoAdjustZoom();
  };

  const isDynamicScalingActive = repositioningBlocks.size > 0;

  // Check for large content operations
  const hasLargeContentBlocks = blocks.some(
    (block) => block.content && block.content.length > 1000,
  );
  const hasVeryLargeContentBlocks = blocks.some(
    (block) => block.content && block.content.length > 8000,
  );

  const handleCreateBlock = () => {
    // Create block at center of viewport
    const centerX = canvas.viewportWidth / 2;
    const centerY = canvas.viewportHeight / 2;
    createBlock(centerX, centerY);
  };

  const handleExport = () => {
    const data = {
      blocks,
      canvas,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.blocks && Array.isArray(data.blocks)) {
            if (
              window.confirm(
                "This will replace your entire vision board. Continue?",
              )
            ) {
              clearAllBlocks();
              // Import blocks with new IDs to avoid conflicts
              data.blocks.forEach((block) => {
                createBlock(block.x, block.y, block.content);
              });
            }
          }
        } catch (error) {
          alert(
            "Invalid file format. Please select a valid mindmap export file.",
          );
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const toolbarButtons = [
    {
      icon: Plus,
      label: "Add Vision",
      action: handleCreateBlock,
      variant: "primary",
    },
    {
      icon: LayoutGrid,
      label: isOrganizeModeActive ? "Exit Organize" : "Organize",
      action: toggleOrganizeMode,
      disabled: blocks.length === 0,
      active: isOrganizeModeActive,
    },
    {
      icon: BarChart3,
      label: "Stats",
      action: onToggleStats,
      active: showStats,
    },
    {
      icon: Download,
      label: "Export",
      action: handleExport,
      disabled: blocks.length === 0,
    },
    {
      icon: Upload,
      label: "Import",
      action: handleImport,
    },
    {
      icon: Pin,
      label: isPinModeActive ? "Show All Blocks" : "Show Pinned",
      action: togglePinMode,
      disabled: blocks.length === 0,
      active: isPinModeActive,
    },
  ];

  return (
    <motion.div
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-40"
      data-no-create
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2 glass rounded-xl p-2 border border-white/10">
        {/* Title */}
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="text-lg">🧠</div>
          <div>
            <h1 className="text-lg font-display font-bold text-dark-text leading-none">
              Mindmap
            </h1>
            <p className="text-xs text-dark-text-secondary leading-none">
              {isPinModeActive
                ? `${pinnedBlocks.size} pinned block${pinnedBlocks.size !== 1 ? "s" : ""}`
                : `${stats.totalBlocks} block${stats.totalBlocks !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Dynamic Scaling Indicator */}
        {isDynamicScalingActive && (
          <motion.div
            className="flex items-center gap-2 px-2 py-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-1 text-orange-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Activity size={14} />
              <span className="text-xs font-medium">
                Scaling {repositioningBlocks.size} block
                {repositioningBlocks.size !== 1 ? "s" : ""}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* Large Content Indicator */}
        {hasVeryLargeContentBlocks && (
          <motion.div
            className="flex items-center gap-2 px-2 py-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-1 text-red-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle size={14} />
              <span className="text-xs font-medium">8k+ chars</span>
            </motion.div>
          </motion.div>
        )}

        {/* Large Content Blocks Indicator */}
        {hasLargeContentBlocks && !hasVeryLargeContentBlocks && (
          <motion.div
            className="flex items-center gap-2 px-2 py-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-1 text-green-400"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            >
              <FileText size={14} />
              <span className="text-xs font-medium">1k+ chars</span>
            </motion.div>
          </motion.div>
        )}

        {/* Separator */}
        <div className="w-px h-8 bg-white/10" />

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button, index) => (
            <motion.button
              key={index}
              onClick={button.action}
              disabled={button.disabled}
              className={clsx(
                "relative p-2 rounded-lg font-medium text-sm transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                {
                  // Primary variant
                  "bg-accent-blue text-white hover:bg-accent-blue/90 shadow-glow":
                    button.variant === "primary" && !button.disabled,

                  // Danger variant
                  "text-accent-red hover:bg-accent-red/10 hover:text-accent-red":
                    button.variant === "danger" && !button.disabled,

                  // Active state
                  "bg-white/10 text-accent-blue":
                    button.active &&
                    button.variant !== "primary" &&
                    button.variant !== "danger",

                  // Default state
                  "text-dark-text-secondary hover:bg-white/10 hover:text-dark-text":
                    !button.variant && !button.active && !button.disabled,
                },
              )}
              whileHover={{
                scale: button.disabled ? 1 : 1.05,
                transition: { duration: 0.15 },
              }}
              whileTap={{
                scale: button.disabled ? 1 : 0.95,
                transition: { duration: 0.1 },
              }}
              title={button.label}
            >
              <button.icon size={18} />

              {/* Active indicator */}
              {button.active && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-accent-blue rounded-full"
                  layoutId="activeIndicator"
                  initial={{ scale: 0, x: "-50%" }}
                  animate={{ scale: 1, x: "-50%" }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Canvas info */}
        <div className="w-px h-8 bg-white/10" />
        <div className="px-3 py-1">
          <div className="text-xs text-dark-text-secondary">
            Zoom: {Math.round(canvas.zoom * 100)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MindmapToolbar;

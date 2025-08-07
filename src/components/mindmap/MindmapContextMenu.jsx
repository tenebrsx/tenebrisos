import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Copy,
  Trash2,
  Palette,
  Star,
  Plus,
  Circle,
  Zap,
  Heart,
  AlertTriangle,
  HelpCircle,
  Pin,
  PinOff,
} from "lucide-react";
import { useMindmap } from "../../contexts/MindmapContext";
import clsx from "clsx";

const MindmapContextMenu = () => {
  const {
    contextMenu,
    closeContextMenu,
    getBlockById,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    createBlock,
    startEditing,
    moodTags,
    toggleBlockPin,
    pinnedBlocks,
  } = useMindmap();

  const menuRef = useRef(null);
  const block = contextMenu.blockId ? getBlockById(contextMenu.blockId) : null;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeContextMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [contextMenu.isOpen, closeContextMenu]);

  const handleEdit = () => {
    if (block) {
      startEditing(block.id);
      closeContextMenu();
    }
  };

  const handleDuplicate = () => {
    if (block) {
      duplicateBlock(block.id);
      closeContextMenu();
    }
  };

  const handleDelete = () => {
    if (block) {
      deleteBlock(block.id);
      closeContextMenu();
    }
  };

  const handleCreateNew = () => {
    createBlock(contextMenu.x, contextMenu.y);
    closeContextMenu();
  };

  const handleMoodTagChange = (moodTag) => {
    if (block) {
      updateBlock(block.id, { moodTag });
      closeContextMenu();
    }
  };

  const handleFocusWeightChange = (focusWeight) => {
    if (block) {
      updateBlock(block.id, { focusWeight });
      closeContextMenu();
    }
  };

  const moodTagIcons = {
    neutral: Circle,
    positive: Heart,
    negative: AlertTriangle,
    idea: Zap,
    important: Star,
    question: HelpCircle,
  };

  const menuItems = block
    ? [
        // Block-specific actions
        {
          icon: Edit3,
          label: "Edit",
          action: handleEdit,
          shortcut: "Double-click",
        },
        {
          icon: Copy,
          label: "Duplicate",
          action: handleDuplicate,
          shortcut: "Ctrl+D",
        },
        { type: "separator" },
        {
          icon: pinnedBlocks.has(block.id) ? PinOff : Pin,
          label: pinnedBlocks.has(block.id) ? "Unpin Block" : "Pin Block",
          action: () => toggleBlockPin(block.id),
          shortcut: "Click pin icon",
        },
        {
          icon: Palette,
          label: "Mood Tag",
          submenu: Object.entries(moodTags).map(([key, tag]) => ({
            icon: moodTagIcons[key],
            label: tag.label,
            action: () => handleMoodTagChange(key),
            color: tag.color,
            active: block.moodTag === key,
          })),
        },
        {
          icon: Star,
          label: "Focus Weight",
          submenu: [...Array(5)].map((_, i) => ({
            icon: Star,
            label: `Level ${i + 1}`,
            action: () => handleFocusWeightChange(i + 1),
            active: block.focusWeight === i + 1,
            opacity: i + 1 <= 3 ? 1 : 0.7,
          })),
        },
        { type: "separator" },
        {
          icon: Trash2,
          label: "Delete",
          action: handleDelete,
          variant: "danger",
          shortcut: "Del",
        },
      ]
    : [
        // Canvas-specific actions
        {
          icon: Plus,
          label: "Create Block",
          action: handleCreateNew,
          variant: "primary",
        },
      ];

  const renderMenuItem = (item, index) => {
    if (item.type === "separator") {
      return <div key={index} className="h-px bg-white/10 my-1" />;
    }

    if (item.submenu) {
      return (
        <div key={index} className="group relative">
          <div
            className={clsx(
              "flex items-center gap-3 px-3 py-2 text-sm cursor-pointer",
              "hover:bg-white/10 transition-colors duration-150",
              "text-dark-text-secondary hover:text-dark-text",
            )}
          >
            <item.icon size={16} />
            <span className="flex-1">{item.label}</span>
            <div className="text-xs opacity-60">›</div>
          </div>

          {/* Submenu */}
          <motion.div
            className="absolute left-full top-0 ml-2 min-w-48 glass rounded-lg border border-white/10 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            {item.submenu.map((subItem, subIndex) => (
              <motion.button
                key={subIndex}
                onClick={subItem.action}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md",
                  "transition-all duration-150 text-left",
                  {
                    "bg-accent-blue/20 text-accent-blue": subItem.active,
                    "hover:bg-white/10 text-dark-text-secondary hover:text-dark-text":
                      !subItem.active,
                  },
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ opacity: subItem.opacity }}
              >
                <subItem.icon
                  size={14}
                  className={subItem.color ? `text-${subItem.color}` : ""}
                />
                <span>{subItem.label}</span>
                {subItem.active && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-accent-blue rounded-full"
                    layoutId="activeSubmenuIndicator"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      );
    }

    return (
      <motion.button
        key={index}
        onClick={item.action}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md",
          "transition-all duration-150 text-left",
          {
            "bg-accent-blue text-white hover:bg-accent-blue/90":
              item.variant === "primary",
            "text-accent-red hover:bg-accent-red/10 hover:text-accent-red":
              item.variant === "danger",
            "hover:bg-white/10 text-dark-text-secondary hover:text-dark-text":
              !item.variant,
          },
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <item.icon size={16} />
        <span className="flex-1">{item.label}</span>
        {item.shortcut && (
          <span className="text-xs opacity-60">{item.shortcut}</span>
        )}
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {contextMenu.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />

          {/* Context Menu */}
          <motion.div
            ref={menuRef}
            className="fixed z-[101] min-w-56 glass rounded-xl border border-white/20 p-1 shadow-2xl"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              transformOrigin: "top left",
            }}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: -10,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
          >
            {/* Menu header (if block is selected) */}
            {block && (
              <>
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-xs font-medium text-dark-text">
                    Block Actions
                  </div>
                  <div className="text-xs text-dark-text-muted truncate mt-1">
                    {block.content || "Empty block"}
                  </div>
                </div>
              </>
            )}

            {/* Menu items */}
            <div className="py-1">{menuItems.map(renderMenuItem)}</div>

            {/* Menu footer with timestamp (if block is selected) */}
            {block && (
              <div className="px-3 py-2 border-t border-white/10">
                <div className="text-xs text-dark-text-muted">
                  Modified: {new Date(block.lastEdited).toLocaleDateString()}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MindmapContextMenu;

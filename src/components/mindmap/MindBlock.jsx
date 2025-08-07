import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Image, X } from "lucide-react";
import { useMindmap } from "../../contexts/MindmapContext";
import clsx from "clsx";

// Utility function to wrap text for more square-shaped blocks
const wrapTextForSquareShape = (
  text,
  fontSize = 14,
  fontFamily = "system-ui",
) => {
  try {
    if (!text || typeof text !== "string") {
      return { lines: [], maxWidth: 0 };
    }

    // Create canvas for precise text measurement
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      // Fallback: estimate based on character count
      const avgCharWidth = fontSize * 0.6;
      const words = text.trim().split(/\s+/);
      const totalChars = words.join("").length;
      const optimalLineLength = Math.sqrt(totalChars) * 8; // Rough square estimation

      const lines = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        if (testLine.length <= optimalLineLength) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);

      return {
        lines,
        maxWidth: Math.max(...lines.map((line) => line.length * avgCharWidth)),
      };
    }

    context.font = `${fontSize}px ${fontFamily}`;

    // Calculate optimal line width prioritizing text visibility over square shape
    const words = text.trim().split(/\s+/);

    // Check for very long words that must be accommodated
    let longestWordWidth = 0;
    words.forEach((word) => {
      const wordWidth = context.measureText(word).width;
      longestWordWidth = Math.max(longestWordWidth, wordWidth);
    });

    // Start with generous target width, but ensure it fits the longest word
    let targetLineWidth = Math.max(
      longestWordWidth + 10, // Always accommodate longest word + small buffer
      Math.min(400, longestWordWidth * 2.5),
    );

    // Only reduce width if we have many words that can be wrapped nicely
    // and no individual word is too long
    if (words.length > 8 && longestWordWidth < 200) {
      const estimatedLines = Math.ceil(Math.sqrt(words.length / 2));
      const calculatedWidth = Math.min(
        350,
        context.measureText(text.replace(/\s+/g, "")).width /
          Math.max(1, estimatedLines - 1),
      );
      targetLineWidth = Math.max(longestWordWidth + 10, calculatedWidth);
    }

    // Split into paragraphs first
    const paragraphs = text.split("\n");
    const allLines = [];
    let maxWidth = 0;

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() === "") {
        allLines.push("");
        return;
      }

      const words = paragraph.trim().split(/\s+/);
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const testWidth = context.measureText(testLine).width;

        if (testWidth <= targetLineWidth || !currentLine) {
          currentLine = testLine;
        } else {
          allLines.push(currentLine);
          maxWidth = Math.max(maxWidth, context.measureText(currentLine).width);
          currentLine = word;
        }
      });

      if (currentLine) {
        allLines.push(currentLine);
        maxWidth = Math.max(maxWidth, context.measureText(currentLine).width);
      }
    });

    return {
      lines: allLines,
      maxWidth: Math.max(maxWidth, 100), // Minimum width
    };
  } catch (error) {
    console.warn("Error wrapping text:", error);
    return {
      lines: text.split("\n"),
      maxWidth: text.length * fontSize * 0.6,
    };
  }
};

const measureTextDimensions = (
  text,
  fontSize = 14,
  fontFamily = "system-ui",
) => {
  try {
    if (!text || typeof text !== "string") {
      return { width: 0, height: 0, lineCount: 0 };
    }

    const safeFontSize = Math.max(8, Math.min(72, fontSize));
    const safeFontFamily = fontFamily || "system-ui";

    // Get wrapped lines optimized for square shape
    const { lines, maxWidth } = wrapTextForSquareShape(
      text,
      safeFontSize,
      safeFontFamily,
    );

    const lineHeight = safeFontSize * 1.4;
    const totalHeight = lines.length * lineHeight;

    return {
      width: Math.max(0, maxWidth),
      height: Math.max(0, totalHeight),
      lineCount: lines.length,
    };
  } catch (error) {
    console.warn("Error measuring text dimensions:", error);
    const lines = (text || "").split("\n");
    return {
      width: Math.max(...lines.map((line) => line.length)) * fontSize * 0.6,
      height: lines.length * fontSize * 1.4,
      lineCount: lines.length,
    };
  }
};

const calculateOptimalBlockSize = (
  content,
  minWidth = 140,
  minHeight = 80,
  maxWidth = 450,
  maxHeight = 320,
  hasImage = false,
) => {
  try {
    // Validate inputs
    const safeMinWidth = Math.max(120, minWidth);
    const safeMinHeight = Math.max(70, minHeight);
    const safeMaxWidth = Math.max(safeMinWidth, maxWidth);
    const safeMaxHeight = Math.max(safeMinHeight, maxHeight);

    if (!content || typeof content !== "string" || content.trim() === "") {
      return { width: 160, height: 90 };
    }

    // Handle very long content by truncating for measurement
    const measureContent =
      content.length > 600 ? content.substring(0, 600) + "..." : content;

    // Get text dimensions prioritizing complete text visibility
    const textDimensions = measureTextDimensions(
      measureContent,
      14,
      "system-ui",
    );

    // Ensure we never make blocks smaller than the actual text needs
    // Also check for very long individual words
    const longestWordWidth = content.split(/\s+/).reduce((max, word) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (context) {
        context.font = "14px system-ui";
        return Math.max(max, context.measureText(word).width);
      }
      return Math.max(max, word.length * 8.4); // fallback
    }, 0);

    const minRequiredWidth = Math.max(
      textDimensions.width + 32,
      longestWordWidth + 40, // Always fit longest word + generous padding
    );
    const minRequiredHeight = textDimensions.height + 32;

    // Add consistent padding
    const paddingX = 32;
    const paddingY = 32;

    // Calculate ideal size with padding, prioritizing text visibility
    let idealWidth = Math.max(
      minRequiredWidth,
      textDimensions.width + paddingX,
    );
    let idealHeight = Math.max(
      minRequiredHeight,
      textDimensions.height + paddingY,
    );

    // Apply gentle aspect ratio adjustments only if text fits comfortably
    const aspectRatio = idealWidth / idealHeight;
    const textFitsComfortably =
      idealWidth >= minRequiredWidth &&
      idealWidth <= textDimensions.width + paddingX * 1.5;

    // Only make aspect ratio adjustments if they don't compromise text visibility
    if (textFitsComfortably && aspectRatio > 2.5) {
      // Only adjust if text fits comfortably and block is extremely wide
      const targetWidth = idealHeight * 2.2;
      idealWidth = Math.max(minRequiredWidth, targetWidth);
    } else if (aspectRatio < 0.4) {
      // Only adjust very tall blocks, but never compromise width for long words
      const targetHeight = idealWidth * 0.5;
      idealHeight = Math.max(minRequiredHeight, targetHeight);
    }

    // Apply final constraints, but never smaller than required for text
    let finalWidth = Math.max(
      Math.max(safeMinWidth, minRequiredWidth),
      Math.min(safeMaxWidth, idealWidth),
    );
    let finalHeight = Math.max(
      Math.max(safeMinHeight, minRequiredHeight),
      Math.min(safeMaxHeight, idealHeight),
    );

    // Account for fixed image dimensions if present
    if (hasImage) {
      const imageWidth = 180; // Fixed image width
      const imageHeight = 120; // Fixed image height
      const imageSpacing = 8; // Spacing between text and image

      finalWidth = Math.max(finalWidth, imageWidth + 32); // Ensure width fits image + padding
      finalHeight += imageHeight + imageSpacing; // Add image height to total height
    }

    return {
      width: Math.ceil(finalWidth),
      height: Math.ceil(finalHeight),
    };
  } catch (error) {
    console.warn("Error calculating optimal block size:", error);
    return { width: 180, height: 110 };
  }
};

const MindBlock = ({
  block,
  style,
  isOrganizeMode = false,
  isRepositioning = false,
}) => {
  const {
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    setBlockPosition,
    selectBlock,
    selectedBlocks,
    editingBlock,
    startEditing,
    stopEditing,
    openContextMenu,
    moodTags,
    toggleBlockPin,
    pinnedBlocks,
    canvas,
    startDragging,
    stopDragging,
    resizeBlock,
  } = useMindmap();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState(block.content);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [originalCursor, setOriginalCursor] = useState(null);
  const textareaRef = useRef(null);
  const blockRef = useRef(null);
  const fileInputRef = useRef(null);

  const isSelected = selectedBlocks.includes(block.id);
  const isEditing = editingBlock === block.id;
  const isPinned = pinnedBlocks.has(block.id);
  const moodTag = moodTags[block.moodTag] || moodTags.neutral;

  // Auto-focus textarea when editing starts and cleanup cursor
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Ensure cursor is properly set for editing
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    } else if (!isEditing && isDragging) {
      // If we stopped editing but are still dragging, end the drag
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      stopDragging();
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  }, [isEditing, isDragging, stopDragging]);

  // Update local content when block content changes
  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  // Debounced resize function to prevent excessive repositioning during rapid text changes
  const debouncedResize = useCallback(
    (() => {
      let timeoutId;
      return (content, currentWidth, currentHeight, hasImage) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (!isEditing && content) {
            const optimalSize = calculateOptimalBlockSize(
              content,
              140,
              80,
              450,
              320,
              hasImage,
            );
            const widthDiff = Math.abs(currentWidth - optimalSize.width);
            const heightDiff = Math.abs(currentHeight - optimalSize.height);

            if (widthDiff > 10 || heightDiff > 10) {
              updateBlock(block.id, {
                width: optimalSize.width,
                height: optimalSize.height,
              });
            }
          }
        }, 150); // 150ms debounce delay
      };
    })(),
    [isEditing, updateBlock, block.id],
  );

  // Auto-resize block based on content changes with debouncing
  useEffect(() => {
    debouncedResize(block.content, block.width, block.height, !!block.image);
  }, [block.content, block.width, block.height, block.image, debouncedResize]);

  // Handle drag start with smooth animation
  const handleMouseDown = (e) => {
    // Don't start dragging if:
    // 1. Not left click
    // 2. Currently editing this block
    // 3. Clicking on interactive elements (textarea, button, etc.)
    // 4. Clicking on image remove button or other controls
    // 5. User is selecting text
    const isInteractiveElement = e.target.closest(
      "textarea, input, button, [contenteditable], .image-remove-btn",
    );

    const hasTextSelection =
      window.getSelection && window.getSelection().toString().length > 0;

    if (
      e.button !== 0 ||
      isEditing ||
      isInteractiveElement ||
      hasTextSelection
    ) {
      // Don't prevent propagation for interactive elements or text selection
      if (!isInteractiveElement && !hasTextSelection) {
        e.stopPropagation();
      }
      return;
    }

    // Check if this is a text selection attempt (multiple clicks)
    if (e.detail > 1) {
      e.stopPropagation();
      return;
    }

    // Left click on non-interactive area of non-editing block
    e.stopPropagation();
    e.preventDefault();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    selectBlock(block.id, e.ctrlKey || e.metaKey);
    setDragOffset({ x: 0, y: 0 });
    startDragging();

    // Store original cursor and set dragging cursor
    setOriginalCursor(document.body.style.cursor || "");
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    // Add smooth scale transition on drag start
    if (blockRef.current) {
      blockRef.current.style.transition = "none";
    }
  };

  // Handle drag movement with ultra-smooth cursor following
  const handleMouseMove = (e) => {
    if (isDragging && !isEditing) {
      e.preventDefault();
      e.stopPropagation();
      const totalDeltaX = e.clientX - dragStart.x;
      const totalDeltaY = e.clientY - dragStart.y;

      // Convert to world space for visual feedback
      const worldDeltaX = totalDeltaX / canvas.zoom;
      const worldDeltaY = totalDeltaY / canvas.zoom;

      // Smooth cursor following
      setDragOffset({
        x: worldDeltaX,
        y: worldDeltaY,
      });
    }
  };

  // Handle drag end with smooth settle animation
  const handleMouseUp = () => {
    if (
      isDragging &&
      !isEditing &&
      (dragOffset.x !== 0 || dragOffset.y !== 0)
    ) {
      // Apply the final position directly in world space
      setBlockPosition(
        block.id,
        block.x + dragOffset.x,
        block.y + dragOffset.y,
      );
    }

    // Smooth transition back to normal state
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    stopDragging();

    // Restore cursor properly
    if (originalCursor !== null) {
      document.body.style.cursor = originalCursor;
      setOriginalCursor(null);
    } else {
      document.body.style.cursor = "";
    }
    document.body.style.userSelect = "";

    // Restore transitions with delay
    setTimeout(() => {
      if (blockRef.current) {
        blockRef.current.style.transition = "";
      }
    }, 150);
  };

  // Handle double-click to edit
  const handleDoubleClick = (e) => {
    // Don't start editing if clicking on interactive elements
    const isInteractiveElement = e.target.closest(
      "button, .image-remove-btn, [data-no-edit]",
    );

    if (isInteractiveElement) {
      return;
    }

    e.stopPropagation();
    if (!isEditing) {
      startEditing(block.id);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectBlock(block.id);
    openContextMenu(e.clientX, e.clientY, block.id);
  };

  // Handle pin toggle
  const handlePinToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBlockPin(block.id);
  };

  // Handle image upload from file input or drag-and-drop
  const processImageFile = (file) => {
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setIsImageUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target.result;
      const optimalSize = calculateOptimalBlockSize(
        block.content || "",
        140,
        80,
        450,
        320,
        true,
      );

      updateBlock(block.id, {
        image: imageData,
        width: optimalSize.width,
        height: optimalSize.height,
      });

      setIsImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload from file input
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    processImageFile(file);
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing && !block.image) {
      setIsDragOver(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing && !block.image) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the block entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isEditing || block.image) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      processImageFile(imageFile);
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    const optimalSize = calculateOptimalBlockSize(
      block.content || "",
      140,
      80,
      450,
      320,
      false,
    );
    updateBlock(block.id, {
      image: null,
      width: optimalSize.width,
      height: optimalSize.height,
    });
  };

  // Handle content save
  const handleSaveContent = () => {
    const trimmedContent = content.trim();

    // Calculate final optimal size
    const optimalSize = calculateOptimalBlockSize(
      trimmedContent,
      140,
      80,
      450,
      320,
      !!block.image,
    );

    // Update both content and size immediately when saving (no debounce needed)
    if (
      trimmedContent !== block.content ||
      block.width !== optimalSize.width ||
      block.height !== optimalSize.height
    ) {
      updateBlock(block.id, {
        content: trimmedContent,
        width: optimalSize.width,
        height: optimalSize.height,
      });
    }

    stopEditing();
  };

  // Handle content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Handle keyboard shortcuts in edit mode
  const handleKeyDown = (e) => {
    // Important: Stop propagation to prevent global shortcuts while editing
    e.stopPropagation();

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveContent();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveContent();
    } else if (e.key === "Escape") {
      setContent(block.content); // Reset content
      stopEditing();
    }
    // Allow all other keys (including cmd+z for text undo) to work normally in textarea
  };

  // Auto-resize textarea and update block size during editing
  const autoResize = () => {
    try {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          textareaRef.current.scrollHeight + "px";

        // Also calculate and update block size while editing
        const optimalSize = calculateOptimalBlockSize(
          content || "",
          140,
          80,
          450,
          320,
          !!block.image,
        );

        // Update block size in real-time during editing with bounds checking
        if (
          blockRef.current &&
          optimalSize.width > 0 &&
          optimalSize.height > 0
        ) {
          blockRef.current.style.width = `${Math.min(optimalSize.width, 500)}px`;
          blockRef.current.style.height = `${Math.min(optimalSize.height, 400)}px`;
        }
      }
    } catch (error) {
      console.warn("Error during auto-resize:", error);
    }
  };

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging && !isEditing) {
      const handleGlobalMouseMove = (e) => {
        // Only handle mouse move if we're actually dragging this block and not editing
        if (!isEditing) {
          handleMouseMove(e);
        }
      };

      const handleGlobalMouseUp = (e) => {
        // Only handle mouse up if we're not editing
        if (!isEditing) {
          handleMouseUp(e);
        }
      };

      document.addEventListener("mousemove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [
    isDragging,
    isEditing,
    canvas.zoom,
    canvas.viewportWidth,
    canvas.viewportHeight,
  ]);

  // Handle global keyboard shortcuts for selected blocks
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Critical: Prevent any block operations if user is actively editing text anywhere
      const activeElement = document.activeElement;
      const isTypingAnywhere =
        activeElement &&
        (activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "INPUT" ||
          activeElement.contentEditable === "true" ||
          activeElement.isContentEditable);

      // Extra safety: also check if this specific block is being edited
      if (isTypingAnywhere || isEditing) {
        return; // Don't interfere with text editing - allows cmd+z to work in text
      }

      // Only handle block-level shortcuts when not editing any text
      if (isSelected && !isEditing) {
        if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          deleteBlock(block.id);
        }
        // Note: We don't handle cmd+z here to avoid conflicts with text editing
        // Global undo should be handled at the mindmap level, not individual blocks
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isSelected, isEditing, deleteBlock, block.id]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      // Clean up any cursor changes when component unmounts
      if (isDragging) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [isDragging]);

  // Get focus weight indicator size
  const getFocusIndicatorSize = () => {
    const baseSize = 4;
    return baseSize + (block.focusWeight - 1) * 2;
  };

  return (
    <motion.div
      ref={blockRef}
      data-mind-block
      className={clsx("absolute group select-none mindmap-block", {
        "cursor-grab": !isEditing && !isDragging,
        "cursor-grabbing": isDragging && !isEditing,
        "cursor-text": isEditing,
        "cursor-default": isEditing,
        "resizing-block": isEditing,
        "border-accent-blue/40": isDragOver && !isEditing && !block.image,
      })}
      style={{
        ...style,
        zIndex: isDragging ? 1000 : "auto",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      layout
      layoutDependency={block.content}
      initial={{
        opacity: 0,
        scale: 0.8,
        x: 0,
        y: 0,
      }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.05 : isDragOver ? 1.02 : 1,
        x: isDragging ? dragOffset.x : 0,
        y: isDragging ? dragOffset.y : 0,
        zIndex: isSelected || isEditing ? 50 : 10,
      }}
      whileHover={{
        scale: isEditing ? 1 : 1.02,
        transition: { duration: 0.15 },
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        layout: { duration: 0.3, ease: "easeInOut" },
      }}
    >
      {/* Main block container */}
      <div
        className={clsx(
          "relative w-full h-full rounded-xl overflow-visible",
          "backdrop-blur-xl border transition-all duration-200 block-resize-transition block-container",
          {
            "block-with-image": !!block.image,
          },
          {
            // Dragging state with enhanced effects (highest priority)
            "bg-dark-surface/70 border-accent-blue/24 shadow-2xl ring-4 ring-accent-blue/12":
              isDragging,
            // Drag over state for image upload
            "bg-dark-surface/75 border-accent-blue/50 shadow-glow ring-2 ring-accent-blue/30":
              isDragOver && !isDragging && !isEditing && !block.image,
            // Editing state
            "bg-dark-surface/80 border-accent-purple/60 shadow-glow-lg ring-2 ring-accent-purple/30":
              isEditing && !isDragging && !isDragOver,
            // Repositioning state with enhanced visual feedback
            "bg-dark-surface/65 border-accent-orange/50 shadow-glow ring-2 ring-accent-orange/25":
              isRepositioning && !isDragging && !isEditing && !isDragOver,
            // Selected state (includes pinned blocks)
            "bg-dark-surface/60 border-accent-blue/40 shadow-glow ring-2 ring-accent-blue/20":
              (isSelected || isPinned) &&
              !isEditing &&
              !isDragging &&
              !isRepositioning &&
              !isDragOver,
            // Default state
            "bg-dark-surface/40 border-white/10 shadow-lg":
              !isSelected &&
              !isEditing &&
              !isRepositioning &&
              !isPinned &&
              !isDragging &&
              !isDragOver,
          },
        )}
        style={{
          filter: isDragging
            ? "drop-shadow(0 35px 70px rgba(59, 130, 246, 0.24)) brightness(1.06) saturate(1.12)"
            : isRepositioning
              ? "drop-shadow(0 8px 16px rgba(245, 158, 11, 0.15)) brightness(1.02)"
              : undefined,
          transform: isDragging
            ? "perspective(1000px) rotateX(3deg) rotateY(1deg)"
            : isRepositioning
              ? "scale(1.02)"
              : undefined,
          transition: isDragging
            ? "none"
            : isRepositioning
              ? "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
              : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Mood tag indicator */}
        <div
          className={clsx(
            "absolute top-0 left-0 w-full h-1 transition-colors duration-200",
            isPinned
              ? "bg-accent-blue"
              : isRepositioning
                ? "bg-accent-orange"
                : `bg-${moodTag.color}`,
            {},
          )}
        />

        {/* Pin button and Image upload button */}
        {!isEditing && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {!block.image && (
              <motion.button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "p-1 rounded-md transition-all duration-200",
                  "opacity-0 group-hover:opacity-100",
                  "hover:bg-white/10 text-dark-text-muted hover:text-dark-text",
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Add image"
              >
                {isImageUploading ? (
                  <div className="upload-spinner" />
                ) : (
                  <Image size={12} />
                )}
              </motion.button>
            )}
            <motion.button
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={handlePinToggle}
              className={clsx(
                "p-1 rounded-md transition-all duration-200",
                "opacity-0 group-hover:opacity-100",
                {
                  "opacity-100 bg-accent-blue/20 text-accent-blue": isPinned,
                  "hover:bg-white/10 text-dark-text-muted hover:text-dark-text":
                    !isPinned,
                },
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isPinned ? "Unpin block" : "Pin block"}
            >
              <Pin
                size={12}
                className={clsx("transition-transform duration-200", {
                  "rotate-45": isPinned,
                })}
              />
            </motion.button>
          </div>
        )}

        {/* Focus weight indicator - hidden when drag handle is visible */}
        {(isEditing || isOrganizeMode) && (
          <div
            className={clsx(
              "absolute bottom-2 right-2 rounded-full transition-all duration-200",
              isPinned ? "bg-accent-blue" : `bg-${moodTag.color}`,
            )}
            style={{
              width: getFocusIndicatorSize(),
              height: getFocusIndicatorSize(),
              opacity: 0.6,
            }}
          />
        )}

        {/* Content area */}
        <div className="relative p-4 pt-6 w-full h-full block-content overflow-visible">
          {/* Image section */}
          {block.image && (
            <div className="block-image-container mt-2">
              <img
                src={block.image}
                alt="Block content"
                className="block-image"
              />
              {!isEditing && (
                <button
                  onClick={handleImageRemove}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute -top-2 -left-2 w-5 h-5 bg-accent-red hover:bg-accent-red/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                  title="Remove image"
                >
                  <X size={12} className="text-white" />
                </button>
              )}
            </div>
          )}

          {/* Text content */}
          <div className={block.image ? "mt-2" : ""}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveContent}
                onInput={autoResize}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                }}
                onSelect={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className={clsx(
                  "w-full resize-none bg-transparent border-0 outline-none",
                  "text-dark-text placeholder-dark-text-muted",
                  "text-sm leading-relaxed font-medium block-textarea",
                )}
                placeholder="Enter your thought..."
                style={{
                  minHeight: block.image ? "40px" : "60px",
                  height: "auto",
                }}
              />
            ) : (
              <div
                className={clsx(
                  "w-full text-sm leading-relaxed font-medium",
                  "text-dark-text whitespace-pre-wrap break-words block-content",
                  "cursor-grab group-hover:cursor-grab overflow-visible",
                  {
                    "cursor-grabbing": isDragging,
                  },
                )}
                onMouseDown={(e) => {
                  // Prevent dragging during text selection
                  if (window.getSelection && window.getSelection().toString()) {
                    e.stopPropagation();
                    return;
                  }

                  // Double/triple click for text selection
                  if (e.detail > 1) {
                    e.stopPropagation();
                    return;
                  }
                }}
                onSelectStart={(e) => {
                  // Allow text selection, prevent drag
                  e.stopPropagation();
                }}
              >
                {block.content || (
                  <span className="text-dark-text-muted italic">
                    {block.image ? "Add text..." : "Double-click to edit..."}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Image upload button and drag-drop indicator */}
          {!block.image && !isEditing && (
            <>
              {isDragOver && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-3 py-2 bg-accent-blue/90 text-white text-sm rounded-md shadow-lg backdrop-blur-sm">
                    Drop image here
                  </div>
                </div>
              )}
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Enhanced repositioning indicator */}
        {isRepositioning && !isEditing && (
          <motion.div
            className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-orange/10 border border-accent-orange/20"
            initial={{ opacity: 0, scale: 0.8, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-accent-orange rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <span className="text-xs text-accent-orange font-medium">
              Moving
            </span>
          </motion.div>
        )}

        {/* Drag handle indicator */}
        {!isEditing && !isOrganizeMode && (
          <div
            className={clsx(
              "absolute bottom-2 right-2 transition-opacity duration-200",
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-60",
            )}
          >
            <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-1 h-1 rounded-full transition-colors duration-200",
                    isDragging ? "bg-accent-blue" : "bg-dark-text-muted",
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Drag and repositioning glow effects */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
                filter: "blur(15px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.24 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
          {isRepositioning && !isDragging && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(245, 158, 11, 0.06) 0%, transparent 70%)",
                filter: "blur(12px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </AnimatePresence>

        {/* Selection overlay */}
        <AnimatePresence>
          {isSelected && !isEditing && (
            <motion.div
              className="absolute inset-0 bg-accent-blue/5 pointer-events-none rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>

        {/* Timestamp on hover */}
        <AnimatePresence>
          {!isEditing && (
            <motion.div
              className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 0, y: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <div className="text-xs text-dark-text-muted bg-dark-bg/80 px-2 py-1 rounded backdrop-blur-sm">
                {new Date(block.lastEdited).toLocaleString()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MindBlock;

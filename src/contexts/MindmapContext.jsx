import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";

// Utility functions for dynamic text-based sizing
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
    const totalTextWidth = context.measureText(text.replace(/\s+/g, "")).width;
    const words = text.trim().split(/\s+/);

    // Allow wider blocks for better text visibility
    // Start with a more generous target width, but ensure image compatibility
    let targetLineWidth = Math.min(400, Math.max(180, totalTextWidth * 0.8));

    // Only reduce width if we have many words that can be wrapped nicely
    if (words.length > 8) {
      const estimatedLines = Math.ceil(Math.sqrt(words.length / 2));
      targetLineWidth = Math.min(
        350,
        Math.max(180, totalTextWidth / Math.max(1, estimatedLines - 1)),
      );
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

// Dynamic proportional sizing based on character count
const calculateOptimalSizeByCharacterCount = (
  content,
  minWidth = 140,
  minHeight = 80,
  maxWidth = 450,
  maxHeight = 320,
  hasImage = false,
) => {
  try {
    if (!content || typeof content !== "string" || content.trim() === "") {
      return { width: 160, height: 90 };
    }

    const charCount = content.length;
    const lineCount = content.split("\n").length;
    const avgCharsPerLine = charCount / Math.max(lineCount, 1);

    // Dynamic scaling factors
    const baseWidthScaling = 0.7; // px per character for width
    const baseHeightScaling = 0.25; // px per character for height

    // Use logarithmic scaling for very large content to prevent massive blocks
    const scalingFactor =
      charCount > 1000
        ? Math.log10(charCount) / Math.log10(1000) // Logarithmic dampening after 1000 chars
        : 1; // Linear scaling up to 1000 chars

    // Calculate base dimensions with character scaling
    let dynamicWidth = minWidth + charCount * baseWidthScaling * scalingFactor;
    let dynamicHeight =
      minHeight + charCount * baseHeightScaling * scalingFactor;

    // Adjust for line structure - smooth adjustments
    const lineStructureFactorWidth =
      avgCharsPerLine > 60
        ? 1 + (avgCharsPerLine - 60) * 0.008 // Wider for long lines
        : avgCharsPerLine < 25 && lineCount > 3
          ? 0.85 + avgCharsPerLine * 0.006 // Narrower for short lines
          : 1; // Normal

    const lineStructureFactorHeight =
      lineCount > 5
        ? 1 + (lineCount - 5) * 0.05 // Taller for many lines
        : lineCount < 2
          ? 0.9 // Shorter for single lines
          : 1; // Normal

    // Apply line structure adjustments
    dynamicWidth *= lineStructureFactorWidth;
    dynamicHeight *= lineStructureFactorHeight;

    // For very dense content, apply additional height scaling
    if (charCount > 500) {
      const densityFactor = Math.min(1.5, 1 + (charCount - 500) * 0.0008);
      dynamicHeight *= densityFactor;
    }

    // Account for images
    if (hasImage) {
      const imageHeight = 120;
      const imageSpacing = 8;
      dynamicHeight += imageHeight + imageSpacing;
      dynamicWidth = Math.max(dynamicWidth, 180 + 32);
    }

    // Apply final constraints with smooth clamping
    const finalWidth = Math.max(
      minWidth,
      Math.min(maxWidth, Math.ceil(dynamicWidth)),
    );
    const finalHeight = Math.max(
      minHeight,
      Math.min(maxWidth, Math.ceil(dynamicHeight)),
    );

    return { width: finalWidth, height: finalHeight };
  } catch (error) {
    console.warn(
      "Error calculating dynamic character-based block size:",
      error,
    );
    return { width: 200, height: 120 };
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
      idealWidth <= textDimensions.width + paddingX * 1.5;

    if (textFitsComfortably && aspectRatio > 2.2) {
      // Only adjust if text fits comfortably and block is very wide
      const targetWidth = idealHeight * 2.0;
      idealWidth = Math.max(minRequiredWidth, targetWidth);
    } else if (aspectRatio < 0.5) {
      // Only adjust very tall blocks
      const targetHeight = idealWidth * 0.6;
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

const MindmapContext = createContext();

export const useMindmap = () => {
  const context = useContext(MindmapContext);
  if (!context) {
    throw new Error("useMindmap must be used within a MindmapProvider");
  }
  return context;
};

export const MindmapProvider = ({ children, mindmapId }) => {
  // Core blocks state
  const [blocks, setBlocks] = useState(() => {
    return loadFromStorage(`mindmap-blocks-${mindmapId}`, []);
  });

  // Canvas state
  const [canvas, setCanvas] = useState(() => {
    return loadFromStorage(`mindmap-canvas-${mindmapId}`, {
      zoom: 1,
      panX: 0,
      panY: 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
  });

  // Enhanced dynamic scaling state to prevent conflicts
  const [isPerformingDynamicScaling, setIsPerformingDynamicScaling] =
    useState(false);
  const [scalingInProgress, setScalingInProgress] = useState(new Set());
  const scalingTimeouts = useRef(new Map());

  // UI state
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    blockId: null,
  });
  const [isCreatingBlock, setIsCreatingBlock] = useState(false);
  const [isAutoZooming, setIsAutoZooming] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-grouping state
  const [groupingSuggestions, setGroupingSuggestions] = useState([]);
  const [showGroupingSuggestion, setShowGroupingSuggestion] = useState(false);

  // Undo functionality state
  const [deletedBlocksHistory, setDeletedBlocksHistory] = useState([]);
  const [maxUndoHistory] = useState(10); // Keep last 10 deleted blocks
  const [repositioningBlocks, setRepositioningBlocks] = useState(new Set());

  // Pin functionality state
  const [isPinModeActive, setIsPinModeActive] = useState(false);
  const [pinnedBlocks, setPinnedBlocks] = useState(() => {
    const stored = loadFromStorage(`mindmap-pinned-blocks-${mindmapId}`, []);
    return new Set(stored);
  });

  // Organize mode functionality state
  const [isOrganizeModeActive, setIsOrganizeModeActive] = useState(false);
  const [organizeOriginalPositions, setOrganizeOriginalPositions] = useState(
    {},
  );

  // Mood tag options
  const moodTags = {
    neutral: { color: "dark-text-muted", label: "Neutral" },
    positive: { color: "accent-green", label: "Positive" },
    negative: { color: "accent-red", label: "Negative" },
    idea: { color: "accent-orange", label: "Idea" },
    important: { color: "accent-purple", label: "Important" },
    question: { color: "accent-blue", label: "Question" },
  };

  // Persist blocks to localStorage
  useEffect(() => {
    saveToStorage(`mindmap-blocks-${mindmapId}`, blocks);
  }, [blocks, mindmapId]);

  // Persist canvas state to localStorage
  useEffect(() => {
    saveToStorage(`mindmap-canvas-${mindmapId}`, canvas);
  }, [canvas, mindmapId]);

  // Persist pinned blocks to localStorage
  useEffect(() => {
    saveToStorage(
      `mindmap-pinned-blocks-${mindmapId}`,
      Array.from(pinnedBlocks),
    );
  }, [pinnedBlocks, mindmapId]);

  // Auto-detect grouping opportunities and adjust zoom
  useEffect(() => {
    if (blocks.length >= 3) {
      const timer = setTimeout(() => {
        detectGroupingOpportunities();
      }, 3000); // Check for grouping after 3 seconds of stability
      return () => clearTimeout(timer);
    }
  }, [blocks.length]);

  // Calculate content bounds for zoom limits
  const getContentBounds = useCallback(() => {
    if (blocks.length === 0) {
      return {
        minX: -400,
        maxX: 400,
        minY: -300,
        maxY: 300,
        width: 800,
        height: 600,
      };
    }

    const bounds = blocks.reduce(
      (acc, block) => ({
        minX: Math.min(acc.minX, block.x - 50),
        maxX: Math.max(acc.maxX, block.x + block.width + 50),
        minY: Math.min(acc.minY, block.y - 50),
        maxY: Math.max(acc.maxY, block.y + block.height + 50),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );

    return {
      ...bounds,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    };
  }, [blocks]);

  // Calculate optimal zoom that guarantees all blocks are visible
  const calculateOptimalZoom = useCallback(() => {
    const blockCount = blocks.length;

    if (blockCount === 0) return 1;

    const contentBounds = getContentBounds();
    const viewportWidth = canvas.viewportWidth || window.innerWidth || 1200;
    const viewportHeight = canvas.viewportHeight || window.innerHeight || 800;

    // Calculate zoom needed to fit ALL content with safe padding
    const safePadding = 0.85; // Use 85% of viewport for content
    const requiredZoomX = (viewportWidth * safePadding) / contentBounds.width;
    const requiredZoomY = (viewportHeight * safePadding) / contentBounds.height;

    // Always use the more restrictive zoom to guarantee visibility
    let optimalZoom = Math.min(requiredZoomX, requiredZoomY);

    // Apply reasonable bounds but prioritize visibility
    optimalZoom = Math.max(0.2, Math.min(2.0, optimalZoom));

    // For many blocks, ensure we don't zoom in too much
    if (blockCount > 15) {
      optimalZoom = Math.min(optimalZoom, 0.8);
    }
    if (blockCount > 30) {
      optimalZoom = Math.min(optimalZoom, 0.6);
    }
    if (blockCount > 50) {
      optimalZoom = Math.min(optimalZoom, 0.4);
    }

    return optimalZoom;
  }, [
    blocks.length,
    getContentBounds,
    canvas.viewportWidth,
    canvas.viewportHeight,
  ]);

  // Auto-adjust zoom based on content
  const autoAdjustZoom = useCallback(() => {
    const optimalZoom = calculateOptimalZoom();

    setCanvas((prev) => {
      const contentBounds = getContentBounds();
      const centerX = (contentBounds.minX + contentBounds.maxX) / 2;
      const centerY = (contentBounds.minY + contentBounds.maxY) / 2;

      return {
        ...prev,
        zoom: optimalZoom,
        panX: prev.viewportWidth / 2 - centerX * optimalZoom,
        panY: prev.viewportHeight / 2 - centerY * optimalZoom,
      };
    });
  }, [calculateOptimalZoom, getContentBounds]);

  // Auto-adjust zoom when block count changes (but not during dragging)
  useEffect(() => {
    if (blocks.length > 0 && !isDragging) {
      const timer = setTimeout(() => {
        autoAdjustZoom();
      }, 500); // Auto-adjust view when content changes
      return () => clearTimeout(timer);
    }
  }, [blocks.length, autoAdjustZoom, isDragging]);

  // Show notification
  const showNotification = useCallback(
    (message, type = "info", duration = 2000) => {
      setNotification({ message, type, id: Date.now() });
      setTimeout(() => {
        setNotification(null);
      }, duration);
    },
    [],
  );

  // Check if there's enough space around a position for a new block
  const hasSpaceForBlock = useCallback(
    (x, y, blockWidth = 180, blockHeight = 110, padding = 50) => {
      const screenX = x * canvas.zoom + canvas.panX;
      const screenY = y * canvas.zoom + canvas.panY;

      // Check if the block would be visible in current viewport
      const isInViewport =
        screenX >= -blockWidth &&
        screenX <= canvas.viewportWidth &&
        screenY >= -blockHeight &&
        screenY <= canvas.viewportHeight;

      if (!isInViewport) return false;

      // Check for collisions with existing blocks
      const hasCollision = blocks.some((block) => {
        const distance = Math.sqrt(
          Math.pow(block.x - x, 2) + Math.pow(block.y - y, 2),
        );
        return distance < blockWidth + padding;
      });

      return !hasCollision;
    },
    [blocks, canvas],
  );

  // Find the best position for a new block
  const findBestPosition = useCallback(
    (preferredX, preferredY, blockWidth = 180, blockHeight = 110) => {
      if (blocks.length === 0) {
        // First block goes in the center
        const position = {
          x: canvas.viewportWidth / 2 / canvas.zoom - blockWidth / 2,
          y: canvas.viewportHeight / 2 / canvas.zoom - blockHeight / 2,
        };
        return position;
      }

      // Convert preferred position to world coordinates
      const worldX = (preferredX - canvas.panX) / canvas.zoom;
      const worldY = (preferredY - canvas.panY) / canvas.zoom;

      // Check if preferred position has space
      if (hasSpaceForBlock(worldX, worldY, blockWidth, blockHeight)) {
        return { x: worldX, y: worldY };
      }

      // Find alternative positions in a spiral pattern from center
      const centerX = canvas.viewportWidth / 2 / canvas.zoom;
      const centerY = canvas.viewportHeight / 2 / canvas.zoom;
      const step = 50;
      const maxRadius = 500;

      for (let radius = step; radius <= maxRadius; radius += step) {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          if (hasSpaceForBlock(x, y, blockWidth, blockHeight)) {
            return { x, y };
          }
        }
      }

      // Fallback to preferred position
      return { x: worldX, y: worldY };
    },
    [blocks, canvas, hasSpaceForBlock],
  );

  // Update viewport size when window resizes
  useEffect(() => {
    const updateViewportSize = () => {
      setCanvas((prev) => ({
        ...prev,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }));
    };

    // Set correct viewport size on mount
    updateViewportSize();

    // Update on window resize
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  // Canvas operations
  const updateCanvas = useCallback((updates) => {
    setCanvas((prev) => ({ ...prev, ...updates }));
  }, []);

  const panCanvas = useCallback(
    (deltaX, deltaY) => {
      setCanvas((prev) => {
        const contentBounds = getContentBounds();
        const maxPanBuffer = 300; // Extra space beyond content for comfortable panning

        // Calculate pan limits based on content and viewport
        const minPanX =
          prev.viewportWidth - (contentBounds.maxX + maxPanBuffer) * prev.zoom;
        const maxPanX = -(contentBounds.minX - maxPanBuffer) * prev.zoom;
        const minPanY =
          prev.viewportHeight - (contentBounds.maxY + maxPanBuffer) * prev.zoom;
        const maxPanY = -(contentBounds.minY - maxPanBuffer) * prev.zoom;

        // Apply pan with limits
        const newPanX = Math.max(
          minPanX,
          Math.min(maxPanX, prev.panX + deltaX),
        );
        const newPanY = Math.max(
          minPanY,
          Math.min(maxPanY, prev.panY + deltaY),
        );

        return {
          ...prev,
          panX: newPanX,
          panY: newPanY,
        };
      });
    },
    [getContentBounds],
  );

  // Pin functionality
  const toggleBlockPin = useCallback(
    (blockId) => {
      setPinnedBlocks((prev) => {
        const newPinned = new Set(prev);
        if (newPinned.has(blockId)) {
          newPinned.delete(blockId);
        } else {
          newPinned.add(blockId);
        }
        return newPinned;
      });
    },
    [showNotification],
  );

  const togglePinMode = useCallback(() => {
    if (pinnedBlocks.size === 0 && !isPinModeActive) {
      return;
    }

    setIsPinModeActive((prev) => !prev);

    // Auto-adjust view when toggling pin mode
    setTimeout(() => {
      autoAdjustZoom();
    }, 100);
  }, [pinnedBlocks.size, isPinModeActive, autoAdjustZoom]);

  // Organize mode functionality
  const toggleOrganizeMode = useCallback(() => {
    if (!isOrganizeModeActive) {
      // Entering organize mode - store original positions and organize
      const originalPositions = {};
      blocks.forEach((block) => {
        originalPositions[block.id] = { x: block.x, y: block.y };
      });
      setOrganizeOriginalPositions(originalPositions);

      // Calculate grid positions and organize blocks
      const cols = Math.ceil(Math.sqrt(blocks.length));
      const rows = Math.ceil(blocks.length / cols);

      // Calculate average block dimensions for organize mode
      const avgWidth =
        blocks.length > 0
          ? blocks.reduce((sum, block) => sum + (block.width || 180), 0) /
            blocks.length
          : 180;
      const avgHeight =
        blocks.length > 0
          ? blocks.reduce((sum, block) => sum + (block.height || 110), 0) /
            blocks.length
          : 110;

      const blockWidth = Math.max(180, avgWidth + 20); // Add padding for organize mode
      const blockHeight = Math.max(110, avgHeight + 20);
      const spacing = 50;

      // Calculate total grid size
      const totalWidth = cols * (blockWidth + spacing) - spacing;
      const totalHeight = rows * (blockHeight + spacing) - spacing;

      // Calculate starting position to center the grid
      const startX = -totalWidth / 2;
      const startY = -totalHeight / 2;

      // Arrange blocks in grid
      const organizedBlocks = blocks.map((block, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * (blockWidth + spacing);
        const y = startY + row * (blockHeight + spacing);

        return {
          ...block,
          x,
          y,
          lastEdited: new Date().toISOString(),
        };
      });

      setBlocks(organizedBlocks);
      setIsOrganizeModeActive(true);

      // Center the organized grid
      setTimeout(() => {
        autoAdjustZoom();
      }, 100);
    } else {
      // Exiting organize mode without applying - revert to original positions
      revertOrganize();
    }
  }, [isOrganizeModeActive, blocks, autoAdjustZoom]);

  const applyOrganize = useCallback(() => {
    // Apply the organized positions and exit organize mode
    setIsOrganizeModeActive(false);
    setOrganizeOriginalPositions({});

    // Auto-adjust view after applying
    setTimeout(() => {
      autoAdjustZoom();
    }, 100);
  }, [autoAdjustZoom]);

  const revertOrganize = useCallback(() => {
    // Revert blocks to their original positions
    const revertedBlocks = blocks.map((block) => {
      const originalPos = organizeOriginalPositions[block.id];
      if (originalPos) {
        return {
          ...block,
          x: originalPos.x,
          y: originalPos.y,
          lastEdited: new Date().toISOString(),
        };
      }
      return block;
    });

    setBlocks(revertedBlocks);
    setIsOrganizeModeActive(false);
    setOrganizeOriginalPositions({});

    // Auto-adjust view after reverting
    setTimeout(() => {
      autoAdjustZoom();
    }, 100);
  }, [blocks, organizeOriginalPositions, autoAdjustZoom]);

  // Get filtered blocks based on pin mode
  const getVisibleBlocks = useCallback(() => {
    if (isPinModeActive) {
      return blocks.filter((block) => pinnedBlocks.has(block.id));
    }
    return blocks;
  }, [blocks, isPinModeActive, pinnedBlocks]);

  const centerCanvas = useCallback(() => {
    if (blocks.length === 0) {
      // Reset to default position if no blocks
      setCanvas((prev) => ({
        ...prev,
        zoom: 1,
        panX: 0,
        panY: 0,
      }));
      return;
    }

    // Ensure we have valid viewport dimensions
    const viewportWidth = canvas.viewportWidth || window.innerWidth || 1200;
    const viewportHeight = canvas.viewportHeight || window.innerHeight || 800;

    const contentBounds = getContentBounds();

    // Handle edge case where content bounds might be invalid
    if (contentBounds.width <= 0 || contentBounds.height <= 0) {
      return;
    }

    const centerX = (contentBounds.minX + contentBounds.maxX) / 2;
    const centerY = (contentBounds.minY + contentBounds.maxY) / 2;

    // Calculate zoom to GUARANTEE all blocks are visible with generous padding
    const safePadding = 0.9; // Use 90% of viewport to ensure visibility
    const zoomX = (viewportWidth * safePadding) / contentBounds.width;
    const zoomY = (viewportHeight * safePadding) / contentBounds.height;

    // Always use the more restrictive zoom to ensure ALL content fits
    let zoom = Math.min(zoomX, zoomY);

    // Ensure minimum zoom for readability but prioritize visibility
    zoom = Math.max(0.2, Math.min(2.0, zoom));

    // Force zoom lower if we have many blocks to ensure all are visible
    if (blocks.length > 10) {
      zoom = Math.min(zoom, 0.8);
    } else if (blocks.length > 20) {
      zoom = Math.min(zoom, 0.6);
    }

    setCanvas((prev) => ({
      ...prev,
      zoom,
      panX: viewportWidth / 2 - centerX * zoom,
      panY: viewportHeight / 2 - centerY * zoom,
    }));
  }, [blocks, canvas.viewportWidth, canvas.viewportHeight, getContentBounds]);

  // Gentle re-centering for maintaining balance
  const gentleRecenter = useCallback(() => {
    if (blocks.length === 0 || isDragging) return;

    // Calculate center of mass of all blocks
    const centerOfMass = blocks.reduce(
      (acc, block) => ({
        x: acc.x + (block.x + block.width / 2),
        y: acc.y + (block.y + block.height / 2),
      }),
      { x: 0, y: 0 },
    );

    centerOfMass.x /= blocks.length;
    centerOfMass.y /= blocks.length;

    // Current center of viewport in world coordinates
    const currentCenterX =
      (canvas.viewportWidth / 2 - canvas.panX) / canvas.zoom;
    const currentCenterY =
      (canvas.viewportHeight / 2 - canvas.panY) / canvas.zoom;

    // Only recenter if we're significantly off-center
    const offsetX = Math.abs(centerOfMass.x - currentCenterX);
    const offsetY = Math.abs(centerOfMass.y - currentCenterY);
    const threshold =
      Math.min(canvas.viewportWidth, canvas.viewportHeight) / canvas.zoom / 4;

    if (offsetX > threshold || offsetY > threshold) {
      setCanvas((prev) => ({
        ...prev,
        panX: prev.viewportWidth / 2 - centerOfMass.x * prev.zoom,
        panY: prev.viewportHeight / 2 - centerOfMass.y * prev.zoom,
      }));
    }
  }, [blocks, canvas, isDragging]);

  // Auto adjust view when content changes
  const autoZoomOutAndCenter = useCallback(() => {
    if (blocks.length === 0) return;

    setIsAutoZooming(true);

    // Use the intelligent auto-zoom system with proper centering
    setTimeout(() => {
      autoAdjustZoom();
    }, 50);

    setTimeout(() => {
      setIsAutoZooming(false);
    }, 600);
  }, [blocks.length, autoAdjustZoom]);

  // Reposition overlapping blocks with precise iterative algorithm
  const repositionOverlappingBlocks = useCallback(
    (newBlock, existingBlocks) => {
      const padding = 8; // Reduced padding for dynamic sizes
      const maxIterations = 80; // Fewer iterations to prevent over-repositioning
      const minMoveDistance = 2; // Even smaller movements for dynamic sizes
      const stabilityThreshold = 0.5; // Consider stable if total movement < 0.5px

      // Helper function to check if two blocks overlap using their actual dimensions
      const blocksOverlap = (block1, block2) => {
        const block1Width = block1.width || 200;
        const block1Height = block1.height || 100;
        const block2Width = block2.width || 200;
        const block2Height = block2.height || 100;

        // Use adaptive padding based on block sizes
        const adaptivePadding = Math.min(
          padding,
          Math.max(
            4,
            Math.min(block1Width, block1Height, block2Width, block2Height) / 20,
          ),
        );

        return !(
          block1.x + block1Width + adaptivePadding <= block2.x ||
          block2.x + block2Width + adaptivePadding <= block1.x ||
          block1.y + block1Height + adaptivePadding <= block2.y ||
          block2.y + block2Height + adaptivePadding <= block1.y
        );
      };

      // Helper function to calculate precise overlap amount using actual dimensions
      const getOverlapAmount = (block1, block2) => {
        const block1Width = block1.width || 200;
        const block1Height = block1.height || 100;
        const block2Width = block2.width || 200;
        const block2Height = block2.height || 100;

        const overlapX = Math.min(
          block1.x + block1Width + padding - block2.x,
          block2.x + block2Width + padding - block1.x,
        );
        const overlapY = Math.min(
          block1.y + block1Height + padding - block2.y,
          block2.y + block2Height + padding - block1.y,
        );
        return Math.sqrt(overlapX * overlapX + overlapY * overlapY);
      };

      // Create working copy of blocks including the new block
      let workingBlocks = [...existingBlocks];
      let repositionedIds = new Set();
      let hasOverlaps = true;
      let iterations = 0;
      let totalMovement = 0;
      let previousPositions = new Map();

      // Store initial positions for stability check
      workingBlocks.forEach((block, index) => {
        previousPositions.set(index, { x: block.x, y: block.y });
      });

      // Iterative repositioning until no overlaps exist and system is stable
      while (hasOverlaps && iterations < maxIterations) {
        hasOverlaps = false;
        iterations++;
        totalMovement = 0;

        // Check each existing block against the new block and other repositioned blocks
        for (let i = 0; i < workingBlocks.length; i++) {
          const currentBlock = workingBlocks[i];
          let needsRepositioning = false;
          let totalPushX = 0;
          let totalPushY = 0;
          let pushCount = 0;

          // Check overlap with new block
          if (blocksOverlap(currentBlock, newBlock)) {
            needsRepositioning = true;
            hasOverlaps = true;

            // Calculate push direction away from new block
            const deltaX = currentBlock.x - newBlock.x;
            const deltaY = currentBlock.y - newBlock.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance === 0) {
              // If exactly on top, push in a consistent direction based on block ID
              const angle =
                (currentBlock.id.charCodeAt(currentBlock.id.length - 1) / 256) *
                Math.PI *
                2;
              totalPushX += Math.cos(angle) * 2; // Stronger push for exact overlaps
              totalPushY += Math.sin(angle) * 2;
            } else {
              // Weight the push by overlap amount for more precise positioning
              const overlapAmount = getOverlapAmount(currentBlock, newBlock);
              const pushStrength = Math.min(2, overlapAmount / 50);
              totalPushX += (deltaX / distance) * pushStrength;
              totalPushY += (deltaY / distance) * pushStrength;
            }
            pushCount++;
          }

          // Check overlap with other existing blocks
          for (let j = 0; j < workingBlocks.length; j++) {
            if (i === j) continue;
            const otherBlock = workingBlocks[j];

            if (blocksOverlap(currentBlock, otherBlock)) {
              needsRepositioning = true;
              hasOverlaps = true;

              // Calculate push direction away from other block
              const deltaX = currentBlock.x - otherBlock.x;
              const deltaY = currentBlock.y - otherBlock.y;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

              if (distance === 0) {
                // If exactly on top, use block IDs to determine consistent direction
                const angle =
                  ((currentBlock.id.charCodeAt(0) -
                    otherBlock.id.charCodeAt(0)) /
                    256) *
                  Math.PI *
                  2;
                totalPushX += Math.cos(angle) * 1.5;
                totalPushY += Math.sin(angle) * 1.5;
              } else {
                // Weight the push by overlap amount
                const overlapAmount = getOverlapAmount(
                  currentBlock,
                  otherBlock,
                );
                const pushStrength = Math.min(1.5, overlapAmount / 60);
                totalPushX += (deltaX / distance) * pushStrength;
                totalPushY += (deltaY / distance) * pushStrength;
              }
              pushCount++;
            }
          }

          // Apply repositioning if needed
          if (needsRepositioning) {
            repositionedIds.add(currentBlock.id);

            // Normalize the push direction
            const pushLength = Math.sqrt(
              totalPushX * totalPushX + totalPushY * totalPushY,
            );
            if (pushLength > 0) {
              const normalizedPushX = totalPushX / pushLength;
              const normalizedPushY = totalPushY / pushLength;

              // Calculate more conservative movement distance for dynamic sizes
              const currentWidth = currentBlock.width || 200;
              const currentHeight = currentBlock.height || 100;
              const sizeFactor = Math.max(
                0.5,
                Math.min(1.0, 300 / (currentWidth + currentHeight)),
              );
              const moveDistance = Math.max(
                minMoveDistance,
                Math.min(15, (currentWidth + currentHeight) / 12) * sizeFactor, // More conservative movement
              );

              const moveX = normalizedPushX * moveDistance;
              const moveY = normalizedPushY * moveDistance;

              // Track total movement for stability check
              totalMovement += Math.sqrt(moveX * moveX + moveY * moveY);

              // Update block position
              workingBlocks[i] = {
                ...currentBlock,
                x: currentBlock.x + moveX,
                y: currentBlock.y + moveY,
                lastEdited: new Date().toISOString(),
              };
            }
          }
        }

        // Stability check - if blocks aren't moving much, system is stable
        if (totalMovement < stabilityThreshold && iterations > 3) {
          hasOverlaps = false; // Force exit if system is stable
        }
      }

      // Mark repositioned blocks for visual feedback
      if (repositionedIds.size > 0) {
        setRepositioningBlocks(repositionedIds);

        // Repositioning happens silently for smooth workflow

        // Clear repositioning state after animation
        setTimeout(() => {
          setRepositioningBlocks(new Set());
        }, 800);
      }

      return workingBlocks;
    },
    [],
  );

  // Block operations
  const createBlock = useCallback(
    (x, y, content = "") => {
      // Create block exactly where the user clicked
      const worldX = (x - canvas.panX) / canvas.zoom;
      const worldY = (y - canvas.panY) / canvas.zoom;

      // Calculate size based on initial content
      const initialSize = calculateOptimalBlockSize(content);

      const newBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
        x: worldX,
        y: worldY,
        moodTag: "neutral",
        focusWeight: 1,
        width: initialSize.width,
        height: initialSize.height,
        isPinned: false,
        image: null,
      };

      // Reposition existing blocks that would overlap with precise algorithm
      const repositionedBlocks = repositionOverlappingBlocks(newBlock, blocks);

      // Update all blocks with repositioned ones plus new block
      setBlocks([...repositionedBlocks, newBlock]);
      setEditingBlock(newBlock.id);

      // Reset grouping suggestions when new blocks are added
      setGroupingSuggestions([]);
      setShowGroupingSuggestion(false);

      // Auto-adjust view after adding new content
      setTimeout(() => {
        autoAdjustZoom();
      }, 300); // Small delay to let repositioning animations settle

      return newBlock.id;
    },
    [
      canvas.panX,
      canvas.panY,
      canvas.zoom,
      canvas.viewportWidth,
      canvas.viewportHeight,
      blocks,
      repositionOverlappingBlocks,
      autoZoomOutAndCenter,
      gentleRecenter,
    ],
  );

  // Optimized intelligent neighbor repositioning with performance improvements
  const intelligentNeighborRepositioning = useCallback(
    (changedBlock, allBlocks) => {
      const otherBlocks = allBlocks.filter(
        (block) => block.id !== changedBlock.id,
      );

      // Calculate influence radius based on block size
      const blockWidth = changedBlock.width || 200;
      const blockHeight = changedBlock.height || 100;
      const influenceRadius = Math.max(blockWidth, blockHeight) * 1.2;

      // Find blocks within influence radius and calculate repositioning force
      const affectedBlocks = otherBlocks.map((block) => {
        const dx = block.x - changedBlock.x;
        const dy = block.y - changedBlock.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < influenceRadius && distance > 0) {
          // Calculate push force (stronger for closer blocks)
          const force = Math.max(
            0,
            (influenceRadius - distance) / influenceRadius,
          );
          const pushDistance = force * 150; // Base push distance

          // Normalize direction and apply push
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          const newX = block.x + normalizedDx * pushDistance;
          const newY = block.y + normalizedDy * pushDistance;

          return {
            ...block,
            x: newX,
            y: newY,
            repositioned: true,
            pushForce: force,
          };
        }

        return { ...block, repositioned: false, pushForce: 0 };
      });

      // Check for chain reactions (repositioned blocks affecting others)
      const chainReactionBlocks = affectedBlocks.map((block) => {
        if (!block.repositioned) return block;

        // Check if this repositioned block now affects other blocks
        const chainAffected = affectedBlocks.filter(
          (otherBlock) =>
            otherBlock.id !== block.id && !otherBlock.repositioned,
        );

        chainAffected.forEach((otherBlock) => {
          const dx = otherBlock.x - block.x;
          const dy = otherBlock.y - block.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const chainRadius =
            Math.max(block.width || 200, block.height || 100) * 0.8;

          if (distance < chainRadius && distance > 0) {
            const chainForce = 0.3; // Weaker chain reaction force
            const chainPush = chainForce * 80;
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            otherBlock.x += normalizedDx * chainPush;
            otherBlock.y += normalizedDy * chainPush;
            otherBlock.chainReaction = true;
          }
        });

        return block;
      });

      return [changedBlock, ...chainReactionBlocks];
    },
    [],
  );

  // Dynamic zoom management: Adjust zoom when blocks grow significantly
  const dynamicZoomAdjustment = useCallback(
    (changedBlock, previousSize) => {
      const currentWidth = changedBlock.width || 200;
      const currentHeight = changedBlock.height || 100;
      const previousWidth = previousSize?.width || 200;
      const previousHeight = previousSize?.height || 100;

      // Calculate size increase percentage
      const widthIncrease = (currentWidth - previousWidth) / previousWidth;
      const heightIncrease = (currentHeight - previousHeight) / previousHeight;
      const maxIncrease = Math.max(widthIncrease, heightIncrease);

      // Trigger zoom adjustment if block grew significantly (>30%)
      if (maxIncrease > 0.3) {
        const currentContentBounds = getContentBounds();
        const currentZoom = canvas.zoom;

        // Calculate new content bounds including the enlarged block
        const newBounds = {
          minX: Math.min(currentContentBounds.minX, changedBlock.x),
          maxX: Math.max(
            currentContentBounds.maxX,
            changedBlock.x + currentWidth,
          ),
          minY: Math.min(currentContentBounds.minY, changedBlock.y),
          maxY: Math.max(
            currentContentBounds.maxY,
            changedBlock.y + currentHeight,
          ),
        };

        // Calculate required zoom to fit all content
        const viewportWidth = canvas.viewportWidth || window.innerWidth;
        const viewportHeight = canvas.viewportHeight || window.innerHeight;
        const safePadding = 0.85;

        const requiredZoomX =
          (viewportWidth * safePadding) / (newBounds.maxX - newBounds.minX);
        const requiredZoomY =
          (viewportHeight * safePadding) / (newBounds.maxY - newBounds.minY);
        const targetZoom = Math.min(requiredZoomX, requiredZoomY);

        // Only zoom out if current zoom is too high for the new content size
        if (targetZoom < currentZoom) {
          const smoothZoom = Math.max(targetZoom, currentZoom * 0.8); // Gradual zoom out

          setCanvas((prev) => {
            const centerX = (newBounds.minX + newBounds.maxX) / 2;
            const centerY = (newBounds.minY + newBounds.maxY) / 2;

            return {
              ...prev,
              zoom: smoothZoom,
              panX: viewportWidth / 2 - centerX * smoothZoom,
              panY: viewportHeight / 2 - centerY * smoothZoom,
            };
          });

          // Show notification about zoom adjustment
          showNotification(
            `Zoomed out to accommodate larger block`,
            "info",
            2500,
          );

          return true; // Indicates zoom was adjusted
        }
      }

      return false; // No zoom adjustment needed
    },
    [
      getContentBounds,
      canvas.zoom,
      canvas.viewportWidth,
      canvas.viewportHeight,
      showNotification,
    ],
  );

  // Enhanced block size change handler with conflict prevention
  const handleDynamicScaling = useCallback(
    (blockId, newSize, previousSize) => {
      // Prevent multiple simultaneous scaling operations on the same block
      if (scalingInProgress.has(blockId)) {
        return;
      }

      // Clear any existing timeout for this block
      if (scalingTimeouts.current.has(blockId)) {
        clearTimeout(scalingTimeouts.current.get(blockId));
        scalingTimeouts.current.delete(blockId);
      }

      // Mark block as scaling in progress
      setScalingInProgress((prev) => new Set([...prev, blockId]));
      setIsPerformingDynamicScaling(true);

      setBlocks((prev) => {
        const currentBlock = prev.find((block) => block.id === blockId);
        if (!currentBlock) {
          // Clean up scaling state if block not found
          setScalingInProgress((prev) => {
            const newSet = new Set(prev);
            newSet.delete(blockId);
            return newSet;
          });
          return prev;
        }

        // Update the block with new size
        const updatedBlock = { ...currentBlock, ...newSize };
        const otherBlocks = prev.filter((block) => block.id !== blockId);

        // Apply intelligent neighbor repositioning only if significant change
        const sizeChange = Math.abs(
          newSize.width * newSize.height -
            (previousSize?.width || 200) * (previousSize?.height || 100),
        );
        const shouldRepositionNeighbors = sizeChange > 5000; // Only for significant size changes

        let repositionedBlocks = [updatedBlock, ...otherBlocks];
        let repositionedIds = new Set();

        if (shouldRepositionNeighbors) {
          repositionedBlocks = intelligentNeighborRepositioning(updatedBlock, [
            updatedBlock,
            ...otherBlocks,
          ]);

          // Identify repositioned blocks for animation
          repositionedBlocks.forEach((block) => {
            const originalBlock = prev.find((b) => b.id === block.id);
            if (
              originalBlock &&
              block.id !== blockId &&
              (Math.abs(block.x - originalBlock.x) > 8 ||
                Math.abs(block.y - originalBlock.y) > 8)
            ) {
              repositionedIds.add(block.id);
            }
          });
        }

        // Handle repositioning animations efficiently
        if (repositionedIds.size > 0) {
          const repositionedWithDistance = Array.from(repositionedIds)
            .map((id) => {
              const block = repositionedBlocks.find((b) => b.id === id);
              const distance = Math.sqrt(
                Math.pow(block.x - updatedBlock.x, 2) +
                  Math.pow(block.y - updatedBlock.y, 2),
              );
              return { id, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Limit to 10 blocks for performance

          // Optimized staggered animations
          repositionedWithDistance.forEach((item, index) => {
            const delay = index * 40; // Reduced stagger for smoother experience
            const timeoutId = setTimeout(() => {
              setRepositioningBlocks((prev) => new Set([...prev, item.id]));
            }, delay);

            // Store timeout for cleanup
            scalingTimeouts.current.set(`reposition-${item.id}`, timeoutId);
          });

          // Clear animation indicators with cleanup
          const clearTimeoutId = setTimeout(
            () => {
              setRepositioningBlocks(new Set());
              // Clean up stored timeouts
              repositionedWithDistance.forEach((item) => {
                scalingTimeouts.current.delete(`reposition-${item.id}`);
              });
            },
            800 + repositionedWithDistance.length * 40,
          );

          scalingTimeouts.current.set(`clear-${blockId}`, clearTimeoutId);

          // Show notification only for significant repositioning
          if (repositionedIds.size > 2) {
            const message = `Repositioned ${repositionedIds.size} neighbor blocks`;
            showNotification(message, "info", 1500);
          }
        }

        return repositionedBlocks;
      });

      // Optimized dynamic zoom adjustment with cleanup
      const zoomTimeoutId = setTimeout(() => {
        dynamicZoomAdjustment(
          { ...blocks.find((b) => b.id === blockId), ...newSize },
          previousSize,
        );

        // Clean up scaling state
        setScalingInProgress((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });

        // Update global scaling state
        setIsPerformingDynamicScaling(
          (prev) => prev && scalingInProgress.size > 1,
        );

        scalingTimeouts.current.delete(blockId);
      }, 80); // Reduced delay for snappier response

      scalingTimeouts.current.set(blockId, zoomTimeoutId);
    },
    [
      blocks,
      intelligentNeighborRepositioning,
      dynamicZoomAdjustment,
      showNotification,
      scalingInProgress,
    ],
  );

  // Detect large paste operations and handle them intelligently
  const handleLargePasteOperation = useCallback(
    (blockId, content, previousContent = "") => {
      const charDiff = content.length - previousContent.length;
      const isLargePaste = charDiff > 50; // Lower threshold for more responsive scaling

      if (isLargePaste) {
        // Use dynamic proportional sizing for any content change
        const optimalSize = calculateOptimalSizeByCharacterCount(
          content,
          140,
          80,
          450,
          320,
          false, // We'll handle images separately
        );

        // Get current block to check for images
        const currentBlock = blocks.find((block) => block.id === blockId);
        if (currentBlock?.image) {
          const imageHeight = 120;
          const imageSpacing = 8;
          optimalSize.height += imageHeight + imageSpacing;
          optimalSize.width = Math.max(optimalSize.width, 180 + 32);
        }

        const previousSize = {
          width: currentBlock?.width || 200,
          height: currentBlock?.height || 100,
        };

        // Use enhanced dynamic scaling for the paste operation
        handleDynamicScaling(
          blockId,
          {
            content: content,
            width: optimalSize.width,
            height: optimalSize.height,
          },
          previousSize,
        );

        // Show notification for paste operations with size info
        const sizeInfo = `${optimalSize.width}×${optimalSize.height}`;
        showNotification(
          `Auto-sized to ${sizeInfo} for ${charDiff} characters`,
          "info",
          2000,
        );

        return true; // Indicates that paste was handled
      }

      return false; // Regular handling should continue
    },
    [blocks, handleDynamicScaling, showNotification],
  );

  // Smooth scaling for very large content with performance considerations
  const handleVeryLargeContent = useCallback(
    (blockId, content) => {
      const charCount = content.length;

      if (charCount > 3000) {
        // Use dynamic scaling even for very large content, but with performance warnings
        const currentBlock = blocks.find((block) => block.id === blockId);
        if (!currentBlock) return false;

        // Calculate optimal size using the dynamic system
        const optimalSize = calculateOptimalSizeByCharacterCount(
          content,
          140,
          80,
          450,
          320,
          !!currentBlock.image,
        );

        const previousSize = {
          width: currentBlock.width || 200,
          height: currentBlock.height || 100,
        };

        // For very large content, show performance warning
        if (charCount > 8000) {
          showNotification(
            `Very large content (${Math.round(charCount / 1000)}k chars). May impact performance.`,
            "warning",
            4000,
          );
        }

        // Use the standard dynamic scaling system
        handleDynamicScaling(
          blockId,
          {
            content: content,
            width: optimalSize.width,
            height: optimalSize.height,
          },
          previousSize,
        );

        // Show scaling completion notification
        const sizeInfo = `${optimalSize.width}×${optimalSize.height}`;
        showNotification(
          `Scaled to ${sizeInfo} for ${Math.round(charCount / 1000)}k characters`,
          "info",
          3000,
        );

        return true; // Indicates large content was handled
      }

      return false; // No special handling needed
    },
    [
      blocks,
      calculateOptimalSizeByCharacterCount,
      handleDynamicScaling,
      showNotification,
    ],
  );

  // Helper function to check and resolve overlaps when a block changes size
  const checkAndResolveOverlaps = useCallback(
    (changedBlock, allBlocks) => {
      const otherBlocks = allBlocks.filter(
        (block) => block.id !== changedBlock.id,
      );

      // Check if the changed block now overlaps with any other blocks
      const hasOverlaps = otherBlocks.some((otherBlock) => {
        const block1Width = changedBlock.width || 200;
        const block1Height = changedBlock.height || 100;
        const block2Width = otherBlock.width || 200;
        const block2Height = otherBlock.height || 100;
        const padding = 8;

        return !(
          changedBlock.x + block1Width + padding <= otherBlock.x ||
          otherBlock.x + block2Width + padding <= changedBlock.x ||
          changedBlock.y + block1Height + padding <= otherBlock.y ||
          otherBlock.y + block2Height + padding <= changedBlock.y
        );
      });

      if (hasOverlaps) {
        // Use existing repositioning algorithm
        const repositionedBlocks = repositionOverlappingBlocks(
          changedBlock,
          otherBlocks,
        );

        // Identify which blocks were actually moved
        const repositionedIds = new Set();
        repositionedBlocks.forEach((block, index) => {
          const originalBlock = otherBlocks[index];
          if (
            originalBlock &&
            (Math.abs(block.x - originalBlock.x) > 5 ||
              Math.abs(block.y - originalBlock.y) > 5)
          ) {
            repositionedIds.add(block.id);
          }
        });

        // Trigger cascading repositioning animations and show notification
        if (repositionedIds.size > 0) {
          // Calculate distances from the changed block for cascade timing
          const repositionedWithDistance = repositionedBlocks
            .map((block, index) => {
              const originalBlock = otherBlocks[index];
              if (originalBlock && repositionedIds.has(block.id)) {
                const distance = Math.sqrt(
                  Math.pow(block.x - changedBlock.x, 2) +
                    Math.pow(block.y - changedBlock.y, 2),
                );
                return { id: block.id, distance };
              }
              return null;
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance);

          // Apply cascade timing - closer blocks start moving first
          repositionedWithDistance.forEach((item, index) => {
            const delay = index * 80; // 80ms stagger between each block
            setTimeout(() => {
              setRepositioningBlocks((prev) => new Set([...prev, item.id]));
            }, delay);
          });

          // Clear all repositioning indicators after the longest animation
          const totalDuration =
            800 + (repositionedWithDistance.length - 1) * 80;
          setTimeout(() => {
            setRepositioningBlocks(new Set());
          }, totalDuration);

          // Show notification about automatic repositioning
          const blockCount = repositionedIds.size;
          const message =
            blockCount === 1
              ? "Moved 1 block to prevent overlap"
              : `Moved ${blockCount} blocks to prevent overlap`;
          showNotification(message, "info", 2000);
        }

        return [...repositionedBlocks, changedBlock];
      }

      return allBlocks;
    },
    [repositionOverlappingBlocks, showNotification],
  );

  const updateBlock = useCallback(
    (id, updates) => {
      const currentBlock = blocks.find((block) => block.id === id);
      if (!currentBlock) return;

      // Check for large paste operations first
      if (updates.content && currentBlock.content) {
        const wasHandledAsLargePaste = handleLargePasteOperation(
          id,
          updates.content,
          currentBlock.content,
        );

        if (wasHandledAsLargePaste) {
          return; // Large paste was handled, no need for standard processing
        }
      }

      // Check for very large content that needs special handling
      if (updates.content) {
        const wasHandledAsLargeContent = handleVeryLargeContent(
          id,
          updates.content,
        );

        if (wasHandledAsLargeContent) {
          return; // Large content scaling was applied
        }
      }

      // Check if this is a significant size change for dynamic scaling
      const hasSizeChange =
        updates.width || updates.height || updates.image !== undefined;
      const oldWidth = currentBlock.width || 200;
      const oldHeight = currentBlock.height || 100;
      const newWidth = updates.width || oldWidth;
      const newHeight = updates.height || oldHeight;

      // Calculate if size change is significant enough for dynamic scaling
      const significantWidthChange = Math.abs(newWidth - oldWidth) > 15;
      const significantHeightChange = Math.abs(newHeight - oldHeight) > 15;
      const needsDynamicScaling =
        hasSizeChange && (significantWidthChange || significantHeightChange);

      if (needsDynamicScaling) {
        // Use enhanced dynamic scaling with intelligent repositioning
        handleDynamicScaling(
          id,
          { width: newWidth, height: newHeight, ...updates },
          { width: oldWidth, height: oldHeight },
        );
      } else {
        // Standard update for minor changes
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === id
              ? { ...block, ...updates, lastEdited: new Date().toISOString() }
              : block,
          ),
        );
      }
    },
    [
      blocks,
      handleDynamicScaling,
      handleLargePasteOperation,
      handleVeryLargeContent,
    ],
  );

  const deleteBlock = useCallback(
    (id) => {
      // Find the block being deleted and save it to history
      const blockToDelete = blocks.find((block) => block.id === id);
      if (blockToDelete) {
        setDeletedBlocksHistory((prev) => {
          const newHistory = [
            {
              ...blockToDelete,
              deletedAt: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, maxUndoHistory); // Keep only last N deleted blocks
          return newHistory;
        });
      }

      setBlocks((prev) => prev.filter((block) => block.id !== id));
      setSelectedBlocks((prev) => prev.filter((blockId) => blockId !== id));
      if (editingBlock === id) {
        setEditingBlock(null);
      }
      // Reset grouping suggestions when blocks are deleted
      setGroupingSuggestions([]);
      setShowGroupingSuggestion(false);

      // Show notification that block can be restored
      showNotification("Block deleted. Press Cmd+Z to restore.", "info", 3000);
    },
    [editingBlock, blocks, maxUndoHistory, showNotification],
  );

  const undoDeleteBlock = useCallback(() => {
    if (deletedBlocksHistory.length === 0) {
      showNotification("Nothing to restore", "warning", 2000);
      return;
    }

    // Get the most recently deleted block
    const [mostRecentDeleted, ...remainingHistory] = deletedBlocksHistory;

    // Remove the deletedAt timestamp and restore the block
    const { deletedAt, ...restoredBlock } = mostRecentDeleted;

    // Update the lastEdited timestamp to show it was restored
    const blockToRestore = {
      ...restoredBlock,
      lastEdited: new Date().toISOString(),
    };

    // Add the block back
    setBlocks((prev) => [...prev, blockToRestore]);

    // Update the deleted blocks history
    setDeletedBlocksHistory(remainingHistory);

    // Show notification
    showNotification("Block restored successfully", "success", 2000);

    // Gentle reposition to ensure the restored block is visible
    setTimeout(() => {
      gentleRecenter();
    }, 100);
  }, [deletedBlocksHistory, showNotification, gentleRecenter]);

  const duplicateBlock = useCallback(
    (id) => {
      const originalBlock = blocks.find((block) => block.id === id);
      if (!originalBlock) return;

      const newBlock = {
        ...originalBlock,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: originalBlock.x + 20,
        y: originalBlock.y + 20,
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
      };

      setBlocks((prev) => [...prev, newBlock]);

      // Reset grouping suggestions when blocks are duplicated
      setGroupingSuggestions([]);
      setShowGroupingSuggestion(false);

      return newBlock.id;
    },
    [blocks],
  );

  const moveBlock = useCallback(
    (id, deltaX, deltaY) => {
      // Ensure zoom is valid to prevent division by zero or infinity
      const safeZoom = Math.max(canvas.zoom, 0.1);

      // Convert screen space deltas to world space deltas
      // Only scale needs to be considered for deltas (not translation)
      const worldDeltaX = deltaX / safeZoom;
      const worldDeltaY = deltaY / safeZoom;

      // Immediate update without batching for responsive dragging
      setBlocks((prev) => {
        const updatedBlocks = prev.map((block) =>
          block.id === id
            ? {
                ...block,
                x: block.x + worldDeltaX,
                y: block.y + worldDeltaY,
                lastEdited: new Date().toISOString(),
              }
            : block,
        );
        return updatedBlocks;
      });
    },
    [canvas.zoom],
  );

  const setBlockPosition = useCallback((id, x, y) => {
    setBlocks((prev) => {
      const updatedBlocks = prev.map((block) =>
        block.id === id
          ? {
              ...block,
              x,
              y,
              lastEdited: new Date().toISOString(),
            }
          : block,
      );
      return updatedBlocks;
    });
  }, []);

  // Dragging state management
  const startDragging = useCallback(() => {
    setIsDragging(true);
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Save mindmap metadata
  const saveMindmap = useCallback(() => {
    const userMindmaps = loadFromStorage("user-mindmaps", []);
    const mindmapIndex = userMindmaps.findIndex((m) => m.id === mindmapId);

    if (mindmapIndex !== -1) {
      const updatedMindmap = {
        ...userMindmaps[mindmapIndex],
        lastModified: Date.now(),
        blockCount: blocks.length,
        name: userMindmaps[mindmapIndex].name || "Untitled Mindmap",
      };

      userMindmaps[mindmapIndex] = updatedMindmap;
      saveToStorage("user-mindmaps", userMindmaps);
    }
  }, [mindmapId, blocks.length]);

  const resizeBlock = useCallback((id, width, height) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? { ...block, width, height, lastEdited: new Date().toISOString() }
          : block,
      ),
    );
  }, []);

  // Detect grouping opportunities based on content similarity and proximity
  const detectGroupingOpportunities = useCallback(() => {
    if (blocks.length < 3) return;

    // Simple keyword-based grouping detection
    const keywords = {
      work: [
        "work",
        "job",
        "task",
        "project",
        "meeting",
        "deadline",
        "team",
        "client",
      ],
      personal: [
        "personal",
        "family",
        "home",
        "health",
        "hobby",
        "friend",
        "social",
      ],
      learning: [
        "learn",
        "study",
        "read",
        "course",
        "skill",
        "knowledge",
        "research",
      ],
      ideas: [
        "idea",
        "think",
        "concept",
        "brainstorm",
        "creative",
        "innovation",
        "solution",
      ],
    };

    const groups = {};
    const ungrouped = [];

    blocks.forEach((block) => {
      const content = block.content.toLowerCase();
      let foundGroup = false;

      for (const [category, words] of Object.entries(keywords)) {
        if (words.some((word) => content.includes(word))) {
          if (!groups[category]) groups[category] = [];
          groups[category].push(block);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        ungrouped.push(block);
      }
    });

    // Only suggest grouping if we found meaningful groups
    const significantGroups = Object.entries(groups).filter(
      ([_, blocks]) => blocks.length >= 2,
    );

    if (significantGroups.length > 0) {
      setGroupingSuggestions(significantGroups);
      setShowGroupingSuggestion(true);
    }
  }, [blocks]);

  // Apply grouping suggestion
  const applyGroupingSuggestion = useCallback(
    (groupName, groupBlocks) => {
      // Calculate group center position
      const centerX =
        groupBlocks.reduce((sum, block) => sum + block.x, 0) /
        groupBlocks.length;
      const centerY =
        groupBlocks.reduce((sum, block) => sum + block.y, 0) /
        groupBlocks.length;

      // Arrange blocks in a small cluster around the center
      const updatedBlocks = blocks.map((block) => {
        const groupBlock = groupBlocks.find((gb) => gb.id === block.id);
        if (groupBlock) {
          const index = groupBlocks.indexOf(groupBlock);
          const angle = (index / groupBlocks.length) * Math.PI * 2;
          const radius = 80;

          return {
            ...block,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            lastEdited: new Date().toISOString(),
          };
        }
        return block;
      });

      setBlocks(updatedBlocks);
      setGroupingSuggestions([]);
      setShowGroupingSuggestion(false);
      showNotification(
        `✨ Grouped ${groupBlocks.length} ${groupName} blocks`,
        "success",
        2000,
      );

      // Gentle recenter to show the grouping
      setTimeout(() => {
        gentleRecenter();
      }, 200);
    },
    [blocks, showNotification, gentleRecenter],
  );

  // Dismiss grouping suggestion
  const dismissGroupingSuggestion = useCallback(() => {
    setShowGroupingSuggestion(false);
    setGroupingSuggestions([]);
  }, []);

  // Selection operations
  const selectBlock = useCallback((id, addToSelection = false) => {
    if (addToSelection) {
      setSelectedBlocks((prev) =>
        prev.includes(id)
          ? prev.filter((blockId) => blockId !== id)
          : [...prev, id],
      );
    } else {
      setSelectedBlocks([id]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBlocks([]);
  }, []);

  const deleteSelectedBlocks = useCallback(() => {
    selectedBlocks.forEach(deleteBlock);
    setSelectedBlocks([]);
  }, [selectedBlocks, deleteBlock]);

  // Context menu operations
  const openContextMenu = useCallback((x, y, blockId = null) => {
    setContextMenu({ isOpen: true, x, y, blockId });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0, blockId: null });
  }, []);

  // Editing operations
  const startEditing = useCallback((id) => {
    setEditingBlock(id);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingBlock(null);
  }, []);

  // Utility functions
  const getBlockById = useCallback(
    (id) => {
      return blocks.find((block) => block.id === id);
    },
    [blocks],
  );

  const getBlocksInArea = useCallback(
    (x, y, width, height) => {
      return blocks.filter(
        (block) =>
          block.x < x + width &&
          block.x + block.width > x &&
          block.y < y + height &&
          block.y + block.height > y,
      );
    },
    [blocks],
  );

  const clearAllBlocks = useCallback(() => {
    setBlocks([]);
    setSelectedBlocks([]);
    setEditingBlock(null);
    setGroupingSuggestions([]);
    setShowGroupingSuggestion(false);
  }, []);

  // Search and filter
  const searchBlocks = useCallback(
    (query) => {
      if (!query.trim()) return blocks;
      const lowercaseQuery = query.toLowerCase();
      return blocks.filter((block) =>
        block.content.toLowerCase().includes(lowercaseQuery),
      );
    },
    [blocks],
  );

  const getBlocksByMoodTag = useCallback(
    (moodTag) => {
      return blocks.filter((block) => block.moodTag === moodTag);
    },
    [blocks],
  );

  // Statistics
  const getStatistics = useCallback(() => {
    const totalBlocks = blocks.length;
    const moodTagCounts = Object.keys(moodTags).reduce((acc, tag) => {
      acc[tag] = blocks.filter((block) => block.moodTag === tag).length;
      return acc;
    }, {});

    const averageFocusWeight =
      totalBlocks > 0
        ? blocks.reduce((sum, block) => sum + block.focusWeight, 0) /
          totalBlocks
        : 0;

    return {
      totalBlocks,
      moodTagCounts,
      averageFocusWeight,
      createdToday: blocks.filter((block) => {
        const today = new Date().toDateString();
        const blockDate = new Date(block.createdAt).toDateString();
        return today === blockDate;
      }).length,
    };
  }, [blocks, moodTags]);

  const value = {
    // State
    blocks,
    canvas,
    selectedBlocks,
    editingBlock,
    draggedBlock,
    contextMenu,
    isCreatingBlock,
    isAutoZooming,
    isDragging,
    notification,
    groupingSuggestions,
    showGroupingSuggestion,
    repositioningBlocks,
    isPinModeActive,
    pinnedBlocks,
    isOrganizeModeActive,
    organizeOriginalPositions,
    moodTags,

    // Dynamic scaling state
    isPerformingDynamicScaling,
    scalingInProgress,

    // Block operations
    createBlock,
    updateBlock,
    deleteBlock,
    undoDeleteBlock,
    duplicateBlock,
    moveBlock,
    setBlockPosition,
    resizeBlock,
    startDragging,
    stopDragging,
    saveMindmap,

    // Canvas operations
    updateCanvas,
    panCanvas,
    centerCanvas,
    autoAdjustZoom,
    calculateOptimalZoom,

    // Selection operations
    selectBlock,
    clearSelection,
    deleteSelectedBlocks,

    // Context menu operations
    openContextMenu,
    closeContextMenu,

    // Editing operations
    startEditing,
    stopEditing,

    // Drag operations
    setDraggedBlock,
    setIsCreatingBlock,

    // Utility functions
    getBlockById,
    getBlocksInArea,
    clearAllBlocks,
    searchBlocks,
    getBlocksByMoodTag,
    getStatistics,

    // Auto-space management
    hasSpaceForBlock,
    autoZoomOutAndCenter,
    gentleRecenter,
    findBestPosition,
    showNotification,

    // Intelligent layout functions
    applyGroupingSuggestion,
    dismissGroupingSuggestion,
    detectGroupingOpportunities,
    repositionOverlappingBlocks,

    // Pin functionality
    toggleBlockPin,
    togglePinMode,
    getVisibleBlocks,

    // Organize mode functionality
    toggleOrganizeMode,
    applyOrganize,
    revertOrganize,

    // Enhanced dynamic scaling functionality
    handleDynamicScaling,
    handleLargePasteOperation,
    calculateOptimalSizeByCharacterCount,
    handleVeryLargeContent,
    intelligentNeighborRepositioning,
    dynamicZoomAdjustment,
  };

  // Cleanup effect for scaling timeouts and state management
  useEffect(() => {
    return () => {
      // Clear all scaling timeouts on unmount
      scalingTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      scalingTimeouts.current.clear();

      // Reset scaling state
      setScalingInProgress(new Set());
      setIsPerformingDynamicScaling(false);
      setRepositioningBlocks(new Set());
    };
  }, []);

  // Effect to clean up completed scaling operations
  useEffect(() => {
    if (scalingInProgress.size === 0) {
      setIsPerformingDynamicScaling(false);
    }
  }, [scalingInProgress]);

  return (
    <MindmapContext.Provider value={value}>{children}</MindmapContext.Provider>
  );
};

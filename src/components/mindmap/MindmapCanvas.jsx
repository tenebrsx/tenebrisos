import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMindmap } from "../../contexts/MindmapContext";
import MindBlock from "./MindBlock";

const MindmapCanvas = () => {
  const {
    blocks,
    canvas,
    repositioningBlocks,
    getVisibleBlocks,
    isPinModeActive,
    isOrganizeModeActive,
    organizeOriginalPositions,
  } = useMindmap();

  // Get visible blocks based on pin mode
  const visibleBlocks = getVisibleBlocks();

  // Calculate grid positions for organize mode
  const organizedBlocks = useMemo(() => {
    if (!isOrganizeModeActive) return visibleBlocks;

    const cols = Math.ceil(Math.sqrt(visibleBlocks.length));
    const rows = Math.ceil(visibleBlocks.length / cols);

    // Calculate grid cell size based on the largest block dimensions
    const maxBlockWidth = Math.max(
      ...visibleBlocks.map((block) => block.width || 200),
    );
    const maxBlockHeight = Math.max(
      ...visibleBlocks.map((block) => block.height || 120),
    );
    const blockWidth = maxBlockWidth + 20; // Add some padding
    const blockHeight = maxBlockHeight + 20; // Add some padding
    const spacing = 50;

    // Calculate total grid size
    const totalWidth = cols * (blockWidth + spacing) - spacing;
    const totalHeight = rows * (blockHeight + spacing) - spacing;

    // Calculate starting position to center the grid
    const startX = -totalWidth / 2;
    const startY = -totalHeight / 2;

    return visibleBlocks.map((block, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (blockWidth + spacing);
      const y = startY + row * (blockHeight + spacing);

      return {
        ...block,
        x,
        y,
      };
    });
  }, [visibleBlocks, isOrganizeModeActive]);

  // Use organized positions in organize mode, original positions otherwise
  const displayBlocks = isOrganizeModeActive ? organizedBlocks : visibleBlocks;

  return (
    <motion.div
      className="absolute inset-0 w-full h-full"
      style={{
        transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
        transformOrigin: "0 0",
      }}
      transition={{ type: "tween", duration: 0.1 }}
    >
      {/* Render all mind blocks with pin mode animations */}
      <AnimatePresence mode="popLayout">
        {displayBlocks.map((block) => (
          <motion.div
            key={block.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              layout: { duration: 0.4, ease: "easeInOut" },
            }}
            style={{
              position: "absolute",
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
            }}
          >
            <MindBlock
              block={block}
              isOrganizeMode={isOrganizeModeActive}
              isRepositioning={repositioningBlocks.has(block.id)}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default MindmapCanvas;

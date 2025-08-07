import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Grid3X3, RotateCcw } from "lucide-react";
import { useMindmap } from "../../contexts/MindmapContext";

const OrganizeModeControls = () => {
  const { isOrganizeModeActive, applyOrganize, revertOrganize, blocks } =
    useMindmap();

  return (
    <AnimatePresence>
      {isOrganizeModeActive && (
        <motion.div
          className="fixed bottom-32 right-6 z-50 w-96"
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 20, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="glass rounded-xl border border-white/20 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-dark-surface/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-blue/20 rounded-lg">
                  <Grid3X3 size={20} className="text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-semibold text-dark-text">
                    Organize Mode
                  </h3>
                  <p className="text-xs text-dark-text-secondary">
                    {blocks.length} blocks arranged in grid layout
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-dark-text-secondary mb-6 leading-relaxed">
                Your blocks have been organized into a clean grid layout. Choose
                to keep this organized structure or return to your original
                creative arrangement.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Apply Button */}
                <motion.button
                  onClick={applyOrganize}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-accent-blue text-white rounded-lg font-medium text-sm transition-all duration-200 hover:bg-accent-blue/90 shadow-glow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={18} />
                  Apply Organization
                </motion.button>

                {/* Revert Button */}
                <motion.button
                  onClick={revertOrganize}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-dark-surface border border-white/20 text-dark-text-secondary hover:text-dark-text rounded-lg font-medium text-sm transition-all duration-200 hover:bg-white/5"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw size={18} />
                  Restore Original
                </motion.button>
              </div>
            </div>

            {/* Footer Hint */}
            <div className="px-6 py-3 border-t border-white/10 bg-dark-surface/10">
              <div className="text-xs text-dark-text-muted text-center">
                <span className="font-medium">Apply</span> keeps the grid layout
                permanently •<span className="font-medium"> Restore</span>{" "}
                returns to your creative arrangement
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrganizeModeControls;

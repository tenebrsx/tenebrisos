import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Users, Lightbulb, Briefcase, BookOpen, User } from 'lucide-react';
import { useMindmap } from '../../contexts/MindmapContext';
import clsx from 'clsx';

const GroupingSuggestion = () => {
  const {
    groupingSuggestions,
    showGroupingSuggestion,
    applyGroupingSuggestion,
    dismissGroupingSuggestion,
  } = useMindmap();

  if (!showGroupingSuggestion || groupingSuggestions.length === 0) {
    return null;
  }

  const getCategoryIcon = (category) => {
    const icons = {
      work: Briefcase,
      personal: User,
      learning: BookOpen,
      ideas: Lightbulb,
    };
    return icons[category] || Users;
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: 'accent-blue',
      personal: 'accent-green',
      learning: 'accent-purple',
      ideas: 'accent-orange',
    };
    return colors[category] || 'accent-blue';
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      work: '💼',
      personal: '🏠',
      learning: '📚',
      ideas: '💡',
    };
    return emojis[category] || '📊';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-32 right-6 z-50 max-w-80"
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 20, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="glass rounded-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  className="text-lg"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  🧠
                </motion.div>
                <div>
                  <h3 className="text-sm font-medium text-dark-text">
                    Smart Grouping
                  </h3>
                  <p className="text-xs text-dark-text-secondary">
                    We noticed some patterns...
                  </p>
                </div>
              </div>
              <motion.button
                onClick={dismissGroupingSuggestion}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-dark-text-muted hover:text-dark-text"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} />
              </motion.button>
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-4 space-y-3">
            {groupingSuggestions.map(([category, blocks], index) => {
              const Icon = getCategoryIcon(category);
              const color = getCategoryColor(category);
              const emoji = getCategoryEmoji(category);

              return (
                <motion.div
                  key={category}
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{emoji}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-dark-text capitalize">
                        {category} blocks
                      </div>
                      <div className="text-xs text-dark-text-secondary">
                        {blocks.length} blocks detected
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full bg-${color}`} />
                  </div>

                  {/* Block Preview */}
                  <div className="bg-dark-surface/30 rounded-lg p-2 space-y-1">
                    {blocks.slice(0, 3).map((block, blockIndex) => (
                      <div
                        key={block.id}
                        className="text-xs text-dark-text-muted truncate flex items-center gap-2"
                      >
                        <div className={`w-1 h-1 rounded-full bg-${color}`} />
                        <span>
                          {block.content || 'Empty block'}
                        </span>
                      </div>
                    ))}
                    {blocks.length > 3 && (
                      <div className="text-xs text-dark-text-muted italic">
                        + {blocks.length - 3} more...
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => applyGroupingSuggestion(category, blocks)}
                      className={clsx(
                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                        'transition-all duration-200',
                        `bg-${color} text-white hover:bg-${color}/90 shadow-glow`
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CheckCircle size={12} />
                      Group them
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-dark-surface/20">
            <div className="flex items-center justify-between">
              <div className="text-xs text-dark-text-muted">
                Non-destructive grouping
              </div>
              <motion.button
                onClick={dismissGroupingSuggestion}
                className="text-xs text-dark-text-secondary hover:text-dark-text transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Maybe later
              </motion.button>
            </div>
          </div>
        </div>

        {/* Hint Arrow */}
        <motion.div
          className="absolute -right-2 top-8 w-4 h-4 bg-dark-bg border-r border-b border-white/20 transform rotate-45"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default GroupingSuggestion;

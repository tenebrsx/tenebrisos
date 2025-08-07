import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, RefreshCw } from "lucide-react";

const QuoteWidget = ({ widgetId, size = "small", isCustomizing }) => {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const quotes = [
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "motivation",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
      category: "innovation",
    },
    {
      text: "Life is what happens to you while you're busy making other plans.",
      author: "John Lennon",
      category: "life",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
      category: "dreams",
    },
    {
      text: "It is during our darkest moments that we must focus to see the light.",
      author: "Aristotle",
      category: "perseverance",
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "courage",
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "action",
    },
    {
      text: "Don't let yesterday take up too much of today.",
      author: "Will Rogers",
      category: "mindfulness",
    },
    {
      text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
      author: "Unknown",
      category: "learning",
    },
    {
      text: "If you are not willing to risk the usual, you will have to settle for the ordinary.",
      author: "Jim Rohn",
      category: "risk",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "belief",
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: "beginning",
    },
    {
      text: "In the middle of difficulty lies opportunity.",
      author: "Albert Einstein",
      category: "opportunity",
    },
    {
      text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
      author: "Ralph Waldo Emerson",
      category: "inner-strength",
    },
    {
      text: "The best time to plant a tree was 20 years ago. The second best time is now.",
      author: "Chinese Proverb",
      category: "timing",
    },
    {
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      category: "authenticity",
    },
    {
      text: "Be yourself; everyone else is already taken.",
      author: "Oscar Wilde",
      category: "individuality",
    },
    {
      text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
      author: "Albert Einstein",
      category: "wisdom",
    },
    {
      text: "A room without books is like a body without a soul.",
      author: "Marcus Tullius Cicero",
      category: "knowledge",
    },
    {
      text: "If you tell the truth, you don't have to remember anything.",
      author: "Mark Twain",
      category: "truth",
    },
  ];

  // Get quote based on current date (same quote per day)
  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24,
    );
    const quoteIndex = dayOfYear % quotes.length;
    return quotes[quoteIndex];
  };

  // Get random quote (for refresh feature)
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  // Initialize quote
  useEffect(() => {
    setIsLoading(true);
    // Simulate a small delay for smoother experience
    const timer = setTimeout(() => {
      setCurrentQuote(getDailyQuote());
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const refreshQuote = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsLoading(false);
    }, 300);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "p-4";
      case "medium":
        return "p-6";
      default:
        return "p-4";
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          quote: "text-sm",
          author: "text-xs",
        };
      case "medium":
        return {
          quote: "text-base",
          author: "text-sm",
        };
      default:
        return {
          quote: "text-sm",
          author: "text-xs",
        };
    }
  };

  const textSizes = getTextSizeClasses();

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
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
            <Quote size={16} className="text-accent-purple" />
          </div>
          <div>
            <h3 className="font-medium text-dark-text">Daily Quote</h3>
            <p className="text-xs text-dark-text-muted">Daily inspiration</p>
          </div>
        </div>

        {!isCustomizing && (
          <motion.button
            onClick={refreshQuote}
            className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </motion.button>
        )}
      </div>

      {/* Quote Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="h-4 bg-dark-surface rounded animate-pulse" />
            <div className="h-4 bg-dark-surface rounded animate-pulse w-3/4" />
            <div className="h-3 bg-dark-surface rounded animate-pulse w-1/2" />
          </motion.div>
        ) : currentQuote ? (
          <motion.div
            key="quote"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Quote Text */}
            <div className="relative">
              <Quote
                size={20}
                className="absolute -top-2 -left-1 text-accent-purple/30"
              />
              <blockquote
                className={`${textSizes.quote} text-dark-text leading-relaxed pl-6 italic`}
              >
                "{currentQuote.text}"
              </blockquote>
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <cite
                className={`${textSizes.author} text-dark-text-secondary font-medium not-italic`}
              >
                — {currentQuote.author}
              </cite>

              {/* Category Badge */}
              <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-full">
                {currentQuote.category}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-4"
          >
            <p className="text-dark-text-muted text-sm">Unable to load quote</p>
            <button
              onClick={refreshQuote}
              className="text-accent-purple text-sm hover:text-accent-purple/80 transition-colors mt-2"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      {!isLoading && currentQuote && (
        <motion.div
          className="mt-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-dark-text-muted text-center">
            A new quote awaits tomorrow
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuoteWidget;

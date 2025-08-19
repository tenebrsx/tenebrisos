import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Play,
  Zap,
  Battery,
  BatteryLow,
  Clock,
  Heart,
  Brain,
  Target,
  Coffee,
  Sunrise,
  Sun,
  Moon,
  Smile,
  Meh,
  Frown,
  Focus,
  EyeOff,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createOpenAIService } from "../services/openai.js";
import { useSettings } from "../contexts/SettingsContext";
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";

const ThingsToDo = () => {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [activities, setActivities] = useState(() => {
    return loadFromStorage("activities", []);
  });
  const navigate = useNavigate();

  // Debug utility to clear problematic activities (development only)
  const clearActivities = () => {
    setActivities([]);
    saveToStorage("activities", []);
    window.dispatchEvent(new CustomEvent("activityUpdated"));
  };

  const questions = [
    {
      id: "energy",
      title: "How's your energy level?",
      subtitle: "This helps us match activities to your current state",
      options: [
        {
          value: "low",
          label: "Low Energy",
          icon: BatteryLow,
          color: "accent-red",
        },
        {
          value: "medium",
          label: "Moderate",
          icon: Battery,
          color: "accent-orange",
        },
        {
          value: "high",
          label: "High Energy",
          icon: Zap,
          color: "accent-green",
        },
      ],
    },
    {
      id: "mood",
      title: "How are you feeling?",
      subtitle: "Your mood influences the best activities for you",
      options: [
        {
          value: "stressed",
          label: "Stressed",
          icon: Frown,
          color: "accent-red",
        },
        { value: "neutral", label: "Neutral", icon: Meh, color: "accent-blue" },
        { value: "happy", label: "Happy", icon: Smile, color: "accent-green" },
        {
          value: "motivated",
          label: "Motivated",
          icon: Target,
          color: "accent-purple",
        },
      ],
    },
    {
      id: "focus",
      title: "How focused are you?",
      subtitle: "This determines the complexity of suggested activities",
      options: [
        {
          value: "scattered",
          label: "Scattered",
          icon: EyeOff,
          color: "accent-red",
        },
        { value: "okay", label: "Okay", icon: Brain, color: "accent-orange" },
        {
          value: "focused",
          label: "Very Focused",
          icon: Focus,
          color: "accent-green",
        },
      ],
    },
    {
      id: "timeAvailable",
      title: "How much time do you have?",
      subtitle: "We'll suggest activities that fit your schedule",
      options: [
        { value: "15", label: "15 minutes", icon: Clock, color: "accent-blue" },
        {
          value: "30",
          label: "30 minutes",
          icon: Clock,
          color: "accent-purple",
        },
        { value: "60", label: "1 hour", icon: Clock, color: "accent-green" },
        {
          value: "120",
          label: "2+ hours",
          icon: Calendar,
          color: "accent-orange",
        },
      ],
    },
    {
      id: "timeOfDay",
      title: "What time is it?",
      subtitle: "Different activities work better at different times",
      options: [
        {
          value: "morning",
          label: "Morning",
          icon: Sunrise,
          color: "accent-orange",
        },
        {
          value: "afternoon",
          label: "Afternoon",
          icon: Sun,
          color: "accent-blue",
        },
        {
          value: "evening",
          label: "Evening",
          icon: Moon,
          color: "accent-purple",
        },
      ],
    },
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateSuggestions();
    }
  };

  const generateSuggestions = async () => {
    setIsGenerating(true);

    try {
      const apiKey = settings.ai?.apiKey;
      if (apiKey) {
        const openaiService = createOpenAIService(apiKey);

        // Try AI suggestions first
        try {
          const result = await openaiService.generateActivitySuggestions(
            `Based on: ${answers.energy} energy, ${answers.mood} mood, ${answers.focus} focus, ${answers.timeAvailable} minutes available, ${answers.timeOfDay}`,
            parseInt(answers.timeAvailable),
          );

          if (result && result.suggestions) {
            setSuggestions(result.suggestions);
          } else {
            setSuggestions(generateRuleBasedSuggestions());
          }
        } catch (aiError) {
          console.log("AI suggestions failed, using rule-based:", aiError);
          setSuggestions(generateRuleBasedSuggestions());
        }
      } else {
        // Use rule-based suggestions when no API key
        setSuggestions(generateRuleBasedSuggestions());
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setSuggestions(generateRuleBasedSuggestions());
    } finally {
      setIsGenerating(false);
      setCurrentStep(questions.length);
    }
  };

  const generateRuleBasedSuggestions = () => {
    const suggestions = [];
    const timeLimit = parseInt(answers.timeAvailable);

    // Energy-based suggestions
    if (answers.energy === "high") {
      suggestions.push(
        {
          activity: "Quick workout",
          duration: Math.min(30, timeLimit),
          category: "fitness",
          reason: "High energy is perfect for exercise",
        },
        {
          activity: "Organize workspace",
          duration: Math.min(25, timeLimit),
          category: "productivity",
          reason: "Channel energy into productivity",
        },
      );
    } else if (answers.energy === "low") {
      suggestions.push(
        {
          activity: "Gentle stretching",
          duration: Math.min(15, timeLimit),
          category: "wellness",
          reason: "Gentle movement can boost energy",
        },
        {
          activity: "Read something inspiring",
          duration: Math.min(20, timeLimit),
          category: "learning",
          reason: "Light mental stimulation",
        },
      );
    }

    // Mood-based suggestions
    if (answers.mood === "stressed") {
      suggestions.push(
        {
          activity: "5-minute meditation",
          duration: Math.min(10, timeLimit),
          category: "wellness",
          reason: "Reduce stress and center yourself",
        },
        {
          activity: "Listen to calming music",
          duration: Math.min(15, timeLimit),
          category: "relaxation",
          reason: "Music can improve mood",
        },
      );
    } else if (answers.mood === "motivated") {
      suggestions.push(
        {
          activity: "Start a new project",
          duration: Math.min(45, timeLimit),
          category: "creative",
          reason: "Capitalize on motivation",
        },
        {
          activity: "Learn something new",
          duration: Math.min(30, timeLimit),
          category: "learning",
          reason: "Perfect time for growth",
        },
      );
    }

    // Focus-based suggestions
    if (answers.focus === "focused") {
      suggestions.push(
        {
          activity: "Deep work session",
          duration: Math.min(60, timeLimit),
          category: "work",
          reason: "Your focus is optimal for complex tasks",
        },
        {
          activity: "Tackle challenging problem",
          duration: Math.min(45, timeLimit),
          category: "problem-solving",
          reason: "High focus enables difficult work",
        },
      );
    } else if (answers.focus === "scattered") {
      suggestions.push(
        {
          activity: "Quick tidy up",
          duration: Math.min(15, timeLimit),
          category: "organization",
          reason: "Simple tasks for scattered attention",
        },
        {
          activity: "Light social activity",
          duration: Math.min(20, timeLimit),
          category: "social",
          reason: "Social interaction can help refocus",
        },
      );
    }

    // Time-of-day suggestions
    if (answers.timeOfDay === "morning") {
      suggestions.push(
        {
          activity: "Plan your day",
          duration: Math.min(15, timeLimit),
          category: "planning",
          reason: "Morning is perfect for planning",
        },
        {
          activity: "Morning journaling",
          duration: Math.min(10, timeLimit),
          category: "reflection",
          reason: "Start day with intention",
        },
      );
    } else if (answers.timeOfDay === "evening") {
      suggestions.push(
        {
          activity: "Reflect on the day",
          duration: Math.min(10, timeLimit),
          category: "reflection",
          reason: "Evening reflection builds growth",
        },
        {
          activity: "Prepare for tomorrow",
          duration: Math.min(15, timeLimit),
          category: "planning",
          reason: "Set yourself up for success",
        },
      );
    }

    // Always include some universal suggestions
    suggestions.push(
      {
        activity: "Take a mindful walk",
        duration: Math.min(20, timeLimit),
        category: "movement",
        reason: "Walking is always beneficial",
      },
      {
        activity: "Quick creative break",
        duration: Math.min(15, timeLimit),
        category: "creative",
        reason: "Creativity boosts well-being",
      },
    );

    // Remove duplicates and limit to 6 suggestions
    const uniqueSuggestions = suggestions
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.activity === item.activity),
      )
      .slice(0, 6);

    return uniqueSuggestions;
  };

  const startActivity = (suggestion) => {
    console.log("🎯 ThingsToDo: Starting activity from suggestion", {
      suggestion,
    });

    const newActivity = {
      id: Date.now(),
      name: suggestion.activity,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
      isActive: true,
      isPaused: false,
      category: suggestion.category || "general",
      plannedDuration: suggestion.duration,
      context: answers,
    };

    console.log("▶️ ThingsToDo: Created new activity", {
      activity: newActivity,
    });

    const updatedActivities = [newActivity, ...activities];
    setActivities(updatedActivities);

    // Save to localStorage immediately before navigation
    console.log("💾 ThingsToDo: Saving to localStorage");
    saveToStorage("activities", updatedActivities);

    // Dispatch custom event to notify other components immediately
    console.log("📡 ThingsToDo: Dispatching activityUpdated event");
    window.dispatchEvent(new CustomEvent("activityUpdated"));

    // Navigate to home page with refresh parameter for immediate activity display
    console.log("🏠 ThingsToDo: Navigating to home with refresh parameter");
    navigate("/?refresh=activities");
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setAnswers({});
    setSuggestions([]);
    setHasStarted(false);
    setIsGenerating(false);
  };

  // Debug controls for development only
  const DebugControls = () => {
    if (process.env.NODE_ENV !== "development") return null;

    return (
      <div className="fixed bottom-20 right-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm z-50">
        <h4 className="text-red-400 text-sm font-semibold mb-2">
          Debug Controls
        </h4>
        <button
          onClick={clearActivities}
          className="px-3 py-1 bg-red-600/20 text-red-400 text-xs rounded border border-red-500/30 hover:bg-red-600/30 transition-colors"
        >
          Clear Activities
        </button>
      </div>
    );
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Landing page - show when user hasn't started questionnaire yet
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden pb-24">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-8 rounded-full glass flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-12 h-12 text-accent-blue" />
            </motion.div>

            <h1 className="text-4xl font-display font-bold text-accent-blue mb-6">
              Things to Do
            </h1>

            <p className="text-dark-text-secondary mb-8 leading-relaxed text-lg">
              Get personalized activity suggestions based on your current
              energy, mood, focus level, and available time.
            </p>

            <motion.button
              onClick={() => {
                setHasStarted(true);
                setCurrentStep(0);
                setAnswers({});
              }}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get My Recommendations
              <ChevronRight className="w-5 h-5 ml-2" />
            </motion.button>

            <div className="mt-8 text-sm text-dark-text-muted">
              Takes less than 30 seconds • Powered by AI
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Questions flow
  if (currentStep < questions.length) {
    const question = questions[currentStep];

    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <button
              onClick={goBack}
              className="p-2 text-dark-text-muted hover:text-dark-text transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="text-sm text-dark-text-muted">
              {currentStep + 1} of {questions.length}
            </div>

            <button
              onClick={resetFlow}
              className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-6 mb-8">
            <div className="w-full h-1 bg-dark-surface rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent-blue"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question content */}
          <div className="flex-1 flex flex-col justify-center px-6 pb-20">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-display font-bold text-dark-text mb-3">
                {question.title}
              </h2>
              <p className="text-dark-text-secondary">{question.subtitle}</p>
            </motion.div>

            <div className="space-y-4 max-w-sm mx-auto w-full">
              {question.options.map((option, index) => {
                const IconComponent = option.icon;

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className="w-full p-4 glass rounded-xl border border-white/10 hover:border-white/20 transition-all group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-${option.color}/20 flex items-center justify-center`}
                      >
                        <IconComponent
                          className={`w-6 h-6 text-${option.color}`}
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-dark-text group-hover:text-white transition-colors">
                          {option.label}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-text-muted ml-auto" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-accent-blue/30 border-t-accent-blue relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <motion.div
                className="absolute inset-2 rounded-full border border-accent-purple/40 border-r-accent-purple"
                animate={{ rotate: -360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <motion.h2
              className="text-2xl font-display font-semibold text-dark-text mb-3"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Crafting Your Perfect Activities
            </motion.h2>
            <p className="text-dark-text-secondary max-w-sm">
              Analyzing your energy, mood, and focus to suggest activities that
              fit perfectly...
            </p>

            <div className="mt-6 flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-accent-blue rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results page
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden pb-20">
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-display font-bold text-dark-text">
            Suggested Activities
          </h1>
          <button
            onClick={resetFlow}
            className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            Start Over
          </button>
        </div>

        {/* Context summary */}
        <div className="px-6 mb-6">
          <div className="glass rounded-xl p-5 border border-white/10">
            <div className="text-sm text-dark-text-muted mb-3">
              Based on your current state:
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                <span className="text-accent-blue font-medium">
                  {answers.energy} energy
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                <span className="text-accent-purple font-medium">
                  {answers.mood} mood
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                <span className="text-accent-green font-medium">
                  {answers.focus} focus
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
                <span className="text-accent-orange font-medium">
                  {answers.timeAvailable} min available
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions list */}
        <div className="px-6 space-y-4">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-5 h-5 text-accent-blue" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-dark-text mb-2 text-lg group-hover:text-white transition-colors">
                          {suggestion.activity}
                        </h3>
                        <p className="text-sm text-dark-text-secondary leading-relaxed">
                          {suggestion.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-xs">
                      <span className="flex items-center px-2 py-1 bg-accent-blue/20 text-accent-blue rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {suggestion.duration} min
                      </span>
                      <span className="px-2 py-1 bg-dark-surface/80 text-dark-text-muted rounded-full">
                        {suggestion.category}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => startActivity(suggestion)}
                    className="ml-4 flex items-center space-x-2 px-6 py-3 bg-accent-blue/90 hover:bg-accent-blue text-white rounded-xl font-medium border border-accent-blue/20 backdrop-blur-sm transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Play className="w-5 h-5" />
                    <span>Start</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Debug Controls */}
      <DebugControls />
    </div>
  );
};

export default ThingsToDo;

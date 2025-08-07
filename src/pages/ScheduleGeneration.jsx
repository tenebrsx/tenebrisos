import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  Battery,
  Zap,
  Brain,
  Target,
  Home,
  Sparkles,
  Check,
  X,
  Plus,
  Minus,
  PlayCircle,
  Edit3,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createOpenAIService } from "../services/openai.js";
import { useSettings } from "../contexts/SettingsContext";
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";
import MagneticButton from "../components/MagneticButton";
import LoadingSpinner from "../components/LoadingSpinner";
import clsx from "clsx";

const ScheduleGeneration = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState({});
  const [hasStarted, setHasStarted] = useState(false);
  const [customActivities, setCustomActivities] = useState([]);
  const [showScheduleResults, setShowScheduleResults] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [copyStatus, setCopyStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const animationStateRef = useRef({ hasAnimated: false, isAnimating: false });
  const mountedRef = useRef(false);

  const daysOfWeek = [
    { key: "monday", label: "Mon", full: "Monday" },
    { key: "tuesday", label: "Tue", full: "Tuesday" },
    { key: "wednesday", label: "Wed", full: "Wednesday" },
    { key: "thursday", label: "Thu", full: "Thursday" },
    { key: "friday", label: "Fri", full: "Friday" },
    { key: "saturday", label: "Sat", full: "Saturday" },
    { key: "sunday", label: "Sun", full: "Sunday" },
  ];

  // Component mount management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      animationStateRef.current = { hasAnimated: false, isAnimating: false };
    };
  }, []);

  const quickSuggestions = useMemo(
    () => [
      { text: "Move my workout to the morning", icon: "🏃‍♂️" },
      { text: "Add more break time", icon: "☕" },
      { text: "Make my evenings more relaxed", icon: "🌙" },
      { text: "Optimize for productivity", icon: "⚡" },
      { text: "Add time for hobbies", icon: "🎨" },
      { text: "Balance work and life better", icon: "⚖️" },
    ],
    [],
  );

  const questions = [
    {
      id: "wakeTime",
      title: "What time do you wake up?",
      subtitle: "This helps us plan your morning routine",
      type: "time",
      placeholder: "07:00",
    },
    {
      id: "bedTime",
      title: "What time do you go to bed?",
      subtitle: "We'll make sure your schedule winds down appropriately",
      type: "time",
      placeholder: "22:00",
    },
    {
      id: "energyPattern",
      title: "When do you feel most energetic?",
      subtitle: "We'll schedule important tasks during your peak hours",
      type: "option",
      options: [
        {
          value: "morning",
          label: "Morning Person",
          icon: Sunrise,
          color: "accent-orange",
          description: "I'm most productive in the morning",
        },
        {
          value: "afternoon",
          label: "Afternoon Peak",
          icon: Sun,
          color: "accent-yellow",
          description: "I hit my stride in the afternoon",
        },
        {
          value: "evening",
          label: "Night Owl",
          icon: Moon,
          color: "accent-purple",
          description: "I'm most focused in the evening",
        },
        {
          value: "balanced",
          label: "Consistent Energy",
          icon: Battery,
          color: "accent-green",
          description: "My energy stays steady all day",
        },
      ],
    },
    {
      id: "workingDays",
      title: "Which days do you want to schedule?",
      subtitle: "Select the days you want included in your schedule",
      type: "multiselect",
      options: [
        { value: "monday", label: "Monday", short: "Mon" },
        { value: "tuesday", label: "Tuesday", short: "Tue" },
        { value: "wednesday", label: "Wednesday", short: "Wed" },
        { value: "thursday", label: "Thursday", short: "Thu" },
        { value: "friday", label: "Friday", short: "Fri" },
        { value: "saturday", label: "Saturday", short: "Sat" },
        { value: "sunday", label: "Sunday", short: "Sun" },
      ],
    },
    {
      id: "dailyActivities",
      title: "What activities do you want to include?",
      subtitle: "Add the things you'd like to do regularly",
      type: "custom",
      component: "activities",
    },
    {
      id: "breakPreference",
      title: "How often would you like breaks?",
      subtitle: "Regular breaks help maintain focus and energy",
      type: "option",
      options: [
        {
          value: "frequent",
          label: "Frequent Breaks",
          icon: Coffee,
          color: "accent-green",
          description: "Short break every 30-45 minutes",
        },
        {
          value: "moderate",
          label: "Moderate Breaks",
          icon: Clock,
          color: "accent-blue",
          description: "Break every 60-90 minutes",
        },
        {
          value: "minimal",
          label: "Minimal Breaks",
          icon: Target,
          color: "accent-purple",
          description: "Longer breaks between major blocks",
        },
      ],
    },
    {
      id: "priorities",
      title: "What's most important to you?",
      subtitle: "We'll prioritize your schedule accordingly",
      type: "option",
      options: [
        {
          value: "productivity",
          label: "Maximum Productivity",
          icon: Zap,
          color: "accent-purple",
          description: "Focus on getting things done efficiently",
        },
        {
          value: "balance",
          label: "Work-Life Balance",
          icon: Target,
          color: "accent-blue",
          description: "Equal focus on work and personal time",
        },
        {
          value: "wellness",
          label: "Health & Wellness",
          icon: Brain,
          color: "accent-green",
          description: "Prioritize exercise, rest, and self-care",
        },
        {
          value: "flexibility",
          label: "Flexibility",
          icon: PlayCircle,
          color: "accent-orange",
          description: "Loose structure with room for spontaneity",
        },
      ],
    },
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      generateSchedule();
    }
  };

  const handleTimeInput = (questionId, time) => {
    setAnswers((prev) => ({ ...prev, [questionId]: time }));
  };

  const handleMultiSelect = (questionId, value) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [questionId]: updated };
    });
  };

  const addCustomActivity = () => {
    const activity = prompt("What activity would you like to add?");
    if (activity) {
      const duration = prompt("How many minutes does this usually take?", "60");
      const category = prompt(
        "What category is this? (work, fitness, learning, personal, rest)",
        "personal",
      );

      setCustomActivities((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: activity,
          duration: parseInt(duration) || 60,
          category: category || "personal",
        },
      ]);
    }
  };

  const removeCustomActivity = (id) => {
    setCustomActivities((prev) =>
      prev.filter((activity) => activity.id !== id),
    );
  };

  const generateSchedule = useCallback(async () => {
    setIsGenerating(true);
    setCurrentStep(questions.length);

    try {
      const apiKey = settings.ai?.apiKey;
      const openaiService = createOpenAIService(apiKey);

      const preferences = {
        startTime: answers.wakeTime || "07:00",
        endTime: answers.bedTime || "22:00",
        energyPattern: answers.energyPattern || "balanced",
        workingDays: answers.workingDays || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
        breakPreference: answers.breakPreference || "moderate",
        priorities: answers.priorities || "balance",
        activities: customActivities,
      };

      const result = await openaiService.generateSchedule(preferences);
      setGeneratedSchedule(result.schedule);
      setShowScheduleResults(true);

      // Batch state updates to prevent multiple re-renders
      const welcomeMessage = {
        id: Date.now(),
        role: "assistant",
        content:
          '🎉 Your personalized schedule is ready! I\'ve crafted it based on your preferences and energy patterns.\n\n💬 Now we can work together to make it perfect for you! Try saying things like:\n\n• "Move my workout to the morning"\n• "I need more break time"\n• "Make my evenings more relaxed"\n• "Add time for hobbies"\n• "Optimize for productivity"\n\nWhat would you like to adjust? I\'m here to help! ✨',
        timestamp: new Date(),
      };
      setChatMessages([welcomeMessage]);
    } catch (error) {
      console.error("Schedule generation failed:", error);
      alert(`Failed to generate schedule: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [answers, customActivities, settings.ai?.apiKey]);

  const resetFlow = () => {
    setCurrentStep(0);
    setAnswers({});
    setGeneratedSchedule({});
    setHasStarted(false);
    setIsGenerating(false);
    setCustomActivities([]);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToSchedule = () => {
    navigate("/schedule");
  };

  // Schedule Results Popup Helper Functions
  const acceptGeneratedSchedule = () => {
    saveToStorage("schedule", generatedSchedule);
    setShowScheduleResults(false);
    setCurrentStep(questions.length);
  };

  const rejectGeneratedSchedule = () => {
    setShowScheduleResults(false);
    setGeneratedSchedule({});
    setChatMessages([]);
    setChatInput("");
    setCurrentStep(questions.length - 1);
  };

  const updateGeneratedActivity = (day, activityId, updates) => {
    setGeneratedSchedule((prev) => ({
      ...prev,
      [day]:
        prev[day]?.map((activity) =>
          activity.id === activityId ? { ...activity, ...updates } : activity,
        ) || [],
    }));
  };

  const deleteGeneratedActivity = (day, activityId) => {
    setGeneratedSchedule((prev) => ({
      ...prev,
      [day]: prev[day]?.filter((activity) => activity.id !== activityId) || [],
    }));
  };

  const addGeneratedActivity = (day, time = "09:00") => {
    const newActivity = {
      id: `${day}_${Date.now()}`,
      activity: "New Activity",
      startTime: time,
      endTime: "10:00",
      duration: 60,
      category: "personal",
      priority: "medium",
      description: "",
      flexible: true,
    };

    setGeneratedSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), newActivity].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      ),
    }));
  };

  const handleChatSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!chatInput.trim() || isRefining) return;

      const userMessage = {
        id: Date.now(),
        role: "user",
        content: chatInput.trim(),
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setChatInput("");
      setIsRefining(true);

      // Add thinking message
      const thinkingMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Let me refine your schedule...",
        isThinking: true,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, thinkingMessage]);

      try {
        const apiKey = settings.ai?.apiKey;
        const openaiService = createOpenAIService(apiKey);

        const refinementRequest = {
          currentSchedule: generatedSchedule,
          userRequest: userMessage.content,
          conversationHistory: conversationHistory,
          preferences: {
            startTime: answers.wakeTime || "07:00",
            endTime: answers.bedTime || "22:00",
            energyPattern: answers.energyPattern || "balanced",
            workingDays: answers.workingDays || [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
            ],
            breakPreference: answers.breakPreference || "moderate",
            priorities: answers.priorities || "balance",
          },
        };

        const result = await openaiService.refineSchedule(refinementRequest);

        // Update conversation history
        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content: userMessage.content },
          {
            role: "assistant",
            content:
              result.explanation ||
              "I've updated your schedule based on your request!",
          },
        ]);

        // Remove thinking message and add response
        setChatMessages((prev) => {
          const withoutThinking = prev.filter((msg) => !msg.isThinking);
          return [
            ...withoutThinking,
            {
              id: Date.now() + 2,
              role: "assistant",
              content:
                result.explanation ||
                "I've updated your schedule based on your request!",
              timestamp: new Date(),
            },
          ];
        });

        // Update the generated schedule
        setGeneratedSchedule(result.schedule);
      } catch (error) {
        console.error("Schedule refinement failed:", error);

        // Remove thinking message and add error response
        const errorMessage = {
          id: Date.now() + 2,
          role: "assistant",
          content:
            "I'm having trouble with that request. Could you try rephrasing it or being more specific? For example: 'Move my workout to 7 AM' or 'Add a 30-minute lunch break'",
          timestamp: new Date(),
        };

        setChatMessages((prev) => {
          const withoutThinking = prev.filter((msg) => !msg.isThinking);
          return [...withoutThinking, errorMessage];
        });
      } finally {
        setIsRefining(false);
      }
    },
    [
      chatInput,
      isRefining,
      generatedSchedule,
      conversationHistory,
      answers,
      settings,
    ],
  );

  const handleQuickSuggestion = useCallback((suggestion) => {
    setChatInput(suggestion);
  }, []);

  const handleCopySchedule = useCallback(async () => {
    try {
      const scheduleText = Object.entries(generatedSchedule)
        .map(([day, activities]) => {
          const dayName = daysOfWeek.find((d) => d.key === day)?.full || day;
          const activitiesText = activities
            .map(
              (activity) =>
                `${activity.startTime} - ${activity.endTime}: ${activity.activity}`,
            )
            .join("\n  ");
          return `${dayName}:\n  ${activitiesText}`;
        })
        .join("\n\n");

      await navigator.clipboard.writeText(scheduleText);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (error) {
      console.error("Failed to copy schedule:", error);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus(null), 2000);
    }
  }, [generatedSchedule, daysOfWeek]);

  const handleExportSchedule = useCallback(() => {
    try {
      const scheduleData = {
        generatedAt: new Date().toISOString(),
        preferences: {
          startTime: answers.wakeTime || "07:00",
          endTime: answers.bedTime || "22:00",
          energyPattern: answers.energyPattern || "balanced",
          workingDays: answers.workingDays || [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
          ],
          breakPreference: answers.breakPreference || "moderate",
          priorities: answers.priorities || "balance",
        },
        schedule: generatedSchedule,
        conversationHistory: conversationHistory,
      };

      const dataStr = JSON.stringify(scheduleData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tenebris-schedule-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus("exported");
      setTimeout(() => setExportStatus(null), 2000);
    } catch (error) {
      console.error("Failed to export schedule:", error);
      setExportStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }, [generatedSchedule, daysOfWeek]);

  const handleUseSchedule = useCallback(() => {
    try {
      // Save the generated schedule to localStorage
      saveToStorage("schedule", generatedSchedule);

      // Also save the preferences used
      saveToStorage("schedule-preferences", {
        startTime: answers.wakeTime || "07:00",
        endTime: answers.bedTime || "22:00",
        energyPattern: answers.energyPattern || "balanced",
        workingDays: answers.workingDays || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
        ],
        breakPreference: answers.breakPreference || "moderate",
        priorities: answers.priorities || "balance",
        generatedAt: new Date().toISOString(),
      });

      setSaveStatus("saved");

      // Navigate to schedule page after a brief delay
      setTimeout(() => {
        navigate("/schedule");
      }, 1500);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  }, [generatedSchedule, answers, navigate]);

  const categoryColors = {
    fitness: "accent-green",
    work: "accent-purple",
    learning: "accent-blue",
    rest: "accent-orange",
    personal: "accent-red",
  };

  // Animation state manager to prevent double animations
  const getAnimationProps = useCallback((baseProps) => {
    if (animationStateRef.current.isAnimating || !mountedRef.current) {
      return {
        initial: baseProps.animate || { opacity: 1 },
        animate: baseProps.animate || { opacity: 1 },
        transition: { duration: 0 },
      };
    }

    if (!animationStateRef.current.hasAnimated) {
      animationStateRef.current.hasAnimated = true;
      animationStateRef.current.isAnimating = true;
      setTimeout(() => {
        if (mountedRef.current) {
          animationStateRef.current.isAnimating = false;
        }
      }, 300);
    }

    return baseProps;
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const [selectedDay, setSelectedDay] = useState("monday");

  // Welcome screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-6">
          <motion.div
            className="max-w-2xl mx-auto space-y-8"
            {...getAnimationProps({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.2 },
            })}
          >
            <div className="space-y-4">
              <motion.div
                className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Calendar size={48} className="text-white" />
              </motion.div>

              <h1 className="text-3xl font-display font-bold text-gradient-blue">
                Create Your Perfect Schedule
              </h1>

              <p className="text-dark-text-secondary leading-relaxed">
                Let's build a personalized schedule that fits your lifestyle,
                energy patterns, and goals. This will take just a few minutes.
              </p>
            </div>

            <div className="space-y-4">
              <MagneticButton
                variant="primary"
                onClick={() => {
                  setHasStarted(true);
                  setCurrentStep(0);
                  setAnswers({});
                }}
                className="w-full py-4"
              >
                <Sparkles size={20} />
                <span>Get Started</span>
              </MagneticButton>

              <MagneticButton
                variant="ghost"
                onClick={() => navigate("/schedule")}
                className="w-full"
              >
                <Home size={16} />
                <span>Back to Schedule</span>
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-6">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <LoadingSpinner size="lg" variant="orbital" />
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-dark-text">
                Creating Your Schedule
              </h2>
              <p className="text-dark-text-muted">
                AI is analyzing your preferences and crafting the perfect
                schedule...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Success screen
  if (currentStep >= questions.length && !isGenerating) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center px-6">
          <motion.div
            className="text-center space-y-8 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Check size={48} className="text-white" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl font-display font-bold text-gradient-green">
                Schedule Created!
              </h1>
              <p className="text-dark-text-secondary">
                Your personalized schedule has been generated and saved. You can
                now view and customize it further.
              </p>
            </div>

            <div className="space-y-3">
              <MagneticButton
                variant="primary"
                onClick={goToSchedule}
                className="w-full py-4"
              >
                <Calendar size={20} />
                <span>View My Schedule</span>
              </MagneticButton>

              <MagneticButton
                variant="ghost"
                onClick={resetFlow}
                className="w-full"
              >
                <PlayCircle size={16} />
                <span>Create Another Schedule</span>
              </MagneticButton>
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
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-6">
            <MagneticButton
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 0}
              className="opacity-70 hover:opacity-100"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </MagneticButton>

            <div className="text-sm text-dark-text-muted">
              {currentStep + 1} of {questions.length}
            </div>

            <MagneticButton
              variant="ghost"
              onClick={() => navigate("/schedule")}
              className="opacity-70 hover:opacity-100"
            >
              <X size={20} />
            </MagneticButton>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-6">
            <div className="w-full h-1 bg-dark-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <motion.div
              key={currentStep}
              {...getAnimationProps({
                initial: { opacity: 0, x: 10 },
                animate: { opacity: 1, x: 0 },
                exit: { opacity: 0, x: -10 },
                transition: { duration: 0.2 },
              })}
              className="space-y-6"
            >
              {/* Question header */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-display font-bold text-dark-text">
                  {question.title}
                </h2>
                <p className="text-dark-text-secondary">{question.subtitle}</p>
              </div>

              {/* Question content */}
              <div className="space-y-4">
                {question.type === "time" && (
                  <div className="space-y-4">
                    <input
                      type="time"
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        handleTimeInput(question.id, e.target.value)
                      }
                      className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-dark-text text-center text-lg focus:outline-none focus:border-accent-purple/50"
                      placeholder={question.placeholder}
                    />
                    <MagneticButton
                      variant="primary"
                      onClick={() =>
                        handleAnswer(question.id, answers[question.id])
                      }
                      disabled={!answers[question.id]}
                      className="w-full py-3"
                    >
                      <ChevronRight size={20} />
                      <span>Continue</span>
                    </MagneticButton>
                  </div>
                )}

                {question.type === "option" && (
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => handleAnswer(question.id, option.value)}
                        className="w-full p-4 bg-dark-surface border border-dark-border rounded-lg text-left hover:border-accent-purple/50 transition-colors group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 bg-${option.color}/20 rounded-lg flex items-center justify-center group-hover:bg-${option.color}/30 transition-colors`}
                          >
                            <option.icon
                              size={24}
                              className={`text-${option.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-dark-text">
                              {option.label}
                            </h3>
                            <p className="text-sm text-dark-text-muted">
                              {option.description}
                            </p>
                          </div>
                          <ChevronRight
                            size={20}
                            className="text-dark-text-muted group-hover:text-accent-purple transition-colors"
                          />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {question.type === "multiselect" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {question.options.map((option) => {
                        const isSelected = (
                          answers[question.id] || []
                        ).includes(option.value);
                        return (
                          <motion.button
                            key={option.value}
                            onClick={() =>
                              handleMultiSelect(question.id, option.value)
                            }
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              isSelected
                                ? "bg-accent-purple/20 border-accent-purple text-accent-purple"
                                : "bg-dark-surface border-dark-border text-dark-text hover:border-accent-purple/50"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="font-medium">{option.short}</div>
                            <div className="text-xs opacity-70">
                              {option.label}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    <MagneticButton
                      variant="primary"
                      onClick={() =>
                        handleAnswer(question.id, answers[question.id])
                      }
                      disabled={!answers[question.id]?.length}
                      className="w-full py-3"
                    >
                      <ChevronRight size={20} />
                      <span>Continue</span>
                    </MagneticButton>
                  </div>
                )}

                {question.type === "custom" &&
                  question.component === "activities" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {customActivities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-3 bg-dark-surface border border-dark-border rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-dark-text">
                                {activity.name}
                              </div>
                              <div className="text-sm text-dark-text-muted">
                                {activity.duration} min • {activity.category}
                              </div>
                            </div>
                            <button
                              onClick={() => removeCustomActivity(activity.id)}
                              className="p-2 text-dark-text-muted hover:text-accent-red transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <MagneticButton
                        variant="ghost"
                        onClick={addCustomActivity}
                        className="w-full py-3 border-dashed border-2"
                      >
                        <Plus size={16} />
                        <span>Add Activity</span>
                      </MagneticButton>

                      <MagneticButton
                        variant="primary"
                        onClick={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: customActivities,
                          }));
                          if (currentStep < questions.length - 1) {
                            setCurrentStep(currentStep + 1);
                          } else {
                            generateSchedule();
                          }
                        }}
                        className="w-full py-3"
                      >
                        <ChevronRight size={20} />
                        <span>Continue</span>
                      </MagneticButton>
                    </div>
                  )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Schedule Results Modal
  if (showScheduleResults) {
    return (
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="z-10 fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            className="glass rounded-2xl w-full max-w-6xl h-[90vh] flex"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Schedule Preview Section */}
            <div className="flex-1 p-6 border-r border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Sparkles className="text-accent-purple" size={24} />
                  <h3 className="text-xl font-display">Generated Schedule</h3>
                </div>
                <div className="flex space-x-2">
                  <MagneticButton
                    variant="ghost"
                    onClick={rejectGeneratedSchedule}
                    className="text-accent-red hover:bg-accent-red/10"
                  >
                    <X size={16} />
                    Discard
                  </MagneticButton>
                  <MagneticButton
                    variant="primary"
                    onClick={acceptGeneratedSchedule}
                  >
                    <Check size={16} />
                    Accept Schedule
                  </MagneticButton>
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex space-x-1 mb-4 overflow-x-auto">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDay(day.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedDay === day.key
                        ? "bg-accent-purple/20 text-accent-purple"
                        : "text-dark-text-muted hover:text-dark-text-secondary hover:bg-dark-surface/50"
                    }`}
                  >
                    {day.full}
                  </button>
                ))}
              </div>

              {/* Activities for Selected Day */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {generatedSchedule[selectedDay]?.length > 0 ? (
                  generatedSchedule[selectedDay].map((activity) => (
                    <motion.div
                      key={activity.id}
                      className="card p-4 hover:border-accent-purple/30 transition-colors"
                      layout
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm text-dark-text-muted">
                              {formatTime(activity.startTime)} -{" "}
                              {formatTime(activity.endTime)}
                            </div>
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium bg-${categoryColors[activity.category]}/20 text-${categoryColors[activity.category]}`}
                            >
                              {activity.category}
                            </div>
                          </div>
                          <h4 className="font-medium text-dark-text mt-1">
                            {activity.activity}
                          </h4>
                          {activity.description && (
                            <p className="text-sm text-dark-text-muted mt-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newActivity = prompt(
                                "Activity name:",
                                activity.activity,
                              );
                              if (newActivity) {
                                updateGeneratedActivity(
                                  selectedDay,
                                  activity.id,
                                  { activity: newActivity },
                                );
                              }
                            }}
                            className="p-2 text-dark-text-muted hover:text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              deleteGeneratedActivity(selectedDay, activity.id)
                            }
                            className="p-2 text-dark-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-dark-text-muted">
                    <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No activities scheduled for this day</p>
                  </div>
                )}
              </div>

              <MagneticButton
                variant="ghost"
                onClick={() => addGeneratedActivity(selectedDay)}
                className="w-full mt-4 border-dashed border-2 border-dark-border hover:border-accent-purple/50"
              >
                <Plus size={16} />
                Add Custom Activity
              </MagneticButton>
            </div>

            {/* AI Chat Section */}
            <div className="w-96 p-6 flex flex-col">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="text-accent-blue" size={20} />
                <h4 className="font-display text-lg">Refine Schedule</h4>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 space-y-3 mb-4 overflow-y-auto max-h-[50vh]">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`p-3 rounded-lg max-w-[90%] ${
                      message.role === "user"
                        ? "bg-accent-purple/20 text-dark-text ml-auto"
                        : "bg-dark-surface text-dark-text-secondary"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.isThinking ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="xs" variant="dots" />
                        <span className="text-sm">{message.content}</span>
                      </div>
                    ) : (
                      <div className="text-sm space-y-2">
                        {useMemo(
                          () =>
                            message.content.split("\n").map((line, index) => {
                              if (line.trim() === "")
                                return <div key={index} className="h-1"></div>;

                              // Handle bullet points
                              if (line.startsWith("•")) {
                                return (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-2"
                                  >
                                    <span className="text-accent-blue mt-0.5">
                                      •
                                    </span>
                                    <span className="flex-1">
                                      {line.substring(1).trim()}
                                    </span>
                                  </div>
                                );
                              }

                              // Handle regular lines
                              return (
                                <p
                                  key={index}
                                  className={
                                    line.includes("🎉") || line.includes("💬")
                                      ? "font-medium"
                                      : ""
                                  }
                                >
                                  {line}
                                </p>
                              );
                            }),
                          [message.content],
                        )}
                      </div>
                    )}
                    <div className="text-xs text-dark-text-muted mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tell me how to improve your schedule... I'm here to help make it perfect for you!"
                    className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 text-sm resize-none"
                    rows={3}
                    disabled={isRefining}
                    onKeyDown={useCallback(
                      (e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          if (chatInput.trim() && !isRefining) {
                            handleChatSubmit(e);
                          }
                        }
                      },
                      [chatInput, isRefining, handleChatSubmit],
                    )}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-dark-text-muted">
                    {isRefining ? "Thinking..." : "⌘+Enter to send"}
                  </div>
                </div>

                {/* Quick Suggestions */}
                {chatMessages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickSuggestions.map((suggestion, index) => (
                      <MagneticButton
                        key={index}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickSuggestion(suggestion.text)}
                        className="text-xs bg-dark-surface/50 hover:bg-dark-surface border border-dark-border/50 hover:border-accent-blue/30"
                        disabled={isRefining}
                      >
                        <span className="mr-1">{suggestion.icon}</span>
                        {suggestion.text}
                      </MagneticButton>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <MagneticButton
                    type="submit"
                    variant="primary"
                    disabled={!chatInput.trim() || isRefining}
                    className="flex-1"
                  >
                    {isRefining ? (
                      <LoadingSpinner size="xs" variant="dots" />
                    ) : (
                      <Brain size={16} />
                    )}
                    <span>
                      {isRefining ? "Thinking..." : "Improve Schedule"}
                    </span>
                  </MagneticButton>

                  <MagneticButton
                    type="button"
                    variant="accent"
                    onClick={handleUseSchedule}
                    className="flex-1"
                    disabled={isRefining || saveStatus === "saved"}
                  >
                    {saveStatus === "saved" ? (
                      <Check size={16} className="text-white" />
                    ) : saveStatus === "error" ? (
                      <X size={16} />
                    ) : (
                      <Calendar size={16} />
                    )}
                    <span>
                      {saveStatus === "saved"
                        ? "Saved! Redirecting..."
                        : saveStatus === "error"
                          ? "Error Saving"
                          : "Use This Schedule"}
                    </span>
                  </MagneticButton>

                  <MagneticButton
                    type="button"
                    variant="secondary"
                    onClick={handleCopySchedule}
                    className="px-3"
                    title="Copy schedule to clipboard"
                    disabled={isRefining}
                  >
                    {copyStatus === "copied" ? (
                      <Check size={16} className="text-accent-green" />
                    ) : copyStatus === "error" ? (
                      <X size={16} className="text-accent-red" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </MagneticButton>

                  <MagneticButton
                    type="button"
                    variant="secondary"
                    onClick={handleExportSchedule}
                    className="px-3"
                    title="Export schedule as JSON"
                    disabled={isRefining}
                  >
                    {exportStatus === "exported" ? (
                      <Check size={16} className="text-accent-green" />
                    ) : exportStatus === "error" ? (
                      <X size={16} className="text-accent-red" />
                    ) : (
                      <Save size={16} />
                    )}
                  </MagneticButton>

                  {chatMessages.length > 1 && (
                    <MagneticButton
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        // Keep welcome message, clear the rest
                        const welcomeMessage = chatMessages.find(
                          (msg) =>
                            msg.role === "assistant" &&
                            msg.content.includes("🎉"),
                        );
                        setChatMessages(welcomeMessage ? [welcomeMessage] : []);
                        setConversationHistory([]);
                      }}
                      className="px-3"
                      title="Clear conversation"
                    >
                      <X size={16} />
                    </MagneticButton>
                  )}
                </div>
              </form>

              <div className="text-xs text-dark-text-muted mt-3 space-y-1">
                <div className="text-center">
                  💡 <strong>Try saying:</strong> "Make mornings lighter" • "Add
                  workout at 6 AM" • "More break time please"
                </div>
                <div className="text-center">
                  🎯 <strong>Be creative:</strong> "I need more me-time" •
                  "Optimize for productivity" • "Balance work and life"
                </div>
                <div className="text-center mt-2 pt-2 border-t border-dark-border/30">
                  📋 <strong>Actions:</strong> Use schedule in app • Copy to
                  clipboard • Export as JSON
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default ScheduleGeneration;

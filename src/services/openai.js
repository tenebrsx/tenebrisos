// OpenAI Service for Intelligent Schedule Generation with AI Learning
import { createAILearningEngine } from "./aiLearningEngine.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

class OpenAIService {
  constructor(apiKey = DEFAULT_API_KEY) {
    this.apiKey = apiKey || DEFAULT_API_KEY;
    this.defaultModel = "gpt-4";
    this.isValid = !!(this.apiKey && this.apiKey.startsWith("sk-"));
    this.learningEngine = createAILearningEngine();

    console.log("🤖 OpenAI Service: Initialized with AI Learning Engine", {
      hasValidKey: this.isValid,
      confidence: this.learningEngine.userProfile.confidenceLevel,
    });
  }

  async generateSchedule(preferences) {
    const {
      activities,
      startTime = "06:00",
      endTime = "22:00",
      workingDays = ["monday", "tuesday", "wednesday", "thursday", "friday"],
      sleepHours = 8,
      preferences: userPrefs = {},
      constraints = [],
    } = preferences;

    const prompt = this.buildSchedulePrompt(activities, {
      startTime,
      endTime,
      workingDays,
      sleepHours,
      userPrefs,
      constraints,
    });

    // Return fallback schedule if no valid API key
    if (!this.isValid) {
      return this.getFallbackSchedule();
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert productivity coach and schedule optimizer. Generate realistic, balanced schedules that prioritize user well-being and sustainable productivity. Always return valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const scheduleText = data.choices[0]?.message?.content;

      if (!scheduleText) {
        throw new Error("No schedule generated");
      }

      return this.parseScheduleResponse(scheduleText);
    } catch (error) {
      console.error("Error generating schedule:", error);
      return this.getFallbackSchedule();
    }
  }

  buildSchedulePrompt(activities, options) {
    const {
      startTime,
      endTime,
      workingDays,
      sleepHours,
      userPrefs,
      constraints,
    } = options;

    const activitiesText = activities
      .map(
        (activity) =>
          `- ${activity.name}: ${activity.duration || "flexible duration"} (${activity.category || "general"}) - ${activity.priority || "normal"} priority`,
      )
      .join("\n");

    const constraintsText =
      constraints.length > 0
        ? `\nConstraints:\n${constraints.map((c) => `- ${c}`).join("\n")}`
        : "";

    return `
Generate a weekly schedule for someone with the following activities and preferences:

ACTIVITIES:
${activitiesText}

SCHEDULE PARAMETERS:
- Daily active hours: ${startTime} to ${endTime}
- Working days: ${workingDays.join(", ")}
- Sleep requirement: ${sleepHours} hours per night
- Energy level preference: ${userPrefs.energyLevel || "balanced"}
- Focus time preference: ${userPrefs.focusTime || "morning"}
- Exercise preference: ${userPrefs.exerciseTime || "morning"}
- Break frequency: ${userPrefs.breakFrequency || "every 90 minutes"}
${constraintsText}

Please generate a detailed weekly schedule that:
1. Balances work, exercise, learning, and rest
2. Considers energy levels throughout the day
3. Includes appropriate breaks
4. Follows productivity best practices
5. Is realistic and sustainable

Return the response as a JSON object with this exact structure:
{
  "schedule": {
    "monday": [
      {
        "id": "unique_id",
        "activity": "activity_name",
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "duration": 60,
        "category": "fitness|work|learning|rest|personal",
        "priority": "high|medium|low",
        "description": "brief description",
        "flexible": true|false
      }
    ],
    "tuesday": [...],
    // ... other days
  },
  "insights": {
    "totalWorkHours": 40,
    "totalExerciseHours": 5,
    "balanceScore": 85,
    "suggestions": ["suggestion 1", "suggestion 2"]
  }
}

Ensure all time slots don't overlap and the schedule is realistic.
`;
  }

  parseScheduleResponse(responseText) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const schedule = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!schedule.schedule) {
        throw new Error("Invalid schedule structure");
      }

      // Add unique IDs if missing
      Object.keys(schedule.schedule).forEach((day) => {
        schedule.schedule[day].forEach((activity, index) => {
          if (!activity.id) {
            activity.id = `${day}_${index}_${Date.now()}`;
          }
        });
      });

      return schedule;
    } catch (error) {
      console.error("Error parsing schedule:", error);
      throw new Error("Failed to parse generated schedule");
    }
  }

  async optimizeSchedule(currentSchedule, feedback) {
    const prompt = `
The user has provided feedback on their current schedule. Please optimize it based on their input:

CURRENT SCHEDULE:
${JSON.stringify(currentSchedule, null, 2)}

USER FEEDBACK:
${feedback}

Please provide an optimized version of the schedule that addresses the user's concerns while maintaining balance and productivity. Return the same JSON structure as before.
`;

    // Return current schedule if no valid API key
    if (!this.isValid) {
      return currentSchedule;
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert schedule optimizer. Analyze user feedback and improve schedules while maintaining realistic expectations and work-life balance.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      const optimizedText = data.choices[0]?.message?.content;

      return this.parseScheduleResponse(optimizedText);
    } catch (error) {
      console.error("Error optimizing schedule:", error);
      return currentSchedule;
    }
  }

  async generateActivitySuggestions(
    currentActivity,
    availableTime,
    userContext = {},
  ) {
    // Get intelligent user insights
    const userInsights = this.learningEngine.getUserInsights();
    const userState = this.learningEngine.getCurrentUserState();

    // Generate base suggestions using AI learning
    const intelligentSuggestions =
      this.learningEngine.getIntelligentSuggestions({
        ...userContext,
        availableTime,
        currentActivity,
      });

    const contextInfo = `
USER PROFILE & INTELLIGENCE:
- Confidence Level: ${(userInsights.confidence * 100).toFixed(1)}% (${userInsights.confidence > 0.7 ? "High" : userInsights.confidence > 0.4 ? "Medium" : "Learning"})
- Personality: ${userInsights.traits.workStyle} work style, ${userInsights.traits.energyType} energy type
- Current Energy: ${userState.estimatedEnergy} (estimated)
- Current Context: ${userState.context}
- Favorite Categories: ${
      Object.entries(userInsights.profile.categoryAffinities || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat, score]) => `${cat} (${(score * 100).toFixed(0)}%)`)
        .join(", ") || "Still learning preferences"
    }

CURRENT SITUATION:
- Time: ${userContext.currentTime || "Now"}
- Day: ${userContext.dayOfWeek || "Today"}
- Available Time: ${availableTime} minutes
- Scheduled Activity: ${userContext.scheduledActivity || currentActivity}
- Recent Activities: ${userInsights.profile.interests ? Object.keys(userInsights.profile.interests).slice(0, 5).join(", ") : "Still learning"}

AI INSIGHTS:
${userInsights.insights.map((insight) => `- ${insight.title}: ${insight.message}`).join("\n")}

INTELLIGENT PRE-SUGGESTIONS:
${intelligentSuggestions
  .slice(0, 3)
  .map(
    (s) =>
      `- ${s.activity} (${s.duration}min, ${s.category}) - Score: ${(s.relevanceScore * 100).toFixed(0)}%`,
  )
  .join("\n")}
`;

    const prompt = `
You are Tenebris AI - an advanced productivity companion that knows the user better than they know themselves.

The user was supposed to do "${currentActivity}" but wants to do something else.
${contextInfo}

CRITICAL INSTRUCTIONS:
1. You have access to detailed user profiling data above - USE IT EXTENSIVELY
2. The user has a ${(userInsights.confidence * 100).toFixed(1)}% confidence profile - tailor your suggestions accordingly
3. Consider their personality traits, energy patterns, and proven preferences
4. Be highly personalized - this isn't generic advice, this is FOR THIS SPECIFIC USER
5. Reference their patterns when explaining why each suggestion fits them

Generate 4-6 HIGHLY PERSONALIZED alternative activities that:
- Perfectly match their ${userInsights.traits.workStyle} work style and ${userInsights.traits.energyType} energy type
- Align with their proven category preferences and completion patterns
- Fit their current estimated energy level (${userState.estimatedEnergy})
- Are appropriate for their current context (${userState.context})
- Consider their recent activity patterns and variety needs
- Match the ${availableTime} minute time constraint
- Are different from "${currentActivity}" but equally valuable

Return as JSON:
{
  "suggestions": [
    {
      "activity": "specific personalized activity name",
      "duration": 30,
      "category": "category",
      "reason": "personalized explanation referencing their specific patterns/preferences",
      "energyLevel": "high|medium|low",
      "personalFit": 0.85,
      "confidence": "why this is perfect for THIS user specifically"
    }
  ],
  "aiInsight": "Brief insight about what this choice pattern reveals about the user"
}
`;

    // Return fallback suggestions if no valid API key
    if (!this.isValid) {
      return this.getFallbackSuggestions();
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content:
                "You are a productivity assistant. Suggest meaningful alternative activities based on available time and context.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 800,
        }),
      });

      const data = await response.json();
      const suggestionsText = data.choices[0]?.message?.content;

      const jsonMatch = suggestionsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("No valid suggestions generated");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      return this.getFallbackSuggestions(availableTime);
    }
  }

  // Generate truly intelligent schedule based on user learning
  async generateIntelligentSchedule(preferences = {}) {
    const userInsights = this.learningEngine.getUserInsights();
    const predictions = this.learningEngine.predictUserNeeds();

    const enhancedPreferences = {
      ...preferences,
      userProfile: userInsights.profile,
      personalityTraits: userInsights.traits,
      patterns: userInsights.patterns,
      predictions: predictions,
      confidence: userInsights.confidence,
    };

    const prompt = `
You are Tenebris AI creating a HIGHLY PERSONALIZED weekly schedule for a user you know intimately.

USER INTELLIGENCE PROFILE:
- Confidence Level: ${(userInsights.confidence * 100).toFixed(1)}% (${userInsights.confidence > 0.7 ? "Deep Understanding" : "Moderate Understanding"})
- Work Style: ${userInsights.traits.workStyle}
- Energy Type: ${userInsights.traits.energyType}
- Decision Making: ${userInsights.traits.decisionMaking}
- Planning Horizon: ${userInsights.traits.planningHorizon}
- Consistency Preference: ${userInsights.traits.consistencyPreference}

PROVEN PATTERNS:
- Favorite Categories: ${Object.entries(
      userInsights.profile.categoryAffinities || {},
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, score]) => `${cat} (${(score * 100).toFixed(0)}% preference)`)
      .join(", ")}
- Optimal Duration: ${predictions.optimalDuration} minutes
- Best Time Patterns: ${JSON.stringify(userInsights.patterns.timePreferences || {})}

AI INSIGHTS:
${userInsights.insights.map((insight) => `- ${insight.title}: ${insight.message} (${(insight.confidence * 100).toFixed(0)}% confidence)`).join("\n")}

SCHEDULE REQUIREMENTS:
- Start Time: ${preferences.startTime || "06:00"}
- End Time: ${preferences.endTime || "22:00"}
- Working Days: ${JSON.stringify(preferences.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"])}
- Preferred Activities: ${JSON.stringify(preferences.activities || [])}

CRITICAL INSTRUCTIONS:
1. This schedule should feel like it was made by someone who knows them intimately
2. Use their proven patterns and preferences extensively
3. Respect their ${userInsights.traits.consistencyPreference} consistency preference
4. Align with their ${userInsights.traits.energyType} energy type
5. Include activities they've shown high completion rates for
6. Balance their favorite categories appropriately
7. Use their optimal duration patterns (around ${predictions.optimalDuration} min per session)

Create a schedule that makes them think "How did it know exactly what I needed?"

Return as JSON with the standard schedule format, but add personalization explanations for each day.
`;

    return this.generateSchedule(enhancedPreferences, prompt);
  }

  // Enhanced method for contextual activity suggestions
  async getContextualSuggestions(context = {}) {
    const userState = this.learningEngine.getCurrentUserState();
    const suggestions = this.learningEngine.getIntelligentSuggestions(context);

    if (!this.isValid) {
      return {
        suggestions: suggestions.slice(0, 5),
        confidence: this.learningEngine.userProfile.confidenceLevel,
        insights: this.learningEngine.generatePersonalInsights(),
      };
    }

    const prompt = `
Based on the current context and deep user knowledge, what should they do right now?

CURRENT STATE:
- Time: ${userState.timeOfDay}:00
- Context: ${userState.context}
- Energy: ${userState.estimatedEnergy}
- Available Time: ${context.availableTime || 60} minutes

USER INTELLIGENCE: [Use the same detailed profiling as above]

Suggest 3-5 perfect activities for RIGHT NOW, considering their current state and patterns.
`;

    try {
      return await this.generateActivitySuggestions(
        "current context",
        context.availableTime || 60,
        context,
      );
    } catch (error) {
      return {
        suggestions: suggestions.slice(0, 5),
        confidence: this.learningEngine.userProfile.confidenceLevel,
        fallbackUsed: true,
      };
    }
  }

  // Method to learn from user interactions
  recordUserChoice(suggestion, action, context = {}) {
    this.learningEngine.learnFromSuggestionInteraction(
      suggestion,
      action,
      context,
    );
    console.log("🧠 AI Learning: Recorded user choice", {
      suggestion: suggestion.activity,
      action,
    });
  }

  // Method to get user insights
  getUserIntelligence() {
    return this.learningEngine.getUserInsights();
  }

  // Method to get intelligent fallback suggestions
  getFallbackSuggestions(availableTime = 30) {
    const intelligentSuggestions =
      this.learningEngine.getIntelligentSuggestions({ availableTime });

    return {
      suggestions: intelligentSuggestions.slice(0, 4),
      confidence: this.learningEngine.userProfile.confidenceLevel,
      aiInsight: "Personalized suggestions based on your patterns",
    };
  }
  getFallbackSchedule() {
    return {
      schedule: {
        monday: [
          {
            id: "fallback_1",
            activity: "Morning Focus",
            startTime: "09:00",
            endTime: "11:00",
            duration: 120,
            category: "work",
            priority: "high",
            description: "Deep work session",
            flexible: false,
          },
        ],
        tuesday: [
          {
            id: "fallback_2",
            activity: "Learning Time",
            startTime: "10:00",
            endTime: "11:30",
            duration: 90,
            category: "learning",
            priority: "medium",
            description: "Skill development",
            flexible: true,
          },
        ],
        wednesday: [
          {
            id: "fallback_3",
            activity: "Exercise",
            startTime: "07:00",
            endTime: "08:00",
            duration: 60,
            category: "fitness",
            priority: "high",
            description: "Morning workout",
            flexible: false,
          },
        ],
        thursday: [
          {
            id: "fallback_4",
            activity: "Project Work",
            startTime: "14:00",
            endTime: "16:00",
            duration: 120,
            category: "work",
            priority: "medium",
            description: "Creative work",
            flexible: true,
          },
        ],
        friday: [
          {
            id: "fallback_5",
            activity: "Review & Planning",
            startTime: "16:00",
            endTime: "17:00",
            duration: 60,
            category: "personal",
            priority: "medium",
            description: "Week review",
            flexible: true,
          },
        ],
        saturday: [
          {
            id: "fallback_6",
            activity: "Personal Time",
            startTime: "10:00",
            endTime: "12:00",
            duration: 120,
            category: "personal",
            priority: "low",
            description: "Free time",
            flexible: true,
          },
        ],
        sunday: [
          {
            id: "fallback_7",
            activity: "Rest & Recharge",
            startTime: "11:00",
            endTime: "12:00",
            duration: 60,
            category: "rest",
            priority: "high",
            description: "Relaxation",
            flexible: false,
          },
        ],
      },
      insights: {
        totalWorkHours: 20,
        totalExerciseHours: 3,
        balanceScore: 75,
        suggestions: [
          "Consider adding more break time",
          "Schedule regular exercise",
          "Plan social activities",
        ],
      },
    };
  }

  async generatePersonalizedSuggestions(context) {
    const { energy, mood, focus, timeAvailable, timeOfDay } = context;

    const prompt = `Generate personalized activity suggestions based on the user's current state:

CURRENT CONTEXT:
- Energy Level: ${energy} (low/medium/high)
- Mood: ${mood} (stressed/neutral/happy/motivated)
- Focus Level: ${focus} (scattered/okay/focused)
- Available Time: ${timeAvailable} minutes
- Time of Day: ${timeOfDay} (morning/afternoon/evening)

Please generate 5-7 specific, actionable activities that:
1. Match the user's energy level (low energy = gentle activities, high energy = active tasks)
2. Complement their mood (stressed = calming activities, motivated = challenging tasks)
3. Align with their focus level (scattered = simple tasks, focused = complex work)
4. Fit within the time constraint
5. Are appropriate for the time of day

Return as JSON:
{
  "suggestions": [
    {
      "activity": "specific activity name",
      "duration": 25,
      "category": "fitness|work|learning|wellness|creative|personal|social",
      "reason": "why this activity matches their current state",
      "energyMatch": "explanation of energy alignment",
      "priority": "high|medium|low"
    }
  ]
}

Make activities specific and engaging, not generic. Consider the user's complete context.`;

    // Return fallback suggestions if no valid API key
    if (!this.isValid) {
      return this.getContextualFallbackSuggestions(context);
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            {
              role: "system",
              content:
                "You are an expert wellness and productivity coach. Generate personalized activity recommendations that consider the user's complete mental and physical state. Prioritize activities that will genuinely improve their current situation.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const suggestionsText = data.choices[0]?.message?.content;

      const jsonMatch = suggestionsText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result;
      }

      throw new Error("No valid suggestions generated");
    } catch (error) {
      console.error("Error generating personalized suggestions:", error);
      return this.getContextualFallbackSuggestions(context);
    }
  }

  getContextualFallbackSuggestions(context) {
    const { energy, mood, focus, timeAvailable, timeOfDay } = context;
    const timeLimit = parseInt(timeAvailable);
    let suggestions = [];

    // Energy-based suggestions
    if (energy === "high") {
      suggestions.push(
        {
          activity: "High-intensity workout",
          duration: Math.min(30, timeLimit),
          category: "fitness",
          reason: "Channel your high energy productively",
          priority: "high",
        },
        {
          activity: "Tackle challenging project",
          duration: Math.min(45, timeLimit),
          category: "work",
          reason: "High energy is perfect for difficult tasks",
          priority: "high",
        },
        {
          activity: "Organize and declutter space",
          duration: Math.min(25, timeLimit),
          category: "personal",
          reason: "Physical activity that improves environment",
          priority: "medium",
        },
      );
    } else if (energy === "medium") {
      suggestions.push(
        {
          activity: "Moderate exercise or walk",
          duration: Math.min(25, timeLimit),
          category: "fitness",
          reason: "Maintain energy with balanced movement",
          priority: "medium",
        },
        {
          activity: "Learning new skill",
          duration: Math.min(30, timeLimit),
          category: "learning",
          reason: "Perfect energy for focused learning",
          priority: "high",
        },
        {
          activity: "Creative project work",
          duration: Math.min(40, timeLimit),
          category: "creative",
          reason: "Ideal energy for creative flow",
          priority: "medium",
        },
      );
    } else {
      // low energy
      suggestions.push(
        {
          activity: "Gentle stretching or yoga",
          duration: Math.min(15, timeLimit),
          category: "wellness",
          reason: "Gentle movement to boost energy",
          priority: "high",
        },
        {
          activity: "Read something inspiring",
          duration: Math.min(20, timeLimit),
          category: "learning",
          reason: "Light mental stimulation",
          priority: "medium",
        },
        {
          activity: "Listen to uplifting music",
          duration: Math.min(15, timeLimit),
          category: "wellness",
          reason: "Passive activity to improve mood",
          priority: "medium",
        },
      );
    }

    // Mood-based suggestions
    if (mood === "stressed") {
      suggestions.push(
        {
          activity: "5-minute breathing exercise",
          duration: Math.min(10, timeLimit),
          category: "wellness",
          reason: "Direct stress relief technique",
          priority: "high",
        },
        {
          activity: "Write in journal",
          duration: Math.min(15, timeLimit),
          category: "personal",
          reason: "Process and release stress",
          priority: "high",
        },
      );
    } else if (mood === "motivated") {
      suggestions.push(
        {
          activity: "Start ambitious project",
          duration: Math.min(60, timeLimit),
          category: "work",
          reason: "Capitalize on motivation",
          priority: "high",
        },
        {
          activity: "Plan future goals",
          duration: Math.min(20, timeLimit),
          category: "personal",
          reason: "Channel motivation into planning",
          priority: "medium",
        },
      );
    } else if (mood === "happy") {
      suggestions.push(
        {
          activity: "Share positivity with others",
          duration: Math.min(15, timeLimit),
          category: "social",
          reason: "Spread good mood",
          priority: "medium",
        },
        {
          activity: "Try something new and fun",
          duration: Math.min(30, timeLimit),
          category: "creative",
          reason: "Build on positive energy",
          priority: "medium",
        },
      );
    }

    // Focus-based suggestions
    if (focus === "focused") {
      suggestions.push(
        {
          activity: "Deep work session",
          duration: Math.min(60, timeLimit),
          category: "work",
          reason: "Optimal state for complex tasks",
          priority: "high",
        },
        {
          activity: "Study complex topic",
          duration: Math.min(45, timeLimit),
          category: "learning",
          reason: "High focus enables deep learning",
          priority: "high",
        },
      );
    } else if (focus === "scattered") {
      suggestions.push(
        {
          activity: "Quick organizing tasks",
          duration: Math.min(15, timeLimit),
          category: "personal",
          reason: "Simple tasks that don't require deep focus",
          priority: "medium",
        },
        {
          activity: "Light physical activity",
          duration: Math.min(20, timeLimit),
          category: "fitness",
          reason: "Movement can help restore focus",
          priority: "medium",
        },
      );
    }

    // Time of day suggestions
    if (timeOfDay === "morning") {
      suggestions.push(
        {
          activity: "Set intentions for the day",
          duration: Math.min(10, timeLimit),
          category: "personal",
          reason: "Morning is perfect for planning",
          priority: "high",
        },
        {
          activity: "Morning movement routine",
          duration: Math.min(20, timeLimit),
          category: "fitness",
          reason: "Start day with energy",
          priority: "medium",
        },
      );
    } else if (timeOfDay === "evening") {
      suggestions.push(
        {
          activity: "Reflect on the day",
          duration: Math.min(10, timeLimit),
          category: "personal",
          reason: "Evening reflection builds growth",
          priority: "medium",
        },
        {
          activity: "Prepare for tomorrow",
          duration: Math.min(15, timeLimit),
          category: "personal",
          reason: "Set up tomorrow's success",
          priority: "medium",
        },
      );
    }

    // Remove duplicates and prioritize
    const uniqueSuggestions = suggestions
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.activity === item.activity),
      )
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 6);

    return { suggestions: uniqueSuggestions };
  }

  getFallbackSuggestions(availableTime) {
    const suggestions = [
      {
        activity: "Quick meditation",
        duration: 10,
        category: "personal",
        reason: "Reset and refocus",
        energyLevel: "low",
      },
      {
        activity: "Learning session",
        duration: 25,
        category: "learning",
        reason: "Productive use of time",
        energyLevel: "medium",
      },
      {
        activity: "Quick workout",
        duration: 15,
        category: "fitness",
        reason: "Boost energy levels",
        energyLevel: "high",
      },
      {
        activity: "Creative writing",
        duration: 20,
        category: "personal",
        reason: "Express creativity",
        energyLevel: "medium",
      },
      {
        activity: "Organize workspace",
        duration: 30,
        category: "personal",
        reason: "Improve productivity",
        energyLevel: "medium",
      },
    ];

    // Filter by available time
    const filteredSuggestions = suggestions.filter(
      (s) => s.duration <= availableTime,
    );

    return {
      suggestions:
        filteredSuggestions.length > 0
          ? filteredSuggestions
          : suggestions.slice(0, 3),
    };
  }

  async refineSchedule(refinementRequest) {
    const {
      currentSchedule,
      userRequest,
      preferences,
      conversationHistory = [],
    } = refinementRequest;

    // Build conversation context
    const systemPrompt = `You are TenebrisOS's intelligent scheduling assistant - a creative, helpful AI that understands users want personalized, flexible schedules. You're conversational, understanding, and great at interpreting natural language requests.

Your personality:
- Friendly and encouraging
- Creative problem solver
- Understanding of work-life balance
- Supportive of user preferences
- Able to suggest improvements beyond just fulfilling requests

Current Schedule Context:
${JSON.stringify(currentSchedule, null, 2)}

User Preferences:
- Wake Time: ${preferences.startTime}
- Sleep Time: ${preferences.endTime}
- Energy Pattern: ${preferences.energyPattern}
- Working Days: ${preferences.workingDays?.join(", ")}
- Break Preference: ${preferences.breakPreference}
- Priorities: ${preferences.priorities}

Instructions:
1. Understand the user's request in natural language
2. Make intelligent schedule modifications
3. Suggest improvements when appropriate
4. Maintain schedule balance and user wellbeing
5. Be conversational and explain your reasoning

Always respond in this JSON format:
{
  "schedule": { /* updated schedule object */ },
  "explanation": "Conversational explanation of changes made and reasoning"
}`;

    // Build conversation messages
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history for context
    if (conversationHistory.length > 0) {
      messages.push(...conversationHistory.slice(-6)); // Keep last 6 messages for context
    }

    // Add current user request
    messages.push({
      role: "user",
      content: `Please modify my schedule: "${userRequest}"`,
    });

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          temperature: 0.8,
          max_tokens: 2500,
          presence_penalty: 0.3,
          frequency_penalty: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI API");
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const result = JSON.parse(jsonMatch[0]);
        return {
          schedule: result.schedule || currentSchedule,
          explanation:
            result.explanation ||
            "I've updated your schedule based on your request! Let me know if you'd like any other changes.",
          conversationResponse: content, // Include full response for context
        };
      } catch (parseError) {
        console.warn("Failed to parse OpenAI response:", parseError);
        // If JSON parsing fails, try to extract meaningful response
        return {
          schedule: currentSchedule,
          explanation:
            content.includes("sorry") ||
            content.includes("can't") ||
            content.includes("unable")
              ? content
              : "I understand your request! However, I couldn't modify the schedule right now. Could you try rephrasing your request or be more specific about what you'd like to change?",
          conversationResponse: content,
        };
      }
    } catch (error) {
      console.error("Schedule refinement failed:", error);
      throw new Error(
        "I'm having trouble connecting right now. Please check your internet connection and API key, then try again.",
      );
    }
  }

  // New method for general chat without schedule modification
  async chatWithAssistant(message, context = {}) {
    const { currentSchedule, preferences, conversationHistory = [] } = context;

    const systemPrompt = `You are TenebrisOS's friendly scheduling assistant. You're here to help users with their schedule and productivity questions. Be conversational, helpful, and encouraging.

You can help with:
- Schedule planning and optimization
- Productivity tips
- Work-life balance advice
- Time management strategies
- General scheduling questions

Current user context:
${currentSchedule ? `Current Schedule: ${JSON.stringify(currentSchedule, null, 2)}` : "No schedule set yet"}
${preferences ? `Preferences: ${JSON.stringify(preferences, null, 2)}` : ""}

Be natural and conversational. If the user asks for schedule changes, let them know they can make specific requests and you'll help modify their schedule.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep more context for general chat
      { role: "user", content: message },
    ];

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          temperature: 0.9,
          max_tokens: 1500,
          presence_penalty: 0.4,
          frequency_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI API");
      }

      return {
        response: content,
        isScheduleModification:
          content.toLowerCase().includes("schedule") &&
          (content.toLowerCase().includes("change") ||
            content.toLowerCase().includes("modify") ||
            content.toLowerCase().includes("update")),
      };
    } catch (error) {
      console.error("Chat failed:", error);
      throw new Error(
        "I'm having trouble responding right now. Please try again in a moment.",
      );
    }
  }
}

// Utility function to create service instance
export const createOpenAIService = (apiKey) => {
  return new OpenAIService(apiKey);
};

// Enhanced factory with automatic API key
export const createIntelligentOpenAIService = () => {
  return new OpenAIService(DEFAULT_API_KEY);
};

// Default export
export default OpenAIService;

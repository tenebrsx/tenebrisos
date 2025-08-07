// AI Learning Engine - Makes Tenebris know you better than you know yourself
import { saveToStorage, loadFromStorage } from "../utils/helpers.js";

export class AILearningEngine {
  constructor() {
    this.userProfile = this.loadUserProfile();
    this.activityHistory = loadFromStorage("activities", []);
    this.scheduleHistory = loadFromStorage("scheduleHistory", []);
    this.suggestionInteractions = loadFromStorage("suggestionInteractions", []);
    this.contextPatterns = loadFromStorage("contextPatterns", {});
    this.personalityTraits = this.loadPersonalityTraits();
    this.energyPatterns = loadFromStorage("energyPatterns", {});
    this.productivityRhythms = loadFromStorage("productivityRhythms", {});
  }

  // ========================================
  // CORE USER PROFILING SYSTEM
  // ========================================

  loadUserProfile() {
    const defaultProfile = {
      interests: {},
      preferences: {},
      avoidances: {},
      optimalTimes: {},
      energyLevels: {},
      categoryAffinities: {},
      durationPreferences: {},
      contextualBehavior: {},
      motivationTriggers: [],
      stressIndicators: [],
      flowStateActivities: [],
      procrastinationPatterns: {},
      completionRates: {},
      satisfactionScores: {},
      growthAreas: [],
      confidenceLevel: 0,
      lastUpdated: new Date().toISOString(),
    };

    return { ...defaultProfile, ...loadFromStorage("userProfile", {}) };
  }

  loadPersonalityTraits() {
    const defaultTraits = {
      workStyle: "balanced", // focused, flexible, structured, creative
      decisionMaking: "analytical", // intuitive, analytical, collaborative, quick
      energyType: "steady", // burst, steady, cyclical, variable
      learningStyle: "mixed", // visual, auditory, kinesthetic, reading
      socialPreference: "balanced", // introverted, extroverted, balanced
      riskTolerance: "moderate", // low, moderate, high
      planningHorizon: "weekly", // daily, weekly, monthly, quarterly
      motivationType: "achievement", // achievement, affiliation, power, autonomy
      stressResponse: "adaptive", // avoidant, confrontational, adaptive
      creativityLevel: "moderate", // low, moderate, high, very_high
      consistencyPreference: "structured", // loose, structured, very_structured
      complexityTolerance: "moderate", // simple, moderate, complex
    };

    return { ...defaultTraits, ...loadFromStorage("personalityTraits", {}) };
  }

  // ========================================
  // BEHAVIORAL LEARNING SYSTEM
  // ========================================

  learnFromActivity(activity, context = {}) {
    console.log("🧠 AI Learning: Analyzing activity", { activity, context });

    // Track activity completion and satisfaction
    this.trackActivityOutcome(activity, context);

    // Analyze activity patterns
    this.analyzeActivityPatterns(activity, context);

    // Update interests and preferences
    this.updateInterestProfile(activity, context);

    // Learn timing preferences
    this.learnTimingPreferences(activity, context);

    // Analyze productivity correlations
    this.analyzeProductivityCorrelations(activity, context);

    // Update personality insights
    this.inferPersonalityTraits(activity, context);

    this.saveProfile();
  }

  learnFromSuggestionInteraction(suggestion, action, context = {}) {
    const interaction = {
      suggestion,
      action, // 'accepted', 'rejected', 'modified', 'ignored'
      context,
      timestamp: new Date().toISOString(),
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      userState: this.getCurrentUserState(),
    };

    this.suggestionInteractions.push(interaction);
    saveToStorage("suggestionInteractions", this.suggestionInteractions);

    // Learn from interaction patterns
    this.analyzeInteractionPatterns(interaction);
    this.updateSuggestionRelevanceScores(interaction);

    console.log("🎯 AI Learning: Logged suggestion interaction", interaction);
  }

  learnFromScheduleCreation(schedule, method, userInput = {}) {
    const scheduleEntry = {
      schedule,
      method, // 'ai_generated', 'manual', 'template', 'modified'
      userInput,
      timestamp: new Date().toISOString(),
      adherenceRate: 0, // Will be updated later
      satisfactionScore: 0, // Will be updated later
    };

    this.scheduleHistory.push(scheduleEntry);
    saveToStorage("scheduleHistory", this.scheduleHistory);

    // Analyze scheduling patterns
    this.analyzeSchedulingPatterns(scheduleEntry);
    this.learnPlanningBehavior(scheduleEntry);
  }

  // ========================================
  // PATTERN ANALYSIS ENGINE
  // ========================================

  analyzeActivityPatterns(activity, context) {
    const patterns = this.contextPatterns;
    const timeKey = `${context.dayOfWeek || new Date().getDay()}_${context.hourOfDay || new Date().getHours()}`;
    const categoryKey = activity.category || "uncategorized";

    // Time-based patterns
    if (!patterns.timePreferences) patterns.timePreferences = {};
    if (!patterns.timePreferences[timeKey])
      patterns.timePreferences[timeKey] = {};
    if (!patterns.timePreferences[timeKey][categoryKey])
      patterns.timePreferences[timeKey][categoryKey] = 0;
    patterns.timePreferences[timeKey][categoryKey]++;

    // Duration patterns
    if (!patterns.durationPreferences) patterns.durationPreferences = {};
    if (!patterns.durationPreferences[categoryKey])
      patterns.durationPreferences[categoryKey] = [];
    patterns.durationPreferences[categoryKey].push(activity.duration || 30);

    // Sequence patterns (what activities typically follow others)
    const lastActivity = this.getLastActivity();
    if (lastActivity) {
      if (!patterns.sequencePreferences) patterns.sequencePreferences = {};
      const sequenceKey = `${lastActivity.category}_${categoryKey}`;
      if (!patterns.sequencePreferences[sequenceKey])
        patterns.sequencePreferences[sequenceKey] = 0;
      patterns.sequencePreferences[sequenceKey]++;
    }

    saveToStorage("contextPatterns", patterns);
  }

  analyzeProductivityCorrelations(activity, context) {
    const rhythms = this.productivityRhythms;
    const timeKey = `${context.dayOfWeek || new Date().getDay()}_${new Date().getHours()}`;

    if (!rhythms[timeKey])
      rhythms[timeKey] = { activities: [], satisfaction: [], energy: [] };

    rhythms[timeKey].activities.push({
      name: activity.name,
      category: activity.category,
      duration: activity.duration,
      completed: activity.completed || false,
      satisfaction: context.satisfaction || 3,
    });

    // Analyze optimal productivity windows
    this.identifyProductivityWindows();

    saveToStorage("productivityRhythms", rhythms);
  }

  inferPersonalityTraits(activity, context) {
    const traits = this.personalityTraits;

    // Infer work style from activity patterns
    if (activity.category === "work") {
      const duration = activity.duration || 30;
      if (duration > 90) {
        this.adjustTrait("workStyle", "focused", 0.1);
      } else if (duration < 30) {
        this.adjustTrait("workStyle", "flexible", 0.1);
      }
    }

    // Infer planning horizon from scheduling behavior
    const plannedInAdvance = context.plannedInAdvance || 0;
    if (plannedInAdvance > 7) {
      this.adjustTrait("planningHorizon", "monthly", 0.1);
    } else if (plannedInAdvance < 1) {
      this.adjustTrait("planningHorizon", "daily", 0.1);
    }

    // Infer consistency preference
    const timeVariation = this.getActivityTimeVariation(activity.name);
    if (timeVariation < 2) {
      // Very consistent timing
      this.adjustTrait("consistencyPreference", "very_structured", 0.1);
    }

    saveToStorage("personalityTraits", traits);
  }

  // ========================================
  // INTELLIGENT FILTERING SYSTEM
  // ========================================

  filterAndRankSuggestions(suggestions, context = {}) {
    console.log(
      "🔍 AI Learning: Filtering suggestions with advanced criteria",
      { suggestions, context },
    );

    return suggestions
      .map((suggestion) => ({
        ...suggestion,
        relevanceScore: this.calculateRelevanceScore(suggestion, context),
        personalFit: this.calculatePersonalFit(suggestion, context),
        timingScore: this.calculateTimingScore(suggestion, context),
        energyMatch: this.calculateEnergyMatch(suggestion, context),
        varietyScore: this.calculateVarietyScore(suggestion, context),
        growthPotential: this.calculateGrowthPotential(suggestion, context),
      }))
      .filter((suggestion) => this.shouldIncludeSuggestion(suggestion, context))
      .sort((a, b) => {
        const scoreA =
          a.relevanceScore * 0.3 +
          a.personalFit * 0.25 +
          a.timingScore * 0.2 +
          a.energyMatch * 0.15 +
          a.varietyScore * 0.05 +
          a.growthPotential * 0.05;
        const scoreB =
          b.relevanceScore * 0.3 +
          b.personalFit * 0.25 +
          b.timingScore * 0.2 +
          b.energyMatch * 0.15 +
          b.varietyScore * 0.05 +
          b.growthPotential * 0.05;
        return scoreB - scoreA;
      })
      .slice(0, 6); // Return top 6 suggestions
  }

  calculateRelevanceScore(suggestion, context) {
    let score = 0.5; // Base score

    // Historical preference
    const categoryAffinity =
      this.userProfile.categoryAffinities[suggestion.category] || 0;
    score += categoryAffinity * 0.3;

    // Recent activity correlation
    const recentCorrelation = this.getRecentActivityCorrelation(suggestion);
    score += recentCorrelation * 0.2;

    // Contextual relevance
    const contextRelevance = this.getContextualRelevance(suggestion, context);
    score += contextRelevance * 0.3;

    // Completion rate for similar activities
    const completionRate = this.getCompletionRateForSimilar(suggestion);
    score += completionRate * 0.2;

    return Math.min(1, Math.max(0, score));
  }

  calculatePersonalFit(suggestion, context) {
    let score = 0.5;

    // Duration preference match
    const durationFit = this.getDurationFit(suggestion);
    score += durationFit * 0.3;

    // Personality trait alignment
    const personalityFit = this.getPersonalityFit(suggestion);
    score += personalityFit * 0.4;

    // Stress level appropriateness
    const stressFit = this.getStressFit(suggestion, context);
    score += stressFit * 0.3;

    return Math.min(1, Math.max(0, score));
  }

  calculateTimingScore(suggestion, context) {
    const now = new Date();
    const timeKey = `${now.getDay()}_${now.getHours()}`;
    const patterns = this.contextPatterns.timePreferences || {};

    if (patterns[timeKey] && patterns[timeKey][suggestion.category]) {
      const frequency = patterns[timeKey][suggestion.category];
      const maxFrequency = Math.max(...Object.values(patterns[timeKey] || {}));
      return frequency / maxFrequency;
    }

    return 0.5; // Neutral if no data
  }

  calculateEnergyMatch(suggestion, context) {
    const currentHour = new Date().getHours();
    const userEnergyPattern = this.energyPatterns[currentHour] || "medium";
    const activityEnergyRequirement =
      this.getActivityEnergyRequirement(suggestion);

    const energyMap = { low: 1, medium: 2, high: 3 };
    const userEnergy = energyMap[userEnergyPattern] || 2;
    const requiredEnergy = energyMap[activityEnergyRequirement] || 2;

    // Perfect match = 1, complete mismatch = 0
    return 1 - Math.abs(userEnergy - requiredEnergy) / 2;
  }

  calculateVarietyScore(suggestion, context) {
    const recentActivities = this.getRecentActivities(7); // Last 7 days
    const categoryCount = recentActivities.filter(
      (a) => a.category === suggestion.category,
    ).length;
    const totalActivities = recentActivities.length;

    if (totalActivities === 0) return 0.5;

    // Higher score for less recently used categories
    const categoryRatio = categoryCount / totalActivities;
    return 1 - categoryRatio;
  }

  calculateGrowthPotential(suggestion, context) {
    const growthAreas = this.userProfile.growthAreas || [];
    const isGrowthArea = growthAreas.some(
      (area) =>
        suggestion.category.includes(area) ||
        suggestion.activity.toLowerCase().includes(area),
    );

    if (isGrowthArea) return 0.8;

    // Check if it's a new type of activity
    const hasTriedBefore = this.activityHistory.some((a) =>
      a.name.toLowerCase().includes(suggestion.activity.toLowerCase()),
    );

    return hasTriedBefore ? 0.3 : 0.6;
  }

  shouldIncludeSuggestion(suggestion, context) {
    // Filter out suggestions based on hard constraints

    // Check avoidances
    const avoidances = this.userProfile.avoidances || {};
    if (
      avoidances[suggestion.category] &&
      avoidances[suggestion.category] > 0.7
    ) {
      return false;
    }

    // Check if too similar to recent activities
    const recentSimilar = this.getRecentActivities(1).some(
      (a) => a.name.toLowerCase() === suggestion.activity.toLowerCase(),
    );
    if (recentSimilar) return false;

    // Check duration constraints
    const maxDuration = context.maxDuration || 120;
    if (suggestion.duration > maxDuration) return false;

    // Check energy constraints
    const currentEnergyLevel = this.getCurrentEnergyLevel();
    const requiredEnergy = this.getActivityEnergyRequirement(suggestion);
    if (currentEnergyLevel === "low" && requiredEnergy === "high") return false;

    return true;
  }

  // ========================================
  // PREDICTIVE INTELLIGENCE
  // ========================================

  predictUserNeeds(context = {}) {
    const predictions = {
      suggestedActivities: [],
      optimalDuration: 30,
      energyLevel: "medium",
      focusCapacity: "medium",
      motivationLevel: "medium",
      stressLevel: "low",
      recommendations: [],
      insights: [],
    };

    // Predict based on time patterns
    const timeBasedPredictions = this.getTimeBasedPredictions();
    predictions.suggestedActivities.push(...timeBasedPredictions);

    // Predict optimal duration based on current state
    predictions.optimalDuration = this.predictOptimalDuration(context);

    // Predict energy and focus levels
    predictions.energyLevel = this.predictEnergyLevel();
    predictions.focusCapacity = this.predictFocusCapacity();

    // Generate insights
    predictions.insights = this.generatePersonalInsights();

    return predictions;
  }

  generatePersonalInsights() {
    const insights = [];

    // Productivity patterns
    const productiveHours = this.getProductiveHours();
    if (productiveHours.length > 0) {
      insights.push({
        type: "productivity",
        title: "Your Peak Hours",
        message: `You're most productive between ${productiveHours[0]}:00 and ${productiveHours[productiveHours.length - 1]}:00`,
        confidence: 0.8,
      });
    }

    // Category preferences
    const favoriteCategory = this.getFavoriteCategory();
    if (favoriteCategory) {
      insights.push({
        type: "preference",
        title: "Activity Preference",
        message: `You consistently enjoy ${favoriteCategory} activities`,
        confidence: 0.7,
      });
    }

    // Duration sweet spot
    const optimalDuration = this.getOptimalDuration();
    insights.push({
      type: "duration",
      title: "Optimal Session Length",
      message: `Your sweet spot is ${optimalDuration} minute sessions`,
      confidence: 0.6,
    });

    // Growth opportunities
    const growthOpportunity = this.identifyGrowthOpportunity();
    if (growthOpportunity) {
      insights.push({
        type: "growth",
        title: "Growth Opportunity",
        message: `Consider exploring more ${growthOpportunity} activities`,
        confidence: 0.5,
      });
    }

    return insights;
  }

  // ========================================
  // CONTEXTUAL UNDERSTANDING
  // ========================================

  getCurrentUserState() {
    const now = new Date();
    const recentActivities = this.getRecentActivities(1);
    const dayProgress = now.getHours() / 24;

    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      dayProgress,
      recentActivity: recentActivities[0] || null,
      estimatedEnergy: this.estimateCurrentEnergy(),
      estimatedStress: this.estimateCurrentStress(),
      availableTime: this.estimateAvailableTime(),
      context: this.inferCurrentContext(),
    };
  }

  inferCurrentContext() {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    if (day >= 1 && day <= 5) {
      if (hour >= 9 && hour <= 17) return "work_hours";
      if (hour >= 6 && hour <= 9) return "morning_routine";
      if (hour >= 17 && hour <= 20) return "evening_personal";
      if (hour >= 20 || hour <= 6) return "rest_time";
    } else {
      if (hour >= 8 && hour <= 12) return "weekend_morning";
      if (hour >= 12 && hour <= 18) return "weekend_afternoon";
      if (hour >= 18 || hour <= 8) return "weekend_evening";
    }

    return "general";
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  adjustTrait(trait, value, strength = 0.1) {
    if (!this.personalityTraits[trait + "_scores"]) {
      this.personalityTraits[trait + "_scores"] = {};
    }

    if (!this.personalityTraits[trait + "_scores"][value]) {
      this.personalityTraits[trait + "_scores"][value] = 0;
    }

    this.personalityTraits[trait + "_scores"][value] += strength;

    // Update primary trait if confidence is high enough
    const scores = this.personalityTraits[trait + "_scores"];
    const maxScore = Math.max(...Object.values(scores));
    const maxTrait = Object.keys(scores).find(
      (key) => scores[key] === maxScore,
    );

    if (maxScore > 1.0) {
      this.personalityTraits[trait] = maxTrait;
    }
  }

  getLastActivity() {
    return this.activityHistory[0] || null;
  }

  getRecentActivities(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.activityHistory.filter(
      (activity) => new Date(activity.startTime) > cutoff,
    );
  }

  getCurrentEnergyLevel() {
    const hour = new Date().getHours();
    return this.energyPatterns[hour] || "medium";
  }

  getActivityEnergyRequirement(suggestion) {
    const energyMap = {
      fitness: "high",
      work: "medium",
      learning: "medium",
      personal: "low",
      rest: "low",
    };

    return energyMap[suggestion.category] || "medium";
  }

  saveProfile() {
    saveToStorage("userProfile", this.userProfile);
    saveToStorage("personalityTraits", this.personalityTraits);
    saveToStorage("contextPatterns", this.contextPatterns);
    saveToStorage("energyPatterns", this.energyPatterns);
    saveToStorage("productivityRhythms", this.productivityRhythms);

    this.userProfile.lastUpdated = new Date().toISOString();
    this.userProfile.confidenceLevel = this.calculateConfidenceLevel();

    console.log("🧠 AI Learning: Profile updated", {
      confidence: this.userProfile.confidenceLevel,
      dataPoints: this.activityHistory.length,
    });
  }

  calculateConfidenceLevel() {
    const factors = {
      activityCount: Math.min(this.activityHistory.length / 100, 1),
      timeSpan: Math.min(this.getDaysOfData() / 30, 1),
      interactions: Math.min(this.suggestionInteractions.length / 50, 1),
      completeness: this.getProfileCompleteness(),
    };

    return (
      factors.activityCount * 0.4 +
      factors.timeSpan * 0.3 +
      factors.interactions * 0.2 +
      factors.completeness * 0.1
    );
  }

  getDaysOfData() {
    if (this.activityHistory.length === 0) return 0;

    const oldest = new Date(
      this.activityHistory[this.activityHistory.length - 1].startTime,
    );
    const newest = new Date(this.activityHistory[0].startTime);

    return (newest - oldest) / (1000 * 60 * 60 * 24);
  }

  getProfileCompleteness() {
    const requiredFields = ["interests", "preferences", "categoryAffinities"];
    const filledFields = requiredFields.filter(
      (field) => Object.keys(this.userProfile[field] || {}).length > 0,
    );

    return filledFields.length / requiredFields.length;
  }

  // Public API for external usage
  getIntelligentSuggestions(context = {}) {
    const baseSuggestions = this.generateBaseSuggestions(context);
    return this.filterAndRankSuggestions(baseSuggestions, context);
  }

  getUserInsights() {
    return {
      profile: this.userProfile,
      traits: this.personalityTraits,
      patterns: this.contextPatterns,
      confidence: this.userProfile.confidenceLevel,
      insights: this.generatePersonalInsights(),
      predictions: this.predictUserNeeds(),
    };
  }

  // ========================================
  // MISSING HELPER METHODS IMPLEMENTATION
  // ========================================

  trackActivityOutcome(activity, context) {
    const outcome = {
      activityName: activity.name,
      category: activity.category,
      duration: activity.duration,
      completed: activity.completed || context.completed || false,
      satisfaction: context.satisfaction || 3,
      timestamp: new Date().toISOString(),
    };

    if (!this.userProfile.completionRates[activity.category]) {
      this.userProfile.completionRates[activity.category] = [];
    }
    this.userProfile.completionRates[activity.category].push(outcome.completed);

    if (!this.userProfile.satisfactionScores[activity.name]) {
      this.userProfile.satisfactionScores[activity.name] = [];
    }
    this.userProfile.satisfactionScores[activity.name].push(
      outcome.satisfaction,
    );
  }

  updateInterestProfile(activity, context) {
    const interest = activity.name;
    const category = activity.category;

    // Update interests
    if (!this.userProfile.interests[interest]) {
      this.userProfile.interests[interest] = 0;
    }
    this.userProfile.interests[interest] += 1;

    // Update category affinities
    if (!this.userProfile.categoryAffinities[category]) {
      this.userProfile.categoryAffinities[category] = 0;
    }
    this.userProfile.categoryAffinities[category] += 0.1;

    // Cap at 1.0
    if (this.userProfile.categoryAffinities[category] > 1.0) {
      this.userProfile.categoryAffinities[category] = 1.0;
    }
  }

  learnTimingPreferences(activity, context) {
    const timeKey = `${context.dayOfWeek}_${context.hourOfDay}`;
    const category = activity.category;

    if (!this.userProfile.optimalTimes[category]) {
      this.userProfile.optimalTimes[category] = {};
    }

    if (!this.userProfile.optimalTimes[category][timeKey]) {
      this.userProfile.optimalTimes[category][timeKey] = 0;
    }

    this.userProfile.optimalTimes[category][timeKey] += 1;
  }

  analyzeInteractionPatterns(interaction) {
    // Track acceptance/rejection patterns
    if (!this.contextPatterns.interactionPatterns) {
      this.contextPatterns.interactionPatterns = {};
    }

    const patternKey = `${interaction.context.dayOfWeek}_${interaction.context.hourOfDay}`;
    if (!this.contextPatterns.interactionPatterns[patternKey]) {
      this.contextPatterns.interactionPatterns[patternKey] = {
        accepted: 0,
        rejected: 0,
      };
    }

    if (interaction.action === "accepted") {
      this.contextPatterns.interactionPatterns[patternKey].accepted += 1;
    } else if (interaction.action === "rejected") {
      this.contextPatterns.interactionPatterns[patternKey].rejected += 1;
    }
  }

  updateSuggestionRelevanceScores(interaction) {
    const category = interaction.suggestion.category;
    const action = interaction.action;

    if (!this.userProfile.preferences[category]) {
      this.userProfile.preferences[category] = 0.5;
    }

    if (action === "accepted") {
      this.userProfile.preferences[category] += 0.1;
    } else if (action === "rejected") {
      this.userProfile.preferences[category] -= 0.05;
    }

    // Keep within bounds
    this.userProfile.preferences[category] = Math.max(
      0,
      Math.min(1, this.userProfile.preferences[category]),
    );
  }

  analyzeSchedulingPatterns(scheduleEntry) {
    // Track how user creates schedules
    const method = scheduleEntry.method;
    if (!this.contextPatterns.schedulingMethods) {
      this.contextPatterns.schedulingMethods = {};
    }

    if (!this.contextPatterns.schedulingMethods[method]) {
      this.contextPatterns.schedulingMethods[method] = 0;
    }
    this.contextPatterns.schedulingMethods[method] += 1;
  }

  learnPlanningBehavior(scheduleEntry) {
    // Analyze planning horizon
    const activities = Object.values(scheduleEntry.schedule).flat();
    const planningAdvance = activities.length > 0 ? 7 : 1; // Assume weekly planning if multiple activities

    if (!this.userProfile.contextualBehavior.planningAdvance) {
      this.userProfile.contextualBehavior.planningAdvance = [];
    }
    this.userProfile.contextualBehavior.planningAdvance.push(planningAdvance);
  }

  identifyProductivityWindows() {
    const rhythms = this.productivityRhythms;
    const productiveHours = [];

    Object.keys(rhythms).forEach((timeKey) => {
      const data = rhythms[timeKey];
      if (data.activities.length > 0) {
        const avgSatisfaction =
          data.activities.reduce((sum, a) => sum + (a.satisfaction || 3), 0) /
          data.activities.length;
        const completionRate =
          data.activities.filter((a) => a.completed).length /
          data.activities.length;

        if (avgSatisfaction > 3.5 && completionRate > 0.7) {
          const [day, hour] = timeKey.split("_");
          productiveHours.push(parseInt(hour));
        }
      }
    });

    return [...new Set(productiveHours)].sort();
  }

  getActivityTimeVariation(activityName) {
    const similarActivities = this.activityHistory.filter((a) =>
      a.name.toLowerCase().includes(activityName.toLowerCase()),
    );

    if (similarActivities.length < 2) return 5; // Default high variation

    const hours = similarActivities.map((a) =>
      new Date(a.startTime).getHours(),
    );
    const avg = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance =
      hours.reduce((sum, h) => sum + Math.pow(h - avg, 2), 0) / hours.length;

    return Math.sqrt(variance);
  }

  getRecentActivityCorrelation(suggestion) {
    const recentActivities = this.getRecentActivities(3);
    const matchingActivities = recentActivities.filter(
      (a) =>
        a.category === suggestion.category ||
        a.name.toLowerCase().includes(suggestion.activity.toLowerCase()),
    );

    return matchingActivities.length / Math.max(recentActivities.length, 1);
  }

  getContextualRelevance(suggestion, context) {
    const currentContext = context.context || this.inferCurrentContext();
    let relevance = 0.5;

    // Context-based relevance mapping
    const contextRelevance = {
      work_hours: { work: 0.9, learning: 0.7, fitness: 0.3, personal: 0.2 },
      evening_personal: {
        personal: 0.9,
        fitness: 0.6,
        learning: 0.5,
        work: 0.1,
      },
      weekend_morning: {
        fitness: 0.8,
        personal: 0.7,
        learning: 0.6,
        work: 0.2,
      },
    };

    if (
      contextRelevance[currentContext] &&
      contextRelevance[currentContext][suggestion.category]
    ) {
      relevance = contextRelevance[currentContext][suggestion.category];
    }

    return relevance;
  }

  getCompletionRateForSimilar(suggestion) {
    const similarActivities = this.activityHistory.filter(
      (a) => a.category === suggestion.category,
    );

    if (similarActivities.length === 0) return 0.5;

    const completed = similarActivities.filter(
      (a) => a.completed !== false,
    ).length;
    return completed / similarActivities.length;
  }

  getDurationFit(suggestion) {
    const categoryDurations =
      this.contextPatterns.durationPreferences?.[suggestion.category] || [];
    if (categoryDurations.length === 0) return 0.5;

    const avgDuration =
      categoryDurations.reduce((sum, d) => sum + d, 0) /
      categoryDurations.length;
    const difference = Math.abs(suggestion.duration - avgDuration);

    // Perfect fit = 1, very different = 0
    return Math.max(0, 1 - difference / avgDuration);
  }

  getPersonalityFit(suggestion) {
    const traits = this.personalityTraits;
    let fit = 0.5;

    // Adjust based on personality traits
    if (traits.workStyle === "focused" && suggestion.duration > 60) fit += 0.2;
    if (traits.workStyle === "flexible" && suggestion.duration < 30) fit += 0.2;
    if (traits.energyType === "burst" && suggestion.category === "fitness")
      fit += 0.3;
    if (
      traits.complexityTolerance === "simple" &&
      suggestion.category === "learning"
    )
      fit -= 0.1;

    return Math.max(0, Math.min(1, fit));
  }

  getStressFit(suggestion, context) {
    const currentStress = this.estimateCurrentStress();
    let fit = 0.5;

    if (currentStress === "high") {
      if (
        suggestion.category === "personal" ||
        suggestion.activity.includes("meditation")
      ) {
        fit = 0.9;
      } else if (suggestion.category === "work") {
        fit = 0.2;
      }
    } else if (currentStress === "low") {
      if (
        suggestion.category === "work" ||
        suggestion.category === "learning"
      ) {
        fit = 0.8;
      }
    }

    return fit;
  }

  getTimeBasedPredictions() {
    const hour = new Date().getHours();
    const patterns = this.contextPatterns.timePreferences || {};
    const predictions = [];

    Object.keys(patterns).forEach((timeKey) => {
      const [day, hourKey] = timeKey.split("_");
      if (Math.abs(parseInt(hourKey) - hour) <= 1) {
        Object.keys(patterns[timeKey]).forEach((category) => {
          predictions.push({
            activity: `${category} session`,
            category,
            duration: 30,
            confidence: patterns[timeKey][category] / 10,
          });
        });
      }
    });

    return predictions.slice(0, 3);
  }

  predictOptimalDuration(context) {
    const energyLevel = this.predictEnergyLevel();
    const focusCapacity = this.predictFocusCapacity();

    let duration = 30; // Default

    if (energyLevel === "high" && focusCapacity === "high") {
      duration = 60;
    } else if (energyLevel === "low" || focusCapacity === "low") {
      duration = 15;
    }

    return duration;
  }

  predictEnergyLevel() {
    const hour = new Date().getHours();
    const energyPattern = this.energyPatterns[hour];

    if (energyPattern) return energyPattern;

    // Default energy patterns
    if (hour >= 6 && hour <= 10) return "high";
    if (hour >= 14 && hour <= 16) return "medium";
    if (hour >= 20 || hour <= 6) return "low";
    return "medium";
  }

  predictFocusCapacity() {
    const recentActivities = this.getRecentActivities(1);
    if (recentActivities.length === 0) return "medium";

    const lastActivity = recentActivities[0];
    if (lastActivity.category === "work" && lastActivity.duration > 60) {
      return "low"; // Likely tired from long work session
    }

    return "medium";
  }

  getProductiveHours() {
    return this.identifyProductivityWindows();
  }

  getFavoriteCategory() {
    const affinities = this.userProfile.categoryAffinities || {};
    const categories = Object.keys(affinities);

    if (categories.length === 0) return null;

    return categories.reduce((max, category) =>
      affinities[category] > affinities[max] ? category : max,
    );
  }

  getOptimalDuration() {
    const durations = Object.values(
      this.contextPatterns.durationPreferences || {},
    ).flat();
    if (durations.length === 0) return 30;

    return Math.round(
      durations.reduce((sum, d) => sum + d, 0) / durations.length,
    );
  }

  identifyGrowthOpportunity() {
    const affinities = this.userProfile.categoryAffinities || {};
    const allCategories = [
      "work",
      "learning",
      "fitness",
      "personal",
      "creative",
    ];

    const underutilized = allCategories.filter(
      (cat) => (affinities[cat] || 0) < 0.3,
    );

    return underutilized.length > 0 ? underutilized[0] : null;
  }

  estimateCurrentEnergy() {
    return this.predictEnergyLevel();
  }

  estimateCurrentStress() {
    const recentActivities = this.getRecentActivities(1);
    const hour = new Date().getHours();

    // High stress indicators
    if (
      hour >= 9 &&
      hour <= 17 &&
      new Date().getDay() >= 1 &&
      new Date().getDay() <= 5
    ) {
      return "medium"; // Work hours
    }

    if (
      recentActivities.length > 0 &&
      recentActivities[0].category === "work"
    ) {
      return "medium";
    }

    return "low";
  }

  estimateAvailableTime() {
    const hour = new Date().getHours();

    // Estimate based on time of day
    if (hour >= 9 && hour <= 17) return 60; // Work day
    if (hour >= 18 && hour <= 21) return 120; // Evening
    if (hour >= 6 && hour <= 9) return 45; // Morning

    return 30; // Default
  }

  generateBaseSuggestions(context) {
    const userState = this.getCurrentUserState();
    const predictions = this.predictUserNeeds(context);

    return predictions.suggestedActivities.concat([
      {
        activity: "Quick break",
        duration: 10,
        category: "personal",
        reason: "Recharge and reset",
        energyLevel: "low",
      },
      {
        activity: "Focus session",
        duration: 25,
        category: "work",
        reason: "Productive work time",
        energyLevel: "medium",
      },
    ]);
  }

  // Initialize learning from existing data
  initializeLearning() {
    console.log("🚀 AI Learning: Initializing learning engine...");

    // Learn from all existing activities
    this.activityHistory.forEach((activity) => {
      this.learnFromActivity(activity, {
        dayOfWeek: new Date(activity.startTime).getDay(),
        hourOfDay: new Date(activity.startTime).getHours(),
      });
    });

    console.log("🧠 AI Learning: Engine initialized with", {
      activities: this.activityHistory.length,
      confidence: this.userProfile.confidenceLevel,
      patterns: Object.keys(this.contextPatterns).length,
    });
  }
}

// Factory function for easy usage
export const createAILearningEngine = () => {
  const engine = new AILearningEngine();
  engine.initializeLearning();
  return engine;
};

export default AILearningEngine;

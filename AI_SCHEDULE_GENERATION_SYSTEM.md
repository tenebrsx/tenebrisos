# AI Schedule Generation System Documentation

## Overview

TenebrisOS features a powerful AI-driven schedule generation system that creates personalized weekly schedules using ChatGPT integration. The system combines user preferences, energy patterns, and lifestyle requirements to generate optimized schedules that users can then refine through natural language conversations with the AI.

## 🚀 Key Features

### 1. **Intelligent Schedule Generation**
- **Personalized Assessment**: Multi-step form collecting user preferences
- **Energy Pattern Recognition**: Optimizes schedule based on when users are most productive
- **Work-Life Balance**: Considers working days, break preferences, and personal priorities
- **Flexible Activities**: Accommodates both fixed and flexible time blocks

### 2. **ChatGPT Integration**
- **Real-time Conversations**: Direct chat interface with GPT-4
- **Natural Language Processing**: Understands requests like "Move my workout to the morning" or "Add more break time"
- **Contextual Understanding**: Maintains conversation history for better responses
- **Creative Refinements**: AI suggests improvements beyond just fulfilling requests

### 3. **Interactive Refinement**
- **Live Chat Interface**: Seamless conversation with the AI assistant
- **Quick Suggestions**: Pre-built buttons for common requests
- **Instant Updates**: Schedule updates in real-time as you chat
- **Conversation Memory**: AI remembers previous requests for context

### 4. **Export & Integration**
- **Copy to Clipboard**: Easily share schedule as formatted text
- **JSON Export**: Download complete schedule data with preferences
- **Direct Integration**: Apply generated schedule to main Schedule page
- **Preference Saving**: Remember settings for future generations

## 🔧 How It Works

### Step 1: User Assessment
The system collects user preferences through an interactive form:

```
📅 Wake Time & Bedtime
⚡ Energy Patterns (Morning/Afternoon/Evening/Balanced)
🗓️ Working Days Selection
☕ Break Preferences (Light/Moderate/Frequent)
🎯 Priorities (Productivity/Balance/Learning/Fitness)
➕ Custom Activities
```

### Step 2: AI Schedule Generation
Using OpenAI's GPT-4, the system:
1. Analyzes user preferences and patterns
2. Creates optimized time blocks for different activities
3. Balances work, rest, and personal time
4. Considers energy levels for task scheduling
5. Generates a complete weekly schedule

### Step 3: Interactive Refinement
Users can chat with the AI to:
- **Modify specific activities**: "Move my workout to 7 AM"
- **Adjust time blocks**: "I need longer lunch breaks"
- **Change focus areas**: "Make my mornings more productive"
- **Add new activities**: "Add time for reading"
- **Optimize patterns**: "Balance work and life better"

### Step 4: Schedule Implementation
Once satisfied, users can:
- Apply the schedule to their main calendar
- Export for external use
- Save preferences for future generations

## 💬 Chat Interface Features

### Natural Language Understanding
The AI assistant understands various request types:

```
🔄 Modifications: "Move X to Y time"
➕ Additions: "Add time for hobbies"
⚖️ Balancing: "Make evenings more relaxed"
⚡ Optimization: "Optimize for productivity"
🎨 Creative: "I need more me-time"
```

### Quick Suggestion Buttons
Pre-built prompts for common requests:
- 🏃‍♂️ "Move my workout to the morning"
- ☕ "Add more break time"
- 🌙 "Make my evenings more relaxed"
- ⚡ "Optimize for productivity"
- 🎨 "Add time for hobbies"
- ⚖️ "Balance work and life better"

### Enhanced User Experience
- **Keyboard Shortcuts**: ⌘+Enter to send messages quickly
- **Conversation History**: AI remembers context across messages
- **Clear Conversation**: Reset chat while keeping welcome message
- **Formatted Responses**: Bullet points and structured AI responses
- **Loading States**: Visual feedback during AI processing

## 🛠️ Technical Implementation

### Core Components

#### 1. `ScheduleGeneration.jsx`
- Main schedule generation interface
- Multi-step form handling
- Chat interface implementation
- Schedule display and management

#### 2. `openai.js` Service
- OpenAI API integration
- Schedule generation prompts
- Chat refinement handling
- Error handling and fallbacks

#### 3. Context Integration
- **SettingsContext**: API key management
- **Storage Utilities**: Persistent data saving
- **Navigation**: Seamless app integration

### API Integration

#### Schedule Generation
```javascript
const preferences = {
  startTime: "07:00",
  endTime: "22:00",
  energyPattern: "morning",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  breakPreference: "moderate",
  priorities: "balance"
};

const schedule = await openaiService.generateSchedule(preferences);
```

#### Chat Refinement
```javascript
const refinementRequest = {
  currentSchedule: generatedSchedule,
  userRequest: "Move my workout to the morning",
  conversationHistory: previousMessages,
  preferences: userPreferences
};

const result = await openaiService.refineSchedule(refinementRequest);
```

### Data Structures

#### Generated Schedule Format
```json
{
  "monday": [
    {
      "id": "monday_1634567890",
      "activity": "Morning Workout",
      "startTime": "07:00",
      "endTime": "08:00",
      "duration": 60,
      "category": "fitness",
      "priority": "high",
      "flexible": false
    }
  ],
  "tuesday": [...],
  // ... other days
}
```

#### Chat Message Format
```json
{
  "id": 1634567890,
  "role": "user|assistant",
  "content": "Message content",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "isThinking": false
}
```

## 🎯 User Flow

### 1. **Access Schedule Generation**
```
Main Schedule Page → "Generate Schedule" Button → /schedule/generate
```

### 2. **Complete Assessment**
```
Welcome → Questions (6 steps) → Custom Activities → Generate
```

### 3. **Review & Refine**
```
Generated Schedule → AI Chat → Refinements → Final Schedule
```

### 4. **Apply Schedule**
```
"Use This Schedule" → Save to App → Return to Schedule Page
```

## 🔮 Advanced Features

### Conversation Context
- **Memory**: AI remembers previous requests and context
- **Personality**: Friendly, encouraging, and solution-oriented
- **Suggestions**: Proactive improvement recommendations
- **Understanding**: Interprets natural language intuitively

### Smart Prompting
- **System Personality**: Defined AI character traits
- **Context Awareness**: Understands user's full situation
- **Creative Solutions**: Goes beyond simple modifications
- **Error Handling**: Graceful handling of unclear requests

### Export Capabilities
- **Text Format**: Human-readable schedule copy
- **JSON Export**: Complete data with preferences and history
- **Integration**: Direct application to main schedule
- **Backup**: Preference saving for future use

## 🚀 Getting Started

### Prerequisites
- OpenAI API key configured in Settings
- Internet connection for AI communication

### Usage Steps
1. **Navigate**: Go to Schedule → Generate Schedule
2. **Configure**: Answer the 6-step preference questions
3. **Generate**: Let AI create your personalized schedule
4. **Refine**: Chat with AI to perfect your schedule
5. **Apply**: Use the schedule in your main calendar

### Example Interactions
```
User: "I'm not a morning person, can you adjust this?"
AI: "I'll move your important tasks to later in the day when your energy peaks!"

User: "Add 30 minutes for meditation"
AI: "I've added a peaceful 30-minute meditation session. I placed it in the morning to help you start your day centered."

User: "Make this more balanced"
AI: "I've redistributed your activities to create better work-life balance with more breaks and personal time."
```

## 🔧 Configuration

### API Key Setup
1. Go to Settings in TenebrisOS
2. Navigate to AI section
3. Enter your OpenAI API key
4. Enable AI features

### Customization Options
- **Default preferences** can be modified in SettingsContext
- **Quick suggestions** can be customized in the component
- **Chat personality** can be adjusted in openai.js service

## 🎉 Benefits

### For Users
- **Personalized**: Tailored to individual energy patterns and preferences
- **Intelligent**: AI understands context and suggests improvements
- **Flexible**: Easy refinement through natural conversation
- **Integrated**: Seamlessly works with existing TenebrisOS features

### For Productivity
- **Optimized Time Blocks**: Activities scheduled during peak energy
- **Balanced Lifestyle**: Work-life balance considerations
- **Adaptive**: Easily adjustable as needs change
- **Comprehensive**: Covers all aspects of daily routine

## 🔄 Future Enhancements

### Planned Features
- **Learning**: AI learns from user preferences over time
- **Templates**: Save and reuse successful schedule patterns
- **Team Coordination**: Generate schedules considering team availability
- **Calendar Integration**: Direct sync with external calendar apps
- **Analytics**: Track schedule effectiveness and suggest optimizations

### Advanced AI Features
- **Habit Formation**: AI suggests gradual habit building
- **Seasonal Adjustments**: Adapt schedules for different seasons
- **Goal Alignment**: Connect activities to personal/professional goals
- **Health Integration**: Consider sleep patterns and wellness data

---

## 📞 Support

The AI Schedule Generation system is designed to be intuitive and user-friendly. The AI assistant is programmed to be helpful and understanding, providing guidance when requests are unclear.

For the best experience:
- Be specific in your requests
- Don't hesitate to ask for explanations
- Use natural language - the AI understands context
- Experiment with different phrasings if needed

**Happy Scheduling! 🎯✨**
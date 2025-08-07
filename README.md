# TENEBRIS OS

A sophisticated personal productivity operating system built with React, featuring a dark aesthetic, smooth animations, and intuitive command-driven workflows.

![Tenebris OS Preview](https://via.placeholder.com/800x400/0a0a0a/ffffff?text=TENEBRIS+OS)

## ✨ Features

### 🎯 **Core Functionality**
- **AI Schedule Generation** - OpenAI-powered intelligent weekly schedule creation
- **Smart Activity Prompts** - Automatic notifications when scheduled activities begin
- **Things to Do** - AI-powered personalized activity suggestions based on your current state
- **Mobile-App Interface** - Bottom navigation with smooth page transitions
- **Home Dashboard** - Current activity tracking with schedule integration
- **Activities Page** - Full activity management and history
- **Schedule Page** - AI-generated schedules with drag-drop editing
- **Statistics Page** - Time analytics with period toggles (week/month/year/all-time)
- **Real-time Tracking** - Live activity timers with start/stop/pause controls
- **Smart Data Persistence** - All activities saved locally with auto-restore

### 🎨 **Design & Experience**
- **Mobile-First Design** - Optimized for touch with 44px+ tap targets
- **Bottom Navigation** - iOS-inspired navigation with clean animations
- **Page Transitions** - Smooth slide animations between sections
- **Glassmorphism UI** - Modern glass effects with subtle blur layers
- **Noise Texture Overlay** - Film-like grain texture for tactile quality
- **Command Palette** - Full keyboard-driven interface (⌘K) - macOS Spotlight inspired
- **Smart Interactions** - Clean button animations without cursor-following effects

### 📊 **Analytics & Insights**
- **AI-Powered Scheduling** - Intelligent schedule optimization based on preferences
- **Context-Aware Suggestions** - AI analyzes energy, mood, focus, and time to suggest perfect activities
- **Smart Activity Alternatives** - AI recommends alternatives when you want to do something else
- **Weekly Statistics** - Track total time, focus sessions, and productivity
- **Activity Trends** - Visual progress tracking over time
- **Productivity Metrics** - Completion rates and performance indicators
- **Schedule Analytics** - Insights on schedule adherence and optimization

### ⚡ **Performance & Tech**
- **OpenAI Integration** - GPT-4 powered schedule generation and suggestions
- **Framer Motion** - Fluid, expressive animations
- **React + Vite** - Lightning-fast development and builds
- **Tailwind CSS** - Utility-first styling with custom design system
- **Local Storage** - Persistent data without external dependencies
- **Smart API Handling** - Efficient OpenAI API usage with fallbacks

## 🛠 Tech Stack

```json
{
  "Frontend": {
    "Framework": "React 18",
    "Build Tool": "Vite",
    "Styling": "Tailwind CSS",
    "Animation": "Framer Motion",
    "Smooth Scroll": "Lenis",
    "Icons": "Lucide React",
    "Routing": "React Router"
  },
  "AI & Backend": {
    "AI Provider": "OpenAI GPT-4",
    "API Integration": "RESTful",
    "Data Storage": "Local Storage"
  },
  "Development": {
    "Language": "JavaScript",
    "Linting": "ESLint",
    "Package Manager": "npm"
  }
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.15.0 or higher
- npm 10.7.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tenebris-os.git
cd tenebris-os

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

To use AI features, you'll need to set up your OpenAI API key:

1. **Create environment file**:
```bash
cp .env.example .env
```

2. **Add your OpenAI API key** to `.env`:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

3. **Get your API key** from [OpenAI Platform](https://platform.openai.com/api-keys)

**Important**: Never commit your `.env` file to version control. The `.gitignore` is already configured to exclude it.

#### Required Environment Variables
- `VITE_OPENAI_API_KEY` - Your OpenAI API key for AI schedule generation and suggestions

#### Optional Environment Variables
- `VITE_API_BASE_URL` - Custom OpenAI API base URL (defaults to OpenAI's endpoint)

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

### Navigation
- **Bottom Navigation** - Activities, Home, Things to Do, Schedule, Statistics pages
- **Smooth Transitions** - Pages slide smoothly with mobile-app feel
- **Clean Interactions** - Responsive buttons optimized for touch

### Keyboard Shortcuts
- `⌘K` / `Ctrl+K` - Open Command Palette (works like macOS Spotlight!)
- `ESC` - Close modals/overlays
- `↑↓` - Navigate command palette
- `Enter` - Execute selected command

### Command Palette Commands
- **Activities**: `start run`, `begin learning`, `lift session`, `focus mode`
- **Navigation**: `home`, `activities`, `things to do`, `schedule`, `statistics`
- **AI Features**: `generate schedule`, `optimize schedule`, `activity suggestions`, `personalized recommendations`
- **System**: `settings`, `profile`, `toggle theme`
- **Quick Actions**: `new idea`, `clear data`

### Activity Management
1. **Home Page** - Start activities with quick action buttons or command palette
2. **Things to Do** - Get AI-powered suggestions based on your current energy, mood, focus, and available time
3. **Smart Prompts** - Get notified when scheduled activities are due with Start/Skip/"Something Else" options
4. **AI Alternatives** - When you choose "Something Else", AI suggests productive alternatives
5. **Live Tracking** - Real-time timers with pause/resume/stop controls
6. **Activities Page** - Full history, templates, and activity management
7. **Schedule Page** - AI-generated weekly schedules with drag-drop editing
8. **Statistics Page** - Analytics with time period filters (week/month/year/all-time)

### AI Schedule Generation
1. **Set Preferences** - Configure your work hours, energy levels, and preferences
2. **Enter OpenAI API Key** - Securely stored locally for AI features
3. **Generate Schedule** - AI creates a balanced weekly schedule based on your activities
4. **Edit & Customize** - Drag-drop activities, edit times, add/remove blocks
5. **Smart Prompts** - Get notified when it's time for scheduled activities

### Things to Do - AI Recommendations
1. **Quick Assessment** - Answer 5 questions about energy, mood, focus, time, and context
2. **AI Analysis** - OpenAI analyzes your state to suggest perfect activities
3. **Personalized Results** - Get 5-7 tailored suggestions with reasoning
4. **One-Click Start** - Begin any suggested activity with built-in timer
5. **Context Awareness** - Suggestions adapt to time of day, energy levels, and mood

## 📁 Project Structure

```
tenebris-os/
├── public/
│   └── vite.svg                 # Favicon
├── src/
│   ├── components/              # Reusable components
│   │   ├── BottomNavigation.jsx # Mobile-style navigation
│   │   ├── CommandPalette.jsx   # Command interface
│   │   ├── MagneticButton.jsx   # Interactive buttons
│   │   ├── StatusIndicator.jsx  # Activity status displays
│   │   ├── LoadingSpinner.jsx   # Loading animations
│   │   └── TimeTracker.jsx      # Time tracking components
│   ├── pages/                   # Main application pages
│   │   ├── Home.jsx             # Dashboard with smart prompts
│   │   ├── Activities.jsx       # Activity management
│   │   ├── ThingsToDo.jsx       # AI-powered activity suggestions
│   │   ├── Schedule.jsx         # AI schedule generation
│   │   └── Statistics.jsx       # Analytics and insights
│   ├── services/                # External service integrations
│   │   └── openai.js            # OpenAI API integration
│   ├── hooks/                   # Custom React hooks
│   │   └── useSmoothScroll.js   # Lenis integration
│   ├── utils/                   # Utility functions
│   │   └── helpers.js           # Time, storage, animation helpers
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles & Tailwind
├── .env.example                 # Environment configuration template
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
└── README.md                    # This file
```

## 🎨 Design System

### Color Palette
```css
/* Dark Theme */
--color-bg: #0a0a0a;           /* Primary background */
--color-surface: #111111;       /* Card backgrounds */
--color-border: #1a1a1a;        /* Border color */
--color-text: #ffffff;          /* Primary text */
--color-text-secondary: #a1a1aa; /* Secondary text */
--color-text-muted: #71717a;    /* Muted text */

/* Accent Colors */
--color-accent-blue: #3b82f6;   /* Primary actions */
--color-accent-purple: #8b5cf6; /* Creative tasks */
--color-accent-green: #10b981;  /* Fitness/success */
--color-accent-orange: #f59e0b; /* Ideas/warnings */
--color-accent-red: #ef4444;    /* Alerts/breaks */
```

### Typography
- **Display**: Space Grotesk (headings)
- **Body**: Inter (body text)
- **Monospace**: JetBrains Mono (code)

### Mobile-First Components
- **Bottom Navigation**: iOS-inspired with magnetic hover effects
- **Glass Cards**: Backdrop blur with subtle borders
- **Magnetic Buttons**: Touch-optimized with spring animations (44px+ tap targets)
- **Status Indicators**: Animated dots for activity states
- **Progress Bars**: Real-time gradient-filled tracking
- **Page Transitions**: Smooth slide animations between pages

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features

#### 1. Activity Types
Add new activity types in `src/App.jsx`:
```javascript
const quickActions = [
  {
    id: 'new-activity',
    label: 'New Activity',
    icon: YourIcon,
    color: 'accent-color',
    action: () => handleStartActivity('Activity Name')
  }
]
```

#### 2. Command Palette Commands
Extend commands in `src/components/CommandPalette.jsx`:
```javascript
const commands = [
  {
    id: 'command-id',
    label: 'Command Label',
    description: 'Command description',
    icon: CommandIcon,
    category: 'Category',
    keywords: ['keyword1', 'keyword2'],
    action: () => yourAction(),
    shortcut: 'K'
  }
]
```

#### 3. Custom Components
Follow the component structure:
```javascript
import { motion } from 'framer-motion'
import { useEffect } from 'react'

const YourComponent = ({ prop1, prop2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="your-styles"
    >
      {/* Component content */}
    </motion.div>
  )
}

export default YourComponent
```

## 🎯 Roadmap

### Phase 1 (Current) ✅
- [x] Mobile-app interface with bottom navigation
- [x] AI-powered schedule generation with OpenAI GPT-4
- [x] Things to Do - AI recommendations based on energy, mood, focus, and time
- [x] Smart activity prompts with Start/Skip/"Something Else" options
- [x] Home dashboard with live activity tracking and schedule integration
- [x] Activities page with full management and history
- [x] Schedule page with AI generation and drag-drop editing
- [x] Statistics page with time period filters
- [x] Command palette (macOS Spotlight inspired)
- [x] Real-time activity timers with pause/resume
- [x] Local data persistence with auto-restore
- [x] Clean animations without cursor-following effects

### Phase 2 (Next)
- [ ] Advanced AI schedule optimization with learning
- [ ] Custom activity templates and smart categorization
- [ ] Enhanced statistics with charts and graphs
- [ ] Pomodoro timer integration with AI breaks
- [ ] Export/import functionality for schedules
- [ ] Keyboard shortcut customization
- [ ] Native notification system with smart timing

### Phase 3 (Future)
- [ ] Multi-device sync with cloud storage
- [ ] Advanced AI coaching and productivity insights
- [ ] Integration with calendar apps and task managers
- [ ] Team collaboration and shared schedules
- [ ] Native mobile app (iOS/Android)
- [ ] Apple Watch / wearables integration
- [ ] Voice commands and smart assistant integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Use **ESLint** configuration provided
- Follow **React** best practices
- Write **descriptive** commit messages
- Add **comments** for complex logic

### Bug Reports
Please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framer Motion** - For incredible animation capabilities
- **Tailwind CSS** - For the utility-first CSS framework
- **Lenis** - For smooth scroll implementation
- **Lucide** - For beautiful, consistent icons
- **Vite** - For lightning-fast development experience

---

**Built with ❤️ for productivity enthusiasts**

*Tenebris OS - Where focus meets aesthetic*
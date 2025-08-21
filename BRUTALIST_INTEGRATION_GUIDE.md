# Brutalist UI System Integration Guide

This guide shows you how to integrate the new brutalist UI system into your existing TenebrisOS application.

## Quick Setup

### 1. Wrap Your App with ThemeProvider

```tsx
// src/App.jsx - Update your main App component
import React from 'react';
import { ThemeProvider } from './theme';
import Dashboard from './screens/Dashboard';

function App() {
  return (
    <ThemeProvider initialColorMode="dark">
      {/* Your existing app content */}
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
```

### 2. Update Your Router to Include Brutalist Dashboard

```tsx
// In your existing Routes
import Dashboard from './screens/Dashboard';

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/brutalist" element={<Dashboard />} />
  {/* Your existing routes */}
</Routes>
```

### 3. Add to Your Navigation

```tsx
// In your existing navigation component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Add a button/link to access brutalist dashboard
<button onClick={() => navigate('/dashboard')}>
  Brutalist Dashboard
</button>
```

## Migration Strategy

### Phase 1: Side-by-Side Implementation (Recommended)

Keep your existing system running while implementing brutalist components:

```tsx
// Create a feature flag or route-based switching
import { useLocation } from 'react-router-dom';
import Dashboard from './screens/Dashboard'; // New brutalist dashboard
import Home from './pages/Home'; // Your existing home

function AppContent() {
  const location = useLocation();
  const useBrutalist = location.pathname.includes('dashboard') || 
                       location.pathname.includes('brutalist');

  if (useBrutalist) {
    return <Dashboard />;
  }

  return <Home />; // Your existing home
}
```

### Phase 2: Component-by-Component Migration

Replace existing components gradually:

```tsx
// Example: Replace existing buttons with BrutalistButton
import BrutalistButton from './ui/BrutalistButton';
import { useTheme } from './theme';

function MyExistingComponent() {
  const { colors } = useTheme();

  return (
    <div>
      {/* Old button */}
      {/* <button className="btn-primary">Save</button> */}
      
      {/* New brutalist button */}
      <BrutalistButton 
        variant="primary" 
        color="neonGreen" 
        onPress={() => handleSave()}
      >
        Save
      </BrutalistButton>
    </div>
  );
}
```

## Integration Examples

### 1. Using Theme Tokens in Existing Components

```tsx
// Convert existing styles to use design tokens
import { useTheme } from './theme';

function ExistingCard() {
  const { colors, radius, spacing } = useTheme();

  const cardStyle = {
    backgroundColor: colors.gray[800],
    borderRadius: radius.lg,
    padding: spacing['2xl'],
    border: `2px solid ${colors.gray[700]}`,
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ color: colors.offWhite }}>Card Title</h2>
      <p style={{ color: colors.gray[400] }}>Card content</p>
    </div>
  );
}
```

### 2. Creating Hybrid Components

```tsx
// Combine brutalist components with your existing logic
import BrutalistCard from './ui/BrutalistCard';
import { YourExistingHook } from './hooks/yourHook';

function HybridComponent() {
  const { data, loading } = YourExistingHook();

  if (loading) return <div>Loading...</div>;

  return (
    <BrutalistCard 
      color="neonYellow"
      header="Your Data"
      meta="Updated just now"
    >
      {/* Your existing content logic */}
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </BrutalistCard>
  );
}
```

### 3. Responsive Integration

```tsx
// Use brutalist on mobile, existing on desktop
import { useResponsive } from './hooks/useResponsive';
import Dashboard from './screens/Dashboard';
import Home from './pages/Home';

function ResponsiveHome() {
  const { isMobile } = useResponsive();

  // Show brutalist dashboard on mobile for better UX
  if (isMobile) {
    return <Dashboard />;
  }

  return <Home />; // Your existing desktop home
}
```

## CSS Integration

### 1. Global Styles Update

```css
/* Add to your existing CSS */
:root {
  /* Brutalist color variables for CSS usage */
  --color-black: #0B0B0C;
  --color-off-white: #F5F6F7;
  --color-neon-yellow: #FFE44D;
  --color-neon-pink: #FF4D9A;
  --color-neon-green: #28E16D;
  --color-cobalt: #3A7BFF;
  --color-gray-400: #A1A1AA;
  --color-gray-700: #2A2A2E;
  --color-gray-800: #1A1A1D;
}

/* Update body background for brutalist pages */
body[data-brutalist="true"] {
  background-color: var(--color-black);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 2. Tailwind Config Extension (if using Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brutalist': {
          black: '#0B0B0C',
          'off-white': '#F5F6F7',
          'neon-yellow': '#FFE44D',
          'neon-pink': '#FF4D9A',
          'neon-green': '#28E16D',
          cobalt: '#3A7BFF',
        }
      },
      borderRadius: {
        'brutalist-xl': '28px',
        'brutalist-lg': '22px',
      }
    }
  }
}
```

## Data Integration

### 1. Connect to Existing Data Sources

```tsx
// Use your existing data hooks with brutalist components
import { useActivities } from './hooks/useActivities'; // Your existing hook
import BrutalistCard from './ui/BrutalistCard';
import StatTile from './ui/StatTile';

function DataIntegratedDashboard() {
  const { activities, stats } = useActivities();

  return (
    <div style={{ backgroundColor: '#0B0B0C', padding: '32px' }}>
      <BrutalistCard color="neonYellow" header="Today's Activities">
        {activities.map(activity => (
          <div key={activity.id}>
            {activity.name} - {activity.duration}
          </div>
        ))}
      </BrutalistCard>

      <StatTile
        label="Total Focus Time"
        value={`${stats.totalMinutes}m`}
        sparklineData={stats.dailyData}
        color="neonGreen"
      />
    </div>
  );
}
```

### 2. State Management Integration

```tsx
// Use your existing state management with brutalist UI
import { useSettings } from './contexts/SettingsContext';
import BrutalistButton from './ui/BrutalistButton';
import { useTheme } from './theme';

function SettingsIntegration() {
  const { settings, updateSettings } = useSettings();
  const { colors } = useTheme();

  return (
    <div style={{ backgroundColor: colors.black }}>
      <BrutalistButton
        color="neonPink"
        onPress={() => updateSettings({ theme: 'brutalist' })}
      >
        Enable Brutalist Theme
      </BrutalistButton>
    </div>
  );
}
```

## Navigation Integration

### 1. Add to Existing Navigation

```tsx
// Update your existing BottomNavigation
import NavBar from './ui/NavBar';

// In your navigation component
const navItems = [
  {
    id: 'home',
    label: 'Home',
    value: 'home',
    icon: <HomeIcon />,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    value: 'dashboard',
    icon: <DashboardIcon />,
  },
  // ... your existing items
];

function Navigation() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <NavBar
      items={navItems}
      activeValue={activeTab}
      onChange={(value) => {
        setActiveTab(value);
        navigate(`/${value}`);
      }}
    />
  );
}
```

### 2. Route Guards and Feature Flags

```tsx
// Conditionally show brutalist features
function FeatureFlaggedRoute() {
  const { settings } = useSettings();
  const showBrutalist = settings.enableBrutalistUI || false;

  if (showBrutalist) {
    return <Dashboard />;
  }

  return <Navigate to="/home" replace />;
}
```

## Performance Considerations

### 1. Code Splitting

```tsx
// Lazy load brutalist components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./screens/Dashboard'));
const BrutalistCard = lazy(() => import('./ui/BrutalistCard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### 2. Bundle Optimization

```js
// webpack.config.js or vite.config.js
// Split brutalist components into separate chunk
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          brutalist: [
            './src/ui/BrutalistCard',
            './src/ui/BrutalistButton',
            './src/screens/Dashboard'
          ]
        }
      }
    }
  }
}
```

## Testing Integration

### 1. Component Testing

```tsx
// Test brutalist components with your existing test setup
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './theme';
import BrutalistButton from './ui/BrutalistButton';

function renderWithTheme(component) {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
}

test('brutalist button renders correctly', () => {
  renderWithTheme(
    <BrutalistButton color="neonYellow">
      Test Button
    </BrutalistButton>
  );
  
  expect(screen.getByText('Test Button')).toBeInTheDocument();
});
```

### 2. Visual Regression Testing

```js
// Add to your existing visual testing
describe('Brutalist Dashboard', () => {
  it('matches snapshot', () => {
    const component = renderWithTheme(<Dashboard />);
    expect(component).toMatchSnapshot();
  });
});
```

## Migration Checklist

### Phase 1: Setup (Day 1)
- [ ] Install dependencies (framer-motion if not present)
- [ ] Add theme system files
- [ ] Wrap app with ThemeProvider
- [ ] Add brutalist dashboard route
- [ ] Test basic navigation

### Phase 2: Integration (Week 1)
- [ ] Create hybrid components
- [ ] Connect existing data sources
- [ ] Add feature flags/toggles
- [ ] Update navigation menus
- [ ] Test with real data

### Phase 3: Polish (Week 2)
- [ ] Add responsive behavior
- [ ] Optimize bundle size
- [ ] Add accessibility testing
- [ ] Performance optimization
- [ ] User testing and feedback

### Phase 4: Rollout (Week 3)
- [ ] A/B test brutalist vs existing
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Gradual feature rollout
- [ ] Documentation updates

## Troubleshooting

### Common Issues

1. **Theme not applying**: Make sure ThemeProvider wraps your entire app
2. **Colors not showing**: Check that color tokens are imported correctly
3. **Animations not working**: Verify framer-motion is installed and imported
4. **Responsive issues**: Test on multiple screen sizes
5. **Performance issues**: Use React DevTools Profiler to identify bottlenecks

### Debug Mode

```tsx
// Add debug logging
import { useTheme } from './theme';

function DebugTheme() {
  const theme = useTheme();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Current theme:', theme);
  }
  
  return null;
}
```

## Next Steps

1. **Start with the Dashboard**: Implement the full brutalist dashboard first
2. **User Feedback**: Show to users and collect feedback
3. **Iterate**: Refine based on usage patterns
4. **Expand**: Gradually convert more components
5. **Optimize**: Monitor performance and optimize as needed

The brutalist UI system is now ready to integrate into your existing TenebrisOS application! Start with the dashboard route and gradually expand from there.
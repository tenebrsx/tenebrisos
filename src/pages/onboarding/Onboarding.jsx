import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Home,
  Calendar,
  Brain,
  Zap,
  Bell,
  Palette,
  Sparkles,
  Check,
  Star,
  Target,
  Clock,
  Shield,
  Smartphone,
  Monitor,
  User,
  Mail,
  Lock,
  Apple,
  Chrome,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import MagneticButton from '../../components/MagneticButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { saveToStorage, loadFromStorage } from '../../utils/helpers';

const Onboarding = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    theme: 'dark',
    notifications: true,
    aiEnabled: true,
    platform: 'web', // will be 'ios' or 'macos' in native app
  });
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = loadFromStorage('hasCompletedOnboarding', false);
    if (hasCompletedOnboarding && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const steps = useMemo(() => [
    {
      id: 'welcome',
      title: 'Welcome to TenebrisOS',
      subtitle: 'Your personal productivity universe',
      component: 'welcome',
    },
    {
      id: 'features',
      title: 'Everything you need',
      subtitle: 'A complete productivity suite in one place',
      component: 'features',
    },
    {
      id: 'ai',
      title: 'AI-Powered Intelligence',
      subtitle: 'Your personal assistant for optimal productivity',
      component: 'ai',
    },
    {
      id: 'platform',
      title: 'Built for Apple Ecosystem',
      subtitle: 'Native experience across iPhone, iPad, and Mac',
      component: 'platform',
    },
    {
      id: 'permissions',
      title: 'Enhance Your Experience',
      subtitle: 'Enable features for the best experience',
      component: 'permissions',
    },
    {
      id: 'auth',
      title: 'Create Your Account',
      subtitle: 'Sync your data across all devices',
      component: 'auth',
    },
    {
      id: 'personalization',
      title: 'Make it Yours',
      subtitle: 'Customize your workspace',
      component: 'personalization',
    },
    {
      id: 'complete',
      title: 'Ready to Begin',
      subtitle: 'Your productivity journey starts now',
      component: 'complete',
    },
  ], []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, steps.length, isAnimating]);

  const prevStep = useCallback(() => {
    if (currentStep > 0 && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  }, [currentStep, isAnimating]);

  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup(authForm.email, authForm.password, authForm.displayName);
      } else {
        await login(authForm.email, authForm.password);
      }
      nextStep();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [authForm, authMode, signup, login, nextStep, isSubmitting]);

  const handleGoogleAuth = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setAuthError('');

    try {
      await loginWithGoogle();
      nextStep();
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginWithGoogle, nextStep, isSubmitting]);

  const completeOnboarding = useCallback(() => {
    // Save onboarding completion
    saveToStorage('hasCompletedOnboarding', true);

    // Save user preferences
    updateSettings({
      ...settings,
      theme: userPreferences.theme,
      notifications: userPreferences.notifications,
      ai: {
        ...settings.ai,
        enabled: userPreferences.aiEnabled,
      },
    });

    // Navigate to home
    navigate('/');
  }, [userPreferences, updateSettings, settings, navigate]);

  const updatePreference = useCallback((key, value) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const currentStepData = steps[currentStep];

  // Welcome Step Component
  const WelcomeStep = () => (
    <div className="text-center space-y-10">
      {/* App Icon with sophisticated animation */}
      <motion.div
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{
          delay: 0.3,
          type: 'spring',
          stiffness: 200,
          damping: 20
        }}
        className="relative"
      >
        <div className="w-36 h-36 mx-auto bg-gradient-to-br from-accent-blue via-accent-purple to-accent-blue rounded-[32px] flex items-center justify-center shadow-2xl">
          <Layers size={72} className="text-white drop-shadow-lg" />
        </div>

        {/* Floating elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-accent-green rounded-full flex items-center justify-center"
        >
          <Sparkles size={16} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Title and description with staggered animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="space-y-6"
      >
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-5xl font-display font-bold bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent"
          >
            TenebrisOS
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-2"
          >
            <p className="text-xl text-dark-text font-medium">
              Your Personal Productivity Universe
            </p>
            <p className="text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
              Experience the perfect blend of beautiful design and intelligent automation.
              Built exclusively for Apple devices with deep ecosystem integration.
            </p>
          </motion.div>
        </div>

        {/* Platform badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center space-x-4"
        >
          <div className="flex items-center space-x-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-full">
            <Apple size={14} className="text-accent-blue" />
            <span className="text-xs font-medium text-dark-text">iPhone</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-full">
            <Monitor size={14} className="text-accent-purple" />
            <span className="text-xs font-medium text-dark-text">iPad</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-dark-surface border border-dark-border rounded-full">
            <Monitor size={14} className="text-accent-green" />
            <span className="text-xs font-medium text-dark-text">Mac</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature preview cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
      >
        <div className="bg-dark-surface/50 backdrop-blur border border-dark-border/50 rounded-2xl p-4 text-center">
          <Calendar size={20} className="text-accent-blue mx-auto mb-2" />
          <div className="text-xs font-medium text-dark-text">Smart Schedule</div>
        </div>
        <div className="bg-dark-surface/50 backdrop-blur border border-dark-border/50 rounded-2xl p-4 text-center">
          <Brain size={20} className="text-accent-purple mx-auto mb-2" />
          <div className="text-xs font-medium text-dark-text">AI Assistant</div>
        </div>
        <div className="bg-dark-surface/50 backdrop-blur border border-dark-border/50 rounded-2xl p-4 text-center">
          <Target size={20} className="text-accent-green mx-auto mb-2" />
          <div className="text-xs font-medium text-dark-text">Goal Tracking</div>
        </div>
      </motion.div>
    </div>
  );

  // Features Step Component
  const FeaturesStep = () => {
    const features = [
      {
        icon: Calendar,
        title: 'Smart Scheduling',
        description: 'AI-powered schedule generation that adapts to your energy patterns',
        color: 'accent-blue',
      },
      {
        icon: Target,
        title: 'Activity Tracking',
        description: 'Monitor your productivity with beautiful analytics and insights',
        color: 'accent-green',
      },
      {
        icon: Brain,
        title: 'Intelligent Notes',
        description: 'Capture thoughts with AI-enhanced organization and search',
        color: 'accent-purple',
      },
      {
        icon: Zap,
        title: 'Quick Actions',
        description: 'Command palette and shortcuts for lightning-fast navigation',
        color: 'accent-orange',
      },
    ];

    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-display font-bold text-dark-text">
            Everything you need
          </h2>
          <p className="text-dark-text-secondary max-w-lg mx-auto">
            TenebrisOS combines the best productivity tools into one seamless experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-dark-surface border border-dark-border rounded-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-${feature.color}/20 rounded-xl flex items-center justify-center`}>
                  <feature.icon size={24} className={`text-${feature.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-dark-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-dark-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // AI Step Component
  const AIStep = () => (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center"
      >
        <Brain size={48} className="text-white" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          Meet your AI Assistant
        </h2>
        <p className="text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
          Our AI understands your work patterns, suggests optimal schedules, and helps you discover new productivity techniques tailored just for you.
        </p>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent-purple/20 rounded-full flex items-center justify-center">
              <Brain size={16} className="text-accent-purple" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-dark-text">AI Assistant</div>
              <div className="text-xs text-dark-text-muted">Just now</div>
            </div>
          </div>
          <div className="text-sm text-dark-text-secondary text-left">
            "Based on your energy patterns, I recommend scheduling your most important work between 9-11 AM when you're most focused. Would you like me to create a schedule around this?"
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2 text-dark-text-muted">
          <Sparkles size={16} className="text-accent-blue" />
          <span>Smart Suggestions</span>
        </div>
        <div className="flex items-center space-x-2 text-dark-text-muted">
          <Target size={16} className="text-accent-green" />
          <span>Goal Optimization</span>
        </div>
        <div className="flex items-center space-x-2 text-dark-text-muted">
          <Clock size={16} className="text-accent-purple" />
          <span>Time Management</span>
        </div>
      </div>
    </div>
  );

  // Platform Step Component
  const PlatformStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          Built for Apple Ecosystem
        </h2>
        <p className="text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
          TenebrisOS is designed from the ground up to feel native on iPhone, iPad, and Mac with seamless synchronization across all your devices.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mb-3">
            <Smartphone size={32} className="text-accent-blue" />
          </div>
          <div className="text-sm font-medium text-dark-text">iPhone</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mb-3">
            <Monitor size={32} className="text-accent-purple" />
          </div>
          <div className="text-sm font-medium text-dark-text">iPad</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto bg-dark-surface border border-dark-border rounded-2xl flex items-center justify-center mb-3">
            <Monitor size={32} className="text-accent-green" />
          </div>
          <div className="text-sm font-medium text-dark-text">Mac</div>
        </motion.div>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-md mx-auto">
        <div className="flex items-center space-x-3 mb-4">
          <Shield size={20} className="text-accent-green" />
          <span className="font-medium text-dark-text">Secure & Private</span>
        </div>
        <p className="text-sm text-dark-text-secondary text-left">
          Your data is encrypted end-to-end and synchronized securely across all your Apple devices using CloudKit integration.
        </p>
      </div>
    </div>
  );

  // Permissions Step Component
  const PermissionsStep = () => (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          Enhance Your Experience
        </h2>
        <p className="text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
          Enable these features to get the most out of TenebrisOS
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-accent-blue" />
              <div className="text-left">
                <div className="font-medium text-dark-text">Notifications</div>
                <div className="text-sm text-dark-text-muted">Stay on track with gentle reminders</div>
              </div>
            </div>
            <button
              onClick={() => updatePreference('notifications', !userPreferences.notifications)}
              className={`w-12 h-6 rounded-full transition-colors ${
                userPreferences.notifications ? 'bg-accent-blue' : 'bg-dark-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  userPreferences.notifications ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain size={20} className="text-accent-purple" />
              <div className="text-left">
                <div className="font-medium text-dark-text">AI Assistant</div>
                <div className="text-sm text-dark-text-muted">Get personalized productivity insights</div>
              </div>
            </div>
            <button
              onClick={() => updatePreference('aiEnabled', !userPreferences.aiEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                userPreferences.aiEnabled ? 'bg-accent-purple' : 'bg-dark-border'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  userPreferences.aiEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Auth Step Component
  const AuthStep = () => (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          {authMode === 'signup' ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-dark-text-secondary">
          {authMode === 'signup'
            ? 'Join TenebrisOS to sync your data across all devices'
            : 'Welcome back! Sign in to access your productivity universe'
          }
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {authMode === 'signup' && (
          <input
            type="text"
            placeholder="Full Name"
            value={authForm.displayName}
            onChange={(e) => setAuthForm(prev => ({ ...prev, displayName: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
          required
        />

        {authMode === 'signup' && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={authForm.confirmPassword}
            onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50"
            required
          />
        )}

        {authError && (
          <div className="p-3 bg-accent-red/20 border border-accent-red/30 rounded-xl text-accent-red text-sm">
            {authError}
          </div>
        )}

        <MagneticButton
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-3"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="xs" variant="dots" />
              <span>{authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
            </>
          ) : (
            <>
              <User size={16} />
              <span>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            </>
          )}
        </MagneticButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-dark-bg text-dark-text-muted">or</span>
        </div>
      </div>

      <MagneticButton
        variant="ghost"
        onClick={handleGoogleAuth}
        disabled={isSubmitting}
        className="w-full py-3"
      >
        <Chrome size={16} />
        <span>Continue with Google</span>
      </MagneticButton>

      <div className="text-center">
        <button
          onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
          className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
        >
          {authMode === 'signup'
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  );

  // Personalization Step Component
  const PersonalizationStep = () => (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          Make it Yours
        </h2>
        <p className="text-dark-text-secondary">
          Customize your workspace to match your style and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <h3 className="font-display font-semibold text-dark-text mb-4">Choose your theme</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updatePreference('theme', 'dark')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userPreferences.theme === 'dark'
                  ? 'border-accent-blue bg-accent-blue/10'
                  : 'border-dark-border bg-dark-surface hover:border-dark-border/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Moon size={20} className="text-accent-blue" />
                <span className="font-medium text-dark-text">Dark</span>
              </div>
            </button>

            <button
              onClick={() => updatePreference('theme', 'light')}
              className={`p-4 rounded-xl border-2 transition-all ${
                userPreferences.theme === 'light'
                  ? 'border-accent-orange bg-accent-orange/10'
                  : 'border-dark-border bg-dark-surface hover:border-dark-border/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sun size={20} className="text-accent-orange" />
                <span className="font-medium text-dark-text">Light</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Setup Options */}
        <div>
          <h3 className="font-display font-semibold text-dark-text mb-4">Quick setup</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-xl">
              <div className="flex items-center space-x-3">
                <Calendar size={18} className="text-accent-green" />
                <span className="text-dark-text">Create my first schedule</span>
              </div>
              <ChevronRight size={16} className="text-dark-text-muted" />
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-surface border border-dark-border rounded-xl">
              <div className="flex items-center space-x-3">
                <Target size={18} className="text-accent-purple" />
                <span className="text-dark-text">Set up activity tracking</span>
              </div>
              <ChevronRight size={16} className="text-dark-text-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Complete Step Component
  const CompleteStep = () => (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center"
      >
        <Check size={48} className="text-white" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-3xl font-display font-bold text-dark-text">
          You're All Set!
        </h2>
        <p className="text-dark-text-secondary max-w-lg mx-auto leading-relaxed">
          Welcome to TenebrisOS! Your productivity journey begins now. Start by creating your first schedule or exploring the features at your own pace.
        </p>
      </div>

      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-accent-yellow" />
            <span className="text-sm text-dark-text">Pro tip: Use ⌘+K to access the command palette</span>
          </div>
          <div className="flex items-center space-x-3">
            <Brain size={16} className="text-accent-purple" />
            <span className="text-sm text-dark-text">AI assistant is ready to help you optimize</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap size={16} className="text-accent-blue" />
            <span className="text-sm text-dark-text">Start with the schedule generator for best results</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return <WelcomeStep />;
      case 'features':
        return <FeaturesStep />;
      case 'ai':
        return <AIStep />;
      case 'platform':
        return <PlatformStep />;
      case 'permissions':
        return <PermissionsStep />;
      case 'auth':
        return <AuthStep />;
      case 'personalization':
        return <PersonalizationStep />;
      case 'complete':
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with progress */}
        <div className="flex items-center justify-between p-6">
          {currentStep > 0 ? (
            <MagneticButton
              variant="ghost"
              onClick={prevStep}
              disabled={isAnimating}
              className="opacity-70 hover:opacity-100"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </MagneticButton>
          ) : (
            <div />
          )}

          <div className="text-sm text-dark-text-muted">
            {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 2 ? (
            <button
              onClick={() => {
                // Skip to account creation
                setCurrentStep(5);
              }}
              className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
            >
              Skip
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-6">
          <div className="w-full h-1 bg-dark-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-blue rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-32">
          <AnimatePresence mode="wait" custom={currentStep}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full max-w-4xl"
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom navigation */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div />

            {currentStep < steps.length - 1 ? (
              <MagneticButton
                variant="primary"
                onClick={currentStepData.component === 'auth' && !isAuthenticated ? undefined : nextStep}
                disabled={isAnimating || (currentStepData.component === 'auth' && !isAuthenticated)}
                className="py-3 px-6"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </MagneticButton>
            ) : (
              <MagneticButton
                variant="primary"
                onClick={completeOnboarding}
                disabled={isAnimating}
                className="py-3 px-6"
              >
                <span>Get Started</span>
                <ArrowRight size={16} />
              </MagneticButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

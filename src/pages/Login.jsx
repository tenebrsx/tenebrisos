import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader,
  Chrome,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../contexts/AuthContext";

// FormInput component
const FormInput = React.forwardRef(
  ({ icon: Icon, type = "text", error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          <Icon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted"
            size={18}
          />
          <input
            ref={ref}
            type={type}
            className={clsx(
              "w-full pl-10 pr-4 py-3 rounded-xl",
              "bg-dark-surface border transition-all duration-200",
              "text-dark-text placeholder-dark-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
              error
                ? "border-accent-red/50 bg-accent-red/5"
                : "border-dark-border hover:border-white/20 focus:border-accent-blue/50",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-accent-red flex items-center space-x-1"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

// AuthButton component
const AuthButton = ({
  children,
  variant = "primary",
  loading = false,
  ...props
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={clsx(
      "w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl",
      "font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-accent-blue/50",
      variant === "primary" &&
        "bg-accent-blue text-white hover:bg-accent-blue/90",
      variant === "secondary" &&
        "bg-dark-surface border border-dark-border text-dark-text hover:bg-white/5",
      variant === "google" && "bg-white text-gray-900 hover:bg-gray-100",
      loading && "opacity-70 cursor-not-allowed",
    )}
    disabled={loading}
    {...props}
  >
    {loading ? <Loader className="animate-spin" size={18} /> : children}
  </motion.button>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    signup,
    loginWithGoogle,
    resetPassword,
    error,
    loading,
    clearError,
    isAuthenticated,
    isFirebaseAvailable,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const emailRef = useRef(null);

  // Check URL params for initial mode
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get("mode") === "signup") {
      setIsSignUp(true);
    }
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Focus email input on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Clear errors when switching between login/signup
  useEffect(() => {
    clearError();
    setFormErrors({});
  }, [isSignUp, clearError]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (isSignUp) {
      if (!formData.displayName) {
        errors.displayName = "Display name is required";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    clearError();

    try {
      if (isSignUp) {
        await signup(formData.email, formData.password, formData.displayName);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    clearError();

    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      setFormErrors({ resetEmail: "Email is required" });
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (error) {
      setFormErrors({ resetEmail: error.message });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (!isFirebaseAvailable) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto mb-4 text-accent-orange" size={48} />
          <h2 className="text-xl font-semibold text-dark-text mb-2">
            Authentication Unavailable
          </h2>
          <p className="text-dark-text-muted mb-6">
            Firebase authentication is not configured. The app is running in
            offline mode.
          </p>
          <AuthButton variant="secondary" onClick={() => navigate("/")}>
            Continue to App
          </AuthButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-accent-blue/5 pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent-blue/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-accent-blue rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="text-white" size={24} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-dark-text mb-2 font-space-grotesk">
              Welcome to Tenebris OS
            </h1>
            <p className="text-dark-text-muted">
              {isSignUp
                ? "Create your account to sync your productivity data across devices"
                : "Sign in to access your personalized productivity workspace"}
            </p>
          </motion.div>

          {/* Auth Form */}
          <motion.div
            variants={itemVariants}
            className="bg-dark-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
          >
            {/* Toggle between login/signup */}
            <div className="flex bg-dark-bg rounded-xl p-1 mb-6">
              <button
                onClick={() => setIsSignUp(false)}
                className={clsx(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  !isSignUp
                    ? "bg-accent-blue text-white shadow-lg"
                    : "text-dark-text-muted hover:text-dark-text",
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={clsx(
                  "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  isSignUp
                    ? "bg-accent-blue text-white shadow-lg"
                    : "text-dark-text-muted hover:text-dark-text",
                )}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl flex items-center space-x-2"
                >
                  <AlertCircle className="text-accent-red" size={16} />
                  <span className="text-sm text-accent-red">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Password Modal */}
            <AnimatePresence>
              {showResetPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                  onClick={() => setShowResetPassword(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-dark-surface border border-white/10 rounded-2xl p-6 w-full max-w-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-dark-text mb-4">
                      Reset Password
                    </h3>

                    {resetSent ? (
                      <div className="text-center">
                        <CheckCircle
                          className="mx-auto mb-3 text-accent-green"
                          size={32}
                        />
                        <p className="text-dark-text-muted mb-4">
                          Password reset email sent to {resetEmail}
                        </p>
                        <AuthButton
                          variant="secondary"
                          onClick={() => {
                            setShowResetPassword(false);
                            setResetSent(false);
                            setResetEmail("");
                          }}
                        >
                          Close
                        </AuthButton>
                      </div>
                    ) : (
                      <form onSubmit={handlePasswordReset}>
                        <FormInput
                          icon={Mail}
                          type="email"
                          placeholder="Enter your email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          error={formErrors.resetEmail}
                        />
                        <div className="flex space-x-3 mt-4">
                          <AuthButton
                            type="button"
                            variant="secondary"
                            onClick={() => setShowResetPassword(false)}
                          >
                            Cancel
                          </AuthButton>
                          <AuthButton type="submit" loading={loading}>
                            Send Reset Email
                          </AuthButton>
                        </div>
                      </form>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name (Sign Up Only) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormInput
                      icon={User}
                      name="displayName"
                      placeholder="Display Name"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      error={formErrors.displayName}
                      autoComplete="name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <FormInput
                ref={emailRef}
                icon={Mail}
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email}
                autoComplete="email"
              />

              {/* Password */}
              <div className="relative">
                <FormInput
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={formErrors.password}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-dark-text-muted hover:text-dark-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password (Sign Up Only) */}
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormInput
                      icon={Lock}
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={formErrors.confirmPassword}
                      autoComplete="new-password"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot Password Link */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <AuthButton type="submit" loading={isSubmitting}>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight size={18} />
              </AuthButton>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="px-4 text-sm text-dark-text-muted">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google Sign In */}
            <AuthButton
              variant="google"
              onClick={handleGoogleSignIn}
              loading={isSubmitting}
            >
              <Chrome size={18} />
              Continue with Google
            </AuthButton>

            {/* Switch Mode */}
            <div className="text-center mt-6">
              <p className="text-dark-text-muted text-sm">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-2 text-accent-blue hover:text-accent-blue/80 transition-colors font-medium"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>

            {/* Offline Mode */}
            <div className="text-center mt-6 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-dark-text-muted hover:text-dark-text transition-colors"
              >
                Continue without account (offline mode)
              </button>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-dark-text mb-4">
              What you'll get with an account:
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  icon: "🔄",
                  title: "Cross-device sync",
                  desc: "Access your data anywhere",
                },
                {
                  icon: "☁️",
                  title: "Cloud backup",
                  desc: "Never lose your progress",
                },
                {
                  icon: "🧠",
                  title: "AI learning",
                  desc: "Personalized suggestions",
                },
                {
                  icon: "📊",
                  title: "Advanced analytics",
                  desc: "Deeper insights",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-dark-text text-sm">
                      {feature.title}
                    </p>
                    <p className="text-dark-text-muted text-xs">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

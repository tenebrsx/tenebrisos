import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Camera,
  User,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Award,
  Zap,
  Activity,
  Star,
  CheckCircle,
  BarChart3,
  FileText,
  ListTodo,
  Calendar as CalendarIcon,
  Settings,
  Download,
  Sunrise,
  Play,
} from "lucide-react";
import {
  saveToStorage,
  loadFromStorage,
  formatDuration,
} from "../utils/helpers.js";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    try {
      return (
        loadFromStorage("user-profile", {
          name: "Tenebris User",
          email: "",
          bio: "Focused on productivity and personal growth",
          location: "",
          joinDate: new Date().toISOString(),
          avatar: "",
          preferences: {
            favoriteActivities: ["Learning", "Focus Session", "Running"],
            dailyGoal: 240, // minutes
            weeklyGoal: 1680, // minutes (4 hours daily)
          },
          achievements: [],
          stats: {
            totalActivities: 0,
            totalTime: 0,
            streak: 0,
            averageDaily: 0,
          },
        }) || {}
      );
    } catch (error) {
      console.error("Error loading profile:", error);
      return {};
    }
  });

  const [editForm, setEditForm] = useState(profileData);
  const [activities] = useState(loadFromStorage("activities", []));
  const [notes] = useState(loadFromStorage("notes", []));
  const [todos] = useState(loadFromStorage("todos", []));

  // Calculate real-time statistics
  useEffect(() => {
    const calculateStats = () => {
      const completedActivities = activities.filter(
        (a) => !a.isActive && a.duration,
      );
      const totalTime = completedActivities.reduce((acc, activity) => {
        return acc + (activity.duration || 0);
      }, 0);

      // Calculate streak (consecutive days with activities)
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toDateString();

        const hasActivity = activities.some(
          (activity) => new Date(activity.startTime).toDateString() === dateStr,
        );

        if (hasActivity) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      const averageDaily =
        completedActivities.length > 0 ? totalTime / Math.max(1, streak) : 0;

      const updatedStats = {
        totalActivities: completedActivities.length,
        totalTime,
        streak,
        averageDaily,
      };

      setProfileData((prev) => ({
        ...prev,
        stats: updatedStats,
      }));
    };

    calculateStats();
  }, [activities]);

  // Save profile data
  useEffect(() => {
    saveToStorage("user-profile", profileData);
  }, [profileData]);

  const handleSaveProfile = () => {
    setProfileData(editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm(profileData);
    setIsEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm((prev) => ({
          ...prev,
          avatar: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const achievements = [
    {
      id: "first-activity",
      title: "Getting Started",
      description: "Complete your first activity",
      icon: Play,
      unlocked: profileData.stats?.totalActivities > 0,
      progress: Math.min(1, profileData.stats?.totalActivities || 0),
    },
    {
      id: "week-streak",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: Award,
      unlocked: (profileData.stats?.streak || 0) >= 7,
      progress: Math.min(1, (profileData.stats?.streak || 0) / 7),
    },
    {
      id: "hundred-hours",
      title: "Century Club",
      description: "Log 100 hours of activities",
      icon: Clock,
      unlocked: (profileData.stats?.totalTime || 0) >= 6000, // 100 hours in minutes
      progress: Math.min(1, (profileData.stats?.totalTime || 0) / 6000),
    },
    {
      id: "early-bird",
      title: "Early Bird",
      description: "Start 10 activities before 8 AM",
      icon: Sunrise,
      unlocked: false, // Would need to track morning activities
      progress: 0,
    },
    {
      id: "note-taker",
      title: "Note Taker",
      description: "Create 50 notes",
      icon: FileText,
      unlocked: notes.length >= 50,
      progress: Math.min(1, notes.length / 50),
    },
    {
      id: "task-master",
      title: "Task Master",
      description: "Complete 100 todos",
      icon: CheckCircle,
      unlocked: todos.filter((t) => t.completed).length >= 100,
      progress: Math.min(1, todos.filter((t) => t.completed).length / 100),
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  const StatCard = ({ label, value, icon: Icon, color = "accent-blue" }) => (
    <div className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold text-${color} mb-1`}>{value}</div>
          <div className="text-sm text-dark-text-muted">{label}</div>
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-${color}/20 flex items-center justify-center`}
        >
          <Icon size={24} className={`text-${color}`} />
        </div>
      </div>
    </div>
  );

  const AchievementCard = ({ achievement }) => {
    const IconComponent = achievement.icon;
    const progressPercentage = achievement.progress * 100;

    return (
      <div
        className={`glass rounded-xl p-4 border transition-all ${
          achievement.unlocked
            ? "border-accent-green/30 bg-accent-green/5"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              achievement.unlocked ? "bg-accent-green/20" : "bg-dark-surface"
            }`}
          >
            <IconComponent
              size={20}
              className={
                achievement.unlocked
                  ? "text-accent-green"
                  : "text-dark-text-muted"
              }
            />
          </div>
          <div className="flex-1">
            <h4
              className={`font-medium ${
                achievement.unlocked ? "text-accent-green" : "text-dark-text"
              }`}
            >
              {achievement.title}
            </h4>
            <p className="text-sm text-dark-text-muted mb-2">
              {achievement.description}
            </p>
            <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  achievement.unlocked ? "bg-accent-green" : "bg-accent-blue"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-24 pt-8">
      <div className="absolute inset-0 noise pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-dark-text-muted hover:text-dark-text transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold text-dark-text mb-2">
                Profile
              </h1>
              <p className="text-dark-text-secondary">
                Your productivity journey and achievements
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/90 transition-colors"
          >
            <Edit3 size={16} />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <div className="glass rounded-xl p-6 border border-white/10">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-accent-blue to-accent-purple">
                    {(isEditing ? editForm.avatar : profileData.avatar) ? (
                      <img
                        src={isEditing ? editForm.avatar : profileData.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-blue/90 transition-colors">
                        <Camera size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 text-center"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={editForm.email || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 text-center"
                    />
                    <textarea
                      placeholder="Tell us about yourself..."
                      value={editForm.bio || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={editForm.location || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-dark-text placeholder:text-dark-text-muted focus:outline-none focus:border-accent-blue/50 text-center"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-accent-green text-white rounded-lg font-medium hover:bg-accent-green/90 transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-dark-surface text-dark-text rounded-lg font-medium hover:bg-dark-border transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-dark-text">
                      {profileData.name || "Tenebris User"}
                    </h2>
                    {profileData.email && (
                      <div className="flex items-center justify-center space-x-2 text-dark-text-muted">
                        <Mail size={14} />
                        <span className="text-sm">{profileData.email}</span>
                      </div>
                    )}
                    <p className="text-dark-text-secondary text-sm">
                      {profileData.bio ||
                        "Focused on productivity and personal growth"}
                    </p>
                    {profileData.location && (
                      <div className="flex items-center justify-center space-x-2 text-dark-text-muted">
                        <MapPin size={14} />
                        <span className="text-sm">{profileData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center space-x-2 text-dark-text-muted">
                      <Calendar size={14} />
                      <span className="text-sm">
                        Joined{" "}
                        {new Date(profileData.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Statistics and Content */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Time"
                value={formatDuration(profileData.stats?.totalTime || 0)}
                icon={Clock}
                color="accent-blue"
              />
              <StatCard
                label="Activities"
                value={profileData.stats?.totalActivities || 0}
                icon={Activity}
                color="accent-green"
              />
              <StatCard
                label="Streak"
                value={`${profileData.stats?.streak || 0} days`}
                icon={Zap}
                color="accent-orange"
              />
              <StatCard
                label="Daily Avg"
                value={formatDuration(
                  Math.round(profileData.stats?.averageDaily || 0),
                )}
                icon={TrendingUp}
                color="accent-purple"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <FileText className="text-accent-blue" size={20} />
                  <div>
                    <div className="font-semibold text-dark-text">
                      {notes.length}
                    </div>
                    <div className="text-sm text-dark-text-muted">Notes</div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <ListTodo className="text-accent-green" size={20} />
                  <div>
                    <div className="font-semibold text-dark-text">
                      {todos.length}
                    </div>
                    <div className="text-sm text-dark-text-muted">Tasks</div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-accent-purple" size={20} />
                  <div>
                    <div className="font-semibold text-dark-text">
                      {todos.filter((t) => t.completed).length}
                    </div>
                    <div className="text-sm text-dark-text-muted">
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-xl font-semibold text-dark-text mb-4">
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

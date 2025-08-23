import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Import components
import AdvancedWidgetSystem from "../components/AdvancedWidgetSystem.jsx";



// Import brutalist components
import {
  BrutalistCard,
  HeroCard,
  MinimalCard,
} from "../components/brutalist/BrutalistCard.jsx";
import {
  BrutalistButton,
  HeroButton,
  PrimaryButton,
  GhostButton,
} from "../components/brutalist/BrutalistButton.jsx";
import {
  BrutalistText,
  DisplayText,
  H1,
  H2,
  BodyText,
  CaptionText,
  Label,
  DarkText,
} from "../components/brutalist/BrutalistText.jsx";

// Import theme
import {
  BrutalistColors,
  BrutalistSpacing,
  BrutalistRadius,
  BrutalistShadows,
} from "../theme/brutalist.js";

// Import context
import { useApp } from "../contexts/AppContext.jsx";

const { width } = Dimensions.get("window");

const BrutalistHomePage = ({ navigation }) => {
  const { state, actions, helpers } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddType, setQuickAddType] = useState("task");
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [quickAddDescription, setQuickAddDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("work");
  const [showWidgets, setShowWidgets] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const todayStats =
    typeof helpers?.getTodayStats === "function"
      ? helpers.getTodayStats()
      : {
          tasksTotal: 0,
          tasksCompleted: 0,
          activitiesCount: 0,
          focusTime: 0,
          completionRate: 0,
        };

  const unreadNotifications =
    typeof helpers?.getUnreadNotificationsCount === "function"
      ? helpers.getUnreadNotificationsCount()
      : 0;

  const handleQuickAdd = () => {
    if (!quickAddTitle.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (quickAddType === "task") {
      actions.addTodo({
        title: quickAddTitle,
        description: quickAddDescription,
        priority: "medium",
        category: selectedCategory,
        tags: [],
      });

      actions.addNotification({
        title: "Task Added",
        message: `"${quickAddTitle}" has been added to your tasks`,
        type: "info",
      });
    } else {
      actions.addNote({
        title: quickAddTitle,
        content: quickAddDescription,
        category: selectedCategory,
        tags: [],
      });

      actions.addNotification({
        title: "Note Added",
        message: `"${quickAddTitle}" has been added to your notes`,
        type: "info",
      });
    }

    setQuickAddTitle("");
    setQuickAddDescription("");
    setShowQuickAddModal(false);
  };

  const handleCategoryFilter = (category) => {
    actions.setFilter("todos", { category: category.id });
    navigation.navigate("Todos");
  };

  const handleProjectTap = (project) => {
    navigation.navigate("ProjectDetail", { projectId: project.id });
  };

  const startQuickActivity = () => {
    const activityName = "Quick Focus Session";
    actions.startActivity({
      name: activityName,
      category: "work",
      description: "Impromptu focus session started from home screen",
    });

    actions.addNotification({
      title: "Activity Started",
      message: `Started "${activityName}" - stay focused!`,
      type: "info",
    });
  };

  const getTodayMeetings = () => {
    // Mock meetings for today - in real app this would come from calendar integration
    const meetings = [
      { time: "10:00", title: "Team standup", category: "work" },
      { time: "14:30", title: "Client review", category: "work" },
      { time: "16:00", title: "Project sync", category: "work" },
    ];

    return meetings;
  };

  const meetings = getTodayMeetings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <H1 style={styles.greeting}>
              {getGreeting()}, {state.user.name}
            </H1>
            <CaptionText style={styles.date}>
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </CaptionText>
          </View>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              { backgroundColor: showWidgets ? BrutalistColors.neon.cyber : BrutalistColors.neon.electric }
            ]}
            onPress={() => setShowWidgets(!showWidgets)}
          >
            <Ionicons
              name={showWidgets ? "grid" : "apps"}
              size={20}
              color="#000"
            />
          </TouchableOpacity>
        </View>

        {/* Content continues in same ScrollView */}
        {/* Toggle between Activity View and Widget View */}
        {showWidgets ? (
          <AdvancedWidgetSystem />
        ) : (
          <>
            {/* Toggle between Activity View and Widget View */}
            {showWidgets ? (
              <AdvancedWidgetSystem />
            ) : (
              <>
                {/* Main Activity Focus Section */}
        {state.currentActivity ? (
          /* Active Activity Hero */
          <View
            style={[
              styles.activityHeroCard,
              { backgroundColor: BrutalistColors.neon.electric },
            ]}
          >
            <View style={styles.activityHeroContent}>
              <View style={styles.activityStatusRow}>
                <View style={styles.statusIndicator} />
                <BodyText style={styles.activityStatusLabel}>
                  CURRENTLY ACTIVE
                </BodyText>
              </View>

              <H1 style={styles.activityHeroTitle}>
                {state.currentActivity.name}
              </H1>

              {state.currentActivity.expectedDuration && (
                <View style={styles.scheduleIndicator}>
                  <Ionicons name="calendar-outline" size={16} color="#000" />
                  <CaptionText style={styles.scheduleText}>
                    From Schedule
                  </CaptionText>
                </View>
              )}

              <View style={styles.activityTimeDisplay}>
                <H1 style={styles.activityTimer}>
                  {Math.floor(
                    (Date.now() - new Date(state.currentActivity.startTime)) /
                      60000,
                  )}
                  m
                </H1>
                <CaptionText style={styles.activityTimeLabel}>
                  Focus Time
                </CaptionText>
              </View>

              <TouchableOpacity
                style={styles.stopActivityButton}
                onPress={() => actions.stopActivity()}
              >
                <Ionicons name="stop" size={20} color="#000" />
                <BodyText style={styles.stopActivityText}>End Session</BodyText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Ready to Focus Hero */
          <View
            style={[
              styles.readyToFocusCard,
              { backgroundColor: BrutalistColors.neon.plasma },
            ]}
          >
            <View style={styles.readyToFocusContent}>
              <View style={styles.focusIconContainer}>
                <Ionicons name="flash" size={32} color="#000" />
              </View>

              <H1 style={styles.readyToFocusTitle}>Ready for Focus</H1>
              <CaptionText style={styles.readyToFocusSubtitle}>
                Your mind is clear. What would you like to accomplish?
              </CaptionText>

              <TouchableOpacity
                style={styles.startActivityButton}
                onPress={startQuickActivity}
              >
                <Ionicons name="play" size={20} color="#000" />
                <BodyText style={styles.startActivityText}>
                  Start Session
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: BrutalistColors.neon.volt },
            ]}
            onPress={() => navigation.navigate("Statistics")}
          >
            <H2 style={styles.statValue}>{todayStats.completionRate}%</H2>
            <CaptionText style={styles.statLabel}>Complete</CaptionText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: BrutalistColors.neon.cyber },
            ]}
            onPress={() => navigation.navigate("Activities")}
          >
            <H2 style={styles.statValue}>{todayStats.activitiesCount}</H2>
            <CaptionText style={styles.statLabel}>Sessions</CaptionText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: BrutalistColors.neon.volt },
            ]}
            onPress={() => navigation.navigate("Todos")}
          >
            <H2 style={styles.statValue}>{todayStats.tasksTotal}</H2>
            <CaptionText style={styles.statLabel}>Tasks</CaptionText>
          </TouchableOpacity>
        </View>

        {/* Secondary Actions */}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[
              styles.secondaryActionCard,
              { backgroundColor: BrutalistColors.neon.cyber },
            ]}
            onPress={() => navigation.navigate("Calendar")}
          >
            <Ionicons name="calendar" size={24} color="#000" />
            <View style={styles.secondaryActionContent}>
              <BodyText style={styles.secondaryActionTitle}>Schedule</BodyText>
              <CaptionText style={styles.secondaryActionSubtitle}>
                {meetings.length} meetings today
              </CaptionText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionCard,
              { backgroundColor: BrutalistColors.neon.volt },
            ]}
            onPress={() => {
              setQuickAddType("task");
              setShowQuickAddModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#000" />
            <View style={styles.secondaryActionContent}>
              <BodyText style={styles.secondaryActionTitle}>Quick Add</BodyText>
              <CaptionText style={styles.secondaryActionSubtitle}>
                Create task or note
              </CaptionText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>
        </View>

            {/* Categories Section */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <H2 style={styles.sectionTitle}>Categories</H2>
            <TouchableOpacity onPress={() => navigation.navigate("Todos")}>
              <CaptionText style={styles.seeAllText}>View All</CaptionText>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {state.categories.todos.slice(0, 4).map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Ionicons name={category.icon} size={20} color="#000" />
                <BodyText style={styles.categoryLabel}>
                  {category.label}
                </BodyText>
                <CaptionText style={styles.categoryCount}>
                  {
                    state.todos.filter(
                      (todo) =>
                        todo.category === category.id && !todo.completed,
                    ).length
                  }{" "}
                  tasks
                </CaptionText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <H2 style={styles.sectionTitle}>Recent Tasks</H2>
            <TouchableOpacity onPress={() => navigation.navigate("Todos")}>
              <CaptionText style={styles.seeAllText}>View All</CaptionText>
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            {state.todos.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() =>
                  navigation.navigate("TaskDetail", { taskId: task.id })
                }
              >
                <TouchableOpacity
                  style={[
                    styles.taskCheckbox,
                    task.completed && styles.taskCheckboxCompleted,
                  ]}
                  onPress={() => actions.toggleTodo(task.id)}
                >
                  {task.completed && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={BrutalistColors.neon.electric}
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <BodyText
                    style={[
                      styles.taskTitle,
                      task.completed && styles.taskTitleCompleted,
                    ]}
                  >
                    {task.title}
                  </BodyText>
                  <CaptionText style={styles.taskMeta}>
                    {
                      state.categories.todos.find(
                        (cat) => cat.id === task.category,
                      )?.label
                    }
                  </CaptionText>
                </View>

                <View
                  style={[
                    styles.priorityDot,
                    {
                      backgroundColor:
                        task.priority === "high"
                          ? BrutalistColors.neon.cyber
                          : task.priority === "medium"
                            ? BrutalistColors.neon.volt
                            : BrutalistColors.foundation.gray[400],
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Bar */}
        <TouchableOpacity
          style={styles.notificationBar}
          onPress={() => navigation.navigate("Notifications")}
        >
          <View style={styles.notificationContent}>
            <Ionicons name="notifications" size={20} color="#000" />
            <BodyText style={styles.notificationText}>Notifications</BodyText>
          </View>
          <View style={styles.notificationRight}>
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <CaptionText style={styles.notificationBadgeText}>
                  {unreadNotifications}
                </CaptionText>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </View>
        </TouchableOpacity>
            </>
          )}
        </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuickAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#000" />
      </TouchableOpacity>

      {/* Quick Add Modal */}
      <Modal
        visible={showQuickAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <H2 style={styles.modalTitle}>
              Quick Add {quickAddType === "task" ? "Task" : "Note"}
            </H2>
            <TouchableOpacity
              onPress={() => setShowQuickAddModal(false)}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={BrutalistColors.foundation.white}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  quickAddType === "task" && styles.typeOptionActive,
                ]}
                onPress={() => setQuickAddType("task")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={
                    quickAddType === "task"
                      ? "#000"
                      : BrutalistColors.foundation.white
                  }
                />
                <BodyText
                  style={[
                    styles.typeOptionText,
                    quickAddType === "task" && styles.typeOptionTextActive,
                  ]}
                >
                  Task
                </BodyText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  quickAddType === "note" && styles.typeOptionActive,
                ]}
                onPress={() => setQuickAddType("note")}
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color={
                    quickAddType === "note"
                      ? "#000"
                      : BrutalistColors.foundation.white
                  }
                />
                <BodyText
                  style={[
                    styles.typeOptionText,
                    quickAddType === "note" && styles.typeOptionTextActive,
                  ]}
                >
                  Note
                </BodyText>
              </TouchableOpacity>
            </View>

            {/* Title Input */}
            <View style={styles.inputSection}>
              <Label style={styles.inputLabel}>Title</Label>
              <TextInput
                style={styles.textInput}
                value={quickAddTitle}
                onChangeText={setQuickAddTitle}
                placeholder={`Enter ${quickAddType} title`}
                placeholderTextColor={BrutalistColors.foundation.gray[500]}
                autoFocus
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Label style={styles.inputLabel}>
                {quickAddType === "task" ? "Description" : "Content"} (Optional)
              </Label>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={quickAddDescription}
                onChangeText={setQuickAddDescription}
                placeholder={`Enter ${quickAddType} details`}
                placeholderTextColor={BrutalistColors.foundation.gray[500]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputSection}>
              <Label style={styles.inputLabel}>Category</Label>
              <View style={styles.categorySelector}>
                {state.categories[
                  quickAddType === "task" ? "todos" : "notes"
                ].map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === category.id && {
                        backgroundColor: category.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon}
                      size={16}
                      color={
                        selectedCategory === category.id
                          ? "#000"
                          : BrutalistColors.foundation.white
                      }
                    />
                    <BodyText
                      style={[
                        styles.categoryOptionText,
                        selectedCategory === category.id && { color: "#000" },
                      ]}
                    >
                      {category.label}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <HeroButton
                title={`ADD ${quickAddType.toUpperCase()}`}
                onPress={handleQuickAdd}
                style={styles.addButton}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrutalistColors.dark.primary,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 100, // Space for FAB
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  viewToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  greeting: {
    color: BrutalistColors.foundation.white,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  date: {
    color: BrutalistColors.foundation.gray[400],
    fontSize: 16,
  },

  // Activity Hero Card (Active State)
  activityHeroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  activityHeroContent: {
    alignItems: "center",
    width: "100%",
  },
  activityStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#000",
    marginRight: 8,
  },
  activityStatusLabel: {
    color: "#000",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  activityHeroTitle: {
    color: "#000",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 16,
  },
  activityTimeDisplay: {
    alignItems: "center",
    marginBottom: 20,
  },
  activityTimer: {
    color: "#000",
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 4,
  },
  activityTimeLabel: {
    color: "#000",
    fontSize: 14,
    opacity: 0.8,
  },
  stopActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  stopActivityText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },

  // Ready to Focus Card (Inactive State)
  readyToFocusCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  readyToFocusContent: {
    alignItems: "center",
    width: "100%",
  },
  focusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  readyToFocusTitle: {
    color: "#000",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  readyToFocusSubtitle: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 20,
  },
  startActivityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  startActivityText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
  scheduleIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginTop: 8,
  },
  scheduleText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
  },

  // Quick Stats Row
  quickStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    color: "#000",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    color: "#000",
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.8,
  },

  // Secondary Actions
  secondaryActions: {
    gap: 12,
    marginBottom: 24,
  },
  secondaryActionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  secondaryActionContent: {
    flex: 1,
  },
  secondaryActionTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  secondaryActionSubtitle: {
    color: "#000",
    fontSize: 12,
    opacity: 0.8,
  },

  // Keep existing styles for the rest
  leftColumn: {
    flex: 1,
    gap: 12,
  },

  // Schedule Card
  scheduleCard: {
    borderRadius: 20,
    padding: 20,
    height: 200,
  },
  cardTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  meetingsList: {
    flex: 1,
    gap: 12,
  },
  meetingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meetingTime: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 50,
  },
  meetingTitle: {
    color: "#000",
    fontSize: 12,
    opacity: 0.8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  cardFooterText: {
    color: "#000",
    fontSize: 12,
    opacity: 0.7,
  },

  // Activity Card
  activityCard: {
    borderRadius: 16,
    padding: 16,
    height: 90,
  },
  activityName: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  activityDuration: {
    color: "#000",
    fontSize: 20,
    fontWeight: "800",
  },
  activityPrompt: {
    color: "#000",
    fontSize: 12,
    opacity: 0.8,
  },

  // Stats Card
  statsCard: {
    borderRadius: 16,
    padding: 16,
    height: 90,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#000",
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: "#000",
    fontSize: 10,
    opacity: 0.7,
  },

  // Sections
  categoriesSection: {
    marginBottom: 32,
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },

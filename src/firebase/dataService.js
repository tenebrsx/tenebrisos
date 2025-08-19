// Firestore data service for cloud storage with localStorage fallback
import React from "react";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";
import { saveToStorage, loadFromStorage } from "../utils/helpers";

class DataService {
  constructor() {
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.pendingSyncs = new Map();
    this.listeners = new Map();

    // Setup online/offline listeners
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  // Set current user for data operations
  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      this.syncPendingData();
    }
  }

  // Check if cloud storage is available
  isCloudAvailable() {
    return isFirebaseConfigured() && this.currentUser && this.isOnline;
  }

  // Generic save method with cloud/local fallback
  async saveData(collection, data, options = {}) {
    const { merge = true, localKey } = options;

    try {
      if (this.isCloudAvailable()) {
        // Save to Firestore
        const docRef = doc(db, collection, this.currentUser.uid);
        await setDoc(
          docRef,
          {
            ...data,
            userId: this.currentUser.uid,
            updatedAt: serverTimestamp(),
            syncedAt: serverTimestamp(),
          },
          { merge },
        );

        // Also save to localStorage for offline access
        if (localKey) {
          saveToStorage(localKey, data);
        }

        // Remove from pending syncs if it was there
        this.pendingSyncs.delete(`${collection}_${localKey}`);

        return true;
      } else {
        // Save to localStorage and mark for sync
        if (localKey) {
          saveToStorage(localKey, data);

          // Mark for later sync when online
          this.pendingSyncs.set(`${collection}_${localKey}`, {
            collection,
            data,
            timestamp: Date.now(),
            options,
          });
        }

        return true;
      }
    } catch (error) {
      console.error(`Error saving ${collection}:`, error);

      // Fallback to localStorage
      if (localKey) {
        saveToStorage(localKey, data);
        this.pendingSyncs.set(`${collection}_${localKey}`, {
          collection,
          data,
          timestamp: Date.now(),
          options,
        });
      }

      return false;
    }
  }

  // Generic load method with cloud/local fallback
  async loadData(collection, localKey, defaultValue = null) {
    try {
      if (this.isCloudAvailable()) {
        // Try to load from Firestore first
        const docRef = doc(db, collection, this.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data();

          // Also update localStorage cache
          if (localKey && cloudData) {
            saveToStorage(localKey, cloudData);
          }

          return cloudData;
        }
      }

      // Fallback to localStorage
      return loadFromStorage(localKey, defaultValue);
    } catch (error) {
      console.error(`Error loading ${collection}:`, error);

      // Always fallback to localStorage
      return loadFromStorage(localKey, defaultValue);
    }
  }

  // Specific data type methods
  async saveActivities(activities) {
    return this.saveData(
      "activities",
      { activities },
      { localKey: "activities" },
    );
  }

  async loadActivities() {
    const result = await this.loadData("activities", "activities", []);
    const activities = result.activities || result || [];
    return Array.isArray(activities) ? activities : [];
  }

  async saveNotes(notes) {
    return this.saveData("notes", { notes }, { localKey: "notes" });
  }

  async loadNotes() {
    const result = await this.loadData("notes", "notes", []);
    const notes = result.notes || result || [];
    return Array.isArray(notes) ? notes : [];
  }

  async saveTodos(todos) {
    return this.saveData("todos", { todos }, { localKey: "todos" });
  }

  async loadTodos() {
    const result = await this.loadData("todos", "todos", []);
    const todos = result.todos || result || [];
    return Array.isArray(todos) ? todos : [];
  }

  async saveSchedule(schedule) {
    return this.saveData("schedule", { schedule }, { localKey: "schedule" });
  }

  async loadSchedule() {
    const result = await this.loadData("schedule", "schedule", {});
    const schedule = result.schedule || result || {};
    return typeof schedule === "object" && schedule !== null ? schedule : {};
  }

  async saveSettings(settings) {
    return this.saveData(
      "settings",
      { settings },
      { localKey: "tenebris-settings" },
    );
  }

  async loadSettings() {
    const result = await this.loadData("settings", "tenebris-settings", {});
    const settings = result.settings || result || {};
    return typeof settings === "object" && settings !== null ? settings : {};
  }

  async saveUserProfile(profile) {
    return this.saveData("users", profile, { localKey: "user-profile" });
  }

  async loadUserProfile() {
    const result = await this.loadData("users", "user-profile", {});
    return typeof result === "object" && result !== null ? result : {};
  }

  // Real-time listeners for data changes
  subscribeToActivities(callback) {
    if (!this.isCloudAvailable()) {
      // For offline mode, we can setup a localStorage listener
      const localData = loadFromStorage("activities", []);
      callback(localData);
      return () => {}; // No cleanup needed for localStorage
    }

    try {
      const docRef = doc(db, "activities", this.currentUser.uid);
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            callback(data.activities || []);

            // Update localStorage cache
            saveToStorage("activities", data.activities || []);
          } else {
            callback([]);
          }
        },
        (error) => {
          console.error("Activities subscription error:", error);
          // Fallback to localStorage
          const localData = loadFromStorage("activities", []);
          callback(localData);
        },
      );

      this.listeners.set("activities", unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up activities listener:", error);
      const localData = loadFromStorage("activities", []);
      callback(localData);
      return () => {};
    }
  }

  subscribeToNotes(callback) {
    if (!this.isCloudAvailable()) {
      const localData = loadFromStorage("notes", []);
      callback(localData);
      return () => {};
    }

    try {
      const docRef = doc(db, "notes", this.currentUser.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback(data.notes || []);
          saveToStorage("notes", data.notes || []);
        } else {
          callback([]);
        }
      });

      this.listeners.set("notes", unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up notes listener:", error);
      const localData = loadFromStorage("notes", []);
      callback(localData);
      return () => {};
    }
  }

  subscribeToTodos(callback) {
    if (!this.isCloudAvailable()) {
      const localData = loadFromStorage("todos", []);
      callback(localData);
      return () => {};
    }

    try {
      const docRef = doc(db, "todos", this.currentUser.uid);
      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback(data.todos || []);
          saveToStorage("todos", data.todos || []);
        } else {
          callback([]);
        }
      });

      this.listeners.set("todos", unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up todos listener:", error);
      const localData = loadFromStorage("todos", []);
      callback(localData);
      return () => {};
    }
  }

  // Handle online/offline state changes
  handleOnline() {
    this.isOnline = true;
    if (isFirebaseConfigured()) {
      enableNetwork(db);
      this.syncPendingData();
    }
  }

  handleOffline() {
    this.isOnline = false;
    if (isFirebaseConfigured()) {
      disableNetwork(db);
    }
  }

  // Sync pending data when coming back online or when user signs in
  async syncPendingData() {
    if (!this.isCloudAvailable() || this.pendingSyncs.size === 0) {
      return;
    }

    console.log(`Syncing ${this.pendingSyncs.size} pending changes...`);

    const syncPromises = Array.from(this.pendingSyncs.entries()).map(
      async ([key, syncData]) => {
        try {
          await this.saveData(
            syncData.collection,
            syncData.data,
            syncData.options,
          );
          this.pendingSyncs.delete(key);
          console.log(`Synced ${key} successfully`);
        } catch (error) {
          console.error(`Failed to sync ${key}:`, error);
        }
      },
    );

    await Promise.allSettled(syncPromises);

    if (this.pendingSyncs.size === 0) {
      console.log("All data synced successfully!");
    }
  }

  // Merge local and cloud data intelligently
  async mergeDataSources(collection, localKey) {
    if (!this.isCloudAvailable()) {
      return loadFromStorage(localKey, []);
    }

    try {
      const [cloudData, localData] = await Promise.all([
        this.loadData(collection, null, []),
        loadFromStorage(localKey, []),
      ]);

      // Merge logic based on data type
      const merged = this.intelligentMerge(cloudData, localData, collection);

      // Save merged data back to both sources
      saveToStorage(localKey, merged);
      await this.saveData(collection, { [collection]: merged }, { localKey });

      return merged;
    } catch (error) {
      console.error(`Error merging ${collection}:`, error);
      return loadFromStorage(localKey, []);
    }
  }

  // Intelligent merge based on timestamps and content
  intelligentMerge(cloudData, localData, dataType) {
    const cloud = cloudData[dataType] || cloudData || [];
    const local = localData || [];

    if (!Array.isArray(cloud) || !Array.isArray(local)) {
      return cloud.length > 0 ? cloud : local;
    }

    // Create a map of all items by ID
    const itemsMap = new Map();

    // Add cloud items first
    cloud.forEach((item) => {
      if (item.id) {
        itemsMap.set(item.id, { ...item, source: "cloud" });
      }
    });

    // Add local items, preferring newer timestamps
    local.forEach((item) => {
      if (item.id) {
        const existing = itemsMap.get(item.id);
        if (!existing) {
          itemsMap.set(item.id, { ...item, source: "local" });
        } else {
          // Compare timestamps and keep the newer one
          const existingTime = new Date(
            existing.updatedAt || existing.timestamp || 0,
          );
          const localTime = new Date(item.updatedAt || item.timestamp || 0);

          if (localTime > existingTime) {
            itemsMap.set(item.id, { ...item, source: "local" });
          }
        }
      }
    });

    // Convert back to array and sort by timestamp
    return Array.from(itemsMap.values()).sort((a, b) => {
      const aTime = new Date(a.timestamp || a.createdAt || 0);
      const bTime = new Date(b.timestamp || b.createdAt || 0);
      return bTime - aTime;
    });
  }

  // Import/Export functionality
  async exportUserData() {
    try {
      const exportData = {
        activities: await this.loadActivities(),
        notes: await this.loadNotes(),
        todos: await this.loadTodos(),
        schedule: await this.loadSchedule(),
        settings: await this.loadSettings(),
        profile: await this.loadUserProfile(),
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      return exportData;
    } catch (error) {
      console.error("Error exporting user data:", error);
      throw error;
    }
  }

  async importUserData(importData, options = { merge: true }) {
    try {
      const { merge } = options;

      if (merge) {
        // Merge with existing data
        if (importData.activities) {
          const existing = await this.loadActivities();
          const merged = this.intelligentMerge(
            { activities: importData.activities },
            existing,
            "activities",
          );
          await this.saveActivities(merged);
        }

        if (importData.notes) {
          const existing = await this.loadNotes();
          const merged = this.intelligentMerge(
            { notes: importData.notes },
            existing,
            "notes",
          );
          await this.saveNotes(merged);
        }

        if (importData.todos) {
          const existing = await this.loadTodos();
          const merged = this.intelligentMerge(
            { todos: importData.todos },
            existing,
            "todos",
          );
          await this.saveTodos(merged);
        }

        if (importData.schedule) {
          await this.saveSchedule(importData.schedule);
        }

        if (importData.settings) {
          await this.saveSettings(importData.settings);
        }
      } else {
        // Replace existing data
        if (importData.activities)
          await this.saveActivities(importData.activities);
        if (importData.notes) await this.saveNotes(importData.notes);
        if (importData.todos) await this.saveTodos(importData.todos);
        if (importData.schedule) await this.saveSchedule(importData.schedule);
        if (importData.settings) await this.saveSettings(importData.settings);
      }

      return true;
    } catch (error) {
      console.error("Error importing user data:", error);
      throw error;
    }
  }

  // Clear all user data (for account deletion)
  async clearUserData() {
    try {
      if (this.isCloudAvailable()) {
        // Delete from Firestore
        const collections = [
          "activities",
          "notes",
          "todos",
          "schedule",
          "settings",
        ];
        const deletePromises = collections.map((collection) =>
          deleteDoc(doc(db, collection, this.currentUser.uid)),
        );
        await Promise.allSettled(deletePromises);
      }

      // Clear localStorage
      const localKeys = [
        "activities",
        "notes",
        "todos",
        "schedule",
        "tenebris-settings",
        "user-profile",
      ];
      localKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear pending syncs
      this.pendingSyncs.clear();

      return true;
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  }

  // Batch operations for better performance
  async saveAllData(data) {
    const operations = [];

    if (data.activities) operations.push(this.saveActivities(data.activities));
    if (data.notes) operations.push(this.saveNotes(data.notes));
    if (data.todos) operations.push(this.saveTodos(data.todos));
    if (data.schedule) operations.push(this.saveSchedule(data.schedule));
    if (data.settings) operations.push(this.saveSettings(data.settings));

    const results = await Promise.allSettled(operations);
    const successful = results.filter(
      (result) => result.status === "fulfilled",
    ).length;

    return {
      total: operations.length,
      successful,
      failed: operations.length - successful,
    };
  }

  async loadAllData() {
    try {
      const [activities, notes, todos, schedule, settings, profile] =
        await Promise.all([
          this.loadActivities(),
          this.loadNotes(),
          this.loadTodos(),
          this.loadSchedule(),
          this.loadSettings(),
          this.loadUserProfile(),
        ]);

      return {
        activities,
        notes,
        todos,
        schedule,
        settings,
        profile,
        loadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error loading all data:", error);
      throw error;
    }
  }

  // Migration helper for existing localStorage users
  async migrateLocalDataToCloud() {
    if (!this.isCloudAvailable()) {
      console.warn("Cannot migrate: cloud storage not available");
      return false;
    }

    try {
      console.log("Migrating local data to cloud...");

      // Load all local data
      const localData = {
        activities: loadFromStorage("activities", []),
        notes: loadFromStorage("notes", []),
        todos: loadFromStorage("todos", []),
        schedule: loadFromStorage("schedule", {}),
        settings: loadFromStorage("tenebris-settings", {}),
        profile: loadFromStorage("user-profile", {}),
      };

      // Save to cloud
      const results = await this.saveAllData(localData);

      if (results.successful > 0) {
        console.log(
          `Successfully migrated ${results.successful}/${results.total} data types`,
        );

        // Mark migration as complete
        saveToStorage("migration-complete", {
          completedAt: new Date().toISOString(),
          migratedItems: results.successful,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Migration error:", error);
      return false;
    }
  }

  // Check if user needs migration
  needsMigration() {
    const migrationComplete = loadFromStorage("migration-complete", null);
    const hasLocalData =
      loadFromStorage("activities", []).length > 0 ||
      loadFromStorage("notes", []).length > 0 ||
      loadFromStorage("todos", []).length > 0;

    return !migrationComplete && hasLocalData && this.currentUser;
  }

  // Cleanup listeners
  unsubscribeAll() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      cloudAvailable: this.isCloudAvailable(),
      pendingSyncs: this.pendingSyncs.size,
      hasUser: !!this.currentUser,
      firebaseConfigured: isFirebaseConfigured(),
    };
  }

  // Force sync all data
  async forceSyncAll() {
    if (!this.isCloudAvailable()) {
      throw new Error("Cloud storage not available");
    }

    const allData = await this.loadAllData();
    return this.saveAllData(allData);
  }
}

// Create singleton instance
const dataService = new DataService();

export default dataService;

// Helper hooks for React components
export const useCloudStorage = () => {
  const [syncStatus, setSyncStatus] = React.useState(
    dataService.getSyncStatus(),
  );

  React.useEffect(() => {
    const updateStatus = () => setSyncStatus(dataService.getSyncStatus());

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return {
    syncStatus,
    saveActivities: dataService.saveActivities.bind(dataService),
    loadActivities: dataService.loadActivities.bind(dataService),
    saveNotes: dataService.saveNotes.bind(dataService),
    loadNotes: dataService.loadNotes.bind(dataService),
    saveTodos: dataService.saveTodos.bind(dataService),
    loadTodos: dataService.loadTodos.bind(dataService),
    saveSchedule: dataService.saveSchedule.bind(dataService),
    loadSchedule: dataService.loadSchedule.bind(dataService),
    exportData: dataService.exportUserData.bind(dataService),
    importData: dataService.importUserData.bind(dataService),
    forceSyncAll: dataService.forceSyncAll.bind(dataService),
  };
};

// Export for use in other components
export { dataService };

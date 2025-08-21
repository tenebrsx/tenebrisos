import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../firebase/config";
import { saveToStorage, loadFromStorage } from "../utils/helpers";
import { dataService } from "../firebase/dataService";

// Create Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn("Firebase not configured, using offline mode");
      setLoading(false);
      setInitialized(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Create/update user document in Firestore
          await createUserDocument(user);
          setCurrentUser(user);

          // Initialize data service with user
          dataService.setCurrentUser(user);

          // Check if user needs data migration from localStorage
          if (dataService.needsMigration()) {
            try {
              console.log("Migrating existing data to cloud...");
              await dataService.migrateLocalDataToCloud();
            } catch (error) {
              console.error("Migration failed:", error);
            }
          }

          saveToStorage("lastUser", {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            lastSignIn: new Date().toISOString(),
          });
        } else {
          setCurrentUser(null);

          // Cleanup data service
          dataService.setCurrentUser(null);
          dataService.unsubscribeAll();

          saveToStorage("lastUser", null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  // Create user document in Firestore
  const createUserDocument = async (user) => {
    if (!isFirebaseConfigured()) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          lastSignIn: serverTimestamp(),
          preferences: {
            theme: "dark",
            notifications: true,
            syncEnabled: true,
          },
          profile: {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          },
        });
      } else {
        // Update last sign in
        await setDoc(
          userRef,
          {
            lastSignIn: serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  // Sign up with email and password
  const signup = useCallback(async (email, password, displayName) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      setError(null);
      setLoading(true);

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Send email verification
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email and password
  const login = useCallback(async (email, password) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      setError(null);
      setLoading(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with Google
  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      setError(null);
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const { user } = await signInWithPopup(auth, provider);
      return user;
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed popup, don't show error
        return null;
      }
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      setError(null);

      // Cleanup data service before signing out
      dataService.unsubscribeAll();
      dataService.setCurrentUser(null);

      await signOut(auth);

      // Note: We keep local storage data so users can access their data offline
      // If you want to clear local data on logout, uncomment these lines:
      // saveToStorage('activities', []);
      // saveToStorage('notes', []);
      // saveToStorage('todos', []);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    if (!isFirebaseConfigured()) {
      throw new Error("Firebase not configured");
    }

    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(
    async (updates) => {
      if (!currentUser || !isFirebaseConfigured()) {
        throw new Error("No authenticated user or Firebase not configured");
      }

      try {
        setError(null);

        // Update Firebase Auth profile
        if (updates.displayName || updates.photoURL) {
          await updateProfile(currentUser, {
            displayName: updates.displayName || currentUser.displayName,
            photoURL: updates.photoURL || currentUser.photoURL,
          });
        }

        // Update Firestore user document
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(
          userRef,
          {
            ...updates,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [currentUser],
  );

  // Get user data from Firestore
  const getUserData = useCallback(async () => {
    if (!currentUser || !isFirebaseConfigured()) {
      return null;
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }, [currentUser]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = currentUser !== null;

  // Check if Firebase is available
  const isFirebaseAvailable = isFirebaseConfigured();

  // Get user display info
  const getUserDisplayInfo = useCallback(() => {
    if (!currentUser) return null;

    return {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName:
        currentUser.displayName || currentUser.email?.split("@")[0] || "User",
      photoURL: currentUser.photoURL,
      emailVerified: currentUser.emailVerified,
      isAnonymous: currentUser.isAnonymous,
    };
  }, [currentUser]);

  // Context value
  const value = {
    // State
    currentUser,
    loading,
    error,
    initialized,
    isAuthenticated,
    isFirebaseAvailable,

    // Methods
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    getUserData,
    getUserDisplayInfo,
    clearError,

    // Utilities
    createUserDocument,

    // Data service access
    dataService,
  };

  // Show loading state until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-text text-xl text-dark-text-muted">
            Initializing Tenebris OS...
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

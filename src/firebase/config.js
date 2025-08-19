// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// Replace these values with your actual Firebase project config
// You can find these in your Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAZ7VUQSRQMRMCbNmCDM5vrPV7YVKrIBt8",
  authDomain: "tenebrisos.firebaseapp.com",
  projectId: "tenebrisos",
  storageBucket: "tenebrisos.firebasestorage.app",
  messagingSenderId: "458724438703",
  appId: "1:458724438703:web:d9e27563f45430273c9a5a",
  measurementId: "G-9PEKRY1YEN",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in production)
export const analytics =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? getAnalytics(app)
    : null;

// Emulator connections disabled for better development experience
// To use emulators, manually uncomment the code below and ensure emulators are running
//
// if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
//   if (window.location.hostname === "localhost") {
//     try {
//       connectAuthEmulator(auth, "http://localhost:9099", {
//         disableWarnings: true,
//       });
//       connectFirestoreEmulator(db, "localhost", 8080);
//       console.log("Connected to Firebase emulators");
//     } catch (error) {
//       console.log("Emulator connection failed:", error.message);
//     }
//   }
// }

console.log("Using production Firebase services");

// Export the app instance
export default app;

// Configuration status check
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "your-api-key-here";
};

// Helper to check if we're in production
export const isProduction = () => {
  return (
    process.env.NODE_ENV === "production" &&
    window.location.hostname !== "localhost"
  );
};

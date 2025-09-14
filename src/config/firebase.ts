import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvIX7xzB0_mhTydOXf7SvPf4UkARW2ztc",
  authDomain: "nabhapharmacies.firebaseapp.com",
  projectId: "nabhapharmacies",
  storageBucket: "nabhapharmacies.firebasestorage.app",
  messagingSenderId: "334218651947",
  appId: "1:334218651947:web:de75bbd146280a1743fd6e",
  measurementId: "G-PK4LRE3TGY"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize Analytics (only in browser environment)
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create fallback objects to prevent crashes
  app = null;
  auth = null;
  db = null;
  storage = null;
  analytics = null;
}

export { auth, db, storage, analytics };

export default app;

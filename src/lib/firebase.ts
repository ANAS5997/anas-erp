// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is populated and valid
const hasValidConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "" && 
  !firebaseConfig.apiKey.includes("your_firebase_api_key");

let app;
let auth: any;
let googleProvider: any;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  } catch (error) {
    console.warn("Failed to initialize Firebase Auth:", error);
    // Fallback Mock
    auth = {} as any;
    googleProvider = {} as any;
  }
} else {
  // Mock fallback for build/development when credentials aren't set
  auth = {} as any;
  googleProvider = {} as any;
}

export { auth, googleProvider };
export default app;

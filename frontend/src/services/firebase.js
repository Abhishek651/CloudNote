/*
  Firebase initializer (frontend)

  Uses Vite environment variables (VITE_*) to initialize the modular Firebase SDK.
  Keeps secrets out of source by reading from import.meta.env.

  Exports:
    - app: initialized Firebase app
    - auth: Firebase Auth instance
    - db: Firestore instance
    - analytics: Analytics instance (optional)
*/

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
try {
  if (typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // Analytics may fail in some environments — ignore to avoid breaking app
}

export { app, auth, db, analytics };
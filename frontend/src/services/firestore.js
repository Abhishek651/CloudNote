/**
 * Frontend-only Firestore utilities for CloudNote
 * 
 * FRONTEND RESPONSIBILITIES:
 * - User profile management (direct Firestore access for user settings)
 * - Real-time authentication state
 * 
 * BACKEND RESPONSIBILITIES (via API):
 * - All notes CRUD operations
 * - All folders CRUD operations
 * - Data validation and security
 * - Server-side timestamps
 */
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

/**
 * Create or update a user profile document.
 * Frontend handles this directly for user preferences and settings.
 */
export async function createOrUpdateUserProfile(uid, profile) {
  if (!uid) throw new Error('uid is required');
  const ref = doc(db, 'users', uid);
  const payload = {
    displayName: profile.displayName || null,
    email: profile.email || null,
    photoURL: profile.photoURL || null,
    updatedAt: serverTimestamp(),
    createdAt: profile.createdAt || serverTimestamp(),
  };
  await setDoc(ref, payload, { merge: true });
  return { id: uid, ...payload };
}



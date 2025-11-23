import express from 'express';
import admin from '../config/firebase.js';
import logger from '../utils/logger.js';
import { verifyToken } from './auth.js';

const router = express.Router();
const db = admin.firestore();

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    logger.info('UsersAPI', 'Fetching profile', { userId: req.user.uid });

    const user = await admin.auth().getUser(req.user.uid);
    
    let profileData = {};
    try {
      const profileDoc = await db.collection('users').doc(req.user.uid).get();
      if (profileDoc.exists) {
        profileData = profileDoc.data();
      }
    } catch (error) {
      logger.warn('UsersAPI', 'Could not read profile from Firestore', { error: error.message });
    }

    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: profileData.displayName || user.displayName || '',
      photoURL: profileData.photoURL || user.photoURL || '',
      ...profileData
    };

    logger.info('UsersAPI', 'Profile fetched', { uid: user.uid });
    res.json(profile);
  } catch (error) {
    logger.error('UsersAPI', 'Error fetching profile', { error: error.message });
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { displayName, photoURL, theme } = req.body;
    logger.info('UsersAPI', 'Updating profile', { userId: req.user.uid });

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    
    if (photoURL !== undefined && photoURL && !photoURL.startsWith('data:')) {
      updateData.photoURL = photoURL;
    }

    if (Object.keys(updateData).length > 0) {
      await admin.auth().updateUser(req.user.uid, updateData);
    }

    const firestoreData = {
      displayName: displayName || '',
      theme: theme || 'default',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (photoURL && photoURL.startsWith('data:')) {
      firestoreData.photoURL = photoURL;
    } else if (photoURL) {
      firestoreData.photoURL = photoURL;
    }

    await db.collection('users').doc(req.user.uid).set(firestoreData, { merge: true });

    // Update all global notes with new display name and photoURL
    const globalNotesSnapshot = await db.collection('globalNotes')
      .where('authorId', '==', req.user.uid)
      .get();

    if (!globalNotesSnapshot.empty) {
      const batch = db.batch();
      const globalNotesUpdate = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (displayName !== undefined) {
        globalNotesUpdate.authorName = displayName || '';
      }

      if (photoURL !== undefined) {
        globalNotesUpdate.authorPhotoURL = firestoreData.photoURL || '';
      }

      if (Object.keys(globalNotesUpdate).length > 1) { // more than just timestamp
        globalNotesSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, globalNotesUpdate);
        });
        await batch.commit();
        logger.info('UsersAPI', 'Updated global notes with new profile info', { 
          uid: req.user.uid, 
          count: globalNotesSnapshot.docs.length 
        });
      }
    }

    logger.info('UsersAPI', 'Profile updated', { uid: req.user.uid });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('UsersAPI', 'Error updating profile', { error: error.message });
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

export default router;

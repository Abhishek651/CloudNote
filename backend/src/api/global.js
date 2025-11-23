import express from 'express';
import admin from '../config/firebase.js';
import logger from '../utils/logger.js';
import { verifyToken } from './auth.js';

const router = express.Router();
const db = admin.firestore();

const COLLECTIONS = {
  NOTES: 'notes',
  GLOBAL_NOTES: 'globalNotes',
  USERS: 'users',
};

/**
 * GET /api/global
 * Get all public global notes
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    logger.info('GlobalAPI', 'Fetching global notes', { limit });

    const snapshot = await db.collection(COLLECTIONS.GLOBAL_NOTES)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const globalNotes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    logger.info('GlobalAPI', 'Global notes fetched', { 
      count: globalNotes.length,
      firstNoteHasPhotoURL: globalNotes[0] ? !!globalNotes[0].authorPhotoURL : false,
      firstNoteAuthorName: globalNotes[0]?.authorName
    });
    res.json(globalNotes);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching global notes', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch global notes', details: error.message });
  }
});

/**
 * POST /api/global
 * Share a note to global feed
 * Body: { noteId }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { noteId } = req.body;
    logger.info('GlobalAPI', 'Sharing note to global', { noteId, userId: req.user.uid });

    if (!noteId) {
      return res.status(400).json({ error: 'Note ID is required' });
    }

    // Get the original note
    const noteDoc = await db.collection(COLLECTIONS.NOTES).doc(noteId).get();
    if (!noteDoc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = noteDoc.data();
    if (noteData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get user info
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    logger.info('GlobalAPI', 'User data for sharing', { 
      userId: req.user.uid, 
      displayName: userData.displayName,
      hasPhotoURL: !!userData.photoURL,
      photoURLLength: userData.photoURL?.length || 0
    });

    // Create global note
    const globalNoteData = {
      originalNoteId: noteId,
      title: noteData.title,
      content: noteData.content,
      authorId: req.user.uid,
      authorName: userData.displayName || req.user.email || 'Anonymous',
      authorPhotoURL: userData.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    logger.info('GlobalAPI', 'Creating global note with data', { 
      hasAuthorPhotoURL: !!globalNoteData.authorPhotoURL,
      authorName: globalNoteData.authorName
    });

    const docRef = await db.collection(COLLECTIONS.GLOBAL_NOTES).add(globalNoteData);

    logger.info('GlobalAPI', 'Note shared to global', { id: docRef.id });
    res.status(201).json({ id: docRef.id, message: 'Note shared to global feed' });
  } catch (error) {
    logger.error('GlobalAPI', 'Error sharing note to global', { error: error.message });
    res.status(500).json({ error: 'Failed to share note', details: error.message });
  }
});

/**
 * GET /api/global/:id
 * Get a single global note by ID (public access)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('GlobalAPI', 'Fetching global note', { id });

    const doc = await db.collection(COLLECTIONS.GLOBAL_NOTES).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Global note not found' });
    }

    const note = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    };

    logger.info('GlobalAPI', 'Global note fetched', { id });
    res.json(note);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching global note', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch global note', details: error.message });
  }
});

/**
 * GET /api/global/check/:noteId
 * Check if a note is shared globally
 */
router.get('/check/:noteId', verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const snapshot = await db.collection(COLLECTIONS.GLOBAL_NOTES)
      .where('originalNoteId', '==', noteId)
      .where('authorId', '==', req.user.uid)
      .get();

    res.json({ isGlobal: !snapshot.empty });
  } catch (error) {
    logger.error('GlobalAPI', 'Error checking global status', { error: error.message });
    res.status(500).json({ error: 'Failed to check global status', details: error.message });
  }
});

/**
 * DELETE /api/global/:noteId
 * Remove a note from global feed
 */
router.delete('/:noteId', verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    logger.info('GlobalAPI', 'Removing note from global', { noteId, userId: req.user.uid });

    // Find and delete the global note by originalNoteId
    const snapshot = await db.collection(COLLECTIONS.GLOBAL_NOTES)
      .where('originalNoteId', '==', noteId)
      .where('authorId', '==', req.user.uid)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Global note not found' });
    }

    // Delete all matching global notes (should be only one)
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    logger.info('GlobalAPI', 'Note removed from global', { noteId });
    res.json({ message: 'Note removed from global feed' });
  } catch (error) {
    logger.error('GlobalAPI', 'Error removing note from global', { error: error.message });
    res.status(500).json({ error: 'Failed to remove note from global', details: error.message });
  }
});

export default router;
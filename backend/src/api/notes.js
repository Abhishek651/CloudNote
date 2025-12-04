import express from 'express';
import { body, query, validationResult } from 'express-validator';
import admin from '../config/firebase.js';
import logger from '../utils/logger.js';
import { verifyToken } from './auth.js';

// Validation middleware to check for errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('[VALIDATION DEBUG] Validation errors:', errors.array());
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
}

const router = express.Router();
const db = admin.firestore();

// Collection constants (must match frontend)
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  FOLDERS: 'folders',
  SHARED: 'shared',
};

/**
 * GET /api/notes
 * Get all notes for authenticated user with optional filtering
 * Query params: 
 *   - folderId (optional): Filter by folder
 *   - isArchived (optional, true/false): Filter archived status
 *   - tags (optional, comma-separated): Filter by tags (any tag match)
 *   - limit (default 100): Max results
 *   - fromDate (optional): ISO date string for notes updated after this date
 *   - toDate (optional): ISO date string for notes updated before this date
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { folderId, isArchived, isFavorite, tags, limit = 100, fromDate, toDate, sortBy = 'updatedAt' } = req.query;
    console.log('[NOTES DEBUG] Fetching notes request:', {
      userId: req.user?.uid,
      query: req.query,
      headers: Object.keys(req.headers)
    });
    
    logger.info('NotesAPI', 'Fetching notes', { 
      userId: req.user.uid, 
      folderId, 
      isArchived,
      isFavorite, 
      tags, 
      limit: parseInt(limit),
      fromDate,
      toDate,
      sortBy
    });

    console.log('[NOTES DEBUG] Building Firestore query...');
    // Build the base query with ownerId filter
    let query = db.collection(COLLECTIONS.NOTES).where('ownerId', '==', req.user.uid);

    console.log('[NOTES DEBUG] Executing Firestore query...');
    const snapshot = await query.get();
    console.log('[NOTES DEBUG] Firestore query completed, docs found:', snapshot.docs.length);

    let notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    console.log('[NOTES DEBUG] Raw notes count:', notes.length);

    // Server-side filtering and sorting
    const archivedBool = isArchived === 'true' || isArchived === true;
    notes = notes.filter(note => (note.isArchived || false) === archivedBool);
    console.log('[NOTES DEBUG] After archive filter:', notes.length);

    if (folderId && folderId !== 'null') {
      notes = notes.filter(note => note.folderId === folderId);
      console.log('[NOTES DEBUG] After folder filter:', notes.length);
    } else if (folderId === null || folderId === 'null') {
      notes = notes.filter(note => !note.folderId || note.folderId === null);
      console.log('[NOTES DEBUG] After root folder filter:', notes.length);
    } else {
      // If no folderId specified, exclude folder notes by default
      notes = notes.filter(note => !note.folderId || note.folderId === null);
      console.log('[NOTES DEBUG] After excluding folder notes:', notes.length);
    }

    if (isFavorite !== undefined) {
      const favoriteBool = isFavorite === 'true' || isFavorite === true;
      notes = notes.filter(note => (note.isFavorite || false) === favoriteBool);
      console.log('[NOTES DEBUG] After favorite filter:', notes.length);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      notes = notes.filter(note => new Date(note.updatedAt) >= from);
      console.log('[NOTES DEBUG] After fromDate filter:', notes.length);
    }

    if (toDate) {
      const to = new Date(toDate);
      notes = notes.filter(note => new Date(note.updatedAt) <= to);
      console.log('[NOTES DEBUG] After toDate filter:', notes.length);
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      notes = notes.filter(note => 
        note.tags && Array.isArray(note.tags) && 
        tagArray.some(tag => note.tags.includes(tag))
      );
      console.log('[NOTES DEBUG] After tags filter:', notes.length);
    }

    // Sort by specified field
    const sortField = sortBy === 'createdAt' ? 'createdAt' : 'updatedAt';
    notes.sort((a, b) => new Date(b[sortField]) - new Date(a[sortField]));

    // Apply limit after filtering and sorting
    const limitedNotes = notes.slice(0, parseInt(limit));
    console.log('[NOTES DEBUG] Final notes count after limit:', limitedNotes.length);

    logger.info('NotesAPI', 'Notes fetched', { count: limitedNotes.length });
    res.json(limitedNotes);
  } catch (error) {
    console.error('[NOTES DEBUG] Error in GET /notes:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      userId: req.user?.uid
    });
    logger.error('NotesAPI', 'Error fetching notes', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
  }
});

/**
 * GET /api/notes/shared/:shareToken
 * Get note by share token (public access with auth requirement)
 * IMPORTANT: This must come BEFORE /:id route
 */
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;
    logger.info('NotesAPI', 'Fetching note by share token', { shareToken });

    const snapshot = await db.collection(COLLECTIONS.NOTES)
      .where('shareToken', '==', shareToken)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Shared note not found' });
    }

    const doc = snapshot.docs[0];
    const noteData = doc.data();
    
    // Get author info
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(noteData.ownerId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    const note = {
      id: doc.id,
      ...noteData,
      authorName: userData.displayName || 'Anonymous',
      authorPhotoURL: userData.photoURL || null,
      createdAt: noteData.createdAt?.toDate(),
      updatedAt: noteData.updatedAt?.toDate(),
      requiresAuth: true,
    };

    logger.info('NotesAPI', 'Shared note fetched', { shareToken });
    res.json(note);
  } catch (error) {
    logger.error('NotesAPI', 'Error fetching shared note', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch shared note', details: error.message });
  }
});

/**
 * GET /api/notes/:id
 * Get a single note by ID (verify ownership)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('NotesAPI', 'Fetching note', { id, userId: req.user.uid });

    const doc = await db.collection(COLLECTIONS.NOTES).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const data = doc.data();

    // Verify ownership
    if (data.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const note = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };

    logger.info('NotesAPI', 'Note fetched', { id });
    res.json(note);
  } catch (error) {
    logger.error('NotesAPI', 'Error fetching note', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch note', details: error.message });
  }
});

/**
 * POST /api/notes
 * Create new note
 * Body: { title?, content?, folderId?, tags? }
 * Validation: title max 200, content max 50KB, tags max 20, each tag max 30
 */
router.post(
  '/',
  verifyToken,
  [
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('content')
      .optional()
      .isString()
      .custom((value) => {
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > 1048576) { // 1MB max
          throw new Error('Content must be less than 1MB');
        }
        return true;
      }),
    body('fileUrl')
      .optional({ nullable: true })
      .isString()
      .custom((value) => {
        if (!value) return true;
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > 1048576) { // 1MB max for base64 string
          throw new Error('File size must be less than ~700KB');
        }
        return true;
      }),
    body('tags')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Maximum 20 tags allowed')
      .custom((value) => {
        if (!Array.isArray(value)) return true;
        return value.every(tag => typeof tag === 'string' && tag.length <= 30);
      })
      .withMessage('Each tag must be a string with max 30 characters'),
    body('folderId')
      .optional({ nullable: true })
      .custom((value) => {
        if (value === null || value === undefined || typeof value === 'string') {
          return true;
        }
        throw new Error('FolderId must be a string or null');
      }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title = 'Untitled Note', content = '', folderId = null, tags = [] } = req.body;
      console.log('[NOTES DEBUG] Creating note:', {
        userId: req.user?.uid,
        title,
        folderId,
        tagsCount: Array.isArray(tags) ? tags.length : 0
      });
      
      logger.info('NotesAPI', 'Creating note', { userId: req.user.uid, title });

      // If folderId provided, verify it exists and belongs to user
      if (folderId) {
        console.log('[NOTES DEBUG] Verifying folder:', folderId);
        const folderDoc = await db.collection(COLLECTIONS.FOLDERS).doc(folderId).get();
        if (!folderDoc.exists) {
          console.log('[NOTES DEBUG] Folder not found:', folderId);
          return res.status(404).json({ error: 'Folder not found' });
        }
        if (folderDoc.data().ownerId !== req.user.uid) {
          console.log('[NOTES DEBUG] Folder ownership mismatch');
          return res.status(403).json({ error: 'Unauthorized - folder does not belong to user' });
        }
        console.log('[NOTES DEBUG] Folder verified successfully');
      }

      const noteData = {
        ownerId: req.user.uid,
        title,
        content,
        folderId,
        tags: Array.isArray(tags) ? tags : [],
        isArchived: false,
        isFavorite: false,
        isGlobal: false,
        type: req.body.type || 'text',
        fileUrl: req.body.fileUrl || null,
        fileName: req.body.fileName || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      console.log('[NOTES DEBUG] Adding note to Firestore...');
      const docRef = await db.collection(COLLECTIONS.NOTES).add(noteData);
      console.log('[NOTES DEBUG] Note created with ID:', docRef.id);

      const newNote = {
        id: docRef.id,
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info('NotesAPI', 'Note created', { id: docRef.id });
      res.status(201).json(newNote);
    } catch (error) {
      console.error('[NOTES DEBUG] Error creating note:', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        userId: req.user?.uid
      });
      logger.error('NotesAPI', 'Error creating note', { error: error.message });
      res.status(500).json({ error: 'Failed to create note', details: error.message });
    }
  }
);

/**
 * PUT /api/notes/:id
 * Update note (verify ownership)
 * Body: { title?, content?, folderId?, tags?, isArchived? }
 * Validation: title max 200, content max 50KB, tags max 20, each tag max 30
 */
router.put(
  '/:id',
  verifyToken,
  [
    body('title')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('content')
      .optional()
      .isString()
      .custom((value) => {
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > 1048576) { // 1MB max
          throw new Error('Content must be less than 1MB');
        }
        return true;
      }),
    body('fileUrl')
      .optional({ nullable: true })
      .isString()
      .custom((value) => {
        if (!value) return true;
        const sizeInBytes = new TextEncoder().encode(value).length;
        if (sizeInBytes > 1048576) { // 1MB max for base64 string
          throw new Error('File size must be less than ~700KB');
        }
        return true;
      }),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, folderId, tags, isArchived } = req.body;
      logger.info('NotesAPI', 'Updating note', { id, userId: req.user.uid });

      const noteRef = db.collection(COLLECTIONS.NOTES).doc(id);
      const doc = await noteRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Verify ownership
      if (doc.data().ownerId !== req.user.uid) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // If folderId provided, verify it exists and belongs to user
      if (folderId !== undefined && folderId !== null) {
        const folderDoc = await db.collection(COLLECTIONS.FOLDERS).doc(folderId).get();
        if (!folderDoc.exists) {
          return res.status(404).json({ error: 'Folder not found' });
        }
        if (folderDoc.data().ownerId !== req.user.uid) {
          return res.status(403).json({ error: 'Unauthorized - folder does not belong to user' });
        }
      }

      const updates = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Only update fields that are provided
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (folderId !== undefined) updates.folderId = folderId;
      if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
      if (isArchived !== undefined) updates.isArchived = isArchived;
      if (req.body.isFavorite !== undefined) updates.isFavorite = req.body.isFavorite;
      if (req.body.isGlobal !== undefined) updates.isGlobal = req.body.isGlobal;
      if (req.body.type !== undefined) updates.type = req.body.type;
      if (req.body.fileUrl !== undefined) updates.fileUrl = req.body.fileUrl;
      if (req.body.fileName !== undefined) updates.fileName = req.body.fileName;

      await noteRef.update(updates);

      // Auto-sync to global if shared
      try {
        const globalSnapshot = await db.collection('globalNotes')
          .where('originalNoteId', '==', id)
          .where('authorId', '==', req.user.uid)
          .get();

        if (!globalSnapshot.empty) {
          const globalUpdates = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (title !== undefined) globalUpdates.title = title;
          if (content !== undefined) globalUpdates.content = content;
          if (req.body.type !== undefined) globalUpdates.type = req.body.type;
          if (req.body.fileUrl !== undefined) globalUpdates.fileUrl = req.body.fileUrl;
          if (req.body.fileName !== undefined) globalUpdates.fileName = req.body.fileName;

          const batch = db.batch();
          globalSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, globalUpdates);
          });
          await batch.commit();
          logger.info('NotesAPI', 'Auto-synced note to global', { id });
        }
      } catch (syncError) {
        logger.error('NotesAPI', 'Error auto-syncing note', { error: syncError.message });
      }

      logger.info('NotesAPI', 'Note updated', { id });
      res.json({ message: 'Note updated successfully', id });
    } catch (error) {
      logger.error('NotesAPI', 'Error updating note', { error: error.message });
      res.status(500).json({ error: 'Failed to update note', details: error.message });
    }
  }
);

/**
 * DELETE /api/notes/:id
 * Delete note (verify ownership)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('NotesAPI', 'Deleting note', { id, userId: req.user.uid });

    const noteRef = db.collection(COLLECTIONS.NOTES).doc(id);
    const doc = await noteRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify ownership
    if (doc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await noteRef.delete();

    logger.info('NotesAPI', 'Note deleted', { id });
    res.json({ message: 'Note deleted successfully', id });
  } catch (error) {
    logger.error('NotesAPI', 'Error deleting note', { error: error.message });
    res.status(500).json({ error: 'Failed to delete note', details: error.message });
  }
});

/**
 * POST /api/notes/:id/share
 * Generate or get share token for a note (private sharing without global)
 */
router.post('/:id/share', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('NotesAPI', 'Generating share token', { id, userId: req.user.uid });

    const noteRef = db.collection(COLLECTIONS.NOTES).doc(id);
    const doc = await noteRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const noteData = doc.data();
    
    // Verify ownership
    if (noteData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate share token if not exists
    let shareToken = noteData.shareToken;
    if (!shareToken) {
      shareToken = `${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await noteRef.update({
        shareToken,
        sharedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    logger.info('NotesAPI', 'Share token generated', { id, shareToken });
    res.json({ shareToken, message: 'Share token generated' });
  } catch (error) {
    logger.error('NotesAPI', 'Error generating share token', { error: error.message });
    res.status(500).json({ error: 'Failed to generate share token', details: error.message });
  }
});

export default router;
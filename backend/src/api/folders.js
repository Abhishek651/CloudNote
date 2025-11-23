import express from 'express';
import admin from '../config/firebase.js';
import logger from '../utils/logger.js';
import { verifyToken } from './auth.js';

const router = express.Router();
const db = admin.firestore();

// Collection constants
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  FOLDERS: 'folders',
  SHARED: 'shared',
};

/**
 * GET /api/folders
 * Get all folders for authenticated user
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { parentId = null } = req.query;
    console.log('[FOLDERS DEBUG] Fetching folders request:', {
      userId: req.user?.uid,
      parentId,
      query: req.query
    });
    
    logger.info('FoldersAPI', 'Fetching folders', { userId: req.user.uid, parentId });

    console.log('[FOLDERS DEBUG] Building Firestore query...');
    let query = db.collection(COLLECTIONS.FOLDERS).where('ownerId', '==', req.user.uid);

    if (parentId) {
      query = query.where('parentId', '==', parentId);
      console.log('[FOLDERS DEBUG] Added parentId filter:', parentId);
    } else {
      query = query.where('parentId', '==', null);
      console.log('[FOLDERS DEBUG] Added parentId null filter');
    }

    console.log('[FOLDERS DEBUG] Executing Firestore query...');
    const snapshot = await query.get();
    console.log('[FOLDERS DEBUG] Firestore query completed, docs found:', snapshot.docs.length);

    const folders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    console.log('[FOLDERS DEBUG] Processed folders:', folders.length);
    logger.info('FoldersAPI', 'Folders fetched', { count: folders.length });
    res.json(folders);
  } catch (error) {
    console.error('[FOLDERS DEBUG] Error in GET /folders:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      userId: req.user?.uid
    });
    logger.error('FoldersAPI', 'Error fetching folders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch folders', details: error.message });
  }
});

/**
 * POST /api/folders
 * Create new folder
 * Body: { name, parentId? (null for root) }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name = 'New Folder', parentId = null } = req.body;
    console.log('[FOLDERS DEBUG] Creating folder:', {
      userId: req.user?.uid,
      name,
      parentId
    });

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      console.log('[FOLDERS DEBUG] Invalid folder name');
      return res.status(400).json({ error: 'Folder name is required' });
    }

    if (name.length > 100) {
      console.log('[FOLDERS DEBUG] Folder name too long');
      return res.status(400).json({ error: 'Folder name must be less than 100 characters' });
    }

    logger.info('FoldersAPI', 'Creating folder', { userId: req.user.uid, name, parentId });

    // If parentId provided, verify it belongs to user
    if (parentId) {
      console.log('[FOLDERS DEBUG] Verifying parent folder:', parentId);
      const parentFolder = await db.collection(COLLECTIONS.FOLDERS).doc(parentId).get();
      if (!parentFolder.exists) {
        console.log('[FOLDERS DEBUG] Parent folder not found');
        return res.status(404).json({ error: 'Parent folder not found' });
      }
      if (parentFolder.data().ownerId !== req.user.uid) {
        console.log('[FOLDERS DEBUG] Parent folder ownership mismatch');
        return res.status(403).json({ error: 'Unauthorized' });
      }
      console.log('[FOLDERS DEBUG] Parent folder verified');
    }

    const folderData = {
      ownerId: req.user.uid,
      name: name.trim(),
      parentId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log('[FOLDERS DEBUG] Adding folder to Firestore...');
    const docRef = await db.collection(COLLECTIONS.FOLDERS).add(folderData);
    console.log('[FOLDERS DEBUG] Folder created with ID:', docRef.id);

    const newFolder = {
      id: docRef.id,
      ...folderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    logger.info('FoldersAPI', 'Folder created', { id: docRef.id });
    res.status(201).json(newFolder);
  } catch (error) {
    console.error('[FOLDERS DEBUG] Error creating folder:', {
      error: error.message,
      code: error.code,
      stack: error.stack,
      userId: req.user?.uid
    });
    logger.error('FoldersAPI', 'Error creating folder', { error: error.message });
    res.status(500).json({ error: 'Failed to create folder', details: error.message });
  }
});

/**
 * PUT /api/folders/:id
 * Update folder (verify ownership)
 * Body: { name?, parentId? }
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    logger.info('FoldersAPI', 'Updating folder', { id, userId: req.user.uid });

    const folderRef = db.collection(COLLECTIONS.FOLDERS).doc(id);
    const doc = await folderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folderData = doc.data();
    
    // Verify ownership with proper validation
    if (!folderData || !folderData.ownerId || folderData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Folder name is required' });
      }
      if (name.length > 100) {
        return res.status(400).json({ error: 'Folder name must be less than 100 characters' });
      }
      updates.name = name.trim();
    }

    if (parentId !== undefined) {
      // Prevent circular references (folder cannot be its own parent or contain itself)
      if (parentId === id) {
        return res.status(400).json({ error: 'Folder cannot be its own parent' });
      }
      if (parentId) {
        const parentFolder = await db.collection(COLLECTIONS.FOLDERS).doc(parentId).get();
        if (!parentFolder.exists) {
          return res.status(404).json({ error: 'Parent folder not found' });
        }
        if (parentFolder.data().ownerId !== req.user.uid) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
      }
      updates.parentId = parentId;
    }

    await folderRef.update(updates);

    logger.info('FoldersAPI', 'Folder updated', { id });
    res.json({ message: 'Folder updated successfully', id });
  } catch (error) {
    logger.error('FoldersAPI', 'Error updating folder', { error: error.message });
    res.status(500).json({ error: 'Failed to update folder', details: error.message });
  }
});

/**
 * GET /api/folders/:id
 * Get single folder by ID (verify ownership)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('FoldersAPI', 'Fetching folder', { id, userId: req.user.uid });

    const doc = await db.collection(COLLECTIONS.FOLDERS).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const data = doc.data();

    // Verify ownership with proper validation
    if (!data || !data.ownerId || data.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const folder = {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
    };

    logger.info('FoldersAPI', 'Folder fetched', { id });
    res.json(folder);
  } catch (error) {
    logger.error('FoldersAPI', 'Error fetching folder', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch folder', details: error.message });
  }
});

/**
 * DELETE /api/folders/:id
 * Delete folder and all notes within it (verify ownership)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('FoldersAPI', 'Deleting folder', { id, userId: req.user.uid });

    const folderRef = db.collection(COLLECTIONS.FOLDERS).doc(id);
    const doc = await folderRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folderData = doc.data();
    
    // Verify ownership with proper validation
    if (!folderData || !folderData.ownerId || folderData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete all notes in this folder
    const notesSnapshot = await db.collection(COLLECTIONS.NOTES).where('folderId', '==', id).get();
    const batch = db.batch();

    notesSnapshot.docs.forEach(noteDoc => {
      batch.delete(noteDoc.ref);
    });

    // Delete the folder itself
    batch.delete(folderRef);

    await batch.commit();

    logger.info('FoldersAPI', 'Folder deleted', { id, notesDeleted: notesSnapshot.docs.length });
    res.json({ message: 'Folder deleted successfully', id, notesDeleted: notesSnapshot.docs.length });
  } catch (error) {
    logger.error('FoldersAPI', 'Error deleting folder', { error: error.message });
    res.status(500).json({ error: 'Failed to delete folder', details: error.message });
  }
});

export default router;
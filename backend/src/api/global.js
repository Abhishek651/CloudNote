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
  FOLDERS: 'folders',
  GLOBAL_FOLDERS: 'globalFolders',
};

/**
 * GET /api/global
 * Get all public global notes and folders
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    logger.info('GlobalAPI', 'Fetching global items', { limit });

    const notesSnapshot = await db.collection(COLLECTIONS.GLOBAL_NOTES)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const foldersSnapshot = await db.collection(COLLECTIONS.GLOBAL_FOLDERS)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const globalNotes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      itemType: 'note',
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    const globalFolders = foldersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      itemType: 'folder',
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    const allItems = [...globalNotes, ...globalFolders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, parseInt(limit));

    logger.info('GlobalAPI', 'Global items fetched', { notes: globalNotes.length, folders: globalFolders.length });
    res.json(allItems);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching global items', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch global items', details: error.message });
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
      type: noteData.type,
      fileUrl: noteData.fileUrl,
      fileName: noteData.fileName,
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

/**
 * POST /api/global/folder
 * Share folder to global feed with complete hierarchy
 * Body: { folderId }
 */
router.post('/folder', verifyToken, async (req, res) => {
  try {
    const { folderId } = req.body;
    logger.info('GlobalAPI', 'Sharing folder to global', { folderId, userId: req.user.uid });

    if (!folderId) {
      return res.status(400).json({ error: 'Folder ID is required' });
    }

    // Get folder
    const folderDoc = await db.collection(COLLECTIONS.FOLDERS).doc(folderId).get();
    if (!folderDoc.exists) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folderData = folderDoc.data();
    if (folderData.ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already shared
    const existingGlobal = await db.collection(COLLECTIONS.GLOBAL_FOLDERS)
      .where('originalFolderId', '==', folderId)
      .where('authorId', '==', req.user.uid)
      .get();

    if (!existingGlobal.empty) {
      return res.status(400).json({ error: 'Folder already shared to global' });
    }

    // Get user info
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Recursive function to build folder structure
    const buildFolderStructure = async (parentId) => {
      const structure = { folders: [], notes: [] };
      
      // Get subfolders
      const subfoldersSnapshot = await db.collection(COLLECTIONS.FOLDERS)
        .where('parentId', '==', parentId)
        .where('ownerId', '==', req.user.uid)
        .get();
      
      for (const subfolderDoc of subfoldersSnapshot.docs) {
        const subfolderData = subfolderDoc.data();
        const subStructure = await buildFolderStructure(subfolderDoc.id);
        structure.folders.push({
          id: subfolderDoc.id,
          name: subfolderData.name,
          ...subStructure
        });
      }
      
      // Get notes
      const notesSnapshot = await db.collection(COLLECTIONS.NOTES)
        .where('folderId', '==', parentId)
        .where('ownerId', '==', req.user.uid)
        .get();
      
      structure.notes = notesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return structure;
    };

    const folderStructure = await buildFolderStructure(folderId);
    
    // Count total notes recursively
    const countNotes = (structure) => {
      let count = structure.notes.length;
      structure.folders.forEach(folder => {
        count += countNotes(folder);
      });
      return count;
    };

    const totalNotes = countNotes(folderStructure);

    // Create global folder
    const globalFolderData = {
      originalFolderId: folderId,
      name: folderData.name,
      noteCount: totalNotes,
      structure: folderStructure,
      authorId: req.user.uid,
      authorName: userData.displayName || req.user.email || 'Anonymous',
      authorPhotoURL: userData.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTIONS.GLOBAL_FOLDERS).add(globalFolderData);

    logger.info('GlobalAPI', 'Folder shared to global', { id: docRef.id, totalNotes });
    res.status(201).json({ id: docRef.id, message: 'Folder shared to global feed' });
  } catch (error) {
    logger.error('GlobalAPI', 'Error sharing folder to global', { error: error.message });
    res.status(500).json({ error: 'Failed to share folder', details: error.message });
  }
});

/**
 * DELETE /api/global/folder/:folderId
 * Remove a folder from global feed
 */
router.delete('/folder/:folderId', verifyToken, async (req, res) => {
  try {
    const { folderId } = req.params;
    logger.info('GlobalAPI', 'Removing folder from global', { folderId, userId: req.user.uid });

    const snapshot = await db.collection(COLLECTIONS.GLOBAL_FOLDERS)
      .where('originalFolderId', '==', folderId)
      .where('authorId', '==', req.user.uid)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Global folder not found' });
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    logger.info('GlobalAPI', 'Folder removed from global', { folderId });
    res.json({ message: 'Folder removed from global feed' });
  } catch (error) {
    logger.error('GlobalAPI', 'Error removing folder from global', { error: error.message });
    res.status(500).json({ error: 'Failed to remove folder from global', details: error.message });
  }
});

/**
 * GET /api/global/folders/:id
 * Get a global folder by ID
 */
router.get('/folders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTIONS.GLOBAL_FOLDERS).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Global folder not found' });
    }

    const folder = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    };

    res.json(folder);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching global folder', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch global folder', details: error.message });
  }
});

/**
 * GET /api/global/folders/:id/notes
 * Get all notes in a global folder
 */
router.get('/folders/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get global folder
    const folderDoc = await db.collection(COLLECTIONS.GLOBAL_FOLDERS).doc(id).get();
    if (!folderDoc.exists) {
      return res.status(404).json({ error: 'Global folder not found' });
    }

    const folderData = folderDoc.data();
    const originalFolderId = folderData.originalFolderId;

    // Get notes from original folder
    const notesSnapshot = await db.collection(COLLECTIONS.NOTES)
      .where('folderId', '==', originalFolderId)
      .get();

    const notes = notesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
    }));

    res.json(notes);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching folder notes', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch folder notes', details: error.message });
  }
});

/**
 * GET /api/global/folders/:id/subfolders
 * Get all subfolders in a global folder
 */
router.get('/folders/:id/subfolders', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get global folder
    const folderDoc = await db.collection(COLLECTIONS.GLOBAL_FOLDERS).doc(id).get();
    if (!folderDoc.exists) {
      return res.status(404).json({ error: 'Global folder not found' });
    }

    const folderData = folderDoc.data();
    const originalFolderId = folderData.originalFolderId;

    // Get subfolders from original folder
    const subfoldersSnapshot = await db.collection(COLLECTIONS.FOLDERS)
      .where('parentId', '==', originalFolderId)
      .get();

    const subfolders = subfoldersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    }));

    res.json(subfolders);
  } catch (error) {
    logger.error('GlobalAPI', 'Error fetching subfolders', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch subfolders', details: error.message });
  }
});

export default router;
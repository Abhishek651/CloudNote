import express from 'express';
import admin from '../config/firebase.js';
import logger from '../utils/logger.js';
import { verifyAdmin } from '../middleware/adminAuth.js';

const router = express.Router();
const db = admin.firestore();

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = await Promise.all(listUsersResult.users.map(async (user) => {
      let userData = {};
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) userData = userDoc.data();
      } catch (e) {}
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.displayName || '',
        photoURL: user.photoURL || userData.photoURL || '',
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime,
        theme: userData.theme || 'default'
      };
    }));

    logger.info('AdminAPI', 'Listed all users', { count: users.length });
    res.json({ users });
  } catch (error) {
    logger.error('AdminAPI', 'Error listing users', { error: error.message });
    res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
});

// Get user stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [usersResult, notesSnapshot, foldersSnapshot, globalNotesSnapshot] = await Promise.all([
      admin.auth().listUsers(1000),
      db.collection('notes').count().get(),
      db.collection('folders').count().get(),
      db.collection('globalNotes').count().get()
    ]);

    const stats = {
      totalUsers: usersResult.users.length,
      totalNotes: notesSnapshot.data().count,
      totalFolders: foldersSnapshot.data().count,
      totalGlobalNotes: globalNotesSnapshot.data().count
    };

    logger.info('AdminAPI', 'Retrieved stats', stats);
    res.json(stats);
  } catch (error) {
    logger.error('AdminAPI', 'Error getting stats', { error: error.message });
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
});

// Disable/Enable user
router.patch('/users/:uid/status', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body;

    await admin.auth().updateUser(uid, { disabled });
    
    logger.info('AdminAPI', 'Updated user status', { uid, disabled });
    res.json({ message: 'User status updated', uid, disabled });
  } catch (error) {
    logger.error('AdminAPI', 'Error updating user status', { error: error.message });
    res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
});

// Delete user
router.delete('/users/:uid', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    // Delete user data from Firestore
    const batch = db.batch();
    
    const [notesSnapshot, foldersSnapshot, userDoc] = await Promise.all([
      db.collection('notes').where('userId', '==', uid).get(),
      db.collection('folders').where('userId', '==', uid).get(),
      db.collection('users').doc(uid).get()
    ]);

    notesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    foldersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    if (userDoc.exists) batch.delete(userDoc.ref);

    await batch.commit();
    await admin.auth().deleteUser(uid);

    logger.info('AdminAPI', 'Deleted user', { uid });
    res.json({ message: 'User deleted successfully', uid });
  } catch (error) {
    logger.error('AdminAPI', 'Error deleting user', { error: error.message });
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Get user details
router.get('/users/:uid', verifyAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await admin.auth().getUser(uid);
    
    let userData = {};
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) userData = userDoc.data();

    const [notesSnapshot, foldersSnapshot] = await Promise.all([
      db.collection('notes').where('userId', '==', uid).get(),
      db.collection('folders').where('userId', '==', uid).get()
    ]);

    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userData.displayName || '',
      photoURL: user.photoURL || userData.photoURL || '',
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime,
      theme: userData.theme || 'default',
      notesCount: notesSnapshot.size,
      foldersCount: foldersSnapshot.size
    });
  } catch (error) {
    logger.error('AdminAPI', 'Error getting user details', { error: error.message });
    res.status(500).json({ error: 'Failed to get user details', details: error.message });
  }
});

export default router;

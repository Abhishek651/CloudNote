import express from 'express';
import admin from '../config/firebase.js';

const router = express.Router();

// Middleware to verify Firebase ID token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

export default router;
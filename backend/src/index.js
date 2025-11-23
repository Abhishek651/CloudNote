import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// Initialize Firebase Admin and load env in a single place
import './config/firebase.js';
import admin from './config/firebase.js';
import logger from './utils/logger.js';
import authRoutes from './api/auth.js';
import notesRoutes from './api/notes.js';
import foldersRoutes from './api/folders.js';
import usersRoutes from './api/users.js';
import globalRoutes from './api/global.js';
import uploadRoutes from './api/upload.js';
import b2Routes from './api/b2.js';
import pdfRoutes from './api/pdf.js';
import adminRoutes from './api/admin.js';

const app = express();

// Firebase Admin initialization is handled in `src/config/firebase.js` which loads
// environment variables and initializes the Admin SDK. That file will exit the
// process with a clear message if credentials are missing.

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin in development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Check against configured frontend URL
    if (origin === (process.env.FRONTEND_URL || 'http://localhost:5173')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// CSRF Protection via SameSite cookies
app.use((req, res, next) => {
  res.cookie('csrf-token', 'protected', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced health check with Firestore connectivity
app.get('/health', async (req, res) => {
  try {
    logger.info('Backend', 'Health check', { timestamp: Date.now() });
    
    // Test Firestore connectivity
    const db = admin.firestore();
    const testRef = db.collection('_health_check').doc('test');
    await testRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    
    logger.info('Backend', 'Firestore connection OK', {});
    
    res.json({
      status: 'ok',
      timestamp: Date.now(),
      firestore: 'connected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    logger.error('Backend', 'Health check failed', { error: err.message });
    res.status(503).json({
      status: 'error',
      timestamp: Date.now(),
      firestore: 'disconnected',
      error: err.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/global', globalRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/upload', b2Routes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
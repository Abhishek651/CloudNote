import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import admin from '../src/config/firebase.js';
import logger from '../src/utils/logger.js';
import authRoutes from '../src/api/auth.js';
import notesRoutes from '../src/api/notes.js';
import foldersRoutes from '../src/api/folders.js';
import usersRoutes from '../src/api/users.js';
import globalRoutes from '../src/api/global.js';
import uploadRoutes from '../src/api/upload.js';
import b2Routes from '../src/api/b2.js';
import pdfRoutes from '../src/api/pdf.js';
import adminRoutes from '../src/api/admin.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    if (origin && origin.includes('vercel.app')) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', message: 'CloudNote API' }));

app.get('/health', async (req, res) => {
  try {
    const db = admin.firestore();
    const testRef = db.collection('_health_check').doc('test');
    await testRef.set({ timestamp: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    res.json({ status: 'ok', timestamp: Date.now(), firestore: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', error: err.message });
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

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => res.status(500).json({ error: 'Internal Server Error', details: err.message }));

export default app;

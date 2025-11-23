import express from 'express';
import multer from 'multer';
import { google } from 'googleapis';
import { verifyToken } from './auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Google Drive configuration
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY, // Path to service account key
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * POST /api/upload/drive
 * Upload PDF to central Google Drive
 */
router.post('/drive', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    logger.info('DriveAPI', 'Uploading PDF to Drive', { 
      fileName: req.file.originalname,
      size: req.file.size,
      userId: req.user.uid 
    });

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${req.file.originalname}`;

    // Upload to Google Drive
    const fileMetadata = {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Central folder ID
    };

    const media = {
      mimeType: 'application/pdf',
      body: require('stream').Readable.from(req.file.buffer),
    };

    const driveFile = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    // Make file publicly viewable
    await drive.permissions.create({
      fileId: driveFile.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Generate preview URL
    const driveUrl = `https://drive.google.com/file/d/${driveFile.data.id}/preview`;

    logger.info('DriveAPI', 'PDF uploaded to Drive successfully', { 
      fileId: driveFile.data.id,
      fileName 
    });

    res.json({
      driveUrl,
      fileName: req.file.originalname,
      fileId: driveFile.data.id,
    });

  } catch (error) {
    logger.error('DriveAPI', 'Drive upload failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to upload to Google Drive', 
      details: error.message 
    });
  }
});

export default router;
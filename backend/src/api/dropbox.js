import express from 'express';
import multer from 'multer';
import { Dropbox } from 'dropbox';
import { verifyToken } from './auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB limit for Dropbox
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Initialize Dropbox client
const dbx = new Dropbox({ 
  accessToken: process.env.DROPBOX_ACCESS_TOKEN,
  clientId: process.env.DROPBOX_APP_KEY,
});

/**
 * POST /api/upload/dropbox
 * Upload PDF to Dropbox
 */
router.post('/dropbox', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    logger.info('DropboxAPI', 'Uploading PDF to Dropbox', { 
      fileName: req.file.originalname,
      size: req.file.size,
      userId: req.user.uid 
    });

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${req.file.originalname}`;
    const filePath = `/cloudnote-pdfs/${fileName}`;

    // Upload to Dropbox
    const uploadResponse = await dbx.filesUpload({
      path: filePath,
      contents: req.file.buffer,
      mode: 'add',
      autorename: true,
    });

    // Create shared link
    const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
      path: filePath,
      settings: {
        requested_visibility: 'public',
        audience: 'public',
        access: 'viewer',
      },
    });

    // Convert Dropbox share URL to direct view URL
    const shareUrl = sharedLinkResponse.result.url;
    const directUrl = shareUrl.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');

    logger.info('DropboxAPI', 'PDF uploaded to Dropbox successfully', { 
      path: filePath,
      fileName,
      shareUrl: directUrl
    });

    res.json({
      dropboxUrl: directUrl,
      fileName: req.file.originalname,
      filePath: filePath,
      shareUrl: shareUrl,
    });

  } catch (error) {
    logger.error('DropboxAPI', 'Dropbox upload failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to upload to Dropbox', 
      details: error.message 
    });
  }
});

export default router;
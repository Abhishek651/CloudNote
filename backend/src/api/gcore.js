import express from 'express';
import multer from 'multer';
import { verifyToken } from './auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

/**
 * POST /api/upload/gcore
 * Upload PDF to Gcore Object Storage
 */
router.post('/gcore', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    logger.info('GcoreAPI', 'Uploading PDF to Gcore Storage', { 
      fileName: req.file.originalname,
      size: req.file.size,
      userId: req.user.uid 
    });

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${req.file.originalname}`;
    const objectKey = `pdfs/${fileName}`;

    // Upload to Gcore Object Storage
    const uploadResponse = await fetch(`${process.env.GCORE_STORAGE_ENDPOINT}/buckets/${process.env.GCORE_BUCKET_NAME}/objects/${objectKey}`, {
      method: 'PUT',
      headers: {
        'Authorization': `APIKey ${process.env.GCORE_API_TOKEN}`,
        'Content-Type': 'application/pdf',
        'Content-Length': req.file.size.toString(),
      },
      body: req.file.buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    // Generate public URL
    const publicUrl = `${process.env.GCORE_STORAGE_ENDPOINT}/buckets/${process.env.GCORE_BUCKET_NAME}/objects/${objectKey}`;

    logger.info('GcoreAPI', 'PDF uploaded to Gcore successfully', { 
      objectKey,
      fileName,
      publicUrl
    });

    res.json({
      gcoreUrl: publicUrl,
      fileName: req.file.originalname,
      objectKey: objectKey,
    });

  } catch (error) {
    logger.error('GcoreAPI', 'Gcore upload failed', { error: error.message });
    res.status(500).json({ 
      error: 'Failed to upload to Gcore Storage', 
      details: error.message 
    });
  }
});

export default router;
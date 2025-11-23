import express from 'express';
import multer from 'multer';
import admin from '../config/firebase.js';
import { verifyToken } from './auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/pdf', verifyToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const bucket = admin.storage().bucket();
    const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `pdfs/${req.user.uid}/${Date.now()}_${sanitizedName}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: 'application/pdf' }
    });

    await file.makePublic();
    
    // Construct a web-friendly URL that encourages in-browser viewing
    const encodedFileName = encodeURIComponent(fileName);
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFileName}?alt=media`;

    res.json({
      fileName: req.file.originalname,
      fileUrl: firebaseUrl,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Fallback to base64 if Storage fails
    try {
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64Data}`;
      
      res.json({
        fileName: req.file.originalname,
        fileUrl: dataUrl,
        size: req.file.size
      });
    } catch (fallbackError) {
      res.status(500).json({ error: 'Failed to upload PDF', details: error.message });
    }
  }
});

export default router;
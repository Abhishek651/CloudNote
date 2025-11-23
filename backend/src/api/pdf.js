import express from 'express';
import multer from 'multer';
import b2Service from '../services/b2Service.js';
const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.headers['user-id'] || 'anonymous';
    const fileName = `${userId}/${noteId}/${Date.now()}_${req.file.originalname}`;
    
    const result = await b2Service.uploadFile(req.file.buffer, fileName);
    
    res.json({
      success: true,
      fileId: result.fileId,
      fileName: result.fileName,
      url: `https://f005.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/download/:fileName', async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    const fileData = await b2Service.downloadFile(fileName);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
    res.send(fileData);
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

router.get('/view/:fileName', async (req, res) => {
  console.log('=== PDF VIEW REQUEST START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  console.log('Raw filename param:', req.params.fileName);
  
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    console.log('Decoded filename:', fileName);
    console.log('Attempting to fetch from B2...');
    
    const fileData = await b2Service.downloadFile(fileName);
    console.log('✅ File data received from B2');
    console.log('File size:', fileData.length, 'bytes');
    console.log('File type:', typeof fileData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log('Response headers set, sending file...');
    res.send(fileData);
    console.log('✅ PDF sent successfully');
  } catch (error) {
    console.error('❌ PDF view error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(404).json({ error: 'File not found', details: error.message });
  }
  console.log('=== PDF VIEW REQUEST END ===');
});

router.delete('/:fileName', async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.fileName);
    await b2Service.deleteFile(fileName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('PDF test endpoint hit');
  res.json({ 
    status: 'PDF service is running',
    timestamp: new Date().toISOString(),
    b2Config: {
      bucketName: process.env.B2_BUCKET_NAME,
      bucketId: process.env.B2_BUCKET_ID,
      hasKeyId: !!process.env.B2_KEY_ID,
      hasAppKey: !!process.env.B2_APPLICATION_KEY
    }
  });
});

export default router;
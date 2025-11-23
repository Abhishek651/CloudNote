import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { verifyToken } from './auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// B2 API endpoints
const B2_API_URL = 'https://api.backblazeb2.com';

/**
 * Authorize with B2 and get upload URL
 */
async function authorizeB2() {
  const authResponse = await fetch(`${B2_API_URL}/b2api/v2/b2_authorize_account`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.B2_KEY_ID}:${process.env.B2_APPLICATION_KEY}`).toString('base64')}`,
    },
  });

  if (!authResponse.ok) {
    throw new Error('B2 authorization failed');
  }

  return await authResponse.json();
}

/**
 * Get upload URL for bucket
 */
async function getUploadUrl(authData, bucketId) {
  const response = await fetch(`${authData.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': authData.authorizationToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }

  return await response.json();
}

/**
 * GET /api/upload/b2/test
 * Test B2 connection and bucket access
 */
router.get('/b2/test', verifyToken, async (req, res) => {
  try {
    logger.info('B2API', 'Testing B2 connection');
    
    // Test authorization
    const authData = await authorizeB2();
    
    // Test bucket access
    const bucketsResponse = await fetch(`${authData.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        'Authorization': authData.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accountId: authData.accountId }),
    });

    const bucketsData = await bucketsResponse.json();
    const bucket = bucketsData.buckets.find(b => b.bucketName === process.env.B2_BUCKET_NAME);
    
    res.json({
      status: 'success',
      message: 'B2 connection successful',
      accountId: authData.accountId,
      bucketFound: !!bucket,
      bucketName: process.env.B2_BUCKET_NAME,
      availableBuckets: bucketsData.buckets.map(b => b.bucketName),
    });
    
  } catch (error) {
    logger.error('B2API', 'B2 test failed', { error: error.message });
    res.status(500).json({ 
      status: 'error',
      error: 'B2 connection failed', 
      details: error.message 
    });
  }
});

/**
 * POST /api/upload/b2
 * Upload PDF to Backblaze B2
 */
router.post('/b2', upload.single('pdf'), async (req, res) => {
  try {
    console.log('=== B2 UPLOAD DEBUG START ===');
    console.log('Environment check:');
    console.log('- B2_KEY_ID:', process.env.B2_KEY_ID ? 'SET' : 'MISSING');
    console.log('- B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY ? 'SET' : 'MISSING');
    console.log('- B2_BUCKET_NAME:', process.env.B2_BUCKET_NAME);
    
    if (!req.file) {
      console.log('ERROR: No file provided');
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // 1. Authorize with B2
    console.log('Step 1: Authorizing with B2...');
    let authData;
    try {
      authData = await authorizeB2();
      console.log('✅ B2 authorization successful');
      console.log('Auth data:', {
        accountId: authData.accountId,
        apiUrl: authData.apiUrl,
        downloadUrl: authData.downloadUrl
      });
    } catch (error) {
      console.log('❌ B2 authorization failed:', error.message);
      throw new Error(`B2 authorization failed: ${error.message}`);
    }

    // 2. Use direct bucket ID (bypass listing)
    console.log('Step 2: Using direct bucket ID...');
    const bucketId = process.env.B2_BUCKET_ID;
    if (!bucketId) {
      throw new Error('B2_BUCKET_ID not configured');
    }
    console.log('✅ Using bucket ID:', bucketId);

    // 3. Get upload URL
    console.log('Step 3: Getting upload URL...');
    let uploadData;
    try {
      uploadData = await getUploadUrl(authData, bucketId);
      console.log('✅ Got B2 upload URL');
    } catch (error) {
      console.log('❌ Failed to get B2 upload URL:', error.message);
      throw new Error(`Failed to get B2 upload URL: ${error.message}`);
    }

    // 4. Upload file to B2
    console.log('Step 4: Uploading file...');
    const timestamp = Date.now();
    const fileName = `pdfs/${timestamp}_${req.file.originalname}`;
    console.log('Upload filename:', fileName);
    
    let uploadResult;
    try {
      const sha1Hash = crypto.createHash('sha1').update(req.file.buffer).digest('hex');
      console.log('File SHA1:', sha1Hash);
      
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'Content-Type': 'application/pdf',
          'Content-Length': req.file.size.toString(),
          'X-Bz-Content-Sha1': sha1Hash,
        },
        body: req.file.buffer,
      });

      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.log('❌ Upload failed:', errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
      }
      
      uploadResult = await uploadResponse.json();
      console.log('✅ File uploaded successfully:', uploadResult.fileId);
    } catch (error) {
      console.log('❌ Upload error:', error.message);
      throw new Error(`Failed to upload file to B2: ${error.message}`);
    }

    // 5. Generate URLs
    const publicUrl = `${authData.downloadUrl}/file/${process.env.B2_BUCKET_NAME}/${fileName}`;
    const viewUrl = `http://localhost:5000/api/pdf/view/${encodeURIComponent(fileName)}`;
    const downloadUrl = `http://localhost:5000/api/pdf/download/${encodeURIComponent(fileName)}`;

    console.log('✅ PDF uploaded successfully');
    console.log('URLs generated:', { publicUrl, viewUrl, downloadUrl });
    console.log('=== B2 UPLOAD DEBUG END ===');

    res.json({
      b2Url: publicUrl,
      viewUrl: viewUrl,
      downloadUrl: downloadUrl,
      fileName: req.file.originalname,
      fileId: uploadResult.fileId,
    });

  } catch (error) {
    console.log('=== B2 UPLOAD ERROR ===');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    console.log('=== B2 UPLOAD DEBUG END ===');
    
    res.status(500).json({ 
      error: 'Failed to upload to Backblaze B2', 
      details: error.message 
    });
  }
});

export default router;
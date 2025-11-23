import { useState } from 'react';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';
import PdfViewer from './PdfViewer';

export default function PdfDebug() {
  const [testUrl, setTestUrl] = useState('http://localhost:5000/api/pdf/test');
  const [showViewer, setShowViewer] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testEndpoint = async () => {
    try {
      console.log('Testing endpoint:', testUrl);
      const response = await fetch(testUrl);
      const result = await response.text();
      console.log('Test result:', result);
      setTestResult({ success: true, data: result, status: response.status });
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, error: error.message });
    }
  };

  const testPdfUrl = 'http://localhost:5000/api/pdf/view/pdfs/1763221658021_test.pdf';

  return (
    <Box sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>PDF Debug Tool</Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Test URL"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="outlined" onClick={testEndpoint} sx={{ mr: 2 }}>
          Test Endpoint
        </Button>
        <Button 
          variant="contained" 
          onClick={() => setShowViewer(!showViewer)}
        >
          {showViewer ? 'Hide' : 'Show'} PDF Viewer
        </Button>
      </Box>

      {testResult && (
        <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Status: {testResult.status || 'Error'}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            {testResult.success ? testResult.data : testResult.error}
          </Typography>
        </Alert>
      )}

      <Typography variant="body2" sx={{ mb: 2 }}>
        Test PDF URL: {testPdfUrl}
      </Typography>

      {showViewer && (
        <Box sx={{ height: 600, border: '1px solid #ccc', mt: 2 }}>
          <PdfViewer 
            url={testPdfUrl}
            onError={(error) => {
              console.error('PDF Viewer Error:', error);
              setTestResult({ success: false, error: `PDF Viewer: ${error.message}` });
            }}
          />
        </Box>
      )}
    </Box>
  );
}
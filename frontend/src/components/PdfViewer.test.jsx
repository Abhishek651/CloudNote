import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import PdfViewer from './PdfViewer';

export default function PdfViewerTest() {
  const [showViewer, setShowViewer] = useState(false);
  const testUrl = 'http://localhost:5000/api/pdf/view/test.pdf';

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        PDF Viewer Test
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => setShowViewer(!showViewer)}
        sx={{ mb: 2 }}
      >
        {showViewer ? 'Hide' : 'Show'} PDF Viewer
      </Button>

      {showViewer && (
        <Box sx={{ height: 600, border: '1px solid #ccc' }}>
          <PdfViewer 
            url={testUrl}
            onError={(error) => console.error('Test PDF error:', error)}
          />
        </Box>
      )}
    </Box>
  );
}
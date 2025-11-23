import { useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function PdfViewer({ url, onError }) {
  const [error, setError] = useState(null);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {error && (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: 'none', flex: 1 }}
        title="PDF Viewer"
        onError={() => {
          const msg = 'Failed to load PDF';
          console.error(msg);
          setError(msg);
          onError?.(new Error(msg));
        }}
      />
    </Box>
  );
}
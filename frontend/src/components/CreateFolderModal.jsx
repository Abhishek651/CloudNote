import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { foldersAPI } from '../services/api';
import logger from '../utils/logger';

export default function CreateFolderModal({ open, onClose, onFolderCreated, parentId = null, userId }) {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');

    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    setLoading(true);

    try {
      logger.info('CreateFolderModal', 'Creating folder', { folderName });
      const result = await foldersAPI.create({
        name: folderName,
        parentId,
      });

      logger.info('CreateFolderModal', 'Folder created', { id: result.id });
      onFolderCreated?.(result);

      // Reset form
      setFolderName('');
      onClose();
    } catch (err) {
      logger.error('CreateFolderModal', 'Folder creation failed', { error: err.message });
      setError(`Failed to create folder: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>📁 Create New Folder</DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Folder Name"
            placeholder="e.g., Work, Personal, Ideas"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !folderName.trim()}
        >
          {loading ? 'Creating...' : '✓ Create Folder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

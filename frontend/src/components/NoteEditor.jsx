import { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Toolbar, Paper, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import RichTextEditor from './RichTextEditor';

export default function NoteEditor({ note, onUpdateNote, onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setHasChanges(false);
    }
  }, [note]);

  const handleSave = () => {
    if (note && hasChanges) {
      onUpdateNote(note.id, { title, content });
      setHasChanges(false);
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    if (note && newContent !== note.content) {
      setHasChanges(true);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      handleSave();
    }
    onClose();
  };

  if (!note) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton edge="start" onClick={handleClose} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <TextField
            fullWidth
            variant="standard"
            placeholder="Note title..."
            value={title}
            onChange={handleTitleChange}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: 500,
              },
            }}
            sx={{ mr: 2 }}
          />

          {hasChanges && (
            <IconButton onClick={handleSave} color="primary">
              <SaveIcon />
            </IconButton>
          )}
        </Toolbar>
      </Paper>

      <Box sx={{ flex: 1, overflowY: 'auto', p: isMobile ? 1 : 2 }}>
        <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing your amazing note..."
        />
      </Box>
    </Box>
  );
}

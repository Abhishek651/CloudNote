import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  PictureAsPdf as PdfIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { notesAPI } from '../services/api';
import PdfViewer from '../components/PdfViewer';
import RichTextEditor from '../components/RichTextEditor';
import logger from '../utils/logger';


export default function NotesEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { noteId } = useParams();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [note, setNote] = useState({
    title: '',
    content: '',
    tags: [],
  });

  const [loading, setLoading] = useState(noteId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [noteType, setNoteType] = useState('text');
  const [uploading, setUploading] = useState(false);
  const [pdfViewOpen, setPdfViewOpen] = useState(false);

  // Load existing note
  useEffect(() => {
    if (noteId && user) {
      loadNote();
    }
  }, [noteId, user]);

  // Auto-save interval with proper debouncing
  useEffect(() => {
    if (!isDirty || !noteId || saving) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [isDirty, note, noteId, saving]);

  // Warn user if leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const loadNote = async () => {
    setLoading(true);
    setError('');

    try {
      logger.info('NotesEditor', 'Loading note', { noteId });
      let foundNote;
      
      try {
        // Try to get the note directly first
        foundNote = await notesAPI.getById(noteId);
      } catch (err) {
        // If direct access fails, try searching in user's notes
        const notes = await notesAPI.getAll({ limit: 100 });
        foundNote = notes.find((n) => n.id === noteId);
      }

      if (!foundNote) {
        setError('Note not found');
        return;
      }

      setNote(foundNote);
      setTagsInput(foundNote.tags?.join(', ') || '');
      setNoteType(foundNote.type || 'text');
      setIsDirty(false);
      logger.info('NotesEditor', 'Note loaded', { noteId });
    } catch (err) {
      logger.error('NotesEditor', 'Failed to load note', { error: err.message });
      setError(`Failed to load note: ${err.message}`);
    }

    setLoading(false);
  };


  const handleTitleChange = (e) => {
    setNote({ ...note, title: e.target.value });
    setIsDirty(true);
  };

  const handleContentChange = (content) => {
    setNote({ ...note, content });
    setIsDirty(true);
  };

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
    const tags = e.target.value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    setNote({ ...note, tags });
    setIsDirty(true);
  };

  const handleAutoSave = async () => {
    if (!noteId || !isDirty) return;

    try {
      setSaving(true);
      logger.debug('NotesEditor', 'Auto-saving note', { noteId });
      await notesAPI.update(noteId, {
        title: note.title || 'Untitled Note',
        content: note.content,
        tags: note.tags,
      });
      setIsDirty(false);
      logger.debug('NotesEditor', 'Note auto-saved', { noteId });
    } catch (err) {
      logger.error('NotesEditor', 'Auto-save failed', { error: err.message });
      setError(`Auto-save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleB2Upload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024 * 1024) { // 5GB limit
      setError('PDF file must be smaller than 5GB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/upload/b2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      console.log('Upload result:', result);
      setNote({
        ...note,
        title: note.title || result.fileName,
        fileUrl: result.b2Url,
        viewUrl: result.viewUrl,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName
      });
      setNoteType('pdf');
      setIsDirty(true);
    } catch (err) {
      setError(`Failed to upload PDF: ${err.message}`);
    }
    setUploading(false);
  };

  const handlePdfDownload = () => {
    console.log('Editor PDF download:', { fileName: note.fileName, hasDownloadUrl: !!note.downloadUrl });
    if (note.downloadUrl) {
      const link = document.createElement('a');
      link.href = note.downloadUrl;
      link.download = note.fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (note.fileUrl) {
      window.open(note.fileUrl, '_blank');
    }
  };

  const handlePdfView = () => {
    setPdfViewOpen(true);
  };

  const handleSave = async () => {
    setError('');

    if (!note.title.trim()) {
      setError('Please enter a note title');
      return;
    }

    try {
      setSaving(true);
      logger.info('NotesEditor', 'Saving note', { isNew: !noteId, title: note.title });

      if (noteId) {
        // Update existing note
        await notesAPI.update(noteId, {
          title: note.title || 'Untitled Note',
          content: note.content,
          tags: note.tags,
          type: noteType,
          fileUrl: note.fileUrl,
          viewUrl: note.viewUrl,
          downloadUrl: note.downloadUrl,
          fileName: note.fileName,
        });
        logger.info('NotesEditor', 'Note updated', { noteId });
      } else {
        // Create new note
        const newNote = await notesAPI.create({
          title: note.title || 'Untitled Note',
          content: note.content,
          tags: note.tags,
          folderId: folderId || null,
          type: noteType,
          fileUrl: note.fileUrl,
          viewUrl: note.viewUrl,
          downloadUrl: note.downloadUrl,
          fileName: note.fileName,
        });
        logger.info('NotesEditor', 'Note created', { id: newNote.id });
        // Navigate to the new note in view mode
        navigate(`/notes/${newNote.id}`, { replace: true });
        return;
      }

      setIsDirty(false);
    } catch (err) {
      logger.error('NotesEditor', 'Failed to save note', { error: err.message });
      setError(`Failed to save note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      logger.info('NotesEditor', 'Deleting note', { noteId });
      await notesAPI.delete(noteId);
      logger.info('NotesEditor', 'Note deleted', { noteId });
      setDeleteConfirmOpen(false);
      navigate('/notes');
    } catch (err) {
      logger.error('NotesEditor', 'Failed to delete note', { error: err.message });
      setError(`Failed to delete note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to edit notes.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none' }}
          >
            {isMobile ? '' : 'Back'}
          </Button>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            {isDirty && (
              <Typography variant="caption" color="warning.main" sx={{ py: 1 }}>
                ⚠️ {isMobile ? 'Unsaved' : 'Unsaved changes'}
              </Typography>
            )}
            {saving && <CircularProgress size={24} />}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              size={isMobile ? 'small' : 'medium'}
            >
              Save
            </Button>

            {noteId && (
              <Tooltip title="Delete this note">
                <IconButton
                  color="error"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={saving}
                  size={isMobile ? 'small' : 'medium'}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}


        {/* Title */}
        <TextField
          fullWidth
          placeholder="📝 Note Title"
          value={note.title}
          onChange={handleTitleChange}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          InputProps={{
            sx: {
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: 600,
            },
          }}
        />

        {/* Tags */}
        <TextField
          fullWidth
          placeholder="🏷️ Tags (comma-separated)"
          value={tagsInput}
          onChange={handleTagsChange}
          variant="outlined"
          size="small"
          helperText="Separate tags with commas"
        />

        {/* PDF Upload */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">📄 PDF Upload</Typography>
            <input
              type="file"
              accept=".pdf"
              onChange={handleB2Upload}
              style={{ display: 'none' }}
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload">
              <Button
                variant="outlined"
                component="span"
                disabled={uploading}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {uploading ? 'Uploading...' : '📦 Upload PDF'}
              </Button>
            </label>
            {note.fileName && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PdfIcon fontSize="small" /> {note.fileName}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={handlePdfView}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handlePdfDownload}
                  >
                    Download
                  </Button>
                </Stack>
              </Box>
            )}
          </Stack>
        </Paper>


        {/* Rich Text Editor */}
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: isMobile ? 1 : 2, bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DescriptionIcon color="primary" />
              <Typography variant="subtitle2" fontWeight="600">
                ✨ Rich Text Editor
              </Typography>
              {note.tags && note.tags.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ ml: 'auto', flexWrap: 'wrap' }}>
                  {note.tags.slice(0, isMobile ? 2 : 5).map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
          <RichTextEditor
            value={note.content}
            onChange={handleContentChange}
            placeholder="Start writing your amazing note here... ✍️"
          />
        </Paper>


        {/* Footer Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {note.content.replace(/<[^>]*>/g, '').length} characters | {note.content.replace(/<[^>]*>/g, '').split(/\s+/).filter((w) => w).length} words
          </Typography>

          <Stack direction={isMobile ? 'column' : 'row'} spacing={isMobile ? 1 : 2} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/notes')}
              fullWidth={isMobile}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              fullWidth={isMobile}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Note? 🗑️</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={saving}>
            {saving ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog 
        open={pdfViewOpen} 
        onClose={() => setPdfViewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PdfIcon /> {note.fileName || 'PDF Document'}
        </DialogTitle>
        <DialogContent sx={{ p: 1, height: '100%' }}>
          {(note.viewUrl || note.fileUrl) && (
            <PdfViewer 
              url={note.viewUrl || note.fileUrl}
              onError={(error) => {
                console.error('Editor PDF viewer error:', error);
                setError('Failed to load PDF viewer');
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePdfDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={() => setPdfViewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

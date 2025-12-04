import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Avatar,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  WrapText as WrapTextIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { notesAPI, globalAPI } from '../services/api';
import logger from '../utils/logger';
import SharedContentGate from '../components/SharedContentGate';

export default function NoteViewer({ isShared = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId, shareToken } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGlobalNote, setIsGlobalNote] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (noteId || shareToken) {
      loadNote();
    }
  }, [noteId, shareToken]);

  const loadNote = async () => {
    setLoading(true);
    setError('');

    try {
      logger.info('NoteViewer', 'Loading note', { noteId, shareToken, isShared });
      
      let foundNote;
      
      // Handle shared link
      if (isShared && shareToken) {
        try {
          // Try direct share link first
          foundNote = await notesAPI.getByShareToken(shareToken);
          setIsGlobalNote(false);
        } catch (directErr) {
          // Fallback to global share link
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/global/share/note/${shareToken}`);
          if (!response.ok) throw new Error('Shared note not found');
          foundNote = await response.json();
          setIsGlobalNote(true);
        }
      } else {
        // Handle regular note viewing
        const fromGlobal = location.pathname.includes('/global') || !user;
        
        if (fromGlobal) {
          try {
            foundNote = await globalAPI.getGlobalNote(noteId);
            setIsGlobalNote(true);
          } catch (globalErr) {
            if (user) {
              foundNote = await notesAPI.getById(noteId);
              setIsGlobalNote(false);
            } else {
              throw globalErr;
            }
          }
        } else {
          try {
            foundNote = await notesAPI.getById(noteId);
            setIsGlobalNote(false);
          } catch (noteErr) {
            foundNote = await globalAPI.getGlobalNote(noteId);
            setIsGlobalNote(true);
          }
        }
      }
      
      setNote(foundNote);
      logger.info('NoteViewer', 'Note loaded', { noteId, isGlobal: isGlobalNote });
    } catch (err) {
      logger.error('NoteViewer', 'Failed to load note', { error: err.message });
      setError(`Failed to load note: ${err.message}`);
    }

    setLoading(false);
  };

  const transformPdfUrl = (url) => {
    if (!url || !url.startsWith('https://storage.googleapis.com/')) {
      return url;
    }

    try {
      // The URL is in the format: https://storage.googleapis.com/BUCKET_NAME/OBJECT_PATH
      const pathParts = new URL(url).pathname.split('/').filter(Boolean);
      if (pathParts.length < 2) return url;

      const bucket = pathParts[0];
      const objectPath = pathParts.slice(1).join('/');
      const encodedObjectPath = encodeURIComponent(objectPath);
      
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedObjectPath}?alt=media`;
    } catch (e) {
      logger.error('NoteViewer', 'Failed to transform PDF URL', { url, error: e.message });
      return url; // Fallback to original URL on error
    }
  };

  const handleDownload = () => {
    if (!note?.fileUrl) return;
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.setAttribute('download', note.fileName || 'download.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(true);
    });
  };

  useEffect(() => {
    if (note?.content) {
      const codeBlocks = document.querySelectorAll('pre');
      codeBlocks.forEach((block) => {
        if (!block.querySelector('.copy-code-btn')) {
          const codeElement = block.querySelector('code');
          const btn = document.createElement('button');
          btn.className = 'copy-code-btn';
          btn.textContent = 'Copy';
          btn.onclick = () => handleCopyCode(codeElement?.textContent || block.textContent);
          block.appendChild(btn);
        }
      });
    }
  }, [note?.content]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const isOwner = !isGlobalNote && note?.ownerId === user?.uid;

  const content = (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={1}>
            <Tooltip title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}>
              <IconButton
                onClick={() => setWordWrap(!wordWrap)}
                color={wordWrap ? 'primary' : 'default'}
              >
                <WrapTextIcon />
              </IconButton>
            </Tooltip>

            {note?.type === 'pdf' && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download
              </Button>
            )}
            
            {isOwner && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/notes/${noteId}/edit`)}
              >
                Edit
              </Button>
            )}
          </Stack>
        </Box>

        {/* Note Content */}
        <Paper elevation={1} sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight="600" gutterBottom>
            {note?.title || 'Untitled Note'}
          </Typography>

          {note?.tags && note.tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
              {note.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          {note?.type === 'pdf' && note?.fileUrl ? (
            <Box sx={{ width: '100%', height: '600px', border: 1, borderColor: 'divider' }}>
              <iframe
                src={transformPdfUrl(note.fileUrl)}
                width="100%"
                height="100%"
                title={note.fileName || 'PDF Document'}
              />
            </Box>
          ) : (
            <Box 
              sx={{ 
                lineHeight: 1.7,
                wordWrap: wordWrap ? 'break-word' : 'normal',
                overflowX: 'visible',
                '& h1': { fontSize: '2rem', fontWeight: 'bold', mb: 2 },
                '& h2': { fontSize: '1.5rem', fontWeight: 'bold', mb: 1.5 },
                '& h3': { fontSize: '1.25rem', fontWeight: 'bold', mb: 1 },
                '& p': { mb: 1 },
                '& ul, & ol': { paddingLeft: '24px', mb: 1 },
                '& li': { mb: 0.5 },
                '& blockquote': { borderLeft: '4px solid #ccc', pl: 2, fontStyle: 'italic', mb: 2 },
                '& code': { 
                  backgroundColor: '#f0f0f0', 
                  px: 0.75, 
                  py: 0.3, 
                  borderRadius: '4px', 
                  fontFamily: '"Consolas", "Monaco", monospace',
                  fontSize: '0.9em',
                  color: '#333',
                },
                '& pre': { 
                  backgroundColor: '#f5f5f5', 
                  color: '#333', 
                  p: 2,
                  borderRadius: '6px', 
                  fontFamily: '"Consolas", "Monaco", monospace', 
                  fontSize: '14px',
                  lineHeight: '1.5',
                  overflowX: 'auto !important',
                  overflowY: 'auto !important',
                  position: 'relative',
                  border: '1px solid #ddd',
                  mt: 1.5,
                  mb: 1.5,
                  maxWidth: '100%',
                  '& code': {
                    backgroundColor: 'transparent',
                    padding: '0',
                    color: 'inherit',
                    display: 'block',
                    whiteSpace: 'pre !important',
                    wordWrap: 'normal',
                    overflowWrap: 'normal',
                  },
                  '& .copy-code-btn': {
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    backgroundColor: '#fff',
                    color: '#666',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    '&:hover': {
                      backgroundColor: '#f9f9f9',
                      borderColor: '#999',
                      color: '#333',
                    }
                  }
                },
              }}
              dangerouslySetInnerHTML={{ __html: note?.content || 'No content' }}
            />
          )}

          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {isGlobalNote ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  key={note?.authorPhotoURL || note?.authorId}
                  src={note?.authorPhotoURL}
                  sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}
                >
                  {note?.authorName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  Shared by <strong>{note?.authorName}</strong> • {note?.createdAt ? new Date(note.createdAt).toLocaleString() : 'Unknown'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Created: {note?.createdAt ? new Date(note.createdAt).toLocaleString() : 'Unknown'}
                {note?.updatedAt && (
                  <> • Updated: {new Date(note.updatedAt).toLocaleString()}</>
                )}
              </Typography>
            )}
          </Box>
        </Paper>
      </Stack>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );

  // Wrap with auth gate if it's a shared link
  if (isShared) {
    return <SharedContentGate contentType="note">{content}</SharedContentGate>;
  }

  return content;
}
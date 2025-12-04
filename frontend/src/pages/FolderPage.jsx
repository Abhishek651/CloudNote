import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon, 
  Delete as DeleteIcon, 
  Archive as ArchiveIcon, 
  Folder as FolderIcon,
  Home as HomeIcon,
  Public as PublicIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';
import { notesAPI, foldersAPI, globalAPI } from '../services/api';
import CreateFolderModal from '../components/CreateFolderModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function FolderPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const [folder, setFolder] = useState(null);
  const [notes, setNotes] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState(null);

  const mountedRef = useRef({ current: true });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      logger.info('FolderPage', 'Loading folder data', { folderId, userId: user.uid });

      // Load folder details if not root
      if (folderId) {
        const folderData = await foldersAPI.getById(folderId);
        if (mountedRef.current) {
          setFolder(folderData);
        }
      }

      // Load notes in this folder
      const folderNotes = await notesAPI.getAll({ 
        folderId: folderId || null, 
        limit: 100, 
        includeArchived: false 
      });

      // Check global status for each note
      const notesWithGlobalStatus = await Promise.all(
        folderNotes.map(async (note) => {
          try {
            const { isGlobal } = await globalAPI.checkGlobalStatus(note.id);
            return { ...note, isGlobal };
          } catch (err) {
            return { ...note, isGlobal: false };
          }
        })
      );

      // Load subfolders
      const folderSubfolders = await foldersAPI.getAll(folderId || null);

      if (mountedRef.current) {
        setNotes(notesWithGlobalStatus);
        setSubfolders(folderSubfolders);
        logger.info('FolderPage', 'Data loaded', { 
          notes: notesWithGlobalStatus.length, 
          subfolders: folderSubfolders.length 
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        logger.error('FolderPage', 'Failed to load data', { error: err.message });
        setError(`Failed to load folder: ${err.message}`);
      }
    }

    if (mountedRef.current) {
      setLoading(false);
    }
  }, [user, folderId]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      showToast('✅ Note deleted successfully', 'success');
    } catch (err) {
      showToast(`❌ Failed to delete note: ${err.message}`, 'error');
    }
  };

  const handleArchiveNote = async (noteId) => {
    try {
      await notesAPI.update(noteId, { isArchived: true });
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      showToast('📦 Note archived successfully', 'success');
    } catch (err) {
      showToast(`❌ Failed to archive note: ${err.message}`, 'error');
    }
  };

  const handleFolderCreated = () => {
    showToast('📁 Folder created successfully', 'success');
    loadData();
  };

  const handleOpenNote = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handleOpenFolder = (subfolderId) => {
    navigate(`/folders/${subfolderId}`);
  };

  const generateAndCopyFolderShareLink = async () => {
    try {
      // Generate share token (or get existing one)
      const result = await foldersAPI.generateShareToken(folderId);
      
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/share/folder/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setFolderMenuAnchor(null);
      showToast('🔗 Folder share link copied!', 'success');
    } catch (err) {
      showToast(`❌ Failed to generate link: ${err.message}`, 'error');
    }
  };

  const handleShareFolderToGlobal = async () => {
    try {
      const result = await globalAPI.shareFolder(folderId);
      setFolderMenuAnchor(null);
      
      if (result.shareToken) {
        const shareUrl = `${window.location.origin}/share/folder/${result.shareToken}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('🌍 Folder shared to global! Link copied', 'success');
      } else {
        showToast('🌍 Folder shared to global feed', 'success');
      }
    } catch (err) {
      showToast(`❌ Failed to share folder: ${err.message}`, 'error');
    }
  };

  const generateAndCopyNoteShareLink = async (noteId) => {
    try {
      const result = await notesAPI.generateShareToken(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, shareToken: result.shareToken } : note
      ));
      
      const shareUrl = `${window.location.origin}/share/note/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setAnchorEl(null);
      showToast('🔗 Share link copied!', 'success');
    } catch (err) {
      showToast(`❌ Failed to generate link: ${err.message}`, 'error');
    }
  };

  const shareNoteToGlobal = async (noteId) => {
    try {
      const result = await globalAPI.shareNote(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, isGlobal: true, shareToken: result.shareToken } : note
      ));
      setAnchorEl(null);
      
      if (result.shareToken) {
        const shareUrl = `${window.location.origin}/share/note/${result.shareToken}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('🌍 Note shared to global! Link copied', 'success');
      } else {
        showToast('🌍 Note shared to global feed', 'success');
      }
    } catch (err) {
      showToast(`❌ Failed to share: ${err.message}`, 'error');
    }
  };

  const removeNoteFromGlobal = async (noteId) => {
    try {
      await globalAPI.removeNote(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, isGlobal: false } : note
      ));
      setAnchorEl(null);
      showToast('🔒 Note removed from global feed', 'success');
    } catch (err) {
      showToast(`❌ Failed to remove: ${err.message}`, 'error');
    }
  };

  // Filter notes and folders by search query
  const filteredSubfolders = subfolders.filter((subfolder) =>
    subfolder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view folders.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button" 
          variant="body1" 
          onClick={() => navigate('/notes')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          All Notes
        </Link>
        {folder && (
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FolderIcon fontSize="small" />
            {folder.name}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/notes')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <FolderIcon />
          {folder ? folder.name : 'All Notes'}
        </Typography>
        {folderId && (
          <IconButton onClick={(e) => setFolderMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Action Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            placeholder="🔍 Search in folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flex: 1, maxWidth: 300 }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => setCreateFolderOpen(true)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <FolderIcon /> New Folder
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/notes/new${folderId ? `?folderId=${folderId}` : ''}`)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              ➕ New Note
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Subfolders Grid */}
          {filteredSubfolders.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Folders</Typography>
              <Grid container spacing={2}>
                {filteredSubfolders.map((subfolder) => (
                  <Grid item xs={12} sm={6} md={4} key={subfolder.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleOpenFolder(subfolder.id)}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                          {subfolder.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 && filteredSubfolders.length === 0 && (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? '🔍 No results found' : '📝 This folder is empty'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchQuery ? 'Try a different search' : 'Create your first note or folder'}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate(`/notes/new${folderId ? `?folderId=${folderId}` : ''}`)}
              >
                ✍️ Create Note
              </Button>
            </Paper>
          )}

          {filteredNotes.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>Notes</Typography>
              <Grid container spacing={2}>
                {filteredNotes.map((note) => (
                  <Grid item xs={12} sm={6} md={4} key={note.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleOpenNote(note.id)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word' }}>
                          {note.title || 'Untitled Note'}
                        </Typography>

                        <Box
                          sx={(theme) => ({
                            ...theme.typography.body2,
                            color: theme.palette.text.secondary,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '3.6em',
                            '& a': {
                              color: theme.palette.primary.main,
                              textDecoration: 'underline',
                            }
                          })}
                          dangerouslySetInnerHTML={{ __html: note.content || 'No content' }}
                        />

                        {note.tags && note.tags.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                            {note.tags.slice(0, 3).map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                            {note.tags.length > 3 && <Chip label={`+${note.tags.length - 3}`} size="small" />}
                          </Stack>
                        )}
                      </CardContent>

                      <CardActions sx={{ justifyContent: 'space-between', pt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {note.updatedAt ? new Date(note.updatedAt.toDate?.() || note.updatedAt).toLocaleDateString() : 'Unknown date'}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNoteId(note.id);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Note Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => generateAndCopyNoteShareLink(selectedNoteId)}>
          <PublicIcon sx={{ mr: 1 }} /> Get Share Link
        </MenuItem>
        {notes.find(n => n.id === selectedNoteId)?.isGlobal ? (
          <MenuItem onClick={() => removeNoteFromGlobal(selectedNoteId)}>
            <VisibilityOffIcon sx={{ mr: 1 }} /> Hide from Global
          </MenuItem>
        ) : (
          <MenuItem onClick={() => shareNoteToGlobal(selectedNoteId)}>
            <PublicIcon sx={{ mr: 1 }} /> Share to Global Feed
          </MenuItem>
        )}
        <MenuItem onClick={() => handleArchiveNote(selectedNoteId)}>
          <ArchiveIcon sx={{ mr: 1 }} /> Archive
        </MenuItem>
        <MenuItem onClick={() => handleDeleteNote(selectedNoteId)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Folder Options Menu */}
      <Menu
        anchorEl={folderMenuAnchor}
        open={Boolean(folderMenuAnchor)}
        onClose={() => setFolderMenuAnchor(null)}
      >
        <MenuItem onClick={generateAndCopyFolderShareLink}>
          <PublicIcon sx={{ mr: 1 }} /> Get Share Link
        </MenuItem>
        <MenuItem onClick={handleShareFolderToGlobal}>
          <PublicIcon sx={{ mr: 1 }} /> Share to Global Feed
        </MenuItem>
      </Menu>

      {/* Create Folder Modal */}
      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onFolderCreated={handleFolderCreated}
        parentId={folderId}
        userId={user.uid}
      />

      {/* Toast Notification */}
      <Toast 
        open={toast?.open || false} 
        message={toast?.message} 
        severity={toast?.severity} 
        onClose={hideToast}
      />
    </Container>
  );
}
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Delete as DeleteIcon, Archive as ArchiveIcon, Folder as FolderIcon, Star, StarBorder, Public as PublicIcon, VisibilityOff as VisibilityOffIcon, Download as DownloadIcon, Visibility as VisibilityIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { notesAPI, foldersAPI, globalAPI } from '../services/api';
import CreateFolderModal from '../components/CreateFolderModal';
import Toast from '../components/Toast';

import { useToast } from '../hooks/useToast';

export default function NotesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const NOTES_PER_PAGE = 9; // 3x3 grid
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const mountedRef = useRef({ current: true });

  // Component lifecycle management
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!user) {
      logger.warn('NotesPage', 'No user available, skipping data load');
      return;
    }

    setLoading(true);
    setError('');

    try {
      logger.info('NotesPage', 'Loading user data', { userId: user.uid, showArchived });
      const userNotes = await notesAPI.getAll({ limit: 100, includeArchived: showArchived });
      const userFolders = await foldersAPI.getAll();
      
      // Check global status for each note
      const notesWithGlobalStatus = await Promise.all(
        userNotes.map(async (note) => {
          try {
            const { isGlobal } = await globalAPI.checkGlobalStatus(note.id);
            return { ...note, isGlobal };
          } catch (err) {
            return { ...note, isGlobal: false };
          }
        })
      );
      
      if (mountedRef.current) {
        setNotes(notesWithGlobalStatus);
        setFolders(userFolders);
        logger.info('NotesPage', 'Data loaded', { notes: notesWithGlobalStatus.length, folders: userFolders.length });
      }
    } catch (err) {
      if (mountedRef.current) {
        logger.error('NotesPage', 'Failed to load data', { error: err.message });
        setError(`Failed to load data: ${err.message}`);
      }
    }

    if (mountedRef.current) {
      setLoading(false);
    }
  }, [user, showArchived]);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Reload data when showArchived changes
  useEffect(() => {
    if (user) {
      loadData();
      setCurrentPage(1); // Reset to page 1 when toggling archive
    }
  }, [showArchived, loadData]);

  const handleDeleteNote = async (noteId) => {
    try {
      logger.info('NotesPage', 'Deleting note', { noteId });
      await notesAPI.delete(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      showToast('✅ Note deleted successfully', 'success');
      logger.info('NotesPage', 'Note deleted', { noteId });
    } catch (err) {
      logger.error('NotesPage', 'Failed to delete note', { error: err.message });
      setError(`Failed to delete note: ${err.message}`);
      showToast(`❌ Failed to delete note: ${err.message}`, 'error');
    }
  };

  const handleArchiveNote = async (noteId) => {
    try {
      logger.info('NotesPage', 'Archiving note', { noteId });
      await notesAPI.update(noteId, { isArchived: true });
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      showToast('📦 Note archived successfully', 'success');
      logger.info('NotesPage', 'Note archived', { noteId });
    } catch (err) {
      logger.error('NotesPage', 'Failed to archive note', { error: err.message });
      setError(`Failed to archive note: ${err.message}`);
      showToast(`❌ Failed to archive note: ${err.message}`, 'error');
    }
  };

  const handleRestoreNote = async (noteId) => {
    try {
      logger.info('NotesPage', 'Restoring note', { noteId });
      await notesAPI.update(noteId, { isArchived: false });
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      showToast('✅ Note restored successfully', 'success');
      logger.info('NotesPage', 'Note restored', { noteId });
    } catch (err) {
      logger.error('NotesPage', 'Failed to restore note', { error: err.message });
      setError(`Failed to restore note: ${err.message}`);
      showToast(`❌ Failed to restore note: ${err.message}`, 'error');
    }
  };

  const toggleFavorite = async (noteId, isFavorite) => {
    try {
      await notesAPI.update(noteId, { isFavorite: !isFavorite });
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, isFavorite: !isFavorite } : note
      ));
      showToast(isFavorite ? '⭐ Removed from favorites' : '⭐ Added to favorites', 'success');
    } catch (err) {
      logger.error('NotesPage', 'Failed to toggle favorite', { error: err.message });
      showToast(`❌ Failed to update favorite: ${err.message}`, 'error');
    }
  };

  const generateAndCopyShareLink = async (noteId) => {
    try {
      // Generate share token (or get existing one)
      const result = await notesAPI.generateShareToken(noteId);
      
      // Update local state
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, shareToken: result.shareToken } : note
      ));
      
      // Copy share link to clipboard
      const shareUrl = `${window.location.origin}/share/note/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      setAnchorEl(null);
      showToast('🔗 Share link copied to clipboard!', 'success');
    } catch (err) {
      logger.error('NotesPage', 'Failed to generate share link', { error: err.message });
      showToast(`❌ Failed to generate link: ${err.message}`, 'error');
    }
  };

  const shareToGlobal = async (noteId) => {
    try {
      const result = await globalAPI.shareNote(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, isGlobal: true, shareToken: result.shareToken } : note
      ));
      setAnchorEl(null);
      
      // Copy share link to clipboard
      if (result.shareToken) {
        const shareUrl = `${window.location.origin}/share/note/${result.shareToken}`;
        await navigator.clipboard.writeText(shareUrl);
        showToast('🌍 Note shared to global! Link copied', 'success');
      } else {
        showToast('🌍 Note shared to global feed', 'success');
      }
    } catch (err) {
      logger.error('NotesPage', 'Failed to share to global', { error: err.message });
      showToast(`❌ Failed to share: ${err.message}`, 'error');
    }
  };

  const removeFromGlobal = async (noteId) => {
    try {
      await globalAPI.removeNote(noteId);
      setNotes(notes.map(note => 
        note.id === noteId ? { ...note, isGlobal: false } : note
      ));
      setAnchorEl(null);
      showToast('🔒 Note removed from global feed', 'success');
    } catch (err) {
      logger.error('NotesPage', 'Failed to remove from global', { error: err.message });
      showToast(`❌ Failed to remove: ${err.message}`, 'error');
    }
  };

  const handlePermanentDelete = async (noteId) => {
    try {
      logger.info('NotesPage', 'Permanently deleting note', { noteId });
      await notesAPI.delete(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      setAnchorEl(null);
      setShowDeleteConfirm(false);
      setPermanentDeleteId(null);
      showToast('🗑️ Note permanently deleted', 'success');
      logger.info('NotesPage', 'Note permanently deleted', { noteId });
    } catch (err) {
      logger.error('NotesPage', 'Failed to permanently delete note', { error: err.message });
      setError(`Failed to delete note: ${err.message}`);
      showToast(`❌ Failed to delete note: ${err.message}`, 'error');
    }
  };

  const handleOpenNote = (note) => {
    navigate(`/notes/${note.id}`);
  };

  const handlePdfDownload = (note) => {
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.download = note.fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAnchorEl(null);
    showToast('📄 PDF download started', 'success');
  };

  const handleFolderCreated = () => {
    logger.info('NotesPage', 'Folder created, reloading data', {});
    showToast('📁 Folder created successfully', 'success');
    loadData();
  };

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('[NotesPage] Component mounted, user:', user?.uid);
  }, []);

  // Filter notes and folders by search query
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFilteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Calculate pagination for notes
  const totalPages = Math.ceil(allFilteredNotes.length / NOTES_PER_PAGE);
  const startIndex = (currentPage - 1) * NOTES_PER_PAGE;
  const endIndex = startIndex + NOTES_PER_PAGE;
  const filteredNotes = allFilteredNotes.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your notes.</Alert>
      </Container>
    );
  }

  // Debug: Log user authentication state
  useEffect(() => {
    console.log('[NotesPage] User state:', {
      uid: user?.uid,
      email: user?.email,
      isAuthenticated: !!user
    });
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        📝 Your Notes
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Action Bar */}
      <Paper sx={{ p: 2, mb: 3, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <TextField
              placeholder="🔍 Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ flex: 1, maxWidth: 300 }}
            />
            <Button
              variant={showArchived ? 'contained' : 'outlined'}
              onClick={() => setShowArchived(!showArchived)}
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {showArchived ? '📦 Archived' : 'Show Archive'}
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            {!showArchived && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setCreateFolderOpen(true)}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <FolderIcon /> New Folder
                </Button>

                <Button
                  variant="contained"
                  onClick={() => navigate('/notes/new')}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  ➕ New Note
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Folders Grid */}
          {filteredFolders.length > 0 && (
            <Box mb={4}>
              <Typography variant="h5" fontWeight="600" gutterBottom>Folders</Typography>
              <Grid container spacing={2}>
                {filteredFolders.map((folder) => (
                  <Grid item xs={12} sm={6} md={4} key={folder.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.02)',
                          boxShadow: 'rgba(99, 99, 99, 0.35) 0px 12px 24px 0px',
                        },
                      }}
                      onClick={() => navigate(`/folders/${folder.id}`)}
                    >
                      <CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderIcon sx={{ 
                          fontSize: 40, 
                          color: 'primary.main',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'rotate(10deg) scale(1.1)',
                          }
                        }} />
                        <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                          {folder.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 4 }} />
            </Box>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 && filteredFolders.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? '🔍 No results found' : '📝 No notes or folders yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchQuery ? 'Try a different search' : 'Click "New Note" or "New Folder" to get started'}
              </Typography>
              <Button variant="contained" onClick={() => navigate('/notes/new')}>
                ✍️ Create Note
              </Button>
            </Paper>
          )}

          {filteredNotes.length > 0 && (
            <Grid container spacing={2}>
              {filteredNotes.map((note) => (
                <Grid item xs={12} sm={6} md={4} key={note.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px) scale(1.02)',
                        boxShadow: 'rgba(99, 99, 99, 0.35) 0px 12px 24px 0px',
                      },
                    }}
                    onClick={() => handleOpenNote(note)}
                  >
                    <CardContent sx={{ flexGrow: 1, fontFamily: 'Poppins, sans-serif' }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        wordBreak: 'break-word',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 600,
                        fontSize: '15px',
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {note.type === 'pdf' && <PdfIcon fontSize="small" color="error" />}
                        {note.title || 'Untitled Note'}
                      </Typography>

                      <Typography variant="body2" sx={{ 
                        mb: 2, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                        fontSize: '13px',
                        color: 'text.primary'
                      }}>
                        {note.content ? note.content.replace(/<[^>]*>/g, '') : 'No content'}
                      </Typography>

                      {note.tags && note.tags.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {note.tags.slice(0, 3).map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {note.tags.length > 3 && <Chip label={`+${note.tags.length - 3}`} size="small" />}
                        </Stack>
                      )}
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ justifyContent: 'space-between', pt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {note.updatedAt ? new Date(note.updatedAt.toDate?.() || note.updatedAt).toLocaleDateString() : 'Unknown date'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          sx={{
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.2) rotate(10deg)',
                              backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(note.id, note.isFavorite);
                          }}
                        >
                          {note.isFavorite ? <Star color="warning" /> : <StarBorder />}
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'scale(1.2)',
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNoteId(note.id);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => {
              setCurrentPage(value);
              // Scroll to top when changing page
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            size="large"
          />
        </Stack>
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {!showArchived ? (
          [
            ...(notes.find(n => n.id === selectedNoteId)?.type === 'pdf' && notes.find(n => n.id === selectedNoteId)?.fileUrl ? [
              <MenuItem
                key="pdf-download"
                onClick={() => {
                  const note = notes.find(n => n.id === selectedNoteId);
                  handlePdfDownload(note);
                }}
              >
                <DownloadIcon sx={{ mr: 1 }} /> Download PDF
              </MenuItem>
            ] : []),
            <MenuItem
              key="get-link"
              onClick={() => {
                generateAndCopyShareLink(selectedNoteId);
              }}
            >
              <ShareIcon sx={{ mr: 1 }} /> Get Share Link
            </MenuItem>,
            ...(notes.find(n => n.id === selectedNoteId)?.isGlobal ? [
              <MenuItem
                key="remove-global"
                onClick={() => {
                  removeFromGlobal(selectedNoteId);
                }}
              >
                <VisibilityOffIcon sx={{ mr: 1 }} /> Hide from Global
              </MenuItem>
            ] : [
              <MenuItem
                key="share-global"
                onClick={() => {
                  shareToGlobal(selectedNoteId);
                }}
              >
                <PublicIcon sx={{ mr: 1 }} /> Share to Global Feed
              </MenuItem>
            ]),
            <MenuItem
              key="archive"
              onClick={() => {
                handleArchiveNote(selectedNoteId);
              }}
            >
              <ArchiveIcon sx={{ mr: 1 }} /> Archive
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                setShowDeleteConfirm(true);
                setPermanentDeleteId(selectedNoteId);
                setAnchorEl(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Delete
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem
              key="restore"
              onClick={() => {
                handleRestoreNote(selectedNoteId);
              }}
            >
              ↶ Restore
            </MenuItem>,
            <MenuItem
              key="perm-delete"
              onClick={() => {
                setShowDeleteConfirm(true);
                setPermanentDeleteId(selectedNoteId);
                setAnchorEl(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} /> Permanently Delete
            </MenuItem>
          ]
        )}
      </Menu>

      {/* Create Folder Modal */}
      <CreateFolderModal
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onFolderCreated={handleFolderCreated}
        parentId={null}
        userId={user.uid}
      />

      {/* Permanent Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setPermanentDeleteId(null);
        }}
      >
        <DialogTitle>Permanently Delete Note?</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone. The note will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowDeleteConfirm(false);
              setPermanentDeleteId(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handlePermanentDelete(permanentDeleteId)}
            variant="contained"
            color="error"
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>



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

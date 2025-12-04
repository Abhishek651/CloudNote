import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { Public, AccessTime, Download, PictureAsPdf, Folder, VisibilityOff, MoreVert, FilterList, ExpandMore, ExpandLess, Share, ContentCopy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { globalAPI, cacheAPI } from '../services/api';

export default function GlobalPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [globalNotes, setGlobalNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [filterType, setFilterType] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadGlobalNotes = async () => {
    try {
      const notes = await globalAPI.getAll(50);
      console.log('[GlobalPage] Loaded global notes:', notes);
      console.log('[GlobalPage] First note data:', notes[0]);
      setGlobalNotes(notes);
    } catch (error) {
      console.log('Failed to load global notes:', error);
    }
    setLoading(false);
  };

  const handleRemoveItem = async () => {
    try {
      if (selectedItem.itemType === 'folder') {
        await globalAPI.removeFolder(selectedItem.originalFolderId);
      } else {
        await globalAPI.removeNote(selectedItem.originalNoteId);
      }
      setGlobalNotes(globalNotes.filter(i => i.id !== selectedItem.id));
      setAnchorEl(null);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleCopyShareLink = (item) => {
    const baseUrl = window.location.origin;
    const shareUrl = item.itemType === 'folder' 
      ? `${baseUrl}/share/folder/${item.shareToken}`
      : `${baseUrl}/share/note/${item.shareToken}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setSnackbar({ open: true, message: 'Share link copied to clipboard!', severity: 'success' });
      setAnchorEl(null);
    }).catch(() => {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' });
    });
  };

  useEffect(() => {
    loadGlobalNotes();
  }, []);

  useEffect(() => {
    // Listen for profile updates and refresh global notes
    const handleProfileUpdate = () => {
      cacheAPI.invalidate('/api/global');
      loadGlobalNotes();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // Get unique authors
  const authors = useMemo(() => {
    const uniqueAuthors = [...new Set(globalNotes.map(item => item.authorName))];
    return uniqueAuthors.sort();
  }, [globalNotes]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = globalNotes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower) ||
          item.content?.toLowerCase().includes(searchLower) ||
          item.authorName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.itemType === filterType);
    }

    // Author filter
    if (filterAuthor !== 'all') {
      filtered = filtered.filter(item => item.authorName === filterAuthor);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'author':
          return (a.authorName || '').localeCompare(b.authorName || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [globalNotes, searchQuery, sortBy, filterType, filterAuthor]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Public color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          Global Notes
        </Typography>
        <Chip label={filteredAndSortedItems.length} color="primary" />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Discover notes shared by the CloudNote community
        </Typography>
        <Chip
          icon={<FilterList />}
          label={showFilters ? 'Hide Filters' : 'Show Filters'}
          onClick={() => setShowFilters(!showFilters)}
          deleteIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
          onDelete={() => setShowFilters(!showFilters)}
          color={showFilters ? 'primary' : 'default'}
          sx={{ cursor: 'pointer' }}
        />
      </Box>

      {/* Collapsible Filters */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              placeholder="🔍 Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="author">Author</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="note">Notes</MenuItem>
                <MenuItem value="folder">Folders</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Author</InputLabel>
              <Select value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)} label="Author">
                <MenuItem value="all">All Authors</MenuItem>
                {authors.map(author => (
                  <MenuItem key={author} value={author}>{author}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      )}

      {filteredAndSortedItems.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Public sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No global notes yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to share a note with the community!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedItems.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => navigate(item.itemType === 'folder' ? `/global/folders/${item.id}` : `/global/notes/${item.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        key={item.authorPhotoURL || item.authorId}
                        src={item.authorPhotoURL}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                      >
                        {item.authorName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                          {item.authorName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 12 }} color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {item.itemType === 'note' && item.type === 'pdf' && item.fileUrl && (
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = item.fileUrl;
                              link.download = item.fileName || 'download.pdf';
                              link.click();
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.shareToken && (
                        <Tooltip title="Copy share link">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyShareLink(item);
                            }}
                          >
                            <Share fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {user && item.authorId === user.uid && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {item.itemType === 'folder' ? (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Folder fontSize="small" color="primary" />
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.noteCount} {item.noteCount === 1 ? 'note' : 'notes'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.type === 'pdf' && <PictureAsPdf fontSize="small" color="error" />}
                        {item.title || 'Untitled Note'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.content?.replace(/<[^>]*>/g, '') || 'No content'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu for remove option */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setSelectedItem(null);
        }}
      >
        {selectedItem?.shareToken && (
          <MenuItem onClick={() => handleCopyShareLink(selectedItem)}>
            <ContentCopy sx={{ mr: 1 }} /> Copy Share Link
          </MenuItem>
        )}
        <MenuItem onClick={handleRemoveItem}>
          <VisibilityOff sx={{ mr: 1 }} /> Remove from Global
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
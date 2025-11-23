import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Public, AccessTime, Download, PictureAsPdf } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { globalAPI, cacheAPI } from '../services/api';

export default function GlobalPage() {
  const navigate = useNavigate();
  const [globalNotes, setGlobalNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Chip label={globalNotes.length} color="primary" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Discover notes shared by the CloudNote community
      </Typography>

      {globalNotes.length === 0 ? (
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
          {globalNotes.map((note) => (
            <Grid item xs={12} md={6} lg={4} key={note.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => navigate(`/global/notes/${note.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        key={note.authorPhotoURL || note.authorId}
                        src={note.authorPhotoURL}
                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                      >
                        {note.authorName?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                          {note.authorName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTime sx={{ fontSize: 12 }} color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {note.type === 'pdf' && note.fileUrl && (
                      <Tooltip title="Download PDF">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = note.fileUrl;
                            link.download = note.fileName || 'download.pdf';
                            link.click();
                          }}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ wordBreak: 'break-word' }}>
                    {note.title || 'Untitled Note'}
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
                    {note.content || 'No content'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
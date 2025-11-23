import { Box, Container, Typography, Button, Stack, Card, CardContent, Grid, IconButton, Chip, Fab } from '@mui/material';
import { Star, StarBorder, AccessTime, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
        <Stack spacing={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            📓 Welcome to CloudNote
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Your personal note-taking app. Organize your thoughts, save your ideas, and never lose a note again.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login?mode=signin')}
              sx={{ px: 4 }}
            >
              Sign In
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login?mode=signup')}
              sx={{ px: 4 }}
            >
              Create Account
            </Button>
          </Stack>

          {/* Features */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
              ✨ Features
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      📝
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Rich Text Editor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Format your notes with bold, italic, lists, and code blocks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      📁
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Organize Notes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create folders and organize your notes by topic
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      🔒
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Secure & Private
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your notes are encrypted and stored securely in the cloud
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      🔍
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Search & Filter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quickly find your notes with powerful search
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      ⚡
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Auto-Save
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your notes are automatically saved as you type
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ mb: 1 }}>
                      📱
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Sync Everywhere
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access your notes from any device, anytime, anywhere
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Container>
    );
  }

  const [recentNotes, setRecentNotes] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const [recent, favorites] = await Promise.all([
          notesAPI.getAll({ limit: 10, sortBy: 'updatedAt', folderId: null, isFavorite: false }),
          notesAPI.getAll({ isFavorite: true })
        ]);
        setRecentNotes(recent);
        setFavoriteNotes(favorites);
        
        const lastVisit = localStorage.getItem('cloudnote-last-visit');
        const now = Date.now();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        
        if (!lastVisit || (now - parseInt(lastVisit)) > weekInMs) {
          setShowWelcome(true);
        }
        
        localStorage.setItem('cloudnote-last-visit', now.toString());
      } catch (error) {
        console.log('Failed to load notes:', error);
      }
      setLoading(false);
    };
    loadNotes();
  }, []);

  const toggleFavorite = async (noteId, isFavorite) => {
    try {
      await notesAPI.update(noteId, { isFavorite: !isFavorite });
      const [recent, favorites] = await Promise.all([
        notesAPI.getAll({ limit: 10, sortBy: 'updatedAt', folderId: null, isFavorite: false }),
        notesAPI.getAll({ isFavorite: true })
      ]);
      setRecentNotes(recent);
      setFavoriteNotes(favorites);
    } catch (error) {
      console.log('Failed to toggle favorite:', error);
    }
  };

  const NoteCard = ({ note, showFavorite = true }) => (
    <Card sx={{ 
      mb: 2, 
      cursor: 'pointer', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': { 
        transform: 'translateY(-2px) scale(1.01)',
        boxShadow: 'rgba(99, 99, 99, 0.3) 0px 8px 16px 0px'
      } 
    }}>
      <CardContent sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/notes/${note.id}`)}>
            <Typography variant="subtitle1" fontWeight="600" noWrap>
              {note.title || 'Untitled Note'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {note.content ? note.content.replace(/<[^>]*>/g, '') : 'No content'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <AccessTime sx={{ fontSize: 14 }} color="action" />
              <Typography variant="caption" color="text.secondary">
                {new Date(note.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          {showFavorite && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(note.id, note.isFavorite);
              }}
            >
              {note.isFavorite ? <Star color="warning" /> : <StarBorder />}
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {showWelcome && (
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              👋 Welcome back, {user.displayName || user.email}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Ready to capture your next idea?
            </Typography>
          </Box>
        )}



        {/* Recent Notes and Favorites */}
        <Grid container spacing={4}>
          {/* Recent Notes */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  🕒 Recent Notes
                </Typography>
                <Button size="small" onClick={() => navigate('/notes')}>View All</Button>
              </Box>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : recentNotes.length > 0 ? (
                recentNotes.map(note => <NoteCard key={note.id} note={note} />)
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent notes. Create your first note!
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>

          {/* Favorite Notes */}
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  ⭐ Favorite Notes
                </Typography>
                <Chip label={favoriteNotes.length} size="small" color="warning" />
              </Box>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : favoriteNotes.length > 0 ? (
                favoriteNotes.map(note => <NoteCard key={note.id} note={note} />)
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No favorite notes yet. Star your important notes!
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: 'rgba(99, 99, 99, 0.4) 0px 8px 20px 0px',
            },
          }}
          onClick={() => navigate('/notes/new')}
        >
          <Add />
        </Fab>
      </Stack>
    </Container>
  );
}

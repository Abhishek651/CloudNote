import { Grid, Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

export default function NotesList({ notes, onSelectNote, onDeleteNote }) {
  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  if (notes.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        textAlign="center"
      >
        <Typography variant="h5" color="text.secondary" gutterBottom>
          No notes yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create your first note to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Notes
      </Typography>
      <Grid container spacing={2}>
        {notes.map((note) => (
          <Grid item xs={12} sm={6} md={4} key={note.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => onSelectNote(note)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" noWrap sx={{ flex: 1, mr: 1 }}>
                    {note.title || 'Untitled'}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <Box
                  sx={(theme) => ({
                    ...theme.typography.body2,
                    color: theme.palette.text.secondary,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2,
                    minHeight: '3.6em',
                    '& a': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline',
                    }
                  })}
                  dangerouslySetInnerHTML={{ __html: note.content || 'No content' }}
                />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={formatDate(note.updatedAt)}
                    size="small"
                    variant="outlined"
                  />
                  <EditIcon fontSize="small" color="action" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
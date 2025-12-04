import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { ArrowBack, Public, Folder, PictureAsPdf } from '@mui/icons-material';
import SharedContentGate from '../components/SharedContentGate';

function SubfolderView({ subfolder, basePath }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <Box>
      <Card
        sx={{
          cursor: 'pointer',
          '&:hover': { boxShadow: 3 },
          mb: 2,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Folder sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">{subfolder.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {subfolder.notes?.length || 0} notes, {subfolder.folders?.length || 0} folders
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {expanded && (
        <Box sx={{ ml: 4, mt: 2 }}>
          {subfolder.folders?.length > 0 && (
            <Box mb={3}>
              {subfolder.folders.map((sub) => (
                <SubfolderView key={sub.id} subfolder={sub} basePath={basePath} />
              ))}
            </Box>
          )}

          {subfolder.notes?.length > 0 && (
            <Grid container spacing={2}>
              {subfolder.notes.map((note) => (
                <Grid item xs={12} md={6} lg={4} key={note.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/global/notes/${note.id}`);
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {note.type === 'pdf' && <PictureAsPdf fontSize="small" color="error" />}
                        {note.title || 'Untitled Note'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function GlobalFolderViewPage({ isShared = false }) {
  const { folderId, shareToken } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFolderData = async () => {
      try {
        let folderData;
        
        if (isShared && shareToken) {
          try {
            // Try direct share link first
            folderData = await foldersAPI.getByShareToken(shareToken);
          } catch (directErr) {
            // Fallback to global share link
            const folderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/global/share/folder/${shareToken}`);
            if (!folderRes.ok) throw new Error('Shared folder not found');
            folderData = await folderRes.json();
          }
        } else {
          const folderRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/global/folders/${folderId}`);
          if (!folderRes.ok) throw new Error('Folder not found');
          folderData = await folderRes.json();
        }
        
        setFolder(folderData);
      } catch (error) {
        console.error('Failed to load folder:', error);
      }
      setLoading(false);
    };

    loadFolderData();
  }, [folderId, shareToken, isShared]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!folder) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Folder not found</Typography>
      </Container>
    );
  }

  const structure = folder.structure || { folders: [], notes: [] };

  const content = (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" variant="body1" onClick={() => navigate('/global')}>
          <Public fontSize="small" sx={{ mr: 0.5 }} />
          Global
        </Link>
        <Typography color="text.primary">{folder.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/global')}>
          <ArrowBack />
        </IconButton>
        <Folder color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          {folder.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar src={folder.authorPhotoURL} sx={{ width: 40, height: 40 }}>
          {folder.authorName?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="600">
            {folder.authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Shared on {new Date(folder.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {structure.notes.length === 0 && structure.folders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              This folder is empty
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {structure.folders.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" fontWeight="600" gutterBottom>Folders</Typography>
              {structure.folders.map((subfolder) => (
                <SubfolderView key={subfolder.id} subfolder={subfolder} basePath={folderId} />
              ))}
            </Box>
          )}

          {structure.notes.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>Notes</Typography>
              <Grid container spacing={3}>
                {structure.notes.map((note) => (
                  <Grid item xs={12} md={6} lg={4} key={note.id}>
                    <Card
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 3 },
                      }}
                      onClick={() => navigate(`/global/notes/${note.id}`)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {note.type === 'pdf' && <PictureAsPdf fontSize="small" color="error" />}
                          {note.title || 'Untitled Note'}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {note.content?.replace(/<[^>]*>/g, '') || 'No content'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}
    </Container>
  );

  // Wrap with auth gate if it's a shared link
  if (isShared) {
    return <SharedContentGate contentType="folder">{content}</SharedContentGate>;
  }

  return content;
}

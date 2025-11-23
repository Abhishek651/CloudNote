import { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Fab, useTheme, useMediaQuery, Container } from '@mui/material';
import { Menu as MenuIcon, Add as AddIcon, Note as NoteIcon, Folder as FolderIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import NotesList from '../components/NotesList';
import NoteEditor from '../components/NoteEditor';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
    });

    return unsubscribe;
  }, [user]);

  const handleCreateNote = async () => {
    const newNote = {
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'notes'), newNote);
      setSelectedNote({ id: docRef.id, ...newNote });
      setShowEditor(true);
      if (isMobile) setDrawerOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteId, updates) => {
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notes', noteId), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setShowEditor(false);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setShowEditor(true);
    if (isMobile) setDrawerOpen(false);
  };

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">CloudNote</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
      </Box>
      
      <List sx={{ flex: 1 }}>
        <ListItem button onClick={handleCreateNote}>
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText primary="New Note" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><NoteIcon /></ListItemIcon>
          <ListItemText primary="All Notes" />
        </ListItem>
        <ListItem button>
          <ListItemIcon><FolderIcon /></ListItemIcon>
          <ListItemText primary="Folders" />
        </ListItem>
      </List>

      <List>
        <ListItem button>
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={logout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {selectedNote ? selectedNote.title : 'CloudNote'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            mt: isMobile ? 0 : 8,
            height: isMobile ? '100%' : 'calc(100% - 64px)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: '280px' },
          mt: 8,
          height: 'calc(100vh - 64px)',
          display: 'flex',
        }}
      >
        {!showEditor ? (
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <NotesList
              notes={notes}
              onSelectNote={handleSelectNote}
              onDeleteNote={handleDeleteNote}
            />
          </Container>
        ) : (
          <NoteEditor
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onClose={() => setShowEditor(false)}
          />
        )}
      </Box>

      {!showEditor && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { md: 'none' },
          }}
          onClick={handleCreateNote}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import { usersAPI } from './services/api';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import FolderPage from './pages/FolderPage';
import NotesEditor from './pages/NotesEditor';
import NoteViewer from './pages/NoteViewer';
import SettingsPage from './pages/SettingsPage';
import GlobalPage from './pages/GlobalPage';
import GlobalFolderViewPage from './pages/GlobalFolderViewPage';
import AdminPage from './pages/AdminPage';

const createAppTheme = (themeType = 'default') => {
  const themes = {
    default: { primary: '#667eea', secondary: '#764ba2', background: '#fafafa' },
    blue: { primary: '#2196f3', secondary: '#1976d2', background: '#fafafa' },
    green: { primary: '#4caf50', secondary: '#388e3c', background: '#fafafa' },
    orange: { primary: '#ff9800', secondary: '#f57c00', background: '#fafafa' },
    pink: { primary: '#e91e63', secondary: '#c2185b', background: '#fafafa' },
    dark: { primary: '#bb86fc', secondary: '#3700b3', background: '#121212' },
  };

  const selectedTheme = themes[themeType] || themes.default;
  
  return createTheme({
    palette: {
      mode: themeType === 'dark' ? 'dark' : 'light',
      primary: { main: selectedTheme.primary },
      secondary: { main: selectedTheme.secondary },
      background: { default: selectedTheme.background },
    },
    breakpoints: {
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { 
            textTransform: 'none', 
            borderRadius: 8,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 'rgba(99, 99, 99, 0.3) 0px 4px 12px 0px',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: 'rgba(99, 99, 99, 0.25) 0px 4px 12px 0px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 'rgba(99, 99, 99, 0.3) 0px 8px 20px 0px',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.1)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
            },
          },
        },
      },
    },
  });
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Show sidebar for authenticated users */}
      {user && <Sidebar />}

      {/* Main content with offset for sidebar on desktop */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          ml: { xs: 0, sm: 31.25 }, // 250px drawer width / 8 = 31.25rem
          mt: 8, // AppBar height offset
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/notes" element={user ? <NotesPage /> : <Navigate to="/login" />} />
          <Route path="/notes/new" element={user ? <NotesEditor /> : <Navigate to="/login" />} />
          <Route path="/notes/:noteId" element={user ? <NoteViewer /> : <Navigate to="/login" />} />
          <Route path="/notes/:noteId/edit" element={user ? <NotesEditor /> : <Navigate to="/login" />} />
          <Route path="/folders/:folderId" element={user ? <FolderPage /> : <Navigate to="/login" />} />
          <Route path="/global" element={user ? <GlobalPage /> : <Navigate to="/login" />} />
          <Route path="/global/notes/:noteId" element={<NoteViewer />} />
          <Route path="/global/folders/:folderId" element={<GlobalFolderViewPage />} />
          <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/admin" element={user ? <AdminPage /> : <Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [userTheme, setUserTheme] = useState(() => {
    return localStorage.getItem('cloudnote-theme') || 'default';
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('cloudnote-theme') || 'default';
    setUserTheme(savedTheme);
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newTheme = localStorage.getItem('cloudnote-theme') || 'default';
      setUserTheme(newTheme);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider theme={createAppTheme(userTheme)}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}
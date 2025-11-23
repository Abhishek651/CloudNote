import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Notes as NotesIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Public as PublicIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, cacheAPI } from '../services/api';

import logger from '../utils/logger';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [displayName, setDisplayName] = useState('');

  const loadProfile = async () => {
    if (!user) return;
    try {
      // Clear cache to ensure fresh data
      cacheAPI.invalidate('^GET:/api/users');
      
      const profile = await usersAPI.getProfile();
      setProfilePic(profile.photoURL || '');
      setDisplayName(profile.displayName || user.displayName || '');
    } catch (error) {
      logger.error('Sidebar', 'Failed to load profile', { error: error.message });
      setDisplayName(user.displayName || '');
      setProfilePic('');
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        setTimeout(() => loadProfile(), 100);
      }
    };
    
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      logger.info('Sidebar', 'Initiating logout', {});
      await logout();
      handleMenuClose();
      navigate('/login');
    } catch (err) {
      logger.error('Sidebar', 'Logout failed', { error: err.message });
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) => {
    // Exact match for root
    if (path === '/') {
      return location.pathname === '/';
    }
    // Prefix match for nested routes
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdmin = user?.email === 'cyberlord700@gmail.com';

  const menuItems = [
    { label: '🏠 Home', path: '/' },
    { label: '📝 Notes', path: '/notes' },
    { label: '🌍 Global', path: '/global' },
    { label: '⚙️ Settings', path: '/settings' },
    ...(isAdmin ? [{ label: '👑 Admin', path: '/admin' }] : []),
  ];

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      {/* User Profile Section */}
      {user && (
        <>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              key={profilePic}
              src={profilePic}
              sx={{
                bgcolor: 'primary.main',
                cursor: 'pointer',
                width: 40,
                height: 40,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  boxShadow: 'rgba(99, 99, 99, 0.3) 0px 4px 12px 0px',
                },
              }}
              onClick={handleMenuOpen}
            >
              {user.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Stack sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="600" sx={{ wordBreak: 'break-word' }}>
                {displayName || user.displayName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                {user.email}
              </Typography>
            </Stack>
          </Box>
          <Divider />
        </>
      )}

      {/* Navigation Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
              sx={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 2,
                mx: 1,
                '&:hover': {
                  transform: 'translateX(8px)',
                  bgcolor: 'primary.light',
                },
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  transform: 'translateX(4px)',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'translateX(8px)',
                  },
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Top App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { xs: 'flex', sm: 'none' } }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Logo */}
          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '1.25rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            📓 CloudNote
          </Box>

          {/* Right Side - User Menu */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar
                  key={profilePic}
                  src={profilePic}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'secondary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            mt: 8, // Offset from AppBar
          },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
          <AccountCircleIcon sx={{ mr: 1 }} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}

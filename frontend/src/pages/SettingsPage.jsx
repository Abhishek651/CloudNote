import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { usersAPI, cacheAPI } from '../services/api';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

import logger from '../utils/logger';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { toast, showToast, hideToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [uploading, setUploading] = useState(false);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = async () => {
    if (!user) return;
    try {
      // Clear cache to ensure fresh data
      cacheAPI.invalidate('^GET:/api/users');
      
      const profile = await usersAPI.getProfile();
      setDisplayName(profile.displayName || '');
      setProfilePic(profile.photoURL || '');
    } catch (err) {
      logger.error('SettingsPage', 'Failed to load profile', { error: err.message });
    }
  };

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      const savedTheme = localStorage.getItem('cloudnote-theme') || 'default';
      setSelectedTheme(savedTheme);
      loadProfile();
    }
  }, [user]);

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('❌ Profile picture must be smaller than 2MB');
      showToast('❌ Profile picture must be smaller than 2MB', 'error');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result;
        setProfilePic(base64);
        
        try {
          await usersAPI.updateProfile({
            displayName,
            photoURL: base64,
            theme: selectedTheme,
          });
          
          // Clear cache and reload profile
          cacheAPI.invalidate('^GET:/api/users');
          await loadProfile();
          
          // Notify other components
          window.dispatchEvent(new CustomEvent('profile-updated'));
          
          showToast('✅ Profile picture updated', 'success');
        } catch (err) {
          logger.error('SettingsPage', 'Failed to update profile picture', { error: err.message });
          showToast('❌ Failed to update profile picture', 'error');
          setProfilePic('');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(`❌ Failed to upload picture: ${err.message}`);
      showToast(`❌ Failed to upload picture: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyTheme = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info('SettingsPage', 'Applying theme', { selectedTheme });
      localStorage.setItem('cloudnote-theme', selectedTheme);
      window.dispatchEvent(new Event('storage'));
      
      setSuccess('✅ Theme applied successfully');
      showToast('✅ Theme applied successfully!', 'success');
      logger.info('SettingsPage', 'Theme applied', { selectedTheme });
    } catch (err) {
      logger.error('SettingsPage', 'Failed to apply theme', { error: err.message });
      setError(`❌ Failed to apply theme: ${err.message}`);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info('SettingsPage', 'Saving profile', { displayName });
      
      await usersAPI.updateProfile({
        displayName,
        photoURL: profilePic,
        theme: selectedTheme,
      });
      
      // Clear cache and reload profile
      cacheAPI.invalidate('^GET:/api/users');
      await loadProfile();
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('profile-updated'));
      
      setSuccess('✅ Profile updated successfully');
      showToast('✅ Profile updated successfully!', 'success');
      logger.info('SettingsPage', 'Profile saved', { displayName });
    } catch (err) {
      logger.error('SettingsPage', 'Failed to save profile', { error: err.message });
      setError(`❌ Failed to save profile: ${err.message}`);
      showToast(`❌ Failed to save profile: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      logger.info('SettingsPage', 'Changing password', {});
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setSuccess('✓ Password changed successfully');
      showToast('✅ Password changed successfully', 'success');
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      logger.info('SettingsPage', 'Password changed successfully', {});
    } catch (err) {
      logger.error('SettingsPage', 'Failed to change password', { error: err.message });
      if (err.code === 'auth/wrong-password') {
        setError('❌ Current password is incorrect');
      } else {
        setError(`❌ Failed to change password: ${err.message}`);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      logger.info('SettingsPage', 'Logging out', {});
      await logout();
      navigate('/login');
      logger.info('SettingsPage', 'Logout successful', {});
    } catch (err) {
      logger.error('SettingsPage', 'Logout failed', { error: err.message });
      setError(`❌ Failed to logout: ${err.message}`);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to access settings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
        ⚙️ Settings
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          👤 Profile Settings
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                key={profilePic}
                src={profilePic}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: 32,
                }}
              >
                {displayName.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-pic-input"
                type="file"
                onChange={handleProfilePicUpload}
                disabled={uploading}
              />
              <label htmlFor="profile-pic-input">
                <IconButton
                  component="span"
                  disabled={uploading}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                  size="small"
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </label>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Joined {new Date(user.metadata?.creationTime).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Max 2MB
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            value={email}
            disabled
            helperText="Email cannot be changed here"
          />

          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={loading}
            sx={{ alignSelf: 'flex-start', mt: 2 }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {loading ? 'Saving...' : '💾 Save Profile'}
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🎨 Preferences
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Theme
            </Typography>
            <Stack spacing={2}>
              {[
                { value: 'default', label: '🌟 Default (Purple)', color: '#667eea' },
                { value: 'blue', label: '💙 Ocean Blue', color: '#2196f3' },
                { value: 'green', label: '🌿 Nature Green', color: '#4caf50' },
                { value: 'orange', label: '🔥 Sunset Orange', color: '#ff9800' },
                { value: 'pink', label: '🌸 Cherry Blossom', color: '#e91e63' },
                { value: 'dark', label: '🌙 Dark Mode', color: '#424242' },
              ].map((t) => (
                <Box
                  key={t.value}
                  onClick={() => setSelectedTheme(t.value)}
                  sx={{
                    p: 2,
                    border: selectedTheme === t.value ? '2px solid' : '1px solid',
                    borderColor: selectedTheme === t.value ? t.color : 'divider',
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: t.color,
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: t.color,
                    }}
                  />
                  <Typography variant="body1">{t.label}</Typography>
                  {selectedTheme === t.value && (
                    <Typography variant="body2" color="primary" sx={{ ml: 'auto' }}>
                      ✓ Selected
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
            <Button
              variant="contained"
              onClick={handleApplyTheme}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              🎨 Apply Theme
            </Button>
          </Box>

          <FormControlLabel
            control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
            label="🔔 Enable Notifications (coming soon)"
            disabled
          />
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🔒 Security
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Manage your password and security settings.
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setPasswordDialogOpen(true)}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            🔑 Change Password
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📋 Account
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            🚪 Logout
          </Button>
        </Stack>
      </Paper>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔑 Change Password</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              helperText="Minimum 6 characters"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast 
        open={toast?.open || false} 
        message={toast?.message} 
        severity={toast?.severity} 
        onClose={hideToast}
      />
    </Container>
  );
}

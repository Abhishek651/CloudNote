import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, TextField, InputAdornment,
  Tabs, Tab, List, ListItem, ListItemText, Divider
} from '@mui/material';
import {
  People, Note, Folder, Public, Block, CheckCircle,
  Delete, Visibility, Search, VpnKey, Description
} from '@mui/icons-material';
import { adminAPI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [userNotes, setUserNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordUser, setPasswordUser] = useState(null);

  const isAdmin = user?.email === 'cyberlord700@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers()
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (uid) => {
    try {
      const details = await adminAPI.getUserDetails(uid);
      setSelectedUser(details);
      setDetailsOpen(true);
      setTabValue(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewNotes = async (uid) => {
    try {
      setNotesLoading(true);
      const { notes } = await adminAPI.getUserNotes(uid);
      setUserNotes(notes);
      setTabValue(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await adminAPI.deleteUserNote(selectedUser.uid, noteId);
      setUserNotes(userNotes.filter(n => n.id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (uid, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(uid, !currentStatus);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await adminAPI.deleteUser(userToDelete);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      await adminAPI.resetPassword(passwordUser, newPassword);
      setPasswordDialogOpen(false);
      setNewPassword('');
      setPasswordUser(null);
      setError('');
      alert('Password reset successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Access Denied: Admin privileges required</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        🛡️ Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Users</Typography>
                  <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
                </Box>
                <People sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Notes</Typography>
                  <Typography variant="h4">{stats?.totalNotes || 0}</Typography>
                </Box>
                <Note sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">Total Folders</Typography>
                  <Typography variant="h4">{stats?.totalFolders || 0}</Typography>
                </Box>
                <Folder sx={{ fontSize: 48, color: 'warning.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="body2">Global Notes</Typography>
                  <Typography variant="h4">{stats?.totalGlobalNotes || 0}</Typography>
                </Box>
                <Public sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Paper sx={{ p: { xs: 1, sm: 2 } }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2} mb={2}>
          <Typography variant="h6">User Management</Typography>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ maxWidth: { sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Display Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Last Sign In</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell sx={{ minWidth: 150 }}>{u.email}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{u.displayName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.disabled ? 'Disabled' : 'Active'}
                      color={u.disabled ? 'error' : 'success'}
                      size="small"
                      icon={u.disabled ? <Block /> : <CheckCircle />}
                    />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right" sx={{ minWidth: 180 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton size="small" onClick={() => handleViewDetails(u.uid)} title="View Details">
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(u.uid, u.disabled)}
                        color={u.disabled ? 'success' : 'warning'}
                        title={u.disabled ? 'Enable User' : 'Disable User'}
                      >
                        {u.disabled ? <CheckCircle /> : <Block />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setPasswordUser(u.uid);
                          setPasswordDialogOpen(true);
                        }}
                        title="Reset Password"
                      >
                        <VpnKey />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setUserToDelete(u.uid);
                          setDeleteConfirmOpen(true);
                        }}
                        title="Delete User"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* User Details Dialog with Tabs */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Management</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Details" />
            <Tab label="Notes" onClick={() => selectedUser && handleViewNotes(selectedUser.uid)} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {selectedUser && (
              <List>
                <ListItem><ListItemText primary="UID" secondary={selectedUser.uid} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Email" secondary={selectedUser.email} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Display Name" secondary={selectedUser.displayName || '-'} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Email Verified" secondary={selectedUser.emailVerified ? 'Yes' : 'No'} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Status" secondary={selectedUser.disabled ? 'Disabled' : 'Active'} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Theme" secondary={selectedUser.theme} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Notes Count" secondary={selectedUser.notesCount} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Folders Count" secondary={selectedUser.foldersCount} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Created" secondary={new Date(selectedUser.createdAt).toLocaleString()} /></ListItem>
                <Divider />
                <ListItem><ListItemText primary="Last Sign In" secondary={selectedUser.lastSignIn ? new Date(selectedUser.lastSignIn).toLocaleString() : '-'} /></ListItem>
              </List>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {notesLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {userNotes.length === 0 ? (
                  <ListItem><ListItemText primary="No notes found" /></ListItem>
                ) : (
                  userNotes.map((note) => (
                    <Box key={note.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" color="error" onClick={() => handleDeleteNote(note.id)}>
                            <Delete />
                          </IconButton>
                        }
                      >
                        <Description sx={{ mr: 2 }} />
                        <ListItemText
                          primary={note.title || 'Untitled'}
                          secondary={`Created: ${new Date(note.createdAt).toLocaleDateString()}`}
                        />
                      </ListItem>
                      <Divider />
                    </Box>
                  ))
                )}
              </List>
            )}
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Reset User Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Enter a new password for the user (min 6 characters)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={newPassword.length < 6}>
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone and will delete all their data.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

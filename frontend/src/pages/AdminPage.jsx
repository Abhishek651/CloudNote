import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import {
  People, Note, Folder, Public, Block, CheckCircle,
  Delete, Visibility, Search
} from '@mui/icons-material';
import { adminAPI } from '../services/adminApi';
import { useAuth } from '../context/AuthContext';

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
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">User Management</Typography>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Sign In</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.displayName || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.disabled ? 'Disabled' : 'Active'}
                      color={u.disabled ? 'error' : 'success'}
                      size="small"
                      icon={u.disabled ? <Block /> : <CheckCircle />}
                    />
                  </TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewDetails(u.uid)}>
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(u.uid, u.disabled)}
                      color={u.disabled ? 'success' : 'warning'}
                    >
                      {u.disabled ? <CheckCircle /> : <Block />}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setUserToDelete(u.uid);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography><strong>UID:</strong> {selectedUser.uid}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Display Name:</strong> {selectedUser.displayName || '-'}</Typography>
              <Typography><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</Typography>
              <Typography><strong>Status:</strong> {selectedUser.disabled ? 'Disabled' : 'Active'}</Typography>
              <Typography><strong>Theme:</strong> {selectedUser.theme}</Typography>
              <Typography><strong>Notes Count:</strong> {selectedUser.notesCount}</Typography>
              <Typography><strong>Folders Count:</strong> {selectedUser.foldersCount}</Typography>
              <Typography><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</Typography>
              <Typography><strong>Last Sign In:</strong> {selectedUser.lastSignIn ? new Date(selectedUser.lastSignIn).toLocaleString() : '-'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

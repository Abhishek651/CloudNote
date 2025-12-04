import { Box, Card, CardContent, Typography, Button, Container } from '@mui/material';
import { Lock, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SharedContentGate({ children, contentType = 'note' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <CardContent>
            <Lock sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              This {contentType} is shared with you, but you need to sign in or create an account to view it.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Login />}
                onClick={() => navigate('/login', { state: { returnTo: window.location.pathname } })}
              >
                Sign In / Sign Up
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return children;
}

import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Alert, Container, useTheme, useMediaQuery, CircularProgress, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions, Link, FormControlLabel, Checkbox } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import logger from '../utils/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Real-time email validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    }
  };

  // Real-time password validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError('');
    setPasswordConfirmError('');
    
    if (isSignup && value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    }
    
    // Check match if password confirm is already filled
    if (isSignup && passwordConfirm && value !== passwordConfirm) {
      setPasswordConfirmError('Passwords do not match');
    }
  };

  // Real-time password confirmation validation
  const handlePasswordConfirmChange = (e) => {
    const value = e.target.value;
    setPasswordConfirm(value);
    setPasswordConfirmError('');
    
    if (isSignup && value && password && value !== password) {
      setPasswordConfirmError('Passwords do not match');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logger.info('LoginPage', 'Form submitted', { email, isSignup });
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      logger.info('LoginPage', 'Validating inputs', { email, passwordLength: password.length });
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      if (isSignup && !passwordConfirm) {
        throw new Error('Please confirm your password');
      }
      if (!email.includes('@')) {
        setEmailError('Please enter a valid email address');
        throw new Error('Invalid email format');
      }
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        throw new Error('Password must be at least 6 characters');
      }
      if (isSignup && password !== passwordConfirm) {
        setPasswordConfirmError('Passwords do not match');
        throw new Error('Passwords do not match');
      }

      logger.info('LoginPage', 'Calling auth function', { isSignup, email, rememberMe });
      if (isSignup) {
        await signup(email, password);
        logger.info('LoginPage', 'Signup completed');
        setSuccess('✅ Account created successfully! Redirecting...');
      } else {
        await login(email, password, rememberMe);
        logger.info('LoginPage', 'Login completed');
        setSuccess('✅ Login successful! Redirecting...');
      }
      logger.info('LoginPage', 'Auth successful, redirecting');
      
      // Redirect to returnTo path if provided, otherwise go to home
      const returnTo = location.state?.returnTo || '/';
      setTimeout(() => navigate(returnTo), 1000);
    } catch (err) {
      logger.error('LoginPage', `Error during auth: ${err.code || 'UNKNOWN'} - ${err.message}`, {
        code: err?.code || 'UNKNOWN',
        message: err?.message || 'No message',
        error: err,
      });
      // Provide user-friendly error message
      let userMessage = err.message || 'An error occurred';
      if (err?.code === 'auth/user-not-found') {
        userMessage = '❌ No account found. Please sign up first or check your email.';
      } else if (err?.code === 'auth/wrong-password') {
        userMessage = '❌ Incorrect password. Please try again.';
      } else if (err?.code === 'auth/invalid-credential') {
        userMessage = isSignup ? '❌ Unable to create account. Email may already exist.' : '❌ Invalid email or password. Please try again.';
      } else if (err?.code === 'auth/email-already-in-use') {
        userMessage = '❌ This email is already registered. Please sign in instead.';
      } else if (err?.code === 'auth/weak-password') {
        userMessage = '❌ Password is too weak. Use at least 6 characters with a mix of letters and numbers.';
      } else if (err?.code === 'auth/invalid-email') {
        userMessage = '❌ Invalid email address. Please check and try again.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        userMessage = '❌ Email/password sign-in is not currently available. Please try again later.';
      } else if (err?.code === 'auth/configuration-not-found') {
        userMessage = '❌ Firebase is not properly configured. Please contact support.';
      }
      setError(userMessage);
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox.');
      setResetDialogOpen(false);
      setResetEmail('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        overflow: 'auto',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: 3,
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              ✍️ CloudNote
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {isSignup 
                ? 'Create your account to start taking smart notes' 
                : 'Sign in to your account'}
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✓ {success}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ⚠️ {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                margin="normal"
                required
                autoFocus
                error={!!emailError}
                helperText={emailError}
                placeholder="example@email.com"
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                margin="normal"
                required
                error={!!passwordError}
                helperText={passwordError}
              />
            </Box>

            {/* Password Confirmation Field (only in signup) */}
            {isSignup && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={passwordConfirm}
                  onChange={handlePasswordConfirmChange}
                  margin="normal"
                  required
                  error={!!passwordConfirmError}
                  helperText={passwordConfirmError}
                />
              </Box>
            )}

            {/* Remember Me Checkbox (only for login) */}
            {!isSignup && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">Remember me</Typography>}
                />
                <Link
                  component="button"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    setResetDialogOpen(true);
                  }}
                  sx={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  Forgot password?
                </Link>
              </Box>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !!emailError || !!passwordError || (isSignup && !!passwordConfirmError)}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </Box>
              ) : (
                isSignup ? '🚀 Sign Up' : '✓ Sign In'
              )}
            </Button>

            {/* Toggle Button */}
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setSuccess('');
                setEmailError('');
                setPasswordError('');
                setPasswordConfirmError('');
              }}
              sx={{ mb: 2 }}
            >
              {isSignup 
                ? '← Already have an account? Sign In' 
                : "Don't have an account? Sign Up →"}
            </Button>

            {/* Forgot Password Link */}
            {!isSignup && (
              <Box textAlign="center" sx={{ mb: 2 }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ textDecoration: 'none' }}
                >
                  🔑 Forgot Password?
                </Link>
              </Box>
            )}

            {/* Helpful tip */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                backgroundColor: '#f5f5f5',
                border: '1px solid #e0e0e0',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                💡 <strong>Helpful tip:</strong>
              </Typography>
              {isSignup ? (
                <Typography variant="caption" color="text.secondary">
                  Create a new account with your email and a secure password. You'll get instant access to CloudNote.
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Don't have an account yet? Click "Sign Up" above to create one in seconds.
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Password Reset Dialog */}
        <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>🔑 Reset Password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={loading}
              autoFocus
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePasswordReset}
              variant="contained"
              disabled={loading || !resetEmail}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reset Success Alert */}
        {resetSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {resetSuccess}
          </Alert>
        )}

        {/* Footer Help Text */}
        <Box textAlign="center" sx={{ mt: 3 }}>
          <Typography variant="caption" color="rgba(255,255,255,0.8)">
            Need help? CloudNote is your smart note-taking companion
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
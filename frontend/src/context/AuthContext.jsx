import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import logger from '../utils/logger';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Log Firebase auth config on mount
  useEffect(() => {
    logger.info('AuthContext', 'Firebase Auth initialized', {
      appName: auth.app?.name || 'default',
      config: {
        projectId: auth.app?.options?.projectId || 'N/A',
        apiKey: auth.app?.options?.apiKey ? '***' : 'MISSING',
        authDomain: auth.app?.options?.authDomain || 'N/A',
      },
    });
  }, []);

  useEffect(() => {
    logger.info('AuthContext', 'Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      logger.info('AuthContext', 'Auth state changed', {
        uid: user?.uid || null,
        email: user?.email || null,
        isAuthenticated: !!user,
      });
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    logger.info('AuthContext', 'Attempting login', { email });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      logger.info('AuthContext', 'Login successful', {
        uid: result.user?.uid,
        email: result.user?.email,
      });
      return result;
    } catch (error) {
      logger.error('AuthContext', `Login failed: ${error.code} - ${error.message}`, { code: error.code, message: error.message, error });
      throw error;
    }
  };

  const signup = async (email, password) => {
    logger.info('AuthContext', 'Attempting signup', { email });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      logger.info('AuthContext', 'Signup successful', {
        uid: result.user?.uid,
        email: result.user?.email,
      });
      return result;
    } catch (error) {
      logger.error('AuthContext', 'Signup failed', { code: error.code, message: error.message, error });
      throw error;
    }
  };

  const logout = async () => {
    logger.info('AuthContext', 'Attempting logout');
    try {
      await signOut(auth);
      logger.info('AuthContext', 'Logout successful');
    } catch (error) {
      logger.error('AuthContext', 'Logout failed', { code: error.code, message: error.message, error });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
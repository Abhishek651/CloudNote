import admin from '../config/firebase.js';
import logger from '../utils/logger.js';

const ADMIN_EMAILS = [
  'cyberlord700@gmail.com'
];

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!ADMIN_EMAILS.includes(decodedToken.email)) {
      logger.warn('AdminAuth', 'Unauthorized admin access attempt', { email: decodedToken.email });
      return res.status(403).json({ error: 'Admin access denied' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error('AdminAuth', 'Admin auth error', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
};

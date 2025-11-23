import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {};

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  serviceAccount.credential = admin.credential.applicationDefault();
} else if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
) {
  serviceAccount.credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });
} else {
  console.error(
    'Firebase Admin SDK credentials are not configured. Please set GOOGLE_APPLICATION_CREDENTIALS or all of FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
  );
  process.exit(1); // Exit the process if credentials are not found
}

admin.initializeApp({
  ...serviceAccount,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export default admin;

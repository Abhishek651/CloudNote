# CloudNote Deployment Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+ (frontend) / 18+ (backend)
- npm 9+
- Firebase project with Firestore and Authentication enabled
- Firebase service account key (download from Firebase Console → Project Settings → Service Accounts)

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file with your Firebase credentials:
```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=http://localhost:5173
```

**Alternative (easier for local dev):** Set path to service account JSON:
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

Start backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Update `.env` with your Firebase Web config (from Firebase Console → Project Settings):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_API_BASE_URL=http://localhost:5000
VITE_AI_ENABLED=false
```

Start frontend:
```bash
npm run dev
# App runs on http://localhost:5173
```

### 3. Access the App
- **Frontend**: http://localhost:5173 (sign up, then log in)
- **Backend API**: http://localhost:5000/health (health check)
- **API Routes**: See [API_TESTING.md](./API_TESTING.md) for endpoint examples

## 📱 Features Implemented

✅ **Responsive Design**: Mobile-first approach with Material-UI v7
✅ **Authentication**: Firebase Auth with email/password + real-time state
✅ **Notes Management**: Create, edit, delete, archive notes with tags
✅ **Rich Text Editor**: Bold, italic, code, lists, markdown support, auto-save
✅ **Note Search**: Search by title or content, filter by folder
✅ **Folders**: Create folders and organize notes
✅ **Settings**: User profile management, password change, preferences
✅ **PWA Support**: Installable as mobile app, offline-capable
✅ **Cross-Platform**: Works on desktop, tablet, and mobile
✅ **Real-time Sync**: Firestore sync, 3-second auto-save debounce
✅ **Secure API**: Firebase Admin SDK with token verification, ownership checks

## 🎨 Mobile Optimizations

- Touch-friendly interface with proper tap targets (Material-UI)
- Responsive breakpoints: xs (mobile), sm (tablet), md (desktop)
- Mobile-specific drawer navigation (temporary) vs desktop (permanent)
- Optimized typography and spacing for readability
- PWA manifest for app installation + splash screens
- Service worker for offline capabilities
- Retina-display icon support (SVG + PNG variants)

## � Production Deployment

### Option 1: Vercel (Frontend) + Google Cloud Run (Backend) [RECOMMENDED]

#### Frontend: Vercel
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set environment variables (VITE_* prefixed Firebase config + VITE_API_BASE_URL)
4. Deploy (auto-deploys on git push)

#### Backend: Google Cloud Run
1. Create Dockerfile in backend/
2. Set `GOOGLE_APPLICATION_CREDENTIALS` secret in Cloud Secret Manager
3. Deploy: `gcloud run deploy cloudnote-backend --image gcr.io/$PROJECT_ID/cloudnote-backend`
4. Get service URL and update frontend `VITE_API_BASE_URL`

### Option 2: Netlify (Frontend) + Heroku (Backend)

**Frontend:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Backend:**
```bash
heroku create cloudnote-backend
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 3: Railway (Full Stack)
- Connect GitHub repo
- Railway auto-detects Node.js
- Auto-deploys frontend and backend
- Simplest setup for small projects

## 🔐 Firestore Security Rules (Production)

Set in Firebase Console → Firestore → Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /notes/{noteId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
      allow create: if request.auth.uid == request.resource.data.ownerId;
    }
    match /folders/{folderId} {
      allow read, write: if request.auth.uid == resource.data.ownerId;
      allow create: if request.auth.uid == request.resource.data.ownerId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔍 Monitoring

- **Firebase Console**: Firestore usage, Auth activity, real-time statistics
- **Backend Logs**: Cloud Run → Logs, check [API_TESTING.md](./API_TESTING.md) for debugging
- **Performance**: Monitor query latency, storage growth, auth failures

## 📚 References

- [API Testing Guide](./API_TESTING.md) - Test all endpoints with curl/Postman
- [Backend README](./backend/README.md) - API documentation
- [Frontend README](./frontend/README.md) - Development setup
- [Firebase Docs](https://firebase.google.com/docs) - Official Firebase documentation

The app is now fully responsive and ready for production use!
# Vercel Deployment Guide for CloudNote

## Prerequisites
- GitHub account with CloudNote repository
- Vercel account (sign up at https://vercel.com)
- Firebase project configured

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Deploy Frontend:
1. Go to https://vercel.com/new
2. Import your GitHub repository: `Abhishek651/CloudNote`
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=https://your-backend.vercel.app
   VITE_LOG_LEVEL=none
   ```
5. Click **Deploy**

#### Deploy Backend:
1. Go to https://vercel.com/new
2. Import the same repository again
3. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   LOG_LEVEL=none
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY=your_private_key
   ```
5. Click **Deploy**

### Option 2: Deploy via Vercel CLI

#### Install Vercel CLI:
```bash
npm install -g vercel
```

#### Deploy Frontend:
```bash
cd frontend
vercel --prod
```

#### Deploy Backend:
```bash
cd backend
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Frontend Environment Variables
After backend is deployed, update frontend's `VITE_API_URL` with the backend URL.

### 2. Update Backend Environment Variables
Update backend's `FRONTEND_URL` with the frontend URL.

### 3. Configure Firebase
- Add your Vercel frontend domain to Firebase Authentication authorized domains
- Update Firestore security rules if needed
- Update CORS settings in backend if needed

### 4. Test Deployment
- Visit your frontend URL
- Test login/signup
- Test creating notes
- Test all features

## Environment Variables Reference

### Frontend (.env.production)
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=https://your-backend.vercel.app
VITE_LOG_LEVEL=none
```

### Backend (.env.production)
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
LOG_LEVEL=none
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Troubleshooting

### Build Fails
- Check Node.js version (frontend needs 20.19+, backend needs 18+)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify VITE_API_URL is correct in frontend
- Check CORS settings in backend
- Verify Firebase credentials are correct

### Authentication Issues
- Add Vercel domain to Firebase authorized domains
- Check Firebase API keys are correct
- Verify environment variables are set

## Custom Domain (Optional)
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

## Continuous Deployment
Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

## Monitoring
- View deployment logs in Vercel dashboard
- Check Analytics in Vercel
- Monitor Firebase usage in Firebase Console

## Support
- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- GitHub Issues: https://github.com/Abhishek651/CloudNote/issues

   # CloudNote — Backend

   ![Node.js](https://img.shields.io/badge/Node->=18.0.0-brightgreen)
   ![Express](https://img.shields.io/badge/Express-5.x-lightgrey)

   ## Overview

   This repository contains the Express backend for CloudNote. It exposes a small set of endpoints and is prepared to integrate with Firebase Admin for authentication and Firestore operations. The server is implemented using ESM modules and Express 5.

   ## Prerequisites

   - Node.js >= 18.0.0
   - npm
   - (For Firebase Admin) a Firebase project and service account JSON for local testing

   ## Quickstart

   ```bash
   git clone <repository-url>
   cd CloudeNote/backend
   npm install
   cp .env.example .env
   # edit .env to set values (see Environment Variables below)
   npm run dev
   ```

   The development server runs on http://localhost:5000 by default.

   ## API Endpoints

   ### Health Check
   - **GET** `/health`
     - Returns: `{ "status": "ok", "timestamp": 1640995200000 }`

   ### Authentication
   All note endpoints require Firebase ID token in `Authorization: Bearer <token>` header.

   - **GET** `/api/auth/profile` — Get current user profile
     - Returns: `{ uid, email, displayName, photoURL }`

   ### Notes CRUD
   - **GET** `/api/notes` — Get all notes for authenticated user
     - Query params: `folderId` (optional), `limit` (default: 100)
     - Returns: Array of notes with `id, ownerId, title, content, folderId, tags, createdAt, updatedAt, isArchived`

   - **GET** `/api/notes/:id` — Get a single note (verify ownership)
     - Returns: Single note object

   - **POST** `/api/notes` — Create new note
     - Body: `{ title?, content?, folderId?, tags? }`
     - Returns: Created note object with `id`

   - **PUT** `/api/notes/:id` — Update note (verify ownership)
     - Body: `{ title?, content?, folderId?, tags?, isArchived? }`
     - Returns: `{ message, id }`

   - **DELETE** `/api/notes/:id` — Delete note (verify ownership)
     - Returns: `{ message, id }`

   All responses include error details if operation fails (401 for auth, 403 for unauthorized, 404 for not found).

   ## Available scripts

   - `npm run dev` — start development server with nodemon
   - `npm start` — start production server
   - `npm run lint` — run ESLint (if configured)

   ## Project structure

   ```
   backend/
   ├── src/
   │   ├── api/           # API route handlers (planned)
   │   ├── services/      # Business logic and external integrations
   │   ├── middleware/    # Express middleware (auth, error handling, rate limit)
   │   ├── utils/         # Utility functions
   │   └── config/        # Configuration modules
   ├── .env.example       # Environment variables template
   ├── package.json
   └── README.md
   ```

   ## Environment variables

   Copy `.env.example` to `.env` and set the following values for local development:

   - `PORT` — server port (default: 5000)
   - `NODE_ENV` — development/production
   - `FRONTEND_URL` — allowed CORS origin (e.g., http://localhost:5173)
   - `GOOGLE_APPLICATION_CREDENTIALS` — path to Firebase service account JSON (for local Firebase Admin usage)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — alternative method of providing service account values via env

   **Security:** Never commit service account JSON or private keys to version control.

   ## Firebase Admin setup

   1. In the Firebase Console, create/select your project.
   2. Go to Project Settings → Service accounts → Generate new private key.
   3. Save the JSON file locally and either set `GOOGLE_APPLICATION_CREDENTIALS` to its path or populate env variables listed above.

   In production, prefer Application Default Credentials (attach the service account to your compute environment) rather than committing secrets.

   ## API notes

   Planned endpoints include authentication, notes CRUD, folders, and sharing. Current implementation exposes only a simple `/health` route. Future routes may be mounted under `/api`.

   ## Security & middleware

   The server uses `helmet` for security headers, CORS configured via `FRONTEND_URL`, and rate limiting middleware (`express-rate-limit`). Ensure appropriate production settings before deployment.

   ## Deployment

   You can deploy the backend to providers like Google Cloud Run, Heroku, Render, or Railway. Configure environment variables in your platform's settings and ensure secure secret injection.

   ## Contributing

   - Follow the branch naming conventions and create focused PRs
   - Run linting (`npm run lint`) and tests (if any) before opening a PR
   - Include clear descriptions and link related issues




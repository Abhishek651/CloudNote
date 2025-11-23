   git clone <repository-url>
   cd CloudeNote/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values (see Environment Variables section below)

## Development

- **Start development server:**
  ```bash
  npm run dev
  ```
  Opens the app at `http://localhost:5173`

- **Build for production:**
  ```bash
  npm run build
  ```
  Creates optimized build in `dist/` directory

- **Preview production build:**
  ```bash
  npm run preview
  ```
  Serves the production build locally for testing

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
## Firebase Setup

You can install and initialize Firebase using npm (recommended) or by using a script tag on a simple page. The project includes a small helper at `src/services/firebase.js` which reads configuration from Vite environment variables (prefixed with `VITE_`).

1) Install via npm (recommended)

```bash
cd frontend
npm install firebase
```

Then create environment variables (example in `.env`):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

The project provides `src/services/firebase.js` (modular SDK) — it will initialize App, Auth, Firestore and Analytics (analytics only in browser when measurement ID is present).

2) Use a script tag (quick demo / no bundler)

If you prefer not to use npm, you can include the modular SDK from the CDN in a module script:

```html
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
  import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-analytics.js';

  const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
    measurementId: 'G-XXXXXXXX'
  };

  const app = initializeApp(firebaseConfig);
  ***
  # CloudNote — Frontend

  ![React](https://img.shields.io/badge/React-19.x-blue)
  ![Vite](https://img.shields.io/badge/Vite-^7.0.0-brightgreen)
  ![Material UI](https://img.shields.io/badge/MUI-7.x-007FFF)

  ## Overview

  CloudNote frontend is a mobile-first React application built with Vite and Material UI. It provides the UI for note-taking, authentication (Firebase), and communicates with the backend API.

  ### Key highlights

  - React 19 with the SWC plugin for fast builds
  - Vite for development and production builds
  - Material UI v7 for component styling and theming
  - Firebase (modular SDK v12+) for auth and Firestore

  ## 🚀 Quick start

  ### Prerequisites

  - Node.js >= 20.19.0 (check with `node -v`)
  - npm (or yarn)
  - A Firebase project (for auth and Firestore)

  ### Clone and install

  ```bash
  git clone <repository-url>
  cd CloudeNote/frontend
  npm install
  ```

  ### Environment setup

  Copy the example env (if provided) and fill in values from your Firebase Console → Project settings → Your apps → SDK configuration.

  ```bash
  cp .env.example .env
  # or create .env manually - see the .env example in the repo
  ```

  ### Required environment variables (client-side — must be prefixed with VITE_)

  ```text
  VITE_FIREBASE_API_KEY            # Firebase apiKey
  VITE_FIREBASE_AUTH_DOMAIN       # e.g. your-app.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID        # Firebase project ID
  VITE_FIREBASE_STORAGE_BUCKET    # optional
  VITE_FIREBASE_MESSAGING_SENDER_ID
  VITE_FIREBASE_APP_ID
  VITE_FIREBASE_MEASUREMENT_ID    # optional (analytics)

  VITE_API_BASE_URL               # e.g. http://localhost:5000 (backend)
  ```

  Note: Do NOT commit sensitive values to source control. Add `.env` to `.gitignore`.

  ## Development

  Start the dev server (default: http://localhost:5173):

  ```bash
  npm run dev
  ```

  ## Available scripts

  - `npm run dev` — start development server
  - `npm run build` — build production assets into `dist/`
  - `npm run preview` — preview production build locally
  - `npm run lint` — run ESLint

  ## Firebase integration

  This project uses the modular Firebase SDK (v12+). A helper initializer is provided at `src/services/firebase.js` which:

  - Reads configuration from `import.meta.env.VITE_*` variables
  - Initializes Firebase App, Auth, Firestore
  - Optionally initializes Analytics when `VITE_FIREBASE_MEASUREMENT_ID` is set and running in the browser

  If you prefer CDN/script-tag usage for quick demos, use the modular CDN builds and a module `<script>` on a static page — but for this app (Vite + npm) prefer installing `firebase` via npm:

  ```bash
  npm install firebase
  ```

  ## Project structure

  ```
  frontend/
  ├── src/
  │   ├── components/     # Reusable UI components
  │   │   └── shared/     # Common components (buttons, headers, modals)
  │   ├── pages/          # Route-level components
  │   ├── services/       # External integrations (Firebase, API)
  │   ├── context/        # React Context providers
  │   ├── hooks/          # Custom hooks
  │   └── styles/         # Global styles and css (global.css)
  ├── public/             # Static assets
  ├── index.html          # HTML entrypoint
  ├── vite.config.js      # Vite config & aliases
  └── package.json
  ```

  ## Build & deployment

  Build the app for production:

  ```bash
  npm run build
  ```

  The output will be in `dist/`. You can deploy `dist/` to any static hosting provider (Vercel, Netlify, Firebase Hosting, Cloudflare Pages). For server-side rendering or advanced deployments, consult your hosting provider docs.

  ## Linting & code quality

  ESLint config is present at `.eslintrc.json`. Run:

  ```bash
  npm run lint
  ```

  ## Contributing

  We follow a lightweight contribution workflow:

  - Create a feature branch from `main` named `feat/your-feature` or `fix/issue-123`
  - Keep commits focused and use conventional prefixes (e.g., `feat:`, `fix:`, `docs:`)
  - Run `npm run lint` and ensure code builds before opening a PR
  - Link the PR to an issue and add a short description of the change

  ## Security & best practices

  - Never commit service account keys or `.env` files to the repository
  - Use environment variables for secrets and CI/CD injection
  - Use HTTPS in production and set appropriate CORS origins

  ## Troubleshooting

  - If Vite can't resolve an alias, check `vite.config.js` aliases
  - If Firebase fails to initialize, confirm `VITE_FIREBASE_*` values and ensure you restarted the dev server after modifying `.env`

  ## Further reading

  - Firebase Web setup: https://firebase.google.com/docs/web/setup
  - Vite docs: https://vitejs.dev/
  - MUI docs: https://mui.com/

  ---
  *This README aims to get a developer up and running in under 5 minutes.*

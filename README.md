# CloudNote 📝

*Your Smart Note-Taking App*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/cloudenote)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://cloudxnote.vercel.app)

## 🌐 Live Demo

**Visit CloudNote:** [https://cloudxnote.vercel.app](https://cloudxnote.vercel.app)

**Demo Account:**
- Email: bhagatabhishek772@gmail.com
- Password: (Contact for demo access)

## Overview 🌟

CloudNote is a modern, feature-rich note-taking web application designed to help users organize their thoughts, ideas, and information efficiently. Built with cutting-edge technologies, it offers a seamless experience across devices with powerful features like global sharing, PDF support, rich text editing, and intuitive folder organization.

### Key Highlights:
- **Mobile-First Design**: Fully responsive design optimized for all devices
- **Global Sharing**: Share notes and folders publicly with unique shareable links
- **Rich Text Editor**: Advanced formatting with code syntax highlighting
- **PDF Support**: Upload, view, and share PDF documents
- **Secure Authentication**: Firebase-powered authentication with "Remember Me" option
- **Folder Organization**: Hierarchical folder structure with nested folders
- **Real-Time Sync**: Automatic synchronization of shared content
- **Cloud Storage**: All data stored securely in Firebase Firestore

The application consists of a React + Vite frontend for a fast, interactive user interface and an Express backend API for server-side logic and Firebase integration.

## Features ✨

### 🔐 Authentication & User Management
- ✅ **Secure Login/Signup**: Email and password authentication via Firebase
- ✅ **Remember Me**: Stay logged in across browser sessions
- ✅ **Password Reset**: Email-based password recovery
- ✅ **Profile Management**: Update display name, photo, and theme preferences
- ✅ **Admin Dashboard**: User management and system statistics (admin only)

### � Nootes Management
- ✅ **Rich Text Editor**: Advanced formatting with bold, italic, headings, lists, code blocks
- ✅ **Code Syntax Highlighting**: Beautiful code blocks with copy functionality
- ✅ **PDF Support**: Upload, view, and download PDF documents
- ✅ **Tags System**: Organize notes with custom tags
- ✅ **Favorites**: Mark important notes for quick access
- ✅ **Archive**: Archive old notes to keep workspace clean
- ✅ **Search & Filter**: Find notes by title, content, tags, or date
- ✅ **Word Wrap Toggle**: Control text wrapping in note viewer

### 📁 Folder Organization
- ✅ **Hierarchical Folders**: Create nested folder structures
- ✅ **Drag & Drop**: Move notes between folders easily
- ✅ **Folder Management**: Create, rename, delete folders
- ✅ **Root & Nested Views**: Navigate through folder hierarchy

### 🌍 Global Sharing
- ✅ **Share to Global Feed**: Make notes and folders publicly discoverable
- ✅ **Shareable Links**: Generate unique links for notes and folders
- ✅ **Authentication Gate**: Require login to view shared content
- ✅ **Real-Time Sync**: Updates to shared content sync automatically
- ✅ **Author Attribution**: Display author name and photo on shared content
- ✅ **Remove from Global**: Unshare content anytime

### 🎨 Customization
- ✅ **6 Theme Options**: Default, Blue, Green, Orange, Pink, Dark
- ✅ **Responsive Design**: Optimized for mobile, tablet, and desktop
- ✅ **Material-UI Components**: Modern, accessible UI components
- ✅ **Smooth Animations**: Polished transitions and hover effects

### 🔧 Technical Features
- ✅ **Real-Time Database**: Firebase Firestore for instant data sync
- ✅ **Cloud Storage**: Backblaze B2 for PDF file storage
- ✅ **API Caching**: Smart caching for improved performance
- ✅ **Error Handling**: Comprehensive error logging and user feedback
- ✅ **Security Rules**: Firestore security rules for data protection
- ✅ **CORS Protection**: Secure cross-origin requests

## Tech Stack 🛠️

### Frontend
- **React 19** - Modern JavaScript library for building user interfaces
- **Vite 7** - Fast build tool and development server
- **Material-UI v7** - React component library with Material Design
- **React Router v7** - Declarative routing for React applications
- **Firebase SDK v12** - Client-side Firebase integration

### Backend
- **Node.js 18+** - JavaScript runtime for server-side development
- **Express 5** - Fast, unopinionated web framework for Node.js
- **Firebase Admin SDK v13** - Server-side Firebase integration

### Database & Services
- **Firebase Firestore** - NoSQL cloud database for real-time data
- **Firebase Auth** - User authentication and authorization
- **Firebase Storage** - Cloud storage for files and media
- **AI Services** - OpenAI, Google Gemini, or Anthropic Claude for AI features

## Project Structure 📁

```
CloudeNote/
├── frontend/          # React + Vite application
├── backend/           # Express API server
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

## Prerequisites 📋

Before getting started, ensure you have the following installed:

- **Node.js 20.19+** (required for frontend with Vite 7)
- **Node.js 18+** (minimum requirement for backend)
- **npm**, **yarn**, or **pnpm** (package manager)
- **Firebase Account** (for project setup)
- **Git** (for version control)

## Quick Start 🚀

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/cloudenote.git
   cd cloudenote
   ```

2. **Set up Firebase project** (see Firebase Setup Guide below)

3. **Install and run the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Visit [http://localhost:5173](http://localhost:5173) in your browser.

4. **Install and run the backend:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```
   The API will be available at [http://localhost:5000](http://localhost:5000).

For detailed setup instructions, refer to:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Development Workflow 🔄

Run both frontend and backend simultaneously for full development experience:

- **Frontend**: [http://localhost:5173](http://localhost:5173) - Hot reload enabled
- **Backend**: [http://localhost:5000](http://localhost:5000) - Auto-restart with nodemon

Use separate terminal windows or a process manager like `concurrently` to run both services.

## Firebase Setup Guide 🔥

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" and follow the setup wizard

2. **Enable Authentication:**
   - In your Firebase project, go to "Authentication" > "Get started"
   - Enable "Email/Password" sign-in provider

3. **Set up Firestore Database:**
   - Go to "Firestore Database" > "Create database"
   - Choose "Start in test mode" for development (configure security rules for production)

4. **Generate Service Account Key (for backend):**
   - Go to "Project settings" > "Service accounts"
   - Click "Generate new private key" and download the JSON file
   - **Security Note**: Never commit this file to version control

5. **Configure Environment Variables:**
   - Copy `.env.example` files to `.env` in both frontend and backend directories
   - Fill in your Firebase configuration values

## Environment Variables 🔐

Environment variables are used to configure Firebase and other services securely.

- **Frontend**: See [frontend/.env.example](./frontend/.env.example) for required variables
- **Backend**: See [backend/.env.example](./backend/.env.example) for required variables

**Security Warning**: Never commit `.env` files containing sensitive information like API keys or service account credentials to version control.

### Production Logging Configuration

For production deployments, set conservative logging levels to minimize performance impact and prevent sensitive data exposure:

- **Frontend**: Set `VITE_LOG_LEVEL=none` in production to disable all logging
- **Backend**: Set `LOG_LEVEL=none` in production to disable all logging
- **Development**: Use `debug` or `info` for detailed logging during development

Logging levels (hierarchy): `debug` < `info` < `warn` < `error` < `none`

Example production configuration:
```bash
# Frontend (.env.production)
VITE_LOG_LEVEL=none

# Backend (.env.production)
LOG_LEVEL=none
```

## Deployment 🚀

Deployment instructions will be provided in the final development phase. Planned deployment options:

### Frontend
- Vercel
- Netlify
- Firebase Hosting

### Backend
- Google Cloud Run
- Firebase App Hosting
- Railway
- Heroku

## API Documentation 📖

API endpoints and documentation will be available in the [Backend README](./backend/README.md).

Currently implemented endpoints:
- `GET /health` - Health check

Full API documentation with examples will be added as endpoints are implemented.

## Contributing 🤝

We welcome contributions to CloudNote! Please follow these guidelines:

### Code Style
- Use ESLint and Prettier for consistent code formatting
- Follow React and Express best practices
- Write meaningful commit messages

### Branch Naming
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical hotfixes

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request with a clear description

### Issue Reporting
- Use GitHub Issues to report bugs or request features
- Provide detailed steps to reproduce bugs
- Include screenshots or error messages when applicable

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development Status 🗺️

- **Phase 1: ✅ Project Setup** - Completed
- **Phase 2: ✅ Firebase Integration** - Completed
- **Phase 3: ✅ Authentication System** - Completed (with Remember Me)
- **Phase 4: ✅ Notes CRUD Operations** - Completed (with PDF support)
- **Phase 5: ✅ Folder Management** - Completed (with nested folders)
- **Phase 6: ✅ Global Sharing** - Completed (with shareable links)
- **Phase 7: ✅ Settings & Theming** - Completed (6 themes available)
- **Phase 8: ✅ Admin Dashboard** - Completed (user management)
- **Phase 9: ✅ Production Deployment** - Completed (Vercel)
- **Phase 10: 🔄 Future Enhancements** - Planned features below

## Future Enhancements 🚀

### Planned Features
- 🔄 **Real-Time Collaboration**: Multiple users editing same note
- 🔄 **AI Integration**: Smart summarization and content suggestions
- 🔄 **Export Options**: Export notes to PDF, Markdown, or Word
- 🔄 **Import Notes**: Import from other note-taking apps
- 🔄 **Note Templates**: Pre-built templates for common use cases
- 🔄 **Version History**: Track changes and restore previous versions
- 🔄 **Comments**: Add comments to shared notes
- 🔄 **Notifications**: Get notified of updates to shared content
- 🔄 **Mobile App**: Native iOS and Android applications
- 🔄 **Offline Mode**: Work without internet connection
- 🔄 **Advanced Search**: Full-text search with filters
- 🔄 **Keyboard Shortcuts**: Power user productivity features

## API Endpoints 📡

### Authentication
- `GET /api/auth/profile` - Get current user profile
- `POST /api/users/profile` - Update user profile

### Notes
- `GET /api/notes` - Get all notes (with filters)
- `GET /api/notes/:id` - Get single note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Folders
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get single folder
- `POST /api/folders` - Create new folder
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Global Sharing
- `GET /api/global` - Get all global notes/folders
- `GET /api/global/:id` - Get single global note
- `POST /api/global` - Share note to global
- `POST /api/global/folder` - Share folder to global
- `DELETE /api/global/:noteId` - Remove note from global
- `DELETE /api/global/folder/:folderId` - Remove folder from global
- `GET /api/global/share/note/:shareToken` - Get note by share link
- `GET /api/global/share/folder/:shareToken` - Get folder by share link
- `POST /api/global/sync/:noteId` - Sync note to global
- `POST /api/global/sync/folder/:folderId` - Sync folder to global

### File Upload
- `POST /api/upload/pdf` - Upload PDF file
- `POST /api/upload/b2` - Upload to Backblaze B2

### Admin (Admin Only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users/:uid` - Get user details
- `DELETE /api/admin/users/:uid` - Delete user
- `POST /api/admin/users/:uid/reset-password` - Reset user password

## Usage Tips 💡

### Getting Started
1. **Sign Up**: Create an account at [cloudxnote.vercel.app](https://cloudxnote.vercel.app)
2. **Create Notes**: Click "New Note" to start writing
3. **Organize**: Create folders to organize your notes
4. **Share**: Share notes globally and get shareable links
5. **Customize**: Change themes in Settings

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save note (auto-saves)
- `Ctrl/Cmd + B` - Bold text
- `Ctrl/Cmd + I` - Italic text
- `Ctrl/Cmd + K` - Insert link

### Best Practices
- Use **tags** to categorize notes across folders
- **Archive** old notes instead of deleting them
- Use **folders** for project-based organization
- **Share to global** to make notes discoverable
- Enable **Remember Me** for convenience on trusted devices

## Support & Contact 💬

- **Live Demo**: [https://cloudxnote.vercel.app](https://cloudxnote.vercel.app)
- **Email**: bhagatabhishek772@gmail.com
- **Issues**: Report bugs or request features via GitHub Issues

For questions or support, please reach out via email or create an issue on GitHub.
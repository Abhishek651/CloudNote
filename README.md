# CloudNote 📝

*Your Smart Note-Taking App*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/cloudenote)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org/)

## Overview 🌟

CloudNote is a modern, mobile-first responsive note-taking web application designed to help users organize their thoughts, ideas, and information efficiently. Built with cutting-edge technologies, it offers a seamless experience across devices with powerful features like real-time collaboration, AI-powered enhancements, and intuitive folder organization.

### Key Highlights:
- **Mobile-First Design**: Optimized for smartphones and tablets with responsive layouts
- **Real-Time Collaboration**: Share folders with other users and collaborate in real-time
- **AI-Powered Features**: Leverage artificial intelligence for summarization, suggestions, and smart content generation
- **Secure Authentication**: Firebase-powered authentication with email/password support
- **Rich Text Editing**: Create and edit notes with rich formatting capabilities
- **Cloud Storage**: All data stored securely in Firebase Firestore and Storage

The application consists of a React + Vite frontend for a fast, interactive user interface and an Express backend API for server-side logic and Firebase integration.

## Features ✨

- ✅ **User Authentication**: Secure login, signup, and password reset functionality
- ✅ **Notes Management**: Create, edit, delete notes with rich text editor
- ✅ **Folder Organization**: Organize notes into hierarchical folders for better structure
- ✅ **Collaboration**: Share folders with other users (view/edit permissions)
- ✅ **Customizable Themes**: Personalize the app with different color schemes and themes
- ✅ **Profile Management**: Update user profiles and preferences
- ✅ **AI-Powered Features**:
  - 📋 Note summarization
  - 💡 Smart content suggestions
  - ✏️ Grammar and spelling check
  - 🏷️ Auto-tagging
  - 🔍 Semantic search
  - 📄 Template generation
- ✅ **Mobile-First Responsive Design**: Seamless experience on all devices
- ✅ **Progressive Web App (PWA) Support**: Install as an app on mobile devices

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

## Roadmap 🗺️

- **Phase 1: ✅ Project Setup** - Initialize frontend and backend with modern tooling
- **Phase 2: 🔄 Firebase Integration** - Connect Firebase services to both frontend and backend
- **Phase 3: 🔄 Authentication System** - Implement login, signup, and user management
- **Phase 4: 🔄 Notes CRUD Operations** - Create, read, update, delete notes functionality
- **Phase 5: 🔄 Folder Management** - Organize notes into folders with CRUD operations
- **Phase 6: 🔄 Collaboration Features** - Share folders and collaborate with other users
- **Phase 7: 🔄 Settings & Theming** - User preferences and customizable themes
- **Phase 8: 🔄 AI Features Part 1** - Basic AI integration (summarization, suggestions)
- **Phase 9: 🔄 AI Features Part 2** - Advanced AI features (semantic search, templates)
- **Phase 10: 🔄 Mobile Responsiveness & Deployment** - Final polish and production deployment

## Screenshots/Demo 📸

Screenshots and demo links will be added once the UI is fully implemented.

For now, refer to the design mockup for the visual concept.

## Support & Contact 💬

- **Issues**: [GitHub Issues](https://github.com/yourusername/cloudenote/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cloudenote/discussions)
- **Email**: support@cloudenote.app (placeholder)

For questions or support, please create an issue on GitHub or join our community discussions.
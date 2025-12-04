# Sharing Features Documentation

## Overview
This document describes the real-time sharing and link-based sharing features implemented for CloudNote.

## Features Implemented

### 1. Real-Time Updates for Shared Content
When you update a note or folder that's shared globally, the changes automatically sync to the global version.

**How it works:**
- When you edit a note that's shared globally, the backend automatically updates the global copy
- When you modify a folder (rename, add/remove notes), the global version updates automatically
- No manual sync required - it happens in the background

**Technical Implementation:**
- Auto-sync in `PUT /api/notes/:id` endpoint
- Auto-sync in `PUT /api/folders/:id` endpoint
- Manual sync endpoints available: `POST /api/global/sync/:noteId` and `POST /api/global/sync/folder/:folderId`

### 2. Share Links for Notes and Folders
Every shared note and folder gets a unique share token that can be used to create shareable links.

**Share Link Format:**
- Notes: `https://yoursite.com/share/note/{shareToken}`
- Folders: `https://yoursite.com/share/folder/{shareToken}`

**How to get share links:**
1. Share a note or folder to global
2. In the Global page, click the share icon on any item you own
3. The link is automatically copied to your clipboard
4. Share the link with anyone

**Technical Implementation:**
- Share tokens generated when sharing: `{id}_{timestamp}_{random}`
- New routes: `/share/note/:shareToken` and `/share/folder/:shareToken`
- Backend endpoints: `GET /api/global/share/note/:shareToken` and `GET /api/global/share/folder/:shareToken`

### 3. Authentication Gate for Shared Content
When someone clicks a share link, they must sign in or sign up before viewing the content.

**User Experience:**
1. User clicks share link
2. If not logged in, sees authentication gate with message:
   - "This note/folder is shared with you, but you need to sign in or create an account to view it"
3. User clicks "Sign In / Sign Up" button
4. After authentication, automatically redirected to the shared content

**Technical Implementation:**
- `SharedContentGate` component wraps shared content
- Login page accepts `returnTo` state for post-auth redirect
- Works for both notes and folders

### 4. No Stale Data
The global feed always shows the latest version of shared content.

**How it works:**
- Every update to original content triggers auto-sync
- Global items include `updatedAt` timestamp
- Frontend can detect and refresh stale data

## API Endpoints

### Sharing Endpoints
```
POST /api/global                    - Share note to global
POST /api/global/folder             - Share folder to global
DELETE /api/global/:noteId          - Remove note from global
DELETE /api/global/folder/:folderId - Remove folder from global
```

### Sync Endpoints
```
POST /api/global/sync/:noteId           - Manually sync note to global
POST /api/global/sync/folder/:folderId  - Manually sync folder to global
```

### Share Link Endpoints
```
GET /api/global/share/note/:shareToken   - Get note by share token (public)
GET /api/global/share/folder/:shareToken - Get folder by share token (public)
```

## Database Schema Updates

### globalNotes Collection
```javascript
{
  originalNoteId: string,
  title: string,
  content: string,
  type: string,
  fileUrl: string,
  fileName: string,
  authorId: string,
  authorName: string,
  authorPhotoURL: string,
  shareToken: string,        // NEW
  createdAt: timestamp,
  updatedAt: timestamp       // NEW
}
```

### globalFolders Collection
```javascript
{
  originalFolderId: string,
  name: string,
  noteCount: number,
  structure: object,
  authorId: string,
  authorName: string,
  authorPhotoURL: string,
  shareToken: string,        // NEW
  createdAt: timestamp,
  updatedAt: timestamp       // NEW
}
```

## Frontend Components

### New Components
- `SharedContentGate.jsx` - Authentication gate for shared links

### Updated Components
- `NoteViewer.jsx` - Added share link support
- `GlobalFolderViewPage.jsx` - Added share link support
- `GlobalPage.jsx` - Added share button and copy link functionality
- `LoginPage.jsx` - Added returnTo redirect support
- `App.jsx` - Added share link routes

## Usage Examples

### Sharing a Note
```javascript
// Share to global
const result = await globalAPI.shareNote(noteId);
// Returns: { id, shareToken, message }

// Get share link
const shareUrl = `${window.location.origin}/share/note/${result.shareToken}`;
```

### Sharing a Folder
```javascript
// Share to global
const result = await globalAPI.shareFolder(folderId);
// Returns: { id, shareToken, message }

// Get share link
const shareUrl = `${window.location.origin}/share/folder/${result.shareToken}`;
```

### Auto-Sync on Update
```javascript
// Update note - auto-syncs to global if shared
await notesAPI.update(noteId, { title: 'New Title', content: 'New Content' });

// Update folder - auto-syncs to global if shared
await foldersAPI.update(folderId, { name: 'New Name' });
```

### Manual Sync
```javascript
// Manually sync note
await globalAPI.syncNote(noteId);

// Manually sync folder
await globalAPI.syncFolder(folderId);
```

## Security Considerations

1. **Share Tokens**: Unique, unpredictable tokens prevent unauthorized access
2. **Authentication Required**: All shared content requires user authentication
3. **Ownership Verification**: Only owners can remove or sync their shared content
4. **Public Endpoints**: Share link endpoints are public but require auth to view content

## Future Enhancements

Possible improvements:
1. Expiring share links
2. Password-protected shares
3. View-only vs edit permissions
4. Share analytics (view counts)
5. Revoke specific share links
6. Share with specific users only
7. Real-time collaboration
8. Comment threads on shared content

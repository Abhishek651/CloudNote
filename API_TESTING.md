# CloudNote API Testing Guide

This guide helps you test the CloudNote backend API endpoints using curl, Postman, or similar tools.

## Prerequisites

1. Backend running: `npm run dev` (default: http://localhost:5000)
2. Frontend running or Firebase Web SDK available for authentication
3. User account created in Firebase Auth

## Getting an ID Token

### Option 1: From Frontend Console (Recommended for Testing)

1. Open frontend app in browser (http://localhost:5173)
2. Log in with your account
3. Open DevTools Console
4. Run:
   ```javascript
   firebase.auth().currentUser.getIdToken().then(token => console.log(token))
   ```
5. Copy the token and use in API requests below

### Option 2: Using Firebase REST API

```bash
# Replace with your actual values
API_KEY="AIzaSyCR2GRveu3RfxKkulneS5HFyJY0LaxYWGk"
EMAIL="your@email.com"
PASSWORD="your-password"

curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"returnSecureToken\":true}" \
  | jq '.idToken'
```

## Test Endpoints

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": 1700000000000
}
```

---

### 2. Get User Profile

```bash
TOKEN="your-id-token-here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/profile
```

**Expected Response:**
```json
{
  "uid": "RWUELU5DiNR3EZMtADFokwdu3IC3",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": null
}
```

---

### 3. Get All Notes

```bash
TOKEN="your-id-token-here"

curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/notes?limit=10"
```

**Query Parameters:**
- `limit` (default: 100) - Maximum notes to return
- `folderId` (optional) - Filter notes by folder ID

**Expected Response:**
```json
[
  {
    "id": "note-id-1",
    "ownerId": "user-uid",
    "title": "My First Note",
    "content": "This is the content",
    "folderId": null,
    "tags": ["personal"],
    "isArchived": false,
    "createdAt": "2025-11-13T10:00:00.000Z",
    "updatedAt": "2025-11-13T10:00:00.000Z"
  }
]
```

---

### 4. Get Single Note

```bash
TOKEN="your-id-token-here"
NOTE_ID="note-id-1"

curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/notes/$NOTE_ID"
```

**Expected Response:**
```json
{
  "id": "note-id-1",
  "ownerId": "user-uid",
  "title": "My First Note",
  "content": "This is the content",
  "folderId": null,
  "tags": ["personal"],
  "isArchived": false,
  "createdAt": "2025-11-13T10:00:00.000Z",
  "updatedAt": "2025-11-13T10:00:00.000Z"
}
```

---

### 5. Create New Note

```bash
TOKEN="your-id-token-here"

curl -X POST http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Shopping List",
    "content": "- Milk\n- Eggs\n- Bread",
    "tags": ["personal", "list"]
  }'
```

**Request Body (all optional except implicit ownerId):**
- `title` (string, default: "Untitled Note")
- `content` (string, default: "")
- `folderId` (string or null)
- `tags` (array of strings)

**Expected Response (201 Created):**
```json
{
  "id": "newly-created-note-id",
  "ownerId": "user-uid",
  "title": "Shopping List",
  "content": "- Milk\n- Eggs\n- Bread",
  "folderId": null,
  "tags": ["personal", "list"],
  "isArchived": false,
  "createdAt": "2025-11-13T10:05:00.000Z",
  "updatedAt": "2025-11-13T10:05:00.000Z"
}
```

---

### 6. Update Note

```bash
TOKEN="your-id-token-here"
NOTE_ID="note-id-1"

curl -X PUT "http://localhost:5000/api/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content here",
    "tags": ["updated", "list"]
  }'
```

**Request Body (all optional):**
- `title` (string)
- `content` (string)
- `folderId` (string or null)
- `tags` (array of strings)
- `isArchived` (boolean)

**Expected Response:**
```json
{
  "message": "Note updated successfully",
  "id": "note-id-1"
}
```

---

### 7. Delete Note

```bash
TOKEN="your-id-token-here"
NOTE_ID="note-id-1"

curl -X DELETE "http://localhost:5000/api/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "message": "Note deleted successfully",
  "id": "note-id-1"
}
```

---

## Error Responses

### 401 Unauthorized (Missing/Invalid Token)
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden (Ownership Verification Failed)
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Note not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to create note",
  "details": "Error message details"
}
```

---

## Postman Collection

You can import this as a Postman environment:

```json
{
  "id": "cloudnote-env",
  "name": "CloudNote Local",
  "values": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:5000",
      "enabled": true
    },
    {
      "key": "TOKEN",
      "value": "your-id-token-here",
      "enabled": true
    },
    {
      "key": "NOTE_ID",
      "value": "note-id-1",
      "enabled": true
    }
  ]
}
```

Then use `{{BASE_URL}}/api/notes?limit=10` and `{{TOKEN}}` in requests.

---

## Debugging Tips

1. **Check backend logs** - Look for `[NotesAPI]` debug logs showing operation details
2. **Verify token expiry** - Tokens expire after 1 hour; get a new one if requests start failing
3. **Check Firestore** - Use Firebase Console to verify notes are being created with correct structure
4. **CORS issues** - Ensure `FRONTEND_URL` in backend `.env` matches your frontend origin
5. **Network tab** - Use browser DevTools Network tab to inspect requests/responses

---

## Integration Flow

Typical workflow:
1. Frontend login/signup → user authenticated
2. Frontend calls `getIdToken()` → gets token
3. Frontend adds `Authorization: Bearer <token>` to all API requests
4. Backend verifies token → extracts `uid`
5. Backend verifies user owns the resource → performs CRUD
6. Backend returns data/error

See `frontend/src/services/firestore.js` and `frontend/src/context/AuthContext.jsx` for implementation examples.

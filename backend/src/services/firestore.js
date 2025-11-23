import admin from 'firebase-admin';
import path from 'path';

// Collection constants — keep in sync with frontend COLLECTIONS
export const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  FOLDERS: 'folders',
  SHARED: 'shared',
};

const db = admin.firestore();

export async function createNoteAdmin({ ownerId, title = '', content = '', folderId = null, tags = [] }) {
  const payload = {
    ownerId,
    title,
    content,
    folderId,
    tags,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    isArchived: false,
  };
  const ref = await db.collection(COLLECTIONS.NOTES).add(payload);
  return { id: ref.id, ...payload };
}

export async function getNotesForUserAdmin(ownerId, { folderId = null, limit = 100 } = {}) {
  let q = db.collection(COLLECTIONS.NOTES).where('ownerId', '==', ownerId).orderBy('updatedAt', 'desc').limit(limit);
  if (folderId) q = q.where('folderId', '==', folderId);
  
  try {
    const snap = await q.get();
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return items;
  } catch (error) {
    console.error('Firestore query error:', error);
    throw error;
  }
}

export default db;

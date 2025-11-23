/**
 * API service for CloudNote backend
 * Handles HTTP requests to the Express backend API
 */

import { auth } from './firebase';
import { cacheManager } from '../utils/cache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get auth token for API requests
 */
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    console.error('[API] No authenticated user found');
    throw new Error('User not authenticated');
  }
  
  try {
    const token = await user.getIdToken();
    console.log('[API] Token obtained successfully, length:', token.length);
    console.log('[API] Token preview:', token.substring(0, 50) + '...');
    return token;
  } catch (error) {
    console.error('[API] Failed to get ID token:', error);
    throw new Error('Failed to get authentication token');
  }
}

/**
 * Make authenticated API request with caching
 */
async function apiRequest(endpoint, options = {}) {
  try {
    if (!endpoint.startsWith('/api/')) {
      throw new Error('Invalid API endpoint');
    }
    
    const method = options.method || 'GET';
    const cacheKey = `${method}:${endpoint}`;
    
    // Check cache for GET requests
    if (method === 'GET' && cacheManager.has(cacheKey)) {
      console.log('[API] Cache hit:', endpoint);
      return cacheManager.get(cacheKey);
    }
    
    console.log('[API] Making request to:', endpoint);
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error('[API] Request failed:', { status: response.status, error });
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('[API] Request successful, data length:', Array.isArray(data) ? data.length : 'object');
    
    // Cache GET responses
    if (method === 'GET') {
      cacheManager.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
    console.error('[API] Request error:', error);
    throw error;
  }
}

/**
 * Notes API methods
 */
export const notesAPI = {
  async create(noteData) {
    cacheManager.invalidatePattern('^GET:/api/notes');
    return apiRequest('/api/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async getAll(options = {}) {
    const params = new URLSearchParams();
    if (options.folderId) params.append('folderId', options.folderId);
    if (options.includeArchived !== undefined) params.append('isArchived', options.includeArchived.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.isFavorite !== undefined) params.append('isFavorite', options.isFavorite.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    const query = params.toString();
    return apiRequest(`/api/notes${query ? `?${query}` : ''}`);
  },

  async getById(id) {
    return apiRequest(`/api/notes/${id}`);
  },

  async update(id, updates) {
    cacheManager.invalidatePattern('^GET:/api/notes');
    return apiRequest(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    cacheManager.invalidatePattern('^GET:/api/notes');
    return apiRequest(`/api/notes/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Folder API methods
 */
export const foldersAPI = {
  async create(folderData) {
    cacheManager.invalidatePattern('^GET:/api/folders');
    return apiRequest('/api/folders', {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  },

  async getAll(parentId = null) {
    const params = parentId ? `?parentId=${parentId}` : '';
    return apiRequest(`/api/folders${params}`);
  },

  async getById(id) {
    return apiRequest(`/api/folders/${id}`);
  },

  async update(id, updates) {
    cacheManager.invalidatePattern('^GET:/api/folders');
    return apiRequest(`/api/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id) {
    cacheManager.invalidatePattern('^GET:/api/folders');
    return apiRequest(`/api/folders/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Users API methods
 */
export const usersAPI = {
  async getProfile() {
    return apiRequest('/api/users/profile');
  },

  async updateProfile(profileData) {
    cacheManager.invalidatePattern('^GET:/api/users');
    cacheManager.invalidatePattern('/api/global');
    return apiRequest('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

/**
 * Global API methods
 */
export const globalAPI = {
  async getAll(limit = 20) {
    return apiRequest(`/api/global?limit=${limit}`);
  },

  async shareNote(noteId) {
    cacheManager.invalidatePattern('^GET:/api/global');
    cacheManager.invalidatePattern('^GET:/api/notes');
    return apiRequest('/api/global', {
      method: 'POST',
      body: JSON.stringify({ noteId }),
    });
  },

  async removeNote(noteId) {
    cacheManager.invalidatePattern('^GET:/api/global');
    cacheManager.invalidatePattern('^GET:/api/notes');
    return apiRequest(`/api/global/${noteId}`, {
      method: 'DELETE',
    });
  },

  async checkGlobalStatus(noteId) {
    return apiRequest(`/api/global/check/${noteId}`);
  },

  async getGlobalNote(id) {
    const response = await fetch(`${API_BASE_URL}/api/global/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  },
};

/**
 * Cache management
 */
export const cacheAPI = {
  clear: () => cacheManager.clear(),
  invalidate: (pattern) => cacheManager.invalidatePattern(pattern),
};

import { auth } from './firebase';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const getAuthHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const adminAPI = {
  getUsers: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/admin/users`, { headers });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getStats: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/admin/stats`, { headers });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  getUserDetails: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  },

  updateUserStatus: async (uid, disabled) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/admin/users/${uid}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ disabled })
    });
    if (!response.ok) throw new Error('Failed to update user status');
    return response.json();
  },

  deleteUser: async (uid) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  }
};

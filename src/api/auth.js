import apiClient from './apiClient';

export const authApi = {
  // Register new user
  register: async (userData) => {
    return await apiClient.post('/auth/register', userData);
  },
  
  // Login user
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },
  
  // Logout user
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
  
  // Get current user
  getCurrentUser: async () => {
    return await apiClient.get('/users/me');
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    return await apiClient.patch('/users/me', profileData);
  },
  
  // Change password
  changePassword: async (passwordData) => {
    return await apiClient.patch('/users/me/password', passwordData);
  }
}; 
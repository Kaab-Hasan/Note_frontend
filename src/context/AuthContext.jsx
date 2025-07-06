import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response);
        setIsAuthenticated(true);
      } catch (err) {
        // Not authenticated
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register user
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(userData);
      setUser(response);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(credentials);
      setUser(response);
      setIsAuthenticated(true);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Logout failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.updateProfile(profileData);
      setUser((prev) => ({ ...prev, ...response }));
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Profile update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.changePassword(passwordData);
      return response;
    } catch (err) {
      setError(err.response?.data?.error || 'Password change failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 
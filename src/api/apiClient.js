import axios from 'axios';

// When using Vite's proxy feature, we should use a relative URL
// This will be proxied according to the vite.config.js settings
const baseURL = 'https://note-backend-ud81.onrender.com';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Enhanced error handling
    const errorResponse = {
      message: error.response?.data?.error || error.message,
      status: error.response?.status,
      data: error.response?.data
    };
    
    // Only log in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', errorResponse);
      console.error('Request that caused error:', {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 

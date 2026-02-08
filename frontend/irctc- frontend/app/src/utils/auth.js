// Authentication utility functions
import api from '../api/axiosConfig';

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers object with authorization token if available
 */
export const getAuthHeaders = () => {
  try {
    const user = getCurrentUser();
    const token = user?.token;
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch (error) {
    console.error('Error getting auth headers:', error);
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  try {
    const user = getCurrentUser();
    return !!user?.token;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Get current user data
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Get user data (alias for getCurrentUser for backward compatibility)
// @returns {Object|null} User object or null if not authenticated
export const getUserData = () => {
  return getCurrentUser();
};

// Get current user's role
// @returns {string} User role or empty string if not authenticated
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || '';
};

// Check if current user is admin
// @returns {boolean} True if user is admin
export const isAdmin = () => {
  return getUserRole() === 'ADMIN';
};

/**
 * Refresh the authentication token
 * @returns {Promise<string|null>} New token or null if refresh failed
 */
export const refreshAuthToken = async () => {
  try {
    const user = getCurrentUser();
    if (!user?.refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    const response = await api.post('/api/auth/refresh-token', {
      refreshToken: user.refreshToken
    });

    if (response.data?.token) {
      // Update the stored user data with the new token
      const updatedUser = { ...user, token: response.data.token };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // If refresh fails, clear the user data
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Store user authentication data
 * @param {Object} data - User data including token and refreshToken
 */
export const setAuthData = (data) => {
  try {
    localStorage.setItem('user', JSON.stringify(data));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

/**
 * Clear authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

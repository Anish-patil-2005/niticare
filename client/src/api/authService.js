import client from './client';

export const authService = {
  /**
   * Logs in the user (Admin/ASHA)
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    return await client.post('/auth/login', credentials);
  },

  /**
   * Registers a new user
   * @param {Object} userData - { name, email, password, role, phone, village }
   */
  register: async (userData) => {
    return await client.post('/auth/signup', userData);
  },

  /**
   * Fetches the current user profile based on the token
   * The backend uses the 'protect' middleware to identify the user via JWT
   */
  getMe: async () => {
    const response = await client.get('/auth/me');
    // Returning response.data.data to match your controller's { status, data } structure
    return response.data?.data || response.data;
  },

  /**
   * Updates the user's personal profile information
   * @param {Object} profileData - { name, email, phone }
   */
  updateProfile: async (profileData) => {
    return await client.put('/auth/update-profile', profileData);
  },

  /**
   * Request a password reset email
   */
  forgotPassword: async (email) => {
    return await client.post('/auth/forgot-password', { email });
  },

  /**
   * Reset password using token from email
   */
  resetPassword: async (token, passwords) => {
    // passwords: { password, passwordConfirm }
    return await client.patch(`/auth/reset-password/${token}`, passwords);
  }
};
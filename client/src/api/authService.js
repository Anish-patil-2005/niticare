import client from './client';

export const authService = {
  /**
   * Logs in the user (Admin/ASHA)
   * @param {Object} credentials - { username , password }
   */
  login: async (credentials) => {
    return await client.post('/auth/login', credentials);
  },
  
  register: async (userData) => {
    // userData: { username, password, full_Name, role }
    return await client.post('/auth/signup', userData);
  },
  /**
   * Fetches the current user profile based on the token
   */
  getMe: async () => {
    return await client.get('/auth/me');
  },


};
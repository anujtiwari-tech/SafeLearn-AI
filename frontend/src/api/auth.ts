import api from './axios';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, full_name }
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login user and get tokens
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    try {
      // FastAPI uses OAuth2PasswordRequestForm which expects x-www-form-urlencoded
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Store user data and token
      const authData = {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        userId: response.data.user_id,
        email: email
      };
      
      localStorage.setItem('user', JSON.stringify(authData));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current user profile
   */
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('user');
    window.location.href = '/auth';
  },

  /**
   * Refresh access token
   * @param {string} refreshToken 
   */
  async refresh(refreshToken) {
    try {
      const response = await api.post(`/auth/refresh?refresh_token=${refreshToken}`);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.token = response.data.access_token;
        user.refreshToken = response.data.refresh_token;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
};

export default authApi;

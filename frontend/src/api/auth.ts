import api from './axios';

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - { email, password, full_name, role, classroom_code }
   */
  async register(userData: any) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login user and get tokens
   * @param {string} email 
   * @param {string} password 
   */
  async login(email: string, password: string) {
    try {
      // FastAPI uses OAuth2PasswordRequestForm which expects x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await api.post('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Get additional user info (role) immediately
      const userProfile = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      });

      // Store user data and token
      const authData = {
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        userId: response.data.user_id,
        email: email,
        role: userProfile.data.role
      };
      
      localStorage.setItem('user', JSON.stringify(authData));
      return response.data;
    } catch (error: any) {
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
    } catch (error: any) {
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
  async refresh(refreshToken: string) {
    try {
      const response = await api.post(`/auth/refresh?refresh_token=${refreshToken}`);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.token = response.data.access_token;
        user.refreshToken = response.data.refresh_token;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error: any) {
      this.logout();
      throw error;
    }
  }
};

export default authApi;

import { storage } from './storage.js';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * API Client for SafeLearn AI Backend
 */
export const api = {
  /**
   * Make authenticated API request
   */
  async request(endpoint, options = {}) {
    const { accessToken } = await storage.getUser();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle 401 - Token expired
      if (response.status === 401) {
        console.warn('Token expired, attempting refresh...');
        // Could implement token refresh here
        throw new Error('Authentication required');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Analyze URL for threats
   */
  async analyzeThreat(url, emailText = null, accessToken = null) {
    const { userId } = await storage.getUser();
    
    return await this.request('/threats/analyze', {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: JSON.stringify({
        url,
        email_text: emailText,
        user_id: userId,
        user_agent: navigator.userAgent
      })
    });
  },
  
  /**
   * Submit feedback on threat
   */
  async submitFeedback(threatLogId, isHelpful, comment = null) {
    return await this.request('/feedback/submit', {
      method: 'POST',
      body: JSON.stringify({
        threat_log_id: threatLogId,
        is_helpful: isHelpful,
        comment
      })
    });
  },
  
  /**
   * Get user dashboard stats
   */
  async getDashboardStats() {
    return await this.request(`/dashboard/stats`);
  },
  
  /**
   * Get threat history
   */
  async getThreatHistory() {
    return await this.request(`/dashboard/history`);
  },
  
  /**
   * Check if protection is paused
   */
  async getProtectionStatus() {
    return await this.request('/settings/protection-status');
  },
  
  /**
   * Get privacy label for domain
   */
  async getPrivacyLabel(domain) {
    return await this.request(`/privacy/label?domain=${encodeURIComponent(domain)}`);
  },
  
  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
};

export default api;
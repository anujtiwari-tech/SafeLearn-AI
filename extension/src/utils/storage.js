/**
 * Chrome Storage Utility Wrapper
 * Handles both local and sync storage with promises
 */

export const storage = {
  /**
   * Get data from chrome storage
   * @param {string|string[]} keys - Key or array of keys
   */
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  },
  
  /**
   * Set data in chrome storage
   * @param {Object} data - Key-value pairs to store
   */
  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  },
  
  /**
   * Remove data from chrome storage
   * @param {string|string[]} keys - Key or array of keys
   */
  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        resolve();
      });
    });
  },
  
  /**
   * Clear all storage
   */
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  },
  
  /**
   * Get user auth data
   */
  async getUser() {
    const result = await this.get(['userId', 'accessToken', 'user']);
    return {
      userId: result.userId,
      accessToken: result.accessToken,
      user: result.user ? JSON.parse(result.user) : null
    };
  },
  
  /**
   * Save user auth data
   */
  async setUser(userData) {
    await this.set({
      userId: userData.userId,
      accessToken: userData.accessToken,
      user: JSON.stringify(userData.user)
    });
  },
  
  /**
   * Clear user auth data (logout)
   */
  async clearUser() {
    await this.remove(['userId', 'accessToken', 'user']);
  },
  
  /**
   * Get extension settings
   */
  async getSettings() {
    const result = await this.get(['settings']);
    return result.settings || {
      enabled: true,
      showNotifications: true,
      blockLevel: 'medium', // low, medium, high
      autoScan: true
    };
  },
  
  /**
   * Save extension settings
   */
  async saveSettings(settings) {
    await this.set({ settings });
  },
  
  /**
   * Add threat to history
   */
  async addThreatToHistory(threat) {
    const history = await this.getThreatHistory();
    history.unshift({
      ...threat,
      timestamp: new Date().toISOString()
    });
    // Keep only last 50 threats
    await this.set({ threatHistory: JSON.stringify(history.slice(0, 50)) });
  },
  
  /**
   * Get threat history
   */
  async getThreatHistory() {
    const result = await this.get(['threatHistory']);
    return result.threatHistory ? JSON.parse(result.threatHistory) : [];
  },
  
  /**
   * Get statistics
   */
  async getStats() {
    const result = await this.get(['stats']);
    return result.stats || {
      threatsBlocked: 0,
      threatsWarned: 0,
      scansToday: 0,
      totalScans: 0,
      lastReset: new Date().toDateString()
    };
  },
  
  /**
   * Update statistics
   */
  async updateStats(updates) {
    const stats = await this.getStats();
    
    // Reset daily stats if new day
    if (stats.lastReset !== new Date().toDateString()) {
      stats.scansToday = 0;
      stats.lastReset = new Date().toDateString();
    }
    
    await this.set({
      stats: { ...stats, ...updates }
    });
    
    return { ...stats, ...updates };
  }
};

export default storage;
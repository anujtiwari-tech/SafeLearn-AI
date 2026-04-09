import { storage } from '../utils/storage.js';
import { api } from '../utils/api.js';

// DOM Elements
const elements = {
  statusIndicator: document.getElementById('statusIndicator'),
  userSection: document.getElementById('userSection'),
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  userEmail: document.getElementById('userEmail'),
  scoreCircle: document.getElementById('scoreCircle'),
  scoreValue: document.getElementById('scoreValue'),
  pageStatusCard: document.getElementById('pageStatusCard'),
  threatsBlocked: document.getElementById('threatsBlocked'),
  scansToday: document.getElementById('scansToday'),
  totalScans: document.getElementById('totalScans'),
  threatList: document.getElementById('threatList'),
  btnDashboard: document.getElementById('btnDashboard'),
  btnSettings: document.getElementById('btnSettings'),
  btnLogout: document.getElementById('btnLogout'),
  loadingOverlay: document.getElementById('loadingOverlay')
};

/**
 * Attempt to sync auth token directly from any open SafeLearn webapp tab.
 * This bypasses the content script entirely using chrome.scripting.executeScript.
 */
async function syncTokenFromWebApp() {
  const debugConsole = document.getElementById('debug-console');
  try {
    // Find any open SafeLearn webapp tab
    const tabs = await chrome.tabs.query({ url: ['http://localhost:5173/*', 'http://127.0.0.1:5173/*'] });
    if (debugConsole) debugConsole.textContent = `Found ${tabs.length} webapp tab(s)`;
    
    if (tabs.length === 0) {
      if (debugConsole) debugConsole.textContent += ' | No webapp tabs open';
      return;
    }

    // Execute a script inside the webapp tab to read its localStorage
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const userString = localStorage.getItem('user');
        return userString;
      }
    });

    if (debugConsole) debugConsole.textContent += ` | Script result: ${JSON.stringify(results?.[0]?.result || 'null').substring(0, 100)}`;

    const userString = results?.[0]?.result;
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.token) {
        // Save to chrome.storage.local so rest of the popup can use it
        await storage.setUser({
          userId: user.userId,
          accessToken: user.token,
          user: {
            email: user.email,
            full_name: user.full_name || 'Student',
            security_score: user.security_score || 50
          }
        });
        if (debugConsole) debugConsole.textContent += ' | ✅ Token synced!';
      }
    }
  } catch (error) {
    console.warn('Could not sync token from webapp tab:', error);
    if (debugConsole) debugConsole.textContent += ` | Sync error: ${error.message}`;
  }
}

// Refresh UI periodically
let refreshInterval;

/**
 * Initialize popup
 */
async function init() {
  showLoading(true);
  
  try {
    // STEP 1: Try to sync token directly from any open webapp tab
    await syncTokenFromWebApp();

    // Initial load
    await refreshUI();
    
    // Setup event listeners
    setupEventListeners();

    // STEP 3: Setup real-time listeners for background broadcasts
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'ANALYSIS_COMPLETED' || message.type === 'STATS_UPDATED') {
        console.log('🔄 Real-time trigger received, refreshing popup...');
        refreshUI();
      }
    });

    // STEP 4: Setup periodic polling as a backup (every 10 seconds)
    refreshInterval = setInterval(refreshUI, 10000);

  } catch (error) {
    console.error('Popup init error:', error);
    showError('Failed to load data');
  } finally {
    showLoading(false);
  }
}

/**
 * Combined refresh for all UI components
 */
async function refreshUI() {
  await Promise.all([
    loadUserData(),
    loadStats(),
    loadThreatHistory(),
    loadCurrentTabStatus()
  ]);
}

/**
 * Load user data from storage
 */
async function loadUserData() {
  const { user, userId } = await storage.getUser();
  
  if (!user || !userId) {
    // User not logged in
    elements.userSection.innerHTML = `
      <p class="text-center text-gray-500">Please login to view your security data</p>
      <button class="btn btn-primary" id="btnLoginPopup">Login</button>
    `;
    document.getElementById('btnLoginPopup').addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173/auth' });
    });
    return;
  }
  
  // Update UI with user data
  elements.userAvatar.textContent = user.full_name?.[0] || user.email?.[0] || 'U';
  elements.userName.textContent = user.full_name || 'Student';
  elements.userEmail.textContent = user.email;
  elements.scoreValue.textContent = user.security_score || 50;
  
  // Update score circle color based on score
  updateScoreColor(user.security_score || 50);
}

function updateScoreColor(score) {
  if (score >= 80) {
    elements.scoreCircle.style.borderColor = '#10B981';
    elements.scoreValue.style.color = '#10B981';
  } else if (score >= 50) {
    elements.scoreCircle.style.borderColor = '#F59E0B';
    elements.scoreValue.style.color = '#F59E0B';
  } else {
    elements.scoreCircle.style.borderColor = '#EF4444';
    elements.scoreValue.style.color = '#EF4444';
  }
}

/**
 * Load statistics
 */
async function loadStats() {
  const localStats = await storage.getStats();
  
  try {
    // Attempt real-time SSO sync from backend
    const stats = await api.getDashboardStats();
    elements.threatsBlocked.textContent = stats.threats_blocked_today || 0;
    elements.scansToday.textContent = localStats.scansToday;
    elements.totalScans.textContent = stats.total_scans || localStats.totalScans || 0;
    
    // Sync true security score and visually update
    elements.scoreValue.textContent = stats.security_score || 50;
    updateScoreColor(stats.security_score || 50);
  } catch (error) {
    console.log('Using local offline stats fallback...', error);
    elements.threatsBlocked.textContent = localStats.threatsBlocked;
    elements.scansToday.textContent = localStats.scansToday;
    elements.totalScans.textContent = localStats.totalScans || 0;
  }
}

/**
 * Load threat history
 */
async function loadThreatHistory() {
  let history = [];
  try {
    history = await api.getThreatHistory();
  } catch (error) {
    console.log('Using local offline history fallback...', error);
    history = await storage.getThreatHistory();
  }
  
  if (!history || history.length === 0) {
    elements.threatList.innerHTML = '<p class="empty-state">No threats detected yet 🎉</p>';
    return;
  }
  
  elements.threatList.innerHTML = history.slice(0, 5).map(threat => `
    <div class="threat-item">
      <span>⚠️</span>
      <div>
        <p class="font-medium">${threat.threat_type}</p>
        <p class="text-xs text-gray-500">${threat.url ? threat.url.substring(0, 40) : 'Unknown URL'}...</p>
      </div>
    </div>
  `).join('');
}

/**
 * Load current tab status
 */
async function loadCurrentTabStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.url) {
    return;
  }
  
  // Check if URL is safe
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    elements.pageStatusCard.className = 'status-card';
    elements.pageStatusCard.innerHTML = `
      <span class="status-icon">ℹ️</span>
      <div class="status-content">
        <p class="status-title">System Page</p>
        <p class="status-subtitle">Scanning not available</p>
      </div>
    `;
    return;
  }
  
  // Check local threat history for this URL
  const history = await storage.getThreatHistory();
  const threatForThisUrl = history.find(h => h.url === tab.url);
  
  if (threatForThisUrl) {
    elements.pageStatusCard.className = 'status-card danger';
    elements.pageStatusCard.innerHTML = `
      <span class="status-icon">🚫</span>
      <div class="status-content">
        <p class="status-title">Threat Detected</p>
        <p class="status-subtitle">${threatForThisUrl.threat_type}</p>
      </div>
    `;
  } else {
    elements.pageStatusCard.className = 'status-card safe';
    elements.pageStatusCard.innerHTML = `
      <span class="status-icon">✅</span>
      <div class="status-content">
        <p class="status-title">This page is safe</p>
        <p class="status-subtitle">No threats detected</p>
      </div>
    `;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  elements.btnDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173/dashboard' });
  });
  
  elements.btnSettings.addEventListener('click', async () => {
    const settings = await storage.getSettings();
    // Could open settings modal or page
    alert('Settings: ' + JSON.stringify(settings, null, 2));
  });
  
  elements.btnLogout.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await storage.clearUser();
      window.location.reload();
    }
  });
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  elements.loadingOverlay.classList.toggle('active', show);
}

/**
 * Show error message
 */
function showError(message) {
  alert('Error: ' + message);
}

// Initialize on load
init();
import { storage } from '../utils/storage.js';
import { api } from '../utils/api.js';

const urlCache = new Map();
const bypassedUrls = new Set();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if URL is in cache and not expired
 */
function getCachedAnalysis(url) {
  const cached = urlCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  urlCache.delete(url);
  return null;
}

/**
 * Cache URL analysis result
 */
function cacheAnalysis(url, data) {
  urlCache.set(url, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Categorize URL context
 */
function categorizeURL(url) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const emailDomains = [
      'mail.google.com',
      'outlook.live.com',
      'outlook.office.com',
      'outlook.office365.com',
      'mail.yahoo.com',
      'proton.me',
      'mail.proton.me'
    ];

    if (emailDomains.some(d => domain === d || domain.endsWith('.' + d))) {
      return 'Email';
    }
    return 'Website';
  } catch (e) {
    return 'Website';
  }
}

/**
 * Analyze URL for threats
 */
async function analyzeURL(url, tabId) {
  // Skip safe/internal URLs
  if (shouldSkipURL(url)) {
    return null;
  }

  // Check if URL is explicitly bypassed by user
  if (bypassedUrls.has(url)) {
    console.log('🔓 URL is bypassed by user:', url);
    return null;
  }

  const category = categorizeURL(url);

  // Notify content script that scanning has started
  chrome.tabs.sendMessage(tabId, {
    type: 'SCAN_STARTED',
    url: url,
    category: category
  }).catch(() => { });

  // Check if protection is paused by the user
  try {
    const protectionStatus = await api.getProtectionStatus();
    if (protectionStatus.is_paused) {
      console.log('⏸️ Protection is paused. Skipping scan for:', url);
      return null;
    }
  } catch (err) {
    // If we can't check status (e.g. not logged in), continue scanning
    console.warn('Could not check protection status:', err.message);
  }

  // Check cache first
  const cached = getCachedAnalysis(url);
  if (cached) {
    console.log('📦 Using cached analysis for:', url);
    broadcastAnalysis(tabId, url, cached, category);
    return cached;
  }

  try {
    // Get access token from storage
    const { accessToken } = await chrome.storage.local.get('accessToken');

    // Call backend API with token
    const analysis = await api.analyzeThreat(url, null, accessToken);
    
    // Inject category into analysis
    analysis.category = category;

    // Cache the result
    cacheAnalysis(url, analysis);

    // Update stats
    const currentStats = await storage.getStats();
    await storage.updateStats({
      scansToday: currentStats.scansToday + 1,
      totalScans: (currentStats.totalScans || 0) + 1
    });
    chrome.runtime.sendMessage({ type: 'STATS_UPDATED' }).catch(() => { });

    // Always log to history (user request: "update the threatshistorypage")
    await storage.addThreatToHistory({
      url,
      threat_type: analysis.is_threat ? analysis.threat_type : (category === 'Email' ? 'Safe Email' : 'Safe Site'),
      threat_level: analysis.is_threat ? analysis.threat_level : 'safe',
      explanation: analysis.explanation,
      action: analysis.action_recommended,
      category: category
    });

    // If threat detected, update block stats
    if (analysis.is_threat) {
      await storage.updateStats({
        threatsBlocked: (await storage.getStats()).threatsBlocked + 1
      });

      // Show notification
      if (analysis.action_recommended === 'block') {
        await showThreatNotification(analysis);
        // Redirect to blocked page
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL('src/pages/blocked.html') +
            `?url=${encodeURIComponent(url)}&data=${encodeURIComponent(JSON.stringify(analysis))}`
        });
      } else if (analysis.action_recommended === 'warn') {
        await showWarningNotification(analysis);
      }
    }

    // Broadcast analysis completed for UI updates
    broadcastAnalysis(tabId, url, analysis, category);

    return analysis;
  } catch (error) {
    console.error('Threat analysis failed:', error);
    // Fail open - don't block if API is down
    return null;
  }
}

/**
 * Helper to broadcast analysis result
 */
function broadcastAnalysis(tabId, url, analysis, category) {
  const result = { ...analysis, category };
  
  // To specific tab
  if (tabId) {
    chrome.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_COMPLETED',
      url: url,
      result: result
    }).catch(() => { });
  }

  // To all other listeners (popup, dashboard)
  chrome.runtime.sendMessage({
    type: 'ANALYSIS_COMPLETED',
    url: url,
    result: result
  }).catch(() => { });
}

/**
 * Check if URL should be skipped
 */
function shouldSkipURL(url) {
  const skipPatterns = [
    /^chrome:\/\//,
    /^chrome-extension:\/\//,
    /^about:/,
    /^file:\/\//,
    /^localhost:/,
    /^127\.0\.0\.1:/,
    /favicon\.ico$/,
    /\.js$/,
    /\.css$/
  ];

  return skipPatterns.some(pattern => pattern.test(url));
}

/**
 * Show threat notification
 */
async function showThreatNotification(analysis) {
  const settings = await storage.getSettings();

  if (settings.showNotifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🛡️ Threat Blocked',
      message: analysis.explanation.substring(0, 100) + '...',
      priority: 2
    });
  }
}

/**
 * Show warning notification
 */
async function showWarningNotification(analysis) {
  const settings = await storage.getSettings();

  if (settings.showNotifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '⚠️ Security Warning',
      message: analysis.explanation.substring(0, 100) + '...',
      priority: 1
    });
  }
}

/**
 * Message handler for communication with popup/content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type, 'from', sender.url);

  switch (message.type) {
    case 'ANALYSE_URL':
      analyzeURL(message.url, sender.tab?.id)
        .then(result => {
          console.log('✅ URL analyzed:', message.url);
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ URL analysis error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true; // Keep channel open for async response

    case 'ANALYZE_EMAIL':
      console.log('📧 Analyzing email data:', message.emailData.subject);
      api.request('/threats/analyze-email', {
        method: 'POST',
        body: JSON.stringify(message.emailData)
      })
        .then(result => {
          console.log('✅ Email analysis result:', result.is_threat ? 'THREAT' : 'SAFE');
          // High-priority broadcast for content scan
          broadcastAnalysis(sender.tab?.id, message.emailData.current_url || 'Email Content', {
            ...result,
            is_content_scan: true // Mark as high priority content scan
          }, 'Email');
          sendResponse({ success: true, data: result });
        })
        .catch(error => {
          console.error('❌ Email analysis error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case 'SUBMIT_FEEDBACK':
      console.log(`🛡️ SafeLearn: Submitting feedback for ID ${message.threatLogId}, Helpful: ${message.isHelpful}`);
      api.submitFeedback(message.threatLogId, message.isHelpful, message.comment)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => {
          console.error('❌ Feedback submission error:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;

    case 'BYPASS_URL':
      console.log('🔓 Bypassing URL:', message.url);
      bypassedUrls.add(message.url);
      sendResponse({ success: true });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

/**
 * Tab update listener - analyze URLs when tabs load
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    // Analyze the URL
    await analyzeURL(tab.url, tabId);
  }
});

/**
 * Extension install/update handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🚀 Extension installed/updated:', details.reason);

  // Initialize default settings
  storage.saveSettings({
    enabled: true,
    showNotifications: true,
    blockLevel: 'medium',
    autoScan: true
  });

  // Show welcome notification
  if (details.reason === 'install') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '🛡️ SafeLearn AI Installed',
      message: 'Your cybersecurity companion is now active. Browse safely!',
      priority: 1
    });
  }
});

/**
 * Alarm for periodic tasks (cleanup, stats reset, etc.)
 */
chrome.alarms.create('dailyCleanup', {
  periodInMinutes: 24 * 60 // Once per day
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyCleanup') {
    console.log('🧹 Running daily cleanup...');
    // Clear old cache entries
    const now = Date.now();
    for (const [url, cached] of urlCache.entries()) {
      if (now - cached.timestamp > CACHE_TTL) {
        urlCache.delete(url);
      }
    }
  }
});

console.log('✅ SafeLearn AI Background Service Worker Ready');
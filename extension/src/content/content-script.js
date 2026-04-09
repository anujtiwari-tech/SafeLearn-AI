/**
 * Content Script - Runs on every webpage
 * Monitors for phishing indicators in page content
 */

// Note: SITE-SPECIFIC SCANNERS are managed via manifest.json injections.
// Direct imports are not supported in content scripts.
// All API communication must go through the background service worker.

// Prevent multiple injections
if (window.safeLearnAIInjected) {
  console.log('ℹ️ SafeLearn AI already injected');
} else {
  window.safeLearnAIInjected = true;
  initContentScript();
}

/**
 * Initialize content script
 */
function initContentScript() {
  console.log('🛡️ SafeLearn AI: Content Script Loaded & Initializing...');

  // Sync authentication from SafeLearn frontend
  syncAuthSession();

  // Scan page for suspicious elements
  scanPageForPhishing();

  // Monitor for dynamic content changes
  observePageChanges();

  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener(handleMessage);

  // Add visual indicator to page
  console.log('🛡️ SafeLearn AI: Adding security badge...');
  addSecurityBadge();
}

/**
 * Sync authentication token from SafeLearn website to Extension
 */
function syncAuthSession() {
  const hostname = window.location.hostname;
  const isSafeLearnDomain = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('safelearn-ai.vercel.app');

  if (isSafeLearnDomain) {
    console.log('🔐 SafeLearn Dashboard detected. Syncing session...');

    const sync = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user && user.token) {
            chrome.storage.local.set({
              accessToken: user.token,
              userId: user.userId,
              user: JSON.stringify({
                email: user.email,
                full_name: user.full_name || 'Student',
                security_score: user.security_score || 50
              })
            }, () => {
              console.log('✅ Auth token synced to extension storage');

              // Visual confirmation for the user
              if (!document.getElementById('safelearn-sso-badge')) {
                const badge = document.createElement('div');
                badge.id = 'safelearn-sso-badge';
                badge.innerHTML = '✅ Extension Linked!';
                badge.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:8px 16px; border-radius:30px; z-index:999999; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition: opacity 2s;';
                document.body.appendChild(badge);
                setTimeout(() => { badge.style.opacity = '0'; setTimeout(() => badge.remove(), 2000); }, 3000);
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse user session:', e);
        }
      } else {
        chrome.storage.local.remove(['accessToken', 'userId', 'user'], () => {
          console.log('🚪 User logged out, cleared extension session.');
        });
      }
    };

    sync();
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') sync();
    });

    let lastToken = localStorage.getItem('user');
    setInterval(() => {
      const currentToken = localStorage.getItem('user');
      if (currentToken !== lastToken) {
        lastToken = currentToken;
        sync();
      }
    }, 1000);
  }
}

/**
 * Scan page for phishing indicators
 */
function scanPageForPhishing() {
  const indicators = {
    loginForms: document.querySelectorAll('form input[type="password"]'),
    externalLinks: document.querySelectorAll('a[href*="http"]'),
    suspiciousText: getSuspiciousTextContent()
  };

  if (indicators.loginForms.length > 0 && window.location.protocol === 'http:') {
    sendWarning({
      type: 'unencrypted_login',
      message: '⚠️ This login form is not secure (HTTP). Your password could be intercepted.',
      severity: 'high'
    });
  }

  if (indicators.suspiciousText.length > 0) {
    sendWarning({
      type: 'suspicious_content',
      message: '⚠️ This page contains urgent/threatening language common in phishing.',
      severity: 'medium',
      details: indicators.suspiciousText
    });
  }
}

function getSuspiciousTextContent() {
  const suspiciousPatterns = [
    /verify your account/i,
    /urgent action required/i,
    /suspend.*account/i,
    /confirm.*identity/i,
    /update.*payment/i,
    /claim.*prize/i,
    /limited time offer/i,
    /act now/i
  ];

  const findings = [];
  const bodyText = document.body?.innerText || '';

  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(bodyText)) {
      findings.push(pattern.source);
    }
  });

  return findings;
}

function observePageChanges() {
  const observer = new MutationObserver(() => {
    clearTimeout(window.safeLearnAIScanTimeout);
    window.safeLearnAIScanTimeout = setTimeout(() => {
      scanPageForPhishing();
    }, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function sendWarning(warning) {
  chrome.runtime.sendMessage({
    type: 'CONTENT_WARNING',
    data: {
      url: window.location.href,
      ...warning
    }
  });
}

function handleMessage(message, sender, sendResponse) {
  switch (message.type) {
    case 'SCAN_STARTED':
      // Don't reset to scanning if we already have a threat shown
      if (!window.safeLearnStatus || window.safeLearnStatus !== 'threat') {
        updateSecurityBadge('scanning', message.category);
      }
      break;

    case 'ANALYSIS_COMPLETED':
      const result = message.result;
      const isNewThreat = result.is_threat;
      const isContentScan = result.is_content_scan || false;
      const scanSource = isContentScan ? '📬 Email Content' : '🌐 Platform Domain';
      
      console.log(`🛡️ SafeLearn: [${scanSource}] Analysis completed. Threat: ${isNewThreat}, Category: ${result.category}`);

      // PRIORITY LOGIC: 
      // 1. If it's a threat, always show it.
      // 2. If it's safe OR a domain scan, only show if we don't already have a content threat active on this view.
      if (isNewThreat) {
        window.safeLearnStatus = 'threat';
        window.safeLearnActiveThreat = result;
        updateSecurityBadge('threat', result.category, result);
      } else {
        // Only update to safe if we don't have an active threat, 
        // OR if this is a safe CONTENT scan (meaning the current email was checked and is safe).
        if (window.safeLearnStatus !== 'threat' || isContentScan) {
          window.safeLearnStatus = 'safe';
          window.safeLearnActiveThreat = null;
          updateSecurityBadge('safe', result.category, result);
        } else {
          console.log('🛡️ SafeLearn: Suppressed "Safe" platform update while content threat is active.');
        }
      }
      break;

    case 'SCAN_PAGE':
      scanPageForPhishing();
      sendResponse({ success: true });
      break;

    case 'GET_PAGE_INFO':
      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title,
          hasLoginForm: document.querySelectorAll('form input[type="password"]').length > 0,
          protocol: window.location.protocol
        }
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true;
}

/**
 * Enhanced Security Badge UI
 */
function addSecurityBadge() {
  console.log('🛡️ SafeLearn AI: Initializing badge system...');
  if (document.getElementById('safelearn-ai-container')) {
    console.log('🛡️ SafeLearn AI: Badge container already exists.');
    return;
  }

  const container = document.createElement('div');
  container.id = 'safelearn-ai-container';
  container.style.cssText = `
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 2147483647 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  `;

  const badge = document.createElement('div');
  badge.id = 'safelearn-ai-badge';
  badge.innerHTML = '<span class="sl-icon">🛡️</span>';
  badge.style.cssText = `
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background: linear-gradient(135deg, #4F46E5, #7C3AED);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: auto;
    border: 2px solid white;
  `;

  const panel = document.createElement('div');
  panel.id = 'safelearn-ai-panel';
  panel.style.cssText = `
    width: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    margin-bottom: 12px;
    overflow: hidden;
    display: none;
    flex-direction: column;
    pointer-events: auto;
    border: 1px solid #E5E7EB;
    transform: translateY(10px);
    opacity: 0;
    transition: all 0.3s ease;
  `;

  container.appendChild(panel);
  container.appendChild(badge);
  document.body.appendChild(container);

  // Toggle panel on click
  badge.addEventListener('click', () => {
    const isVisible = panel.style.display === 'flex';
    if (isVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  });

  // Re-scan placeholder for the badge
  window.updateSecurityBadge = (status, category, result = null) => {
    const badge = document.getElementById('safelearn-ai-badge');
    const panel = document.getElementById('safelearn-ai-panel');
    if (!badge || !panel) return;

    let color = 'linear-gradient(135deg, #4F46E5, #7C3AED)';
    let icon = '🛡️';
    let statusText = 'Scanning...';

    if (status === 'scanning') {
      badge.style.animation = 'sl-pulse 2s infinite';
      statusText = `Scanning ${category}...`;
    } else {
      badge.style.animation = 'none';
      if (status === 'threat') {
        color = 'linear-gradient(135deg, #EF4444, #B91C1C)';
        icon = '🚫';
        statusText = `${category} - Threat Detected`;
      } else {
        color = 'linear-gradient(135deg, #10B981, #059669)';
        icon = '✅';
        statusText = `${category} - Safe`;
      }
    }

    badge.style.background = color;
    badge.querySelector('.sl-icon').innerText = icon;

    // Update Panel Content
    panel.innerHTML = `
      <div style="padding: 16px; background: ${color}; color: white; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div style="font-weight: 700; font-size: 16px; display: flex; justify-content: space-between; align-items: center;">
          <span>SafeLearn AI Analysis</span>
          <span style="font-size: 12px; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px;">${category}</span>
        </div>
        <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">${statusText}</div>
      </div>
      <div style="padding: 16px; background: white;">
        <div style="font-weight: 600; color: #374151; font-size: 14px; margin-bottom: 8px;">AI Explanation:</div>
        <div style="font-size: 13px; line-height: 1.5; color: #4B5563;">
          ${result ? result.explanation : 'Waiting for AI analysis...'}
        </div>
        ${result && result.is_threat ? `
          <div style="margin-top: 12px; padding: 10px; background: #FEF2F2; border-radius: 6px; border-left: 4px solid #EF4444;">
            <div style="font-weight: 600; font-size: 12px; color: #991B1B;">Security Recommendation:</div>
            <div style="font-size: 12px; color: #B91C1C; margin-top: 2px;">${result.action_recommended === 'block' ? 'Immediate block recommended. This page has been flagged as high risk.' : 'Exercise extreme caution. Suspicious indicators were found.'}</div>
          </div>
        ` : result ? `
          <div style="margin-top: 12px; padding: 10px; background: #ECFDF5; border-radius: 6px; border-left: 4px solid #10B981;">
            <div style="font-weight: 600; font-size: 12px; color: #064E3B;">Verified Safe</div>
            <div style="font-size: 12px; color: #065F46; margin-top: 2px;">This domain has been checked and matches safe browsing patterns.</div>
          </div>
        ` : ''}
        <button id="sl-dashboard-btn" style="margin-top: 16px; width: 100%; padding: 8px; background: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 12px; font-weight: 600; color: #4B5563; cursor: pointer; transition: background 0.2s;">View Detailed History</button>
      </div>
    `;

    document.getElementById('sl-dashboard-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    });
  };

  // Add styles
  if (!document.getElementById('safelearn-styles')) {
    const style = document.createElement('style');
    style.id = 'safelearn-styles';
    style.innerHTML = `
      @keyframes sl-pulse {
        0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
        100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
      }
      #safelearn-ai-badge:hover { transform: scale(1.05); }
      #safelearn-ai-badge:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);
  }

  function showPanel() {
    panel.style.display = 'flex';
    setTimeout(() => {
      panel.style.transform = 'translateY(0)';
      panel.style.opacity = '1';
    }, 10);
  }

  function hidePanel() {
    panel.style.transform = 'translateY(10px)';
    panel.style.opacity = '0';
    setTimeout(() => {
      panel.style.display = 'none';
      panel.style.transform = 'translateY(10px)';
    }, 300);
  }
}
// SafeLearn AI - Floating Widget
// Shows AI security status on every webpage

// ── Skip list: don't show widget on these domains ────────────
const SKIP_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'mail.google.com',
  'outlook.live.com',
  'outlook.office.com',
  'outlook.office365.com',
  'chatgpt.com',
  'openai.com',
  'gemini.google.com',
  'claude.ai',
  'copilot.microsoft.com',
  'accounts.google.com',
  'login.microsoftonline.com',
  'login.live.com',
];

(function () {
  'use strict';

  // ── Guard: already injected? ──────────────────────────────
  if (document.getElementById('safelearn-widget')) return;

  // ── Guard: skip internal/trusted domains ─────────────────
  try {
    const hostname = window.location.hostname.toLowerCase();
    const shouldSkip = SKIP_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
    if (shouldSkip) return;
  } catch (_) { return; }

  // ── Guard: skip non-http pages ────────────────────────────
  if (!window.location.protocol.startsWith('http')) return;

  const CURRENT_URL = window.location.href;

  class SafeLearnWidget {
    constructor() {
      this.isOpen = false;
      this.isAnalyzing = false;
      this.resultReceived = false;
      this.widget = null;
    }

    init() {
      this.createWidget();
      this.setupMessageListener(); // listen for pushed results from SW first
      this.requestAnalysis();      // also ask directly (hits cache if SW already ran)
      this.setupClickListeners();
    }

    createWidget() {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes safelearn-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes safelearn-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        #safelearn-widget .sl-btn:hover {
          transform: scale(1.07) !important;
          box-shadow: 0 6px 22px rgba(79,70,229,0.55) !important;
        }
        #safelearn-widget .sl-close:hover { opacity: 1 !important; }
        #safelearn-widget .sl-content.open {
          display: block !important;
          animation: safelearn-fadeup 0.2s ease forwards;
        }
        @keyframes safelearn-fadeup {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);

      const el = document.createElement('div');
      el.id = 'safelearn-widget';
      el.style.cssText = `
        position: fixed; bottom: 22px; right: 22px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      el.innerHTML = `
        <!-- Floating button -->
        <div class="sl-btn" style="
          width:54px; height:54px; border-radius:50%;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          box-shadow: 0 4px 16px rgba(79,70,229,0.45);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; position:relative;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        ">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round"
               style="width:26px;height:26px;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <!-- Status dot -->
          <span class="sl-dot" style="
            position:absolute; top:-4px; right:-4px;
            width:13px; height:13px; border-radius:50%;
            border:2.5px solid white; background:#9CA3AF;
            transition: background 0.3s ease;
            animation: safelearn-pulse 1.5s ease-in-out infinite;
          "></span>
        </div>

        <!-- Panel -->
        <div class="sl-content" style="
          display:none;
          position:absolute; bottom:64px; right:0;
          width:340px; background:white;
          border-radius:16px; overflow:hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.16);
          border: 1px solid #e5e7eb;
        ">
          <!-- Header -->
          <div style="
            background: linear-gradient(135deg,#4F46E5,#7C3AED);
            padding:12px 16px; color:white;
            display:flex; align-items:center; gap:10px;
          ">
            <span style="font-size:18px">🛡️</span>
            <div style="flex:1; overflow:hidden;">
              <div style="font-size:13.5px; font-weight:700;">SafeLearn AI</div>
              <div style="font-size:10px; opacity:0.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:220px;">${CURRENT_URL}</div>
            </div>
            <span class="sl-close" style="cursor:pointer; font-size:17px; opacity:0.75; padding:2px 5px; border-radius:4px; transition:opacity 0.15s;">✕</span>
          </div>

          <!-- Body -->
          <div class="sl-body" style="padding:16px; max-height:380px; overflow-y:auto;">
            <div style="text-align:center; padding:24px 0; color:#6b7280;">
              <div style="
                width:26px; height:26px; margin:0 auto 10px;
                border:2.5px solid #e5e7eb; border-top-color:#4F46E5;
                border-radius:50%; animation:safelearn-spin 0.75s linear infinite;
              "></div>
              <div style="font-size:13px;">Analyzing this page…</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top:1px solid #f3f4f6; padding:7px 16px; font-size:10px; color:#9ca3af; text-align:right;">
            Powered by SafeLearn AI
          </div>
        </div>
      `;

      document.body.appendChild(el);
      this.widget = el;
    }

    // ── Listen for PUSH results from the service worker ─────
    // The navigation-triggered scan fires at tab load time (before the widget).
    // The SW broadcasts WIDGET_UPDATE when it finishes — we pick that up here.
    setupMessageListener() {
      chrome.runtime.onMessage.addListener((message) => {
        if (this.resultReceived) return;

        // Result pushed from SW after navigation scan
        if (message.type === 'WIDGET_UPDATE' && message.result) {
          if (!message.url || message.url === CURRENT_URL) {
            this.resultReceived = true;
            this.isAnalyzing = false;
            this.applyResult(message.result);
          }
          return;
        }

        // Generic broadcast from SW (also useful)
        if (message.type === 'ANALYSIS_COMPLETED' && message.result) {
          if (!message.url || message.url === CURRENT_URL) {
            this.resultReceived = true;
            this.isAnalyzing = false;
            const r = message.result;
            this.applyResult({
              is_threat:   r.is_threat,
              threat_type: r.threat_type,
              threat_level: r.threat_level,
              explanation: r.explanation,
              safety_tip:  this.extractTip(r.explanation),
            });
          }
        }
      });
    }

    // ── Direct request (hits cache if SW already analyzed) ──
    requestAnalysis() {
      if (this.isAnalyzing) return;
      this.isAnalyzing = true;

      chrome.runtime.sendMessage(
        { type: 'WIDGET_ANALYZE_URL', url: CURRENT_URL },
        (response) => {
          this.isAnalyzing = false;

          if (chrome.runtime.lastError) {
            // Common on extension reload — not a real error, ignore silently
            console.debug('[SafeLearn Widget] SW not ready:', chrome.runtime.lastError.message);
            // Schedule a retry in 2s (SW may just be waking up)
            if (!this.resultReceived) {
              setTimeout(() => this.requestAnalysis(), 2000);
            }
            return;
          }

          if (this.resultReceived) return; // push already handled it

          if (response && response.data) {
            this.resultReceived = true;
            this.applyResult(response.data);
          } else {
            // SW returned nothing — retry once after 2s
            if (!this.resultReceived) {
              setTimeout(() => {
                this.resultReceived = false; // allow retry
                this.requestAnalysis();
              }, 2000);
            }
          }
        }
      );
    }

    // ── Apply result to both the dot and the panel body ─────
    applyResult(data) {
      const isThreat   = data.is_threat === true;
      const level      = (data.threat_level || 'safe').toLowerCase();
      const threatType = data.threat_type || 'Unknown';
      const explanation = (data.explanation || 'This page appears safe to browse.')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/Verdict:.*?(?:\n|$)/i, '')
        .replace(/Reasoning:\s*/i, '')
        .replace(/Safety Tip:.*$/si, '')
        .trim()
        .replace(/\n/g, '<br>');
      const tip = data.safety_tip || this.extractTip(data.explanation);

      // Determine colors
      let dotColor, badgeBg, badgeFg, icon, label;
      if (isThreat && (level === 'high' || level === 'critical')) {
        dotColor = '#EF4444'; badgeBg = '#FEE2E2'; badgeFg = '#991B1B';
        icon = '🚨'; label = `${threatType} Detected`;
      } else if (isThreat && level === 'medium') {
        dotColor = '#F59E0B'; badgeBg = '#FED7AA'; badgeFg = '#9A3412';
        icon = '⚠️'; label = `${threatType} Detected`;
      } else if (isThreat) {
        dotColor = '#F59E0B'; badgeBg = '#FEF3C7'; badgeFg = '#92400E';
        icon = '⚠️'; label = `${threatType} — Caution`;
      } else {
        dotColor = '#10B981'; badgeBg = '#D1FAE5'; badgeFg = '#065F46';
        icon = '✅'; label = 'Verified Safe';
      }

      // Update the status dot (stop pulse animation)
      const dot = this.widget.querySelector('.sl-dot');
      if (dot) {
        dot.style.background = dotColor;
        dot.style.animation = 'none'; // stop pulsing once we have a result
      }

      // Update panel body
      const body = this.widget.querySelector('.sl-body');
      if (body) {
        body.innerHTML = `
          <span style="
            display:inline-block; padding:4px 13px; border-radius:99px;
            font-size:11.5px; font-weight:700; margin-bottom:12px;
            background:${badgeBg}; color:${badgeFg};
          ">${icon} ${label}</span>
          <div style="font-size:13px; line-height:1.6; color:#374151; margin-bottom:14px;">
            ${explanation || 'This page appears safe to browse.'}
          </div>
          <div style="
            background:#f5f3ff; border-left:3px solid #7C3AED;
            padding:9px 12px; border-radius:0 8px 8px 0;
            font-size:11.5px; color:#4b5563; line-height:1.5;
          ">
            <strong style="color:#4F46E5;">💡 Safety Tip:</strong> ${tip}
          </div>
        `;
      }
    }

    extractTip(explanation) {
      if (!explanation) return 'Always verify website URLs before entering personal information.';
      const m = explanation.match(/Safety Tip:\s*(.+?)(?:\n|$)/i);
      return m ? m[1].trim() : 'Stay safe: check for misspelled URLs and unexpected requests.';
    }

    setupClickListeners() {
      const btn     = this.widget.querySelector('.sl-btn');
      const close   = this.widget.querySelector('.sl-close');
      const content = this.widget.querySelector('.sl-content');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isOpen = !this.isOpen;
        content.classList.toggle('open', this.isOpen);
      });

      close.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isOpen = false;
        content.classList.remove('open');
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.widget.contains(e.target)) {
          this.isOpen = false;
          content.classList.remove('open');
        }
      });
    }
  }

  // ── Mount with a short delay so the page's own scripts run first ──
  function mount() {
    if (!document.body) { setTimeout(mount, 100); return; }
    const w = new SafeLearnWidget();
    w.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(mount, 300));
  } else {
    setTimeout(mount, 300);
  }

})();
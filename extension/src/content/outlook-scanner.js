/**
 * Outlook.com Phishing Scanner Content Script
 * Similar to Gmail scanner but adapted for Outlook DOM structure
 */

class OutlookScanner {
  constructor() {
    this.observer = null;
    this.scannedEmails = new Set();
    this.warningBannerId = 'safelearn-outlook-warning';
  }

  init() {
    console.log('🛡️ SafeLearn Outlook Scanner initialized');
    
    this.waitForOutlook(() => {
      this.startObserving();
      this.scanVisibleEmails();
    });
  }

  waitForOutlook(callback) {
    const checkOutlook = () => {
      if (document.querySelector('#ReadingPaneContainerId') || 
          document.querySelector('.mailListLayout')) {
        callback();
      } else {
        setTimeout(checkOutlook, 500);
      }
    };
    checkOutlook();
  }

  startObserving() {
    this.observer = new MutationObserver((mutations) => {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = setTimeout(() => {
        this.scanVisibleEmails();
      }, 1000);
    });

    const target = document.querySelector('#ReadingPaneContainerId') || document.body;
    if (target) {
      this.observer.observe(target, { childList: true, subtree: true });
    }
  }

  async scanVisibleEmails() {
    // Outlook uses different selectors
    const emailElements = Array.from(document.querySelectorAll(
      '.mailMessageBody, [role="article"], #readingPaneContainer'
    )).filter(el => el.innerText.length > 50);
    
    for (const emailEl of emailElements) {
      const emailId = emailEl.getAttribute('data-item-id') || 
                     emailEl.innerText.substring(0, 100);
      
      if (this.scannedEmails.has(emailId)) continue;
      
      const emailData = this.extractEmailData(emailEl);
      if (emailData) {
        await this.analyzeEmail(emailData, emailEl, emailId);
        this.scannedEmails.add(emailId);
      }
    }
  }

  extractEmailData(emailEl) {
    try {
      // Outlook-specific selectors
      const senderEl = emailEl.querySelector('[data-bn*="from"]') || 
                      emailEl.querySelector('.senderAddress') ||
                      emailEl.querySelector('.Gf6mX');
      const senderEmail = senderEl?.textContent?.trim() || '';
      
      const senderNameEl = emailEl.querySelector('.senderName') || 
                          emailEl.querySelector('[data-bn*="name"]') ||
                          emailEl.querySelector('.L72S2');
      const senderName = senderNameEl?.textContent?.trim() || '';
      
      const subjectEl = emailEl.querySelector('.subject') || 
                       emailEl.querySelector('[data-bn*="subject"]') ||
                       emailEl.querySelector('.q_P6X');
      const subject = subjectEl?.textContent?.trim() || 'No subject';
      
      const bodyEl = emailEl.querySelector('.mailMessageBody') || 
                    emailEl.querySelector('[contenteditable]') ||
                    emailEl;
      const bodyText = bodyEl?.innerText?.trim() || '';
      
      const links = Array.from(emailEl.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'))
        .slice(0, 10);
      
      const hasAttachment = emailEl.querySelector('[data-attachment]') !== null || 
                           emailEl.querySelector('.F6mX') !== null;
      
      if (!senderEmail && !bodyText) return null;
      
      return {
        sender_email: senderEmail,
        sender_name: senderName,
        subject: subject,
        body_text: bodyText.substring(0, 5000),
        links: links,
        has_attachment: hasAttachment,
        email_platform: 'outlook'
      };
    } catch (error) {
      console.error('Error extracting Outlook email data:', error);
      return null;
    }
  }

  async analyzeEmail(emailData, emailEl, emailId) {
    chrome.runtime.sendMessage({
      type: 'ANALYZE_EMAIL',
      emailData: emailData
    }, (response) => {
      if (response && response.success && response.data.is_threat) {
        this.showWarningBanner(emailEl, response.data, emailData, emailId);
      }
    });
  }

  showWarningBanner(emailEl, threatData, emailData, emailId) {
    const existingBanner = emailEl.querySelector(`#${this.warningBannerId}`);
    if (existingBanner) existingBanner.remove();

    const banner = document.createElement('div');
    banner.id = this.warningBannerId;
    banner.style.cssText = `
      background: #fdf2f2;
      border-left: 5px solid #ef4444;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 4px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      position: relative;
      z-index: 100;
    `;
    
    banner.innerHTML = `
      <div style="font-weight: bold; color: #b91c1c; font-size: 16px; margin-bottom: 8px;">
        🛡️ SafeLearn AI: Phishing Alert
      </div>
      <div style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
        ${threatData.explanation}
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="outlook-dismiss" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px;">Got it</button>
        <button id="outlook-report" style="background:white; color:#ef4444; border:1px solid #ef4444; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px;">Report Error</button>
      </div>
    `;
    
    const container = emailEl.querySelector('.mailMessageBody')?.parentNode || emailEl;
    container.insertBefore(banner, container.firstChild);
    
    banner.querySelector('#outlook-dismiss').addEventListener('click', () => {
      banner.style.opacity = '0.5';
      banner.querySelectorAll('button').forEach(b => b.disabled = true);
    });

    banner.querySelector('#outlook-report').addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'SUBMIT_FEEDBACK',
            threatLogId: threatData.threat_log_id,
            isHelpful: false,
            comment: 'User reported false positive in Outlook'
        });
        banner.remove();
        this.scannedEmails.delete(emailId);
    });
  }

  destroy() {
    if (this.observer) this.observer.disconnect();
    clearTimeout(this.scanTimeout);
  }
}

// Auto-initialize when injected
const outlookScanner = new OutlookScanner();
outlookScanner.init();
window.addEventListener('beforeunload', () => outlookScanner.destroy());
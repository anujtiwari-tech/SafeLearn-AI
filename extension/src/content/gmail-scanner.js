/**
 * Gmail Phishing Scanner Content Script
 * Injects into Gmail to scan emails in real-time
 */

class GmailScanner {
  constructor() {
    this.observer = null;
    this.scannedEmails = new Set(); // Prevent duplicate scans
    this.warningBannerId = 'safelearn-gmail-warning';
  }

  /**
   * Initialize scanner - watch for email view changes
   */
  init() {
    console.log('🛡️ SafeLearn Gmail Scanner: Initializing...');
    
    // Wait for Gmail to load
    this.waitForGmail(() => {
      console.log('🛡️ SafeLearn Gmail Scanner: DOM ready, starting observation');
      this.startObserving();
      this.scanVisibleEmails();
    });
  }

  /**
   * Wait for Gmail DOM to be ready
   */
  waitForGmail(callback) {
    let attempts = 0;
    const checkGmail = () => {
      attempts++;
      const hasMain = document.querySelector('[role="main"]');
      const hasEmail = document.querySelector('.ii.gt');
      const hasCompose = document.querySelector('[role="dialog"], .AD');
      
      if (hasMain || hasEmail || hasCompose) {
        callback();
      } else if (attempts < 20) { // Try for 10 seconds
        setTimeout(checkGmail, 500);
      } else {
        console.warn('🛡️ SafeLearn Gmail Scanner: Gmail elements not found, starting anyway...');
        callback();
      }
    };
    checkGmail();
  }

  /**
   * Start MutationObserver to detect email content changes
   */
  startObserving() {
    this.observer = new MutationObserver((mutations) => {
      // Check if any interesting elements were added
      let interestingChange = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          interestingChange = true;
          break;
        }
      }

      if (interestingChange) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = setTimeout(() => {
          this.scanVisibleEmails();
        }, 1200);
      }
    });

    // Observe the entire body for now to ensure we catch popups
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }

  /**
   * Scan all currently visible emails
   */
  async scanVisibleEmails() {
    const emailElements = document.querySelectorAll('.ii.gt, [role="article"], [role="dialog"], .AD');
    if (emailElements.length > 0) {
      console.log(`🛡️ SafeLearn: Found ${emailElements.length} email/compose elements to scan`);
    }
    
    for (const emailEl of emailElements) {
      const emailId = emailEl.getAttribute('data-legacy-message-id') || 
                     emailEl.getAttribute('data-message-id') ||
                     (emailEl.getAttribute('role') === 'dialog' ? 'compose-' + emailEl.innerText.substring(0, 30) : null) ||
                     emailEl.innerText.substring(0, 50);
      
      if (this.scannedEmails.has(emailId)) continue;
      
      console.log(`🛡️ SafeLearn: Analyzing element with ID: ${emailId}`);
      const emailData = this.extractEmailData(emailEl);
      
      if (emailData) {
        console.log('🛡️ SafeLearn: Extracted email data:', emailData);
        await this.analyzeEmail(emailData, emailEl, emailId);
        this.scannedEmails.add(emailId);
      } else {
        console.warn('🛡️ SafeLearn: Failed to extract data from element', emailEl);
      }
    }
  }

  /**
   * Extract email data from DOM
   */
  extractEmailData(emailEl) {
    try {
      // Extract sender - prioritized list of selectors
      const senderEl = emailEl.querySelector('.gD') || 
                      emailEl.querySelector('[email]') ||
                      emailEl.querySelector('[data-hovercard-id]') ||
                      emailEl.querySelector('[data-email]');
      
      let senderEmail = senderEl?.getAttribute('email') || 
                         senderEl?.getAttribute('data-email') || '';
      
      // Try to parse data-hovercard-id which often contains p:email@example.com
      if (!senderEmail && senderEl?.getAttribute('data-hovercard-id')) {
        const hoverId = senderEl.getAttribute('data-hovercard-id');
        if (hoverId.includes('@')) {
          senderEmail = hoverId.replace(/^p:/, '');
        }
      }
      
      // Fallback: search for email pattern in text content
      if (!senderEmail && senderEl?.textContent) {
        const emailMatch = senderEl.textContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) senderEmail = emailMatch[0];
      }

      const senderNameEl = emailEl.querySelector('.gD') || 
                           emailEl.querySelector('[data-name]') ||
                           senderEl;
      const senderName = senderNameEl?.getAttribute('data-name') || 
                        senderNameEl?.textContent?.split('<')[0]?.trim() || '';
      
      // Extract subject - check multiple levels as Gmail nests heavily
      let subjectEl = document.querySelector('.hP') || 
                       emailEl.closest('[role="main"]')?.querySelector('.hP') ||
                       emailEl.querySelector('.hP') ||
                       emailEl.querySelector('[itemprop="name"]') ||
                       emailEl.querySelector('input[name="subjectbox"]') ||
                       emailEl.querySelector('[placeholder="Subject"]');
      let subject = (subjectEl?.value || subjectEl?.textContent)?.trim() || 'No subject';
      
      // Special handle for Compose window subject
      if (emailEl.getAttribute('role') === 'dialog' && !subjectEl) {
        const composeSubject = emailEl.querySelector('input[name="subjectbox"]');
        if (composeSubject) subject = composeSubject.value;
      }
      
      // Extract body text (visible text only)
      let bodyEl = emailEl.querySelector('.a3s') || 
                    emailEl.querySelector('.ii.gt') ||
                    emailEl.querySelector('[aria-label="Message Body"]') ||
                    emailEl.querySelector('.Am.Al.editable') ||
                    emailEl.querySelector('[role="textbox"]') ||
                    emailEl.querySelector('div[contenteditable="true"]');
                    
      let bodyText = (bodyEl?.innerText || bodyEl?.textContent || '')?.trim();
      
      // Broad fallback for Compose windows if still empty
      if (!bodyText && emailEl.getAttribute('role') === 'dialog') {
        const allTextEls = emailEl.querySelectorAll('div[contenteditable="true"], .Am.Al.editable');
        bodyText = Array.from(allTextEls).map(el => el.innerText).join(' ').trim();
      }
      
      // If we still have nothing, try the whole element text as last resort
      if (!bodyText) bodyText = emailEl.innerText?.trim() || '';
      
      // Extract links
      const linkElements = emailEl.querySelectorAll('a[href]');
      let links = Array.from(linkElements)
        .map(a => {
          try {
            const url = new URL(a.href);
            // Handle google.com/url redirection if present
            if (url.hostname === 'www.google.com' && url.searchParams.has('q')) {
              return url.searchParams.get('q');
            }
            return a.href;
          } catch (e) {
            return a.href;
          }
        });
        
      // Fallback: search for URLs in body text via regex (helpful for Compose/Drafts)
      const urlRegex = /https?:\/\/[^\s<"']+/g;
      const textLinks = bodyText.match(urlRegex) || [];
      links = [...links, ...textLinks];
      
      // Deduplicate and filter
      links = links
        .filter(href => href && (href.startsWith('http') || href.startsWith('https')))
        .filter((v, i, a) => a.indexOf(v) === i); // deduplicate
      
      // Check for attachments
      const hasAttachment = emailEl.querySelector('[data-attachment-id]') !== null || 
                           emailEl.querySelector('.X9') !== null;
      
      // If we literally have nothing, return null
      if (!senderEmail && !bodyText && subject === 'No subject') return null;
      
      return {
        sender_email: senderEmail || 'unknown-sender',
        sender_name: senderName || 'Unknown Sender',
        subject: subject,
        body_text: bodyText.substring(0, 5000), // Limit to 5KB
        links: links.slice(0, 15), // Limit to 15 links
        has_attachment: hasAttachment,
        email_platform: 'gmail',
        current_url: window.location.href
      };
    } catch (error) {
      console.error('Error extracting email data:', error);
      return null;
    }
  }

  /**
   * Send email to background script for analysis
   */
  async analyzeEmail(emailData, emailEl, emailId) {
    try {
      chrome.runtime.sendMessage({
        type: 'ANALYZE_EMAIL',
        emailData: emailData
      }, (response) => {
        if (response && response.success && response.data.is_threat) {
          this.showWarningBanner(emailEl, response.data, emailData, emailId);
        }
      });
    } catch (error) {
      console.error('Email analysis failed:', error);
    }
  }

  /**
   * Display warning banner in email UI
   */
  showWarningBanner(emailEl, threatData, emailData, emailId) {
    // Remove existing banner if any
    const existingBanner = emailEl.querySelector(`#${this.warningBannerId}`);
    if (existingBanner) existingBanner.remove();
    
    // Create warning banner
    const banner = document.createElement('div');
    banner.id = this.warningBannerId;
    banner.style.cssText = `
      background: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 8px 0;
      font-family: system-ui, -apple-system, sans-serif;
      color: #7f1d1d;
      z-index: 999;
      position: relative;
    `;
    
    banner.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">🚫</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">
            ⚠️ Potential Phishing Detected
          </div>
          <div style="font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
            ${threatData.explanation}
          </div>
          ${threatData.risk_indicators.slice(0, 3).map(ind => 
            `<div style="font-size: 13px; color: #991b1b; margin: 2px 0;">• ${ind.detail}</div>`
          ).join('')}
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button id="safelearn-dismiss" style="
              padding: 6px 12px;
              background: #dc2626;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
            ">I Understand</button>
            <button id="safelearn-report" style="
              padding: 6px 12px;
              background: white;
              color: #dc2626;
              border: 1px solid #dc2626;
              border-radius: 4px;
              cursor: pointer;
              font-size: 13px;
            ">Report False Alarm</button>
          </div>
        </div>
      </div>
    `;
    
    // Insert banner at top of email
    let emailHeader = emailEl.querySelector('.hU') || 
                       emailEl.querySelector('.ha') ||
                       emailEl.querySelector('.Hp') || // Compose header
                       emailEl.querySelector('.aoD.az6') || // Compose subject area
                       emailEl.firstChild;
                       
    if (emailHeader?.parentNode) {
      emailHeader.parentNode.insertBefore(banner, emailHeader);
    } else {
      emailEl.insertBefore(banner, emailEl.firstChild);
    }
    
    // Add event listeners
    banner.querySelector('#safelearn-dismiss').addEventListener('click', () => {
      banner.style.opacity = '0.6';
      banner.querySelectorAll('button').forEach(btn => btn.disabled = true);
    });
    
    banner.querySelector('#safelearn-report').addEventListener('click', async () => {
      // Send feedback to background
      console.log(`🛡️ Report click: Sending feedback for log ${threatData.threat_log_id}`);
      chrome.runtime.sendMessage({
        type: 'SUBMIT_FEEDBACK',
        threatLogId: threatData.threat_log_id,
        isHelpful: false,
        comment: 'User reported false positive in Gmail'
      });
      banner.remove();
      this.scannedEmails.delete(emailId);
    });
  }

  /**
   * Cleanup observer on page unload
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    clearTimeout(this.scanTimeout);
  }
}

// Auto-initialize when injected
const gmailScanner = new GmailScanner();
gmailScanner.init();
window.addEventListener('beforeunload', () => gmailScanner.destroy());
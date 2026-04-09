// CSP Compliance: Logic moved to a standalone file to comply with Manifest V3
window.addEventListener('DOMContentLoaded', () => {
    // Safe data parsing
    const urlParams = new URLSearchParams(window.location.search);
    let threatData = {};
    try {
      const rawData = urlParams.get('data');
      if (rawData) {
        threatData = JSON.parse(decodeURIComponent(rawData));
      }
    } catch (e) { 
      console.error("SafeLearn: Data parse error", e); 
    }
    
    const blockedUrl = decodeURIComponent(urlParams.get('url') || 'Unknown URL');
    const threatLogId = threatData.id;
    
    // Populate fields
    const blockedUrlEl = document.getElementById('blockedUrl');
    const explanationEl = document.getElementById('explanation');
    
    if (blockedUrlEl) blockedUrlEl.textContent = blockedUrl;
    if (explanationEl) explanationEl.textContent = threatData.explanation || 'This site contains content that may be harmful to your security.';
    
    // Populate risk indicators
    const riskIndicators = threatData.risk_indicators || [];
    const riskContainer = document.getElementById('riskContainer');
    const riskIndicatorsEl = document.getElementById('riskIndicators');
    
    if (riskIndicators.length > 0 && riskContainer && riskIndicatorsEl) {
      riskContainer.style.display = 'block';
      riskIndicatorsEl.innerHTML = riskIndicators.map(risk => `
        <div class="risk-item ${risk.severity || 'medium'}">
          <div class="dot" style="background: ${getSeverityColor(risk.severity)}"></div>
          <div>
            <strong>${risk.type}:</strong> ${risk.detail}
          </div>
        </div>
      `).join('');
    }

    // Event Listeners
    const btnBack = document.getElementById('btnBack');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        // if (history.length > 2) {
        //   history.back();
        // } else {
          window.close();
        // }
      });
    }

    const btnDashboard = document.getElementById('btnDashboard');
    if (btnDashboard) {
      btnDashboard.addEventListener('click', () => {
        window.open('http://localhost:5173/dashboard/threats', '_blank');
      });
    }

    const btnProceed = document.getElementById('btnProceed');
    if (btnProceed) {
      btnProceed.addEventListener('click', () => {
        if (confirm('⚠️ Warning: This website was identified as a security risk. Proceeding may expose your data. Are you sure you want to continue?')) {
          chrome.runtime.sendMessage({
            type: 'BYPASS_URL',
            url: blockedUrl
          }, () => {
            window.location.href = blockedUrl;
          });
        }
      });
    }

    const fBtnHelpful = document.getElementById('fBtnHelpful');
    if (fBtnHelpful) {
      fBtnHelpful.addEventListener('click', function() {
        submitFeedback(true, this);
      });
    }

    const fBtnReport = document.getElementById('fBtnReport');
    if (fBtnReport) {
      fBtnReport.addEventListener('click', function() {
        submitFeedback(false, this);
      });
    }

    // Feedback submission logic
    function submitFeedback(isHelpful, btn) {
      if (!threatLogId) return;

      // Visual feedback
      document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Send to background script
      chrome.runtime.sendMessage({
        type: 'SUBMIT_FEEDBACK',
        threatLogId: threatLogId,
        isHelpful: isHelpful
      }, () => {
        showToast(isHelpful ? "Thanks for helping us stay accurate! 🛡️" : "Thanks! We'll re-evaluate this site. 📝");
      });
    }

    function getSeverityColor(sev) {
      switch(sev) {
        case 'critical': return '#EF4444';
        case 'high': return '#F97316';
        case 'medium': return '#F59E0B';
        default: return '#10B981';
      }
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
      }
    }
});

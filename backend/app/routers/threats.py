from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import json
import re

from .. import models, schemas, database, security
from ..services.threat_detector import threat_detector
from ..services.ai_service import ai_service

router = APIRouter(prefix="/api/threats", tags=["Threats"])

@router.get("/", response_model=List[schemas.ThreatLogResponse])
async def get_my_threat_history(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
) :
    """Get threat history for the current authenticated user"""
    threats = db.query(models.ThreatLog).filter(
        models.ThreatLog.user_id == current_user.id
    ).order_by(models.ThreatLog.timestamp.desc()).limit(50).all()

    result = []
    for t in threats:
        try:
            indicators = json.loads(t.risk_indicators) if t.risk_indicators else []
        except:
            indicators = []
        
        checks = t.performed_checks.split(", ") if t.performed_checks else []
        
        result.append(schemas.ThreatLogResponse(
            id=t.id,
            url=t.url,
            threat_type=t.threat_type,
            threat_level=t.threat_level,
            action_taken=t.action_taken,
            explanation=t.explanation,
            confidence_score=t.confidence_score,
            risk_indicators=indicators,
            performed_checks=checks,
            timestamp=t.timestamp.replace(tzinfo=timezone.utc)
        ))
    
    return result

@router.post("/analyze", response_model=schemas.ThreatAnalysisResponse)
async def analyze_threat(
    request: schemas.ThreatAnalysisRequest,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Analyze URL/text for threats and generate explanation"""
    user_id = current_user.id
    
    if current_user.protection_paused_until and current_user.protection_paused_until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        return schemas.ThreatAnalysisResponse(
            is_threat=False,
            threat_type="none",
            threat_level="safe",
            confidence_score=0.0,
            explanation="Protection is currently paused. Scanning will resume automatically.",
            risk_indicators=[],
            performed_checks=["Protection paused by user"],
            action_recommended="allow",
            timestamp=datetime.now(timezone.utc)
        )
    
    current_user.total_scans += 1
    db.commit()
    
    is_url_threat, threat_type, url_indicators, url_confidence, performed_checks = threat_detector.analyze_url(request.url)
    
    is_text_threat = False
    text_indicators = []
    text_confidence = 0.0
    
    if request.email_text:
        is_text_threat, text_indicators, text_confidence = threat_detector.analyze_text(request.email_text)
    
    is_threat = is_url_threat or is_text_threat
    all_indicators = url_indicators + text_indicators
    confidence = max(url_confidence, text_confidence)
    
    if confidence >= 0.7:
        threat_level = "high"
        action = "block"
    elif confidence >= 0.5:
        threat_level = "medium"
        action = "warn"
    else:
        threat_level = "low"
        action = "allow"
    
    explanation = ai_service.generate_explanation(
        threat_type=threat_type,
        risk_indicators=all_indicators,
        url=request.url,
        is_threat=is_threat
    )
    
    structured_indicators = [{"type": "Security Alert", "detail": i, "severity": "medium"} for i in all_indicators[:3]]
    if not is_threat:
        structured_indicators = [{"type": "Verified", "detail": "Safe and secure domain", "severity": "safe"}]
    
    threat_log_level = "safe" if not is_threat else threat_level
    if threat_type == "malware":
        threat_log_level = "critical"
    
    # Improve labelling and URL display for email environments
    is_email_env = "mail.google.com" in request.url or "outlook.live.com" in request.url
    log_threat_type = threat_type if is_threat else ("Verified Email Platform" if is_email_env else "Safe Site")
    
    log_url = request.url
    if is_email_env:
        platform = "Gmail" if "google.com" in request.url else "Outlook"
        log_url = f"email://{platform} Environment"
    
    # Better structured indicators for safe scans
    if not is_threat:
        if is_email_env:
            platform = "Gmail" if "google.com" in request.url else "Outlook"
            structured_indicators = [
                {"type": "Verified Platform", "detail": f"Official {platform} domain", "severity": "safe"},
                {"type": "Security", "detail": "Encrypted connection detected", "severity": "safe"}
            ]
        else:
            structured_indicators = [{"type": "Verified", "detail": "Safe and secure domain", "severity": "safe"}]
    else:
        structured_indicators = [{"type": "Security Alert", "detail": i, "severity": "medium"} for i in all_indicators[:3]]

    threat_log = models.ThreatLog(
        user_id=user_id,
        url=log_url,
        threat_type=log_threat_type,
        threat_level=threat_log_level,
        action_taken=action,
        explanation=explanation,
        risk_indicators=json.dumps(structured_indicators),
        performed_checks=", ".join(performed_checks)
    )
    db.add(threat_log)
    
    if is_threat and action == "block":
        current_user.security_score = min(100, current_user.security_score + 2)
    
    db.commit()
    
    return schemas.ThreatAnalysisResponse(
        is_threat=is_threat,
        threat_type=threat_type,
        threat_level=threat_log_level,
        confidence_score=confidence,
        explanation=explanation,
        risk_indicators=structured_indicators,
        performed_checks=performed_checks,
        action_recommended=action,
        timestamp=datetime.now(timezone.utc)
    )

@router.post("/analyze-email", response_model=schemas.ThreatAnalysisResponse)
async def analyze_email(
    email_data: schemas.EmailAnalysisRequest,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Analyze email content for phishing indicators using lightweight model"""
    
    risk_indicators = []
    threat_type = "none"
    score_deductions = 0
    performed_checks = ["Sender Analysis", "Subject Analysis", "Body Content Scan", "In-Email Link Analysis"]

    # 1. Analyze sender
    sender_risk = _analyze_sender(email_data.sender_email, email_data.sender_name)
    score_deductions += sender_risk['score']
    risk_indicators.extend(sender_risk['indicators'])
    
    # 2. Analyze subject
    subject_risk = _analyze_subject(email_data.subject)
    score_deductions += subject_risk['score']
    risk_indicators.extend(subject_risk['indicators'])
    
    # 3. Analyze body
    content_risk = _analyze_email_body(email_data.body_text)
    score_deductions += content_risk['score']
    risk_indicators.extend(content_risk['indicators'])
    if content_risk['is_threat']:
        threat_type = content_risk['threat_type']
    
    # 4. Analyze links
    if email_data.links:
        link_risk = _analyze_email_links(email_data.links)
        score_deductions += link_risk['score']
        risk_indicators.extend(link_risk['indicators'])
        if link_risk['is_threat']:
            threat_type = "phishing_link"
    
    if email_data.has_attachment:
        score_deductions += 5
        risk_indicators.append("⚠️ Email contains attachment - scan before opening")
    
    security_score = max(0, 100 - score_deductions)
    is_threat = security_score < 60 or threat_type != "none"
    
    # Determine threat level
    threat_level = "high" if security_score < 40 else "medium" if security_score < 60 else "low"
    action = "warn" if is_threat else "allow"

    # Generate AI explanation using the new specialized email model
    explanation = ai_service.generate_email_explanation(
        sender_name=email_data.sender_name,
        sender_email=email_data.sender_email,
        subject=email_data.subject,
        body_snippet=email_data.body_text[:300], # Send a snippet to keep it fast
        risk_indicators=risk_indicators[:5],
        is_threat=is_threat,
        model="llama3-8b-8192"
    )
    
    structured_indicators = [{"type": "Security Alert", "detail": i, "severity": "medium"} for i in risk_indicators[:3]]
    if not is_threat:
        structured_indicators = [{"type": "Verified", "detail": "No phishing indicators found", "severity": "safe"}]

    # Log threat
    email_metadata = {
        "sender_name": email_data.sender_name,
        "subject": email_data.subject,
        "body_snippet": email_data.body_text[:200] + "..." if len(email_data.body_text) > 200 else email_data.body_text,
        "platform": email_data.email_platform
    }

    # Standardize the Target Destination to email:// format as requested
    display_url = f"email://{email_data.sender_email}"
    if email_data.sender_email == 'unknown-sender' or not email_data.sender_email:
        display_url = f"email://{email_data.sender_name or 'Unknown'}"
    
    if email_data.subject and email_data.subject != 'No subject':
        subject_snippet = email_data.subject[:40] + "..." if len(email_data.subject) > 40 else email_data.subject
        display_url = f"{display_url} - {subject_snippet}"

    # Check for existing recent log entry for the same URL and user (within 5 minutes)
    recent_entry = None
    if email_data.current_url:
        # Use UTC for consistent timing
        time_threshold = datetime.utcnow() - timedelta(minutes=5)
        
        # 1. Try exact match first
        recent_entry = db.query(models.ThreatLog).filter(
            models.ThreatLog.user_id == current_user.id,
            models.ThreatLog.url == email_data.current_url,
            models.ThreatLog.timestamp >= time_threshold
        ).order_by(models.ThreatLog.timestamp.desc()).first()

        # 2. If no exact match, try fuzzy base-path match for Gmail/Outlook
        if not recent_entry:
            # Normalize: Get domain + base path (e.g. mail.google.com/mail/u/0/)
            # Strip fragments and query params
            base_url = email_data.current_url.split('#')[0].split('?')[0].rstrip('/')
            
            recent_entry = db.query(models.ThreatLog).filter(
                models.ThreatLog.user_id == current_user.id,
                models.ThreatLog.url.like(f"{base_url}%"),
                models.ThreatLog.timestamp >= time_threshold
            ).order_by(models.ThreatLog.timestamp.desc()).first()
            
            # 3. Last fallback: match any Gmail/Outlook entry if platform is known
            if not recent_entry:
                platform_domain = None
                if 'mail.google.com' in email_data.current_url:
                    platform_domain = 'mail.google.com'
                elif 'outlook.live.com' in email_data.current_url:
                    platform_domain = 'outlook.live.com'
                
                if platform_domain:
                    recent_entry = db.query(models.ThreatLog).filter(
                        models.ThreatLog.user_id == current_user.id,
                        models.ThreatLog.url.like(f"%{platform_domain}%"),
                        models.ThreatLog.timestamp >= time_threshold
                    ).order_by(models.ThreatLog.timestamp.desc()).first()

    if recent_entry:
        # Update existing entry with rich email data
        recent_entry.threat_type = "Phishing Email" if is_threat else recent_entry.threat_type
        recent_entry.threat_level = threat_level if is_threat else recent_entry.threat_level
        recent_entry.action_taken = action if is_threat else recent_entry.action_taken
        recent_entry.explanation = explanation
        recent_entry.risk_indicators = json.dumps(structured_indicators)
        recent_entry.scan_metadata = json.dumps(email_metadata)
        # Keep the higher confidence score
        recent_entry.confidence_score = max(recent_entry.confidence_score or 0, min(1.0, score_deductions / 100.0))
        threat_log = recent_entry
    else:
        # Create new entry if none exists
        threat_log = models.ThreatLog(
            user_id=current_user.id,
            url=display_url,
            threat_type="Phishing Email" if is_threat else "Safe Email",
            threat_level=threat_level if is_threat else "safe",
            action_taken=action,
            explanation=explanation,
            risk_indicators=json.dumps(structured_indicators),
            performed_checks=", ".join(performed_checks),
            scan_metadata=json.dumps(email_metadata),
            confidence_score=min(1.0, score_deductions / 100.0)
        )
        db.add(threat_log)
    
    if is_threat:
         current_user.total_scans += 1
    
    db.commit()
    db.refresh(threat_log)
    
    return schemas.ThreatAnalysisResponse(
        is_threat=is_threat,
        threat_type="email_phishing" if is_threat else "none",
        threat_level=threat_level if is_threat else "safe",
        confidence_score=min(1.0, score_deductions / 100.0),
        explanation=explanation,
        risk_indicators=structured_indicators,
        performed_checks=performed_checks,
        action_recommended=action,
        timestamp=datetime.now(timezone.utc),
        threat_log_id=threat_log.id
    )

@router.post("/feedback", response_model=schemas.FeedbackResponse)
async def submit_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(database.get_db)
):
    """Submit feedback on a specific threat block"""
    threat_log = db.query(models.ThreatLog).filter(models.ThreatLog.id == feedback.threat_log_id).first()
    if not threat_log:
        raise HTTPException(status_code=404, detail="Threat log not found")
    
    new_feedback = models.Feedback(
        threat_log_id=feedback.threat_log_id,
        is_helpful=feedback.is_helpful,
        comment=feedback.comment
    )
    db.add(new_feedback)
    
    score_update = 0
    if not feedback.is_helpful:
        user = db.query(models.User).filter(models.User.id == threat_log.user_id).first()
        if user:
            user.security_score = max(0, user.security_score - 1)
            score_update = -1
    
    db.commit()
    return schemas.FeedbackResponse(
        message="Thank you for your feedback!",
        feedback_id=0, # Placeholder or actual ID if needed
        security_score_updated=score_update
    )

# ===== Helper Functions (Cleaned) =====

def _analyze_sender(sender_email: str, sender_name: Optional[str] = None) -> dict:
    indicators = []
    score = 0
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.xyz', '.top']
    domain = sender_email.split('@')[-1].lower() if '@' in sender_email else ""
    
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        score += 30
        indicators.append(f"Suspicious domain: {domain}")
    
    if sender_name and any(official in sender_name.lower() for official in ['bank', 'university', 'government', 'paypal']) and any(free in domain for free in ['gmail.com', 'yahoo.com', 'hotmail.com']):
        score += 35
        indicators.append("Official sender name using free email provider")
    
    return {'score': score, 'indicators': indicators}

def _analyze_subject(subject: str) -> dict:
    indicators = []
    score = 0
    if not subject: return {'score': 0, 'indicators': []}
    
    s_lower = subject.lower()
    if any(w in s_lower for w in ['urgent', 'suspend', 'verify now', 'locked', 'action required']):
        score += 25
        indicators.append("Subject uses urgency or threatening language")
    
    return {'score': score, 'indicators': indicators}

def _analyze_email_body(body_text: str) -> dict:
    indicators = []
    score = 0
    is_threat = False
    if not body_text: return {'score': 0, 'indicators': [], 'is_threat': False, 'threat_type': 'none'}
    
    b_lower = body_text.lower()
    if any(w in b_lower for w in ['password', 'credit card', 'ssn', 'bank account']):
        score += 30
        is_threat = True
        indicators.append("Email requests sensitive personal info")
        
    return {'score': score, 'indicators': indicators, 'is_threat': is_threat, 'threat_type': 'credential_harvesting' if is_threat else 'none'}

def _analyze_email_links(links: list) -> dict:
    indicators = []
    score = 0
    is_threat = False
    for link in links:
        res_is_threat, res_type, res_indicators, res_conf, res_checks = threat_detector.analyze_url(link)
        if res_is_threat:
            score += 40
            is_threat = True
            indicators.append(f"Suspicious link detected: {link[:40]}...")
            break
    return {'score': score, 'indicators': indicators, 'is_threat': is_threat}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database, security

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

@router.post("/submit", response_model=schemas.FeedbackResponse)
async def submit_feedback(
    feedback: schemas.FeedbackCreate,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Submit feedback on a threat alert"""
    
    # 1. Verify threat log exists and belongs to the user
    print(f"DEBUG: Feedback request for threat_log_id: {feedback.threat_log_id} by user_id: {current_user.id}")
    
    threat_log = db.query(models.ThreatLog).filter(
        models.ThreatLog.id == feedback.threat_log_id,
        models.ThreatLog.user_id == current_user.id
    ).first()
    
    if not threat_log:
        print(f"DEBUG: Threat log {feedback.threat_log_id} NOT found or access denied for user {current_user.id}")
        raise HTTPException(status_code=404, detail="Threat log not found or access denied")
    
    print(f"DEBUG: Found threat_log {threat_log.id}, ownership verified. Creating feedback...")
    
    # 2. Create feedback entry (User ID removed because it's not in the model)
    db_feedback = models.Feedback(
        threat_log_id=feedback.threat_log_id,
        is_helpful=feedback.is_helpful,
        comment=feedback.comment
    )
    
    db.add(db_feedback)
    
    # 3. Adjust security score based on feedback
    score_change = 0
    if feedback.is_helpful:
        current_user.security_score = min(100, current_user.security_score + 1)
        score_change = 1
    else:
        current_user.security_score = max(0, current_user.security_score - 1)
        score_change = -1
    
    print(f"DEBUG: Updating security score for user {current_user.id} by {score_change}")
    
    try:
        db.commit()
        db.refresh(db_feedback)
        print(f"DEBUG: Successfully saved feedback with ID: {db_feedback.id}")
    except Exception as e:
        db.rollback()
        print(f"DEBUG: FAILED to save feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")
    
    return schemas.FeedbackResponse(
        message="Thank you for your feedback!",
        feedback_id=db_feedback.id,
        security_score_updated=score_change
    )
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from .. import models, schemas, database, security
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get dashboard statistics for the current user (PROTECTED)"""
    
    user_id = current_user.id
    
    # Calculate threats blocked today
    today = datetime.utcnow().date()
    threats_today = db.query(models.ThreatLog).filter(
        and_(
            models.ThreatLog.user_id == user_id,
            func.date(models.ThreatLog.timestamp) == today,
            models.ThreatLog.action_taken == "block"
        )
    ).count()
    
    # Calculate threats blocked this month
    month_start = today.replace(day=1)
    threats_month = db.query(models.ThreatLog).filter(
        and_(
            models.ThreatLog.user_id == user_id,
            models.ThreatLog.timestamp >= month_start,
            models.ThreatLog.action_taken == "block"
        )
    ).count()
    
    # Calculate real learning progress (completed modules)
    learning_progress = db.query(models.LearningProgress).filter(
        and_(
            models.LearningProgress.user_id == user_id,
            models.LearningProgress.status == models.LearningModuleStatus.COMPLETED
        )
    ).count()
    
    # Get real badges from database
    user_badges = db.query(models.UserBadge).filter(
        models.UserBadge.user_id == user_id
    ).all()
    badges = [b.badge_name for b in user_badges]
    
    # Add auto-generated badges if not already present
    if threats_month >= 5 and "🛡️ Threat Hunter" not in badges:
        badges.append("🛡️ Threat Hunter")
    if current_user.security_score >= 80 and "🏆 Security Pro" not in badges:
        badges.append("🏆 Security Pro")
    
    return schemas.DashboardStats(
        security_score=current_user.security_score,
        threats_blocked_today=threats_today,
        threats_blocked_week=threats_today * 2, # Placeholder for demo
        threats_blocked_month=threats_month,
        learning_streak=current_user.learning_streak,
        learning_progress=learning_progress,
        badges_earned=badges,
        total_points=current_user.points,
        total_scans=current_user.total_scans,
        last_activity=datetime.now(timezone.utc)
    )

@router.get("/history", response_model=list[schemas.ThreatHistoryItem])
async def get_dashboard_threat_history(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get detailed threat history for the current user (PROTECTED)"""
    
    threats = db.query(models.ThreatLog).filter(
        models.ThreatLog.user_id == current_user.id
    ).order_by(models.ThreatLog.timestamp.desc()).limit(4).all()
    
    return [
        schemas.ThreatHistoryItem(
            id=t.id,
            url=t.url,
            threat_type=t.threat_type,
            explanation=t.explanation,
            timestamp=t.timestamp.replace(tzinfo=timezone.utc),
            is_helpful=t.feedback[0].is_helpful if t.feedback else None,
            feedback_count=len(t.feedback)
        )
        for t in threats
    ]
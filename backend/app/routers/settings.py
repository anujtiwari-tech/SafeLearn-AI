from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Any
from .. import models, schemas, database, security

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.put("/preferences", response_model=schemas.UserResponse)
async def update_preferences(
    settings_update: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Update user notification preferences and profile info"""
    
    if settings_update.full_name is not None:
        current_user.full_name = settings_update.full_name
    if settings_update.email_alerts is not None:
        current_user.email_alerts = settings_update.email_alerts
    if settings_update.push_notifications is not None:
        current_user.push_notifications = settings_update.push_notifications
    if settings_update.weekly_reports is not None:
        current_user.weekly_reports = settings_update.weekly_reports
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/pause", response_model=schemas.UserResponse)
async def pause_protection(
    pause_request: schemas.PauseProtectionRequest,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Pause security protection for a specified duration"""
    
    if pause_request.duration_minutes <= 0:
        current_user.protection_paused_until = None # Resume immediately
    else:
        current_user.protection_paused_until = datetime.now(timezone.utc) + timedelta(minutes=pause_request.duration_minutes)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/protection-status")
async def get_protection_status(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Check if protection is currently paused for the user"""
    is_paused = False
    paused_until = None
    remaining_minutes = 0
    
    if current_user.protection_paused_until:
        pause_end = current_user.protection_paused_until.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        if pause_end > now:
            is_paused = True
            paused_until = current_user.protection_paused_until.isoformat()
            remaining_minutes = int((pause_end - now).total_seconds() / 60)
        else:
            # Pause has expired, clear it
            current_user.protection_paused_until = None
            db.commit()
    
    return {
        "is_paused": is_paused,
        "paused_until": paused_until,
        "remaining_minutes": remaining_minutes
    }

@router.delete("/history")
async def clear_history(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Permanently delete all threat logs and file scan history for user"""
    
    # Delete threat logs
    db.query(models.ThreatLog).filter(models.ThreatLog.user_id == current_user.id).delete()
    
    # Delete file scan logs
    db.query(models.FileScanLog).filter(models.FileScanLog.user_id == current_user.id).delete()
    
    db.commit()
    return {"message": "History cleared successfully"}

@router.get("/export")
async def export_user_data(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Consolidate and return all user data for export"""
    
    # Fetch all relevant data
    threats = db.query(models.ThreatLog).filter(models.ThreatLog.user_id == current_user.id).all()
    scans = db.query(models.FileScanLog).filter(models.FileScanLog.user_id == current_user.id).all()
    progress = db.query(models.LearningProgress).filter(models.LearningProgress.user_id == current_user.id).all()
    badges = db.query(models.UserBadge).filter(models.UserBadge.user_id == current_user.id).all()
    
    return {
        "export_metadata": {
            "version": "1.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_email": current_user.email
        },
        "profile": {
            "full_name": current_user.full_name,
            "security_score": current_user.security_score,
            "total_points": current_user.points,
            "streak": current_user.learning_streak
        },
        "security_history": {
            "threat_logs": [
                {
                    "url": t.url,
                    "type": t.threat_type,
                    "level": t.threat_level,
                    "action": t.action_taken,
                    "timestamp": t.timestamp.isoformat()
                } for t in threats
            ],
            "file_scans": [
                {
                    "filename": s.filename,
                    "score": s.security_score,
                    "threat_detected": s.threat_detected,
                    "timestamp": s.timestamp.isoformat()
                } for s in scans
            ]
        },
        "learning_data": {
            "completed_modules": [
                {
                    "id": p.module_id,
                    "name": p.module_name,
                    "completed_at": p.completed_at.isoformat() if p.completed_at else None
                } for p in progress if p.status == "completed"
            ],
            "badges": [b.badge_name for b in badges]
        }
    }

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import secrets
import string

from .. import models, schemas, database, security

router = APIRouter(prefix="/api/teacher", tags=["Teacher"])

def generate_classroom_code(length=8):
    """Generate a random unique classroom code"""
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.get("/dashboard/stats", response_model=schemas.TeacherDashboardStats)
async def get_teacher_stats(
    days: int = Query(7, ge=1, le=90),
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """Get aggregated statistics for the teacher's classroom"""
    
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        # Teacher hasn't set up a classroom yet
        return {
            "total_students": 0,
            "avg_security_score": 0.0,
            "pending_requests_count": 0,
            "threats_blocked_today": 0,
            "active_classrooms": 0,
            "recent_activity": []
        }
    
    # Time threshold
    since_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Basic stats
    student_count = db.query(models.User).filter(models.User.classroom_id == classroom.id).count()
    
    avg_score = db.query(func.avg(models.User.security_score)).filter(
        models.User.classroom_id == classroom.id
    ).scalar() or 0.0
    
    pending_count = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.classroom_id == classroom.id,
        models.ClassroomRequest.status == "pending"
    ).count()
    
    # Threats blocked in classroom
    threats_today = db.query(models.ThreatLog).join(models.User).filter(
        models.User.classroom_id == classroom.id,
        models.ThreatLog.timestamp >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0)
    ).count()
    
    # Recent activity (mix of threats and joins)
    recent_threats = db.query(models.ThreatLog).join(models.User).filter(
        models.User.classroom_id == classroom.id
    ).order_by(models.ThreatLog.timestamp.desc()).limit(5).all()
    
    activity = []
    for t in recent_threats:
        activity.append({
            "type": "threat_blocked",
            "user": t.user.full_name or t.user.email,
            "detail": t.threat_type,
            "timestamp": t.timestamp
        })
        
    return {
        "total_students": student_count,
        "avg_security_score": round(float(avg_score), 1),
        "pending_requests_count": pending_count,
        "threats_blocked_today": threats_today,
        "active_classrooms": 1,
        "recent_activity": activity
    }

@router.get("/students", response_model=List[schemas.StudentListItem])
async def list_students(
    days: int = Query(7),
    sort: str = Query("score"), # score, activity, name
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """List all students in teacher's classroom with their metrics"""
    
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        return []
    
    students = db.query(models.User).filter(models.User.classroom_id == classroom.id).all()
    
    result = []
    for s in students:
        # Calculate individual metrics
        threat_count = db.query(models.ThreatLog).filter(models.ThreatLog.user_id == s.id).count()
        lessons_done = db.query(models.LearningProgress).filter(
            models.LearningProgress.user_id == s.id,
            models.LearningProgress.status == "completed"
        ).count()
        
        result.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "security_score": s.security_score,
            "total_threats": threat_count,
            "lessons_completed": lessons_done,
            "total_lessons": 10, # Mock total
            "last_active": s.updated_at,
            "status": "active"
        })
        
    # Sort
    if sort == "score":
        result.sort(key=lambda x: x["security_score"], reverse=True)
    elif sort == "name":
        result.sort(key=lambda x: x["full_name"] or "")
        
    return result

@router.get("/requests", response_model=List[schemas.ClassroomRequestResponse])
async def list_requests(
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """List pending classroom join requests"""
    
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        return []
    
    requests = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.classroom_id == classroom.id,
        models.ClassroomRequest.status == "pending"
    ).all()
    
    return [
        {
            "id": r.id,
            "student_id": r.student_id,
            "student_name": r.student.full_name,
            "student_email": r.student.email,
            "status": r.status,
            "requested_at": r.requested_at
        } for r in requests
    ]

@router.post("/requests/{request_id}/approve")
async def approve_request(
    request_id: int,
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """Approve a student's join request"""
    
    classroom_request = db.query(models.ClassroomRequest).filter(models.ClassroomRequest.id == request_id).first()
    if not classroom_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify teacher owns the classroom
    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_request.classroom_id,
        models.Classroom.teacher_id == current_user.id
    ).first()
    
    if not classroom:
         raise HTTPException(status_code=403, detail="Not your classroom")
    
    # Update student and request
    student = db.query(models.User).filter(models.User.id == classroom_request.student_id).first()
    if student:
        student.classroom_id = classroom.id
        
    classroom_request.status = "approved"
    classroom_request.reviewed_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"message": "Request approved"}

@router.post("/requests/{request_id}/reject")
async def reject_request(
    request_id: int,
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """Reject a student's join request"""
    
    classroom_request = db.query(models.ClassroomRequest).filter(models.ClassroomRequest.id == request_id).first()
    if not classroom_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Verify teacher owns the classroom
    classroom = db.query(models.Classroom).filter(
        models.Classroom.id == classroom_request.classroom_id,
        models.Classroom.teacher_id == current_user.id
    ).first()
    
    if not classroom:
         raise HTTPException(status_code=403, detail="Not your classroom")
    
    classroom_request.status = "rejected"
    classroom_request.reviewed_at = datetime.now(timezone.utc)
    
    db.commit()
    return {"message": "Request rejected"}

@router.put("/settings", response_model=schemas.ClassroomResponse)
async def update_settings(
    update: schemas.TeacherSettingsUpdate,
    current_user: models.User = Depends(security.require_role(models.UserRole.teacher)),
    db: Session = Depends(database.get_db)
):
    """Update classroom settings or initialize classroom if not exists"""
    
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    
    if not classroom:
        # Auto-initialize classroom for teacher
        classroom = models.Classroom(
            name=update.classroom_name or f"{current_user.full_name or 'Teacher'}'s Classroom",
            teacher_id=current_user.id,
            unique_code=generate_classroom_code(),
            approval_mode=update.approval_mode if update.approval_mode is not None else True
        )
        db.add(classroom)
    else:
        if update.classroom_name:
            classroom.name = update.classroom_name
        if update.approval_mode is not None:
            classroom.approval_mode = update.approval_mode
        if update.regenerate_code:
            classroom.unique_code = generate_classroom_code()
            
    db.commit()
    db.refresh(classroom)
    return classroom

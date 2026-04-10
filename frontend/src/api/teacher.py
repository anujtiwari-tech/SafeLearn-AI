from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from .. import models, schemas, database, security

router = APIRouter(
    prefix="/api/teacher",
    tags=["Teacher"],
)

@router.get("/dashboard", response_model=schemas.TeacherDashboardStats)
async def get_teacher_dashboard(
    current_user: models.User = Depends(security.get_current_teacher_user),
    db: Session = Depends(database.get_db)
):
    """
    Get aggregate stats for the teacher's dashboard.
    """
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        return {
            "total_students": 0,
            "avg_security_score": 0.0,
            "pending_requests": 0,
            "threats_detected_week": 0,
            "recent_activity": []
        }
    
    # Total students
    student_count = db.query(models.User).filter(models.User.classroom_id == classroom.id).count()
    
    # Average security score
    avg_score = db.query(func.avg(models.User.security_score)).filter(models.User.classroom_id == classroom.id).scalar() or 0.0
    
    # Pending requests
    pending_count = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.classroom_id == classroom.id,
        models.ClassroomRequest.status == "pending"
    ).count()
    
    # Threats detected in the last week
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    threat_count = db.query(models.ThreatLog).join(models.User).filter(
        models.User.classroom_id == classroom.id,
        models.ThreatLog.timestamp >= one_week_ago
    ).count()
    
    # Recent activity (mix of join requests and threats)
    recent_threats = db.query(models.ThreatLog).join(models.User).filter(
        models.User.classroom_id == classroom.id
    ).order_by(models.ThreatLog.timestamp.desc()).limit(5).all()
    
    recent_activity = []
    for t in recent_threats:
        recent_activity.append({
            "type": "threat",
            "student_name": t.user.full_name or t.user.email,
            "description": f"Detected {t.threat_type} threat at {t.url}",
            "timestamp": t.timestamp
        })
        
    return {
        "total_students": student_count,
        "avg_security_score": float(avg_score),
        "pending_requests": pending_count,
        "threats_detected_week": threat_count,
        "recent_activity": recent_activity
    }

@router.get("/students", response_model=List[schemas.TeacherStudentResponse])
async def get_students(
    current_user: models.User = Depends(security.get_current_teacher_user),
    db: Session = Depends(database.get_db)
):
    """
    List all students in the teacher's classroom.
    """
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        return []
        
    students = db.query(models.User).filter(models.User.classroom_id == classroom.id).all()
    
    result = []
    for s in students:
        threat_count = db.query(models.ThreatLog).filter(models.ThreatLog.user_id == s.id).count()
        completed_lessons = db.query(models.LearningProgress).filter(
            models.LearningProgress.user_id == s.id,
            models.LearningProgress.status == "completed"
        ).count()
        
        # In a real app, the total lessons would be counted from a metadata registry
        # For now we use a placeholder 10
        result.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "security_score": s.security_score,
            "total_threats": threat_count,
            "lessons_completed": completed_lessons,
            "total_lessons": 10,
            "last_active": s.last_login_at
        })
        
    return result

@router.get("/requests", response_model=List[schemas.ClassroomRequestResponse])
async def get_join_requests(
    current_user: models.User = Depends(security.get_current_teacher_user),
    db: Session = Depends(database.get_db)
):
    """
    List pending join requests for the classroom.
    """
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
        return []
        
    requests = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.classroom_id == classroom.id,
        models.ClassroomRequest.status == "pending"
    ).all()
    
    result = []
    for r in requests:
        res = schemas.ClassroomRequestResponse.model_validate(r)
        res.student_name = r.student.full_name
        res.student_email = r.student.email
        result.append(res)
        
    return result

@router.post("/requests/{request_id}/review")
async def review_join_request(
    request_id: int,
    review: schemas.RequestReview,
    current_user: models.User = Depends(security.get_current_teacher_user),
    db: Session = Depends(database.get_db)
):
    """
    Approve or reject a student join request.
    """
    classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if not classroom:
         raise HTTPException(status_code=404, detail="No classroom found")
         
    join_request = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.id == request_id,
        models.ClassroomRequest.classroom_id == classroom.id
    ).first()
    
    if not join_request:
        raise HTTPException(status_code=404, detail="Request not found")
        
    if join_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request already reviewed")
        
    join_request.status = review.status
    join_request.reviewed_at = datetime.utcnow()
    
    if review.status == "approved":
        student = db.query(models.User).filter(models.User.id == join_request.student_id).first()
        if student:
            student.classroom_id = classroom.id
            
    db.commit()
    return {"message": f"Request {review.status} successfully"}

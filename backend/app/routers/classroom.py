from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Any
import secrets
import string

from .. import models, schemas, database, security

router = APIRouter(prefix="/api/classroom", tags=["Classroom"])

@router.post("/join", response_model=schemas.ClassroomRequestResponse)
async def join_classroom(
    request: schemas.ClassroomJoinRequest,
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Student request to join a classroom via unique code"""
    
    # Check if student is already in a classroom
    if current_user.classroom_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already in a classroom. Leave current one first."
        )
    
    # Find classroom by code
    classroom = db.query(models.Classroom).filter(models.Classroom.unique_code == request.unique_code.upper()).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom code not found"
        )
    
    # Check if a pending request already exists
    existing_request = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.student_id == current_user.id,
        models.ClassroomRequest.classroom_id == classroom.id
    ).order_by(models.ClassroomRequest.requested_at.desc()).first()
    
    if existing_request and existing_request.status == "pending":
        return {
            "id": existing_request.id,
            "student_id": current_user.id,
            "student_name": current_user.full_name,
            "student_email": current_user.email,
            "status": existing_request.status,
            "requested_at": existing_request.requested_at
        }

    # Create new request
    status_to_set = "approved" if not classroom.approval_mode else "pending"
    new_request = models.ClassroomRequest(
        student_id=current_user.id,
        classroom_id=classroom.id,
        status=status_to_set
    )
    
    if status_to_set == "approved":
        current_user.classroom_id = classroom.id
        
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return {
        "id": new_request.id,
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "student_email": current_user.email,
        "status": new_request.status,
        "requested_at": new_request.requested_at
    }

@router.post("/leave")
async def leave_classroom(
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Student leaves their current classroom"""
    if not current_user.classroom_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not in a classroom"
        )
    
    current_user.classroom_id = None
    db.commit()
    return {"message": "Successfully left the classroom"}

@router.get("/status")
async def get_classroom_status(
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Check student's current classroom status"""
    if not current_user.classroom_id:
        # Check if there is a pending request
        pending = db.query(models.ClassroomRequest).filter(
            models.ClassroomRequest.student_id == current_user.id,
            models.ClassroomRequest.status == "pending"
        ).order_by(models.ClassroomRequest.requested_at.desc()).first()
        
        if pending:
            classroom = db.query(models.Classroom).filter(models.Classroom.id == pending.classroom_id).first()
            return {
                "classroom": classroom,
                "request_status": "pending"
            }
        return {"classroom": None, "request_status": None}
        
    classroom = db.query(models.Classroom).filter(models.Classroom.id == current_user.classroom_id).first()
    return {"classroom": classroom, "request_status": "approved"}

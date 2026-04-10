from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import models, schemas, database, security
from ..utils.helpers import generate_classroom_code

router = APIRouter(
    prefix="/api/classroom",
    tags=["Classroom"],
)

@router.post("/", response_model=schemas.ClassroomResponse)
async def create_classroom(
    classroom_in: schemas.ClassroomCreate,
    current_user: models.User = Depends(security.get_current_teacher_user),
    db: Session = Depends(database.get_db)
):
    """
    Create a new classroom (Teacher only).
    """
    # Check if teacher already has a classroom
    existing_classroom = db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    if existing_classroom:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Teacher already manages a classroom"
        )
    
    # Generate unique code
    unique_code = generate_classroom_code()
    while db.query(models.Classroom).filter(models.Classroom.unique_code == unique_code).first():
        unique_code = generate_classroom_code()
        
    db_classroom = models.Classroom(
        teacher_id=current_user.id,
        unique_code=unique_code,
        name=classroom_in.name,
        description=classroom_in.description,
        approval_mode=classroom_in.approval_mode
    )
    
    db.add(db_classroom)
    db.commit()
    db.refresh(db_classroom)
    return db_classroom

@router.get("/me", response_model=Optional[schemas.ClassroomResponse])
async def get_my_classroom(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Get the classroom info for the current user (Student or Teacher).
    """
    if current_user.role == models.UserRole.TEACHER.value:
        return db.query(models.Classroom).filter(models.Classroom.teacher_id == current_user.id).first()
    
    if current_user.classroom_id:
        return db.query(models.Classroom).filter(models.Classroom.id == current_user.classroom_id).first()
        
    return None

@router.post("/join")
async def request_join_classroom(
    request_in: schemas.ClassroomJoinRequest,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Request to join a classroom (Student only).
    """
    if current_user.role != models.UserRole.STUDENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join classrooms"
        )
        
    if current_user.classroom_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already in a classroom"
        )
        
    # Find classroom by code
    classroom = db.query(models.Classroom).filter(models.Classroom.unique_code == request_in.unique_code.upper()).first()
    if not classroom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Classroom not found"
        )
        
    # Check if request already exists
    existing_request = db.query(models.ClassroomRequest).filter(
        models.ClassroomRequest.student_id == current_user.id,
        models.ClassroomRequest.classroom_id == classroom.id,
        models.ClassroomRequest.status == "pending"
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Join request already pending"
        )
        
    if not classroom.approval_mode:
        # Auto-approve
        current_user.classroom_id = classroom.id
        db.commit()
        return {"message": "Joined classroom successfully", "status": "approved"}
    else:
        # Create request
        join_request = models.ClassroomRequest(
            student_id=current_user.id,
            classroom_id=classroom.id,
            status="pending"
        )
        db.add(join_request)
        db.commit()
        return {"message": "Join request sent", "status": "pending"}

@router.post("/leave")
async def leave_classroom(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Leave current classroom.
    """
    if current_user.role != models.UserRole.STUDENT.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can leave classrooms through this endpoint"
        )
        
    if not current_user.classroom_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not currently in a classroom"
        )
        
    current_user.classroom_id = None
    db.commit()
    return {"message": "Left classroom successfully"}

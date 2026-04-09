from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
import os
import json
from datetime import datetime

from .. import models, schemas, database, security
from ..services import file_scanner

router = APIRouter(prefix="/api/scan", tags=["File Scan"])

@router.post("/file", response_model=schemas.FileScanResponse)
async def scan_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Upload and scan a file for security threats.
    
    Accepts: PDF, DOC, DOCX, TXT, JPG, PNG, ZIP, EXE
    Returns: Security score, threat detection, metadata analysis
    """
    # Validate file size (max 10MB)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 10MB limit"
        )
    
    # Validate file type
    allowed_extensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.zip', '.exe']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Generate file hash
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Scan the file
    scan_result = file_scanner.analyze_file(
        content=content,
        filename=file.filename,
        file_type=file_ext,
        file_size=file_size,
        file_hash=file_hash
    )
    
    # Log scan to database
    scan_log = models.FileScanLog(
        user_id=current_user.id,
        filename=file.filename,
        file_type=file_ext,
        file_size=file_size,
        file_hash=file_hash,
        security_score=scan_result['security_score'],
        threat_detected=scan_result['is_threat'],
        threat_type=scan_result.get('threat_type', 'none'),
        recommendations=json.dumps(scan_result.get('recommendations', [])),
        scan_result=json.dumps(scan_result)
    )
    
    db.add(scan_log)
    
    # Update user security score if they're being proactive
    if not scan_result['is_threat']:
        # Reward safe scanning behavior
        current_user.security_score = min(100, current_user.security_score + 1)
    
    db.commit()
    db.refresh(scan_log)
    
    return schemas.FileScanResponse(
        scan_id=scan_log.id,
        **scan_result
    )

@router.get("/history", response_model=list[schemas.FileScanLogResponse])
async def get_scan_history(
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db),
    limit: int = 20
):
    """Get user's file scan history"""
    scans = db.query(models.FileScanLog).filter(
        models.FileScanLog.user_id == current_user.id
    ).order_by(models.FileScanLog.timestamp.desc()).limit(limit).all()
    
    return scans

@router.get("/{scan_id}", response_model=schemas.FileScanResponse)
async def get_scan_details(
    scan_id: int,
    current_user: models.User = Depends(security.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Get details of a specific scan"""
    scan = db.query(models.FileScanLog).filter(
        models.FileScanLog.id == scan_id,
        models.FileScanLog.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    return schemas.FileScanResponse(
        scan_id=scan.id,
        **json.loads(scan.scan_result)
    )
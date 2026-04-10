from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from .. import models, schemas, database, security
from ..dependencies import get_current_active_user

router = APIRouter(
    prefix="/api/student",
    tags=["student"],
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger(__name__)

@router.get("/blocked-sites", response_model=List[schemas.BlockedSiteResponse])
async def get_blocked_sites(
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Retrieve all blocked websites for the current student"""
    return db.query(models.BlockedSite).filter(models.BlockedSite.user_id == current_user.id).all()

@router.post("/blocked-sites", response_model=schemas.BlockedSiteResponse)
async def add_blocked_site(
    site_in: schemas.BlockedSiteCreate,
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Add a new website to the student's personal blocklist"""
    # Clean the domain
    domain = site_in.url.strip().lower()
    domain = domain.replace("https://", "").replace("http://", "").replace("www.", "")
    domain = domain.split("/")[0]

    # Check if already exists for this user
    existing = db.query(models.BlockedSite).filter(
        models.BlockedSite.user_id == current_user.id,
        models.BlockedSite.domain == domain
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This website is already on your blocklist"
        )

    new_site = models.BlockedSite(
        user_id=current_user.id,
        domain=domain,
        reason=site_in.reason
    )
    
    db.add(new_site)
    db.commit()
    db.refresh(new_site)
    return new_site

@router.delete("/blocked-sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_blocked_site(
    site_id: int,
    current_user: models.User = Depends(security.require_role(models.UserRole.student)),
    db: Session = Depends(database.get_db)
):
    """Remove a website from the blocklist"""
    site = db.query(models.BlockedSite).filter(
        models.BlockedSite.id == site_id,
        models.BlockedSite.user_id == current_user.id
    ).first()
    
    if not site:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocked site not found"
        )
    
    db.delete(site)
    db.commit()
    return None

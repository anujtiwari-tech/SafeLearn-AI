from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from . import models, database, security

# Re-export auth dependencies for convenience
from .security import (
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
    oauth2_scheme
)

def get_db_session() -> Session:
    """Alias for database.get_db for cleaner imports"""
    return next(database.get_db())

def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
) -> Optional[models.User]:
    """
    Get current user if authenticated, otherwise return None.
    Useful for endpoints that work for both authenticated and guest users.
    """
    if not token:
        return None
    
    try:
        return security.get_current_user(token=token, db=db)
    except HTTPException:
        return None

def require_verified_user(
    current_user: models.User = Depends(get_current_active_user)
) -> models.User:
    """Ensure user has verified their email (if email verification is implemented)"""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address first"
        )
    return current_user

def check_user_owns_resource(
    user_id: int,
    current_user: models.User = Depends(get_current_active_user)
) -> bool:
    """Check if current user owns a resource (for authorization)"""
    if current_user.id != user_id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    return True
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from .. import models, security

def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    role: models.UserRole = models.UserRole.STUDENT
) -> models.User:
    """Create a new user with hashed password"""
    hashed_password = security.get_password_hash(password)
    
    user = models.User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        role=role,
        is_active=True,
        is_verified=False,  # Set to True after email verification (if implemented)
        security_score=50,  # Starting score
        points=0,           # Starting points
        created_at=datetime.utcnow()
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> Optional[models.User]:
    """Authenticate user by email and password"""
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        return None
    
    if not security.verify_password(password, user.hashed_password):
        return None
    
    if not user.is_active:
        return None
    
    return user

def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email"""
    return db.query(models.User).filter(models.User.email == email).first()

def update_user(
    db: Session,
    user: models.User,
    update_data: dict
) -> models.User:
    """Update user fields"""
    update_dict = {k: v for k, v in update_data.items() if v is not None}
    
    for field, value in update_dict.items():
        if hasattr(user, field):
            setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

def update_last_login(db: Session, user_id: int) -> None:
    """Update user's last login timestamp"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.last_login_at = datetime.utcnow()
        db.commit()

def change_password(
    db: Session,
    user: models.User,
    current_password: str,
    new_password: str
) -> bool:
    """Change user's password after verifying current password"""
    if not security.verify_password(current_password, user.hashed_password):
        return False
    
    user.hashed_password = security.get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    
    # Optional: Revoke all refresh tokens when password changes
    revoke_all_refresh_tokens(db, user.id)
    
    db.commit()
    return True

def update_security_score(
    db: Session,
    user_id: int,
    points: int,
    max_score: int = 100,
    min_score: int = 0
) -> int:
    """Update user's security score with bounds checking"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return user.security_score if user else 50
    
    new_score = user.security_score + points
    new_score = max(min_score, min(max_score, new_score))  # Clamp to range
    
    user.security_score = new_score
    db.commit()
    
    return new_score

# ===== REFRESH TOKEN MANAGEMENT =====

def store_refresh_token(
    db: Session,
    user_id: int,
    token: str
) -> models.RefreshToken:
    """Store a hashed refresh token"""
    # Hash the token for storage (never store raw tokens)
    token_hash = security.get_password_hash(token)
    
    refresh_token = models.RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc).replace(
            day=datetime.now(timezone.utc).day + settings.REFRESH_TOKEN_EXPIRE_DAYS
        ),
        is_revoked=False
    )
    
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)
    
    return refresh_token

def is_refresh_token_valid(
    db: Session,
    user_id: int,
    token: str
) -> bool:
    """Check if a refresh token is valid and not revoked"""
    token_hash = security.get_password_hash(token)
    
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user_id,
        models.RefreshToken.token_hash == token_hash,
        models.RefreshToken.is_revoked == False,
        models.RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    return refresh_token is not None

def revoke_refresh_token(
    db: Session,
    user_id: int,
    token: str
) -> bool:
    """Revoke a specific refresh token"""
    token_hash = security.get_password_hash(token)
    
    refresh_token = db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user_id,
        models.RefreshToken.token_hash == token_hash
    ).first()
    
    if refresh_token:
        refresh_token.is_revoked = True
        db.commit()
        return True
    
    return False

def revoke_all_refresh_tokens(db: Session, user_id: int) -> int:
    """Revoke all refresh tokens for a user (e.g., after password change)"""
    count = db.query(models.RefreshToken).filter(
        models.RefreshToken.user_id == user_id,
        models.RefreshToken.is_revoked == False
    ).update({"is_revoked": True})
    
    db.commit()
    return count

def rotate_refresh_token(
    db: Session,
    user_id: int,
    old_token: str,
    new_token: str
) -> tuple[models.RefreshToken, models.RefreshToken]:
    """Revoke old refresh token and issue new one (token rotation)"""
    # Revoke old token
    revoke_refresh_token(db, user_id, old_token)
    
    # Store new token
    new_refresh = store_refresh_token(db, user_id, new_token)
    
    # Cleanup expired tokens
    cleanup_expired_tokens(db, user_id)
    
    return None, new_refresh  # Old is revoked, return new

def cleanup_expired_tokens(db: Session, user_id: Optional[int] = None) -> int:
    """Delete expired refresh tokens"""
    query = db.query(models.RefreshToken).filter(
        models.RefreshToken.expires_at < datetime.now(timezone.utc)
    )
    
    if user_id:
        query = query.filter(models.RefreshToken.user_id == user_id)
    
    count = query.delete()
    db.commit()
    
    return count
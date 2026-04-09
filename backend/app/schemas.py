from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ===== AUTH SCHEMAS =====

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int  # seconds until expiration
    user_id: Optional[int] = None

class TokenData(BaseModel):
    """Decoded token payload"""
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None
    type: Optional[str] = None

class UserBase(BaseModel):
    """Base user fields"""
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)

class UserCreate(UserBase):
    """User registration input"""
    password: str = Field(..., min_length=8, max_length=128)
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

class UserLogin(BaseModel):
    """User login input"""
    email: EmailStr
    password: str

class UserResponse(UserBase):
    """User data returned to client (no sensitive info)"""
    id: int
    role: str
    security_score: int
    learning_streak: int
    points: int
    is_active: bool
    is_verified: bool
    email_alerts: bool
    push_notifications: bool
    weekly_reports: bool
    protection_paused_until: Optional[datetime] = None
    total_scans: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===== LEARNING HUB SCHEMAS =====

class LearningModuleStatus(str, Enum):
    NOT_STARTED = "not_started"
    STARTED = "started"
    COMPLETED = "completed"

class LearningModuleMetadata(BaseModel):
    """Static data for a learning module"""
    id: str
    title: str
    description: str
    type: str  # lesson, quiz
    duration: str
    points: int
    content: Optional[str] = None
    explanation: Optional[str] = None
    keyPoints: Optional[List[str]] = None
    whatYouWillLearn: Optional[List[str]] = None

class LearningModuleResponse(LearningModuleMetadata):
    """Module data with user's specific progress"""
    status: str
    completed_at: Optional[datetime] = None

class LearningProgressResponse(BaseModel):
    """Overall learning stats for the user"""
    total_points: int
    lessons_completed: int
    completion_rate: int
    badges_earned: List[str]
    streak: int


class UserSettingsUpdate(BaseModel):
    """Fields that can be updated by user in settings"""
    full_name: Optional[str] = Field(None, max_length=255)
    email_alerts: Optional[bool] = None
    push_notifications: Optional[bool] = None
    weekly_reports: Optional[bool] = None

class PauseProtectionRequest(BaseModel):
    """Pause protection duration request"""
    duration_minutes: int  # 60, 240, 1440 (1 day), etc.

class UserUpdate(BaseModel):
    """Fields that can be updated by user"""
    full_name: Optional[str] = Field(None, max_length=255)
    # Note: Password updates should be a separate endpoint

class PasswordChange(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        # Same validation as UserCreate.password
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

# ===== THREAT ANALYSIS SCHEMAS =====

class RiskIndicator(BaseModel):
    """Detailed risk indicator"""
    type: str
    detail: str
    severity: str  # low, medium, high, critical

class ThreatAnalysisRequest(BaseModel):
    """Request to analyze a URL/text for threats"""
    url: str = Field(..., max_length=2048)
    email_text: Optional[str] = Field(None, max_length=10000)
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    user_id: Optional[int] = None

class ThreatAnalysisResponse(BaseModel):
    """Response from threat analysis with consequences"""
    is_threat: bool
    threat_type: str
    threat_level: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    explanation: str
    consequences: Optional[str] = None  # ← NEW FIELD: What happens if user ignores warning
    risk_indicators: List[RiskIndicator]
    performed_checks: List[str] = []
    action_recommended: str  # block, warn, allow
    timestamp: datetime
    threat_log_id: Optional[int] = None

class ThreatLogResponse(BaseModel):
    """Threat log entry for history view with consequences"""
    id: int
    url: str
    threat_type: str
    threat_level: str
    action_taken: str
    explanation: Optional[str]
    consequences: Optional[str] = None  # ← NEW FIELD
    confidence_score: Optional[float]
    risk_indicators: Optional[List[RiskIndicator]] = None
    performed_checks: Optional[List[str]] = None
    scan_metadata: Optional[dict] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

# ===== DASHBOARD SCHEMAS =====

class DashboardStats(BaseModel):
    """Statistics for user dashboard"""
    security_score: int
    threats_blocked_today: int
    threats_blocked_week: int
    threats_blocked_month: int
    learning_streak: int
    learning_progress: int  # Number of completed modules
    badges_earned: List[str]
    total_points: int
    total_scans: int = 0
    last_activity: Optional[datetime]

class ThreatHistoryItem(BaseModel):
    """Item in threat history list"""
    id: int
    url: str
    threat_type: str
    explanation: Optional[str]
    consequences: Optional[str] = None  # ← NEW FIELD
    timestamp: datetime
    is_helpful: Optional[bool]
    feedback_count: int

# ===== FEEDBACK SCHEMAS =====

class FeedbackCreate(BaseModel):
    """Submit feedback on a threat alert"""
    threat_log_id: int
    is_helpful: bool
    comment: Optional[str] = Field(None, max_length=1000)
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackResponse(BaseModel):
    """Feedback submission confirmation"""
    message: str
    feedback_id: int
    security_score_updated: Optional[int] = None

# ===== PRIVACY LABEL SCHEMAS =====

class PrivacyLabel(BaseModel):
    """Privacy assessment for a domain/app"""
    domain: str
    privacy_score: int = Field(..., ge=0, le=10)
    score_color: str  # green, yellow, red
    data_collection: List[str]
    data_sharing: List[str]
    third_parties: List[str]
    summary: str
    last_updated: datetime


# ===== FILE SCAN SCHEMAS =====

class FileScanRequest(BaseModel):
    """File scan request (for documentation)"""
    filename: str
    file_size: int

class FileScanResponse(BaseModel):
    """File scan response"""
    scan_id: int
    filename: str
    file_size: int
    file_size_human: str
    file_hash: str
    security_score: int
    is_threat: bool
    threat_type: str
    threat_level: str
    risk_indicators: List[str]
    recommendations: List[str]
    metadata: dict
    scan_timestamp: str
    scanner_version: str

class FileScanLogResponse(BaseModel):
    """File scan log for history view"""
    id: int
    filename: str
    file_type: str
    file_size: int
    security_score: int
    threat_detected: bool
    threat_type: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

# ===== EMAIL ANALYSIS SCHEMAS =====

class EmailAnalysisRequest(BaseModel):
    """Request to analyze email content"""
    sender_email: str
    sender_name: Optional[str] = None
    subject: str
    body_text: str
    links: List[str] = []
    has_attachment: bool = False
    email_platform: Optional[str] = None  # "gmail", "outlook", etc.
    current_url: Optional[str] = None

class EmailAnalysisResponse(ThreatAnalysisResponse):
    """Email analysis response (extends ThreatAnalysisResponse)"""
    pass
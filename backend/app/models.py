from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship, validates
from datetime import datetime
import enum

from .base import Base

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class LearningModuleStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    STARTED = "started"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    
    @validates('role')
    def validate_role(self, key, value):
        if isinstance(value, str):
            return value.lower()
        return value

    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    security_score = Column(Integer, default=50) # 0-100
    learning_streak = Column(Integer, default=0)
    points = Column(Integer, default=0)
    
    # Settings & Privacy
    email_alerts = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    weekly_reports = Column(Boolean, default=False)
    protection_paused_until = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)
    total_scans = Column(Integer, default=0) # Total pages analyzed

    # Relationships
    threat_logs = relationship("ThreatLog", back_populates="user")
    file_scans = relationship("FileScanLog", back_populates="user")
    learning_progress = relationship("LearningProgress", back_populates="user")
    badges = relationship("UserBadge", back_populates="user")
    blocked_sites = relationship("BlockedSite", back_populates="user", cascade="all, delete-orphan")
    
    # New relationships for teacher/classroom
    classroom = relationship("Classroom", back_populates="students", foreign_keys=[classroom_id])
    owned_classroom = relationship("Classroom", back_populates="teacher", uselist=False, foreign_keys="Classroom.teacher_id")
    classroom_requests = relationship("ClassroomRequest", back_populates="student")

class ThreatLog(Base):
    __tablename__ = "threat_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    url = Column(String, nullable=False)
    threat_type = Column(String, nullable=False) # phishing, malware, etc.
    threat_level = Column(String, nullable=False) # low, medium, high
    action_taken = Column(String, nullable=False) # blocked, warned, allowed
    explanation = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    risk_indicators = Column(Text, nullable=True) # JSON string of indicators
    performed_checks = Column(Text, nullable=True) # Human-readable audit trail
    scan_metadata = Column(Text, nullable=True) # JSON string of extra context (email details, etc.)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="threat_logs")
    feedback = relationship("Feedback", back_populates="threat_log")

class FileScanLog(Base):
    __tablename__ = "file_scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    file_hash = Column(String, nullable=True)
    security_score = Column(Integer, default=100)
    threat_detected = Column(Boolean, default=False)
    threat_type = Column(String, nullable=True)
    recommendations = Column(Text, nullable=True) # JSON string
    scan_result = Column(Text, nullable=True) # JSON full result
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="file_scans")

class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    module_id = Column(String, nullable=False)
    module_name = Column(String, nullable=False)
    status = Column(String, default="started") # started, completed
    score = Column(Integer, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="learning_progress")

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_name = Column(String, nullable=False)
    badge_icon = Column(String, nullable=True)
    earned_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="badges")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    threat_log_id = Column(Integer, ForeignKey("threat_logs.id"))
    is_helpful = Column(Boolean, nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    threat_log = relationship("ThreatLog", back_populates="feedback")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), unique=True)
    unique_code = Column(String, unique=True, index=True, nullable=False) # 8-char alphanumeric
    approval_mode = Column(Boolean, default=True) # if True, students need approval to join
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    teacher = relationship("User", back_populates="owned_classroom", foreign_keys=[teacher_id])
    students = relationship("User", back_populates="classroom", foreign_keys=[User.classroom_id])
    requests = relationship("ClassroomRequest", back_populates="classroom")

class ClassroomRequest(Base):
    __tablename__ = "classroom_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    classroom_id = Column(Integer, ForeignKey("classrooms.id"))
    status = Column(String, default="pending") # pending, approved, rejected
    requested_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("User", back_populates="classroom_requests")
    classroom = relationship("Classroom", back_populates="requests")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token_hash = Column(String, index=True, nullable=False)
    is_revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User")

class BlockedSite(Base):
    __tablename__ = "blocked_sites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String(255), nullable=False, index=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="blocked_sites")

    def __repr__(self):
        return f"<BlockedSite(id={self.id}, domain='{self.domain}', user_id={self.user_id})>"
"""
Notification Models
Database models for the notification system
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from src.db.base import Base


class NotificationType(str, enum.Enum):
    """Notification types"""
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_STATUS_CHANGED = "application_status_changed"
    NEW_JOB_MATCH = "new_job_match"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    MESSAGE_RECEIVED = "message_received"
    PROFILE_VIEWED = "profile_viewed"
    JOB_POSTED = "job_posted"
    TEAM_INVITATION = "team_invitation"
    SYSTEM_ANNOUNCEMENT = "system_announcement"


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Notification details
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Related entities
    related_job_id = Column(UUID(as_uuid=True), nullable=True)
    related_application_id = Column(UUID(as_uuid=True), nullable=True)
    related_user_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Metadata
    is_read = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    action_url = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'type': self.type.value if self.type else None,
            'title': self.title,
            'message': self.message,
            'related_job_id': str(self.related_job_id) if self.related_job_id else None,
            'related_application_id': str(self.related_application_id) if self.related_application_id else None,
            'related_user_id': str(self.related_user_id) if self.related_user_id else None,
            'is_read': self.is_read,
            'is_archived': self.is_archived,
            'action_url': self.action_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }


class NotificationPreference(Base):
    """User notification preferences"""
    __tablename__ = "notification_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Email notifications
    email_application_received = Column(Boolean, default=True)
    email_application_status = Column(Boolean, default=True)
    email_new_job_match = Column(Boolean, default=True)
    email_interview_scheduled = Column(Boolean, default=True)
    email_message_received = Column(Boolean, default=True)
    
    # In-app notifications
    app_application_received = Column(Boolean, default=True)
    app_application_status = Column(Boolean, default=True)
    app_new_job_match = Column(Boolean, default=True)
    app_interview_scheduled = Column(Boolean, default=True)
    app_message_received = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notification_preferences")


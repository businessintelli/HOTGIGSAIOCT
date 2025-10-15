"""
Saved Search Models
Database models for saved searches and search alerts
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from src.db.base import Base


class SavedSearch(Base):
    """Saved search model"""
    __tablename__ = "saved_searches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Search details
    name = Column(String(255), nullable=False)
    search_type = Column(String(50), nullable=False)  # 'jobs' or 'candidates'
    
    # Search criteria (stored as JSON)
    criteria = Column(JSON, nullable=False)
    
    # Alert settings
    is_alert_enabled = Column(Boolean, default=False)
    alert_frequency = Column(String(50), default="daily")  # daily, weekly, instant
    last_alert_sent = Column(DateTime, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    result_count = Column(String(50), nullable=True)  # e.g., "15 new jobs"
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_searches")
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'name': self.name,
            'search_type': self.search_type,
            'criteria': self.criteria,
            'is_alert_enabled': self.is_alert_enabled,
            'alert_frequency': self.alert_frequency,
            'last_alert_sent': self.last_alert_sent.isoformat() if self.last_alert_sent else None,
            'is_active': self.is_active,
            'result_count': self.result_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_used': self.last_used.isoformat() if self.last_used else None
        }


"""
Email Log Models for tracking email activity
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from src.db.base import Base

class EmailLog(Base):
    """
    Email log model for tracking all sent emails
    """
    __tablename__ = "email_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String(255), unique=True, index=True, nullable=False)
    
    # Recipient information
    to_email = Column(String(255), index=True, nullable=False)
    from_email = Column(String(255), nullable=False)
    
    # Email content
    subject = Column(String(500), nullable=False)
    template_name = Column(String(100), index=True)
    
    # Status tracking
    status = Column(String(50), index=True, default="pending")
    # Status values: pending, sent, delivered, opened, clicked, bounced, complained, failed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    sent_at = Column(DateTime(timezone=True))
    delivered_at = Column(DateTime(timezone=True))
    opened_at = Column(DateTime(timezone=True))
    clicked_at = Column(DateTime(timezone=True))
    bounced_at = Column(DateTime(timezone=True))
    complained_at = Column(DateTime(timezone=True))
    
    # Engagement tracking
    opened = Column(Boolean, default=False)
    clicked = Column(Boolean, default=False)
    open_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    
    # Bounce information
    bounce_type = Column(String(50))  # hard, soft
    bounce_reason = Column(Text)
    
    # Additional metadata
    metadata = Column(JSON)
    
    # User agent for tracking
    user_agent = Column(Text)
    
    def __repr__(self):
        return f"<EmailLog(id={self.id}, email_id={self.email_id}, to={self.to_email}, status={self.status})>"


class EmailClick(Base):
    """
    Email click tracking model for tracking individual link clicks
    """
    __tablename__ = "email_clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String(255), index=True, nullable=False)
    
    # Click information
    link = Column(Text, nullable=False)
    clicked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # User information
    user_agent = Column(Text)
    ip_address = Column(String(45))
    
    def __repr__(self):
        return f"<EmailClick(id={self.id}, email_id={self.email_id}, link={self.link})>"


class EmailTemplate(Base):
    """
    Email template model for storing and versioning email templates
    """
    __tablename__ = "email_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    
    # Template content
    subject = Column(String(500), nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text)
    
    # Template metadata
    description = Column(Text)
    category = Column(String(50), index=True)  # transactional, marketing, notification
    
    # Version control
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Variables used in template
    variables = Column(JSON)  # List of variable names used in template
    
    def __repr__(self):
        return f"<EmailTemplate(id={self.id}, name={self.name}, version={self.version})>"


class EmailPreference(Base):
    """
    Email preference model for storing user email preferences
    """
    __tablename__ = "email_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    email = Column(String(255), index=True, nullable=False)
    
    # Preference flags
    application_updates = Column(Boolean, default=True)
    interview_notifications = Column(Boolean, default=True)
    job_recommendations = Column(Boolean, default=True)
    weekly_digest = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    recruiter_messages = Column(Boolean, default=True)
    status_updates = Column(Boolean, default=True)
    
    # Unsubscribe tracking
    unsubscribed_at = Column(DateTime(timezone=True))
    unsubscribe_reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<EmailPreference(id={self.id}, user_id={self.user_id}, email={self.email})>"


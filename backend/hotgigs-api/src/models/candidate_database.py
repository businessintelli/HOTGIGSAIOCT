"""
Multi-Level Candidate Database Models

This module defines the database models for the multi-level candidate database
with privacy controls, including recruiter-candidate mappings, candidate sharing,
and activity tracking.
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, ARRAY, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from src.db.base import Base


class CandidateSource(str, enum.Enum):
    """Source of candidate addition to recruiter database"""
    APPLICATION = "application"
    RESUME_IMPORT = "resume_import"
    BULK_UPLOAD = "bulk_upload"
    GOOGLE_DRIVE = "google_drive"
    ADMIN_SHARE = "admin_share"
    MANUAL_ADD = "manual_add"


class ActivityType(str, enum.Enum):
    """Types of candidate activities"""
    RESUME_UPLOADED = "resume_uploaded"
    PROFILE_VIEWED = "profile_viewed"
    PROFILE_UPDATED = "profile_updated"
    CONTACTED = "contacted"
    SHARED = "shared"
    APPLIED_TO_JOB = "applied_to_job"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    STATUS_CHANGED = "status_changed"
    NOTE_ADDED = "note_added"
    TAG_ADDED = "tag_added"
    TAG_REMOVED = "tag_removed"
    RESUME_DOWNLOADED = "resume_downloaded"
    EMAIL_SENT = "email_sent"


class RecruiterCandidate(Base):
    """
    Mapping table between recruiters and candidates with privacy controls.
    
    This table maintains the recruiter-isolated candidate pools.
    Each recruiter can only see candidates in their own pool.
    """
    __tablename__ = "recruiter_candidates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relationships
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Source tracking
    source = Column(SQLEnum(CandidateSource), nullable=False, index=True)
    source_reference_id = Column(UUID(as_uuid=True), nullable=True)  # Reference to resume_id, application_id, etc.
    
    # Privacy and access control
    is_visible = Column(Boolean, default=True, nullable=False)
    can_contact = Column(Boolean, default=True, nullable=False)
    
    # Metadata
    notes = Column(Text, nullable=True)
    tags = Column(ARRAY(String), default=list, nullable=False)
    
    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_viewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    
    # Unique constraint: one candidate per recruiter
    __table_args__ = (
        {'schema': None},
    )


class CandidateShare(Base):
    """
    Candidate sharing between recruiters (admin-initiated).
    
    This table tracks when admin shares candidates between recruiters.
    """
    __tablename__ = "candidate_shares"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Sharing relationships
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    from_recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)  # Original owner
    to_recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)  # Recipient
    shared_by_admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)  # Admin who shared
    
    # Sharing details
    share_reason = Column(Text, nullable=True)
    share_notes = Column(Text, nullable=True)
    
    # Access control
    can_view_contact_info = Column(Boolean, default=True, nullable=False)
    can_download_resume = Column(Boolean, default=True, nullable=False)
    can_submit_to_jobs = Column(Boolean, default=True, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    accepted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    from_recruiter = relationship("User", foreign_keys=[from_recruiter_id])
    to_recruiter = relationship("User", foreign_keys=[to_recruiter_id])
    shared_by_admin = relationship("User", foreign_keys=[shared_by_admin_id])
    
    # Unique constraint: one share per candidate-recruiter pair
    __table_args__ = (
        {'schema': None},
    )


class CandidateActivity(Base):
    """
    Activity tracking for candidates.
    
    This table logs all activities related to candidates for audit and analytics.
    Activities are immutable once created.
    """
    __tablename__ = "candidate_activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Activity relationships
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)  # User who performed action
    
    # Activity details
    activity_type = Column(SQLEnum(ActivityType), nullable=False, index=True)
    activity_description = Column(Text, nullable=True)
    
    # Context
    reference_type = Column(String(50), nullable=True)  # 'job', 'resume', 'application', etc.
    reference_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Metadata
    metadata = Column(JSONB, default=dict, nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamp (immutable)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    user = relationship("User", foreign_keys=[user_id])
    
    __table_args__ = (
        {'schema': None},
    )


class CandidateTag(Base):
    """
    Predefined tags for candidate categorization.
    
    This table stores reusable tags that can be applied to candidates.
    """
    __tablename__ = "candidate_tags"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Tag details
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#3B82F6", nullable=False)  # Hex color code
    
    # Ownership
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_global = Column(Boolean, default=False, nullable=False)  # Global tags visible to all
    
    # Usage tracking
    usage_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    created_by = relationship("User", foreign_keys=[created_by_id])
    
    __table_args__ = (
        {'schema': None},
    )


class CandidateNote(Base):
    """
    Notes about candidates.
    
    This table stores recruiter notes about candidates.
    """
    __tablename__ = "candidate_notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relationships
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Note content
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    
    # Metadata
    is_private = Column(Boolean, default=False, nullable=False)  # Private to recruiter or shared with team
    is_important = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    
    __table_args__ = (
        {'schema': None},
    )


class CandidateList(Base):
    """
    Custom candidate lists/folders for recruiters.
    
    This table allows recruiters to organize candidates into custom lists.
    """
    __tablename__ = "candidate_lists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # List details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#3B82F6", nullable=False)
    icon = Column(String(50), nullable=True)
    
    # Ownership
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Settings
    is_smart_list = Column(Boolean, default=False, nullable=False)  # Dynamic list based on criteria
    smart_criteria = Column(JSONB, nullable=True)  # Criteria for smart lists
    
    # Metadata
    candidate_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    list_items = relationship("CandidateListItem", back_populates="candidate_list", cascade="all, delete-orphan")
    
    __table_args__ = (
        {'schema': None},
    )


class CandidateListItem(Base):
    """
    Items in candidate lists.
    
    This table maps candidates to custom lists.
    """
    __tablename__ = "candidate_list_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Relationships
    list_id = Column(UUID(as_uuid=True), ForeignKey("candidate_lists.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Metadata
    position = Column(Integer, default=0, nullable=False)  # For manual ordering
    notes = Column(Text, nullable=True)
    
    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    candidate_list = relationship("CandidateList", back_populates="list_items")
    candidate = relationship("CandidateProfile", foreign_keys=[candidate_id])
    
    # Unique constraint: one candidate per list
    __table_args__ = (
        {'schema': None},
    )


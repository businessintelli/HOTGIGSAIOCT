"""
Resume Import System - Database Models

This module defines the database models for the resume import system,
including resumes, parsed data, processing jobs, and candidate matches.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from src.db.base import Base


class ResumeStatus(str, enum.Enum):
    """Status of resume processing"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PENDING = "pending"


class JobStatus(str, enum.Enum):
    """Status of background processing job"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ImportSource(str, enum.Enum):
    """Source of resume import"""
    CANDIDATE_UPLOAD = "candidate_upload"
    RECRUITER_UPLOAD = "recruiter_upload"
    BULK_UPLOAD = "bulk_upload"
    GOOGLE_DRIVE = "google_drive"
    API_IMPORT = "api_import"


class Resume(Base):
    """
    Resume metadata and file information.
    
    This table stores the original resume file and metadata.
    The parsed data is stored in ResumeData table.
    """
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # User relationships
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # File information
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_type = Column(String(50), nullable=False)  # pdf, docx, doc, etc.
    
    # Processing status
    status = Column(SQLEnum(ResumeStatus), default=ResumeStatus.UPLOADED, nullable=False, index=True)
    import_source = Column(SQLEnum(ImportSource), nullable=False, index=True)
    
    # Processing metadata
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    processing_error = Column(Text, nullable=True)
    processing_attempts = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    candidate = relationship("User", foreign_keys=[candidate_id], backref="resumes")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])
    resume_data = relationship("ResumeData", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    processing_job = relationship("ProcessingJob", back_populates="resume", uselist=False, cascade="all, delete-orphan")


class ResumeData(Base):
    """
    Parsed and structured resume data.
    
    This table stores the AI-extracted information from the resume.
    """
    __tablename__ = "resume_data"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), unique=True, nullable=False, index=True)
    
    # Personal Information
    full_name = Column(String(255), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    
    # Professional Summary
    summary = Column(Text, nullable=True)
    
    # Experience (stored as JSON array)
    experience = Column(JSON, nullable=True)
    # Format: [
    #   {
    #     "title": "Software Engineer",
    #     "company": "Tech Corp",
    #     "location": "San Francisco, CA",
    #     "start_date": "2020-01",
    #     "end_date": "2023-05",
    #     "current": false,
    #     "description": "Developed web applications...",
    #     "achievements": ["Led team of 5", "Increased performance by 40%"]
    #   }
    # ]
    
    # Education (stored as JSON array)
    education = Column(JSON, nullable=True)
    # Format: [
    #   {
    #     "degree": "Bachelor of Science in Computer Science",
    #     "institution": "University of California",
    #     "location": "Berkeley, CA",
    #     "graduation_date": "2020-05",
    #     "gpa": "3.8"
    #   }
    # ]
    
    # Skills (stored as JSON array)
    skills = Column(JSON, nullable=True)
    # Format: [
    #   {"name": "Python", "category": "programming", "proficiency": "expert"},
    #   {"name": "React", "category": "frontend", "proficiency": "advanced"}
    # ]
    
    # Top 5 skills (for quick matching)
    top_skills = Column(JSON, nullable=True)
    # Format: ["Python", "React", "PostgreSQL", "AWS", "Docker"]
    
    # Certifications (stored as JSON array)
    certifications = Column(JSON, nullable=True)
    # Format: [
    #   {
    #     "name": "AWS Certified Solutions Architect",
    #     "issuer": "Amazon Web Services",
    #     "issue_date": "2022-03",
    #     "expiry_date": "2025-03",
    #     "credential_id": "ABC123"
    #   }
    # ]
    
    # Additional Information
    languages = Column(JSON, nullable=True)  # ["English (Native)", "Spanish (Fluent)"]
    total_experience_years = Column(Float, nullable=True)
    
    # Raw extracted text (for search and analysis)
    raw_text = Column(Text, nullable=True)
    
    # AI-generated insights
    ai_summary = Column(Text, nullable=True)
    key_strengths = Column(JSON, nullable=True)  # ["Strong backend development", "Team leadership"]
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    resume = relationship("Resume", back_populates="resume_data")


class ProcessingJob(Base):
    """
    Background processing job for resume parsing.
    
    This table tracks the status of background jobs.
    """
    __tablename__ = "processing_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), unique=True, nullable=False, index=True)
    
    # Celery task information
    celery_task_id = Column(String(255), unique=True, nullable=True, index=True)
    
    # Job status
    status = Column(SQLEnum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True)
    priority = Column(Integer, default=5, nullable=False)  # 1-10, higher = more urgent
    
    # Progress tracking
    progress_percentage = Column(Integer, default=0)  # 0-100
    current_step = Column(String(100), nullable=True)  # "Extracting text", "Running NER", etc.
    
    # Timing information
    queued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    resume = relationship("Resume", back_populates="processing_job")


class CandidateMatch(Base):
    """
    Candidate-to-job matching results.
    
    This table stores matches between candidates and jobs based on parsed resume data.
    """
    __tablename__ = "candidate_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    
    # Match score (0-100)
    match_score = Column(Float, nullable=False, index=True)
    
    # Detailed scoring breakdown
    skill_match_score = Column(Float, nullable=True)
    experience_match_score = Column(Float, nullable=True)
    education_match_score = Column(Float, nullable=True)
    location_match_score = Column(Float, nullable=True)
    
    # Match explanation (AI-generated)
    match_explanation = Column(Text, nullable=True)
    matching_skills = Column(JSON, nullable=True)  # ["Python", "React", "AWS"]
    missing_skills = Column(JSON, nullable=True)  # ["Kubernetes", "GraphQL"]
    
    # Status
    is_active = Column(Boolean, default=True, index=True)
    viewed_by_recruiter = Column(Boolean, default=False)
    viewed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    candidate = relationship("User", foreign_keys=[candidate_id])
    job = relationship("Job", foreign_keys=[job_id])
    resume = relationship("Resume", foreign_keys=[resume_id])


class GoogleDriveSync(Base):
    """
    Google Drive folder sync configuration.
    
    This table stores the configuration for Google Drive integration.
    """
    __tablename__ = "google_drive_syncs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Recruiter who owns this sync
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Google Drive information
    folder_id = Column(String(255), nullable=False)
    folder_name = Column(String(255), nullable=True)
    
    # OAuth credentials (encrypted)
    access_token = Column(Text, nullable=True)  # Should be encrypted
    refresh_token = Column(Text, nullable=True)  # Should be encrypted
    token_expiry = Column(DateTime, nullable=True)
    
    # Sync settings
    is_active = Column(Boolean, default=True, index=True)
    sync_frequency = Column(String(50), default="daily")  # daily, weekly, manual
    last_sync_at = Column(DateTime, nullable=True)
    next_sync_at = Column(DateTime, nullable=True)
    
    # Statistics
    total_files_synced = Column(Integer, default=0)
    total_files_processed = Column(Integer, default=0)
    total_files_failed = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    recruiter = relationship("User", foreign_keys=[recruiter_id])


class BulkUploadBatch(Base):
    """
    Bulk upload batch tracking.
    
    This table tracks bulk upload operations.
    """
    __tablename__ = "bulk_upload_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Uploader information
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Batch information
    batch_name = Column(String(255), nullable=True)
    total_files = Column(Integer, nullable=False)
    processed_files = Column(Integer, default=0)
    successful_files = Column(Integer, default=0)
    failed_files = Column(Integer, default=0)
    
    # Status
    status = Column(SQLEnum(JobStatus), default=JobStatus.QUEUED, nullable=False, index=True)
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])


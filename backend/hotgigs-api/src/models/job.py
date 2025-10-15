from sqlalchemy import Column, String, Integer, Float, Text, Boolean, ForeignKey, DateTime, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from src.db.base import Base

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    posted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic Information
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    job_type = Column(String, nullable=False)  # full-time, part-time, contract, remote
    experience_level = Column(String, nullable=False)  # entry, mid, senior, lead, executive
    
    # Compensation
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="USD")
    
    # Requirements
    required_skills = Column(ARRAY(String), nullable=True)
    preferred_skills = Column(ARRAY(String), nullable=True)
    required_experience_years = Column(Integer, nullable=True)
    education_requirement = Column(String, nullable=True)
    
    # Job Details
    responsibilities = Column(ARRAY(String), nullable=True)
    benefits = Column(ARRAY(String), nullable=True)
    remote_policy = Column(String, nullable=True)  # remote, hybrid, onsite
    
    # Application Settings
    application_deadline = Column(DateTime, nullable=True)
    external_apply_url = Column(String, nullable=True)  # If applying through external site
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_urgent = Column(Boolean, default=False)
    
    # Metrics
    views_count = Column(Integer, default=0)
    applications_count = Column(Integer, default=0)
    
    # AI Enhancement
    ai_generated = Column(Boolean, default=False)
    ai_enhanced = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="jobs")
    poster = relationship("User", foreign_keys=[posted_by])
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic Information
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)  # 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
    founded_year = Column(Integer, nullable=True)
    
    # Contact Information
    website = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Location
    headquarters_location = Column(String, nullable=True)
    locations = Column(ARRAY(String), nullable=True)  # Multiple office locations
    
    # Social Media
    linkedin_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)
    
    # Branding
    logo_url = Column(String, nullable=True)
    cover_image_url = Column(String, nullable=True)
    
    # Status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    jobs = relationship("Job", back_populates="company", cascade="all, delete-orphan")
    team_members = relationship("CompanyTeamMember", back_populates="company", cascade="all, delete-orphan")


class CompanyTeamMember(Base):
    __tablename__ = "company_team_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    role = Column(String, nullable=False)  # admin, recruiter, hiring_manager
    permissions = Column(JSON, nullable=True)  # Detailed permissions
    
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="team_members")
    user = relationship("User")


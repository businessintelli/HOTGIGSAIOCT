from sqlalchemy import Column, String, Integer, Float, Text, Boolean, ForeignKey, DateTime, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from src.db.base import Base

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    # Basic Information
    title = Column(String, nullable=True)  # Professional title (e.g., "Senior Software Engineer")
    bio = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    
    # Professional Details
    years_of_experience = Column(Integer, default=0)
    current_company = Column(String, nullable=True)
    current_position = Column(String, nullable=True)
    
    # Job Preferences
    desired_job_titles = Column(ARRAY(String), nullable=True)
    desired_locations = Column(ARRAY(String), nullable=True)
    desired_salary_min = Column(Integer, nullable=True)
    desired_salary_max = Column(Integer, nullable=True)
    job_type_preferences = Column(ARRAY(String), nullable=True)  # full-time, part-time, contract, remote
    willing_to_relocate = Column(Boolean, default=False)
    
    # Resume
    resume_url = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    resume_parsed_data = Column(JSON, nullable=True)  # Parsed resume data
    
    # AI Scores
    profile_completeness = Column(Integer, default=0)  # 0-100
    ai_match_score = Column(Float, nullable=True)  # Overall AI score
    
    # Status
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=True)
    looking_for_job = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="candidate_profile")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    experiences = relationship("WorkExperience", back_populates="candidate", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="candidate", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"), nullable=False)
    
    skill_name = Column(String, nullable=False)
    skill_category = Column(String, nullable=True)  # Technical, Soft Skills, Languages, etc.
    proficiency_level = Column(String, nullable=True)  # Beginner, Intermediate, Advanced, Expert
    years_of_experience = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    candidate = relationship("CandidateProfile", back_populates="skills")


class WorkExperience(Base):
    __tablename__ = "work_experiences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"), nullable=False)
    
    company_name = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    location = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)  # Full-time, Part-time, Contract, Freelance
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # NULL if current job
    is_current = Column(Boolean, default=False)
    
    description = Column(Text, nullable=True)
    achievements = Column(ARRAY(String), nullable=True)
    technologies_used = Column(ARRAY(String), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("CandidateProfile", back_populates="experiences")


class Education(Base):
    __tablename__ = "educations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"), nullable=False)
    
    institution_name = Column(String, nullable=False)
    degree = Column(String, nullable=False)  # Bachelor's, Master's, PhD, etc.
    field_of_study = Column(String, nullable=False)
    location = Column(String, nullable=True)
    
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)  # NULL if currently studying
    is_current = Column(Boolean, default=False)
    
    grade = Column(String, nullable=True)  # GPA, percentage, etc.
    description = Column(Text, nullable=True)
    achievements = Column(ARRAY(String), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("CandidateProfile", back_populates="educations")


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"), nullable=False)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    
    # Application Details
    status = Column(String, default="submitted")  # submitted, reviewed, shortlisted, interview, offer, rejected, withdrawn
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)  # Specific resume for this application
    
    # AI Matching
    ai_match_score = Column(Float, nullable=True)  # 0-100
    ai_analysis = Column(JSON, nullable=True)  # Detailed AI analysis
    
    # Tracking
    viewed_by_employer = Column(Boolean, default=False)
    viewed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    candidate = relationship("CandidateProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")


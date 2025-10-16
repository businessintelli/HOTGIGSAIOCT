from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime, Float, JSON, ARRAY, Date, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from src.db.base import Base

class WorkAuthorizationType(str, enum.Enum):
    US_CITIZEN = "us_citizen"
    GREEN_CARD = "green_card"
    H1B = "h1b"
    L1 = "l1"
    OPT = "opt"
    CPT = "cpt"
    EAD = "ead"
    TN = "tn"
    OTHER = "other"
    NEED_SPONSORSHIP = "need_sponsorship"

class VisaStatus(str, enum.Enum):
    NOT_APPLICABLE = "not_applicable"
    VALID = "valid"
    EXPIRED = "expired"
    PENDING_RENEWAL = "pending_renewal"
    PENDING_TRANSFER = "pending_transfer"

class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    NON_BINARY = "non_binary"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class EducationLevel(str, enum.Enum):
    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    DOCTORATE = "doctorate"
    PROFESSIONAL = "professional"
    CERTIFICATE = "certificate"

class WorkModel(str, enum.Enum):
    ONSITE = "onsite"
    HYBRID = "hybrid"
    REMOTE = "remote"
    FLEXIBLE = "flexible"

class RateType(str, enum.Enum):
    HOURLY = "hourly"
    SALARY = "salary"

class EmploymentType(str, enum.Enum):
    W2 = "w2"
    C2C = "c2c"
    CONTRACTOR_1099 = "1099"

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
    
    # Job Preferences (Deprecated - moved to new fields below)
    desired_job_titles = Column(ARRAY(String), nullable=True)
    desired_locations = Column(ARRAY(String), nullable=True)
    desired_salary_min = Column(Integer, nullable=True)
    desired_salary_max = Column(Integer, nullable=True)
    job_type_preferences = Column(ARRAY(String), nullable=True)  # full-time, part-time, contract, remote
    
    # Resume
    resume_url = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    resume_parsed_data = Column(JSON, nullable=True)  # Parsed resume data
    
    # Extended Profile Information
    date_of_birth = Column(Date, nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    nationality = Column(String(100), nullable=True)
    current_zip_code = Column(String(20), nullable=True)
    
    # Work Authorization
    work_authorization = Column(SQLEnum(WorkAuthorizationType), nullable=True)
    work_authorization_end_date = Column(Date, nullable=True)
    visa_status = Column(SQLEnum(VisaStatus), nullable=True)
    w2_employer_name = Column(String(255), nullable=True)
    
    # Education Details
    highest_education = Column(SQLEnum(EducationLevel), nullable=True)
    education_specialization = Column(String(255), nullable=True)
    degree_start_date = Column(Date, nullable=True)
    degree_end_date = Column(Date, nullable=True)
    university_name = Column(String(255), nullable=True)
    
    # Identification (Secure)
    passport_number = Column(String(50), nullable=True)
    ssn_last_4 = Column(String(4), nullable=True)
    
    # Location & Work Preferences
    preferred_city = Column(String(100), nullable=True)
    preferred_state = Column(String(50), nullable=True)
    work_model_preference = Column(SQLEnum(WorkModel), nullable=True)
    willing_to_relocate = Column(Boolean, default=False)
    
    # Availability
    availability_date = Column(Date, nullable=True)
    notice_period_days = Column(Integer, nullable=True)  # Notice period in days
    
    # Compensation
    rate_type = Column(SQLEnum(RateType), nullable=True)
    expected_rate_min = Column(Integer, nullable=True)  # In dollars
    expected_rate_max = Column(Integer, nullable=True)  # In dollars
    employment_type = Column(SQLEnum(EmploymentType), nullable=True)
    rate_description = Column(String(100), nullable=True)  # e.g., "$XX/hr W2"
    
    # Professional Highlights
    professional_summary = Column(Text, nullable=True)
    key_strengths = Column(ARRAY(String), nullable=True)  # Array of impact points
    
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
    user = relationship("User")
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
    skill_assessments = relationship("CandidateSkillAssessment", back_populates="application", cascade="all, delete-orphan")
    screening_responses = relationship("ScreeningResponse", back_populates="application", cascade="all, delete-orphan")


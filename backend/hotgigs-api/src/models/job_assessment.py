"""
Job Assessment Models
Includes skill matrix, screening questions, and candidate responses
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from src.db.base import Base


class ProficiencyLevel(str, enum.Enum):
    """Proficiency levels for skills"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class QuestionType(str, enum.Enum):
    """Types of screening questions"""
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT = "text"
    YES_NO = "yes_no"
    RATING = "rating"
    FILE_UPLOAD = "file_upload"


class JobSkillRequirement(Base):
    """Skills required for a job with proficiency levels"""
    __tablename__ = "job_skill_requirements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    required_proficiency = Column(SQLEnum(ProficiencyLevel), nullable=False)
    min_years_experience = Column(Integer, default=0)
    is_mandatory = Column(Boolean, default=True)
    weight = Column(Float, default=1.0)  # For scoring importance
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="skill_requirements")
    candidate_assessments = relationship("CandidateSkillAssessment", back_populates="skill_requirement", cascade="all, delete-orphan")


class ScreeningQuestion(Base):
    """Custom screening questions for job applications"""
    __tablename__ = "screening_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    options = Column(JSON, nullable=True)  # For multiple choice questions
    is_required = Column(Boolean, default=True)
    order = Column(Integer, default=0)
    ai_generated = Column(Boolean, default=False)
    correct_answer = Column(Text, nullable=True)  # For validation if needed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    job = relationship("Job", back_populates="screening_questions")
    responses = relationship("ScreeningResponse", back_populates="question", cascade="all, delete-orphan")


class CandidateSkillAssessment(Base):
    """Candidate's self-assessment of skills for a job application"""
    __tablename__ = "candidate_skill_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    skill_requirement_id = Column(UUID(as_uuid=True), ForeignKey("job_skill_requirements.id", ondelete="CASCADE"), nullable=False)
    
    # Self-assessment data
    self_rating = Column(Integer, nullable=False)  # 1-10 scale
    proficiency_level = Column(SQLEnum(ProficiencyLevel), nullable=False)
    years_of_experience = Column(Float, nullable=False)
    last_used = Column(String(50), nullable=True)  # e.g., "Currently using", "6 months ago", "2023"
    description = Column(Text, nullable=True)  # Optional: How they used the skill
    
    # Calculated match score
    match_score = Column(Float, nullable=True)  # Auto-calculated based on requirements
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    application = relationship("Application", back_populates="skill_assessments")
    skill_requirement = relationship("JobSkillRequirement", back_populates="candidate_assessments")


class ScreeningResponse(Base):
    """Candidate's responses to screening questions"""
    __tablename__ = "screening_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("screening_questions.id", ondelete="CASCADE"), nullable=False)
    
    # Response data
    response_text = Column(Text, nullable=True)
    response_file_url = Column(String(500), nullable=True)  # For file uploads
    response_rating = Column(Integer, nullable=True)  # For rating questions
    
    # AI evaluation (optional)
    ai_score = Column(Float, nullable=True)
    ai_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    application = relationship("Application", back_populates="screening_responses")
    question = relationship("ScreeningQuestion", back_populates="responses")


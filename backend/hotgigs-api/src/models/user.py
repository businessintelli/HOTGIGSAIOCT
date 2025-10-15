from sqlalchemy import Column, String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from src.db.base import Base

class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    EMPLOYER = "employer"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.CANDIDATE)
    auth_provider = Column(String, nullable=True)  # google, linkedin, microsoft, email
    is_active = Column(String, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships - commented out to avoid circular import issues
    # candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False)
    # candidate_conversations = relationship("Conversation", foreign_keys="[Conversation.candidate_id]", back_populates="candidate")
    # recruiter_conversations = relationship("Conversation", foreign_keys="[Conversation.recruiter_id]", back_populates="recruiter")


from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from src.models.base import Base
import enum

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

class CandidateProfile(Base):
    """Extended candidate profile with detailed information"""
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), unique=True, nullable=False)
    
    # Personal Information
    date_of_birth = Column(Date, nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    nationality = Column(String(100), nullable=True)
    current_zip_code = Column(String(20), nullable=True)
    
    # Contact Information
    phone_number = Column(String(20), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    
    # Work Authorization
    work_authorization = Column(SQLEnum(WorkAuthorizationType), nullable=True)
    work_authorization_end_date = Column(Date, nullable=True)
    visa_status = Column(SQLEnum(VisaStatus), nullable=True)
    w2_employer_name = Column(String(255), nullable=True)
    
    # Education
    highest_education = Column(SQLEnum(EducationLevel), nullable=True)
    education_specialization = Column(String(255), nullable=True)
    degree_start_date = Column(Date, nullable=True)
    degree_end_date = Column(Date, nullable=True)
    university_name = Column(String(255), nullable=True)
    
    # Identification (Encrypted/Secure)
    passport_number = Column(String(50), nullable=True)  # Should be encrypted in production
    ssn_last_4 = Column(String(4), nullable=True)  # Only last 4 digits
    
    # Profile Completion
    profile_completed = Column(Boolean, default=False)
    profile_completion_percentage = Column(Integer, default=0)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="extended_profile")

    def calculate_completion_percentage(self):
        """Calculate profile completion percentage"""
        total_fields = 16
        completed_fields = 0
        
        fields_to_check = [
            self.date_of_birth,
            self.gender,
            self.nationality,
            self.current_zip_code,
            self.phone_number,
            self.linkedin_url,
            self.work_authorization,
            self.highest_education,
            self.education_specialization,
            self.degree_start_date,
            self.degree_end_date,
            self.university_name,
            self.ssn_last_4
        ]
        
        # Work authorization end date only required if not US citizen
        if self.work_authorization and self.work_authorization != WorkAuthorizationType.US_CITIZEN:
            fields_to_check.append(self.work_authorization_end_date)
            fields_to_check.append(self.visa_status)
        
        # W2 employer only for certain visa types
        if self.work_authorization in [WorkAuthorizationType.H1B, WorkAuthorizationType.L1]:
            fields_to_check.append(self.w2_employer_name)
        
        completed_fields = sum(1 for field in fields_to_check if field is not None)
        
        self.profile_completion_percentage = int((completed_fields / total_fields) * 100)
        self.profile_completed = self.profile_completion_percentage >= 80
        
        return self.profile_completion_percentage


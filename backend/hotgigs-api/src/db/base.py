from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# Import all models here to ensure they are registered with SQLAlchemy
from models.user import User, UserRole
from models.candidate import CandidateProfile, CandidateSkill, WorkExperience, Education, Application
from models.job import Job, Company, CompanyTeamMember


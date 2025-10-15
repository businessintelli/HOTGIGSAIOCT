from db.base import Base
from db.session import engine
from models.user import User, UserRole
from models.candidate import CandidateProfile, CandidateSkill, WorkExperience, Education, Application
from models.job import Job, Company, CompanyTeamMember

def init_db():
    """Initialize database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()


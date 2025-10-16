#!/usr/bin/env python3.11
"""
Master Database Initialization Script for HotGigs.ai
Creates all tables and initializes test data for new deployments
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from src.db.base import Base
from src.core.config import settings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password using passlib (same as backend)"""
    return pwd_context.hash(password)

# Import ALL models to ensure they're registered with SQLAlchemy
print("Importing models...")
from src.models.user import User, UserRole
from src.models.candidate import (
    CandidateProfile, 
    CandidateSkill, 
    WorkExperience, 
    Education, 
    Application
)
from src.models.job import Job, Company, CompanyTeamMember
from src.models.message import Conversation, Message
from src.models.notification import Notification
from src.models.saved_search import SavedSearch
from src.models.job_assessment import (
    JobSkillRequirement,
    ScreeningQuestion,
    CandidateSkillAssessment,
    ScreeningResponse
)
# Note: Skipping video_profile models due to type mismatches - will fix separately

print("✓ Models imported successfully")

def init_database():
    """Initialize database with all tables"""
    print("\n" + "="*60)
    print("HotGigs.ai Database Initialization")
    print("="*60)
    
    # Create engine
    print(f"\n1. Connecting to database...")
    print(f"   URL: {settings.DATABASE_URL.split('@')[1]}")  # Hide password
    engine = create_engine(settings.DATABASE_URL)
    print("   ✓ Connected successfully")
    
    # Drop all existing tables
    print("\n2. Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("   ✓ All tables dropped")
    
    # Create all tables
    print("\n3. Creating new tables...")
    Base.metadata.create_all(bind=engine)
    print("   ✓ All tables created")
    
    # Create test users
    print("\n4. Creating test users...")
    with Session(engine) as session:
        # Candidate user
        candidate = User(
            email="test@example.com",
            full_name="Test Candidate",
            role=UserRole.CANDIDATE,
            hashed_password=get_password_hash("password123"),
            auth_provider="email",
            is_active=True
        )
        session.add(candidate)
        print("   ✓ Created candidate: test@example.com")
        
        # Company/Recruiter user
        company_user = User(
            email="company@example.com",
            full_name="Company Recruiter",
            role=UserRole.EMPLOYER,
            hashed_password=get_password_hash("password123"),
            auth_provider="email",
            is_active=True
        )
        session.add(company_user)
        print("   ✓ Created recruiter: company@example.com")
        
        session.commit()
        
        # Get the created user IDs for creating related records
        candidate_id = candidate.id
        company_user_id = company_user.id
        
        # Create a company
        print("\n5. Creating test company...")
        company = Company(
            name="Business Intelli Solutions Inc",
            description="Leading technology consulting firm",
            industry="Technology",
            company_size="50-200",
            website="https://businessintelli.com",
            logo_url="https://via.placeholder.com/150"
        )
        session.add(company)
        session.commit()
        print(f"   ✓ Created company: {company.name}")
        
        # Create sample jobs
        print("\n6. Creating sample jobs...")
        job1 = Job(
            company_id=company.id,
            posted_by=company_user_id,
            title="Senior Full Stack Developer",
            description="We are looking for an experienced Full Stack Developer...",
            location="Dallas, TX",
            job_type="full-time",
            experience_level="senior",
            salary_min=120000,
            salary_max=160000,
            required_skills=["React", "Node.js", "PostgreSQL"],
            required_experience_years=5,
            remote_policy="hybrid",
            is_active=True
        )
        session.add(job1)
        
        job2 = Job(
            company_id=company.id,
            posted_by=company_user_id,
            title="DevOps Engineer",
            description="Join our DevOps team to build and maintain cloud infrastructure...",
            location="Remote",
            job_type="full-time",
            experience_level="mid",
            salary_min=100000,
            salary_max=140000,
            required_skills=["AWS", "Docker", "Kubernetes"],
            required_experience_years=3,
            remote_policy="remote",
            is_active=True
        )
        session.add(job2)
        
        session.commit()
        print(f"   ✓ Created 2 sample jobs")
    
    print("\n" + "="*60)
    print("✅ Database initialization completed successfully!")
    print("="*60)
    print("\nTest Credentials:")
    print("  Candidate Login:")
    print("    Email: test@example.com")
    print("    Password: password123")
    print("\n  Company/Recruiter Login:")
    print("    Email: company@example.com")
    print("    Password: password123")
    print("\n" + "="*60)

if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"\n❌ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


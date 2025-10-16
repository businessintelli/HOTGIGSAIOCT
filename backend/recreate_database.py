#!/usr/bin/env python3.11
"""
Recreate database with updated schema
"""
import sys
sys.path.insert(0, '/home/ubuntu/hotgigs/backend/hotgigs-api')

from sqlalchemy import create_engine, text
from src.db.base import Base
from src.core.config import settings
from src.core.security import get_password_hash

# Import all models to ensure they're registered
from src.models.user import User, UserRole
from src.models.candidate import CandidateProfile, Application
from src.models.job import Job
from src.models.job_assessment import JobSkillRequirement, ScreeningQuestion, CandidateSkillAssessment, ScreeningResponse
from src.models.video_profile import VideoProfile, VideoChapter, VideoHighlight, VideoAnalytics

print("Creating database engine...")
engine = create_engine(settings.DATABASE_URL)

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables with new schema...")
Base.metadata.create_all(bind=engine)

print("Creating test users...")
from sqlalchemy.orm import Session

with Session(engine) as session:
    # Create candidate user
    candidate = User(
        email="test@example.com",
        full_name="Test Candidate",
        role=UserRole.CANDIDATE,
        hashed_password=get_password_hash("password123"),
        auth_provider="email",
        is_active=True,
        is_verified=True
    )
    session.add(candidate)
    
    # Create company user
    company_user = User(
        email="company@example.com",
        full_name="Company Recruiter",
        role=UserRole.EMPLOYER,
        hashed_password=get_password_hash("password123"),
        auth_provider="email",
        is_active=True,
        is_verified=True
    )
    session.add(company_user)
    
    session.commit()
    print(f"✓ Created candidate user: {candidate.email}")
    print(f"✓ Created company user: {company_user.email}")

print("\n✅ Database recreated successfully!")
print("\nTest credentials:")
print("  Candidate: test@example.com / password123")
print("  Company: company@example.com / password123")


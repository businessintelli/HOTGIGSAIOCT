from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from src.db.session import get_db
from src.models.candidate import CandidateProfile, CandidateSkill, WorkExperience, Education
from src.models.user import User
import uuid

router = APIRouter()

# Pydantic models for request/response
class CandidateProfileCreate(BaseModel):
    title: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: int = 0
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    desired_job_titles: Optional[List[str]] = None
    desired_locations: Optional[List[str]] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    job_type_preferences: Optional[List[str]] = None
    willing_to_relocate: bool = False
    looking_for_job: bool = True

class CandidateProfileUpdate(BaseModel):
    title: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    years_of_experience: Optional[int] = None
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    desired_job_titles: Optional[List[str]] = None
    desired_locations: Optional[List[str]] = None
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    job_type_preferences: Optional[List[str]] = None
    willing_to_relocate: Optional[bool] = None
    looking_for_job: Optional[bool] = None

class SkillCreate(BaseModel):
    skill_name: str
    skill_category: Optional[str] = None
    proficiency_level: Optional[str] = None
    years_of_experience: Optional[int] = None

class WorkExperienceCreate(BaseModel):
    company_name: str
    job_title: str
    location: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None
    achievements: Optional[List[str]] = None
    technologies_used: Optional[List[str]] = None

class EducationCreate(BaseModel):
    institution_name: str
    degree: str
    field_of_study: str
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    grade: Optional[str] = None
    description: Optional[str] = None
    achievements: Optional[List[str]] = None

@router.get("/")
async def get_candidates(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all candidate profiles"""
    candidates = db.query(CandidateProfile).filter(
        CandidateProfile.is_public == True
    ).offset(skip).limit(limit).all()
    
    return {
        "candidates": candidates,
        "total": db.query(CandidateProfile).filter(CandidateProfile.is_public == True).count()
    }

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_candidate_profile(
    profile_data: CandidateProfileCreate,
    user_email: str,  # This would come from JWT token in production
    db: Session = Depends(get_db)
):
    """Create a candidate profile"""
    # Get user
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if profile already exists
    existing_profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user.id
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    # Create profile
    profile = CandidateProfile(
        user_id=user.id,
        **profile_data.dict()
    )
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/profile/{user_email}")
async def get_candidate_profile(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get candidate profile by user email"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile

@router.put("/profile/{user_email}")
async def update_candidate_profile(
    user_email: str,
    profile_data: CandidateProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update candidate profile"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update profile
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    
    return profile

@router.post("/profile/{user_email}/skills", status_code=status.HTTP_201_CREATED)
async def add_skill(
    user_email: str,
    skill_data: SkillCreate,
    db: Session = Depends(get_db)
):
    """Add a skill to candidate profile"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    skill = CandidateSkill(
        candidate_id=profile.id,
        **skill_data.dict()
    )
    
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

@router.get("/profile/{user_email}/skills")
async def get_skills(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get all skills for a candidate"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    skills = db.query(CandidateSkill).filter(CandidateSkill.candidate_id == profile.id).all()
    return skills

@router.post("/profile/{user_email}/experience", status_code=status.HTTP_201_CREATED)
async def add_work_experience(
    user_email: str,
    experience_data: WorkExperienceCreate,
    db: Session = Depends(get_db)
):
    """Add work experience to candidate profile"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    experience = WorkExperience(
        candidate_id=profile.id,
        **experience_data.dict()
    )
    
    db.add(experience)
    db.commit()
    db.refresh(experience)
    
    return experience

@router.get("/profile/{user_email}/experience")
async def get_work_experience(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get all work experience for a candidate"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    experiences = db.query(WorkExperience).filter(
        WorkExperience.candidate_id == profile.id
    ).order_by(WorkExperience.start_date.desc()).all()
    
    return experiences

@router.post("/profile/{user_email}/education", status_code=status.HTTP_201_CREATED)
async def add_education(
    user_email: str,
    education_data: EducationCreate,
    db: Session = Depends(get_db)
):
    """Add education to candidate profile"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    education = Education(
        candidate_id=profile.id,
        **education_data.dict()
    )
    
    db.add(education)
    db.commit()
    db.refresh(education)
    
    return education

@router.get("/profile/{user_email}/education")
async def get_education(
    user_email: str,
    db: Session = Depends(get_db)
):
    """Get all education for a candidate"""
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    educations = db.query(Education).filter(
        Education.candidate_id == profile.id
    ).order_by(Education.start_date.desc()).all()
    
    return educations

@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Get a specific candidate by ID"""
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.id == uuid.UUID(candidate_id)
    ).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    
    return candidate


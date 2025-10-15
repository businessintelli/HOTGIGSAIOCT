from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
import uuid

from db.session import get_db
from models.job import Job, Company, CompanyTeamMember
from models.candidate import Application
from models.user import User
from core.security import get_current_user

router = APIRouter()

# Pydantic models
class JobCreate(BaseModel):
    title: str
    company_id: str
    description: str
    requirements: List[str]
    responsibilities: List[str]
    location: str
    work_model: str  # remote, hybrid, on-site
    employment_type: str  # full-time, part-time, contract
    experience_level: str  # entry, mid, senior
    salary_min: int | None = None
    salary_max: int | None = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    benefits: List[str] = []

class JobUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    requirements: List[str] | None = None
    responsibilities: List[str] | None = None
    location: str | None = None
    work_model: str | None = None
    employment_type: str | None = None
    experience_level: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    required_skills: List[str] | None = None
    preferred_skills: List[str] | None = None
    benefits: List[str] | None = None
    status: str | None = None

class JobResponse(BaseModel):
    id: str
    company_id: str
    title: str
    description: str
    requirements: List[str]
    responsibilities: List[str]
    location: str
    work_model: str
    employment_type: str
    experience_level: str
    salary_min: int | None
    salary_max: int | None
    required_skills: List[str]
    preferred_skills: List[str]
    benefits: List[str]
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: str  # submitted, reviewed, shortlisted, interview, offer, rejected, withdrawn

@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job posting"""
    # Check if user is employer
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can create jobs")
    
    # Verify company exists and user is authorized
    company = db.query(Company).filter(Company.id == uuid.UUID(job_data.company_id)).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user is part of this company
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=403, detail="You are not authorized to post jobs for this company")
    
    # Create job
    job = Job(
        id=uuid.uuid4(),
        company_id=company.id,
        posted_by=current_user.id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        responsibilities=job_data.responsibilities,
        location=job_data.location,
        work_model=job_data.work_model,
        employment_type=job_data.employment_type,
        experience_level=job_data.experience_level,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        required_skills=job_data.required_skills,
        preferred_skills=job_data.preferred_skills,
        benefits=job_data.benefits,
        status="active"
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return job

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    location: str | None = None,
    work_model: str | None = None,
    employment_type: str | None = None,
    experience_level: str | None = None,
    status: str | None = "active",
    db: Session = Depends(get_db)
):
    """Get all jobs with optional filtering"""
    query = db.query(Job)
    
    if status:
        query = query.filter(Job.status == status)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if work_model:
        query = query.filter(Job.work_model == work_model)
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    
    jobs = query.offset(skip).limit(limit).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific job by ID"""
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job posting"""
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user is authorized to update this job
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == job.company_id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member and job.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update this job")
    
    # Update fields
    update_data = job_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    job.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(job)
    
    return job

@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job posting"""
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user is authorized to delete this job
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == job.company_id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member and job.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to delete this job")
    
    db.delete(job)
    db.commit()
    
    return None

# Application Management for Jobs

@router.get("/{job_id}/applications")
async def get_job_applications(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for a specific job"""
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user is authorized to view applications
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == job.company_id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member and job.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to view applications for this job")
    
    applications = db.query(Application).filter(Application.job_id == job.id).all()
    
    return applications

@router.patch("/{job_id}/applications/{application_id}/status")
async def update_application_status(
    job_id: str,
    application_id: str,
    status_data: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the status of an application"""
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if user is authorized
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == job.company_id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member and job.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="You are not authorized to update applications for this job")
    
    application = db.query(Application).filter(
        Application.id == uuid.UUID(application_id),
        Application.job_id == job.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = status_data.status
    application.updated_at = datetime.utcnow()
    
    if status_data.status == "reviewed":
        application.viewed_by_employer = True
        application.viewed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    
    return application

@router.get("/company/{company_id}")
async def get_company_jobs(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all jobs for a specific company"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user is part of this company
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=403, detail="You are not authorized to view jobs for this company")
    
    jobs = db.query(Job).filter(Job.company_id == company.id).all()
    
    return jobs


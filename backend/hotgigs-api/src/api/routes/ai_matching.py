from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import uuid

from db.session import get_db
from models.candidate import CandidateProfile, CandidateSkill
from models.job import Job
from models.user import User
from core.security import get_current_user
from services.ai_matching import AIMatchingService

router = APIRouter()
matching_service = AIMatchingService()

class MatchScoreResponse(BaseModel):
    match_score: float
    breakdown: dict
    recommendations: List[str]
    match_quality: str

@router.get("/candidate/{candidate_id}/jobs", response_model=List[dict])
async def get_matched_jobs_for_candidate(
    candidate_id: str,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-matched jobs for a candidate"""
    
    # Get candidate profile
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.id == uuid.UUID(candidate_id)
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get candidate skills
    skills = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == candidate.id
    ).all()
    
    # Build candidate profile dict
    candidate_dict = {
        'id': str(candidate.id),
        'skills': [{'name': skill.skill_name, 'proficiency': skill.proficiency_level} for skill in skills],
        'years_of_experience': candidate.years_of_experience or 0,
        'experience_level': candidate.experience_level or 'entry',
        'location': candidate.location or '',
        'remote_preference': True,  # TODO: Add to model
        'education': []  # TODO: Fetch from education table
    }
    
    # Get active jobs
    jobs = db.query(Job).filter(Job.status == 'active').limit(100).all()
    
    # Convert jobs to dicts
    jobs_dict = [
        {
            'id': str(job.id),
            'title': job.title,
            'company_id': str(job.company_id),
            'description': job.description,
            'required_skills': job.required_skills or [],
            'preferred_skills': job.preferred_skills or [],
            'experience_level': job.experience_level,
            'location': job.location,
            'work_model': job.work_model,
            'requirements': job.requirements or [],
            'salary_min': job.salary_min,
            'salary_max': job.salary_max
        }
        for job in jobs
    ]
    
    # Rank jobs using AI matching
    ranked_jobs = matching_service.rank_jobs_for_candidate(candidate_dict, jobs_dict)
    
    return ranked_jobs[:limit]

@router.get("/job/{job_id}/candidates", response_model=List[dict])
async def get_matched_candidates_for_job(
    job_id: str,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-matched candidates for a job"""
    
    # Check if user is employer
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can access this endpoint")
    
    # Get job
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Build job dict
    job_dict = {
        'id': str(job.id),
        'title': job.title,
        'company_id': str(job.company_id),
        'description': job.description,
        'required_skills': job.required_skills or [],
        'preferred_skills': job.preferred_skills or [],
        'experience_level': job.experience_level,
        'location': job.location,
        'work_model': job.work_model,
        'requirements': job.requirements or [],
        'salary_min': job.salary_min,
        'salary_max': job.salary_max
    }
    
    # Get all candidates
    candidates = db.query(CandidateProfile).limit(100).all()
    
    # Build candidates list with skills
    candidates_dict = []
    for candidate in candidates:
        skills = db.query(CandidateSkill).filter(
            CandidateSkill.candidate_id == candidate.id
        ).all()
        
        candidates_dict.append({
            'id': str(candidate.id),
            'user_id': str(candidate.user_id),
            'full_name': candidate.full_name,
            'headline': candidate.headline,
            'skills': [{'name': skill.skill_name, 'proficiency': skill.proficiency_level} for skill in skills],
            'years_of_experience': candidate.years_of_experience or 0,
            'experience_level': candidate.experience_level or 'entry',
            'location': candidate.location or '',
            'remote_preference': True,
            'education': []
        })
    
    # Rank candidates using AI matching
    ranked_candidates = matching_service.rank_candidates_for_job(candidates_dict, job_dict)
    
    return ranked_candidates[:limit]

@router.post("/calculate-match", response_model=MatchScoreResponse)
async def calculate_match_score(
    candidate_id: str,
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate match score between a specific candidate and job"""
    
    # Get candidate
    candidate = db.query(CandidateProfile).filter(
        CandidateProfile.id == uuid.UUID(candidate_id)
    ).first()
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get job
    job = db.query(Job).filter(Job.id == uuid.UUID(job_id)).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get candidate skills
    skills = db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id == candidate.id
    ).all()
    
    # Build candidate profile dict
    candidate_dict = {
        'id': str(candidate.id),
        'skills': [{'name': skill.skill_name, 'proficiency': skill.proficiency_level} for skill in skills],
        'years_of_experience': candidate.years_of_experience or 0,
        'experience_level': candidate.experience_level or 'entry',
        'location': candidate.location or '',
        'remote_preference': True,
        'education': []
    }
    
    # Build job dict
    job_dict = {
        'id': str(job.id),
        'title': job.title,
        'required_skills': job.required_skills or [],
        'preferred_skills': job.preferred_skills or [],
        'experience_level': job.experience_level,
        'location': job.location,
        'work_model': job.work_model,
        'requirements': job.requirements or []
    }
    
    # Calculate match score
    match_result = matching_service.calculate_match_score(candidate_dict, job_dict)
    
    return match_result


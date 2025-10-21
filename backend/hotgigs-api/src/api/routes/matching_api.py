"""
Candidate-Job Matching API Endpoints

This module provides API endpoints for AI-powered candidate-job matching,
including match retrieval, scoring, and re-matching triggers.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid

from src.db.session import get_db
from src.models.user import User, UserRole
from src.models.candidate import CandidateProfile
from src.models.job import Job
from src.models.resume import CandidateMatch, Resume, ResumeData
from src.models.candidate_database import RecruiterCandidate
from src.core.security import get_current_user
# Optional matching tasks
try:
    from src.tasks.matching_tasks import match_candidate_to_jobs, match_job_to_candidates
    MATCHING_AVAILABLE = True
except ImportError:
    MATCHING_AVAILABLE = False
    def match_candidate_to_jobs(*args, **kwargs):
        pass
    def match_job_to_candidates(*args, **kwargs):
        pass

router = APIRouter(prefix="/api/matching", tags=["Matching"])


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class MatchResponse(BaseModel):
    """Response for a single match"""
    match_id: str
    candidate_id: str
    candidate_name: str
    candidate_title: Optional[str] = None
    candidate_location: Optional[str] = None
    job_id: str
    job_title: str
    company_name: str
    match_score: float
    skill_match_score: Optional[float] = None
    experience_match_score: Optional[float] = None
    education_match_score: Optional[float] = None
    location_match_score: Optional[float] = None
    match_explanation: Optional[str] = None
    matching_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    viewed_by_recruiter: bool
    created_at: datetime


class CandidateMatchListResponse(BaseModel):
    """Response for candidate match list"""
    candidate_id: str
    candidate_name: str
    total_matches: int
    top_match_score: Optional[float] = None
    matches: List[MatchResponse]


class JobMatchListResponse(BaseModel):
    """Response for job match list"""
    job_id: str
    job_title: str
    total_matches: int
    top_match_score: Optional[float] = None
    matches: List[MatchResponse]


class RematchRequest(BaseModel):
    """Request to trigger re-matching"""
    force: bool = False  # Force re-match even if recent matches exist


class RematchResponse(BaseModel):
    """Response for re-match trigger"""
    message: str
    task_id: str
    estimated_matches: int


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def check_recruiter_access(db: Session, recruiter_id: str, candidate_id: str) -> bool:
    """Check if recruiter has access to candidate"""
    mapping = db.query(RecruiterCandidate).filter(
        and_(
            RecruiterCandidate.recruiter_id == recruiter_id,
            RecruiterCandidate.candidate_id == candidate_id,
            RecruiterCandidate.is_visible == True
        )
    ).first()
    return mapping is not None


# ============================================================================
# CANDIDATE MATCHING ENDPOINTS
# ============================================================================

@router.get("/candidates/{candidate_id}/matches", response_model=CandidateMatchListResponse)
async def get_candidate_matches(
    candidate_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    min_score: float = Query(0, ge=0, le=100, description="Minimum match score"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get job matches for a candidate.
    
    Returns jobs that match the candidate's profile, sorted by match score.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can access candidate matches"
        )
    
    # Check access
    if current_user.role != UserRole.ADMIN:
        if not check_recruiter_access(db, str(current_user.id), candidate_id):
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get candidate
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get user
    user = db.query(User).filter(User.id == candidate.user_id).first()
    
    # Get matches
    matches_query = db.query(CandidateMatch, Job).join(
        Job,
        Job.id == CandidateMatch.job_id
    ).filter(
        and_(
            CandidateMatch.candidate_id == user.id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= min_score
        )
    ).order_by(desc(CandidateMatch.match_score))
    
    total_matches = matches_query.count()
    matches = matches_query.offset(skip).limit(limit).all()
    
    # Format response
    match_list = []
    for match, job in matches:
        match_list.append(MatchResponse(
            match_id=str(match.id),
            candidate_id=str(candidate.id),
            candidate_name=user.full_name,
            candidate_title=candidate.title,
            candidate_location=candidate.location,
            job_id=str(job.id),
            job_title=job.title,
            company_name=job.company_name or "Unknown",
            match_score=match.match_score,
            skill_match_score=match.skill_match_score,
            experience_match_score=match.experience_match_score,
            education_match_score=match.education_match_score,
            location_match_score=match.location_match_score,
            match_explanation=match.match_explanation,
            matching_skills=match.matching_skills,
            missing_skills=match.missing_skills,
            viewed_by_recruiter=match.viewed_by_recruiter,
            created_at=match.created_at
        ))
    
    return CandidateMatchListResponse(
        candidate_id=str(candidate.id),
        candidate_name=user.full_name,
        total_matches=total_matches,
        top_match_score=matches[0][0].match_score if matches else None,
        matches=match_list
    )


@router.post("/candidates/{candidate_id}/rematch", response_model=RematchResponse)
async def rematch_candidate(
    candidate_id: str,
    rematch_data: RematchRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger re-matching for a candidate.
    
    This will re-calculate matches between the candidate and all active jobs.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can trigger re-matching"
        )
    
    # Check access
    if current_user.role != UserRole.ADMIN:
        if not check_recruiter_access(db, str(current_user.id), candidate_id):
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get candidate
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Check if recent matches exist
    if not rematch_data.force:
        recent_match = db.query(CandidateMatch).filter(
            and_(
                CandidateMatch.candidate_id == candidate.user_id,
                CandidateMatch.created_at > datetime.utcnow() - timedelta(hours=24)
            )
        ).first()
        
        if recent_match:
            raise HTTPException(
                status_code=400,
                detail="Recent matches exist. Use force=true to re-match anyway."
            )
    
    # Count active jobs
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    
    # Trigger matching task
    task = match_candidate_to_jobs.delay(str(candidate.user_id))
    
    return RematchResponse(
        message="Re-matching triggered successfully",
        task_id=task.id,
        estimated_matches=active_jobs
    )


# ============================================================================
# JOB MATCHING ENDPOINTS
# ============================================================================

@router.get("/jobs/{job_id}/matches", response_model=JobMatchListResponse)
async def get_job_matches(
    job_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    min_score: float = Query(0, ge=0, le=100, description="Minimum match score"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate matches for a job.
    
    Returns candidates that match the job requirements, sorted by match score.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN, UserRole.EMPLOYER]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters, employers, and admins can access job matches"
        )
    
    # Get job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check access (only job owner or admin)
    if current_user.role != UserRole.ADMIN and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get matches
    matches_query = db.query(CandidateMatch, CandidateProfile, User).join(
        User,
        User.id == CandidateMatch.candidate_id
    ).join(
        CandidateProfile,
        CandidateProfile.user_id == User.id
    ).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= min_score
        )
    )
    
    # Filter by recruiter access if not admin
    if current_user.role == UserRole.RECRUITER:
        matches_query = matches_query.join(
            RecruiterCandidate,
            and_(
                RecruiterCandidate.candidate_id == CandidateProfile.id,
                RecruiterCandidate.recruiter_id == current_user.id,
                RecruiterCandidate.is_visible == True
            )
        )
    
    matches_query = matches_query.order_by(desc(CandidateMatch.match_score))
    
    total_matches = matches_query.count()
    matches = matches_query.offset(skip).limit(limit).all()
    
    # Format response
    match_list = []
    for match, candidate, user in matches:
        match_list.append(MatchResponse(
            match_id=str(match.id),
            candidate_id=str(candidate.id),
            candidate_name=user.full_name,
            candidate_title=candidate.title,
            candidate_location=candidate.location,
            job_id=str(job.id),
            job_title=job.title,
            company_name=job.company_name or "Unknown",
            match_score=match.match_score,
            skill_match_score=match.skill_match_score,
            experience_match_score=match.experience_match_score,
            education_match_score=match.education_match_score,
            location_match_score=match.location_match_score,
            match_explanation=match.match_explanation,
            matching_skills=match.matching_skills,
            missing_skills=match.missing_skills,
            viewed_by_recruiter=match.viewed_by_recruiter,
            created_at=match.created_at
        ))
    
    return JobMatchListResponse(
        job_id=str(job.id),
        job_title=job.title,
        total_matches=total_matches,
        top_match_score=matches[0][0].match_score if matches else None,
        matches=match_list
    )


@router.post("/jobs/{job_id}/rematch", response_model=RematchResponse)
async def rematch_job(
    job_id: str,
    rematch_data: RematchRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Trigger re-matching for a job.
    
    This will re-calculate matches between the job and all candidates.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN, UserRole.EMPLOYER]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters, employers, and admins can trigger re-matching"
        )
    
    # Get job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if recent matches exist
    if not rematch_data.force:
        recent_match = db.query(CandidateMatch).filter(
            and_(
                CandidateMatch.job_id == job_id,
                CandidateMatch.created_at > datetime.utcnow() - timedelta(hours=24)
            )
        ).first()
        
        if recent_match:
            raise HTTPException(
                status_code=400,
                detail="Recent matches exist. Use force=true to re-match anyway."
            )
    
    # Count candidates
    if current_user.role == UserRole.ADMIN:
        total_candidates = db.query(CandidateProfile).filter(
            CandidateProfile.is_active == True
        ).count()
    else:
        total_candidates = db.query(RecruiterCandidate).filter(
            and_(
                RecruiterCandidate.recruiter_id == current_user.id,
                RecruiterCandidate.is_visible == True
            )
        ).count()
    
    # Trigger matching task
    task = match_job_to_candidates.delay(str(job.id))
    
    return RematchResponse(
        message="Re-matching triggered successfully",
        task_id=task.id,
        estimated_matches=total_candidates
    )


# ============================================================================
# MATCH MANAGEMENT ENDPOINTS
# ============================================================================

@router.put("/matches/{match_id}/viewed")
async def mark_match_viewed(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a match as viewed by recruiter"""
    # Get match
    match = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Update viewed status
    match.viewed_by_recruiter = True
    match.viewed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Match marked as viewed"}


@router.delete("/matches/{match_id}")
async def delete_match(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a match (soft delete by setting is_active to False).
    
    Only available to admins.
    """
    # Check permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Get match
    match = db.query(CandidateMatch).filter(CandidateMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Soft delete
    match.is_active = False
    db.commit()
    
    return {"message": "Match deleted successfully"}


# ============================================================================
# STATISTICS ENDPOINTS
# ============================================================================

@router.get("/stats/candidate/{candidate_id}")
async def get_candidate_match_stats(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get match statistics for a candidate"""
    # Check access
    if current_user.role != UserRole.ADMIN:
        if not check_recruiter_access(db, str(current_user.id), candidate_id):
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get candidate
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get statistics
    total_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.candidate_id == candidate.user_id,
            CandidateMatch.is_active == True
        )
    ).count()
    
    high_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.candidate_id == candidate.user_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= 80
        )
    ).count()
    
    medium_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.candidate_id == candidate.user_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= 60,
            CandidateMatch.match_score < 80
        )
    ).count()
    
    low_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.candidate_id == candidate.user_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score < 60
        )
    ).count()
    
    return {
        "candidate_id": str(candidate.id),
        "total_matches": total_matches,
        "high_matches": high_matches,  # >= 80
        "medium_matches": medium_matches,  # 60-79
        "low_matches": low_matches,  # < 60
        "match_rate": (high_matches / total_matches * 100) if total_matches > 0 else 0
    }


@router.get("/stats/job/{job_id}")
async def get_job_match_stats(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get match statistics for a job"""
    # Get job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and job.posted_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get statistics
    total_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True
        )
    ).count()
    
    high_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= 80
        )
    ).count()
    
    medium_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score >= 60,
            CandidateMatch.match_score < 80
        )
    ).count()
    
    low_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True,
            CandidateMatch.match_score < 60
        )
    ).count()
    
    viewed_matches = db.query(CandidateMatch).filter(
        and_(
            CandidateMatch.job_id == job_id,
            CandidateMatch.is_active == True,
            CandidateMatch.viewed_by_recruiter == True
        )
    ).count()
    
    return {
        "job_id": str(job.id),
        "total_matches": total_matches,
        "high_matches": high_matches,  # >= 80
        "medium_matches": medium_matches,  # 60-79
        "low_matches": low_matches,  # < 60
        "viewed_matches": viewed_matches,
        "view_rate": (viewed_matches / total_matches * 100) if total_matches > 0 else 0
    }


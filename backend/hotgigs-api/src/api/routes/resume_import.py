"""
Resume Import API Endpoints

This module provides API endpoints for resume upload, processing, and management
with multi-level candidate database support and privacy controls.
"""

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, BackgroundTasks, Query, Body
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import os
import shutil

from src.db.session import get_db
from src.models.user import User, UserRole
from src.models.candidate import CandidateProfile
from src.models.resume import Resume, ResumeData, ResumeStatus, ImportSource, ProcessingJob, BulkUploadBatch
from src.models.candidate_database import (
    RecruiterCandidate, CandidateShare, CandidateActivity, 
    CandidateSource, ActivityType, CandidateNote, CandidateTag
)
from src.core.security import get_current_user
# Optional Celery tasks - will use synchronous processing if not available
try:
    from src.tasks.resume_tasks import process_resume, process_bulk_upload
    from src.tasks.matching_tasks import match_candidate_to_jobs
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    # Stub functions for when Celery is not available
    def process_resume(*args, **kwargs):
        pass
    def process_bulk_upload(*args, **kwargs):
        pass
    def match_candidate_to_jobs(*args, **kwargs):
        pass

router = APIRouter(prefix="/api/resumes", tags=["Resume Import"])


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

from pydantic import BaseModel, EmailStr, Field


class ResumeUploadResponse(BaseModel):
    """Response for resume upload"""
    resume_id: str
    filename: str
    status: str
    message: str
    processing_job_id: Optional[str] = None


class BulkUploadResponse(BaseModel):
    """Response for bulk upload"""
    batch_id: str
    total_files: int
    status: str
    message: str


class ResumeStatusResponse(BaseModel):
    """Response for resume status"""
    resume_id: str
    status: str
    progress_percentage: int
    current_step: Optional[str] = None
    error_message: Optional[str] = None
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None


class ResumeDataResponse(BaseModel):
    """Response for parsed resume data"""
    resume_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[list] = None
    education: Optional[list] = None
    skills: Optional[list] = None
    top_skills: Optional[list] = None
    certifications: Optional[list] = None
    total_experience_years: Optional[float] = None
    ai_summary: Optional[str] = None


class CandidateListResponse(BaseModel):
    """Response for candidate list"""
    candidate_id: str
    user_id: str
    full_name: str
    email: str
    title: Optional[str] = None
    location: Optional[str] = None
    years_of_experience: int
    top_skills: Optional[list] = None
    added_at: datetime
    last_viewed_at: Optional[datetime] = None
    source: str
    tags: List[str] = []


class CandidateDetailResponse(BaseModel):
    """Response for candidate details"""
    candidate_id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    title: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: int
    current_company: Optional[str] = None
    current_position: Optional[str] = None
    professional_summary: Optional[str] = None
    skills: List[dict] = []
    experience: List[dict] = []
    education: List[dict] = []
    resume_url: Optional[str] = None
    added_at: datetime
    source: str
    tags: List[str] = []
    notes: List[dict] = []


class AddNoteRequest(BaseModel):
    """Request to add note to candidate"""
    title: Optional[str] = None
    content: str
    is_private: bool = False
    is_important: bool = False


class AddTagsRequest(BaseModel):
    """Request to add tags to candidate"""
    tags: List[str]


class ShareCandidateRequest(BaseModel):
    """Request to share candidate(s) with recruiter(s)"""
    candidate_ids: List[str]
    recruiter_ids: List[str]
    share_reason: Optional[str] = None
    share_notes: Optional[str] = None
    can_view_contact_info: bool = True
    can_download_resume: bool = True
    can_submit_to_jobs: bool = True


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def save_uploaded_file(file: UploadFile, user_id: str) -> tuple:
    """Save uploaded file and return file path and metadata"""
    # Create upload directory
    upload_dir = f"/tmp/resumes/{user_id}"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    return file_path, unique_filename, file_size


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


def log_activity(
    db: Session,
    candidate_id: str,
    user_id: str,
    activity_type: ActivityType,
    description: str = None,
    reference_type: str = None,
    reference_id: str = None,
    metadata: dict = None
):
    """Log candidate activity"""
    activity = CandidateActivity(
        candidate_id=candidate_id,
        user_id=user_id,
        activity_type=activity_type,
        activity_description=description,
        reference_type=reference_type,
        reference_id=reference_id,
        metadata=metadata or {}
    )
    db.add(activity)
    db.commit()


# ============================================================================
# RESUME UPLOAD ENDPOINTS
# ============================================================================

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    source: str = Query("candidate_upload", description="Import source"),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a single resume for processing.
    
    - **file**: Resume file (PDF, DOCX, DOC)
    - **source**: Import source (candidate_upload, recruiter_upload, etc.)
    """
    # Validate file type
    allowed_extensions = [".pdf", ".docx", ".doc"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Save file
    try:
        file_path, unique_filename, file_size = save_uploaded_file(file, str(current_user.id))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create resume record
    resume = Resume(
        candidate_id=current_user.id if current_user.role == UserRole.CANDIDATE else None,
        uploaded_by_id=current_user.id,
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file_ext.lstrip('.'),
        status=ResumeStatus.UPLOADED,
        import_source=ImportSource(source)
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    
    # Queue processing task
    task = process_resume.delay(str(resume.id))
    
    # Create processing job record
    job = ProcessingJob(
        resume_id=resume.id,
        celery_task_id=task.id,
        status="queued"
    )
    db.add(job)
    db.commit()
    
    return ResumeUploadResponse(
        resume_id=str(resume.id),
        filename=file.filename,
        status="uploaded",
        message="Resume uploaded successfully and queued for processing",
        processing_job_id=task.id
    )


@router.post("/bulk-upload", response_model=BulkUploadResponse)
async def bulk_upload_resumes(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload multiple resumes for bulk processing.
    
    Only available to recruiters and admins.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can perform bulk uploads"
        )
    
    # Validate files
    allowed_extensions = [".pdf", ".docx", ".doc"]
    resume_ids = []
    
    for file in files:
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            continue  # Skip invalid files
        
        # Save file
        try:
            file_path, unique_filename, file_size = save_uploaded_file(file, str(current_user.id))
        except Exception:
            continue  # Skip files that fail to save
        
        # Create resume record
        resume = Resume(
            uploaded_by_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            file_type=file_ext.lstrip('.'),
            status=ResumeStatus.UPLOADED,
            import_source=ImportSource.BULK_UPLOAD
        )
        db.add(resume)
        db.flush()
        resume_ids.append(str(resume.id))
    
    db.commit()
    
    # Create bulk upload batch
    batch = BulkUploadBatch(
        uploaded_by_id=current_user.id,
        batch_name=f"Bulk Upload {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        total_files=len(resume_ids),
        status="queued"
    )
    db.add(batch)
    db.commit()
    db.refresh(batch)
    
    # Queue bulk processing task
    task = process_bulk_upload.delay(resume_ids, str(batch.id))
    
    return BulkUploadResponse(
        batch_id=str(batch.id),
        total_files=len(resume_ids),
        status="queued",
        message=f"Bulk upload queued: {len(resume_ids)} resumes"
    )


@router.get("/{resume_id}/status", response_model=ResumeStatusResponse)
async def get_resume_status(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get processing status of a resume"""
    # Get resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check access
    if current_user.role not in [UserRole.ADMIN]:
        if resume.uploaded_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get processing job
    job = db.query(ProcessingJob).filter(ProcessingJob.resume_id == resume_id).first()
    
    return ResumeStatusResponse(
        resume_id=str(resume.id),
        status=resume.status.value,
        progress_percentage=job.progress_percentage if job else 0,
        current_step=job.current_step if job else None,
        error_message=resume.processing_error,
        processing_started_at=resume.processing_started_at,
        processing_completed_at=resume.processing_completed_at
    )


@router.get("/{resume_id}/data", response_model=ResumeDataResponse)
async def get_resume_data(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get parsed data from a resume"""
    # Get resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check access
    if current_user.role not in [UserRole.ADMIN]:
        if resume.uploaded_by_id != current_user.id:
            # Check if recruiter has access to candidate
            if resume.candidate_id:
                candidate_profile = db.query(CandidateProfile).filter(
                    CandidateProfile.user_id == resume.candidate_id
                ).first()
                if candidate_profile and not check_recruiter_access(db, str(current_user.id), str(candidate_profile.id)):
                    raise HTTPException(status_code=403, detail="Access denied")
            else:
                raise HTTPException(status_code=403, detail="Access denied")
    
    # Get resume data
    data = db.query(ResumeData).filter(ResumeData.resume_id == resume_id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Resume data not found or still processing")
    
    return ResumeDataResponse(
        resume_id=str(resume.id),
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        location=data.location,
        summary=data.summary,
        experience=data.experience,
        education=data.education,
        skills=data.skills,
        top_skills=data.top_skills,
        certifications=data.certifications,
        total_experience_years=data.total_experience_years,
        ai_summary=data.ai_summary
    )


@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download original resume file"""
    # Get resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Check access
    if current_user.role not in [UserRole.ADMIN]:
        if resume.uploaded_by_id != current_user.id:
            # Check if recruiter has access and download permission
            if resume.candidate_id:
                candidate_profile = db.query(CandidateProfile).filter(
                    CandidateProfile.user_id == resume.candidate_id
                ).first()
                if candidate_profile:
                    # Check if shared with download permission
                    share = db.query(CandidateShare).filter(
                        and_(
                            CandidateShare.candidate_id == candidate_profile.id,
                            CandidateShare.to_recruiter_id == current_user.id,
                            CandidateShare.is_active == True,
                            CandidateShare.can_download_resume == True
                        )
                    ).first()
                    if not share and not check_recruiter_access(db, str(current_user.id), str(candidate_profile.id)):
                        raise HTTPException(status_code=403, detail="Access denied")
                else:
                    raise HTTPException(status_code=403, detail="Access denied")
            else:
                raise HTTPException(status_code=403, detail="Access denied")
    
    # Check file exists
    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    # Log activity
    if resume.candidate_id:
        candidate_profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == resume.candidate_id
        ).first()
        if candidate_profile:
            log_activity(
                db=db,
                candidate_id=str(candidate_profile.id),
                user_id=str(current_user.id),
                activity_type=ActivityType.RESUME_DOWNLOADED,
                description=f"Resume downloaded by {current_user.full_name}",
                reference_type="resume",
                reference_id=str(resume.id)
            )
    
    return FileResponse(
        path=resume.file_path,
        filename=resume.original_filename,
        media_type="application/octet-stream"
    )


# ============================================================================
# CANDIDATE MANAGEMENT ENDPOINTS (RECRUITER)
# ============================================================================

@router.get("/candidates", response_model=List[CandidateListResponse])
async def list_recruiter_candidates(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    source: Optional[str] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List candidates in recruiter's database.
    
    Only shows candidates that belong to the current recruiter.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can access candidate database"
        )
    
    # Build query
    query = db.query(
        CandidateProfile,
        RecruiterCandidate,
        User
    ).join(
        RecruiterCandidate,
        RecruiterCandidate.candidate_id == CandidateProfile.id
    ).join(
        User,
        User.id == CandidateProfile.user_id
    ).filter(
        and_(
            RecruiterCandidate.recruiter_id == current_user.id,
            RecruiterCandidate.is_visible == True
        )
    )
    
    # Apply filters
    if source:
        query = query.filter(RecruiterCandidate.source == source)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                CandidateProfile.title.ilike(search_term)
            )
        )
    
    if tags:
        query = query.filter(RecruiterCandidate.tags.overlap(tags))
    
    # Execute query
    results = query.order_by(RecruiterCandidate.added_at.desc()).offset(skip).limit(limit).all()
    
    # Format response
    candidates = []
    for profile, mapping, user in results:
        # Get top skills from resume data
        resume = db.query(Resume).filter(
            and_(
                Resume.candidate_id == user.id,
                Resume.status == ResumeStatus.COMPLETED
            )
        ).order_by(Resume.created_at.desc()).first()
        
        top_skills = None
        if resume:
            resume_data = db.query(ResumeData).filter(ResumeData.resume_id == resume.id).first()
            if resume_data:
                top_skills = resume_data.top_skills
        
        candidates.append(CandidateListResponse(
            candidate_id=str(profile.id),
            user_id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            title=profile.title,
            location=profile.location,
            years_of_experience=profile.years_of_experience or 0,
            top_skills=top_skills,
            added_at=mapping.added_at,
            last_viewed_at=mapping.last_viewed_at,
            source=mapping.source.value,
            tags=mapping.tags or []
        ))
    
    return candidates


@router.get("/candidates/{candidate_id}", response_model=CandidateDetailResponse)
async def get_candidate_details(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a candidate"""
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can access candidate details"
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
    
    # Get recruiter-candidate mapping
    mapping = db.query(RecruiterCandidate).filter(
        and_(
            RecruiterCandidate.candidate_id == candidate_id,
            RecruiterCandidate.recruiter_id == current_user.id
        )
    ).first()
    
    # Get notes
    notes = db.query(CandidateNote).filter(
        and_(
            CandidateNote.candidate_id == candidate_id,
            CandidateNote.recruiter_id == current_user.id
        )
    ).order_by(CandidateNote.created_at.desc()).all()
    
    # Update last viewed
    if mapping:
        mapping.last_viewed_at = datetime.utcnow()
        db.commit()
    
    # Log activity
    log_activity(
        db=db,
        candidate_id=candidate_id,
        user_id=str(current_user.id),
        activity_type=ActivityType.PROFILE_VIEWED,
        description=f"Profile viewed by {current_user.full_name}"
    )
    
    # Format response
    return CandidateDetailResponse(
        candidate_id=str(candidate.id),
        user_id=str(user.id),
        full_name=user.full_name,
        email=user.email,
        phone=candidate.phone,
        title=candidate.title,
        location=candidate.location,
        bio=candidate.bio,
        years_of_experience=candidate.years_of_experience or 0,
        current_company=candidate.current_company,
        current_position=candidate.current_position,
        professional_summary=candidate.professional_summary,
        skills=[{
            "name": s.skill_name,
            "category": s.skill_category,
            "proficiency": s.proficiency_level,
            "years": s.years_of_experience
        } for s in candidate.skills],
        experience=[{
            "company": e.company_name,
            "title": e.job_title,
            "location": e.location,
            "start_date": e.start_date.isoformat() if e.start_date else None,
            "end_date": e.end_date.isoformat() if e.end_date else None,
            "is_current": e.is_current,
            "description": e.description
        } for e in candidate.experiences],
        education=[{
            "institution": ed.institution_name,
            "degree": ed.degree,
            "field": ed.field_of_study,
            "start_date": ed.start_date.isoformat() if ed.start_date else None,
            "end_date": ed.end_date.isoformat() if ed.end_date else None,
            "is_current": ed.is_current
        } for ed in candidate.educations],
        resume_url=candidate.resume_url,
        added_at=mapping.added_at if mapping else candidate.created_at,
        source=mapping.source.value if mapping else "unknown",
        tags=mapping.tags if mapping else [],
        notes=[{
            "id": str(n.id),
            "title": n.title,
            "content": n.content,
            "is_important": n.is_important,
            "created_at": n.created_at.isoformat()
        } for n in notes]
    )


@router.post("/candidates/{candidate_id}/notes")
async def add_candidate_note(
    candidate_id: str,
    note_data: AddNoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a note to a candidate"""
    # Check access
    if current_user.role != UserRole.ADMIN:
        if not check_recruiter_access(db, str(current_user.id), candidate_id):
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Create note
    note = CandidateNote(
        candidate_id=candidate_id,
        recruiter_id=current_user.id,
        title=note_data.title,
        content=note_data.content,
        is_private=note_data.is_private,
        is_important=note_data.is_important
    )
    db.add(note)
    db.commit()
    
    # Log activity
    log_activity(
        db=db,
        candidate_id=candidate_id,
        user_id=str(current_user.id),
        activity_type=ActivityType.NOTE_ADDED,
        description="Note added to candidate",
        reference_type="note",
        reference_id=str(note.id)
    )
    
    return {"message": "Note added successfully", "note_id": str(note.id)}


@router.post("/candidates/{candidate_id}/tags")
async def add_candidate_tags(
    candidate_id: str,
    tags_data: AddTagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add tags to a candidate"""
    # Check access
    if current_user.role != UserRole.ADMIN:
        if not check_recruiter_access(db, str(current_user.id), candidate_id):
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get mapping
    mapping = db.query(RecruiterCandidate).filter(
        and_(
            RecruiterCandidate.candidate_id == candidate_id,
            RecruiterCandidate.recruiter_id == current_user.id
        )
    ).first()
    
    if not mapping:
        raise HTTPException(status_code=404, detail="Candidate not found in your database")
    
    # Add tags
    existing_tags = set(mapping.tags or [])
    new_tags = set(tags_data.tags)
    mapping.tags = list(existing_tags.union(new_tags))
    db.commit()
    
    # Log activity
    for tag in new_tags - existing_tags:
        log_activity(
            db=db,
            candidate_id=candidate_id,
            user_id=str(current_user.id),
            activity_type=ActivityType.TAG_ADDED,
            description=f"Tag '{tag}' added",
            metadata={"tag": tag}
        )
    
    return {"message": "Tags added successfully", "tags": mapping.tags}


# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@router.get("/admin/candidates", response_model=List[CandidateListResponse])
async def list_all_candidates_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all candidates (admin master database).
    
    Only available to admins.
    """
    # Check permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Build query
    query = db.query(CandidateProfile, User).join(
        User,
        User.id == CandidateProfile.user_id
    ).filter(CandidateProfile.is_active == True)
    
    # Apply search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
                CandidateProfile.title.ilike(search_term)
            )
        )
    
    # Execute query
    results = query.order_by(CandidateProfile.created_at.desc()).offset(skip).limit(limit).all()
    
    # Format response
    candidates = []
    for profile, user in results:
        # Get most recent recruiter mapping
        mapping = db.query(RecruiterCandidate).filter(
            RecruiterCandidate.candidate_id == profile.id
        ).order_by(RecruiterCandidate.added_at.desc()).first()
        
        # Get top skills
        resume = db.query(Resume).filter(
            and_(
                Resume.candidate_id == user.id,
                Resume.status == ResumeStatus.COMPLETED
            )
        ).order_by(Resume.created_at.desc()).first()
        
        top_skills = None
        if resume:
            resume_data = db.query(ResumeData).filter(ResumeData.resume_id == resume.id).first()
            if resume_data:
                top_skills = resume_data.top_skills
        
        candidates.append(CandidateListResponse(
            candidate_id=str(profile.id),
            user_id=str(user.id),
            full_name=user.full_name,
            email=user.email,
            title=profile.title,
            location=profile.location,
            years_of_experience=profile.years_of_experience or 0,
            top_skills=top_skills,
            added_at=mapping.added_at if mapping else profile.created_at,
            last_viewed_at=mapping.last_viewed_at if mapping else None,
            source=mapping.source.value if mapping else "unknown",
            tags=mapping.tags if mapping else []
        ))
    
    return candidates


@router.post("/admin/candidates/share")
async def share_candidates_admin(
    share_data: ShareCandidateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Share candidate(s) with recruiter(s).
    
    Only available to admins.
    """
    # Check permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate candidates exist
    candidates = db.query(CandidateProfile).filter(
        CandidateProfile.id.in_(share_data.candidate_ids)
    ).all()
    if len(candidates) != len(share_data.candidate_ids):
        raise HTTPException(status_code=404, detail="One or more candidates not found")
    
    # Validate recruiters exist
    recruiters = db.query(User).filter(
        and_(
            User.id.in_(share_data.recruiter_ids),
            User.role == UserRole.RECRUITER
        )
    ).all()
    if len(recruiters) != len(share_data.recruiter_ids):
        raise HTTPException(status_code=404, detail="One or more recruiters not found")
    
    # Share candidates
    shares_created = 0
    for candidate_id in share_data.candidate_ids:
        for recruiter_id in share_data.recruiter_ids:
            # Check if already shared
            existing_share = db.query(CandidateShare).filter(
                and_(
                    CandidateShare.candidate_id == candidate_id,
                    CandidateShare.to_recruiter_id == recruiter_id
                )
            ).first()
            
            if existing_share:
                # Update existing share
                existing_share.is_active = True
                existing_share.share_reason = share_data.share_reason
                existing_share.share_notes = share_data.share_notes
                existing_share.can_view_contact_info = share_data.can_view_contact_info
                existing_share.can_download_resume = share_data.can_download_resume
                existing_share.can_submit_to_jobs = share_data.can_submit_to_jobs
            else:
                # Create new share
                share = CandidateShare(
                    candidate_id=candidate_id,
                    to_recruiter_id=recruiter_id,
                    shared_by_admin_id=current_user.id,
                    share_reason=share_data.share_reason,
                    share_notes=share_data.share_notes,
                    can_view_contact_info=share_data.can_view_contact_info,
                    can_download_resume=share_data.can_download_resume,
                    can_submit_to_jobs=share_data.can_submit_to_jobs
                )
                db.add(share)
                shares_created += 1
            
            # Add to recruiter's database
            existing_mapping = db.query(RecruiterCandidate).filter(
                and_(
                    RecruiterCandidate.candidate_id == candidate_id,
                    RecruiterCandidate.recruiter_id == recruiter_id
                )
            ).first()
            
            if not existing_mapping:
                mapping = RecruiterCandidate(
                    recruiter_id=recruiter_id,
                    candidate_id=candidate_id,
                    source=CandidateSource.ADMIN_SHARE
                )
                db.add(mapping)
            
            # Log activity
            log_activity(
                db=db,
                candidate_id=candidate_id,
                user_id=str(current_user.id),
                activity_type=ActivityType.SHARED,
                description=f"Candidate shared with recruiter by admin",
                reference_type="share",
                reference_id=str(recruiter_id)
            )
    
    db.commit()
    
    return {
        "message": "Candidates shared successfully",
        "shares_created": shares_created,
        "total_shares": len(share_data.candidate_ids) * len(share_data.recruiter_ids)
    }


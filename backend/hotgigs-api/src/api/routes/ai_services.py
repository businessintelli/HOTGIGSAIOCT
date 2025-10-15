from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from db.session import get_db
from models.user import User
from core.security import get_current_user
from services.resume_ai import ResumeAIService
from services.job_description_ai import JobDescriptionAIService
from services.orion_copilot import OrionCopilotService

router = APIRouter()

# Initialize services
resume_ai = ResumeAIService()
job_desc_ai = JobDescriptionAIService()
orion_copilot = OrionCopilotService()

# Pydantic models
class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    target_job_id: Optional[str] = None

class JobDescriptionRequest(BaseModel):
    job_title: str
    primary_skills: List[str]
    secondary_skills: Optional[List[str]] = None
    experience_level: str = "mid"
    location: Optional[str] = None
    work_model: str = "hybrid"
    employment_type: str = "full-time"
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    company_description: Optional[str] = None
    additional_requirements: Optional[List[str]] = None

class ChatMessage(BaseModel):
    message: str
    context: Optional[dict] = None

class InterviewPrepRequest(BaseModel):
    job_title: str
    company_name: Optional[str] = None
    job_description: Optional[str] = None

class JobFitAnalysisRequest(BaseModel):
    job_id: str

# Resume AI endpoints
@router.post("/resume/analyze")
async def analyze_resume(
    request: ResumeAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze resume for ATS compatibility and quality"""
    
    target_job = None
    if request.target_job_id:
        # TODO: Fetch job from database
        pass
    
    analysis = resume_ai.analyze_resume(request.resume_text, target_job)
    
    return analysis

@router.post("/resume/upload-analyze", response_model=dict)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload and analyze a resume file"""
    
    # Read file content
    content = await file.read()
    
    try:
        # Try to decode as text
        resume_text = content.decode('utf-8')
    except:
        raise HTTPException(status_code=400, detail="Unable to read resume file. Please upload a text-based file.")
    
    # Analyze
    analysis = resume_ai.analyze_resume(resume_text)
    
    return {
        'filename': file.filename,
        'analysis': analysis
    }

# Job Description AI endpoints
@router.post("/job-description/generate")
async def generate_job_description(
    request: JobDescriptionRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered job description"""
    
    # Check if user is employer
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can generate job descriptions")
    
    salary_range = None
    if request.salary_min and request.salary_max:
        salary_range = {'min': request.salary_min, 'max': request.salary_max}
    
    result = job_desc_ai.generate_job_description(
        job_title=request.job_title,
        primary_skills=request.primary_skills,
        secondary_skills=request.secondary_skills,
        experience_level=request.experience_level,
        location=request.location,
        work_model=request.work_model,
        employment_type=request.employment_type,
        salary_range=salary_range,
        company_description=request.company_description,
        additional_requirements=request.additional_requirements
    )
    
    return result

@router.post("/job-description/enhance")
async def enhance_job_description(
    existing_description: str,
    enhancement_focus: str = "general",
    current_user: User = Depends(get_current_user)
):
    """Enhance an existing job description"""
    
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can enhance job descriptions")
    
    result = job_desc_ai.enhance_job_description(existing_description, enhancement_focus)
    
    return result

# Orion Copilot endpoints
@router.post("/orion/chat")
async def chat_with_orion(
    request: ChatMessage,
    current_user: User = Depends(get_current_user)
):
    """Chat with Orion AI Copilot"""
    
    response = orion_copilot.chat(
        user_id=str(current_user.id),
        message=request.message,
        context=request.context
    )
    
    return response

@router.post("/orion/career-advice")
async def get_career_advice(
    advice_type: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized career advice from Orion"""
    
    # Build user profile from database
    # TODO: Fetch complete profile from database
    user_profile = {
        'email': current_user.email,
        'role': current_user.role,
        'headline': 'Software Engineer',  # TODO: Get from candidate profile
        'experience_level': 'mid',
        'years_of_experience': 5,
        'skills': ['Python', 'JavaScript', 'React'],
        'location': 'San Francisco, CA'
    }
    
    advice = orion_copilot.get_career_advice(user_profile, advice_type)
    
    return advice

@router.post("/orion/interview-prep")
async def prepare_for_interview(
    request: InterviewPrepRequest,
    current_user: User = Depends(get_current_user)
):
    """Get interview preparation guidance from Orion"""
    
    # TODO: Fetch user background from database
    user_background = {
        'experience_level': 'mid',
        'skills': ['Python', 'JavaScript', 'React']
    }
    
    prep_guide = orion_copilot.prepare_for_interview(
        job_title=request.job_title,
        company_name=request.company_name,
        job_description=request.job_description,
        user_background=user_background
    )
    
    return prep_guide

@router.post("/orion/analyze-job-fit")
async def analyze_job_fit(
    request: JobFitAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze how well you fit a specific job"""
    
    # TODO: Fetch user profile and job from database
    user_profile = {
        'experience_level': 'mid',
        'years_of_experience': 5,
        'skills': ['Python', 'JavaScript', 'React'],
        'location': 'San Francisco, CA'
    }
    
    job = {
        'title': 'Senior Software Engineer',
        'experience_level': 'senior',
        'required_skills': ['Python', 'Django', 'PostgreSQL'],
        'location': 'San Francisco, CA',
        'work_model': 'hybrid'
    }
    
    analysis = orion_copilot.analyze_job_fit(user_profile, job)
    
    return analysis

@router.delete("/orion/clear-history")
async def clear_conversation_history(
    current_user: User = Depends(get_current_user)
):
    """Clear Orion conversation history"""
    
    orion_copilot.clear_conversation_history(str(current_user.id))
    
    return {'message': 'Conversation history cleared'}


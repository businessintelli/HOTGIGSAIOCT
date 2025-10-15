"""
API routes for job assessment features
Includes skill matrix, screening questions, and candidate assessments
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.db.session import get_db
from src.models.user import User
from src.models.job_assessment import (
    JobSkillRequirement, ScreeningQuestion, CandidateSkillAssessment, 
    ScreeningResponse, ProficiencyLevel, QuestionType
)
from src.models.candidate import Application
from src.core.security import get_current_user

router = APIRouter()


# Pydantic models for requests/responses
class SkillRequirementCreate(BaseModel):
    skill_name: str
    required_proficiency: ProficiencyLevel
    min_years_experience: int = 0
    is_mandatory: bool = True
    weight: float = 1.0


class SkillRequirementResponse(BaseModel):
    id: str
    skill_name: str
    required_proficiency: ProficiencyLevel
    min_years_experience: int
    is_mandatory: bool
    weight: float
    
    class Config:
        from_attributes = True


class ScreeningQuestionCreate(BaseModel):
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    is_required: bool = True
    order: int = 0
    ai_generated: bool = False


class ScreeningQuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    is_required: bool
    order: int
    ai_generated: bool
    
    class Config:
        from_attributes = True


class SkillAssessmentCreate(BaseModel):
    skill_requirement_id: str
    self_rating: int  # 1-10
    proficiency_level: ProficiencyLevel
    years_of_experience: float
    last_used: Optional[str] = None
    description: Optional[str] = None


class SkillAssessmentResponse(BaseModel):
    id: str
    skill_requirement_id: str
    self_rating: int
    proficiency_level: ProficiencyLevel
    years_of_experience: float
    last_used: Optional[str]
    description: Optional[str]
    match_score: Optional[float]
    
    class Config:
        from_attributes = True


class ScreeningResponseCreate(BaseModel):
    question_id: str
    response_text: Optional[str] = None
    response_file_url: Optional[str] = None
    response_rating: Optional[int] = None


class ScreeningResponseResponse(BaseModel):
    id: str
    question_id: str
    response_text: Optional[str]
    response_file_url: Optional[str]
    response_rating: Optional[int]
    ai_score: Optional[float]
    ai_feedback: Optional[str]
    
    class Config:
        from_attributes = True


class GenerateQuestionsRequest(BaseModel):
    skills: List[str]
    job_domain: str
    experience_level: str


# Job Skill Requirements Endpoints
@router.post("/jobs/{job_id}/skills", response_model=List[SkillRequirementResponse])
async def add_skill_requirements(
    job_id: str,
    skills: List[SkillRequirementCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add skill requirements to a job"""
    
    # TODO: Verify user owns the job
    
    skill_requirements = []
    for skill_data in skills:
        skill_req = JobSkillRequirement(
            job_id=job_id,
            **skill_data.dict()
        )
        db.add(skill_req)
        skill_requirements.append(skill_req)
    
    db.commit()
    
    return skill_requirements


@router.get("/jobs/{job_id}/skills", response_model=List[SkillRequirementResponse])
async def get_skill_requirements(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get all skill requirements for a job"""
    
    skills = db.query(JobSkillRequirement).filter(
        JobSkillRequirement.job_id == job_id
    ).all()
    
    return skills


@router.put("/jobs/{job_id}/skills/{skill_id}", response_model=SkillRequirementResponse)
async def update_skill_requirement(
    job_id: str,
    skill_id: str,
    skill_data: SkillRequirementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a skill requirement"""
    
    skill = db.query(JobSkillRequirement).filter(
        JobSkillRequirement.id == skill_id,
        JobSkillRequirement.job_id == job_id
    ).first()
    
    if not skill:
        raise HTTPException(status_code=404, detail="Skill requirement not found")
    
    for key, value in skill_data.dict().items():
        setattr(skill, key, value)
    
    db.commit()
    db.refresh(skill)
    
    return skill


@router.delete("/jobs/{job_id}/skills/{skill_id}")
async def delete_skill_requirement(
    job_id: str,
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a skill requirement"""
    
    skill = db.query(JobSkillRequirement).filter(
        JobSkillRequirement.id == skill_id,
        JobSkillRequirement.job_id == job_id
    ).first()
    
    if not skill:
        raise HTTPException(status_code=404, detail="Skill requirement not found")
    
    db.delete(skill)
    db.commit()
    
    return {"message": "Skill requirement deleted"}


# Screening Questions Endpoints
@router.post("/jobs/{job_id}/questions", response_model=List[ScreeningQuestionResponse])
async def add_screening_questions(
    job_id: str,
    questions: List[ScreeningQuestionCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add screening questions to a job"""
    
    screening_questions = []
    for question_data in questions:
        question = ScreeningQuestion(
            job_id=job_id,
            **question_data.dict()
        )
        db.add(question)
        screening_questions.append(question)
    
    db.commit()
    
    return screening_questions


@router.get("/jobs/{job_id}/questions", response_model=List[ScreeningQuestionResponse])
async def get_screening_questions(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get all screening questions for a job"""
    
    questions = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.job_id == job_id
    ).order_by(ScreeningQuestion.order).all()
    
    return questions


@router.post("/jobs/generate-questions", response_model=List[ScreeningQuestionResponse])
async def generate_screening_questions(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate screening questions using AI based on skills and domain"""
    
    from src.services.question_generator import QuestionGeneratorService
    
    generator = QuestionGeneratorService()
    questions = generator.generate_questions(
        skills=request.skills,
        job_domain=request.job_domain,
        experience_level=request.experience_level
    )
    
    return questions


# Application Skill Assessment Endpoints
@router.post("/applications/{application_id}/skills", response_model=List[SkillAssessmentResponse])
async def submit_skill_assessments(
    application_id: str,
    assessments: List[SkillAssessmentCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit skill assessments for an application"""
    
    # Verify application exists
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    skill_assessments = []
    for assessment_data in assessments:
        # Calculate match score
        skill_req = db.query(JobSkillRequirement).filter(
            JobSkillRequirement.id == assessment_data.skill_requirement_id
        ).first()
        
        if not skill_req:
            continue
        
        match_score = calculate_skill_match_score(assessment_data, skill_req)
        
        assessment = CandidateSkillAssessment(
            application_id=application_id,
            match_score=match_score,
            **assessment_data.dict()
        )
        db.add(assessment)
        skill_assessments.append(assessment)
    
    db.commit()
    
    return skill_assessments


@router.get("/applications/{application_id}/skills", response_model=List[SkillAssessmentResponse])
async def get_skill_assessments(
    application_id: str,
    db: Session = Depends(get_db)
):
    """Get skill assessments for an application"""
    
    assessments = db.query(CandidateSkillAssessment).filter(
        CandidateSkillAssessment.application_id == application_id
    ).all()
    
    return assessments


# Screening Response Endpoints
@router.post("/applications/{application_id}/responses", response_model=List[ScreeningResponseResponse])
async def submit_screening_responses(
    application_id: str,
    responses: List[ScreeningResponseCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit screening question responses for an application"""
    
    # Verify application exists
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    screening_responses = []
    for response_data in responses:
        response = ScreeningResponse(
            application_id=application_id,
            **response_data.dict()
        )
        db.add(response)
        screening_responses.append(response)
    
    db.commit()
    
    # TODO: Trigger AI evaluation of responses
    
    return screening_responses


@router.get("/applications/{application_id}/responses", response_model=List[ScreeningResponseResponse])
async def get_screening_responses(
    application_id: str,
    db: Session = Depends(get_db)
):
    """Get screening responses for an application"""
    
    responses = db.query(ScreeningResponse).filter(
        ScreeningResponse.application_id == application_id
    ).all()
    
    return responses


# Assessment Summary Endpoint
@router.get("/applications/{application_id}/assessment-summary")
async def get_assessment_summary(
    application_id: str,
    db: Session = Depends(get_db)
):
    """Get complete assessment summary for an application"""
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get skill assessments
    skill_assessments = db.query(CandidateSkillAssessment).filter(
        CandidateSkillAssessment.application_id == application_id
    ).all()
    
    # Get screening responses
    screening_responses = db.query(ScreeningResponse).filter(
        ScreeningResponse.application_id == application_id
    ).all()
    
    # Calculate overall scores
    avg_skill_match = sum(s.match_score or 0 for s in skill_assessments) / len(skill_assessments) if skill_assessments else 0
    avg_screening_score = sum(r.ai_score or 0 for r in screening_responses) / len(screening_responses) if screening_responses else 0
    
    return {
        "application_id": application_id,
        "skill_assessments": skill_assessments,
        "screening_responses": screening_responses,
        "overall_skill_match": avg_skill_match,
        "overall_screening_score": avg_screening_score,
        "combined_score": (avg_skill_match + avg_screening_score) / 2
    }


# Helper function to calculate skill match score
def calculate_skill_match_score(assessment: SkillAssessmentCreate, requirement: JobSkillRequirement) -> float:
    """Calculate match score based on assessment and requirement"""
    
    score = 0.0
    
    # Proficiency level match (40% weight)
    proficiency_scores = {
        ProficiencyLevel.BEGINNER: 1,
        ProficiencyLevel.INTERMEDIATE: 2,
        ProficiencyLevel.ADVANCED: 3,
        ProficiencyLevel.EXPERT: 4
    }
    
    candidate_level = proficiency_scores.get(assessment.proficiency_level, 0)
    required_level = proficiency_scores.get(requirement.required_proficiency, 0)
    
    if candidate_level >= required_level:
        score += 40
    else:
        score += (candidate_level / required_level) * 40
    
    # Years of experience match (40% weight)
    if assessment.years_of_experience >= requirement.min_years_experience:
        score += 40
    else:
        score += (assessment.years_of_experience / requirement.min_years_experience) * 40
    
    # Self-rating (20% weight)
    score += (assessment.self_rating / 10) * 20
    
    return min(score, 100.0)


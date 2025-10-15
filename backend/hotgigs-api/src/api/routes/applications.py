from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Pydantic models
class ApplicationCreate(BaseModel):
    job_id: str
    candidate_id: str
    cover_letter: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    candidate_name: str
    job_title: str
    company: str
    status: str
    match_score: int
    applied_date: str

# Mock data
mock_applications = [
    {
        "id": "1",
        "job_id": "1",
        "candidate_id": "1",
        "candidate_name": "John Doe",
        "job_title": "Senior Software Engineer",
        "company": "Google",
        "status": "Not Reviewed",
        "match_score": 97,
        "applied_date": "2024-10-14"
    },
    {
        "id": "2",
        "job_id": "2",
        "candidate_id": "2",
        "candidate_name": "Jane Smith",
        "job_title": "Product Manager",
        "company": "Microsoft",
        "status": "Reviewed",
        "match_score": 92,
        "applied_date": "2024-10-13"
    }
]

@router.get("/", response_model=List[ApplicationResponse])
async def get_applications(job_id: Optional[str] = None, candidate_id: Optional[str] = None):
    """Get all applications with optional filtering"""
    filtered_apps = mock_applications
    
    if job_id:
        filtered_apps = [a for a in filtered_apps if a["job_id"] == job_id]
    if candidate_id:
        filtered_apps = [a for a in filtered_apps if a["candidate_id"] == candidate_id]
    
    return filtered_apps

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(application_id: str):
    """Get a specific application by ID"""
    application = next((a for a in mock_applications if a["id"] == application_id), None)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return application

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(app_data: ApplicationCreate):
    """Submit a job application"""
    new_application = {
        "id": str(len(mock_applications) + 1),
        "job_id": app_data.job_id,
        "candidate_id": app_data.candidate_id,
        "candidate_name": "New Candidate",  # Would be fetched from database
        "job_title": "Job Title",  # Would be fetched from database
        "company": "Company Name",  # Would be fetched from database
        "status": "Not Reviewed",
        "match_score": 85,  # Would be calculated by AI
        "applied_date": datetime.now().strftime("%Y-%m-%d")
    }
    mock_applications.append(new_application)
    return new_application

@router.patch("/{application_id}/status")
async def update_application_status(application_id: str, status: str):
    """Update application status"""
    application = next((a for a in mock_applications if a["id"] == application_id), None)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    application["status"] = status
    return application


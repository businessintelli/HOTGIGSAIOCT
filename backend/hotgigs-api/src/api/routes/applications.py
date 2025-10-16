from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from src.services.email_service import get_email_service, EmailService
from src.templates.email_templates import (
    application_received_template,
    new_application_notification_recruiter
)

logger = logging.getLogger(__name__)

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
async def create_application(
    app_data: ApplicationCreate,
    email_service: EmailService = Depends(get_email_service)
):
    """Submit a job application"""
    # Create application
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
    
    # Send confirmation email to candidate
    try:
        candidate_email = "candidate@example.com"  # Would be fetched from database
        candidate_html = application_received_template(
            new_application["candidate_name"],
            new_application["job_title"],
            new_application["company"]
        )
        await email_service.send_email(
            to=candidate_email,
            subject=f"Application Received - {new_application['job_title']}",
            html=candidate_html
        )
        logger.info(f"Sent application confirmation email to {candidate_email}")
    except Exception as e:
        logger.error(f"Failed to send candidate confirmation email: {str(e)}")
    
    # Send notification email to recruiter
    try:
        recruiter_email = "recruiter@example.com"  # Would be fetched from database
        recruiter_name = "Recruiter Name"  # Would be fetched from database
        recruiter_html = new_application_notification_recruiter(
            recruiter_name,
            new_application["candidate_name"],
            new_application["job_title"],
            new_application["id"]
        )
        await email_service.send_email(
            to=recruiter_email,
            subject=f"New Application - {new_application['job_title']}",
            html=recruiter_html
        )
        logger.info(f"Sent new application notification to {recruiter_email}")
    except Exception as e:
        logger.error(f"Failed to send recruiter notification email: {str(e)}")
    
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


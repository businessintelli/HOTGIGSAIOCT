"""
Interview scheduling and management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import logging

from src.services.email_service import get_email_service, EmailService
from src.templates.email_templates import interview_invitation_template

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class InterviewCreate(BaseModel):
    application_id: str
    candidate_email: EmailStr
    candidate_name: str
    job_title: str
    company_name: str
    interview_date: str  # e.g., "November 15, 2025"
    interview_time: str  # e.g., "2:00 PM EST"
    interview_type: str = "video"  # video, phone, in-person
    notes: Optional[str] = None

class InterviewResponse(BaseModel):
    id: str
    application_id: str
    candidate_name: str
    job_title: str
    company_name: str
    interview_date: str
    interview_time: str
    interview_type: str
    interview_link: str
    status: str  # scheduled, completed, cancelled
    created_at: str

# Mock data
mock_interviews = [
    {
        "id": "1",
        "application_id": "1",
        "candidate_name": "John Doe",
        "job_title": "Senior Software Engineer",
        "company_name": "Google",
        "interview_date": "November 15, 2025",
        "interview_time": "2:00 PM EST",
        "interview_type": "video",
        "interview_link": "https://hotgigs.ai/interview/abc123",
        "status": "scheduled",
        "created_at": "2024-10-14T10:00:00"
    }
]

@router.get("/", response_model=List[InterviewResponse])
async def get_interviews(application_id: Optional[str] = None):
    """Get all interviews with optional filtering by application"""
    if application_id:
        return [i for i in mock_interviews if i["application_id"] == application_id]
    return mock_interviews

@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(interview_id: str):
    """Get a specific interview by ID"""
    interview = next((i for i in mock_interviews if i["id"] == interview_id), None)
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    return interview

@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    interview_data: InterviewCreate,
    email_service: EmailService = Depends(get_email_service)
):
    """Schedule a new interview and send invitation email"""
    
    # Generate interview link
    interview_id = str(len(mock_interviews) + 1)
    interview_link = f"https://hotgigs.ai/interview/{interview_id}"
    
    # Create interview record
    new_interview = {
        "id": interview_id,
        "application_id": interview_data.application_id,
        "candidate_name": interview_data.candidate_name,
        "job_title": interview_data.job_title,
        "company_name": interview_data.company_name,
        "interview_date": interview_data.interview_date,
        "interview_time": interview_data.interview_time,
        "interview_type": interview_data.interview_type,
        "interview_link": interview_link,
        "status": "scheduled",
        "created_at": datetime.now().isoformat()
    }
    mock_interviews.append(new_interview)
    
    # Send interview invitation email to candidate
    try:
        html = interview_invitation_template(
            interview_data.candidate_name,
            interview_data.job_title,
            interview_data.company_name,
            interview_data.interview_date,
            interview_data.interview_time,
            interview_link
        )
        result = await email_service.send_email(
            to=interview_data.candidate_email,
            subject=f"Interview Invitation - {interview_data.job_title}",
            html=html
        )
        
        if result["success"]:
            logger.info(f"Sent interview invitation to {interview_data.candidate_email}")
        else:
            logger.error(f"Failed to send interview invitation: {result.get('error')}")
            
    except Exception as e:
        logger.error(f"Error sending interview invitation email: {str(e)}")
        # Don't fail the interview creation if email fails
    
    return new_interview

@router.patch("/{interview_id}/status")
async def update_interview_status(interview_id: str, new_status: str):
    """Update interview status (scheduled, completed, cancelled)"""
    interview = next((i for i in mock_interviews if i["id"] == interview_id), None)
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    valid_statuses = ["scheduled", "completed", "cancelled", "rescheduled"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    interview["status"] = new_status
    return interview

@router.delete("/{interview_id}")
async def cancel_interview(interview_id: str):
    """Cancel an interview"""
    interview = next((i for i in mock_interviews if i["id"] == interview_id), None)
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    interview["status"] = "cancelled"
    
    # TODO: Send cancellation email to candidate
    
    return {"message": "Interview cancelled successfully", "interview": interview}


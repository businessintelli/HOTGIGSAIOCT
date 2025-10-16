"""
API endpoints for sending emails via Resend
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, EmailStr
from typing import List, Optional

from src.services.email_service import get_email_service, EmailService
from src.templates.email_templates import (
    application_received_template,
    interview_invitation_template,
    new_application_notification_recruiter,
    password_reset_template,
    welcome_email_template
)

router = APIRouter(prefix="/api/emails", tags=["emails"])

class ApplicationConfirmation(BaseModel):
    candidate_email: EmailStr
    candidate_name: str
    job_title: str
    company_name: str

@router.post("/send-application-confirmation", status_code=200)
async def send_application_confirmation(
    data: ApplicationConfirmation,
    email_service: EmailService = Depends(get_email_service)
):
    """Send application confirmation email to a candidate"""
    html = application_received_template(data.candidate_name, data.job_title, data.company_name)
    result = await email_service.send_email(
        to=data.candidate_email,
        subject=f"Application Received - {data.job_title}",
        html=html
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class InterviewInvitation(BaseModel):
    candidate_email: EmailStr
    candidate_name: str
    job_title: str
    company_name: str
    interview_date: str
    interview_time: str
    interview_link: str

@router.post("/send-interview-invitation", status_code=200)
async def send_interview_invitation(
    data: InterviewInvitation,
    email_service: EmailService = Depends(get_email_service)
):
    """Send interview invitation email to a candidate"""
    html = interview_invitation_template(
        data.candidate_name, data.job_title, data.company_name, 
        data.interview_date, data.interview_time, data.interview_link
    )
    result = await email_service.send_email(
        to=data.candidate_email,
        subject=f"Interview Invitation - {data.job_title}",
        html=html
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class NewApplicationNotification(BaseModel):
    recruiter_email: EmailStr
    recruiter_name: str
    candidate_name: str
    job_title: str
    application_id: str

@router.post("/notify-recruiter-new-application", status_code=200)
async def notify_recruiter_new_application(
    data: NewApplicationNotification,
    email_service: EmailService = Depends(get_email_service)
):
    """Notify a recruiter about a new application"""
    html = new_application_notification_recruiter(
        data.recruiter_name, data.candidate_name, data.job_title, data.application_id
    )
    result = await email_service.send_email(
        to=data.recruiter_email,
        subject=f"New Application for {data.job_title}",
        html=html
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class PasswordReset(BaseModel):
    user_email: EmailStr
    user_name: str
    reset_link: str

@router.post("/send-password-reset", status_code=200)
async def send_password_reset(
    data: PasswordReset,
    email_service: EmailService = Depends(get_email_service)
):
    """Send password reset email"""
    html = password_reset_template(data.user_name, data.reset_link)
    result = await email_service.send_email(
        to=data.user_email,
        subject="Password Reset Request for HotGigs.ai",
        html=html
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

class WelcomeEmail(BaseModel):
    user_email: EmailStr
    user_name: str

@router.post("/send-welcome-email", status_code=200)
async def send_welcome_email(
    data: WelcomeEmail,
    email_service: EmailService = Depends(get_email_service)
):
    """Send welcome email to a new user"""
    html = welcome_email_template(data.user_name)
    result = await email_service.send_email(
        to=data.user_email,
        subject="Welcome to HotGigs.ai!",
        html=html
    )
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result


"""
Email preferences management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class EmailPreferences(BaseModel):
    user_id: str
    email: EmailStr
    application_updates: bool = True
    interview_notifications: bool = True
    job_recommendations: bool = True
    weekly_digest: bool = True
    marketing_emails: bool = False
    recruiter_messages: bool = True
    status_updates: bool = True

class EmailPreferencesUpdate(BaseModel):
    application_updates: Optional[bool] = None
    interview_notifications: Optional[bool] = None
    job_recommendations: Optional[bool] = None
    weekly_digest: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    recruiter_messages: Optional[bool] = None
    status_updates: Optional[bool] = None

# Mock data
mock_preferences = {
    "1": {
        "user_id": "1",
        "email": "candidate@example.com",
        "application_updates": True,
        "interview_notifications": True,
        "job_recommendations": True,
        "weekly_digest": True,
        "marketing_emails": False,
        "recruiter_messages": True,
        "status_updates": True
    }
}

@router.get("/{user_id}", response_model=EmailPreferences)
async def get_email_preferences(user_id: str):
    """Get email preferences for a user"""
    preferences = mock_preferences.get(user_id)
    if not preferences:
        # Return default preferences if not found
        return EmailPreferences(
            user_id=user_id,
            email="user@example.com",
            application_updates=True,
            interview_notifications=True,
            job_recommendations=True,
            weekly_digest=True,
            marketing_emails=False,
            recruiter_messages=True,
            status_updates=True
        )
    return preferences

@router.put("/{user_id}", response_model=EmailPreferences)
async def update_email_preferences(user_id: str, preferences: EmailPreferencesUpdate):
    """Update email preferences for a user"""
    
    # Get existing preferences or create new ones
    current_prefs = mock_preferences.get(user_id, {
        "user_id": user_id,
        "email": "user@example.com",
        "application_updates": True,
        "interview_notifications": True,
        "job_recommendations": True,
        "weekly_digest": True,
        "marketing_emails": False,
        "recruiter_messages": True,
        "status_updates": True
    })
    
    # Update only the fields that are provided
    update_data = preferences.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            current_prefs[key] = value
    
    mock_preferences[user_id] = current_prefs
    logger.info(f"Updated email preferences for user {user_id}")
    
    return current_prefs

@router.post("/unsubscribe")
async def unsubscribe_from_all(user_email: EmailStr):
    """Unsubscribe a user from all marketing and non-essential emails"""
    
    # Find user by email
    user_id = None
    for uid, prefs in mock_preferences.items():
        if prefs["email"] == user_email:
            user_id = uid
            break
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Disable all non-essential emails
    mock_preferences[user_id].update({
        "job_recommendations": False,
        "weekly_digest": False,
        "marketing_emails": False
    })
    
    logger.info(f"User {user_email} unsubscribed from all marketing emails")
    
    return {
        "message": "Successfully unsubscribed from marketing emails",
        "email": user_email
    }

@router.post("/resubscribe")
async def resubscribe_to_all(user_email: EmailStr):
    """Resubscribe a user to all emails"""
    
    # Find user by email
    user_id = None
    for uid, prefs in mock_preferences.items():
        if prefs["email"] == user_email:
            user_id = uid
            break
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Enable all emails
    mock_preferences[user_id].update({
        "application_updates": True,
        "interview_notifications": True,
        "job_recommendations": True,
        "weekly_digest": True,
        "marketing_emails": True,
        "recruiter_messages": True,
        "status_updates": True
    })
    
    logger.info(f"User {user_email} resubscribed to all emails")
    
    return {
        "message": "Successfully resubscribed to all emails",
        "email": user_email
    }


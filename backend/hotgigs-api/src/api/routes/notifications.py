from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid

from src.db.session import get_db
from src.models.user import User
from src.core.security import get_current_user
from src.services.notification_service import NotificationService

router = APIRouter()

# Pydantic models
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    related_job_id: Optional[str] = None
    related_application_id: Optional[str] = None
    related_user_id: Optional[str] = None
    is_read: bool
    is_archived: bool
    action_url: Optional[str] = None
    created_at: str
    read_at: Optional[str] = None

class PreferencesUpdate(BaseModel):
    email_application_received: Optional[bool] = None
    email_application_status: Optional[bool] = None
    email_new_job_match: Optional[bool] = None
    email_interview_scheduled: Optional[bool] = None
    email_message_received: Optional[bool] = None
    app_application_received: Optional[bool] = None
    app_application_status: Optional[bool] = None
    app_new_job_match: Optional[bool] = None
    app_interview_scheduled: Optional[bool] = None
    app_message_received: Optional[bool] = None

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notifications"""
    
    service = NotificationService(db)
    notifications = service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    
    return [notif.to_dict() for notif in notifications]

@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications"""
    
    service = NotificationService(db)
    count = service.get_unread_count(current_user.id)
    
    return {'count': count}

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    
    service = NotificationService(db)
    success = service.mark_as_read(uuid.UUID(notification_id))
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {'message': 'Notification marked as read'}

@router.put("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    
    service = NotificationService(db)
    count = service.mark_all_as_read(current_user.id)
    
    return {'message': f'{count} notifications marked as read'}

@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    
    service = NotificationService(db)
    success = service.delete_notification(uuid.UUID(notification_id))
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {'message': 'Notification deleted'}

@router.put("/{notification_id}/archive")
async def archive_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Archive a notification"""
    
    service = NotificationService(db)
    success = service.archive_notification(uuid.UUID(notification_id))
    
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {'message': 'Notification archived'}

@router.get("/preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notification preferences"""
    
    service = NotificationService(db)
    prefs = service.get_user_preferences(current_user.id)
    
    return {
        'email_application_received': prefs.email_application_received,
        'email_application_status': prefs.email_application_status,
        'email_new_job_match': prefs.email_new_job_match,
        'email_interview_scheduled': prefs.email_interview_scheduled,
        'email_message_received': prefs.email_message_received,
        'app_application_received': prefs.app_application_received,
        'app_application_status': prefs.app_application_status,
        'app_new_job_match': prefs.app_new_job_match,
        'app_interview_scheduled': prefs.app_interview_scheduled,
        'app_message_received': prefs.app_message_received
    }

@router.put("/preferences")
async def update_notification_preferences(
    preferences: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user notification preferences"""
    
    service = NotificationService(db)
    
    # Convert to dict, excluding None values
    prefs_dict = {k: v for k, v in preferences.dict().items() if v is not None}
    
    updated_prefs = service.update_preferences(current_user.id, prefs_dict)
    
    return {'message': 'Preferences updated successfully'}


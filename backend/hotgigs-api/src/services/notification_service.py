"""
Notification Service
Handles creation, management, and delivery of notifications
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from models.notification import Notification, NotificationType, NotificationPreference
from models.user import User


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_notification(
        self,
        user_id: uuid.UUID,
        notification_type: NotificationType,
        title: str,
        message: str,
        related_job_id: Optional[uuid.UUID] = None,
        related_application_id: Optional[uuid.UUID] = None,
        related_user_id: Optional[uuid.UUID] = None,
        action_url: Optional[str] = None
    ) -> Notification:
        """Create a new notification"""
        
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            related_job_id=related_job_id,
            related_application_id=related_application_id,
            related_user_id=related_user_id,
            action_url=action_url
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        return notification
    
    def get_user_notifications(
        self,
        user_id: uuid.UUID,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """Get notifications for a user"""
        
        query = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_archived == False
        )
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(
            Notification.created_at.desc()
        ).limit(limit).all()
        
        return notifications
    
    def mark_as_read(self, notification_id: uuid.UUID) -> bool:
        """Mark a notification as read"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        
        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            return True
        
        return False
    
    def mark_all_as_read(self, user_id: uuid.UUID) -> int:
        """Mark all notifications as read for a user"""
        
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({
            'is_read': True,
            'read_at': datetime.utcnow()
        })
        
        self.db.commit()
        return count
    
    def archive_notification(self, notification_id: uuid.UUID) -> bool:
        """Archive a notification"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        
        if notification:
            notification.is_archived = True
            self.db.commit()
            return True
        
        return False
    
    def delete_notification(self, notification_id: uuid.UUID) -> bool:
        """Delete a notification"""
        
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id
        ).first()
        
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        
        return False
    
    def get_unread_count(self, user_id: uuid.UUID) -> int:
        """Get count of unread notifications"""
        
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False,
            Notification.is_archived == False
        ).count()
        
        return count
    
    # Specific notification creators
    
    def notify_application_received(
        self,
        employer_id: uuid.UUID,
        candidate_name: str,
        job_title: str,
        job_id: uuid.UUID,
        application_id: uuid.UUID
    ):
        """Notify employer of new application"""
        
        return self.create_notification(
            user_id=employer_id,
            notification_type=NotificationType.APPLICATION_RECEIVED,
            title="New Application Received",
            message=f"{candidate_name} has applied to your job posting: {job_title}",
            related_job_id=job_id,
            related_application_id=application_id,
            action_url=f"/company/applications/{application_id}"
        )
    
    def notify_application_status_changed(
        self,
        candidate_id: uuid.UUID,
        job_title: str,
        new_status: str,
        job_id: uuid.UUID,
        application_id: uuid.UUID
    ):
        """Notify candidate of application status change"""
        
        status_messages = {
            'reviewed': 'Your application has been reviewed',
            'shortlisted': 'Congratulations! You have been shortlisted',
            'interview': 'You have been invited for an interview',
            'offer': 'Congratulations! You have received an offer',
            'rejected': 'Your application status has been updated',
            'withdrawn': 'Your application has been withdrawn'
        }
        
        message = status_messages.get(new_status, 'Your application status has been updated')
        
        return self.create_notification(
            user_id=candidate_id,
            notification_type=NotificationType.APPLICATION_STATUS_CHANGED,
            title=f"Application Status Update: {job_title}",
            message=f"{message} for {job_title}",
            related_job_id=job_id,
            related_application_id=application_id,
            action_url=f"/applications/{application_id}"
        )
    
    def notify_new_job_match(
        self,
        candidate_id: uuid.UUID,
        job_title: str,
        company_name: str,
        match_score: float,
        job_id: uuid.UUID
    ):
        """Notify candidate of new job match"""
        
        return self.create_notification(
            user_id=candidate_id,
            notification_type=NotificationType.NEW_JOB_MATCH,
            title="New Job Match Found!",
            message=f"We found a {match_score}% match: {job_title} at {company_name}",
            related_job_id=job_id,
            action_url=f"/jobs/{job_id}"
        )
    
    def notify_interview_scheduled(
        self,
        candidate_id: uuid.UUID,
        job_title: str,
        interview_date: str,
        job_id: uuid.UUID,
        application_id: uuid.UUID
    ):
        """Notify candidate of scheduled interview"""
        
        return self.create_notification(
            user_id=candidate_id,
            notification_type=NotificationType.INTERVIEW_SCHEDULED,
            title="Interview Scheduled",
            message=f"Your interview for {job_title} is scheduled for {interview_date}",
            related_job_id=job_id,
            related_application_id=application_id,
            action_url=f"/applications/{application_id}"
        )
    
    def notify_message_received(
        self,
        recipient_id: uuid.UUID,
        sender_name: str,
        sender_id: uuid.UUID,
        message_preview: str
    ):
        """Notify user of new message"""
        
        return self.create_notification(
            user_id=recipient_id,
            notification_type=NotificationType.MESSAGE_RECEIVED,
            title=f"New message from {sender_name}",
            message=message_preview[:100],
            related_user_id=sender_id,
            action_url="/messages"
        )
    
    def notify_profile_viewed(
        self,
        candidate_id: uuid.UUID,
        company_name: str,
        company_id: uuid.UUID
    ):
        """Notify candidate that their profile was viewed"""
        
        return self.create_notification(
            user_id=candidate_id,
            notification_type=NotificationType.PROFILE_VIEWED,
            title="Profile Viewed",
            message=f"{company_name} viewed your profile",
            related_user_id=company_id,
            action_url="/dashboard"
        )
    
    def notify_team_invitation(
        self,
        user_id: uuid.UUID,
        company_name: str,
        role: str
    ):
        """Notify user of team invitation"""
        
        return self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.TEAM_INVITATION,
            title="Team Invitation",
            message=f"You've been invited to join {company_name} as a {role}",
            action_url="/settings/team"
        )
    
    # Notification preferences
    
    def get_user_preferences(self, user_id: uuid.UUID) -> Optional[NotificationPreference]:
        """Get user notification preferences"""
        
        prefs = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not prefs:
            # Create default preferences
            prefs = NotificationPreference(user_id=user_id)
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(prefs)
        
        return prefs
    
    def update_preferences(
        self,
        user_id: uuid.UUID,
        preferences: Dict[str, bool]
    ) -> NotificationPreference:
        """Update user notification preferences"""
        
        prefs = self.get_user_preferences(user_id)
        
        for key, value in preferences.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)
        
        prefs.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(prefs)
        
        return prefs


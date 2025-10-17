"""
Email Service with Database Integration

This version of the email service logs all emails to the database for tracking and analytics.
"""
import resend
from typing import List, Dict, Optional
import logging
from datetime import datetime
from sqlalchemy.orm import Session

from src.core.config import settings
from src.models.email_log import EmailLog, EmailClick
from src.database import get_db

logger = logging.getLogger(__name__)

# Configure Resend API
resend.api_key = settings.RESEND_API_KEY

class EmailServiceWithDB:
    """Email service with database logging"""
    
    def __init__(self, db: Session = None):
        """Initialize email service with optional database session"""
        self.db = db
        self.from_email = settings.RESEND_FROM_EMAIL
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        template_name: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Send a single email and log to database
        
        Args:
            to: Recipient email address
            subject: Email subject
            html: HTML content
            template_name: Name of the template used
            metadata: Additional metadata to store
            
        Returns:
            Dict with success status and email_id
        """
        try:
            # Send email via Resend
            result = resend.Emails.send({
                "from": self.from_email,
                "to": to,
                "subject": subject,
                "html": html
            })
            
            email_id = result.get("id")
            
            # Log to database if db session is available
            if self.db:
                try:
                    email_log = EmailLog(
                        email_id=email_id,
                        to_email=to,
                        from_email=self.from_email,
                        subject=subject,
                        template_name=template_name,
                        status="sent",
                        sent_at=datetime.utcnow(),
                        metadata=metadata
                    )
                    self.db.add(email_log)
                    self.db.commit()
                    logger.info(f"Email logged to database: {email_id}")
                except Exception as db_error:
                    logger.error(f"Failed to log email to database: {str(db_error)}")
                    # Don't fail the email send if database logging fails
                    self.db.rollback()
            
            logger.info(f"Email sent successfully to {to}, ID: {email_id}")
            
            return {
                "success": True,
                "email_id": email_id,
                "message": "Email sent successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {str(e)}")
            
            # Log failure to database
            if self.db:
                try:
                    email_log = EmailLog(
                        email_id=f"failed-{datetime.utcnow().timestamp()}",
                        to_email=to,
                        from_email=self.from_email,
                        subject=subject,
                        template_name=template_name,
                        status="failed",
                        metadata={"error": str(e), **(metadata or {})}
                    )
                    self.db.add(email_log)
                    self.db.commit()
                except Exception as db_error:
                    logger.error(f"Failed to log email error to database: {str(db_error)}")
                    self.db.rollback()
            
            return {
                "success": False,
                "error": str(e)
            }
    
    async def send_batch(
        self,
        emails: List[Dict],
        template_name: Optional[str] = None
    ) -> Dict:
        """
        Send multiple emails in batch and log to database
        
        Args:
            emails: List of email dicts with 'to', 'subject', 'html' keys
            template_name: Name of the template used
            
        Returns:
            Dict with success status and results
        """
        try:
            # Prepare batch for Resend
            batch = []
            for email in emails:
                batch.append({
                    "from": self.from_email,
                    "to": email["to"],
                    "subject": email["subject"],
                    "html": email["html"]
                })
            
            # Send batch via Resend
            results = resend.Batch.send(batch)
            
            # Log each email to database
            if self.db:
                for i, result in enumerate(results.get("data", [])):
                    try:
                        email_id = result.get("id")
                        email_log = EmailLog(
                            email_id=email_id,
                            to_email=emails[i]["to"],
                            from_email=self.from_email,
                            subject=emails[i]["subject"],
                            template_name=template_name,
                            status="sent",
                            sent_at=datetime.utcnow(),
                            metadata=emails[i].get("metadata")
                        )
                        self.db.add(email_log)
                    except Exception as db_error:
                        logger.error(f"Failed to log batch email to database: {str(db_error)}")
                
                try:
                    self.db.commit()
                    logger.info(f"Batch of {len(emails)} emails logged to database")
                except Exception as db_error:
                    logger.error(f"Failed to commit batch email logs: {str(db_error)}")
                    self.db.rollback()
            
            logger.info(f"Batch of {len(emails)} emails sent successfully")
            
            return {
                "success": True,
                "count": len(emails),
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Failed to send batch emails: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def update_email_status(
        self,
        email_id: str,
        status: str,
        **kwargs
    ) -> bool:
        """
        Update email status in database (called by webhook handler)
        
        Args:
            email_id: Email ID from Resend
            status: New status (delivered, opened, clicked, bounced, complained)
            **kwargs: Additional fields to update
            
        Returns:
            True if updated successfully, False otherwise
        """
        if not self.db:
            logger.warning("No database session available for status update")
            return False
        
        try:
            email_log = self.db.query(EmailLog).filter(
                EmailLog.email_id == email_id
            ).first()
            
            if not email_log:
                logger.warning(f"Email log not found for ID: {email_id}")
                return False
            
            # Update status
            email_log.status = status
            
            # Update timestamp based on status
            timestamp = datetime.utcnow()
            if status == "delivered":
                email_log.delivered_at = timestamp
            elif status == "opened":
                email_log.opened = True
                email_log.opened_at = timestamp
                email_log.open_count += 1
            elif status == "clicked":
                email_log.clicked = True
                email_log.clicked_at = timestamp
                email_log.click_count += 1
            elif status == "bounced":
                email_log.bounced_at = timestamp
                email_log.bounce_type = kwargs.get("bounce_type")
                email_log.bounce_reason = kwargs.get("bounce_reason")
            elif status == "complained":
                email_log.complained_at = timestamp
            
            # Update user agent if provided
            if "user_agent" in kwargs:
                email_log.user_agent = kwargs["user_agent"]
            
            self.db.commit()
            logger.info(f"Email status updated: {email_id} -> {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update email status: {str(e)}")
            self.db.rollback()
            return False
    
    def log_email_click(
        self,
        email_id: str,
        link: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> bool:
        """
        Log email link click to database
        
        Args:
            email_id: Email ID from Resend
            link: URL that was clicked
            user_agent: User agent string
            ip_address: IP address of the clicker
            
        Returns:
            True if logged successfully, False otherwise
        """
        if not self.db:
            logger.warning("No database session available for click logging")
            return False
        
        try:
            email_click = EmailClick(
                email_id=email_id,
                link=link,
                user_agent=user_agent,
                ip_address=ip_address
            )
            self.db.add(email_click)
            self.db.commit()
            
            logger.info(f"Email click logged: {email_id} -> {link}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to log email click: {str(e)}")
            self.db.rollback()
            return False


# Dependency for FastAPI
def get_email_service_with_db(db: Session = None) -> EmailServiceWithDB:
    """Get email service instance with database session"""
    return EmailServiceWithDB(db=db)


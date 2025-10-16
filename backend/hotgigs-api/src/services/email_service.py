"""
Email Service using Resend API
Handles all transactional email sending for HotGigs.ai
"""
import resend
from typing import List, Dict, Optional
from pydantic import EmailStr
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Service for sending emails via Resend"""
    
    def __init__(self):
        """Initialize Resend with API key"""
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = settings.RESEND_FROM_EMAIL
        logger.info(f"EmailService initialized with sender: {self.from_email}")
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        attachments: Optional[List[Dict]] = None,
        reply_to: Optional[str] = None
    ) -> Dict:
        """
        Send a single email
        
        Args:
            to: Recipient email address
            subject: Email subject
            html: HTML email content
            attachments: Optional list of attachments
            reply_to: Optional reply-to email address
            
        Returns:
            Dict with success status and email_id or error message
        """
        try:
            params = {
                "from": self.from_email,
                "to": to,
                "subject": subject,
                "html": html,
            }
            
            if attachments:
                params["attachments"] = attachments
            
            if reply_to:
                params["reply_to"] = reply_to
            
            logger.info(f"Sending email to {to} with subject: {subject}")
            email = resend.Emails.send(params)
            logger.info(f"Email sent successfully. ID: {email.get('id')}")
            
            return {
                "success": True,
                "email_id": email.get("id"),
                "message": "Email sent successfully"
            }
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to send email"
            }
    
    async def send_batch(self, emails: List[Dict]) -> Dict:
        """
        Send multiple emails in a single API call (up to 100)
        
        Args:
            emails: List of email dictionaries with 'to', 'subject', 'html' keys
            
        Returns:
            Dict with success status and results
        """
        try:
            if len(emails) > 100:
                logger.warning(f"Batch size {len(emails)} exceeds limit of 100. Splitting...")
                # Split into chunks of 100
                results = []
                for i in range(0, len(emails), 100):
                    chunk = emails[i:i+100]
                    result = await self._send_batch_chunk(chunk)
                    results.append(result)
                return {
                    "success": True,
                    "results": results,
                    "total_sent": len(emails)
                }
            else:
                return await self._send_batch_chunk(emails)
        except Exception as e:
            logger.error(f"Failed to send batch emails: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to send batch emails"
            }
    
    async def _send_batch_chunk(self, emails: List[Dict]) -> Dict:
        """Send a chunk of emails (max 100)"""
        batch_params = []
        for email in emails:
            batch_params.append({
                "from": self.from_email,
                "to": email["to"],
                "subject": email["subject"],
                "html": email["html"]
            })
        
        logger.info(f"Sending batch of {len(batch_params)} emails")
        result = resend.Batch.send(batch_params)
        logger.info(f"Batch sent successfully")
        
        return {
            "success": True,
            "results": result,
            "count": len(batch_params)
        }

# Singleton instance
email_service = EmailService()

def get_email_service() -> EmailService:
    """Dependency injection for email service"""
    return email_service


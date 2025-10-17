"""
Webhook handlers for external services
"""
from fastapi import APIRouter, Request, HTTPException, Header, Depends
from typing import Optional
from sqlalchemy.orm import Session
import logging
import hmac
import hashlib

from src.database import get_db
from src.services.email_service_with_db import get_email_service_with_db

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/resend")
async def resend_webhook(
    request: Request,
    db: Session = Depends(get_db),
    svix_id: Optional[str] = Header(None),
    svix_timestamp: Optional[str] = Header(None),
    svix_signature: Optional[str] = Header(None)
):
    """
    Handle Resend webhook events for email tracking
    
    Events:
    - email.sent: Email was successfully sent to Resend
    - email.delivered: Email was delivered to recipient's mail server
    - email.delivery_delayed: Email delivery was delayed
    - email.complained: Recipient marked email as spam
    - email.bounced: Email bounced (hard or soft bounce)
    - email.opened: Recipient opened the email
    - email.clicked: Recipient clicked a link in the email
    """
    
    try:
        # Get the raw body for signature verification
        body = await request.body()
        payload = await request.json()
        
        # TODO: Verify webhook signature
        # For production, implement signature verification:
        # 1. Get webhook secret from Resend dashboard
        # 2. Verify svix signature using the secret
        # Example:
        # webhook_secret = settings.RESEND_WEBHOOK_SECRET
        # expected_signature = hmac.new(
        #     webhook_secret.encode(),
        #     body,
        #     hashlib.sha256
        # ).hexdigest()
        # if not hmac.compare_digest(svix_signature, expected_signature):
        #     raise HTTPException(status_code=401, detail="Invalid signature")
        
        event_type = payload.get("type")
        event_data = payload.get("data", {})
        
        logger.info(f"Received Resend webhook event: {event_type}")
        logger.debug(f"Event data: {event_data}")
        
        # Get email service with database
        email_service = get_email_service_with_db(db)
        
        # Process event based on type
        if event_type == "email.sent":
            await handle_email_sent(event_data, email_service)
        elif event_type == "email.delivered":
            await handle_email_delivered(event_data, email_service)
        elif event_type == "email.delivery_delayed":
            await handle_email_delayed(event_data, email_service)
        elif event_type == "email.bounced":
            await handle_email_bounced(event_data, email_service)
        elif event_type == "email.complained":
            await handle_email_complained(event_data, email_service)
        elif event_type == "email.opened":
            await handle_email_opened(event_data, email_service)
        elif event_type == "email.clicked":
            await handle_email_clicked(event_data, email_service)
        else:
            logger.warning(f"Unknown event type: {event_type}")
        
        return {"status": "received", "event": event_type}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_email_sent(data: dict, email_service = None):
    """Handle email.sent event"""
    email_id = data.get("email_id")
    to = data.get("to")
    subject = data.get("subject")
    
    logger.info(f"Email sent - ID: {email_id}, To: {to}, Subject: {subject}")
    
    if email_service:
        email_service.update_email_status(email_id, "sent")

async def handle_email_delivered(data: dict, email_service = None):
    """Handle email.delivered event"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.info(f"Email delivered - ID: {email_id}, To: {to}")
    
    if email_service:
        email_service.update_email_status(email_id, "delivered")

async def handle_email_delayed(data: dict, email_service = None):
    """Handle email.delivery_delayed event"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.warning(f"Email delivery delayed - ID: {email_id}, To: {to}")
    
    if email_service:
        email_service.update_email_status(email_id, "delayed")

async def handle_email_bounced(data: dict, email_service = None):
    """Handle email.bounced event"""
    email_id = data.get("email_id")
    to = data.get("to")
    bounce_type = data.get("bounce_type")  # hard or soft
    reason = data.get("reason")
    
    logger.warning(f"Email bounced - ID: {email_id}, To: {to}, Type: {bounce_type}, Reason: {reason}")
    
    if email_service:
        email_service.update_email_status(
            email_id, 
            "bounced",
            bounce_type=bounce_type,
            bounce_reason=reason
        )

async def handle_email_complained(data: dict, email_service = None):
    """Handle email.complained event (spam complaint)"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.warning(f"Email marked as spam - ID: {email_id}, To: {to}")
    
    if email_service:
        email_service.update_email_status(email_id, "complained")

async def handle_email_opened(data: dict, email_service = None):
    """Handle email.opened event"""
    email_id = data.get("email_id")
    to = data.get("to")
    user_agent = data.get("user_agent")
    
    logger.info(f"Email opened - ID: {email_id}, To: {to}")
    
    if email_service:
        email_service.update_email_status(
            email_id, 
            "opened",
            user_agent=user_agent
        )

async def handle_email_clicked(data: dict, email_service = None):
    """Handle email.clicked event"""
    email_id = data.get("email_id")
    to = data.get("to")
    link = data.get("link")
    user_agent = data.get("user_agent")
    
    logger.info(f"Email link clicked - ID: {email_id}, To: {to}, Link: {link}")
    
    if email_service:
        # Update email status
        email_service.update_email_status(
            email_id, 
            "clicked",
            user_agent=user_agent
        )
        # Log the specific click
        email_service.log_email_click(
            email_id,
            link,
            user_agent=user_agent
        )


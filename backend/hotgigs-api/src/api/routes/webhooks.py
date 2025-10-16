"""
Webhook handlers for external services
"""
from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import logging
import hmac
import hashlib

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/resend")
async def resend_webhook(
    request: Request,
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
        
        # Handle different event types
        if event_type == "email.sent":
            await handle_email_sent(event_data)
            
        elif event_type == "email.delivered":
            await handle_email_delivered(event_data)
            
        elif event_type == "email.delivery_delayed":
            await handle_email_delayed(event_data)
            
        elif event_type == "email.bounced":
            await handle_email_bounced(event_data)
            
        elif event_type == "email.complained":
            await handle_email_complained(event_data)
            
        elif event_type == "email.opened":
            await handle_email_opened(event_data)
            
        elif event_type == "email.clicked":
            await handle_email_clicked(event_data)
            
        else:
            logger.warning(f"Unknown event type: {event_type}")
        
        return {"status": "received", "event": event_type}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_email_sent(data: dict):
    """Handle email.sent event"""
    email_id = data.get("email_id")
    to = data.get("to")
    subject = data.get("subject")
    
    logger.info(f"Email sent - ID: {email_id}, To: {to}, Subject: {subject}")
    
    # TODO: Update email status in database
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "status": "sent",
    #     "sent_at": datetime.now()
    # })

async def handle_email_delivered(data: dict):
    """Handle email.delivered event"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.info(f"Email delivered - ID: {email_id}, To: {to}")
    
    # TODO: Update email status in database
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "status": "delivered",
    #     "delivered_at": datetime.now()
    # })

async def handle_email_delayed(data: dict):
    """Handle email.delivery_delayed event"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.warning(f"Email delivery delayed - ID: {email_id}, To: {to}")
    
    # TODO: Update email status in database
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "status": "delayed"
    # })

async def handle_email_bounced(data: dict):
    """Handle email.bounced event"""
    email_id = data.get("email_id")
    to = data.get("to")
    bounce_type = data.get("bounce_type")  # hard or soft
    
    logger.error(f"Email bounced - ID: {email_id}, To: {to}, Type: {bounce_type}")
    
    # TODO: Update email status and handle bounces
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "status": "bounced",
    #     "bounce_type": bounce_type,
    #     "bounced_at": datetime.now()
    # })
    # 
    # If hard bounce, mark email as invalid:
    # if bounce_type == "hard":
    #     db.query(User).filter(User.email == to).update({
    #         "email_valid": False
    #     })

async def handle_email_complained(data: dict):
    """Handle email.complained event (spam complaint)"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.error(f"Email marked as spam - ID: {email_id}, To: {to}")
    
    # TODO: Update email status and handle complaints
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "status": "complained",
    #     "complained_at": datetime.now()
    # })
    # 
    # Unsubscribe user from marketing emails:
    # db.query(User).filter(User.email == to).update({
    #     "email_notifications": False
    # })

async def handle_email_opened(data: dict):
    """Handle email.opened event"""
    email_id = data.get("email_id")
    to = data.get("to")
    
    logger.info(f"Email opened - ID: {email_id}, To: {to}")
    
    # TODO: Update email analytics
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "opened": True,
    #     "opened_at": datetime.now(),
    #     "open_count": EmailLog.open_count + 1
    # })

async def handle_email_clicked(data: dict):
    """Handle email.clicked event"""
    email_id = data.get("email_id")
    to = data.get("to")
    link = data.get("link")
    
    logger.info(f"Email link clicked - ID: {email_id}, To: {to}, Link: {link}")
    
    # TODO: Update email analytics
    # Example:
    # db.query(EmailLog).filter(EmailLog.email_id == email_id).update({
    #     "clicked": True,
    #     "clicked_at": datetime.now(),
    #     "click_count": EmailLog.click_count + 1
    # })
    # 
    # Track which link was clicked:
    # EmailClick.create({
    #     "email_id": email_id,
    #     "link": link,
    #     "clicked_at": datetime.now()
    # })


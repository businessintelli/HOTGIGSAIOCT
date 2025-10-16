"""
Email analytics dashboard endpoints
"""
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class EmailStats(BaseModel):
    total_sent: int
    delivered: int
    opened: int
    clicked: int
    bounced: int
    complained: int
    delivery_rate: float
    open_rate: float
    click_rate: float

class EmailActivity(BaseModel):
    email_id: str
    recipient: str
    subject: str
    sent_at: str
    status: str  # sent, delivered, opened, clicked, bounced, complained
    opened_at: Optional[str] = None
    clicked_at: Optional[str] = None

class EmailTemplateStats(BaseModel):
    template_name: str
    sent_count: int
    open_rate: float
    click_rate: float
    conversion_rate: float

# Mock data
mock_email_stats = {
    "total_sent": 1250,
    "delivered": 1220,
    "opened": 890,
    "clicked": 420,
    "bounced": 15,
    "complained": 5,
    "delivery_rate": 97.6,
    "open_rate": 72.9,
    "click_rate": 47.2
}

mock_email_activities = [
    {
        "email_id": "1",
        "recipient": "candidate@example.com",
        "subject": "Application Received - Senior Software Engineer",
        "sent_at": "2024-10-15T10:30:00",
        "status": "opened",
        "opened_at": "2024-10-15T11:45:00",
        "clicked_at": "2024-10-15T11:46:00"
    },
    {
        "email_id": "2",
        "recipient": "recruiter@company.com",
        "subject": "New Application - Product Manager",
        "sent_at": "2024-10-15T09:15:00",
        "status": "delivered",
        "opened_at": None,
        "clicked_at": None
    },
    {
        "email_id": "3",
        "recipient": "user@example.com",
        "subject": "Welcome to HotGigs.ai!",
        "sent_at": "2024-10-14T14:20:00",
        "status": "clicked",
        "opened_at": "2024-10-14T15:30:00",
        "clicked_at": "2024-10-14T15:32:00"
    }
]

mock_template_stats = [
    {
        "template_name": "Application Confirmation",
        "sent_count": 450,
        "open_rate": 85.2,
        "click_rate": 62.3,
        "conversion_rate": 45.1
    },
    {
        "template_name": "Interview Invitation",
        "sent_count": 180,
        "open_rate": 92.5,
        "click_rate": 78.9,
        "conversion_rate": 68.3
    },
    {
        "template_name": "Weekly Job Digest",
        "sent_count": 320,
        "open_rate": 58.7,
        "click_rate": 32.1,
        "conversion_rate": 15.4
    },
    {
        "template_name": "Welcome Email",
        "sent_count": 200,
        "open_rate": 76.5,
        "click_rate": 54.2,
        "conversion_rate": 38.9
    }
]

@router.get("/stats", response_model=EmailStats)
async def get_email_stats(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get overall email statistics"""
    # In production, filter by date range
    return mock_email_stats

@router.get("/activity", response_model=List[EmailActivity])
async def get_email_activity(
    limit: int = Query(100, description="Number of records to return"),
    offset: int = Query(0, description="Number of records to skip"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """Get recent email activity"""
    activities = mock_email_activities
    
    if status:
        activities = [a for a in activities if a["status"] == status]
    
    return activities[offset:offset+limit]

@router.get("/templates", response_model=List[EmailTemplateStats])
async def get_template_stats():
    """Get statistics for each email template"""
    return mock_template_stats

@router.get("/trends")
async def get_email_trends(
    days: int = Query(30, description="Number of days to analyze")
):
    """Get email sending trends over time"""
    # Generate mock trend data
    trends = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "sent": 40 + (i % 10) * 5,
            "delivered": 38 + (i % 10) * 5,
            "opened": 28 + (i % 10) * 3,
            "clicked": 15 + (i % 10) * 2
        })
    
    return {
        "period": f"Last {days} days",
        "trends": trends
    }

@router.get("/engagement")
async def get_engagement_metrics():
    """Get detailed engagement metrics"""
    return {
        "average_time_to_open": "2.5 hours",
        "average_time_to_click": "3.2 hours",
        "best_send_time": "10:00 AM",
        "best_send_day": "Tuesday",
        "device_breakdown": {
            "mobile": 45.2,
            "desktop": 42.8,
            "tablet": 12.0
        },
        "email_client_breakdown": {
            "gmail": 52.3,
            "outlook": 28.5,
            "apple_mail": 12.7,
            "other": 6.5
        }
    }

@router.get("/bounces")
async def get_bounce_details():
    """Get detailed bounce information"""
    return {
        "total_bounces": 15,
        "hard_bounces": 8,
        "soft_bounces": 7,
        "bounce_reasons": [
            {"reason": "Invalid email address", "count": 5},
            {"reason": "Mailbox full", "count": 4},
            {"reason": "Server error", "count": 3},
            {"reason": "Blocked by recipient", "count": 2},
            {"reason": "Other", "count": 1}
        ]
    }

@router.get("/complaints")
async def get_complaint_details():
    """Get spam complaint information"""
    return {
        "total_complaints": 5,
        "complaint_rate": 0.4,
        "recent_complaints": [
            {
                "email": "user1@example.com",
                "date": "2024-10-14",
                "template": "Weekly Job Digest"
            },
            {
                "email": "user2@example.com",
                "date": "2024-10-13",
                "template": "Job Recommendations"
            }
        ]
    }


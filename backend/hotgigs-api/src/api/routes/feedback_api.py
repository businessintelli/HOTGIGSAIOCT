"""
Feedback API Routes

Handles recruiter feedback on resume parsing accuracy
and stores data for continuous learning.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.core.database import get_db
from src.core.security import get_current_user
from src.services.continuous_learning import ContinuousLearningSystem
import os

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


# Pydantic models
class FieldCorrection(BaseModel):
    original: str
    corrected: str


class FeedbackSubmission(BaseModel):
    resume_id: str
    candidate_id: str
    overall_rating: str  # 'accurate' | 'needs_correction'
    corrections: dict  # Field name -> FieldCorrection
    comments: Optional[str] = None
    accuracy_score: int


class FeedbackResponse(BaseModel):
    feedback_id: str
    message: str
    accuracy_score: int
    will_be_used_for_training: bool


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackSubmission,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback on resume parsing accuracy.
    
    This endpoint allows recruiters to:
    1. Rate overall parsing accuracy
    2. Correct specific fields
    3. Provide additional comments
    
    High-quality feedback (>90% accuracy) is automatically
    added to the training dataset for model improvement.
    """
    try:
        # Initialize continuous learning system
        learning_system = ContinuousLearningSystem(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Get original parsed data (from database or cache)
        # In production, fetch from your candidate database
        original_data = {
            "full_name": "Original Name",
            "email": "original@email.com",
            # ... other fields
        }
        
        # Build corrected data
        corrected_data = original_data.copy()
        for field, correction in feedback.corrections.items():
            corrected_data[field] = correction['corrected']
        
        # Record feedback in continuous learning system
        feedback_result = learning_system.record_feedback(
            resume_id=feedback.resume_id,
            original_data=original_data,
            corrected_data=corrected_data,
            recruiter_id=current_user['user_id'],
            comments=feedback.comments
        )
        
        # Store feedback in database for audit trail
        # In production, save to feedback table
        
        return FeedbackResponse(
            feedback_id=feedback_result['feedback_id'],
            message="Thank you for your feedback! This helps improve our parsing accuracy.",
            accuracy_score=feedback_result['accuracy_score'],
            will_be_used_for_training=feedback_result['accuracy_score'] >= 90
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )


@router.get("/stats")
async def get_feedback_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get feedback statistics for the current user or system-wide (admin only).
    
    Returns:
    - Total feedback submissions
    - Average accuracy score
    - Number of corrections by field
    - Training data readiness
    """
    try:
        learning_system = ContinuousLearningSystem(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        stats = learning_system.get_learning_stats()
        
        return {
            "total_resumes": stats['total_resumes'],
            "average_accuracy": stats['average_accuracy'],
            "high_quality_examples": stats['high_quality_examples'],
            "ready_for_finetuning": stats['ready_for_finetuning'],
            "field_accuracy": stats.get('field_accuracy', {}),
            "common_errors": stats.get('common_errors', [])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get feedback stats: {str(e)}"
        )


@router.post("/export-training-data")
async def export_training_data(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export training data for OpenAI fine-tuning.
    
    Admin only. Requires at least 100 high-quality examples.
    """
    # Check if user is admin
    if current_user.get('role') != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can export training data"
        )
    
    try:
        learning_system = ContinuousLearningSystem(
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Export training data
        output_file = learning_system.export_training_data(
            output_file="/tmp/resume_training_data.jsonl"
        )
        
        return {
            "message": "Training data exported successfully",
            "file_path": output_file,
            "ready_for_upload": True,
            "next_steps": [
                "1. Download the JSONL file",
                "2. Upload to OpenAI: openai api fine_tunes.create -t resume_training_data.jsonl -m gpt-4.1-mini",
                "3. Wait for fine-tuning to complete",
                "4. Update OPENAI_MODEL_NAME in environment variables"
            ]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export training data: {str(e)}"
        )


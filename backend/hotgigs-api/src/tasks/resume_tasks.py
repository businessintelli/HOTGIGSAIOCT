"""
Celery Tasks for Resume Processing

This module contains all background tasks for resume processing.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict
from celery import Task
from src.core.celery_app import celery_app
from src.services.resume_parser import get_resume_parser
from src.models.resume import Resume, ResumeData, ProcessingJob, JobStatus, ResumeStatus
from src.core.config import settings

logger = logging.getLogger(__name__)


class CallbackTask(Task):
    """Base task with callbacks for progress updates."""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Called when task succeeds."""
        logger.info(f"Task {task_id} succeeded")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called when task fails."""
        logger.error(f"Task {task_id} failed: {exc}")
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Called when task is retried."""
        logger.warning(f"Task {task_id} retrying: {exc}")


@celery_app.task(bind=True, base=CallbackTask, name="src.tasks.resume_tasks.process_resume")
def process_resume(self, resume_id: int, db_session=None):
    """
    Process a single resume in the background.
    
    This is the main task used by all import scenarios:
    - Single candidate upload
    - Bulk recruiter upload
    - Google Drive sync
    - API import
    
    Args:
        resume_id: ID of the resume to process
        db_session: Database session (injected)
    """
    logger.info(f"Starting resume processing for resume_id={resume_id}")
    
    try:
        # Update processing job status
        self.update_state(
            state="PROCESSING",
            meta={
                "current_step": "Initializing",
                "progress": 0
            }
        )
        
        # Get resume from database
        # Note: In production, inject db_session properly
        # resume = db_session.query(Resume).filter(Resume.id == resume_id).first()
        # For now, we'll create a mock implementation
        
        # Step 1: Update status to processing
        update_resume_status(resume_id, ResumeStatus.PROCESSING)
        update_job_progress(resume_id, 10, "Extracting text from document")
        
        # Step 2: Get file path and parse resume
        file_path = get_resume_file_path(resume_id)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        update_job_progress(resume_id, 20, "Running AI-powered parser")
        
        # Step 3: Parse resume using AI parser
        parser = get_resume_parser()
        parsed_data = parser.parse(file_path)
        
        update_job_progress(resume_id, 60, "Structuring extracted data")
        
        # Step 4: Save parsed data to database
        save_resume_data(resume_id, parsed_data)
        
        update_job_progress(resume_id, 80, "Creating candidate profile")
        
        # Step 5: Create or update candidate in database
        create_or_update_candidate(resume_id, parsed_data)
        
        update_job_progress(resume_id, 90, "Matching with jobs")
        
        # Step 6: Trigger matching task
        from src.tasks.matching_tasks import match_candidate_to_jobs
        match_candidate_to_jobs.delay(resume_id)
        
        update_job_progress(resume_id, 100, "Completed")
        
        # Step 7: Mark as completed
        update_resume_status(resume_id, ResumeStatus.COMPLETED)
        complete_processing_job(resume_id)
        
        logger.info(f"Successfully processed resume_id={resume_id}")
        
        return {
            "resume_id": resume_id,
            "status": "completed",
            "parsed_data": parsed_data
        }
        
    except Exception as e:
        logger.error(f"Error processing resume_id={resume_id}: {str(e)}")
        
        # Update status to failed
        update_resume_status(resume_id, ResumeStatus.FAILED, error=str(e))
        fail_processing_job(resume_id, str(e))
        
        # Retry logic
        retry_count = get_retry_count(resume_id)
        if retry_count < 3:
            # Retry with exponential backoff
            raise self.retry(exc=e, countdown=60 * (2 ** retry_count))
        else:
            raise


@celery_app.task(name="src.tasks.resume_tasks.process_bulk_upload")
def process_bulk_upload(batch_id: int, resume_ids: list):
    """
    Process a batch of resumes from bulk upload.
    
    Args:
        batch_id: ID of the bulk upload batch
        resume_ids: List of resume IDs to process
    """
    logger.info(f"Processing bulk upload batch_id={batch_id} with {len(resume_ids)} resumes")
    
    try:
        # Update batch status
        update_batch_status(batch_id, JobStatus.PROCESSING)
        
        # Process each resume asynchronously
        for resume_id in resume_ids:
            process_resume.delay(resume_id)
        
        logger.info(f"Queued {len(resume_ids)} resumes for processing")
        
        return {
            "batch_id": batch_id,
            "total_queued": len(resume_ids)
        }
        
    except Exception as e:
        logger.error(f"Error processing bulk upload batch_id={batch_id}: {str(e)}")
        update_batch_status(batch_id, JobStatus.FAILED)
        raise


@celery_app.task(name="src.tasks.resume_tasks.cleanup_old_jobs")
def cleanup_old_jobs():
    """
    Clean up old completed/failed processing jobs.
    Runs daily via Celery Beat.
    """
    logger.info("Starting cleanup of old processing jobs")
    
    try:
        # Delete jobs older than 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        # Note: Implement actual database cleanup
        # deleted_count = db_session.query(ProcessingJob).filter(
        #     ProcessingJob.completed_at < cutoff_date,
        #     ProcessingJob.status.in_([JobStatus.COMPLETED, JobStatus.FAILED])
        # ).delete()
        
        deleted_count = 0  # Placeholder
        
        logger.info(f"Cleaned up {deleted_count} old processing jobs")
        
        return {"deleted_count": deleted_count}
        
    except Exception as e:
        logger.error(f"Error cleaning up old jobs: {str(e)}")
        raise


# Helper functions (to be implemented with actual database operations)

def update_resume_status(resume_id: int, status: ResumeStatus, error: str = None):
    """Update resume processing status."""
    # TODO: Implement database update
    logger.info(f"Resume {resume_id} status: {status}")
    pass


def update_job_progress(resume_id: int, progress: int, step: str):
    """Update processing job progress."""
    # TODO: Implement database update
    logger.info(f"Resume {resume_id} progress: {progress}% - {step}")
    pass


def get_resume_file_path(resume_id: int) -> str:
    """Get file path for resume."""
    # TODO: Implement database query
    return f"{settings.UPLOAD_DIR}/resume_{resume_id}.pdf"


def save_resume_data(resume_id: int, parsed_data: Dict):
    """Save parsed resume data to database."""
    # TODO: Implement database insert/update
    logger.info(f"Saved parsed data for resume {resume_id}")
    pass


def create_or_update_candidate(resume_id: int, parsed_data: Dict):
    """Create or update candidate profile in database."""
    # TODO: Implement candidate creation/update
    logger.info(f"Created/updated candidate for resume {resume_id}")
    pass


def complete_processing_job(resume_id: int):
    """Mark processing job as completed."""
    # TODO: Implement database update
    logger.info(f"Completed processing job for resume {resume_id}")
    pass


def fail_processing_job(resume_id: int, error: str):
    """Mark processing job as failed."""
    # TODO: Implement database update
    logger.error(f"Failed processing job for resume {resume_id}: {error}")
    pass


def get_retry_count(resume_id: int) -> int:
    """Get current retry count for resume."""
    # TODO: Implement database query
    return 0


def update_batch_status(batch_id: int, status: JobStatus):
    """Update bulk upload batch status."""
    # TODO: Implement database update
    logger.info(f"Batch {batch_id} status: {status}")
    pass


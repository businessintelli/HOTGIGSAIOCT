"""
Celery Configuration for Background Job Processing

This module configures Celery for asynchronous resume processing tasks.
"""

from celery import Celery
from celery.schedules import crontab
from src.core.config import settings

# Create Celery app
celery_app = Celery(
    "hotgigs",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "src.tasks.resume_tasks",
        "src.tasks.matching_tasks",
        "src.tasks.google_drive_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    result_expires=3600,  # 1 hour
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    # Sync Google Drive folders every hour
    "sync-google-drive-folders": {
        "task": "src.tasks.google_drive_tasks.sync_all_active_folders",
        "schedule": crontab(minute=0),  # Every hour
    },
    # Clean up old processing jobs every day
    "cleanup-old-jobs": {
        "task": "src.tasks.resume_tasks.cleanup_old_jobs",
        "schedule": crontab(hour=2, minute=0),  # 2 AM daily
    },
    # Refresh candidate matches every 6 hours
    "refresh-candidate-matches": {
        "task": "src.tasks.matching_tasks.refresh_all_matches",
        "schedule": crontab(hour="*/6"),  # Every 6 hours
    },
}

# Task routes for different queues
celery_app.conf.task_routes = {
    "src.tasks.resume_tasks.*": {"queue": "resume_processing"},
    "src.tasks.matching_tasks.*": {"queue": "matching"},
    "src.tasks.google_drive_tasks.*": {"queue": "google_drive"},
}

# Priority levels
celery_app.conf.task_default_priority = 5


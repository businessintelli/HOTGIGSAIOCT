"""
Celery Tasks for Google Drive Integration

This module contains tasks for syncing resumes from Google Drive folders.
"""

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.credentials import Credentials
import io

from src.core.celery_app import celery_app
from src.core.config import settings
from src.models.resume import GoogleDriveSync, ImportSource
from src.tasks.resume_tasks import process_resume

logger = logging.getLogger(__name__)


@celery_app.task(name="src.tasks.google_drive_tasks.sync_google_drive_folder")
def sync_google_drive_folder(sync_id: int):
    """
    Sync resumes from a Google Drive folder.
    
    Args:
        sync_id: ID of the Google Drive sync configuration
    """
    logger.info(f"Starting Google Drive sync for sync_id={sync_id}")
    
    try:
        # Get sync configuration
        sync_config = get_sync_config(sync_id)
        
        if not sync_config or not sync_config.get("is_active"):
            logger.warning(f"Sync config {sync_id} not found or inactive")
            return
        
        # Build Google Drive service
        service = build_drive_service(sync_config)
        
        # Get files from folder
        files = list_files_in_folder(service, sync_config["folder_id"])
        
        logger.info(f"Found {len(files)} files in Google Drive folder")
        
        # Filter for resume files (PDF, DOCX, DOC)
        resume_files = [
            f for f in files
            if f.get("mimeType") in [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword"
            ]
        ]
        
        logger.info(f"Found {len(resume_files)} resume files")
        
        # Download and process each resume
        processed_count = 0
        failed_count = 0
        
        for file in resume_files:
            try:
                # Check if already processed
                if is_file_already_processed(sync_id, file["id"]):
                    logger.info(f"File {file['name']} already processed, skipping")
                    continue
                
                # Download file
                file_path = download_file(service, file["id"], file["name"])
                
                # Create resume record
                resume_id = create_resume_record(
                    file_path=file_path,
                    filename=file["name"],
                    uploaded_by_id=sync_config["recruiter_id"],
                    import_source=ImportSource.GOOGLE_DRIVE,
                    google_drive_file_id=file["id"]
                )
                
                # Queue for processing
                process_resume.delay(resume_id)
                
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing file {file['name']}: {str(e)}")
                failed_count += 1
        
        # Update sync statistics
        update_sync_statistics(
            sync_id,
            total_synced=len(resume_files),
            processed=processed_count,
            failed=failed_count
        )
        
        logger.info(f"Sync completed: {processed_count} processed, {failed_count} failed")
        
        return {
            "sync_id": sync_id,
            "total_files": len(resume_files),
            "processed": processed_count,
            "failed": failed_count
        }
        
    except Exception as e:
        logger.error(f"Error syncing Google Drive folder sync_id={sync_id}: {str(e)}")
        raise


@celery_app.task(name="src.tasks.google_drive_tasks.sync_all_active_folders")
def sync_all_active_folders():
    """
    Sync all active Google Drive folders.
    Runs hourly via Celery Beat.
    """
    logger.info("Starting sync of all active Google Drive folders")
    
    try:
        # Get all active sync configurations
        active_syncs = get_active_sync_configs()
        
        logger.info(f"Found {len(active_syncs)} active sync configurations")
        
        # Queue sync tasks
        for sync in active_syncs:
            # Check if it's time to sync
            if should_sync_now(sync):
                sync_google_drive_folder.delay(sync["id"])
        
        return {
            "total_active_syncs": len(active_syncs),
            "syncs_queued": sum(1 for s in active_syncs if should_sync_now(s))
        }
        
    except Exception as e:
        logger.error(f"Error syncing all folders: {str(e)}")
        raise


def build_drive_service(sync_config: Dict):
    """Build Google Drive API service."""
    try:
        credentials = Credentials(
            token=sync_config["access_token"],
            refresh_token=sync_config["refresh_token"],
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET
        )
        
        service = build("drive", "v3", credentials=credentials)
        return service
        
    except Exception as e:
        logger.error(f"Error building Drive service: {str(e)}")
        raise


def list_files_in_folder(service, folder_id: str) -> List[Dict]:
    """List all files in a Google Drive folder."""
    try:
        results = service.files().list(
            q=f"'{folder_id}' in parents and trashed=false",
            fields="files(id, name, mimeType, createdTime, modifiedTime)",
            pageSize=100
        ).execute()
        
        files = results.get("files", [])
        return files
        
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise


def download_file(service, file_id: str, filename: str) -> str:
    """Download a file from Google Drive."""
    try:
        request = service.files().get_media(fileId=file_id)
        
        # Create upload directory if it doesn't exist
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"gdrive_{timestamp}_{filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
        
        # Download file
        fh = io.FileIO(file_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
            logger.info(f"Download {int(status.progress() * 100)}%")
        
        fh.close()
        
        logger.info(f"Downloaded file to {file_path}")
        return file_path
        
    except Exception as e:
        logger.error(f"Error downloading file {file_id}: {str(e)}")
        raise


# Helper functions (to be implemented with actual database operations)

def get_sync_config(sync_id: int) -> Dict:
    """Get Google Drive sync configuration."""
    # TODO: Implement database query
    return {}


def get_active_sync_configs() -> List[Dict]:
    """Get all active sync configurations."""
    # TODO: Implement database query
    return []


def is_file_already_processed(sync_id: int, file_id: str) -> bool:
    """Check if file has already been processed."""
    # TODO: Implement database query
    return False


def create_resume_record(file_path: str, filename: str, uploaded_by_id: int, 
                         import_source: ImportSource, google_drive_file_id: str = None) -> int:
    """Create resume record in database."""
    # TODO: Implement database insert
    return 1


def update_sync_statistics(sync_id: int, total_synced: int, processed: int, failed: int):
    """Update sync statistics."""
    # TODO: Implement database update
    logger.info(f"Updated sync statistics for sync_id={sync_id}")
    pass


def should_sync_now(sync: Dict) -> bool:
    """Check if sync should run now based on schedule."""
    if not sync.get("next_sync_at"):
        return True
    
    next_sync = sync["next_sync_at"]
    if isinstance(next_sync, str):
        next_sync = datetime.fromisoformat(next_sync)
    
    return datetime.utcnow() >= next_sync


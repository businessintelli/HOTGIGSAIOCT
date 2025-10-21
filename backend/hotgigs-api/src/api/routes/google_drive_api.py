"""
Google Drive Integration API Endpoints

This module provides API endpoints for Google Drive folder sync configuration
and management for automatic resume import.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import uuid

from src.db.session import get_db
from src.models.user import User, UserRole
from src.models.resume import GoogleDriveSync
from src.core.security import get_current_user
# Optional Google Drive tasks
try:
    from src.tasks.google_drive_tasks import sync_google_drive_folder
    GOOGLE_DRIVE_AVAILABLE = True
except ImportError:
    GOOGLE_DRIVE_AVAILABLE = False
    def sync_google_drive_folder(*args, **kwargs):
        pass

router = APIRouter(prefix="/api/google-drive", tags=["Google Drive"])


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class GoogleDriveSyncCreate(BaseModel):
    """Request to create Google Drive sync"""
    folder_id: str
    folder_name: Optional[str] = None
    sync_frequency: str = "daily"  # daily, weekly, manual
    access_token: str
    refresh_token: str


class GoogleDriveSyncUpdate(BaseModel):
    """Request to update Google Drive sync"""
    folder_name: Optional[str] = None
    sync_frequency: Optional[str] = None
    is_active: Optional[bool] = None


class GoogleDriveSyncResponse(BaseModel):
    """Response for Google Drive sync"""
    id: str
    folder_id: str
    folder_name: Optional[str] = None
    is_active: bool
    sync_frequency: str
    last_sync_at: Optional[datetime] = None
    next_sync_at: Optional[datetime] = None
    total_files_synced: int
    total_files_processed: int
    total_files_failed: int
    created_at: datetime


class SyncTriggerResponse(BaseModel):
    """Response for manual sync trigger"""
    message: str
    sync_id: str
    task_id: str


# ============================================================================
# GOOGLE DRIVE SYNC ENDPOINTS
# ============================================================================

@router.post("/setup", response_model=GoogleDriveSyncResponse)
async def setup_google_drive_sync(
    sync_data: GoogleDriveSyncCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Setup Google Drive folder sync for automatic resume import.
    
    Only available to recruiters and admins.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can setup Google Drive sync"
        )
    
    # Validate sync frequency
    valid_frequencies = ["daily", "weekly", "manual"]
    if sync_data.sync_frequency not in valid_frequencies:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sync frequency. Must be one of: {', '.join(valid_frequencies)}"
        )
    
    # Check if folder already synced
    existing = db.query(GoogleDriveSync).filter(
        and_(
            GoogleDriveSync.recruiter_id == current_user.id,
            GoogleDriveSync.folder_id == sync_data.folder_id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This folder is already configured for sync"
        )
    
    # Calculate next sync time
    next_sync_at = None
    if sync_data.sync_frequency == "daily":
        next_sync_at = datetime.utcnow() + timedelta(days=1)
    elif sync_data.sync_frequency == "weekly":
        next_sync_at = datetime.utcnow() + timedelta(weeks=1)
    
    # Create sync configuration
    sync = GoogleDriveSync(
        recruiter_id=current_user.id,
        folder_id=sync_data.folder_id,
        folder_name=sync_data.folder_name,
        access_token=sync_data.access_token,  # TODO: Encrypt tokens
        refresh_token=sync_data.refresh_token,  # TODO: Encrypt tokens
        sync_frequency=sync_data.sync_frequency,
        next_sync_at=next_sync_at,
        is_active=True
    )
    db.add(sync)
    db.commit()
    db.refresh(sync)
    
    # Trigger initial sync
    if sync_data.sync_frequency != "manual":
        sync_google_drive_folder.delay(str(sync.id))
    
    return GoogleDriveSyncResponse(
        id=str(sync.id),
        folder_id=sync.folder_id,
        folder_name=sync.folder_name,
        is_active=sync.is_active,
        sync_frequency=sync.sync_frequency,
        last_sync_at=sync.last_sync_at,
        next_sync_at=sync.next_sync_at,
        total_files_synced=sync.total_files_synced,
        total_files_processed=sync.total_files_processed,
        total_files_failed=sync.total_files_failed,
        created_at=sync.created_at
    )


@router.get("/syncs", response_model=List[GoogleDriveSyncResponse])
async def list_google_drive_syncs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all Google Drive sync configurations for current user"""
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can access Google Drive syncs"
        )
    
    # Get syncs
    syncs = db.query(GoogleDriveSync).filter(
        GoogleDriveSync.recruiter_id == current_user.id
    ).order_by(GoogleDriveSync.created_at.desc()).all()
    
    return [
        GoogleDriveSyncResponse(
            id=str(sync.id),
            folder_id=sync.folder_id,
            folder_name=sync.folder_name,
            is_active=sync.is_active,
            sync_frequency=sync.sync_frequency,
            last_sync_at=sync.last_sync_at,
            next_sync_at=sync.next_sync_at,
            total_files_synced=sync.total_files_synced,
            total_files_processed=sync.total_files_processed,
            total_files_failed=sync.total_files_failed,
            created_at=sync.created_at
        )
        for sync in syncs
    ]


@router.get("/syncs/{sync_id}", response_model=GoogleDriveSyncResponse)
async def get_google_drive_sync(
    sync_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific Google Drive sync"""
    # Get sync
    sync = db.query(GoogleDriveSync).filter(GoogleDriveSync.id == sync_id).first()
    if not sync:
        raise HTTPException(status_code=404, detail="Sync configuration not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and sync.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return GoogleDriveSyncResponse(
        id=str(sync.id),
        folder_id=sync.folder_id,
        folder_name=sync.folder_name,
        is_active=sync.is_active,
        sync_frequency=sync.sync_frequency,
        last_sync_at=sync.last_sync_at,
        next_sync_at=sync.next_sync_at,
        total_files_synced=sync.total_files_synced,
        total_files_processed=sync.total_files_processed,
        total_files_failed=sync.total_files_failed,
        created_at=sync.created_at
    )


@router.put("/syncs/{sync_id}", response_model=GoogleDriveSyncResponse)
async def update_google_drive_sync(
    sync_id: str,
    sync_data: GoogleDriveSyncUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update Google Drive sync configuration"""
    # Get sync
    sync = db.query(GoogleDriveSync).filter(GoogleDriveSync.id == sync_id).first()
    if not sync:
        raise HTTPException(status_code=404, detail="Sync configuration not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and sync.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    if sync_data.folder_name is not None:
        sync.folder_name = sync_data.folder_name
    
    if sync_data.sync_frequency is not None:
        valid_frequencies = ["daily", "weekly", "manual"]
        if sync_data.sync_frequency not in valid_frequencies:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sync frequency. Must be one of: {', '.join(valid_frequencies)}"
            )
        sync.sync_frequency = sync_data.sync_frequency
        
        # Update next sync time
        if sync_data.sync_frequency == "daily":
            sync.next_sync_at = datetime.utcnow() + timedelta(days=1)
        elif sync_data.sync_frequency == "weekly":
            sync.next_sync_at = datetime.utcnow() + timedelta(weeks=1)
        else:
            sync.next_sync_at = None
    
    if sync_data.is_active is not None:
        sync.is_active = sync_data.is_active
    
    db.commit()
    db.refresh(sync)
    
    return GoogleDriveSyncResponse(
        id=str(sync.id),
        folder_id=sync.folder_id,
        folder_name=sync.folder_name,
        is_active=sync.is_active,
        sync_frequency=sync.sync_frequency,
        last_sync_at=sync.last_sync_at,
        next_sync_at=sync.next_sync_at,
        total_files_synced=sync.total_files_synced,
        total_files_processed=sync.total_files_processed,
        total_files_failed=sync.total_files_failed,
        created_at=sync.created_at
    )


@router.post("/syncs/{sync_id}/sync", response_model=SyncTriggerResponse)
async def trigger_manual_sync(
    sync_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually trigger a Google Drive folder sync"""
    # Get sync
    sync = db.query(GoogleDriveSync).filter(GoogleDriveSync.id == sync_id).first()
    if not sync:
        raise HTTPException(status_code=404, detail="Sync configuration not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and sync.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if active
    if not sync.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot sync inactive configuration. Please activate it first."
        )
    
    # Trigger sync
    task = sync_google_drive_folder.delay(str(sync.id))
    
    return SyncTriggerResponse(
        message="Sync triggered successfully",
        sync_id=str(sync.id),
        task_id=task.id
    )


@router.delete("/syncs/{sync_id}")
async def delete_google_drive_sync(
    sync_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a Google Drive sync configuration"""
    # Get sync
    sync = db.query(GoogleDriveSync).filter(GoogleDriveSync.id == sync_id).first()
    if not sync:
        raise HTTPException(status_code=404, detail="Sync configuration not found")
    
    # Check access
    if current_user.role != UserRole.ADMIN and sync.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Delete sync
    db.delete(sync)
    db.commit()
    
    return {"message": "Sync configuration deleted successfully"}


# ============================================================================
# OAUTH ENDPOINTS
# ============================================================================

@router.get("/auth/url")
async def get_google_drive_auth_url(
    current_user: User = Depends(get_current_user)
):
    """
    Get Google Drive OAuth authorization URL.
    
    This endpoint returns the URL that users should visit to authorize
    the application to access their Google Drive.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can setup Google Drive sync"
        )
    
    # TODO: Implement actual OAuth flow
    # For now, return placeholder
    return {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
        "message": "Visit this URL to authorize Google Drive access"
    }


@router.post("/auth/callback")
async def google_drive_auth_callback(
    code: str = Query(..., description="Authorization code from Google"),
    current_user: User = Depends(get_current_user)
):
    """
    Handle Google Drive OAuth callback.
    
    This endpoint receives the authorization code from Google and exchanges
    it for access and refresh tokens.
    """
    # Check permissions
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters and admins can setup Google Drive sync"
        )
    
    # TODO: Implement actual OAuth token exchange
    # For now, return placeholder
    return {
        "access_token": "placeholder_access_token",
        "refresh_token": "placeholder_refresh_token",
        "expires_in": 3600,
        "message": "Authorization successful"
    }


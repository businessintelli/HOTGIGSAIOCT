"""
WebSocket Manager for Real-time Updates

This module provides WebSocket functionality for real-time updates
in the resume import system, including progress tracking, notifications,
and status changes.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for real-time updates.
    
    Features:
    - User-based connection management
    - Room-based broadcasting (e.g., all recruiters)
    - Personal notifications
    - Progress updates
    """
    
    def __init__(self):
        # User ID -> List of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Room name -> Set of user IDs
        self.rooms: Dict[str, Set[str]] = {}
        
        # Resume ID -> User ID (for progress tracking)
        self.resume_watchers: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            # Clean up if no more connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Remove from all rooms
                for room_users in self.rooms.values():
                    room_users.discard(user_id)
        
        logger.info(f"User {user_id} disconnected")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user"""
        if user_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.disconnect(connection, user_id)
    
    async def broadcast_to_room(self, message: dict, room: str):
        """Broadcast a message to all users in a room"""
        if room in self.rooms:
            for user_id in self.rooms[room]:
                await self.send_personal_message(message, user_id)
    
    def join_room(self, user_id: str, room: str):
        """Add a user to a room"""
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(user_id)
        logger.info(f"User {user_id} joined room {room}")
    
    def leave_room(self, user_id: str, room: str):
        """Remove a user from a room"""
        if room in self.rooms:
            self.rooms[room].discard(user_id)
            if not self.rooms[room]:
                del self.rooms[room]
        logger.info(f"User {user_id} left room {room}")
    
    def watch_resume(self, user_id: str, resume_id: str):
        """Register a user to watch resume processing updates"""
        if resume_id not in self.resume_watchers:
            self.resume_watchers[resume_id] = set()
        self.resume_watchers[resume_id].add(user_id)
    
    def unwatch_resume(self, user_id: str, resume_id: str):
        """Unregister a user from watching resume processing"""
        if resume_id in self.resume_watchers:
            self.resume_watchers[resume_id].discard(user_id)
            if not self.resume_watchers[resume_id]:
                del self.resume_watchers[resume_id]
    
    async def send_resume_progress(self, resume_id: str, progress_data: dict):
        """Send resume processing progress to all watchers"""
        if resume_id in self.resume_watchers:
            message = {
                "type": "resume_progress",
                "resume_id": resume_id,
                "data": progress_data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            for user_id in self.resume_watchers[resume_id]:
                await self.send_personal_message(message, user_id)


# Global connection manager instance
manager = ConnectionManager()


async def send_notification(user_id: str, notification_type: str, data: dict):
    """
    Send a notification to a user via WebSocket.
    
    Args:
        user_id: User ID to send notification to
        notification_type: Type of notification (resume_completed, match_found, etc.)
        data: Notification data
    """
    message = {
        "type": "notification",
        "notification_type": notification_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await manager.send_personal_message(message, user_id)


async def send_resume_status_update(resume_id: str, status: str, progress: int, current_step: str = None, error: str = None):
    """
    Send resume processing status update to all watchers.
    
    Args:
        resume_id: Resume ID
        status: Processing status (uploaded, processing, completed, failed)
        progress: Progress percentage (0-100)
        current_step: Current processing step description
        error: Error message if failed
    """
    progress_data = {
        "status": status,
        "progress": progress,
        "current_step": current_step,
        "error": error
    }
    
    await manager.send_resume_progress(resume_id, progress_data)


async def notify_resume_completed(user_id: str, resume_id: str, candidate_id: str, candidate_name: str):
    """
    Notify user that resume processing is completed.
    
    Args:
        user_id: User ID to notify
        resume_id: Resume ID
        candidate_id: Candidate ID
        candidate_name: Candidate name
    """
    await send_notification(
        user_id=user_id,
        notification_type="resume_completed",
        data={
            "resume_id": resume_id,
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "message": f"Resume for {candidate_name} has been processed successfully"
        }
    )


async def notify_candidate_added(recruiter_id: str, candidate_id: str, candidate_name: str, source: str):
    """
    Notify recruiter that a new candidate has been added to their database.
    
    Args:
        recruiter_id: Recruiter ID to notify
        candidate_id: Candidate ID
        candidate_name: Candidate name
        source: Source of candidate (resume_import, bulk_upload, etc.)
    """
    await send_notification(
        user_id=recruiter_id,
        notification_type="candidate_added",
        data={
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "source": source,
            "message": f"New candidate {candidate_name} added from {source}"
        }
    )


async def notify_match_found(user_id: str, match_id: str, match_score: float, job_title: str = None, candidate_name: str = None):
    """
    Notify user that a new high-quality match has been found.
    
    Args:
        user_id: User ID to notify
        match_id: Match ID
        match_score: Match score (0-100)
        job_title: Job title (for candidate notifications)
        candidate_name: Candidate name (for recruiter notifications)
    """
    if job_title:
        message = f"New {match_score:.0f}% match found: {job_title}"
    elif candidate_name:
        message = f"New {match_score:.0f}% match found: {candidate_name}"
    else:
        message = f"New {match_score:.0f}% match found"
    
    await send_notification(
        user_id=user_id,
        notification_type="match_found",
        data={
            "match_id": match_id,
            "match_score": match_score,
            "job_title": job_title,
            "candidate_name": candidate_name,
            "message": message
        }
    )


async def notify_candidate_shared(recruiter_id: str, candidate_id: str, candidate_name: str, shared_by: str):
    """
    Notify recruiter that a candidate has been shared with them.
    
    Args:
        recruiter_id: Recruiter ID to notify
        candidate_id: Candidate ID
        candidate_name: Candidate name
        shared_by: Name of person who shared
    """
    await send_notification(
        user_id=recruiter_id,
        notification_type="candidate_shared",
        data={
            "candidate_id": candidate_id,
            "candidate_name": candidate_name,
            "shared_by": shared_by,
            "message": f"{shared_by} shared candidate {candidate_name} with you"
        }
    )


async def notify_bulk_upload_completed(user_id: str, batch_id: str, total_files: int, successful: int, failed: int):
    """
    Notify user that bulk upload processing is completed.
    
    Args:
        user_id: User ID to notify
        batch_id: Bulk upload batch ID
        total_files: Total files in batch
        successful: Number of successfully processed files
        failed: Number of failed files
    """
    await send_notification(
        user_id=user_id,
        notification_type="bulk_upload_completed",
        data={
            "batch_id": batch_id,
            "total_files": total_files,
            "successful": successful,
            "failed": failed,
            "message": f"Bulk upload completed: {successful}/{total_files} successful"
        }
    )


async def notify_google_drive_sync_completed(user_id: str, sync_id: str, folder_name: str, new_files: int):
    """
    Notify user that Google Drive sync is completed.
    
    Args:
        user_id: User ID to notify
        sync_id: Sync configuration ID
        folder_name: Folder name
        new_files: Number of new files synced
    """
    await send_notification(
        user_id=user_id,
        notification_type="google_drive_sync_completed",
        data={
            "sync_id": sync_id,
            "folder_name": folder_name,
            "new_files": new_files,
            "message": f"Google Drive sync completed: {new_files} new resumes from {folder_name}"
        }
    )


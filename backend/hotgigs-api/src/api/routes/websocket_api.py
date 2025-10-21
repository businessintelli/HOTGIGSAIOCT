"""
WebSocket API Endpoints

This module provides WebSocket endpoints for real-time updates
in the resume import system.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.orm import Session
import json
import logging

from src.db.session import get_db
from src.models.user import User
from src.core.websocket import manager
from src.core.security_ws import get_current_user_ws

router = APIRouter(prefix="/ws", tags=["WebSocket"])
logger = logging.getLogger(__name__)


@router.websocket("/connect")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token"),
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time updates.
    
    Clients should connect to this endpoint with their JWT token:
    ws://api.hotgigs.ai/ws/connect?token=<jwt_token>
    
    Message Types Received:
    - ping: Keep-alive ping
    - watch_resume: Start watching resume processing
    - unwatch_resume: Stop watching resume processing
    - join_room: Join a notification room
    - leave_room: Leave a notification room
    
    Message Types Sent:
    - pong: Response to ping
    - resume_progress: Resume processing progress update
    - notification: User notification
    - error: Error message
    """
    
    # Authenticate user
    try:
        user = await get_current_user_ws(token, db)
        if not user:
            await websocket.close(code=1008, reason="Authentication failed")
            return
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    user_id = str(user.id)
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
            "message": "WebSocket connection established"
        })
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                message_type = message.get("type")
                
                if message_type == "ping":
                    # Respond to ping
                    await websocket.send_json({"type": "pong"})
                
                elif message_type == "watch_resume":
                    # Start watching resume processing
                    resume_id = message.get("resume_id")
                    if resume_id:
                        manager.watch_resume(user_id, resume_id)
                        await websocket.send_json({
                            "type": "watching",
                            "resume_id": resume_id,
                            "message": f"Now watching resume {resume_id}"
                        })
                
                elif message_type == "unwatch_resume":
                    # Stop watching resume processing
                    resume_id = message.get("resume_id")
                    if resume_id:
                        manager.unwatch_resume(user_id, resume_id)
                        await websocket.send_json({
                            "type": "unwatched",
                            "resume_id": resume_id,
                            "message": f"Stopped watching resume {resume_id}"
                        })
                
                elif message_type == "join_room":
                    # Join a notification room
                    room = message.get("room")
                    if room:
                        manager.join_room(user_id, room)
                        await websocket.send_json({
                            "type": "joined_room",
                            "room": room,
                            "message": f"Joined room {room}"
                        })
                
                elif message_type == "leave_room":
                    # Leave a notification room
                    room = message.get("room")
                    if room:
                        manager.leave_room(user_id, room)
                        await websocket.send_json({
                            "type": "left_room",
                            "room": room,
                            "message": f"Left room {room}"
                        })
                
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Unknown message type: {message_type}"
                    })
            
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON message"
                })
            
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Error processing message"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"WebSocket disconnected for user {user_id}")
    
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)


@router.get("/status")
async def websocket_status():
    """
    Get WebSocket server status.
    
    Returns information about active connections and rooms.
    """
    return {
        "active_connections": len(manager.active_connections),
        "active_users": list(manager.active_connections.keys()),
        "rooms": {room: len(users) for room, users in manager.rooms.items()},
        "resume_watchers": {resume_id: len(users) for resume_id, users in manager.resume_watchers.items()}
    }


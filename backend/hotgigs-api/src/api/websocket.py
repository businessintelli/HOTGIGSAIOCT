"""
WebSocket API Endpoints for Real-time Features
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from typing import Optional
import json
import logging

from src.realtime.websocket_manager import manager
from src.core.security import get_current_user_ws

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    """
    Main WebSocket endpoint for real-time features
    
    Connect with: ws://localhost:8000/api/ws?token=YOUR_JWT_TOKEN
    """
    # Authenticate user
    try:
        # For now, extract user_id from token
        # In production, validate JWT token properly
        if not token:
            await websocket.close(code=1008, reason="Missing authentication token")
            return
        
        # TODO: Properly validate JWT token
        # For now, use a simple user_id extraction
        user_id = token  # Simplified for demo
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        await websocket.close(code=1008, reason="Authentication failed")
        return
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to HotGigs.ai real-time server",
            "user_id": user_id
        })
        
        # Handle incoming messages
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            # Handle different message types
            if message_type == "ping":
                # Heartbeat
                await manager.heartbeat(user_id)
                await websocket.send_json({"type": "pong"})
            
            elif message_type == "join_room":
                # Join a room (job, company, conversation)
                room_id = message.get("room_id")
                if room_id:
                    await manager.join_room(user_id, room_id)
                    await websocket.send_json({
                        "type": "joined_room",
                        "room_id": room_id
                    })
            
            elif message_type == "leave_room":
                # Leave a room
                room_id = message.get("room_id")
                if room_id:
                    await manager.leave_room(user_id, room_id)
                    await websocket.send_json({
                        "type": "left_room",
                        "room_id": room_id
                    })
            
            elif message_type == "typing":
                # Broadcast typing indicator
                room_id = message.get("room_id")
                if room_id:
                    await manager.broadcast_to_room(room_id, {
                        "type": "user_typing",
                        "user_id": user_id,
                        "room_id": room_id
                    }, exclude_user=user_id)
            
            elif message_type == "stop_typing":
                # Broadcast stop typing
                room_id = message.get("room_id")
                if room_id:
                    await manager.broadcast_to_room(room_id, {
                        "type": "user_stop_typing",
                        "user_id": user_id,
                        "room_id": room_id
                    }, exclude_user=user_id)
            
            else:
                # Unknown message type
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
        logger.info(f"User {user_id} disconnected")
    
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

@router.get("/ws/status")
async def websocket_status():
    """Get WebSocket server status"""
    return {
        "status": "running",
        "online_users": len(manager.get_online_users()),
        "active_rooms": len(manager.rooms),
        "users": manager.get_online_users()
    }

@router.get("/ws/rooms")
async def get_rooms():
    """Get all active rooms"""
    return {
        "rooms": {
            room_id: list(members)
            for room_id, members in manager.rooms.items()
        }
    }

@router.get("/ws/users/{user_id}/status")
async def get_user_status(user_id: str):
    """Check if a user is online"""
    return {
        "user_id": user_id,
        "online": manager.is_user_online(user_id),
        "last_seen": manager.user_presence.get(user_id)
    }


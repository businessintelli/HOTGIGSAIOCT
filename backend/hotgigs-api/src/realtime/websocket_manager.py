"""
WebSocket Connection Manager for Real-time Features
Handles WebSocket connections, broadcasting, and room management
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasting"""
    
    def __init__(self):
        # Active connections: {user_id: [websockets]}
        self.active_connections: Dict[str, List[WebSocket]] = {}
        
        # Room subscriptions: {room_id: {user_ids}}
        self.rooms: Dict[str, Set[str]] = {}
        
        # User presence: {user_id: last_seen}
        self.user_presence: Dict[str, datetime] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        
        self.active_connections[user_id].append(websocket)
        self.user_presence[user_id] = datetime.utcnow()
        
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
        
        # Notify others that user is online
        await self.broadcast_user_status(user_id, "online")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            
            # Remove user if no more connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                if user_id in self.user_presence:
                    del self.user_presence[user_id]
                
                logger.info(f"User {user_id} disconnected")
                
                # Notify others that user is offline
                asyncio.create_task(self.broadcast_user_status(user_id, "offline"))
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to a specific user (all their connections)"""
        if user_id in self.active_connections:
            message_json = json.dumps(message)
            
            # Send to all user's connections
            disconnected = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    logger.error(f"Error sending to {user_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
    
    async def broadcast(self, message: dict, exclude_user: str = None):
        """Broadcast message to all connected users"""
        message_json = json.dumps(message)
        
        for user_id, connections in list(self.active_connections.items()):
            if exclude_user and user_id == exclude_user:
                continue
            
            disconnected = []
            for connection in connections:
                try:
                    await connection.send_text(message_json)
                except Exception as e:
                    logger.error(f"Error broadcasting to {user_id}: {e}")
                    disconnected.append(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.disconnect(conn, user_id)
    
    async def join_room(self, user_id: str, room_id: str):
        """Add user to a room (e.g., job, company)"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        
        self.rooms[room_id].add(user_id)
        logger.info(f"User {user_id} joined room {room_id}")
        
        # Notify room members
        await self.broadcast_to_room(room_id, {
            "type": "user_joined_room",
            "user_id": user_id,
            "room_id": room_id,
            "timestamp": datetime.utcnow().isoformat()
        }, exclude_user=user_id)
    
    async def leave_room(self, user_id: str, room_id: str):
        """Remove user from a room"""
        if room_id in self.rooms and user_id in self.rooms[room_id]:
            self.rooms[room_id].remove(user_id)
            
            # Remove room if empty
            if not self.rooms[room_id]:
                del self.rooms[room_id]
            
            logger.info(f"User {user_id} left room {room_id}")
            
            # Notify room members
            await self.broadcast_to_room(room_id, {
                "type": "user_left_room",
                "user_id": user_id,
                "room_id": room_id,
                "timestamp": datetime.utcnow().isoformat()
            })
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast message to all users in a room"""
        if room_id not in self.rooms:
            return
        
        for user_id in self.rooms[room_id]:
            if exclude_user and user_id == exclude_user:
                continue
            
            await self.send_personal_message(message, user_id)
    
    async def broadcast_user_status(self, user_id: str, status: str):
        """Broadcast user online/offline status"""
        message = {
            "type": "user_status",
            "user_id": user_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message, exclude_user=user_id)
    
    async def send_notification(self, user_id: str, notification: dict):
        """Send real-time notification to user"""
        message = {
            "type": "notification",
            "data": notification,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(message, user_id)
    
    async def broadcast_application_update(self, job_id: str, application_data: dict):
        """Broadcast application status update to job room"""
        room_id = f"job_{job_id}"
        message = {
            "type": "application_update",
            "job_id": job_id,
            "data": application_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_room(room_id, message)
    
    async def broadcast_new_application(self, job_id: str, application_data: dict):
        """Broadcast new application to job room"""
        room_id = f"job_{job_id}"
        message = {
            "type": "new_application",
            "job_id": job_id,
            "data": application_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_room(room_id, message)
    
    async def broadcast_message(self, conversation_id: str, message_data: dict):
        """Broadcast new message in conversation"""
        room_id = f"conversation_{conversation_id}"
        message = {
            "type": "new_message",
            "conversation_id": conversation_id,
            "data": message_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_room(room_id, message)
    
    async def broadcast_comment(self, application_id: str, comment_data: dict):
        """Broadcast new comment on application"""
        room_id = f"application_{application_id}"
        message = {
            "type": "new_comment",
            "application_id": application_id,
            "data": comment_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast_to_room(room_id, message)
    
    def get_online_users(self) -> List[str]:
        """Get list of currently online users"""
        return list(self.active_connections.keys())
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if user is currently online"""
        return user_id in self.active_connections
    
    def get_room_members(self, room_id: str) -> Set[str]:
        """Get all members in a room"""
        return self.rooms.get(room_id, set())
    
    async def heartbeat(self, user_id: str):
        """Update user's last seen timestamp"""
        if user_id in self.user_presence:
            self.user_presence[user_id] = datetime.utcnow()

# Global connection manager instance
manager = ConnectionManager()


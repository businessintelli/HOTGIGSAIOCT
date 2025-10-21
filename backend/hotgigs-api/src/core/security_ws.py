"""
WebSocket Authentication Helper

This module provides authentication for WebSocket connections.
"""

from jose import jwt, JWTError
from sqlalchemy.orm import Session
from src.models.user import User
from src.core.config import settings


async def get_current_user_ws(token: str, db: Session) -> User:
    """
    Get current user from JWT token for WebSocket connections.
    
    Args:
        token: JWT token
        db: Database session
    
    Returns:
        User object if authentication successful, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user


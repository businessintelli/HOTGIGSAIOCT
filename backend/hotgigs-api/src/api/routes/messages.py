from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ...db.session import get_db
from ...models.message import Conversation, Message, ConversationStatus, MessageType
from ...models.user import User
from ...core.security import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])


# Pydantic models
class MessageCreate(BaseModel):
    content: str
    message_type: MessageType = MessageType.TEXT
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: str
    message_type: MessageType
    content: str
    file_url: Optional[str]
    file_name: Optional[str]
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    recruiter_id: str
    job_id: Optional[int] = None
    application_id: Optional[int] = None
    subject: Optional[str] = None
    initial_message: str


class ConversationResponse(BaseModel):
    id: int
    candidate_id: str
    recruiter_id: str
    job_id: Optional[int]
    application_id: Optional[int]
    subject: Optional[str]
    status: ConversationStatus
    created_at: datetime
    last_message_at: datetime
    unread_count: Optional[int] = 0
    last_message: Optional[MessageResponse] = None
    
    class Config:
        from_attributes = True


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    status: Optional[ConversationStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for the current user"""
    query = db.query(Conversation).filter(
        (Conversation.candidate_id == current_user.id) | 
        (Conversation.recruiter_id == current_user.id)
    )
    
    if status:
        query = query.filter(Conversation.status == status)
    
    conversations = query.order_by(Conversation.last_message_at.desc()).all()
    
    # Add unread count and last message for each conversation
    result = []
    for conv in conversations:
        conv_dict = ConversationResponse.from_orm(conv).dict()
        
        # Get unread count
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read == False
        ).count()
        conv_dict['unread_count'] = unread_count
        
        # Get last message
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()
        
        if last_message:
            conv_dict['last_message'] = MessageResponse.from_orm(last_message)
        
        result.append(conv_dict)
    
    return result


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    # Check if conversation already exists
    existing = db.query(Conversation).filter(
        Conversation.candidate_id == current_user.id,
        Conversation.recruiter_id == conversation.recruiter_id,
        Conversation.job_id == conversation.job_id,
        Conversation.status == ConversationStatus.ACTIVE
    ).first()
    
    if existing:
        # Add message to existing conversation
        new_message = Message(
            conversation_id=existing.id,
            sender_id=current_user.id,
            content=conversation.initial_message
        )
        db.add(new_message)
        existing.last_message_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new conversation
    new_conversation = Conversation(
        candidate_id=current_user.id,
        recruiter_id=conversation.recruiter_id,
        job_id=conversation.job_id,
        application_id=conversation.application_id,
        subject=conversation.subject
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    
    # Add initial message
    initial_message = Message(
        conversation_id=new_conversation.id,
        sender_id=current_user.id,
        content=conversation.initial_message
    )
    db.add(initial_message)
    db.commit()
    
    return new_conversation


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages for a conversation"""
    # Verify user has access to this conversation
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        (Conversation.candidate_id == current_user.id) | 
        (Conversation.recruiter_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Get messages
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()
    
    # Mark messages as read
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).update({"is_read": True, "read_at": datetime.utcnow()})
    db.commit()
    
    return messages[::-1]  # Reverse to show oldest first


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in a conversation"""
    # Verify user has access to this conversation
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        (Conversation.candidate_id == current_user.id) | 
        (Conversation.recruiter_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    # Create message
    new_message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        content=message.content,
        message_type=message.message_type,
        file_url=message.file_url,
        file_name=message.file_name,
        file_size=message.file_size
    )
    db.add(new_message)
    
    # Update conversation last_message_at
    conversation.last_message_at = datetime.utcnow()
    
    db.commit()
    db.refresh(new_message)
    
    return new_message


@router.patch("/conversations/{conversation_id}/status")
async def update_conversation_status(
    conversation_id: int,
    status: ConversationStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update conversation status"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        (Conversation.candidate_id == current_user.id) | 
        (Conversation.recruiter_id == current_user.id)
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    conversation.status = status
    db.commit()
    
    return {"message": "Conversation status updated", "status": status}


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total unread message count for current user"""
    # Get all conversations for user
    conversations = db.query(Conversation).filter(
        (Conversation.candidate_id == current_user.id) | 
        (Conversation.recruiter_id == current_user.id),
        Conversation.status == ConversationStatus.ACTIVE
    ).all()
    
    conversation_ids = [c.id for c in conversations]
    
    # Count unread messages
    unread_count = db.query(Message).filter(
        Message.conversation_id.in_(conversation_ids),
        Message.sender_id != current_user.id,
        Message.is_read == False
    ).count()
    
    return {"unread_count": unread_count}


from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from src.core.security import create_access_token, get_password_hash, verify_password
from src.db.session import get_db
from src.models.user import User, UserRole
from src.services.email_service import get_email_service, EmailService
from src.templates.email_templates import welcome_email_template
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models for request/response
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "candidate"  # candidate, employer, recruiter

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    email_service: EmailService = Depends(get_email_service)
):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=UserRole(user_data.role.upper()),
        hashed_password=hashed_password,
        auth_provider="email"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_data.email, "role": user_data.role}
    )
    
    # Send welcome email
    try:
        html = welcome_email_template(new_user.full_name)
        await email_service.send_email(
            to=new_user.email,
            subject="Welcome to HotGigs.ai!",
            html=html
        )
        logger.info(f"Sent welcome email to {new_user.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
        # Don't fail registration if email fails
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role.value.lower()
        }
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    # Check if user exists
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value.lower()}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value.lower()
        }
    }

@router.post("/social-login/{provider}")
async def social_login(provider: str, token: str, db: Session = Depends(get_db)):
    """Handle social authentication (Google, LinkedIn, Microsoft)"""
    # This is a placeholder - actual implementation would verify the token with the provider
    # For demo purposes, we'll create a mock user
    
    mock_email = f"user@{provider}.com"
    
    # Check if user exists
    user = db.query(User).filter(User.email == mock_email).first()
    
    if not user:
        # Create new user for social login
        user = User(
            email=mock_email,
            full_name=f"{provider.capitalize()} User",
            role=UserRole.CANDIDATE,
            auth_provider=provider,
            hashed_password=None  # No password for OAuth users
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value.lower()}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value.lower()
        }
    }


from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from core.security import create_access_token, get_password_hash, verify_password
from datetime import timedelta

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

# Temporary in-memory storage (will be replaced with database)
users_db = {}

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    if user_data.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Store user
    users_db[user_data.email] = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "hashed_password": hashed_password
    }
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user_data.email, "role": user_data.role}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user_data.email,
            "full_name": user_data.full_name,
            "role": user_data.role
        }
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user"""
    # Check if user exists
    user = users_db.get(credentials.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }

@router.post("/social-login/{provider}")
async def social_login(provider: str, token: str):
    """Handle social authentication (Google, LinkedIn, Microsoft)"""
    # This is a placeholder - actual implementation would verify the token with the provider
    # For demo purposes, we'll create a mock user
    
    mock_user = {
        "email": f"user@{provider}.com",
        "full_name": f"{provider.capitalize()} User",
        "role": "candidate"
    }
    
    # Create access token
    access_token = create_access_token(
        data={"sub": mock_user["email"], "role": mock_user["role"]}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": mock_user
    }


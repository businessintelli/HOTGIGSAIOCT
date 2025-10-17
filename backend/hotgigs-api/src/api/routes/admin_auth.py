"""
Admin Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext

from src.database import get_db
from src.models.admin import AdminUser, AuditLog
from src.core.config import settings

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class AdminLogin(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict

class AdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    is_super_admin: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

# ============================================================================
# Helper Functions
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> AdminUser:
    """Get the current authenticated admin user"""
    token = credentials.credentials
    payload = decode_token(token)
    
    admin_id = payload.get("admin_id")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found or inactive"
        )
    
    return admin

async def require_super_admin(
    admin: AdminUser = Depends(get_current_admin)
) -> AdminUser:
    """Require super admin privileges"""
    if not admin.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin privileges required"
        )
    return admin

# ============================================================================
# Authentication Endpoints
# ============================================================================

@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """Admin login endpoint"""
    # Find admin user
    admin = db.query(AdminUser).filter(
        AdminUser.username == login_data.username
    ).first()
    
    if not admin or not verify_password(login_data.password, admin.hashed_password):
        # Log failed login attempt
        audit_log = AuditLog(
            action="login_failed",
            resource_type="admin_user",
            description=f"Failed login attempt for username: {login_data.username}",
            status="failed"
        )
        db.add(audit_log)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive"
        )
    
    # Update last login
    admin.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(
        data={"admin_id": admin.id, "username": admin.username}
    )
    
    # Log successful login
    audit_log = AuditLog(
        admin_user_id=admin.id,
        action="login",
        resource_type="admin_user",
        resource_id=str(admin.id),
        description=f"Admin logged in: {admin.username}",
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "full_name": admin.full_name,
            "role": admin.role,
            "is_super_admin": admin.is_super_admin
        }
    }

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(admin: AdminUser = Depends(get_current_admin)):
    """Get current admin user information"""
    return admin

@router.post("/logout")
async def admin_logout(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin logout endpoint"""
    # Log logout
    audit_log = AuditLog(
        admin_user_id=admin.id,
        action="logout",
        resource_type="admin_user",
        resource_id=str(admin.id),
        description=f"Admin logged out: {admin.username}",
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Logged out successfully"}

# ============================================================================
# Admin User Management (Super Admin Only)
# ============================================================================

@router.post("/create-admin", response_model=AdminResponse)
async def create_admin(
    admin_data: AdminCreate,
    current_admin: AdminUser = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Create a new admin user (super admin only)"""
    # Check if username or email already exists
    existing = db.query(AdminUser).filter(
        (AdminUser.username == admin_data.username) |
        (AdminUser.email == admin_data.email)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    # Create new admin
    hashed_password = get_password_hash(admin_data.password)
    new_admin = AdminUser(
        username=admin_data.username,
        email=admin_data.email,
        hashed_password=hashed_password,
        full_name=admin_data.full_name
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    
    # Log action
    audit_log = AuditLog(
        admin_user_id=current_admin.id,
        action="create",
        resource_type="admin_user",
        resource_id=str(new_admin.id),
        description=f"Created new admin user: {new_admin.username}",
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return new_admin

@router.get("/admins", response_model=list[AdminResponse])
async def get_all_admins(
    current_admin: AdminUser = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Get all admin users (super admin only)"""
    admins = db.query(AdminUser).all()
    return admins

@router.delete("/admins/{admin_id}")
async def delete_admin(
    admin_id: int,
    current_admin: AdminUser = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """Deactivate an admin user (super admin only)"""
    if admin_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    admin.is_active = False
    db.commit()
    
    # Log action
    audit_log = AuditLog(
        admin_user_id=current_admin.id,
        action="deactivate",
        resource_type="admin_user",
        resource_id=str(admin.id),
        description=f"Deactivated admin user: {admin.username}",
        status="success"
    )
    db.add(audit_log)
    db.commit()
    
    return {"message": "Admin user deactivated successfully"}


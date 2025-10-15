from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

from db.session import get_db
from models.job import Company, CompanyTeamMember
from models.user import User
from core.security import get_current_user

router = APIRouter()

# Pydantic models for request/response
class CompanyCreate(BaseModel):
    name: str
    description: str
    industry: str
    company_size: str
    website: str | None = None
    logo_url: str | None = None
    location: str | None = None

class CompanyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    industry: str | None = None
    company_size: str | None = None
    website: str | None = None
    logo_url: str | None = None
    location: str | None = None

class CompanyResponse(BaseModel):
    id: str
    name: str
    description: str
    industry: str
    company_size: str
    website: str | None
    logo_url: str | None
    location: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True

class TeamMemberCreate(BaseModel):
    user_email: EmailStr
    role: str  # admin, recruiter, hiring_manager

class TeamMemberResponse(BaseModel):
    id: str
    user_id: str
    company_id: str
    role: str
    permissions: dict | None
    created_at: datetime
    
    class Config:
        from_attributes = True

@router.post("/", response_model=CompanyResponse, status_code=201)
async def create_company(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new company profile"""
    # Check if user is employer
    if current_user.role != "employer":
        raise HTTPException(status_code=403, detail="Only employers can create companies")
    
    # Create company
    company = Company(
        id=uuid.uuid4(),
        name=company_data.name,
        description=company_data.description,
        industry=company_data.industry,
        company_size=company_data.company_size,
        website=company_data.website,
        logo_url=company_data.logo_url,
        location=company_data.location
    )
    
    db.add(company)
    
    # Add creator as admin
    team_member = CompanyTeamMember(
        id=uuid.uuid4(),
        user_id=current_user.id,
        company_id=company.id,
        role="admin",
        permissions={"all": True}
    )
    
    db.add(team_member)
    db.commit()
    db.refresh(company)
    
    return company

@router.get("/", response_model=List[CompanyResponse])
async def get_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all companies"""
    companies = db.query(Company).offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific company by ID"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return company

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: str,
    company_data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update company profile"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user is admin of this company
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id,
        CompanyTeamMember.role == "admin"
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=403, detail="Only company admins can update company profile")
    
    # Update fields
    update_data = company_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return company

@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a company"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user is admin of this company
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id,
        CompanyTeamMember.role == "admin"
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=403, detail="Only company admins can delete company")
    
    db.delete(company)
    db.commit()
    
    return None

# Team Management Endpoints

@router.post("/{company_id}/team", response_model=TeamMemberResponse, status_code=201)
async def add_team_member(
    company_id: str,
    member_data: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a team member to the company"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if current user is admin
    admin_check = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id,
        CompanyTeamMember.role == "admin"
    ).first()
    
    if not admin_check:
        raise HTTPException(status_code=403, detail="Only company admins can add team members")
    
    # Find user by email
    user = db.query(User).filter(User.email == member_data.user_email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a team member")
    
    # Create team member
    team_member = CompanyTeamMember(
        id=uuid.uuid4(),
        user_id=user.id,
        company_id=company.id,
        role=member_data.role,
        permissions={}
    )
    
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    
    return team_member

@router.get("/{company_id}/team", response_model=List[TeamMemberResponse])
async def get_team_members(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all team members of a company"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if user is part of this company
    member_check = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id
    ).first()
    
    if not member_check:
        raise HTTPException(status_code=403, detail="You are not authorized to view this company's team")
    
    team_members = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id
    ).all()
    
    return team_members

@router.delete("/{company_id}/team/{member_id}", status_code=204)
async def remove_team_member(
    company_id: str,
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a team member from the company"""
    company = db.query(Company).filter(Company.id == uuid.UUID(company_id)).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Check if current user is admin
    admin_check = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.company_id == company.id,
        CompanyTeamMember.user_id == current_user.id,
        CompanyTeamMember.role == "admin"
    ).first()
    
    if not admin_check:
        raise HTTPException(status_code=403, detail="Only company admins can remove team members")
    
    # Find team member
    team_member = db.query(CompanyTeamMember).filter(
        CompanyTeamMember.id == uuid.UUID(member_id),
        CompanyTeamMember.company_id == company.id
    ).first()
    
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    
    db.delete(team_member)
    db.commit()
    
    return None


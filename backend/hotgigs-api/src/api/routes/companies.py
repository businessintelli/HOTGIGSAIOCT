from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Pydantic models
class CompanyCreate(BaseModel):
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None

class CompanyResponse(BaseModel):
    id: str
    name: str
    website: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    active_jobs: int = 0

# Mock data
mock_companies = [
    {
        "id": "1",
        "name": "Google",
        "website": "https://google.com",
        "description": "Technology company",
        "industry": "Technology",
        "size": "10000+",
        "location": "Mountain View, CA",
        "active_jobs": 150
    },
    {
        "id": "2",
        "name": "Microsoft",
        "website": "https://microsoft.com",
        "description": "Software company",
        "industry": "Technology",
        "size": "10000+",
        "location": "Redmond, WA",
        "active_jobs": 200
    }
]

@router.get("/", response_model=List[CompanyResponse])
async def get_companies():
    """Get all companies"""
    return mock_companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(company_id: str):
    """Get a specific company by ID"""
    company = next((c for c in mock_companies if c["id"] == company_id), None)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    return company

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(company_data: CompanyCreate):
    """Create a new company profile"""
    new_company = {
        "id": str(len(mock_companies) + 1),
        **company_data.dict(),
        "active_jobs": 0
    }
    mock_companies.append(new_company)
    return new_company


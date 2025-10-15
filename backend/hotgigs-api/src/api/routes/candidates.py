from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional

router = APIRouter()

# Pydantic models
class CandidateProfile(BaseModel):
    email: EmailStr
    full_name: str
    title: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[int] = None
    resume_url: Optional[str] = None

class CandidateResponse(BaseModel):
    id: str
    email: str
    full_name: str
    title: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    experience_years: Optional[int] = None
    match_score: Optional[int] = None

# Mock data
mock_candidates = [
    {
        "id": "1",
        "email": "john.doe@example.com",
        "full_name": "John Doe",
        "title": "Senior Software Engineer",
        "location": "San Francisco, CA",
        "skills": ["Python", "JavaScript", "React", "FastAPI"],
        "experience_years": 8,
        "match_score": 97
    },
    {
        "id": "2",
        "email": "jane.smith@example.com",
        "full_name": "Jane Smith",
        "title": "Product Manager",
        "location": "Seattle, WA",
        "skills": ["Product Management", "Agile", "Data Analysis"],
        "experience_years": 5,
        "match_score": 92
    }
]

@router.get("/", response_model=List[CandidateResponse])
async def get_candidates():
    """Get all candidates"""
    return mock_candidates

@router.get("/{candidate_id}", response_model=CandidateResponse)
async def get_candidate(candidate_id: str):
    """Get a specific candidate by ID"""
    candidate = next((c for c in mock_candidates if c["id"] == candidate_id), None)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    return candidate

@router.post("/", response_model=CandidateResponse, status_code=status.HTTP_201_CREATED)
async def create_candidate_profile(profile: CandidateProfile):
    """Create or update candidate profile"""
    new_candidate = {
        "id": str(len(mock_candidates) + 1),
        **profile.dict(),
        "match_score": None
    }
    mock_candidates.append(new_candidate)
    return new_candidate


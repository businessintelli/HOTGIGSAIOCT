from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# Pydantic models
class JobCreate(BaseModel):
    title: str
    company_id: str
    description: str
    location: str
    work_model: str  # remote, hybrid, on-site
    employment_type: str  # full-time, part-time, contract
    experience_level: str  # entry, mid, senior
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    skills: List[str] = []

class JobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_model: str
    employment_type: str
    experience_level: str
    salary_range: Optional[str] = None
    posted: str
    match_score: Optional[int] = None
    status: str = "active"

# Mock data
mock_jobs = [
    {
        "id": "1",
        "title": "Senior Software Engineer",
        "company": "Google",
        "location": "Mountain View, CA",
        "work_model": "Hybrid",
        "employment_type": "Full-time",
        "experience_level": "Senior",
        "salary_range": "$150k - $200k",
        "posted": "2 hours ago",
        "match_score": 97,
        "status": "active"
    },
    {
        "id": "2",
        "title": "Product Manager",
        "company": "Microsoft",
        "location": "Seattle, WA",
        "work_model": "Remote",
        "employment_type": "Full-time",
        "experience_level": "Mid",
        "salary_range": "$130k - $180k",
        "posted": "5 hours ago",
        "match_score": 92,
        "status": "active"
    },
    {
        "id": "3",
        "title": "Data Scientist",
        "company": "Amazon",
        "location": "San Francisco, CA",
        "work_model": "On-site",
        "employment_type": "Full-time",
        "experience_level": "Mid",
        "salary_range": "$140k - $190k",
        "posted": "1 day ago",
        "match_score": 88,
        "status": "active"
    }
]

@router.get("/", response_model=List[JobResponse])
async def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    location: Optional[str] = None,
    work_model: Optional[str] = None,
    employment_type: Optional[str] = None
):
    """Get all jobs with optional filtering"""
    filtered_jobs = mock_jobs
    
    if location:
        filtered_jobs = [j for j in filtered_jobs if location.lower() in j["location"].lower()]
    if work_model:
        filtered_jobs = [j for j in filtered_jobs if j["work_model"].lower() == work_model.lower()]
    if employment_type:
        filtered_jobs = [j for j in filtered_jobs if j["employment_type"].lower() == employment_type.lower()]
    
    return filtered_jobs[skip:skip + limit]

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    """Get a specific job by ID"""
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    return job

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job_data: JobCreate):
    """Create a new job posting"""
    new_job = {
        "id": str(len(mock_jobs) + 1),
        "title": job_data.title,
        "company": "Your Company",  # Would come from authenticated user
        "location": job_data.location,
        "work_model": job_data.work_model,
        "employment_type": job_data.employment_type,
        "experience_level": job_data.experience_level,
        "salary_range": f"${job_data.salary_min}k - ${job_data.salary_max}k" if job_data.salary_min else None,
        "posted": "Just now",
        "match_score": None,
        "status": "active"
    }
    mock_jobs.append(new_job)
    return new_job

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: str):
    """Delete a job posting"""
    global mock_jobs
    job = next((j for j in mock_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    mock_jobs = [j for j in mock_jobs if j["id"] != job_id]
    return None


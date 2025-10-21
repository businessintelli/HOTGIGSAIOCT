"""
Celery Tasks for Candidate-Job Matching

This module contains tasks for matching candidates to jobs based on parsed resume data.
"""

import logging
from typing import List, Dict
from datetime import datetime
from celery import group
from src.core.celery_app import celery_app
from src.models.resume import CandidateMatch

logger = logging.getLogger(__name__)


@celery_app.task(name="src.tasks.matching_tasks.match_candidate_to_jobs")
def match_candidate_to_jobs(resume_id: int):
    """
    Match a candidate to all active jobs based on their resume.
    
    Args:
        resume_id: ID of the resume to match
    """
    logger.info(f"Starting job matching for resume_id={resume_id}")
    
    try:
        # Get candidate data from resume
        candidate_data = get_candidate_data_from_resume(resume_id)
        
        if not candidate_data:
            logger.warning(f"No candidate data found for resume_id={resume_id}")
            return
        
        # Get all active jobs
        active_jobs = get_active_jobs()
        
        logger.info(f"Matching candidate against {len(active_jobs)} active jobs")
        
        # Calculate match scores for each job
        matches = []
        for job in active_jobs:
            match_score = calculate_match_score(candidate_data, job)
            
            if match_score["overall_score"] >= 50:  # Minimum threshold
                matches.append({
                    "candidate_id": candidate_data["candidate_id"],
                    "job_id": job["id"],
                    "resume_id": resume_id,
                    "match_score": match_score["overall_score"],
                    "skill_match_score": match_score["skill_score"],
                    "experience_match_score": match_score["experience_score"],
                    "education_match_score": match_score["education_score"],
                    "location_match_score": match_score["location_score"],
                    "match_explanation": match_score["explanation"],
                    "matching_skills": match_score["matching_skills"],
                    "missing_skills": match_score["missing_skills"]
                })
        
        # Save matches to database
        save_candidate_matches(matches)
        
        logger.info(f"Created {len(matches)} matches for resume_id={resume_id}")
        
        return {
            "resume_id": resume_id,
            "total_matches": len(matches),
            "matches": matches[:10]  # Return top 10
        }
        
    except Exception as e:
        logger.error(f"Error matching candidate for resume_id={resume_id}: {str(e)}")
        raise


@celery_app.task(name="src.tasks.matching_tasks.match_job_to_candidates")
def match_job_to_candidates(job_id: int):
    """
    Match a job to all candidates in the database.
    
    Args:
        job_id: ID of the job to match
    """
    logger.info(f"Starting candidate matching for job_id={job_id}")
    
    try:
        # Get job details
        job_data = get_job_data(job_id)
        
        if not job_data:
            logger.warning(f"No job data found for job_id={job_id}")
            return
        
        # Get all candidates
        candidates = get_all_candidates()
        
        logger.info(f"Matching job against {len(candidates)} candidates")
        
        # Calculate match scores
        matches = []
        for candidate in candidates:
            match_score = calculate_match_score(candidate, job_data)
            
            if match_score["overall_score"] >= 50:
                matches.append({
                    "candidate_id": candidate["id"],
                    "job_id": job_id,
                    "resume_id": candidate.get("latest_resume_id"),
                    "match_score": match_score["overall_score"],
                    "skill_match_score": match_score["skill_score"],
                    "experience_match_score": match_score["experience_score"],
                    "education_match_score": match_score["education_score"],
                    "location_match_score": match_score["location_score"],
                    "match_explanation": match_score["explanation"],
                    "matching_skills": match_score["matching_skills"],
                    "missing_skills": match_score["missing_skills"]
                })
        
        # Save matches
        save_candidate_matches(matches)
        
        logger.info(f"Created {len(matches)} matches for job_id={job_id}")
        
        return {
            "job_id": job_id,
            "total_matches": len(matches),
            "top_candidates": sorted(matches, key=lambda x: x["match_score"], reverse=True)[:10]
        }
        
    except Exception as e:
        logger.error(f"Error matching job_id={job_id}: {str(e)}")
        raise


@celery_app.task(name="src.tasks.matching_tasks.refresh_all_matches")
def refresh_all_matches():
    """
    Refresh all candidate-job matches.
    Runs periodically via Celery Beat.
    """
    logger.info("Starting refresh of all candidate-job matches")
    
    try:
        # Get all active jobs
        active_jobs = get_active_jobs()
        
        # Create matching tasks for each job
        job_tasks = group(match_job_to_candidates.s(job["id"]) for job in active_jobs)
        result = job_tasks.apply_async()
        
        logger.info(f"Queued {len(active_jobs)} job matching tasks")
        
        return {
            "total_jobs": len(active_jobs),
            "task_group_id": result.id
        }
        
    except Exception as e:
        logger.error(f"Error refreshing matches: {str(e)}")
        raise


def calculate_match_score(candidate_data: Dict, job_data: Dict) -> Dict:
    """
    Calculate match score between candidate and job.
    
    Returns a dictionary with:
    - overall_score: 0-100
    - skill_score: 0-100
    - experience_score: 0-100
    - education_score: 0-100
    - location_score: 0-100
    - explanation: Text explanation
    - matching_skills: List of matching skills
    - missing_skills: List of required skills candidate doesn't have
    """
    # Weights for different factors
    WEIGHTS = {
        "skills": 0.50,
        "experience": 0.25,
        "education": 0.15,
        "location": 0.10
    }
    
    # Calculate skill match
    skill_score, matching_skills, missing_skills = calculate_skill_match(
        candidate_data.get("skills", []),
        job_data.get("required_skills", []),
        job_data.get("preferred_skills", [])
    )
    
    # Calculate experience match
    experience_score = calculate_experience_match(
        candidate_data.get("total_experience_years", 0),
        job_data.get("min_experience_years", 0),
        job_data.get("max_experience_years", 100)
    )
    
    # Calculate education match
    education_score = calculate_education_match(
        candidate_data.get("education", []),
        job_data.get("required_education", "")
    )
    
    # Calculate location match
    location_score = calculate_location_match(
        candidate_data.get("location", ""),
        job_data.get("location", ""),
        job_data.get("remote_ok", False)
    )
    
    # Calculate overall score
    overall_score = (
        skill_score * WEIGHTS["skills"] +
        experience_score * WEIGHTS["experience"] +
        education_score * WEIGHTS["education"] +
        location_score * WEIGHTS["location"]
    )
    
    # Generate explanation
    explanation = generate_match_explanation(
        overall_score, skill_score, experience_score, education_score, location_score,
        matching_skills, missing_skills
    )
    
    return {
        "overall_score": round(overall_score, 2),
        "skill_score": round(skill_score, 2),
        "experience_score": round(experience_score, 2),
        "education_score": round(education_score, 2),
        "location_score": round(location_score, 2),
        "explanation": explanation,
        "matching_skills": matching_skills,
        "missing_skills": missing_skills
    }


def calculate_skill_match(candidate_skills: List, required_skills: List, preferred_skills: List):
    """Calculate skill match score."""
    candidate_skill_names = [s.lower() if isinstance(s, str) else s.get("name", "").lower() for s in candidate_skills]
    required_skill_names = [s.lower() for s in required_skills]
    preferred_skill_names = [s.lower() for s in preferred_skills]
    
    # Find matching skills
    matching_required = [s for s in required_skill_names if s in candidate_skill_names]
    matching_preferred = [s for s in preferred_skill_names if s in candidate_skill_names]
    missing_required = [s for s in required_skill_names if s not in candidate_skill_names]
    
    # Calculate score
    if not required_skill_names:
        return 100.0, [], []
    
    required_match_pct = (len(matching_required) / len(required_skill_names)) * 100
    preferred_bonus = min(len(matching_preferred) * 5, 20)  # Up to 20% bonus
    
    score = min(required_match_pct + preferred_bonus, 100)
    
    return score, matching_required + matching_preferred, missing_required


def calculate_experience_match(candidate_years: float, min_years: float, max_years: float) -> float:
    """Calculate experience match score."""
    if candidate_years >= min_years and candidate_years <= max_years:
        return 100.0
    elif candidate_years < min_years:
        # Penalize for insufficient experience
        return max(0, 100 - ((min_years - candidate_years) * 10))
    else:
        # Slight penalty for overqualification
        return max(80, 100 - ((candidate_years - max_years) * 2))


def calculate_education_match(candidate_education: List, required_education: str) -> float:
    """Calculate education match score."""
    if not required_education:
        return 100.0
    
    education_levels = {
        "high school": 1,
        "associate": 2,
        "bachelor": 3,
        "master": 4,
        "phd": 5,
        "doctorate": 5
    }
    
    required_level = 0
    for level, value in education_levels.items():
        if level in required_education.lower():
            required_level = value
            break
    
    candidate_level = 0
    for edu in candidate_education:
        degree = edu.get("degree", "").lower() if isinstance(edu, dict) else str(edu).lower()
        for level, value in education_levels.items():
            if level in degree:
                candidate_level = max(candidate_level, value)
    
    if candidate_level >= required_level:
        return 100.0
    elif candidate_level == required_level - 1:
        return 75.0
    else:
        return 50.0


def calculate_location_match(candidate_location: str, job_location: str, remote_ok: bool) -> float:
    """Calculate location match score."""
    if remote_ok:
        return 100.0
    
    if not candidate_location or not job_location:
        return 50.0
    
    # Simple location matching (can be enhanced with geocoding)
    candidate_lower = candidate_location.lower()
    job_lower = job_location.lower()
    
    if candidate_lower == job_lower:
        return 100.0
    elif any(part in job_lower for part in candidate_lower.split(",")):
        return 75.0
    else:
        return 25.0


def generate_match_explanation(overall, skill, experience, education, location, matching, missing) -> str:
    """Generate human-readable match explanation."""
    explanation_parts = []
    
    if overall >= 80:
        explanation_parts.append("Excellent match!")
    elif overall >= 60:
        explanation_parts.append("Good match.")
    else:
        explanation_parts.append("Moderate match.")
    
    if matching:
        explanation_parts.append(f"Matching skills: {', '.join(matching[:5])}.")
    
    if missing:
        explanation_parts.append(f"Missing required skills: {', '.join(missing[:3])}.")
    
    if experience >= 90:
        explanation_parts.append("Experience level is ideal.")
    elif experience < 60:
        explanation_parts.append("May need more experience.")
    
    return " ".join(explanation_parts)


# Helper functions (to be implemented with actual database operations)

def get_candidate_data_from_resume(resume_id: int) -> Dict:
    """Get candidate data from resume."""
    # TODO: Implement database query
    return {}


def get_active_jobs() -> List[Dict]:
    """Get all active jobs."""
    # TODO: Implement database query
    return []


def get_job_data(job_id: int) -> Dict:
    """Get job data."""
    # TODO: Implement database query
    return {}


def get_all_candidates() -> List[Dict]:
    """Get all candidates."""
    # TODO: Implement database query
    return []


def save_candidate_matches(matches: List[Dict]):
    """Save candidate matches to database."""
    # TODO: Implement database insert
    logger.info(f"Saved {len(matches)} candidate matches")
    pass


"""
AI Job Matching Service
Implements intelligent candidate-job matching using skill-based scoring,
experience level matching, and location preferences.
"""

from typing import List, Dict, Any
from datetime import datetime
import math


class AIMatchingService:
    """Service for AI-powered job-candidate matching"""
    
    def __init__(self):
        self.skill_weights = {
            'exact_match': 1.0,
            'related_match': 0.7,
            'partial_match': 0.4
        }
        
        self.experience_levels = {
            'entry': 0,
            'mid': 1,
            'senior': 2,
            'lead': 3,
            'executive': 4
        }
    
    def calculate_match_score(
        self,
        candidate_profile: Dict[str, Any],
        job: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive match score between candidate and job
        
        Returns:
            Dict with match_score (0-100), breakdown, and recommendations
        """
        
        # Calculate individual component scores
        skill_score = self._calculate_skill_match(
            candidate_profile.get('skills', []),
            job.get('required_skills', []),
            job.get('preferred_skills', [])
        )
        
        experience_score = self._calculate_experience_match(
            candidate_profile.get('years_of_experience', 0),
            candidate_profile.get('experience_level', 'entry'),
            job.get('experience_level', 'mid')
        )
        
        location_score = self._calculate_location_match(
            candidate_profile.get('location', ''),
            candidate_profile.get('remote_preference', False),
            job.get('location', ''),
            job.get('work_model', 'on-site')
        )
        
        education_score = self._calculate_education_match(
            candidate_profile.get('education', []),
            job.get('requirements', [])
        )
        
        # Weighted combination
        weights = {
            'skills': 0.40,
            'experience': 0.30,
            'location': 0.15,
            'education': 0.15
        }
        
        overall_score = (
            skill_score * weights['skills'] +
            experience_score * weights['experience'] +
            location_score * weights['location'] +
            education_score * weights['education']
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            skill_score,
            experience_score,
            location_score,
            education_score,
            candidate_profile,
            job
        )
        
        return {
            'match_score': round(overall_score, 1),
            'breakdown': {
                'skills': round(skill_score, 1),
                'experience': round(experience_score, 1),
                'location': round(location_score, 1),
                'education': round(education_score, 1)
            },
            'recommendations': recommendations,
            'match_quality': self._get_match_quality(overall_score)
        }
    
    def _calculate_skill_match(
        self,
        candidate_skills: List[Dict],
        required_skills: List[str],
        preferred_skills: List[str]
    ) -> float:
        """Calculate skill match score (0-100)"""
        
        if not required_skills:
            return 100.0
        
        candidate_skill_names = [
            skill.get('name', '').lower() if isinstance(skill, dict) else skill.lower()
            for skill in candidate_skills
        ]
        
        required_lower = [s.lower() for s in required_skills]
        preferred_lower = [s.lower() for s in preferred_skills]
        
        # Calculate required skills match
        required_matches = sum(
            1 for skill in required_lower
            if skill in candidate_skill_names
        )
        
        required_score = (required_matches / len(required_skills)) * 100 if required_skills else 100
        
        # Calculate preferred skills match (bonus)
        preferred_matches = sum(
            1 for skill in preferred_lower
            if skill in candidate_skill_names
        )
        
        preferred_bonus = (preferred_matches / len(preferred_skills)) * 20 if preferred_skills else 0
        
        # Combine scores (required is base, preferred is bonus up to 20 points)
        total_score = min(required_score + preferred_bonus, 100)
        
        return total_score
    
    def _calculate_experience_match(
        self,
        candidate_years: int,
        candidate_level: str,
        required_level: str
    ) -> float:
        """Calculate experience match score (0-100)"""
        
        candidate_level_num = self.experience_levels.get(candidate_level.lower(), 0)
        required_level_num = self.experience_levels.get(required_level.lower(), 1)
        
        # Perfect match
        if candidate_level_num == required_level_num:
            return 100.0
        
        # Overqualified (slightly penalized)
        if candidate_level_num > required_level_num:
            diff = candidate_level_num - required_level_num
            return max(85 - (diff * 10), 60)
        
        # Underqualified (more heavily penalized)
        if candidate_level_num < required_level_num:
            diff = required_level_num - candidate_level_num
            return max(70 - (diff * 20), 30)
        
        return 70.0
    
    def _calculate_location_match(
        self,
        candidate_location: str,
        candidate_remote_pref: bool,
        job_location: str,
        job_work_model: str
    ) -> float:
        """Calculate location match score (0-100)"""
        
        # Remote jobs are always a match if candidate prefers remote
        if job_work_model.lower() == 'remote':
            return 100.0
        
        # Hybrid is flexible
        if job_work_model.lower() == 'hybrid':
            if candidate_remote_pref:
                return 90.0
            return 85.0
        
        # On-site requires location match
        if job_work_model.lower() == 'on-site':
            if self._locations_match(candidate_location, job_location):
                return 100.0
            elif candidate_remote_pref:
                return 40.0  # Mismatch if candidate wants remote
            else:
                return 60.0  # Willing to relocate possibly
        
        return 70.0
    
    def _calculate_education_match(
        self,
        candidate_education: List[Dict],
        job_requirements: List[str]
    ) -> float:
        """Calculate education match score (0-100)"""
        
        if not job_requirements:
            return 100.0
        
        # Check for degree requirements in job requirements
        education_keywords = ['degree', 'bachelor', 'master', 'phd', 'doctorate', 'bs', 'ms', 'mba']
        
        has_education_requirement = any(
            any(keyword in req.lower() for keyword in education_keywords)
            for req in job_requirements
        )
        
        if not has_education_requirement:
            return 100.0
        
        if not candidate_education:
            return 60.0  # No education info, moderate penalty
        
        # Check highest degree
        degree_levels = {
            'high school': 1,
            'associate': 2,
            'bachelor': 3,
            'master': 4,
            'phd': 5,
            'doctorate': 5
        }
        
        highest_degree = 0
        for edu in candidate_education:
            degree = edu.get('degree', '').lower()
            for level_name, level_value in degree_levels.items():
                if level_name in degree:
                    highest_degree = max(highest_degree, level_value)
        
        # Score based on degree level
        if highest_degree >= 3:  # Bachelor's or higher
            return 100.0
        elif highest_degree >= 2:  # Associate's
            return 80.0
        elif highest_degree >= 1:  # High school
            return 60.0
        
        return 70.0
    
    def _locations_match(self, loc1: str, loc2: str) -> bool:
        """Check if two locations are similar"""
        if not loc1 or not loc2:
            return False
        
        loc1_parts = loc1.lower().split(',')
        loc2_parts = loc2.lower().split(',')
        
        # Check if city or state matches
        for part1 in loc1_parts:
            for part2 in loc2_parts:
                if part1.strip() == part2.strip():
                    return True
        
        return False
    
    def _generate_recommendations(
        self,
        skill_score: float,
        experience_score: float,
        location_score: float,
        education_score: float,
        candidate_profile: Dict,
        job: Dict
    ) -> List[str]:
        """Generate personalized recommendations"""
        
        recommendations = []
        
        if skill_score < 70:
            missing_skills = set(job.get('required_skills', [])) - set(
                skill.get('name', '') if isinstance(skill, dict) else skill
                for skill in candidate_profile.get('skills', [])
            )
            if missing_skills:
                recommendations.append(
                    f"Consider developing skills in: {', '.join(list(missing_skills)[:3])}"
                )
        
        if experience_score < 70:
            recommendations.append(
                "This role may require more experience. Consider highlighting relevant projects or achievements."
            )
        
        if location_score < 70:
            if job.get('work_model') == 'on-site':
                recommendations.append(
                    "This is an on-site position. Be prepared to relocate or commute."
                )
        
        if education_score < 80:
            recommendations.append(
                "Consider highlighting relevant certifications or coursework to strengthen your application."
            )
        
        return recommendations
    
    def _get_match_quality(self, score: float) -> str:
        """Get match quality label"""
        if score >= 90:
            return "Excellent Match"
        elif score >= 80:
            return "Great Match"
        elif score >= 70:
            return "Good Match"
        elif score >= 60:
            return "Fair Match"
        else:
            return "Low Match"
    
    def rank_candidates_for_job(
        self,
        candidates: List[Dict],
        job: Dict
    ) -> List[Dict]:
        """
        Rank candidates for a job based on match scores
        
        Returns:
            List of candidates with match scores, sorted by score (descending)
        """
        
        ranked_candidates = []
        
        for candidate in candidates:
            match_result = self.calculate_match_score(candidate, job)
            
            ranked_candidates.append({
                **candidate,
                'match_score': match_result['match_score'],
                'match_breakdown': match_result['breakdown'],
                'match_quality': match_result['match_quality'],
                'recommendations': match_result['recommendations']
            })
        
        # Sort by match score (descending)
        ranked_candidates.sort(key=lambda x: x['match_score'], reverse=True)
        
        return ranked_candidates
    
    def rank_jobs_for_candidate(
        self,
        candidate_profile: Dict,
        jobs: List[Dict]
    ) -> List[Dict]:
        """
        Rank jobs for a candidate based on match scores
        
        Returns:
            List of jobs with match scores, sorted by score (descending)
        """
        
        ranked_jobs = []
        
        for job in jobs:
            match_result = self.calculate_match_score(candidate_profile, job)
            
            ranked_jobs.append({
                **job,
                'match_score': match_result['match_score'],
                'match_breakdown': match_result['breakdown'],
                'match_quality': match_result['match_quality'],
                'recommendations': match_result['recommendations']
            })
        
        # Sort by match score (descending)
        ranked_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return ranked_jobs


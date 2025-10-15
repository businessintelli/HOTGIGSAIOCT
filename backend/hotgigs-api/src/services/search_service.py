"""
Advanced Search Service
Handles job and candidate search with advanced filtering and saved searches
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from datetime import datetime
import uuid

from src.models.job import Job
from src.models.candidate import CandidateProfile, CandidateSkill
from src.models.saved_search import SavedSearch


class SearchService:
    """Service for advanced search functionality"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def search_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        work_model: Optional[List[str]] = None,
        employment_type: Optional[List[str]] = None,
        experience_level: Optional[List[str]] = None,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        skills: Optional[List[str]] = None,
        posted_within_days: Optional[int] = None,
        company_id: Optional[uuid.UUID] = None,
        is_remote: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Advanced job search with multiple filters
        
        Returns:
            Dict with jobs list, total count, and pagination info
        """
        
        # Base query
        query_obj = self.db.query(Job).filter(Job.is_active == True)
        
        # Text search (title, description, required_skills)
        if query:
            search_filter = or_(
                Job.title.ilike(f"%{query}%"),
                Job.description.ilike(f"%{query}%"),
                func.array_to_string(Job.required_skills, ',').ilike(f"%{query}%")
            )
            query_obj = query_obj.filter(search_filter)
        
        # Location filter
        if location:
            query_obj = query_obj.filter(Job.location.ilike(f"%{location}%"))
        
        # Work model filter
        if work_model:
            query_obj = query_obj.filter(Job.work_model.in_(work_model))
        
        # Employment type filter
        if employment_type:
            query_obj = query_obj.filter(Job.employment_type.in_(employment_type))
        
        # Experience level filter
        if experience_level:
            query_obj = query_obj.filter(Job.experience_level.in_(experience_level))
        
        # Salary range filter
        if salary_min is not None:
            query_obj = query_obj.filter(Job.salary_max >= salary_min)
        
        if salary_max is not None:
            query_obj = query_obj.filter(Job.salary_min <= salary_max)
        
        # Skills filter (job must have at least one of the specified skills)
        if skills:
            for skill in skills:
                query_obj = query_obj.filter(
                    or_(
                        func.array_to_string(Job.required_skills, ',').ilike(f"%{skill}%"),
                        func.array_to_string(Job.preferred_skills, ',').ilike(f"%{skill}%")
                    )
                )
        
        # Posted within days filter
        if posted_within_days:
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=posted_within_days)
            query_obj = query_obj.filter(Job.created_at >= cutoff_date)
        
        # Company filter
        if company_id:
            query_obj = query_obj.filter(Job.company_id == company_id)
        
        # Remote filter
        if is_remote is not None:
            if is_remote:
                query_obj = query_obj.filter(Job.work_model == 'remote')
            else:
                query_obj = query_obj.filter(Job.work_model != 'remote')
        
        # Get total count before pagination
        total_count = query_obj.count()
        
        # Sorting
        if sort_by == "created_at":
            order_col = Job.created_at
        elif sort_by == "salary":
            order_col = Job.salary_max
        elif sort_by == "title":
            order_col = Job.title
        else:
            order_col = Job.created_at
        
        if sort_order == "desc":
            query_obj = query_obj.order_by(order_col.desc())
        else:
            query_obj = query_obj.order_by(order_col.asc())
        
        # Pagination
        offset = (page - 1) * page_size
        jobs = query_obj.offset(offset).limit(page_size).all()
        
        return {
            'jobs': jobs,
            'total': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    
    def search_candidates(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        experience_level: Optional[List[str]] = None,
        years_of_experience_min: Optional[int] = None,
        years_of_experience_max: Optional[int] = None,
        skills: Optional[List[str]] = None,
        education_level: Optional[List[str]] = None,
        availability: Optional[str] = None,
        sort_by: str = "updated_at",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        Advanced candidate search with multiple filters
        
        Returns:
            Dict with candidates list, total count, and pagination info
        """
        
        # Base query
        query_obj = self.db.query(CandidateProfile).filter(
            CandidateProfile.is_active == True
        )
        
        # Text search (headline, bio, skills)
        if query:
            search_filter = or_(
                CandidateProfile.headline.ilike(f"%{query}%"),
                CandidateProfile.bio.ilike(f"%{query}%")
            )
            query_obj = query_obj.filter(search_filter)
        
        # Location filter
        if location:
            query_obj = query_obj.filter(CandidateProfile.location.ilike(f"%{location}%"))
        
        # Experience level filter
        if experience_level:
            query_obj = query_obj.filter(CandidateProfile.experience_level.in_(experience_level))
        
        # Years of experience filter
        if years_of_experience_min is not None:
            query_obj = query_obj.filter(CandidateProfile.years_of_experience >= years_of_experience_min)
        
        if years_of_experience_max is not None:
            query_obj = query_obj.filter(CandidateProfile.years_of_experience <= years_of_experience_max)
        
        # Skills filter
        if skills:
            # Join with CandidateSkill table
            query_obj = query_obj.join(CandidateSkill).filter(
                CandidateSkill.skill_name.in_(skills)
            )
        
        # Availability filter
        if availability:
            query_obj = query_obj.filter(CandidateProfile.availability == availability)
        
        # Get total count before pagination
        total_count = query_obj.count()
        
        # Sorting
        if sort_by == "updated_at":
            order_col = CandidateProfile.updated_at
        elif sort_by == "experience":
            order_col = CandidateProfile.years_of_experience
        elif sort_by == "headline":
            order_col = CandidateProfile.headline
        else:
            order_col = CandidateProfile.updated_at
        
        if sort_order == "desc":
            query_obj = query_obj.order_by(order_col.desc())
        else:
            query_obj = query_obj.order_by(order_col.asc())
        
        # Pagination
        offset = (page - 1) * page_size
        candidates = query_obj.offset(offset).limit(page_size).all()
        
        return {
            'candidates': candidates,
            'total': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        }
    
    # Saved Search Management
    
    def save_search(
        self,
        user_id: uuid.UUID,
        name: str,
        search_type: str,
        criteria: Dict[str, Any],
        is_alert_enabled: bool = False,
        alert_frequency: str = "daily"
    ) -> SavedSearch:
        """Save a search for later use"""
        
        saved_search = SavedSearch(
            user_id=user_id,
            name=name,
            search_type=search_type,
            criteria=criteria,
            is_alert_enabled=is_alert_enabled,
            alert_frequency=alert_frequency
        )
        
        self.db.add(saved_search)
        self.db.commit()
        self.db.refresh(saved_search)
        
        return saved_search
    
    def get_saved_searches(
        self,
        user_id: uuid.UUID,
        search_type: Optional[str] = None
    ) -> List[SavedSearch]:
        """Get user's saved searches"""
        
        query = self.db.query(SavedSearch).filter(
            SavedSearch.user_id == user_id,
            SavedSearch.is_active == True
        )
        
        if search_type:
            query = query.filter(SavedSearch.search_type == search_type)
        
        return query.order_by(SavedSearch.last_used.desc()).all()
    
    def update_saved_search(
        self,
        search_id: uuid.UUID,
        name: Optional[str] = None,
        criteria: Optional[Dict[str, Any]] = None,
        is_alert_enabled: Optional[bool] = None,
        alert_frequency: Optional[str] = None
    ) -> Optional[SavedSearch]:
        """Update a saved search"""
        
        saved_search = self.db.query(SavedSearch).filter(
            SavedSearch.id == search_id
        ).first()
        
        if not saved_search:
            return None
        
        if name is not None:
            saved_search.name = name
        if criteria is not None:
            saved_search.criteria = criteria
        if is_alert_enabled is not None:
            saved_search.is_alert_enabled = is_alert_enabled
        if alert_frequency is not None:
            saved_search.alert_frequency = alert_frequency
        
        saved_search.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(saved_search)
        
        return saved_search
    
    def delete_saved_search(self, search_id: uuid.UUID) -> bool:
        """Delete a saved search"""
        
        saved_search = self.db.query(SavedSearch).filter(
            SavedSearch.id == search_id
        ).first()
        
        if not saved_search:
            return False
        
        saved_search.is_active = False
        self.db.commit()
        
        return True
    
    def execute_saved_search(
        self,
        search_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """Execute a saved search"""
        
        saved_search = self.db.query(SavedSearch).filter(
            SavedSearch.id == search_id
        ).first()
        
        if not saved_search:
            return {'error': 'Saved search not found'}
        
        # Update last used
        saved_search.last_used = datetime.utcnow()
        self.db.commit()
        
        # Execute search based on type
        criteria = saved_search.criteria
        
        if saved_search.search_type == 'jobs':
            return self.search_jobs(
                query=criteria.get('query'),
                location=criteria.get('location'),
                work_model=criteria.get('work_model'),
                employment_type=criteria.get('employment_type'),
                experience_level=criteria.get('experience_level'),
                salary_min=criteria.get('salary_min'),
                salary_max=criteria.get('salary_max'),
                skills=criteria.get('skills'),
                posted_within_days=criteria.get('posted_within_days'),
                is_remote=criteria.get('is_remote'),
                sort_by=criteria.get('sort_by', 'created_at'),
                sort_order=criteria.get('sort_order', 'desc'),
                page=page,
                page_size=page_size
            )
        elif saved_search.search_type == 'candidates':
            return self.search_candidates(
                query=criteria.get('query'),
                location=criteria.get('location'),
                experience_level=criteria.get('experience_level'),
                years_of_experience_min=criteria.get('years_of_experience_min'),
                years_of_experience_max=criteria.get('years_of_experience_max'),
                skills=criteria.get('skills'),
                education_level=criteria.get('education_level'),
                availability=criteria.get('availability'),
                sort_by=criteria.get('sort_by', 'updated_at'),
                sort_order=criteria.get('sort_order', 'desc'),
                page=page,
                page_size=page_size
            )
        
        return {'error': 'Invalid search type'}


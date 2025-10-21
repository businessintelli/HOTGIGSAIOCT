# Multi-Level Candidate Database Design

## Overview

This document outlines the design for implementing a multi-level candidate database with privacy controls for HotGigs.ai. The system supports recruiter-isolated candidate pools, an admin master database, and controlled candidate sharing.

## Requirements

### 1. Privacy Model
- **Recruiter Candidate Database**: Each recruiter maintains an isolated candidate pool
- **Master Candidate Database**: Admin has aggregate view of ALL candidates across all recruiters
- **Privacy Rules**:
  - Job applications: Only owning recruiter + admin see candidate
  - Resume imports: Only importing recruiter + admin see candidate
  - Admin can manually share candidates between recruiters

### 2. Auto-Population
Candidates are automatically added to databases when:
- Resume imported (single/bulk/Google Drive)
- Applicant applies for job
- Admin performs bulk import

### 3. Key Features
- Recruiter-candidate mapping for privacy
- Candidate sharing functionality
- Activity tracking
- Search indexing for master database
- Performance optimization for bulk operations

## Database Schema Extensions

### 1. RecruiterCandidate (Mapping Table)
Maps candidates to recruiters with privacy controls.

```sql
CREATE TABLE recruiter_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    
    -- Source tracking
    source VARCHAR(50) NOT NULL,  -- 'application', 'resume_import', 'bulk_upload', 'google_drive', 'admin_share'
    source_reference_id UUID,  -- Reference to resume_id, application_id, etc.
    
    -- Privacy and access
    is_visible BOOLEAN DEFAULT TRUE,
    can_contact BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    notes TEXT,
    tags VARCHAR[] DEFAULT '{}',
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT NOW(),
    last_viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(recruiter_id, candidate_id)
);

CREATE INDEX idx_recruiter_candidates_recruiter ON recruiter_candidates(recruiter_id);
CREATE INDEX idx_recruiter_candidates_candidate ON recruiter_candidates(candidate_id);
CREATE INDEX idx_recruiter_candidates_source ON recruiter_candidates(source);
CREATE INDEX idx_recruiter_candidates_added_at ON recruiter_candidates(added_at DESC);
```

### 2. CandidateShare (Sharing Table)
Tracks admin-initiated candidate sharing between recruiters.

```sql
CREATE TABLE candidate_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Sharing relationships
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    from_recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Original owner (nullable for admin imports)
    to_recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Recipient
    shared_by_admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Admin who shared
    
    -- Sharing details
    share_reason TEXT,
    share_notes TEXT,
    
    -- Access control
    can_view_contact_info BOOLEAN DEFAULT TRUE,
    can_download_resume BOOLEAN DEFAULT TRUE,
    can_submit_to_jobs BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    accepted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(candidate_id, to_recruiter_id)
);

CREATE INDEX idx_candidate_shares_candidate ON candidate_shares(candidate_id);
CREATE INDEX idx_candidate_shares_from_recruiter ON candidate_shares(from_recruiter_id);
CREATE INDEX idx_candidate_shares_to_recruiter ON candidate_shares(to_recruiter_id);
CREATE INDEX idx_candidate_shares_admin ON candidate_shares(shared_by_admin_id);
CREATE INDEX idx_candidate_shares_active ON candidate_shares(is_active);
```

### 3. CandidateActivity (Activity Tracking)
Tracks all activities related to candidates for audit and analytics.

```sql
CREATE TABLE candidate_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Activity relationships
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- User who performed action
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,  -- 'resume_uploaded', 'profile_viewed', 'contacted', 'shared', 'applied_to_job', etc.
    activity_description TEXT,
    
    -- Context
    reference_type VARCHAR(50),  -- 'job', 'resume', 'application', etc.
    reference_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- No updates - activities are immutable
    CONSTRAINT no_updates CHECK (created_at IS NOT NULL)
);

CREATE INDEX idx_candidate_activities_candidate ON candidate_activities(candidate_id);
CREATE INDEX idx_candidate_activities_user ON candidate_activities(user_id);
CREATE INDEX idx_candidate_activities_type ON candidate_activities(activity_type);
CREATE INDEX idx_candidate_activities_created ON candidate_activities(created_at DESC);
CREATE INDEX idx_candidate_activities_reference ON candidate_activities(reference_type, reference_id);
```

### 4. CandidateSearchIndex (Search Optimization)
Materialized view for fast candidate searching in master database.

```sql
CREATE MATERIALIZED VIEW candidate_search_index AS
SELECT 
    cp.id as candidate_id,
    cp.user_id,
    u.email,
    u.full_name,
    cp.title,
    cp.phone,
    cp.location,
    cp.current_company,
    cp.current_position,
    cp.years_of_experience,
    cp.professional_summary,
    
    -- Aggregated skills
    ARRAY_AGG(DISTINCT cs.skill_name) FILTER (WHERE cs.skill_name IS NOT NULL) as skills,
    
    -- Aggregated companies
    ARRAY_AGG(DISTINCT we.company_name) FILTER (WHERE we.company_name IS NOT NULL) as companies,
    
    -- Aggregated job titles
    ARRAY_AGG(DISTINCT we.job_title) FILTER (WHERE we.job_title IS NOT NULL) as job_titles,
    
    -- Aggregated education
    ARRAY_AGG(DISTINCT e.institution_name) FILTER (WHERE e.institution_name IS NOT NULL) as institutions,
    ARRAY_AGG(DISTINCT e.degree) FILTER (WHERE e.degree IS NOT NULL) as degrees,
    
    -- Resume data
    rd.email as resume_email,
    rd.phone as resume_phone,
    rd.top_skills as resume_top_skills,
    rd.total_experience_years,
    
    -- Recruiters who have access
    ARRAY_AGG(DISTINCT rc.recruiter_id) FILTER (WHERE rc.recruiter_id IS NOT NULL) as recruiter_ids,
    
    -- Status
    cp.is_active,
    cp.looking_for_job,
    cp.updated_at,
    cp.created_at
    
FROM candidate_profiles cp
JOIN users u ON cp.user_id = u.id
LEFT JOIN candidate_skills cs ON cp.id = cs.candidate_id
LEFT JOIN work_experiences we ON cp.id = we.candidate_id
LEFT JOIN educations e ON cp.id = e.candidate_id
LEFT JOIN recruiter_candidates rc ON cp.id = rc.candidate_id AND rc.is_visible = TRUE
LEFT JOIN resumes r ON cp.user_id = r.candidate_id AND r.status = 'completed'
LEFT JOIN resume_data rd ON r.id = rd.resume_id

GROUP BY 
    cp.id, cp.user_id, u.email, u.full_name, cp.title, cp.phone, cp.location,
    cp.current_company, cp.current_position, cp.years_of_experience, 
    cp.professional_summary, cp.is_active, cp.looking_for_job, 
    cp.updated_at, cp.created_at, rd.email, rd.phone, rd.top_skills, rd.total_experience_years;

-- Create indexes on materialized view
CREATE INDEX idx_candidate_search_candidate_id ON candidate_search_index(candidate_id);
CREATE INDEX idx_candidate_search_full_name ON candidate_search_index USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_candidate_search_title ON candidate_search_index USING gin(to_tsvector('english', title));
CREATE INDEX idx_candidate_search_skills ON candidate_search_index USING gin(skills);
CREATE INDEX idx_candidate_search_companies ON candidate_search_index USING gin(companies);
CREATE INDEX idx_candidate_search_recruiter_ids ON candidate_search_index USING gin(recruiter_ids);
CREATE INDEX idx_candidate_search_updated ON candidate_search_index(updated_at DESC);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_candidate_search_index()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY candidate_search_index;
END;
$$ LANGUAGE plpgsql;
```

## Data Flow

### 1. Resume Import Flow
```
1. Recruiter uploads resume(s)
2. Resume record created with uploaded_by_id = recruiter_id
3. Background job processes resume
4. If candidate exists (match by email):
   - Update candidate profile with new data
   - Create/update recruiter_candidates mapping
   - Log activity
5. If candidate doesn't exist:
   - Create new candidate profile
   - Create recruiter_candidates mapping
   - Log activity
6. Trigger matching algorithm
7. Refresh search index
```

### 2. Job Application Flow
```
1. Candidate applies to job
2. Application record created
3. Get job's recruiter_id (job owner)
4. Create/update recruiter_candidates mapping
5. Log activity
6. Notify recruiter
7. Refresh search index
```

### 3. Admin Share Flow
```
1. Admin selects candidate(s) to share
2. Admin selects target recruiter(s)
3. For each candidate-recruiter pair:
   - Create candidate_shares record
   - Create recruiter_candidates mapping (if not exists)
   - Log activity
   - Notify recipient recruiter
4. Refresh search index
```

### 4. Admin Bulk Import Flow
```
1. Admin uploads bulk resumes
2. Create bulk_upload_batch record
3. For each resume:
   - Process resume
   - Create/update candidate profile
   - Create recruiter_candidates mapping for admin
   - Log activity
4. Admin can then share candidates to specific recruiters
5. Refresh search index
```

## Privacy Implementation

### Access Control Rules

#### Recruiter Access
```python
def get_recruiter_candidates(recruiter_id: UUID):
    """Get all candidates visible to a recruiter"""
    return db.query(CandidateProfile).join(
        RecruiterCandidate,
        RecruiterCandidate.candidate_id == CandidateProfile.id
    ).filter(
        RecruiterCandidate.recruiter_id == recruiter_id,
        RecruiterCandidate.is_visible == True
    ).all()
```

#### Admin Access
```python
def get_all_candidates_admin():
    """Get all candidates for admin master database"""
    return db.query(CandidateProfile).filter(
        CandidateProfile.is_active == True
    ).all()
```

#### Shared Candidate Access
```python
def get_shared_candidates(recruiter_id: UUID):
    """Get candidates shared with a recruiter"""
    return db.query(CandidateProfile).join(
        CandidateShare,
        CandidateShare.candidate_id == CandidateProfile.id
    ).filter(
        CandidateShare.to_recruiter_id == recruiter_id,
        CandidateShare.is_active == True
    ).all()
```

## Performance Considerations

### 1. Indexing Strategy
- Composite indexes on frequently queried columns
- GIN indexes for array and full-text search
- Partial indexes for filtered queries

### 2. Materialized View
- Refresh on schedule (e.g., every 5 minutes)
- Refresh after bulk operations
- Use CONCURRENTLY to avoid locking

### 3. Bulk Operations
- Batch inserts using bulk_insert_mappings
- Use COPY for large imports
- Process in background with Celery

### 4. Caching
- Cache recruiter candidate counts
- Cache frequently accessed candidate lists
- Use Redis for session data

## Security Considerations

### 1. Data Privacy
- Encrypt sensitive fields (SSN, passport)
- Mask contact info based on permissions
- Audit all access to candidate data

### 2. Access Control
- Row-level security for candidate data
- Role-based permissions (admin, recruiter, candidate)
- API authentication and authorization

### 3. GDPR Compliance
- Right to be forgotten (cascade deletes)
- Data export functionality
- Consent tracking for data sharing

## API Endpoints

### Recruiter Endpoints
- `GET /api/recruiter/candidates` - List recruiter's candidates
- `GET /api/recruiter/candidates/{id}` - Get candidate details
- `POST /api/recruiter/candidates/import` - Import resume(s)
- `PUT /api/recruiter/candidates/{id}` - Update candidate
- `DELETE /api/recruiter/candidates/{id}` - Remove from database

### Admin Endpoints
- `GET /api/admin/candidates` - List all candidates (master database)
- `GET /api/admin/candidates/{id}` - Get candidate details
- `POST /api/admin/candidates/bulk-import` - Bulk import resumes
- `POST /api/admin/candidates/share` - Share candidate(s) with recruiter(s)
- `GET /api/admin/candidates/shares` - List all shares
- `DELETE /api/admin/candidates/shares/{id}` - Revoke share

### Candidate Endpoints
- `GET /api/candidate/profile` - Get own profile
- `PUT /api/candidate/profile` - Update own profile
- `POST /api/candidate/resume` - Upload resume
- `GET /api/candidate/visibility` - See who has access to profile

## Migration Strategy

### Phase 1: Database Schema
1. Create new tables (recruiter_candidates, candidate_shares, candidate_activities)
2. Create materialized view
3. Create indexes

### Phase 2: Data Migration
1. Migrate existing candidates to recruiter_candidates
2. Map applications to recruiter_candidates
3. Create initial activity records

### Phase 3: Code Updates
1. Update models
2. Update API endpoints
3. Add privacy filters

### Phase 4: Frontend Updates
1. Update candidate list views
2. Add sharing interface
3. Add activity timeline

### Phase 5: Testing & Deployment
1. Test privacy rules
2. Test bulk operations
3. Performance testing
4. Deploy to production

## Next Steps

1. ✅ Complete design document
2. ⏭️ Implement database models
3. ⏭️ Create migration scripts
4. ⏭️ Implement API endpoints
5. ⏭️ Build frontend UI
6. ⏭️ Testing and optimization


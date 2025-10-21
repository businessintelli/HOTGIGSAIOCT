-- Migration: Create Multi-Level Candidate Database Tables
-- Description: Creates tables for recruiter-candidate mappings, candidate sharing,
--              activity tracking, and candidate organization features
-- Date: 2025-10-20

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. RECRUITER_CANDIDATES TABLE
-- ============================================================================
-- Maps candidates to recruiters with privacy controls
CREATE TABLE IF NOT EXISTS recruiter_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    
    -- Source tracking
    source VARCHAR(50) NOT NULL CHECK (source IN (
        'application', 'resume_import', 'bulk_upload', 
        'google_drive', 'admin_share', 'manual_add'
    )),
    source_reference_id UUID,
    
    -- Privacy and access control
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    can_contact BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadata
    notes TEXT,
    tags VARCHAR[] DEFAULT '{}',
    
    -- Timestamps
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_viewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(recruiter_id, candidate_id)
);

-- Indexes for recruiter_candidates
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_recruiter ON recruiter_candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_candidate ON recruiter_candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_source ON recruiter_candidates(source);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_added_at ON recruiter_candidates(added_at DESC);
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_visible ON recruiter_candidates(is_visible) WHERE is_visible = TRUE;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_recruiter_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recruiter_candidates_updated_at
    BEFORE UPDATE ON recruiter_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_candidates_updated_at();

-- ============================================================================
-- 2. CANDIDATE_SHARES TABLE
-- ============================================================================
-- Tracks admin-initiated candidate sharing between recruiters
CREATE TABLE IF NOT EXISTS candidate_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Sharing relationships
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    from_recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_by_admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Sharing details
    share_reason TEXT,
    share_notes TEXT,
    
    -- Access control
    can_view_contact_info BOOLEAN NOT NULL DEFAULT TRUE,
    can_download_resume BOOLEAN NOT NULL DEFAULT TRUE,
    can_submit_to_jobs BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    accepted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(candidate_id, to_recruiter_id)
);

-- Indexes for candidate_shares
CREATE INDEX IF NOT EXISTS idx_candidate_shares_candidate ON candidate_shares(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_shares_from_recruiter ON candidate_shares(from_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_shares_to_recruiter ON candidate_shares(to_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_shares_admin ON candidate_shares(shared_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_candidate_shares_active ON candidate_shares(is_active) WHERE is_active = TRUE;

-- Trigger for updated_at
CREATE TRIGGER trigger_candidate_shares_updated_at
    BEFORE UPDATE ON candidate_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_candidates_updated_at();

-- ============================================================================
-- 3. CANDIDATE_ACTIVITIES TABLE
-- ============================================================================
-- Tracks all activities related to candidates (immutable)
CREATE TABLE IF NOT EXISTS candidate_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Activity relationships
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'resume_uploaded', 'profile_viewed', 'profile_updated', 'contacted',
        'shared', 'applied_to_job', 'interview_scheduled', 'status_changed',
        'note_added', 'tag_added', 'tag_removed', 'resume_downloaded', 'email_sent'
    )),
    activity_description TEXT,
    
    -- Context
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp (immutable)
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for candidate_activities
CREATE INDEX IF NOT EXISTS idx_candidate_activities_candidate ON candidate_activities(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_activities_user ON candidate_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_activities_type ON candidate_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_candidate_activities_created ON candidate_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_activities_reference ON candidate_activities(reference_type, reference_id);

-- ============================================================================
-- 4. CANDIDATE_TAGS TABLE
-- ============================================================================
-- Predefined tags for candidate categorization
CREATE TABLE IF NOT EXISTS candidate_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tag details
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    
    -- Ownership
    created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for candidate_tags
CREATE INDEX IF NOT EXISTS idx_candidate_tags_name ON candidate_tags(name);
CREATE INDEX IF NOT EXISTS idx_candidate_tags_created_by ON candidate_tags(created_by_id);
CREATE INDEX IF NOT EXISTS idx_candidate_tags_global ON candidate_tags(is_global) WHERE is_global = TRUE;

-- Trigger for updated_at
CREATE TRIGGER trigger_candidate_tags_updated_at
    BEFORE UPDATE ON candidate_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_candidates_updated_at();

-- ============================================================================
-- 5. CANDIDATE_NOTES TABLE
-- ============================================================================
-- Notes about candidates
CREATE TABLE IF NOT EXISTS candidate_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Note content
    title VARCHAR(255),
    content TEXT NOT NULL,
    
    -- Metadata
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for candidate_notes
CREATE INDEX IF NOT EXISTS idx_candidate_notes_candidate ON candidate_notes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_recruiter ON candidate_notes(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_created ON candidate_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_important ON candidate_notes(is_important) WHERE is_important = TRUE;

-- Trigger for updated_at
CREATE TRIGGER trigger_candidate_notes_updated_at
    BEFORE UPDATE ON candidate_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_candidates_updated_at();

-- ============================================================================
-- 6. CANDIDATE_LISTS TABLE
-- ============================================================================
-- Custom candidate lists/folders for recruiters
CREATE TABLE IF NOT EXISTS candidate_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- List details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    icon VARCHAR(50),
    
    -- Ownership
    recruiter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Settings
    is_smart_list BOOLEAN NOT NULL DEFAULT FALSE,
    smart_criteria JSONB,
    
    -- Metadata
    candidate_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for candidate_lists
CREATE INDEX IF NOT EXISTS idx_candidate_lists_recruiter ON candidate_lists(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidate_lists_created ON candidate_lists(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER trigger_candidate_lists_updated_at
    BEFORE UPDATE ON candidate_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_recruiter_candidates_updated_at();

-- ============================================================================
-- 7. CANDIDATE_LIST_ITEMS TABLE
-- ============================================================================
-- Items in candidate lists
CREATE TABLE IF NOT EXISTS candidate_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relationships
    list_id UUID NOT NULL REFERENCES candidate_lists(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    
    -- Metadata
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    
    -- Timestamps
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(list_id, candidate_id)
);

-- Indexes for candidate_list_items
CREATE INDEX IF NOT EXISTS idx_candidate_list_items_list ON candidate_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_candidate_list_items_candidate ON candidate_list_items(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_list_items_position ON candidate_list_items(list_id, position);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to add candidate to recruiter database
CREATE OR REPLACE FUNCTION add_candidate_to_recruiter(
    p_recruiter_id UUID,
    p_candidate_id UUID,
    p_source VARCHAR(50),
    p_source_reference_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO recruiter_candidates (
        recruiter_id,
        candidate_id,
        source,
        source_reference_id
    ) VALUES (
        p_recruiter_id,
        p_candidate_id,
        p_source,
        p_source_reference_id
    )
    ON CONFLICT (recruiter_id, candidate_id) DO UPDATE
    SET 
        source_reference_id = COALESCE(EXCLUDED.source_reference_id, recruiter_candidates.source_reference_id),
        updated_at = NOW()
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log candidate activity
CREATE OR REPLACE FUNCTION log_candidate_activity(
    p_candidate_id UUID,
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_activity_description TEXT DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO candidate_activities (
        candidate_id,
        user_id,
        activity_type,
        activity_description,
        reference_type,
        reference_id,
        metadata
    ) VALUES (
        p_candidate_id,
        p_user_id,
        p_activity_type,
        p_activity_description,
        p_reference_type,
        p_reference_id,
        p_metadata
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to share candidate with recruiter
CREATE OR REPLACE FUNCTION share_candidate_with_recruiter(
    p_candidate_id UUID,
    p_from_recruiter_id UUID,
    p_to_recruiter_id UUID,
    p_shared_by_admin_id UUID,
    p_share_reason TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_share_id UUID;
BEGIN
    -- Create share record
    INSERT INTO candidate_shares (
        candidate_id,
        from_recruiter_id,
        to_recruiter_id,
        shared_by_admin_id,
        share_reason
    ) VALUES (
        p_candidate_id,
        p_from_recruiter_id,
        p_to_recruiter_id,
        p_shared_by_admin_id,
        p_share_reason
    )
    ON CONFLICT (candidate_id, to_recruiter_id) DO UPDATE
    SET 
        is_active = TRUE,
        share_reason = COALESCE(EXCLUDED.share_reason, candidate_shares.share_reason),
        updated_at = NOW()
    RETURNING id INTO v_share_id;
    
    -- Add candidate to recipient's database
    PERFORM add_candidate_to_recruiter(
        p_to_recruiter_id,
        p_candidate_id,
        'admin_share',
        v_share_id
    );
    
    -- Log activity
    PERFORM log_candidate_activity(
        p_candidate_id,
        p_shared_by_admin_id,
        'shared',
        'Candidate shared with recruiter',
        'share',
        v_share_id
    );
    
    RETURN v_share_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update candidate list count
CREATE OR REPLACE FUNCTION update_candidate_list_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE candidate_lists
        SET candidate_count = candidate_count + 1
        WHERE id = NEW.list_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE candidate_lists
        SET candidate_count = candidate_count - 1
        WHERE id = OLD.list_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_candidate_list_count
    AFTER INSERT OR DELETE ON candidate_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_candidate_list_count();

-- ============================================================================
-- 9. VIEWS
-- ============================================================================

-- View for recruiter candidate summary
CREATE OR REPLACE VIEW recruiter_candidate_summary AS
SELECT 
    rc.recruiter_id,
    COUNT(DISTINCT rc.candidate_id) as total_candidates,
    COUNT(DISTINCT CASE WHEN rc.source = 'application' THEN rc.candidate_id END) as from_applications,
    COUNT(DISTINCT CASE WHEN rc.source = 'resume_import' THEN rc.candidate_id END) as from_resume_import,
    COUNT(DISTINCT CASE WHEN rc.source = 'bulk_upload' THEN rc.candidate_id END) as from_bulk_upload,
    COUNT(DISTINCT CASE WHEN rc.source = 'google_drive' THEN rc.candidate_id END) as from_google_drive,
    COUNT(DISTINCT CASE WHEN rc.source = 'admin_share' THEN rc.candidate_id END) as from_admin_share,
    COUNT(DISTINCT CASE WHEN rc.last_viewed_at > NOW() - INTERVAL '7 days' THEN rc.candidate_id END) as viewed_last_7_days,
    MAX(rc.added_at) as last_candidate_added
FROM recruiter_candidates rc
WHERE rc.is_visible = TRUE
GROUP BY rc.recruiter_id;

-- View for candidate activity summary
CREATE OR REPLACE VIEW candidate_activity_summary AS
SELECT 
    ca.candidate_id,
    COUNT(*) as total_activities,
    COUNT(DISTINCT ca.user_id) as unique_users,
    MAX(ca.created_at) as last_activity_at,
    COUNT(CASE WHEN ca.activity_type = 'profile_viewed' THEN 1 END) as view_count,
    COUNT(CASE WHEN ca.activity_type = 'contacted' THEN 1 END) as contact_count,
    COUNT(CASE WHEN ca.activity_type = 'applied_to_job' THEN 1 END) as application_count
FROM candidate_activities ca
GROUP BY ca.candidate_id;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Multi-level candidate database tables created successfully';
END $$;


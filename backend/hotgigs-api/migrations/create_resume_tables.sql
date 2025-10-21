-- Resume Import System - Database Migration
-- Creates all tables for resume import, parsing, and matching

-- Create enum types
CREATE TYPE resume_status AS ENUM ('uploaded', 'processing', 'completed', 'failed', 'pending');
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE import_source AS ENUM ('candidate_upload', 'recruiter_upload', 'bulk_upload', 'google_drive', 'api_import');

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    uploaded_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    status resume_status NOT NULL DEFAULT 'uploaded',
    import_source import_source NOT NULL,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    processing_error TEXT,
    processing_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for resumes table
CREATE INDEX idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX idx_resumes_uploaded_by_id ON resumes(uploaded_by_id);
CREATE INDEX idx_resumes_status ON resumes(status);
CREATE INDEX idx_resumes_import_source ON resumes(import_source);
CREATE INDEX idx_resumes_created_at ON resumes(created_at);

-- Resume data table (parsed information)
CREATE TABLE IF NOT EXISTS resume_data (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER UNIQUE NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    summary TEXT,
    experience JSONB,
    education JSONB,
    skills JSONB,
    top_skills JSONB,
    certifications JSONB,
    languages JSONB,
    total_experience_years FLOAT,
    raw_text TEXT,
    ai_summary TEXT,
    key_strengths JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for resume_data table
CREATE INDEX idx_resume_data_resume_id ON resume_data(resume_id);
CREATE INDEX idx_resume_data_full_name ON resume_data(full_name);
CREATE INDEX idx_resume_data_email ON resume_data(email);
CREATE INDEX idx_resume_data_top_skills ON resume_data USING GIN (top_skills);
CREATE INDEX idx_resume_data_skills ON resume_data USING GIN (skills);

-- Processing jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER UNIQUE NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    celery_task_id VARCHAR(255) UNIQUE,
    status job_status NOT NULL DEFAULT 'queued',
    priority INTEGER DEFAULT 5,
    progress_percentage INTEGER DEFAULT 0,
    current_step VARCHAR(100),
    queued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for processing_jobs table
CREATE INDEX idx_processing_jobs_resume_id ON processing_jobs(resume_id);
CREATE INDEX idx_processing_jobs_celery_task_id ON processing_jobs(celery_task_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_processing_jobs_priority ON processing_jobs(priority);

-- Candidate matches table
CREATE TABLE IF NOT EXISTS candidate_matches (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id INTEGER REFERENCES resumes(id) ON DELETE SET NULL,
    match_score FLOAT NOT NULL,
    skill_match_score FLOAT,
    experience_match_score FLOAT,
    education_match_score FLOAT,
    location_match_score FLOAT,
    match_explanation TEXT,
    matching_skills JSONB,
    missing_skills JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    viewed_by_recruiter BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id, resume_id)
);

-- Indexes for candidate_matches table
CREATE INDEX idx_candidate_matches_candidate_id ON candidate_matches(candidate_id);
CREATE INDEX idx_candidate_matches_job_id ON candidate_matches(job_id);
CREATE INDEX idx_candidate_matches_resume_id ON candidate_matches(resume_id);
CREATE INDEX idx_candidate_matches_match_score ON candidate_matches(match_score);
CREATE INDEX idx_candidate_matches_is_active ON candidate_matches(is_active);

-- Google Drive syncs table
CREATE TABLE IF NOT EXISTS google_drive_syncs (
    id SERIAL PRIMARY KEY,
    recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id VARCHAR(255) NOT NULL,
    folder_name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    sync_frequency VARCHAR(50) DEFAULT 'daily',
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    total_files_synced INTEGER DEFAULT 0,
    total_files_processed INTEGER DEFAULT 0,
    total_files_failed INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for google_drive_syncs table
CREATE INDEX idx_google_drive_syncs_recruiter_id ON google_drive_syncs(recruiter_id);
CREATE INDEX idx_google_drive_syncs_is_active ON google_drive_syncs(is_active);
CREATE INDEX idx_google_drive_syncs_next_sync_at ON google_drive_syncs(next_sync_at);

-- Bulk upload batches table
CREATE TABLE IF NOT EXISTS bulk_upload_batches (
    id SERIAL PRIMARY KEY,
    uploaded_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_name VARCHAR(255),
    total_files INTEGER NOT NULL,
    processed_files INTEGER DEFAULT 0,
    successful_files INTEGER DEFAULT 0,
    failed_files INTEGER DEFAULT 0,
    status job_status NOT NULL DEFAULT 'queued',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for bulk_upload_batches table
CREATE INDEX idx_bulk_upload_batches_uploaded_by_id ON bulk_upload_batches(uploaded_by_id);
CREATE INDEX idx_bulk_upload_batches_status ON bulk_upload_batches(status);
CREATE INDEX idx_bulk_upload_batches_created_at ON bulk_upload_batches(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_data_updated_at BEFORE UPDATE ON resume_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_matches_updated_at BEFORE UPDATE ON candidate_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_drive_syncs_updated_at BEFORE UPDATE ON google_drive_syncs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_upload_batches_updated_at BEFORE UPDATE ON bulk_upload_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE resumes IS 'Stores resume file metadata and processing status';
COMMENT ON TABLE resume_data IS 'Stores parsed and structured resume data extracted by AI';
COMMENT ON TABLE processing_jobs IS 'Tracks background processing jobs for resume parsing';
COMMENT ON TABLE candidate_matches IS 'Stores candidate-to-job matching results based on resume data';
COMMENT ON TABLE google_drive_syncs IS 'Configuration for Google Drive folder synchronization';
COMMENT ON TABLE bulk_upload_batches IS 'Tracks bulk resume upload operations';


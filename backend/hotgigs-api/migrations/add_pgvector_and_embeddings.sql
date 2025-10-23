-- Migration: Add pgvector extension and resume embeddings table
-- Purpose: Enable vector similarity search for resume matching and continuous learning
-- Date: 2025-10-22

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create resume_embeddings table
CREATE TABLE IF NOT EXISTS resume_embeddings (
    id SERIAL PRIMARY KEY,
    resume_id VARCHAR(255) NOT NULL UNIQUE,
    candidate_id VARCHAR(255),
    embedding vector(1536),  -- OpenAI ada-002 embedding dimension
    resume_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT fk_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE
);

-- Create index for vector similarity search (using HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS resume_embeddings_vector_idx 
ON resume_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Create index for resume_id lookups
CREATE INDEX IF NOT EXISTS resume_embeddings_resume_id_idx 
ON resume_embeddings(resume_id);

-- Create index for candidate_id lookups
CREATE INDEX IF NOT EXISTS resume_embeddings_candidate_id_idx 
ON resume_embeddings(candidate_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER resume_embeddings_updated_at_trigger
BEFORE UPDATE ON resume_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_resume_embeddings_updated_at();

-- Create function for cosine similarity search
CREATE OR REPLACE FUNCTION find_similar_resumes(
    query_embedding vector(1536),
    similarity_threshold FLOAT DEFAULT 0.7,
    max_results INT DEFAULT 10
)
RETURNS TABLE (
    resume_id VARCHAR(255),
    candidate_id VARCHAR(255),
    similarity_score FLOAT,
    resume_text TEXT,
    metadata JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        re.resume_id,
        re.candidate_id,
        1 - (re.embedding <=> query_embedding) AS similarity_score,
        re.resume_text,
        re.metadata
    FROM resume_embeddings re
    WHERE 1 - (re.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY re.embedding <=> query_embedding
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Create feedback_data table for continuous learning
CREATE TABLE IF NOT EXISTS feedback_data (
    id SERIAL PRIMARY KEY,
    feedback_id VARCHAR(255) NOT NULL UNIQUE,
    resume_id VARCHAR(255) NOT NULL,
    candidate_id VARCHAR(255),
    recruiter_id VARCHAR(255) NOT NULL,
    original_data JSONB NOT NULL,
    corrected_data JSONB NOT NULL,
    corrections JSONB NOT NULL,
    accuracy_score INT NOT NULL,
    comments TEXT,
    is_high_quality BOOLEAN DEFAULT FALSE,
    used_for_training BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT fk_feedback_resume FOREIGN KEY (resume_id) REFERENCES resumes(resume_id) ON DELETE CASCADE
);

-- Create indexes for feedback_data
CREATE INDEX IF NOT EXISTS feedback_data_resume_id_idx ON feedback_data(resume_id);
CREATE INDEX IF NOT EXISTS feedback_data_recruiter_id_idx ON feedback_data(recruiter_id);
CREATE INDEX IF NOT EXISTS feedback_data_accuracy_score_idx ON feedback_data(accuracy_score);
CREATE INDEX IF NOT EXISTS feedback_data_is_high_quality_idx ON feedback_data(is_high_quality);
CREATE INDEX IF NOT EXISTS feedback_data_created_at_idx ON feedback_data(created_at DESC);

-- Create view for training-ready feedback
CREATE OR REPLACE VIEW training_ready_feedback AS
SELECT 
    f.*,
    re.embedding,
    re.resume_text
FROM feedback_data f
JOIN resume_embeddings re ON f.resume_id = re.resume_id
WHERE f.is_high_quality = TRUE
  AND f.accuracy_score >= 90
ORDER BY f.created_at DESC;

-- Create function to get feedback statistics
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
    total_feedback BIGINT,
    avg_accuracy NUMERIC,
    high_quality_count BIGINT,
    ready_for_training BOOLEAN,
    field_accuracy JSONB
) AS $$
DECLARE
    total_count BIGINT;
    avg_acc NUMERIC;
    hq_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO total_count FROM feedback_data;
    SELECT AVG(accuracy_score) INTO avg_acc FROM feedback_data;
    SELECT COUNT(*) INTO hq_count FROM feedback_data WHERE is_high_quality = TRUE;
    
    RETURN QUERY
    SELECT 
        total_count,
        ROUND(avg_acc, 2),
        hq_count,
        (hq_count >= 100) AS ready_for_training,
        '{}'::JSONB AS field_accuracy;
END;
$$ LANGUAGE plpgsql;

-- Insert sample comment
COMMENT ON TABLE resume_embeddings IS 'Stores vector embeddings of resumes for similarity search and matching';
COMMENT ON TABLE feedback_data IS 'Stores recruiter feedback on resume parsing for continuous learning';
COMMENT ON FUNCTION find_similar_resumes IS 'Finds similar resumes based on cosine similarity of embeddings';
COMMENT ON FUNCTION get_feedback_stats IS 'Returns statistics about feedback data for continuous learning';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON resume_embeddings TO your_app_user;
-- GRANT SELECT, INSERT ON feedback_data TO your_app_user;


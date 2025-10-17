-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Recipient information
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    
    -- Email content
    subject VARCHAR(500) NOT NULL,
    template_name VARCHAR(100),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement tracking
    opened BOOLEAN DEFAULT FALSE,
    clicked BOOLEAN DEFAULT FALSE,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Bounce information
    bounce_type VARCHAR(50),
    bounce_reason TEXT,
    
    -- Additional metadata
    metadata JSONB,
    
    -- User agent for tracking
    user_agent TEXT
);

-- Create indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_email_id ON email_logs(email_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_name ON email_logs(template_name);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- Email Clicks Table
CREATE TABLE IF NOT EXISTS email_clicks (
    id SERIAL PRIMARY KEY,
    email_id VARCHAR(255) NOT NULL,
    
    -- Click information
    link TEXT NOT NULL,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- User information
    user_agent TEXT,
    ip_address VARCHAR(45)
);

-- Create indexes for email_clicks
CREATE INDEX IF NOT EXISTS idx_email_clicks_email_id ON email_clicks(email_id);
CREATE INDEX IF NOT EXISTS idx_email_clicks_clicked_at ON email_clicks(clicked_at);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    
    -- Template content
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Template metadata
    description TEXT,
    category VARCHAR(50),
    
    -- Version control
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Variables used in template
    variables JSONB
);

-- Create indexes for email_templates
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON email_templates(is_active);

-- Email Preferences Table
CREATE TABLE IF NOT EXISTS email_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Preference flags
    application_updates BOOLEAN DEFAULT TRUE,
    interview_notifications BOOLEAN DEFAULT TRUE,
    job_recommendations BOOLEAN DEFAULT TRUE,
    weekly_digest BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    recruiter_messages BOOLEAN DEFAULT TRUE,
    status_updates BOOLEAN DEFAULT TRUE,
    
    -- Unsubscribe tracking
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, email)
);

-- Create indexes for email_preferences
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);

-- Add foreign key constraints (if users table exists)
-- ALTER TABLE email_preferences ADD CONSTRAINT fk_email_preferences_user 
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comments for documentation
COMMENT ON TABLE email_logs IS 'Stores all sent email logs for tracking and analytics';
COMMENT ON TABLE email_clicks IS 'Tracks individual link clicks within emails';
COMMENT ON TABLE email_templates IS 'Stores email templates with version control';
COMMENT ON TABLE email_preferences IS 'Stores user email notification preferences';

COMMENT ON COLUMN email_logs.status IS 'Email status: pending, sent, delivered, opened, clicked, bounced, complained, failed';
COMMENT ON COLUMN email_logs.bounce_type IS 'Bounce type: hard, soft';
COMMENT ON COLUMN email_templates.category IS 'Template category: transactional, marketing, notification';


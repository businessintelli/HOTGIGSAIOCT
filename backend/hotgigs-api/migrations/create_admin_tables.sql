-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Admin details
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_super_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- App Config Table
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    
    -- Metadata
    category VARCHAR(50),
    value_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    
    -- Security
    is_secret BOOLEAN DEFAULT FALSE,
    is_editable BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INTEGER
);

-- Create indexes for app_config
CREATE INDEX IF NOT EXISTS idx_app_config_key ON app_config(key);
CREATE INDEX IF NOT EXISTS idx_app_config_category ON app_config(category);
CREATE INDEX IF NOT EXISTS idx_app_config_is_active ON app_config(is_active);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    service VARCHAR(100) NOT NULL,
    
    -- Key details
    key_value TEXT NOT NULL,
    key_prefix VARCHAR(20),
    
    -- Metadata
    description TEXT,
    environment VARCHAR(20) DEFAULT 'production',
    
    -- Usage tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(environment);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER,
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    
    -- Details
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Changes
    old_value JSONB,
    new_value JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- System Health Table
CREATE TABLE IF NOT EXISTS system_health (
    id SERIAL PRIMARY KEY,
    
    -- Service status
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'healthy',
    
    -- Metrics
    response_time INTEGER,
    error_rate INTEGER,
    uptime INTEGER,
    
    -- Details
    message TEXT,
    metadata JSONB,
    
    -- Timestamp
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for system_health
CREATE INDEX IF NOT EXISTS idx_system_health_service_name ON system_health(service_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_checked_at ON system_health(checked_at);

-- Add foreign key constraints
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_admin_user 
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL;

-- Comments for documentation
COMMENT ON TABLE admin_users IS 'Admin users with dashboard access';
COMMENT ON TABLE app_config IS 'Application configuration and environment variables';
COMMENT ON TABLE api_keys IS 'API keys for external services';
COMMENT ON TABLE audit_logs IS 'Audit trail of admin actions';
COMMENT ON TABLE system_health IS 'System health monitoring data';

COMMENT ON COLUMN admin_users.role IS 'Admin role: admin, super_admin';
COMMENT ON COLUMN app_config.value_type IS 'Value type: string, number, boolean, json, secret';
COMMENT ON COLUMN app_config.is_secret IS 'If true, value should be encrypted';
COMMENT ON COLUMN api_keys.environment IS 'Environment: production, staging, development';
COMMENT ON COLUMN audit_logs.status IS 'Action status: success, failed';
COMMENT ON COLUMN system_health.status IS 'Service status: healthy, degraded, down';

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, email, hashed_password, full_name, is_super_admin)
VALUES (
    'admin',
    'admin@hotgigs.ai',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS7eFa9jG',
    'System Administrator',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert default configuration values
INSERT INTO app_config (key, value, category, value_type, description, is_secret, is_editable) VALUES
    ('RESEND_FROM_EMAIL', 'noreply@hotgigs.com', 'email', 'string', 'Default sender email address', FALSE, TRUE),
    ('APP_NAME', 'HotGigs.ai', 'system', 'string', 'Application name', FALSE, TRUE),
    ('APP_VERSION', '1.0.0', 'system', 'string', 'Application version', FALSE, FALSE),
    ('MAINTENANCE_MODE', 'false', 'system', 'boolean', 'Enable/disable maintenance mode', FALSE, TRUE),
    ('MAX_UPLOAD_SIZE', '10485760', 'system', 'number', 'Maximum file upload size in bytes (10MB)', FALSE, TRUE),
    ('EMAIL_RATE_LIMIT', '100', 'email', 'number', 'Maximum emails per hour', FALSE, TRUE),
    ('SESSION_TIMEOUT', '3600', 'authentication', 'number', 'Session timeout in seconds', FALSE, TRUE)
ON CONFLICT (key) DO NOTHING;


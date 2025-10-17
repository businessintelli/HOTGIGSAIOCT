-- Add target_role column to email_templates table for role-based filtering
-- This allows templates to be shown to specific user roles (recruiter, candidate, both, admin)

ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS target_role VARCHAR(50);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_email_templates_target_role ON email_templates(target_role);

-- Update existing templates with default target_role based on template name/category
UPDATE email_templates 
SET target_role = CASE
    WHEN name LIKE '%Interview%' OR name LIKE '%Application%' THEN 'both'
    WHEN name LIKE '%Recruiter%' OR name LIKE '%New Application%' THEN 'recruiter'
    WHEN name LIKE '%Welcome%' OR name LIKE '%Password%' THEN 'both'
    WHEN name LIKE '%Job Alert%' OR name LIKE '%Weekly Digest%' THEN 'candidate'
    ELSE 'both'
END
WHERE target_role IS NULL;

-- Add comment to column
COMMENT ON COLUMN email_templates.target_role IS 'Target user role for template: recruiter, candidate, both, or admin';


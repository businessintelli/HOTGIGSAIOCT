# HotGigs.ai Database Architecture

**Last Updated:** October 22, 2025  
**Database:** PostgreSQL (Single Source of Truth)

---

## 📊 Database Overview

HotGigs.ai uses **PostgreSQL** as the **single, unified database** for all data storage needs.

### **Why PostgreSQL?**

✅ **Relational Data Model** - Perfect for structured data (users, jobs, applications)  
✅ **ACID Compliance** - Ensures data integrity and consistency  
✅ **JSON Support** - Can store semi-structured data when needed  
✅ **Full-Text Search** - Built-in search capabilities  
✅ **Scalability** - Handles millions of records efficiently  
✅ **Rich Ecosystem** - Excellent tooling and extensions  
✅ **Supabase Support** - Managed PostgreSQL with real-time features

---

## 🏗️ Database Hosting Options

### **Option 1: Supabase (Recommended for Production)**

**What is Supabase?**
- Managed PostgreSQL hosting
- Built-in authentication
- Real-time subscriptions
- Storage for files
- Auto-generated REST API
- Dashboard for management

**Configuration:**
```env
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Advantages:**
- ✅ Zero maintenance
- ✅ Automatic backups
- ✅ Built-in monitoring
- ✅ Global CDN
- ✅ Free tier available

### **Option 2: Docker PostgreSQL (Development)**

**What is Docker PostgreSQL?**
- Local PostgreSQL instance
- Runs in Docker container
- Full control over configuration
- No external dependencies

**Configuration:**
```env
DATABASE_URL=postgresql://hotgigs_user:password@localhost:5432/hotgigs_db
```

**Advantages:**
- ✅ Complete control
- ✅ No internet required
- ✅ Fast local development
- ✅ Easy to reset

---

## 📁 Database Schema

### **Core Tables**

#### **1. Users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL, -- 'candidate', 'recruiter', 'admin'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. Companies**
```sql
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    size VARCHAR(50),
    location VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **3. Jobs**
```sql
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id INTEGER REFERENCES companies(id),
    recruiter_id INTEGER REFERENCES users(id),
    location VARCHAR(255),
    job_type VARCHAR(50), -- 'full-time', 'part-time', 'contract'
    experience_level VARCHAR(50),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    skills JSONB, -- Array of skills
    requirements TEXT,
    benefits TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'closed', 'draft'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

#### **4. Candidates**
```sql
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    recruiter_id INTEGER REFERENCES users(id), -- Who added this candidate
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    title VARCHAR(255),
    summary TEXT,
    skills JSONB, -- Array of skills
    experience JSONB, -- Array of work experience
    education JSONB, -- Array of education
    certifications JSONB,
    languages JSONB,
    resume_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    source VARCHAR(50), -- 'application', 'resume_import', 'bulk_upload', 'google_drive', 'admin_share'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **5. Applications**
```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    candidate_id INTEGER REFERENCES candidates(id),
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'reviewing', 'interview', 'offer', 'rejected'
    cover_letter TEXT,
    resume_url VARCHAR(500),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Resume Import Tables**

#### **6. Resumes**
```sql
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    uploaded_by INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    parsed_data JSONB, -- Extracted resume data
    error_message TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

#### **7. Candidate Notes**
```sql
CREATE TABLE candidate_notes (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    created_by INTEGER REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **8. Candidate Tags**
```sql
CREATE TABLE candidate_tags (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    tag VARCHAR(100) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, tag)
);
```

#### **9. Candidate Activity Log**
```sql
CREATE TABLE candidate_activity (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'viewed', 'updated', 'note_added', 'tag_added', 'shared'
    description TEXT,
    activity_metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **10. Google Drive Syncs**
```sql
CREATE TABLE google_drive_syncs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    folder_id VARCHAR(255) NOT NULL,
    folder_name VARCHAR(255),
    sync_frequency VARCHAR(50) DEFAULT 'manual', -- 'manual', 'daily', 'weekly'
    last_sync_at TIMESTAMP,
    next_sync_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'error'
    error_message TEXT,
    files_synced INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **AI Matching Tables**

#### **11. Candidate Job Matches**
```sql
CREATE TABLE candidate_job_matches (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id),
    job_id INTEGER REFERENCES jobs(id),
    match_score DECIMAL(5,2), -- 0.00 to 100.00
    skills_match JSONB,
    experience_match JSONB,
    location_match BOOLEAN,
    salary_match BOOLEAN,
    ai_explanation TEXT,
    is_viewed BOOLEAN DEFAULT false,
    viewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
);
```

### **Admin Tables**

#### **12. Admin Users**
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin'
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **13. Audit Logs**
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    description TEXT,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **14. Error Logs**
```sql
CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(50) NOT NULL, -- 'critical', 'error', 'warning', 'info'
    category VARCHAR(100), -- 'database', 'email', 'file_upload', 'api', 'authentication'
    error_code VARCHAR(100),
    message TEXT NOT NULL,
    stack_trace TEXT,
    user_id INTEGER REFERENCES users(id),
    request_url VARCHAR(500),
    request_method VARCHAR(10),
    request_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **15. Email Logs**
```sql
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **16. Configuration**
```sql
CREATE TABLE configuration (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100), -- 'email', 'database', 'api_keys', 'features'
    type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'secret'
    is_secret BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔗 Relationships

### **User → Candidate (1:1)**
- One user can have one candidate profile
- Candidate profile stores job seeker information

### **User → Company (1:Many)**
- One recruiter can work for one company
- One company can have many recruiters

### **Company → Jobs (1:Many)**
- One company can post many jobs
- Each job belongs to one company

### **Job → Applications (1:Many)**
- One job can have many applications
- Each application is for one job

### **Candidate → Applications (1:Many)**
- One candidate can have many applications
- Each application is from one candidate

### **Candidate → Matches (1:Many)**
- One candidate can match with many jobs
- Each match is between one candidate and one job

### **User → Resumes (1:Many)**
- One recruiter can upload many resumes
- Each resume is uploaded by one recruiter

### **Resume → Candidate (1:1)**
- One resume creates one candidate profile
- Each candidate can have one resume

---

## 🔐 Data Isolation

### **Recruiter Isolation**
- Recruiters only see their own candidates
- Implemented via `recruiter_id` foreign key
- All queries filtered by `recruiter_id = current_user.id`

### **Admin Access**
- Admins see all candidates across all recruiters
- No `recruiter_id` filter applied
- Can share candidates between recruiters

### **Candidate Sharing**
- Admin can assign candidate to multiple recruiters
- Implemented via `candidate_shares` table (many-to-many)
- Permissions: 'read-only' or 'full-access'

---

## 📈 Indexing Strategy

### **Primary Indexes**
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Jobs
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Candidates
CREATE INDEX idx_candidates_recruiter ON candidates(recruiter_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_source ON candidates(source);

-- Applications
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Matches
CREATE INDEX idx_matches_candidate ON candidate_job_matches(candidate_id);
CREATE INDEX idx_matches_job ON candidate_job_matches(job_id);
CREATE INDEX idx_matches_score ON candidate_job_matches(match_score DESC);

-- Full-text search
CREATE INDEX idx_jobs_fulltext ON jobs USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_candidates_fulltext ON candidates USING gin(to_tsvector('english', full_name || ' ' || COALESCE(summary, '')));
```

---

## 🚀 Migration Strategy

### **Initial Setup**
```bash
# Run all migrations
python run_migrations.py

# Or use Alembic
alembic upgrade head
```

### **Adding New Tables**
```bash
# Create migration
alembic revision -m "Add new table"

# Edit migration file
# Add create_table() statements

# Run migration
alembic upgrade head
```

### **Rollback**
```bash
# Rollback last migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

---

## 📊 Data Volume Estimates

### **Small Deployment (< 1,000 users)**
- Users: 1,000
- Companies: 100
- Jobs: 500
- Candidates: 5,000
- Applications: 10,000
- **Database Size:** ~500 MB

### **Medium Deployment (1,000 - 10,000 users)**
- Users: 10,000
- Companies: 1,000
- Jobs: 5,000
- Candidates: 50,000
- Applications: 100,000
- **Database Size:** ~5 GB

### **Large Deployment (10,000+ users)**
- Users: 100,000+
- Companies: 10,000+
- Jobs: 50,000+
- Candidates: 500,000+
- Applications: 1,000,000+
- **Database Size:** ~50 GB+

---

## 🔧 Maintenance

### **Backup Strategy**
- **Supabase:** Automatic daily backups
- **Docker:** Manual backups using `pg_dump`

```bash
# Backup
pg_dump -U hotgigs_user -d hotgigs_db > backup.sql

# Restore
psql -U hotgigs_user -d hotgigs_db < backup.sql
```

### **Performance Monitoring**
- Monitor slow queries
- Check index usage
- Analyze query plans
- Monitor connection pool

### **Cleanup Tasks**
- Archive old applications (> 1 year)
- Delete failed resume uploads (> 30 days)
- Purge old error logs (> 90 days)
- Clean up unused candidates

---

## ✅ Summary

**Database:** PostgreSQL (Single Source of Truth)  
**Hosting:** Supabase (Production) or Docker (Development)  
**Tables:** 16 core tables  
**Relationships:** Fully normalized relational model  
**Isolation:** Recruiter-level data isolation  
**Indexing:** Optimized for common queries  
**Backup:** Automatic (Supabase) or manual (Docker)

**No MongoDB, No Multiple Databases - Just PostgreSQL!** ✅

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0


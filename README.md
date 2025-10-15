# HotGigs.ai - AI-Powered Job Matching Platform

**Version:** 1.0.0  
**Status:** Phase 1 Complete  
**Last Updated:** October 15, 2025

---

## Overview

HotGigs.ai is an AI-powered recruitment marketplace that connects employers with job seekers through intelligent matching, resume optimization, and networking capabilities. The platform features a dual-portal architecture serving both candidates and employers, with sophisticated AI features that differentiate it from traditional job boards.

## Features

### For Job Seekers
- 🎯 **AI Job Match** - Get matched with jobs based on skills, not just titles
- 📄 **Resume AI** - Professional resume optimization in minutes
- 🤝 **Insider Connections** - Discover alumni and colleagues at target companies
- 🤖 **Orion AI Copilot** - 24/7 career guidance and support
- 📊 **Application Tracking** - Monitor your application progress
- 🔍 **Advanced Job Search** - Filter by location, work model, and more

### For Employers
- 📝 **Job Posting Management** - Create and manage job listings
- 👥 **Applicant Tracking System** - Track candidates through hiring pipeline
- 🎯 **AI-Powered Matching** - Get AI match scores for each candidate
- 📈 **Analytics Dashboard** - Track hiring metrics and performance
- 👔 **Team Management** - Add recruiters and managers to your account
- ⭐ **Candidate Review** - Quick screening with Yes/No/Maybe actions

## Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Language:** JavaScript (JSX)

### Backend
- **Framework:** FastAPI 0.115.0
- **Server:** Uvicorn with auto-reload
- **Authentication:** JWT (python-jose)
- **Password Hashing:** Passlib with bcrypt
- **Database ORM:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **Python:** 3.11

### Database
- **Primary:** PostgreSQL 14
- **Unstructured Data:** MongoDB (planned)
- **Caching:** Redis (planned)
- **Vector DB:** Pinecone/Weaviate (planned for AI matching)

### AI/ML (Planned)
- **LLM:** OpenAI GPT-4
- **NLP:** spaCy, NLTK
- **ML Framework:** TensorFlow/PyTorch

## Project Structure

```
hotgigs/
├── frontend/
│   └── hotgigs-frontend/
│       ├── src/
│       │   ├── pages/           # Application pages
│       │   ├── components/      # Reusable components
│       │   ├── hooks/           # Custom React hooks
│       │   ├── lib/             # Utility functions
│       │   └── assets/          # Static assets
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
└── backend/
    └── hotgigs-api/
        ├── src/
        │   ├── api/             # API routes
        │   ├── core/            # Core configuration
        │   ├── db/              # Database configuration
        │   ├── models/          # SQLAlchemy models
        │   ├── schemas/         # Pydantic schemas
        │   ├── services/        # Business logic
        │   └── main.py          # Application entry point
        ├── venv/
        ├── requirements.txt
        └── .env
```

## Getting Started

### Prerequisites
- Node.js 22.x
- Python 3.11
- PostgreSQL 14
- pnpm (for frontend)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd hotgigs
```

#### 2. Frontend Setup
```bash
cd frontend/hotgigs-frontend
pnpm install
pnpm dev --host
```

The frontend will be available at `http://localhost:5173`

#### 3. Backend Setup
```bash
cd backend/hotgigs-api
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

The backend API will be available at `http://localhost:8000`  
API Documentation: `http://localhost:8000/docs`

#### 4. Database Setup
```bash
# Start PostgreSQL
sudo service postgresql start

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE hotgigs_db;"
sudo -u postgres psql -c "CREATE USER hotgigs_user WITH PASSWORD 'hotgigs_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE hotgigs_db TO hotgigs_user;"
sudo -u postgres psql -c "ALTER DATABASE hotgigs_db OWNER TO hotgigs_user;"

# Initialize database tables
cd backend/hotgigs-api
source venv/bin/activate
python src/db/init_db.py
```

### Environment Variables

Create a `.env` file in `backend/hotgigs-api/`:

```env
APP_NAME=HotGigs.ai
DEBUG=True
DATABASE_URL=postgresql://hotgigs_user:hotgigs_password@localhost:5432/hotgigs_db
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=hotgigs
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production-min-32-chars-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
OPENAI_API_KEY=
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/social-login/{provider}` - Social authentication

### Jobs
- `GET /api/jobs/` - Get all jobs
- `GET /api/jobs/{job_id}` - Get job details
- `POST /api/jobs/` - Create job posting
- `DELETE /api/jobs/{job_id}` - Delete job

### Candidates
- `GET /api/candidates/` - Get all candidates
- `GET /api/candidates/{candidate_id}` - Get candidate profile
- `POST /api/candidates/` - Create/update candidate profile

### Companies
- `GET /api/companies/` - Get all companies
- `GET /api/companies/{company_id}` - Get company details
- `POST /api/companies/` - Create company profile

### Applications
- `GET /api/applications/` - Get all applications
- `GET /api/applications/{application_id}` - Get application details
- `POST /api/applications/` - Submit application
- `PATCH /api/applications/{application_id}/status` - Update application status

## Development Roadmap

### ✅ Phase 1: Foundation & Setup (Weeks 1-2) - COMPLETE
- [x] Frontend project setup with React/Vite
- [x] Backend project setup with FastAPI
- [x] PostgreSQL database configuration
- [x] Basic authentication system
- [x] Core UI pages and components

### 🚧 Phase 2: Core Functionality - Candidate Portal (Weeks 3-6) - NEXT
- [ ] Connect frontend to backend API
- [ ] Real authentication with database
- [ ] Candidate profile management
- [ ] Resume upload and parsing
- [ ] Job application workflow

### 📋 Phase 3: Core Functionality - Company Portal (Weeks 7-10)
- [ ] Company profile management
- [ ] Job posting creation
- [ ] ATS dashboard
- [ ] Candidate review interface
- [ ] Team management

### 🤖 Phase 4: AI Feature Integration (Weeks 11-14)
- [ ] Job-candidate matching engine
- [ ] Resume analysis and optimization
- [ ] OpenAI integration
- [ ] Vector database setup
- [ ] Matching algorithms

### 🚀 Phase 5: Advanced Features (Weeks 15-18)
- [ ] Orion AI Copilot chatbot
- [ ] Networking/insider connections
- [ ] Team collaboration
- [ ] Promoted job posts
- [ ] Analytics dashboard

### 🎯 Phase 6: Testing & Launch (Weeks 19-20)
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Official launch

## Contributing

This is a proprietary project. For contribution guidelines, please contact the development team.

## License

Copyright © 2025 HotGigs.ai. All rights reserved.

## Support

For support, please contact:
- Email: support@hotgigs.ai
- Documentation: https://docs.hotgigs.ai

## Acknowledgments

- Inspired by Jobright.ai
- Built with modern web technologies
- Powered by AI and machine learning

---

**Built with ❤️ by the HotGigs.ai Team**


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import auth, jobs, candidates, companies, applications, ai_matching, ai_services, messages, job_assessment, video_profiles, emails, interviews, webhooks, email_preferences, email_analytics, admin, admin_auth
from src.core.config import settings

app = FastAPI(
    title="HotGigs.ai API",
    description="AI-Powered Job Matching Platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])
app.include_router(applications.router, prefix="/api/applications", tags=["Applications"])
app.include_router(ai_matching.router, prefix="/api/ai-matching", tags=["AI Matching"])
app.include_router(ai_services.router, prefix="/api/ai", tags=["AI Services"])
app.include_router(messages.router, prefix="/api", tags=["Messages"])
app.include_router(job_assessment.router, prefix="/api/assessment", tags=["Job Assessment"])
app.include_router(video_profiles.router, prefix="/api/videos", tags=["Video Profiles"])
app.include_router(emails.router, prefix="/api/emails", tags=["Emails"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["Interviews"])
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])
app.include_router(email_preferences.router, prefix="/api/email-preferences", tags=["Email Preferences"])
app.include_router(email_analytics.router, prefix="/api/email-analytics", tags=["Email Analytics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(admin_auth.router, prefix="/api/admin/auth", tags=["Admin Auth"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to HotGigs.ai API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "HotGigs.ai API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


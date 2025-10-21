from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "HotGigs.ai"
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://3000-ieax82bblh1eijfgixov5-97ad08b4.manusvm.computer",
        "https://5173-ieax82bblh1eijfgixov5-97ad08b4.manusvm.computer"
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://hotgigs_user:hotgigs_password@localhost:5432/hotgigs_db"
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "hotgigs"
    REDIS_URL: str = "redis://localhost:6379"
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    MICROSOFT_CLIENT_ID: str = ""
    MICROSOFT_CLIENT_SECRET: str = ""
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Resend Email Service
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@hotgigs.com"
    
    # File Upload Configuration
    UPLOAD_DIR: str = "/tmp/hotgigs/uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB default
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()


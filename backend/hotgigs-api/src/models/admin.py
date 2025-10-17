"""
Admin Dashboard Models

Models for managing application configuration, environment variables, and admin access.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Enum
from sqlalchemy.sql import func
from src.db.base import Base
import enum

class ConfigCategory(str, enum.Enum):
    """Configuration categories"""
    EMAIL = "email"
    DATABASE = "database"
    AUTHENTICATION = "authentication"
    API_KEYS = "api_keys"
    FEATURES = "features"
    SYSTEM = "system"

class ConfigType(str, enum.Enum):
    """Configuration value types"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    JSON = "json"
    SECRET = "secret"

class AdminUser(Base):
    """
    Admin user model for dashboard access
    """
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Admin details
    full_name = Column(String(255))
    role = Column(String(50), default="admin")  # admin, super_admin
    
    # Status
    is_active = Column(Boolean, default=True)
    is_super_admin = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<AdminUser(id={self.id}, username={self.username}, role={self.role})>"


class AppConfig(Base):
    """
    Application configuration model for storing environment variables and settings
    """
    __tablename__ = "app_config"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text)
    
    # Metadata
    category = Column(String(50), index=True)  # email, database, api_keys, etc.
    value_type = Column(String(20), default="string")  # string, number, boolean, json, secret
    description = Column(Text)
    
    # Security
    is_secret = Column(Boolean, default=False)  # If true, value is encrypted
    is_editable = Column(Boolean, default=True)  # Can be edited via UI
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer)  # Admin user ID who last updated
    
    def __repr__(self):
        return f"<AppConfig(id={self.id}, key={self.key}, category={self.category})>"


class APIKey(Base):
    """
    API key management model
    """
    __tablename__ = "api_keys"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    service = Column(String(100), index=True, nullable=False)  # resend, openai, stripe, etc.
    
    # Key details
    key_value = Column(Text, nullable=False)  # Encrypted API key
    key_prefix = Column(String(20))  # First few characters for identification
    
    # Metadata
    description = Column(Text)
    environment = Column(String(20), default="production")  # production, staging, development
    
    # Usage tracking
    last_used_at = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer)  # Admin user ID
    
    def __repr__(self):
        return f"<APIKey(id={self.id}, service={self.service}, name={self.name})>"


class AuditLog(Base):
    """
    Audit log model for tracking admin actions
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, index=True)
    
    # Action details
    action = Column(String(100), index=True, nullable=False)  # create, update, delete, login, etc.
    resource_type = Column(String(100), index=True)  # config, api_key, email_template, etc.
    resource_id = Column(String(100))
    
    # Details
    description = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Changes
    old_value = Column(JSON)
    new_value = Column(JSON)
    
    # Status
    status = Column(String(20), default="success")  # success, failed
    error_message = Column(Text)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource_type={self.resource_type})>"


class SystemHealth(Base):
    """
    System health monitoring model
    """
    __tablename__ = "system_health"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Service status
    service_name = Column(String(100), index=True, nullable=False)
    status = Column(String(20), index=True, default="healthy")  # healthy, degraded, down
    
    # Metrics
    response_time = Column(Integer)  # milliseconds
    error_rate = Column(Integer)  # percentage
    uptime = Column(Integer)  # percentage
    
    # Details
    message = Column(Text)
    metadata = Column(JSON)
    
    # Timestamp
    checked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<SystemHealth(id={self.id}, service={self.service_name}, status={self.status})>"


"""
Admin API endpoints for dashboard operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from src.database import get_db
from src.models.admin import AppConfig, APIKey, AuditLog, AdminUser
from src.models.email_log import EmailLog, EmailTemplate

router = APIRouter()

# Pydantic models for request/response
class ConfigCreate(BaseModel):
    key: str
    value: str
    category: str
    value_type: str = "string"
    description: Optional[str] = None
    is_secret: bool = False

class ConfigUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class ConfigResponse(BaseModel):
    id: int
    key: str
    value: str
    category: str
    value_type: str
    description: Optional[str]
    is_secret: bool
    is_editable: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class APIKeyCreate(BaseModel):
    name: str
    service: str
    key_value: str
    description: Optional[str] = None
    environment: str = "production"

class APIKeyResponse(BaseModel):
    id: int
    name: str
    service: str
    key_prefix: str
    description: Optional[str]
    environment: str
    is_active: bool
    last_used_at: Optional[datetime]
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmailLogResponse(BaseModel):
    id: int
    email_id: str
    to_email: str
    from_email: str
    subject: str
    template_name: Optional[str]
    status: str
    created_at: datetime
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    opened_at: Optional[datetime]
    clicked_at: Optional[datetime]
    opened: bool
    clicked: bool

    class Config:
        from_attributes = True

class EmailTemplateCreate(BaseModel):
    name: str
    subject: str
    html_content: str
    text_content: Optional[str] = None
    description: Optional[str] = None
    category: str = "transactional"
    variables: Optional[dict] = None

class EmailTemplateUpdate(BaseModel):
    subject: Optional[str] = None
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class EmailTemplateResponse(BaseModel):
    id: int
    name: str
    subject: str
    description: Optional[str]
    category: str
    version: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============================================================================
# Configuration Endpoints
# ============================================================================

@router.get("/config", response_model=List[ConfigResponse])
async def get_all_config(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all configuration values"""
    query = db.query(AppConfig)
    
    if category:
        query = query.filter(AppConfig.category == category)
    
    configs = query.filter(AppConfig.is_active == True).all()
    
    # Mask secret values
    for config in configs:
        if config.is_secret and config.value:
            config.value = "********"
    
    return configs

@router.get("/config/{key}", response_model=ConfigResponse)
async def get_config(key: str, db: Session = Depends(get_db)):
    """Get a specific configuration value"""
    config = db.query(AppConfig).filter(AppConfig.key == key).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    # Mask secret value
    if config.is_secret and config.value:
        config.value = "********"
    
    return config

@router.post("/config", response_model=ConfigResponse)
async def create_config(config_data: ConfigCreate, db: Session = Depends(get_db)):
    """Create a new configuration"""
    # Check if key already exists
    existing = db.query(AppConfig).filter(AppConfig.key == config_data.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Configuration key already exists")
    
    config = AppConfig(**config_data.dict())
    db.add(config)
    db.commit()
    db.refresh(config)
    
    # Log action
    log_admin_action(db, "create", "config", str(config.id), f"Created config: {config.key}")
    
    return config

@router.put("/config/{key}", response_model=ConfigResponse)
async def update_config(
    key: str,
    config_data: ConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update a configuration value"""
    config = db.query(AppConfig).filter(AppConfig.key == key).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    if not config.is_editable:
        raise HTTPException(status_code=403, detail="This configuration is not editable")
    
    # Store old value for audit
    old_value = config.value
    
    # Update config
    config.value = config_data.value
    if config_data.description:
        config.description = config_data.description
    config.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(config)
    
    # Log action
    log_admin_action(
        db, "update", "config", str(config.id),
        f"Updated config: {config.key}",
        old_value={"value": old_value},
        new_value={"value": config.value}
    )
    
    return config

@router.delete("/config/{key}")
async def delete_config(key: str, db: Session = Depends(get_db)):
    """Delete a configuration (soft delete)"""
    config = db.query(AppConfig).filter(AppConfig.key == key).first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    if not config.is_editable:
        raise HTTPException(status_code=403, detail="This configuration cannot be deleted")
    
    config.is_active = False
    db.commit()
    
    # Log action
    log_admin_action(db, "delete", "config", str(config.id), f"Deleted config: {config.key}")
    
    return {"message": "Configuration deleted successfully"}

# ============================================================================
# API Key Endpoints
# ============================================================================

@router.get("/api-keys", response_model=List[APIKeyResponse])
async def get_all_api_keys(
    service: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all API keys"""
    query = db.query(APIKey)
    
    if service:
        query = query.filter(APIKey.service == service)
    
    api_keys = query.filter(APIKey.is_active == True).all()
    return api_keys

@router.post("/api-keys", response_model=APIKeyResponse)
async def create_api_key(api_key_data: APIKeyCreate, db: Session = Depends(get_db)):
    """Create a new API key"""
    # Extract key prefix (first 8 characters)
    key_prefix = api_key_data.key_value[:8] if len(api_key_data.key_value) >= 8 else api_key_data.key_value
    
    api_key = APIKey(
        name=api_key_data.name,
        service=api_key_data.service,
        key_value=api_key_data.key_value,  # TODO: Encrypt this
        key_prefix=key_prefix,
        description=api_key_data.description,
        environment=api_key_data.environment
    )
    
    db.add(api_key)
    db.commit()
    db.refresh(api_key)
    
    # Log action
    log_admin_action(db, "create", "api_key", str(api_key.id), f"Created API key: {api_key.name}")
    
    return api_key

@router.delete("/api-keys/{api_key_id}")
async def delete_api_key(api_key_id: int, db: Session = Depends(get_db)):
    """Delete an API key (soft delete)"""
    api_key = db.query(APIKey).filter(APIKey.id == api_key_id).first()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    api_key.is_active = False
    db.commit()
    
    # Log action
    log_admin_action(db, "delete", "api_key", str(api_key.id), f"Deleted API key: {api_key.name}")
    
    return {"message": "API key deleted successfully"}

# ============================================================================
# Email Log Endpoints
# ============================================================================

@router.get("/email-logs", response_model=List[EmailLogResponse])
async def get_email_logs(
    status: Optional[str] = None,
    template_name: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get email logs with filtering"""
    query = db.query(EmailLog)
    
    if status:
        query = query.filter(EmailLog.status == status)
    
    if template_name:
        query = query.filter(EmailLog.template_name == template_name)
    
    logs = query.order_by(EmailLog.created_at.desc()).offset(offset).limit(limit).all()
    return logs

@router.get("/email-logs/{email_id}", response_model=EmailLogResponse)
async def get_email_log(email_id: str, db: Session = Depends(get_db)):
    """Get a specific email log"""
    log = db.query(EmailLog).filter(EmailLog.email_id == email_id).first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Email log not found")
    
    return log

# ============================================================================
# Email Template Endpoints
# ============================================================================

@router.get("/email-templates", response_model=List[EmailTemplateResponse])
async def get_all_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all email templates"""
    query = db.query(EmailTemplate)
    
    if category:
        query = query.filter(EmailTemplate.category == category)
    
    templates = query.filter(EmailTemplate.is_active == True).all()
    return templates

@router.get("/email-templates/{template_id}")
async def get_template(template_id: int, db: Session = Depends(get_db)):
    """Get a specific email template with full content"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template

@router.post("/email-templates", response_model=EmailTemplateResponse)
async def create_template(template_data: EmailTemplateCreate, db: Session = Depends(get_db)):
    """Create a new email template"""
    # Check if template name already exists
    existing = db.query(EmailTemplate).filter(EmailTemplate.name == template_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Template name already exists")
    
    template = EmailTemplate(**template_data.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    
    # Log action
    log_admin_action(db, "create", "email_template", str(template.id), f"Created template: {template.name}")
    
    return template

@router.put("/email-templates/{template_id}", response_model=EmailTemplateResponse)
async def update_template(
    template_id: int,
    template_data: EmailTemplateUpdate,
    db: Session = Depends(get_db)
):
    """Update an email template"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Update fields
    update_data = template_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    # Increment version
    template.version += 1
    template.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(template)
    
    # Log action
    log_admin_action(db, "update", "email_template", str(template.id), f"Updated template: {template.name}")
    
    return template

@router.delete("/email-templates/{template_id}")
async def delete_template(template_id: int, db: Session = Depends(get_db)):
    """Delete an email template (soft delete)"""
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.is_active = False
    db.commit()
    
    # Log action
    log_admin_action(db, "delete", "email_template", str(template.id), f"Deleted template: {template.name}")
    
    return {"message": "Template deleted successfully"}

# ============================================================================
# Helper Functions
# ============================================================================

def log_admin_action(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str,
    description: str,
    old_value: dict = None,
    new_value: dict = None
):
    """Log admin action to audit log"""
    try:
        audit_log = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            old_value=old_value,
            new_value=new_value,
            status="success"
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Failed to log admin action: {str(e)}")




# ============================================================================
# Role-Based Template Filtering
# ============================================================================

@router.get("/email-templates/role/{role}", response_model=List[EmailTemplateResponse])
async def get_templates_by_role(
    role: str,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get email templates filtered by target role
    
    Args:
        role: User role (recruiter, candidate, admin)
        category: Optional category filter
    
    Returns:
        List of templates visible to the specified role
    """
    if role not in ['recruiter', 'candidate', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid role. Must be recruiter, candidate, or admin")
    
    query = db.query(EmailTemplate).filter(EmailTemplate.is_active == True)
    
    # Filter by role - show templates for specific role or 'both'
    if role == 'admin':
        # Admins can see all templates
        pass
    else:
        query = query.filter(
            (EmailTemplate.target_role == role) | 
            (EmailTemplate.target_role == 'both')
        )
    
    # Optional category filter
    if category:
        query = query.filter(EmailTemplate.category == category)
    
    templates = query.all()
    return templates


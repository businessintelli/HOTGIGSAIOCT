"""
Email Templates for HotGigs.ai

This module contains functions that generate HTML email templates
for various transactional emails sent by the platform.
"""

def application_received_template(candidate_name: str, job_title: str, company_name: str) -> str:
    """Email template for confirming a received application"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;}}
            .content {{ background: #f9f9f9; padding: 30px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;}}
            .button {{ background: #667eea; color: white !important; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Application Received!</h1>
            </div>
            <div class="content">
                <p>Hi {candidate_name},</p>
                <p>Thank you for applying to the <strong>{job_title}</strong> position at <strong>{company_name}</strong>.</p>
                <p>We've received your application and our team will review it shortly. You can track the status of your application on your dashboard.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://hotgigs.ai/dashboard" class="button">View Application Status</a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Best regards,<br>
                    The HotGigs.ai Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def interview_invitation_template(
    candidate_name: str, 
    job_title: str, 
    company_name: str,
    interview_date: str, 
    interview_time: str,
    interview_link: str
) -> str:
    """Email template for an interview invitation"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;}}
            .content {{ background: #f9f9f9; padding: 30px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;}}
            .info-box {{ background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }}
            .button {{ background: #667eea; color: white !important; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Interview Invitation</h1>
            </div>
            <div class="content">
                <p>Hi {candidate_name},</p>
                <p>Great news! After reviewing your application for the <strong>{job_title}</strong> position at <strong>{company_name}</strong>, we would like to invite you for an interview.</p>
                
                <div class="info-box">
                    <h3>Interview Details</h3>
                    <p><strong>Date:</strong> {interview_date}</p>
                    <p><strong>Time:</strong> {interview_time}</p>
                    <p><strong>Format:</strong> Video Interview</p>
                </div>
                
                <p style="text-align: center; margin-top: 30px;">
                    <a href="{interview_link}" class="button">Confirm and Join Interview</a>
                </p>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Please confirm your attendance by clicking the button above. If you have any questions, feel free to reply to this email.<br><br>
                    Best regards,<br>
                    The HotGigs.ai Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def new_application_notification_recruiter(
    recruiter_name: str,
    candidate_name: str,
    job_title: str,
    application_id: str
) -> str:
    """Email template to notify a recruiter of a new application"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;}}
            .content {{ background: #f9f9f9; padding: 30px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;}}
            .button {{ background: #667eea; color: white !important; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📬 New Application Received</h1>
            </div>
            <div class="content">
                <p>Hi {recruiter_name},</p>
                <p>You have a new application for the <strong>{job_title}</strong> position from <strong>{candidate_name}</strong>.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://hotgigs.ai/company/jobs/{application_id}/applications" class="button">Review Application</a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Best regards,<br>
                    The HotGigs.ai Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def password_reset_template(user_name: str, reset_link: str) -> str:
    """Email template for password reset requests"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;}}
            .content {{ background: #f9f9f9; padding: 30px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;}}
            .button {{ background: #667eea; color: white !important; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    If you did not request a password reset, please ignore this email.<br><br>
                    Best regards,<br>
                    The HotGigs.ai Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

def welcome_email_template(user_name: str) -> str:
    """Email template for new user welcome"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;}}
            .content {{ background: #f9f9f9; padding: 30px; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;}}
            .button {{ background: #667eea; color: white !important; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to HotGigs.ai!</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Welcome to the future of recruitment! We're excited to have you on board. You can now start exploring job opportunities or finding the perfect candidates for your company.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://hotgigs.ai/dashboard" class="button">Go to Your Dashboard</a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    Best regards,<br>
                    The HotGigs.ai Team
                </p>
            </div>
        </div>
    </body>
    </html>
    """

